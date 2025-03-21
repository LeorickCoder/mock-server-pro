const express = require('express')

module.exports = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}
