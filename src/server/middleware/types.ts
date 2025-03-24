import { Request, Response, NextFunction } from 'express'

export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>

export interface ErrorResponse {
  code: number
  message: string
  stack?: string
}

export interface TimeoutConfig {
  timeout: number
  errorMessage?: string
} 