(function () {
    "use strict";

    angular
        .module('flairbiApp')
        .component('datasourceGroupConstraintDialogComponent', {
            templateUrl: 'app/entities/datasource-group-constraint/datasource-constraint-dialog.component.html',
            controller: DatasourceGroupConstraintDialogController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });

    DatasourceGroupConstraintDialogController.$inject = [
        "$timeout",
        "$scope",
        "DatasourceGroupConstraint",
        "Datasources",
        "Features",
        "$translate",
        "$rootScope",
        "AuthServerProvider",
        "QueryValidationService",
        "$stateParams",
        "$state",
    ];

    function DatasourceGroupConstraintDialogController(
        $timeout,
        $scope,
        DatasourceGroupConstraint,
        Datasources,
        Features,
        $translate,
        $rootScope,
        AuthServerProvider,
        QueryValidationService,
        $stateParams,
        $state,
    ) {
        var vm = this;


        vm.clear = clear;
        vm.save = save;
        vm.datasourceChange = datasourceChange;
        vm.addConstraint = addConstraint;
        vm.removeConstraint = removeConstraint;
        vm.features = [];
        vm.search = search;
        vm.$onInit = function () {
            activate();
            $timeout(function () {
                angular.element(".form-group:eq(1)>input").focus();
            });
        }

        function activate() {
            vm.datasourceGroupConstraint = {constraintDefinition: [], id: $stateParams.id, userGroupName: $stateParams.group};
            if ($stateParams.id) {
                getDatasourceGroupConstraint();
            } else {
                addConstraint();
            }
        }

        function addConstraint() {
            vm.datasourceGroupConstraint.constraintDefinition.push({});
        }

        function removeConstraint(constraint) {
            var index = vm.datasourceGroupConstraint.constraintDefinition.indexOf(
                constraint
            );
            if (index > -1) {
                vm.datasourceGroupConstraint.constraintDefinition.splice(
                    index,
                    1
                );
            }
        }

        function loadFeatures(id) {
            return Features.query({
                    datasource: id,
                    featureType: "DIMENSION"
                },
                function (result) {
                    vm.features = result;
                },
                function (_) {
                }
            );
        }

        function datasourceChange(id) {
            if (id) {
                return loadFeatures(id);
            }
        }

        function clear() {
            vm.dismiss();
        }

        function save() {
            vm.isSaving = true;
            const data = {
                datasourceId: vm.datasourceGroupConstraint.datasource.id,
                id: vm.datasourceGroupConstraint.id,
                userGroupName: vm.datasourceGroupConstraint.userGroupName,
                constraintDefinition: {
                    featureConstraints: vm.datasourceGroupConstraint.constraintDefinition
                        .map(function (item) {
                            return {'@type': 'Feature', id: item.feature.id};
                        })
                }
            };
            if (data.id !== null) {
                DatasourceGroupConstraint.update(
                    data,
                    onUpdateSuccess,
                    onSaveError
                );
            } else {
                DatasourceGroupConstraint.save(
                    data,
                    onSaveSuccess,
                    onSaveError
                );
            }
        }

        function onSaveSuccess(result) {
            onSave(result);
            var info = { text: $translate.instant('flairbiApp.DatasourceGroupConstraint.created', { param: result.id }), title: "Saved" }
            $rootScope.showSuccessToast(info);
            $state.go('^');
        }

        function onUpdateSuccess(result) {
            onSave(result);
            var info = { text: $translate.instant('flairbiApp.DatasourceGroupConstraint.updated', { param: result.id }), title: "Updated" }
            $rootScope.showSuccessToast(info);
            $state.go('^');
        }

        function onSaveError() {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.DatasourceGroupConstraint.errorSaving')
            });
        }

        function onSave(result) {
            $scope.$emit("flairbiApp:DatasourceGroupConstraintUpdate", result);
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

        function onDatasourceGroupConstraintLoaded(result) {
            vm.datasourceGroupConstraint.datasource = result.datasource;

            loadFeatures(vm.datasourceGroupConstraint.datasource.id)
                .$promise
                .then(function () {
                    onFeaturesLoaded(result.constraintDefinition.featureConstraints);
                });
        }

        function getDatasourceGroupConstraint(){
            DatasourceGroupConstraint.get({
                id: $stateParams.id
            }, function (result) {
                onDatasourceGroupConstraintLoaded(result);
            });
        }

        function onFeaturesLoaded(featureConstraints) {
            vm.datasourceGroupConstraint.constraintDefinition = featureConstraints
                .map(function (fk) {
                    return {
                        feature: vm.features.find(function (i) {
                            return i.id === fk.id
                        })
                    }
                });
        }

    }
})();
