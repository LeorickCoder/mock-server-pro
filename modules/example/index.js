module.exports = function(dispatcher) {
  // 注册路由
  dispatcher.registerRoute('GET', '/api/example', (req, res) => {
    res.json({
      code: 200,
      data: {
        time: Date.now(),
        message: 'This is an example'
      }
    })
  })

  // 注册中间件
  dispatcher.registerMiddleware('/api/example', (req, res, next) => {
    console.log('Example middleware')
    next()
  })
} 