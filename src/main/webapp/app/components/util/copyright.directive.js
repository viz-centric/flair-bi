(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('copyright', copyright());


    function copyright() {
        return {
            template: '<strong>Copyright</strong> Vizcentric Flair BI &copy; 2019',
        };
    }

})();
