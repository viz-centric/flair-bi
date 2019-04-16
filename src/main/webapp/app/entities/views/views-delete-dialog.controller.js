(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ViewsDeleteController', ViewsDeleteController);

    ViewsDeleteController.$inject = ['$uibModalInstance', 'entity', 'Views', '$window', '$stateParams', '$scope','$translate','$rootScope'];

    function ViewsDeleteController($uibModalInstance, entity, Views, $window, $stateParams, $scope,$translate,$rootScope) {
        var vm = this;

        vm.views = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;



        function clear() {
            $uibModalInstance.dismiss('cancel');
            $window.history.back();
        }

        function confirmDelete(id) {
            Views.delete({ id: id },
                function () {
                    $scope.$emit('flairbiApp:viewDelete', id);
                    $uibModalInstance.close({ dashboardId: $stateParams.id });
                    $window.history.back();
                    var info = {text:$translate.instant('flairbiApp.views.deleted',{param:id}),title: "Deleted"}
                    $rootScope.showSuccessToast(info);
                },
                function(){
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.views.errorDeleting')
                    }); 
                });
        }
    }
})();
