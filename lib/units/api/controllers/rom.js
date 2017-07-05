var util = require('util')

var _ = require('lodash')
var Promise = require('bluebird')
var uuid = require('uuid')
var querystring = require('querystring')
var http = require('http')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')

var log = logger.createLogger('api:controllers:rom')
var host = "127.0.0.1" // @HY 2017-07-05 bad smell: hard-coding host name
var port = "8808"
var path = "/gripper/model/infoList.do"

module.exports = {
  getRomList: getRomList
}

var extractRomList = function(obj) {
  var results = obj.result || null
  if (results === null) {
    return null
  }
  var roms = {romlist: []}

  // to find the first array including rom list
  var aLen = results.length
  console.log("Len: " + aLen)
  for (var i = 0; i < aLen; i++) {
    var r = results[i]
    var rlen = r.length
    for (var j = 0; j < rlen; j++) {
      if (typeof r[j].length !== 'undefined' && typeof r[j][0].ftpDownload !== 'undefined' ) {
        roms.romlist = r[j]
        return roms
      }
    }
  }
  return roms
}

function getRomList(req, res) {
  var modelName = req.swagger.params.model.value

  // Build the post string from an object
  var post_data = querystring.stringify({
    'brand': modelName,
    'device': modelName,
    'nickName': modelName,
  })

  // An object of options to indicate where to post to
  var post_options = {
    host: host,
    port: port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(post_data)
    }
  }

  var badRequest = function(err) {
    log.error('Failed to load rom list: ', err.stack)
    res.status(500).json({
      success: false
    })
    res.end()
  }

  // Set up the request
  var post_req = http.request(post_options, function (gripper_res) {
    gripper_res.setEncoding('utf8');
    var response = ''

    gripper_res.on('data', function (chunk) {
      response += chunk
    })

    gripper_res.on('end', function () {

      try {
        var jsonStr = response
        var strFunc = "(function(){return " + 'JSON.parse("' + jsonStr.trim() + '")' + ";})()";

        var obj = eval(strFunc)
        var romInfo = extractRomList(obj)

        // log.info(JSON.stringify(romInfo))
        res.json({
          success: true
          ,romlist: romInfo.romlist
        })
        res.end()
      } catch (err) {
        badRequest(err)
      }
    })
  })

  // Handle ECONNREFUSED
  // Refer to: https://stackoverflow.com/questions/8381198/catching-econnrefused-in-node-js-with-http-request
  post_req.on('error', function(err) {
    badRequest(err)
  })

  // post the data to gripper
  post_req.write(post_data)
  post_req.end()
}
