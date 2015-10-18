(function() {
  var dependencies;

  dependencies = ['invoice', 'jquery', 'handlebars', 'underscore.string', 'i18next', 'json!translation_nl', 'json!translation_en', 'css-regions', 'underscore', 'underscore.string'];

  define(dependencies, function() {
    var $, Handlebars, Invoice, TemplateController, _, cssRegions, enMap, i18n, nlMap, s;
    Invoice = arguments[0], $ = arguments[1], Handlebars = arguments[2], s = arguments[3], i18n = arguments[4], nlMap = arguments[5], enMap = arguments[6], cssRegions = arguments[7], _ = arguments[8], s = arguments[9];
    TemplateController = (function() {
      var render;

      function TemplateController() {
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
        if (Nota.phantomRuntime) {
          require(['css-regions'], function(cssRegions) {
            console.log("TODO: finished pagination implementation in browser preview");
            return console.log("TODO: implement page numbers");
          });
        }
        this.template = Handlebars.compile($('script#template').html());
      }

      render = function(data) {
        var contextMessage, error, i, invoice, item, len, ref;
        Nota.trigger('template:render:start');
        invoice = new Invoice(data);
        try {
          invoice.validate(data);
        } catch (_error) {
          error = _error;
          contextMessage = "An error ocurred during rendering. The provided data to render is not a valid model for this template.";
          onError(error);
          Nota.logError(contextMessage, error);
        }
        i18n.setLng(invoice.language());
        Handlebars.registerHelper('currency', invoice.currency);
        Handlebars.registerHelper('decapitalize', invoice.decapitalize);
        ref = invoice.invoiceItems;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          item.subtotal = invoice.itemSubtotal(item);
        }
        $('body').html(this.template(invoice));
        Nota.setDocumentMeta(function() {
          return invoice.documentMeta.apply(invoice, arguments);
        });
        return Nota.trigger('template:render:done');
      };

      return TemplateController;

    })();
    return TemplateController;
  });

}).call(this);
