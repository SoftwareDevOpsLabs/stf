module.exports = function CommandsCtrl(
  $scope,
  DeviceService,
  ControlService,
  socket
) {
  $scope.tracker = DeviceService.trackAll($scope)
  $scope.control = ControlService.create($scope.tracker.devices, '*ALL')

  $scope.devices = [];
  $scope.columns = [];
  var prefix = 'd' + Math.floor(Math.random() * 1000000) + '-'

  // 根据设备计算测试的id
  function calculateId(device) {
    return prefix + device.serial
  }



  // 点击开始测试
  $scope.startTest = function(){
    // 获取所有选中的设备
    var selected_devices = []
    $scope.devices.forEach(function (obj) {
      if (obj['checked']){
        $scope.sendTestCommand(obj)
      }
    })
  }

  // 发送开始测试命令
  $scope.sendTestCommand = function(device){
    // 在前端构造测试对象
    var test =
    { id: calculateId(device)
      , user: 'chenhao'
      , serial: device.serial
      , start: new Date().getTime()
      , end: ''
      , status: 'Testing'
      , message: 'ok'
      , command: 'cd'
    }
    $scope.columns.push(test)
    $scope.control.startTest(test)

  }

  // 监听测试任务执行的状态
  socket.on('testing.status',function(data){
    console.log(data)
    // 根据返回的数据，查询是那一条测试记录
    var testID = data['id']
    var status = data['status']
    var end = data['end']
    $scope.columns.forEach(function(obj){
      if(obj['id'] == testID){
        obj['status'] = status
        obj['end'] = end
      }
    });
    $scope.$apply()

  })
}
