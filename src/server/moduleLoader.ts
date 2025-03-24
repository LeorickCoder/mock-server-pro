import { MockDispatcher } from './dispatcher';
import { logger } from '../utils/logger';
import { Config } from '../types/core';
import path from 'path';
import { glob } from 'glob';
import { validateModule } from '../utils';

/**
 * 检测是否有ts-node环境
 */
function hasTsNode(): boolean {
  try {
    return typeof require !== 'undefined' && !!require.resolve('ts-node');
  } catch (e) {
    return false;
  }
}

/**
 * 检测是否有TypeScript环境
 */
function hasTypeScript(): boolean {
  try {
    return typeof require !== 'undefined' && !!require.resolve('typescript');
  } catch (e) {
    return false;
  }
}

/**
 * 检测是否在Vite环境
 */
function isViteEnvironment(): boolean {
  return typeof process !== 'undefined' && 
         typeof process.env !== 'undefined' && 
         (process.env.VITE_USER_NODE_ENV || process.env.VITE_DEV) !== undefined;
}

/**
 * 检测是否在Webpack环境
 */
function isWebpackEnvironment(): boolean {
  // 使用可选链避免未定义的访问错误
  return typeof (globalThis as any).__webpack_require__ !== 'undefined' || 
         typeof (globalThis as any).__non_webpack_require__ !== 'undefined';
}

/**
 * 检测运行环境
 */
function detectEnvironment(): {
  environment: 'node' | 'vite' | 'webpack' | 'browser' | 'unknown',
  hasTypeScript: boolean,
  hasTsNode: boolean
} {
  const result = {
    environment: 'unknown' as 'node' | 'vite' | 'webpack' | 'browser' | 'unknown',
    hasTypeScript: hasTypeScript(),
    hasTsNode: hasTsNode()
  };

  if (isViteEnvironment()) {
    result.environment = 'vite';
  } else if (isWebpackEnvironment()) {
    result.environment = 'webpack';
  } else if (typeof window !== 'undefined') {
    result.environment = 'browser';
  } else if (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && process.versions.node) {
    result.environment = 'node';
  }

  return result;
}

/**
 * 注册ts-node
 */
function registerTsNode(config: Config): void {
  if (hasTsNode() && !(global as any).__ts_node_registered) {
    try {
      // 避免重复注册
      (global as any).__ts_node_registered = true;
      
      // 获取ts-node并注册
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tsNodeModule = require('ts-node');
      
      // 合并配置
      const compilerOptions: Record<string, any> = {
        transpileOnly: true, // 只转译，不做类型检查，提高性能
        ...config.typescript?.compilerOptions
      };
      
      // 添加sourcemap支持
      if (config.typescript?.sourcemap) {
        compilerOptions.sourceMap = config.typescript.sourcemap;
      }
      
      // 注册ts-node
      tsNodeModule.register(compilerOptions);
      
      logger.info('Registered ts-node for TypeScript support');
    } catch (e) {
      logger.warn('Failed to register ts-node:', e);
    }
  }
}

/**
 * 动态模块加载器
 * 根据文件类型和环境选择最佳的加载策略
 */
