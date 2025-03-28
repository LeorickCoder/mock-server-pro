// 导入核心函数
import { createMockServer } from './server/createMockServer';
import { createMockMiddleware } from './server/createMockMiddleware';
import { MockDispatcher } from './server/dispatcher';
import { Config } from './types/core';
import { RouteHandler, ModuleContext, HttpMethod } from './server/types';
import { MiddlewareHandler, ErrorResponse, TimeoutConfig } from './server/middleware/types';

// 导出核心函数
export { 
  createMockServer, 
  createMockMiddleware, 
  MockDispatcher 
};

// 类型导出
export type { 
  Config, 
  RouteHandler, 
  ModuleContext, 
  HttpMethod, 
  MiddlewareHandler,
  ErrorResponse,
  TimeoutConfig
};

// TypeScript类型导出
// 这些只在TypeScript编译时使用，不影响运行时
/**
 * @typedef {import('./types/core').Config} Config
 * @typedef {import('./server/types').RouteHandler} RouteHandler
 * @typedef {import('./server/types').ModuleContext} ModuleContext
 * @typedef {import('./server/types').HttpMethod} HttpMethod
 * @typedef {import('./server/middleware/types').MiddlewareHandler} MiddlewareHandler
 * @typedef {import('./server/middleware/types').ErrorResponse} ErrorResponse
 * @typedef {import('./server/middleware/types').TimeoutConfig} TimeoutConfig
 */ 