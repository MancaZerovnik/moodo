'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
