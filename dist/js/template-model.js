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
      parsed = parseInt(value);
      if (isNaN(parsed)) {
        throw new Error("Could not parse value '" + value + "' to integer");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7QUFBQSxZQUFBLEdBQWUsQ0FDYixZQURhLEVBRWIsbUJBRmEsRUFHYixLQUhhLEVBSWIsYUFKYSxFQUtiLFFBTGEsRUFNYixXQU5hOztBQVFmLE1BQUEsQ0FBTyxZQUFQLEVBQXFCLFNBQUE7QUFFbkIsTUFBQTtFQUFDLGdCQUFELEVBQUksZ0JBQUosRUFBTyxrQkFBUCxFQUFZLHFCQUFaLEVBQW9CO0VBRWQ7SUFFUyx1QkFBQyxJQUFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDWCxVQUFBO01BQUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQVksSUFBWjtNQUlBLElBQUcscUJBQUg7QUFBbUI7QUFBQSxhQUFBLHFDQUFBOztVQUNqQixFQUFFLENBQUMsUUFBSCxHQUFjLElBQUMsQ0FBQSxlQUFELENBQWlCLEVBQWpCO0FBREcsU0FBbkI7O01BR0EsSUFBRyxxQkFBSDtBQUFtQjtBQUFBLGFBQUEsd0NBQUE7O1VBQ2pCLEVBQUUsQ0FBQyxRQUFILEdBQWMsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsRUFBakI7QUFERyxTQUFuQjs7SUFSVzs7NEJBV2IsWUFBQSxHQUFjLFNBQUE7YUFDWjtRQUFBLFVBQUEsRUFBWSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVo7O0lBRFk7OzRCQUdkLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsYUFBRCxDQUFlLFNBQWY7TUFDVCxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxLQUFmLEVBQXNCLEdBQXRCO01BQ1QsUUFBQSxHQUFhLENBQUMsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFELENBQUEsR0FBVyxHQUFYLEdBQWM7TUFFM0IsSUFBRyx3QkFBSDtRQUNFLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBcUIsS0FBckIs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QU0sa0NBQUEsR0FDYixJQUFJLENBQUMsV0FEUSxHQUNJLFNBREosR0FDYSxJQUFJLENBQUMsS0FEbEIsR0FDd0IsUUFEOUIsRUFEWjs7QUFEaUIsU0FBbkI7O01BS0EsSUFBRyxxQkFBSDtBQUFtQjtBQUFBLGFBQUEsd0NBQUE7O1VBQ2pCLElBQUcsSUFBSSxDQUFDLFFBQUwsS0FBaUIsQ0FBcEI7QUFDRSxrQkFBVSxJQUFBLEtBQUEsQ0FBTSxrQ0FBQSxHQUNiLElBQUksQ0FBQyxXQURRLEdBQ0ksdUJBREosR0FDMkIsSUFBSSxDQUFDLFFBRHRDLEVBRFo7O0FBRGlCLFNBQW5COztNQUtBLElBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLEdBQWMsQ0FBakI7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFNLGNBQUEsR0FBYyxDQUFDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBRCxDQUFkLEdBQTJCLHdDQUFqQyxFQURaOztJQS9EUTs7Ozs7QUFtRVosU0FBTztBQXpSWSxDQUFyQiIsImZpbGUiOiJ0ZW1wbGF0ZS1tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImRlcGVuZGVuY2llcyA9IFtcbiAgJ3VuZGVyc2NvcmUnXG4gICd1bmRlcnNjb3JlLnN0cmluZycsXG4gICd0djQnLFxuICAnanNvbiFzY2hlbWEnLFxuICAnbW9tZW50JyxcbiAgJ21vbWVudF9ubCdcbl1cbmRlZmluZSBkZXBlbmRlbmNpZXMsICgpLT5cbiAgIyBVbnBhY2sgdGhlIGxvYWRlZCBkZXBlbmRlbmNpZXMgd2UgcmVjZWl2ZSBhcyBhcmd1bWVudHNcbiAgW18sIHMsIHR2NCwgc2NoZW1hLCBtb21lbnRdID0gYXJndW1lbnRzXG5cbiAgY2xhc3MgVGVtcGxhdGVNb2RlbFxuXG4gICAgY29uc3RydWN0b3I6IChkYXRhKS0+XG4gICAgICBfLmV4dGVuZCBALCBkYXRhXG5cbiAgICAgICMgVE9ETzogRnVnbHkgaGFjaywgbGlzdCBvZiBjb21wdXRlZCBwcm9wZXJ0aWVzIGJlY2F1c2UgSGFuZGxlYmFyc1xuICAgICAgIyBkb2Vzbid0IGFsbG93IGNoYWluaW5nIGZ1bmN0aW9uc1xuICAgICAgaWYgQHByb2R1Y3RzPyB0aGVuIGZvciBwciBpbiBAcHJvZHVjdHNcbiAgICAgICAgcHIuc3VidG90YWwgPSBAcHJvZHVjdFN1YnRvdGFsIHByXG5cbiAgICAgIGlmIEBzZXJ2aWNlcz8gdGhlbiBmb3Igc3IgaW4gQHNlcnZpY2VzXG4gICAgICAgIHNyLnN1YnRvdGFsID0gQHNlcnZpY2VTdWJ0b3RhbCBzclxuXG4gICAgZG9jdW1lbnRNZXRhOiA9PlxuICAgICAgJ2ZpbGVuYW1lJzogQGZpbGVuYW1lKClcblxuICAgIGZpbGVuYW1lOiA9PlxuICAgICAgY2xpZW50ID0gQGNsaWVudERpc3BsYXkoJ2NvbXBhbnknKVxuICAgICAgY2xpZW50ID0gY2xpZW50LnJlcGxhY2UgL1xccy9nLCAnLScgIyBTcGFjZXMgdG8gZGFzaGVzIHVzaW5nIHJlZ2V4XG4gICAgICBmaWxlbmFtZSA9IFwiI3tAZnVsbElEKCl9XyN7Y2xpZW50fVwiXG5cbiAgICAgIGlmIEBwcm9qZWN0TmFtZT9cbiAgICAgICAgcHJvamVjdCA9IEBwcm9qZWN0TmFtZS5yZXBsYWNlIC9cXHMvZywgJy0nICMgU3BhY2VzIHRvIGRhc2hlcyB1c2luZyByZWdleFxuICAgICAgICBmaWxlbmFtZSA9IGZpbGVuYW1lICsgXCJfI3twcm9qZWN0fVwiXG4gICAgICBcbiAgICAgIGlmIEBtZXRhLnBlcmlvZD9cbiAgICAgICAgZmlsZW5hbWUgPSBmaWxlbmFtZSArIFwiX1Aje0BtZXRhLnBlcmlvZH1cIlxuXG4gICAgICBpZiBAaXNRdW90YXRpb24oKVxuICAgICAgICBmaWxlbmFtZSA9IGZpbGVuYW1lICsgXCJfT1wiXG5cbiAgICAgIGZpbGVuYW1lXG5cbiAgICBjb21wYW55RnVsbDogPT5cbiAgICAgIEBvcmlnaW4uY29tcGFueSsnICcrQG9yaWdpbi5sYXdmb3JtXG5cbiAgICBmaXNjYWxUeXBlOiA9PlxuICAgICAgIyBTdXBwb3J0ZWQgdHlwZXNcbiAgICAgIGlmIEBtZXRhLnR5cGUgaXMgJ3F1b3RhdGlvbicgb3IgQG1ldGEudHlwZSBpcyAnaW52b2ljZSdcbiAgICAgICAgQG1ldGEudHlwZVxuICAgICAgZWxzZSBpZiBub3QgQG1ldGEudHlwZT8gIyBEZWZhdWx0IHR5cGUgaWYgdW5kZWZpbmVkXG4gICAgICAgICdpbnZvaWNlJ1xuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ1Vuc3VwcG9ydGVkIHRlbXBsYXRlIGZpc2NhbCB0eXBlLiBUaGUgbW9kZWxcbiAgICAgICAgXCJtZXRhLnR5cGVcIiBzaG91bGQgYmUgZWl0aGVyIGludm9pY2UsIHF1b3RhdGlvbiBvciB1bmRlZmluZWQgKGRlZmF1bHRzXG4gICAgICAgIHRvIGludm9pY2UpLidcblxuICAgIGlzUXVvdGF0aW9uOiA9PiBAZmlzY2FsVHlwZSgpIGlzICdxdW90YXRpb24nXG4gICAgaXNJbnZvaWNlOiA9PiBAZmlzY2FsVHlwZSgpIGlzICdpbnZvaWNlJ1xuXG4gICAgbGFuZ3VhZ2U6IChjb3VudHJ5KS0+XG4gICAgICBpZiBub3QgY291bnRyeT8gdGhlbiBjb3VudHJ5ID0gQGNsaWVudC5jb3VudHJ5XG5cbiAgICAgIHJldHVybiAnbmwnIHVubGVzcyBjb3VudHJ5PyAjIElmIG5vIGNvdW50cnkgaXMgc3BlY2lmaWVkLCB3ZSBhc3N1bWUgRHV0Y2hcblxuICAgICAgZHV0Y2ggPSBzLmNvbnRhaW5zKGNvdW50cnkudG9Mb3dlckNhc2UoKSwgXCJuZXRoZXJsYW5kc1wiKSBvclxuICAgICAgICAgICAgICBzLmNvbnRhaW5zKGNvdW50cnkudG9Mb3dlckNhc2UoKSwgXCJuZWRlcmxhbmRcIikgb3JcbiAgICAgICAgICAgICAgcy5jb250YWlucyhjb3VudHJ5LnRvTG93ZXJDYXNlKCksIFwiaG9sbGFuZFwiKSBvclxuICAgICAgICAgICAgICBjb3VudHJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpIGlzIFwibmxcIlxuICAgICAgaWYgZHV0Y2ggdGhlbiByZXR1cm4gJ25sJyBlbHNlICdlbidcblxuICAgIGlzSW50ZXJuYXRpb25hbDogKGNvdW50cnkpPT5cbiAgICAgIGlmIG5vdCBjb3VudHJ5PyB0aGVuIGNvdW50cnkgPSBAY2xpZW50LmNvdW50cnlcblxuICAgICAgQGxhbmd1YWdlKGNvdW50cnkpIGlzbnQgJ25sJ1xuXG4gICAgaXNOYXR1cmFsSW50OiAoaW50LCBhdHRyKS0+XG4gICAgICBpZiBpc05hTiBwYXJzZUludChpbnQsIDEwKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCIje2F0dHJ9IGNvdWxkIG5vdCBiZSBwYXJzZWRcIlxuICAgICAgaWYgcGFyc2VJbnQoaW50LCAxMCkgPD0gMFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCIje2F0dHJ9IG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyXCJcbiAgICAgIGlmIChwYXJzZUludChpbnQsIDEwKSBpc250IHBhcnNlRmxvYXQoaW50LCAxMCkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIiN7YXR0cn0gbXVzdCBiZSBhbiBpbnRlZ2VyIChub3QgZmxvYXRpbmcgcG9pbnQpXCJcblxuXG5cbiAgICBlbWFpbDogKGVtYWlsKSAtPlxuICAgICAgcmV0dXJuIFwibWFpbHRvOiN7ZW1haWx9XCJcbiAgICB3ZWJzaXRlOiAod2Vic2l0ZSkgLT5cbiAgICAgIHJldHVybiBcImh0dHBzOi8vd3d3LiN7d2Vic2l0ZX1cIlxuICAgIGZ1bGxJRDogPT5cbiAgICAgIG1ldGEgPSBAbWV0YVxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKG1ldGEuZGF0ZSlcbiAgICAgIGRhdGUuZ2V0VVRDRnVsbFllYXIoKSsnLicrcy5wYWQobWV0YS5pZC50b1N0cmluZygpLCA0LCAnMCcpXG5cbiAgICBib29raW5nRGF0ZTogPT5cbiAgICAgIGlmIEBpc0ludGVybmF0aW9uYWwoQGNsaWVudC5jb3VudHJ5KVxuICAgICAgICBtb21lbnQubG9jYWxlICdlbidcbiAgICAgIGVsc2VcbiAgICAgICAgbW9tZW50LmxvY2FsZSAnbmwnXG5cbiAgICAgIG1vbWVudChAbWV0YS5kYXRlKS5mb3JtYXQoJ0xMJylcblxuICAgIGV4cGlyeURhdGU6IChkYXRlLCBwZXJpb2QpPT5cbiAgICAgIGlmIG5vdCBkYXRlPyAgICB0aGVuIGRhdGUgICAgID0gQG1ldGEuZGF0ZVxuICAgICAgaWYgbm90IHBlcmlvZD8gIHRoZW4gcGVyaW9kICAgPSBAdmFsaWRpdHlQZXJpb2RcblxuICAgICAgaWYgQGlzSW50ZXJuYXRpb25hbCgpXG4gICAgICAgIG1vbWVudC5sb2NhbGUgJ2VuJ1xuICAgICAgZWxzZVxuICAgICAgICBtb21lbnQubG9jYWxlICdubCdcblxuICAgICAgbW9tZW50KEBtZXRhLmRhdGUpLmFkZChwZXJpb2QsICdkYXlzJykuZm9ybWF0KCdMTCcpXG4gICAgICBcbiAgICBjbGllbnREaXNwbGF5OiAocHJpb3JpdHkpLT5cbiAgICAgIGlmIHByaW9yaXR5IGlzICdjb21wYW55J1xuICAgICAgICBAY2xpZW50Lm9yZ2FuaXphdGlvbiBvciBAY2xpZW50LmNvbnRhY3RQZXJzb25cbiAgICAgIGVsc2VcbiAgICAgICAgQGNsaWVudC5jb250YWN0UGVyc29uIG9yIEBjbGllbnQub3JnYW5pemF0aW9uXG5cbiAgICAjIFVzZWZ1bCBmb3IgaTE4biAuLi4gJ3RoaXMgc2VydmljZScvJ3RoZXNlIHNlcnZpY2VzJ1xuICAgIGl0ZW1zUGx1cmFsOiAtPlxuICAgICAgQGludm9pY2VJdGVtcy5sZW5ndGggPiAxXG5cbiAgICAjIFVzZWZ1bCBmb3IgaTE4biAuLi4gJ3RoaXMgc2VydmljZScvJ3RoZXNlIHNlcnZpY2VzJ1xuICAgIGhhc0Rpc2NvdW50czogKGNhdGVnb3J5KS0+XG4gICAgICBjaGVjayA9IChpdGVtKS0+IGl0ZW0uZGlzY291bnQ/ID4gMFxuICAgICAgcHJvZHVjdHMgPSBfLnNvbWUgQHByb2R1Y3RzLCBjaGVja1xuICAgICAgc2VydmljZXMgPSBfLnNvbWUgQHNlcnZpY2VzLCBjaGVja1xuICAgICAgc3dpdGNoIGNhdGVnb3J5XG4gICAgICAgIHdoZW4gJ3Byb2R1Y3RzJ1xuICAgICAgICAgIHByb2R1Y3RzXG4gICAgICAgIHdoZW4gJ3NlcnZpY2VzJ1xuICAgICAgICAgIHNlcnZpY2VzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwcm9kdWN0cyBvciBzZXJ2aWNlc1xuXG4gICAgaGFzUHJvZHVjdHNEaXNjb3VudHM6IC0+IEBoYXNEaXNjb3VudHMoJ3Byb2R1Y3RzJylcblxuICAgIGhhc1NlcnZpY2VzRGlzY291bnRzOiAtPiBAaGFzRGlzY291bnRzKCdzZXJ2aWNlcycpXG5cbiAgICBoYXNQcm9kdWN0czogLT4gQHByb2R1Y3RzPy5sZW5ndGggPiAwXG5cbiAgICBoYXNTZXJ2aWNlczogLT4gQHNlcnZpY2VzPy5sZW5ndGggPiAwXG5cbiAgICBwcm9kdWN0c1RhYmxlRm9vdGVyQ29sc3BhbjogLT5cbiAgICAgIGlmIEBoYXNEaXNjb3VudHMoJ3Byb2R1Y3RzJykgdGhlbiA0IGVsc2UgM1xuXG4gICAgc2VydmljZXNUYWJsZUZvb3RlckNvbHNwYW46IC0+XG4gICAgICBpZiBAaGFzRGlzY291bnRzKCdzZXJ2aWNlcycpIHRoZW4gMiBlbHNlIDFcblxuICAgIGRpc2NvdW50RGlzcGxheTogLT5cbiAgICAgIChAZGlzY291bnQgKiAxMDApXG5cbiAgICAjIFN1YnRvdGFsIG9mIGFsbCBvciBqdXN0IG9uZSBjYXRlZ29yeSBvZiBpdGVtcyAod2l0aG91dCB0YXhlcylcbiAgICBzdWJ0b3RhbDogKGNhdGVnb3J5KT0+XG4gICAgICBwcm9kdWN0cyA9IF8ucmVkdWNlIEBwcm9kdWN0cywgKCAoc3VtLCBpdGVtKT0+IHN1bSArIEBwcm9kdWN0U3VidG90YWwgaXRlbSApLCAwXG4gICAgICBzZXJ2aWNlcyA9IF8ucmVkdWNlIEBzZXJ2aWNlcywgKCAoc3VtLCBpdGVtKT0+IHN1bSArIEBzZXJ2aWNlU3VidG90YWwgaXRlbSApLCAwXG4gICAgICBzd2l0Y2ggY2F0ZWdvcnlcbiAgICAgICAgd2hlbiAncHJvZHVjdHMnXG4gICAgICAgICAgcHJvZHVjdHNcbiAgICAgICAgd2hlbiAnc2VydmljZXMnXG4gICAgICAgICAgc2VydmljZXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHByb2R1Y3RzICsgc2VydmljZXNcblxuICAgIHByb2R1Y3RzU3VidG90YWw6ID0+IEBzdWJ0b3RhbCgncHJvZHVjdHMnKVxuXG4gICAgc2VydmljZXNTdWJ0b3RhbDogPT4gQHN1YnRvdGFsKCdzZXJ2aWNlcycpXG4gICAgXG4gICAgVkFUOiAoY2F0ZWdvcnkpPT4gQHN1YnRvdGFsKGNhdGVnb3J5KSAqIEB2YXRQZXJjZW50YWdlXG5cbiAgICBWQVRwcm9kdWN0czogPT4gQFZBVCgncHJvZHVjdHMnKVxuXG4gICAgVkFUc2VydmljZXM6ID0+IEBWQVQoJ3NlcnZpY2VzJylcblxuICAgIFZBVHJhdGU6ID0+IChAdmF0UGVyY2VudGFnZSAqIDEwMClcblxuICAgIHRvdGFsOiAoY2F0ZWdvcnkpPT5cbiAgICAgIEBzdWJ0b3RhbChjYXRlZ29yeSkgKyBAVkFUKGNhdGVnb3J5KVxuXG4gICAgcHJvZHVjdHNUb3RhbDogPT4gQHRvdGFsKCdwcm9kdWN0cycpXG5cbiAgICBzZXJ2aWNlc1RvdGFsOiA9PiBAdG90YWwoJ3NlcnZpY2VzJylcblxuICAgICMgUmVuZGVycyB0aGUgdmFsdWUgKGFuZCBldmFsdWF0ZXMgaXQgZmlyc3QgaWYgaXQncyBhIGZ1bmN0aW9uKSBhcyBhXG4gICAgIyBjdXJyZW5jeSAodGxkcjsgcHV0cyBhIOKCrCBvciBzdWNoIGluIGZyb24gb2YgaXQpXG4gICAgY3VycmVuY3k6ICh2YWx1ZSkgPT5cbiAgICAgIGlmIG5vdCB2YWx1ZT9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQXNrZWQgdG8gcmVuZGVyIGN1cnJlbmN5IG9mIHVuZGVmaW5lZCB2YXJpYWJsZVwiXG5cbiAgICAgICMgVE9ETzogRnVnbHkgaGFjayBiZWNhdXNlIEhhbmRsZWJhcnMgZXZhbHVhdGUgYSBmdW5jdGlvbiB3aGVuIHBhc3NlZCB0b1xuICAgICAgIyBhIGhlbHBlciBhcyB0aGUgdmFsdWVcbiAgICAgIGlmIFwiZnVuY3Rpb25cIiBpcyB0eXBlb2YgdmFsdWUgdGhlbiB2YWx1ZSA9IHZhbHVlKClcblxuICAgICAgc3ltYm9sID0gQGN1cnJlbmN5U3ltYm9sXG7CoCDCoCDCoCBwYXJzZWQgPSBwYXJzZUludCh2YWx1ZSlcbsKgIMKgIMKgIGlmIGlzTmFOKHBhcnNlZClcbsKgIMKgIMKgIMKgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBwYXJzZSB2YWx1ZSAnXCIgKyB2YWx1ZSArIFwiJyB0byBpbnRlZ2VyXCIpXG7CoCDCoCDCoCBlbHNlXG7CoCDCoCDCoCDCoCByZXR1cm4gc3ltYm9sICsgJyAnICsgcGFyc2VkLnRvRml4ZWQoMilcblxuICAgICMgQ2FsY3VsYXRlcyB0aGUgaXRlbSBzdWJ0b3RhbCAocHJpY2UgdGltZXMgcXVhbnRpdHkgaW4gY2FzZSBvZiBwcm9kdWN0cyxcbiAgICAjIG9yIGhvdXJseSByYXRlIHRpbWVzIGhvdXJzIGluIGNhc2Ugb2Ygc2VydmljZXMsIGFuZCB0aGVuIGEgcG9zc2libGVcbiAgICAjIGRpc2NvdW50IGFwcGxpZWQpLlxuICAgIHByb2R1Y3RTdWJ0b3RhbDogKGl0ZW0pLT5cbiAgICAgICMgQ2FsY3VsYXRlIHRoZSBzdWJ0b3RhbCBvZiB0aGlzIGl0ZW1cbiAgICAgIHN1YnRvdGFsID0gaXRlbS5wcmljZSAqIGl0ZW0ucXVhbnRpdHlcbiAgICAgICMgQXBwbHkgZGlzY291bnQgb3ZlciBzdWJ0b3RhbCBpZiBpdCBleGlzdHNcbiAgICAgIGlmIGl0ZW0uZGlzY291bnQ/IHRoZW4gc3VidG90YWwgPSBzdWJ0b3RhbCAqICgxLWl0ZW0uZGlzY291bnQpXG4gICAgICBzdWJ0b3RhbFxuXG4gICAgc2VydmljZVN1YnRvdGFsOiAoaXRlbSk9PlxuICAgICAgIyBDYWxjdWxhdGUgdGhlIHN1YnRvdGFsIG9mIHRoaXMgaXRlbVxuICAgICAgc3VidG90YWwgPSBpdGVtLmhvdXJzICogQGhvdXJseVJhdGVcbiAgICAgICMgQXBwbHkgZGlzY291bnQgb3ZlciBzdWJ0b3RhbCBpZiBpdCBleGlzdHNcbiAgICAgIGlmIGl0ZW0uZGlzY291bnQ/IHRoZW4gc3VidG90YWwgPSBzdWJ0b3RhbCAqICgxLWl0ZW0uZGlzY291bnQpXG4gICAgICBzdWJ0b3RhbFxuXG4gICAgIyBWYWxpZGF0ZSB0aGUgbmV3IGF0dHJpYnV0ZXMgb2YgdGhlIG1vZGVsIGJlZm9yZSBhY2NlcHRpbmcgdGhlbVxuICAgIHZhbGlkYXRlOiAoZGF0YSk9PlxuICAgICAgdW5sZXNzIF8ua2V5cyhkYXRhKS5sZW5ndGggPiAwXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlByb3ZpZGVkIG1vZGVsIGhhcyBubyBhdHRyaWJ1dGVzLiBcIitcbiAgICAgICAgICBcIkNoZWNrIHRoZSBhcmd1bWVudHMgb2YgdGhpcyBtb2RlbCdzIGluaXRpYWxpemF0aW9uIGNhbGwuXCJcblxuICAgICAgIyBQZXJmb3JtIGEgdmFsaWRhdGlvbiBvZiB0aGUgcHJvcG9zZWQgZGF0YSBhZ2FpbiB0aGUgSlNPTiBTY2hlbWEgKGRyYWZ0XG4gICAgICAjIDA0KSBvZiB0aGUgaW52b2ljZS4gVGhpcyBtYWtlcyBzdXJlIG9mIG1vc3QgcmVxdWlyZW1lbnRzIG9mIHRoZSBkYXRhLlxuICAgICAgaWYgbm90IHR2NC52YWxpZGF0ZSBkYXRhLCBzY2hlbWFcbiAgICAgICAgdGhyb3cgdHY0LmVycm9yXG5cbiAgICAgIHVubGVzcyBkYXRhLm1ldGE/IHRoZW4gdGhyb3cgbmV3IEVycm9yIFwiTm8gaW52b2ljZSBtZXRhLWRhdGEgcHJvdmlkZWRcIlxuXG4gICAgICBpZCA9IGRhdGEubWV0YS5pZFxuICAgICAgdW5sZXNzIGlkPyB0aGVuIHRocm93IG5ldyBFcnJvciBcIk5vIGludm9pY2UgSUQgcHJvdmlkZWRcIlxuICAgICAgaWYgaWQ/IHRoZW4gQGlzTmF0dXJhbEludChpZCwgXCJJbnZvaWNlIElEXCIpXG5cbiAgICAgIHBlcmlvZCA9IGRhdGEubWV0YS5wZXJpb2RcbiAgICAgIGlmIHBlcmlvZD8gdGhlbiBAaXNOYXR1cmFsSW50KHBlcmlvZCwgXCJJbnZvaWNlIHBlcmlvZFwiKVxuXG4gICAgICBkYXRlID0gbmV3IERhdGUgZGF0YS5tZXRhLmRhdGVcbiAgICAgIHVubGVzcyAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGUpIGlzIFwiW29iamVjdCBEYXRlXVwiKSBhbmQgbm90IGlzTmFOKGRhdGUuZ2V0VGltZSgpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJJbnZvaWNlIGRhdGUgaXMgbm90IGEgdmFsaWQvcGFyc2FibGUgdmFsdWVcIlxuXG4gICAgICB1bmxlc3MgZGF0YS5jbGllbnQ/XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIk5vIGRhdGEgcHJvdmlkZWQgYWJvdXQgdGhlIGNsaWVudC90YXJnZXQgb2YgdGhlXG4gICAgICAgIGludm9pY2VcIlxuXG4gICAgICB1bmxlc3MgZGF0YS5jbGllbnQub3JnYW5pemF0aW9uIG9yIGRhdGEuY2xpZW50LmNvbnRhY3RQZXJzb25cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiQXQgbGVhc3QgdGhlIG9yZ2FuaXphdGlvbiBuYW1lIG9yIGNvbnRhY3QgcGVyc29uIG5hbWVcbiAgICAgICAgbXVzdCBiZSBwcm92aWRlZFwiXG4gICAgICAgIFxuICAgICAgcG9zdGFsQ29kZSA9IGRhdGEuY2xpZW50LnBvc3RhbGNvZGVcbiAgICAgICMgUG9zdGFsIGNvZGUgaXMgb3B0aW9uYWwsIGZvciBjbGllbnRzIHdoZXJlIGl0IGlzIHN0aWxsIHVua25vd24sIGJ1dCB3aGVuXG4gICAgICAjIGRlZmluZWQsIER1dGNoIHBvc3RhbCBjb2RlcyBhcmUgb25seSB2YWxpZCB3aGVuIDYgY2hhcmFjdGVycyBsb25nLlxuICAgICAgaWYgcG9zdGFsQ29kZT8ubGVuZ3RoPyBhbmQgbm90IEBpc0ludGVybmF0aW9uYWwoZGF0YS5jbGllbnQuY291bnRyeSlcbiAgICAgICAgcG9zdGFsQ29kZSA9IHMuY2xlYW4ocG9zdGFsQ29kZSlcbiAgICAgICAgaWYgcG9zdGFsQ29kZS5sZW5ndGggPCA2XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiUG9zdGFsIGNvZGUgbXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJhY3RlcnMgbG9uZ1wiXG4gICAgICAgIGVsc2UgaWYgcG9zdGFsQ29kZS5sZW5ndGggPiA3XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiUG9zdGFsIGNvZGUgbWF5IG5vdCBiZSBsb25nZXIgdGhhbiA3IGNoYXJhY3RlcnNcIlxuICAgICAgICBlbHNlIGlmIG5vdCBwb3N0YWxDb2RlLm1hdGNoKC9cXGR7NH1cXHM/W0Etel17Mn0vKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciAnUG9zdGFsIGNvZGUgbXVzdCBiZSBvZiBmb3JtYXQgL1xcXFxkezR9XFxcXHM/W0Etel17Mn0vLFxuICAgICAgICAgIGUuZy4gMTIzNEFCIG9yIDEyMzQgYWInXG5cbiAgICAgIGlmIChub3QgQHNlcnZpY2VzPyBhbmQgbm90IEBwcm9kdWN0cykgb3IgQHNlcnZpY2VzPy5sZW5ndGggaXMgMCBhbmQgQHByb2R1Y3RzLmxlbmd0aCBpcyAwXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIkRvY3VtZW50IG11c3QgY29udGFpbiBhdCBsZWFzdCBzb21lIHByb2R1Y3RzIG9yXG4gICAgICAgIHNlcnZpY2VzLiBGb3VuZCBub25lIGluIGVpdGhlciBjYXRlZ29yeSBpbnN0ZWFkLiBEb2N1bWVudHMgd2l0aCBhblxuICAgICAgICBlbXB0eSBib2R5IGFyZSBub3QgdmFsaWQuXCJcblxuICAgICAgaWYgQHNlcnZpY2VzPy5sZW5ndGggPiAwIGFuZCBub3QgQGhvdXJseVJhdGU/XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIk5vIGhvdXJseSBzZXJ2aWNlIHByaWNlIHJhdGUgcHJvdmlkZWQuIE11c3QgYmVcbiAgICAgICAgcHJvdmlkZWQgYmVjYXVzZSBpdGVtcyBjb250YWluIHNlcnZpY2VzLlwiXG5cbiAgICAgIGlmIEBzZXJ2aWNlcz8gdGhlbiBmb3IgaXRlbSBpbiBAc2VydmljZXNcbiAgICAgICAgaWYgaXRlbS5zdWJ0b3RhbCBpcyAwXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiU3VidG90YWwgb2YgMCBmb3Igc2VydmljZSBpdGVtXG4gICAgICAgICAgJyN7aXRlbS5kZXNjcmlwdGlvbn0nIHdpdGggI3tpdGVtLmhvdXJzfSBob3Vyc1wiXG5cbiAgICAgIGlmIEBwcm9kdWN0cz8gdGhlbiBmb3IgaXRlbSBpbiBAcHJvZHVjdHNcbiAgICAgICAgaWYgaXRlbS5zdWJ0b3RhbCBpcyAwXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiU3VidG90YWwgb2YgMCBmb3IgcHJvZHVjdCBpdGVtXG4gICAgICAgICAgJyN7aXRlbS5kZXNjcmlwdGlvbn0nIHdpdGggYSBxdWFudGl0eSBvZiAje2l0ZW0ucXVhbnRpdHl9XCJcblxuICAgICAgaWYgQHN1YnRvdGFsKCkgPCAxXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlN1YnRvdGFsIG9mICN7QHN1YnRvdGFsKCl9IHRvbyBsb3cgZm9yIHJlYWwgd29ybGRcbiAgICAgICAgdXNhZ2UgcGF0dGVybnNcIlxuXG4gIHJldHVybiBUZW1wbGF0ZU1vZGVsIl19
