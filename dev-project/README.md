# Mock-Server-Pro 开发环境

这是 Mock-Server-Pro 库的开发环境，用于直接使用源代码进行开发和调试。

## 特点

- 直接使用源码（.ts文件）进行开发
- 支持热更新
- 完整的调试支持
- 基于 Vite 的快速开发体验

## 开始使用

### 安装依赖

```bash
cd dev-project
npm install
```

### 开发模式

启动开发服务器：

```bash
npm run dev
```

或者使用 ts-node-dev（支持更好的调试）：

```bash
npm start
```

然后访问：[http://localhost:3000](http://localhost:3000)

### 添加 Mock 接口

1. 在 `src/mocks` 目录中创建新的 `.ts` 文件
2. 按照示例格式编写 mock 接口定义
3. 服务器会自动检测更改并热重载

## 调试

### VS Code 调试

项目已配置 VS Code 调试设置，可以直接使用：

1. 打开 VS Code 调试面板 (Ctrl+Shift+D 或 Cmd+Shift+D)
2. 选择 "Debug Development Server" 配置
3. 点击开始调试按钮 (F5)

### 浏览器调试

对于客户端代码，可以使用浏览器开发者工具进行调试。Vite 已配置为自动生成 sourcemap。

## 项目结构

```
dev-project/
├── src/                # 开发环境源码
│   ├── dev-server.ts   # 开发服务器入口
│   └── mocks/          # Mock 接口定义
├── public/             # 静态资源
├── .vscode/            # VS Code 配置
│   └── launch.json     # 调试配置
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── README.md           # 说明文档
```

## 与工具库项目的关系

此开发环境直接引用父目录的 `src` 中的源代码，而不是使用已打包的代码。这使得开发和调试更加方便，可以直接在源代码中进行修改，并立即看到效果。 