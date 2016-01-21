'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInGlasbaCtrl
 * @description
 * # RazpolozenjeInGlasbaCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('RazpolozenjeInGlasbaCtrl', function ($scope, $http, $window, $sce) {
    $scope.mainInfo = null;
    $scope.filter = {
        "male": true, 
        "female": true,
        "agemin": 5,
        "agemax": 100,
        "city": true,
        "domestic": true,
        "schoolmin": 0,
        "schoolmax": 20,
        "activeinmusicmin": 0,
        "activeinmusicmax": 20,
        "onehour": true,
        "twohour": true,
        "threehour": true,
        "fourhour": true,
        "song": 0
    };

    function changePlayerSong(id){
        $("audio").attr("src","../../assets/media/" + id + ".mp3");
    }
    
    $http.get('../../assets/data/data.json').success(function(data) {
        $scope.mainInfo = data;
        $scope.songs = _.uniq(_.sortBy(_.flatten(
                            _.map($scope.mainInfo, function(num){ 
                                return _.map(num.pesmi, function(x) {
                                                            return x.pesem_id;
                                                        }
                                        );
                                }
                            )
                       ), function(x) { return x; }), true);
        $scope.filter.song = $scope.songs[0];
        changePlayerSong($scope.filter.song);
        $scope.update();          
    });

    $http.get('../../assets/data/songs.json').success(function(data) {
        $scope.songAmplitudes = data;

    });

    
    $scope.update = function () {
        changePlayerSong($scope.filter.song);
        $scope.filteredData = _.filter(_.flatten(_.map(_.filter($scope.mainInfo, function(num){ 
            
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
            );}), function(x) {return x.pesmi; })), function(x) { return x.pesem_id === $scope.filter.song; });
            
       

        $scope.vzbujenaData = getMoodVAEstimationData($scope.filteredData, 'vzbujena_custva');
        $scope.izrazenaData = getMoodVAEstimationData($scope.filteredData, 'izrazena_custva');
        var ampdata = [];
        ampdata .push({
            key: 'gr1',
            values: enumerateforchart($scope.songAmplitudes[$scope.filter.song + '.mp3'])
        });
        $scope.amplitudeData = ampdata
        $scope.colorData = getColorData($scope.filteredData);

         if(!$scope.$$phase) {
          $scope.$apply();
        }
    };



    $scope.viCustvaGraph = setVAgraphLegend();
    $scope.ampLineGraph = lineAmpChartGraph();
    $scope.coloGraph = setColorGraph();

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

    function lineAmpChartGraph()
    {
          return {
            chart: {
                type: 'lineChart',
                height: 150,
                showYAxis: false,
                showXAxis: false,
                showLegend: false,
                lines: {interactive: false }
            }
        };
    }

    function setColorGraph()
    {
        return {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 200,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                //yErr: function(d){ return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] },
                showControls: true,
                showValues: true,
                duration: 500,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Values',
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                },
                stacked: true,
                showLegend: false,
                showControls: false,
                showXAxis: false
            }
        };
    }

    function getMoodVAEstimationData(inputData, data_key)
    {
        var data = [];
        if(inputData) {          
            for (var i = 0; i < inputData.length; i++)
            {                
                for (var j = 0; j < inputData[i][data_key].length; j++)
                {
                    if (getDictonaryIdxByKey(data, inputData[i][data_key][j]['ime']) === null
                        && 'x' in inputData[i][data_key][j])
                        data.push({key: inputData[i][data_key][j]['ime'], values:[]});
                    
                        if ('x' in inputData[i][data_key][j])
                            data[getDictonaryIdxByKey(data, inputData[i][data_key][j]['ime'])]['values'].push({
                                x: inputData[i][data_key][j]['x'],
                                y: inputData[i][data_key][j]['y']
                            });
                }                
            }
        }
        return data;
    }

    function getColorData(inputData)
    {
        var data = []
        if(inputData) {
            for (var i = 0; i < inputData.length; i++)
            {                
                var r = parseInt(inputData[i].barva[0] * 255);
                var g = parseInt(inputData[i].barva[1] * 255);
                var b = parseInt(inputData[i].barva[2] * 255);
                var hex = rgbToHex(r, g, b);

                if(getDictonaryIdxByField(data, hex, "key") === null)
                    data.push({key: hex, values:[{label: "gr1", value: 0}], color: hex});

                var group_idx = getDictonaryIdxByField(data, hex, "key");
                data[group_idx].values[0].value = data[group_idx].values[0].value +1;
            }
        }
        return data;
    }

    function getDictonaryIdxByField(dict, value, field)
    {
        for(var i = 0; i < dict.length; i++)
            if(dict[i][field] === value)
                return i;
        return null;
    }

    function enumerateforchart(data)
    {
        var pair_list = [];
        for(var i = 0; i < data.length; i++)
        {
            pair_list.push({x: i, y: data[i]});
        }
        return pair_list;
    }

    function getDictonaryIdxByKey(l, kvalue)
    {
        for(var i = 0; i < l.length; i++)
            if(l[i].key === kvalue)
                return i;

        return null;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
 });