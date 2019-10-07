(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("FlairBiController", FlairBiController);

    FlairBiController.$inject = [
        "$scope",
        "$uibModal",
        "Visualizations",
        "entity",
        "states",
        "Visualmetadata",
        "$stateParams",
        "$rootScope",
        "VisualWrap",
        "featureEntities",
        "ExportService",
        "$interval",
        "ShareLinkService",
        "$document",
        "VisualMetadataContainer",
        "PrintService",
        "$state",
        "$timeout",
        "datasource",
        "Views",
        "configuration",
        "$filter",
        "VisualDispatchService",
        "filterParametersService",
        "Features",
        "stompClientService",
        "visualizationRenderService",
        "HttpService",
        "AuthServerProvider",
        "AlertService",
        "QueryValidationService",
        "$translate",
        "$window"
    ];

    function FlairBiController(
        $scope,
        $uibModal,
        Visualizations,
        entity,
        states,
        Visualmetadata,
        $stateParams,
        $rootScope,
        VisualWrap,
        featureEntities,
        ExportService,
        $interval,
        ShareLinkService,
        $document,
        VisualMetadataContainer,
        PrintService,
        $state,
        $timeout,
        datasource,
        Views,
        configuration,
        $filter,
        VisualDispatchService,
        filterParametersService,
        Features,
        stompClientService,
        visualizationRenderService,
        HttpService,
        AuthServerProvider,
        AlertService,
        QueryValidationService,
        $translate,
        $window
    ) {
        var vm = this;
        var editMode = false;
        vm.gridStackOptions = {
            cellHeight: 60,
            verticalMargin: 10,
            disableOneColumnMode: true,
            animate: true,
            disableDrag: true,
            disableResize: true
        };

        vm.datasource = datasource;
        vm.view = entity;
        vm.onChange = onChange;
        vm.onDragStart = onDragStart;
        vm.onDragStop = onDragStop;
        vm.onItemAdded = onItemAdded;
        vm.onItemRemoved = onItemRemoved;
        vm.addWidget = addWidget;
        vm.removeWidget = removeWidget;
        vm.ngIfDelete = ngIfDelete;
        vm.ngIfSettings = ngIfSettings;
        vm.settings = settings;
        vm.canBuild = canBuild;
        vm.onResizeStart = onResizeStart;
        vm.onResizeStop = onResizeStop;
        vm.refreshWidget = refreshWidget;
        vm.toggleFilters = false;
        vm.exportCSV = exportCSV;
        vm.onAction = onAction;
        vm.offAction = offAction;
        vm.share = share;
        vm.openTableDialog = openTableDialog;
        vm.onOpen = onOpen;
        vm.onClose = onClose;
        var intervalRegistry = {};
        vm.printElement = printElement;
        vm.liveState = liveState;
        var isLiveEnabled = false;
        vm.hideFilters = true;
        var isSaving = false;
        var itemProcessed = 0;
        vm.flipCard = flipCard;
        vm.saveFeatures = saveFeatures;
        vm.removeField = removeField;
        vm.isDefaultFeatureEmpty = isDefaultFeatureEmpty;
        vm.registerOnDropEnd = registerOnDropEnd;
        vm.isRequiredFeatureEmpty = isRequiredFeatureEmpty;
        vm.openDataContraints = openDataContraints;
        vm.recreateVisual = recreateVisual;
        vm.openSchedulerDialog = openSchedulerDialog;
        vm.showVizLoader = showVizLoader;
        vm.filtersLength=0;
        activate();

        ////////////////

        function activate() {
            $rootScope.updateWidget={}
            if(!VisualDispatchService.getApplyBookmark()){
                filterParametersService.clear();
            }else{
                vm.filtersLength=filterParametersService.getFiltersCount();
            }
            VisualMetadataContainer.clear();
            VisualDispatchService.clearAll();

            if (configuration.readOnly) {
                var vms = states.viewState.visualMetadataSet || [];
            } else {
                var vms = states.visualMetadataSet || [];
            }

            vm.visualmetadata = VisualMetadataContainer.add(vms);
            registerButtonToggleEvent();
            openSchedulerDialogForThreshold();
            registerDateRangeFilterEvent()
            registerAddVisual();
            registerSaveAllWidgetsEvent();
            loadDimensions();
            registerToggleFilterOff();
            registerToggleFilterOn();
            registerRefreshWidgetsEvent();
            registerStateChangeStartEvent();
            registerOnDragEnd();
            registerOnDropEnd();
            registerFilterCountChanged();
            $timeout(function() {
                vm.hideFilters = false;
            }, 50);
            $rootScope.hideHeader = true;
            registerSaveDataConstraints();
            setVizualizationServiceMode();
            connectWebSocket();
            vm.features = featureEntities;
        }

        function registerFilterCountChanged() {
            var unsubscribe = $scope.$on(
                "flairbiApp:filter-count-changed",
                function() {
                    vm.filtersLength=filterParametersService.getFiltersCount();
                }
            );
            $scope.$on("$destroy", unsubscribe);
        }

        function showVizLoader(isCardRevealed, loading, dataReceived) {
            return isCardRevealed && loading && !dataReceived;
        }

        function setVizualizationServiceMode() {
            HttpService.getVizualizationServiceMode(
                function(result) {
                    $rootScope.vizualizationServiceMode =
                        result.data.vizualizationServiceMode;
                },
                function(error) {
                    //console.log('error=='+error);
                }
            );
        }

        function connectWebSocket() {
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function(frame) {
                    console.log('flair-bi controller connected web socket');
                    stompClientService.subscribe("/user/exchange/metaData", onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
            angular.element("#loader-spinner").hide();
            var body = JSON.parse(data.body || '{}');
            if(body.description==="io exception"){
                var msg=$translate.instant('flairbiApp.visualmetadata.errorOnReceivingMataData') +" : "+ body.cause.message;
                $rootScope.showErrorSingleToast({
                    text: msg
                });
            }else{
                var error = QueryValidationService.getQueryValidationError(body.description);

                if (error) {
                    AlertService.error(error.msgKey, error.params);
                }
            }
        }

        function onExchangeMetadata(data) {
            var metaData = JSON.parse(data.body);
            if (data.headers.request === "filters") {
                $rootScope.$broadcast(
                    "flairbiApp:filters-meta-Data",
                    metaData.data
                );
            } else {
                var contentId = "content-" + data.headers.queryId;
                var cacheDate = data.headers.cacheDate;
                var v = VisualMetadataContainer.getOne(
                    data.headers.queryId
                );
                if (v) {
                    v.loading = false;
                    v.dataReceived = true;
                    v.cacheDate = cacheDate;
                    visualizationRenderService.setMetaData(
                        v,
                        metaData,
                        contentId
                    );
                    angular.element("#loader-spinner").hide();
                }else{
                    angular.element("#loader-spinner").hide();
                }
            }
        }

        function recreateVisual(v) {
            Visualizations.get(
                {
                    id: v.metadataVisual.id
                },
                function(success) {
                    saveClonedVisual(setVisualProps(v, createVisualMetadata(success)));
                },
                function(error) {}
            );
        }

        function setVisualProps(v, clonedV) {
            clonedV.bodyProperties = v.bodyProperties;
            clonedV.properties = v.properties;
            clonedV.titleProperties = v.titleProperties;
            clonedV.fields = v.fields;
            return clonedV;
        }

        function saveClonedVisual(clonedV) {
            Visualmetadata.save(
                {
                    viewId: vm.view.id,
                    visualMetadata: clonedV
                },
                function(result){
                    VisualMetadataContainer.add(result);
                },
                onSaveFeaturesError
            );
        }

        function registerSaveDataConstraints() {
            var saveDataConstraints = $scope.$on(
                "flairbiApp:saveDataConstraints",
                function() {
                    saveFeatures(VisualDispatchService.getVisual().visual);
                }
            );
            $scope.$on("$destroy", saveDataConstraints);
        }

        function openDataContraints(v) {
            $uibModal.open({
                templateUrl:
                    "app/entities/flair-bi/modal/modal-tabs/condition-tab.component.html",
                controller: "conditionTabController",
                controllerAs: "vm",
                backdrop: "static",
                size: "lg",
                resolve: {
                    features: function() {
                        return vm.features;
                    },
                    conditionExpression: function() {
                        return v.conditionExpression;
                    },
                    visualMetaData: function () {
                        return v;
                    },
                    datasource: function () {
                        return vm.datasource;
                    }
                }
            });
            VisualDispatchService.setVisual({ visual: v, view: entity });
        }

        function removeField(fields, index) {
            fields.splice(index, 1);
        }

        function isRequiredFeatureEmpty(fields) {
            var features = fields.filter(function(item) {
                return (
                    item.fieldType.constraint === "REQUIRED" &&
                    item.feature == null
                );
            });
            return features.length == 0 ? true : false;
        }

        function isDefaultFeatureEmpty(fields, type) {
            var features = fields.filter(function(item) {
                return (
                    item.fieldType.featureType === type && item.feature == null
                );
            });
            return features.length == 0 ? true : false;
        }

        function addFieldDimension(v, feature) {
            var fieldType = v.nextFieldDimension();
            if (fieldType != undefined) {
                var field = {
                    fieldType: fieldType,
                    feature: null,
                    constraint: fieldType.constraint
                };
                Visualizations.getFieldType(
                    {
                        id: v.metadataVisual.id,
                        fieldTypeId: field.fieldType.id
                    },
                    function(result) {
                        field.fieldType = result;
                        field.properties = field.fieldType.propertyTypes.map(
                            function(item) {
                                return {
                                    propertyType: item.propertyType,
                                    value: item.propertyType.defaultValue,
                                    type: item.propertyType.type,
                                    order: item.order
                                };
                            }
                        );
                        field.feature = feature;
                        if (isFeatureExist(v.fields, feature))
                            v.fields.push(field);
                    },
                    function(error) {}
                );
            }
        }

        function addFieldMeasure(v, feature) {
            var fieldType = v.nextFieldMeasure();
            if (fieldType != undefined) {
                var field = {
                    fieldType: fieldType,
                    feature: null,
                    constraint: fieldType.constraint
                };
                Visualizations.getFieldType(
                    {
                        id: v.metadataVisual.id,
                        fieldTypeId: field.fieldType.id
                    },
                    function(result) {
                        field.fieldType = result;
                        field.properties = field.fieldType.propertyTypes.map(
                            function(item) {
                                return {
                                    propertyType: item.propertyType,
                                    value: item.propertyType.defaultValue,
                                    type: item.propertyType.type,
                                    order: item.order
                                };
                            }
                        );
                        field.feature = feature;
                        if (isFeatureExist(v.fields, feature))
                            v.fields.push(field);
                    },
                    function(error) {}
                );
            }
        }

        function isFeatureExist(fields, feature) {
            var features = fields.filter(function(item) {
                return (
                    item.feature != null &&
                    item.feature.definition === feature.definition
                );
            });
            return features.length > 0 ? false : true;
        }

        function saveFeatures(v) {
            v.isCardRevealed = true;
            vm.isSaving = true;
            if (v.id) {
                Visualmetadata.update(
                    {
                        viewId: vm.view.id,
                        visualMetadata: v
                    },
                    function(result){
                        vm.isSaving = false;
                        VisualMetadataContainer.update(v.id,result,'id');
                        var info = {text:$translate.instant('flairbiApp.visualmetadata.updated',{param:v.id}),title: "Updated"}
                        $rootScope.showSuccessToast(info);
                    },
                    onSaveFeaturesError
                );
            } else {
                Visualmetadata.save(
                    {
                        viewId: vm.view.id,
                        visualMetadata: v
                    },
                    function(result){
                        vm.isSaving = false;
                        VisualMetadataContainer.update(v.visualBuildId,result,'visualBuildId');
                        var info = {text:$translate.instant('flairbiApp.visualmetadata.created',{param:result.id}),title: "Created"}
                        $rootScope.showSuccessToast(info);
                    },
                    onSaveFeaturesError
                );
            }
        }

        function onSaveFeaturesError(error) {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.dashboards.errorSaving')
            });
        }

        function flipCard(v) {
            $("#grid-back-" + v.visualBuildId).height(
                $("#" + v.visualBuildId).height()
            );
            v.isCardRevealed = v.isCardRevealed == undefined ? true : !v.isCardRevealed;
            if(!v.isCardRevealed){
                $rootScope.$broadcast("flairbiApp:onData-open");
            }
        }

        function registerOnDragEnd() {
            var unsubscribe = $scope.$on("flairbiApp:onDragEnd", function(
                event,
                data
            ) {
                if (data != undefined) {
                    VisualDispatchService.setFeature(data);
                }
                $timeout(function() {});
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function registerOnDropEnd() {
            angular.element(document).bind("drop dragdrop", function() {
                var tagName = event.target.tagName.toLowerCase();
                if (tagName == "input") {
                    var vId = $(event.target)
                        .parent()
                        .parent()
                        .attr("drop-box");
                    //var v=VisualMetadataContainer.getOneVBuildId(vId);
                    VisualDispatchService.setVisual({
                        visual: VisualMetadataContainer.getOneVBuildId(vId),
                        view: entity
                    });
                    if (VisualDispatchService.isFeatureExist()) {
                        if (
                            $(event.target)
                                .parent()
                                .hasClass("measure-item") &&
                            VisualDispatchService.getFeature().featureType ==
                                "MEASURE"
                        ) {
                            var index = $(event.target).attr("index");
                            if (index == -1) {
                                addFieldMeasure(
                                    VisualDispatchService.getVisual().visual,
                                    VisualDispatchService.getFeature()
                                );
                            } else {
                                VisualDispatchService.getVisual().visual.fields[
                                    index
                                ].feature = VisualDispatchService.getFeature();
                            }
                        }
                        if (
                            $(event.target)
                                .parent()
                                .hasClass("dimension-item") &&
                            VisualDispatchService.getFeature().featureType ==
                                "DIMENSION"
                        ) {
                            var index = $(event.target).attr("index");
                            if (index == -1) {
                                addFieldDimension(
                                    VisualDispatchService.getVisual().visual,
                                    VisualDispatchService.getFeature()
                                );
                            } else {
                                VisualDispatchService.getVisual().visual.fields[
                                    index
                                ].feature = VisualDispatchService.getFeature();
                            }
                        }
                    }
                }
            });
        }

        $(document).on("dragenter", function(event) {
            event.preventDefault();
        });
        $(document).on("dragleave", function(event) {});
        $(document).on("dragover", function(event) {
            event.preventDefault();
        });
        $(document).on("dragstart", function(event) {});

        function registerRefreshWidgetsEvent() {
            $scope.$on("flairbiApp:refreshWidgets", function() {
                cb();
            });
        }

        function printElement(w) {
            PrintService.printWidgets(
                [{
                    widgetsID :  "content-" +  w.visualBuildId,
                    widgetsTitle : w.titleProperties.titleText
                }],
                vm.view.viewName, 
                $window.location.href);
        }

        function registerButtonToggleEvent() {
            var unsubscribe = $scope.$on("FlairBi:button-toggle", function(
                event,
                result
            ) {
                editMode = result;

                if (editMode) {
                    enableEditForNewWidget(false);
                    $(".grid-stack")
                        .data("gridstack")
                        .enable();
                } else {
                    enableEditForNewWidget(true);
                    $(".grid-stack")
                        .data("gridstack")
                        .disable();
                }
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function openSchedulerDialogForThreshold() {
            var unsubscribe = $scope.$on("FlairBi:threshold-dialog", function (
                event,
                result
            ) {
                Visualmetadata.get({
                    id: $rootScope.ThresholdViz.ID
                }, function (v) {
                    openSchedulerDialog(new VisualWrap(v),true);
                });
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function registerDateRangeFilterEvent() {
            var unsubscribe = $scope.$on("FlairBi:date-range", function(
                event,
                result
            ) {
                console.log(JSON.stringify($rootScope.dateRange))
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function registerAddVisual() {
            var unsub = $scope.$on("FlairBi:addVisual", function(
                event,
                result
            ) {
                Visualizations.get(
                    {
                        id: result.id
                    },
                    function(success) {
                        addWidget(createVisualMetadata(success));
                    },
                    function(error) {}
                );
                VisualDispatchService.setViewEditedBeforeSave(true);
                VisualDispatchService.setSavePromptMessage("new visualization has been created and it has not been saved.Do you want to save?");
            });
            $scope.$on("$destroy", unsub);
        }

        function registerSaveAllWidgetsEvent() {
            var un = $scope.$on("FlairBi:saveAllWidgets", function(
                event,
                result
            ) {
                if (!isSaving) {
                    isSaving = true;
                    var viewState = {
                        _id: vm.view.currentEditingState._id,
                        visualMetadataSet: VisualMetadataContainer.getAll()
                    };

                    Views.saveViewState(
                        {
                            id: vm.view.id
                        },
                        viewState,
                        function(res) {
                        isSaving = false;
                        },
                        function(err) {
                            isSaving = false;
                        }
                    );

                    var info = {
                        text: "Your changes has been saved",
                        title: "Saved"
                    };
                    $rootScope.showSuccessToast(info);
                    VisualDispatchService.setViewEditedBeforeSave(false);
                }
            });
            $scope.$on("$destroy", un);
        }

        function loadDimensions() {
            vm.dimensions = featureEntities.filter(function(item) {
                return item.featureType === "DIMENSION";
            });
        }

        function registerToggleFilterOff() {
            var toggleFiltersUnsubscribeOff = $scope.$on(
                "flairbiApp:toggleFilters-off",
                function(event, result) {
                    vm.toggleFilters = false;
                }
            );
            $scope.$on("$destroy", toggleFiltersUnsubscribeOff);
        }

        function registerToggleFilterOn() {
            var toggleFiltersUnsubscribeOn = $scope.$on(
                "flairbiApp:toggleFilters-on",
                function(event, result) {
                    vm.toggleFilters = true;
                }
            );
            $scope.$on("$destroy", toggleFiltersUnsubscribeOn);
        }

        function onClose() {
            $rootScope.$broadcast("flairbiApp:toggleFilters-off");
        }

        function onOpen() {
            $rootScope.$broadcast("flairbiApp:toggleFilters-on");
        }

        function registerStateChangeStartEvent() {
            $scope.$on("$stateChangeStart", function(event, next, current) {
                angular.element("#loader-spinner").hide();
                $rootScope.isLiveState=false;
                setDefaultColorFullScreen();
                if($(window).width()<990){
                    $rootScope.hideHeader = false;
                }else if(next.name==="home" || next.name==="account"){
                    $rootScope.hideHeader=false;
                }else{
                    $rootScope.hideHeader = $rootScope.isFullScreen;
                }
                if (VisualDispatchService.getViewEditedBeforeSave()) {
                    event.preventDefault();
                    swal(
                        "Unsaved Changes",
                        VisualDispatchService.getSavePromptMessage(),
                        {
                            buttons: {
                                dontSave: {
                                    text: "Don't Save",
                                    value: "dontSave"
                                },
                                save: {
                                    text: "Save",
                                    value: "save"
                                },
                                cancel: "Cancel"
                            }
                        }
                    ).then(function(value) {
                        switch (value) {
                            case "dontSave":
                                VisualDispatchService.setViewEditedBeforeSave(false);
                                $state.go(next);
                                break;

                            case "save":
                                $rootScope.$broadcast("FlairBi:saveAllWidgets");
                                $state.go(next);
                                break;

                            default:
                                return;
                        }
                    });
                }
            });
        }

        function setDefaultColorFullScreen(){
            $('.flairbi-content-header-fullscreen').css('background-color',"#fafafa");
            $('.page-wrapper-full-screen').css('background-color',"#f1f3f3");            
        }

        function disconnectWebSocket() {
            stompClientService.disconnect();
            console.log("Disconnected");
        }

        /** This should be used instead of livestate method */
        function onAction(v) {
            var int = $interval(function() {
                refreshWidget(v);
            }, 5000);
            intervalRegistry[v.visualBuildId] = int;
        }

        function offAction(v) {
            $interval.cancel(intervalRegistry[v.visualBuildId]);
        }

        /** This should be removed once toggle button is changed to material design */
        function liveState(isLive, v) {
            if (isLive) {
                var int = $interval(function() {
                    refreshWidget(v);
                }, 5000);
                intervalRegistry[v.visualBuildId] = int;
                $rootScope.isLiveState=v.isLiveEnabled = true;
            } else {
                $interval.cancel(intervalRegistry[v.visualBuildId]);
                $rootScope.isLiveState=v.isLiveEnabled = false;
            }
        }

        function share(v) {
            $uibModal
                .open({
                    animation: true,
                    templateUrl:
                        "app/entities/flair-bi/share-dialog/share-dialog.html",
                    size: "md",
                    controller: "ShareDialogController",
                    controllerAs: "vm",
                    resolve: {
                        shareLink: function() {
                            return ShareLinkService.createLink(
                                v.getSharePath(vm.datasource)
                            );
                        }
                    }
                })
                .result.then(
                    function() {
                        cb();
                    },
                    function() {}
                );
        }

        function canBuild(v) {
            if (!v.fields) {
                return false;
            }
            var canBeBuilt = true;
            v.fields.forEach(function(item) {
                if (
                    item.constraint === "REQUIRED" &&
                    (item.feature === null || angular.isUndefined(item.feature))
                ) {
                    canBeBuilt = false;
                    return;
                }
            });
            return canBeBuilt;
        }

        function transformToCsv(data) {
            var csv = [];
            data.forEach(function(item, index) {
                var values = [];
                var header = [];
                for (var key in item) {
                    if (Object.prototype.hasOwnProperty.call(item, key)) {
                        var val = item[key];
                        if (index == 0) {
                            header.push(key);
                        }
                        values.push(val);
                    }
                }

                if (header.length > 0) {
                    csv.push(header);
                }

                csv.push(values);
            });

            return csv;
        }

        function openTableDialog(v) {
            $uibModal
                .open({
                    animation: true,
                    templateUrl:
                        "app/components/shared/table-dialog/table-dialog.html",
                    size: "lg",
                    controller: "TableDialogController",
                    controllerAs: "vm",
                    resolve: {
                        data: function() {
                            return transformToCsv(v.data);
                        }
                    }
                })
                .result.then(function() {}, function() {});
        }

        /**
         * Export visual metadata to csv file
         *
         * @param {any} visualMetadata : selected visual metadata
         */
        function exportCSV(visualMetadata) {
            var csv = transformToCsv(visualMetadata.data);
            ExportService.exportCSV("export.csv", csv);
        }

        function save(visual, index, array) {
            if (visual.id) {
                Visualmetadata.update(
                    visual,
                    function(result) {
                        onSaveSuccess(visual, result, array, cb);
                    },
                    onSaveError
                );
            } else {
                Visualmetadata.save(
                    visual,
                    function(result) {
                        onSaveSuccess(visual, result, array, cb);
                    },
                    onSaveError
                );
            }
        }

        function cb(id, buildId) {
            if (id && vm.view.id) {
                Visualmetadata.get({
                    id: id,
                    viewId: vm.view.id
                }).$promise.then(
                    function(result) {
                        VisualMetadataContainer.clear();
                        VisualMetadataContainer.add(
                            vm.visualmetadata.filter(function(item) {
                                return item.visualBuildId !== buildId;
                            })
                        );
                        //Clear the particular widget which is saving
                        var gridStacks = $(".grid-stack").data("gridstack");

                        if (gridStacks && buildId) {
                            gridStacks.removeWidget(
                                $(".grid-stack-item-" + buildId)
                            );
                        }
                        vm.visualmetadata = VisualMetadataContainer.add(result);
                        $rootScope.$broadcast(
                            "update-widget-content-" + result.id
                        );
                        isSaving = false;
                    },
                    function(error) {}
                );
            } else {
                Visualmetadata.query({
                    views: $stateParams.id
                }).$promise.then(function(result) {
                    isSaving = false;
                    VisualMetadataContainer.clear();
                    //Clear all widgets and fetch all from database
                    var gridStacks = $(".grid-stack").data("gridstack");
                    if (gridStacks && buildId) {
                        gridStacks.removeWidget(
                            $(".grid-stack-item-" + buildId)
                        );
                    }
                    vm.visualmetadata = VisualMetadataContainer.add(result);
                });
            }
        }

        function onSaveSuccess(visual, result, array, cb) {
            itemProcessed++;
            if (itemProcessed === array.length) {
                cb();
                itemProcessed = 0;
            }
        }

        function onSaveError() {}

        function createVisualMetadata(visualization) {
            var newVM = {
                isCardRevealed: true,
                viewId: vm.view.linkId,
                titleProperties: {
                    titleText: visualization.name,
                    backgroundColor: "#fafafa",
                    borderBottom: "none",
                    color: "#676a6c"
                },
                bodyProperties: {
                    opacity: 1,
                    backgroundColor: "#ffffff",
                    border: "none"
                },
                visualBuildId:
                    visualization.id +
                    "a" +
                    Math.round(Math.random() * 1000000),
                width: 5,
                xPosition: 0,
                height: 5,
                yPosition: 1000,
                metadataVisual: visualization,
                views: vm.view,
                datasource: vm.view.viewDashboard.dashboardDatasource.id
            };

            newVM = createProperties(newVM);
            newVM = createFields(newVM);

            return new VisualWrap(newVM);
        }

        function refreshWidget(v) {
            $rootScope.$broadcast(
                "update-widget-content-" + v.id || v.visualBuildId
            );
        }

        function createFields(newVM) {
            newVM.fields = newVM.metadataVisual.fieldTypes
                .filter(function(item) {
                    return item.constraint === "REQUIRED";
                })
                .map(function(item) {
                    return {
                        fieldType: item,
                        feature: null,
                        constraint: item.constraint
                    };
                });
            newVM.fields.forEach(function(field) {
                Visualizations.getFieldType(
                    {
                        id: newVM.metadataVisual.id,
                        fieldTypeId: field.fieldType.id
                    },
                    function(result) {
                        field.fieldType = result;
                        field.properties = field.fieldType.propertyTypes.map(
                            function(item) {
                                return {
                                    propertyType: item.propertyType,
                                    value: item.propertyType.defaultValue,
                                    type: item.propertyType.type,
                                    order: item.order
                                };
                            }
                        );
                    },
                    function(error) {}
                );
            });

            return newVM;
        }

        function createProperties(newVM) {
            newVM.properties = newVM.metadataVisual.propertyTypes.map(function(
                item
            ) {
                return {
                    propertyType: item.propertyType,
                    value: item.propertyType.defaultValue,
                    order: item.order,
                    type: item.propertyType.type
                };
            });
            return newVM;
        }

        function settings(v) {
            $rootScope.updateWidget = {};
            VisualDispatchService.setVisual({ visual: v, view: entity });
            $rootScope.$broadcast("flairbiApp:toggleProperties-on");
            VisualDispatchService.setOpacity(v.visualBuildId);
        }

        function onResizeStart(event, ui) {}

        function onResizeStop(event, ui) {
            VisualDispatchService.setViewEditedBeforeSave(true);
            VisualDispatchService.setSavePromptMessage("Visualization has been resized and it has not been saved.Do you want to save?");
            delete $rootScope.updateWidget[ui.element.attr("id")];
            $rootScope.$broadcast(
                "resize-widget-content-" + ui.element.attr("id")
            );
        }

        function onChange(event, items) {}

        function onDragStart(event, ui) {}

        function onDragStop(event, ui) {
            VisualDispatchService.setViewEditedBeforeSave(true);
            VisualDispatchService.setSavePromptMessage("You have unsaved changes made to dashboard. Are you sure you wish to discard these changes?");
        }

        function onItemAdded(item) {}

        function onItemRemoved(item) {}

        function addWidget(widget) {
            vm.visualmetadata.push(widget);
        }

        function removeWidget(widget) {
            swal("Delete Visual from dashboard", "Your'e about to delete visualization from this dashboard. Deleting this visualization will impact any scheduled reports", {
                dangerMode: true,
                buttons: true
            }).then(function(value) {
                if (value) {
                    delete $rootScope.updateWidget[widget.id];

                    if (widget.id) {
                        Visualmetadata.delete(
                            {
                                id: widget.id
                            },
                            function(result) {
                                removeFromView(widget);
                            },
                            function(error) {
                                swal("Something went wrong");
                            }
                        );
                    } else {
                        removeFromView(widget);
                    }
                    $scope.$apply();
                } else {
                    return false;
                }
            });
        }

        function removeFromView(widget) {
            vm.visualmetadata = VisualMetadataContainer.remove(widget);
        }

        function ngIfSettings() {
            return editMode;
        }

        function ngIfDelete() {
            return editMode;
        }

        function enableEditForNewWidget(mode) {
            vm.gridStackOptions.disableDrag = mode;
            vm.gridStackOptions.disableResize = mode;
        }

        function openSchedulerDialog(v,thresholdAlert){
            $uibModal.open({
                animation: true,
                templateUrl: 'app/entities/flair-bi/scheduler/scheduler-dialog.html',
                size: 'lg',
                controller: 'SchedulerDialogController',
                controllerAs: 'vm',
                resolve: {
                    visualMetaData: function () {
                        return v;
                    },
                    datasource: function(){
                        return vm.datasource;
                    },
                    view: function(){
                        return vm.view;
                    },
                    dashboard: function(){
                        return vm.view.viewDashboard;
                    },
                    scheduledObj: function(){
                        return null;
                    },
                    thresholdAlert: function(){
                        return thresholdAlert;
                    }
                }
            }).result.then(function () { }, function () { });

        }
        angular.element(document).ready(function () {
            VisualDispatchService.setApplyBookmark(false);
        });
    }
})();
