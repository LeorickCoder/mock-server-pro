import { RouteHandler } from 'mock-server-pro';

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

export const getUserList: RouteHandler = (req, res) => {
  res.json({
    code: 0,
    data: users,
    message: 'Success'
  });
};

export const getUserById: RouteHandler = (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === Number(id));
  
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: 'User not found'
    });
  }

  res.json({
    code: 0,
    data: user,
    message: 'Success'
  });
};

export default {
  'GET /users': getUserList,
  'GET /users/:id': getUserById
}; 