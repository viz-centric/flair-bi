(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterPaneComponent', {
            templateUrl: 'app/entities/flair-bi/filter/filter-pane.component.html',
            controller: filterPaneController,
            controllerAs: 'vm',
            bindings: {
                dimensions: '=',
                view: '='
            }
        });

    filterPaneController.$inject = ['$scope', '$rootScope', 'filterParametersService', 'FilterStateManagerService','VisualDispatchService'];

    function filterPaneController($scope, $rootScope, filterParametersService, FilterStateManagerService,VisualDispatchService) {
        var vm = this;

        vm.filter = filter;
        vm.clear = clear;
        vm.selectedFilters = {};
        activate();

        ////////////////

        function activate() {
            var unsub = $scope.$on('flairbiApp:clearFilters', function () {
                clear();
            });

            $scope.$on('$destroy', unsub);
            filterChangedSubscription();
        }

        function filterChangedSubscription() {
            var unsubscribe = $scope.$on('filterParametersService:filter-changed', function (event, newFilter) {
                vm.selectedFilters = newFilter;
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function clear() {
            $rootScope.updateWidget = {};            
            vm.dimensions.forEach(function (item) {
                item.selected = null;
                item.selected2 = null;
            });
            filterParametersService.clear();
            filter();
        }

        function filter() {
            $rootScope.updateWidget = {};
            $rootScope.$broadcast('flairbiApp:filter');
            $rootScope.$broadcast('flairbiApp:filter-add');
        }
    }
})();
