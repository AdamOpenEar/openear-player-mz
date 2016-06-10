#!/usr/bin/env node

var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');

var fs = require('fs');
var path = require('path');
var jshint = require('jshint').JSHINT;
var async = require('async');

gulp.task('lint',function(){
	var foldersToProcess = [
	    'ng',
	    'ng/controller',
	    'ng/factory',
	    'ng/directive',
	    'ng/service',
	    'ng/lib',
	];

	foldersToProcess.forEach(function(folder) {
	    processFiles("dev/" + folder);
	});

	function processFiles(dir, callback) {
	    var errorCount = 0;
	    fs.readdir(dir, function(err, list) {
	        if (err) {
	            console.log('processFiles err: ' + err);
	            return;
	        }
	        async.eachSeries(list, function(file, innercallback) {
	            file = dir + '/' + file;
	            fs.stat(file, function(err, stat) {
	                if(!stat.isDirectory()) {
	                    if(path.extname(file) === ".js") {
	                        lintFile(file, function(hasError) {
	                            if(hasError) {
	                                errorCount++;
	                            }
	                            innercallback();
	                        });
	                    } else {
	                        innercallback();
	                    }
	                } else {
	                    innercallback();
	                }
	            });
	        }, function(error) {
	            if(errorCount > 0) {
	                process.exit(1);
	            }
	        });
	    });
	}

	function lintFile(file, callback) {
	    console.log("Linting " + file);
	    fs.readFile(file, function(err, data) {
	        if(err) {
	            console.log('Error: ' + err);
	            return;
	        }
	        if(jshint(data.toString())) {
	            console.log('File ' + file + ' has no errors.');
	            console.log('-----------------------------------------');
	            callback(false);
	        } else {
	            console.log('Errors in file ' + file);
	            var out = jshint.data(),
	            errors = out.errors;
	            for(var j = 0; j < errors.length; j++) {
	                console.log(errors[j].line + ':' + errors[j].character + ' -> ' + errors[j].reason + ' -> ' +
	errors[j].evidence);
	            }
	            console.log('-----------------------------------------');
	            callback(true);
	        }
	    });
	}
});

gulp.task('template', function () {
  return gulp.src('template/*.html')
    .pipe(templateCache({standalone:true}))
    .pipe(gulp.dest('dev/assets/js/'))
    .pipe(gulp.dest('www/assets/js/'));
});