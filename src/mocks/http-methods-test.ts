import { ModuleContext } from '../../../src/server/types';

/**
 * 此模块用于测试不同HTTP方法是否正常工作
 */
export default function(ctx: ModuleContext) {
  // GET 请求测试
  ctx.get('/http-test/get', (req, res) => {
    res.json({
      method: 'GET',
      success: true,
      message: '成功处理GET请求',
      query: req.query,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
  });

  // POST 请求测试
  ctx.post('/http-test/post', (req, res) => {
    res.json({
      method: 'POST',
      success: true,
      message: '成功处理POST请求',
      body: req.body,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
  });

  // PUT 请求测试
  ctx.put('/http-test/put', (req, res) => {
    res.json({
      method: 'PUT',
      success: true,
      message: '成功处理PUT请求',
      body: req.body,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
  });

  // 带路径参数的PUT请求测试
  ctx.put('/http-test/put/:id', (req, res) => {
    res.json({
      method: 'PUT',
      success: true,
      message: '成功处理带参数的PUT请求',
      id: req.params.id,
      body: req.body,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
  });

  // DELETE 请求测试
  ctx.delete('/http-test/delete/:id', (req, res) => {
    res.json({
      method: 'DELETE',
      success: true,
      message: '成功处理DELETE请求',
      id: req.params.id,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
  });

  // PATCH 请求测试
  ctx.patch('/http-test/patch/:id', (req, res) => {
    res.json({
      method: 'PATCH',
      success: true,
      message: '成功处理PATCH请求',
      id: req.params.id,
      body: req.body,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
  });

  // OPTIONS 请求测试
  ctx.options('/http-test/options', (req, res) => {
    res.json({
      method: 'OPTIONS',
      success: true,
      message: '成功处理OPTIONS请求',
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
  });
  
  // HEAD 请求测试
  ctx.head('/http-test/head', (req, res) => {
    // HEAD 请求不应该有响应体，只设置状态码和头部
    res.status(200).set('X-Test-Header', 'head-test-success').end();
  });
} 