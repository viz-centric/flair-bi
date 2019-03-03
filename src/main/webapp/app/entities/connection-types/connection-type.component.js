(function() {
    "use strict";

    angular.module("flairbiApp").component("connectionTypeComponent", {
        templateUrl:
            "app/entities/connection-types/connection-type.component.html",
        controller: connectionTypeController,
        controllerAs: "vm",
        bindings: {
            connectionType: "=",
            onClick: "&"
        }
    });

    connectionTypeController.$inject = ["$scope"];

    function connectionTypeController($scope) {
        var vm = this;

        vm.$onInit = activate;

        ////////////////

        function activate() {}
    }
})();
