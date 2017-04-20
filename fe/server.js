var BackendTplServer = require('backend-tpl-server');

// 路由模块
var news = require('./route/news.js'); 

// 指定后端 Java Web 项目的路径
var backendTplServer = new BackendTplServer('../src/main/webapp');
backendTplServer.start();

news(backendTplServer);