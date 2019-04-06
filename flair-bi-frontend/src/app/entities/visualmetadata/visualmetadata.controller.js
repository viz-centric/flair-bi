import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("VisualmetadataController", VisualmetadataController);

VisualmetadataController.$inject = [
    "$scope",
    "$state",
    "Visualmetadata",
    "PERMISSIONS",
    "Principal"
];

function VisualmetadataController(
    $scope,
    $state,
    Visualmetadata,
    PERMISSIONS,
    Principal
) {
    var vm = this;

    vm.visualmetadata = [];
    vm.permissions = PERMISSIONS;
    vm.userAuthorities = [];
    vm.hasPermission = hasPermission;

    loadAll();

    function hasPermission(action, resource, entity) {
        return (
            vm.userAuthorities &&
            vm.userAuthorities.indexOf(
                action + "_" + resource + "_" + entity
            ) !== -1
        );
    }

    function loadAll() {
        Visualmetadata.query(function (result) {
            vm.visualmetadata = result;
            vm.searchQuery = null;
        });
        Principal.identity(true).then(function (_id) {
            vm.userAuthorities = _id.authorities;
        });
    }
}