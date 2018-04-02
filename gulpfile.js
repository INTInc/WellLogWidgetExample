var gulp = require('gulp-help')(require('gulp'));
var del = require('del');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var modConcat = require('module-concat');

var serverSourceFiles = ['server/**/*'];
var distSourceFiles = ['dist/**/*'];
var destinationServer = 'build/server';
var destination = 'build';

gulp.task('clean', function () {
    return del([
        'build/server',
        'build/dist',
        'build/*',
        'tmp/*'
    ]);
});
gulp.task('server', 'copy server', ['clean'], function () {
    return gulp.src(serverSourceFiles)
        .pipe(gulp.dest(destinationServer));
});
gulp.task('copy:server', 'copy server', ['server'], function () {
    return gulp.src(['server.js'])
        .pipe(gulp.dest('build'));
});
gulp.task('dist', 'copy dist', ['copy:server'], function () {
    return gulp.src(distSourceFiles)
        .pipe(gulp.dest('build/dist'));
});
gulp.task('delete:appconfig', 'delete app.json', ['dist'], function () {
    return del([
        'build/dist/assets/config/app.json'
    ]);
});
gulp.task('rename:config', 'rename config', ['delete:appconfig'], function () {
    gulp.src('build/dist/assets/config/app.deploy.json')
        .pipe(rename('build/dist/assets/config/app.json'))
        .pipe(gulp.dest('./'));
});
gulp.task('static', 'copy static', ['rename:config'], function () {
    return gulp.src(['static/**/*'])
        .pipe(gulp.dest('build/static'));
});
gulp.task('views', 'copy view', ['static'], function () {
    return gulp.src(['views/**/*'])
        .pipe(gulp.dest('build/views'));
});
gulp.task('copy', 'copy root', ['views'], function () {
    return gulp.src(['package.json', 'protractor.conf.js', 'README.md', 'karma.conf.js', 'angular-cli.json'])
        .pipe(gulp.dest('build'));
});
gulp.task('zipfolder', 'zip folder', ['copy'], function () {
    return gulp.src('build/**/*')
        .pipe(zip('welllogdata.zip'))
        .pipe(gulp.dest('build'));
});
gulp.task('default', 'Prepare distribution', ['zipfolder']);
