export interface LoggerConfig {
  prefix?: string
  debug?: boolean
  timestamp?: boolean
  level?: 'debug' | 'info' | 'warn' | 'error'
}

class MockLogger {
  private prefix: string
  private isDebug: boolean
  private showTimestamp: boolean

  constructor(config: LoggerConfig = {}) {
    this.prefix = config.prefix || '[Mock]'
    this.isDebug = config.debug ?? process.env.NODE_ENV === 'development'
    this.showTimestamp = config.timestamp ?? true
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const parts = [this.prefix]
    
    if (this.showTimestamp) {
      parts.push(new Date().toISOString())
    }
    
    parts.push(`[${level}]`, message)
    
    // 如果有额外参数，添加到消息中
    if (args.length > 0) {
      parts.push(...args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ))
    }
    
    return parts.join(' ')
  }

  debug(message: string, ...args: any[]): void {
    if (this.isDebug) {
      console.debug(this.formatMessage('DEBUG', message, ...args))
    }
  }

  info(message: string, ...args: any[]): void {
    console.info(this.formatMessage('INFO', message, ...args))
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message, ...args))
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message, ...args))
  }

  // 创建新的 logger 实例，继承当前配置
  create(config: LoggerConfig = {}): MockLogger {
    return new MockLogger({
      prefix: config.prefix ?? this.prefix,
      debug: config.debug ?? this.isDebug,
      timestamp: config.timestamp ?? this.showTimestamp
    })
  }
}

// 创建默认 logger 实例
export const logger = new MockLogger() 