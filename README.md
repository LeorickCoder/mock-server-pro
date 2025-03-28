# Mock Server Pro

[English](./README.en.md) | 简体中文

一个强大的 Mock 服务器，专注于解决前端开发中的接口模拟问题。支持完整的网络请求链路模拟、参数化路由、文件上传等功能。

## 最新功能 (v1.1.0)

- **参数化路由支持**: 添加了对Express风格参数化路由的完整支持
  - 支持路径参数提取（如 `/api/users/:id`）
  - 支持多参数路由（如 `/api/users/:userId/posts/:postId`）
  - 支持正则约束参数（如 `/api/items/:id([0-9]+)`）
  - 支持通配符路径（如 `/api/files/*`）
- **路由匹配优化**: 改进了路由匹配算法和性能
  - 更精确的路由匹配和排序
  - 缓存机制提高匹配性能
  - 智能的路径参数提取
- **模块格式支持**: 支持多种模块格式和环境
  - ESM (ES Modules)
  - CommonJS
  - TypeScript

详细文档请参考 [参数化路由文档](docs/path-params.md)

## 为什么选择 Mock Server Pro？

### 现有 Mock 方案的痛点

1. **Mock.js 的局限性**
   - 无法模拟文件上传接口
   - 不支持完整的网络请求链路
   - 无法与 Axios 拦截器正常配合
   - 缺乏类型支持

2. **传统 Mock 服务器的不足**
   - 配置复杂，需要单独维护
   - 与开发服务器集成困难
   - 不支持热重载
   - 缺乏模块化管理

### Mock Server Pro 的优势

1. **完整的请求链路模拟**
   - 支持文件上传接口
   - 与 Axios 拦截器完美配合
   - 支持请求超时、并发控制
   - 内置 CORS 支持

2. **灵活的集成方式**
   - 可作为 Express 中间件集成
   - 支持 Vite、Webpack 等构建工具
   - 支持热重载
   - TypeScript 支持

3. **模块化管理**
   - 按功能模块组织 Mock 接口
   - 支持中间件注册
   - 路由冲突检测
   - 配置系统

## 快速开始

### 1. 安装

```bash
npm install mock-server-pro
```

### 2. 集成示例

#### Vite 集成 (ESM)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { createMockMiddleware } from 'mock-server-pro';

export default defineConfig({
  server: {
    middleware: [
      await createMockMiddleware(app, {
        base: {
          prefix: '/api'
        },
        modules: {
          dir: './src/mocks'
        }
      })
    ]
  }
});
```

#### Webpack/Express 集成 (CommonJS)

```javascript
// webpack.config.js 或 express服务器
const { createMockMiddleware } = require('mock-server-pro');

module.exports = {
  devServer: {
    before: async (app) => {
      await createMockMiddleware(app, {
        base: {
          prefix: '/api'
        },
        modules: {
          dir: './src/mocks'
        }
      });
    }
  }
};
```

### 3. 创建 Mock 模块

支持多种模块格式：

#### ESM 格式 (推荐用于 Vite/现代项目)

```typescript
// src/mocks/user.ts
import type { ModuleContext } from 'mock-server-pro';

export default function(ctx: ModuleContext) {
  // 注册路由
  ctx.registerRoute('get', '/users', (req, res) => {
    res.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);
  });
}
```

#### CommonJS 格式 (用于 Webpack/Express 项目)

```javascript
// src/mocks/user.js
module.exports = function(ctx) {
  // 注册路由
  ctx.registerRoute('get', '/users', (req, res) => {
    res.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);
  });
};
```

#### TypeScript + CommonJS (混合项目)

```typescript
// src/mocks/user.ts
import type { ModuleContext } from 'mock-server-pro';

