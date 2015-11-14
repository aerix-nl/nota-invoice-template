var dependencies,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

dependencies = ['template-model', 'i18n-controller', 'jquery', 'handlebars', 'underscore.string', 'underscore', 'underscore.string', 'material-design-lite', 'bluebird', "text!" + root + "templates/main.hbs", "text!" + root + "templates/footer.hbs", "text!" + root + "templates/error.hbs"];

define(dependencies, function() {
  var $, Handlebars, Promise, TemplateController, TemplateModel, _, i18nController, mdl, s, templates;
  TemplateModel = arguments[0], i18nController = arguments[1], $ = arguments[2], Handlebars = arguments[3], s = arguments[4], _ = arguments[5], s = arguments[6], mdl = arguments[7], Promise = arguments[8];
  templates = {
    main: arguments[9],
    footer: arguments[10],
    error: arguments[11]
  };
  TemplateController = (function() {
    function TemplateController(nota) {
      var css, error, error1, ref, ref1, ref2, ref3, ref4;
      this.nota = nota;
      this.render = bind(this.render, this);
      try {
        if ((ref = this.nota) != null) {
          ref.trigger('template:init');
        }
        this.templates = _.mapObject(templates, function(val, key) {
          return Handlebars.compile(val);
        });
        if (!((ref1 = this.nota) != null ? ref1.phantomRuntime : void 0)) {
          css = document.createElement('link');
          css.rel = 'stylesheet';
          css.href = 'dist/css/material-design.css';
          css.type = 'text/css';
          css.media = 'screen';
          $('head link[role="normalize"]').after(css);
        }
        if ((ref2 = this.nota) != null) {
          ref2.on('data:injected', this.render);
        }
        if ((ref3 = this.nota) != null) {
          ref3.getData(this.render);
        }
        if (this.nota == null) {
          require(['json!preview-data'], this.render);
        }
        if ((ref4 = this.nota) != null) {
          ref4.trigger('template:loaded');
        }
      } catch (error1) {
        error = error1;
        this.renderError(error, "An error occured during template initialization.");
      }
      return this;
    }

    TemplateController.prototype.renderError = function(error, contextMessage) {
      if (this.errorHistory == null) {
        this.errorHistory = [];
      }
      this.errorHistory.push({
        context: contextMessage,
        error: error
      });
      if (this.templates.error != null) {
        $('body').html(this.templates.error(this.errorHistory));
      }
      if (this.nota != null) {
        return this.nota.logError(error, contextMessage);
      } else {
        throw error;
      }
    };

    TemplateController.prototype.render = function(data) {
      var $showClosing, contextMessage, errMsg, error, error1, error2, error3, error4, error5, id, project, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, title, type;
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
      i18nController.setLanguage(this.model.language());
      Handlebars.registerHelper('currency', this.model.currency);
      try {
        $('body').html(this.templates.main(this.model));
        type = i18nController.translate(this.model.fiscalType(), null, null, 'capitalize');
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
        this.templates.footer();
        if ((this.nota != null) && this.nota.documentIsMultipage()) {
          this.nota.setDocument('footer', {
            height: "1cm",
            contents: this.templates.footer()
          });
        }
      } catch (error5) {
        error = error5;
        contextMessage = errMsg + " Failed to set the document footer in the Nota capture client.";
        this.renderError(error, contextMessage);
        if ((ref7 = this.nota) != null) {
          ref7.logError(error, contextMessage);
        }
      }
      return (ref8 = this.nota) != null ? ref8.trigger('template:render:done') : void 0;
    };

    return TemplateController;

  })();
  return TemplateController;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLWNvbnRyb2xsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsWUFBQTtFQUFBOztBQUFBLFlBQUEsR0FBZSxDQUNiLGdCQURhLEVBRWIsaUJBRmEsRUFHYixRQUhhLEVBSWIsWUFKYSxFQUtiLG1CQUxhLEVBTWIsWUFOYSxFQU9iLG1CQVBhLEVBUWIsc0JBUmEsRUFTYixVQVRhLEVBV2IsT0FBQSxHQUFRLElBQVIsR0FBYSxvQkFYQSxFQVliLE9BQUEsR0FBUSxJQUFSLEdBQWEsc0JBWkEsRUFhYixPQUFBLEdBQVEsSUFBUixHQUFhLHFCQWJBOztBQWVmLE1BQUEsQ0FBTyxZQUFQLEVBQXFCLFNBQUE7QUFFbkIsTUFBQTtFQUFDLDRCQUFELEVBQWdCLDZCQUFoQixFQUFnQyxnQkFBaEMsRUFBbUMseUJBQW5DLEVBQStDLGdCQUEvQyxFQUFrRCxnQkFBbEQsRUFBcUQsZ0JBQXJELEVBQXdELGtCQUF4RCxFQUE2RDtFQUU3RCxTQUFBLEdBQVk7SUFDVixJQUFBLEVBQVUsU0FBVSxDQUFBLENBQUEsQ0FEVjtJQUVWLE1BQUEsRUFBVSxTQUFVLENBQUEsRUFBQSxDQUZWO0lBR1YsS0FBQSxFQUFVLFNBQVUsQ0FBQSxFQUFBLENBSFY7O0VBTU47SUFFUyw0QkFBQyxJQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxPQUFEOztBQUNaOzthQUVPLENBQUUsT0FBUCxDQUFlLGVBQWY7O1FBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLENBQUMsU0FBRixDQUFZLFNBQVosRUFBdUIsU0FBQyxHQUFELEVBQU0sR0FBTjtpQkFBYSxVQUFVLENBQUMsT0FBWCxDQUFtQixHQUFuQjtRQUFiLENBQXZCO1FBUWIsSUFBRyxtQ0FBUyxDQUFFLHdCQUFkO1VBQ0UsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO1VBQ04sR0FBRyxDQUFDLEdBQUosR0FBVTtVQUNWLEdBQUcsQ0FBQyxJQUFKLEdBQVc7VUFD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QUFQLENBQWUsc0JBQWY7SUFuRk07Ozs7O0FBc0ZWLFNBQU87QUF4SlksQ0FBckIiLCJmaWxlIjoidGVtcGxhdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImRlcGVuZGVuY2llcyA9IFtcbiAgJ3RlbXBsYXRlLW1vZGVsJ1xuICAnaTE4bi1jb250cm9sbGVyJ1xuICAnanF1ZXJ5J1xuICAnaGFuZGxlYmFycydcbiAgJ3VuZGVyc2NvcmUuc3RyaW5nJ1xuICAndW5kZXJzY29yZSdcbiAgJ3VuZGVyc2NvcmUuc3RyaW5nJ1xuICAnbWF0ZXJpYWwtZGVzaWduLWxpdGUnXG4gICdibHVlYmlyZCdcblxuICBcInRleHQhI3tyb290fXRlbXBsYXRlcy9tYWluLmhic1wiXG4gIFwidGV4dCEje3Jvb3R9dGVtcGxhdGVzL2Zvb3Rlci5oYnNcIlxuICBcInRleHQhI3tyb290fXRlbXBsYXRlcy9lcnJvci5oYnNcIlxuXVxuZGVmaW5lIGRlcGVuZGVuY2llcywgKCktPlxuICAjIFVucGFjayB0aGUgbG9hZGVkIGRlcGVuZGVuY2llcyB3ZSByZWNlaXZlIGFzIGFyZ3VtZW50c1xuICBbVGVtcGxhdGVNb2RlbCwgaTE4bkNvbnRyb2xsZXIsICQsIEhhbmRsZWJhcnMsIHMsIF8sIHMsIG1kbCwgUHJvbWlzZV0gPSBhcmd1bWVudHNcblxuICB0ZW1wbGF0ZXMgPSB7XG4gICAgbWFpbjogICAgIGFyZ3VtZW50c1s5XVxuICAgIGZvb3RlcjogICBhcmd1bWVudHNbMTBdXG4gICAgZXJyb3I6ICAgIGFyZ3VtZW50c1sxMV1cbiAgfVxuXG4gIGNsYXNzIFRlbXBsYXRlQ29udHJvbGxlclxuXG4gICAgY29uc3RydWN0b3I6IChAbm90YSktPlxuICAgICAgdHJ5XG4gICAgICAgICMgU2lnbmFsIGJlZ2luIG9mIHRlbXBsYXRlIGluaXRpYWxpemF0aW9uXG4gICAgICAgIEBub3RhPy50cmlnZ2VyICd0ZW1wbGF0ZTppbml0J1xuXG4gICAgICAgIEB0ZW1wbGF0ZXMgPSBfLm1hcE9iamVjdCh0ZW1wbGF0ZXMsICh2YWwsIGtleSktPiBIYW5kbGViYXJzLmNvbXBpbGUodmFsKSApXG5cbiAgICAgICAgIyBJZiB3ZSdyZSBub3QgYnVpbGRpbmcgYSBQREYgd2UgYWRkIHRoZSBicm93c2VyIHN0eWxlc2hlZXQuIFNhZGx5XG4gICAgICAgICMgUGhhbnRvbUpTIGRvZXNuJ3QgY2xlYW4gdXAgdGhlIHN0eWxlcyBjb21wbGV0ZWx5IHdoZW4gc3RhcnRpbmcgdG9cbiAgICAgICAgIyBjYXB0dXJlIHRvIFBERiwgbGVhdmluZyB0aGUgbWVkaWE9J3NjcmVlbicgb25seSBzdHlsZXNoZWV0cyBjYXVzaW5nXG4gICAgICAgICMgc3RyYW5nZSBlZmZlY3RzIG9uIHRoZSBsYXlvdXQgZXZlbiB0aG91Z2ggdGhleSBzaG91bGRuJ3QgYXBwbHkgKG9ubHlcbiAgICAgICAgIyBtZWRpYT0ncHJpbnQnLCBhbmQgbWVkaWE9J2FsbCcgc2hvdWxkIGFwcGx5KS4gVGhpcyBlbnN1cmVzIHRoZXkncmUgbm90XG4gICAgICAgICMgbG9hZGVkIGF0IGFsbCBpZiB3ZSdyZSBnb2luZyB0byBjYXB0dXJlIHRvIFBERiBhbnl3YXkuXG4gICAgICAgIGlmIG5vdCBAbm90YT8ucGhhbnRvbVJ1bnRpbWVcbiAgICAgICAgICBjc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJylcbiAgICAgICAgICBjc3MucmVsID0gJ3N0eWxlc2hlZXQnXG4gICAgICAgICAgY3NzLmhyZWYgPSAnZGlzdC9jc3MvbWF0ZXJpYWwtZGVzaWduLmNzcydcbiAgICAgICAgICBjc3MudHlwZSA9ICd0ZXh0L2NzcydcbiAgICAgICAgICBjc3MubWVkaWEgPSAnc2NyZWVuJ1xuICAgICAgICAgICMgTWFrZSBzdXJlIHRoYXQgaXQncyBwcmVwZW5kZWQsIHNvIHRoYXQgdGhlIGJhc2Ugc3R5bGVzIGNhbiBvdmVycmlkZVxuICAgICAgICAgICMgYSBmZXcgTWF0ZXJpYWwgRGVzaWduIG9uZXMuXG4gICAgICAgICAgJCgnaGVhZCBsaW5rW3JvbGU9XCJub3JtYWxpemVcIl0nKS5hZnRlcihjc3MpXG5cbiAgICAgICAgIyBBbHNvIGxpc3RlbiBmb3IgZGF0YSBiZWluZyBzZXRcbiAgICAgICAgQG5vdGE/Lm9uICdkYXRhOmluamVjdGVkJywgQHJlbmRlclxuXG4gICAgICAgICMgSWYgcnVubmluZyBvdXRzaWRlIFBoYW50b21KUyB3ZSdsbCBoYXZlIHRvIG91ciBkYXRhIG91cnNlbHZlcyBmcm9tIHRoZVxuICAgICAgICAjIHNlcnZlclxuICAgICAgICBAbm90YT8uZ2V0RGF0YSBAcmVuZGVyXG5cbiAgICAgICAgIyBJZiB3ZSdyZSBydW5uaW5nIHN0YW5kLWFsb25lLCBzaG93IHNvbWUgcHJldmlldyBkYXRhLCBmb3Igbm93IEkgZ3Vlc3MgOilcbiAgICAgICAgaWYgbm90IEBub3RhP1xuICAgICAgICAgIHJlcXVpcmUgWydqc29uIXByZXZpZXctZGF0YSddLCBAcmVuZGVyXG5cbiAgICAgICAgIyBTaWduYWwgdGhhdCB3ZSdyZSBkb25lIHdpdGggc2V0dXAgYW5kIHRoYXQgd2UncmUgcmVhZHkgdG8gcmVjZWl2ZSBkYXRhXG4gICAgICAgIEBub3RhPy50cmlnZ2VyICd0ZW1wbGF0ZTpsb2FkZWQnXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBAcmVuZGVyRXJyb3IoZXJyb3IsIFwiQW4gZXJyb3Igb2NjdXJlZCBkdXJpbmcgdGVtcGxhdGUgaW5pdGlhbGl6YXRpb24uXCIpXG4gICAgICAgIFxuICAgICAgcmV0dXJuIHRoaXNcblxuICAgIHJlbmRlckVycm9yOiAoZXJyb3IsIGNvbnRleHRNZXNzYWdlKS0+XG4gICAgICBpZiBub3QgQGVycm9ySGlzdG9yeT8gdGhlbiBAZXJyb3JIaXN0b3J5ID0gW11cblxuICAgICAgQGVycm9ySGlzdG9yeS5wdXNoXG4gICAgICAgIGNvbnRleHQ6ICBjb250ZXh0TWVzc2FnZVxuICAgICAgICBlcnJvcjogICAgZXJyb3JcblxuICAgICAgaWYgQHRlbXBsYXRlcy5lcnJvcj9cbiAgICAgICAgJCgnYm9keScpLmh0bWwgQHRlbXBsYXRlcy5lcnJvcihAZXJyb3JIaXN0b3J5KVxuXG4gICAgICBpZiBAbm90YT8gdGhlbiBAbm90YS5sb2dFcnJvciBlcnJvciwgY29udGV4dE1lc3NhZ2VcbiAgICAgIGVsc2UgdGhyb3cgZXJyb3JcblxuICAgIHJlbmRlcjogKGRhdGEpPT5cbiAgICAgICMgU2lnbmFsIHRoYXQgd2UndmUgc3RhcnRlZCByZW5kZXJpbmdcbiAgICAgIEBub3RhPy50cmlnZ2VyICd0ZW1wbGF0ZTpyZW5kZXI6c3RhcnQnXG4gICAgICBlcnJNc2cgPSBcIkFuIGVycm9yIG9jdXJyZWQgZHVyaW5nIHJlbmRlcmluZy5cIlxuXG4gICAgICB0cnlcbiAgICAgICAgIyBUZW1wbGF0ZU1vZGVsIHByb3ZpZGVzIGhlbHBlcnMsIGZvcm1hdHRlcnMgYW5kIG1vZGVsIHZhbGlkYXRpb25cbiAgICAgICAgQG1vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwoZGF0YSlcbiAgICAgICAgQG1vZGVsLnZhbGlkYXRlKGRhdGEpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBUaGUgcHJvdmlkZWQgZGF0YVxuICAgICAgICB0byByZW5kZXIgaXMgbm90IGEgdmFsaWQgbW9kZWwgZm9yIHRoaXMgdGVtcGxhdGUuXCJcbiAgICAgICAgQHJlbmRlckVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgICAgQG5vdGE/LmxvZ0Vycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcblxuICAgICAgaTE4bkNvbnRyb2xsZXIuc2V0TGFuZ3VhZ2UgQG1vZGVsLmxhbmd1YWdlKClcbiAgICAgICMgVXBkYXRlIGN1cnJlbmN5IGhlbHBlciBiZWNhdXNlIGN1cnJlbmN5IHN5bWJvbCBtaWdodCBoYXZlIGNoYW5nZWQgd2l0aCBkYXRhXG4gICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdjdXJyZW5jeScsIEBtb2RlbC5jdXJyZW5jeVxuICAgICAgXG4gICAgICB0cnlcbiAgICAgICAgIyBUaGUgYWN1dGFsIHJlbmRlcmluZyBjYWxsLiBSZXN1bHRpbmcgSFRNTCBpcyBwbGFjZWQgaW50byBib2R5IERPTVxuICAgICAgICAkKCdib2R5JykuaHRtbCBAdGVtcGxhdGVzLm1haW4oQG1vZGVsKVxuXG4gICAgICAgIHR5cGUgPSBpMThuQ29udHJvbGxlci50cmFuc2xhdGUoQG1vZGVsLmZpc2NhbFR5cGUoKSwgbnVsbCwgbnVsbCwgJ2NhcGl0YWxpemUnKVxuICAgICAgICBpZCA9IEBtb2RlbC5mdWxsSUQoKVxuICAgICAgICBwcm9qZWN0ID0gQG1vZGVsLnByb2plY3ROYW1lXG4gICAgICAgIHRpdGxlID0gaWYgcHJvamVjdD9cbiAgICAgICAgICBcIiN7dHlwZX0gI3tpZH0gLSAje3Byb2plY3R9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiI3t0eXBlfSAje2lkfVwiXG4gICAgICAgICQoJ2hlYWQgdGl0bGUnKS5odG1sIHRpdGxlXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBUZW1wbGF0aW5nIGVuZ2luZVxuICAgICAgICBIYW5kbGViYXJzLmpzIGVuY291bnRlZCBhbiBlcnJvciB3aXRoIHRoZSBnaXZlbiBkYXRhLlwiXG4gICAgICAgIEByZW5kZXJFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG4gICAgICAgIEBub3RhPy5sb2dFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG5cbiAgICAgIHRyeVxuICAgICAgICAjIEhvb2sgdXAgc29tZSBNYXRlcmlhbCBEZXNpZ24gTGl0ZSBjb21wb25lbnRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlXG4gICAgICAgICMgdGVtcGxhdGVcbiAgICAgICAgaWYgbm90IEBub3RhPy5waGFudG9tUnVudGltZVxuICAgICAgICAgICRzaG93Q2xvc2luZyA9ICQoJ3NwYW4jc2hvdy1jbG9zaW5nIGJ1dHRvbicpXG4gICAgICAgICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlRWxlbWVudCAkc2hvd0Nsb3NpbmdbMF1cbiAgICAgICAgICAkc2hvd0Nsb3NpbmcuY2xpY2sgKGUpLT5cbiAgICAgICAgICAgICQoJ3NwYW4jY2xvc2luZycpLnNsaWRlVG9nZ2xlKClcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICMgU3VwcGxlbWVudCBlcnJvciBtZXNzYWdlIHdpdGggY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhbmQgZm9yd2FyZCBpdFxuICAgICAgICBjb250ZXh0TWVzc2FnZSA9IFwiI3tlcnJNc2d9IEluaXRpYWxpemluZyBNYXRlcmlhbCBEZXNpZ24gTGl0ZVxuICAgICAgICBjb21wb25lbnRzIGZhaWxlZC5cIlxuICAgICAgICBAcmVuZGVyRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgICBAbm90YT8ubG9nRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgXG4gICAgICB0cnlcbiAgICAgICAgIyBQcm92aWRlIE5vdGEgY2xpZW50IHdpdGggbWV0YSBkYXRhIGZyb20uIFRoaXMgaXMgZmV0Y2hlZCBieVxuICAgICAgICAjIFBoYW50b21KUyBmb3IgZS5nLiBwcm92aWRpbmcgdGhlIHByb3Bvc2VkIGZpbGVuYW1lIG9mIHRoZSBQREYuIFNlZVxuICAgICAgICAjIHRoZSBOb3RhIGNsaWVudCBBUEkgZm9yIGRvY3VtZW50YXRpb24uXG4gICAgICAgIEBub3RhPy5zZXREb2N1bWVudCAnbWV0YScsIEBtb2RlbC5kb2N1bWVudE1ldGEoKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgIyBTdXBwbGVtZW50IGVycm9yIG1lc3NhZ2Ugd2l0aCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFuZCBmb3J3YXJkIGl0XG4gICAgICAgIGNvbnRleHRNZXNzYWdlID0gXCIje2Vyck1zZ30gRmFpbGVkIHRvIHNldCB0aGUgZG9jdW1lbnQgbWV0YSBkYXRhIGluXG4gICAgICAgIHRoZSBOb3RhIGNhcHR1cmUgY2xpZW50LlwiXG4gICAgICAgIEByZW5kZXJFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG4gICAgICAgIEBub3RhPy5sb2dFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG5cbiAgICAgIHRyeVxuICAgICAgICAjIFNldCBmb290ZXIgdG8gZ2VuZXJhdGUgcGFnZSBudW1iZXJzLCBidXQgb25seSBpZiB3ZSdyZSBzbyB0YWxsIHRoYXRcbiAgICAgICAgIyB3ZSBrbm93IHdlJ2xsIGdldCBtdWx0aXBsZSBwYWdlcyBhcyBvdXRwdXRcbiAgICAgICAgQHRlbXBsYXRlcy5mb290ZXIoKVxuICAgICAgICBpZiBAbm90YT8gYW5kIEBub3RhLmRvY3VtZW50SXNNdWx0aXBhZ2UoKVxuICAgICAgICAgIEBub3RhLnNldERvY3VtZW50ICdmb290ZXInLCB7XG4gICAgICAgICAgICBoZWlnaHQ6IFwiMWNtXCJcbiAgICAgICAgICAgIGNvbnRlbnRzOiBAdGVtcGxhdGVzLmZvb3RlcigpXG4gICAgICAgICAgfVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgIyBTdXBwbGVtZW50IGVycm9yIG1lc3NhZ2Ugd2l0aCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFuZCBmb3J3YXJkIGl0XG4gICAgICAgIGNvbnRleHRNZXNzYWdlID0gXCIje2Vyck1zZ30gRmFpbGVkIHRvIHNldCB0aGUgZG9jdW1lbnQgZm9vdGVyIGluIHRoZVxuICAgICAgICBOb3RhIGNhcHR1cmUgY2xpZW50LlwiXG4gICAgICAgIEByZW5kZXJFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG4gICAgICAgIEBub3RhPy5sb2dFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG5cbiAgICAgICMgU2lnbmFsIHRoYXQgd2UncmUgZG9uZSB3aXRoIHJlbmRlcmluZyBhbmQgdGhhdCBjYXB0dXJlIGNhbiBiZWdpblxuICAgICAgQG5vdGE/LnRyaWdnZXIgJ3RlbXBsYXRlOnJlbmRlcjpkb25lJ1xuXG5cbiAgcmV0dXJuIFRlbXBsYXRlQ29udHJvbGxlciJdfQ==
