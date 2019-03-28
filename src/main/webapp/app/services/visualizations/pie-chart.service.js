(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GeneratePieChart', GeneratePieChart);

    GeneratePieChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GeneratePieChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {

        return {
            build: function (record, element, panel) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimension = features.dimensions,
                        measure = features.measures;

                    result['dimension'] = D3Utils.getNames(dimension);
                    result['measure'] = D3Utils.getNames(measure);

                    result['legend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position');
                    result['value'] = VisualizationUtils.getPropertyValue(record.properties, 'Show value as').toLowerCase();
                    result['valueAsArc'] = VisualizationUtils.getPropertyValue(record.properties, 'Value as Arc');
                    result['valuePosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Value position').toLowerCase();

                    return result;
                }

                if(Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if($rootScope.filterSelection.id != record.id) {
                        var pie = $rootScope.updateWidget[record.id];
                        pie.update(record.data);
                    }
                } else {
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'pie-' + this.id)
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    var svg = div.append('svg');

                    var tooltip = div.append('div')
                        .attr('class', 'tooltip');

                    var pie = flairVisualizations.pie()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true);

                    svg.datum(record.data)
                        .call(pie);

                    $rootScope.updateWidget[record.id] = pie;
                }
            }
        }
    }
})();
