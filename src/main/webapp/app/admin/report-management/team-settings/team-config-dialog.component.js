(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('teamConfigDialogComponent', {
            templateUrl: 'app/admin/report-management/team-settings/team-config-dialog.component.html',
            controller: teamConfigDialog,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });

    teamConfigDialog.$inject = ['$rootScope', 'ChannelService'];

    function teamConfigDialog($rootScope, ChannelService) {
        var vm = this;
        vm.config = vm.resolve.config;
        vm.clear = vm.close;
        vm.connection = {};
        vm.connection.details = vm.resolve.data;
        vm.addWebhook = addWebhook;
        vm.updateWebhook = updateWebhook;
        vm.headerText = "Add MS Teams webhook URL";
        vm.webhookList = vm.resolve.webhook;
        if (vm.resolve.data) {
            vm.headerText = "Edit MS Teams webhook URL";
            vm.isEdit = true;
        }

        vm.$onInit = activate;
        ////////////////
        function activate() {

        }

        function checkWebhhokIsExiste(webhook) {
            for (var index = 0; index < vm.webhookList.length; index++) {
                if (webhook.id) {
                    if (webhook.webhookName === vm.webhookList[index].webhookName && webhook.id !== vm.webhookList[index].id) {
                        return true;
                    }
                }
                else {
                    if (webhook.webhookName === vm.webhookList[index].webhookName) {
                        return true;
                    }
                }
            }
            return false;
        }
        function addWebhook() {
            var teamConfig = {
                webhookName: vm.connection.details.webhookName,
                webhookURL: vm.connection.details.webhookURL
            }
            if (!checkWebhhokIsExiste(teamConfig)) {
                ChannelService.createTeamConfig(teamConfig)
                    .then(function () {
                        var info = {
                            text: "MS Team configuration updated successfully.",
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
            else {
                var info = {
                    text: "Webhook already exists with this name",
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            }
        }

        function updateWebhook() {
            var teamConfig = {
                id: parseInt(vm.connection.details.id),
                webhookName: vm.connection.details.webhookName,
                webhookURL: vm.connection.details.webhookURL
            }
            if (!checkWebhhokIsExiste(teamConfig)) {
                ChannelService.updateTeamConfig(teamConfig)
                    .then(function (success) {
                        var info = {
                            text: "Webhook URL updated successfully",
                            title: "Updated"
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
            else {
                var info = {
                    text: "Webhook already exists with this name",
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            }
        }

    }
})();

