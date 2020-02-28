(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateWordCloud', GenerateWordCloud);

    GenerateWordCloud.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateWordCloud(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
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

                    result['dimension'] = D3Utils.getNames(dimensions)[0];
                    result['dimensionType'] = D3Utils.getTypes(dimensions)[0];

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

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="wordcloud-' + element[0].id + '" ></div>')
                    var div = $('#wordcloud-' + element[0].id)

                    var wordcloud = flairVisualizations.wordcloud()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(isNotification == true ? true : false)
                        .notification(isNotification == true ? true : false)
                        .data(record.data);

                    wordcloud(div[0])

                    return wordcloud;
                }
                if (isNotification) {
                    createChart();
                }
                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var wordcloud = $rootScope.updateWidget[record.id];
                        wordcloud
                            .config(getProperties(VisualizationUtils, record))
                            .update(record.data);
                    }
                } else {
                    var wordcloud = createChart();

                    $rootScope.updateWidget[record.id] = wordcloud;
                }
            }
        }
    }
})();
