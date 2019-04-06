import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('AccountDispatch', AccountDispatch);

AccountDispatch.$inject = [];

function AccountDispatch() {

    var account = {};

    var service = {
        getPermissions: getPermissions,
        saveAccount: saveAccount,
        getAccount: getAccount,
        hasAuthority: hasAuthority,
        isAdmin: isAdmin
    };

    return service;

    ////////////////

    function getPermissions() {
        return account.permissions;
    }

    function hasAuthority(authority) {
        if (account.permissions && account.permissions.indexOf(authority) !== -1) {
            return true;
        } {
            return false;
        }
    }

    function saveAccount(accountDTO) {
        account = accountDTO;
    }

    function getAccount() {
        return account;
    }

    function isAdmin() {
        if (account.userGroups && account.userGroups.indexOf("ROLE_ADMIN") > -1)
            return true;
        else
            return false;
    }


}