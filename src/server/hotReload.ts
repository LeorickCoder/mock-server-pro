import chokidar from 'chokidar'
import { logger } from '../utils/logger'
import { MockDispatcher } from './dispatcher'
import { Config } from '../types/core'
import { loadModules } from './moduleLoader'
export function createHotReloadWatcher(dispatcher: MockDispatcher, config: Config): void {
  const { dir, pattern, recursive, ignore } = config.modules
  const { stabilityThreshold = 1000, pollInterval = 100 } = config.hotReload

  let reloadTimeout: NodeJS.Timeout | null = null

  const fileWatcher = chokidar.watch(pattern, {
    cwd: dir,
    ignored: [...ignore, ...config.hotReload.ignored],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold,
      pollInterval
    }
  })

  fileWatcher
    .on('add', (filePath) => {
      logger.debug('File added:', { file: filePath })
      scheduleReload()
    })
    .on('change', (filePath) => {
      logger.debug('File changed:', { file: filePath })
      scheduleReload()
    })
    .on('unlink', (filePath) => {
      logger.debug('File removed:', { file: filePath })
      scheduleReload()
    })
    .on('error', (error) => {
      logger.error('Watcher error:', { error })
    })

  function scheduleReload() {
    if (reloadTimeout) {
      clearTimeout(reloadTimeout)
    }

    reloadTimeout = setTimeout(async () => {
      try {
        logger.info('Reloading modules...')
        dispatcher.clearAllRoutes()
        await loadModules(dispatcher, config)
        logger.info('Modules reloaded successfully')
      } catch (error) {
        logger.error('Failed to reload modules:', { error })
      }
    }, stabilityThreshold)
  }

  // 清理函数
  process.on('exit', () => {
    fileWatcher.close()
    if (reloadTimeout) {
      clearTimeout(reloadTimeout)
    }
  })
} 