async function dynamicImportModule(filePath: string, config: Config): Promise<any> {
  const ext = path.extname(filePath);
  const env = detectEnvironment();
  
  logger.debug(`Loading module: ${filePath}, Environment: ${env.environment}, TypeScript: ${env.hasTypeScript}, ts-node: ${env.hasTsNode}`);
  
  // 策略1: 如果是JS文件，直接require/import
  if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
    try {
      if (typeof require !== 'undefined' && require.extensions && require.extensions['.js']) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(filePath);
      } else {
        return await import(filePath);
      }
    } catch (e) {
      logger.error(`Failed to import JS module (${filePath}):`, e);
      throw e;
    }
  }
  
  // 策略2: 如果是TS文件且配置了自定义加载器
  if (ext === '.ts' && config.typescript?.loader) {
    try {
      logger.debug(`Using custom TypeScript loader for: ${filePath}`);
      return await config.typescript.loader(filePath);
    } catch (e) {
      logger.error(`Custom TypeScript loader failed for (${filePath}):`, e);
      // 继续尝试其他加载策略
    }
  }
  
  // 策略3: 如果是TS文件且我们在Node环境中有ts-node
  if (ext === '.ts' && env.environment === 'node' && env.hasTsNode) {
    try {
      // 确保ts-node已注册
      registerTsNode(config);
      logger.debug(`Loading TypeScript module with ts-node: ${filePath}`);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(filePath);
    } catch (e) {
      logger.error(`Failed to load TypeScript module with ts-node (${filePath}):`, e);
      // 继续尝试其他加载策略
    }
  }
  
  // 策略4: 如果是TS文件并且在Vite环境
  if (ext === '.ts' && env.environment === 'vite') {
    try {
      logger.debug(`Loading TypeScript module in Vite environment: ${filePath}`);
      return await import(filePath);
    } catch (e) {
      logger.error(`Failed to load TypeScript module in Vite environment (${filePath}):`, e);
      // 继续尝试其他加载策略
    }
  }
  
  // 策略5: 如果是TS文件并且在Webpack环境
  if (ext === '.ts' && env.environment === 'webpack') {
    try {
      logger.debug(`Loading TypeScript module in Webpack environment: ${filePath}`);
      return await import(filePath);
    } catch (e) {
      logger.error(`Failed to load TypeScript module in Webpack environment (${filePath}):`, e);
      // 继续尝试其他加载策略
    }
  }
  
  // 策略6: 尝试直接使用动态import (适用于其他环境或ESM)
  try {
    logger.debug(`Attempting direct dynamic import: ${filePath}`);
    return await import(filePath);
  } catch (e) {
    logger.error(`Direct dynamic import failed (${filePath}):`, e);
    
    // 如果是TS文件且没有合适环境，抛出友好错误
    if (ext === '.ts') {
      throw new Error(
        `无法加载TypeScript文件: ${filePath}\n` +
        `可能的解决方案:\n` +
        `1. 安装ts-node依赖: npm install --save-dev ts-node typescript\n` +
        `2. 在Vite/Webpack环境中确保已配置TypeScript支持\n` +
        `3. 提供自定义loader: config.typescript.loader\n` +
        `4. 使用.js文件替代.ts文件`
      );
    }
    
    // 其他情况，抛出原始错误
    throw e;
  }
}

/**
 * 加载并注册模块
 */
export async function loadModules(dispatcher: MockDispatcher, config: Config): Promise<void> {
  const { dir, pattern, ignore } = config.modules;
  const environment = detectEnvironment();
  
  // 注册TypeScript支持
  if (environment.hasTypeScript && environment.hasTsNode && !(global as any).__ts_node_registered) {
    registerTsNode(config);
  }

  // 获取所有模块文件
  const files = glob.sync(pattern, {
    cwd: dir,
    ignore,
    absolute: true,
    nodir: true
  });

  if (files.length === 0) {
    logger.warn(`No mock modules found in ${dir} with pattern ${pattern}`);
    return;
  }

  logger.info(`Found ${files.length} module files`);

  // 依次加载模块
  for (const filePath of files) {
    const relativePath = path.relative(dir, filePath);
    try {
      logger.debug(`Loading module: ${relativePath}`);
      
      // 动态导入模块
      const moduleExport = await dynamicImportModule(filePath, config);
      
      // 验证模块格式
      const moduleFunc = validateModule(moduleExport, filePath);
      
      // 创建上下文
      const context = dispatcher.createContext(filePath);
      
      // 执行模块
      await moduleFunc(context);
      
      logger.debug(`Module loaded successfully: ${relativePath}`);
    } catch (error) {
      logger.error(`Failed to load module ${relativePath}:`, error);
    }
  }

  // 输出注册信息
  logger.info('All modules loaded successfully');
  dispatcher.printRegistrations();
}

// 声明全局类型
/* eslint-disable-next-line no-var */
declare global {
  /* eslint-disable-next-line no-var */
  var __ts_node_registered: boolean;
}
