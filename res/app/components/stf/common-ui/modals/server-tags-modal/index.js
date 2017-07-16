module.exports = angular.module('stf.server-tags-modal', [
  require('stf/common-ui/modals/common').name
])
  .factory('ServerTagsModalService', require('./server-tags-modal-service'))
