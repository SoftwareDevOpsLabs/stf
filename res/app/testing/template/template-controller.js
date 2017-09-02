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
  $scope.currentTemplate = {}
  $scope.test_scenario = ""
  $scope.test_group = ""

  // @hy 2017-05-10: set default value of test command
  $scope.test_command = 'python2.7 pulltest/newpull.py {SN} 1 1 1'

  $scope.save_template = function() {
    if ($scope.test_group) $scope.test_group.trim()
    if ($scope.test_scenario) $scope.test_scenario.trim()
    if ($scope.test_command) $scope.test_command.trim()

    if (typeof $scope.test_group === 'undefined' || $scope.test_group == "")  {
      alert('"测试分类"不能为空！')
      return
    }

    if (typeof $scope.test_scenario === 'undefined' || $scope.test_scenario == "")  {
      alert('"测试场景"不能为空！')
      return
    }

    if (typeof $scope.test_command === 'undefined' || $scope.test_command == "")  {
      alert('"测试命令"不能为空！')
      return
    }

    console.log("emit testing.testcase.save!")
    socket.emit("testing.testcase.save", {
        id: (typeof $scope.currentTemplate === 'undefined' ? '' : $scope.currentTemplate.id)
        ,creator: $scope.user.name
        ,email: $scope.user.email
        ,group: $scope.test_group
        ,scenario: $scope.test_scenario
        ,command: $scope.test_command
    });

  }

  // define a trim function to remove heading and tailing space
  if (typeof String.prototype.trim != 'function') { // detect native implementation
    String.prototype.trim = function () {
      return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
  }

  testcaseSaved = function (testcase) {
    $scope.currentTemplate = testcase
    getTestTemplates()

    // @hy 2017-05-23 add new scenario after saving
    var i
    for (i = 0; i < $scope.scenarios.length; i++) {
       if ($scope.scenarios[i]['scenario'] === $scope.test_scenario) {
           break
       }
    }

    if (i == $scope.scenarios.length) { // new testcase
	        $scope.scenarios.push(testcase)
    }

    alert("测试模板保存成功!")
    $scope.$apply()
  }

  testcaseSaveFailed = function (error) {
    alert("测试模板保存失败：" + error.message)
  }

  socket.on("testing.testcase.saved", testcaseSaved)
  socket.on("testing.testcase.error", testcaseSaveFailed)

  $scope.LoadTestGroup = function(group) {
    $scope.currentTemplate = {}
    if (group == "") {
      $scope.scenarios = []
      return;
    }

    $scope.templates.forEach(function(template) {
      if (template.group === group) {
        $scope.test_scenario=""
        $scope.test_command=""
        $scope.scenarios = template['reduction']
        return
      }
    })
  }

  $scope.LoadTestScenario = function(scenario) {
    $scope.currentTemplate = {}
    $scope.scenarios.forEach(function(item) {
      if (item.scenario === scenario) {
        $scope.test_command = item['command']
        $scope.currentTemplate = item
        return
      }
    })
  }

  // Get all the test template from DB
  getTestTemplates = function() {
    $http.get('/api/v1/testTemplates/active')
      .then(function (response) {
        if (response.status === 200) {
          $scope.templates = response['data']['testcases']
        } else {
          console.error("Failed to get test templates!!!")
        }
      })
  }

  getTestTemplates()

  $scope.$on('$destroy', function() {
    socket.removeListener("testing.testcase.saved", testcaseSaved)
    socket.removeListener("testing.testcase.error", testcaseSaveFailed)
  })
}

