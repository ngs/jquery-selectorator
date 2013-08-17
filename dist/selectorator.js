/*! jQuery Selectorator - v0.1.3 - 2013-08-18
* https://github.com/ngs/jquery-selectorator
* Copyright (c) 2013 Atsushi Nagase; Licensed MIT */
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
        if (index === arr.indexOf(item)) {
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
        var _base;
        return (_base = this.cachedResults)[selector] || (_base[selector] = $(selector.replace(/#([^\s]+)/g, "[id='$1']")));
      };

      Selectorator.prototype.getProperTagName = function() {
        if (this.element[0]) {
          return this.element[0].tagName.toLowerCase();
        } else {
          return null;
        }
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
        if (single && 1 < element.size() || !single && 0 === element.size()) {
          if (parentSelector && selector.indexOf(':') === -1) {
            delimiter = isFirst ? ' > ' : ' ';
            selector = parentSelector + delimiter + selector;
            element = this.query(selector);
            if (single && 1 < element.size() || !single && 0 === element.size()) {
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
        var element, fn, res, _i, _len, _ref;
        element = this.element;
        if (!element || element[0] === document || "undefined" === typeof element[0].tagName) {
          return [''];
        }
        res = [];
        _ref = [this.generateSimple, this.generateAncestor, this.generateRecursive];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          fn = _ref[_i];
          res = unique(clean(fn.call(this)));
          if (res && res.length > 0) {
            return res;
          }
        }
        return unique(res);
      };

      Selectorator.prototype.generateAncestor = function() {
        var isFirst, parent, parentSelector, parentSelectors, results, selector, selectors, _i, _j, _k, _len, _len1, _len2, _ref;
        results = [];
        _ref = this.element.parents();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          parent = _ref[_i];
          isFirst = true;
          selectors = this.generateSimple(null, false);
          for (_j = 0, _len1 = selectors.length; _j < _len1; _j++) {
            selector = selectors[_j];
            parentSelectors = new Selectorator($(parent), this.options).generateSimple(null, false);
            for (_k = 0, _len2 = parentSelectors.length; _k < _len2; _k++) {
              parentSelector = parentSelectors[_k];
              $.merge(results, this.generateSimple(parentSelector, true, isFirst));
            }
          }
          isFirst = false;
        }
        return results;
      };

      Selectorator.prototype.generateSimple = function(parentSelector, single, isFirst) {
        var fn, res, self, tagName, validate, _i, _len, _ref;
        self = this;
        tagName = self.getProperTagName();
        validate = function(selector) {
          return self.validate(selector, parentSelector, single, isFirst);
        };
        _ref = [
          [self.getIdSelector], [self.getClassSelector], [self.getIdSelector, true], [self.getClassSelector, true], [self.getNameSelector], [
            function() {
              return [self.getProperTagName()];
            }
          ]
        ];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          fn = _ref[_i];
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
        selector = "" + selector + ":eq(" + index + ")";
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
        if (typeof id === "string" && !contains(id, this.getIgnore('ids'))) {
          return ["" + tagName + "#" + (escapeSelector(id))];
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
        invalidClasses = this.getIgnore('classes');
        classes = (this.element.attr('class') || '').replace(/\{.*\}/, "").split(/\s/);
        return map(classes, function(klazz) {
          if (klazz && !contains(klazz, invalidClasses)) {
            return "" + tagName + "." + (escapeSelector(klazz));
          } else {
            return null;
          }
        });
      };

      Selectorator.prototype.getNameSelector = function() {
        var name, tagName;
        tagName = this.getProperTagName();
        name = this.element.attr('name');
        if (name && !contains(name, this.getIgnore('names'))) {
          return ["" + tagName + "[name='" + name + "']"];
        } else {
          return null;
        }
      };

      Selectorator.prototype.getIgnore = function(key) {
        var vals;
        vals = (this.options.ignore || {})[key];
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
