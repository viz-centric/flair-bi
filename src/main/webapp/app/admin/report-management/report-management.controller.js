(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['User', 'schedulerService', 'ChannelService',
        'AlertService', 'pagingParams', 'paginationConstants', '$rootScope', '$state',
        'AccountDispatch', 'ReportManagementUtilsService', 'ComponentDataService', '$uibModal'
    ];

    function ReportManagementController(User, schedulerService, ChannelService,
        AlertService, pagingParams, paginationConstants, $rootScope, $state, AccountDispatch, ReportManagementUtilsService, ComponentDataService, $uibModal) {

        var vm = this;

        vm.reports = [];

        vm.page = 1;
        vm.totalItems = 0;
        vm.totalJiraTickets = 0;
        vm.jiraPage = 1;
        vm.JiraItemsPerPage = 5;

        vm.jiraLoadPage = jiraLoadPage;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = 5;
        vm.transition = transition;


        vm.parseCron = parseCron;
        vm.executeNow = executeNow;
        vm.goToBuildPage = goToBuildPage;
        vm.deleteReport = deleteReport;
        vm.updateReport = updateReport;
        vm.searchReports = searchReports;
        vm.saveSMTPSetting = saveSMTPSetting;

        vm.deleteChannelConfig = deleteChannelConfig;
        vm.openTeamConfigDialog = openTeamConfigDialog;
        vm.reportManagementTabClick = reportManagementTabClick;
        vm.getWebhookList = getWebhookList;
        vm.saveJiraSetting = saveJiraSetting;
        vm.openCalendar = openCalendar;
        vm.datePickerOpenStatus = {};
        vm.datePickerOpenStatus.fromDate = false;
        vm.datePickerOpenStatus.toDate = false;
        vm.webhookList = [];
        vm.SMPTSetting = {};
        vm.jiraSetting = {};
        vm.dateFormat = 'yyyy-MM-dd';
        vm.user = null;
        vm.emailChannelConfig = [];
        vm.teamChannelConfig = [];
        vm.jiraConfig = [];
        vm.jiraTickets = [];
        vm.jiraStatusList = ["All", "Closed", "Open", "To Do", "In Progress"];
        vm.jiraTicketStatus = "All";
        vm.connection = {};
        vm.config = {
            'team': {
                getData: function () {
                    getWebhookList();
                }
            },
            'email': {
                getData: function () {
                    getSMTPSettings();
                }
            },
            'jira': {
                getData: function () {
                    getJiraSettings();
                }
            },
            'report': {
                getData: function () {
                    getAccount();
                    getScheduledReports(vm.account.login, "", "", "");
                }
            },
            'configuration': {
                getData: function () {
                    channelParameters();
                    getSMTPSettings();
                }
            },
            'tasklogger': {
                getData: function () {
                    getJiraTickets(vm.jiraTicketStatus, vm.jiraPage - 1, vm.JiraItemsPerPage);
                }
            }
        };

        activate();
        ///////////////////////////////////////

        function activate() {

            vm.config['report'].getData();
        }

        function reportManagementTabClick(tabName) {
            vm.config[tabName].getData();
        }

        function getAccount() {
            vm.account = AccountDispatch.getAccount();
            vm.isAdmin = AccountDispatch.isAdmin();
        }

        function getScheduledReports(userName, reportName, startDate, endDate) {
            schedulerService.filterScheduledReports(userName, reportName, startDate, endDate, vm.itemsPerPage, pagingParams.page - 1).then(
                function (response) {
                    vm.reports = response.data.reports;
                    vm.totalItems = response.data.totalRecords;
                    vm.queryCount = vm.totalItems;
                    vm.page = pagingParams.page;
                },
                function (error) {
                    var info = {
                        text: error.statusText,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }

        function parseCron(cronExp) {
            return cronstrue.toString(cronExp);
        }
        function executeNow(vizID) {
            ReportManagementUtilsService.executeNow(vizID);
        }

        function goToBuildPage(build_url) {
            ReportManagementUtilsService.goToBuildPage(build_url);
        }

        function deleteReport(id) {
            schedulerService.cancelScheduleReport(id).then(function (success) {
                var info = {
                    text: success.data.message,
                    title: "Cancelled"
                }
                $rootScope.showSuccessToast(info);
                getScheduledReports(vm.account.login, "", "", "");
            }).catch(function (error) {
                var info = {
                    text: error.data.message,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            });
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function jiraLoadPage(page) {
            vm.jiraPage = page;
            vm.config["tasklogger"].getData();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
            });
        }

        function searchReports() {
            var user = ComponentDataService.getUser() ? ComponentDataService.getUser().login : "";
            vm.reportName = vm.reportName ? vm.reportName : "";
            vm.fromDate = vm.fromDate ? vm.fromDate : "";
            vm.toDate = vm.toDate ? vm.toDate : "";

            getScheduledReports(user, vm.reportName, vm.fromDate, vm.toDate);
        }

        function updateReport(visualizationid) {
            ReportManagementUtilsService.updateReport(visualizationid);
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
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
                        text: "SMTP settings are save successfully",
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
                .then(function (success) {
                    var info = {
                        text: "Jira settings are save successfully",
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
                templateUrl: 'app/admin/report-management/team-settings/team-config-dialog.html',
                controller: 'teamConfigDialog',
                controllerAs: 'vm',
                backdrop: 'static',
                size: "lg",
                resolve: {
                    data: function () {
                        return webhook;
                    },
                    config: function () {
                        return vm.teamChannelConfig;
                    }
                }
            }).result.then(function () {
                vm.config["team"].getData();
             }, function () { });
        }

        function deleteChannelConfig(data, channel) {
            var title = channel == "team" ? data.webhookName + " webhook URL" : "configuration";
            swal(
                "Are you sure?",
                "You want to delete " + title, {
                dangerMode: true,
                buttons: true,
            })
                .then(function (value) {
                    if (value) {
                        if (data.id) {
                            ChannelService.deleteChannelConfig(data.id)
                                .then(function (success) {
                                    title = channel == "team" ? data.webhookName + "Webhook" : "Configuration";
                                    var info = {
                                        text: title + " delete Webhook delete successfully",
                                        title: "Updated"
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