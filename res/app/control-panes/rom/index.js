require('./rom.css')

module.exports = angular.module('stf.rom', [])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put('control-panes/rom/rom.pug',
      require('./rom.pug')
    )
  }])
  .filter('fileIsDir', function() {
    return function(m) {
      var mode = m
      if (mode !== null) {
        mode = parseInt(mode, 10)
        mode -= (mode & 0777)
        return (mode === 040000) || (mode === 0120000)
      }
    }
  })
  .filter('formatFileSize', function() {
    return function(size) {
      var formattedSize
      if (size < 1024) {
        formattedSize = size + ' B'
      } else if (size >= 1024 && size < 1024 * 1024) {
        formattedSize = Math.round(size / 1024, 1) + ' Kb'
      } else {
        formattedSize = Math.round(size / (1024 * 1024), 1) + ' Mb'
      }
      return formattedSize
    }
  })
  .filter('formatFileDate', function() {
    return function(inputString) {
      var input = new Date(inputString)
      return input instanceof Date ?
        input.toISOString().substring(0, 19).replace('T', ' ') :
        (input.toLocaleString || input.toString).apply(input)
    }
  })
  .filter('basename', function() {
    return function(path) {}
      console.log('++++++++++++++++++++basename+++++++++++++++++')
      var base = new String(path).substring(str.lastIndexOf('/') + 1);
      return base
  })

  .controller('RomCtrl', require('./rom-controller'))
