[![Build Status](https://travis-ci.org/theborakompanioni/lodamoijs.svg?branch=master)](https://travis-ci.org/theborakompanioni/lodamoijs)
[![Coverage Status](https://img.shields.io/coveralls/theborakompanioni/lodamoijs.svg)](https://coveralls.io/r/theborakompanioni/lodamoijs?branch=master)
[![Dependency Status](http://img.shields.io/badge/dependencies-Vanilla_JS-brightgreen.svg)](http://vanilla-js.com/)
[![devDependency Status](https://david-dm.org/theborakompanioni/lodamoijs/dev-status.svg)](https://david-dm.org/theborakompanioni/lodamoijs#info=devDependencies)

lodamoijs
========
A simple asynchronous JavaScript evaluator.

Usage
------
#### URLs
```javascript
L([
  L.url('/scripts/jQuery.js'),
  L.url('/scripts/vissense.js')
]).load(function() {
  L.url('/scripts/vissense-percentage-time-test.js').load(function() {
    // do awesome stuff
  });
});
```

#### Code
```javascript
L([
  L.code('var a = 1;'),
  L.code('var b = a + 1;'),
]).load(function() {
  console.log(a + b); // -> 3
});
```

#### Elements
```javascript
http.get('page.html', function(htmlTagsAsString) {
  var divElement = document.createElement('div');
  divElement.innerHTML = htmlTagsAsString;
  
  L.tag(divElement).load(function() {
    // do awesome stuff
  });
});
```

Limitations
------

Your can omit verbose constructs like `L.code`, `L.url` or `L.tag` when the elements are distinctive:

```javascript
L([
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js',
  'var a = 123;'
]).load(function() {
  L('var myJQuery = jQuery.noConflict()').load(function() {
    // do awesome stuff
  });
});
```

### Looks like an URL?
The current implementation matches urls by protocol prefix: it must be either "http://" or "https://".
Relative or protocol relative (e.g. `//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js`) are not supported.
Trying the following won't work as expected:

```javascript
L(['/from/same/origin/script.js']).load(function() {
  // ...
});
```

You have to use the more specific version:
```javascript
L.url('/from/same/origin/script.js').load(function() {
  // ...
});
```

### Unordered execution
Caution when using an element with `<script`> tags relying on each other.
The following does not work as expected:
```html
<div id="myElement">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  <script>
    jQuery('#myElement').hide();
  </script>
</div>
```
```javascript
var myElement = document.getElementById('myElement');
L([
    myElement
]).load(function() {
  // ...
});
```

In this example `jQuery` may not be available when the second script tag gets evaluated
and this will result in `Uncaught ReferenceError: jQuery is not defined`.

Further Reading
------
- [Loading Scripts Without Blocking](http://www.stevesouders.com/blog/2009/04/27/loading-scripts-without-blocking/)
- [MDN innerHTML Security Considerations](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations)
- [appendChild vs insertBefore](http://www.stevesouders.com/blog/2010/05/11/appendchild-vs-insertbefore/)
- [Including Tags vs eval()](http://stackoverflow.com/questions/8380204/is-there-a-performance-gain-in-including-script-tags-as-opposed-to-using-eval)
- [Script Injected Async Scripts Considered Harmful](https://www.igvita.com/2014/05/20/script-injected-async-scripts-considered-harmful/)

License
-------

The project is licensed under the MIT license. See
[LICENSE](https://github.com/theborakompanioni/lodamoijs/blob/master/LICENSE) for details.
