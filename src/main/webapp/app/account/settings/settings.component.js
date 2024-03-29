(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('settingsComponent', {
            templateUrl: 'app/account/settings/settings.component.html',
            controller: SettingsController,
            controllerAs: 'vm'
        })
        .component('settingsContentHeaderComponent', {
            templateUrl: 'app/account/settings/settings-content-header.html',
            controller: SettingsController,
            controllerAs: 'vm'
        });

    SettingsController.$inject = ['Principal', 'Auth', 'JhiLanguageService', '$translate', 'tmhDynamicLocale'];

    function SettingsController(Principal, Auth, JhiLanguageService, $translate, tmhDynamicLocale) {
        var vm = this;

        vm.error = null;
        vm.save = save;
        vm.settingsAccount = null;
        vm.success = null;

        vm.changeLanguage = changeLanguage;
        vm.languages = [];

        /**
         * Store the "settings account" in a separate variable, and not in the shared "account" variable.
         */
        function copyAccount(account) {
            return {
                activated: account.activated,
                email: account.email,
                firstName: account.firstName,
                langKey: account.langKey,
                lastName: account.lastName,
                login: account.login
            };
        };

        vm.$onInit = function () {
            Principal.identity().then(function (account) {
                vm.settingsAccount = copyAccount(account);
            });

            JhiLanguageService.getAll().then(function (languages) {
                vm.languages = languages;
            });
        }

        function changeLanguage(languageKey) {
            $translate.use(languageKey);
            tmhDynamicLocale.set(languageKey);
        }

        function save() {
            Auth.updateAccount(vm.settingsAccount).then(function () {
                vm.error = null;
                vm.success = 'OK';
                Principal.identity(true).then(function (account) {
                    vm.settingsAccount = copyAccount(account);
                });
                JhiLanguageService.getCurrent().then(function (current) {
                    if (vm.settingsAccount.langKey !== current) {
                        $translate.use(vm.settingsAccount.langKey);
                    }
                });
            }).catch(function () {
                vm.success = null;
                vm.error = 'ERROR';
            });
        }
    }
})();
