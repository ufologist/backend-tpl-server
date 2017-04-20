// 在路由模块中, 将涉及该路由的子路由都定义在一起
// 例如: /news
//       /news/hot
//       /news/local
//       /news/last
//       /news/\\d+

var Mock = require('mockjs');

// 模型
var news = require('../model/news.js');
var getApiResult = require('../model/api.js');

// helper 方法
var __helper = require('../util/helper.js');

/**
 * 快速定义一个模版页面路由并给他灌入所需的数据
 * 
 * 只需要指定要查看哪个页面(这里的 html 即对应后端的模版页面文件)和页面所需的数据即可,
 * 对应访问的 URL: http://localhost:8000/news/index.html
 */
function index(backendTplServer) {
    // 模版的根目录基于 BackendTplServer options.web.views
    backendTplServer.url('news/index.html', {
        id: '@id',
        name: '@cname'
    });
}

/**
 * 如果是想控制更多, 可以直接使用 app(express的实例) 来定义路由, 控制视图和数据
 */
function hot(backendTplServer) {
    backendTplServer.app.get('/news/hot', function(request, response) {
        var data = Mock.mock({
            'news|0-10': [news]
        });

        // 如果对象中有方法的定义, 最好不要放在 Mock.mock 中, 因为他会将方法定义变成直接的属性值(方法的返回值)
        data.__helper = __helper;

        response.render('news/hot.html', data);
    });
}

/**
 * JavaBean 模式
 * 
 * 在模版页面中通过 $!{n.getId()} 这样的方式拿数据
 */
function local(backendTplServer) {
    backendTplServer.app.get('/news/local', function(request, response) {
        // 公共的数据模型可以抽取到出来, 作为一个文件 require 进来, 防止多处重复定义数据模型的规则
        var data = Mock.mock({
            'news|10-20': [news]
        });

        // 单独修改其中的某个数据
        data.news[0].getUrls = function() {
            return [
                'http://dummyimage.com/112x74,',
                'http://dummyimage.com/112x74,',
                'http://dummyimage.com/112x74,',
                'http://dummyimage.com/112x74,'
            ]
        };

        response.render('news/local.html', data);
    });
}

/**
 * HTTP 接口返回 JSON 数据
 */
function last(backendTplServer) {
    backendTplServer.app.post('/news/last', function(request, response) {
        var data = Mock.mock(getApiResult({
            'last|10-20': [news]
        }));

        response.json(data);
    });
}

/**
 * 通过正则表达式来定义路由
 */
function detail(backendTplServer) {
    // 路由路径和请求方法一起定义了请求的端点，它可以是字符串、字符串模式或者正则表达式
    // http://www.expressjs.com.cn/guide/routing.html
    // http://forbeslindesay.github.io/express-route-tester/
    // https://www.npmjs.com/package/path-to-regexp
    //
    // When you use a regular expression for the route definition,
    // capture groups are provided in the array using req.params[n], where n is the nth capture group.
    // backendTplServer.app.get(/\/json\/(\d+)/, function(request, response) {
    backendTplServer.app.get('/news/\\d+', function(request, response) {
        var data = Mock.mock({
            'news': news
        });

        response.render('news/detail.html', data);
    });
}

/**
 * 处理跳转 302 Found
 */
function redirect(backendTplServer) {
    backendTplServer.app.get(/\/news\/(\d+).html/, function(request, response) {
        var id = request.params[0];
        response.redirect('/news/' + id);
    });
}

module.exports = function(backendTplServer) {
    index(backendTplServer);
    hot(backendTplServer);
    local(backendTplServer);
    last(backendTplServer);
    detail(backendTplServer);
    redirect(backendTplServer);
};