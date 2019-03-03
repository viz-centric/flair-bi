(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('sqlQueryComponent', {
            templateUrl: 'app/entities/flair-bi/modal/modal-tabs/sql-query.component.html',
            controller: sqlQueryController,
            controllerAs: 'vm',
            bindings: {
                visual: '=',
                features: '='
            }
        });

    sqlQueryController.$inject = ['$scope'];

    function sqlQueryController($scope) {
        var vm = this;


        activate();

        ////////////////

        function activate() {}
    }
})();
