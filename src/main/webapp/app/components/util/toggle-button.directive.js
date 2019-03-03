(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('flairToggleButton', flairToggleButton());


    function flairToggleButton() {
        return {
            template: '<input type="checkbox" id="input-{{vm.id}}" ng-model="vm.value">',
            bindings: {
                onAction: '&',
                offAction: '&',
                onLabel: '@',
                offLabel: '@',
                size: '@',
                onStyle: '@',
                offStyle: '@',
                style: '@',
                width: '@',
                height: '@',
                id: '@'
            },
            controller: flairToggleButtonController,
            controllerAs: 'vm'
        };
    }

    flairToggleButtonController.$inject = ['$rootScope', '$timeout', '$scope'];

    function flairToggleButtonController($rootScope, $timeout, $scope) {
        var vm = this;

        // vm.value = true;
        vm.$onInit = function () {
            vm.id = vm.id || 'toggle-directive';
        }

        vm.$onChanges = function () {}

        vm.$postLink = function () {
            $timeout(function () {
                var toggle = $('#input-' + vm.id).bootstrapToggle({
                    on: vm.onLabel ? vm.onLabel : 'on',
                    off: vm.offLabel ? vm.offLabel : 'off',
                    size: vm.size ? vm.size : 'normal',
                    onstyle: vm.onStyle ? vm.onStyle : 'primary',
                    offstyle: vm.offStyle ? vm.offStyle : 'default',
                    style: vm.style,
                    width: vm.width,
                    height: vm.height
                });
            });
            $timeout(function () {
                $('#input-' + vm.id).change(function () {
                    if ($(this).prop('checked')) {
                        vm.onAction();
                    } else {
                        vm.offAction();
                    }
                    $rootScope.$apply();
                });
            });
        }

        vm.$onDestroy = function () {
            $('#input-' + vm.id).bootstrapToggle('destroy')
        }


    }




})();
