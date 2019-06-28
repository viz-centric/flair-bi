(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('bodyPropertiesComponent', {
            templateUrl: 'app/entities/flair-bi/modal/modal-tabs/body-properties.component.html',
            controller: BodyPropertiesController,
            controllerAs: 'vm',
            bindings: {
                visual: '=',
                slider:'='
            }
        });

    BodyPropertiesController.$inject = ['$scope','VisualDispatchService'];

    function BodyPropertiesController($scope,VisualDispatchService) {
        var vm = this;
        vm.changeBodyProperties=changeBodyProperties;
        activate();

        ////////////////

        function activate() {}

        function changeBodyProperties(){
            VisualDispatchService.setViewEditedBeforeSave(true);
            VisualDispatchService.setSavePromptMessage("visualization body property has been changed and it has not been saved.Do you want to save?");
        }
    }
})();
