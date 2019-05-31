(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DashboardsDialogController", DashboardsDialogController);

    DashboardsDialogController.$inject = [
        "$timeout",
        "$scope",
        "$stateParams",
        "$uibModalInstance",
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
        $timeout,
        $scope,
        $stateParams,
        $uibModalInstance,
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
        vm.views = Views.query();
        vm.dashboardReleases = [] ;
        vm.dialogMode =
            $state.current.url.includes("edit") == true
                ? "Edit Dashboard"
                : "Create Dashboard";

        $timeout(function() {
            angular.element(".form-group:eq(1)>input").focus();
        });
        vm.isInValidImage=false;
        vm.search=search;

        active();

        function active(){
            if($state.current.url.includes("edit") == true){
                getDashboard();
                getDashboardReleases();
            }else{
               vm.dashboards={'dashboardName': null,'category': null,'description': null,'published': false,'image': null,'imageContentType': null,'id': null}; 
            }
        }

        function getDashboardReleases(){
            return Dashboards.releases({id: $stateParams.id},function(result){
                vm.dashboardReleases=result;
            });
        }

        function getDashboard() {
            return Dashboards.get({id: $stateParams.id},function(result){
                vm.dashboards=result;
            });
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
                }else{
                    vm.isInValidImage = true;
                    vm.isSaving = true;
                }
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
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
            $uibModalInstance.close(result);
            vm.isSaving = false;
            //fetch new permission for dashboards
            if($state.current.url.includes("new")){
                Principal.identity(true);
                var info = {text:$translate.instant('flairbiApp.dashboards.created',{param:result.id}),title: "Saved"}
                $rootScope.showSuccessToast(info);
            }else{
                var info = {text:$translate.instant('flairbiApp.dashboards.updated',{param:result.id}),title: "Updated"}
                $rootScope.showSuccessToast(info);
            }
        }

        function onSaveError(error) {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.dashboards.errorSaving')
            });
        }

        vm.setImage = function($file, dashboards) {
            if ($file && $file.$error === "pattern") {
                return;
            }
            if ($file) {
                DataUtils.toBase64($file, function(base64Data) {
                    $scope.$apply(function() {
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
    }
})();
