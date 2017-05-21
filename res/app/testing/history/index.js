require('./history.css')

module.exports = angular.module('testing.history', [
  require('stf/socket').name
  ,require('ui-bootstrap').name
])
  .controller('HistoryCtrl', require('./history-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'testing/history/history.pug'
      , require('./history.pug')
    )
  }])

