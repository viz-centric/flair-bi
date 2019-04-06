import * as angular from 'angular';
'use strict';

var jhiItemCount = {
    template: '<div class="info">' +
        'Showing {{(($ctrl.page - 1) * $ctrl.itemsPerPage) == 0 ? 1 : (($ctrl.page - 1) * $ctrl.itemsPerPage + 1)}} - ' +
        '{{($ctrl.page * $ctrl.itemsPerPage) < $ctrl.queryCount ? ($ctrl.page * $ctrl.itemsPerPage) : $ctrl.queryCount}} ' +
        'of {{$ctrl.queryCount}} items.' +
        '</div>',
    bindings: {
        page: '<',
        queryCount: '<total',
        itemsPerPage: '<'
    }
};

angular
    .module('flairbiApp')
    .component('jhiItemCount', jhiItemCount);

