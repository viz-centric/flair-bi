import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('FileUploaderStatusDetailController', FileUploaderStatusDetailController);

FileUploaderStatusDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'FileUploaderStatus'];

function FileUploaderStatusDetailController($scope, $rootScope, $stateParams, previousState, entity, FileUploaderStatus) {
    var vm = this;

    vm.fileUploaderStatus = entity;
    vm.previousState = previousState.name;

    var unsubscribe = $rootScope.$on('flairbiApp:fileUploaderStatusUpdate', function (event, result) {
        vm.fileUploaderStatus = result;
    });
    $scope.$on('$destroy', unsubscribe);
}