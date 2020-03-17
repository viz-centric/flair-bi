(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('metricsComponent', {
            templateUrl: 'app/admin/metrics/metrics.component.html',
            controller: JhiMetricsMonitoringController,
            controllerAs: 'vm'
        }).component('metricsContentHeaderComponent', {
            templateUrl: 'app/admin/metrics/metrics-content-header.component.html',
            controller: JhiMetricsMonitoringController,
            controllerAs: 'vm'
        });

    JhiMetricsMonitoringController.$inject = ['$scope', 'JhiMetricsService', '$uibModal'];

    function JhiMetricsMonitoringController($scope, JhiMetricsService, $uibModal) {
        var vm = this;

        vm.metrics = {};
        vm.refresh = refresh;
        vm.refreshThreadDumpData = refreshThreadDumpData;
        vm.servicesStats = {};
        vm.updatingMetrics = true;

        vm.$onInit = vm.refresh;

        $scope.$watch('vm.metrics', function (newValue) {
            vm.servicesStats = {};
            angular.forEach(newValue.timers, function (value, key) {
                if (key.indexOf('web.rest') !== -1 || key.indexOf('service') !== -1) {
                    vm.servicesStats[key] = value;
                }
            });

        });

        function refresh() {
            vm.updatingMetrics = true;
            JhiMetricsService.getMetrics().then(function (promise) {
                vm.metrics = promise;
                vm.updatingMetrics = false;
            }, function (promise) {
                vm.metrics = promise.data;
                vm.updatingMetrics = false;
            });
        }

        function refreshThreadDumpData() {
            JhiMetricsService.threadDump().then(function (data) {
                $uibModal.open({
                    component: 'metricsModalComponent',
                    size: 'lg',
                    resolve: {
                        threadDump: function () {
                            return data;
                        }

                    }
                });
            });
        }


    }
})();
