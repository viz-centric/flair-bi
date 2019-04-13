import * as angular from 'angular';

'use strict';

angular
    .module('flairbiApp')
    .directive('loginStyle', loginStyle);



loginStyle.$inject = [];
export const name = 'loginStyle';
export function loginStyle() {
    // Usage:
    //  Handling styling for login page since it has only one content and it is different from others
    // Creates:
    //  Directive that handles page wrapper style when login route occurs
    var directive = {
        bindToController: true,
        controller: LoginStyleController,
        controllerAs: 'vm',
        link: link,
        restrict: 'A',
        scope: {
            id: '@'
        }
    };
    return directive;

    function link(scope, element, attrs) {

    }
}

LoginStyleController.$inject = ['$scope', '$state'];

function LoginStyleController($scope, $state) {
    var vm = this;
    var padding = $('#' + vm.id).css('padding');
    var margin = $('#' + vm.id).css('margin');
    var classes;

    var states = [{
        state: 'login',
        style: 'login-wallpaper'
    }, {
        state: 'fullscreen',
        style: ''
    }];

    $scope.$watch(function () {
        return $state.current.name;
    }, function (newVal, oldVal) {
        var route = states.filter(function (item) {
            return item.state === newVal;
        });
        if (route.length > 0) {
            $('#' + vm.id).css({
                "padding:": "0",
                "margin": "0"
            });
            classes = route[0].style;
            $('#' + vm.id).addClass(classes);
        } else {
            $('#' + vm.id).css({
                'padding': padding,
                'margin': margin
            });
            if (classes) {
                $('#' + vm.id).removeClass(classes);
            }
        }
    });


}
