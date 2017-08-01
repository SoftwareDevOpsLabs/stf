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
    var isFiltered = true

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

    var providerName = device.provider == null ? '' : device.provider.name

    var providerTags = []

    var p = new Promise(function (resolve, reject) {

      dbapi.loadServerTags(providerName)
        .then(function (provider) {
          log.error(provider)

          // no provider's info in DB, so not filter out this provider
          if (provider == null)
            resolve(false)
            return false

          providerTags = provider.tags ? provider.tags.split(',') : []

          log.error(userTags)

          log.error(providerTags)

          // Rule 3: if provider has no tags, devices on the provider are public
          if (providerTags.length === 0) {
            isFiltered = false
            resolve(false)
            return false
          }

          // Rule 4: if provider has any tag, only user who has the same tag with provider
          // can access devices on the provider
          for (var i = 0; i < userTags.length; i++)
            for (var j = 0; j < providerTags.length; j++)
              if ((~~userTags[i]) && (~~providerTags[j])
                && userTags[i].toUpperCase() === providerTags[j].toUpperCase()) {
                isFiltered = false
                return false
              }
          resolve(true)
          return true
        })
        .catch(function (err) {
          log.error(err)
          reject(err)
        })
    })

    return p
  }

  dbapi.loadDevices()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          var deviceList = []

          list.forEach(function(device) {
            filterByAuthorizationRules(device, req.user).then(function(isFilter) {
              if (isFilter) {
                log.error(device.serial + " is Filtered!!!")
                return false
              } else {
                log.error(device.serial + " is OK")

                datautil.normalize(device, req.user)
                var responseDevice = device

                if (fields) {
                  responseDevice = _.pick(device, fields.split(','))
                }
                deviceList.push(responseDevice)
              }
            })
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
