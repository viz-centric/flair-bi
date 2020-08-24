(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterHeaderPanelComponent', {
            templateUrl: 'app/entities/flair-bi/filter/filter-header-panel.component.html',
            controller: filterHeaderPanelController,
            controllerAs: 'vm',
            bindings: {
                dimensions: '=',
                view: '=',
            }
        });

        filterHeaderPanelController.$inject = ['$scope', '$rootScope', 'filterParametersService', 'FilterStateManagerService', 'VisualDispatchService', 'SEPARATORS', '$stateParams', 'proxyGrpcService', 'favouriteFilterService', 'DateUtils'];

    function filterHeaderPanelController($scope, $rootScope, filterParametersService, FilterStateManagerService, VisualDispatchService, SEPARATORS, $stateParams, proxyGrpcService, favouriteFilterService, DateUtils) {
        var vm = this;

        vm.load = load;
        vm.applyFilter = applyFilter;
        vm.canDisplayDateRangeControls = canDisplayDateRangeControls;
        vm.list = {};
        vm.dateRangeReload = false;
        vm.selectedFilter = {};
        vm.onDateChange = onDateChange;
        activate();

        ////////////////

        function activate() {

            vm.settingStyle = {
                scrollableHeight: '200px',
                scrollable: true,
                enableSearch: true,
                selectedToTop: true,
                styleActive: true,
                showCheckAll: false,
                showUncheckAll: false
            };
            $scope.$on('flairbiApp:update-heder-filter', function () {
                updateHeaderFilter();
            });
            receivedMetaData();
            vm.dimensions.forEach(element => {
                vm.load("", element);
            });
        }

        function receivedMetaData() {
            var unsubscribe = $scope.$on(
                "flairbiApp:filters-meta-Data",
                function (event, filter) {
                    var obj = filter[0];
                    var dimensionName = '';
                    for (var i in obj) {
                        dimensionName = i;
                        break;
                    }
                    var retVal = filter.map(function (item) {
                        return {
                            label: item[dimensionName],
                            id: item[dimensionName]
                        }
                    });
                    vm.selectedFilter[dimensionName] = [];
                    vm.list[dimensionName] = retVal;
                }
            );
            $scope.$on("$destroy", unsubscribe);
        };

        function findDimension(dimension) {
            return vm.dimensions.filter(function (item) {
                return item.name === dimension;
            })
        }

        function load(q, dimension) {
            var vId = $stateParams.id ? $stateParams.id : $stateParams.visualisationId;
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
            favouriteFilterService.setFavouriteFilter(false);
            proxyGrpcService.forwardCall(
                vm.view.viewDashboard.dashboardDatasource.id, {
                queryDTO: query,
                vId: vId,
                type: $stateParams.id ? 'filters' : 'share-link-filter'
            },
                $stateParams.id ? $stateParams.id : $stateParams.viewId
            );
        }


        function updateHeaderFilter() {
            var filterParameters;
            filterParameters = filterParametersService.get();
            var filter = Object.keys(filterParameters);

            if (filter.length == 0) {
                vm.dimensions.map(function (item) {
                    vm.selectedFilter[item.name] = [];
                })
            }
            else {
                filter.forEach(element => {
                    vm.dimensions.map(function (item) {
                        if (item.name === element) {
                            vm.selectedFilter[element] = filterParameters[element]
                                .map(function (item) {
                                    return {
                                        label: item,
                                        id: item
                                    }
                                });
                        }
                    })

                });
            }
        }

        function applyFilter() {
            $(".pin-filter div.collapse.in").removeClass("in");
            var filter = Object.keys(vm.selectedFilter);
            var filterParameters = filterParametersService.getSelectedFilter();

            filter.forEach(element => {
                if (vm.selectedFilter[element].length > 0) {
                    var dimension = findDimension(element)[0];
                    if (!filterParameters[dimension.name]) {
                        filterParameters[dimension.name] = [];
                    }
                    filterParameters[dimension.name] = vm.selectedFilter[element].map(function (item) {
                        return item.id;
                    });
                    filterParameters[dimension.name]._meta = {
                        dataType: dimension.type,
                        valueType: 'valueType'
                    };
                    filterParametersService.saveSelectedFilter(filterParameters);

                }
            });
            FilterStateManagerService.add(angular.copy(filterParametersService.get()));
            filters();
        }

        function filters() {
            filterParametersService.save(filterParametersService.getSelectedFilter());
            $rootScope.updateWidget = {};
            $rootScope.$broadcast('flairbiApp:filter');
            $rootScope.$broadcast('flairbiApp:filter-add');
            //addFilterInIframeURL();
            $rootScope.$broadcast("flairbiApp:filterClicked");
            $rootScope.$broadcast("flairbiApp:add-filter-In-FinterPanel");

        }

        function addFilterInIframeURL() {
            var filters = filterParametersService.getSelectedFilter();
            filterParametersService.setFilterInIframeURL(filters, vm.iframes, vm.dimensions);
        }
        function canDisplayDateRangeControls(dimension) {
            return filterParametersService.isDateType(dimension);
        }
        function removeFilter(filter) {
            var filterParameters;
            filterParameters = filterParametersService.get();
            filterParameters[filter] = [];
            filterParametersService.save(filterParameters);

            filterParameters = filterParametersService.getSelectedFilter();
            filterParameters[filter] = [];
            filterParametersService.saveSelectedFilter(filterParameters);
        }
        function onDateChange(startDate, endDate, metadata, dimension) {
            //vm.dimension.metadata = metadata;
            if (metadata.dateRangeTab !== 2) {
                dimension.selected = startDate;
                dimension.selected2 = endDate;
            } else {
                filterParametersService.saveDynamicDateRangeMetaData(dimension.name, metadata);
            }
            console.log('filter-element-grpc: refresh for range', typeof startDate, startDate,
                typeof endDate, endDate);
            removeFilter(dimension.name);
            if (startDate) {
                startDate = DateUtils.resetTimezoneDate(startDate);
                addDateRangeFilter(startDate, dimension);
            }
            if (endDate) {
                endDate = DateUtils.resetTimezoneDate(endDate);
                addDateRangeFilter(endDate, dimension);
            }
        }
        function addDateRangeFilter(date, dimension) {
            var filterParameters = filterParametersService.getSelectedFilter();
            if (!filterParameters[dimension.name]) {
                filterParameters[dimension.name] = [];
            }
            filterParameters[dimension.name].push(date);
            filterParameters[dimension.name]._meta = {
                dataType: dimension.type,
                valueType: 'dateRangeValueType'
            };
            filterParametersService.save(filterParameters);
        }
    }
})();
