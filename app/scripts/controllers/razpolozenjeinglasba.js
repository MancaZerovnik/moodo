'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInGlasbaCtrl
 * @description
 * # RazpolozenjeInGlasbaCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('RazpolozenjeInGlasbaCtrl', function ($scope, $http, $window, $sce, $q, DataAll, SongsAll) {
    
    /*
    * load data
    */
    $q.all([
      DataAll,
      SongsAll
    ]).then(function(data){
      $scope.mainInfo = data[0];
      $scope.songsData = data[1];
      console.log($scope.mainInfo)
      init();
    });
    // $scope.mainInfo = DataAll.getData();
    // $scope.songsData = SongsAll.getData();


    

    /* 
    * scope functions
    */

    // function for checking for numbers
    $scope.isnumber = function(s) {
        var x = +s; // made cast obvious for demonstration
        return x.toString() === s;
    }
    // function to change the player song depending on song selection
    $scope.changeplayersong = function (){
        $("audio").attr("src","../../assets/media/" + $scope.playersong.song);       
    };
    // function to change the properties shown in the view depending on the song selection
    $scope.changeproperties = function (){
        $scope.currentSongData = $scope.songsData[$scope.playersong.properties];
    };
    // function to change the sunosoide depending on the song selections 
    $scope.changevisualisation= function (){
        $scope.amplitudeData = [{key: 'gr1', values: enumerateforchart($scope.songsData[$scope.playersong.visualisation].sinusoide)}];
    };    
    $scope.update = function () {
        /*
        * this function is called everytime the data on the site have to be updated
        */

        // filter songs for which data have to be snown
        if($scope.song_tab === 2) // only when selection by song properties
            $scope.selected_songs = filterSongs();
        else // when we peek only one song
            $scope.selected_songs = [$scope.filter.song + '.mp3'];

        // init song in player on fist song of the list
        $scope.playersong.song = $scope.selected_songs[0];
        $scope.changeplayersong();
        // init properties for the first song in the list
        $scope.playersong.properties = $scope.selected_songs[0];
        $scope.changeproperties();
        // init sinusoide for the first song in the list
        $scope.playersong.visualisation = $scope.selected_songs[0];
        $scope.changevisualisation();

        $scope.filteredData = filterAllData();
            
        //call function to perepare data to show in the graph
        prepareData();
        setGraphsPropertiesOnEveryRefresh();

        if(!$scope.$$phase) {
            $scope.$apply();
        }
    };

    /*
    * main functions call
    */

    
    // call funciton to set properties of the graph
    setGraphsProperties();

    /*
    * main functions
    */

    function init()
    {
        /*
        * this funtion is made to init all values 
        * function is called after data are loaded to the page
        */

        /*
    * scope variables initialization
    */

        // tab for song selection (1 - song id, 2 - properties)
        $scope.song_tab = 1;
        // filters for one song seletion in views where cant be shown all songs
        $scope.playersong = {
            song: '101.mp3', // it is just fist song but data apply to selection before view loaded
            properties: '101.mp3',
            visualisation: '101.mp3'
        };
        // main questionary data
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
            "song": 0,
            "moodValenceMin": -100,
            "moodValenceMax": 100,
            "moodArousalMin": -100, 
            "moodArousalMax": 100
        };
        // mood filter activated by users (true - filter is active)
        $scope.moodLabelsFilters = {
            'srecno': false,
            'zadovoljno': false,
            'veselo': false,
            'vedro': false, 
            'aktivno': false,
            'budno': false,
            'sprosceno': false,
            'mirno': false,
            'dremavo': false,
            'zaspano': false,
            'utrujeno': false,
            'neaktivno': false,
            'nezadovoljno': false,
            'razocarano': false,
            'zalostno': false,
            'nesrecno': false,
            'jezno': false
        };
        // add keys to the filter
        addCurrentMoodsToFilter()
        // filters activnes for songs selection 
        $scope.songsFilterActivnes = {
            zanr: false,
            ritem: false, 
            tempo: false, 
            melodicnost: false, 
            dinamika: false, 
            BPM: false,
            mode: false,
            harmonicna_kompleksnost: false, 
            konzonantnost: false, 
            metrum: false
        };
        // data used to init the ranges of filters
        $scope.genres = getUniqueValuesListForAllSongs($scope.songsData, 'zanr');
        $scope.metrums = getUniqueValuesListForAllSongs($scope.songsData, 'metrum');
        var minMax = bpmMinMax($scope.songsData);
        $scope.BPMmin = minMax[0];
        $scope.BPMmax = minMax[1];
        // filters used to filter songs
        $scope.songsFilters = {
            zanr: {},
            ritem: {min: 1, max: 7}, 
            tempo: {min: 1, max: 7}, 
            melodicnost: {min: 1, max: 7}, 
            dinamika: {min: 1, max: 7}, 
            BPM: {min: $scope.BPMmin, max: $scope.BPMmax},
            mode: {min: 1, max: 7},
            harmonicna_kompleksnost: {min: 1, max: 7}, 
            konzonantnost: {min: 1, max: 7}, 
            metrum: {}
        };  
        
        console.log($scope.songsData);
        console.log($scope.mainInfo);
        $scope.songs = _.uniq(_.sortBy(_.flatten(
                            _.map($scope.mainInfo, function(num){ 
                                return _.map(num.pesmi, function(x) {
                                                            return x.pesem_id;
                                                        }
                                        );
                                }
                            )
                       ), function(x) { return x; }), true);
        console.log($scope.songs);
        
        $scope.filter.song = $scope.songs[0]; // i think that do not have sense because overided with next one
        $scope.filter.song=(Object.keys($scope.songsData)[0]).slice(0,3);

        $scope.update();
    }

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
        $scope.colorData = getColorData($scope.filteredData);
        $scope.inducedMoodVAwithColorsData = musicMoodVAandColorData($scope.filteredData, 'vzbujena_custva');
        $scope.expresedMoodVAwithColorsData = musicMoodVAandColorData($scope.filteredData, 'izrazena_custva');

        // data to show musicological estimation data
        
    } 

    /*
    * variables init functions 
    */

    function addCurrentMoodsToFilter()
    {
        /*
        * fuction adds filter properties for current mood filter in filter
        */ 
        for (var key in $scope.moodLabelsFilters)
        {
            $scope.filter[key] = {};
            $scope.filter[key]['min'] = 0;
            $scope.filter[key]['max'] = 100;
        }
    } 

    /*
    * function used to filter the data
    */
    function filterSongs()
    {
        /* 
        * function select songs for which data have to be show and 
        * returns the list of the songs
        */
        return _.keys(_.pick($scope.songsData, function(value, key, object) {
                                var select = true;
                                for(var filterkey in $scope.songsFilterActivnes) // iterate throught all filters
                                    if($scope.songsFilterActivnes[filterkey]) // if filter active
                                    {
                                        // for zanr and metrum
                                        if(_.contains(['zanr', 'metrum'], filterkey))
                                            select = select && filterZanrMetrum(filterkey, value);
                                        else // other filters
                                            select = select && otherSongsFilters(filterkey, value);
                                    }
                                return select;
                            }));
    }  

    function filterZanrMetrum(filter, value)
    {
        /*
        * function make partly filtering for one song de pending on properties
        * zanr or metrum
        */
        // get all selected fields, those which have value true
        var selected_values = _.keys(_.pick($scope.songsFilters[filter], 
                                                function(value, filter, object){return value}));
        return _.contains(selected_values, value[filter]);
    }  

    function otherSongsFilters(filter, value)
    {
        /*
        * function make partly filtering for one song de pending on properties
        * all other filters
        */
        if (isNumeric(value[filter]))
            return $scope.songsFilters[filter].min <= parseFloat(value[filter])
                        && $scope.songsFilters[filter].max >= parseFloat(value[filter]);
        else
            return false;
    }

    function filterAllData()
    {
    /*
    * functon makes filtering of all data depending on song selection and users filters
    */

        return _.filter(_.flatten(_.map(_.filter($scope.mainInfo, function(num){ 
            
            var condition = true;

            if ("custva_trenutno" in num) // some record do not have that key
                for (var key in $scope.moodLabelsFilters)
                {
                    condition = condition && 
                                (!$scope.moodLabelsFilters[key] ||  // or field doesnt appear on the page
                                $scope.filter[key].min / 100.0 <= num.custva_trenutno[key] && // if field appeared check range
                                $scope.filter[key].max / 100.0 >= num.custva_trenutno[key]); 
                } 

            return condition && (($scope.filter.male && num.spol == "M" ||
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
            && (($scope.filter.moodValenceMin / 100.0 <= parseFloat(num.razpolozenje_trenutno.x) && 
                $scope.filter.moodValenceMax / 100.0 >= parseFloat(num.razpolozenje_trenutno.x)))
            && (($scope.filter.moodArousalMin / 100.0 <= parseFloat(num.razpolozenje_trenutno.y) && 
                $scope.filter.moodArousalMax / 100.0 >= parseFloat(num.razpolozenje_trenutno.y)))  
            );}), function(x) {return x.pesmi; })), 
                    function(x) 
                        { return _.contains($scope.selected_songs, x.pesem_id +'.mp3'); });
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

    function bpmMinMax(dict)
    {
        /* 
        * function finds max and min value for the property BPM
        */

        var max = 0;
        var min = 1000;

        var values = getUniqueValuesListForAllSongs(dict, 'BPM');

        for (var i = 0; i < values.length; i++)
            if (isNumeric(values[i]))
            {

                var number = parseInt(values[i]);
                if (number < min)
                    min = number;
                if (number > max)
                    max = number;
            }
        return [min, max];
    }

    function getUniqueValuesListForAllSongs(dict, key)
    {
        /*
        * Function goes throught all songs and returns unique array of 
        * all values under one key
        */
        var data = [];
        for (var song in dict)
            if (data.indexOf(dict[song][key]) == -1)
                data.push(dict[song][key]);
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

    function isNumeric(num){
        return !isNaN(num)
    }
 });