var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    fs = require('fs'),
    minify = require('gulp-clean-css'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    runSequence = require('run-sequence'),
    imagemin = require('gulp-imagemin'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    pngquant = require('imagemin-pngquant'),
    browserSync = require('browser-sync').create();

/* --------------------------- development process for building ---------------------------------  */
gulp.task('default', function(callback) {
    runSequence('clean:dist',['html','sass','js','images','move:fonts','move:lib','browserSync','watch'],callback)
});

gulp.task('release', function(callback) {
    runSequence('clean:dist',['html','sass','js','images','move:fonts','move:lib'],callback)
});

/* browser sync auto reloads the browser */
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dist/'
        }
    });
});

/* converts the sass to css, autoprefixes it, and moves to proper location */
gulp.task('sass', function() {
    return gulp.src('src/scss/styles.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'android 4'],
            cascade: false
        }))
        .pipe(minify({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* minifies scripts.js and moves it */
gulp.task('js', function() {
    var partials = fs.readFileSync('src/js/scripts.js', 'utf-8');
    arrPartials = partials.replace(/["']/g, '').split(/\r?\n/);
    // remove empty lines
    for (var i = 0; i < arrPartials.length; i++) {
        if (arrPartials[i] == '' || arrPartials[i] == undefined) {
            arrPartials.splice(i, 1);
            i--;
        }
    }

    return gulp.src(arrPartials)
        .pipe(concat('scripts.js'))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* watchers to help browser sync auto reload */
gulp.task('watch', ['browserSync', 'sass', 'js'], function() {
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/**/*.html', ['html', browserSync.reload]);
    gulp.watch('src/js/**/*.js', ['js']);
});

/* cleans out folder */
gulp.task('clean:dist', function() {
    return del.sync('dist', {force: true});
});

/* grab all images and move them */
gulp.task('images', function() {
    return gulp.src('src/assets/img/**/*.+(png|jpg|gif|svg)')
        .pipe(imagemin(
            [
                imageminMozjpeg({
                    quality: 80
                }),
                pngquant({
                    quality: 80
                })
            ]
        ))
        .pipe(gulp.dest('dist/assets/img/'));
});

gulp.task('move:fonts', function() {
    return gulp.src('src/assets/fonts/**/**.*')
        .pipe(gulp.dest('dist/assets/fonts/'));
});

gulp.task('move:lib', function() {
    return gulp.src('src/lib/**/*.*')
        .pipe(gulp.dest('dist/lib/'));
});

gulp.task('html', function() {
    return gulp.src(['src/**/*.html'])
        .pipe(gulp.dest('dist/'));
});