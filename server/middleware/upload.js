const multiparty = require('multiparty')
const Mock = require('mockjs')
const path = require('path')

// 添加文件类型和大小限制
const uploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  tempDir: path.join(process.cwd(), 'temp')
}

// 添加清理逻辑
function cleanupTempFiles() {
  // 定期清理临时文件
}

module.exports = function(req, res, next) {
  if (req.method !== 'POST') {
    return next()
  }

  const form = new multiparty.Form({
    maxFilesSize: 2 * 1024 * 1024, // 限制文件大小为 2MB
    autoFiles: true
  })
  
  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err)
    }
    
    if (!files || !files.file || !files.file[0]) {
      return res.status(400).send({
        code: 400,
        message: '未检测到上传文件',
        data: null
      })
    }
    
    try {
      const file = files.file[0]
      res.send({
        code: 200,
        data: {
          fileUrl: Mock.Random.image('200x200'),
          fileName: file.originalFilename,
          fileSize: file.size,
          fileType: file.headers['content-type']
        },
        message: '上传成功'
      })
    } catch (error) {
      next(error)
    }
  })
} 