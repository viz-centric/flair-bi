export const name = 'connectionPropertyComponent';
export const component = {
    templateUrl:
        "app/entities/connection-types/connection-property.component.html",
    controller: connectionPropertyController,
    controllerAs: "vm",
    bindings: {
        cProperty: "=",
        form: "=",
        disabled: "=",
        connection: "="
    }
};

connectionPropertyController.$inject = [];

function connectionPropertyController() {
    var vm = this;

    vm.property = property;
    vm.$onInit = activate;

    ////////////////

    function activate() {
        vm.fieldName = vm.cProperty.fieldName;
    }

    function property(propName) {
        return vm.connection.details[propName];
    }
}

