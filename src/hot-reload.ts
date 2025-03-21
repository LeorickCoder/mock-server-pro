import chokidar from 'chokidar';
import { logger } from './utils/logger';

export function setupHotReload(watchDir: string): void {
  const watcher = chokidar.watch(watchDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  watcher
    .on('add', path => logger.info(`File ${path} has been added`))
    .on('change', path => {
      logger.info(`File ${path} has been changed`);
      // 清除模块缓存
      delete require.cache[require.resolve(path)];
    })
    .on('unlink', path => logger.info(`File ${path} has been removed`));

  process.on('SIGINT', () => {
    watcher.close();
    process.exit();
  });
} 