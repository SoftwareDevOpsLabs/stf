module.exports = function TestcloudCtrl(
  $scope,
  DeviceService,
  ControlService,
  GroupService,
  UserService,
  socket,
  $http
) {
     $scope.clouds = [
       {name: "开测", URL: "http://opentest.360.cn/index.html", company: "360", note:''},
       {name: "OpenLab", URL: "https://deveco.huawei.com/manualinstuction", company: "华为", note:''},
       {name: "Testin", URL: "http://www.testin.cn/", company: "云测", note:''},
       {name: "MTC", URL: "http://mtc.baidu.com/", company: "百度" , note:''},
       {name: "优测", URL: "http://mtc.baidu.com/", company: "腾讯", note:''},
       {name: "MQC", URL: "http://mqc.aliyun.com/", company: "阿里巴巴", note:'' },
       {name: "易测云", URL: "http://www.yiceyun.com/", company: "易测云", note:'' },
     ]
    // $scope.$apply()
     console.log($scope.clouds)

    $scope.$on('$destroy', function() {

    })
}

