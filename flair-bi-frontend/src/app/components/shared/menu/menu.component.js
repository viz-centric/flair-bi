import * as angular from 'angular';
import menu from './menu.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('menuComponent', {
        template: menu,
        controller: menuController,
        controllerAs: 'vm',
    });

menuController.$inject = ['$scope', '$state', 'Auth', 'AccountDispatch'];

function menuController($scope, $state, Auth, AccountDispatch) {
    var vm = this;
    vm.$state = $state;
    vm.logout = logout;
    vm.account = AccountDispatch.getAccount();

    function logout() {
        Auth.logout();
        $state.go('login');
    }
}
