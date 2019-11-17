(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterElementGrpcComponent', {
            templateUrl: 'app/entities/flair-bi/filter/filter-element-grpc.component.html',
            controller: filterElementGrpcController,
            controllerAs: 'vm',
            bindings: {
                dimension: '=',
                view: '=',
                dimensions:'='
            }
        });

    filterElementGrpcController.$inject = ['$scope', 'proxyGrpcService', 'filterParametersService','$timeout','FilterStateManagerService','$rootScope','$filter','VisualDispatchService','stompClientService'];

    function filterElementGrpcController($scope, proxyGrpcService, filterParametersService,$timeout,FilterStateManagerService,$rootScope,$filter,VisualDispatchService,stompClientService) {
        var vm = this;
        var COMPARABLE_DATA_TYPES = ['timestamp', 'date', 'datetime'];
        var TAB_DAY = 0;
        var TAB_RANGE = 1;
        var TAB_DYNAMIC = 2;
        vm.$onInit = activate;
        vm.load = load;
        vm.added = added;
        vm.removed = removed;
        vm.canDisplayDateRangeControls = canDisplayDateRangeControls;
        vm.onDateRangeClick = onDateRangeClick;
        vm.onInputChange = onInputChange;
        vm.datePickerOpenStatus = {};
        vm.toggleCalendar = toggleCalendar;
        vm.metaData=[];
        vm.fromDate=null;
        vm.endDate=null;
        vm.dateRangeTab=0;


        ////////////////

        function activate() {
            var unsub = $scope.$on('flairbiApp:filter-input-refresh', function (e) {
                refresh();
            });

            $scope.$on('$destroy', unsub);
            registerRemoveTag();
        }

        function onDateRangeClick(tabIndex) {
            vm.dateRangeTab = tabIndex;
        }

        function refreshForDay() {
            var startDate = vm.dimension.selected;
            removeFilter(vm.dimension.name);
            if (startDate) {
                added({text: startDate});
            }
        }

        function refreshForRange() {
            var startDate = vm.dimension.selected;
            var endDate = vm.dimension.selected2;
            removeFilter(vm.dimension.name);
            if (startDate && endDate) {
                added({text: startDate});
                added({text: endDate});
            }
        }

        function onInputChange() {
            if (vm.dateRangeTab === TAB_DAY) {
                refreshForDay();
            } else if (vm.dateRangeTab === TAB_RANGE) {
                refreshForRange();
            }
        }

        function canDisplayDateRangeControls(dimension) {
            var type = dimension && dimension.type;
            return COMPARABLE_DATA_TYPES.indexOf(type.toLowerCase()) > -1;
        }

        function registerRemoveTag() {
            var unsubscribe = $scope.$on(
                "FlairBi:remove-filter",
                function(event,filter) {
                if(filter!=undefined){
                    if(!isString(filter)){
                        processRemoveTag(filter)
                    }else{
                        processRemoveFilter(filter);
                    }
                }
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }

        function processRemoveTag(tag) {
            if (isTagExist(tag)) {
                removed(tag);
                removeTagFromSelectedList(tag);
            }
            applyFilter();
        }

        function removeFilter(filter) {
            var filterParameters = filterParametersService.get();
            filterParameters[filter] = [];
            filterParametersService.save(filterParameters);
        }

        function processRemoveFilter(filter) {
            var filterParameters = filterParametersService.get();
            if (filterParameters[filter] == undefined) {
                applyFilter();
            } else {
                if (filterParameters[filter].length != 0) {
                    var found = $filter('filter')(vm.dimensions, {'name': filter})[0];
                    found.selected = [];
                    found.selected2 = [];
                    filterParameters[filter] = [];
                    filterParametersService.save(filterParameters);
                    applyFilter();
                }
            }
        }

        function isString(filter) {
            return typeof filter === 'string' || filter instanceof String;
        }

        function isTagExist(tag) {
            var filterParameters = filterParametersService.get();
            var tag = $filter('filter')(filterParameters[vm.dimension.name], tag['text']);
            return tag == undefined ? false : true;
        }


        function applyFilter() {
            FilterStateManagerService.add(angular.copy(filterParametersService.get()));
            $rootScope.$broadcast('flairbiApp:filter');
        }

        function toggleCalendar(e, date) {
            e.preventDefault();
            e.stopPropagation();
            vm.datePickerOpenStatus[date] = !vm.datePickerOpenStatus[date];
        }

        function load(q, dimension) {
            var vId = dimension.id;
            var query = {};
            query.fields = [dimension.name];
            if (q) {
                query.conditionExpressions = [{
                    sourceType: 'FILTER',
                    conditionExpression: {
                        '@type': 'Like',
                        featureName: dimension.name,
                        value: q
                    }
                }];
            }
            query.distinct = true;
            query.limit = 100;
            proxyGrpcService.forwardCall(
              vm.view.viewDashboard.dashboardDatasource.id, {
                  queryDTO: query,
                  vId: vId
              }
            );
        }

        function removed(tag) {
            var filterParameters = filterParametersService.get();
            var array = filterParameters[vm.dimension.name] == undefined ? filterParameters[vm.dimension.name.toLowerCase()] : filterParameters[vm.dimension.name];
            var index = array.indexOf(tag['text']);
            if (index > -1) {
                array.splice(index, 1);
            }

            filterParametersService.save(filterParameters);
        }

        function removeTagFromSelectedList(tag) {
            var index = -1;
            vm.dimension.selected.some(function (obj, i) {
                return obj.text === tag['text'] ? index = i : false;
            });
            if (index > -1) {
                vm.dimension.selected.splice(index, 1);
            }
        }

        function refresh() {
            var myFilters = filterParametersService.get()[vm.dimension.name] || filterParametersService.get()[vm.dimension.name.toLowerCase()];
            if (myFilters && myFilters.length > 0) {
                vm.dimension.selected = myFilters.map(function (item) {
                    var newItem = {};
                    newItem['text'] = item;
                    return newItem;
                });
            } else {
                vm.dimension.selected = [];
                vm.dimension.selected2 = [];
            }
        }

        function added(tag) {
            var filterParameters = filterParametersService.get();
            if (!filterParameters[vm.dimension.name]) {
                filterParameters[vm.dimension.name] = [];
            }
            filterParameters[vm.dimension.name].push(tag['text']);
            filterParameters[vm.dimension.name]._meta = {
                dataType: vm.dimension.type
            };
            filterParametersService.save(filterParameters);
        }

    }
})();
