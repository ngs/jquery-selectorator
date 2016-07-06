(function() {
  (function($) {
    var Selectorator, clean, contains, escapeSelector, extend, inArray, map, unique;
    map = $.map;
    extend = $.extend;
    inArray = $.inArray;
    contains = function(item, array) {
      return inArray(item, array) !== -1;
    };
    escapeSelector = function(selector) {
      return selector.replace(/([\!\"\#\$\%\&'\(\)\*\+\,\.\/\:\;<\=>\?\@\[\\\]\^\`\{\|\}\~])/g, "\\$1");
    };
    clean = function(arr, reject) {
      return map(arr, function(item) {
        if (item === reject) {
          return null;
        } else {
          return item;
        }
      });
    };
    unique = function(arr) {
      return map(arr, function(item, index) {
        if (parseInt(index, 10) === parseInt(arr.indexOf(item), 10)) {
          return item;
        } else {
          return null;
        }
      });
    };
    Selectorator = (function() {
      function Selectorator(element, options) {
        this.element = element;
        this.options = extend(extend({}, $.selectorator.options), options);
        this.cachedResults = {};
      }

      Selectorator.prototype.query = function(selector) {
        var base;
        return (base = this.cachedResults)[selector] || (base[selector] = $(selector.replace(/#([^\s]+)/g, "[id='$1']")));
      };

      Selectorator.prototype.getProperTagName = function() {
        if (this.element[0]) {
          return this.element[0].tagName.toLowerCase();
        } else {
          return null;
        }
      };

      Selectorator.prototype.hasParent = function() {
        return this.element && 0 < this.element.parent().length;
      };

      Selectorator.prototype.isElement = function() {
        var node;
        node = this.element[0];
        return node && node.nodeType === node.ELEMENT_NODE;
      };

      Selectorator.prototype.validate = function(selector, parentSelector, single, isFirst) {
        var delimiter, element;
        if (single == null) {
          single = true;
        }
        if (isFirst == null) {
          isFirst = false;
        }
        element = this.query(selector);
        if (single && 1 < element.length || !single && 0 === element.length) {
          if (parentSelector && selector.indexOf(':') === -1) {
            delimiter = isFirst ? ' > ' : ' ';
            selector = parentSelector + delimiter + selector;
            element = this.query(selector);
            if (single && 1 < element.length || !single && 0 === element.length) {
              return null;
            }
          } else {
            return null;
          }
        }
        if (contains(this.element[0], element.get())) {
          return selector;
        } else {
          return null;
        }
      };

      Selectorator.prototype.generate = function() {
        var fn, i, len, ref, res;
        if (!(this.element && this.hasParent() && this.isElement())) {
          return [''];
        }
        res = [];
        ref = [this.generateSimple, this.generateAncestor, this.generateRecursive];
        for (i = 0, len = ref.length; i < len; i++) {
          fn = ref[i];
          res = unique(clean(fn.call(this)));
          if (res && res.length > 0) {
            return res;
          }
        }
        return unique(res);
      };

      Selectorator.prototype.generateAncestor = function() {
        var i, isFirst, j, k, len, len1, len2, parent, parentSelector, parentSelectors, ref, results, selector, selectors;
        results = [];
        ref = this.element.parents();
        for (i = 0, len = ref.length; i < len; i++) {
          parent = ref[i];
          isFirst = true;
          selectors = this.generateSimple(null, false);
          for (j = 0, len1 = selectors.length; j < len1; j++) {
            selector = selectors[j];
            parentSelectors = new Selectorator($(parent), this.options).generateSimple(null, false);
            for (k = 0, len2 = parentSelectors.length; k < len2; k++) {
              parentSelector = parentSelectors[k];
              $.merge(results, this.generateSimple(parentSelector, true, isFirst));
            }
          }
          isFirst = false;
        }
        return results;
      };

      Selectorator.prototype.generateSimple = function(parentSelector, single, isFirst) {
        var fn, i, len, ref, res, self, tagName, validate;
        self = this;
        tagName = self.getProperTagName();
        validate = function(selector) {
          return self.validate(selector, parentSelector, single, isFirst);
        };
        ref = [
          [self.getIdSelector], [self.getClassSelector], [self.getIdSelector, true], [self.getClassSelector, true], [self.getNameSelector], [
            function() {
              return [self.getProperTagName()];
            }
          ]
        ];
        for (i = 0, len = ref.length; i < len; i++) {
          fn = ref[i];
          res = fn[0].call(self, fn[1]) || [];
          res = clean(map(res, validate));
          if (res.length > 0) {
            return res;
          }
        }
        return [];
      };

      Selectorator.prototype.generateRecursive = function() {
        var index, parent, parentSelector, selector;
        selector = this.getProperTagName();
        if (selector.indexOf(':') !== -1) {
          selector = '*';
        }
        parent = this.element.parent();
        parentSelector = new Selectorator(parent).generate()[0];
        index = parent.children(selector).index(this.element);
        selector = selector + ":eq(" + index + ")";
        if (parentSelector !== '') {
          selector = parentSelector + " > " + selector;
        }
        return [selector];
      };

      Selectorator.prototype.getIdSelector = function(tagName) {
        var id;
        if (tagName == null) {
          tagName = false;
        }
        tagName = tagName ? this.getProperTagName() : '';
        id = this.element.attr('id');
        if (typeof id === "string" && !contains(id, this.getIgnore('id')) && id !== '') {
          return [tagName + "#" + (escapeSelector(id))];
        } else {
          return null;
        }
      };

      Selectorator.prototype.getClassSelector = function(tagName) {
        var classes, invalidClasses, tn;
        if (tagName == null) {
          tagName = false;
        }
        tn = this.getProperTagName();
        if (/^(body|html)$/.test(tn)) {
          return null;
        }
        tagName = tagName ? tn : '';
        invalidClasses = this.getIgnore('class');
        classes = (this.element.attr('class') || '').replace(/\{.*\}/, "").split(/\s/);
        return map(classes, function(klazz) {
          if (klazz && !contains(klazz, invalidClasses)) {
            return tagName + "." + (escapeSelector(klazz));
          } else {
            return null;
          }
        });
      };

      Selectorator.prototype.getNameSelector = function() {
        var name, tagName;
        tagName = this.getProperTagName();
        name = this.element.attr('name');
        if (name && !contains(name, this.getIgnore('name'))) {
          return [tagName + "[name='" + name + "']"];
        } else {
          return null;
        }
      };

      Selectorator.prototype.getIgnore = function(key) {
        var mulkey, opts, vals;
        opts = this.options.ignore || {};
        mulkey = key === 'class' ? 'classes' : key + "s";
        vals = opts[key] || opts[mulkey];
        if (typeof vals === 'string') {
          return [vals];
        } else {
          return vals;
        }
      };

      return Selectorator;

    })();
    $.selectorator = {
      options: {},
      unique: unique,
      clean: clean,
      escapeSelector: escapeSelector
    };
    $.fn.selectorator = function(options) {
      return new Selectorator($(this), options);
    };
    $.fn.getSelector = function(options) {
      return this.selectorator(options).generate();
    };
    return this;
  })(jQuery);

}).call(this);
