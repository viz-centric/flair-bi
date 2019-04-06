import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .component('bodyPropertiesComponent', {
        templateUrl: 'app/entities/flair-bi/modal/modal-tabs/body-properties.component.html',
        controller: BodyPropertiesController,
        controllerAs: 'vm',
        bindings: {
            visual: '=',
            slider: '='
        }
    });

BodyPropertiesController.$inject = ['$scope'];

function BodyPropertiesController($scope) {
    var vm = this;
    activate();

    ////////////////

    function activate() { }
}