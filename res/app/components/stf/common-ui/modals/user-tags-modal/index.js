module.exports = angular.module('stf.user-tags-modal', [
  require('stf/common-ui/modals/common').name
])
  .factory('UserTagsModalService', require('./user-tags-modal-service'))
