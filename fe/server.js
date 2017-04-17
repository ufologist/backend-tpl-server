var BackendTplServer = require('backend-tpl-server');
var Mock = require('mockjs');

// 指定后端 Java Web 项目的路径
var backendTplServer = new BackendTplServer('../src/main/webapp');
backendTplServer.start();

// 快速定义一个模版页面路由并给他灌入所需的数据
// 指定要查看哪个页面(这里的 html 即对应后端的模版页面文件)
// 对应访问的 URL: http://localhost:8000/a/b/c/page.html
backendTplServer.url('a/b/c/page.html', {
    id: '@id',
    name: '@cname'
});

// 如果是想控制更多, 可以直接使用 app(express的实例) 来定义路由, 控制视图和数据
backendTplServer.app.get('/abc', function(request, response) {
    var mockData = Mock.mock({
        id: '@id',
        name: '@cname'
    });

    response.render('abc.html', mockData);
});