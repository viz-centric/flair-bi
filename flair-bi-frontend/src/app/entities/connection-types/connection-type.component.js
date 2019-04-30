import angular from 'angular';
import connectionTypeComponentHtml from './connection-type.component.html';

angular.module('flairbiApp')
    .component('connectionTypeComponent', {
        template: connectionTypeComponentHtml,
        controller: connectionTypeController,
        controllerAs: "vm",
        bindings: {
            connectionType: "=",
            onClick: "&"
        }
    })


connectionTypeController.$inject = [];

function connectionTypeController() {
    var vm = this;

    vm.$onInit = activate;

    ////////////////

    function activate() {
    }
}

