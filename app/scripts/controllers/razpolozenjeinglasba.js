'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:RazpolozenjeInGlasbaCtrl
 * @description
 * # RazpolozenjeInGlasbaCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('RazpolozenjeInGlasbaCtrl', function ($scope, $http, $window, $sce, $q, DataAll, SongsAll, $rootScope, $translate) {
    
    /*
    * load data
    */
    $q.all([
      DataAll,
      SongsAll
    ]).then(function(data){
      $scope.mainInfo = data[0];
      $scope.songsData = data[1];
      init();
    });
    // $scope.mainInfo = DataAll.getData();
    // $scope.songsData = SongsAll.getData();
    translations()
    $rootScope.$on('$translateChangeSuccess', function () {
        translations()
        setGraphsProperties();
        init();
    });
    
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
        $scope.songPath = "../../assets/media/" + $scope.playersong.song;
        // $("audio").attr("src","../../assets/media/" + $scope.playersong.song); 
        //         console.log($scope.playersong.song);      
    };
    // function to change the properties shown in the view depending on the song selection
    $scope.changeproperties = function (){
        $scope.currentSongData = $scope.songsData[$scope.playersong.properties];
    };
    // function to change the sunosoide depending on the song selections 
    $scope.changevisualisation= function (){
        if($scope.playersong.visualisation == null)
            $scope.amplitudeData = [{key: 'gr1', values: []}];
        else 
            $scope.amplitudeData = enumerateforchart($scope.songsData[$scope.playersong.visualisation].sinusoide);
    };    
    $scope.update = function () {
        /*
        * this function is called everytime the data on the site have to be updated
        */

        // filter songs for which data have to be snown
        if($scope.song_tab === 2) // only when selection by song properties
            $scope.selected_songs = filterSongs().sort();
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
        
        // this are limits to the filters 
        $scope.filterLimits = {
            "agemin": _.min(_.pluck($scope.mainInfo, 'starost')), 
            "agemax": _.max(_.pluck($scope.mainInfo, 'starost')),
            "schoolmin": _.min(_.pluck($scope.mainInfo, 'glasbena_sola')),
            "schoolmax": _.max(_.pluck($scope.mainInfo, 'glasbena_sola')),
            "activeinmusicmin": _.min(_.pluck($scope.mainInfo, 'igranje_instrumenta')),
            "activeinmusicmax": _.max(_.pluck($scope.mainInfo, 'igranje_instrumenta')),
        };

        // main questionary data
        $scope.filter = {
            "male": true, 
            "female": true,
            "agemin": $scope.filterLimits.agemin,
            "agemax": $scope.filterLimits.agemax,
            "city": true,
            "domestic": true,
            "schoolmin": $scope.filterLimits.schoolmin,
            "schoolmax": $scope.filterLimits.schoolmax,
            "activeinmusicmin": $scope.filterLimits.activeinmusicmin,
            "activeinmusicmax": $scope.filterLimits.activeinmusicmax,
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
        $scope.genres = ['Classical', 'Opera', 'Country', 'Folk', 'Latin', 'Dance/Disco', 'Electronic',
                       'R&B/Soul', 'Hip Hop/Rap', 'Reggae', 'Pop', 'Rock', 'Alternative', 'Metal',
                       'Blues', 'Jazz', 'Vocal', 'Easy Listening', 'New Age','Punk'];
        $scope.metrums = ['2/4', '3/4', '4/4', '5/4', '7/4', '6/8', '9/8', '10/8', '12/8'];
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
        

        $scope.songs = _.uniq(_.sortBy(_.flatten(
                            _.map($scope.mainInfo, function(num){ 
                                return _.map(num.pesmi, function(x) {
                                                            return x.pesem_id;
                                                        }
                                        );
                                }
                            )
                       ), function(x) { return x; }), true);
        
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
        $scope.expresedMoodVAwithColorsGraph = VAmoodGraphs(getValuesAtKey($scope.expresedMoodVAwithColorsData, 'key'));
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
        return _.reduce(selected_values, function(memo, val)
            { return memo || value[filter].toLowerCase().indexOf(val.toLowerCase()) > -1; }, false);
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
                xAxis: {axisLabel: $scope.valenceTranslation},
                yAxis: {axisLabel: $scope.arousalTranslation},
                xDomain: [-1, 1],
                yDomain: [-1,1],
                showLegend: true,
                legend: {
                    key: function(d) {return color === null ? d.key : "";}
                }
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
                stacked: true,
                showLegend: false,
                showControls: false,
                showXAxis: false,
                showYAxis: false,
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
                    if (getDictonaryIdxByKey(data, inputData[i][data_key][j]['ime'], 'key') === null
                        && 'x' in inputData[i][data_key][j])
                        data.push({key: inputData[i][data_key][j]['ime'], values:[]});
                    
                        if ('x' in inputData[i][data_key][j])
                            data[getDictonaryIdxByKey(data, inputData[i][data_key][j]['ime'], 'key')]['values'].push({
                                x: inputData[i][data_key][j]['x'],
                                y: inputData[i][data_key][j]['y']
                            });
                }                
            }
        }
       // add number of answers to legend for each mood
        for (var i = 0; i < data.length; i++) {
            data[i].key = $translate.instant(data[i].key) + " [" + data[i].values.length + "]";
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
                    if (getDictonaryIdxByKey(data, color, 'key') === null
                        && 'x' in inputData[i][data_key][j])
                        data.push({key: color, values:[]});
                    
                        if ('x' in inputData[i][data_key][j])
                            data[getDictonaryIdxByKey(data, color, 'key')]['values'].push({
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
        return _.sortBy(data, function(d){
            var rgb = hexToRgb(d.key);
            var hsv = rgb2hsv(rgb.r, rgb.g, rgb. b)
            return 100*hsv.h + 10*hsv.s + hsv.v;
        });
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
            pair_list.push({key: i,
                            values: [{x: i, 
                                      y: data[i][0]},
                                      {x: i, 
                                      y: data[i][1]}],
                            color: "#5f97ee"});
        }
        return pair_list;
    }

    function getDictonaryIdxByKey(l, kvalue, key)
    {
        for(var i = 0; i < l.length; i++)
            if(l[i][key] === kvalue)
                return i;

        return null;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function getValuesAtKey(l, k)
    {
        var data = [];
        for(var i = 0; i < l.length; i++)
            data.push(l[i][k])

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