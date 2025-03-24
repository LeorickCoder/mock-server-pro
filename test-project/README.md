# Mock Server Pro 测试项目

这个项目提供了两种集成方式的演示，用于展示如何在前端项目中使用 mock-server-pro。

## 项目结构

```
test-project/
├── vite-demo/     # 基于 Vite + Vue3 的演示
│   ├── mock/      # 模块定义文件
│   └── ...
├── webpack-demo/  # 基于 Webpack + React + Express 的演示
│   ├── mock/      # 模块定义文件
│   └── ...
└── README.md      # 本文档
```

## 快速开始

### 安装依赖

```bash
npm run setup
```

### Vite 演示

这个演示展示了如何在 Vite 项目中集成 mock-server-pro。

```bash
npm run vite:dev
```

特点：
- 使用 `configureServer` 钩子在 Vite 开发服务器中配置
- 创建 express 实例并传入 `createMockServer`
- 支持热重载和自动加载模块

### Webpack 演示

这个演示展示了如何在使用 Webpack 的项目中通过 Express 服务器集成 mock-server-pro。

```bash
npm run webpack:dev
```

特点：
- 使用已有的 Express 服务器
- 将 Express 实例传入 `createMockServer`
- 支持热重载和自动加载模块

## 技术栈

### Vite 演示
- Vue 3
- TypeScript
- Vite

### Webpack 演示
- React
- Express
- Webpack

## Mock 模块注册方式

mock-server-pro 使用 **dispatcher** 分发器来注册和管理路由。模块接收一个 dispatcher 对象并使用它来注册路由和中间件：

```typescript
// Vite 示例 (TypeScript)
export default function(dispatcher) {
  // 注册路由
  dispatcher.registerRoute('get', '/users', (req, res) => {
    res.json([{ id: 1, name: 'User 1' }])
  })
  
  dispatcher.registerRoute('post', '/users', (req, res) => {
    res.json({ id: 2, name: req.body.name })
  })
  
  // 注册中间件
  dispatcher.registerMiddleware('/admin', (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: '未授权' })
    }
    next()
  })
}

// Webpack 示例 (JavaScript)
module.exports = function(dispatcher) {
  // 注册路由
  dispatcher.registerRoute('get', '/users', (req, res) => {
    res.json([{ id: 1, name: 'User 1' }])
  })
  
  // 注册中间件
  dispatcher.registerMiddleware('/admin', (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: '未授权' })
    }
    next()
  })
}
```

## 分发器 (Dispatcher) 工作原理

`dispatcher` 是一个强大的路由管理工具：

1. **路由映射管理**：维护一个路由表，将 `方法:路径` 映射到处理函数。
2. **模块映射管理**：记录每个模块注册的路由，便于热重载时清理和更新。
3. **并发控制**：限制并发请求数量，防止服务器过载。
4. **路由冲突检测**：确保不同模块之间不会注册相同的路由。
5. **中间件支持**：除了路由外，还支持基于路径的中间件注册。

## 集成方式

### 在 Vite 中集成

```typescript
// vite.config.ts
import express from 'express'
import { createMockServer } from 'mock-server-pro'

export default defineConfig({
  // ...
  server: {
    configureServer: (server) => {
      const app = express()
      createMockServer(app, {
        base: {
          prefix: '/api'
        },
        modules: {
          dir: path.join(__dirname, 'mock'), // 模块目录
          pattern: '**/*.ts',                // 模块文件匹配模式
          recursive: true                    // 是否递归查找
        }
      })
      server.middlewares.use(app)
    }
  }
})
```

### 在 Express 中集成

```javascript
// server.js
const express = require('express')
const { createMockServer } = require('mock-server-pro')
const path = require('path')

const app = express()

createMockServer(app, {
  base: {
    prefix: '/api'  // API 前缀
  },
  modules: {
    dir: path.join(__dirname, 'mock'),  // 模块目录
    pattern: '**/*.js',                 // 模块文件匹配模式
    recursive: true                     // 是否递归查找
  }
})

app.listen(3000)
```

## 调试

要调试 mock-server-pro 本身，可以在 VS Code 中使用以下配置：

1. 在 VS Code 中打开 mock-server-pro 项目
2. 设置断点
3. 使用"Run and Debug"面板启动相应的调试配置

## 问题排查

如果遇到问题，请检查：
1. 依赖是否正确安装
2. 本地 mock-server-pro 是否已构建 (`npm run build`)
3. 配置中的路径是否正确
4. 模块是否正确使用了 `dispatcher.registerRoute` 和 `dispatcher.registerMiddleware` 方法
5. 模块目录和模式是否正确配置
