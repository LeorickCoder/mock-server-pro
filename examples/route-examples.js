/**
 * mock-server-pro 路由注册示例
 * 
 * 本文件展示了不同的路由注册方式
 */

// 标准模块导出方式
module.exports = function(ctx) {
  // 方式1: 带前缀路径 (完整路径)
  // 假设配置的前缀是 '/api'
  ctx.registerRoute('get', '/api/users', (req, res) => {
    res.json({
      code: 0,
      data: [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ]
    });
  });
  
  // 方式2: 相对路径 (自动添加前缀)
  ctx.registerRoute('get', 'products', (req, res) => {
    // 最终路径为: /api/products
    res.json({
      code: 0,
      data: [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' }
      ]
    });
  });
  
  // 方式3: 使用路径参数
  ctx.registerRoute('get', 'users/:id', (req, res) => {
    // 最终路径为: /api/users/:id
    // 可通过 req.params.id 获取参数
    const userId = req.params.id;
    
    res.json({
      code: 0,
      data: { id: userId, name: `User ${userId}` }
    });
  });
  
  // 注册 POST 请求
  ctx.registerRoute('post', 'users', (req, res) => {
    // 获取请求体数据
    const userData = req.body;
    
    res.json({
      code: 0,
      data: {
        id: Math.floor(Math.random() * 1000),
        ...userData,
        createdAt: new Date().toISOString()
      }
    });
  });
  
  // 注册中间件
  ctx.registerMiddleware('auth', (req, res, next) => {
    // 检查请求头中的 token
    const token = req.headers.authorization;
    
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未授权访问'
      });
    }
    
    // 通过验证，继续处理请求
    next();
  });
  
  // 注册需要授权的路由
  ctx.registerRoute('get', 'auth/profile', (req, res) => {
    // 由于上面注册了 'auth' 中间件，所有 /api/auth/... 的请求
    // 都会先经过 auth 中间件处理
    res.json({
      code: 0,
      data: {
        id: 1001,
        name: '当前用户',
        role: 'admin'
      }
    });
  });
};

// TypeScript模块示例 (route-example.ts)
/*
export default function(ctx: any) {
  // 类型安全的请求处理器
  ctx.registerRoute('get', 'typescript/data', (req, res) => {
    interface ResponseData {
      code: number;
      data: {
        items: Array<{ id: number; name: string }>;
      };
    }
    
    const response: ResponseData = {
      code: 0,
      data: {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      }
    };
    
    res.json(response);
  });
}
*/ 