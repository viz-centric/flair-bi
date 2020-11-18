(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('filterParametersService', filterParametersService);

    filterParametersService.$inject = ['$rootScope', 'CryptoService', 'ConditionExpression', 'FILTER_TYPES', 'COMPARABLE_DATA_TYPES','DYNAMIC_DATE_RANGE_CONFIG','Features'];

    function filterParametersService($rootScope, CryptoService, ConditionExpression, FILTER_TYPES, COMPARABLE_DATA_TYPES,DYNAMIC_DATE_RANGE_CONFIG,Features) {

        var paramObject = {};
        var selectedFilters={};
        var groupFilters = [];
        var dynamicDateRangeToolTip={};
        var dynamicDateRangeMetaData={};

        var service = {
            get: get,
            save: save,
            clear: clear,
            getConditionExpression: getConditionExpression,
            getConditionExpressionForParams: getConditionExpressionForParams,
            getFiltersCount:getFiltersCount,
            changeDateFormat:changeDateFormat,
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
            isDateFilterType : isDateFilterType,
            dateToString,
            applyDefaultFilters : applyDefaultFilters,
            applyViewFeatureCriteria : applyViewFeatureCriteria,
            removeFilterInIframeURL: removeFilterInIframeURL,
            setFilterInIframeURL: setFilterInIframeURL,
            removeURLParameter : removeURLParameter,
            getParameterByName : getParameterByName,
            getFilterURL : getFilterURL,
            saveGroupFilter,
            getGroupFilters,
        };



        return service;

        ////////////////

        function dateToString(date) {
            return moment(date).utc().format('YYYY-MM-DD HH:mm:ss.000000');
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
            groupFilters = [];
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

        function createCompareExpressionBodyForInterval(initialValue, endValue, featureName, interval, operator) {
            return {
                '@type': 'Between',
                featureName: featureName,
                valueType: {
                    '@type': 'intervalValueType',
                    operator: operator,
                    interval: interval,
                    value: initialValue
                },
                secondValueType: {
                    '@type': 'valueType',
                    value: endValue
                },
                secondValue: initialValue,
                activeTab : initialValue
            };
        }

        function createBodyExpr(values, name) {
            var meta = values._meta || {};
            var valueType = meta.valueType || '';
            var type = meta ? meta.dataType : '';
            if (isDateFilterType(type) && type === "dateRangeValueType") {
                console.log('create body exp ', values, name);
                if (values[1]) {
                    values = [changeDateFormat(values[0]), changeDateFormat(values[1])];
                } else {
                    values = [changeDateFormat(values[0])];
                }
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
                var endValue = meta.endValue;
                var value = values[0];
                console.log('interval value type value', value, 'operator', operator, 'initialValue', initialValue, 'endValue', endValue);
                return createCompareExpressionBodyForInterval(initialValue, endValue, name, value, operator);
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

        function isDateFilterType(type){
            if (!type) {
                return false;
            }
            return COMPARABLE_DATA_TYPES.indexOf(type.toLowerCase()) > -1;
        }

        function applyDefaultFilters(excluded, featureEntities) {
            const filterParameters = get();
            const mandatoryDimensions = featureEntities
                .filter(function (item) {
                    return !excluded.includes(item);
                })
                .filter(function (item) {
                    return item.featureType === "DIMENSION" && item.dateFilter === "ENABLED";
                })
                .filter(function (item) {
                    return !filterParameters[item.name];
                });

            if (mandatoryDimensions.length > 0) {
                const filterParameters = getSelectedFilter();
                mandatoryDimensions.forEach(function (item) {
                    var startDate = new Date();
                    startDate.setDate(startDate.getDate() - 1);
                    item.selected = dateToString(startDate);
                    item.selected2 = dateToString(new Date());
                    item.metadata = {
                        dateRangeTab: 1,
                        customDynamicDateRange: 1,
                        currentDynamicDateRangeConfig: {}
                    };
                    delete filterParameters[item.name]
                    addDefaultDateRangeFilter(filterParameters, item.selected, item);
                    addDefaultDateRangeFilter(filterParameters, item.selected2, item);
                });
                saveSelectedFilter(filterParameters);
                save(getSelectedFilter());
            }
        }

        function applyViewFeatureCriteria(featureCriterias,featureEntities) {
            const viewFeatureCriterias = featureCriterias;
            if (viewFeatureCriterias.length > 0) {
                const filters = getSelectedFilter();
                viewFeatureCriterias.forEach(criteria => {
                    const feature = featureEntities.filter((item) => item.name === criteria.feature.name)[0];
                    const data = parseViewFeatureMetadata(criteria.metadata, feature, criteria.value, feature.name);
                    console.log('applyViewFeatureCriteria: feature', feature, 'data', data);
                    feature.selected = data.selected[0];
                    feature.selected2 = data.selected[1];
                    feature.metadata = data.metadata.metadata;
                    if (data.dateRangeTab === 2) {
                        saveDynamicDateRangeMetaData(feature.name, data.metadata.metadata);
                        saveDynamicDateRangeToolTip(data.tooltipObj);
                    }
                    delete filters[feature.name]
                    addDefaultDateRangeFilter(filters, data.values[0], feature);
                    addDefaultDateRangeFilter(filters, data.values[1], feature);
                });
                saveSelectedFilter(filters);
                save(getSelectedFilter());
            }
            return viewFeatureCriterias.map((criteria) => criteria.feature.name);
        }

        function parseViewFeatureMetadata(metadata, feature, value, filterName) {
            console.log('parseViewFeatureMetadata', arguments);
            var dynamics;
            var tooltipText;
            var dynamicDateRangeToolTip;
            var dynamicDateRangeObject;
            var daterange = value.split("||");
            var selected;
            if (metadata) {
                dynamics = metadata.split("||");
                tooltipText = dynamics[0] === "true" ? 'Last ' + dynamics[1] : dynamics[2];
                dynamicDateRangeToolTip = { name: filterName, text: tooltipText };
                dynamicDateRangeObject = buildDynamicDateRangeObject(feature.name, dynamics[2], dynamics[1]);
                selected = {};
            } else {
                dynamicDateRangeObject = {
                    dimensionName: feature.name,
                    metadata: {
                        dateRangeTab: daterange.length === 1 ? 0 : 1,
                        customDynamicDateRange: 1,
                        currentDynamicDateRangeConfig: {}
                    }
                };
                selected = daterange;
            }

            return {
                values: daterange,
                metadataValues: dynamics,
                tooltip: tooltipText,
                tooltipObj: dynamicDateRangeToolTip,
                metadata: dynamicDateRangeObject,
                selected: selected
            };
        }

        function buildDynamicDateRangeObject(dimensionName, title, customDynamicDateRange) {
            var metaData = { dimensionName: dimensionName, metadata: { currentDynamicDateRangeConfig: {}, customDynamicDateRange: customDynamicDateRange, dateRangeTab: 2 } };
            var configs = DYNAMIC_DATE_RANGE_CONFIG.filter(function (item) {
                return item.title === title;
            });
            metaData.metadata.currentDynamicDateRangeConfig = configs[0];
            return metaData;
        }

        function addDefaultDateRangeFilter(filterParameters, date, feature) {
            const name = feature.name;
            const type = feature.type;
            if (!filterParameters[name]) {
                filterParameters[name] = [];
            }
            filterParameters[name].push(date);
            filterParameters[name]._meta = {
                dataType: type,
                valueType: 'dateRangeValueType'
            };
        }

        function setFilterInIframeURL(iframes, filterDimensions) {
            var filters= get();
            var filtersList = Object.keys(filters);
            if (filtersList.length > 0) {
               
                if(iframes){
                    iframes.forEach(element => {
                        var id = getParameterByName('datasourceId', element.properties[0].value)
                        validateFilter(id, filtersList, filterDimensions, filters, element);
                    });
                }
            }
        }

        function getGroupFilters() {
            return groupFilters;
        }

        function saveGroupFilter(filterType) {
            if (!filterType) {
                groupFilters.length = 0;
            } else {
                groupFilters[0] = {
                    type: 'grouping',
                    groupType: filterType,
                };
            }
        }

        function getFilterURL(filterDimensions) {
            var filters = get();
            var filtersList = Object.keys(filters);
            var filterUrl = {};
            filtersList.forEach(item => {
                if (filters[item]._meta.valueType === "dateRangeValueType") {
                    filterUrl[item] = setDateFilterValue(filterDimensions, item, filters);
                } else {
                    filterUrl[item] = Array(filters[item]);
                }
            });
            filterUrl = "&filters=" + JSON.stringify(filterUrl);
            filtersList.forEach(item => {
                filterUrl = filterUrl.replace("[[", "[").replace("]]", "]");
            });
            return filterUrl;
        }

        function getDateFilterValue(filterDimensions, dimension) {
            return filterDimensions.filter(function (item) {
                return item.name === dimension;
            })

        }
        function validateFilter(id, filtersList, filterDimensions, filters, element) {
            if (id) {
                Features.query(
                    {
                        datasource: id,
                        featureType: "DIMENSION"
                    },
                    function (dimensions) {
                        var filterUrl = {};
                        filtersList.forEach(item => {
                            var validadimension = getDimensionMetaData(dimensions, item);
                            if (validadimension.length > 0) {
                                if (filters[item]._meta.valueType === "dateRangeValueType") {
                                    filterUrl[item] = setDateFilterValue(filterDimensions, item, filters);
                                }
                                else {
                                    filterUrl[item] = Array(filters[item]);
                                }
                            }
                        });
                        var url = removeURLParameter(element.properties[0].value, "filters");
                        filterUrl = url + "&filters=" + JSON.stringify(filterUrl);
                        filtersList.forEach(item => {
                            filterUrl = filterUrl.replace("[[", "[").replace("]]", "]");
                        });
                        element.properties[0].value = filterUrl;
                        $rootScope.$broadcast("update-widget-content-" + element.id);
                    },
                    function (_) { }
                );
            }
        }

        function setDateFilterValue(filterDimensions, item, filters) {
            var isfilterDimensions = getDateFilterValue(filterDimensions, item);
            var type = "date-range";
            var value;
            if (isfilterDimensions[0].metadata.dateRangeTab === 2) {
                type = "custom-date";
                value = [isfilterDimensions[0].metadata.currentDynamicDateRangeConfig.title];
                if (isfilterDimensions[0].metadata.currentDynamicDateRangeConfig.title === "Custom X days" || isfilterDimensions[0].metadata.currentDynamicDateRangeConfig.title === "Custom X hours") {
                    value = [isfilterDimensions[0].metadata.currentDynamicDateRangeConfig.title, isfilterDimensions[0].metadata.customDynamicDateRange]
                }
            }
            else {
                value = [filters[item][0], filters[item][1]]
            }

            return {
                value: value,
                type: type
            }
        }
        function getDimensionMetaData(dimensions, dimension) {
            return dimensions.filter(function (item) {
                return item.name === dimension
            })

        }

        function removeFilterInIframeURL(iframes) {
            if(iframes){
                iframes.forEach(element => {
                    element.properties[0].value = removeURLParameter(element.properties[0].value, "filters");
                    $rootScope.$broadcast("update-widget-content-" + element.id);
                    
                });
            }
        }

        function removeURLParameter(url, parameter) {
            var urlparts = url.split('?');
            if (urlparts.length >= 2) {

                var prefix = encodeURIComponent(parameter) + '=';
                var pars = urlparts[1].split(/[&;]/g);

                for (var i = pars.length; i-- > 0;) {
                    if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                        pars.splice(i, 1);
                    }
                }

                url = urlparts[0] + '?' + pars.join('&');
                return url;
            } else {
                return url;
            }
        }

        function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }

    }
})();
    
