module.exports = function StatisticsCtrl(
  $scope
  ,gettext
  ,$location
) {

  $scope.testingTabs = [
    {
      title: "概览",
      icon: 'fa fa-bar-chart',
      templateUrl: 'statistics/times/times.pug'
    },
    {
      title: "用户",
      icon: 'fa fa-users',
      templateUrl: 'statistics/users/users.pug'
    },{
      title: "设备",
      icon: 'fa fa-plug',
      templateUrl: 'statistics/devices/devices.pug'
    },{
      title: "测试",
      icon: 'fa fa-cloud',
      templateUrl: 'statistics/tests/tests.pug'
    }
  ]
}
