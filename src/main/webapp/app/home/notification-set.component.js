(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('notificationSetComponent', {
            templateUrl: 'app/home/notification-set.component.html',
            controller: notificationSetController,
            controllerAs: 'vm'
        });

    notificationSetController.$inject = ['$scope', '$state', 'alertsService', 'stompClientService', 'AuthServerProvider', 'schedulerService', 'proxyGrpcService', 'Visualmetadata', 'VisualizationUtils', 'D3Utils'];

    function notificationSetController($scope, $state, alertsService, stompClientService, AuthServerProvider, schedulerService, proxyGrpcService, Visualmetadata, VisualizationUtils, D3Utils) {
        var vm = this;
        vm.pageSize = 3;
        vm.setPage = setPage;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.range = range;
        vm.noOfPages = 1;
        vm.currentPage = 0;
        vm.count = 0;
        vm.pagedItems = [];
        vm.visualmetadata = [];
        var index = 0;
        vm.notificationSupportCharts = ['Pie Chart', 'Line Chart', 'Clustered Vertical Bar Chart', 'Clustered Horizontal Bar Chart',
            'Stacked Vertical Bar Chart', 'Stacked Horizontal Bar Chart', 'Heat Map', 'Combo Chart', 'Tree Map',
            'Info-graphic', 'Bullet Chart', 'Doughnut Chart', 'KPI', 'Scatter plot']

        active();

        function active() {
            // vm.alerts=vm.releaseAlert.alerts;
            // vm.count=vm.releaseAlert.count;
            vm.pagedItems = []

            connectWebSocket();
            getScheduledReportsCount();
        }

        function getSchedulerReportsAndEngineData(pageSize, page) {
            index = 0;
            proxyGrpcService.getSchedulerReportsAndEngineData(pageSize, page);
        }

        function onGetReleaseAlertsError(error) {

        }

        function range(start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        function prevPage() {
            if (vm.currentPage > 0) {
                vm.currentPage--;
                getSchedulerReportsAndEngineData(vm.pageSize, vm.currentPage);
            }
        };

        function nextPage() {
            if (vm.currentPage < vm.noOfPages - 1) {
                vm.currentPage++;
                getSchedulerReportsAndEngineData(vm.pageSize, vm.currentPage);
            }
        };

        function setPage(n) {
            vm.currentPage = n;
            getSchedulerReportsAndEngineData(vm.pageSize, vm.currentPage);
        };
        function connectWebSocket() {
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
                    vm.pagedItems = [];
                    stompClientService.subscribe("/user/exchange/scheduledReports", onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                vm.pagedItems = [];
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
        }

        function onExchangeMetadata(data) {
            var metaData = JSON.parse(data.body);
            var notificationWidth = parseFloat(angular.element("#notification-panel").css('width'));

            angular.element("#notification-panel").html('');
            Visualmetadata.get({
                id: removePrefix(metaData.notification.report.thresholdAlert, metaData.notification.report_line_item.visualizationid)
            }).
                $promise.then(
                    function (response) {
                        var obj = {};
                        if (metaData.queryResponse != "") {
                            obj.data = JSON.parse(metaData.queryResponse).data;

                            obj.title = metaData.notification.report.title_name;
                            obj.property = response.properties;
                            obj.visualization = metaData.notification.report_line_item.visualization;
                            obj.visualizationid = metaData.notification.report_line_item.visualizationid;
                            obj.Comment = metaData.notification.report.mail_body;
                            var features = VisualizationUtils.getDimensionsAndMeasuresForNotification(response.fields),
                                dimensions = features.dimensions,
                                measures = features.measures,
                                colorSet = D3Utils.getDefaultColorset();

                            vm.visualmetadata.push(response);

                            var id = thresholdAlert(metaData.notification.report.thresholdAlert, metaData.notification.report_line_item.visualizationid);
                            var title =
                                '<div class="tab">'
                                + '<input type="checkbox" id="' + metaData.notification.report_line_item.visualizationid + '">'
                                + '<label class="tab-label" for="' + metaData.notification.report_line_item.visualizationid + '">' + obj.title + '</label>'
                                + '<div class="tab-content" >'
                                + '<div height="250" width="' + notificationWidth + '" style="height:250px;width:' + notificationWidth + 'px;" id="content-' + id + '"></div>'
                                + '<div class="description">'
                                + '<div><p>' + metaData.notification.report.mail_body + '</p>'
                                + '<div class="text-center">'

                                + '<a title="Go to Dashboard" href="' + metaData.notification.report.build_url + '" target="_blank"><svg uib-tooltip="Go to Dashboard" tooltip-placement="top" class="flaticon dashboard" >'
                                + '<use xlink:href="#nav-dashboard" />'
                                + '</svg><a>'

                                + '<a title="Go to View" uib-tooltip="Go to View" tooltip-placement="bottom" href="' + metaData.notification.report.share_link + '" target="_blank"><svg class="flaticon view">'
                                + '<use xlink:href="#view" />'
                                + '</svg><a>'

                                + '<a title="Flair Insights" uib-tooltip="Flair Insights" tooltip-placement="bottom" href="' + "#/administration/report-management/report/" + obj.visualizationid + "/" + metaData.notification.report.thresholdAlert + '" target="_blank"><svg class="flaticon alarm">'
                                + '<use xlink:href="#alarm" />'
                                + '</svg><a>'

                                + '</div>'
                                + '</div>'
                                + ' </div>';
                            angular.element("#notification-panel").append(title);
                            var div = $("#content-" + id)
                            if (obj.data.length > 0) {

                                var result = {};
                                if (obj.visualization == "Clustered Vertical Bar Chart" || obj.visualization == "Clustered Horizontal Bar Chart" || obj.visualization == "Stacked Horizontal Bar Chart" || obj.visualization == "Stacked Vertical Bar Chart") {

                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['showXaxis'] = false;
                                    result['showYaxis'] = false;
                                    result['isFilterGrid'] = false;
                                    result['showLegend'] = false;
                                    result['showGrid'] = false;
                                    result['showXaxisLabel'] = false;
                                    result['showYaxisLabel'] = false;
                                    result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                                    result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                                    result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                                    result['showValues'] = [];
                                    result['displayNameForMeasure'] = [];
                                    result['fontStyle'] = [];
                                    result['fontWeight'] = [];
                                    result['fontSize'] = [];
                                    result['numberFormat'] = [];
                                    result['textColor'] = [];
                                    result['displayColor'] = [];
                                    result['borderColor'] = [];
                                    result['displayColorExpression'] = [];
                                    result['textColorExpression'] = [];

                                    for (var i = 0; i < measures.length; i++) {

                                        result['showValues'].push(false);
                                        result['displayNameForMeasure'].push(
                                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                            metaData.notification.report_line_item.measure[i]
                                        );
                                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                        result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                        result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                                        result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                                        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                    }
                                    obj.config = result;

                                    if (obj.visualization == "Clustered Vertical Bar Chart") {
                                        var clusteredverticalbar = flairVisualizations.clusteredverticalbar()
                                            .config(obj.config)
                                            .tooltip(true)
                                            .notification(true)
                                            .data(obj.data)
                                            .print(false);

                                        clusteredverticalbar(div[0]);
                                        obj.chartHtml = clusteredverticalbar._getHTML()
                                    }
                                    else if (obj.visualization == "Clustered Horizontal Bar Chart") {
                                        var clusteredhorizontalbar = flairVisualizations.clusteredhorizontalbar()
                                            .config(obj.config)
                                            .tooltip(true)
                                            .notification(true)
                                            .data(obj.data)
                                            .print(false);

                                        clusteredhorizontalbar(div[0]);
                                    }
                                    else if (obj.visualization == "Stacked Vertical Bar Chart") {
                                        var stackedverticalbar = flairVisualizations.stackedverticalbar()
                                            .config(obj.config)
                                            .tooltip(true)
                                            .notification(true)
                                            .data(obj.data)
                                            .print(false);

                                        stackedverticalbar(div[0]);
                                    }
                                    else if (obj.visualization == "Stacked Horizontal Bar Chart") {
                                        var stackedhorizontalbar = flairVisualizations.stackedhorizontalbar()
                                            .config(obj.config)
                                            .tooltip(true)
                                            .notification(true)
                                            .data(obj.data)
                                            .print(false);

                                        stackedhorizontalbar(div[0]);
                                        obj.chartHtml = stackedhorizontalbar._getHTML()
                                    }
                                }
                                if (obj.visualization == "Line Chart") {

                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['showXaxis'] = false;
                                    result['showYaxis'] = false;
                                    result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                                    result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                                    result['showXaxisLabel'] = false;
                                    result['showYaxisLabel'] = false;
                                    result['showLegend'] = false;
                                    result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                                    result['showGrid'] = false
                                    result['isFilterGrid'] = false;
                                    result['displayName'] = metaData.notification.report_line_item.dimension[0];

                                    result['showValues'] = [];
                                    result['displayNameForMeasure'] = [];
                                    result['fontStyle'] = [];
                                    result['fontWeight'] = [];
                                    result['fontSize'] = [];
                                    result['numberFormat'] = [];
                                    result['textColor'] = [];
                                    result['displayColor'] = [];
                                    result['borderColor'] = [];
                                    result['lineType'] = [];
                                    result['pointType'] = [];
                                    result['displayColorExpression'] = [];
                                    result['textColorExpression'] = [];

                                    for (var i = 0; i < measures.length; i++) {

                                        result['showValues'].push(false);
                                        result['displayNameForMeasure'].push(
                                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                            metaData.notification.report_line_item.measure[i]
                                        );
                                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                        result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                        result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                                        result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type').toLowerCase());
                                        result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
                                        result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                                        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                    }
                                    obj.config = result;

                                    var line = flairVisualizations.line()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    line(div[0])
                                }
                                if (obj.visualization == "Combo Chart") {

                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['showXaxis'] = false;
                                    result['showYaxis'] = false;
                                    result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                                    result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                                    result['showXaxisLabel'] = false;
                                    result['showYaxisLabel'] = false;
                                    result['showLegend'] = false;
                                    result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                                    result['showGrid'] = false
                                    result['isFilterGrid'] = false;
                                    result['displayName'] = metaData.notification.report_line_item.dimension[0];

                                    result['showValues'] = [];
                                    result['displayNameForMeasure'] = [];
                                    result['fontStyle'] = [];
                                    result['fontWeight'] = [];
                                    result['fontSize'] = [];
                                    result['numberFormat'] = [];
                                    result['textColor'] = [];
                                    result['displayColor'] = [];
                                    result['borderColor'] = [];
                                    result['lineType'] = [];
                                    result['pointType'] = [];
                                    result['comboChartType'] = [];
                                    result['displayColorExpression'] = [];
                                    result['textColorExpression'] = [];

                                    for (var i = 0; i < measures.length; i++) {

                                        result['showValues'].push(false);
                                        result['displayNameForMeasure'].push(
                                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                            metaData.notification.report_line_item.measure[i]
                                        );
                                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                        result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                        result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                                        result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type').toLowerCase());
                                        result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
                                        result['comboChartType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Combo chart type'));
                                        result['comboChartType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Combo chart type'));
                                        result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                                        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                    }
                                    obj.config = result;

                                    var combo = flairVisualizations.combo()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    combo(div[0]);
                                }
                                if (obj.visualization == "Scatter plot") {

                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['showXaxis'] = false;
                                    result['showYaxis'] = false;
                                    result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                                    result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                                    result['showXaxisLabel'] = false;
                                    result['showYaxisLabel'] = false;
                                    result['showLegend'] = false;
                                    result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                                    result['showGrid'] = false

                                    result['displayName'] = metaData.notification.report_line_item.dimension[0];

                                    result['showValues'] = [];
                                    result['displayNameForMeasure'] = [];
                                    result['fontStyle'] = [];
                                    result['fontWeight'] = [];
                                    result['fontSize'] = [];
                                    result['numberFormat'] = [];
                                    result['textColor'] = [];
                                    result['displayColor'] = [];
                                    result['borderColor'] = [];
                                    result['lineType'] = [];
                                    result['pointType'] = [];

                                    for (var i = 0; i < measures.length; i++) {

                                        result['showValues'].push(false);
                                        result['displayNameForMeasure'].push(
                                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                            metaData.notification.report_line_item.measure[i]
                                        );
                                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                        result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                        result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);

                                    }
                                    obj.config = result;


                                    var scatter = flairVisualizations.scatter()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    scatter(div[0]);
                                }
                                if (obj.visualization == "Pie Chart") {
                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['legend'] = false
                                    result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                                    result['valueAs'] = VisualizationUtils.getPropertyValue(obj.property, 'Show value as').toLowerCase();
                                    result['valueAsArc'] = VisualizationUtils.getPropertyValue(obj.property, 'Value as Arc');
                                    obj.config = result;

                                    var pie = flairVisualizations.pie()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false)

                                    pie(div[0])
                                }
                                if (obj.visualization == "Doughnut Chart") {
                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['legend'] = false
                                    result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                                    result['valueAs'] = VisualizationUtils.getPropertyValue(obj.property, 'Show value as').toLowerCase();
                                    result['valueAsArc'] = VisualizationUtils.getPropertyValue(obj.property, 'Value as Arc');

                                    result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                                    result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measure'][0];

                                    result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
                                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                                    result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Show Labels');
                                    result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Colour of labels');

                                    obj.config = result;

                                    var doughnut = flairVisualizations.doughnut()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false)

                                    doughnut(div[0]);
                                }
                                if (obj.visualization == "Gauge plot") {

                                    result['measures'] = D3Utils.getNames(measures);
                                    result['gaugeType'] = VisualizationUtils.getPropertyValue(obj.property, 'Gauge Type').toLowerCase();

                                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measures'][0];
                                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                                    result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                                    var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                                    result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor
                                    result['isGradient'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Enable Gradient Color');
                                    result['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');

                                    result['targetDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display name') || result['measures'][1];
                                    result['targetFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font style');
                                    result['targetFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font weight');
                                    result['targetShowValues'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Value on Points');
                                    var targetDisplayColor = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display colour');
                                    result['targetDisplayColor'] = (targetDisplayColor == null) ? colorSet[1] : targetDisplayColor
                                    result['targetTextColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Text colour');
                                    result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                                    obj.config = result;

                                    var gauge = flairVisualizations.gauge()
                                        .config(obj.config)
                                        .data(obj.data)
                                        .print(false);
                                    gauge(div[0]);
                                }
                                if (obj.visualization == "Table") {
                                    angular.element(div).text("Click on View Widget to see visulization");
                                    angular.element(div).innerHeight("auto");
                                }
                                if (obj.visualization == "Pivot Table") {
                                    angular.element(div).text("Click on View Widget to see visulization");
                                    angular.element(div).innerHeight("auto");
                                }
                                if (obj.visualization == "KPI") {

                                    result['measure'] = D3Utils.getNames(measures);
                                    result['kpiAlignment'] = VisualizationUtils.getPropertyValue(obj.property, 'Text alignment');
                                    result['isAnimation'] = VisualizationUtils.getPropertyValue(obj.property, 'Show Animation');
                                    result['kpiDisplayName'] = [];

                                    result['kpiBackgroundColor'] = [];
                                    result['kpiNumberFormat'] = [];
                                    result['kpiFontStyle'] = [];
                                    result['kpiFontWeight'] = [];
                                    result['kpiFontSize'] = [];
                                    result['kpiColor'] = [];
                                    result['kpiColorExpression'] = [];
                                    result['kpiIcon'] = [];
                                    result['kpiIconFontWeight'] = [];
                                    result['kpiIconColor'] = [];
                                    result['kpiIconExpression'] = [];
                                    result['FontSizeforDisplayName'] = [];
                                    result['showIcon'] = [];
                                    result['iconSize'] = [];
                                    for (var i = 0; i < measures.length; i++) {
                                        result['kpiDisplayName'].push(
                                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                            result['measure'][i]
                                        );

                                        result['kpiBackgroundColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour'));
                                        result['kpiNumberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                        result['kpiFontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                        result['kpiFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                        result['kpiFontSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                                        result['kpiColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                        result['kpiColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                        result['kpiIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                                        result['showIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Icon'));
                                        result['kpiIconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
                                        result['iconSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font size'));

                                        result['kpiIconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon colour'));
                                        result['kpiIconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                                        result['FontSizeforDisplayName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size for diplay name'));
                                    }
                                    obj.config = result;

                                    var kpi = flairVisualizations.kpi()
                                        .config(obj.config)
                                        .data(obj.data)
                                        .notification(true)
                                        .print(false)

                                    kpi(div[0])
                                }
                                if (obj.visualization == "Info-graphic") {
                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);

                                    result['chartType'] = VisualizationUtils.getPropertyValue(obj.property, 'Info graphic Type').toLowerCase();
                                    var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                                    result['chartDisplayColor'] = (displayColor == null) ? colorSet[0] : displayColor;
                                    var borderColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Border colour');
                                    result['chartBorderColor'] = (borderColor == null) ? colorSet[1] : borderColor;

                                    result['kpiDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['dimension'][0];
                                    result['kpiAlignment'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text alignment');
                                    result['kpiBackgroundColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Background Colour');
                                    result['kpiNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                                    result['kpiFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                                    result['kpiFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                                    result['kpiFontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
                                    result['kpiColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                                    result['kpiColorExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour expression');
                                    result['kpiIcon'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon name');
                                    result['kpiIconFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Font weight');
                                    result['kpiIconColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon colour');
                                    result['kpiIconExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Expression');

                                    obj.config = result;

                                    var infographics = flairVisualizations.infographics()
                                        .config(obj.config)
                                        .notification(true)
                                        .tooltip(true)
                                        .data(obj.data)
                                        .print(false)

                                    infographics(div[0]);
                                }
                                if (obj.visualization == "Map") {
                                    angular.element(div).text("Click on View Widget to see visulization");
                                    angular.element(div).innerHeight("auto");
                                }
                                if (obj.visualization == "Tree Map") {
                                    result['maxDim'] = dimensions.length;
                                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                                    result['showValues'] = false;
                                    result['valueTextColour'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                                    result['fontStyleForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                                    result['fontWeightForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                                    result['fontSizeForMes'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size'));
                                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                                    result['measure'] = [measures[0].feature.name];
                                    result['dimension'] = [];
                                    result['showLabelForDimension'] = [];
                                    result['labelColorForDimension'] = [];
                                    result['fontStyleForDimension'] = [];
                                    result['fontWeightForDimension'] = [];
                                    result['fontSizeForDimension'] = [];
                                    result['displayColor'] = [];
                                    result['colorSet'] = colorSet;

                                    for (var i = 0, j = ''; i < result.maxDim; i++ , j = i + 1) {
                                        result['dimension'].push(dimensions[i].feature.name);
                                        result['showLabelForDimension'].push(false);
                                        result['labelColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Colour of labels'));
                                        var displayColor = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour');
                                        result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                        //  result['displayColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour'));
                                        result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                                        result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                                        result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                                    }

                                    obj.config = result;

                                    var treemap = flairVisualizations.treemap()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    treemap(div[0])
                                }
                                if (obj.visualization == "Heat Map") {
                                    result['dimension'] = [D3Utils.getNames(dimensions)[0]];
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['maxMes'] = measures.length;
                                    result['dimLabelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
                                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                                    result['fontStyleForDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                                    result['fontWeightForDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                                    result['fontSizeForDimension'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                                    result["colorPattern"] = VisualizationUtils.getPropertyValue(obj.property, "Color Pattern").toLowerCase().replace(' ', '_');

                                    var displayColor = VisualizationUtils.getPropertyValue(obj.property, 'Display colour');
                                    result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor;

                                    result['displayNameForMeasure'] = [];
                                    result['showValues'] = [];
                                    result['showIcon'] = [];
                                    result['valuePosition'] = [];
                                    result['iconName'] = [];
                                    result['iconExpression'] = [];
                                    result['iconFontWeight'] = [];
                                    result['iconPosition'] = [];
                                    result['iconColor'] = [];
                                    result['colourCoding'] = [];
                                    result['valueTextColour'] = [];
                                    result['displayColorMeasure'] = [];
                                    result['fontStyleForMeasure'] = [];
                                    result['fontWeightForMeasure'] = [];
                                    result['fontSizeForMeasure'] = [];
                                    result['numberFormat'] = [];

                                    for (var i = 0; i < result.maxMes; i++) {
                                        result['displayNameForMeasure'].push(
                                            VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                            result['measure'][i]
                                        );
                                        result['showValues'].push(false);
                                        result['showIcon'].push(false);
                                        result['valuePosition'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Alignment').toLowerCase());
                                        result['iconName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                                        result['iconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
                                        result['iconPosition'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position').toLowerCase());
                                        result['iconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                        result['colourCoding'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                                        result['valueTextColour'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                        result['displayColorMeasure'].push(colorSet[i]);
                                        result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                        result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                        result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                        result['iconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));

                                    }
                                    obj.config = result;

                                    var heatmap = flairVisualizations.heatmap()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    heatmap(div[0])
                                }
                                if (obj.visualization == "Bullet Chart") {
                                    result['dimension'] = [D3Utils.getNames(dimensions)[0]];
                                    result['measures'] = D3Utils.getNames(measures);

                                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                                    result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                                    result['showLabel'] = false;

                                    var valueColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                                    result['valueColor'] = (valueColor == null) ? colorSet[0] : valueColor;
                                    var targetColor = VisualizationUtils.getFieldPropertyValue(measures[1], 'Target colour');
                                    result['targetColor'] = (targetColor == null) ? colorSet[1] : targetColor;

                                    result['orientation'] = VisualizationUtils.getPropertyValue(obj.property, 'Orientation');
                                    result['segments'] = VisualizationUtils.getPropertyValue(obj.property, 'Segments');
                                    result['segmentInfo'] = VisualizationUtils.getPropertyValue(obj.property, 'Segment Color Coding');
                                    result['measureNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                                    result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');
                                    obj.config = result;

                                    var bullet = flairVisualizations.bullet()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    bullet(div[0])
                                }
                                if (obj.visualization == "Chord Diagram") {
                                    result['showLabels'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Show Labels');
                                    result['labelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
                                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                                    result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures)[0];
                                    obj.config = result;
                                    var chorddiagram = flairVisualizations.chorddiagram()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    chorddiagram(div[0])
                                }
                                if (obj.visualization == "Sankey") {
                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['maxDim'] = dimensions.length;
                                    result['maxMes'] = measures.length;
                                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                                    var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                                    result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor
                                    var borderColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Border colour');
                                    result['borderColor'] = (borderColor == null) ? colorSet[1] : borderColor
                                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                                    result['showLabels'] = [];
                                    result['fontStyle'] = [];
                                    result['fontWeight'] = [];
                                    result['fontSize'] = [];
                                    result['textColor'] = [];
                                    result['colorList'] = colorSet;
                                    for (var i = 0; i < result.maxDim; i++) {
                                        result['showLabels'].push(false);
                                        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                                        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                                        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                                        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                                    }
                                    obj.config = result;
                                    var sankey = flairVisualizations.sankey()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    sankey(div[0])
                                }
                                if (obj.visualization == "Pie Grid") {
                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['colorSet'] = colorSet;
                                    result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                                    result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measure'][0];
                                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                                    result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
                                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                                    result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Colour of labels');
                                    result['showValue'] = false;
                                    result['showLabel'] = false;
                                    obj.config = result;
                                    var piegrid = flairVisualizations.piegrid()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    piegrid(div[0])
                                }
                                if (obj.visualization == "Number Grid") {
                                    result['dimension'] = D3Utils.getNames(dimensions);
                                    result['measure'] = D3Utils.getNames(measures);
                                    result['colorSet'] = colorSet;
                                    result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                                    result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measure'][0];
                                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                                    result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
                                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                                    result['showValue'] = false;
                                    result['showLabel'] = true;
                                    result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Colour of labels');
                                    result['fontSizeforDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size for diplay name');
                                    obj.config = result;
                                    var numbergrid = flairVisualizations.numbergrid()
                                        .config(obj.config)
                                        .tooltip(true)
                                        .notification(true)
                                        .data(obj.data)
                                        .print(false);

                                    numbergrid(div[0])
                                }

                                vm.pagedItems.push({
                                    chart: obj,
                                    notification: metaData.notification
                                })

                            }
                            else {
                                div.css({
                                    'display': 'flex',
                                    'align-items': 'center',
                                    'justify-content': 'center'
                                });
                                div[0].innerHTML = "Data not available";
                            }
                        }

                    });

        }

        function getScheduledReportsCount() {
            schedulerService.getScheduledReportsCount().then(function (result) {
                vm.count = result.data.count;
                vm.noOfPages = Math.ceil(vm.count / vm.pageSize);
            }, onGetScheduledReportsCountError);
        }

        function onGetScheduledReportsCountError(error) {

        }
        function removePrefix(thresholdAlert, vizId) {
            return thresholdAlert ? vizId.split(":")[1] : vizId;
        }
        function thresholdAlert(thresholdAlert, vizId) {
            return thresholdAlert ? vizId.split(":")[1] + "_thresholdAlert" : vizId;
        }
    }
})();