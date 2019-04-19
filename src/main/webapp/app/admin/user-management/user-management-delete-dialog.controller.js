(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('UserManagementDeleteController', UserManagementDeleteController);

    UserManagementDeleteController.$inject = ['$uibModalInstance', 'entity', 'User','$translate','$rootScope'];

    function UserManagementDeleteController($uibModalInstance, entity, User,$translate,$rootScope) {
        var vm = this;

        vm.user = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete(login) {
            User.delete({login: login},
                function () {
                    $uibModalInstance.close(true);
                    var info = {text:$translate.instant('userManagement.deleted',{param:vm.user.login}),title: "Deleted"}
                    $rootScope.showSuccessToast(info);
                },function(){
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('userManagement.errorDeleting')
                    });
                });
        }
    }
})();
