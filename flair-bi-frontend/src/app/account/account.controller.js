(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('AccountController', AccountController);

    AccountController.$inject = ['$scope'];

    function AccountController($scope) {
        var vm = this;

        vm.menuItems = [{
            image: '#account-settings',
            label: 'Account Settings',
            href: 'settings',
            order: 0
        }, {
            image: '#account-password',
            label: 'Password',
            href: 'password',
            order: 1
        }];
        activate();

        ////////////////

        function activate() { }
    }
})();
