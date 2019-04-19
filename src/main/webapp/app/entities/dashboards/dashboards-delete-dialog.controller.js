(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DashboardsDeleteController", DashboardsDeleteController);

    DashboardsDeleteController.$inject = [
        "$uibModalInstance",
        "entity",
        "Dashboards",
        "$translate",
        "$rootScope"
    ];

    function DashboardsDeleteController($uibModalInstance, entity, Dashboards,$translate,$rootScope) {
        var vm = this;

        vm.dashboards = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function confirmDelete(id) {
            Dashboards.delete({ id: id }, function() {
                $uibModalInstance.close(true);
                var info = {text:$translate.instant('flairbiApp.dashboards.deleted',{param:id}),title: "Deleted"}
                $rootScope.showSuccessToast(info);
            },function(){
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.dashboards.errorDeleting')
                });
            });
        }
    }
})();
