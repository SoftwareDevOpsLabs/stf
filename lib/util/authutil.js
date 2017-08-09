var logger = require('./logger')

var log = logger.createLogger('util:authutil')

var authutil = module.exports = Object.create(null)

authutil.filterByAuthorizationRules = function filterByAuthorizationRules(device, user, provider) {
  /*
  log.error("+++++++++++++++++++++++++")
  log.error(provider)
  log.error(device.model)
  log.error(user) */


  var isFiltered = true

  var userTags = user.tags == null ? [] : user.tags.split(',')
  userTags.map(function (elem) {
    return elem.toLowerCase()
  })
  // log.error(userTags)

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

  // log.error("NOT filtered inside getDevices!")

  var providerName = device.provider == null ? '' : device.provider.name

  // no provider's info in DB, so not filter out this provider
  if (provider == null) {
    // resolve(false)
    return false
  }

  var providerTags = provider.tags ? provider.tags.split(',') : []

  /*
  log.error("userTags: " + userTags)
  log.error(providerTags)
  */

  // Rule 3: if provider has no tags, devices on the provider are public
  if (providerTags.length === 0) {
    // resolve(false)
    return false
  }

  // Rule 4: if provider has any tag, only user who has the same tag with provider
  // can access devices on the provider
  for (var i = 0; i < userTags.length; i++) {
    for (var j = 0; j < providerTags.length; j++) {
      /*
      log.error("userTag: " + userTags[i])
      log.error("providerTag: " + providerTags[j])
      log.error(userTags[i].toUpperCase())
      log.error(providerTags[j].toUpperCase())
      log.error("=============================")
      */
      if ((!!userTags[i]) && (!!providerTags[j])
        && userTags[i].toUpperCase() === providerTags[j].toUpperCase()) {
        // resolve(false)
        return false
      }
    }
  }

  return true
}