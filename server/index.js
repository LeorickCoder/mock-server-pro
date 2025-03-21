const express = require('express')
const bodyParser = require('body-parser')
const dispatcher = require('./dispatcher')
const createHotReloadWatcher = require('./hotReload')
const errorMiddleware = require('./middleware/error')
const timeoutMiddleware = require('./middleware/timeout')
const config = require('../config')
const logger = require('../utils/logger')

function createMockServer() {
  const app = express()

  // 基础中间件
  app.use(bodyParser.json({ limit: config.request.bodyLimit }))
  app.use(bodyParser.urlencoded({ 
    extended: true, 
    limit: config.request.bodyLimit 
  }))

  // 超时中间件
  app.use(timeoutMiddleware())

  // 分发中间件
  app.use(dispatcher.middleware())

  // 错误处理中间件
  app.use(errorMiddleware())

  return app
}

module.exports = function(app) {
  try {
    const mockApp = createMockServer()
    app.use(mockApp)

    // 开发环境下启用热更新
    if (config.hotReload.enabled) {
      createHotReloadWatcher(app, dispatcher)
      logger.info('Hot reload enabled')
    }
  } catch (error) {
    logger.error('Failed to initialize mock server:', error)
    throw error
  }
} 