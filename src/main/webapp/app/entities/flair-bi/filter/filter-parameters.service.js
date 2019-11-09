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

        var service = {
            get: get,
            save: save,
            clear: clear,
            getConditionExpression: getConditionExpression,
            getFiltersCount:getFiltersCount,
            getDateRangePrefix:getDateRangePrefix,
            changeDateFormat:changeDateFormat
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
            console.log('save() saving filter', newValue);
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

        function createBetweenExpressionBody(value, secondValue, featureName) {
            return {
                '@type': 'Between',
                value: value,
                secondValue: secondValue,
                featureName: featureName
            };
        }

        function createContainsExpressionBody(values, featureName) {
            return {
                '@type': 'Contains',
                values: values,
                featureName: featureName
            };
        }

        function createCompareExpressionBody(value, featureName) {
            return {
                '@type': 'Compare',
                comparatorType: 'GTE',
                value: value,
                featureName: featureName
            };
        }

        function createBodyExpr(values, name) {
            var meta = values._meta || {};
            var dataType = meta.dataType || '';
            if (COMPARABLE_DATA_TYPES.indexOf(dataType.toLowerCase()) > -1) {
                console.log('getConditionExpression() timestamp expression added!');
                return createCompareExpressionBody(values[0], name);
            } else {
                return createContainsExpressionBody(values, name);
            }
        }

        function getConditionExpression() {
            var body;
            var condition = {
                expression: null
            };
            for (var name in paramObject) {
                if (paramObject.hasOwnProperty(name)
                  && paramObject[name]
                  && paramObject[name].length > 0) {
                    var values = paramObject[name];
                    console.log('getConditionExpression() filter name', name, values);
                    if (!condition.expression) {
                        if (name.lastIndexOf(dateRangePrefix, 0) === 0) {
                            body = createBetweenExpressionBody(changeDateFormat(values[0]),
                              changeDateFormat(values[1]),
                              name.split('|')[1]);
                        } else {
                            body = createBodyExpr(values, name);
                        }
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
    }
})();
