import { Request, Response, NextFunction } from 'express'
import { logger } from '../../utils/logger'

export function corsMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // 设置跨域头
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
      return
    }

    // 记录请求信息
    logger.debug(`[${req.method}] ${req.path}`)
    next()
  }
} 