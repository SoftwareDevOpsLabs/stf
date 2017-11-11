var _ = require('lodash')

var filterOps = {
  '<': function(a, filterValue) {
    return a !== null && a < filterValue
  }
, '<=': function(a, filterValue) {
    return a !== null && a <= filterValue
  }
, '>': function(a, filterValue) {
    return a !== null && a > filterValue
  }
, '>=': function(a, filterValue) {
    return a !== null && a >= filterValue
  }
, '=': function(a, filterValue) {
    return a !== null && a === filterValue
  }
}

// 2017-11-11 @HY only admin user can modify device note
module.exports = function DeviceColumnService($filter, gettext, UserService) {
  // Definitions for all possible values.
  return {
    state: DeviceStatusCell({
      title: gettext('Status')
    , value: function(device) {
        return $filter('translate')(device.enhancedStateAction)
      }
    })
  , model: DeviceModelCell({
      title: gettext('Model')
    , value: function(device) {
        return device.model || device.serial
      }
    })
  , name: DeviceNameCell({
      title: gettext('Product')
    , value: function(device) {
        return device.name || device.model || device.serial
      }
    })
  , operator: TextCell({
      title: gettext('Carrier')
    , value: function(device) {
        return device.operator || ''
      }
    })
  , releasedAt: DateCell({
      title: gettext('Released')
    , value: function(device) {
      }
    })
  , version: TextCell({
      title: gettext('OS')
    , value: function(device) {
        return device.version || ''
      }
    , compare: function(deviceA, deviceB) {
        var va = (deviceA.version || '0').split('.')
        var vb = (deviceB.version || '0').split('.')
        var la = va.length
        var lb = vb.length

        for (var i = 0, l = Math.max(la, lb); i < l; ++i) {
          var a = i < la ? parseInt(va[i], 10) : 0
          var b = i < lb ? parseInt(vb[i], 10) : 0
          var diff = a - b

          // One of the values might be something like 'M'. If so, do a string
          // comparison instead.
          if (isNaN(diff)) {
            diff = compareRespectCase(va[i], vb[i])
          }

          if (diff !== 0) {
            return diff
          }
        }

        return 0
      }
    , filter: function(device, filter) {
        var va = (device.version || '0').split('.')
        var vb = (filter.query || '0').split('.')
        var la = va.length
        var lb = vb.length
        var op = filterOps[filter.op || '=']

        // We have a single value and no operator or field. It matches
        // too easily, let's wait for a dot (e.g. '5.'). An example of a
        // bad match would be an unquoted query for 'Nexus 5', which targets
        // a very specific device but may easily match every Nexus device
        // as the two terms are handled separately.
        if (filter.op === null && filter.field === null && lb === 1) {
          return false
        }

        if (vb[lb - 1] === '') {
          // This means that the query is not complete yet, and we're
          // looking at something like "4.", which means that the last part
          // should be ignored.
          vb.pop()
          lb -= 1
        }

        for (var i = 0, l = Math.min(la, lb); i < l; ++i) {
          var a = parseInt(va[i], 10)
          var b = parseInt(vb[i], 10)

          // One of the values might be non-numeric, e.g. 'M'. In that case
          // filter by string value instead.
          if (isNaN(a) || isNaN(b)) {
            if (!op(va[i], vb[i])) {
              return false
            }
          }
          else {
            if (!op(a, b)) {
              return false
            }
          }
        }

        return true
      }
    })
  , network: TextCell({
      title: gettext('Network')
    , value: function(device) {
        if (!device.network) {
          return ''
        }

        if (!device.network.connected) {
          return ''
        }

        if (device.network.subtype) {
          return (device.network.type + ' (' + device.network.subtype + ')').toUpperCase()
        }

        return (device.network.type || '').toUpperCase()
      }
    })
  , display: TextCell({
      title: gettext('Screen')
    , defaultOrder: 'desc'
    , value: function(device) {
        return device.display && device.display.width
          ? device.display.width + 'x' + device.display.height
          : ''
      }
    , compare: function(deviceA, deviceB) {
        var va = deviceA.display && deviceA.display.width
          ? deviceA.display.width * deviceA.display.height
          : 0
        var vb = deviceB.display && deviceB.display.width
          ? deviceB.display.width * deviceB.display.height
          : 0
        return va - vb
      }
    })
  , browser: DeviceBrowserCell({
      title: gettext('Browser')
    , value: function(device) {
        return device.browser || {apps: []}
      }
    })
  , serial: TextCell({
      title: gettext('Serial')
    , value: function(device) {
        return device.serial || ''
      }
    })
  , manufacturer: TextCell({
      title: gettext('Manufacturer')
    , value: function(device) {
        return device.manufacturer || ''
      }
    })
  , sdk: NumberCell({
      title: gettext('SDK')
    , defaultOrder: 'desc'
    , value: function(device) {
        return device.sdk
      }
    , format: function(value) {
        return value || ''
      }
    })
  , abi: TextCell({
      title: gettext('ABI')
    , value: function(device) {
        return device.abi || ''
      }
    })
  , phone: TextCell({
      title: gettext('Phone')
    , value: function(device) {
        return device.phone ? device.phone.phoneNumber : ''
      }
    })
  , imei: TextCell({
      title: gettext('Phone IMEI')
    , value: function(device) {
        return device.phone ? device.phone.imei : ''
      }
    })
  , imsi: TextCell({
      title: gettext('Phone IMSI')
    , value: function(device) {
        return device.phone ? device.phone.imsi : ''
      }
    })
  , iccid: TextCell({
      title: gettext('Phone ICCID')
    , value: function(device) {
        return device.phone ? device.phone.iccid : ''
      }
    })
  , batteryHealth: TextCell({
      title: gettext('Battery Health')
    , value: function(device) {
        return device.battery
          ? $filter('translate')(device.enhancedBatteryHealth)
          : ''
      }
    })
  , batterySource: TextCell({
      title: gettext('Battery Source')
    , value: function(device) {
        return device.battery
          ? $filter('translate')(device.enhancedBatterySource)
          : ''
      }
    })
  , batteryStatus: TextCell({
      title: gettext('Battery Status')
    , value: function(device) {
        return device.battery
          ? $filter('translate')(device.enhancedBatteryStatus)
          : ''
      }
    })
  , batteryLevel: NumberCell({
      title: gettext('Battery Level')
    , value: function(device) {
        return device.battery
          ? Math.floor(device.battery.level / device.battery.scale * 100)
          : null
      }
    , format: function(value) {
        return value === null ? '' : value + '%'
      }
    })
  , batteryTemp: NumberCell({
      title: gettext('Battery Temp')
    , value: function(device) {
        return device.battery ? device.battery.temp : null
      }
    , format: function(value) {
        return value === null ? '' : value + '°C'
      }
    })
  , provider: TextCell({
      title: gettext('Location')
    , value: function(device) {
        return device.provider ? device.provider.name : ''
      }
    })
    , presenceChangedAt: DateCell({  // @HY 2017-05-28 Added to present last time the device is online
      title: gettext('PresentedAt')
      , value: function(device) {
        return device.presenceChangedAt ? new Date(device.presenceChangedAt) : null
      }
    })
    , inventoryID: TextCell({
      title: gettext('InventoryID')
      , value: function(device) {
        return device.inventoryID ? device.inventoryID : ''
      }
    })
  , notes: DeviceNoteCell({
      title: gettext('Notes')
    , value: function(device) {
        return device.notes || ''
      }
    })
  , owner: LinkCell({
      title: gettext('User')
    , target: '_blank'
    , value: function(device) {
        return device.owner ? device.owner.name : ''
      }
    , link: function(device) {
        return device.owner ? device.enhancedUserProfileUrl : ''
      }
    })
    , romStatus: RomStatusCell({  // @HY 2017-06-23 Show device update state: new device or rom updated
      title: gettext('RomStatus')
      , value: function (status) {
        return status
          ? $filter('translate')(status)
          : ''
      }
    })
    , nickname: TextCell({  // @HY 2017-06-23 Show nickname of device
      title: gettext('Nickname')
      , value: function(device) {
        return device.nickname ? device.nickname : ''
      }
    })
  }
}

