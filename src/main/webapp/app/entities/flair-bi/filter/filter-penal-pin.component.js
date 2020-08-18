(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterPenalPinComponent', {
            templateUrl: 'app/entities/flair-bi/filter/filter-penal-pin.component.html',
            controller: filterPenalPinController,
            controllerAs: 'vm',
            bindings: {
                dimensions: '=',
                view: '=',
            }
        });

    filterPenalPinController.$inject = ['$scope', '$rootScope', 'filterParametersService', 'FilterStateManagerService', 'VisualDispatchService', 'SEPARATORS', '$stateParams', 'proxyGrpcService', 'favouriteFilterService'];

    function filterPenalPinController($scope, $rootScope, filterParametersService, FilterStateManagerService, VisualDispatchService, SEPARATORS, $stateParams, proxyGrpcService, favouriteFilterService) {
        var vm = this;

        vm.load = load;
        vm.applyFilter = applyFilter;
        vm.list = {};
        vm.selectedFilter = {};
        activate();

        ////////////////

        function activate() {

            vm.setting1 = {
                scrollableHeight: '200px',
                scrollable: true,
                enableSearch: true,
                selectedToTop: true,
                styleActive: true,
                showCheckAll: false,
                showUncheckAll: false
            };
           
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

        function applyFilter() {
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
            dd();
        }

        function dd() {
            filterParametersService.save(filterParametersService.getSelectedFilter());
            $rootScope.updateWidget = {};
            $rootScope.$broadcast('flairbiApp:filter');
            $rootScope.$broadcast('flairbiApp:filter-add');
            addFilterInIframeURL();
            $rootScope.$broadcast("flairbiApp:filterClicked");
        }

        function addFilterInIframeURL() {
            var filters = filterParametersService.getSelectedFilter();
            filterParametersService.setFilterInIframeURL(filters, vm.iframes, vm.dimensions);
        }


    }
})();
