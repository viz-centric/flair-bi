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

    conditionComponent.$inject = ['$scope', 'COMPARABLE_DATA_TYPES', 'CONDITION_TYPES', 'COMPARE_TYPES', '$rootScope', 'CryptoService', 'proxyGrpcService', 'filterParametersService','favouriteFilterService','$stateParams'];

    function conditionComponent($scope, COMPARABLE_DATA_TYPES, CONDITION_TYPES, COMPARE_TYPES, $rootScope, CryptoService, proxyGrpcService, filterParametersService,favouriteFilterService,$stateParams) {
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
        vm.onConditionValueChange = onConditionValueChange;
        vm.addComposition = addComposition;
        vm.removeCondition = removeCondition;
        vm.getComparisonTypes = getComparisonTypes;
        vm.canDisplayDateRangeControls = canDisplayDateRangeControls;
        vm.onDateChange = onDateChange;
        vm.onContainsAdded = onContainsAdded;
        vm.onContainsRemoved = onContainsRemoved;
        vm.onFeatureSelect = onFeatureSelect;
        vm.getMetadataTooltip = getMetadataTooltip;
        vm.displayTextboxForValues = displayTextboxForValues;
        vm.addToFilter = addToFilter;
        vm.dateRangeReload = false;
        vm.dataType = "";
        vm.$onInit = activate;
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

            const dimension = getDimension(condition);
            if (!dimension) {
                return [];
            }
            const dataType = dimension.type;
            const isDateType = COMPARABLE_DATA_TYPES.indexOf(dataType.toLowerCase()) > -1;

            if (isDateType) {
                return vm.dateRangeSupportedTypes;
            }

            return vm.dateRangeUnsupportedTypes;
        }

        function getDimension(condition) {
            return vm.features.find(element => {
                return element.name === condition.featureName;
            });
        }

        function getMetadataTooltip(metadata) {
            if (metadata) {
                return 'from ' + metadata.startDateFormatted + ' to ' + metadata.endDateFormatted;
            }
            return '';
        }

        function onFeatureSelect(item, data) {
            vm.condition.valueType.type = item.type;
        }

        function onContainsAdded(tag) {
            const dimension = getDimension(vm.condition);
            vm.condition.valueTypes.push({
                '@type': 'valueType',
                value: tag.text,
                type: dimension.type
            })
        }

        function onContainsRemoved(tag) {
            console.log('on contains removed', tag);
            const valueType = vm.condition.valueTypes.find((item) => {
                return item.value === tag.text;
            });
            if (valueType) {
                const idx = vm.condition.valueTypes.indexOf(valueType);
                vm.condition.valueTypes.splice(idx, 1);
            }
        }

        function onConditionValueChange() {
            vm.condition.value = vm.condition.valueType.value;
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
            },
            $stateParams.id
            );
        }

        function displayTextboxForValues() {
            vm.isCommaSeparatedInput = !vm.isCommaSeparatedInput;
            vm.commaSeparatedValues = vm.condition.values.join(",");
        }

        function addToFilter() {
            if (vm.commaSeparatedValues && vm.commaSeparatedValues.length > 0) {
                vm.isCommaSeparatedInput = false;
                vm.condition.values = [];
                vm.condition.valueTypes = [];
                var getList = vm.commaSeparatedValues.split(',');
                getList = getList.filter((item, i, ar) => ar.indexOf(item) === i);
                getList.forEach(element => {
                    onContainsAdded({ text: element });
                    vm.condition.values.push(element);
                });
                vm.commaSeparatedValues = '';
            }

        }
    }
})();
