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
        vm.dateRangeSupportedTypes = [];
        vm.dateRangeUnsupportedTypes = [];
        vm.compareTypes = COMPARE_TYPES;
        vm.addComposition = addComposition;
        vm.removeCondition = removeCondition;
        vm.getComparisonTypes = getComparisonTypes;
        vm.canDisplayDateRangeControls = canDisplayDateRangeControls;
        vm.onDateChange = onDateChange;
        vm.getMetadataTooltip = getMetadataTooltip;
        vm.dateRangeReload = false;
        vm.dataType = "";
        vm.$onInit = activate;
        const COMPARABLE_DATA_TYPES = ['timestamp', 'date', 'datetime'];
        const SIMPLE_DATE_TYPES_FOR_DATES = ['Between', 'Compare'];
        const SIMPLE_DATE_TYPES_OTHER = ['Compare', 'Contains', 'NotContains', 'Like'];
        vm.dimension = vm.features[0];
        ////////////////

        function activate() {
            vm.dateRangeSupportedTypes = vm.simpleTypes
                .filter(function (item) {
                    return SIMPLE_DATE_TYPES_FOR_DATES.indexOf(item['@type']) > -1;
                });

            vm.dateRangeUnsupportedTypes = vm.simpleTypes
                .filter(function (item) {
                    return SIMPLE_DATE_TYPES_OTHER.indexOf(item['@type']) > -1;
                });
        }

        function getComparisonTypes(condition) {
            if (!condition) {
                return [];
            }

            const dimensions = vm.features.filter(element => {
                return element.name === condition.featureName;
            });

            if (dimensions.length === 0) {
                return [];
            }

            const dimension = dimensions[0];
            const dataType = dimension.type;
            const isDateType = COMPARABLE_DATA_TYPES.indexOf(dataType) > -1;

            if (isDateType) {
                return vm.dateRangeSupportedTypes;
            }

            return vm.dateRangeUnsupportedTypes;
        }

        function getMetadataTooltip(metadata) {
            if(metadata){
                return 'from ' + metadata.startDateFormatted + ' to ' + metadata.endDateFormatted;
            }
            return '';
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
