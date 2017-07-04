module.exports = function RomCtrl($scope) {
  console.log("+++++++++++++++++ Rom Ctrl +++++++++++++++")

  $scope.rom = {
    romList: [],
  }

  $scope.refreshRom = function refreshRom(rom) {
     alert(rom)
     $scope.control.shell(command)
      .progressed(function(result) {
        $scope.result = result
        $scope.data = result.data.join('')
        $scope.$digest()
      })
       .then(function(result) {
        $scope.result = result
        $scope.data = result.data.join('')
        $scope.$digest()
      })
  }

  var getRomList = function getRomList() {
    var model = $scope.device.model||''

    result = $scope.control.romlist(model)
    $scope.rom.romList = result.romList
  }

  // Initialize
  getRomList()
}
