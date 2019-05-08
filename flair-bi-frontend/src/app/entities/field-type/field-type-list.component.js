import * as angular from 'angular';

import fieldTypeListComponentHtml from './field-type-list.component.html';

"use strict";

angular.module("flairbiApp").component("fieldTypeListComponent", {
    template: fieldTypeListComponentHtml,
    controller: fieldTypeListController,
    controllerAs: "vm",
    bindings: {
        fieldTypes: "="
    }
});

fieldTypeListController.$inject = ["$scope"];

function fieldTypeListController($scope) {
    var vm = this;

    activate();

    ////////////////

    function activate() {
    }
}
