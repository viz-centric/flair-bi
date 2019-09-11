(function () {
    'use strict';

    var jhiAlertError = {
        template: '<div class="alerts" ng-cloak="">' +
        '<div ng-repeat="alert in $ctrl.alerts" ng-class="[alert.position, {\'toast\': alert.toast}]">' +
        '<uib-alert ng-cloak="" type="{{alert.type}}" close="alert.close($ctrl.alerts)"><pre>{{ alert.msg }}</pre></uib-alert>' +
        '</div>' +
        '</div>',
        controller: jhiAlertErrorController
    };

    angular
        .module('flairbiApp')
        .component('jhiAlertError', jhiAlertError);

    jhiAlertErrorController.$inject = ['$scope', 'AlertService', '$rootScope', '$translate'];

    function jhiAlertErrorController($scope, AlertService, $rootScope, $translate) {
        var vm = this;

        vm.alerts = [];

        function addErrorAlert(message, key, data) {
            key = key ? key : message;
            vm.alerts.push(
                AlertService.add(
                    {
                        type: 'danger',
                        msg: key,
                        params: data,
                        timeout: 5000,
                        toast: AlertService.isToast(),
                        scoped: true
                    },
                    vm.alerts
                )
            );
        }

        var cleanHttpErrorListener = $rootScope.$on('flairbiApp.httpError', function (event, httpResponse) {
            var i;
            event.stopPropagation();
            switch (httpResponse.status) {
                // connection refused, server not reachable
                case 0:
                    addErrorAlert('error.server.not.reachable');
                    break;

                case 400:
                    var headers = Object.keys(httpResponse.headers()).filter(function (header) {
                        return header.indexOf('app-error', header.length - 'app-error'.length) !== -1 || header.indexOf('app-params', header.length - 'app-params'.length) !== -1;
                    }).sort();
                    var errorHeader = httpResponse.headers(headers[0]);
                    var entityKey = httpResponse.headers(headers[1]);
                    if (errorHeader && typeof entityKey === 'string') {
                        var entityName = $translate.instant('global.menu.entities.' + entityKey);
                        addErrorAlert(errorHeader, errorHeader, {entityName: entityName});
                    } else if (httpResponse.data && httpResponse.data.fieldErrors) {
                        for (i = 0; i < httpResponse.data.fieldErrors.length; i++) {
                            var fieldError = httpResponse.data.fieldErrors[i];
                            // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
                            var convertedField = fieldError.field.replace(/\[\d*\]/g, '[]');
                            var fieldName = $translate.instant('flairbiApp.' + fieldError.objectName + '.' + convertedField);
                            var defaultMessage = 'Field ' + fieldName + ' cannot be empty';
                            var featureSpecificText = 'flairbiApp.' + fieldError.objectName + '.error.' + convertedField + '.' + fieldError.message;
                            var errorKey = 'error.' + fieldError.message;
                            if ($translate.instant(featureSpecificText)) {
                                errorKey = featureSpecificText;
                            }
                            addErrorAlert(defaultMessage, errorKey, {fieldName: fieldName});
                        }
                    } else if (httpResponse.data && httpResponse.data.message) {
                        addErrorAlert(httpResponse.data.message, httpResponse.data.message, httpResponse.data);
                    } else {
                        addErrorAlert('error.generic');
                    }
                    break;

                case 404:
                    addErrorAlert('error.url.not.found');
                    break;

                default:
                    if (httpResponse.data && httpResponse.data.message) {
                        addErrorAlert(httpResponse.data.message);
                    } else {
                        addErrorAlert('error.generic');
                    }
            }
        });

        $scope.$on('$destroy', function () {
            if (angular.isDefined(cleanHttpErrorListener) && cleanHttpErrorListener !== null) {
                cleanHttpErrorListener();
                vm.alerts = [];
            }
        });
    }
})();
