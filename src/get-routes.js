/**
 * 获取所有的路由信息
 * 
 * http://stackoverflow.com/questions/14934452/how-to-get-all-registered-routes-in-express
 * https://github.com/brennancheung/express-remove-route
 * 
 * XXX 对于 app.use('/birds', router) 这样路由注册方式还解析不了
 * 
 * @param {object} app express app
 * @return {array} 路由信息数组
 */
function getRoutes(app) {
    var routes = [];

    var layerRoutes = findLayerRoutes(app._router.stack);
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

    routes.sort(function(a, b) {
        if (a.path > b.path) {
            return 1;
        } else if (a.path < b.path) {
            return -1;
        } else {
            return 0;
        }
    });

    return routes;
}

function findLayerRoutes(stack) {
    var layerRoutes = [];
    stack.forEach(function(layer) {
        if (layer.route) {
            layerRoutes.push(layer.route);
        } else if (layer.name == 'router') {
            layerRoutes = layerRoutes.concat(findLayerRoutes(layer.handle.stack));
        }
    });
    return layerRoutes;
}

module.exports = getRoutes;