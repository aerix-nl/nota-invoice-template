(function() {
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
          return 4;
        } else {
          return 3;
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

}).call(this);
