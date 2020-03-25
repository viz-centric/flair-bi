(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('conditionComponent', {
            templateUrl: 'app/entities/flair-bi/modal/modal-tabs/condition/condition.component.html',
            controller: conditionComponent,
            controllerAs: 'vm',
            bindings: {
                condition: '=',
                features: '=',
                showAdd: '@',
                showDelete: '@',
                datasourceId: '='
            }
        });

    conditionComponent.$inject = ['$scope', 'CONDITION_TYPES', 'COMPARE_TYPES', '$rootScope', 'CryptoService', 'proxyGrpcService', 'filterParametersService','favouriteFilterService'];

    function conditionComponent($scope, CONDITION_TYPES, COMPARE_TYPES, $rootScope, CryptoService, proxyGrpcService, filterParametersService,favouriteFilterService) {
        var vm = this;
        vm.load = load;
        vm.showInfo = false;
        vm.dimension = {};


        vm.simpleTypes = CONDITION_TYPES.filter(function (item) {
            return item.type === 'simple';
        });
        vm.compositeTypes = CONDITION_TYPES.filter(function (item) {
            return item.type === 'composite';
        });
        vm.compareTypes = COMPARE_TYPES;
        vm.addComposition = addComposition;
        vm.removeCondition = removeCondition;
        vm.canDisplayDateRangeControls = canDisplayDateRangeControls;
        vm.onDateChange = onDateChange;
        vm.getMetadataTooltip = getMetadataTooltip;
        vm.dateRangeReload = false;
        vm.dataType = "";
        vm.$onInit = activate;
        var COMPARABLE_DATA_TYPES = ['timestamp', 'date', 'datetime'];
        vm.dimension = vm.features[0];
        ////////////////

        function activate() {
            if (vm.condition) {

            }
        }

        function getMetadataTooltip(metadata) {
            if(metadata){
                return 'from ' + metadata.startDateFormatted + ' to ' + metadata.endDateFormatted;
            }
        }

        function onDateChange(startDate, endDate, metadata) {
            console.log('filter-element-grpc: refresh for range', typeof startDate, startDate,
                typeof endDate, endDate, metadata);
            if (startDate && endDate) {
                startDate = resetTimezone(startDate);
                endDate = resetTimezone(endDate);
                vm.condition.valueType = {value: startDate, type: vm.dataType, '@type': 'valueType'};
                vm.condition.secondValueType = {value: endDate, type: vm.dataType, '@type': 'valueType'};
                vm.condition.metadata = metadata;
            }
        }

        function resetTimezone(startDate) {
            return startDate;
        }

        function canDisplayDateRangeControls(dimension) {
            if (dimension) {
                var feature = dimension.featureName;
                if (feature) {
                    var isDate = vm.features.filter(element => {
                        if (COMPARABLE_DATA_TYPES.indexOf(element.type.toLowerCase()) != -1 && element.name === dimension.featureName && dimension["@type"] === "Between") {
                            vm.dataType = element.type;
                            vm.dimension = element;
                            return element;
                        }
                    });
                    for (var index = 0; index < vm.features.length; index++) {
                        // if (vm.features[index].type.toLowerCase() == "varchar" && vm.features[index].name === dimension.featureName) {
                        //     vm.simpleTypes = vm.simpleTypes.filter(function (val) {
                        //         return val["@type"] !== "Between";
                        //     })
                        //     return false;
                        // }
                        // else {
                        //     vm.simpleTypes = CONDITION_TYPES.filter(function (item) {
                        //         return item.type === 'simple';
                        //     });
                        // }
                    }
                    var hasDates = isDate.length > 0;
                    vm.showInfo = hasDates;
                    if (hasDates) {
                        return true;
                    }
                }
                return false;
            }
            return false;
        }

        function addComposition() {
            $rootScope.$broadcast('flairbiApp:composeCondition', vm.condition);
        }

        function removeCondition() {
            $rootScope.$broadcast('flairbiApp:decomposeCondition', vm.condition);
        }

        function load(q, featureName) {
            var dimensions = vm.features.filter(function (item) {
                return item.name === featureName;
            });
            var query = { "distinct": true, "limit": 100 };
            query.fields = [{ name: featureName }];
            favouriteFilterService.setFavouriteFilter(false);
            if (q) {
                query.conditionExpressions = [{
                    sourceType: 'FILTER',
                    conditionExpression: {
                        '@type': 'Like',
                        featureType: { featureName: featureName, type: dimensions.type },
                        caseInsensitive: true,
                        value: q
                    }
                }];
            }
            proxyGrpcService.forwardCall(
                vm.datasourceId, {
                queryDTO: query,
                vId: dimensions[0].id
            }
            );
        }
    }
})();
