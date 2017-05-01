module.exports = function ReportCtrl(
  $scope,
  DeviceService,
  ControlService
) {

  $scope.tracker = DeviceService.trackAll($scope)


  console.log('ddd')
  alert('dsdsds')
  console.log($scope.tracker.devices);

  // 获取设备的列表
}
