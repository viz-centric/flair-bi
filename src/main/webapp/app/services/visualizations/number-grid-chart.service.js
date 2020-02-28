(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateNumberGridChart', GenerateNumberGridChart);

    GenerateNumberGridChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateNumberGridChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
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
                        dimension = features.dimensions,
                        measure = features.measures,
                        colorSet = D3Utils.getDefaultColorset();

                   result['dimension'] = D3Utils.getNames(dimension);
                    result['dimensionType'] = D3Utils.getTypes(dimension);
                    result['measure'] = D3Utils.getNames(measure);
                    result['colorSet'] = colorSet;
                    result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Display name') || result['dimension'][0];
                    result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display name') || result['measure'][0];
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');
                    result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font size');
                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font style');
                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font weight');
                    result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Show Labels');
                    result['showValue'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Value on Points');
                    result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Colour of labels');
                    result['fontSizeforDisplayName'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font size for diplay name');
                    if (isNotification) {
                        result['showValue'] = false;
                        result['showLabel'] = false;
                    }
                    return result;
                }


                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:auto;text-align:center;position:relative" id="numbergrid-' + element[0].id + '" ></div>')
                    var div = $('#numbergrid-' + element[0].id)

                    var numbergrid = flairVisualizations.numbergrid()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(isNotification == true ? true : false)
                        .notification(isNotification == true ? true : false)
                        .data(record.data);

                    numbergrid(div[0])

                    return numbergrid;
                }
                if (isNotification) {
                    createChart();
                }
                else {
                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var numbergrid = $rootScope.updateWidget[record.id];
                            numbergrid.config(getProperties(VisualizationUtils, record))
                                .update(record.data);
                        }
                    } else {
                        var numbergrid = createChart();
                        $rootScope.updateWidget[record.id] = numbergrid;
                    }
                }
            }

        }
    }
})();