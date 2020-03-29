(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterElementGrpcWidgetComponent', {
            templateUrl: 'app/entities/flair-bi/filter/filter-element-grpc-widget.component.html',
            controller: filterElementGrpcWidgetController,
            controllerAs: 'vm',
            bindings: {
                dimension: '=',
                view: '=',
                dimensions: '=',
                list: '='
            }
        });

    filterElementGrpcWidgetController.$inject = ['$scope', 'proxyGrpcService', 'filterParametersService', '$timeout', 'FilterStateManagerService', '$rootScope', '$filter', 'VisualDispatchService', 'stompClientService', 'favouriteFilterService', 'Features'];

    function filterElementGrpcWidgetController($scope, proxyGrpcService, filterParametersService, $timeout, FilterStateManagerService, $rootScope, $filter, VisualDispatchService, stompClientService, favouriteFilterService, Features) {
        var vm = this;
        var COMPARABLE_DATA_TYPES = ['timestamp', 'date', 'datetime'];
        vm.$onInit = activate;
        vm.load = load;
        vm.added = added;
        vm.removed = removed;
        vm.canDisplayDateRangeControls = canDisplayDateRangeControls;
        vm.onDateChange = onDateChange;
        vm.dateRangeReload = false;
        vm.removeTagFromFilterList = removeTagFromFilterList;
        vm.addFilter = addFilter;
        vm.isActive = isActive;

        function isActive(filter) {
            var myFilters = filterParametersService.getSelectedFilter()[vm.dimension.name] || filterParametersService.get()[vm.dimension.name.toLowerCase()];
            if (myFilters && myFilters.length > 0) {
                if (myFilters.indexOf(filter) !== -1) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        ///////////
        function addFilter(filter) {
            var filterParameters = filterParametersService.getSelectedFilter();
            if (!filterParameters[vm.dimension.name]) {
                filterParameters[vm.dimension.name] = [];
            }

            if (filterParameters[vm.dimension.name].indexOf(filter) !== -1) {
                filterParameters[vm.dimension.name].splice(filterParameters[vm.dimension.name].indexOf(filter.name), 1);
            }
            else {
                filterParameters[vm.dimension.name].push(filter);
            }

            filterParameters[vm.dimension.name]._meta = {
                dataType: vm.dimension.type,
                valueType: 'valueType'
            };
            filterParametersService.saveSelectedFilter(filterParameters);
            vm.isActive(filter);

            displaySelectedFilterAtTop(vm.list[vm.dimension.name], vm.list[vm.dimension.name].indexOf(filter), filterParameters[vm.dimension.name].length - 1);


        }/////

        function activate() {
            receivedMetaData();
            var unsub = $scope.$on('flairbiApp:filter-input-refresh', function (e) {
                refresh();
            });

            $scope.$on('flairbiApp:clearFilters', function () {
                clear();
            });

            $scope.$on('$destroy', unsub);
            registerRemoveTag();
            vm.load("", vm.dimension, true);
        }

        function clear() {
            vm.dateRangeReload = !vm.dateRangeReload;
        }

        function resetTimezone(startDate) {
            return startDate;
        }

        function onDateChange(startDate, endDate) {
            console.log('filter-element-grpc: refresh for range', typeof startDate, startDate,
                typeof endDate, endDate);
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
            if (!type) {
                return false;
            }
            return COMPARABLE_DATA_TYPES.indexOf(type.toLowerCase()) > -1;
        }

        function receivedMetaData() {
            var unsubscribe = $scope.$on(
                "flairbiApp:filters-meta-Data",
                function (event, filter) {
                    if (favouriteFilterService.getFavouriteFilter()) {
                        var obj = filter[0];
                        var dimensionName = '';
                        for (var i in obj) {
                            dimensionName = i;
                            break;
                        }
                        var retVal = filter.map(function (item) {
                            return item[dimensionName];
                        });
                        vm.list[dimensionName] = retVal;
                    }
                }
            );
            $scope.$on("$destroy", unsubscribe);
        };

        function registerRemoveTag() {
            var unsubscribe = $scope.$on(
                "FlairBi:remove-filter",
                function (event, filter) {
                    if (filter != undefined) {
                        if (!isString(filter)) {
                            processRemoveTag(filter)
                        } else {
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
                    var found = $filter('filter')(vm.dimensions, { 'name': filter })[0];
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

        function load(q, dimension, favouriteFilter = false) {
            var vId = dimension.id;
            var query = {};
            query.fields = [{ name: dimension.name }];
            if (q) {
                query.conditionExpressions = [{
                    sourceType: 'FILTER',
                    conditionExpression: {
                        '@type': 'Like',
                        featureType: { featureName: dimension.name, type: dimension.type },
                        caseInsensitive: true,
                        value: q
                    }
                }];
            }
            query.distinct = true;
            query.limit = 100;
            favouriteFilterService.setFavouriteFilter(favouriteFilter);
            proxyGrpcService.forwardCall(
                vm.view.viewDashboard.dashboardDatasource.id, {
                queryDTO: query,
                vId: vId
            }
            );
        }

        function removed(tag) {
            filterParametersService.saveSelectedFilter(removeTagFromFilterList(filterParametersService.getSelectedFilter(), tag));
        }

        function removeTagFromFilterList(filterParameters, tag) {
            var array = filterParameters[vm.dimension.name] ? filterParameters[vm.dimension.name.toLowerCase()] : filterParameters[vm.dimension.name];
            if (array) {
                var index = array.indexOf(tag['text']);
                if (index > -1) {
                    array.splice(index, 1);
                    filterParameters[vm.dimension.name] = array;
                    if (filterParameters[vm.dimension.name].length == 0)
                        delete filterParameters[vm.dimension.name];
                    return filterParameters;
                }
            }
            return filterParameters;
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
                vm.dimension.selected = myFilters.map(function (item, i) {
                    var newItem = {};
                    newItem['text'] = item;

                    displaySelectedFilterAtTop(vm.list[vm.dimension.name], vm.list[vm.dimension.name].indexOf(item), i);

                    return newItem;
                });
            } else {
                vm.dimension.selected = [];
                vm.dimension.selected2 = [];
            }
        }

        function added(tag) {
            var filterParameters = filterParametersService.getSelectedFilter();
            if (!filterParameters[vm.dimension.name]) {
                filterParameters[vm.dimension.name] = [];
            }
            filterParameters[vm.dimension.name].push(tag['text']);
            filterParameters[vm.dimension.name]._meta = {
                dataType: vm.dimension.type,
                valueType: 'valueType'
            };
            filterParametersService.saveSelectedFilter(filterParameters);
            displaySelectedFilterAtTop(vm.list[vm.dimension.name], vm.list[vm.dimension.name].indexOf(tag['text']), filterParameters[vm.dimension.name].length - 1);

        }

        function addDateRangeFilter(date) {
            var filterParameters = filterParametersService.getSelectedFilter();
            var dateRangeName = filterParametersService.buildDateRangeFilterName(vm.dimension.name);
            delete filterParameters[vm.dimension.name];
            if (!filterParameters[dateRangeName]) {
                filterParameters[dateRangeName] = [];
            }
            filterParameters[dateRangeName].push(date);
            filterParameters[dateRangeName]._meta = {
                dataType: vm.dimension.type,
                valueType: 'dateRangeValueType'
            };
            filterParametersService.saveSelectedFilter(filterParameters);
        }

        function displaySelectedFilterAtTop(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                var k = new_index - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        }
    }
})();
