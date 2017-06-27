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
       {name: "开源", URL: "http://opentest.360.cn/index.html", item: "360"},
       {name: "OpenLab", URL: "https://deveco.huawei.com/manualinstuction", item: "华为"},
       {name: "Testin", URL: "http://www.testin.cn/", item: "云测"},
       {name: "MTC", URL: "http://mtc.baidu.com/", item: "百度" },
       {name: "优测", URL: "http://mtc.baidu.com/", item: "腾讯" },
       {name: "MQC", URL: "http://mqc.aliyun.com/", item: "阿里巴巴" },
       {name: "易测云", URL: "http://www.yiceyun.com/", item: "易测云" },
     ]
    // $scope.$apply()
     console.log($scope.clouds)

    $scope.$on('$destroy', function() {

    })
}

