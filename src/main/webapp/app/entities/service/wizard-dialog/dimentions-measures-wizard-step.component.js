(function () {
    "use strict";

    angular
        .module("flairbiApp")
        .component("dimentionsMeasuresWizardStep", {
            templateUrl: "app/entities/service/wizard-dialog/dimentions-measures-wizard-step.component.htm" +
                    "l",
            controller: DatasourceWizardStepController,
            controllerAs: "vm",
            bindings: {
                testResult: "=",
                features: "=",
                datasources: "=",
                onFinishHandler: "&"
            }
        });

    DatasourceWizardStepController.$inject = ["$scope", "Features", "$rootScope","$state", 'COMPARABLE_DATA_TYPES'];

    function DatasourceWizardStepController($scope, Features, $rootScope, $state, COMPARABLE_DATA_TYPES) {
        var vm = this;
        vm.toggleCheckbox = toggleCheckbox;
        vm.changeFeature = changeFeature;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.finishWizard = finishWizard;
        vm.isTemporalFeature = isTemporalFeature;
        vm.finishResult = '';
        ////////////////

        vm.$onInit = function () {};
        vm.$onChanges = function (changesObj) {};
        vm.$onDestroy = function () {};

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function isTemporalFeature(feature) {
            return COMPARABLE_DATA_TYPES.indexOf(feature.type) > -1;
        }

        function toggleCheckbox(feature) {
            for (var i = 0; i < vm.features.length; i++) {
                if (!feature.isSelected && feature.name == vm.features[i].name) {
                    //vm.features.splice(i, 1);
                    vm.features[i].isSelected = feature.isSelected;
                    break;
                }
            }
        }

        function changeFeature(feature) {
            for (var obj in vm.features) {
                if (feature.name == vm.features[obj].name) {
                    vm.features[obj].featureType = feature.featureType;
                    break;
                }
            }

        }

        function finishWizard() {
            var featureList = {
                datasourceId: vm.datasources.datasourceId,
                featureList: vm.features
            };
            Features.addFeatures({},
                featureList,
                function (result) {
                    console.log("Features saved result", result);
                    vm.finishResult = "success";

                    $rootScope.showSuccessToast({
                        text: "Dimensions and Measures are configured successfully",
                        title: "Saved"
                    });

                    vm.onFinishHandler({result: result});
                    $state.go('^');
                }, function (err) {
                    vm.finishResult = "error";
                });

        }

    }
})();
