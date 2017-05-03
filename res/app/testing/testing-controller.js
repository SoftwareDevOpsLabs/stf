module.exports = function TestingCtrl(
  $scope
  ,gettext
  ,$location
) {

  $scope.testingTabs = [
    {
      //title: gettext('Tab1'),
      title: "列表",
      icon: 'fa fa-list-ul',
      templateUrl: 'testing/commands/commands.pug'
    },{
    //title: gettext('Tab1'),
      title: "历史",
      icon: 'fa fa-history',
      templateUrl: 'testing/history/history.pug'
  },{
      //title: gettext('Tab1'),
      title: "报表",
      icon: 'fa fa-line-chart',
      templateUrl: 'testing/charts/charts.pug'
    }
  ]
}
