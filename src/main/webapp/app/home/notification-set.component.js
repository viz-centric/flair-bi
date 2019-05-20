(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('notificationSetComponent', {
            templateUrl: 'app/home/notification-set.component.html',
            controller: notificationSetController,
            controllerAs: 'vm'
        });

    notificationSetController.$inject = ['$scope', '$state', 'alertsService', 'stompClientService', 'AuthServerProvider', 'schedulerService', 'Visualmetadata', 'VisualizationUtils', 'D3Utils'];

    function notificationSetController($scope, $state, alertsService, stompClientService, AuthServerProvider, schedulerService, Visualmetadata, VisualizationUtils, D3Utils) {
        var vm = this;
        vm.pageSize = 5;
        vm.setPage = setPage;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.range = range;
        vm.noOfPages = 1;
        vm.currentPage = 0;
        vm.count = 0;
        vm.pagedItems = [];
        vm.visualmetadata = [];

        active();

        function active() {
            // vm.alerts=vm.releaseAlert.alerts;
            // vm.count=vm.releaseAlert.count;
            vm.pagedItems = []
            connectWebSocket();
            getScheduledReportsCount();
        }


        function getScheduleReports(pageSize, page) {
            vm.pagedItems = [];
            schedulerService.getScheduleReports(pageSize, page);
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
                getScheduleReports(vm.pageSize, vm.currentPage);
            }
        };

        function nextPage() {
            if (vm.currentPage < vm.noOfPages - 1) {
                vm.currentPage++;
                getScheduleReports(vm.pageSize, vm.currentPage);
            }
        };

        function setPage(n) {
            vm.currentPage = n;
            getScheduleReports(vm.pageSize, vm.currentPage);
        };
        function connectWebSocket() {
            console.log('notificationSetController connect web socket');
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
                    vm.pagedItems = [];
                    console.log('notificationSetController connected web socket');
                    stompClientService.subscribe("/user/exchange/scheduledReports", onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                console.log('flair-bi controller destorying web socket');
                vm.pagedItems = [];
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
            console.log('notificationSetController on metadata error', data);
        }

        function onExchangeMetadata(data) {
            console.log('notificationSetController on metadata', data);
            var metaData = JSON.parse(data.body);

            Visualmetadata.get({
                id: metaData.report_line_item.visualizationid

            }).
                $promise.then(
                    function (result) {

                        vm.visualmetadata.push(result);
                        var obj = {}
                        obj.data = JSON.parse(metaData.queryResponse).data;
                        obj.title = metaData.report.title_name;
                        obj.property = result.properties;
                        obj.visualization = metaData.report_line_item.visualization;
                        obj.visualizationid = metaData.report_line_item.visualizationid;
                        var features = VisualizationUtils.getDimensionsAndMeasuresForNotification(result.fields),
                            dimensions = features.dimensions,
                            measures = features.measures,
                            colorSet = D3Utils.getDefaultColorset();
                        var result = {};
                        if (obj.visualization == "Clustered Vertical Bar Chart" || obj.visualization == "Clustered Horizontal Bar Chart" || obj.visualization == "Stacked Horizontal Bar Chart" || obj.visualization == "Stacked Vertical Bar Chart") {

                            result['dimension'] = metaData.report_line_item.dimension;
                            result['measure'] = metaData.report_line_item.measure;
                            result['showXaxis'] = false;
                            result['showYaxis'] = false;
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                            result['showXaxisLabel'] = false;
                            result['showYaxisLabel'] = false;
                            result['showLegend'] = false;
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                            result['showGrid'] = VisualizationUtils.getPropertyValue(obj.property, 'Show grid');

                            result['displayName'] = metaData.report_line_item.dimension[0];

                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];

                            for (var i = 0; i < measures.length; i++) {

                                result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    metaData.report_line_item.measure[i]
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
                            d3.select('#svg_' + obj.visualizationid).html('');
                            var svg = d3.select('#svg_' + obj.visualizationid)

                            if (obj.visualization == "Clustered Vertical Bar Chart") {
                                var clusteredverticalbar = flairVisualizations.clusteredverticalbar()
                                    .config(obj.config)
                                    .tooltip(true)
                                    .notification(true)
                                    .print(false);

                                svg.datum(obj.data)
                                    .call(clusteredverticalbar);
                            }
                            else if (obj.visualization == "Clustered Horizontal Bar Chart") {
                                var clusteredhorizontalbar = flairVisualizations.clusteredhorizontalbar()
                                    .config(obj.config)
                                    .tooltip(true)
                                    .notification(true)
                                    .print(false);

                                svg.datum(obj.data)
                                    .call(clusteredhorizontalbar);
                            }
                            else if (obj.visualization == "Stacked Vertical Bar Chart") {
                                var stackedverticalbar = flairVisualizations.stackedverticalbar()
                                    .config(obj.config)
                                    .tooltip(true)
                                    .notification(true)
                                    .print(false);

                                svg.datum(obj.data)
                                    .call(stackedverticalbar);
                            }
                            else if (obj.visualization == "Stacked Horizontal Bar Chart") {
                                var stackedhorizontalbar = flairVisualizations.stackedhorizontalbar()
                                    .config(obj.config)
                                    .tooltip(true)
                                    .notification(true)
                                    .print(false);

                                svg.datum(obj.data)
                                    .call(stackedhorizontalbar);
                            }

                        }
                        vm.pagedItems.push(obj)

                    },
                    function (error) { }
                );
        }

        function getScheduledReportsCount() {
            schedulerService.getScheduledReportsCount().then(function (result) {
                vm.count = result.data;
                vm.noOfPages = Math.ceil(vm.count / vm.pageSize);
            }, onGetScheduledReportsCountError);
        }

        function onGetScheduledReportsCountError(error) {

        }
    }
})();