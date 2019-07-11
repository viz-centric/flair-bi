(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('notificationSetComponent', {
            templateUrl: 'app/home/notification-set.component.html',
            controller: notificationSetController,
            controllerAs: 'vm'
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
            schedulerService.getSchedulerReportsAndEngineData(pageSize, page);
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
            var container = d3.select("#notification_accordion");

            var isExpand;
            angular.element("#notification_accordion").html('');
            Visualmetadata.get({
                id: metaData.report_line_item.visualizationid
            }, function (v) {
                v.data = JSON.parse(metaData.queryResponse);
                v.build_url = metaData.report.build_url;
                v.share_link = metaData.report.share_link;
                v.comment = metaData.report.mail_body

                vm.visualmetadata.push(new VisualWrap(v));
            });

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