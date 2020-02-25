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
                            + '<div><p>' + metaData.notification.report.mail_body + '</p><div>'
                            + '<a href="' + metaData.notification.report.share_link + '" class="btn btn-default" role="button">Go to Widget</a>'
                            + '<a href="' + metaData.notification.report.build_url + '" class="btn btn-default" role="button">Go to Dashboard</a>'
                            + '</div>'
                            + '</div>'
                            + ' </div>';
                        angular.element("#notification-panel").append(title)

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

                            var div = $("#content-" + id)

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
                       
                        vm.pagedItems.push({
                            chart: obj,
                            notification: metaData.notification
                        })
                        
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