(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateClusteredhorizontalbarChart', GenerateClusteredhorizontalbarChart);

    GenerateClusteredhorizontalbarChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateClusteredhorizontalbarChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel) {
               
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

                    result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
                    result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
                    result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
                    result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
                    result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
                    result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
                    result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position');
                    result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');

                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');
                    result['showValues'] = [];
                    result['displayNameForMeasure'] = [];
                    result['fontStyle'] = [];
                    result['fontWeight'] = [];
                    result['fontSize'] = [];
                    result['numberFormat'] = [];
                    result['textColor'] = [];
                    result['displayColor'] = [];
                    result['borderColor'] = [];
                    for (var i = 0; i < result.maxMes; i++) {

                        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name'));
                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['displayColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour'));
                        result['borderColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour'));
                        //   result['displayColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                        //  result['displayColor'] .push( (eachMeasure['displayColor'] == null) ? colorSet[i] : eachMeasure['displayColor']);
                        //   result['borderColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                        //   result['borderColor'] .push( (eachMeasure['borderColor'] == null) ? colorSet[i] : eachMeasure['borderColor']);
                    }

                    return result;
                }


                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var clusteredhorizontalbar = $rootScope.updateWidget[record.id];
                        clusteredhorizontalbar.update(record.data);
                    }
                } else {
                    d3.select(element[0]).html('')
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'clusteredhorizontalbar-' +  element[0].id)
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    var svg = div.append('svg');

                    var tooltip = div.append('div')
                        .attr('id', 'tooltip');

                    var clusteredhorizontalbar = flairVisualizations.clusteredhorizontalbar()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true);

                    svg.datum(record.data)
                        .call(clusteredhorizontalbar);

                    $rootScope.updateWidget[record.id] = clusteredhorizontalbar;
                }
            }
        }
    }
})();