(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('configurationComponent', {
            templateUrl: 'app/admin/report-management/configuration/configuration.component.html',
            controller: configurationController,
            controllerAs: 'vm',
            bindings: {

            }
        });

    configurationController.$inject = ['$uibModal', '$uibModalStack', '$rootScope', 'ChannelService', 'stompClientService', 'AuthServerProvider', 'schedulerService', 'proxyGrpcService', 'Visualmetadata', 'VisualizationUtils', 'visualizationRenderService', 'VisualWrap'];

    function configurationController($uibModal, $uibModalStack, $rootScope, ChannelService, stompClientService, AuthServerProvider, schedulerService, proxyGrpcService, Visualmetadata, VisualizationUtils, visualizationRenderService, VisualWrap) {
        var vm = this;

        vm.saveSMTPSetting = saveSMTPSetting;

        vm.deleteChannelConfig = deleteChannelConfig;
        vm.openTeamConfigDialog = openTeamConfigDialog;
        vm.getWebhookList = getWebhookList;
        vm.saveJiraSetting = saveJiraSetting;
        vm.configurationTabClick = configurationTabClick;
        vm.webhookList = [];
        vm.SMPTSetting = {};
        vm.jiraSetting = {};
        vm.emailChannelConfig = [];
        vm.teamChannelConfig = [];
        vm.connection = {};
        vm.alertTab = "email"

        vm.config = {
            'team': {
                getData: function () {
                    getWebhookList();
                }
            },
            'email': {
                getData: function () {
                    channelParameters();
                    getSMTPSettings();
                }
            },
            'jira': {
                getData: function () {
                    getJiraSettings();
                }
            }

        };

        activate();

        function activate() {
            $uibModalStack.dismissAll()
            vm.config['email'].getData();
        }

        function configurationTabClick(tabName) {
            vm.config[tabName].getData();
            vm.alertTab = tabName;
        }

        function channelParameters() {
            ChannelService.channelParameters()
                .then(function (success) {
                    vm.channelConfig = success.data.channelParameters;
                    vm.emailChannelConfig = success.data.channelParameters.filter(function (item) {
                        return item.id === 'Email'
                    });
                    vm.teamChannelConfig = success.data.channelParameters.filter(function (item) {
                        return item.id === "Teams"
                    });
                    vm.jiraConfig = success.data.channelParameters.filter(function (item) {
                        return item.id === "Jira"
                    });
                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }

        function saveSMTPSetting() {
            var SMPTConfig = {
                user: vm.connection.details.user,
                host: vm.connection.details.host,
                sender: vm.connection.details.sender,
                port: parseInt(vm.connection.details.port),

                password: vm.connection.details.password,
            }
            ChannelService.createEmailConfig(SMPTConfig)
                .then(function (success) {
                    var info = {
                        text: "SMTP settings are saved successfully",
                        title: "Updated"
                    }
                    $rootScope.showSuccessToast(info);
                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });

        }

        function saveJiraSetting() {
            var jiraConfig = {
                organization: vm.connection.details.organization,
                key: vm.connection.details.key,
                userName: vm.connection.details.userName,
                apiToken: vm.connection.details.apiToken
            }
            ChannelService.createJiraConfig(jiraConfig)
                .then(function () {
                    var info = {
                        text: "Jira settings are saved successfully",
                        title: "Updated"
                    }
                    $rootScope.showSuccessToast(info);
                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
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
        function getSMTPSettings() {
            ChannelService.getEmailConfig(0)
                .then(function (success) {
                    vm.SMPTSetting = success.data;
                    vm.connection.details = vm.SMPTSetting;

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
        function openTeamConfigDialog(webhook) {
            $uibModal.open({
                animation: true,
                component: 'teamConfigDialogComponent',
                backdrop: 'static',
                size: "lg",
                resolve: {
                    data: function () {
                        return webhook;
                    },
                    config: function () {
                        return vm.teamChannelConfig;
                    },
                    webhook: function () {
                        return vm.webhookList;
                    }
                }
            }).result.then(function () {
                getWebhookList();
            }, function () { });
        }

        function deleteChannelConfig(data, channel) {
            var title = channel == "team" ? data.webhookName + " webhook URL" : "configuration";
            swal(
                "Are you sure?",
                "You want to delete " + title, {
                dangerMode: true,
                buttons: true,
            })
                .then(function (value) {
                    if (value) {
                        if (data.id) {
                            ChannelService.deleteChannelConfig(data.id)
                                .then(function (success) {
                                    title = channel == "team" ? data.webhookName + " Webhook" : "Configuration";
                                    var info = {
                                        text: title + " successfully deleted",
                                        title: "Cancelled"
                                    }
                                    vm.config[channel].getData();
                                    $rootScope.showSuccessToast(info);

                                }).catch(function (error) {
                                    var info = {
                                        text: error.data.message,
                                        title: "Error"
                                    }
                                    $rootScope.showErrorSingleToast(info);
                                });

                        }
                    } else {
                        return false;
                    }

                });
        }
    }
})();
