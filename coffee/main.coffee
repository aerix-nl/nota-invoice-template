'use strict'

# Workaround to suppress a flood of PhantomJS warnings in certain versions
Function.prototype.bind ||= ( _this ) -> => @apply(_this, arguments)

root = './../../'
libs = 'bower_components/'
requirejs.config {
  enfordeDefine: true
  paths:
    # Vendor goodies this template depends on
    'jquery':                 root+libs+'jquery/dist/jquery'
    'underscore':             root+libs+'underscore/underscore'
    'underscore.string':      root+libs+'underscore.string/lib/underscore.string'
    'handlebars':             root+libs+'handlebars/handlebars.amd'
    'material-design-lite':   root+libs+'material-design-lite/material.min'
    'moment':                 root+libs+'momentjs/moment'
    'moment_nl':              root+libs+'momentjs/locale/nl'
    'i18next':                root+libs+'i18next/i18next.amd.withJQuery'
    'bluebird':               root+libs+'bluebird/js/browser/bluebird'
    'tv4':                    root+libs+'tv4/tv4'

    # RequireJS json! deps
    'requirejs':              root+libs+'requirejs/require'
    'text':                   root+libs+'requirejs-text/text'
    'json':                   root+libs+'requirejs-plugins/src/json'

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

# This function will be executed when all dependencies have successfully
# loaded (they are passed in as arguments).
onDependenciesLoaded = ( TemplateController ) ->

  templateController = new TemplateController(if Nota? then Nota)

  # For easy use in the global namespace
  window.template = templateController

  # For use in modules requiring this one
  return templateController




requireError = (error)->
  # Ensure we get the template is visible on the first error, and save
  # the list item it in the root for all later errors
  if not (document.getElementById('module-require-error').style.display is 'block')
    document.getElementById('module-require-error').style.display = 'block'

  # Make an instance of the error list item
  if not window.errorListItem?
    window.errorListItem = document.querySelectorAll("div.error-container ul li.error")[0]
    document.querySelectorAll("div.error-container ul")[0].innerHTML = ""

  # Fill the list with error list items
  errorList = document.querySelectorAll("div.error-container ul")[0]
  li = errorListItem.cloneNode()

  type = document.createElement('strong')
  type.innerHTML = "Module require error (#{error.requireType})"
  breakLine = document.createElement('br')
  errorText = document.createTextNode(error.message)
  li.appendChild type
  li.appendChild breakLine
  li.appendChild errorText
  errorList.appendChild li

  # Continue error so it shows up in the console
  # throw error

withNota = (Nota)->
  # Good to hear you could join. Time to start the template
  require(dependencies, onDependenciesLoaded, requireError)

withoutNota = (error)->
  # Aw, no Nota? If we're hosted in PhantomJS we'll need Nota. So in that case
  # it would be a fatal problem. But we might as well be running standalone,
  # and we'll do without.
  if window._phantom
    dependencies = ['handlebars', "text!#{root}templates/nota-required.hbs"]
    notaRequiredError = (Handlebars, template)->
      template = Handlebars.compile template
      window.document.body.innerHTML = template(error)
      throw error
    return require(dependencies, notaRequiredError, requireError)

  # Undefine Nota, we know he won't join the ride, so it's not a known
  # dependency anymore.
  requirejs.undef('nota')

  # Continue standalone
  require(dependencies, onDependenciesLoaded, requireError)


# We'll attempt to load Nota
require(['nota'], withNota, withoutNota)
