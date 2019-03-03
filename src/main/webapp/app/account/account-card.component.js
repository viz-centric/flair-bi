(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('accountCardComponent', {
            templateUrl: 'app/account/account-card.component.html',
            controller: accountCardController,
            controllerAs: 'vm',
            bindings: {
                menuItem: '='
            }
        });

    accountCardController.$inject = ['$scope'];

    function accountCardController($scope) {
        var vm = this;


        vm.$onInit = activate;

        ////////////////

        function activate() {
        }
    }
})();
