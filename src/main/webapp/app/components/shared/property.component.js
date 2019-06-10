(function () {
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
                formClass:'@',
                display:'='
            }
        });

    propertyController.$inject = ['$scope','VisualDispatchService','$rootScope'];

    function propertyController($scope,VisualDispatchService,$rootScope) {
        var vm = this;
        vm.getDisplayName=getDisplayName;
        vm.setProperty=setProperty;



        function getDisplayName(value){
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

        function setProperty(value){
            $rootScope.$broadcast("flairbiApp:on-properties-update",{value:value,fieldName:vm.display,property:vm.property});
        }
    }
})();
