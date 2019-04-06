import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('ShareDialogController', ShareDialogController);

ShareDialogController.$inject = ['$uibModalInstance', 'shareLink'];

function ShareDialogController($uibModalInstance, shareLink) {
    var vm = this;
    vm.clear = clear;
    vm.shareLink = '<iframe src="' + shareLink + '" width="100%" height="100%"	>';

    activate();

    ////////////////

    function activate() { }

    function clear() {
        $uibModalInstance.dismiss('cancel');
    }

}