'use strict';

var path = require('path');
var _ = require('lodash');

function normalizePath(str) {
  return path.relative(process.cwd(), path.join(process.cwd(), str));
}

/**
 * Replace sourceFolder with destFolder in filePath
 * if filePath has any sourceFolder as prefix
 * @param  {String} filePath    File path to be altered
 * @param  {Object} folderPairs Hash of pairs of sourceFolder:destFolder
 *                              Similar to what stored in this.props.paths
 * @return {String}             new file path
 */
function replacePrefix(filePath, folderPairs) {
  var result = filePath;
  _.some(folderPairs, function(destFolder, sourceFolder) {
    if (filePath.indexOf(sourceFolder) === 0) {
      result = filePath.replace(sourceFolder, destFolder);
      return true;
    }
    return false;
  });
  return result;
}

module.exports = {
  normalizePath: normalizePath,
  replacePrefix: replacePrefix
};