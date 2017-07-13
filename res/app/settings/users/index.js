module.exports = angular.module('settings-users', [
  require('stf/settings').name
])
  .controller('UsersCtrl', require('./users-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'settings/users/users.pug'
    , require('./users.pug')
    )
  }])
