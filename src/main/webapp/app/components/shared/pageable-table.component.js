(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('pageableTableComponent', {
            templateUrl: 'app/components/shared/pageable-table.component.html',
            controller: PageableTableController,
            controllerAs: 'vm',
            bindings: {

            },
        });

    PageableTableController.$inject = [];
    function PageableTableController() {
        var vm = this;


        ////////////////
        vm.$onInit = function () { };
        vm.$onChanges = function (_changesObj) { };
        vm.$onDestroy = function () { };
    }
})();