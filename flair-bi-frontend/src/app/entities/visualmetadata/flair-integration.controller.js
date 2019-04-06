import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("flairIntegrationController", flairIntegrationController);

flairIntegrationController.$inject = [
    "$scope",
    "$rootScope",
    "$stateParams",
    "previousState",
    "entity",
    "Visualmetadata",
    "Visualizations",
    "ExecutorFactory",
    "GenerateTable",
    "GeneratePieChart",
    "GenerateStackedverticalbarChart",
    "GenerateStackedhorizontalbarChart",
    "GenerateClusteredverticalbarChart",
    "GenerateClusteredhorizontalbarChart",
    "GenerateDoughnutChart",
    "GenerateComboChart",
    "GenerateLineChart",
    "GenerateMap",
    "GenerateKPI",
    "GenerateInfoGraphic"
];

function flairIntegrationController(
    $scope,
    $rootScope,
    $stateParams,
    previousState,
    entity,
    Visualmetadata,
    Visualizations,
    ExecutorFactory,
    GenerateTable,
    GeneratePieChart,
    GenerateDoughnutChart,
    GenerateStackedverticalbarChart,
    GenerateStackedhorizontalbarChart,
    GenerateClusteredverticalbarChart,
    GenerateClusteredhorizontalbarChart,
    GenerateComboChart,
    GenerateLineChart,
    GenerateMap,
    GenerateKPI,
    GenerateInfoGraphic
) {
    var vm = this;

    vm.visualmetadata = entity;
    vm.previousState = previousState.name;

    var unsubscribe = $rootScope.$on(
        "flairbiApp:visualmetadataUpdate",
        function (event, result) {
            vm.visualmetadata = result;
        }
    );
    $scope.$on("$destroy", unsubscribe);
    $scope.dataFromBuild = [];

    vm.visualLibrary = [];
    vm.visualLibrary["GenerateTable"] = GenerateTable;
    vm.visualLibrary["GeneratePieChart"] = GeneratePieChart;
    vm.visualLibrary["GenerateDoughnutChart"] = GenerateDoughnutChart;
    vm.visualLibrary["StackedhorizontalbarChart"] = StackedhorizontalbarChart;
    vm.visualLibrary["StackedverticalbarChart"] = StackedverticalbarChart;
    vm.visualLibrary["ClusteredhorizontalbarChart"] = ClusteredhorizontalbarChart;
    vm.visualLibrary["ClusteredverticalbarChart"] = ClusteredverticalbarChart;
    vm.visualLibrary["GenerateComboChart"] = GenerateComboChart;
    vm.visualLibrary["GenerateLineChart"] = GenerateLineChart;
    vm.visualLibrary["GenerateMap"] = GenerateMap;
    vm.visualLibrary["GenerateKPI"] = GenerateKPI;
    vm.visualLibrary["GenerateInfoGraphic"] = GenerateInfoGraphic;
    /* rendering */
    $scope.inTransformMetadata = function (data) {
        var elementInfo = [];
        //General Properties
        elementInfo.masterId = data.id;
        elementInfo.id = data.visualBuildId;
        elementInfo.visualId = data.metadataVisual.id;
        elementInfo.SQLquery = data.query;
        //Title Properties
        elementInfo.titleProperties = {};
        elementInfo.showTitle = data.titletext;
        elementInfo.titletext = data.titletext;
        elementInfo.sTitle = data.sTitle;
        elementInfo.titleProperties["background-color"] =
            data.titlebackgroundclr;
        elementInfo.titleProperties["border-bottom"] = data.bottomborder;
        elementInfo.titleProperties.color = data.titletextclr;
        //Body properties
        elementInfo.bodyProperties = {};
        elementInfo.bodyProperties.opacity = data.opacity;
        elementInfo.bodyProperties["background-color"] = data.background;
        elementInfo.bodyProperties["border"] = data.border;
        //chart properties
        elementInfo.chartProperties = [];
        elementInfo.chartProperties.showXAxis = data.sxaxis;
        elementInfo.chartProperties.showYAxis = data.syaxis;
        elementInfo.chartProperties.showLabels = data.showlabels;
        elementInfo.chartProperties.showLegend = data.slegend;
        elementInfo.chartProperties.showGrid = data.showGrid;
        elementInfo.chartProperties.legendPosition = data.legendPosition;
        elementInfo.chartProperties.orderOfDisplay = data.orderOfDisplay;
        elementInfo.chartProperties.axisLegendColor = data.axisLegendColor;
        // Json Query
        elementInfo.queryjson = data.queryjson;
        elementInfo.actualData = new Array(); // need to fetch data here
        //other properties
        elementInfo.chartProperties.noOfDim = data.noOfDim;
        elementInfo.x = data.xposition;
        elementInfo.y = data.yposition;
        elementInfo.width = data.width;
        elementInfo.height = data.height;
        elementInfo.datasource = data.datasource;
        elementInfo.viewid = data.clrscheme;
        elementInfo.sequenceNo = data.sequenceNo;
        elementInfo.functionName = data.metadataVisual.functionname;
        $scope.dataFromBuild[data.visualBuildId] = [];
        $scope.dataFromBuild[data.visualBuildId] = elementInfo;
        $scope.dataFromBuild[data.visualBuildId].vProperties = [];
        if (data.noOfDim > 0) {
            ExecutorFactory.getVisualProperties(
                elementInfo.masterId,
                function (callback) {
                    $scope.dataFromBuild[
                        callback[0]["visualProperties"][0]["metadataLink"][
                        "visualBuildId"
                        ]
                    ].vProperties =
                        callback[0]["visualProperties"];
                    $scope.generateVisualization(
                        $scope.dataFromBuild[
                        callback[0]["visualProperties"][0][
                        "metadataLink"
                        ]["visualBuildId"]
                        ]
                    );
                },
                function (error) {
                    var sm = [];
                    sm.title = "Save failed";
                    sm.text = [];
                    sm.text.push("Status : " + error.status.toString());
                    sm.text.push("Description : " + error.statusText);
                    $rootScope.showErrorToast(sm);
                }
            );
        }
        $scope.generateVisualization(
            $scope.dataFromBuild[data.visualBuildId]
        );
        data = [];
        elementInfo = [];
    };

    $scope.generateVisualization = function (data) {
        var visualBuildId = data.id;
        $scope.visualBuildId = visualBuildId;
        $scope.executeQuery(data);
    };

    $scope.returnTitleCss = function (id) {
        return $scope.dataFromBuild[id].titleProperties;
    };

    $scope.returnBodyCss = function (id) {
        return $scope.dataFromBuild[id].bodyProperties;
    };

    $scope.refreshVisual = function (recordId) {
        if ($scope.dataFromBuild[recordId].chartProperties.noOfDim > 0) {
            if ($scope.dataFromBuild[recordId].data) {
                vm.visualLibrary[
                    $scope.dataFromBuild[recordId].functionName
                ].build($scope.dataFromBuild[recordId]);
            }
        }
    };

    $scope.executeQuery = function (record) {
        if (record.id) {
            if (record.chartProperties.noOfDim > 0) {
                ExecutorFactory.executor(
                    record.SQLquery,
                    record.datasource.toString(),
                    "{}",
                    false,
                    function (result) {
                        $scope.dataPreprocess(result, record.id);
                    },
                    function (error) {
                        $scope.dataFromBuild[record.id].data = [];
                        var sm = [];
                        sm.title = "Query failed!";
                        sm.text = [];
                        sm.text.push("Visual Id : " + record.id);
                        sm.text.push("VisualName : " + record.titletext);
                        sm.text.push("Status : " + error.status.toString());
                        sm.text.push("Description : " + error.statusText);
                        $rootScope.showErrorToast(sm);
                        return [];
                    }
                );
            }
        }
    };

    $scope.dataPreprocess = function (data, recordId) {
        $scope.dataFromBuild[recordId].data = data;
        $scope.refreshVisual(recordId);
    };

    $scope.inTransformMetadata(entity);
}