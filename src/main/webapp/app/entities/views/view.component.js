(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('viewComponent', {
            templateUrl: 'app/entities/views/view.component.html',
            controller: viewController,
            controllerAs: 'vm',
            bindings: {
                view: '=',
                canEdit: '=',
                bookmark:'='
            }
        });

    viewController.$inject = ['$scope', 'AccountDispatch', '$stateParams','VisualDispatchService','$window'];

    function viewController($scope, AccountDispatch, $stateParams,VisualDispatchService,$window) {
        var vm = this;
        vm.$onInit = activate;
        vm.build=build;
        vm.getViewName=getViewName;
        ////////////////
      
      
        function activate() {

            vm.canUpdate = AccountDispatch.hasAuthority(
                "UPDATE_" + vm.view.id + "_VIEW"
            );
            vm.canRead = AccountDispatch.hasAuthority(
                "READ_" + vm.view.id + "_VIEW"
            );
            vm.canView =vm.canRead && vm.canUpdate;
            vm.requestPublish = AccountDispatch.hasAuthority(
                "REQUEST-PUBLISH_" + vm.view.id + "_VIEW"
            );
            vm.deletePublish = AccountDispatch.hasAuthority(
                "DELETE-PUBLISHED_" + vm.view.id + "_VIEW"
            );
            vm.canDelete= AccountDispatch.hasAuthority(
                "DELETE_" + vm.view.id + "_VIEW"
            );
            vm.canReadPublish= AccountDispatch.hasAuthority(
                "READ-PUBLISHED_" + vm.view.id + "_VIEW"
            );
            
        }

        function build(viewId,dashboardId,featureBookmark){
            if(featureBookmark){
                VisualDispatchService.addFeatureBookmark(viewId,dashboardId,featureBookmark);
            }else{
                $window.location.href="#/dashboards/"+dashboardId+"/views/"+viewId+"/build";
            }

        }

        function getViewName(){
            return vm.view.viewName + getBookmarkName();
        }

        function getBookmarkName(){ 
            if(vm.bookmark){
                return " "+vm.bookmark.name;
            }else{
                return "";
            }
        }
    }
})();
