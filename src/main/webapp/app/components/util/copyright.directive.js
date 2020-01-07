(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('copyright', copyright());


    function copyright() {
    	var year=new Date().getFullYear();
        return {
            template: '<strong>Copyright</strong> Vizcentric Flair BI &copy; '+year,
        };
    }

})();
