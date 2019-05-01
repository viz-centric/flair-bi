import * as angular from 'angular';
import sqlQueryComponentHtml from './sql-query.component.html';
'use strict';

angular
    .module('flairbiApp')
    .component('sqlQueryComponent', {
        template: sqlQueryComponentHtml,
        controller: sqlQueryController,
        controllerAs: 'vm',
        bindings: {
            visual: '=',
            features: '='
        }
    });

sqlQueryController.$inject = ['$scope'];

function sqlQueryController($scope) {
    var vm = this;


    activate();

    ////////////////

    function activate() { }
}
