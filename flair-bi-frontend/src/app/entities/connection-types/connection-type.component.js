export const name = 'connectionTypeComponent';
export const component = {
    templateUrl:
        "app/entities/connection-types/connection-type.component.html",
    controller: connectionTypeController,
    controllerAs: "vm",
    bindings: {
        connectionType: "=",
        onClick: "&"
    }
};

connectionTypeController.$inject = [];

function connectionTypeController() {
    var vm = this;

    vm.$onInit = activate;

    ////////////////

    function activate() { }
}

