(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GeneratePivotTable', GeneratePivotTable);

    GeneratePivotTable.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GeneratePivotTable(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures;

                    result['dimensions'] = D3Utils.getNames(dimensions);
                    result['measures'] = D3Utils.getNames(measures);

                    result['maxDim'] = dimensions.length;
                    result['maxMes'] = measures.length;

                    result["dimension"] = [];
                    result["displayNameForDimension"] = [];
                    result["cellColorForDimension"] = [];
                    result["fontStyleForDimension"] = [];
                    result["fontWeightForDimension"] = [];
                    result["fontSizeForDimension"] = [];
                    result["textColorForDimension"] = [];
                    result["textColorExpressionForDimension"] = [];
                    result["textAlignmentForDimension"] = [];
                    result['isPivoted'] = [];

                    result["measure"] = [];
                    result["displayNameForMeasure"] = [];
                    result["cellColorForMeasure"] = [];
                    result["cellColorExpressionForMeasure"] = [];
                    result["fontStyleForMeasure"] = [];
                    result["fontSizeForMeasure"] = [];
                    result["fontWeightForMeasure"] = [];
                    result["numberFormatForMeasure"] = [];
                    result["textColorForMeasure"] = [];
                    result["textAlignmentForMeasure"] = [];
                    result["textColorExpressionForMeasure"] = [];
                    result["iconNameForMeasure"] = [];
                    result["iconFontWeight"] = [];
                    result["iconColor"] = [];
                    result["iconPositionForMeasure"] = [];
                    result["iconExpressionForMeasure"] = [];
                    for (var i = 0; i < result.maxDim; i++) {

                        result['dimension'].push(result['dimensions'][i]);
                        result['displayNameForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name'));
                        result['cellColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Cell colour'));
                        result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                        result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                        result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                        result['textColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                        result['textColorExpressionForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour expression'));
                        result['textAlignmentForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Alignment'));
                        result['isPivoted'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Pivot'));

                    }

                    for (var i = 0; i < result.maxMes; i++) {
                        result['measure'].push(result['measures'][i]);
                        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name'));
                        result['cellColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour'));
                        result['cellColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour expression'));
                        result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                        result['numberFormatForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['textColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['textAlignmentForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment').toLowerCase());
                        result['textColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                        result['iconNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                        result['iconPositionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position'));
                        result['iconExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                    }
                    return result;
                }

                d3.select(element[0]).html('')
                var div = d3.select(element[0]).append('div')
                    .attr('id', 'pivot-' + element[0].id)
                    .style('width', element[0].clientWidth + 'px')
                    .style('height', element[0].clientHeight + 'px')
                    .style('overflow', 'hidden')
                    .style('text-align', 'center')
                    .style('position', 'relative');

                var pivot = flairVisualizations.pivot()
                    .config(getProperties(VisualizationUtils, record))

                div.datum(record.data)
                    .call(pivot);
            }
        }
    }
})();