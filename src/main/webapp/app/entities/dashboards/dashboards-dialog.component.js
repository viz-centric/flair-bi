(function () {
    "use strict";

    angular
        .module('flairbiApp')
        .component('dashboardsDialogComponent', {
            templateUrl: 'app/entities/dashboards/dashboards-dialog.component.html',
            controller: DashboardsDialogController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                dismiss: '&',
                close: '&'
            }
        });

    DashboardsDialogController.$inject = [
        "$scope",
        "$state",
        "DataUtils",
        "Dashboards",
        "Views",
        "Datasources",
        "$rootScope",
        "$translate",
        "Principal"
    ];

    function DashboardsDialogController(
        $scope,
        $state,
        DataUtils,
        Dashboards,
        Views,
        Datasources,
        $rootScope,
        $translate,
        Principal
    ) {
        var vm = this;
        vm.clear = clear;
        vm.byteSize = DataUtils.byteSize;
        vm.openFile = DataUtils.openFile;
        vm.save = save;
        vm.dashboardReleases = [];

        vm.isInValidImage = false;
        vm.search = search;
        vm.togglePublish = togglePublish;

        vm.$onInit = () => {
            vm.dialogMode = vm.resolve.title;
            vm.dashboards = vm.resolve.dashboard;
            vm.dashboardReleases = vm.resolve.dashboardReleases;
            vm.views = Views.query();
        }

        function checkValidImage(bytes) {
            var temp = "";
            temp = DataUtils.byteSize(bytes);
            if (temp.length > 0) {
                var imageSizeInBytes = temp
                    .replace('bytes', '')
                    .trim();
                var imageSizeInMb = Math.floor(parseInt(imageSizeInBytes) / 1000000);
                if (imageSizeInMb <= parseInt($rootScope.appProperies.maxImageSize))
                    vm.isInValidImage = false;
                vm.isSaving = false;
            } else {
                vm.isInValidImage = true;
                vm.isSaving = true;
            }
        }

        function clear() {
            vm.dismiss();
        }

        function save() {
            vm.isSaving = true;
            if (vm.dashboards.id !== null) {
                Dashboards.update(vm.dashboards, onSaveSuccess, onSaveError);
            } else {
                Dashboards.save(vm.dashboards, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit("flairbiApp:dashboardsUpdate", result);
            vm.close({ $value: result });
            vm.isSaving = false;
        }

        function onSaveError(error) {
            vm.isSaving = false;
            if (error.data.message == 'uniqueError') {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.dashboards.' + error.data.message)
                });
            } else {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.dashboards.errorSaving')
                });
            }
        }

        vm.setImage = function ($file, dashboards) {
            if ($file && $file.$error === "pattern") {
                return;
            }
            if ($file) {
                DataUtils.toBase64($file, function (base64Data) {
                    $scope.$apply(function () {
                        dashboards.image = base64Data;
                        dashboards.imageLocation = null;
                        //dashboards.imageContentType = $file.type;
                        dashboards.imageContentType = $file.type.substring($file.type.lastIndexOf("/") + 1, $file.type.length);
                        checkValidImage(base64Data);
                    });
                });
            }
        };

        function search(searchedText) {
            if (searchedText) {
                Datasources.query({
                    page: 0,
                    size: 10,
                    sort: 'lastUpdated,desc',
                    name: searchedText
                }, function (data) {
                    vm.datasources = data;
                }, function () {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.datasources.error.datasources.all')
                    });
                });
            }
        }

        function togglePublish() {
            vm.dashboards.published = !vm.dashboards.published;
        }
    }
})();
