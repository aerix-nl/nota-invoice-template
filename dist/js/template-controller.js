(function() {
  var dependencies,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  dependencies = ['template-model', 'jquery', 'handlebars', 'underscore.string', 'i18next', 'json!translation_nl', 'json!translation_en', 'css-regions', 'underscore', 'underscore.string', 'material-design-lite'];

  define(dependencies, function() {
    var $, Handlebars, TemplateController, TemplateModel, _, cssRegions, enMap, i18n, mdl, nlMap, s;
    TemplateModel = arguments[0], $ = arguments[1], Handlebars = arguments[2], s = arguments[3], i18n = arguments[4], nlMap = arguments[5], enMap = arguments[6], cssRegions = arguments[7], _ = arguments[8], s = arguments[9], mdl = arguments[10];
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
        if (!Nota.phantomRuntime) {
          require(['css-regions'], function(cssRegions) {
            return console.log("TODO: pagination and page numbers in browser preview");
          });
        }
        this.templateMain = Handlebars.compile($('script#template-main').html());
        this.templatePartials = {
          'footer': $('script#template-footer').html()
        };
      }

      TemplateController.prototype.translate = function(i18n_key, count, attr, caselevel) {
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
      };

      TemplateController.prototype.render = function(data) {
        var $showClosing, contextMessage, errMsg, error, id, project, title, type;
        Nota.trigger('template:render:start');
        errMsg = "An error ocurred during rendering.";
        try {
          this.model = new TemplateModel(data);
          this.model.validate(data);
        } catch (_error) {
          error = _error;
          contextMessage = errMsg + " The provided data to render is not a valid model for this template.";
          this.renderError(error, contextMessage);
          Nota.logError(error, contextMessage);
        }
        i18n.setLng(this.model.language());
        Handlebars.registerHelper('i18n', this.translate);
        Handlebars.registerHelper('currency', this.model.currency);
        try {
          $('body').html(this.templateMain(this.model));
          type = this.translate(this.model.fiscalType(), null, null, 'capitalize');
          id = this.model.fullID();
          project = this.model.projectName;
          title = project != null ? type + " " + id + " - " + project : type + " " + id;
          $('head title').html(title);
        } catch (_error) {
          error = _error;
          contextMessage = errMsg + " Templating engine Handlebars.js encounted an error with the given data.";
          this.renderError(error, contextMessage);
          Nota.logError(error, contextMessage);
        }
        try {
          if (!Nota.phantomRuntime) {
            $showClosing = $('span#show-closing button');
            componentHandler.upgradeElement($showClosing[0]);
            $showClosing.click(function(e) {
              return $('span#closing').slideToggle();
            });
          }
        } catch (_error) {
          error = _error;
          contextMessage = errMsg + " Initializing Material Design Lite components failed.";
          this.renderError(error, contextMessage);
          Nota.logError(error, contextMessage);
        }
        try {
          Nota.setDocument('meta', this.model.documentMeta());
        } catch (_error) {
          error = _error;
          contextMessage = errMsg + " Failed to set the document meta data in the Nota capture client.";
          this.renderError(error, contextMessage);
          Nota.logError(error, contextMessage);
        }
        try {
          if (Nota.documentIsMultipage()) {
            Nota.setDocument('footer', {
              height: "1cm",
              contents: this.templatePartials.footer
            });
          }
        } catch (_error) {
          error = _error;
          contextMessage = errMsg + " Failed to set the document footer in the Nota capture client.";
          this.renderError(error, contextMessage);
          Nota.logError(error, contextMessage);
        }
        return Nota.trigger('template:render:done');
      };

      return TemplateController;

    })();
    return TemplateController;
  });

}).call(this);
