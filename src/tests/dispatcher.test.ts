import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MockDispatcher } from '../server/dispatcher'
import { Config } from '../types/core'
import * as express from 'express'

// 创建模拟Request对象的辅助函数
function createMockRequest(options: {
  path?: string;
  originalUrl?: string;
  baseUrl?: string;
  method?: string;
  url?: string;
}): express.Request {
  return {
    path: options.path || '/',
    originalUrl: options.originalUrl || options.path || '/',
    baseUrl: options.baseUrl || '',
    method: options.method || 'GET',
    url: options.url || options.path || '/',
    // 其他必要的Request属性
    headers: {},
    params: {},
    query: {},
    body: {},
    // @ts-ignore - 简化模拟
    on: vi.fn()
  } as unknown as express.Request
}

// 创建模拟Response对象的辅助函数
function createMockResponse(): express.Response {
  const res = {
    // 添加必要的Response属性和方法
    headersSent: false,
    statusCode: 200,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    // @ts-ignore - 简化模拟
    getHeader: vi.fn(),
    setHeader: vi.fn(),
    removeHeader: vi.fn(),
  } as unknown as express.Response
  return res
}

// 模拟配置创建函数
function createConfig(overrides: Partial<Config> = {}): Config {
  return {
    base: {
      prefix: '/api',
      prefixConfig: {
        value: '/api',
        mode: 'auto',
        detectBasePath: true
      },
      ...overrides.base
    },
    request: {
      timeout: 1000,
      maxConcurrent: 10,
      bodyLimit: '1mb',
      ...overrides.request
    },
    hotReload: {
      enabled: false,
      ignored: [],
      stabilityThreshold: 100,
      pollInterval: 100,
      ...overrides.hotReload
    },
    modules: {
      dir: 'modules',
      pattern: '**/*.js',
      recursive: true,
      ignore: [],
      ...overrides.modules
    },
    routes: {
      allowOverride: false,
      pathMode: 'auto',
      ...overrides.routes
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
      },
      ...overrides.typescript
    }
  } as Config
}

