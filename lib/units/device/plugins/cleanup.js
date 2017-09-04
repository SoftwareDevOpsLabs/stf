var syrup = require('stf-syrup')
var Promise = require('bluebird')
var fs = require("fs")
var _ = require('lodash')

var logger = require('../../../util/logger')

module.exports = syrup.serial()
  .dependency(require('../support/adb'))
  .dependency(require('../resources/service'))
  .dependency(require('./group'))
  .define(function(options, adb, service, group) {
    var log = logger.createLogger('device:plugins:cleanup')
    var plugin = Object.create(null)

    if (!options.cleanup) {
      return plugin
    }

    var whiteList = [] // @HY 2017-08-31 add whiteList to keep installed packages
    var whiteListFile = "/etc/saber/packages_whitelist.conf"

    function readWhiteList() {
       if (fs.existsSync(whiteListFile) === false) {
         log.warn("No whitelist config file under dir ", whiteListFile)
         return
       }

       whiteList = fs.readFileSync(whiteListFile).toString().split('\n').map(s => s.trim())
       whiteList = whiteList.filter(Boolean) // remove empty elements
    }

    // read white list in which the packate will not be cleaned up @HY 2017-09-04
    readWhiteList()

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
              remove = _.difference(remove, whiteList) // @HY 2017-09-04

              return Promise.map(remove, uninstallPackage)
            })
        }

        group.on('leave', function() {
          plugin.removePackages()
        })
      })
      .return(plugin)
  })
