// 使用方法
// var util = require(path.resolve(process.cwd(), 'util/util.js'));

var fs = require('fs');
var path = require('path');

var stripJsonComments = require('strip-json-comments');

/**
 * 从当前工作目录下读取 JSON 文件返回 JS 对象
 * 
 * @param {string} path
 * @return {object}
 */
function readJson(filePath) {
    var json = {};

    try {
        var content = fs.readFileSync(path.resolve(process.cwd(), filePath), {
            encoding: 'utf-8'
        });
        json = JSON.parse(stripJsonComments(content));
    } catch (error) {
        console.error(error);
    }

    return json;
}

module.exports = {
    readJson: readJson
};