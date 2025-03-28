const express = require('express');
const path = require('path');
const { createMockServer } = require('./index');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 添加中间件解析JSON请求体
app.use(express.json({ limit: '5mb' }));
// 添加中间件解析URL编码的请求体
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 初始化异步函数
const initializeApp = async () => {
  try {
    // 配置日志记录级别
    process.env.LOG_LEVEL = 'debug';
    process.env.DEBUG = 'true';
    
    // 使用createMockServer创建一个mock服务器实例 - 使用自动前缀检测模式
    const mockServerApp = await createMockServer({
      base: {
        prefix: '/api',
        prefixConfig: {
          value: '/api',
          mode: 'auto',         // 自动检测模式
          detectBasePath: true  // 启用基路径检测
        }
      },
      modules: {
        dir: path.resolve(__dirname, './mocks'),
        pattern: '**/*.{js,ts}',
        recursive: true,
        ignore: ['**/node_modules/**', '**/.git/**', '**/*.d.ts', '**/*.test.*']
      },
      request: {
        timeout: 5000,
        maxConcurrent: 50,
        bodyLimit: '5mb'
      },
      hotReload: {
        enabled: true,
        ignored: ['**/node_modules/**', '**/.git/**'],
        stabilityThreshold: 500
      },
      routes: {
        pathMode: 'auto',       // 自动处理路径前缀
        allowOverride: false    // 不允许路由覆盖
      },
      typescript: {
        sourcemap: true,        // 启用源码映射，方便调试
        compilerOptions: {
          module: 'commonjs',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          moduleResolution: 'node',
          target: 'es2018',
          strict: false
        }
      },
      // 启用调试模式
      debug: true
    });
    
    // 方式1: 应用级挂载 - 直接挂载到根路径，让mock-server-pro内部处理前缀
    app.use(mockServerApp);
    
    // 方式2: 路由级挂载（下面这种方式也可以工作，取消注释并注释上面的行来尝试）
    // app.use('/api', mockServerApp);

    // 添加API文档路由 - 显示所有注册的API路由
    app.get('/mock-doc', (req, res) => {
      res.redirect('/');
    });

    // 静态文件服务
    app.use(express.static(path.join(__dirname, '../public')));

    // 主页路由
    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Mock Server Pro - Development</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
              }
              h1 { color: #0066cc; }
              h2 { color: #333; margin-top: 30px; }
              pre {
                background: #f4f4f4;
                padding: 10px;
                border-radius: 5px;
                overflow-x: auto;
              }
              .endpoint {
                margin-bottom: 15px;
                padding: 10px;
                border-left: 3px solid #0066cc;
                background: #f8f9fa;
              }
              .tabs {
                display: flex;
                margin-bottom: 15px;
                border-bottom: 1px solid #ddd;
              }
              .tab {
                padding: 8px 16px;
                cursor: pointer;
                border: 1px solid transparent;
                border-bottom: none;
              }
              .tab.active {
                background: #f8f9fa;
                border-color: #ddd;
                border-radius: 4px 4px 0 0;
              }
              .config-example {
                margin-top: 10px;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <h1>Mock Server Pro - 开发环境</h1>
            <p>此页面用于测试和开发 mock-server-pro 工具库。支持TypeScript和前缀自动检测。</p>
            
            <h2>可用 Mock API 端点：</h2>
            <div id="endpoints">加载中...</div>
            
            <h2>前缀处理模式：</h2>
            <div class="tabs">
              <div class="tab active" id="appendModeTab">应用级挂载</div>
              <div class="tab" id="mountModeTab">路由级挂载</div>
              <div class="tab" id="autoModeTab">自动检测模式</div>
            </div>
            
            <div id="appendMode" class="tab-content">
              <p><strong>应用级挂载模式</strong> - 使用 <code>app.use(mockServerApp)</code></p>
              <p>路由定义需要包含前缀 <code>/api</code>，或使用相对路径（系统会自动添加前缀）</p>
              <div class="config-example">
                <pre>
// 配置
const config = {
  base: {
    prefix: '/api',
    prefixConfig: { mode: 'append' }
  }
};

// 挂载
app.use(mockServerApp);

// 路由注册
ctx.registerRoute('get', '/api/users', handler);  // 完整路径
ctx.registerRoute('get', 'products', handler);    // 相对路径 -> /api/products
                </pre>
              </div>
            </div>
            
            <div id="mountMode" class="tab-content" style="display:none">
              <p><strong>路由级挂载模式</strong> - 使用 <code>app.use('/api', mockServerApp)</code></p>
              <p>路由定义不需要包含前缀 <code>/api</code>，因为已经在挂载时指定</p>
              <div class="config-example">
                <pre>
// 配置
const config = {
  base: {
    prefix: '/api',
    prefixConfig: { mode: 'mount' }
  }
};

// 挂载
app.use('/api', mockServerApp);

// 路由注册
ctx.registerRoute('get', 'users', handler);      // -> /api/users
ctx.registerRoute('get', '/api/products', handler); // 注意: -> /api/api/products (前缀重复)
                </pre>
              </div>
            </div>
            
            <div id="autoMode" class="tab-content" style="display:none">
              <p><strong>自动检测模式</strong> - 推荐</p>
              <p>系统会自动检测挂载方式，并适当处理路径前缀</p>
              <div class="config-example">
                <pre>
// 配置
const config = {
  base: {
    prefix: '/api',
    prefixConfig: { 
      mode: 'auto',
      detectBasePath: true 
    }
  }
};

// 挂载 - 两种方式均支持
app.use(mockServerApp);            // 或
app.use('/api', mockServerApp);

// 路由注册 - 推荐使用相对路径
ctx.registerRoute('get', 'users', handler);    // 系统会智能处理前缀
                </pre>
              </div>
            </div>
            
            <h2>使用说明：</h2>
            <p>
              1. 在 <code>src/mocks</code> 目录添加 mock 文件<br>
              2. 支持 TypeScript 文件，无需预编译<br>
              3. 服务器会自动热重载<br>
              4. 使用 VS Code 调试功能进行调试
            </p>
            
            <h2>测试工具：</h2>
            <p>
              <a href="/http-test.html" style="display: inline-block; padding: 10px 15px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px;">HTTP方法测试工具</a>
              测试各种HTTP方法（GET, POST, PUT, DELETE等）是否正常工作
            </p>
            
            <script>
              // 切换标签页
              document.addEventListener('DOMContentLoaded', function() {
                const tabContents = {
                  'appendModeTab': 'appendMode',
                  'mountModeTab': 'mountMode',
                  'autoModeTab': 'autoMode'
                };
                
                function showTab(tabId) {
                  Object.values(tabContents).forEach(contentId => {
                    document.getElementById(contentId).style.display = 'none';
                  });
                  
                  document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('active');
                  });
                  
                  document.getElementById(tabContents[tabId]).style.display = 'block';
                  document.getElementById(tabId).classList.add('active');
                }
                
                // 给标签添加点击事件
                Object.keys(tabContents).forEach(tabId => {
                  document.getElementById(tabId).addEventListener('click', function() {
                    showTab(tabId);
                  });
                });
                
                // 默认显示第一个标签页
                showTab('appendModeTab');
                
                // 获取并显示可用的API端点
                fetch('/api/mock-info')
                  .then(response => response.json())
                  .then(data => {
                    const endpointsEl = document.getElementById('endpoints');
                    if (data && data.routes && data.routes.length) {
                      endpointsEl.innerHTML = data.routes.map(route => {
                        return \`
                          <div class="endpoint">
                            <strong>\${route.method.toUpperCase()}</strong>: 
                            <code>\${route.path}</code>
                          </div>
                        \`;
                      }).join('');
                    } else {
                      endpointsEl.innerHTML = '<p>没有找到可用的API端点。请添加mock文件。</p>';
                    }
                  })
                  .catch(err => {
                    document.getElementById('endpoints').innerHTML = 
                      '<p>无法获取API端点信息。请确保服务器正在运行。</p>';
                    console.error('Error fetching API info:', err);
                  });
              });
            </script>
          </body>
        </html>
      `);
    });

    // 404处理
    app.use((req, res) => {
      res.status(404).send('Not found');
    });

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`开发服务器运行在: http://localhost:${PORT}`);
      console.log(`使用 http://localhost:${PORT}/api/... 访问模拟API`);
      console.log(`使用 http://localhost:${PORT} 访问开发界面`);
      console.log(`按Ctrl+C停止服务器`);
    });

    console.log('服务器初始化完成');
  } catch (error) {
    console.error('服务器初始化失败:', error);
    console.error(error);
  }
};

// 仅在直接运行时启动服务器
if (require.main === module) {
  initializeApp();
}

// 导出Express应用供Vite使用
module.exports = { app }; 