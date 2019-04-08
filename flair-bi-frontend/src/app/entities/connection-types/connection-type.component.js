import angular from 'angular';

angular.module('flairbiApp')
    .component('connectionTypeComponent', {
        templateUrl:
            "app/entities/connection-types/connection-type.component.html",
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

    function activate() { }
}

