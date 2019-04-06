
/**
 * This directive is user to check for userType. This directive can be used to show 
 * html elements for internal users only. This is used for password settings view, where
 * user can change the password. So for this in Flair BI we have restricted only for internal
 * users(users present in application db).
 */
import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .directive('userType', userType);

userType.$inject = ['Principal'];

function userType(Principal) {
    var directive = {
        restrict: 'A',
        link: linkFunc
    };

    return directive;

    function linkFunc(scope, element, attrs) {
        var userType = attrs.userType.replace(/\s+/g, '');
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

                Principal.isInternalUser(userType)
                    .then(function (result) {
                        if (result) {
                            setVisible();
                        } else {
                            setHidden();
                        }
                    });
            };

        defineVisibility(true);
        scope.$watch(function () {
            return Principal.isAuthenticated();
        }, function () {
            defineVisibility(true);
        });
    }
}