import { Request, Response, NextFunction } from 'express'
import { logger } from '../../utils/logger'

export function timeoutMiddleware(timeout: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      logger.warn('Request timeout', {
        path: req.path,
        method: req.method,
        timeout
      })
      
      res.status(408).json({
        error: {
          message: 'Request timeout'
        }
      })
    }, timeout)

    res.on('finish', () => {
      clearTimeout(timer)
    })

    next()
  }
} 