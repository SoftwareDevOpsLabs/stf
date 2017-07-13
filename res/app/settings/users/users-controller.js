module.exports = function UsersCtrl(
  $scope,
  $http,
  UserTagsModalService
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

  // 修改tag的信息
  $scope.setUserTags = function(obj){
    var user = obj.user
    UserTagsModalService.open(user)
  }

  // 清空搜索框
  $scope.clearSearchInput = function(){
    $scope.query = '';
  }

}
