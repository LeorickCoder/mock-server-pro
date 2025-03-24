import { ModuleContext } from '../../../src/server/types';

/**
 * 此模块用于测试不同格式的路径注册
 * 包括:
 * 1. 相对路径（不以/开头）
 * 2. 带前缀的绝对路径
 * 3. 不带前缀的绝对路径
 * 4. 带尾斜杠的路径
 * 5. 带重复斜杠的路径
 */
export default function(ctx: ModuleContext) {
  // 1. 相对路径（不带前导斜杠）
  ctx.get('path-test/relative', (req, res) => {
    res.json({
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      method: req.method,
      type: '相对路径',
      description: '不带前导斜杠的相对路径'
    });
  });

  // 2. 带前缀的绝对路径
  ctx.get('/api/path-test/absolute-with-prefix', (req, res) => {
    res.json({
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      method: req.method,
      type: '带前缀的绝对路径',
      description: '以/api开头的绝对路径'
    });
  });

  // 3. 不带前缀的绝对路径
  ctx.get('/path-test/absolute-without-prefix', (req, res) => {
    res.json({
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      method: req.method,
      type: '不带前缀的绝对路径',
      description: '以/开头但不带/api前缀的绝对路径'
    });
  });

  // 4. 带尾斜杠的路径
  ctx.get('/path-test/trailing-slash/', (req, res) => {
    res.json({
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      method: req.method,
      type: '带尾斜杠的路径',
      description: '路径末尾带有/'
    });
  });

  // 5. 带重复斜杠的路径
  ctx.get('/path-test//double//slash', (req, res) => {
    res.json({
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      method: req.method,
      type: '带重复斜杠的路径',
      description: '路径中包含连续的//'
    });
  });

  // 6. 查询参数测试
  ctx.get('/path-test/query', (req, res) => {
    res.json({
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      query: req.query,
      method: req.method,
      type: '查询参数测试',
      description: '测试带查询参数的请求处理'
    });
  });

  // 7. 在路由级挂载时的路径测试
  ctx.get('users/route-mount-test', (req, res) => {
    res.json({
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      method: req.method,
      type: '路由级挂载测试',
      description: '测试在路由级挂载时的路径处理'
    });
  });
} 