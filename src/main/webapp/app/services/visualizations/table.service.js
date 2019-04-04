(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateTable', GenerateTable);

    GenerateTable.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateTable(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel) {
                record.data = [{
                    "order_status": "Kathmandu",
                    "order_item_subtotal": 50,
                    "product_price": 80
                }, {
                    "order_status": "Delhi",
                    "order_item_subtotal": 90,
                    "product_price": 80
                }, {
                    "order_status": "Detroit",
                    "order_item_subtotal": 910,
                    "product_price": 800
                }, {
                    "order_status": "London",
                    "order_item_subtotal": 240,
                    "product_price": 500
                }, {
                    "order_status": "Washington",
                    "order_item_subtotal": 300,
                    "product_price": 600
                }, {
                    "order_status": "Berlin",
                    "order_item_subtotal": 120,
                    "product_price": 500
                }, {
                    "order_status": "Perth",
                    "order_item_subtotal": 110,
                    "product_price": 80
                }, {
                    "order_status": "Ottawa",
                    "order_item_subtotal": 180,
                    "product_price": 90
                }];
                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures;

                    result['dimensions'] = D3Utils.getNames(dimensions);
                    result['measures'] = D3Utils.getNames(measures);

                    result['maxDim'] = dimensions.length;
                    result['maxMes'] = measures.length;


                    result["dimension"] = [];
                    result["displayNameForDimension"] = [];
                    result["cellColorForDimension"] = [];
                    result["fontStyleForDimension"] = [];
                    result["fontWeightForDimension"] = [];
                    result["fontSizeForDimension"] = [];
                    result["textColorForDimension"] = [];
                    result["textColorExpressionForDimension"] = [];
                    result["textAlignmentForDimension"] = [];

                    result["measure"] = [];
                    result["displayNameForMeasure"] = [];
                    result["cellColorForMeasure"] = [];
                    result["cellColorExpressionForMeasure"] = [];
                    result["fontStyleForMeasure"] = [];
                    result["fontSizeForMeasure"] = [];
                    result["fontWeightForMeasure"] = [];
                    result["numberFormatForMeasure"] = [];
                    result["textColorForMeasure"] = [];
                    result["textAlignmentForMeasure"] = [];
                    result["textColorExpressionForMeasure"] = [];
                    result["iconNameForMeasure"] = [];
                    result["iconFontWeight"] = [];
                    result["iconColor"] = [];
                    result["iconPositionForMeasure"] = [];
                    result["iconExpressionForMeasure"] = [];

                    for (var i = 0; i < result.maxDim; i++) {

                        result['dimension'].push(result['dimensions'][i]);
                        result['displayNameForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name'));
                        result['cellColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Cell colour'));
                        result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                        result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                        result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                        result['textColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                        result['textColorExpressionForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour expression'));
                        result['textAlignmentForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Alignment'));
                    }

                    for (var i = 0; i < result.maxMes; i++) {
                        result['measure'].push(result['measures'][i]);
                        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name'));
                        result['cellColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour'));
                        result['cellColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour expression'));
                        result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                        result['numberFormatForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['textColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['textAlignmentForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment').toLowerCase());
                        result['textColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                        result['iconNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                        result['iconPositionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position'));
                        result['iconExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                    }

                    return result;
                }

                d3.select(element[0]).html('')
                var div = d3.select(element[0]).append('div')
                    .attr('id', 'table-'+element[0].id)
                    .attr('width', element[0].clientWidth)
                    .attr('height', element[0].clientHeight)
                    .style('overflow', 'hidden')
                    .style('text-align', 'center')
                    .style('position', 'relative');

                var table = flairVisualizations.table()
                    .config(getProperties(VisualizationUtils, record))

                div.datum(record.data)
                    .call(table);
            }
        }
    }
})();