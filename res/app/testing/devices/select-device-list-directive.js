var patchArray = require('./../util/patch-array')

module.exports = function SelectDeviceListDirective(
  $filter
, $compile
, $rootScope
, gettext
) {
  return {
    restrict: 'E'
  , template: require('./select-device-list.pug')
  , scope: {
      tracker: '&tracker',
      devices: '='
    }
  , link: function(scope, element) {
      var activeColumns = []
      var tracker = scope.tracker()
      var prefix = 'd' + Math.floor(Math.random() * 1000000) + '-'
      var mapping = Object.create(null)

      element.on('click', function(e) {
        //checkDeviceStatus(e)
        //checkDeviceSmallImage(e)
        //checkDeviceNote(e)
      })
       	
      function addListener(device) {
        // @hy, 2017-05-08, only display usable devices
        if (device != null && device.usable === true) {
          scope.devices.push(device)
          scope.$apply()
        }
      }

      function changeListener(device) {
        // @hy, 2017-05-08
        // return once device is invalid
        if (device == null)
          return
		
        pos=scope.devices.indexOf(device)

        // if device has been already in the list, check if it's usable
        if (pos >= 0) {
          if (device.usable === false) {
            // scope.devices.splice(pos, 1)
            delete scope.devices[pos]
            scope.$apply()
          }
        // otherwise, check if it's an usable new device
        } else {
          if (device.usable === true) {
            scope.devices.push(device)
            scope.$apply()
          }
        }
      }

      function removeListener(device){
      }

      tracker.on('add', addListener)
      tracker.on('change', changeListener)
      tracker.on('remove', removeListener)

      // Maybe we're already late
      tracker.devices.forEach(addListener)
      //tracker.devices.forEach(changeListener)
      tracker.devices.forEach(removeListener)

      scope.$on('$destroy', function() {
        tracker.removeListener('add', addListener)
        tracker.removeListener('change', changeListener)
        tracker.removeListener('remove', removeListener)
      })

      scope.checkDeviceItem = function (obj) {
        if (obj.device['checked']){
          obj.device['checked'] = false;
        }else{
          obj.device['checked'] = true;
        }
      }
    }
  }
}
