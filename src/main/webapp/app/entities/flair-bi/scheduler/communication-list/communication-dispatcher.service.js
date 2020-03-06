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
            getCommunicationList: getCommunicationList,
            resetCommunicationList:resetCommunicationList
        };

        return service;

        ////////////////
        function saveCommunicationList(list) {
            communicationList=list;
        }

        function getCommunicationList() {
            return communicationList;
        }

        function resetCommunicationList(){
            communicationList={};
        }
    }
})();