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
        'schedulerService',
        'Dashboards',
        'Views'];
    function FlairInsightController(ReportManagementUtilsService,
        AccountDispatch,
        $rootScope,
        paginationConstants,
        schedulerService,
        Dashboards,
        Views) {
        var vm = this;

        vm.updateReport = updateReport;
        vm.goToBuildPage = goToBuildPage;
        vm.executeNow = executeNow;
        vm.searchReports = searchReports;
        vm.onClearClick = onClearClick;
        vm.loadPage = loadPage;
        vm.searchDashboards = searchDashboards;
        vm.searchViews = searchViews;
        vm.setThresholdAlert = setThresholdAlert;
        vm.onDashboardSelect = onDashboardSelect;
        vm.page = 1;
        vm.reports = [];
        vm.thresholdAlert = false;

        ////////////////

        vm.$onInit = function () {
            loadDashboards();
            vm.predicate = vm.pagingParams.predicate;
            vm.reverse = vm.pagingParams.ascending;
            vm.itemsPerPage = paginationConstants.itemsPerPage;
            vm.account = AccountDispatch.getAccount();
            vm.isAdmin = AccountDispatch.isAdmin();
            vm.userId = vm.isAdmin ? "" : vm.account.login;
            getScheduledReports(vm.userId, "", vm.thresholdAlert, "", "");

        };

        vm.$onChanges = function (_changesObj) { };
        vm.$onDestroy = function () { };

        function searchReports() {
            setFilters();
            getScheduledReports(vm.userId, vm.reportName,vm.thresholdAlert,vm.dashboardName,vm.viewName);
        }

        function setFilters(){
            vm.reportName = vm.reportName ? vm.reportName : "";
            vm.dashboardName = vm.dashboard ? vm.dashboard.dashboardName : "";
            vm.viewName = vm.view ? vm.view.viewName : "";
            vm.thresholdAlert = vm.thresholdAlert ? vm.thresholdAlert : false;  
        }

        function onClearClick(){
            vm.reportName = "";
            vm.dashboard = null;
            vm.view = null;
            vm.thresholdAlert = false;
            setFilters();
            getScheduledReports(vm.userId, vm.reportName,vm.thresholdAlert,vm.dashboardName,vm.viewName);
        }


        function loadDashboards() {
            Dashboards.query(function (result) {
                vm.dashboards = result;
            });
        }

        function searchDashboards(searchCriteria) {
            Dashboards.query({
                dashboardName: searchCriteria
            }, function (data) {
                vm.dashboards = data;
            }, function (error) {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.dashboards.error.searched')
                });
            });
        }

        function searchViews(searchCriteria) {
            Views.query({
                viewName: searchCriteria
            }, function (data) {
                vm.views = data;
            }, function () {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.views.error.searched')
                });
            });
        }

        function onDashboardSelect(){
            loadViews();
        }

        function loadViews() {
            Views.query(
                {
                    viewDashboard: vm.dashboard.id
                },
                function (result) {
                    vm.views = result;
                }
            );
        }

        function setThresholdAlert(thresholdAlert) {
            vm.thresholdAlert = !thresholdAlert;
        }

        function getScheduledReports(userName, reportName,thresholdAlert,dashboardName,viewName) {
            schedulerService.filterScheduledReports(userName, reportName, "", "", vm.itemsPerPage, vm.page - 1, thresholdAlert, dashboardName, viewName)
                .then(
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

        function updateReport(id) {
            ReportManagementUtilsService.updateReport(id);
        }

        function goToBuildPage(build_url) {
            ReportManagementUtilsService.goToBuildPage(build_url);
        }

        function executeNow(id) {
            ReportManagementUtilsService.executeNow(id);
        }
        function loadPage(page) {
            vm.page = page;
            setFilters();
            getScheduledReports(vm.userId, vm.reportName,vm.thresholdAlert,vm.dashboardName,vm.viewName);
        }
    }
})();