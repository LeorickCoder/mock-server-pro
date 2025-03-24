import { ModuleContext } from 'mock-server-pro'
import type { Request, Response, NextFunction } from 'express'
import type { UploadedFile } from 'express-fileupload'

// 用户数据存储
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' }
]

let nextId = 3

export default function(dispatcher: ModuleContext) {
  // 获取用户列表
  dispatcher.registerRoute('get', '/api/users', async (req: Request, res: Response) => {
    res.json(users)
  })

  // 获取单个用户
  dispatcher.registerRoute('get', '/api/users/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const user = users.find(u => u.id === id)
    
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: '用户不存在' })
    }
  })

  // 创建用户
  dispatcher.registerRoute('post', '/api/users', async (req: Request, res: Response) => {
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
  dispatcher.registerRoute('put', '/api/users/:id', async (req: Request, res: Response) => {
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
  dispatcher.registerRoute('delete', '/users/:id', async (req: Request, res: Response) => {
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
  dispatcher.registerRoute('post', '/upload', async (req: any, res: Response) => {
    const file = req.files?.file as UploadedFile | undefined
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
  dispatcher.registerMiddleware('/admin', async (req: Request, res: Response, next: NextFunction) => {
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