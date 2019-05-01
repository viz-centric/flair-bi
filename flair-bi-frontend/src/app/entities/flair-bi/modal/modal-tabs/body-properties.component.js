import * as angular from 'angular';
import bodyPropertiesComponentHtml from './body-properties.component.html';
'use strict';

angular
    .module('flairbiApp')
    .component('bodyPropertiesComponent', {
        template: bodyPropertiesComponentHtml,
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
