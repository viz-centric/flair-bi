(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('noDataFoundComponent', {
            templateUrl: 'app/components/shared/no-data-found/no-data-found.component.html',
            controller: noDataFoundController,
            controllerAs: 'vm',
            bindings: {
                message: '@', 
                action: '@'
            }
        });

     noDataFoundController.$inject = ['$scope'];

    function noDataFoundController($scope) {
        var vm = this;
    }
})();
