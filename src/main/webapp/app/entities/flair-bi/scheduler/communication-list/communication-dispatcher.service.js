(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('CommunicationDispatcherService', CommunicationDispatcherService);

    CommunicationDispatcherService.$inject = ['$http'];

    function CommunicationDispatcherService($http) {
        var communicationList={};

        var service = {
            saveCommunicationList: saveCommunicationList,
            getCommunicationList: getCommunicationList
        };

        return service;

        ////////////////
        function saveCommunicationList(id,list) {
            communicationList[id]=list;
        }

        function getCommunicationList(id) {
            return communicationList[id];
        }
    }
})();