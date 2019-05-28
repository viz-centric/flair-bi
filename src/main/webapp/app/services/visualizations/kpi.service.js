(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateKPI', GenerateKPI);

    GenerateKPI.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateKPI(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimension = features.dimensions,
                        measures = features.measures;

                    result['dimension'] = D3Utils.getNames(dimension);
                    result['measure'] = D3Utils.getNames(measures);
                    result['kpiDisplayName'] = [];
                    result['kpiAlignment'] = [];
                    result['kpiBackgroundColor'] = [];
                    result['kpiNumberFormat'] = [];
                    result['kpiFontStyle'] = [];
                    result['kpiFontWeight'] = [];
                    result['kpiFontSize'] = [];
                    result['kpiColor'] = [];
                    result['kpiColorExpression'] = [];
                    result['kpiIcon'] = [];
                    result['kpiIconFontWeight'] = [];
                    result['kpiIconColor'] = [];
                    result['kpiIconExpression'] = [];

                    for (var i = 0; i < measures.length; i++) {
                        result['kpiDisplayName'].push(
                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                            result['dimension'][i]
                        );
                        result['kpiAlignment'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment'));
                        result['kpiBackgroundColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour'));
                        result['kpiNumberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['kpiFontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['kpiFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['kpiFontSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                        result['kpiColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['kpiColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                        result['kpiIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                        result['kpiIconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
                        result['kpiIconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon colour'));
                        result['kpiIconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                    }
                    return result;
                }

                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var kpi = $rootScope.updateWidget[record.id];
                        kpi.config(getProperties(VisualizationUtils, record))
                            .update(record.data);
                    }
                } else {
                    d3.select(element[0]).html('')
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'kpi-' + element[0].id)
                        .attr('class', 'kpi')
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('padding', '15px')


                    var kpi = flairVisualizations.kpi()
                        .config(getProperties(VisualizationUtils, record))
                        .print(false);

                    div.datum(record.data)
                        .call(kpi);

                    $rootScope.updateWidget[record.id] = kpi;
                }
            }
        }
    }
})();
