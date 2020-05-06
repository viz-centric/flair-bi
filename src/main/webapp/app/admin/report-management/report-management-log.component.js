(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('reportManagementLogComponent', {
            templateUrl: 'app/admin/report-management/report-management-log.component.html',
            controller: ReportManagementLogsController,
            controllerAs: 'vm',
            bindings: {
                pagingParams: '<'
            }
        });

    ReportManagementLogsController.$inject =
        ['schedulerService', 'ChannelService', '$stateParams', '$state', '$rootScope', 'ReportManagementUtilsService', '$window', 'REPORTMANAGEMENTCONSTANTS'
        ];

    function ReportManagementLogsController(schedulerService, ChannelService, $stateParams, $state, $rootScope, ReportManagementUtilsService, $window, REPORTMANAGEMENTCONSTANTS) {

        var vm = this;
        vm.logs = []
        vm.visualizationid = $stateParams.visualizationid;
        vm.reportType = ($stateParams.reportType === 'true')
        vm.page = 1;
        vm.totalItems = null;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.predicate = vm.pagingParams.predicate;
        vm.reverse = vm.pagingParams.ascending;
        vm.itemsPerPage = 10;
        vm.transition = transition;
        vm.goToViewDataPage = goToViewDataPage;
        vm.createJira = createJira;
        vm.viewJiraTicket = viewJiraTicket;
        vm.getLabelClass = getLabelClass;
        vm.enableTicketCreation = enableTicketCreation;
        vm.dateFormat = REPORTMANAGEMENTCONSTANTS.dateTime;
        vm.getJiraSettings = getJiraSettings;
        activate();
        ///////////////////////////////////////

        function activate() {
            getScheduledReportsLogs(vm.visualizationid);
            vm.getJiraSettings();
        }

        function getScheduledReportsLogs(visualizationid) {
            schedulerService.getScheduleReportLogs(visualizationid, vm.itemsPerPage, vm.pagingParams.page - 1).then(
                function (response) {
                    vm.logs = response.data.schedulerLogs;

                    vm.logs.forEach(element => {
                        element.channel = JSON.parse(element.channel);
                    });

                    vm.totalItems = response.data.totalRecords;
                    vm.queryCount = vm.totalItems;
                    vm.page = vm.pagingParams.page;
                },
                function (error) {
                    $rootScope.showErrorSingleToast({
                        text: 'Error loading report logs',
                        title: "Error"
                    });
                });
        }

        function sort() {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function loadPage(page) {
            vm.pagingParams.page = page;
            getScheduledReportsLogs(vm.visualizationid);
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                visualizationid: vm.visualizationid
            });
        }


        function goToViewDataPage(log) {
            if (log.taskStatus === "success" && log.viewData !== "") {
                ReportManagementUtilsService.goToViewDataPage(log.viewData);
            }
        }
        function createJira(log) {
            ChannelService.createJiraTicket(log.schedulerTaskMetaId).then(
                function (response) {
                    if (response.data) {
                        if (response.data.jiraTicketLink != "") {
                            log.isTicketCreated = true;
                            log.viewTicket = response.data.jiraTicketLink;
                            $window.open(response.data.jiraTicketLink, '_blank');
                        }
                        else {
                            $rootScope.showErrorSingleToast({
                                text: 'Error while creating jira',
                                title: "Error"
                            });
                        }

                    }
                },
                function (error) {
                    $rootScope.showErrorSingleToast({
                        text: 'Error while creating jira',
                        title: "Error"
                    });
                });
        }
        function viewJiraTicket(log) {
            $window.open(log.viewTicket, '_blank');
        }

        function enableTicketCreation(log) {
            if (!log.isTicketCreated && log.taskStatus === "success") {
                log.enableTicketCreation = !log.enableTicketCreation;
                schedulerService.disableTicketCreation(log.schedulerTaskMetaId).then(
                    function (response) {

                    },
                    function (error) {
                        $rootScope.showErrorSingleToast({
                            text: 'Error occured while disabling ticket creation',
                            title: "Error"
                        });
                    });
            }
        }
        function getLabelClass(log) {
            if(vm.reportType && !log.thresholdMet){
                return 'hidden';
            }
            if (log.isTicketCreated || log.taskStatus !== "success") {
                return REPORTMANAGEMENTCONSTANTS.disabledTicketCreation;
            }
        }
        function getJiraSettings() {
            ChannelService.getJiraConfig(0)
                .then(function (success) {
                    vm.jiraSetting = success.data;

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