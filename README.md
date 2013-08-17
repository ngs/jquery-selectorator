# jQuery Selectorator

jQuery plugin that returns simplest selector of elements.

[![Build Status](https://travis-ci.org/ngs/jquery-selectorator.png?branch=master)](https://travis-ci.org/ngs/jquery-selectorator)

## Getting Started
```html
<script src="jquery.js"></script>
<script src="dist/selectorator.min.js"></script>
```

## Documentation
### `jQuery.fn.getSelector(options = {})`

Returns an array of simplest selectors of the element.

### `jQuery.fn.selectorator(options = {})`

Returns Selectorator instance.

### `jQuery.seletortor.options = []`
Default options.

### `options.ignore.classes = []`
### `options.ignore.names = []`
### `options.ignore.ids = []`
### `options.ignore.class = ''`
### `options.ignore.name = ''`
### `options.ignore.id = ''`

String or Array of values to ignore from generated selectors.

## Examples
```javascript
$("a").on("click", function(){
  alert($(this).getSelector().join("\n"));
  return false;
});
```

## Testing
```bash
$ npm install
$ npm test
```

## Author

* Atsushi Nagase (http://ngs.io/)

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)
