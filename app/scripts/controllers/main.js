'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
