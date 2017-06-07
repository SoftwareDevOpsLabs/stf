var util = require('util')

var _ = require('lodash')
var Promise = require('bluebird')
var uuid = require('uuid')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')

var log = logger.createLogger('api:controllers:testing')

module.exports = {
  getTestingList: getTestingList
, getTestingReport: getTestingReport
, getTestcaseList: getTestcaseList
, getTestingPieChart: getTestingPieChart
, getTestingBarChart: getTestingBarChart
, getTestingTypes: getTestingTypes
}

// 获取测试列表
function getTestingList(req, res) {
  var status = req.swagger.params.status.value
  var fields = req.swagger.params.fields.value
  var start_time = req.body.start_time
  var end_time = req.body.end_time
  var test_type = req.body.test_type||""
  console.log(start_time)
  console.log(end_time)
  console.log(test_type)

  dbapi.loadTestingList(status, start_time, end_time, test_type)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          res.json({
            success: true
          , testings: list
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

// @hy 2017-05-18 added for test template
function getTestcaseList(req, res) {
  var status = req.swagger.params.status.value
  dbapi.loadTestcaseList(status)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          res.json({
            success: true
          , testcases: list
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


// 获取测试报告的详情
function getTestingReport(req, res) {
  var id = req.swagger.params.id.value
  var fields = req.swagger.params.fields.value


  dbapi.loadTestingReport(id)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          res.json({
            success: true
            , reports: list
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

// 获取饼图的数据
function getTestingPieChart(req, res){
  var name = req.swagger.params.name.value
  var fields = req.swagger.params.fields.value
  var start_time = req.body.start_time
  var end_time = req.body.end_time
  var test_type = req.body.test_type

  dbapi.loadTestingPieStat(name, start_time, end_time, test_type)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          console.log(list)
          var stat = []
          // 添加排序操作
          stat.sort(function(a,b){
            return b.reduction.length - a.reduction.length
          })
          list.forEach(function(obj){
            stat.push([obj.group,obj.reduction.length])
          })
          
          res.json({
            success: true
            , stat: stat
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

// 获取直方图的数据
function getTestingBarChart(req, res){
  var name = req.swagger.params.name.value
  var fields = req.swagger.params.fields.value
  var start_time = req.body.start_time
  var end_time = req.body.end_time
  var test_type = req.body.test_type

  dbapi.loadTestingBarStat(name, start_time, end_time, test_type)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          console.log(list)
          var labels = []
          var dataset = []

          // 添加排序操作
          list.sort(function(a,b){
            return b.reduction.length - a.reduction.length
          })

          list.forEach(function(obj){
            labels.push(obj.group)
            dataset.push(obj.reduction.length)
          })
          res.json({
            success: true
            , labels: labels
            , dataset: dataset
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

// 获取所有的测试类型
function getTestingTypes(req, res){
  dbapi.loadTestingTypes()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          res.json({
            success: true
            , types: list
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}




