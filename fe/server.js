var BackendTplServer = require('backend-tpl-server');
var Mock = require('mockjs');

// 指定后端 Java Web 项目的路径
var backendTplServer = new BackendTplServer('../src/main/webapp');
backendTplServer.start();

// 可以在视图层增加 helper 方法用于调试
// <textarea>$!{__helper.toJSON($var)}</textarea>
var __helper = {
    toJSON: function(value) {
        return JSON.stringify(value, null, 4);
    }
};

// 快速定义一个模版页面路由并给他灌入所需的数据
// 指定要查看哪个页面(这里的 html 即对应后端的模版页面文件)
// 对应访问的 URL: http://localhost:8000/a/b/c/page.html
backendTplServer.url('a/b/c/page.html', {
    id: '@id',
    name: '@cname'
});

// 如果是想控制更多, 可以直接使用 app(express的实例) 来定义路由, 控制视图和数据
backendTplServer.app.get('/abc', function(request, response) {
    var data = Mock.mock({
        id: '@id',
        name: '@cname'
    });

    // 如果对象中有方法的定义, 最好不要放在 Mock.mock 中, 因为他会将方法定义变成直接的属性值(方法的返回值)
    data.__helper = __helper;

    response.render('abc.html', data);
});

// JavaBean 模式
// 在模版页面中通过 $!{a.getTitle()} 这样的方式拿数据
backendTplServer.app.get('/javabean', function(request, response) {
    // 公共的数据模型可以抽取到出来, 作为一个文件 require 进来, 防止多处重复定义数据模型的规则
    var data = Mock.mock({
        'a|10-20': [{
            getTitle: function() {
                // Mock.js 会处理方法, 实际得到的是返回值, 因此这里需要返回一个方法
                return function() {
                    return Mock.mock('@ctitle');
                };
            }
        }]
    });

    // 单独修改其中的某个数据
    data.a[0].getUrls = function() {
        return [
            'http://dummyimage.com/112x74,',
            'http://dummyimage.com/112x74,',
            'http://dummyimage.com/112x74,',
            'http://dummyimage.com/112x74,'
        ]
    };

    response.render('home.html', data);
});

// HTTP 接口返回 JSON 数据
backendTplServer.app.post('/json/getPageData', function(request, response) {
    var data = Mock.mock({
        'data|10-20': [{
            title: '@ctitle'
        }]
    });

    response.json(data);
});

// 路由路径和请求方法一起定义了请求的端点，它可以是字符串、字符串模式或者正则表达式
// http://www.expressjs.com.cn/guide/routing.html
// http://forbeslindesay.github.io/express-route-tester/
// https://www.npmjs.com/package/path-to-regexp
//
// When you use a regular expression for the route definition,
// capture groups are provided in the array using req.params[n], where n is the nth capture group.
// backendTplServer.app.get(/\/json\/(\d+)/, function(request, response) {
backendTplServer.app.get('/json/\\d+', function(request, response) {
    var data = Mock.mock({
        'a': {
            getTitle: function() {
                return function() {
                    return Mock.mock('@ctitle');
                };
            }
        }
    });

    response.render('detail.html', data);
});