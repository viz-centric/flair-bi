import * as angular from 'angular';
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

titlePropertiesController.$inject = ['$scope'];

function titlePropertiesController($scope) {
    var vm = this;


    activate();

    ////////////////

    function activate() { }
}