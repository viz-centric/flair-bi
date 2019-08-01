(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('openColourExpression', openColourExpression);

    openColourExpression.$inject = ['$scope', 'data', '$uibModalInstance', '$rootScope'];

    function openColourExpression($scope, data, $uibModalInstance, $rootScope) {
        var vm = this;
        vm.features = data;
        vm.addStartingCondition = addStartingCondition;
        vm.removeCondition = removeCondition;
        vm.save = save;
        vm.clear = clear;
        vm.conditionExpression = [];
        vm.isIcon = false;
        activate();
        ////////////////
        function activate() {

            if (vm.features.property.propertyType.name == "Icon Expression") {
                vm.isIcon = true;
            }
            if (vm.features.property.value != "" && vm.features.property.value != null) {
                var temp = vm.features.property.value.split('|');

                for (let index = 0; index < temp.length; index++) {
                    var arr = temp[index].split(',');
                    var condition = {};
                    condition.expression = arr[0];
                    condition.value = arr[1];
                    if (vm.isIcon) {
                        condition.icon = arr[2];
                        condition.color = arr[3];
                    }
                    else {
                        condition.color = arr[2];
                    }
                    vm.conditionExpression.push(condition);
                }
            }
        }

        function addStartingCondition() {
            var condition = {};
            vm.conditionExpression.push(condition);
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
            $rootScope.$broadcast("flairbiApp:toggleProperties-on");
        }

        function removeCondition(index) {
            vm.conditionExpression.splice(index, 1)
        }

        function save() {
            vm.features.property.value = "";
            var list = [];
            angular.element('.fields .condition').each(function () {
                var condition = {}
                condition.expression = angular.element(this).find('.expression').val();
                condition.value = angular.element(this).find('.value').val();
                condition.color = angular.element(this).find('.color').val();
                condition.icon = angular.element(this).find('.icon').val();
                list.push(condition);
            })
            for (let index = 0; index < list.length; index++) {
                if (vm.isIcon) {
                    vm.features.property.value += list[index].expression + "," + list[index].value + "," + list[index].icon + "," + list[index].color + "|";
                }
                else {
                    vm.features.property.value += list[index].expression + "," + list[index].value + "," + list[index].color + "|";
                }
            }
            vm.features.property.value = vm.features.property.value.substring(0, vm.features.property.value.length - 1);
            clear();
        }
    }
})();
