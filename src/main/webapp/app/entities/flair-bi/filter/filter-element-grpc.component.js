(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterElementGrpcComponent', {
            templateUrl: 'app/entities/flair-bi/filter/filter-element-grpc.component.html',
            controller: filterElementGrpcController,
            controllerAs: 'vm',
            bindings: {
                dimension: '=',
                view: '=',
                dimensions: '=',
                tab: '=',
                list: '=',
                separator: '=',
                iframes: '='
            }
        });

    filterElementGrpcController.$inject = ['$scope', 'proxyGrpcService', 'filterParametersService', '$timeout', 'FilterStateManagerService', '$rootScope', '$filter', 'VisualDispatchService', 'stompClientService', 'favouriteFilterService', 'COMPARABLE_DATA_TYPES', '$stateParams', 'Views', 'IFRAME', 'Features','$translate'];

    function filterElementGrpcController($scope, proxyGrpcService, filterParametersService, $timeout, FilterStateManagerService, $rootScope, $filter, VisualDispatchService, stompClientService, favouriteFilterService, COMPARABLE_DATA_TYPES, $stateParams, Views, IFRAME, Features,$translate) {
        var vm = this;
        vm.$onInit = activate;
        vm.load = load;
        vm.added = added;
        vm.removed = removed;
        vm.canDisplayDateRangeControls = canDisplayDateRangeControls;
        vm.onDateChange = onDateChange;
        vm.dateRangeReload = false;
        vm.removeTagFromFilterList = removeTagFromFilterList;
        vm.addToFavourite = addToFavourite;
        vm.checkFavouriteFilter = checkFavouriteFilter;
        vm.addFilter = addFilter;
        vm.displayTextboxForValues = displayTextboxForValues;
        vm.addToFilter = addToFilter;
        vm.isActive = isActive;
        vm.toggleHeaderFilter = toggleHeaderFilter;
        vm.activeForText = "disable";
        vm.isCommaSeparatedInput = false;
        vm.pinFilter = [];
        vm.commaSeparatedToolTip = VisualDispatchService.setcommaSeparatedToolTip(vm.isCommaSeparatedInput);
        vm.lastQuery = {};
        ////////////////

        function activate() {
            var unsub = $scope.$on('flairbiApp:filter-input-refresh', function (e) {
                refresh();
            });

            $scope.$on('flairbiApp:clearFilters', function () {
                clear();
            });

            $scope.$on('$destroy', unsub);
            registerRemoveTag();
            receivedMetaData();
            if (isFavouriteFilter())
                vm.load("", vm.dimension);
        }


        function receivedMetaData() {
            var unsubscribe = $scope.$on(
                "flairbiApp:filters-meta-Data",
                function (event, filter) {
                    if (favouriteFilterService.getFavouriteFilter()) {
                        var obj = filter[0];
                        var dimensionName = '';
                        for (var i in obj) {
                            dimensionName = i;
                            break;
                        }
                        var retVal = filter.map(function (item) {
                            return item[dimensionName];
                        });
                        vm.list[dimensionName] = retVal;
                        setSelectedFilter(vm.list[dimensionName]);
                    }
                }
            );
            $scope.$on("$destroy", unsubscribe);
        };


        function isActive(filter) {
            var myFilters = filterParametersService.getSelectedFilter()[vm.dimension.name] || filterParametersService.get()[vm.dimension.name.toLowerCase()];
            if (myFilters && myFilters.length > 0) {
                if (myFilters.indexOf(filter) !== -1) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }

        function addFilter(filter) {
            var filterParameters = filterParametersService.getSelectedFilter();
            if (!filterParameters[vm.dimension.name]) {
                filterParameters[vm.dimension.name] = [];
            }

            if (filterParameters[vm.dimension.name].indexOf(filter) !== -1) {
                filterParameters[vm.dimension.name].splice(filterParameters[vm.dimension.name].indexOf(filter.name), 1);
                removeTagFromSelectedList({ text: filter });
            }
            else {
                filterParameters[vm.dimension.name].push(filter);
                if (!vm.dimension.selected) {
                    vm.dimension.selected = [];
                    vm.dimension.selected.push({ text: filter });
                } else {
                    vm.dimension.selected.push({ text: filter });
                }
            }

            filterParameters[vm.dimension.name]._meta = {
                dataType: vm.dimension.type,
                valueType: 'valueType'
            };
            filterParametersService.saveSelectedFilter(filterParameters);
            vm.isActive(filter);
            vm.searchText = "";
            vm.load(vm.searchText, vm.dimension)

            if (isFavouriteFilter())
                vm.list[vm.dimension.name] = displaySelectedFilterAtTop(vm.list[vm.dimension.name], vm.list[vm.dimension.name].indexOf(filter), filterParameters[vm.dimension.name].length - 1);



        }/////

        function clear() {
            vm.dateRangeReload = !vm.dateRangeReload;
        }

        function resetTimezone(startDate) {
            return startDate;
        }

        function checkFavouriteFilter() {
            return vm.dimension.favouriteFilter === true ? 'fa fa-star' : 'fa fa-star-o';
        }
        function addToFavourite(id) {
            favouriteFilterService.markFavouriteFilter(id, !vm.dimension.favouriteFilter)
                .then(function (data) {
                    vm.dimension.favouriteFilter = !vm.dimension.favouriteFilter;
                    var info = {
                        text: $translate.instant(vm.dimension.favouriteFilter === true ? 'flairbiApp.bookmarkFilter' : 'flairbiApp.removeBookmarkFilter'),
                        title: "Saved" 
                   }
                    $rootScope.showSuccessToast(info);
                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }

        function onDateChange(startDate, endDate, metadata) {
            vm.dimension.metadata = metadata;
            if (metadata.dateRangeTab !== 2) {
                vm.dimension.selected = startDate;
                vm.dimension.selected2 = endDate;
            } else {
                filterParametersService.saveDynamicDateRangeMetaData(vm.dimension.name, metadata);
            }
            console.log('filter-element-grpc: refresh for range', typeof startDate, startDate,
                typeof endDate, endDate);
            removeFilter(vm.dimension.name);
            if (startDate) {
                startDate = resetTimezone(startDate);
                addDateRangeFilter(startDate);
            }
            if (endDate) {
                endDate = resetTimezone(endDate);
                addDateRangeFilter(endDate);
            }
        }

        function canDisplayDateRangeControls(dimension) {
            return filterParametersService.isDateType(dimension);
        }

        function registerRemoveTag() {
            var unsubscribe = $scope.$on(
                "FlairBi:remove-filter",
                function (event, filter) {
                    if (filter != undefined) {
                        if (!isString(filter)) {
                            processRemoveTag(filter)
                        } else {
                            processRemoveFilter(filter);
                        }
                    }
                }
            );

            $scope.$on("$destroy", unsubscribe);
        }

        function processRemoveTag(tag) {
            if (isTagExist(tag)) {
                removed(tag);
                removeTagFromSelectedList(tag);
            }
            applyFilter();
        }

        function removeFilter(filter) {
            var filterParameters;
            filterParameters = filterParametersService.get();
            filterParameters[filter] = [];
            filterParametersService.save(filterParameters);

            filterParameters = filterParametersService.getSelectedFilter();
            filterParameters[filter] = [];
            filterParametersService.saveSelectedFilter(filterParameters);
        }

        function processRemoveFilter(filter) {
            var filterParameters = filterParametersService.get();
            if (filterParameters[filter] == undefined) {
                applyFilter();
            } else {
                if (filterParameters[filter].length != 0) {
                    var found = $filter('filter')(vm.dimensions, { 'name': filter })[0];
                    found.selected = [];
                    found.selected2 = [];
                    filterParameters[filter] = [];
                    filterParametersService.save(filterParameters);
                    applyFilter();
                }
            }
        }

        function isString(filter) {
            return typeof filter === 'string' || filter instanceof String;
        }

        function isTagExist(tag) {
            var filterParameters = filterParametersService.get();
            var tag = $filter('filter')(filterParameters[vm.dimension.name], tag['text']);
            return tag == undefined ? false : true;
        }


        function applyFilter() {
            FilterStateManagerService.add(angular.copy(filterParametersService.get()));
            $rootScope.$broadcast('flairbiApp:filter');
        }

        function load(q, dimension) {
            var vId = $stateParams.id ? $stateParams.id : $stateParams.visualisationId;
            var query = {};
            query.fields = [{ name: dimension.name }];
            if (!vm.lastQuery.filterDimension || (vm.lastQuery.filterKey!==q) || q === "") {
                if (q) {
                    query.conditionExpressions = [{
                        sourceType: 'FILTER',
                        conditionExpression: {
                            '@type': 'Like',
                            featureType: { featureName: dimension.name, type: dimension.type },
                            caseInsensitive: true,
                            value: q
                        }
                    }];
                }
                query.distinct = true;
                query.limit = 100;
                favouriteFilterService.setFavouriteFilter(isFavouriteFilter());
                proxyGrpcService.forwardCall(
                    vm.view.viewDashboard.dashboardDatasource.id, {
                    queryDTO: query,
                    vId: vId,
                    type: $stateParams.id ? 'filters' : 'share-link-filter'
                },
                    $stateParams.id ? $stateParams.id : $stateParams.viewId
                );

                vm.lastQuery.filterKey=q;
                vm.lastQuery.filterDimension=dimension.id;
            }

        }

        function isFavouriteFilter() {
            return vm.tab === 'widgets' ? true : false
        }

        function removed(tag) {
            filterParametersService.saveSelectedFilter(removeTagFromFilterList(filterParametersService.getSelectedFilter(), tag));
        }

        function removeTagFromFilterList(filterParameters, tag) {
            var array = filterParameters[vm.dimension.name] ? filterParameters[vm.dimension.name.toLowerCase()] : filterParameters[vm.dimension.name];
            if (array) {
                var index = array.indexOf(tag['text']);
                if (index > -1) {
                    array.splice(index, 1);
                    filterParameters[vm.dimension.name] = array;
                    if (filterParameters[vm.dimension.name].length == 0)
                        delete filterParameters[vm.dimension.name];
                    return filterParameters;
                }
            }
            return filterParameters;
        }

        function removeTagFromSelectedList(tag) {
            var index = -1;
            vm.dimension.selected.some(function (obj, i) {
                return obj.text === tag['text'] ? index = i : false;
            });
            if (index > -1) {
                vm.dimension.selected.splice(index, 1);
            }
        }

        function refresh() {
            var myFilters = filterParametersService.get()[vm.dimension.name] || filterParametersService.get()[vm.dimension.name.toLowerCase()];
            if (myFilters && myFilters.length > 0) {
                if(myFilters._meta.valueType !== "dateRangeValueType"){
                    vm.dimension.selected = myFilters.map(function (item) {
                        var newItem = {};
                        newItem['text'] = item;
                        if (isFavouriteFilter())
                            displaySelectedFilterAtTop(vm.list[vm.dimension.name], vm.list[vm.dimension.name].indexOf(item), myFilters[vm.dimension.name].length - 1);
                        return newItem;
                    });
                }
            } else {
                if (filterParametersService.isDateType(vm.dimension)) {
                    vm.dimension.selected = null;
                    vm.dimension.selected2 = null;
                } else {
                    vm.dimension.selected = [];
                    vm.dimension.selected2 = [];
                }
            }
            if(myFilters){
                addFilterInIframeURL();
            }
            $rootScope.$broadcast("flairbiApp:update-heder-filter");
        }

        function addFilterInIframeURL() {
            Views.getCurrentEditState({
                id: $stateParams.id
            },
                function (result, headers) {
                    vm.iFrames = result.visualMetadataSet.filter(function (item) {
                        return item.metadataVisual.name === IFRAME.iframe;
                    })
                    filterParametersService.setFilterInIframeURL(vm.iframes, vm.dimension);
                }
            );
        }

        function added(tag) {
            var filterParameters = filterParametersService.getSelectedFilter();
            if (!filterParameters[vm.dimension.name]) {
                filterParameters[vm.dimension.name] = [];
            }
            filterParameters[vm.dimension.name].push(tag['text']);
            filterParameters[vm.dimension.name]._meta = {
                dataType: vm.dimension.type,
                valueType: 'valueType'
            };
            filterParametersService.saveSelectedFilter(filterParameters);
            if (isFavouriteFilter())
                displaySelectedFilterAtTop(vm.list[vm.dimension.name], vm.list[vm.dimension.name].indexOf(tag['text']), filterParameters[vm.dimension.name].length - 1);
        }

        function addDateRangeFilter(date) {
            var filterParameters = filterParametersService.getSelectedFilter();
            if (!filterParameters[vm.dimension.name]) {
                filterParameters[vm.dimension.name] = [];
            }
            filterParameters[vm.dimension.name].push(date);
            filterParameters[vm.dimension.name]._meta = {
                dataType: vm.dimension.type,
                valueType: 'dateRangeValueType'
            };
            filterParametersService.saveSelectedFilter(filterParameters);
        }

        function displaySelectedFilterAtTop(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                var k = new_index - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        }

        function setSelectedFilter() {
            var filterParameters = filterParametersService.getSelectedFilter()[vm.dimension.name]
            if (filterParameters) {
                if (vm.list[vm.dimension.name] && vm.list[vm.dimension.name]) {
                    var selectedFilter = vm.list[vm.dimension.name].filter(function (item) {
                        return filterParameters.indexOf(item) !== -1
                    })
                    var unSelectedFilter = vm.list[vm.dimension.name].filter(function (item) {
                        return filterParameters.indexOf(item) === -1
                    })
                    vm.list[vm.dimension.name] = selectedFilter.concat(unSelectedFilter);
                }
            }
        }

        function displayTextboxForValues(dimension) {
            vm.filterDimension = dimension;
            vm.isCommaSeparatedInput = !vm.isCommaSeparatedInput;
            if(vm.dimension.selected && vm.dimension.selected.length>0){
                vm.dimension.commaSeparatedValues = vm.dimension.selected.map(function(elem){
                    return elem.text;
                }).join(getSeparator());
            }
            vm.commaSeparatedToolTip =  VisualDispatchService.setcommaSeparatedToolTip(vm.isCommaSeparatedInput);
        }
        function addToFilter(dimension) {
            if (vm.dimension.commaSeparatedValues && vm.dimension.commaSeparatedValues.length > 0) {
                vm.isCommaSeparatedInput = false;
                vm.activeForText = "active";
                vm.dimension.selected = [];
                var filterParameters = filterParametersService.getSelectedFilter();
                filterParameters[vm.dimension.name] = [];
                var getList = vm.dimension.commaSeparatedValues.split(getSeparator());
                getList = getList.filter((item, i, ar) => ar.indexOf(item) === i);
                getList.forEach(element => {
                    added({ text: element });
                    vm.dimension.selected.push({ text: element });
                });
                vm.commaSeparatedToolTip =  VisualDispatchService.setcommaSeparatedToolTip(vm.isCommaSeparatedInput);
            }
        }

        function getSeparator(){
            return vm.separator ? vm.separator.value : ",";
        }
        function toggelPinDimension(dimension){
            Features.markPinFilter({
                id: dimension.id, pin: !vm.dimension.pin
            },
                function (result) {
                    vm.dimension.pin = !vm.dimension.pin;
                    var info = {
                         text: $translate.instant(vm.dimension.pin === true ? 'flairbiApp.pinedDimensions' : 'flairbiApp.unPinedDimensions'),
                         title: "Saved" 
                    }
                    $rootScope.showSuccessToast(info);
                    $rootScope.$broadcast("flairbiApp:toggle-headers-pin-filters");
                }, function (err) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }
        function toggleHeaderFilter(dimension) {
            if(dimension.pin){
                toggelPinDimension(dimension);
            }
            else{
                if(getPinedDimensionsCount().length < 5 ){
                    toggelPinDimension(dimension);
                }
                else{
                    var info = {
                        text: $translate.instant('flairbiApp.pinedDimensionsError'),
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                }
            }
        }
        function getPinedDimensionsCount(){
            return vm.dimensions.filter(function (item) {
                return item.pin === true
            });
        }
    }
})();