/*! jQuery Selectorator - v0.1.0 - 2013-08-06
* https://github.com/ngs/jquery-selectorator
* Copyright (c) 2013 Atsushi Nagase; Licensed MIT */
(function() {

  (function($) {
    var Selectorator, clean, console, escapeSelector, extend, map, unique;
    console = window.console;
    map = $.map;
    extend = $.extend;
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
        return (_base = this.cachedResults)[selector] || (_base[selector] = $(selector));
      };

      Selectorator.prototype.getProperTagName = function() {
        if (this.element[0]) {
          return this.element[0].tagName.toLowerCase();
        } else {
          return null;
        }
      };

      Selectorator.prototype.validate = function(selector, parentSelector, d, isFirst) {
        var delimiter, element;
        if (d == null) {
          d = true;
        }
        if (isFirst == null) {
          isFirst = false;
        }
        element = this.query(selector);
        if (d && element.size() > 1 || !d && element.size() === 0) {
          if (parentSelector && selector.indexOf(':') === -1) {
            delimiter = isFirst ? ' > ' : ' ';
            selector = parentSelector + delimiter + selector;
          }
          element = this.query(selector);
          if (element.size() > 1 || !d && element.size() === 0) {
            return null;
          }
        } else {
          return null;
        }
        if ($.inArray(this.element[0], element) !== -1) {
          return selector;
        } else {
          return null;
        }
      };

      Selectorator.prototype.generate = function() {
        var element;
        element = this.element;
        if (!element || element[0] === document || "undefined" === typeof element[0].tagName) {
          return "";
        }
        return 1;
      };

      Selectorator.prototype.generateSimple = function() {
        return 1;
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
      return $(this).selectorator(options).generate();
    };
    return this;
  })(jQuery);

}).call(this);
