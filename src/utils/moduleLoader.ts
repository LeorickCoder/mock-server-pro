import path from 'path';
import { MockDispatcher } from '../server/dispatcher';
import { logger } from './logger';
import { validateModule } from './index';
import { Config } from '../types/core';
import { glob } from 'glob';

export async function loadModules(dispatcher: MockDispatcher, config: Config): Promise<void> {
  const { dir, pattern, ignore } = config.modules;

  try {
    const files = await glob(pattern, {
      cwd: dir,
      ignore,
      nodir: true,
      absolute: true,
    });

    for (const file of files) {
      try {
        const modulePath = path.relative(process.cwd(), file);
        const module = await import(file);
        validateModule(module, file);

        const context = dispatcher.createContext(modulePath);
        await module.default(context);

        logger.debug(`Loaded module: ${modulePath}`);
      } catch (error) {
        logger.error(`Failed to load module ${file}:`, { error });
      }
    }
  } catch (error) {
    logger.error('Failed to load modules:', { error });
    throw error;
  }
}
