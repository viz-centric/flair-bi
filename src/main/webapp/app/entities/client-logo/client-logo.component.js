(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .component('clientLogoHeaderComponent', {
            templateUrl: 'app/entities/client-logo/client-logo-header.component.html',
            controller: ClientLogoDialogController,
            controllerAs: 'vm'
        }).component('clientLogoComponent', {
            templateUrl: 'app/entities/client-logo/client-logo.component.html',
            controller: ClientLogoDialogController,
            controllerAs: 'vm'
        });

    ClientLogoDialogController.$inject = ['$timeout', '$scope', '$stateParams', 'ClientLogo',"DataUtils","$rootScope","$translate","ClientLogoDataService"];

    function ClientLogoDialogController ($timeout, $scope, $stateParams, ClientLogo,DataUtils,$rootScope,$translate,ClientLogoDataService) {
        var vm = this;
        vm.deleteClientLogo = deleteClientLogo;
        vm.save = save;
        vm.byteSize = DataUtils.byteSize;
        vm.openFile = DataUtils.openFile;
        vm.isInValidImage = false;
        var imageContentType = 'svg';
        var entity = { name: null,url: null,id: null,imageContentType:imageContentType };
        active();

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function active(){
            getClientLogo();
        }

        function getClientLogo() {
            ClientLogo.query(function(result) {
                if(result && result.length > 0){
                    vm.clientLogo = result[0];
                }else{
                    vm.clientLogo = entity;
                }
            });
        }

        function save () {
            vm.isSaving = true;
            if (vm.clientLogo.id !== null) {
                ClientLogo.update(vm.clientLogo, onSaveSuccess, onSaveError);
            } else {
                ClientLogo.save(vm.clientLogo, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            vm.isSaving = false;
            var info = null;
            if (vm.clientLogo.id !== null) {
                var info = {text:$translate.instant('flairbiApp.clientLogo.updated'),title: "Updated"};
            }else{
                var info = {text:$translate.instant('flairbiApp.clientLogo.created'),title: "Saved"};
            }
            $rootScope.showSuccessToast(info);
            ClientLogoDataService.setClientLogo(vm.clientLogo);
            $rootScope.$broadcast("flairbiApp:set-client-logo");
        }

        function onSaveError () {
            vm.isSaving = false;
        }

        vm.setImage = function ($file, clientLogo) {
            if ($file && $file.$error === "pattern") {
                return;
            }
            if ($file) {
                DataUtils.toBase64($file, function (base64Data) {
                    $scope.$apply(function () {
                        clientLogo.image = base64Data;
                        clientLogo.url = null;
                        clientLogo.imageContentType = imageContentType;
                        checkValidImage(base64Data);
                    });
                });
            }
        };

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

        function deleteClientLogo(id){
            ClientLogo.delete({ id: id }, function() {
                var info = {text:$translate.instant('flairbiApp.clientLogo.deleted',{param:id}),title: "Deleted"};
                $rootScope.showSuccessToast(info);
                vm.clientLogo = entity;
                ClientLogoDataService.setClientLogo(null);
                $rootScope.$broadcast("flairbiApp:set-client-logo");
            },function(){
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.clientLogo.errorDeleting')
                });
            });
        }


    }
})();
