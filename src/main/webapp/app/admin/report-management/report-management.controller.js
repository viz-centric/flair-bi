(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['User', 'schedulerService',
        'AlertService', 'pagingParams', 'paginationConstants', '$rootScope', '$state',
        'AccountDispatch', 'ReportManagementUtilsService', 'ComponentDataService', '$uibModal'
    ];

    function ReportManagementController(User, schedulerService,
        AlertService, pagingParams, paginationConstants, $rootScope, $state, AccountDispatch, ReportManagementUtilsService, ComponentDataService, $uibModal) {

        var vm = this;

        vm.reports = [];

        vm.page = 1;
        vm.totalItems = 0;
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

        vm.deleteWebhook = deleteWebhook;
        vm.openTeamConfigDialog = openTeamConfigDialog;
        vm.reportManagementTabClick = reportManagementTabClick;
        vm.getWebhookList = getWebhookList;
        vm.openCalendar = openCalendar;
        vm.datePickerOpenStatus = {};
        vm.datePickerOpenStatus.fromDate = false;
        vm.datePickerOpenStatus.toDate = false;
        vm.webhookList = [];
        vm.SMPTSetting = {};
        vm.dateFormat = 'yyyy-MM-dd';
        vm.user = null;
        vm.emailChannelConfig = [];
        vm.teamChannelConfig = [];
        vm.connection = {};

        activate();
        ///////////////////////////////////////

        function activate() {
            reportManagementTabClick('report');
            var cronstrue = window.cronstrue;
        }

        function reportManagementTabClick(tabName) {
            if (tabName == "report") {
                getAccount();
                getScheduledReports(vm.account.login, "", "", "");
            }
            else if (tabName == "configuration") {
                channelParameters();
                getSMTPSettings();
            }
            else if (tabName == "email") {
                getSMTPSettings();
            }
            else if (tabName == "team") {
                getWebhookList();
            }
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
            schedulerService.channelParameters()
                .then(function (success) {
                    vm.channelConfig = success.data.channelParameters;
                    vm.emailChannelConfig = success.data.channelParameters.filter(function (item) {
                        return item.id === 'Email'
                    });
                    vm.teamChannelConfig = success.data.channelParameters.filter(function (item) {
                        return item.id === "Teams"
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
            schedulerService.createEmailConfig(SMPTConfig)
                .then(function (success) {
                    var info = {
                        text: "SMTP settings are save successfully",
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
        function getWebhookList() {
            schedulerService.getTeamConfig(0)
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
            schedulerService.getEmailConfig(0)
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
            }).result.then(function () { }, function () { });
        }

        function deleteWebhook(webhook) {
            swal(
                "Are you sure?",
                "You want to delete " + webhook.webhookName + " webhook URL", {
                dangerMode: true,
                buttons: true,
            })
                .then(function (value) {
                    if (value) {
                        if (webhook.id) {
                            schedulerService.deleteChannelConfig(webhook.id)
                                .then(function (success) {
                                    var info = {
                                        text: "Webhook delete successfully",
                                        title: "Updated"
                                    }
                                    getWebhookList();
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