function zeroPadTwoDigit(digit) {
  return digit < 10 ? '0' + digit : '' + digit
}

function compareIgnoreCase(a, b) {
  var la = (a || '').toLowerCase()
  var lb = (b || '').toLowerCase()
  if (la === lb) {
    return 0
  }
  else {
    return la < lb ? -1 : 1
  }
}

function filterIgnoreCase(a, filterValue) {
  var va = (a || '').toLowerCase()
  var vb = filterValue.toLowerCase()
  return va.indexOf(vb) !== -1
}

function compareRespectCase(a, b) {
  if (a === b) {
    return 0
  }
  else {
    return a < b ? -1 : 1
  }
}


function TextCell(options) {
  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'asc'
  , build: function() {
      var td = document.createElement('td')
      td.appendChild(document.createTextNode(''))
      return td
    }
  , update: function(td, item) {
      var t = td.firstChild
      t.nodeValue = options.value(item)
      return td
    }
  , compare: function(a, b) {
      return compareIgnoreCase(options.value(a), options.value(b))
    }
  , filter: function(item, filter) {
      return filterIgnoreCase(options.value(item), filter.query)
    }
  })
}

function NumberCell(options) {
  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'asc'
  , build: function() {
      var td = document.createElement('td')
      td.appendChild(document.createTextNode(''))
      return td
    }
  , update: function(td, item) {
      var t = td.firstChild
      t.nodeValue = options.format(options.value(item))
      return td
    }
  , compare: function(a, b) {
      var va = options.value(a) || 0
      var vb = options.value(b) || 0
      return va - vb
    }
  , filter: (function() {
      return function(item, filter) {
        return filterOps[filter.op || '='](
          options.value(item)
        , Number(filter.query)
        )
      }
    })()
  })
}

