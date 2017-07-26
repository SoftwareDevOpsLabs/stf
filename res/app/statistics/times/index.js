//require('./charts.css')

module.exports = angular.module('statistics.times', [
  require('stf/socket').name
])
  .controller('TimeStatCtrl', require('./times-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'statistics/times/times.pug'
      , require('./times.pug')
    )
  }])

