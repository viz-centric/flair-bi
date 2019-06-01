(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('menuComponent', {
            templateUrl: 'app/components/shared/menu/menu.component.html',
            controller: menuController,
            controllerAs: 'vm',
        });

    menuController.$inject = ['$scope', '$state', 'Auth','AccountDispatch'];

    function menuController($scope, $state, Auth, AccountDispatch) {
        var vm = this;
        vm.$state = $state;
        vm.logout = logout;
        vm.account = AccountDispatch.getAccount();

        function logout() {
            Auth.logout()
                .then(function () {
                    $state.go('login');
                });
        }
    }
})();
