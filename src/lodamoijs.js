/*jshint bitwise: false*/
(function (window, factory) {
  'use strict';
  window.Lodamoi = factory(window.document);
})(this, function (document, undefined) {
  'use strict';
  var ELEMENT_NODE_TYPE = 1;
  var NOOP = function () {
  };

  function evalScript(stringJavascriptSource, onLoad) {
    var script = document.createElement('script');
    var sourceAsTextNode = document.createTextNode(stringJavascriptSource);

    script.type = 'text/javascript';
    script.async = false;
    script.appendChild(sourceAsTextNode);

    var removeElementFromDom = addElementToDom(script);

    var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
    window.setTimeout(function() {
      onLoadOrNoop();
      removeElementFromDom();
    }, 1);
  }

  function loadScript(scriptSrc, onLoad) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = scriptSrc;

    var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
    var removeElementFromDom = addElementToDom(script, function (e) {
      onLoadOrNoop(e);
      removeElementFromDom();
    });
  }

  function addElementToDom(tag, onLoad) {
    if (!isElement(tag)) {
      return NOOP;
    }

    var head = document.getElementsByTagName('head')[0] || document.documentElement;

    if(isFunction(onLoad)) {
      var eventListener = function (e) {
        onLoad(e);
      };

      if (tag.readyState) { // IE
        tag.onreadystatechange = function (e) {
          if (tag.readyState === 'loaded' || tag.readyState === 'complete') {
            tag.onreadystatechange = null;
            eventListener(e);
          }
        };
      } else if (tag.addEventListener) {
        tag.addEventListener('load', eventListener, false);
      } else if (tag.attachEvent) {
        tag.attachEvent('load', eventListener);
      }
    }

    // Use insertBefore instead of appendChild to circumvent an IE6 bug.
    if(head.firstChild) {
      head.insertBefore(tag, head.firstChild);
    } else {
      head.appendChild(tag);
    }

    return function() {
      head.removeChild(tag);
    };
  }

  function isFunction(value) {
    return typeof value === 'function';
  }

  function isString(value) {
    return typeof value === 'string';
  }

  function isElement(value) {
    return value && value.nodeType === ELEMENT_NODE_TYPE || false;
  }

  function isScriptTag(elem) {
    return isElement(elem) && nodeNameEquals(elem, 'script');
  }

  function nodeNameEquals(elem, name) {
    return isElement(elem) && elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
  }

  function loadOrEvalScriptTag(scriptTag, onLoad) {
    if (canLoadScriptTag(scriptTag)) {
      loadScript(scriptTag.src, onLoad);
    } else if (canEvalScriptTag(scriptTag)) {
      evalScript(getElementContent(scriptTag), onLoad);
    }

    // if (scriptTag.parentNode) {
    //   scriptTag.parentNode.removeChild(scriptTag);
    // }
  }

  function canLoadScriptTag(scriptTag) {
    return isScriptTag(scriptTag) && isString(scriptTag.src) && scriptTag.src;
  }

  function canEvalScriptTag(scriptTag) {
    return isScriptTag(scriptTag) && getElementContent(scriptTag) !== '';
  }

  function getElementContent(elem) {
    return isElement(elem) ? elem.text || elem.textContent || elem.innerHTML || '' : '';
  }

  /*--------------------------------------------------------------------------*/


  function looksLikeAnUrl(testUrl) {
    return isString(testUrl) && /^(https?:\/\/|\/\/)[^ \t\r\n\v\f]+\.[^ \t\r\n\v\f]+$/.test(testUrl);
  }

  function getAnyNestedScriptTagsOfElement(elem) {
    if (isScriptTag(elem)) {
      return [elem];
    }

    var array = [];
    if (isElement(elem) && elem.childNodes.length > 0) {
      var nestedScriptTags = elem.getElementsByTagName('script');
      // iterate backwards ensuring that length is an UInt32
      for (var j = 0, n = nestedScriptTags.length >>> 0; j < n; j++) {
        var maybeScriptTag = nestedScriptTags[j];
        if (isScriptTag(maybeScriptTag)) {
          array.push(maybeScriptTag);
          // array.push(maybeScriptTag.parentNode ?
          // maybeScriptTag.parentNode.removeChild(maybeScriptTag) : maybeScriptTag);
        }
      }
    }
    return array;
  }

  function Lodamoi(scripts) {
    if (!(this instanceof Lodamoi)) {
      return new Lodamoi(scripts);
    }

    this._scripts = scripts || [];
  }

  Lodamoi._addElementToDom = addElementToDom;
  Lodamoi._evalScript = evalScript;
  Lodamoi._loadScript = loadScript;

  Lodamoi.prototype = {
    load: function (callback) {
      var callbackOrNoop = isFunction(callback) ? callback : NOOP;
      if (this._scripts.length === 0) {
        callbackOrNoop();
        return;
      }

      var scriptsLength = this._scripts.length;
      var context = {
        loadCount: 0,
        totalRequired: scriptsLength,
        onLoad: function () {
          this.loadCount++;
          if (this.loadCount === this.totalRequired) {
            callbackOrNoop();
          }
        }
      };

      var onLoad = function (e) {
        context.onLoad(e);
      };

      for (var i = 0; i < scriptsLength; i++) {
        var sourceOrUrlOrScriptTag = this._scripts[i];

        if (isElement(sourceOrUrlOrScriptTag)) {
          var elementTag = sourceOrUrlOrScriptTag;
          if (isScriptTag(elementTag)) {
            loadOrEvalScriptTag(elementTag, onLoad);
          } else {
            new Lodamoi(getAnyNestedScriptTagsOfElement(elementTag)).load(onLoad);
          }
        }
        else if (looksLikeAnUrl(sourceOrUrlOrScriptTag)) {
          var url = sourceOrUrlOrScriptTag;
          loadScript(url, onLoad);
        }
        else if (isString(sourceOrUrlOrScriptTag)) {
          var source = sourceOrUrlOrScriptTag;
          evalScript(source, onLoad);
        }
        else {
          onLoad();
        }
      }
    }
  };

  return Lodamoi;
});