function DateCell(options) {
  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'desc'
  , build: function() {
      var td = document.createElement('td')
      td.appendChild(document.createTextNode(''))
      return td
    }
  , update: function(td, item) {
      var t = td.firstChild
      var date = options.value(item)
      if (date) {
        t.nodeValue = date.getFullYear()
          + '-'
          + zeroPadTwoDigit(date.getMonth() + 1)
          + '-'
          + zeroPadTwoDigit(date.getDate())
          + ' '   // @HY 2018-05-28 we need more exact datetime
          + zeroPadTwoDigit(date.getHours())
          + ':'
          + zeroPadTwoDigit(date.getMinutes())
      }
      else {
        t.nodeValue = ''
      }
      return td
    }
  , compare: function(a, b) {
      var va = options.value(a) || 0
      var vb = options.value(b) || 0
      return va - vb
    }
  , filter: (function() {
      function dateNumber(d) {
        return d    // // @HY 2018-05-28 we need more exact datetime
          ? d.getFullYear() * 1000000 + d.getMonth() * 10000 + d.getDate() + 100 * date.getHours() + date.getMinutes()
          : 0
      }
      return function(item, filter) {
        var filterDate = new Date(filter.query)
        var va = dateNumber(options.value(item))
        var vb = dateNumber(filterDate)
        return filterOps[filter.op || '='](va, vb)
      }
    })()
  })
}

function LinkCell(options) {
  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'asc'
  , build: function() {
      var td = document.createElement('td')
      var a = document.createElement('a')
      a.appendChild(document.createTextNode(''))
      td.appendChild(a)
      return td
    }
  , update: function(td, item) {
      var a = td.firstChild
      var t = a.firstChild
      var href = options.link(item)
      if (href) {
        a.setAttribute('href', href)
      }
      else {
        a.removeAttribute('href')
      }
      a.target = options.target || ''
      t.nodeValue = options.value(item)
      return td
    }
  , compare: function(a, b) {
      return compareIgnoreCase(options.value(a), options.value(b))
    }
  , filter: function(item, filter) {
      return filterIgnoreCase(options.value(item), filter.query)
    }
  })
}

