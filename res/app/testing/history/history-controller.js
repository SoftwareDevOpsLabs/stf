var oboe = require('oboe')

module.exports = function HistoryCtrl(
  $scope,
  $http
) {
  // 读取当前用户所有历史的测试记录
  $http({
    method:'post',
    url:'/api/v1/testings/Notrun',
    data:{
      'start_time':'1212',
      'end_time':'1212',
      'test_type':1
    }
  }).success(function(response){
    console.log(response);
    var testings = response['testings']
    $scope.columns = testings
    $scope.sort='sort'
  })

  $scope.start_time = new Date();
  $scope.end_time = new Date();
  $scope.format = "yyyy/MM/dd";
  $scope.altInputFormats = ['yyyy/M!/d!'];
  $scope.options = {
    showWeeks: false
  };

  // 获取所有的测试类型
  $http.get('/api/v1/testing/types/')
    .then(function(response) {
      console.log(response)
      $scope.types = response['data']['types']
    })

  // 根据条件查询统计图的信息
  $scope.submitQuery = function(){
    // 检查开始时间和结束时间的输入
    var stat_time = $scope.stat_time
    var end_time = $scope.end_time
    var test_type = $scope.test_type

    if (stat_time>end_time){
      alert('开始时间不能大于结束时间')
    }

    // 发送请求，按照过滤条件查询
    $http({
      method:'post',
      url:'/api/v1/testings/Notrun',
      data:{
        'start_time': stat_time,
        'end_time': end_time,
        'test_type': test_type
      }
    }).success(function(response){
      console.log(response);
      var testings = response['testings']
      $scope.columns = testings
      $scope.sort='sort'
    })
  };

  $scope.popup1 = {
    opened: false
  };
  $scope.open1 = function () {
    $scope.popup1.opened = true;
  };

  $scope.popup2 = {
    opened: false
  };
  $scope.open2 = function () {
    $scope.popup2.opened = true;
  };
}
