(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('noDataFoundSmallComponent', {
            templateUrl: 'app/components/shared/no-data-found/no-data-found-small.component.html',
            controller: noDataFoundSmallController,
            controllerAs: 'vm',
            bindings: {
                message: '@',
                action: '@'
            }
        });

     noDataFoundSmallController.$inject = ['$scope'];

    function noDataFoundSmallController($scope) {
        var vm = this;
    }
})();
