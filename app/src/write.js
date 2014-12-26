'use strict';

var files = require('../files.json');
var path = require('path');

/* Process files */
module.exports = function () {
  var _ = this._;

  // Replace sourceFolder with destFolder in destination path
  // folderPairs is a dictionary of source:dest similar to what 
  // stored in this.props.paths
  function applyPathConfig(filePath, folderPairs) {
    var result = filePath;
    _.forEach(folderPairs, function(destFolder, sourceFolder) {
      if (filePath.indexOf(sourceFolder) === 0)
        result = filePath.replace(sourceFolder, destFolder);
    });
    return result;
  }

  // Copy static files
  _.forEach(files.staticFiles, function(src) {
    var dest = applyPathConfig(src, this.props.paths);
    this.fs.copy(this.templatePath(src),  this.destinationPath(dest));
  }.bind(this));

  // Copy dot files
  _.forEach(files.dotFiles, function(src) {
    this.fs.copy(this.templatePath(src),  this.destinationPath('.' + src));
  }.bind(this));

  // Copy files formatted (format.js) with options selected in prompt
  _.forEach(this.technologiesLogoCopies, function(src) {
    var dest = applyPathConfig(src, this.props.paths);
    this.fs.copy(this.templatePath(src),  this.destinationPath(dest));
  }.bind(this));
  _.forEach(this.partialCopies, function(value, key) {
    var dest = applyPathConfig(value, this.props.paths);
    this.fs.copy(this.templatePath(key),  this.destinationPath(dest));
  }.bind(this));
  _.forEach(this.styleCopies, function(value, key) {
    var dest = applyPathConfig(value, this.props.paths);
    this.fs.copy(this.templatePath(key),  this.destinationPath(dest));
  }.bind(this));
  _.forEach(this.srcTemplates, function(value, key) {
    var dest = applyPathConfig(value, this.props.paths);
    this.template(key, dest);
  }.bind(this));
  _.forEach(this.lintConfCopies, function(src) {
    this.fs.copy(this.templatePath(src),  this.destinationPath(src));
  }.bind(this));

  // Create files with templates
  var basename;
  var src;
  _.forEach(files.templates, function(dest) {
    basename = path.basename(dest);
    src = dest.replace(basename, '_' + basename);
    dest = applyPathConfig(dest, this.props.paths);
    this.fs.copyTpl(this.templatePath(src),  this.destinationPath(dest), this);
  }.bind(this));
};
