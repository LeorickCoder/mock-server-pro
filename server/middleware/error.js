const logger = require('../../utils/logger')
const config = require('../../config')

function errorMiddleware() {
  return (err, req, res, next) => {
    logger.error('Request error:', err)

    const response = {
      code: err.status || 500,
      message: err.message || '服务器内部错误',
      error: config.error.showStack ? err.stack : undefined
    }

    res.status(response.code).json(response)
  }
}

module.exports = errorMiddleware 