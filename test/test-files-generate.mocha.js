/*global describe, beforeEach, it */
'use strict';

var _ = require('lodash');
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;
var outputInTest = require( './mute' );

describe('gulp-angular generator', function () {

  var mockPrompts = require('../app/src/mock-prompts.js');
  var mockOptions = require('../app/src/mock-options.js');

  var prompts = JSON.parse(JSON.stringify(mockPrompts.prompts));
  var defaultPrompts;
  var defaultOptions;

  var libRegexp = mockPrompts.libRegexp;

  var gulpAngular;
  var folderName = 'tempGulpAngular';

  var expectedFile;

  var expectedGulpContent = [
    ['gulpfile.js', /gulp\.task\('default'/],
    ['gulp/build.js', /gulp\.task\('styles'/],
    ['gulp/build.js', /gulp\.task\('scripts'/],
    ['gulp/build.js', /gulp\.task\('partials'/],
    ['gulp/build.js', /gulp\.task\('html'/],
    ['gulp/build.js', /gulp\.task\('images'/],
    ['gulp/build.js', /gulp\.task\('fonts'/],
    ['gulp/build.js', /gulp\.task\('misc'/],
    ['gulp/build.js', /gulp\.task\('clean'/],
    ['gulp/build.js', /gulp\.task\('build'/],
    ['gulp/unit-tests.js', /gulp\.task\('test'/],
    ['gulp/e2e-tests.js', /gulp\.task\('webdriver-update'/],
    ['gulp/e2e-tests.js', /gulp\.task\('webdriver-standalone'/],
    ['gulp/e2e-tests.js', /gulp\.task\('protractor:src'/],
    ['gulp/e2e-tests.js', /gulp\.task\('protractor:dist'/],
    ['gulp/server.js', /gulp\.task\('serve'/],
    ['gulp/server.js', /gulp\.task\('serve:dist'/],
    ['gulp/server.js', /gulp\.task\('serve:e2e'/],
    ['gulp/server.js', /gulp\.task\('serve:e2e-dist'/],
    ['gulp/watch.js', /gulp\.task\('watch'/],
    ['gulp/wiredep.js', /gulp\.task\('wiredep'/]
  ];

  beforeEach(function (done) {
    expectedFile = [
      // gulp/ directory
      'gulp/build.js',
      'gulp/consolidate.js',
      'gulp/e2e-tests.js',
      'gulp/proxy.js',
      'gulp/server.js',
      'gulp/unit-tests.js',
      'gulp/watch.js',
      'gulp/wiredep.js',

      // src/ directory
      'src/favicon.ico',
      'src/index.html',

      // src/components/navbar/ directory
      'src/components/navbar/navbar.html',

      // root directory
      '.bowerrc',
      '.editorconfig',
      '.gitignore',
      '.jshintrc',
      '.yo-rc.json',
      'bower.json',
      'gulpfile.js',
      'package.json'
    ];

    defaultPrompts = JSON.parse(JSON.stringify(mockPrompts.defaults));
    defaultOptions = _.assign(JSON.parse(JSON.stringify(mockPrompts.defaults)), {
      'skip-install': true,
      'skip-welcome-message': true,
      'skip-message': true
    });

    helpers.testDirectory(path.join(__dirname, folderName), function (err) {
      if (err) {
        done(err);
      }

      gulpAngular = helpers.createGenerator(
        'gulp-angular:app',
        [
          '../../app',
        ],
        false,
        defaultOptions
      );

      gulpAngular.on('run', outputInTest.mute);
      gulpAngular.on('end', outputInTest.unmute);

      done();
    });
  });

  describe('with default options: [src, dist, e2e, .tmp] [angular 1.3.x, ngAnimate, ngCookies, ngTouch, ngSanitize, jQuery 1.x.x, ngResource, ngRoute, bootstrap, ui-bootstrap, node-sass, Standard JS, Jade]', function () {
    // Default scenario: angular 1.3.x, ngAnimate, ngCookies, ngTouch, ngSanitize, jQuery 1.x.x, ngResource, ngRoute, bootstrap, node-sass, standard js, jade
    it('should generate the expected files and their content', function (done) {
      helpers.mockPrompt(gulpAngular, defaultPrompts);

      gulpAngular.run(defaultOptions, function () {
        assert.file([].concat(expectedFile, [
          // Option: Javascript
          'src/app/index.js',
          'src/app/main/main.controller.js',
          'src/app/main/main.controller.spec.js',
          'src/components/navbar/navbar.controller.js',
          'karma.conf.js',
          'protractor.conf.js',
          'e2e/main.po.js',
          'e2e/main.spec.js',

          // Option: ngRoute
          'src/app/main/main.html',

          // Option: Sass (Node)
          'src/app/index.scss',
          'src/app/vendor.scss',
        ]));

        assert.noFile([
          'src/**/*.ts',
          'src/**/*.coffee'
        ]);

        assert.fileContent([].concat(expectedGulpContent, [
          // Check src/app/index.js
          ['src/app/index.js', /'ngAnimate'/],
          ['src/app/index.js', /'ngCookies'/],
          ['src/app/index.js', /'ngTouch'/],
          ['src/app/index.js', /'ngSanitize'/],
          ['src/app/index.js', /'ngResource'/],
          ['src/app/index.js', /'ngRoute'/],

          // Check src/app/vendor.scss
          ['src/app/vendor.scss', /\$icon-font-path: "\.\.\/\.\.\/bower_components\/bootstrap-sass-official\/assets\/fonts\/bootstrap\/";/],
          ['src/app/vendor.scss', /@import '\.\.\/\.\.\/bower_components\/bootstrap-sass-official\/assets\/stylesheets\/bootstrap';/],

          // Check bower.json
          ['bower.json', libRegexp('angular', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-animate', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-cookies', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-touch', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-sanitize', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('jquery', prompts.jQuery.values['jquery 2'].version)],
          ['bower.json', libRegexp('angular-resource', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-route', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('bootstrap-sass-official', prompts.ui.values.bootstrap.version)],

          // Check consolidate
          ['gulp/build.js', /gulp\.task\('partials'.*?'consolidate'/],
          ['gulp/consolidate.js', /'jade'/],

          // Check package.json
          ['package.json', libRegexp('gulp-sass', prompts.cssPreprocessor.values['node-sass'].version)],

          // Check wiredep css exclusion.
          ['gulp/wiredep.js', /exclude:.*?\/bootstrap\\\.css\/.*?/]
        ]));

        done();
      });
    });
  });
  
  // Prompt #1: Which version of Angular ?
  describe('with option: [angular 1.2.x]', function () {
    it('should add dependency for angular 1.2.x', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        'angularVersion': prompts.angularVersion.values['1.2']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          ['bower.json', libRegexp('angular', prompts.angularVersion.values['1.2'])]
        ]));
        done();
      });
    });
  });

  // Prompt #2:  Which Angular's modules ?
  describe('without ngModules option', function () {
    it('should NOT add dependency for ngModules', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        angularModules: []
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent(expectedGulpContent);

        assert.noFileContent([
          ['src/app/index.js', /'ngAnimate'/],
          ['src/app/index.js', /'ngCookies'/],
          ['src/app/index.js', /'ngTouch'/],
          ['src/app/index.js', /'ngSanitize'/],
          ['bower.json', /"angular-animate":/],
          ['bower.json', /"angular-cookies":/],
          ['bower.json', /"angular-touch":/],
          ['bower.json', /"angular-sanitize":/],
        ]);
        done();
      });
    });
  });

  // Prompt #3: Which JavaScript library ?
  describe('with option: [jQuery 2.x.x]', function () {
    it('should add dependency for jQuery 2.x.x', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        jQuery: prompts.jQuery.values['jquery 2']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          ['bower.json', libRegexp('jquery', prompts.jQuery.values['jquery 2'].version)]
        ]));
        done();
      });
    });
  });
  describe('with option: [ZeptoJS 1.1.x]', function () {
    it('should add dependency for ZeptoJS 1.1.x', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        jQuery: prompts.jQuery.values['zeptojs 1.1']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          ['bower.json', libRegexp('zeptojs', prompts.jQuery.values['zeptojs 1.1'].version)]
        ]));
        done();
      });
    });
  });
  describe('with option: [jqLite]', function () {
    it('should NOT add dependency for jqLite', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        jQuery: prompts.jQuery.values.none
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent(expectedGulpContent);

        assert.noFileContent([
          ['bower.json', /"jquery:"/],
          ['bower.json', /"zeptojs:"/]
        ]);
        done();
      });
    });
  });

  // Prompt #4: Which Angular's modules for RESTful resource interaction ?
  describe('with option: [Restangular]', function () {
    it('should add dependency for Restangular', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        resource: prompts.resource.values.restangular
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          ['src/app/index.js', /'restangular'/],
          ['bower.json', libRegexp('restangular', prompts.resource.values.restangular.version)]
        ]));

        done();
      });
    });
  });

  describe('with option: [$http]', function () {
    it('should NOT add dependency for $http', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        resource: prompts.resource.values.none
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent(expectedGulpContent);

        assert.noFileContent([
          ['src/app/index.js', /'ngResource'/],
          ['src/app/index.js', /'restangular'/],
          ['bower.json', libRegexp('angular-resource', prompts.resource.values['angular-resource'].version)],
          ['bower.json', libRegexp('restangular', prompts.resource.values.restangular.version)]
        ]);

        done();
      });
    });
  });

  // Prompt #5: Which Angular's modules for routing ?
  describe('with option: [UI Router]', function () {
    it('should add dependency for UI Router', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        router: prompts.router.values['angular-ui-router']
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/main/main.html',
        ]));

        assert.fileContent([].concat(expectedGulpContent, [
          ['src/app/index.js', /'ui.router'/],
          ['bower.json', libRegexp('angular-ui-router', prompts.router.values['angular-ui-router'].version)]
        ]));

        done();
      });
    });
  });
  describe('without router option', function () {
    it('should NOT add dependency', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        router: prompts.router.values.none
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.noFile('src/app/main/main.html');

        assert.fileContent(expectedGulpContent);

        assert.noFileContent([
          ['src/app/index.js', /'ngRoute'/],
          ['src/app/index.js', /'ui.router'/],
          ['bower.json', libRegexp('angular-route', prompts.router.values['angular-route'].version)],
          ['bower.json', libRegexp('angular-ui-router', prompts.router.values['angular-ui-router'].version)]
        ]);

        done();
      });
    });
  });

  // Prompt #6: Which UI framework ?
  describe('with option: [Foundation, angular-foundation, Node SASS]', function () {
    it('should add dependency for Foundation with SASS', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.foundation,
        foundationComponents: prompts.foundationComponents.values['angular-foundation']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          ['src/app/vendor.scss', /@import '..\/..\/bower_components\/foundation\/scss\/foundation';/],
          ['bower.json', libRegexp('angular-foundation', prompts.foundationComponents.values['angular-foundation'].version)],
          ['bower.json', libRegexp('foundation', prompts.ui.values.foundation.version)],

          ['package.json', libRegexp('gulp-sass', prompts.cssPreprocessor.values['node-sass'].version)],
          ['gulp/wiredep.js', /exclude:.*?\/foundation\\\.css\/.*?/]
        ]));



        done();
      });
    });
  });
  describe('with option: [Foundation, angular-foundation, Ruby SASS]', function () {
    it('should add dependency for Foundation with SASS', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.foundation,
        foundationComponents: prompts.foundationComponents.values['angular-foundation'],
        cssPreprocessor: prompts.cssPreprocessor.values['ruby-sass']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          ['src/app/vendor.scss', /@import '..\/..\/bower_components\/foundation\/scss\/foundation';/],
          ['bower.json', libRegexp('angular-foundation', prompts.foundationComponents.values['angular-foundation'].version)],
          ['bower.json', libRegexp('foundation', prompts.ui.values.foundation.version)],

          ['package.json', libRegexp('gulp-ruby-sass', prompts.cssPreprocessor.values['ruby-sass'].version)],
          ['gulp/wiredep.js', /exclude:.*?\/foundation\\\.css\/.*?/]
        ]));

        done();
      });
    });
  });
  describe('with option: [Foundation, angular-foundation, LESS]', function () {
    it('should add dependency for Foundation with LESS', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.foundation,
        foundationComponents: prompts.foundationComponents.values['angular-foundation'],
        cssPreprocessor: prompts.cssPreprocessor.values.less
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.less'
        ]));

        assert.fileContent([].concat(expectedGulpContent, [
          ['bower.json', libRegexp('foundation', prompts.ui.values.foundation.version)],
          ['bower.json', libRegexp('angular-foundation', prompts.foundationComponents.values['angular-foundation'].version)],
          ['package.json', libRegexp('gulp-less', prompts.cssPreprocessor.values.less.version)],
          ['gulp/wiredep.js', /exclude:.*?\/foundation\\\.css\/.*?/]
        ]));

        done();
      });
    });
  });
  describe('with option: [Foundation, angular-foundation, Stylus]', function () {
    it('should add dependency for Foundation with Stylus', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.foundation,
        foundationComponents: prompts.foundationComponents.values['angular-foundation'],
        cssPreprocessor: prompts.cssPreprocessor.values.stylus
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.styl'
        ]));

        assert.fileContent([].concat(expectedGulpContent, [
          ['bower.json', libRegexp('foundation', prompts.ui.values.foundation.version)],
          ['bower.json', libRegexp('angular-foundation', prompts.foundationComponents.values['angular-foundation'].version)],
          ['package.json', libRegexp('gulp-stylus', prompts.cssPreprocessor.values.stylus.version)],
          ['gulp/wiredep.js', /exclude:.*?\/foundation\\\.css\/.*?/]
        ]));

        done();
      });
    });
  });
  describe('with option: [Foundation, angular-foundation, CSS]', function () {
    it('should add dependency for Foundation with CSS', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.foundation,
        foundationComponents: prompts.foundationComponents.values['angular-foundation'],
        cssPreprocessor: prompts.cssPreprocessor.values.none
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.css',
        ]));

        assert.noFile('src/app/vendor.*');

        // No Gulp task for style
        assert.fileContent([
          ['bower.json', libRegexp('foundation', prompts.ui.values.foundation.version)],
          ['bower.json', libRegexp('angular-foundation', prompts.foundationComponents.values['angular-foundation'].version)]
        ]);
        // No Gulp task for style
        assert.noFileContent([
          ['gulp/wiredep.js', /exclude:.*?\/foundation\\\.css\/.*?/]
        ]);
        done();
      });
    });
  });
  describe('with option: [Foundation, Official, CSS]', function () {
    it('should not add angular-foundation', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.foundation,
        cssPreprocessor: prompts.cssPreprocessor.values.none,
        foundationComponents: prompts.foundationComponents.values.official
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.css',
        ]));

        assert.noFile('src/app/vendor.*');

        // No Gulp task for style
        assert.fileContent([
          ['bower.json', libRegexp('foundation', prompts.ui.values.foundation.version)],
        ]);

        // No Gulp task for style
        assert.noFileContent([
          ['bower.json', libRegexp('angular-foundation', prompts.foundationComponents.values['angular-foundation'].version)],
          ['gulp/wiredep.js', /exclude:.*?\/foundation\\\.css\/.*?/]
        ]);
        done();
      });
    });
  });
  describe('with option: [Bootstrap, Ruby SASS]', function () {
    it('should add dependency for Bootstrap with SASS', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.bootstrap,
        cssPreprocessor: prompts.cssPreprocessor.values['ruby-sass']
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.scss',
          'src/app/vendor.scss',
        ]));

        assert.fileContent([].concat(expectedGulpContent, [
          ['src/app/vendor.scss', /\$icon-font-path: "\.\.\/\.\.\/bower_components\/bootstrap-sass-official\/assets\/fonts\/bootstrap\/";/],
          ['src/app/vendor.scss', /@import '\.\.\/\.\.\/bower_components\/bootstrap-sass-official\/assets\/stylesheets\/bootstrap';/],
          ['bower.json', libRegexp('bootstrap-sass-official', prompts.ui.values.bootstrap.version)],
          ['package.json', libRegexp('gulp-ruby-sass', prompts.cssPreprocessor.values['ruby-sass'].version)],
          ['gulp/wiredep.js', /exclude:.*?\/bootstrap\\\.css\/.*?/]
        ]));

        done();
      });
    });
  });
  describe('with option: [Bootstrap, LESS]', function () {
    it('should add dependency for Bootstrap with LESS', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.bootstrap,
        cssPreprocessor: prompts.cssPreprocessor.values.less
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.less',
          'src/app/vendor.less',
        ]));

        assert.fileContent([].concat(expectedGulpContent, [
          ['src/app/vendor.less', /@import '..\/..\/bower_components\/bootstrap\/less\/bootstrap.less';/],
          ['src/app/vendor.less', /@icon-font-path: '\/bower_components\/bootstrap\/fonts\/';/],
          ['bower.json', libRegexp('bootstrap', prompts.ui.values.bootstrap.version)],
          ['package.json', libRegexp('gulp-less', prompts.cssPreprocessor.values.less.version)],
          ['gulp/wiredep.js', /exclude:.*?\/bootstrap\\\.css\/.*?/]
        ]));

        done();
      });
    });
  });
  describe('with option: [Bootstrap, Stylus]', function () {
    it('should add dependency for Bootstrap with Stylus', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.bootstrap,
        cssPreprocessor: prompts.cssPreprocessor.values.stylus
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.styl',
        ]));

        assert.noFile('src/app/vendor.*');

        assert.fileContent([].concat(expectedGulpContent, [
          ['src/index.html', /<link rel="stylesheet" href="..\/bower_components\/bootstrap\/dist\/css\/bootstrap.css">/],
          ['bower.json', libRegexp('bootstrap', prompts.ui.values.bootstrap.version)],
          ['package.json', libRegexp('gulp-stylus', prompts.cssPreprocessor.values.stylus.version)],
          ['gulp/wiredep.js', /exclude:.*?\/bootstrap\\\.css\/.*?/]
        ]));

        done();
      });
    });
  });
  describe('with option: [Bootstrap, CSS]', function () {
    it('should add dependency for Bootstrap with CSS', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.bootstrap,
        cssPreprocessor: prompts.cssPreprocessor.values.none
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.css',
        ]));

        assert.noFile('src/app/vendor.*');

        // No Gulp task for style
        assert.fileContent([
          ['bower.json', libRegexp('bootstrap', prompts.ui.values.bootstrap.version)]
        ]);

        assert.noFileContent([
          ['package.json', libRegexp('gulp-less', prompts.cssPreprocessor.values.less.version)],
          ['package.json', libRegexp('gulp-sass', prompts.cssPreprocessor.values['node-sass'].version)],
          ['package.json', libRegexp('gulp-ruby-sass', prompts.cssPreprocessor.values['ruby-sass'].version)],
          ['gulp/wiredep.js', /exclude:.*\/bootstrap\\\.css\/.*/]
        ]);

        done();
      });
    });
  });
  describe('with option: [Bootstrap, UI Boostrap]', function () {
    it('should add UI Bootstrap Bower and Angular module', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        bootstrapComponents: prompts.bootstrapComponents.values['ui-bootstrap']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([
          ['bower.json', libRegexp('angular-bootstrap', prompts.bootstrapComponents.values['ui-bootstrap'].version)],
          ['src/app/index.js', /'ui.bootstrap'/]
        ]);

        done();
      });
    });
  });
  describe('with option: [Bootstrap, Standard Boostrap JS]', function () {
    it('should add Bootstrap JS files', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        bootstrapComponents: prompts.bootstrapComponents.values.official
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.noFileContent([
          ['gulp/wiredep.js', /\/bootstrap\\\.js\//]
        ]);

        done();
      });
    });
  });
  describe('with option: [Angular Material]', function () {
    it('should add Angular Material Bower and Angular modules', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values['angular-material']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.noFile('src/app/vendor.*');

        assert.fileContent([
          ['bower.json', libRegexp('angular-material', prompts.ui.values['angular-material'].version)],
          ['src/app/index.js', /'ngMaterial'/]
        ]);

        done();
      });
    });
  });
  describe('with option: [None UI Framework, Node SASS]', function () {
    it('should add index style', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.none,
        cssPreprocessor: prompts.cssPreprocessor.values['node-sass']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          // Check package.json
          ['package.json', libRegexp('gulp-sass', prompts.cssPreprocessor.values['node-sass'].version)]
        ]));

        assert.noFile('src/app/vendor.*');

        done();
      });
    });
  });
  describe('with option: [None UI Framework, Ruby SASS]', function () {
    it('should add index style', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.none,
        cssPreprocessor: prompts.cssPreprocessor.values['ruby-sass']
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          // Check package.json
          ['package.json', libRegexp('gulp-ruby-sass', prompts.cssPreprocessor.values['ruby-sass'].version)]
        ]));

        assert.noFile('src/app/vendor.*');

        done();
      });
    });
  });
  describe('with option: [None UI Framework, LESS]', function () {
    it('should add index style', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.none,
        cssPreprocessor: prompts.cssPreprocessor.values.less
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          // Check package.json
          ['package.json', libRegexp('gulp-less', prompts.cssPreprocessor.values.less.version)]
        ]));

        assert.noFile('src/app/vendor.*');

        done();
      });
    });
  });
  describe('with option: [None UI Framework, Stylus]', function () {
    it('should add index style', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.none,
        cssPreprocessor: prompts.cssPreprocessor.values.stylus
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([].concat(expectedGulpContent, [
          // Check package.json
          ['package.json', libRegexp('gulp-stylus', prompts.cssPreprocessor.values.stylus.version)]
        ]));

        assert.noFile('src/app/vendor.*');

        done();
      });
    });
  });
  describe('with option: [None UI Framework, CSS]', function () {
    it('should add index style', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        ui: prompts.ui.values.none,
        cssPreprocessor: prompts.cssPreprocessor.values.none
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.noFile('src/app/vendor.*');

        done();
      });
    });
  });
  describe('with option: [None JS Preprocessor]', function () {
    it('should not add browerify and inject js files from src', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        jsPreprocessor: prompts.jsPreprocessor.values.none
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.noFile([
          'src/**/*.ts',
          'src/**/*.coffee'
        ]);

        assert.fileContent([].concat(expectedGulpContent, [
          ['gulp/build.js', /gulp\.task\(\'injector:js\', \[\'scripts\'.*\]/],
          ['gulp/build.js', /\$\.inject.*\n\s*paths\.src\s\+\s'\/{app,components}\/\*\*\/\*\.js'/]
        ]));

        assert.noFileContent([
          ['gulp/build.js', /gulp\.task\(\'browserify\'/],
          ['package.json', /gulp-browserify/]
        ]);

        done();
      });
    });
  });
  describe('with option: [CoffeeScript]', function () {
    it('should not add browerify and add gulp-coffee', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        jsPreprocessor: prompts.jsPreprocessor.values.coffee
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.coffee',
          'src/app/main/main.controller.coffee',
          'src/components/navbar/navbar.controller.coffee'
        ]));

        assert.noFile([
          'src/app/index.js',
          'src/app/main/main.controller.js',
          'src/components/navbar/navbar.controller.js',
          'src/**/*.ts'
        ]);

        assert.fileContent([].concat(expectedGulpContent, [
          ['gulp/build.js', /gulp\.task\(\'injector:js\', \[\'scripts\'.*\]/],
          ['gulp/build.js', /\$\.inject.*\n\s*'{'\s\+\spaths\.src\s\+\s','\s\+\spaths\.tmp\s\+\s'}\/{app,components}\/\*\*\/\*\.js'/],
          ['package.json', /gulp-coffee/],
          ['package.json', /gulp-coffeelint/]
        ]));

        assert.noFileContent([
          ['gulp/build.js', /gulp\.task\(\'browserify\'/],
          ['package.json', /gulp-browserify/]
        ]);

        done();
      });
    });
  });
  describe('with option: [6to5]', function () {
    it('should add browerify and gulp-6to5', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        jsPreprocessor: prompts.jsPreprocessor.values['6to5']
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.js',
          'src/app/main/main.controller.js',
          'src/components/navbar/navbar.controller.js'
        ]));

        assert.noFile([
          'src/**/*.coffee',
          'src/**/*.ts'
        ]);

        assert.fileContent([].concat(expectedGulpContent, [
          ['gulp/build.js', /gulp\.task\(\'injector:js\', \[\'browserify\'.*\]/],
          ['gulp/build.js', /gulp\.task\(\'browserify\'/],
          ['gulp/build.js', /\$\.inject.*\n\s*paths\.tmp\s\+\s'\/{app,components}\/\*\*\/\*\.js'/],
          ['package.json', /gulp-6to5/],
          ['package.json', /gulp-browserify/]
        ]));

        done();
      });
    });
  });
  describe('with option: [Traceur]', function () {
    it('should add browerify and gulp-traceur and traceur-runtime', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        jsPreprocessor: prompts.jsPreprocessor.values.traceur
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.file([].concat(expectedFile, [
          'src/app/index.js',
          'src/app/main/main.controller.js',
          'src/components/navbar/navbar.controller.js'
        ]));

        assert.noFile([
          'src/**/*.coffee',
          'src/**/*.ts'
        ]);

        assert.fileContent([].concat(expectedGulpContent, [
          ['gulp/build.js', /gulp\.task\(\'injector:js\', \[\'browserify\'.*\]/],
          ['gulp/build.js', /gulp\.task\(\'browserify\'/],
          ['gulp/build.js', /\$\.inject.*\n\s*paths\.tmp\s\+\s'\/{app,components}\/\*\*\/\*\.js'/],
          ['package.json', /gulp-traceur/],
          ['package.json', /gulp-browserify/],
          ['bower.json', /traceur-runtime/]
        ]));

        done();
      });
    });
  });
  describe('with option: [TypeScript]', function () {
    it('should not add browerify and gulp-typescript and dt-angular', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        jsPreprocessor: prompts.jsPreprocessor.values.typescript
      }));

      gulpAngular.run({}, function() {
        assert.file([].concat(expectedFile, [
          'src/app/index.ts',
          'src/app/main/main.controller.ts',
          'src/components/navbar/navbar.controller.ts'
        ]));

        assert.noFile([
          'src/app/index.js',
          'src/app/main/main.controller.js',
          'src/components/navbar/navbar.controller.js',
          'src/**/*.coffee'
        ]);

        assert.fileContent([].concat(expectedGulpContent, [
          ['gulp/build.js', /gulp\.task\(\'injector:js\', \[\'scripts\'.*\]/],
          ['gulp/build.js', /\$\.inject.*\n\s*'{'\s\+\spaths\.src\s\+\s','\s\+\spaths\.tmp\s\+\s'}\/{app,components}\/\*\*\/\*\.js'/],
          ['package.json', /gulp-typescript/],
          ['bower.json', /dt-angular/]
        ]));

        assert.noFileContent([
          ['gulp/build.js', /gulp\.task\(\'browserify\'/],
          ['package.json', /gulp-browserify/]
        ]);

        done();
      });
    });
  });

  describe('with option: [No HTML Preprocessor]', function () {
    it('should not have consolidate gulp task', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        htmlPreprocessors: []
      }));

      gulpAngular.run({}, function() {
        var expectedFileClone = _.clone(expectedFile);
        assert.file(expectedFileClone);

        assert.noFileContent([
          ['gulp/build.js', /gulp\.task\('partials'.*?'consolidate'/],
          ['gulp/consolidate.js', /'jade'/],
          ['gulp/consolidate.js', /'hamljs'/],
          ['gulp/consolidate.js', /'handlebars'/]
        ]);

        done();
      });
    });
  });

  describe('with option: [All HTML Preprocessors]', function () {
    it('should have consolidate gulp task', function (done) {
      helpers.mockPrompt(gulpAngular, _.assign(defaultPrompts, {
        htmlPreprocessors: _.map(prompts.htmlPreprocessors.choices, function(c) {return c.value;})
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent([
          ['gulp/build.js', /gulp\.task\('partials'.*?'consolidate'/],
          ['gulp/consolidate.js', /'jade'/],
          ['gulp/consolidate.js', /'hamljs'/],
          ['gulp/consolidate.js', /'handlebars'/]
        ]);

        done();
      });
    });
  });

  describe('with option: [src:path/to/public e2e:path/to/e2e/test dist:path/to/dist tmp:.tmp/folder]', function () {
    // Default scenario: angular 1.3.x, ngAnimate, ngCookies, ngTouch, ngSanitize, jQuery 1.x.x, ngResource, ngRoute, bootstrap, node-sass, standard js, jade
    it('should generate the expected files and their content', function (done) {
      helpers.mockPrompt(gulpAngular, defaultPrompts);
      
      _.assign(defaultOptions, {
        'app-path': 'path/to/public',
        'dist-path': 'path/to/dist',
        'e2e-path': 'path/to/test',
        'tmp': '.tmp/folder'
      });

      expectedFile = _.map(expectedFile, function(file) {
        if (file.indexOf('src') === 0)
          return file.replace('src', defaultOptions['app-path']);
        return file;
      });

      gulpAngular.run(defaultOptions, function () {
        assert.file([].concat(expectedFile, [
          // Option: Javascript
          defaultOptions['app-path'] + '/app/index.js',
          defaultOptions['app-path'] + '/app/main/main.controller.js',
          defaultOptions['app-path'] + '/app/main/main.controller.spec.js',
          defaultOptions['app-path'] + '/components/navbar/navbar.controller.js',
          'karma.conf.js',
          'protractor.conf.js',
          defaultOptions['e2e-path'] + '/main.po.js',
          defaultOptions['e2e-path'] + '/main.spec.js',

          // Option: ngRoute
          defaultOptions['app-path'] + '/app/main/main.html',

          // Option: Sass (Node)
          defaultOptions['app-path'] + '/app/index.scss',
          defaultOptions['app-path'] + '/app/vendor.scss',
        ]));

        assert.noFile([
          defaultOptions['app-path'] + '/**/*.ts',
          defaultOptions['app-path'] + '/**/*.coffee'
        ]);

        assert.fileContent([].concat(expectedGulpContent, [
          // Check src/app/index.js
          [defaultOptions['app-path'] + '/app/index.js', /'ngAnimate'/],
          [defaultOptions['app-path'] + '/app/index.js', /'ngCookies'/],
          [defaultOptions['app-path'] + '/app/index.js', /'ngTouch'/],
          [defaultOptions['app-path'] + '/app/index.js', /'ngSanitize'/],
          [defaultOptions['app-path'] + '/app/index.js', /'ngResource'/],
          [defaultOptions['app-path'] + '/app/index.js', /'ngRoute'/],

          // Check src/app/vendor.scss
          [defaultOptions['app-path'] + '/app/vendor.scss', /\$icon-font-path: "\.\.\/\.\.\/\.\.\/\.\.\/bower_components\/bootstrap-sass-official\/assets\/fonts\/bootstrap\/";/],
          [defaultOptions['app-path'] + '/app/vendor.scss', /@import '\.\.\/\.\.\/\.\.\/\.\.\/bower_components\/bootstrap-sass-official\/assets\/stylesheets\/bootstrap';/],

          // Check bower.json
          ['bower.json', libRegexp('angular', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-animate', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-cookies', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-touch', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-sanitize', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('jquery', prompts.jQuery.values['jquery 2'].version)],
          ['bower.json', libRegexp('angular-resource', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('angular-route', prompts.angularVersion.values['1.3'])],
          ['bower.json', libRegexp('bootstrap-sass-official', prompts.ui.values.bootstrap.version)],

          // Check consolidate
          ['gulp/build.js', /gulp\.task\('partials'.*?'consolidate'/],
          ['gulp/consolidate.js', /'jade'/],

          // Check package.json
          ['package.json', libRegexp('gulp-sass', prompts.cssPreprocessor.values['node-sass'].version)],

          // Check wiredep css exclusion.
          ['gulp/wiredep.js', /exclude:.*?\/bootstrap\\\.css\/.*?/]
        ]));

        done();
      });
    });
  });

  // For future case
  /*
  describe('with option: []', function () {
    it('should', function (done) {
      var _ = gulpAngular._;

      helpers.mockPrompt(gulpAngular, _.assign(prompt, {
        // jQuery: {
        //   "name": null,
        //   "version": "1.1.x"
        // }
      }));

      gulpAngular.run({}, function() {
        assert.file(expectedFile);

        assert.fileContent(expectedGulpContent);

        done();
      });
    });
  });
  */
});
