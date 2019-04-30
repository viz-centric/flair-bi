import * as angular from 'angular';
import connectionStepsComponentHtml from './connection-steps.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('connectionStepsComponent', {
        template: connectionStepsComponentHtml,
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
