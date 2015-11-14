dependencies = [
  'template-model'
  'i18n-controller'
  'jquery'
  'handlebars'
  'underscore.string'
  'underscore'
  'underscore.string'
  'material-design-lite'
  'bluebird'

  "text!#{root}templates/main.hbs"
  "text!#{root}templates/footer.hbs"
  "text!#{root}templates/error.hbs"
]
define dependencies, ()->
  # Unpack the loaded dependencies we receive as arguments
  [TemplateModel, i18nController, $, Handlebars, s, _, s, mdl, Promise] = arguments

  templates = {
    main:     arguments[9]
    footer:   arguments[10]
    error:    arguments[11]
  }

  class TemplateController

    constructor: (@nota)->
      try
        # Signal begin of template initialization
        @nota?.trigger 'template:init'

        @templates = _.mapObject(templates, (val, key)-> Handlebars.compile(val) )

        # If we're not building a PDF we add the browser stylesheet. Sadly
        # PhantomJS doesn't clean up the styles completely when starting to
        # capture to PDF, leaving the media='screen' only stylesheets causing
        # strange effects on the layout even though they shouldn't apply (only
        # media='print', and media='all' should apply). This ensures they're not
        # loaded at all if we're going to capture to PDF anyway.
        if not @nota?.phantomRuntime
          css = document.createElement('link')
          css.rel = 'stylesheet'
          css.href = 'dist/css/material-design.css'
          css.type = 'text/css'
          css.media = 'screen'
          # Make sure that it's prepended, so that the base styles can override
          # a few Material Design ones.
          $('head link[role="normalize"]').after(css)

        # Also listen for data being set
        @nota?.on 'data:injected', @render

        # If running outside PhantomJS we'll have to our data ourselves from the
        # server
        @nota?.getData @render

        # If we're running stand-alone, show some preview data, for now I guess :)
        if not @nota?
          require ['json!preview-data'], @render

        # Signal that we're done with setup and that we're ready to receive data
        @nota?.trigger 'template:loaded'
      catch error
        @renderError(error, "An error occured during template initialization.")
        
      return this

    renderError: (error, contextMessage)->
      if not @errorHistory? then @errorHistory = []

      @errorHistory.push
        context:  contextMessage
        error:    error

      if @templates.error?
        $('body').html @templates.error(@errorHistory)

      if @nota? then @nota.logError error, contextMessage
      else throw error

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

      i18nController.setLanguage @model.language()
      # Update currency helper because currency symbol might have changed with data
      Handlebars.registerHelper 'currency', @model.currency
      
      try
        # The acutal rendering call. Resulting HTML is placed into body DOM
        $('body').html @templates.main(@model)

        type = i18nController.translate(@model.fiscalType(), null, null, 'capitalize')
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
        @templates.footer()
        if @nota? and @nota.documentIsMultipage()
          @nota.setDocument 'footer', {
            height: "1cm"
            contents: @templates.footer()
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