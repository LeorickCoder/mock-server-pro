import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { logger } from '../utils/logger'
import { HttpMethod, RouteHandler, ModuleContext, RouteDefinition, MiddlewareDefinition, RequestWithParams } from './types'
import { Config } from '../types/core'
import { MiddlewareHandler } from './middleware/types'
import { checkRouteConflict } from '../utils'
import { 
  validatePath, 
  normalizePath, 
  joinPaths, 
  stripQueryParams, 
  isAbsolutePath 
} from '../utils/path-validator'
import {
  pathToPattern,
  extractParams,
  matchPath,
  sortPatterns
} from '../utils/path-to-pattern'

export class MockDispatcher {
  private static instance: MockDispatcher | null = null
  // 改用数组存储路由定义，以便进行模式匹配
  private routeDefinitions: RouteDefinition[] = []
  private middlewareDefinitions: MiddlewareDefinition[] = []
  private modulePathMap: Map<string, Set<string>>
  private pendingRequests: Map<number, { path: string; time: number }>
  private config: Config
  private basePath: string | null = null
  // 缓存已经排序的路由定义，提高性能
  private sortedRouteDefinitions: RouteDefinition[] = []
  private sortedMiddlewareDefinitions: MiddlewareDefinition[] = []
  // 路由缓存，提高性能
  private routeCache: Map<string, RouteDefinition> = new Map()

  private constructor(config: Config) {
    this.routeDefinitions = []
    this.middlewareDefinitions = []
    this.modulePathMap = new Map()
    this.pendingRequests = new Map()
    this.config = config
    this.sortedRouteDefinitions = []
    this.sortedMiddlewareDefinitions = []
    this.routeCache = new Map()
  }

  // 单例获取方法
  public static getInstance(config?: Config): MockDispatcher {
    if (!MockDispatcher.instance && config) {
      MockDispatcher.instance = new MockDispatcher(config)
    }
    if (!MockDispatcher.instance) {
      throw new Error('MockDispatcher must be initialized with config first')
    }
    return MockDispatcher.instance
  }

  // 重置单例（主要用于测试）
  public static resetInstance(): void {
    MockDispatcher.instance = null
  }

  /**
   * 获取配置的前缀值
   * @returns 带尾斜杠的前缀
   */
  private _getPrefix(): string {
    const prefixValue = this.config.base.prefixConfig?.value || this.config.base.prefix
    // 确保前缀以/开头
    const normalizedPrefix = normalizePath(prefixValue)
    // 确保前缀以/结尾
    return normalizedPrefix.endsWith('/') 
      ? normalizedPrefix 
      : `${normalizedPrefix}/`
  }

  /**
   * 获取格式化的路径（确保前缀正确）
   * @param routePath 要格式化的路由路径
   * @returns 格式化后的路径
   */
  private _formatPath(routePath: string): string {
    const prefix = this._getPrefix().slice(0, -1) // 移除尾部斜杠
    const normalizedPath = normalizePath(routePath)
    const pathMode = this.config.routes?.pathMode || 'auto'
    
    // 路径已经包含前缀，返回规范化后的路径
    if (normalizedPath.startsWith(prefix)) {
      return normalizedPath
    }
    
    // strict模式下要求路径必须以前缀开头
    if (pathMode === 'strict') {
      throw new Error(
        `路径格式错误: "${normalizedPath}"\n` +
        `严格模式下，路径必须以配置的前缀开头: "${prefix}"\n` +
        `如需自动处理路径前缀，请设置 routes.pathMode = 'auto'`
      )
    }
    
    // auto模式：添加前缀
    return joinPaths(prefix, normalizedPath)
  }

  /**
   * 计算实际请求路径（考虑挂载点和环境）
   * @param req Express请求对象
   * @returns 处理后的请求路径
   */
  private _computeRequestPath(req: Request): string {
    const prefix = this.config.base.prefix
    const prefixConfig = this.config.base.prefixConfig
    const prefixMode = prefixConfig?.mode || 'append'
    
    // 获取完整请求路径（包含baseUrl）
    const fullPath = normalizePath((req.baseUrl || '') + (req.path || '/'))
    
    // 去除查询参数
    const pathWithoutQuery = stripQueryParams(fullPath)
    
    if (prefixMode === 'mount' || (prefixMode === 'auto' && this.basePath)) {
      // 挂载模式: 已经通过app.use('/prefix', middleware)挂载
      // 或者自动模式且已检测到挂载点
      
      // 在挂载模式下，前缀已经在baseUrl中，需要添加到路径上以匹配路由
      return joinPaths(prefix, pathWithoutQuery)
    }
    
    // append模式或自动模式（未检测到挂载点）：直接使用完整路径
    return pathWithoutQuery
  }

