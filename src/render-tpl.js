var path = require('path');
var fs = require('fs');

var getViewMockData = require('./get-view-mock-data.js');

function renderTpl(request, response) {
    // http://www.expressjs.com.cn/4x/api.html#req.params
    // This rule is applied to unnamed wild card matches with string routes such as /file/*
    var tplFilePath = request.params[0];
    var absTplFilePath = path.resolve(request.app.get('views'), tplFilePath);

    // 原来由于 weinre 中定义了 Error.prepareStackTrace 方法,
    // 只要 render 方法有错误(模版文件不存在或者有其他错误时),
    // 如果不使用 callback 回调来处理这个错误, 就会造成进程挂掉.
    //
    // 现在 delete 了 Error.prepareStackTrace 方法后,
    // render 方法出错不会造成进程挂掉, 会在页面中打印出错误调用链, 但提示不是很友好,
    // 为了提示更加友好, 先判断文件是否存在, 再去渲染, 根据文件状态给与不同的错误提示
    fs.stat(absTplFilePath, function(error, stats) {
        if (!error) {
            if (stats.isFile()) {
                response.render(tplFilePath, getViewMockData(tplFilePath), function(e, html) {
                    if(e) {
                        console.error('渲染模版页面出错', e);
                        var message = e.stack.replace(/</gm, '&lt;')
                                             .replace(/>/gm, '&gt;');
                        response.status(500).send('<pre style="color:#d92626">' + message + '</pre>');
                    } else {
                        response.send(html);
                        console.log(new Date().toLocaleString(), 'RenderTpl', absTplFilePath);
                        console.log('---------------------------------------------------------');
                    }
                });
            } else if (stats.isDirectory()) {
                response.status(400).send('这是一个文件夹: ' + absTplFilePath);
            } else {
                response.status(400).send(stats);
            }
        } else {
            if (error.code == 'ENOENT') {
                response.status(404).send('没有找到这个文件: ' + absTplFilePath);
            } else {
                response.status(500).send(error);
            }
        }
    });
}

module.exports = renderTpl;