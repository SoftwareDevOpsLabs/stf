var syrup = require('stf-syrup')
var Promise = require('bluebird')
var _ = require('lodash')

var logger = require('../../../util/logger')

module.exports = syrup.serial()
  .dependency(require('../support/adb'))
  .dependency(require('../resources/service'))
  .dependency(require('./group'))
  .define(function(options, adb, service, group) {
    var log = logger.createLogger('device:plugins:cleanup')
    var plugin = Object.create(null)

    var whiteList = [] // @HY 2017-08-31 add whiteList to keep installed packages
    var whiteListFile = "./whiteList.json"

    if (!options.cleanup) {
      return plugin
    }

    function readWhiteList() {
       // TODO 
    }

    function listPackages() {
      return adb.getPackages(options.serial)
    }

    function uninstallPackage(pkg) {
      log.info('Cleaning up package "%s"', pkg)
      return adb.uninstall(options.serial, pkg)
        .catch(function(err) {
          log.warn('Unable to clean up package "%s"', pkg, err)
          return true
        })
    }



    return listPackages()
      .then(function(initialPackages) {
        initialPackages.push(service.pkg)

        plugin.removePackages = function() {
          return listPackages()
            .then(function(currentPackages) {
              var remove = _.difference(currentPackages, initialPackages)
              return Promise.map(remove, uninstallPackage)
            })
        }

        group.on('leave', function() {
          plugin.removePackages()
        })
      })
      .return(plugin)
  })
