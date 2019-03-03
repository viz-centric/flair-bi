(function() {
    "use strict";

    angular.module("flairbiApp").component("fieldTypeListComponent", {
        templateUrl: "app/entities/field-type/field-type-list.component.html",
        controller: fieldTypeListController,
        controllerAs: "vm",
        bindings: {
            fieldTypes: "="
        }
    });

    fieldTypeListController.$inject = ["$scope"];

    function fieldTypeListController($scope) {
        var vm = this;

        activate();

        ////////////////

        function activate() {}
    }
})();
