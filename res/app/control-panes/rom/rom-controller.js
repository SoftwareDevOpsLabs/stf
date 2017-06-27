module.exports = function RomCtrl($scope) {
  $scope.rom = {
    search: '',
    files: [],
    paths: []
  }

  $scope.getAbsolutePath = function() {
    return ('/' + $scope.rom.paths.join('/')).replace(/\/\/+/g, '/')
  }

  function resetPaths(path) {
    $scope.rom.paths = path.split('/')
  }

  var listDir = function listDir() {
    var path = $scope.getAbsolutePath()
    $scope.rom.search = path

    $scope.control.fslist(path)
      .then(function(result) {
        $scope.romr.files = result.body
        $scope.$digest()
      })
      .catch(function(err) {
        throw new Error(err.message)
      })
  }

  $scope.dirEnterLocation = function() {
    if ($scope.rom.search) {
      resetPaths($scope.rom.search)
      listDir()
      $scope.rom.search = $scope.getAbsolutePath()
    }
  }

  $scope.dirEnter = function(name) {
    if (name) {
      $scope.rom.paths.push(name)
    }
    listDir()
    $scope.rom.search = $scope.getAbsolutePath()
  }

  $scope.dirUp = function() {
    if ($scope.rom.paths.length !== 0) {
      $scope.rom.paths.pop()
    }
    listDir()
    $scope.rom.search = $scope.getAbsolutePath()
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

  // Initialize
  listDir($scope.dir)
}
