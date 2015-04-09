(($) ->
  console = window.console

  fdiv =-> $("#qunit-fixture")
  fixtureHTML = null

  module "jquery-selectorator",

    setup: ->
      @fdiv = fdiv()
      if fixtureHTML
        @fdiv.html fixtureHTML
      else
        fixtureHTML = @fdiv.html()

  test '@options', ->
    $.selectorator.options = { foo: 'bar' }
    deepEqual $('a').selectorator().options, { foo: 'bar' }, 'extends default options'
    deepEqual $('a').selectorator({ bar: 2 }).options, { foo: 'bar', bar: 2 }, 'merges options and default options'
    deepEqual $('a').selectorator({ foo: 3 }).options, { foo: 3 }, 'argument wins'

  test '::unique', ->
    deepEqual $.selectorator.unique([3, 1, 2, 3]), [3, 1, 2], 'rejects duplicates'
    deepEqual $.selectorator.unique(['a', 'i', 'u', 'a', 'e', 'o', 'a']), ['a', 'i', 'u', 'e', 'o'], 'rejects duplicates'

  test '::clean', ->
    deepEqual $.selectorator.clean([3, 1, 2, 3], 3), [1, 2], 'rejects 3'
    deepEqual $.selectorator.clean(['a', 'i', 'u', 'a', 'e', 'o', 'a'], 'a'), ['i', 'u', 'e', 'o'], 'rejects a'

  test '::escapeSelector', ->
    equal($.selectorator.escapeSelector('1!2"3#4$5%6&6\'7(8)9*0+a,b.c/d:e;f<g=h>i?j@k[l\\m]n^o`p{q|r}s~'),
      '1\\!2\\"3\\#4\\$5\\%6\\&6\\\'7\\(8\\)9\\*0\\+a\\,b\\.c\\/d\\:e\\;f\\<g\\=h\\>i\\?j\\@k\\[l\\\\m\\]n\\^o\\`p\\{q\\|r\\}s\\~',
      'should escape selector')

  test '#query', ->
    @fdiv = fdiv()
    selectorator = @fdiv.selectorator()
    qux = selectorator.query("#bar a[name='qux1']")
    equal qux.size(), 1, 'anchor element should be found 1'
    @fdiv.empty()
    qux2 = selectorator.query("#bar a[name='qux1']")
    equal qux2, qux, 'should return cached instance'
    equal qux2.size(), 1, 'anchor element should be found 1'

  test '#validate', ->
    @fdiv = fdiv()
    selectorator = @fdiv.find('#bar').selectorator()
    equal selectorator.validate('p', '.foo'), '.foo p', 'returns selector with parent'
    equal selectorator.validate('p', '.foo', true,  false), '.foo p',   'returns selector with parent'
    equal selectorator.validate('p', '.foo', true,  true ), '.foo > p', 'returns selector with parent'
    equal selectorator.validate('p', '.foo', false, false), 'p',        'returns tag only'
    equal selectorator.validate('p', '.foo', false, true ), 'p',        'returns tag only'

  test '#getProperTagName', ->
    ok fdiv().getSelector()
    equal $("<strong />").selectorator().getProperTagName(), 'strong', 'should return strong'
    equal fdiv().selectorator().getProperTagName(), 'div', 'should return div'
    equal fdiv().find('.foo').selectorator().getProperTagName(), 'div', 'should return div'
    equal fdiv().find('#bar').selectorator().getProperTagName(), 'p', 'should return p'
    equal fdiv().find('[name=qux1]').selectorator().getProperTagName(), 'a', 'should return a'

  test '#getIdSelector', ->
    equal $('<div id="foo" />').selectorator().getIdSelector(), '#foo', 'should return selector'
    equal $('<div id="foo" />').selectorator().getIdSelector(true), 'div#foo', 'should return selector with tag name'
    equal $('<div class="foo" />').selectorator().getIdSelector(), null, 'should return null'
    equal $('<div id="foo" />').selectorator( ignore: ids: ['foo'] ).getIdSelector(), null, 'should ignore id'
    equal $('<div id="foo" />').selectorator( ignore: ids: 'foo' ).getIdSelector(), null, 'should ignore id'
    equal $('<div id="foo" />').selectorator( ignore: id:  ['foo'] ).getIdSelector(), null, 'should ignore id'
    equal $('<div id="foo" />').selectorator( ignore: id:  'foo' ).getIdSelector(), null, 'should ignore id'

  test '#getClassSelector', ->
    deepEqual $('<div id="foo" />')
      .selectorator().getClassSelector(), [],
      'should return an empty array'
    deepEqual $('<div class="foo" />')
      .selectorator().getClassSelector(), ['.foo'],
      'should return an array of 1 selector'
    deepEqual $('<div class="bar foo" />')
      .selectorator().getClassSelector(), ['.bar', '.foo'],
      'should return an array of 2 selectors'
    deepEqual $('<div class="bar foo baz bar~" />')
      .selectorator( ignore: class: ['qux', 'baz', 'bar'] ).getClassSelector(), ['.foo', '.bar\\~'],
      'should reject invalidClasses'
    deepEqual $('<div class="bar foo baz bar~" />')
      .selectorator( ignore: class: ['bar~'] ).getClassSelector(), ['.bar', '.foo', '.baz'],
      'should reject invalidClasses'
    deepEqual $('<div class="bar foo baz bar~" />')
      .selectorator( ignore: classes: ['qux', 'baz', 'bar'] ).getClassSelector(), ['.foo', '.bar\\~'],
      'should reject invalidClasses'
    deepEqual $('<div class="bar foo baz bar~" />')
      .selectorator( ignore: classes: ['bar~'] ).getClassSelector(), ['.bar', '.foo', '.baz'],
      'should reject invalidClasses'
    equal $('body').selectorator().getClassSelector(), null, 'should return null for body element'
    equal $('html').selectorator().getClassSelector(), null, 'should return null for html element'
    deepEqual $('<div class="bar foo" />')
      .selectorator().getClassSelector(true), ['div.bar', 'div.foo'],
      'should return an array of 2 selectors with tag name'

  test '#getNameSelector', ->
    deepEqual $('<a name="foo">Yay</a>').selectorator().getNameSelector(), ["a[name='foo']"], 'should return selector'
    deepEqual $('<a>Yay</a>').selectorator().getNameSelector(), null, 'should return null'
    deepEqual $('<a name="foo">Yay</a>').selectorator( ignore: names: ['foo'] ).getNameSelector(), null, 'should ignore name'
    deepEqual $('<a name="foo">Yay</a>').selectorator( ignore: names: 'foo' ).getNameSelector(), null, 'should ignore name'
    deepEqual $('<a name="foo">Yay</a>').selectorator( ignore: name:  ['foo'] ).getNameSelector(), null, 'should ignore name'
    deepEqual $('<a name="foo">Yay</a>').selectorator( ignore: name:  'foo' ).getNameSelector(), null, 'should ignore name'

  test '#generateSimple', ->
    deepEqual fdiv().find("#test-list").selectorator().generateSimple(), ["#test-list"]
    deepEqual fdiv().find("#test-list a:eq(0)").selectorator().generateSimple(), []
    deepEqual fdiv().find("#test-list a:eq(1)").selectorator().generateSimple(), ["#link-microsoft"]
    deepEqual fdiv().find("#test-list a:eq(2)").selectorator().generateSimple(), [".link-yahoo"]
    deepEqual fdiv().find("#test-list a:eq(3)").selectorator().generateSimple(), ["a[name='google']"]

  test '#generateAncestor', ->
    deepEqual fdiv().find("#test-list").selectorator().generateAncestor(), ["#test-list", "#test-list", "#test-list"]
    deepEqual fdiv().find("#test-list a:eq(0)").selectorator().generateAncestor(), []
    deepEqual fdiv().find("#test-list a:eq(1)").selectorator().generateAncestor(),
      ["#link-microsoft", "#link-microsoft", "#link-microsoft", "#link-microsoft", "#link-microsoft", "#link-microsoft"]
    deepEqual fdiv().find("#test-list a:eq(2)").selectorator().generateAncestor(),
      [".link-yahoo", ".link-yahoo", ".link-yahoo", ".link-yahoo", ".link-yahoo", ".link-yahoo", ".link-yahoo"]
    deepEqual fdiv().find("#test-list a:eq(3)").selectorator().generateAncestor(),
      ["a[name='google']", "a[name='google']", "a[name='google']", "a[name='google']", "a[name='google']", "a[name='google']"]
    deepEqual fdiv().find("#test-nested p:eq(5)").selectorator().generateAncestor(),
      []

  test '#generateRecursive', ->
    deepEqual fdiv().find("#test-list").selectorator().generateRecursive(), ["#qunit-fixture > div:eq(0)"]
    deepEqual fdiv().find("#test-list a:eq(0)").selectorator().generateRecursive(), [".list1 > li:eq(0) > a:eq(0)"]
    deepEqual fdiv().find("#test-list a:eq(1)").selectorator().generateRecursive(), [".list1 > li:eq(1) > a:eq(0)"]
    deepEqual fdiv().find("#test-list a:eq(2)").selectorator().generateRecursive(), [".yahoo-item > a:eq(0)"]
    deepEqual fdiv().find("#test-list a:eq(3)").selectorator().generateRecursive(), [".list1 > li:eq(3) > a:eq(0)"]

  test '#generate', ->
    deepEqual fdiv().find("#test-list").selectorator().generate(), ["#test-list"]
    deepEqual fdiv().find("#test-list li:eq(0)").selectorator().generate(), [".list1 > li:eq(0)"]
    deepEqual fdiv().find("#test-list li:eq(1)").selectorator().generate(), [".list1 > li:eq(1)"]
    deepEqual fdiv().find("#test-list li:eq(2)").selectorator().generate(), [".yahoo-item"]
    deepEqual fdiv().find("#test-list li:eq(3)").selectorator().generate(), [".list1 > li:eq(3)"]
    deepEqual fdiv().find("#test-list a:eq(0)").selectorator().generate(), [".list1 > li:eq(0) > a:eq(0)"]
    deepEqual fdiv().find("#test-list a:eq(0)").selectorator().generate(), [".list1 > li:eq(0) > a:eq(0)"]
    deepEqual fdiv().find("#test-list a:eq(1)").selectorator().generate(), ["#link-microsoft"]
    deepEqual fdiv().find("#test-list a:eq(2)").selectorator().generate(), [".link-yahoo"]
    deepEqual fdiv().find("#test-list a:eq(3)").selectorator().generate(), ["a[name='google']"]
    deepEqual fdiv().find("canvas").selectorator().generate(), ["canvas"]
    deepEqual fdiv().find("[id='dup']:eq(0)").selectorator().generate(), ["#duplcate-test > span:eq(0)"]
    deepEqual fdiv().find("[id='dup']:eq(1)").selectorator().generate(), ["#duplcate-test > span:eq(1)"]
    deepEqual fdiv().find("[name='dup1']:eq(0)").selectorator().generate(), ["#duplcate-test > a:eq(0)"]
    deepEqual fdiv().find("[name='dup1']:eq(1)").selectorator().generate(), ["#duplcate-test > a:eq(1)"]
    deepEqual fdiv().find("#test-nested p:eq(5)").selectorator().generate(), [".body-copy > .body-copy > p:eq(2)"]
    ok $("#test-list li:eq(0)").is(".list1 > li:eq(0)")
    ok $("#test-list li:eq(1)").is(".list1 > li:eq(1)")
    ok $("#test-list li:eq(2)").is(".yahoo-item")
    ok $("#test-list li:eq(3)").is(".list1 > li:eq(3)")

  test 'empty attributes', ->
    equal fdiv().find('#test-empty-attributes p:eq(0)').selectorator().generate(), '#test-empty-attributes > p:eq(0)'
    equal fdiv().find('#test-empty-attributes p:eq(1)').selectorator().generate(), '#test-empty-attributes > p:eq(1)'

  test 'all elements', ->
    fdiv().find("*").each ->
      self = $(@)
      selectors = self.selectorator().generate()
      $.each selectors, ->
        equal $("#{@}").size(), 1, "size of selector #{@} should be 1"
        # ok $("#{@}").is(self[0]), "#{self[0]}: #{@} is #{self.is("#{@}")} of #{selectors.length}"

) jQuery
