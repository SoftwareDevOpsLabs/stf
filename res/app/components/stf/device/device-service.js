var oboe = require('oboe')
var _ = require('lodash')
var EventEmitter = require('eventemitter3')

module.exports = function DeviceServiceFactory($http, socket, EnhanceDeviceService, UserService) {
  var deviceService = {}
  var providers = {}
  var userTags = []

  function Tracker($scope, options) {
    var devices = []
    var devicesBySerial = Object.create(null)
    var scopedSocket = socket.scoped($scope)
    var digestTimer, lastDigest

    $scope.$on('$destroy', function() {
      clearTimeout(digestTimer)
    })

    function digest() {
      // Not great. Consider something else
      if (!$scope.$$phase) {
        $scope.$digest()
      }

      lastDigest = Date.now()
      digestTimer = null
    }

    function notify(event) {
      if (!options.digest) {
        return
      }

      if (event.important) {
        // Handle important updates immediately.
        //digest()
        window.requestAnimationFrame(digest)
      }
      else {
        if (!digestTimer) {
          var delta = Date.now() - lastDigest
          if (delta > 1000) {
            // It's been a while since the last update, so let's just update
            // right now even though it's low priority.
            digest()
          }
          else {
            // It hasn't been long since the last update. Let's wait for a
            // while so that the UI doesn't get stressed out.
            digestTimer = setTimeout(digest, delta)
          }
        }
      }
    }

    function sync(data) {
      // usable IF device is physically present AND device is online AND
      // preparations are ready AND the device has no owner or we are the
      // owner
      data.usable = data.present && data.status === 3 && data.ready &&
        (!data.owner || data.using)

      // Make sure we don't mistakenly think we still have the device
      if (!data.usable || !data.owner) {
        data.using = false
      }

      EnhanceDeviceService.enhance(data)
    }

    function get(data) {
      return devices[devicesBySerial[data.serial]]
    }

    var insert = function insert(data) {
      devicesBySerial[data.serial] = devices.push(data) - 1
      sync(data)
      this.emit('add', data)
    }.bind(this)

    var modify = function modify(data, newData) {
      _.merge(data, newData, function(a, b) {
        // New Arrays overwrite old Arrays
        if (_.isArray(b)) {
          return b
        }
      })
      sync(data)
      this.emit('change', data)
    }.bind(this)

    var remove = function remove(data) {
      var index = devicesBySerial[data.serial]
      if (index >= 0) {
        devices.splice(index, 1)
        delete devicesBySerial[data.serial]
        this.emit('remove', data)
      }
    }.bind(this)

    function fetch(data) {
      deviceService.load(data.serial)
        .then(function(device) {
          return changeListener({
            important: true
          , data: device
          })
        })
        .catch(function() {})
    }

    // TODO: @HY 2017-08-06 need to move this function to backend component
    function filterByAuthorizationRules(deviceData) {
      // console.log("+++++++++++++filterByAuthorizationRules++++++++++++")
      var isFiltered = true

      // Rule 0： filter out device that's no provider data
      if (deviceData.provider == null)
        return true

      var providerName = deviceData.provider.name
      var provider = providers[providerName]

      // Rule 1: admin is super user
      if (userTags.indexOf('admin') >= 0) {
        // resolve(false)
        return false
      }

      // Rule 2: users tagged with 'blacklist' can't get any device.
      if (userTags.indexOf('blacklist') >= 0) {
        // resolve(true)
        return true
      }

      // Rule 3: no provider's info in DB, so dont filter out this provider
      if (provider == null) {
        // resolve(false)
        return false
      }

      // Rule 4: if provider has no tags, devices on the provider are public
      var providerTags = provider.tags ? provider.tags.split(',') : []
      if (providerTags.length === 0) {
        // resolve(false)
        return false
      }

      // Rule 5: if provider has any tag, only user who has the same tag with provider's tag
      // can access devices on the provider
      for (var i = 0; i < userTags.length; i++) {
        for (var j = 0; j < providerTags.length; j++) {
          if ((!!userTags[i]) && (!!providerTags[j])
            && userTags[i].toUpperCase() === providerTags[j].toUpperCase()) {
            return false
          }
        }
      }

      return true
    }

    function addListener(event) {
      var device = get(event.data)
      if (device) {
        modify(device, event.data)
        notify(event)
      }
      else {
        if (options.filter(event.data) && filterByAuthorizationRules(event.data) === false) {
          insert(event.data)
          notify(event)
        }
      }
    }

    function changeListener(event) {
      var device = get(event.data)
      if (device) {
        modify(device, event.data)
        if (!options.filter(device)) {
          remove(device)
        }
        notify(event)
      }
      else {
        if (options.filter(event.data) && filterByAuthorizationRules(event.data) === false) {
          insert(event.data)
          // We've only got partial data
          fetch(event.data)
          notify(event)
        }
      }
    }

    scopedSocket.on('device.add', addListener)
    scopedSocket.on('device.remove', changeListener)
    scopedSocket.on('device.change', changeListener)

    this.add = function(device) {
      addListener({
        important: true
      , data: device
      })
    }

    this.devices = devices
  }

  Tracker.prototype = new EventEmitter()

  deviceService.trackAll = function($scope) {
    var tracker = new Tracker($scope, {
      filter: function() {
        return true
      }
    , digest: false
    })

    // @HY 2017-08-06 added for authorization
    // code in function trackAll should be executed before changeListener and addListener
    // so initialize variables userTags and providers at here
    userTags = UserService.currentUser.tags ? UserService.currentUser.tags.split(',') : []
    oboe('/api/v1/servers')
      .node('servers[*]', function(provider) {
         providers[provider.name] = provider
      })

    oboe('/api/v1/devices')
      .node('devices[*]', function(device) {
        tracker.add(device)
      })

    return tracker
  }

  deviceService.trackGroup = function($scope) {
    var tracker = new Tracker($scope, {
      filter: function(device) {
        return device.using
      }
    , digest: true
    })

    oboe('/api/v1/user/devices')
      .node('devices[*]', function(device) {
        tracker.add(device)
      })

    return tracker
  }

  deviceService.load = function(serial) {
    return $http.get('/api/v1/devices/' + serial)
      .then(function(response) {
        return response.data.device
      })
  }

  deviceService.get = function(serial, $scope) {
    var tracker = new Tracker($scope, {
      filter: function(device) {
        return device.serial === serial
      }
    , digest: true
    })

    return deviceService.load(serial)
      .then(function(device) {
        tracker.add(device)
        return device
      })
  }

  deviceService.updateNote = function(serial, note) {
    socket.emit('device.note', {
      serial: serial,
      note: note
    })
  }

  return deviceService
}
