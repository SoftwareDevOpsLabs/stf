module.exports = angular.module('stf.device-list.column', [
  require('gettext').name,
  require('stf/user').name,
  //require('stf/user/group').name
])
  .service('DeviceColumnService', require('./device-column-service'))
