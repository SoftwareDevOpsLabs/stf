require('./testcloud.css')

module.exports = angular.module('testing.testcloud', [
  require('stf/socket').name
])
  .controller('TestcloudCtrl', require('./testcloud-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'testing/testcloud/testcloud.pug'
      , require('./testcloud.pug')
    )
  }])

