# 推荐的 fe 目录结构

```
fe/
|── mock/        -- Mock 数据
|   |── views/   -- 视图层的 Mock 数据, 与模版页面的路径一一对应
|   |   |── news/
|   |   |   |── index.json
|   |   |   └── index.js
|   |   └── _global.js -- 灌入模版页面中的全局数据和工具方法
|   |
|   └── http/    -- HTTP Mock 接口配置
|       └── api/
|           |── user.json
|           └── news.js
|
|── route/       -- 路由
|   |── news.js
|   └── ...
|
|── model/       -- 数据模型
|   |── news.js
|   |── api.js   -- 统一接口返回的数据格式
|   └── ...
|
|── util/        -- helper 等工具
|   |── helper.js
|   └── ...
|
|── server.js
└── package.json
```