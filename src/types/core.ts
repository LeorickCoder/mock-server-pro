export interface TypeScriptConfig {
  // 自定义TypeScript文件加载器
  loader?: (filePath: string) => any;
  // TypeScript编译器选项
  compilerOptions?: Record<string, any>;
  // 是否启用sourcemap (用于调试)
  sourcemap?: boolean;
}

export interface RouteConfig {
  // 是否允许路由覆盖
  allowOverride?: boolean;
  // 路径检查模式: 'strict' | 'auto'
  // strict - 严格要求路径格式，必须符合前缀规范
  // auto - 自动处理路径格式，添加或保持前缀
  pathMode?: 'strict' | 'auto';
}

export interface PrefixConfig {
  // 前缀值
  value: string;
  // 前缀处理模式
  // append - 应用级别挂载时，路径会附加前缀（如app.use(dispatcher.middleware())）
  // mount - 路由级别挂载时，路径不附加前缀（如app.use('/api', dispatcher.middleware())）
  // auto - 自动检测挂载方式（推荐）
  mode: 'append' | 'mount' | 'auto';
  // 是否启用基路径检测（用于自动模式）
  detectBasePath?: boolean;
}

export interface Config {
  base: {
    // 基本路径前缀
    prefix: string;
    // 前缀高级配置
    prefixConfig?: PrefixConfig;
  };
  request: {
    timeout: number;
    maxConcurrent: number;
    bodyLimit: string;
  };
  hotReload: {
    enabled: boolean;
    ignored: string[];
    stabilityThreshold?: number;
    pollInterval?: number;
  };
  modules: {
    dir: string;           // 模块目录路径
    pattern: string;       // 模块文件匹配模式
    recursive: boolean;    // 是否递归查找子目录
    ignore: string[];     // 忽略的文件模式
  };
  // 路由配置
  routes?: RouteConfig;
  // TypeScript支持配置
  typescript?: TypeScriptConfig;
  // 调试模式
  debug?: boolean;
} 