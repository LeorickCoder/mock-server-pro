/**
 * 环境检测工具
 * 用于帮助用户诊断环境检测相关的问题
 */
import { logger } from './logger';
import path from 'path';
import fs from 'fs';

/**
 * 环境类型定义
 */
export type Environment = 'node' | 'vite' | 'webpack' | 'browser' | 'unknown';

/**
 * 环境检测结果接口
 */
export interface EnvironmentInfo {
  /** 当前运行环境 */
  environment: Environment;
  /** 是否支持TypeScript */
  hasTypeScript: boolean;
  /** 是否支持ts-node */
  hasTsNode: boolean;
  /** 详细的环境信息 */
  details: Record<string, unknown>;
}

/**
 * 检测当前项目是否安装了指定包
 * @param packageName 包名
 * @returns 是否已安装
 */
function isPackageInstalledInProject(packageName: string): boolean {
  try {
    // 尝试多种可能的位置查找node_modules
    const possiblePaths = [
      // 当前工作目录
      path.join(process.cwd(), 'node_modules', packageName),
      // 父级目录 (monorepo情况)
      path.join(process.cwd(), '..', 'node_modules', packageName),
      // 根目录 (全局安装情况)
      path.join('/', 'node_modules', packageName)
    ];

    // 检查包是否在任一位置存在
    return possiblePaths.some(pkgPath => {
      try {
        return fs.existsSync(pkgPath) && fs.statSync(pkgPath).isDirectory();
      } catch (e) {
        return false;
      }
    });
  } catch (e) {
    return false;
  }
}

/**
 * 检测TypeScript包是否在项目中已安装
 */
function typescriptExists(): boolean {
  try {
    // 1. 检查node_modules中是否存在包
    const inNodeModules = isPackageInstalledInProject('typescript');
    if (inNodeModules) return true;

    // 2. 检查package.json中的依赖
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const hasTsInDependencies = packageJson.dependencies?.typescript || 
                                    packageJson.devDependencies?.typescript;
        if (hasTsInDependencies) return true;
      }
    } catch (e) {
      // 忽略package.json解析错误
    }

    // 3. 检查tsconfig.json是否存在
    try {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) return true;
    } catch (e) {
      // 忽略文件访问错误
    }

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * 增强版检测是否有ts-node环境
 */
export function hasTsNode(): boolean {
  try {
    // 方法1: 尝试直接解析模块
    try {
      if (typeof require !== 'undefined' && !!require.resolve('ts-node')) {
        logger.debug('ts-node detected via require.resolve');
        return true;
      }
    } catch (e) {
      // 继续尝试其他方法
    }
    
    // 方法2: 检查项目node_modules中是否存在
    if (typeof process !== 'undefined' && isPackageInstalledInProject('ts-node')) {
      logger.debug('ts-node detected in node_modules');
      return true;
    }

    // 方法3: 检查全局变量
    if (typeof global !== 'undefined' && (global as any).__ts_node_registered) {
      logger.debug('ts-node detected via global __ts_node_registered');
      return true;
    }

    return false;
  } catch (e) {
    logger.debug('Error during ts-node detection:', e);
    return false;
  }
}

/**
 * 增强版检测是否有TypeScript环境
 */
export function hasTypeScript(): boolean {
  try {
    // 方法1: 尝试直接解析模块
    try {
      if (typeof require !== 'undefined' && !!require.resolve('typescript')) {
        logger.debug('TypeScript detected via require.resolve');
        return true;
      }
    } catch (e) {
      // 继续尝试其他方法
    }
    
    // 方法2: 检查环境是否为Vite或Webpack (它们内部包含TS处理能力)
    if (isViteEnvironment()) {
      logger.debug('TypeScript support assumed in Vite environment');
      return true;
    }
    
    if (isWebpackEnvironment()) {
      logger.debug('TypeScript support assumed in Webpack environment');
      return true;
    }
    
    // 方法3: 检查文件系统中是否存在TypeScript
    if (typeof process !== 'undefined' && typescriptExists()) {
      logger.debug('TypeScript detected in project');
      return true;
    }

    return false;
  } catch (e) {
    logger.debug('Error during TypeScript detection:', e);
    return false;
  }
}

/**
 * 检测是否在Vite环境
 */
