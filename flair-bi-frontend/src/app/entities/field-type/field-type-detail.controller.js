(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("FieldTypeDetailController", FieldTypeDetailController);

    FieldTypeDetailController.$inject = [
        "$scope",
        "fieldTypeEntity",
        "previousState",
        "$state",
        "PropertyTypes",
        "FieldTypes",
        "$stateParams"
    ];

    function FieldTypeDetailController(
        $scope,
        fieldTypeEntity,
        previousState,
        $state,
        PropertyTypes,
        FieldTypes,
        $stateParams
    ) {
        var vm = this;

        activate();
        vm.assign = assign;
        vm.remove = remove;
        vm.propertyTypeFilter = propertyTypeFilter;

        ////////////////

        function activate() {
            vm.fieldType = fieldTypeEntity;
            vm.previousState = previousState.name;
            if (!angular.equals(previousState.params, {})) {
                vm.previousState +=
                    "(" + JSON.stringify(previousState.params) + ")";
            }

            PropertyTypes.query({}, function(result) {
                vm.propertyTypes = result;
            });
        }

        function propertyTypeFilter(propertyType) {
            return (
                vm.fieldType.propertyTypes.filter(function(n) {
                    return n.propertyType.id === propertyType.id;
                }).length === 0
            );
        }

        function assign(propertyTypeId) {
            FieldTypes.assignPropertyType(
                {
                    id: $stateParams.fieldTypeId
                },
                {
                    id: propertyTypeId
                },
                onSaveSuccess,
                onSaveError
            );
        }

        function remove(propertyTypeId) {
            FieldTypes.removePropertyType(
                {
                    id: $stateParams.fieldTypeId,
                    propertyTypeId: propertyTypeId
                },
                onSaveSuccess,
                onSaveError
            );
        }

        function onSaveSuccess(result) {
            vm.fieldType = result;
        }

        function onSaveError(result) {}
    }
})();
