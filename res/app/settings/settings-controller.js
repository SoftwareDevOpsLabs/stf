module.exports = function SettingsCtrl($scope, gettext, UserService) {
  
  $scope.settingTabs = [
    {
      title: gettext('General'),
      icon: 'fa-gears fa-fw',
      templateUrl: 'settings/general/general.pug'
    },
    {
      title: gettext('Keys'),
      icon: 'fa-key fa-fw',
      templateUrl: 'settings/keys/keys.pug'
    }
  ]

  // @HY 2017-08-06 add for authorization
  var user = UserService.currentUser
  if ((!!user.tags) && user.tags.indexOf('admin') >= 0) {
    $scope.settingTabs.push({
      title: gettext('Users'),
      icon: 'fa fa-users',
      templateUrl: 'settings/users/users.pug'
    })
    $scope.settingTabs.push({
      title: gettext('Providers'),
      icon: 'fa fa-server',
      templateUrl: 'settings/servers/servers.pug'
    })

    /*,
     {
     title: gettext('Notifications'),
     icon: 'a-exclamation-circle fa-fw',
     templateUrl: 'settings/notifications/notifications.pug'
     }
     */
  }
}
