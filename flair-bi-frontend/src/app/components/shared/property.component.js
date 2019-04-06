import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .component('propertyComponent', {
        templateUrl: 'app/components/shared/property.component.html',
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
