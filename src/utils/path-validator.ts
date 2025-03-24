/**
 * 路径验证和规范化工具
 */

/**
 * 验证路径是否合法
 * @param path 要验证的路径
 * @throws 如果路径不合法，抛出错误
 */
export function validatePath(path: string): void {
  if (!path) {
    throw new Error('路由路径不能为空')
  }
  
  // 安全检查：防止路径遍历
  if (path.includes('..')) {
    throw new Error(`无效路径: "${path}"。路径不能包含".."`)
  }
  
  // 安全检查：检测非法字符
  const disallowedChars = /[\u0000-\u001F\u007F-\u009F\u00AD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u2028-\u202E\u2060-\u2064\u206A-\u206F\uFEFF\uFFF9-\uFFFC]/
  if (disallowedChars.test(path)) {
    throw new Error(`无效路径: "${path}"。路径包含非法字符`)
  }
}

/**
 * 规范化路径格式
 * - 确保路径以斜杠开头
 * - 移除重复的斜杠
 * - 移除结尾的斜杠（除非路径为根路径'/'）
 * 
 * @param pathStr 要规范化的路径
 * @returns 规范化后的路径
 */
export function normalizePath(pathStr: string): string {
  // 确保路径以斜杠开头
  let normalized = pathStr.startsWith('/') ? pathStr : `/${pathStr}`
  
  // 移除连续的斜杠
  while (normalized.includes('//')) {
    normalized = normalized.replace('//', '/')
  }
  
  // 移除尾部斜杠（除非路径只有根斜杠）
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  
  return normalized
}

/**
 * 组合路径，确保路径之间只有一个斜杠连接
 * @param basePath 基础路径
 * @param relativePath 相对路径
 * @returns 组合后的路径
 */
export function joinPaths(basePath: string, relativePath: string): string {
  let base = normalizePath(basePath)
  let relative = normalizePath(relativePath)
  
  // 如果相对路径是根路径，直接返回基础路径
  if (relative === '/') {
    return base
  }
  
  // 如果相对路径以基础路径开头，避免重复
  if (relative.startsWith(base + '/') || relative === base) {
    return relative
  }
  
  // 组合路径
  return `${base}${relative}`
}

/**
 * 提取URL路径中的查询参数
 * @param url 完整URL
 * @returns 不含查询参数的路径
 */
export function stripQueryParams(url: string): string {
  const questionMarkIndex = url.indexOf('?')
  return questionMarkIndex >= 0 ? url.substring(0, questionMarkIndex) : url
}

/**
 * 判断路径是否为绝对路径（以/开头）
 * @param path 要检查的路径
 * @returns 是否为绝对路径
 */
export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/')
}

/**
 * 比较两个URL路径是否匹配（忽略尾部斜杠和重复斜杠）
 * @param path1 第一个路径
 * @param path2 第二个路径
 * @returns 是否匹配
 */
export function pathsMatch(path1: string, path2: string): boolean {
  return normalizePath(path1) === normalizePath(path2)
} 