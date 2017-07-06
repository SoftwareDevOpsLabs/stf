module.exports = function RomCtrl($scope,
                                  $http) {
  console.log("+++++++++++++++++ Rom Ctrl +++++++++++++++")

  $scope.rom = {
    romlist: [],
  }

  $scope.refreshRom = function refreshRom(rom) {
     var command = "am instrument -w -r -e debug false -e class com.qihoo.caes.FlashPhone#testOTAUpgrade"
                     + " -e Loop 1 -e nickname Pro6 " + " -e url " + rom.ftpDownload + " com.qihoo.test/android.support.test.runner.AndroidJUnitRunner&"

      console.log(command)

      var oneHour = 3600*1000  // timeout for rom refresh is one hour
      $scope.control.shell(command, oneHour)
      .progressed(function(result) {
        console.log(result)
        $scope.result = result
        $scope.data = result.data.join('')
        $scope.$digest()
      })
       .then(function(result) {
         console.log(result)
        $scope.result = result
        $scope.data = result.data.join('')
        $scope.$digest()
      })
  }

  // Get rom list for specific model
  var getRomList = function(params) {
    $http.get('/api/v1/rom/?model=' + escape(params.model))
      .then(function (response) {
        console.log(response)
        $scope.rom.romlist = response['data']['romlist'] || []
      })
  }

  // Initialize
  var model = $scope.device ? $scope.device.model : ''
  getRomList({model:model})

}
