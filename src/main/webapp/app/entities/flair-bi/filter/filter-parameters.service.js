(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('filterParametersService', filterParametersService);

    filterParametersService.$inject = ['$rootScope', 'CryptoService', 'ConditionExpression', 'FILTER_TYPES'];

    function filterParametersService($rootScope, CryptoService, ConditionExpression, FILTER_TYPES) {

        var paramObject = {};
        var dateRangePrefix='date-range';
        var COMPARABLE_DATA_TYPES = ['timestamp', 'date', 'datetime'];
        var selectedFilters={};

        var service = {
            get: get,
            save: save,
            clear: clear,
            getConditionExpression: getConditionExpression,
            getFiltersCount:getFiltersCount,
            getDateRangePrefix:getDateRangePrefix,
            changeDateFormat:changeDateFormat,
            buildDateRangeFilterName:buildDateRangeFilterName,
            getSelectedFilter:getSelectedFilter,
            saveSelectedFilter:saveSelectedFilter,
            getComparableDataTypes:getComparableDataTypes
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

        function createBetweenExpressionBody(value, secondValue, featureName, dataType) {
          var result = {
            '@type': 'Between',
            value: value,
            secondValue: secondValue,
            featureName: featureName
          };
          if (dataType) {
            result.valueType = {value: value, type: dataType, '@type': 'valueType'};
            result.secondValueType = {value: secondValue, type: dataType, '@type': 'valueType'};
          }
          return result;
        }

        function createContainsExpressionBody(values, featureName) {
            return {
                '@type': 'Contains',
                values: values,
                featureName: featureName
            };
        }

        function createCompareExpressionBody(value, featureName, dataType) {
            return {
                '@type': 'Compare',
                comparatorType: 'GTE',
                value: value,
                valueType: {
                    '@type': 'valueType',
                    value: value,
                    type: dataType
                },
                featureName: featureName
            };
        }

        function createCompareExpressionBodyForInterval(value, featureName, interval, operator) {
            return {
                '@type': 'Compare',
                comparatorType: 'GTE',
                valueType: {
                    '@type': 'intervalValueType',
                    operator: operator,
                    interval: interval,
                    value: value
                },
                featureName: featureName
            };
        }

        function createBodyExpr(values, name) {
            var meta = values._meta || {};
            var valueType = meta.valueType || '';
            if (name.lastIndexOf(dateRangePrefix, 0) === 0) {
                values = [changeDateFormat(values[0]), changeDateFormat(values[1])];
                name = name.split('|')[1];
                setDatesInRightSideFilters(values[0], values[1]);
            }
            if (valueType === 'valueType') {
                var dataType = meta.dataType || '';
                console.log('value type values', values);
                if (values.length === 2) {
                    return createBetweenExpressionBody(values[0], values[1], name, dataType);
                } else {
                    return createCompareExpressionBody(values[0], name, dataType);
                }
            } else if (valueType === 'intervalValueType') {
                var operator = meta.operator;
                var initialValue = meta.initialValue;
                var value = values[0];
                console.log('interval value type value', value, 'operator', operator, 'initialValue', initialValue);
                return createCompareExpressionBodyForInterval(initialValue, name, value, operator);
            }
            return createContainsExpressionBody(values, name);
        }

        function getConditionExpression(additionalFeaturesArray) {
            var body;
            var condition = {
                expression: null
            };
            var finalParams = Object.assign({}, paramObject);
            if (additionalFeaturesArray) {
                for (var i in additionalFeaturesArray) {
                    var additionalFeaturesItem = additionalFeaturesArray[i];
                    finalParams = Object.assign(additionalFeaturesItem, finalParams);
                }
            }
            for (var name in finalParams) {
                if (finalParams.hasOwnProperty(name)
                  && finalParams[name]
                  && finalParams[name].length > 0) {
                    var values = finalParams[name];
                    if (!condition.expression) {
                        body = createBodyExpr(values, name);
                        condition = new ConditionExpression(CryptoService.UUIDv4, body);
                    } else {
                        body = createBodyExpr(values, name);
                        condition.addNewExpression(body);
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
        if((typeof date)=='string'){
            return date;
        }else{
            return [ (date.getFullYear()),
                        date.getMonth()+1,
                        date.getDate()].join('-')+
                        ' ' +
                      [ date.getHours(),
                        date.getMinutes(),
                        date.getSeconds()].join(':');
            }
        }

        function getDateRangePrefix(){
            return dateRangePrefix;
        }

        function setDatesInRightSideFilters(startDate,endDate){
            $rootScope.$broadcast('flairbiApp:filter-set-date-ranges',{startDate:startDate,endDate:endDate});
        }

        function buildDateRangeFilterName(name){
            return dateRangePrefix+"|"+name;
        }

        function getSelectedFilter(){
            return selectedFilters;
        }

        function saveSelectedFilter(selectedF){
            selectedFilters=selectedF;
        }

        function getComparableDataTypes(){
            return COMPARABLE_DATA_TYPES;
        }
    }
})();
