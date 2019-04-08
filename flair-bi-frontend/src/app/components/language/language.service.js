import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('JhiLanguageService', JhiLanguageService);

JhiLanguageService.$inject = ['$q', '$translate', 'LANGUAGES'];

function JhiLanguageService($q, $translate, LANGUAGES) {
    var service = {
        getAll: getAll,
        getCurrent: getCurrent
    };

    return service;

    function getAll() {
        var deferred = $q.defer();
        deferred.resolve(LANGUAGES);
        return deferred.promise;
    }

    function getCurrent() {
        var deferred = $q.defer();
        var language = $translate.storage().get('NG_TRANSLATE_LANG_KEY');

        deferred.resolve(language);

        return deferred.promise;
    }
}