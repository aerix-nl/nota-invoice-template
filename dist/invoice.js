(function() {
  var dependencies,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  dependencies = ['underscore', 'underscore.string', 'moment', 'moment_nl'];

  define(dependencies, function(_, s, moment) {
    var Invoice;
    Invoice = (function() {
      function Invoice(data) {
        this.validate = bind(this.validate, this);
        this.currency = bind(this.currency, this);
        this.VATrate = bind(this.VATrate, this);
        this.VAT = bind(this.VAT, this);
        this.invoiceTotal = bind(this.invoiceTotal, this);
        this.invoiceSubtotal = bind(this.invoiceSubtotal, this);
        this.expiryDate = bind(this.expiryDate, this);
        this.invoiceDate = bind(this.invoiceDate, this);
        this.fullID = bind(this.fullID, this);
        this.isInternational = bind(this.isInternational, this);
        this.isQuotation = bind(this.isQuotation, this);
        this.fiscalType = bind(this.fiscalType, this);
        this.companyFull = bind(this.companyFull, this);
        this.filename = bind(this.filename, this);
        this.documentName = bind(this.documentName, this);
        this.documentMeta = bind(this.documentMeta, this);
        _.extend(this, data);
      }

      Invoice.prototype.documentMeta = function(data) {
        return {
          'id': this.fullID(),
          'documentTitle': this.documentName(),
          'filename': this.filename()
        };
      };

      Invoice.prototype.documentName = function() {
        return s.capitalize(this.fiscalType() + ' ' + this.fullID());
      };

      Invoice.prototype.filename = function() {
        var client, extension, filename, project;
        client = this.clientDisplay();
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

      Invoice.prototype.companyFull = function() {
        return this.origin.company + ' ' + this.origin.lawform;
      };

      Invoice.prototype.fiscalType = function() {
        if (this.meta.type === 'quotation' || this.meta.type === 'invoice') {
          return this.meta.type;
        } else if (this.meta.type == null) {
          return 'invoice';
        } else {
          throw new Error('Unsupported template fiscal type. The model "meta.type" should be either invoice, quotation or undefined (defaults to invoice).');
        }
      };

      Invoice.prototype.isQuotation = function() {
        return this.fiscalType() === 'quotation';
      };

      Invoice.prototype.language = function(country) {
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

      Invoice.prototype.isInternational = function(country) {
        if (country == null) {
          country = this.client.country;
        }
        return this.language(country) !== 'nl';
      };

      Invoice.prototype.isNaturalInt = function(int, attr) {
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

      Invoice.prototype.email = function(email) {
        return "mailto:" + email;
      };

      Invoice.prototype.website = function(website) {
        return "https://www." + website;
      };

      Invoice.prototype.fullID = function() {
        var date, meta;
        meta = this.meta;
        date = new Date(meta.date);
        return date.getUTCFullYear() + '.' + s.pad(meta.id.toString(), 4, '0');
      };

      Invoice.prototype.invoiceDate = function() {
        if (this.isInternational(this.client.country)) {
          moment.locale('en');
        } else {
          moment.locale('nl');
        }
        return moment(this.meta.date).format('LL');
      };

      Invoice.prototype.expiryDate = function(date, period) {
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

      Invoice.prototype.clientDisplay = function() {
        return this.client.contactPerson || this.client.organization;
      };

      Invoice.prototype.itemsPlural = function() {
        return this.invoiceItems.length > 1;
      };

      Invoice.prototype.hasDiscounts = function() {
        return _.some(this.invoiceItems, function(item) {
          return (item.discount != null) > 0;
        });
      };

      Invoice.prototype.tableColumns = function() {
        if (this.hasDiscounts()) {
          return 5;
        } else {
          return 4;
        }
      };

      Invoice.prototype.tableFooterColspan = function() {
        if (this.hasDiscounts()) {
          return 4;
        } else {
          return 3;
        }
      };

      Invoice.prototype.discountDisplay = function() {
        return this.discount * 100;
      };

      Invoice.prototype.invoiceSubtotal = function() {
        return _.reduce(this.invoiceItems, ((function(_this) {
          return function(sum, item) {
            return sum + _this.itemSubtotal(item);
          };
        })(this)), 0);
      };

      Invoice.prototype.invoiceTotal = function() {
        return this.invoiceSubtotal() + this.VAT();
      };

      Invoice.prototype.VAT = function() {
        return this.invoiceSubtotal() * this.vatPercentage;
      };

      Invoice.prototype.VATrate = function() {
        return this.vatPercentage * 100;
      };

      Invoice.prototype.currency = function(value) {
        var parsed, symbol;
        if ("function" === typeof value) {
          value = value();
        }
        symbol = this.currencySymbol;
        parsed = parseInt(value);
        if (isNaN(parsed)) {
          throw new Error("Could not parse value '" + value + "'");
        } else {
          return symbol + ' ' + value.toFixed(2);
        }
      };

      Invoice.prototype.itemSubtotal = function(item) {
        var subtotal;
        subtotal = item.price * item.quantity;
        if ((item.discount != null) > 0) {
          subtotal = subtotal * (1 - item.discount);
        }
        return subtotal;
      };

      Invoice.prototype.decapitalize = function(string) {
        return string.toLowerCase();
      };

      Invoice.prototype.validate = function(data) {
        var allItemsValid, date, id, period, postalCode, ref;
        if (!(_.keys(data).length > 0)) {
          throw new Error("Provided model has no attributes. " + "Check the arguments of this model's initialization call.");
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
        if (!((((ref = data.invoiceItems) != null ? ref.length : void 0) != null) && data.invoiceItems.length > 0)) {
          throw new Error("No items to show in invoice provided. Must be an array with at least one entry");
        }
        return allItemsValid = _.every(data.invoiceItems, function(item, idx) {
          var price, ref1;
          if (!((((ref1 = item.description) != null ? ref1.length : void 0) != null) > 0)) {
            throw new Error("Description not provided or of no length");
          }
          price = parseFloat(item.price, 10);
          if (isNaN(price)) {
            throw new Error("Price is not a valid floating point number");
          }
          if (!(price > 0)) {
            throw new Error("Price must be greater than zero");
          }
          if ((item.discount != null) && (item.discount < 0 || item.discount > 1)) {
            throw new Error("Discount specified out of range (must be between 0 and 1)");
          }
          if ((item.quantity != null) && item.quantity < 1) {
            throw new Error("When specified, quantity must be greater than one");
          }
        });
      };

      return Invoice;

    })();
    return this.Invoice = Invoice;
  });

}).call(this);
