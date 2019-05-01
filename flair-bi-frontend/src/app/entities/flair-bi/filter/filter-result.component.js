import * as angular from 'angular';
import filterResultComponentHtml from './filter-result.component.html';
'use strict';

angular
    .module('flairbiApp')
    .component('filerResultComponent', {
        template: filterResultComponentHtml,
        controller: filerResultController,
        controllerAs: 'vm',
        bindings: {}
    });

filerResultController.$inject = ['$scope', 'filterParametersService'];

function filerResultController($scope, filterParametersService) {
    var vm = this;

    vm.selectedFilters = {};
    vm.$onInit = activate;

    ////////////////

    function activate() {
        filterChangedSubscription();
    }

    function filterChangedSubscription() {
        var unsubscribe = $scope.$on('filterParametersService:filter-changed', function () {
            vm.selectedFilters = filterParametersService.get();
        });

        $scope.$on('$destroy', unsubscribe);
    }
}
