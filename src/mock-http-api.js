var path = require('path');

var glob = require('glob');
var merge = require('merge');
var rc = require('puer-mock/src/route-config.js');
var Router = require('express').Router;

var __hasProp = {}.hasOwnProperty;

var mockHttpBase = './mock/http';

/**
 * 从一组文件中获取 Mock 配置
 * 
 * @param {Array<string>} filenames 
 * @return {object} {
 *     mockConfig,   // 合并了所有 Mock 配置文件中的接口配置
 *     mockConfigMap // Mock 文件与其 Mock 配置的映射
 * }
 */
function getMockInfo(filenames) {
    // Mock 文件与 Mock 配置的映射关系, 用于找出可能重复定义的接口
    var mockConfigMap = {};
    var allMockConfig = {};

    filenames.forEach(function(filename) {
        var ext = path.extname(filename);

        var mockConfig = {};
        try {
            if (ext == '.json') {
                mockConfig = rc.getMockConfig(filename);
            } else if (ext == '.js') {
                mockConfig = require(filename);
            }
        } catch (error) {
            console.error('HTTP 接口的 Mock 数据配置有问题', filename);
            console.error(error);
        }

        mockConfigMap[filename] = mockConfig;
        allMockConfig = merge.recursive(true, allMockConfig, mockConfig);
    });

    return {
        mockConfigMap: mockConfigMap,
        mockConfig: allMockConfig
    };
}

/**
 * 尝试从 Mock 文件与其 Mock 配置的映射关系中找出是否有重复定义的 Mock 数据配置
 * 
 * @param {object} mockConfigMap 
 */
function tryFindDuplicateHttpApi(mockConfigMap) {
    var apis = {};
    for (var filename in mockConfigMap) {
        var api = mockConfigMap[filename].api;
        if (api) {
            for (var path in api) {
                var apiDefine = {};
                apiDefine[path] = api[path];

                if (apis[path]) {
                    console.warn('有重复定义的 HTTP 接口 Mock 数据配置');
                    console.log('---------------------------------------------------------');
                    console.warn(filename, JSON.stringify(apiDefine, null, 4));
                    console.warn(apis[path].filename, JSON.stringify(apis[path].apiDefine, null, 4));
                    console.log('---------------------------------------------------------');
                } else {
                    apis[path] = {
                        filename: filename,
                        apiDefine: apiDefine
                    };
                }
            }
        }
    }
}

/**
 * 查找出所有 Mock 配置文件
 * 
 * @return {Array<string>} Mock 配置文件的路径
 */
function getMockConfigFilenames() {
    var filenames = glob.sync(mockHttpBase + '/**/*.{js,json}', {
        absolute: true,
        nodir: true
    });
    return filenames;
}

/**
 * 注册 `/_apidoc` 路由, 用于查看所有的 Mock 接口配置
 * 
 * 例如
 * * `http://localhost:8000/_apidoc`       // 查看所有 Mock 接口的配置
 * * `http://localhost:8000/_apidoc?map=1` // 查看所有 Mock 文件与其 Mock 接口配置的映射关系
 * 
 * @param {object} app
 * @param {Array<string>} filenames
 * @param {object} mockInfo
 */
function registerGetMockApi(app, mockInfo) {
    app.get('/_apidoc', function(request, response) {
        if (request.query.map) {
            response.jsonp(mockInfo.mockConfigMap);
        } else {
            response.jsonp(mockInfo.mockConfig);
        }
    });
}

/**
 * 注册所有 HTTP Mock 接口的路由
 * 
 * @param {object} routeConfig
 */
function registerMockApiRoute(app, routeConfig) {
    // 通过 Router 创建模块化的路由定义
    var router = new Router();

    // 参考 puer 的 addon 机制
    for (path in routeConfig) {
        if (!__hasProp.call(routeConfig, path)) continue;

        var callback = routeConfig[path];

        var method = 'GET';
        var tmp = path.split(/\s+/);
        if (tmp.length > 1) {
            method = tmp[0];
            path = tmp[1];
        }

        router[method.toLowerCase()](path, callback);
    }

    // 使用 Router 模块化路由定义, 可以快速将路由切换到统一路径下面,
    // 例如: app.use('/api', router);
    app.use(router);
}

function mockHttpApi(app) {
    var filenames = getMockConfigFilenames();
    var mockInfo = getMockInfo(filenames);
    var routeConfig = rc.generateRouteConfig(mockInfo.mockConfig);

    tryFindDuplicateHttpApi(mockInfo.mockConfigMap);
    registerGetMockApi(app, mockInfo);
    registerMockApiRoute(app, routeConfig);
}

module.exports = mockHttpApi;