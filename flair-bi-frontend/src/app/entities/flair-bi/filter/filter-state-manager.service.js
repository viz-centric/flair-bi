(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('FilterStateManagerService', FilterStateManagerService);

    FilterStateManagerService.$inject = [];

    function FilterStateManagerService() {

        var index = -1;
        var queue = [{}];

        var configuration = {
            limit: 5
        }

        var service = {
            add: add,
            next: next,
            previous: previous,
            hasNext: hasNext,
            hasPrevious: hasPrevious,
            current: current
        };

        return service;

        ////////////////

        function add(filter) {
            if(!angular.equals(filter, {})){
                if (queue.length > configuration.limit - 1) {
                    queue.slice(index - configuration.limit + 1, index + 1);
                }
                queue.push(filter);
                index = queue.length - 1;
            }
        }

        function current() {
            return queue[index];
        }

        function next() {
            if (hasNext()) {
                index += 1;
                return queue[index];
            } else {
                return undefined;
            }
        }

        function previous() {
            if (hasPrevious()) {
                index -= 1;
                return queue[index];
            } else {
                return undefined;
            }
        }

        function hasNext() {
            return queue[index + 1];
        }

        function hasPrevious() {
            return queue[index - 1];
        }
    }
})();
