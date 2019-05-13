(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal', 'LoginService',
        '$state', 'Information', 'ViewWatches', 'Views', 'Dashboards','$rootScope','alertsService','screenDetectService','adminListService','AccountDispatch','schedulerService'
    ];

    function HomeController($scope, Principal, LoginService,
        $state, Information, ViewWatches, Views, Dashboards,$rootScope,alertsService,screenDetectService,adminListService,AccountDispatch,schedulerService) {
        var vm = this;

        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        vm.register = register;
        vm.recentlyCreatedViews = [];
        vm.onRecentlyBox1=onRecentlyBox1;
        vm.onRecentlyBox2=onRecentlyBox2;
        vm.expandTile=expandTile;
        vm.openNotifications=openNotifications;
        vm.openReleases=openReleases;
        vm.isTileVisible=isTileVisible;
        vm.reports=[];
        vm.allReleaseAlerts=[];

        activate();

        function openNotifications(){
            if($("#notifications-tab").hasClass("tab-active")){
                $("#notifications-tab").removeClass("tab-active");
            }else{
                $("#notifications-tab").addClass("tab-active");
                $("#releases-tab").removeClass("tab-active");
                getScheduledReports();
            }
        }

        function openReleases(){
            if($("#releases-tab").hasClass("tab-active")){
                $("#releases-tab").removeClass("tab-active");
            }else{
                $("#releases-tab").addClass("tab-active");
                $("#notifications-tab").removeClass("tab-active");
                getReleaseAlerts();
            }
        }

        function expandTile(info){
            $rootScope.$broadcast('flairbiApp:onClickTile',info.id);
        }

        function onRecentlyBox1(){
            if($(".expand1").hasClass("rotate")){
                $(".expand1").removeClass("rotate");
                $(".recently-box:first-of-type > .blue-line").css("width", "0%");
            } else {
                $(".expand1").addClass("rotate");
                $(".expand2").removeClass("rotate");
                $(".recently-box:first-of-type > .blue-line").css("width", "100%");
                $(".recently-box2 > .blue-line").css("width", "0%");   
            };
        }

        function onRecentlyBox2(){
            if($(".expand2").hasClass("rotate")){
                $(".expand2").removeClass("rotate");
                $(".recently-box2 > .blue-line").css("width", "0%");
            } else {
                $(".expand2").addClass("rotate");
                $(".expand1").removeClass("rotate");
                $(".recently-box2 > .blue-line").css("width", "100%");
                $(".recently-box:first-of-type > .blue-line").css("width", "0%");
            };
        }

        function onRecentlyBox(){
			 var $innerWrapper = $('.recently-block');
				$(".recently-box").click(function () {
					var $inn = $(this).next(".recently-block").stop(true).slideToggle(600);
					$innerWrapper.not($inn).filter(':visible').stop(true).slideUp(600);
				});
        }


        function getAccount() {
            vm.account = AccountDispatch.getAccount();
            vm.isAuthenticated = Principal.isAuthenticated;
            vm.isAdmin =  AccountDispatch.isAdmin();
        }

        function isAdmin(userGroups){
            if(userGroups.indexOf("ROLE_ADMIN")>-1)
                return true;
            else
                return false;
        }

        function activate() {
            loadInformation();
            $scope.$on('authenticationSuccess', function () {
                getAccount();
            });

            getAccount();
            onRecentlyBox();
            angular.element($("#on-recently-box1")).triggerHandler("click");
            vm.menuItems=adminListService.getHomeList();
        }

        function getReleaseAlerts() {
        alertsService.getAllReleaseAlerts().then(function(result){
                vm.allReleaseAlerts=result.data;
                vm.reports=[];
            });
        }

        function getScheduledReports(){
            schedulerService.getScheduleReports(1).then(function(result){
                vm.reports=result.data;
                vm.allReleaseAlerts=[];
            });
        }

        function register() {
            $state.go('register');
        }

        function loadInformation(){
            vm.information=Information.query();
        }

        function isTileVisible(flag){
            if(screenDetectService.isDesktop()){
                return flag==true?'block':'none';
            }else{
                return flag==false?'block':'none';
            }
        }
    }
})();
