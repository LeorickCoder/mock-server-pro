/**
 * mock-server-pro TypeScript 配置示例
 * 
 * 此文件展示了如何配置 mock-server-pro 以获得最佳的 TypeScript 支持
 */

const { createMockServer } = require('mock-server-pro');

// 基本配置，启用 TypeScript 支持
const basicConfig = {
  modules: {
    dir: './modules',
    pattern: '**/*.{js,ts}',
    recursive: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*']
  },
  typescript: {
    // 启用源码映射，支持调试
    sourcemap: true
  }
};

// 高级配置，自定义 TypeScript 编译选项
const advancedConfig = {
  modules: {
    dir: './modules',
    pattern: '**/*.{js,ts}',
    recursive: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*']
  },
  typescript: {
    sourcemap: true,
    // 自定义 TypeScript 编译器选项
    compilerOptions: {
      // 指定模块系统
      module: 'commonjs',
      // 启用 ES 模块互操作性
      esModuleInterop: true,
      // 允许默认导入
      allowSyntheticDefaultImports: true,
      // 严格模式
      strict: true,
      // 目标 ECMAScript 版本
      target: 'es2020',
      // 模块解析策略
      moduleResolution: 'node',
      // 实验性装饰器
      experimentalDecorators: true,
      // 支持 JSON 导入
      resolveJsonModule: true
    }
  }
};

// 创建自定义 TypeScript 加载器的配置
const customLoaderConfig = {
  modules: {
    dir: './modules',
    pattern: '**/*.{js,ts}',
    recursive: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*']
  },
  typescript: {
    sourcemap: true,
    // 自定义加载器函数
    loader: async (filePath) => {
      // 示例: 使用自定义的 TypeScript 转译器
      // 注意: 这只是一个示例，实际实现会有所不同
      const ts = require('typescript');
      const fs = require('fs');
      
      // 读取文件内容
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // 编译 TypeScript 代码
      const { outputText } = ts.transpileModule(fileContent, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          esModuleInterop: true
        },
        fileName: filePath
      });
      
      // 创建一个临时模块
      const Module = require('module');
      const tmpModule = new Module(filePath);
      tmpModule.filename = filePath;
      
      // 加载编译后的代码
      tmpModule._compile(outputText, filePath);
      
      // 返回模块导出
      return tmpModule.exports;
    }
  }
};

// 在不同环境中的推荐配置

// Node.js 环境推荐
const nodeEnvironmentConfig = {
  ...basicConfig,
  // 在 Node.js 环境中，推荐安装 ts-node 和 typescript
  // npm install --save-dev ts-node typescript
};

// Vite 环境推荐
const viteEnvironmentConfig = {
  ...basicConfig,
  // Vite 已内置 TypeScript 支持，无需额外配置
};

// Webpack 环境推荐
const webpackEnvironmentConfig = {
  ...basicConfig,
  // 确保在 Webpack 配置中已经配置了 ts-loader 或 babel-loader 处理 TypeScript
};

// 示例: 创建带 TypeScript 支持的服务器
async function createServerExample() {
  const app = await createMockServer(basicConfig);
  app.listen(3000, () => {
    console.log('Mock server with TypeScript support is running at http://localhost:3000');
  });
}

// 注意: 这只是配置示例，不会被直接执行
module.exports = {
  basicConfig,
  advancedConfig,
  customLoaderConfig,
  nodeEnvironmentConfig,
  viteEnvironmentConfig,
  webpackEnvironmentConfig
}; 