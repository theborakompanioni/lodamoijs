/*! { "name": "lodamoijs", "version": "0.3.2", "homepage": "https://github.com/theborakompanioni/lodamoijs","copyright": "(c) 2015 theborakompanioni" } */
!function(window, factory) {
    "use strict";
    window.Lodamoi = factory(window.document);
}(this, function(document) {
    "use strict";
    function evalScript(stringJavascriptSource, onLoad) {
        var script = document.createElement(SCRIPT_TAG_NAME);
        script.type = SCRIPT_TAG_TYPE;
        try {
            var sourceAsTextNode = document.createTextNode(stringJavascriptSource);
            script.appendChild(sourceAsTextNode);
        } catch (e) {
            script.text = stringJavascriptSource;
        }
        var removeElementFromDom = addElementToDom(script), onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
        window.setTimeout(function() {
            onLoadOrNoop(), removeElementFromDom();
        }, 1);
    }
    function loadScriptFromUrl(scriptSrc, onLoad, options) {
        var script = document.createElement(SCRIPT_TAG_NAME);
        script.type = SCRIPT_TAG_TYPE, script.defer = script.async = options ? !!options.async : !1, 
        script.src = scriptSrc;
        var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP, removeElementFromDom = addElementToDom(script, function(e) {
            onLoadOrNoop(e), removeElementFromDom();
        });
    }
    function addElementToDom(tag, onLoad) {
        if (!isElement(tag)) return NOOP;
        var head = document.getElementsByTagName("head")[0] || document.documentElement;
        if (isFunction(onLoad)) {
            var eventListener = function(e) {
                onLoad(e);
            };
            tag.readyState ? tag.onreadystatechange = function(e) {
                ("loaded" === tag.readyState || "complete" === tag.readyState) && (tag.onreadystatechange = null, 
                eventListener(e));
            } : tag.addEventListener ? tag.addEventListener("load", eventListener, !1) : tag.attachEvent && tag.attachEvent("load", eventListener);
        }
        return head.firstChild ? head.insertBefore(tag, head.firstChild) : head.appendChild(tag), 
        function() {
            head.removeChild(tag);
        };
    }
    function isFunction(value) {
        return "function" == typeof value || !1;
    }
    function isArray(value) {
        return value && "object" == typeof value && "number" == typeof value.length && "[object Array]" === Object.prototype.toString.call(value) || !1;
    }
    function isString(value) {
        return "string" == typeof value;
    }
    function isElement(value) {
        return value && value.nodeType === ELEMENT_NODE_TYPE || !1;
    }
    function isScriptTag(elem) {
        return isElement(elem) && nodeNameEquals(elem, SCRIPT_TAG_NAME);
    }
    function nodeNameEquals(elem, name) {
        return isElement(elem) && elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
    }
    function canLoadScriptTag(scriptTag) {
        return isScriptTag(scriptTag) && isString(scriptTag.src) && scriptTag.src;
    }
    function canEvalScriptTag(scriptTag) {
        return isScriptTag(scriptTag) && "" !== getElementContent(scriptTag);
    }
    function getElementContent(elem) {
        return isElement(elem) ? elem.text || elem.textContent || elem.innerHTML || "" : "";
    }
    function throwIllegalArgumentError(message) {
        throw new Error("Illegal argument" + (message ? ": " + message : "."));
    }
    function looksLikeAnUrl(testUrl) {
        return isString(testUrl) && /^(https?:\/\/|\/\/)[^ \t\r\n\v\f]+\.[^ \t\r\n\v\f]+$/.test(testUrl);
    }
    function getAnyNestedScriptTagsOfElement(elem) {
        if (isScriptTag(elem)) return [ elem ];
        var array = [];
        if (isElement(elem) && elem.childNodes.length > 0) for (var nestedScriptTags = elem.getElementsByTagName(SCRIPT_TAG_NAME), j = 0, n = nestedScriptTags.length >>> 0; n > j; j++) {
            var maybeScriptTag = nestedScriptTags[j];
            isScriptTag(maybeScriptTag) && array.push(maybeScriptTag);
        }
        return array;
    }
    function LodCode(code) {
        code && isString(code) || throwIllegalArgumentError(), this._val = code;
    }
    function LodUrl(url) {
        url || throwIllegalArgumentError(), this._val = url, this._async = !1;
    }
    function LodTag(tag) {
        tag && isElement(tag) || throwIllegalArgumentError(), this._val = tag, this._async = !!tag.async;
    }
    function Lodamoi(values) {
        return this instanceof Lodamoi ? (values || throwIllegalArgumentError(), void (this._values = isArray(values) ? values : [ values ])) : new Lodamoi(values);
    }
    var ELEMENT_NODE_TYPE = 1, SCRIPT_TAG_NAME = "script", SCRIPT_TAG_TYPE = "text/javascript", NOOP = function() {};
    return LodCode.prototype = {
        async: function() {
            return this;
        },
        load: function(onLoad) {
            var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
            evalScript(this._val, onLoadOrNoop);
        }
    }, LodUrl.prototype = {
        async: function() {
            return this._async = !0, this;
        },
        load: function(onLoad) {
            var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
            loadScriptFromUrl(this._val, onLoadOrNoop, {
                async: this._async
            });
        }
    }, LodTag.prototype = {
        async: function() {
            return this._async = !0, this;
        },
        load: function(onLoad) {
            var onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP, elementTag = this._val;
            isScriptTag(elementTag) ? canLoadScriptTag(elementTag) ? loadScriptFromUrl(elementTag.src, onLoadOrNoop, {
                async: this._async
            }) : canEvalScriptTag(elementTag) && evalScript(getElementContent(elementTag), onLoadOrNoop) : new Lodamoi(getAnyNestedScriptTagsOfElement(elementTag)).load(onLoadOrNoop);
        }
    }, Lodamoi._addElementToDom = addElementToDom, Lodamoi.code = function(code) {
        return new LodCode(code);
    }, Lodamoi.url = function(url) {
        return new LodUrl(url);
    }, Lodamoi.tag = function(tag) {
        return new LodTag(tag);
    }, Lodamoi.prototype = {
        load: function(callback) {
            var callbackOrNoop = isFunction(callback) ? callback : NOOP;
            if (0 === this._values.length) return void callbackOrNoop();
            for (var valuesCount = this._values.length, context = {
                loadCount: 0,
                totalRequired: valuesCount,
                onLoad: function() {
                    this.loadCount++, this.loadCount === this.totalRequired && callbackOrNoop();
                }
            }, onLoad = function(e) {
                context.onLoad(e);
            }, i = 0; valuesCount > i; i++) {
                var value = this._values[i];
                isElement(value) ? Lodamoi.tag(value).load(onLoad) : looksLikeAnUrl(value) ? Lodamoi.url(value).load(onLoad) : isString(value) ? Lodamoi.code(value).load(onLoad) : onLoad();
            }
        }
    }, Lodamoi;
});