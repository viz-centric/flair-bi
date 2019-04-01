(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateLineChart', GenerateLineChart);

    GenerateLineChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateLineChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
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
                if ((!record.data) || ((record.data instanceof Array) && (!record.data.length))) {
                    element.css({
                        'display': 'flex',
                        'align-items': 'center',
                        'justify-content': 'center'
                    });

                    element[0].innerHTML = "Data not available";

                    return;
                }

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        allMeasures = [],
                        colorSet = D3Utils.getDefaultColorset();

                    result['dimension'] = D3Utils.getNames(dimensions);
                    result['measure'] = D3Utils.getNames(measures);

                    result['maxMes'] = measures.length;

                    result['xAxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
                    result['yAxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
                    result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
                    result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
                    result['xAxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
                    result['yAxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
                    result['legend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
                    result['grid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');
                    result['stacked'] = VisualizationUtils.getPropertyValue(record.properties, 'Stacked');

                    result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');
                    result['measureShowValue'] = [];
                    result['measureDisplayName'] = [];
                    result['measureFontStyle'] = [];
                    result['measureFontWeight'] = [];
                    result['measureFontSize'] = [];
                    result['measureNumberFormat'] = [];
                    result['measureTextColor'] = [];
                    result['measureDisplayColor'] = [];
                    result['measureBorderColor'] = [];
                    result['measureLineType'] = [];
                    result['measurePointType'] = [];

                    for (var i = 0; i < result.maxMes; i++) {
                        eachMeasure = {};

                        result['measureShowValue'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                        result['measureDisplayName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name'));
                        result['measureFontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['measureFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['measureFontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                        result['measureNumberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['measureTextColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['measureDisplayColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour'));
                      //  result['measureDisplayColor'].push(( result['measureDisplayColor'] == null) ? colorSet[i] : result['measureDisplayColor']);
                        result['measureBorderColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour'));
                     //   result['measureBorderColor'].push(( result['measureBorderColor'] == null) ? colorSet[i] : eresult['measureBorderColor']);
                        result['measureLineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type'));
                        result['measurePointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));

                    }

                    result['measureProp'] = allMeasures;

                    return result;
                }


                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var line = $rootScope.updateWidget[record.id];
                        line.update(record.data);
                    }
                } else {
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'pie-' + this.id)
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    var svg = div.append('svg')
                        .attr('width', element[0].clientWidth)
                        .attr('height', element[0].clientHeight)

                    var tooltip = div.append('div')
                        .attr('id', 'tooltip')

                    var tooltip = div.append('div')
                        .attr('class', 'tooltip');

                    var line = flairVisualizations.line()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true);

                    svg.datum(record.data)
                        .call(line);

                    $rootScope.updateWidget[record.id] = line;
                }
            }
        }
    }
})();