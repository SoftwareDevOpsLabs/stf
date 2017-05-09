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
, getTestingChart: getTestingChart
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

function getTestingChart(req, res){
  var name = req.swagger.params.name.value
  var fields = req.swagger.params.fields.value
  dbapi.loadTestingStat(name)
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
