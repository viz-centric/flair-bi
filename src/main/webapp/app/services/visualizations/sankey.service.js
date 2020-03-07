(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateSankey', GenerateSankey);

    GenerateSankey.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateSankey(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
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
                        measure = features.measures,
                        colorSet = D3Utils.getDefaultColorset();

                    result['dimension'] = D3Utils.getNames(dimensions);
                    result['dimensionType'] = D3Utils.getTypes(dimensions);

                    result['measure'] = D3Utils.getNames(measure);

                    result['maxDim'] = dimensions.length;
                    result['maxMes'] = measure.length;

                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Color Pattern').toLowerCase().replace(' ', '_');

                    var displayColor = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display colour');
                    result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor
                    var borderColor = VisualizationUtils.getFieldPropertyValue(measure[0], 'Border colour');
                    result['borderColor'] = (borderColor == null) ? colorSet[1] : borderColor
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');
                    result['showLabels'] = [];
                    result['fontStyle'] = [];
                    result['fontWeight'] = [];
                    result['fontSize'] = [];
                    result['textColor'] = [];
                    result['colorList'] = colorSet;
                    for (var i = 0; i < result.maxDim; i++) {
                        result['showLabels'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                        if(isNotification){
                            result['showLabels'].push(false);
                        }
                    }
                    return result;
                }
                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="sankey-' + element[0].id + '" ></div>')
                    var div = $('#sankey-' + element[0].id)

                    var sankey = flairVisualizations.sankey()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(isNotification == true ? true : false)
                        .notification(isNotification == true ? true : false)
                        .data(record.data);

                    sankey(div[0])

                    return sankey;
                }
                if (isNotification) {
                    createChart();
                }
                else {
                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var sankey = $rootScope.updateWidget[record.id];
                            sankey
                                .config(getProperties(VisualizationUtils, record))
                                .update(record.data);
                        }
                    } else {
                        var sankey = createChart();
                        $rootScope.updateWidget[record.id] = sankey;
                    }
                }
            }
        }
    }
})();
