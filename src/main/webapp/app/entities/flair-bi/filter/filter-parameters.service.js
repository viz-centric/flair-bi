(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('filterParametersService', filterParametersService);

    filterParametersService.$inject = ['$rootScope', 'CryptoService', 'ConditionExpression', 'FILTER_TYPES'];

    function filterParametersService($rootScope, CryptoService, ConditionExpression, FILTER_TYPES) {

        var paramObject = {};

        var service = {
            get: get,
            save: save,
            clear: clear,
            getConditionExpression: getConditionExpression,
            getFiltersCount:getFiltersCount
        };



        return service;

        ////////////////

        /**
         * Return whole filter object or just part of it
         */
        function get(section) {
            if (section) {
                return paramObject[section] || paramObject[section.toLowerCase()];
            }
            return paramObject;
        }

        function save(newValue) {
            paramObject = newValue;
            $rootScope.$broadcast('filterParametersService:filter-changed', paramObject);
        }

        function clear() {
            paramObject = {};
            $rootScope.$broadcast('filterParametersService:filter-changed', paramObject);
            $rootScope.filterSelection = {
                id: null,
                lasso: false,
                filter: {}
            };
        }

        function getConditionExpression() {
            var condition = {
                expression: null
            };
            for (var name in paramObject) {
                if (paramObject.hasOwnProperty(name) &&
                    paramObject[name] &&
                    paramObject[name].length > 0) {
                    if (!condition.expression) {
                        condition = new ConditionExpression(CryptoService.UUIDv4, {
                            '@type': 'Contains',
                            values: paramObject[name],
                            featureName: name
                        });
                    } else {
                        condition.addNewExpression({
                            '@type': 'Contains',
                            values: paramObject[name],
                            featureName: name
                        });
                    }
                }
            }

            return {
                conditionExpression: condition.expression,
                sourceType: FILTER_TYPES.FILTER
            };
        }

        function getFiltersCount(){
            var size = 0, key;
            for (key in paramObject) {
                if (paramObject.hasOwnProperty(key)) size++;
            }
            return size;
        }

    }
})();