  /**
   * 检测并更新挂载点信息
   * @param req Express请求对象
   */
  private _detectMountingPoint(req: Request): void {
    const prefixConfig = this.config.base.prefixConfig
    
    // 只有auto模式且启用检测时才执行
    if (prefixConfig?.mode !== 'auto' || !prefixConfig.detectBasePath || this.basePath) {
      return
    }
    
    // 使用req.baseUrl检测挂载点
    if (req.baseUrl && req.baseUrl !== '') {
      this.basePath = normalizePath(req.baseUrl)
      logger.info(`检测到挂载点: "${this.basePath}", 使用mount模式处理前缀`)
      return
    }
    
    // 备用方法：比较originalUrl和path
    if (req.originalUrl && req.path && req.originalUrl !== req.path) {
      const originalUrlWithoutQuery = stripQueryParams(req.originalUrl)
      if (originalUrlWithoutQuery.endsWith(req.path)) {
        const basePart = originalUrlWithoutQuery.substring(
          0, 
          originalUrlWithoutQuery.length - req.path.length
        )
        if (basePart) {
          this.basePath = normalizePath(basePart)
          logger.info(`通过URL对比检测到挂载点: "${this.basePath}", 使用mount模式处理前缀`)
        }
      }
    }
  }

  /**
   * 生成路由键，用于缓存和模块注册管理
   * @param method HTTP方法
   * @param path 路径
   * @returns 唯一键
   */
  private _generateRouteKey(method: string, path: string): string {
    return `${method.toUpperCase()}:${path}`;
  }

  /**
   * 生成中间件键，用于缓存和模块注册管理
   * @param path 中间件路径
   * @returns 唯一键
   */
  private _generateMiddlewareKey(path: string): string {
    return `middleware:${path}`;
  }

  /**
   * 对路由定义进行排序，确保更具体的路径先被匹配
   * 同时更新缓存
   */
  private _sortRouteDefinitions(): void {
    this.sortedRouteDefinitions = sortPatterns(this.routeDefinitions);
    // 清空缓存
    this.routeCache.clear();
  }

  /**
   * 对中间件定义进行排序，确保更具体的路径先被匹配
   */
  private _sortMiddlewareDefinitions(): void {
    this.sortedMiddlewareDefinitions = sortPatterns(this.middlewareDefinitions);
  }

