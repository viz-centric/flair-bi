// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .controller('JhiLanguageController', JhiLanguageController);

JhiLanguageController.$inject = ['$translate', 'JhiLanguageService', 'tmhDynamicLocale'];

export const name = "JhiLanguageController";
export function JhiLanguageController($translate, JhiLanguageService, tmhDynamicLocale) {
    var vm = this;

    vm.changeLanguage = changeLanguage;
    vm.languages = null;

    JhiLanguageService.getAll().then(function (languages) {
        vm.languages = languages;
    });

    function changeLanguage(languageKey) {
        $translate.use(languageKey);
        tmhDynamicLocale.set(languageKey);
    }
}
