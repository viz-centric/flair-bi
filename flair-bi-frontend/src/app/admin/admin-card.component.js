import * as angular from 'angular';
import adminCardComponentHtml from './admin-card.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('adminCardComponent', {
        template: adminCardComponentHtml,
        controller: adminCardController,
        controllerAs: 'vm',
        bindings: {
            menuItem: '='
        }
    });

adminCardController.$inject = ['$scope'];

function adminCardController($scope) {
    var vm = this;


    vm.$onInit = activate;

    ////////////////

    function activate() {
    }
}
