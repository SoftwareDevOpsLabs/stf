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
       {name: "开源", URL: "http://opentest.360.cn/index.html", company: "360"},
       {name: "OpenLab", URL: "https://deveco.huawei.com/manualinstuction", company: "华为"},
       {name: "Testin", URL: "http://www.testin.cn/", company: "云测"},
       {name: "MTC", URL: "http://mtc.baidu.com/", company: "百度" },
       {name: "优测", URL: "http://mtc.baidu.com/", company: "腾讯" },
       {name: "MQC", URL: "http://mqc.aliyun.com/", company: "阿里巴巴" },
       {name: "易测云", URL: "http://www.yiceyun.com/", company: "易测云" },
     ]
    // $scope.$apply()
     console.log($scope.clouds)

    $scope.$on('$destroy', function() {

    })
}

