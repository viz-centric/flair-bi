import * as angular from 'angular';
import accountCardComponentHtml from './account-card.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('accountCardComponent', {
        template: accountCardComponentHtml,
        controller: accountCardController,
        controllerAs: 'vm',
        bindings: {
            menuItem: '='
        }
    });

accountCardController.$inject = [];

function accountCardController() {
    var vm = this;


    vm.$onInit = activate;

    ////////////////

    function activate() {
    }
}
