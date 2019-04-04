(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateSankey', GenerateSankey);

    GenerateSankey.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateSankey(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
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
                        measure = features.measures;

                    result['dimension'] = D3Utils.getNames(dimensions);
                    result['measure'] = D3Utils.getNames(measure)[0];

                    result['maxDim'] = dimensions.length;
                    result['maxMes'] = measure.length;

                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                    result['displayColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display colour');
                    result['borderColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Border colour');
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');
                    result['showLabels'] = [];
                    result['fontStyle'] = [];
                    result['fontWeight'] = [];
                    result['fontSize'] = [];
                    result['textColor'] = [];
                    for (var i = 0; i < result.maxDim; i++) {
                        result['showLabels'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                    }
                    return result;
                }

                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var sankey = $rootScope.updateWidget[record.id];
                        sankey.update(record.data);
                    }
                } else {
                    d3.select(element[0]).html('')
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'sankey-' + element[0].id)
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    var svg = div.append('svg')

                    var tooltip = div.append('div')
                        .attr('id', 'tooltip')

                    var sankey = flairVisualizations.sankey()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true);

                    svg.datum(record.data)
                        .call(sankey);

                    $rootScope.updateWidget[record.id] = sankey;
                }
            }
        }
    }
})();
