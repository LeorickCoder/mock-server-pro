const Mock = require('mockjs')
const userData = require('./data')

module.exports = function(router) {
  // 用户列表
  router.get('/user/list', (req, res) => {
    const { page = 1, pageSize = 10 } = req.query
    const list = Mock.mock(userData.getUserList(page, pageSize))
    res.send({
      code: 200,
      data: list,
      message: 'success'
    })
  })
  
  // 用户详情
  router.get('/user/:id', (req, res) => {
    const { id } = req.params
    const user = Mock.mock(userData.getUserById(id))
    res.send({
      code: 200,
      data: user,
      message: 'success'
    })
  })
} 