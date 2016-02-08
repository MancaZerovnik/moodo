'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInGlasbaCtrl
 * @description
 * # RazpolozenjeInGlasbaCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('RazpolozenjeInGlasbaCtrl', function ($scope, $http, $window, $sce, DataAll) {
    
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
    
    $scope.mainInfo = DataAll.getData();
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

    // function is used in wiew
    $scope.isnumber = function(s) {
        var x = +s; // made cast obvious for demonstration
        return x.toString() === s;
    }


    $http.get('../../assets/data/songs.json').success(function(data) {
        $scope.songsData = data;
        $scope.filter.song=(Object.keys(data)[0]).slice(0,3);
        changePlayerSong($scope.filter.song);
        $scope.update();
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
            
        //call function to perepare data to show in the graph
        prepareData();
        setGraphsPropertiesOnEveryRefresh();

        if(!$scope.$$phase) {
            $scope.$apply();
        }
    };

    // call funciton to set properties of the graph
    setGraphsProperties();

    function setGraphsPropertiesOnEveryRefresh()
    {
        /*
        * Function is called everytime data are refreshed 
        * and set new properties for the graphs
        */
        $scope.inducedMoodVAwithColorsGraph = VAmoodGraphs(getValuesAtKey($scope.inducedMoodVAwithColorsData));
        $scope.expresedMoodVAwithColorsGraph = VAmoodGraphs(getValuesAtKey($scope.expresedMoodVAwithColorsData));
    }

    function setGraphsProperties()
    {
        /*
        * Function is called on page load 
        * and set new properties for the graphs
        */
        $scope.viCustvaGraph = VAmoodGraphs(null);
        $scope.ampLineGraph = amplitudeChartGraph();
        $scope.coloGraph = colorGraph();
    } 

    function prepareData()
    {
        /*
        * Function is called everytime data are refreshed 
        * and set new data for the graphs
        */
        $scope.vzbujenaData = musicMoodVAData($scope.filteredData, 'vzbujena_custva');
        $scope.izrazenaData = musicMoodVAData($scope.filteredData, 'izrazena_custva');
        $scope.amplitudeData = [{key: 'gr1', values: enumerateforchart($scope.songsData[$scope.filter.song + '.mp3'].sinusoide)}];
        $scope.colorData = getColorData($scope.filteredData);
        $scope.inducedMoodVAwithColorsData = musicMoodVAandColorData($scope.filteredData, 'vzbujena_custva');
        $scope.expresedMoodVAwithColorsData = musicMoodVAandColorData($scope.filteredData, 'izrazena_custva');

        // data to show musicological estimation data
        $scope.currentSongData = $scope.songsData[$scope.filter.song + '.mp3'];
    } 

    /*
    * Functions used to set graphs properties
    */   

    function VAmoodGraphs(color)
    {
        /*
        * Function set the properties of all VA standard graphs
        */

        return {
            chart: {
                type: 'scatterChart',
                height: 450,
                color: color === null ? d3.scale.category10().range() : color,
                tooltip: {
                    contentGenerator: function(d) { 
                        return '<p>Valence: <strong>' + d.point.x + 
                                '</strong> Arousal: <strong>' + d.point.y + 
                                '</strong><br/><div class="square-box" style="background-color:'+d.point.color+
                                ';"></div><strong>' + d.series[0].key + '</strong></p>';
                    }
                },
                duration: 350,
                xAxis: {axisLabel: 'Valence'},
                yAxis: {axisLabel: 'Arousal'},
                xDomain: [-1, 1],
                yDomain: [-1,1],
                showLegend: true
            }
        };
    }

    function amplitudeChartGraph()
    {
        /*
        * Function set the properties of graph that show the amplitude line
        */

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

    function colorGraph()
    {
        /*
        * Function set the properties of color lines graph
        */

        return {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 200,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                duration: 500,
                yAxis: {
                    axisLabel: 'Number of answers'
                },
                stacked: true,
                showLegend: false,
                showControls: false,
                showXAxis: false,
                tooltip: {
                    contentGenerator: function(d) { 
                        return '<p><div class="square-box" style="background-color:'+d.color+
                                ';"></div><strong>' + d.data.key + '</strong>:  ' + d.data.value + '&nbsp;</p>';
                    }
                },
            }
        };
    }

    /*
    * Functions that prepares data to show in the graphs
    */

    function musicMoodVAData(inputData, data_key)
    {
        /*
        * Function perpare data about perceived or inuced mood 
        * data_key tells what type of data (induced, perceived)
        */

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
       // add number of answers to legend for each mood
        for (var i = 0; i < data.length; i++) {
            data[i].key = data[i].key + " [" + data[i].values.length + "]";
        }
        return data;
    }

    function musicMoodVAandColorData(inputData, data_key)
    {
        /*
        * Function perpare data about perceived or inuced mood grouped by selected color for this song
        * no mood group included 
        * data_key tells what type of data (induced, perceived)
        */

        var data = [];
        if(inputData) {         
            for (var i = 0; i < inputData.length; i++)
            {                
                var color = listToHashRGB(inputData[i]['barva']);
                for (var j = 0; j < inputData[i][data_key].length; j++)
                {
                    if (getDictonaryIdxByKey(data, color) === null
                        && 'x' in inputData[i][data_key][j])
                        data.push({key: color, values:[]});
                    
                        if ('x' in inputData[i][data_key][j])
                            data[getDictonaryIdxByKey(data, color)]['values'].push({
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
        /*
        * Function prepare song color data
        */

        var data = [];
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

    /*
    * Support functions
    */ 

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

    function getValuesAtKey(l)
    {
        var data = [];
        for(var i = 0; i < l.length; i++)
            data.push(l[i].key)

        return data;
    }

    function listToHashRGB(l)
    {
        var r = parseInt(l[0] * 255);
        var g = parseInt(l[1] * 255);
        var b = parseInt(l[2] * 255);
        return rgbToHex(r, g, b);
    }
 });