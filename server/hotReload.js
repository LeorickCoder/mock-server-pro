const chokidar = require('chokidar')
const path = require('path')
const logger = require('../utils/logger')
const config = require('../config')

// 保持一个全局的 watcher 实例
let globalWatcher = null

function createHotReloadWatcher(app, dispatcher) {
  const mockDir = path.join(__dirname, '../')
  const serverDir = path.normalize(path.join(mockDir, 'server'))
  const modulesDir = path.normalize(path.join(mockDir, 'modules'))

  function handleFileChange(filePath) {
    const normalizedPath = path.normalize(filePath)

    try {
      // 清除模块缓存
      delete require.cache[require.resolve(filePath)]

      // 清除该模块的注册
      dispatcher.clearModule(normalizedPath)

      // 重新加载模块
      if (normalizedPath.startsWith(path.normalize(modulesDir))) {
        const module = require(filePath)
        if (typeof module === 'function') {
          module(dispatcher)
          logger.info(`Hot reloaded module: ${filePath}`)
        } else {
          logger.warn(`Invalid module format: ${filePath}`)
        }
      }
    } catch (error) {
      logger.error(`Hot reload failed: ${filePath}`, error)
    }
  }

  // 如果已经存在 watcher，先关闭它
  if (globalWatcher) {
    logger.debug('Closing existing watcher')
    globalWatcher.close()
  }

  // 创建新的 watcher，使用内置的防抖功能
  globalWatcher = chokidar.watch([path.join(modulesDir, '**/*.js'), path.join(serverDir, 'middleware/**/*.js')], {
    ignored: config.hotReload.ignored,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  })

  // 绑定事件处理
  globalWatcher
    .on('change', handleFileChange)
    .on('error', (error) => {
      logger.error('Watcher error:', error)
    })
    .on('ready', () => {
      logger.info('Initial scan complete. Ready for changes')
    })

  // 注册进程退出时的清理
  process.on('SIGINT', () => {
    if (globalWatcher) {
      logger.debug('Closing watcher on process exit')
      globalWatcher.close()
    }
    process.exit(0)
  })

  return globalWatcher
}

module.exports = createHotReloadWatcher
