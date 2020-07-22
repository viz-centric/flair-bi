(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('reportListComponent', {
            templateUrl: 'app/admin/report-management/report-list/report-list.component.html',
            controller: reportList,
            controllerAs: 'vm',
            bindings: {
                report: "="
            }
        });

    reportList.$inject = ['schedulerService',
        '$rootScope',
        'AccountDispatch',
        'ReportManagementUtilsService',
        'ComponentDataService',
        '$stateParams'];

    function reportList(schedulerService,
        $rootScope,
        AccountDispatch,
        ReportManagementUtilsService,
        ComponentDataService,
        $stateParams) {
        var vm = this;

        vm.reports = [];
        vm.page = 1;
        vm.totalItems = 0;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.itemsPerPage = 20;
        vm.parseCron = parseCron;
        vm.executeNow = executeNow;
        vm.goToBuildPage = goToBuildPage;
        vm.deleteReport = deleteReport;
        vm.updateReport = updateReport;
        vm.onFilterApplied = onFilterApplied;
        vm.toggleFilters = toggleFilters;
        vm.thresholdAlert = $stateParams.thresholdAlert ? $stateParams.thresholdAlert : false;
        vm.isOpen = false;

        vm.$onInit = activate;
        ///////////////////////////////////////

        function activate() {
            getAccount();
            getScheduledReports(vm.userId, "", "", "", vm.thresholdAlert,"","");
        }

        function getAccount() {
            vm.account = AccountDispatch.getAccount();
            vm.isAdmin = AccountDispatch.isAdmin();
            vm.userId = vm.isAdmin ? "" : vm.account.login;
        }

        function getScheduledReports(userId, reportName, startDate, endDate, thresholdAlert,dashboardName,viewName) {
            schedulerService.filterScheduledReports(userId, reportName, startDate, endDate, vm.itemsPerPage, vm.page - 1, thresholdAlert,dashboardName,viewName).then(
                function (response) {
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
        function loadPage(page) {
            vm.page = page;
            getScheduledReports(vm.userId, vm.reportName, vm.fromDate, vm.toDate, vm.thresholdAlert,vm.dashboardName,vm.viewName);
        }
        function parseCron(cronExp) {
            return cronstrue.toString(cronExp);
        }
        function executeNow(vizID) {
            ReportManagementUtilsService.executeNow(vizID);
        }

        function goToBuildPage(build_url) {
            ReportManagementUtilsService.goToBuildPage(build_url);
        }

        function deleteReport(id) {
            schedulerService.cancelScheduleReport(id).then(function (success) {
                var info = {
                    text: success.data.message,
                    title: "Cancelled"
                }
                $rootScope.showSuccessToast(info);
                getScheduledReports(vm.userId, vm.reportName, vm.fromDate, vm.toDate, vm.thresholdAlert,vm.dashboardName,vm.viewName);
            }).catch(function (error) {
                var info = {
                    text: error.data.message,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            });
        }
        function updateReport(visualizationid) {
            ReportManagementUtilsService.updateReport(visualizationid);
            // getScheduledReports(vm.userId, vm.reportName, vm.fromDate, vm.toDate, vm.thresholdAlert,vm.dashboardName,vm.viewName);
        }

        function onFilterApplied(filters){
            vm.dashboardName = filters.dashboardName;
            vm.viewName = filters.viewName;
            vm.userId = filters.userId;
            vm.reportName =  filters.reportName;
            vm.fromDate = filters.fromDate;
            vm.toDate = filters.toDate;
            vm.thresholdAlert = filters.thresholdAlert;
            getScheduledReports(filters.userId, filters.reportName, filters.fromDate, filters.toDate, filters.thresholdAlert,filters.dashboardName,filters.viewName);
        }

        function toggleFilters(){
            vm.isOpen = !vm.isOpen;
        }

    }
})();
