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
    browserSync = require('browser-sync'),
    KarmaServer = require('karma').Server,
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    gulpIf = require('gulp-if'),
    babel = require('gulp-babel'),
    bowerFiles = require('main-bower-files');

var handleErrors = require('./gulp/handle-errors'),
    serve = require('./gulp/serve'),
    util = require('./gulp/utils'),
    copy = require('./gulp/copy'),
    inject = require('./gulp/inject'),
    build = require('./gulp/build'),
    customStyles = require('./gulp/custom-scss'),
    constants = require('./gulp/constants')

var config = require('./gulp/config');

gulp.task('clean', function (done) {
    del([config.dist], {
        dot: true
    });
    done();
});

gulp.task('copy:i18n', copy.i18n);
gulp.task('copy:fonts', copy.fonts);
gulp.task('copy:common', copy.common);
gulp.task('copy:languages', copy.languages);
gulp.task('copy:swagger', copy.swagger);
gulp.task('copy:images', copy.images);

gulp.task('copy', gulp.parallel('copy:i18n', 'copy:fonts', 'copy:common'));



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


gulp.task('styles', function () {
    return gulp.src(config.app + 'content/css')
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('inject:app', inject.app);
gulp.task('inject:vendor', inject.vendor);
gulp.task('inject:test', inject.test);
// gulp.task('inject:troubleshoot', inject.troubleshoot);
gulp.task('inject:dep', gulp.series('inject:test', 'inject:vendor'));

gulp.task('inject', gulp.series('inject:dep', 'inject:app'));

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

gulp.task('assets:prod', gulp.series('images', 'styles', 'html', 'copy:swagger', 'copy:images', build));

gulp.task('ngconstant:dev', function (done) {
    ngConstant(constants.devConstants)
        .pipe(rename('app.constants.js'))
        .pipe(gulp.dest(config.app + 'app/'));
    done();
});



gulp.task('ngconstant:prod', function (done) {
    ngConstant(constants.prodConstants)
        .pipe(rename('app.constants.js'))
        .pipe(gulp.dest(config.app + 'app/'));
    done();
});

// check app for eslint errors
gulp.task('eslint', function (done) {
    gulp.src(['gulpfile.js', config.app + 'app/**/*.js'])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
    done();
});

// check app for eslint errors anf fix some of them
gulp.task('eslint:fix', function (done) {
    gulp.src(config.app + 'app/**/*.js')
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(util.isLintFixed, gulp.dest(config.app + 'app')));
    done();
});

gulp.task('test', gulp.series('inject:test', 'ngconstant:dev'), function (done) {
    new KarmaServer({
        configFile: __dirname + '/' + config.test + 'karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('install', gulp.series('inject:dep', 'ngconstant:dev', 'copy:languages', 'inject:app'));

gulp.task('serve', gulp.series('install', serve));

gulp.task('build', gulp.series('clean', gulp.parallel('copy', 'copy:languages'), 'inject:vendor', 'ngconstant:prod', 'inject:app', 'assets:prod'));

gulp.task('default', gulp.series('serve'));

// This task is used to compile custom scss files to form custom.css
gulp.task('customStyles', customStyles);
