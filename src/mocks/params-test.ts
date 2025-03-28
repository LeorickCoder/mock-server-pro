/**
 * 参数化路由测试模块
 * 
 * 这个模块用于测试路径参数的提取和使用
 */
module.exports = function(ctx) {
  /**
   * 路由模块名称
   */
  const name = 'params-test';

  /**
   * 模块初始化函数
   */
  // 1. 基本参数化路由
  ctx.registerRoute('get', '/users/:id', (req, res) => {
    res.json({
      id: req.params.id,
      name: `User ${req.params.id}`,
      type: 'basic'
    });
  });

  // 2. 多参数路由
  ctx.registerRoute('get', '/users/:userId/posts/:postId', (req, res) => {
    res.json({
      userId: req.params.userId,
      postId: req.params.postId,
      type: 'multi-params'
    });
  });

  // 3. 可选参数路由 (Express不直接支持可选参数，但我们可以分别定义两个路由)
  ctx.registerRoute('get', '/items/:id?', (req, res) => {
    if (req.params.id) {
      res.json({
        id: req.params.id,
        name: `Item ${req.params.id}`,
        type: 'optional'
      });
    } else {
      res.json({
        items: [1, 2, 3].map(id => ({
          id,
          name: `Item ${id}`,
          type: 'optional'
        }))
      });
    }
  });

  // 4. 参数化PUT请求
  ctx.registerRoute('put', '/users/:id', (req, res) => {
    res.json({
      id: req.params.id,
      ...req.body,
      updated: true,
      type: 'put'
    });
  });

  // 5. 参数化DELETE请求
  ctx.registerRoute('delete', '/users/:id', (req, res) => {
    res.json({
      id: req.params.id,
      deleted: true,
      type: 'delete'
    });
  });

  // 6. 带正则表达式限制的参数
  // 注意: Express原生支持正则限制，但我们的实现可能需要额外处理
  ctx.registerRoute('get', '/products/:id(\\d+)', (req, res) => {
    res.json({
      id: req.params.id,
      name: `Product ${req.params.id}`,
      type: 'regex'
    });
  });

  // 7. 通配符路径（*）
  ctx.registerRoute('get', '/files/*', (req, res) => {
    res.json({
      path: req.params[0],
      type: 'wildcard'
    });
  });

  // 8. 中间件测试，提取URL参数
  ctx.registerMiddleware('/secure/*', (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    if (token !== 'Bearer test-token') {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    next();
  });

  // 认证后的路由
  ctx.registerRoute('get', '/secure/data/:type', (req, res) => {
    res.json({
      type: req.params.type,
      data: `Protected data for ${req.params.type}`,
      timestamp: new Date().toISOString()
    });
  });

  return { name };
}; 