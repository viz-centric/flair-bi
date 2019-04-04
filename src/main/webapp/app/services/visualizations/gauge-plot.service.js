(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateGaugePlot', GenerateGaugePlot);

    GenerateGaugePlot.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateGaugePlot(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel) {
                record.data = [{
                    "order_item_subtotal": 80000,
                    "product_price": 3000
                }];
                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        measures = features.measures;

                    result['measures'] = D3Utils.getNames(measures);

                    result['gaugeType'] = VisualizationUtils.getPropertyValue(record.properties, 'Gauge Type').toLowerCase();

                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name');
                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                    result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                    result['displayColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                    result['isGradient'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Enable Gradient Color');
                    result['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');

                    result['targetDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display name');
                    result['targetFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font style');
                    result['targetFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font weight');
                    result['targetShowValues'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Value on Points');
                    result['targetDisplayColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display colour');
                    result['targetTextColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Text colour');
                    result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                    return result;
                }

                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var gauge = $rootScope.updateWidget[record.id];
                        gauge.update(record.data);
                    }
                } else {
                    d3.select(element[0]).html('')
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'gauge-' + element[0].id)
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    var svg = div.append('svg')

                    var tooltip = div.append('div')
                        .attr('id', 'tooltip')

                    var gauge = flairVisualizations.gauge()
                        .config(getProperties(VisualizationUtils, record));
                     
                    svg.datum(record.data)
                        .call(gauge);

                    $rootScope.updateWidget[record.id] = gauge;
                }
            }
        }
    }
})();