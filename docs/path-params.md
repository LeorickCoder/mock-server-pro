# 参数化路由实现文档

Mock Server Pro 现已支持参数化路由功能，允许在路由中定义动态参数，使路由定义更加灵活强大。本文档详细介绍了该功能的实现原理、使用方法和示例。

## 功能特性

参数化路由功能允许：

1. 定义包含变量段的路由路径，例如 `/api/users/:id`
2. 自动从请求URL中提取路径参数
3. 在请求处理函数中通过 `req.params` 访问提取的参数
4. 支持多参数路由，例如 `/api/users/:userId/posts/:postId`
5. 支持带正则限制的参数，例如 `/api/items/:id([0-9]+)`
6. 支持通配符路径，例如 `/api/files/*`
7. 在中间件中使用和访问路径参数

## 实现原理

参数化路由功能主要通过以下几个关键模块实现：

### 1. 路径模式转换 (`path-to-pattern.ts`)

该工具模块提供以下功能：

- `pathToPattern`: 将Express风格的路径转换为正则表达式和参数列表
- `extractParams`: 从URL中提取参数值
- `matchPath`: 检查URL是否匹配给定的路径模式
- `sortPatterns`: 对路由定义进行排序，确保更具体的路径先匹配

### 2. 路由定义扩展 (`types.ts`)

为了支持参数化路由，扩展了多个类型定义：

- `RouteDefinition`: 包含路径模式、方法、处理函数等信息
- `RequestWithParams`: 扩展Express请求对象，包含路径参数

### 3. 分发器优化 (`dispatcher.ts`)

优化了路由分发器，使其支持参数化路由：

- 使用数组存储路由定义，而不是简单的Map
- 实现了基于模式匹配的路由查找算法
- 添加了参数提取和注入功能
- 优化了缓存机制，提高性能

## 使用方法

### 基本用法

定义一个带参数的路由：

```javascript
// 在模块的setup函数中
ctx.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({
    userId: userId,
    message: `获取用户 ${userId} 的信息`
  });
});
```

### 多参数路由

```javascript
ctx.get('/api/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.json({
    userId: userId,
    postId: postId,
    message: `获取用户 ${userId} 的帖子 ${postId}`
  });
});
```

### 带正则限制的参数

```javascript
// 仅匹配数字ID
ctx.get('/api/items/:id([0-9]+)', (req, res) => {
  const itemId = req.params.id;
  res.json({
    itemId: itemId,
    message: `获取物品 ${itemId} 的信息`
  });
});
```

### 通配符路径

```javascript
ctx.get('/api/files/*', (req, res) => {
  const filePath = req.params[0];
  res.json({
    filePath: filePath,
    message: `获取文件: ${filePath}`
  });
});
```

### 在中间件中使用参数

```javascript
ctx.use('/api/auth/:token', (req, res, next) => {
  const token = req.params.token;
  if (isValidToken(token)) {
    next();
  } else {
    res.status(401).json({ message: '无效的令牌' });
  }
});
```

## 路径匹配算法

路由匹配遵循以下规则：

1. 静态路径段优先于参数化路径段
2. 更具体的路径模式优先于通用模式
3. 越早注册的路由优先级越高（如果其他条件相同）

## 性能优化

为确保高性能，实现了以下优化：

1. 路由排序: 预先对路由进行排序，确保匹配效率
2. 请求缓存: 缓存已匹配的路由，减少重复计算
3. 正则优化: 优化正则表达式，提高匹配速度

## 示例项目

`dev-project` 目录中包含了一个完整的示例项目，演示了参数化路由的各种使用场景：

- `dev-project/src/mocks/params-test.ts`: 包含各种参数化路由示例
- `dev-project/public/http-test.html`: 提供了测试界面

## 局限性和未来改进

当前实现仍有一些局限性，未来计划进行以下改进：

1. 优化复杂正则表达式的性能
2. 添加更灵活的参数验证机制
3. 支持可选参数的更优雅语法
4. 添加路径参数预处理钩子函数
5. 实现更好的错误处理机制

## 与Express兼容性

本实现尽可能保持与Express路由参数语法的兼容性，但由于是独立实现，可能存在细微差异：

1. 参数提取使用自定义实现，而不是依赖Express内部机制
2. 正则参数语法兼容性有限
3. 一些高级功能（如可选参数语法）可能有差异

## FAQ

**Q: 路径参数会影响性能吗？**
A: 参数化路由的匹配算法比静态路由稍慢，但通过缓存机制已最小化此影响。对于大多数应用场景，性能差异可忽略不计。

**Q: 参数值会被转换或验证吗？**
A: 当前版本提取的参数是字符串类型，没有自动进行类型转换或验证。您需要在处理函数中手动验证和转换类型。

**Q: 如何处理URL编码的参数？**
A: 参数值是URL解码后的，无需手动解码。

**Q: 是否支持通配符和正则表达式？**
A: 是的，支持通配符(*) 和正则表达式，例如 `/api/items/:id([0-9]+)`，但不支持某些Express特有的高级模式。 