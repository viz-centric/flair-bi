(function () {
    "use strict";

    angular
        .module('flairbiApp')
        .component('datasourceConstraintDialogComponent', {
            templateUrl: 'app/entities/datasource-constraint/datasource-constraint-dialog.component.html',
            controller: DatasourceConstraintDialogController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });

    DatasourceConstraintDialogController.$inject = [
        "$timeout",
        "$scope",
        "DatasourceConstraint",
        "Datasources",
        "Features",
        "$translate",
        "$rootScope",
        "ComponentDataService"
    ];

    function DatasourceConstraintDialogController(
        $timeout,
        $scope,
        DatasourceConstraint,
        Datasources,
        Features,
        $translate,
        $rootScope,
        ComponentDataService
    ) {
        var vm = this;


        vm.clear = clear;
        vm.save = save;
        vm.constraintTypes = ["Inclusion", "Exclusion"];
        vm.datasourceChange = datasourceChange;
        vm.addConstraint = addConstraint;
        vm.removeConstraint = removeConstraint;
        vm.createArray = createArray;
        vm.features = [];
        vm.search = search;



        vm.$onInit = function () {
            vm.datasourceConstraint = vm.resolve.entity;
            activate();
            $timeout(function () {
                angular.element(".form-group:eq(1)>input").focus();
            });
        }



        function activate() {
            if (
                vm.datasourceConstraint.constraintDefinition &&
                vm.datasourceConstraint.constraintDefinition.featureConstraints
            ) {
                vm.datasourceConstraint.constraintDefinition.featureConstraints.forEach(
                    function (item) {
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
                    function (result) {
                        vm.features = result;
                    },
                    function (_) { }
                );
            }
        }

        function clear() {
            vm.dismiss();
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
                vm.datasourceConstraint.user = ComponentDataService.getUser();
                DatasourceConstraint.save(
                    vm.datasourceConstraint,
                    onSaveSuccess,
                    onSaveError
                );
            }
        }

        function onSaveSuccess(result) {
            onSave(result);
            var info = { text: $translate.instant('flairbiApp.datasourceConstraint.created', { param: result.id }), title: "Saved" }
            $rootScope.showSuccessToast(info);
        }

        function onUpdateSuccess(result) {
            onSave(result);
            var info = { text: $translate.instant('flairbiApp.datasourceConstraint.updated', { param: result.id }), title: "Updated" }
            $rootScope.showSuccessToast(info);
        }

        function onSaveError() {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.datasourceConstraint.errorSaving')
            });
        }

        function onSave(result) {
            $scope.$emit("flairbiApp:datasourceConstraintUpdate", result);
            vm.close(result);
            vm.isSaving = false;
        }

        function search(e, searchedText) {
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
    }
})();
