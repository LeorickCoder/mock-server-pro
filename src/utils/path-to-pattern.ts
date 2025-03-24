/**
 * 路径模式解析工具
 * 将Express风格的路径模式(如 /users/:id/posts/:postId)转换为正则表达式和参数列表
 */

export interface PathPattern {
  /** 原始路径模式 */
  pattern: string;
  /** 转换后的正则表达式 */
  regex: RegExp;
  /** 路径中提取的参数名称列表 */
  params: string[];
}

/**
 * 参数段匹配的正则表达式
 * 匹配形如 :paramName 的路径段
 */
const PARAM_REGEX = /:([a-zA-Z0-9_]+)/g;

/**
 * 将路径模式转换为正则表达式和参数列表
 * @param path 路径模式，如 /users/:id/profile
 * @returns 包含正则表达式和参数列表的对象
 */
export function pathToPattern(path: string): PathPattern {
  // 提取所有参数名
  const params: string[] = [];
  let match: RegExpExecArray | null;
  let processedPath = path;
  
  // 重置正则表达式
  PARAM_REGEX.lastIndex = 0;
  
  // 查找所有参数并收集名称
  while ((match = PARAM_REGEX.exec(path)) !== null) {
    params.push(match[1]);
  }
  
  // 将参数替换为正则表达式捕获组
  processedPath = path.replace(/:([a-zA-Z0-9_]+)/g, '([^/]+)');
  
  // 处理尾部可选斜杠
  if (processedPath.endsWith('/')) {
    processedPath = processedPath.slice(0, -1) + '/?';
  } else {
    processedPath = processedPath + '/?';
  }
  
  // 确保完全匹配，添加开始和结束锚点
  const regexPattern = `^${processedPath}$`;
  
  return {
    pattern: path,
    regex: new RegExp(regexPattern),
    params
  };
}

/**
 * 从URL路径和路径模式中提取参数
 * @param url 请求URL
 * @param pattern 路径模式
 * @returns 提取的参数对象
 */
export function extractParams(url: string, pattern: PathPattern): Record<string, string> {
  const match = pattern.regex.exec(url);
  
  if (!match) {
    return {};
  }
  
  const params: Record<string, string> = {};
  
  // 从正则匹配的捕获组中提取参数
  // match[0]是完整匹配，所以从1开始
  for (let i = 1; i < match.length; i++) {
    const paramName = pattern.params[i - 1];
    if (paramName) {
      params[paramName] = match[i];
    }
  }
  
  return params;
}

/**
 * 检查URL是否匹配给定的路径模式
 * @param url 请求URL
 * @param pattern 路径模式
 * @returns 是否匹配
 */
export function matchPath(url: string, pattern: PathPattern): boolean {
  return pattern.regex.test(url);
}

/**
 * 对路径模式数组进行排序，确保更具体的路径先匹配
 * 这样可以避免 /users/:id 匹配到应该由 /users/profile 处理的请求
 * 
 * 排序规则:
 * 1. 静态段越多的路径优先级越高
 * 2. 参数段越少的路径优先级越高
 * 3. 路径总长度越长的优先级越高
 * 
 * @param patterns 路径模式数组
 * @returns 排序后的路径模式数组
 */
export function sortPatterns<T extends PathPattern>(patterns: T[]): T[] {
  return [...patterns].sort((a, b) => {
    // 计算静态段数量（非参数段）
    const aStaticSegments = a.pattern.split('/').filter(s => s && !s.startsWith(':')).length;
    const bStaticSegments = b.pattern.split('/').filter(s => s && !s.startsWith(':')).length;
    
    // 静态段数量不同，静态段多的优先
    if (aStaticSegments !== bStaticSegments) {
      return bStaticSegments - aStaticSegments;
    }
    
    // 静态段数量相同，比较参数段数量，参数少的优先
    if (a.params.length !== b.params.length) {
      return a.params.length - b.params.length;
    }
    
    // 参数段数量也相同，比较路径长度，长的优先
    return b.pattern.length - a.pattern.length;
  });
} 