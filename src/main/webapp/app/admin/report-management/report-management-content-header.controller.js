(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('PermissionManagementContentHeaderController', PermissionManagementContentHeaderController);

    PermissionManagementContentHeaderController.$inject = [
        '$rootScope',
        '$uibModal'
    ];

    function PermissionManagementContentHeaderController(
        $rootScope,
        $uibModal
    ) {
        var vm = this;


        activate();

        ////////////////

        function activate() {}

        
    }
})();
