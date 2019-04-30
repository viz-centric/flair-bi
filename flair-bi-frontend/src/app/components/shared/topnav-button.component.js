import * as angular from 'angular';
import topnavButtonComponentHtml from './topnav-button.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('topNavButtonComponent', {
        template: topnavButtonComponentHtml,
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

TopNavButtonController.$inject = ['$scope'];

function TopNavButtonController($scope) {
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
