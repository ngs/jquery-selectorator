#
# selectorator
# https://github.com/ngs/jquery-selectorator
#
# Copyright (c) 2013 Atsushi Nagase
# Licensed under the MIT license.
#
(($) ->

  # console = window.console
  map     = $.map
  extend  = $.extend
  inArray = $.inArray

  contains = (item, array)->
    inArray(item, array) != -1

  escapeSelector = (selector)->
    selector.replace /([\!\"\#\$\%\&'\(\)\*\+\,\.\/\:\;<\=>\?\@\[\\\]\^\`\{\|\}\~])/g, "\\$1"

  clean = (arr, reject)->
    map arr, (item)->
      if item == reject then null else item

  unique = (arr)->
    map arr, (item, index)->
      if index == arr.indexOf(item) then item else null

  class Selectorator
    constructor: (element, options)->
      @element = element
      @options = extend(extend({}, $.selectorator.options), options)
      @cachedResults = {}

    query: (selector)->
      @cachedResults[selector] ||= $(selector.replace(/#([^\s]+)/g, "[id='$1']"))

    getProperTagName: ->
      if @element[0] then @element[0].tagName.toLowerCase() else null

    validate: (selector, parentSelector, single = yes, isFirst = no)->
      element = @query selector
      if single && 1 < element.size() || !single && 0 == element.size()
        if parentSelector && selector.indexOf(':') == -1
          delimiter = if isFirst then ' > ' else ' '
          selector = parentSelector + delimiter + selector
          element = @query selector
          return null if single && 1 < element.size() || !single && 0 == element.size()
        else return null
      if contains(@element[0], element.get()) then selector else null

    generate: ->
      element = @element
      if (!element || element[0] == document || "undefined" == typeof element[0].tagName)
        return ['']
      res = []
      for fn in [@generateSimple, @generateAncestor, @generateRecursive]
        res = unique clean fn.call @
        return res if res && res.length > 0
      unique res

    generateAncestor: ->
      results = []
      for parent in @element.parents()
        isFirst = yes
        selectors = @generateSimple(null, no)
        for selector in selectors
          parentSelectors = new Selectorator($(parent), @options).generateSimple(null, no)
          for parentSelector in parentSelectors
            $.merge results, @generateSimple(parentSelector, yes, isFirst)
        isFirst = no
      results

    generateSimple: (parentSelector, single, isFirst)->
      self = @
      tagName = self.getProperTagName()
      validate = (selector)-> self.validate selector, parentSelector, single, isFirst
      for fn in [
        [self.getIdSelector          ],
        [self.getClassSelector       ],
        [self.getIdSelector,      yes],
        [self.getClassSelector,   yes],
        [self.getNameSelector        ],
        [-> [self.getProperTagName()]]
      ]
        res = fn[0].call(self, fn[1]) || []
        res = clean map(res, validate)
        return res if res.length > 0
      []

    generateRecursive: ->
      selector = @getProperTagName()
      selector = '*' if selector.indexOf(':') != -1
      parent  = @element.parent()
      parentSelector = new Selectorator(parent).generate()[0]
      index = parent.children(selector).index(@element)
      selector = "#{selector}:eq(#{index})"
      selector = parentSelector + " > " + selector if parentSelector != ''
      [selector]

    getIdSelector: (tagName = no)->
      tagName = if tagName then @getProperTagName() else ''
      id = @element.attr 'id'
      if typeof id is "string" && !contains(id, @getIgnore('id'))
        ["#{tagName}##{escapeSelector(id)}"]
      else null

    getClassSelector: (tagName = no)->
      tn = @getProperTagName()
      return null if /^(body|html)$/.test tn
      tagName = if tagName then tn else ''
      invalidClasses = @getIgnore 'class'
      classes = (@element.attr('class')||'').replace(/\{.*\}/, "").split(/\s/)
      map classes, (klazz)->
        if klazz && !contains(klazz, invalidClasses)
          "#{tagName}.#{escapeSelector(klazz)}"
        else null

    getNameSelector: ->
      tagName = @getProperTagName()
      name = @element.attr('name')
      if name && !contains(name, @getIgnore('name'))
        ["#{tagName}[name='#{name}']"]
      else null

    getIgnore: (key)->
      opts = @options.ignore || {}
      mulkey = if key is 'class' then 'classes' else "#{key}s"
      vals = opts[key] || opts[mulkey]
      if typeof vals is 'string' then [vals] else vals

  #----------------------------------------------

  $.selectorator =
    options: {}
    unique: unique
    clean: clean
    escapeSelector: escapeSelector

  $.fn.selectorator = (options)->
    new Selectorator($(@), options)

  $.fn.getSelector = (options)->
    @selectorator(options).generate()

  @
) jQuery
