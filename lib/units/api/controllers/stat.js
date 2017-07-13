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
          // console.log(list)
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
            stat.push({'name':obj.group,'long':hours})
          })

          stat.sort(function(a,b){
            return b.long - a.long
          })

          stat.forEach(function(obj){
            labels.push(obj.name)
            dataset.push(obj.long)
          })

          labels = ['用户1','用户2','用户3','用户4','用户5','用户6','用户7','用户8','用户9','用户10','用户11','用户12','用户13','用户14','用户15','用户16','用户17','用户18','用户19','用户20','用户21','用户22','用户23','用户24','用户25','用户26','用户27']
          dataset = [27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]
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

