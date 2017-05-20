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
  $scope.user = UserService.currentUser

  $scope.templates = [{group:""}]
  $scope.scenarios = [{scenario:""}]
  $scope.currentTemplte = {}

  // @hy 2017-05-10: set default value of test command
  $scope.test_command = 'python2.7 pulltest/newpull.py {SN} 1 1 1'

  $scope.save_template = function() {
    socket.emit("testing.testcase.save", {
        id: $scope.currentTemplte.id||""
        ,creator: $scope.user.name
        ,email: $scope.user.email
        ,group: $scope.test_group
        ,scenario: $scope.test_scenario
        ,command: $scope.test_command
    });

  }

  socket.on("testing.testcase.saved", function (testcase) {
    console.log(testcase)
    alert("测试模板保存成功!")
  })

  socket.on("testing.testcase.error", function (error) {
    alert("测试模板保存失败：" + error.message)
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
        return
      }
    })
  }

  $scope.LoadTestScenario = function(scenario) {
    if (scenario == "") {
      $scope.scenarios = []
      return;
    }

    $scope.currentTemplte = {}
    $scope.scenarios.forEach(function(item) {
      if (item.scenario === scenario) {
        $scope.test_command = item['command']
        $scope.currentTemplte = item
        return
      }
    })
  }

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


}

