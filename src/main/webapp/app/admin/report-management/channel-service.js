(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('ChannelService', ChannelService);

    ChannelService.$inject = ['$http'];

    function ChannelService($http) {
        var service = {

            channelParameters: channelParameters,
            createTeamConfig: createTeamConfig,
            updateTeamConfig: updateTeamConfig,
            createEmailConfig: createEmailConfig,
            updateEmailConfig: updateEmailConfig,
            getEmailConfig: getEmailConfig,
            getTeamConfig: getTeamConfig,
            getTeamNames:getTeamNames,
            deleteChannelConfig: deleteChannelConfig,
            createJiraConfig: createJiraConfig,
            getJiraConfig: getJiraConfig,
            createJiraTicket: createJiraTicket,
            getJiraTickets: getJiraTickets,
            notifyOpenedJiraTicket: notifyOpenedJiraTicket
        };

        return service;

        ////////////////
        function channelParameters() {
            return $http({
                url: 'api/notification/channelParameters/?channel=',
                method: 'GET'
            });
        }
        function createTeamConfig(body) {
            return $http({
                url: 'api/notification/createTeamConfig',
                method: 'POST',
                data: body
            });
        }
        function updateTeamConfig(body) {
            return $http({
                url: 'api/notification/updateTeamConfig',
                method: 'PUT',
                data: body
            });
        }
        function createEmailConfig(body) {
            return $http({
                url: 'api/notification/createEmailConfig',
                method: 'POST',
                data: body
            });
        }
        function updateEmailConfig(body) {
            return $http({
                url: 'api/notification/updateEmailConfig',
                method: 'PUT',
                data: body
            });
        }
        function getEmailConfig(id) {
            return $http({
                url: 'api/notification/getEmailConfig/?id=' + id + '',
                method: 'GET'
            });
        }
        function getTeamConfig(id) {
            return $http({
                url: 'api/notification/getTeamConfig/?id=' + id + '',
                method: 'GET'
            });
        }
        function getTeamNames(id) {
            return $http({
                url: 'api/notification/getTeamNames/?id=' + id + '',
                method: 'GET'
            });
        }
        function deleteChannelConfig(id) {
            return $http({
                url: 'api/notification/deleteChannelConfig/?id=' + id + '',
                method: 'DELETE'
            });
        }
        function createJiraConfig(body) {
            return $http({
                url: 'api/notification/createJiraConfig',
                method: 'POST',
                data: body
            });
        }
        function getJiraConfig(id) {
            return $http({
                url: 'api/notification/getJiraConfig/?id=' + id + '',
                method: 'GET'
            });
        }
        function createJiraTicket(id) {
            return $http({
                url: 'api/notification/createJiraTicket/?id=' + id + '',
                method: 'GET'
            });
        }
        function getJiraTickets(status, page, pageSize) {
            return $http({
                url: 'api/notification/getJiraTickets/?status=' + status + '&page=' + page + '&pageSize=' + pageSize + '',
                method: 'GET'
            });
        }
        function notifyOpenedJiraTicket(body) {
            return $http({
                url: 'api/notification/notifyOpenedJiraTicket',
                method: 'POST',
                data: body
            });
        }
    }
})();