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
        $scope.colorChartData = getColorData($scope.filteredData);

        // it have to be here because it changes everytime filter changes
        // this function sets graph properties fro users mood
        $scope.usersMoodGraph = setVAgraphWithColors(getValuesAtKey($scope.usersMoodData));


        if(!$scope.$$phase) {
          $scope.$apply();
        }

        
    };

    $scope.currentEmotionsGraph = setVAgraphEmotions();
    $scope.moodVAEstimationGraph = setVAgraphLegend();
    $scope.colorChartGraph = setColorGraph();
    

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
                        return '<p>valence: <strong>' + d.point.x + '</strong> arousal: <strong>' + 
                                d.point.y + '</strong><br/>' +
                                '<div class="square-box" style="background-color:'+d.point.color+';"></div>' +
                                'barva: <strong>' + d.point.color + '</strong></p>';
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
                tooltip: {
                    contentGenerator: function(d) { 
                        return '<p>Valence: <strong>' + d.point.x + '</strong> Arousal: <strong>' + d.point.y + '</strong><br/>' +
                                '<div class="square-box" style="background-color:'+d.point.color+';"></div>' +
                                '<strong>' + d.series[0].key + '</strong></p>';
                    }
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
                type: 'boxPlotChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 40
                },
                color:['darkblue', 'darkorange', 'green', 'darkred', 'darkviolet'],
                x: function(d){return d.label;},
                // y: function(d){return d.values.Q3;},
                maxBoxWidth: 75,
                yDomain: [0, 1],
                xAxis :
                {
                  rotateLabels: 30
                }
            }
        };
    }

    function setColorGraph()
    {
        return {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 450,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                //yErr: function(d){ return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] },
                showControls: true,
                showValues: true,
                duration: 500,
                xAxis: {
                    showMaxMin: false,
                },
                yAxis: {
                    axisLabel: 'Število odgovorov',
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                },
                stacked: true,
                showLegend: false,
                showControls: false, 
                margin:
                {
                    left: 90
                }
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
                    
                        
                        data[getDictonaryIdxByKey(data, k)]['values'].push(
                            inputData[i].custva_trenutno[k]);
                }                
            }
            for(var i = 0; i < data.length; i++)
            {
                var numbers = data[i].values;
                numbers.sort();
                var q1 = isInt(parseFloat(numbers.length) / 4) ? numbers[numbers.length / 4] : (numbers[parseInt(numbers.length / 4)] + numbers[parseInt(numbers.length / 4) +1]) / 2;
                var q2 = isInt(parseFloat(numbers.length) / 2) ? numbers[numbers.length / 2] : (numbers[parseInt(numbers.length / 2)] + numbers[parseInt(numbers.length / 4) +1]) / 2;
                var q3 = isInt(parseFloat(numbers.length) / 4) ? numbers[parseInt(parseFloat(numbers.length) / 4 * 3)] : (numbers[parseInt(parseFloat(numbers.length) / 4 * 3)] + numbers[parseInt(parseFloat(numbers.length) / 4 * 3) +1]) / 2;

                data[i].values = {
                    Q1: q1,
                    Q2: q2,
                    Q3: q3,
                    whisker_low: numbers[0],
                    whisker_high: numbers[numbers.length - 1]
                };

                data[i].label = data[i].key;
            }


        }
        return data;
    }

    function getColorData(inputData)
    {
        var data = []
        if(inputData) {
            var allLabels = []
            for (var i = 0; i < inputData.length; i++)
            {                
                for (var j = 0; j < inputData[i].custva.length; j++)
                {
                    var r = parseInt(inputData[i].custva[j].barva[0] * 255);
                    var g = parseInt(inputData[i].custva[j].barva[1] * 255);
                    var b = parseInt(inputData[i].custva[j].barva[2] * 255);
                    var hex = rgbToHex(r, g, b);
                    var custvo_name = inputData[i].custva[j].ime

                    // add label to all labels list
                    if (allLabels.indexOf(custvo_name)==-1) allLabels.push(custvo_name);

                    if(getDictonaryIdxByField(data, hex, "key") === null)
                        data.push({key: hex, values:[], color: hex});

                    var color_group_idx = getDictonaryIdxByField(data, hex, "key");
                    if(getDictonaryIdxByField(data[color_group_idx].values, custvo_name, "label") === null)
                        data[color_group_idx].values.push({label: custvo_name, value: 1});
                    else
                    {
                        var label_idx = getDictonaryIdxByField(data[color_group_idx].values, custvo_name, "label");
                        data[color_group_idx].values[label_idx].value = data[color_group_idx].values[label_idx].value +1;
                    }
                }
            }
            // add missing labels to the data
            for(var i = 0; i < data.length; i++)
                for(var j = 0; j < allLabels.length; j++)
                    if(getDictonaryIdxByField(data[i].values, allLabels[j], "label") === null)
                        data[i].values.push({label: allLabels[j], value: 0});

            function compare(a,b) {
              if (a.label < b.label)
                return -1;
              if (a.label > b.label)
                return 1;
              return 0;
            }

            for(var i = 0; i < data.length; i++)
                data[i].values.sort(compare);
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

    function getDictonaryIdxByField(dict, value, field)
    {
        for(var i = 0; i < dict.length; i++)
            if(dict[i][field] === value)
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

    function isInt(n) {
       return n % 1 === 0;
    }

  });

