/**
 * mock-server-pro 配置示例
 * 
 * 本文件展示了各种常见配置场景
 */

// 基础配置
exports.basicConfig = {
  base: {
    prefix: '/api' // 默认前缀，所有路由都将以此开头
  },
  request: {
    timeout: 30000, // 请求超时时间 (ms)
    maxConcurrent: 100, // 最大并发请求数
    bodyLimit: '1mb' // 请求体大小限制
  },
  hotReload: {
    enabled: true, // 是否启用热重载
    ignored: ['**/node_modules/**', '**/.git/**'], // 忽略的文件
    stabilityThreshold: 1000, // 文件修改后等待稳定的时间 (ms)
    pollInterval: 100 // 检查文件变化的间隔 (ms)
  },
  modules: {
    dir: './modules', // 模块目录
    pattern: '**/*.{js,ts}', // 模块文件匹配模式
    recursive: true, // 是否递归查找子目录
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*'] // 忽略的文件
  }
};

// 路由与模式配置
exports.routeConfig = {
  // 基础配置...
  base: {
    prefix: '/mock-api' // 自定义前缀
  },
  routes: {
    pathMode: 'auto', // 'auto' | 'strict'
    // auto: 自动处理路径前缀
    // strict: 严格要求路径必须符合规范
    
    allowOverride: false // 是否允许覆盖已存在的路由
  }
};

// TypeScript 支持配置
exports.typescriptConfig = {
  // 其他配置...
  typescript: {
    sourcemap: true, // 启用 sourcemap 支持（调试用）
    compilerOptions: {
      module: 'commonjs',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      moduleResolution: 'node',
      target: 'es2018',
      strict: false
      // 可添加其他 TypeScript 编译选项
    }
  }
};

// 完整配置示例
exports.fullConfig = {
  base: {
    prefix: '/api'
  },
  request: {
    timeout: 30000,
    maxConcurrent: 100,
    bodyLimit: '1mb'
  },
  hotReload: {
    enabled: process.env.NODE_ENV === 'development',
    ignored: ['**/node_modules/**', '**/.git/**'],
    stabilityThreshold: 1000,
    pollInterval: 100
  },
  modules: {
    dir: './modules',
    pattern: '**/*.{js,ts}',
    recursive: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*']
  },
  routes: {
    pathMode: 'auto',
    allowOverride: false
  },
  typescript: {
    sourcemap: true,
    compilerOptions: {
      module: 'commonjs',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      moduleResolution: 'node',
      target: 'es2018',
      strict: false
    }
  }
};

// 在实际项目中使用
// 在项目根目录创建 mock.config.js 文件，内容如下：
/*
module.exports = {
  // 复制需要的配置...
};
*/ 