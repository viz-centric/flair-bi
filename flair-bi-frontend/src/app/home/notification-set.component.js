(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('notificationSetComponent', {
            templateUrl: 'app/home/notification-set.component.html',
            controller: notificationSetController,
            controllerAs: 'vm',
            bindings: {
                releaseAlert: "="
            }
        });

    notificationSetController.$inject = ['$scope', '$state','alertsService'];

    function notificationSetController($scope, $state,alertsService) {
        var vm = this;
        vm.toggleNotifications=toggleNotifications;
        vm.pageSize = 5;
        vm.setPage = setPage;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.range = range;
        vm.noOfPages = 1;
        vm.currentPage = 0;
        vm.isMsgVisible=vm.releaseAlert.id==1?true:false;

        active();

        function active(){
            vm.alerts=vm.releaseAlert.alerts;
            vm.count=vm.releaseAlert.count;
            vm.noOfPages=Math.ceil(vm.count/vm.pageSize);
        }
        
        function toggleNotifications(){
            vm.isMsgVisible=!vm.isMsgVisible;
        }

        function getReleasedAlerts(id,offset){
            alertsService.getReleaseAlerts(id,offset).then(function(result){
                vm.alerts=result.data;
            }, onGetReleaseAlertsError);
        }

        function onGetReleaseAlertsError(error){

        }

        function getReleasedAlertsCount(id){
            alertsService.getReleaseAlertsCount(id).then(onGetReleaseAlertsCountSuccess, onGetReleaseAlertsCountError);
        }

        function onGetReleaseAlertsCountSuccess(result){
            vm.count=result.data;
            vm.noOfPages=Math.ceil(vm.count/vm.pageSize);
        }

        function onGetReleaseAlertsCountError(error){
            console.log("error"+error);
        }

 
        function range(start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        function prevPage() {
            if (vm.currentPage > 0) {
                vm.currentPage--;
                getReleasedAlerts(vm.releaseAlert.id,vm.pageSize*(vm.currentPage+1)-vm.pageSize);
            }
        };

        function nextPage() {
            if (vm.currentPage < vm.noOfPages-1) {
                vm.currentPage++;
                getReleasedAlerts(vm.releaseAlert.id,vm.pageSize*(vm.currentPage+1)-vm.pageSize);
            }
        };

        function setPage(n) {
            vm.currentPage = n;
            getReleasedAlerts(vm.releaseAlert.id,vm.pageSize*(vm.currentPage+1)-vm.pageSize);
        };


    }
})();
