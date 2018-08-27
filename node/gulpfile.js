var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var pump = require('pump');
var imagemin = require('gulp-imagemin'); 
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var sourcemaps = require('gulp-sourcemaps');
var dirSync = require( 'gulp-directory-sync' );

var plumberErrorHandler = { errorHandler: notify.onError({
 
    title: 'Gulp',
 
    message: 'Error: <%= error.message %>'
 
  })
 
};

var libsJs = [
  '../libraries/js-cookie/js.cookie.js',
];

gulp.task('main-css', function () {
    gulp.src('../assets/scss/*.scss')
    	.pipe(plumber(plumberErrorHandler))
        .pipe(sass())
        .pipe(concatCss('gdprx.css'))
        .pipe(autoprefixer({
            browsers: ["last 50 versions", "ie >= 9"],
            cascade: false
        }))
        .pipe(gulp.dest('../assets/pkgd'));
});

gulp.task('main-min-css', function () {
    gulp.src('../assets/scss/*.scss')
      .pipe(plumber(plumberErrorHandler))
        .pipe(sass())
        .pipe(concatCss('gdprx.min.css'))
        .pipe(autoprefixer({
            browsers: ["last 50 versions", "ie >= 9"],
            cascade: false
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('../assets/pkgd'));
});

gulp.task('main-js', function () {
    var files = libsJs.concat([
      '../assets/js/!(main)*.js',
      '../assets/js/main.js',
      ]);
    gulp.src(files)
      .pipe(plumber(plumberErrorHandler))
        .pipe(concat('gdprx.js'))
        .pipe(gulp.dest('../assets/pkgd'))
});

gulp.task('main-min-js', function () {
    var files = libsJs.concat([
      '../assets/js/!(main)*.js',
      '../assets/js/main.js',
    ]);
    gulp.src(files)
      .pipe(plumber(plumberErrorHandler))
        .pipe(concat('gdprx.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('../assets/pkgd'))
});


gulp.task( 'sync-libs', function() {
      return gulp.src( '' )
        .pipe(dirSync( 'node_modules/js-cookie/src','../libraries/js-cookie', { printSummary: true } ))
        .pipe(dirSync( 'node_modules/alertifyjs/build','../libraries/alertifyjs', { printSummary: true } ))
} );


gulp.task('watch', function() {
  gulp.watch(['../assets/scss/*.scss','../assets/scss/imports/*.scss'], ['main-css','main-min-css']);
  gulp.watch('../assets/js/*.js', ['main-js','main-min-js']);
});


gulp.task('full', ['main-css','main-min-css','main-js','main-min-js']);
