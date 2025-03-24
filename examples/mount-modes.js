/**
 * mock-server-pro 挂载模式示例
 * 
 * 本文件展示不同的挂载方式和前缀处理模式
 */

// ====================================
// 1. 应用级挂载示例（Append 模式）
// ====================================

// 配置
const appendModeConfig = {
  base: {
    prefix: '/api',
    prefixConfig: {
      value: '/api',
      mode: 'append'  // 使用 append 模式
    }
  }
};

// 在 Express 中使用
// app.use(createMockMiddleware(app, appendModeConfig));

// 写模块时的路由注册方式
function appendModeModuleExample(ctx) {
  // 方式1: 使用完整路径（包含前缀）
  ctx.registerRoute('get', '/api/users', (req, res) => {
    res.json({ users: [] });
  });
  
  // 方式2: 使用相对路径（自动添加前缀）
  ctx.registerRoute('get', 'products', (req, res) => {
    // 最终路径: /api/products
    res.json({ products: [] });
  });
}

// ====================================
// 2. 路由级挂载示例（Mount 模式）
// ====================================

// 配置
const mountModeConfig = {
  base: {
    prefix: '/api',
    prefixConfig: {
      value: '/api',
      mode: 'mount'  // 使用 mount 模式
    }
  }
};

// 在 Express 中使用 - 注意路径前缀
// app.use('/api', createMockMiddleware(app, mountModeConfig));

// 写模块时的路由注册方式
function mountModeModuleExample(ctx) {
  // 方式1: 使用相对路径（不含前缀，因为已在挂载时指定）
  ctx.registerRoute('get', 'users', (req, res) => {
    // 最终路径: /api/users
    res.json({ users: [] });
  });
  
  // 方式2: 也可以使用完整路径（兼容性好，但路径会重复）
  ctx.registerRoute('get', '/api/products', (req, res) => {
    // 最终路径: /api/api/products（注意前缀重复！）
    res.json({ products: [] });
  });
}

// ====================================
// 3. 自动检测模式（推荐）
// ====================================

// 配置
const autoModeConfig = {
  base: {
    prefix: '/api',
    prefixConfig: {
      value: '/api',
      mode: 'auto',        // 使用自动模式
      detectBasePath: true // 开启基路径检测
    }
  }
};

// 在 Express 中使用 - 两种方式均可
// app.use('/api', createMockMiddleware(app, autoModeConfig));  // 路由级挂载
// 或
// app.use(createMockMiddleware(app, autoModeConfig));         // 应用级挂载

// 写模块时的路由注册方式 - 统一使用相对路径最安全
function autoModeModuleExample(ctx) {
  // 统一使用相对路径，让系统自动处理前缀
  ctx.registerRoute('get', 'users', (req, res) => {
    res.json({ users: [] });
  });
  
  ctx.registerRoute('get', 'products', (req, res) => {
    res.json({ products: [] });
  });
}

// ====================================
// Vite 集成示例
// ====================================

/* 
// vite.config.js
import { defineConfig } from 'vite';
import { createMockMiddleware } from 'mock-server-pro';

export default defineConfig({
  server: {
    proxy: {
      // 代理到mock服务
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    // 两种方式均可
    setupMiddlewares: [
      async (middlewares, server) => {
        // 应用级挂载
        await createMockMiddleware(server.middlewares, {
          base: {
            prefix: '/api',
            prefixConfig: { mode: 'append' }
          }
        });
        
        // 或使用路由级挂载
        // await createMockMiddleware(server.middlewares, {
        //   base: {
        //     prefix: '/api',
        //     prefixConfig: { mode: 'mount' }
        //   }
        // });
        
        return middlewares;
      }
    ]
  }
});
*/

// ====================================
// Webpack 集成示例
// ====================================

/*
// webpack.config.js
module.exports = {
  devServer: {
    // 方式1: 应用级挂载
    onBeforeSetupMiddleware: async (devServer) => {
      const { app } = devServer;
      
      await createMockMiddleware(app, {
        base: {
          prefix: '/api',
          prefixConfig: { mode: 'append' }
        }
      });
    }
    
    // 方式2: 路由级挂载
    // onBeforeSetupMiddleware: async (devServer) => {
    //   const { app } = devServer;
    //   
    //   await createMockMiddleware(app, {
    //     base: {
    //       prefix: '/api',
    //       prefixConfig: { mode: 'mount' }
    //     }
    //   });
    //   
    //   // 或使用自动模式（推荐）
    //   // await createMockMiddleware(app, {
    //   //   base: {
    //   //     prefix: '/api', 
    //   //     prefixConfig: { mode: 'auto', detectBasePath: true }
    //   //   }
    //   // });
    // }
  }
};
*/

// 导出示例配置
module.exports = {
  appendModeConfig,
  mountModeConfig,
  autoModeConfig
}; 