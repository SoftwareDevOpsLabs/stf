module.exports = function TestingCtrl(
  $scope
  ,gettext
  ,$location
) {

  $scope.testingTabs = [
    {
      //title: gettext('Tab1'),
      title: "列表",
      icon: 'fa-refresh fa-fw',
      templateUrl: 'testing/commands/commands.pug'
    },
    {
      //title: gettext('Tab2'),
      title: "报告",
      icon: 'fa fa-th-large',
      templateUrl: 'testing/report/report.pug'
    }
  ]
}
