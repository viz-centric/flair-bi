import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .config(localStorageConfig);

localStorageConfig.$inject = ['$localStorageProvider', '$sessionStorageProvider'];

function localStorageConfig($localStorageProvider, $sessionStorageProvider) {
    $localStorageProvider.setKeyPrefix('jhi-');
    $sessionStorageProvider.setKeyPrefix('jhi-');
}