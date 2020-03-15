(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('userManagementDeleteComponent', {
            templateUrl: 'app/admin/user-management/user-management-delete-dialog.component.html',
            controller: UserManagementDeleteController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                dismiss: '&',
                cancel: '&'
            }
        });

    UserManagementDeleteController.$inject = ['User', '$translate', '$rootScope'];

    function UserManagementDeleteController(User, $translate, $rootScope) {
        var vm = this;

        vm.confirmDelete = confirmDelete;

        vm.$onInit = function () {
            vm.user = vm.resolve.entity;
            vm.clear = vm.dismiss;
        }

        function confirmDelete(login) {
            User.delete({ login: login },
                function () {
                    vm.close(true);
                    var info = { text: $translate.instant('userManagement.deleted', { param: vm.user.login }), title: "Deleted" }
                    $rootScope.showSuccessToast(info);
                }, function () {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('userManagement.errorDeleting')
                    });
                });
        }
    }
})();
