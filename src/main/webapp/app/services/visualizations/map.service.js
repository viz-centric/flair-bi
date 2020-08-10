(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateMap', GenerateMap);

    GenerateMap.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateMap(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification, isIframe) {
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

                    result['colorPattern'] = VisualizationUtils.getPropertyValue(record.properties, 'Color Pattern').toLowerCase().replace(' ', '_');
                    result['dimension'] = [D3Utils.getNames(dimension)[0]];
                    result['dimensionType'] = [D3Utils.getTypes(dimension)[0]];

                    result['measure'] = [D3Utils.getNames(measure)[0]];
                    result['colorSet'] = colorSet;
                    result['colourOfLabels'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Colour of labels');
                    var displayColor = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display colour');
                    result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor;
                    result['textColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Text colour');
                    result['borderColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Border colour');
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');
                    result['showValue'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Value on Points');

                    return result;
                }

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;position:relative" id="map-' + element[0].id + '" ></div>')
                    var div = $('#map-' + element[0].id)

                    var map = flairVisualizations.map()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(isNotification == true ? true : false)
                        .notification(isNotification == true ? true : false)
                        .data(record.data);

                    map(div[0])

                    return map;
                }
                 if (isNotification || isIframe) {
                    createChart();
                }
                else {
                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var map = $rootScope.updateWidget[record.id];
                            map.config(getProperties(VisualizationUtils, record))
                                .update(record.data);
                        }
                    } else {

                        var map = createChart();
                        $rootScope.updateWidget[record.id] = map;
                    }
                }
            }
        }
    }
})();