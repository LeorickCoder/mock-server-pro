const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

const getUserList = (req, res) => {
  res.json({
    code: 0,
    data: users,
    message: 'Success'
  });
};

const getUserById = (req, res) => {
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

module.exports = {
  'GET /users': getUserList,
  'GET /users/:id': getUserById
}; 