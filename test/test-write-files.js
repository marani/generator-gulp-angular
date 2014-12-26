'use strict';

var files = require('../app/src/write');
var data = require('../app/files.json');
var _ = require('lodash');
require('chai').should();

describe('gulp-angular generator files', function () {

  it('should loads files.json to compute files', function () {

    var actualCopy = 0;
    var actualTemplate = 0;

    files.call({
      props: {
        paths: {
          src: 'src',
          dist: 'dist',
          e2e: 'e2e',
          tmp: '.tmp'
        }
      },
      _: _,
      fs: {
        copy: function() { actualCopy++; },
        copyTpl: function() { actualTemplate++; }
      },
      templatePath: function (string) { return string; },
      destinationPath: function (string) { return string; }
    });

    var expectedCopy =
      data.staticFiles.length +
      data.dotFiles.length;

    var expectedTemplate =
      data.templates.length;

    actualCopy.should.be.equal(expectedCopy);
    actualTemplate.should.be.equal(expectedTemplate);
  });

});
