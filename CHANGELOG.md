# CHANGELOG

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