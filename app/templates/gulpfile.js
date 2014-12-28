'use strict';

var gulp = require('gulp');
var _ = require('lodash');

var config = {
  paths: require('./.yo-rc.json')['generator-gulp-angular'].props.paths
};

_.forEach(require('require-dir')('./gulp'), function(gulpFile) {
  if (gulpFile.registerTasks)
    gulpFile.registerTasks(config);
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
