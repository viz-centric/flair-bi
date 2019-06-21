(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateWordCloud', GenerateWordCloud);

    GenerateWordCloud.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateWordCloud(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        colorSet = D3Utils.getDefaultColorset();

                    result['dimension'] = D3Utils.getNames(dimensions)[0];
                    result['colorSet'] = colorSet;
                    result['measure'] = D3Utils.getNames(measures)[0];
                    result['minimumSize'] = VisualizationUtils.getPropertyValue(record.properties, 'Minimum Size') || '10px';
                    result['maximumSize'] = VisualizationUtils.getPropertyValue(record.properties, 'Maximum Size') || '40px';
                    result['labelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                    result['fontStyleForDim'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                    result['fontWeightForDim'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                    result['fontSizeForDim'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');

                    return result;
                }


                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var wordcloud = $rootScope.updateWidget[record.id];
                        wordcloud.updateChart(record.data);
                    }
                } else {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="wordcloud-' + element[0].id + '" ></div>')
                    var div = $('#wordcloud-' + element[0].id)

                    var wordcloud = flairVisualizations.wordcloud()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(false)
                        .data(record.data);

                    wordcloud(div[0])

                    $rootScope.updateWidget[record.id] = wordcloud;
                }
            }
        }
    }
})();
