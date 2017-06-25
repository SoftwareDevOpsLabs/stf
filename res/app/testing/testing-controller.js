module.exports = function TestingCtrl(
  $scope
  ,gettext
  ,$location
) {

  $scope.testingTabs = [
    {
      title: "执行",
      icon: 'fa fa-list-ul',
      templateUrl: 'testing/commands/commands.pug'
    },{
      title: "历史",
      icon: 'fa fa-history',
      templateUrl: 'testing/history/history.pug'
  },{
      title: "报表",
      icon: 'fa fa-line-chart',
      templateUrl: 'testing/charts/charts.pug'
    },{
      title: "模板",
      icon: 'fa fa-list-alt',
      templateUrl: 'testing/template/template.pug'
    }
  ]
}
