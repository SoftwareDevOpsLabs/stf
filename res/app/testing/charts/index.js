require('./charts.css')

module.exports = angular.module('testing.charts', [
  require('stf/socket').name
])
  .controller('ChartsCtrl', require('./charts-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'testing/charts/charts.pug'
      , require('./charts.pug')
    )
  }])

