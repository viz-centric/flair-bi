(function () {
    'use strict';
    angular
        .module('flairbiApp')
        .controller('FooterController', FooterController);

    FooterController.$inject = ['$scope', '$rootScope', '$state'];

    function FooterController($scope, $rootScope, $state) {
        var vm = this;
    }
})();