module.exports = function(ctx: ModuleContext) {
  ctx.registerRoute('get', '/users', (req, res) => {
    res.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);
  });
};
```

## 特性

- ✨ 完整的请求链路模拟
- 🔥 热重载支持
- 📦 模块化管理
- 🚀 构建工具集成
- 🔌 灵活的配置系统
- 📝 TypeScript 支持
- 🎯 路由冲突检测
- 🔄 并发请求控制
- 🌈 跨域支持
- 🔧 多模块格式支持

## 配置

### 默认配置

```typescript
const defaultConfig = {
  base: {
    prefix: '/api', // API前缀
    prefixConfig: {
      value: '/api',
      mode: 'auto',        // 前缀处理模式：'auto'|'append'|'mount'
      detectBasePath: true // 是否自动检测基路径
    }
  },
  request: {
    timeout: 30000,     // 请求超时时间（毫秒）
    maxConcurrent: 100, // 最大并发请求数
    bodyLimit: '1mb'    // 请求体大小限制
  },
  hotReload: {
    enabled: process.env.NODE_ENV === 'development', // 是否启用热重载
    ignored: ['**/node_modules/**', '**/.git/**'],   // 忽略的文件
    stabilityThreshold: 1000,                        // 稳定性阈值（毫秒）
    pollInterval: 100                                // 轮询间隔（毫秒）
  },
  modules: {
    dir: 'modules',           // 模块目录路径
    pattern: '**/*.{js,ts}',  // 模块文件匹配模式
    recursive: true,          // 是否递归查找子目录
    ignore: [                 // 忽略的文件模式
      '**/node_modules/**',
      '**/.git/**',
      '**/*.d.ts',
      '**/*.test.*'
    ]
  },
  typescript: {
    sourcemap: true,         // 是否启用源码映射
    compilerOptions: {       // TypeScript编译器选项
      module: 'commonjs',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      moduleResolution: 'node',
      target: 'es2018',
      strict: false
    }
  }
};
```

## API

### createMockServer(options)

创建独立的 Mock 服务器。

- `options`: 配置选项（可选）
- 返回: Promise<Express.Application>

### createMockMiddleware(app, options)

将 Mock 服务器作为中间件集成到现有 Express 应用中。

- `app`: Express 应用实例
- `options`: 配置选项（可选）
- 返回: Promise<void>

### ModuleContext

模块上下文接口，提供以下方法：

- `registerRoute(method: HttpMethod, path: string, handler: RouteHandler)`: 注册路由
- `registerMiddleware(path: string, handler: MiddlewareHandler)`: 注册中间件

## 最佳实践

1. **模块格式选择**：
   - 现代项目（Vite/ESM）：使用 ESM 格式
   - 传统项目（Webpack/Express）：使用 CommonJS 格式
   - 混合项目：根据构建工具选择合适的格式

2. **模块化组织**：
   - 按功能模块划分文件
   - 每个模块独立管理自己的路由和中间件
   - 使用 TypeScript 获得更好的类型提示

3. **错误处理**：
   - 使用 try-catch 捕获异常
   - 统一错误返回格式
   - 避免在路由处理器中返回 Response 对象

4. **热重载**：
   - 开发环境下启用
   - 合理配置忽略文件
   - 避免频繁修改文件

5. **并发控制**：
   - 根据实际需求设置 maxConcurrent
   - 监控请求队列

6. **目录结构**：
   - 将 mock 模块放在 src/mocks 目录下
   - 使用 index.ts/js 作为模块入口
   - 按功能组织子目录

## 常见问题

1. **模块导入问题**：
   - ESM 环境：使用 `export default function(ctx) {}`
   - CommonJS 环境：使用 `module.exports = function(ctx) {}`
   - 确保与项目的模块系统匹配

2. **路由冲突**：
   - 检查是否有重复的路由定义
   - 确保路径格式正确（以 / 开头）
   - 避免使用 .. 等特殊字符

3. **热重载不生效**：
   - 确认 hotReload.enabled 为 true
   - 检查文件修改是否在监控范围内
   - 查看日志中的文件变化记录

4. **类型错误**：
   - 确保正确导入类型定义
   - 检查路由处理器的返回类型
   - 使用 TypeScript 的严格模式

5. **并发限制**：
   - 调整 maxConcurrent 配置
   - 检查是否有请求未正确结束
   - 监控 pendingRequests 数量

## 许可证

MIT

# TypeScript 模块支持

mock-server-pro 现在提供了增强的 TypeScript 模块支持，使你能够直接使用 `.ts` 文件编写 Mock 模块，无需预编译。

## 基本用法

在你的 `modules` 目录中，你可以直接创建 `.ts` 文件:

```typescript
// modules/users.ts
import { ModuleContext } from 'mock-server-pro';

