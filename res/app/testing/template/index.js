require('./template.css')

module.exports = angular.module('testing.template', [
  require('stf/socket').name
])
  .controller('TemplateCtrl', require('./template-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'testing/template/template.pug'
      , require('./template.pug')
    )
  }])

