var dependencies,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

dependencies = ['underscore', 'underscore.string', 'tv4', 'json!schema', 'moment', 'moment_nl'];

define(dependencies, function() {
  var TemplateModel, _, moment, s, schema, tv4;
  _ = arguments[0], s = arguments[1], tv4 = arguments[2], schema = arguments[3], moment = arguments[4];
  TemplateModel = (function() {
    function TemplateModel(data) {
      this.validate = bind(this.validate, this);
      this.serviceSubtotal = bind(this.serviceSubtotal, this);
      this.currency = bind(this.currency, this);
      this.servicesTotal = bind(this.servicesTotal, this);
      this.productsTotal = bind(this.productsTotal, this);
      this.total = bind(this.total, this);
      this.VATrate = bind(this.VATrate, this);
      this.VATservices = bind(this.VATservices, this);
      this.VATproducts = bind(this.VATproducts, this);
      this.VAT = bind(this.VAT, this);
      this.hoursSubtotal = bind(this.hoursSubtotal, this);
      this.servicesSubtotal = bind(this.servicesSubtotal, this);
      this.productsSubtotal = bind(this.productsSubtotal, this);
      this.subtotal = bind(this.subtotal, this);
      this.expiryDate = bind(this.expiryDate, this);
      this.bookingDate = bind(this.bookingDate, this);
      this.fullID = bind(this.fullID, this);
      this.isInternational = bind(this.isInternational, this);
      this.isInvoice = bind(this.isInvoice, this);
      this.isQuotation = bind(this.isQuotation, this);
      this.fiscalType = bind(this.fiscalType, this);
      this.companyFull = bind(this.companyFull, this);
      this.filename = bind(this.filename, this);
      this.documentMeta = bind(this.documentMeta, this);
      var i, j, len, len1, pr, ref, ref1, sr;
      _.extend(this, data);
      if (this.products != null) {
        ref = this.products;
        for (i = 0, len = ref.length; i < len; i++) {
          pr = ref[i];
          pr.subtotal = this.productSubtotal(pr);
        }
      }
      if (this.services != null) {
        ref1 = this.services;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          sr = ref1[j];
          sr.subtotal = this.serviceSubtotal(sr);
        }
      }
    }

    TemplateModel.prototype.documentMeta = function() {
      return {
        'filename': this.filename()
      };
    };

    TemplateModel.prototype.filename = function() {
      var client, filename, project;
      client = this.clientDisplay('company');
      client = client.replace(/\s/g, '-');
      filename = (this.fullID()) + "_" + client;
      if (this.projectName != null) {
        project = this.projectName.replace(/\s/g, '-');
        filename = filename + ("_" + project);
      }
      if (this.meta.period != null) {
        filename = filename + ("_P" + this.meta.period);
      }
      if (this.isQuotation()) {
        filename = filename + "_O";
      }
      return filename;
    };

    TemplateModel.prototype.companyFull = function() {
      return this.origin.company + ' ' + this.origin.lawform;
    };

    TemplateModel.prototype.fiscalType = function() {
      if (this.meta.type === 'quotation' || this.meta.type === 'invoice') {
        return this.meta.type;
      } else if (this.meta.type == null) {
        return 'invoice';
      } else {
        throw new Error('Unsupported template fiscal type. The model "meta.type" should be either invoice, quotation or undefined (defaults to invoice).');
      }
    };

    TemplateModel.prototype.isQuotation = function() {
      return this.fiscalType() === 'quotation';
    };

    TemplateModel.prototype.isInvoice = function() {
      return this.fiscalType() === 'invoice';
    };

    TemplateModel.prototype.language = function(country) {
      var dutch;
      if (country == null) {
        country = this.client.country;
      }
      if (country == null) {
        return 'nl';
      }
      dutch = s.contains(country.toLowerCase(), "netherlands") || s.contains(country.toLowerCase(), "nederland") || s.contains(country.toLowerCase(), "holland") || country.trim().toLowerCase() === "nl";
      if (dutch) {
        return 'nl';
      } else {
        return 'en';
      }
    };

    TemplateModel.prototype.isInternational = function(country) {
      if (country == null) {
        country = this.client.country;
      }
      return this.language(country) !== 'nl';
    };

    TemplateModel.prototype.isNaturalInt = function(int, attr) {
      if (isNaN(parseInt(int, 10))) {
        throw new Error(attr + " could not be parsed");
      }
      if (parseInt(int, 10) <= 0) {
        throw new Error(attr + " must be a positive integer");
      }
      if (parseInt(int, 10) !== parseFloat(int, 10)) {
        throw new Error(attr + " must be an integer (not floating point)");
      }
    };

    TemplateModel.prototype.email = function(email) {
      return "mailto:" + email;
    };

    TemplateModel.prototype.website = function(website) {
      return "https://www." + website;
    };

    TemplateModel.prototype.fullID = function() {
      var date, meta;
      meta = this.meta;
      date = new Date(meta.date);
      return date.getUTCFullYear() + '.' + s.pad(meta.id.toString(), 4, '0');
    };

    TemplateModel.prototype.bookingDate = function() {
      if (this.isInternational(this.client.country)) {
        moment.locale('en');
      } else {
        moment.locale('nl');
      }
      return moment(this.meta.date).format('LL');
    };

    TemplateModel.prototype.expiryDate = function(date, period) {
      if (date == null) {
        date = this.meta.date;
      }
      if (period == null) {
        period = this.validityPeriod;
      }
      if (this.isInternational()) {
        moment.locale('en');
      } else {
        moment.locale('nl');
      }
      return moment(this.meta.date).add(period, 'days').format('LL');
    };

    TemplateModel.prototype.clientDisplay = function(priority) {
      if (priority === 'company') {
        return this.client.organization || this.client.contactPerson;
      } else {
        return this.client.contactPerson || this.client.organization;
      }
    };

    TemplateModel.prototype.itemsPlural = function() {
      return this.invoiceItems.length > 1;
    };

    TemplateModel.prototype.hasDiscounts = function(category) {
      var check, products, services;
      check = function(item) {
        return (item.discount != null) > 0;
      };
      products = _.some(this.products, check);
      services = _.some(this.services, check);
      switch (category) {
        case 'products':
          return products;
        case 'services':
          return services;
        default:
          return products || services;
      }
    };

    TemplateModel.prototype.hasProductsDiscounts = function() {
      return this.hasDiscounts('products');
    };

    TemplateModel.prototype.hasServicesDiscounts = function() {
      return this.hasDiscounts('services');
    };

    TemplateModel.prototype.hasProducts = function() {
      var ref;
      return ((ref = this.products) != null ? ref.length : void 0) > 0;
    };

    TemplateModel.prototype.hasServices = function() {
      var ref;
      return ((ref = this.services) != null ? ref.length : void 0) > 0;
    };

    TemplateModel.prototype.productsTableFooterColspan = function() {
      if (this.hasDiscounts('products')) {
        return 4;
      } else {
        return 3;
      }
    };

    TemplateModel.prototype.servicesTableFooterColspan = function() {
      if (this.hasDiscounts('services')) {
        return 2;
      } else {
        return 1;
      }
    };

    TemplateModel.prototype.discountDisplay = function() {
      return this.discount * 100;
    };

    TemplateModel.prototype.subtotal = function(category) {
      var products, services;
      products = _.reduce(this.products, ((function(_this) {
        return function(sum, item) {
          return sum + _this.productSubtotal(item);
        };
      })(this)), 0);
      services = _.reduce(this.services, ((function(_this) {
        return function(sum, item) {
          return sum + _this.serviceSubtotal(item);
        };
      })(this)), 0);
      switch (category) {
        case 'products':
          return products;
        case 'services':
          return services;
        default:
          return products + services;
      }
    };

    TemplateModel.prototype.productsSubtotal = function() {
      return this.subtotal('products');
    };

    TemplateModel.prototype.servicesSubtotal = function() {
      return this.subtotal('services');
    };

    TemplateModel.prototype.hoursSubtotal = function() {
      return _.reduce(this.services, ((function(_this) {
        return function(sum, item) {
          return sum + item.hours;
        };
      })(this)), 0);
    };

    TemplateModel.prototype.VAT = function(category) {
      return this.subtotal(category) * this.vatPercentage;
    };

    TemplateModel.prototype.VATproducts = function() {
      return this.VAT('products');
    };

    TemplateModel.prototype.VATservices = function() {
      return this.VAT('services');
    };

    TemplateModel.prototype.VATrate = function() {
      return this.vatPercentage * 100;
    };

    TemplateModel.prototype.total = function(category) {
      return this.subtotal(category) + this.VAT(category);
    };

    TemplateModel.prototype.productsTotal = function() {
      return this.total('products');
    };

    TemplateModel.prototype.servicesTotal = function() {
      return this.total('services');
    };

    TemplateModel.prototype.currency = function(value) {
      var parsed, symbol;
      if (value == null) {
        throw new Error("Asked to render currency of undefined variable");
      }
      if ("function" === typeof value) {
        value = value();
      }
      symbol = this.currencySymbol;
      parsed = parseFloat(value);
      if (isNaN(parsed)) {
        throw new Error("Could not parse value '" + value + "' to a number");
      } else {
        return symbol + ' ' + parsed.toFixed(2);
      }
    };

    TemplateModel.prototype.productSubtotal = function(item) {
      var subtotal;
      subtotal = item.price * item.quantity;
      if (item.discount != null) {
        subtotal = subtotal * (1 - item.discount);
      }
      return subtotal;
    };

    TemplateModel.prototype.serviceSubtotal = function(item) {
      var subtotal;
      subtotal = item.hours * this.hourlyRate;
      if (item.discount != null) {
        subtotal = subtotal * (1 - item.discount);
      }
      return subtotal;
    };

    TemplateModel.prototype.validate = function(data) {
      var date, i, id, item, j, len, len1, period, postalCode, ref, ref1, ref2, ref3;
      if (!(_.keys(data).length > 0)) {
        throw new Error("Provided model has no attributes. " + "Check the arguments of this model's initialization call.");
      }
      if (!tv4.validate(data, schema)) {
        throw tv4.error;
      }
      if (data.meta == null) {
        throw new Error("No invoice meta-data provided");
      }
      id = data.meta.id;
      if (id == null) {
        throw new Error("No invoice ID provided");
      }
      if (id != null) {
        this.isNaturalInt(id, "Invoice ID");
      }
      period = data.meta.period;
      if (period != null) {
        this.isNaturalInt(period, "Invoice period");
      }
      date = new Date(data.meta.date);
      if (!((Object.prototype.toString.call(date) === "[object Date]") && !isNaN(date.getTime()))) {
        throw new Error("Invoice date is not a valid/parsable value");
      }
      if (data.client == null) {
        throw new Error("No data provided about the client/target of the invoice");
      }
      if (!(data.client.organization || data.client.contactPerson)) {
        throw new Error("At least the organization name or contact person name must be provided");
      }
      postalCode = data.client.postalcode;
      if (((postalCode != null ? postalCode.length : void 0) != null) && !this.isInternational(data.client.country)) {
        postalCode = s.clean(postalCode);
        if (postalCode.length < 6) {
          throw new Error("Postal code must be at least 6 characters long");
        } else if (postalCode.length > 7) {
          throw new Error("Postal code may not be longer than 7 characters");
        } else if (!postalCode.match(/\d{4}\s?[A-z]{2}/)) {
          throw new Error('Postal code must be of format /\\d{4}\\s?[A-z]{2}/, e.g. 1234AB or 1234 ab');
        }
      }
      if (((this.services == null) && !this.products) || ((ref = this.services) != null ? ref.length : void 0) === 0 && this.products.length === 0) {
        throw new Error("Document must contain at least some products or services. Found none in either category instead. Documents with an empty body are not valid.");
      }
      if (((ref1 = this.services) != null ? ref1.length : void 0) > 0 && (this.hourlyRate == null)) {
        throw new Error("No hourly service price rate provided. Must be provided because items contain services.");
      }
      if (this.services != null) {
        ref2 = this.services;
        for (i = 0, len = ref2.length; i < len; i++) {
          item = ref2[i];
          if (item.subtotal === 0) {
            throw new Error("Subtotal of 0 for service item '" + item.description + "' with " + item.hours + " hours");
          }
        }
      }
      if (this.products != null) {
        ref3 = this.products;
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          item = ref3[j];
          if (item.subtotal === 0) {
            throw new Error("Subtotal of 0 for product item '" + item.description + "' with a quantity of " + item.quantity);
          }
        }
      }
      if (this.subtotal() < 1) {
        throw new Error("Subtotal of " + (this.subtotal()) + " too low for real world usage patterns");
      }
    };

    return TemplateModel;

  })();
  return TemplateModel;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7QUFBQSxZQUFBLEdBQWUsQ0FDYixZQURhLEVBRWIsbUJBRmEsRUFHYixLQUhhLEVBSWIsYUFKYSxFQUtiLFFBTGEsRUFNYixXQU5hOztBQVFmLE1BQUEsQ0FBTyxZQUFQLEVBQXFCLFNBQUE7QUFFbkIsTUFBQTtFQUFDLGdCQUFELEVBQUksZ0JBQUosRUFBTyxrQkFBUCxFQUFZLHFCQUFaLEVBQW9CO0VBRWQ7SUFFUyx1QkFBQyxJQUFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ1gsVUFBQTtNQUFBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFZLElBQVo7TUFJQSxJQUFHLHFCQUFIO0FBQW1CO0FBQUEsYUFBQSxxQ0FBQTs7VUFDakIsRUFBRSxDQUFDLFFBQUgsR0FBYyxJQUFDLENBQUEsZUFBRCxDQUFpQixFQUFqQjtBQURHLFNBQW5COztNQUdBLElBQUcscUJBQUg7QUFBbUI7QUFBQSxhQUFBLHdDQUFBOztVQUNqQixFQUFFLENBQUMsUUFBSCxHQUFjLElBQUMsQ0FBQSxlQUFELENBQWlCLEVBQWpCO0FBREcsU0FBbkI7O0lBUlc7OzRCQVdiLFlBQUEsR0FBYyxTQUFBO2FBQ1o7UUFBQSxVQUFBLEVBQVksSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFaOztJQURZOzs0QkFHZCxRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGFBQUQsQ0FBZSxTQUFmO01BQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsS0FBZixFQUFzQixHQUF0QjtNQUNULFFBQUEsR0FBYSxDQUFDLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBRCxDQUFBLEdBQVcsR0FBWCxHQUFjO01BRTNCLElBQUcsd0JBQUg7UUFDRSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQXFCLEtBQXJC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QU0sOElBQU4sRUFEWjs7TUFLQSwwQ0FBWSxDQUFFLGdCQUFYLEdBQW9CLENBQXBCLElBQThCLHlCQUFqQztBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0seUZBQU4sRUFEWjs7TUFJQSxJQUFHLHFCQUFIO0FBQW1CO0FBQUEsYUFBQSxzQ0FBQTs7VUFDakIsSUFBRyxJQUFJLENBQUMsUUFBTCxLQUFpQixDQUFwQjtBQUNFLGtCQUFVLElBQUEsS0FBQSxDQUFNLGtDQUFBLEdBQ2IsSUFBSSxDQUFDLFdBRFEsR0FDSSxTQURKLEdBQ2EsSUFBSSxDQUFDLEtBRGxCLEdBQ3dCLFFBRDlCLEVBRFo7O0FBRGlCLFNBQW5COztNQUtBLElBQUcscUJBQUg7QUFBbUI7QUFBQSxhQUFBLHdDQUFBOztVQUNqQixJQUFHLElBQUksQ0FBQyxRQUFMLEtBQWlCLENBQXBCO0FBQ0Usa0JBQVUsSUFBQSxLQUFBLENBQU0sa0NBQUEsR0FDYixJQUFJLENBQUMsV0FEUSxHQUNJLHVCQURKLEdBQzJCLElBQUksQ0FBQyxRQUR0QyxFQURaOztBQURpQixTQUFuQjs7TUFLQSxJQUFHLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBQSxHQUFjLENBQWpCO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSxjQUFBLEdBQWMsQ0FBQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUQsQ0FBZCxHQUEyQix3Q0FBakMsRUFEWjs7SUEvRFE7Ozs7O0FBbUVaLFNBQU87QUE1UlksQ0FBckIiLCJmaWxlIjoidGVtcGxhdGUtbW9kZWwuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJkZXBlbmRlbmNpZXMgPSBbXG4gICd1bmRlcnNjb3JlJ1xuICAndW5kZXJzY29yZS5zdHJpbmcnLFxuICAndHY0JyxcbiAgJ2pzb24hc2NoZW1hJyxcbiAgJ21vbWVudCcsXG4gICdtb21lbnRfbmwnXG5dXG5kZWZpbmUgZGVwZW5kZW5jaWVzLCAoKS0+XG4gICMgVW5wYWNrIHRoZSBsb2FkZWQgZGVwZW5kZW5jaWVzIHdlIHJlY2VpdmUgYXMgYXJndW1lbnRzXG4gIFtfLCBzLCB0djQsIHNjaGVtYSwgbW9tZW50XSA9IGFyZ3VtZW50c1xuXG4gIGNsYXNzIFRlbXBsYXRlTW9kZWxcblxuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSktPlxuICAgICAgXy5leHRlbmQgQCwgZGF0YVxuXG4gICAgICAjIFRPRE86IEZ1Z2x5IGhhY2ssIGxpc3Qgb2YgY29tcHV0ZWQgcHJvcGVydGllcyBiZWNhdXNlIEhhbmRsZWJhcnNcbiAgICAgICMgZG9lc24ndCBhbGxvdyBjaGFpbmluZyBmdW5jdGlvbnNcbiAgICAgIGlmIEBwcm9kdWN0cz8gdGhlbiBmb3IgcHIgaW4gQHByb2R1Y3RzXG4gICAgICAgIHByLnN1YnRvdGFsID0gQHByb2R1Y3RTdWJ0b3RhbCBwclxuXG4gICAgICBpZiBAc2VydmljZXM/IHRoZW4gZm9yIHNyIGluIEBzZXJ2aWNlc1xuICAgICAgICBzci5zdWJ0b3RhbCA9IEBzZXJ2aWNlU3VidG90YWwgc3JcblxuICAgIGRvY3VtZW50TWV0YTogPT5cbiAgICAgICdmaWxlbmFtZSc6IEBmaWxlbmFtZSgpXG5cbiAgICBmaWxlbmFtZTogPT5cbiAgICAgIGNsaWVudCA9IEBjbGllbnREaXNwbGF5KCdjb21wYW55JylcbiAgICAgIGNsaWVudCA9IGNsaWVudC5yZXBsYWNlIC9cXHMvZywgJy0nICMgU3BhY2VzIHRvIGRhc2hlcyB1c2luZyByZWdleFxuICAgICAgZmlsZW5hbWUgPSBcIiN7QGZ1bGxJRCgpfV8je2NsaWVudH1cIlxuXG4gICAgICBpZiBAcHJvamVjdE5hbWU/XG4gICAgICAgIHByb2plY3QgPSBAcHJvamVjdE5hbWUucmVwbGFjZSAvXFxzL2csICctJyAjIFNwYWNlcyB0byBkYXNoZXMgdXNpbmcgcmVnZXhcbiAgICAgICAgZmlsZW5hbWUgPSBmaWxlbmFtZSArIFwiXyN7cHJvamVjdH1cIlxuICAgICAgXG4gICAgICBpZiBAbWV0YS5wZXJpb2Q/XG4gICAgICAgIGZpbGVuYW1lID0gZmlsZW5hbWUgKyBcIl9QI3tAbWV0YS5wZXJpb2R9XCJcblxuICAgICAgaWYgQGlzUXVvdGF0aW9uKClcbiAgICAgICAgZmlsZW5hbWUgPSBmaWxlbmFtZSArIFwiX09cIlxuXG4gICAgICBmaWxlbmFtZVxuXG4gICAgY29tcGFueUZ1bGw6ID0+XG4gICAgICBAb3JpZ2luLmNvbXBhbnkrJyAnK0BvcmlnaW4ubGF3Zm9ybVxuXG4gICAgZmlzY2FsVHlwZTogPT5cbiAgICAgICMgU3VwcG9ydGVkIHR5cGVzXG4gICAgICBpZiBAbWV0YS50eXBlIGlzICdxdW90YXRpb24nIG9yIEBtZXRhLnR5cGUgaXMgJ2ludm9pY2UnXG4gICAgICAgIEBtZXRhLnR5cGVcbiAgICAgIGVsc2UgaWYgbm90IEBtZXRhLnR5cGU/ICMgRGVmYXVsdCB0eXBlIGlmIHVuZGVmaW5lZFxuICAgICAgICAnaW52b2ljZSdcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yICdVbnN1cHBvcnRlZCB0ZW1wbGF0ZSBmaXNjYWwgdHlwZS4gVGhlIG1vZGVsXG4gICAgICAgIFwibWV0YS50eXBlXCIgc2hvdWxkIGJlIGVpdGhlciBpbnZvaWNlLCBxdW90YXRpb24gb3IgdW5kZWZpbmVkIChkZWZhdWx0c1xuICAgICAgICB0byBpbnZvaWNlKS4nXG5cbiAgICBpc1F1b3RhdGlvbjogPT4gQGZpc2NhbFR5cGUoKSBpcyAncXVvdGF0aW9uJ1xuICAgIGlzSW52b2ljZTogPT4gQGZpc2NhbFR5cGUoKSBpcyAnaW52b2ljZSdcblxuICAgIGxhbmd1YWdlOiAoY291bnRyeSktPlxuICAgICAgaWYgbm90IGNvdW50cnk/IHRoZW4gY291bnRyeSA9IEBjbGllbnQuY291bnRyeVxuXG4gICAgICByZXR1cm4gJ25sJyB1bmxlc3MgY291bnRyeT8gIyBJZiBubyBjb3VudHJ5IGlzIHNwZWNpZmllZCwgd2UgYXNzdW1lIER1dGNoXG5cbiAgICAgIGR1dGNoID0gcy5jb250YWlucyhjb3VudHJ5LnRvTG93ZXJDYXNlKCksIFwibmV0aGVybGFuZHNcIikgb3JcbiAgICAgICAgICAgICAgcy5jb250YWlucyhjb3VudHJ5LnRvTG93ZXJDYXNlKCksIFwibmVkZXJsYW5kXCIpIG9yXG4gICAgICAgICAgICAgIHMuY29udGFpbnMoY291bnRyeS50b0xvd2VyQ2FzZSgpLCBcImhvbGxhbmRcIikgb3JcbiAgICAgICAgICAgICAgY291bnRyeS50cmltKCkudG9Mb3dlckNhc2UoKSBpcyBcIm5sXCJcbiAgICAgIGlmIGR1dGNoIHRoZW4gcmV0dXJuICdubCcgZWxzZSAnZW4nXG5cbiAgICBpc0ludGVybmF0aW9uYWw6IChjb3VudHJ5KT0+XG4gICAgICBpZiBub3QgY291bnRyeT8gdGhlbiBjb3VudHJ5ID0gQGNsaWVudC5jb3VudHJ5XG5cbiAgICAgIEBsYW5ndWFnZShjb3VudHJ5KSBpc250ICdubCdcblxuICAgIGlzTmF0dXJhbEludDogKGludCwgYXR0ciktPlxuICAgICAgaWYgaXNOYU4gcGFyc2VJbnQoaW50LCAxMClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiI3thdHRyfSBjb3VsZCBub3QgYmUgcGFyc2VkXCJcbiAgICAgIGlmIHBhcnNlSW50KGludCwgMTApIDw9IDBcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiI3thdHRyfSBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlclwiXG4gICAgICBpZiAocGFyc2VJbnQoaW50LCAxMCkgaXNudCBwYXJzZUZsb2F0KGludCwgMTApKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCIje2F0dHJ9IG11c3QgYmUgYW4gaW50ZWdlciAobm90IGZsb2F0aW5nIHBvaW50KVwiXG5cblxuXG4gICAgZW1haWw6IChlbWFpbCkgLT5cbiAgICAgIHJldHVybiBcIm1haWx0bzoje2VtYWlsfVwiXG4gICAgd2Vic2l0ZTogKHdlYnNpdGUpIC0+XG4gICAgICByZXR1cm4gXCJodHRwczovL3d3dy4je3dlYnNpdGV9XCJcbiAgICBmdWxsSUQ6ID0+XG4gICAgICBtZXRhID0gQG1ldGFcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShtZXRhLmRhdGUpXG4gICAgICBkYXRlLmdldFVUQ0Z1bGxZZWFyKCkrJy4nK3MucGFkKG1ldGEuaWQudG9TdHJpbmcoKSwgNCwgJzAnKVxuXG4gICAgYm9va2luZ0RhdGU6ID0+XG4gICAgICBpZiBAaXNJbnRlcm5hdGlvbmFsKEBjbGllbnQuY291bnRyeSlcbiAgICAgICAgbW9tZW50LmxvY2FsZSAnZW4nXG4gICAgICBlbHNlXG4gICAgICAgIG1vbWVudC5sb2NhbGUgJ25sJ1xuXG4gICAgICBtb21lbnQoQG1ldGEuZGF0ZSkuZm9ybWF0KCdMTCcpXG5cbiAgICBleHBpcnlEYXRlOiAoZGF0ZSwgcGVyaW9kKT0+XG4gICAgICBpZiBub3QgZGF0ZT8gICAgdGhlbiBkYXRlICAgICA9IEBtZXRhLmRhdGVcbiAgICAgIGlmIG5vdCBwZXJpb2Q/ICB0aGVuIHBlcmlvZCAgID0gQHZhbGlkaXR5UGVyaW9kXG5cbiAgICAgIGlmIEBpc0ludGVybmF0aW9uYWwoKVxuICAgICAgICBtb21lbnQubG9jYWxlICdlbidcbiAgICAgIGVsc2VcbiAgICAgICAgbW9tZW50LmxvY2FsZSAnbmwnXG5cbiAgICAgIG1vbWVudChAbWV0YS5kYXRlKS5hZGQocGVyaW9kLCAnZGF5cycpLmZvcm1hdCgnTEwnKVxuICAgICAgXG4gICAgY2xpZW50RGlzcGxheTogKHByaW9yaXR5KS0+XG4gICAgICBpZiBwcmlvcml0eSBpcyAnY29tcGFueSdcbiAgICAgICAgQGNsaWVudC5vcmdhbml6YXRpb24gb3IgQGNsaWVudC5jb250YWN0UGVyc29uXG4gICAgICBlbHNlXG4gICAgICAgIEBjbGllbnQuY29udGFjdFBlcnNvbiBvciBAY2xpZW50Lm9yZ2FuaXphdGlvblxuXG4gICAgIyBVc2VmdWwgZm9yIGkxOG4gLi4uICd0aGlzIHNlcnZpY2UnLyd0aGVzZSBzZXJ2aWNlcydcbiAgICBpdGVtc1BsdXJhbDogLT5cbiAgICAgIEBpbnZvaWNlSXRlbXMubGVuZ3RoID4gMVxuXG4gICAgIyBVc2VmdWwgZm9yIGkxOG4gLi4uICd0aGlzIHNlcnZpY2UnLyd0aGVzZSBzZXJ2aWNlcydcbiAgICBoYXNEaXNjb3VudHM6IChjYXRlZ29yeSktPlxuICAgICAgY2hlY2sgPSAoaXRlbSktPiBpdGVtLmRpc2NvdW50PyA+IDBcbiAgICAgIHByb2R1Y3RzID0gXy5zb21lIEBwcm9kdWN0cywgY2hlY2tcbiAgICAgIHNlcnZpY2VzID0gXy5zb21lIEBzZXJ2aWNlcywgY2hlY2tcbiAgICAgIHN3aXRjaCBjYXRlZ29yeVxuICAgICAgICB3aGVuICdwcm9kdWN0cydcbiAgICAgICAgICBwcm9kdWN0c1xuICAgICAgICB3aGVuICdzZXJ2aWNlcydcbiAgICAgICAgICBzZXJ2aWNlc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcHJvZHVjdHMgb3Igc2VydmljZXNcblxuICAgIGhhc1Byb2R1Y3RzRGlzY291bnRzOiAtPiBAaGFzRGlzY291bnRzKCdwcm9kdWN0cycpXG5cbiAgICBoYXNTZXJ2aWNlc0Rpc2NvdW50czogLT4gQGhhc0Rpc2NvdW50cygnc2VydmljZXMnKVxuXG4gICAgaGFzUHJvZHVjdHM6IC0+IEBwcm9kdWN0cz8ubGVuZ3RoID4gMFxuXG4gICAgaGFzU2VydmljZXM6IC0+IEBzZXJ2aWNlcz8ubGVuZ3RoID4gMFxuXG4gICAgcHJvZHVjdHNUYWJsZUZvb3RlckNvbHNwYW46IC0+XG4gICAgICBpZiBAaGFzRGlzY291bnRzKCdwcm9kdWN0cycpIHRoZW4gNCBlbHNlIDNcblxuICAgIHNlcnZpY2VzVGFibGVGb290ZXJDb2xzcGFuOiAtPlxuICAgICAgaWYgQGhhc0Rpc2NvdW50cygnc2VydmljZXMnKSB0aGVuIDIgZWxzZSAxXG5cbiAgICBkaXNjb3VudERpc3BsYXk6IC0+XG4gICAgICAoQGRpc2NvdW50ICogMTAwKVxuXG4gICAgIyBTdWJ0b3RhbCBvZiBhbGwgb3IganVzdCBvbmUgY2F0ZWdvcnkgb2YgaXRlbXMgKHdpdGhvdXQgdGF4ZXMpXG4gICAgc3VidG90YWw6IChjYXRlZ29yeSk9PlxuICAgICAgcHJvZHVjdHMgPSBfLnJlZHVjZSBAcHJvZHVjdHMsICggKHN1bSwgaXRlbSk9PiBzdW0gKyBAcHJvZHVjdFN1YnRvdGFsIGl0ZW0gKSwgMFxuICAgICAgc2VydmljZXMgPSBfLnJlZHVjZSBAc2VydmljZXMsICggKHN1bSwgaXRlbSk9PiBzdW0gKyBAc2VydmljZVN1YnRvdGFsIGl0ZW0gKSwgMFxuICAgICAgc3dpdGNoIGNhdGVnb3J5XG4gICAgICAgIHdoZW4gJ3Byb2R1Y3RzJ1xuICAgICAgICAgIHByb2R1Y3RzXG4gICAgICAgIHdoZW4gJ3NlcnZpY2VzJ1xuICAgICAgICAgIHNlcnZpY2VzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwcm9kdWN0cyArIHNlcnZpY2VzXG5cbiAgICBwcm9kdWN0c1N1YnRvdGFsOiA9PiBAc3VidG90YWwoJ3Byb2R1Y3RzJylcblxuICAgIHNlcnZpY2VzU3VidG90YWw6ID0+IEBzdWJ0b3RhbCgnc2VydmljZXMnKVxuXG4gICAgaG91cnNTdWJ0b3RhbDogPT5cbiAgICAgIF8ucmVkdWNlIEBzZXJ2aWNlcywgKCAoc3VtLCBpdGVtKT0+IHN1bSArIGl0ZW0uaG91cnMgKSwgMFxuICAgIFxuICAgIFZBVDogKGNhdGVnb3J5KT0+IEBzdWJ0b3RhbChjYXRlZ29yeSkgKiBAdmF0UGVyY2VudGFnZVxuXG4gICAgVkFUcHJvZHVjdHM6ID0+IEBWQVQoJ3Byb2R1Y3RzJylcblxuICAgIFZBVHNlcnZpY2VzOiA9PiBAVkFUKCdzZXJ2aWNlcycpXG5cbiAgICBWQVRyYXRlOiA9PiAoQHZhdFBlcmNlbnRhZ2UgKiAxMDApXG5cbiAgICB0b3RhbDogKGNhdGVnb3J5KT0+XG4gICAgICBAc3VidG90YWwoY2F0ZWdvcnkpICsgQFZBVChjYXRlZ29yeSlcblxuICAgIHByb2R1Y3RzVG90YWw6ID0+IEB0b3RhbCgncHJvZHVjdHMnKVxuXG4gICAgc2VydmljZXNUb3RhbDogPT4gQHRvdGFsKCdzZXJ2aWNlcycpXG5cbiAgICAjIFJlbmRlcnMgdGhlIHZhbHVlIChhbmQgZXZhbHVhdGVzIGl0IGZpcnN0IGlmIGl0J3MgYSBmdW5jdGlvbikgYXMgYVxuICAgICMgY3VycmVuY3kgKHRsZHI7IHB1dHMgYSDigqwgb3Igc3VjaCBpbiBmcm9uIG9mIGl0KVxuICAgIGN1cnJlbmN5OiAodmFsdWUpID0+XG4gICAgICBpZiBub3QgdmFsdWU/XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIkFza2VkIHRvIHJlbmRlciBjdXJyZW5jeSBvZiB1bmRlZmluZWQgdmFyaWFibGVcIlxuXG4gICAgICAjIFRPRE86IEZ1Z2x5IGhhY2sgYmVjYXVzZSBIYW5kbGViYXJzIGV2YWx1YXRlIGEgZnVuY3Rpb24gd2hlbiBwYXNzZWQgdG9cbiAgICAgICMgYSBoZWxwZXIgYXMgdGhlIHZhbHVlXG4gICAgICBpZiBcImZ1bmN0aW9uXCIgaXMgdHlwZW9mIHZhbHVlIHRoZW4gdmFsdWUgPSB2YWx1ZSgpXG5cbiAgICAgIHN5bWJvbCA9IEBjdXJyZW5jeVN5bWJvbFxuwqAgwqAgwqAgcGFyc2VkID0gcGFyc2VGbG9hdCh2YWx1ZSlcbsKgIMKgIMKgIGlmIGlzTmFOKHBhcnNlZClcbsKgIMKgIMKgIMKgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBwYXJzZSB2YWx1ZSAnXCIgKyB2YWx1ZSArIFwiJyB0byBhIG51bWJlclwiKVxuwqAgwqAgwqAgZWxzZVxuwqAgwqAgwqAgwqAgcmV0dXJuIHN5bWJvbCArICcgJyArIHBhcnNlZC50b0ZpeGVkKDIpXG5cbiAgICAjIENhbGN1bGF0ZXMgdGhlIGl0ZW0gc3VidG90YWwgKHByaWNlIHRpbWVzIHF1YW50aXR5IGluIGNhc2Ugb2YgcHJvZHVjdHMsXG4gICAgIyBvciBob3VybHkgcmF0ZSB0aW1lcyBob3VycyBpbiBjYXNlIG9mIHNlcnZpY2VzLCBhbmQgdGhlbiBhIHBvc3NpYmxlXG4gICAgIyBkaXNjb3VudCBhcHBsaWVkKS5cbiAgICBwcm9kdWN0U3VidG90YWw6IChpdGVtKS0+XG4gICAgICAjIENhbGN1bGF0ZSB0aGUgc3VidG90YWwgb2YgdGhpcyBpdGVtXG4gICAgICBzdWJ0b3RhbCA9IGl0ZW0ucHJpY2UgKiBpdGVtLnF1YW50aXR5XG4gICAgICAjIEFwcGx5IGRpc2NvdW50IG92ZXIgc3VidG90YWwgaWYgaXQgZXhpc3RzXG4gICAgICBpZiBpdGVtLmRpc2NvdW50PyB0aGVuIHN1YnRvdGFsID0gc3VidG90YWwgKiAoMS1pdGVtLmRpc2NvdW50KVxuICAgICAgc3VidG90YWxcblxuICAgIHNlcnZpY2VTdWJ0b3RhbDogKGl0ZW0pPT5cbiAgICAgICMgQ2FsY3VsYXRlIHRoZSBzdWJ0b3RhbCBvZiB0aGlzIGl0ZW1cbiAgICAgIHN1YnRvdGFsID0gaXRlbS5ob3VycyAqIEBob3VybHlSYXRlXG4gICAgICAjIEFwcGx5IGRpc2NvdW50IG92ZXIgc3VidG90YWwgaWYgaXQgZXhpc3RzXG4gICAgICBpZiBpdGVtLmRpc2NvdW50PyB0aGVuIHN1YnRvdGFsID0gc3VidG90YWwgKiAoMS1pdGVtLmRpc2NvdW50KVxuICAgICAgc3VidG90YWxcblxuICAgICMgVmFsaWRhdGUgdGhlIG5ldyBhdHRyaWJ1dGVzIG9mIHRoZSBtb2RlbCBiZWZvcmUgYWNjZXB0aW5nIHRoZW1cbiAgICB2YWxpZGF0ZTogKGRhdGEpPT5cbiAgICAgIHVubGVzcyBfLmtleXMoZGF0YSkubGVuZ3RoID4gMFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJQcm92aWRlZCBtb2RlbCBoYXMgbm8gYXR0cmlidXRlcy4gXCIrXG4gICAgICAgICAgXCJDaGVjayB0aGUgYXJndW1lbnRzIG9mIHRoaXMgbW9kZWwncyBpbml0aWFsaXphdGlvbiBjYWxsLlwiXG5cbiAgICAgICMgUGVyZm9ybSBhIHZhbGlkYXRpb24gb2YgdGhlIHByb3Bvc2VkIGRhdGEgYWdhaW4gdGhlIEpTT04gU2NoZW1hIChkcmFmdFxuICAgICAgIyAwNCkgb2YgdGhlIGludm9pY2UuIFRoaXMgbWFrZXMgc3VyZSBvZiBtb3N0IHJlcXVpcmVtZW50cyBvZiB0aGUgZGF0YS5cbiAgICAgIGlmIG5vdCB0djQudmFsaWRhdGUgZGF0YSwgc2NoZW1hXG4gICAgICAgIHRocm93IHR2NC5lcnJvclxuXG4gICAgICB1bmxlc3MgZGF0YS5tZXRhPyB0aGVuIHRocm93IG5ldyBFcnJvciBcIk5vIGludm9pY2UgbWV0YS1kYXRhIHByb3ZpZGVkXCJcblxuICAgICAgaWQgPSBkYXRhLm1ldGEuaWRcbiAgICAgIHVubGVzcyBpZD8gdGhlbiB0aHJvdyBuZXcgRXJyb3IgXCJObyBpbnZvaWNlIElEIHByb3ZpZGVkXCJcbiAgICAgIGlmIGlkPyB0aGVuIEBpc05hdHVyYWxJbnQoaWQsIFwiSW52b2ljZSBJRFwiKVxuXG4gICAgICBwZXJpb2QgPSBkYXRhLm1ldGEucGVyaW9kXG4gICAgICBpZiBwZXJpb2Q/IHRoZW4gQGlzTmF0dXJhbEludChwZXJpb2QsIFwiSW52b2ljZSBwZXJpb2RcIilcblxuICAgICAgZGF0ZSA9IG5ldyBEYXRlIGRhdGEubWV0YS5kYXRlXG4gICAgICB1bmxlc3MgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRlKSBpcyBcIltvYmplY3QgRGF0ZV1cIikgYW5kIG5vdCBpc05hTihkYXRlLmdldFRpbWUoKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiSW52b2ljZSBkYXRlIGlzIG5vdCBhIHZhbGlkL3BhcnNhYmxlIHZhbHVlXCJcblxuICAgICAgdW5sZXNzIGRhdGEuY2xpZW50P1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJObyBkYXRhIHByb3ZpZGVkIGFib3V0IHRoZSBjbGllbnQvdGFyZ2V0IG9mIHRoZVxuICAgICAgICBpbnZvaWNlXCJcblxuICAgICAgdW5sZXNzIGRhdGEuY2xpZW50Lm9yZ2FuaXphdGlvbiBvciBkYXRhLmNsaWVudC5jb250YWN0UGVyc29uXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIkF0IGxlYXN0IHRoZSBvcmdhbml6YXRpb24gbmFtZSBvciBjb250YWN0IHBlcnNvbiBuYW1lXG4gICAgICAgIG11c3QgYmUgcHJvdmlkZWRcIlxuICAgICAgICBcbiAgICAgIHBvc3RhbENvZGUgPSBkYXRhLmNsaWVudC5wb3N0YWxjb2RlXG4gICAgICAjIFBvc3RhbCBjb2RlIGlzIG9wdGlvbmFsLCBmb3IgY2xpZW50cyB3aGVyZSBpdCBpcyBzdGlsbCB1bmtub3duLCBidXQgd2hlblxuICAgICAgIyBkZWZpbmVkLCBEdXRjaCBwb3N0YWwgY29kZXMgYXJlIG9ubHkgdmFsaWQgd2hlbiA2IGNoYXJhY3RlcnMgbG9uZy5cbiAgICAgIGlmIHBvc3RhbENvZGU/Lmxlbmd0aD8gYW5kIG5vdCBAaXNJbnRlcm5hdGlvbmFsKGRhdGEuY2xpZW50LmNvdW50cnkpXG4gICAgICAgIHBvc3RhbENvZGUgPSBzLmNsZWFuKHBvc3RhbENvZGUpXG4gICAgICAgIGlmIHBvc3RhbENvZGUubGVuZ3RoIDwgNlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlBvc3RhbCBjb2RlIG11c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzIGxvbmdcIlxuICAgICAgICBlbHNlIGlmIHBvc3RhbENvZGUubGVuZ3RoID4gN1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlBvc3RhbCBjb2RlIG1heSBub3QgYmUgbG9uZ2VyIHRoYW4gNyBjaGFyYWN0ZXJzXCJcbiAgICAgICAgZWxzZSBpZiBub3QgcG9zdGFsQ29kZS5tYXRjaCgvXFxkezR9XFxzP1tBLXpdezJ9LylcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ1Bvc3RhbCBjb2RlIG11c3QgYmUgb2YgZm9ybWF0IC9cXFxcZHs0fVxcXFxzP1tBLXpdezJ9LyxcbiAgICAgICAgICBlLmcuIDEyMzRBQiBvciAxMjM0IGFiJ1xuXG4gICAgICBpZiAobm90IEBzZXJ2aWNlcz8gYW5kIG5vdCBAcHJvZHVjdHMpIG9yIEBzZXJ2aWNlcz8ubGVuZ3RoIGlzIDAgYW5kIEBwcm9kdWN0cy5sZW5ndGggaXMgMFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJEb2N1bWVudCBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgc29tZSBwcm9kdWN0cyBvclxuICAgICAgICBzZXJ2aWNlcy4gRm91bmQgbm9uZSBpbiBlaXRoZXIgY2F0ZWdvcnkgaW5zdGVhZC4gRG9jdW1lbnRzIHdpdGggYW5cbiAgICAgICAgZW1wdHkgYm9keSBhcmUgbm90IHZhbGlkLlwiXG5cbiAgICAgIGlmIEBzZXJ2aWNlcz8ubGVuZ3RoID4gMCBhbmQgbm90IEBob3VybHlSYXRlP1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJObyBob3VybHkgc2VydmljZSBwcmljZSByYXRlIHByb3ZpZGVkLiBNdXN0IGJlXG4gICAgICAgIHByb3ZpZGVkIGJlY2F1c2UgaXRlbXMgY29udGFpbiBzZXJ2aWNlcy5cIlxuXG4gICAgICBpZiBAc2VydmljZXM/IHRoZW4gZm9yIGl0ZW0gaW4gQHNlcnZpY2VzXG4gICAgICAgIGlmIGl0ZW0uc3VidG90YWwgaXMgMFxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlN1YnRvdGFsIG9mIDAgZm9yIHNlcnZpY2UgaXRlbVxuICAgICAgICAgICcje2l0ZW0uZGVzY3JpcHRpb259JyB3aXRoICN7aXRlbS5ob3Vyc30gaG91cnNcIlxuXG4gICAgICBpZiBAcHJvZHVjdHM/IHRoZW4gZm9yIGl0ZW0gaW4gQHByb2R1Y3RzXG4gICAgICAgIGlmIGl0ZW0uc3VidG90YWwgaXMgMFxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlN1YnRvdGFsIG9mIDAgZm9yIHByb2R1Y3QgaXRlbVxuICAgICAgICAgICcje2l0ZW0uZGVzY3JpcHRpb259JyB3aXRoIGEgcXVhbnRpdHkgb2YgI3tpdGVtLnF1YW50aXR5fVwiXG5cbiAgICAgIGlmIEBzdWJ0b3RhbCgpIDwgMVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJTdWJ0b3RhbCBvZiAje0BzdWJ0b3RhbCgpfSB0b28gbG93IGZvciByZWFsIHdvcmxkXG4gICAgICAgIHVzYWdlIHBhdHRlcm5zXCJcblxuICByZXR1cm4gVGVtcGxhdGVNb2RlbCJdfQ==
