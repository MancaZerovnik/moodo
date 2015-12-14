'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInGlasbaCtrl
 * @description
 * # RazpolozenjeInGlasbaCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('RazpolozenjeInGlasbaCtrl', function ($scope, $http, $window) {
    $scope.mainInfo = null;
    $scope.filter = {
        "male": false, 
        "female": false,
        "agemin": 5,
        "agemax": 100,
        "city": false,
        "domestic": false,
        "schoolmin": 0,
        "schoolmax": 20,
        "activeinmusicmin": 0,
        "activeinmusicmax": 20,
        "onehour": false,
        "twohour": false,
        "threehour": false,
        "fourhour": false
    };

    $http.get('../../assets/data/data.json').success(function(data) {
        $scope.mainInfo = data;
    });
    $scope.update = function () {
        console.log($scope.filter);
        $scope.filteredData = _.filter($scope.mainInfo, function(num){ 
            return (($scope.filter.male && num.spol == "M" ||
            $scope.filter.female && num.spol == "Z")
            && (($scope.filter.schoolmin <= parseInt(num.glasbena_sola) && 
                $scope.filter.schoolmax >= parseInt(num.glasbena_sola)))
            && (($scope.filter.agemin <= parseInt(num.starost) && 
                $scope.filter.agemax >= parseInt(num.starost)))
            && (($scope.filter.activeinmusicmin <= parseInt(num.igranje_instrumenta) && 
                $scope.filter.activeinmusicmax >= parseInt(num.igranje_instrumenta))) 
            && (($scope.filter.city && num.kraj_bivanja == "v mestu") || 
                ($scope.filter.domestic && num.kraj_bivanja == "na podezelju"))
            && (($scope.filter.onehour && num.poslusanje_glasbe == "1") ||
                ($scope.filter.twohour && num.poslusanje_glasbe == "2") ||
                ($scope.filter.threehour && num.poslusanje_glasbe == "3") ||
                ($scope.filter.fourhour && num.poslusanje_glasbe == "4"))
            );
            
        });
    }
    //$scope.$watch("#age", $scope.update);

    //var slider = $('#age').slider()
      //  .on('slide', $scope.update())
        //.data('slider');

    //var slider = new Slider('#age', {});
    //var slider = new Slider('#music_school', {});
    //var slider = new Slider('#involvement_in_music', {});
  });