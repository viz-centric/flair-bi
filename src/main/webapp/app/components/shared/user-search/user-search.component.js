(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('userSearchComponent', {
            templateUrl: 'app/components/shared/user-search/user-search.component.html',
            controller: UserSearchController,
            controllerAs: 'vm',
        });

    UserSearchController.$inject = ['$scope','User','$rootScope','ComponentDataService'];

    function UserSearchController($scope, User,$rootScope,ComponentDataService) {
        var vm = this;
        vm.searchUser=searchUser;
        vm.onChangeUser=onChangeUser;
        activate();

        ////////////////

        function activate() {
            ComponentDataService.setUserLogin("");
        }

        function searchUser(e,searchedText) {
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

        function onChangeUser(){
            ComponentDataService.setUserLogin(vm.userName.login);
        }
    }
})();
