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
      var $showClosing, contextMessage, errMsg, error, error1, error2, error3, error4, error5, id, project, title, type;
      Nota.trigger('template:render:start');
      errMsg = "An error ocurred during rendering.";
      try {
        this.model = new TemplateModel(data);
        this.model.validate(data);
      } catch (error1) {
        error = error1;
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
      } catch (error2) {
        error = error2;
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
      } catch (error3) {
        error = error3;
        contextMessage = errMsg + " Initializing Material Design Lite components failed.";
        this.renderError(error, contextMessage);
        Nota.logError(error, contextMessage);
      }
      try {
        Nota.setDocument('meta', this.model.documentMeta());
      } catch (error4) {
        error = error4;
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
      } catch (error5) {
        error = error5;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLWNvbnRyb2xsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsWUFBQTtFQUFBOztBQUFBLFlBQUEsR0FBZSxDQUNiLGdCQURhLEVBRWIsUUFGYSxFQUdiLFlBSGEsRUFJYixtQkFKYSxFQUtiLFNBTGEsRUFNYixxQkFOYSxFQU9iLHFCQVBhLEVBUWIsYUFSYSxFQVNiLFlBVGEsRUFVYixtQkFWYSxFQVdiLHNCQVhhOztBQWFmLE1BQUEsQ0FBTyxZQUFQLEVBQXFCLFNBQUE7QUFFbkIsTUFBQTtFQUFDLDRCQUFELEVBQWdCLGdCQUFoQixFQUFtQix5QkFBbkIsRUFBK0IsZ0JBQS9CLEVBQWtDLG1CQUFsQyxFQUF3QyxvQkFBeEMsRUFBK0Msb0JBQS9DLEVBQXNELHlCQUF0RCxFQUFrRSxnQkFBbEUsRUFBcUUsZ0JBQXJFLEVBQXdFO0VBRWxFO0lBRVMsNEJBQUMsV0FBRDtNQUFDLElBQUMsQ0FBQSxjQUFEOztNQUVaLElBQUksQ0FBQyxJQUFMLENBQVU7UUFDUixRQUFBLEVBQ0U7VUFBQSxFQUFBLEVBQUk7WUFBRSxXQUFBLEVBQWEsS0FBZjtXQUFKO1VBQ0EsRUFBQSxFQUFJO1lBQUUsV0FBQSxFQUFhLEtBQWY7V0FESjtTQUZNO1FBTVIsaUJBQUEsRUFBbUIsU0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEdBQVYsRUFBZSxZQUFmLEVBQTZCLElBQTdCO0FBQ2pCLGdCQUFVLElBQUEsS0FBQSxDQUFNLFNBQU47UUFETyxDQU5YO09BQVY7TUFhQSxJQUFHLENBQUksSUFBSSxDQUFDLGNBQVo7UUFDRSxPQUFBLENBQVEsQ0FBQyxhQUFELENBQVIsRUFBeUIsU0FBQyxVQUFEO2lCQUd2QixPQUFPLENBQUMsR0FBUixDQUFZLHNEQUFaO1FBSHVCLENBQXpCLEVBREY7O01BT0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsQ0FBQSxDQUFFLHNCQUFGLENBQXlCLENBQUMsSUFBMUIsQ0FB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ZW1wbGF0ZS1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiZGVwZW5kZW5jaWVzID0gW1xuICAndGVtcGxhdGUtbW9kZWwnXG4gICdqcXVlcnknXG4gICdoYW5kbGViYXJzJ1xuICAndW5kZXJzY29yZS5zdHJpbmcnXG4gICdpMThuZXh0J1xuICAnanNvbiF0cmFuc2xhdGlvbl9ubCdcbiAgJ2pzb24hdHJhbnNsYXRpb25fZW4nXG4gICdjc3MtcmVnaW9ucydcbiAgJ3VuZGVyc2NvcmUnXG4gICd1bmRlcnNjb3JlLnN0cmluZydcbiAgJ21hdGVyaWFsLWRlc2lnbi1saXRlJ1xuXVxuZGVmaW5lIGRlcGVuZGVuY2llcywgKCktPlxuICAjIFVucGFjayB0aGUgbG9hZGVkIGRlcGVuZGVuY2llcyB3ZSByZWNlaXZlIGFzIGFyZ3VtZW50c1xuICBbVGVtcGxhdGVNb2RlbCwgJCwgSGFuZGxlYmFycywgcywgaTE4biwgbmxNYXAsIGVuTWFwLCBjc3NSZWdpb25zLCBfLCBzLCBtZGxdID0gYXJndW1lbnRzXG5cbiAgY2xhc3MgVGVtcGxhdGVDb250cm9sbGVyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEByZW5kZXJFcnJvciktPlxuICAgICAgIyBTZXQgdXAgaW50ZXJuYXRpb25hbGlzYXRpb24gd2l0aCBzdXBwb3J0IGZvciB0cmFuc2xhdGlvbnMgaW4gRW5nbGlzaCBhbmQgRHV0Y2hcbiAgICAgIGkxOG4uaW5pdCB7XG4gICAgICAgIHJlc1N0b3JlOlxuICAgICAgICAgIGVuOiB7IHRyYW5zbGF0aW9uOiBlbk1hcCB9XG4gICAgICAgICAgbmw6IHsgdHJhbnNsYXRpb246IG5sTWFwIH1cblxuICAgICAgICAjIEluIGNhc2Ugb2YgbWlzc2luZyB0cmFuc2xhdGlvblxuICAgICAgICBtaXNzaW5nS2V5SGFuZGxlcjogKGxuZywgbnMsIGtleSwgZGVmYXVsdFZhbHVlLCBsbmdzKSAtPlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBhcmd1bWVudHNcbiAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICMgSWYgd2UncmUgbm90IHJ1bm5pbmcgaW4gUGhhbnRvbUpTLCBlbXVsYXRlIHBhZ2luYXRpb24gaW4gdGhlIGJyb3dzZXJcbiAgICAgICMgdXNpbmcgQ1NTIFJlZ2lvbnMgYXMgcGFnZXMgKGFjdHVhbGx5LCB1c2luZyB0aGUgcG9seWZpbGwgdW50aWxsIG5hdGl2ZVxuICAgICAgIyBicm93c2VyIHN1cHBvcnQgZm9yIENTUyBSZWdpb3NuIGlzIGltcGxlbWVudGVkKS5cbiAgICAgIGlmIG5vdCBOb3RhLnBoYW50b21SdW50aW1lXG4gICAgICAgIHJlcXVpcmUgWydjc3MtcmVnaW9ucyddLCAoY3NzUmVnaW9ucyktPlxuICAgICAgICAgICMgQ1NTIHJlZ2lvbnMgaGFzIG5vdyBsb2FkZWQgYW5kIHNob3VsZCBoYXZlIHBlcmZvcm1lZCBhIHJlLWxheW91dCBvZiB0aGUgdGVtcGxhdGUnc1xuICAgICAgICAgICMgY29udGVudCBvdmVyIHRoZSByZWdpb25zIChwYWdlcykuXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJUT0RPOiBwYWdpbmF0aW9uIGFuZCBwYWdlIG51bWJlcnMgaW4gYnJvd3NlciBwcmV2aWV3XCJcblxuICAgICAgIyBHZXQgYW5kIGNvbXBpbGUgdGVtcGxhdGUgb25jZSB0byBvcHRpbWl6ZSBmb3IgcmVuZGVyaW5nIGl0ZXJhdGlvbnMgbGF0ZXJcbiAgICAgIEB0ZW1wbGF0ZU1haW4gPSBIYW5kbGViYXJzLmNvbXBpbGUgJCgnc2NyaXB0I3RlbXBsYXRlLW1haW4nKS5odG1sKClcblxuICAgICAgQHRlbXBsYXRlUGFydGlhbHMgPSB7XG4gICAgICAgICdmb290ZXInOiAkKCdzY3JpcHQjdGVtcGxhdGUtZm9vdGVyJykuaHRtbCgpXG4gICAgICB9XG5cblxuXG5cblxuXG4gICAgdHJhbnNsYXRlOiAoaTE4bl9rZXksIGNvdW50LCBhdHRyLCBjYXNlbGV2ZWwpLT5cbiAgICAgICMgVE9ETzogRnVnbHkgaGFjayB0byBnZXQgSGFuZGxlYmFycyB0byBldmFsdWF0ZSBhIGZ1bmN0aW9uIHdoZW4gcGFzc2VkIHRvXG4gICAgICAjIGEgaGVscGVyIGFzIHRoZSB2YWx1ZVxuICAgICAgaWYgXCJmdW5jdGlvblwiIGlzIHR5cGVvZiBpMThuX2tleSB0aGVuIGkxOG5fa2V5ID0gaTE4bl9rZXkoKVxuXG4gICAgICAjIEhhY2sgdG8gYWNoaWV2ZSBwbHVyYWxpemF0aW9uIHdpdGggdGhlIGhlbHBlclxuICAgICAgaWYgXCJudW1iZXJcIiBpcyB0eXBlb2YgY291bnRcbiAgICAgICAgdmFsdWUgPSBpMThuLnQoaTE4bl9rZXksIGNvdW50OiBjb3VudClcbiAgICAgIGVsc2UgaWYgXCJudW1iZXJcIiBpcyB0eXBlb2YgY291bnQ/W2F0dHJdXG4gICAgICAgIHZhbHVlID0gaTE4bi50KGkxOG5fa2V5LCBjb3VudDogY291bnRbYXR0cl0pXG4gICAgICBlbHNlXG4gICAgICAgIHZhbHVlID0gaTE4bi50KGkxOG5fa2V5KVxuXG4gICAgICAjIEFsc28gaW1wbGVtZW50IHNpbXBsZSBjYXBpdGFsaXphdGlvbiB3aGlsZSB3ZSdyZSBhdCBpdFxuICAgICAgc3dpdGNoIGNhc2VsZXZlbFxuICAgICAgICB3aGVuICdsb3dlcmNhc2UnIHRoZW4gdmFsdWUudG9Mb3dlckNhc2UoKVxuICAgICAgICB3aGVuICd1cHBlcmNhc2UnIHRoZW4gdmFsdWUudG9VcHBlckNhc2UoKVxuICAgICAgICB3aGVuICdjYXBpdGFsaXplJyB0aGVuIHMuY2FwaXRhbGl6ZSh2YWx1ZSlcbiAgICAgICAgZWxzZSB2YWx1ZVxuXG5cblxuXG5cbiAgICByZW5kZXI6IChkYXRhKT0+XG4gICAgICAjIFNpZ25hbCB0aGF0IHdlJ3ZlIHN0YXJ0ZWQgcmVuZGVyaW5nXG4gICAgICBOb3RhLnRyaWdnZXIgJ3RlbXBsYXRlOnJlbmRlcjpzdGFydCdcbiAgICAgIGVyck1zZyA9IFwiQW4gZXJyb3Igb2N1cnJlZCBkdXJpbmcgcmVuZGVyaW5nLlwiXG5cbiAgICAgIHRyeVxuICAgICAgICAjIFRlbXBsYXRlTW9kZWwgcHJvdmlkZXMgaGVscGVycywgZm9ybWF0dGVycyBhbmQgbW9kZWwgdmFsaWRhdGlvblxuICAgICAgICBAbW9kZWwgPSBuZXcgVGVtcGxhdGVNb2RlbChkYXRhKVxuICAgICAgICBAbW9kZWwudmFsaWRhdGUoZGF0YSlcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICMgU3VwcGxlbWVudCBlcnJvciBtZXNzYWdlIHdpdGggY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhbmQgZm9yd2FyZCBpdFxuICAgICAgICBjb250ZXh0TWVzc2FnZSA9IFwiI3tlcnJNc2d9IFRoZSBwcm92aWRlZCBkYXRhXG4gICAgICAgIHRvIHJlbmRlciBpcyBub3QgYSB2YWxpZCBtb2RlbCBmb3IgdGhpcyB0ZW1wbGF0ZS5cIlxuICAgICAgICBAcmVuZGVyRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgICBOb3RhLmxvZ0Vycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcblxuICAgICAgaTE4bi5zZXRMbmcgQG1vZGVsLmxhbmd1YWdlKClcblxuICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaTE4bicsIEB0cmFuc2xhdGVcbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2N1cnJlbmN5JywgQG1vZGVsLmN1cnJlbmN5XG4gICAgICBcbiAgICAgIHRyeVxuICAgICAgICAjIFRoZSBhY3V0YWwgcmVuZGVyaW5nIGNhbGwuIFJlc3VsdGluZyBIVE1MIGlzIHBsYWNlZCBpbnRvIGJvZHkgRE9NXG4gICAgICAgICQoJ2JvZHknKS5odG1sIEB0ZW1wbGF0ZU1haW4oQG1vZGVsKVxuXG4gICAgICAgIHR5cGUgPSBAdHJhbnNsYXRlKEBtb2RlbC5maXNjYWxUeXBlKCksIG51bGwsIG51bGwsICdjYXBpdGFsaXplJylcbiAgICAgICAgaWQgPSBAbW9kZWwuZnVsbElEKClcbiAgICAgICAgcHJvamVjdCA9IEBtb2RlbC5wcm9qZWN0TmFtZVxuICAgICAgICB0aXRsZSA9IGlmIHByb2plY3Q/IHRoZW4gXCIje3R5cGV9ICN7aWR9IC0gI3twcm9qZWN0fVwiIGVsc2UgXCIje3R5cGV9ICN7aWR9XCJcbiAgICAgICAgJCgnaGVhZCB0aXRsZScpLmh0bWwgdGl0bGVcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICMgU3VwcGxlbWVudCBlcnJvciBtZXNzYWdlIHdpdGggY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhbmQgZm9yd2FyZCBpdFxuICAgICAgICBjb250ZXh0TWVzc2FnZSA9IFwiI3tlcnJNc2d9IFRlbXBsYXRpbmcgZW5naW5lXG4gICAgICAgIEhhbmRsZWJhcnMuanMgZW5jb3VudGVkIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIGRhdGEuXCJcbiAgICAgICAgQHJlbmRlckVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgICAgTm90YS5sb2dFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG5cbiAgICAgIHRyeVxuICAgICAgICAjIEhvb2sgdXAgc29tZSBNYXRlcmlhbCBEZXNpZ24gTGl0ZSBjb21wb25lbnRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHRlbXBsYXRlXG4gICAgICAgIGlmIG5vdCBOb3RhLnBoYW50b21SdW50aW1lXG4gICAgICAgICAgJHNob3dDbG9zaW5nID0gJCgnc3BhbiNzaG93LWNsb3NpbmcgYnV0dG9uJylcbiAgICAgICAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVFbGVtZW50ICRzaG93Q2xvc2luZ1swXVxuICAgICAgICAgICRzaG93Q2xvc2luZy5jbGljayAoZSktPlxuICAgICAgICAgICAgJCgnc3BhbiNjbG9zaW5nJykuc2xpZGVUb2dnbGUoKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgIyBTdXBwbGVtZW50IGVycm9yIG1lc3NhZ2Ugd2l0aCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFuZCBmb3J3YXJkIGl0XG4gICAgICAgIGNvbnRleHRNZXNzYWdlID0gXCIje2Vyck1zZ30gSW5pdGlhbGl6aW5nIE1hdGVyaWFsIERlc2lnbiBMaXRlIGNvbXBvbmVudHMgZmFpbGVkLlwiXG4gICAgICAgIEByZW5kZXJFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG4gICAgICAgIE5vdGEubG9nRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgXG4gICAgICB0cnlcbiAgICAgICAgIyBQcm92aWRlIE5vdGEgY2xpZW50IHdpdGggbWV0YSBkYXRhIGZyb20uIFRoaXMgaXMgZmV0Y2hlZCBieSBQaGFudG9tSlNcbiAgICAgICAgIyBmb3IgZS5nLiBwcm92aWRpbmcgdGhlIHByb3Bvc2VkIGZpbGVuYW1lIG9mIHRoZSBQREYuIFNlZSB0aGUgTm90YSBjbGllbnRcbiAgICAgICAgIyBBUEkgZm9yIGRvY3VtZW50YXRpb24uXG4gICAgICAgIE5vdGEuc2V0RG9jdW1lbnQgJ21ldGEnLCBAbW9kZWwuZG9jdW1lbnRNZXRhKClcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICMgU3VwcGxlbWVudCBlcnJvciBtZXNzYWdlIHdpdGggY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhbmQgZm9yd2FyZCBpdFxuICAgICAgICBjb250ZXh0TWVzc2FnZSA9IFwiI3tlcnJNc2d9IEZhaWxlZCB0byBzZXQgdGhlIGRvY3VtZW50IG1ldGEgZGF0YSBpbiB0aGUgTm90YSBjYXB0dXJlIGNsaWVudC5cIlxuICAgICAgICBAcmVuZGVyRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgICBOb3RhLmxvZ0Vycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcblxuICAgICAgdHJ5XG4gICAgICAgICMgU2V0IGZvb3RlciB0byBnZW5lcmF0ZSBwYWdlIG51bWJlcnMsIGJ1dCBvbmx5IGlmIHdlJ3JlIHNvIHRhbGwgdGhhdCB3ZSBrbm93IHdlJ2xsIGdldFxuICAgICAgICAjIG11bHRpcGxlIHBhZ2VzIGFzIG91dHB1dCBcbiAgICAgICAgaWYgTm90YS5kb2N1bWVudElzTXVsdGlwYWdlKCkgdGhlbiBOb3RhLnNldERvY3VtZW50ICdmb290ZXInLCB7XG4gICAgICAgICAgaGVpZ2h0OiBcIjFjbVwiXG4gICAgICAgICAgY29udGVudHM6IEB0ZW1wbGF0ZVBhcnRpYWxzLmZvb3RlclxuICAgICAgICB9XG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBGYWlsZWQgdG8gc2V0IHRoZSBkb2N1bWVudCBmb290ZXIgaW4gdGhlIE5vdGEgY2FwdHVyZSBjbGllbnQuXCJcbiAgICAgICAgQHJlbmRlckVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgICAgTm90YS5sb2dFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG5cbiAgICAgICMgU2lnbmFsIHRoYXQgd2UncmUgZG9uZSB3aXRoIHJlbmRlcmluZyBhbmQgdGhhdCBjYXB0dXJlIGNhbiBiZWdpblxuICAgICAgTm90YS50cmlnZ2VyICd0ZW1wbGF0ZTpyZW5kZXI6ZG9uZSdcblxuICByZXR1cm4gVGVtcGxhdGVDb250cm9sbGVyIl19
