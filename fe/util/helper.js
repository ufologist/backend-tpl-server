// 可以在视图层增加 helper 方法用于调试
// <textarea>$!{__helper.toJSON($var)}</textarea>
//
// 需要注意的是, JS/Java Velocity 引擎对方法调用的处理结果有差异
//
// * 在 JS Velocity 引擎中, 如果模版中没有灌入这个方法, 或者方法传入的参数没有, 或者其他错误,
//   会造成页面中留下一个空白, 极易导致出现下面的语法错误
//   在模版中这样来写的
//   var a = $!{__obj.fn($var)};
//   console.log(a);
//   然而由于错误, 造成最终解析的页面内容是
//   var a = ;
//   console.log(a);
//   必然导致语法错误了
//
// * 在 Java Velocity 引擎中, 只要模版中灌入了这个方法, 就不会出现上述的错误
//   因此在模版中这样来写
//   var a = $!{__obj.fn($var)};
//   console.log(a);
//   得到的结果是正确的
//   var a = null;
//   console.log(a);
//   但如果模版中没有灌入这个方法, 才会出现 JS Velocity 中出现的错误
//   var a = $!{__obj.fn123($var)};
//   console.log(a);
//   得到的结果是
//   var a = ;
//   console.log(a);
var __helper = {
    toJSON: function(value) {
        return JSON.stringify(value, null, 4);
    }
};

module.exports = __helper;