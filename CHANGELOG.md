# CHANGELOG

* v0.7.4 2018-3-20

  * [fix] `_global.js` 全局数据需要重启服务器才能生效, 需要清除 `require()` 的缓存

* v0.7.3 2017-10-12

  * 升级 [mock-http-api](https://github.com/ufologist/mock-http-api) 模块到 `1.1.2` 版本, 现在支持 `proxy` 配置代理接口了

  * 发现有一个类似功能的模块 [moky](https://github.com/int64ago/moky) 支持 viewsMock 和 asyncMock 真是君子所见略同啊

    > A proxy server with mock

* v0.7.2 2017-9-8

  * [refactor] 提取模块, 重构了代码

* v0.7.1 2017-9-7

  * [[fix](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#type)] 当模版页面解析出错时没有报错, 而是输出了一个空 JSON

    由于在 `render` 方法中做错误处理时没有将有用的错误信息输出到页面上造成的

* v0.7.0 2017-9-6

  当 HTTP Mock 文件修改后, 自动刷新 HTTP Mock 路由, 不再需要 `nodemon` 了

* v0.6.2 2017-9-5

  修复未声明 `path` 变量造成无意间覆盖了 `path` 模块的 bug

* v0.6.1 2017-9-4

  启动时修改命令行的标题, 这样当同时启动了多个服务器时, 可以清楚的知道哪个是哪个

* v0.6.0 2017-8-29

  实现自动将全局数据和工具方法灌入到模版页面中

  只需要在 `fe/mock/views/_global.js` 中定义好全局数据和工具方法, 就会跟模版本身配置的 Mock 数据合并在一起

* v0.5.0 2017-8-26

  实现自动加载 HTTP Mock 接口的功能

  只需要将 Mock 配置文件放置在 `fe/mock/http` 文件夹下即可(支持多层级目录结构),
  Mock 配置文件可以是 `.json` 或者 `.js` 文件, 具体的配置项与 [puer-mock 项目的 _mockserver.json](https://github.com/ufologist/puer-mock#config) 一样

  注册了 `/_apidoc` 路由, 用于查看所有的 Mock 接口配置, 例如:
  * `http://localhost:8000/_apidoc`       [查看所有 Mock 接口的配置]
  * `http://localhost:8000/_apidoc?map=1` [查看所有 Mock 文件与其 Mock 接口配置的映射关系]

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