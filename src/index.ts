import express from 'express';
import { MockServer, MockServerOptions } from './types';
import { setupHotReload } from './hot-reload';
import { setupLogger } from './utils/logger';

export class MockServerImpl implements MockServer {
  public app: express.Application;
  private server: any;
  private options: Required<MockServerOptions>;

  constructor(options: MockServerOptions = {}) {
    this.options = {
      port: options.port || 3000,
      prefix: options.prefix || '',
      watchDir: options.watchDir || process.cwd(),
      hotReload: options.hotReload ?? true,
      logLevel: options.logLevel || 'info'
    };

    this.app = express();
    setupLogger(this.options.logLevel);

    if (this.options.hotReload) {
      setupHotReload(this.options.watchDir);
    }
  }

  public start(): void {
    this.server = this.app.listen(this.options.port, () => {
      console.log(`Mock server is running on port ${this.options.port}`);
    });
  }

  public stop(): void {
    if (this.server) {
      this.server.close();
      console.log('Mock server stopped');
    }
  }

  public get(path: string, handler: (req: express.Request, res: express.Response) => void): void {
    this.app.get(this.options.prefix + path, handler);
  }

  public post(path: string, handler: (req: express.Request, res: express.Response) => void): void {
    this.app.post(this.options.prefix + path, handler);
  }

  public put(path: string, handler: (req: express.Request, res: express.Response) => void): void {
    this.app.put(this.options.prefix + path, handler);
  }

  public delete(path: string, handler: (req: express.Request, res: express.Response) => void): void {
    this.app.delete(this.options.prefix + path, handler);
  }

  public patch(path: string, handler: (req: express.Request, res: express.Response) => void): void {
    this.app.patch(this.options.prefix + path, handler);
  }
}

export function createMockServer(options?: MockServerOptions): MockServer {
  return new MockServerImpl(options);
} 