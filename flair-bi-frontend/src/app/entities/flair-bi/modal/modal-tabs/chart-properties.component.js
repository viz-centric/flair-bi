import * as angular from 'angular';
import chartPropertiesComponentHtml from './chart-properties.component.html';
'use strict';

angular
    .module('flairbiApp')
    .component('chartPropertiesComponent', {
        template: chartPropertiesComponentHtml,
        controller: chartPropertiesController,
        controllerAs: 'vm',
        bindings: {
            visual: '='

        }
    });

chartPropertiesController.$inject = ['$scope'];

function chartPropertiesController($scope) {
    var vm = this;


    vm.$onInit = activate;

    ////////////////

    function activate() {


    }
}
