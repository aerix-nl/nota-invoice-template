var dependencies,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

dependencies = ['template-model', 'i18n-controller', 'jquery', 'handlebars', 'underscore.string', 'underscore', 'underscore.string', 'material-design-lite', 'bluebird', "text!" + root + "templates/main.hbs", "text!" + root + "templates/footer.hbs", "text!" + root + "templates/error.hbs"];

define(dependencies, function() {
  var $, Handlebars, Promise, TemplateController, TemplateModel, _, i18nController, mdl, s, templates;
  TemplateModel = arguments[0], i18nController = arguments[1], $ = arguments[2], Handlebars = arguments[3], s = arguments[4], _ = arguments[5], s = arguments[6], mdl = arguments[7], Promise = arguments[8];
  templates = {
    main: arguments[arguments.length - 3],
    footer: arguments[arguments.length - 2],
    error: arguments[arguments.length - 1]
  };
  TemplateController = (function() {
    function TemplateController(nota) {
      var css, error, error1, ref, ref1, ref2, ref3, ref4;
      this.nota = nota;
      this.render = bind(this.render, this);
      try {
        if ((ref = this.nota) != null) {
          ref.trigger('template:init:start');
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
          ref4.trigger('template:init:done');
        }
      } catch (error1) {
        error = error1;
        this.onError(error, "An error occured during template initialization.");
      }
      return this;
    }

    TemplateController.prototype.render = function(data) {
      var $showClosing, contextMessage, errMsg, error, error1, error2, error3, error4, error5, id, project, ref, ref1, ref2, ref3, title, type;
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
        this.onError(error, contextMessage);
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
        this.onError(error, contextMessage);
      }
      if (!((ref1 = this.nota) != null ? ref1.phantomRuntime : void 0)) {
        try {
          $showClosing = $('span#show-closing button');
          componentHandler.upgradeElement($showClosing[0]);
          $showClosing.click(function(e) {
            return $('span#closing').slideToggle();
          });
        } catch (error3) {
          error = error3;
          contextMessage = errMsg + " Initializing Material Design Lite components failed.";
          this.onError(error, contextMessage);
        }
      }
      try {
        if ((ref2 = this.nota) != null) {
          ref2.setDocument('meta', this.model.documentMeta());
        }
      } catch (error4) {
        error = error4;
        contextMessage = errMsg + " Failed to set the document meta data in the Nota capture client.";
        this.onError(error, contextMessage);
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
        this.onError(error, contextMessage);
      }
      return (ref3 = this.nota) != null ? ref3.trigger('template:render:done') : void 0;
    };

    TemplateController.prototype.onError = function(error, contextMessage) {
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

    return TemplateController;

  })();
  return TemplateController;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLWNvbnRyb2xsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsWUFBQTtFQUFBOztBQUFBLFlBQUEsR0FBZSxDQUNiLGdCQURhLEVBRWIsaUJBRmEsRUFHYixRQUhhLEVBSWIsWUFKYSxFQUtiLG1CQUxhLEVBTWIsWUFOYSxFQU9iLG1CQVBhLEVBUWIsc0JBUmEsRUFTYixVQVRhLEVBV2IsT0FBQSxHQUFRLElBQVIsR0FBYSxvQkFYQSxFQVliLE9BQUEsR0FBUSxJQUFSLEdBQWEsc0JBWkEsRUFhYixPQUFBLEdBQVEsSUFBUixHQUFhLHFCQWJBOztBQWVmLE1BQUEsQ0FBTyxZQUFQLEVBQXFCLFNBQUE7QUFFbkIsTUFBQTtFQUFDLDRCQUFELEVBQWdCLDZCQUFoQixFQUFnQyxnQkFBaEMsRUFBbUMseUJBQW5DLEVBQStDLGdCQUEvQyxFQUFrRCxnQkFBbEQsRUFBcUQsZ0JBQXJELEVBQXdELGtCQUF4RCxFQUE2RDtFQUU3RCxTQUFBLEdBQVk7SUFDVixJQUFBLEVBQVUsU0FBVSxDQUFBLFNBQVMsQ0FBQyxNQUFWLEdBQWlCLENBQWpCLENBRFY7SUFFVixNQUFBLEVBQVUsU0FBVSxDQUFBLFNBQVMsQ0FBQyxNQUFWLEdBQWlCLENBQWpCLENBRlY7SUFHVixLQUFBLEVBQVUsU0FBVSxDQUFBLFNBQVMsQ0FBQyxNQUFWLEdBQWlCLENBQWpCLENBSFY7O0VBTU47SUFFUyw0QkFBQyxJQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxPQUFEOztBQUNaOzthQUVPLENBQUUsT0FBUCxDQUFlLHFCQUFmOztRQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxTQUFaLEVBQXVCLFNBQUMsR0FBRCxFQUFNLEdBQU47aUJBQ2xDLFVBQVUsQ0FBQyxPQUFYLENBQW1CLEdBQW5CO1FBRGtDLENBQXZCO1FBU2IsSUFBRyxtQ0FBUyxDQUFFLHdCQUFkO1VBQ0UsR0FBQSxHQUFNLFFBQVEsQ0FBQyxh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M0IsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFULEVBQWdCLGNBQWhCLEVBVEY7O0FBV0E7UUFHRSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBQTtRQUNBLElBQUcsbUJBQUEsSUFBVyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBZDtVQUNFLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQixRQUFsQixFQUE0QjtZQUMxQixNQUFBLEVBQVEsS0FEa0I7WUFFMUIsUUFBQSxFQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBRmdCO1dBQTVCLEVBREY7U0FKRjtPQUFBLGNBQUE7UUFTTTtRQUVKLGNBQUEsR0FBb0IsTUFBRCxHQUFRO1FBRTNCLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVCxFQUFnQixjQUFoQixFQWJGOzs4Q0FnQkssQ0FBRSxPQUFQLENBQWUsc0JBQWY7SUEvRU07O2lDQWlGUixPQUFBLEdBQVMsU0FBQyxLQUFELEVBQVEsY0FBUjtNQUNQLElBQU8seUJBQVA7UUFBMkIsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsR0FBM0M7O01BSUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQ0U7UUFBQSxPQUFBLEVBQVUsY0FBVjtRQUNBLEtBQUEsRUFBVSxLQURWO09BREY7TUFJQSxJQUFHLDRCQUFIO1FBQ0UsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBaUIsSUFBQyxDQUFBLFlBQWxCLENBQWYsRUFERjs7TUFHQSxJQUFHLGlCQUFIO2VBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLENBQWUsS0FBZixFQUFzQixjQUF0QixFQUFmO09BQUEsTUFBQTtBQUNLLGNBQU0sTUFEWDs7SUFaTzs7Ozs7QUFlWCxTQUFPO0FBdkpZLENBQXJCIiwiZmlsZSI6InRlbXBsYXRlLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJkZXBlbmRlbmNpZXMgPSBbXG4gICd0ZW1wbGF0ZS1tb2RlbCdcbiAgJ2kxOG4tY29udHJvbGxlcidcbiAgJ2pxdWVyeSdcbiAgJ2hhbmRsZWJhcnMnXG4gICd1bmRlcnNjb3JlLnN0cmluZydcbiAgJ3VuZGVyc2NvcmUnXG4gICd1bmRlcnNjb3JlLnN0cmluZydcbiAgJ21hdGVyaWFsLWRlc2lnbi1saXRlJ1xuICAnYmx1ZWJpcmQnXG5cbiAgXCJ0ZXh0ISN7cm9vdH10ZW1wbGF0ZXMvbWFpbi5oYnNcIlxuICBcInRleHQhI3tyb290fXRlbXBsYXRlcy9mb290ZXIuaGJzXCJcbiAgXCJ0ZXh0ISN7cm9vdH10ZW1wbGF0ZXMvZXJyb3IuaGJzXCJcbl1cbmRlZmluZSBkZXBlbmRlbmNpZXMsICgpLT5cbiAgIyBVbnBhY2sgdGhlIGxvYWRlZCBkZXBlbmRlbmNpZXMgd2UgcmVjZWl2ZSBhcyBhcmd1bWVudHNcbiAgW1RlbXBsYXRlTW9kZWwsIGkxOG5Db250cm9sbGVyLCAkLCBIYW5kbGViYXJzLCBzLCBfLCBzLCBtZGwsIFByb21pc2VdID0gYXJndW1lbnRzXG5cbiAgdGVtcGxhdGVzID0ge1xuICAgIG1haW46ICAgICBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aC0zXVxuICAgIGZvb3RlcjogICBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aC0yXVxuICAgIGVycm9yOiAgICBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aC0xXVxuICB9XG5cbiAgY2xhc3MgVGVtcGxhdGVDb250cm9sbGVyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBub3RhKS0+XG4gICAgICB0cnlcbiAgICAgICAgIyBTaWduYWwgYmVnaW4gb2YgdGVtcGxhdGUgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgQG5vdGE/LnRyaWdnZXIgJ3RlbXBsYXRlOmluaXQ6c3RhcnQnXG5cbiAgICAgICAgQHRlbXBsYXRlcyA9IF8ubWFwT2JqZWN0IHRlbXBsYXRlcywgKHZhbCwga2V5KS0+XG4gICAgICAgICAgSGFuZGxlYmFycy5jb21waWxlKHZhbClcblxuICAgICAgICAjIElmIHdlJ3JlIG5vdCBidWlsZGluZyBhIFBERiB3ZSBhZGQgdGhlIGJyb3dzZXIgc3R5bGVzaGVldC4gU2FkbHlcbiAgICAgICAgIyBQaGFudG9tSlMgZG9lc24ndCBjbGVhbiB1cCB0aGUgc3R5bGVzIGNvbXBsZXRlbHkgd2hlbiBzdGFydGluZyB0b1xuICAgICAgICAjIGNhcHR1cmUgdG8gUERGLCBsZWF2aW5nIHRoZSBtZWRpYT0nc2NyZWVuJyBvbmx5IHN0eWxlc2hlZXRzIGNhdXNpbmdcbiAgICAgICAgIyBzdHJhbmdlIGVmZmVjdHMgb24gdGhlIGxheW91dCBldmVuIHRob3VnaCB0aGV5IHNob3VsZG4ndCBhcHBseSAob25seVxuICAgICAgICAjIG1lZGlhPSdwcmludCcsIGFuZCBtZWRpYT0nYWxsJyBzaG91bGQgYXBwbHkpLiBUaGlzIGVuc3VyZXMgdGhleSdyZSBub3RcbiAgICAgICAgIyBsb2FkZWQgYXQgYWxsIGlmIHdlJ3JlIGdvaW5nIHRvIGNhcHR1cmUgdG8gUERGIGFueXdheS5cbiAgICAgICAgaWYgbm90IEBub3RhPy5waGFudG9tUnVudGltZVxuICAgICAgICAgIGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKVxuICAgICAgICAgIGNzcy5yZWwgPSAnc3R5bGVzaGVldCdcbiAgICAgICAgICBjc3MuaHJlZiA9ICdkaXN0L2Nzcy9tYXRlcmlhbC1kZXNpZ24uY3NzJ1xuICAgICAgICAgIGNzcy50eXBlID0gJ3RleHQvY3NzJ1xuICAgICAgICAgIGNzcy5tZWRpYSA9ICdzY3JlZW4nXG4gICAgICAgICAgIyBNYWtlIHN1cmUgdGhhdCBpdCdzIHByZXBlbmRlZCwgc28gdGhhdCB0aGUgYmFzZSBzdHlsZXMgY2FuIG92ZXJyaWRlXG4gICAgICAgICAgIyBhIGZldyBNYXRlcmlhbCBEZXNpZ24gb25lcy5cbiAgICAgICAgICAkKCdoZWFkIGxpbmtbcm9sZT1cIm5vcm1hbGl6ZVwiXScpLmFmdGVyKGNzcylcblxuICAgICAgICAjIEFsc28gbGlzdGVuIGZvciBkYXRhIGJlaW5nIHNldFxuICAgICAgICBAbm90YT8ub24gJ2RhdGE6aW5qZWN0ZWQnLCBAcmVuZGVyXG5cbiAgICAgICAgIyBJZiBydW5uaW5nIG91dHNpZGUgUGhhbnRvbUpTIHdlJ2xsIGhhdmUgdG8gb3VyIGRhdGEgb3Vyc2VsdmVzIGZyb20gdGhlXG4gICAgICAgICMgc2VydmVyXG4gICAgICAgIEBub3RhPy5nZXREYXRhIEByZW5kZXJcblxuICAgICAgICAjIElmIHdlJ3JlIHJ1bm5pbmcgc3RhbmQtYWxvbmUsIHNob3cgc29tZSBwcmV2aWV3IGRhdGEsIGZvciBub3cgSVxuICAgICAgICAjIGd1ZXNzIDopXG4gICAgICAgIGlmIG5vdCBAbm90YT9cbiAgICAgICAgICByZXF1aXJlIFsnanNvbiFwcmV2aWV3LWRhdGEnXSwgQHJlbmRlclxuXG4gICAgICAgICMgU2lnbmFsIHRoYXQgd2UncmUgZG9uZSB3aXRoIHNldHVwIGFuZCB0aGF0IHdlJ3JlIHJlYWR5IHRvIHJlY2VpdmUgZGF0YVxuICAgICAgICBAbm90YT8udHJpZ2dlciAndGVtcGxhdGU6aW5pdDpkb25lJ1xuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgQG9uRXJyb3IoZXJyb3IsIFwiQW4gZXJyb3Igb2NjdXJlZCBkdXJpbmcgdGVtcGxhdGUgaW5pdGlhbGl6YXRpb24uXCIpXG4gICAgICAgIFxuICAgICAgcmV0dXJuIHRoaXNcblxuICAgIHJlbmRlcjogKGRhdGEpPT5cbiAgICAgICMgU2lnbmFsIHRoYXQgd2UndmUgc3RhcnRlZCByZW5kZXJpbmdcbiAgICAgIEBub3RhPy50cmlnZ2VyICd0ZW1wbGF0ZTpyZW5kZXI6c3RhcnQnXG4gICAgICBlcnJNc2cgPSBcIkFuIGVycm9yIG9jdXJyZWQgZHVyaW5nIHJlbmRlcmluZy5cIlxuXG4gICAgICB0cnlcbiAgICAgICAgIyBUZW1wbGF0ZU1vZGVsIHByb3ZpZGVzIGhlbHBlcnMsIGZvcm1hdHRlcnMgYW5kIG1vZGVsIHZhbGlkYXRpb25cbiAgICAgICAgQG1vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwoZGF0YSlcbiAgICAgICAgQG1vZGVsLnZhbGlkYXRlKGRhdGEpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBUaGUgcHJvdmlkZWQgZGF0YVxuICAgICAgICB0byByZW5kZXIgaXMgbm90IGEgdmFsaWQgbW9kZWwgZm9yIHRoaXMgdGVtcGxhdGUuXCJcbiAgICAgICAgQG9uRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuXG4gICAgICBpMThuQ29udHJvbGxlci5zZXRMYW5ndWFnZSBAbW9kZWwubGFuZ3VhZ2UoKVxuICAgICAgIyBVcGRhdGUgY3VycmVuY3kgaGVscGVyIGJlY2F1c2UgY3VycmVuY3kgc3ltYm9sIG1pZ2h0IGhhdmUgY2hhbmdlZCB3aXRoXG4gICAgICAjIGRhdGEuXG4gICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdjdXJyZW5jeScsIEBtb2RlbC5jdXJyZW5jeVxuICAgICAgXG4gICAgICB0cnlcbiAgICAgICAgIyBUaGUgYWN1dGFsIHJlbmRlcmluZyBjYWxsLiBSZXN1bHRpbmcgSFRNTCBpcyBwbGFjZWQgaW50byBib2R5IERPTVxuICAgICAgICAkKCdib2R5JykuaHRtbCBAdGVtcGxhdGVzLm1haW4oQG1vZGVsKVxuXG4gICAgICAgIHR5cGUgPSBpMThuQ29udHJvbGxlci50cmFuc2xhdGUoQG1vZGVsLmZpc2NhbFR5cGUoKSwgbnVsbCwgbnVsbCwgJ2NhcGl0YWxpemUnKVxuICAgICAgICBpZCA9IEBtb2RlbC5mdWxsSUQoKVxuICAgICAgICBwcm9qZWN0ID0gQG1vZGVsLnByb2plY3ROYW1lXG4gICAgICAgIHRpdGxlID0gaWYgcHJvamVjdD9cbiAgICAgICAgICBcIiN7dHlwZX0gI3tpZH0gLSAje3Byb2plY3R9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiI3t0eXBlfSAje2lkfVwiXG4gICAgICAgICQoJ2hlYWQgdGl0bGUnKS5odG1sIHRpdGxlXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBUZW1wbGF0aW5nIGVuZ2luZVxuICAgICAgICBIYW5kbGViYXJzLmpzIGVuY291bnRlZCBhbiBlcnJvciB3aXRoIHRoZSBnaXZlbiBkYXRhLlwiXG4gICAgICAgIEBvbkVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcblxuICAgICAgaWYgbm90IEBub3RhPy5waGFudG9tUnVudGltZVxuICAgICAgICB0cnlcbiAgICAgICAgICAjIEhvb2sgdXAgc29tZSBNYXRlcmlhbCBEZXNpZ24gTGl0ZSBjb21wb25lbnRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlXG4gICAgICAgICAgIyB0ZW1wbGF0ZVxuICAgICAgICAgICRzaG93Q2xvc2luZyA9ICQoJ3NwYW4jc2hvdy1jbG9zaW5nIGJ1dHRvbicpXG4gICAgICAgICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlRWxlbWVudCAkc2hvd0Nsb3NpbmdbMF1cbiAgICAgICAgICAkc2hvd0Nsb3NpbmcuY2xpY2sgKGUpLT5cbiAgICAgICAgICAgICQoJ3NwYW4jY2xvc2luZycpLnNsaWRlVG9nZ2xlKClcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgICBjb250ZXh0TWVzc2FnZSA9IFwiI3tlcnJNc2d9IEluaXRpYWxpemluZyBNYXRlcmlhbCBEZXNpZ24gTGl0ZVxuICAgICAgICAgIGNvbXBvbmVudHMgZmFpbGVkLlwiXG4gICAgICAgICAgQG9uRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuICAgICAgXG4gICAgICB0cnlcbiAgICAgICAgIyBQcm92aWRlIE5vdGEgY2xpZW50IHdpdGggbWV0YSBkYXRhIGZyb20uIFRoaXMgaXMgZmV0Y2hlZCBieVxuICAgICAgICAjIFBoYW50b21KUyBmb3IgZS5nLiBwcm92aWRpbmcgdGhlIHByb3Bvc2VkIGZpbGVuYW1lIG9mIHRoZSBQREYuIFNlZVxuICAgICAgICAjIHRoZSBOb3RhIGNsaWVudCBBUEkgZm9yIGRvY3VtZW50YXRpb24uXG4gICAgICAgIEBub3RhPy5zZXREb2N1bWVudCAnbWV0YScsIEBtb2RlbC5kb2N1bWVudE1ldGEoKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgIyBTdXBwbGVtZW50IGVycm9yIG1lc3NhZ2Ugd2l0aCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFuZCBmb3J3YXJkIGl0XG4gICAgICAgIGNvbnRleHRNZXNzYWdlID0gXCIje2Vyck1zZ30gRmFpbGVkIHRvIHNldCB0aGUgZG9jdW1lbnQgbWV0YSBkYXRhIGluXG4gICAgICAgIHRoZSBOb3RhIGNhcHR1cmUgY2xpZW50LlwiXG4gICAgICAgIEBvbkVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcblxuICAgICAgdHJ5XG4gICAgICAgICMgU2V0IGZvb3RlciB0byBnZW5lcmF0ZSBwYWdlIG51bWJlcnMsIGJ1dCBvbmx5IGlmIHdlJ3JlIHNvIHRhbGwgdGhhdFxuICAgICAgICAjIHdlIGtub3cgd2UnbGwgZ2V0IG11bHRpcGxlIHBhZ2VzIGFzIG91dHB1dFxuICAgICAgICBAdGVtcGxhdGVzLmZvb3RlcigpXG4gICAgICAgIGlmIEBub3RhPyBhbmQgQG5vdGEuZG9jdW1lbnRJc011bHRpcGFnZSgpXG4gICAgICAgICAgQG5vdGEuc2V0RG9jdW1lbnQgJ2Zvb3RlcicsIHtcbiAgICAgICAgICAgIGhlaWdodDogXCIxY21cIlxuICAgICAgICAgICAgY29udGVudHM6IEB0ZW1wbGF0ZXMuZm9vdGVyKClcbiAgICAgICAgICB9XG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBGYWlsZWQgdG8gc2V0IHRoZSBkb2N1bWVudCBmb290ZXIgaW4gdGhlXG4gICAgICAgIE5vdGEgY2FwdHVyZSBjbGllbnQuXCJcbiAgICAgICAgQG9uRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuXG4gICAgICAjIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUgd2l0aCByZW5kZXJpbmcgYW5kIHRoYXQgY2FwdHVyZSBjYW4gYmVnaW5cbiAgICAgIEBub3RhPy50cmlnZ2VyICd0ZW1wbGF0ZTpyZW5kZXI6ZG9uZSdcblxuICAgIG9uRXJyb3I6IChlcnJvciwgY29udGV4dE1lc3NhZ2UpLT5cbiAgICAgIGlmIG5vdCBAZXJyb3JIaXN0b3J5PyB0aGVuIEBlcnJvckhpc3RvcnkgPSBbXVxuXG4gICAgICAjIEluIGNhc2UgbXVsdGlwbGUgZXJyb3JzIGNvbWUgaW4sIGNhdGNoIHRoZW0gYWxsIGFuZCByZW5kZXIgdGhlbSBpbiBhXG4gICAgICAjIGxpc3QuXG4gICAgICBAZXJyb3JIaXN0b3J5LnB1c2hcbiAgICAgICAgY29udGV4dDogIGNvbnRleHRNZXNzYWdlXG4gICAgICAgIGVycm9yOiAgICBlcnJvclxuXG4gICAgICBpZiBAdGVtcGxhdGVzLmVycm9yP1xuICAgICAgICAkKCdib2R5JykuaHRtbCBAdGVtcGxhdGVzLmVycm9yKEBlcnJvckhpc3RvcnkpXG5cbiAgICAgIGlmIEBub3RhPyB0aGVuIEBub3RhLmxvZ0Vycm9yIGVycm9yLCBjb250ZXh0TWVzc2FnZVxuICAgICAgZWxzZSB0aHJvdyBlcnJvclxuXG4gIHJldHVybiBUZW1wbGF0ZUNvbnRyb2xsZXIiXX0=
