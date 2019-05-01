import * as angular from 'angular';
import titlePropertiesComponentHtml from './title-properties.component.html';
'use strict';

angular
    .module('flairbiApp')
    .component('titlePropertiesComponent', {
        template: titlePropertiesComponentHtml,
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
