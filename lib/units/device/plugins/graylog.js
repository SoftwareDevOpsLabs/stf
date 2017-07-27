var syrup = require('stf-syrup')
var Promise = require('bluebird')

var logger = require('../../../util/logger')
var wire = require('../../../wire')
var wireutil = require('../../../wire/util')
var lifecycle = require('../../../util/lifecycle')

var cluster = require('cluster')
var dgram = require('dgram')

const graylogIP = "10.16.42.17"  // TODO: add nginx proxy address
// const graylogIP = '127.0.0.1' // TODO: add nginx proxy address
const graylogPort = 12201

module.exports = syrup.serial()
  .dependency(require('../support/adb'))
  .dependency(require('../support/router'))
  .dependency(require('../support/push'))
  .dependency(require('./group'))
  .define(function(options, adb, router, push, group) {
    var log = logger.createLogger('device:plugins:graylog')
    var plugin = Object.create(null)
    var activeGraylogAgent = 1
    var user = ''
    var email = ''

    log.info("Start Graylog Agent")

    var startAgent = function startAgent() {
      var udpClient = dgram.createSocket('udp4')

      var serial = options.serial
      adb.openLogcat(serial, {
        clear: true,
        }, function (err, reader) {
          if (err != null) {
            log.error(err)
            return
          }

          var excludeLogEntry = function excludeLogEntry(entry) {
            // exclude messages produced by STFService
            if (entry.tag && (entry.tag === 'BufferQueueProducer'
                          ||  entry.tag === 'SurfaceFlinger'
                          ||  entry.tag === 'Surface'))
              return true
            else
              return false
          }

          reader.on('entry', function (entry) {
            entry.serial = serial
            entry.user = user
            entry.email = email

            if (excludeLogEntry(entry))
              return

            var msg = JSON.stringify(entry)
            // log.error(entry)
            var payload = new Buffer(msg)
            udpClient.send(payload, 0, payload.length, graylogPort, graylogIP)
          })

          reader.on('end', function () {
            log.info('Logcat Reader Event - END')
          })

          reader.on('error', function (err) {
            log.error('Logcat Reader Event - END ' + err)
          })

          reader.on('finish', function () {
            log.info('Logcat Reader Event - FINISH')
          })
        }
      )
    }

    plugin.isRunning = function isRunning() {
      return !!activeGraylogAgent
    }

    plugin.exitGroup = Promise.method(function() {
        user = ''
        email = ''
    })

    group.on('join', function (currentGroup) {
      if(currentGroup) {
        user = currentGroup.name
        email = currentGroup.email
      }
    })
    group.on('leave', plugin.exitGroup)


    plugin.exit = function exit() {
      log.error("Terminate Graylog agent")
    }
    lifecycle.observe(function() {
      log.info("Graylog agent quit")
      plugin.exit()
    })

    startAgent()

    return plugin
  })
