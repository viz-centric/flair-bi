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
                display:'=',
                propstype:'@'
            }
        });

    propertyController.$inject = ['$scope','VisualDispatchService','$rootScope','$uibModal'];

    function propertyController($scope,VisualDispatchService, $rootScope,$uibModal) {
        var vm = this;
        vm.getDisplayName=getDisplayName;
        vm.setProperty=setProperty;
        vm.setCheckboxProperty=setCheckboxProperty;
        vm.openIconExpression=openIconExpression;

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
            VisualDispatchService.setViewEditedBeforeSave(true);
            if(vm.propstype==='data'){
                VisualDispatchService.setSavePromptMessage("visualization data property has been changed and it has not been saved.Do you want to save?");
                $rootScope.$broadcast("flairbiApp:on-data-properties-update",{value:value,fieldName:vm.display,property:vm.property});
            }else if(vm.propstype==='chart'){
                VisualDispatchService.setSavePromptMessage("visualization chart property has been changed and it has not been saved.Do you want to save?");
                $rootScope.$broadcast("flairbiApp:on-chart-properties-update",{value:value,property:vm.property});
            }
        }

        function setCheckboxProperty(value){
            value = !value;
            VisualDispatchService.setViewEditedBeforeSave(true);
            if(vm.propstype==='data'){
                VisualDispatchService.setSavePromptMessage("visualization data property has been changed and it has not been saved.Do you want to save?");
                $rootScope.$broadcast("flairbiApp:on-data-properties-update",{value:value,fieldName:vm.display,property:vm.property});
            }else if(vm.propstype==='chart'){
                VisualDispatchService.setSavePromptMessage("visualization chart property has been changed and it has not been saved.Do you want to save?");
                $rootScope.$broadcast("flairbiApp:on-chart-properties-update",{value:value,property:vm.property});
            }
        }

        function openIconExpression(v) {
            
            $uibModal.open({
                templateUrl:
                    "app/entities/flair-bi/modal/modal-tabs/openColourExpression.html",
                controller: "openColourExpression",
                controllerAs: "vm",
                backdrop: 'static',
                size: "lg",
                resolve: {
                    data: function () {
                        return v;
                    }
                }
            });
        }
    }
})();
