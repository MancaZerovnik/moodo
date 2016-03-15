'use strict';

/**
 * @ngdoc function
 * @name modooApp.controller:SplosnoCtrl
 * @description
 * # SplosnoCtrl
 * Controller of the modooApp
 */
angular.module('modooApp')
  .controller('SplosnoCtrl', function ($scope, $http, $q, DataAll, $rootScope, $translate) {

        $q.all([
            DataAll
        ]).then(function(data){
            $scope.mainInfo = data[0];
            init();
        });
        
        $scope.zenske = $translate.instant('Z');
        $scope.moski = $translate.instant('M');
        $scope.doo = $translate.instant('DO');
        $scope.starost = $translate.instant('STAROSTVL');
        $scope.stljudi = $translate.instant('STELJUDI');
        $scope.mesto = $translate.instant('MESTO');
        $scope.podezelje = $translate.instant('PODEZELJE');
        $scope.stljudizvrst = $translate.instant('STLJUDIZVRST');
        $rootScope.$on('$translateChangeSuccess', function () {
            $scope.zenske = $translate.instant('Z');
            $scope.moski = $translate.instant('M');
            $scope.doo = $translate.instant('DO');
            $scope.starost = $translate.instant('STAROSTVL');
            $scope.stljudi = $translate.instant('STELJUDI');
            $scope.mesto = $translate.instant('MESTO');
            $scope.podezelje = $translate.instant('PODEZELJE');
            $scope.stljudizvrst = $translate.instant('STLJUDIZVRST');
            init();
        });

        function init()
        {
            var genderNUM = _.countBy($scope.mainInfo, function(x) {
                return x.spol == 'M' ? 'm': 'z';
            });  
            var livingNUM = _.countBy($scope.mainInfo, function(x) {
                return x.kraj_bivanja == 'v mestu' ? 'mesto': 'podezelje';
            });  
            var ageNUM = _.countBy($scope.mainInfo, function(x) {
                return String(x.starost).charAt(0);
            });  
            var genreNUM = _.countBy(_.flatten(_.map($scope.mainInfo, function(x) {
                return x.zvrst;
            })), function(x) { return x; });

            update(genderNUM, livingNUM, ageNUM, genreNUM);
        }
        var insertLinebreaks = function (d) {
            var el = d3.select(this);
            var words = d.split(' ');
            el.text('');

            for (var i = 0; i < words.length; i++) {
                var tspan = el.append('tspan').text(words[i]);
                if (i > 0)
                    tspan.attr('x', 0).attr('dy', '15');
            }
        };
        function update(genderNUM, livingNUM, ageNUM, genreNUM){
            $scope.optionsGender = {
                chart: {
                    type: 'pieChart',
                    height: 540,
                    x: function(d){return d.key + " " + d.percent + "%";},
                    y: function(d){return d.y;},
                    labelSunbeamLayout: true,
                    //labelType: "percent",
                    showLegend: false,
                    valueFormat: (d3.format(',.0f'))
                }
            };
            $scope.dataGender = [
                {
                    key: $scope.zenske,
                    y: genderNUM.z,
                    percent: ((100/(genderNUM.z + genderNUM.m))*genderNUM.z).toFixed(0)
                },
                {
                    key: $scope.moski,
                    y: genderNUM.m,
                    percent: ((100/(genderNUM.z + genderNUM.m))*genderNUM.m).toFixed(0)
                }
            ];

            $scope.optionsPlace = {
                chart: {
                    type: 'pieChart',
                    height: 540,
                    x: function(d){return d.key + " " + d.percent + "%";},
                    y: function(d){return d.y;},
                    labelSunbeamLayout: true,
                    wrapLabels: true,
                    showLegend: false,
                    valueFormat: (d3.format(',.0f'))                               
               }
            };
            $scope.dataPlace = [
                {
                    key: $scope.podezelje,
                    y: livingNUM.podezelje,
                    percent: ((100/(livingNUM.mesto + livingNUM.podezelje))*livingNUM.podezelje).toFixed(0)
                },
                {
                    key: $scope.mesto,
                    y: livingNUM.mesto,
                    percent: ((100/(livingNUM.mesto + livingNUM.podezelje))*livingNUM.mesto).toFixed(0)
                }
            ];


            $scope.optionsAge = {
                chart: {
                    type: 'discreteBarChart',
                    height: 450,

                    x: function(d){return d.key;},
                    y: function(d){return d.y;},
                    showValues: true,
                    valueFormat: (d3.format(',.0f')),
                    duration: 500,
                    xAxis: {
                        axisLabel: $scope.starost
                    },
                    yAxis: {
                        axisLabel: $scope.stljudi,
                        tickFormat: d3.format(',.0f')
                    },
                    margin:
                    {
                        left: 80 // because roof of Š cutted off
                    }
                }
            };

            $scope.dataAge = [];
            $scope.dataAge[0] = 
            {
                key: "Cumulative Return",
                values: []
            }

            for (var property in ageNUM) {
               
                $scope.dataAge[0].values.push({
                    key: property + "0 " + $scope.doo + " " + property + "9",
                    y: ageNUM[property]
               });
            }

             $scope.optionsGenre = {
                chart: {
                    type: 'discreteBarChart',
                    height: 450,

                    x: function(d){return d.key;},
                    y: function(d){return d.y;},
                    showValues: true,
                    valueFormat: function(d){
                        return d3.format(',.0f')(d);
                    },
                    duration: 500,
                    xAxis: {
                        rotateLabels: -30
                    },
                    yAxis: {
                        axisLabel: $scope.stljudizvrst,
                        tickFormat: d3.format(',.0f')
                    }
                }
            };
            $scope.dataGenre = [];
            $scope.dataGenre[0] = 
            {
                key: "Cumulative Return",
                values: []
            }

            for (var property in genreNUM) {
                if(property !== "") // there are some empty entries because all users didn't select all 3 genres
                    $scope.dataGenre[0].values.push({
                        key: property,
                        y: genreNUM[property]
                   });
            }
            
            
                
        }
  });
