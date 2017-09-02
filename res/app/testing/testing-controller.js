module.exports = function TestingCtrl(
  $scope
  ,gettext
  ,$location
) {

  $scope.testingTabs = [
    {
      title: "列表",
      icon: 'fa fa-list-ul color-pink',
      templateUrl: 'testing/commands/commands.pug'
    },{
      title: "历史",
      icon: 'fa fa-history color-darkgreen',
      templateUrl: 'testing/history/history.pug'
  },{
      title: "报表",
      icon: 'fa fa-line-chart color-brown',
      templateUrl: 'testing/charts/charts.pug'
    },{
      title: "模板",
      icon: 'fa fa-list-alt color-skyblue',
      templateUrl: 'testing/template/template.pug'
    },{
      title: "云测",
      icon: 'fa fa-cloud color-lila',
      templateUrl: 'testing/testcloud/testcloud.pug'
    }
  ]
}
