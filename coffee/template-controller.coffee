dependencies = [
  'template-model'
  'jquery'
  'handlebars'
  'underscore.string'
  'i18next'
  'json!translation_nl'
  'json!translation_en'
  'underscore'
  'underscore.string'
  'material-design-lite'
]
define dependencies, ()->
  # Unpack the loaded dependencies we receive as arguments
  [TemplateModel, $, Handlebars, s, i18n, nlMap, enMap, _, s, mdl] = arguments

  class TemplateController

    constructor: (@renderError, @nota)->
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

      # If we're not building a PDF we add the browser stylesheet. Sadly
      # PhantomJS doesn't clean up the styles completely when starting to
      # capture to PDF, leaving the media='screen' only stylesheets causing
      # strange effects on the layout even though they shouldn't apply (only
      # media='print', and media='all' should apply). This ensures they're not
      # loaded at all if we're going to capture to PDF anyway.
      if not @nota?.phantomRuntime
        css = '<link href="dist/css/material-design.css" rel="stylesheet"
        type="text/css" media="screen">'
        # Make sure that it's prepended, so that the base styles can override
        # a few Material Design ones.
        $('head link[role="normalize"]').after(css)

      # Get and compile template once to optimize for rendering iterations later
      @templateMain = Handlebars.compile $('script#template-main').html()

      @templatePartials = {
        'footer': $('script#template-footer').html()
      }

      # Also listen for data being set
      @nota?.on 'data:injected', @render

      # If running outside PhantomJS we'll have to our data ourselves from the
      # server
      @nota?.getData @render

      # If we're running stand-alone, show some preview data, for now I guess :)
      if not @nota? then require ['json!preview-data'], @render



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
      @nota?.trigger 'template:render:start'
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
        @nota?.logError(error, contextMessage)

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
        @nota?.logError(error, contextMessage)

      try
        # Hook up some Material Design Lite components that are part of the
        # template
        if not @nota?.phantomRuntime
          $showClosing = $('span#show-closing button')
          componentHandler.upgradeElement $showClosing[0]
          $showClosing.click (e)->
            $('span#closing').slideToggle()
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "#{errMsg} Initializing Material Design Lite
        components failed."
        @renderError(error, contextMessage)
        @nota?.logError(error, contextMessage)
      
      try
        # Provide Nota client with meta data from. This is fetched by
        # PhantomJS for e.g. providing the proposed filename of the PDF. See
        # the Nota client API for documentation.
        @nota?.setDocument 'meta', @model.documentMeta()
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "#{errMsg} Failed to set the document meta data in
        the Nota capture client."
        @renderError(error, contextMessage)
        @nota?.logError(error, contextMessage)

      try
        # Set footer to generate page numbers, but only if we're so tall that
        # we know we'll get multiple pages as output
        if @nota?.documentIsMultipage() then @nota?.setDocument 'footer', {
          height: "1cm"
          contents: @templatePartials.footer
        }
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "#{errMsg} Failed to set the document footer in the
        Nota capture client."
        @renderError(error, contextMessage)
        @nota?.logError(error, contextMessage)

      # Signal that we're done with rendering and that capture can begin
      @nota?.trigger 'template:render:done'

  return TemplateController