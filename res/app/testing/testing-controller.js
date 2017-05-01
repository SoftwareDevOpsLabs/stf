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
    }
  ]
}
