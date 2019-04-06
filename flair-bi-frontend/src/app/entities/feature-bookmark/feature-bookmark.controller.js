import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("FeatureBookmarkController", FeatureBookmarkController);

FeatureBookmarkController.$inject = ["FeatureBookmark", "data", "config"];

function FeatureBookmarkController(FeatureBookmark, data, config) {
    var vm = this;
    vm.featureBookmarks = data;
    vm.config = config;
}