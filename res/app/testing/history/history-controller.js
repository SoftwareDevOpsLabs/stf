module.exports = function HistoryCtrl(
  $scope,
  $http
) {
  // 读取当前用户所有历史的测试记录
  $http.get('/api/v1/testings/Finish')
    .then(function(response) {
      console.log(response)
      var testings = response['data']['testings']
      $scope.columns = testings
    })
}
