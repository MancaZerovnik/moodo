'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInGlasbaCtrl
 * @description
 * # RazpolozenjeInGlasbaCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('RazpolozenjeInGlasbaCtrl', function ($scope, $http) {
    $scope.mainInfo = null;
    $http.get('../../assets/data/data.json').success(function(data) {
        $scope.mainInfo = data;
    });
    

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });