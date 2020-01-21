(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementLogsController', ReportManagementLogsController);

    ReportManagementLogsController.$inject = ['User', 'schedulerService', 'ChannelService',
        'AlertService', '$stateParams', 'pagingParams', '$state', '$rootScope', 'ReportManagementUtilsService', '$window'
    ];

    function ReportManagementLogsController(User, schedulerService, ChannelService,
        AlertService, $stateParams, pagingParams, $state, $rootScope, ReportManagementUtilsService, $window) {

        var vm = this;
        vm.logs = []
        vm.visualizationid = $stateParams.visualizationid;
        vm.page = 1;
        vm.totalItems = null;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = 10;
        vm.transition = transition;
        vm.goToViewDataPage = goToViewDataPage;
        vm.createJira = createJira;
        vm.viewJiraTicket = viewJiraTicket;
        vm.getLabelClass = getLabelClass;
        vm.enableTicketCreation = enableTicketCreation;
        activate();
        ///////////////////////////////////////

        function activate() {
            getScheduledReportsLogs(vm.visualizationid);
        }

        function getScheduledReportsLogs(visualizationid) {
            schedulerService.getScheduleReportLogs(visualizationid, vm.itemsPerPage, pagingParams.page - 1).then(
                function (response) {
                    vm.logs = response.data.schedulerLogs;
                    vm.totalItems = response.data.totalRecords;
                    vm.queryCount = vm.totalItems;
                    vm.page = pagingParams.page;
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
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                visualizationid: vm.visualizationid
            });
        }


        function goToViewDataPage(log) {
            if (log.task_status == "success" && log.viewData != "") {
                ReportManagementUtilsService.goToViewDataPage(log.viewData);
            }
        }
        function createJira(log) {
            ChannelService.createJiraTicket(log.schedulerTaskMetaId).then(
                function (response) {
                    if (response.data) {
                        $window.open(response.data.jiraTicketLink, '_blank');
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
            if (!log.isTicketCreated && log.thresholdMet) {
                log.enableTicketCreation = !log.enableTicketCreation;
                schedulerService.disableTicketCreation(log.schedulerTaskMetaId).then(
                    function (response) {

                    },
                    function (error) {
                        $rootScope.showErrorSingleToast({
                            text: 'Error while disable ticket creation',
                            title: "Error"
                        });
                    });
            }
        }
        function getLabelClass(log) {
            if (log.isTicketCreated == true || log.thresholdMet == false || log.taskStatus != "success") {
                return 'disabled';
            }
        }
    }
})();