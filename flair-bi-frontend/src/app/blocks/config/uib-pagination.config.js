import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .config(paginationConfig);

paginationConfig.$inject = ['uibPaginationConfig', 'paginationConstants'];

function paginationConfig(uibPaginationConfig, paginationConstants) {
    uibPaginationConfig.itemsPerPage = paginationConstants.itemsPerPage;
    uibPaginationConfig.maxSize = 5;
    uibPaginationConfig.boundaryLinks = true;
    uibPaginationConfig.firstText = '«';
    uibPaginationConfig.previousText = '‹';
    uibPaginationConfig.nextText = '›';
    uibPaginationConfig.lastText = '»';
}