import express from 'express';
import bodyParser from 'body-parser';
import { MockDispatcher } from './dispatcher';
import { createHotReloadWatcher } from './hotReload';
import { errorMiddleware } from './middleware/error';
import { timeoutMiddleware } from './middleware/timeout';
import { corsMiddleware } from './middleware/core';
import { logger } from '../utils/logger';
import { defaultConfig, loadConfig, initConfig } from '../config';
import { Config } from '../types/core';
import { loadModules } from './moduleLoader';

export const createMockServer = async (options: Partial<Config> = {}) => {
  logger.info('Creating mock server...');
  // 加载并初始化配置
  let config = { ...defaultConfig, ...loadConfig(), ...options };
  config = initConfig(config);
  
  const app = express();

  // 创建 dispatcher 单例
  const dispatcher = MockDispatcher.getInstance(config);
  logger.info('Mock dispatcher initialized');

  // 基础中间件
  app.use(bodyParser.json({ limit: config.request.bodyLimit }));
  app.use(corsMiddleware());
  app.use(timeoutMiddleware(config.request.timeout));
  app.use(errorMiddleware());
  logger.info('Base middlewares registered');

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

  logger.info('Mock server created successfully');
  return app;
}; 