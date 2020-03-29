(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('footerComponent', {
            templateUrl: 'app/layouts/footer/footer.component.html',
            controller: FooterController,
            controllerAs: 'vm'
        });

    FooterController.$inject = [];

    function FooterController() {
        var vm = this;
    }
})();

