(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateDoughnutChart', GenerateDoughnutChart);

    GenerateDoughnutChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateDoughnutChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification) {

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
                    result["numberFormat"] = VisualizationUtils.getFieldPropertyValue(measure[0], "Number format");

                    result['legend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
                    result['valueAs'] = VisualizationUtils.getPropertyValue(record.properties, 'Show value as').toLowerCase();
                    if (isNotification) {
                        result['legend'] = false;
                    }
                    return result;
                }

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="doughnut-' + element[0].id + '" ></div>')
                    var div = $('#doughnut-' + element[0].id)

                    var doughnut = flairVisualizations.doughnut()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .print(false)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .notification(isNotification == true ? true : false)
                        .data(record.data);

                    doughnut(div[0])
                    return doughnut;
                }
                if (isNotification) {
                    createChart();
                }
                else {

                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var doughnut = $rootScope.updateWidget[record.id];
                            doughnut.config(getProperties(VisualizationUtils, record))
                                .data(record.data)
                                .update(record.data);
                        }
                    } else {
                        var doughnut = createChart();
                        $rootScope.updateWidget[record.id] = doughnut;

                    }
                }
            }
        }
    }
})();