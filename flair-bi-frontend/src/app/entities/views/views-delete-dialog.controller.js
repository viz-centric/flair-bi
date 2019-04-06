import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('ViewsDeleteController', ViewsDeleteController);

ViewsDeleteController.$inject = ['$uibModalInstance', 'entity', 'Views', '$window', '$stateParams', '$scope'];

function ViewsDeleteController($uibModalInstance, entity, Views, $window, $stateParams, $scope) {
    var vm = this;

    vm.views = entity;
    vm.clear = clear;
    vm.confirmDelete = confirmDelete;



    function clear() {
        $uibModalInstance.dismiss('cancel');
        $window.history.back();
    }

    function confirmDelete(id) {
        Views.delete({ id: id },
            function () {
                $scope.$emit('flairbiApp:viewDelete', id);
                $uibModalInstance.close({ dashboardId: $stateParams.id });
                $window.history.back();
            });
    }
}