(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('userProfileComponent', {
            templateUrl: 'app/components/shared/user-profile/user-profile.component.html',
            controller: userProfileController,
            controllerAs: 'vm',
        });

    userProfileController.$inject = ['$scope', '$state', 'Auth', 'Principal'];

    function userProfileController($scope, $state, Auth, Principal) {
        var vm = this;
        vm.$state = $state;
        vm.logout = logout;
        activate();
        getAccount();

        function logout() {
            Auth.logout();
            $state.go('login');
        }

        function getAccount() {
            Principal.identity().then(function (account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }

        $scope.$on('authenticationSuccess', function () {
            getAccount();
        });

        ////////////////

        function activate() {
        }
    }
})();
