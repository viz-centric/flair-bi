(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('flairInsightComponent', {
            templateUrl: 'app/home/details/flair-insight.component.html',
            controller: FlairInsightController,
            controllerAs: 'vm',
            bindings: {
                pagingParams: '<'
            },
        });

    FlairInsightController.$inject = ['ReportManagementUtilsService',
        'AccountDispatch',
        '$rootScope',
        'paginationConstants',
        'schedulerService'];
    function FlairInsightController(ReportManagementUtilsService,
        AccountDispatch,
        $rootScope,
        paginationConstants,
        schedulerService) {
        var vm = this;

        vm.updateReport = updateReport;
        vm.goToBuildPage = goToBuildPage;
        vm.executeNow = executeNow;
        vm.searchReports = searchReports;

        vm.page = 1;

        vm.reports = [];
        vm.thresholdAlert = false;

        ////////////////

        vm.$onInit = function () {
            vm.predicate = vm.pagingParams.predicate;
            vm.reverse = vm.pagingParams.ascending;
            vm.itemsPerPage = paginationConstants.itemsPerPage;
            vm.account = AccountDispatch.getAccount();
            vm.reportName = vm.reportName || '';
            getScheduledReports(vm.account.login, vm.reportName);
        };
        vm.$onChanges = function (_changesObj) { };
        vm.$onDestroy = function () { };

        function searchReports() {
            vm.reportName = vm.reportName ? vm.reportName : "";
            getScheduledReports(vm.account.login, vm.reportName);
        }

        function getScheduledReports(userName, reportName) {
            schedulerService.filterScheduledReports(userName, reportName, "", "", vm.itemsPerPage, vm.page - 1, vm.thresholdAlert)
                .then(
                    function (response) {
                        console.log(response.data);
                        vm.reports = response.data.reports;
                        vm.totalItems = response.data.totalRecords;
                        vm.queryCount = vm.totalItems;
                    },
                    function (error) {
                        var info = {
                            text: error.statusText,
                            title: "Error"
                        }
                        $rootScope.showErrorSingleToast(info);
                    });
        }

        function updateReport(id) {
            ReportManagementUtilsService.updateReport(id);
        }

        function goToBuildPage(build_url) {
            ReportManagementUtilsService.goToBuildPage(build_url);
        }

        function executeNow(id) {
            ReportManagementUtilsService.executeNow(id);
        }
    }
})();