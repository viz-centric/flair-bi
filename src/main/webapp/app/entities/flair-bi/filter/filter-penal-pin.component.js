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
        vm.list = {};
        vm.example14model = {};
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

            vm.setting2 = {

            };

            vm.example14data = [{
                "label": "Alabama",
                "id": "AL"
            }, {
                "label": "Alaska",
                "id": "AK"
            }, {
                "label": "American Samoa",
                "id": "AS"
            }, {
                "label": "Arizona",
                "id": "AZ"
            }, {
                "label": "Arkansas",
                "id": "AR"
            }, {
                "label": "California",
                "id": "CA"
            }, {
                "label": "Colorado",
                "id": "CO"
            }, {
                "label": "Wyoming",
                "id": "WY a"
            }];
            vm.example2settings = {
                displayProp: 'id'
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
                    vm.example14model[dimensionName] = [];
                    vm.list[dimensionName] = retVal;
                }
            );
            $scope.$on("$destroy", unsubscribe);
        };

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


    }
})();
