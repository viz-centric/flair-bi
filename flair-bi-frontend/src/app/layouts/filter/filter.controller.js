// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .controller('FilterController', FilterController);

FilterController.$inject = ['$scope', '$timeout', '$state', 'Auth', 'Principal', 'ProfileService', 'LoginService',
    'Visualizations', 'Views', '$stateParams', '$rootScope', 'ExecutorFactory'
];

export const name = 'FilterController';
export function FilterController($scope, $timeout, $state, Auth, Principal, ProfileService, LoginService,
    Visualizations, Views, $stateParams, $rootScope, ExecutorFactory) {
    var vm = this;
    vm.filterData = [];
    vm.fieldList = [];
    $scope.ordering = {};

    function loadDimensions() {
        Dimensions.query(function (result) {
            vm.dimensions = result;
            var urlInfo = window.location.href.split("/");
            var source_id = urlInfo[urlInfo.length - 1].split("?");
            source_id = Number(source_id[0]);
            //var dimLength = dimLength;
            var dimLength = 0;
            for (var a = 0; a < result.length; a++) {
                if (source_id == result[a]['dimensionDatasource'].id) { // not getting source id
                    dimLength += 1;
                    $scope.dSource = result[a]['dimensionDatasource'].name;
                    $scope.dSource_id = result[a]['dimensionDatasource'].id;
                    vm.preSQL = 'select count(distinct ' + result[a].name + ') as ' + result[a].name + ' from ' + result[a]['dimensionDatasource'].name + ';';
                    ExecutorFactory.executor(
                        vm.preSQL,
                        result[a]['dimensionDatasource'].id.toString(),
                        "{}",
                        false,
                        function (result) {
                            for (var f in result[0]) {
                                var pField = f;
                                break;
                            }
                            if (result[0][pField] < 1000) {

                                vm.filterSQL = '';
                                vm.filterSQL = 'select distinct ';
                                vm.filterSQL += pField + ' ';
                                vm.sourceName = $scope.dSource;
                                vm.filterSQL += 'from ' + vm.sourceName + ' limit 1000;';
                                vm.filterSQL = vm.filterSQL.toUpperCase();
                                ExecutorFactory.executor(
                                    vm.filterSQL,
                                    $scope.dSource_id.toString(),
                                    "{}",
                                    false,
                                    function (result) {
                                        if (result.length > 0) {
                                            for (var field in result[0]) {
                                                vm.fieldList.push(field.replace(" ", ""));
                                            }
                                        }
                                        vm.filterData.push(result);
                                        $('.search_test').SumoSelect({
                                            search: true,
                                            searchText: 'Search...',
                                            placeholder: 'Filter dashboard',
                                            okCancelInMulti: true,
                                            up: false,
                                            noMatch: ''
                                        });
                                        dimLength -= 1;
                                        if (dimLength == 0) {
                                            $scope.$broadcast('dataloaded');
                                        }
                                        //$scope.   ();
                                    },
                                    function (error) {
                                        $scope.dataFromBuild[record.id].data = [];
                                        var sm = [];
                                        sm.title = 'Filters not fetched!';
                                        sm.text = [];
                                        sm.text.push('Status : ' + error.status.toString());
                                        sm.text.push('Description : ' + error.statusText);
                                        $rootScope.showErrorToast(sm);
                                        return [];
                                    });

                            } else {
                                //$('#filter_div')
                                //    .append('<input type="text" placeholder="Search '+pField.toUpperCase()+'..." class="CaptionCont SelectBox search search-flair" id="S_'+pField.toUpperCase()+'">');
                                dimLength -= 1;
                                if (dimLength == 0) {
                                    $scope.$broadcast('dataloaded');
                                }

                                vm.fieldList.push(pField.toUpperCase().replace(" ", ""));
                                vm.filterData.push([]);

                            }
                            //$scope.$apply();
                        },
                        function (error) {
                            $scope.dataFromBuild[record.id].data = [];
                            var sm = [];
                            sm.title = 'Filters not fetched!';
                            sm.text = [];
                            sm.text.push('Status : ' + error.status.toString());
                            sm.text.push('Description : ' + error.statusText);
                            $rootScope.showErrorToast(sm);
                            return [];
                        });
                }
            }
            vm.searchQuery = null;

        });
    }

    $scope.$on('dataloaded', function () {
        $scope.filterData = vm.filterData;
        $scope.fieldList = vm.fieldList;
        $timeout(function () {
            $('.search_test').SumoSelect({
                search: true,
                searchText: 'Search...',
                placeholder: 'Filter dashboard',
                okCancelInMulti: true,
                up: false,
                noMatch: ''
            });
        }, 3);
        $timeout(function () {
            $('.search_test').SumoSelect({
                search: true,
                searchText: 'Search...',
                placeholder: 'Filter dashboard',
                okCancelInMulti: true,
                up: false,
                noMatch: ''
            });

        }, 5);

        $timeout(function () {
            for (var x = 0; x < $('select.search_test').length; x++) {
                $scope.ordering[$('select.search_test')[x].id] = x;
            }

            $(".SumoSelect input").bind('input', function (event) {
                var idSel = $(this).closest("div").find("select").attr('data');
                var pField = idSel.split("_")[1].toUpperCase();
                for (var a = 0; a < 150; a++) {
                    try {
                        $('.search_test')[idSel.split("_")[0]].sumo.remove(a);
                    } catch (e) { }
                }
                if ($(this).val().toString().trim() != "") {
                    vm.filterSQL = '';
                    vm.filterSQL = 'select distinct ';
                    vm.filterSQL += pField + ' ';
                    vm.sourceName = $scope.dSource;
                    vm.filterSQL += 'from ' + vm.sourceName
                    vm.filterSQL += ' where ' + pField + " like concat('%','" + $(this).val().toString().trim() + "','%')"
                    vm.filterSQL += ' limit 5;';
                    vm.filterSQL = vm.filterSQL.toUpperCase();
                    ExecutorFactory.executor(
                        vm.filterSQL,
                        $scope.dSource_id.toString(),
                        "{}",
                        false,
                        function (result) {
                            //vm.filterData[idSel.split("_")[0]]=result;
                            for (var c = 0; c < result.length; c++) {
                                $('.search_test')[idSel.split("_")[0]].sumo.add(result[c][pField]);
                            }
                            //$scope.$apply();
                        },
                        function (error) {
                            $scope.dataFromBuild[record.id].data = [];
                            var sm = [];
                            sm.title = 'Filters not fetched!';
                            sm.text = [];
                            sm.text.push('Status : ' + error.status.toString());
                            sm.text.push('Description : ' + error.statusText);
                            $rootScope.showErrorToast(sm);
                            return [];
                        });
                }
            })

        }, 10);

    });

    var oldObj = [];
    $scope.addRemoveFilter = function () {
        var items = '';
        $('.search_test option:selected').each(function (i) {
            var tmp = {}
            tmp = $(this).val().split("|");
            if ($rootScope.obj[tmp[0]]) {
                if ($rootScope.obj[tmp[0]].indexOf(tmp[1]) < 0) {
                    $rootScope.obj[tmp[0]].push(tmp[1].toString())
                    $rootScope.obj.broadcast = true;
                }
            } else {
                $rootScope.obj[tmp[0]] = [];
                $rootScope.obj[tmp[0]].push(tmp[1])
                $rootScope.obj.broadcast = true;
            }
        });
        $rootScope.selections = $rootScope.obj;
        if ($rootScope.obj.broadcast) {
            oldObj = $rootScope.obj;
            $rootScope.$broadcast('executeFilters', $rootScope.obj, 1);
        } else if ($rootScope.obj.broadcast) {
            oldObj = $rootScope.obj;
            $rootScope.$broadcast('executeFilters', $rootScope.obj, 1);
        }
    }

    $rootScope.$on('clearFilters', function (event, result) {
        var clear = false;
        var obj = [];
        $rootScope.obj = obj;
        $('.search_test option:selected').each(function (i) {
            clear = true;
            return false;
        })

        if (clear) {
            $rootScope.$broadcast('executeFilters', $rootScope.obj, 0);
        }

        for (var f = 0; f < $('.search_test').length; f++) {
            try {
                $('.search_test')[f].sumo.unSelectAll();
            } catch (e) { }
        }
    })

    $rootScope.$on('updFilter', function (event, result) {
        $('select.search_test')[$scope.ordering[result.label + "_filter"]].sumo.selectItem(result.label + "|" + result.value.toString());
    })

    $('.search_test').SumoSelect({
        search: true,
        searchText: 'Search...',
        placeholder: 'Filter dashboard',
        okCancelInMulti: true,
        up: false
    });

    $rootScope.$on('showFilters', function (event, result) {
        $("#filterarea").slideToggle();
        $('.search_test').SumoSelect({
            search: true,
            searchText: 'Search...',
            placeholder: 'Filter dashboard',
            okCancelInMulti: true,
            up: false
        });
    })

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams, options) {
            $("#filterarea").hide();
        })
}