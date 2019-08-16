(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GeneratePieGridChart', GeneratePieGridChart);

    GeneratePieGridChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GeneratePieGridChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
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

                    return result;
                }


                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var piegrid = $rootScope.updateWidget[record.id];
                        piegrid.config(getProperties(VisualizationUtils, record))
                            .update(record.data);
                    }
                } else {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="piegrid-' + element[0].id + '" ></div>')
                    var div = $('#piegrid-' + element[0].id)

                    var piegrid = flairVisualizations.piegrid()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(isNotification == true ? true : false)
                        .data(record.data);

                    piegrid(div[0])
                    if (!isNotification) {
                        $rootScope.updateWidget[record.id] = piegrid;
                    }
                }
            }
        }
    }
})();