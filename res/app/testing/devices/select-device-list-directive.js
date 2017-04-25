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
        console.log('设备信息',device);
        scope.devices.push(device);
        scope.$apply()
      }

      function changeListener(){

      }

      function removeListener(){

      }

      tracker.on('add', addListener)
      tracker.on('change', changeListener)
      tracker.on('remove', removeListener)

      // Maybe we're already late
      tracker.devices.forEach(addListener)

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
