(function () {
  'use strict';

  angular
    .module('flairbiApp')
    .config(stateConfig);

  stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

  function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider
      .state('third-party-integrations', {
        parent: 'admin',
        url: '/third-party-integrations',
        data: {
          authorities: [],
          pageTitle: '3rd Party Integrations',
          displayName: '3rd Party Integrations'
        },
        params: {},
        views: {
          'content-header@': {
            templateUrl: 'app/admin/jira-management/jira-management-content-header.html'
          },
          'content@': {
            templateUrl: 'app/admin/jira-management/jira-management.html',
            controller: 'JiraManagementController',
            controllerAs: 'vm'
          }

        },
        resolve: {
          translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('jira-management');
            return $translate.refresh();
          }]
        }
      })
      .state("third-party-integrations.new", {
        parent: "third-party-integrations",
        url: "/new",
        data: {
          displayName: false,
          authorities: [PERMISSIONS.WRITE_THIRD_PARTY_INTEGRATIONS]
        },
        onEnter: [
          "$stateParams",
          "$state",
          "$uibModal",
          function ($stateParams, $state, $uibModal) {
            $uibModal
              .open({
                templateUrl:
                  'app/admin/jira-management/jira-connector/jira-connector-dialog.html',
                controller: "JiraConnectorDialogController",
                controllerAs: "vm",
                backdrop: "static",
                size: "lg",
                resolve: {}
              })
              .result.then(function () {
                $state.go('third-party-integrations', null, {
                  reload: 'third-party-integrations'
                });
              }
            );
          }
        ]
      })
  }
})();
