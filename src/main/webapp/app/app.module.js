(function () {
    "use strict";

    angular
        .module("flairbiApp", [
            "angular-jwt",
            "ngStorage",
            "tmh.dynamicLocale",
            "pascalprecht.translate",
            "ngResource",
            "ngCookies",
            "ngAria",
            "ngCacheBuster",
            "ngFileUpload",
            "ui.bootstrap",
            "ui.select",
            "ui.bootstrap.datetimepicker",
            "oc.lazyLoad",
            "ui.router",
            "infinite-scroll",
            "minicolors",
            "shagstrom.angular-split-pane",
            "gridstack-angular",
            "ngTagsInputGrpc",
            "ngTagsInput",
            "ngSanitize",
            "pageslide-directive",
            "ui.tree",
            "mgo-angular-wizard",
            "ngMaterial",
            "mdColorPicker",
            "angular.filter",
            "dndLists",
            "rzModule",
            "angular.filter",
            "angularUtils.directives.uiBreadcrumbs",
            "ngFileUpload",
            "angular-cron-generator",
            "angularjs-dropdown-multiselect"
            // jhipster-needle-angularjs-add-module JHipster will add new module here
        ])
        .config(angularThemingConfig)
        .run(run);

    run.$inject = [
        "stateHandler",
        "translationHandler",
        "$rootScope",
        "$window",
        'authHandler'
    ];
    angularThemingConfig.$inject = ["$mdThemingProvider", "$mdDateLocaleProvider"];

    function run(stateHandler, translationHandler, $rootScope, $window, authHandler) {
        stateHandler.initialize();
        translationHandler.initialize();
        authHandler.initialize();
        $rootScope.noIframe =
            $window.location.href.indexOf("flair-integration") < 0
                ? true
                : false;
        $rootScope.obj = [];
        $rootScope.drilldowns = [];
        $rootScope.vizsel = [];
        $rootScope.currSelections = [];
        $rootScope.fListAll = [];
        $rootScope.hierNames = [];
        $rootScope.filterSelection = {
            id: null,
            lasso: false,
            filter: {}
        };
        $rootScope.isLiveState = false;
        /* Persistence */
        /*
         *   {
         *       "<id>": {
         *           "sort": {
         *               "type": <sort_type>,
         *               "measure": <measure>
         *           }
         *       }
         *   }
        */
        $rootScope.persistence = {};
        /* Update Widget */
        /*
         *   {
         *       "<id>": <visualization_instance>
         *   }
        */
        $rootScope.updateWidget = {};
        $rootScope.enableEdit = false;
        $rootScope.hideHeader = false;
        $rootScope.isFullScreen = false;
        $rootScope.isAdmin = false;
        $rootScope.appProperies = {
            "maxDataFileSize": "0",
            "maxImageSize": "0"
        };

        $rootScope.dateRange = {}
        // possible values grpc and http
        $rootScope.vizualizationServiceMode = "grpc";

        $rootScope.isThresholdAlert = false;
        $rootScope.ThresholdViz = {};
        $rootScope.activePage = {
            visualizationID: '',
            activePageNo: 0
        };

        //toaster configurations
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-bottom-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }

        /** Methods for toaster notifications */

        $rootScope.showSuccessToast = function (info) {
            toastr.options.preventDuplicates = false;
            toastr.success(info.text, info.title);
        };
        $rootScope.showInfoToast = function (info) {
            toastr.options.preventDuplicates = false;
            toastr.info(info.title);
        };
        $rootScope.showWarningToast = function (info) {
            toastr.options.preventDuplicates = false;
            toastr.warning(info.text, info.title);
        };
        $rootScope.showWarningToastForDateFilter = function (info) {
            toastr.options.preventDuplicates = true;
            toastr.warning(info.text, info.title);
        };
        $rootScope.showErrorToast = function (info) {
            toastr.options.preventDuplicates = false;
            var toastrBody = $rootScope.buildToastrBody(info.text);
            toastr.error(toastrBody, info.title);
        };
        $rootScope.buildToastrBody = function (infoText) {
            var toastrBody = '';
            infoText.forEach(function (item, index) {
                toastrBody = toastrBody + item + "<br>";
            });
            return toastrBody;
        };
        $rootScope.showErrorSingleToast = function (info) {
            toastr.options.preventDuplicates = false;
            toastr.error(info.text, info.title);
        };

        $rootScope.integerFormater = function (n, c, d, t, v) {
            var c = isNaN((c = Math.abs(c))) ? 2 : c,
                d = d == undefined ? "." : d,
                t = t == undefined ? "," : t,
                v = v == undefined ? "" : v,
                s = n < 0 ? "-" : "",
                i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
                j = (j = i.length) > 3 ? j % 3 : 0;
            return (
                s +
                v +
                (j ? i.substr(0, j) + t : "") +
                i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
                (c
                    ? d +
                    Math.abs(n - i)
                        .toFixed(c)
                        .slice(2)
                    : "")
            );
        };

        $rootScope.percentConversion = function (n, c) {
            var c = c == undefined ? 2 : c,
                v = (n * 100).toFixed(c);
            return v.toString() + "%";
        };
    }

    function angularThemingConfig($mdThemingProvider, $mdDateLocaleProvider) {
        $mdThemingProvider
            .theme("default")
            .primaryPalette("blue", {
                default: "700",
                "hue-1": "100",
                "hue-2": "600",
                "hue-3": "A100"
            })
            .accentPalette("blue", {
                default: "200"
            });

        $mdDateLocaleProvider.formatDate = function (date) {
            var m = moment(date);
            return m.isValid() ? m.format('YYYY-MM-DD') : '';
        };
    }
})();
