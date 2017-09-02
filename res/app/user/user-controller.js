module.exports = function UserProfileCtrl($scope, gettext, UserService) {
   $scope.currentUser = UserService.currentUser

   var adjust2LocalTimeZone = function adjust2LocalTimeZone(t) {
     d = new Date(t)
     tmp = d.getTime() - (new Date().getTimezoneOffset() * 60000)
     t = new Date(tmp)
     return t
   }

   $scope.currentUser.createdAt = adjust2LocalTimeZone($scope.currentUser.createdAt)
   $scope.currentUser.lastLoggedInAt = adjust2LocalTimeZone($scope.currentUser.lastLoggedInAt)
}
