/* @preserve
 * QMap 3DEngine for Chrome 1.0.0, a JS library for 3dmaps. http://www.q-map.com.cn
 * (c) 2010-2019 
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Q3D = {}));
}(this, (function (exports) { 'use strict';

  var version = "1.0.0";

  /*
   * @namespace Util
   *
   * Various utility functions, used by Q3D internally.
   */

  var freeze = Object.freeze;
  Object.freeze = function (obj) {
      return obj;
  };

  // @function extend(dest: Object, src?: Object): Object
  // Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `Q3D.extend` shortcut.
  function extend(dest) {
      var i, j, len, src;

      for (j = 1, len = arguments.length; j < len; j++) {
          src = arguments[j];
          for (i in src) {
              dest[i] = src[i];
          }
      }
      return dest;
  }

  // @function create(proto: Object, properties?: Object): Object
  // Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
  var create = Object.create || (function () {
      function F() {}
      return function (proto) {
          F.prototype = proto;
          return new F();
      };
  })();

  // @function bind(fn: Function, …): Function
  // Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
  // Has a `Q3D.bind()` shortcut.
  function bind(fn, obj) {
      var slice = Array.prototype.slice;

      if (fn.bind) {
          return fn.bind.apply(fn, slice.call(arguments, 1));
      }

      var args = slice.call(arguments, 2);

      return function () {
          return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
      };
  }

  // @property lastId: Number
  // Last unique ID used by [`stamp()`](#util-stamp)
  var lastId = 0;

  // @function stamp(obj: Object): Number
  // Returns the unique ID of an object, assigning it one if it doesn't have it.
  function stamp(obj) {
      /*eslint-disable */
      obj._q3d_id = obj._q3d_id || ++lastId;
      return obj._q3d_id;
      /* eslint-enable */
  }

  // @function throttle(fn: Function, time: Number, context: Object): Function
  // Returns a function which executes function `fn` with the given scope `context`
  // (so that the `this` keyword refers to `context` inside `fn`'s code). The function
  // `fn` will be called no more than one time per given amount of `time`. The arguments
  // received by the bound function will be any arguments passed when binding the
  // function, followed by any arguments passed when invoking the bound function.
  // Has an `L.throttle` shortcut.
  function throttle(fn, time, context) {
      var lock, args, wrapperFn, later;

      later = function () {
          // reset lock and call if queued
          lock = false;
          if (args) {
              wrapperFn.apply(context, args);
              args = false;
          }
      };

      wrapperFn = function () {
          if (lock) {
              // called too soon, queue to call later
              args = arguments;

          } else {
              // call and lock until later
              fn.apply(context, arguments);
              setTimeout(later, time);
              lock = true;
          }
      };

      return wrapperFn;
  }

  // @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
  // Returns the number `num` modulo `range` in such a way so it lies within
  // `range[0]` and `range[1]`. The returned value will be always smaller than
  // `range[1]` unless `includeMax` is set to `true`.
  function wrapNum(x, range, includeMax) {
      var max = range[1],
          min = range[0],
          d = max - min;
      return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
  }

  // @function falseFn(): Function
  // Returns a function which always returns `false`.
  function falseFn() {
      return false;
  }

  // @function formatNum(num: Number, digits?: Number): Number
  // Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
  function formatNum(num, digits) {
      var pow = Math.pow(10, (digits === undefined ? 6 : digits));
      return Math.round(num * pow) / pow;
  }

  // @function trim(str: String): String
  // Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
  function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  }

  // @function splitWords(str: String): String[]
  // Trims and splits the string on whitespace and returns the array of parts.
  function splitWords(str) {
      return trim(str).split(/\s+/);
  }

  // @function setOptions(obj: Object, options: Object): Object
  // Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
  function setOptions(obj, options) {
      if (!obj.hasOwnProperty('options')) {
          obj.options = obj.options ? create(obj.options) : {};
      }
      for (var i in options) {
          obj.options[i] = options[i];
      }
      return obj.options;
  }

  function updateOptions(obj, options) {

      for (var i in options) {
          obj[i] = options[i];
      }
      return obj;
  }

  //模仿jquery的$.extend实现浅/深度拷贝
  function jQueryExtend() {
      // 为与源码的下标对应上，我们把第一个参数称为`第0个参数`，依次类推
      var options, name, src, copy,
          target = arguments[0] || {}, // 默认第0个参数为目标参数
          i = 1, // i表示从第几个参数凯斯想目标参数进行合并，默认从第1个参数开始向第0个参数进行合并
          length = arguments.length,
          deep = false; // 默认为浅度拷贝

      // 判断第0个参数的类型，若第0个参数是boolean类型，则获取其为true还是false
      // 同时将第1个参数作为目标参数，i从当前目标参数的下一个
      // Handle a deep copy situation
      if (typeof target === "boolean") {
          deep = target;
          // Skip the boolean and the target
          target = arguments[i] || {};
          i++;
      }

      //  判断目标参数的类型，若目标参数既不是object类型，也不是function类型，则为目标参数重新赋值 
      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== "object" && !isFunction(target)) {
          target = {};
      }

      // 若目标参数后面没有参数了，如$.extend({_name:'wenzi'}), $.extend(true, {_name:'wenzi'})
      // 则目标参数即为jQuery本身，而target表示的参数不再为目标参数
      // Extend jQuery itself if only one argument is passed
      if (i === length) {
          target = this;
          i--;
      }

      // 从第i个参数开始
      for (; i < length; i++) {
          // 获取第i个参数，且该参数不为null，
          // 比如$.extend(target, {}, null);中的第2个参数null是不参与合并的
          // Only deal with non-null/undefined values
          if ((options = arguments[i]) != null) {

              // 使用for~in获取该参数中所有的字段
              // Extend the base object
              for (name in options) {
                  src = target[name]; // 目标参数中name字段的值
                  copy = options[name]; // 当前参数中name字段的值

                  // 若参数中字段的值就是目标参数，停止赋值，进行下一个字段的赋值
                  // 这是为了防止无限的循环嵌套，我们把这个称为，在下面进行比较详细的讲解
                  // Prevent never-ending loop
                  if (target === copy) {
                      continue;
                  }

                  // 若deep为true，且当前参数中name字段的值存在且为object类型或Array类型，则进行深度赋值
                  // Recurse if we're merging plain objects or arrays
                  //if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
                  if (deep && copy && typeof copy == "object" && !copy.nodeType) {

                      // 若当前参数中name字段的值为Array类型
                      // 判断目标参数中name字段的值是否存在，若存在则使用原来的，否则进行初始化
                      if (isArray(copy)) {
                          //clone = src && this.isArray(src) ? src : [];
                          target[name] = copy.concat();
                      } else if (isQMapObj(copy)) {
                          target[name] = copy;
                      } else {
                          // 若原对象存在，则直接进行使用，而不是创建
                          //clone = src && this.isPlainObject(src) ? src : {};
                          //进行深拷贝
                          target[name] = jQueryExtend(deep, (src || {}), copy);
                      }

                      // 递归处理，此处为2.2
                      // Never move original objects, clone them                      
                      //target[ name ] = this.jQueryExtend( deep, clone, copy );                           

                      // deep为false，则表示浅度拷贝，直接进行赋值
                      // 若copy是简单的类型且存在值，则直接进行赋值
                      // Don't bring in undefined values
                  } else if (copy !== undefined) {
                      // 若原对象存在name属性，则直接覆盖掉；若不存在，则创建新的属性
                      target[name] = copy;
                  }
              }
          }
      }

      // 返回修改后的目标参数
      // Return the modified object
      return target;
  }

  // @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
  // Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
  // translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
  // be appended at the end. If `uppercase` is `true`, the parameter names will
  // be uppercased (e.g. `'?A=foo&B=bar'`)
  function getParamString(obj, existingUrl, uppercase) {
      var params = [];
      for (var i in obj) {
          params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
      }
      return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
  }

  var templateRe = /\{ *([\w_-]+) *\}/g;

  // @function template(str: String, data: Object): String
  // Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
  // and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
  // `('Hello foo, bar')`. You can also specify functions instead of strings for
  // data values — they will be evaluated passing `data` as an argument.
  function template(str, data) {
      return str.replace(templateRe, function (str, key) {
          var value = data[key];

          if (value === undefined) {
              throw new Error('No value provided for variable ' + str);

          } else if (typeof value === 'function') {
              value = value(data);
          }
          return value;
      });
  }

  // @function isArray(obj): Boolean
  // Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
  var isArray = Array.isArray || function (obj) {
      return (Object.prototype.toString.call(obj) === '[object Array]');
  };

  // @function isFunction(obj): Boolean
  // 判断对象是否函数类型    
  var isFunction = function (obj) {
      return typeof obj === "function";
  };
  // @function isNumber(obj): Boolean
  // 判断对象是否可转化为数值类型
  var isNumber = function (obj) {
      return typeof obj === 'number' && isFinite(obj);
  };
  // @function isInteger(obj): Boolean
  // 判断对象是否整数类型
  var isInteger = function (obj) {
      return typeof obj === 'number' && obj % 1 === 0;
  };

  var isSameFunction = function (a, b) {
      return (typeof a == "function" && typeof b == "function" && a.toString() == b.toString());
  };

  var isQMapObj = function (obj, clsID) {
      try {
          if (typeof obj.getCLSID() == "string") {
              if (clsID === undefined)
                  return true;
              if (typeof (clsID) == "string" && obj.getCLSID() == clsID)
                  return true;
              else
                  return false;
          }
      } catch (e) {}
      return false;
  };

  // @function indexOf(array: Array, el: Object): Number
  // Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
  function indexOf(array, el) {
      for (var i = 0; i < array.length; i++) {
          if (array[i] === el) {
              return i;
          }
      }
      return -1;
  }


  // @property emptyImageUrl: String
  // Data URI string containing a base64-encoded empty GIF image.
  // Used as a hack to free memory from unused images on WebKit-powered
  // mobile devices (by setting image `src` to this string).
  var emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  // inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

  function getPrefixed(name) {
      return window['webkit' + name] || window['moz' + name] || window['ms' + name];
  }

  var lastTime = 0;

  // fallback for IE 7-8
  function timeoutDefer(fn) {
      var time = +new Date(),
          timeToCall = Math.max(0, 16 - (time - lastTime));

      lastTime = time + timeToCall;
      return window.setTimeout(fn, timeToCall);
  }

  var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
  var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
      getPrefixed('CancelRequestAnimationFrame') || function (id) {
          window.clearTimeout(id);
      };

  // @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
  // Schedules `fn` to be executed when the browser repaints. `fn` is bound to
  // `context` if given. When `immediate` is set, `fn` is called immediately if
  // the browser doesn't have native support for
  // [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
  // otherwise it's delayed. Returns a request ID that can be used to cancel the request.
  function requestAnimFrame(fn, context, immediate) {
      if (immediate && requestFn === timeoutDefer) {
          fn.call(context);
      } else {
          return requestFn.call(window, bind(fn, context));
      }
  }

  // @function cancelAnimFrame(id: Number): undefined
  // Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
  function cancelAnimFrame(id) {
      if (id) {
          cancelFn.call(window, id);
      }
  }

  var Util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    freeze: freeze,
    extend: extend,
    create: create,
    bind: bind,
    get lastId () { return lastId; },
    stamp: stamp,
    throttle: throttle,
    wrapNum: wrapNum,
    falseFn: falseFn,
    formatNum: formatNum,
    trim: trim,
    splitWords: splitWords,
    setOptions: setOptions,
    updateOptions: updateOptions,
    jQueryExtend: jQueryExtend,
    getParamString: getParamString,
    template: template,
    isArray: isArray,
    isFunction: isFunction,
    isNumber: isNumber,
    isInteger: isInteger,
    isSameFunction: isSameFunction,
    isQMapObj: isQMapObj,
    indexOf: indexOf,
    emptyImageUrl: emptyImageUrl,
    requestFn: requestFn,
    cancelFn: cancelFn,
    requestAnimFrame: requestAnimFrame,
    cancelAnimFrame: cancelAnimFrame
  });

  /*
   * @namespace Browser
   * @aka Q3D.Browser
   *
   * A namespace with static properties for browser/feature detection used by Leaflet internally.
   *
   * @example
   *
   * ```js
   * if (Q3D.Browser.ielt9) {
   *   alert('Upgrade your browser, dude!');
   * }
   * ```
   */

  var style = document.documentElement.style;

  // @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
  var ie = 'ActiveXObject' in window;

  // @property ielt9: Boolean; `true` for Internet Explorer versions less than 9.
  var ielt9 = ie && !document.addEventListener;

  // @property edge: Boolean; `true` for the Edge web browser.
  var edge = 'msLaunchUri' in navigator && !('documentMode' in document);

  // @property webkit: Boolean;
  // `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
  var webkit = userAgentContains('webkit');

  // @property android: Boolean
  // `true` for any browser running on an Android platform.
  var android = userAgentContains('android');

  // @property android23: Boolean; `true` for browsers running on Android 2 or Android 3.
  var android23 = userAgentContains('android 2') || userAgentContains('android 3');

  /* See https://stackoverflow.com/a/17961266 for details on detecting stock Android */
  var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10); // also matches AppleWebKit
  // @property androidStock: Boolean; `true` for the Android stock browser (i.e. not Chrome)
  var androidStock = android && userAgentContains('Google') && webkitVer < 537 && !('AudioNode' in window);

  // @property opera: Boolean; `true` for the Opera browser
  var opera = !!window.opera;

  // @property chrome: Boolean; `true` for the Chrome browser.
  var chrome = userAgentContains('chrome');

  // @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
  var gecko = userAgentContains('gecko') && !webkit && !opera && !ie;

  // @property safari: Boolean; `true` for the Safari browser.
  var safari = !chrome && userAgentContains('safari');

  var phantom = userAgentContains('phantom');

  // @property opera12: Boolean
  // `true` for the Opera browser supporting CSS transforms (version 12 or later).
  var opera12 = 'OTransition' in style;

  // @property win: Boolean; `true` when the browser is running in a Windows platform
  var win = navigator.platform.indexOf('Win') === 0;

  // @property ie3d: Boolean; `true` for all Internet Explorer versions supporting CSS transforms.
  var ie3d = ie && ('transition' in style);

  // @property webkit3d: Boolean; `true` for webkit-based browsers supporting CSS transforms.
  var webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23;

  // @property gecko3d: Boolean; `true` for gecko-based browsers supporting CSS transforms.
  var gecko3d = 'MozPerspective' in style;

  // @property any3d: Boolean
  // `true` for all browsers supporting CSS transforms.
  var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;

  // @property mobile: Boolean; `true` for all browsers running in a mobile device.
  var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

  // @property mobileWebkit: Boolean; `true` for all webkit-based browsers in a mobile device.
  var mobileWebkit = mobile && webkit;

  // @property mobileWebkit3d: Boolean
  // `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
  var mobileWebkit3d = mobile && webkit3d;

  // @property msPointer: Boolean
  // `true` for browsers implementing the Microsoft touch events model (notably IE10).
  var msPointer = !window.PointerEvent && window.MSPointerEvent;

  // @property pointer: Boolean
  // `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
  var pointer = !!(window.PointerEvent || msPointer);

  // @property touch: Boolean
  // `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
  // This does not necessarily mean that the browser is running in a computer with
  // a touchscreen, it only means that the browser is capable of understanding
  // touch events.
  var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
  	(window.DocumentTouch && document instanceof window.DocumentTouch));

  // @property mobileOpera: Boolean; `true` for the Opera browser in a mobile device.
  var mobileOpera = mobile && opera;

  // @property mobileGecko: Boolean
  // `true` for gecko-based browsers running in a mobile device.
  var mobileGecko = mobile && gecko;

  // @property retina: Boolean
  // `true` for browsers on a high-resolution "retina" screen or on any screen when browser's display zoom is more than 100%.
  var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;

  // @property passiveEvents: Boolean
  // `true` for browsers that support passive events.
  var passiveEvents = (function () {
  	var supportsPassiveOption = false;
  	try {
  		var opts = Object.defineProperty({}, 'passive', {
  			get: function () {
  				supportsPassiveOption = true;
  			}
  		});
  		window.addEventListener('testPassiveEventSupport', falseFn, opts);
  		window.removeEventListener('testPassiveEventSupport', falseFn, opts);
  	} catch (e) {
  		// Errors can safely be ignored since this is only a browser support test.
  	}
  	return supportsPassiveOption;
  });

  // @property canvas: Boolean
  // `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
  var canvas = (function () {
  	return !!document.createElement('canvas').getContext;
  }());

  // @property svg: Boolean
  // `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
  // export var svg = !!(document.createElementNS && svgCreate('svg').createSVGRect);

  // @property vml: Boolean
  // `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
  /*
  export var vml = !svg && (function () {
  	try {
  		var div = document.createElement('div');
  		div.innerHTML = '<v:shape adj="1"/>';

  		var shape = div.firstChild;
  		shape.style.behavior = 'url(#default#VML)';

  		return shape && (typeof shape.adj === 'object');

  	} catch (e) {
  		return false;
  	}
  }());
  */

  function userAgentContains(str) {
  	return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
  }

  var Browser = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ie: ie,
    ielt9: ielt9,
    edge: edge,
    webkit: webkit,
    android: android,
    android23: android23,
    androidStock: androidStock,
    opera: opera,
    chrome: chrome,
    gecko: gecko,
    safari: safari,
    phantom: phantom,
    opera12: opera12,
    win: win,
    ie3d: ie3d,
    webkit3d: webkit3d,
    gecko3d: gecko3d,
    any3d: any3d,
    mobile: mobile,
    mobileWebkit: mobileWebkit,
    mobileWebkit3d: mobileWebkit3d,
    msPointer: msPointer,
    pointer: pointer,
    touch: touch,
    mobileOpera: mobileOpera,
    mobileGecko: mobileGecko,
    retina: retina,
    passiveEvents: passiveEvents,
    canvas: canvas
  });

  // @class Class
  // @aka Q3D.Class

  // @section
  // @uninheritable

  // Thanks to John Resig and Dean Edwards for inspiration!

  function Class() {}

  Class.extend = function (props) {

  	// @function extend(props: Object): Function
  	// [Extends the current class](#class-inheritance) given the properties to be included.
  	// Returns a Javascript function that is a class constructor (to be called with `new`).
  	var NewClass = function () {

  		// call the constructor
  		if (this.initialize) {
  			this.initialize.apply(this, arguments);
  		}

  		// call all constructor hooks
  		this.callInitHooks();
  	};

  	var parentProto = NewClass.__super__ = this.prototype;

  	var proto = create(parentProto);
  	proto.constructor = NewClass;

  	NewClass.prototype = proto;

  	// inherit parent's statics
  	for (var i in this) {
  		if (this.hasOwnProperty(i) && i !== 'prototype' && i !== '__super__') {
  			NewClass[i] = this[i];
  		}
  	}

  	// mix static properties into the class
  	if (props.statics) {
  		extend(NewClass, props.statics);
  		delete props.statics;
  	}

  	// mix includes into the prototype
  	if (props.includes) {
  		checkDeprecatedMixinEvents(props.includes);
  		extend.apply(null, [proto].concat(props.includes));
  		delete props.includes;
  	}

  	// merge options
  	if (proto.options) {
  		props.options = extend(create(proto.options), props.options);
  	}

  	// mix given properties into the prototype
  	extend(proto, props);

  	proto._initHooks = [];

  	// add method for calling all hooks
  	proto.callInitHooks = function () {

  		if (this._initHooksCalled) {
  			return;
  		}

  		if (parentProto.callInitHooks) {
  			parentProto.callInitHooks.call(this);
  		}

  		this._initHooksCalled = true;

  		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
  			proto._initHooks[i].call(this);
  		}
  	};

  	return NewClass;
  };


  // @function include(properties: Object): this
  // [Includes a mixin](#class-includes) into the current class.
  Class.include = function (props) {
  	extend(this.prototype, props);
  	return this;
  };

  // @function mergeOptions(options: Object): this
  // [Merges `options`](#class-options) into the defaults of the class.
  Class.mergeOptions = function (options) {
  	extend(this.prototype.options, options);
  	return this;
  };

  // @function addInitHook(fn: Function): this
  // Adds a [constructor hook](#class-constructor-hooks) to the class.
  Class.addInitHook = function (fn) { // (Function) || (String, args...)
  	var args = Array.prototype.slice.call(arguments, 1);

  	var init = typeof fn === 'function' ? fn : function () {
  		this[fn].apply(this, args);
  	};

  	this.prototype._initHooks = this.prototype._initHooks || [];
  	this.prototype._initHooks.push(init);
  	return this;
  };

  /*
   * @class Evented
   * @aka Q3D.Evented
   * @inherits Class
   *
   * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
   *
   * @example
   *
   * ```js
   * map.on('click', function(e) {
   * 	alert(e.latlng);
   * } );
   * ```
   *
   * Q3D deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
   *
   * ```js
   * function onClick(e) { ... }
   *
   * map.on('click', onClick);
   * map.off('click', onClick);
   * ```
   */

  var Events = {
  	/* @method on(type: String, fn: Function, context?: Object): this
  	 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
  	 *
  	 * @alternative
  	 * @method on(eventMap: Object): this
  	 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  	 */
  	on: function (types, fn, context) {

  		// types can be a map of types/handlers
  		if (typeof types === 'object') {
  			for (var type in types) {
  				// we don't process space-separated events here for performance;
  				// it's a hot path since Layer uses the on(obj) syntax
  				this._on(type, types[type], fn);
  			}

  		} else {
  			// types can be a string of space-separated words
  			types = splitWords(types);

  			for (var i = 0, len = types.length; i < len; i++) {
  				this._on(types[i], fn, context);
  			}
  		}

  		return this;
  	},

  	/* @method off(type: String, fn?: Function, context?: Object): this
  	 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
  	 *
  	 * @alternative
  	 * @method off(eventMap: Object): this
  	 * Removes a set of type/listener pairs.
  	 *
  	 * @alternative
  	 * @method off: this
  	 * Removes all listeners to all events on the object. This includes implicitly attached events.
  	 */
  	off: function (types, fn, context) {

  		if (!types) {
  			// clear all listeners if called without arguments
  			delete this._events;

  		} else if (typeof types === 'object') {
  			for (var type in types) {
  				this._off(type, types[type], fn);
  			}

  		} else {
  			types = splitWords(types);

  			for (var i = 0, len = types.length; i < len; i++) {
  				this._off(types[i], fn, context);
  			}
  		}

  		return this;
  	},

  	// attach listener (without syntactic sugar now)
  	_on: function (type, fn, context) {
  		this._events = this._events || {};

  		/* get/init listeners for type */
  		var typeListeners = this._events[type];
  		if (!typeListeners) {
  			typeListeners = [];
  			this._events[type] = typeListeners;
  		}

  		if (context === this) {
  			// Less memory footprint.
  			context = undefined;
  		}
  		var newListener = {
  				fn: fn,
  				ctx: context
  			},
  			listeners = typeListeners;

  		// check if fn already there
  		for (var i = 0, len = listeners.length; i < len; i++) {
  			//if (listeners[i].fn === fn && listeners[i].ctx === context) {
  			if (isSameFunction(listeners[i].fn, fn) && listeners[i].ctx === context) {
  				return;
  			}
  		}

  		listeners.push(newListener);
  	},

  	_off: function (type, fn, context) {
  		var listeners,
  			i,
  			len;

  		if (!this._events) {
  			return;
  		}

  		listeners = this._events[type];

  		if (!listeners) {
  			return;
  		}

  		if (!fn) {
  			// Set all removed listeners to noop so they are not called if remove happens in fire
  			for (i = 0, len = listeners.length; i < len; i++) {
  				listeners[i].fn = falseFn;
  			}
  			// clear all listeners for a type if function isn't specified
  			delete this._events[type];
  			return;
  		}

  		if (context === this) {
  			context = undefined;
  		}

  		if (listeners) {

  			// find fn and remove it
  			for (i = 0, len = listeners.length; i < len; i++) {
  				var l = listeners[i];
  				if (l.ctx !== context) {
  					continue;
  				}
  				//if (l.fn === fn) {
  				if (isSameFunction(l.fn, fn)) {

  					// set the removed listener to noop so that's not called if remove happens in fire
  					l.fn = falseFn;

  					if (this._firingCount) {
  						/* copy array in case events are being fired */
  						this._events[type] = listeners = listeners.slice();
  					}
  					listeners.splice(i, 1);

  					if (listeners.length == 0) // added by wuzt.
  						delete this._events[type];

  					return;
  				}
  			}
  		}
  	},

  	// @method fire(type: String, data?: Object, propagate?: Boolean): this
  	// Fires an event of the specified type. You can optionally provide an data
  	// object — the first argument of the listener function will contain its
  	// properties. The event can optionally be propagated to event parents.
  	fire: function (type, data, propagate) {
  		if (!this.listens(type, propagate)) {
  			return this;
  		}

  		var event = extend({}, data, {
  			type: type,
  			target: this,
  			sourceTarget: data && data.sourceTarget || this
  		});

  		if (this._events) {
  			var listeners = this._events[type];

  			if (listeners) {
  				this._firingCount = (this._firingCount + 1) || 1;
  				for (var i = 0, len = listeners.length; i < len; i++) {
  					var l = listeners[i];
  					l.fn.call(l.ctx || this, event);
  				}

  				this._firingCount--;
  			}
  		}

  		if (propagate) {
  			// propagate the event to parents (set with addEventParent)
  			this._propagateEvent(event);
  		}

  		return this;
  	},

  	// @method listens(type: String): Boolean
  	// Returns `true` if a particular event type has any listeners attached to it.
  	listens: function (type, propagate) {
  		var listeners = this._events && this._events[type];
  		if (listeners && listeners.length) {
  			return true;
  		}

  		if (propagate) {
  			// also check parents for listeners if event propagates
  			for (var id in this._eventParents) {
  				if (this._eventParents[id].listens(type, propagate)) {
  					return true;
  				}
  			}
  		}
  		return false;
  	},

  	// @method getEvent(type: String): Boolean
  	// Returns listerner if a particular event type has any listeners attached to it.
  	getListerner: function (type) {
  		var listeners = this._events && this._events[type];
  		if (listeners && listeners.length) {
  			return listeners;
  		}
  		return null;
  	},

  	// @method once(…): this
  	// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
  	once: function (types, fn, context) {

  		if (typeof types === 'object') {
  			for (var type in types) {
  				this.once(type, types[type], fn);
  			}
  			return this;
  		}

  		var handler = bind(function () {
  			this
  				.off(types, fn, context)
  				.off(types, handler, context);
  		}, this);

  		// add a listener that's executed once and removed after that
  		return this
  			.on(types, fn, context)
  			.on(types, handler, context);
  	},

  	// @method addEventParent(obj: Evented): this
  	// Adds an event parent - an `Evented` that will receive propagated events
  	addEventParent: function (obj) {
  		this._eventParents = this._eventParents || {};
  		this._eventParents[stamp(obj)] = obj;
  		return this;
  	},

  	// @method removeEventParent(obj: Evented): this
  	// Removes an event parent, so it will stop receiving propagated events
  	removeEventParent: function (obj) {
  		if (this._eventParents) {
  			delete this._eventParents[stamp(obj)];
  		}
  		return this;
  	},

  	_propagateEvent: function (e) {
  		for (var id in this._eventParents) {
  			this._eventParents[id].fire(e.type, extend({
  				layer: e.target,
  				propagatedFrom: e.target
  			}, e), true);
  		}
  	}
  };

  // aliases; we should ditch those eventually

  // @method addEventListener(…): this
  // Alias to [`on(…)`](#evented-on)
  Events.addEventListener = Events.on;

  // @method removeEventListener(…): this
  // Alias to [`off(…)`](#evented-off)

  // @method clearAllEventListeners(…): this
  // Alias to [`off()`](#evented-off)
  Events.removeEventListener = Events.clearAllEventListeners = Events.off;

  // @method addOneTimeEventListener(…): this
  // Alias to [`once(…)`](#evented-once)
  Events.addOneTimeEventListener = Events.once;

  // @method fireEvent(…): this
  // Alias to [`fire(…)`](#evented-fire)
  Events.fireEvent = Events.fire;

  // @method hasEventListeners(…): Boolean
  // Alias to [`listens(…)`](#evented-listens)
  Events.hasEventListeners = Events.listens;

  var Evented = Class.extend(Events);

  /*
  	Q3D.Handler is a base class for handler classes that are used internally to inject
  	interaction features like dragging to classes like Map and Marker.
  */

  // @class Handler
  // @aka Q3D.Handler
  // Abstract class for map interaction handlers

  var Handler = Class.extend({
  	initialize: function (map) {
  		this._map = map;
  	},

  	// @method enable(): this
  	// Enables the handler
  	enable: function () {
  		if (this._enabled) {
  			return this;
  		}

  		this._enabled = true;
  		this.addHooks();
  		return this;
  	},

  	// @method disable(): this
  	// Disables the handler
  	disable: function () {
  		if (!this._enabled) {
  			return this;
  		}

  		this._enabled = false;
  		this.removeHooks();
  		return this;
  	},

  	// @method enabled(): Boolean
  	// Returns `true` if the handler is enabled
  	enabled: function () {
  		return !!this._enabled;
  	}

  	// @section Extension methods
  	// Classes inheriting from `Handler` must implement the two following methods:
  	// @method addHooks()
  	// Called when the handler is enabled, should add event hooks.
  	// @method removeHooks()
  	// Called when the handler is disabled, should remove the event hooks added previously.
  });

  // @section There is static function which can be called without instantiating Q3D.Handler:
  // @function addTo(map: Map, name: String): this
  // Adds a new Handler to the given map with the given name.
  Handler.addTo = function (map, name) {
  	map.addHandler(name, this);
  	return this;
  };

  var Mixin = {
      Events: Events
  };

  ///QMapV2引擎枚举
  const Enums = {
    //消息类型
    messageType: {
      QMID_ENGINE_EVENTCALLBACK: 80000,
      QMID_WORLDMANAGER_EVENTCALLBACK: 80001,
      QMID_AREASCENEMANAGER_EVENTCALLBACK: 80002,
      QMID_RESOURCE_EVENTCALLBACK: 80003,
      QMID_SCENENODE_EVENTCALLBACK: 80004,
      QMID_TOOLTIP_EVENTCALLBACK: 80005,
      QMID_FLYTO_EVENTCALLBACK: 80006,
      QMID_CAMERA_EVENTCALLBACK: 80007,
      QMID_VIDEO_EVENTCALLBACK: 80008,
      QMID_QACTIVECTRLOBJ_EVENTCALLBACK: 80009,
      QMID_RESOURCEGROUP_EVENTCALLBACK: 80010,
      QMID_ANIAMTIONSTATE_EVENTCALLBACK: 80011,
      QMID_QUIVIDEOCTRL_EVENTCALLBACK: 80012,
      QMID_QGISANALYSTMANAGER_EVENTCALLBACK: 80013,
      QMID_QMOVIECLIPINSTANCE_EVENTCALLBACK: 80014,
      QMID_SCENENODETRANSFORM_EVENTCALLBACK: 80015
    },

    //监听消息ID
    listenerMsgID: {
      LMID_VIDEOCTRL: 10001,
      LMID_RESGROUP: 10002,
      LMID_SCENENODE: 10003,
      LMID_MOVIECLIPINSTANCE: 10004,
      LMID_CIRCLEANI: 10005,
      LMID_ACTIVECTRL: 10006,
      LMID_GISANALYST: 10007
    },

    //引擎值类型对象的CLSID
    ValueTypeCLSID: {
      QVector2: "8974ca38-d123-4516-9f49-c35ab5038a8b",
      QVector2I: "b8d6c462-0d1e-41cb-ab4c-0c0bdf090356",
      QVector3: "406e2212-9d78-45db-a2d5-cb326e9e7f3f",
      QVector3d: "8c53eb01-4520-4793-a4a6-0d1f61e8b51c",
      QGlobalVec3d: "bd2e69e3-8bec-46c4-a7db-35944c51bc3d",
      QColourValue: "2d90ae9b-31c8-45df-99f3-5af1687e035f",
      QArcVertex: "e600f5a7-5cbd-4dc9-b18b-1d1e974607dc",
      QSceneNode: "6f8c4430-cd45-47e0-ae4d-8ee75ab1377b"
    },

    //设备枚举值
    device: {
      KEYBOARD: 0, //键盘
      MOUSE: 1, //鼠标
      MULTITOUCH: 2 //平板
    },

    //鼠标枚举值
    mouse: {
      LBUTTON: 0, //左键
      MBUTTON: 1, //中键
      RBUTTON: 2, //右键
      WHEEL: 4, //滚轮
      LDCLICK: 5, //左键双击
      RDCLICK: 6 //右键双击
    },

    //平板枚举值
    multiTouch: {
      TRANS: 1, //平移
      CLOSETO: 2, //贴近
      RAMBLE: 3, //漫游
      YPS: 4 //导航俯仰缩放
    },

    //键盘枚举值
    keyboard: {
      ALL: {
        ctrlId: 0xffffffff,
        wparam: 0xffffffff
      },
      NUM_0: {
        ctrlId: 0,
        wparam: 48
      },
      NUM_1: {
        ctrlId: 1,
        wparam: 49
      },
      NUM_2: {
        ctrlId: 2,
        wparam: 50
      },
      NUM_3: {
        ctrlId: 3,
        wparam: 51
      },
      NUM_4: {
        ctrlId: 4,
        wparam: 52
      },
      NUM_5: {
        ctrlId: 5,
        wparam: 53
      },
      NUM_6: {
        ctrlId: 6,
        wparam: 54
      },
      NUM_7: {
        ctrlId: 7,
        wparam: 55
      },
      NUM_8: {
        ctrlId: 8,
        wparam: 56
      },
      NUM_9: {
        ctrlId: 9,
        wparam: 57
      },

      A: {
        ctrlId: 10,
        wparam: 65
      },
      B: {
        ctrlId: 11,
        wparam: 66
      },
      C: {
        ctrlId: 12,
        wparam: 67
      },
      D: {
        ctrlId: 13,
        wparam: 68
      },
      E: {
        ctrlId: 14,
        wparam: 69
      },
      F: {
        ctrlId: 15,
        wparam: 70
      },
      G: {
        ctrlId: 16,
        wparam: 71
      },
      H: {
        ctrlId: 17,
        wparam: 72
      },
      I: {
        ctrlId: 18,
        wparam: 73
      },
      J: {
        ctrlId: 19,
        wparam: 74
      },
      K: {
        ctrlId: 20,
        wparam: 75
      },
      L: {
        ctrlId: 21,
        wparam: 76
      },
      M: {
        ctrlId: 22,
        wparam: 77
      },
      N: {
        ctrlId: 23,
        wparam: 78
      },
      O: {
        ctrlId: 24,
        wparam: 79
      },
      P: {
        ctrlId: 25,
        wparam: 80
      },
      Q: {
        ctrlId: 26,
        wparam: 81
      },
      R: {
        ctrlId: 27,
        wparam: 82
      },
      S: {
        ctrlId: 28,
        wparam: 83
      },
      T: {
        ctrlId: 29,
        wparam: 84
      },
      U: {
        ctrlId: 30,
        wparam: 85
      },
      V: {
        ctrlId: 31,
        wparam: 86
      },
      W: {
        ctrlId: 32,
        wparam: 87
      },
      X: {
        ctrlId: 33,
        wparam: 88
      },
      Y: {
        ctrlId: 34,
        wparam: 89
      },
      Z: {
        ctrlId: 35,
        wparam: 90
      },

      F1: {
        ctrlId: 36,
        wparam: 112
      },
      F2: {
        ctrlId: 37,
        wparam: 113
      },
      F3: {
        ctrlId: 38,
        wparam: 114
      },
      F4: {
        ctrlId: 39,
        wparam: 115
      },
      F5: {
        ctrlId: 40,
        wparam: 116
      },
      F6: {
        ctrlId: 41,
        wparam: 117
      },
      F7: {
        ctrlId: 42,
        wparam: 118
      },
      F8: {
        ctrlId: 43,
        wparam: 119
      },
      F9: {
        ctrlId: 44,
        wparam: 120
      },
      F10: {
        ctrlId: 45,
        wparam: 121
      },
      F11: {
        ctrlId: 46,
        wparam: 122
      },
      F12: {
        ctrlId: 47,
        wparam: 123
      },

      ESCAPE: {
        ctrlId: 48,
        wparam: 27
      },
      ACCENT: {
        ctrlId: 49,
        wparam: 192
      },
      BACK: {
        ctrlId: 50,
        wparam: 0
      },
      ENTER: {
        ctrlId: 51,
        wparam: 13
      },
      SPACE: {
        ctrlId: 52,
        wparam: 32
      },

      LCTRL: {
        ctrlId: 53,
        wparam: 17
      },
      RCTRL: {
        ctrlId: 54,
        wparam: 17
      },
      LALT: {
        ctrlId: 55,
        wparam: 0
      },
      RALT: {
        ctrlId: 56,
        wparam: 0
      },
      LSHIFT: {
        ctrlId: 57,
        wparam: 16
      },
      RSHIFT: {
        ctrlId: 58,
        wparam: 16
      },

      INSERT: {
        ctrlId: 59,
        wparam: 45
      },
      DELETE: {
        ctrlId: 60,
        wparam: 46
      },
      HOME: {
        ctrlId: 61,
        wparam: 36
      },
      END: {
        ctrlId: 62,
        wparam: 35
      },
      PAGEUP: {
        ctrlId: 63,
        wparam: 33
      },
      PAGEDOWN: {
        ctrlId: 64,
        wparam: 34
      },

      LEFT: {
        ctrlId: 65,
        wparam: 37
      },
      RIGHT: {
        ctrlId: 66,
        wparam: 39
      },
      UP: {
        ctrlId: 67,
        wparam: 38
      },
      DOWN: {
        ctrlId: 68,
        wparam: 40
      },

      KP_0: {
        ctrlId: 69,
        wparam: 96
      },
      KP_1: {
        ctrlId: 70,
        wparam: 97
      },
      KP_2: {
        ctrlId: 71,
        wparam: 98
      },
      KP_3: {
        ctrlId: 72,
        wparam: 99
      },
      KP_4: {
        ctrlId: 73,
        wparam: 100
      },
      KP_5: {
        ctrlId: 74,
        wparam: 101
      },
      KP_6: {
        ctrlId: 75,
        wparam: 102
      },
      KP_7: {
        ctrlId: 76,
        wparam: 103
      },
      KP_8: {
        ctrlId: 77,
        wparam: 104
      },
      KP_9: {
        ctrlId: 78,
        wparam: 105
      }
    },

    //操作类型
    actionType: {
      //键盘控制
      TRANS_LEFTX: 6, // 左移
      TRANS_RIGHT: 7, // 右移
      TRANS_FORTH: 9, // 前进
      TRANS_BACKX: 10, // 后退
      TRANS_UPXXX: 11, // 上升
      TRANS_DOWNX: 12, // 下降

      //平移
      TRANS_UDLRX: 25, // 平移摄像机，场景无关，需要设置平移速度( 整个屏幕对角线对应的实际移动距离 )
      TRANS_SCENE: 14, //平移场景( 拖拽 )，与场景相关，需要设置一个默认的拖拽平面供没有抓住任何东西时使用。可设置参数：严格拖拽临界角度；临界角范围外的映射距离；仰视拖拽的处理方式
      TRANS_EARTH: 34, // 拖拽球体
      TRANS_ORTHO: 38, // 正交模式下拖拽场景

      //缩放 ( D:Dynamic; S:Static )
      SCALED_CENTER: 26, // 缩放：方向按屏幕中心方向；速度按拾取线段长度比例，如果未拾取到任何东西，退化为STATIC参数处理
      SCALES_CENTER: 27, // 缩放：方向按屏幕中心方向；速度按固定设置参数
      SCALED_SCREEN: 13, // 缩放：方向按( Eye，ScreenPnt )射线方向；速度按拾取线段长度比例，如果未拾取到任何东西，退化为STATIC参数处理
      SCALES_SCREEN: 28, // 缩放：方向按( Eye，ScreenPnt )射线方向；速度按固定设置参数
      SCALEE_SCREEN: 36, // 缩放球体，按屏幕点方向缩放
      SCALEE_CENTER: 37, // 缩放球体，按屏幕中心点方向缩放
      SCALEX_ORTHOX: 40, // 正交模式下缩放场景
      CAMERA_CLOSETO: 22, // 贴近

      //旋转 ( S:Separately; T:Together )
      ROTATES_CAMERA: 15, // 旋转摄像机，yaw,pitch分离，每次操作只取其一
      ROTATET_CAMERA: 29, // 旋转摄像机，yaw,pitch融合
      ROTATES_SCREEN: 21, // 旋转场景，以拾取点为旋转基点,Separately
      ROTATET_SCREEN: 30, // 旋转场景，以拾取点为旋转基点,Together
      ROTATES_CENTER: 31, // 旋转场景，以屏幕中心点在basePlane上的拾取点为基点,Separately
      ROTATET_CENTER: 32, // 旋转场景，以屏幕中心点在basePlane上的拾取点为基点,Together
      ROTATES_FIXPNT: 45, // 绕固定点旋转，yaw,pitch分离
      ROTATET_FIXPNT: 46, // 绕固定点旋转，yaw,pitch融合
      ROTATES_EARTHX: 35, // 旋转球体( reserved )
      ROTATET_EARTHX: 36, // 旋转球体( reserved )
      ROTATEX_ORTHOX: 39, // 正交模式下旋转摄像机

      //漫游
      RAMBLE_KEEPORI: 20, // 漫游：方位不变( 第三人称 )
      RAMBLE_HEADUPX: 33, // 漫游：开车( 第一人称 )( reserved )

      //模型编辑
      OBJECTSELECT_MOVAUX: 17,
      OBJECTSELECT_ROTAUX: 18,
      OBJECTSELECT_SCAAUX: 19,

      //移动设备( YPS:YawPitchScale, S:Separately, T:Together )
      YPSS_CENTER: 41, // 分离操作，以屏幕中心为旋转基点和缩放方向
      YPSS_SCREEN: 23, // 分离操作，以屏幕点为旋转基点和缩放方向
      YPST_CENTER: 43, // 融合操作，以屏幕中心为旋转基点和缩放方向
      YPST_SCREEN: 44, // 融合操作，以屏幕点为旋转基点和缩放方向

      //第三人称操作
      THIRD_ROTATE: 100,
      THIRD_WHEEL: 101,
      THIRD_MOVELEFT: 102, //左移
      THIRD_MOVERIGHT: 103, //右移
      THIRD_MOVEFORTH: 104, //前进
      THIRD_MOVEBACK: 105, //后退
      THIRD_MOVEUP: 106, //上升
      THIRD_MOVEDOWN: 107, //下降
      THIRD_MOVETO: 108, //点击移动
      THIRD_CAMERAROTATE: 109, //转动镜头
      THIRD_TURNLEFT: 110, //左转
      THIRD_TURNRIGHT: 111, //右转
      THIRD_LOOKUP: 112, //抬头
      THIRD_LOOKDOWN: 113 //低头
    },

    //操作消息
    actionMsg: {
      //选择操作限定
      LIMIT_AUX: 1,
      LIMIT_SELECT: 2,
      //所有操作
      SWITCH_INERTIA: 3, //惯性开关
      SWITCH_LOCATOR: 4, //操作定位器开关
      SET_INERTIA_PARAMETER: 5, //设置惯性参数( 一个结构体，暂未提供接口 )
      SET_INERTIA_DURATION: 6, //设置惯性持续时间( 惯性参数中比较常用的一个参数 )

      //平移
      SET_TRANS_LIMITDRAGANGLE: 7, //设置严格拖拽的极限角度
      SET_TRANS_LIMITMAPDISTANCE: 8, //设置非严格拖拽区域的映射距离( 单位：摄像机到拖拽平面的距离d )
      SET_TRANS_LOOKUPMODE: 9, //设置仰视拖拽的模式
      SET_TRANS_SHORTESTDISTANCE: 10, //设置摄像机到拖拽平面的最小距离( 避免摄像机位于拖拽平面上时完全拖不动 )
      SET_TRANS_LIMITDRAGDISTANCE: 11, //设置拖拽点离摄像机的极限距离
      SET_TRANS_STATICSPEED: 12, //设置摄像机平移的固定速度( 米/对角像素 )

      //缩放
      SET_SCALE_STATICSPEED: 13, //设置缩放的静态速度( m/每次缩放 )
      SET_SCALE_DYNAMICSPEED: 14, //设置缩放的动态速度( 与拾取射线到交点线段长度的比例 )
      SET_SCALE_FORWARDSPEEDBUMP: 15, //前减速带距离
      SET_SCALE_BACKWARDSPEEDBUMP: 16, //后减速带距离
      SET_SCALE_SPEEDBUMPRATE: 17, //减速带减速效率(0,1)
      SET_SCALE_BACKWARDLIMIT: 18, //后退极限距离
      SET_YPS_SCALERATIO: 19, //触屏缩放速度调控比例

      //旋转
      SET_PITCHMIN: 20, //俯仰最小角度
      SET_PITCHMAX: 21, //俯仰最大角度
      SET_YAW_SPEED: 22, //偏航速度
      SET_PITCH_SPEED: 23, //俯仰速度
      SWITCH_PITCH: 24, //俯仰开关
      SET_FIXPNT: 25, //旋转固定支点

      //漫游
      SET_RAMBLE_TRANSLATESPEED: 26, //设置漫游平移速度
      SET_RAMBLE_ROTATESPEED: 27, //设置漫游旋转速度

      SWITCH_USAGE: 28
    },

    //节点类型
    sceneNodeType: {
      SNODE_Invalid: 0xffffffff, //无效类型
      SNODE_Group: 0, //空节点， 用于作为父节点挂接其他节点
      SNODE_LocalCamera: 3, //局部摄像机
      SNODE_Light: 4, //灯光
      SNODE_Model: 5, //模型
      SNODE_ParticleSystem: 6, //粒子
      SNODE_Billboard: 8, //公告板
      SNODE_POI: 14, //POI元素
      SNODE_EnvMap: 17, //环境贴图
      SNODE_Line: 19, //线元素
      SNODE_LocalViewCamera: 20, //局部摄像机,用于子窗口
      SNODE_VecModel: 24, //矢量模型
      SNODE_CullAreaNode: 26, //裁剪区域结点
      SNODE_CullPlane: 30, //剖面元素
      SNODE_Traffic: 31, //交通信号结点
      SNODE_Decal: 32 //贴花结点
    },

    lightType: {
      Point: 0,
      /** 点光源 */
      Parallel: 1,
      /** 平行光 */
      Spotlight: 2 /** 聚光灯 */
    },

    //矢量对象类型枚举
    vecModelType: {
      QPolygon: 0, //平面多边形
      QBuilding: 1, //建筑
      QPyramid: 2, //棱锥
      QCylinder: 3, //圆柱
      QCone: 4, //圆锥
      QPipe: 5, //管道
      QSphere: 6, //球
      QArrow: 7, //箭头
      QJunction: 8, //路口
      QRoadway: 9, //道路
      QRailway: 10, //铁路
      QWalls: 11, //墙体
      QPrism: 12 //棱柱
    },
    //资源类型
    resourceType: {
      MESH: 0, //网格类型
      GEOMETRY: 1,
      SKELETON: 2, //骨骼动画类型
      ANINODE: 3, // 动画节点类型
      ANISKIN: 4,
      ANITEX: 5,
      PARTISYS: 6,
      MATERIAL: 7, //材质类型
      TEXTURE: 8, //纹理贴图类型
      ANICLR: 9,
      MAX: 10,
      VIDEO: 16 // 视频类型
    },
    //贴花模式类型
    decalModeType: {
      OpBlendAlpha: 0, //源与目标的Alpha混合
      OpBlendColor: 1,//源与目标的颜色混合
      OpAdd: 2,//源与目标的加法合成
      OpModulate: 3,////源与目标的乘法合成
      OpModulateAdd: 4////源与目标的乘法合成
    },
    decalDestType: {
      DestTarget: 0 << 8,
      DestGBuffer: 1 << 8
    },
    decalNormalFlipMode: {
      None: 0,
      X: 1,
      Y: 2,
      XY: 0x1 | 0x2
    },

    //旋转方向基准点类型
    orientationType: {
      Self: 0, //相对于本身原点旋转
      Parent: 1, //相对于父节点旋转
      World: 2 //相对于世界旋转
    },

    //动画轨迹类型
    actorTrackType: {
      TransformMove: 0, // 变换类属性
      TransformRotate: 1,
      TransformScale: 2,
      ColorDiffuse: 3, // 颜色类属性
      ColorDiffuseIntensity: 4,
      ColorSpecular: 5,
      ColorEmissive: 6,
      ColorAlpha: 7,
      Visible: 8, // 其他属性
      VisibleDerived: 9,
      TransformMoveAbs: 10, // 变换类属性
      TransformRotateAbs: 11,
      Order: 12, // 其他
      ColorFog: 5, // 环境
      ColorIBL: 6,
      ColorIBLIntensity: 4,
      ColorGradingSaturation: 20, // hdr
      ColorGradingBrightness: 21,
      ColorGradingContrast: 22,
      ColorGradingNormalEnabled: 23,
      ColorGradingPhotoFilter: 24,
      ColorGradingPhotoFilterEnabled: 25,
      TUDiffuseUVScroll: 26, //UV
      TUDiffuseUVScale: 27,
      TUDiffuseUVRotate: 28,
      TUEmissiveUVScroll: 29,
      TUEmissiveUVScale: 30,
      TUEmissiveUVRotate: 31
    },

    //动画关键帧数值类型
    actorKeyType: {
      KeyAuto: 0, // 关键帧类轨迹类型
      KeyFloat: 1,
      KeyVector2: 2,
      KeyVector3: 3,
      KeyQuaternion: 4,
      KeyColourValue: 5,
      VecLine: 6, // 矢量类轨迹类型
      VecCircle: 7,
      KeyVector3d: 8 // 关键帧类轨迹类型
    },

    //曲线控制类型
    curveCtrlType: {
      Point: 0, //点
      Linear: 1, //线性插值
      Bessel: 2 //贝塞尔插值
    },

    //时间控制类型
    timeCtrlType: {
      Linear: 0, //线性过渡
      EaseIn: 1, //缓进过渡
      EaseOut: 2 //缓出过渡
    },

    //扮演者类型
    playerType: {
      Node: 0, //节点
      Material: 1, //材质
      Sky: 2, //天空盒
      Environment: 3, //环境
      HDRSetting: 4 //HDR
    },

    //显示隐藏变化类型
    fadeType: {
      fadeIn: 0,
      fadeOut: 1,
      fadeFlash: 2
    },

    //节点容器类型
    nodeContainerType: {
      Alpha: 0,
      Color: 1,
      Visible: 2,
      Material: 3
    },

    //节点容器中节点添加方式
    nodeContainerInjectionType: {
      Node: 0,
      Layer: 1,
      Area: 2
    },

    //材质应用模式
    materialApplyMode: {
      Multiply: 0,
      Add: 1,
      Subtract: 2,
      Replace: 3
    },

    //贴图类型
    textureUnit: {
      DIFFUSE: 1684629094, // 漫反射贴图
      SPECULAR: 1936745827, //镜面反射贴图
      NORMAL: 1852797549, // 正常贴图
      LIGHT: 1818847080, // 灯光贴图
      EDGE: 1701078885,
      EMISSIVE: 1701669235 //自发光
    },

    //POI图标中心点位置枚举
    poiImagePositionType: {
      POI_LOCATE_NONE: 0, // 默认值，在整个 POI 对象中心
      POI_LOCATE_LEFT: 1, // 在 ICON 的左边
      POI_LOCATE_HCENTER: 2, // 在 ICON 的水平中间
      POI_LOCATE_RIGHT: 3, // 在 ICON 的右边
      POI_LOCATE_TOP: 256, // 在 ICON 的上边
      POI_LOCATE_VCENTER: 512, // 在 ICON 的垂直中间
      POI_LOCATE_BOTTOM: 768, // 在 ICON 的下边
      POI_LOCATE_LEFTTOP: 257, // 在 ICON 的左上
      POI_LOCATE_LEFTBOTTOM: 769, // 在 ICON 的左下
      POI_LOCATE_RIGHTTOP: 259, // 在 ICON 的右上
      POI_LOCATE_RIGHTBOTTOM: 771, // 在 ICON 的右下
      POI_LOCATE_CUSTOM: 0xffffffff // 可使用 setLocationOffset调整
    },

    //节点旋转类型定义
    nodeOrientationType: {
      Self: 0,
      Parent: 1,
      World: 2
    },

    //POI图标文字位置关系枚举
    poiLayOut: {
      Left: 0, //图标在左
      Top: 1, //图标在上
      Right: 2, // 图标在右
      Bottom: 3, //图标在下
      Center: 4, //文字在图标中间

      LeftTop: 0 | 768,
      LeftBottom: 0 | 1024,
      RightTop: 2 | 768,
      RightBottom: 2 | 1024,
      TopLeft: 1 | 256,
      TopRight: 1 | 512,
      BottomLeft: 3 | 256,
      BottomRight: 3 | 512,

      LeftCustom: 0 | 1280,
      TopCustom: 1 | 1280,
      RightCustom: 2 | 1280,
      BottomCustom: 3 | 1280
    },

    poiUIType: {
      Normal: 0, //普通模型
      CameraOriented: 1, //面向摄像机
      CameraOrientedKeepSize: 2 //面向摄像机且保持大小一致
    },

    //编辑模式枚举
    auxControlType: {
      AXIS_X: 1,
      AXIS_Y: 2,
      AXIS_Z: 4,
      PLANE_XOY: 16,
      PLANE_YOZ: 32,
      PLANE_ZOX: 64
    },

    //编辑操作枚举
    auxOperateType: {
      Hide: 0,
      Translate: 1,
      Rotate: 2,
      Scale: 3
    },

    //线对象线形枚举
    lineType: {
      StraightLine: 0, //直线
      Bessel: 1, //贝塞尔曲线
      Parabola: 2 //抛物线
    },

    //摄像机视图枚举
    camViewType: {
      Front: 0, //正视
      Top: 1, //俯视
      Side: 2, //侧视
      Axis: 3 //轴侧
    },

    //UI中视频类型枚举
    videoSourceType: {
      VIDSRC_LOCAL: 0, //本地视频
      VIDSRC_NETSTREAM: 1 //网络实时视频流
    },

    //退出节点编辑模式类型枚举
    exitType: {
      SaveAndExit: 1,
      DeleteAndExit: 2,
      ResetAndExit: 3
    },

    //热力图算法类型枚举
    heatMapCalcType: {
      NearBy: 1, //就近算法
      Average: 2, //平均算法
      SquaredWeighted: 3, //反平方加权算法
      RangeAttenuation: 4 //加限制域衰减算法
    },

    //贴花纹理填充类型枚举
    decalTexFillMode: {
      FillOnly: 1, //单填充
      FrameOnly: 2, //单描边
      FillAndFrame: 3 //填充+描边
    },

    //量测拾取模式枚举
    pickUpType: {
      Plane: 1, //水平面上拾取
      Spatial: 2, //空间拾取
      Surface: 3 //贴地拾取
    },

    //量测类型枚举
    measureType: {
      Polyline: 0, //多点折线
      Polygon: 3, //多边形
      Height: 1, //高度
      Rectangle: 2, //矩形
      XYZComponent: 5, //XYZ分量
      Angle: 6 //角度
    },

    //公告板类型枚举
    billboardType: {
      Point: 0, /// Standard point billboard (default), always faces the camera completely and is always upright
      Oriented_Common: 1, /// Billboards are oriented around a shared direction vector (used as Y axis) and only rotate around this to face the camera
      Oriented_Self: 2, /// Billboards are oriented around their own direction vector (their own Y axis) and only rotate around this to face the camera
      Perpendicular_Common: 3, /// Billboards are perpendicular to a shared direction vector (used as Z axis, the facing direction) and X, Y axis are determined by a shared up-vertor
      Perpendicular_Self: 4 /// Billboards are perpendicular to their own direction vector (their own Z axis, the facing direction) and X, Y axis are determined by a shared up-vertor
    }
  };

  /*
   * @class Point
   * @aka Q3D.Point
   *
   * Represents a point with `x` and `y` coordinates in pixels.
   *
   * @example
   *
   * ```js
   * var point = Q3D.point(200, 300);
   * ```
   *
   * All Q3D methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
   *
   * ```js
   * map.panBy([200, 300]);
   * map.panBy(Q3D.point(200, 300));
   * ```
   *
   * Note that `Point` does not inherit from Q3D's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function Point(x, y, round) {
    // @property x: Number; The `x` coordinate of the point
    this.x = round ? Math.round(x) : x;
    // @property y: Number; The `y` coordinate of the point
    this.y = round ? Math.round(y) : y;
  }

  var trunc =
    Math.trunc ||
    function(v) {
      return v > 0 ? Math.floor(v) : Math.ceil(v);
    };

  Point.prototype = {
    // @method clone(): Point
    // Returns a copy of the current point.
    clone: function() {
      return new Point(this.x, this.y);
    },

    // @method add(otherPoint: Point): Point
    // Returns the result of addition of the current and the given points.
    add: function(point) {
      // non-destructive, returns a new point
      return this.clone()._add(toPoint(point));
    },

    _add: function(point) {
      // destructive, used directly for performance in situations where it's safe to modify existing point
      this.x += point.x;
      this.y += point.y;
      return this;
    },

    // @method subtract(otherPoint: Point): Point
    // Returns the result of subtraction of the given point from the current.
    subtract: function(point) {
      return this.clone()._subtract(toPoint(point));
    },

    _subtract: function(point) {
      this.x -= point.x;
      this.y -= point.y;
      return this;
    },

    // @method divideBy(num: Number): Point
    // Returns the result of division of the current point by the given number.
    divideBy: function(num) {
      return this.clone()._divideBy(num);
    },

    _divideBy: function(num) {
      this.x /= num;
      this.y /= num;
      return this;
    },

    // @method multiplyBy(num: Number): Point
    // Returns the result of multiplication of the current point by the given number.
    multiplyBy: function(num) {
      return this.clone()._multiplyBy(num);
    },

    _multiplyBy: function(num) {
      this.x *= num;
      this.y *= num;
      return this;
    },

    // @method scaleBy(scale: Point): Point
    // Multiply each coordinate of the current point by each coordinate of
    // `scale`. In linear algebra terms, multiply the point by the
    // [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
    // defined by `scale`.
    scaleBy: function(point) {
      return new Point(this.x * point.x, this.y * point.y);
    },

    // @method unscaleBy(scale: Point): Point
    // Inverse of `scaleBy`. Divide each coordinate of the current point by
    // each coordinate of `scale`.
    unscaleBy: function(point) {
      return new Point(this.x / point.x, this.y / point.y);
    },

    // @method round(): Point
    // Returns a copy of the current point with rounded coordinates.
    round: function() {
      return this.clone()._round();
    },

    _round: function() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    },

    // @method floor(): Point
    // Returns a copy of the current point with floored coordinates (rounded down).
    floor: function() {
      return this.clone()._floor();
    },

    _floor: function() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    },

    // @method ceil(): Point
    // Returns a copy of the current point with ceiled coordinates (rounded up).
    ceil: function() {
      return this.clone()._ceil();
    },

    _ceil: function() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      return this;
    },

    // @method trunc(): Point
    // Returns a copy of the current point with truncated coordinates (rounded towards zero).
    trunc: function() {
      return this.clone()._trunc();
    },

    _trunc: function() {
      this.x = trunc(this.x);
      this.y = trunc(this.y);
      return this;
    },

    // @method distanceTo(otherPoint: Point): Number
    // Returns the cartesian distance between the current and the given points.
    distanceTo: function(point) {
      point = toPoint(point);

      var x = point.x - this.x,
        y = point.y - this.y;

      return Math.sqrt(x * x + y * y);
    },

    // @method equals(otherPoint: Point): Boolean
    // Returns `true` if the given point has the same coordinates.
    equals: function(point) {
      point = toPoint(point);

      return point.x === this.x && point.y === this.y;
    },

    // @method contains(otherPoint: Point): Boolean
    // Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
    contains: function(point) {
      point = toPoint(point);

      return (
        Math.abs(point.x) <= Math.abs(this.x) &&
        Math.abs(point.y) <= Math.abs(this.y)
      );
    },

    // @method toString(): String
    // Returns a string representation of the point for debugging purposes.
    toString: function() {
      return "Point(" + formatNum(this.x) + ", " + formatNum(this.y) + ")";
    }
  };

  // @factory Q3D.point(x: Number, y: Number, round?: Boolean)
  // Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

  // @alternative
  // @factory Q3D.point(coords: Number[])
  // Expects an array of the form `[x, y]` instead.

  // @alternative
  // @factory Q3D.point(coords: Object)
  // Expects a plain object of the form `{x: Number, y: Number}` instead.
  function toPoint(x, y, round) {
    if (x instanceof Point) {
      return x;
    }
    if (isArray(x)) {
      return new Point(x[0], x[1]);
    }
    if (x === undefined || x === null) {
      return x;
    }
    if (typeof x === "object" && "x" in x && "y" in x) {
      return new Point(x.x, x.y);
    }
    return new Point(x, y, round);
  }

  /*
   * Extends Q3D.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
   */


  var POINTER_DOWN =   msPointer ? 'MSPointerDown'   : 'pointerdown';
  var POINTER_MOVE =   msPointer ? 'MSPointerMove'   : 'pointermove';
  var POINTER_UP =     msPointer ? 'MSPointerUp'     : 'pointerup';
  var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';
  var TAG_WHITE_LIST = ['INPUT', 'SELECT', 'OPTION'];

  var _pointers = {};
  var _pointerDocListener = false;

  // DomEvent.DoubleTap needs to know about this
  var _pointersCount = 0;

  // Provides a touch events wrapper for (ms)pointer events.
  // ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

  function addPointerListener(obj, type, handler, id) {
  	if (type === 'touchstart') {
  		_addPointerStart(obj, handler, id);

  	} else if (type === 'touchmove') {
  		_addPointerMove(obj, handler, id);

  	} else if (type === 'touchend') {
  		_addPointerEnd(obj, handler, id);
  	}

  	return this;
  }

  function removePointerListener(obj, type, id) {
  	var handler = obj['_g3d_' + type + id];

  	if (type === 'touchstart') {
  		obj.removeEventListener(POINTER_DOWN, handler, false);

  	} else if (type === 'touchmove') {
  		obj.removeEventListener(POINTER_MOVE, handler, false);

  	} else if (type === 'touchend') {
  		obj.removeEventListener(POINTER_UP, handler, false);
  		obj.removeEventListener(POINTER_CANCEL, handler, false);
  	}

  	return this;
  }

  function _addPointerStart(obj, handler, id) {
  	var onDown = bind(function (e) {
  		if (e.pointerType !== 'mouse' && e.MSPOINTER_TYPE_MOUSE && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
  			// In IE11, some touch events needs to fire for form controls, or
  			// the controls will stop working. We keep a whitelist of tag names that
  			// need these events. For other target tags, we prevent default on the event.
  			if (TAG_WHITE_LIST.indexOf(e.target.tagName) < 0) {
  				preventDefault(e);
  			} else {
  				return;
  			}
  		}

  		_handlePointer(e, handler);
  	});

  	obj['_g3d_touchstart' + id] = onDown;
  	obj.addEventListener(POINTER_DOWN, onDown, false);

  	// need to keep track of what pointers and how many are active to provide e.touches emulation
  	if (!_pointerDocListener) {
  		// we listen documentElement as any drags that end by moving the touch off the screen get fired there
  		document.documentElement.addEventListener(POINTER_DOWN, _globalPointerDown, true);
  		document.documentElement.addEventListener(POINTER_MOVE, _globalPointerMove, true);
  		document.documentElement.addEventListener(POINTER_UP, _globalPointerUp, true);
  		document.documentElement.addEventListener(POINTER_CANCEL, _globalPointerUp, true);

  		_pointerDocListener = true;
  	}
  }

  function _globalPointerDown(e) {
  	_pointers[e.pointerId] = e;
  	_pointersCount++;
  }

  function _globalPointerMove(e) {
  	if (_pointers[e.pointerId]) {
  		_pointers[e.pointerId] = e;
  	}
  }

  function _globalPointerUp(e) {
  	delete _pointers[e.pointerId];
  	_pointersCount--;
  }

  function _handlePointer(e, handler) {
  	e.touches = [];
  	for (var i in _pointers) {
  		e.touches.push(_pointers[i]);
  	}
  	e.changedTouches = [e];

  	handler(e);
  }

  function _addPointerMove(obj, handler, id) {
  	var onMove = function (e) {
  		// don't fire touch moves when mouse isn't down
  		if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

  		_handlePointer(e, handler);
  	};

  	obj['_g3d_touchmove' + id] = onMove;
  	obj.addEventListener(POINTER_MOVE, onMove, false);
  }

  function _addPointerEnd(obj, handler, id) {
  	var onUp = function (e) {
  		_handlePointer(e, handler);
  	};

  	obj['_g3d_touchend' + id] = onUp;
  	obj.addEventListener(POINTER_UP, onUp, false);
  	obj.addEventListener(POINTER_CANCEL, onUp, false);
  }

  /*
   * Extends the event handling code with double tap support for mobile browsers.
   */

  var _touchstart = msPointer ? 'MSPointerDown' : pointer ? 'pointerdown' : 'touchstart';
  var _touchend = msPointer ? 'MSPointerUp' : pointer ? 'pointerup' : 'touchend';
  var _pre = '_leaflet_';

  // inspired by Zepto touch code by Thomas Fuchs
  function addDoubleTapListener(obj, handler, id) {
  	var last, touch,
  	    doubleTap = false,
  	    delay = 250;

  	function onTouchStart(e) {
  		var count;

  		if (pointer) {
  			if ((!edge) || e.pointerType === 'mouse') { return; }
  			count = _pointersCount;
  		} else {
  			count = e.touches.length;
  		}

  		if (count > 1) { return; }

  		var now = Date.now(),
  		    delta = now - (last || now);

  		touch = e.touches ? e.touches[0] : e;
  		doubleTap = (delta > 0 && delta <= delay);
  		last = now;
  	}

  	function onTouchEnd(e) {
  		if (doubleTap && !touch.cancelBubble) {
  			if (pointer) {
  				if ((!edge) || e.pointerType === 'mouse') { return; }
  				// work around .type being readonly with MSPointer* events
  				var newTouch = {},
  				    prop, i;

  				for (i in touch) {
  					prop = touch[i];
  					newTouch[i] = prop && prop.bind ? prop.bind(touch) : prop;
  				}
  				touch = newTouch;
  			}
  			touch.type = 'dblclick';
  			touch.button = 0;
  			handler(touch);
  			last = null;
  		}
  	}

  	obj[_pre + _touchstart + id] = onTouchStart;
  	obj[_pre + _touchend + id] = onTouchEnd;
  	obj[_pre + 'dblclick' + id] = handler;

  	obj.addEventListener(_touchstart, onTouchStart, passiveEvents ? {passive: false} : false);
  	obj.addEventListener(_touchend, onTouchEnd, passiveEvents ? {passive: false} : false);

  	// On some platforms (notably, chrome<55 on win10 + touchscreen + mouse),
  	// the browser doesn't fire touchend/pointerup events but does fire
  	// native dblclicks. See #4127.
  	// Edge 14 also fires native dblclicks, but only for pointerType mouse, see #5180.
  	obj.addEventListener('dblclick', handler, false);

  	return this;
  }

  function removeDoubleTapListener(obj, id) {
  	var touchstart = obj[_pre + _touchstart + id],
  	    touchend = obj[_pre + _touchend + id],
  	    dblclick = obj[_pre + 'dblclick' + id];

  	obj.removeEventListener(_touchstart, touchstart, passiveEvents ? {passive: false} : false);
  	obj.removeEventListener(_touchend, touchend, passiveEvents ? {passive: false} : false);
  	if (!edge) {
  		obj.removeEventListener('dblclick', dblclick, false);
  	}

  	return this;
  }

  /*
   * @namespace DomEvent
   * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
   */

  // Inspired by John Resig, Dean Edwards and YUI addEvent implementations.

  // @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
  // Adds a listener function (`fn`) to a particular DOM event type of the
  // element `el`. You can optionally specify the context of the listener
  // (object the `this` keyword will point to). You can also pass several
  // space-separated types (e.g. `'click dblclick'`).

  // @alternative
  // @function on(el: HTMLElement, eventMap: Object, context?: Object): this
  // Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  function on(obj, types, fn, context) {

  	if (typeof types === 'object') {
  		for (var type in types) {
  			addOne(obj, type, types[type], fn);
  		}
  	} else {
  		types = splitWords(types);

  		for (var i = 0, len = types.length; i < len; i++) {
  			addOne(obj, types[i], fn, context);
  		}
  	}

  	return this;
  }

  var eventsKey = '_q3d_events';

  // @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
  // Removes a previously added listener function.
  // Note that if you passed a custom context to on, you must pass the same
  // context to `off` in order to remove the listener.

  // @alternative
  // @function off(el: HTMLElement, eventMap: Object, context?: Object): this
  // Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  function off(obj, types, fn, context) {

  	if (typeof types === 'object') {
  		for (var type in types) {
  			removeOne(obj, type, types[type], fn);
  		}
  	} else if (types) {
  		types = splitWords(types);

  		for (var i = 0, len = types.length; i < len; i++) {
  			removeOne(obj, types[i], fn, context);
  		}
  	} else {
  		for (var j in obj[eventsKey]) {
  			removeOne(obj, j, obj[eventsKey][j]);
  		}
  		delete obj[eventsKey];
  	}

  	return this;
  }

  function addOne(obj, type, fn, context) {
  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : '');

  	if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

  	var handler = function (e) {
  		return fn.call(context || obj, e || window.event);
  	};

  	var originalHandler = handler;

  	if (pointer && type.indexOf('touch') === 0) {
  		// Needs DomEvent.Pointer.js
  		addPointerListener(obj, type, handler, id);

  	} else if (touch && (type === 'dblclick') && addDoubleTapListener &&
  	           !(pointer && chrome)) {
  		// Chrome >55 does not need the synthetic dblclicks from addDoubleTapListener
  		// See #5180
  		addDoubleTapListener(obj, handler, id);

  	} else if ('addEventListener' in obj) {

  		if (type === 'mousewheel') {
  			obj.addEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, passiveEvents ? {passive: false} : false);

  		} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
  			handler = function (e) {
  				e = e || window.event;
  				if (isExternalTarget(obj, e)) {
  					originalHandler(e);
  				}
  			};
  			obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);

  		} else {
  			if (type === 'click' && android) {
  				handler = function (e) {
  					filterClick(e, originalHandler);
  				};
  			}
  			obj.addEventListener(type, handler, false);
  		}

  	} else if ('attachEvent' in obj) {
  		obj.attachEvent('on' + type, handler);
  	}

  	obj[eventsKey] = obj[eventsKey] || {};
  	obj[eventsKey][id] = handler;
  }

  function removeOne(obj, type, fn, context) {

  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : ''),
  	    handler = obj[eventsKey] && obj[eventsKey][id];

  	if (!handler) { return this; }

  	if (pointer && type.indexOf('touch') === 0) {
  		removePointerListener(obj, type, id);

  	} else if (touch && (type === 'dblclick') && removeDoubleTapListener &&
  	           !(pointer && chrome)) {
  		removeDoubleTapListener(obj, id);

  	} else if ('removeEventListener' in obj) {

  		if (type === 'mousewheel') {
  			obj.removeEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, passiveEvents ? {passive: false} : false);

  		} else {
  			obj.removeEventListener(
  				type === 'mouseenter' ? 'mouseover' :
  				type === 'mouseleave' ? 'mouseout' : type, handler, false);
  		}

  	} else if ('detachEvent' in obj) {
  		obj.detachEvent('on' + type, handler);
  	}

  	obj[eventsKey][id] = null;
  }

  // @function stopPropagation(ev: DOMEvent): this
  // Stop the given event from propagation to parent elements. Used inside the listener functions:
  // ```js
  // Q3D.DomEvent.on(div, 'click', function (ev) {
  // 	Q3D.DomEvent.stopPropagation(ev);
  // });
  // ```
  function stopPropagation(e) {

  	if (e.stopPropagation) {
  		e.stopPropagation();
  	} else if (e.originalEvent) {  // In case of Leaflet event.
  		e.originalEvent._stopped = true;
  	} else {
  		e.cancelBubble = true;
  	}
  	skipped(e);

  	return this;
  }

  // @function disableScrollPropagation(el: HTMLElement): this
  // Adds `stopPropagation` to the element's `'mousewheel'` events (plus browser variants).
  function disableScrollPropagation(el) {
  	addOne(el, 'mousewheel', stopPropagation);
  	return this;
  }

  // @function disableClickPropagation(el: HTMLElement): this
  // Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
  // `'mousedown'` and `'touchstart'` events (plus browser variants).
  function disableClickPropagation(el) {
  	on(el, 'mousedown touchstart dblclick', stopPropagation);
  	addOne(el, 'click', fakeStop);
  	return this;
  }

  // @function preventDefault(ev: DOMEvent): this
  // Prevents the default action of the DOM Event `ev` from happening (such as
  // following a link in the href of the a element, or doing a POST request
  // with page reload when a `<form>` is submitted).
  // Use it inside listener functions.
  function preventDefault(e) {
  	if (e.preventDefault) {
  		e.preventDefault();
  	} else {
  		e.returnValue = false;
  	}
  	return this;
  }

  // @function stop(ev: DOMEvent): this
  // Does `stopPropagation` and `preventDefault` at the same time.
  function stop(e) {
  	preventDefault(e);
  	stopPropagation(e);
  	return this;
  }

  // @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
  // Gets normalized mouse position from a DOM event relative to the
  // `container` (border excluded) or to the whole page if not specified.
  function getMousePosition(e, container) {
  	if (!container) {
  		return new Point(e.clientX, e.clientY);
  	}

  	var scale = getScale(container),
  	    offset = scale.boundingClientRect; // left and top  values are in page scale (like the event clientX/Y)

  	return new Point(
  		// offset.left/top values are in page scale (like clientX/Y),
  		// whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
  		(e.clientX - offset.left) / scale.x - container.clientLeft,
  		(e.clientY - offset.top) / scale.y - container.clientTop
  	);
  }

  // Chrome on Win scrolls double the pixels as in other platforms (see #4538),
  // and Firefox scrolls device pixels, not CSS pixels
  var wheelPxFactor =
  	(win && chrome) ? 2 * window.devicePixelRatio :
  	gecko ? window.devicePixelRatio : 1;

  // @function getWheelDelta(ev: DOMEvent): Number
  // Gets normalized wheel delta from a mousewheel DOM event, in vertical
  // pixels scrolled (negative if scrolling down).
  // Events from pointing devices without precise scrolling are mapped to
  // a best guess of 60 pixels.
  function getWheelDelta(e) {
  	return (edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
  	       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
  	       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
  	       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
  	       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
  	       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
  	       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
  	       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
  	       0;
  }

  var skipEvents = {};

  function fakeStop(e) {
  	// fakes stopPropagation by setting a special event flag, checked/reset with skipped(e)
  	skipEvents[e.type] = true;
  }

  function skipped(e) {
  	var events = skipEvents[e.type];
  	// reset when checking, as it's only used in map container and propagates outside of the map
  	skipEvents[e.type] = false;
  	return events;
  }

  // check if element really left/entered the event target (for mouseenter/mouseleave)
  function isExternalTarget(el, e) {

  	var related = e.relatedTarget;

  	if (!related) { return true; }

  	try {
  		while (related && (related !== el)) {
  			related = related.parentNode;
  		}
  	} catch (err) {
  		return false;
  	}
  	return (related !== el);
  }

  var lastClick;

  // this is a horrible workaround for a bug in Android where a single touch triggers two click events
  function filterClick(e, handler) {
  	var timeStamp = (e.timeStamp || (e.originalEvent && e.originalEvent.timeStamp)),
  	    elapsed = lastClick && (timeStamp - lastClick);

  	// are they closer together than 500ms yet more than 100ms?
  	// Android typically triggers them ~300ms apart while multiple listeners
  	// on the same event should be triggered far faster;
  	// or check if click is simulated on the element, and if it is, reject any non-simulated events

  	if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
  		stop(e);
  		return;
  	}
  	lastClick = timeStamp;

  	handler(e);
  }

  var DomEvent = /*#__PURE__*/Object.freeze({
    __proto__: null,
    on: on,
    off: off,
    stopPropagation: stopPropagation,
    disableScrollPropagation: disableScrollPropagation,
    disableClickPropagation: disableClickPropagation,
    preventDefault: preventDefault,
    stop: stop,
    getMousePosition: getMousePosition,
    getWheelDelta: getWheelDelta,
    fakeStop: fakeStop,
    skipped: skipped,
    isExternalTarget: isExternalTarget,
    addListener: on,
    removeListener: off
  });

  /*
   * @namespace DomUtil
   *
   * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
   * tree, used by Q3D internally.
   *
   * Most functions expecting or returning a `HTMLElement` also work for
   * SVG elements. The only difference is that classes refer to CSS classes
   * in HTML and SVG classes in SVG.
   */


  // @property TRANSFORM: String
  // Vendor-prefixed transform style name (e.g. `'webkitTransform'` for WebKit).
  var TRANSFORM = testProp(
  	['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

  // webkitTransition comes first because some browser versions that drop vendor prefix don't do
  // the same for the transitionend event, in particular the Android 4.1 stock browser

  // @property TRANSITION: String
  // Vendor-prefixed transition style name.
  var TRANSITION = testProp(
  	['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

  // @property TRANSITION_END: String
  // Vendor-prefixed transitionend event name.
  var TRANSITION_END =
  	TRANSITION === 'webkitTransition' || TRANSITION === 'OTransition' ? TRANSITION + 'End' : 'transitionend';


  // @function get(id: String|HTMLElement): HTMLElement
  // Returns an element given its DOM id, or returns the element itself
  // if it was passed directly.
  function get(id) {
  	return typeof id === 'string' ? document.getElementById(id) : id;
  }

  // @function getStyle(el: HTMLElement, styleAttrib: String): String
  // Returns the value for a certain style attribute on an element,
  // including computed values or values set through CSS.
  function getStyle(el, style) {
  	var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

  	if ((!value || value === 'auto') && document.defaultView) {
  		var css = document.defaultView.getComputedStyle(el, null);
  		value = css ? css[style] : null;
  	}
  	return value === 'auto' ? null : value;
  }

  // @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
  // Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
  function create$1(tagName, className, container) {
  	var el = document.createElement(tagName);
  	el.className = className || '';

  	if (container) {
  		container.appendChild(el);
  	}
  	return el;
  }

  // @function remove(el: HTMLElement)
  // Removes `el` from its parent element
  function remove(el) {
  	var parent = el.parentNode;
  	if (parent) {
  		parent.removeChild(el);
  	}
  }

  // @function empty(el: HTMLElement)
  // Removes all of `el`'s children elements from `el`
  function empty(el) {
  	while (el.firstChild) {
  		el.removeChild(el.firstChild);
  	}
  }

  // @function toFront(el: HTMLElement)
  // Makes `el` the last child of its parent, so it renders in front of the other children.
  function toFront(el) {
  	var parent = el.parentNode;
  	if (parent && parent.lastChild !== el) {
  		parent.appendChild(el);
  	}
  }

  // @function toBack(el: HTMLElement)
  // Makes `el` the first child of its parent, so it renders behind the other children.
  function toBack(el) {
  	var parent = el.parentNode;
  	if (parent && parent.firstChild !== el) {
  		parent.insertBefore(el, parent.firstChild);
  	}
  }

  // @function hasClass(el: HTMLElement, name: String): Boolean
  // Returns `true` if the element's class attribute contains `name`.
  function hasClass(el, name) {
  	if (el.classList !== undefined) {
  		return el.classList.contains(name);
  	}
  	var className = getClass(el);
  	return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
  }

  // @function addClass(el: HTMLElement, name: String)
  // Adds `name` to the element's class attribute.
  function addClass(el, name) {
  	if (el.classList !== undefined) {
  		var classes = splitWords(name);
  		for (var i = 0, len = classes.length; i < len; i++) {
  			el.classList.add(classes[i]);
  		}
  	} else if (!hasClass(el, name)) {
  		var className = getClass(el);
  		setClass(el, (className ? className + ' ' : '') + name);
  	}
  }

  // @function removeClass(el: HTMLElement, name: String)
  // Removes `name` from the element's class attribute.
  function removeClass(el, name) {
  	if (el.classList !== undefined) {
  		el.classList.remove(name);
  	} else {
  		setClass(el, trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
  	}
  }

  // @function setClass(el: HTMLElement, name: String)
  // Sets the element's class.
  function setClass(el, name) {
  	if (el.className.baseVal === undefined) {
  		el.className = name;
  	} else {
  		// in case of SVG element
  		el.className.baseVal = name;
  	}
  }

  // @function getClass(el: HTMLElement): String
  // Returns the element's class.
  function getClass(el) {
  	// Check if the element is an SVGElementInstance and use the correspondingElement instead
  	// (Required for linked SVG elements in IE11.)
  	if (el.correspondingElement) {
  		el = el.correspondingElement;
  	}
  	return el.className.baseVal === undefined ? el.className : el.className.baseVal;
  }

  // @function setOpacity(el: HTMLElement, opacity: Number)
  // Set the opacity of an element (including old IE support).
  // `opacity` must be a number from `0` to `1`.
  function setOpacity(el, value) {
  	if ('opacity' in el.style) {
  		el.style.opacity = value;
  	} else if ('filter' in el.style) {
  		_setOpacityIE(el, value);
  	}
  }

  function _setOpacityIE(el, value) {
  	var filter = false,
  	    filterName = 'DXImageTransform.Microsoft.Alpha';

  	// filters collection throws an error if we try to retrieve a filter that doesn't exist
  	try {
  		filter = el.filters.item(filterName);
  	} catch (e) {
  		// don't set opacity to 1 if we haven't already set an opacity,
  		// it isn't needed and breaks transparent pngs.
  		if (value === 1) { return; }
  	}

  	value = Math.round(value * 100);

  	if (filter) {
  		filter.Enabled = (value !== 100);
  		filter.Opacity = value;
  	} else {
  		el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
  	}
  }

  // @function testProp(props: String[]): String|false
  // Goes through the array of style names and returns the first name
  // that is a valid style name for an element. If no such name is found,
  // it returns false. Useful for vendor-prefixed styles like `transform`.
  function testProp(props) {
  	var style = document.documentElement.style;

  	for (var i = 0; i < props.length; i++) {
  		if (props[i] in style) {
  			return props[i];
  		}
  	}
  	return false;
  }

  // @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
  // Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
  // and optionally scaled by `scale`. Does not have an effect if the
  // browser doesn't support 3D CSS transforms.
  function setTransform(el, offset, scale) {
  	var pos = offset || new Point(0, 0);

  	el.style[TRANSFORM] =
  		(ie3d ?
  			'translate(' + pos.x + 'px,' + pos.y + 'px)' :
  			'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
  		(scale ? ' scale(' + scale + ')' : '');
  }

  // @function setPosition(el: HTMLElement, position: Point)
  // Sets the position of `el` to coordinates specified by `position`,
  // using CSS translate or top/left positioning depending on the browser
  // (used by Q3D internally to position its layers).
  function setPosition(el, point) {

  	/*eslint-disable */
  	el._q3d_pos = point;
  	/* eslint-enable */

  	if (any3d) {
  		setTransform(el, point);
  	} else {
  		el.style.left = point.x + 'px';
  		el.style.top = point.y + 'px';
  	}
  }

  // @function getPosition(el: HTMLElement): Point
  // Returns the coordinates of an element previously positioned with setPosition.
  function getPosition(el) {
  	// this method is only used for elements previously positioned using setPosition,
  	// so it's safe to cache the position for performance

  	return el._q3d_pos || new Point(0, 0);
  }

  // @function disableTextSelection()
  // Prevents the user from generating `selectstart` DOM events, usually generated
  // when the user drags the mouse through a page with text. Used internally
  // by Leaflet to override the behaviour of any click-and-drag interaction on
  // the map. Affects drag interactions on the whole document.

  // @function enableTextSelection()
  // Cancels the effects of a previous [`Q3D.DomUtil.disableTextSelection`](#domutil-disabletextselection).
  var disableTextSelection;
  var enableTextSelection;
  var _userSelect;
  if ('onselectstart' in document) {
  	disableTextSelection = function () {
  		on(window, 'selectstart', preventDefault);
  	};
  	enableTextSelection = function () {
  		off(window, 'selectstart', preventDefault);
  	};
  } else {
  	var userSelectProperty = testProp(
  		['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

  	disableTextSelection = function () {
  		if (userSelectProperty) {
  			var style = document.documentElement.style;
  			_userSelect = style[userSelectProperty];
  			style[userSelectProperty] = 'none';
  		}
  	};
  	enableTextSelection = function () {
  		if (userSelectProperty) {
  			document.documentElement.style[userSelectProperty] = _userSelect;
  			_userSelect = undefined;
  		}
  	};
  }

  // @function disableImageDrag()
  // As [`Q3D.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
  // for `dragstart` DOM events, usually generated when the user drags an image.
  function disableImageDrag() {
  	on(window, 'dragstart', preventDefault);
  }

  // @function enableImageDrag()
  // Cancels the effects of a previous [`Q3D.DomUtil.disableImageDrag`](#domutil-disabletextselection).
  function enableImageDrag() {
  	off(window, 'dragstart', preventDefault);
  }

  var _outlineElement, _outlineStyle;
  // @function preventOutline(el: HTMLElement)
  // Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
  // of the element `el` invisible. Used internally by Leaflet to prevent
  // focusable elements from displaying an outline when the user performs a
  // drag interaction on them.
  function preventOutline(element) {
  	while (element.tabIndex === -1) {
  		element = element.parentNode;
  	}
  	if (!element.style) { return; }
  	restoreOutline();
  	_outlineElement = element;
  	_outlineStyle = element.style.outline;
  	element.style.outline = 'none';
  	on(window, 'keydown', restoreOutline);
  }

  // @function restoreOutline()
  // Cancels the effects of a previous [`Q3D.DomUtil.preventOutline`]().
  function restoreOutline() {
  	if (!_outlineElement) { return; }
  	_outlineElement.style.outline = _outlineStyle;
  	_outlineElement = undefined;
  	_outlineStyle = undefined;
  	off(window, 'keydown', restoreOutline);
  }

  // @function getSizedParentNode(el: HTMLElement): HTMLElement
  // Finds the closest parent node which size (width and height) is not null.
  function getSizedParentNode(element) {
  	do {
  		element = element.parentNode;
  	} while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
  	return element;
  }

  // @function getScale(el: HTMLElement): Object
  // Computes the CSS scale currently applied on the element.
  // Returns an object with `x` and `y` members as horizontal and vertical scales respectively,
  // and `boundingClientRect` as the result of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
  function getScale(element) {
  	var rect = element.getBoundingClientRect(); // Read-only in old browsers.

  	return {
  		x: rect.width / element.offsetWidth || 1,
  		y: rect.height / element.offsetHeight || 1,
  		boundingClientRect: rect
  	};
  }

  var DomUtil = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TRANSFORM: TRANSFORM,
    TRANSITION: TRANSITION,
    TRANSITION_END: TRANSITION_END,
    get: get,
    getStyle: getStyle,
    create: create$1,
    remove: remove,
    empty: empty,
    toFront: toFront,
    toBack: toBack,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    setClass: setClass,
    getClass: getClass,
    setOpacity: setOpacity,
    testProp: testProp,
    setTransform: setTransform,
    setPosition: setPosition,
    getPosition: getPosition,
    get disableTextSelection () { return disableTextSelection; },
    get enableTextSelection () { return enableTextSelection; },
    disableImageDrag: disableImageDrag,
    enableImageDrag: enableImageDrag,
    preventOutline: preventOutline,
    restoreOutline: restoreOutline,
    getSizedParentNode: getSizedParentNode,
    getScale: getScale
  });

  /* @class SceneNode
   * @aka Q3D.SceneNode
   *
   * 表示场景中的节点封装对象,便于获取节点的相关信息
   *
   * @example
   *
   * ```
   * var node = Q3D.sceneNode("XHQ/test");
   * var nodeType = await node.getNodeType();
   * ```
   */

  function SceneNode(areaName, nodeName) {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    this._nodeFullName =
      nodeName === undefined ? areaName : areaName + "/" + nodeName;
  }

  SceneNode.prototype = {
    // @method get(): QSceneNode
    // 返回对应的原生 QSceneNode 对象
    get: async function() {
      var _wm = Module.EngineClient.impl().getWorldManager();
      return await asyncHandle(
        _wm,
        _wm.getSceneNode,
        AsyncFunImpl.QSceneNode,
        this._nodeFullName
      );
    },

    // @method getName(): String
    //获取节点名称
    getName: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getName, AsyncFunImpl.String)
        : "";
    },

    // @method getAlias(): String
    //获取节点别名
    getAlias: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getAlias, AsyncFunImpl.String)
        : "";
    },

    // @method getFullName(): String
    //获取节点全名
    getFullName: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getFullName, AsyncFunImpl.String)
        : "";
    },

    // @method getNodeType(): String
    //获取节点类型
    getNodeType: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getNodeType, AsyncFunImpl.Int)
        : 0xffffffff;
    },

    // @method getArea(): QAreaSceneManager
    //获取节点所在场景对象
    getArea: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getArea, AsyncFunImpl.QAreaSceneManager)
        : null;
    },

    // @method getAreaName(): String
    //获取节点所在场景名称
    getAreaName: async function() {
      var _node = await this.get();
      var _area = _node
        ? await asyncHandle(_node, _node.getArea, AsyncFunImpl.QAreaSceneManager)
        : null;
      return _area
        ? await asyncHandle(_area, _area.getName, AsyncFunImpl.String)
        : "";
    },

    // @method getLayer(): QLayer
    //获取节点所在图层对象
    getLayer: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getLayer, AsyncFunImpl.QLayer)
        : null;
    },

    // @method getLayerName(): String
    //获取节点所在图层名
    getLayerName: async function() {
      var _node = await this.get();
      var _layer = _node
        ? await asyncHandle(_node, _node.getLayer, AsyncFunImpl.QLayer)
        : null;
      return _layer
        ? await asyncHandle(_layer, _layer.getLayerName, AsyncFunImpl.String)
        : "";
    },

    // @method getPosition(): QVector3
    //获取节点相对于父节点的位置坐标
    getPosition: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getPosition, AsyncFunImpl.QVector3)
        : null;
    },

    // @method getDerivedPos(): QVector3
    //获取节点相对于场景的位置坐标
    getDerivedPos: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getDerivedPos, AsyncFunImpl.QVector3)
        : null;
    },

    // @method getAbsPos(): QVector3d
    //获取节点大地坐标
    getAbsPos: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getAbsPos, AsyncFunImpl.QVector3d)
        : null;
    },

    // @method getOrientation(): QVector3
    //获取节点方位角
    getOrientation: async function(rel) {
      var _node = await this.get();
      return _node
        ? await asyncHandle(
            _node,
            _node.getOrientation,
            AsyncFunImpl.QVector3,
            rel
          )
        : null;
    },

    // @method getScale(): QVector3
    //获取节点缩放比例
    getScale: async function(rel) {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getScale, AsyncFunImpl.QVector3, rel)
        : null;
    },

    // @method getParent(): SceneNode
    //获取节点的父节点(封装)
    getParent: async function() {
      var _node = await this.get();
      var _pnode = _node
        ? await asyncHandle(_node, _node.getParent, AsyncFunImpl.QSceneNode)
        : null;
      var _fname = _pnode
        ? await asyncHandle(_pnode, _pnode.getFullName, AsyncFunImpl.String)
        : "";
      return _fname != "" ? new SceneNode(_fname) : null;
    },

    // @method getChildren(): Array
    //获取节点的所有直接子节点(封装)
    getChildren: async function() {
      var _nodesEnc = [];
      var _node = await this.get();
      var _nodes = _node
        ? await asyncHandle(_node, _node.getChildren, AsyncFunImpl.QSceneNodeList)
        : null;
      if (_nodes) {
        var _node = await asyncHandle(
          _nodes,
          _nodes.firstNode,
          AsyncFunImpl.QSceneNode
        );
        if (_node) {
          var _fname = await asyncHandle(
            _node,
            _node.getFullName,
            AsyncFunImpl.String
          );
          _nodesEnc.push(new SceneNode(_fname));
          while (true) {
            _node = await asyncHandle(
              _nodes,
              _nodes.nextNode,
              AsyncFunImpl.QSceneNode
            );
            if (!_node) break;
            _fname = await asyncHandle(
              _node,
              _node.getFullName,
              AsyncFunImpl.String
            );
            _nodesEnc.push(new SceneNode(_fname));
          }
        }
        _nodes.release();
      }
      return _nodesEnc;
    },

    // @method getChildrenDerived(): Array
    //获取所有的子节点对象(封装)
    getChildrenDerived: async function() {
      var _nodesEnc = [];
      var _node = await this.get();
      var _nodes = _node
        ? await asyncHandle(
            _node,
            _node.getChildrenDerived,
            AsyncFunImpl.QSceneNodeList
          )
        : null;
      if (_nodes) {
        var _node = await asyncHandle(
          _nodes,
          _nodes.firstNode,
          AsyncFunImpl.QSceneNode
        );
        if (_node) {
          var _fname = await asyncHandle(
            _node,
            _node.getFullName,
            AsyncFunImpl.String
          );
          _nodesEnc.push(new SceneNode(_fname));
          while (true) {
            _node = await asyncHandle(
              _nodes,
              _nodes.nextNode,
              AsyncFunImpl.QSceneNode
            );
            if (!_node) break;
            _fname = await asyncHandle(
              _node,
              _node.getFullName,
              AsyncFunImpl.String
            );
            _nodesEnc.push(new SceneNode(_fname));
          }
        }
        _nodes.release();
      }
      return _nodesEnc;
    },

    // @method getAABB(): QAABB
    //获取节点的AABB参数
    getAABB: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getAABB, AsyncFunImpl.QAABB)
        : null;
    },

    // @method getFlyToPos(): QVector3
    //获取节点 flyToNode 对应的位置
    getFlyToPos: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getFlyToPos, AsyncFunImpl.QVector3)
        : null;
    },

    // @method getFlyToOri(): QVector3
    //获取节点 flyToNode 对应的方位角
    getFlyToOri: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.getFlyToOri, AsyncFunImpl.QVector3)
        : null;
    },

    // @method isVisible(): Boolean
    //获取节点是否可见
    isVisible: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.isVisible, AsyncFunImpl.Boolean)
        : false;
    },

    // @method isQueryEnabled(): Boolean
    //获取节点是否允许查询
    isQueryEnabled: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.isQueryEnabled, AsyncFunImpl.Boolean)
        : false;
    },

    // @method isOutlineEffectEnabled(): Boolean
    //获取节点是否显示描边
    isOutlineEffectEnabled: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(
            _node,
            _node.isOutlineEffectEnabled,
            AsyncFunImpl.Boolean
          )
        : false;
    },

    // @method isSpecialTransparent(): Boolean
    //获取是否特殊透明
    isSpecialTransparent: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(
            _node,
            _node.isSpecialTransparent,
            AsyncFunImpl.Boolean
          )
        : false;
    },

    // @method isForbidSelect(): Boolean
    //获取节点是否禁止选择: true-禁止; false-允许
    isForbidSelect: async function() {
      var _node = await this.get();
      return _node
        ? await asyncHandle(_node, _node.isForbidSelect, AsyncFunImpl.Boolean)
        : false;
    },

    // @method setDepthWriteEnable(openDW?: Boolean): Boolean
    // 设置节点是否开启深度写: true-禁止; false-允许
    setDepthWriteEnable: async function(openDW) {
      var node = await this.get();
      var nodeType = await asyncHandle(node, node.getNodeType, AsyncFunImpl.Int);
      if (
        nodeType != Enums.sceneNodeType.SNODE_Model &&
        nodeType != Enums.sceneNodeType.SNODE_VecModel &&
        nodeType != Enums.sceneNodeType.SNODE_Line
      )
        return false;

      var realNode = null,
        matCnt = 0;
      if (nodeType == Enums.sceneNodeType.SNODE_Model) {
        realNode = node.asModel();
        matCnt = await asyncHandle(
          realNode,
          realNode.getMaterialCount,
          AsyncFunImpl.Int
        );
      } else if (nodeType == Enums.sceneNodeType.SNODE_VecModel) {
        realNode = node.asVecModel();
        matCnt = await asyncHandle(
          realNode,
          realNode.getMaterialCount,
          AsyncFunImpl.Int
        );
      } else {
        realNode = node.asLine();
        matCnt = 1;
      }
      var mat = null;
      for (var i = 0; i <= matCnt - 1; i++) {
        if (nodeType == Enums.sceneNodeType.SNODE_Line)
          mat = await asyncHandle(
            realNode,
            realNode.getMaterial,
            AsyncFunImpl.QMaterial
          );
        else
          mat = await asyncHandle(
            realNode,
            realNode.getMaterial,
            AsyncFunImpl.QMaterial,
            i
          );
        if (!mat) continue;
        mat.setDepthWriteEnable(openDW);
      }
      return true;
    }
  };

  // @factory Q3D.sceneNode(areaName: String, nodeName?: String)
  // 获取场景中的节点对象
  function getSceneNode(areaName, nodeName) {
    return new SceneNode(areaName, nodeName);
  }

  /*
   * @class Map
   * @aka Q3D.Map
   *
   * QMap3D Chrome 版本主引擎封装对象： 将 Web 页面中的 Canvas 容器作为三维引擎渲染容器并支持各种交互操作。
   *
   * @example
   *
   * ```js
   * // 以 "canvas" 作为容器初始化三维引擎封装对象，以 JSON 对象方式传递初始化参数。
   * var map = Q3D.map('canvas', {
   *  // 场景发布 URL 地址，且该地址能获取到合法授权
   *  SERVER_PATH: "http://" + location.host + "/qmapv2/mapdata3d/xihongqiao",
   *  // 场景配置文件名
   *  CONFIG_NAME: "Example",
   *  // 本地缓存地址，如果不设置且采用本地渲染服务的，会在渲染服务exe所在目录下创建所需缓存
   *  DATA_PATH: "D:/Cache/chrome/xihongqiao",
   *  // 是否开启调试：false 为开启，true 为取消。建议正式使用时关闭调试
   *  KEEP_ALIVE: false,
   *  // 操作惯性参数设置
   *  InertiaDuration: 0.2,
   *  // 初始化完成加载回调事件
   *  OnLoadEnd: null,
   * });
   * ```
   */

  var Map = Evented.extend({
    options: {
      // @option SERVER_PATH: String = null
      // 场景数据发布 URL 地址
      SERVER_PATH: null,
      // @option DATA_PATH: String = null
      // 本地数据缓存目录，如果不设置且采用本地渲染服务的，会在渲染服务EXE所在目录下创建所需缓存
      DATA_PATH: null,
      // @option CONFIG_NAME: String = null
      // 场景 ROOT 文件名称
      CONFIG_NAME: null,
      // @option KEEP_ALIVE: Boolean = true
      // 是否开启调试：false 为开启，true 为取消
      KEEP_ALIVE: true,
      // @option OnLoadEnd: Function = null
      // 自定义初始化完成事件
      OnLoadEnd: null,
      // Whether the map automatically handles browser window resize to update itself.
      trackResize: true,
      // @option InertiaDuration: Number = 0.2
      // 惯性设置
      InertiaDuration: 0.2,
      // 禁止内部输出
      DisableInnerOutput: true
    },

    initialize: function(id, options) {
      // (HTMLElement or String, Object)
      options = setOptions(this, options);

      //判断场景root文件
      if (this.options.CONFIG_NAME == null) {
        throw new Error("没有设置配置文件");
      }

      //判断场景数据下载地址
      if (this.options.SERVER_PATH == null) {
        throw new Error("没有设置场景文件下载地址");
      }

      if (options.DisableInnerOutput) {
        //覆盖out输出
        if (typeof out == "function")
          out = function(data) {
            return;
          };
      }

      this._zoom = this._detectZoom();

      //初始化控件DOM
      this._initContainer(id);
      //初始化事件准备
      this._initEvents();
      //初始化引擎
      this._initEngine(options);

      //初始化鼠标事件
      this._initMouseEvents();
      //初始化键盘常用事件
      this._initKeyEvents();

      this._loaded = true;
      this._pointers = {};
      this._ptcnt = 0;
      this._nodeTransInstanceID = 100; //节点跟随用
      gMap = this;
      window.handleEventMsg = this.handleEventMsg; //wasm消息循环用到

      // 监听窗口最小化处理
      // 各种浏览器兼容
      var state, visibilityChange;
      if (typeof document.hidden !== "undefined") {
        visibilityChange = "visibilitychange";
        state = "visibilityState";
      } else if (typeof document.mozHidden !== "undefined") {
        visibilityChange = "mozvisibilitychange";
        state = "mozVisibilityState";
      } else if (typeof document.msHidden !== "undefined") {
        visibilityChange = "msvisibilitychange";
        state = "msVisibilityState";
      } else if (typeof document.webkitHidden !== "undefined") {
        visibilityChange = "webkitvisibilitychange";
        state = "webkitVisibilityState";
      }
      // 添加监听器，支持IE10/IE11/FF/Chrome
      document.addEventListener(
        visibilityChange,
        function() {
          //document.title = document[state];
          if ("hidden" === document[state])
            Module.EngineClient.impl().enable(false);
          else Module.EngineClient.impl().enable(true);
        },
        false
      );
    },

    // map initialization methods
    _initContainer: function(id) {
      var container = (this._container = get(id));

      if (!container) {
        throw new Error("地图容器未找到.");
      } else if (container._q3d_id) {
        throw new Error("地图容器已经初始化.");
      }
      //DomEvent.on(container, 'scroll', this._onScroll, this);
      this._containerId = stamp(container);

      //需要检查display: block
    },

    //引擎初始化
    _initEngine: async function(options) {
      var width = this._container.clientWidth;
      var height = this._container.clientHeight;

      //获取引擎对象
      var g_engineClient = this.get();

      g_engineClient.setRenderMode(0);
      g_engineClient.setRenderQuality(0);

      // server log: 0-close 1-open
      g_engineClient.setInitPara_i("SERVER_DEBUG_LOG", 0);
      g_engineClient.setInitPara_c("SERVER_PATH", options.SERVER_PATH);
      if (options.DATA_PATH)
        g_engineClient.setInitPara_c("DATA_PATH", options.DATA_PATH); //本地缓存地址，可根据情况修改
      g_engineClient.setInitPara_c("CONFIG_NAME", options.CONFIG_NAME);
      g_engineClient.setInitPara_c("DOWNLOAD_TYPE", "REAL");

      g_engineClient.setInitPara_i("WIDTH", width);
      g_engineClient.setInitPara_i("HEIGHT", height);
      g_engineClient.setInitPara_i("RES_PREPARE_THREADS", 4);
      g_engineClient.setInitPara_i("FONT_MIPMAP", 1);
      g_engineClient.setInitPara_i("RENDER_FEATURE", 3);
      g_engineClient.setInitPara_i("KEEP_ALIVE", this.options.KEEP_ALIVE ? 1 : 0); //默认关闭：1  服务端发现没通讯会自动退出；0 不检查，用于调试

      g_engineClient.setListener(true);
      g_engineClient.init();

      //g_engineClient.getWorldManager().setListener(true);

      var result = await asyncHandle(
        g_engineClient,
        g_engineClient.load,
        AsyncFunImpl.Boolean
      );
      if (!result) {
        throw new Error("地图引擎加载失败.");
      }

      //定义鼠标消息传递类型
      var im = g_engineClient.getInputManager();
      im.setMouseMsgType(1);

      //键盘控制定义
      im.createAction_i(Enums.actionType.TRANS_LEFTX); // 左移
      im.createAction_i(Enums.actionType.TRANS_RIGHT); // 右移
      im.createAction_i(Enums.actionType.TRANS_FORTH); // 前进
      im.createAction_i(Enums.actionType.TRANS_BACKX); // 后退
      im.createAction_i(Enums.actionType.TRANS_UPXXX); // 上升
      im.createAction_i(Enums.actionType.TRANS_DOWNX); // 下降

      //平移
      im.createAction_i(Enums.actionType.TRANS_UDLRX); //平移摄像机
      im.createAction_i(Enums.actionType.TRANS_SCENE); //平移场景( 拖拽 )

      //缩放 ( D:Dynamic; S:Static )
      im.createAction_i(Enums.actionType.SCALED_CENTER); // 缩放：方向按屏幕中心方向；速度按拾取线段长度比例，如果未拾取到任何东西，退化为STATIC参数处理
      im.createAction_i(Enums.actionType.SCALES_CENTER); // 缩放：方向按屏幕中心方向；速度按固定设置参数
      im.createAction_i(Enums.actionType.SCALED_SCREEN); // 缩放：方向按( Eye，ScreenPnt )射线方向；速度按拾取线段长度比例，如果未拾取到任何东西，退化为STATIC参数处理
      im.createAction_i(Enums.actionType.SCALES_SCREEN); // 缩放：方向按( Eye，ScreenPnt )射线方向；速度按固定设置参数
      im.createAction_i(Enums.actionType.CAMERA_CLOSETO); // 贴近

      //旋转 ( S:Separately; T:Together )
      im.createAction_i(Enums.actionType.ROTATES_CAMERA); // 旋转摄像机，yaw,pitch分离，每次操作只取其一
      im.createAction_i(Enums.actionType.ROTATET_CAMERA); // 旋转摄像机，yaw,pitch融合
      im.createAction_i(Enums.actionType.ROTATES_SCREEN); // 旋转场景，以拾取点为旋转基点,Separately
      im.createAction_i(Enums.actionType.ROTATET_SCREEN); //旋转场景，以拾取点为旋转基点,Together
      im.createAction_i(Enums.actionType.ROTATES_CENTER); // 旋转场景，以屏幕中心点在basePlane上的拾取点为基点,Separately
      im.createAction_i(Enums.actionType.ROTATET_CENTER); // 旋转场景，以屏幕中心点在basePlane上的拾取点为基点,Together
      im.createAction_i(Enums.actionType.ROTATES_FIXPNT); // 绕固定点旋转，yaw,pitch分离
      im.createAction_i(Enums.actionType.ROTATET_FIXPNT); //绕固定点旋转，yaw,pitch融合

      //漫游
      im.createAction_i(Enums.actionType.RAMBLE_KEEPORI); //漫游：方位不变( 第三人称 )

      //模型编辑
      im.createAction_i(Enums.actionType.OBJECTSELECT_MOVAUX);
      im.createAction_i(Enums.actionType.OBJECTSELECT_ROTAUX);
      im.createAction_i(Enums.actionType.OBJECTSELECT_SCAAUX);

      //移动设备( YPS:YawPitchScale, S:Separately, T:Together )
      im.createAction_i(Enums.actionType.YPSS_SCREEN); // 分离操作，以屏幕点为旋转基点和缩放方向
      im.createAction_i(Enums.actionType.YPST_SCREEN); // 融合操作，以屏幕点为旋转基点和缩放方向
      im.createAction_i(Enums.actionType.YPSS_CENTER); // 分离操作，以屏幕中心为旋转基点和缩放方向
      im.createAction_i(Enums.actionType.YPST_CENTER); // 融合操作，以屏幕中心为旋转基点和缩放方向

      //第三人称
      im.createAction_i(Enums.actionType.THIRD_ROTATE); //
      im.createAction_i(Enums.actionType.THIRD_WHEEL); //
      im.createAction_i(Enums.actionType.THIRD_MOVELEFT); //
      im.createAction_i(Enums.actionType.THIRD_MOVERIGHT); //
      im.createAction_i(Enums.actionType.THIRD_MOVEFORTH); //
      im.createAction_i(Enums.actionType.THIRD_MOVEBACK); //
      im.createAction_i(Enums.actionType.THIRD_MOVEUP); //
      im.createAction_i(Enums.actionType.THIRD_MOVEDOWN); //
      im.createAction_i(Enums.actionType.THIRD_MOVETO); //点击移动
      im.createAction_i(Enums.actionType.THIRD_CAMERAROTATE); //转动镜头
      im.createAction_i(Enums.actionType.THIRD_TURNLEFT);
      im.createAction_i(Enums.actionType.THIRD_TURNRIGHT);
      im.createAction_i(Enums.actionType.THIRD_LOOKUP);
      im.createAction_i(Enums.actionType.THIRD_LOOKDOWN);

      //平板绑定
      im.bindControlAction(
        Enums.device.MULTITOUCH,
        Enums.multiTouch.TRANS,
        Enums.actionType.TRANS_SCENE
      );
      im.bindControlAction(
        Enums.device.MULTITOUCH,
        Enums.multiTouch.CLOSETO,
        Enums.actionType.CAMERA_CLOSETO
      );
      im.bindControlAction(
        Enums.device.MULTITOUCH,
        Enums.multiTouch.RAMBLE,
        Enums.actionType.RAMBLE_KEEPORI
      );
      im.bindControlAction(
        Enums.device.MULTITOUCH,
        Enums.multiTouch.YPS,
        Enums.actionType.YPSS_CENTER
      );

      //鼠标绑定
      im.bindControlAction(
        Enums.device.MOUSE,
        Enums.mouse.LBUTTON,
        Enums.actionType.TRANS_SCENE
      );
      im.bindControlAction(
        Enums.device.MOUSE,
        Enums.mouse.MBUTTON,
        Enums.actionType.RAMBLE_KEEPORI
      );
      im.bindControlAction(
        Enums.device.MOUSE,
        Enums.mouse.RBUTTON,
        Enums.actionType.ROTATES_SCREEN
      );
      im.bindControlAction(
        Enums.device.MOUSE,
        Enums.mouse.WHEEL,
        Enums.actionType.SCALED_SCREEN
      );

      g_engineClient.getWorldManager().setListener(true); //打开世界管理器监听

      if (isNumber(options.InertiaDuration) && options.InertiaDuration > 0) {
        im.enableInertia();
        im.setInertiaDuration(options.InertiaDuration);
      }

      this._onResize();
    },

    //只支持两点触摸
    _onPointerDown: function(e) {
      var _e = e.originalEvent;
      if (_e.pointerType == "mouse") return;

      //如果已有手指信息，要判断时间间隔超过1s，需要删除
      if (this._ptcnt > 0) {
        var currtt = new Date().getTime();
        for (var val in this._pointers) {
          if (currtt - this._pointers[val].timestamp > 1000) {
            delete this._pointers[val];
            this._ptcnt--;
            console.log("delete  pointerId : " + val);
          }
        }
      }
      this._pointers[_e.pointerId] = {
        x: _e.clientX,
        y: _e.clientY,
        pointerType: _e.pointerType,
        pointerId: _e.pointerId,
        timestamp: new Date().getTime()
      };
      console.log(
        _e.pointerType +
          " pointerId : " +
          _e.pointerId +
          " x:" +
          _e.x +
          " y:" +
          _e.y
      );

      var x1,
        y1,
        x2 = 0,
        y2 = 0,
        count = 0;
      for (var val in this._pointers) {
        count++;
        if (count == 1) {
          x1 = Math.floor(this._pointers[val].x);
          y1 = Math.floor(this._pointers[val].y);
        } else if (count == 2) {
          x2 = Math.floor(this._pointers[val].x);
          y2 = Math.floor(this._pointers[val].y);
        }
      }
      if (count > 0 && count < 3) {
        var _inputManager = this.get().getInputManager();
        _inputManager.setTouchEvent(
          count,
          x1 * this._zoom,
          y1 * this._zoom,
          x2 * this._zoom,
          y2 * this._zoom,
          2
        );
        console.log(
          "down: " +
            _e.pointerId +
            ", current: " +
            count +
            "," +
            x1 +
            "," +
            y1 +
            "," +
            x2 +
            "," +
            y2
        );
      }
      this._ptcnt++; //有新的手指按下
      _e.preventDefault();
    },

    _onPointerMove: function(e) {
      var _e = e.originalEvent;
      if (_e.pointerType == "mouse") return;

      // Prevent the browser from doing its default thing (scroll, zoom)
      var pointer = this._pointers[_e.pointerId];
      if (pointer) {
        if (
          Math.abs(pointer.x - _e.clientX) + Math.abs(pointer.y - _e.clientY) <
          3
        ) {
          return;
        }
        pointer.x = _e.clientX;
        pointer.y = _e.clientY;
      }
      var x1,
        y1,
        x2 = 0,
        y2 = 0,
        count = 0;
      for (var val in this._pointers) {
        count++;
        if (count == 1) {
          x1 = Math.floor(this._pointers[val].x);
          y1 = Math.floor(this._pointers[val].y);
        } else if (count == 2) {
          x2 = Math.floor(this._pointers[val].x);
          y2 = Math.floor(this._pointers[val].y);
        }
      }
      if (count > 0 && count < 3) {
        var _inputManager = this.get().getInputManager();
        _inputManager.setTouchEvent(
          count,
          x1 * this._zoom,
          y1 * this._zoom,
          x2 * this._zoom,
          y2 * this._zoom,
          8
        );
        console.log(
          "move: " +
            _e.pointerId +
            ", current: " +
            count +
            "," +
            x1 +
            "," +
            y1 +
            "," +
            x2 +
            "," +
            y2
        );
      }
      _e.preventDefault();
    },

    _onPointerUp: function(e) {
      var _e = e.originalEvent;
      if (_e.pointerType == "mouse") return;

      var x1,
        y1,
        x2 = 0,
        y2 = 0,
        count = 0;
      for (var val in this._pointers) {
        count++;
        if (count == 1) {
          x1 = Math.floor(this._pointers[val].x);
          y1 = Math.floor(this._pointers[val].y);
        } else if (count == 2) {
          x2 = Math.floor(this._pointers[val].x);
          y2 = Math.floor(this._pointers[val].y);
        }
      }
      if (count > 0 && count < 3) {
        var _inputManager = this.get().getInputManager();
        _inputManager.setTouchEvent(
          count,
          x1 * this._zoom,
          y1 * this._zoom,
          x2 * this._zoom,
          y2 * this._zoom,
          4
        );
        delete this._pointers[_e.pointerId];
        this._ptcnt--; //有手指释放
        console.log(
          "up: " +
            _e.pointerId +
            ", current: " +
            count +
            "," +
            x1 +
            "," +
            y1 +
            "," +
            x2 +
            "," +
            y2
        );
      }
      _e.preventDefault();
    },

    // @method getInfoByClick(ev: Object): PickResult
    // 获得场景点击位置的相关信息，通常在鼠标单击事件中调用
    getInfoByClick: async function(e) {
      var _pnt = this.getClickPosition(e);
      var screenCoord = toVector2I(_pnt.x, _pnt.y).get();
      var world = this.get().getWorldManager();
      var mainCamera = await asyncHandle(
        world,
        world.getMainCamera,
        AsyncFunImpl.QGlobalCamera,
        0
      ); //获取主摄像机对象
      var pickNodeResult = await asyncHandle(
        mainCamera,
        mainCamera.pickNearsetSceneNode,
        AsyncFunImpl.QCamera_pickResult,
        screenCoord,
        0xffffffff
      );
      var nearestNode = pickNodeResult.getNode();
      var parentNode = null,
        nodeName = "",
        parentName = "";
      if (nearestNode) {
        nodeName = await asyncHandle(
          nearestNode,
          nearestNode.getFullName,
          AsyncFunImpl.String
        );
        parentNode = await asyncHandle(
          nearestNode,
          nearestNode.getParent,
          AsyncFunImpl.QSceneNode
        );
        if (parentNode) {
          parentName = await asyncHandle(
            parentNode,
            parentNode.getFullName,
            AsyncFunImpl.String
          );
        }
      }
      var pickPosResult = await asyncHandle(
        mainCamera,
        mainCamera.pickNearsetScenePoint,
        AsyncFunImpl.QCamera_pickResult,
        screenCoord,
        0xffffffff
      );
      var groundCoord = pickPosResult.getPos();
      var areaCoord = null,
        areaName = "";
      if (nearestNode && groundCoord) {
        var area = await asyncHandle(
          nearestNode,
          nearestNode.getArea,
          AsyncFunImpl.QAreaSceneManager
        );
        if (area) {
          areaName = await asyncHandle(area, area.getName, AsyncFunImpl.String);
          areaCoord = await toVector3d(groundCoord).toLocalPos(areaName);
        }
      }

      return {
        logX: _pnt.x,
        logY: _pnt.y,
        groundX: groundCoord == null ? 0 : groundCoord.x,
        groundY: groundCoord == null ? 0 : groundCoord.y,
        groundZ: groundCoord == null ? 0 : groundCoord.z,
        areaName: areaName,
        parentName: parentName,
        nodeName: nodeName,
        NearestNode: nearestNode,
        ParentNode: parentNode,
        ScreenCoord: screenCoord,
        GroundCoord: groundCoord,
        AreaCoord: areaCoord,
        ShiftPressDown: e.originalEvent.shiftKey,
        CtrlPressDown: e.originalEvent.ctrlKey
      };
    },

    _initMouseEvents: function() {
      //挂接鼠标操作
      this.on("mousedown", function(ev) {
        var _inputManager = this.get().getInputManager();
        var _e = ev.originalEvent;
        var _c = this._container;
        var _pnt = getMousePosition(_e, _c).multiplyBy(this._zoom);
        if (_e.button == 0)
          //左
          _inputManager.setMouseMsg(0, _pnt.x, _pnt.y, 0, 0);
        else if (_e.button == 1)
          _inputManager.setMouseMsg(2, _pnt.x, _pnt.y, 0, 0);
        else _inputManager.setMouseMsg(1, _pnt.x, _pnt.y, 0, 0);
      });
      this.on("mouseup", function(ev) {
        var _inputManager = this.get().getInputManager();
        var _e = ev.originalEvent;
        var _c = this._container;
        var _pnt = getMousePosition(_e, _c).multiplyBy(this._zoom);
        if (_e.button == 0)
          //左
          _inputManager.setMouseMsg(0, _pnt.x, _pnt.y, 0, 1);
        else if (_e.button == 1)
          _inputManager.setMouseMsg(2, _pnt.x, _pnt.y, 0, 1);
        else _inputManager.setMouseMsg(1, _pnt.x, _pnt.y, 0, 1);
      });
      this.on("mousemove", function(ev) {
        var _inputManager = this.get().getInputManager();
        var _e = ev.originalEvent;
        var _c = this._container;
        var _pnt = getMousePosition(_e, _c).multiplyBy(this._zoom);
        if (_e.button == 0)
          //左
          _inputManager.setMouseMsg(0, _pnt.x, _pnt.y, 0, 2);
        else if (_e.button == 1)
          _inputManager.setMouseMsg(2, _pnt.x, _pnt.y, 0, 2);
        else _inputManager.setMouseMsg(1, _pnt.x, _pnt.y, 0, 2);
      });
      this.on("mousewheel wheel", function(ev) {
        var _inputManager = this.get().getInputManager();
        var _e = ev.originalEvent;
        var _c = this._container;
        var _pnt = getMousePosition(_e, _c).multiplyBy(this._zoom);
        var _wheelDelta = getWheelDelta(_e);
        _inputManager.setMouseMsg(
          2,
          _pnt.x,
          _pnt.y /*_e.wheelDelta*/,
          _wheelDelta,
          3
        );
      });
      //挂接触屏操作
      this.on("pointerdown", this._onPointerDown);
      this.on("pointerup", this._onPointerUp);
      this.on("pointermove", this._onPointerMove);
      this.on("pointercancel", this._onPointerUp);
    },

    _initKeyEvents: function() {
      this.on("keydown", async function(e) {
        var _e = e.originalEvent;
        var _keyID = _e.keyCode ? _e.keyCode : _e.which;
        if (_keyID == Enums.keyboard.Y.wparam && _e.ctrlKey) {
          //注册 Ctrl + Y
          var _wm = this.get().getWorldManager();
          var _enabled = await asyncHandle(
            _wm,
            _wm.isUIenabled,
            AsyncFunImpl.Boolean
          );
          if (_enabled) {
            _wm.disableUI();
          } else {
            _wm.enableUI();
          }
        } else if (_keyID == Enums.keyboard.F2.wparam && _e.ctrlKey) {
          //Ctrl + F2
          var g_engineClient = this.get();
          var verInfo = await asyncHandle(
            g_engineClient,
            g_engineClient.getVersion,
            AsyncFunImpl.String
          );
          this.showNotice("提示", "当前控件版本号：V" + verInfo, 2000);
        } else if (_keyID == Enums.keyboard.F7.wparam) {
          //F7 绑定F7显示当前主摄像机位置角度信息
          if (this._enableDebug && console) {
            console.log(
              "===================当前主摄像机信息开始==================="
            );
            var world = this.get().getWorldManager();
            //获取主摄像机对象
            var mainCamera = await asyncHandle(
              world,
              world.getMainCamera,
              AsyncFunImpl.QGlobalCamera,
              0
            );
            //获取主摄像机当前位置(平面坐标)
            var v3d = await asyncHandle(
              mainCamera,
              mainCamera.getAbsPos,
              AsyncFunImpl.QVector3d
            );
            //获取主摄像机当前位置(经纬度坐标)
            var gv3d = await toVector3d(v3d).toGlobalVec3d();
            //获取主摄像机当前角度
            var v3 = await asyncHandle(
              mainCamera,
              mainCamera.getOrientation,
              AsyncFunImpl.QVector3,
              2
            );
            // 获取偏航角
            var yaw = await asyncHandle(
              mainCamera,
              mainCamera.fetchRotYaw,
              AsyncFunImpl.Float
            );
            // 获取俯仰角
            var pitch = await asyncHandle(
              mainCamera,
              mainCamera.fetchRotPitch,
              AsyncFunImpl.Float
            );

            var operateTime = new Date();
            console.log(
              "操作时间 : " +
                operateTime.getHours() +
                ":" +
                operateTime.getMinutes() +
                ":" +
                operateTime.getSeconds()
            );
            console.log(
              "主摄像机当前位置(平面坐标) : " +
                toVector3d(v3d).toString(6)
            );
            console.log(
              "主摄像机当前位置(经纬度坐标) : " +
                toGlobalVec3d(gv3d).toString(6)
            );
            console.log(
              "主摄像机当前角度 : " + toVector3(v3).toString(4)
            );
            console.log(
              "主摄像机当前俯仰偏航角 : " +
                pitch.toFixed(4) +
                "," +
                yaw.toFixed(4)
            );
            console.log(
              "===================当前主摄像机信息结束==================="
            );
          }
        } else if (_keyID == Enums.keyboard.F9.wparam && _e.ctrlKey) {
          //Ctrl + F9 开启DeBug模式
          this._enableDebug = this._enableDebug ? false : true;
          if (console) {
            console.log("调试模式" + (this._enableDebug ? "开启" : "关闭"));
          }

          var _justfordebug_ = async function(e) {
            var options = await this.getInfoByClick(e);
            if (this._enableDebug && console) {
              console.log(
                "========================================================================================"
              );
              var operateTime = new Date();
              console.log(
                "操作时间：" +
                  operateTime.getHours() +
                  ":" +
                  operateTime.getMinutes() +
                  ":" +
                  operateTime.getSeconds()
              );
              if (options.GroundCoord) {
                console.log(
                  "当前点击位置相对坐标：" +
                    toVector3(options.AreaCoord).toString(4)
                );
                console.log(
                  "当前点击位置平面坐标：" +
                    toVector3d(options.GroundCoord).toString(6)
                );
                var gv3d = await toVector3d(
                  options.GroundCoord
                ).toGlobalVec3d();
                console.log(
                  "当前点击位置经纬度坐标：" +
                    toGlobalVec3d(gv3d).toString(6)
                );
              }
              if (options.NearestNode) {
                console.log("当前区域：" + options.areaName);
                console.log("当前点击选中节点：" + options.nodeName);
                console.log(
                  "当前点击选中节点父节点：" +
                    (options.ParentNode == null
                      ? "节点为根节点"
                      : options.parentName)
                );
              }
              console.log(
                "========================================================================================"
              );
            }
          };
          if (this._enableDebug) {
            //添加鼠标点击测试功能
            this.on("click", _justfordebug_);
          } else {
            this.off("click", _justfordebug_);
          }
        }

        //_inputManager.onKeyDown(keyID);
      });
    },

    // DOM event handling

    getClickPosition: function(e) {
      var _e = e.originalEvent;
      var _c = this._container;
      return getMousePosition(_e, _c).multiplyBy(this._zoom);
    },

    _draggableMoved: function(obj) {
      obj = obj.dragging && obj.dragging.enabled() ? obj : this;
      return (
        (obj.dragging && obj.dragging.moved()) ||
        (this.boxZoom && this.boxZoom.moved())
      );
    },

    _findEventTargets: function(e, type) {
      var targets = [],
        target,
        isHover = type === "mouseout" || type === "mouseover",
        src = e.target || e.srcElement,
        dragging = false;

      while (src) {
        target = this._targets[stamp(src)];
        if (
          target &&
          (type === "click" || type === "preclick") &&
          !e._simulated &&
          this._draggableMoved(target)
        ) {
          // Prevent firing click after you just dragged an object.
          dragging = true;
          break;
        }
        if (target && target.listens(type, true)) {
          if (isHover && !isExternalTarget(src, e)) {
            break;
          }
          targets.push(target);
          if (isHover) {
            break;
          }
        }
        if (src === this._container) {
          break;
        }
        src = src.parentNode;
      }
      if (
        !targets.length &&
        !dragging &&
        !isHover &&
        isExternalTarget(src, e)
      ) {
        targets = [this];
      }
      return targets;
    },

    _handleDOMEvent: function(e) {
      if (!this._loaded || skipped(e)) {
        return;
      }

      var type = e.type;

      if (type === "mousedown") {
        // prevents outline when clicking on keyboard-focusable element
        preventOutline(e.target || e.srcElement);
      }

      this._fireDOMEvent(e, type);
    },

    _fireDOMEvent: function(e, type, targets) {
      if (e.type === "click") {
        // Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
        // preclick: MouseEvent
        // Fired before mouse click on the map (sometimes useful when you
        // want something to happen on click before any existing click
        // handlers start running).
        var synth = extend({}, e);
        synth.type = "preclick";
        this._fireDOMEvent(synth, synth.type, targets);
      }

      if (e._stopped) {
        return;
      }

      // Find the layer the event is propagating from and its parents.
      targets = (targets || []).concat(this._findEventTargets(e, type));

      if (!targets.length) {
        return;
      }

      var target = targets[0];
      if (type === "contextmenu" && target.listens(type, true)) {
        preventDefault(e);
      }

      var data = {
        originalEvent: e
      };

      for (var i = 0; i < targets.length; i++) {
        targets[i].fire(type, data, true);
        if (
          data.originalEvent._stopped ||
          (targets[i].options.bubblingMouseEvents === false &&
            indexOf(this._mouseEvents, type) !== -1)
        ) {
          return;
        }
      }
    },

    _initEvents: function(remove) {
      this._targets = {};
      this._targets[stamp(this._container)] = this;

      var onOff = remove ? off : on;

      // click: MouseEvent
      // Fired when the user clicks (or taps) the map.
      // dblclick: MouseEvent
      // Fired when the user double-clicks (or double-taps) the map.
      // mousedown: MouseEvent
      // Fired when the user pushes the mouse button on the map.
      // mouseup: MouseEvent
      // Fired when the user releases the mouse button on the map.
      // mouseover: MouseEvent
      // Fired when the mouse enters the map.
      // mouseout: MouseEvent
      // Fired when the mouse leaves the map.
      // mousemove: MouseEvent
      // Fired while the mouse moves over the map.
      // contextmenu: MouseEvent
      // Fired when the user pushes the right mouse button on the map, prevents
      // default browser context menu from showing if there are listeners on
      // this event. Also fired on mobile when the user holds a single touch
      // for a second (also called long press).
      // keypress: KeyboardEvent
      // Fired when the user presses a key from the keyboard that produces a character value while the map is focused.
      // keydown: KeyboardEvent
      // Fired when the user presses a key from the keyboard while the map is focused. Unlike the `keypress` event,
      // the `keydown` event is fired for keys that produce a character value and for keys
      // that do not produce a character value.
      // keyup: KeyboardEvent
      // Fired when the user releases a key from the keyboard while the map is focused.
      onOff(
        this._container,
        "click dblclick mousedown mouseup " +
          "mousewheel mousemove contextmenu keydown keyup touchstart touchmove touchend",
        this._handleDOMEvent,
        this
      );
      //onOff(this._container, 'mousedown mouseup', this._handleDOMEvent, this);

      if (this.options.trackResize) {
        onOff(window, "resize", this._onResize, this);
      }
    },

    //获取当前页面的缩放值
    _detectZoom: function() {
      var ratio = 0,
        screen = window.screen,
        ua = navigator.userAgent.toLowerCase();

      if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
      } else if (~ua.indexOf("msie")) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
          ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
      } else if (
        window.outerWidth !== undefined &&
        window.innerWidth !== undefined
      ) {
        ratio = window.outerWidth / window.innerWidth;
      }
      return ratio;
    },

    _onResize: function() {
      var ratio = this._zoom;
      const width = window.innerWidth;
      const height = window.innerHeight;
      this._container.width = width * ratio;
      this._container.height = height * ratio;
      this._container.style.width = width + "px";
      this._container.style.height = height + "px";
      var g_engineClient = this.get();
      g_engineClient.setWindowSize(this._container.width, this._container.height);
      g_engineClient.getUISystem().updateRotDiscUI();

      var canvas = document.getElementById("loadingCanvas");
      if (canvas) {
        canvas.style.left = (width - 300) / 2 + "px";
        canvas.style.top = (height - 300) / 2 + "px";
        //document.getElementById("loadingDiv").style.height = width + "px";
      }
    },

    // @method showNotice(title: String, msg: String, lasting: Number): this
    // 显示自定义提示信息
    showNotice: function(title, msg, lasting) {
      var Notification =
        window.Notification ||
        window.mozNotification ||
        window.webkitNotification;
      if (Notification) {
        Notification.requestPermission(function(status) {
          //status默认值'default'等同于拒绝 'denied' 意味着用户不想要通知 'granted' 意味着用户同意启用通知
          if ("granted" != status) {
            return;
          } else {
            var tag = "_q3d_" + Math.random();
            var notify = new Notification(title, {
              dir: "auto",
              lang: "zh-CN",
              tag: tag, //实例化的notification的id
              //icon:'http://www.yinshuajun.com/static/img/favicon.ico',//通知的缩略图,//icon 支持ico、png、jpg、jpeg格式
              body: msg //通知的具体内容
            });
            (notify.onclick = function() {
              //如果通知消息被点击,通知窗口将被激活
              window.focus();
            }),
              (notify.onerror = function() {
                console.log("HTML5桌面消息出错！！！");
              });
            notify.onshow = function() {
              setTimeout(function() {
                notify.close();
              }, lasting); //2000)
            };
            notify.onclose = function() {
              console.log("HTML5桌面消息关闭！！！");
            };
          }
        });
      } else {
        console.log("您的浏览器不支持桌面消息");
        alert(msg);
      }
      return this;
    },

    // @method get(): EngineClient
    //获取主引擎对象
    get: function() {
      return Module.EngineClient.impl();
    },

    // @method toggleFPS()
    // 切换场景相关性能参数是否显示：帧率、三角面数、占用内存等
    toggleFPS: async function() {
      var _wm = this.get().getWorldManager();
      var _enabled = await asyncHandle(
        _wm,
        _wm.isUIenabled,
        AsyncFunImpl.Boolean
      );
      if (_enabled) {
        _wm.disableUI();
      } else {
        _wm.enableUI();
      }
    },

    // @method loadArea(areaName: String): this
    // 加载指定区域，该区域在 ROOT 文件中对应的 manualLoad = true
    loadArea: function(areaName) {
      var _wm = this.get().getWorldManager();
      _wm.loadIndieArea(areaName, 0);
      return this;
    },

    // @method unloadArea(areaName: String): this
    // 卸载指定区域，该区域在 ROOT 文件中对应的 manualLoad = true
    unloadArea: function(areaName) {
      var _wm = this.get().getWorldManager();
      _wm.unloadIndieArea(areaName, 0);
      return this;
    },

    // @method getArea(areaName: String): QAreaSceneManager
    //  获得区域对象
    // ```js
    //  var area = canvasMap.getArea("XHQ");
    //  //直接返回的对象是一个 Promise 对象，要进一步调用接口可以类似写法：
    //  area.then( area => {
    //   if (area) area.setVisible(false);
    //  })
    //  //另外写法:
    //  var area = await canvasMap.getArea("XHQ");
    //  if (area) area.setVisible(false);
    // ```
    getArea: async function(areaName) {
      var _wm = this.get().getWorldManager();
      var _area = await asyncHandle(
        _wm,
        _wm.getArea,
        AsyncFunImpl.QAreaSceneManager,
        areaName
      );
      return _area;
    },

    // @method getSceneNode(areaName: String, nodeName?: String): QSceneNode
    // 获得场景节点对象，如果只输入一个参数，该参数必须可表示节点的完整信息
    getSceneNode: async function(areaName, nodeName) {
      var nodeFullName =
        nodeName === undefined ? areaName : areaName + "/" + nodeName;
      var _wm = this.get().getWorldManager();
      var _node = await asyncHandle(
        _wm,
        _wm.getSceneNode,
        AsyncFunImpl.QSceneNode,
        nodeFullName
      );
      return _node;
    },

    // @method getAllSceneNodeNames(searchStr: String): Array
    // 根据别名搜索场景节点（大小写敏感），返回匹配的节点名称数组
    getAllSceneNodeNames: async function(searchStr) {
      var nodeNames = [];
      var _wm = this.get().getWorldManager();
      var _nodelist = await asyncHandle(
        _wm,
        _wm.findSceneNodeList,
        AsyncFunImpl.QSceneNodeList,
        searchStr
      );
      var _obj = await asyncHandle(
        _nodelist,
        _nodelist.firstNode,
        AsyncFunImpl.QSceneNode
      );
      while (_obj) {
        var _name = await asyncHandle(
          _obj,
          _obj.getFullName,
          AsyncFunImpl.String
        );
        nodeNames.push(_name);
        _obj = await asyncHandle(
          _nodelist,
          _nodelist.nextNode,
          AsyncFunImpl.QSceneNode
        );
      }
      _nodelist.release();
      return nodeNames;
    },

    // @method getSceneNodeBaseInfo(areaName: String, nodeName?: String): Object
    // 获得场景节点对象基本信息(JSON对象)，如果只输入一个参数，该参数必须可表示节点的完整信息
    // 返回结果为：{AbsPos, DerivedPos, Position, Orientation, LayerName}
    getSceneNodeBaseInfo: async function(areaName, nodeName) {
      var nodeFullName =
        nodeName === undefined ? areaName : areaName + "/" + nodeName;
      var _wm = this.get().getWorldManager();
      var _node = await asyncHandle(
        _wm,
        _wm.getSceneNode,
        AsyncFunImpl.QSceneNode,
        nodeFullName
      );
      if (!_node) return null;

      var _nodeInfo = {};
      //平面坐标
      var v3d = await asyncHandle(_node, _node.getAbsPos, AsyncFunImpl.QVector3d);
      _nodeInfo.AbsPos = toVector3d(v3d);
      //相对场景坐标
      var v3_derived = await asyncHandle(
        _node,
        _node.getDerivedPos,
        AsyncFunImpl.QVector3
      );
      _nodeInfo.DerivedPos = toVector3(v3_derived);
      //相对父节点坐标
      var v3 = await asyncHandle(_node, _node.getPosition, AsyncFunImpl.QVector3);
      _nodeInfo.Position = toVector3(v3);
      //旋转角度
      var v3_ori = await asyncHandle(
        _node,
        _node.getOrientation,
        AsyncFunImpl.QVector3,
        2
      );
      _nodeInfo.Orientation = toVector3(v3_ori);
      //所在图层
      var layerName = await asyncHandle(
        _node,
        _node.getLayerName,
        AsyncFunImpl.String
      );
      _nodeInfo.LayerName = layerName;

      return _nodeInfo;
    },

    // @method destroySceneNode(areaName: String, nodeName?: String): Boolean
    // 动态删除场景中的节点对象，如果只输入一个参数，该参数必须可表示节点的完整信息
    destroySceneNode: async function(areaName, nodeName) {
      if (typeof nodeName === "undefined") {
        var path = areaName.split("/");
        if (path.length != 2) return false;

        nodeName = path[path.length - 1];
        areaName = path[0];
      }

      //场景是否存在
      var _wm = this.get().getWorldManager();
      var _area = await asyncHandle(
        _wm,
        _wm.getArea,
        AsyncFunImpl.QAreaSceneManager,
        areaName
      );
      if (!_area) return false;

      //节点是否存在
      var _node = await asyncHandle(
        _area,
        _area.getSceneNode,
        AsyncFunImpl.QSceneNode,
        nodeName
      );
      if (!_node) return false;

      //是否存在子节点，这里不允许带子节点删除
      var _nodelist = await asyncHandle(
        _node,
        _node.getChildrenDerived,
        AsyncFunImpl.QSceneNodeList
      );
      if (_nodelist) return false;

      _area.destroySceneNode(nodeName);
      return true;
    },

    // @method createCommonNode(nodePath: String, nodeType: Q3D.Enums.sceneNodeType): QSceneNode
    // 动态创建通用的节点对象，Node路径"区域/[父节点名称]/要创建的节点名称"，当出现父节点名称时要确保该节点已存在。
    // 若待创建节点已存在或父节点不存在时，返回 null；创建成功返回 QSceneNode 原生对象
    createCommonNode: async function(nodePath, nodeType) {
      var path = nodePath.split("/");
      var pathNodeCount = path.length;
      if (pathNodeCount < 2 || pathNodeCount > 3) return null;

      //判断场景名称是否存在
      var areaName = path[0];
      var _wm = this.get().getWorldManager();
      var _area = await asyncHandle(
        _wm,
        _wm.getArea,
        AsyncFunImpl.QAreaSceneManager,
        areaName
      );
      if (!_area) return null;

      var parentNodeName = null,
        nodeName = null;
      if (pathNodeCount == 2) nodeName = path[1];
      else {
        parentNodeName = path[1];
        nodeName = path[2];
      }

      //尝试获取要创建的节点
      var _nodeToCreate = await asyncHandle(
        _area,
        _area.getSceneNode,
        AsyncFunImpl.QSceneNode,
        nodeName
      );
      if (_nodeToCreate != null) return null;

      var _nodeParent = null;
      if (pathNodeCount == 3) {
        _nodeParent = await asyncHandle(
          _area,
          _area.getSceneNode,
          AsyncFunImpl.QSceneNode,
          parentNodeName
        );
        if (!_nodeParent) return null;
      }
      var commonNodeCreated = null;
      if (pathNodeCount == 2) {
        commonNodeCreated = await asyncHandle(
          _area,
          _area.createTopNode,
          AsyncFunImpl.QSceneNode,
          nodeType,
          nodeName
        );
      } else {
        commonNodeCreated = await asyncHandle(
          _nodeParent,
          _nodeParent.createChildNode,
          AsyncFunImpl.QSceneNode,
          nodeType,
          nodeName,
          false
        );
      }
      return commonNodeCreated;
    },

    // @method enableEditMode(nodePath: String, initEditMode?: Enums.auxOperateType, options?: Edit options): this
    // 开启节点编辑模式（默认为节点移动）。当节点处于编辑模式下，键盘数字 1、2、3 可用于切换不同编辑态（移动、旋转、缩放）；
    // 同时，键盘按下 ESCAPE 键可取消当前编辑状态；按下 DELETE 键删除被编辑的节点；按下 ENTER 键确认当前编辑结果
    enableEditMode: async function(nodePath, initEditMode, options) {
      var defaultEditModeOption = {
        CustomEditAuxEnable: false, //开启自定义模型编辑图标
        CustomEditAux: {
          //自定义模型编辑图标设定
          Translate: {
            AXIS_X: true,
            AXIS_Y: true,
            AXIS_Z: true,
            PLANE_XOY: true,
            PLANE_YOZ: true,
            PLANE_ZOX: true
          },
          Rotate: {
            AXIS_X: true,
            AXIS_Y: true,
            AXIS_Z: true,
            PLANE_XOY: true,
            PLANE_YOZ: true,
            PLANE_ZOX: true
          },
          Scale: {
            AXIS_X: true,
            AXIS_Y: true,
            AXIS_Z: true,
            PLANE_XOY: true,
            PLANE_YOZ: true,
            PLANE_ZOX: true
          }
        },
        OnSaved: null, //模型保存事件
        OnCanceled: null, //模型编辑取消事件
        OnDeleted: null //模型隐藏事件
      };
      jQueryExtend(true, defaultEditModeOption, options);

      try {
        var node = await this.getSceneNode(nodePath);
        if (!node) return null;

        if (typeof this._editedNodePath !== "undefined")
          await this.exitEditMode(Enums.exitType.SaveAndExit);

        //将当前处于编辑状态下的节点名称保存起来
        this._editedNodePath = nodePath;
        this._oldClickEvent = this.getListerner("click");
        this._oldKeyEvent = this.getListerner("keydown");
        this.off("click"); //先取消已有的单击事件

        this.on("click", async function(e) {
          var options = await this.getInfoByClick(e); //获取点击处的信息
          var im = this.get().getInputManager();
          if (
            options.NearestNode != null &&
            options.nodeName.indexOf(this._editedNodePath) > -1
          ) {
            im.bindControlAction(
              Enums.device.MOUSE,
              Enums.mouse.LBUTTON,
              this._editedMode
            );
            await asyncHandle(
              im,
              im.sendActionMsg,
              AsyncFunImpl.Int,
              this._editedMode,
              Enums.actionMsg.LIMIT_AUX,
              1,
              0
            );
          } else {
            im.bindControlAction(
              Enums.device.MOUSE,
              Enums.mouse.LBUTTON,
              Enums.actionType.TRANS_SCENE
            );
          }
        });

        //设置节点是否显示编辑模式
        initEditMode = initEditMode || Enums.auxOperateType.Translate;
        switch (initEditMode) {
          case Enums.auxOperateType.Translate:
            this._editedMode = Enums.actionType.OBJECTSELECT_MOVAUX;
            break;
          case Enums.auxOperateType.Rotate:
            this._editedMode = Enums.actionType.OBJECTSELECT_ROTAUX;
            break;
          case Enums.auxOperateType.Scale:
            this._editedMode = Enums.actionType.OBJECTSELECT_SCAAUX;
            break;
        }

        if (defaultEditModeOption.CustomEditAuxEnable) {
          var currentAuxTypeObj = null;
          var mask = null;
          switch (initEditMode) {
            case 1:
              currentAuxTypeObj = defaultEditModeOption.CustomEditAux.Translate;
              break;
            case 2:
              currentAuxTypeObj = defaultEditModeOption.CustomEditAux.Rotate;
              break;
            case 3:
              currentAuxTypeObj = defaultEditModeOption.CustomEditAux.Scale;
              break;
            default:
              break;
          }
          if (currentAuxTypeObj != null) {
            for (var i in currentAuxTypeObj) {
              if (currentAuxTypeObj[i]) {
                mask += Enums.auxControlType[i];
              }
            }
            node.showAuxEx(initEditMode, mask, true);
          }
        } else {
          node.showAux(initEditMode, true);
        }

        var im = this.get().getInputManager();
        im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.LBUTTON,
          Enums.actionType.OBJECTSELECT_MOVAUX
        );
        await asyncHandle(
          im,
          im.sendActionMsg,
          AsyncFunImpl.Int,
          this._editedMode,
          Enums.actionMsg.LIMIT_AUX,
          1,
          0
        );
        var snode = new SceneNode(nodePath);
        var currentstatus = {
          Translate: await snode.getPosition(),
          Rotate: await snode.getOrientation(0),
          Scale: await snode.getScale(0)
        };

        //键盘绑定
        this.on("keydown", function(e) {
          var _e = e.originalEvent;
          var _keyID = _e.keyCode ? _e.keyCode : _e.which;
          switch (_keyID) {
            case Enums.keyboard.NUM_1.wparam:
              node.showAux(Enums.auxOperateType.Translate, true);
              this._editedMode = Enums.actionType.OBJECTSELECT_MOVAUX;
              break;
            case Enums.keyboard.NUM_2.wparam:
              node.showAux(Enums.auxOperateType.Rotate, true);
              this._editedMode = Enums.actionType.OBJECTSELECT_ROTAUX;
              break;
            case Enums.keyboard.NUM_3.wparam:
              node.showAux(Enums.auxOperateType.Scale, true);
              this._editedMode = Enums.actionType.OBJECTSELECT_SCAAUX;
              break;
            case Enums.keyboard.ESCAPE.wparam:
              node.showAux(Enums.auxOperateType.Hide, true);
              //还原位置
              node.setPosition(currentstatus.Translate);
              node.setOrientation(currentstatus.Rotate, 0);
              node.setScale(currentstatus.Scale);

              if (this._oldClickEvent) this.on("click", this._oldClickEvent);
              if (this._oldKeyEvent) this.on("keydown", this._oldKeyEvent);

              delete this._editedNodePath;

              if (isFunction(defaultEditModeOption.OnCanceled)) {
                defaultEditModeOption.OnCanceled(node);
              }
              break;
            case Enums.keyboard.DELETE.wparam:
              node.showAux(Enums.auxOperateType.Hide, true);
              //还原位置
              this.destroySceneNode(this._editedNodePath);

              if (this._oldClickEvent) this.on("click", this._oldClickEvent);
              if (this._oldKeyEvent) this.on("keydown", this._oldKeyEvent);

              delete this._editedNodePath;

              if (isFunction(defaultEditModeOption.OnDeleted)) {
                defaultEditModeOption.OnDeleted(node);
              }
              break;
            case Enums.keyboard.ENTER.wparam:
              node.showAux(Enums.auxOperateType.Hide, true);

              if (this._oldClickEvent) this.on("click", this._oldClickEvent);
              if (this._oldKeyEvent) this.on("keydown", this._oldKeyEvent);

              delete this._editedNodePath;

              if (isFunction(defaultEditModeOption.OnSaved)) {
                defaultEditModeOption.OnSaved(node);
              }
              break;
          }
        });
      } catch (e) {
        return null;
      }
      return this;
    },

    // @method exitEditMode(exitType: Q3D.Enums.exitType, oldSts?: Object): this
    // 退出节点编辑模式。提供三种退出方式：SaveAndExit - 保存并退出； DeleteAndExit - 删除并退出；ResetAndExit - 复位并退出
    exitEditMode: async function(exitType, oldSts) {
      var editedNodePath = this._editedNodePath;
      var node = await this.getSceneNode(editedNodePath);
      if (!node) return null;

      if (exitType == Enums.exitType.SaveAndExit) {
        node.showAux(Enums.auxOperateType.Hide, true);
      } else if (exitType == Enums.exitType.DeleteAndExit) {
        await this.destroySceneNode(editedNodePath);
      } else if (exitType == Enums.exitType.ResetAndExit) {
        node.showAux(Enums.auxOperateType.Hide, true);
        //还原位置
        node.setPosition(oldSts.Translate);
        node.setOrientation(oldSts.Rotate, 0);
        node.setScale(oldSts.Scale);
      }

      this.off("click"); //先取消已有的单击事件
      if (this._oldClickEvent) this.on("click", this._oldClickEvent);
      if (this._oldKeyEvent) this.on("keydown", this._oldKeyEvent);
      delete this._editedNodePath;
      return this;
    },

    // @method destroyMovieClipInstance(mciName: String): this
    // 删除给定名称的动画剪辑实例对象
    destroyMovieClipInstance: function(mciName) {
      var _wm = this.get().getWorldManager();
      _wm.destroyMovieClipInstance(mciName);
      return this;
    },

    // @method destroyAllMovieClipInstances(): this
    // 删除所有的动画剪辑实例对象
    destroyAllMovieClipInstances: function() {
      var _wm = this.get().getWorldManager();
      _wm.destroyAllMovieClipInstances();
      return this;
    },

    // @method destroyMovieClip(mcName: String): this
    // 删除给定名称的动画剪辑对象
    destroyMovieClip: function(mcName) {
      var _wm = this.get().getWorldManager();
      _wm.destroyMovieClip(mcName);
      return this;
    },

    // @method destroyAllMovieClips(): this
    // 删除所有的动画剪辑对象
    destroyAllMovieClips: function() {
      var _wm = this.get().getWorldManager();
      _wm.destroyAllMovieClips();
      return this;
    },

    // @method destroyContainer(ctnName: String): this
    // 删除给定名称的容器对象
    destroyContainer: function(ctnName) {
      var _wm = this.get().getWorldManager();
      _wm.destroyContainer(ctnName);
      return this;
    },

    // @method destroyAllContainers(): this
    // 删除所有的容器对象
    destroyAllContainers: function() {
      var _wm = this.get().getWorldManager();
      _wm.destroyAllContainer();
      return this;
    },

    // @method enableTooltip(fn: Function, waitTime?: Number): this
    //  打开Tooltip侦听。waitTime为判断等待时间，单位毫秒；fn为回调函数，传入的第一个参数为查询到的QSceneNode对象
    enableTooltip: function(fn, waitTime) {
      var wt = waitTime || 500;
      if (fn) {
        var _im = this.get().getInputManager();
        _im.setTooltipListener(true);
        _im.setTooltipHoldTime(wt);
        this.on("onSceneNodeTooltip", fn);
      }
      return this;
    },

    // @method disableTooltip(): this
    // 关闭Tooltip侦听
    disableTooltip: function() {
      var _im = this.get().getInputManager();
      _im.setTooltipListener(false);
      this.off("onSceneNodeTooltip");
      return this;
    },

    // @method enableNodeFollowing(nodePath: String, fn: Function): this
    //  打开节点跟随。fn为回调函数，接收传入JSON对象,可获取节点当前QVector2I屏幕坐标
    enableNodeFollowing: async function(nodePath, fn) {
      var _node = await this.getSceneNode(nodePath);
      if (_node && fn) {
        _node.setTransformListener(this._nodeTransInstanceID++);
        this.on("onNodeTransform_" + nodePath, fn);
      }
      return this;
    },

    // @method disableNodeFollowing(nodePath: String): this
    // 关闭节点跟随
    disableNodeFollowing: async function(nodePath) {
      var _node = await this.getSceneNode(nodePath);
      if (_node) {
        _node.setTransformListener(-1);
        this.off("onNodeTransform_" + nodePath);
      }
      return this;
    },

    // @method addPOIByJson(pois: String): this
    // 根据传入的JSON格式串批量添加POI，JSON串格式参见用户指南
    /*  
    *
    * ```js
    * var pois = {
    *   AreaName: "yewu",
    *   FontSize: 24,
    *   FontName: "微软雅黑",
    *   FontColor: "#000000",
    *   CharScale: 1.0,
    *   POILayout: 0,
    *   UIType: 2,
    *   IconAlphaEnabled: true,
    *   Location: 768,
    *   BackFrameBorderSize: 1,
    *   BackFillColor: "#009900",
    *   BackBorderColor: "#0000FF",
    *   LabelMargin: [5, 5],
    *   SpecialTransparent: false,
    *   AlwaysOnScreen: true,
    *   POIS: [
    *     {
    *       Name: "POI10",
    *       Text: "10",
    *       Icon: "Texture/dx_dz_16.png",
    *       IconSize: [48, 48],
    *       Position: [121.28879591, 31.16564555, 2]
    *     },
    *     {
    *       Name: "POI09",
    *       FontColor: "#ff00ff",
    *       Text: "09",
    *       Icon: "Texture/dx_dz_16.png",
    *       IconSize: [48, 48],
    *       Position: [121.2888092, 31.16575743, 2]
    *     },
    *     {
    *       Name: "POI11",
    *       FontColor: "#ff00ff",
    *       Text: "11",
    *       Icon: "Texture/dx_dz_16.png",
    *       IconSize: [48, 48],
    *       Position: [121.28851349, 31.16582984, 2]
    *     }
    *   ]
    * };
    * canvasMap.addPOIByJson(JSON.stringify(pois));
    * ```
    * 
    * JSON串格式如下：
  	{
  		"AreaName": "XHQ",
  		"FontSize": 20,
  		"FontName": "宋体",
  		"FontColor": "#000000",
  		"CharScale": 1.0,
  		"POILayout": 0,
  		"UIType": 2,
  		"IconAlphaEnabled": true,
  		"FontOutLine": null,
  		"FontEdgeColor": null,
  		"AlphaTestRef": null,
  		"Location": 768,
  		"LocationOffset": null,
  		"BackFrameBorderSize": null,
  		"BackBorderColor": null,
  		"BackFillColor": null,
  		"LabelMargin": null,
  		"IconLabelMargin": null,
  		"SpecialTransparent": true,
  		"AlwaysOnScreen": false,
  		"POIS": [
  	{
  		"Name": "POI1",
  		"FontColor": "#ff0000",
  		"Text": "TESTPOI1",
  		"Icon": "Texture/dx_dz_16.png",
  		"IconSize": [48,48],
  		"Position": [0,0,0]
  		},
  	{
  		"Name": "POI2",
  		"FontColor": "#ff00ff",
  		"Text": "TESTPOI2",
  		"Icon": "Texture/dx_dz_16.png",
  		"IconSize": [48,48],
  		"Position": [0,20,0]
  		},
  	{
  		"Name": "Group/POI3",
  		"FontColor": "#ff00ff",
  		"Text": "TESTPOI3",
  		"Icon": "Texture/dx_dz_16.png",
  		"IconSize": [48,48],
  		"Position": [0,20,0]
  		}
  		]
  		}
  		注明：
      1）接口提供了一套通用默认设置；            
      2）每个POI通常添加到场景的根节点下，也可支持名称二级定义，如"Group/POI3"，此时Group为组节点名称，需要事先创建，新创建的POI挂接到该组节点下；
  		3）每个POI允许有自己的属性定义，此时覆盖通用定义。
  		 */
    addPOIByJson: function(pois) {
      this.get().addPOIByJson(pois);
      return this;
    },

    // @method addContainerByJson(jsonStr: String): QSceneContentContainer
    // 一次性创建多节点容器对象，JSON串格式参见用户指南。返回原生的容器对象
    /*JSON串格式如下：
      {
        "Name": "myContainer", //容器名称
        "Type": 0,		//目前支持的几种类型：Alpha: 0,Color: 1,Visible: 2,Material: 3
        "TargetValue": "0.2",	//根据Type而改变，如Alpha:0.2,Color:"#000000",Visible:"true/false",Material:"Material/xy_xy_cao_580.mtr"
        "NODES": ["XHQ/node_1","XHQ/node_2"]
        }
         */
    addContainerByJson: async function(jsonStr) {
      var ec = this.get();
      var nc = await asyncHandle(
        ec,
        ec.addContainerByJson,
        AsyncFunImpl.QSceneContentContainer,
        jsonStr
      );
      return nc;
    },

    // @section Use Measure Tools
    // @method measureStart(measureType: Number, options?: Measure Options): this
    // 打开新量测功能
    measureStart: function(measureType, options) {
      var defaultDrawOption = {
        PickUpType: Enums.pickUpType.Spatial, //拾取类型
        PenColor: null, //画笔颜色
        PenMoveColor: null, //画笔移动颜色
        PenWidth: null, //画笔宽度
        FillColor: null, //面填充颜色
        FontSize: null, //字体大小
        FontColor: null, //字体颜色
        CallBackFn: null //回调函数
      };
      jQueryExtend(true, defaultDrawOption, options);

      var gisAnalystMgr = this.get().getGisAnalystManager();
      gisAnalystMgr.setPickUpType(defaultDrawOption.PickUpType);
      gisAnalystMgr.setStyle("defaultPoi", 0);
      gisAnalystMgr.setStyle("defaultLine", 1);
      gisAnalystMgr.setStyle("defaultPolygon", 2);

      if (defaultDrawOption.PenColor && defaultDrawOption.PenMoveColor)
        gisAnalystMgr.setPenColor(
          defaultDrawOption.PenColor.get(),
          defaultDrawOption.PenMoveColor.get()
        );
      if (defaultDrawOption.PenWidth)
        gisAnalystMgr.setPenWidth(defaultDrawOption.PenWidth);
      if (defaultDrawOption.FillColor)
        gisAnalystMgr.setFillColor(defaultDrawOption.FillColor.get());
      if (defaultDrawOption.FontSize)
        gisAnalystMgr.setFontSize(defaultDrawOption.FontSize);
      if (defaultDrawOption.FontColor)
        gisAnalystMgr.setFontColor(defaultDrawOption.FontColor.get());

      if (
        defaultDrawOption.CallBackFn &&
        isFunction(defaultDrawOption.CallBackFn)
      ) {
        gisAnalystMgr.setListener(Enums.listenerMsgID.LMID_GISANALYST); //开启事件侦听
        this.once("onMeasureEnd", defaultDrawOption.CallBackFn);
      }

      switch (measureType) {
        case Enums.measureType.Polyline:
          gisAnalystMgr.measureDistance();
          break;
        case Enums.measureType.Height:
          gisAnalystMgr.measureHeight();
          break;
        case Enums.measureType.Rectangle:
          gisAnalystMgr.measureRectangleArea();
          break;
        case Enums.measureType.Polygon:
          gisAnalystMgr.measurePolygonArea();
          break;
        case Enums.measureType.XYZComponent:
          gisAnalystMgr.setStyle("measure", 0);
          gisAnalystMgr.measureDistanceBetweenTwoPoints();
          break;
        case Enums.measureType.Angle:
          gisAnalystMgr.measureAngle();
          break;
      }
      return this;
    },
    // @method measureEnd(): this
    // 关闭新量测功能
    measureEnd: function() {
      var gisAnalystMgr = this.get().getGisAnalystManager();
      gisAnalystMgr.clearScreen();
      gisAnalystMgr.setListener(-1);
      return this;
    },

    //事件相关
    handleEventMsg: async function() {
      var emsg = Module.EngineClient.impl().getEventMsg();
      var etype = emsg.getEventType();
      var eId = emsg.getEventID();
      //console.log("Time: " +(new Date()).getTime() + "\t type:" + etype + "\t ID:" + eId );
      switch (etype) {
        case Enums.messageType.QMID_ENGINE_EVENTCALLBACK: //QMID_ENGINE_EVENTCALLBACK
          {
            switch (eId) {
              case 1:
                var group = emsg.QResourceGroup();
                group.setListener(Enums.listenerMsgID.LMID_RESGROUP);
                out("\tEvent:1 ID_PreGroupPrepare");
                drawLoading(5);
                break;
              case 2:
                var area = emsg.QAreaSceneManager();
                var group = emsg.QResourceGroup();
                out("\tEvent:2 ID_AreaLoadPreGroup");
                break;
              case 3:
                var worldID = emsg.Int();
                out("\tEvent:3 ID_AllSceneFilesFirstLoadCompleted: " + worldID);
                break;
              case 4:
                var worldID = emsg.Int();
                var currCnt = emsg.Int();
                var allCnt = emsg.Int();
                out(
                  "\tEvent:4 ID_AreasFirstLoadProcess : " +
                    worldID +
                    "/" +
                    currCnt +
                    "/" +
                    allCnt
                );
                drawLoading(85 + (currCnt / allCnt) * 10);
                break;
              case 5:
                var worldID = emsg.Int();
                var isTimeout = emsg.Boolean();
                out("\tEvent:5 ID_AllAreasFirstLoadCompleted");
                drawLoading(100);
                removeLoading();
                if (
                  gMap.options.OnLoadEnd &&
                  isFunction(gMap.options.OnLoadEnd)
                ) {
                  gMap.options.OnLoadEnd();
                }
                break;
              case 6:
                out("\tEvent:6 ID_RootConfigLoad");
                break;
              default:
                out("\tEvent: QMID_ENGINE_EVENTCALLBACK: default:" + eId);
                break;
            }
          }
          break;
        case Enums.messageType.QMID_WORLDMANAGER_EVENTCALLBACK: //QMID_WORLDMANAGER_EVENTCALLBACK
          {
            switch (eId) {
              case 0:
                out("\tEvent: WorldManagerEvent_Release");
                break;
              case 1: //onCreateArea
                {
                  var area = emsg.QAreaSceneManager();
                  var mainCamera = await asyncHandle(
                    area,
                    area.getMainCamera,
                    AsyncFunImpl.QGlobalCamera
                  );
                  var areaName = await asyncHandle(
                    area,
                    area.getName,
                    AsyncFunImpl.String
                  );
                  out("\tEvent: WorldManagerEvent_onCreateArea: " + areaName);
                  gMap.fire("onCreateArea", {
                    name: areaName
                  });
                }
                break;
              default:
                out("\tEvent: QMID_WORLDMANAGER_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_RESOURCE_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: ResourceEvent_Release");
                break;
              case 1: //onResourceSelfCompleted
                {
                  var res = emsg.QResource();
                  var name = await asyncHandle(
                    res,
                    res.getName,
                    AsyncFunImpl.String
                  );
                  out("\tEvent: resourceEvent_onResourceSelfCompleted: " + name);
                }
                break;
              case 2: //onResourceFailed
                {
                  var res = emsg.QResource();
                  var name = await asyncHandle(
                    res,
                    res.getName,
                    AsyncFunImpl.String
                  );
                  out("\tEvent: resourceEvent_onResourceFailed: " + name);
                }
                break;
              case 3: //onResourceAllCompleted
                {
                  var res = emsg.QResource();
                  var name = await asyncHandle(
                    res,
                    res.getName,
                    AsyncFunImpl.String
                  );
                  out("\tEvent: resourceEvent_onResourceAllCompleted: " + name);
                }
                break;
              case 4: //onResourceAlreadyAllCompleted
                {
                  var res = emsg.QResource();
                  var name = await asyncHandle(
                    res,
                    res.getName,
                    AsyncFunImpl.String
                  );
                  out(
                    "\tEvent: resourceEvent_onResourceAlreadyAllCompleted: " +
                      name
                  );
                }
                break;
              default:
                out("\tEvent: QMID_RESOURCE_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_SCENENODE_EVENTCALLBACK:
          switch (eId) {
            case 0:
              out("\tEvent: SCENENODEEvent_Release");
              break;
            case 1: //onSceneNodeAllResourceCompleted
              {
                var node = emsg.QSceneNode();
                var name = await asyncHandle(
                  node,
                  node.getFullName,
                  AsyncFunImpl.String
                );
                gMap.fire("onSceneNodeAllResourceCompleted_" + name, {
                  name: name
                });
                out(
                  "\tEvent: SCENENODEEvent_onSceneNodeAllResourceCompleted: " +
                    name
                );
              }
              break;
            case 2: {
              //onSceneNodeDestroyed
              var node = emsg.QSceneNode();
              var name = await asyncHandle(
                node,
                node.getName,
                AsyncFunImpl.String
              );
              out("\tEvent: SCENENODEEvent_onSceneNodeDestroyed: " + name);
            }
            default:
              out("\tEvent: QMID_WORLDMANAGER_EVENTCALLBACK: default");
              break;
          }
          break;
        case Enums.messageType.QMID_TOOLTIP_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: SceneNodeTooltip_Release");
                break;
              case 1: //onSceneNodeTooltip
                {
                  var node = emsg.QSceneNode();
                  var mouseX = emsg.Int();
                  var mouseY = emsg.Int();
                  var name = await asyncHandle(
                    node,
                    node.getFullName,
                    AsyncFunImpl.String
                  );
                  gMap.fire("onSceneNodeTooltip", {
                    name: name,
                    mouseX: mouseX,
                    mouseY: mouseY
                  });
                  out(
                    "\tEvent: QMID_TOOLTIP_EVENTCALLBACK: onSceneNodeTooltip: "
                  );
                }
                break;
              default:
                out("\tEvent: QMID_TOOLTIP_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_RESOURCEGROUP_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK_Release");
                break;
              case 1: //onGroupFileComplete
                {
                  var group = emsg.QResourceGroup();
                  var loadOk = emsg.Boolean();
                  out(
                    "\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK: onGroupFileComplete: "
                  );
                }
                break;
              case 2: //onResourceLoaded
                {
                  var group = emsg.QResourceGroup();
                  var resource = emsg.QResource();
                  var currentCompleted = emsg.Int();
                  var totalNum = emsg.Int();
                  var resname = await asyncHandle(
                    resource,
                    resource.getName,
                    AsyncFunImpl.String
                  );
                  out(
                    "\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK: onResourceLoaded: " +
                      resname +
                      "=>" +
                      currentCompleted +
                      "/" +
                      totalNum
                  );
                  drawLoading(5 + (currentCompleted / totalNum) * 80);
                }
                break;
              case 3: //onResourceFailed
                {
                  var group = emsg.QResourceGroup();
                  var resource = emsg.QResource();
                  var resname = await asyncHandle(
                    resource,
                    resource.getName,
                    AsyncFunImpl.String
                  );
                  out(
                    "\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK: onResourceFailed: " +
                      resname
                  );
                }
                break;
              case 4: //onResourceAllLoaded
                {
                  var group = emsg.QResourceGroup();
                  out(
                    "\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK: onResourceAllLoaded: "
                  );
                }
                break;
              case 5: //onResourceAllCompleted
                {
                  var group = emsg.QResourceGroup();
                  var currLoadNum = emsg.Int();
                  var currFailedNum = emsg.Int();
                  var allNum = emsg.Int();
                  out(
                    "\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK: onResourceAllCompleted: " +
                      currLoadNum +
                      "/" +
                      currFailedNum +
                      "/" +
                      allNum
                  );
                  drawLoading(85);
                }
                break;
              case 6: //onPackResLoaded
                {
                  var group = emsg.QResourceGroup();
                  var name = emsg.String();
                  var currentCompleted = emsg.Int();
                  var totalNum = emsg.Int();
                  out(
                    "\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK: onPackResLoaded: " +
                      name +
                      "=>" +
                      currentCompleted +
                      "/" +
                      totalNum
                  );
                  drawLoading(5 + (currentCompleted / totalNum) * 80);
                }
                break;
              case 7: //onPackResFailed
                {
                  var group = emsg.QResourceGroup();
                  var name = emsg.String();
                  var currentCompleted = emsg.Int();
                  var totalNum = emsg.Int();
                  out(
                    "\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK: onPackResFailed: " +
                      name +
                      "=>" +
                      currentCompleted +
                      "/" +
                      totalNum
                  );
                  drawLoading(5 + (currentCompleted / totalNum) * 80);
                }
                break;

              default:
                out("\tEvent: QMID_RESOURCEGROUP_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_FLYTO_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMID_FLYTO_EVENTCALLBACK_Release");
                break;
              case 1: //onCameraFlyToEnd
                {
                  gMap.fire("onCameraFlyToEnd");
                  out("\tEvent: QMID_FLYTO_EVENTCALLBACK: onCameraFlyToEnd: ");
                }
                break;
              case 2: //onCameraCircleAniEnd
                {
                  gMap.fire("onCameraCircleAniEnd");
                  out(
                    "\tEvent: QMID_FLYTO_EVENTCALLBACK: onCameraCircleAniEnd: "
                  );
                }
                break;
              default:
                out("\tEvent: QMID_FLYTO_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_CAMERA_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMID_CAMERA_EVENTCALLBACK_Release");
                break;
              case 1: //onTransformChanged
                {
                  gMap.fire("onTransformChanged");
                  out("\tEvent: QMID_CAMERA_EVENTCALLBACK: onTransformChanged: ");
                }
                break;
              case 2: //onFarDistanceChanged
                {
                  out(
                    "\tEvent: QMID_CAMERA_EVENTCALLBACK: onFarDistanceChanged: "
                  );
                }
                break;
              default:
                out("\tEvent: QMID_CAMERA_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_VIDEO_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMID_VIDEO_EVENTCALLBACK_Release");
                break;
              case 1: //onEnded
                {
                  var video = emsg.QVideo();
                  out("\tEvent: QMID_VIDEO_EVENTCALLBACK: onEnded: ");
                }
                break;
              case 2: //onPrepared
                {
                  var video = emsg.QVideo();
                  out("\tEvent: QMID_VIDEO_EVENTCALLBACK: onPrepared: ");
                }
                break;
              default:
                out("\tEvent: QMID_VIDEO_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_QACTIVECTRLOBJ_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMID_QACTIVECTRLOBJ_EVENTCALLBACK_Release");
                break;
              case 1: //onActCtrlObjAniKeyframe
                {
                  var aco = emsg.QActiveCtrlObj();
                  var keyIdxLow = emsg.Int();
                  var keyIdxHigh = emsg.Int();
                  out(
                    "\tEvent: QMID_QACTIVECTRLOBJ_EVENTCALLBACK: onActCtrlObjAniKeyframe: "
                  );
                }
                break;
              case 2: //onActCtrlObjAniEnd
                {
                  var aco = emsg.QActiveCtrlObj();
                  out(
                    "\tEvent: QMID_QACTIVECTRLOBJ_EVENTCALLBACK: onActCtrlObjAniEnd: "
                  );
                }
                break;
              default:
                out("\tEvent: QMID_QACTIVECTRLOBJ_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_QUIVIDEOCTRL_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMID_QUIVideoCtrl_EVENTCALLBACK_Release");
                break;
              case 1: //onClose
                {
                  var ctrlName = emsg.String();
                  gMap.fire("onVideoCtrlClose_" + ctrlName, {
                    name: ctrlName
                  });
                  out("\tEvent: QMID_QUIVideoCtrl_EVENTCALLBACK: onClose: ");
                }
                break;
              default:
                out("\tEvent: QMID_QUIVideoCtrl_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_ANIAMTIONSTATE_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMID_ANIAMTIONSTATE_EVENTCALLBACK_Release");
                break;
              case 1: //onAnimationKeyFrame
                {
                  var state = emsg.QAnimationState();
                  var keyIdx = emsg.Int();
                  out(
                    "\tEvent: QMID_ANIAMTIONSTATE_EVENTCALLBACK: onAnimationKeyFrame: "
                  );
                }
                break;
              case 2: //onAnimationEnd
                {
                  var state = emsg.QAnimationState();
                  out(
                    "\tEvent: QMID_ANIAMTIONSTATE_EVENTCALLBACK: onAnimationEnd: "
                  );
                }
                break;
              case 3: //onAnimationTimer
                {
                  var state = emsg.QAnimationState();
                  var t = emsg.Float();
                  out(
                    "\tEvent: QMID_ANIAMTIONSTATE_EVENTCALLBACK: onAnimationTimer: "
                  );
                }
                break;
              default:
                out("\tEvent: QMID_ANIAMTIONSTATE_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_QGISANALYSTMANAGER_EVENTCALLBACK:
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMID_QGisAnalystManager_EVENTCALLBACK_Release");
                break;
              case 1: //onEnd
                {
                  var type = emsg.Int();
                  var gis = gMap.get().getGisAnalystManager();
                  var jsonStr = await asyncHandle(
                    gis,
                    gis.getJsonResult,
                    AsyncFunImpl.String
                  );
                  gMap.fire("onMeasureEnd", {
                    result: jsonStr
                  });
                  out("\tEvent: QMID_QGisAnalystManager_EVENTCALLBACK: onEnd: ");
                }
                break;
              case 2: //setCutFillDatumElevation
                {
                  var zenith = emsg.QVector3();
                  var nadir = emsg.QVector3();
                  var gis = gMap.get().getGisAnalystManager();
                  gis.buildCutFill(zenith.y / 3.0 + (nadir.y * 2.0) / 3.0);
                  out(
                    "\tEvent: QMID_QGisAnalystManager_EVENTCALLBACK: setCutFillDatumElevation: "
                  );
                }
                break;
              case 3: //setFloodSimulationSpeed
                {
                  var zenith = emsg.QVector3();
                  var nadir = emsg.QVector3();
                  var increment = emsg.Float();
                  var gis = gMap.get().getGisAnalystManager();
                  gis.buildFloodSimulation(50, increment);
                  out(
                    "\tEvent: QMID_QGisAnalystManager_EVENTCALLBACK: setFloodSimulationSpeed: "
                  );
                }
                break;
              case 4: //onFloodPassElevation
                {
                  var curElevation = emsg.Float();
                  var floodedArea = emsg.Double();
                  out(
                    "\tEvent: QMID_QGisAnalystManager_EVENTCALLBACK: onFloodPassElevation: "
                  );
                }
                break;
              default:
                out("\tEvent: QMID_QGisAnalystManager_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_QMOVIECLIPINSTANCE_EVENTCALLBACK: // QMovieClipInstance 事件
          {
            switch (eId) {
              case 0:
                out("\tEvent: QMovieClipInstanceEvent_Release");
                break;
              case 1: //onMovieClipInstancePassFrame
                {
                  var instance = emsg.QMovieClipInstance();
                  var frameIndex = emsg.Int();
                  var name = await asyncHandle(
                    instance,
                    instance.getCName,
                    AsyncFunImpl.String
                  );
                  gMap.fire(
                    "onMovieClipInstancePassFrame_" + name + "_" + frameIndex,
                    {
                      name: name,
                      frameIndex: frameIndex
                    }
                  );
                  out(
                    "\tEvent: onMovieClipInstancePassFrame: frameIndex " +
                      frameIndex +
                      " name: " +
                      name
                  );
                }
                break;
              case 2: //onMovieClipInstanceRewind
                {
                  var instance = emsg.QMovieClipInstance();
                  var name = await asyncHandle(
                    instance,
                    instance.getCName,
                    AsyncFunImpl.String
                  );
                  out("\tEvent: onMovieClipInstanceRewind: " + name);
                }
                break;
              case 3: //onMovieClipInstanceStop
                {
                  var instance = emsg.QMovieClipInstance();
                  var name = await asyncHandle(
                    instance,
                    instance.getCName,
                    AsyncFunImpl.String
                  );
                  gMap.fire("onMovieClipInstanceStop_" + name, {
                    name: name
                  });
                  out("\tEvent: onMovieClipInstanceStop: " + name);
                }
                break;
              default:
                out("\tEvent: QMID_WORLDMANAGER_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        case Enums.messageType.QMID_SCENENODETRANSFORM_EVENTCALLBACK: // QMovieClipInstance 事件
          {
            switch (eId) {
              case 0:
                out("\tEvent: QScenenodeTransformEvent_Release");
                break;
              case 1: //onTransform
                {
                  var node = emsg.QSceneNode();
                  var v2i = emsg.QVector2I();
                  var name = await asyncHandle(
                    node,
                    node.getFullName,
                    AsyncFunImpl.String
                  );
                  out(
                    "\tEvent: onTransform: name: " +
                      name +
                      " v2i: " +
                      v2i.x +
                      "," +
                      v2i.y
                  );
                  gMap.fire("onNodeTransform_" + name, {
                    name: name,
                    screenX: v2i.x / gMap._zoom,
                    screenY: v2i.y / gMap._zoom
                  });
                }
                break;
              default:
                out("\tEvent: QMID_SCENENODETRANSFORM_EVENTCALLBACK: default");
                break;
            }
          }
          break;
        default:
          out("\tEvent: EVENTCALLBACK: default");
          break;
      } // end of switch(emsg.getEventType ...
    } // end of var handleEventMsg = async function ...
  });

  // @section

  // @factory Q3D.map(id: String, options: Map Init Options)
  // 利用给定的一个 `<canvas>`  元素的DOM ID来实例化一个三维引擎对象
  //
  // @alternative
  // @factory Q3D.map(el: HTMLElement, options: Map Init Options)
  // 利用给定的一个 `<canvas>`  HTML元素来实例化一个三维引擎对象
  function createMap(id, options) {
    return new Map(id, options);
  }

  var gMap = null; //保存引用

  //loading信息
  function showLoading(event) {
    //获取浏览器页面可见高度和宽度
    var _PageHeight = document.documentElement.clientHeight,
      _PageWidth = document.documentElement.clientWidth;
    /*
      //计算loading框距离顶部和左部的距离（loading框的宽度为215px，高度为48px）
      var _LoadingTop = _PageHeight > 48 ? (_PageHeight - 48) / 2 : 0,
          _LoadingLeft = _PageWidth > 215 ? (_PageWidth - 215) / 2 : 0;
          
      //在页面未加载完毕之前显示的loading Html自定义内容
      var _LoadingHtml = '<div id="loadingDiv" style="position:absolute;left:0;width:100%;height:' +
          _PageHeight +
          'px;top:0;background:#f3f8ff;opacity:1;filter:alpha(opacity=80);z-index:10000;display:\'block\';"><div style="position: absolute; cursor1: wait; left: ' +
          _LoadingLeft + 'px; top:' + _LoadingTop +
          'px; width: auto; height: 48px; line-height: 48px; padding-left: 50px; padding-right: 5px; background: #fff url(loading.gif) no-repeat scroll 5px 10px; border: 2px solid #95B8E7; color: #696969; font-family:\'Microsoft YaHei\';">引擎加载中，请稍候...</div>'
          +'<canvas id="loadingCanvas" width="300px" height="300px" style="position: absolute; left:' + (_PageHeight - 300)/2 + 'px; top:' + (_PageWidth - 300)/2 + 'px; background-color: red; opacity: 0.5;"></canvas>'
          +'</div>';*/
    var _LoadingHtml =
      '<div id="loadingDiv" style="position:absolute;left:0;width:100%;height:100%;' +
      //_PageHeight +
      'top:0;background:#333;opacity:1;z-index:9999;">' +
      '<canvas id="loadingCanvas" width="300" height="300" style="position: absolute; left:' +
      (_PageWidth - 300) / 2 +
      "px; top:" +
      (_PageHeight - 300) / 2 +
      'px;"></canvas>' +
      "</div>";
    //呈现loading效果
    var tempNode = document.createElement("div");
    tempNode.innerHTML = _LoadingHtml;
    var node = tempNode.firstChild;
    document.body.insertBefore(node, document.getElementById("canvas"));
    drawLoading(0);
  }

  function removeLoading() {

    setTimeout(function() {
      var loadingMask = document.getElementById("loadingDiv");
      loadingMask.parentNode.removeChild(loadingMask);
      Module.EngineClient.impl()
        .getUISystem()
        .updateRotDiscUI();
    }, 500);
  }

  function drawLoading(percent) {
    var canvas = document.getElementById("loadingCanvas");
    var W = canvas.width,
      H = canvas.height,
      color = "lightgreen",
      bgcolor = "#222",
      text,
      text_width;

    var ctx = canvas.getContext("2d");
    //clean the canvas everytime a chart is drawn
    ctx.clearRect(0, 0, W, H);

    //background 360 degree arc
    ctx.beginPath();
    ctx.strokeStyle = bgcolor;
    ctx.lineWidth = 22;
    ctx.arc(W / 2, H / 2, 100, 0, Math.PI * 2, false);
    ctx.stroke();

    var currValue = Math.floor((percent / 100) * 360);
    var radians = (currValue * Math.PI) / 180;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 20;
    var sRad = (270 * Math.PI) / 180;
    var eRad =
      percent !== 100 ? (sRad + radians) % (Math.PI * 2) : sRad + Math.PI * 2;
    ctx.arc(W / 2, H / 2, 100, sRad, eRad);
    ctx.stroke();

    //let us add text
    ctx.fillStyle = color;
    ctx.font = "18px Arial";
    text = Math.floor(percent) + "%";
    text_width = ctx.measureText(text).width;
    ctx.fillText(text, W / 2 - text_width / 2, H / 2 + 15);
  }

  document.addEventListener("DOMContentLoaded", showLoading);

  /* @class Vector2
   * @aka Q3D.Vector2
   *
   * 表示二维平面坐标点（浮点类型）
   *
   * @example
   *
   * ```js
   * var v2 = Q3D.vector2(50.5, 30.2);
   * ```
   *
   * 其他的创建方式：
   *
   * ```js
   * var v2 = Q3D.vector2();
   * v2 = Q3D.vector2(50.5, 30.2);
   * v2 = Q3D.vector2([50.5, 30.2]);
   * v2 = Q3D.vector2({x:50.5, y:30.2});
   * ```
   */

  function Vector2(x, y) {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    if (isNaN(x) || isNaN(y)) {
      throw new Error("无效的QVector2对象: (" + x + ", " + y + ")");
    }
    // @property x: Number
    // 坐标 x
    this.x = x;
    // @property y: Number
    // 坐标 y
    this.y = y;
  }

  var trunc$1 =
    Math.trunc ||
    function(v) {
      return v > 0 ? Math.floor(v) : Math.ceil(v);
    };

  Vector2.prototype = {
    // @method get(): QVector2
    // 返回对应的原生 QVector2 对象
    get: function() {
      this.update();
      return this._qVector2;
    },

    getCLSID: function() {
      return Enums.ValueTypeCLSID.QVector2;
    },

    // @method clone(): Vector2
    // 克隆一个新的 `Vector2` 对象
    clone: function() {
      return new Vector2(this.x, this.y);
    },

    // @method add(otherVector2: Vector2): Vector2
    // 返回当前`Vector2` 对象和给定`Vector2` 对象相加的结果
    add: function(vector2) {
      // non-destructive, returns a new point
      return this.clone()._add(toVector2(vector2));
    },

    _add: function(vector2) {
      // destructive, used directly for performance in situations where it's safe to modify existing point
      this.x += vector2.x;
      this.y += vector2.y;
      return this;
    },

    // @method subtract(otherVector2: Vector2): Vector2
    // 返回当前`Vector2` 对象和给定`Vector2` 对象相减的结果
    subtract: function(vector2) {
      return this.clone()._subtract(toVector2(vector2));
    },

    _subtract: function(vector2) {
      this.x -= vector2.x;
      this.y -= vector2.y;
      return this;
    },

    // @method divideBy(num: Number): Vector2
    // 返回当前`Vector2` 对象同给定数字相除的结果
    divideBy: function(num) {
      return this.clone()._divideBy(num);
    },

    _divideBy: function(num) {
      if (num == 0) throw new Error("除数为0");
      this.x /= num;
      this.y /= num;
      return this;
    },

    // @method multiplyBy(num: Number): Vector2
    // 返回当前`Vector2` 对象同给定数字相乘的结果
    multiplyBy: function(num) {
      return this.clone()._multiplyBy(num);
    },

    _multiplyBy: function(num) {
      this.x *= num;
      this.y *= num;
      return this;
    },

    // @method scaleBy(scale: Vector2): Vector2
    // 返回当前`Vector2` 对象同给定`Vector2` 对象对应分量分别相乘的结果
    scaleBy: function(vector2) {
      return new Vector2(this.x * vector2.x, this.y * vector2.y);
    },

    // @method unscaleBy(scale: Vector2): Vector2
    // 返回当前`Vector2` 对象同给定`Vector2` 对象对应分量分别相除的结果
    unscaleBy: function(vector2) {
      if (vector2.x == 0 || vector2.y == 0) throw new Error("对象属性存在0");
      return new Vector2(this.x / vector2.x, this.y / vector2.y);
    },

    // @method round(): Vector2
    // 返回当前`Vector2` 对象分量四舍五入取整后的结果
    round: function() {
      return this.clone()._round();
    },

    _round: function() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    },

    // @method floor(): Vector2
    // 返回当前`Vector2` 对象分量向下取整后的结果
    floor: function() {
      return this.clone()._floor();
    },

    _floor: function() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    },

    // @method ceil(): Vector2
    // 返回当前`Vector2` 对象分量向上取整后的结果
    ceil: function() {
      return this.clone()._ceil();
    },

    _ceil: function() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      return this;
    },

    // @method trunc(): Vector2
    // 返回当前`Vector2` 对象分量去除小数部分取整后的结果
    trunc: function() {
      return this.clone()._trunc();
    },

    _trunc: function() {
      this.x = trunc$1(this.x);
      this.y = trunc$1(this.y);
      return this;
    },

    // @method distanceTo(otherPoint: Vector2): Number
    // 返回当前`Vector2` 对象和给定`Vector2` 对象的笛卡尔距离
    distanceTo: function(vector2) {
      vector2 = toVector2(vector2);

      var x = vector2.x - this.x,
        y = vector2.y - this.y;

      return Math.sqrt(x * x + y * y);
    },

    // @method equals(otherPoint: Vector2, maxMargin?: Number): Boolean
    // 在给定的精度范围内比较两个 `Vector2` 对象是否相等
    equals: function(vector2, maxMargin) {
      var margin = Math.max(
        Math.abs(this.x - vector2.x),
        Math.abs(this.y - vector2.y)
      );

      return margin <= (maxMargin === undefined ? Number.EPSILON : maxMargin);
    },

    // @method toString(): String
    // 返回对象的字符串表示，常用于调试目的
    toString: function(digits) {
      return (
        "QVector2(" +
        formatNum(this.x, digits) +
        ", " +
        formatNum(this.y, digits) +
        ")"
      );
    },

    // @method update(): this
    // 将属性值回写到原生 QVector2 对象
    update: function() {
      if (this._qVector2 == null)
        this._qVector2 = new Module.QVector2(this.x, this.y);
      this._qVector2.x = this.x;
      this._qVector2.y = this.y;
      return this;
    }
  };

  // @factory Q3D.vector2(x: Number, y: Number)
  // 创建一个二维平面坐标点

  // @alternative
  // @factory Q3D.vector2(coords: Number[])
  // 传入参数可以采用数组方式： `[Number, Number]`

  // @alternative
  // @factory Q3D.vector2(coords: Object)
  //传入参数可以采用对象方式 `{x: Number, y: Number}`
  // 或者原生的  QVector2 对象

  // @alternative
  // @factory Q3D.vector2()
  // 传入参数为空，对象成员默认为0

  function toVector2(x, y) {
    if (x instanceof Vector2) {
      return x;
    }
    if (isArray(x) && x.length === 2) {
      return new Vector2(x[0], x[1]);
    }
    if (typeof x === "object" && "x" in x && "y" in x) {
      return new Vector2(x.x, x.y);
    }
    if (arguments.length == 0) {
      return new Vector2(0, 0);
    }
    return new Vector2(x, y);
  }

  // @method toVector2(): Vector2
  // 逗号分隔的字符串与引擎值类型对象转换：
  // ```js
  // var v2 = "50.5, 30.2".toVector2();
  // ```
  String.prototype.toVector2 = function() {
    try {
      return toVector2(
        parseFloat(this.split(",")[0]),
        parseFloat(this.split(",")[1])
      );
    } catch (e) {
      return null;
    }
  };

  /*
   * @class Vector2I
   * @aka Q3D.Vector2I
   *
   * 表示二维平面像素坐标点
   *
   * @example
   *
   * ```js
   * var v2 = Q3D.vector2I(50, 30);
   * ```
   *
   * 其他的创建方式：
   *
   * ```js
   * var v2I = Q3D.vector2I();
   * v2I = Q3D.vector2I(50, 30);
   * v2I = Q3D.vector2I([50, 30]);
   * v2I = Q3D.vector2I({x:50, y:30});
   * ```
   */

  function Vector2I(x, y) {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    if (isNaN(x) || isNaN(y)) {
      throw new Error("无效的QVector2I对象: (" + x + ", " + y + ")");
    }
    // @property x: Number
    // 坐标 x
    this.x = Math.round(x);
    // @property y: Number
    // 坐标 y
    this.y = Math.round(y);
  }

  var trunc$2 =
    Math.trunc ||
    function(v) {
      return v > 0 ? Math.floor(v) : Math.ceil(v);
    };

  Vector2I.prototype = {
    // @method get(): QVector2I
    // 返回对应的原生 QVector2I 对象
    get: function() {
      this.update();
      return this._qVector2I;
    },

    getCLSID: function() {
      return Enums.ValueTypeCLSID.QVector2I;
    },

    // @method clone(): Vector2I
    // 克隆一个新的 `Vector2I` 对象
    clone: function() {
      return new Vector2I(this.x, this.y);
    },

    // @method add(otherVector2I: Vector2I): Vector2I
    // 返回当前`Vector2I` 对象和给定`Vector2I` 对象相加的结果
    add: function(vector2I) {
      // non-destructive, returns a new point
      return this.clone()._add(toVector2I(point));
    },

    _add: function(vector2I) {
      // destructive, used directly for performance in situations where it's safe to modify existing point
      this.x += vector2I.x;
      this.y += vector2I.y;
      return this;
    },

    // @method subtract(otherVector2I: Vector2I): Vector2I
    // 返回当前`Vector2I` 对象和给定`Vector2I` 对象相减的结果
    subtract: function(vector2I) {
      return this.clone()._subtract(toVector2I(vector2I));
    },

    _subtract: function(vector2I) {
      this.x -= vector2I.x;
      this.y -= vector2I.y;
      return this;
    },

    // @method divideBy(num: Number): Vector2I
    // 返回当前`Vector2I` 对象同给定数字相除的结果
    divideBy: function(num) {
      return this.clone()._divideBy(num);
    },

    _divideBy: function(num) {
      if (num == 0) throw new Error("除数为0");
      this.x /= num;
      this.y /= num;
      return this;
    },

    // @method multiplyBy(num: Number): Vector2I
    // 返回当前`Vector2I` 对象同给定数字相乘的结果
    multiplyBy: function(num) {
      return this.clone()._multiplyBy(num);
    },

    _multiplyBy: function(num) {
      this.x *= num;
      this.y *= num;
      return this;
    },

    // @method scaleBy(scale: Vector2I): Vector2I
    // 返回当前`Vector2I` 对象同给定`Vector2I` 对象对应分量分别相乘的结果
    scaleBy: function(vector2I) {
      return new Vector2I(this.x * vector2I.x, this.y * vector2I.y);
    },

    // @method unscaleBy(scale: Vector2I): Vector2I
    // 返回当前`Vector2I` 对象同给定`Vector2I` 对象对应分量分别相除的结果
    unscaleBy: function(vector2I) {
      if (vector2I.x == 0 || vector2I.y == 0) throw new Error("对象属性存在0");
      return new Vector2I(this.x / vector2I.x, this.y / vector2I.y);
    },

    // @method round(): Vector2I
    // 返回当前`Vector2I` 对象分量四舍五入取整后的结果
    round: function() {
      return this.clone()._round();
    },

    _round: function() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    },

    // @method floor(): Vector2I
    // 返回当前`Vector2I` 对象分量向下取整后的结果
    floor: function() {
      return this.clone()._floor();
    },

    _floor: function() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    },

    // @method ceil(): Vector2I
    // 返回当前`Vector2I` 对象分量向上取整后的结果
    ceil: function() {
      return this.clone()._ceil();
    },

    _ceil: function() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      return this;
    },

    // @method trunc(): Vector2I
    // 返回当前`Vector2I` 对象分量去除小数部分取整后的结果
    trunc: function() {
      return this.clone()._trunc();
    },

    _trunc: function() {
      this.x = trunc$2(this.x);
      this.y = trunc$2(this.y);
      return this;
    },

    // @method distanceTo(otherPoint: Vector2I): Number
    // 返回当前`Vector2I` 对象和给定`Vector2I` 对象的笛卡尔距离
    distanceTo: function(vector2I) {
      vector2I = toVector2I(vector2I);

      var x = vector2I.x - this.x,
        y = vector2I.y - this.y;

      return Math.sqrt(x * x + y * y);
    },

    // @method equals(otherPoint: Vector2I, maxMargin?: Number): Boolean
    // 在给定的精度范围内比较两个 `Vector2I` 对象是否相等
    equals: function(vector2I, maxMargin) {
      var margin = Math.max(
        Math.abs(this.x - vector2I.x),
        Math.abs(this.y - vector2I.y)
      );

      return margin <= (maxMargin === undefined ? Number.EPSILON : maxMargin);
    },

    // @method toString(): String
    // 返回对象的字符串表示，常用于调试目的
    toString: function(digits) {
      return (
        "QVector2I(" +
        formatNum(this.x, digits) +
        ", " +
        formatNum(this.y, digits) +
        ")"
      );
    },

    // @method update(): this
    // 将属性值回写到原生 QVector2I 对象
    update: function() {
      if (this._qVector2I == null)
        this._qVector2I = new Module.QVector2I(this.x, this.y);
      this._qVector2I.x = this.x;
      this._qVector2I.y = this.y;
      return this;
    }
  };

  // @factory Q3D.vector2I(x: Number, y: Number)
  // 创建一个二维平面像素坐标点

  // @alternative
  // @factory Q3D.vector2I(coords: Number[])
  // 传入参数可以采用数组方式： `[Number, Number]`

  // @alternative
  // @factory Q3D.vector2I(coords: Object)
  // 传入参数可以采用对象方式 `{x: Number, y: Number}`
  // 或者原生的  QVector2I 对象

  // @alternative
  // @factory Q3D.vector2I(): Vector2I
  // 传入参数为空，对象成员默认为0

  function toVector2I(x, y) {
    if (x instanceof Vector2I) {
      return x;
    }
    if (isArray(x) && x.length === 2) {
      return new Vector2I(x[0], x[1]);
    }
    if (typeof x === "object" && "x" in x && "y" in x) {
      return new Vector2I(x.x, x.y);
    }
    if (arguments.length == 0) {
      return new Vector2I(0, 0);
    }
    return new Vector2I(x, y);
  }

  // @method toVector2I(): Vector2I
  // 逗号分隔的字符串与引擎值类型对象转换：
  // ```js
  // var v2 = "50.5, 30.2".toVector2I();
  // ```
  String.prototype.toVector2I = function() {
    try {
      return toVector2I(
        parseFloat(this.split(",")[0]),
        parseFloat(this.split(",")[1])
      );
    } catch (e) {
      return null;
    }
  };

  /*
   * @class Vector3
   * @aka Q3D.Vector3
   *
   * 表示三维相对坐标点，其中 y 分量表示高度差
   *
   * @example
   *
   * ```js
   * var v3 = Q3D.vector3(50.3, 5.0, 30.5);
   * ```
   *
   * 其他的创建方式：
   *
   * ```js
   * var v3 = Q3D.vector3();
   * v3 = Q3D.vector3(50.3, 5.0, 30.5);
   * v3 = Q3D.vector3([50.3, 5.0, 30.5]);
   * v3 = Q3D.vector3({x:50.3, y:5.0, z:30.5});
   * ```
   */

  function Vector3(x, y, z) {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      throw new Error("无效的QVector3对象: (" + x + ", " + y + ", " + z + ")");
    }
    // @property x: Number
    // 坐标 x
    this.x = x;
    // @property y: Number
    // 坐标 y
    this.y = y;
    // @property z: Number
    // 坐标 z
    this.z = z;
  }

  var trunc$3 =
    Math.trunc ||
    function(v) {
      return v > 0 ? Math.floor(v) : Math.ceil(v);
    };

  Vector3.prototype = {
    // @method get(): QVector3
    // 返回对应的原生 QVector3 对象
    get: function() {
      this.update();
      return this._qVector3;
    },

    getCLSID: function() {
      return Enums.ValueTypeCLSID.QVector3;
    },

    // @method clone(): Vector3
    // 克隆一个新的 `Vector3` 对象
    clone: function() {
      return new Vector3(this.x, this.y, this.z);
    },

    // @method add(otherPoint: Vector3): Vector3
    // 返回当前`Vector3` 对象和给定`Vector3` 对象相加的结果
    add: function(vector3) {
      // non-destructive, returns a new point
      return this.clone()._add(toVector3(vector3));
    },

    _add: function(vector3) {
      // destructive, used directly for performance in situations where it's safe to modify existing point
      this.x += vector3.x;
      this.y += vector3.y;
      this.z += vector3.z;
      return this;
    },

    // @method subtract(otherPoint: Vector3): Vector3
    // 返回当前`Vector3` 对象和给定`Vector3` 对象相减的结果
    subtract: function(vector3) {
      return this.clone()._subtract(toVector3(vector3));
    },

    _subtract: function(vector3) {
      this.x -= vector3.x;
      this.y -= vector3.y;
      this.z -= vector3.z;
      return this;
    },

    // @method divideBy(num: Number): Vector3
    // 返回当前`Vector3` 对象同给定数字相除的结果
    divideBy: function(num) {
      return this.clone()._divideBy(num);
    },

    _divideBy: function(num) {
      if (num == 0) throw new Error("除数为0");
      this.x /= num;
      this.y /= num;
      this.z /= num;
      return this;
    },

    // @method multiplyBy(num: Number): Vector3
    // 返回当前`Vector3` 对象同给定数字相乘的结果
    multiplyBy: function(num) {
      return this.clone()._multiplyBy(num);
    },

    _multiplyBy: function(num) {
      this.x *= num;
      this.y *= num;
      this.z *= num;
      return this;
    },

    // @method scaleBy(scale: Vector3): Vector3
    // 返回当前`Vector3` 对象同给定`Vector3` 对象对应分量分别相乘的结果
    scaleBy: function(vector3) {
      return new Vector3(
        this.x * vector3.x,
        this.y * vector3.y,
        this.z * vector3.z
      );
    },

    // @method unscaleBy(scale: Vector3): Vector3
    // 返回当前`Vector3` 对象同给定`Vector3` 对象对应分量分别相除的结果
    unscaleBy: function(vector3) {
      if (vector3.x == 0 || vector3.y == 0 || vector3.z == 0)
        throw new Error("对象属性存在0");
      return new Vector3(
        this.x / vector3.x,
        this.y / vector3.y,
        this.z / vector3.z
      );
    },

    // @method round(): Vector3
    // 返回当前`Vector3` 对象分量四舍五入取整后的结果
    round: function() {
      return this.clone()._round();
    },

    _round: function() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      return this;
    },

    // @method floor(): Vector3
    // 返回当前`Vector3` 对象分量向下取整后的结果
    floor: function() {
      return this.clone()._floor();
    },

    _floor: function() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      return this;
    },

    // @method ceil(): Vector3
    // 返回当前`Vector3` 对象分量向上取整后的结果
    ceil: function() {
      return this.clone()._ceil();
    },

    _ceil: function() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      return this;
    },

    // @method trunc(): Vector3
    // 返回当前`Vector3` 对象分量去除小数部分取整后的结果
    trunc: function() {
      return this.clone()._trunc();
    },

    _trunc: function() {
      this.x = trunc$3(this.x);
      this.y = trunc$3(this.y);
      this.z = trunc$3(this.z);
      return this;
    },

    // @method distanceTo(otherPoint: Vector3): Number
    // 返回当前`Vector3` 对象和给定`Vector3` 对象的笛卡尔距离
    distanceTo: function(vector3) {
      vector3 = toVector3(vector3);

      var x = vector3.x - this.x,
        y = vector3.y - this.y,
        z = vector3.z - this.z;

      return Math.sqrt(x * x + y * y + z * z);
    },

    // @method equals(otherPoint: Vector3, maxMargin?: Number): Boolean
    // 在给定的精度范围内比较两个 `Vector3` 对象是否相等
    equals: function(vector3, maxMargin) {
      var margin = Math.max(
        Math.abs(this.x - vector3.x),
        Math.abs(this.y - vector3.y),
        Math.abs(this.z - vector3.z)
      );

      return margin <= (maxMargin === undefined ? Number.EPSILON : maxMargin);
    },

    // @method toString(): String
    // 返回对象的字符串表示，常用于调试目的
    toString: function(digits) {
      return (
        "QVector3(" +
        formatNum(this.x, digits) +
        ", " +
        formatNum(this.y, digits) +
        ", " +
        formatNum(this.z, digits) +
        ")"
      );
    },

    // @method toGlobalPos(areaName: String): QVector3d
    // 返回相对指定场景的平面坐标：QVector3d 原生对象
    toGlobalPos: async function(areaName) {
      var _world = Module.EngineClient.impl().getWorldManager();
      var _area = await asyncHandle(
        _world,
        _world.getArea,
        AsyncFunImpl.QAreaSceneManager,
        areaName
      );
      if (!_area) return null;
      var _v3d = await asyncHandle(
        _area,
        _area.toGlobalPos,
        AsyncFunImpl.QVector3d,
        this.get()
      );
      return _v3d;
    },

    // @method toGlobalVec3d(areaName: String): QGlobalVec3D
    // 返回相对指定场景的经纬度坐标：QGlobalVec3D 原生对象
    toGlobalVec3d: async function(areaName) {
      var _world = Module.EngineClient.impl().getWorldManager();
      var _area = await asyncHandle(
        _world,
        _world.getArea,
        AsyncFunImpl.QAreaSceneManager,
        areaName
      );
      if (!_area) return null;

      var _v3d = await asyncHandle(
        _area,
        _area.toGlobalPos,
        AsyncFunImpl.QVector3d,
        this.get()
      );
      var _math = Module.EngineClient.impl().getMath();
      var _gv3d = await asyncHandle(
        _math,
        _math.vec3DToGlobalVec3D,
        AsyncFunImpl.QGlobalVec3D,
        _v3d
      );
      return _gv3d;
    },

    // @method update(): this
    // 将属性值回写到原生 QVector3 对象
    update: function() {
      if (this._qVector3 == null)
        this._qVector3 = new Module.QVector3(this.x, this.y, this.z);
      this._qVector3.x = this.x;
      this._qVector3.y = this.y;
      this._qVector3.z = this.z;
      return this;
    }
  };

  // @factory Q3D.vector3(a: Number, b: Number, c: Number)
  // 创建一个三维相对坐标点

  // @alternative
  // @factory Q3D.vector3(coords: Array)
  // 传入参数可以采用数组方式： `[Number, Number, Number]`

  // @alternative
  // @factory Q3D.vector3(coords: Object)
  // 传入参数可以采用对象方式 `{x: Number, y: Number, z: Number}`
  // 或者原生的  QVector3 对象

  // @alternative
  // @factory Q3D.vector3()
  // 传入参数为空，对象成员默认为0

  function toVector3(x, y, z) {
    if (x instanceof Vector3) {
      return x;
    }
    if (isArray(x) && x.length === 3) {
      return new Vector3(x[0], x[1], x[2]);
    }
    if (typeof x === "object" && "x" in x && "y" in x && "z" in x) {
      return new Vector3(x.x, x.y, x.z);
    }
    if (arguments.length == 0) {
      return new Vector3(0, 0, 0);
    }
    return new Vector3(x, y, z);
  }

  // @method toVector3(): Vector3
  // 逗号分隔的字符串与引擎值类型对象转换：
  // ```js
  // var v2 = "50.5, 30.2, 0.9".toVector3();
  // ```
  String.prototype.toVector3 = function() {
    try {
      return toVector3(
        parseFloat(this.split(",")[0]),
        parseFloat(this.split(",")[1]),
        parseFloat(this.split(",")[2])
      );
    } catch (e) {
      return null;
    }
  };

  /*
   * @class Vector3d
   * @aka Q3D.Vector3d
   *
   * 表示三维大地坐标点，其中 y 分量通常表示高度
   *
   * @example
   *
   * ```js
   * var v3d= Q3D.vector3d(50.34343, 5.02342, 30.52324);
   * ```
   *
   * 其他的创建方式：
   *
   * ```js
   * var v3d = Q3D.vector3d();
   * v3d = Q3D.vector3d(50.34343, 5.02342, 30.52324);
   * v3d = Q3D.vector3d([50.34343, 5.02342, 30.52324]);
   * v3d = Q3D.vector3d({x:50.34343, y:5.02342, z:30.52324});
   * ```
   */

  function Vector3d(x, y, z) {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      throw new Error("无效的QVector3d对象: (" + x + ", " + y + ", " + z + ")");
    }
    // @property x: Number
    // 坐标 x
    this.x = x;
    // @property y: Number
    // 坐标 y
    this.y = y;
    // @property z: Number
    // 坐标 z
    this.z = z;
  }

  var trunc$4 =
    Math.trunc ||
    function(v) {
      return v > 0 ? Math.floor(v) : Math.ceil(v);
    };

  Vector3d.prototype = {
    // @method get(): QVector3d
    // 返回对应的原生 QVector3d 对象
    get: function() {
      this.update();
      return this._qVector3d;
    },

    getCLSID: function() {
      return Enums.ValueTypeCLSID.QVector3d;
    },

    // @method clone(): Vector3d
    // 克隆一个新的 `Vector3d` 对象
    clone: function() {
      return new Vector3d(this.x, this.y, this.z);
    },

    // @method add(otherPoint: Vector3d): Vector3d
    // 返回当前`Vector3d` 对象和给定`Vector3d` 对象相加的结果
    add: function(vector3d) {
      // non-destructive, returns a new point
      return this.clone()._add(toVector3d(vector3d));
    },

    _add: function(vector3d) {
      // destructive, used directly for performance in situations where it's safe to modify existing point
      this.x += vector3d.x;
      this.y += vector3d.y;
      this.z += vector3d.z;
      return this;
    },

    // @method subtract(otherPoint: Vector3d): Vector3d
    // 返回当前`Vector3d` 对象和给定`Vector3d` 对象相减的结果
    subtract: function(vector3d) {
      return this.clone()._subtract(toVector3d(vector3d));
    },

    _subtract: function(vector3d) {
      this.x -= vector3d.x;
      this.y -= vector3d.y;
      this.z -= vector3d.z;
      return this;
    },

    // @method divideBy(num: Number): Vector3d
    // 返回当前`Vector3d` 对象同给定数字相除的结果
    divideBy: function(num) {
      return this.clone()._divideBy(num);
    },

    _divideBy: function(num) {
      if (num == 0) throw new Error("除数为0");
      this.x /= num;
      this.y /= num;
      this.z /= num;
      return this;
    },

    // @method multiplyBy(num: Number): Vector3d
    // 返回当前`Vector3d` 对象同给定数字相乘的结果
    multiplyBy: function(num) {
      return this.clone()._multiplyBy(num);
    },

    _multiplyBy: function(num) {
      this.x *= num;
      this.y *= num;
      this.z *= num;
      return this;
    },

    // @method scaleBy(scale: Vector3d): Vector3d
    // 返回当前`Vector3d` 对象同给定`Vector3d` 对象对应分量分别相乘的结果
    scaleBy: function(vector3d) {
      return new Vector3d(
        this.x * vector3d.x,
        this.y * vector3d.y,
        this.z * vector3d.z
      );
    },

    // @method unscaleBy(scale: Vector3d): Vector3d
    // 返回当前`Vector3d` 对象同给定`Vector3d` 对象对应分量分别相除的结果
    unscaleBy: function(vector3d) {
      if (vector3d.x == 0 || vector3d.y == 0 || vector3d.z == 0)
        throw new Error("对象属性存在0");
      return new Vector3d(
        this.x / vector3d.x,
        this.y / vector3d.y,
        this.z / vector3d.z
      );
    },

    // @method round(): Vector3d
    // 返回当前`Vector3` 对象分量四舍五入取整后的结果
    round: function() {
      return this.clone()._round();
    },

    _round: function() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      return this;
    },

    // @method floor(): Vector3d
    // 返回当前`Vector3` 对象分量向下取整后的结果
    floor: function() {
      return this.clone()._floor();
    },

    _floor: function() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      return this;
    },

    // @method ceil(): Vector3d
    // 返回当前`Vector3d` 对象分量向上取整后的结果
    ceil: function() {
      return this.clone()._ceil();
    },

    _ceil: function() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      return this;
    },

    // @method trunc(): Vector3d
    // 返回当前`Vector3d` 对象分量去除小数部分取整后的结果
    trunc: function() {
      return this.clone()._trunc();
    },

    _trunc: function() {
      this.x = trunc$4(this.x);
      this.y = trunc$4(this.y);
      this.z = trunc$4(this.z);
      return this;
    },

    // @method distanceTo(otherPoint: Vector3d): Number
    // 返回当前`Vector3d` 对象和给定`Vector3d` 对象的笛卡尔距离
    distanceTo: function(vector3d) {
      vector3d = toVector3d(vector3d);

      var x = vector3d.x - this.x,
        y = vector3d.y - this.y,
        z = vector3d.z - this.z;

      return Math.sqrt(x * x + y * y + z * z);
    },

    // @method equals(otherPoint: Vector3d, maxMargin?: Number): Boolean
    // 在给定的精度范围内比较两个 `Vector3d` 对象是否相等
    equals: function(vector3d, maxMargin) {
      var margin = Math.max(
        Math.abs(this.x - vector3d.x),
        Math.abs(this.y - vector3d.y),
        Math.abs(this.z - vector3d.z)
      );

      return margin <= (maxMargin === undefined ? Number.EPSILON : maxMargin);
    },

    // @method toString(): String
    // 返回对象的字符串表示，常用于调试目的
    toString: function(digits) {
      return (
        "QVector3d(" +
        formatNum(this.x, digits) +
        ", " +
        formatNum(this.y, digits) +
        ", " +
        formatNum(this.z, digits) +
        ")"
      );
    },

    // @method toLocalPos(areaName: String): QVector3
    // 返回相对指定场景的相对坐标：QVector3 原生对象
    toLocalPos: async function(areaName) {
      var _world = Module.EngineClient.impl().getWorldManager();
      var _area = await asyncHandle(
        _world,
        _world.getArea,
        AsyncFunImpl.QAreaSceneManager,
        areaName
      );
      if (!_area) return;
      var _v3 = await asyncHandle(
        _area,
        _area.toLocalPos,
        AsyncFunImpl.QVector3,
        this.get()
      );
      return _v3;
    },

    // @method toGlobalVec3d(areaName: String): QGlobalVec3D
    // 返回相对指定场景的经纬度坐标：QGlobalVec3D 原生对象
    toGlobalVec3d: async function() {
      var _math = Module.EngineClient.impl().getMath();
      var _gv3d = await asyncHandle(
        _math,
        _math.vec3DToGlobalVec3D,
        AsyncFunImpl.QGlobalVec3D,
        this.get()
      );
      return _gv3d;
    },

    // @method update(): this
    // 将属性值回写到原生 QVector3d 对象
    update: function() {
      if (this._qVector3d == null)
        this._qVector3d = new Module.QVector3d(this.x, this.y, this.z);
      this._qVector3d.x = this.x;
      this._qVector3d.y = this.y;
      this._qVector3d.z = this.z;
      return this;
    }
  };

  // @factory Q3D.vector3d(a: Number, b: Number, c: Number)
  // 创建一个三维大地坐标点

  // @alternative
  // @factory Q3D.vector3d(coords: Array)
  // 传入参数可以采用数组方式： `[Number, Number, Number]`

  // @alternative
  // @factory Q3D.vector3d(coords: Object)
  // 传入参数可以采用对象方式 `{x: Number, y: Number, z: Number}`
  // 或者原生的  QVector3d 对象

  // @alternative
  // @factory Q3D.vector3d()
  // 传入参数为空，对象成员默认为0

  function toVector3d(x, y, z) {
    if (x instanceof Vector3d) {
      return x;
    }
    if (isArray(x) && x.length === 3) {
      return new Vector3d(x[0], x[1], x[2]);
    }
    if (typeof x === "object" && "x" in x && "y" in x && "z" in x) {
      return new Vector3d(x.x, x.y, x.z);
    }
    if (arguments.length == 0) {
      return new Vector3d(0, 0, 0);
    }
    return new Vector3d(x, y, z);
  }

  // @method toVector3d(): Vector3d
  // 逗号分隔的字符串与引擎值类型对象转换：
  // ```js
  // var v2 = "50.5, 30.2, 0.9".toVector3d();
  // ```
  String.prototype.toVector3d = function() {
    try {
      return toVector3d(
        parseFloat(this.split(",")[0]),
        parseFloat(this.split(",")[1]),
        parseFloat(this.split(",")[2])
      );
    } catch (e) {
      return null;
    }
  };

  /*
   * @class ColourValue
   * @aka Q3D.ColourValue
   *
   * 表示颜色值，传入参数按 r，g，b，a的顺序
   *
   * @example
   *
   * ```js
   * var clr = Q3D.colourValue(1,0,1,1);
   * ```
   *
   * 其他的创建方式：
   *
   * ```js
   * var clr = Q3D.colourValue(1,0,1,1);
   * clr = Q3D.colourValue([1,0,1,1]);
   * clr = Q3D.colourValue({r:1, g:0, b:1, a:1});
   * clr = Q3D.colourValue('#ffff00',0.5);
   * ```
   */

  function ColourValue(r, g, b, a) {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
      throw new Error(
        "无效的QColourValue对象: (" + r + ", " + g + ", " + b + ", " + a + ")"
      );
    }
    // @property r: Number
    // r 分量[0~1]
    this.r = r;
    // @property g: Number
    // g 分量[0~1]
    this.g = g;
    // @property b: Number
    // b 分量[0~1]
    this.b = b;
    // @property a: Number
    // a 透明度[0~1]
    this.a = a;
  }

  ColourValue.prototype = {
    // @method get(): QColourValue
    // 返回对应的原生 QColourValue 对象
    get: function() {
      this.update();
      return this._qColurValue;
    },

    getCLSID: function() {
      return Enums.ValueTypeCLSID.QColourValue;
    },

    // @method clone(): ColurValue
    // 克隆一个新的 `ColurValue` 对象
    clone: function() {
      return new ColourValue(this.r, this.g, this.b, this.a);
    },

    //将一个数字转化成16进制字符串形式
    _toHex: function(num) {
      return num < 16
        ? "0" + num.toString(16).toUpperCase()
        : num.toString(16).toUpperCase();
    },

    // @method toWebColor(): String
    // 返回16进制颜色的字符串表示
    toWebColor: function() {
      return (
        "#" +
        this._toHex(parseInt(this.r * 255)) +
        this._toHex(parseInt(this.g * 255)) +
        this._toHex(parseInt(this.b * 255))
      );
    },
    // @method toString(): String
    // 返回对象的字符串表示，常用于调试目的
    toString: function(digits) {
      return (
        "QColourValue(" +
        formatNum(this.r, digits) +
        ", " +
        formatNum(this.g, digits) +
        ", " +
        formatNum(this.b, digits) +
        ", " +
        formatNum(this.a, digits) +
        ")"
      );
    },

    // @method revise(): this
    // 修订 `ColurValue`  对象的颜色分量
    revise: function() {
      this.r = Math.pow(this.r, 1 / 2.2);
      this.g = Math.pow(this.g, 1 / 2.2);
      this.b = Math.pow(this.b, 1 / 2.2);
      return this;
    },

    // @method update(): this
    // 将属性值回写到原生 QColourValue 对象
    update: function() {
      if (this._qColurValue == null)
        this._qColurValue = new Module.QColourValue(
          this.r,
          this.g,
          this.b,
          this.a
        );
      this._qColurValue.r = this.r;
      this._qColurValue.g = this.g;
      this._qColurValue.b = this.b;
      this._qColurValue.a = this.a;
      return this;
    }
  };

  // @factory Q3D.colourValue(a: Number, b: Number, c: Number, d: Number)
  // 创建一个带有r，g，b，a分量的颜色值

  // @alternative
  // @factory Q3D.colourValue(rgba: Array)
  // 传入参数可以采用数组方式： `[Number, Number, Number, Number]`

  // @alternative
  // @factory Q3D.colourValue(rgba: Object)
  // 传入参数可以采用对象方式 `{r: Number, g: Number, b: Number, a: Number}`
  // 或者原生的  QColourValue 对象

  // @alternative
  // @factory Q3D.colourValue(rgb: String, a: Number)
  // 传入参数可以采用字符串和数值混合方式

  function toColourValue(r, g, b, a) {
    if (r instanceof ColourValue) {
      return r;
    }
    if (isArray(r) && r.length === 4) {
      return new ColourValue(r[0], r[1], r[2], r[3]);
    }
    if (typeof r === "object" && "r" in r && "g" in r && "b" in r && "a" in r) {
      return new ColourValue(r.r, r.g, r.b, r.a);
    }
    if (arguments.length == 0) {
      return new ColourValue(0, 0, 0, 1);
    }
    if (
      arguments.length == 2 &&
      typeof arguments[0] === "string" &&
      !isNaN(arguments[1])
    ) {
      //只定义了a和b
      var clrStr = r.indexOf("#") != -1 ? r.replace(/#/g, "") : r;
      var rVal = parseInt(clrStr.substr(0, 2), 16) / 255;
      var gVal = parseInt(clrStr.substr(2, 2), 16) / 255;
      var bVal = parseInt(clrStr.substr(4, 2), 16) / 255;
      return new ColourValue(rVal, gVal, bVal, g);
    }
    return new ColourValue(r, g, b, a);
  }

  // @method toColourValue(): ColourValue
  // 逗号分隔的字符串与引擎值类型对象转换：
  // ```js
  // var clr = "1,0,1".toColourValue();
  // ```
  String.prototype.toColourValue = function() {
    try {
      return toColourValue(this.toString(), 1);
    } catch (e) {
      return null;
    }
  };

  /*
   * @class GlobalVec3d
   * @aka Q3D.GlobalVec3d
   *
   * 表示三维空间下的经纬度坐标点
   *
   * @example
   *
   * ```js
   * var gv3d = Q3D.globalVec3d(121.343345, 31.023422, 10);
   * ```
   *
   * 其他的创建方式：
   *
   * ```js
   * var gv3d = Q3D.globalVec3d(121.343345, 31.023422, 10);
   * gv3d = Q3D.globalVec3d([121.343345, 31.023422, 10]);
   * gv3d = Q3D.globalVec3d({longitude:121.343345, latitude:31.023422, height:10});
   * ```
   */

  function GlobalVec3d(_lon, _lat, _hgt) {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    if (isNaN(_lon) || isNaN(_lat) || isNaN(_hgt)) {
      throw new Error(
        "无效的QGlobalVec3d对象: (" + _lon + ", " + _lat + ", " + _hgt + ")"
      );
    }
    // @property longitude: Number
    // 经度 longitude
    this.longitude = _lon;
    // @property latitude: Number
    // 纬度 latitude
    this.latitude = _lat;
    // @property height: Number
    // 高度 height
    this.height = _hgt;
  }

  GlobalVec3d.prototype = {
    // @method get(): QGlobalVec3D
    // 返回对应的原生 QGlobalVec3D 对象
    get: function() {
      this.update();
      return this._qGlobalVec3d;
    },

    getCLSID: function() {
      return Enums.ValueTypeCLSID.QGlobalVec3d;
    },

    // @method clone(): GlobalVec3d
    // 克隆一个新的 `GlobalVec3d` 对象
    clone: function() {
      return new GlobalVec3d(this.longitude, this.latitude, this.height);
    },

    // @method equals(otherGlobalVec3d: GlobalVec3d, maxMargin?: Number): Boolean
    // 在给定的精度范围内比较两个 `GlobalVec3d` 对象是否相等
    equals: function(gv3d, maxMargin) {
      var margin = Math.max(
        Math.abs(this.longitude - gv3d.longitude),
        Math.abs(this.latitude - gv3d.latitude),
        Math.abs(this.height - gv3d.height)
      );

      return margin <= (maxMargin === undefined ? Number.EPSILON : maxMargin);
    },

    // @method toString(): String
    // 返回对象的字符串表示，常用于调试目的
    toString: function(digits) {
      return (
        "QGlobalVec3d(" +
        formatNum(this.longitude, digits) +
        ", " +
        formatNum(this.latitude, digits) +
        ", " +
        formatNum(this.height, digits) +
        ")"
      );
    },

    // @method toGlobalPos(): QVector3d
    // 返回相对指定场景的平面坐标：QVector3d 原生对象
    toGlobalPos: async function() {
      var _math = Module.EngineClient.impl().getMath();
      var _v3d = await asyncHandle(
        _math,
        _math.globalVec3DToVec3D,
        AsyncFunImpl.QVector3d,
        this.get()
      );
      return _v3d;
    },

    // @method toLocalPos(areaName: String): QVector3
    // 返回相对指定场景的相对坐标：QVector3 原生对象
    toLocalPos: async function(areaName) {
      var _world = Module.EngineClient.impl().getWorldManager();
      var _area = await asyncHandle(
        _world,
        _world.getArea,
        AsyncFunImpl.QAreaSceneManager,
        areaName
      );
      if (!_area) return null;
      var _math = Module.EngineClient.impl().getMath();
      var _v3d = await asyncHandle(
        _math,
        _math.globalVec3DToVec3D,
        AsyncFunImpl.QVector3d,
        this.get()
      );
      var _v3 = await asyncHandle(
        _area,
        _area.toLocalPos,
        AsyncFunImpl.QVector3,
        _v3d
      );
      return _v3;
    },

    // @method distanceTo(areaName: String, otherPoint: GlobalVec3D): Number
    // 返回当前`GlobalVec3D` 对象和给定`GlobalVec3D` 对象的笛卡尔距离
    distanceTo: async function(areaName, otherPoint) {
      var gv3d = toGlobalVec3d(otherPoint);

      var toPnt = await gv3d.toLocalPos(areaName);
      var fromPnt = await this.toLocalPos(areaName);

      var x = toPnt.x - fromPnt.x,
        y = toPnt.y - fromPnt.y,
        z = toPnt.z - fromPnt.z;

      return Math.sqrt(x * x + y * y + z * z);
    },

    // @method update(): this
    // 将属性值回写到原生 QGlobalVec3D 对象
    update: function() {
      if (this._qGlobalVec3d == null)
        this._qGlobalVec3d = new Module.QGlobalVec3D(
          this.longitude,
          this.latitude,
          this.height
        );
      this._qGlobalVec3d.longitude = this.longitude;
      this._qGlobalVec3d.latitude = this.latitude;
      this._qGlobalVec3d.height = this.height;
      return this;
    }
  };

  // @factory Q3D.globalVec3d(a: Number, b: Number, c: Number)
  // 创建一个三维空间的经纬度坐标点，传入参数按经度、纬度、高度的顺序

  // @alternative
  // @factory Q3D.globalVec3d(coords: Array)
  // 传入参数可以采用数组方式： `[Number, Number, Number]`

  // @alternative
  // @factory Q3D.globalVec3d(coords: Object)
  // 传入参数可以采用对象方式 `{longitude: Number, latitude: Number, height: Number}`
  // 或者原生的  QGlobalVec3d 对象

  function toGlobalVec3d(_lon, _lat, _hgt) {
    if (_lon instanceof GlobalVec3d) {
      return _lon;
    }
    if (isArray(_lon) && _lon.length === 3) {
      return new GlobalVec3d(_lon[0], _lon[1], _lon[2]);
    }
    if (
      typeof _lon === "object" &&
      "longitude" in _lon &&
      "latitude" in _lon &&
      "height" in _lon
    ) {
      return new GlobalVec3d(_lon.longitude, _lon.latitude, _lon.height);
    }
    if (arguments.length == 0) {
      return new GlobalVec3d(0, 0, 0);
    }
    return new GlobalVec3d(_lon, _lat, _hgt);
  }

  // @method toGlobalVec3d(): GlobalVec3d
  // 逗号分隔的字符串与引擎值类型对象转换：
  // ```js
  // var gv3d = "121.343345, 31.023422, 10".toGlobalVec3d();
  // ```
  String.prototype.toGlobalVec3d = function() {
    try {
      return toGlobalVec3d(
        parseFloat(this.split(",")[0]),
        parseFloat(this.split(",")[1]),
        parseFloat(this.split(",")[2])
      );
    } catch (e) {
      return null;
    }
  };

  /*
   * @class ArcVertex
   * @aka Q3D.ArcVertex
   *
   * 用于管道、 道路、 铁路等矢量对象的弧度坐标点（浮点类型）
   *
   * @example
   *
   * ```js
   * var av = Q3D.arcVertex(50.5, 30.2, 100.5, 1.2, 10);
   * ```
   *
   * 其他的创建方式：
   *
   * ```js
   * var av = Q3D.arcVertex(50.5, 30.2, 100.5, 1.2, 10);
   * av = Q3D.arcVertex([50.5, 30.2, 100.5, 1.2, 10]);
   * av = Q3D.arcVertex({x:50.5, y:30.2, z:100.5, r:1.2, d:10});
   * ```
   */

  function ArcVertex(x, y, z, r, d) {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(r) || isNaN(d)) {
      throw new Error(
        "无效的QArcVertex对象: (" +
          x +
          ", " +
          y +
          ", " +
          z +
          ", " +
          r +
          ", " +
          d +
          ")"
      );
    }
    if (+r < 1.0 || +d < 0) {
      throw new Error(
        "无效的QArcVertex对象: (" +
          x +
          ", " +
          y +
          ", " +
          z +
          ", " +
          r +
          ", " +
          d +
          ")"
      );
    }
    // @property x: Number
    // 坐标 x
    this.x = x;
    // @property y: Number
    // 坐标 y
    this.y = y;
    // @property z: Number
    // 坐标 z
    this.z = z;
    // @property r: Number
    // 拐弯半径 r，默认=1.0，要求>=1.0
    this.r = r;
    // @property d: Number
    //拐弯精度 d，默认=10°
    this.d = d;
  }

  ArcVertex.prototype = {
    // @method get(): QArcVertex
    // 返回对应的原生 QArcVertex 对象
    get: function() {
      this.update();
      return this._qArcVertex;
    },

    getCLSID: function() {
      return Enums.ValueTypeCLSID.QArcVertex;
    },

    // @method getRadius(): Number
    // 返回拐弯半径
    getRadius: function() {
      return this.r;
    },

    // @method getdAngle(): Number
    // 返回弯曲度
    getdAngle: function() {
      return this.d;
    },

    // @method clone(): ArcVertex
    // 克隆一个新的 `ArcVertex` 对象
    clone: function() {
      return new ArcVertex(this.x, this.y, this.z, this.r, this.d);
    },

    // @method add(otherArcVertex: ArcVertex): ArcVertex
    // 返回当前`ArcVertex` 对象和给定`ArcVertex` 对象相加的结果
    add: function(otherArcVertex) {
      // non-destructive, returns a new point
      return this.clone()._add(toArcVertex(otherArcVertex));
    },

    _add: function(otherArcVertex) {
      // destructive, used directly for performance in situations where it's safe to modify existing point
      this.x += otherArcVertex.x;
      this.y += otherArcVertex.y;
      this.z += otherArcVertex.z;
      return this;
    },

    // @method subtract(otherArcVertex: ArcVertex): ArcVertex
    // 返回当前`ArcVertex` 对象和给定`ArcVertex` 对象相减的结果
    subtract: function(otherArcVertex) {
      return this.clone()._subtract(toArcVertex(otherArcVertex));
    },

    _subtract: function(otherArcVertex) {
      this.x -= otherArcVertex.x;
      this.y -= otherArcVertex.y;
      this.z -= otherArcVertex.z;
      return this;
    },

    // @method toString(): String
    // 返回对象的字符串表示，常用于调试目的
    toString: function(digits) {
      return (
        "QArcVertex(" +
        formatNum(this.x, digits) +
        ", " +
        formatNum(this.y, digits) +
        ", " +
        formatNum(this.z, digits) +
        ", " +
        formatNum(this.r, digits) +
        ", " +
        formatNum(this.d, digits) +
        ")"
      );
    },

    // @method update(): this
    // 将属性值回写到原生 QArcVertex 对象
    update: function() {
      if (this._qArcVertex == null) {
        var v3 = new Module.QVector3(0, 0, 0);
        this._qArcVertex = new Module.QArcVertex(v3, 1, 1);
      }
      this._qArcVertex.pos = new Module.QVector3(this.x, this.y, this.z);
      this._qArcVertex.radius = this.r;
      this._qArcVertex.dTheta = this.d;
      return this;
    }
  };

  // @factory Q3D.arcVertex(a: Number, b: Number, c: Number, d: Number, e: Number)
  // 创建一个三维弧度坐标点

  // @alternative
  // @factory Q3D.arcVertex(coords: Array)
  // 传入参数可以采用数组方式： `[Number, Number, Number, Number, Number]`

  // @alternative
  // @factory Q3D.arcVertex(coords: Object)
  // 传入参数可以采用对象方式 `{x: Number, y: Number, z: Number, r: Number, d: Number}`
  function toArcVertex(x, y, z, r, d) {
    if (x instanceof ArcVertex) {
      return x;
    }
    if (isArray(x) && x.length === 5) {
      return new ArcVertex(x[0], x[1], x[2], x[3], x[4]);
    }
    if (
      typeof x === "object" &&
      "x" in x &&
      "y" in x &&
      "z" in x &&
      "r" in x &&
      "d" in x
    ) {
      return new ArcVertex(x.x, x.y, x.z, x.r, x.d);
    }

    return new ArcVertex(x, y, z, r, d);
  }

  // @method toArcVertex(): ArcVertex
  // 逗号分隔的字符串与引擎值类型对象转换：
  // ```js
  // var av= "50.5, 30.2, 100.5, 1.2, 10".toArcVertex();
  // ```
  String.prototype.toArcVertex = function() {
    try {
      return toArcVertex(
        parseFloat(this.split(",")[0]),
        parseFloat(this.split(",")[1]),
        parseFloat(this.split(",")[2]),
        parseFloat(this.split(",")[3]),
        parseFloat(this.split(",")[4])
      );
    } catch (e) {
      return null;
    }
  };

  /* @class GlobalCamera
   * @aka Q3D.GlobalCamera
   *
   * 表示全局摄像机对象，可用于普通的飞行操作
   *
   * @example
   *
   * ```
   * var gc = Q3D.globalCamera();
   * ```
   */

  function GlobalCamera() {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
  }

  GlobalCamera.prototype = {
    // @method get(): QGlobalCamera
    // 返回对应的原生 QGlobalCamera 对象
    get: async function() {
      var _wm = Module.EngineClient.impl().getWorldManager();
      return await asyncHandle(
        _wm,
        _wm.getMainCamera,
        AsyncFunImpl.QGlobalCamera,
        0
      );
    },

    // @method getAbsPosEx(): QVector3d
    //获取主摄像机当前位置，用原生的 QVector3d 原生对象表示
    getAbsPos: async function() {
      var _gc = await this.get();
      return await asyncHandle(_gc, _gc.getAbsPos, AsyncFunImpl.QVector3d);
    },

    // @method getOrientation(): QVector3
    //获取主摄像机当前欧拉角，用原生的 QVector3 原生对象表示
    getOrientation: async function() {
      var _gc = await this.get();
      return await asyncHandle(
        _gc,
        _gc.getOrientation,
        AsyncFunImpl.QVector3,
        Enums.orientationType.World
      );
    },

    // @method getYaw(): Number
    //获取主摄像机偏航角度
    getYaw: async function() {
      var _gc = await this.get();
      return await asyncHandle(_gc, _gc.fetchRotYaw, AsyncFunImpl.Float);
    },

    // @method getPitch(): Number
    //获取主摄像机俯仰角度
    getPitch: async function() {
      var _gc = await this.get();
      return await asyncHandle(_gc, _gc.fetchRotPitch, AsyncFunImpl.Float);
    },

    // @method getRotByYawPitch(yawVal: Number,pitchVal: Number): QVector3
    //根据俯仰角和偏航角生成主摄像机欧拉角
    getRotByYawPitch: async function(yawVal, pitchVal) {
      var _gc = await this.get();
      return await asyncHandle(
        _gc,
        _gc.makeRotByYawPitch,
        AsyncFunImpl.QVector3,
        pitchVal,
        yawVal
      );
    },

    // @method setFOVy(fovVal: Number): this
    //设置主摄像机视角大小，一般为45°
    setFOVy: async function(fovVal) {
      var _gc = await this.get();
      _gc.setFOVy(fovVal);
    },
    // @method setClipDistance(nearDist: Number, farDist: Number): this
    //设置主摄像机近、远截面距离
    setClipDistance: async function(nearDist, farDist) {
      var _gc = await this.get();
      _gc.setNearClipDistance(nearDist);
      _gc.setFarClipDistance(farDist);
    },

    // @method flyTo(v3d: Vector3d, v3?: Vector3, flyTime?: Number, fn?: Function): this
    // 按给定角度飞行到给定坐标位置，可以设置飞行动作结束后的回调函数
    flyTo: async function(v3d, v3, flyTime, fn) {
      var _gc = await this.get();
      _gc.setFlyToListener(false);
      if (fn && isFunction(fn)) {
        _gc.setFlyToListener(true);
        gMap.once("onCameraFlyToEnd", fn);
      }
      v3 = v3 || toVector3(await this.getOrientation());
      flyTime = isNumber(flyTime) ? flyTime : 0;
      _gc.flyTo(v3d.get(), v3.get(), flyTime);
    },

    // @method flyToByDistance(targetPosV3d: Vector3d, distToTargetPos?: Number, viewDirV3?: Vector3, flyTime?: Number, fn?: Function): this
    // 按给定角度飞行到某一位置，该位置与给定坐标位置的距离为指定值，可以设置飞行动作结束后的回调函数
    flyToByDistance: async function(
      targetPosV3d,
      distToTargetPos,
      viewDirV3,
      flyTime,
      fn
    ) {
      viewDirV3 = viewDirV3 || toVector3(this.getOrientation());
      distToTargetPos = isNumber(distToTargetPos) ? distToTargetPos : 20;
      var _math = Module.EngineClient.impl().getMath();
      var v3 = await asyncHandle(
        _math,
        _math.eulerToDirection,
        AsyncFunImpl.QVector3,
        viewDirV3.get()
      );
      var eyePosV3d = toVector3d(
        v3.x * distToTargetPos + targetPosV3d.x,
        v3.y * distToTargetPos + targetPosV3d.y,
        v3.z * distToTargetPos + targetPosV3d.z
      );
      this.flyTo(eyePosV3d, viewDirV3, flyTime, fn);
    },

    // @method flyToByClick(domName: String, clickPosV3d: Vector3d, flyTime?: Number, fn?: Function): this
    // 保持当前摄像机角度和高度飞到给定目标位置，并使得该坐标位于窗口中心位置。可以设置飞行动作结束后的回调函数
    flyToByClick: async function(domName, clickPosV3d, flyTime, fn) {
      var w = document.getElementById(domName).clientWidth * gMap._zoom;
      var h = document.getElementById(domName).clientHeight * gMap._zoom;
      var v2_enter = toVector2I(w / 2, h / 2); //容器中心的屏幕坐标
      var _gc = await this.get();
      var pickPosResult = await asyncHandle(
        _gc,
        _gc.pickNearsetScenePoint,
        AsyncFunImpl.QCamera_pickResult,
        v2_enter.get(),
        0xffffffff
      );
      var v3d_oc = toVector3d(pickPosResult.getPos()); //页面中心的交点坐标
      if (
        v3d_oc.equals(toVector3d(0, 0, 0)) ||
        clickPosV3d.equals(toVector3d(0, 0, 0))
      )
        return;
      var v3 = toVector3(await this.getOrientation()); //相机角度
      var v3d_cam = toVector3d(await this.getAbsPos()); //相机位置
      var v3d_diff = v3d_cam.clone().subtract(v3d_oc);
      var v3d_eyepos = clickPosV3d.clone().add(v3d_diff);
      this.flyTo(v3d_eyepos, v3, flyTime, fn);
    },

    // @method flyToPos(lng: Number, lat: Number, hgt?: Number, pitch?: Number, yaw?: Number, flyTime?: Number, fn?: Function): this
    // 飞行到给定经度、纬度、高度、俯仰角和偏航角对应的位置，可以设置飞行动作结束后的回调函数
    //  这里俯角[0,-90°]，仰角[0,90°]，偏航角正北为0°，逆时针方向旋转
    flyToPos: async function(lng, lat, hgt, pitch, yaw, flyTime, fn) {
      var _gc = await this.get();
      _gc.setFlyToListener(false);
      if (fn && isFunction(fn)) {
        _gc.setFlyToListener();
        gMap.once("onCameraFlyToEnd", fn);
      }

      hgt = isNumber(hgt) ? hgt : 50;
      pitch = isNumber(pitch) ? pitch : -45;
      yaw = isNumber(yaw) ? yaw : 0;
      flyTime = isNumber(flyTime) ? flyTime : 0;

      var v3d = await toGlobalVec3d(lng, lat, hgt).toGlobalPos();
      var v3 = await this.getRotByYawPitch(yaw, pitch);
      _gc.flyTo(v3d, v3, flyTime);
    },

    // @method flyToNode(node: QSceneNode, v3?: Vector3, flyTime?: Number, fn?: Function): this
    //飞行到给定节点前，方向和角度自动调整，可以设置飞行动作结束后的回调函数
    //可以在场景编辑器中设置节点的固定观察位置和视角
    flyToNode: async function(nodePath, v3, flyTime, fn) {
      var _gc = await this.get();
      _gc.setFlyToListener(false);
      if (fn && isFunction(fn)) {
        _gc.setFlyToListener(true);
        gMap.once("onCameraFlyToEnd", fn);
      }
      v3 = v3 || toVector3(await this.getOrientation());
      flyTime = isNumber(flyTime) ? flyTime : 0;
      var node = await gMap.getSceneNode(nodePath);
      _gc.flyToNode(node, v3.get(), flyTime);
    },

    // @method startCircleFly(eyePos: Vector3d, targetPos: Vector3d, timePerCircle?: Number, rounds?:Number, isLoop?:Boolean, fn?: Function): this
    // 围绕固定点飞行（rounds为负数逆时针方向旋转），可以设置飞行动作结束后的回调函数
    startCircleFly: async function(
      eyePos,
      targetPos,
      timePerCircle,
      rounds,
      isLoop,
      fn
    ) {
      var _gc = await this.get();
      _gc.setFlyToListener(false);
      if (fn && isFunction(fn)) {
        _gc.setFlyToListener(true);
        //_gc.addListener(Enums.listenerMsgID.LMID_CIRCLEANI);
        gMap.once("onCameraCircleAniEnd", fn);
      }
      timePerCircle = isNumber(timePerCircle) ? timePerCircle : 1.0;
      rounds = isNumber(rounds) ? rounds : 1;
      isLoop = isLoop ? 1 : 0;
      _gc.playCircleAni(
        eyePos.get(),
        targetPos.get(),
        timePerCircle * Math.abs(rounds),
        rounds,
        isLoop
      );
    },

    // @method stopCircleFly(): this
    // 停止围绕飞行
    stopCircleFly: async function() {
      var _gc = await this.get();
      _gc.stopCircleAni();
    },

    // @method onCameraUpdate(enabled: Boolean, fn?: Function, interval?: Number): this
    // 绑定摄像机更新事件，其中interval为每次更新调用时间间隔
    onCameraUpdate: async function(enabled, fn, interval) {
      if (fn && !isFunction(fn)) {
        throw new Error("无效的回调函数");
      }
      var _gc = await this.get();
      interval = interval || 100;
      if (enabled) {
        _gc.addListener(Enums.listenerMsgID.LMID_CIRCLEANI);
        gMap.on("onTransformChanged", throttle(fn, interval, gMap));
      } else {
        _gc.removeListener(Enums.listenerMsgID.LMID_CIRCLEANI);
        gMap.off("onTransformChanged", fn);
      }
    }
  };

  // @factory Q3D.globalCamera(): GlobalCamera
  // 获取引擎的全局摄像机对象
  function getGlobalCamera() {
    return new GlobalCamera();
  }

  /* @class LayerGroup
   * @aka Q3D.LayerGroup
   *
   * 表示图层对象集合，可用于控制图层显示和隐藏，支持图层动态添加以及节点的图层添加或迁移等
   *
   * @example
   *
   * ```
   * var lg = Q3D.layerGroup();
   * ```
   */

  function LayerGroup() {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
  }

  LayerGroup.prototype = {
    // @method getAllLayerNames(): Array
    // 返回所有图层名称列表
    getAllLayerNames: async function() {
      var _layerNames = [];
      var _wm = Module.EngineClient.impl().getWorldManager();
      var _layerlist = await asyncHandle(
        _wm,
        _wm.getAllLayers,
        AsyncFunImpl.QLayerList
      );
      var _layer = await asyncHandle(
        _layerlist,
        _layerlist.firstLayer,
        AsyncFunImpl.QLayer
      );
      if (_layer) {
        var _layname = await asyncHandle(
          _layer,
          _layer.getLayerName,
          AsyncFunImpl.String
        );
        _layerNames.push(_layname);
        while (true) {
          _layer = await asyncHandle(
            _layerlist,
            _layerlist.nextLayer,
            AsyncFunImpl.QLayer
          );
          if (!_layer) break;
          _layname = await asyncHandle(
            _layer,
            _layer.getLayerName,
            AsyncFunImpl.String
          );
          _layerNames.push(_layname);
        }
      }
      _layerlist.release();
      return _layerNames;
    },

    // @method getLayerAllNodeNames(layerName: String): Array
    // 返回图层中所有节点名称列表
    getLayerAllNodeNames: async function(layerName) {
      var _nodeNames = [];
      var _layer = await this.getLayer(layerName);
      if (!_layer) {
        //如果不存在就返回
        return _nodeNames;
      }
      var _nodes = await asyncHandle(
        _layer,
        _layer.getLayerAllNode,
        AsyncFunImpl.QSceneNodeList
      );
      var _node = await asyncHandle(
        _nodes,
        _nodes.firstNode,
        AsyncFunImpl.QSceneNode
      );
      if (_node) {
        _nodeNames.push(
          await asyncHandle(_node, _node.getFullName, AsyncFunImpl.String)
        );
        while (true) {
          _node = await asyncHandle(
            _nodes,
            _nodes.nextNode,
            AsyncFunImpl.QSceneNode
          );
          if (!_node) break;
          _nodeNames.push(
            await asyncHandle(_node, _node.getFullName, AsyncFunImpl.String)
          );
        }
      }
      _nodes.release();
      return _nodeNames;
    },

    // @method getLayer(layerName: String): QLayer
    // 根据名称获取当前要操作的原生 QLayer 图层对象
    getLayer: async function(layerName) {
      var _wm = Module.EngineClient.impl().getWorldManager();
      return await asyncHandle(_wm, _wm.getLayer, AsyncFunImpl.QLayer, layerName);
    },

    // @method isLayerVisible(layerName: String): Boolean
    // 根据名称判断图层是否可见
    isLayerVisible: async function(layerName) {
      var _wm = Module.EngineClient.impl().getWorldManager();
      var layer = await asyncHandle(
        _wm,
        _wm.getLayer,
        AsyncFunImpl.QLayer,
        layerName
      );
      if (layer)
        return await asyncHandle(layer, layer.isVisible, AsyncFunImpl.Boolean);
      return false;
    },

    // @method createLayers(layers: Array): Boolean
    // 根据图层名数组，一次性创建多个新的图层，常用于管理动态添加的节点。如果图层名列表中存在已经创建过的图层，则本操作无效
    createLayers: async function(layers) {
      if (!isArray(layers) || typeof layers[0] !== "string") return false;

      var _wm = Module.EngineClient.impl().getWorldManager();
      //判断要创建的图层中是否有已经存在的图层
      var _cnt = layers.length;
      for (let i = 0; i < _cnt; i++) {
        var _layer = await this.getLayer(layers[i]);
        if (_layer)
          //图层已经存在
          _cnt--;
      }

      if (_cnt < layers.length) return false;

      for (let i = 0; i < _cnt; i++) {
        await asyncHandle(_wm, _wm.createLayer, AsyncFunImpl.QLayer, layers[i]);
      }
      return true;
    },

    // @method setLayersVisible(layers: Array, isVisible: Boolean): this
    // 批量控制图层是否可见
    setLayersVisible: async function(layers, isVisible) {
      if (isArray(layers) && typeof layers[0] === "string") {
        var _wm = Module.EngineClient.impl().getWorldManager();
        for (let i = 0; i < layers.length; i++) {
          var _layer = await this.getLayer(layers[i]);
          if (_layer) {
            _layer.setVisible(isVisible);
          }
        }
      }
      return this;
    },

    // @method addSceneNodesToLayer(layerName: String, nodeNames: Array): Boolean
    // 将节点列表中所有节点添加到指定图层中，nodeName包括AreaName
    // 注：节点同时只能属于一个图层，所以被操作节点应不属于任何图层
    addSceneNodesToLayer: async function(layerName, nodeNames) {
      let _nodes = [];
      if (isArray(nodeNames) && typeof nodeNames[0] === "string") {
        var _wm = Module.EngineClient.impl().getWorldManager();
        for (let i = 0, len = nodeNames.length; i < len; i++) {
          var _node = await asyncHandle(
            _wm,
            _wm.getSceneNode,
            AsyncFunImpl.QSceneNode,
            nodeNames[i]
          );
          if (_node) {
            var _layname = await asyncHandle(
              _node,
              _node.getLayerName,
              AsyncFunImpl.String
            );
            if (_layname == "") {
              //_dstLayer.addSceneNode(_node);
              _nodes.push(_node); //添加到数组中
            }
          }
        }
      }

      if (_nodes.length != nodeNames.length) return false;

      var _dstLayer = await this.getLayer(layerName);
      if (!_dstLayer) {
        //如果不存在就创建一个
        await this.createLayers([layerName]);
        _dstLayer = await this.getLayer(layerName);
      }
      _nodes.forEach(node => _dstLayer.addSceneNode(_node));

      return true;
    },

    // @method removeSceneNodesFromLayer(layerName: String, nodeNames?: Array): Boolean
    // 从指定图层中删除节点列表中所有节点或全部删除，nodeName包括AreaName
    removeSceneNodesFromLayer: async function(layerName, nodeNames) {
      var _dstLayer = await this.getLayer(layerName);
      if (!_dstLayer) {
        //如果不存在就返回
        return false;
      }

      if (typeof nodeNames === "undefined") _dstLayer.removeAllNodes();
      else {
        let _nodes = [];
        if (isArray(nodeNames) && typeof nodeNames[0] === "string") {
          var _wm = Module.EngineClient.impl().getWorldManager();
          for (let i = 0, len = nodeNames.length; i < len; i++) {
            var _node = await asyncHandle(
              _wm,
              _wm.getSceneNode,
              AsyncFunImpl.QSceneNode,
              nodeNames[i]
            );
            if (_node)
              //_dstLayer.removeNode(_node);
              _nodes.push(_node); //添加到数组中
          }
        }
        if (_nodes.length != nodeNames.length) return false;
        _nodes.forEach(node => _dstLayer.removeNode(_node));
      }
      return true;
    },

    // @method moveSceneNodesBetweenLayers(srcLayerName: String, dstLayerName: String): Boolean
    // 将一个图层中所有节点移动到另一个图层
    moveSceneNodesBetweenLayers: async function(srcLayerName, dstLayerName) {
      var _srcLayer = await this.getLayer(srcLayerName);
      var _dstLayer = await this.getLayer(dstLayerName);
      if (!_srcLayer || !_dstLayer) return false;

      var _nodes = await asyncHandle(
        _srcLayer,
        _srcLayer.getLayerAllNode,
        AsyncFunImpl.QSceneNodeList
      );
      var _node = await asyncHandle(
        _nodes,
        _nodes.firstNode,
        AsyncFunImpl.QSceneNode
      );
      if (_node) {
        _srcLayer.removeNode(_node);
        _dstLayer.addSceneNode(_node);
        while (true) {
          _node = await asyncHandle(
            _nodes,
            _nodes.nextNode,
            AsyncFunImpl.QSceneNode
          );
          if (!_node) break;
          _srcLayer.removeNode(_node);
          _dstLayer.addSceneNode(_node);
        }
      }
      _nodes.release();
      return true;
    }
  };

  // @factory Q3D.layerGroup()
  // 获取引擎的图层对象集合
  function getLayerGroup() {
    return new LayerGroup();
  }

  /* @class InputManager
   * @aka Q3D.InputManager
   *
   * 表示操作管理器对象，可用于设置惯性、俯仰角、默认平面、定位器、限制区域；调节缩放、漫游的移动速度等
   *
   * @example
   *
   * ```
   * var im = Q3D.inputManager();
   * ```
   */
  function InputManager() {
    if (!gMap) {
      throw new Error("无效的引擎对象，引擎对象未初始化！");
    }
    this._im = Module.EngineClient.impl().getInputManager();
  }

  InputManager.prototype = {
    // @method get(): QInputManager
    // 返回对应的原生 QInputManager 对象
    get: function() {
      return this._im;
    },

    // @method setLocator(enabled: Boolean): this
    // 定位器显示开关
    setLocator: function(enabled) {
      if (enabled) {
        this._im.showLocator();
      } else {
        this._im.hideLocator();
      }
      return this;
    },

    // @method setInertia(enabled: Boolean, duration: Number): this
    // 设置惯性和惯性时间(默认1s)
    setInertia: function(enabled, duration) {
      if (enabled) {
        this._im.enableInertia();
        this._im.setInertiaDuration(isNaN(duration) ? 1 : duration);
      } else {
        this._im.disableInertia();
      }
      return this;
    },

    // @method setPitch(enabled: Boolean, range: Array): this
    // 设置俯仰和俯仰范围(俯仰角范围:[-90,+90])
    setPitch: async function(enabled, range) {
      if (enabled) {
        var _wm = Module.EngineClient.impl().getWorldManager();
        var _gc = await asyncHandle(
          _wm,
          _wm.getMainCamera,
          AsyncFunImpl.QGlobalCamera,
          0
        );
        var oldpitch = await asyncHandle(
          _gc,
          _gc.fetchRotPitch,
          AsyncFunImpl.Float
        );
        this._im.enablePitch();
        if (isArray(range) && range.length === 2) {
          range.sort(function(a, b) {
            return a > b ? 1 : -1;
          }); //从小到大排序
          range[0] = Math.max(range[0], -90);
          range[1] = Math.min(range[1], +90);
          var newpitch = oldpitch;
          if (parseInt(range[0]) == parseInt(range[1])) {
            newpitch = range[0];
          } else {
            if (oldpitch < range[0]) newpitch = range[0];
            else {
              if (oldpitch > range[1]) newpitch = range[1];
            }
          }
          var yaw = await asyncHandle(_gc, _gc.fetchRotYaw, AsyncFunImpl.Float);
          var ori = await asyncHandle(
            _gc,
            _gc.makeRotByYawPitch,
            AsyncFunImpl.QVector3,
            newpitch,
            yaw
          );
          var campos = await asyncHandle(
            _gc,
            _gc.getAbsPos,
            AsyncFunImpl.QVector3d
          );
          _gc.flyTo(campos, ori, 0.5);
          this._im.setPitchRange(range[0], range[1]);
        } else {
          this._im.setPitchRange(-90, +90);
        }
      } else {
        this._im.disablePitch();
      }
      return this;
    },

    // @method setDynamicSpeed(scaleSpd: Number, rambleSpd: Number): this
    // 设置缩放（默认=0.2）和漫游的动态速度（默认=1.0）
    setDynamicSpeed: async function(scaleSpd, rambleSpd) {
      await asyncHandle(
        this._im,
        this._im.sendActionMsg,
        AsyncFunImpl.Int,
        Enums.actionType.SCALED_SCREEN,
        Enums.actionMsg.SET_SCALE_DYNAMICSPEED,
        0,
        isNaN(scaleSpd) ? 0.2 : scaleSpd
      );
      await asyncHandle(
        this._im,
        this._im.sendActionMsg,
        AsyncFunImpl.Int,
        Enums.actionType.RAMBLE_KEEPORI,
        Enums.actionMsg.SET_RAMBLE_TRANSLATESPEED,
        0,
        isNaN(rambleSpd) ? 1.0 : rambleSpd
      );
      return this;
    },

    // @method setKeyboardMoveSpeed(moveSpd: Number): this
    // 设置键盘移动速度
    setKeyboardMoveSpeed: function(moveSpd) {
      this._im.setSpeed(moveSpd);
      return this;
    },

    // @method setLimitBox(enabled: Boolean, boxId: Number): this
    // 限制区域开关和指定当前限制区域
    setLimitBox: function(enabled, boxId) {
      var rm = Module.EngineClient.impl().getInputActionRestrictionManager();
      if (enabled) {
        rm.setCurRestriction(boxId);
      } else {
        rm.setCurRestriction(-1);
      }
      rm = null;
      return this;
    },

    // @method setFixedPointRotate(enabled: Boolean, fixPnt: Vector3d): this
    //切换当前右键旋转操作为绕指定点旋转
    setFixedPointRotate: async function(enabled, fixPnt) {
      if (enabled) {
        await asyncHandle(
          this._im,
          this._im.sendActionMsg,
          AsyncFunImpl.Int,
          Enums.actionType.ROTATET_FIXPNT,
          Enums.actionMsg.SET_FIXPNT,
          0,
          fixPnt.get()
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.RBUTTON,
          Enums.actionType.ROTATET_FIXPNT
        );
      } else {
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.RBUTTON,
          Enums.actionType.ROTATET_SCREEN
        );
      }
      return this;
    },

    // @method setFirstPersonRotate(enabled: Boolean): this
    // 切换当前鼠标右键旋转操作模式：旋转摄像机模式还是旋转场景模式
    setFirstPersonRotate: function(enabled) {
      if (enabled) {
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.RBUTTON,
          Enums.actionType.ROTATET_CAMERA
        );
      } else {
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.RBUTTON,
          Enums.actionType.ROTATET_SCREEN
        );
      }
      return this;
    },

    // @method setKeyControlOperation(keyCtrlId: Number, actionType?: Number): this
    // 设置键盘控制操作, actionType不设表示取消对应键盘操作
    // keyCtrlId: Q3D.Enums.keyboard.A.ctrlId / Q3D.Enums.keyboard.D.ctrlId / Q3D.Enums.keyboard.W.ctrlId / Q3D.Enums.keyboard.S.ctrlId / Q3D.Enums.keyboard.Q.ctrlId / Q3D.Enums.keyboard.E.ctrlId / Q3D.Enums.keyboard.SPACE.ctrlId / Q3D.Enums.keyboard.LEFT.ctrlId / Q3D.Enums.keyboard.RIGHT.ctrlId / Q3D.Enums.keyboard.UP.ctrlId / Q3D.Enums.keyboard.DOWN.ctrlId
    // actionType: Q3D.Enums.actionType.TRANS_LEFTX / Q3D.Enums.actionType.TRANS_RIGHT / Q3D.Enums.actionType.TRANS_FORTH / Q3D.Enums.actionType.TRANS_BACKX / Q3D.Enums.actionType.TRANS_DOWNX / Q3D.Enums.actionType.TRANS_UPXXX / Q3D.Enums.actionType.CAMERA_CLOSETO
    setKeyControlOperation: function(keyCtrlId, actionType = 0) {
      this._im.bindControlAction(Enums.device.KEYBOARD, keyCtrlId, actionType);
      return this;
    },

    // @method setThirdPersonOperation(enabled: Boolean,meshName: String, aniName: String): Boolean
    // 开启第三人称操作模式，绑定鼠标和部分键盘操作，可用于控制人物行走
    // 鼠标左键：转动镜头；鼠标中键：点击移动；鼠标右键：场景旋转
    // 键盘 ASDW ：左右移动，前进后退
    // 键盘 箭头 ： 左转右转，抬头低头
    setThirdPersonOperation: function(enabled, meshName, aniName) {
      if (enabled) {
        if (meshName === undefined) {
          mapObj.showNotice("提示", "输入参数无效!");
          return false;
        }
        aniName = aniName || "";
        this._im.setInputType(1, meshName, aniName);
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.LBUTTON,
          Enums.actionType.THIRD_CAMERAROTATE
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.MBUTTON,
          Enums.actionType.THIRD_MOVETO
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.RBUTTON,
          Enums.actionType.THIRD_ROTATE
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.WHEEL,
          Enums.actionType.THIRD_WHEEL
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.A.ctrlId,
          Enums.actionType.THIRD_MOVELEFT
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.D.ctrlId,
          Enums.actionType.THIRD_MOVERIGHT
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.W.ctrlId,
          Enums.actionType.THIRD_MOVEFORTH
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.S.ctrlId,
          Enums.actionType.THIRD_MOVEBACK
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.Q.ctrlId,
          Enums.actionType.THIRD_MOVEDOWN
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.E.ctrlId,
          Enums.actionType.THIRD_MOVEUP
        );

        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.LEFT.ctrlId,
          Enums.actionType.THIRD_TURNLEFT
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.RIGHT.ctrlId,
          Enums.actionType.THIRD_TURNRIGHT
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.DOWN.ctrlId,
          Enums.actionType.THIRD_LOOKDOWN
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.UP.ctrlId,
          Enums.actionType.THIRD_LOOKUP
        );
      } else {
        this._im.setInputType(0, "", "");
        /*
        //键盘绑定
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.A.ctrlId,
          Enums.actionType.TRANS_LEFTX
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.D.ctrlId,
          Enums.actionType.TRANS_RIGHT
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.W.ctrlId,
          Enums.actionType.TRANS_FORTH
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.S.ctrlId,
          Enums.actionType.TRANS_BACKX
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.Q.ctrlId,
          Enums.actionType.TRANS_DOWNX
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.E.ctrlId,
          Enums.actionType.TRANS_UPXXX
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.LEFT.ctrlId,
          Enums.actionType.TRANS_LEFTX
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.RIGHT.ctrlId,
          Enums.actionType.TRANS_RIGHT
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.UP.ctrlId,
          Enums.actionType.TRANS_FORTH
        );
        this._im.bindControlAction(
          Enums.device.KEYBOARD,
          Enums.keyboard.DOWN.ctrlId,
          Enums.actionType.TRANS_BACKX
        );
      */
        //鼠标绑定
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.LBUTTON,
          Enums.actionType.TRANS_SCENE
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.MBUTTON,
          Enums.actionType.RAMBLE_KEEPORI
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.RBUTTON,
          Enums.actionType.ROTATET_SCREEN
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.WHEEL,
          Enums.actionType.SCALED_SCREEN
        );
      }
      return true;
    },

    // @method setThirdPersonBind(enabled: Boolean,nodePath: String): Boolean
    // 开启第三人称绑定节点模式，绑定鼠标和部分键盘操作到指定的运动节点
    // 鼠标左键：转动镜头；鼠标中键：点击移动；鼠标右键：场景旋转
    setThirdPersonBind: async function(enabled, nodePath) {
      var node = await gMap.getSceneNode(nodePath);
      if (!node) return false;

      if (enabled) {
        this._im.bindNode(node);
        //鼠标绑定
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.LBUTTON,
          Enums.actionType.THIRD_CAMERAROTATE
        );
        //this._im.bindControlAction(Enums.device.MOUSE, Enums.mouse.MBUTTON, Enums.actionType.THIRD_MOVETO);
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.RBUTTON,
          Enums.actionType.THIRD_ROTATE
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.WHEEL,
          Enums.actionType.THIRD_WHEEL
        );
      } else {
        this._im.unbindNode();
        //鼠标绑定
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.LBUTTON,
          Enums.actionType.TRANS_SCENE
        );
        //this._im.bindControlAction(Enums.device.MOUSE, Enums.mouse.MBUTTON, Enums.actionType.RAMBLE_KEEPORI);
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.RBUTTON,
          Enums.actionType.ROTATET_SCREEN
        );
        this._im.bindControlAction(
          Enums.device.MOUSE,
          Enums.mouse.WHEEL,
          Enums.actionType.SCALED_SCREEN
        );
      }
      return true;
    },

    // @method enableAllActions(enabled: Boolean, actArray: Array): this
    // 启用或禁用所有常用操作
    enableAllActions: function(enabled, actArray) {
      actArray = actArray || [];
      var defaultActionArray = [
        Enums.actionType.TRANS_LEFTX,
        Enums.actionType.TRANS_RIGHT,
        Enums.actionType.TRANS_FORTH,
        Enums.actionType.TRANS_BACKX,
        Enums.actionType.TRANS_DOWNX,
        Enums.actionType.TRANS_UPXXX,
        Enums.actionType.CAMERA_CLOSETO,
        Enums.actionType.TRANS_SCENE,
        Enums.actionType.RAMBLE_KEEPORI,
        Enums.actionType.ROTATES_SCREEN,
        Enums.actionType.SCALED_SCREEN,
        Enums.actionType.YPSS_SCREEN
      ];

      //合并两个数组，去重
      var _concat = function(arr1, arr2) {
        //不要直接使用var arr = arr1，这样arr只是arr1的一个引用，两者的修改会互相影响
        var arr = arr1.concat();
        //或者使用slice()复制，var arr = arr1.slice(0)
        for (var i = 0; i < arr2.length; i++) {
          arr.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
        }
        return arr;
      };

      var combinedActions = _concat(defaultActionArray, actArray);

      for (var i = 0, len = combinedActions.length; i < len; ++i) {
        this._im.enableAction(combinedActions[i], enabled);
      }
      return this;
    }
  };

  // @factory Q3D.inputManager()
  // 获取引擎的操作管理器对象
  function getInputManager() {
    return new InputManager();
  }

  /* @namespace Map
   * @section Use Internal UI Widget
   */
  Map.include({
    // @method removeVideoDialog(videoCtrlName: String): Boolean
    // 移除指定视频弹框
    removeVideoDialog: async function(videoCtrlName) {
      var uiSystem = this.get().getUISystem();
      var videoCtrl = await asyncHandle(
        uiSystem,
        uiSystem.getVideoCtrl,
        AsyncFunImpl.QUIVideoCtrl,
        videoCtrlName
      );
      if (!videoCtrl) return false;

      videoCtrl.setListener(-1); //取消监听
      uiSystem.removeVideoCtrl(videoCtrlName);
      this.off("onVideoCtrlClose_" + videoCtrlName);
      return true;
    },

    // @method getVideoDialog(videoCtrlName: String): QVideoCtrl
    // 根据名称获取指定视频弹框，返回QVideoCtrl原生对象
    getVideoDialog: async function(videoCtrlName) {
      var uiSystem = this.get().getUISystem();
      return await asyncHandle(
        uiSystem,
        uiSystem.getVideoCtrl,
        AsyncFunImpl.QUIVideoCtrl,
        videoCtrlName
      );
    },

    // @method showVideoDialog(videoCtrlName: String, options: Video options): QVideoCtrl
    // 显示各种视频弹框效果,注意在_UIMedia.zip中要有videoCtrl.layout
    showVideoDialog: async function(videoCtrlName, options) {
      var defaultOptions = {
        VideoPath: null,
        VideoType: Enums.videoSourceType.VIDSRC_NETSTREAM, //设置视频类型：VIDSRC_NETSTREAM - 网络实时视频流；VIDSRC_LOCAL - 本地视频。
        Title: {
          //设置窗口标题（文字、颜色、像素高度）
          Text: "",
          Color: toColourValue("#000000", 1),
          Height: 20
        },
        Left: 0, //设置窗口左上角位置
        Top: 0, //设置窗口左上角位置
        Width: 200, //设置窗口宽度（屏幕坐标）
        Height: 200, //设置窗口高度（屏幕坐标）
        TargetNodeName: null, //设置目标节点名称
        TargetPosition: null, //设置目标位置(QVector3d）
        AttachNodeName: null, //附着到某个指定节点名称（窗口位置跟随某个节点调整,此时窗口不能被随意拖动,可以调整大小）
        IsIndicatrixVisible: true, //设置指示线是否可见
        IndicatrixWidth: 2, //设置指向线的线宽
        IndicatrixMatrial: "", //设置指向线的材质名
        IndicatrixLocation: 1, //设置指示线连接位置：0 - center; 1 - nearest corner
        Draggable: true, //是否允许拖动
        OnVideoCtrlClose: null //视频窗口关闭回调事件
      };
      jQueryExtend(true, defaultOptions, options);
      try {
        var uiSystem = this.get().getUISystem();
        var videoCtrl = await asyncHandle(
          uiSystem,
          uiSystem.createVideoCtrlWithName,
          AsyncFunImpl.QUIVideoCtrl,
          videoCtrlName,
          defaultOptions.VideoPath,
          defaultOptions.VideoType
        );
        //如果videoCtrl对象已经存在，则返回
        if (!videoCtrl) return null;
        videoCtrl.setTitle(
          defaultOptions.Title.Text,
          defaultOptions.Title.Color.get(),
          defaultOptions.Title.Height
        );
        videoCtrl.setLeftTop(defaultOptions.Left, defaultOptions.Top);
        videoCtrl.setSize(defaultOptions.Width, defaultOptions.Height);
        var hasSpecifiedNodeOrPos = false; //记录是否有指定连接的节点或位置
        if (defaultOptions.TargetNodeName != null) {
          var node = await this.getSceneNode(defaultOptions.TargetNodeName);
          videoCtrl.targetNode(node);
          hasSpecifiedNodeOrPos = true;
        }
        if (defaultOptions.TargetPosition != null) {
          videoCtrl.targetPosition(defaultOptions.TargetPosition.get());
          hasSpecifiedNodeOrPos = true;
        }
        if (defaultOptions.AttachNodeName != null) {
          var node = await this.getSceneNode(defaultOptions.AttachNodeName);
          videoCtrl.attachNode(node);
          hasSpecifiedNodeOrPos = true;
        }

        if (defaultOptions.Draggable) videoCtrl.enableDrag();
        else videoCtrl.disableDrag();

        if (defaultOptions.IsIndicatrixVisible && hasSpecifiedNodeOrPos) {
          //当已经指定了连接的节点或位置，并且指示线设为可见
          videoCtrl.setIndicatrixVisible(true);
          videoCtrl.setIndicatrixWidth(defaultOptions.IndicatrixWidth);
          if (defaultOptions.IndicatrixMatrial != null) {
            videoCtrl.setIndicatrixMatrial(defaultOptions.IndicatrixMatrial);
          }
          videoCtrl.setIndicatrixLocation(defaultOptions.IndicatrixLocation);
        } else {
          videoCtrl.setIndicatrixVisible(false);
        }

        if (defaultOptions.OnVideoCtrlClose != null) {
          videoCtrl.setListener(Enums.listenerMsgID.LMID_VIDEOCTRL);
          this.once(
            "onVideoCtrlClose_" + videoCtrlName,
            defaultOptions.OnVideoCtrlClose
          );
        }
        return videoCtrl;
      } catch (e) {
        this.showNotice("错误", "showVideoDialog: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createImageWidget(imgWidgetName: String, options: ImageWidget options): QImageWidget
    //创建Image图片对象，支持动画加载，可用于生成一个静态图片或用于视频纹理，返回 QImageWidget 原生对象
    createImageWidget: async function(imgWidgetName, options) {
      var defaultOptions = {
        ImageUrl: "", //图片显示的内容
        LeftTop: toVector2(0, 0),
        Size: toVector2(300, 200),
        Alpha: 1,
        ZOrder: 1,
        //FadeIn: 0.5,
        Visible: true,
        LoadingOptions: {
          ImageUrl: "",
          FrameClip: toVector2(2, 2),
          Interval: 0.2
        },
        VideoOptions: {
          VideoPath: "",
          VideoType: Enums.videoSourceType.VIDSRC_NETSTREAM,
          IsLoop: true
        }
      };
      jQueryExtend(true, defaultOptions, options);
      try {
        var wm = this.get().getWorldManager();
        var uiSys = await asyncHandle(
          wm,
          wm.getUIWindowSys,
          AsyncFunImpl.QUIWindowSys,
          0
        );
        var widget = await asyncHandle(
          uiSys,
          uiSys.getWidget,
          AsyncFunImpl.QWindowWidget,
          imgWidgetName
        );
        if (!widget) {
          widget = await asyncHandle(
            uiSys,
            uiSys.createImageWidget,
            AsyncFunImpl.QImageWidget,
            imgWidgetName
          );
        }
        var imgWidget = await asyncHandle(
          widget,
          widget.asImageWidget,
          AsyncFunImpl.QImageWidget
        );

        if (defaultOptions.ImageUrl != "") {
          imgWidget.setImage(defaultOptions.ImageUrl);
        }
        imgWidget.setMarginLeft(defaultOptions.LeftTop.x);
        imgWidget.setMarginTop(defaultOptions.LeftTop.y);
        imgWidget.setLayoutWidth(defaultOptions.Size.x);
        imgWidget.setLayoutHeight(defaultOptions.Size.y);
        imgWidget.setAlpha(defaultOptions.Alpha);
        imgWidget.setVisible(defaultOptions.Visible);
        imgWidget.setZOrder(defaultOptions.ZOrder);
        //imgWidget.fadeIn(defaultOptions.FadeIn);

        if (defaultOptions.VideoOptions.VideoPath != "") {
          if (defaultOptions.LoadingOptions.ImageUrl != "") {
            //创建加载动画，配合视频使用
            imgWidget.setImage(defaultOptions.LoadingOptions.ImageUrl);
            var mat = await asyncHandle(
              imgWidget,
              imgWidget.getMaterial,
              AsyncFunImpl.QMaterial
            );
            var textureUnit = await asyncHandle(
              mat,
              mat.getTextureUnit,
              AsyncFunImpl.QTextureUnit,
              Enums.textureUnit.DIFFUSE
            );
            textureUnit.setFrameXClip(defaultOptions.LoadingOptions.FrameClip.x);
            textureUnit.setFrameYClip(defaultOptions.LoadingOptions.FrameClip.y);
            textureUnit.setFrameInterval(defaultOptions.LoadingOptions.Interval);
          }
          //创建新的材质
          var videoName = imgWidgetName + "_videoSrc";
          var _rm = this.get().getResourceManager();
          var _qVideo = await asyncHandle(
            _rm,
            _rm.getResource,
            AsyncFunImpl.QResource,
            Enums.resourceType.VIDEO,
            videoName
          );
          if (!_qVideo) {
            //若材质不存在就创建
            _qVideo = (
              await asyncHandle(
                _rm,
                _rm.registerResource,
                AsyncFunImpl.QResource,
                Enums.resourceType.VIDEO,
                videoName
              )
            ).asVideo();
            _qVideo.createEmpty();
          } else {
            _qVideo = _qVideo.asVideo();
            _qVideo.stop();
          }
          _qVideo.setVideoSource(
            defaultOptions.VideoOptions.VideoPath,
            defaultOptions.VideoOptions.VideoType
          );
          _qVideo.setWidth(defaultOptions.Size.x);
          _qVideo.setHeight(defaultOptions.Size.y);
          _qVideo.setAutoPlay(true);
          _qVideo.setLoop(defaultOptions.VideoOptions.IsLoop);
          _qVideo.play();

          var mat = await asyncHandle(
            imgWidget,
            imgWidget.getMaterial,
            AsyncFunImpl.QMaterial
          );
          var textureUnit = await asyncHandle(
            mat,
            mat.getTextureUnit,
            AsyncFunImpl.QTextureUnit,
            Enums.textureUnit.DIFFUSE
          );
          textureUnit.setVideo(videoName, true);
        }
        return imgWidget;
      } catch (e) {
        return null;
      }
    },

    // @method removeImageWidget(widgetName: String): Boolean
    // 移除指定Image图像
    removeImageWidget: async function(widgetName) {
      var wm = this.get().getWorldManager();
      var uiSys = await asyncHandle(
        wm,
        wm.getUIWindowSys,
        AsyncFunImpl.QUIWindowSys,
        0
      );
      var widget = await asyncHandle(
        uiSys,
        uiSys.getWidget,
        AsyncFunImpl.QWindowWidget,
        widgetName
      );
      if (!widget) return false;

      uiSys.destroyWidget(widgetName);
      return true;
    },

    // @method createTooltipWidget(nodePath: String, options: TooltipWidget options): QTooltipWidget
    //创建Tooltip信息框组件，支持添加链接三角块指向关注节点，返回 QTooltipWidget 原生对象
    createTooltipWidget: async function(nodePath, options) {
      var defaultOptions = {
        Name: null,
        Layout: 0, //相对窗口位置：左上(0),右上(1),左下(2),右下(3)
        Position: null, //偏移量：Vector2对象
        Size: toVector2(1, 1), //窗口大小：Vector2对象
        CenterOffset: toVector3(0, 0, 0), //相对node中心点偏移，用于生成子节点
        Alpha: 1,
        FadeIn: 0.5,
        ZOrder: null,
        TooltipOptions: {
          TriFillColor: toColourValue("#000000", 1),
          TriAlpha: 0.5,
          EdgeColor: null,
          EdgeWidth: 0
        }
      };
      jQueryExtend(true, defaultOptions, options);
      try {
        var wm = this.get().getWorldManager();
        var uiSys = await asyncHandle(
          wm,
          wm.getUIWindowSys,
          AsyncFunImpl.QUIWindowSys,
          0
        );

        //创建htmlWidget
        var tooltipWidget = await asyncHandle(
          uiSys,
          uiSys.createTooltipWidget,
          AsyncFunImpl.QTooltipWidget,
          defaultOptions.Name
        );
        if (!!tooltipWidget) {
          if (defaultOptions.Position != null) {
            switch (defaultOptions.Layout) {
              case 0: //左上
                tooltipWidget.setMarginLeft(defaultOptions.Position.x);
                tooltipWidget.setMarginTop(defaultOptions.Position.y);
                break;
              case 1: //右上
                tooltipWidget.setMarginRight(defaultOptions.Position.x);
                tooltipWidget.setMarginTop(defaultOptions.Position.y);
                break;
              case 2: //左下
                tooltipWidget.setMarginLeft(defaultOptions.Position.x);
                tooltipWidget.setMarginBottom(defaultOptions.Position.y);
                break;
              case 3: //右下
                tooltipWidget.setMarginRight(defaultOptions.Position.x);
                tooltipWidget.setMarginBottom(defaultOptions.Position.y);
                break;
            }
          }
          if (defaultOptions.Size != null) {
            tooltipWidget.setLayoutWidth(defaultOptions.Size.x);
            tooltipWidget.setLayoutHeight(defaultOptions.Size.y);
          }
          if (
            defaultOptions.Alpha != null &&
            typeof defaultOptions.Alpha == "number"
          ) {
            tooltipWidget.setAlpha(defaultOptions.Alpha);
          }
          if (
            defaultOptions.FadeIn != null &&
            typeof defaultOptions.FadeIn == "number"
          ) {
            tooltipWidget.fadeIn(defaultOptions.FadeIn);
          }
          if (
            defaultOptions.ZOrder != null &&
            typeof defaultOptions.ZOrder == "number"
          ) {
            tooltipWidget.setZOrder(defaultOptions.ZOrder);
          }
          tooltipWidget.setVisible(true);

          var node = await this.getSceneNode(nodePath);
          if (!!node) {
            //创建一个子节点
            await this.destroySceneNode(
              nodePath.split("/")[0],
              "_justfortooltip_",
              false
            );
            var childNode = await this.createCommonNode(
              nodePath + "/_justfortooltip_",
              Enums.sceneNodeType.SNODE_Group
            );
            childNode.setPosition(defaultOptions.CenterOffset.get());

            tooltipWidget.setTriFillColor(
              defaultOptions.TooltipOptions.TriFillColor.get()
            );
            tooltipWidget.setTriAlpha(defaultOptions.TooltipOptions.TriAlpha);
            tooltipWidget.setEdgeWidth(defaultOptions.TooltipOptions.EdgeWidth);
            if (
              defaultOptions.TooltipOptions.EdgeWidth > 0 &&
              defaultOptions.TooltipOptions.EdgeColor != null
            ) {
              tooltipWidget.setEdgeColor(
                defaultOptions.TooltipOptions.EdgeColor.get()
              );
            }
            tooltipWidget.createRectLinks(
              0,
              0,
              defaultOptions.Size.x,
              defaultOptions.Size.y
            );
            tooltipWidget.setAutoObserveObj(/*node*/ childNode);
          }
        }
        return tooltipWidget;
      } catch (e) {
        return null;
      }
    },

    // @method removeTooltipWidget(widgetName: String): Boolean
    // 移除指定Tooltip信息框
  	removeTooltipWidget: async function(widgetName) {
      var wm = this.get().getWorldManager();
      var uiSys = await asyncHandle(
        wm,
        wm.getUIWindowSys,
        AsyncFunImpl.QUIWindowSys,
        0
      );
      var widget = await asyncHandle(
        uiSys,
        uiSys.getTooltipWidget,
        AsyncFunImpl.QWindowWidget,
        widgetName
      );
      if (!widget) return false;
  		uiSys.destroyTooltipWidget(widgetName);
  		return true;
  	},   
  });

  /* @namespace Map
   * @section Use POI Node
   */
  Map.include({
    // @method createPOI(nodePath: String, options: POI Options): QPOINode
    // 在场景根节点下动态创建POI，Node路径"区域/[父节点]/要创建的POI节点名称"，返回原生 QPOINode 对象
    createPOI: async function(nodePath, options) {
      var defaultCreateOption = {
        Position: null, //封装Vector3对象
        Orientation: null, //封装Vector3对象
        OrientationType: Enums.nodeOrientationType.Self,
        Scale: null, //封装Vector3对象
        POIOptions: {
          FontSize: 20,
          FontName: "宋体",
          FontColor: toColourValue("#000000", 1), //封装ColourValue对象
          CharScale: 1.0,
          Text: null,
          Icon: null,
          IconSize: null, //封装Vector2对象
          POILayout: Enums.poiLayOut.Left,
          POILayoutCustom: null, //支持负数，取值0相当于LeftTop，1.0相当于LeftBottom，0.5相当于Left；只对POILayout为LeftCustom、TopCustom、RightCustom、BottomCustom时有效
          UIType: Enums.poiUIType.CameraOrientedKeepSize,
          IconAlphaEnabled: true,
          FontOutLine: null, //同描边有关
          FontEdgeColor: null, //封装ColourValue对象
          AlphaTestRef: null,
          Location: Enums.poiImagePositionType.POI_LOCATE_NONE,
          LocationOffset: null, //当Location为POI_LOCATE_CUSTOM起作用，封装Vector2对象
          BackFrameBorderSize: null, //同边框有关
          BackBorderColor: null, //封装ColourValue对象
          BackFillColor: null, //封装ColourValue对象
          LabelMargin: null, //封装Vector2对象
          IconLabelMargin: null, //封装Vector2对象，左右布局X分量有效，上下布局的Y分量有效
          SpecialTransparent: true,
          AlwaysOnScreen: false,
          AbsPriority: null,
          RelPriority: null
        },
        OnLoaded: null //加载结束回调
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        var poiNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_POI
        );
        if (poiNodeCreated != null) {
          var poiAppend = poiNodeCreated.asPOI();

          if (defaultCreateOption.Position != null) {
            poiAppend.setPosition(defaultCreateOption.Position.get());
          }

          if (defaultCreateOption.Orientation != null) {
            poiAppend.setOrientation(
              defaultCreateOption.Orientation.get(),
              defaultCreateOption.OrientationType
            );
          }

          if (defaultCreateOption.Scale != null) {
            poiAppend.setScale(defaultCreateOption.Scale.get());
          }

          poiAppend.setFontName(defaultCreateOption.POIOptions.FontName);
          poiAppend.setFontSize(defaultCreateOption.POIOptions.FontSize);
          poiAppend.setFontColor(
            defaultCreateOption.POIOptions.FontColor.revise().get()
          );
          poiAppend.setCharScale(defaultCreateOption.POIOptions.CharScale);

          if (defaultCreateOption.POIOptions.FontOutLine != null) {
            poiAppend.setFontOutLine(defaultCreateOption.POIOptions.FontOutLine);
            if (defaultCreateOption.POIOptions.FontEdgeColor != null)
              poiAppend.setFontEdgeColor(
                defaultCreateOption.POIOptions.FontEdgeColor.revise().get()
              );
          }

          if (defaultCreateOption.POIOptions.Text != null) {
            poiAppend.setText(defaultCreateOption.POIOptions.Text);
          } else {
            poiAppend.setText(nodePath.split("/")[1]);
          }
          if (defaultCreateOption.POIOptions.Icon != null) {
            poiAppend.setIcon(defaultCreateOption.POIOptions.Icon);
          }
          if (defaultCreateOption.POIOptions.IconSize != null) {
            poiAppend.setIconSize(defaultCreateOption.POIOptions.IconSize.get());
          }
          poiAppend.setPOILayout(defaultCreateOption.POIOptions.POILayout);
          if (
            defaultCreateOption.POIOptions.POILayout >=
              Enums.poiLayOut.LeftCustom &&
            defaultCreateOption.POIOptions.POILayout <=
              Enums.poiLayOut.BottomCustom &&
            defaultCreateOption.POIOptions.POILayoutCustom != null
          ) {
            poiAppend.setPOILayoutCustom(
              defaultCreateOption.POIOptions.POILayoutCustom
            );
          }
          poiAppend.setUIType(defaultCreateOption.POIOptions.UIType);
          poiAppend.setIconAlphaEnabled(
            defaultCreateOption.POIOptions.IconAlphaEnabled
          );

          if (defaultCreateOption.POIOptions.AlphaTestRef != null) {
            poiAppend.setAlphaTestRef(
              defaultCreateOption.POIOptions.AlphaTestRef
            );
          }

          if (
            defaultCreateOption.POIOptions.Location ==
              Enums.poiImagePositionType.POI_LOCATE_CUSTOM &&
            defaultCreateOption.POIOptions.LocationOffset != null
          ) {
            poiAppend.setLocation(Enums.poiImagePositionType.POI_LOCATE_CUSTOM); //此时[0,0]位于整个POI的中心位置
            poiAppend.setLocationOffset(
              defaultCreateOption.POIOptions.LocationOffset.get()
            ); //注意x水平右增加，y垂直上增加。[20,20]相当于将整个POI右上方移动若干像素
          } else {
            poiAppend.setLocation(defaultCreateOption.POIOptions.Location);
          }

          if (defaultCreateOption.POIOptions.BackFrameBorderSize != null) {
            poiAppend.showBackFrame(1);
            poiAppend.setBackFrameBorderSize(
              defaultCreateOption.POIOptions.BackFrameBorderSize
            );
            if (defaultCreateOption.POIOptions.BackBorderColor != null)
              poiAppend.setBackBorderColor(
                defaultCreateOption.POIOptions.BackBorderColor.revise().get()
              );
          }
          if (defaultCreateOption.POIOptions.BackFillColor != null) {
            poiAppend.setBackFillColor(
              defaultCreateOption.POIOptions.BackFillColor.revise().get()
            );
          }
          if (defaultCreateOption.POIOptions.LabelMargin != null) {
            poiAppend.setLabelMargin(
              defaultCreateOption.POIOptions.LabelMargin.get()
            );
          }
          //注意水平排版x分量有效果；上下排版y分量有效
          if (defaultCreateOption.POIOptions.IconLabelMargin != null) {
            poiAppend.setIconLabelMargin(
              defaultCreateOption.POIOptions.IconLabelMargin.get()
            );
          }

          if (defaultCreateOption.POIOptions.SpecialTransparent) {
            poiAppend.setSpecialTransparent(
              defaultCreateOption.POIOptions.SpecialTransparent
            );
          }
          if (defaultCreateOption.POIOptions.AlwaysOnScreen) {
            poiAppend.setAlwaysOnScreen(
              defaultCreateOption.POIOptions.AlwaysOnScreen
            );
          }
          if (isInteger(defaultCreateOption.POIOptions.AbsPriority)) {
            poiAppend.setAbsPriority(defaultCreateOption.POIOptions.AbsPriority);
          }
          if (isInteger(defaultCreateOption.POIOptions.RelPriority)) {
            poiAppend.setRelPriority(defaultCreateOption.POIOptions.RelPriority);
          }

          if (defaultCreateOption.OnLoaded) {
            poiNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnLoaded
            );
          }
          poiNodeCreated.trackAllResource();
          return poiAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createPOI: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method setBatchPOIJump(nodeNames: Array, height: Number, jumpTimes?: Number, circleTime?: Number): QMovieClipInstance
    // 批量设置POI跳动若干次（采用动画剪辑对象实现），如果是持续跳动的清除需要调用 clearPOIJump
    setBatchPOIJump: async function(
      nodeNames,
      height,
      jumpTimes = 1,
      circleTime = 1.0
    ) {
      if (!isArray(nodeNames) || typeof nodeNames[0] !== "string")
        return null;

      if (typeof this._jumpPOIObjs === "undefined") this._jumpPOIObjs = [];

      if (this._jumpPOIObjs.length > 0) {
        await this.clearPOIJump();
      }

      var framesPerSec = 50;
      var mcObj = await this.createMovieClip("mc_poijump", framesPerSec);
      var mciObj = await this.createMovieClipInstance("mci_poijump", mcObj);
      for (var j = 0; j < nodeNames.length; j++) {
        var nodeExist = await this.getSceneNode(nodeNames[j]);
        if (!nodeExist) continue;

        var nodeType = await asyncHandle(
          nodeExist,
          nodeExist.getNodeType,
          AsyncFunImpl.Int
        );
        if (nodeType != Enums.sceneNodeType.SNODE_POI) continue;

        var poiExist = nodeExist.asPOI();
        this._jumpPOIObjs.push(nodeNames[j]);

        //准备Actor定义
        var p0 = toVector3(
          await asyncHandle(poiExist, poiExist.getPosition, AsyncFunImpl.QVector3)
        );
        var p1 = toVector3(p0.x, p0.y + height, p0.z);
        var keyPairs = [
          {
            Key: 0,
            Pos: p0
          },
          {
            Key: (circleTime * framesPerSec) / 2,
            Pos: p1
          },
          {
            Key: circleTime * framesPerSec,
            Pos: p0
          }
        ];
        for (var i = 2; i < jumpTimes * 2; i++) {
          var tmp = {};
          tmp.Key = ((i + 1) * circleTime * framesPerSec) / 2;
          tmp.Pos = i % 2 == 0 ? p1 : p0;
          keyPairs.push(tmp);
        }

        this.addActorTranslateAnimation(mcObj, "poi_jump_ani_" + j, keyPairs);
        mciObj.setPlayer(
          "poi_jump_ani_" + j,
          Enums.playerType.Node,
          nodeNames[j]
        );
      }

      mciObj.setLoop(false);
      if (jumpTimes <= 0) {
        mciObj.setLoop(true);
      } else {
        //如果不循环播放，播放结束后清除相关动画对象
        var endKey = keyPairs[keyPairs.length - 1].Key;
        await this.registerMovieClipInstanceFrameEvent(mciObj, endKey, function(
          data
        ) {
          setTimeout(async () => {
            var mciName = data.name;
            this.clearMovieClipInstance(mciName);
          }, 100);
        });
      }
      mciObj.play();
      return mciObj;
    },

    // @method setBatchPOIGravityJump(nodeNames: Array, height: Number): QMovieClipInstance
    // 批量设置POI重力跳动效果（采用动画剪辑对象实现）
    setBatchPOIGravityJump: async function(nodeNames, height) {
      //计算参数
      //_h1为初始上升到的高度，_h2,_h3,_h4为各次的回弹高度
      var _h1 = height,
        _h2 = _h1 / 7,
        _h3 = _h1 / 35,
        _h4 = _h1 / 105;
      //根据t = Math.sqrt(2 * h/a)以及t1 + 2*t2 + 2*t3 + 2*t4 = 1，可算出：
      var t1 = 1 / 2.28917;
      //从而得出重力加速度
      var a = (2 * _h1) / (t1 * t1);
      //再求出t2,t3,t4
      var t2 = Math.sqrt((2 * _h2) / a);
      var t3 = Math.sqrt((2 * _h3) / a);
      var t4 = Math.sqrt((2 * _h4) / a);

      var framesPerSec = 50;
      var mcObj = await this.createMovieClip("mc_poijump_gravity", framesPerSec);
      var mciObj = await this.createMovieClipInstance(
        "mci_poijump_gravity",
        mcObj
      );
      for (var j = 0; j < nodeNames.length; j++) {
        var nodeExist = await this.getSceneNode(nodeNames[j]);
        if (!nodeExist) continue;

        var nodeType = await asyncHandle(
          nodeExist,
          nodeExist.getNodeType,
          AsyncFunImpl.Int
        );
        if (nodeType != Enums.sceneNodeType.SNODE_POI) continue;

        var poiExist = nodeExist.asPOI();

        //准备Actor定义
        var p0 = toVector3(
          await asyncHandle(poiExist, poiExist.getPosition, AsyncFunImpl.QVector3)
        );
        var p1 = toVector3(p0.x, p0.y + _h1, p0.z);
        var p2 = toVector3(p0.x, p0.y + _h2, p0.z);
        var p3 = toVector3(p0.x, p0.y + _h3, p0.z);
        var p4 = toVector3(p0.x, p0.y + _h4, p0.z);

        var keyPairs = [
          {
            Key: 0,
            Pos: p1
          },
          {
            Key: t1 * framesPerSec,
            Pos: p0
          },
          {
            Key: (t1 + t2) * framesPerSec,
            Pos: p2
          },
          {
            Key: (t1 + t2 * 2) * framesPerSec,
            Pos: p0
          },
          {
            Key: (t1 + t2 * 2 + t3) * framesPerSec,
            Pos: p3
          },
          {
            Key: (t1 + t2 * 2 + t3 * 2) * framesPerSec,
            Pos: p0
          },
          {
            Key: (t1 + t2 * 2 + t3 * 2 + t4) * framesPerSec,
            Pos: p4
          },
          {
            Key: framesPerSec,
            Pos: p0
          }
        ];

        this.addActorTranslateGravityAnimation(
          mcObj,
          "poi_jump_gravity_ani_" + j,
          keyPairs
        );
        mciObj.setPlayer(
          "poi_jump_gravity_ani_" + j,
          Enums.playerType.Node,
          nodeNames[j]
        );
      }

      mciObj.setLoop(false);

      //如果不循环播放，播放结束后清除相关动画对象
      var endKey = keyPairs[keyPairs.length - 1].Key;
      await this.registerMovieClipInstanceFrameEvent(mciObj, endKey, function(
        data
      ) {
        setTimeout(async () => {
          var mciName = data.name;
          this.clearMovieClipInstance(mciName);
        }, 100);
      });

      mciObj.play();
      return mciObj;
    },

    // @method clearPOIJump(): Boolean
    // 清除所有POI跳动效果
    clearPOIJump: async function(nodeNames) {
      if (
        typeof this._jumpPOIObjs === "undefined" ||
        this._jumpPOIObjs.length == 0
      )
        return true;
      //清除所有模型颜色闪烁
      await this.clearMovieClipInstance("mci_poijump");
      this._jumpPOIObjs.length = 0;

      return true;
    },

    // @method setPOIColorAni(nodePath: String, fromClr: ColourValue, toClr: ColourValue, timeSec: Number, isLoop?: Boolean): Boolean
    // 设置给定POI颜色闪烁动画，isLoop 为 true 表示颜色循环：fromClr->toClr->fromClr，为false表示 fromClr->toClr
    setPOIColorAni: async function(
      nodePath,
      fromClr,
      toClr,
      timeSec,
      isLoop = false
    ) {
      var nodeExist = await this.getSceneNode(nodePath);
      if (!nodeExist) return false;

      var nodeType = await asyncHandle(
        nodeExist,
        nodeExist.getNodeType,
        AsyncFunImpl.Int
      );
      if (nodeType != Enums.sceneNodeType.SNODE_POI) return false;

      var poiExist = nodeExist.asPOI();
      poiExist.setAlwaysOnScreen(true);

      var poiText = await asyncHandle(
        poiExist,
        poiExist.getText,
        AsyncFunImpl.String
      );
      if (!!poiText) {
        poiExist.enableFontColorAni(true);
        poiExist.setFontColorAni(timeSec, fromClr.get(), toClr.get(), isLoop);
      }
      var poiIconPath = await asyncHandle(
        poiExist,
        poiExist.getIcon,
        AsyncFunImpl.String
      );
      if (!!poiIconPath) {
        poiExist.enableIconColorAni(true);
        poiExist.setIconColorAni(timeSec, fromClr.get(), toClr.get(), isLoop);
      }
      return true;
    },

    // @method clearPOIColorAni(nodePath: String): Boolean
    // 清除当前POI颜色闪烁效果
    clearPOIColorAni: async function(nodePath) {
      var nodeExist = await this.getSceneNode(nodePath);
      if (!nodeExist) return false;

      var nodeType = await asyncHandle(
        nodeExist,
        nodeExist.getNodeType,
        AsyncFunImpl.Int
      );
      if (nodeType != Enums.sceneNodeType.SNODE_POI) return false;

      var poiExist = nodeExist.asPOI();

      poiExist.setAlwaysOnScreen(false);
      var poiText = await asyncHandle(
        poiExist,
        poiExist.getText,
        AsyncFunImpl.String
      );
      if (!!poiText) {
        poiExist.enableFontColorAni(false);
      }
      var poiIconPath = await asyncHandle(
        poiExist,
        poiExist.getIcon,
        AsyncFunImpl.String
      );
      if (!!poiIconPath) {
        poiExist.enableIconColorAni(false);
      }
      return true;
    }
  });

  /* @namespace Map
   * @section Use Mesh Node
   */
  Map.include({
    // @method restoreModelMaterial(nodePath: String): Boolean
    // 恢复模型的材质
    restoreModelMaterial: async function(nodePath) {
      var _node = await this.getSceneNode(nodePath);
      if (!_node) return false;
      var _nodeType = await asyncHandle(
        _node,
        _node.getNodeType,
        AsyncFunImpl.Int
      );
      if (
        _nodeType != Enums.sceneNodeType.SNODE_Model &&
        _nodeType != Enums.sceneNodeType.SNODE_VecModel
      )
        return false;

      var _realNode = null;
      if (_nodeType == Enums.sceneNodeType.SNODE_Model)
        _realNode = _node.asModel();
      else _realNode = _node.asVecModel();
      //恢复节点材质
      _realNode.restoreAloneMaterials();
      _realNode.setVisible(true);
      return true;
    },

    // @method createSimpleMaterial(resourceName: String, options: Colour Material Options): QMaterial
    // 创建简单材质，通常用于需要改变颜色的场合，返回原生 QMaterial 对象
    createSimpleMaterial: async function(resourceName, options) {
      var defaultCreateOption = {
        DiffuseColor: toColourValue(0, 0, 0, 1), //ColourValue对象
        EmissiveColor: toColourValue(0, 0, 0, 1),
        SpecularColor: toColourValue(0, 0, 0, 1),
        Alpha: 1
      };
      jQueryExtend(true, defaultCreateOption, options);
      //创建新的材质
      var _rm = this.get().getResourceManager();
      var _mat = await asyncHandle(
        _rm,
        _rm.getResource,
        AsyncFunImpl.QResource,
        Enums.resourceType.MATERIAL,
        resourceName
      );
      if (_mat != null)
        //若材质存在直接返回
        return _mat;
      //创建新的材质
      _mat = await asyncHandle(
        _rm,
        _rm.registerResource,
        AsyncFunImpl.QResource,
        Enums.resourceType.MATERIAL,
        resourceName
      );
      _mat = _mat.asMaterial();
      _mat.createEmpty();
      _mat.setShadowFactor(1); //默认接受阴影
      _mat.setLightEnable(true); //默认接受光照
      _mat.setDiffuseColor(defaultCreateOption.DiffuseColor.get());
      _mat.setSpecularColor(defaultCreateOption.SpecularColor.get());
      _mat.setEmissiveColor(defaultCreateOption.EmissiveColor.get());

      if (defaultCreateOption.Alpha < 1.0) {
        _mat.setAlphaBlendEnable(1);
        _mat.setAlpha(defaultCreateOption.Alpha);
        _mat.setDepthWriteEnable(false); //关闭深度写
      }
      //_mat.saveData();
      return _mat;
    },

    // @method createModel(nodePath: String, meshName: String, options: Model Create Options): QModelNode
    // 在场景根节点下动态创建模型，Node路径"区域/[父节点]/要创建的模型名称"，返回原生 QModelNode 对象
    // 注意模型所用的 Mesh 资源最好预先打包到资源组文件中
    createModel: async function(nodePath, meshName, options) {
      var defaultCreateOption = {
        Position: null, //封装Vector3对象
        Orientation: null, //封装Vector3对象
        OrientationType: Enums.nodeOrientationType.Self,
        Scale: null, //封装Vector3对象
        SpecialTransparent: false,
        SkeletonAnimation: null, //骨骼动画名称
        OnLoaded: null //加载结束回调
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //创建模型节点
        var modelNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_Model
        );
        if (modelNodeCreated != null) {
          //节点创建成功
          var modelAppend = modelNodeCreated.asModel();
          modelAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );
          //以下设置参数
          modelAppend.setMesh(meshName);
          if (defaultCreateOption.Position != null) {
            modelAppend.setPosition(defaultCreateOption.Position.get());
          }
          if (defaultCreateOption.Orientation != null) {
            modelAppend.setOrientation(
              defaultCreateOption.Orientation.get(),
              defaultCreateOption.OrientationType
            );
          }
          if (defaultCreateOption.Scale != null) {
            modelAppend.setScale(defaultCreateOption.Scale.get());
          }
          if (defaultCreateOption.SkeletonAnimation != null)
            modelAppend.setSkeletonAnimation(
              defaultCreateOption.SkeletonAnimation
            );

          //如果有回调事件
          if (defaultCreateOption.OnLoaded) {
            modelNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnLoaded
            );
          }
          modelNodeCreated.trackAllResource();
          //返回对象
          return modelAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createModel: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method playOrStopModelSkeletonAnimation(nodePath: String, isPlay: Boolean, aniName?: String): Boolean
    // 播放模型骨骼动画效果，可随时替换成新动画文件,或传入空串取消骨骼动画
    playOrStopModelSkeletonAnimation: async function(nodePath, isPlay, aniName) {
      var _node = await this.getSceneNode(nodePath);
      if (_node == null) return false; //节点不存在退出

      var _nodeType = await asyncHandle(
        _node,
        _node.getNodeType,
        AsyncFunImpl.Int
      );
      if (_nodeType != Enums.sceneNodeType.SNODE_Model) return false; //不是模型节点退出

      var _model = _node.asModel();
      if (aniName !== undefined) {
        _model.setSkeletonAnimation(aniName);
        _model.loadAllResource();
      }
      var _aniState = await asyncHandle(
        _model,
        _model.getSkeletonAnimationState,
        AsyncFunImpl.QAnimationState
      );
      if (_aniState == null) return;
      if (isPlay) {
        _aniState.setLoop(true);
        _aniState.setAutoPlay(true);
        _aniState.play();
      } else {
        _aniState.stop();
      }
      return true;
    },

    // @method setModelHighlight(nodePath: String, highLightEnable: Boolean, hltClr?: ColourValue): Boolean
    // 设置或关闭指定模型颜色高亮效果（采用材质克隆方式）
    setModelHighlight: async function(
      nodePath,
      highLightEnable,
      hltClr = toColourValue(1, 0, 1, 1)
    ) {
      var _node = await this.getSceneNode(nodePath);
      if (!_node) return false;

      var _nodeType = await asyncHandle(
        _node,
        _node.getNodeType,
        AsyncFunImpl.Int
      );
      if (
        _nodeType != Enums.sceneNodeType.SNODE_Model &&
        _nodeType != Enums.sceneNodeType.SNODE_VecModel
      )
        return false;

      var _model =
        _nodeType == Enums.sceneNodeType.SNODE_Model
          ? _node.asModel()
          : _node.asVecModel();
      _model.makeAloneMaterialsEx(2);
      var matCnt = await asyncHandle(
        _model,
        _model.getMaterialCount,
        AsyncFunImpl.Int
      );
      for (var i = 0; i <= matCnt - 1; i++) {
        var mat = await asyncHandle(
          _model,
          _model.getMaterial,
          AsyncFunImpl.QMaterial,
          i
        );
        if (highLightEnable) {
          mat.setEmissiveColor(hltClr.get());
        } else {
          mat.setEmissiveColor(toColourValue(0, 0, 0, 0).get());
        }
      }
      if (!highLightEnable) {
        _model.restoreAloneMaterials();
      }
      return true;
    },

    // @method setModelColor(nodePath: String, newColor: ColourValue, colorEnable: Boolean): QSceneContentContainer
    // 设置或取消指定模型变色效果（采用容器方式实现，可对多个模型设置同一种颜色），不建议使用有可能会导致其他使用相同材质的模型也会变色
    setModelColor: async function(nodePath, newColor, colorEnable) {
      var ctnName = "model_color_" + newColor.toWebColor();
      var nc = await this.createCommonNodeContainer(ctnName);
      nc.setMaterialColor(newColor.get());
      if (colorEnable) {
        nc.addSceneNode(nodePath);
      } else {
        nc.removeSceneNode(nodePath);
      }
      return nc;
    },

    // @method clearModelColors(clrArr: Array): Boolean
    // 取消指定颜色数组对应的模型变色效果,清除容器对象
    clearModelColors: async function(clrArr) {
      if (!isArray(clrArr)) return false;
      for (let i = 0; i < clrArr.length; i++) {
        var ctnName = "model_color_" + clrArr[i].toWebColor();
        var nc = await this.createCommonNodeContainer(ctnName);
        if (nc) {
          nc.clear();
          await this.destroyContainer(ctnName);
        }
      }
      return true;
    },

    // @method setBatchModelMaterial(nodeNames: Array, mtrName: String): QSceneContentContainer
    // 批量修改替换模型的材质（采用容器方式实现），注意使用的材质要确保存在
    setBatchModelMaterial: async function(nodeNames, mtrName) {
      if (!isArray(nodeNames) || typeof nodeNames[0] !== "string")
        return null;
      var nc = await this.createCommonNodeContainer("model_with_" + mtrName);
      nc.setNodeReplaceMaterial(mtrName);
      for (var j = 0; j < nodeNames.length; j++) {
        nc.addSceneNode(nodeNames[j]);
      }
      return nc;
    },

    // @method clearBatchModelMaterial(mtrName: String): Boolean
    // 恢复被替换模型的材质,清除容器对象
    clearBatchModelMaterial: async function(mtrName) {
      var ctnName = "model_with_" + mtrName;
      var nc = await this.createCommonNodeContainer(ctnName);
      if (nc) {
        nc.clear();
        await this.destroyContainer(ctnName);
        return true;
      }
      return false;
    },

    // @method setBatchModelColorFlash(nodeNames: Array, newColor: ColourValue, isEmissiveColor: Boolean, speed: Number, flashTimes?: Number): QMovieClipInstance
    // 批量设置模型同时变色闪烁若干次（采用动画剪辑对象实现），如果是持续闪烁的清除需要调用 clearModelColorFlash
    setBatchModelColorFlash: async function(
      nodeNames,
      newColor,
      isEmissiveColor,
      speed,
      flashTimes = 0
    ) {
      if (!isArray(nodeNames) || typeof nodeNames[0] !== "string")
        return null;

      if (typeof this._clrFlashObjs === "undefined") this._clrFlashObjs = [];

      if (this._clrFlashObjs.length > 0) {
        for (let i = 0; i < this._clrFlashObjs.length; i++)
          await this.restoreModelMaterial(this._clrFlashObjs[i]);
        await this.clearMovieClipInstance("mci_colorflash");
        this._clrFlashObjs.length = 0;
      }

      var framesPerSec = 50;
      var mcObj = await this.createMovieClip("mc_colorflash", framesPerSec);
      var mciObj = await this.createMovieClipInstance("mci_colorflash", mcObj);

      for (var j = 0; j < nodeNames.length; j++) {
        var nodeExist = await this.getSceneNode(nodeNames[j]);
        if (!nodeExist) continue;

        this._clrFlashObjs.push(nodeNames[j]);
        await this.setMaterialColorFlashPlayer(
          mciObj,
          mcObj,
          nodeExist,
          newColor,
          speed,
          flashTimes > 0 ? flashTimes : 1,
          isEmissiveColor
        );
      }

      mciObj.setLoop(false);
      if (flashTimes <= 0) {
        //持续闪烁
        mciObj.setLoop(true);
      }
      mciObj.play();
      return mciObj;
    },

    // @method clearBatchModelColorFlash(nodeNames?: Array): Boolean
    // 清除模型颜色闪烁，如果没有给定参数，将清除所有模型的颜色闪烁
    clearBatchModelColorFlash: async function(nodeNames) {
      if (
        typeof this._clrFlashObjs === "undefined" ||
        this._clrFlashObjs.length == 0
      )
        return true;

      if (typeof nodeNames == "undefined") {
        //清除所有模型颜色闪烁
        for (let i = 0; i < this._clrFlashObjs.length; i++)
          await this.restoreModelMaterial(this._clrFlashObjs[i]);
        await this.clearMovieClipInstance("mci_colorflash");
        delete this._clrFlashObjs;
      } else {
        if (!isArray(nodeNames) || typeof nodeNames[0] !== "string")
          return false;
        //清除指定模型颜色闪烁
        for (var j = 0; j < nodeNames.length; j++) {
          var currNodePath = nodeNames[j];
          for (var i = 0; i < this._clrFlashObjs.length; i++) {
            if (currNodePath === this._clrFlashObjs[i]) {
              await this.restoreModelMaterial(currNodePath);
              this._clrFlashObjs.splice(i, 1);
              break;
            }
          }
        }
        if (this._clrFlashObjs.length == 0)
          await this.clearMovieClipInstance("mci_colorflash");
      }
      return true;
    },

    // @method setBatchModelTransparentFlash(nodeNames: Array, speed: Number, flashTimes?: Number): QMovieClipInstance
    // 批量设置模型透明闪烁（采用动画剪辑对象实现），如果是持续闪烁的清除需要调用 clearModelTransparentFlash
    setBatchModelTransparentFlash: async function(
      nodeNames,
      speed,
      flashTimes = 0
    ) {
      if (!isArray(nodeNames) || typeof nodeNames[0] !== "string")
        return null;

      if (typeof this._transFlashObjs === "undefined") this._transFlashObjs = [];

      if (this._transFlashObjs.length > 0) {
        //xian
        for (let i = 0; i < this._transFlashObjs.length; i++)
          await this.restoreModelMaterial(this._transFlashObjs[i]);
        await this.clearMovieClipInstance("mci_transflash");
        this._transFlashObjs.length = 0;
      }

      var framesPerSec = 50;
      var mcObj = await this.createMovieClip("mc_transflash", framesPerSec);
      var mciObj = await this.createMovieClipInstance("mci_transflash", mcObj);

      for (var j = 0; j < nodeNames.length; j++) {
        var nodeExist = await this.getSceneNode(nodeNames[j]);
        if (!nodeExist) continue;

        this._transFlashObjs.push(nodeNames[j]);
        await this.setMaterialFadePlayer(
          mciObj,
          mcObj,
          nodeExist,
          Enums.fadeType.fadeFlash,
          speed,
          flashTimes > 0 ? flashTimes : 1
        );
      }

      mciObj.setLoop(false);
      if (flashTimes <= 0) {
        //持续闪烁
        mciObj.setLoop(true);
      }
      mciObj.play();
      return mciObj;
    },

    // @method clearBatchModelTransparentFlash(nodeNames?: Array): Boolean
    // 清除所有模型透明闪烁，如果没有给定参数，将清除所有模型的透明闪烁
    clearBatchModelTransparentFlash: async function(nodeNames) {
      if (
        typeof this._transFlashObjs === "undefined" ||
        this._transFlashObjs.length == 0
      )
        return true;

      if (typeof nodeNames == "undefined") {
        //清除所有模型颜色闪烁
        for (let i = 0; i < this._transFlashObjs.length; i++)
          await this.restoreModelMaterial(this._transFlashObjs[i]);
        await this.clearMovieClipInstance("mci_transflash");
        delete this._transFlashObjs;
      } else {
        if (!isArray(nodeNames) || typeof nodeNames[0] !== "string")
          return false;
        //清除指定模型颜色闪烁
        for (var j = 0; j < nodeNames.length; j++) {
          var currNodePath = nodeNames[j];
          for (var i = 0; i < this._transFlashObjs.length; i++) {
            if (currNodePath === this._transFlashObjs[i]) {
              await this.restoreModelMaterial(currNodePath);
              this._transFlashObjs.splice(i, 1);
              break;
            }
          }
        }
        if (this._transFlashObjs.length == 0)
          await this.clearMovieClipInstance("mci_transflash");
      }
      return true;
    },

    // @method setModelFadeOut(nodePath: String, speed: Number): QMovieClipInstance
    // 设置模型渐隐效果（采用动画剪辑对象实现）
    setModelFadeOut: async function(nodePath, speed) {
      var _node = await this.getSceneNode(nodePath);
      if (_node == null) return null;

      var _nodeType = await asyncHandle(
        _node,
        _node.getNodeType,
        AsyncFunImpl.Int
      );
      if (_nodeType == Enums.sceneNodeType.SNODE_Model)
        _node.asModel().setCastShadow(false);
      else _node.asVecModel().setCastShadow(false);

      var framesPerSec = 50;
      var mcObj = await this.createMovieClip(
        "mc_fadeout_" + nodePath,
        framesPerSec
      );
      var mciObj = await this.createMovieClipInstance(
        "mci_fadeout_" + nodePath,
        mcObj
      );
      await this.setMaterialFadePlayer(
        mciObj,
        mcObj,
        _node,
        Enums.fadeType.fadeOut,
        speed
      );
      await this.registerMovieClipInstanceFrameEvent(
        mciObj,
        framesPerSec * speed,
        function(data) {
          setTimeout(async () => {
            var mciName = data.name;
            var nodePath = mciName.substring(12);
            //(await sceneNode(nodePath).get()).setVisible(false);
            this.clearMovieClipInstance(mciName);
          }, 100);
        }
      );

      mciObj.setLoop(false);
      mciObj.play();
      return mciObj;
    },

    // @method setModelFadeIn(nodePath: String, speed: Number): QMovieClipInstance
    // 设置模型渐显效果（采用动画剪辑对象实现）
    setModelFadeIn: async function(nodePath, speed) {
      var _node = await this.getSceneNode(nodePath);
      if (_node == null) return null;

      //(await sceneNode(nodePath).get()).setVisible(true);

      var _nodeType = await asyncHandle(
        _node,
        _node.getNodeType,
        AsyncFunImpl.Int
      );
      if (_nodeType == Enums.sceneNodeType.SNODE_Model)
        _node.asModel().setCastShadow(true);
      else _node.asVecModel().setCastShadow(true);

      var framesPerSec = 50;
      var mcObj = await this.createMovieClip(
        "mc_fadein_" + nodePath,
        framesPerSec
      );
      var mciObj = await this.createMovieClipInstance(
        "mci_fadein_" + nodePath,
        mcObj
      );
      await this.setMaterialFadePlayer(
        mciObj,
        mcObj,
        _node,
        Enums.fadeType.fadeIn,
        speed
      );
      await this.registerMovieClipInstanceFrameEvent(
        mciObj,
        framesPerSec * speed,
        function(data) {
          setTimeout(() => {
            var mciName = data.name;
            this.clearMovieClipInstance(mciName);
          }, 100);
        }
      );

      mciObj.setLoop(false);
      mciObj.play();
      return mciObj;
    }
  });

  /* @namespace Map
   * @section Use Vector Node
   */
  Map.include({
    // @method rayCasting(polygon: Array, p: Vector3): String
    // 射线法判断点q与多边形polygon的位置关系，要求polygon为简单多边形
    // 返回：'on'表示在多边形上；'in'表示在多边形内；'out'表示在多边形外
    rayCasting: function(poly, p) {
      //检查参数
      if (!isArray(poly) || poly.length < 3) return null;
      var px = p.x,
        py = p.z,
        flag = false;

      for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
        var sx = poly[i].x,
          sy = poly[i].z,
          tx = poly[j].x,
          ty = poly[j].z;

        // 点与多边形顶点重合
        if ((sx === px && sy === py) || (tx === px && ty === py)) {
          return "on";
        }

        // 判断线段两端点是否在射线两侧
        if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
          // 线段上与射线 Y 坐标相同的点的 X 坐标
          var x = sx + ((py - sy) * (tx - sx)) / (ty - sy);

          // 点在多边形的边上
          if (x === px) {
            return "on";
          }

          // 射线穿过多边形的边界
          if (x > px) {
            flag = !flag;
          }
        }
      }

      // 射线穿过多边形边界的次数为奇数时点在多边形内
      return flag ? "in" : "out";
    },

    // @method windingNumber(polygon: Array, p: Vector3): String
    // 回转数法判断点是否在多边形内部
    // 返回：'on'表示在多边形上；'in'表示在多边形内；'out'表示在多边形外
    windingNumber: function(poly, p) {
      //检查参数
      if (!isArray(poly) || poly.length < 3) return null;
      var px = p.x,
        py = p.z,
        sum = 0;

      for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
        var sx = poly[i].x,
          sy = poly[i].z,
          tx = poly[j].x,
          ty = poly[j].z;

        // 点与多边形顶点重合或在多边形的边上
        if (
          (sx - px) * (px - tx) >= 0 &&
          (sy - py) * (py - ty) >= 0 &&
          (px - sx) * (ty - sy) === (py - sy) * (tx - sx)
        ) {
          return "on";
        }

        // 点与相邻顶点连线的夹角
        var angle = Math.atan2(sy - py, sx - px) - Math.atan2(ty - py, tx - px);

        // 确保夹角不超出取值范围（-π 到 π）
        if (angle >= Math.PI) {
          angle = angle - Math.PI * 2;
        } else if (angle <= -Math.PI) {
          angle = angle + Math.PI * 2;
        }

        sum += angle;
      }

      // 计算回转数并判断点和多边形的几何关系
      return Math.round(sum / Math.PI) === 0 ? "out" : "in";
    },

    //创建_guid值串
    _guid: function() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return (
        S4() +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        S4() +
        S4()
      );
    },

    // @method createPolyline(nodePath: String, options: Polyline Options): QLineNode
    // 在场景根节点下动态创建折线段，Node路径"区域/[父节点]/要创建的折线名称"，返回原生 QLineNode 对象
    createPolyline: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null,
        SpecialTransparent: false, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        LinePoints: [],
        LineOptions: {
          LineType: Enums.lineType.StraightLine,
          BesselDim: 2, //贝塞尔曲线阶数
          Subdivision: 20, //设置生成曲线细分程度，用于贝塞尔曲线
          LineWidth: 2,
          WrapLen: 2, //特殊材质有效
          //以下用于动态创建的材质
          Color: toColourValue("#0000FF", 1), //线的颜色
          Alpha: 1 //线的透明度
        },
        OnLineCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //检查参数
        if (defaultCreateOption.LinePoints.length < 1) return null;
        for (var i = 0; i < defaultCreateOption.LinePoints.length; i++) {
          if (defaultCreateOption.LinePoints[i].length < 2) return null;
        }
        var nodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_Line
        );
        if (nodeCreated != null) {
          //节点创建成功
          var polylineAppend = nodeCreated.asLine();
          polylineAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );

          //如果提供了材质名称
          if (defaultCreateOption.Material != null) {
            polylineAppend.setMaterial(defaultCreateOption.Material);
          } else {
            var tempMatName = "defaultMaterialForLine-" + this._guid(); //随机材质名称
            var material = await this.createSimpleMaterial(tempMatName, {
              Alpha: defaultCreateOption.LineOptions.Alpha,
              EmissiveColor: defaultCreateOption.LineOptions.Color
            });
            polylineAppend.setMaterial(tempMatName);
          }
          var Lines = [];
          //总是把第一个点作为setPosition位置点，其他点都计算同第一个点的相对坐标
          var startPt = null;
          for (var i = 0; i < defaultCreateOption.LinePoints.length; i++) {
            var Line = await asyncHandle(
              polylineAppend,
              polylineAppend.addLine,
              AsyncFunImpl.QLine
            );
            Line.setLineType(defaultCreateOption.LineOptions.LineType);
            if (
              defaultCreateOption.LineOptions.LineType == Enums.lineType.Bessel
            ) {
              Line.setBesselDim(defaultCreateOption.LineOptions.BesselDim);
              Line.setSubdivision(defaultCreateOption.LineOptions.Subdivision);
            }
            Line.setLineWidth(defaultCreateOption.LineOptions.LineWidth);
            Line.setWrapLen(defaultCreateOption.LineOptions.WrapLen);
            var currentLinePoints = defaultCreateOption.LinePoints[i];
            for (var j = 0; j < currentLinePoints.length; j++) {
              var currPt = null;
              if (typeof currentLinePoints[j] == "string") {
                currPt = currentLinePoints[j].toVector3();
              } else {
                currPt = currentLinePoints[j];
              }
              if (i == 0 && j == 0) {
                startPt = currPt.clone();
              }
              Line.addPoint(currPt.subtract(startPt).get());
            }
            Lines.push(Line);
          }
          if (startPt != null) {
            polylineAppend.setPosition(startPt.get());
            polylineAppend.centralize();
          }

          if (defaultCreateOption.OnLineCreated) {
            nodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnLineCreated
            );
          }
          nodeCreated.trackAllResource();
          return polylineAppend;
        } else {
          return null;
        }
      } catch (e) {
        this.showNotice("错误", "createPolyline: " + e.message);
        return null;
      }
      return null;
    },

    // @method createPolygon(nodePath: String, options: Polygon Options): QVecModelNode
    // 在场景根节点下动态创建多边形，Node路径"区域/[父节点]/要创建的多边形名称"，返回原生 QVecModelNode 对象
    createPolygon: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null,
        SpecialTransparent: false, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        Points: [], //注意要剔除收尾相等的点
        Color: toColourValue("#0000FF", 1),
        Alpha: 1, //填充透明度
        Direction: 1, //默认逆时针方向
        OnPolygonCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //检查参数
        if (defaultCreateOption.Points.length < 3) return null;

        var vecNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_VecModel
        );
        if (vecNodeCreated != null) {
          //节点创建成功
          var vecNodeAppend = vecNodeCreated.asVecModel();
          var _vecPolygon = await asyncHandle(
            vecNodeAppend,
            vecNodeAppend.createVecModel,
            AsyncFunImpl.QVecModel,
            Enums.vecModelType.QPolygon
          );
          var vecPolygon = await asyncHandle(
            _vecPolygon,
            _vecPolygon.asPolygon,
            AsyncFunImpl.QPolygon
          );
          vecNodeAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );
          var startPt = null;
          //剔除收尾相同点
          var ptCnt = defaultCreateOption.Points.length;
          // if (defaultCreateOption.Points[0].equals(defaultCreateOption.Points[ptCnt-1]))
          //     ptCnt--;
          for (var i = 0; i < ptCnt; i++) {
            var currPt = null;
            if (typeof defaultCreateOption.Points[i] == "string") {
              currPt = defaultCreateOption.Points[i].toVector3();
            } else {
              currPt = defaultCreateOption.Points[i];
            }
            if (i == 0) {
              startPt = currPt.clone();
            } else if (i == ptCnt - 1) {
              if (startPt.equals(currPt))
                //剔除收尾相同点
                continue;
            }
            vecPolygon.addPoint(currPt.subtract(startPt).get());
          }
          if (startPt != null) vecNodeAppend.setPosition(startPt.get());
          vecPolygon.setDirection(defaultCreateOption.Direction); //设置为逆时针
          vecNodeAppend.resetCenter();

          //如果提供了材质名称
          if (defaultCreateOption.Material != null) {
            vecNodeAppend.setMaterial(0, defaultCreateOption.Material);
          } else {
            var tempMatName = "defaultMaterialForPolygon-" + this._guid(); //随机材质名称
            var material = await this.createSimpleMaterial(tempMatName, {
              Alpha: defaultCreateOption.Alpha,
              EmissiveColor: defaultCreateOption.Color
            });
            vecNodeAppend.setMaterial(0, tempMatName);
          }

          if (defaultCreateOption.OnPolygonCreated) {
            vecNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnPolygonCreated
            );
          }
          vecNodeCreated.trackAllResource();
          return vecNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createPolygon: " + e.message);
        return null;
      }
      return null;
    },

    // @method createPrism(nodePath: String, options: Prism Options): QVecModelNode
    // 在场景根节点下动态创建创建棱柱对象，Node路径"区域/[父节点]/要创建的棱柱名称"，返回原生 QVecModelNode 对象
    createPrism: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null, //设置棱柱的三个通用材质：0 底面 1 立面 2 顶面，如果只有一个设置成相同的数值
        SpecialTransparent: false, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        Color: toColourValue("#0000FF", 1), //颜色材质使用的颜色
        Alpha: 1, //颜色材质使用的透明度
        Points: [], //底面坐标数组，底面中心自动计算
        Anchor: null, //顶面中心坐标 Vector3，非垂直情况下可设置
        IgnoreFloor: true,
        Height: 5,
        OnPrismCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //检查参数
        if (defaultCreateOption.Points.length < 3) return null;
        var vecNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_VecModel
        );
        if (vecNodeCreated != null) {
          //节点创建成功
          var vecNodeAppend = vecNodeCreated.asVecModel();
          var _vecPrism = await asyncHandle(
            vecNodeAppend,
            vecNodeAppend.createVecModel,
            AsyncFunImpl.QVecModel,
            Enums.vecModelType.QPrism
          );
          var vecPrism = await asyncHandle(
            _vecPrism,
            _vecPrism.asPrism,
            AsyncFunImpl.QPrism
          );
          vecNodeAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );
          var startPt = null;
          for (var i = 0; i < defaultCreateOption.Points.length; i++) {
            var currPt = null;
            if (typeof defaultCreateOption.Points[i] == "string") {
              currPt = defaultCreateOption.Points[i].toVector3();
            } else {
              currPt = defaultCreateOption.Points[i];
            }
            if (i == 0) {
              startPt = currPt.clone();
            }
            vecPrism.addPoint(currPt.subtract(startPt).get());
          }
          if (startPt != null) vecNodeAppend.setPosition(startPt.get());
          vecNodeAppend.resetCenter();
          //如果定义了Anchor
          if (defaultCreateOption.Anchor) {
            vecPrism.setAnchor(defaultCreateOption.Anchor.get());
          } else {
            vecPrism.keepVertical();
            vecPrism.setHeight(defaultCreateOption.Height);
          }
          vecPrism.ignoreFloor(defaultCreateOption.IgnoreFloor);
          //如果提供了材质名称
          if (defaultCreateOption.Material != null) {
            if (isArray(defaultCreateOption.Material)) {
              for (var i = 0; i < defaultCreateOption.Material.length; i++) {
                vecNodeAppend.setMaterial(i, defaultCreateOption.Material[i]);
                if (i == 2) break;
              }
            } else {
              vecNodeAppend.setMaterial(0, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(1, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(2, defaultCreateOption.Material);
            }
          } else {
            var tempMatName = "defaultMaterialForPrism-" + this._guid(); //随机材质名称
            var material = await this.createSimpleMaterial(tempMatName, {
              Alpha: defaultCreateOption.Alpha,
              EmissiveColor: defaultCreateOption.Color
            });
            vecNodeAppend.setMaterial(0, tempMatName);
            vecNodeAppend.setMaterial(1, tempMatName);
            vecNodeAppend.setMaterial(2, tempMatName);
          }

          if (defaultCreateOption.OnPrismCreated) {
            vecNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnPrismCreated
            );
          }
          vecNodeCreated.trackAllResource();
          return vecNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createPrism: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createPipe(nodePath: String, options: Pipe Options): QVecModelNode
    // 在场景根节点下动态创建管道对象，Node路径"区域/[父节点]/要创建的管道名称"，返回原生 QVecModelNode 对象
    createPipe: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null, //设置管道前、后、内、外四个材质，如果只有一个设置成相同的数值
        SpecialTransparent: false, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        Color: toColourValue("#0000FF", 1), //颜色材质使用的颜色
        Alpha: 1, //颜色材质使用的透明度
        Points: [],
        Radius: [], //设置管道内径和外径，如果只有一个值，设为外径，如果有两个值，小的为内径，大的为外径
        CrossPieces: 24, //设置生成管道圆面的面个数
        OnPipeCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //检查参数
        if (
          defaultCreateOption.Points.length < 2 ||
          defaultCreateOption.Radius.length == 0 ||
          defaultCreateOption.Radius.length > 2
        )
          return null;
        var vecNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_VecModel
        );
        if (vecNodeCreated != null) {
          //节点创建成功
          var vecNodeAppend = vecNodeCreated.asVecModel();
          var _vecPipe = await asyncHandle(
            vecNodeAppend,
            vecNodeAppend.createVecModel,
            AsyncFunImpl.QVecModel,
            Enums.vecModelType.QPipe
          );
          var vecPipe = await asyncHandle(
            _vecPipe,
            _vecPipe.asPipe,
            AsyncFunImpl.QPipe
          );
          vecNodeAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );
          var startPt = null;
          for (var i = 0; i < defaultCreateOption.Points.length; i++) {
            var currPt = null;
            if (typeof defaultCreateOption.Points[i] == "string") {
              currPt = defaultCreateOption.Points[i].toArcVertex();
            } else {
              currPt = defaultCreateOption.Points[i];
            }
            if (i == 0) {
              startPt = currPt.clone();
            }
            vecPipe.addPoint(currPt.subtract(startPt).get());
          }
          if (startPt != null) vecNodeAppend.setPosition(startPt.get().pos);
          vecNodeAppend.resetCenter();

          if (defaultCreateOption.Radius.length == 1) {
            vecPipe.setRadiusInner(0);
            vecPipe.setRadiusOuter(defaultCreateOption.Radius[0]);
          } else {
            vecPipe.setRadiusInner(
              Math.min(
                +defaultCreateOption.Radius[0],
                +defaultCreateOption.Radius[1]
              )
            );
            vecPipe.setRadiusOuter(
              Math.max(
                +defaultCreateOption.Radius[0],
                +defaultCreateOption.Radius[1]
              )
            );
          }
          vecPipe.setCrossPieces(defaultCreateOption.CrossPieces);

          //如果提供了材质名称
          if (defaultCreateOption.Material != null) {
            if (isArray(defaultCreateOption.Material)) {
              for (var i = 0; i < defaultCreateOption.Material.length; i++) {
                vecNodeAppend.setMaterial(i, defaultCreateOption.Material[i]);
                if (i == 3) break;
              }
            } else {
              vecNodeAppend.setMaterial(0, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(1, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(2, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(3, defaultCreateOption.Material);
            }
          } else {
            var tempMatName = "defaultMaterialForPipe-" + this._guid(); //随机材质名称
            var material = await this.createSimpleMaterial(tempMatName, {
              Alpha: defaultCreateOption.Alpha,
              EmissiveColor: defaultCreateOption.Color
            });

            vecNodeAppend.setMaterial(0, tempMatName);
            vecNodeAppend.setMaterial(1, tempMatName);
            vecNodeAppend.setMaterial(2, tempMatName);
            vecNodeAppend.setMaterial(3, tempMatName);
          }

          if (defaultCreateOption.OnPipeCreated) {
            vecNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnPipeCreated
            );
          }
          vecNodeCreated.trackAllResource();
          return vecNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createPipe: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createWalls(nodePath: String, options: Walls Options): QVecModelNode
    // 在场景根节点下动态创建墙体对象，Node路径"区域/[父节点]/要创建的墙体名称"，返回原生 QVecModelNode 对象
    createWalls: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null, //设置墙体的5个通用材质：0 底面 1 顶面 2 左面 3 右面 4 断面，如果只有一个设置成相同的数值；如果多给的材质，可通过addMaterial添加
        SpecialTransparent: false, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        Color: toColourValue("#0000FF", 1), //颜色材质使用的颜色
        Alpha: 1, //颜色材质使用的透明度
        IgnoreFloor: false,
        IgnoreCeil: false,
        Height: 5, //默认高度
        Width: 2, //默认宽度
        //每段wall都可以有自己的宽高和材质
        Corners: [], //所有坐标点Vector3坐标数组
        IsClosed: false, //是否闭合标志
        SizeOfWalls: [], //每段wall的自己宽高，如{wallID:1,width:1.0, height:2.5}，其中wallID为起始坐标点在坐标数组的序号
        MatOfWalls: [], //每段wall的自己材质，如{wallID:1,data:[{compID:1, mtrID:2},{compID:2, mtrID:2}]}
        OnWallsCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //检查参数
        if (defaultCreateOption.Corners.length < 2) return null;
        var vecNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_VecModel
        );
        if (vecNodeCreated != null) {
          //节点创建成功
          var vecNodeAppend = vecNodeCreated.asVecModel();
          var _vecWalls = await asyncHandle(
            vecNodeAppend,
            vecNodeAppend.createVecModel,
            AsyncFunImpl.QVecModel,
            Enums.vecModelType.QWalls
          );
          var vecWalls = await asyncHandle(
            _vecWalls,
            _vecWalls.asWalls,
            AsyncFunImpl.QWalls
          );
          vecNodeAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );
          vecWalls.setDefaultSize(
            defaultCreateOption.Width,
            defaultCreateOption.Height
          );
          vecWalls.ignoreCeil(defaultCreateOption.IgnoreCeil);
          vecWalls.ignoreFloor(defaultCreateOption.IgnoreFloor);

          //管理材质
          if (defaultCreateOption.Material != null) {
            if (isArray(defaultCreateOption.Material)) {
              for (var i = 0; i <= defaultCreateOption.Material.length; i++) {
                /*
                              if (i <= 4)
                                  vecNodeAppend.setMaterial(i, defaultCreateOption.Material[i]);
                              else
                                  vecNodeAppend.addMaterial(defaultCreateOption.Material[i]);
                                  */
                vecNodeAppend.setMaterial(i, defaultCreateOption.Material[i]);
                if (i == 4) break;
              }
            } else {
              vecNodeAppend.setMaterial(0, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(1, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(2, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(3, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(4, defaultCreateOption.Material);
            }
          } else {
            var tempMatName = "defaultMaterialForWalls-" + this._guid(); //随机材质名称
            var material = await this.createSimpleMaterial(tempMatName, {
              Alpha: defaultCreateOption.Alpha,
              EmissiveColor: defaultCreateOption.Color
            });
            vecNodeAppend.setMaterial(0, tempMatName);
            vecNodeAppend.setMaterial(1, tempMatName);
            vecNodeAppend.setMaterial(2, tempMatName);
            vecNodeAppend.setMaterial(3, tempMatName);
            vecNodeAppend.setMaterial(4, tempMatName);
          }

          //根据坐标构建墙体：注意闭合标志的影响
          var startPt = null;
          for (var i = 0; i < defaultCreateOption.Corners.length; i++) {
            var currPt = null;
            if (typeof defaultCreateOption.Corners[i] == "string") {
              currPt = defaultCreateOption.Corners[i].toVector3();
            } else {
              currPt = defaultCreateOption.Corners[i];
            }
            if (i == 0) {
              startPt = currPt.clone();
            }
            await asyncHandle(
              vecWalls,
              vecWalls.addCorner,
              AsyncFunImpl.Boolean,
              i,
              currPt.subtract(startPt).get()
            );
            if (i > 0) {
              await asyncHandle(
                vecWalls,
                vecWalls.constructWall,
                AsyncFunImpl.Boolean,
                i - 1,
                i - 1,
                i
              );
            }
          }
          if (defaultCreateOption.IsClosed) {
            await asyncHandle(
              vecWalls,
              vecWalls.constructWall,
              AsyncFunImpl.Boolean,
              defaultCreateOption.Corners.length - 1,
              defaultCreateOption.Corners.length - 1,
              0
            );
          }
          if (startPt != null) vecNodeAppend.setPosition(startPt.get());
          vecNodeAppend.resetCenter();

          //如果需要单独设置墙体的尺寸和材质
          if (defaultCreateOption.SizeOfWalls.length > 0) {
            for (var j = 0; j < defaultCreateOption.SizeOfWalls.length; j++) {
              var wall = defaultCreateOption.SizeOfWalls[j];
              vecWalls.setWallSize(wall.wallID, wall.width, wall.height);
            }
          }
          if (defaultCreateOption.MatOfWalls.length > 0) {
            for (var j = 0; j < defaultCreateOption.MatOfWalls.length; j++) {
              var mat = defaultCreateOption.MatOfWalls[j];
              var wallID = mat.wallID;
              var data = mat.data;
              for (var k = 0; k < data.length; k++) {
                vecWalls.setWallMaterial(wallID, data[k].compID, data[k].mtrID);
              }
            }
          }

          if (defaultCreateOption.OnWallsCreated) {
            vecNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnWallsCreated
            );
          }
          vecNodeCreated.trackAllResource();
          return vecNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createWalls: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createCylinder(nodePath: String, options: Cylinder Options): QVecModelNode
    // 在场景根节点下动态创建圆柱对象，Node路径"区域/[父节点]/要创建的圆柱名称"，返回原生 QVecModelNode 对象
    createCylinder: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null, //设置圆柱底面、立面、顶面三个材质，如果只有一个设置成相同的数值
        SpecialTransparent: false, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        Color: toColourValue("#0000FF", 1), //颜色材质使用的颜色
        Alpha: 1, //颜色材质使用的透明度
        Center: null, //底面中心坐标 Vector3
        Anchor: null, //顶面中心坐标 Vector3，非垂直情况下可设置
        Radius: 10, //半径
        Height: 50, //高度
        Pieces: 36, //设置生成圆面的面个数
        OnCylinderCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        var vecNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_VecModel
        );
        if (vecNodeCreated != null) {
          //节点创建成功
          var vecNodeAppend = vecNodeCreated.asVecModel();
          var _vecCylinder = await asyncHandle(
            vecNodeAppend,
            vecNodeAppend.createVecModel,
            AsyncFunImpl.QVecModel,
            Enums.vecModelType.QCylinder
          );
          var vecCylinder = await asyncHandle(
            _vecCylinder,
            _vecCylinder.asCylinder,
            AsyncFunImpl.QCylinder
          );
          vecNodeAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );

          if (defaultCreateOption.Center) {
            vecNodeCreated.setPosition(defaultCreateOption.Center.get());
          }
          //如果定义了Anchor
          if (defaultCreateOption.Anchor) {
            vecCylinder.setAnchor(defaultCreateOption.Anchor.get());
          } else {
            vecCylinder.keepVertical();
            vecCylinder.setHeight(defaultCreateOption.Height);
          }
          vecCylinder.setRadius(defaultCreateOption.Radius);
          vecCylinder.setPieces(defaultCreateOption.Pieces);

          //如果提供了材质名称
          if (defaultCreateOption.Material != null) {
            if (isArray(defaultCreateOption.Material)) {
              for (var i = 0; i < defaultCreateOption.Material.length; i++) {
                vecNodeAppend.setMaterial(i, defaultCreateOption.Material[i]);
                if (i == 2) break;
              }
            } else {
              vecNodeAppend.setMaterial(0, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(1, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(2, defaultCreateOption.Material);
            }
          } else {
            var tempMatName = "defaultMaterialForCylinder-" + this._guid(); //随机材质名称
            var material = await this.createSimpleMaterial(tempMatName, {
              Alpha: defaultCreateOption.Alpha,
              EmissiveColor: defaultCreateOption.Color
            });
            vecNodeAppend.setMaterial(0, tempMatName);
            vecNodeAppend.setMaterial(1, tempMatName);
            vecNodeAppend.setMaterial(2, tempMatName);
          }

          if (defaultCreateOption.OnCylinderCreated) {
            vecNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnCylinderCreated
            );
          }
          vecNodeCreated.trackAllResource();
          return vecNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createCylinder: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createSphere(nodePath: String, options: Sphere Options): QVecModelNode
    // 动态创建球对象，Node路径"区域/[父节点]/要创建的球名称"，返回原生 QVecModelNode 对象
    createSphere: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null, //设置球面材质
        SpecialTransparent: false, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        Color: toColourValue("#0000FF", 1), //颜色材质使用的颜色
        Alpha: 1, //颜色材质使用的透明度
        Center: null, //球心坐标，Vector3，(约定：节点与球心重合)
        Radius: 10, //半径
        OnSphereCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        var vecNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_VecModel
        );
        if (vecNodeCreated != null) {
          //节点创建成功
          var vecNodeAppend = vecNodeCreated.asVecModel();
          var _vecSphere = await asyncHandle(
            vecNodeAppend,
            vecNodeAppend.createVecModel,
            AsyncFunImpl.QVecModel,
            Enums.vecModelType.QSphere
          );
          var vecSphere = await asyncHandle(
            _vecSphere,
            _vecSphere.asSphere,
            AsyncFunImpl.QSphere
          );

          vecNodeAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );
          if (defaultCreateOption.Center != null) {
            vecNodeCreated.setPosition(defaultCreateOption.Center.get());
          }
          vecSphere.setRadius(defaultCreateOption.Radius);
          //如果提供了材质名称
          if (defaultCreateOption.Material != null) {
            vecNodeAppend.setMaterial(0, defaultCreateOption.Material);
          } else {
            var tempMatName = "defaultMaterialForSphere-" + this._guid(); //随机材质名称
            var material = await this.createSimpleMaterial(tempMatName, {
              Alpha: defaultCreateOption.Alpha,
              EmissiveColor: defaultCreateOption.Color
            });
            vecNodeAppend.setMaterial(0, tempMatName);
          }

          if (defaultCreateOption.OnSphereCreated) {
            vecNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnSphereCreated
            );
          }
          vecNodeCreated.trackAllResource();
          return vecNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createSphere: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createCone(nodePath: String, options: Cone Options): QVecModelNode
    // 在场景根节点下动态创建圆锥对象，Node路径"区域/[父节点]/要创建的圆锥名称"，返回原生 QVecModelNode 对象
    createCone: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null, //设置圆锥底面、立面二个材质，如果只有一个设置成相同的数值
        SpecialTransparent: false, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        Color: toColourValue("#0000FF", 1), //颜色材质使用的颜色
        Alpha: 1, //颜色材质使用的透明度
        Center: null, //底面中心坐标 Vector3
        Anchor: null, //顶面中心坐标 Vector3，非垂直情况下可设置
        Radius: 10, //半径
        Height: 50, //高度
        Pieces: 36, //设置生成圆面的面个数
        OnConeCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        var vecNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_VecModel
        );
        if (vecNodeCreated != null) {
          //节点创建成功
          var vecNodeAppend = vecNodeCreated.asVecModel();
          var _vecCone = await asyncHandle(
            vecNodeAppend,
            vecNodeAppend.createVecModel,
            AsyncFunImpl.QVecModel,
            Enums.vecModelType.QCone
          );
          var vecCone = await asyncHandle(
            _vecCone,
            _vecCone.asCone,
            AsyncFunImpl.QCone
          );
          vecNodeAppend.setSpecialTransparent(
            defaultCreateOption.SpecialTransparent
          );

          if (defaultCreateOption.Center) {
            vecNodeCreated.setPosition(defaultCreateOption.Center.get());
          }

          //如果定义了Anchor
          if (defaultCreateOption.Anchor) {
            vecCone.setAnchor(defaultCreateOption.Anchor.get());
          } else {
            vecCone.keepVertical();
            vecCone.setHeight(defaultCreateOption.Height);
          }
          vecCone.setRadius(defaultCreateOption.Radius);
          vecCone.setPieces(defaultCreateOption.Pieces);

          //如果提供了材质名称
          if (defaultCreateOption.Material != null) {
            if (isArray(defaultCreateOption.Material)) {
              for (var i = 0; i < defaultCreateOption.Material.length; i++) {
                vecNodeAppend.setMaterial(i, defaultCreateOption.Material[i]);
                if (i == 1) break;
              }
            } else {
              vecNodeAppend.setMaterial(0, defaultCreateOption.Material);
              vecNodeAppend.setMaterial(1, defaultCreateOption.Material);
            }
          } else {
            var tempMatName = "defaultMaterialForCone-" + this._guid(); //随机材质名称
            var material = this.createSimpleMaterial(tempMatName, {
              Alpha: defaultCreateOption.Alpha,
              EmissiveColor: defaultCreateOption.Color
            });
            vecNodeAppend.setMaterial(0, tempMatName);
            vecNodeAppend.setMaterial(1, tempMatName);
          }

          if (defaultCreateOption.OnConeCreated) {
            vecNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnConeCreated
            );
          }
          vecNodeCreated.trackAllResource();
          return vecNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createCone: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createParticle(nodePath: String, options: Particle Options): QParticleNode
    // 从文件添加粒子效果，Node路径"区域/[父节点]/要创建的粒子名称"，返回原生 QParticleNode 对象
    createParticle: async function(nodePath, options) {
      var defaultCreateOption = {
        Position: null, //粒子节点的位置 Vector3
        Orientation: null,
        OrientationType: Enums.nodeOrientationType.Self,
        ParticleFile: null, //粒子文件路径，如Particle/fire.par
        OnParticleCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);

      try {
        var particleNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_ParticleSystem
        );
        if (particleNodeCreated != null) {
          //节点创建成功
          var particleAppend = particleNodeCreated.asParticle();
          particleAppend.loadParticleSystem(defaultCreateOption.ParticleFile);

          if (defaultCreateOption.Position != null) {
            particleAppend.setPosition(defaultCreateOption.Position.get());
          }

          if (defaultCreateOption.Orientation != null) {
            particleAppend.setOrientation(
              defaultCreateOption.Orientation.get(),
              defaultCreateOption.OrientationType
            );
          }

          if (defaultCreateOption.OnParticleCreated) {
            particleNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnParticleCreated
            );
          }
          particleNodeCreated.trackAllResource();

          return particleAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createParticle: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createBillboard(nodePath: String, options: Billboard Options): QBillboardNode
    // 添加公告板，Node路径"区域/[父节点]/要创建的公告版名称"，返回原生 QBillboardNode 对象
    createBillboard: async function(nodePath, options) {
      var defaultCreateOption = {
        Position: null, //公告版节点的位置 Vector3
        Orientation: null,
        OrientationType: Enums.nodeOrientationType.Self,
        Size: null,
        Material: null,
        Type: Enums.billboardType.Oriented_Common,
        CommonDirection: null,
        OnBillboardCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);

      try {
        var billboardNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_Billboard
        );
        if (billboardNodeCreated != null) {
          //节点创建成功
          var billboardAppend = billboardNodeCreated.asBillboard();
          billboardAppend.setBillboardType(defaultCreateOption.Type);

          if (defaultCreateOption.Position != null) {
            billboardAppend.setPosition(defaultCreateOption.Position.get());
          }

          if (defaultCreateOption.Orientation != null) {
            billboardAppend.setOrientation(
              defaultCreateOption.Orientation.get(),
              defaultCreateOption.OrientationType
            );
          }

          if (defaultCreateOption.Size != null) {
            billboardAppend.setBillboardSize(defaultCreateOption.Size.get());
          }

          if (defaultCreateOption.Material != null) {
            billboardAppend.setMaterial(defaultCreateOption.Material);
          }

          if (defaultCreateOption.CommonDirection != null) {
            billboardAppend.setCommonDirection(
              defaultCreateOption.CommonDirection.get()
            );
          }

          if (defaultCreateOption.OnBillboardCreated) {
            billboardNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnBillboardCreated
            );
          }
          billboardNodeCreated.trackAllResource();
          return billboardAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createBillboard: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createDecal(nodePath: String, options: PolygonDecal Options): QDecalNode
    // 在场景根节点下动态创建多边形贴花节点，Node路径"区域/[父节点]/要创建的贴花名称"，返回原生 QDecalNode 对象
    createDecal: async function(nodePath, options) {
      var defaultCreateOption = {
        Points: [], //Vector3坐标数组
        Resolution: 1.0, //像素分辨率，单位米/像素
        MaxHeight: 100, //多边形区域内最大高度值
        BackColor: null, //背景填充色，默认为null
        FillColor: toColourValue("#0000FF", 0.6), //多边形填充颜色和透明值
        LineColor: toColourValue("#0000FF", 1.0), //多边形边框颜色和透明值
        LineWidth: 1, //多边形轮廓线宽
        FillMode: Enums.decalTexFillMode.FillAndFrame, //填充方式
        OnDecalCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //检查参数
        if (defaultCreateOption.Points.length < 3) return null;

        var _pts = defaultCreateOption.Points.slice();
        var _minX = _pts[0].x,
          _maxX = _pts[0].x,
          _minY = _pts[0].z,
          _maxY = _pts[0].z;
        for (var i = 1; i < _pts.length; i++) {
          _minX = Math.min(_minX, _pts[i].x);
          _minY = Math.min(_minY, _pts[i].z);
          _maxX = Math.max(_maxX, _pts[i].x);
          _maxY = Math.max(_maxY, _pts[i].z);
        }
        var _sizeX = _maxX - _minX,
          _sizeY = _maxY - _minY;
        var _pos = toVector3(
          (_maxX + _minX) / 2,
          defaultCreateOption.MaxHeight,
          (_maxY + _minY) / 2
        );
        var _wm = this.get().getWorldManager();
        var _v3list = await asyncHandle(
          _wm,
          _wm.createEmptyQVector3List,
          AsyncFunImpl.QVector3List
        );
        for (var i = 0; i < _pts.length; i++) {
          _v3list.add(
            toVector3(
              (_pts[i].x - _minX) / defaultCreateOption.Resolution,
              (_pts[i].z - _minY) / defaultCreateOption.Resolution,
              0
            ).get()
          );
        }
        //创建纹理
        var _imageX = _sizeX / defaultCreateOption.Resolution,
          _imageY = _sizeY / defaultCreateOption.Resolution;
        var _rm = this.get().getResourceManager();
        var _resourceName = "DecalTexture-" + this._guid();
        var _res = await asyncHandle(
          _rm,
          _rm.registerResource,
          AsyncFunImpl.QResource,
          Enums.resourceType.TEXTURE,
          _resourceName
        );
        var _tex = _res.asTexture();
        var _canvas = await asyncHandle(
          _tex,
          _tex.createEmpty2DWithCanvas,
          AsyncFunImpl.QCanvas,
          _imageX,
          _imageY
        );
        if (defaultCreateOption.BackColor != null)
          _canvas.clear(defaultCreateOption.BackColor.get());
        _canvas.setFillColor(defaultCreateOption.FillColor.get());
        _canvas.setLineColor(defaultCreateOption.LineColor.get());
        _canvas.setFillMode(defaultCreateOption.FillMode);
        _canvas.setLineWidth(defaultCreateOption.LineWidth);
        _canvas.drawPolygon(_v3list);
        _tex.flushCanvas();
        //_canvas.save("d:/test.png");

        var decalNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_Decal
        );
        if (decalNodeCreated != null) {
          //节点创建成功
          var decalNodeAppend = decalNodeCreated.asDecalNode();
          decalNodeAppend.setPosition(_pos.get());
          decalNodeAppend.pitch(-90, 0);
          decalNodeAppend.setWidth(_sizeX);
          decalNodeAppend.setHeight(_sizeY);
          decalNodeAppend.setLength(defaultCreateOption.MaxHeight + 10);
          decalNodeAppend.setMode(Enums.decalModeType.OpBlendAlpha);
          decalNodeAppend.setMainTexture(_resourceName);
          if (defaultCreateOption.OnDecalCreated) {
            decalNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnDecalCreated
            );
          }
          decalNodeCreated.trackAllResource();
          decalNodeAppend.loadAllResource();
          return decalNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createDecal: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createCircleDecal(nodePath: String, options: CircleDecal Options): QDecalNode
    // 在场景根节点下动态创建圆形贴花节点，Node路径"区域/[父节点]/要创建的贴花名称"，返回原生 QDecalNode 对象
    createCircleDecal: async function(nodePath, options) {
      var defaultCreateOption = {
        Center: toVector2(0, 0), //Vector2中心坐标
        Radius: 10, //半径
        Resolution: 1.0, //像素分辨率，单位米/像素
        MaxHeight: 100, //圆形区域内最大高度值
        BackColor: null, //背景填充色，默认为null
        FillColor: toColourValue("#0000FF", 0.6), //圆形填充颜色和透明值
        LineColor: toColourValue("#0000FF", 1.0), //圆形边框颜色和透明值
        LineWidth: 1, //圆形轮廓线宽
        FillMode: Enums.decalTexFillMode.FillAndFrame, //填充方式
        OnDecalCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        var _sizeX = defaultCreateOption.Radius * 2,
          _sizeY = _sizeX;
        //创建纹理
        var _imageX = _sizeX / defaultCreateOption.Resolution,
          _imageY = _sizeY / defaultCreateOption.Resolution;
        var _rm = this.get().getResourceManager();
        var _resourceName = "DecalTexture-" + this._guid();
        var _res = await asyncHandle(
          _rm,
          _rm.registerResource,
          AsyncFunImpl.QResource,
          Enums.resourceType.TEXTURE,
          _resourceName
        );
        var _tex = _res.asTexture();
        var _canvas = await asyncHandle(
          _tex,
          _tex.createEmpty2DWithCanvas,
          AsyncFunImpl.QCanvas,
          _imageX,
          _imageY
        );
        if (defaultCreateOption.BackColor != null)
          _canvas.clear(defaultCreateOption.BackColor.get());
        _canvas.setFillColor(defaultCreateOption.FillColor.get());
        _canvas.setLineColor(defaultCreateOption.LineColor.get());
        _canvas.setFillMode(defaultCreateOption.FillMode);
        _canvas.setLineWidth(defaultCreateOption.LineWidth);
        _canvas.drawCircle(
          toVector2(_imageX / 2, _imageX / 2).get(),
          _imageX / 2
        );
        _tex.flushCanvas();
        //_canvas.save("d:/test.png");

        var decalNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_Decal
        );
        if (decalNodeCreated != null) {
          //节点创建成功
          var decalNodeAppend = decalNodeCreated.asDecalNode();
          decalNodeAppend.setPosition(
            toVector3(
              defaultCreateOption.Center.x,
              defaultCreateOption.MaxHeight,
              defaultCreateOption.Center.y
            ).get()
          );
          decalNodeAppend.pitch(-90, 0);
          decalNodeAppend.setWidth(_sizeX);
          decalNodeAppend.setHeight(_sizeY);
          decalNodeAppend.setLength(defaultCreateOption.MaxHeight + 10);
          decalNodeAppend.setMode(Enums.decalModeType.OpBlendAlpha);
          decalNodeAppend.setMainTexture(_resourceName);
          if (defaultCreateOption.OnDecalCreated) {
            decalNodeCreated.addListener(Enums.listenerMsgID.LMID_SCENENODE);
            this.once(
              "onSceneNodeAllResourceCompleted_" + nodePath,
              defaultCreateOption.OnDecalCreated
            );
          }
          decalNodeCreated.trackAllResource();
          decalNodeAppend.loadAllResource();
          return decalNodeAppend;
        }
      } catch (e) {
        this.showNotice("错误", "createCircleDecal: " + e.message, 2000);
        return null;
      }
      return null;
    }
  });

  /* @namespace Map
   * @section Use Node Container
   */
  Map.include({

    // 创建或获取节点容器对象
    createNodeContainer: async function(ncName, options) {
      var defaultCreateOption = {
        ContainerType: Enums.nodeContainerType.Visible, //容器类型
        InjectionType: Enums.nodeContainerInjectionType.Node, //节点添加类型
        ModifyMode: Enums.materialApplyMode.Replace, //材质替换模式,对模型相关的修改起作用,初始化时调用
        ContentList: null, //添加内容列表,可以是节点名称列表,图层名列表,场景名列表
        Material: null, //要替换材质的名称
        Alpha: null, //要修改的材质透明度定义,不推荐使用
        Color: null, //要修改的材质颜色定义,不推荐使用
        Visible: null, //是否显示
        ResetFlag: false //调用前是否清除
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //获取或创建容器对象
        var _wm = this.get().getWorldManager();
        var _nc = await asyncHandle(
          _wm,
          _wm.getContainer,
          AsyncFunImpl.QSceneContentContainer,
          ncName
        );
        if (_nc == null) {
          //如果不存在则创建新的容器对象
          _nc = await asyncHandle(
            _wm,
            _wm.createContainer,
            AsyncFunImpl.QSceneContentContainer,
            ncName
          );
          _nc.setMaterialModifyMode(defaultCreateOption.ModifyMode);
        }

        //调用前是否清除
        if (defaultCreateOption.ResetFlag) _nc.clear();

        //根据容器效果设置不同参数
        switch (defaultCreateOption.ContainerType) {
          case Enums.nodeContainerType.Visible:
            if (defaultCreateOption.Visible != null)
              _nc.setNodeContainerVisible(defaultCreateOption.Visible);
            break;
          case Enums.nodeContainerType.Alpha:
            if (defaultCreateOption.Alpha != null)
              _nc.setMaterialAlpha(defaultCreateOption.Alpha);
            break;
          case Enums.nodeContainerType.Color:
            if (defaultCreateOption.Color != null)
              _nc.setMaterialColor(defaultCreateOption.Color.get());
            break;
          case Enums.nodeContainerType.Material:
            if (defaultCreateOption.Material != null)
              _nc.setNodeReplaceMaterial(defaultCreateOption.Material);
            break;
        }

        //添加节点到容器对象中
        for (let i = 0; i < defaultCreateOption.ContentList.length; i++) {
          var data = defaultCreateOption.ContentList[i];
          switch (defaultCreateOption.InjectionType) {
            case Enums.nodeContainerInjectionType.Node:
              _nc.addSceneNode(data);
              break;
            case Enums.nodeContainerInjectionType.Layer:
              _nc.addSceneNodeFromLayer(data);
              break;
            case Enums.nodeContainerInjectionType.Area:
              _nc.addSceneNodeFromArea(data);
              break;
          }
        }

        return _nc;
      } catch (e) {
        this.showNotice("错误", "createNodeContainer: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method createCommonNodeContainer(ncName: String, matType?: Number): QSceneContentContainer
    // 创建普通节点容器
    createCommonNodeContainer: async function(
      ncName,
      matType = Enums.materialApplyMode.Replace
    ) {
      //获取或创建容器对象
      var _wm = this.get().getWorldManager();
      var _nc = await asyncHandle(
        _wm,
        _wm.getContainer,
        AsyncFunImpl.QSceneContentContainer,
        ncName
      );
      if (_nc == null) {
        //如果不存在则创建新的容器对象
        _nc = await asyncHandle(
          _wm,
          _wm.createContainer,
          AsyncFunImpl.QSceneContentContainer,
          ncName
        );
        _nc.setMaterialModifyMode(matType);
      }
      return _nc;
    },

    // @method createVisibleNodeContainer(ncName: String, options: NodeContainer Create Options): QSceneContentContainer
    // 创建节点隐藏容器
    createVisibleNodeContainer: async function(ncName, options) {
      return await this.createNodeContainer(ncName, {
        ContainerType: Enums.nodeContainerType.Visible, //容器类型
        InjectionType: options.InjectionType, //节点添加类型
        ContentList: options.ContentList, //添加内容列表,可以是节点名称列表,图层名列表,场景名列表
        Visible: false, //隐藏
        ResetFlag: options.ResetFlag //调用前是否清除
      });
    },

    // @method createMaterialNodeContainer(ncName: String, options: NodeContainer Create Options): QSceneContentContainer
    // 创建节点材质替换容器
    createMaterialNodeContainer: async function(ncName, options) {
      return await this.createNodeContainer(ncName, {
        ContainerType: Enums.nodeContainerType.Material, //容器类型
        InjectionType: options.InjectionType, //节点添加类型
        ModifyMode: options.ModifyMode,
        ContentList: options.ContentList, //添加内容列表,可以是节点名称列表,图层名列表,场景名列表
        Material: options.Material, //替换材质
        ResetFlag: options.ResetFlag //调用前是否清除
      });
    },

    // @method getSceneNodeCountFromNodeContainer(ncName: String): Number
    // 获取容器节点数
    getSceneNodeCountFromNodeContainer: async function(ncName) {
      //获取容器对象
      var _wm = this.get().getWorldManager();
      var _nc = await asyncHandle(
        _wm,
        _wm.getContainer,
        AsyncFunImpl.QSceneContentContainer,
        ncName
      );
      if (_nc != null) {
        //如果存在
        return await asyncHandle(_nc, _nc.getSceneNodeCount, AsyncFunImpl.Int);
      }
      return 0;
    },

    // @method getAllSceneNodeNameFromNodeContainer(ncName: String): Array
    // 获取容器节点名称列表
    getAllSceneNodeNameFromNodeContainer: async function(ncName) {
      //获取容器对象
      var _wm = this.get().getWorldManager();
      var _nc = await asyncHandle(
        _wm,
        _wm.getContainer,
        AsyncFunImpl.QSceneContentContainer,
        ncName
      );
      var _nodeNames = [];
      if (_nc != null) {
        //如果存在
        var _nodeName = await asyncHandle(
          _nc,
          _nc.firstSceneNodeName,
          AsyncFunImpl.String
        );
        if (_nodeName != "") {
          _nodeNames.push(_nodeName);
          while (true) {
            _nodeName = await asyncHandle(
              _nc,
              _nc.nextSceneNodeName,
              AsyncFunImpl.String
            );
            if (_nodeName == "") break;
            _nodeNames.push(_nodeName);
          }
        }
      }
      return _nodeNames;
    }
  });

  /* @namespace Map
   * @section Use MovieClip
   */
  Map.include({
    // @method clearMovieClipInstance(mciName: String, saveMC?: Boolean): Boolean
    // 用于主动清除电影剪辑实例对象和注册的帧事件，可以选择是否保留电影剪辑对象
    clearMovieClipInstance: async function(mciName, saveMC = false) {
      var _wm = this.get().getWorldManager();
      var _mci = await asyncHandle(
        _wm,
        _wm.getMovieClipInstance,
        AsyncFunImpl.QMovieClipInstance,
        mciName
      );
      if (!_mci) return false;

      await this.unregisterMovieClipInstanceFrameEvent(_mci); //取消注册
      _mci.stop();

      if (!saveMC) {
        var _mcName = await asyncHandle(
          _mci,
          _mci.getMovieClipCName,
          AsyncFunImpl.String
        );
        await this.destroyMovieClip(_mcName);
      }
      await this.destroyMovieClipInstance(mciName);
      return true;
    },

    // @method createMovieClip(mcName:String, fps: Number): QMovieClip
    //创建新的电影剪辑,如果已经存在,则清除所有角色再返回
    createMovieClip: async function(mcName, fps) {
      var _wm = this.get().getWorldManager();
      var _mc = await asyncHandle(
        _wm,
        _wm.getMovieClip,
        AsyncFunImpl.QMovieClip,
        mcName
      );
      if (!_mc) {
        //如果不存在则创建新的动画剪辑对象
        _mc = await asyncHandle(
          _wm,
          _wm.createMovieClip,
          AsyncFunImpl.QMovieClip,
          mcName
        );
      } else {
        // 如果存在则清除之前定义的角色信息
        _mc.removeAllActors();
      }
      _mc.setFPS(fps);
      return _mc;
    },

    // @method getMovieClip(mcName: String): QMovieClip
    // 获取电影剪辑对象
    getMovieClip: async function(mcName) {
      var _wm = this.get().getWorldManager();
      var _mc = await asyncHandle(
        _wm,
        _wm.getMovieClip,
        AsyncFunImpl.QMovieClip,
        mcName
      );
      return _mc;
    },

    // @method getMovieClipCName(mcObj: QMovieClip): String
    // 获取电影剪辑对象名称
    getMovieClipCName: async function(mcObj) {
      return await asyncHandle(mcObj, mcObj.getCName, AsyncFunImpl.String);
    },

    // @method getMovieClipFromInstance(mciObj: QMovieClipInstance): QMovieClip
    // 从动画剪辑对象实例中获取电影剪辑对象
    getMovieClipFromInstance: async function(mciObj) {
      var mcName = await asyncHandle(
        mciObj,
        mciObj.getMovieClipCName,
        AsyncFunImpl.String
      );
      return await this.getMovieClip(mcName);
    },

    // @method createMovieClipInstance(mciName: String, mcObj: QMovieClip|String): QMovieClipInstance
    //创建新的电影剪辑实例,如果已经存在,则清除所有扮演者再返回
    createMovieClipInstance: async function(mciName, mcObj) {
      var _wm = this.get().getWorldManager();
      var _mci = await asyncHandle(
        _wm,
        _wm.getMovieClipInstance,
        AsyncFunImpl.QMovieClipInstance,
        mciName
      );
      if (!_mci) {
        _mci = await asyncHandle(
          _wm,
          _wm.createMovieClipInstance,
          AsyncFunImpl.QMovieClipInstance,
          mciName
        );
      } else {
        // 如果存在则删除所有扮演者
        _mci.stop();
        _mci.clearAllPlayers();
      }

      var mcName = "";
      if (typeof mcObj == "object")
        mcName = await asyncHandle(mcObj, mcObj.getCName, AsyncFunImpl.String);
      else mcName = mcObj;
      _mci.setMovieClip(mcName);
      return _mci;
    },

    // @method getMovieClipInstance(mciName: String): QMovieClipInstance
    // 获取电影剪辑实例对象
    getMovieClipInstance: async function(mciName) {
      var _wm = this.get().getWorldManager();
      var _mci = await asyncHandle(
        _wm,
        _wm.getMovieClipInstance,
        AsyncFunImpl.QMovieClipInstance,
        mciName
      );
      return _mci;
    },

    // @method getMovieClipInstanceCName(mciName: String): String
    // 获取电影剪辑实例对象名称
    getMovieClipInstanceCName: async function(mciObj) {
      return await asyncHandle(mciObj, mciObj.getCName, AsyncFunImpl.String);
    },

    // @method addActorTransformAnimation(mcObj: QMovieClip, acName:String, transInfo: Object): QMCActor
    // 添加变换动画角色到指定电影剪辑对象中，变形动画关键帧信息为 JSON 对象，包含了相对于父节点的 Vector3 坐标位置移动,角度旋转(可选),体积缩放(可选)
    // ```js
    //  var transInfo = {
    //    Translate: [{Key:"0",Position:Q3D.vector3(0,0,0)},{Key:"50",Position:Q3D.vector3(0,10,0)}],
    //    Rotate: [{Key:"50",Angle:Q3D.vector3(0,0,0)},{Key:"100",Angle:Q3D.vector3(0,180,0)}],
    //    Scale:[{Key:"150",Ratio:Q3D.vector3(1,1,1)},{Key:"200",Ratio:Q3D.vector3(1.5,1.5,1.5)}]
    //  }
    // ```
    addActorTransformAnimation: async function(mcObj, acName, transInfo) {
      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        //如果角色不存在,则创建
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }
      //移动
      if ("Translate" in transInfo) {
        var _cnt = transInfo["Translate"].length;
        if (_cnt < 2) return null;

        var _track = await asyncHandle(
          _actor,
          _actor.getITrack,
          AsyncFunImpl.QMCTrack,
          Enums.actorTrackType.TransformMove
        );
        if (!_track)
          //如果Track不存在,则创建
          _track = await asyncHandle(
            _actor,
            _actor.addITrack,
            AsyncFunImpl.QMCTrack,
            Enums.actorTrackType.TransformMove,
            Enums.actorKeyType.KeyAuto
          );
        var _trackMove = await asyncHandle(
          _track,
          _track.asKeyTrack,
          AsyncFunImpl.QMCKeyTrack
        );
        for (var i = 0; i < _cnt; i++) {
          var key = await asyncHandle(
            _trackMove,
            _trackMove.addIKey,
            AsyncFunImpl.QMCKey,
            parseInt(transInfo["Translate"][i].Key)
          );
          if (!key) {
            key = await asyncHandle(
              _trackMove,
              _trackMove.addIKey,
              AsyncFunImpl.QMCKey,
              parseInt(transInfo["Translate"][i].Key) + 1
            ); //往后推1帧
          }
          key.setKeyIPointAsQVector3(transInfo["Translate"][i].Position.get());
          if (i == 0) {
            //起点
            key.setRightTimeCtrlType(Enums.timeCtrlType.EaseIn);
          } else if (i == _cnt - 1) {
            //终点
            key.setLeftTimeCtrlType(Enums.timeCtrlType.EaseOut);
          } else {
            //默认采用线性，不用给控制点坐标，后续如果有控制点会被覆盖
            key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);
            key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
          }
        }
      }
      //旋转
      if ("Rotate" in transInfo) {
        var _cnt = transInfo["Rotate"].length;
        if (_cnt < 2) return null;
        var _track = await asyncHandle(
          _actor,
          _actor.getITrack,
          AsyncFunImpl.QMCTrack,
          Enums.actorTrackType.TransformRotate
        );
        if (!_track)
          _track = await asyncHandle(
            _actor,
            _actor.addITrack,
            AsyncFunImpl.QMCTrack,
            Enums.actorTrackType.TransformRotate,
            Enums.actorKeyType.KeyAuto
          );
        var _trackRotate = await asyncHandle(
          _track,
          _track.asKeyTrack,
          AsyncFunImpl.QMCKeyTrack
        );
        for (var i = 0; i < _cnt; i++) {
          var key = await asyncHandle(
            _trackRotate,
            _trackRotate.addIKey,
            AsyncFunImpl.QMCKey,
            parseInt(transInfo["Rotate"][i].Key)
          );
          if (!key) {
            key = await asyncHandle(
              _trackRotate,
              _trackRotate.addIKey,
              AsyncFunImpl.QMCKey,
              parseInt(transInfo["Rotate"][i].Key) + 1
            ); //往后推1帧
          }
          key.setKeyIPointAsQVector3(transInfo["Rotate"][i].Angle.get());
          if (i == 0) {
            //起点需要比较后一个
            var currRot = transInfo["Rotate"][i].Angle.clone();
            var nextRot = transInfo["Rotate"][i + 1].Angle.clone();
            if (currRot.equals(nextRot))
              key.setRightCurveCtrlType(Enums.curveCtrlType.Point);
            else key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
          } else if (i == _cnt - 1) {
            //终点需要比较前一个
            var currRot = transInfo["Rotate"][i].Angle.clone();
            var prevRot = transInfo["Rotate"][i - 1].Angle.clone();
            if (currRot.equals(prevRot))
              key.setLeftCurveCtrlType(Enums.curveCtrlType.Point);
            else key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);
          } else {
            //其他的点需要比较前后
            var currRot = transInfo["Rotate"][i].Angle.clone();
            var nextRot = transInfo["Rotate"][i + 1].Angle.clone();
            var prevRot = transInfo["Rotate"][i - 1].Angle.clone();
            if (currRot.equals(prevRot))
              key.setLeftCurveCtrlType(Enums.curveCtrlType.Point);
            else key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);
            if (currRot.equals(nextRot))
              key.setRightCurveCtrlType(Enums.curveCtrlType.Point);
            else key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
          }
        }
      }
      //缩放
      if ("Scale" in transInfo) {
        var _cnt = transInfo["Scale"].length;
        if (_cnt < 2) return null;
        var _track = await asyncHandle(
          _actor,
          _actor.getITrack,
          AsyncFunImpl.QMCTrack,
          Enums.actorTrackType.TransformScale
        );
        if (!_track)
          _track = await asyncHandle(
            _actor,
            _actor.addITrack,
            AsyncFunImpl.QMCTrack,
            Enums.actorTrackType.TransformScale,
            Enums.actorKeyType.KeyAuto
          );
        var _trackScale = await asyncHandle(
          _track,
          _track.asKeyTrack,
          AsyncFunImpl.QMCKeyTrack
        );
        for (var i = 0; i < _cnt; i++) {
          var key = await asyncHandle(
            _trackScale,
            _trackScale.addIKey,
            AsyncFunImpl.QMCKey,
            parseInt(transInfo["Scale"][i].Key)
          );
          if (!key) {
            key = await asyncHandle(
              _trackScale,
              _trackScale.addIKey,
              AsyncFunImpl.QMCKey,
              parseInt(transInfo["Scale"][i].Key) + 1
            ); //往后推1帧
          }
          key.setKeyIPointAsQVector3(transInfo["Scale"][i].Ratio.get());
          if (i == 0) {
            //起点比较后一个
            var currScale = transInfo["Scale"][i].Ratio.clone();
            var nextScale = transInfo["Scale"][i + 1].Ratio.clone();
            if (currScale.equals(nextScale))
              key.setRightCurveCtrlType(Enums.curveCtrlType.Point);
            else key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
          } else if (i == _cnt - 1) {
            //终点比较前一个
            var currScale = transInfo["Scale"][i].Ratio.clone();
            var prevScale = transInfo["Scale"][i - 1].Ratio.clone();
            if (currScale.equals(prevScale))
              key.setLeftCurveCtrlType(Enums.curveCtrlType.Point);
            else key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);
          } else {
            //其他的点需要比较前后
            var currScale = transInfo["Scale"][i].Ratio.clone();
            var nextScale = transInfo["Scale"][i + 1].Ratio.clone();
            var prevScale = transInfo["Scale"][i - 1].Ratio.clone();
            if (currScale.equals(prevScale))
              key.setLeftCurveCtrlType(Enums.curveCtrlType.Point);
            else key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);

            if (currScale.equals(nextScale))
              key.setRightCurveCtrlType(Enums.curveCtrlType.Point);
            else key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
          }
        }
      }
      return _actor;
    },

    // @method addActorTranslateAnimation(mcObj: QMovieClip, acName:String, transInfo: Array): QMCActor
    // 添加位移动画信息到指定电影剪辑对象中，位移动画信息有多个 JSON 对象组成，每个对象包含了关键帧和相对于父节点的 Vector3 坐标
    // ```js
    //  var transInfo = [{Key:"0",Pos:Q3D.vector3(0,0,0)},{Key:"50",Pos:Q3D.vector3(0,10,0)}];
    // ```
    addActorTranslateAnimation: async function(mcObj, acName, transInfo) {
      //检查参数
      var _cnt = transInfo.length;
      if (_cnt < 2) return null;

      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        //如果角色不存在,则创建
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }

      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        Enums.actorTrackType.TransformMove,
        Enums.actorKeyType.KeyAuto
      );
      var _trackMove = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );

      for (var i = 0; i < transInfo.length; i++) {
        var key = await asyncHandle(
          _trackMove,
          _trackMove.addIKey,
          AsyncFunImpl.QMCKey,
          parseInt(transInfo[i].Key)
        );
        if (!key) {
          key = await asyncHandle(
            _trackMove,
            _trackMove.addIKey,
            AsyncFunImpl.QMCKey,
            parseInt(transInfo[i].Key) + 1
          ); //往后推1帧
        }
        key.setKeyIPointAsQVector3(transInfo[i].Pos.get());
        if (i == 0) {
          //起点
          key.setRightTimeCtrlType(Enums.timeCtrlType.EaseIn);
        } else if (i == _cnt - 1) {
          //终点
          key.setLeftTimeCtrlType(Enums.timeCtrlType.EaseOut);
        } else {
          //默认采用线性，不用给控制点坐标，后续如果有控制点会被覆盖
          key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);
          key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
        }
      }
      return _actor;
    },

    // @method addActorRotateAnimation(mcObj: QMovieClip, acName:String, rotatesInfo: Array): QMCActor
    // 添加旋转动画信息到指定电影剪辑对象中，旋转动画信息有多个 JSON 对象组成，每个对象包含了关键帧和旋转角度值
    // ```js
    //  var rotatesInfo = [{Key:"0",Rotate:Q3D.vector3(0,0,0)},{Key:"50",Rotate:Q3D.vector3(0,10,0)}];
    // ```
    addActorRotateAnimation: async function(mcObj, acName, rotatesInfo) {
      var _cnt = rotatesInfo.length;
      if (_cnt < 2) return null;

      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }

      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        Enums.actorTrackType.TransformRotate,
        Enums.actorKeyType.KeyAuto
      );
      var _trackRot = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );

      for (var i = 0; i < rotatesInfo.length; i++) {
        var key = await asyncHandle(
          _trackRot,
          _trackRot.addIKey,
          AsyncFunImpl.QMCKey,
          parseInt(rotatesInfo[i].Key)
        );
        if (!key) {
          key = await asyncHandle(
            _trackRot,
            _trackRot.addIKey,
            AsyncFunImpl.QMCKey,
            parseInt(rotatesInfo[i].Key) + 1
          ); //往后推1帧
        }
        key.setKeyIPointAsQVector3(rotatesInfo[i].Rotate.get());
        if (i == 0) {
          //起点需要比较后一个
          var currRot = rotatesInfo[i].Rotate.clone();
          var nextRot = rotatesInfo[i + 1].Rotate.clone();
          if (currRot.equals(nextRot))
            key.setRightCurveCtrlType(Enums.curveCtrlType.Point);
          else key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
        } else if (i == _cnt - 1) {
          //终点需要比较前一个
          var currRot = rotatesInfo[i].Rotate.clone();
          var prevRot = rotatesInfo[i - 1].Rotate.clone();
          if (currRot.equals(prevRot))
            key.setLeftCurveCtrlType(Enums.curveCtrlType.Point);
          else key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);
        } else {
          //其他的点需要比较前后
          var currRot = rotatesInfo[i].Rotate.clone();
          var nextRot = rotatesInfo[i + 1].Rotate.clone();
          var prevRot = rotatesInfo[i - 1].Rotate.clone();
          if (currRot.equals(prevRot))
            key.setLeftCurveCtrlType(Enums.curveCtrlType.Point);
          else key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);

          if (currRot.equals(nextRot))
            key.setRightCurveCtrlType(Enums.curveCtrlType.Point);
          else key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
        }
      }
      return _actor;
    },

    // @method addActorScaleAnimation(mcObj: QMovieClip, acName:String, scalesInfo: Array): QMCActor
    // 添加缩放动画信息到指定电影剪辑对象中，缩放动画信息有多个 JSON 对象组成，每个对象包含了关键帧和缩放值
    // ```js
    //  var scalesInfo = [{Key:"0",Scale:Q3D.vector3(1,1,1)},{Key:"50",Scale:Q3D.vector3(1,2,1)}];
    // ```
    addActorScaleAnimation: async function(mcObj, acName, scalesInfo) {
      var _cnt = scalesInfo.length;
      if (_cnt < 2) return null;

      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }

      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        Enums.actorTrackType.TransformScale,
        Enums.actorKeyType.KeyAuto
      );
      var _trackScale = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );

      for (var i = 0; i < scalesInfo.length; i++) {
        var key = await asyncHandle(
          _trackScale,
          _trackScale.addIKey,
          AsyncFunImpl.QMCKey,
          parseInt(scalesInfo[i].Key)
        );
        if (!key) {
          key = await asyncHandle(
            _trackScale,
            _trackScale.addIKey,
            AsyncFunImpl.QMCKey,
            parseInt(scalesInfo[i].Key) + 1
          ); //往后推1帧
        }
        key.setKeyIPointAsQVector3(scalesInfo[i].Scale.get());
        if (i == 0) {
          //起点比较后一个
          var currScale = scalesInfo[i].Scale.clone();
          var nextScale = scalesInfo[i + 1].Scale.clone();
          if (currScale.equals(nextScale))
            key.setRightCurveCtrlType(Enums.curveCtrlType.Point);
          else key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
        } else if (i == _cnt - 1) {
          //终点比较前一个
          var currScale = scalesInfo[i].Scale.clone();
          var prevScale = scalesInfo[i - 1].Scale.clone();
          if (currScale.equals(prevScale))
            key.setLeftCurveCtrlType(Enums.curveCtrlType.Point);
          else key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);
        } else {
          //其他的点需要比较前后
          var currScale = scalesInfo[i].Scale.clone();
          var nextScale = scalesInfo[i + 1].Scale.clone();
          var prevScale = scalesInfo[i - 1].Scale.clone();
          if (currScale.equals(prevScale))
            key.setLeftCurveCtrlType(Enums.curveCtrlType.Point);
          else key.setLeftCurveCtrlType(Enums.curveCtrlType.Linear);

          if (currScale.equals(nextScale))
            key.setRightCurveCtrlType(Enums.curveCtrlType.Point);
          else key.setRightCurveCtrlType(Enums.curveCtrlType.Linear);
        }
      }
      return _actor;
    },

    // @method addActorTranslateGravityAnimation(mcObj: QMovieClip, acName:String, transInfo: Array): QMCActor
    // 添加重力弹跳动画信息到指定电影剪辑对象中
    // ```js
    //  var transInfo = [{Key:"0",Pos:Q3D.vector3(0,0,0)},{Key:"50",Pos:Q3D.vector3(0,2,0)}];
    // ```
    addActorTranslateGravityAnimation: async function(mcObj, acName, transInfo) {
      //检查参数
      var _cnt = transInfo.length;
      if (_cnt < 2) return null;

      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }

      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        Enums.actorTrackType.TransformMove,
        Enums.actorKeyType.KeyAuto
      );
      var _trackMove = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );
      for (var i = 0; i < transInfo.length; i++) {
        var key = await asyncHandle(
          _trackMove,
          _trackMove.addIKey,
          AsyncFunImpl.QMCKey,
          parseInt(transInfo[i].Key)
        );
        if (!key) {
          key = await asyncHandle(
            _trackMove,
            _trackMove.addIKey,
            AsyncFunImpl.QMCKey,
            parseInt(transInfo[i].Key) + 1
          ); //往后推1帧Position
        }
        key.setKeyIPointAsQVector3(transInfo[i].Pos.get());
        if (i % 2 == 0) {
          //最高点
          key.setRightTimeCtrlType(Enums.timeCtrlType.EaseIn);
          if (i > 0) key.setLeftTimeCtrlType(Enums.timeCtrlType.EaseOut);
        }
      }
      return _actor;
    },

    // @method addActorTrackControlPoint(mcObj: QMovieClip, acName:String, keyIndex: Number, ctlPnt: Vector3, isRight: Boolean): QMCActor
    // 修改位移动画中特定轨迹，添加贝塞尔控制点信息
    addActorTrackControlPoint: async function(
      mcObj,
      acName,
      keyIndex,
      ctlPnt,
      isRight
    ) {
      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) return null;

      var _track = await asyncHandle(
        _actor,
        _actor.getITrack,
        AsyncFunImpl.QMCTrack,
        Enums.actorTrackType.TransformMove
      );
      if (!_track) return null;

      var _trackMove = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );
      var _key = await asyncHandle(
        _trackMove,
        _trackMove.getIKey,
        AsyncFunImpl.QMCKey,
        keyIndex
      );
      if (!_key) return null;

      if (isRight) {
        _key.setRightCurveCtrlType(Enums.curveCtrlType.Bessel);
        _key.setRightCtrlIPointAsQVector3(ctlPnt.get());
      } else {
        _key.setLeftCurveCtrlType(Enums.curveCtrlType.Bessel);
        _key.setLeftCtrlIPointAsQVector3(ctlPnt.get());
      }

      return _actor;
    },

    // @method addActorColorFlashAnimation(mcObj: QMovieClip, acName:String, initColor: ColourValue, targetColor: ColourValue, actTime: Number, flashTimes: Number, isEmissiveColor?: Boolean): QMCActor
    // 添加颜色闪烁动画信息到指定电影剪辑对象中
    addActorColorFlashAnimation: async function(
      mcObj,
      acName,
      initColor,
      targetColor,
      actTime,
      flashTimes,
      isEmissiveColor = true
    ) {
      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }
      var colorType = isEmissiveColor
        ? Enums.actorTrackType.ColorEmissive
        : Enums.actorTrackType.ColorDiffuse;
      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        colorType,
        Enums.actorKeyType.KeyAuto
      );
      if (!_track) return null;
      var _trackColorFlash = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );

      var fps = await asyncHandle(mcObj, mcObj.getFPS, AsyncFunImpl.Float);
      var currKeyStart = 0;
      var key = await asyncHandle(
        _trackColorFlash,
        _trackColorFlash.addIKey,
        AsyncFunImpl.QMCKey,
        currKeyStart
      );
      key.setKeyIPointAsQColourValue(initColor.get());
      for (var i = 0; i < flashTimes; i++) {
        key = await asyncHandle(
          _trackColorFlash,
          _trackColorFlash.addIKey,
          AsyncFunImpl.QMCKey,
          currKeyStart + actTime * fps
        );
        key.setKeyIPointAsQColourValue(targetColor.get());
        key = await asyncHandle(
          _trackColorFlash,
          _trackColorFlash.addIKey,
          AsyncFunImpl.QMCKey,
          currKeyStart + actTime * 2 * fps
        );
        key.setKeyIPointAsQColourValue(initColor.get());
        currKeyStart += actTime * 2 * fps;
      }
      return _actor;
    },

    // @method addActorColorFlashAnimation(mcObj: QMovieClip, acName:String, fromAlpha: Number, toAlpha: Number, actTime: Number, flashTimes: Number): QMCActor
    // 添加透明度闪烁动画信息到指定电影剪辑对象中
    addActorTransparentFlashAnimation: async function(
      mcObj,
      acName,
      fromAlpha,
      toAlpha,
      actTime,
      flashTimes
    ) {
      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }
      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        Enums.actorTrackType.ColorAlpha,
        Enums.actorKeyType.KeyAuto
      );
      if (!_track) return null;

      var _trackTransFlash = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );

      var fps = await asyncHandle(mcObj, mcObj.getFPS, AsyncFunImpl.Float);
      var currKeyStart = 0;
      var key = await asyncHandle(
        _trackTransFlash,
        _trackTransFlash.addIKey,
        AsyncFunImpl.QMCKey,
        currKeyStart
      );
      key.setKeyIPointAsFloat(fromAlpha);
      if (flashTimes > 0) {
        for (var i = 0; i < flashTimes; i++) {
          key = await asyncHandle(
            _trackTransFlash,
            _trackTransFlash.addIKey,
            AsyncFunImpl.QMCKey,
            currKeyStart + actTime * fps
          );
          key.setKeyIPointAsFloat(toAlpha);
          key = await asyncHandle(
            _trackTransFlash,
            _trackTransFlash.addIKey,
            AsyncFunImpl.QMCKey,
            currKeyStart + actTime * 2 * fps
          );
          key.setKeyIPointAsFloat(fromAlpha);
          currKeyStart += actTime * 2 * fps;
        }
      } else {
        key = await asyncHandle(
          _trackTransFlash,
          _trackTransFlash.addIKey,
          AsyncFunImpl.QMCKey,
          currKeyStart + actTime * fps
        );
        key.setKeyIPointAsFloat(toAlpha);
      }
      return _actor;
    },

    // @method addActorFadeInAnimation(mcObj: QMovieClip, acName:String, actTime: Number, alphaEnd: Number): QMCActor
    // 添加渐显动画信息到指定电影剪辑对象中
    addActorFadeInAnimation: async function(mcObj, acName, actTime, alphaEnd) {
      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }
      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        Enums.actorTrackType.ColorAlpha,
        Enums.actorKeyType.KeyAuto
      );
      if (!_track) return null;

      var _trackTransFlash = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );

      var fps = await asyncHandle(mcObj, mcObj.getFPS, AsyncFunImpl.Float);
      var key = await asyncHandle(
        _trackTransFlash,
        _trackTransFlash.addIKey,
        AsyncFunImpl.QMCKey,
        0
      );
      key.setKeyIPointAsFloat(0.0);
      key = await asyncHandle(
        _trackTransFlash,
        _trackTransFlash.addIKey,
        AsyncFunImpl.QMCKey,
        actTime * fps
      );
      key.setKeyIPointAsFloat(alphaEnd || 1.0);
      key.setLeftTimeCtrlType(Enums.timeCtrlType.EaseOut);
      return _actor;
    },

    // @method addActorFadeOutAnimation(mcObj: QMovieClip, acName:String, actTime: Number, alphaStart: Number): QMCActor
    // 添加渐显动画信息到指定电影剪辑对象中
    addActorFadeOutAnimation: async function(mcObj, acName, actTime, alphaStart) {
      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }
      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        Enums.actorTrackType.ColorAlpha,
        Enums.actorKeyType.KeyAuto
      );
      if (!_track) return null;

      var _trackTransFlash = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );

      var fps = await asyncHandle(mcObj, mcObj.getFPS, AsyncFunImpl.Float);
      var key = await asyncHandle(
        _trackTransFlash,
        _trackTransFlash.addIKey,
        AsyncFunImpl.QMCKey,
        0
      );
      key.setKeyIPointAsFloat(alphaStart || 1.0);
      key.setRightTimeCtrlType(Enums.timeCtrlType.EaseIn);
      key = await asyncHandle(
        _trackTransFlash,
        _trackTransFlash.addIKey,
        AsyncFunImpl.QMCKey,
        actTime * fps
      );
      key.setKeyIPointAsFloat(0.0);
      return _actor;
    },

    // @method addActorCommonAnimation(mcObj: QMovieClip, acName:String, atType: Number, atInfo: Array, tcType?: Number, valType?: Number): QMCActor
    // 添加各种类型的动画信息到指定电影剪辑对象中
    // 时间控制类型 tcType: 0-EaseIn/Linear/EaseOut; 1-Linear All
    // 值类型 valType: 0-Float; 1-vector2; 2-Vector3; 3-Vector3d; 4-ColourValue
    // ```js
    //  var atInfo = [{Key:"0",Value:Q3D.vector2(0,0)},{Key:"50",Value:Q3D.vector2(0,1.0)}];
    // ```
    addActorCommonAnimation: async function(
      mcObj,
      acName,
      atType,
      atInfo,
      tcType = 0,
      valType = 0
    ) {
      var _cnt = atInfo.length;
      if (_cnt < 2) return null;

      var _actor = await asyncHandle(
        mcObj,
        mcObj.getIActor,
        AsyncFunImpl.QMCActor,
        acName
      );
      if (!_actor) {
        _actor = await asyncHandle(
          mcObj,
          mcObj.addIActor,
          AsyncFunImpl.QMCActor,
          acName
        ); //添加该角色
      }
      var _track = await asyncHandle(
        _actor,
        _actor.addITrack,
        AsyncFunImpl.QMCTrack,
        atType,
        Enums.actorKeyType.KeyAuto
      );
      if (!_track) return null;

      var _trackUV = await asyncHandle(
        _track,
        _track.asKeyTrack,
        AsyncFunImpl.QMCKeyTrack
      );

      for (var i = 0; i < atInfo.length; i++) {
        var key = await asyncHandle(
          _trackUV,
          _trackUV.addIKey,
          AsyncFunImpl.QMCKey,
          parseInt(atInfo[i].Key)
        );
        if (!key) {
          key = await asyncHandle(
            _trackUV,
            _trackUV.addIKey,
            AsyncFunImpl.QMCKey,
            parseInt(atInfo[i].Key) + 1
          ); //往后推1帧
        }
        switch (valType) {
          case 0:
            key.setKeyIPointAsFloat(parseFloat(atInfo[i].Value));
            break;
          case 1:
            key.setKeyIPointAsQVector2(atInfo[i].Value.get());
            break;
          case 2:
            key.setKeyIPointAsQVector3(atInfo[i].Value.get());
            break;
          case 3:
            key.setKeyIPointAsQVector3d(atInfo[i].Value.get());
            break;
          case 4:
            key.setKeyIPointAsQColourValue(atInfo[i].Value.get());
            break;
        }
        if (i == 0) {
          if (tcType == 0) key.setRightTimeCtrlType(Enums.timeCtrlType.EaseIn);
          else key.setRightTimeCtrlType(Enums.timeCtrlType.Linear);
        } else if (i == _cnt - 1) {
          if (tcType == 0) key.setLeftTimeCtrlType(Enums.timeCtrlType.EaseOut);
          else key.setLeftTimeCtrlType(Enums.timeCtrlType.Linear);
        } else {
          key.setRightTimeCtrlType(Enums.timeCtrlType.Linear);
          key.setLeftTimeCtrlType(Enums.timeCtrlType.Linear);
        }
      }
      return _actor;
    },

    // @method addActorUVAnimation(mcObj: QMovieClip, acName:String, uvType: Number, uvInfo: Array, tcType?: Number): QMCActor
    // 添加 UV 动画信息到指定电影剪辑对象中
    // ```js
    //  var uvInfo = [{Key:"0",Value:Q3D.vector2(0,0)},{Key:"120",Value:Q3D.vector2(0,1.0)}];
    // ```
    addActorUVAnimation: async function(
      mcObj,
      acName,
      uvType,
      uvInfo,
      tcType = 0
    ) {
      return await this.addActorCommonAnimation(
        mcObj,
        acName,
        uvType,
        uvInfo,
        tcType,
        1
      );
    },

    // @method addActorColorAlphaAnimation(mcObj: QMovieClip, acName:String, alphaInfo: Array, tcType?: Number): QMCActor
    // 添加 ColorAlpha 动画信息到指定电影剪辑对象中
    // ```js
    //  var alphaInfo = [{Key:0,Value:1.0},{Key:50,Value:1.0},{Key:80,Value:0.0},{Key:120,Value:0.0}];
    // ```
    addActorColorAlphaAnimation: async function(
      mcObj,
      acName,
      alphaInfo,
      tcType = 1
    ) {
      return await this.addActorCommonAnimation(
        mcObj,
        acName,
        Enums.actorTrackType.ColorAlpha,
        alphaInfo,
        tcType,
        0
      );
    },

    // @method addActorColorAnimation(mcObj: QMovieClip, acName:String, clrType: Number, clrInfo: Array, tcType?: Number): QMCActor
    // 添加颜色动画信息到指定电影剪辑对象中
    // ```js
    //  var clrInfo = [{Key:0,Value:Q3D.colourValue("#E50743", 1)},{Key:60,Value:Q3D.colourValue("#F9870F", 1)},{Key:120,Value:Q3D.colourValue("#E8ED30", 1)}];
    // ```
    addActorColorAnimation: async function(
      mcObj,
      acName,
      clrType,
      clrInfo,
      tcType = 1
    ) {
      return await this.addActorCommonAnimation(
        mcObj,
        acName,
        clrType,
        clrInfo,
        tcType,
        4
      );
    },

    // @method addActorSkyOrderAnimation(mcObj: QMovieClip, acName:String, orderInfo: Array, tcType?: Number): QMCActor
    // 添加天空盒顺序动画信息到指定电影剪辑对象中
    // ```js
    //  var orderInfo = [{Key:0,Value:2.0},{Key:50,Value:3.0}];
    // ```
    addActorSkyOrderAnimation: async function(
      mcObj,
      acName,
      orderInfo,
      tcType = 1
    ) {
      return await this.addActorCommonAnimation(
        mcObj,
        acName,
        Enums.actorTrackType.Order,
        orderInfo,
        tcType,
        0
      );
    },

    // @method addActorColorIntensityAnimation(mcObj: QMovieClip, acName:String, orderInfo: Array, tcType?: Number): QMCActor
    // 添加颜色强度动画信息到指定电影剪辑对象中
    // ```js
    //  var intensityInfo = [{Key:0,Value:1.5},{Key:50,Value:0.02}];
    // ```
    addActorColorIntensityAnimation: async function(
      mcObj,
      acName,
      intensityType,
      intensityInfo,
      tcType = 1
    ) {
      return await this.addActorCommonAnimation(
        mcObj,
        acName,
        intensityType,
        intensityInfo,
        tcType,
        0
      );
    },

    // @method setMaterialFadePlayer(mciObj: QMovieClipInstance, mcObj: QMovieClip, node: QSceneNode, fadeType: Number, actTime: Number, flashTimes?: Number, cloneMat?: Boolean): Boolean
    // 为动画剪辑对象中的材质相关动画角色指定扮演者(节点的材质需要先克隆一份，注意这里节点的每个材质都要创建自己的Actor)
    // 本方法用于渐隐、渐现、透明闪烁动画实现
    // 对于材质相关的动画角色，定义和扮演者指派同时完成
    setMaterialFadePlayer: async function(
      mciObj,
      mcObj,
      node,
      fadeType,
      actTime,
      flashTimes = 0,
      cloneMat = true
    ) {
      var nodeType = await asyncHandle(node, node.getNodeType, AsyncFunImpl.Int);
      if (
        nodeType != Enums.sceneNodeType.SNODE_Model &&
        nodeType != Enums.sceneNodeType.SNODE_VecModel &&
        nodeType != Enums.sceneNodeType.SNODE_Line
      )
        return false;

      var realNode = null,
        matCnt = 0;
      if (nodeType == Enums.sceneNodeType.SNODE_Model) {
        realNode = node.asModel();
        matCnt = await asyncHandle(
          realNode,
          realNode.getMaterialCount,
          AsyncFunImpl.Int
        );
      } else if (nodeType == Enums.sceneNodeType.SNODE_VecModel) {
        realNode = node.asVecModel();
        matCnt = await asyncHandle(
          realNode,
          realNode.getMaterialCount,
          AsyncFunImpl.Int
        );
      } else {
        realNode = node.asLine();
        matCnt = 1;
      }
      var mat = null;
      if (cloneMat) realNode.makeAloneMaterialsEx(2);
      for (var i = 0; i <= matCnt - 1; i++) {
        if (nodeType == Enums.sceneNodeType.SNODE_Line)
          mat = await asyncHandle(
            realNode,
            realNode.getMaterial,
            AsyncFunImpl.QMaterial
          );
        else
          mat = await asyncHandle(
            realNode,
            realNode.getMaterial,
            AsyncFunImpl.QMaterial,
            i
          );
        if (!mat) continue;

        var matName = await asyncHandle(mat, mat.getName, AsyncFunImpl.String);
        var initAlpha = await asyncHandle(mat, mat.getAlpha, AsyncFunImpl.Float);
        mat.setAlphaBlendEnable(1);
        if (fadeType == Enums.fadeType.fadeIn) {
          await this.addActorFadeInAnimation(
            mcObj,
            matName,
            actTime,
            /*initAlpha*/ 1.0
          );
          mat.setDepthWriteEnable(true);
        } else if (fadeType == Enums.fadeType.fadeOut) {
          await this.addActorFadeOutAnimation(
            mcObj,
            matName,
            actTime,
            /*initAlpha*/ 1.0
          );
          mat.setDepthWriteEnable(false);
        } else
          await this.addActorTransparentFlashAnimation(
            mcObj,
            matName,
            initAlpha,
            0.0,
            actTime,
            flashTimes
          );
        mciObj.setPlayer(matName, Enums.playerType.Material, matName);
      }
      return true;
    },

    // @method setMaterialColorFlashPlayer(mciObj: QMovieClipInstance, mcObj: QMovieClip, node: QSceneNode, targetColor: ColourValue,actTime: Number, flashTimes: Number, isEmissiveColor?: Boolean): Boolean
    // 为动画剪辑对象中的材质相关动画角色指定扮演者(节点的材质需要先克隆一份，注意这里节点的每个材质都要创建自己的Actor)
    // 本方法用于颜色闪烁动画实现
    // 对于材质相关的动画角色，定义和扮演者指派同时完成
    setMaterialColorFlashPlayer: async function(
      mciObj,
      mcObj,
      node,
      targetColor,
      actTime,
      flashTimes,
      isEmissiveColor = true
    ) {
      var nodeType = await asyncHandle(node, node.getNodeType, AsyncFunImpl.Int);
      if (
        nodeType != Enums.sceneNodeType.SNODE_Model &&
        nodeType != Enums.sceneNodeType.SNODE_VecModel &&
        nodeType != Enums.sceneNodeType.SNODE_Line
      )
        return false;

      var realNode = null,
        matCnt = 0;
      if (nodeType == Enums.sceneNodeType.SNODE_Model) {
        realNode = node.asModel();
        matCnt = await asyncHandle(
          realNode,
          realNode.getMaterialCount,
          AsyncFunImpl.Int
        );
      } else if (nodeType == Enums.sceneNodeType.SNODE_VecModel) {
        realNode = node.asVecModel();
        matCnt = await asyncHandle(
          realNode,
          realNode.getMaterialCount,
          AsyncFunImpl.Int
        );
      } else {
        realNode = node.asLine();
        matCnt = 1;
      }

      var mat = null,
        initColor = null;
      realNode.makeAloneMaterialsEx(2);
      for (var i = 0; i <= matCnt - 1; i++) {
        if (nodeType == Enums.sceneNodeType.SNODE_Line)
          mat = await asyncHandle(
            realNode,
            realNode.getMaterial,
            AsyncFunImpl.QMaterial
          );
        else
          mat = await asyncHandle(
            realNode,
            realNode.getMaterial,
            AsyncFunImpl.QMaterial,
            i
          );
        if (!mat) continue;
        mat.setAlphaBlendEnable(1);
        var matName = await asyncHandle(mat, mat.getName, AsyncFunImpl.String);
        if (isEmissiveColor)
          initColor = await asyncHandle(
            mat,
            mat.getEmissiveColor,
            AsyncFunImpl.QColourValue
          );
        else
          initColor = await asyncHandle(
            mat,
            mat.getDiffuseColor,
            AsyncFunImpl.QColourValue
          );

        await this.addActorColorFlashAnimation(
          mcObj,
          matName,
          toColourValue(initColor),
          targetColor,
          actTime,
          flashTimes,
          isEmissiveColor
        ); //添加一个对应材质的Actor
        mciObj.setPlayer(matName, Enums.playerType.Material, matName);
      }

      return true;
    },

    // @method restoreMaterials(nodePaths: Array): this
    // 恢复给定节点的初始材质
    restoreMaterials: async function(nodePaths) {
      //恢复节点的材质
      let wm = this.get().getWorldManager();
      for (let i = 0; i < nodePaths.length; i++) {
        let node = await asyncHandle(
          wm,
          wm.getSceneNode,
          AsyncFunImpl.QSceneNode,
          nodePaths[i]
        );
        let nodeType = await asyncHandle(
          node,
          node.getNodeType,
          AsyncFunImpl.Int
        );
        if (nodeType == Enums.sceneNodeType.SNODE_Model)
          node.asModel().restoreAloneMaterials();
        else if (nodeType == Enums.sceneNodeType.SNODE_VecModel)
          node.asVecModel().restoreAloneMaterials();
        else node.asLine().restoreAloneMaterials();
      }
      return this;
    },

    // @method currFrame(mciObj: QMovieClipInstance): Number
    // 返回当前的关键帧值
    currFrame: async function(mciObj) {
      var currFrame = await asyncHandle(
        mciObj,
        mciObj.getCurrFrameNo,
        AsyncFunImpl.Int
      );
      return currFrame;
    },

    // @method currTime(mciObj: QMovieClipInstance): Number
    // 返回当前的时刻值
    currTime: async function(mciObj) {
      var currTime = await asyncHandle(
        mciObj,
        mciObj.getCurrTickTime,
        AsyncFunImpl.Float
      );
      return currTime;
    },

    // @method nextFrame(mciObj: QMovieClipInstance, frames?: Number): this
    // 前进指定帧数，默认=1
    nextFrame: async function(mciObj, frames = 1) {
      var currFrame = await asyncHandle(
        mciObj,
        mciObj.getCurrFrameNo,
        AsyncFunImpl.Int
      );
      mciObj.gotoFrame(currFrame + frames);
      return this;
    },

    // @method prevFrame(mciObj: QMovieClipInstance, frames?: Number): this
    // 后退指定帧数，默认=1
    prevFrame: async function(mciObj, frames = 1) {
      var currFrame = await asyncHandle(
        mciObj,
        mciObj.getCurrFrameNo,
        AsyncFunImpl.Int
      );
      mciObj.gotoFrame(currFrame - frames);
      return this;
    },

    // @method nextTime(mciObj: QMovieClipInstance, secs?: Number): this
    // 前进指定秒数，默认=1
    nextTime: async function(mciObj, secs = 1) {
      var currTime = await asyncHandle(
        mciObj,
        mciObj.getCurrTickTime,
        AsyncFunImpl.Float
      );
      mciObj.gotoTime(currTime + secs);
      return this;
    },

    // @method prevTime(mciObj: QMovieClipInstance, secs?: Number): this
    // 后退指定秒数，默认=1
    prevTime: async function(mciObj, secs = 1) {
      var currTime = await asyncHandle(
        mciObj,
        mciObj.getCurrTickTime,
        AsyncFunImpl.Float
      );
      mciObj.gotoTime(currTime - secs);
      return this;
    },

    // @method changePlaySpeed(mciObj: QMovieClipInstance, fps: Number): this
    // 改变正常播放速度
    changePlaySpeed: async function(mciObj, fps) {
      var currFrame = await asyncHandle(
        mciObj,
        mciObj.getCurrFrameNo,
        AsyncFunImpl.Int
      );
      var mcName = await asyncHandle(
        mciObj,
        mciObj.getMovieClipCName,
        AsyncFunImpl.String
      );
      var wm = this.get().getWorldManager();
      var mc = await asyncHandle(
        wm,
        wm.getMovieClip,
        AsyncFunImpl.QMovieClip,
        mcName
      );
      mc.setFPS(fps);
      mciObj.gotoFrame(currFrame);
      return this;
    },

    // @method registerMovieClipInstanceFrameEvent(mciObj: QMovieClipInstance, keyIndex: Number, fn: Function): this
    // 注册帧事件
    registerMovieClipInstanceFrameEvent: async function(mciObj, keyIndex, fn) {
      mciObj.setListener(Enums.listenerMsgID.LMID_MOVIECLIPINSTANCE);
      if (fn && isFunction(fn)) {
        mciObj.registerFrameEvent(keyIndex); //注册事件
        var mciName = await asyncHandle(
          mciObj,
          mciObj.getCName,
          AsyncFunImpl.String
        );
        this.on("onMovieClipInstancePassFrame_" + mciName + "_" + keyIndex, fn);
      }
      return this;
    },

    //获取同动画剪辑实例对象相关的帧事件名称
    _getMovieClipInstanceFrameEvent: function(mciName) {
      var frames = [];
      for (var event in this._events) {
        if (event.indexOf(mciName) > -1) frames.push(event);
      }
      return frames;
    },

    // @method onMovieClipInstancePassFrame(mciObj: QMovieClipInstance, keyIndex?: Number): this
    // 清除注册帧事件
    unregisterMovieClipInstanceFrameEvent: async function(mciObj, keyIndex = -1) {
      var mciName = await asyncHandle(
        mciObj,
        mciObj.getCName,
        AsyncFunImpl.String
      );
      if (keyIndex == -1) {
        //清除所有的帧事件
        mciObj.setListener(-1);
        var typeListeners = this._getMovieClipInstanceFrameEvent(
          "onMovieClipInstancePassFrame_" + mciName
        );
        typeListeners.forEach(function(item) {
          this.off(item);
        }, this);

        var typeListeners = this._getMovieClipInstanceFrameEvent(
          "onMovieClipInstanceStop_" + mciName
        );
        typeListeners.forEach(function(item) {
          this.off(item);
        }, this);
      } else {
        mciObj.unregisterFrameEvent(keyIndex); //取消给定帧注册事件
        this.off("onMovieClipInstancePassFrame_" + mciName + "_" + keyIndex);
      }
      return this;
    }
  });

  /* @namespace Map
   * @section Use Roaming Animation
   */
  Map.include({
    // 获取欧拉角
    _getEulerAngle: async function(v3) {
      var _math = this.get().getMath();
      return await asyncHandle(
        _math,
        _math.directionToEuler,
        AsyncFunImpl.QVector3,
        v3
      );
    },

    // @method roamByPolyline(nodePath: String, options: Node Roam Options): QMovieClipInstance
    // 根据给定路线坐标实现场景中节点的动画漫游功能，返回 QMovieClipInstance 对象
    roamByPolyline: async function(nodePath, options) {
      var defaultOptions = {
        CenterLine: [], //动线中心线，可以支持Vector3或GlobalVec3d类型坐标
        OffsetDist: [], //中间点的前后偏移距离，单位米，用于贝塞尔曲线的控制点计算; 可以是数值或数组
        TotalTime: 5, //>0 表示总用时，单位秒; <0 表示速度,单位米/秒
        DelayTime: 0, //延迟出发，单位秒
        IsLoop: false, //是否循环播放，默认不循环执行
        IsAutoPlay: false, //是否自动播放，默认否
        PitchAllowed: true, //是否允许俯仰
        OnAnimationEndFn: null //动画结束回调事件
      };
      jQueryExtend(true, defaultOptions, options);
      try {
        //检查参数
        if (
          defaultOptions.CenterLine.length < 2 ||
          (defaultOptions.CenterLine.length >= 3 &&
            typeof defaultOptions.OffsetDist == "object" &&
            defaultOptions.CenterLine.length != defaultOptions.OffsetDist.length)
        )
          return null;

        //检查节点是否存在
        var node = await this.getSceneNodeBaseInfo(nodePath);
        if (!node) return null;

        var path = nodePath.split("/"),
          nodeName = path[path.length - 1],
          areaName = path[0];

        //先过滤相邻的重复的点
        var _cl = [defaultOptions.CenterLine[0]],
          _od =
            typeof defaultOptions.OffsetDist == "object"
              ? [defaultOptions.OffsetDist[0]]
              : [0];
        for (let i = 1; i < defaultOptions.CenterLine.length; ++i) {
          if (
            defaultOptions.CenterLine[i].equals(defaultOptions.CenterLine[i - 1])
          )
            continue;
          _cl.push(defaultOptions.CenterLine[i]);
          if (typeof defaultOptions.OffsetDist == "object")
            _od.push(defaultOptions.OffsetDist[i]);
          else {
            if (i == defaultOptions.CenterLine.length - 1) _od.push(0);
            else _od.push(defaultOptions.OffsetDist);
          }
        }

        //可能的数据转换
        for (let i = 0; i < _cl.length; i++) {
          if (_cl[i].getCLSID() == Enums.ValueTypeCLSID.QGlobalVec3d)
            _cl[i] = toVector3(
              await defaultOptions.CenterLine[i].toLocalPos(areaName)
            );
        }

        //生成旋转动画使用的数据：_clForRot数组
        var _clForRot = null;
        if (!defaultOptions.PitchAllowed) {
          //是否存在俯仰角度变化
          _clForRot = [];
          for (var i = 0; i < _cl.length; ++i) {
            _clForRot[i] = toVector3(_cl[i].x, 0, _cl[i].z); //旋转动画使用_clForRot数组，位移动画使用_cl数组
          }
        } else {
          _clForRot = _cl; //旋转动画使用_clForRot数组，位移动画使用_cl数组
        }

        //计算总距离,并对耗时重新计算分析
        var totalDist = 0;
        for (let i = 0; i < _cl.length - 1; i++) {
          totalDist += _cl[i].distanceTo(_cl[i + 1]);
        }
        if (defaultOptions.TotalTime < 0) {
          //需要根据速度计算总耗时
          defaultOptions.TotalTime =
            totalDist / Math.abs(defaultOptions.TotalTime);
        }

        var fps = 50,
          timeForDirAdjustion = 0.5, //用于调整方向的时间，单位为秒
          mcName = "mc_roambypolyline_" + areaName,
          mcInstName = "mci_roambypolyline_" + areaName,
          actorName = "actor_roambypolyline_" + areaName;

        await this.clearMovieClipInstance(mcInstName);

        var _mc = await this.createMovieClip(mcName, fps),
          _tt = defaultOptions.TotalTime;

        //包含0.5s的调整角度时间和0.5s结束调整时间
        var startFrameBase = parseInt(defaultOptions.DelayTime * fps),
          startKey = parseInt(startFrameBase + timeForDirAdjustion * fps),
          endKey = parseInt(
            (defaultOptions.DelayTime +
              defaultOptions.TotalTime +
              timeForDirAdjustion * 2) *
              fps
          );

        if (_cl.length == 2) {
          //没有控制点
          var startPt = _cl[0],
            endPt = _cl[1],
            startPtForRot = _clForRot[0],
            endPtForRot = _clForRot[1];
          var endRot = await this._getEulerAngle(
            endPtForRot
              .clone()
              .subtract(startPtForRot)
              .get()
          );
          //定义一个旋转动画
          await this.addActorRotateAnimation(_mc, actorName, [
            {
              Key: startFrameBase,
              Rotate: node.Orientation
            },
            {
              Key: startKey,
              Rotate: toVector3(endRot)
            },
            {
              Key: endKey,
              Rotate: toVector3(endRot)
            }
          ]);
          //定义一个位移动画
          await this.addActorTranslateAnimation(_mc, actorName, [
            {
              Key: startFrameBase,
              Pos: node.Position
            },
            {
              Key: startKey,
              Pos: startPt
            },
            {
              Key: endKey - fps * timeForDirAdjustion,
              Pos: endPt
            },
            {
              Key: endKey,
              Pos: endPt
            }
          ]);
        } else {
          //3个点及以上

          //整理最终的KeyPos
          var keyPosTra = [],
            keyPosRot = [],
            keyPosCtl = [];
          var currDist = 0,
            endRot,
            currKeyIndex;
          var startPt, endPt, startPtForRot, endPtForRot;
          var prevPt,
            currPt,
            nextPt,
            prevPtForRot,
            currPtForRot,
            nextPtForRot,
            distToPrev,
            distToNext;
          var endRotPrev, endRotNext;
          var coeff = toVector3(1 / 2, 1 / 2, 1 / 2);
          keyPosTra.push({
            Key: startFrameBase,
            Pos: node.Position
          });
          keyPosRot.push({
            Key: startFrameBase,
            Rotate: node.Orientation
          });
          //处理第一个点
          keyPosTra.push({
            Key: startKey,
            Pos: _cl[0]
          });
          startPtForRot = _clForRot[0];
          endPtForRot = _clForRot[1];
          endRot = await this._getEulerAngle(
            endPtForRot
              .clone()
              .subtract(startPtForRot)
              .get()
          ); //返回startPt指向endPt的方向
          keyPosRot.push({
            Key: startKey,
            Rotate: toVector3(endRot)
          });
          //处理中间的点
          for (var i = 1; i < _cl.length - 1; i++) {
            prevPt = _cl[i - 1];
            currPt = _cl[i];
            nextPt = _cl[i + 1];
            prevPtForRot = _clForRot[i - 1];
            currPtForRot = _clForRot[i];
            nextPtForRot = _clForRot[i + 1];
            distToPrev = currPt.distanceTo(prevPt);
            distToNext = nextPt.distanceTo(currPt);
            currDist += distToPrev;

            endRotPrev = await this._getEulerAngle(
              currPtForRot
                .clone()
                .subtract(prevPtForRot)
                .get()
            );
            endRotNext = await this._getEulerAngle(
              nextPtForRot
                .clone()
                .subtract(currPtForRot)
                .get()
            );
            if (_od[i] > 0) {
              //插入一个控制点和两个位置点（包括旋转角度）
              var offsetLen = 3 * _od[i] < distToPrev ? _od[i] : distToPrev / 3;
              var diffVec = prevPt
                .clone()
                .subtract(currPt)
                .scaleBy(
                  toVector3(
                    offsetLen / distToPrev,
                    offsetLen / distToPrev,
                    offsetLen / distToPrev
                  )
                );
              var derivedLeftPt = currPt.clone().add(diffVec);
              currKeyIndex = parseInt(
                startKey + ((currDist - offsetLen) / totalDist) * fps * _tt
              );
              keyPosTra.push({
                Key: currKeyIndex,
                Pos: derivedLeftPt
              });
              keyPosRot.push({
                Key: currKeyIndex,
                Rotate: toVector3(endRotPrev)
              });
              keyPosCtl.push({
                Key: currKeyIndex,
                Pos: derivedLeftPt
                  .clone()
                  .add(currPt)
                  .scaleBy(coeff)
              });
              offsetLen = 3 * _od[i] < distToNext ? _od[i] : distToNext / 3;

              diffVec = nextPt
                .clone()
                .subtract(currPt)
                .scaleBy(
                  toVector3(
                    offsetLen / distToNext,
                    offsetLen / distToNext,
                    offsetLen / distToNext
                  )
                );
              var derivedRightPt = currPt.clone().add(diffVec);
              currKeyIndex = parseInt(
                startKey + ((currDist + offsetLen) / totalDist) * fps * _tt
              );
              keyPosTra.push({
                Key: currKeyIndex,
                Pos: derivedRightPt
              });
              keyPosRot.push({
                Key: currKeyIndex,
                Rotate: toVector3(endRotNext)
              });
              keyPosCtl.push({
                Key: currKeyIndex,
                Pos: derivedRightPt
                  .clone()
                  .add(currPt)
                  .scaleBy(coeff)
              });
            } else {
              currKeyIndex = parseInt(
                startKey + (currDist / totalDist) * fps * _tt
              );
              keyPosTra.push({
                Key: currKeyIndex,
                Pos: currPt
              });
              keyPosRot.push({
                Key: currKeyIndex,
                Rotate: toVector3(endRotNext)
              });
            }
          }
          //处理最后一个点
          currKeyIndex = parseInt(startKey + fps * _tt);
          keyPosTra.push({
            Key: currKeyIndex,
            Pos: _cl[i]
          });
          keyPosTra.push({
            Key: endKey,
            Pos: _cl[i]
          });
          startPtForRot = _clForRot[i - 1];
          endPtForRot = _clForRot[i];
          endRot = await this._getEulerAngle(
            endPtForRot
              .clone()
              .subtract(startPtForRot)
              .get()
          );
          keyPosRot.push({
            Key: currKeyIndex,
            Rotate: toVector3(endRot)
          });
          keyPosRot.push({
            Key: endKey,
            Rotate: toVector3(endRot)
          });
          //定义一个位移动画
          await this.addActorTranslateAnimation(_mc, actorName, keyPosTra);
          //添加关键点
          for (var k = 0; k < keyPosCtl.length; ) {
            await this.addActorTrackControlPoint(
              _mc,
              actorName,
              keyPosCtl[k].Key,
              keyPosCtl[k].Pos,
              true
            ); //补充控制点
            await this.addActorTrackControlPoint(
              _mc,
              actorName,
              keyPosCtl[k + 1].Key,
              keyPosCtl[k + 1].Pos,
              false
            );
            k += 2;
          }
          //定义一个旋转动画
          await this.addActorRotateAnimation(_mc, actorName, keyPosRot);
        }

        var _mcInst = await this.createMovieClipInstance(mcInstName, mcName);
        _mcInst.setPlayer(actorName, Enums.playerType.Node, nodePath);
        _mcInst.setLoop(defaultOptions.IsLoop);
        _mcInst.gotoFrame(0);

        if (defaultOptions.OnAnimationEndFn) {
          _mcInst.setListener(Enums.listenerMsgID.LMID_MOVIECLIPINSTANCE); //打开事件监听
          this.once(
            "onMovieClipInstanceStop_" + mcInstName,
            defaultOptions.OnAnimationEndFn
          );
        }

        if (defaultOptions.IsAutoPlay) _mcInst.play();

        return _mcInst;
      } catch (e) {
        this.showNotice("错误", "roamByPolyline: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method firstPersonView(nodePath: String, options: FirstPerson Options): QLocalCamera
    // 在节点变换动画播放过程中切换到第一人称漫游, 返回原生 QLocalCamera 对象
    firstPersonView: async function(nodePath, options) {
      var defaultOptions = {
        Postion: toVector3(0, 0, 0),
        Orientation: toVector3(0, 180, 0),
        OrientationType: Enums.nodeOrientationType.Self
      };
      jQueryExtend(true, defaultOptions, options);

      var node = await this.getSceneNode(nodePath);
      if (!node) return null;

      var path = nodePath.split("/"),
        nodeName = path[path.length - 1],
        areaName = path[0];

      var camFullName = areaName + "/" + nodeName + "/_lc_firstperson_",
        localCamNode = await this.getSceneNode(camFullName);
      if (!localCamNode) {
        localCamNode = await this.createCommonNode(
          camFullName,
          Enums.sceneNodeType.SNODE_LocalCamera
        );
      }
      var localCam = localCamNode.asCamera().asLocalCamera();
      localCam.setPosition(defaultOptions.Postion.get());
      localCam.setOrientation(
        defaultOptions.Orientation.get(),
        defaultOptions.OrientationType
      );

      var world = this.get().getWorldManager();
      //获取主摄像机对象
      var mainCamera = await asyncHandle(
        world,
        world.getMainCamera,
        AsyncFunImpl.QGlobalCamera,
        0
      );
      localCam.bindCamera(mainCamera);
      localCam.enableBind(1);
      return localCamNode;
    },

    // @method thirdPersonView(areaName: String)
    // 在节点位移动画播放过程中切换回第三人称漫游
    thirdPersonView: async function(areaName) {
      var localCamNode = await this.getSceneNode(areaName, "_lc_firstperson_");
      if (localCamNode != null) {
        localCamNode
          .asCamera()
          .asLocalCamera()
          .unbindCamera();
        await this.destroySceneNode(areaName, "_lc_firstperson_");
      }
    },

    // @method roamByCamera(areaName: String, options: Camera Roam Options): QMovieClipInstance
    // 根据给定路线坐标实现主摄像机飞行漫游
    roamByCamera: async function(areaName, options) {
      var defaultOptions = {
        FlyPos: [], //飞行关键点，可以支持Vector3或GlobalVec3d类型坐标
        FlyOrt: [], //飞行关键点观察角度，支持Vector3类型坐标
        TotalTime: 5, //>0 表示总用时，单位秒; <0 表示速度,单位米/秒
        IsLoop: false, //是否循环播放，默认不循环执行
        IsAutoPlay: true, //是否自动播放，默认是
        OnAnimationEndFn: null //动画结束回调事件
      };
      jQueryExtend(true, defaultOptions, options);
      try {
        //检查参数
        if (
          defaultOptions.FlyPos.length < 2 ||
          defaultOptions.FlyPos.length != defaultOptions.FlyOrt.length
        )
          return null;

        var area = await this.getArea(areaName);
        if (!area) return null;

        //先过滤相邻的重复的点
        var _cl = [defaultOptions.FlyPos[0]],
          _od = [defaultOptions.FlyOrt[0]];
        for (let i = 1; i < defaultOptions.FlyPos.length; ++i) {
          if (defaultOptions.FlyPos[i].equals(defaultOptions.FlyPos[i - 1]))
            continue;
          _cl.push(defaultOptions.FlyPos[i]);
          _od.push(defaultOptions.FlyOrt[i]);
        }

        //可能的数据转换
        for (let i = 0; i < _cl.length; i++) {
          if (_cl[i].getCLSID() == Enums.ValueTypeCLSID.QGlobalVec3d)
            _cl[i] = toVector3(await _cl[i].toLocalPos(areaName));
        }

        //计算总距离和每段的距离,并对耗时重新计算分析
        var totalLen = 0,
          seg_perc = [];
        for (let i = 0; i < _cl.length - 1; i++) {
          let segLen = _cl[i].distanceTo(_cl[i + 1]);
          totalLen += segLen;
          seg_perc.push(totalLen);
        }

        if (defaultOptions.TotalTime < 0) {
          //需要根据速度计算总耗时
          defaultOptions.TotalTime =
            totalLen / Math.abs(defaultOptions.TotalTime);
        }

        var fps = 50,
          totalTime = defaultOptions.TotalTime,
          mcName = "mc_roambycamera_" + areaName,
          mciName = "mci_roambycamera_" + areaName,
          actorName = "actor_roambycamera_" + areaName;

        await this.clearMovieClipInstance(mciName);

        //准备关键帧
        var keyPosTra = [],
          keyPosRot = [],
          key = 0;
        for (let i = 0; i < _cl.length; i++) {
          if (i > 0) key = (seg_perc[i - 1] / totalLen) * totalTime * fps;
          keyPosTra.push({
            Key: key,
            Pos: _cl[i]
          });

          keyPosRot.push({
            Key: key,
            Rotate: _od[i]
          });
        }

        var _mc = await this.createMovieClip(mcName, fps);

        //定义一个位移动画
        await this.addActorTranslateAnimation(_mc, actorName, keyPosTra);
        //定义一个旋转动画
        await this.addActorRotateAnimation(_mc, actorName, keyPosRot);

        //创建一个局部摄像机，如果已经存在先删除
        var lcName = "_localcamera_roambycamera_";
        await this.destroySceneNode(areaName, lcName);

        var localCamNode = await this.createCommonNode(
          areaName + "/" + lcName,
          Enums.sceneNodeType.SNODE_LocalCamera
        );
        var localCam = localCamNode.asCamera().asLocalCamera();
        localCam.setPosition(_cl[0].get());
        localCam.setOrientation(_od[0].get(), Enums.orientationType.World);

        //获取主摄像机对象
        var world = this.get().getWorldManager();
        var mainCamera = await asyncHandle(
          world,
          world.getMainCamera,
          AsyncFunImpl.QGlobalCamera,
          0
        );
        localCam.bindCamera(mainCamera);
        localCam.enableBind(true);

        var _mcInst = await this.createMovieClipInstance(mciName, mcName);
        _mcInst.setPlayer(
          actorName,
          Enums.playerType.Node,
          areaName + "/" + lcName
        );
        _mcInst.setLoop(defaultOptions.IsLoop);
        _mcInst.gotoFrame(0);

        //_mc.save("automation/" + mcName + ".qmc");

        if (defaultOptions.OnAnimationEndFn) {
          _mcInst.setListener(Enums.listenerMsgID.LMID_MOVIECLIPINSTANCE); //打开事件监听
          this.once(
            "onMovieClipInstanceStop_" + mciName,
            defaultOptions.OnAnimationEndFn
          );
        }

        if (defaultOptions.IsAutoPlay) _mcInst.play();

        return _mcInst;
      } catch (e) {
        this.showNotice("错误", "roamByCamera: " + e.message, 2000);
        return null;
      }
      return null;
    },

    // @method stopCameraRoam(areaName: String)
    // 停止摄像机第一人称漫游
    stopCameraRoam: async function(areaName) {
      var camFullName = areaName + "/_localcamera_roambycamera_",
        mciName = "mci_roambycamera_" + areaName;
      await this.clearMovieClipInstance(mciName); //清除动画剪辑实例对象
      var localCamNode = await this.getSceneNode(camFullName);
      if (localCamNode) {
        //解绑相机
        localCamNode
          .asCamera()
          .asLocalCamera()
          .unbindCamera();
        //删除子相机
        await this.destroySceneNode(camFullName);
      }
    },

    // @method cameraRoamByMovieClipFile(mcFile: String, areaName: String, mcName: String, actorName: String, resetFlag: Boolean): QMovieClipInstance
    // 通过绑定动画剪辑文件实现摄像机第一人称漫游
    cameraRoamByMovieClipFile: async function(
      mcFile, //动画文件
      areaName, //场景名
      mcName, //动画对象名
      actorName, //角色名
      resetFlag = true //是否恢复到初始相机位置
    ) {
      //先清除
      var mciName = mcName + "_mci";
      await this.clearMovieClipInstance(mciName);

      var wm = this.get().getWorldManager();
      wm.loadMovieClip(mcFile, 0); //加载剧本
      var mc = await this.getMovieClip(mcName);
      if (!mc) return null;

      //创建一个局部摄像机，如果已经存在先删除
      var lcName = "_localcamera_roambycamera_";
      await this.destroySceneNode(areaName, lcName);
      var localCamNode = await this.createCommonNode(
        areaName + "/" + lcName,
        Enums.sceneNodeType.SNODE_LocalCamera
      );
      var localCam = localCamNode.asCamera().asLocalCamera();

      //获取主摄像机对象，进行绑定
      var _gc = getGlobalCamera();
      let _gcAbsPos, _gcOri;
      if (resetFlag) {
        //保存当前主相机位置
        _gcAbsPos = toVector3d(await _gc.getAbsPos());
        //console.log(_gcAbsPos.toString());
        _gcOri = toVector3(await _gc.getOrientation());
        //console.log(_gcOri.toString());
      }

      localCam.bindCamera(await _gc.get());
      localCam.enableBind(true);

      //导演开拍:创建实例对象
      var mcInst = await this.createMovieClipInstance(mciName, mc);
      mcInst.setPlayer(actorName, Enums.playerType.Node, areaName + "/" + lcName);

      mcInst.setListener(Enums.listenerMsgID.LMID_MOVIECLIPINSTANCE); //打开事件监听
      this.once("onMovieClipInstanceStop_" + mciName, async function(data) {
        await this.stopCameraRoam(data.name);
        if (resetFlag) {
          _gc.flyTo(_gcAbsPos, _gcOri, 0.5);
        }
      });

      mcInst.setLoop(false);
      mcInst.gotoFrame(0);

      return mcInst;
    },

    // @method nodeRoamByMovieClipFile(nodePath: String, mcFile: String, mcName: String, actorName: String, OnAnimationEndFn?: Function ): QMovieClipInstance
    // 通过绑定动画剪辑文件实现节点动线漫游
    nodeRoamByMovieClipFile: async function(
      nodePath, //节点名
      mcFile, //动画文件
      mcName, //动画对象名
      actorName, //角色名置
      OnAnimationEndFn = null //动画结束回调事件
    ) {
      //检查节点是否存在
      var node = await this.getSceneNode(nodePath);
      if (!node) return null;

      var path = nodePath.split("/"),
        nodeName = path[path.length - 1],
        areaName = path[0];

      //先清除
      var mciName = mcName + "_" + areaName + "_" + nodeName;
      await this.clearMovieClipInstance(mciName);

      var wm = this.get().getWorldManager();
      wm.loadMovieClip(mcFile, 0); //加载剧本
      var mc = await this.getMovieClip(mcName);
      if (!mc) return null;

      //导演开拍:创建实例对象
      var mcInst = await this.createMovieClipInstance(mciName, mc);
      mcInst.setPlayer(
        actorName,
        Enums.playerType.Node,
        areaName + "/" + nodeName
      );

      if (isFunction(OnAnimationEndFn)) {
        mcInst.setListener(Enums.listenerMsgID.LMID_MOVIECLIPINSTANCE); //打开事件监听
        this.once("onMovieClipInstanceStop_" + mciName, OnAnimationEndFn);
      }
      mcInst.setLoop(false);
      mcInst.gotoFrame(0);

      return mcInst;
    },

    // @method startRealtimeTrack(nodePath: String, options: RealTimeTrack options): QMovieClipInstance
    // 实现节点实时追踪功能，在每次收到新的数据后调用,一次可传入多个点
    startRealtimeTrack: async function(nodePath, options) {
      var defaultOptions = {
        TimeDiff: null, //本次数据上报时间差相对于追踪开始时间差，单位S。（如果一次传入多个点，则以最后一个点的时间计算）
        LocationArr: null, //Vector3或者GlobalVector3d对象数组（也就是说可以一次传多个点，但是请注意，初始时刻只需传一个点）
        Heading: null, //到达后的水平偏转角度（数组，长度要与LocationArr一致），[-180,180]，0为正北方向顺时针为正，比如无人机，如果设置该参数则不再根据两点计算方向
        PitchAllowed: false //是否允许俯仰
      };
      jQueryExtend(true, defaultOptions, options);
      try {
        if (
          defaultOptions.Heading != null &&
          defaultOptions.Heading.length != defaultOptions.LocationArr.length
        )
          return null;

        //确保节点（通常是模型节点）已创建
        var _node = await this.getSceneNode(nodePath);
        var _nodeType = await asyncHandle(
          _node,
          _node.getNodeType,
          AsyncFunImpl.Int
        );
        if (_nodeType != Enums.sceneNodeType.SNODE_Model) return null;

        var node = await this.getSceneNodeBaseInfo(nodePath);

        var path = nodePath.split("/"),
          nodeName = path[path.length - 1],
          areaName = path[0];

        var mcName = "mc_realtimegpstrack_" + areaName + "_" + nodeName,
          mciName = "mci_realtimegpstrack_" + areaName + "_" + nodeName,
          actorName = "actor_realtimegpstrack_" + areaName + "_" + nodeName,
          fps = 50,
          timeForDirAdjustion = 0.25, //用于调整方向的时间，单位为秒
          wm = this.get().getWorldManager();

        //获取对应的MovieClip对象，如果不存在则创建
        var mc = await this.getMovieClip(mcName);
        if (!mc) {
          mc = await asyncHandle(
            wm,
            wm.createMovieClip,
            AsyncFunImpl.QMovieClip,
            mcName
          );
          mc.setFPS(fps);
        }

        //获取对应的MovieClipInstance对象，如果不存在则创建
        var mci = await this.getMovieClipInstance(mciName);
        if (!mci) {
          mci = await asyncHandle(
            wm,
            wm.createMovieClipInstance,
            AsyncFunImpl.QMovieClipInstance,
            mciName
          );

          mci.setMovieClip(mcName);
          mci.setListener(Enums.listenerMsgID.LMID_MOVIECLIPINSTANCE); //打开事件监听
        }

        var track = null,
          transKeyTrack = null,
          rotKeyTrack = null;

        //获取对应的Actor对象，如果不存在则创建
        var actor = await asyncHandle(
          mc,
          mc.getIActor,
          AsyncFunImpl.QMCActor,
          actorName
        );
        if (!actor) {
          //如果不存在
          this._gTrackInfo = this._gTrackInfo || {};
          this._prevDirection = this._prevDirection || {}; //保存上一次的方向
          actor = await asyncHandle(
            //添加该角色
            mc,
            mc.addIActor,
            AsyncFunImpl.QMCActor,
            actorName
          );
          //添加track
          track = await asyncHandle(
            actor,
            actor.addITrack,
            AsyncFunImpl.QMCTrack,
            Enums.actorTrackType.TransformMove,
            Enums.actorKeyType.KeyAuto
          );
          transKeyTrack = await asyncHandle(
            track,
            track.asKeyTrack,
            AsyncFunImpl.QMCKeyTrack
          );
          track = await asyncHandle(
            actor,
            actor.addITrack,
            AsyncFunImpl.QMCTrack,
            Enums.actorTrackType.TransformRotate,
            Enums.actorKeyType.KeyAuto
          );
          rotKeyTrack = await asyncHandle(
            track,
            track.asKeyTrack,
            AsyncFunImpl.QMCKeyTrack
          );

          //转换格式
          var currPos = defaultOptions.LocationArr[0];
          if (currPos.getCLSID() == Enums.ValueTypeCLSID.QGlobalVec3d)
            currPos = toVector3(
              await defaultOptions.LocationArr[0].toLocalPos(areaName)
            );

          //添加第一个key位移动画
          var key = await asyncHandle(
            transKeyTrack,
            transKeyTrack.addIKey,
            AsyncFunImpl.QMCKey,
            0
          );
          key.setKeyIPointAsQVector3(currPos.get());
          key.setRightTimeCtrlType(Enums.timeCtrlType.EaseIn);

          //添加第一个key旋转动画
          var currRot = node.Orientation;
          if (defaultOptions.Heading != null) {
            currRot.y = defaultOptions.Heading[0];
          }
          key = await asyncHandle(
            rotKeyTrack,
            rotKeyTrack.addIKey,
            AsyncFunImpl.QMCKey,
            0
          );
          key.setKeyIPointAsQVector3(currRot.get());
          //key.setRightCurveCtrlType(Enums.curveCtrlType.Point);

          //保存所有的关键帧
          this._gTrackInfo[mcName] = [0];
          //保存方向
          this._prevDirection[mcName] = currRot;

          //绑定player并播放
          mci.setPlayer(
            actorName,
            Enums.playerType.Node,
            areaName + "/" + nodeName
          );
          mci.setLoop(false);
          mci.play();
        } else {
          // 取出track，添加新的key
          track = await asyncHandle(
            actor,
            actor.getITrack,
            AsyncFunImpl.QMCTrack,
            Enums.actorTrackType.TransformMove
          );
          transKeyTrack = await asyncHandle(
            track,
            track.asKeyTrack,
            AsyncFunImpl.QMCKeyTrack
          );
          track = await asyncHandle(
            actor,
            actor.getITrack,
            AsyncFunImpl.QMCTrack,
            Enums.actorTrackType.TransformRotate
          );
          rotKeyTrack = await asyncHandle(
            track,
            track.asKeyTrack,
            AsyncFunImpl.QMCKeyTrack
          );

          //获取前一个key，即最近一次接收数据的时间
          var len = this._gTrackInfo[mcName].length;
          var prevKeyIndex = this._gTrackInfo[mcName][len - 1],
            prevTransKey = await asyncHandle(
              transKeyTrack,
              transKeyTrack.getIKey,
              AsyncFunImpl.QMCKey,
              prevKeyIndex
            ),
            prevPt = await asyncHandle(
              prevTransKey,
              prevTransKey.getKeyIPointAsQVector3,
              AsyncFunImpl.QVector3
            ),
            prevPtForRot = toVector3(prevPt),
            endKeyIndex = defaultOptions.TimeDiff * fps,
            deltaKeyIndex = endKeyIndex - prevKeyIndex;

          var locArr = defaultOptions.LocationArr,
            locArrLen = locArr.length;

          //可能的数据转换
          for (let i = 0; i < locArr.length; i++) {
            if (locArr[i].getCLSID() == Enums.ValueTypeCLSID.QGlobalVec3d)
              locArr[i] = toVector3(await locArr[i].toLocalPos(areaName));
          }

          //计算每一段的距离，根据距离比例分配时间
          var dists = [locArr[0].distanceTo(prevPt)];
          var sum = dists[0];
          for (var i = 0; i < locArrLen - 1; ++i) {
            dists.push(locArr[i + 1].distanceTo(locArr[i]));
            sum += dists[i + 1];
          }

          for (var i = 0; i < locArrLen; ++i) {
            var currPt = locArr[i];
            var currKeyIndex =
              prevKeyIndex + parseInt((dists[i] / sum) * deltaKeyIndex);

            var currPtForRot = currPt.clone();
            if (!defaultOptions.PitchAllowed) {
              prevPtForRot.y = 0;
              currPtForRot.y = 0;
            }

            var dirV3 = currPtForRot.clone().subtract(prevPtForRot);
            var currRot =
              Math.abs(dirV3.x) < 1.0e-5 &&
              Math.abs(dirV3.y) < 1.0e-5 &&
              Math.abs(dirV3.z) < 1.0e-5
                ? this._prevDirection[mcName]
                : toVector3(await this._getEulerAngle(dirV3.get())); //startPt指向endPt的方向

            if (currKeyIndex > prevKeyIndex + timeForDirAdjustion * fps) {
              //添加用于调整方向的key
              var key = null,
                keyIndex = Math.round(prevKeyIndex + timeForDirAdjustion * fps);
              //添加位移
              key = await asyncHandle(
                transKeyTrack,
                transKeyTrack.addIKey,
                AsyncFunImpl.QMCKey,
                keyIndex
              );
              key.setKeyIPointAsQVector3(prevPt); //同一个位置

              if (!defaultOptions.Heading) {
                //添加旋转
                key = await asyncHandle(
                  rotKeyTrack,
                  rotKeyTrack.addIKey,
                  AsyncFunImpl.QMCKey,
                  keyIndex
                );
                key.setKeyIPointAsQVector3(currRot.get());
              } else {
                //添加旋转
                key = await asyncHandle(
                  rotKeyTrack,
                  rotKeyTrack.addIKey,
                  AsyncFunImpl.QMCKey,
                  keyIndex
                );
                var tmpRot = this._prevDirection[mcName].clone();
                tmpRot.y = defaultOptions.Heading[i];
                key.setKeyIPointAsQVector3(tmpRot.get());
              }
              //保存关键帧
              this._gTrackInfo[mcName].push(keyIndex);

              // 添加下一个key
              // 添加位移
              key = await asyncHandle(
                transKeyTrack,
                transKeyTrack.addIKey,
                AsyncFunImpl.QMCKey,
                currKeyIndex
              );
              key.setKeyIPointAsQVector3(currPt.get());

              //添加旋转
              if (!defaultOptions.Heading) {
                key = await asyncHandle(
                  rotKeyTrack,
                  rotKeyTrack.addIKey,
                  AsyncFunImpl.QMCKey,
                  currKeyIndex
                );
                key.setKeyIPointAsQVector3(currRot.get());
              } else {
                key = await asyncHandle(
                  rotKeyTrack,
                  rotKeyTrack.addIKey,
                  AsyncFunImpl.QMCKey,
                  currKeyIndex
                );
                currRot = this._prevDirection[mcName];
                currRot.y = defaultOptions.Heading[i];
                key.setKeyIPointAsQVector3(currRot.get());
              }
              //保存关键帧
              this._gTrackInfo[mcName].push(currKeyIndex);
              //保存方向
              this._prevDirection[mcName] = currRot;
            }

            prevKeyIndex = currKeyIndex;
            prevPtForRot = currPtForRot;
            prevPt = currPt.get();
          }

          //删除无用的关键帧
          var currFrameNo = await this.currFrame(mci);
          for (
            var index = 0, len = this._gTrackInfo[mcName].length;
            index < len;
            ++index
          ) {
            if (this._gTrackInfo[mcName][index] > currFrameNo) {
              if (index === 0) break;

              for (var j = 0; j < index - 1; ++j) {
                var keyIndex = this._gTrackInfo[mcName][j];
                transKeyTrack.removeKey(keyIndex);
                rotKeyTrack.removeKey(keyIndex);
              }
              this._gTrackInfo[mcName].splice(0, index - 1);
              break;
            }
          }
          mci.play();
        }
        return mci;
      } catch (e) {
        this.showNotice("错误", "startRealtimeTrack: " + e.message, 2000);
        return null;
      }
    },

    // @method stopRealtimeTrack(nodePath: String)
    // 停止节点实时追踪功能
    stopRealtimeTrack: async function(nodePath) {
      var path = nodePath.split("/"),
        nodeName = path[path.length - 1],
        areaName = path[0];

      var mcName = "mc_realtimegpstrack_" + areaName + "_" + nodeName,
        mciName = "mci_realtimegpstrack_" + areaName + "_" + nodeName;

      if (await this.clearMovieClipInstance(mciName)) {
        delete this._gTrackInfo[mcName];
        delete this._prevDirection[mcName];
        if (this._gTrackInfo.length == 0) delete this._gTrackInfo;
        if (this._prevDirection.length == 0) delete this._prevDirection;
      }
    },

    // _addVehicle(nodePath: String, options: Vehicle options): this
    // 往车流动画系统中添加车辆，返回this对象
    _addVehicle: async function(nodePath, options) {
      var defaultCreateOption = {
        Position: null, //Vector3对象
        Orientation: toVector3(0, 0, 0), //Vector3对象
        OrientationType: Enums.nodeOrientationType.Self,
        Mesh: null,
        RoutePtsV3Array: [], //Vector3数组
        Velocity: 400 / 36, //单位：米/秒
        StartTime: 0 //开始时间，相对于基准时间，单位为秒
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        var sNodeCreated = await this.createCommonNode(
          nodePath,
          Enums.sceneNodeType.SNODE_Model
        );
        if (sNodeCreated != null) {
          var modelNode = sNodeCreated.asModel();
          if (defaultCreateOption.Position != null) {
            modelNode.setPosition(defaultCreateOption.Position.get());
          }
          if (defaultCreateOption.Orientation != null) {
            modelNode.setOrientation(
              defaultCreateOption.Orientation.get(),
              defaultCreateOption.OrientationType
            );
          }
          if (defaultCreateOption.Mesh != null) {
            modelNode.setMesh(defaultCreateOption.Mesh);
          }

          var activeCtrlObj = await asyncHandle(
            modelNode,
            modelNode.getActiveCtrlObj,
            AsyncFunImpl.QActiveCtrlObj
          );
          velMeterPerSec = defaultCreateOption.Velocity;

          activeCtrlObj.beginAddKey();
          for (var i = 0; i < defaultCreateOption.RoutePtsV3Array.length; ++i) {
            if (i == 0) {
              activeCtrlObj.addKey(
                defaultCreateOption.StartTime,
                defaultCreateOption.RoutePtsV3Array[i].get()
              );
            } else {
              await asyncHandle(
                activeCtrlObj,
                activeCtrlObj.addKeyByVel,
                AsyncFunImpl.Float,
                velMeterPerSec,
                defaultCreateOption.RoutePtsV3Array[i].get()
              );
            }
          }
          activeCtrlObj.endAddKey();
          activeCtrlObj.setLoop(true);
          activeCtrlObj.setListener(Enums.listenerMsgID.LMID_ACTIVECTRL);
          return modelNode;
        }
        return null;
      } catch (e) {
        this.showNotice("错误", "_addVehicle: " + e.message, 2000);
        return null;
      }
    },

    // @method createOneRoadwayTraffic(roadwayPath: String, options: Roadway Options): Number
    // 创建单车道的简单车流动画，返回跑完道路全程所需时间（单位为秒）（注意车辆的mtr文件中instanced="0"表示不使用实例）
    createOneRoadwayTraffic: async function(roadwayPath, options) {
      var defaultOptions = {
        Velocity: 40, //车速,单位为千米/小时
        RoutePts: [], //表示车道坐标，可以是分号分隔的经纬度坐标字符串或 GlobalVec3d 坐标数组,Vector3坐标数组
        AverageDistance: 5, //平均车距，单位为米
        MinDistance: 5, //最小车距,单位为米
        VehicleMeshArray: [], //车辆模型mesh数组
        IsLabeled: false //是否添加POI
      };

      jQueryExtend(true, defaultOptions, options);
      try {
        var path = roadwayPath.split("/"),
          roadwayName = path[path.length - 1],
          areaName = path[0];

        var parentNodePath = areaName + "/" + roadwayName,
          parentNode = await this.createCommonNode(
            parentNodePath,
            Enums.sceneNodeType.SNODE_Group
          );
        if (!parentNode) return -1;

        //可能的数据转换
        var ptV3Arr = defaultOptions.RoutePts;
        for (let i = 0; i < ptV3Arr.length; i++) {
          if (ptV3Arr[i].getCLSID() == Enums.ValueTypeCLSID.QGlobalVec3d)
            ptV3Arr[i] = toVector3(await ptV3Arr[i].toLocalPos(areaName));
        }

        //计算道路总长
        var totalRoadLen = 0;
        for (let i = 0; i < ptV3Arr.length - 1; i++) {
          let segLen = ptV3Arr[i].distanceTo(ptV3Arr[i + 1]);
          totalRoadLen += segLen;
        }
        var averageDistance = Math.max(
          defaultOptions.AverageDistance,
          defaultOptions.MinDistance
        );
        var velocity = (defaultOptions.Velocity * 1000) / 3600, //转换车速，从千米/小时转换成米/秒
          minTimeInterval = defaultOptions.MinDistance / velocity, //两辆车最小时间间隔
          averageTimeInterval = averageDistance / velocity, //两辆车平均时间间隔
          totalTime = totalRoadLen / velocity, //跑完全程所需时间,单位为秒
          currTime = -minTimeInterval,
          minRandom = minTimeInterval,
          maxRandom = averageTimeInterval * 2 - minTimeInterval,
          id = 0;

        var _getRandomNum = function(minNum, maxNum) {
          var range = maxNum - minNum,
            random = Math.random();
          return minNum + random * range;
        };

        while (currTime < totalTime - minRandom) {
          var nodePath = parentNodePath + "/" + "Vehicle_" + id;
          if (currTime > totalTime - minRandom - maxRandom) {
            currTime = totalTime - minRandom;
          } else {
            currTime = currTime + _getRandomNum(minRandom, maxRandom);
          }

          var initPos = toVector3(
            await toGlobalVec3d(0, 0, 0).toLocalPos(areaName)
          );
          var options = {
            Position: initPos, //模型初始放在很远的地方
            Mesh:
              defaultOptions.VehicleMeshArray[
                Math.floor(Math.random() * defaultOptions.VehicleMeshArray.length)
              ],
            RoutePtsV3Array: ptV3Arr, //QVector3数组
            Velocity: velocity, //单位：米/秒
            StartTime: currTime
          };
          await this._addVehicle(nodePath, options);
          if (defaultOptions.IsLabeled) {
            var poiOptions = {
              POIOptions: {
                FontName: "Arial",
                FontSize: 16,
                FontColor: toColourValue("#ff0000", 1),
                POILayout: Enums.poiLayOut.Left,
                CharScale: 1,
                Text: "Vehicle_" + id,
                FontOutLine: 1, //文字描边宽度
                FontEdgeColor: toColourValue(1, 1, 0.5, 1) //文字描边颜色
              }
            };
            await this.createPOI(
              areaName + "/" + roadwayName + "/Vehicle_" + id + "/POI",
              poiOptions
            );
          }
          ++id;
        }
        return totalTime;
      } catch (e) {
        this.showNotice("错误", "_addVehicle: " + e.message, 20000);
        return null;
      }
    },

    // @method createRoamRoute(nodePath: String, options: RoamRoute Options): QLineNode
    // 绘制场景中节点的指定路线漫游轨迹，返回原生 QLineNode 对象
    createRoamRoute: async function(nodePath, options) {
      var defaultCreateOption = {
        Material: null,
        SpecialTransparent: true, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
        LinePoints: [], //一维数组,由Vector3坐标组成
        OffsetDist: [], //偏移距离，单位米，用于贝塞尔曲线的控制点计算
        LineOptions: {
          Subdivision: 20, //设置生成曲线细分程度
          LineWidth: 2,
          WrapLen: 2,
          //以下用于动态创建的材质
          Color: toColourValue("#0000FF", 1), //线的颜色
          Alpha: 1 //线的透明度
        },
        OnLineCreated: null
      };
      jQueryExtend(true, defaultCreateOption, options);
      try {
        //检查参数
        if (
          defaultCreateOption.LinePoints.length < 2 ||
          (defaultCreateOption.LinePoints.length >= 3 &&
            typeof defaultCreateOption.OffsetDist == "object" &&
            defaultCreateOption.LinePoints.length !=
              defaultCreateOption.OffsetDist.length)
        )
          return null;

        //先过滤相邻的重复的点
        var _lp = [defaultCreateOption.LinePoints[0]],
          _od =
            typeof defaultCreateOption.OffsetDist == "object"
              ? [defaultCreateOption.OffsetDist[0]]
              : [0];
        for (var i = 1; i < defaultCreateOption.LinePoints.length; ++i) {
          if (
            defaultCreateOption.LinePoints[i].equals(
              defaultCreateOption.LinePoints[i - 1]
            )
          )
            continue;

          _lp.push(defaultCreateOption.LinePoints[i]);
          if (typeof defaultCreateOption.OffsetDist == "object")
            _od.push(defaultCreateOption.OffsetDist[i]);
          else {
            if (i == defaultCreateOption.LinePoints.length - 1) _od.push(0);
            else _od.push(defaultCreateOption.OffsetDist);
          }
        }

        //可能的数据转换
        for (let i = 0; i < _lp.length; i++) {
          if (_lp[i].getCLSID() == Enums.ValueTypeCLSID.QGlobalVec3d)
            _lp[i] = toVector3(await _lp[i].toLocalPos(areaName));
        }

        var prevPt, nextPt, currPt, derivedLeftPt, derivedRightPt, diffVec;
        var distToPrev, distToNext, offsetLen;
        var besselPoints = [];
        var coeff = toVector3(1 / 2, 1 / 2, 1 / 2);
        //处理原始点数据，生成用于画贝塞尔曲线的一系列点
        //第一个原始点和最后一个原始点单独处理，避免for循环中每次都要做判断
        besselPoints.push(_lp[0].clone());
        besselPoints.push(
          toVector3(
            (_lp[0].x * 2) / 3,
            (_lp[0].y * 2) / 3,
            (_lp[0].z * 2) / 3
          )
        );
        besselPoints.push(
          toVector3(
            (_lp[0].x * 1) / 3,
            (_lp[0].y * 1) / 3,
            (_lp[0].z * 1) / 3
          )
        );
        for (var i = 1, len = _lp.length; i < len - 1; ++i) {
          if (_od[i] > 0) {
            prevPt = _lp[i - 1]; //Q3D.vector3(_lp[i-1].x, _lp[i-1].y, _lp[i-1].z);
            currPt = _lp[i]; //Q3D.vector3(_lp[i].x, _lp[i].y, _lp[i].z);
            nextPt = _lp[i + 1]; //Q3D.vector3(_lp[i+1].x, _lp[i+1].y, _lp[i+1].z);
            distToPrev = currPt.distanceTo(prevPt);
            offsetLen = 3 * _od[i] < distToPrev ? _od[i] : distToPrev / 3;
            diffVec = prevPt
              .clone()
              .subtract(currPt)
              .scaleBy(
                toVector3(
                  offsetLen / distToPrev,
                  offsetLen / distToPrev,
                  offsetLen / distToPrev
                )
              );
            derivedLeftPt = currPt.clone().add(diffVec);
            distToNext = nextPt.distanceTo(currPt);
            offsetLen = 3 * _od[i] < distToNext ? _od[i] : distToNext / 3;
            diffVec = nextPt
              .clone()
              .subtract(currPt)
              .scaleBy(
                toVector3(
                  offsetLen / distToNext,
                  offsetLen / distToNext,
                  offsetLen / distToNext
                )
              );
            derivedRightPt = currPt.clone().add(diffVec);

            var num = besselPoints.length;
            besselPoints[num - 2] = besselPoints[num - 2].add(
              toVector3(
                (derivedLeftPt.x * 1) / 3,
                (derivedLeftPt.y * 1) / 3,
                (derivedLeftPt.z * 1) / 3
              ).get()
            );
            besselPoints[num - 1] = besselPoints[num - 1].add(
              toVector3(
                (derivedLeftPt.x * 2) / 3,
                (derivedLeftPt.y * 2) / 3,
                (derivedLeftPt.z * 2) / 3
              ).get()
            );
            besselPoints.push(derivedLeftPt);
            besselPoints.push(
              derivedLeftPt
                .clone()
                .add(currPt)
                .scaleBy(coeff)
            );
            besselPoints.push(
              derivedRightPt
                .clone()
                .add(currPt)
                .scaleBy(coeff)
            );
            besselPoints.push(derivedRightPt);
            besselPoints.push(
              toVector3(
                (derivedRightPt.x * 2) / 3,
                (derivedRightPt.y * 2) / 3,
                (derivedRightPt.z * 2) / 3
              )
            );
            besselPoints.push(
              toVector3(
                (derivedRightPt.x * 1) / 3,
                (derivedRightPt.y * 1) / 3,
                (derivedRightPt.z * 1) / 3
              )
            );
          } else {
            var num = besselPoints.length;
            besselPoints[num - 2] = besselPoints[num - 2].add(
              toVector3(
                (_lp[i].x * 1) / 3,
                (_lp[i].y * 1) / 3,
                (_lp[i].z * 1) / 3
              )
            );
            besselPoints[num - 1] = besselPoints[num - 1].add(
              toVector3(
                (_lp[i].x * 2) / 3,
                (_lp[i].y * 2) / 3,
                (_lp[i].z * 2) / 3
              )
            );
            besselPoints.push(_lp[i].clone());
            besselPoints.push(
              toVector3(
                (_lp[i].x * 2) / 3,
                (_lp[i].y * 2) / 3,
                (_lp[i].z * 2) / 3
              )
            );
            besselPoints.push(
              toVector3(
                (_lp[i].x * 1) / 3,
                (_lp[i].y * 1) / 3,
                (_lp[i].z * 1) / 3
              )
            );
          }
        }
        var num = besselPoints.length,
          i = len - 1;
        besselPoints[num - 2] = besselPoints[num - 2].add(
          toVector3(
            (_lp[i].x * 1) / 3,
            (_lp[i].y * 1) / 3,
            (_lp[i].z * 1) / 3
          )
        );
        besselPoints[num - 1] = besselPoints[num - 1].add(
          toVector3(
            (_lp[i].x * 2) / 3,
            (_lp[i].y * 2) / 3,
            (_lp[i].z * 2) / 3
          )
        );
        besselPoints.push(_lp[i].clone());
        //数据处理完毕，开始画线
        var createOptions = {
          Material: defaultCreateOption.Material,
          SpecialTransparent: defaultCreateOption.SpecialTransparent, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
          LinePoints: [besselPoints],
          LineOptions: {
            LineType: Enums.lineType.Bessel,
            BesselDim: 3, //贝塞尔曲线阶数
            Subdivision: defaultCreateOption.LineOptions.Subdivision, //设置生成曲线细分程度
            LineWidth: defaultCreateOption.LineOptions.LineWidth,
            WrapLen: defaultCreateOption.LineOptions.WrapLen,
            //以下用于动态创建的材质
            Color: defaultCreateOption.LineOptions.Color, //线的颜色
            Alpha: defaultCreateOption.LineOptions.Alpha //线的透明度
          },
          OnLineCreated: defaultCreateOption.OnLineCreated
        };
        return await this.createPolyline(nodePath, createOptions);
      } catch (e) {
        this.showNotice("错误", "createRoamRoute: " + e.message, 2000);
        return null;
      }
    }
  });

  exports.ArcVertex = ArcVertex;
  exports.Browser = Browser;
  exports.Class = Class;
  exports.ColourValue = ColourValue;
  exports.DomEvent = DomEvent;
  exports.DomUtil = DomUtil;
  exports.Enums = Enums;
  exports.Evented = Evented;
  exports.GlobalCamera = GlobalCamera;
  exports.GlobalVec3d = GlobalVec3d;
  exports.Handler = Handler;
  exports.InputManager = InputManager;
  exports.LayerGroup = LayerGroup;
  exports.Map = Map;
  exports.Mixin = Mixin;
  exports.SceneNode = SceneNode;
  exports.Util = Util;
  exports.Vector2 = Vector2;
  exports.Vector2I = Vector2I;
  exports.Vector3 = Vector3;
  exports.Vector3d = Vector3d;
  exports.arcVertex = toArcVertex;
  exports.bind = bind;
  exports.colourValue = toColourValue;
  exports.extend = extend;
  exports.globalCamera = getGlobalCamera;
  exports.globalVec3d = toGlobalVec3d;
  exports.inputManager = getInputManager;
  exports.layerGroup = getLayerGroup;
  exports.map = createMap;
  exports.sceneNode = getSceneNode;
  exports.setOptions = setOptions;
  exports.stamp = stamp;
  exports.updateOptions = updateOptions;
  exports.vector2 = toVector2;
  exports.vector2I = toVector2I;
  exports.vector3 = toVector3;
  exports.vector3d = toVector3d;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

  var oldQ3D = window.Q3D;
  exports.noConflict = function() {
  	window.Q3D = oldQ3D;
  	return this;
  }

  // Always export us to window global (see #2364)
  window.Q3D = exports;

})));
//# sourceMappingURL=q3d-src.js.map
