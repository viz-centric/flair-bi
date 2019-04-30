import * as angular from 'angular';
import propertyComponentHtml from './property.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('propertyComponent', {
        template: propertyComponentHtml,
        controller: propertyController,
        controllerAs: 'vm',
        bindings: {
            property: '=',
            labelClasses: '@',
            inputClasses: '@',
            alignment: '@',
            formClass: '@',
            display: '='
        }
    });

propertyController.$inject = ['$scope'];

function propertyController($scope) {
    var vm = this;
    vm.getDisplayName = getDisplayName;


    function getDisplayName(value) {
        return value;
    }

    vm.$onInit = function () {
        activate();
    }

    ////////////////

    function activate() {
        vm.inputClasses = vm.inputClasses || 'form-control';
        vm.labelClasses = vm.labelClasses || 'label-control';
        vm.alignment = vm.alignment || 'default';
    }
}
