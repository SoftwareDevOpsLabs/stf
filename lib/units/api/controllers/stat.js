var util = require('util')

var _ = require('lodash')
var Promise = require('bluebird')
var uuid = require('uuid')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')

var log = logger.createLogger('api:controllers:stat')

module.exports = {
  loadUserDeviceStat: loadUserDeviceStat,
  loadRecordsStat: loadRecordsStat
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


// 获取测试列表
function loadRecordsStat(req, res) {
  var fields = req.swagger.params.fields.value
  var start_time = req.body.start_time
  var end_time = req.body.end_time
  var type = req.body.type

  dbapi.loadRecordsStat(start_time, end_time, type)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          console.log(list)
          var labels = []
          var dataset = []
          var stats = []
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
            stats.push({'name':obj.group,'long':hours})
          })

          stats.sort(function(a,b){
            return b.long - a.long
          })

          // 测试数据
          stats = [
            {'name':'2017-07-01','long':5},
            {'name':'2017-07-02','long':15},
            {'name':'2017-07-03','long':25},
            {'name':'2017-07-04','long':35},
            {'name':'2017-07-05','long':45},
            {'name':'2017-07-06','long':55},
            {'name':'2017-07-07','long':45},
            {'name':'2017-07-08','long':35},
            {'name':'2017-07-09','long':25},
            {'name':'2017-07-10','long':15},
            {'name':'2017-07-11','long':5},
            {'name':'2017-07-12','long':55},
            {'name':'2017-07-13','long':55},
            {'name':'2017-07-14','long':55},
            {'name':'2017-07-15','long':55},
            {'name':'2017-07-16','long':55},
            {'name':'2017-07-17','long':55},
            {'name':'2017-07-18','long':55},
            {'name':'2017-07-19','long':55},
            {'name':'2017-07-20','long':55},
            {'name':'2017-07-21','long':55},
            {'name':'2017-07-22','long':55},
            {'name':'2017-07-23','long':55},
            {'name':'2017-07-24','long':55},
            {'name':'2017-07-25','long':55}
          ]

          res.json({
            success: true
            , stats: stats
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
