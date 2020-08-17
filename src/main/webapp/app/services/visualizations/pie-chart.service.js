(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GeneratePieChart', GeneratePieChart);

    GeneratePieChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GeneratePieChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {

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
                        dimension = features.dimensions,
                        measure = features.measures;
                    result['dimension'] = D3Utils.getNames(dimension);
                    result['dimensionType'] = D3Utils.getTypes(dimension);
                    result['measure'] = D3Utils.getNames(measure);
                    result['legend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toUpperCase();
                    result['valueAs'] = VisualizationUtils.getPropertyValue(record.properties, 'Show value as').toLowerCase();
                    if (isNotification) {
                        result['legend'] = false;
                    }
                    return result;
                }

                function createChart() {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;text-align:center;position:relative" id="pie-' + element[0].id + '" ></div>')
                    var div = $('#pie-' + element[0].id)

                    var pie = flairVisualizations.pie()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .notification(isNotification == true ? true : false)
                        .print(false)
                        .data(record.data);

                    pie(div[0])

                    return pie;
                }
                 if (isNotification || isIframe) {
                    createChart();
                }
                else {
                    if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                        if ($rootScope.filterSelection.id != record.id) {
                            var pie = $rootScope.updateWidget[record.id];
                            pie.config(getProperties(VisualizationUtils, record))
                                .data(record.data)
                                .update(record.data);
                        }
                    } else {
                        var pie = createChart();
                        $rootScope.updateWidget[record.id] = pie;
                    }
                }
            }
        }
    }
})();
