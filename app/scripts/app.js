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
    'nvd3',
    'pascalprecht.translate'
  ])
  .constant('_',
    window._
  )
  .service('DataAll', function($http, $q) {
    var deferred = $q.defer();
    $http.get('../../assets/data/data.json').success(function (data) {
       deferred.resolve(data);
    });

    return deferred.promise;
  })
  .service('SongsAll', function($http, $q) {

    var deferred = $q.defer();
    var promise = $http.get('../../assets/data/songs.json').success(function (data) {
       deferred.resolve(data);
    });

    return deferred.promise;
  })
  .controller('TranslateController', function($translate, $scope) {
      $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
      };
    })
  .config(function ($routeProvider, $translateProvider) {
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
          },
          'MyServiceData':function(SongsAll){
            // MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
            return SongsAll.promise;
          }
      }})
      .when('/razpolozenjeinbarve', {
        templateUrl: 'views/razpolozenjeinbarve.html',
        controller: 'RazpolozenjeInBarveCtrl',
        resolve:{
          'MyServiceData':function(DataAll){
            // MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
            return DataAll.promise;
          },
          'MyServiceData':function(SongsAll){
            // MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
            return SongsAll.promise;
          }
      }})
      .when('/razplozenjeinglasba', {
        templateUrl: 'views/razpolozenjeinglasba.html',
        controller: 'RazpolozenjeInGlasbaCtrl',
        resolve:{
          'MyServiceData':function(DataAll){
            // MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
            return DataAll.promise;
          },
          'MyServiceData':function(SongsAll){
            // MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
            return SongsAll.promise;
          }
      }})
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
	 
      //$translateProvider.useSanitizeValueStrategy('sanitize');
      $translateProvider.useStaticFilesLoader({
        prefix: '../../../languages/',
        suffix: '.json'
      });
      
      $translateProvider.preferredLanguage('slo');
      $translateProvider.useLocalStorage();

   })
  .filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
  });
    

