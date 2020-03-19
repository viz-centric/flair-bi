(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('bookmarksTileComponent', {
            templateUrl: 'app/home/details/bookmarks-tile.component.html',
            controller: BookmarksTileController,
            controllerAs: 'vm',
            bindings: {
                pagingParams: '<'
            },
        });

    BookmarksTileController.$inject = ['paginationConstants', 'recentBookmarkService', '$state', 'ParseLinks', 'VisualDispatchService'];
    function BookmarksTileController(paginationConstants, recentBookmarkService, $state, ParseLinks, VisualDispatchService) {
        var vm = this;

        vm.transition = transition;
        vm.bookmarks = [];
        vm.page = 1;
        vm.build = build;


        ////////////////

        vm.$onInit = function () {
            vm.predicate = vm.pagingParams.predicate;
            vm.reverse = vm.pagingParams.ascending;
            vm.itemsPerPage = paginationConstants.itemsPerPage;

            recentBookmarkService.getRecentBookmark("?page=" + (vm.pagingParams.page - 1) + "&size=" + vm.itemsPerPage + "&sort=watchTime,desc")
                .then(function (result) {
                    vm.links = ParseLinks.parse(result.headers('link'));
                    vm.totalItems = result.headers('X-Total-Count');
                    vm.queryCount = vm.totalItems;
                    vm.page = vm.pagingParams.page;
                    vm.bookmarks = result.data;
                })
                .catch(function (error) {
                    console.log(error);
                    vm.bookmarks = [];
                });
        };
        vm.$onChanges = function (_changesObj) { };
        vm.$onDestroy = function () { };

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }

        function build(viewId, dashboardId, featureBookmark) {
            VisualDispatchService.addFeatureBookmark(viewId, dashboardId, featureBookmark);
            $state.go('flair-bi-build', {
                id: viewId,
                dashboardId: dashboardId
            })
        }


    }
})();