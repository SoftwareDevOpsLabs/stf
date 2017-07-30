var _ = require('lodash')
var Promise = require('bluebird')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')

var log = logger.createLogger('api:controllers:devices')

module.exports = {
  getDevices: getDevices
, getDeviceBySerial: getDeviceBySerial
}

function getDevices(req, res) {
  var fields = req.swagger.params.fields.value

  var filterByAuthorizationRules = function filterByAuthorizationRules(device, user) {
    // log.error("+++++++++++++++++++++++++")
    // log.error(device)
    // log.error(user)

    var userTags = user.tags == null ? [] : user.tags.split(',')
    userTags.map(function (elem) {
      return elem.toLowerCase()
    })
    // log.error(userTags)

    // Rule 1: admin is super user
    if (userTags.indexOf('admin') >= 0)
      return false

    // Rule 2: users tagged with 'blacklist' can't get any device.
    if (userTags.indexOf('blacklist') >= 0)
      return true

    // log.error("NOT filtered inside getDevices!")

    var provider = device.provider == null ? '' : device.provider.name

    // log.error(provider)

    return false
  }

  dbapi.loadDevices()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          var deviceList = []

          list.forEach(function(device) {
            if (filterByAuthorizationRules(device, req.user))
              return false
            log.error('NOT filtered!!!')
            datautil.normalize(device, req.user)
            var responseDevice = device

            if (fields) {
              responseDevice = _.pick(device, fields.split(','))
            }
            deviceList.push(responseDevice)
          })

          res.json({
            success: true
          , devices: deviceList
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

function getDeviceBySerial(req, res) {
  var serial = req.swagger.params.serial.value
  var fields = req.swagger.params.fields.value

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      var responseDevice = device

      if (fields) {
        responseDevice = _.pick(device, fields.split(','))
      }

      res.json({
        success: true
      , device: responseDevice
      })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}
