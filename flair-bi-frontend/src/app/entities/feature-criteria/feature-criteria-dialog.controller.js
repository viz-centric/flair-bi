import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "FeatureCriteriaDialogController",
        FeatureCriteriaDialogController
    );

FeatureCriteriaDialogController.$inject = [
    "$timeout",
    "$scope",
    "$stateParams",
    "$uibModalInstance",
    "entity",
    "FeatureCriteria",
    "Feature",
    "FeatureBookmark"
];

function FeatureCriteriaDialogController(
    $timeout,
    $scope,
    $stateParams,
    $uibModalInstance,
    entity,
    FeatureCriteria,
    Feature,
    FeatureBookmark
) {
    var vm = this;

    vm.featureCriteria = entity;
    vm.clear = clear;
    vm.save = save;
    vm.features = Feature.query();
    vm.featurebookmarks = FeatureBookmark.query();

    $timeout(function () {
        angular.element(".form-group:eq(1)>input").focus();
    });

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function save() {
        vm.isSaving = true;
        if (vm.featureCriteria.id !== null) {
            FeatureCriteria.update(
                vm.featureCriteria,
                onSaveSuccess,
                onSaveError
            );
        } else {
            FeatureCriteria.save(
                vm.featureCriteria,
                onSaveSuccess,
                onSaveError
            );
        }
    }

    function onSaveSuccess(result) {
        $scope.$emit("flairbiApp:featureCriteriaUpdate", result);
        $uibModalInstance.close(result);
        vm.isSaving = false;
    }

    function onSaveError() {
        vm.isSaving = false;
    }
}