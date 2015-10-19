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
]
define dependencies, ()->
  # Unpack the loaded dependencies we receive as arguments
  [TemplateModel, $, Handlebars, s, i18n, nlMap, enMap, cssRegions, _, s] = arguments

  class TemplateController

    constructor: (@onError)->

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
          
      # If we're not running in PhantomJS, emulate pagination in the browser
      # using CSS Regions as pages (actually, using the polyfill untill native
      # browser support for CSS Regiosn is implemented).
      if not Nota.phantomRuntime
        require ['css-regions'], (cssRegions)->
          # CSS regions has now loaded and should have performed a re-layout of the template's
          # content over the regions (pages).
          console.log "TODO: pagination and page numbers in browser preview"

      # Get and compile template once to optimize for rendering iterations later
      @template = Handlebars.compile $('script#template').html()


    render: (data)=>
      # Signal that we've started rendering
      Nota.trigger 'template:render:start'

      # TemplateModel provides helpers, formatters and model validation
      model = new TemplateModel(data)

      try
        model.validate(data)
      catch error
        # Supplement error message with contextual information and forward it
        contextMessage = "An error ocurred during rendering. The provided data
        to render is not a valid model for this template."
        onError(error)
        Nota.logError(contextMessage, error)

      i18n.setLng model.language()

      Handlebars.registerHelper 'currency', model.currency
      Handlebars.registerHelper 'decapitalize', model.decapitalize
      
      # The acutal rendering call. Resulting HTML is placed into body DOM
      $('body').html @template(model)

      # Provide Nota client with meta data from. This is fetched by PhantomJS
      # for e.g. providing the proposed filename of the PDF. See the Nota client
      # API for documentation.
      Nota.setDocument 'meta', model.documentMeta()

      # Set footer to generate page numbers, but only if we're so tall that we know we'll get
      # multiple pages as output (body is taller than one document page (287mm, see stylehseet for
      # why it's not the ISO216 A4 height) in height).
      multipage = ($('body').height() / 3.187864111498258) > 287 # 1mm is 3.187864111498258px
      if multipage then Nota.setDocument 'footer', {
        height: "1cm"
        contents: """
          <span style="float:right; font-family: Roboto, sans-serif; color:#8D9699 !important;">
            #{i18n.t('page')} {{pageNum}} #{i18n.t('of-page-num')} {{numPages}}
          </span>
          """
      }

      # Signal that we're done with rendering and that capture can begin
      Nota.trigger 'template:render:done'

  return TemplateController