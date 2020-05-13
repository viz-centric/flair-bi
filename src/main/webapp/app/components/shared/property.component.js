(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('propertyComponent', {
            templateUrl: 'app/components/shared/property.component.html',
            controller: propertyController,
            controllerAs: 'vm',
            bindings: {
                property: '=',
                features: '=',
                labelClasses: '@',
                inputClasses: '@',
                alignment: '@',
                formClass: '@',
                display: '=',
                propstype: '@'
            }
        });

    propertyController.$inject = ['VisualDispatchService', '$rootScope', '$uibModal'];

    function propertyController(VisualDispatchService, $rootScope, $uibModal) {
        var vm = this;
        vm.getDisplayName = getDisplayName;
        vm.setProperty = setProperty;
        vm.setCheckboxProperty = setCheckboxProperty;
        vm.openIconExpression = openIconExpression;
        vm.loadFeature = loadFeature;
        vm.addFeatures = addFeatures;
        vm.removeFeatures = removeFeatures;
        vm.setFectures = setFectures;
        vm.selectedFeature = [];

        function getDisplayName(value) {
            return value;
        }

        vm.$onInit = function () {
            activate();
        }
        ////////////////

        function activate() {
            vm.inputClasses = vm.inputClasses || 'form-control';
            vm.labelClasses = vm.labelClasses || 'label-control';
            vm.alignment = vm.alignment || 'default';
            if (vm.property.propertyType.name === "Alternative Dimensions")
                setFectures();
        }

        function loadFeature() {
            var retVal = vm.features.filter(function (item) {
                if (item.featureType === "DIMENSION") {
                    return item;
                }
            });
            var list = retVal.map(function (item) {

                return item.name;

            });
            return list;
        }

        function setProperty(value) {
            VisualDispatchService.setViewEditedBeforeSave(true);
            if (vm.propstype === 'data') {
                VisualDispatchService.setSavePromptMessage("visualization data property has been changed and it has not been saved.Do you want to save?");
                $rootScope.$broadcast("flairbiApp:on-data-properties-update", { value: value, fieldName: vm.display, property: vm.property });

                if (vm.property.propertyType.name === "Aggregation type" && value.value === "NONE") {
                    var info = { text: 'Please change the Aggregation type NONE to all other measures.', title: "Warning" }
                    $rootScope.showWarningToast(info);
                }

            } else if (vm.propstype === 'chart') {
                VisualDispatchService.setSavePromptMessage("visualization chart property has been changed and it has not been saved.Do you want to save?");
                $rootScope.$broadcast("flairbiApp:on-chart-properties-update", { value: value, property: vm.property });
            }
        }

        function setCheckboxProperty(value) {
            value = !value;
            vm.property.value = value;
            VisualDispatchService.setViewEditedBeforeSave(true);
            if (vm.propstype === 'data') {
                VisualDispatchService.setSavePromptMessage("visualization data property has been changed and it has not been saved.Do you want to save?");
                $rootScope.$broadcast("flairbiApp:on-data-properties-update", { value: value, fieldName: vm.display, property: vm.property });
            } else if (vm.propstype === 'chart') {
                VisualDispatchService.setSavePromptMessage("visualization chart property has been changed and it has not been saved.Do you want to save?");
                $rootScope.$broadcast("flairbiApp:on-chart-properties-update", { value: value, property: vm.property });
            }
        }

        function openIconExpression(v) {

            $uibModal.open({
                templateUrl:
                    "app/entities/flair-bi/modal/modal-tabs/openColourExpression.html",
                controller: "openColourExpression",
                controllerAs: "vm",
                backdrop: 'static',
                size: "lg",
                resolve: {
                    data: function () {
                        return v;
                    }
                }
            });
        }

        function addFeatures(tag) {
            var feature = vm.features.filter(function (val) {
                if (val.name == tag.text) {
                    return val
                }
            })
            vm.selectedFeature.push({ featureID: feature[0].id, featureName: feature[0].name });
            vm.property.value = JSON.stringify(vm.selectedFeature);
        }

        function removeFeatures(tag) {
            var feature = vm.features.filter(function (val) {
                if (val.name == tag.text) {
                    return val
                }
            })
            vm.selectedFeature = vm.selectedFeature.filter(function (val) {
                if (val.featureName !== tag.text) {
                    return val;
                }
            });
            vm.property.value = JSON.stringify(vm.selectedFeature);
        }
        function setFectures() {
            if (vm.property.value) {
                var selectedFeature = JSON.parse(vm.property.value);
                vm.selectedFeature = selectedFeature;
                vm.selectedWebhook = selectedFeature.map(function (item) {
                    var features = {};
                    var list = vm.features.filter(function (val) {
                        if (val.id == item.featureID) {
                            return val
                        }
                    })
                    features['text'] = list[0].name;
                    return features;
                });

            }
        }

    }
})();
