// Karma configuration
// http://karma-runner.github.io/0.13/config/configuration-file.html

var sourcePreprocessors = ['coverage'];

function isDebug() {
    return process.argv.indexOf('--debug') >= 0;
}

if (isDebug()) {
    // Disable JS minification if Karma is run with debug option.
    sourcePreprocessors = [];
}

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        // basePath: 'src/test/javascript/'.replace(/[^/]+/g, '..'),
        basePath: '../../../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            'src/main/webapp/bower_components/jquery/dist/jquery.js',
            'src/main/webapp/bower_components/messageformat/messageformat.js',
            'src/main/webapp/bower_components/bootstrap/dist/js/bootstrap.js',
            'src/main/webapp/bower_components/json3/lib/json3.js',
            'src/main/webapp/bower_components/lodash/lodash.js',
            'src/main/webapp/bower_components/moment/moment.js',
            'src/main/webapp/bower_components/pace/pace.js',
            'src/main/webapp/bower_components/metisMenu/dist/metisMenu.js',
            'src/main/webapp/bower_components/jquery-ui/jquery-ui.js',
            'src/main/webapp/bower_components/gridstack/dist/gridstack.js',
            'src/main/webapp/bower_components/slidereveal/dist/jquery.slidereveal.js',
            'src/main/webapp/bower_components/codemirror/lib/codemirror.js',
            'src/main/webapp/bower_components/jquery-toast-plugin/dist/jquery.toast.min.js',
            'src/main/webapp/bower_components/datatables.net/js/jquery.dataTables.js',
            'src/main/webapp/bower_components/datatables.net-jqui/js/dataTables.jqueryui.js',
            'src/main/webapp/bower_components/toastr/toastr.js',
            'src/main/webapp/bower_components/chart.js/dist/Chart.js',
            'src/main/webapp/bower_components/jquery-minicolors/jquery.minicolors.js',
            'src/main/webapp/bower_components/jquery.sparkline.bower/dist/jquery.sparkline.min.js',
            'src/main/webapp/bower_components/sumoselect/jquery.sumoselect.js',
            'src/main/webapp/bower_components/Split.js/split.js',
            'src/main/webapp/bower_components/split-pane/split-pane.js',
            'src/main/webapp/bower_components/bootstrap-toggle/js/bootstrap-toggle.min.js',
            'src/main/webapp/bower_components/topojson/topojson.js',
            'src/main/webapp/bower_components/leaflet/dist/leaflet-src.js',
            'src/main/webapp/bower_components/Chart.PieceLabel.js/src/Chart.PieceLabel.js',
            'src/main/webapp/bower_components/dom-to-image/src/dom-to-image.js',
            'src/main/webapp/bower_components/pdfmake/build/pdfmake.js',
            'src/main/webapp/bower_components/pdfmake/build/vfs_fonts.js',
            'src/main/webapp/bower_components/tinycolor/tinycolor.js',
            'src/main/webapp/bower_components/sockjs/sockjs.js',
            'src/main/webapp/bower_components/stomp-websocket/lib/stomp.min.js',
            'src/main/webapp/bower_components/cronstrue/dist/cronstrue.js',
            'src/main/webapp/bower_components/angular/angular.js',
            'src/main/webapp/bower_components/angular-aria/angular-aria.js',
            'src/main/webapp/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'src/main/webapp/bower_components/angular-cache-buster/angular-cache-buster.js',
            'src/main/webapp/bower_components/angular-cookies/angular-cookies.js',
            'src/main/webapp/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
            'src/main/webapp/bower_components/ngstorage/ngStorage.js',
            'src/main/webapp/bower_components/angular-resource/angular-resource.js',
            'src/main/webapp/bower_components/angular-sanitize/angular-sanitize.js',
            'src/main/webapp/bower_components/angular-translate/angular-translate.js',
            'src/main/webapp/bower_components/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js',
            'src/main/webapp/bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
            'src/main/webapp/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
            'src/main/webapp/bower_components/angular-ui-router/release/angular-ui-router.js',
            'src/main/webapp/bower_components/bootstrap-ui-datetime-picker/dist/datetime-picker.js',
            'src/main/webapp/bower_components/ng-file-upload/ng-file-upload.js',
            'src/main/webapp/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
            'src/main/webapp/bower_components/angular-animate/angular-animate.js',
            'src/main/webapp/bower_components/angular-touch/angular-touch.js',
            'src/main/webapp/bower_components/angular-messages/angular-messages.js',
            'src/main/webapp/bower_components/oclazyload/dist/ocLazyLoad.js',
            'src/main/webapp/bower_components/angular-native-dragdrop/draganddrop.js',
            'src/main/webapp/bower_components/angular-minicolors/angular-minicolors.js',
            'src/main/webapp/bower_components/angular-split-pane/angular-split-pane.js',
            'src/main/webapp/bower_components/gridstack-angular/dist/gridstack-angular.min.js',
            'src/main/webapp/bower_components/ng-tags-input/ng-tags-input.js',
            'src/main/webapp/bower_components/angular-ui-select/dist/select.js',
            'src/main/webapp/bower_components/angular-pageslide-directive/dist/angular-pageslide-directive.js',
            'src/main/webapp/bower_components/angular-ui-tree/dist/angular-ui-tree.js',
            'src/main/webapp/bower_components/angular-wizard/dist/angular-wizard.js',
            'src/main/webapp/bower_components/angular-material/angular-material.js',
            'src/main/webapp/bower_components/md-color-picker/dist/mdColorPicker.min.js',
            'src/main/webapp/bower_components/angular-filter/dist/angular-filter.js',
            'src/main/webapp/bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
            'src/main/webapp/bower_components/angularjs-slider/dist/rzslider.js',
            'src/main/webapp/bower_components/angular-utils-ui-breadcrumbs/uiBreadcrumbs.js',
            'src/main/webapp/bower_components/angular-jwt/dist/angular-jwt.js',
            'src/main/webapp/bower_components/angular-cron-gen/build/cron-gen.min.js',
            'src/main/webapp/bower_components/angular-cron-generator/dist/angular-cron-generator.min.js',
            'src/main/webapp/bower_components/flair-visualizations/dist/main.bundle.js',
            'src/main/webapp/bower_components/angular-mocks/angular-mocks.js',
            // endbower
            'src/main/webapp/app/app.module.js',
            'src/main/webapp/app/app.state.js',
            'src/main/webapp/app/app.constants.js',
            'src/main/webapp/app/**/*.+(js|html)',
            'src/test/javascript/spec/helpers/i18n.js',
            'src/test/javascript/spec/helpers/module.js',
            'src/test/javascript/spec/helpers/httpBackend.js',
            'src/test/javascript/**/!(karma.conf).js'
        ],


        // list of files / patterns to exclude
        exclude: [],

        preprocessors: {
            './**/*.js': sourcePreprocessors,
            './**/*.html': ['ng-html2js']
        },

        plugins: [
            'karma-ng-html2js-preprocessor',
            'karma-phantomjs-launcher',
            'karma-coverage',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        ngHtml2JsPreprocessor: {
            moduleName: 'templates',
            stripPrefix: 'src/main/webapp/'
        },

        reporters: ['dots', 'junit', 'coverage', 'progress'],

        junitReporter: {
            outputFile: '../target/test-results/karma/TESTS-results.xml'
        },

        coverageReporter: {
            dir: 'target/test-results/coverage',
            reporters: [
                {type: 'lcov', subdir: 'report-lcov'}
            ]
        },

        // web server port
        port: 9876,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        // to avoid DISCONNECTED messages when connecting to slow virtual machines
        browserDisconnectTimeout: 10000, // default 2000
        browserDisconnectTolerance: 1, // default 0
        browserNoActivityTimeout: 4 * 60 * 1000 //default 10000
    });
};
