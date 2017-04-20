// 可以在视图层增加 helper 方法用于调试
// <textarea>$!{__helper.toJSON($var)}</textarea>
var __helper = {
    toJSON: function(value) {
        return JSON.stringify(value, null, 4);
    }
};

module.exports = __helper;