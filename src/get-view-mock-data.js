var path = require('path');
var fs = require('fs');

// 如果使用 json5 能够让 JSON 文件更加容错, 写起来更容易
// https://github.com/json5/json5
// JSON isn’t the friendliest to write.
// Keys need to be quoted, objects and arrays can’t have trailing commas,
// and comments aren’t allowed
var stripJsonComments = require('strip-json-comments');
var Mock = require('mockjs');

var mockViewsBase = './mock/views';

/**
 * 获取模版页面对应的 Mock 数据
 * 即典型的 MVC 架构中, 由 Controller 层灌入 View 层的 Model 数据, 一般称为同步数据
 * 
 * Mock 数据与模版页面的对应规则:
 * 
 * * http://localhost:8000/_views/a/b/c.html [访问的 URL]
 * * views/a/b/c.html [对应的模版页面的路径]
 * * fe/mock/view/a/b/c.json 或者 fe/mock/view/a/b/c.js [对应的 Mock 数据的路径]
 * 
 * @param {string} tplFilePath 模版文件的路径
 */
function getViewMockData(tplFilePath) {
    var tplFilePathWithoutExtname = '';
    var lastDotIndex = tplFilePath.lastIndexOf('.');
    if (lastDotIndex != -1) {
        tplFilePathWithoutExtname = tplFilePath.substring(0, lastDotIndex);
    } else {
        tplFilePathWithoutExtname = tplFilePath;
    }

    var absMockJsonFilePath = path.resolve(mockViewsBase, tplFilePathWithoutExtname + '.json');
    var absMockJsFilePath = path.resolve(mockViewsBase, tplFilePathWithoutExtname + '.js');

    var hasMockJsonFile = fs.existsSync(absMockJsonFilePath);
    var hasMockJsFile = fs.existsSync(absMockJsFilePath);

    var mockData = {};
    if (hasMockJsFile) { // 优先尝试从 JS 文件中获取 Mock 数据
        mockData = getMockDataFromJs(absMockJsFilePath);
    } else if (hasMockJsonFile) {
        mockData = getMockDataFromJson(absMockJsonFilePath);
    }
    mockData = Mock.mock(mockData);

    console.log(new Date().toLocaleString(), 'getViewMockData', JSON.stringify(mockData, null, 4));

    return mockData;
}

/**
 * 读取 JSON 文件作为 Mock 数据
 * 
 * @param {string} absMockJsonFilePath
 */
function getMockDataFromJson(absMockJsonFilePath) {
    var mockFileContent = fs.readFileSync(absMockJsonFilePath, {
        encoding: 'utf-8'
    });

    var mockData = {};
    try {
        mockData = JSON.parse(stripJsonComments(mockFileContent));
        console.log(new Date().toLocaleString(), 'getMockDataFromJson', absMockJsonFilePath);
    } catch (error) {
        console.error('模版页面的 Mock 数据配置有问题', absMockJsonFilePath);
        console.error(error);
    }
    return mockData;
}

/**
 * 读取 JS 模块获取 Mock 数据
 * 使用 js 可以方便抽取出共用的数据在各个 Mock 数据中使用
 * 
 * 例如
 * module.exports = {
 *     a: 1
 * };
 * 
 * @param {string} absMockJsFilePath
 */
function getMockDataFromJs(absMockJsFilePath) {
    var mockData = {};
    try {
        mockData = require(absMockJsFilePath);
        console.log(new Date().toLocaleString(), 'getMockDataFromJs', absMockJsFilePath);
    } catch (error) {
        console.error('模版页面的 Mock 数据配置有问题', absMockJsFilePath);
        console.error(error);
    }

    return mockData;
}

module.exports = getViewMockData;