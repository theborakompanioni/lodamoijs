[![Build Status](https://travis-ci.org/theborakompanioni/lodamoijs.svg?branch=master)](https://travis-ci.org/theborakompanioni/lodamoijs)

lodamoijs
========
A simple asynchronous JavaScript evaluator.

Usage
------

### URLs
```javascript
Lodamoi(['https://rawgit.com/vissense/vissense/0.8.0/dist/vissense.js']).load(function() {
  Lodamoi(['https://rawgit.com/vissense/vissense-percentage-time-test/0.5.0/dist/vissense-percentage-time-test.js']).load(function() {
    // do awesome stuff
  });
});
```

### Code
```javascript
Lodamoi([
  'var a = 1;',
  'var b = a + 1;'
  ]).load(function() {
  console.log(a + b); // -> 3
});
```

### Elements
```javascript
http.get('page.html', function(htmlTags) {
  Lodamoi([
      htmlTags
    ]).load(function() {
    console.log(a + b); // -> 3
  });
});
```

Further Reading
------
- [appendChild vs insertBefore](http://www.stevesouders.com/blog/2010/05/11/appendchild-vs-insertbefore/)
- [Including Tags vs eval()](http://stackoverflow.com/questions/8380204/is-there-a-performance-gain-in-including-script-tags-as-opposed-to-using-eval)

License
-------

The project is licensed under the MIT license. See
[LICENSE](https://github.com/theborakompanioni/lodamoijs/blob/master/LICENSE) for details.
