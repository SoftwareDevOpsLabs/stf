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

  /*
  $scope.templates = [{group:""}]
  $scope.scenarios = [{scenario:""}]
  $scope.currentTemplate = {}
  $scope.test_scenario = ""
  $scope.test_group = ""
  */

  // @hy 2017-05-10: set default value of test command
  $scope.test_command = 'python2.7 pulltest/newpull.py {SN} 1 1 1'

  $scope.save_template = function() {
    $scope.test_group.trim()
    $scope.test_scenario.trim()
    $scope.test_command.trim()

    if ($scope.test_scenario == "" || $scope.test_group == "")  {
      alert('"测试分类"或"测试场景"不能为空！')
      return
    }
    console.log($scope.currentTemplate)
    socket.emit("testing.testcase.save", {
        id: $scope.currentTemplate.id||""
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

  socket.on("testing.testcase.saved", function (testcase) {
    console.log(testcase)
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
    $scope.$apply()

    alert("测试模板保存成功!")
  })

  socket.on("testing.testcase.error", function (error) {
    alert("测试模板保存失败：" + error.message)
  })


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
}

