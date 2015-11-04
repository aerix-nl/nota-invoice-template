(function() {
  var dependencies,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  dependencies = ['template-model', 'jquery', 'handlebars', 'underscore.string', 'i18next', 'json!translation_nl', 'json!translation_en', 'css-regions', 'underscore', 'underscore.string'];

  define(dependencies, function() {
    var $, Handlebars, TemplateController, TemplateModel, _, cssRegions, enMap, i18n, nlMap, s;
    TemplateModel = arguments[0], $ = arguments[1], Handlebars = arguments[2], s = arguments[3], i18n = arguments[4], nlMap = arguments[5], enMap = arguments[6], cssRegions = arguments[7], _ = arguments[8], s = arguments[9];
    TemplateController = (function() {
      function TemplateController(renderError) {
        this.renderError = renderError;
        this.render = bind(this.render, this);
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
        if (!Nota.phantomRuntime) {
          require(['css-regions'], function(cssRegions) {
            return console.log("TODO: pagination and page numbers in browser preview");
          });
        }
        this.template = Handlebars.compile($('script#template-main').html());
      }

      TemplateController.prototype.render = function(data) {
        var contextMessage, error, multipage;
        Nota.trigger('template:render:start');
        try {
          this.model = new TemplateModel(data);
          this.model.validate(data);
        } catch (_error) {
          error = _error;
          contextMessage = "An error ocurred during rendering. The provided data to render is not a valid model for this template.";
          this.renderError(error, contextMessage);
          Nota.logError(error, contextMessage);
        }
        i18n.setLng(this.model.language());
        Handlebars.registerHelper('currency', this.model.currency);
        Handlebars.registerHelper('decapitalize', this.model.decapitalize);
        try {
          $('body').html(this.template(this.model));
        } catch (_error) {
          error = _error;
          contextMessage = "An error ocurred during rendering. Templating engine Handlebars.js encounted an error with the given data.";
          this.renderError(error, contextMessage);
          Nota.logError(error, contextMessage);
        }
        Nota.setDocument('meta', this.model.documentMeta());
        multipage = ($('body').height() / 3.187864111498258) > 287;
        if (multipage) {
          Nota.setDocument('footer', {
            height: "1cm",
            contents: "<span style=\"float:right; font-family: Roboto, sans-serif; color:#8D9699 !important;\">\n  " + (i18n.t('page')) + " {{pageNum}} " + (i18n.t('of-page-num')) + " {{numPages}}\n</span>"
          });
        }
        return Nota.trigger('template:render:done');
      };

      return TemplateController;

    })();
    return TemplateController;
  });

}).call(this);
