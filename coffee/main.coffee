'use strict'

# Workaround to suppress a flood of PhantomJS warnings in certain versions
Function.prototype.bind ||= ( _this ) -> => @apply(_this, arguments)

root = './../../'
bower = 'bower_components/'
requirejs.config {
  enfordeDefine: true
  paths:
    # Vendor goodies this template depends on
    'jquery':                 root+bower+'jquery/dist/jquery'
    'underscore':             root+bower+'underscore/underscore'
    'underscore.string':      root+bower+'underscore.string/lib/underscore.string'
    'handlebars':             root+bower+'handlebars/handlebars.amd'
    'material-design-lite':   root+bower+'material-design-lite/material.min'
    'moment':                 root+bower+'momentjs/moment'
    'moment_nl':              root+bower+'momentjs/locale/nl'
    'i18next':                root+bower+'i18next/i18next.amd.withJQuery'
    'tv4':                    root+bower+'tv4/tv4'

    # RequireJS json! deps
    'json':                   root+bower+'requirejs-plugins/src/json'
    'text':                   root+bower+'requirejs-text/text'
    'requirejs':              root+bower+'requirejs/require'

    # Template stuff
    'template-controller':    './template-controller'
    'template-model':         './template-model'
    'schema':                 root+'json/schema.json'
    'translation_nl':         root+'json/locales/nl.json'
    'translation_en':         root+'json/locales/en.json'
    'preview-data':           root+'json/preview.json'

    # Nota client
    'nota':                   '/nota/lib/client'
}

dependencies = [
  'template-controller'
]

# If we're hosted in PhantomJS we'll need Nota as well
if window._phantom then dependencies.push 'nota'

# This function will be executed when all dependencies have successfully
# loaded (they are passed in as arguments).
onDependenciesLoaded = ( TemplateController, Nota ) ->
  # We can disable module/script load error catching now. From here on we use
  # our own (Nota.logError) which works with the limitations of PhantomJS and
  # gets the error objects into the consoles (requirejs.onError catches ALL
  # errors and prevents them from reaching the console, which is really
  # annoying when you can use that info in Node.js backend for logging).
  # Basics of good design states that errors should be always be loud and
  # visible, to lower the discovery theshold. RequireJS's error handling goes
  # against that practice in this case.
  requirejs.onError = (err)-> throw err

  # Signal begin of template initialization
  Nota?.trigger 'template:init'

  try
    templateController = new TemplateController(onError, Nota)
  catch error
    onError(error)
    if Nota?
      Nota?.logError error, "An error occured during template initialization."
    else
      throw error

  # Signal that we're done with setup and that we're ready to receive data
  Nota?.trigger 'template:loaded'

  # For easy use in the global namespace
  window.template = templateController

  # For use in modules requiring this one
  return templateController





# Some vanillaJS error handling in case we can't load the modules (and can't
# use tools like jQuery either).
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
  if contextMessage?
    li.innerHTML = contextMessage + ' ' + error
  else if error.requireType?
    type = document.createElement('strong')
    type.innerHTML = "Module require error (#{error.requireType})."
    errorText = document.createTextNode(error.message)
    li.appendChild type
    li.appendChild errorText
  else
    li.innerHTML = error
  errorList.appendChild li

  if error.requireModules? is 'nota'
    manual = document.querySelectorAll("div.manual-container")[0]
    manual.style.display = 'block'

  # If we crashed because we couldn't require some needed modules, we can't
  # assume Nota's .logError is available. So continue we'll to throw the error
  # so it shows up in consoles. RequireJS silences them unless we do so
  # explicitly.
  if error.requireModules? then throw error





# For catching script/module load errors
requirejs.onError = onError

# Time to load the dependencies, and if all goes well, start up the invoice
define(dependencies, onDependenciesLoaded, onError)
