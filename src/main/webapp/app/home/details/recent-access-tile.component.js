(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('recentAccessTileComponent', {
            templateUrl: 'app/home/details/recent-access-tile.component.html',
            controller: RecentAccessTileController,
            controllerAs: 'vm',
            bindings: {
                viewWatches: '<',
                account: '<',
                show: '<'
            },
        });

    RecentAccessTileController.$inject = [];
    function RecentAccessTileController() {
        var vm = this;


        ////////////////

        vm.$onInit = function () {
            console.log(vm.account);
        };
        vm.$onChanges = function (_changesObj) { };
        vm.$onDestroy = function () { };
    }
})();