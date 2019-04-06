import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").controller("DataExtraction", DataExtraction);

DataExtraction.$inject = [
    "$scope",
    "$state",
    "Datasources",
    "$rootScope",
    "ExecutorFactory",
    "Explorer",
    "$timeout"
];

function DataExtraction(
    $scope,
    $state,
    Datasources,
    $rootScope,
    ExecutorFactory,
    Explorer,
    $timeout
) {
    var vm = this;
    $("#extractor").height($(window).height() - 100);
}
