const express = require('express')
const cors = require('./cors')
const upload = require('./upload')

const registerMiddleware = (app) => {
  // 基础中间件
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  
  // CORS 中间件
  app.use(cors)
  
  // 请求日志中间件
  app.use((req, res, next) => {
    console.log(`[Mock] ${req.method} ${req.path}`)
    next()
  })
  
  // 错误处理中间件
  app.use((err, req, res, next) => {
    console.error('[Mock Error]', err)
    res.status(500).send({
      code: 500,
      message: err.message || '服务器内部错误',
      data: null
    })
  })
  
  // 文件上传中间件
  app.use('/upload', upload)
}

// 建议添加中间件顺序控制
const middlewareOrder = [
  'cors',
  'bodyParser',
  'timeout',
  'mock',
  'error'
]

// 添加中间件注册验证
function validateMiddleware(middleware) {
  if (typeof middleware !== 'function') {
    throw new Error('Middleware must be a function')
  }
}

module.exports = {
  registerMiddleware
}

// 测试 GET 请求
fetch('/api/test')
  .then(res => res.json())
  .then(data => console.log('GET 测试:', data))

// 测试文件上传
const formData = new FormData()
formData.append('file', new File(['test'], 'test.txt', { type: 'text/plain' }))

fetch('/api/test/upload', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => console.log('上传测试:', data))