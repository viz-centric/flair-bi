(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('ticketSchedulerDialogComponent', {
            templateUrl: 'app/admin/report-management/ticket-scheduler/ticket-scheduler-dialog.component.html',
            controller: ticketSchedulerDialog,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });

    ticketSchedulerDialog.$inject = ['$rootScope', 'ChannelService', 'SCHEDULER_CHANNELS'];

    function ticketSchedulerDialog($rootScope, ChannelService, SCHEDULER_CHANNELS) {
        var vm = this;
        vm.clear = vm.close;
        vm.webhookList = vm.resolve.data;
        vm.notifyOpenedJiraTicket = notifyOpenedJiraTicket;
        vm.channels = SCHEDULER_CHANNELS;
        vm.setChannel = setChannel;
        vm.selectedChannel = [];
        vm.webhook = 0;
        activate();
        ////////////////
        function activate() {
            resetSelectedChannels();
        }

        function notifyOpenedJiraTicket() {
            var jiraConfig = {
                channels: vm.selectedChannel,
                webhookID: vm.webhook,
                project: vm.resolve.config.key
            }
            ChannelService.notifyOpenedJiraTicket(jiraConfig)
                .then(function () {
                    var info = {
                        text: "Notification sent successfully",
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
        function resetSelectedChannels() {
            angular.forEach(vm.channels, function (_, key) {
                vm.channels[key] = false;
            });
        }
    }
})();

