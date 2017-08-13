module.exports = function UserProfileCtrl($scope, gettext, UserService) {
   $scope.currentUser = UserService.currentUser
   console.log(UserService.currentUser)
}
