//require('./charts.css')

module.exports = angular.module('statistics.tests', [
  require('stf/socket').name
])
  .controller('TestStatCtrl', require('./tests-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'statistics/tests/tests.pug'
      , require('./tests.pug')
    )
  }])

