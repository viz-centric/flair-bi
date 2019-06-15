(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FlairBiRightNavBarController', FlairBiRightNavBarController);

    FlairBiRightNavBarController.$inject = ['Visualizations', '$rootScope',
        'entity', 'Features', '$uibModal',
        '$state', '$scope', 'featureEntities',
        'Hierarchies','$timeout',"filterParametersService","FilterStateManagerService",
        "Visualmetadata","VisualDispatchService","VisualMetadataContainer","$translate"
    ];

    function FlairBiRightNavBarController(Visualizations, $rootScope,
        entity, Features, $uibModal,
        $state, $scope, featureEntities,
        Hierarchies,$timeout,filterParametersService,FilterStateManagerService,Visualmetadata,VisualDispatchService,VisualMetadataContainer,$translate) {
        var vm = this;
        vm.visualizations = [];
        vm.addVisual = addVisual;
        vm.features = [];
        vm.view = entity;
        vm.openDialog = openDialog;
        vm.hierarchyDialog = hierarchyDialog;
        vm.changeFeature = changeFeature;
        vm.changeHierarchy = changeHierarchy;
        vm.onVizualizationsOpen = onVizualizationsOpen;
        vm.onVizualizationsClose = onVizualizationsClose;
        vm.deleteFeature = deleteFeature;
        vm.deleteHierarchy = deleteHierarchy;
        vm.ngIfResources = ngIfResources;    
        vm.activeTab = "dimensions";
        vm.navbarToggled = false;
        vm.onFiltersOpen=onFiltersOpen;
        vm.clearFilters = clearFilters;
        vm.ngIfClearFilters = ngIfClearFilters;
        vm.ngIfFilters = ngIfFilters; 
        vm.filterToggled = false;
        var showOpt = true;
        vm.sideBarTab = "";
        vm.selected=null;
        vm.propertiesToggled=false;
        vm.onPropertiesOpen=onPropertiesOpen;
        vm.propTab = "viz-properties";
        vm.propertiesToggled = false;
        vm.validate = validate;
        vm.save = save;
        vm.clear = clear;
        var editMode=false;
        vm.dataToggled=false;
        vm.onDataOpen=onDataOpen;
        vm.onDataclose=onDataclose;
        vm.dropCallback=dropCallback;
        vm.getSelectedItem=getSelectedItem;


        activate();


         
        ////////////////

        function activate() {
            vm.visualizations = Visualizations.query();
            vm.features = featureEntities;
            loadHierarchies();
            registerEditModeToggle();
            registerToggleRightNavBarOff();
            registerToggleRightNavBarOn();
            registerFilterRefresh();
            registerToggleFilterOff();
            registerToggleFilterOn();
            registerTogglePropertiesOn();
            registerTogglePropertiesOff();
            loadDimensions();
            registerRightNavBarDataOpen();
            registerOnDataPropertiesUpdate();
            registerOnChartPropertiesUpdate();
        }

        ////////////////

        function getSelectedItem(item){
            onDragEnd(item);
        }

        function onDragEnd(item) {
            $rootScope.$broadcast("flairbiApp:onDragEnd",item);
        }
        function dropCallback(index, item, external, type){
            return false;
        }

        vm.slider = {
            value: 1,
            options: {
                floor: 0,
                ceil: 1,
                step: 0.1,
                precision: 1,
                onChange: function(id) {
                    vm.visual.bodyProperties.opacity=vm.slider.value;
                },
                translate: function(value) {
                return 100 * value+'%';
                }
            }
        };

        function setProperties(visual,view) {
            vm.visual = visual;
            vm.visual.titleProperties.titleText =
                vm.visual.titleProperties.titleText.trim() == ""
                    ? vm.visual.metadataVisual.name
                    : vm.visual.titleProperties.titleText;
            vm.visual.visualBuildId = vm.visual.visualBuildId || vm.visual.id;
            vm.features = Features.query({
                datasource: view.viewDashboard.dashboardDatasource.id
            });
            vm.view=view;
            vm.slider.value=parseFloat(vm.visual.bodyProperties.opacity);
        }

        function clear() {
            //$uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.visual.id) {
                Visualmetadata.update(
                    {
                        viewId: vm.view.id,
                        visualMetadata: vm.visual
                    },
                    function(result){
                        vm.isSaving = false;
                        VisualMetadataContainer.update(vm.visual.id,result,'id');
                        vm.visual = result;
                        var info = {text:$translate.instant('flairbiApp.visualmetadata.updated',{param:result.id}),title: "Updated"}
                        $rootScope.showSuccessToast(info);
                    },
                    onSaveError
                );
            } else {
                Visualmetadata.save(
                    {
                        viewId: vm.view.id,
                        visualMetadata: vm.visual
                    },
                    function(result){
                        vm.isSaving = false;
                        VisualMetadataContainer.update(vm.visual.visualBuildId,result,'visualBuildId');
                        vm.visual = result;
                        var info = {text:$translate.instant('flairbiApp.visualmetadata.created',{param:result.id}),title: "Created"}
                        $rootScope.showSuccessToast(info);
                    },
                    onSaveError
                );
            }
        }

        function onSaveError(error) {
            vm.isSaving = false;
        }

        function validate() {}

        function isRightSideBarOpen(){
            return $('#slider').is(":visible");
        }

        function openProperties(){
            showSideBar();
            vm.propertiesToggled = true;
            vm.sideBarTab = "properties";
            $('#slider').css('display','block');
            $timeout(function() {
                 $scope.$broadcast('reCalcViewDimensions');
            }); 
        }

        function registerFilterRefresh() {
            var unsubscribe = $scope.$on("flairbiApp:filter", function() {
                refresh();
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function registerToggleFilterOn() {
            var unsubscribe = $scope.$on(
                "flairbiApp:toggleFilters-on",
                function() {
                    openFilters();
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }

        function registerToggleFilterOff() {
            var unsubscribe = $scope.$on(
                "flairbiApp:toggleFilters-off",
                function() {
                    $timeout(function() {
                        vm.filterToggled = false;
                        hideSidebar();
                    });
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }


        function registerTogglePropertiesOff() {
            var unsubscribe = $scope.$on(
                "flairbiApp:toggleProperties-off",
                function() {
                    $timeout(function() {
                        vm.propertiesToggled = false;
                        hideSidebar();
                    });
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }

        function registerTogglePropertiesOn() {
            var unsubscribe = $scope.$on(
                "flairbiApp:toggleProperties-on",
                function() {
                        var data=VisualDispatchService.getVisual();
                        if(data!=undefined){
                            setProperties(data.visual,data.view);
                        }
                    $timeout(function() {
                        openProperties();
                    });
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }

        function registerOnDataPropertiesUpdate() {
            var unsubscribe = $scope.$on("flairbiApp:on-data-properties-update", function(
                event,
                updatedField
            ) {
            var index = -1;
            vm.visual.fields.filter(function(field) {
                if(field.feature.name === updatedField.fieldName){
                    field.properties.some(function(item, i) {
                        return item.order === updatedField.property.order ? index = i : false;
                    });
                    field.properties[index].value=updatedField.value;
                }
            });
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function registerOnChartPropertiesUpdate() {
            var unsubscribe = $scope.$on("flairbiApp:on-chart-properties-update", function(
                event,
                updatedChart
            ) {
            var index = -1;
            vm.visual.properties.some(function(item, i) {
                return item.order === updatedChart.property.order ? index = i : false;
            });
            vm.visual.properties[index].value=updatedChart.value;
            });
            $scope.$on("$destroy", unsubscribe);
        }
        function ngIfFilters() {
            return showOpt && !$rootScope.exploration;
        }

        function ngIfClearFilters() {
            return showOpt && !$rootScope.exploration;
        }

        function openFilters() {
            showSideBar();
            vm.sideBarTab="filters";
            vm.filterToggled = true;
            $('#slider').css('display','block');
            //setContainerHeight();
             
        }

        function clearFilters() {
            $rootScope.$broadcast("flairbiApp:clearFilters");
        }

        function refresh() {
            vm.nextDisabled = !FilterStateManagerService.hasNext();
            vm.previousDisabled = !FilterStateManagerService.hasPrevious();
        }

        function next() {
            var next = FilterStateManagerService.next();
            filterParametersService.save(next);
            $rootScope.$broadcast("flairbiApp:filter-input-refresh");
            $rootScope.$broadcast("flairbiApp:filter");
        }

        function previous() {
            var previous = FilterStateManagerService.previous();
            filterParametersService.save(previous);
            $rootScope.$broadcast("flairbiApp:filter-input-refresh");
            $rootScope.$broadcast("flairbiApp:filter");
        }

        function loadDimensions() {
            vm.dimensions = featureEntities.filter(function(item) {
                return item.featureType === "DIMENSION";
            });
        }

        function registerToggleRightNavBarOff() {
            var unsubscribe = $scope.$on(
                "flairbiApp:toggleRightNavBar-off",
                function() {
                    $timeout(function() {
                        vm.navbarToggled = false;
                        hideSidebar();
                    });
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }

        function registerToggleRightNavBarOn() {
            var unsubscribe = $scope.$on(
                "flairbiApp:toggleRightNavBar-on",
                function() {
                    openVisualizations();
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }

        function showSideBar(){
            if(!isRightSideBarOpen()){
                var wg=$("#widget-container").width();
                var sb=$("#slider").width();
                $("#widget-container").width(wg-sb-1);
                VisualDispatchService.reloadGrids();
            }
        }

        function hideSidebar(){
            $('#widget-container').css('width', '100%').css('width', '-=16px');
        }

        function registerEditModeToggle() {
            var unsubscribe = $scope.$on("FlairBi:button-toggle", function(
                event,
                result
            ) {
                editMode = result;
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function ngIfResources() {
            return editMode && !$rootScope.exploration;
        }

        function openVisualizations() {
                showSideBar();
                vm.sideBarTab = "vizualizations";
                //setContainerHeight();
                vm.navbarToggled = true;
                $('#slider').css('display','block');                 
        }


        function onVizualizationsOpen() {
            resetWidgetEntry();
            $rootScope.$broadcast('flairbiApp:toggleRightNavBar-on');
        }

        function onVizualizationsClose() {
            resetWidgetEntry();
            $rootScope.$broadcast('flairbiApp:toggleRightNavBar-off');
        }

        function onDataOpen() {
            resetWidgetEntry();
            vm.sideBarTab="data";
            vm.dataToggled=true;
            showSideBar();
            //setContainerHeight();
            $('#slider').css('display','block');  

        }

        function resetWidgetEntry() {
            $rootScope.updateWidget = {};
        }

        function onDataclose() {
            resetWidgetEntry();
            vm.dataToggled=false;
        }

        function onFiltersOpen() {
            resetWidgetEntry();
            $rootScope.$broadcast("flairbiApp:toggleFilters-on");
        }

        function onFiltersClose() {
            resetWidgetEntry();
            $rootScope.$broadcast("flairbiApp:toggleFilters-off");
        }

        function onPropertiesOpen() {
            resetWidgetEntry();
            $rootScope.$broadcast('flairbiApp:toggleProperties-on');
        }

        function onPropertiesClose() {
            resetWidgetEntry();
            $rootScope.$broadcast('flairbiApp:toggleProperties-off');
        }

        function setContainerHeight(){
           setTimeout(function(){
                var containerHeight=document.getElementById('widget-container').offsetHeight;
                var sidebarHeight =document.getElementById('slider').offsetHeight;
                if(sidebarHeight>containerHeight){ 
                    $(".widget-container-resized").css('min-height',sidebarHeight+'px');
                }else{
                    $(".widget-container-resized").css('min-height',containerHeight+'px');    
                }
                }, 1000);
        }

        $(document).on("click", function (event) {
                if (isRightSideBarOpen()) {
                    //var p=$(event.target).parents();
                    var gridLen= $(event.target).parents().is('.grid-back,.grid-front,.grid-stack-item,.grid-stack,.viz-header,.viz-header-content,.grid-stack-item-content,.viz-settings')==true?1:0;
                    var trigger = $(".right-sidebar-container"); 
                    var cpicker=$(event.target).parents().hasClass('md-dialog-container')==true?1:0; 
                    var dlen=$(event.target).parents().hasClass('entity-type')==true?1:0;  
                    var dcLen=$(event.target).parents().hasClass('data-constraint-operation-button')==true?1:0;
                    var pLen=$(event.target).parents().hasClass('md-color-picker-clear')==true?1:0;
                    var len=$(event.target).parents('.tag-item').length+$(event.target).parents('.suggestion-item').length+
                            $(event.target).parents('.suggestion-list').length+pLen+dcLen+dlen+cpicker+gridLen;
                        if (trigger !== event.target && !trigger.has(event.target).length && len == 0) {
                            $('#slider').css('display', 'none');
                            onVizualizationsClose();
                            onFiltersClose();
                            onPropertiesClose();
                            onDataclose();
                            VisualDispatchService.reloadGrids();
                            VisualDispatchService.removeOpacity();
                        }
                }
                $( ".filter-drop-downs" ).hide();
        });

        function deleteHierarchy(hierarchy) {
            swal(
                    "Are you sure?",
                    "You want to delete selected hierarchy", {
                        dangerMode: true,
                        buttons: true,
                    })
                .then(function (value) {
                    if (value) {
                        if (hierarchy.id) {
                            Hierarchies.delete({
                                id: hierarchy.id
                            }, function (result) {
                                $rootScope.$broadcast('flairbiApp:refreshWidgets');
                                loadHierarchies();
                            }, function (error) {
                                swal("Something went wrong");
                            });

                        } else {
                            loadHierarchies();
                        }
                        $scope.$apply();
                    } else {
                        return false;
                    }

                });
        }

        function deleteFeature(feature) {
            swal(
                    "Are you sure?",
                    "You want to delete selected feature", {
                        dangerMode: true,
                        buttons: true,
                    })
                .then(function (value) {
                    if (value) {
                        if (feature.id) {
                            Features.delete({
                                id: feature.id
                            }, function (result) {
                                $rootScope.$broadcast('flairbiApp:refreshWidgets');
                                loadFeatures();
                            }, function (error) {
                                swal("Something went wrong");
                            });

                        } else {
                            loadFeatures();
                        }
                        $scope.$apply();
                    } else {
                        return false;
                    }

                });
        }

        function changeHierarchy(hierarchy) {
            $uibModal.open({
                templateUrl: 'app/entities/hierarchy/hierarchy-dialog.html',
                controller: 'HierarchyDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    entity: function () {
                        return hierarchy;
                    },
                    dimensions: function () {
                        return vm.features.filter(function (item) {
                            return item.featureType === 'DIMENSION';
                        });
                    }
                }
            }).result.then(function () {
                loadHierarchies();
            }, function () {
                loadHierarchies();
            });
        }


        function changeFeature(feature) {
            $uibModal.open({
                templateUrl: 'app/entities/feature/feature-dialog.html',
                controller: 'FeatureDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    entity: function () {
                        return feature;
                    }
                }
            }).result.then(function () {
                loadFeatures();
            }, function () {
                loadFeatures();
            });
        }

        function loadFeatures() {
            vm.features = Features.query({
                datasource: vm.view.viewDashboard.dashboardDatasource.id
            });
        }

        function loadHierarchies() {
            vm.hierarchies = Hierarchies.query({
                datasource: vm.view.viewDashboard.dashboardDatasource.id
            });
            VisualDispatchService.saveHierarchies(vm.hierarchies);
        }

        function addVisual(visual) {
            $rootScope.$broadcast('FlairBi:addVisual', visual);
        }

        function openDialog(type) {
            $uibModal.open({
                templateUrl: 'app/entities/feature/feature-dialog.html',
                controller: 'FeatureDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    entity: function () {
                        return {
                            featureType: type,
                            datasource: vm.view.viewDashboard.dashboardDatasource
                        };
                    }
                }
            }).result.then(function () {
                loadFeatures();
            }, function () {
                loadFeatures();
            });
        }

        function hierarchyDialog() {
            $uibModal.open({
                templateUrl: 'app/entities/hierarchy/hierarchy-dialog.html',
                controller: 'HierarchyDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    entity: function () {
                        return {
                            datasource: vm.view.viewDashboard.dashboardDatasource,
                            drilldown: [{
                                feature: null,
                                order: 0
                            }, {
                                feature: null,
                                order: 1
                            }]
                        };
                    },
                    dimensions: function () {
                        return vm.features.filter(function (item) {
                            return item.featureType === 'DIMENSION';
                        });
                    }
                }
            }).result.then(function () {
                loadHierarchies();
            }, function () {
                loadHierarchies();
            });
        }

        function registerRightNavBarDataOpen() {
            var unsubscribe = $scope.$on(
                "flairbiApp:onData-open",
                function() {
                    onDataOpen();
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }
    }
})();





