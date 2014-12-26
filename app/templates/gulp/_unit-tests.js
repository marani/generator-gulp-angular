'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep');

var paths = require('../.yo-rc.json').props.paths;

<% if (props.jsPreprocessor.key === 'none') { %>
gulp.task('test', function() { <% } else if (props.jsPreprocessor.extension === 'js') { %>
gulp.task('test', ['browserify'], function() { <% } else { %>
gulp.task('test', ['scripts'], function() { <% } %>
  var bowerDeps = wiredep({
    directory: 'bower_components',
    exclude: ['bootstrap-sass-official'],
    dependencies: true,
    devDependencies: true
  });

  var testFiles = bowerDeps.js.concat([<% if (props.jsPreprocessor.key === 'none') { %>
    paths.src + '/{app,components}/**/*.js'<% } else if (props.jsPreprocessor.extension === 'js') { %>
    paths.tmp + '/app/index.js',
    paths.src + '/{app,components}/**/*.spec.js',
    paths.src + '/{app,components}/**/*.mock.js'<% } else if (props.jsPreprocessor.key === 'typescript') { %>
    paths.tmp + '/{app,components}/**/!(index).js',
    paths.tmp + '/{app,components}/**/index.js',
    paths.src + '/{app,components}/**/*.spec.js',
    paths.src + '/{app,components}/**/*.mock.js'<% } else { %>
    paths.tmp + '/{app,components}/**/*.js',
    paths.src + '/{app,components}/**/*.spec.js',
    paths.src + '/{app,components}/**/*.mock.js'<% } %>
  ]);

  return gulp.src(testFiles)
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});
