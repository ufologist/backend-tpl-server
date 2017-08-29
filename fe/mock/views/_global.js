// 灌入模版页面中的全局数据和工具方法
module.exports = {
    // 全局数据
    user: {
        id: 1,
        name: '测试'
    },
    // 工具方法
    __helper: {
        toJSON: function(value) {
            return JSON.stringify(value);
        }
    }
};