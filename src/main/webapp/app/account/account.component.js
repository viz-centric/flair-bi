(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('accountComponent', {
            templateUrl: 'app/account/account.component.html',
            controller: AccountController,
            controllerAs: 'vm'
        });

    AccountController.$inject = ['Principal'];
    function AccountController(Principal) {
        var vm = this;

        ////////////////


        vm.$onInit = () => {
            vm.menuItems = [{
                image: '#account-settings',
                label: 'Account Settings',
                href: 'settings',
                order: 0
            },];
            Principal.isInternalUser('internal')
                .then((result) => {
                    if (result) {
                        vm.menuItems.push({
                            image: '#account-password',
                            label: 'Password',
                            href: 'password',
                            order: 1
                        });
                    }
                }).catch((error) => {
                    console.log(error);
                });
        };

    }
})();
