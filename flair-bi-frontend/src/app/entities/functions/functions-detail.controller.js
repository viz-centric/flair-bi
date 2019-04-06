import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('FunctionsDetailController', FunctionsDetailController);

FunctionsDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'Functions'];

function FunctionsDetailController($scope, $rootScope, $stateParams, previousState, entity, Functions) {
    var vm = this;

    vm.functions = entity;
    vm.previousState = previousState.name;

    var unsubscribe = $rootScope.$on('flairbiApp:functionsUpdate', function (event, result) {
        vm.functions = result;
    });
    $scope.$on('$destroy', unsubscribe);
}