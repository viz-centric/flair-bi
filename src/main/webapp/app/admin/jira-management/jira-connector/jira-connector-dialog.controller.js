(function () {
  'use strict';

  angular
    .module('flairbiApp')
    .controller('JiraConnectorDialogController', JiraConnectorDialogController);

  JiraConnectorDialogController.$inject = ['$uibModalInstance', 'JiraManagementService'];

  function JiraConnectorDialogController($uibModalInstance, JiraManagementService) {
    var vm = this;
    vm.isSaving = false;
    vm.close = close;
    vm.submit = submit;

    activate();

    ////////////////

    function activate() {

    }

    function submit() {

    }

    function close() {
      $uibModalInstance.close();
    }

  }
})();



