require('./users.css')
module.exports = angular.module('settings-users', [
  require('stf/settings').name,
  require('stf/common-ui').name,
  require('stf/common-ui/modals/common').name,
  'ui.bootstrap'
])
  .controller('UsersCtrl', require('./users-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'settings/users/users.pug'
    , require('./users.pug')
    )
  }])
