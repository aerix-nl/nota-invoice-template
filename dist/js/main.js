'use strict';
var base, bower, dependencies, onDependenciesLoaded, onError, root;

(base = Function.prototype).bind || (base.bind = function(_this) {
  return (function(_this) {
    return function() {
      return _this.apply(_this, arguments);
    };
  })(this);
});

root = './../../';

bower = 'bower_components/';

requirejs.config({
  enfordeDefine: true,
  paths: {
    'jquery': root + bower + 'jquery/dist/jquery',
    'underscore': root + bower + 'underscore/underscore',
    'underscore.string': root + bower + 'underscore.string/lib/underscore.string',
    'handlebars': root + bower + 'handlebars/handlebars.amd',
    'material-design-lite': root + bower + 'material-design-lite/material.min',
    'moment': root + bower + 'momentjs/moment',
    'moment_nl': root + bower + 'momentjs/locale/nl',
    'i18next': root + bower + 'i18next/i18next.amd.withJQuery',
    'tv4': root + bower + 'tv4/tv4',
    'json': root + bower + 'requirejs-plugins/src/json',
    'text': root + bower + 'requirejs-text/text',
    'requirejs': root + bower + 'requirejs/require',
    'template-controller': './template-controller',
    'template-model': './template-model',
    'schema': root + 'json/schema.json',
    'translation_nl': root + 'json/locales/nl.json',
    'translation_en': root + 'json/locales/en.json',
    'preview-data': root + 'json/preview.json',
    'nota': '/nota/lib/client'
  }
});

dependencies = ['template-controller'];

if (window._phantom) {
  dependencies.push('nota');
}

onDependenciesLoaded = function(TemplateController, Nota) {
  var error, error1, templateController;
  requirejs.onError = function(err) {
    throw err;
  };
  if (Nota != null) {
    Nota.trigger('template:init');
  }
  try {
    templateController = new TemplateController(onError, Nota);
  } catch (error1) {
    error = error1;
    onError(error);
    if (Nota != null) {
      if (Nota != null) {
        Nota.logError(error, "An error occured during template initialization.");
      }
    } else {
      throw error;
    }
  }
  if (Nota != null) {
    Nota.trigger('template:loaded');
  }
  window.template = templateController;
  return templateController;
};

onError = function(error, contextMessage) {
  var errorList, errorText, li, manual, type;
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
  if (contextMessage != null) {
    li.innerHTML = contextMessage + ' ' + error;
  } else if (error.requireType != null) {
    type = document.createElement('strong');
    type.innerHTML = "Module require error (" + error.requireType + ").";
    errorText = document.createTextNode(error.message);
    li.appendChild(type);
    li.appendChild(errorText);
  } else {
    li.innerHTML = error;
  }
  errorList.appendChild(li);
  if ((error.requireModules != null) === 'nota') {
    manual = document.querySelectorAll("div.manual-container")[0];
    manual.style.display = 'block';
  }
  if (error.requireModules != null) {
    throw error;
  }
};

requirejs.onError = onError;

define(dependencies, onDependenciesLoaded, onError);

