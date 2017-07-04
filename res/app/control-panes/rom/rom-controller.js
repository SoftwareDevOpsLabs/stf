module.exports = function RomCtrl($scope) {
  console.log("+++++++++++++++++ Rom Ctrl +++++++++++++++")

  $scope.rom = {
    romList: [],
  }

  $scope.refreshRom = function refreshRom(rom) {
     var command = "am instrument -w -r -e debug true -e class com.qihoo.caes.FlashPhone#testOTAUpgrade"
                     + " -e Loop 1 -e nickname Pro6 " + " -e url " + rom.ftpDownload + " com.qihoo.test/android.support.test.runner.AndroidJUnitRunner"
      console.log(command)
      var timeout = 3600*1000  // timeout for rom refresh is one hour
      $scope.control.shell(command, timeout)
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

  var getRomList = function getRomList() {
    var model = $scope.device ? $scope.device.model : ''

    result = $scope.control.romlist(model)
    $scope.rom.romList = result.romList
  }

  // Initialize
  getRomList()
}
