(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('viewsTileComponent', {
            templateUrl: 'app/home/details/views-tile.component.html',
            controller: ViewTileController,
            controllerAs: 'vm',
            bindings: {
                pagingParams: '<'
            }
        });

    ViewTileController.$inject = ['Views', '$state', 'ParseLinks', 'paginationConstants'];
    function ViewTileController(Views, $state, ParseLinks, paginationConstants) {
        var vm = this;

        vm.views = [];

        vm.transition = transition;
        vm.page = 1;
        vm.currentSearch = null;


        ////////////////

        vm.$onInit = function () {
            vm.predicate = vm.pagingParams.predicate;
            vm.reverse = vm.pagingParams.ascending;
            vm.itemsPerPage = paginationConstants.itemsPerPage;

            Views.query({
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
            vm.views = data;
        }

        function onError(_error) {
            vm.views = [];
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