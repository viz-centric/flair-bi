(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "VisualizationsDetailController",
            VisualizationsDetailController
        );

    VisualizationsDetailController.$inject = [
        "$scope",
        "$rootScope",
        "$stateParams",
        "previousState",
        "entity",
        "Visualizations",
        "PERMISSIONS",
        "PropertyTypes"
    ];

    function VisualizationsDetailController(
        $scope,
        $rootScope,
        $stateParams,
        previousState,
        entity,
        Visualizations,
        PERMISSIONS,
        PropertyTypes
    ) {
        var vm = this;

        vm.visualizations = entity;
        vm.previousState = previousState.name;
        vm.permissions = PERMISSIONS;
        vm.remove = remove;
        vm.assign = assign;
        vm.propertyTypes = PropertyTypes.query();
        vm.propertyTypeFilter = propertyTypeFilter;

        var unsubscribe = $rootScope.$on(
            "flairbiApp:visualizationsUpdate",
            function(event, result) {
                result.fieldTypes = vm.visualizations.fieldTypes;
                vm.visualizations = result;
            }
        );
        $scope.$on("$destroy", unsubscribe);

        function propertyTypeFilter(item) {
            return (
                vm.visualizations.propertyTypes.filter(function(n) {
                    return n.propertyType.id === item.id;
                }).length === 0
            );
        }

        function assign(propertyTypeId) {
            Visualizations.assignPropertyType(
                {
                    id: $stateParams.id
                },
                {
                    id: propertyTypeId
                },
                onAssignSuccess,
                onAssignError
            );
        }

        function remove(propertyTypeId) {
            Visualizations.removePropertyType(
                {
                    id: $stateParams.id,
                    propertyTypeId: propertyTypeId
                },
                onAssignSuccess,
                onAssignError
            );
        }

        function onAssignSuccess(result) {
            vm.visualizations = result;
        }

        function onAssignError(error) {}
    }
})();
