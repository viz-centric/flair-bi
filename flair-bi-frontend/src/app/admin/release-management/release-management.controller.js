import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("ReleaseManagementController", ReleaseManagementController);

ReleaseManagementController.$inject = ["$scope", "Release"];
function ReleaseManagementController($scope, Release) {
    var vm = this;

    vm.approve = approve;
    vm.disapprove = disapprove;
    activate();

    ////////////////

    function activate() {
        vm.viewRequests = Release.query({});
    }

    function disapprove(vr) {
        Release.reject(
            { id: vr.id },
            {},
            function (res) {
                activate();
            },
            function (err) {
                activate();
            }
        );
    }

    function approve(vr) {
        Release.approve(
            { id: vr.id },
            {},
            function (res) {
                activate();
            },
            function (err) {
                activate();
            }
        );
    }
}