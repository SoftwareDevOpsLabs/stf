require('./commands.css')

module.exports = angular.module('testing.commands', [
  require('stf/socket').name
])
  .controller('CommandsCtrl', require('./commands-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'testing/commands/commands.pug'
      , require('./commands.pug')
    )
  }])

