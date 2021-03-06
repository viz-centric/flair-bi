'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    inject = require('gulp-inject'),
    naturalSort = require('gulp-natural-sort'),
    angularFilesort = require('gulp-angular-filesort'),
    bowerFiles = require('main-bower-files'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel');

var handleErrors = require('./handle-errors');

var config = require('./config');

module.exports = {
    app: app,
    vendor: vendor,
    test: test,
    troubleshoot: troubleshoot
};


function app() {
    var appStream = gulp.src([
        config.app + 'app/**/*.js',
        config.app + 'content/js/*.js'])
        .pipe(plumber({ errorHandler: handleErrors }))
        .pipe(naturalSort())
        .pipe(angularFilesort())
        .pipe(babel());

    return gulp.src(config.app + 'index.html')
        .pipe(inject(appStream, { relative: true }))
        .pipe(gulp.dest(config.app));
}

function vendor() {
    var vendorStream = gulp.src(bowerFiles(), { read: false });

    return gulp.src(config.app + 'index.html')
        .pipe(plumber({ errorHandler: handleErrors }))
        .pipe(inject(vendorStream, {
            name: 'bower',
            relative: true
        }))
        .pipe(gulp.dest(config.app));
}

function test() {
    return gulp.src(config.test + 'karma.conf.js')
        .pipe(plumber({ errorHandler: handleErrors }))
        .pipe(inject(gulp.src(bowerFiles({ includeDev: true, filter: ['**/*.js'] }), { read: false }), {
            starttag: '// bower:js',
            endtag: '// endbower',
            transform: function (filepath) {
                return '\'' + filepath.substring(1, filepath.length) + '\',';
            }
        }))
        .pipe(gulp.dest(config.test));
}

function troubleshoot() {
    /* this task removes the troubleshooting content from index.html*/
    return gulp.src(config.app + 'index.html')
        .pipe(plumber({ errorHandler: handleErrors }))
        /* having empty src as we dont have to read any files*/
        .pipe(inject(gulp.src('', { read: false }), {
            starttag: '<!-- inject:troubleshoot -->',
            removeTags: true,
            transform: function () {
                return '<!-- Angular views -->';
            }
        }))
        .pipe(gulp.dest(config.app));
}
