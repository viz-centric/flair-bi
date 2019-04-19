(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintDeleteController",
            DatasourceConstraintDeleteController
        );

    DatasourceConstraintDeleteController.$inject = [
        "$uibModalInstance",
        "entity",
        "DatasourceConstraint",
        "$translate",
        "$rootScope"
    ];

    function DatasourceConstraintDeleteController(
        $uibModalInstance,
        entity,
        DatasourceConstraint,
        $translate,
        $rootScope
    ) {
        var vm = this;

        vm.datasourceConstraint = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function confirmDelete(id) {
            DatasourceConstraint.delete({ id: id }, function() {
                $uibModalInstance.close(true);
                var info = {text:$translate.instant('flairbiApp.datasourceConstraint.deleted',{param:id}),title: "Deleted"}
                $rootScope.showSuccessToast(info);
            },function(){
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.datasourceConstraint.errorDeleting')
                });
            });
        }
    }
})();
