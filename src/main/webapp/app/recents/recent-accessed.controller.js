(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('recentlyAccessedController', recentlyAccessedController);

    recentlyAccessedController.$inject = ['$scope','$stateParams','ViewWatches','Views','Principal','recentBookmarkService'];

    function recentlyAccessedController($scope,$stateParams,ViewWatches,Views,Principal,recentBookmarkService) {
        var vm = this;
        vm.recentlyAccessed = {
            'bookmark': {
                getData: function () {
                    getRecentBookmark();
                }
            },
            'view': {
                getData: function () {
                    getRecentViews();
                }
            },
            'dashboard': {
                getData: function () {
                }
            },
            'overall-most-popular-views': {
                getData: function(){
                    getOverAllMostPopularViews();
                }
            },
            'overall-most-popular-bookmarks': {
                getData: function(){
                    getOverAllMostPopularBookmarks();
                }
            },
        };
        vm.toggleTabs=toggleTabs;
        
        activate();

        ////////////////

        function activate() {
            getAccount();
            toggleTabs($stateParams.id);
         }

        function getRecentViews(){
            vm.viewWatches = ViewWatches.query({
                page: 0,
                size: 5,
                sort: 'watchTime,desc'
            });
        }

        function getOverAllMostPopularViews(){
            vm.mostPopularViews =Views.mostPopular({});
        }

        function getAccount() {
            Principal.identity(true).then(function (account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }

        function toggleTabs(id){
            vm.recentlyAccessed[id].getData();
            vm.tabId=id;
            if($("#tab-"+id).hasClass("tab-active")){
                $("#tab-"+id).removeClass("tab-active");
            }else{
                $(".tab").removeClass("tab-active");
                $("#tab-"+id).addClass("tab-active");
            }
        }

        function getRecentBookmark(){
            recentBookmarkService.getRecentBookmark("?page=0&size=5&sort=watchTime,desc").then(function (result) {
                vm.bookmarkWatches = result.data;
            });
        }

        function getOverAllMostPopularBookmarks(){
            recentBookmarkService.getRecentBookmark("?page=0&size=5&sort=watchCount,desc").then(function (result) {
                vm.mostPopularBookmarks = result.data;
            });
        }
    }
})();
