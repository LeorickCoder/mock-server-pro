# Mock Server Pro

一个灵活且功能强大的 Mock 服务器，支持模块化开发和热重载。

## 特性

- 🔄 热重载支持：修改模块文件后自动更新，无需重启服务器
- 📦 模块化管理：支持按功能模块组织 API 和中间件
- 🔌 中间件系统：支持全局和模块级别的中间件
- 📝 TypeScript 支持：完整的类型定义
- 🛣️ 路由管理：支持 RESTful API 和自定义路由
- 📊 日志系统：可配置的日志级别和输出
- ⚙️ 高度可配置：支持自定义端口、前缀等配置

## 安装

```bash
npm install mock-server-pro
# 或
yarn add mock-server-pro
```

## 快速开始

1. 创建项目结构：

```bash
mkdir -p mock-server/modules/{user,product,order}
cd mock-server
```

2. 创建模块文件（例如 `modules/user/index.js`）：

```javascript
// 用户模块
module.exports = function(dispatcher) {
  // 注册路由
  dispatcher.registerRoute('GET', '/api/users', (req, res) => {
    res.json({
      code: 200,
      data: [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 }
      ]
    });
  });

  // 注册带参数的路由
  dispatcher.registerRoute('GET', '/api/users/:id', (req, res) => {
    const { id } = req.params;
    res.json({
      code: 200,
      data: { id: parseInt(id), name: 'John', age: 30 }
    });
  });

  // 注册 POST 请求
  dispatcher.registerRoute('POST', '/api/users', (req, res) => {
    const userData = req.body;
    res.json({
      code: 200,
      data: { ...userData, id: Date.now() }
    });
  });

  // 注册中间件
  dispatcher.registerMiddleware('/api/users', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}
```

3. 创建产品模块（`modules/product/index.js`）：

```javascript
// 产品模块
module.exports = function(dispatcher) {
  // 注册路由
  dispatcher.registerRoute('GET', '/api/products', (req, res) => {
    res.json({
      code: 200,
      data: [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 }
      ]
    });
  });

  // 注册带查询参数的路由
  dispatcher.registerRoute('GET', '/api/products/search', (req, res) => {
    const { keyword, minPrice, maxPrice } = req.query;
    res.json({
      code: 200,
      data: {
        keyword,
        minPrice,
        maxPrice,
        results: []
      }
    });
  });
}
```

4. 创建订单模块（`modules/order/index.js`）：

```javascript
// 订单模块
module.exports = function(dispatcher) {
  // 注册路由
  dispatcher.registerRoute('GET', '/api/orders', (req, res) => {
    res.json({
      code: 200,
      data: [
        { id: 1, userId: 1, total: 300 },
        { id: 2, userId: 2, total: 200 }
      ]
    });
  });

  // 注册带延迟的路由
  dispatcher.registerRoute('POST', '/api/orders', (req, res) => {
    setTimeout(() => {
      res.json({
        code: 200,
        data: { ...req.body, id: Date.now() }
      });
    }, 1000);
  });
}
```

5. 创建服务器入口文件（`server.js`）：

```javascript
const { createMockServer } = require('mock-server-pro');
const path = require('path');

// 创建服务器实例
const mockServer = createMockServer({
  port: 3000,
  prefix: '/api',
  hotReload: true,
  watchDir: path.join(__dirname, 'modules'),
  logLevel: 'debug'
});

// 启动服务器
mockServer.start();
```

6. 运行服务器：

```bash
node server.js
```

## 模块开发

### 模块结构
```
mock-server/
  ├── modules/           # 模块目录
  │   ├── user/         # 用户模块
  │   │   ├── index.js  # 模块入口
  │   │   └── data.js   # 数据文件
  │   ├── product/      # 产品模块
  │   │   └── index.js
  │   └── order/        # 订单模块
  │       └── index.js
  └── server.js         # 服务器入口
```

### 模块格式
```javascript
module.exports = function(dispatcher) {
  // 1. 注册路由
  dispatcher.registerRoute('GET', '/api/your-path', (req, res) => {
    // 处理请求
    res.json({
      code: 200,
      data: { /* 你的数据 */ }
    });
  });

  // 2. 注册中间件
  dispatcher.registerMiddleware('/api/your-path', (req, res, next) => {
    // 中间件逻辑
    next();
  });
}
```

### 路由参数
- 路径参数：`/api/users/:id`
- 查询参数：`/api/products?keyword=test&minPrice=100`
- 请求体：`req.body`

### 响应格式
```javascript
{
  code: 200,      // 状态码
  data: {},       // 响应数据
  message: ''     // 可选的消息
}
```

## 配置选项

```typescript
interface MockServerOptions {
  port?: number;          // 服务器端口，默认 3000
  prefix?: string;        // API 前缀，默认 ''
  watchDir?: string;      // 监控目录，默认 './modules'
  hotReload?: boolean;    // 是否启用热重载，默认 true
  logLevel?: 'debug' | 'info' | 'warn' | 'error';  // 日志级别
}
```

## 热重载

热重载功能会自动监控模块文件的变化，当文件发生变化时：
1. 自动清除模块缓存
2. 重新加载模块
3. 更新路由和中间件

无需手动重启服务器，修改即可生效。

## 文档

详细文档请访问 [文档站点](https://github.com/LeorickCoder/mock-server-pro#readme)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 作者

- 作者：Leorick
- GitHub：[@LeorickCoder](https://github.com/LeorickCoder)
- 邮箱：leolrick

## 许可证

MIT 