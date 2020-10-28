(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceGroupConstraintDeleteController",
            DatasourceGroupConstraintDeleteController
        );

    DatasourceGroupConstraintDeleteController.$inject = [
        "$uibModalInstance",
        "entity",
        "DatasourceGroupConstraint",
        "$translate",
        "$rootScope"
    ];

    function DatasourceGroupConstraintDeleteController(
        $uibModalInstance,
        entity,
        DatasourceGroupConstraint,
        $translate,
        $rootScope
    ) {
        var vm = this;

        vm.datasourceGroupConstraint = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function confirmDelete(id) {
            DatasourceGroupConstraint.delete({ id: id }, function() {
                $uibModalInstance.close(true);
                var info = {text:$translate.instant('flairbiApp.datasourceGroupConstraint.deleted',{param:id}),title: "Deleted"}
                $rootScope.showSuccessToast(info);
            },function(){
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.datasourceGroupConstraint.errorDeleting')
                });
            });
        }
    }
})();
