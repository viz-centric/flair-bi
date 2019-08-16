(function () {
    "use strict";

    angular.module("flairbiApp").factory("GenerateBoxplot", GenerateBoxplot);

    GenerateBoxplot.$inject = [
        "VisualizationUtils",
        "$rootScope",
        "D3Utils",
        "filterParametersService"
    ];

    function GenerateBoxplot(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};


                    var features = VisualizationUtils.getDimensionsAndMeasures(
                        record.fields
                    ),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        allMeasures = [];

                    result["dimension"] = [D3Utils.getNames(dimensions)[0]];
                    result["measure"] = D3Utils.getNames(measures);
                    result["maxMes"] = measures.length;
                    result["showXaxis"] = VisualizationUtils.getPropertyValue(record.properties, "Show X Axis");
                    result["showYaxis"] = VisualizationUtils.getPropertyValue(record.properties, "Show Y Axis");
                    result["axisColor"] = VisualizationUtils.getPropertyValue(record.properties, "Axis Colour");
                    result["colorPattern"] = VisualizationUtils.getPropertyValue(record.properties, "Color Pattern");
                    result["numberFormat"] = VisualizationUtils.getFieldPropertyValue(dimensions[0], "Number format");
                    return result;
                }
               
                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {

                    if ($rootScope.filterSelection.id != record.id) {
                        var boxplot = $rootScope.updateWidget[record.id];
                        boxplot.config(getProperties(VisualizationUtils, record))
                            .update(record.data);
                    }
                } else {
                    $(element[0]).html('')
                    $(element[0]).append('<div height="' + element[0].clientHeight + '" width="' + element[0].clientWidth + '" style="width:' + element[0].clientWidth + 'px; height:' + element[0].clientHeight + 'px;overflow:hidden;position:relative" id="boxplot-' + element[0].id + '" ></div>')
                    var div = $('#boxplot-' + element[0].id)

                    var boxplot = flairVisualizations.boxplot()
                        .config(getProperties(VisualizationUtils, record))
                        .tooltip(true)
                        .broadcast($rootScope)
                        .filterParameters(filterParametersService)
                        .print(isNotification == true ? true : false)

                        .data(record.data);

                    boxplot(div[0])

                    $rootScope.updateWidget[record.id] = boxplot;

                }
            }
        }
    }
})();
