import * as angular from 'angular';
import metricProgressComponentHtml from './metric-progress.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('metricProgressComponent', {
        template: metricProgressComponentHtml,
        controller: metricProgressController,
        controllerAs: 'vm',
        transclude: true,
        bindings: {
            max: '=',
            min: '=',
            value: '=',
            type: '@'

        }
    });

metricProgressController.$inject = ['$scope'];

function metricProgressController($scope) {
    var vm = this;


    activate();

    ////////////////

    function activate() {
    }
}
