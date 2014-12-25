'use strict';

var path = require('path');

module.exports = function () {
  var _ = this._;

  // Retrieve props & options stored in .yo-rc.json
  if (this.skipConfig || this.options['default']) {
    this.props = this.config.get('props');

    var options = this.config.get('options');
    this._.forEach(options, function(value, name) {
      this.options[name] = value;
    }.bind(this));
  }

  // Format paths
  // this.paths stores pairs of source:dest folder
  this.paths = {
    src: this.options['app-path'],
    dist: this.options['dist-path'],
    e2e: this.options['e2e-path'],
    tmp: this.options['tmp-path']
  };
  // this.computedPaths stores relative pairs of paths
  // to make things convenient for templating
  this.computedPaths = {
    appToBower: path.relative(this.paths.src, '')
  };

  // Format list ngModules included in AngularJS DI
  var ngModules = this.props.angularModules.map(function (module) {
    return module.module;
  });

  ngModules = _.flatten([
    ngModules,
    this.props.resource.module,
    this.props.router.module,
    this.props.ui.module,
    this.props.bootstrapComponents.module,
    this.props.foundationComponents.module
  ]);

  this.modulesDependencies = _.chain(ngModules)
    .filter(_.isString)
    .map(function (dependency) {
      return '\'' + dependency + '\'';
    })
    .valueOf()
    .join(', ');

  // Format list techs used to generate app included in main view of sample
  var listTechs = require('../techs.json');

  var usedTechs = [
    'angular', 'browsersync', 'gulp', 'jasmine', 'karma', 'protractor',
    this.props.jQuery.name,
    this.props.ui.key,
    this.props.bootstrapComponents.key,
    this.props.foundationComponents.key,
    this.props.cssPreprocessor.key,
    this.props.jsPreprocessor.key
  ]
    .filter(_.isString)
    .filter(function(tech) {
      return tech !== 'default' && tech !== 'css' && tech !== 'official' && tech !== 'none';
    });

  _.forEach(this.props.htmlPreprocessors, function(preprocessor) {
    usedTechs.push(preprocessor.key);
  });

  var techsContent = _.map(usedTechs, function(value) {
    return listTechs[value];
  });

  this.technologies = JSON.stringify(techsContent, null, 2)
    .replace(/'/g, '\\\'')
    .replace(/"/g, '\'')
    .replace(/\n/g, '\n    ');
  this.technologiesLogoCopies = _.map(usedTechs, function(value) {
    return 'src/assets/images/' + listTechs[value].logo;
  });

  this.partialCopies = {};

  var navbarPartialSrc = 'src/components/navbar/__' + this.props.ui.key + '-navbar.html';
  this.partialCopies[navbarPartialSrc] = 'src/components/navbar/navbar.html';

  var routerPartialSrc = 'src/app/main/__' + this.props.ui.key + '.html';
  if(this.props.router.module !== null) {
    this.partialCopies[routerPartialSrc] = 'src/app/main/main.html';
  }

  // Compute routing relative to props.router
  if (this.props.router.module === 'ngRoute') {
    this.routerHtml = '<div ng-view></div>';
    this.routerJs = this.read('src/app/__ngroute.' + this.props.jsPreprocessor.extension, 'utf8');
  } else if (this.props.router.module === 'ui.router') {
    this.routerHtml = '<div ui-view></div>';
    this.routerJs = this.read('src/app/__uirouter.' + this.props.jsPreprocessor.extension, 'utf8');
  } else {
    this.routerHtml = this.read(routerPartialSrc, 'utf8');
    this.routerHtml = this.routerHtml.replace(
      /^<div class="container">/,
      '<div class="container" ng-controller="MainCtrl">'
    );

    this.routerHtml = this.routerHtml.replace(/\n/g, '\n    ');
    this.routerJs = '';
  }

  // Wiredep exclusions
  this.wiredepExclusions = [];
  if (this.props.ui.key === 'bootstrap') {
    if(this.props.bootstrapComponents.key !== 'official') {

      if(this.props.cssPreprocessor.extension === 'scss') {
        this.wiredepExclusions.push('/bootstrap-sass-official/');
      } else {
        this.wiredepExclusions.push('/bootstrap\\.js/');
      }
    }

    if(this.props.cssPreprocessor.key !== 'none') {
      this.wiredepExclusions.push('/bootstrap\\.css/');
    }

  } else if (this.props.ui.key === 'foundation') {

    if(this.props.foundationComponents.key !== 'official') {
      this.wiredepExclusions.push('/foundation\\.js/');
    }

    if(this.props.cssPreprocessor.key !== 'none') {
      this.wiredepExclusions.push('/foundation\\.css/');
    }
  }
  if(this.props.cssPreprocessor.key !== 'none') {
    this.wiredepExclusions.push('/bootstrap\\.css/');
    this.wiredepExclusions.push('/foundation\\.css/');
  }

  // Format choice UI Framework
  if(this.props.ui.key.indexOf('bootstrap') !== -1 && this.props.cssPreprocessor.extension !== 'scss') {
    this.props.ui.name = 'bootstrap';
  }

  this.styleCopies = {};

  var styleAppSrc = 'src/app/__' + this.props.ui.key + '-index.' + this.props.cssPreprocessor.extension;
  this.styleCopies[styleAppSrc] = 'src/app/index.' + this.props.cssPreprocessor.extension;

  // There is 2 ways of dealing with vendor styles
  // - If the vendor styles exist in the css preprocessor chosen,
  //   the best is to include directly the source files
  // - If not, the vendor styles are simply added as standard css links
  //
  // isVendorStylesPreprocessed defines which solution has to be used
  // regarding the ui framework and the css preprocessor chosen.
  this.isVendorStylesPreprocessed = false;

  if(this.props.cssPreprocessor.extension === 'scss') {
    if(this.props.ui.key === 'bootstrap' || this.props.ui.key === 'foundation') {
      this.isVendorStylesPreprocessed = true;
    }
  } else if(this.props.cssPreprocessor.extension === 'less') {
    if(this.props.ui.key === 'bootstrap') {
      this.isVendorStylesPreprocessed = true;
    }
  }

  if(this.isVendorStylesPreprocessed && this.props.ui.name !== null) {
    var styleVendorSource = 'src/app/__' + this.props.ui.key + '-vendor.' + this.props.cssPreprocessor.extension;
    this.styleCopies[styleVendorSource] = 'src/app/vendor.' + this.props.cssPreprocessor.extension;
  }

  //JS Preprocessor files
  var files = [
    'src/app/index',
    'src/app/main/main.controller',
    'src/components/navbar/navbar.controller'
  ];

  this.srcTemplates = {};
  files.forEach(function(file) {
    var basename = path.basename(file);
    var dest = file + '.' + this.props.jsPreprocessor.extension;
    var src = file.replace(basename, '_' + basename) + '.' + this.props.jsPreprocessor.srcExtension;
    this.srcTemplates[src] = dest;
  }, this);

  this.lintConfCopies = [];
  if(this.props.jsPreprocessor.key === 'coffee') {
    this.lintConfCopies.push('coffeelint.json');
  }

  function dependencyString(dep, version) {
    return '"' + dep + '": ' + '"' + version + '"';
  }

  this.consolidateExtensions = [];

  this.npmDevDependencies = [];
  this.consolidateParameters = [];

  // Adding npm dev dependencies
  _.forEach(this.props.htmlPreprocessors, function(preprocessor) {
    _.forEach(preprocessor.npm, function(version, dep) {
      this.npmDevDependencies.push(dependencyString(dep, version));
    }.bind(this));
    this.consolidateParameters.push(
      JSON.stringify(preprocessor.consolidate).
        replace(/"/g,'\'')); // Replace " with ' and assume this won't break anything.
    this.consolidateExtensions.push(preprocessor.extension);
  }.bind(this));
};
