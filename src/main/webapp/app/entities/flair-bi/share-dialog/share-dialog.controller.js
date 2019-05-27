(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ShareDialogController', ShareDialogController);

    ShareDialogController.$inject = ['$uibModalInstance', 'shareLink','$rootScope'];

    function ShareDialogController($uibModalInstance, shareLink,$rootScope) {
        var vm = this;
        vm.clear = clear;
        vm.shareLink = shareLink;
        vm.copyUrl=copyUrl;

        activate();

        ////////////////

        function activate() {}

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function copyUrl(){
            var copyText = document.getElementById("share-link");
            copyText.select();
            document.execCommand("copy");
            var info = {
                text: 'Copied to clipboard',
                title: "Copied"
            }
            $rootScope.showSuccessToast(info);
        }

    }
})();
