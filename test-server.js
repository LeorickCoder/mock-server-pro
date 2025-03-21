const express = require('express')
const path = require('path')
const mockServer = require('./server')
const config = require('./config')
const logger = require('./utils/logger')

const app = express()
const port = process.env.PORT || 3000

// 添加 CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

// 初始化 mock 服务
mockServer(app)

// 添加测试页面路由
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Mock Server Test Page</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .endpoint { margin-bottom: 20px; }
          pre { background: #f5f5f5; padding: 10px; }
        </style>
      </head>
      <body>
        <h1>Mock Server Test Page</h1>
        <div class="endpoint">
          <h3>Available Endpoints:</h3>
          <pre id="endpoints">Loading...</pre>
        </div>
        <script>
          // 获取所有注册的路由
          fetch('/api/_routes')
            .then(res => res.json())
            .then(routes => {
              document.getElementById('endpoints').textContent = 
                JSON.stringify(routes, null, 2)
            })
            .catch(err => console.error('Failed to load routes:', err))
        </script>
      </body>
    </html>
  `)
})

// 添加路由查看接口
app.get('/api/_routes', (req, res) => {
  const routes = Array.from(app._router.stack)
    .filter(r => r.route)
    .map(r => ({
      path: r.route.path,
      method: Object.keys(r.route.methods)[0].toUpperCase()
    }))
  res.json(routes)
})

app.listen(port, () => {
  logger.info(`Mock server is running at http://localhost:${port}`)
  logger.info(`API prefix: ${config.base.prefix}`)
}) 