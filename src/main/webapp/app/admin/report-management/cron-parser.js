(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .filter('CronParser', CronParser);


    function CronParser() {
        var cronstrue = window.cronstrue;

        return function (input) {
            return cronstrue.toString(input);
        }

    }
})();