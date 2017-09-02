module.exports = function ServersCtrl(
  $scope,
  $http,
  ServerTagsModalService
) {
  $http({
    method:'get',
    url:'/api/v1/servers/',
    data: {}
  }).success(function(response){
    var servers = response['servers']
    $scope.server_list = servers
  })

  // 修改tag的信息
  $scope.setServerTags = function(obj){
    var server = obj.server
    ServerTagsModalService.open(server)
  }

  // 清空搜索框
  $scope.clearSearchInput = function(){
    $scope.query = '';
  }
}
