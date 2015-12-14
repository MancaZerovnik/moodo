'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('MainCtrl', function ($scope, $timeout) {
    var timer;
    $scope.image = 1;
    var sliderFunc = function() {
      timer = $timeout(function() {
        $scope.image = (($scope.image + 1) % 3) + 1
            timer = $timeout(sliderFunc, 2000);
      }, 2000);
    };

    sliderFunc();

    $scope.$on('$destroy', function() {
      $timeout.cancel(timer); // when the scope is getting destroyed, cancel the timer
    });
  });
