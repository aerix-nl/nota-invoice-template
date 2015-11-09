var dependencies,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

dependencies = ['template-model', 'jquery', 'handlebars', 'underscore.string', 'i18next', 'json!translation_nl', 'json!translation_en', 'css-regions', 'underscore', 'underscore.string', 'material-design-lite'];

define(dependencies, function() {
  var $, Handlebars, TemplateController, TemplateModel, _, cssRegions, enMap, i18n, mdl, nlMap, s;
  TemplateModel = arguments[0], $ = arguments[1], Handlebars = arguments[2], s = arguments[3], i18n = arguments[4], nlMap = arguments[5], enMap = arguments[6], cssRegions = arguments[7], _ = arguments[8], s = arguments[9], mdl = arguments[10];
  TemplateController = (function() {
    function TemplateController(renderError) {
      var css;
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
      if (Nota.phantomTarget !== 'pdf') {
        css = '<link href="dist/css/browser.css" rel="stylesheet" type="text/css" media="screen">';
        $('head link[media="all"]').before(css);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLWNvbnRyb2xsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsWUFBQTtFQUFBOztBQUFBLFlBQUEsR0FBZSxDQUNiLGdCQURhLEVBRWIsUUFGYSxFQUdiLFlBSGEsRUFJYixtQkFKYSxFQUtiLFNBTGEsRUFNYixxQkFOYSxFQU9iLHFCQVBhLEVBUWIsYUFSYSxFQVNiLFlBVGEsRUFVYixtQkFWYSxFQVdiLHNCQVhhOztBQWFmLE1BQUEsQ0FBTyxZQUFQLEVBQXFCLFNBQUE7QUFFbkIsTUFBQTtFQUFDLDRCQUFELEVBQWdCLGdCQUFoQixFQUFtQix5QkFBbkIsRUFBK0IsZ0JBQS9CLEVBQWtDLG1CQUFsQyxFQUF3QyxvQkFBeEMsRUFBK0Msb0JBQS9DLEVBQXNELHlCQUF0RCxFQUFrRSxnQkFBbEUsRUFBcUUsZ0JBQXJFLEVBQXdFO0VBRWxFO0lBRVMsNEJBQUMsV0FBRDtBQUdYLFVBQUE7TUFIWSxJQUFDLENBQUEsY0FBRDs7TUFHWixJQUFJLENBQUMsSUFBTCxDQUFVO1FBQ1IsUUFBQSxFQUNFO1VBQUEsRUFBQSxFQUFJO1lBQUUsV0FBQSxFQUFhLEtBQWY7V0FBSjtVQUNBLEVBQUEsRUFBSTtZQUFFLFdBQUEsRUFBYSxLQUFmO1dBREo7U0FGTTtRQU1SLGlCQUFBLEVBQW1CLFNBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxHQUFWLEVBQWUsWUFBZixFQUE2QixJQUE3QjtBQUNqQixnQkFBVSxJQUFBLEtBQUEsQ0FBTSxTQUFOO1FBRE8sQ0FOWDtPQUFWO01BYUEsSUFBRyxDQUFJLElBQUksQ0FBQyxjQUFaO1FBQ0UsT0FBQSxDQUFRLENBQUMsYUFBRCxDQUFSLEVBQXlCLFNBQUMsVUFBRDtpQkFHdkIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzREFBWjtRQUh1QixDQUF6QixFQURGOztNQVlBLElBQUcsSUFBSSxDQUFDLGFBQUwsS0FBd0IsS0FBM0I7UUFDRSxHQUFBLEdBQU07UUFJTixDQUFBLENBQUUsd0JBQUYs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QUksQ0FBQyxRQUFMLENBQWMsS0FBZCxFQUFxQixjQUFyQixFQVpGOzthQWVBLElBQUksQ0FBQyxPQUFMLENBQWEsc0JBQWI7SUFsRk07Ozs7O0FBb0ZWLFNBQU87QUFqS1ksQ0FBckIiLCJmaWxlIjoidGVtcGxhdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImRlcGVuZGVuY2llcyA9IFtcbiAgJ3RlbXBsYXRlLW1vZGVsJ1xuICAnanF1ZXJ5J1xuICAnaGFuZGxlYmFycydcbiAgJ3VuZGVyc2NvcmUuc3RyaW5nJ1xuICAnaTE4bmV4dCdcbiAgJ2pzb24hdHJhbnNsYXRpb25fbmwnXG4gICdqc29uIXRyYW5zbGF0aW9uX2VuJ1xuICAnY3NzLXJlZ2lvbnMnXG4gICd1bmRlcnNjb3JlJ1xuICAndW5kZXJzY29yZS5zdHJpbmcnXG4gICdtYXRlcmlhbC1kZXNpZ24tbGl0ZSdcbl1cbmRlZmluZSBkZXBlbmRlbmNpZXMsICgpLT5cbiAgIyBVbnBhY2sgdGhlIGxvYWRlZCBkZXBlbmRlbmNpZXMgd2UgcmVjZWl2ZSBhcyBhcmd1bWVudHNcbiAgW1RlbXBsYXRlTW9kZWwsICQsIEhhbmRsZWJhcnMsIHMsIGkxOG4sIG5sTWFwLCBlbk1hcCwgY3NzUmVnaW9ucywgXywgcywgbWRsXSA9IGFyZ3VtZW50c1xuXG4gIGNsYXNzIFRlbXBsYXRlQ29udHJvbGxlclxuXG4gICAgY29uc3RydWN0b3I6IChAcmVuZGVyRXJyb3IpLT5cbiAgICAgICMgU2V0IHVwIGludGVybmF0aW9uYWxpc2F0aW9uIHdpdGggc3VwcG9ydCBmb3IgdHJhbnNsYXRpb25zIGluIEVuZ2xpc2hcbiAgICAgICMgYW5kIER1dGNoLlxuICAgICAgaTE4bi5pbml0IHtcbiAgICAgICAgcmVzU3RvcmU6XG4gICAgICAgICAgZW46IHsgdHJhbnNsYXRpb246IGVuTWFwIH1cbiAgICAgICAgICBubDogeyB0cmFuc2xhdGlvbjogbmxNYXAgfVxuXG4gICAgICAgICMgSW4gY2FzZSBvZiBtaXNzaW5nIHRyYW5zbGF0aW9uXG4gICAgICAgIG1pc3NpbmdLZXlIYW5kbGVyOiAobG5nLCBucywga2V5LCBkZWZhdWx0VmFsdWUsIGxuZ3MpIC0+XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIGFyZ3VtZW50c1xuICAgICAgfVxuICAgICAgICAgIFxuICAgICAgIyBJZiB3ZSdyZSBub3QgcnVubmluZyBpbiBQaGFudG9tSlMsIGVtdWxhdGUgcGFnaW5hdGlvbiBpbiB0aGUgYnJvd3NlclxuICAgICAgIyB1c2luZyBDU1MgUmVnaW9ucyBhcyBwYWdlcyAoYWN0dWFsbHksIHVzaW5nIHRoZSBwb2x5ZmlsbCB1bnRpbGwgbmF0aXZlXG4gICAgICAjIGJyb3dzZXIgc3VwcG9ydCBmb3IgQ1NTIFJlZ2lvc24gaXMgaW1wbGVtZW50ZWQpLlxuICAgICAgaWYgbm90IE5vdGEucGhhbnRvbVJ1bnRpbWVcbiAgICAgICAgcmVxdWlyZSBbJ2Nzcy1yZWdpb25zJ10sIChjc3NSZWdpb25zKS0+XG4gICAgICAgICAgIyBDU1MgcmVnaW9ucyBoYXMgbm93IGxvYWRlZCBhbmQgc2hvdWxkIGhhdmUgcGVyZm9ybWVkIGEgcmUtbGF5b3V0XG4gICAgICAgICAgIyBvZiB0aGUgdGVtcGxhdGUncyBjb250ZW50IG92ZXIgdGhlIHJlZ2lvbnMgKHBhZ2VzKS5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcIlRPRE86IHBhZ2luYXRpb24gYW5kIHBhZ2UgbnVtYmVycyBpbiBicm93c2VyIHByZXZpZXdcIlxuXG4gICAgICAjIElmIHdlJ3JlIG5vdCBidWlsZGluZyBhIFBERiB3ZSBhZGQgdGhlIGJyb3dzZXIgc3R5bGVzaGVldC4gU2FkbHlcbiAgICAgICMgUGhhbnRvbUpTIGRvZXNuJ3QgY2xlYW4gdXAgdGhlIHN0eWxlcyBjb21wbGV0ZWx5IHdoZW4gc3RhcnRpbmcgdG9cbiAgICAgICMgY2FwdHVyZSB0byBQREYsIGxlYXZpbmcgdGhlIG1lZGlhPSdzY3JlZW4nIG9ubHkgc3R5bGVzaGVldHMgY2F1c2luZ1xuICAgICAgIyBzdHJhbmdlIGVmZmVjdHMgb24gdGhlIGxheW91dCBldmVuIHRob3VnaCB0aGV5IHNob3VsZG4ndCBhcHBseSAob25seVxuICAgICAgIyBtZWRpYT0ncHJpbnQnLCBhbmQgbWVkaWE9J2FsbCcgc2hvdWxkIGFwcGx5KS4gVGhpcyBlbnN1cmVzIHRoZXkncmUgbm90XG4gICAgICAjIGxvYWRlZCBhdCBhbGwgaWYgd2UncmUgZ29pbmcgdG8gY2FwdHVyZSB0byBQREYgYW55d2F5LlxuICAgICAgaWYgTm90YS5waGFudG9tVGFyZ2V0IGlzbnQgJ3BkZidcbiAgICAgICAgY3NzID0gJzxsaW5rIGhyZWY9XCJkaXN0L2Nzcy9icm93c2VyLmNzc1wiIHJlbD1cInN0eWxlc2hlZXRcIlxuICAgICAgICB0eXBlPVwidGV4dC9jc3NcIiBtZWRpYT1cInNjcmVlblwiPidcbiAgICAgICAgIyBNYWtlIHN1cmUgdGhhdCBpdCdzIHByZXBlbmRlZCwgc28gdGhhdCB0aGUgYmFzZSBzdHlsZXMgY2FuIG92ZXJyaWRlXG4gICAgICAgICMgYSBmZXcgTWF0ZXJpYWwgRGVzaWduIG9uZXMuXG4gICAgICAgICQoJ2hlYWQgbGlua1ttZWRpYT1cImFsbFwiXScpLmJlZm9yZShjc3MpXG5cbiAgICAgICMgR2V0IGFuZCBjb21waWxlIHRlbXBsYXRlIG9uY2UgdG8gb3B0aW1pemUgZm9yIHJlbmRlcmluZyBpdGVyYXRpb25zIGxhdGVyXG4gICAgICBAdGVtcGxhdGVNYWluID0gSGFuZGxlYmFycy5jb21waWxlICQoJ3NjcmlwdCN0ZW1wbGF0ZS1tYWluJykuaHRtbCgpXG5cbiAgICAgIEB0ZW1wbGF0ZVBhcnRpYWxzID0ge1xuICAgICAgICAnZm9vdGVyJzogJCgnc2NyaXB0I3RlbXBsYXRlLWZvb3RlcicpLmh0bWwoKVxuICAgICAgfVxuXG5cblxuXG5cblxuICAgIHRyYW5zbGF0ZTogKGkxOG5fa2V5LCBjb3VudCwgYXR0ciwgY2FzZWxldmVsKS0+XG4gICAgICAjIFRPRE86IEZ1Z2x5IGhhY2sgdG8gZ2V0IEhhbmRsZWJhcnMgdG8gZXZhbHVhdGUgYSBmdW5jdGlvbiB3aGVuIHBhc3NlZCB0b1xuICAgICAgIyBhIGhlbHBlciBhcyB0aGUgdmFsdWVcbiAgICAgIGlmIFwiZnVuY3Rpb25cIiBpcyB0eXBlb2YgaTE4bl9rZXkgdGhlbiBpMThuX2tleSA9IGkxOG5fa2V5KClcblxuICAgICAgIyBIYWNrIHRvIGFjaGlldmUgcGx1cmFsaXphdGlvbiB3aXRoIHRoZSBoZWxwZXJcbiAgICAgIGlmIFwibnVtYmVyXCIgaXMgdHlwZW9mIGNvdW50XG4gICAgICAgIHZhbHVlID0gaTE4bi50KGkxOG5fa2V5LCBjb3VudDogY291bnQpXG4gICAgICBlbHNlIGlmIFwibnVtYmVyXCIgaXMgdHlwZW9mIGNvdW50P1thdHRyXVxuICAgICAgICB2YWx1ZSA9IGkxOG4udChpMThuX2tleSwgY291bnQ6IGNvdW50W2F0dHJdKVxuICAgICAgZWxzZVxuICAgICAgICB2YWx1ZSA9IGkxOG4udChpMThuX2tleSlcblxuICAgICAgIyBBbHNvIGltcGxlbWVudCBzaW1wbGUgY2FwaXRhbGl6YXRpb24gd2hpbGUgd2UncmUgYXQgaXRcbiAgICAgIHN3aXRjaCBjYXNlbGV2ZWxcbiAgICAgICAgd2hlbiAnbG93ZXJjYXNlJyB0aGVuIHZhbHVlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgd2hlbiAndXBwZXJjYXNlJyB0aGVuIHZhbHVlLnRvVXBwZXJDYXNlKClcbiAgICAgICAgd2hlbiAnY2FwaXRhbGl6ZScgdGhlbiBzLmNhcGl0YWxpemUodmFsdWUpXG4gICAgICAgIGVsc2UgdmFsdWVcblxuXG5cblxuXG4gICAgcmVuZGVyOiAoZGF0YSk9PlxuICAgICAgIyBTaWduYWwgdGhhdCB3ZSd2ZSBzdGFydGVkIHJlbmRlcmluZ1xuICAgICAgTm90YS50cmlnZ2VyICd0ZW1wbGF0ZTpyZW5kZXI6c3RhcnQnXG4gICAgICBlcnJNc2cgPSBcIkFuIGVycm9yIG9jdXJyZWQgZHVyaW5nIHJlbmRlcmluZy5cIlxuXG4gICAgICB0cnlcbiAgICAgICAgIyBUZW1wbGF0ZU1vZGVsIHByb3ZpZGVzIGhlbHBlcnMsIGZvcm1hdHRlcnMgYW5kIG1vZGVsIHZhbGlkYXRpb25cbiAgICAgICAgQG1vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwoZGF0YSlcbiAgICAgICAgQG1vZGVsLnZhbGlkYXRlKGRhdGEpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBUaGUgcHJvdmlkZWQgZGF0YVxuICAgICAgICB0byByZW5kZXIgaXMgbm90IGEgdmFsaWQgbW9kZWwgZm9yIHRoaXMgdGVtcGxhdGUuXCJcbiAgICAgICAgQHJlbmRlckVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgICAgTm90YS5sb2dFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG5cbiAgICAgIGkxOG4uc2V0TG5nIEBtb2RlbC5sYW5ndWFnZSgpXG5cbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2kxOG4nLCBAdHJhbnNsYXRlXG4gICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdjdXJyZW5jeScsIEBtb2RlbC5jdXJyZW5jeVxuICAgICAgXG4gICAgICB0cnlcbiAgICAgICAgIyBUaGUgYWN1dGFsIHJlbmRlcmluZyBjYWxsLiBSZXN1bHRpbmcgSFRNTCBpcyBwbGFjZWQgaW50byBib2R5IERPTVxuICAgICAgICAkKCdib2R5JykuaHRtbCBAdGVtcGxhdGVNYWluKEBtb2RlbClcblxuICAgICAgICB0eXBlID0gQHRyYW5zbGF0ZShAbW9kZWwuZmlzY2FsVHlwZSgpLCBudWxsLCBudWxsLCAnY2FwaXRhbGl6ZScpXG4gICAgICAgIGlkID0gQG1vZGVsLmZ1bGxJRCgpXG4gICAgICAgIHByb2plY3QgPSBAbW9kZWwucHJvamVjdE5hbWVcbiAgICAgICAgdGl0bGUgPSBpZiBwcm9qZWN0P1xuICAgICAgICAgIFwiI3t0eXBlfSAje2lkfSAtICN7cHJvamVjdH1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCIje3R5cGV9ICN7aWR9XCJcbiAgICAgICAgJCgnaGVhZCB0aXRsZScpLmh0bWwgdGl0bGVcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICMgU3VwcGxlbWVudCBlcnJvciBtZXNzYWdlIHdpdGggY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhbmQgZm9yd2FyZCBpdFxuICAgICAgICBjb250ZXh0TWVzc2FnZSA9IFwiI3tlcnJNc2d9IFRlbXBsYXRpbmcgZW5naW5lXG4gICAgICAgIEhhbmRsZWJhcnMuanMgZW5jb3VudGVkIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIGRhdGEuXCJcbiAgICAgICAgQHJlbmRlckVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgICAgTm90YS5sb2dFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG5cbiAgICAgIHRyeVxuICAgICAgICAjIEhvb2sgdXAgc29tZSBNYXRlcmlhbCBEZXNpZ24gTGl0ZSBjb21wb25lbnRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlXG4gICAgICAgICMgdGVtcGxhdGVcbiAgICAgICAgaWYgbm90IE5vdGEucGhhbnRvbVJ1bnRpbWVcbiAgICAgICAgICAkc2hvd0Nsb3NpbmcgPSAkKCdzcGFuI3Nob3ctY2xvc2luZyBidXR0b24nKVxuICAgICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZUVsZW1lbnQgJHNob3dDbG9zaW5nWzBdXG4gICAgICAgICAgJHNob3dDbG9zaW5nLmNsaWNrIChlKS0+XG4gICAgICAgICAgICAkKCdzcGFuI2Nsb3NpbmcnKS5zbGlkZVRvZ2dsZSgpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIFN1cHBsZW1lbnQgZXJyb3IgbWVzc2FnZSB3aXRoIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYW5kIGZvcndhcmQgaXRcbiAgICAgICAgY29udGV4dE1lc3NhZ2UgPSBcIiN7ZXJyTXNnfSBJbml0aWFsaXppbmcgTWF0ZXJpYWwgRGVzaWduIExpdGVcbiAgICAgICAgY29tcG9uZW50cyBmYWlsZWQuXCJcbiAgICAgICAgQHJlbmRlckVycm9yKGVycm9yLCBjb250ZXh0TWVzc2FnZSlcbiAgICAgICAgTm90YS5sb2dFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG4gICAgICBcbiAgICAgIHRyeVxuICAgICAgICAjIFByb3ZpZGUgTm90YSBjbGllbnQgd2l0aCBtZXRhIGRhdGEgZnJvbS4gVGhpcyBpcyBmZXRjaGVkIGJ5XG4gICAgICAgICMgUGhhbnRvbUpTIGZvciBlLmcuIHByb3ZpZGluZyB0aGUgcHJvcG9zZWQgZmlsZW5hbWUgb2YgdGhlIFBERi4gU2VlXG4gICAgICAgICMgdGhlIE5vdGEgY2xpZW50IEFQSSBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgICAgICAgTm90YS5zZXREb2N1bWVudCAnbWV0YScsIEBtb2RlbC5kb2N1bWVudE1ldGEoKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgIyBTdXBwbGVtZW50IGVycm9yIG1lc3NhZ2Ugd2l0aCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFuZCBmb3J3YXJkIGl0XG4gICAgICAgIGNvbnRleHRNZXNzYWdlID0gXCIje2Vyck1zZ30gRmFpbGVkIHRvIHNldCB0aGUgZG9jdW1lbnQgbWV0YSBkYXRhIGluXG4gICAgICAgIHRoZSBOb3RhIGNhcHR1cmUgY2xpZW50LlwiXG4gICAgICAgIEByZW5kZXJFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG4gICAgICAgIE5vdGEubG9nRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuXG4gICAgICB0cnlcbiAgICAgICAgIyBTZXQgZm9vdGVyIHRvIGdlbmVyYXRlIHBhZ2UgbnVtYmVycywgYnV0IG9ubHkgaWYgd2UncmUgc28gdGFsbCB0aGF0XG4gICAgICAgICMgd2Uga25vdyB3ZSdsbCBnZXQgbXVsdGlwbGUgcGFnZXMgYXMgb3V0cHV0XG4gICAgICAgIGlmIE5vdGEuZG9jdW1lbnRJc011bHRpcGFnZSgpIHRoZW4gTm90YS5zZXREb2N1bWVudCAnZm9vdGVyJywge1xuICAgICAgICAgIGhlaWdodDogXCIxY21cIlxuICAgICAgICAgIGNvbnRlbnRzOiBAdGVtcGxhdGVQYXJ0aWFscy5mb290ZXJcbiAgICAgICAgfVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgIyBTdXBwbGVtZW50IGVycm9yIG1lc3NhZ2Ugd2l0aCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFuZCBmb3J3YXJkIGl0XG4gICAgICAgIGNvbnRleHRNZXNzYWdlID0gXCIje2Vyck1zZ30gRmFpbGVkIHRvIHNldCB0aGUgZG9jdW1lbnQgZm9vdGVyIGluIHRoZVxuICAgICAgICBOb3RhIGNhcHR1cmUgY2xpZW50LlwiXG4gICAgICAgIEByZW5kZXJFcnJvcihlcnJvciwgY29udGV4dE1lc3NhZ2UpXG4gICAgICAgIE5vdGEubG9nRXJyb3IoZXJyb3IsIGNvbnRleHRNZXNzYWdlKVxuXG4gICAgICAjIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUgd2l0aCByZW5kZXJpbmcgYW5kIHRoYXQgY2FwdHVyZSBjYW4gYmVnaW5cbiAgICAgIE5vdGEudHJpZ2dlciAndGVtcGxhdGU6cmVuZGVyOmRvbmUnXG5cbiAgcmV0dXJuIFRlbXBsYXRlQ29udHJvbGxlciJdfQ==
