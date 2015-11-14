var dependencies;

dependencies = ['handlebars', 'i18next', 'json!translation_nl', 'json!translation_en'];

define('i18n-controller', dependencies, function(Handlebars, i18n, nlMap, enMap) {
  var i18nController;
  i18nController = (function() {
    function i18nController() {
      this.i18next.init({
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
      Handlebars.registerHelper('i18n', this.translate);
    }

    i18nController.prototype.translate = function(i18n_key, count, attr, caselevel) {
      var value;
      if ("function" === typeof i18n_key) {
        i18n_key = i18n_key();
      }
      if ("number" === typeof count) {
        value = this.i18next.t(i18n_key, {
          count: count
        });
      } else if ("number" === typeof (count != null ? count[attr] : void 0)) {
        value = this.i18next.t(i18n_key, {
          count: count[attr]
        });
      } else {
        value = this.i18next.t(i18n_key);
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

    i18nController.prototype.setLanguage = function(lang) {
      return this.i18n.setLng(lang);
    };

    return i18nController;

  })();
  return new i18nController();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMvY3VycmVuY3kuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUE7O0FBQUEsWUFBQSxHQUFlLENBQUMsWUFBRCxFQUFlLFNBQWYsRUFBMEIscUJBQTFCLEVBQWlELHFCQUFqRDs7QUFDZixNQUFBLENBQU8saUJBQVAsRUFBMEIsWUFBMUIsRUFBd0MsU0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixLQUFuQixFQUEwQixLQUExQjtBQUN0QyxNQUFBO0VBQU07SUFDUyx3QkFBQTtNQUdYLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjO1FBQ1osUUFBQSxFQUNFO1VBQUEsRUFBQSxFQUFJO1lBQUUsV0FBQSxFQUFhLEtBQWY7V0FBSjtVQUNBLEVBQUEsRUFBSTtZQUFFLFdBQUEsRUFBYSxLQUFmO1dBREo7U0FGVTtRQU1aLGlCQUFBLEVBQW1CLFNBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxHQUFWLEVBQWUsWUFBZixFQUE2QixJQUE3QjtBQUNqQixnQkFBVSxJQUFBLEtBQUEsQ0FBTSxTQUFOO1FBRE8sQ0FOUDtPQUFkO01BU0EsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsTUFBMUIsRUFBa0MsSUFBQyxDQUFBLFNBQW5DO0lBWlc7OzZCQWNiLFNBQUEsR0FBVyxTQUFDLFFBQUQsRUFBVyxLQUFYLEVBQWtCLElBQWxCLEVBQXdCLFNBQXhCO0FBR1QsVUFBQTtNQUFBLElBQUcsVUFBQSxLQUFjLE9BQU8sUUFBeEI7UUFBc0MsUUFBQSxHQUFXLFFBQUEsQ0FBQSxFQUFqRDs7TUFHQSxJQUFHLFFBQUEsS0FBWSxPQUFPLEtBQXRCO1FBQ0UsS0FBQSxHQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsQ0FBVCxDQUFXLFFBQVgsRUFBcUI7VUFBQSxLQUFBLEVBQU8sS0FBUDtTQUFyQixFQURWO09BQUEsTUFFSyxJQUFHLFFBQUEsS0FBWSx3QkFBTyxLQUFPLENBQUEsSUFBQSxXQUE3QjtRQUNILEtBQUEsR0FBUSxJQUFDLENBQUEsT0FBTyxDQUFDLENBQVQsQ0FBVyxRQUFYLEVBQXFCO1VBQUEsS0FBQSxFQUFPLEtBQU0sQ0FBQSxJQUFBLENBQWI7U0FBckIsRUFETDtPQUFBLE1BQUE7UUFHSCxLQUFBLEdBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxDQUFULENBQVcsUUFBWCxFQUhMOztBQU1MLGNBQU8sU0FBUDtBQUFBLGFBQ08sV0FEUDtpQkFDd0IsS0FBSyxDQUFDLFdBQU4sQ0FBQTtBQUR4QixhQUVPLFdBRlA7aUJBRXdCLEtBQUssQ0FBQyxXQUFOLENBQUE7QUFGeEIsYUFHTyxZQUhQO2lCQUd5QixDQUFDLENBQUMsVUFBRixDQUFhLEtBQWI7QUFIekI7aUJBSU87QUFKUDtJQWRTOzs2QkFvQlgsV0FBQSxHQUFhLFNBQUMsSUFBRDthQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFhLElBQWI7SUFBVDs7Ozs7QUFFZixTQUFXLElBQUEsY0FBQSxDQUFBO0FBdEMyQixDQUF4QyIsImZpbGUiOiJoZWxwZXJzL2N1cnJlbmN5LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiZGVwZW5kZW5jaWVzID0gWydoYW5kbGViYXJzJywgJ2kxOG5leHQnLCAnanNvbiF0cmFuc2xhdGlvbl9ubCcsICdqc29uIXRyYW5zbGF0aW9uX2VuJ11cbmRlZmluZSAnaTE4bi1jb250cm9sbGVyJywgZGVwZW5kZW5jaWVzLCAoSGFuZGxlYmFycywgaTE4biwgbmxNYXAsIGVuTWFwKS0+XG4gIGNsYXNzIGkxOG5Db250cm9sbGVyXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAjIFNldCB1cCBpbnRlcm5hdGlvbmFsaXNhdGlvbiB3aXRoIHN1cHBvcnQgZm9yIHRyYW5zbGF0aW9ucyBpbiBFbmdsaXNoXG4gICAgICAjIGFuZCBEdXRjaC5cbiAgICAgIEBpMThuZXh0LmluaXQge1xuICAgICAgICByZXNTdG9yZTpcbiAgICAgICAgICBlbjogeyB0cmFuc2xhdGlvbjogZW5NYXAgfVxuICAgICAgICAgIG5sOiB7IHRyYW5zbGF0aW9uOiBubE1hcCB9XG5cbiAgICAgICAgIyBJbiBjYXNlIG9mIG1pc3NpbmcgdHJhbnNsYXRpb25cbiAgICAgICAgbWlzc2luZ0tleUhhbmRsZXI6IChsbmcsIG5zLCBrZXksIGRlZmF1bHRWYWx1ZSwgbG5ncykgLT5cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgYXJndW1lbnRzXG4gICAgICB9XG4gICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdpMThuJywgQHRyYW5zbGF0ZVxuXG4gICAgdHJhbnNsYXRlOiAoaTE4bl9rZXksIGNvdW50LCBhdHRyLCBjYXNlbGV2ZWwpLT5cbiAgICAgICMgVE9ETzogRnVnbHkgaGFjayB0byBnZXQgSGFuZGxlYmFycyB0byBldmFsdWF0ZSBhIGZ1bmN0aW9uIHdoZW4gcGFzc2VkIHRvXG4gICAgICAjIGEgaGVscGVyIGFzIHRoZSB2YWx1ZVxuICAgICAgaWYgXCJmdW5jdGlvblwiIGlzIHR5cGVvZiBpMThuX2tleSB0aGVuIGkxOG5fa2V5ID0gaTE4bl9rZXkoKVxuXG4gICAgICAjIEhhY2sgdG8gYWNoaWV2ZSBwbHVyYWxpemF0aW9uIHdpdGggdGhlIGhlbHBlclxuICAgICAgaWYgXCJudW1iZXJcIiBpcyB0eXBlb2YgY291bnRcbiAgICAgICAgdmFsdWUgPSBAaTE4bmV4dC50KGkxOG5fa2V5LCBjb3VudDogY291bnQpXG4gICAgICBlbHNlIGlmIFwibnVtYmVyXCIgaXMgdHlwZW9mIGNvdW50P1thdHRyXVxuICAgICAgICB2YWx1ZSA9IEBpMThuZXh0LnQoaTE4bl9rZXksIGNvdW50OiBjb3VudFthdHRyXSlcbiAgICAgIGVsc2VcbiAgICAgICAgdmFsdWUgPSBAaTE4bmV4dC50KGkxOG5fa2V5KVxuXG4gICAgICAjIEFsc28gaW1wbGVtZW50IHNpbXBsZSBjYXBpdGFsaXphdGlvbiB3aGlsZSB3ZSdyZSBhdCBpdFxuICAgICAgc3dpdGNoIGNhc2VsZXZlbFxuICAgICAgICB3aGVuICdsb3dlcmNhc2UnIHRoZW4gdmFsdWUudG9Mb3dlckNhc2UoKVxuICAgICAgICB3aGVuICd1cHBlcmNhc2UnIHRoZW4gdmFsdWUudG9VcHBlckNhc2UoKVxuICAgICAgICB3aGVuICdjYXBpdGFsaXplJyB0aGVuIHMuY2FwaXRhbGl6ZSh2YWx1ZSlcbiAgICAgICAgZWxzZSB2YWx1ZVxuXG4gICAgc2V0TGFuZ3VhZ2U6IChsYW5nKS0+IEBpMThuLnNldExuZyhsYW5nKVxuXG4gIHJldHVybiBuZXcgaTE4bkNvbnRyb2xsZXIoKVxuIl19
