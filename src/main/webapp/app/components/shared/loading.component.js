(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('loadingComponent', {
            templateUrl: 'app/components/shared/loading.component.html',
            controller: LoadingComponentController,
            controllerAs: 'vm',
            bindings: {
                showLoading: '<',
            },
        });

    LoadingComponentController.$inject = [];
    function LoadingComponentController() {
        var vm = this;


        ////////////////

        vm.$onInit = function () {
        };
        vm.$onChanges = function (_) { };
        vm.$onDestroy = function () { };
    }
})();