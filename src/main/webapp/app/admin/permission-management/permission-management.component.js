(function () {
    'use strict';


    angular
        .module('flairbiApp')
        .component('permissionManagementComponent', {
            templateUrl: 'app/admin/permission-management/permission-management.component.html',
            controller: PermissionManagementController,
            controllerAs: 'vm',
            bindings: {
                pagingParams: '<'
            }
        });

    PermissionManagementController.$inject = ['User',
        'AlertService',
        'UserGroup',
        '$state',
        'paginationConstants',
        'ParseLinks',
        '$localStorage',
        '$scope',
        'ROLES'
    ];

    function PermissionManagementController(User,
        AlertService,
        UserGroup,
        $state,
        paginationConstants,
        ParseLinks,
        $localStorage,
        $scope,
        ROLES) {
        var vm = this;

        vm.users = [];
        vm.userGroups = [];

        vm.dashboards = [];
        vm.onUserClick = onUserClick;
        vm.dashboardToggles = {};
        vm.orderByPermissionsByAction = orderByPermissionsByAction;
        vm.loadUserGroups = loadUserGroups;
        vm.loadUsers = loadUsers;
        vm.onUserGroupClick = onUserGroupClick;
        vm.dashboardsItemsPerPage = paginationConstants.itemsPerPage;
        vm.userGroupsItemsPerPage = paginationConstants.itemsPerPage;
        vm.usersItemsPerPage = paginationConstants.itemsPerPage;
        vm.dashboardsTransition = dashboardsTransition;
        vm.userGroupsTransition = userGroupsTransition;
        vm.usersTransition = usersTransition;
        vm.toggleUsers = toggleUsers;
        vm.toggleUserGroups = toggleUserGroups;
        vm.hasDashboardAccess = hasDashboardAccess;

        vm.selectedEntity;
        vm.selected;

        vm.tabIndex = 0;
        vm.onTabClick = onTabClick;
        vm.changePermission = changePermission;
        vm.searchInput = null;
        vm.filterUser = filterUser;
        vm.filterUserGroup = filterUserGroup;
        vm.isPredefinedGroup = isPredefinedGroup;
        vm.search = search;
        vm.toggle = toggle;

        var actionOrder = {
            READ: 1,
            WRITE: 2,
            UPDATE: 3,
            DELETE: 4,
            UNPUBLISHED: 5
        };

        vm.$onInit = activate;
        ///////////////////////////////////////

        function activate() {
            registerClearChangesEvent();
            registerSavePermissionsEvent();
            registerUserGroupReload();
            loadAll();
        }

        // init pagination

        vm.filteredItems = [];
        vm.groupedItems = [];
        vm.itemsPerPage = 5;
        vm.pagedItems = [];
        vm.currentPage = 0;
        vm.groupToPages = groupToPages;
        vm.setPage = setPage;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.range = range;
        // functions have been describe process the data for display


        // show items per page
        function perPage() {
            vm.groupToPages();
        }
        // calculate page in place
        function groupToPages() {
            vm.pagedItems = [];

            for (var i = 0; i < vm.dashboards.length; i++) {
                if (i % vm.itemsPerPage === 0) {
                    vm.pagedItems[Math.floor(i / vm.itemsPerPage)] = [vm.dashboards[i]];
                } else {
                    vm.pagedItems[Math.floor(i / vm.itemsPerPage)].push(vm.dashboards[i]);
                }
            }
        };

        function onUserClick(username) {
            vm.selectedEntity = username;
            vm.selected = 'user';
            onLoadItems();
        }

        function onUserGroupClick(groupName) {
            vm.selectedEntity = groupName;
            vm.selected = 'userGroup';
            onLoadItems();
        }

        function onTabClick(index) {
            vm.tabIndex = index;
            loadAll();
        }

        function range(start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        function prevPage() {
            if (vm.currentPage > 0) {
                vm.currentPage--;
            }
        };

        function nextPage() {
            if (vm.currentPage < vm.pagedItems.length - 1) {
                vm.currentPage++;
            }
        };

        function setPage(n) {
            vm.currentPage = n;
        };

        function loadAll() {
            vm.selectedEntity = $localStorage.selectedEntity;
            vm.areUsersToggled = $localStorage.areUsersToggled ? $localStorage.areUsersToggled : true;
            vm.areUserGroupsToggled = $localStorage.areUserGroupsToggled ? $localStorage.areUserGroupsToggled : true;
            vm.selected = $localStorage.selected;

            if (vm.areUsersToggled) {
                loadUsers();
            }
            if (vm.areUserGroupsToggled) {
                loadUserGroups();
            }
        }

        function registerUserGroupReload() {
            var unsubscribe = $scope.$on('flairbiApp:reloadUserGroups', function () {
                loadUserGroups();
            });

            $scope.$on('$destroy', unsubscribe);
        }


        function registerClearChangesEvent() {
            var unsubscribe = $scope.$on('flairbiApp:resetPermissionChanges', function () {
                loadAll();
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function registerSavePermissionsEvent() {
            var unsubscribe = $scope.$on('flairbiApp:savePermissions', function () {
                swal(
                    "Change permissions",
                    "Confirm changes to following dashboard permissions", {
                    dangerMode: true,
                    buttons: true,
                })
                    .then(function (value) {
                        if (value) {
                            savePermissions();
                            $scope.$apply();
                        } else {
                            return false;
                        }
                    });
            });

            $scope.$on('$destroy', unsubscribe);
        }


        function hasDashboardAccess(dashboard, viewPermission) {
            var result = dashboard.permissionMetadata
                .filter(function (item) {
                    return item.permission.key.action === viewPermission.permission.key.action;
                })[0];

            return result && result.hasIt;
        }


        function savePermissions() {
            if (vm.selected === 'user') {
                changeUserPermission();
            } else if (vm.selected === 'userGroup') {
                changeUserGroupPermission();
            } else {
                throw Error('Nothing is selected');
            }
        }


        function toggle(item) {
            item.toggle();
        }

        function filterUser(user) {
            if (!vm.searchInput) {
                return true;
            }
            return user.login.toLowerCase().indexOf(vm.searchInput.toLowerCase()) !== -1;
        }

        function filterUserGroup(userGroups) {
            if (!vm.searchInput) {
                return true;
            }
            return userGroups.name.toLowerCase().indexOf(vm.searchInput.toLowerCase()) !== -1;
        }

        function toggleUsers() {
            vm.areUsersToggled = !vm.areUsersToggled;
            $localStorage.areUsersToggled = vm.areUsersToggled;
        }

        function toggleUserGroups() {
            vm.areUserGroupsToggled = !vm.areUserGroupsToggled;
            $localStorage.areUserGroupsToggled = vm.areUserGroupsToggled;
        }

        function dashboardsTransition() {
            $state.transitionTo($state.$current, {
                usersPage: vm.usersPage === 0 ? 0 : vm.usersPage - 1,
                userGroupsPage: vm.userGroupsPage === 0 ? 0 : vm.userGroupsPage - 1,
                dashboardsPage: vm.dashboardsPage
            });
        }

        function userGroupsTransition() {
            $state.transitionTo($state.$current, {
                usersPage: vm.usersPage === 0 ? 0 : vm.usersPage - 1,
                userGroupsPage: vm.userGroupsPage,
                dashboardsPage: vm.dashboardsPage === 0 ? 0 : vm.dashboardsPage - 1
            });
        }

        function usersTransition() {
            $state.transitionTo($state.$current, {
                usersPage: vm.usersPage,
                userGroupsPage: vm.userGroupsPage === 0 ? 0 : vm.userGroupsPage - 1,
                dashboardsPage: vm.dashboardsPage === 0 ? 0 : vm.dashboardsPage - 1
            });
        }

        function changePermission(permission) {
            if (!permission.value) {
                permission.value = !permission.hasIt;
            }
        }

        function onPermissionChangeSuccess() {
            reloadPage();
        }

        function changeUserGroupPermission() {
            var changes = findChanges();

            if (changes.length === 0) {
                return;
            }
            UserGroup.changePermissions({
                name: vm.selectedEntity
            }, changes, function (result) {
                loadAll();
            }, function (error) {
                loadAll();
            });

        }

        function isPredefinedGroup(groupName) {
            return ROLES[groupName] == undefined ? false : true;
        }

        function findChanges() {
            var changes = [];
            vm.dashboards.forEach(function (dashboard) {
                dashboard.permissionMetadata.forEach(function (permissionM) {
                    if (angular.isDefined(permissionM.value) && permissionM.hasIt !== permissionM.value) {
                        changes.push({
                            id: permissionM.permission.stringValue,
                            action: permissionM.hasIt ? 'ADD' : 'REMOVE'
                        });
                    }

                });

                dashboard.views.forEach(function (view) {
                    view.permissionMetadata.forEach(function (permissionV) {
                        if (angular.isDefined(permissionV.value) && permissionV.hasIt !== permissionV.value) {
                            changes.push({
                                id: permissionV.permission.stringValue,
                                action: permissionV.hasIt ? 'ADD' : 'REMOVE'
                            });
                        }
                    });
                });

            });
            return changes;
        }

        function changeUserPermission() {
            var changes = findChanges();
            if (changes.length === 0) {
                return;
            }

            User.changePermissions({
                login: vm.selectedEntity
            }, changes, function (result) {
                loadAll();
            }, function (error) {
                loadAll();
            });
        }






        function reloadPage() {
            $state.reload();
        }

        function search(){
            User.searchViewPermissions({
                login: vm.selectedEntity,
                viewName : vm.searchCriteria
            }, searchPermissionsSuccess, onError);
        }

        function searchPermissionsSuccess(data){
            vm.dashboards = data.map(function (item) {
                var dashboard = item.info;
                dashboard.views = item.views.map(function (viewItem) {
                    return viewItem.info;
                });
                return dashboard;
            });
            vm.groupToPages();
        }

        function getUserGroupDatasourcePermissions() {
            vm.dashboards = [];
            UserGroup.getDatasourcePermissions({
                name: vm.selectedEntity,
                page: vm.pagingParams.dashboardsPage === 0 ? 0 : vm.pagingParams.dashboardsPage - 1,
                size: vm.dashboardsItemsPerPage
            }, onDatasourcePermissionsSuccess, onError)
        }

        function getUserDatasourcePermissions() {
            vm.dashboards = [];
            User.getDatasourcePermissions({
                login: vm.selectedEntity,
                page: vm.pagingParams.dashboardsPage === 0 ? 0 : vm.pagingParams.dashboardsPage - 1,
                size: vm.dashboardsItemsPerPage
            }, onDatasourcePermissionsSuccess, onError)
        }

        function getUserGroupPermissions() {
            $localStorage.selectedEntity = vm.selectedEntity;
            $localStorage.selected = vm.selected;
            UserGroup.getDashboardPermissions({
                name: vm.selectedEntity,
                page: vm.pagingParams.dashboardsPage === 0 ? 0 : vm.pagingParams.dashboardsPage - 1,
                size: vm.dashboardsItemsPerPage
            }, dashboardPermissionsSuccess, onError)
        }


        function getUserPermissions() {
            $localStorage.selectedEntity = vm.selectedEntity;
            $localStorage.selected = vm.selected;
            User.getDashboardPermissions({
                login: vm.selectedEntity,
                page: vm.pagingParams.dashboardsPage === 0 ? 0 : vm.pagingParams.dashboardsPage - 1,
                size: vm.dashboardsItemsPerPage
            }, dashboardPermissionsSuccess, onError);
        }

        function loadUsers() {
            vm.areUsersToggled = true;
            $localStorage.areUsersToggled = true;
            vm.dashboards = [];
            User.query({
                page: vm.pagingParams.usersPage === 0 ? 0 : vm.pagingParams.usersPage - 1,
                size: vm.usersItemsPerPage
            }, onLoadUsersSuccess, onError);
        }

        function loadUserGroups() {
            vm.areUserGroupsToggled = true;
            $localStorage.areUserGroupsToggled = true;
            vm.dashboards = [];
            UserGroup.query({
                page: vm.pagingParams.userGroupsPage === 0 ? 0 : vm.pagingParams.userGroupsPage - 1,
                size: vm.userGroupsItemsPerPage
            }, onLoadUserGroupsSuccess, onError);
        }

        function onLoadUserGroupsSuccess(data, headers) {
            vm.userGroupLinks = ParseLinks.parse(headers('link'));
            vm.userGroupsTotalItems = headers('X-Total-Count');
            vm.userGroupsQueryCount = vm.userGroupsTotalItems;
            vm.userGroupsPage = vm.pagingParams.userGroupsPage;
            vm.userGroups = data;
            onLoadItems();
        }

        function orderByPermissionsByAction(permission) {
            var order = actionOrder[permission.permission.split('_')[0]];
            if (angular.isUndefined(order)) {
                return 99;
            } else {
                return order;
            }
        }


        function dashboardPermissionsSuccess(data, headers) {
            vm.selectedPermissions = null;
            vm.dashboardsLinks = ParseLinks.parse(headers('link'));
            vm.dashboardsTotalItems = headers('X-Total-Count');
            vm.dashboardsQueryCount = vm.dashboardsTotalItems;
            vm.dashboardsPage = vm.pagingParams.dashboardsPage;
            vm.dashboards = data.map(function (item) {
                return item.info;
            });

            var promises = vm.dashboards.map(function (item) {
                return getViewPermissionPromises(item.id, function (result) {
                    item.views = result.map(function (i) {
                        return i.info;
                    });
                    return result;
                }, onError);
            });
            vm.groupToPages();

        }

        function onDatasourcePermissionsSuccess(data, headers) {
            vm.dashboardsLinks = ParseLinks.parse(headers('link'));
            vm.dashboardsTotalItems = headers('X-Total-Count');
            vm.dashboardsQueryCount = vm.dashboardsTotalItems;
            vm.dashboardsPage = vm.pagingParams.dashboardsPage;
            vm.dashboards = data.map(function (item) {
                return item.info;
            });
            groupToPages();
        }


        function getViewPermissionPromises(dashboardId, onRes, onError) {
            if (vm.selected === 'user') {
                return User.getViewPermisions({
                    login: vm.selectedEntity,
                    id: dashboardId
                }, onRes, onError);
            }
            if (vm.selected === 'userGroup') {
                return UserGroup.getViewPermissions({
                    name: vm.selectedEntity,
                    id: dashboardId
                }, onRes, onError);
            }
        }

        function onLoadUsersSuccess(data, headers) {
            //hide anonymous user from permision management: it's a required user for Spring Security
            var hiddenUsersSize = 0;
            for (var i in data) {
                if (data[i]['login'] === 'anonymoususer') {
                    data.splice(i, 1);
                    hiddenUsersSize++;
                }
            }

            vm.usersLinks = ParseLinks.parse(headers('link'));
            vm.usersTotalItems = headers('X-Total-Count') - hiddenUsersSize;
            vm.usersQueryCount = vm.usersTotalItems;
            vm.usersPage = vm.pagingParams.usersPage;
            vm.users = data;
            onLoadItems();
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

        function onLoadItems() {
            if (vm.selected === 'user') {
                if (vm.tabIndex === 0) {
                    getUserPermissions();
                } else {
                    getUserDatasourcePermissions();
                }
            } else if (vm.selected === 'userGroup') {
                if (vm.tabIndex === 0) {
                    getUserGroupPermissions();
                } else {
                    getUserGroupDatasourcePermissions();
                }
            }
        }

    }
})();
