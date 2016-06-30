'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInBarveCtrl
 * @description
 * # RazpolozenjeInBarveCtrl
 * Controller of the modooApp
 */
var app = angular.module('modooApp')
  .controller('RazpolozenjeInBarveCtrl', function ($scope, $http, $window, $q, DataAll, $rootScope, $translate) {

    
    $q.all([
      DataAll
    ]).then(function(data){
      $scope.mainInfo = data[0];
      init();
    });

    translations();
    $rootScope.$on('$translateChangeSuccess', function () {
        translations();
        init();
    });

    $scope.update = function () {

        $scope.filteredData = _.filter($scope.mainInfo, function(num){ 
            // if(!(($scope.filter.male && num.spol == "M" ||
            // $scope.filter.female && num.spol == "Z")
            // && (($scope.filter.schoolmin <= parseInt(num.glasbena_sola) && 
            //     $scope.filter.schoolmax >= parseInt(num.glasbena_sola)))))
            //     console.log(num);
            
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
        
        // prepare data for the graph and set graph properties
        preparedata();
        setGraphsProperties();
           


        if(!$scope.$$phase) {
          $scope.$apply();
        }      
    };
    

    /*
    * main functions
    */
    function init()
    {
        $scope.filterLimits = {
            "agemin": _.min(_.pluck($scope.mainInfo, 'starost')), 
            "agemax": _.max(_.pluck($scope.mainInfo, 'starost')),
            "schoolmin": _.min(_.pluck($scope.mainInfo, 'glasbena_sola')),
            "schoolmax": _.max(_.pluck($scope.mainInfo, 'glasbena_sola')),
            "activeinmusicmin": _.min(_.pluck($scope.mainInfo, 'igranje_instrumenta')),
            "activeinmusicmax": _.max(_.pluck($scope.mainInfo, 'igranje_instrumenta')),
        };

        $scope.filter = {
            "male": true, 
            "female": true,
            "agemin": $scope.filterLimits.agemin, 
            "agemax": $scope.filterLimits.agemax,
            "city": true,
            "domestic": false,
            "schoolmin": $scope.filterLimits.schoolmin,
            "schoolmax": $scope.filterLimits.schoolmax,
            "activeinmusicmin": $scope.filterLimits.activeinmusicmin,
            "activeinmusicmax": $scope.filterLimits.activeinmusicmax,
            "onehour": true,
            "twohour": false,
            "threehour": false,
            "fourhour": false
        };
        $scope.update();
    }

    function translations()
    {
        /*
        * this function take translations for its language everytime it is called
        */
        $scope.steviloOdgovorov = $translate.instant('STODGOVOROV');
        $scope.valenceTranslation = $translate.instant('VALENCA');
        $scope.arousalTranslation = $translate.instant('AROUSAL');
    }

    function setGraphsProperties()
    {
        /*
        * Function set the property for every graph used in the view
        */
        $scope.currentEmotionsGraph = usersCurrentMoodBoxGraph();
        $scope.moodVAEstimationGraph = moodVAestimationGraph();
        $scope.colorChartGraph = MoodByColorGraph();
        $scope.usersMoodGraph = VAmoodWithColorsGraph(getValuesAtKey($scope.usersMoodData));
    }

    function preparedata()
    {
        /*
        * Function prepare data to be showed in the view
        */
        $scope.usersMoodData = usersMoodData($scope.filteredData);
        $scope.moodVAEstimationData = moodVAEstimationData($scope.filteredData);
        $scope.currentEmotionsData = getCurrentEmotionsData($scope.filteredData);
        $scope.colorChartData = getColorData($scope.filteredData);
        console.log("ja");
    }

    /*
    * Functions that set the properties of the graphs
    */

    function VAmoodWithColorsGraph(colors)
    {
        /*
        * Properties for the graph that shows users current mood and current mood in color
        */

        return {
            chart: {
                type: 'scatterChart',
                height: 450,
                tooltip: {
                    contentGenerator: function(d) { 
                        return '<p>valence: <strong>' + d.point.x + 
                                '</strong> arousal: <strong>' + d.point.y +
                                '</strong><br/><div class="square-box" style="background-color:'+d.point.color+
                                ';"></div>barva: <strong>' + d.point.color + '</strong></p>';
                    }
                },
                duration: 350,
                xAxis: {
                    axisLabel: $scope.valenceTranslation
                },
                yAxis: {
                    axisLabel: $scope.arousalTranslation
                },
                xDomain: [-1, 1],
                yDomain: [-1,1],
                color: colors,
                showLegend: false,
                useInteractiveGuideline: true
            }
        };
    }

    function moodVAestimationGraph()
    {
        /*
        * Properties for the graph that shows users estimation for 14 moods in VA space
        */

        return {
            chart: {
                type: 'scatterChart',
                height: 450,
                tooltip: {
                    contentGenerator: function(d) { 
                        return '<p>Valence: <strong>' + d.point.x + 
                                '</strong> Arousal: <strong>' + d.point.y + 
                                '</strong><br/><div class="square-box" style="background-color:'+d.point.color+
                                ';"></div><strong>' + d.series[0].key + '</strong></p>';
                    }
                },
                duration: 350,
                xAxis: {
                    axisLabel: $scope.valenceTranslation,
                },
                yAxis: {
                    axisLabel: $scope.arousalTranslation,
                },
                xDomain: [-1, 1],
                yDomain: [-1,1],
                showLegend: true
            }
        };
    }

    function usersCurrentMoodBoxGraph()
    {
        /*
        * Properties for the graph that shows users current mood and current mood in color
        */

        return {
            chart: {
                type: 'boxPlotChart',
                height: 450,
                color: positiveNegativeColorSpecter(5, 7, 5),
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

    function MoodByColorGraph()
    {
        /*
        * Properties for the graph that shows user color estimations for moods
        */

        return {
            chart: {
                type: 'multiBarHorizontalChart',
                stacked: true,
                height: 450,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: true,
                duration: 350,
                yAxis: {
                    axisLabel: $scope.steviloOdgovorov
                },
                showLegend: false,
                showControls: false, 
                margin: {left: 90}
            }
        };
    }

    function positiveNegativeColorSpecter(positive, middle, negative)
    {
        /*
        * function returns the colors for boxplot graph 
        * with some positive green color, some negative and some in the middle
        */
        var colors = [];
        var n = positive + middle + negative;
        for(var i = 0; i < n; i++)
        {
            var color;
            if (i < positive)
                color = rgbToHex(0, 255 - parseInt(i * 255 / n) , 0);
            else if (i < middle + positive)
                color = rgbToHex(128 + parseInt(i * 128 / n), 128 + parseInt(i * 128 / n) , 0);
            else 
                color = rgbToHex(parseInt(i * 255 / n), 0 , 0);
            colors.push(color);
        }
        return colors;    
    }

    /*
    * Function for peparing data to show in the graphs
    */

        
    function usersMoodData(inputData) {
        /*
        * Function that prepare data with user current mood in VA space
        */

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

    function moodVAEstimationData(inputData)
    {
        /*
        * Function that prepare data with estimations of moods
        */

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
        for(var i = 0; i < data.length; i++) {
                data[i].key = $translate.instant(data[i].key);
        }
        return data;
    }

    function getCurrentEmotionsData(inputData)
    {
        /*
        * Function that prepare data about current mood in mood labels
        */

        var data = [];
        if(inputData) { 
            // to define the order
            var order = ['srecno', 'zadovoljno', 'veselo', 'vedro', 'aktivno', 'budno', 'sprosceno', 'mirno', 'dremavo', 
                            'zaspano', 'utrujeno', 'neaktivno', 'nezadovoljno', 'razocarano', 'zalostno', 'nesrecno', 'jezno']
            for (var i = 0; i<order.length; i++) data.push({key: order[i], values:[]});

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

                data[i].label = $translate.instant(data[i].key);
            }
        }
        return data;
    }

    function getColorData(inputData)
    {
        /*
        * Function that prepare data about mood in colors
        */

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
                    if(hex.length > 6)
                    {                    
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

            for(var i = 0; i < data.length; i++) {
                data[i].values.sort(compare);
                for(var j = 0; j < data[i].values.length; j++) {
                    data[i].values[j].label = $translate.instant(data[i].values[j].label);
                }
            }
        }
          
        return _.sortBy(data, function(d){
            var rgb = hexToRgb(d.key);
            var hsv = rgb2hsv(rgb.r, rgb.g, rgb. b)
            return 100*hsv.h + 10*hsv.s + hsv.v;
        });

    }

    /*
    * Other support functions
    */

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

        function rgb2hsv () {
        var rr, gg, bb,
            r = arguments[0] / 255,
            g = arguments[1] / 255,
            b = arguments[2] / 255,
            h, s,
            v = Math.max(r, g, b),
            diff = v - Math.min(r, g, b),
            diffc = function(c){
                return (v - c) / 6 / diff + 1 / 2;
            };

        if (diff == 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(r);
            gg = diffc(g);
            bb = diffc(b);

            if (r === v) {
                h = bb - gg;
            }else if (g === v) {
                h = (1 / 3) + rr - bb;
            }else if (b === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            }else if (h > 1) {
                h -= 1;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }

    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

});

