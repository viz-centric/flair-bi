(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('reportFiltersComponent', {
            templateUrl: 'app/admin/report-management/report-filters/report-filters.component.html',
            controller: ReportFiltersController,
            controllerAs: 'vm',
            bindings: {
                isOpen: '=',
                onFilterApplied: '&'
            }
        });

    ReportFiltersController.$inject = ['Dashboards','Views','AccountDispatch','$stateParams','ComponentDataService'];

    function ReportFiltersController(Dashboards,Views,AccountDispatch,$stateParams,ComponentDataService) {
        var vm = this;
        vm.fromDate = null;
        vm.toDate = null;
        vm.openCalendar = openCalendar;
        vm.datePickerOpenStatus = {};
        vm.datePickerOpenStatus.fromDate = false;
        vm.datePickerOpenStatus.toDate = false;
        vm.searchDashboards = searchDashboards;
        vm.searchViews = searchViews;
        vm.setThresholdAlert = setThresholdAlert;
        vm.onFilterClick = onFilterClick;
        vm.onClearClick = onClearClick;
        vm.onDashboardSelect = onDashboardSelect;
        vm.thresholdAlert = $stateParams.thresholdAlert ? $stateParams.thresholdAlert : false;
        vm.dateFormat = 'yyyy-MM-dd';
        vm.user = null;
        vm.isOpen = false;

        activate();

        function activate() {
            getAccount();
            loadDashboards();
        }

        function getAccount() {
            vm.user = AccountDispatch.getAccount();
            vm.isAdmin = AccountDispatch.isAdmin();
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

        function onFilterClick(){
            setFilters()
        }

        function onClearClick(){
            vm.reportName = null;
            vm.fromDate = null;
            vm.toDate = null;
            vm.dashboard = null;
            vm.view = null;
            if(vm.isAdmin){
                ComponentDataService.setUser(null);
                vm.user = null;
            }
            vm.thresholdAlert = false;
            setFilters();
        }

        function setFilters(){
            var userId = "";
            if(vm.isAdmin){
                userId = ComponentDataService.getUser() ? ComponentDataService.getUser().login : "";
            } else{
                userId = vm.user.login;
            }
            var reportName = vm.reportName ? vm.reportName : "";
            var fromDate = vm.fromDate ? vm.fromDate : "";
            var toDate = vm.toDate ? vm.toDate : "";
            var dashboardName = vm.dashboard ? vm.dashboard.dashboardName : "";
            var viewName = vm.view ? vm.view.viewName : "";
            var thresholdAlert = vm.thresholdAlert ? vm.thresholdAlert : false;
            var filters = {userId:userId,reportName:reportName,fromDate:fromDate,toDate:toDate,thresholdAlert:thresholdAlert,dashboardName:dashboardName,viewName:viewName};
            vm.onFilterApplied({filters});
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }
    }
})();
