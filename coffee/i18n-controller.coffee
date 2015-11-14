dependencies = ['handlebars', 'i18next', 'json!translation_nl', 'json!translation_en']
define 'i18n-controller', dependencies, (Handlebars, i18next, nlMap, enMap)->
  class i18nController
    constructor: ()->
      @i18next = i18next
      # Set up internationalisation with support for translations in English
      # and Dutch.
      @i18next.init {
        resStore:
          en: { translation: enMap }
          nl: { translation: nlMap }

        # In case of missing translation
        missingKeyHandler: (lng, ns, key, defaultValue, lngs) ->
          throw new Error arguments
      }
      Handlebars.registerHelper 'i18n', @translate

    translate: (i18n_key, count, attr, caselevel)=>
      # TODO: Fugly hack to get Handlebars to evaluate a function when passed to
      # a helper as the value
      if "function" is typeof i18n_key then i18n_key = i18n_key()

      # Hack to achieve pluralization with the helper
      if "number" is typeof count
        value = @i18next.t(i18n_key, count: count)
      else if "number" is typeof count?[attr]
        value = @i18next.t(i18n_key, count: count[attr])
      else
        value = @i18next.t(i18n_key)

      # Also implement simple capitalization while we're at it
      switch caselevel
        when 'lowercase' then value.toLowerCase()
        when 'uppercase' then value.toUpperCase()
        when 'capitalize' then value.substr(0,1).toUpperCase() + value.substr(1)
        else value

    setLanguage: (lang)-> @i18next.setLng(lang)

  return new i18nController()
