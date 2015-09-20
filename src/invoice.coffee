dependencies = [
  'underscore'
  'underscore.string',
  'moment',
  'moment_nl'
]
define dependencies, (_, s, moment)->

  class Invoice

    constructor: (data)-> 
      _.extend @, data

    documentMeta: (data)=>
      'id':             @fullID()
      'documentTitle':  @documentName()
      'filename':       @filename()

    # Used for the html head title element
    documentName: => 
      s.capitalize @fiscalType() + ' ' + @fullID()

    filename: =>
      client = @clientDisplay()
      client = client.replace /\s/g, '-' # Spaces to dashes using regex
      filename = "#{@fullID()}_#{client}"
      extension = ".pdf"

      if @projectName?
        project = @projectName.replace /\s/g, '-' # Spaces to dashes using regex
        filename = filename + "_#{project}"
      
      if @meta.period?
        filename = filename + "_P#{@meta.period}"

      if @isQuotation()
        filename = filename + "_O"

      filename + extension

    companyFull: =>
      @origin.company+' '+@origin.lawform

    fiscalType: =>
      # Supported types
      if @meta.type is 'quotation' or @meta.type is 'invoice'
        @meta.type
      else if not @meta.type? # Default type if undefined
        'invoice'
      else
        throw new Error 'Unsupported template fiscal type. The model
        "meta.type" should be either invoice, quotation or undefined (defaults
        to invoice).'

    isQuotation: =>
      @fiscalType() is 'quotation'

    language: (country)->
      if not country? then country = @client.country

      return 'nl' unless country? # If no country is specified, we assume Dutch

      dutch = s.contains(country.toLowerCase(), "netherlands") or
              s.contains(country.toLowerCase(), "nederland") or
              s.contains(country.toLowerCase(), "holland") or
              country.trim().toLowerCase() is "nl"
      if dutch then return 'nl' else 'en'

    isInternational: (country)=>
      if not country? then country = @client.country

      @language(country) isnt 'nl'

    isNaturalInt: (int, attr)->
      if isNaN parseInt(int, 10)
        throw new Error "#{attr} could not be parsed"
      if parseInt(int, 10) <= 0
        throw new Error "#{attr} must be a positive integer"
      if (parseInt(int, 10) isnt parseFloat(int, 10))
        throw new Error "#{attr} must be an integer (not floating point)"



    email: (email) ->
      return "mailto:#{email}"
    website: (website) ->
      return "https://www.#{website}"
    fullID: =>
      meta = @meta
      date = new Date(meta.date)
      date.getUTCFullYear()+'.'+s.pad(meta.id.toString(), 4, '0')

    invoiceDate: =>
      if @isInternational(@client.country)
        moment.locale 'en'
      else
        moment.locale 'nl'

      moment(@meta.date).format('LL')

    expiryDate: (date, period)=>
      if not date?    then date     = @meta.date
      if not period?  then period   = @validityPeriod

      if @isInternational()
        moment.locale 'en'
      else
        moment.locale 'nl'

      moment(@meta.date).add(period, 'days').format('LL')
      
    clientDisplay: ->
      @client.contactPerson or @client.organization

    # Useful for i18n ... 'this service'/'these services'
    itemsPlural: ->
      @invoiceItems.length > 1

    # Useful for i18n ... 'this service'/'these services'
    hasDiscounts: ->
      _.some @invoiceItems, (item)-> item.discount? > 0

    tableColumns: ->
      if @hasDiscounts() then 5 else 4

    tableFooterColspan: ->
      if @hasDiscounts() then 4 else 3

    discountDisplay: ->
      (@discount * 100)

    # Subtotal of all the invoice items without taxes, but including their individual discounts
    invoiceSubtotal: =>
      _.reduce @invoiceItems, ( (sum, item)=> sum + @itemSubtotal item ), 0

    invoiceTotal: => @invoiceSubtotal() + @VAT()
    
    # VAT over the provided value or the invoice subtotal
    VAT: =>
      @invoiceSubtotal() * @vatPercentage

    VATrate: => (@vatPercentage * 100)

    # Renders the value (and evaluates it first if it's a function) as a
    # currency (tldr; puts a € or such in fron of it)
    currency: (value) =>

      # TODO: Fugly hack because Handlebars evaluate a function when passed to
      # a helper as the value
      if "function" is typeof value then value = value()

      symbol = @currencySymbol
      parsed = parseInt(value)
      if isNaN(parsed)
        throw new Error("Could not parse value '" + value + "'")
      else
        return symbol + ' ' + value.toFixed(2)

    # Calculates the item subtotal (price times quantity, and then a possible discount applied)
    itemSubtotal: (item)->
      # Calculate the subtotal of this item
      subtotal = item.price * item.quantity
      # Apply discount over subtotal if it exists
      if item.discount? > 0 then subtotal = subtotal * (1-item.discount)
      subtotal

    decapitalize: (string)-> string.toLowerCase()

    # Validate the new attributes of the model before accepting them
    validate: (data)=>
      unless _.keys(data).length > 0
        throw new Error "Provided model has no attributes. "+
          "Check the arguments of this model's initialization call."

      unless data.meta? then throw new Error "No invoice meta-data provided"

      id = data.meta.id
      unless id? then throw new Error "No invoice ID provided"
      if id? then @isNaturalInt(id, "Invoice ID")

      period = data.meta.period
      if period? then @isNaturalInt(period, "Invoice period")

      date = new Date data.meta.date
      unless (Object.prototype.toString.call(date) is "[object Date]") and not isNaN(date.getTime())
        throw new Error "Invoice date is not a valid/parsable value"

      unless data.client?
        throw new Error "No data provided about the client/target of the invoice"

      unless data.client.organization or data.client.contactPerson
        throw new Error "At least the organization name or contact person name must be provided"
        
      postalCode = data.client.postalcode
      # Postal code is optional, for clients where it is still unknown, but when
      # defined, Dutch postal codes are only valid when 6 characters long.
      if postalCode?.length? and not @isInternational(data.client.country)
        postalCode = s.clean(postalCode)
        if postalCode.length < 6
          throw new Error "Postal code must be at least 6 characters long"
        else if postalCode.length > 7
          throw new Error "Postal code may not be longer than 7 characters"
        else if not postalCode.match(/\d{4}\s?[A-z]{2}/)
          throw new Error 'Postal code must be of format /\\d{4}\\s?[A-z]{2}/, e.g. 1234AB or 1234 ab'

      unless data.invoiceItems?.length? and data.invoiceItems.length > 0
        throw new Error "No items to show in invoice provided. Must be an
        array with at least one entry"

      allItemsValid = _.every data.invoiceItems, (item, idx)->
        unless item.description?.length? > 0
          throw new Error "Description not provided or of no length"
        price = parseFloat(item.price, 10)
        if isNaN price
          throw new Error "Price is not a valid floating point number"
        unless price > 0
          throw new Error "Price must be greater than zero"
        if item.discount? and (item.discount < 0 or item.discount > 1)
          throw new Error "Discount specified out of range (must be between 0 and 1)"
        if item.quantity? and item.quantity < 1
          throw new Error "When specified, quantity must be greater than one"


  # Hook ourself into the global namespace so we can be interfaced with
  this.Invoice = Invoice