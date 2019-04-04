(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateHeatmap', GenerateHeatmap);

    GenerateHeatmap.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateHeatmap(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel) {
                record.data = [{
                    "order_status": "Kathmandu",
                    "order_item_subtotal": 50000,
                    "product_price": 80000
                }, {
                    "order_status": "Delhi",
                    "order_item_subtotal": 90100,
                    "product_price": 14480
                }, {
                    "order_status": "Detroit",
                    "order_item_subtotal": 914120,
                    "product_price": 801470
                }, {
                    "order_status": "London",
                    "order_item_subtotal": 21140,
                    "product_price": 50220
                }, {
                    "order_status": "Washington",
                    "order_item_subtotal": 37700,
                    "product_price": 60770
                }, {
                    "order_status": "Berlin",
                    "order_item_subtotal": 17720,
                    "product_price": 50770
                }, {
                    "order_status": "Perth",
                    "order_item_subtotal": 17710,
                    "product_price": 87770
                }, {
                    "order_status": "Ottawa",
                    "order_item_subtotal": 18770,
                    "product_price": 97770
                }];

                function getProperties(VisualizationUtils, record) {
                   
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        allMeasures = [];

                    result['dimension'] = [D3Utils.getNames(dimensions)[0]];
                    result['measure'] = D3Utils.getNames(measures);
                    result['maxMes'] = measures.length;
                    result['dimLabelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');
                    result['fontStyleForDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                    result['fontWeightForDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                    result['fontSizeForDimension'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                    result['displayNameForMeasure'] = [];
                    result['showValues'] = [];
                    result['showIcon'] = [];
                    result['valuePosition'] = [];
                    result['iconName'] = [];
                    result['iconFontWeight'] = [];
                    result['iconPosition'] = [];
                    result['iconColor'] = [];
                    result['colourCoding'] = [];
                    result['valueTextColour'] = [];
                    result['fontStyleForMeasure'] = [];
                    result['fontWeightForMeasure'] = [];
                    result['fontSizeForMeasure'] = [];
                    result['numberFormat'] = [];

                    for (var i = 0; i < result.maxMes; i++) {
                        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name'));
                        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                        result['showIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Icon'));
                        result['valuePosition'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Alignment'));
                        result['iconName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                        result['iconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
                        result['iconPosition'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position'));
                        result['iconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['colourCoding'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Color Coding'));
                        result['valueTextColour'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                    }
                    return result;

                }

                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var heatmap = $rootScope.updateWidget[record.id];
                        heatmap.update(record.data);
                    }
                } else {
                    d3.select(element[0]).html('')
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'heatmap-' + element[0].id)
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

                    var heatmap = flairVisualizations.heatmap()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true);

                    svg.datum(record.data)
                        .call(heatmap);

                    $rootScope.updateWidget[record.id] = heatmap;
                }
            }
        }
    }
})();