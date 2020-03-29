(function () {
    'use strict';


    angular
        .module('flairbiApp')
        .component('dashboardsTileComponent', {
            templateUrl: 'app/home/details/dashboards-tile.component.html',
            controller: DashboardsTileController,
            controllerAs: 'vm',
            bindings: {
                pagingParams: '<'
            },
        });

    DashboardsTileController.$inject = [
        'Dashboards',
        '$state',
        'paginationConstants',
        'ParseLinks'
    ];
    function DashboardsTileController(
        Dashboards,
        $state,
        paginationConstants,
        ParseLinks) {
        var vm = this;

        vm.dashboards = [];

        vm.transition = transition;
        vm.page = 1;
        vm.currentSearch = null;


        ////////////////
        vm.$onInit = function () {
            vm.predicate = vm.pagingParams.predicate;
            vm.reverse = vm.pagingParams.ascending;
            vm.itemsPerPage = paginationConstants.itemsPerPage;

            Dashboards.query({
                page: vm.pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);


        };
        vm.$onChanges = function () { };
        vm.$onDestroy = function () { };

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }

        function onSuccess(data, headers) {
            vm.links = ParseLinks.parse(headers('link'));
            vm.totalItems = headers('X-Total-Count');
            vm.queryCount = vm.totalItems;
            vm.page = vm.pagingParams.page;
            vm.dashboards = data;
        }

        function onError(_error) {
            vm.dashboards = [];
        }

        function sort() {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

    }
})();