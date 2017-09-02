module.exports = angular.module('stf.testing-report-modal', [
  require('stf/common-ui/modals/common').name
])
  .factory('TestingReportModalService', require('./testing-report-modal-service'))
