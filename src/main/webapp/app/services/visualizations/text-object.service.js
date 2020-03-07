(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateTextObject', GenerateTextObject);

    GenerateTextObject.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateTextObject(VisualizationUtils, $rootScope, D3Utils) {
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

                    var data = record.data[0];

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        allMeasures = [];

                    result['measure'] = D3Utils.getNames(measures);

                    result['descriptive'] = VisualizationUtils.getPropertyValue(record.properties, 'Descriptive');
                    result['alignment'] = VisualizationUtils.getPropertyValue(record.properties, 'Alignment');
                    result['textFormat'] = VisualizationUtils.getPropertyValue(record.properties, 'Text format');
                    result['value'] = [];
                    result['backgroundColor'] = [];
                    result['textColor'] = [];
                    result['underline'] = [];
                    result['fontStyle'] = [];
                    result['fontWeight'] = [];
                    result['fontSize'] = [];
                    result['icon'] = [];
                    result['numberFormat'] = [];
                    result['displayNameForMeasure'] = [];
                    result['iconExpression'] = [];
                    result['textColorExpression'] = [];

                    for (var i = 0; i < measures.length; i++) {
                        result['displayNameForMeasure'].push(
                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                            result['measure'][i]
                        );
                        result['value'].push(data[measures[i]['feature']['name']]);
                        result['backgroundColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour'));
                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                        result['underline'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Underline'));
                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                        result['icon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                        result['iconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                    }
                    return result;
                }

                $(element[0]).html('')
                $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;position:relative" id="textobject-' + element[0].id + '" ></div>')
                var div = $('#textobject-' + element[0].id)

                var textobject = flairVisualizations.textobject()
                    .config(getProperties(VisualizationUtils, record))
                    .print(isNotification == true ? true : false)

                textobject(div[0])

                textobject._getHTML()

            }
        }
    }
})();