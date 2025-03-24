import { Config } from '../types/core'
import path from 'path'
import fs from 'fs'

export const defaultConfig: Config = {
  base: {
    prefix: '/api',
    prefixConfig: {
      value: '/api',
      mode: 'auto',
      detectBasePath: true
    }
  },
  request: {
    timeout: 30000,
    maxConcurrent: 100,
    bodyLimit: '1mb'
  },
  hotReload: {
    enabled: process.env.NODE_ENV === 'development',
    ignored: ['**/node_modules/**', '**/.git/**'],
    stabilityThreshold: 1000,
    pollInterval: 100
  },
  modules: {
    dir: path.join(process.cwd(), 'modules'),
    pattern: '**/*.{js,ts}',
    recursive: true,
    ignore: ['**/node_modules/**', '**/.git/**', '**/*.d.ts', '**/*.test.*']
  },
  routes: {
    allowOverride: false,
    pathMode: 'auto'
  },
  typescript: {
    sourcemap: true,
    compilerOptions: {
      module: 'commonjs',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      moduleResolution: 'node',
      target: 'es2018',
      strict: false
    }
  }
}

// 配置初始化后同步前缀值
export function initConfig(config: Config): Config {
  // 确保前缀配置同步
  if (!config.base.prefixConfig) {
    config.base.prefixConfig = {
      value: config.base.prefix,
      mode: 'auto',
      detectBasePath: true
    }
  } else if (!config.base.prefixConfig.value) {
    config.base.prefixConfig.value = config.base.prefix
  }
  
  return config
}

export function loadConfig(): Partial<Config> {
  const configPath = path.join(process.cwd(), 'mock.config.js')
  
  if (fs.existsSync(configPath)) {
    try {
      return require(configPath)
    } catch (error) {
      console.error('Failed to load mock.config.js:', error)
    }
  }
  
  return {}
} 