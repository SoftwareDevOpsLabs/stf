module.exports = function TemplateCtrl(
  $scope,
  DeviceService,
  GroupService,
  UserService,
  socket,
  $http
) {
  $scope.user = UserService.currentUser

  $scope.templates = [{group:""}]
  $scope.scenarios = [{scenario:""}]
  $scope.currentTemplate = {}
  $scope.test_scenario = ""
  $scope.test_group = ""
  $scope.run_env = "device"
  $scope.test_timeout = 0
  $scope.test_package = ''

  // @hy 2017-05-10: set default value of test command
  $scope.test_command = ''


  // @hy 2017-05-10: set default value of test command
  var cached_params = sessionStorage.getItem('TEST_TEMPLATE_PARAMS')

  if (cached_params) {
    var data = JSON.parse(cached_params)

    $scope.templates = data.templates
    $scope.scenarios = data.scenarios
    $scope.currentTemplate = data.currentTemplate
    $scope.test_scenario = data.test_scenario
    $scope.test_group = data.test_group
    $scope.run_env = data.run_env
    $scope.test_timeout = parseInt(data.test_timeout)
    $scope.test_package = data.test_package
    $scope.test_command = data.test_command
  } else {
    $scope.templates = [{group:""}]
    $scope.scenarios = [{scenario:""}]
    $scope.currentTemplate = {}
    $scope.test_scenario = ""
    $scope.test_group = ""
    $scope.run_env = "device"
    $scope.test_timeout = 0
    $scope.test_package = ''
    $scope.test_command = ''
  }

  var storeLocalData = function () {
    var data = {}
    data.templates = $scope.templates
    data.scenarios = $scope.scenarios
    data.currentTemplate = $scope.currentTemplate
    data.test_scenario = $scope.test_scenario
    data.test_group = $scope.test_group
    data.run_env = $scope.run_env
    data.test_timeout = $scope.test_timeout
    data.test_package = $scope.test_package
    data.test_command = $scope.test_command

    sessionStorage.setItem('TEST_TEMPLATE_PARAMS', JSON.stringify(data))
  }


  $scope.save_template = function() {
    if ($scope.test_group) $scope.test_group.trim()
    if ($scope.test_scenario) $scope.test_scenario.trim()
    if ($scope.test_command) $scope.test_command.trim()
    if ($scope.test_package) $scope.test_package.trim()

    if (typeof $scope.test_group === 'undefined' || $scope.test_group == "")  {
      alert('"测试分类"不能为空！')
      return
    }

    if (typeof $scope.test_scenario === 'undefined' || $scope.test_scenario == "")  {
      alert('"测试场景"不能为空！')
      return
    }

    if ($scope.run_env === "device" && (typeof $scope.test_package === 'undefined' || $scope.test_package == ""))  {
      alert('"测试工具包名"不能为空！')
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
        ,package: $scope.test_package
        ,timeout: $scope.test_timeout
        ,run_env: $scope.run_env
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
        $scope.test_scenario = ""
        $scope.test_command  = ""
        $scope.scenarios     = template['reduction']
        return
      }
    })
  }

  $scope.LoadTestScenario = function(scenario) {
    $scope.currentTemplate = {}
    $scope.scenarios.forEach(function(item) {
      if (item.scenario === scenario) {
        $scope.test_command = item['command']
        $scope.test_package = item['package'] || ''
        $scope.test_timeout = item['timeout'] || ''
        $scope.run_env = item['run_env'] || 'server'
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
    storeLocalData() // @HY 2017-07-02 save current settings to local storage

    socket.removeListener("testing.testcase.saved", testcaseSaved)
    socket.removeListener("testing.testcase.error", testcaseSaveFailed)
  })
}

