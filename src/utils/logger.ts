const isDev = process.env.NODE_ENV === 'development';
const isDebug = process.env.DEBUG === 'true';

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

function getTimestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

function formatLogMessage(level: string, message: string): string {
  return `${getTimestamp()} [${level}] ${message}`;
}

/**
 * 创建一个格式化的日志记录器
 */
export const logger: Logger = {
  /**
   * 调试级别日志，仅在调试模式下输出
   */
  debug: (message: string, ...args: any[]) => {
    if (isDebug) {
      if (args.length > 0) {
        console.debug(formatLogMessage('DEBUG', message), ...args);
      } else {
        console.debug(formatLogMessage('DEBUG', message));
      }
    }
  },

  /**
   * 信息级别日志
   */
  info: (message: string, ...args: any[]) => {
    if (isDev || isDebug) {
      if (args.length > 0) {
        console.info(formatLogMessage('INFO', message), ...args);
      } else {
        console.info(formatLogMessage('INFO', message));
      }
    }
  },

  /**
   * 警告级别日志，始终输出
   */
  warn: (message: string, ...args: any[]) => {
    if (args.length > 0) {
      console.warn(formatLogMessage('WARN', message), ...args);
    } else {
      console.warn(formatLogMessage('WARN', message));
    }
  },

  /**
   * 错误级别日志，始终输出
   */
  error: (message: string, ...args: any[]) => {
    if (args.length > 0) {
      console.error(formatLogMessage('ERROR', message), ...args);
    } else {
      console.error(formatLogMessage('ERROR', message));
    }
  }
}; 