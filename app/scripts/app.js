'use strict';

/**
 * @ngdoc overview
 * @name modooApp
 * @description
 * # modooApp
 *
 * Main module of the application.
 */
angular
  .module('modooApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui-rangeSlider'
  ])
  .constant('_',
    window._
  )
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/splosno', {
        templateUrl: 'views/splosno.html',
        controller: 'SplosnoCtrl'
      })
      .when('/razpolozenjeinbarve', {
        templateUrl: 'views/razpolozenjeinbarve.html',
        controller: 'RazpolozenjeInBarveCtrl'
      })
      .when('/razplozenjeinglasba', {
        templateUrl: 'views/razpolozenjeinglasba.html',
        controller: 'RazpolozenjeInGlasbaCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });