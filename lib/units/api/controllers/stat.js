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
          console.log(list)
          var labels = []
          var dataset = []
          var stat = []
          list.forEach(function(obj){
            // 计算所有记录的时长
            var total = 0;
            var records = obj['reduction'];
            records.forEach(function(record){
                var long = record['end'].getTime() - record['start'].getTime()
                total += long
            })

            // 转化成
            var hours = total/(60*60*1000)
            //dataset.push(hours)

            stat.push({'name':obj.group,'long':hours})
          })
          stat.sort(function(a,b){
            return b.long - a.long
          })

          stat.forEach(function(obj){
            labels.push(obj.name)
            dataset.push(obj.long)
          })

          res.json({
            success: true
            , labels: labels
            , dataset: dataset
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

