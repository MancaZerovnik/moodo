'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInBarveCtrl
 * @description
 * # RazpolozenjeInBarveCtrl
 * Controller of the modooApp
 */
var app = angular.module('modooApp')
  .controller('RazpolozenjeInBarveCtrl', function ($scope, $http, $window) {
    $scope.mainInfo = null;
    $scope.filter = {
        "male": true, 
        "female": false,
        "agemin": 5,
        "agemax": 100,
        "city": true,
        "domestic": false,
        "schoolmin": 0,
        "schoolmax": 20,
        "activeinmusicmin": 0,
        "activeinmusicmax": 20,
        "onehour": true,
        "twohour": false,
        "threehour": false,
        "fourhour": false
    };

    $http.get('../../assets/data/data.json').success(function(data) {
        $scope.mainInfo = data;
        $scope.update();        
    });

    $scope.update = function () {
        $scope.filteredData = _.filter($scope.mainInfo, function(num){ 
            //console.log($scope.filter);
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
        console.log($scope.filter.agemin);
        $scope.usersMoodData = getUsersMood($scope.filteredData);
        $scope.moodVAEstimationData = getMoodVAEstimationData($scope.filteredData);
    };

    $scope.$watch('filteredData', function() {
        //console.log("change" + $scope.filter.agemin);
        //console.log($scope.filter.agemin);
        //$scope.usersMoodData = getUsersMood($scope.filteredData);
        //$scope.moodVAEstimationData = getMoodVAEstimationData($scope.filteredData);
   });
    
    $scope.usersMoodGraph = setVAgraph();
    $scope.moodVAEstimationGraph = setVAgraphLegend();

    function setVAgraph()
    {
        return {
            chart: {
                type: 'scatterChart',
                height: 450,
                color: d3.scale.category10().range(),
                scatter: {
                    onlyCircles: false
                },
                tooltipContent: function(key) {
                    return '<h3>' + key + '</h3>';
                },
                duration: 350,
                xAxis: {
                    axisLabel: 'Valence',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    }
                },
                xDomain: [-1, 1],
                yDomain: [-1,1],
                yAxis: {
                    axisLabel: 'Arousal',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -5
                },
                showLegend: false
            }
        };
    }

    function setVAgraphLegend()
    {
        return {
            chart: {
                type: 'scatterChart',
                height: 450,
                color: d3.scale.category10().range(),
                scatter: {
                    onlyCircles: false
                },
                tooltipContent: function(key) {
                    return '<h3>' + key + '</h3>';
                },
                duration: 350,
                xAxis: {
                    axisLabel: 'Valence',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    }
                },
                xDomain: [-1, 1],
                yDomain: [-1,1],
                yAxis: {
                    axisLabel: 'Arousal',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -5
                },
                showLegend: true
            }
        };
    }
        
    function getUsersMood(inputData) {
        var data = [];
                   
        data.push({            
            values: []
        });

        if(inputData) {
            for (var j = 0; j < inputData.length; j++) {
            //data[0].values.push(inputData[j]['razpolozenje_trenutno']);

                data[0].values.push({
                    x: parseFloat(inputData[j]['razpolozenje_trenutno']['x']),
                    y: parseFloat(inputData[j]['razpolozenje_trenutno']['y'])
                });
            }
                
        }        
        
        return data;
    }

    function getMoodVAEstimationData(inputData)
    {
        var data = [];
        if(inputData) {          
            for (var i = 0; i < inputData.length; i++)
            {
                
                for (var j = 0; j < inputData[i].custva.length; j++)
                {
                    if (angular.isUndefined(data[parseInt(inputData[i]['custva'][j]['id'] - 1)]) && 'x' in inputData[i]['custva'][j])
                        data[parseInt(inputData[i]['custva'][j]['id']) -1] = {key: inputData[i]['custva'][j]['ime'], values:[]};
                    

                        if ('x' in inputData[i]['custva'][j])
                            data[parseInt(inputData[i]['custva'][j]['id']) - 1]['values'].push({
                                x: inputData[i]['custva'][j]['x'],
                                y: inputData[i]['custva'][j]['y']
                            });
                }                
            }
        }
        return data;

    }

  });

