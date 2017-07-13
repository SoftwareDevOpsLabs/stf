module.exports = angular.module('settings-servers', [
  require('stf/settings').name
])
  .controller('ServersCtrl', require('./servers-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'settings/servers/servers.pug'
    , require('./servers.pug')
    )
  }])
