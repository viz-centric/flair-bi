(function() {
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
            "angular-cron-gen",
            "ngFileUpload",
            "angular-cron-generator"
            // jhipster-needle-angularjs-add-module JHipster will add new module here
        ])
        .config(angularThemingConfig)
        .run(run);

    run.$inject = [
        "stateHandler",
        "translationHandler",
        "$rootScope",
        "$window"
    ];
    angularThemingConfig.$inject = ["$mdThemingProvider"];

    function run(stateHandler, translationHandler, $rootScope, $window) {
        stateHandler.initialize();
        translationHandler.initialize();
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
        // possible values grpc and http
        $rootScope.vizualizationServiceMode = "grpc";

        //toaster configurations
        toastr.options = {
          "closeButton": true,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-top-right",
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

        $rootScope.showSuccessToast = function(info) {
            toastr.success(info.text, info.title);
        };
        $rootScope.showInfoToast = function(info) {
            toastr.info(info.title);
        };
        $rootScope.showWarningToast = function(info) {
            toastr.warning(info.text, info.title);
        };
        $rootScope.showErrorToast = function(info) {
            var toastrBody = $rootScope.buildToastrBody(info.text);
            toastr.error(toastrBody, info.title);
        };
        $rootScope.buildToastrBody = function(infoText) {
            var toastrBody = '';
            infoText.forEach(function(item, index) {
                toastrBody = toastrBody + item + "<br>";
            });
            return toastrBody;
        };
        $rootScope.showErrorSingleToast = function(info) {
            toastr.error(info.text, info.title);
        };

        $rootScope.$on("$stateChangeStart", function(
            event,
            toState,
            toParams,
            fromState,
            fromParams,
            options
        ) {
            $rootScope.noIframe =
                toState.name == "flair-integration" ? false : true;
            if (toState.name == "data-exploration") {
                $rootScope.noIframe = false;
            }
            $rootScope.exploration =
                toState.name == "data-exploration" ? true : false;
        });

        $rootScope.$on("$stateChangeStart", function(
            event,
            toState,
            toParams,
            fromState,
            fromParams,
            options
        ) {
            $rootScope.extraction =
                toState.name == "data-extraction" ? true : false;
        });

        $rootScope.integerFormater = function(n, c, d, t, v) {
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

        $rootScope.percentConversion = function(n, c) {
            var c = c == undefined ? 2 : c,
                v = (n * 100).toFixed(c);
            return v.toString() + "%";
        };
    }

    function angularThemingConfig($mdThemingProvider) {
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
    }
})();
