(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('tileDetailsComponent', {
            templateUrl: 'app/home/tile-details.component.html',
            controller: tileDetailsController,
            controllerAs: 'vm',
            bindings: {
                account: "=",
                isAdmin: "="  
            }
        });

    tileDetailsController.$inject = ['$scope', '$state','Dashboards','Datasources','Views','recentBookmarkService','ViewWatches','screenDetectService','$window','$rootScope','VisualDispatchService','schedulerService','ReportManagementUtilsService'];

    function tileDetailsController($scope, $state,Dashboards,Datasources,Views,recentBookmarkService,ViewWatches,screenDetectService,$window,$rootScope,VisualDispatchService,schedulerService,ReportManagementUtilsService) {
        var vm = this;
        vm.build=build;

        active();

        function active(){
            registerOnClickTile();
            //$(".tile-area-table").stop(true).slideUp(600);
        }

        vm.filteredItems = [];
        vm.groupedItems = [];
        vm.itemsPerPage = 10;
        vm.pagedItems = [];
        vm.currentPage = 0;
        vm.groupToPages = groupToPages;
        vm.setPage = setPage;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.range = range;
        vm.filterFn=filterFn;
        vm.toggleTables={'tile-1':false,'tile-2':false,'tile-3':false,'tile-4':false,'tile-5':false}
        vm.isDesktop=isDesktop;
        vm.filterBookmarks=filterBookmarks;
        vm.updateReport=updateReport;
        vm.executeNow=executeNow;
        vm.goToBuildPage=goToBuildPage;


        //function to search element 
        function filterFn(array,searchText,key){
            var filtered=[];
            angular.forEach(array, function(item) {
                if(item[key].toLowerCase().indexOf(toStringLowerCase(searchText)) >= 0 ) 
                    filtered.push(item);
            });
            if(filtered.length>0)
            groupToPages(filtered);
        }

        //function to search element in bookmarks
        function filterBookmarks(array,searchText,key){
            var filtered=[];
            angular.forEach(array, function(item) {
                if(item.featureBookmark[key].toLowerCase().indexOf(toStringLowerCase(searchText)) >= 0 ) 
                    filtered.push(item);
            });
            if(filtered.length>0)
            groupToPages(filtered);
        }

        function toStringLowerCase(searchText){
            return searchText!==""?searchText.toLowerCase():searchText;
        }

        // calculate page in place
        function groupToPages(result) {
            vm.pagedItems = [];
            for (var i = 0; i < result.length; i++) {
                if (i % vm.itemsPerPage === 0) {
                    vm.pagedItems[Math.floor(i / vm.itemsPerPage)] = [result[i]];
                } else {
                    vm.pagedItems[Math.floor(i / vm.itemsPerPage)].push(result[i]);
                }
            }
        };


        function range(start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        function prevPage() {
            if (vm.currentPage > 0) {
                vm.currentPage--;
            }
        };

        function nextPage() {
            if (vm.currentPage < vm.pagedItems.length - 1) {
                vm.currentPage++;
            }
        };

        function setPage(n) {
            vm.currentPage = n;
        };


        function registerOnClickTileReceived(tileId) {
            $scope.searchDashboard = '';
            $scope.searchView = '';
            $scope.searchDataSource = '';
            $scope.searchBoomark='';
            if (tileId == "1") {
                activeTile(tileId);
                fetchDashboards();
                toggle4Boxes(tileId);
            } else if (tileId == "3") {
                activeTile(tileId);
                fetchDataSources();
                toggle4Boxes(tileId);

            } else if (tileId == "2") {
                activeTile(tileId);
                fetchViews();
                toggle4Boxes(tileId);
            }
            else if (tileId == "4") {
                activeTile(tileId);
                getScheduledReports(vm.account.login,"","","");
                toggle4Boxes(tileId);
                //$("#box-area").show();
            }
            else if (tileId == "5") {
                activeTile(tileId);
                getRecentAccessedBookmark();
                toggle4Boxes(tileId);
            }
            else if (tileId == "6") {
                activeTile(tileId);
            }
            else if (tileId == "7") {
                activeTile(tileId);
                getRecentAccessedViews();
            }
            else if (tileId == "8") {
                activeTile(tileId);
                getRecentAccessedBookmark();
            }
        }

        function toggle4Boxes(tileId){
            vm.show4Boxes=false;
            angular.forEach(vm.toggleTables, function(value, key) {
                if(key=='tile-'+tileId){
                    vm.toggleTables['tile-'+tileId]=!vm.toggleTables['tile-'+tileId];
                    value=!value;
                }else{
                    vm.toggleTables[key]=false;
                }
                vm.show4Boxes=vm.show4Boxes || value;
            });
            isTableVisible();
        }

        function isTableVisible(){
            if(vm.show4Boxes){
                $("#box-area").hide();
            }else{
                $("#box-area").show();
            }
        }

        function activeTile(tileId){
            removeActiveClass();
            $('#information-card-'+tileId).addClass("information-card-active");
        }

        function removeActiveClass(){
            $('.information-card').removeClass("information-card-active");
        }

        function fetchDashboards(){
            Dashboards.query(function(result) {
                vm.dashboards = result;
                vm.datasources=[];
                vm.views=[];
                vm.bookmarkWatches =[];
                vm.groupToPages(result);
            });
        }

        function fetchDataSources(){
            Datasources.query(function(result) {
                vm.datasources = result;
                vm.dashboards = [];
                vm.views=[];
                vm.bookmarkWatches =[];
                vm.groupToPages(result);
            });
        }

        function fetchViews(){
            Views.query(function(result) {
                vm.views = result;
                vm.dashboards = [];
                vm.datasources=[];
                vm.bookmarkWatches =[];
                vm.groupToPages(result);
            });
        }

        function getRecentAccessedBookmark(){
            recentBookmarkService.getRecentBookmark("?page=0&size=5&sort=watchTime,desc").then(function (result) {
                vm.bookmarkWatches = result.data;
                vm.dashboards = [];
                vm.datasources=[];
                vm.views=[];
                vm.viewWatches=[];
                vm.groupToPages(result.data);
            });
        }

        function getRecentAccessedViews(){
            vm.viewWatches = ViewWatches.query({
                page: 0,
                size: 5,
                sort: 'watchTime,desc'
            });
            vm.bookmarkWatches=[];
        }

        function serchReports(){
            vm.reportName = vm.reportName ? vm.reportName : "" ;            
            getScheduledReports(vm.account.login,vm.reportName);
        }

        function getScheduledReports(userName,reportName){
            schedulerService.filterScheduledReports(userName,reportName,"","",5,0).then(
            function(response) {
            vm.reports=response.data.records;
            vm.dashboards = [];
            vm.datasources=[];
            vm.views=[];
            vm.viewWatches=[];
            vm.bookmarkWatches=[];
            vm.groupToPages(response.data.records);
            },
            function(error) {
            var info = {
                text: error.statusText,
                title: "Error"
            }
            $rootScope.showErrorSingleToast(info);
            });
        }

        function registerOnClickTile() {
            var unsubscribe = $scope.$on(
                "flairbiApp:onClickTile",
                function(event,tileId) {
                    registerOnClickTileReceived(tileId);
                }
            );
            $scope.$on("$destroy", unsubscribe);
        }

      function isDesktop(){
        return screenDetectService.isDesktop();
      }


     function build(viewId,dashboardId,featureBookmark){
        VisualDispatchService.addFeatureBookmark(viewId,dashboardId,featureBookmark);
     }

     function updateReport(id){
        ReportManagementUtilsService.updateReport(id);
     }

     function goToBuildPage(build_url){
        ReportManagementUtilsService.goToBuildPage(build_url);
     }

     function executeNow(id){
        ReportManagementUtilsService.executeNow(id);
     }

    }
})();
