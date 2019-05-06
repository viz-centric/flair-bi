import angular from 'angular';

'use strict';
angular
    .module('flairbiApp')
    .factory('GenerateDoughnutChart', GenerateDoughnutChart);

GenerateDoughnutChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateDoughnutChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimension = features.dimensions,
                    measure = features.measures;

                result['dimension'] = D3Utils.getNames(dimension);
                result['measure'] = D3Utils.getNames(measure);

                result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Display name') || result['dimension'][0];
                result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display name') || result['measure'][0];

                result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font size');
                result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font style');
                result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font weight');
                result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Show Labels');
                result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Colour of labels');

                result['legend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
                result['valueAs'] = VisualizationUtils.getPropertyValue(record.properties, 'Show value as').toLowerCase();
                result['valueAsArc'] = VisualizationUtils.getPropertyValue(record.properties, 'Value as Arc');
                result['valuePosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Value position').toLowerCase();

                return result;
            }


            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var doughnut = $rootScope.updateWidget[record.id];
                    doughnut.update(record.data);
                }
            } else {
                d3.select(element[0]).html('')
                var div = d3.select(element[0]).append('div')
                    .attr('id', 'doughnut-' + element[0].id)
                    .style('width', element[0].clientWidth + 'px')
                    .style('height', element[0].clientHeight + 'px')
                    .style('overflow', 'hidden')
                    .style('text-align', 'center')
                    .style('position', 'relative');

                var svg = div.append('svg')
                    .attr('width', element[0].clientWidth)
                    .attr('height', element[0].clientHeight)

                var tooltip = div.append('div')
                    .attr('class', 'custom_tooltip');

                var doughnut = flairVisualizations.doughnut()
                    .config(getProperties(VisualizationUtils, record))
                    .tooltip(true)
                    .broadcast($rootScope)
                    .filterParameters(filterParametersService)
                    .print(false);

                svg.datum(record.data)
                    .call(doughnut);

                $rootScope.updateWidget[record.id] = doughnut;
            }
        }
    }
}
