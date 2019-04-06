import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "PropertyTypeDialogController",
        PropertyTypeDialogController
    );

PropertyTypeDialogController.$inject = [
    "$scope",
    "InputTypes",
    "entity",
    "PropertyTypes",
    "$uibModalInstance"
];

function PropertyTypeDialogController(
    $scope,
    InputTypes,
    entity,
    PropertyTypes,
    $uibModalInstance
) {
    var vm = this;

    activate();

    vm.dataTypes = ["INTEGER", "STRING"];
    vm.onTagAdded = onTagAdded;
    vm.onTagRemoved = onTagRemoved;
    vm.save = save;
    vm.clear = clear;
    vm.editMode = false;

    ////////////////

    function activate() {
        InputTypes.query({}, function (result) {
            vm.inputTypes = result;
            vm.propertyType = entity;

            vm.editMode = vm.propertyType.id ? true : false;
            if (!vm.propertyType.type) {
                vm.propertyType.type = vm.inputTypes[0];
            }
            if (!vm.propertyType.dataType) {
                vm.propertyType.dataType = vm.dataTypes[0];
            }
            if (!vm.propertyType.possibleValues) {
                vm.propertyType.possibleValues = [];
            }

            if (vm.propertyType.possibleValues[0]) {
                vm.propertyType.dataType =
                    vm.propertyType.possibleValues[0].type;
            }
            vm.propertyType.values = vm.propertyType.possibleValues.map(
                function (item) {
                    return {
                        value: item.value
                    };
                }
            );

            activateWatches();
        });
    }

    function save() {
        if (
            vm.propertyType.defaultValue &&
            vm.propertyType.defaultValue.value
        ) {
            vm.propertyType.defaultValue.type = vm.propertyType.dataType;
            vm.propertyType.defaultValue.value = parseIfNeeded(
                vm.propertyType.defaultValue.value
            );
        }
        vm.isSaving = true;

        if (vm.propertyType.id) {
            vm.propertyType.possibleValues.forEach(function (item) {
                item.selectPropertyType = {
                    id: vm.propertyType.id,
                    type: vm.propertyType.type
                };
            });
            PropertyTypes.update(
                vm.propertyType,
                onSaveSuccess,
                onSaveError
            );
        } else {
            PropertyTypes.save(vm.propertyType, onSaveSuccess, onSaveError);
        }
    }

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function onSaveSuccess(result) {
        $uibModalInstance.close(result);
        vm.isSaving = false;
    }

    function onSaveError() {
        vm.isSaving = false;
    }

    function parseIfNeeded(tag) {
        if (vm.propertyType.dataType === "INTEGER") {
            return parseInt(tag);
        } else {
            return tag;
        }
    }

    function onTagAdded(tag) {
        tag.value = parseIfNeeded(tag.value);
        vm.propertyType.possibleValues.push({
            type: vm.propertyType.dataType,
            value: tag.value
        });
    }

    function onTagRemoved(tag) {
        tag.value = parseIfNeeded(tag.value);
        vm.propertyType.possibleValues = vm.propertyType.possibleValues.filter(
            function (item) {
                return item.value !== tag.value;
            }
        );
    }

    function activateWatches() {
        $scope.$watch(
            function () {
                return vm.propertyType.type;
            },
            function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    vm.propertyType.defaultValue = null;
                }
            }
        );

        $scope.$watch(
            function () {
                return vm.propertyType.dataType;
            },
            function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    vm.propertyType.possibleValues = [];
                    vm.propertyType.values = [];
                }
            }
        );
    }
}