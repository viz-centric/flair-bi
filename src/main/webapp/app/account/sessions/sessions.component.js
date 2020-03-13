(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('sessionComponent', {
            templateUrl: 'app/account/sessions/sessions.component.html',
            controller: SessionsController,
            controllerAs: 'vm'
        });

    SessionsController.$inject = ['Sessions', 'Principal'];

    function SessionsController(Sessions, Principal) {
        //TODO fix header
        //TODO check if session logic is working
        var vm = this;

        vm.account = null;
        vm.error = null;
        vm.invalidate = invalidate;
        vm.sessions = [];
        vm.success = null;

        vm.$onInit = function () {
            Principal.identity().then(function (account) {
                vm.account = account;
            });
            vm.sessions = Sessions.getAll();
        }

        function invalidate(series) {
            Sessions.delete({ series: encodeURIComponent(series) },
                function () {
                    vm.error = null;
                    vm.success = 'OK';
                    vm.sessions = Sessions.getAll();
                },
                function () {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
        }
    }
})();
