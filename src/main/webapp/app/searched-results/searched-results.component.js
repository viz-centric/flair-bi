(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('searchedResultsComponent', {
            templateUrl: 'app/searched-results/searched-results.component.html',
            controller: SearchedResultsController,
            controllerAs: 'vm'
        });

    SearchedResultsController.$inject = ['$stateParams', 'Views', 'Principal', 'Dashboards', '$rootScope', '$translate'];

    function SearchedResultsController($stateParams, Views, Principal, Dashboards, $rootScope, $translate) {
        var vm = this;

        vm.$onInit = activate;

        ////////////////

        function activate() {
            getAccount();
            search($stateParams.searchCriteria);
        }

        function getAccount() {
            Principal.identity(true).then(function (account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }

        function search(searchCriteria) {
            vm.searchMode = true;
            getSearchedViews(searchCriteria);
            getSearchedDashboards(searchCriteria);
        }

        function getSearchedViews(searchCriteria) {
            Views.query({
                viewName: searchCriteria
            }, function (searchedViews) {
                vm.searchedViews = searchedViews;
            }, function () {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.views.error.searched')
                });
            });
        }

        function getSearchedDashboards(searchCriteria) {
            Dashboards.query({
                dashboardName: searchCriteria
            }, function (searchedDashboards) {
                vm.searchedDashboards = searchedDashboards;
            }, function () {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.dashboards.error.searched')
                });
            });
        }
    }
})();