export default function(ctx: ModuleContext) {
  ctx.get('/api/users', (req, res) => {
    res.json([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ]);
  });
}
```

## 配置选项

你可以通过配置 `typescript` 选项来自定义 TypeScript 文件的处理方式:

```javascript
const config = {
  // ... 其他配置
  typescript: {
    // 是否启用源码映射 (用于调试)
    sourcemap: true,
    // TypeScript 编译器选项
    compilerOptions: {
      module: 'commonjs',
      esModuleInterop: true,
      // ... 其他编译器选项
    },
    // 自定义加载器 (高级用法)
    loader: (filePath) => {
      // 返回加载的模块
      return customLoadFunction(filePath);
    }
  }
};
```

## 环境自适应

mock-server-pro 会自动检测当前运行环境，并使用最合适的方式加载 TypeScript 文件:

1. **Node.js 环境**: 使用 ts-node 加载 (需要安装 ts-node)
2. **Vite 环境**: 使用 Vite 内置的 TypeScript 支持
3. **Webpack 环境**: 使用 Webpack 的 TypeScript 支持
4. **其他环境**: 尝试使用动态 import 或自定义加载器

## 调试支持

启用 `sourcemap` 选项后，你可以在原始的 TypeScript 代码中设置断点进行调试，无需在编译后的 JavaScript 代码中查找位置。

## 安装依赖

在 Node.js 环境中，你需要安装以下依赖以获得完整的 TypeScript 支持:

```bash
npm install --save-dev typescript ts-node
```

在 Vite 或 Webpack 项目中，只需确保已经配置了 TypeScript 支持即可。

## 路由前缀(Prefix)与挂载方式

### 前缀配置选项

mock-server-pro 支持两种前缀处理模式，适用于不同的集成场景：

```js
// mock.config.js
module.exports = {
  base: {
    // 基本前缀路径
    prefix: '/api',
    
    // 前缀高级配置
    prefixConfig: {
      // 前缀值（一般与prefix保持一致）
      value: '/api',
      
      // 前缀处理模式:
      // 'append' - 应用级挂载，路径内部附加前缀 (app.use(middleware))
      // 'mount' - 路由级挂载，路径不附加前缀 (app.use('/api', middleware))
      // 'auto' - 自动检测挂载方式（推荐）
      mode: 'auto',
      
      // 是否自动检测基路径（仅在auto模式下有效）
      detectBasePath: true
    }
  }
}
```

### 路径规范与自动处理

注册路由时，有两种方式指定路径：

1. **带前缀路径** - 完整包含前缀的路径
2. **相对路径** - 不包含前缀的路径，系统会自动添加前缀

```js
// 模块示例
module.exports = function(ctx) {
  // 方式1: 带前缀路径 (完整路径)
  ctx.registerRoute('get', '/api/users', (req, res) => {
    res.json({ users: [] });
  });
  
  // 方式2: 相对路径 (自动添加前缀)
  ctx.registerRoute('get', 'products', (req, res) => {
    // 最终路径为: /api/products
    res.json({ products: [] });
  });
};
```

### 不同的挂载方式

根据你的项目需求，可以选择以下两种方式挂载 mock-server-pro：

#### 1. 应用级挂载 (Append 模式)

应用级挂载是将中间件直接挂载到 Express 应用上：

```js
// 配置使用 append 模式
const config = {
  base: {
    prefix: '/api',
    prefixConfig: { mode: 'append' }
  }
};

// Express 挂载
app.use(createMockMiddleware(app, config));

// 或使用内置函数
const mockServer = await createMockServer(config);
app.use(mockServer);
```

在这种模式下：
- **路由定义**：路径需要包含 `/api` 前缀或使用相对路径（自动添加前缀）
- **请求处理**：mock-server-pro 会内部处理前缀匹配

#### 2. 路由级挂载 (Mount 模式)

路由级挂载是将中间件挂载到特定的路径前缀下：

```js
// 配置使用 mount 模式
const config = {
  base: {
    prefix: '/api',
    prefixConfig: { mode: 'mount' }
  }
};

// Express 挂载（注意路径前缀）
app.use('/api', createMockMiddleware(app, config));

// 或使用内置函数
// createMockServer 会自动使用前缀挂载
const mockServer = await createMockServer(config);
```

在这种模式下：
- **路由定义**：路径不需要包含 `/api` 前缀（因为已经在挂载时指定）
- **请求处理**：Express 会先匹配 `/api`，然后再将剩余路径传递给中间件

#### 3. 自动模式 (推荐)

自动模式会根据请求的 URL 结构自动检测挂载方式：

```js
// 配置使用 auto 模式
const config = {
  base: {
    prefix: '/api',
    prefixConfig: { 
      mode: 'auto',
      detectBasePath: true 
    }
  }
};

// 可以使用任意方式挂载
app.use('/api', createMockMiddleware(app, config));
// 或
app.use(createMockMiddleware(app, config));
```

在这种模式下：
- mock-server-pro 会自动检测是否已经通过路由路径挂载
- 根据检测结果动态调整路径处理逻辑
- 提供最大的灵活性和兼容性

### 路径模式配置

你可以通过 `routes.pathMode` 配置来控制路径处理的行为：

```js
// mock.config.js
module.exports = {
  routes: {
    // auto: 自动处理路径前缀 (默认)
    // strict: 严格模式，要求路径必须符合规范
    pathMode: 'auto',
    
    // 是否允许覆盖已存在的路由
    allowOverride: false
  }
}
```

- `auto` 模式：系统会自动处理路径，确保包含正确的前缀
- `strict` 模式：要求开发者提供正确格式的路径，不符合规范会抛出错误

### 路由冲突处理

当多个模块注册了相同的路由路径时：

- 默认行为：抛出错误，防止意外覆盖
- 通过设置 `routes.allowOverride = true` 允许覆盖，并会输出警告日志

### 最佳实践

1. **使用自动模式**：设置 `prefixConfig.mode = 'auto'` 并启用 `detectBasePath`
2. **明确使用方式**：根据项目需求选择一种挂载方式，并在团队内统一
3. **路由定义**：尽可能使用相对路径，让系统自动处理前缀

### 挂载方式对比

| 特性 | 应用级挂载 (Append) | 路由级挂载 (Mount) |
|------|-------------------|-------------------|
| 挂载代码 | `app.use(middleware)` | `app.use('/api', middleware)` |
| 路径定义 | 需要包含前缀 | 不需要包含前缀 |
| 适用场景 | 集中管理路由 | 与其他路由共存 |
| 路径冲突 | 低风险 | 需谨慎处理 |
