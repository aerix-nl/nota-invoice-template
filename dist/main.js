(function() {
  'use strict';
  var base, dependencies, onDependenciesLoaded, onDependencyError;

  (base = Function.prototype).bind || (base.bind = function(_this) {
    return (function(_this) {
      return function() {
        return _this.apply(_this, arguments);
      };
    })(this);
  });

  requirejs.config({
    baseUrl: '../bower_components/',
    enforceDefine: true,
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
      'invoice': '/dist/invoice',
      'schema': '/json/schema.json',
      'translation_nl': '/json/locales/nl.json',
      'translation_en': '/json/locales/en.json'
    },
    shim: {
      rivets: {
        deps: ['sightglass']
      }
    }
  });

  dependencies = ['/nota/lib/client.js', 'invoice', 'jquery', 'handlebars', 'underscore.string', 'i18next', 'json!translation_nl', 'json!translation_en', 'moment', 'moment_nl'];

  onDependenciesLoaded = function(Nota, Invoice, $, Handlebars, s, i18n, nlMap, enMap, moment) {
    var e, initializeTemplate, render;
    initializeTemplate = function() {
      var render, template;
      i18n.init({
        resStore: {
          en: {
            translation: enMap
          },
          nl: {
            translation: nlMap
          }
        },
        missingKeyHandler: function(lng, ns, key, defaultValue, lngs) {
          throw new Error(arguments);
        }
      });
      Handlebars.registerHelper('i18n', function(i18n_key, count, attr, caselevel) {
        var value;
        if ("function" === typeof i18n_key) {
          i18n_key = i18n_key();
        }
        if ("number" === typeof count) {
          value = i18n.t(i18n_key, {
            count: count
          });
        } else if ("number" === typeof (count != null ? count[attr] : void 0)) {
          value = i18n.t(i18n_key, {
            count: count[attr]
          });
        } else {
          value = i18n.t(i18n_key);
        }
        switch (caselevel) {
          case 'lowercase':
            return value.toLowerCase();
          case 'uppercase':
            return value.toUpperCase();
          case 'capitalize':
            return s.capitalize(value);
          default:
            return value;
        }
      });
      template = Handlebars.compile($('script#template').html());
      render = function(data) {
        var e, i, invoice, item, len, ref;
        Nota.trigger('template:render:start');
        invoice = new Invoice(data);
        try {
          invoice.validate(data);
        } catch (_error) {
          e = _error;
          throw new Error("An error ocurred during rendering. The provided data to render is not a valid model for this template. " + e.message);
        }
        i18n.setLng(invoice.language());
        Handlebars.registerHelper('currency', invoice.currency);
        Handlebars.registerHelper('decapitalize', invoice.decapitalize);
        ref = invoice.invoiceItems;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          item.subtotal = invoice.itemSubtotal(item);
        }
        $('body').html(template(invoice));
        Nota.setDocumentMeta(function() {
          return invoice.documentMeta.apply(invoice, arguments);
        });
        return Nota.trigger('template:render:done');
      };
      Nota.getData(render);
      Nota.on('data:injected', render);
      return render;
    };
    Nota.trigger('template:init');
    try {
      render = initializeTemplate();
      Nota.trigger('template:loaded');
    } catch (_error) {
      e = _error;
      console.error("An error occured during template initialization:");
      throw e;
    }
    return window.render = render;
  };

  onDependencyError = function(error) {
    var errorList, li;
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
    throw error;
  };

  requirejs.onError = onDependencyError;

  define(dependencies, onDependenciesLoaded, onDependencyError);

}).call(this);
