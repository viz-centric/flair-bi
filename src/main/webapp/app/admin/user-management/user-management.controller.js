(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('UserManagementController', UserManagementController);

    UserManagementController.$inject = ['Principal', 'User', 'ParseLinks',
        'AlertService', '$state', 'pagingParams',
        'paginationConstants', 'JhiLanguageService', 'PERMISSIONS','$translate','$rootScope'
    ];

    function UserManagementController(Principal, User, ParseLinks,
        AlertService, $state, pagingParams,
        paginationConstants, JhiLanguageService, PERMISSIONS,$translate,$rootScope) {
        var vm = this;

        vm.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        vm.currentAccount = null;
        vm.languages = null;
        vm.loadAll = loadAll;
        vm.setActive = setActive;
        vm.users = [];
        vm.page = 1;
        vm.totalItems = null;
        vm.clear = clear;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        vm.transition = transition;

        vm.canWrite = Principal.hasAuthority(PERMISSIONS.WRITE_USER_MANAGEMENT);
        vm.canEdit = Principal.hasAuthority(PERMISSIONS.UPDATE_USER_MANAGEMENT);
        vm.canDelete = Principal.hasAuthority(PERMISSIONS.DELETE_USER_MANAGEMENT);

        vm.loadAll();
        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });
        Principal.identity().then(function (account) {
            vm.currentAccount = account;
        });

        function setActive(user, isActivated) {
            user.activated = isActivated;
            User.update(user, function () {
                vm.loadAll();
                vm.clear();
                if(isActivated){
                    var info = {text:$translate.instant('userManagement.activatedSuccess'),title: "Activated"};
                    $rootScope.showSuccessToast(info);
                }else{
                    var info = {text:$translate.instant('userManagement.deactivatedSuccess'),title: "Deactivated"};
                    $rootScope.showSuccessToast(info);
                }
            },function(error){
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('userManagement.errorUpdating')
                });
            });
        }

        function loadAll() {
            User.query({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function onSuccess(data, headers) {
            //hide anonymous user from user management: it's a required user for Spring Security
            var hiddenUsersSize = 0;
            for (var i in data) {
                if (data[i]['login'] === 'anonymoususer') {
                    data.splice(i, 1);
                    hiddenUsersSize++;
                }
            }
            vm.links = ParseLinks.parse(headers('link'));
            vm.totalItems = headers('X-Total-Count') - hiddenUsersSize;
            vm.queryCount = vm.totalItems;
            vm.page = pagingParams.page;
            vm.users = data;
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

        function clear() {
            vm.user = {
                id: null,
                login: null,
                firstName: null,
                lastName: null,
                email: null,
                activated: null,
                langKey: null,
                createdBy: null,
                createdDate: null,
                lastModifiedBy: null,
                lastModifiedDate: null,
                resetDate: null,
                resetKey: null,
                authorities: null
            };
        }

        function sort() {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }
    }
})();
