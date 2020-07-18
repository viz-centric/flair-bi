(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DashboardOverviewContentHeaderController", DashboardOverviewContentHeaderController);

    DashboardOverviewContentHeaderController.$inject = [
        "$scope",
        "entity",
        "AccountDispatch",
        "Upload"
    ];

    function DashboardOverviewContentHeaderController(
        $scope,
        entity,
        AccountDispatch,
        Upload
    ) {
        var vm = this;

        vm.selectedDashboard = entity;
        vm.importedViewFileStatus = null;
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
            vm.importedViewFileStatus = null;
            if (file) {
                file.upload = Upload.upload({
                    url: 'api/dashboards/' + vm.selectedDashboard.id + '/importView',
                    data: {file: file},
                    disableProgress: true
                });

                file.upload.then(function (response) {
                    vm.importedViewFileStatus = 'DONE';
                }, function (response) {
                    if (response.status > 0) {
                        vm.importedViewFileStatus = response.status + ': ' + response.data;
                    }
                }, function (evt) {

                });
            }
        }
    }
})();
