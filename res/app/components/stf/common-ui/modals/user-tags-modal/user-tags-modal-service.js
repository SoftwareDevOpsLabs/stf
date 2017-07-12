module.exports =
  function TestingReportModalServiceFactory($uibModal) {
    var service = {}

    var ModalInstanceCtrl = function($scope, $uibModalInstance, data, $http) {
      $scope.modal = {}
      $scope.modal.showAdd = true
      $scope.modal.user = data

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

      $scope.saveUserTags = function(obj){
        console.log(obj)
        var email = obj.modal.user.email
        var tags = obj.modal.user.tags
        var params = {
          'email': email,
          'tags':tags
        }
        $http({
          method:'post',
          url:'/api/v1/user/tags/',
          data: params
        }).success(function(response){
          $scope.ok()
        })
      }
    }


    service.open = function(data) {
      var modalInstance = $uibModal.open({
        template: require('./user-tags-modal.pug'),
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
