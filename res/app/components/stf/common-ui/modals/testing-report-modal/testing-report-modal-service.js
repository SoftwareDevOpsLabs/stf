module.exports =
  function TestingReportModalServiceFactory($uibModal) {
    var service = {}

    var ModalInstanceCtrl = function($scope, $uibModalInstance, data) {
      $scope.modal = {}
      $scope.modal.showAdd = true
      $scope.modal.items = data

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
    }

    service.open = function(data) {
      var modalInstance = $uibModal.open({
        template: require('./testing-report-modal.pug'),
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
