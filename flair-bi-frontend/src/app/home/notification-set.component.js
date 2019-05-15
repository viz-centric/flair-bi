import angular from 'angular';
import notificationSet from './notification-set.component.html';

angular.module('flairbiApp')
    .component('notificationSetComponent', {
        template: notificationSet,
        controller: notificationSetController,
        controllerAs: 'vm'
    });

notificationSetController.$inject = ['$scope', '$state', 'alertsService', 'stompClientService', 'AuthServerProvider', 'schedulerService'];

function notificationSetController($scope, $state, alertsService, stompClientService, AuthServerProvider, schedulerService) {
    var vm = this;
    vm.pageSize = 5;
    vm.setPage = setPage;
    vm.nextPage = nextPage;
    vm.prevPage = prevPage;
    vm.range = range;
    vm.noOfPages = 1;
    vm.currentPage = 0;
    vm.count = 0;

    active();

    function active() {
        // vm.alerts=vm.releaseAlert.alerts;
        // vm.count=vm.releaseAlert.count;
        connectWebSocket();
        getScheduledReportsCount();
    }


    function getScheduleReports(pageSize, page) {
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
            {token: AuthServerProvider.getToken()},
            function (frame) {
                console.log('notificationSetController connected web socket');
                stompClientService.subscribe("/user/exchange/scheduledReports", onExchangeMetadata);
                stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
            }
        );

        $scope.$on("$destroy", function (event) {
            console.log('flair-bi controller destorying web socket');
            stompClientService.disconnect();
        });
    }

    function onExchangeMetadataError(data) {
        console.log('notificationSetController on metadata error', data);
    }

    function onExchangeMetadata(data) {
        console.log('notificationSetController on metadata', data);
        var metaData = JSON.parse(data.body);
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
