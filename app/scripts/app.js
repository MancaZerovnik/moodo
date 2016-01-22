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
    'ui-rangeSlider',
    'nvd3'
  ])
  .constant('_',
    window._
  )
  .service('DataAll', function($http) {
    var myData = null;
    var mySongs = null;
    var promise = $http.get('../../assets/data/data.json').success(function (data) {
       myData = data;
    });

    return {
      promise:promise,
      getData: function () {
          return myData;
      },
    };
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/splosno', {
        templateUrl: 'views/splosno.html',
        controller: 'SplosnoCtrl',
        resolve:{
          'MyServiceData':function(DataAll){
            // MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
            return DataAll.promise;
        }
      }})
      .when('/razpolozenjeinbarve', {
        templateUrl: 'views/razpolozenjeinbarve.html',
        controller: 'RazpolozenjeInBarveCtrl',
        resolve:{
          'MyServiceData':function(DataAll){
            // MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
            return DataAll.promise;
        }
      }})
      .when('/razplozenjeinglasba', {
        templateUrl: 'views/razpolozenjeinglasba.html',
        controller: 'RazpolozenjeInGlasbaCtrl',
        resolve:{
          'MyServiceData':function(DataAll){
            // MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
            return DataAll.promise;
          }
      }})
      .otherwise({
        redirectTo: '/'
      });
  });
