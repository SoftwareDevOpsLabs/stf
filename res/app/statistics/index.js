module.exports = angular.module('statistics', [
  require('stf/common-ui/nice-tabs').name
  ,require('./users').name
  ,require('./devices').name
])
  .config(function($routeProvider) {

    $routeProvider
      .when('/statistics/', {
        template: require('./statistics.pug')
      })
  })
  .controller('StatisticsCtrl', require('./statistics-controller'))
