(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateKPI', GenerateKPI);

    GenerateKPI.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateKPI(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel, isNotification) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimension = features.dimensions,
                        measures = features.measures;

                    result['dimension'] = D3Utils.getNames(dimension);
                    result['measure'] = D3Utils.getNames(measures);
                    result['kpiAlignment'] = VisualizationUtils.getPropertyValue(record.properties, 'Text alignment');
                    result['kpiDisplayName'] = [];
                  
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
                    result['FontSizeforDisplayName'] = [];
                    result['showIcon'] = [];
                    result['iconSize'] = [];
                    for (var i = 0; i < measures.length; i++) {
                        result['kpiDisplayName'].push(
                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                            result['measure'][i]
                        );
                       
                        result['kpiBackgroundColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour'));
                        result['kpiNumberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['kpiFontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['kpiFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['kpiFontSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                        result['kpiColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['kpiColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                        result['kpiIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                        result['showIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Icon')); 
                        result['kpiIconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
                        result['iconSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font size')); 
                       
                        result['kpiIconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon colour'));
                        result['kpiIconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                        result['FontSizeforDisplayName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size for diplay name'));
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
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="kpi-' + element[0].id + '" ></div>')
                    var div = $('#kpi-' + element[0].id)

                    var kpi = flairVisualizations.kpi()
                        .config(getProperties(VisualizationUtils, record))
                        .print(false)
                        .data(record.data);

                    kpi(div[0])
                    $rootScope.updateWidget[record.id] = kpi;
                }
            }
        }
    }
})();
