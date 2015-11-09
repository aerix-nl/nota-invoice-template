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
      this.productSubtotal = bind(this.productSubtotal, this);
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
      this.documentName = bind(this.documentName, this);
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

    TemplateModel.prototype.documentMeta = function(data) {
      return {
        'id': this.fullID(),
        'documentTitle': this.documentName(),
        'filename': this.filename()
      };
    };

    TemplateModel.prototype.documentName = function() {
      return s.capitalize(this.fiscalType() + ' ' + this.fullID());
    };

    TemplateModel.prototype.filename = function() {
      var client, extension, filename, project;
      client = this.clientDisplay('company');
      client = client.replace(/\s/g, '-');
      filename = (this.fullID()) + "_" + client;
      extension = ".pdf";
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
      return filename + extension;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7QUFBQSxZQUFBLEdBQWUsQ0FDYixZQURhLEVBRWIsbUJBRmEsRUFHYixLQUhhLEVBSWIsYUFKYSxFQUtiLFFBTGEsRUFNYixXQU5hOztBQVFmLE1BQUEsQ0FBTyxZQUFQLEVBQXFCLFNBQUE7QUFFbkIsTUFBQTtFQUFDLGdCQUFELEVBQUksZ0JBQUosRUFBTyxrQkFBUCxFQUFZLHFCQUFaLEVBQW9CO0VBRWQ7SUFFUyx1QkFBQyxJQUFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNYLFVBQUE7TUFBQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBWSxJQUFaO01BSUEsSUFBRyxxQkFBSDtBQUFtQjtBQUFBLGFBQUEscUNBQUE7O1VBQ2pCLEVBQUUsQ0FBQyxRQUFILEdBQWMsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsRUFBakI7QUFERyxTQUFuQjs7TUFHQSxJQUFHLHFCQUFIO0FBQW1CO0FBQUEsYUFBQSx3Q0FBQTs7VUFDakIsRUFBRSxDQUFDLFFBQUgsR0FBYyxJQUFDLENBQUEsZUFBRCxDQUFpQixFQUFqQjtBQURHLFNBQW5COztJQVJXOzs0QkFXYixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQ1o7UUFBQSxJQUFBLEVBQWtCLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBbEI7UUFDQSxlQUFBLEVBQWtCLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FEbEI7UUFFQSxVQUFBLEVBQWtCLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FGbEI7O0lBRFk7OzRCQU1kLFlBQUEsR0FBYyxTQUFBO2FBQ1osQ0FBQyxDQUFDLFVBQUYsQ0FBYSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsR0FBZ0IsR0FBaEIsR0FBc0IsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFuQztJQURZOzs0QkFHZCxRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxNQUFBLEdB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QUMsTUFBVixLQUFvQixDQUF4RjtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sOElBQU4sRUFEWjs7TUFHQSwwQ0FBWSxDQUFFLGdCQUFYLEdBQW9CLENBQXBCLElBQThCLHlCQUFqQztBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0seUZBQU4sRUFEWjs7TUFJQSxJQUFHLHFCQUFIO0FBQW1CO0FBQUEsYUFBQSxzQ0FBQTs7VUFDakIsSUFBRyxJQUFJLENBQUMsUUFBTCxLQUFpQixDQUFwQjtBQUEyQixrQkFBVSxJQUFBLEtBQUEsQ0FBTSxrQ0FBQSxHQUFtQyxJQUFJLENBQUMsV0FBeEMsR0FBb0QsU0FBcEQsR0FBNkQsSUFBSSxDQUFDLEtBQWxFLEdBQXdFLFFBQTlFLEVBQXJDOztBQURpQixTQUFuQjs7TUFHQSxJQUFHLHFCQUFIO0FBQW1CO0FBQUEsYUFBQSx3Q0FBQTs7VUFDakIsSUFBRyxJQUFJLENBQUMsUUFBTCxLQUFpQixDQUFwQjtBQUEyQixrQkFBVSxJQUFBLEtBQUEsQ0FBTSxrQ0FBQSxHQUFtQyxJQUFJLENBQUMsV0FBeEMsR0FBb0QsdUJBQXBELEdBQTJFLElBQUksQ0FBQyxRQUF0RixFQUFyQzs7QUFEaUIsU0FBbkI7O01BR0EsSUFBRyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FBYyxDQUFqQjtBQUF3QixjQUFVLElBQUEsS0FBQSxDQUFNLGNBQUEsR0FBYyxDQUFDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBRCxDQUFkLEdBQTJCLHdDQUFqQyxFQUFsQzs7SUF0RFE7Ozs7O0FBd0RaLFNBQU87QUFsUlksQ0FBckIiLCJmaWxlIjoidGVtcGxhdGUtbW9kZWwuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJkZXBlbmRlbmNpZXMgPSBbXG4gICd1bmRlcnNjb3JlJ1xuICAndW5kZXJzY29yZS5zdHJpbmcnLFxuICAndHY0JyxcbiAgJ2pzb24hc2NoZW1hJyxcbiAgJ21vbWVudCcsXG4gICdtb21lbnRfbmwnXG5dXG5kZWZpbmUgZGVwZW5kZW5jaWVzLCAoKS0+XG4gICMgVW5wYWNrIHRoZSBsb2FkZWQgZGVwZW5kZW5jaWVzIHdlIHJlY2VpdmUgYXMgYXJndW1lbnRzXG4gIFtfLCBzLCB0djQsIHNjaGVtYSwgbW9tZW50XSA9IGFyZ3VtZW50c1xuXG4gIGNsYXNzIFRlbXBsYXRlTW9kZWxcblxuICAgIGNvbnN0cnVjdG9yOiAoZGF0YSktPiBcbiAgICAgIF8uZXh0ZW5kIEAsIGRhdGFcblxuICAgICAgIyBUT0RPOlxuICAgICAgIyBGdWdseSBoYWNrLCBsaXN0IG9mIGNvbXB1dGVkIHByb3BlcnRpZXMgYmVjYXVzZSBIYW5kbGViYXJzIGRvZXNuJ3QgYWxsb3cgY2hhaW5pbmcgZnVuY3Rpb25zXG4gICAgICBpZiBAcHJvZHVjdHM/IHRoZW4gZm9yIHByIGluIEBwcm9kdWN0c1xuICAgICAgICBwci5zdWJ0b3RhbCA9IEBwcm9kdWN0U3VidG90YWwgcHJcblxuICAgICAgaWYgQHNlcnZpY2VzPyB0aGVuIGZvciBzciBpbiBAc2VydmljZXNcbiAgICAgICAgc3Iuc3VidG90YWwgPSBAc2VydmljZVN1YnRvdGFsIHNyXG5cbiAgICBkb2N1bWVudE1ldGE6IChkYXRhKT0+XG4gICAgICAnaWQnOiAgICAgICAgICAgICBAZnVsbElEKClcbiAgICAgICdkb2N1bWVudFRpdGxlJzogIEBkb2N1bWVudE5hbWUoKVxuICAgICAgJ2ZpbGVuYW1lJzogICAgICAgQGZpbGVuYW1lKClcblxuICAgICMgVXNlZCBmb3IgdGhlIGh0bWwgaGVhZCB0aXRsZSBlbGVtZW50XG4gICAgZG9jdW1lbnROYW1lOiA9PiBcbiAgICAgIHMuY2FwaXRhbGl6ZSBAZmlzY2FsVHlwZSgpICsgJyAnICsgQGZ1bGxJRCgpXG5cbiAgICBmaWxlbmFtZTogPT5cbiAgICAgIGNsaWVudCA9IEBjbGllbnREaXNwbGF5KCdjb21wYW55JylcbiAgICAgIGNsaWVudCA9IGNsaWVudC5yZXBsYWNlIC9cXHMvZywgJy0nICMgU3BhY2VzIHRvIGRhc2hlcyB1c2luZyByZWdleFxuICAgICAgZmlsZW5hbWUgPSBcIiN7QGZ1bGxJRCgpfV8je2NsaWVudH1cIlxuICAgICAgZXh0ZW5zaW9uID0gXCIucGRmXCJcblxuICAgICAgaWYgQHByb2plY3ROYW1lP1xuICAgICAgICBwcm9qZWN0ID0gQHByb2plY3ROYW1lLnJlcGxhY2UgL1xccy9nLCAnLScgIyBTcGFjZXMgdG8gZGFzaGVzIHVzaW5nIHJlZ2V4XG4gICAgICAgIGZpbGVuYW1lID0gZmlsZW5hbWUgKyBcIl8je3Byb2plY3R9XCJcbiAgICAgIFxuICAgICAgaWYgQG1ldGEucGVyaW9kP1xuICAgICAgICBmaWxlbmFtZSA9IGZpbGVuYW1lICsgXCJfUCN7QG1ldGEucGVyaW9kfVwiXG5cbiAgICAgIGlmIEBpc1F1b3RhdGlvbigpXG4gICAgICAgIGZpbGVuYW1lID0gZmlsZW5hbWUgKyBcIl9PXCJcblxuICAgICAgZmlsZW5hbWUgKyBleHRlbnNpb25cblxuICAgIGNvbXBhbnlGdWxsOiA9PlxuICAgICAgQG9yaWdpbi5jb21wYW55KycgJytAb3JpZ2luLmxhd2Zvcm1cblxuICAgIGZpc2NhbFR5cGU6ID0+XG4gICAgICAjIFN1cHBvcnRlZCB0eXBlc1xuICAgICAgaWYgQG1ldGEudHlwZSBpcyAncXVvdGF0aW9uJyBvciBAbWV0YS50eXBlIGlzICdpbnZvaWNlJ1xuICAgICAgICBAbWV0YS50eXBlXG4gICAgICBlbHNlIGlmIG5vdCBAbWV0YS50eXBlPyAjIERlZmF1bHQgdHlwZSBpZiB1bmRlZmluZWRcbiAgICAgICAgJ2ludm9pY2UnXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvciAnVW5zdXBwb3J0ZWQgdGVtcGxhdGUgZmlzY2FsIHR5cGUuIFRoZSBtb2RlbFxuICAgICAgICBcIm1ldGEudHlwZVwiIHNob3VsZCBiZSBlaXRoZXIgaW52b2ljZSwgcXVvdGF0aW9uIG9yIHVuZGVmaW5lZCAoZGVmYXVsdHNcbiAgICAgICAgdG8gaW52b2ljZSkuJ1xuXG4gICAgaXNRdW90YXRpb246ID0+IEBmaXNjYWxUeXBlKCkgaXMgJ3F1b3RhdGlvbidcbiAgICBpc0ludm9pY2U6ID0+IEBmaXNjYWxUeXBlKCkgaXMgJ2ludm9pY2UnXG5cbiAgICBsYW5ndWFnZTogKGNvdW50cnkpLT5cbiAgICAgIGlmIG5vdCBjb3VudHJ5PyB0aGVuIGNvdW50cnkgPSBAY2xpZW50LmNvdW50cnlcblxuICAgICAgcmV0dXJuICdubCcgdW5sZXNzIGNvdW50cnk/ICMgSWYgbm8gY291bnRyeSBpcyBzcGVjaWZpZWQsIHdlIGFzc3VtZSBEdXRjaFxuXG4gICAgICBkdXRjaCA9IHMuY29udGFpbnMoY291bnRyeS50b0xvd2VyQ2FzZSgpLCBcIm5ldGhlcmxhbmRzXCIpIG9yXG4gICAgICAgICAgICAgIHMuY29udGFpbnMoY291bnRyeS50b0xvd2VyQ2FzZSgpLCBcIm5lZGVybGFuZFwiKSBvclxuICAgICAgICAgICAgICBzLmNvbnRhaW5zKGNvdW50cnkudG9Mb3dlckNhc2UoKSwgXCJob2xsYW5kXCIpIG9yXG4gICAgICAgICAgICAgIGNvdW50cnkudHJpbSgpLnRvTG93ZXJDYXNlKCkgaXMgXCJubFwiXG4gICAgICBpZiBkdXRjaCB0aGVuIHJldHVybiAnbmwnIGVsc2UgJ2VuJ1xuXG4gICAgaXNJbnRlcm5hdGlvbmFsOiAoY291bnRyeSk9PlxuICAgICAgaWYgbm90IGNvdW50cnk/IHRoZW4gY291bnRyeSA9IEBjbGllbnQuY291bnRyeVxuXG4gICAgICBAbGFuZ3VhZ2UoY291bnRyeSkgaXNudCAnbmwnXG5cbiAgICBpc05hdHVyYWxJbnQ6IChpbnQsIGF0dHIpLT5cbiAgICAgIGlmIGlzTmFOIHBhcnNlSW50KGludCwgMTApXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIiN7YXR0cn0gY291bGQgbm90IGJlIHBhcnNlZFwiXG4gICAgICBpZiBwYXJzZUludChpbnQsIDEwKSA8PSAwXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIiN7YXR0cn0gbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXJcIlxuICAgICAgaWYgKHBhcnNlSW50KGludCwgMTApIGlzbnQgcGFyc2VGbG9hdChpbnQsIDEwKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiI3thdHRyfSBtdXN0IGJlIGFuIGludGVnZXIgKG5vdCBmbG9hdGluZyBwb2ludClcIlxuXG5cblxuICAgIGVtYWlsOiAoZW1haWwpIC0+XG4gICAgICByZXR1cm4gXCJtYWlsdG86I3tlbWFpbH1cIlxuICAgIHdlYnNpdGU6ICh3ZWJzaXRlKSAtPlxuICAgICAgcmV0dXJuIFwiaHR0cHM6Ly93d3cuI3t3ZWJzaXRlfVwiXG4gICAgZnVsbElEOiA9PlxuICAgICAgbWV0YSA9IEBtZXRhXG4gICAgICBkYXRlID0gbmV3IERhdGUobWV0YS5kYXRlKVxuICAgICAgZGF0ZS5nZXRVVENGdWxsWWVhcigpKycuJytzLnBhZChtZXRhLmlkLnRvU3RyaW5nKCksIDQsICcwJylcblxuICAgIGJvb2tpbmdEYXRlOiA9PlxuICAgICAgaWYgQGlzSW50ZXJuYXRpb25hbChAY2xpZW50LmNvdW50cnkpXG4gICAgICAgIG1vbWVudC5sb2NhbGUgJ2VuJ1xuICAgICAgZWxzZVxuICAgICAgICBtb21lbnQubG9jYWxlICdubCdcblxuICAgICAgbW9tZW50KEBtZXRhLmRhdGUpLmZvcm1hdCgnTEwnKVxuXG4gICAgZXhwaXJ5RGF0ZTogKGRhdGUsIHBlcmlvZCk9PlxuICAgICAgaWYgbm90IGRhdGU/ICAgIHRoZW4gZGF0ZSAgICAgPSBAbWV0YS5kYXRlXG4gICAgICBpZiBub3QgcGVyaW9kPyAgdGhlbiBwZXJpb2QgICA9IEB2YWxpZGl0eVBlcmlvZFxuXG4gICAgICBpZiBAaXNJbnRlcm5hdGlvbmFsKClcbiAgICAgICAgbW9tZW50LmxvY2FsZSAnZW4nXG4gICAgICBlbHNlXG4gICAgICAgIG1vbWVudC5sb2NhbGUgJ25sJ1xuXG4gICAgICBtb21lbnQoQG1ldGEuZGF0ZSkuYWRkKHBlcmlvZCwgJ2RheXMnKS5mb3JtYXQoJ0xMJylcbiAgICAgIFxuICAgIGNsaWVudERpc3BsYXk6IChwcmlvcml0eSktPlxuICAgICAgaWYgcHJpb3JpdHkgaXMgJ2NvbXBhbnknXG4gICAgICAgIEBjbGllbnQub3JnYW5pemF0aW9uIG9yIEBjbGllbnQuY29udGFjdFBlcnNvblxuICAgICAgZWxzZVxuICAgICAgICBAY2xpZW50LmNvbnRhY3RQZXJzb24gb3IgQGNsaWVudC5vcmdhbml6YXRpb25cblxuICAgICMgVXNlZnVsIGZvciBpMThuIC4uLiAndGhpcyBzZXJ2aWNlJy8ndGhlc2Ugc2VydmljZXMnXG4gICAgaXRlbXNQbHVyYWw6IC0+XG4gICAgICBAaW52b2ljZUl0ZW1zLmxlbmd0aCA+IDFcblxuICAgICMgVXNlZnVsIGZvciBpMThuIC4uLiAndGhpcyBzZXJ2aWNlJy8ndGhlc2Ugc2VydmljZXMnXG4gICAgaGFzRGlzY291bnRzOiAoY2F0ZWdvcnkpLT5cbiAgICAgIGNoZWNrID0gKGl0ZW0pLT4gaXRlbS5kaXNjb3VudD8gPiAwXG4gICAgICBwcm9kdWN0cyA9IF8uc29tZSBAcHJvZHVjdHMsIGNoZWNrXG4gICAgICBzZXJ2aWNlcyA9IF8uc29tZSBAc2VydmljZXMsIGNoZWNrXG4gICAgICBzd2l0Y2ggY2F0ZWdvcnlcbiAgICAgICAgd2hlbiAncHJvZHVjdHMnXG4gICAgICAgICAgcHJvZHVjdHNcbiAgICAgICAgd2hlbiAnc2VydmljZXMnXG4gICAgICAgICAgc2VydmljZXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHByb2R1Y3RzIG9yIHNlcnZpY2VzXG5cbiAgICBoYXNQcm9kdWN0c0Rpc2NvdW50czogLT4gQGhhc0Rpc2NvdW50cygncHJvZHVjdHMnKVxuXG4gICAgaGFzU2VydmljZXNEaXNjb3VudHM6IC0+IEBoYXNEaXNjb3VudHMoJ3NlcnZpY2VzJylcblxuICAgIGhhc1Byb2R1Y3RzOiAtPiBAcHJvZHVjdHM/Lmxlbmd0aCA+IDBcblxuICAgIGhhc1NlcnZpY2VzOiAtPiBAc2VydmljZXM/Lmxlbmd0aCA+IDBcblxuICAgIHByb2R1Y3RzVGFibGVGb290ZXJDb2xzcGFuOiAtPlxuICAgICAgaWYgQGhhc0Rpc2NvdW50cygncHJvZHVjdHMnKSB0aGVuIDQgZWxzZSAzXG5cbiAgICBzZXJ2aWNlc1RhYmxlRm9vdGVyQ29sc3BhbjogLT5cbiAgICAgIGlmIEBoYXNEaXNjb3VudHMoJ3NlcnZpY2VzJykgdGhlbiAyIGVsc2UgMVxuXG4gICAgZGlzY291bnREaXNwbGF5OiAtPlxuICAgICAgKEBkaXNjb3VudCAqIDEwMClcblxuICAgICMgU3VidG90YWwgb2YgYWxsIG9yIGp1c3Qgb25lIGNhdGVnb3J5IG9mIGl0ZW1zICh3aXRob3V0IHRheGVzKVxuICAgIHN1YnRvdGFsOiAoY2F0ZWdvcnkpPT5cbiAgICAgIHByb2R1Y3RzID0gXy5yZWR1Y2UgQHByb2R1Y3RzLCAoIChzdW0sIGl0ZW0pPT4gc3VtICsgQHByb2R1Y3RTdWJ0b3RhbCBpdGVtICksIDBcbiAgICAgIHNlcnZpY2VzID0gXy5yZWR1Y2UgQHNlcnZpY2VzLCAoIChzdW0sIGl0ZW0pPT4gc3VtICsgQHNlcnZpY2VTdWJ0b3RhbCBpdGVtICksIDBcbiAgICAgIHN3aXRjaCBjYXRlZ29yeVxuICAgICAgICB3aGVuICdwcm9kdWN0cydcbiAgICAgICAgICBwcm9kdWN0c1xuICAgICAgICB3aGVuICdzZXJ2aWNlcydcbiAgICAgICAgICBzZXJ2aWNlc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcHJvZHVjdHMgKyBzZXJ2aWNlc1xuXG4gICAgcHJvZHVjdHNTdWJ0b3RhbDogPT4gQHN1YnRvdGFsKCdwcm9kdWN0cycpXG5cbiAgICBzZXJ2aWNlc1N1YnRvdGFsOiA9PiBAc3VidG90YWwoJ3NlcnZpY2VzJylcbiAgICBcbiAgICBWQVQ6IChjYXRlZ29yeSk9PiBAc3VidG90YWwoY2F0ZWdvcnkpICogQHZhdFBlcmNlbnRhZ2VcblxuICAgIFZBVHByb2R1Y3RzOiA9PiBAVkFUKCdwcm9kdWN0cycpXG5cbiAgICBWQVRzZXJ2aWNlczogPT4gQFZBVCgnc2VydmljZXMnKVxuXG4gICAgVkFUcmF0ZTogPT4gKEB2YXRQZXJjZW50YWdlICogMTAwKVxuXG4gICAgdG90YWw6IChjYXRlZ29yeSk9PlxuICAgICAgQHN1YnRvdGFsKGNhdGVnb3J5KSArIEBWQVQoY2F0ZWdvcnkpXG5cbiAgICBwcm9kdWN0c1RvdGFsOiA9PiBAdG90YWwoJ3Byb2R1Y3RzJylcblxuICAgIHNlcnZpY2VzVG90YWw6ID0+IEB0b3RhbCgnc2VydmljZXMnKVxuXG4gICAgIyBSZW5kZXJzIHRoZSB2YWx1ZSAoYW5kIGV2YWx1YXRlcyBpdCBmaXJzdCBpZiBpdCdzIGEgZnVuY3Rpb24pIGFzIGFcbiAgICAjIGN1cnJlbmN5ICh0bGRyOyBwdXRzIGEg4oKsIG9yIHN1Y2ggaW4gZnJvbiBvZiBpdClcbiAgICBjdXJyZW5jeTogKHZhbHVlKSA9PlxuICAgICAgaWYgbm90IHZhbHVlPyB0aGVuIHRocm93IG5ldyBFcnJvciBcIkFza2VkIHRvIHJlbmRlciBjdXJyZW5jeSBvZiB1bmRlZmluZWQgdmFyaWFibGVcIlxuICAgICAgIyBUT0RPOiBGdWdseSBoYWNrIGJlY2F1c2UgSGFuZGxlYmFycyBldmFsdWF0ZSBhIGZ1bmN0aW9uIHdoZW4gcGFzc2VkIHRvXG4gICAgICAjIGEgaGVscGVyIGFzIHRoZSB2YWx1ZVxuICAgICAgaWYgXCJmdW5jdGlvblwiIGlzIHR5cGVvZiB2YWx1ZSB0aGVuIHZhbHVlID0gdmFsdWUoKVxuXG4gICAgICBzeW1ib2wgPSBAY3VycmVuY3lTeW1ib2xcbsKgIMKgIMKgIHBhcnNlZCA9IHBhcnNlSW50KHZhbHVlKVxuwqAgwqAgwqAgaWYgaXNOYU4ocGFyc2VkKVxuwqAgwqAgwqAgwqAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IHBhcnNlIHZhbHVlICdcIiArIHZhbHVlICsgXCInIHRvIGludGVnZXJcIilcbsKgIMKgIMKgIGVsc2VcbsKgIMKgIMKgIMKgIHJldHVybiBzeW1ib2wgKyAnICcgKyBwYXJzZWQudG9GaXhlZCgyKVxuXG4gICAgIyBDYWxjdWxhdGVzIHRoZSBpdGVtIHN1YnRvdGFsIChwcmljZSB0aW1lcyBxdWFudGl0eSBpbiBjYXNlIG9mIHByb2R1Y3RzLCBvciBob3VybHkgcmF0ZSB0aW1lc1xuICAgICMgaG91cnMgaW4gY2FzZSBvZiBzZXJ2aWNlcywgYW5kIHRoZW4gYSBwb3NzaWJsZSBkaXNjb3VudCBhcHBsaWVkKS5cbiAgICBwcm9kdWN0U3VidG90YWw6IChpdGVtKT0+XG4gICAgICAjIENhbGN1bGF0ZSB0aGUgc3VidG90YWwgb2YgdGhpcyBpdGVtXG4gICAgICBzdWJ0b3RhbCA9IGl0ZW0ucHJpY2UgKiBpdGVtLnF1YW50aXR5XG4gICAgICAjIEFwcGx5IGRpc2NvdW50IG92ZXIgc3VidG90YWwgaWYgaXQgZXhpc3RzXG4gICAgICBpZiBpdGVtLmRpc2NvdW50PyB0aGVuIHN1YnRvdGFsID0gc3VidG90YWwgKiAoMS1pdGVtLmRpc2NvdW50KVxuICAgICAgc3VidG90YWxcblxuICAgIHNlcnZpY2VTdWJ0b3RhbDogKGl0ZW0pPT5cbiAgICAgICMgQ2FsY3VsYXRlIHRoZSBzdWJ0b3RhbCBvZiB0aGlzIGl0ZW1cbiAgICAgIHN1YnRvdGFsID0gaXRlbS5ob3VycyAqIEBob3VybHlSYXRlXG4gICAgICAjIEFwcGx5IGRpc2NvdW50IG92ZXIgc3VidG90YWwgaWYgaXQgZXhpc3RzXG4gICAgICBpZiBpdGVtLmRpc2NvdW50PyB0aGVuIHN1YnRvdGFsID0gc3VidG90YWwgKiAoMS1pdGVtLmRpc2NvdW50KVxuICAgICAgc3VidG90YWxcblxuICAgICMgVmFsaWRhdGUgdGhlIG5ldyBhdHRyaWJ1dGVzIG9mIHRoZSBtb2RlbCBiZWZvcmUgYWNjZXB0aW5nIHRoZW1cbiAgICB2YWxpZGF0ZTogKGRhdGEpPT5cbiAgICAgIHVubGVzcyBfLmtleXMoZGF0YSkubGVuZ3RoID4gMFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJQcm92aWRlZCBtb2RlbCBoYXMgbm8gYXR0cmlidXRlcy4gXCIrXG4gICAgICAgICAgXCJDaGVjayB0aGUgYXJndW1lbnRzIG9mIHRoaXMgbW9kZWwncyBpbml0aWFsaXphdGlvbiBjYWxsLlwiXG5cbiAgICAgICMgUGVyZm9ybSBhIHZhbGlkYXRpb24gb2YgdGhlIHByb3Bvc2VkIGRhdGEgYWdhaW4gdGhlIEpTT04gU2NoZW1hIChkcmFmdFxuICAgICAgIyAwNCkgb2YgdGhlIGludm9pY2UuIFRoaXMgbWFrZXMgc3VyZSBvZiBtb3N0IHJlcXVpcmVtZW50cyBvZiB0aGUgZGF0YS5cbiAgICAgIGlmIG5vdCB0djQudmFsaWRhdGUgZGF0YSwgc2NoZW1hXG4gICAgICAgIHRocm93IHR2NC5lcnJvclxuXG4gICAgICB1bmxlc3MgZGF0YS5tZXRhPyB0aGVuIHRocm93IG5ldyBFcnJvciBcIk5vIGludm9pY2UgbWV0YS1kYXRhIHByb3ZpZGVkXCJcblxuICAgICAgaWQgPSBkYXRhLm1ldGEuaWRcbiAgICAgIHVubGVzcyBpZD8gdGhlbiB0aHJvdyBuZXcgRXJyb3IgXCJObyBpbnZvaWNlIElEIHByb3ZpZGVkXCJcbiAgICAgIGlmIGlkPyB0aGVuIEBpc05hdHVyYWxJbnQoaWQsIFwiSW52b2ljZSBJRFwiKVxuXG4gICAgICBwZXJpb2QgPSBkYXRhLm1ldGEucGVyaW9kXG4gICAgICBpZiBwZXJpb2Q/IHRoZW4gQGlzTmF0dXJhbEludChwZXJpb2QsIFwiSW52b2ljZSBwZXJpb2RcIilcblxuICAgICAgZGF0ZSA9IG5ldyBEYXRlIGRhdGEubWV0YS5kYXRlXG4gICAgICB1bmxlc3MgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRlKSBpcyBcIltvYmplY3QgRGF0ZV1cIikgYW5kIG5vdCBpc05hTihkYXRlLmdldFRpbWUoKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiSW52b2ljZSBkYXRlIGlzIG5vdCBhIHZhbGlkL3BhcnNhYmxlIHZhbHVlXCJcblxuICAgICAgdW5sZXNzIGRhdGEuY2xpZW50P1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJObyBkYXRhIHByb3ZpZGVkIGFib3V0IHRoZSBjbGllbnQvdGFyZ2V0IG9mIHRoZSBpbnZvaWNlXCJcblxuICAgICAgdW5sZXNzIGRhdGEuY2xpZW50Lm9yZ2FuaXphdGlvbiBvciBkYXRhLmNsaWVudC5jb250YWN0UGVyc29uXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIkF0IGxlYXN0IHRoZSBvcmdhbml6YXRpb24gbmFtZSBvciBjb250YWN0IHBlcnNvbiBuYW1lIG11c3QgYmUgcHJvdmlkZWRcIlxuICAgICAgICBcbiAgICAgIHBvc3RhbENvZGUgPSBkYXRhLmNsaWVudC5wb3N0YWxjb2RlXG4gICAgICAjIFBvc3RhbCBjb2RlIGlzIG9wdGlvbmFsLCBmb3IgY2xpZW50cyB3aGVyZSBpdCBpcyBzdGlsbCB1bmtub3duLCBidXQgd2hlblxuICAgICAgIyBkZWZpbmVkLCBEdXRjaCBwb3N0YWwgY29kZXMgYXJlIG9ubHkgdmFsaWQgd2hlbiA2IGNoYXJhY3RlcnMgbG9uZy5cbiAgICAgIGlmIHBvc3RhbENvZGU/Lmxlbmd0aD8gYW5kIG5vdCBAaXNJbnRlcm5hdGlvbmFsKGRhdGEuY2xpZW50LmNvdW50cnkpXG4gICAgICAgIHBvc3RhbENvZGUgPSBzLmNsZWFuKHBvc3RhbENvZGUpXG4gICAgICAgIGlmIHBvc3RhbENvZGUubGVuZ3RoIDwgNlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlBvc3RhbCBjb2RlIG11c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzIGxvbmdcIlxuICAgICAgICBlbHNlIGlmIHBvc3RhbENvZGUubGVuZ3RoID4gN1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlBvc3RhbCBjb2RlIG1heSBub3QgYmUgbG9uZ2VyIHRoYW4gNyBjaGFyYWN0ZXJzXCJcbiAgICAgICAgZWxzZSBpZiBub3QgcG9zdGFsQ29kZS5tYXRjaCgvXFxkezR9XFxzP1tBLXpdezJ9LylcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgJ1Bvc3RhbCBjb2RlIG11c3QgYmUgb2YgZm9ybWF0IC9cXFxcZHs0fVxcXFxzP1tBLXpdezJ9LywgZS5nLiAxMjM0QUIgb3IgMTIzNCBhYidcblxuICAgICAgaWYgKG5vdCBAc2VydmljZXM/IGFuZCBub3QgQHByb2R1Y3RzKSBvciBAc2VydmljZXM/Lmxlbmd0aCBpcyAwIGFuZCBAcHJvZHVjdHMubGVuZ3RoIGlzIDBcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiRG9jdW1lbnQgbXVzdCBjb250YWluIGF0IGxlYXN0IHNvbWUgcHJvZHVjdHMgb3Igc2VydmljZXMuIEZvdW5kIG5vbmUgaW4gZWl0aGVyIGNhdGVnb3J5IGluc3RlYWQuIERvY3VtZW50cyB3aXRoIGFuIGVtcHR5IGJvZHkgYXJlIG5vdCB2YWxpZC5cIlxuXG4gICAgICBpZiBAc2VydmljZXM/Lmxlbmd0aCA+IDAgYW5kIG5vdCBAaG91cmx5UmF0ZT9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiTm8gaG91cmx5IHNlcnZpY2UgcHJpY2UgcmF0ZSBwcm92aWRlZC4gTXVzdCBiZSBwcm92aWRlZCBiZWNhdXNlIGl0ZW1zXG4gICAgICAgIGNvbnRhaW4gc2VydmljZXMuXCJcblxuICAgICAgaWYgQHNlcnZpY2VzPyB0aGVuIGZvciBpdGVtIGluIEBzZXJ2aWNlc1xuICAgICAgICBpZiBpdGVtLnN1YnRvdGFsIGlzIDAgdGhlbiB0aHJvdyBuZXcgRXJyb3IgXCJTdWJ0b3RhbCBvZiAwIGZvciBzZXJ2aWNlIGl0ZW0gJyN7aXRlbS5kZXNjcmlwdGlvbn0nIHdpdGggI3tpdGVtLmhvdXJzfSBob3Vyc1wiXG5cbiAgICAgIGlmIEBwcm9kdWN0cz8gdGhlbiBmb3IgaXRlbSBpbiBAcHJvZHVjdHNcbiAgICAgICAgaWYgaXRlbS5zdWJ0b3RhbCBpcyAwIHRoZW4gdGhyb3cgbmV3IEVycm9yIFwiU3VidG90YWwgb2YgMCBmb3IgcHJvZHVjdCBpdGVtICcje2l0ZW0uZGVzY3JpcHRpb259JyB3aXRoIGEgcXVhbnRpdHkgb2YgI3tpdGVtLnF1YW50aXR5fVwiXG5cbiAgICAgIGlmIEBzdWJ0b3RhbCgpIDwgMSB0aGVuIHRocm93IG5ldyBFcnJvciBcIlN1YnRvdGFsIG9mICN7QHN1YnRvdGFsKCl9IHRvbyBsb3cgZm9yIHJlYWwgd29ybGQgdXNhZ2UgcGF0dGVybnNcIlxuXG4gIHJldHVybiBUZW1wbGF0ZU1vZGVsIl19
