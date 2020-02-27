(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GeneratePivotTable', GeneratePivotTable);

    GeneratePivotTable.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GeneratePivotTable(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures;

                    result['dimension'] = D3Utils.getNames(dimensions);
                    result['dimensionType'] = D3Utils.getTypes(dimensions);
                    result['measure'] = D3Utils.getNames(measures);

                    result['maxDim'] = dimensions.length;
                    result['maxMes'] = measures.length;

                    result['limit'] = VisualizationUtils.getPropertyValue(record.properties, 'Limit');

                    result["displayNameForDimension"] = [];
                    result["cellColorForDimension"] = [];
                    result["fontStyleForDimension"] = [];
                    result["fontWeightForDimension"] = [];
                    result["fontSizeForDimension"] = [];
                    result["textColorForDimension"] = [];
                    result["textColorExpressionForDimension"] = [];
                    result["textAlignmentForDimension"] = [];
                    result['isPivoted'] = [];

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
                        result['displayNameForDimension'].push(
                            VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name') ||
                            result['dimension'][i]
                        );
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
                        result['displayNameForMeasure'].push(
                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                            result['measure'][i]
                        );
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
                var config = getProperties(VisualizationUtils, record)

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="pivot-' + element[0].id + '" ></div>')
                    var div = $('#pivot-' + element[0].id);
                    var pivot;

                    if (config["isPivoted"].find(element => element == true)) {
                        pivot = flairVisualizations.pivot()
                            .config(config)
                            .broadcast($rootScope)
                            .filterParameters(filterParametersService)
                            .print(isNotification == true ? true : false)
                            .notification(isNotification == true ? true : false)
                            .data(record.data);
                    }
                    else {

                        config["showTotal"] = true;
                        pivot = flairVisualizations.table()
                            .config(config)
                            .broadcast($rootScope)
                            .filterParameters(filterParametersService)
                            .print(isNotification == true ? true : false)
                            .notification(isNotification == true ? true : false)
                            .data(record.data);
                    }

                    pivot(div[0])

                    return pivot;
                }
                if (isNotification) {
                    createChart();
                }
                else {
                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var pivot = $rootScope.updateWidget[record.id];

                            pivot
                                .config(getProperties(VisualizationUtils, record))
                                .update(record.data);
                        }
                    } else {
                        var pivot = createChart();
                        $rootScope.updateWidget[record.id] = pivot;
                    }
                }
            }
        }
    }
})();