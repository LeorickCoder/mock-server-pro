const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const path = require('path')
const { createMockMiddleware } = require('mock-server-pro')
const config = require('./webpack.config')

const app = express()
const compiler = webpack(config)

// 使用 webpack-dev-middleware
app.use(webpackDevMiddleware(compiler, {
  publicPath: '/',
  stats: 'minimal'
}))

// 使用 webpack-hot-middleware
app.use(webpackHotMiddleware(compiler))

// 使用 mock-server-pro 中间件
const mockMiddleware = createMockMiddleware(app, {
  base: {
    prefix: '/api'
  },
  modules: {
    dir: './mock',
    pattern: '**/*.{js,ts}',
    recursive: true
  },
  hotReload: {
    enabled: true
  }
})

app.use(mockMiddleware)

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')))

// 所有其他请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 启动服务器
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) 