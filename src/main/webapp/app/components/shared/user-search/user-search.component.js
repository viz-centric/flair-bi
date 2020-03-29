(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('userSearchComponent', {
            templateUrl: 'app/components/shared/user-search/user-search.component.html',
            controller: UserSearchController,
            controllerAs: 'vm',
            bindings: {
                user: '=',
            }
        });

    UserSearchController.$inject = ['User', '$rootScope', 'ComponentDataService'];

    function UserSearchController(User, $rootScope, ComponentDataService) {
        var vm = this;
        vm.searchUser = searchUser;
        vm.onChangeUser = onChangeUser;


        vm.$onInit = function () {
            vm.user = vm.user ? vm.user : {};
            activate();
        }


        ////////////////

        function activate() {
            ComponentDataService.setUser(null);
        }

        function searchUser(e, searchedText) {
            e.preventDefault();
            if (searchedText) {
                User.search({
                    page: 0,
                    size: 10,
                    login: searchedText
                }, function (data) {
                    vm.users = data;
                }, function () {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.userManagement.error.users.all')
                    });
                });
            }
        }

        function onChangeUser() {
            ComponentDataService.setUser(vm.user);
        }
    }
})();
