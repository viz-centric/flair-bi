(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('filterParametersService', filterParametersService);

    filterParametersService.$inject = ['$rootScope', 'CryptoService', 'ConditionExpression', 'FILTER_TYPES', 'COMPARABLE_DATA_TYPES'];

    function filterParametersService($rootScope, CryptoService, ConditionExpression, FILTER_TYPES, COMPARABLE_DATA_TYPES) {

        var paramObject = {};
        var dateRangePrefix='date-range';
        var selectedFilters={};
        var dynamicDateRangeToolTip={};
        var dynamicDateRangeMetaData={};

        var service = {
            get: get,
            save: save,
            clear: clear,
            getConditionExpression: getConditionExpression,
            getConditionExpressionForParams: getConditionExpressionForParams,
            getFiltersCount:getFiltersCount,
            getDateRangePrefix:getDateRangePrefix,
            changeDateFormat:changeDateFormat,
            buildDateRangeFilterName:buildDateRangeFilterName,
            getSelectedFilter:getSelectedFilter,
            saveSelectedFilter:saveSelectedFilter,
            getComparableDataTypes:getComparableDataTypes,
            saveDynamicDateRangeToolTip:saveDynamicDateRangeToolTip,
            getDynamicDateRangeToolTip:getDynamicDateRangeToolTip,
            resetDynamicDateRangeToolTip:resetDynamicDateRangeToolTip,
            saveDynamicDateRangeMetaData : saveDynamicDateRangeMetaData,
            getDynamicDateRangeMetaData : getDynamicDateRangeMetaData,
            buildFilterCriteriasForDynamicDateRange : buildFilterCriteriasForDynamicDateRange,
            isDateType : isDateType,
            dateToString
        };



        return service;

        ////////////////

        function dateToString(date) {
            return moment(date).utc().format('YYYY-MM-DD HH:mm:ss.SSS000');
        }

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
            resetDynamicDateRangeToolTip();
        }

        function createBetweenExpressionBody(value, secondValue, featureName, dataType,activeTab) {
          var result = {
            '@type': 'Between',
            value: value,
            secondValue: secondValue,
            activeTab : activeTab,
            featureName: featureName
          };
          if (dataType) {
              result.valueType = {value: value, type: dataType, '@type': 'valueType'};
              result.secondValueType = {value: secondValue, type: dataType, '@type': 'valueType'};
          }
          return result;
        }

        function createContainsExpressionBody(values, featureName, dataType) {
            var ret = {
                '@type': 'Contains',
                values: values,
                featureName: featureName
            };
            if (dataType) {
                ret.valueTypes = values.map(function (item) {
                    return {
                        '@type': 'valueType',
                        value: item,
                        type: dataType
                    };
                });
            }
            return ret;
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

        function createCompareFeaturePropertyExpressionBody(value, featureName) {
            const featureNameArr = featureName.split('.');
            const valueArr = value.split('.');
            return {
                '@type': 'Compare',
                comparatorType: 'EQ',
                valueType: {
                    '@type': 'featureValueType',
                    value: valueArr[1],
                    table: valueArr[0]
                },
                featureProperty: {
                    property: featureNameArr[1],
                    table: featureNameArr[0]
                }
            };
        }

        function createCompareExpressionBodyForInterval(value, featureName, interval, operator) {
            return {
                '@type': 'Between',
                featureName: featureName,
                valueType: {
                    '@type': 'intervalValueType',
                    operator: operator,
                    interval: interval,
                    value: value
                },
                secondValueType: {
                    '@type': 'valueType',
                    value: value
                },
                secondValue: value,
                activeTab : value
            };
        }

        function createBodyExpr(values, name) {
            var meta = values._meta || {};
            var valueType = meta.valueType || '';
            if (name.lastIndexOf(dateRangePrefix, 0) === 0) {
                console.log('create body exp ', values, name);
                if (values[1]) {
                    values = [changeDateFormat(values[0]), changeDateFormat(values[1])];
                } else {
                    values = [changeDateFormat(values[0])];
                }
                name = name.split('|')[1];
            }
            if (valueType === 'compare') {
                console.log('filter-parameters: compare value type values', values);
                return createCompareFeaturePropertyExpressionBody(values[0], values[1]);
            } else if (valueType === 'dateRangeValueType') {
                var dataType = meta.dataType || '';
                console.log('filter-parameters: date range value type values', values);
                if (values.length === 2) {
                    return createBetweenExpressionBody(values[0], values[1], name, dataType,values[2]);
                } else {
                    return createCompareExpressionBody(values[0], name, dataType);
                }
            } else if (valueType === 'valueType' || valueType === 'castValueType') {
                var dataType = meta.dataType || '';
                console.log('filter-parameters: value type values', values, dataType);
                return createContainsExpressionBody(values, name, dataType);
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
            const params = paramObject || {};
            const paramsArray = Object.keys(params).map((key) => {
                const o = {};
                o[key] = params[key];
                return o;
            });
            return getConditionExpressionForParams(additionalFeaturesArray, paramsArray);
        }

        function getConditionExpressionForParams(params, sourceParams) {
            const finalParams = (params || []).concat(sourceParams || []);

            var body;
            var condition = {
                expression: null
            };
            for (var data of finalParams) {
                var name = Object.keys(data)[0];
                var values = data[name];
                if (values.length > 0) {
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

        function saveDynamicDateRangeToolTip(dynamicDateRangeToolTipTemp){
            dynamicDateRangeToolTip[dynamicDateRangeToolTipTemp.name] = dynamicDateRangeToolTipTemp.text;
        }

        function getDynamicDateRangeToolTip(dimensionName){
            if(dynamicDateRangeToolTip[dimensionName]){
                return dynamicDateRangeToolTip[dimensionName];
            }else{
                return '';
            }

        }
        function resetDynamicDateRangeToolTip(){
            dynamicDateRangeToolTip={};
        }

        function saveDynamicDateRangeMetaData(dimensionName,metaData){
            dynamicDateRangeMetaData[dimensionName] = metaData;
        }

        function getDynamicDateRangeMetaData(dimensionName){
            if(dynamicDateRangeMetaData[dimensionName]){
                return dynamicDateRangeMetaData[dimensionName];
            }else{
                return '';
            }
        }

        function buildFilterCriteriasForDynamicDateRange(dimensionName){
            if(dynamicDateRangeMetaData[dimensionName]){
                var metaData = dynamicDateRangeMetaData[dimensionName];
                var isCustom = metaData.currentDynamicDateRangeConfig.isCustom ? "true" : "false";
                return isCustom +"||"+ metaData.customDynamicDateRange +"||"+ metaData.currentDynamicDateRangeConfig.title;
            }else{
                return null;
            }
        }

        function isDateType(dimension) {
            var type = dimension && dimension.type;
            if (!type) {
                return false;
            }
            return COMPARABLE_DATA_TYPES.indexOf(type.toLowerCase()) > -1;
        }
    }
})();
