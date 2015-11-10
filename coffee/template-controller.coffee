dependencies = [
  'template-model'
  'jquery'
  'handlebars'
  'underscore.string'
  'i18next'
  'json!translation_nl'
  'json!translation_en'
  'css-regions'
  'underscore'
  'underscore.string'
  'material-design-lite'
]
define dependencies, ()->
  # Unpack the loaded dependencies we receive as arguments
  [TemplateModel, $, Handlebars, s, i18n, nlMap, enMap, cssRegions, _, s, mdl] = arguments

  class TemplateController

    constructor: (@renderError)->
      # Set up internationalisation with support for translations in English
      # and Dutch.
      i18n.init {
        resStore:
          en: { translation: enMap }
          nl: { translation: nlMap }

        # In case of missing translation
        missingKeyHandler: (lng, ns, key, defaultValue, lngs) ->
          throw new Error arguments
      }
          
      # If we're not running in PhantomJS, emulate pagination in the browser
      # using CSS Regions as pages (actually, using the polyfill untill native
      # browser support for CSS Regiosn is implemented).
      if not Nota.phantomRuntime
        require ['css-regions'], (cssRegions)->
          # CSS regions has now loaded and should have performed a re-layout
          # of the template's content over the regions (pages).
          console.log "TODO: pagination and page numbers in browser preview"

      # If we're not building a PDF we add the browser stylesheet. Sadly
      # PhantomJS doesn't clean up the styles completely when starting to
      # capture to PDF, leaving the media='screen' only stylesheets causing
      # strange effects on the layout even though they shouldn't apply (only
      # media='print', and media='all' should apply). This ensures they're not
      # loaded at all if we're going to capture to PDF anyway.
      if not Nota.buildTarget()
        css = '<link href="dist/css/browser.css" rel="stylesheet"
        type="text/css" media="screen">'
        # Make sure that it's prepended, so that the base styles can override
        # a few Material Design ones.
        $('head link[media="all"]').before(css)

      # Get and compile template once to optimize for rendering iterations later
      @templateMain = Handlebars.compile $('script#template-main').html()

      @templatePartials = {
        'footer': $('script#template-footer').html()
      }






    translate: (i18n_key, count, attr, caselevel)->
      # TODO: Fugly hack to get Handlebars to evaluate a function when passed to
      # a helper as the value
      if "function" is typeof i18n_key then i18n_key = i18n_key()

      # Hack to achieve pluralization with the helper
      if "number" is typeof count
        value = i18n.t(i18n_key, count: count)
      else if "number" is typeof count?[attr]
        value = i18n.t(i18n_key, count: count[attr])
      else
        value = i18n.t(i18n_key)

      # Also implement simple capitalization while we're at it
      switch caselevel
        when 'lowercase' then value.toLowerCase()
        when 'uppercase' then value.toUpperCase()
        when 'capitalize' then s.capitalize(value)
        else value





    render: (data)=>
      # Signal that we've started rendering
      Nota.trigger 'template:render:start'
      errMsg = "An error ocurred during rendering."

      try
        # TemplateModel provides helpers, formatters and model validation
        @model = new TemplateModel(data)
        @model.validate(data)
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "#{errMsg} The provided data
        to render is not a valid model for this template."
        @renderError(error, contextMessage)
        Nota.logError(error, contextMessage)

      i18n.setLng @model.language()

      Handlebars.registerHelper 'i18n', @translate
      Handlebars.registerHelper 'currency', @model.currency
      
      try
        # The acutal rendering call. Resulting HTML is placed into body DOM
        $('body').html @templateMain(@model)

        type = @translate(@model.fiscalType(), null, null, 'capitalize')
        id = @model.fullID()
        project = @model.projectName
        title = if project?
          "#{type} #{id} - #{project}"
        else
          "#{type} #{id}"
        $('head title').html title
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "#{errMsg} Templating engine
        Handlebars.js encounted an error with the given data."
        @renderError(error, contextMessage)
        Nota.logError(error, contextMessage)

      try
        # Hook up some Material Design Lite components that are part of the
        # template
        if not Nota.phantomRuntime
          $showClosing = $('span#show-closing button')
          componentHandler.upgradeElement $showClosing[0]
          $showClosing.click (e)->
            $('span#closing').slideToggle()
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "#{errMsg} Initializing Material Design Lite
        components failed."
        @renderError(error, contextMessage)
        Nota.logError(error, contextMessage)
      
      try
        # Provide Nota client with meta data from. This is fetched by
        # PhantomJS for e.g. providing the proposed filename of the PDF. See
        # the Nota client API for documentation.
        Nota.setDocument 'meta', @model.documentMeta()
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "#{errMsg} Failed to set the document meta data in
        the Nota capture client."
        @renderError(error, contextMessage)
        Nota.logError(error, contextMessage)

      try
        # Set footer to generate page numbers, but only if we're so tall that
        # we know we'll get multiple pages as output
        if Nota.documentIsMultipage() then Nota.setDocument 'footer', {
          height: "1cm"
          contents: @templatePartials.footer
        }
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "#{errMsg} Failed to set the document footer in the
        Nota capture client."
        @renderError(error, contextMessage)
        Nota.logError(error, contextMessage)

      # Signal that we're done with rendering and that capture can begin
      Nota.trigger 'template:render:done'

  return TemplateController