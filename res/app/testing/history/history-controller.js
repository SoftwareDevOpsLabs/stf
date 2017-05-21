module.exports = function HistoryCtrl(
  $scope,
  $http
) {
  // 读取当前用户所有历史的测试记录
  $http.get('/api/v1/testings/Notrun')
    .then(function(response) {
      console.log(response)
      var testings = response['data']['testings']
      $scope.columns = testings
      $scope.sort='sort'
    })


  $scope.dat = new Date();
  $scope.format = "yyyy/MM/dd";
  $scope.altInputFormats = ['yyyy/M!/d!'];
  $scope.options = {
    showWeeks: false
  };

  $scope.popup1 = {
    opened: false
  };
  $scope.open1 = function () {
    $scope.popup1.opened = true;
  };
}
