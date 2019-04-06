import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('UserManagementDetailController', UserManagementDetailController);
//Injecting 'PreviousState' to get the state from the request came
UserManagementDetailController.$inject = ['$stateParams', 'User', 'DatasourceConstraint', 'PreviousState'];

function UserManagementDetailController($stateParams, User, DatasourceConstraint, PreviousState) {
    var vm = this;

    activate();

    vm.load = load;
    vm.user = {};
    //getting the previous state. if no state found, then it navigates to home page - Start
    vm.prevRoute = PreviousState.URL;
    //getting the previous state - End

    vm.load($stateParams.login);

    function activate() {
        DatasourceConstraint.query({
            'user.login': $stateParams.login
        }, function (result) {
            vm.datasourceConstraints = result;
        }, function (error) {

        });
    }

    function load(login) {
        User.get({
            login: login
        }, function (result) {
            vm.user = result;
        });
    }
}