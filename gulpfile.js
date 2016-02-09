#!/usr/bin/env node

var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
console.log('Creating templates');
gulp.task('default', function () {
  return gulp.src('template/*.html')
    .pipe(templateCache({standalone:true}))
    .pipe(gulp.dest('www/ng/'));
});
gulp.start();