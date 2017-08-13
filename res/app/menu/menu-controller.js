module.exports = function MenuCtrl($scope, $rootScope, SettingsService, UserService,
  $location) {

  $scope.currentUser = UserService.currentUser

  SettingsService.bind($scope, {
    target: 'lastUsedDevice'
  })

  SettingsService.bind($rootScope, {
    target: 'platform',
    defaultValue: 'native'
  })

  $scope.$on('$routeChangeSuccess', function() {
    $scope.isControlRoute = $location.path().search('/control') !== -1
  })

}
