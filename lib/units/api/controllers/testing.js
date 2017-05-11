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
, getTestingPieChart: getTestingPieChart
, getTestingBarChart: getTestingBarChart
}

function getTestingList(req, res) {
  var status = req.swagger.params.status.value
  var fields = req.swagger.params.fields.value
  dbapi.loadTestingList(status)
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

function getTestingReport(req, res) {
  var id = req.swagger.params.id.value
  var fields = req.swagger.params.fields.value


  console.log('报告的参数',fields)

  dbapi.loadTestingReport(id)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          console.log(list)
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

function getTestingPieChart(req, res){
  var name = req.swagger.params.name.value
  var fields = req.swagger.params.fields.value
  dbapi.loadTestingPieStat(name)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          console.log(list)
          var stat = []
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


function getTestingBarChart(req, res){
  var name = req.swagger.params.name.value
  var fields = req.swagger.params.fields.value
  dbapi.loadTestingBarStat(name)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          console.log(list)
          var labels = []
          var dataset = []
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