function DeviceBrowserCell(options) {
  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'asc'
  , build: function() {
      var td = document.createElement('td')
      var span = document.createElement('span')
      span.className = 'device-browser-list'
      td.appendChild(span)
      return td
    }
  , update: function(td, device) {
      var span = td.firstChild
      var browser = options.value(device)
      var apps = browser.apps.slice().sort(function(appA, appB) {
            return compareIgnoreCase(appA.name, appB.name)
          })

      for (var i = 0, l = apps.length; i < l; ++i) {
        var app = apps[i]
        var img = span.childNodes[i] || span.appendChild(document.createElement('img'))
        var src = '/static/app/browsers/icon/36x36/' + (app.type || '_default') + '.png'

        // Only change if necessary so that we don't trigger a download
        if (img.getAttribute('src') !== src) {
          img.setAttribute('src', src)
        }

        img.title = app.name + ' (' + app.developer + ')'
      }

      while (span.childNodes.length > browser.apps.length) {
        span.removeChild(span.lastChild)
      }

      return td
    }
  , compare: function(a, b) {
      return options.value(a).apps.length - options.value(b).apps.length
    }
  , filter: function(device, filter) {
      return options.value(device).apps.some(function(app) {
        return filterIgnoreCase(app.type, filter.query)
      })
    }
  })
}

function DeviceModelCell(options) {
  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'asc'
  , build: function() {
      var td = document.createElement('td')
      var span = document.createElement('span')
      var image = document.createElement('img')
      span.className = 'device-small-image'
      image.className = 'device-small-image-img pointer'
      span.appendChild(image)
      td.appendChild(span)
      td.appendChild(document.createTextNode(''))
      return td
    }
  , update: function(td, device) {
      var span = td.firstChild
      var image = span.firstChild
      var t = span.nextSibling
      var src = '/static/app/devices/icon/x24/' +
            (device.image || '_default.jpg')

      // Only change if necessary so that we don't trigger a download
      if (image.getAttribute('src') !== src) {
        image.setAttribute('src', src)
      }

      t.nodeValue = options.value(device)

      return td
    }
  , compare: function(a, b) {
      return compareRespectCase(options.value(a), options.value(b))
    }
  , filter: function(device, filter) {
      return filterIgnoreCase(options.value(device), filter.query)
    }
  })
}

function DeviceNameCell(options) {
  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'asc'
  , build: function() {
      var td = document.createElement('td')
      var a = document.createElement('a')
      a.appendChild(document.createTextNode(''))
      td.appendChild(a)
      return td
    }
  , update: function(td, device) {
      var a = td.firstChild
      var t = a.firstChild

      if (device.using) {
        a.className = 'device-product-name-using'
        a.href = '#!/control/' + device.serial
      }
      else if (device.usable) {
        a.className = 'device-product-name-usable'
        a.href = '#!/control/' + device.serial
      }
      else {
        a.className = 'device-product-name-unusable'
        a.removeAttribute('href')
      }

      t.nodeValue = options.value(device)

      return td
    }
  , compare: function(a, b) {
      return compareIgnoreCase(options.value(a), options.value(b))
    }
  , filter: function(device, filter) {
      return filterIgnoreCase(options.value(device), filter.query)
    }
  })
}

function DeviceStatusCell(options) {
  var stateClasses = {
    using: 'state-using btn-primary'
  , busy: 'state-busy btn-warning'
  , available: 'state-available btn-primary-outline'
  , ready: 'state-ready btn-primary-outline'
  , present: 'state-present btn-primary-outline'
  , preparing: 'state-preparing btn-primary-outline btn-success-outline'
  , unauthorized: 'state-unauthorized btn-danger-outline'
  , offline: 'state-offline btn-warning-outline'
  , automation: 'state-automation btn-info'
  }

  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'asc'
  , build: function() {
      var td = document.createElement('td')
      var a = document.createElement('a')
      a.appendChild(document.createTextNode(''))
      td.appendChild(a)
      return td
    }
  , update: function(td, device) {
      var a = td.firstChild
      var t = a.firstChild

      a.className = 'btn btn-xs device-status ' +
        (stateClasses[device.state] || 'btn-default-outline')

      if (device.usable && !device.using) {
        a.href = '#!/control/' + device.serial
      }
      else {
        a.removeAttribute('href')
      }

      t.nodeValue = options.value(device)

      return td
    }
  , compare: (function() {
      var order = {
        using: 10
      , automation: 15
      , available: 20
      , automation: 25   // @HY 2017-06-23 add an order number for devices in automation status
      , busy: 30
      , ready: 40
      , preparing: 50
      , unauthorized: 60
      , offline: 70
      , present: 80
      , absent: 90
      }
      return function(deviceA, deviceB) {
        return order[deviceA.state] - order[deviceB.state]
      }
    })()
  , filter: function(device, filter) {
      return device.state === filter.query
    }
  })
}

