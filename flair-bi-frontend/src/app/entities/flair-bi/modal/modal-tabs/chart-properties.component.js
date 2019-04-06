import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .component('chartPropertiesComponent', {
        templateUrl: 'app/entities/flair-bi/modal/modal-tabs/chart-properties.component.html',
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