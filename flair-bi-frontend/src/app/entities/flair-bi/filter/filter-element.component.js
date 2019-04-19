import * as angular from 'angular';

import filterElementComponentHtml from './filter-element.component.html';

'use strict';

angular
    .module('flairbiApp')
    .component('filterElementComponent', {
        template: filterElementComponentHtml,
        controller: filterElementController,
        controllerAs: 'vm',
        bindings: {
            dimension: '=',
            view: '=',
            dimensions: '='
        }
    });

filterElementController.$inject = ['$scope', 'proxyService', 'filterParametersService', '$timeout', 'FilterStateManagerService', '$rootScope', '$filter'];

function filterElementController($scope, proxyService, filterParametersService, $timeout, FilterStateManagerService, $rootScope, $filter) {
    var vm = this;

    vm.$onInit = activate;
    vm.load = load;
    vm.added = added;
    vm.removed = removed;
    vm.datePickerOpenStatus = {};
    vm.openCalendar = openCalendar;


    ////////////////

    function activate() {
        var unsub = $scope.$on('flairbiApp:filter-input-refresh', function (e) {
            refresh();
        });

        $scope.$on('$destroy', unsub);
        registerRemoveTag();
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
            applyFilter();
        }
    }

    function processRemoveFilter(filter) {
        var filterParameters = filterParametersService.get();
        if (filterParameters[filter].length != 0) {
            $filter('filter')(vm.dimensions, {'name': filter})[0].selected = [];
            filterParameters[filter] = [];
            filterParametersService.save(filterParameters);
            applyFilter();
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

    function openCalendar(date) {
        vm.datePickerOpenStatus[date] = true;
    }

    function load(q, dimension) {
        var query = {};

        query.fields = [dimension.name];
        if (q) {
            query.conditionExpressions = [{
                sourceType: 'FILTER',
                conditionExpression: {
                    '@type': 'Like',
                    featureName: dimension.name,
                    value: q
                }
            }];
        }
        query.distinct = true;

        return proxyService.forwardCall(
            vm.view.viewDashboard.dashboardDatasource.id, {
                queryDTO: query
            }
        ).then(function (result) {
            var retVal = result.data.data.map(function (item) {
                return item[dimension.name.toLowerCase()];
            });
            return retVal;
        }, function (reason) {
            return [];
        });
    }

    function removed(tag) {
        var filterParameters = filterParametersService.get();
        var array = filterParameters[vm.dimension.name] == undefined ? filterParameters[vm.dimension.name.toLowerCase()] : filterParameters[vm.dimension.name];
        var index = array.indexOf(tag['text']);
        if (index > -1) {
            array.splice(index, 1);
        }

        filterParametersService.save(filterParameters);
    }

    function removeTagFromSelectedList(tag) {
        var index = -1;
        vm.dimension.selected.some(function (obj, i) {
            return obj.text === tag['text'] ? index = i : false;
        });
        //var index = vm.dimension.selected.indexOf(tag);
        if (index > -1) {
            vm.dimension.selected.splice(index, 1);
        }
    }

    function refresh() {
        var myFilters = filterParametersService.get()[vm.dimension.name] || filterParametersService.get()[vm.dimension.name.toLowerCase()];
        if (myFilters && myFilters.length > 0) {
            vm.dimension.selected = myFilters.map(function (item) {
                var newItem = {};
                newItem['text'] = item;
                return newItem;
            });
        } else {
            vm.dimension.selected = [];
        }
    }

    function added(tag) {
        var filterParameters = filterParametersService.get();
        if (!filterParameters[vm.dimension.name]) {
            filterParameters[vm.dimension.name] = [];
        }
        filterParameters[vm.dimension.name].push(tag['text']);
        filterParametersService.save(filterParameters);
    }
}
