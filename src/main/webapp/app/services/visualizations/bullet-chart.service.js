(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateBulletChart', GenerateBulletChart);

    GenerateBulletChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateBulletChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
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
                        dimensions = features.dimensions,
                        measures = features.measures,
                        colorSet = D3Utils.getDefaultColorset();

                    result['dimension'] = [D3Utils.getNames(dimensions)[0]];
                    result['dimensionType'] = [D3Utils.getTypes(dimensions)[0]];

                    result['measures'] = D3Utils.getNames(measures);

                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                    result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                    result['showLabel'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Value on Points');

                    var valueColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                    result['valueColor'] = (valueColor == null) ? colorSet[0] : valueColor;
                    var targetColor = VisualizationUtils.getFieldPropertyValue(measures[1], 'Target colour');
                    result['targetColor'] = (targetColor == null) ? colorSet[1] : targetColor;

                    result['orientation'] = VisualizationUtils.getPropertyValue(record.properties, 'Orientation');
                    result['segments'] = VisualizationUtils.getPropertyValue(record.properties, 'Segments');
                    result['segmentInfo'] = VisualizationUtils.getPropertyValue(record.properties, 'Segment Color Coding');
                    result['measureNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                    result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                    if (isNotification) {
                        result['showLabel'] = false;
                    }
                    return result;
                }

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="bullet-' + element[0].id + '" ></div>')
                    var div = $('#bullet-' + element[0].id)

                    var bullet = flairVisualizations.bullet()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .notification(isNotification == true ? true : false)
                        .data(record.data);

                    bullet(div[0])
                    return bullet;
                }

                if (isNotification) {
                    createChart()
                }
                else {
                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var bulletchart = $rootScope.updateWidget[record.id];
                            bulletchart.config(getProperties(VisualizationUtils, record))
                                .update(record.data);
                        }
                    } else {
                        var bullet = createChart()
                        $rootScope.updateWidget[record.id] = bullet;

                    }
                }

            }
        }
    }

})();