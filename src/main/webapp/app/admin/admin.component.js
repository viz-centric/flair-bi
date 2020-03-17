(function () {
    "use strict";

    angular
        .module('flairbiApp')
        .component('adminComponent', {
            templateUrl: 'app/admin/admin.component.html',
            controller: AdminController,
            controllerAs: 'vm'
        });

    AdminController.$inject = ["adminListService"];

    function AdminController(adminListService) {
        var vm = this;

        ////////////////

        vm.$onInit = activate;

        function activate() {
            vm.menuItems = adminListService.getList();
        }
    }
})();
