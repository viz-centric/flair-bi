(function () {
    'use strict';


    angular
        .module('flairbiApp')
        .component('welcomeTileComponent', {
            templateUrl: 'app/home/details/welcome-tile.component.html',
            controller: WelcomeTileController,
            controllerAs: 'vm',
            bindings: {
                isAdmin: '<'
            }
        });

    WelcomeTileController.$inject = ['$rootScope', 'adminListService'];
    function WelcomeTileController($rootScope, adminListService) {
        var vm = this;

        vm.expandTile = expandTile;
        vm.expandFlairInsight = { id: 4 };
        vm.onRecentlyBox1 = onRecentlyBox1;
        vm.onRecentlyBox2 = onRecentlyBox2;
        vm.menuItems = [];


        ////////////////-
        vm.$onInit = function () {
            vm.menuItems = adminListService.getHomeList();
            onRecentlyBox();
            angular.element($("#on-recently-box1")).triggerHandler("click");
        };
        vm.$onChanges = function (_changesObj) { };
        vm.$onDestroy = function () { };

        function expandTile(info) {
            $rootScope.$broadcast('flairbiApp:onClickTile', info.id);
        }

        function onRecentlyBox() {
            var $innerWrapper = $('.recently-block');
            $(".recently-box").click(function () {
                var $inn = $(this).next(".recently-block").stop(true).slideToggle(600);
                $innerWrapper.not($inn).filter(':visible').stop(true).slideUp(600);
            });
        }

        function onRecentlyBox1() {
            if ($(".expand1").hasClass("rotate")) {
                $(".expand1").removeClass("rotate");
                $(".recently-box:first-of-type > .blue-line").css("width", "0%");
            } else {
                $(".expand1").addClass("rotate");
                $(".expand2").removeClass("rotate");
                $(".recently-box:first-of-type > .blue-line").css("width", "100%");
                $(".recently-box2 > .blue-line").css("width", "0%");
            };
        }

        function onRecentlyBox2() {
            if ($(".expand2").hasClass("rotate")) {
                $(".expand2").removeClass("rotate");
                $(".recently-box2 > .blue-line").css("width", "0%");
            } else {
                $(".expand2").addClass("rotate");
                $(".expand1").removeClass("rotate");
                $(".recently-box2 > .blue-line").css("width", "100%");
                $(".recently-box:first-of-type > .blue-line").css("width", "0%");
            };
        }
    }
})();