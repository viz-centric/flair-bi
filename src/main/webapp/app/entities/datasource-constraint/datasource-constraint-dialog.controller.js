(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintDialogController",
            DatasourceConstraintDialogController
        );

    DatasourceConstraintDialogController.$inject = [
        "$timeout",
        "$scope",
        "$stateParams",
        "$uibModalInstance",
        "entity",
        "DatasourceConstraint",
        "User",
        "Datasources",
        "Features",
        "$translate",
        "$rootScope"
    ];

    function DatasourceConstraintDialogController(
        $timeout,
        $scope,
        $stateParams,
        $uibModalInstance,
        entity,
        DatasourceConstraint,
        User,
        Datasources,
        Features,
        $translate,
        $rootScope
    ) {
        var vm = this;

        vm.datasourceConstraint = entity;
        vm.clear = clear;
        vm.save = save;
        vm.constraintTypes = ["Inclusion", "Exclusion"];
        vm.datasourceChange = datasourceChange;
        vm.addConstraint = addConstraint;
        vm.removeConstraint = removeConstraint;
        vm.createArray = createArray;
        vm.features = [];
        vm.search=search;
        vm.searchUser=searchUser;

        activate();

        $timeout(function() {
            angular.element(".form-group:eq(1)>input").focus();
        });

        function activate() {
            if (
                vm.datasourceConstraint.constraintDefinition &&
                vm.datasourceConstraint.constraintDefinition.featureConstraints
            ) {
                vm.datasourceConstraint.constraintDefinition.featureConstraints.forEach(
                    function(item) {
                        if (item.values) {
                            item.stringValues = item.values.join();
                        }
                    }
                );
            }
        }

        function createArray(constraint) {
            constraint.values = constraint.stringValues.split(",");
        }

        function addConstraint() {
            vm.datasourceConstraint.constraintDefinition.featureConstraints.push(
                {
                    "@type": vm.constraintTypes[0]
                }
            );
        }

        function removeConstraint(constraint) {
            var index = vm.datasourceConstraint.constraintDefinition.featureConstraints.indexOf(
                constraint
            );
            if (index > -1) {
                vm.datasourceConstraint.constraintDefinition.featureConstraints.splice(
                    index,
                    1
                );
            }
        }

        function datasourceChange() {
            if (
                vm.datasourceConstraint.datasource &&
                vm.datasourceConstraint.datasource.id
            ) {
                Features.query(
                    {
                        datasource: vm.datasourceConstraint.datasource.id,
                        featureType: "DIMENSION"
                    },
                    function(result) {
                        vm.features = result;
                    },
                    function(errors) {}
                );
            }
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.datasourceConstraint.id !== null) {
                DatasourceConstraint.update(
                    vm.datasourceConstraint,
                    onUpdateSuccess,
                    onSaveError
                );
            } else {
                DatasourceConstraint.save(
                    vm.datasourceConstraint,
                    onSaveSuccess,
                    onSaveError
                );
            }
        }

        function onSaveSuccess(result) {
            onSave(result);
            var info = {text:$translate.instant('flairbiApp.datasourceConstraint.created',{param:result.id}),title: "Saved"}
            $rootScope.showSuccessToast(info);
        }

        function onUpdateSuccess(result) {
            onSave(result);
            var info = {text:$translate.instant('flairbiApp.datasourceConstraint.updated',{param:result.id}),title: "Updated"}
            $rootScope.showSuccessToast(info);
        }

        function onSaveError() {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.datasourceConstraint.errorSaving')
            });
        }

        function onSave(result){
            $scope.$emit("flairbiApp:datasourceConstraintUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function search(e,searchedText) {
            e.preventDefault();
            if (searchedText) {
                Datasources.search({
                    page: 0,
                    size: 10,
                    sort: 'lastUpdated,desc',
                    name: searchedText
                }, function (data) {
                    vm.datasources = data;
                }, function () {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.datasources.error.datasources.all')
                    });
                });
            }
        }

        function searchUser(e,searchedText) {
            e.preventDefault();
            if (searchedText) {
                User.search({
                    page: 0,
                    size: 10,
                    login: searchedText
                }, function (data) {
                    vm.users = data;
                }, function () {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.userManagement.error.users.all')
                    });
                });
            }
        }
    }
})();
