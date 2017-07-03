module.exports = function RomCtrl($scope) {
  console.log("+++++++++++++++++ Rom Ctrl +++++++++++++++")

  $scope.rom = {
    romList: [],
  }

  /*
  $scope.getAbsolutePath = function() {
    return ('/' + $scope.rom.paths.join('/')).replace(/\/\/+/g, '/')
  }

  function resetPaths(path) {
    $scope.rom.paths = path.split('/')
  }*/

  var getRomList = function getRomList() {
    var model = $scope.device.model||''

    /*
    $scope.control.romlist(model)
      .then(function(result) {
        $scope.rom.romlist = result.romList
        $scope.$digest()
      })
      .catch(function(err) {
        throw new Error(err.message)
      })
    */

    result = $scope.control.romlist(model)
    $scope.rom.romlist = result.romList

    // $scope.$digest()
  }

  /*
  $scope.dirEnterLocation = function() {
    if ($scope.rom.search) {
      resetPaths($scope.rom.search)
      listDir()
      $scope.rom.search = $scope.getAbsolutePath()
    }
  }

  $scope.getFile = function(file) {
    var path = $scope.getAbsolutePath() + '/' + file
    $scope.control.fsretrieve(path)
      .then(function(result) {
        if (result.body) {
          location.href = result.body.href + '?download'
        }
      })
      .catch(function(err) {
        throw new Error(err.message)
      })
  }
  */

  // Initialize
  getRomList()
}
