import { ModuleContext } from '../../../src/server/types';

export default function(ctx: ModuleContext) {
  // 获取用户列表
  ctx.get('/api/users', (req, res) => {
    res.json({
      code: 0,
      data: [
        { id: 1, name: '张三', age: 28 },
        { id: 2, name: '李四', age: 32 },
        { id: 3, name: '王五', age: 25 }
      ],
      message: 'success'
    });
  });

  // 获取单个用户
  ctx.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    // 模拟查找用户
    const user = {
      id,
      name: id === 1 ? '张三' : id === 2 ? '李四' : '王五',
      age: 20 + id * 3,
      email: `user${id}@example.com`,
      avatar: `https://randomuser.me/api/portraits/men/${id}.jpg`
    };
    
    res.json({
      code: 0,
      data: user,
      message: 'success'
    });
  });

  // 创建用户
  ctx.post('/api/users', (req, res) => {
    // 模拟创建用户并返回
    const newUser = {
      ...req.body,
      id: Math.floor(Math.random() * 1000) + 10
    };
    
    res.status(201).json({
      code: 0,
      data: newUser,
      message: '用户创建成功'
    });
  });

  // 更新用户
  ctx.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    res.json({
      code: 0,
      data: {
        id,
        ...req.body,
        updatedAt: new Date().toISOString()
      },
      message: '用户更新成功'
    });
  });

  // 删除用户
  ctx.delete('/api/users/:id', (req, res) => {
    res.json({
      code: 0,
      data: null,
      message: '用户删除成功'
    });
  });
} 