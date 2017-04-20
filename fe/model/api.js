/**
 * 统一接口返回的数据格式
 * 
 * 后端接口通用规范
 * https://github.com/f2e-journey/treasure/blob/master/api.md#后端接口通用规范
 */
function getApiResult(data, status, message) {
    var result = {};

    // 成功处理并返回
    if (!status) {
        result.data = data;
    } else {
        result.status = status;
        result.statusInfo = {
            message: message
        };
    }

    return result;
}

module.exports = getApiResult;