import { Request, Response } from 'express'
import { MiddlewareHandler } from './middleware/types'
import { PathPattern } from '../utils/path-to-pattern'

// HTTP 方法类型
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

// 路由处理器类型
export type RouteHandler = (req: Request, res: Response) => void | Promise<void>

/**
 * 扩展的Request对象，包含路径参数
 * 注意：Express的Request本身已经有params属性，但我们在这里明确类型
 */
export interface RequestWithParams extends Request {
  params: Record<string, string>;
}

/**
 * 路由定义接口，包含路径模式信息
 */
export interface RouteDefinition extends PathPattern {
  /** 请求方法 */
  method: string;
  /** 处理函数 */
  handler: RouteHandler;
  /** 模块路径 */
  modulePath: string;
}

/**
 * 中间件定义接口，包含路径模式信息
 */
export interface MiddlewareDefinition extends PathPattern {
  /** 处理函数 */
  handler: MiddlewareHandler;
  /** 模块路径 */
  modulePath: string;
}

// 模块上下文接口
export interface ModuleContext {
  /**
   * 注册路由处理函数
   * @param method HTTP方法
   * @param path 路由路径
   * @param handler 处理函数
   */
  registerRoute: (method: HttpMethod, path: string, handler: RouteHandler) => void
  
  /**
   * 注册中间件处理函数
   * @param path 中间件路径
   * @param handler 中间件处理函数
   */
  registerMiddleware: (path: string, handler: MiddlewareHandler) => void
  
  /**
   * 注册GET请求处理函数
   * @param path 路由路径
   * @param handler 处理函数
   */
  get: (path: string, handler: RouteHandler) => void
  
  /**
   * 注册POST请求处理函数
   * @param path 路由路径
   * @param handler 处理函数
   */
  post: (path: string, handler: RouteHandler) => void
  
  /**
   * 注册PUT请求处理函数
   * @param path 路由路径
   * @param handler 处理函数
   */
  put: (path: string, handler: RouteHandler) => void
  
  /**
   * 注册DELETE请求处理函数
   * @param path 路由路径
   * @param handler 处理函数
   */
  delete: (path: string, handler: RouteHandler) => void
  
  /**
   * 注册PATCH请求处理函数
   * @param path 路由路径
   * @param handler 处理函数
   */
  patch: (path: string, handler: RouteHandler) => void
  
  /**
   * 注册OPTIONS请求处理函数
   * @param path 路由路径
   * @param handler 处理函数
   */
  options: (path: string, handler: RouteHandler) => void
  
  /**
   * 注册HEAD请求处理函数
   * @param path 路由路径
   * @param handler 处理函数
   */
  head: (path: string, handler: RouteHandler) => void
  
  /**
   * 注册中间件
   * @param path 中间件路径
   * @param handler 中间件处理函数
   */
  use: (path: string, handler: MiddlewareHandler) => void
}

export interface BaseConfig {
  prefix: string
}

export interface RequestConfig {
  timeout: number
  maxConcurrent: number
  bodyLimit: string
}

export interface HotReloadConfig {
  enabled: boolean
  ignored: string[]
  stabilityThreshold?: number
  pollInterval?: number
}

export interface ModulesConfig {
  dir: string
  pattern: string
  recursive: boolean
  ignore: string[]
} 