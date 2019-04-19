import * as angular from 'angular';

import informationComponentHtml from './information.component.html';

import flag1 from 'content/svgs/flag1.svg';
import flag2 from 'content/svgs/flag2.svg';
import flag3 from 'content/svgs/flag3.svg';
import flag4 from 'content/svgs/flag4.svg';
import flag5 from 'content/svgs/flag5.svg';

"use strict";

angular.module("flairbiApp").component("informationComponent", {
    template: informationComponentHtml,
    controller: informationController,
    controllerAs: "vm",
    bindings: {
        information: "="
    }
});

informationController.$inject = ["HttpService", "screenDetectService"];

function informationController(HttpService, screenDetectService) {
    const vm = this;
    vm.isDesktop = isDesktop;

    vm.flag1 = flag1;
    vm.flag2 = flag2;
    vm.flag3 = flag3;
    vm.flag4 = flag4;
    vm.flag5 = flag5;

    vm.$onInit = activate;

    ////////////////

    function activate() {
        HttpService.call(
            {
                method: "GET",
                url: vm.information.endPoint
            },
            onCallSuccess,
            onCallError
        );
    }

    function onCallSuccess(result) {
        vm.value = result.data;
    }

    function onCallError() {
    }

    function isDesktop() {
        return screenDetectService.isDesktop();
    }
}
