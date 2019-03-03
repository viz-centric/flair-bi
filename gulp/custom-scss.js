const gulp = require('gulp');
const sass = require('gulp-sass');
const config = require('./config');

module.exports =  () => {
    return gulp.src(config.customStyles + '/scss/main/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(config.customStyles + '/css/'));
};
