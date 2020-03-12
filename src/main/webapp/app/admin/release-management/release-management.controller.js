(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("ReleaseManagementController", ReleaseManagementController);

    ReleaseManagementController.$inject = ["$scope", "Release","$translate","$rootScope"];
    function ReleaseManagementController($scope, Release,$translate,$rootScope) {
        var vm = this;

        vm.approve = approve;
        vm.disapprove = disapprove;
        vm.showWaterMark=true;
        activate();

        ////////////////

        function activate() {
            Release.query(function(result){
                vm.viewRequests = result;
                vm.showWaterMark = vm.viewRequests.length > 0; 
            });
        }

        function disapprove(vr) {
            Release.reject(
                { id: vr.id },
                {},
                function(res) {
                var info = {text:$translate.instant('flairbiApp.releaseRequests.reject',{param:name}),title: "Rejected"}
                $rootScope.showSuccessToast(info);
                    activate();
                },
                function(err) {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.releaseRequests.errorRejecting')
                });
                    activate();
                }
            );
        }

        function approve(vr) {
            Release.approve(
                { id: vr.id },
                {},
                function(res) {
                var info = {text:$translate.instant('flairbiApp.releaseRequests.approve',{param:name}),title: "Approved"}
                $rootScope.showSuccessToast(info);
                    activate();
                },
                function(err) {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.releaseRequests.errorApproving')
                });
                    activate();
                }
            );
        }
    }
})();