//# sourceMappingURL=data:application/json;base64,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c0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbiMgV29ya2Fyb3VuZCB0byBzdXBwcmVzcyBhIGZsb29kIG9mIFBoYW50b21KUyB3YXJuaW5ncyBpbiBjZXJ0YWluIHZlcnNpb25zXG5GdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fD0gKCBfdGhpcyApIC0+ID0+IEBhcHBseShfdGhpcywgYXJndW1lbnRzKVxuXG5yb290ID0gJy4vLi4vLi4vJ1xuYm93ZXIgPSAnYm93ZXJfY29tcG9uZW50cy8nXG5yZXF1aXJlanMuY29uZmlnIHtcbiAgZW5mb3JkZURlZmluZTogdHJ1ZVxuICBwYXRoczpcbiAgICAjIFZlbmRvciBnb29kaWVzIHRoaXMgdGVtcGxhdGUgZGVwZW5kcyBvblxuICAgICdqcXVlcnknOiAgICAgICAgICAgICAgICAgcm9vdCtib3dlcisnanF1ZXJ5L2Rpc3QvanF1ZXJ5J1xuICAgICd1bmRlcnNjb3JlJzogICAgICAgICAgICAgcm9vdCtib3dlcisndW5kZXJzY29yZS91bmRlcnNjb3JlJ1xuICAgICd1bmRlcnNjb3JlLnN0cmluZyc6ICAgICAgcm9vdCtib3dlcisndW5kZXJzY29yZS5zdHJpbmcvbGliL3VuZGVyc2NvcmUuc3RyaW5nJ1xuICAgICdoYW5kbGViYXJzJzogICAgICAgICAgICAgcm9vdCtib3dlcisnaGFuZGxlYmFycy9oYW5kbGViYXJzLmFtZCdcbiAgICAnbWF0ZXJpYWwtZGVzaWduLWxpdGUnOiAgIHJvb3QrYm93ZXIrJ21hdGVyaWFsLWRlc2lnbi1saXRlL21hdGVyaWFsLm1pbidcbiAgICAnbW9tZW50JzogICAgICAgICAgICAgICAgIHJvb3QrYm93ZXIrJ21vbWVudGpzL21vbWVudCdcbiAgICAnbW9tZW50X25sJzogICAgICAgICAgICAgIHJvb3QrYm93ZXIrJ21vbWVudGpzL2xvY2FsZS9ubCdcbiAgICAnaTE4bmV4dCc6ICAgICAgICAgICAgICAgIHJvb3QrYm93ZXIrJ2kxOG5leHQvaTE4bmV4dC5hbWQud2l0aEpRdWVyeSdcbiAgICAndHY0JzogICAgICAgICAgICAgICAgICAgIHJvb3QrYm93ZXIrJ3R2NC90djQnXG5cbiAgICAjIFJlcXVpcmVKUyBqc29uISBkZXBzXG4gICAgJ2pzb24nOiAgICAgICAgICAgICAgICAgICByb290K2Jvd2VyKydyZXF1aXJlanMtcGx1Z2lucy9zcmMvanNvbidcbiAgICAndGV4dCc6ICAgICAgICAgICAgICAgICAgIHJvb3QrYm93ZXIrJ3JlcXVpcmVqcy10ZXh0L3RleHQnXG4gICAgJ3JlcXVpcmVqcyc6ICAgICAgICAgICAgICByb290K2Jvd2VyKydyZXF1aXJlanMvcmVxdWlyZSdcblxuICAgICMgVGVtcGxhdGUgc3R1ZmZcbiAgICAndGVtcGxhdGUtY29udHJvbGxlcic6ICAgICcuL3RlbXBsYXRlLWNvbnRyb2xsZXInXG4gICAgJ3RlbXBsYXRlLW1vZGVsJzogICAgICAgICAnLi90ZW1wbGF0ZS1tb2RlbCdcbiAgICAnc2NoZW1hJzogICAgICAgICAgICAgICAgIHJvb3QrJ2pzb24vc2NoZW1hLmpzb24nXG4gICAgJ3RyYW5zbGF0aW9uX25sJzogICAgICAgICByb290Kydqc29uL2xvY2FsZXMvbmwuanNvbidcbiAgICAndHJhbnNsYXRpb25fZW4nOiAgICAgICAgIHJvb3QrJ2pzb24vbG9jYWxlcy9lbi5qc29uJ1xuICAgICdwcmV2aWV3LWRhdGEnOiAgICAgICAgICAgcm9vdCsnanNvbi9wcmV2aWV3Lmpzb24nXG5cbiAgICAjIE5vdGEgY2xpZW50XG4gICAgJ25vdGEnOiAgICAgICAgICAgICAgICAgICAnL25vdGEvbGliL2NsaWVudCdcbn1cblxuZGVwZW5kZW5jaWVzID0gW1xuICAndGVtcGxhdGUtY29udHJvbGxlcidcbl1cblxuIyBJZiB3ZSdyZSBob3N0ZWQgaW4gUGhhbnRvbUpTIHdlJ2xsIG5lZWQgTm90YSBhcyB3ZWxsXG5pZiB3aW5kb3cuX3BoYW50b20gdGhlbiBkZXBlbmRlbmNpZXMucHVzaCAnbm90YSdcblxuIyBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiBhbGwgZGVwZW5kZW5jaWVzIGhhdmUgc3VjY2Vzc2Z1bGx5XG4jIGxvYWRlZCAodGhleSBhcmUgcGFzc2VkIGluIGFzIGFyZ3VtZW50cykuXG5vbkRlcGVuZGVuY2llc0xvYWRlZCA9ICggVGVtcGxhdGVDb250cm9sbGVyLCBOb3RhICkgLT5cbiAgIyBXZSBjYW4gZGlzYWJsZSBtb2R1bGUvc2NyaXB0IGxvYWQgZXJyb3IgY2F0Y2hpbmcgbm93LiBGcm9tIGhlcmUgb24gd2UgdXNlXG4gICMgb3VyIG93biAoTm90YS5sb2dFcnJvcikgd2hpY2ggd29ya3Mgd2l0aCB0aGUgbGltaXRhdGlvbnMgb2YgUGhhbnRvbUpTIGFuZFxuICAjIGdldHMgdGhlIGVycm9yIG9iamVjdHMgaW50byB0aGUgY29uc29sZXMgKHJlcXVpcmVqcy5vbkVycm9yIGNhdGNoZXMgQUxMXG4gICMgZXJyb3JzIGFuZCBwcmV2ZW50cyB0aGVtIGZyb20gcmVhY2hpbmcgdGhlIGNvbnNvbGUsIHdoaWNoIGlzIHJlYWxseVxuICAjIGFubm95aW5nIHdoZW4geW91IGNhbiB1c2UgdGhhdCBpbmZvIGluIE5vZGUuanMgYmFja2VuZCBmb3IgbG9nZ2luZykuXG4gICMgQmFzaWNzIG9mIGdvb2QgZGVzaWduIHN0YXRlcyB0aGF0IGVycm9ycyBzaG91bGQgYmUgYWx3YXlzIGJlIGxvdWQgYW5kXG4gICMgdmlzaWJsZSwgdG8gbG93ZXIgdGhlIGRpc2NvdmVyeSB0aGVzaG9sZC4gUmVxdWlyZUpTJ3MgZXJyb3IgaGFuZGxpbmcgZ29lc1xuICAjIGFnYWluc3QgdGhhdCBwcmFjdGljZSBpbiB0aGlzIGNhc2UuXG4gIHJlcXVpcmVqcy5vbkVycm9yID0gKGVyciktPiB0aHJvdyBlcnJcblxuICAjIFNpZ25hbCBiZWdpbiBvZiB0ZW1wbGF0ZSBpbml0aWFsaXphdGlvblxuICBOb3RhPy50cmlnZ2VyICd0ZW1wbGF0ZTppbml0J1xuXG4gIHRyeVxuICAgIHRlbXBsYXRlQ29udHJvbGxlciA9IG5ldyBUZW1wbGF0ZUNvbnRyb2xsZXIob25FcnJvciwgTm90YSlcbiAgY2F0Y2ggZXJyb3JcbiAgICBvbkVycm9yKGVycm9yKVxuICAgIGlmIE5vdGE/XG4gICAgICBOb3RhPy5sb2dFcnJvciBlcnJvciwgXCJBbiBlcnJvciBvY2N1cmVkIGR1cmluZyB0ZW1wbGF0ZSBpbml0aWFsaXphdGlvbi5cIlxuICAgIGVsc2VcbiAgICAgIHRocm93IGVycm9yXG5cbiAgIyBTaWduYWwgdGhhdCB3ZSdyZSBkb25lIHdpdGggc2V0dXAgYW5kIHRoYXQgd2UncmUgcmVhZHkgdG8gcmVjZWl2ZSBkYXRhXG4gIE5vdGE/LnRyaWdnZXIgJ3RlbXBsYXRlOmxvYWRlZCdcblxuICAjIEZvciBlYXN5IHVzZSBpbiB0aGUgZ2xvYmFsIG5hbWVzcGFjZVxuICB3aW5kb3cudGVtcGxhdGUgPSB0ZW1wbGF0ZUNvbnRyb2xsZXJcblxuICAjIEZvciB1c2UgaW4gbW9kdWxlcyByZXF1aXJpbmcgdGhpcyBvbmVcbiAgcmV0dXJuIHRlbXBsYXRlQ29udHJvbGxlclxuXG5cblxuXG5cbiMgU29tZSB2YW5pbGxhSlMgZXJyb3IgaGFuZGxpbmcgaW4gY2FzZSB3ZSBjYW4ndCBsb2FkIHRoZSBtb2R1bGVzIChhbmQgY2FuJ3RcbiMgdXNlIHRvb2xzIGxpa2UgalF1ZXJ5IGVpdGhlcikuXG5vbkVycm9yID0gKGVycm9yLCBjb250ZXh0TWVzc2FnZSktPlxuICAjIEVuc3VyZSB3ZSBnZXQgdGhlIHRlbXBsYXRlIGZyb20gdGhlIGJvZHkgb24gdGhlIGZpcnN0IGVycm9yLCBhbmQgc2F2ZSBpdFxuICAjIGluIHRoZSByb290IGZvciBhbGwgbGF0ZXIgZXJyb3NcbiAgaWYgbm90IHdpbmRvdy5lcnJvclRlbXBsYXRlP1xuICAgIHdpbmRvdy5lcnJvclRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RlbXBsYXRlLWVycm9yJykuaW5uZXJIVE1MXG4gICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSB3aW5kb3cuZXJyb3JUZW1wbGF0ZVxuXG4gICMgTWFrZSBhbiBpbnN0YW5jZSBvZiB0aGUgZXJyb3IgbGlzdCBpdGVtXG4gIGlmIG5vdCB3aW5kb3cuZXJyb3JMaXN0SXRlbT9cbiAgICB3aW5kb3cuZXJyb3JMaXN0SXRlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXYuZXJyb3ItY29udGFpbmVyIHVsIGxpLmVycm9yXCIpWzBdXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi5lcnJvci1jb250YWluZXIgdWxcIilbMF0uaW5uZXJIVE1MID0gXCJcIlxuXG4gICMgRmlsbCB0aGUgbGlzdCB3aXRoIGVycm9yIGxpc3QgaXRlbXNcbiAgZXJyb3JMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdi5lcnJvci1jb250YWluZXIgdWxcIilbMF1cbiAgbGkgPSBlcnJvckxpc3RJdGVtLmNsb25lTm9kZSgpXG4gIGlmIGNvbnRleHRNZXNzYWdlP1xuICAgIGxpLmlubmVySFRNTCA9IGNvbnRleHRNZXNzYWdlICsgJyAnICsgZXJyb3JcbiAgZWxzZSBpZiBlcnJvci5yZXF1aXJlVHlwZT9cbiAgICB0eXBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3Ryb25nJylcbiAgICB0eXBlLmlubmVySFRNTCA9IFwiTW9kdWxlIHJlcXVpcmUgZXJyb3IgKCN7ZXJyb3IucmVxdWlyZVR5cGV9KS5cIlxuICAgIGVycm9yVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGVycm9yLm1lc3NhZ2UpXG4gICAgbGkuYXBwZW5kQ2hpbGQgdHlwZVxuICAgIGxpLmFwcGVuZENoaWxkIGVycm9yVGV4dFxuICBlbHNlXG4gICAgbGkuaW5uZXJIVE1MID0gZXJyb3JcbiAgZXJyb3JMaXN0LmFwcGVuZENoaWxkIGxpXG5cbiAgaWYgZXJyb3IucmVxdWlyZU1vZHVsZXM/IGlzICdub3RhJ1xuICAgIG1hbnVhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXYubWFudWFsLWNvbnRhaW5lclwiKVswXVxuICAgIG1hbnVhbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuXG4gICMgSWYgd2UgY3Jhc2hlZCBiZWNhdXNlIHdlIGNvdWxkbid0IHJlcXVpcmUgc29tZSBuZWVkZWQgbW9kdWxlcywgd2UgY2FuJ3RcbiAgIyBhc3N1bWUgTm90YSdzIC5sb2dFcnJvciBpcyBhdmFpbGFibGUuIFNvIGNvbnRpbnVlIHdlJ2xsIHRvIHRocm93IHRoZSBlcnJvclxuICAjIHNvIGl0IHNob3dzIHVwIGluIGNvbnNvbGVzLiBSZXF1aXJlSlMgc2lsZW5jZXMgdGhlbSB1bmxlc3Mgd2UgZG8gc29cbiAgIyBleHBsaWNpdGx5LlxuICBpZiBlcnJvci5yZXF1aXJlTW9kdWxlcz8gdGhlbiB0aHJvdyBlcnJvclxuXG5cblxuXG5cbiMgRm9yIGNhdGNoaW5nIHNjcmlwdC9tb2R1bGUgbG9hZCBlcnJvcnNcbnJlcXVpcmVqcy5vbkVycm9yID0gb25FcnJvclxuXG4jIFRpbWUgdG8gbG9hZCB0aGUgZGVwZW5kZW5jaWVzLCBhbmQgaWYgYWxsIGdvZXMgd2VsbCwgc3RhcnQgdXAgdGhlIGludm9pY2VcbmRlZmluZShkZXBlbmRlbmNpZXMsIG9uRGVwZW5kZW5jaWVzTG9hZGVkLCBvbkVycm9yKVxuIl19
