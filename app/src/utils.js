'use strict';

var path = require('path');

function normalizePath (str) {
  return path.relative(process.cwd(), path.join(process.cwd(), str));
}

module.exports = {
  normalizePath: normalizePath
}