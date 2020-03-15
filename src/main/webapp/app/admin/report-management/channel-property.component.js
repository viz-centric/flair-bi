(function () {
    "use strict";

    angular.module("flairbiApp").component("channelPropertyComponent", {
        templateUrl:
            "app/admin/report-management/channel-property.component.html",
        controller: channelPropertyController,
        controllerAs: "vm",
        bindings: {
            cProperty: "=",
            form: "=",
            disabled: "=",
            connection: "="
        }
    });

    channelPropertyController.$inject = [];

    function channelPropertyController() {
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
})();
