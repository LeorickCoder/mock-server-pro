import { Application } from 'express'
import { MockDispatcher } from '../server/dispatcher'
import { logger } from './logger'
import path from 'path'

/**
 * 清理现有路由
 */
export function clearRoutes(app: Application): void {
  app._router.stack = app._router.stack.filter((layer: any) => {
    return !layer.route || layer.route.path === '*'
  })
  logger.debug('Cleared existing routes')
}

/**
 * 验证模块
 * @param module 模块对象
 * @param filePath 文件路径，用于错误提示
 * @returns 验证通过的模块函数
 */
export function validateModule(module: any, filePath: string): ((ctx: any) => void | Promise<void>) {
  // 标准模式：导出默认函数
  if (module && typeof module.default === 'function') {
    return module.default;
  }
  
  // 兼容模式：直接导出函数
  if (module && typeof module === 'function') {
    return module;
  }
  
  // 错误情况
  const relativePath = path.relative(process.cwd(), filePath);
  throw new Error(
    `无效的模块格式: ${relativePath}\n` +
    `模块必须使用以下格式之一:\n` +
    `1. export default function(ctx) {...}\n` +
    `2. module.exports = function(ctx) {...}`
  );
}

/**
 * 检查路由冲突
 */
export function checkRouteConflict(dispatcher: MockDispatcher, method: string, path: string): void {
  const key = `${method}:${path}`
  if (dispatcher.hasRoute(key)) {
    throw new Error(`Route ${key} is already registered`)
  }
}