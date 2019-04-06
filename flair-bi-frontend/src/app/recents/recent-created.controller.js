import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('recentlyCreatedController', recentlyCreatedController);

recentlyCreatedController.$inject = ['$scope', '$stateParams', 'ViewWatches', 'Views', 'Principal', 'recentBookmarkService'];

function recentlyCreatedController($scope, $stateParams, ViewWatches, Views, Principal, recentBookmarkService) {
    var vm = this;
    vm.recentlyCreated = {
        'bookmark': {
            getData: function () {
                getRecentCreatedBookmark();
            }
        },
        'view': {
            getData: function () {
                getRecentCreatedViews();
            }
        },
        'dashboard': {
            getData: function () {
            }
        },
        'database': {
            getData: function () {
            }
        }
    };
    vm.toggleTabs = toggleTabs;

    activate();

    ////////////////

    function activate() {
        getAccount();
        toggleTabs($stateParams.id);
    }

    function getRecentCreatedViews() {
        vm.recentlyCreatedViews = Views.recentlyCreated({});
    }


    function getAccount() {
        Principal.identity(true).then(function (account) {
            vm.account = account;
            vm.isAuthenticated = Principal.isAuthenticated;
        });
    }

    function toggleTabs(id) {
        vm.recentlyCreated[id].getData();
        vm.tabId = id;
        if ($("#tab-" + id).hasClass("tab-active")) {
            $("#tab-" + id).removeClass("tab-active");
        } else {
            $(".tab").removeClass("tab-active");
            $("#tab-" + id).addClass("tab-active");
        }
    }

    function getRecentCreatedBookmark() {
        recentBookmarkService.getRecentBookmark({
            page: 0,
            size: 5,
            sort: 'watchCreatedTime,desc'
        }).then(function (result) {
            vm.bookmarkWatches = result.data;
        });
    }
}