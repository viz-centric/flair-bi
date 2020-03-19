(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('datasourcesTileComponent', {
            templateUrl: 'app/home/details/datasources-tile.component.html',
            controller: DatasourcesTileController,
            controllerAs: 'vm',
            bindings: {
                pagingParams: '<',
                isAdmin: '<'
            },
        });

    DatasourcesTileController.$inject = ['paginationConstants', 'Datasources', 'ParseLinks', '$state'];
    function DatasourcesTileController(paginationConstants, Datasources, ParseLinks, $state) {
        var vm = this;


        vm.datasources = [];
        vm.transition = transition;
        vm.page = 1;
        vm.currentSearch = null;


        ////////////////

        vm.$onInit = function () {
            vm.predicate = vm.pagingParams.predicate;
            vm.reverse = vm.pagingParams.ascending;
            vm.itemsPerPage = paginationConstants.itemsPerPage;

            Datasources.query({
                page: vm.pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort(),
                paginate: true
            }, onSuccess, onError);
        };
        vm.$onChanges = function (_changesObj) { };
        vm.$onDestroy = function () { };

        function onSuccess(data, headers) {
            vm.links = ParseLinks.parse(headers('link'));
            vm.totalItems = headers('X-Total-Count');
            vm.queryCount = vm.totalItems;
            vm.page = vm.pagingParams.page;
            vm.datasources = data;
        }

        function onError(_error) {
            vm.datasources = [];
        }

        function sort() {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }
    }
})();