describe('MockDispatcher 路径处理', () => {
  // 在每个测试前重置单例
  beforeEach(() => {
    MockDispatcher.resetInstance()
    // 模拟logger
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // 测试正常情况下的路径格式化
  it('正确格式化路由路径', () => {
    const config = createConfig()
    const dispatcher = MockDispatcher.getInstance(config)
    
    // 使用反射获取私有方法
    const formatPath = (dispatcher as any)._formatPath.bind(dispatcher)
    
    // 测试各种路径格式
    expect(formatPath('/users')).toBe('/api/users')
    expect(formatPath('users')).toBe('/api/users')
    expect(formatPath('/api/users')).toBe('/api/users')
    expect(formatPath('//')).toBe('/api')
    expect(formatPath('/')).toBe('/api')
    expect(formatPath('/users/')).toBe('/api/users')
  })

  // 测试路径规范化
  it('正确规范化路径格式', () => {
    const config = createConfig()
    const dispatcher = MockDispatcher.getInstance(config)
    
    // 使用反射获取私有方法
    const normalizePath = (dispatcher as any)._normalizePath.bind(dispatcher)
    
    // 测试各种路径格式
    expect(normalizePath('/users')).toBe('/users')
    expect(normalizePath('users')).toBe('/users')
    expect(normalizePath('/users/')).toBe('/users')
    expect(normalizePath('//users//')).toBe('/users')
    expect(normalizePath('/')).toBe('/')
    expect(normalizePath('//')).toBe('/')
    expect(normalizePath('//api//users//')).toBe('/api/users')
  })

  // 测试应用级挂载（append模式）下的路径计算
  it('正确处理应用级挂载下的请求路径', async () => {
    const config = createConfig({
      base: {
        prefixConfig: {
          mode: 'append'
        }
      }
    })
    const dispatcher = MockDispatcher.getInstance(config)
    
    // 模拟请求
    const req = createMockRequest({
      path: '/api/users',
      originalUrl: '/api/users',
      baseUrl: ''
    })
    
    const res = createMockResponse()
    const next = vi.fn()
    
    // 注册路由处理器
    dispatcher.registerRoute('get', '/api/users', (req, res) => {
      res.send('OK')
    }, 'test.js')
    
    // 执行中间件
    const middleware = dispatcher.middleware()
    await middleware(req, res, next)
    
    // 验证路由是否被正确处理
    expect(res.send).toHaveBeenCalledWith('OK')
    expect(next).not.toHaveBeenCalled()
  })

  // 测试路由级挂载（mount模式）下的路径计算
  it('正确处理路由级挂载下的请求路径', async () => {
    const config = createConfig({
      base: {
        prefixConfig: {
          mode: 'mount'
        }
      }
    })
    const dispatcher = MockDispatcher.getInstance(config)
    
    // 模拟请求 - 注意这里模拟了路由级挂载的情况：
    // app.use('/api', middleware) => 此时req.baseUrl='/api', req.path='/users'
    const req = createMockRequest({
      path: '/users',
      originalUrl: '/api/users',
      baseUrl: '/api'
    })
    
    const res = createMockResponse()
    const next = vi.fn()
    
    // 注册路由处理器（注意在mount模式下，路径不需要包含前缀）
    dispatcher.registerRoute('get', '/users', (req, res) => {
      res.send('OK')
    }, 'test.js')
    
    // 执行中间件
    const middleware = dispatcher.middleware()
    await middleware(req, res, next)
    
    // 验证路由是否被正确处理
    expect(res.send).toHaveBeenCalledWith('OK')
    expect(next).not.toHaveBeenCalled()
  })

  // 测试自动模式下的路径计算
  it('在自动模式下正确检测挂载点并处理路径', async () => {
    const config = createConfig({
      base: {
        prefixConfig: {
          mode: 'auto',
          detectBasePath: true
        }
      }
    })
    const dispatcher = MockDispatcher.getInstance(config)
    
    // 注册路由处理器（使用相对路径）
    dispatcher.registerRoute('get', 'users', (req, res) => {
      res.send('Relative path OK')
    }, 'test1.js')
    
    // 注册路由处理器（使用绝对路径带前缀）
    dispatcher.registerRoute('get', '/api/products', (req, res) => {
      res.send('Absolute path OK')
    }, 'test2.js')
    
    // 情况1: 应用级挂载 app.use(middleware)
    const req1 = createMockRequest({
      path: '/api/users',
      originalUrl: '/api/users',
      baseUrl: ''
    })
    const res1 = createMockResponse()
    const next1 = vi.fn()
    
    const middleware = dispatcher.middleware()
    await middleware(req1, res1, next1)
    
    // 验证路由是否被正确处理
    expect(res1.send).toHaveBeenCalledWith('Relative path OK')
    
    // 情况2: 路由级挂载 app.use('/api', middleware)
    const req2 = createMockRequest({
      path: '/users',
      originalUrl: '/api/users',
      baseUrl: '/api'
    })
    const res2 = createMockResponse()
    const next2 = vi.fn()
    
    await middleware(req2, res2, next2)
    
    // 验证路由是否被正确处理
    expect(res2.send).toHaveBeenCalledWith('Relative path OK')
    
    // 情况3: 测试带前缀的绝对路径
    const req3 = createMockRequest({
      path: '/products',
      originalUrl: '/api/products',
      baseUrl: '/api'
    })
    const res3 = createMockResponse()
    const next3 = vi.fn()
    
    await middleware(req3, res3, next3)
    
    // 验证路由是否被正确处理
    expect(res3.send).toHaveBeenCalledWith('Absolute path OK')
  })

  // 测试查询参数处理
  it('正确处理带查询参数的请求', async () => {
    const config = createConfig()
    const dispatcher = MockDispatcher.getInstance(config)
    
    // 注册路由处理器
    dispatcher.registerRoute('get', '/api/users', (req, res) => {
      res.send('Query params OK')
    }, 'test.js')
    
    // 带查询参数的请求
    const req = createMockRequest({
      path: '/api/users',
      originalUrl: '/api/users?id=1&sort=name',
      url: '/api/users?id=1&sort=name'
    })
    
    const res = createMockResponse()
    const next = vi.fn()
    
    const middleware = dispatcher.middleware()
    await middleware(req, res, next)
    
    // 验证路由是否被正确处理
    expect(res.send).toHaveBeenCalledWith('Query params OK')
  })

  // 测试严格模式下的路径格式化
  it('在严格模式下拒绝不带前缀的路径', () => {
    const config = createConfig({
      routes: {
        pathMode: 'strict'
      }
    })
    const dispatcher = MockDispatcher.getInstance(config)
    
    // 使用不带前缀的路径应该抛出错误
    expect(() => {
      dispatcher.registerRoute('get', '/users', () => {}, 'test.js')
    }).toThrow(/路径格式错误/)
  })

  // 测试各种非标准路径的规范化和处理
  it('正确规范化和处理非标准路径', () => {
    const config = createConfig()
    const dispatcher = MockDispatcher.getInstance(config)
    
    // 使用反射获取私有方法
    const normalizePath = (dispatcher as any)._normalizePath.bind(dispatcher)
    
    // 测试各种非标准路径
    expect(normalizePath('//api////users//')).toBe('/api/users')
    expect(normalizePath('/api//')).toBe('/api')
    expect(normalizePath('api//users/')).toBe('/api/users')
    expect(normalizePath('//')).toBe('/')
  })
}) 