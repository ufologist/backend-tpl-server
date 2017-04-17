# backend-tpl-server

[![NPM version][npm-image]][npm-url] [![changelog][changelog-image]][changelog-url] [![license][license-image]][license-url]

[npm-image]: https://img.shields.io/npm/v/backend-tpl-server.svg?style=flat-square
[npm-url]: https://npmjs.org/package/backend-tpl-server
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square
[license-url]: https://github.com/ufologist/backend-tpl-server/blob/master/LICENSE
[changelog-image]: https://img.shields.io/badge/CHANGE-LOG-blue.svg?style=flat-square
[changelog-url]: https://github.com/ufologist/backend-tpl-server/blob/master/CHANGELOG.md

后端模版页面服务器, 使用的后端模版引擎是: [Velocity](http://velocity.apache.org/), 适合前后端一起来协作编写后端模版页面

## 使用说明

```javascript
var BackendTplServer = require('backend-tpl-server');

// 指定后端 Java Web 项目的路径
var backendTplServer = new BackendTplServer('../src/main/webapp');
backendTplServer.start();

// 指定要查看哪个页面
backendTplServer.url('a/b/c/page.html', {
    id: '@id',
    name: '@cname'
});
```