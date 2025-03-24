import express from 'express';
import { MockDispatcher } from './dispatcher';
import { createHotReloadWatcher } from './hotReload';
import { logger } from '../utils/logger';
import { defaultConfig, loadConfig, initConfig } from '../config';
import { Config } from '../types/core';
import { loadModules } from './moduleLoader';

export const createMockMiddleware = async (app: express.Application, options: Partial<Config> = {}) => {
  logger.info('Creating mock middleware...');
  // 加载并初始化配置
  let config = { ...defaultConfig, ...loadConfig(), ...options };
  config = initConfig(config);
  
  // 创建 dispatcher 单例
  const dispatcher = MockDispatcher.getInstance(config);
  logger.info('Mock dispatcher initialized');

  // 注册 mock 路由 - 使用前缀配置的模式
  const prefixConfig = config.base.prefixConfig;
  if (prefixConfig && prefixConfig.mode === 'mount') {
    // 路由级挂载模式 - 使用前缀挂载
    logger.info(`Using mount mode with prefix: ${config.base.prefix}`);
    app.use(config.base.prefix, dispatcher.middleware());
  } else {
    // 应用级挂载模式 - 不使用前缀挂载
    logger.info(`Using append mode for routes, prefix will be handled internally: ${config.base.prefix}`);
    app.use(dispatcher.middleware());
  }
  logger.info('Mock routes registered');

  // 热重载支持
  if (config.hotReload.enabled) {
    createHotReloadWatcher(dispatcher, config);
    logger.info('Hot reload enabled');
  }

  // 加载模块
  await loadModules(dispatcher, config);
  logger.info('All modules loaded');

  logger.info('Mock middleware created successfully');
};