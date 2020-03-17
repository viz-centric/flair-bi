(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('topNavButtonComponent', {
            templateUrl: 'app/components/shared/topnav-button.component.html',
            controller: TopNavButtonController,
            controllerAs: 'vm',
            transclude: true,
            bindings: {
                icon: '@',
                click: '&',
                if: '&',
                isToggled: '=',
                isDisabled: '='
            }
        });

    TopNavButtonController.$inject = [];

    function TopNavButtonController() {
        var vm = this;

        vm.$onInit = activate;

        ////////////////

        function activate() {
            if (angular.isUndefined(vm.if())) {
                vm.if = function () {
                    return true;
                };
            }
        }
    }
})();
