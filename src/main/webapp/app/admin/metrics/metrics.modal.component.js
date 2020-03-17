(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('metricsModalComponent', {
            templateUrl: 'app/admin/metrics/metrics.modal.component.html',
            controller: JhiMetricsMonitoringModalController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });


    JhiMetricsMonitoringModalController.$inject = [];

    function JhiMetricsMonitoringModalController() {
        var vm = this;

        vm.cancel = vm.dismiss;
        vm.getLabelClass = getLabelClass;
        vm.threadDump = vm.resolve.threadDump;
        vm.threadDumpAll = 0;
        vm.threadDumpBlocked = 0;
        vm.threadDumpRunnable = 0;
        vm.threadDumpTimedWaiting = 0;
        vm.threadDumpWaiting = 0;

        vm.$onInit = function () {
            angular.forEach(vm.threadDump, function (value) {
                if (value.threadState === 'RUNNABLE') {
                    vm.threadDumpRunnable += 1;
                } else if (value.threadState === 'WAITING') {
                    vm.threadDumpWaiting += 1;
                } else if (value.threadState === 'TIMED_WAITING') {
                    vm.threadDumpTimedWaiting += 1;
                } else if (value.threadState === 'BLOCKED') {
                    vm.threadDumpBlocked += 1;
                }
            });

            vm.threadDumpAll = vm.threadDumpRunnable + vm.threadDumpWaiting +
                vm.threadDumpTimedWaiting + vm.threadDumpBlocked;
        }

        function getLabelClass(threadState) {
            if (threadState === 'RUNNABLE') {
                return 'label-success';
            } else if (threadState === 'WAITING') {
                return 'label-info';
            } else if (threadState === 'TIMED_WAITING') {
                return 'label-warning';
            } else if (threadState === 'BLOCKED') {
                return 'label-danger';
            }
        }
    }
})();
