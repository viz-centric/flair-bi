(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('teamConfigDialog', teamConfigDialog);

    teamConfigDialog.$inject = ['$scope', 'data', 'config', '$uibModalInstance', '$rootScope', 'ChannelService'];

    function teamConfigDialog($scope, data, config, $uibModalInstance, $rootScope, ChannelService) {
        var vm = this;
        vm.config = config;
        vm.clear = clear;
        vm.connection = {};
        vm.connection.details = data;
        vm.addWebhook = addWebhook;
        vm.updateWebhook = updateWebhook;
        vm.headerText = "Add MS Teams webhook URL";
        if (data) {
            vm.headerText = "Edit MS Teams webhook URL";
            vm.isEdit = true;
        }

        activate();
        ////////////////
        function activate() {

        }
        function clear() {
            $uibModalInstance.close();
        }
        function addWebhook() {
            var teamConfig = {
                webhookName: vm.connection.details.webhookName,
                webhookURL: vm.connection.details.webhookURL
            }
            ChannelService.createTeamConfig(teamConfig)
                .then(function (success) {
                    var info = {
                        text: "team's config is saved",
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

        function updateWebhook() {
            var teamConfig = {
                id: parseInt(vm.connection.details.id),
                webhookName: vm.connection.details.webhookName,
                webhookURL: vm.connection.details.webhookURL
            }
            ChannelService.updateTeamConfig(teamConfig)
                .then(function (success) {
                    var info = {
                        text: "team webhook URL updated successfully",
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

    }
})();

