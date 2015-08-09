'use strict'

# Workaround to suppress PhantomJS warnings in certain versions
Function.prototype.bind ||= ( _this ) -> => @apply(_this, arguments)

requirejs.config {
  baseUrl: '../bower_components/'
  paths:
    # Vendor goodies this template depends on
    'jquery':             'jquery/dist/jquery'
    'backbone':           'backbone/backbone'
    'underscore':         'underscore/underscore'
    'underscore.string':  'underscore.string/dist/underscore.string.min'
    'jed':                'jed/jed'
    'rivets':             'rivets/dist/rivets'
    'sightglass':         'sightglass/index'
    'moment':             'momentjs/moment'
    'moment_nl':          'momentjs/locale/nl'
    'i18next':            'i18next/i18next.amd.withJQuery'

    # RequireJS json! deps
    'json':               'requirejs-plugins/src/json'
    'text':               'requirejs-text/text'
    'requirejs':          'requirejs/require'

    # Template stuff
    'invoice':            '/dist/invoice'
    'translation_nl':     '/json/locales/nl.json'
    'translation_en':     '/json/locales/en.json'

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
  'rivets',
  'underscore.string',
  'i18next',
  'json!translation_nl',
  'json!translation_en',
  'moment',
  'moment_nl'
]

# We receive the dependencies as args in the same order as they are in the array
define dependencies, (Nota, Invoice, rivets, s, i18n, nlMap, enMap, moment) ->
  # Signal begin of setup
  Nota.trigger 'template:init'

  invoice = new Invoice()
   
  i18n.init {
    resStore:
      en: { translation: enMap }
      nl: { translation: nlMap }

    missingKeyHandler: (lng, ns, key, defaultValue, lngs) ->
      throw new Error arguments
  }

  rivets.formatters.i18n = (key, count, readout)->
    if count?
      if readout? then count = count[readout]
      i18n.t key, count: count
    else i18n.t key

  _.extend rivets.formatters, invoice

  render = (data)->
    # Signal that we've started rendering
    Nota.trigger 'template:render:start'
    try
      invoice.set(data, validate: true)
    catch e
      throw new Error "Provided data is not a valid model: #{e.message}"
    i18n.setLng invoice.language()
    rivets.bind document.body, data
    rivets.bind document.head, data
    # Signal that we're done with rendering and that capture can begin
    Nota.trigger 'template:render:done'

  # Provide Nota client with a function to aquire meta data from. This is used
  # for e.g. providing the proposed filename of the PDF. See the Nota client
  # API for documentation.
  Nota.setDocumentMeta -> invoice.documentMeta.apply(invoice, arguments)

  # We'll have to our data ourselves from the server
  Nota.getData render

  # Also listen for data being set
  Nota.on 'data:injected', render

  # Signal that we're done with setup and that we're ready to receive data
  Nota.trigger 'template:loaded'

  window.render = render
  return invoice
