/*! { "name": "lodamoijs", "version": "0.1.1", "homepage": "https://github.com/theborakompanioni/lodamoijs","copyright": "(c) 2015 theborakompanioni" } */
!function(window, factory) {
    "use strict";
    window.Lodamoi = factory(window.document);
}(this, function(document) {
    "use strict";
    function evalScript(stringJavascriptSource, onLoad) {
        var script = document.createElement("script"), sourceAsTextNode = document.createTextNode(stringJavascriptSource);
        script.type = "text/javascript", script.appendChild(sourceAsTextNode);
        var removeElementFromDom = addElementToDom(script), onLoadOrNoop = isFunction(onLoad) ? onLoad : NOOP;
        window.setTimeout(function() {
            onLoadOrNoop(), removeElementFromDom();
        }, 1);
    }
    function loadScript(scriptSrc, onLoad) {
        var script = document.createElement("script");
        script.type = "text/javascript", script.src = scriptSrc;
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
        return "function" == typeof value;
    }
    function isString(value) {
        return "string" == typeof value;
    }
    function isElement(value) {
        return value && value.nodeType === ELEMENT_NODE_TYPE || !1;
    }
    function isScriptTag(elem) {
        return isElement(elem) && nodeNameEquals(elem, "script");
    }
    function nodeNameEquals(elem, name) {
        return isElement(elem) && elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
    }
    function loadOrEvalScriptTag(scriptTag, onLoad) {
        canLoadScriptTag(scriptTag) ? loadScript(scriptTag.src, onLoad) : canEvalScriptTag(scriptTag) && evalScript(getElementContent(scriptTag), onLoad);
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
    function looksLikeAnUrl(testUrl) {
        return isString(testUrl) && /^(https?:\/\/|\/\/)[^ \t\r\n\v\f]+\.[^ \t\r\n\v\f]+$/.test(testUrl);
    }
    function getAnyNestedScriptTagsOfElement(elem) {
        if (isScriptTag(elem)) return [ elem ];
        var array = [];
        if (isElement(elem) && elem.childNodes.length > 0) for (var nestedScriptTags = elem.getElementsByTagName("script"), j = 0, n = nestedScriptTags.length >>> 0; n > j; j++) {
            var maybeScriptTag = nestedScriptTags[j];
            isScriptTag(maybeScriptTag) && array.push(maybeScriptTag);
        }
        return array;
    }
    function Lodamoi(scripts) {
        return this instanceof Lodamoi ? void (this._scripts = scripts || []) : new Lodamoi(scripts);
    }
    var ELEMENT_NODE_TYPE = 1, NOOP = function() {};
    return Lodamoi._addElementToDom = addElementToDom, Lodamoi._evalScript = evalScript, 
    Lodamoi._loadScript = loadScript, Lodamoi.prototype = {
        load: function(callback) {
            var callbackOrNoop = isFunction(callback) ? callback : NOOP;
            if (0 === this._scripts.length) return void callbackOrNoop();
            for (var scriptsLength = this._scripts.length, context = {
                loadCount: 0,
                totalRequired: scriptsLength,
                onLoad: function() {
                    this.loadCount++, this.loadCount === this.totalRequired && callbackOrNoop();
                }
            }, onLoad = function(e) {
                context.onLoad(e);
            }, i = 0; scriptsLength > i; i++) {
                var sourceOrUrlOrScriptTag = this._scripts[i];
                if (isElement(sourceOrUrlOrScriptTag)) {
                    var elementTag = sourceOrUrlOrScriptTag;
                    isScriptTag(elementTag) ? loadOrEvalScriptTag(elementTag, onLoad) : new Lodamoi(getAnyNestedScriptTagsOfElement(elementTag)).load(onLoad);
                } else if (looksLikeAnUrl(sourceOrUrlOrScriptTag)) {
                    var url = sourceOrUrlOrScriptTag;
                    loadScript(url, onLoad);
                } else if (isString(sourceOrUrlOrScriptTag)) {
                    var source = sourceOrUrlOrScriptTag;
                    evalScript(source, onLoad);
                } else onLoad();
            }
        }
    }, Lodamoi;
});