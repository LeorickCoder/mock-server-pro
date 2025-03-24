const express = require('express')

// 用户数据存储
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' }
]

let nextId = 3

// 正确的模块导出方式
module.exports = function(dispatcher) {
  // 使用 dispatcher 直接注册路由，而不是创建 router

  // 获取用户列表
  dispatcher.registerRoute('get', '/users', (req, res) => {
    res.json(users)
  })

  // 获取单个用户
  dispatcher.registerRoute('get', '/users/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const user = users.find(u => u.id === id)
    
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: '用户不存在' })
    }
  })

  // 创建用户
  dispatcher.registerRoute('post', '/users', (req, res) => {
    const { name, email } = req.body
    
    if (!name || !email) {
      res.status(400).json({ message: '缺少必要参数' })
      return
    }
    
    const newUser = {
      id: nextId++,
      name,
      email
    }
    
    users.push(newUser)
    res.status(201).json(newUser)
  })

  // 更新用户
  dispatcher.registerRoute('put', '/users/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const { name, email } = req.body
    
    if (!name && !email) {
      res.status(400).json({ message: '缺少更新参数' })
      return
    }
    
    const index = users.findIndex(u => u.id === id)
    
    if (index === -1) {
      res.status(404).json({ message: '用户不存在' })
      return
    }
    
    const updatedUser = {
      ...users[index],
      ...(name && { name }),
      ...(email && { email })
    }
    
    users[index] = updatedUser
    res.json(updatedUser)
  })

  // 删除用户
  dispatcher.registerRoute('delete', '/users/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const index = users.findIndex(u => u.id === id)
    
    if (index === -1) {
      res.status(404).json({ message: '用户不存在' })
      return
    }
    
    users.splice(index, 1)
    res.status(204).send()
  })

  // 文件上传示例
  dispatcher.registerRoute('post', '/upload', (req, res) => {
    const file = req.files?.file
    if (!file) {
      res.status(400).json({ message: '未上传文件' })
      return
    }
    res.json({ 
      message: '上传成功',
      filename: file.name,
      size: file.size
    })
  })

  // 添加一个中间件示例
  dispatcher.registerMiddleware('/admin', (req, res, next) => {
    // 模拟认证中间件
    const token = req.headers.authorization
    
    if (!token) {
      res.status(401).json({ message: '未授权访问' })
      return
    }
    
    // 继续处理请求
    next()
  })
} 