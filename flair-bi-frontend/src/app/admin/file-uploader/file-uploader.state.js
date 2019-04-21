import * as angular from 'angular';

import fileUploaderHeaderHtml from './file-uploader-header.html';
import fileUploaderHtml from './file-uploader.html'
'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider.state('file-uploader', {
        parent: 'admin',
        url: '/file-uploader?page&sort&search',
        data: {
            authorities: [PERMISSIONS.WRITE_FILE_UPLOADER]
        },
        views: {
            'content-header@': {
                template: fileUploaderHeaderHtml,
                controller: 'FileUploaderController',
                controllerAs: 'vm'
            },
            'content@': {
                template: fileUploaderHtml,
                controller: 'FileUploaderController',
                controllerAs: 'vm'
            }
        },
        params: {
            page: {
                value: '1',
                squash: true
            },
            sort: {
                value: 'id,asc',
                squash: true
            },
            search: null
        },
        resolve: {
            pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                return {
                    page: PaginationUtil.parsePage($stateParams.page),
                    sort: $stateParams.sort,
                    predicate: PaginationUtil.parsePredicate($stateParams.sort),
                    ascending: PaginationUtil.parseAscending($stateParams.sort),
                    search: $stateParams.search
                };
            }],
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('fileUploaderStatus');
                $translatePartialLoader.addPart('global');
                return $translate.refresh();
            }]
        }
    });
}
