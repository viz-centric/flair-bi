(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateGaugePlot', GenerateGaugePlot);

    GenerateGaugePlot.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateGaugePlot(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel, isNotification) {
                if ((!record.data) || ((record.data instanceof Array) && (!record.data.length))) {
                    element.css({
                        'display': 'flex',
                        'align-items': 'center',
                        'justify-content': 'center'
                    });
                    element[0].innerHTML = '<i class="fa fa-exclamation-circle noDataFound" aria-hidden="true"></i> <p class="noDataText">  No data found with current filters</p>';
                    return;
                }
                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        measures = features.measures,
                        colorSet = D3Utils.getDefaultColorset();

                    result['measures'] = D3Utils.getNames(measures);

                    result['gaugeType'] = VisualizationUtils.getPropertyValue(record.properties, 'Gauge Type').toLowerCase();

                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measures'][0];
                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                    result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                    var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                    result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor
                    result['isGradient'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Enable Gradient Color');
                    result['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');

                    result['targetDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display name') || result['measures'][1];
                    result['targetFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font style');
                    result['targetFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font weight');
                    result['targetShowValues'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Value on Points');
                    var targetDisplayColor = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display colour');
                    result['targetDisplayColor'] = (targetDisplayColor == null) ? colorSet[1] : targetDisplayColor
                    result['targetTextColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Text colour');
                    result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                    return result;
                }

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="gauge-' + element[0].id + '" ></div>')
                    var div = $('#gauge-' + element[0].id)

                    var gauge = flairVisualizations.gauge()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .notification(isNotification == true ? true : false)
                        .print(isNotification == true ? true : false)
                        .data(record.data);

                    gauge(div[0])
                    return gauge;
                }
                if (isNotification) {
                    createChart();
                }
                else {

                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var gauge = $rootScope.updateWidget[record.id];
                            gauge.update(record.data);
                        }
                    } else {

                        var gauge = createChart();
                        $rootScope.updateWidget[record.id] = gauge;
                    }
                }
            }
        }
    }
})();