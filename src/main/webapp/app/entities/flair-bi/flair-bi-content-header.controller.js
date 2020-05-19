(function () {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "FlairBiContentHeaderController",
            FlairBiContentHeaderController
        );

    FlairBiContentHeaderController.$inject = [
        "$scope",
        "$rootScope",
        "filterParametersService",
        "FilterStateManagerService",
        "entity",
        "FeatureBookmark",
        "featureEntities",
        "$uibModal",
        "$state",
        "FeatureCriteria",
        "$timeout",
        "PrintService",
        "VisualMetadataContainer",
        "Principal",
        "PERMISSIONS",
        "configuration",
        "states",
        "VisualDispatchService",
        "Dashboards",
        "Views",
        "$stateParams",
        "$window",
        "recentBookmarkService",
        "Auth",
        'ViewFeatureCriteria',
        "DYNAMIC_DATE_RANGE_CONFIG"
    ];

    function FlairBiContentHeaderController(
        $scope,
        $rootScope,
        filterParametersService,
        FilterStateManagerService,
        entity,
        FeatureBookmark,
        featureEntities,
        $uibModal,
        $state,
        FeatureCriteria,
        $timeout,
        PrintService,
        VisualMetadataContainer,
        Principal,
        PERMISSIONS,
        configuration,
        states,
        VisualDispatchService,
        Dashboards,
        Views,
        $stateParams,
        $window,
        recentBookmarkService,
        Auth,
        ViewFeatureCriteria,
        DYNAMIC_DATE_RANGE_CONFIG
    ) {
        var vm = this;

        var editMode = false;
        var showOpt = true;
        var dynamicDateRangeFun='FLAIR';
        vm.toolTipTexts={};
        vm.configuration = configuration;
        vm.states = states;
        vm.clearFilters = clearFilters;
        vm.clearFiltersClick = clearFiltersClick;
        vm.onWriteToPg = onWriteToPg;
        vm.onGetData = onGetData;
        vm.exploration = $rootScope.exploration;
        vm.ngIfClearFilters = ngIfClearFilters;
        vm.ngIfFilters = ngIfFilters;
        vm.ngIfGetData = ngIfGetData;
        vm.ngIfResources = ngIfResources;
        vm.ngIfSave = ngIfSave;
        vm.previous = previous;
        vm.next = next;
        vm.nextDisabled = true;
        vm.previousDisabled = true;
        vm.view = entity;
        vm.bookmarks = FeatureBookmark.query({
            datasource: vm.view.viewDashboard.dashboardDatasource.id
        });
        vm.bookmark = bookmark;
        vm.features = featureEntities;
        vm.applyBookmark = applyBookmark;

        vm.navbarToggled = false;
        vm.isReloaded = false;

        vm.printAllWidgets = printAllWidgets;

        vm.editState = editState;
        vm.thresholdAlert = thresholdAlert;
        vm.filters = {};
        vm.toggleFilters = toggleFilters;
        vm.removeFilterTag = removeFilterTag;
        vm.removeFilter = removeFilter;
        vm.getFloor = getFloor;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.currentPage = 0;
        vm.pageSize = 12;
        vm.noOfPages = 0;
        vm.searchFilter = searchFilter;
        vm.setFullScreen = setFullScreen;
        vm.exitFullScreen = exitFullScreen;
        vm.toggleFSFilter = toggleFSFilter;
        vm.showFSFilter = false;
        vm.ifFSFilterToggled = ifFSFilterToggled;
        vm.changeDashboard = changeDashboard;
        vm.changeView = changeView;
        vm.changeViewAndUpdateDashboard = changeViewAndUpdateDashboard;
        vm.dashboardId = $stateParams.dashboardId;
        vm.viewId = $stateParams.id;
        vm.isShowDisabled = isShowDisabled;
        vm.disableShow = false;
        vm.build = build;
        vm.views = [];
        vm.dashboards = [];
        vm.openSettings = openSettings;
        vm.clearDashboard = clearDashboard;
        vm.clearView = clearView;
        vm.activateMobileNavigation = activateMobileNavigation;
        vm.activeMobileUserOptionNavigation = activeMobileUserOptionNavigation;
        vm.mobileNavidationSlide = false;
        vm.mobileUserOptionNavigationSlide = false;
        vm.logout = logout;
        vm.filtersLength = 0;
        vm.changeHeaderColor = changeHeaderColor;
        vm.changeContainerColor = changeContainerColor;
        vm.getKeyName = getKeyName;
        vm.isDateRange = isDateRange;
        vm.getFiltersToolTipName = getFiltersToolTipName;
        vm.viewFeatureCriteriaReady = false;
        vm.canEdit = false;
        vm.editOn = false;

        Principal.identity().then(function (account) {
            vm.account = account;

            //Enabled/Disable toogle based on permission - Issue Fix: Start
            Principal.hasAuthority("WRITE_" + vm.view.id + "_VIEW").then(function (
                obj
            ) {
                vm.canEdit = obj;
            });
            //Enabled/Disable toogle based on permission - Issue Fix: End
        });


        activate();

        ////////////////

        function activate() {
            registerEditModeToggle();
            registerFilterRefresh();
            registerFilterClick();
            registerAddFilter();
            setPageSizeforScreens();
            fetchDashboardsAndViews();
            if ($(window).width() < 990) {
                $rootScope.isFullScreen = true;
            }
            if (VisualDispatchService.getApplyBookmark()) {
                vm.selectedBookmark = VisualDispatchService.getFeatureBookmark();
                applyBookmark(vm.selectedBookmark);
                VisualDispatchService.setFeatureBookmark({});
                recentBookmarkService.saveRecentBookmark(vm.selectedBookmark.id, $stateParams.id);
            } else if (vm.view.viewFeatureCriterias) {
                setTimeout(() => applyViewFeatureCriteria(vm.view.viewFeatureCriterias));
            }
        }

        function applyFeatureCriteria(isTemporal, metadata, feature, value, filterName) {
            if (isTemporal) {
                if (metadata) {
                    const dynamics = metadata.split("||");
                    const tooltipText = dynamics[0] === "true" ? 'Last ' + dynamics[1] : dynamics[2];
                    const dynamicDateRangeToolTip = {name: filterName, text: tooltipText};
                    filterParametersService.saveDynamicDateRangeToolTip(dynamicDateRangeToolTip);
                    $rootScope.$broadcast("flairbiApp:bookmark-update-dynamic-date-range-meta-data",
                        buildDynamicDateRangeObject(feature.name, dynamics[2], dynamics[1]));
                } else {
                    const daterange = value.split("||");
                    $rootScope.$broadcast("flairbiApp:filter-set-date-ranges",
                        buildDateRange(feature.name, daterange));
                }
            }
            const valueType = isTemporal ? 'dateRangeValueType' : 'valueType';
            const filter = value.split('||');
            filter._meta = {
                dataType: feature.type,
                valueType: valueType
            };
            return filter;
        }

        function applyViewFeatureCriteria(viewFeatureCriterias) {
            const filters = {};
            viewFeatureCriterias.forEach(criteria => {
                const isTemporal = true;
                const filterName = isTemporal
                    ? filterParametersService.buildDateRangeFilterName(criteria.feature.name)
                    : criteria.feature.name;
                filters[filterName] = applyFeatureCriteria(isTemporal, criteria.metadata, criteria.feature, criteria.value, filterName);
            });

            filterParametersService.save(filters);
            $rootScope.$broadcast('flairbiApp:filter-input-refresh');
            $rootScope.$broadcast('flairbiApp:filter');
            $rootScope.$broadcast('flairbiApp:filter-add');

            vm.viewFeatureCriteriaReady = true;
        }

        function addFilterFromBookmark(selectedBookmark) {
            var filter = {};
            var temporalDataTypes = filterParametersService.getComparableDataTypes();
            selectedBookmark.featureCriteria.forEach(function (criteria) {
                var isTemporal = criteria.dateRange && temporalDataTypes.indexOf(criteria.feature.type.toLowerCase()) > -1;
                var featureName = isTemporal
                    ? filterParametersService.buildDateRangeFilterName(criteria.feature.name)
                    : criteria.feature.name;
                filter[featureName] = applyFeatureCriteria(isTemporal, criteria.metaData, criteria.feature, criteria.value, featureName);
            });
            filterParametersService.save(filter);
        }

        function buildDynamicDateRangeObject(dimensionName,title,customDynamicDateRange){
            var metaData = {dimensionName: dimensionName, metadata : { currentDynamicDateRangeConfig : {},customDynamicDateRange:customDynamicDateRange,dateRangeTab : 2 }};
            vm.configs = DYNAMIC_DATE_RANGE_CONFIG.filter(function (item) {
                return  item.title===title;
            });
            metaData.metadata.currentDynamicDateRangeConfig = vm.configs[0];
            return metaData;
        }

        function buildDateRange(dimensionName,daterange){
            return {dimensionName: dimensionName, startDate: daterange[0],endDate:daterange[1]};
        }

        function openSettings() {
            $uibModal.open({
                templateUrl: "app/entities/flair-bi/full-screen-settings-dialog.html",
                controller: "FullScreenSettingsDialogController",
                controllerAs: "vm",
                backdrop: "static",
                size: "sm",
                resolve: {
                    settings: function () {
                        return VisualDispatchService.getSettings();
                    }
                }
            });

        }

        function toggleFSFilter() {
            vm.showFSFilter = filterParametersService.getFiltersCount() == 0 ? false : !vm.showFSFilter;
            $rootScope.$broadcast("flairbiApp:toggle-fullscreen-header-filters",vm.showFSFilter);
        }

        function ifFSFilterToggled() {
            return vm.filtersLength > 0 && ($rootScope.isFullScreen == false || (vm.showFSFilter == true && $rootScope.isFullScreen == true));
        }

        function setFullScreen() {
            $rootScope.isFullScreen = true;
            hideFiltersHeaderAndSideBar();
            $rootScope.$broadcast("FlairBi:button-toggle", false);
            VisualDispatchService.reloadGrids();
        }

        function exitFullScreen() {
            $rootScope.isFullScreen = false;
            hideFiltersHeaderAndSideBar();
            $('.flairbi-content-header').css('background-color', '');
            $('#page-wrapper').css('background-color', '');
            VisualDispatchService.reloadGrids();
        }

        function hideFiltersHeaderAndSideBar() {
            if (vm.filtersLength == 0) {
                vm.showFSFilter = false;
                $rootScope.$broadcast("flairbiApp:toggle-headers-filters",true);
            } else {
                vm.showFSFilter = true;
                $rootScope.$broadcast("flairbiApp:toggle-headers-filters",false);
            }
        }

        function fetchDashboardsAndViews() {
            loadDashboards();
            loadViews();
        }

        function loadDashboards() {
            Dashboards.query(function (result) {
                vm.dashboards = result;
                vm.selectedDashboard = VisualDispatchService.getDashBoard(result, parseInt(vm.dashboardId));
            });
        }

        function changeDashboard(item) {
            vm.selectedDashboard = item;
            vm.dashboardId = item.id;
            loadViews();
            vm.viewId = 0;
        }

        function clearDashboard() {
            vm.selectedDashboard = null;
        }

        function clearView() {
            vm.selectedView = null;
        }

        function loadViews() {
            Views.query(
                {
                    viewDashboard: vm.dashboardId
                },
                function (result) {
                    vm.views = result;
                    vm.selectedView = VisualDispatchService.getView(result, parseInt(vm.viewId));
                }
            );
        }

        function changeView(item) {
            vm.selectedView = item;
            vm.viewId = item.id;
        }

        function changeViewAndUpdateDashboard(item){
            vm.selectedView = item;
            vm.viewId = item.id;
            vm.build();
        }

        function buildUrl() {
            return "#/dashboards/" + vm.dashboardId + "/views/" + vm.viewId + "/build";
        }


        function isShowDisabled() {
            return vm.disableShow == true ? true : (vm.viewId == 0 || vm.views.length == 0);
        }

        function build() {
            if (vm.viewId != $stateParams.id) {
                vm.disableShow = true;
                $window.location.href = buildUrl();
                vm.mobileNavidationSlide = false;
            }
        }

        function searchFilter(filter) {
            var result = {};
            filter = filter == '' || filter.length == 0 ? filter : filter.toLowerCase();
            vm.filters = filterParametersService.get()
            angular.forEach(vm.filters, function (value, key) {
                if (key.toLowerCase().indexOf(filter) > -1) {
                    result[key] = value;
                }
            });
            if (!isSearchResultEmpty(result)) {
                vm.filters = result;
                setNoOfPages();
            }
        }

        function isSearchResultEmpty(result) {
            for (var k in result) {
                if (vm.filters.hasOwnProperty(k)) {
                    return false;
                    break;
                }
            }
            return true;
        }


        function setPageSizeforScreens() {
            var width = $(window).width();
            if (width >= 320 && width < 380) {
                vm.pageSize = 1;
            }
            if (width >= 380 && width < 480) {
                vm.pageSize = 2;
            }
            if (width >= 480 && width < 670) {
                vm.pageSize = 3;
            }
            if (width >= 670 && width < 780) {
                vm.pageSize = 4;
            }
            if (width >= 780 && width < 880) {
                vm.pageSize = 5;
            }
            if (width >= 880 && width < 1000) {
                vm.pageSize = 6;
            }
            if (width >= 1000 && width < 1200) {
                vm.pageSize = 7;
            }
            if (width >= 1200 && width < 1400) {
                vm.pageSize = 8;
            } if (width >= 1400 && width < 1500) {
                vm.pageSize = 9;
            } if (width >= 1500 && width < 1600) {
                vm.pageSize = 10;
            } if (width >= 1600 && width < 1824) {
                vm.pageSize = 11;
            }
            if (width > 1824 && width < 1900) {
                vm.pageSize = 13;
            } if (width >= 1900) {
                vm.pageSize = 14;
            } else {

            }
        }

        function getFloor(index) {
            return Math.floor(index / vm.pageSize);
        }

        function nextPage() {
            vm.currentPage++;
        }

        function prevPage() {
            vm.currentPage--;
        }

        function registerAddFilter() {
            var unsubscribe = $scope.$on(
                "flairbiApp:filter-add",
                function () {
                    vm.filters = filterParametersService.get();
                    setToolTipTexts(vm.filters);
                    FilterStateManagerService.add(
                        angular.copy(filterParametersService.get())
                    );
                    setNoOfPages();
                    $timeout(function () {
                    });
                }
            );
            $scope.$on("$destroy", unsubscribe);
        }

        function setToolTipTexts(filters){
            angular.forEach(filters, function (value, key) {
                vm.toolTipTexts[key]=getFiltersToolTipName(key);
            });
        }

        function getKeyName(name) {
            return isDateRange(name) ? name.split('|')[1] : name;
        }

        function getFiltersToolTipName(name) {
            if (isDateRange(name)) {
                var dateRangeToolTipText="Date Range : ";
                var filters = filterParametersService.get();
                if((filters[name][0].indexOf(dynamicDateRangeFun) !== -1) || (filters[name][1].indexOf(dynamicDateRangeFun) !== -1)){
                    dateRangeToolTipText = dateRangeToolTipText + filterParametersService.getDynamicDateRangeToolTip(name);
                    return dateRangeToolTipText;
                }else{
                    dateRangeToolTipText = dateRangeToolTipText + filterParametersService.changeDateFormat(filters[name][0]) + " AND " + filterParametersService.changeDateFormat(filters[name][1]);
                    return dateRangeToolTipText;
                }
            } else {
                return name;
            }
        }

        function isDateRange(name) {
            return name.lastIndexOf(filterParametersService.getDateRangePrefix(), 0) === 0;
        }

        function setNoOfPages() {
            vm.noOfPages = Math.ceil(filterParametersService.getFiltersCount() / vm.pageSize) - 1;
            vm.filtersLength = filterParametersService.getFiltersCount();
            $rootScope.$broadcast("flairbiApp:filter-count-changed");
            hideFiltersHeaderAndSideBar();
        }

        function toggleFilters($event) {
            $event.stopPropagation();
            $($event.currentTarget).children(".filter-drop-downs").show();
        }

        function removeFilterTag($event, val, list, key) {
            $event.preventDefault();
            var index = list.indexOf(val);
            if (index > -1) {
                list.splice(index, 1);
            }
            vm.filters[key] = list;
            removeTagInBI({ 'text': val });
            setNoOfPages();
        }

        function removeFilter($event, key) {
            $event.preventDefault();
            if (isDateRange(key)) {
                $rootScope.$broadcast('flairbiApp:filter-set-date-ranges', {dimensionName: key.split('|')[1].toLowerCase(), startDate: null, endDate: null });
                var filterParameters = filterParametersService.get();
                delete filterParameters[key];
                FilterStateManagerService.add(angular.copy(filterParametersService.get()));
                $rootScope.filterSelection.id = null
                $rootScope.$broadcast('flairbiApp:filter');
            } else {
                removeTagInBI(key);
            }
            // Remove entry from rootScope filterSelection property
            delete $rootScope.filterSelection.filter[key];
            vm.filters[key] = [];
            setNoOfPages();
        }

        function removeTagInBI(filter) {
            $rootScope.$broadcast("FlairBi:remove-filter", filter);
        }

        function editState(toggleValue) {
            vm.editOn = !toggleValue;
            $rootScope.$broadcast("FlairBi:button-toggle", vm.editOn);
        }

        function thresholdAlert(toggleValue) {
            $rootScope.isThresholdAlert = !toggleValue;
            vm.isThresholdAlert = !toggleValue;
        }


        function printAllWidgets() {
            PrintService.printWidgets(
                VisualMetadataContainer.getAll().map(function (item) {

                    return {
                        widgetsID: "content-" + item.visualBuildId || item.id,
                        widgetsTitle: item.titleProperties.titleText
                    }
                })
                , vm.selectedDashboard.dashboardName
                , vm.selectedView.viewName,
                $window.location.href);
        }

        function applyBookmark(item) {
            if (!item) {
                clearFilters();
            } else {
                vm.selectedBookmark = item;
                FeatureCriteria.query(
                    {
                        featureBookmark: item.id
                    },
                    function (result) {
                        item.featureCriteria = result;
                        addFilterFromBookmark(item);
                        $rootScope.$broadcast(
                            "flairbiApp:filter-input-refresh"
                        );
                        $rootScope.$broadcast("flairbiApp:filter");
                        $rootScope.$broadcast('flairbiApp:filter-add');
                        recentBookmarkService.saveRecentBookmark(item.id, $stateParams.id);
                    }
                );
            }
        }

        function registerEditModeToggle() {
            var unsubscribe = $scope.$on("FlairBi:button-toggle", function (
                event,
                result
            ) {
                editMode = result;
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function registerFilterRefresh() {
            var unsubscribe = $scope.$on("flairbiApp:filter", function () {
                refresh();
            });
            $scope.$on("$destroy", unsubscribe);
        }

        function registerFilterClick() {
            const unsub1 = $rootScope.$on("flairbiApp:clearFiltersClicked", function () {
                saveViewFeatureCriterias();
            });
            const unsub2 = $rootScope.$on("flairbiApp:filterClicked", function () {
                saveViewFeatureCriterias();
            });
            $scope.$on("$destroy", unsub1);
            $scope.$on("$destroy", unsub2);
        }

        function getFilterCriterias() {
            var params = filterParametersService.get();
            var filterCriterias = [];
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    const param = params[key];
                    const isItemDateRange = isDateRange(key);
                    if (isItemDateRange) {
                        param[0] = filterParametersService.changeDateFormat(param[0]);
                        param[1] = filterParametersService.changeDateFormat(param[1]);
                    }
                    filterCriterias.push({
                        value: params[key].join('||'),
                        metaData: isItemDateRange ? filterParametersService.buildFilterCriteriasForDynamicDateRange(key) : null,
                        dateRange: isItemDateRange,
                        key,
                        feature: vm.features.filter(function (item) {
                            var featureName = "";
                            if (isItemDateRange) {
                                featureName = key.split('|')[1].toLowerCase();
                            } else {
                                featureName = key.toLowerCase();
                            }
                            return item.name.toLowerCase() === featureName;
                        })[0]
                    });
                }
            }
            return filterCriterias;
        }

        function bookmark() {
            const filterCriterias = getFilterCriterias();

            $uibModal
                .open({
                    templateUrl:
                        "app/entities/feature-bookmark/feature-bookmark-dialog.html",
                    controller: "FeatureBookmarkDialogController",
                    controllerAs: "vm",
                    backdrop: "static",
                    size: "md",
                    resolve: {
                        entity: function () {
                            return {
                                id: null,
                                name: null,
                                featureCriteria: filterCriterias,
                                datasource: vm.view.viewDashboard.dashboardDatasource
                            };
                        }
                    }
                })
                .result.then(
                    function () {
                        vm.bookmarks = FeatureBookmark.query({
                            datasource:
                                vm.view.viewDashboard.dashboardDatasource.id
                        });
                    },
                    function () { }
                );
        }

        function saveViewFeatureCriterias() {
            if (!vm.viewFeatureCriteriaReady) {
                return;
            }
            const features = getFilterCriterias()
                .filter((item) => item.dateRange)
                .map((item) => ({
                    value: item.value,
                    featureId: item.feature.id,
                    metadata: item.metaData
                }));

            ViewFeatureCriteria.save({
                    features,
                    viewId: vm.view.id
                });
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

        function clearFilters() {
            vm.selectedBookmark = null;
            $rootScope.activePage.activePageNo = 0;
            $rootScope.$broadcast("flairbiApp:clearFilters");
        }

        function clearFiltersClick() {
            clearFilters();
            $rootScope.$broadcast("flairbiApp:clearFiltersClicked");
        }

        function onWriteToPg() {
            $rootScope.$broadcast("FlairBi:saveAllWidgets");
        }

        function onGetData() { }

        function ngIfResources() {
            return editMode && !$rootScope.exploration;
        }

        function ngIfFilters() {
            return showOpt && !$rootScope.exploration;
        }

        function ngIfClearFilters() {
            return showOpt && !$rootScope.exploration;
        }

        function ngIfSave() {
            return editMode && !$rootScope.exploration;
        }

        function ngIfGetData() {
            return $rootScope.exploration;
        }

        function activateMobileNavigation() {
            vm.mobileNavidationSlide = !vm.mobileNavidationSlide;
        }

        function activeMobileUserOptionNavigation() {
            vm.mobileUserOptionNavigationSlide = !vm.mobileUserOptionNavigationSlide;
        }
        function logout() {
            Auth.logout()
                .then(function () {
                    $state.go('login');
                })
                .catch(function (response) {
                    console.log("Logout error status:" + response.status)
                    console.log("Logout error data:" + response.data)
                    console.log("Logout error :" + response)
                    console.log("Logout error stringify:" + JSON.stringify(response))
                    console.log("Logout error parse:" + JSON.parse(response))

                });
        }

        function changeHeaderColor(headerColor) {
            if (headerColor)
                $('.flairbi-content-header-fullscreen').css('background-color', headerColor);
        }

        function changeContainerColor(containerColor) {
            if (containerColor)
                $('.page-wrapper-full-screen').css('background-color', containerColor)
        }
    }
})();
