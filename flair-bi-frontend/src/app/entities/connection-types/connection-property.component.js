import angular from 'angular';
import connectionPropertyComponentHtml from './connection-property.component.html';


export const name = 'connectionPropertyComponent';
export const component = {
    template: connectionPropertyComponentHtml,
    controller: connectionPropertyController,
    controllerAs: "vm",
    bindings: {
        cProperty: "=",
        form: "=",
        disabled: "=",
        connection: "="
    }
};

angular.module('flairbiApp')
    .component(name, component);

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

