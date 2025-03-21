const Mock = require('mockjs')

const getUserList = (page, pageSize) => {
  return {
    'list|10': [{
      'id|+1': 1,
      'name': '@cname',
      'email': '@email',
      'phone': /^1[3456789]\d{9}$/,
      'status|1': ['active', 'inactive'],
      'createTime': '@datetime'
    }],
    total: 100,
    page: Number(page),
    pageSize: Number(pageSize)
  }
}

const getUserById = (id) => {
  return {
    id: Number(id),
    name: '@cname',
    email: '@email',
    phone: /^1[3456789]\d{9}$/,
    status: '@pick(["active", "inactive"])',
    createTime: '@datetime',
    'roles|1-3': ['admin', 'editor', 'user']
  }
}

module.exports = {
  getUserList,
  getUserById
} 