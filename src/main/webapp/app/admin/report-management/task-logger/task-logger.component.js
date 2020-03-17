(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('taskLoggerComponent', {
            templateUrl: 'app/admin/report-management/task-logger/task-logger.component.html',
            controller: taskLoggerController,
            controllerAs: 'vm',
            bindings: {

            }
        });

    taskLoggerController.$inject = ['$uibModal', '$rootScope', 'ChannelService', 'stompClientService', 'AuthServerProvider', 'schedulerService', 'proxyGrpcService', 'Visualmetadata', 'VisualizationUtils', 'visualizationRenderService', 'VisualWrap'];

    function taskLoggerController($uibModal, $rootScope, ChannelService, stompClientService, AuthServerProvider, schedulerService, proxyGrpcService, Visualmetadata, VisualizationUtils, visualizationRenderService, VisualWrap) {
        var vm = this;
        vm.totalJiraTickets = 0;
        vm.jiraPage = 1;
        vm.JiraItemsPerPage = 5;

        vm.jiraLoadPage = jiraLoadPage;
        vm.getWebhookList = getWebhookList;

        vm.connection = {};
        vm.jiraTickets = [];
        vm.jiraStatusList = ["All", "Closed", "Open", "To Do", "In Progress"];
        vm.jiraTicketStatus = "All";
        vm.getJiraByStatus = getJiraByStatus;
        vm.openTicketSchedulerDialog = openTicketSchedulerDialog;
        vm.refreshTickete = refreshTickete;

        activate();

        function activate() {
            getWebhookList();
            getJiraSettings();
            getJiraTickets(vm.jiraTicketStatus, vm.jiraPage - 1, vm.JiraItemsPerPage);
        }

        function refreshTickete() {
            getJiraTickets(vm.jiraTicketStatus, vm.jiraPage - 1, vm.JiraItemsPerPage);
        }

        function jiraLoadPage(page) {
            vm.jiraPage = page;
            getJiraTickets(vm.jiraTicketStatus, vm.jiraPage - 1, vm.JiraItemsPerPage);
        }

        function getJiraTickets(status, page, pageSize) {
            ChannelService.getJiraTickets(status, page, pageSize)
                .then(function (success) {
                    vm.jiraTickets = success.data.records;
                    vm.totalJiraTickets = success.data.totalRecords;
                    vm.jiraPage = page + 1;
                    vm.jiraQueryCount = vm.totalJiraTickets;
                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }

        function getJiraByStatus() {
            getJiraTickets(vm.jiraTicketStatus, vm.jiraPage - 1, vm.JiraItemsPerPage);
        }


        function getWebhookList() {
            ChannelService.getTeamConfig(0)
                .then(function (success) {
                    vm.webhookList = success.data;

                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }

        function getJiraSettings() {
            ChannelService.getJiraConfig(0)
                .then(function (success) {
                    vm.jiraSetting = success.data;
                    vm.connection.details = vm.jiraSetting;

                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }
        function openTicketSchedulerDialog() {
            $uibModal.open({
                animation: true,
                component: 'ticketSchedulerDialogComponent',
                backdrop: 'static',
                size: "sm",
                resolve: {
                    data: function () {
                        return vm.webhookList;
                    },
                    config: function () {
                        return vm.jiraSetting;
                    }
                }
            }).result.then(function () { }, function () { });
        }
    }
})();
