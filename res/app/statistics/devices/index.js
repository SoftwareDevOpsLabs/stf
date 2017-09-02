require('./devices.css')

module.exports = angular.module('statistics.devices', [
  require('stf/socket').name
])
  .controller('DeviceStatCtrl', require('./devices-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'statistics/devices/devices.pug'
      , require('./devices.pug')
    )
  }])

