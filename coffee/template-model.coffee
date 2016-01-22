dependencies = [
  'underscore'
  'underscore.string',
  'tv4',
  'json!schema',
  'moment',
  'moment_nl'
]
define dependencies, ()->
  # Unpack the loaded dependencies we receive as arguments
  [_, s, tv4, schema, moment] = arguments

  class TemplateModel

    constructor: (data)->
      _.extend @, data

      # TODO: Fugly hack, list of computed properties because Handlebars
      # doesn't allow chaining functions
      if @products? then for pr in @products
        pr.subtotal = @productSubtotal pr

      if @services? then for sr in @services
        sr.subtotal = @serviceSubtotal sr

    documentMeta: =>
      'filename': @filename()

    filename: =>
      client = @clientDisplay('company')
      client = client.replace /\s/g, '-' # Spaces to dashes using regex
      filename = "#{@fullID()}_#{client}"

      if @projectName?
        project = @projectName.replace /\s/g, '-' # Spaces to dashes using regex
        filename = filename + "_#{project}"
      
      if @meta.period?
        filename = filename + "_P#{@meta.period}"

      if @isQuotation()
        filename = filename + "_O"

      filename

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

    isQuotation: => @fiscalType() is 'quotation'
    isInvoice: => @fiscalType() is 'invoice'

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

    bookingDate: =>
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
      
    clientDisplay: (priority)->
      if priority is 'company'
        @client.organization or @client.contactPerson
      else
        @client.contactPerson or @client.organization

    # Useful for i18n ... 'this service'/'these services'
    itemsPlural: ->
      @invoiceItems.length > 1

    # Useful for i18n ... 'this service'/'these services'
    hasDiscounts: (category)->
      check = (item)-> item.discount? > 0
      products = _.some @products, check
      services = _.some @services, check
      switch category
        when 'products'
          products
        when 'services'
          services
        else
          products or services

    hasProductsDiscounts: -> @hasDiscounts('products')

    hasServicesDiscounts: -> @hasDiscounts('services')

    hasProducts: -> @products?.length > 0

    hasServices: -> @services?.length > 0

    productsTableFooterColspan: ->
      if @hasDiscounts('products') then 4 else 3

    servicesTableFooterColspan: ->
      if @hasDiscounts('services') then 2 else 1

    discountDisplay: ->
      (@discount * 100)

    # Subtotal of all or just one category of items (without taxes)
    subtotal: (category)=>
      products = _.reduce @products, ( (sum, item)=> sum + @productSubtotal item ), 0
      services = _.reduce @services, ( (sum, item)=> sum + @serviceSubtotal item ), 0
      switch category
        when 'products'
          products
        when 'services'
          services
        else
          products + services

    productsSubtotal: => @subtotal('products')

    servicesSubtotal: => @subtotal('services')

    hoursSubtotal: =>
      _.reduce @services, ( (sum, item)=> sum + item.hours ), 0
    
    VAT: (category)=> @subtotal(category) * @vatPercentage

    VATproducts: => @VAT('products')

    VATservices: => @VAT('services')

    VATrate: => (@vatPercentage * 100)

    total: (category)=>
      @subtotal(category) + @VAT(category)

    productsTotal: => @total('products')

    servicesTotal: => @total('services')

    # Renders the value (and evaluates it first if it's a function) as a
    # currency (tldr; puts a € or such in fron of it)
    currency: (value) =>
      if not value?
        throw new Error "Asked to render currency of undefined variable"

      # TODO: Fugly hack because Handlebars evaluate a function when passed to
      # a helper as the value
      if "function" is typeof value then value = value()

      symbol = @currencySymbol
      parsed = parseFloat(value)
      if isNaN(parsed)
        throw new Error("Could not parse value '" + value + "' to a number")
      else
        return symbol + ' ' + parsed.toFixed(2)

    # Calculates the item subtotal (price times quantity in case of products,
    # or hourly rate times hours in case of services, and then a possible
    # discount applied).
    productSubtotal: (item)->
      # Calculate the subtotal of this item
      subtotal = item.price * item.quantity
      # Apply discount over subtotal if it exists
      if item.discount? then subtotal = subtotal * (1-item.discount)
      subtotal

    serviceSubtotal: (item)=>
      # Calculate the subtotal of this item
      subtotal = item.hours * @hourlyRate
      # Apply discount over subtotal if it exists
      if item.discount? then subtotal = subtotal * (1-item.discount)
      subtotal

    # Validate the new attributes of the model before accepting them
    validate: (data)=>
      unless _.keys(data).length > 0
        throw new Error "Provided model has no attributes. "+
          "Check the arguments of this model's initialization call."

      # Perform a validation of the proposed data again the JSON Schema (draft
      # 04) of the invoice. This makes sure of most requirements of the data.
      if not tv4.validate data, schema
        throw tv4.error

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
        throw new Error "No data provided about the client/target of the
        invoice"

      unless data.client.organization or data.client.contactPerson
        throw new Error "At least the organization name or contact person name
        must be provided"
        
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
          throw new Error 'Postal code must be of format /\\d{4}\\s?[A-z]{2}/,
          e.g. 1234AB or 1234 ab'

      if (not @services? and not @products) or @services?.length is 0 and @products.length is 0
        throw new Error "Document must contain at least some products or
        services. Found none in either category instead. Documents with an
        empty body are not valid."

      if @services?.length > 0 and not @hourlyRate?
        throw new Error "No hourly service price rate provided. Must be
        provided because items contain services."

      if @services? then for item in @services
        if item.subtotal is 0
          throw new Error "Subtotal of 0 for service item
          '#{item.description}' with #{item.hours} hours"

      if @products? then for item in @products
        if item.subtotal is 0
          throw new Error "Subtotal of 0 for product item
          '#{item.description}' with a quantity of #{item.quantity}"

      if @subtotal() < 1
        throw new Error "Subtotal of #{@subtotal()} too low for real world
        usage patterns"

  return TemplateModel