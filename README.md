# jQuery Selectorator

[![Build Status](https://travis-ci.org/ngs/jquery-selectorator.png?branch=master)](https://travis-ci.org/ngs/jquery-selectorator)

jQuery plugin that returns simplest selector of elements.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/ngs/jquery-selectorator/master/dist/selectorator.min.js
[max]: https://raw.github.com/ngs/jquery-selectorator/master/dist/selectorator.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/selectorator.min.js"></script>
<script>
jQuery(function($) {
  $("body").on("*", "mouseenter", function(evt){
  	console.log($(this).getSelector());
  });
});
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
