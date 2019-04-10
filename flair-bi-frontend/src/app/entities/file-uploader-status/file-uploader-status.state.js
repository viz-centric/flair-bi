import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];
/**this is just temporary file */
function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider
        .state('file-uploader-status', {
            parent: 'entity',
            url: '/file-uploader-status?page&sort&search',
            data: {
                authorities: [PERMISSIONS.WRITE_FILE_UPLOADER],
                pageTitle: 'flairbiApp.fileUploaderStatus.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/file-uploader-status/file-uploader-statuses.html',
                    controller: 'FileUploaderStatusController',
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
        })
        .state('file-uploader-status-detail', {
            parent: 'entity',
            url: '/file-uploader-status/{id}',
            data: {
                authorities: [PERMISSIONS.WRITE_FILE_UPLOADER],
                pageTitle: 'flairbiApp.fileUploaderStatus.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/file-uploader-status/file-uploader-status-detail.html',
                    controller: 'FileUploaderStatusDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('fileUploaderStatus');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'FileUploaderStatus', function ($stateParams, FileUploaderStatus) {
                    return FileUploaderStatus.get({ id: $stateParams.id }).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'file-uploader-status',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('file-uploader-status-detail.edit', {
            url: '/detail/edit',
            data: {
                authorities: [PERMISSIONS.WRITE_FILE_UPLOADER]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/file-uploader-status/file-uploader-status-dialog.html',
                    controller: 'FileUploaderStatusDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['FileUploaderStatus', function (FileUploaderStatus) {
                            return FileUploaderStatus.get({ id: $stateParams.id }).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('^', {}, { reload: false });
                }, function () {
                    $state.go('^');
                });
            }]
        })
        .state('file-uploader-status.new', {
            url: '/new',
            data: {
                authorities: [PERMISSIONS.WRITE_FILE_UPLOADER]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/file-uploader-status/file-uploader-status-dialog.html',
                    controller: 'FileUploaderStatusDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                fileSystem: null,
                                fileName: null,
                                contentType: null,
                                isFileProcessed: false,
                                id: null
                            };
                        }
                    }
                }).result.then(function () {
                    $state.go('file-uploader-status', null, { reload: 'file-uploader-status' });
                }, function () {
                    $state.go('file-uploader-status');
                });
            }]
        })
        .state('file-uploader-status.edit', {
            url: '/{id}/edit',
            data: {
                authorities: [PERMISSIONS.WRITE_FILE_UPLOADER]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/file-uploader-status/file-uploader-status-dialog.html',
                    controller: 'FileUploaderStatusDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['FileUploaderStatus', function (FileUploaderStatus) {
                            return FileUploaderStatus.get({ id: $stateParams.id }).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('file-uploader-status', null, { reload: 'file-uploader-status' });
                }, function () {
                    $state.go('^');
                });
            }]
        })
        .state('file-uploader-status.delete', {
            url: '/{id}/delete',
            data: {
                authorities: [PERMISSIONS.WRITE_FILE_UPLOADER]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/file-uploader-status/file-uploader-status-delete-dialog.html',
                    controller: 'FileUploaderStatusDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['FileUploaderStatus', function (FileUploaderStatus) {
                            return FileUploaderStatus.get({ id: $stateParams.id }).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('file-uploader-status', null, { reload: 'file-uploader-status' });
                }, function () {
                    $state.go('^');
                });
            }]
        });
}
