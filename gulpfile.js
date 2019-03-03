// Generated on 2017-01-04 using generator-jhipster 3.12.2
'use strict';

var gulp = require('gulp'),
    rev = require('gulp-rev'),
    templateCache = require('gulp-angular-templatecache'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    ngConstant = require('gulp-ng-constant'),
    rename = require('gulp-rename'),
    eslint = require('gulp-eslint'),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    KarmaServer = require('karma').Server,
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    gulpIf = require('gulp-if');

var handleErrors = require('./gulp/handle-errors'),
    serve = require('./gulp/serve'),
    util = require('./gulp/utils'),
    copy = require('./gulp/copy'),
    inject = require('./gulp/inject'),
    build = require('./gulp/build'),
    customStyles = require('./gulp/custom-scss');

var config = require('./gulp/config');

gulp.task('clean', function () {
    return del([config.dist], {
        dot: true
    });
});

gulp.task('copy', ['copy:i18n', 'copy:fonts', 'copy:common']);

gulp.task('copy:i18n', copy.i18n);

gulp.task('copy:languages', copy.languages);

gulp.task('copy:fonts', copy.fonts);

gulp.task('copy:common', copy.common);

gulp.task('copy:swagger', copy.swagger);

gulp.task('copy:images', copy.images);

gulp.task('images', function () {
    return gulp.src(config.app + 'content/images/**')
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(changed(config.dist + 'content/images'))
        .pipe(imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(rev())
        .pipe(gulp.dest(config.dist + 'content/images'))
        .pipe(rev.manifest(config.revManifest, {
            base: config.dist,
            merge: true
        }))
        .pipe(gulp.dest(config.dist))
        .pipe(browserSync.reload({
            stream: true
        }));
});


gulp.task('styles', [], function () {
    return gulp.src(config.app + 'content/css')
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('inject', function () {
    runSequence('inject:dep', 'inject:app');
});

gulp.task('inject:dep', ['inject:test', 'inject:vendor']);

gulp.task('inject:app', inject.app);

gulp.task('inject:vendor', inject.vendor);

gulp.task('inject:test', inject.test);

gulp.task('inject:troubleshoot', inject.troubleshoot);

gulp.task('assets:prod', ['images', 'styles', 'html', 'copy:swagger', 'copy:images'], build);

gulp.task('html', function () {
    return gulp.src(config.app + 'app/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(templateCache({
            module: 'flairbiApp',
            root: 'app/',
            moduleSystem: 'IIFE'
        }))
        .pipe(gulp.dest(config.tmp));
});

var sharedConstants = {
    constants: {
        PERMISSION_TYPES: {
            APPLICATION: "APPLICATION",
            DASHBOARD: "DASHBOARD",
            VIEW: "VIEW"
        },
        ROLES: {
            ROLE_ADMIN: "ROLE_ADMIN",
			ROLE_DEVELOPMENT: "ROLE_DEVELOPMENT",
			ROLE_USER: "ROLE_USER"
        },
        PERMISSIONS: {
            READ_USER_MANAGEMENT: "READ_USER-MANAGEMENT_APPLICATION",
            WRITE_USER_MANAGEMENT: "WRITE_USER-MANAGEMENT_APPLICATION",
            UPDATE_USER_MANAGEMENT: "UPDATE_USER-MANAGEMENT_APPLICATION",
            DELETE_USER_MANAGEMENT: "DELETE_USER-MANAGEMENT_APPLICATION",
            READ_APPLICATION_METRICS: "READ_APPLICATION-METRICS_APPLICATION",
            READ_HEALTH_CHECKS: "READ_HEALTH-CHECKS_APPLICATION",
            READ_CONFIGURATION: "READ_CONFIGURATION_APPLICATION",
            READ_AUDITS: "READ_AUDITS_APPLICATION",
            READ_LOGS: "READ_LOGS_APPLICATION",
            UPDATE_LOGS: "UPDATE_LOGS_APPLICATION",
            READ_API: "READ_API_APPLICATION",
            READ_DATABASE: "READ_DATABASE_APPLICATION",
            READ_PERMISSION_MANAGEMENT: "READ_PERMISSION-MANAGEMENT_APPLICATION",
            UPDATE_PERMISSION_MANAGEMENT: "UPDATE_PERMISSION-MANAGEMENT_APPLICATION",
            READ_DASHBOARDS: "READ_DASHBOARDS_APPLICATION",
            WRITE_DASHBOARDS: "WRITE_DASHBOARDS_APPLICATION",
            READ_CONNECTIONS: "READ_CONNECTIONS_APPLICATION",
            WRITE_CONNECTIONS: "WRITE_CONNECTIONS_APPLICATION",
            READ_VISUAL_METADATA: "READ_VISUAL-METADATA_APPLICATION",
            WRITE_VISUAL_METADATA: "WRITE_VISUAL-METADATA_APPLICATION",
            READ_DATASOURCES: 'READ_DATASOURCES_APPLICATION',
            WRITE_DATASOURCES: 'WRITE_DATASOURCES_APPLICATION',
            UPDATE_DATASOURCES: 'UPDATE_DATASOURCES_APPLICATION',
            DELETE_DATASOURCES: 'DELETE_DATASOURCES_APPLICATION',
            READ_DRILLDOWN: 'READ_DRILLDOWN_APPLICATION',
            WRITE_DRILLDOWN: 'WRITE_DRILLDOWN_APPLICATION',
            UPDATE_DRILLDOWN: 'UPDATE_DRILLDOWN_APPLICATION',
            DELETE_DRILLDOWN: 'DELETE_DRILLDOWN_APPLICATION',
        	READ_VISUALIZATIONS: 'READ_VISUALIZATIONS_APPLICATION',
        	WRITE_VISUALIZATIONS: 'WRITE_VISUALIZATIONS_APPLICATION',
        	UPDATE_VISUALIZATIONS: 'UPDATE_VISUALIZATIONS_APPLICATION',
        	DELETE_VISUALIZATIONS: 'DELETE_VISUALIZATIONS_APPLICATION',
        	WRITE_FILE_UPLOADER: "WRITE_FILE_UPLOADER_APPLICATION",
        	READ_VISUALIZATION_COLORS:"READ_VISUALIZATION_COLORS_APPLICATION",
        	WRITE_VISUALIZATION_COLORS:"WRITE_VISUALIZATION_COLORS_APPLICATION",
        	UPDATE_VISUALIZATION_COLORS:"UPDATE_VISUALIZATION_COLORS_APPLICATION",
        	DELETE_VISUALIZATION_COLORS:"DELETE_VISUALIZATION_COLORS_APPLICATION"
        	
        },
        CONDITION_TYPES: [{
            displayName: "Or",
            '@type': "Or",
            type: "composite"
        }, {
            displayName: "Between",
            '@type': "Between",
            type: "simple",
        }, {
            displayName: 'Compare',
            '@type': "Compare",
            type: 'simple'
        }, {
            displayName: 'And',
            '@type': 'And',
            type: 'composite'
        }, {
            displayName: 'Contains',
            '@type': 'Contains',
            type: 'simple'
        }, {
            displayName: 'Not Contains',
            '@type': 'NotContains',
            type: 'simple'
        }, {
            displayName: 'Like',
            '@type': 'Like',
            type: 'simple'
        }],
        COMPARE_TYPES: [{
            displayName: "==",
            value: 'EQ'
        }, {
            displayName: '!=',
            value: 'NEQ'
        }, {
            displayName: '>',
            value: 'GT'
        }, {
            displayName: '<',
            value: 'LT'
        }, {
            displayName: '>=',
            value: 'GTE'
        }, {
            displayName: '<=',
            value: 'LTE'
        }],
        'FILTER_TYPES': {
            BASE: 'BASE',
            FILTER: 'FILTER',
            REDUCTION: 'REDUCTION'
        }
    }
};

gulp.task('ngconstant:dev', function () {
    var devConstants = {
        name: 'flairbiApp',
        constants: {
            VERSION: util.parseVersion(),
            DEBUG_INFO_ENABLED: true,
        },
        template: config.constantTemplate,
        stream: true
    };
    devConstants.constants = Object.assign(devConstants.constants, sharedConstants.constants);
    return ngConstant(devConstants)
        .pipe(rename('app.constants.js'))
        .pipe(gulp.dest(config.app + 'app/'));
});

gulp.task('ngconstant:prod', function () {
    var prodConstants = {
        name: 'flairbiApp',
        constants: {
            VERSION: util.parseVersion(),
            DEBUG_INFO_ENABLED: false,
        },
        template: config.constantTemplate,
        stream: true
    };
    prodConstants.constants = Object.assign(prodConstants.constants, sharedConstants.constants);
    return ngConstant(prodConstants)
        .pipe(rename('app.constants.js'))
        .pipe(gulp.dest(config.app + 'app/'));
});

// check app for eslint errors
gulp.task('eslint', function () {
    return gulp.src(['gulpfile.js', config.app + 'app/**/*.js'])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

// check app for eslint errors anf fix some of them
gulp.task('eslint:fix', function () {
    return gulp.src(config.app + 'app/**/*.js')
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(util.isLintFixed, gulp.dest(config.app + 'app')));
});

gulp.task('test', ['inject:test', 'ngconstant:dev'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/' + config.test + 'karma.conf.js',
        singleRun: true
    }, done).start();
});


gulp.task('watch', function () {
    gulp.watch('bower.json', ['install']);
    gulp.watch(['gulpfile.js', 'pom.xml'], ['ngconstant:dev']);
    gulp.watch(config.app + 'content/css/**/*.css', ['styles']);
    gulp.watch(config.app + 'content/images/**', ['images']);
    gulp.watch(config.app + 'app/**/*.js', ['inject:app']);
    gulp.watch([config.app + '*.html', config.app + 'app/**', config.app + 'i18n/**']).on('change', browserSync.reload);
    gulp.watch(config.customStyles + '/**/*.scss', ['customStyles']);
});

gulp.task('install', function () {
    runSequence(['inject:dep', 'ngconstant:dev'], 'copy:languages', 'inject:app', 'inject:troubleshoot');
});

gulp.task('serve', ['install'], serve);

gulp.task('build', ['clean'], function (cb) {
    runSequence(['copy', 'inject:vendor', 'ngconstant:prod', 'copy:languages'], 'inject:app', 'inject:troubleshoot', 'assets:prod', cb);
});

gulp.task('default', ['serve']);

// This task is used to compile custom scss files to form custom.css
gulp.task('customStyles', customStyles);
