const config = require('../../config')

function timeoutMiddleware() {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      const err = new Error('Request timeout')
      err.status = 408
      next(err)
    }, config.request.timeout)

    res.on('finish', () => clearTimeout(timeout))
    res.on('error', () => clearTimeout(timeout))
    next()
  }
}

module.exports = timeoutMiddleware 