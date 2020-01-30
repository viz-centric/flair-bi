(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ticketSchedulerDialog', ticketSchedulerDialog);

    ticketSchedulerDialog.$inject = ['$scope', 'data', 'config', '$uibModalInstance', '$rootScope', 'ChannelService', 'scheduler_channels'];

    function ticketSchedulerDialog($scope, data, config, $uibModalInstance, $rootScope, ChannelService, scheduler_channels) {
        var vm = this;
        vm.clear = clear;
        vm.webhookList = data;
        vm.notifyOpenedJiraTicket = notifyOpenedJiraTicket;
        vm.channels = scheduler_channels;
        vm.setChannel = setChannel;
        vm.selectedChannel = [];
        vm.webhook = 0;
        activate();
        ////////////////
        function activate() {

        }
        function clear() {
            $uibModalInstance.close();
        }
        function notifyOpenedJiraTicket() {
            var jiraConfig = {
                channels: vm.selectedChannel,
                webhookID: vm.webhook,
                project: config.key
            }
            ChannelService.notifyOpenedJiraTicket(jiraConfig)
                .then(function (success) {
                    var info = {
                        text: "Notification sent successfully for open tickets",
                        title: "Saved"
                    }
                    $rootScope.showSuccessToast(info);
                    vm.clear();

                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }
        function setChannel(channel, selected) {
            vm.channels[channel] = !selected;
            var index = vm.selectedChannel.indexOf(channel);
            if (index > -1) {
                vm.selectedChannel.splice(index, 1);
            } else {
                vm.selectedChannel.push(channel)
            }
        }
    }
})();

