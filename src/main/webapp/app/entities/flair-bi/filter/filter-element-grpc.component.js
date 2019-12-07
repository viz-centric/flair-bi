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
        vm.$onInit = activate;
        vm.load = load;
        vm.added = added;
        vm.removed = removed;
        vm.canDisplayDateRangeControls = canDisplayDateRangeControls;
        vm.onRefreshDay = refreshForDay;
        vm.onRefreshRange = refreshForRange;
        vm.onRefreshDynamic = onRefreshDynamic;


        ////////////////

        function activate() {
            var unsub = $scope.$on('flairbiApp:filter-input-refresh', function (e) {
                refresh();
            });

            $scope.$on('$destroy', unsub);
            registerRemoveTag();
        }

        function resetTimezone(startDate) {
            var date = new Date(startDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
        }

        function endOfDay(startDate) {
            var date = new Date(startDate);
            date.setHours(23, 59 - date.getTimezoneOffset(), 59);
            return date;
        }

        function refreshForDay() {
            var startDate = vm.dimension.selected;
            removeFilter(filterParametersService.buildDateRangeFilterName(vm.dimension.name));
            if (startDate) {
                startDate = resetTimezone(startDate);
                var nextDay = endOfDay(startDate);
                addDateRangeFilter(startDate);
                addDateRangeFilter(nextDay);

            }
        }

        function onRefreshDynamic(startDate) {
            removeFilter(filterParametersService.buildDateRangeFilterName(vm.dimension.name));
            if (startDate) {
                startDate = resetTimezone(startDate);
                var today = resetTimezone(new Date());
                addDateRangeFilter(startDate);
                addDateRangeFilter(today);
            }
            applyFilter();
        }

        function refreshForRange() {
            var startDate = vm.dimension.selected;
            var endDate = vm.dimension.selected2;
            removeFilter(filterParametersService.buildDateRangeFilterName(vm.dimension.name));
            if (startDate && endDate) {
                startDate = resetTimezone(startDate);
                endDate = resetTimezone(endDate);
                addDateRangeFilter(startDate);
                addDateRangeFilter(endDate);
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
                        caseInsensitive: true,
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

        function addDateRangeFilter(date){
            var filterParameters = filterParametersService.get();
            var dateRangeName=filterParametersService.buildDateRangeFilterName(vm.dimension.name);
            delete filterParameters[ vm.dimension.name];
            if (!filterParameters[dateRangeName]) {
                filterParameters[dateRangeName] = [];
            }
            filterParameters[dateRangeName].push(date);
            // let this code commented for a while
            // filterParameters[vm.dimension.name]._meta = {
            //     dataType: vm.dimension.type
            // };
            filterParametersService.save(filterParameters);
        }

    }
})();
