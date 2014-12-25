'use strict';

var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var prompts = require('./prompts.json');
var options = require('./options.json');
var utils = require('./src/utils.js');

var GulpAngularGenerator = yeoman.generators.Base.extend({

  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // Define the appName
    this.argument('appName', {
      type: String,
      required: false
    });

    this.appName = this.appName || path.basename(process.cwd());
    this.appName = this._.camelize(this._.slugify(this._.humanize(this.appName)));

    options.forEach(function(option) {
      this.option(option.name, {
        type: global[option.type],
        required: option.required,
        desc: option.desc,
        defaults: option.defaults
      });
    }.bind(this));
  },

  info: function () {
    if (!this.options['skip-welcome-message']) {
      this.log(yosay(
        chalk.red('Welcome!') + '\n' +
        chalk.yellow('You\'re using the fantastic generator for scaffolding an application with Angular and Gulp!')
      ));
    }
    if (this.options['default']) {
      var mockPrompts = require('./src/mock-prompts.js');
      var mockOptions = require('./src/mock-options.js');
      this.config.set('props', mockPrompts.defaults);
      this.config.set('options', mockOptions.defaults);

      this.log('__________________________');
      this.log('You use ' + chalk.green('--default') + ' option:');
      this.log('\t* angular 1.3.x\n\t* ngAnimate\n\t* ngCookies\n\t* ngTouch\n\t* ngSanitize\n\t* jQuery 1.x.x\n\t* ngResource\n\t* ngRoute\n\t* bootstrap\n\t* ui-bootstrap\n\t* node-sass');
      this.log('__________________________\n');
    }
  },

  checkYoRc: function() {
    var cb = this.async();

    if(this.config.get('props') && this.config.get('options') && !this.options['default']) {
      this.prompt([{
        type: 'confirm',
        name: 'skipConfig',
        message: 'Existing ' + chalk.green('.yo-rc') + ' configuration found, would you like to use it?',
        default: true,
      }], function (answers) {
        this.skipConfig = answers.skipConfig;

        cb();
      }.bind(this));
    } else {
      cb();
    }
  },

  retrieveOptions: function() {
    if (this.skipConfig || this.options['default']) {
      return;
    }

    ['app-path', 'dist-path', 'e2e-path', 'tmp-path'].forEach(function (name) {
      this.options[name] = utils.normalizePath(this.options[name]);
    }.bind(this));

    var savingOptions = {};
    options.forEach(function(option) {
      if (option.save) {
        savingOptions[option.name] = this.options[option.name];
      }
    }.bind(this));
    this.config.set('options', savingOptions);
  },

  askQuestions: function () {
    if (this.skipConfig || this.options['default']) {
      return ;
    }

    var done = this.async();

    this._.findWhere(prompts, {name: 'bootstrapComponents'}).when = function(props) {
      return props.ui.key === 'bootstrap';
    };

    this._.findWhere(prompts, {name: 'foundationComponents'}).when = function(props) {
      return props.ui.key === 'foundation';
    };

    this.prompt(prompts, function (props) {
      if(props.ui.key !== 'bootstrap') {
        props.bootstrapComponents = {
          name: null,
          version: null,
          key: null,
          module: null
        };
      }

      if(props.ui.key !== 'foundation') {
        props.foundationComponents = {
          name: null,
          version: null,
          key: null,
          module: null
        };
      }

      this.props = props;
      this.config.set('props', this.props);

      done();
    }.bind(this));
  },

  // Format props to template values
  formatProps: require('./src/format'),

  // Write files (copy, template)
  writeFiles: require('./src/write'),

  // Install dependencies
  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: this.options['skip-message']
    });
  }
});

module.exports = GulpAngularGenerator;
