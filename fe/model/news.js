var Mock = require('mockjs');

module.exports = {
    id: '@id',
    code: function() {
        return Mock.mock('@integer(10, 20)').toString(10);
    },
    getId: function() {
        // Mock.js 会处理方法, 实际得到的是返回值, 因此如果想对象上是一个方法, 就需要返回一个方法
        return function() {
            return this.id;
        };
    }
};