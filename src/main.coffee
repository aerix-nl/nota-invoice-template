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
    'template-controller':    '/dist/template-controller'
    'template-model':         '/dist/template-model'
    'schema':                 '/json/schema.json'
    'translation_nl':         '/json/locales/nl.json'
    'translation_en':         '/json/locales/en.json'

    # Vendor stuff (that is not available on Bower.js booo! :/ )
    'css-regions':            '/dist/vendor/css-regions-polyfill'
}

# In the above config not all dependencies are declared because
# some of them which this template depends on (e.g. Backbone, _)
# have already been made available by Nota client earlier.
dependencies = [
  '/nota/lib/client.js'
  'template-controller'
]

# This function will be executed when all dependencies have successfully
# loaded (they are passed in as arguments).
onDependenciesLoaded = ( ) ->
  # Unpack all the dependencie we receive in the arguments
  [Nota, TemplateController] = arguments
    
  # We can disable module/script load error catching now. From here on we use our own
  # (Nota.logError) which works with the limitations of PhantomJS and gets the error objects into
  # the consoles (requirejs.onError catches ALL errors and prevents them from reaching the console,
  # which is really annoying when you can use that info in Node.js backend for logging).
  requirejs.onError = (err)-> throw err

  # Signal begin of setup
  Nota.trigger 'template:init'

  try
    template = new TemplateController(onError)
  catch error
    onError(error)
    Nota.logError error, "An error occured during template initialization."

  # Also listen for data being set
  Nota.on 'data:injected', template.render

  # Signal that we're done with setup and that we're ready to receive data
  Nota.trigger 'template:loaded'

  # If running outside PhantomJS we'll have to our data ourselves from the server
  Nota.getData template.render

  # For easy use in the global namespace
  window.template = template
  # For use in modules requiring this one
  return template

# Some vanillaJS error handling in case we can't load the modules (including jQuery)
onError = (error, contextMessage)->
  # Ensure we get the template from the body on the first error, and save it
  # in the root for all later erros
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
  li.innerHTML = contextMessage + ' ' + error
  errorList.appendChild li
 
  if error.requireModules?[0] is "/nota/lib/client.js"
    manual = document.querySelectorAll("div.manual-container")[0]
    manual.style.display = 'block'

  # If Nota's .logError isn't available, continue to throw the error so it shows up in consoles
  if error.requireModules? then throw error

# For catching script/module load errors
requirejs.onError = onError

# Time to load the dependencies, and if all goes well, start up the invoice
define dependencies, onDependenciesLoaded, onError
