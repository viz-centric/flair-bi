// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .directive('hasAuthority', hasAuthority);

hasAuthority.$inject = ['Principal'];

export const name = 'hasAuthority';
export function hasAuthority(Principal) {
    var directive = {
        restrict: 'A',
        link: linkFunc
    };

    return directive;

    function linkFunc(scope, element, attrs) {
        var authority = attrs.hasAuthority.replace(/\s+/g, '');

        var setVisible = function () {
            element.removeClass('hidden');
        },
            setHidden = function () {
                element.addClass('hidden');
            },
            defineVisibility = function (reset) {

                if (reset) {
                    setVisible();
                }

                Principal.hasAuthority(authority)
                    .then(function (result) {
                        if (result) {
                            setVisible();
                        } else {
                            setHidden();
                        }
                    });
            };

        if (authority.length > 0) {
            defineVisibility(true);

            scope.$watch(function () {
                return Principal.isAuthenticated();
            }, function () {
                defineVisibility(true);
            });
        }
    }
}
