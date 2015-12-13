'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInBarveCtrl
 * @description
 * # RazpolozenjeInBarveCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('RazpolozenjeInBarveCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var slider = new Slider('#age', {});
    var slider = new Slider('#music_school', {});
    var slider = new Slider('#involvement_in_music', {});
  });