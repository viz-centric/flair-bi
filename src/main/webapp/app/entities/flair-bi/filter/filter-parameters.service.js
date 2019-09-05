(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('filterParametersService', filterParametersService);

    filterParametersService.$inject = ['$rootScope', 'CryptoService', 'ConditionExpression', 'FILTER_TYPES'];

    function filterParametersService($rootScope, CryptoService, ConditionExpression, FILTER_TYPES) {

        var paramObject = {};
        var dateRangePrefix='data-range';

        var service = {
            get: get,
            save: save,
            clear: clear,
            getConditionExpression: getConditionExpression,
            getFiltersCount:getFiltersCount,
            getDateRangePrefix:getDateRangePrefix
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
                    if (!condition.expression && name.lastIndexOf(dateRangePrefix, 0) === 0) {
                        condition = new ConditionExpression(CryptoService.UUIDv4, {
                            '@type': 'Between',
                            value: changeDateFormat(paramObject[name][0]),
                            secondValue:changeDateFormat(paramObject[name][1]),
                            featureName: name.split('|')[1]
                        });
                    }else if(!condition.expression && name.lastIndexOf(dateRangePrefix, 0) !== 0) {
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

        function changeDateFormat(date){
        return [ (date.getFullYear()),
                    date.getMonth()+1,
                    date.getDate()].join('-')+
                    ' ' +
                  [ date.getHours(),
                    date.getMinutes(),
                    date.getSeconds()].join(':');
        }

        function getDateRangePrefix(){
            return dateRangePrefix;
        }
    }
})();
