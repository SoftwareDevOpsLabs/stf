//require('./charts.css')

module.exports = angular.module('statistics.users', [
  require('stf/socket').name
])
  .controller('UserStatCtrl', require('./users-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'statistics/users/users.pug'
      , require('./users.pug')
    )
  }])

