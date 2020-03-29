(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('accountComponent', {
            templateUrl: 'app/account/account.component.html',
            controller: AccountController,
            controllerAs: 'vm'
        });

    AccountController.$inject = [];
    function AccountController() {
        var vm = this;

        ////////////////
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
