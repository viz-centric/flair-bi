import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("DatasourcesController", DatasourcesController);

DatasourcesController.$inject = [
    "Datasources",
    "datasourceFilter",
    "config"
];

function DatasourcesController(Datasources, datasourceFilter, config) {
    var vm = this;

    vm.datasources = [];

    loadAll();

    function loadAll() {
        vm.config = config;
        var filter = {};
        if (datasourceFilter) {
            filter = datasourceFilter;
        }
        Datasources.query(filter, function (result) {
            vm.datasources = result;
            vm.searchQuery = null;
        });
    }
}