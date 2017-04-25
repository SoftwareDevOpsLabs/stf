//require('./general.css')

module.exports = angular.module('testing.report', [
])
  .controller('ReportCtrl', require('./report-controller'))
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'testing/report/report.pug'
      , require('./report.pug')
    )
  }])

