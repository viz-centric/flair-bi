(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('fieldPropertiesComponent', {
            templateUrl: 'app/entities/flair-bi/modal/modal-tabs/field-properties.component.html',
            controller: fieldPropertiesController,
            controllerAs: 'vm',
            bindings: {
                visual: '=',
                view: '=',
                features: '=',
                hierarchies:'='
            }
        });

    fieldPropertiesController.$inject = ['$scope', 'Visualizations', 'Features','VisualDispatchService'];

    function fieldPropertiesController($scope, Visualizations, Features,VisualDispatchService) {
        var vm = this;

        vm.selectedField;
        vm.showPropertyTypes = showPropertyTypes;
        vm.selectField = selectField;
        vm.$onInit = onInit;
        vm.filterHierarchies = filterHierarchies;
        vm.addFieldDimension = addFieldDimension;
        vm.addFieldMeasure = addFieldMeasure;
        vm.removeField = removeField;

        ////////////////


        function onInit() {}

        function removeField(field) {
            vm.visual.fields = vm.visual.fields.filter(function (item) {
                return item.fieldType.id !== field.fieldType.id;
            });
        }

        function showPropertyTypes() {
            return vm.selectedField;
        }

        function selectField(field) {
            vm.selectedField = field;
        }

        function addFieldDimension() {
            var fieldType = vm.visual.nextFieldDimension();
            var field = {
                fieldType: fieldType,
                feature: null,
                constraint: fieldType.constraint
            };
            Visualizations.getFieldType({
                id: vm.visual.metadataVisual.id,
                fieldTypeId: field.fieldType.id
            }, function (result) {
                field.fieldType = result;
                field.properties = field.fieldType.propertyTypes.map(function (item) {
                    return {
                        propertyType: item.propertyType,
                        value: item.propertyType.defaultValue,
                        type: item.propertyType.type,
                        order: item.order,
                    };
                });
            }, function (error) {});
            vm.visual.fields.push(field);
        }

        function addFieldMeasure() {
            var fieldType = vm.visual.nextFieldMeasure();
            var field = {
                fieldType: fieldType,
                feature: null,
                constraint: fieldType.constraint
            };
            Visualizations.getFieldType({
                id: vm.visual.metadataVisual.id,
                fieldTypeId: field.fieldType.id
            }, function (result) {
                field.fieldType = result;
                field.properties = field.fieldType.propertyTypes.map(function (item) {
                    return {
                        propertyType: item.propertyType,
                        value: item.propertyType.defaultValue,
                        type: item.propertyType.type,
                        order: item.order,
                    };
                });
            }, function (error) {});
            vm.visual.fields.push(field);
        }

        function filterHierarchies(item) {
            if (!vm.selectedField.feature) {
                return true;
            }

            return item.drilldown.filter(function (el) {
                return el.feature.name === vm.selectedField.feature.name;
            }).length > 0;
        }
    }
})();
