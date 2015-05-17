/*jshint bitwise: false*/
(function (window, factory) {
  'use strict';
  window.Lodamoi = factory(window.document);
})(this, function (document, undefined) {
  'use strict';
  var ELEMENT_NODE_TYPE = 1;
  var SCRIPT_TAG_NAME = 'script';
  var SCRIPT_TAG_TYPE = 'text/javascript';
  var NOOP = function () {
  };

  function evalScript(stringJavascriptSource, onLoad) {
    var script = document.createElement(SCRIPT_TAG_NAME);
    var sourceAsTextNode = document.createTextNode(stringJavascriptSource);

    script.type = SCRIPT_TAG_TYPE;
    script.appendChild(sourceAsTextNode);

    var removeElementFromDom = addElementToDom(script);

    var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
    window.setTimeout(function() {
      onLoadOrNoop();
      removeElementFromDom();
    }, 1);
  }

  function loadScriptFromUrl(scriptSrc, onLoad, options) {
    var script = document.createElement(SCRIPT_TAG_NAME);
    script.type = SCRIPT_TAG_TYPE;
    script.defer = script.async = options ? !!options.async : false;
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

  /**
  * From lodash: [isFunction](https://lodash.com/docs#isFunction)
  */
  function isFunction(value) {
    return typeof value === 'function' || false;
  }

  /**
  * From lodash: [isArray](https://lodash.com/docs#isArray)
  */
  function isArray(value) {
    return (value &&
      typeof value === 'object' && typeof value.length === 'number' &&
      Object.prototype.toString.call(value) === '[object Array]') || false;
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

  function canLoadScriptTag(scriptTag) {
    return isScriptTag(scriptTag) && isString(scriptTag.src) && scriptTag.src;
  }

  function canEvalScriptTag(scriptTag) {
    return isScriptTag(scriptTag) && getElementContent(scriptTag) !== '';
  }

  function getElementContent(elem) {
    return isElement(elem) ? elem.text || elem.textContent || elem.innerHTML || '' : '';
  }

  function throwIllegalArgumentError(message) {
    throw new Error('Illegal argument' + (message ? ': ' + message : '.'));
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
      for (var j = 0, n = nestedScriptTags.length >>> 0; j < n; j++) {
        var maybeScriptTag = nestedScriptTags[j];
        if (isScriptTag(maybeScriptTag)) {
          array.push(maybeScriptTag);
        }
      }
    }
    return array;
  }

  function LodCode(code) {
    if (!(this instanceof LodCode)) {
      return new LodCode(code);
    }
    if (!code || !isString(code)) {
      throwIllegalArgumentError();
    }
    this._val = code;
  }
  LodCode.prototype = {
    async: function() {
      return this;
    },
    load: function (onLoad) {
      var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
      evalScript(this._val, onLoadOrNoop);
    }
  };

  function LodUrl(url) {
    if (!(this instanceof LodUrl)) {
      return new LodUrl(url);
    }
    if (!url) {
      throwIllegalArgumentError();
    }
    this._val = url;
    this._async = false;
  }
  LodUrl.prototype = {
    async: function() {
      this._async = true;
      return this;
    },
    load: function (onLoad) {
      var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
      loadScriptFromUrl(this._val, onLoadOrNoop, { async: this._async });
    }
  };

  function LodTag(tag) {
    if (!(this instanceof LodTag)) {
      return new LodTag(tag);
    }
    if (!tag || !isElement(tag)) {
      throwIllegalArgumentError();
    }
    this._val = tag;
    this._async = !!tag.async;
  }
  LodTag.prototype = {
    async: function() {
      this._async = true;
      return this;
    },
    load: function (onLoad) {
      var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;

      var elementTag = this._val;
      if (!isScriptTag(elementTag)) {
        new Lodamoi(getAnyNestedScriptTagsOfElement(elementTag)).load(onLoadOrNoop);
      } else {
        if (canLoadScriptTag(elementTag)) {
          loadScriptFromUrl(elementTag.src, onLoadOrNoop, { async: this._async });
        } else if (canEvalScriptTag(elementTag)) {
          evalScript(getElementContent(elementTag), onLoadOrNoop);
        }
      }
    }
  };

  function Lodamoi(values) {
    if (!(this instanceof Lodamoi)) {
      return new Lodamoi(values);
    }
    if (!values) {
      throwIllegalArgumentError();
    }

    this._values = isArray(values) ? values : [values];
  }

  Lodamoi._addElementToDom = addElementToDom;

  Lodamoi.code = function(code) {
    return new LodCode(code);
  };
  Lodamoi.url = function(url) {
    return new LodUrl(url);
  };
  Lodamoi.tag = function(tag) {
    return new LodTag(tag);
  };

  Lodamoi.prototype = {
    load: function (callback) {
      var callbackOrNoop = isFunction(callback) ? callback : NOOP;
      if (this._values.length === 0) {
        callbackOrNoop();
        return;
      }

      var valuesCount = this._values.length;
      var context = {
        loadCount: 0,
        totalRequired: valuesCount,
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

      for (var i = 0; i < valuesCount; i++) {
        var value = this._values[i];

        if (isElement(value)) {
          Lodamoi.tag(value).load(onLoad);
        }
        else if (looksLikeAnUrl(value)) {
          Lodamoi.url(value).load(onLoad);
        }
        else if (isString(value)) {
          Lodamoi.code(value).load(onLoad);
        }
        else {
          onLoad();
        }
      }
    }
  };

  return Lodamoi;
});
