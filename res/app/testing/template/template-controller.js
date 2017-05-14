module.exports = function TemplateCtrl(
  $scope,
  DeviceService,
  ControlService,
  GroupService,
  UserService,
  socket,
  $http
) {
  $scope.tracker = DeviceService.trackAll($scope)
  $scope.control = ControlService.create($scope.tracker.devices, '*ALL')

  $scope.templates = [{test_name:'test_name', test_command:'test_command'}]

  $scope.save_template = function() {
    console.log($scope.test_name, $scope.test_command)
  }

  // @hy 2017-05-10: set default value of test command
  $scope.test_command = 'python2.7 pulltest/newpull.py {SN} 1 1 1'

  $scope.devices = []
  $scope.user = UserService.currentUser
  console.log('当前用户',$scope.user)

  $scope.test_name = '拉活测试'

  // 读取当前所有历史测试记录
  $http.get('/api/v1/testings/Testing')
    .then(function(response) {
      console.log(response)
      var testings = response['data']['testings']
      $scope.columns = testings
    })

  // 根据设备计算测试的id
  function calculateId(device) {
    return new Date().getTime() + device.serial
  }

  // 点击开始测试
  $scope.startTest = function(){
    // 获取所有选中的设备
    var test_command = $scope.test_command
    if (!test_command){
      alert('输入测试命令！')
      return
    }

    var selected_devices = []
    $scope.devices.forEach(function (obj) {
      if (obj['checked']){
        selected_devices.push(obj)
      }
    })

    if(selected_devices.length == 0){
      alert('请选择测试设备')
      return
    }

    var groupId = new Date().getTime()
    // 运行测试命令
    selected_devices.forEach(function(obj){
      $scope.sendTestCommand(obj,groupId)
    })
  }

  // 发送开始测试命令
  $scope.sendTestCommand = function(device,groupId){
    // 在前端构造测试对象，解析用户输入的测试命令
    var test_name = $scope.test_name
    var command_params = $scope.test_command.split(' ')
    var test =
    { id: calculateId(device)
      , group: groupId
      , name: test_name
      , user: $scope.user.name
      , serial: device.serial
      , start: new Date().getTime()
      , end: ''
      , status: 'Testing'
      , message: 'ok'
      , commands: command_params
      , model: device.model
      , manufacturer: device.manufacturer
      , version: device.version
      , display: device.display.height+'*'+device.display.width
    }

    // @HY 2017-05-14 kick the using device
    if (device.using === true) {
      GroupService.kick(device)
    }

    // @HY 2017-05-09: change device's usage to automation
    device.usage = "automation"
    GroupService.invite(device)

    $scope.columns.push(test)
    $scope.control = ControlService.create(device, device.channel)
    $scope.control.startTest(test)
  }

  // 监听测试任务执行的状态
  socket.on('testing.status',function(data){
    console.log(data)
    // 根据返回的数据，查询是那一条测试记录
    var testID = data['id']
    var status = data['status']
    var end = data['endTime']
    $scope.columns.forEach(function(obj){
      if(obj['id'] == testID){
        obj['status'] = status
        obj['end'] = end
      }
    });
    $scope.$apply()

  })
}
