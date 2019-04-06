import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .component('connectionStepsComponent', {
        templateUrl: 'app/entities/data-connection/connection-steps.component.html',
        controller: DataConnectionStepsController,
        controllerAs: 'vm',
        bindings: {
            step: "="
        }
    });

DataConnectionStepsController.$inject = ['$scope'];

function DataConnectionStepsController($scope) {
    var vm = this;
}