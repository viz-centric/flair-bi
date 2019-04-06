import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .component('adminCardComponent', {
        templateUrl: 'app/admin/admin-card.component.html',
        controller: adminCardController,
        controllerAs: 'vm',
        bindings: {
            menuItem: '='
        }
    });

adminCardController.$inject = ['$scope'];

function adminCardController($scope) {
    var vm = this;


    vm.$onInit = activate;

    ////////////////

    function activate() {
    }
}