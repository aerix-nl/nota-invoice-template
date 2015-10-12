'use strict'

# Workaround to suppress PhantomJS warnings in certain versions
Function.prototype.bind ||= ( _this ) -> => @apply(_this, arguments)

requirejs.config {
  baseUrl: 'bower_components/'
  paths:
    # Vendor goodies this template depends on
    'jquery':                 'jquery/dist/jquery'
    'underscore':             'underscore/underscore'
    'underscore.string':      'underscore.string/lib/underscore.string'
    'handlebars':             'handlebars/handlebars.amd'
    'moment':                 'momentjs/moment'
    'moment_nl':              'momentjs/locale/nl'
    'i18next':                'i18next/i18next.amd.withJQuery'
    'tv4':                    'tv4/tv4'

    # RequireJS json! deps
    'json':                   'requirejs-plugins/src/json'
    'text':                   'requirejs-text/text'
    'requirejs':              'requirejs/require'

    # Template stuff
    'invoice':                '/dist/invoice'
    'schema':                 '/json/schema.json'
    'translation_nl':         '/json/locales/nl.json'
    'translation_en':         '/json/locales/en.json'
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
  'json!translation_nl',
  'json!translation_en',
  'moment',
  'moment_nl'
]

# This function will be executed when all dependencies have successfully
# loaded (they are passed in as arguments).
onDependenciesLoaded = (Nota, Invoice, $, Handlebars, s, i18n, nlMap, enMap, moment) ->

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
        to render is not a valid model for this template. #{e.message}"
      
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

# Some vanillaJS error handling
onDependencyError = (error)->
  # Ensure we get the template from the body on the first error, and save it
  # in the global namepspace for all later erros
  if not window.errorTemplate?
    window.errorTemplate = document.getElementById('template-error').innerHTML
    document.body.innerHTML = window.errorTemplate

  # Make an instance of the error list item
  if not window.errorListItem?
    window.errorListItem = document.querySelectorAll("div.error-container ul li.error")[0]
    document.querySelectorAll("div.error-container ul")[0].innerHTML = ""

  # Fill the list with error list items
  errorList = document.querySelectorAll("div.error-container ul")[0]
  li = errorListItem.cloneNode()
  li.innerHTML = error
  errorList.appendChild li

  if error.requireModules[0] is "/nota/lib/client.js"
    manual = document.querySelectorAll("div.manual-container")[0]
    manual.style.display = 'block'

  # Continue the error: it should still be visible in the console
  throw error

# In case of script loading errors
requirejs.onError = onDependencyError

# Time to load the dependencies, and if all goes well, start up the invoice
define dependencies, onDependenciesLoaded, onDependencyError
