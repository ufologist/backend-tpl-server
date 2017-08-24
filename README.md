# backend-tpl-server

[![NPM version][npm-image]][npm-url] [![changelog][changelog-image]][changelog-url] [![license][license-image]][license-url]

[npm-image]: https://img.shields.io/npm/v/backend-tpl-server.svg?style=flat-square
[npm-url]: https://npmjs.org/package/backend-tpl-server
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square
[license-url]: https://github.com/ufologist/backend-tpl-server/blob/master/LICENSE
[changelog-image]: https://img.shields.io/badge/CHANGE-LOG-blue.svg?style=flat-square
[changelog-url]: https://github.com/ufologist/backend-tpl-server/blob/master/CHANGELOG.md

后端模版页面服务器, 作为前端人员的开发服务器, 使用的后端模版引擎是: [Velocity](http://velocity.apache.org/).

让前后端人员一起协作编写 Velocity 模版页面: **前端负责写页面, 后端负责灌数据**, 达到前后端分离的目标.

## 目标

* 告别前端人员写静态页面给后端人员"套(模版)页面"的原始开发模式, 提升开发效率
* 让前端人员可以快速介入编写后端的模版页面, 查看模版页面渲染的效果
  * 原来是编写静态页面, 查看页面效果, 现在是编写模版页面, 查看页面效果
  * 传统的办法是给前端人员搭建一套后端的开发环境: 联调阶段是必备的, 但开发阶段就有点过重了, 不方便前端人员使用, 专注于开发页面
* 分离前后端人员的职责: 前端人员负责页面, 后端人员负责数据, 前后端一起协商页面灌入的数据结构
* 前端人员可以通过造假数据与后端并行开发

## 使用说明

* 安装 [Node.js](http://nodejs.org/) `6.x`
* 将 [fe](https://github.com/ufologist/backend-tpl-server/tree/master/fe) 目录中的文件复制到你的 Java Web 项目根目录的 fe 目录中
* 在 fe 目录下 `npm install` 安装依赖
  * 推荐全局安装 `npm install nodemon -g`, 用于开发时自动 reload
* `npm start` 启动服务器

## 其他参考

* Node.js 版 Velocity 模版引擎
  * [fool2fish/velocity](https://github.com/fool2fish/velocity)
  * [shepherdwind/velocity.js](https://github.com/shepherdwind/velocity.js)
  * [yashiro1899/velocity.java](https://github.com/yashiro1899/velocity.java)
  * [fex-team/jello](https://github.com/fex-team/jello "针对服务端为 Java Velocity 的前端工程解决方案")
  * [jdf2e/jdf](https://github.com/jdf2e/jdf/blob/master/doc/core_vm.md "让前端来写后端的vm模板，并且前端不需要搭建各种繁杂的后端环境，前后端以 .vm 为沟通桥梁，另外模板的数据源可以在项目开始前前后端约定之后生成JSON文件，从而使两个角色并行开发。")
* Velocity 文档
  * [VTL Reference](http://velocity.apache.org/engine/devel/vtl-reference.html "concise syntax for Velocity Template Language (VTL)")
  * [User's Guide](http://velocity.apache.org/engine/devel/user-guide.html "explains how to write Velocity templates")

    > The following rule of thumb may be useful to better understand how Velocity works: References begin with $ and are used to get something. Directives begin with # and are used to do something.