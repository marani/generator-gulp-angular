/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var spawn = require('cross-spawn');
var _ = require('lodash');
var outputInTest = require( './mute' );

var fs = require('fs');
var Q = require('q');

var chai = require('chai');
require('chai').should();
var assert = require('chai').assert;
chai.use(require('chai-as-promised'));

describe('gulp-angular generator', function () {
  var mockPrompts = require('../app/src/mock-prompts.js');
  var mockOptions = require('../app/src/mock-options.js');

  var prompts = JSON.parse(JSON.stringify(mockPrompts.prompts));
  var defaultPrompts;
  var defaultOptions;

  var promptCase;
  var gulpAngular;

  var tempDir = path.join(__dirname, 'tempGulpAngular');
  var depsDir = path.join(__dirname, 'deps');

  var tempDirDist = tempDir + '/dist';

  before(function () {
    this.run = function(timeout, task) {
      var deferred = Q.defer();

      this.timeout(timeout);

      gulpAngular.run({}, function () {
        var promiseLinkNode = Q.nfcall(fs.symlink, path.join(depsDir, 'node_modules'), path.join(tempDir, 'node_modules'));
        var promiseLinkBower = Q.nfcall(fs.symlink, path.join(depsDir, 'bower_components'), path.join(tempDir, 'bower_components'));
        Q.all([promiseLinkNode, promiseLinkBower]).then(function() {
          var gulpProcess = spawn('node', ['node_modules/gulp/bin/gulp.js', task], {stdio: 'inherit'});
          gulpProcess.on('exit', function(returnCode) {
            if(returnCode === 0) {
              deferred.resolve();
            } else {
              deferred.reject('Gulp returned with error code ' + returnCode);
            }
          });
        }, function(error) {

          deferred.reject(error);
        });
      });

      return deferred.promise;
    };
  });

  beforeEach(function (done) {
    defaultPrompts = JSON.parse(JSON.stringify(mockPrompts.defaults));
    defaultOptions = _.assign(JSON.parse(JSON.stringify(mockOptions.defaults)), {
      'skip-install': true,
      'skip-welcome-message': true,
      'skip-message': true
    });

    helpers.testDirectory(tempDir, function (err) {
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

  describe('with default options: [src, dist, e2e, .tmp] [angular 1.3.x, ngAnimate, ngCookies, ngTouch, ngSanitize, jQuery 1.x.x, ngResource, ngRoute, bootstrap, ui-bootstrap, node-sass]', function () {

     it('should pass gulp build', function () {
      helpers.mockPrompt(gulpAngular, defaultPrompts);

      return this.run(100000, 'build').should.be.fulfilled.then(function () {
        assert.ok(fs.statSync(tempDirDist + '/index.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/404.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/favicon.ico').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets/images').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/fonts').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/scripts').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/styles').isDirectory(), 'Directory not exist');
      });
    });

    it('should pass gulp test', function () {
      helpers.mockPrompt(gulpAngular, defaultPrompts);

      return this.run(100000, 'test').should.be.fulfilled;
    });

    it('should pass gulp protractor', function () {
      helpers.mockPrompt(gulpAngular, defaultPrompts);

      return this.run(100000, 'protractor').should.be.fulfilled;
    });

    it('should pass gulp protractor:dist', function () {
      helpers.mockPrompt(gulpAngular, defaultPrompts);

      return this.run(100000, 'protractor:dist').should.be.fulfilled;
    });
  });

  describe('with other promptCase: [src, dist, e2e, .tmp] [angular 1.2.x, jQuery 2.x.x, Restangular, UI-Router, Foundation, angular-foundation, CSS, Coffee]', function () {

    before(function () {
      promptCase = _.assign(defaultPrompts, {
        angularVersion: prompts.angularVersion.values['1.2'],
        jQuery: prompts.jQuery.values['jquery 2'],
        resource: prompts.resource.values.restangular,
        router: prompts.router.values['angular-ui-router'],
        ui: prompts.ui.values.foundation,
        foundationComponents: prompts.foundationComponents.values['angular-foundation'],
        cssPreprocessor: prompts.cssPreprocessor.values.none,
        jsPreprocessor: prompts.jsPreprocessor.values.coffee
      });
    });

    it('should pass gulp build', function () {

      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'build').should.be.fulfilled.then(function () {
        assert.ok(fs.statSync(tempDirDist + '/index.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/404.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/favicon.ico').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets/images').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/scripts').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/styles').isDirectory(), 'Directory not exist');
      });
    });

    it('should pass gulp test', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'test').should.be.fulfilled;
    });

    it('should pass gulp protractor', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'protractor').should.be.fulfilled;
    });

    it('should pass gulp protractor:dist', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'protractor:dist').should.be.fulfilled;
    });
  });

  describe('with other promptCase: [src, dist, e2e, .tmp] [angular 1.3.x, ngAnimate, ngCookies, ngTouch, ngSanitize, ZeptoJS 1.1.x, $http, Bootstrap, LESS, ES6 with 6to5]', function () {

    before(function () {
      promptCase = _.assign(defaultPrompts, {
        jQuery: prompts.jQuery.values['zeptojs 1.1'],
        resource: prompts.resource.values.none,
        router: prompts.router.values.none,
        ui: prompts.ui.values.bootstrap,
        bootstrapComponents: prompts.bootstrapComponents.values['ui-bootstrap'],
        cssPreprocessor: prompts.cssPreprocessor.values.less,
        jsPreprocessor: prompts.jsPreprocessor.values['6to5']
      });
    });

    it('should pass gulp build', function () {

      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'build').should.be.fulfilled.then(function () {
        assert.ok(fs.statSync(tempDirDist + '/index.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/404.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/favicon.ico').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets/images').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/fonts').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/scripts').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/styles').isDirectory(), 'Directory not exist');
      });
    });

    it('should pass gulp test', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'test').should.be.fulfilled;
    });

    it('should pass gulp protractor', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'protractor').should.be.fulfilled;
    });

    it('should pass gulp protractor:dist', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'protractor:dist').should.be.fulfilled;
    });
  });

  describe('with other promptCase: [src, dist, e2e, .tmp] [angular 1.3.x, ngAnimate, ngCookies, ngTouch, ngSanitize, $http, ngMaterial, Stylus, TypeScript]', function () {

    before(function () {
      promptCase = _.assign(defaultPrompts, {
        jQuery: prompts.jQuery.values['jquery 1'],
        ui: prompts.ui.values['angular-material'],
        cssPreprocessor: prompts.cssPreprocessor.values.stylus,
        jsPreprocessor: prompts.jsPreprocessor.values.typescript
      });
    });

    it('should pass gulp build', function () {

      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'build').should.be.fulfilled.then(function () {
        assert.ok(fs.statSync(tempDirDist + '/index.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/404.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/favicon.ico').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets/images').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/scripts').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/styles').isDirectory(), 'Directory not exist');
      });
    });

    it('should pass gulp test', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'test').should.be.fulfilled;
    });

    it('should pass gulp protractor', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'protractor').should.be.fulfilled;
    });

    it('should pass gulp protractor:dist', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      return this.run(100000, 'protractor:dist').should.be.fulfilled;
    });
  });

  describe('with different path options: [src:src/angular/app e2e:tests/e2e dist:target/build/folder tmp:.tmp/folder] [angular 1.3.x, ngAnimate, ngCookies, ngTouch, ngSanitize, jQuery 1.x.x, ngResource, ngRoute, bootstrap, ui-bootstrap, node-sass]', function () {
    before(function () {
      promptCase = _.assign(defaultPrompts, {
        jQuery: prompts.jQuery.values['jquery 1'],
        ui: prompts.ui.values['angular-material'],
        cssPreprocessor: prompts.cssPreprocessor.values.stylus,
        jsPreprocessor: prompts.jsPreprocessor.values.typescript
      });

      tempDirDist = tempDir + '/target/build/folder';
    });

    it('should pass gulp build', function () {
      helpers.mockPrompt(gulpAngular, promptCase);

      defaultOptions = _.assign(defaultOptions, {
        'app-path': 'src/angular/app',
        'dist-path': 'target/build/folder',
        'e2e-path': 'tests/e2e',
        'tmp-path': '.tmp/folder'
      });

      return this.run(100000, 'build').should.be.fulfilled.then(function () {
        assert.ok(fs.statSync(tempDirDist + '/index.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/404.html').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/favicon.ico').isFile(), 'File not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/assets/images').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/fonts').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/scripts').isDirectory(), 'Directory not exist');
        assert.ok(fs.statSync(tempDirDist + '/styles').isDirectory(), 'Directory not exist');
      });
    });

    it('should pass gulp test', function () {
      helpers.mockPrompt(gulpAngular, defaultPrompts);

      defaultOptions = _.assign(defaultOptions, {
        'app-path': 'src/angular/app',
        'dist-path': 'target/build/folder',
        'e2e-path': 'tests/e2e',
        'tmp-path': '.tmp/folder'
      });

      return this.run(100000, 'test').should.be.fulfilled;
    });

    it('should pass gulp protractor', function () {
      helpers.mockPrompt(gulpAngular, defaultPrompts);

      defaultOptions = _.assign(defaultOptions, {
        'app-path': 'src/angular/app',
        'dist-path': 'target/build/folder',
        'e2e-path': 'tests/e2e',
        'tmp-path': '.tmp/folder'
      });

      return this.run(100000, 'protractor').should.be.fulfilled;
    });

    it('should pass gulp protractor:dist', function () {
      helpers.mockPrompt(gulpAngular, defaultPrompts);

      defaultOptions = _.assign(defaultOptions, {
        'app-path': 'src/angular/app',
        'dist-path': 'target/build/folder',
        'e2e-path': 'tests/e2e',
        'tmp-path': '.tmp/folder'
      });

      return this.run(100000, 'protractor:dist').should.be.fulfilled;
    });
  });
});
