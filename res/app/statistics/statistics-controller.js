module.exports = function StatisticsCtrl(
  $scope
  ,gettext
  ,$location
) {

  $scope.testingTabs = [
    {
      title: "用户",
      icon: 'fa fa-users',
      templateUrl: 'statistics/users/users.pug'
    },{
      title: "设备",
      icon: 'fa fa-plug',
      templateUrl: 'statistics/devices/devices.pug'
    }
  ]
}
