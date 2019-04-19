import * as angular from 'angular';

angular
    .module('flairbiApp')
    .controller('DashboardPublishRequestDialogController', DashboardPublishRequestDialogController);


DashboardPublishRequestDialogController.$inject = [
    "$uibModalInstance",
    "$window",
    "Dashboards",
    "$scope",
    "entity",
    "$stateParams",
    "Views",
    "$translate",
    "$rootScope"
];

function DashboardPublishRequestDialogController(
    $uibModalInstance,
    $window,
    Dashboards,
    $scope,
    entity,
    $stateParams,
    Views,
    $translate,
    $rootScope
){
    var vm = this;
    vm.dashboard = entity;
    vm.confirmRelease = confirmRelease;
    vm.clear = clear;
    vm.checkIfAnySelected = checkIfAnySelected;
    vm.anySelected = false;
    activate();

    ////////////////

    function activate() {
        vm.dashboard.dashboardViews =  Views.query({viewDashboard: $stateParams.id});
    }

    function clear() {
        $uibModalInstance.dismiss("cancel");
        $window.history.back();
    }

    function checkIfAnySelected(){
        vm.anySelected =  vm.dashboard.dashboardViews
            .filter(function(item) {
                return item.selected === true;})
            .length !==0;
    }

    function confirmRelease(identifier) {
        var viewIds = vm.dashboard.dashboardViews
            .filter(function(item) { return item.selected;})
            .map(function(item) {return item.id});


        Dashboards.requestRelease(
            { id: identifier },
            { comment: vm.comment,
                viewIds: viewIds},
            function() {
                $scope.$emit("flairbiApp:dashboardRequestRelease", identifier);
                $uibModalInstance.close({ dashboardId: $stateParams.id });
                $window.history.back();
                var info = {text:$translate.instant('flairbiApp.dashboards.releaseRequest'),title: "Requested"}
                $rootScope.showSuccessToast(info);
            }
        );
    }
}
