'use strict';

/**
 *
 * This module get default yo options from options.json 
 * to be easily used in tests and other places that requires default options
 * this object omits any unsavable options
 * 
 */

var options = require('../options.json');

var mockOptions = {
  defaults: {}
};

options.forEach(function(option) {
  if (option.save)
    mockOptions.defaults[option.name] = option.defaults;
});

module.exports = mockOptions;