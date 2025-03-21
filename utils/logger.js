// 添加统一的日志处理
class Logger {
  constructor(options = {}) {
    this.debug = options.debug || process.env.NODE_ENV === 'development'
    this.prefix = options.prefix || '[Mock]'
  }

  info(msg, ...args) {
    console.log(`${this.prefix} ${msg}`, ...args)
  }

  error(msg, error) {
    console.error(`${this.prefix} Error: ${msg}`, error)
  }

  debug(msg, ...args) {
    if (this.debug) {
      console.log(`${this.prefix} Debug: ${msg}`, ...args)
    }
  }

  warn(msg, ...args) {
    console.warn(`${this.prefix} Warning: ${msg}`, ...args)
  }
}

module.exports = new Logger() 