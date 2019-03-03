(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('LogsController', LogsController);

    LogsController.$inject = ['LogsService', 'Principal', 'PERMISSIONS'];

    function LogsController(LogsService, Principal, PERMISSIONS) {
        var vm = this;

        vm.changeLevel = changeLevel;
        vm.loggers = LogsService.findAll();

        vm.canChangeLogs = Principal.hasAuthority(PERMISSIONS.UPDATE_LOGS);

        function changeLevel(name, level) {
            LogsService.changeLevel({
                name: name,
                level: level
            }, function () {
                vm.loggers = LogsService.findAll();
            });
        }
    }
})();
