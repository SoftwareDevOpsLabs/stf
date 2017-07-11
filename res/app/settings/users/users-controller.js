module.exports = function UsersCtrl(
  $scope,
  $http
) {
  console.log('xxxxxUser')

  $http({
    method:'get',
    url:'/api/v1/users/',
    data: {}
  }).success(function(response){
    var users = response['users']
    $scope.user_list = users
  })

}
