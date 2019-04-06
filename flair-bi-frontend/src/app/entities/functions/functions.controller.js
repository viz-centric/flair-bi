import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('FunctionsController', FunctionsController);

FunctionsController.$inject = ['$scope', '$state', 'Functions'];

function FunctionsController($scope, $state, Functions) {
    var vm = this;

    vm.functions = [];

    loadAll();

    function loadAll() {
        Functions.query(function (result) {
            vm.functions = result;
            vm.searchQuery = null;
        });
    }
}