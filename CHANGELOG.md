# CHANGELOG

* v0.4.0 2017-8-25

  实现渲染模版页面自动加载关联的 Mock 数据的功能, 以后基本上就不用自己写页面的路由了

  URL 与模版页面及 Mock 数据的对应规则
  * `http://localhost:8000/_views/a/b/c.html` [访问的 URL]
  * `views/a/b/c.html` [对应的模版页面的路径]
  * `fe/mock/views/a/b/c.json` 或者 `fe/mock/views/a/b/c.js` [对应的 Mock 数据的路径]

  关于两种定义 Mock 数据的方式: `.json` 还是 `.js`
  * 使用 `.json` 是最简单便捷的方式
  * 为什么需要 `.js` 方式: 方便抽取出共用的数据在各个 Mock 数据中使用
  * 当同时存在 `.json` 和 `.js` 的 Mock 数据时, 会优先使用 `.js` 产生的 Mock 数据

* v0.3.1 2017-8-25

  由于 `weinre/lib/utils.js` 中定义的 `Error.prepareStackTrace` 有问题, 调用这个方法(例如 render 方法出错时)会造成进程挂掉, 因此删除掉这方法避免这个问题

* v0.3.0 2017-8-24

  添加 `/_views/*` 路由专门用于渲染模版页面

  例如: `http://localhost:8000/_views/a/b/c.html` 即渲染 `a/b/c.html` 这个模版页面, 这样我们就不需要频繁地通过写代码来定义路由指定模版页面了, 毕竟前端最需要的就是查看页面渲染的效果

* v0.2.0 2017-5-18

  在控制台显示 webroot 的绝对路径, 启动多个项目时便于查看

* v0.1.0 2017-4-17

  初始版本, 实现了前端可以解析后端模版页面, 前端可以查看页面渲染的效果

  * 通过 [velocity](https://github.com/fool2fish/velocity) 来解析 Java Web 项目中的 Velocity 模版页面
  * 通过 [Puer](https://github.com/leeluolee/puer) 实现页面 livereload
  * 通过 [Mock.js](https://github.com/nuysoft/Mock) 为模版页面灌入假数据