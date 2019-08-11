(function () {
  'use strict';

  angular
    .module('flairbiApp')
    .controller('JiraManagementController', JiraManagementController);

  JiraManagementController.$inject = [
    'JiraManagementService'
  ];

  function JiraManagementController(JiraManagementService) {

    var vm = this;

    vm.integrations = [];
    vm.viewIntegration = viewIntegration;
    vm.editIntegration = editIntegration;
    vm.deleteIntegration = deleteIntegration;

    activate();

    function activate() {

    }

    function deleteIntegration(integration) {

    }

    function editIntegration(integration) {

    }

    function viewIntegration(integration) {

    }

  }
})();
