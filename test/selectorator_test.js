(function() {

  (function($) {
    var console, fdiv, fixtureHTML;
    console = window.console;
    fdiv = function() {
      return $("#qunit-fixture");
    };
    fixtureHTML = null;
    module("jquery-selectorator", {
      setup: function() {
        this.fdiv = fdiv();
        if (fixtureHTML) {
          return this.fdiv.html(fixtureHTML);
        } else {
          return fixtureHTML = this.fdiv.html();
        }
      }
    });
    test('@options', function() {
      $.selectorator.options = {
        foo: 'bar'
      };
      deepEqual($('a').selectorator().options, {
        foo: 'bar'
      }, 'extends default options');
      deepEqual($('a').selectorator({
        bar: 2
      }).options, {
        foo: 'bar',
        bar: 2
      }, 'merges options and default options');
      return deepEqual($('a').selectorator({
        foo: 3
      }).options, {
        foo: 3
      }, 'argument wins');
    });
    test('::unique', function() {
      deepEqual($.selectorator.unique([3, 1, 2, 3]), [3, 1, 2], 'rejects duplicates');
      return deepEqual($.selectorator.unique(['a', 'i', 'u', 'a', 'e', 'o', 'a']), ['a', 'i', 'u', 'e', 'o'], 'rejects duplicates');
    });
    test('::clean', function() {
      deepEqual($.selectorator.clean([3, 1, 2, 3], 3), [1, 2], 'rejects 3');
      return deepEqual($.selectorator.clean(['a', 'i', 'u', 'a', 'e', 'o', 'a'], 'a'), ['i', 'u', 'e', 'o'], 'rejects a');
    });
    test('::escapeSelector', function() {
      return equal($.selectorator.escapeSelector('1!2"3#4$5%6&6\'7(8)9*0+a,b.c/d:e;f<g=h>i?j@k[l\\m]n^o`p{q|r}s~'), '1\\!2\\"3\\#4\\$5\\%6\\&6\\\'7\\(8\\)9\\*0\\+a\\,b\\.c\\/d\\:e\\;f\\<g\\=h\\>i\\?j\\@k\\[l\\\\m\\]n\\^o\\`p\\{q\\|r\\}s\\~', 'should escape selector');
    });
    test('#query', function() {
      var qux, qux2, selectorator;
      this.fdiv = fdiv();
      selectorator = this.fdiv.selectorator();
      qux = selectorator.query("#bar a[name='qux1']");
      equal(qux.size(), 1, 'anchor element should be found 1');
      this.fdiv.empty();
      qux2 = selectorator.query("#bar a[name='qux1']");
      equal(qux2, qux, 'should return cached instance');
      return equal(qux2.size(), 1, 'anchor element should be found 1');
    });
    test('#validate', function() {
      var selectorator;
      this.fdiv = fdiv();
      selectorator = this.fdiv.find('#bar').selectorator();
      equal(selectorator.validate('p', '.foo'), '.foo p', 'returns selector with parent');
      equal(selectorator.validate('p', '.foo', true, false), '.foo p', 'returns selector with parent');
      equal(selectorator.validate('p', '.foo', true, true), '.foo > p', 'returns selector with parent');
      equal(selectorator.validate('p', '.foo', false, false), 'p', 'returns tag only');
      return equal(selectorator.validate('p', '.foo', false, true), 'p', 'returns tag only');
    });
    test('#getProperTagName', function() {
      ok(fdiv().getSelector());
      equal($("<strong />").selectorator().getProperTagName(), 'strong', 'should return strong');
      equal(fdiv().selectorator().getProperTagName(), 'div', 'should return div');
      equal(fdiv().find('.foo').selectorator().getProperTagName(), 'div', 'should return div');
      equal(fdiv().find('#bar').selectorator().getProperTagName(), 'p', 'should return p');
      return equal(fdiv().find('[name=qux1]').selectorator().getProperTagName(), 'a', 'should return a');
    });
    test('#getIdSelector', function() {
      equal($('<div id="foo" />').selectorator().getIdSelector(), '#foo', 'should return selector');
      equal($('<div id="foo" />').selectorator().getIdSelector(true), 'div#foo', 'should return selector with tag name');
      return equal($('<div class="foo" />').selectorator().getIdSelector(), null, 'should return null');
    });
    test('#getClassSelector', function() {
      deepEqual($('<div id="foo" />').selectorator().getClassSelector(), [], 'should return an empty array');
      deepEqual($('<div class="foo" />').selectorator().getClassSelector(), ['.foo'], 'should return an array of 1 selector');
      deepEqual($('<div class="bar foo" />').selectorator().getClassSelector(), ['.bar', '.foo'], 'should return an array of 2 selectors');
      deepEqual($('<div class="bar foo baz bar~" />').selectorator({
        invalidClasses: ['qux', 'baz', 'bar']
      }).getClassSelector(), ['.foo', '.bar\\~'], 'should reject invalidClasses');
      equal($('body').selectorator().getClassSelector(), null, 'should return null for body element');
      equal($('html').selectorator().getClassSelector(), null, 'should return null for html element');
      return deepEqual($('<div class="bar foo" />').selectorator().getClassSelector(true), ['div.bar', 'div.foo'], 'should return an array of 2 selectors with tag name');
    });
    test('#getNameSelector', function() {
      deepEqual($('<a name="foo">Yay</a>').selectorator().getNameSelector(), ["a[name='foo']"], 'should return selector');
      return deepEqual($('<a>Yay</a>').selectorator().getNameSelector(), null, 'should return null');
    });
    test('#generateSimple', function() {
      deepEqual(fdiv().find("#test-list").selectorator().generateSimple(), ["#test-list"]);
      deepEqual(fdiv().find("#test-list a:eq(0)").selectorator().generateSimple(), []);
      deepEqual(fdiv().find("#test-list a:eq(1)").selectorator().generateSimple(), ["#link-microsoft"]);
      deepEqual(fdiv().find("#test-list a:eq(2)").selectorator().generateSimple(), [".link-yahoo"]);
      return deepEqual(fdiv().find("#test-list a:eq(3)").selectorator().generateSimple(), ["a[name='google']"]);
    });
    test('#generateAncestor', function() {
      deepEqual(fdiv().find("#test-list").selectorator().generateAncestor(), ["#test-list", "#test-list", "#test-list"]);
      deepEqual(fdiv().find("#test-list a:eq(0)").selectorator().generateAncestor(), []);
      deepEqual(fdiv().find("#test-list a:eq(1)").selectorator().generateAncestor(), ["#link-microsoft", "#link-microsoft", "#link-microsoft", "#link-microsoft", "#link-microsoft", "#link-microsoft"]);
      deepEqual(fdiv().find("#test-list a:eq(2)").selectorator().generateAncestor(), [".link-yahoo", ".link-yahoo", ".link-yahoo", ".link-yahoo", ".link-yahoo", ".link-yahoo", ".link-yahoo"]);
      return deepEqual(fdiv().find("#test-list a:eq(3)").selectorator().generateAncestor(), ["a[name='google']", "a[name='google']", "a[name='google']", "a[name='google']", "a[name='google']", "a[name='google']"]);
    });
    test('#generateRecursive', function() {
      deepEqual(fdiv().find("#test-list").selectorator().generateRecursive(), ["#qunit-fixture > div:eq(0)"]);
      deepEqual(fdiv().find("#test-list a:eq(0)").selectorator().generateRecursive(), [".list1 > li:eq(0) > a:eq(0)"]);
      deepEqual(fdiv().find("#test-list a:eq(1)").selectorator().generateRecursive(), [".list1 > li:eq(1) > a:eq(0)"]);
      deepEqual(fdiv().find("#test-list a:eq(2)").selectorator().generateRecursive(), [".yahoo-item > a:eq(0)"]);
      return deepEqual(fdiv().find("#test-list a:eq(3)").selectorator().generateRecursive(), [".list1 > li:eq(3) > a:eq(0)"]);
    });
    test('#generate', function() {
      deepEqual(fdiv().find("#test-list").selectorator().generate(), ["#test-list"]);
      deepEqual(fdiv().find("#test-list li:eq(0)").selectorator().generate(), [".list1 > li:eq(0)"]);
      deepEqual(fdiv().find("#test-list li:eq(1)").selectorator().generate(), [".list1 > li:eq(1)"]);
      deepEqual(fdiv().find("#test-list li:eq(2)").selectorator().generate(), [".yahoo-item"]);
      deepEqual(fdiv().find("#test-list li:eq(3)").selectorator().generate(), [".list1 > li:eq(3)"]);
      deepEqual(fdiv().find("#test-list a:eq(0)").selectorator().generate(), [".list1 > li:eq(0) > a:eq(0)"]);
      deepEqual(fdiv().find("#test-list a:eq(0)").selectorator().generate(), [".list1 > li:eq(0) > a:eq(0)"]);
      deepEqual(fdiv().find("#test-list a:eq(1)").selectorator().generate(), ["#link-microsoft"]);
      deepEqual(fdiv().find("#test-list a:eq(2)").selectorator().generate(), [".link-yahoo"]);
      deepEqual(fdiv().find("#test-list a:eq(3)").selectorator().generate(), ["a[name='google']"]);
      deepEqual(fdiv().find("canvas").selectorator().generate(), ["canvas"]);
      deepEqual(fdiv().find("[id='dup']:eq(0)").selectorator().generate(), ["#duplcate-test > span:eq(0)"]);
      deepEqual(fdiv().find("[id='dup']:eq(1)").selectorator().generate(), ["#duplcate-test > span:eq(1)"]);
      ok($("#test-list li:eq(0)").is(".list1 > li:eq(0)"));
      ok($("#test-list li:eq(1)").is(".list1 > li:eq(1)"));
      ok($("#test-list li:eq(2)").is(".yahoo-item"));
      return ok($("#test-list li:eq(3)").is(".list1 > li:eq(3)"));
    });
    return test('all elements', function() {
      return fdiv().find("*").each(function() {
        var selectors, self;
        self = $(this);
        selectors = self.selectorator().generate();
        return $.each(selectors, function() {
          equal($("" + this).size(), 1, "size of selector " + this + " should be 1");
          return ok($("" + this).is(self[0]), "" + self[0] + ": " + this + " .is " + (self.is("" + this)) + " of " + selectors.length + " " + (self.getSelector()));
        });
      });
    });
  })(jQuery);

}).call(this);
