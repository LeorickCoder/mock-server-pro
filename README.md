# Mock Server Pro

一个灵活且功能强大的 Mock 服务器，支持热重载和模块化管理。

## 特性

- 🔄 热重载支持
- 📦 模块化管理
- 🔌 中间件系统
- 📝 TypeScript 支持
- 🛣️ 路由管理
- 📊 日志系统
- ⚙️ 高度可配置

## 安装

```bash
npm install mock-server-pro
# 或
yarn add mock-server-pro
```

## 快速开始

```typescript
import { createMockServer } from 'mock-server-pro';

const mockServer = createMockServer({
  port: 3000,
  prefix: '/api'
});

// 添加路由
mockServer.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ]);
});

// 启动服务器
mockServer.start();
```

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