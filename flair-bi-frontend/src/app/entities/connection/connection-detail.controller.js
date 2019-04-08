import angular from 'angular';

angular.module('flairbiApp')
    .controller('ConnectionDetailController', ConnectionDetailController);

ConnectionDetailController.$inject = ["entity", "previousState", "$stateParams"];

function ConnectionDetailController(entity, previousState, $stateParams) {
    var vm = this;
    vm.connection = entity[0];
    vm.previousState = previousState;
    vm.serviceId = $stateParams.id;

    activate();

    ////////////////

    function activate() { }
}

