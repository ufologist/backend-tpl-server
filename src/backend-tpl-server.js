var http = require('http');

var express = require('express');
var vm = require('express-velocity');
var puer = require('puer');
var Mock = require('mockjs');

/**
 * 获取所有的路由信息
 * 
 * http://stackoverflow.com/questions/14934452/how-to-get-all-registered-routes-in-express
 * 
 * XXX 对于 app.use('/birds', router) 这样路由注册方式还解析不了
 * 
 * @param {object} app express app
 * @return {array} 路由信息数组
 */
function getRoutes(app) {
    var routes = [];

    var layerRoutes = [];
    app._router.stack.forEach(function(layer) {
        if (layer.route) {
            layerRoutes.push(layer.route);
        }
    });
    layerRoutes.forEach(function(route) {
        for (var method in route.methods) {
            if (route.methods.hasOwnProperty(method)) {
                routes.push({
                    method: method,
                    path: route.path
                });
            }
        }
    });

    return routes;
}

// polyfill javascript 中没有的方法, 不然会造成模版中使用的方法不生效
// 例如: 在模版中使用 Java 字符串比对 #if($a.equals("abc")) hello #end
// 如果没有这个方法, 模版就会认为这个方法无效, 始终为 false
if (!String.prototype.equals) {
    String.prototype.equals = function(b) {
        if (this === b) {
            return true;
        } else {
            return false;
        }
    };
}

/**
 * 后端模版页面服务器
 * 
 * 用于渲染后端的模版页面, 例如后端 Java velocity 的模版页面
 * 
 * @param {string} webroot web 根目录, 可以是相对路径也可以是绝对路径.
 *                 例如: e:/website/website-pc/src/main/webapp,
 *                 一般都是 Java mvn web 项目的标准目录结构
 * @param {object} options {
 *     web: {
 *         static: webroot + '/resources', // 静态资源所在的目录
 *         views: webroot + '/views'       // 页面模版所在的目录
 *     },
 *     port: 8000 // 服务启动所在的端口
 * }
 */
function BackendTplServer(webroot, options) {
    var app = express();
    var server = http.createServer(app);

    this.webroot = webroot;
    this.options = Object.assign({
        web: {
            static: webroot + '/resources',
            views: webroot + '/views'
        },
        port: 8000
    }, options);

    this.app = app;
    this.server = server;

    this.initViewSetting();
    this.initLiveReload();
    this.serveStatic();
    this.registerGetRoutesApi();
}
/**
 * 初始化视图的配置
 * 
 * 即配置页面模版在哪里, 并使用什么模版引擎
 */
BackendTplServer.prototype.initViewSetting = function() {
    this.app.engine('.html', vm({
        root: this.webroot // duplicated with views setting but required for velocity template
    }));
    this.app.set('views', this.options.web.views);
};
/**
 * 监听文件变化来自动刷新浏览器
 * 
 * 目前碰到的问题
 * 1. 如果某个文件夹中名字带有 . 会造成监听不到文件夹中文件的修改
 *    这个问题可以通过去掉 puer/lib/connect-puer.js chokidar.watch 的 ignored 配置来避免
 * 2. 由于需要自动重启服务, 通过 nodemon 来重新启动, 不会自动刷新浏览器
 */
BackendTplServer.prototype.initLiveReload = function() {
    this.app.use(puer.connect(this.app, this.server, {
        dir: this.webroot
    }));
};
/**
 * 服务开发环境时会访问的本地的静态资源
 */
BackendTplServer.prototype.serveStatic = function() {
    // 在 Java Web 项目中是直接与后端项目一起发布的
    // 例如: website-pc\src\main\webapp\views 放的是后端页面模版
    //       website-pc\src\main\webapp\resources 放的是静态资源
    //
    // 开发环境是这样引用静态资源的
    // 例如: '/ys/1.0.0' + '/css/ys-css.css'
    // 正式环境是引用的 CDN 线上的静态资源
    // 例如: 'https://static.daojia.com/changsha/pc/ys/1.0.0' + '/css/ys-css.css'
    this.app.use(express.static(this.options.web.static));
};
/**
 * 启动后端模版服务器
 */
BackendTplServer.prototype.start = function() {
    this.server.listen(this.options.port, function() {
        console.log('---------------BackendTplServer--------------------------');
        console.log('project info:');
        console.log('  webroot: ' + this.webroot);
        console.log('  options: ' + JSON.stringify(this.options, null, 4));
        console.log('---------------routes------------------------------------');
        console.log('routes: ' + JSON.stringify(getRoutes(this.app), null, 4));
        console.log('---------------------------------------------------------');
        console.log('BackendTplServer listen on ' + this.options.port + ' port');
        console.log('open your browser: http://localhost:' + this.options.port);
        console.log('---------------------------------------------------------');
    }.bind(this));
};
/**
 * 快速定义一个模版页面路由并给他灌入所需的数据
 * 
 * 例如: url('a/b/c.html', {a: 1});
 * 定义之后访问的 URL 为: http://localhost:8000/a/b/c.html
 * 
 * 如果是想控制更多, 可以直接使用 app 来定义路由
 * 例如:
 * app.get('/a/:id', function(request, response) {
 *     response.render('a/b/c/d.html', {a: 1});
 * });
 * 
 * @param {string} tplFile 模版文件的路径, 以 options.web.views 所配置的位置为起点
 *                         例如: tplFile 为 a/b/c.html
 *                         那么最终对应的模版文件为 options.web.views + '/' + tplFile
 * @param {object} model 模版所需的数据, 会使用 Mock.js 来产生 mock 数据
 * @param {string} method 对应的 HTTP verbs, 默认为 get
 */
BackendTplServer.prototype.url = function(tplFile, model, method) {
    method = method ? method.toLowerCase() : 'get';

    var route = '/' + tplFile;

    this.app[method](route, function(request, response) {
        var mockData = Mock.mock(model);
        response.render(tplFile, mockData);
    });
};
/**
 * 对外提供路由配置信息的接口, 用于告知别人每个页面需要什么数据
 * 
 * | URL  | 模版文件  | 模版所需数据|
 * |------|----------|------------|
 * | /a/b | a/b.html | {a: 1}     |
 */
BackendTplServer.prototype.registerGetRoutesApi = function() {
    this.app.get('/_routes', function(request, response) {
        response.jsonp({
            routes: getRoutes(response.app)
        });
    });
};

module.exports = BackendTplServer;