export function isViteEnvironment(): boolean {
  // 检查常见的Vite特定环境变量
  const hasViteEnvVars = typeof process !== 'undefined' && 
    typeof process.env !== 'undefined' && 
    (process.env.VITE_USER_NODE_ENV !== undefined || 
     process.env.VITE_DEV !== undefined || 
     process.env.VITE !== undefined);

  // 检查是否有Vite特定的全局对象或模块
  const hasViteModules = typeof (globalThis as any).__vite_plugin_vue !== 'undefined' ||
    (typeof process !== 'undefined' && process.env.npm_lifecycle_script?.includes('vite'));
  
  // 检查导入元数据，Vite设置了特殊的import.meta属性 - 在CommonJS环境中不安全，暂时禁用
  let hasViteImportMeta = false;
  
  // 检查项目中是否有vite.config.js/ts
  let hasViteConfig = false;
  try {
    if (typeof process !== 'undefined') {
      const possibleConfigs = [
        path.join(process.cwd(), 'vite.config.js'),
        path.join(process.cwd(), 'vite.config.ts'),
        path.join(process.cwd(), 'vite.config.mjs')
      ];
      
      hasViteConfig = possibleConfigs.some(configPath => {
        try {
          return fs.existsSync(configPath);
        } catch (e) {
          return false;
        }
      });
    }
  } catch (e) {
    // 忽略文件系统错误
  }

  return hasViteEnvVars || hasViteModules || hasViteImportMeta || hasViteConfig;
}

/**
 * 检测是否在Webpack环境
 */
export function isWebpackEnvironment(): boolean {
  // 检查Webpack特定的全局对象
  const hasWebpackGlobals = typeof (globalThis as any).__webpack_require__ !== 'undefined' || 
                           typeof (globalThis as any).__non_webpack_require__ !== 'undefined';
  
  // 检查是否有Webpack的模块热更新对象
  const hasWebpackHMR = typeof (module as any)?.hot !== 'undefined';
  
  // 检查npm脚本是否包含webpack
  const hasWebpackScript = typeof process !== 'undefined' && 
                          process.env.npm_lifecycle_script?.includes('webpack');
                          
  // 检查项目中是否有webpack.config.js
  let hasWebpackConfig = false;
  try {
    if (typeof process !== 'undefined') {
      const possibleConfigs = [
        path.join(process.cwd(), 'webpack.config.js'),
        path.join(process.cwd(), 'webpack.config.ts')
      ];
      
      hasWebpackConfig = possibleConfigs.some(configPath => {
        try {
          return fs.existsSync(configPath);
        } catch (e) {
          return false;
        }
      });
    }
  } catch (e) {
    // 忽略文件系统错误
  }

  return hasWebpackGlobals || hasWebpackHMR || hasWebpackScript || hasWebpackConfig;
}

/**
 * 检测运行环境
 */
export function detectEnvironment(): EnvironmentInfo {
  const details: Record<string, unknown> = {
    nodeVersion: typeof process !== 'undefined' && process.versions ? process.versions.node : undefined,
    npmLifecycleScript: typeof process !== 'undefined' ? process.env.npm_lifecycle_script : undefined,
    isVite: {
      hasViteEnvVars: typeof process !== 'undefined' && 
        (process.env.VITE_USER_NODE_ENV !== undefined || 
        process.env.VITE_DEV !== undefined || 
        process.env.VITE !== undefined),
      hasViteModules: typeof (globalThis as any).__vite_plugin_vue !== 'undefined',
      hasViteScript: typeof process !== 'undefined' && process.env.npm_lifecycle_script?.includes('vite'),
      // 安全地检查import.meta
      hasViteImportMeta: false // 不安全，在CommonJS中禁用
    },
    isWebpack: {
      hasWebpackGlobals: typeof (globalThis as any).__webpack_require__ !== 'undefined',
      hasWebpackHMR: typeof (module as any)?.hot !== 'undefined',
      hasWebpackScript: typeof process !== 'undefined' && process.env.npm_lifecycle_script?.includes('webpack')
    },
    environment: {}
  };

  const hasTs = hasTypeScript();
  const hasTsNodeAvailable = hasTsNode();

  const result: EnvironmentInfo = {
    environment: 'unknown',
    hasTypeScript: hasTs,
    hasTsNode: hasTsNodeAvailable,
    details
  };

  // 优先检查构建工具环境
  if (isViteEnvironment()) {
    result.environment = 'vite';
    logger.debug('Detected Vite environment');
  } else if (isWebpackEnvironment()) {
    result.environment = 'webpack';
    logger.debug('Detected Webpack environment');
  } 
  // 如果不是特定构建工具，则判断是浏览器还是Node环境
  else if (typeof window !== 'undefined') {
    result.environment = 'browser';
    logger.debug('Detected browser environment');
  } else if (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && process.versions.node) {
    result.environment = 'node';
    logger.debug('Detected Node.js environment');
  }

  return result;
}

/**
 * 打印环境诊断信息
 */
export function printEnvironmentDiagnostics(): void {
  const env = detectEnvironment();
  
  logger.info('===== Environment Diagnostics =====');
  logger.info(`Detected Environment: ${env.environment}`);
  logger.info(`TypeScript Support: ${env.hasTypeScript ? 'Yes' : 'No'}`);
  logger.info(`ts-node Support: ${env.hasTsNode ? 'Yes' : 'No'}`);
  
  logger.debug('Detailed Environment Info:', JSON.stringify(env.details, null, 2));
  logger.info('==================================');
}

export default {
  detectEnvironment,
  isViteEnvironment,
  isWebpackEnvironment,
  hasTsNode,
  hasTypeScript,
  printEnvironmentDiagnostics
}; 