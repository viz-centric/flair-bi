const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const templateCache = require('gulp-angular-templatecache');
const concat = require('gulp-concat');
const addStream = require('add-stream');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const clean = require('gulp-clean');
const rollup = require('gulp-rollup');
const rollupBabel = require("rollup-plugin-babel");
const ngAnnotate = require('gulp-ng-annotate');

gulp.task('clean', () => {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
});

gulp.task('css', () => {
    return gulp.src('src/*.css')
        .pipe(uglifycss())
        .pipe(concat('angular-cron-generator.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('js', ['css'], () => {
    return gulp.src('src/*.js')
        .pipe(sourcemaps.init())
        .pipe(rollup({
            format: 'iife',
            plugins: [
                rollupBabel({
                    presets: [['es2015', {modules: false}]],
                    plugins: ['external-helpers']
                })
            ],
            entry: 'src/angular-cron-generator.js'
        }))
        .pipe(ngAnnotate())
        .pipe(addStream.obj(() => gulp.src('src/*.html')
            .pipe(templateCache({
                module: 'angular-cron-generator'
            }))))
        .pipe(gulp.dest('dist'))
        .pipe(concat('angular-cron-generator.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch',()=> {
    gulp.watch(['src/*.js', 'src/*.html', 'src/*.css'] , ['js']);
});

gulp.task('default', ['clean', 'js']);

gulp.task('build', ['clean'], ()=>{
    gulp.start('js');
});

gulp.task('dev', ['clean'], ()=>{
    gulp.start('watch');
});



