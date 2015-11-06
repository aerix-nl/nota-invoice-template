(function() {
  'use strict';
  var base, dependencies, onDependenciesLoaded, onError;

  (base = Function.prototype).bind || (base.bind = function(_this) {
    return (function(_this) {
      return function() {
        return _this.apply(_this, arguments);
      };
    })(this);
  });

  requirejs.config({
    baseUrl: 'bower_components/',
    paths: {
      'jquery': 'jquery/dist/jquery',
      'underscore': 'underscore/underscore',
      'underscore.string': 'underscore.string/lib/underscore.string',
      'handlebars': 'handlebars/handlebars.amd',
      'material-design-lite': 'material-design-lite/material.min',
      'moment': 'momentjs/moment',
      'moment_nl': 'momentjs/locale/nl',
      'i18next': 'i18next/i18next.amd.withJQuery',
      'tv4': 'tv4/tv4',
      'json': 'requirejs-plugins/src/json',
      'text': 'requirejs-text/text',
      'requirejs': 'requirejs/require',
      'template-controller': '/dist/template-controller',
      'template-model': '/dist/template-model',
      'schema': '/json/schema.json',
      'translation_nl': '/json/locales/nl.json',
      'translation_en': '/json/locales/en.json',
      'css-regions': '/dist/vendor/css-regions-polyfill'
    }
  });

  dependencies = ['/nota/lib/client.js', 'template-controller'];

  onDependenciesLoaded = function() {
    var Nota, TemplateController, error, templateController;
    Nota = arguments[0], TemplateController = arguments[1];
    requirejs.onError = function(err) {
      throw err;
    };
    Nota.trigger('template:init');
    try {
      templateController = new TemplateController(onError);
    } catch (_error) {
      error = _error;
      onError(error);
      Nota.logError(error, "An error occured during template initialization.");
    }
    Nota.on('data:injected', templateController.render);
    Nota.trigger('template:loaded');
    Nota.getData(templateController.render);
    window.template = templateController;
    return templateController;
  };

  onError = function(error, contextMessage) {
    var errorList, li, manual, ref;
    if (window.errorTemplate == null) {
      window.errorTemplate = document.getElementById('template-error').innerHTML;
      document.body.innerHTML = window.errorTemplate;
    }
    if (window.errorListItem == null) {
      window.errorListItem = document.querySelectorAll("div.error-container ul li.error")[0];
      document.querySelectorAll("div.error-container ul")[0].innerHTML = "";
    }
    errorList = document.querySelectorAll("div.error-container ul")[0];
    li = errorListItem.cloneNode();
    li.innerHTML = contextMessage + ' ' + error;
    errorList.appendChild(li);
    if (((ref = error.requireModules) != null ? ref[0] : void 0) === "/nota/lib/client.js") {
      manual = document.querySelectorAll("div.manual-container")[0];
      manual.style.display = 'block';
    }
    if (error.requireModules != null) {
      throw error;
    }
  };

  requirejs.onError = onError;

  define(dependencies, onDependenciesLoaded, onError);

}).call(this);
