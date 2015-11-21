var dependencies,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

dependencies = ['handlebars', 'i18next', 'json!translation_nl', 'json!translation_en'];

define('i18n-controller', dependencies, function(Handlebars, i18next, nlMap, enMap) {
  var i18nController;
  i18nController = (function() {
    function i18nController() {
      this.translate = bind(this.translate, this);
      this.i18next = i18next;
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
          return value.substr(0, 1).toUpperCase() + value.substr(1);
        default:
          return value;
      }
    };

    i18nController.prototype.setLanguage = function(lang) {
      return this.i18next.setLng(lang);
    };

    return i18nController;

  })();
  return new i18nController();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImkxOG4tY29udHJvbGxlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxZQUFBO0VBQUE7O0FBQUEsWUFBQSxHQUFlLENBQUMsWUFBRCxFQUFlLFNBQWYsRUFBMEIscUJBQTFCLEVBQWlELHFCQUFqRDs7QUFDZixNQUFBLENBQU8saUJBQVAsRUFBMEIsWUFBMUIsRUFBd0MsU0FBQyxVQUFELEVBQWEsT0FBYixFQUFzQixLQUF0QixFQUE2QixLQUE3QjtBQUN0QyxNQUFBO0VBQU07SUFDUyx3QkFBQTs7TUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXO01BR1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWM7UUFDWixRQUFBLEVBQ0U7VUFBQSxFQUFBLEVBQUk7WUFBRSxXQUFBLEVBQWEsS0FBZjtXQUFKO1VBQ0EsRUFBQSxFQUFJO1lBQUUsV0FBQSxFQUFhLEtBQWY7V0FESjtTQUZVO1FBTVosaUJBQUEsRUFBbUIsU0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEdBQVYsRUFBZSxZQUFmLEVBQTZCLElBQTdCO0FBQ2pCLGdCQUFVLElBQUEsS0FBQSxDQUFNLFNBQU47UUFETyxDQU5QO09BQWQ7TUFTQSxVQUFVLENBQUMsY0FBWCxDQUEwQixNQUExQixFQUFrQyxJQUFDLENBQUEsU0FBbkM7SUFiVzs7NkJBZWIsU0FBQSxHQUFXLFNBQUMsUUFBRCxFQUFXLEtBQVgsRUFBa0IsSUFBbEIsRUFBd0IsU0FBeEI7QUFHVCxVQUFBO01BQUEsSUFBRyxVQUFBLEtBQWMsT0FBTyxRQUF4QjtRQUFzQyxRQUFBLEdBQVcsUUFBQSxDQUFBLEVBQWpEOztNQUdBLElBQUcsUUFBQSxLQUFZLE9BQU8sS0FBdEI7UUFDRSxLQUFBLEdBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxDQUFULENBQVcsUUFBWCxFQUFxQjtVQUFBLEtBQUEsRUFBTyxLQUFQO1NBQXJCLEVBRFY7T0FBQSxNQUVLLElBQUcsUUFBQSxLQUFZLHdCQUFPLEtBQU8sQ0FBQSxJQUFBLFdBQTdCO1FBQ0gsS0FBQSxHQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsQ0FBVCxDQUFXLFFBQVgsRUFBcUI7VUFBQSxLQUFBLEVBQU8sS0FBTSxDQUFBLElBQUEsQ0FBYjtTQUFyQixFQURMO09BQUEsTUFBQTtRQUdILEtBQUEsR0FBUSxJQUFDLENBQUEsT0FBTyxDQUFDLENBQVQsQ0FBVyxRQUFYLEVBSEw7O0FBTUwsY0FBTyxTQUFQO0FBQUEsYUFDTyxXQURQO2lCQUN3QixLQUFLLENBQUMsV0FBTixDQUFBO0FBRHhCLGFBRU8sV0FGUDtpQkFFd0IsS0FBSyxDQUFDLFdBQU4sQ0FBQTtBQUZ4QixhQUdPLFlBSFA7aUJBR3lCLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixFQUFlLENBQWYsQ0FBaUIsQ0FBQyxXQUFsQixDQUFBLENBQUEsR0FBa0MsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiO0FBSDNEO2lCQUlPO0FBSlA7SUFkUzs7NkJBb0JYLFdBQUEsR0FBYSxTQUFDLElBQUQ7YUFBUyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBaEI7SUFBVDs7Ozs7QUFFZixTQUFXLElBQUEsY0FBQSxDQUFBO0FBdkMyQixDQUF4QyIsImZpbGUiOiJpMThuLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJkZXBlbmRlbmNpZXMgPSBbJ2hhbmRsZWJhcnMnLCAnaTE4bmV4dCcsICdqc29uIXRyYW5zbGF0aW9uX25sJywgJ2pzb24hdHJhbnNsYXRpb25fZW4nXVxuZGVmaW5lICdpMThuLWNvbnRyb2xsZXInLCBkZXBlbmRlbmNpZXMsIChIYW5kbGViYXJzLCBpMThuZXh0LCBubE1hcCwgZW5NYXApLT5cbiAgY2xhc3MgaTE4bkNvbnRyb2xsZXJcbiAgICBjb25zdHJ1Y3RvcjogKCktPlxuICAgICAgQGkxOG5leHQgPSBpMThuZXh0XG4gICAgICAjIFNldCB1cCBpbnRlcm5hdGlvbmFsaXNhdGlvbiB3aXRoIHN1cHBvcnQgZm9yIHRyYW5zbGF0aW9ucyBpbiBFbmdsaXNoXG4gICAgICAjIGFuZCBEdXRjaC5cbiAgICAgIEBpMThuZXh0LmluaXQge1xuICAgICAgICByZXNTdG9yZTpcbiAgICAgICAgICBlbjogeyB0cmFuc2xhdGlvbjogZW5NYXAgfVxuICAgICAgICAgIG5sOiB7IHRyYW5zbGF0aW9uOiBubE1hcCB9XG5cbiAgICAgICAgIyBJbiBjYXNlIG9mIG1pc3NpbmcgdHJhbnNsYXRpb25cbiAgICAgICAgbWlzc2luZ0tleUhhbmRsZXI6IChsbmcsIG5zLCBrZXksIGRlZmF1bHRWYWx1ZSwgbG5ncykgLT5cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgYXJndW1lbnRzXG4gICAgICB9XG4gICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdpMThuJywgQHRyYW5zbGF0ZVxuXG4gICAgdHJhbnNsYXRlOiAoaTE4bl9rZXksIGNvdW50LCBhdHRyLCBjYXNlbGV2ZWwpPT5cbiAgICAgICMgVE9ETzogRnVnbHkgaGFjayB0byBnZXQgSGFuZGxlYmFycyB0byBldmFsdWF0ZSBhIGZ1bmN0aW9uIHdoZW4gcGFzc2VkIHRvXG4gICAgICAjIGEgaGVscGVyIGFzIHRoZSB2YWx1ZVxuICAgICAgaWYgXCJmdW5jdGlvblwiIGlzIHR5cGVvZiBpMThuX2tleSB0aGVuIGkxOG5fa2V5ID0gaTE4bl9rZXkoKVxuXG4gICAgICAjIEhhY2sgdG8gYWNoaWV2ZSBwbHVyYWxpemF0aW9uIHdpdGggdGhlIGhlbHBlclxuICAgICAgaWYgXCJudW1iZXJcIiBpcyB0eXBlb2YgY291bnRcbiAgICAgICAgdmFsdWUgPSBAaTE4bmV4dC50KGkxOG5fa2V5LCBjb3VudDogY291bnQpXG4gICAgICBlbHNlIGlmIFwibnVtYmVyXCIgaXMgdHlwZW9mIGNvdW50P1thdHRyXVxuICAgICAgICB2YWx1ZSA9IEBpMThuZXh0LnQoaTE4bl9rZXksIGNvdW50OiBjb3VudFthdHRyXSlcbiAgICAgIGVsc2VcbiAgICAgICAgdmFsdWUgPSBAaTE4bmV4dC50KGkxOG5fa2V5KVxuXG4gICAgICAjIEFsc28gaW1wbGVtZW50IHNpbXBsZSBjYXBpdGFsaXphdGlvbiB3aGlsZSB3ZSdyZSBhdCBpdFxuICAgICAgc3dpdGNoIGNhc2VsZXZlbFxuICAgICAgICB3aGVuICdsb3dlcmNhc2UnIHRoZW4gdmFsdWUudG9Mb3dlckNhc2UoKVxuICAgICAgICB3aGVuICd1cHBlcmNhc2UnIHRoZW4gdmFsdWUudG9VcHBlckNhc2UoKVxuICAgICAgICB3aGVuICdjYXBpdGFsaXplJyB0aGVuIHZhbHVlLnN1YnN0cigwLDEpLnRvVXBwZXJDYXNlKCkgKyB2YWx1ZS5zdWJzdHIoMSlcbiAgICAgICAgZWxzZSB2YWx1ZVxuXG4gICAgc2V0TGFuZ3VhZ2U6IChsYW5nKS0+IEBpMThuZXh0LnNldExuZyhsYW5nKVxuXG4gIHJldHVybiBuZXcgaTE4bkNvbnRyb2xsZXIoKVxuIl19
