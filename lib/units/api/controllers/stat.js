var util = require('util')

var _ = require('lodash')
var Promise = require('bluebird')
var uuid = require('uuid')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')

var log = logger.createLogger('api:controllers:stat')

module.exports = {
  loadUserDeviceStat: loadUserDeviceStat
}

// 获取测试列表
function loadUserDeviceStat(req, res) {
  var name = req.swagger.params.name.value
  var fields = req.swagger.params.fields.value
  var start_time = req.body.start_time
  var end_time = req.body.end_time

  dbapi.loadUserDeviceStat(start_time, end_time, name)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          var stat = []
          // 添加排序操作
          stat.sort(function(a,b){
            return b.reduction.length - a.reduction.length
          })
          list.forEach(function(obj){
            stat.push([obj.group,obj.reduction.length])
          })
          console.log(list)
          res.json({
            success: true
          , stat: stat
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device list: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

