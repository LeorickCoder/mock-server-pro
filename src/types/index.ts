import { Application, Request, Response } from 'express';

export interface MockServerOptions {
  port?: number;
  prefix?: string;
  watchDir?: string;
  hotReload?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface MockServer {
  app: Application;
  start(): void;
  stop(): void;
  get(path: string, handler: (req: Request, res: Response) => void): void;
  post(path: string, handler: (req: Request, res: Response) => void): void;
  put(path: string, handler: (req: Request, res: Response) => void): void;
  delete(path: string, handler: (req: Request, res: Response) => void): void;
  patch(path: string, handler: (req: Request, res: Response) => void): void;
} 