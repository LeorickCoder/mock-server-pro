const path = require('path')
const logger = require('../utils/logger')
const config = require('../config')

class MockDispatcher {
  constructor() {
    this.routeMap = new Map()
    this.middlewareMap = new Map()
    this.modulePathMap = new Map()
    this.pendingRequests = new Map()
  }

  registerRoute(method, path, handler, modulePath) {
    this._validatePath(path)
    const key = `${method.toUpperCase()}:${path}`

    // 检查路由冲突：只在不同模块注册相同路由时才报错
    if (this.routeMap.has(key)) {
      const existingModule = this._findModuleByRoute(key)
      // 如果是同一个模块的路由，允许覆盖（热更新场景）
      if (existingModule && existingModule !== modulePath) {
        throw new Error(`Route ${key} already registered in different module: ${existingModule}`)
      }
    }

    // 注册新的路由
    this.routeMap.set(key, handler)
    this._addModuleRegistration(modulePath, key)
    logger.debug(`${this.routeMap.has(key) ? 'Updated' : 'Registered'} route: ${key} from ${modulePath}`)
  }

  registerMiddleware(path, handler, modulePath) {
    this._validatePath(path)
    const key = `middleware:${path}`

    // 同样的逻辑应用于中间件
    if (this.middlewareMap.has(key)) {
      const existingModule = this._findModuleByMiddleware(key)
      if (existingModule && existingModule !== modulePath) {
        throw new Error(`Middleware ${path} already registered in different module: ${existingModule}`)
      }
    }

    this.middlewareMap.set(key, handler)
    this._addModuleRegistration(modulePath, key)
    logger.debug(`${this.middlewareMap.has(key) ? 'Updated' : 'Registered'} middleware: ${key} from ${modulePath}`)
  }

  clearModule(modulePath) {
    const normalizedPath = path.normalize(modulePath)
    const registrations = this.modulePathMap.get(normalizedPath)

    if (registrations) {
      registrations.forEach((key) => {
        if (key.startsWith('middleware:')) {
          this.middlewareMap.delete(key)
        } else {
          this.routeMap.delete(key)
        }
      })

      this.modulePathMap.delete(normalizedPath)
      logger.debug(`Cleared module: ${normalizedPath}`)
    }
  }

  middleware() {
    return async (req, res, next) => {
      if (!req.path.startsWith(config.base.prefix)) {
        return next()
      }

      try {
        // 并发控制
        if (this.pendingRequests.size >= config.request.maxConcurrent) {
          throw new Error('Too many concurrent requests')
        }

        const requestId = Date.now() + Math.random()
        this.pendingRequests.set(requestId, { path: req.path, time: Date.now() })

        // 请求处理完成后清理
        res.on('finish', () => {
          this.pendingRequests.delete(requestId)
        })

        // 1. 检查中间件
        for (const [key, handler] of this.middlewareMap) {
          const middlewarePath = key.replace('middleware:', '')
          if (req.path.startsWith(middlewarePath)) {
            return handler(req, res, next)
          }
        }

        // 2. 检查路由
        const key = `${req.method}:${req.path}`
        const handler = this.routeMap.get(key)

        if (handler) {
          return handler(req, res)
        }

        next()
      } catch (error) {
        next(error)
      }
    }
  }

  // 私有方法
  _validatePath(path) {
    if (!path) {
      throw new Error('Path is required')
    }
    if (!path.startsWith('/')) {
      throw new Error('Path must start with /')
    }
    if (path.includes('..')) {
      throw new Error('Invalid path: contains ..')
    }
  }

  _addModuleRegistration(modulePath, key) {
    const normalizedPath = path.normalize(modulePath)
    if (!this.modulePathMap.has(normalizedPath)) {
      this.modulePathMap.set(normalizedPath, new Set())
    }
    this.modulePathMap.get(normalizedPath).add(key)
  }

  _findModuleByRoute(routeKey) {
    for (const [modulePath, registrations] of this.modulePathMap) {
      if (registrations.has(routeKey)) {
        return modulePath
      }
    }
    return null
  }

  _findModuleByMiddleware(middlewareKey) {
    for (const [modulePath, registrations] of this.modulePathMap) {
      if (registrations.has(middlewareKey)) {
        return modulePath
      }
    }
    return null
  }

  // 调试方法
  printRegistrations() {
    logger.debug('\nCurrent Registrations:')
    for (const [modulePath, registrations] of this.modulePathMap) {
      logger.debug(`\nModule: ${modulePath}`)
      registrations.forEach((key) => {
        logger.debug(`  - ${key}`)
      })
    }
  }

  createContext(modulePath) {
    return {
      registerRoute: (method, path, handler) => {
        this.registerRoute(method, path, handler, modulePath)
      },
      registerMiddleware: (path, handler) => {
        this.registerMiddleware(path, handler, modulePath)
      },
    }
  }
}

module.exports = new MockDispatcher()
