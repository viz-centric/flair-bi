(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateTreemap', GenerateTreemap);

    GenerateTreemap.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateTreemap(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        colorSet = D3Utils.getDefaultColorset();

                    result['maxDim'] = dimensions.length;
                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                    result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                    result['valueTextColour'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                    result['fontStyleForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                    result['fontWeightForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                    result['fontSizeForMes'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size'));
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                    result['measure'] = [measures[0].feature.name];
                    result['dimension'] = [];
                    result['dimensionType'] = [];
                    result['showLabelForDimension'] = [];
                    result['labelColorForDimension'] = [];
                    result['fontStyleForDimension'] = [];
                    result['fontWeightForDimension'] = [];
                    result['fontSizeForDimension'] = [];
                    result['displayColor'] = [];
                    result['colorSet'] = colorSet;

                    for (var i = 0, j = ''; i < result.maxDim; i++ , j = i + 1) {
                        result['dimension'].push(dimensions[i].feature.name);
                        result['dimensionType'].push(dimensions[i].feature.type);
                        result['showLabelForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
                        result['labelColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Colour of labels'));
                        var displayColor = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour');
                        result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                        //  result['displayColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour'));
                        result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                        result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                        result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                    }

                    return result;
                }

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="treemap-' + element[0].id + '" ></div>')
                    var div = $('#treemap-' + element[0].id)

                    var treemap = flairVisualizations.treemap()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(isNotification == true ? true : false)
                        .notification(isNotification == true ? true : false)
                        .data(record.data);

                    treemap(div[0])

                    return treemap;
                }
                if (isNotification) {
                    createChart();
                }
                else {

                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var treemap = $rootScope.updateWidget[record.id];
                            treemap.config(getProperties(VisualizationUtils, record))
                                .update(record.data);
                        }
                    } else {
                        var treemap = createChart();
                        $rootScope.updateWidget[record.id] = treemap;
                    }
                }
            }
        }
    }
})();