function DeviceNoteCell(options) {
  return _.defaults(options, {
    title: options.title
  , defaultOrder: 'asc'
  , build: function() {
      var td = document.createElement('td')
      var span = document.createElement('span')
      var i = document.createElement('i')

      td.className = 'device-note'
      span.className = 'xeditable-wrapper'
      span.appendChild(document.createTextNode(''))

      // 2017-11-11 @HY Add permission rule: only admin can edit device note
      var user = UserService.currentUser

      var className = 'device-note-edit pointer'
      if ((!!user.tags) && user.tags.indexOf('admin') >= 0) {
        className += "fa fa-pencil"
      }

      i.className = className

      td.appendChild(span)
      td.appendChild(i)

      return td
    }
  , update: function(td, item) {
      var span = td.firstChild
      var t = span.firstChild

      t.nodeValue = options.value(item)
      return td
    }
  , compare: function(a, b) {
      return compareIgnoreCase(options.value(a), options.value(b))
    }
  , filter: function(item, filter) {
      return filterIgnoreCase(options.value(item), filter.query)
    }
  })
}

function RomStatusCell(options) {
  var strNew = "NEW_DEVICE"
  var strUpdate = "ROM_UPDATE"
  var strNone = "NONE"

  var stateClasses = {}
  stateClasses[strNew] = 'state-device-new color-green'
  stateClasses[strUpdate] = 'device-status  state-rom-new color-yellow'
  stateClasses[strNone] = 'device-status  state-rom-none'


  var getRomStatus = function romStatus(device) {
    var thisDay = new Date()

    // if ROM is updated within a week, mark it as "UPDATE" device
    var romUpdatedDate = device.romUpdatedAt ? new Date(device.romUpdatedAt) : null
    if (romUpdatedDate !== null && thisDay - romUpdatedDate <= 7 * 24 * 3600 * 1000) {
      return strUpdate
    }

    // if the device has appeared in STF for less than one week, call it "NEW" device
    var createdDate = device.createdAt ? new Date(device.createdAt) : null
    if (createdDate !== null && thisDay - createdDate <= 1 * 7 * 24 * 3600 * 1000) {
      return strNew
    }

    return strNone
  }

  return _.defaults(options, {
    title: options.title
    , defaultOrder: 'asc'
    , build: function() {
      var td = document.createElement('td')
      var a = document.createElement('a')
      a.appendChild(document.createTextNode(''))
      a.className = 'btn color-skyblue'
      td.appendChild(a)
      return td
    }
    , update: function(td, device) {
      var a = td.firstChild
      var t = a.firstChild

      if (device.usable && !device.using) {
        a.href = '#!/control/' + device.serial // TODO: @HY 2017-07-06 转到刷机界面
      }
      else {
        a.removeAttribute('href')
      }

      var value = ''
      var status = getRomStatus(device)
      if (status !== strNone) {
        a.className = stateClasses[status]
        value = options.value(status)
      }
      t.nodeValue = value

      return td
    }
    , compare: (function() {
      var order = {}
      order[strNew] = 10
      order[strUpdate] = 20
      order[strNone] = 30

      return function(device1, device2) {
        return order[getRomStatus(device1)] - order[getRomStatus(device2)]
      }
    })()
  })
}
