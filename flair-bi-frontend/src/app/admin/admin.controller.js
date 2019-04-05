(function() {
    "use strict";

    angular.module("flairbiApp").controller("AdminController", AdminController);

    AdminController.$inject = ["$scope","adminListService"];

    function AdminController($scope,adminListService) {
        var vm = this;
        activate();

        ////////////////

        function activate() {
            vm.menuItems=adminListService.getList();
        }
    }
})();
