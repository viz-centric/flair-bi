import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateBulletChart', GenerateBulletChart);

GenerateBulletChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateBulletChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimensions = features.dimensions,
                    measures = features.measures;

                result['dimension'] = [D3Utils.getNames(dimensions)[0]];
                result['measure'] = D3Utils.getNames(measures);

                result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                result['showLabel'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Value on Points');

                result['valueColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                result['targetColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Target colour');

                result['orientation'] = VisualizationUtils.getPropertyValue(record.properties, 'Orientation');
                result['segments'] = VisualizationUtils.getPropertyValue(record.properties, 'Segments');
                result['segmentInfo'] = VisualizationUtils.getPropertyValue(record.properties, 'Segment Color Coding');
                result['measureNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                return result;
            }


            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var bulletchart = $rootScope.updateWidget[record.id];
                    bulletchart.update(record.data);
                }
            } else {
                d3.select(element[0]).html('')
                var div = d3.select(element[0]).append('div')
                    .attr('id', 'bullet-' + element[0].id)
                    .style('width', element[0].clientWidth + 'px')
                    .style('height', element[0].clientHeight + 'px')
                    .style('overflow', 'hidden')
                    .style('text-align', 'center')
                    .style('position', 'relative');

                var svg = div.append('svg')

                var tooltip = div.append('div')
                    .attr('id', 'tooltip')

                var bulletchart = flairVisualizations.bullet()
                    .config(getProperties(VisualizationUtils, record))
                    .tooltip(true);

                svg.datum(record.data)
                    .call(bulletchart);

                $rootScope.updateWidget[record.id] = bulletchart;
            }
        }
    }
}