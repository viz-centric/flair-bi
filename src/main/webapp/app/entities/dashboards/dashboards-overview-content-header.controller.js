(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DashboardOverviewContentHeaderController", DashboardOverviewContentHeaderController);

    DashboardOverviewContentHeaderController.$inject = [
        "$scope",
        "entity",
        "AccountDispatch",
        "Upload",
        "$state",
        "$rootScope",
        "$translate",
        "$window"
    ];

    function DashboardOverviewContentHeaderController(
        $scope,
        entity,
        AccountDispatch,
        Upload,
        $state,
        $rootScope,
        $translate,
        $window
    ) {
        var vm = this;

        vm.selectedDashboard = entity;
        vm.importedViewFile = null;
        vm.importView = importView;

        activate();

        function activate() {

            vm.canWriteViews = AccountDispatch.hasAuthority(
                "WRITE_" + vm.selectedDashboard.id + "_DASHBOARD"
            );
            
        }

        function importView(file, errFiles) {
            vm.importedViewFile = file;
            if (file) {
                file.upload = Upload.upload({
                    url: 'api/dashboards/' + vm.selectedDashboard.id + '/importView',
                    data: {file: file},
                    disableProgress: true
                });

                file.upload.then(function (response) {
                    $rootScope.showSuccessToast({
                        text: $translate.instant('flairbiApp.dashboards.upload.success',
                            {file: vm.importedViewFile.name}),
                        title: "Uploaded"
                    });
                    $window.location.reload();
                    // $state.reload();
                }, function (response) {
                    const errorData = response.data;
                    if (errorData.message === 'error.viewImportExportError') {
                        const fieldError = errorData.fieldErrors[0];
                        $rootScope.showErrorSingleToast({
                            text: $translate.instant('flairbiApp.dashboards.upload.failure.error.viewImportExportError.' + fieldError.key, {
                                file: vm.importedViewFile.name,
                                field: fieldError.field
                            })
                        });
                    } else {
                        $rootScope.showErrorSingleToast({
                            text: $translate.instant('flairbiApp.dashboards.upload.failure', {file: vm.importedViewFile.name})
                        });
                    }
                }, function (evt) {

                });
            }
        }
    }
})();
