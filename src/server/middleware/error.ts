import { Request, Response, NextFunction } from 'express'
import { logger } from '../../utils/logger'

export function errorMiddleware() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    // 记录错误信息，包括请求路径和方法
    logger.error('Request error', {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })

    res.status(500).json({
      error: {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    })
  }
} 