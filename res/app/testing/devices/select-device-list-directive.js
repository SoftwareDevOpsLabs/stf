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
	console.log("++++++++addListener++++++++++")
	console.log(device)
        if (device == null)
          return

        // @hy, 2017-05-08, only display usable devices
	// device usage will not be recovered to null after Ungrouping
        if (device.usable === true && (device.using === false || device.usage !== "automation")) {
          scope.devices.push(device)
          scope.$apply()
        }
      }

      function changeListener(device) {
        // @hy, 2017-05-08
        // return once device is invalid
        if (device == null)
          return

	console.log("++++++++changeListener++++++++++")
	console.log(device)
		
        pos=scope.devices.indexOf(device)

        // if device has been already in the list, check if it's usable
 	// @hy 2017-05-27 remove the device in the state of "automation"
        if (pos >= 0) {
          if (device.usable === false || 
              (device.usable === true && device.usage === "automation")) {
            // scope.devices.splice(pos, 1)
            delete scope.devices[pos]
            scope.$apply()
          }
        // otherwise, check if it's an usable new device
        } else {
	  // @hy 2017-05-27 the devices used by automation test will not be listed in UI  	
          if (device.usable === true && (device.using === false || device.usage !== "automation")) {
            scope.devices.push(device)
            scope.$apply()
          }
        }
      }

      function removeListener(device){
        // @hy, 2017-05-27
        // return once device is invalid
        if (device == null)
          return
	console.log("++++++++removeListener++++++++++")
	console.log(device)
		
        pos=scope.devices.indexOf(device)

        // if device has been already in the list, remove it
        if (pos >= 0) {
            delete scope.devices[pos]
            scope.$apply()
        } 
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
