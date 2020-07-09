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

        vm.fromDate = null;
        vm.toDate = null;

        vm.links = null;
        vm.loadPage = loadPage;
        vm.itemsPerPage = 20;
        vm.parseCron = parseCron;
        vm.executeNow = executeNow;
        vm.goToBuildPage = goToBuildPage;
        vm.deleteReport = deleteReport;
        vm.updateReport = updateReport;
        vm.searchReports = searchReports;

        vm.openCalendar = openCalendar;
        vm.datePickerOpenStatus = {};
        vm.datePickerOpenStatus.fromDate = false;
        vm.datePickerOpenStatus.toDate = false;
        vm.setThresholdAlert = setThresholdAlert;
        vm.thresholdAlert = $stateParams.thresholdAlert ? $stateParams.thresholdAlert : false;
        vm.searchReports = searchReports;
        vm.dateFormat = 'yyyy-MM-dd';
        vm.user = null;

        vm.$onInit = activate;
        ///////////////////////////////////////

        function activate() {
            getAccount();
            getScheduledReports(vm.isAdmin ? "" : vm.account.login, "", "", "", vm.thresholdAlert);
        }

        function getAccount() {
            vm.account = AccountDispatch.getAccount();
            vm.isAdmin = AccountDispatch.isAdmin();
        }

        function searchReports() {
            var user = ComponentDataService.getUser() ? ComponentDataService.getUser().login : "";
            user = vm.isAdmin ? "" : user;
            if (vm.user) {
                user = vm.user.login;
            }
            vm.reportName = vm.reportName ? vm.reportName : "";
            vm.fromDate = vm.fromDate ? vm.fromDate : "";
            vm.toDate = vm.toDate ? vm.toDate : "";
            getScheduledReports(user, vm.reportName, vm.fromDate, vm.toDate, vm.thresholdAlert);
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function setThresholdAlert(thresholdAlert) {
            vm.thresholdAlert = !thresholdAlert;
        }
        function getScheduledReports(userName, reportName, startDate, endDate, thresholdAlert) {
            schedulerService.filterScheduledReports(userName, reportName, startDate, endDate, vm.itemsPerPage, vm.page - 1, thresholdAlert).then(
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
            getScheduledReports(vm.isAdmin ? "" : vm.account.login, "", "", "", vm.thresholdAlert);
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
                getScheduledReports(vm.isAdmin ? "" : vm.account.login, "", "", "", vm.thresholdAlert);
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
            getScheduledReports(vm.isAdmin ? "" : vm.account.login, "", "", "", vm.thresholdAlert);
        }

    }
})();
