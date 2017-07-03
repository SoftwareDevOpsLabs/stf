module.exports = function ControlServiceFactory(
  $upload
, $http
, socket
, TransactionService
, $rootScope
, gettext
, KeycodesMapped
) {
  var controlService = {
  }

  function ControlService(target, channel) {
    function sendOneWay(action, data) {
      socket.emit(action, channel, data)
    }

    function sendTwoWay(action, data) {
      var tx = TransactionService.create(target)
      socket.emit(action, channel, tx.channel, data)
      return tx.promise
    }

    function keySender(type, fixedKey) {
      return function(key) {
        if (typeof key === 'string') {
          sendOneWay(type, {
            key: key
          })
        }
        else {
          var mapped = fixedKey || KeycodesMapped[key]
          if (mapped) {
            sendOneWay(type, {
              key: mapped
            })
          }
        }
      }
    }

    this.gestureStart = function(seq) {
      sendOneWay('input.gestureStart', {
        seq: seq
      })
    }

    this.gestureStop = function(seq) {
      sendOneWay('input.gestureStop', {
        seq: seq
      })
    }

    this.touchDown = function(seq, contact, x, y, pressure) {
      sendOneWay('input.touchDown', {
        seq: seq
      , contact: contact
      , x: x
      , y: y
      , pressure: pressure
      })
    }

    this.touchMove = function(seq, contact, x, y, pressure) {
      sendOneWay('input.touchMove', {
        seq: seq
      , contact: contact
      , x: x
      , y: y
      , pressure: pressure
      })
    }

    this.touchUp = function(seq, contact) {
      sendOneWay('input.touchUp', {
        seq: seq
      , contact: contact
      })
    }

    this.touchCommit = function(seq) {
      sendOneWay('input.touchCommit', {
        seq: seq
      })
    }

    this.touchReset = function(seq) {
      sendOneWay('input.touchReset', {
        seq: seq
      })
    }

    this.keyDown = keySender('input.keyDown')
    this.keyUp = keySender('input.keyUp')
    this.keyPress = keySender('input.keyPress')

    this.home = keySender('input.keyPress', 'home')
    this.menu = keySender('input.keyPress', 'menu')
    this.back = keySender('input.keyPress', 'back')

    this.type = function(text) {
      return sendOneWay('input.type', {
        text: text
      })
    }

    this.paste = function(text) {
      return sendTwoWay('clipboard.paste', {
        text: text
      })
    }

    this.copy = function() {
      return sendTwoWay('clipboard.copy')
    }

    //@TODO: Refactor this please
    var that = this
    this.getClipboardContent = function() {
      that.copy().then(function(result) {
        $rootScope.$apply(function() {
          if (result.success) {
            if (result.lastData) {
              that.clipboardContent = result.lastData
            } else {
              that.clipboardContent = gettext('No clipboard data')
            }
          } else {
            that.clipboardContent = gettext('Error while getting data')
          }
        })
      })
    }

    this.shell = function(command) {
      return sendTwoWay('shell.command', {
        command: command
      , timeout: 10000
      })
    }

    this.identify = function() {
      return sendTwoWay('device.identify')
    }

    this.install = function(options) {
      return sendTwoWay('device.install', options)
    }

    this.uninstall = function(pkg) {
      return sendTwoWay('device.uninstall', {
        packageName: pkg
      })
    }

    this.reboot = function() {
      return sendTwoWay('device.reboot')
    }

    this.rotate = function(rotation, lock) {
      return sendOneWay('display.rotate', {
        rotation: rotation,
        lock: lock
      })
    }

    this.testForward = function(forward) {
      return sendTwoWay('forward.test', {
        targetHost: forward.targetHost
      , targetPort: Number(forward.targetPort)
      })
    }

    this.createForward = function(forward) {
      return sendTwoWay('forward.create', {
        id: forward.id
      , devicePort: Number(forward.devicePort)
      , targetHost: forward.targetHost
      , targetPort: Number(forward.targetPort)
      })
    }

    this.removeForward = function(forward) {
      return sendTwoWay('forward.remove', {
        id: forward.id
      })
    }

    this.startLogcat = function(filters) {
      return sendTwoWay('logcat.start', {
        filters: filters
      })
    }

    this.stopLogcat = function() {
      return sendTwoWay('logcat.stop')
    }

    this.startRemoteConnect = function() {
      return sendTwoWay('connect.start')
    }

    this.stopRemoteConnect = function() {
      return sendTwoWay('connect.stop')
    }

    this.openBrowser = function(url, browser) {
      return sendTwoWay('browser.open', {
        url: url
      , browser: browser ? browser.id : null
      })
    }

    this.clearBrowser = function(browser) {
      return sendTwoWay('browser.clear', {
        browser: browser.id
      })
    }

    this.openStore = function() {
      return sendTwoWay('store.open')
    }

    this.screenshot = function() {
      return sendTwoWay('screen.capture')
    }

    this.fsretrieve = function(file) {
      return sendTwoWay('fs.retrieve', {
        file: file
      })
    }

    this.fslist = function(dir) {
      return sendTwoWay('fs.list', {
        dir: dir
      })
    }

    // @HY 2017-07-03 add for rom pannel
    this.romlist = function(model) {

      /*
      return sendTwoWay('rom.list', {
        model: model
      })
      */
      // Mock data TODO: remove below mock data @HY 2017-07-03
      return {
        romList:
          [
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.0.0A/update.zip',
              id: 26,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_5.2.0.0A',
              updateLog: '' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.0.1A/update.zip',
              id: 27,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_5.2.0.1A',
              updateLog: '' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.1.0A/update.zip',
              id: 28,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_5.2.1.0A',
              updateLog: '' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.1.1A/update.zip',
              id: 29,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_5.2.1.1A',
              updateLog: '' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.2.1A/update.zip',
              id: 30,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_5.2.2.1A',
              updateLog: '' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.3.0A/update.zip',
              id: 31,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_5.2.3.0A',
              updateLog: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.3.0A/%E6%9B%B4%E6%96%B0%E6%97%A5%E5%BF%97.docx' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.4.0A/update.zip',
              id: 32,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_5.2.4.0A',
              updateLog: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.4.0A/%E6%9B%B4%E6%96%B0%E6%97%A5%E5%BF%97.docx' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.4.1A/update.zip',
              id: 33,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_5.2.4.1A',
              updateLog: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_5.2.4.1A/%E6%9B%B4%E6%96%B0%E6%97%A5%E5%BF%97.docx' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_6.0.0.0A/update.zip',
              id: 34,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_6.0.0.0A',
              updateLog: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_6.0.0.0A/%E6%9B%B4%E6%96%B0%E6%97%A5%E5%BF%97.docx' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_6.0.1.0A/update.zip',
              id: 35,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme_6.0.1.0A',
              updateLog: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme_6.0.1.0A/%E6%9B%B4%E6%96%B0%E6%97%A5%E5%BF%97.docx' },
            { frameworkName: '',
              ftpDownload: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme%206.0.2.0A/update.zip',
              id: 36,
              kernelVer: '',
              osVer: '',
              uiVer: 'Flyme 6.0.2.0A',
              updateLog: 'ftp://10.208.36.242:10021/ROM/%E9%AD%85%E8%93%9D/PRO_6/%E7%A8%B3%E5%AE%9A%E7%89%88/Flyme%206.0.2.0A/%E6%9B%B4%E6%96%B0%E6%97%A5%E5%BF%97.docx'
            }
          ]
      }

    }

    this.checkAccount = function(type, account) {
      return sendTwoWay('account.check', {
        type: type
      , account: account
      })
    }

    this.removeAccount = function(type, account) {
      return sendTwoWay('account.remove', {
        type: type
      , account: account
      })
    }

    this.addAccountMenu = function() {
      return sendTwoWay('account.addmenu')
    }

    this.addAccount = function(user, password) {
      return sendTwoWay('account.add', {
        user: user
      , password: password
      })
    }

    this.getAccounts = function(type) {
      return sendTwoWay('account.get', {
        type: type
      })
    }

    this.getSdStatus = function() {
      return sendTwoWay('sd.status')
    }

    this.setRingerMode = function(mode) {
      return sendTwoWay('ringer.set', {
        mode: mode
      })
    }

    this.getRingerMode = function() {
      return sendTwoWay('ringer.get')
    }

    this.setWifiEnabled = function(enabled) {
      return sendTwoWay('wifi.set', {
        enabled: enabled
      })
    }

    this.getWifiStatus = function() {
      return sendTwoWay('wifi.get')
    }

    //TODO @chenhao 添加测试命令
    this.startTest = function(test) {
      // @hy 2017-05-17 replace above json string to below test var
      return sendOneWay('startTest', test)
    }
    //TODO @chenhao 添加停止测试命令
    this.stopTest = function(test) {
      return sendOneWay('stopTest',{
        id : test.id
      })
    }

    window.cc = this
  }

  controlService.create = function(target, channel) {
    return new ControlService(target, channel)
  }

  return controlService
}