  /**
   * 查找匹配给定方法和路径的路由定义
   * @param method 请求方法
   * @param path 请求路径
   * @returns 匹配的路由定义，如果没找到则返回null
   */
  private _findMatchingRoute(method: string, path: string): RouteDefinition | null {
    // 首先查询缓存
    const cacheKey = `${method}:${path}`;
    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey) || null;
    }

    // 查找匹配的路由
    for (const route of this.sortedRouteDefinitions) {
      if (route.method === method && matchPath(path, route)) {
        // 添加到缓存
        this.routeCache.set(cacheKey, route);
        return route;
      }
    }

    return null;
  }

  /**
   * 查找匹配给定路径的中间件定义
   * @param path 请求路径
   * @returns 匹配的中间件数组
   */
  private _findMatchingMiddlewares(path: string): MiddlewareDefinition[] {
    const matches: MiddlewareDefinition[] = [];

    for (const middleware of this.sortedMiddlewareDefinitions) {
      if (path.startsWith(middleware.pattern)) {
        matches.push(middleware);
      }
    }

    return matches;
  }

  /**
   * 注册路由处理函数
   */
  registerRoute(method: HttpMethod, path: string, handler: RouteHandler, modulePath: string): void {
    this._validatePath(path)
    
    // 确保路径以正确的前缀开始
    const formattedPath = this._formatPath(path)
    
    // 转换为路径模式
    const pattern = pathToPattern(formattedPath)
    
    // 创建路由定义
    const routeDefinition: RouteDefinition = {
      ...pattern,
      method: method.toUpperCase(),
      handler,
      modulePath
    }
    
    // 生成路由键，用于模块管理
    const routeKey = this._generateRouteKey(method, formattedPath)

    // 检查路由冲突
    if (this.config.routes?.allowOverride !== true) {
      checkRouteConflict(this, method, formattedPath)
    } else {
      // 查找是否已存在相同模式的路由
      const existingIndex = this.routeDefinitions.findIndex(
        r => r.method === method.toUpperCase() && r.pattern === formattedPath
      )
      
      if (existingIndex >= 0) {
        const existingModule = this.routeDefinitions[existingIndex].modulePath
        logger.warn(`路由 ${routeKey} 被覆盖。原模块: ${existingModule}, 新模块: ${modulePath}`)
        // 替换已存在的路由
        this.routeDefinitions[existingIndex] = routeDefinition
      } else {
        // 添加新路由
        this.routeDefinitions.push(routeDefinition)
      }
    }

    // 如果是新路由，则添加到列表中
    const existingIndex = this.routeDefinitions.findIndex(
      r => r.method === method.toUpperCase() && r.pattern === formattedPath
    )
    
    if (existingIndex < 0) {
      this.routeDefinitions.push(routeDefinition)
      // 添加到模块映射
      this._addModuleRegistration(modulePath, routeKey)
      logger.debug(`注册路由: ${routeKey} 来自 ${modulePath}`)
    } else {
      // 更新已存在的路由
      this.routeDefinitions[existingIndex] = routeDefinition
      // 添加到模块映射
      this._addModuleRegistration(modulePath, routeKey)
      logger.debug(`更新路由: ${routeKey} 来自 ${modulePath}`)
    }
    
    // 重新排序路由
    this._sortRouteDefinitions()
  }

  /**
   * 注册中间件处理函数
   */
  registerMiddleware(path: string, handler: MiddlewareHandler, modulePath: string): void {
    this._validatePath(path)
    
    // 确保中间件路径以正确的前缀开始
    const formattedPath = this._formatPath(path)
    
    // 转换为路径模式
    const pattern = pathToPattern(formattedPath)
    
    // 创建中间件定义
    const middlewareDefinition: MiddlewareDefinition = {
      ...pattern,
      handler,
      modulePath
    }
    
    // 生成中间件键，用于模块管理
    const middlewareKey = this._generateMiddlewareKey(formattedPath)

    if (this.config.routes?.allowOverride !== true) {
      // 查找是否已存在相同模式的中间件
      const existingIndex = this.middlewareDefinitions.findIndex(
        m => m.pattern === formattedPath
      )
      
      if (existingIndex >= 0) {
        const existingModule = this.middlewareDefinitions[existingIndex].modulePath
        if (existingModule !== modulePath) {
          throw new Error(`中间件 ${formattedPath} 已在不同模块中注册: ${existingModule}`)
        }
      }
    } else {
      // 查找是否已存在相同模式的中间件
      const existingIndex = this.middlewareDefinitions.findIndex(
        m => m.pattern === formattedPath
      )
      
      if (existingIndex >= 0) {
        const existingModule = this.middlewareDefinitions[existingIndex].modulePath
        logger.warn(`中间件 ${middlewareKey} 被覆盖。原模块: ${existingModule}, 新模块: ${modulePath}`)
        // 替换已存在的中间件
        this.middlewareDefinitions[existingIndex] = middlewareDefinition
      }
    }

    // 如果是新中间件，则添加到列表中
    const existingIndex = this.middlewareDefinitions.findIndex(
      m => m.pattern === formattedPath
    )
    
    if (existingIndex < 0) {
      this.middlewareDefinitions.push(middlewareDefinition)
      // 添加到模块映射
      this._addModuleRegistration(modulePath, middlewareKey)
      logger.debug(`注册中间件: ${middlewareKey} 来自 ${modulePath}`)
    } else {
      // 更新已存在的中间件
      this.middlewareDefinitions[existingIndex] = middlewareDefinition
      // 添加到模块映射
      this._addModuleRegistration(modulePath, middlewareKey)
      logger.debug(`更新中间件: ${middlewareKey} 来自 ${modulePath}`)
    }
    
    // 重新排序中间件
    this._sortMiddlewareDefinitions()
  }

  /**
   * 清除指定模块的所有注册
   */
  clearModule(modulePath: string): void {
    const normalizedPath = path.normalize(modulePath)
    const registrations = this.modulePathMap.get(normalizedPath)

    if (registrations) {
      // 收集要删除的路由和中间件
      const routeKeysToRemove: string[] = []
      const middlewareKeysToRemove: string[] = []
      
      registrations.forEach((key) => {
        if (key.startsWith('middleware:')) {
          middlewareKeysToRemove.push(key)
        } else {
          routeKeysToRemove.push(key)
        }
      })
      
      // 移除中间件
      this.middlewareDefinitions = this.middlewareDefinitions.filter(
        m => !middlewareKeysToRemove.includes(this._generateMiddlewareKey(m.pattern)) || 
             m.modulePath !== normalizedPath
      )
      
      // 移除路由
      this.routeDefinitions = this.routeDefinitions.filter(
        r => !routeKeysToRemove.includes(this._generateRouteKey(r.method, r.pattern)) || 
             r.modulePath !== normalizedPath
      )
      
      // 清空缓存
      this.routeCache.clear()
      
      // 重新排序
      this._sortRouteDefinitions()
      this._sortMiddlewareDefinitions()

      this.modulePathMap.delete(normalizedPath)
      logger.debug(`清除模块: ${normalizedPath}`)
    }
  }

  /**
   * 创建Express中间件处理函数
   */
  middleware(): MiddlewareHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 检测挂载点
        this._detectMountingPoint(req)
        
        // 计算实际请求路径
        const requestPath = this._computeRequestPath(req)
        const prefix = this.config.base.prefix
        
        // 记录调试信息
        logger.debug(`处理请求: ${req.method} ${req.originalUrl} (计算路径: ${requestPath})`)
        
        // 判断是否匹配前缀
        if (!requestPath.startsWith(prefix)) {
          logger.debug(`路径 ${requestPath} 不匹配前缀 ${prefix}, 跳过处理`)
          return next()
        }

        // 并发控制
        const maxConcurrent = this.config.request.maxConcurrent
        if (this.pendingRequests.size >= maxConcurrent) {
          throw new Error(`并发请求过多 (${this.pendingRequests.size}/${maxConcurrent})`)
        }

        const requestId = Date.now() + Math.random()
        this.pendingRequests.set(requestId, { path: requestPath, time: Date.now() })

        // 请求处理完成后清理
        res.on('finish', () => {
          this.pendingRequests.delete(requestId)
          logger.debug(`请求完成: ${req.method} ${requestPath}`)
        })

        // 1. 检查中间件
        const matchingMiddlewares = this._findMatchingMiddlewares(requestPath)
        
        if (matchingMiddlewares.length > 0) {
          const middleware = matchingMiddlewares[0] // 使用第一个匹配的中间件
          logger.debug(`应用中间件: ${middleware.pattern} 处理路径: ${requestPath}`)
          return middleware.handler(req, res, next)
        }

        // 2. 检查路由
        const method = req.method
        const matchingRoute = this._findMatchingRoute(method, requestPath)

        if (matchingRoute) {
          logger.debug(`找到匹配路由: ${method}:${matchingRoute.pattern} 处理路径: ${requestPath}`)
          
          // 提取路径参数并添加到req.params
          const params = extractParams(requestPath, matchingRoute)
          // 扩展req.params，保留现有参数
          const requestWithParams = req as RequestWithParams
          requestWithParams.params = { ...requestWithParams.params, ...params }
          
          return matchingRoute.handler(requestWithParams, res)
        }

        logger.debug(`未找到处理器: ${method}:${requestPath} (原始路径: ${req.originalUrl})`)
        next()
      } catch (error) {
        logger.error(`处理请求 ${req.method} ${req.originalUrl} 时出错:`, error)
        next(error)
      }
    }
  }

  /**
   * 为模块创建上下文对象
   */
  createContext(modulePath: string): ModuleContext {
    return {
      registerRoute: (method: HttpMethod, path: string, handler: RouteHandler) => {
        this.registerRoute(method, path, handler, modulePath)
      },
      registerMiddleware: (path: string, handler: MiddlewareHandler) => {
        this.registerMiddleware(path, handler, modulePath)
      },
      // 便捷方法 - HTTP方法
      get: (path: string, handler: RouteHandler) => {
        this.registerRoute('get', path, handler, modulePath)
      },
      post: (path: string, handler: RouteHandler) => {
        this.registerRoute('post', path, handler, modulePath)
      },
      put: (path: string, handler: RouteHandler) => {
        this.registerRoute('put', path, handler, modulePath)
      },
      delete: (path: string, handler: RouteHandler) => {
        this.registerRoute('delete', path, handler, modulePath)
      },
      patch: (path: string, handler: RouteHandler) => {
        this.registerRoute('patch', path, handler, modulePath)
      },
      options: (path: string, handler: RouteHandler) => {
        this.registerRoute('options', path, handler, modulePath)
      },
      head: (path: string, handler: RouteHandler) => {
        this.registerRoute('head', path, handler, modulePath)
      },
      // 中间件便捷方法
      use: (path: string, handler: MiddlewareHandler) => {
        this.registerMiddleware(path, handler, modulePath)
      }
    }
  }

  // 私有方法
  private _validatePath(path: string): void {
    // 使用工具函数验证路径
    validatePath(path)
    
    // 额外的业务检查
    if (!isAbsolutePath(path) && this.config.routes?.pathMode === 'strict') {
      throw new Error(`路径格式错误: "${path}"。在严格模式下, 路径必须以"/"开头`)
    }
  }

  private _addModuleRegistration(modulePath: string, key: string): void {
    const normalizedPath = path.normalize(modulePath)
    if (!this.modulePathMap.has(normalizedPath)) {
      this.modulePathMap.set(normalizedPath, new Set())
    }
    const registrations = this.modulePathMap.get(normalizedPath)!
    registrations.add(key)
    logger.debug(`添加注册 ${key} 至模块 ${normalizedPath}`)
  }

  private _findModuleByRoute(routeKey: string): string | null {
    // 检查是否与任何路由定义匹配
    for (const route of this.routeDefinitions) {
      const key = this._generateRouteKey(route.method, route.pattern)
      if (key === routeKey) {
        return route.modulePath
      }
    }
    return null
  }

  private _findModuleByMiddleware(middlewareKey: string): string | null {
    // 从中间件定义中提取
    const prefix = 'middleware:'
    if (!middlewareKey.startsWith(prefix)) {
      return null
    }
    
    const path = middlewareKey.substring(prefix.length)
    
    // 查找与路径匹配的中间件
    for (const middleware of this.middlewareDefinitions) {
      if (middleware.pattern === path) {
        return middleware.modulePath
      }
    }
    
    return null
  }

  // 调试方法
  printRegistrations(): void {
    logger.debug('\n当前注册:')
    
    // 打印路由
    logger.debug('\n路由:')
    for (const route of this.routeDefinitions) {
      logger.debug(`  - ${route.method}:${route.pattern} (${route.modulePath})`)
      if (route.params.length > 0) {
        logger.debug(`    参数: ${route.params.join(', ')}`)
      }
    }
    
    // 打印中间件
    logger.debug('\n中间件:')
    for (const middleware of this.middlewareDefinitions) {
      logger.debug(`  - ${middleware.pattern} (${middleware.modulePath})`)
      if (middleware.params.length > 0) {
        logger.debug(`    参数: ${middleware.params.join(', ')}`)
      }
    }
  }

  hasRoute(key: string): boolean {
    // 检查是否与任何路由定义匹配
    for (const route of this.routeDefinitions) {
      const routeKey = this._generateRouteKey(route.method, route.pattern)
      if (routeKey === key) {
        return true
      }
    }
    return false
  }

  clearAllRoutes(): void {
    this.routeDefinitions = []
    this.middlewareDefinitions = []
    this.sortedRouteDefinitions = []
    this.sortedMiddlewareDefinitions = []
    this.routeCache.clear()
    this.modulePathMap.clear()
    logger.debug('清除所有路由和中间件')
  }
} 