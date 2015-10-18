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
    var Nota, TemplateController, error, template;
    Nota = arguments[0], TemplateController = arguments[1];
    requirejs.onError = function(err) {
      throw err;
    };
    Nota.trigger('template:init');
    try {
      template = new TemplateController();
    } catch (_error) {
      error = _error;
      onError(error);
      Nota.logError("An error occured during template initialization.", error);
    }
    Nota.on('data:injected', template.render);
    Nota.trigger('template:loaded');
    Nota.getData(template.render);
    return TemplateController;
  };

  onError = function(error, root) {
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
    li.innerHTML = error;
    errorList.appendChild(li);
    if (((ref = error.requireModules) != null ? ref[0] : void 0) === "/nota/lib/client.js") {
      console.log(44);
      manual = document.querySelectorAll("div.manual-container")[0];
      console.log(manual);
      manual.style.display = 'block';
    }
    if (error.requireModules != null) {
      throw error;
    }
  };

  requirejs.onError = onError;

  define(dependencies, onDependenciesLoaded, onError);

}).call(this);
