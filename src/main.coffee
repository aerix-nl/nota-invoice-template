'use strict'

# Workaround to suppress PhantomJS warnings in certain versions
Function.prototype.bind ||= ( _this ) -> => @apply(_this, arguments)

requirejs.config {
  baseUrl: '../bower_components/'
  paths:
    # Vendor goodies this template depends on
    'jquery':                'jquery/dist/jquery'
    'backbone':              'backbone/backbone'
    'underscore':            'underscore/underscore'
    'underscore.string':     'underscore.string/lib/underscore.string'
    'handlebars':            'handlebars/handlebars.amd'
    'sightglass':            'sightglass/index'
    'moment':                'momentjs/moment'
    'moment_nl':             'momentjs/locale/nl'
    'i18next':               'i18next/i18next.amd.withJQuery'

    # RequireJS json! deps
    'json':                  'requirejs-plugins/src/json'
    'text':                  'requirejs-text/text'
    'requirejs':             'requirejs/require'

    # Template stuff
    'invoice':               '/dist/invoice'
    'translation_nl_inv':    '/json/locales/nl-invoice.json'
    'translation_en_inv':    '/json/locales/en-invoice.json'
    'translation_nl_quot':   '/json/locales/nl-quotation.json'
    'translation_en_quot':   '/json/locales/en-quotation.json'

  shim:
    rivets:
      deps: ['sightglass']
}

# In the above config not all dependencies are declared because
# some of them which this template depends on (e.g. Backbone, _)
# have already been made available by Nota client earlier.
dependencies = [
  '/nota/lib/client.js',
  'invoice',
  'jquery',
  'handlebars',
  'underscore.string',
  'i18next',
  'json!translation_nl_inv',
  'json!translation_en_inv',
  'moment',
  'moment_nl'
]


# We receive the dependencies as args in the same order as they are in the array
define dependencies, (Nota, Invoice, $, Handlebars, s, i18n, nlMap, enMap, moment) ->

  initializeTemplate = ()->
     
    # Set up internationalisation with support for translations in English and Dutch
    i18n.init {
      resStore:
        en: { translation: enMap }
        nl: { translation: nlMap }

      # In case of missing translation
      missingKeyHandler: (lng, ns, key, defaultValue, lngs) ->
        throw new Error arguments
    }

    Handlebars.registerHelper 'i18n', (i18n_key, count, attr, caselevel)->

      # TODO: Fugly hack because Handlebars evaluate a function when passed to
      # a helper as the value
      if "function" is typeof i18n_key then i18n_key = i18n_key()

      if "number" is typeof count
        value = i18n.t(i18n_key, count: count)
      else if "number" is typeof count?[attr]
        value = i18n.t(i18n_key, count: count[attr])
      else
        value = i18n.t(i18n_key)

      switch caselevel
        when 'lowercase' then value.toLowerCase()
        when 'uppercase' then value.toUpperCase()
        when 'capitalize' then s.capitalize(value)
        else value

    # Get and compile template once to optimize for rendering iterations later
    template = Handlebars.compile $('script#template').html()

    render = (data)->
      # Signal that we've started rendering
      Nota.trigger 'template:render:start'

      # Invoice provides helpers, formatters and model validation
      invoice = new Invoice(data)

      try
        invoice.validate(data)
      catch e
        throw new Error "An error ocurred during rendering. The provided data
        to render is not a valid model for this template: #{e.message}"
      
      i18n.setLng invoice.language()

      Handlebars.registerHelper 'currency', invoice.currency
      Handlebars.registerHelper 'decapitalize', invoice.decapitalize

      # TODO: Fugly hack because Handlebars doesn't allow chaining functions
      for item in invoice.invoiceItems
        item.subtotal = invoice.itemSubtotal item
      
      # The acutal rendering call. Resulting HTML is placed into body DOM
      $('body').html template(invoice)

      # Provide Nota client with a function to aquire meta data from. This is used
      # for e.g. providing the proposed filename of the PDF. See the Nota client
      # API for documentation.
      Nota.setDocumentMeta -> invoice.documentMeta.apply(invoice, arguments)

      # Signal that we're done with rendering and that capture can begin
      Nota.trigger 'template:render:done'

    # We'll have to our data ourselves from the server
    Nota.getData render

    # Also listen for data being set
    Nota.on 'data:injected', render

    return render
  

  # -----------------------------------------------------------------------


  # Signal begin of setup
  Nota.trigger 'template:init'

  try
    # If initialization succeeds then it returns the render function which can
    # be used to directly render data
    render = initializeTemplate()

    # Signal that we're done with setup and that we're ready to receive data
    Nota.trigger 'template:loaded'

  catch e
    console.error "An error occured during template initialization:"
    throw e

  # Convenient to have in the global scope for debugging
  window.render = render

