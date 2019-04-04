(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateTreemap', GenerateTreemap);

    GenerateTreemap.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateTreemap(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel) {
                record.data = [{
                    "order_status": "Panding",
                    "product_name": "Product 1",
                    "product_price": 100
                }, {
                    "order_status": "Panding",
                    "product_name": "Product 2",
                    "product_price": 200
                }, {
                    "order_status": "Panding",
                    "product_name": "Product 3",
                    "product_price": 300
                }, {
                    "order_status": "Payment Review",
                    "product_name": "Product 4",
                    "product_price": 400
                }, 
                {
                    "order_status": "Payment Review",
                    "product_name": "Product 5",
                    "product_price": 500
                },
                {
                    "order_status": "Payment Review",
                    "product_name": "Product 6",
                    "product_price": 600
                },
                
                {
                    "order_status": "Open",
                    "product_name": "Product 7",
                    "product_price": 700
                }];
                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures;

                    result['maxDim'] = dimensions.length;
                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                    result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                    result['valueTextColour'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                    result['fontStyleForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                    result['fontWeightForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                    result['fontSizeForMes'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size'));
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                    result['measure'] = [measures[0].feature.name];
                    result['dimension'] = [];
                    result['showLabelForDimension'] = [];
                    result['labelColorForDimension'] = [];
                    result['fontStyleForDimension'] = [];
                    result['fontWeightForDimension'] = [];
                    result['fontSizeForDimension'] = [];
                    result['displayColor'] = [];

                    for (var i = 0, j = ''; i < result.maxDim; i++ , j = i + 1) {
                        result['dimension'].push(dimensions[i].feature.name);
                        result['showLabelForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
                        result['labelColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Colour of labels'));
                        result['displayColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour'));
                        result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                        result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                        result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                    }

                    return result;
                }

                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var treemap = $rootScope.updateWidget[record.id];
                        treemap.update(record.data);
                    }
                } else {
                    d3.select(element[0]).html('')
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'treemap-' + element[0].id)
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    var svg = div.append('svg');

                    var tooltip = div.append('div')
                        .attr('id', 'tooltip');

                    var treemap = flairVisualizations.treemap()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true);

                    svg.datum(record.data)
                        .call(treemap);

                    $rootScope.updateWidget[record.id] = treemap;
                }
            }
        }
    }
})();