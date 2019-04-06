import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("ServiceDeleteController", ServiceDeleteController);

ServiceDeleteController.$inject = [
    "$uibModalInstance",
    "entity",
    "Service"
];

function ServiceDeleteController($uibModalInstance, entity, Service) {
    var vm = this;

    vm.service = entity;
    vm.clear = clear;
    vm.confirmDelete = confirmDelete;
    vm.toggleCollapse = toggleCollapse;

    activate();

    function activate() {
        vm.deleteInfo = Service.deleteInfo({ id: vm.service.id });
    }

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function toggleCollapse(entity) {
        vm["is" + entity + "Collapsed"] = !vm["is" + entity + "Collapsed"];
    }

    function confirmDelete(id) {
        Service.delete({ id: id }, function () {
            $uibModalInstance.close(true);
        });
    }
}