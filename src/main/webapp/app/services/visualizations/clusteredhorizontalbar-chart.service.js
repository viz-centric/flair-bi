(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateClusteredhorizontalbarChart', GenerateClusteredhorizontalbarChart);

    GenerateClusteredhorizontalbarChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateClusteredhorizontalbarChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
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
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        allMeasures = [],
                        colorSet = D3Utils.getDefaultColorset();

                    result['dimension'] = D3Utils.getNames(dimensions);
                    result['dimensionType'] = D3Utils.getTypes(dimensions);
                    result['measure'] = D3Utils.getNames(measures);

                    result['maxMes'] = measures.length;

                    result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
                    result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
                    result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
                    result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
                    result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
                    result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
                    result['axisScaleLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Axis Scale Label');
                    result['showMoreDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Show more dimension char');
                    result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
                    result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');
                    result['isFilterGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Filter Grid');
                    result['showSorting'] = VisualizationUtils.getPropertyValue(record.properties, 'Allow Sorting');
                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                    result['alternateDimension'] = VisualizationUtils.getPropertyValue(record.properties, 'Alternative Dimensions');
                    result['showValues'] = [];
                    result['displayNameForMeasure'] = [];
                    result['fontStyle'] = [];
                    result['fontWeight'] = [];
                    result['fontSize'] = [];
                    result['numberFormat'] = [];
                    result['textColor'] = [];
                    result['displayColor'] = [];
                    result['borderColor'] = [];
                    result['displayColorExpression'] = [];
                    result['textColorExpression'] = [];
                    for (var i = 0; i < result.maxMes; i++) {

                        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                        result['displayNameForMeasure'].push(
                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                            result['measure'][i]
                        );
                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                        result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                        result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                        result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                    }
                    if (isNotification) {
                        result['showXaxis'] = false;
                        result['showYaxis'] = false;
                        result['isFilterGrid'] = false;
                        result['showLegend'] = false;
                        result['showGrid'] = false;
                        result['showXaxisLabel'] = false;
                        result['showYaxisLabel'] = false;
                    }
                    return result;
                }

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" vizID=' + record.id + ' id="clusteredhorizontalbar-' + element[0].id + '" ></div>')
                    var div = $('#clusteredhorizontalbar-' + element[0].id)

                    var clusteredhorizontalbar = flairVisualizations.clusteredhorizontalbar()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(isNotification == true ? true : false)
                        .notification(isNotification == true ? true : false)
                        .data(record.data);

                    clusteredhorizontalbar(div[0])
                    return clusteredhorizontalbar;

                }
                if (isNotification || isIframe) {
                    createChart();
                } else {
                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var clusteredhorizontalbar = $rootScope.updateWidget[record.id];

                            clusteredhorizontalbar.isLiveEnabled(record.isLiveEnabled)
                                .config(getProperties(VisualizationUtils, record))
                                .data(record.data)
                                .update(record.data);
                        }
                    } else {
                        var clusteredhorizontalbar = createChart();
                        $rootScope.updateWidget[record.id] = clusteredhorizontalbar;
                    }
                }
            }
        }
    }
})();