(function () {
  'use strict';

  angular
    .module('flairbiApp')
    .factory('JiraManagementService', JiraManagementService);

  JiraManagementService.$inject = ['$resource'];

  function JiraManagementService($resource) {
    return $resource('api/integrations/:id', {}, {
      'query': {
        method: 'GET',
        isArray: true
      },
      'get': {
        method: 'GET',
        transformResponse: function (data) {
          data = angular.fromJson(data);
          return data;
        }
      },
      'save': {
        method: 'POST'
      },
      'update': {
        method: 'PUT'
      },
      'delete': {
        method: 'DELETE'
      }
    });
  }
})();
