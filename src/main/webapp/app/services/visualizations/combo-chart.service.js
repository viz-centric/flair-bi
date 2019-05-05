(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateComboChart', GenerateComboChart);

    GenerateComboChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateComboChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel) {

                if ((!record.data) || ((record.data instanceof Array) && (!record.data.length))) {
                    element.css({
                        'display': 'flex',
                        'align-items': 'center',
                        'justify-content': 'center'
                    });

                    element[0].innerHTML = "Data not available";

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

                    // result['dimension'] = D3Utils.getNames(dimensions);
                    // result['measure'] = D3Utils.getNames(measures);

                    // result['maxMes'] = measures.length;

                    // result['xAxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
                    // result['xAxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
                    // result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
                    // result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
                    // result['xAxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
                    // result['yAxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
                    // result['legend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    // result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position');
                    // result['grid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');

                    // result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');
                    // result['measureShowValue'] = [];
                    // result['measureDisplayName'] = [];
                    // result['measureFontStyle'] = [];
                    // result['measureFontWeight'] = [];
                    // result['measureFontSize']=[];
                    // result['measureNumberFormat'] = [];
                    // result['measureTextColor'] = [];
                    // result['measureDisplayColor'] = [];
                    // result['measureBorderColor'] = [];
                    // result['measureChartType'] = [];
                    // result['measurePointType'] = [];
                    // result['lineType'] = [];

                    // for (var i = 0; i < result.maxMes; i++) {

                    //     result['measureShowValue'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                    //     result['measureDisplayName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name'));
                    //     result['measureFontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                    //     result['measureFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                    //     result['measureFontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                    //     result['measureNumberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                    //     result['measureTextColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                    //     var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                    //     result['measureDisplayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                    //     var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                    //     result['measureBorderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                    //     result['measureChartType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Combo chart type'));
                    //     result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type'));
                    //     result['measurePointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));

                    // }

                    // result['measureProp'] = allMeasures;

                    result['dimension'] = D3Utils.getNames(dimensions);
                    result['measure'] = D3Utils.getNames(measures);

                    result['maxMes'] = measures.length;

                    result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
                    result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
                    result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
                    result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
                    result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
                    result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
                    result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
                    result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');

                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');
                    result['showValues'] = [];
                    result['displayNameForMeasure'] = [];
                    result['fontStyle'] = [];
                    result['fontWeight'] = [];
                    result['fontSize'] = [];
                    result['numberFormat'] = [];
                    result['textColor'] = [];
                    result['displayColor'] = [];
                    result['borderColor'] = [];
                    result['comboChartType'] = [];
                    result['lineType'] = [];
                    result['pointType'] = [];

                    for (var i = 0; i < result.maxMes; i++) {

                        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name'));
                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                        result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                        result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                        result['comboChartType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Combo chart type'));
                        result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type').toLowerCase());
                        result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
                    }

                    return result;
                }


                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var combo = $rootScope.updateWidget[record.id];
                        combo.update(record.data);

                        // TODO: This needs to be fixed, commented code need to be properly done
                        // ---------------*-----------------
                        // var combo = new Combo(element[0], record, getProperties(VisualizationUtils, record));
                        // combo.renderChart(); 

                        // $rootScope.updateWidget[record.id] = combo;
                        // ---------------*-----------------
                    }
                } else {
                    d3.select(element[0]).html('')
                    var div = d3.select(element[0]).append('div')
                        .attr('id', 'combo-' + element[0].id)
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    var svg = div.append('svg')
                        .attr('width', element[0].clientWidth)
                        .attr('height', element[0].clientHeight)

                    var tooltip = div.append('div')
                        .attr('class', 'custom_tooltip');

                    var combo = flairVisualizations.combo()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(false);

                    svg.datum(record.data)
                        .call(combo);

                    $rootScope.updateWidget[record.id] = combo;
                }
            }
        }
    }
})();