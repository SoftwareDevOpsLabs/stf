module.exports = function CommandsCtrl(
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

  // @hy 2017-05-10: set default value of test command
  $scope.test_command = 'python2.7 pulltest/newpull.py {SN} 1 1 1'

  $scope.devices = []
  $scope.user = UserService.currentUser
  console.log('当前用户',$scope.user)

  $scope.templates = []
  $scope.scenarios = []
  $scope.test_name = ""
  $scope.test_scenario=""
  $scope.test_package=""
  $scope.test_command=""


  // Get all the test template from DB
  $http.get('/api/v1/testTemplates/active')
    .then(function(response) {
      if (response.status === 200) {
        $scope.templates = response['data']['testcases']
        console.log($scope.templates)
      } else {
        console.log("Failed to get test templates!!!")
      }
    })

  $scope.LoadTestGroup = function(group) {
    if (group == "") {
      $scope.scenarios = []
      return;
    }

    $scope.templates.forEach(function(template) {
      if (template.group === group) {
        $scope.test_scenario=""
        $scope.test_command=""
        $scope.currentTemplte = {}
        $scope.scenarios = template['reduction']
        // console.log($scope.scenarios)
        return
      }
    })
  }

  $scope.LoadTestScenario = function(scenario) {

    $scope.scenarios.forEach(function(item) {
      if (item.scenario === scenario) {
        $scope.test_command = item['command']
        return
      }
    })
  }

  // 读取当前所有正在执行的测试记录
  $http({
    method:'post',
    url:'/api/v1/testings/Testing',
    data:{
      'start_time':0,
      'end_time': new Date().getTime(),
      'test_type': ''
    }
  }).success(function(response){
    console.log(response);
    var testings = response['testings']
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
      alert('测试命令不能为空！')
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
    var command_params = $scope.test_command.split(' ')
    var test =
    { id: calculateId(device)
      , group: groupId
      , name: $scope.test_name||'未定义'
      , scenario: $scope.test_scenario||'未定义' // @hy 2017-05-17 add new field 'scenario'
      , user: $scope.user.name
      , serial: device.serial
      , start: new Date().getTime()
      , end: ''
      , status: 'Testing'
      , message: 'ok'
      , package: $scope.test_package
      , commands: command_params
      , model: device.model
      , manufacturer: device.manufacturer
      , version: device.version
      , display: device.display.height+'*'+device.display.width
    }

    // @HY 2017-05-14 if device is not usable, just return
    if (device.usable === false) {
      alert("设备#", device.serial, "不可用！");
      return
    }

    // @HY 2017-05-14 kick the using device
    if (device.using === true) {
      GroupService.kick(device)
    }

    // @HY 2017-05-09: change device's usage to automation
    device.usage = "automation"
    try {
      GroupService.invite(device)
      $scope.columns.splice(0, 0, test)
      $scope.control = ControlService.create(device, device.channel)
      $scope.control.startTest(test)
    } catch(err) {
      console.log(err)
    }
  }

  testStatusChanged = function(data) {
    console.log(data)

    // 根据返回的数据，查询是那一条测试记录
    var testID = data['id']
    var status = data['status']
    var end = data['endTime']
    var logcat = data['logcat']||""
    // $scope.columns.forEach(function(obj){
    for (var i = 0; i < $scope.columns.length; i++) {
      obj = $scope.columns[i]
      if (obj['id'] == testID) {
        obj['status'] = status
        obj['end'] = end
        obj['logcat'] = logcat
        break;
      }
    }
    $scope.$apply()
  }

  // 监听测试任务执行的状态
  socket.on('testing.status',testStatusChanged)

  // @hy 2017-06-04 remove event hanlder during destroying
  // Refer to https://stackoverflow.com/questions/26983696/angularjs-does-destroy-remove-event-listeners
  $scope.$on('$destroy', function() {
    socket.removeListener("testing.status", testStatusChanged)
  })

}
