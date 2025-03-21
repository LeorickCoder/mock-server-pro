const fs = require('fs')
const path = require('path')
const express = require('express')

// 清理现有路由
const clearRoutes = (app) => {
  app._router.stack = app._router.stack.filter((layer) => {
    return !layer.route || layer.route.path === '*'
  })
}

// 自动加载所有模块
const loadModules = (dispatcher) => {
  const modulesPath = path.join(__dirname, '../modules')

  // 清除所有已注册的 mock 路由
  if (dispatcher.routeMap && dispatcher.routeMap.size > 0) {
    dispatcher.routeMap.clear()
  }

  // 递归加载所有模块
  function loadModuleFiles(dir) {
    const files = fs.readdirSync(dir)

    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        loadModuleFiles(filePath)
      } else if (file.endsWith('.js')) {
        const normalizedPath = path.normalize(filePath)

        try {
          delete require.cache[require.resolve(filePath)]
          const module = require(filePath)

          if (typeof module === 'function') {
            // 创建带有上下文的注册器
            const context = dispatcher.createContext(filePath)
            module(context)
          }
        } catch (error) {
          console.error(`[Mock] Failed to load module: ${filePath}`, error)
        }
      }
    })
  }

  // 加载所有模块
  loadModuleFiles(modulesPath)
}

// 建议添加模块注册验证
function validateModule(module) {
  if (!module || typeof module !== 'function') {
    throw new Error('Mock module must export a function')
  }
}

// 添加路由冲突检测
const routeMap = new Map()
function checkRouteConflict(method, path) {
  const key = `${method}:${path}`
  if (routeMap.has(key)) {
    throw new Error(`Route ${key} is already registered`)
  }
  routeMap.set(key, true)
}

module.exports = {
  loadModules,
  clearRoutes,
}
