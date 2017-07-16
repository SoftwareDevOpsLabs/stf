module.exports =
  function TestingReportModalServiceFactory($uibModal) {
    var service = {}

    var ModalInstanceCtrl = function($scope, $uibModalInstance, data, $http) {
      $scope.modal = {}
      $scope.modal.showAdd = true
      $scope.modal.server = data

      $scope.ok = function() {
        $uibModalInstance.close(true)
      }

      $scope.$watch('modal.showAdd', function(newValue) {
        if (newValue === false) {
          $scope.ok()
        }
      })

      $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel')
      }

      $scope.saveServerTags = function(obj){
        console.log(obj)
        var name = obj.modal.server.name
        var note = obj.modal.server.note
        var tags = obj.modal.server.tags
        var params = {
          'name': name,
          'note': note,
          'tags':tags
        }
        $http({
          method:'post',
          url:'/api/v1/server/tags/',
          data: params
        }).success(function(response){
          $scope.ok()
        })
      }
    }


    service.open = function(data) {
      var modalInstance = $uibModal.open({
        template: require('./server-tags-modal.pug'),
        controller: ModalInstanceCtrl,
        resolve: {
          data: function() {
            return data
          }
        }
      })

      return modalInstance.result
    }

    return service
  }
