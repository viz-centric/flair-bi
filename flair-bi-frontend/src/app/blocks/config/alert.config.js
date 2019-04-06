import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .config(alertServiceConfig);

alertServiceConfig.$inject = ['AlertServiceProvider'];

function alertServiceConfig(AlertServiceProvider) {
    // set below to true to make alerts look like toast
    AlertServiceProvider.showAsToast(false);
}