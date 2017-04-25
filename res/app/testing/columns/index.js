require('./testing-column-list.css')

module.exports = angular.module('stf.testing-column.list', [
  require('stf/device').name,
  require('stf/user/group').name,
  require('stf/common-ui').name
])
  .directive('testingColumnList', require('./testing-column-list-directive'))
