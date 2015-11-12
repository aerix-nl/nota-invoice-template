var dependencies,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

dependencies = ['template-model', 'jquery', 'handlebars', 'underscore.string', 'i18next', 'json!translation_nl', 'json!translation_en', 'underscore', 'underscore.string', 'material-design-lite'];

define(dependencies, function() {
  var $, Handlebars, TemplateController, TemplateModel, _, enMap, i18n, mdl, nlMap, s;
  TemplateModel = arguments[0], $ = arguments[1], Handlebars = arguments[2], s = arguments[3], i18n = arguments[4], nlMap = arguments[5], enMap = arguments[6], _ = arguments[7], s = arguments[8], mdl = arguments[9];
  TemplateController = (function() {
    function TemplateController(renderError, nota) {
      var css, ref, ref1, ref2;
      this.renderError = renderError;
      this.nota = nota;
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
      if (!((ref = this.nota) != null ? ref.phantomRuntime : void 0)) {
        css = '<link href="dist/css/material-design.css" rel="stylesheet" type="text/css" media="screen">';
        $('head link[role="normalize"]').after(css);
      }
      this.templateMain = Handlebars.compile($('script#template-main').html());
      this.templatePartials = {
        'footer': $('script#template-footer').html()
      };
      if ((ref1 = this.nota) != null) {
        ref1.on('data:injected', this.render);
      }
      if ((ref2 = this.nota) != null) {
        ref2.getData(this.render);
      }
      if (this.nota == null) {
        require(['json!preview-data'], this.render);
      }
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
      var $showClosing, contextMessage, errMsg, error, error1, error2, error3, error4, error5, id, project, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, title, type;
      if ((ref = this.nota) != null) {
        ref.trigger('template:render:start');
      }
      errMsg = "An error ocurred during rendering.";
      try {
        this.model = new TemplateModel(data);
        this.model.validate(data);
      } catch (error1) {
        error = error1;
        contextMessage = errMsg + " The provided data to render is not a valid model for this template.";
        this.renderError(error, contextMessage);
        if ((ref1 = this.nota) != null) {
          ref1.logError(error, contextMessage);
        }
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
      } catch (error2) {
        error = error2;
        contextMessage = errMsg + " Templating engine Handlebars.js encounted an error with the given data.";
        this.renderError(error, contextMessage);
        if ((ref2 = this.nota) != null) {
          ref2.logError(error, contextMessage);
        }
      }
      try {
        if (!((ref3 = this.nota) != null ? ref3.phantomRuntime : void 0)) {
          $showClosing = $('span#show-closing button');
          componentHandler.upgradeElement($showClosing[0]);
          $showClosing.click(function(e) {
            return $('span#closing').slideToggle();
          });
        }
      } catch (error3) {
        error = error3;
        contextMessage = errMsg + " Initializing Material Design Lite components failed.";
        this.renderError(error, contextMessage);
        if ((ref4 = this.nota) != null) {
          ref4.logError(error, contextMessage);
        }
      }
      try {
        if ((ref5 = this.nota) != null) {
          ref5.setDocument('meta', this.model.documentMeta());
        }
      } catch (error4) {
        error = error4;
        contextMessage = errMsg + " Failed to set the document meta data in the Nota capture client.";
        this.renderError(error, contextMessage);
        if ((ref6 = this.nota) != null) {
          ref6.logError(error, contextMessage);
        }
      }
      try {
        if ((ref7 = this.nota) != null ? ref7.documentIsMultipage() : void 0) {
          if ((ref8 = this.nota) != null) {
            ref8.setDocument('footer', {
              height: "1cm",
              contents: this.templatePartials.footer
            });
          }
        }
      } catch (error5) {
        error = error5;
        contextMessage = errMsg + " Failed to set the document footer in the Nota capture client.";
        this.renderError(error, contextMessage);
        if ((ref9 = this.nota) != null) {
          ref9.logError(error, contextMessage);
        }
      }
      return (ref10 = this.nota) != null ? ref10.trigger('template:render:done') : void 0;
    };

    return TemplateController;

  })();
  return TemplateController;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLWNvbnRyb2xsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsWUFBQTtFQUFBOztBQUFBLFlBQUEsR0FBZSxDQUNiLGdCQURhLEVBRWIsUUFGYSxFQUdiLFlBSGEsRUFJYixtQkFKYSxFQUtiLFNBTGEsRUFNYixxQkFOYSxFQU9iLHFCQVBhLEVBUWIsWUFSYSxFQVNiLG1CQVRhLEVBVWIsc0JBVmE7O0FBWWYsTUFBQSxDQUFPLFlBQVAsRUFBcUIsU0FBQTtBQUVuQixNQUFBO0VBQUMsNEJBQUQsRUFBZ0IsZ0JBQWhCLEVBQW1CLHlCQUFuQixFQUErQixnQkFBL0IsRUFBa0MsbUJBQWxDLEVBQXdDLG9CQUF4QyxFQUErQyxvQkFBL0MsRUFBc0QsZ0JBQXRELEVBQXlELGdCQUF6RCxFQUE0RDtFQUV0RDtJQUVTLDRCQUFDLFdBQUQsRUFBZSxJQUFmO0FBR1gsVUFBQTtNQUhZLElBQUMsQ0FBQSxjQUFEO01BQWMsSUFBQyxDQUFBLE9BQUQ7O01BRzFCLElBQUksQ0FBQyxJQUFMLENBQVU7UUFDUixRQUFBLEVBQ0U7VUFBQSxFQUFBLEVBQUk7WUFBRSxXQUFBLEVBQWEsS0FBZjtXQUFKO1VBQ0EsRUFBQSxFQUFJO1lBQUUsV0FBQSxFQUFhLEtBQWY7V0FESjtTQUZNO1FBTVIsaUJBQUEsRUFBbUIsU0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEdBQVYsRUFBZSxZQUFmLEVBQTZCLElBQTdCO0FBQ2pCLGdCQUFVLElBQUEsS0FBQSxDQUFNLFNBQU47UUFETyxDQU5YO09BQVY7TUFnQkEsSUFBRyxpQ0FBUyxDQUFFLHdCQUFkO1FBQ0UsR0FBQSxHQUFNO1FBSU4sQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsS0FBakMsQ0FBdUMsR0FBdkMsRUFMRjs7TUFRQSxJQUFDLENBQUEsWUFBRCxHQUFnQixVQUFVLENBQUMsT0FBWCxDQUFtQixDQUFBLENBQUUsc0JBQUYsQ0FBeUIsQ0FBQyxJQUExQixDQUFBLENBQW5CO01B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QXBCOztjQUNLLENBQUUsUUFBUCxDQUFnQixLQUFoQixFQUF1QixjQUF2QjtTQVpGOztnREFlSyxDQUFFLE9BQVAsQ0FBZSxzQkFBZjtJQWxGTTs7Ozs7QUFvRlYsU0FBTztBQS9KWSxDQUFyQiIsImZpbGUiOiJ0ZW1wbGF0ZS1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiZGVwZW5kZW5jaWVzID0gW1xuICAndGVtcGxhdGUtbW9kZWwnXG4gICdqcXVlcnknXG4gICdoYW5kbGViYXJzJ1xuICAndW5kZXJzY29yZS5zdHJpbmcnXG4gICdpMThuZXh0J1xuICAnanNvbiF0cmFuc2xhdGlvbl9ubCdcbiAgJ2pzb24hdHJhbnNsYXRpb25fZW4nXG4gICd1bmRlcnNjb3JlJ1xuICAndW5kZXJzY29yZS5zdHJpbmcnXG4gICdtYXRlcmlhbC1kZXNpZ24tbGl0ZSdcbl1cbmRlZmluZSBkZXBlbmRlbmNpZXMsICgpLT5cbiAgIyBVbnBhY2sgdGhlIGxvYWRlZCBkZXBlbmRlbmNpZXMgd2UgcmVjZWl2ZSBhcyBhcmd1bWVudHNcbiAgW1RlbXBsYXRlTW9kZWwsICQsIEhhbmRsZWJhcnMsIHMsIGkxOG4sIG5sTWFwLCBlbk1hcCwgXywgcywgbWRsXSA9IGFyZ3VtZW50c1xuXG4gIGNsYXNzIFRlbXBsYXRlQ29udHJvbGxlclxuXG4gICAgY29uc3RydWN0b3I6IChAcmVuZGVyRXJyb3IsIEBub3RhKS0+XG4gICAgICAjIFNldCB1cCBpbnRlcm5hdGlvbmFsaXNhdGlvbiB3aXRoIHN1cHBvcnQgZm9yIHRyYW5zbGF0aW9ucyBpbiBFbmdsaXNoXG4gICAgICAjIGFuZCBEdXRjaC5cbiAgICAgIGkxOG4uaW5pdCB7XG4gICAgICAgIHJlc1N0b3JlOlxuICAgICAgICAgIGVuOiB7IHRyYW5zbGF0aW9uOiBlbk1hcCB9XG4gICAgICAgICAgbmw6IHsgdHJhbnNsYXRpb246IG5sTWFwIH1cblxuICAgICAgICAjIEluIGNhc2Ugb2YgbWlzc2luZyB0cmFuc2xhdGlvblxuICAgICAgICBtaXNzaW5nS2V5SGFuZGxlcjogKGxuZywgbnMsIGtleSwgZGVmYXVsdFZhbHVlLCBsbmdzKSAtPlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBhcmd1bWVudHNcbiAgICAgIH1cblxuICAgICAgIyBJZiB3ZSdyZSBub3QgYnVpbGRpbmcgYSBQREYgd2UgYWRkIHRoZSBicm93c2VyIHN0eWxlc2hlZXQuIFNhZGx5XG4gICAgICAjIFBoYW50b21KUyBkb2Vzbid0IGNsZWFuIHVwIHRoZSBzdHlsZXMgY29tcGxldGVseSB3aGVuIHN0YXJ0aW5nIHRvXG4gICAgICAjIGNhcHR1cmUgdG8gUERGLCBsZWF2aW5nIHRoZSBtZWRpYT0nc2NyZWVuJyBvbmx5IHN0eWxlc2hlZXRzIGNhdXNpbmdcbiAgICAgICMgc3RyYW5nZSBlZmZlY3RzIG9uIHRoZSBsYXlvdXQgZXZlbiB0aG91Z2ggdGhleSBzaG91bGRuJ3QgYXBwbHkgKG9ubHlcbiAgICAgICMgbWVkaWE9J3ByaW50JywgYW5kIG1lZGlhPSdhbGwnIHNob3VsZCBhcHBseSkuIFRoaXMgZW5zdXJlcyB0aGV5J3JlIG5vdFxuICAgICAgIyBsb2FkZWQgYXQgYWxsIGlmIHdlJ3JlIGdvaW5nIHRvIGNhcHR1cmUgdG8gUERGIGFueXdheS5cbiAgICAgIGlmIG5vdCBAbm90YT8ucGhhbnRvbVJ1bnRpbWVcbiAgICAgICAgY3NzID0gJzxsaW5rIGhyZWY9XCJkaXN0L2Nzcy9tYXRlcmlhbC1kZXNpZ24uY3NzXCIgcmVsPVwic3R5bGVzaGVldFwiXG4gICAgICAgIHR5cGU9XCJ0ZXh0L2Nzc1wiIG1lZGlhPVwic2NyZWVuXCI+J1xuICAgICAgICAjIE1ha2Ugc3VyZSB0aGF0IGl0J3MgcHJlcGVuZGVkLCBzbyB0aGF0IHRoZSBiYXNlIHN0eWxlcyBjYW4gb3ZlcnJpZGVcbiAgICAgICAgIyBhIGZldyBNYXRlcmlhbCBEZXNpZ24gb25lcy5cbiAgICAgICAgJCgnaGVhZCBsaW5rW3JvbGU9XCJub3JtYWxpemVcIl0nKS5hZnRlcihjc3MpXG5cbiAgICAgICMgR2V0IGFuZCBjb21waWxlIHRlbXBsYXRlIG9uY2UgdG8gb3B0aW1pemUgZm9yIHJlbmRlcmluZyBpdGVyYXRpb25zIGxhdGVyXG4gICAgICBAdGVtcGxhdGVNYWluID0gSGFuZGxlYmFycy5jb21waWxlICQoJ3NjcmlwdCN0ZW1wbGF0ZS1tYWluJykuaHRtbCgpXG5cbiAgICAgIEB0ZW1wbGF0ZVBhcnRpYWxzID0ge1xuICAgICAgICAnZm9vdGVyJzogJCgnc2NyaXB0I3RlbXBsYXRlLWZvb3RlcicpLmh0bWwoKVxuICAgICAgfVxuXG4gICAgICAjIEFsc28gbGlzdGVuIGZvciBkYXRhIGJlaW5nIHNldFxuICAgICAgQG5vdGE/Lm9uICdkYXRhOmluamVjdGVkJywgQHJlbmRlclxuXG4gICAgICAjIElmIHJ1bm5pbmcgb3V0c2lkZSBQaGFudG9tSlMgd2UnbGwgaGF2ZSB0byBvdXIgZGF0YSBvdXJzZWx2ZXMgZnJvbSB0aGVcbiAgICAgICMgc2VydmVyXG4gICAgICBAbm90YT8uZ2V0RGF0YSBAcmVuZGVyXG5cbiAgICAgICMgSWYgd2UncmUgcnVubmluZyBzdGFuZC1hbG9uZSwgc2hvdyBzb21lIHByZXZpZXcgZGF0YSwgZm9yIG5vdyBJIGd1ZXNzIDopXG4gICAgICBpZiBub3QgQG5vdGE/IHRoZW4gcmVxdWlyZSBbJ2pzb24hcHJldmlldy1kYXRhJ10sIEByZW5kZXJcblxuXG5cbiAgICB0cmFuc2xhdGU6IChpMThuX2tleSwgY291bnQsIGF0dHIsIGNhc2VsZXZlbCktPlxuICAgICAgIyBUT0RPOiBGdWdseSBoYWNrIHRvIGdldCBIYW5kbGViYXJzIHRvIGV2YWx1YXRlIGEgZnVuY3Rpb24gd2hlbiBwYXNzZWQgdG9cbiAgICAgICMgYSBoZWxwZXIgYXMgdGhlIHZhbHVlXG4gICAgICBpZiBcImZ1bmN0aW9uXCIgaXMgdHlwZW9mIGkxOG5fa2V5IHRoZW4gaTE4bl9rZXkgPSBpMThuX2tleSgpXG5cbiAgICAgICMgSGFjayB0byBhY2hpZXZlIHBsdXJhbGl6YXRpb24gd2l0aCB0aGUgaGVscGVyXG4gICAgICBpZiBcIm51bWJlclwiIGlzIHR5cGVvZiBjb3VudFxuICAgICAgICB2YWx1ZSA9IGkxOG4udChpMThuX2tleSwgY291bnQ6IGNvdW50KVxuICAgICAgZWxzZSBpZiBcIm51bWJlclwiIGlzIHR5cGVvZiBjb3VudD9bYXR0cl1cbiAgICAgICAgdmFsdWUgPSBpMThuLnQoaTE4bl9rZXksIGNvdW50OiBjb3VudFthdHRyXSlcbiAgICAgIGVsc2VcbiAgICAgICAgdmFsdWUgPSBpMThuLnQoaTE4bl9rZXkpXG5cbiAgICAgICMgQWxzbyBpbXBsZW1lbnQgc2ltcGxlIGNhcGl0YWxpemF0aW9uIHdoaWxlIHdlJ3JlIGF0IGl0XG4gICAgICBzd2l0Y2ggY2FzZWxldmVsXG4gICAgICAgIHdoZW4gJ2xvd2VyY2FzZScgdGhlbiB2YWx1ZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHdoZW4gJ3VwcGVyY2FzZScgdGhlbiB2YWx1ZS50b1VwcGVyQ2FzZSgpXG4gICAgICAgIHdoZW4gJ2NhcGl0YWxpemUnIHRoZW4gcy5jYXBpdGFsaXplKHZhbHVlKVxuICAgICAgICBlbHNlIHZhbHVlXG5cblxuXG5cblxuICAgIHJlbmRlcjogKGRhdGEpPT5cbiAgICAgICMgU2lnbmFsIHRoYXQgd2UndmUgc3RhcnRlZCByZW5kZXJpbmdcbiAgICAgIEBub3RhPy50cmlnZ2VyICd0ZW1wbGF0ZTpyZW5kZXI6c3RhcnQnXG4gICAgICBlcnJNc2cgPSBcIkFuIGVycm9yIG9jdXJyZWQgZHVyaW5nIHJlbmRlcmluZy5cIlxuXG4gICAgICB0cnlcbiAgICAgICAgIyBUZW1wbGF0ZU1vZGVsIHByb3ZpZGVzIGhlbHBlcnMsIGZvcm1hdHRlcnMgYW5kIG1vZGVsIHZhbGlkYXRpb25cbiAgICAgICAgQG1vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwoZGF0YSlcbiAgICAgICAgQG1vZGVsLnZhbGlkYXRlKGRhdGEpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBUaGUgcHJvdmlkZWQgZGF0YVxuICAgICAgICB0byByZW5kZXIgaXMgbm90IGEgdmFsaWQgbW9kZWwgZm9yIHRoaXMgdGVtcGxhdGUuXCJcbiAgICAgICAgQHJlbmRlckVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgICAgQG5vdGE/LmxvZ0Vycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcblxuICAgICAgaTE4bi5zZXRMbmcgQG1vZGVsLmxhbmd1YWdlKClcblxuICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaTE4bicsIEB0cmFuc2xhdGVcbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2N1cnJlbmN5JywgQG1vZGVsLmN1cnJlbmN5XG4gICAgICBcbiAgICAgIHRyeVxuICAgICAgICAjIFRoZSBhY3V0YWwgcmVuZGVyaW5nIGNhbGwuIFJlc3VsdGluZyBIVE1MIGlzIHBsYWNlZCBpbnRvIGJvZHkgRE9NXG4gICAgICAgICQoJ2JvZHknKS5odG1sIEB0ZW1wbGF0ZU1haW4oQG1vZGVsKVxuXG4gICAgICAgIHR5cGUgPSBAdHJhbnNsYXRlKEBtb2RlbC5maXNjYWxUeXBlKCksIG51bGwsIG51bGwsICdjYXBpdGFsaXplJylcbiAgICAgICAgaWQgPSBAbW9kZWwuZnVsbElEKClcbiAgICAgICAgcHJvamVjdCA9IEBtb2RlbC5wcm9qZWN0TmFtZVxuICAgICAgICB0aXRsZSA9IGlmIHByb2plY3Q/XG4gICAgICAgICAgXCIje3R5cGV9ICN7aWR9IC0gI3twcm9qZWN0fVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcIiN7dHlwZX0gI3tpZH1cIlxuICAgICAgICAkKCdoZWFkIHRpdGxlJykuaHRtbCB0aXRsZVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgIyBTdXBwbGVtZW50IGVycm9yIG1lc3NhZ2Ugd2l0aCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFuZCBmb3J3YXJkIGl0XG4gICAgICAgIGNvbnRleHRNZXNzYWdlID0gXCIje2Vyck1zZ30gVGVtcGxhdGluZyBlbmdpbmVcbiAgICAgICAgSGFuZGxlYmFycy5qcyBlbmNvdW50ZWQgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gZGF0YS5cIlxuICAgICAgICBAcmVuZGVyRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgICBAbm90YT8ubG9nRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuXG4gICAgICB0cnlcbiAgICAgICAgIyBIb29rIHVwIHNvbWUgTWF0ZXJpYWwgRGVzaWduIExpdGUgY29tcG9uZW50cyB0aGF0IGFyZSBwYXJ0IG9mIHRoZVxuICAgICAgICAjIHRlbXBsYXRlXG4gICAgICAgIGlmIG5vdCBAbm90YT8ucGhhbnRvbVJ1bnRpbWVcbiAgICAgICAgICAkc2hvd0Nsb3NpbmcgPSAkKCdzcGFuI3Nob3ctY2xvc2luZyBidXR0b24nKVxuICAgICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZUVsZW1lbnQgJHNob3dDbG9zaW5nWzBdXG4gICAgICAgICAgJHNob3dDbG9zaW5nLmNsaWNrIChlKS0+XG4gICAgICAgICAgICAkKCdzcGFuI2Nsb3NpbmcnKS5zbGlkZVRvZ2dsZSgpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBJbml0aWFsaXppbmcgTWF0ZXJpYWwgRGVzaWduIExpdGVcbiAgICAgICAgY29tcG9uZW50cyBmYWlsZWQuXCJcbiAgICAgICAgQHJlbmRlckVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgICAgQG5vdGE/LmxvZ0Vycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgIFxuICAgICAgdHJ5XG4gICAgICAgICMgUHJvdmlkZSBOb3RhIGNsaWVudCB3aXRoIG1ldGEgZGF0YSBmcm9tLiBUaGlzIGlzIGZldGNoZWQgYnlcbiAgICAgICAgIyBQaGFudG9tSlMgZm9yIGUuZy4gcHJvdmlkaW5nIHRoZSBwcm9wb3NlZCBmaWxlbmFtZSBvZiB0aGUgUERGLiBTZWVcbiAgICAgICAgIyB0aGUgTm90YSBjbGllbnQgQVBJIGZvciBkb2N1bWVudGF0aW9uLlxuICAgICAgICBAbm90YT8uc2V0RG9jdW1lbnQgJ21ldGEnLCBAbW9kZWwuZG9jdW1lbnRNZXRhKClcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICMgU3VwcGxlbWVudCBlcnJvciBtZXNzYWdlIHdpdGggY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhbmQgZm9yd2FyZCBpdFxuICAgICAgICBjb250ZXh0TWVzc2FnZSA9IFwiI3tlcnJNc2d9IEZhaWxlZCB0byBzZXQgdGhlIGRvY3VtZW50IG1ldGEgZGF0YSBpblxuICAgICAgICB0aGUgTm90YSBjYXB0dXJlIGNsaWVudC5cIlxuICAgICAgICBAcmVuZGVyRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgICBAbm90YT8ubG9nRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuXG4gICAgICB0cnlcbiAgICAgICAgIyBTZXQgZm9vdGVyIHRvIGdlbmVyYXRlIHBhZ2UgbnVtYmVycywgYnV0IG9ubHkgaWYgd2UncmUgc28gdGFsbCB0aGF0XG4gICAgICAgICMgd2Uga25vdyB3ZSdsbCBnZXQgbXVsdGlwbGUgcGFnZXMgYXMgb3V0cHV0XG4gICAgICAgIGlmIEBub3RhPy5kb2N1bWVudElzTXVsdGlwYWdlKCkgdGhlbiBAbm90YT8uc2V0RG9jdW1lbnQgJ2Zvb3RlcicsIHtcbiAgICAgICAgICBoZWlnaHQ6IFwiMWNtXCJcbiAgICAgICAgICBjb250ZW50czogQHRlbXBsYXRlUGFydGlhbHMuZm9vdGVyXG4gICAgICAgIH1cbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICMgU3VwcGxlbWVudCBlcnJvciBtZXNzYWdlIHdpdGggY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhbmQgZm9yd2FyZCBpdFxuICAgICAgICBjb250ZXh0TWVzc2FnZSA9IFwiI3tlcnJNc2d9IEZhaWxlZCB0byBzZXQgdGhlIGRvY3VtZW50IGZvb3RlciBpbiB0aGVcbiAgICAgICAgTm90YSBjYXB0dXJlIGNsaWVudC5cIlxuICAgICAgICBAcmVuZGVyRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgICBAbm90YT8ubG9nRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuXG4gICAgICAjIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUgd2l0aCByZW5kZXJpbmcgYW5kIHRoYXQgY2FwdHVyZSBjYW4gYmVnaW5cbiAgICAgIEBub3RhPy50cmlnZ2VyICd0ZW1wbGF0ZTpyZW5kZXI6ZG9uZSdcblxuICByZXR1cm4gVGVtcGxhdGVDb250cm9sbGVyIl19
