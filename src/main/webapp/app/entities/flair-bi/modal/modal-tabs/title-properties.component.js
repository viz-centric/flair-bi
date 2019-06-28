(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('titlePropertiesComponent', {
            templateUrl: 'app/entities/flair-bi/modal/modal-tabs/title-properties.component.html',
            controller: titlePropertiesController,
            controllerAs: 'vm',
            bindings: {
                visual: '='
            }
        });

    titlePropertiesController.$inject = ['$scope','VisualDispatchService'];

    function titlePropertiesController($scope,VisualDispatchService) {
        var vm = this;
        vm.changeTitleProperties=changeTitleProperties;


        activate();

        ////////////////

        function activate() {}

        function changeTitleProperties(){
            VisualDispatchService.setViewEditedBeforeSave(true);
            VisualDispatchService.setSavePromptMessage("visualization title property has been changed and it has not been saved.Do you want to save?");
        }

    }
})();
