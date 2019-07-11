(function () {
    /**
     * Wrapper around visual metadata entity to enhance with additional helper methods for manipulating with
     * it's data
     */
    'use strict';
    angular
        .module('flairbiApp')
        .constant('VisualWrap', VisualWrap);


    /**
     * Attaches additional functionality to Visual metadata entity
     *
     * @param {any} visual : visual metadata entity
     * @returns  same entity with additional methods
     */
    function VisualWrap(visual) {
        visual.getChartPropertyValue = getChartPropertyValue;
        visual.doesPropertyExists = doesPropertyExists;
        visual.fieldPropertyExists = fieldPropertyExists;
        visual.getFieldPropertyValue = getFieldPropertyValue;
        visual.getQueryParameters = getQueryParameters;
        visual.hasDimension = hasDimension;
        visual.canBuild = canBuild;
        visual.getSharePath = getSharePath;
        visual.nextFieldDimension = nextFieldDimension;
        visual.nextFieldMeasure = nextFieldMeasure;
        visual.constructMeasureField=constructMeasureField;
        return visual;
    }

    /**
     * Gives next field type of feature type dimension
     * can be null
     *
     * @returns next field type of feature type dimension, can be null
     */
    function nextFieldDimension() {
        var dimensionFields = this.fields.filter(function (item) {
            return item.fieldType.featureType === 'DIMENSION';
        });

        var dimensionFieldTypes = this.metadataVisual.fieldTypes.filter(function (item) {
            return item.featureType === 'DIMENSION';
        });


        return nextFeature(dimensionFields, dimensionFieldTypes);
    }

    function nextFeature(fields, fieldTypes) {
        var i = 0;
        var run = true;

        while (run) {
            var field = fields[i];
            var fieldType = fieldTypes[i];

            if (field && fieldType && field.fieldType.id === fieldType.id) {
                i++;
            } else {
                run = false;
            }
        }

        return fieldTypes[i];
    }

    /**
     * return next field type of feature type measure
     *
     * @returns next field type measure or null
     */
    function nextFieldMeasure() {
        var measureFields = this.fields.filter(function (item) {
            return item.fieldType.featureType === 'MEASURE';
        });

        var measureFieldTypes = this.metadataVisual.fieldTypes.filter(function (item) {
            return item.featureType === 'MEASURE';
        });
        return nextFeature(measureFields, measureFieldTypes);
    }

    /**
     * @return url location of this visual metadata
     */
    function getSharePath(datasource) {
        return '/visual/' + this.id + "?datasource=" + datasource.id;
    }

    /**
     * Checks if visualization can be built
     *
     * @returns true or false
     */
    function canBuild() {
        if (!this.fields) {
            return false;
        }
        var canBeBuilt = true;
        this.fields.forEach(function (item) {
            if (item.constraint === 'REQUIRED' && (item.feature === null || angular.isUndefined(item.feature))) {
                canBeBuilt = false;
                return;
            }
        });
        return canBeBuilt;
    }

    function hasDimension(dimensionName) {
        return this.fields.filter(function (item) {
            return item.feature && item.feature.name === dimensionName;
        }).length !== 0;
    }

    function getChartPropertyValue(propertyName, orElse) {
        return getProperty(this.properties, propertyName, orElse);
    }

    function doesPropertyExists(propertyName) {
        var prop = getProperty(this.properties, propertyName);
        return prop && prop !== null;
    }

    function fieldPropertyExists(fieldOrder, propertyName) {
        var prop = this.getFieldPropertyValue(fieldOrder, propertyName);
        return prop && prop !== null;
    }

    function getFieldPropertyValue(fieldOrder, propertyName, orElse) {
        return getFieldProperty(this.fields, fieldOrder, propertyName, orElse);
    }

    function getFieldProperty(fields, fieldOrder, propertyName, orElse) {
        var field = fields
            .filter(function (item) {
                return item.fieldType.order === fieldOrder;
            })[0];

        if (!field) {
            return resolveOrElse(orElse);
        }

        return getProperty(field.properties, propertyName, orElse);
    }


    function constructDimensionField(fieldDimension, filters) {
        if (fieldDimension.hierarchy) {
            fieldDimension.hierarchy.drilldown =
                fieldDimension.hierarchy.drilldown.sort(function (a, b) {
                    return a.order - b.order;
                });
            var featureDrillDown =
                fieldDimension.hierarchy.drilldown.filter(function (item, index) {
                    return fieldDimension.feature.name === item.feature.name;
                })[0];

            if (featureDrillDown) {
                return drillDown(featureDrillDown, fieldDimension.hierarchy, filters);
            }
        }
        return fieldDimension.feature.name;
    }

    /**
     * Checks whether there is filtering criteria for feature in below current feature
     * in hierarchy specification.
     *
     * @param {any} start :  starting order of dimension
     * @param {any} drilldowns : list of all drill down features of hierarchy
     * @param {any} filters : all filtering criteria.
     * @returns boolean whether there is filtering criteria or not
     */
    function haveFilter(start, drilldowns, filters) {
        for (var index = start + 1; index < drilldowns.length; index++) {
            var element = drilldowns[index];
            var filter = filters[element.feature.name] || filters[element.feature.name.toLowerCase()];
            if (filter && filter.length > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Function that determines which dimension should be chosen to be included in fields
     * based on hierarchy based.
     *
     * @param {any} drillDownFeature : feature that determination is beginning from.
     * @param {any} hierarchy : specification of hierarchy relation between features
     * @param {any} filters : filtering criteria that are used to determine which feature to choose
     * @returns feature in hierarchy that will be chosen as representation
     */

    function drillDown(drillDownFeature, hierarchy, filters) {
        var filter = filters[drillDownFeature.feature.name] || filters[drillDownFeature.feature.name.toLowerCase()];
        if ((filter &&
            filter.length > 0) ||
            haveFilter(drillDownFeature.order, hierarchy.drilldown, filters)) {
            var next = hierarchy.drilldown[drillDownFeature.order + 1];
            if (next) {
                return drillDown(next, hierarchy, filters);
            }
        }
        return drillDownFeature.feature.name;
    }

    /**
     * Helper function to check if feature is dimension
     *
     * @param {any} item : feature to be checked
     * @returns boolean true if its dimension, false otherwise
     */
    function isDimension(item) {
        return item.feature && item.feature != null && item.feature.featureType === 'DIMENSION';
    }

    /**
     * Helper function to check if feature is measure
     *
     * @param {any} item : feature to be checked
     * @returns boolean true if feature is measure, false otherwise
     */
    function isMeasure(item) {
        return item.feature && item.feature != null && item.feature.featureType === 'MEASURE';
    }

    /**
     * Create string representation of measure for retrieving data from backend api
     *
     * @param {any} fieldMeasure : field that has measure attached to it as feature
     * @returns string representation of field
     */
    function constructMeasureField(fieldMeasure) {
        var agg = getProperty(fieldMeasure.properties, 'Aggregation type', null);
        if (agg !== null && agg !== 'NONE') {
            return {
                field: agg + '(' + fieldMeasure.feature.definition + ') as ' + fieldMeasure.feature.name,
                agg: true
            };
        } else {
            return {
                field: fieldMeasure.feature.definition,
                agg: false
            };
        }
    }


    function getQueryParameters(filters, conditionExpression) {
        var query = {};
        var self = this;
        var aggExists = false;


        var dimensions = this.fields
            .filter(isDimension);

        var dimensionFields = dimensions
            .map(function (item) {
                var selectedName = constructDimensionField(item, filters);
                item.feature.selectedName = selectedName;
                return selectedName;
            });

        var measureFields = this.fields
            .filter(isMeasure)
            .map(function (item) {
                var result = constructMeasureField(item);
                if (result.agg) {
                    aggExists = true;
                }
                return result.field;
            });

        query.fields = dimensionFields.concat(measureFields);
        if (aggExists) {
            query.groupBy = dimensionFields;
        }

        query.limit = this.getChartPropertyValue('Limit', 20);

        if (conditionExpression && conditionExpression.conditionExpression && !angular.equals(conditionExpression, {})) {
            query.conditionExpressions = [conditionExpression];
        }

        query.orders = dimensions.filter(function (item) {
            var property = getProperty(item.properties, 'Sort', null);
            return property !== null && property !== 'None';
        }).map(function (item) {
            var property = getProperty(item.properties, 'Sort', null);
            if (property === 'Ascending') {
                return {
                    direction: 'ASC',
                    featureName: item.feature.selectedName
                };
            } else {
                return {
                    direction: 'DESC',
                    featureName: item.feature.selectedName
                };
            }
        });

        return query;
    }

    function getProperty(properties, propertyName, orElse) {
        var props = properties.filter(function (item) {
            //return item.propertyType.name === propertyName;
            return item.propertyType.name.indexOf(propertyName) !== -1;
        });

        var property = props[0];

        if (!property) {
            return resolveOrElse(orElse);
        } else {
            if (property.value && property.value.value) {
                return property.value.value
            } else {
                return property.value;
            }
        }
    }

    function resolveOrElse(orElse) {
        if (isFunction(orElse)) {
            return orElse();
        } else {
            return orElse;
        }
    }

    function isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }
})();
