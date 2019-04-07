ConnectionDetailController.$inject = ["entity", "previousState", "$stateParams"];

export const name = 'ConnectionDetailController';
export function ConnectionDetailController(entity, previousState, $stateParams) {
    var vm = this;
    vm.connection = entity[0];
    vm.previousState = previousState;
    vm.serviceId = $stateParams.id;

    activate();

    ////////////////

    function activate() { }
}

