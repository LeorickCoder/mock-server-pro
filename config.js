// 统一配置文件
const config = {
  // 基础配置
  base: {
    prefix: '/api',
    debug: process.env.NODE_ENV === 'development',
    timeout: 5000,
    maxConcurrent: 10
  },
  
  // 请求处理配置
  request: {
    bodyLimit: '1mb',
    timeout: 5000,
    maxConcurrent: 10
  },
  
  // 响应配置
  response: {
    wrapper: true,
    defaultCode: 200
  },
  
  // 文件上传配置
  upload: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png']
  },

  // 热更新配置
  hotReload: {
    enabled: process.env.NODE_ENV === 'development',
    watchDirs: ['modules', 'server/middleware'],
    ignored: ['**/utils/**', '**/node_modules/**', '**/.git/**']
  },

  // 错误处理配置
  error: {
    showStack: process.env.NODE_ENV === 'development',
    logErrors: true
  }
}

// 配置验证
function validateConfig(config) {
  const required = ['base', 'request', 'hotReload']
  for (const key of required) {
    if (!(key in config)) {
      throw new Error(`Missing required config section: ${key}`)
    }
  }
  
  if (!config.base.prefix) {
    throw new Error('API prefix is required')
  }
}

validateConfig(config)
module.exports = config 