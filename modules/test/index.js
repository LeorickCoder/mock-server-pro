const Mock = require('mockjs')
const multiparty = require('multiparty')

const testApi = (router) => {
  // 测试 GET 请求
  router.get('/test', (req, res) => {
    res.json({
      code: 200,
      data: Mock.mock({
        'id|+1': 1,
        name: '@cname',
        time: '@datetime',
        'status|1': ['active', 'inactive']
      }),
      message: 'success'
    })
  })

  // 测试文件上传
  router.post('/test/upload', (req, res) => {
    const form = new multiparty.Form()
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          message: '上传失败',
          error: err.message
        })
      }
      res.json({
        code: 200,
        data: {
          fields,
          files
        },
        message: '上传成功'
      })
    })
  })
}

module.exports = testApi 