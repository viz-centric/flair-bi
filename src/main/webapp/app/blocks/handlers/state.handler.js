(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('stateHandler', stateHandler);

    stateHandler.$inject = ['$translate', 'JhiLanguageService', 'translationHandler', '$window', '$transitions'
    ];

    function stateHandler($translate, JhiLanguageService, translationHandler, $window, $transitions) {
        return {
            initialize: initialize
        };

        function initialize() {
            $transitions.onEnter({
                to: '**'
            }, function (transition) {
                var toState = transition.$to();
                // Redirect to a state with an external URL (http://stackoverflow.com/a/30221248/1098564)
                if (toState.external) {
                    $window.open(toState.url, '_self');
                }

                // Update the language
                JhiLanguageService.getCurrent().then(function (language) {
                    $translate.use(language);
                });
            });

            $transitions.onSuccess({
                to: '**'
            }, function (transition) {
                var titleKey = 'global.title',
                    toState = transition.$to();

                // Set the page title key to the one configured in state or use default one
                if (toState.data && toState.data.pageTitle) {
                    titleKey = toState.data.pageTitle;
                }
                translationHandler.updateTitle(titleKey);
            });
        }
    }
})();
