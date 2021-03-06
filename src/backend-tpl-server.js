var http = require('http');
var path = require('path');
var fs = require('fs');

var merge = require('merge');

var express = require('express');
var vm = require('express-velocity');

var puer = require('puer');
// 由于 livereload 功能使用了 puer, 而 puer 又使用了 weinre,
// weinre/lib/utils.js 中定义了 Error.prepareStackTrace 方法去自定义出错时调用链的内容
// https://github.com/v8/v8/wiki/Stack-Trace-API#customizing-stack-traces
// 其中取出 func.displayName 时没有先判断 func 是否存在, 当 func 不存在时, 调用这个方法会造成整个进程挂掉.
//
// finalhandler\index.js:178
//     msg = err.stack
//              ^
// TypeError: Cannot read property 'displayName' of undefined
//
// 如果希望这个方法正常运作, 需要将如下代码
// funcName = func.displayName || func.name || callSite.getFunctionName();
// 修改为
// funcName = func ? func.displayName || func.name : callSite.getFunctionName();
//
// 不过一般我们不需要自定义出错时调用链的内容, 因此这里我们删除掉这个方法即可以避免上述问题
delete Error.prepareStackTrace;

var Mock = require('mockjs');

var pkg = require('../package.json');

var getRoutes = require('./get-routes.js');
var renderTpl = require('./render-tpl.js');
var mockHttpApi = require('mock-http-api');

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
 *     port: 8000,                         // 服务启动所在的端口
 *     tplFileExt: 'html'                  // 模版页面文件名的后缀
 * }
 */
function BackendTplServer(webroot, options) {
    var app = express();
    var server = http.createServer(app);

    this.webroot = webroot;
    this.options = merge.recursive({
        web: {
            static: webroot + '/resources',
            views: webroot + '/views'
        },
        port: 8000,
        tplFileExt: 'html'
    }, options);

    this.app = app;
    this.server = server;

    this.initViewSetting();
    this.initLiveReload();
    this.serveStatic();
    this.registerGetRoutesApi();
    this.registerRenderTplRoute();
    this.registerMockApiRoute();
}
/**
 * 初始化视图的配置
 * 
 * 即配置页面模版在哪里, 并使用什么模版引擎
 */
BackendTplServer.prototype.initViewSetting = function() {
    // 注册文件名后缀对应的模版引擎处理器
    // By default, Express will require() the engine based on the file extension
    // For example, if you try to render a "foo.pug" file, Express invokes the following internally
    // app.engine('pug', require('pug').__express);
    this.app.engine(this.options.tplFileExt, vm({
        root: this.webroot // duplicated with views setting but required for velocity template
    }));
    // 设置默认的模版引擎, 否则当 render 方法中指定没有后缀的模版页面时, 就会报错
    // No default engine was specified and no extension was provided
    this.app.set('view engine', this.options.tplFileExt);
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
    // 例如: '/user/1.0.0' + '/user.css'
    // 正式环境是引用的 CDN 线上的静态资源
    // 例如: 'https://yourcdn.com/changsha/pc/user/1.0.0' + '/user.css'
    this.app.use(express.static(this.options.web.static));
};
/**
 * 启动后端模版服务器
 */
BackendTplServer.prototype.start = function() {
    this.server.listen(this.options.port, function() {
        // 修改命令行的标题, 这样当同时启动了多个服务器时, 可以清楚的知道哪个是哪个
        process.title = path.resolve(this.webroot) + ' ' + this.options.port + ' v' + pkg.version;

        console.log('---------------BackendTplServer--------------------------');
        console.log('project info:');
        console.log('  webroot: ' + path.resolve(this.webroot));
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
 * @param {string} tplFilePath 模版文件的路径, 以 options.web.views 所配置的位置为起点
 *                             例如: tplFilePath 为 a/b/c.html
 *                             那么最终对应的模版文件为 options.web.views + '/' + tplFilePath
 * @param {object} model 模版所需的数据, 会使用 Mock.js 来产生 mock 数据
 * @param {string} method 对应的 HTTP verbs, 默认为 get
 */
BackendTplServer.prototype.url = function(tplFilePath, model, method) {
    method = method ? method.toLowerCase() : 'get';

    var route = '/' + tplFilePath;

    this.app[method](route, function(request, response) {
        var mockData = Mock.mock(model);
        response.render(tplFilePath, mockData);
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

/**
 * 专门用于渲染模版页面的路由
 * 
 * 例如: http://localhost:8000/_views/a/b/c.html 即渲染 a/b/c.html 这个模版页面,
 * 与 url 方法的逻辑类似, 但是不需要我们通过写代码来定义路由指定模版页面
 */
BackendTplServer.prototype.registerRenderTplRoute = function() {
    this.app.get('/_views/*', renderTpl);
};

/**
 * 注册所有 HTTP Mock 接口的路由
 * 
 * 只需要将 Mock 配置文件放置在 `fe/mock/http` 文件夹下即可,
 * Mock 配置文件可以是 `.json` 或者 `.js` 文件, 具体配置项与
 * [puer-mock 项目的 _mockserver.json](https://github.com/ufologist/puer-mock#config) 一样
 */
BackendTplServer.prototype.registerMockApiRoute = function() {
    mockHttpApi(this.app);
};

module.exports = BackendTplServer;