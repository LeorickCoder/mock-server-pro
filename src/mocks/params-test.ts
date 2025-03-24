/**
 * 参数化路由测试模块
 * 
 * 这个模块用于测试路径参数的提取和使用
 */

export default {
  /**
   * 路由模块名称
   */
  name: 'params-test',

  /**
   * 模块初始化函数
   */
  setup: (ctx) => {
    // 1. 基本参数化路由
    ctx.get('/api/users/:id', (req, res) => {
      res.json({
        success: true,
        message: '获取用户详情成功',
        params: req.params,
        id: req.params.id
      })
    })

    // 2. 多参数路由
    ctx.get('/api/users/:userId/posts/:postId', (req, res) => {
      res.json({
        success: true,
        message: '获取用户帖子详情成功',
        params: req.params,
        userId: req.params.userId,
        postId: req.params.postId
      })
    })

    // 3. 可选参数路由 (Express不直接支持可选参数，但我们可以分别定义两个路由)
    ctx.get('/api/products/:id?', (req, res) => {
      if (req.params.id) {
        res.json({
          success: true,
          message: '获取产品详情成功',
          params: req.params,
          id: req.params.id
        })
      } else {
        res.json({
          success: true,
          message: '获取所有产品成功',
          params: req.params
        })
      }
    })

    // 4. 参数化PUT请求
    ctx.put('/api/users/:id', (req, res) => {
      res.json({
        success: true,
        message: '更新用户成功',
        params: req.params,
        id: req.params.id,
        body: req.body
      })
    })

    // 5. 参数化DELETE请求
    ctx.delete('/api/users/:id', (req, res) => {
      res.json({
        success: true,
        message: '删除用户成功',
        params: req.params,
        id: req.params.id
      })
    })

    // 6. 带正则表达式限制的参数
    // 注意: Express原生支持正则限制，但我们的实现可能需要额外处理
    ctx.get('/api/items/:id([0-9]+)', (req, res) => {
      res.json({
        success: true,
        message: '获取物品详情成功',
        params: req.params,
        id: req.params.id,
        note: '仅接受数字ID'
      })
    })

    // 7. 通配符路径（*）
    ctx.get('/api/files/*', (req, res) => {
      // 在Express中，通配符内容会被捕获到req.params[0]中
      const filePath = req.params[0] || ''
      res.json({
        success: true,
        message: '获取文件详情成功',
        filePath: filePath,
        params: req.params
      })
    })

    // 8. 中间件测试，提取URL参数
    ctx.use('/api/auth/:token', (req, res, next) => {
      const token = req.params.token
      if (token === 'valid-token') {
        // 通过，继续下一个处理器
        next()
      } else {
        // 拒绝请求
        res.status(401).json({
          success: false,
          message: '无效的认证令牌',
          token: token
        })
      }
    })

    // 认证后的路由
    ctx.get('/api/auth/:token/profile', (req, res) => {
      res.json({
        success: true,
        message: '获取个人资料成功',
        token: req.params.token,
        profile: {
          id: 1,
          name: '测试用户',
          email: 'test@example.com'
        }
      })
    })
  }
} 