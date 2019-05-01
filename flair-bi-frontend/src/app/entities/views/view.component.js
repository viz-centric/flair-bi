import * as angular from 'angular';
import viewComponentHtml from './view.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('viewComponent', {
        template: viewComponentHtml,
        controller: viewController,
        controllerAs: 'vm',
        bindings: {
            view: '=',
            canEdit: '='
        }
    });

viewController.$inject = ['$scope', 'AccountDispatch', '$stateParams'];

function viewController($scope, AccountDispatch, $stateParams) {
    var vm = this;
    vm.$onInit = activate;

    ////////////////


    function activate() {

        vm.canUpdate = AccountDispatch.hasAuthority(
            "UPDATE_" + vm.view.id + "_VIEW"
        );
        vm.canRead = AccountDispatch.hasAuthority(
            "READ_" + vm.view.id + "_VIEW"
        );
        vm.canView = vm.canRead && vm.canUpdate;
        vm.requestPublish = AccountDispatch.hasAuthority(
            "REQUEST-PUBLISH_" + vm.view.id + "_VIEW"
        );
        vm.deletePublish = AccountDispatch.hasAuthority(
            "DELETE-PUBLISHED_" + vm.view.id + "_VIEW"
        );
        vm.canDelete = AccountDispatch.hasAuthority(
            "DELETE_" + vm.view.id + "_VIEW"
        );
        vm.canReadPublish = AccountDispatch.hasAuthority(
            "READ-PUBLISHED_" + vm.view.id + "_VIEW"
        );

    }
}
