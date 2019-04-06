import * as angular from 'angular';
'use strict';
angular
    .module('flairbiApp')
    .directive('minimalizaSidebar', minimalizaSidebar);
/**
 * minimalizaSidebar - Directive for minimalize sidebar
 */
minimalizaSidebar.$inject = ['$timeout'];

function minimalizaSidebar($timeout) {
    return {
        restrict: 'A',
        template: '<a href="" ng-click="minimalize()"><svg class="hamburger"><use xlink:href="#bars" /></svg></a>',
        controller: minimalizaSidebarController,
    };
};
minimalizaSidebarController.$inject = ['$scope', '$element', '$state', '$rootScope'];

function minimalizaSidebarController($scope, $element, $state, $rootScope) {
    $scope.minimalize = function () {
        $("body").toggleClass("mini-navbar");
        if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
            // Hide menu in order to smoothly turn on when maximize menu
            $('#side-menu').hide();
            // For smoothly turn on menu
            setTimeout(
                function () {
                    $('#side-menu').fadeIn(400);
                }, 200);
        } else if ($('body').hasClass('fixed-sidebar')) {
            $('#side-menu').hide();
            setTimeout(
                function () {
                    $('#side-menu').fadeIn(400);
                }, 100);
        } else {
            // Remove all inline style from jquery fadeIn function to reset menu state
            $('#side-menu').removeAttr('style');
        }
    }


    var slider = $('#slider').slideReveal({
        position: "right",
        push: false,
        overlay: true,
        overlayColor: 'rgba(0,0,0,0)',
        width: '200px',
        autoEscape: true
    });
    var setValue = false;
    $scope.onReveal = function () {
        slider.slideReveal("toggle")
    }

}