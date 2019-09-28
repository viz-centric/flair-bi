(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('notificationSetComponent', {
            templateUrl: 'app/home/notification-set.component.html',
            controller: notificationSetController,
            controllerAs: 'vm',
            bindings: {
                alert: "="
            }
        });

    notificationSetController.$inject = ['$scope', '$state', 'alertsService', 'stompClientService', 'AuthServerProvider', 'schedulerService', 'proxyGrpcService', 'Visualmetadata', 'VisualizationUtils', 'visualizationRenderService', 'VisualWrap'];

    function notificationSetController($scope, $state, alertsService, stompClientService, AuthServerProvider, schedulerService, proxyGrpcService, Visualmetadata, VisualizationUtils, visualizationRenderService, VisualWrap) {
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
        vm.gridStackOptions = {
            cellHeight: 60,
            verticalMargin: 10,
            disableOneColumnMode: true,
            animate: true,
            disableDrag: true,
            disableResize: true
        };
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
            vm.visualmetadata = [];
            var metaData = JSON.parse(data.body);
            var notification = metaData.notification;
            var queryResponse = metaData.queryResponse;
            Visualmetadata.get({
                id: removePrefix(notification.report.thresholdAlert, notification.report_line_item.visualizationid)
            }, function (v) {
                if (vm.notificationSupportCharts.indexOf(notification.report_line_item.visualization) >= 0) {
                    v.data = JSON.parse(queryResponse);
                    v.build_url = notification.report.build_url;
                    v.share_link = notification.report.share_link;
                    v.comment = notification.report.mail_body;
                    vm.visualmetadata.push(new VisualWrap(v));
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

        function removePrefix(thresholdAlert,vizId){
            return thresholdAlert?vizId.split(":")[1]:vizId;
        }
    }
})();
