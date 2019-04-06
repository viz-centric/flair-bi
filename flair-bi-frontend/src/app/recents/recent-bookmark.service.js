import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('recentBookmarkService', recentBookmarkService);

recentBookmarkService.$inject = ['$http'];

function recentBookmarkService($http) {
    var service = {
        saveRecentBookmark: saveRecentBookmark,
        getRecentBookmark: getRecentBookmark
    };

    return service;

    ////////////////
    function saveRecentBookmark(bookmarkId, viewId) {
        return $http({
            url: 'api/save-recent-bookmark/' + bookmarkId + '/' + viewId,
            method: 'GET'
        });
    }
    //bookmark-watches
    function getRecentBookmark(predicate) {
        return $http({
            url: 'api/bookmark-watches',
            method: 'GET',
            data: predicate
        });
    }
}