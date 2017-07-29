var syrup = require('stf-syrup')
var Promise = require('bluebird')
var os = require('os')
var Gelf = require('gelf')

var logger = require('../../../util/logger')
var wire = require('../../../wire')
var wireutil = require('../../../wire/util')
var lifecycle = require('../../../util/lifecycle')

const hostname = os.hostname()

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

    // @HY 2017-07-29
    var array = options.connectGraylog.split(':')
    var graylogServer = array[0]
    var graylogPort = parseInt(array[1])

    var gelf = new Gelf({
      graylogPort: graylogPort,
      graylogHostname: graylogServer,
      connection: 'lan',
      maxChunkSizeWan: 1420,
      maxChunkSizeLan: 8154
    })

    log.info("Start Graylog Agent to collect logcat")

    var startAgent = function startAgent() {
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

            var tmp = entry.message.match(/.{0,80}/)
            var short_message = tmp ? tmp[0] : ''

            var message = {
              "version": "1.0",
              "host": hostname,
              "full_message": entry.message,
              "short_message": short_message,
              "level": entry.priority,
              "_serial": serial,
              "_tag": entry.tag,
              "_pid": entry.pid,
              "_tid": entry.tid,
              "_tag": entry.tag,
            }
            gelf.emit('gelf.log', message)
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
      log.info("Terminate Graylog agent")
    }

    lifecycle.observe(function() {
      plugin.exit()
    })

    startAgent()

    return plugin
  })
