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
        $scope.usersMoodData = getUsersMood($scope.filteredData);
        $scope.moodVAEstimationData = getMoodVAEstimationData($scope.filteredData);
        $scope.currentEmotionsData = getCurrentEmotionsData($scope.filteredData);

        // it have to be here because it changes everytime filter changes
        // this function sets graph properties fro users mood
        $scope.usersMoodGraph = setVAgraphWithColors(getValuesAtKey($scope.usersMoodData));


        if(!$scope.$$phase) {
          $scope.$apply();
        }

        
    };

    $scope.currentEmotionsGraph = setVAgraphEmotions();
    $scope.moodVAEstimationGraph = setVAgraphLegend();
    

    function setVAgraphWithColors(colors)
    {
        return {
            chart: {
                type: 'scatterChart',
                height: 450,
                color: d3.scale.category10().range(),
                scatter: {
                    onlyCircles: false
                },
                tooltip: {
                    contentGenerator: function(d) { 
                        console.log(JSON.stringify(d));
                        return '<p>valence: ' + d.point.x + ' arousal: ' + d.point.y + '<br/>' +
                                '<div class="square-box" style="background-color:'+d.point.color+';"></div>' +
                                'barva: ' + d.point.color + '</p>';
                    }
                },
                // tooltip.contentGenerator(function (obj) { return 'a'}),
                duration: 350,
                xAxis: {
                    axisLabel: 'Valence',
                    tickFormat: function(d) {
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
                color: colors,
                showLegend: false,
                useInteractiveGuideline: false
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

    function setVAgraphEmotions()
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
                xDomain: [0, 1],
                showYAxis: false,
                showLegend: true
            }
        };
    }
        
    function getUsersMood(inputData) {
        var data = [];
                   
        if(inputData) {
            for (var j = 0; j < inputData.length; j++) {
                // users mood color
                var r = parseInt(inputData[j].razpolozenje_barva[0] * 255);
                var g = parseInt(inputData[j].razpolozenje_barva[1] * 255);
                var b = parseInt(inputData[j].razpolozenje_barva[2] * 255);
                var hex = rgbToHex(r, g, b);

                if (getDictonaryIdxByKey(data, hex) === null)
                        data.push({key: hex, values:[]});

                data[getDictonaryIdxByKey(data, hex)].values.push({
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
                    if (getDictonaryIdxByKey(data, inputData[i]['custva'][j]['ime']) === null
                        && 'x' in inputData[i]['custva'][j])
                        data.push({key: inputData[i]['custva'][j]['ime'], values:[]});
                    
                        if ('x' in inputData[i]['custva'][j])
                            data[getDictonaryIdxByKey(data, inputData[i]['custva'][j]['ime'])]['values'].push({
                                x: inputData[i]['custva'][j]['x'],
                                y: inputData[i]['custva'][j]['y']
                            });
                }                
            }
        }
        return data;
    }

    function getCurrentEmotionsData(inputData)
    {
        var data = [];
        if(inputData) {          
            for (var i = 0; i < inputData.length; i++)
            {                
                for (var k in inputData[i].custva_trenutno)
                {
                    if (getDictonaryIdxByKey(data, k) === null)
                        data.push({key: k, values:[]});
                    
                        
                        data[getDictonaryIdxByKey(data, k)]['values'].push({
                            x: inputData[i].custva_trenutno[k],
                            y: getDictonaryIdxByKey(data, k)
                            });
                }                
            }
        }
        return data;
    }

    function getDictonaryIdxByKey(l, kvalue)
    {
        for(var i = 0; i < l.length; i++)
            if(l[i].key === kvalue)
                return i;

        return null;
    }

    function getValuesAtKey(l)
    {
        var data = [];
        for(var i = 0; i < l.length; i++)
            data.push(l[i].key)

        return data;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

  });

