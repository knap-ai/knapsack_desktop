import { a as __require, t as __commonJSMin } from "./chunk-iyeSoAlh.js";
import { i as require_type, n as require_get_intrinsic, r as require_call_bind_apply_helpers } from "./form_data-B-EvgmSl.js";
import { t as require_http } from "./http-Bh-HtMAg.js";
//#region node_modules/@microsoft/teams.api/dist/clients/api-client-settings.js
var require_api_client_settings = /* @__PURE__ */ __commonJSMin(((exports) => {
	const DEFAULT_API_CLIENT_SETTINGS = { oauthUrl: "https://token.botframework.com" };
	function mergeApiClientSettings(apiClientSettings) {
		const env = typeof process === "undefined" ? void 0 : process.env;
		return { oauthUrl: apiClientSettings?.oauthUrl ?? env?.OAUTH_URL ?? DEFAULT_API_CLIENT_SETTINGS.oauthUrl };
	}
	exports.DEFAULT_API_CLIENT_SETTINGS = DEFAULT_API_CLIENT_SETTINGS;
	exports.mergeApiClientSettings = mergeApiClientSettings;
}));
//#endregion
//#region node_modules/object-inspect/util.inspect.js
var require_util_inspect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = __require("util").inspect;
}));
//#endregion
//#region node_modules/object-inspect/index.js
var require_object_inspect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hasMap = typeof Map === "function" && Map.prototype;
	var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
	var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
	var mapForEach = hasMap && Map.prototype.forEach;
	var hasSet = typeof Set === "function" && Set.prototype;
	var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
	var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
	var setForEach = hasSet && Set.prototype.forEach;
	var weakMapHas = typeof WeakMap === "function" && WeakMap.prototype ? WeakMap.prototype.has : null;
	var weakSetHas = typeof WeakSet === "function" && WeakSet.prototype ? WeakSet.prototype.has : null;
	var weakRefDeref = typeof WeakRef === "function" && WeakRef.prototype ? WeakRef.prototype.deref : null;
	var booleanValueOf = Boolean.prototype.valueOf;
	var objectToString = Object.prototype.toString;
	var functionToString = Function.prototype.toString;
	var $match = String.prototype.match;
	var $slice = String.prototype.slice;
	var $replace = String.prototype.replace;
	var $toUpperCase = String.prototype.toUpperCase;
	var $toLowerCase = String.prototype.toLowerCase;
	var $test = RegExp.prototype.test;
	var $concat = Array.prototype.concat;
	var $join = Array.prototype.join;
	var $arrSlice = Array.prototype.slice;
	var $floor = Math.floor;
	var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
	var gOPS = Object.getOwnPropertySymbols;
	var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
	var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
	var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
		return O.__proto__;
	} : null);
	function addNumericSeparator(num, str) {
		if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) return str;
		var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
		if (typeof num === "number") {
			var int = num < 0 ? -$floor(-num) : $floor(num);
			if (int !== num) {
				var intStr = String(int);
				var dec = $slice.call(str, intStr.length + 1);
				return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
			}
		}
		return $replace.call(str, sepRegex, "$&_");
	}
	var utilInspect = require_util_inspect();
	var inspectCustom = utilInspect.custom;
	var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
	var quotes = {
		__proto__: null,
		"double": "\"",
		single: "'"
	};
	var quoteREs = {
		__proto__: null,
		"double": /(["\\])/g,
		single: /(['\\])/g
	};
	module.exports = function inspect_(obj, options, depth, seen) {
		var opts = options || {};
		if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) throw new TypeError("option \"quoteStyle\" must be \"single\" or \"double\"");
		if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) throw new TypeError("option \"maxStringLength\", if provided, must be a positive integer, Infinity, or `null`");
		var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
		if (typeof customInspect !== "boolean" && customInspect !== "symbol") throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
		if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) throw new TypeError("option \"indent\" must be \"\\t\", an integer > 0, or `null`");
		if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") throw new TypeError("option \"numericSeparator\", if provided, must be `true` or `false`");
		var numericSeparator = opts.numericSeparator;
		if (typeof obj === "undefined") return "undefined";
		if (obj === null) return "null";
		if (typeof obj === "boolean") return obj ? "true" : "false";
		if (typeof obj === "string") return inspectString(obj, opts);
		if (typeof obj === "number") {
			if (obj === 0) return Infinity / obj > 0 ? "0" : "-0";
			var str = String(obj);
			return numericSeparator ? addNumericSeparator(obj, str) : str;
		}
		if (typeof obj === "bigint") {
			var bigIntStr = String(obj) + "n";
			return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
		}
		var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
		if (typeof depth === "undefined") depth = 0;
		if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") return isArray(obj) ? "[Array]" : "[Object]";
		var indent = getIndent(opts, depth);
		if (typeof seen === "undefined") seen = [];
		else if (indexOf(seen, obj) >= 0) return "[Circular]";
		function inspect(value, from, noIndent) {
			if (from) {
				seen = $arrSlice.call(seen);
				seen.push(from);
			}
			if (noIndent) {
				var newOpts = { depth: opts.depth };
				if (has(opts, "quoteStyle")) newOpts.quoteStyle = opts.quoteStyle;
				return inspect_(value, newOpts, depth + 1, seen);
			}
			return inspect_(value, opts, depth + 1, seen);
		}
		if (typeof obj === "function" && !isRegExp(obj)) {
			var name = nameOf(obj);
			var keys = arrObjKeys(obj, inspect);
			return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
		}
		if (isSymbol(obj)) {
			var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
			return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
		}
		if (isElement(obj)) {
			var s = "<" + $toLowerCase.call(String(obj.nodeName));
			var attrs = obj.attributes || [];
			for (var i = 0; i < attrs.length; i++) s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
			s += ">";
			if (obj.childNodes && obj.childNodes.length) s += "...";
			s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
			return s;
		}
		if (isArray(obj)) {
			if (obj.length === 0) return "[]";
			var xs = arrObjKeys(obj, inspect);
			if (indent && !singleLineValues(xs)) return "[" + indentedJoin(xs, indent) + "]";
			return "[ " + $join.call(xs, ", ") + " ]";
		}
		if (isError(obj)) {
			var parts = arrObjKeys(obj, inspect);
			if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
			if (parts.length === 0) return "[" + String(obj) + "]";
			return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
		}
		if (typeof obj === "object" && customInspect) {
			if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) return utilInspect(obj, { depth: maxDepth - depth });
			else if (customInspect !== "symbol" && typeof obj.inspect === "function") return obj.inspect();
		}
		if (isMap(obj)) {
			var mapParts = [];
			if (mapForEach) mapForEach.call(obj, function(value, key) {
				mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
			});
			return collectionOf("Map", mapSize.call(obj), mapParts, indent);
		}
		if (isSet(obj)) {
			var setParts = [];
			if (setForEach) setForEach.call(obj, function(value) {
				setParts.push(inspect(value, obj));
			});
			return collectionOf("Set", setSize.call(obj), setParts, indent);
		}
		if (isWeakMap(obj)) return weakCollectionOf("WeakMap");
		if (isWeakSet(obj)) return weakCollectionOf("WeakSet");
		if (isWeakRef(obj)) return weakCollectionOf("WeakRef");
		if (isNumber(obj)) return markBoxed(inspect(Number(obj)));
		if (isBigInt(obj)) return markBoxed(inspect(bigIntValueOf.call(obj)));
		if (isBoolean(obj)) return markBoxed(booleanValueOf.call(obj));
		if (isString(obj)) return markBoxed(inspect(String(obj)));
		if (typeof window !== "undefined" && obj === window) return "{ [object Window] }";
		if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) return "{ [object globalThis] }";
		if (!isDate(obj) && !isRegExp(obj)) {
			var ys = arrObjKeys(obj, inspect);
			var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
			var protoTag = obj instanceof Object ? "" : "null prototype";
			var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
			var tag = (isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "") + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
			if (ys.length === 0) return tag + "{}";
			if (indent) return tag + "{" + indentedJoin(ys, indent) + "}";
			return tag + "{ " + $join.call(ys, ", ") + " }";
		}
		return String(obj);
	};
	function wrapQuotes(s, defaultStyle, opts) {
		var quoteChar = quotes[opts.quoteStyle || defaultStyle];
		return quoteChar + s + quoteChar;
	}
	function quote(s) {
		return $replace.call(String(s), /"/g, "&quot;");
	}
	function canTrustToString(obj) {
		return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
	}
	function isArray(obj) {
		return toStr(obj) === "[object Array]" && canTrustToString(obj);
	}
	function isDate(obj) {
		return toStr(obj) === "[object Date]" && canTrustToString(obj);
	}
	function isRegExp(obj) {
		return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
	}
	function isError(obj) {
		return toStr(obj) === "[object Error]" && canTrustToString(obj);
	}
	function isString(obj) {
		return toStr(obj) === "[object String]" && canTrustToString(obj);
	}
	function isNumber(obj) {
		return toStr(obj) === "[object Number]" && canTrustToString(obj);
	}
	function isBoolean(obj) {
		return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
	}
	function isSymbol(obj) {
		if (hasShammedSymbols) return obj && typeof obj === "object" && obj instanceof Symbol;
		if (typeof obj === "symbol") return true;
		if (!obj || typeof obj !== "object" || !symToString) return false;
		try {
			symToString.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	function isBigInt(obj) {
		if (!obj || typeof obj !== "object" || !bigIntValueOf) return false;
		try {
			bigIntValueOf.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	var hasOwn = Object.prototype.hasOwnProperty || function(key) {
		return key in this;
	};
	function has(obj, key) {
		return hasOwn.call(obj, key);
	}
	function toStr(obj) {
		return objectToString.call(obj);
	}
	function nameOf(f) {
		if (f.name) return f.name;
		var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
		if (m) return m[1];
		return null;
	}
	function indexOf(xs, x) {
		if (xs.indexOf) return xs.indexOf(x);
		for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
		return -1;
	}
	function isMap(x) {
		if (!mapSize || !x || typeof x !== "object") return false;
		try {
			mapSize.call(x);
			try {
				setSize.call(x);
			} catch (s) {
				return true;
			}
			return x instanceof Map;
		} catch (e) {}
		return false;
	}
	function isWeakMap(x) {
		if (!weakMapHas || !x || typeof x !== "object") return false;
		try {
			weakMapHas.call(x, weakMapHas);
			try {
				weakSetHas.call(x, weakSetHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakMap;
		} catch (e) {}
		return false;
	}
	function isWeakRef(x) {
		if (!weakRefDeref || !x || typeof x !== "object") return false;
		try {
			weakRefDeref.call(x);
			return true;
		} catch (e) {}
		return false;
	}
	function isSet(x) {
		if (!setSize || !x || typeof x !== "object") return false;
		try {
			setSize.call(x);
			try {
				mapSize.call(x);
			} catch (m) {
				return true;
			}
			return x instanceof Set;
		} catch (e) {}
		return false;
	}
	function isWeakSet(x) {
		if (!weakSetHas || !x || typeof x !== "object") return false;
		try {
			weakSetHas.call(x, weakSetHas);
			try {
				weakMapHas.call(x, weakMapHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakSet;
		} catch (e) {}
		return false;
	}
	function isElement(x) {
		if (!x || typeof x !== "object") return false;
		if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) return true;
		return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
	}
	function inspectString(str, opts) {
		if (str.length > opts.maxStringLength) {
			var remaining = str.length - opts.maxStringLength;
			var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
			return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
		}
		var quoteRE = quoteREs[opts.quoteStyle || "single"];
		quoteRE.lastIndex = 0;
		return wrapQuotes($replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte), "single", opts);
	}
	function lowbyte(c) {
		var n = c.charCodeAt(0);
		var x = {
			8: "b",
			9: "t",
			10: "n",
			12: "f",
			13: "r"
		}[n];
		if (x) return "\\" + x;
		return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
	}
	function markBoxed(str) {
		return "Object(" + str + ")";
	}
	function weakCollectionOf(type) {
		return type + " { ? }";
	}
	function collectionOf(type, size, entries, indent) {
		var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
		return type + " (" + size + ") {" + joinedEntries + "}";
	}
	function singleLineValues(xs) {
		for (var i = 0; i < xs.length; i++) if (indexOf(xs[i], "\n") >= 0) return false;
		return true;
	}
	function getIndent(opts, depth) {
		var baseIndent;
		if (opts.indent === "	") baseIndent = "	";
		else if (typeof opts.indent === "number" && opts.indent > 0) baseIndent = $join.call(Array(opts.indent + 1), " ");
		else return null;
		return {
			base: baseIndent,
			prev: $join.call(Array(depth + 1), baseIndent)
		};
	}
	function indentedJoin(xs, indent) {
		if (xs.length === 0) return "";
		var lineJoiner = "\n" + indent.prev + indent.base;
		return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
	}
	function arrObjKeys(obj, inspect) {
		var isArr = isArray(obj);
		var xs = [];
		if (isArr) {
			xs.length = obj.length;
			for (var i = 0; i < obj.length; i++) xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
		}
		var syms = typeof gOPS === "function" ? gOPS(obj) : [];
		var symMap;
		if (hasShammedSymbols) {
			symMap = {};
			for (var k = 0; k < syms.length; k++) symMap["$" + syms[k]] = syms[k];
		}
		for (var key in obj) {
			if (!has(obj, key)) continue;
			if (isArr && String(Number(key)) === key && key < obj.length) continue;
			if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) continue;
			else if ($test.call(/[^\w$]/, key)) xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
			else xs.push(key + ": " + inspect(obj[key], obj));
		}
		if (typeof gOPS === "function") {
			for (var j = 0; j < syms.length; j++) if (isEnumerable.call(obj, syms[j])) xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
		}
		return xs;
	}
}));
//#endregion
//#region node_modules/side-channel-list/index.js
var require_side_channel_list = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var inspect = require_object_inspect();
	var $TypeError = require_type();
	/** @type {import('./list.d.ts').listGetNode} */
	var listGetNode = function(list, key, isDelete) {
		/** @type {typeof list | NonNullable<(typeof list)['next']>} */
		var prev = list;
		/** @type {(typeof list)['next']} */
		var curr;
		for (; (curr = prev.next) != null; prev = curr) if (curr.key === key) {
			prev.next = curr.next;
			if (!isDelete) {
				curr.next = list.next;
				list.next = curr;
			}
			return curr;
		}
	};
	/** @type {import('./list.d.ts').listGet} */
	var listGet = function(objects, key) {
		if (!objects) return;
		var node = listGetNode(objects, key);
		return node && node.value;
	};
	/** @type {import('./list.d.ts').listSet} */
	var listSet = function(objects, key, value) {
		var node = listGetNode(objects, key);
		if (node) node.value = value;
		else objects.next = {
			key,
			next: objects.next,
			value
		};
	};
	/** @type {import('./list.d.ts').listHas} */
	var listHas = function(objects, key) {
		if (!objects) return false;
		return !!listGetNode(objects, key);
	};
	/** @type {import('./list.d.ts').listDelete} */
	var listDelete = function(objects, key) {
		if (objects) return listGetNode(objects, key, true);
	};
	/** @type {import('.')} */
	module.exports = function getSideChannelList() {
		/** @typedef {ReturnType<typeof getSideChannelList>} Channel */
		/** @typedef {Parameters<Channel['get']>[0]} K */
		/** @typedef {Parameters<Channel['set']>[1]} V */
		/** @type {import('./list.d.ts').RootNode<V, K> | undefined} */ var $o;
		/** @type {Channel} */
		var channel = {
			assert: function(key) {
				if (!channel.has(key)) throw new $TypeError("Side channel does not contain " + inspect(key));
			},
			"delete": function(key) {
				var root = $o && $o.next;
				var deletedNode = listDelete($o, key);
				if (deletedNode && root && root === deletedNode) $o = void 0;
				return !!deletedNode;
			},
			get: function(key) {
				return listGet($o, key);
			},
			has: function(key) {
				return listHas($o, key);
			},
			set: function(key, value) {
				if (!$o) $o = { next: void 0 };
				listSet($o, key, value);
			}
		};
		return channel;
	};
}));
//#endregion
//#region node_modules/call-bound/index.js
var require_call_bound = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var GetIntrinsic = require_get_intrinsic();
	var callBindBasic = require_call_bind_apply_helpers();
	/** @type {(thisArg: string, searchString: string, position?: number) => number} */
	var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
	/** @type {import('.')} */
	module.exports = function callBoundIntrinsic(name, allowMissing) {
		var intrinsic = GetIntrinsic(name, !!allowMissing);
		if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) return callBindBasic([intrinsic]);
		return intrinsic;
	};
}));
//#endregion
//#region node_modules/side-channel-map/index.js
var require_side_channel_map = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var GetIntrinsic = require_get_intrinsic();
	var callBound = require_call_bound();
	var inspect = require_object_inspect();
	var $TypeError = require_type();
	var $Map = GetIntrinsic("%Map%", true);
	/** @type {<K, V>(thisArg: Map<K, V>, key: K) => V} */
	var $mapGet = callBound("Map.prototype.get", true);
	/** @type {<K, V>(thisArg: Map<K, V>, key: K, value: V) => void} */
	var $mapSet = callBound("Map.prototype.set", true);
	/** @type {<K, V>(thisArg: Map<K, V>, key: K) => boolean} */
	var $mapHas = callBound("Map.prototype.has", true);
	/** @type {<K, V>(thisArg: Map<K, V>, key: K) => boolean} */
	var $mapDelete = callBound("Map.prototype.delete", true);
	/** @type {<K, V>(thisArg: Map<K, V>) => number} */
	var $mapSize = callBound("Map.prototype.size", true);
	/** @type {import('.')} */
	module.exports = !!$Map && function getSideChannelMap() {
		/** @typedef {ReturnType<typeof getSideChannelMap>} Channel */
		/** @typedef {Parameters<Channel['get']>[0]} K */
		/** @typedef {Parameters<Channel['set']>[1]} V */
		/** @type {Map<K, V> | undefined} */ var $m;
		/** @type {Channel} */
		var channel = {
			assert: function(key) {
				if (!channel.has(key)) throw new $TypeError("Side channel does not contain " + inspect(key));
			},
			"delete": function(key) {
				if ($m) {
					var result = $mapDelete($m, key);
					if ($mapSize($m) === 0) $m = void 0;
					return result;
				}
				return false;
			},
			get: function(key) {
				if ($m) return $mapGet($m, key);
			},
			has: function(key) {
				if ($m) return $mapHas($m, key);
				return false;
			},
			set: function(key, value) {
				if (!$m) $m = new $Map();
				$mapSet($m, key, value);
			}
		};
		return channel;
	};
}));
//#endregion
//#region node_modules/side-channel-weakmap/index.js
var require_side_channel_weakmap = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var GetIntrinsic = require_get_intrinsic();
	var callBound = require_call_bound();
	var inspect = require_object_inspect();
	var getSideChannelMap = require_side_channel_map();
	var $TypeError = require_type();
	var $WeakMap = GetIntrinsic("%WeakMap%", true);
	/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => V} */
	var $weakMapGet = callBound("WeakMap.prototype.get", true);
	/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K, value: V) => void} */
	var $weakMapSet = callBound("WeakMap.prototype.set", true);
	/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
	var $weakMapHas = callBound("WeakMap.prototype.has", true);
	/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
	var $weakMapDelete = callBound("WeakMap.prototype.delete", true);
	/** @type {import('.')} */
	module.exports = $WeakMap ? function getSideChannelWeakMap() {
		/** @typedef {ReturnType<typeof getSideChannelWeakMap>} Channel */
		/** @typedef {Parameters<Channel['get']>[0]} K */
		/** @typedef {Parameters<Channel['set']>[1]} V */
		/** @type {WeakMap<K & object, V> | undefined} */ var $wm;
		/** @type {Channel | undefined} */ var $m;
		/** @type {Channel} */
		var channel = {
			assert: function(key) {
				if (!channel.has(key)) throw new $TypeError("Side channel does not contain " + inspect(key));
			},
			"delete": function(key) {
				if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
					if ($wm) return $weakMapDelete($wm, key);
				} else if (getSideChannelMap) {
					if ($m) return $m["delete"](key);
				}
				return false;
			},
			get: function(key) {
				if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
					if ($wm) return $weakMapGet($wm, key);
				}
				return $m && $m.get(key);
			},
			has: function(key) {
				if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
					if ($wm) return $weakMapHas($wm, key);
				}
				return !!$m && $m.has(key);
			},
			set: function(key, value) {
				if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
					if (!$wm) $wm = new $WeakMap();
					$weakMapSet($wm, key, value);
				} else if (getSideChannelMap) {
					if (!$m) $m = getSideChannelMap();
					/** @type {NonNullable<typeof $m>} */ $m.set(key, value);
				}
			}
		};
		return channel;
	} : getSideChannelMap;
}));
//#endregion
//#region node_modules/side-channel/index.js
var require_side_channel = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var $TypeError = require_type();
	var inspect = require_object_inspect();
	var getSideChannelList = require_side_channel_list();
	var getSideChannelMap = require_side_channel_map();
	var makeChannel = require_side_channel_weakmap() || getSideChannelMap || getSideChannelList;
	/** @type {import('.')} */
	module.exports = function getSideChannel() {
		/** @typedef {ReturnType<typeof getSideChannel>} Channel */
		/** @type {Channel | undefined} */ var $channelData;
		/** @type {Channel} */
		var channel = {
			assert: function(key) {
				if (!channel.has(key)) throw new $TypeError("Side channel does not contain " + inspect(key));
			},
			"delete": function(key) {
				return !!$channelData && $channelData["delete"](key);
			},
			get: function(key) {
				return $channelData && $channelData.get(key);
			},
			has: function(key) {
				return !!$channelData && $channelData.has(key);
			},
			set: function(key, value) {
				if (!$channelData) $channelData = makeChannel();
				$channelData.set(key, value);
			}
		};
		return channel;
	};
}));
//#endregion
//#region node_modules/qs/lib/formats.js
var require_formats = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var replace = String.prototype.replace;
	var percentTwenties = /%20/g;
	var Format = {
		RFC1738: "RFC1738",
		RFC3986: "RFC3986"
	};
	module.exports = {
		"default": Format.RFC3986,
		formatters: {
			RFC1738: function(value) {
				return replace.call(value, percentTwenties, "+");
			},
			RFC3986: function(value) {
				return String(value);
			}
		},
		RFC1738: Format.RFC1738,
		RFC3986: Format.RFC3986
	};
}));
//#endregion
//#region node_modules/qs/lib/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var formats = require_formats();
	var getSideChannel = require_side_channel();
	var has = Object.prototype.hasOwnProperty;
	var isArray = Array.isArray;
	var overflowChannel = getSideChannel();
	var markOverflow = function markOverflow(obj, maxIndex) {
		overflowChannel.set(obj, maxIndex);
		return obj;
	};
	var isOverflow = function isOverflow(obj) {
		return overflowChannel.has(obj);
	};
	var getMaxIndex = function getMaxIndex(obj) {
		return overflowChannel.get(obj);
	};
	var setMaxIndex = function setMaxIndex(obj, maxIndex) {
		overflowChannel.set(obj, maxIndex);
	};
	var hexTable = function() {
		var array = [];
		for (var i = 0; i < 256; ++i) array[array.length] = "%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase();
		return array;
	}();
	var compactQueue = function compactQueue(queue) {
		while (queue.length > 1) {
			var item = queue.pop();
			var obj = item.obj[item.prop];
			if (isArray(obj)) {
				var compacted = [];
				for (var j = 0; j < obj.length; ++j) if (typeof obj[j] !== "undefined") compacted[compacted.length] = obj[j];
				item.obj[item.prop] = compacted;
			}
		}
	};
	var arrayToObject = function arrayToObject(source, options) {
		var obj = options && options.plainObjects ? { __proto__: null } : {};
		for (var i = 0; i < source.length; ++i) if (typeof source[i] !== "undefined") obj[i] = source[i];
		return obj;
	};
	var merge = function merge(target, source, options) {
		if (!source) return target;
		if (typeof source !== "object" && typeof source !== "function") {
			if (isArray(target)) {
				var nextIndex = target.length;
				if (options && typeof options.arrayLimit === "number" && nextIndex > options.arrayLimit) return markOverflow(arrayToObject(target.concat(source), options), nextIndex);
				target[nextIndex] = source;
			} else if (target && typeof target === "object") {
				if (isOverflow(target)) {
					var newIndex = getMaxIndex(target) + 1;
					target[newIndex] = source;
					setMaxIndex(target, newIndex);
				} else if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) target[source] = true;
			} else return [target, source];
			return target;
		}
		if (!target || typeof target !== "object") {
			if (isOverflow(source)) {
				var sourceKeys = Object.keys(source);
				var result = options && options.plainObjects ? {
					__proto__: null,
					0: target
				} : { 0: target };
				for (var m = 0; m < sourceKeys.length; m++) {
					var oldKey = parseInt(sourceKeys[m], 10);
					result[oldKey + 1] = source[sourceKeys[m]];
				}
				return markOverflow(result, getMaxIndex(source) + 1);
			}
			var combined = [target].concat(source);
			if (options && typeof options.arrayLimit === "number" && combined.length > options.arrayLimit) return markOverflow(arrayToObject(combined, options), combined.length - 1);
			return combined;
		}
		var mergeTarget = target;
		if (isArray(target) && !isArray(source)) mergeTarget = arrayToObject(target, options);
		if (isArray(target) && isArray(source)) {
			source.forEach(function(item, i) {
				if (has.call(target, i)) {
					var targetItem = target[i];
					if (targetItem && typeof targetItem === "object" && item && typeof item === "object") target[i] = merge(targetItem, item, options);
					else target[target.length] = item;
				} else target[i] = item;
			});
			return target;
		}
		return Object.keys(source).reduce(function(acc, key) {
			var value = source[key];
			if (has.call(acc, key)) acc[key] = merge(acc[key], value, options);
			else acc[key] = value;
			if (isOverflow(source) && !isOverflow(acc)) markOverflow(acc, getMaxIndex(source));
			if (isOverflow(acc)) {
				var keyNum = parseInt(key, 10);
				if (String(keyNum) === key && keyNum >= 0 && keyNum > getMaxIndex(acc)) setMaxIndex(acc, keyNum);
			}
			return acc;
		}, mergeTarget);
	};
	var assign = function assignSingleSource(target, source) {
		return Object.keys(source).reduce(function(acc, key) {
			acc[key] = source[key];
			return acc;
		}, target);
	};
	var decode = function(str, defaultDecoder, charset) {
		var strWithoutPlus = str.replace(/\+/g, " ");
		if (charset === "iso-8859-1") return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
		try {
			return decodeURIComponent(strWithoutPlus);
		} catch (e) {
			return strWithoutPlus;
		}
	};
	var limit = 1024;
	module.exports = {
		arrayToObject,
		assign,
		combine: function combine(a, b, arrayLimit, plainObjects) {
			if (isOverflow(a)) {
				var newIndex = getMaxIndex(a) + 1;
				a[newIndex] = b;
				setMaxIndex(a, newIndex);
				return a;
			}
			var result = [].concat(a, b);
			if (result.length > arrayLimit) return markOverflow(arrayToObject(result, { plainObjects }), result.length - 1);
			return result;
		},
		compact: function compact(value) {
			var queue = [{
				obj: { o: value },
				prop: "o"
			}];
			var refs = [];
			for (var i = 0; i < queue.length; ++i) {
				var item = queue[i];
				var obj = item.obj[item.prop];
				var keys = Object.keys(obj);
				for (var j = 0; j < keys.length; ++j) {
					var key = keys[j];
					var val = obj[key];
					if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
						queue[queue.length] = {
							obj,
							prop: key
						};
						refs[refs.length] = val;
					}
				}
			}
			compactQueue(queue);
			return value;
		},
		decode,
		encode: function encode(str, defaultEncoder, charset, kind, format) {
			if (str.length === 0) return str;
			var string = str;
			if (typeof str === "symbol") string = Symbol.prototype.toString.call(str);
			else if (typeof str !== "string") string = String(str);
			if (charset === "iso-8859-1") return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
				return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
			});
			var out = "";
			for (var j = 0; j < string.length; j += limit) {
				var segment = string.length >= limit ? string.slice(j, j + limit) : string;
				var arr = [];
				for (var i = 0; i < segment.length; ++i) {
					var c = segment.charCodeAt(i);
					if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats.RFC1738 && (c === 40 || c === 41)) {
						arr[arr.length] = segment.charAt(i);
						continue;
					}
					if (c < 128) {
						arr[arr.length] = hexTable[c];
						continue;
					}
					if (c < 2048) {
						arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
						continue;
					}
					if (c < 55296 || c >= 57344) {
						arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
						continue;
					}
					i += 1;
					c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
					arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
				}
				out += arr.join("");
			}
			return out;
		},
		isBuffer: function isBuffer(obj) {
			if (!obj || typeof obj !== "object") return false;
			return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
		},
		isOverflow,
		isRegExp: function isRegExp(obj) {
			return Object.prototype.toString.call(obj) === "[object RegExp]";
		},
		markOverflow,
		maybeMap: function maybeMap(val, fn) {
			if (isArray(val)) {
				var mapped = [];
				for (var i = 0; i < val.length; i += 1) mapped[mapped.length] = fn(val[i]);
				return mapped;
			}
			return fn(val);
		},
		merge
	};
}));
//#endregion
//#region node_modules/qs/lib/stringify.js
var require_stringify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getSideChannel = require_side_channel();
	var utils = require_utils$1();
	var formats = require_formats();
	var has = Object.prototype.hasOwnProperty;
	var arrayPrefixGenerators = {
		brackets: function brackets(prefix) {
			return prefix + "[]";
		},
		comma: "comma",
		indices: function indices(prefix, key) {
			return prefix + "[" + key + "]";
		},
		repeat: function repeat(prefix) {
			return prefix;
		}
	};
	var isArray = Array.isArray;
	var push = Array.prototype.push;
	var pushToArray = function(arr, valueOrArray) {
		push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
	};
	var toISO = Date.prototype.toISOString;
	var defaultFormat = formats["default"];
	var defaults = {
		addQueryPrefix: false,
		allowDots: false,
		allowEmptyArrays: false,
		arrayFormat: "indices",
		charset: "utf-8",
		charsetSentinel: false,
		commaRoundTrip: false,
		delimiter: "&",
		encode: true,
		encodeDotInKeys: false,
		encoder: utils.encode,
		encodeValuesOnly: false,
		filter: void 0,
		format: defaultFormat,
		formatter: formats.formatters[defaultFormat],
		indices: false,
		serializeDate: function serializeDate(date) {
			return toISO.call(date);
		},
		skipNulls: false,
		strictNullHandling: false
	};
	var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
		return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
	};
	var sentinel = {};
	var stringify = function stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
		var obj = object;
		var tmpSc = sideChannel;
		var step = 0;
		var findFlag = false;
		while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
			var pos = tmpSc.get(object);
			step += 1;
			if (typeof pos !== "undefined") if (pos === step) throw new RangeError("Cyclic object value");
			else findFlag = true;
			if (typeof tmpSc.get(sentinel) === "undefined") step = 0;
		}
		if (typeof filter === "function") obj = filter(prefix, obj);
		else if (obj instanceof Date) obj = serializeDate(obj);
		else if (generateArrayPrefix === "comma" && isArray(obj)) obj = utils.maybeMap(obj, function(value) {
			if (value instanceof Date) return serializeDate(value);
			return value;
		});
		if (obj === null) {
			if (strictNullHandling) return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix;
			obj = "";
		}
		if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
			if (encoder) return [formatter(encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format)) + "=" + formatter(encoder(obj, defaults.encoder, charset, "value", format))];
			return [formatter(prefix) + "=" + formatter(String(obj))];
		}
		var values = [];
		if (typeof obj === "undefined") return values;
		var objKeys;
		if (generateArrayPrefix === "comma" && isArray(obj)) {
			if (encodeValuesOnly && encoder) obj = utils.maybeMap(obj, encoder);
			objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
		} else if (isArray(filter)) objKeys = filter;
		else {
			var keys = Object.keys(obj);
			objKeys = sort ? keys.sort(sort) : keys;
		}
		var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
		var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
		if (allowEmptyArrays && isArray(obj) && obj.length === 0) return adjustedPrefix + "[]";
		for (var j = 0; j < objKeys.length; ++j) {
			var key = objKeys[j];
			var value = typeof key === "object" && key && typeof key.value !== "undefined" ? key.value : obj[key];
			if (skipNulls && value === null) continue;
			var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, "%2E") : String(key);
			var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
			sideChannel.set(object, step);
			var valueSideChannel = getSideChannel();
			valueSideChannel.set(sentinel, sideChannel);
			pushToArray(values, stringify(value, keyPrefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
		}
		return values;
	};
	var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
		if (!opts) return defaults;
		if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
		if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
		if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") throw new TypeError("Encoder has to be a function.");
		var charset = opts.charset || defaults.charset;
		if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
		var format = formats["default"];
		if (typeof opts.format !== "undefined") {
			if (!has.call(formats.formatters, opts.format)) throw new TypeError("Unknown format option provided.");
			format = opts.format;
		}
		var formatter = formats.formatters[format];
		var filter = defaults.filter;
		if (typeof opts.filter === "function" || isArray(opts.filter)) filter = opts.filter;
		var arrayFormat;
		if (opts.arrayFormat in arrayPrefixGenerators) arrayFormat = opts.arrayFormat;
		else if ("indices" in opts) arrayFormat = opts.indices ? "indices" : "repeat";
		else arrayFormat = defaults.arrayFormat;
		if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
		var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
		return {
			addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
			allowDots,
			allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
			arrayFormat,
			charset,
			charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
			commaRoundTrip: !!opts.commaRoundTrip,
			delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
			encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
			encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
			encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
			encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
			filter,
			format,
			formatter,
			serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
			skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
			sort: typeof opts.sort === "function" ? opts.sort : null,
			strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
		};
	};
	module.exports = function(object, opts) {
		var obj = object;
		var options = normalizeStringifyOptions(opts);
		var objKeys;
		var filter;
		if (typeof options.filter === "function") {
			filter = options.filter;
			obj = filter("", obj);
		} else if (isArray(options.filter)) {
			filter = options.filter;
			objKeys = filter;
		}
		var keys = [];
		if (typeof obj !== "object" || obj === null) return "";
		var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
		var commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
		if (!objKeys) objKeys = Object.keys(obj);
		if (options.sort) objKeys.sort(options.sort);
		var sideChannel = getSideChannel();
		for (var i = 0; i < objKeys.length; ++i) {
			var key = objKeys[i];
			var value = obj[key];
			if (options.skipNulls && value === null) continue;
			pushToArray(keys, stringify(value, key, generateArrayPrefix, commaRoundTrip, options.allowEmptyArrays, options.strictNullHandling, options.skipNulls, options.encodeDotInKeys, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
		}
		var joined = keys.join(options.delimiter);
		var prefix = options.addQueryPrefix === true ? "?" : "";
		if (options.charsetSentinel) if (options.charset === "iso-8859-1") prefix += "utf8=%26%2310003%3B&";
		else prefix += "utf8=%E2%9C%93&";
		return joined.length > 0 ? prefix + joined : "";
	};
}));
//#endregion
//#region node_modules/qs/lib/parse.js
var require_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var utils = require_utils$1();
	var has = Object.prototype.hasOwnProperty;
	var isArray = Array.isArray;
	var defaults = {
		allowDots: false,
		allowEmptyArrays: false,
		allowPrototypes: false,
		allowSparse: false,
		arrayLimit: 20,
		charset: "utf-8",
		charsetSentinel: false,
		comma: false,
		decodeDotInKeys: false,
		decoder: utils.decode,
		delimiter: "&",
		depth: 5,
		duplicates: "combine",
		ignoreQueryPrefix: false,
		interpretNumericEntities: false,
		parameterLimit: 1e3,
		parseArrays: true,
		plainObjects: false,
		strictDepth: false,
		strictNullHandling: false,
		throwOnLimitExceeded: false
	};
	var interpretNumericEntities = function(str) {
		return str.replace(/&#(\d+);/g, function($0, numberStr) {
			return String.fromCharCode(parseInt(numberStr, 10));
		});
	};
	var parseArrayValue = function(val, options, currentArrayLength) {
		if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) return val.split(",");
		if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
		return val;
	};
	var isoSentinel = "utf8=%26%2310003%3B";
	var charsetSentinel = "utf8=%E2%9C%93";
	var parseValues = function parseQueryStringValues(str, options) {
		var obj = { __proto__: null };
		var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
		cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
		var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
		var parts = cleanStr.split(options.delimiter, options.throwOnLimitExceeded ? limit + 1 : limit);
		if (options.throwOnLimitExceeded && parts.length > limit) throw new RangeError("Parameter limit exceeded. Only " + limit + " parameter" + (limit === 1 ? "" : "s") + " allowed.");
		var skipIndex = -1;
		var i;
		var charset = options.charset;
		if (options.charsetSentinel) {
			for (i = 0; i < parts.length; ++i) if (parts[i].indexOf("utf8=") === 0) {
				if (parts[i] === charsetSentinel) charset = "utf-8";
				else if (parts[i] === isoSentinel) charset = "iso-8859-1";
				skipIndex = i;
				i = parts.length;
			}
		}
		for (i = 0; i < parts.length; ++i) {
			if (i === skipIndex) continue;
			var part = parts[i];
			var bracketEqualsPos = part.indexOf("]=");
			var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
			var key;
			var val;
			if (pos === -1) {
				key = options.decoder(part, defaults.decoder, charset, "key");
				val = options.strictNullHandling ? null : "";
			} else {
				key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
				if (key !== null) val = utils.maybeMap(parseArrayValue(part.slice(pos + 1), options, isArray(obj[key]) ? obj[key].length : 0), function(encodedVal) {
					return options.decoder(encodedVal, defaults.decoder, charset, "value");
				});
			}
			if (val && options.interpretNumericEntities && charset === "iso-8859-1") val = interpretNumericEntities(String(val));
			if (part.indexOf("[]=") > -1) val = isArray(val) ? [val] : val;
			if (options.comma && isArray(val) && val.length > options.arrayLimit) {
				if (options.throwOnLimitExceeded) throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
				val = utils.combine([], val, options.arrayLimit, options.plainObjects);
			}
			if (key !== null) {
				var existing = has.call(obj, key);
				if (existing && options.duplicates === "combine") obj[key] = utils.combine(obj[key], val, options.arrayLimit, options.plainObjects);
				else if (!existing || options.duplicates === "last") obj[key] = val;
			}
		}
		return obj;
	};
	var parseObject = function(chain, val, options, valuesParsed) {
		var currentArrayLength = 0;
		if (chain.length > 0 && chain[chain.length - 1] === "[]") {
			var parentKey = chain.slice(0, -1).join("");
			currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
		}
		var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);
		for (var i = chain.length - 1; i >= 0; --i) {
			var obj;
			var root = chain[i];
			if (root === "[]" && options.parseArrays) if (utils.isOverflow(leaf)) obj = leaf;
			else obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : utils.combine([], leaf, options.arrayLimit, options.plainObjects);
			else {
				obj = options.plainObjects ? { __proto__: null } : {};
				var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
				var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
				var index = parseInt(decodedRoot, 10);
				var isValidArrayIndex = !isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && options.parseArrays;
				if (!options.parseArrays && decodedRoot === "") obj = { 0: leaf };
				else if (isValidArrayIndex && index < options.arrayLimit) {
					obj = [];
					obj[index] = leaf;
				} else if (isValidArrayIndex && options.throwOnLimitExceeded) throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
				else if (isValidArrayIndex) {
					obj[index] = leaf;
					utils.markOverflow(obj, index);
				} else if (decodedRoot !== "__proto__") obj[decodedRoot] = leaf;
			}
			leaf = obj;
		}
		return leaf;
	};
	var splitKeyIntoSegments = function splitKeyIntoSegments(givenKey, options) {
		var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
		if (options.depth <= 0) {
			if (!options.plainObjects && has.call(Object.prototype, key)) {
				if (!options.allowPrototypes) return;
			}
			return [key];
		}
		var brackets = /(\[[^[\]]*])/;
		var child = /(\[[^[\]]*])/g;
		var segment = brackets.exec(key);
		var parent = segment ? key.slice(0, segment.index) : key;
		var keys = [];
		if (parent) {
			if (!options.plainObjects && has.call(Object.prototype, parent)) {
				if (!options.allowPrototypes) return;
			}
			keys[keys.length] = parent;
		}
		var i = 0;
		while ((segment = child.exec(key)) !== null && i < options.depth) {
			i += 1;
			var segmentContent = segment[1].slice(1, -1);
			if (!options.plainObjects && has.call(Object.prototype, segmentContent)) {
				if (!options.allowPrototypes) return;
			}
			keys[keys.length] = segment[1];
		}
		if (segment) {
			if (options.strictDepth === true) throw new RangeError("Input depth exceeded depth option of " + options.depth + " and strictDepth is true");
			keys[keys.length] = "[" + key.slice(segment.index) + "]";
		}
		return keys;
	};
	var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
		if (!givenKey) return;
		var keys = splitKeyIntoSegments(givenKey, options);
		if (!keys) return;
		return parseObject(keys, val, options, valuesParsed);
	};
	var normalizeParseOptions = function normalizeParseOptions(opts) {
		if (!opts) return defaults;
		if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
		if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
		if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") throw new TypeError("Decoder has to be a function.");
		if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
		if (typeof opts.throwOnLimitExceeded !== "undefined" && typeof opts.throwOnLimitExceeded !== "boolean") throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
		var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
		var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
		if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") throw new TypeError("The duplicates option must be either combine, first, or last");
		return {
			allowDots: typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots,
			allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
			allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
			allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
			arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
			charset,
			charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
			comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
			decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
			decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
			delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
			depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
			duplicates,
			ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
			interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
			parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
			parseArrays: opts.parseArrays !== false,
			plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
			strictDepth: typeof opts.strictDepth === "boolean" ? !!opts.strictDepth : defaults.strictDepth,
			strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling,
			throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === "boolean" ? opts.throwOnLimitExceeded : false
		};
	};
	module.exports = function(str, opts) {
		var options = normalizeParseOptions(opts);
		if (str === "" || str === null || typeof str === "undefined") return options.plainObjects ? { __proto__: null } : {};
		var tempObj = typeof str === "string" ? parseValues(str, options) : str;
		var obj = options.plainObjects ? { __proto__: null } : {};
		var keys = Object.keys(tempObj);
		for (var i = 0; i < keys.length; ++i) {
			var key = keys[i];
			var newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
			obj = utils.merge(obj, newObj, options);
		}
		if (options.allowSparse === true) return obj;
		return utils.compact(obj);
	};
}));
//#endregion
//#region node_modules/qs/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var stringify = require_stringify();
	var parse = require_parse();
	module.exports = {
		formats: require_formats(),
		parse,
		stringify
	};
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/bot/sign-in.js
var require_sign_in$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var qs = require_lib();
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	function _interopDefault(e) {
		return e && e.__esModule ? e : { default: e };
	}
	var qs__default = /* @__PURE__ */ _interopDefault(qs);
	const BOT_SIGNIN_ENDPOINTS = {
		URL: "api/botsignin/GetSignInUrl",
		RESOURCE: "api/botsignin/GetSignInResource"
	};
	var BotSignInClient = class {
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(options, apiClientSettings$1) {
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
		}
		async getUrl(params) {
			const q = qs__default.default.stringify(params);
			return (await this.http.get(`${this._apiClientSettings.oauthUrl}/${BOT_SIGNIN_ENDPOINTS.URL}?${q}`)).data;
		}
		async getResource(params) {
			const q = qs__default.default.stringify(params);
			return (await this.http.get(`${this._apiClientSettings.oauthUrl}/${BOT_SIGNIN_ENDPOINTS.RESOURCE}?${q}`)).data;
		}
	};
	exports.BOT_SIGNIN_ENDPOINTS = BOT_SIGNIN_ENDPOINTS;
	exports.BotSignInClient = BotSignInClient;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/bot/index.js
var require_bot = /* @__PURE__ */ __commonJSMin(((exports) => {
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var signIn = require_sign_in$3();
	var BotClient = class {
		signIn;
		get http() {
			return this._http;
		}
		set http(v) {
			this.signIn.http = v;
			this._http = v;
		}
		_http;
		_clientSettings;
		constructor(options, clientSettings) {
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._clientSettings = apiClientSettings.mergeApiClientSettings(clientSettings);
			this.signIn = new signIn.BotSignInClient(this.http, this._clientSettings);
		}
	};
	exports.BotClient = BotClient;
	Object.keys(signIn).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signIn[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/conversation/activity.js
var require_activity$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var ConversationActivityClient = class {
		serviceUrl;
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(serviceUrl, options, apiClientSettings$1) {
			this.serviceUrl = serviceUrl;
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
		}
		async create(conversationId, params) {
			return (await this.http.post(`${this.serviceUrl}/v3/conversations/${conversationId}/activities`, params)).data;
		}
		async update(conversationId, id, params) {
			return (await this.http.put(`${this.serviceUrl}/v3/conversations/${conversationId}/activities/${id}`, params)).data;
		}
		async reply(conversationId, id, params) {
			params.replyToId = id;
			return (await this.http.post(`${this.serviceUrl}/v3/conversations/${conversationId}/activities/${id}`, params)).data;
		}
		async delete(conversationId, id) {
			return (await this.http.delete(`${this.serviceUrl}/v3/conversations/${conversationId}/activities/${id}`)).data;
		}
		async getMembers(conversationId, id) {
			return (await this.http.get(`${this.serviceUrl}/v3/conversations/${conversationId}/activities/${id}/members`)).data;
		}
		async createTargeted(conversationId, params) {
			return (await this.http.post(`${this.serviceUrl}/v3/conversations/${conversationId}/activities?isTargetedActivity=true`, params)).data;
		}
		async updateTargeted(conversationId, id, params) {
			return (await this.http.put(`${this.serviceUrl}/v3/conversations/${conversationId}/activities/${id}?isTargetedActivity=true`, params)).data;
		}
		async deleteTargeted(conversationId, id) {
			return (await this.http.delete(`${this.serviceUrl}/v3/conversations/${conversationId}/activities/${id}?isTargetedActivity=true`)).data;
		}
	};
	exports.ConversationActivityClient = ConversationActivityClient;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/conversation/member.js
var require_member = /* @__PURE__ */ __commonJSMin(((exports) => {
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var ConversationMemberClient = class {
		serviceUrl;
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(serviceUrl, options, apiClientSettings$1) {
			this.serviceUrl = serviceUrl;
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
		}
		async get(conversationId) {
			return (await this.http.get(`${this.serviceUrl}/v3/conversations/${conversationId}/members`)).data;
		}
		async getById(conversationId, id) {
			return (await this.http.get(`${this.serviceUrl}/v3/conversations/${conversationId}/members/${id}`)).data;
		}
		async delete(conversationId, id) {
			return (await this.http.delete(`${this.serviceUrl}/v3/conversations/${conversationId}/members/${id}`)).data;
		}
	};
	exports.ConversationMemberClient = ConversationMemberClient;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/conversation/index.js
var require_conversation$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var qs = require_lib();
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var activity = require_activity$1();
	var member = require_member();
	function _interopDefault(e) {
		return e && e.__esModule ? e : { default: e };
	}
	var qs__default = /* @__PURE__ */ _interopDefault(qs);
	var ConversationClient = class {
		serviceUrl;
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_activities;
		_members;
		_apiClientSettings;
		constructor(serviceUrl, options, apiClientSettings$1) {
			this.serviceUrl = serviceUrl;
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
			this._activities = new activity.ConversationActivityClient(serviceUrl, this.http, this._apiClientSettings);
			this._members = new member.ConversationMemberClient(serviceUrl, this.http, this._apiClientSettings);
		}
		activities(conversationId) {
			return {
				create: (params) => this._activities.create(conversationId, params),
				update: (id, params) => this._activities.update(conversationId, id, params),
				reply: (id, params) => this._activities.reply(conversationId, id, params),
				delete: (id) => this._activities.delete(conversationId, id),
				members: (activityId) => this._activities.getMembers(conversationId, activityId),
				createTargeted: (params) => this._activities.createTargeted(conversationId, params),
				updateTargeted: (id, params) => this._activities.updateTargeted(conversationId, id, params),
				deleteTargeted: (id) => this._activities.deleteTargeted(conversationId, id)
			};
		}
		members(conversationId) {
			return {
				get: () => this._members.get(conversationId),
				getById: (id) => this._members.getById(conversationId, id),
				delete: (id) => this._members.delete(conversationId, id)
			};
		}
		async get(params) {
			const q = qs__default.default.stringify(params, { addQueryPrefix: true });
			return (await this.http.get(`${this.serviceUrl}/v3/conversations${q}`)).data;
		}
		async create(params) {
			return (await this.http.post(`${this.serviceUrl}/v3/conversations`, params)).data;
		}
	};
	exports.ConversationClient = ConversationClient;
	Object.keys(activity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return activity[k];
			}
		});
	});
	Object.keys(member).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return member[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/meeting.js
var require_meeting$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var MeetingClient = class {
		serviceUrl;
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(serviceUrl, options, apiClientSettings$1) {
			this.serviceUrl = serviceUrl;
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
		}
		/**
		* Retrieves meeting information including details, organizer, and conversation.
		* @param id - The meeting ID.
		*/
		async getById(id) {
			return (await this.http.get(`${this.serviceUrl}/v1/meetings/${encodeURIComponent(id)}`)).data;
		}
		/**
		* Retrieves information about a specific participant in a meeting.
		* @param meetingId - The meeting ID.
		* @param id - The user AAD object ID
		* @param tenantId - The tenant ID of the meeting and user.
		* @returns {MeetingParticipant} The meeting participant information.
		*/
		async getParticipant(meetingId, id, tenantId) {
			return (await this.http.get(`${this.serviceUrl}/v1/meetings/${encodeURIComponent(meetingId)}/participants/${encodeURIComponent(id)}?tenantId=${encodeURIComponent(tenantId)}`)).data;
		}
	};
	exports.MeetingClient = MeetingClient;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/reaction/reaction.js
var require_reaction$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var ReactionClient = class {
		serviceUrl;
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(serviceUrl, options, apiClientSettings$1) {
			this.serviceUrl = serviceUrl;
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
		}
		/**
		* Add a reaction to a message.
		*
		* @experimental This API is in preview and may change in the future.
		* Diagnostic: ExperimentalTeamsReactions
		*/
		async add(conversationId, activityId, reactionType) {
			return (await this.http.put(`${this.serviceUrl}/v3/conversations/${encodeURIComponent(conversationId)}/activities/${encodeURIComponent(activityId)}/reactions/${encodeURIComponent(reactionType)}`)).data;
		}
		/**
		* Remove a reaction from a message.
		*
		* @experimental This API is in preview and may change in the future.
		* Diagnostic: ExperimentalTeamsReactions
		*/
		async remove(conversationId, activityId, reactionType) {
			return (await this.http.delete(`${this.serviceUrl}/v3/conversations/${encodeURIComponent(conversationId)}/activities/${encodeURIComponent(activityId)}/reactions/${encodeURIComponent(reactionType)}`)).data;
		}
	};
	exports.ReactionClient = ReactionClient;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/reaction/index.js
var require_reaction = /* @__PURE__ */ __commonJSMin(((exports) => {
	var reaction = require_reaction$1();
	Object.keys(reaction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return reaction[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/team.js
var require_team = /* @__PURE__ */ __commonJSMin(((exports) => {
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var TeamClient = class {
		serviceUrl;
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(serviceUrl, options, apiClientSettings$1) {
			this.serviceUrl = serviceUrl;
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
		}
		async getById(id) {
			return (await this.http.get(`${this.serviceUrl}/v3/teams/${id}`)).data;
		}
		async getConversations(id) {
			return (await this.http.get(`${this.serviceUrl}/v3/teams/${id}/conversations`)).data;
		}
	};
	exports.TeamClient = TeamClient;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/user/token.js
var require_token$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var qs = require_lib();
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	function _interopDefault(e) {
		return e && e.__esModule ? e : { default: e };
	}
	var qs__default = /* @__PURE__ */ _interopDefault(qs);
	const USER_TOKEN_ENDPOINTS = {
		GET_TOKEN: "api/usertoken/GetToken",
		GET_AAD_TOKENS: "api/usertoken/GetAadTokens",
		GET_STATUS: "api/usertoken/GetTokenStatus",
		SIGN_OUT: "api/usertoken/SignOut",
		EXCHANGE: "api/usertoken/exchange"
	};
	var UserTokenClient = class {
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(options, apiClientSettings$1) {
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
		}
		async get(params) {
			const q = qs__default.default.stringify(params);
			return (await this.http.get(`${this._apiClientSettings.oauthUrl}/${USER_TOKEN_ENDPOINTS.GET_TOKEN}?${q}`)).data;
		}
		async getAad(params) {
			const q = qs__default.default.stringify(params);
			return (await this.http.post(`${this._apiClientSettings.oauthUrl}/${USER_TOKEN_ENDPOINTS.GET_AAD_TOKENS}?${q}`, params)).data;
		}
		async getStatus(params) {
			const q = qs__default.default.stringify(params);
			return (await this.http.get(`${this._apiClientSettings.oauthUrl}/${USER_TOKEN_ENDPOINTS.GET_STATUS}?${q}`)).data;
		}
		async signOut(params) {
			const q = qs__default.default.stringify(params);
			return (await this.http.delete(`${this._apiClientSettings.oauthUrl}/${USER_TOKEN_ENDPOINTS.SIGN_OUT}?${q}`, { data: params })).data;
		}
		async exchange(params) {
			const q = qs__default.default.stringify({
				userId: params.userId,
				connectionName: params.connectionName,
				channelId: params.channelId
			});
			return (await this.http.post(`${this._apiClientSettings.oauthUrl}/${USER_TOKEN_ENDPOINTS.EXCHANGE}?${q}`, params.exchangeRequest)).data;
		}
	};
	exports.USER_TOKEN_ENDPOINTS = USER_TOKEN_ENDPOINTS;
	exports.UserTokenClient = UserTokenClient;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/user/index.js
var require_user = /* @__PURE__ */ __commonJSMin(((exports) => {
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var token = require_token$2();
	var UserClient = class {
		token;
		get http() {
			return this._http;
		}
		set http(v) {
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(options, apiClientSettings$1) {
			if (!options) this._http = new http.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http.Client(options);
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
			this.token = new token.UserTokenClient(this.http, this._apiClientSettings);
		}
	};
	exports.UserClient = UserClient;
	Object.keys(token).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return token[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/clients/index.js
var require_clients = /* @__PURE__ */ __commonJSMin(((exports) => {
	var http = require_http();
	var apiClientSettings = require_api_client_settings();
	var bot = require_bot();
	var conversation = require_conversation$3();
	var meeting = require_meeting$2();
	var reaction = require_reaction();
	var team = require_team();
	var user = require_user();
	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) Object.keys(e).forEach(function(k) {
			if (k !== "default") {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function() {
						return e[k];
					}
				});
			}
		});
		n.default = e;
		return Object.freeze(n);
	}
	var http__namespace = /* @__PURE__ */ _interopNamespace(http);
	var Client = class {
		serviceUrl;
		bots;
		users;
		conversations;
		teams;
		meetings;
		/**
		* @experimental This API is in preview and may change in the future.
		* Diagnostic: ExperimentalTeamsReactions
		*/
		reactions;
		get http() {
			return this._http;
		}
		set http(v) {
			this.bots.http = v;
			this.conversations.http = v;
			this.users.http = v;
			this.teams.http = v;
			this.meetings.http = v;
			this.reactions.http = v;
			this._http = v;
		}
		_http;
		_apiClientSettings;
		constructor(serviceUrl, options, apiClientSettings$1) {
			this.serviceUrl = serviceUrl;
			if (!options) this._http = new http__namespace.Client();
			else if ("request" in options) this._http = options;
			else this._http = new http__namespace.Client({
				...options,
				headers: {
					...options?.headers,
					"Content-Type": "application/json"
				}
			});
			this._apiClientSettings = apiClientSettings.mergeApiClientSettings(apiClientSettings$1);
			this.bots = new bot.BotClient(this.http, this._apiClientSettings);
			this.users = new user.UserClient(this.http, this._apiClientSettings);
			this.conversations = new conversation.ConversationClient(serviceUrl, this.http, this._apiClientSettings);
			this.teams = new team.TeamClient(serviceUrl, this.http, this._apiClientSettings);
			this.meetings = new meeting.MeetingClient(serviceUrl, this.http, this._apiClientSettings);
			this.reactions = new reaction.ReactionClient(serviceUrl, this.http, this._apiClientSettings);
		}
	};
	exports.Client = Client;
	Object.keys(apiClientSettings).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return apiClientSettings[k];
			}
		});
	});
	Object.keys(bot).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return bot[k];
			}
		});
	});
	Object.keys(conversation).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return conversation[k];
			}
		});
	});
	Object.keys(meeting).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meeting[k];
			}
		});
	});
	Object.keys(reaction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return reaction[k];
			}
		});
	});
	Object.keys(team).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return team[k];
			}
		});
	});
	Object.keys(user).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return user[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token/token-post-resource.js
var require_token_post_resource = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token/token-request.js
var require_token_request = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token/token-response.js
var require_token_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token/token-status.js
var require_token_status = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token/index.js
var require_token$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var tokenPostResource = require_token_post_resource();
	var tokenRequest = require_token_request();
	var tokenResponse = require_token_response();
	var tokenStatus = require_token_status();
	Object.keys(tokenPostResource).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenPostResource[k];
			}
		});
	});
	Object.keys(tokenRequest).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenRequest[k];
			}
		});
	});
	Object.keys(tokenResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenResponse[k];
			}
		});
	});
	Object.keys(tokenStatus).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenStatus[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token-exchange/token-exchange-invoke-request.js
var require_token_exchange_invoke_request = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token-exchange/token-exchange-invoke-response.js
var require_token_exchange_invoke_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token-exchange/token-exchange-request.js
var require_token_exchange_request = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token-exchange/token-exchange-resource.js
var require_token_exchange_resource = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token-exchange/token-exchange-state.js
var require_token_exchange_state = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/token-exchange/index.js
var require_token_exchange$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var tokenExchangeInvokeRequest = require_token_exchange_invoke_request();
	var tokenExchangeInvokeResponse = require_token_exchange_invoke_response();
	var tokenExchangeRequest = require_token_exchange_request();
	var tokenExchangeResource = require_token_exchange_resource();
	var tokenExchangeState = require_token_exchange_state();
	Object.keys(tokenExchangeInvokeRequest).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenExchangeInvokeRequest[k];
			}
		});
	});
	Object.keys(tokenExchangeInvokeResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenExchangeInvokeResponse[k];
			}
		});
	});
	Object.keys(tokenExchangeRequest).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenExchangeRequest[k];
			}
		});
	});
	Object.keys(tokenExchangeResource).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenExchangeResource[k];
			}
		});
	});
	Object.keys(tokenExchangeState).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenExchangeState[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/sign-in/sign-in-card.js
var require_sign_in_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/sign-in/sign-in-url-response.js
var require_sign_in_url_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/sign-in/sign-in-state-verify-query.js
var require_sign_in_state_verify_query = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/sign-in/sign-in-exchange-token.js
var require_sign_in_exchange_token = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/sign-in/sign-in-failure.js
var require_sign_in_failure = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/sign-in/index.js
var require_sign_in$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var signInCard = require_sign_in_card();
	var signInUrlResponse = require_sign_in_url_response();
	var signInStateVerifyQuery = require_sign_in_state_verify_query();
	var signInExchangeToken = require_sign_in_exchange_token();
	var signInFailure = require_sign_in_failure();
	Object.keys(signInCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signInCard[k];
			}
		});
	});
	Object.keys(signInUrlResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signInUrlResponse[k];
			}
		});
	});
	Object.keys(signInStateVerifyQuery).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signInStateVerifyQuery[k];
			}
		});
	});
	Object.keys(signInExchangeToken).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signInExchangeToken[k];
			}
		});
	});
	Object.keys(signInFailure).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signInFailure[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/oauth/oauth-card.js
var require_oauth_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/oauth/index.js
var require_oauth = /* @__PURE__ */ __commonJSMin(((exports) => {
	var oauthCard = require_oauth_card();
	Object.keys(oauthCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return oauthCard[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/role.js
var require_role = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/account.js
var require_account = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/client-info-entity.js
var require_client_info_entity = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/mention-entity.js
var require_mention_entity = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/message-entity.js
var require_message_entity = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/ai-message-entity.js
var require_ai_message_entity = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/stream-info-entity.js
var require_stream_info_entity = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/citation-entity.js
var require_citation_entity = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/sensitive-usage-entity.js
var require_sensitive_usage_entity = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/product-info-entity.js
var require_product_info_entity = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/entity/index.js
var require_entity = /* @__PURE__ */ __commonJSMin(((exports) => {
	var clientInfoEntity = require_client_info_entity();
	var mentionEntity = require_mention_entity();
	var messageEntity = require_message_entity();
	var aiMessageEntity = require_ai_message_entity();
	var streamInfoEntity = require_stream_info_entity();
	var citationEntity = require_citation_entity();
	var sensitiveUsageEntity = require_sensitive_usage_entity();
	var productInfoEntity = require_product_info_entity();
	Object.keys(clientInfoEntity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return clientInfoEntity[k];
			}
		});
	});
	Object.keys(mentionEntity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return mentionEntity[k];
			}
		});
	});
	Object.keys(messageEntity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageEntity[k];
			}
		});
	});
	Object.keys(aiMessageEntity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return aiMessageEntity[k];
			}
		});
	});
	Object.keys(streamInfoEntity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return streamInfoEntity[k];
			}
		});
	});
	Object.keys(citationEntity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return citationEntity[k];
			}
		});
	});
	Object.keys(sensitiveUsageEntity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return sensitiveUsageEntity[k];
			}
		});
	});
	Object.keys(productInfoEntity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return productInfoEntity[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/input-hint.js
var require_input_hint = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/text-format.js
var require_text_format = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/attachment/attachment.js
var require_attachment$1 = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/attachment/card-attachment.js
var require_card_attachment = /* @__PURE__ */ __commonJSMin(((exports) => {
	function cardAttachment(type, content) {
		return {
			contentType: `application/vnd.microsoft.card.${type}`,
			content
		};
	}
	exports.cardAttachment = cardAttachment;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/attachment/attachment-layout.js
var require_attachment_layout = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/attachment/index.js
var require_attachment = /* @__PURE__ */ __commonJSMin(((exports) => {
	var attachment = require_attachment$1();
	var cardAttachment = require_card_attachment();
	var attachmentLayout = require_attachment_layout();
	Object.keys(attachment).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return attachment[k];
			}
		});
	});
	Object.keys(cardAttachment).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return cardAttachment[k];
			}
		});
	});
	Object.keys(attachmentLayout).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return attachmentLayout[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/suggested-actions.js
var require_suggested_actions = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/importance.js
var require_importance = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/delivery-mode.js
var require_delivery_mode = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/error.js
var require_error = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/conversation/conversation.js
var require_conversation$2 = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/conversation/conversation-reference.js
var require_conversation_reference = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/conversation/conversation-resource.js
var require_conversation_resource = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/conversation/index.js
var require_conversation$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var conversation = require_conversation$2();
	var conversationReference = require_conversation_reference();
	var conversationResource = require_conversation_resource();
	Object.keys(conversation).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return conversation[k];
			}
		});
	});
	Object.keys(conversationReference).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return conversationReference[k];
			}
		});
	});
	Object.keys(conversationResource).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return conversationResource[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/resource.js
var require_resource = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/cache-info.js
var require_cache_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/config/config-auth.js
var require_config_auth = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/config/config-response.js
var require_config_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/config/index.js
var require_config$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var configAuth = require_config_auth();
	var configResponse = require_config_response();
	Object.keys(configAuth).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return configAuth[k];
			}
		});
	});
	Object.keys(configResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return configResponse[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/task-module/task-module-card-response.js
var require_task_module_card_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/task-module/task-module-continue-response.js
var require_task_module_continue_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/task-module/task-module-message-response.js
var require_task_module_message_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/task-module/task-module-response.js
var require_task_module_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/task-module/task-module-task-info.js
var require_task_module_task_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/task-module/task-module-request.js
var require_task_module_request = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/task-module/index.js
var require_task_module = /* @__PURE__ */ __commonJSMin(((exports) => {
	var taskModuleCardResponse = require_task_module_card_response();
	var taskModuleContinueResponse = require_task_module_continue_response();
	var taskModuleMessageResponse = require_task_module_message_response();
	var taskModuleResponse = require_task_module_response();
	var taskModuleTaskInfo = require_task_module_task_info();
	var taskModuleRequest = require_task_module_request();
	Object.keys(taskModuleCardResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskModuleCardResponse[k];
			}
		});
	});
	Object.keys(taskModuleContinueResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskModuleContinueResponse[k];
			}
		});
	});
	Object.keys(taskModuleMessageResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskModuleMessageResponse[k];
			}
		});
	});
	Object.keys(taskModuleResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskModuleResponse[k];
			}
		});
	});
	Object.keys(taskModuleTaskInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskModuleTaskInfo[k];
			}
		});
	});
	Object.keys(taskModuleRequest).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskModuleRequest[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/file/file-consent-card.js
var require_file_consent_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/file/file-info-card.js
var require_file_info_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/file/file-upload-info.js
var require_file_upload_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/file/index.js
var require_file = /* @__PURE__ */ __commonJSMin(((exports) => {
	var fileConsentCard = require_file_consent_card();
	var fileInfoCard = require_file_info_card();
	var fileUploadInfo = require_file_upload_info();
	Object.keys(fileConsentCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return fileConsentCard[k];
			}
		});
	});
	Object.keys(fileInfoCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return fileInfoCard[k];
			}
		});
	});
	Object.keys(fileUploadInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return fileUploadInfo[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/action.js
var require_action$1 = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/o365/o365-connector-card-action-query.js
var require_o365_connector_card_action_query = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/o365/index.js
var require_o365 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var o365ConnectorCardActionQuery = require_o365_connector_card_action_query();
	Object.keys(o365ConnectorCardActionQuery).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return o365ConnectorCardActionQuery[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/app-based-link-query.js
var require_app_based_link_query = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-attachment.js
var require_messaging_extension_attachment = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-response.js
var require_messaging_extension_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-result.js
var require_messaging_extension_result = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-suggested-action.js
var require_messaging_extension_suggested_action = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-parameter.js
var require_messaging_extension_parameter = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-query.js
var require_messaging_extension_query = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-action.js
var require_messaging_extension_action = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-action-response.js
var require_messaging_extension_action_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/messaging-extension-attachment-layout.js
var require_messaging_extension_attachment_layout = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/messaging-extension/index.js
var require_messaging_extension = /* @__PURE__ */ __commonJSMin(((exports) => {
	var messagingExtensionAttachment = require_messaging_extension_attachment();
	var messagingExtensionResponse = require_messaging_extension_response();
	var messagingExtensionResult = require_messaging_extension_result();
	var messagingExtensionSuggestedAction = require_messaging_extension_suggested_action();
	var messagingExtensionParameter = require_messaging_extension_parameter();
	var messagingExtensionQuery = require_messaging_extension_query();
	var messagingExtensionAction = require_messaging_extension_action();
	var messagingExtensionActionResponse = require_messaging_extension_action_response();
	var messagingExtensionAttachmentLayout = require_messaging_extension_attachment_layout();
	Object.keys(messagingExtensionAttachment).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionAttachment[k];
			}
		});
	});
	Object.keys(messagingExtensionResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionResponse[k];
			}
		});
	});
	Object.keys(messagingExtensionResult).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionResult[k];
			}
		});
	});
	Object.keys(messagingExtensionSuggestedAction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionSuggestedAction[k];
			}
		});
	});
	Object.keys(messagingExtensionParameter).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionParameter[k];
			}
		});
	});
	Object.keys(messagingExtensionQuery).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionQuery[k];
			}
		});
	});
	Object.keys(messagingExtensionAction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionAction[k];
			}
		});
	});
	Object.keys(messagingExtensionActionResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionActionResponse[k];
			}
		});
	});
	Object.keys(messagingExtensionAttachmentLayout).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtensionAttachmentLayout[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/message.js
var require_message$4 = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/message-app.js
var require_message_app = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/message-body.js
var require_message_body = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/message-conversation.js
var require_message_conversation = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/message-from.js
var require_message_from = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/message-mention.js
var require_message_mention = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/message-reaction.js
var require_message_reaction$1 = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/message-user.js
var require_message_user = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/message/index.js
var require_message$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var message = require_message$4();
	var messageApp = require_message_app();
	var messageBody = require_message_body();
	var messageConversation = require_message_conversation();
	var messageFrom = require_message_from();
	var messageMention = require_message_mention();
	var messageReaction = require_message_reaction$1();
	var messageUser = require_message_user();
	Object.keys(message).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return message[k];
			}
		});
	});
	Object.keys(messageApp).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageApp[k];
			}
		});
	});
	Object.keys(messageBody).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageBody[k];
			}
		});
	});
	Object.keys(messageConversation).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageConversation[k];
			}
		});
	});
	Object.keys(messageFrom).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageFrom[k];
			}
		});
	});
	Object.keys(messageMention).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageMention[k];
			}
		});
	});
	Object.keys(messageReaction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageReaction[k];
			}
		});
	});
	Object.keys(messageUser).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageUser[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/tab/tab-entity-context.js
var require_tab_entity_context = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/tab/tab-context.js
var require_tab_context = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/tab/tab-request.js
var require_tab_request = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/tab/tab-response.js
var require_tab_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/tab/tab-response-card.js
var require_tab_response_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/tab/tab-submit.js
var require_tab_submit$1 = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/tab/tab-suggested-actions.js
var require_tab_suggested_actions = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/tab/index.js
var require_tab$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var tabEntityContext = require_tab_entity_context();
	var tabContext = require_tab_context();
	var tabRequest = require_tab_request();
	var tabResponse = require_tab_response();
	var tabResponseCard = require_tab_response_card();
	var tabSubmit = require_tab_submit$1();
	var tabSuggestedActions = require_tab_suggested_actions();
	Object.keys(tabEntityContext).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabEntityContext[k];
			}
		});
	});
	Object.keys(tabContext).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabContext[k];
			}
		});
	});
	Object.keys(tabRequest).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabRequest[k];
			}
		});
	});
	Object.keys(tabResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabResponse[k];
			}
		});
	});
	Object.keys(tabResponseCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabResponseCard[k];
			}
		});
	});
	Object.keys(tabSubmit).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabSubmit[k];
			}
		});
	});
	Object.keys(tabSuggestedActions).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabSuggestedActions[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/animation-card.js
var require_animation_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/audio-card.js
var require_audio_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/basic-card.js
var require_basic_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/card-image.js
var require_card_image = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/hero-card.js
var require_hero_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/media-card.js
var require_media_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/media-url.js
var require_media_url = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/thumbnail-card.js
var require_thumbnail_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/thumbnail-url.js
var require_thumbnail_url = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/video-card.js
var require_video_card = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/card-action.js
var require_card_action = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/card/index.js
var require_card = /* @__PURE__ */ __commonJSMin(((exports) => {
	var animationCard = require_animation_card();
	var audioCard = require_audio_card();
	var basicCard = require_basic_card();
	var cardImage = require_card_image();
	var heroCard = require_hero_card();
	var mediaCard = require_media_card();
	var mediaUrl = require_media_url();
	var thumbnailCard = require_thumbnail_card();
	var thumbnailUrl = require_thumbnail_url();
	var videoCard = require_video_card();
	var cardAction = require_card_action();
	Object.keys(animationCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return animationCard[k];
			}
		});
	});
	Object.keys(audioCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return audioCard[k];
			}
		});
	});
	Object.keys(basicCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return basicCard[k];
			}
		});
	});
	Object.keys(cardImage).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return cardImage[k];
			}
		});
	});
	Object.keys(heroCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return heroCard[k];
			}
		});
	});
	Object.keys(mediaCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return mediaCard[k];
			}
		});
	});
	Object.keys(mediaUrl).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return mediaUrl[k];
			}
		});
	});
	Object.keys(thumbnailCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return thumbnailCard[k];
			}
		});
	});
	Object.keys(thumbnailUrl).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return thumbnailUrl[k];
			}
		});
	});
	Object.keys(videoCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return videoCard[k];
			}
		});
	});
	Object.keys(cardAction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return cardAction[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/invoke-response.js
var require_invoke_response = /* @__PURE__ */ __commonJSMin(((exports) => {
	function isInvokeResponse(value) {
		return typeof value === "object" && "status" in value && typeof value.status === "number";
	}
	exports.isInvokeResponse = isInvokeResponse;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/membership-source-types.js
var require_membership_source_types = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/membership-source.js
var require_membership_source = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/membership-types.js
var require_membership_types = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/adaptive-card/adaptive-card-authentication.js
var require_adaptive_card_authentication = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/adaptive-card/adaptive-card-invoke-action.js
var require_adaptive_card_invoke_action = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/adaptive-card/adaptive-card-invoke-value.js
var require_adaptive_card_invoke_value = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/adaptive-card/adaptive-card-action-response.js
var require_adaptive_card_action_response = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/adaptive-card/index.js
var require_adaptive_card$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var adaptiveCardAuthentication = require_adaptive_card_authentication();
	var adaptiveCardInvokeAction = require_adaptive_card_invoke_action();
	var adaptiveCardInvokeValue = require_adaptive_card_invoke_value();
	var adaptiveCardActionResponse = require_adaptive_card_action_response();
	Object.keys(adaptiveCardAuthentication).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return adaptiveCardAuthentication[k];
			}
		});
	});
	Object.keys(adaptiveCardInvokeAction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return adaptiveCardInvokeAction[k];
			}
		});
	});
	Object.keys(adaptiveCardInvokeValue).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return adaptiveCardInvokeValue[k];
			}
		});
	});
	Object.keys(adaptiveCardActionResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return adaptiveCardActionResponse[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/channel-data/channel-info.js
var require_channel_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/channel-data/notification-info.js
var require_notification_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/channel-data/on-behalf-of.js
var require_on_behalf_of = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/channel-data/settings.js
var require_settings = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/channel-data/team-info.js
var require_team_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/channel-data/tenant-info.js
var require_tenant_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/channel-data/index.js
var require_channel_data = /* @__PURE__ */ __commonJSMin(((exports) => {
	var channelInfo = require_channel_info();
	var notificationInfo = require_notification_info();
	var onBehalfOf = require_on_behalf_of();
	var settings = require_settings();
	var teamInfo = require_team_info();
	var tenantInfo = require_tenant_info();
	Object.keys(channelInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return channelInfo[k];
			}
		});
	});
	Object.keys(notificationInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return notificationInfo[k];
			}
		});
	});
	Object.keys(onBehalfOf).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return onBehalfOf[k];
			}
		});
	});
	Object.keys(settings).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return settings[k];
			}
		});
	});
	Object.keys(teamInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return teamInfo[k];
			}
		});
	});
	Object.keys(tenantInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tenantInfo[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/team-details.js
var require_team_details = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/meeting/meeting.js
var require_meeting$1 = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/meeting/meeting-info.js
var require_meeting_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/meeting/meeting-details.js
var require_meeting_details = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/meeting/meeting-participant.js
var require_meeting_participant = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/meeting/index.js
var require_meeting = /* @__PURE__ */ __commonJSMin(((exports) => {
	var meeting = require_meeting$1();
	var meetingInfo = require_meeting_info();
	var meetingDetails = require_meeting_details();
	var meetingParticipant = require_meeting_participant();
	Object.keys(meeting).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meeting[k];
			}
		});
	});
	Object.keys(meetingInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meetingInfo[k];
			}
		});
	});
	Object.keys(meetingDetails).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meetingDetails[k];
			}
		});
	});
	Object.keys(meetingParticipant).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meetingParticipant[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/channel-id.js
var require_channel_id = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/activity-like.js
var require_activity_like = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/models/index.js
var require_models = /* @__PURE__ */ __commonJSMin(((exports) => {
	var token = require_token$1();
	var tokenExchange = require_token_exchange$1();
	var signIn = require_sign_in$2();
	var oauth = require_oauth();
	var role = require_role();
	var account = require_account();
	var entity = require_entity();
	var inputHint = require_input_hint();
	var textFormat = require_text_format();
	var attachment = require_attachment();
	var suggestedActions = require_suggested_actions();
	var importance = require_importance();
	var deliveryMode = require_delivery_mode();
	var error = require_error();
	var conversation = require_conversation$1();
	var resource = require_resource();
	var cacheInfo = require_cache_info();
	var config = require_config$1();
	var taskModule = require_task_module();
	var file = require_file();
	var action = require_action$1();
	var o365 = require_o365();
	var appBasedLinkQuery = require_app_based_link_query();
	var messagingExtension = require_messaging_extension();
	var message = require_message$3();
	var tab = require_tab$1();
	var card = require_card();
	var invokeResponse = require_invoke_response();
	var membershipSourceTypes = require_membership_source_types();
	var membershipSource = require_membership_source();
	var membershipTypes = require_membership_types();
	var adaptiveCard = require_adaptive_card$1();
	var channelData = require_channel_data();
	var teamDetails = require_team_details();
	var meeting = require_meeting();
	var channelId = require_channel_id();
	var activityLike = require_activity_like();
	Object.keys(token).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return token[k];
			}
		});
	});
	Object.keys(tokenExchange).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenExchange[k];
			}
		});
	});
	Object.keys(signIn).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signIn[k];
			}
		});
	});
	Object.keys(oauth).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return oauth[k];
			}
		});
	});
	Object.keys(role).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return role[k];
			}
		});
	});
	Object.keys(account).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return account[k];
			}
		});
	});
	Object.keys(entity).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return entity[k];
			}
		});
	});
	Object.keys(inputHint).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return inputHint[k];
			}
		});
	});
	Object.keys(textFormat).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return textFormat[k];
			}
		});
	});
	Object.keys(attachment).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return attachment[k];
			}
		});
	});
	Object.keys(suggestedActions).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return suggestedActions[k];
			}
		});
	});
	Object.keys(importance).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return importance[k];
			}
		});
	});
	Object.keys(deliveryMode).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return deliveryMode[k];
			}
		});
	});
	Object.keys(error).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return error[k];
			}
		});
	});
	Object.keys(conversation).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return conversation[k];
			}
		});
	});
	Object.keys(resource).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return resource[k];
			}
		});
	});
	Object.keys(cacheInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return cacheInfo[k];
			}
		});
	});
	Object.keys(config).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return config[k];
			}
		});
	});
	Object.keys(taskModule).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskModule[k];
			}
		});
	});
	Object.keys(file).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return file[k];
			}
		});
	});
	Object.keys(action).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return action[k];
			}
		});
	});
	Object.keys(o365).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return o365[k];
			}
		});
	});
	Object.keys(appBasedLinkQuery).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return appBasedLinkQuery[k];
			}
		});
	});
	Object.keys(messagingExtension).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messagingExtension[k];
			}
		});
	});
	Object.keys(message).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return message[k];
			}
		});
	});
	Object.keys(tab).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tab[k];
			}
		});
	});
	Object.keys(card).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return card[k];
			}
		});
	});
	Object.keys(invokeResponse).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return invokeResponse[k];
			}
		});
	});
	Object.keys(membershipSourceTypes).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return membershipSourceTypes[k];
			}
		});
	});
	Object.keys(membershipSource).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return membershipSource[k];
			}
		});
	});
	Object.keys(membershipTypes).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return membershipTypes[k];
			}
		});
	});
	Object.keys(adaptiveCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return adaptiveCard[k];
			}
		});
	});
	Object.keys(channelData).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return channelData[k];
			}
		});
	});
	Object.keys(teamDetails).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return teamDetails[k];
			}
		});
	});
	Object.keys(meeting).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meeting[k];
			}
		});
	});
	Object.keys(channelId).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return channelId[k];
			}
		});
	});
	Object.keys(activityLike).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return activityLike[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/activity.js
var require_activity = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.Activity = class Activity {
		/**
		* Contains the type of the activity.
		*/
		type;
		/**
		* Contains an ID that uniquely identifies the activity on the channel.
		*/
		id;
		/**
		* Contains the URL that specifies the channel's service endpoint. Set by the channel.
		*/
		serviceUrl;
		/**
		* Contains the date and time that the message was sent, in UTC, expressed in ISO-8601 format.
		*/
		timestamp;
		/**
		* A locale name for the contents of the text field.
		* The locale name is a combination of an ISO 639 two- or three-letter culture code associated
		* with a language
		* and an ISO 3166 two-letter subculture code associated with a country or region.
		* The locale name can also correspond to a valid BCP-47 language tag.
		*/
		locale;
		/**
		* Contains the local date and time of the message, expressed in ISO-8601 format.
		*
		* For example, 2016-09-23T13:07:49.4714686-07:00.
		*/
		localTimestamp;
		/**
		* Contains an ID that uniquely identifies the channel. Set by the channel.
		*/
		channelId;
		/**
		* Identifies the sender of the message.
		*/
		from;
		/**
		* Identifies the conversation to which the activity belongs.
		*/
		conversation;
		/**
		* A reference to another conversation or activity.
		*/
		relatesTo;
		/**
		* Identifies the recipient of the message.
		*/
		recipient;
		/**
		* Contains the ID of the message to which this message is a reply.
		*/
		replyToId;
		/**
		* Represents the entities that were mentioned in the message.
		*/
		entities;
		/**
		* Contains channel-specific content.
		*/
		channelData;
		/**
		* Information about the tenant in which the message was sent.
		*/
		get tenant() {
			return this.channelData?.tenant;
		}
		/**
		* Information about the channel in which the message was sent.
		*/
		get channel() {
			return this.channelData?.channel;
		}
		/**
		* Information about the team in which the message was sent.
		*/
		get team() {
			return this.channelData?.team;
		}
		/**
		* Information about the tenant in which the message was sent.
		*/
		get meeting() {
			return this.channelData?.meeting;
		}
		/**
		* Notification settings for the message.
		*/
		get notification() {
			return this.channelData?.notification;
		}
		constructor(value) {
			Object.assign(this, {
				channelId: "msteams",
				...value
			});
		}
		static from(activity) {
			return new Activity(activity);
		}
		toInterface() {
			return Object.assign({}, this);
		}
		clone(options = {}) {
			return new Activity({
				...this.toInterface(),
				...options
			});
		}
		withId(value) {
			this.id = value;
			return this;
		}
		withReplyToId(value) {
			this.replyToId = value;
			return this;
		}
		withChannelId(value) {
			this.channelId = value;
			return this;
		}
		withFrom(value) {
			this.from = value;
			return this;
		}
		withConversation(value) {
			this.conversation = value;
			return this;
		}
		withRelatesTo(value) {
			this.relatesTo = value;
			return this;
		}
		/**
		* Set the recipient of this activity, optionally marking it as a targeted message.
		* Targeted messages are ephemeral to the specified recipient in a shared conversation.
		* @param value - The recipient account
		* @param isTargeted - If true, marks this as a targeted message visible only to the recipient (default: false)
		* @returns this instance for chaining
		*
		* @experimental This API is in preview and may change in the future.
		* Diagnostic: ExperimentalTeamsTargeted
		*/
		withRecipient(value, isTargeted = false) {
			this.recipient = {
				...value,
				isTargeted: isTargeted ? true : void 0
			};
			return this;
		}
		withServiceUrl(value) {
			this.serviceUrl = value;
			return this;
		}
		withTimestamp(value) {
			this.timestamp = value;
			return this;
		}
		withLocale(value) {
			this.locale = value;
			return this;
		}
		withLocalTimestamp(value) {
			this.localTimestamp = value;
			return this;
		}
		withChannelData(value) {
			this.channelData = {
				...this.channelData,
				...value
			};
			return this;
		}
		/**
		* Add an entity.
		*/
		addEntity(value) {
			if (!this.entities) this.entities = [];
			this.entities.push(value);
			return this;
		}
		/**
		* Add multiple entities
		*/
		addEntities(...value) {
			if (!this.entities) this.entities = [];
			this.entities.push(...value);
			return this;
		}
		/**
		* Add the `Generated By AI` label.
		*/
		addAiGenerated() {
			const messageEntity = this.ensureSingleRootLevelMessageEntity();
			if (messageEntity.additionalType?.includes("AIGeneratedContent")) return this;
			if (!messageEntity.additionalType) messageEntity.additionalType = [];
			messageEntity.additionalType.push("AIGeneratedContent");
			return this;
		}
		/**
		* Enable message feedback
		*/
		addFeedback() {
			if (!this.channelData) this.channelData = {};
			this.channelData.feedbackLoopEnabled = true;
			return this;
		}
		/**
		* Add citations
		*/
		addCitation(position, appearance) {
			const messageEntity = this.ensureSingleRootLevelMessageEntity();
			if (!messageEntity.citation) messageEntity.citation = [];
			messageEntity.citation.push({
				"@type": "Claim",
				position,
				appearance: {
					"@type": "DigitalDocument",
					abstract: appearance.abstract,
					name: appearance.name,
					encodingFormat: "application/vnd.microsoft.card.adaptive",
					image: appearance.icon ? {
						"@type": "ImageObject",
						name: appearance.icon
					} : void 0,
					keywords: appearance.keywords,
					text: appearance.text,
					url: appearance.url,
					usageInfo: appearance.usageInfo
				}
			});
			return this;
		}
		/**
		* is this a streaming activity
		*/
		isStreaming() {
			return this.entities?.some((e) => e.type === "streaminfo") || false;
		}
		/**
		* Get or create the base message entity.
		* There should only be one root level message entity.
		*/
		ensureSingleRootLevelMessageEntity() {
			let mesageEntity = this.entities?.find((e) => e.type === "https://schema.org/Message" && e["@type"] === "Message");
			if (!mesageEntity) {
				mesageEntity = {
					type: "https://schema.org/Message",
					"@type": "Message",
					"@context": "https://schema.org",
					"@id": ""
				};
				this.addEntity(mesageEntity);
			}
			return mesageEntity;
		}
	};
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/message/message-delete.js
var require_message_delete = /* @__PURE__ */ __commonJSMin(((exports) => {
	var activity = require_activity();
	exports.MessageDeleteActivity = class MessageDeleteActivity extends activity.Activity {
		constructor(value = {}) {
			super({
				...value,
				type: "messageDelete",
				channelData: {
					...value.channelData,
					eventType: "softDeleteMessage"
				}
			});
			Object.assign(this, {
				...value,
				channelData: {
					...value.channelData,
					eventType: "softDeleteMessage"
				}
			});
		}
		/**
		* initialize from interface
		*/
		static from(activity) {
			return new MessageDeleteActivity(activity);
		}
		/**
		* convert to interface
		*/
		toInterface() {
			return Object.assign({}, this);
		}
		/**
		* copy to a new instance
		*/
		clone(options = {}) {
			return new MessageDeleteActivity({
				...this.toInterface(),
				...options
			});
		}
	};
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/utils/strip-mentions-text.js
var require_strip_mentions_text = /* @__PURE__ */ __commonJSMin(((exports) => {
	function stripMentionsText(activity, { accountId, tagOnly } = {}) {
		if (!activity.text) return;
		let text = activity.text;
		for (const mention of activity.entities?.filter((e) => e.type === "mention") || []) {
			if (accountId && mention.mentioned.id !== accountId) continue;
			if (mention.text) {
				const textWithoutTags = mention.text.replace("<at>", "").replace("</at>", "");
				text = text.replace(mention.text, !tagOnly ? "" : textWithoutTags);
			} else text = text.replace(`<at>${mention.mentioned.name}</at>`, !tagOnly ? "" : mention.mentioned.name);
		}
		return text.trim();
	}
	exports.stripMentionsText = stripMentionsText;
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/core.js
var require_core = /* @__PURE__ */ __commonJSMin(((exports) => {
	function isAdaptiveCard(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "AdaptiveCard";
	}
	var AdaptiveCard = class {
		/**
		* Must be **AdaptiveCard**.
		*/
		type = "AdaptiveCard";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* An Action that will be invoked when the element is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The style of the container. Container styles control the colors of the background, border and text inside the container, in such a way that contrast requirements are always met.
		*/
		style;
		/**
		* The layouts associated with the container. The container can dynamically switch from one layout to another as the card's width changes. See [Container layouts](https://adaptivecards.microsoft.com/?topic=container-layouts) for more details.
		*/
		layouts;
		/**
		* The minimum height, in pixels, of the container, in the `<number>px` format.
		*/
		minHeight;
		/**
		* Defines the container's background image.
		*/
		backgroundImage;
		/**
		* Controls how the container's content should be vertically aligned.
		*/
		verticalContentAlignment;
		/**
		* Controls if the content of the card is to be rendered left-to-right or right-to-left.
		*/
		rtl;
		/**
		* A URL to the Adaptive Card schema the card is authored against.
		*/
		$schema;
		/**
		* The Adaptive Card schema version the card is authored against.
		*/
		version;
		/**
		* The text that should be displayed if the client is not able to render the card.
		*/
		fallbackText;
		/**
		* The text that should be spoken for the entire card.
		*/
		speak;
		/**
		* Defines how the card can be refreshed by making a request to the target Bot.
		*/
		refresh;
		/**
		* Defines authentication information to enable on-behalf-of single-sign-on or just-in-time OAuth. This information is used in conjunction with the refresh property and Action.Execute in general.
		*/
		authentication;
		/**
		* Teams-specific metadata associated with the card.
		*/
		msTeams;
		/**
		* Metadata associated with the card.
		*/
		metadata;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The body of the card, comprised of a list of elements displayed according to the layouts property. If the layouts property is not specified, a Layout.Stack is used.
		*/
		body;
		/**
		* The card level actions, which always appear at the bottom of the card.
		*/
		actions;
		constructor(...body) {
			this.body = body;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withLayouts(...layouts) {
			this.layouts = layouts;
			return this;
		}
		withMinHeight(minHeight) {
			this.minHeight = minHeight;
			return this;
		}
		withBackgroundImage(backgroundImage) {
			this.backgroundImage = backgroundImage;
			return this;
		}
		withVerticalContentAlignment(verticalContentAlignment) {
			this.verticalContentAlignment = verticalContentAlignment;
			return this;
		}
		withRtl(rtl) {
			this.rtl = rtl;
			return this;
		}
		with$schema($schema) {
			this.$schema = $schema;
			return this;
		}
		withVersion(version) {
			this.version = version;
			return this;
		}
		withFallbackText(fallbackText) {
			this.fallbackText = fallbackText;
			return this;
		}
		withSpeak(speak) {
			this.speak = speak;
			return this;
		}
		withRefresh(refresh) {
			this.refresh = refresh;
			return this;
		}
		withAuthentication(authentication) {
			this.authentication = authentication;
			return this;
		}
		withMsTeams(msTeams) {
			this.msTeams = msTeams;
			return this;
		}
		withMetadata(metadata) {
			this.metadata = metadata;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withBody(...body) {
			this.body = body;
			return this;
		}
		withActions(...actions) {
			this.actions = actions;
			return this;
		}
	};
	var HostCapabilities = class {};
	function isExecuteAction(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Action.Execute";
	}
	var ExecuteAction = class ExecuteAction {
		/**
		* Must be **Action.Execute**.
		*/
		type = "Action.Execute";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The title of the action, as it appears on buttons.
		*/
		title;
		/**
		* A URL (or Base64-encoded Data URI) to a PNG, GIF, JPEG or SVG image to be displayed on the left of the action's title.
		
		`iconUrl` also accepts the `<icon-name>[,regular|filled]` format to display an icon from the vast [Adaptive Card icon catalog](https://adaptivecards.microsoft.com/?topic=icon-catalog) instead of an image.
		*/
		iconUrl;
		/**
		* Control the style of the action, affecting its visual and spoken representations.
		*/
		style;
		/**
		* Controls if the action is primary or secondary. Secondary actions appear in an overflow menu.
		*/
		mode;
		/**
		* The tooltip text to display when the action is hovered over.
		*/
		tooltip;
		/**
		* Controls the enabled state of the action. A disabled action cannot be clicked. If the action is represented as a button, the button's style will reflect this state.
		*/
		isEnabled;
		/**
		* The data to send to the Bot when the action is executed. The data specified in the card payload will be sent back to the Bot as is, alongside the values of the inputs expressed as key/value pairs where the key is the Id of the input.
		*/
		data;
		/**
		* The Ids of the inputs associated with the Action.Submit. When the action is executed, the values of the associated inputs are sent to the Bot. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		associatedInputs;
		/**
		* Controls if the action is enabled only if at least one required input has been filled by the user.
		*/
		conditionallyEnabled;
		/**
		* The verb of the action.
		*/
		verb;
		/**
		* An alternate action to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ExecuteAction(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withIconUrl(iconUrl) {
			this.iconUrl = iconUrl;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withMode(mode) {
			this.mode = mode;
			return this;
		}
		withTooltip(tooltip) {
			this.tooltip = tooltip;
			return this;
		}
		withIsEnabled(isEnabled = false) {
			this.isEnabled = isEnabled;
			return this;
		}
		withData(data) {
			this.data = data;
			return this;
		}
		withAssociatedInputs(associatedInputs) {
			this.associatedInputs = associatedInputs;
			return this;
		}
		withConditionallyEnabled(conditionallyEnabled = true) {
			this.conditionallyEnabled = conditionallyEnabled;
			return this;
		}
		withVerb(verb) {
			this.verb = verb;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isSubmitAction(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Action.Submit";
	}
	var SubmitAction = class SubmitAction {
		/**
		* Must be **Action.Submit**.
		*/
		type = "Action.Submit";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The title of the action, as it appears on buttons.
		*/
		title;
		/**
		* A URL (or Base64-encoded Data URI) to a PNG, GIF, JPEG or SVG image to be displayed on the left of the action's title.
		
		`iconUrl` also accepts the `<icon-name>[,regular|filled]` format to display an icon from the vast [Adaptive Card icon catalog](https://adaptivecards.microsoft.com/?topic=icon-catalog) instead of an image.
		*/
		iconUrl;
		/**
		* Control the style of the action, affecting its visual and spoken representations.
		*/
		style;
		/**
		* Controls if the action is primary or secondary. Secondary actions appear in an overflow menu.
		*/
		mode;
		/**
		* The tooltip text to display when the action is hovered over.
		*/
		tooltip;
		/**
		* Controls the enabled state of the action. A disabled action cannot be clicked. If the action is represented as a button, the button's style will reflect this state.
		*/
		isEnabled;
		/**
		* The data to send to the Bot when the action is executed. The data specified in the card payload will be sent back to the Bot as is, alongside the values of the inputs expressed as key/value pairs where the key is the Id of the input.
		*/
		data;
		/**
		* The Ids of the inputs associated with the Action.Submit. When the action is executed, the values of the associated inputs are sent to the Bot. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		associatedInputs;
		/**
		* Controls if the action is enabled only if at least one required input has been filled by the user.
		*/
		conditionallyEnabled;
		/**
		* Teams-specific metadata associated with the action.
		*/
		msTeams;
		/**
		* An alternate action to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new SubmitAction(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withIconUrl(iconUrl) {
			this.iconUrl = iconUrl;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withMode(mode) {
			this.mode = mode;
			return this;
		}
		withTooltip(tooltip) {
			this.tooltip = tooltip;
			return this;
		}
		withIsEnabled(isEnabled = false) {
			this.isEnabled = isEnabled;
			return this;
		}
		withData(data) {
			this.data = data;
			return this;
		}
		withAssociatedInputs(associatedInputs) {
			this.associatedInputs = associatedInputs;
			return this;
		}
		withConditionallyEnabled(conditionallyEnabled = true) {
			this.conditionallyEnabled = conditionallyEnabled;
			return this;
		}
		withMsTeams(msTeams) {
			this.msTeams = msTeams;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var TeamsSubmitActionProperties = class TeamsSubmitActionProperties {
		/**
		* Defines how feedback is provided to the end-user when the action is executed.
		*/
		feedback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TeamsSubmitActionProperties(options);
		}
		withFeedback(feedback) {
			this.feedback = feedback;
			return this;
		}
	};
	var TeamsSubmitActionFeedback = class TeamsSubmitActionFeedback {
		/**
		* Defines if a feedback message should be displayed after the action is executed.
		*/
		hide;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TeamsSubmitActionFeedback(options);
		}
		withHide(hide) {
			this.hide = hide;
			return this;
		}
	};
	function isOpenUrlAction(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Action.OpenUrl";
	}
	var OpenUrlAction = class OpenUrlAction {
		/**
		* Must be **Action.OpenUrl**.
		*/
		type = "Action.OpenUrl";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The title of the action, as it appears on buttons.
		*/
		title;
		/**
		* A URL (or Base64-encoded Data URI) to a PNG, GIF, JPEG or SVG image to be displayed on the left of the action's title.
		
		`iconUrl` also accepts the `<icon-name>[,regular|filled]` format to display an icon from the vast [Adaptive Card icon catalog](https://adaptivecards.microsoft.com/?topic=icon-catalog) instead of an image.
		*/
		iconUrl;
		/**
		* Control the style of the action, affecting its visual and spoken representations.
		*/
		style;
		/**
		* Controls if the action is primary or secondary. Secondary actions appear in an overflow menu.
		*/
		mode;
		/**
		* The tooltip text to display when the action is hovered over.
		*/
		tooltip;
		/**
		* Controls the enabled state of the action. A disabled action cannot be clicked. If the action is represented as a button, the button's style will reflect this state.
		*/
		isEnabled;
		/**
		* The URL to open.
		*/
		url;
		/**
		* An alternate action to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(url, options = {}) {
			Object.assign(this, options);
			this.url = url;
		}
		static from(options) {
			return new OpenUrlAction(options.url, options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withIconUrl(iconUrl) {
			this.iconUrl = iconUrl;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withMode(mode) {
			this.mode = mode;
			return this;
		}
		withTooltip(tooltip) {
			this.tooltip = tooltip;
			return this;
		}
		withIsEnabled(isEnabled = false) {
			this.isEnabled = isEnabled;
			return this;
		}
		withUrl(url) {
			this.url = url;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isToggleVisibilityAction(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Action.ToggleVisibility";
	}
	var ToggleVisibilityAction = class ToggleVisibilityAction {
		/**
		* Must be **Action.ToggleVisibility**.
		*/
		type = "Action.ToggleVisibility";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The title of the action, as it appears on buttons.
		*/
		title;
		/**
		* A URL (or Base64-encoded Data URI) to a PNG, GIF, JPEG or SVG image to be displayed on the left of the action's title.
		
		`iconUrl` also accepts the `<icon-name>[,regular|filled]` format to display an icon from the vast [Adaptive Card icon catalog](https://adaptivecards.microsoft.com/?topic=icon-catalog) instead of an image.
		*/
		iconUrl;
		/**
		* Control the style of the action, affecting its visual and spoken representations.
		*/
		style;
		/**
		* Controls if the action is primary or secondary. Secondary actions appear in an overflow menu.
		*/
		mode;
		/**
		* The tooltip text to display when the action is hovered over.
		*/
		tooltip;
		/**
		* Controls the enabled state of the action. A disabled action cannot be clicked. If the action is represented as a button, the button's style will reflect this state.
		*/
		isEnabled;
		/**
		* The Ids of the elements to toggle the visibility of.
		*/
		targetElements;
		/**
		* An alternate action to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ToggleVisibilityAction(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withIconUrl(iconUrl) {
			this.iconUrl = iconUrl;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withMode(mode) {
			this.mode = mode;
			return this;
		}
		withTooltip(tooltip) {
			this.tooltip = tooltip;
			return this;
		}
		withIsEnabled(isEnabled = false) {
			this.isEnabled = isEnabled;
			return this;
		}
		withTargetElements(...targetElements) {
			this.targetElements = targetElements;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var TargetElement = class TargetElement {
		/**
		* The Id of the element to change the visibility of.
		*/
		elementId;
		/**
		* The new visibility state of the element.
		*/
		isVisible;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TargetElement(options);
		}
		withElementId(elementId) {
			this.elementId = elementId;
			return this;
		}
		withIsVisible(isVisible) {
			this.isVisible = isVisible;
			return this;
		}
	};
	function isShowCardAction(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Action.ShowCard";
	}
	var ShowCardAction = class ShowCardAction {
		/**
		* Must be **Action.ShowCard**.
		*/
		type = "Action.ShowCard";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The title of the action, as it appears on buttons.
		*/
		title;
		/**
		* A URL (or Base64-encoded Data URI) to a PNG, GIF, JPEG or SVG image to be displayed on the left of the action's title.
		
		`iconUrl` also accepts the `<icon-name>[,regular|filled]` format to display an icon from the vast [Adaptive Card icon catalog](https://adaptivecards.microsoft.com/?topic=icon-catalog) instead of an image.
		*/
		iconUrl;
		/**
		* Control the style of the action, affecting its visual and spoken representations.
		*/
		style;
		/**
		* Controls if the action is primary or secondary. Secondary actions appear in an overflow menu.
		*/
		mode;
		/**
		* The tooltip text to display when the action is hovered over.
		*/
		tooltip;
		/**
		* Controls the enabled state of the action. A disabled action cannot be clicked. If the action is represented as a button, the button's style will reflect this state.
		*/
		isEnabled;
		/**
		* An alternate action to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The card that should be displayed when the action is executed.
		*/
		card;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ShowCardAction(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withIconUrl(iconUrl) {
			this.iconUrl = iconUrl;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withMode(mode) {
			this.mode = mode;
			return this;
		}
		withTooltip(tooltip) {
			this.tooltip = tooltip;
			return this;
		}
		withIsEnabled(isEnabled = false) {
			this.isEnabled = isEnabled;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withCard(card) {
			this.card = card;
			return this;
		}
	};
	function isResetInputsAction(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Action.ResetInputs";
	}
	var ResetInputsAction = class ResetInputsAction {
		/**
		* Must be **Action.ResetInputs**.
		*/
		type = "Action.ResetInputs";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The title of the action, as it appears on buttons.
		*/
		title;
		/**
		* A URL (or Base64-encoded Data URI) to a PNG, GIF, JPEG or SVG image to be displayed on the left of the action's title.
		
		`iconUrl` also accepts the `<icon-name>[,regular|filled]` format to display an icon from the vast [Adaptive Card icon catalog](https://adaptivecards.microsoft.com/?topic=icon-catalog) instead of an image.
		*/
		iconUrl;
		/**
		* Control the style of the action, affecting its visual and spoken representations.
		*/
		style;
		/**
		* Controls if the action is primary or secondary. Secondary actions appear in an overflow menu.
		*/
		mode;
		/**
		* The tooltip text to display when the action is hovered over.
		*/
		tooltip;
		/**
		* Controls the enabled state of the action. A disabled action cannot be clicked. If the action is represented as a button, the button's style will reflect this state.
		*/
		isEnabled;
		/**
		* The Ids of the inputs that should be reset.
		*/
		targetInputIds;
		/**
		* An alternate action to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ResetInputsAction(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withIconUrl(iconUrl) {
			this.iconUrl = iconUrl;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withMode(mode) {
			this.mode = mode;
			return this;
		}
		withTooltip(tooltip) {
			this.tooltip = tooltip;
			return this;
		}
		withIsEnabled(isEnabled = false) {
			this.isEnabled = isEnabled;
			return this;
		}
		withTargetInputIds(...targetInputIds) {
			this.targetInputIds = targetInputIds;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isStackLayout(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Layout.Stack";
	}
	var StackLayout = class StackLayout {
		/**
		* Must be **Layout.Stack**.
		*/
		type = "Layout.Stack";
		/**
		* Controls for which card width the layout should be used.
		*/
		targetWidth;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new StackLayout(options);
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
	};
	function isFlowLayout(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Layout.Flow";
	}
	var FlowLayout = class FlowLayout {
		/**
		* Must be **Layout.Flow**.
		*/
		type = "Layout.Flow";
		/**
		* Controls for which card width the layout should be used.
		*/
		targetWidth;
		/**
		* Controls how the content of the container should be horizontally aligned.
		*/
		horizontalItemsAlignment;
		/**
		* Controls how the content of the container should be vertically aligned.
		*/
		verticalItemsAlignment;
		/**
		* Controls how item should fit inside the container.
		*/
		itemFit;
		/**
		* The minimum width, in pixels, of each item, in the `<number>px` format. Should not be used if itemWidth is set.
		*/
		minItemWidth;
		/**
		* The maximum width, in pixels, of each item, in the `<number>px` format. Should not be used if itemWidth is set.
		*/
		maxItemWidth;
		/**
		* The width, in pixels, of each item, in the `<number>px` format. Should not be used if maxItemWidth and/or minItemWidth are set.
		*/
		itemWidth;
		/**
		* The space between items.
		*/
		columnSpacing;
		/**
		* The space between rows of items.
		*/
		rowSpacing;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new FlowLayout(options);
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withHorizontalItemsAlignment(horizontalItemsAlignment) {
			this.horizontalItemsAlignment = horizontalItemsAlignment;
			return this;
		}
		withVerticalItemsAlignment(verticalItemsAlignment) {
			this.verticalItemsAlignment = verticalItemsAlignment;
			return this;
		}
		withItemFit(itemFit) {
			this.itemFit = itemFit;
			return this;
		}
		withMinItemWidth(minItemWidth) {
			this.minItemWidth = minItemWidth;
			return this;
		}
		withMaxItemWidth(maxItemWidth) {
			this.maxItemWidth = maxItemWidth;
			return this;
		}
		withItemWidth(itemWidth) {
			this.itemWidth = itemWidth;
			return this;
		}
		withColumnSpacing(columnSpacing) {
			this.columnSpacing = columnSpacing;
			return this;
		}
		withRowSpacing(rowSpacing) {
			this.rowSpacing = rowSpacing;
			return this;
		}
	};
	function isAreaGridLayout(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Layout.AreaGrid";
	}
	var AreaGridLayout = class AreaGridLayout {
		/**
		* Must be **Layout.AreaGrid**.
		*/
		type = "Layout.AreaGrid";
		/**
		* Controls for which card width the layout should be used.
		*/
		targetWidth;
		/**
		* The columns in the grid layout, defined as a percentage of the available width or in pixels using the `<number>px` format.
		*/
		columns;
		/**
		* The areas in the grid layout.
		*/
		areas;
		/**
		* The space between columns.
		*/
		columnSpacing;
		/**
		* The space between rows.
		*/
		rowSpacing;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new AreaGridLayout(options);
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withColumns(...columns) {
			this.columns = columns;
			return this;
		}
		withAreas(...areas) {
			this.areas = areas;
			return this;
		}
		withColumnSpacing(columnSpacing) {
			this.columnSpacing = columnSpacing;
			return this;
		}
		withRowSpacing(rowSpacing) {
			this.rowSpacing = rowSpacing;
			return this;
		}
	};
	var GridArea = class GridArea {
		/**
		* The name of the area. To place an element in this area, set its `grid.area` property to match the name of the area.
		*/
		name;
		/**
		* The start column index of the area. Column indices start at 1.
		*/
		column;
		/**
		* Defines how many columns the area should span.
		*/
		columnSpan;
		/**
		* The start row index of the area. Row indices start at 1.
		*/
		row;
		/**
		* Defines how many rows the area should span.
		*/
		rowSpan;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new GridArea(options);
		}
		withName(name) {
			this.name = name;
			return this;
		}
		withColumn(column) {
			this.column = column;
			return this;
		}
		withColumnSpan(columnSpan) {
			this.columnSpan = columnSpan;
			return this;
		}
		withRow(row) {
			this.row = row;
			return this;
		}
		withRowSpan(rowSpan) {
			this.rowSpan = rowSpan;
			return this;
		}
	};
	var BackgroundImage = class BackgroundImage {
		/**
		* The URL (or Base64-encoded Data URI) of the image. Acceptable formats are PNG, JPEG, GIF and SVG.
		*/
		url;
		/**
		* Controls how the image should fill the area.
		*/
		fillMode;
		/**
		* Controls how the image should be aligned if it must be cropped or if using repeat fill mode.
		*/
		horizontalAlignment;
		/**
		* Controls how the image should be aligned if it must be cropped or if using repeat fill mode.
		*/
		verticalAlignment;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new BackgroundImage(options);
		}
		withUrl(url) {
			this.url = url;
			return this;
		}
		withFillMode(fillMode) {
			this.fillMode = fillMode;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withVerticalAlignment(verticalAlignment) {
			this.verticalAlignment = verticalAlignment;
			return this;
		}
	};
	var RefreshDefinition = class RefreshDefinition {
		/**
		* The Action.Execute action to invoke to refresh the card.
		*/
		action;
		/**
		* The list of user Ids for which the card will be automatically refreshed. In Teams, in chats or channels with more than 60 users, the card will automatically refresh only for users specified in the userIds list. Other users will have to manually click on a "refresh" button. In contexts with fewer than 60 users, the card will automatically refresh for all users.
		*/
		userIds;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new RefreshDefinition(options);
		}
		withAction(action) {
			this.action = action;
			return this;
		}
		withUserIds(...userIds) {
			this.userIds = userIds;
			return this;
		}
	};
	var Authentication = class Authentication {
		/**
		* The text that can be displayed to the end user when prompting them to authenticate.
		*/
		text;
		/**
		* The identifier for registered OAuth connection setting information.
		*/
		connectionName;
		/**
		* The buttons that should be displayed to the user when prompting for authentication. The array MUST contain one button of type “signin”. Other button types are not currently supported.
		*/
		buttons;
		/**
		* Provides information required to enable on-behalf-of single sign-on user authentication.
		*/
		tokenExchangeResource;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new Authentication(options);
		}
		withText(text) {
			this.text = text;
			return this;
		}
		withConnectionName(connectionName) {
			this.connectionName = connectionName;
			return this;
		}
		withButtons(...buttons) {
			this.buttons = buttons;
			return this;
		}
		withTokenExchangeResource(tokenExchangeResource) {
			this.tokenExchangeResource = tokenExchangeResource;
			return this;
		}
	};
	var AuthCardButton = class AuthCardButton {
		/**
		* Must be **signin**.
		*/
		type;
		/**
		* The caption of the button.
		*/
		title;
		/**
		* A URL to an image to display alongside the button’s caption.
		*/
		image;
		/**
		* The value associated with the button. The meaning of value depends on the button’s type.
		*/
		value;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new AuthCardButton(options);
		}
		withType(type) {
			this.type = type;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withImage(image) {
			this.image = image;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
	};
	var TokenExchangeResource = class TokenExchangeResource {
		/**
		* The unique identified of this token exchange instance.
		*/
		id;
		/**
		* An application ID or resource identifier with which to exchange a token on behalf of. This property is identity provider- and application-specific.
		*/
		uri;
		/**
		* An identifier for the identity provider with which to attempt a token exchange.
		*/
		providerId;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TokenExchangeResource(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withUri(uri) {
			this.uri = uri;
			return this;
		}
		withProviderId(providerId) {
			this.providerId = providerId;
			return this;
		}
	};
	var TeamsCardProperties = class TeamsCardProperties {
		/**
		* Controls the width of the card in a Teams chat.
		
		Note that setting `width` to "full" will not actually stretch the card to the "full width" of the chat pane. It will only make the card wider than when the `width` property isn't set.
		*/
		width;
		/**
		* The Teams-specific entities associated with the card.
		*/
		entities;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TeamsCardProperties(options);
		}
		withWidth(width) {
			this.width = width;
			return this;
		}
		withEntities(...entities) {
			this.entities = entities;
			return this;
		}
	};
	function isMention(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "mention";
	}
	var Mention = class Mention {
		/**
		* Must be **mention**.
		*/
		type = "mention";
		/**
		* The text that will be substituted with the mention.
		*/
		text;
		/**
		* Defines the entity being mentioned.
		*/
		mentioned;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new Mention(options);
		}
		withText(text) {
			this.text = text;
			return this;
		}
		withMentioned(mentioned) {
			this.mentioned = mentioned;
			return this;
		}
	};
	var MentionedEntity = class MentionedEntity {
		/**
		* The Id of a person (typically a Microsoft Entra user Id) or tag.
		*/
		id;
		/**
		* The name of the mentioned entity.
		*/
		name;
		/**
		* The type of the mentioned entity.
		*/
		mentionType;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new MentionedEntity(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withName(name) {
			this.name = name;
			return this;
		}
		withMentionType(mentionType) {
			this.mentionType = mentionType;
			return this;
		}
	};
	var CardMetadata = class CardMetadata {
		/**
		* The URL the card originates from. When `webUrl` is set, the card is dubbed an **Adaptive Card-based Loop Component** and, when pasted in Teams or other Loop Component-capable host applications, the URL will unfurl to the same exact card.
		*/
		webUrl;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new CardMetadata(options);
		}
		withWebUrl(webUrl) {
			this.webUrl = webUrl;
			return this;
		}
	};
	function isContainer(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Container";
	}
	var Container = class {
		/**
		* Must be **Container**.
		*/
		type = "Container";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* An Action that will be invoked when the element is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The style of the container. Container styles control the colors of the background, border and text inside the container, in such a way that contrast requirements are always met.
		*/
		style;
		/**
		* Controls if a border should be displayed around the container.
		*/
		showBorder;
		/**
		* Controls if the container should have rounded corners.
		*/
		roundedCorners;
		/**
		* The layouts associated with the container. The container can dynamically switch from one layout to another as the card's width changes. See [Container layouts](https://adaptivecards.microsoft.com/?topic=container-layouts) for more details.
		*/
		layouts;
		/**
		* Controls if the container should bleed into its parent. A bleeding container extends into its parent's padding.
		*/
		bleed;
		/**
		* The minimum height, in pixels, of the container, in the `<number>px` format.
		*/
		minHeight;
		/**
		* Defines the container's background image.
		*/
		backgroundImage;
		/**
		* Controls how the container's content should be vertically aligned.
		*/
		verticalContentAlignment;
		/**
		* Controls if the content of the card is to be rendered left-to-right or right-to-left.
		*/
		rtl;
		/**
		* The maximum height, in pixels, of the container, in the `<number>px` format. When the content of a container exceeds the container's maximum height, a vertical scrollbar is displayed.
		*/
		maxHeight;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The elements in the container.
		*/
		items;
		constructor(...items) {
			this.items = items;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withShowBorder(showBorder = true) {
			this.showBorder = showBorder;
			return this;
		}
		withRoundedCorners(roundedCorners = true) {
			this.roundedCorners = roundedCorners;
			return this;
		}
		withLayouts(...layouts) {
			this.layouts = layouts;
			return this;
		}
		withBleed(bleed = true) {
			this.bleed = bleed;
			return this;
		}
		withMinHeight(minHeight) {
			this.minHeight = minHeight;
			return this;
		}
		withBackgroundImage(backgroundImage) {
			this.backgroundImage = backgroundImage;
			return this;
		}
		withVerticalContentAlignment(verticalContentAlignment) {
			this.verticalContentAlignment = verticalContentAlignment;
			return this;
		}
		withRtl(rtl) {
			this.rtl = rtl;
			return this;
		}
		withMaxHeight(maxHeight) {
			this.maxHeight = maxHeight;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withItems(...items) {
			this.items = items;
			return this;
		}
	};
	function isActionSet(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "ActionSet";
	}
	var ActionSet = class {
		/**
		* Must be **ActionSet**.
		*/
		type = "ActionSet";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The actions in the set.
		*/
		actions;
		constructor(...actions) {
			this.actions = actions;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withActions(...actions) {
			this.actions = actions;
			return this;
		}
	};
	function isColumnSet(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "ColumnSet";
	}
	var ColumnSet = class ColumnSet {
		/**
		* Must be **ColumnSet**.
		*/
		type = "ColumnSet";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* An Action that will be invoked when the element is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The style of the container. Container styles control the colors of the background, border and text inside the container, in such a way that contrast requirements are always met.
		*/
		style;
		/**
		* Controls if a border should be displayed around the container.
		*/
		showBorder;
		/**
		* Controls if the container should have rounded corners.
		*/
		roundedCorners;
		/**
		* Controls if the container should bleed into its parent. A bleeding container extends into its parent's padding.
		*/
		bleed;
		/**
		* The minimum height, in pixels, of the container, in the `<number>px` format.
		*/
		minHeight;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The columns in the set.
		*/
		columns;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ColumnSet(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withShowBorder(showBorder = true) {
			this.showBorder = showBorder;
			return this;
		}
		withRoundedCorners(roundedCorners = true) {
			this.roundedCorners = roundedCorners;
			return this;
		}
		withBleed(bleed = true) {
			this.bleed = bleed;
			return this;
		}
		withMinHeight(minHeight) {
			this.minHeight = minHeight;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withColumns(...columns) {
			this.columns = columns;
			return this;
		}
	};
	function isMedia(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Media";
	}
	var Media = class Media {
		/**
		* Must be **Media**.
		*/
		type = "Media";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The sources for the media. For YouTube, Dailymotion and Vimeo, only one source can be specified.
		*/
		sources;
		/**
		* The caption sources for the media. Caption sources are not used for YouTube, Dailymotion or Vimeo sources.
		*/
		captionSources;
		/**
		* The URL of the poster image to display.
		*/
		poster;
		/**
		* The alternate text for the media, used for accessibility purposes.
		*/
		altText;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new Media(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withSources(...sources) {
			this.sources = sources;
			return this;
		}
		withCaptionSources(...captionSources) {
			this.captionSources = captionSources;
			return this;
		}
		withPoster(poster) {
			this.poster = poster;
			return this;
		}
		withAltText(altText) {
			this.altText = altText;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var MediaSource = class MediaSource {
		/**
		* The MIME type of the source.
		*/
		mimeType;
		/**
		* The URL of the source.
		*/
		url;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new MediaSource(options);
		}
		withMimeType(mimeType) {
			this.mimeType = mimeType;
			return this;
		}
		withUrl(url) {
			this.url = url;
			return this;
		}
	};
	var CaptionSource = class CaptionSource {
		/**
		* The MIME type of the source.
		*/
		mimeType;
		/**
		* The URL of the source.
		*/
		url;
		/**
		* The label of this caption source.
		*/
		label;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new CaptionSource(options);
		}
		withMimeType(mimeType) {
			this.mimeType = mimeType;
			return this;
		}
		withUrl(url) {
			this.url = url;
			return this;
		}
		withLabel(label) {
			this.label = label;
			return this;
		}
	};
	function isRichTextBlock(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "RichTextBlock";
	}
	var RichTextBlock = class RichTextBlock {
		/**
		* Must be **RichTextBlock**.
		*/
		type = "RichTextBlock";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The inlines making up the rich text block.
		*/
		inlines;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new RichTextBlock(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withInlines(...inlines) {
			this.inlines = inlines;
			return this;
		}
	};
	function isTable(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Table";
	}
	var Table = class Table {
		/**
		* Must be **Table**.
		*/
		type = "Table";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The style of the container. Container styles control the colors of the background, border and text inside the container, in such a way that contrast requirements are always met.
		*/
		style;
		/**
		* Controls if a border should be displayed around the container.
		*/
		showBorder;
		/**
		* Controls if the container should have rounded corners.
		*/
		roundedCorners;
		/**
		* The columns in the table.
		*/
		columns;
		/**
		* Controls whether the first row of the table should be treated as a header.
		*/
		firstRowAsHeaders;
		/**
		* Controls if grid lines should be displayed.
		*/
		showGridLines;
		/**
		* The style of the grid lines between cells.
		*/
		gridStyle;
		/**
		* Controls how the content of every cell in the table should be horizontally aligned by default.
		*/
		horizontalCellContentAlignment;
		/**
		* Controls how the content of every cell in the table should be vertically aligned by default.
		*/
		verticalCellContentAlignment;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The rows of the table.
		*/
		rows;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new Table(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withShowBorder(showBorder = true) {
			this.showBorder = showBorder;
			return this;
		}
		withRoundedCorners(roundedCorners = true) {
			this.roundedCorners = roundedCorners;
			return this;
		}
		withColumns(...columns) {
			this.columns = columns;
			return this;
		}
		withFirstRowAsHeaders(firstRowAsHeaders = false) {
			this.firstRowAsHeaders = firstRowAsHeaders;
			return this;
		}
		withShowGridLines(showGridLines = false) {
			this.showGridLines = showGridLines;
			return this;
		}
		withGridStyle(gridStyle) {
			this.gridStyle = gridStyle;
			return this;
		}
		withHorizontalCellContentAlignment(horizontalCellContentAlignment) {
			this.horizontalCellContentAlignment = horizontalCellContentAlignment;
			return this;
		}
		withVerticalCellContentAlignment(verticalCellContentAlignment) {
			this.verticalCellContentAlignment = verticalCellContentAlignment;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withRows(...rows) {
			this.rows = rows;
			return this;
		}
	};
	var ColumnDefinition = class ColumnDefinition {
		/**
		* Controls how the content of every cell in the table should be horizontally aligned by default. This property overrides the horizontalCellContentAlignment property of the table.
		*/
		horizontalCellContentAlignment;
		/**
		* Controls how the content of every cell in the column should be vertically aligned by default. This property overrides the verticalCellContentAlignment property of the table.
		*/
		verticalCellContentAlignment;
		/**
		* The width of the column in the table, expressed as either a percentage of the available width or in pixels, using the `<number>px` format.
		*/
		width;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ColumnDefinition(options);
		}
		withHorizontalCellContentAlignment(horizontalCellContentAlignment) {
			this.horizontalCellContentAlignment = horizontalCellContentAlignment;
			return this;
		}
		withVerticalCellContentAlignment(verticalCellContentAlignment) {
			this.verticalCellContentAlignment = verticalCellContentAlignment;
			return this;
		}
		withWidth(width) {
			this.width = width;
			return this;
		}
	};
	function isTextBlock(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "TextBlock";
	}
	var TextBlock = class TextBlock {
		/**
		* Must be **TextBlock**.
		*/
		type = "TextBlock";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The text to display. A subset of markdown is supported.
		*/
		text;
		/**
		* The size of the text.
		*/
		size;
		/**
		* The weight of the text.
		*/
		weight;
		/**
		* The color of the text.
		*/
		color;
		/**
		* Controls whether the text should be renderer using a subtler variant of the select color.
		*/
		isSubtle;
		/**
		* The type of font to use for rendering.
		*/
		fontType;
		/**
		* Controls if the text should wrap.
		*/
		wrap;
		/**
		* The maximum number of lines to display.
		*/
		maxLines;
		/**
		* The style of the text.
		*/
		style;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(text, options = {}) {
			Object.assign(this, options);
			this.text = text;
		}
		static from(options) {
			return new TextBlock(options.text, options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withText(text) {
			this.text = text;
			return this;
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withWeight(weight) {
			this.weight = weight;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withIsSubtle(isSubtle) {
			this.isSubtle = isSubtle;
			return this;
		}
		withFontType(fontType) {
			this.fontType = fontType;
			return this;
		}
		withWrap(wrap = true) {
			this.wrap = wrap;
			return this;
		}
		withMaxLines(maxLines) {
			this.maxLines = maxLines;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isFactSet(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "FactSet";
	}
	var FactSet = class {
		/**
		* Must be **FactSet**.
		*/
		type = "FactSet";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The facts in the set.
		*/
		facts;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(...facts) {
			this.facts = facts;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withFacts(...facts) {
			this.facts = facts;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var Fact = class Fact {
		/**
		* The fact's title.
		*/
		title;
		/**
		* The fact's value.
		*/
		value;
		constructor(title, value) {
			this.title = title;
			this.value = value;
		}
		static from(options) {
			return new Fact(options.title, options.value);
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
	};
	function isImageSet(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "ImageSet";
	}
	var ImageSet = class {
		/**
		* Must be **ImageSet**.
		*/
		type = "ImageSet";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The images in the set.
		*/
		images;
		/**
		* The size to use to render all images in the set.
		*/
		imageSize;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(...images) {
			this.images = images;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withImages(...images) {
			this.images = images;
			return this;
		}
		withImageSize(imageSize) {
			this.imageSize = imageSize;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isImage(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Image";
	}
	var Image = class Image {
		/**
		* Must be **Image**.
		*/
		type = "Image";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The URL (or Base64-encoded Data URI) of the image. Acceptable formats are PNG, JPEG, GIF and SVG.
		*/
		url;
		/**
		* The alternate text for the image, used for accessibility purposes.
		*/
		altText;
		/**
		* The background color of the image.
		*/
		backgroundColor;
		/**
		* The style of the image.
		*/
		style;
		/**
		* The size of the image.
		*/
		size;
		/**
		* The width of the image.
		*/
		width;
		/**
		* An Action that will be invoked when the image is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* Controls if the image can be expanded to full screen.
		*/
		allowExpand;
		/**
		* Teams-specific metadata associated with the image.
		*/
		msTeams;
		/**
		* The height of the image.
		*/
		height;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(url, options = {}) {
			Object.assign(this, options);
			this.url = url;
		}
		static from(options) {
			return new Image(options.url, options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withUrl(url) {
			this.url = url;
			return this;
		}
		withAltText(altText) {
			this.altText = altText;
			return this;
		}
		withBackgroundColor(backgroundColor) {
			this.backgroundColor = backgroundColor;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withWidth(width) {
			this.width = width;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withAllowExpand(allowExpand = true) {
			this.allowExpand = allowExpand;
			return this;
		}
		withMsTeams(msTeams) {
			this.msTeams = msTeams;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var TeamsImageProperties = class TeamsImageProperties {
		/**
		* Controls if the image is expandable in Teams. This property is equivalent to the Image.allowExpand property.
		*/
		allowExpand;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TeamsImageProperties(options);
		}
		withAllowExpand(allowExpand) {
			this.allowExpand = allowExpand;
			return this;
		}
	};
	function isTextInput(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Input.Text";
	}
	var TextInput = class TextInput {
		/**
		* Must be **Input.Text**.
		*/
		type = "Input.Text";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The label of the input.
		
		A label should **always** be provided to ensure the best user experience especially for users of assistive technology.
		*/
		label;
		/**
		* Controls whether the input is required. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		isRequired;
		/**
		* The error message to display when the input fails validation. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		errorMessage;
		/**
		* An Action.ResetInputs action that will be executed when the value of the input changes.
		*/
		valueChangedAction;
		/**
		* The default value of the input.
		*/
		value;
		/**
		* The maximum length of the text in the input.
		*/
		maxLength;
		/**
		* Controls if the input should allow multiple lines of text.
		*/
		isMultiline;
		/**
		* The text to display as a placeholder when the user hasn't entered a value.
		*/
		placeholder;
		/**
		* The style of the input.
		*/
		style;
		/**
		* The action that should be displayed as a button alongside the input. Action.ShowCard is not supported.
		*/
		inlineAction;
		/**
		* The regular expression to validate the input.
		*/
		regex;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TextInput(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withLabel(label) {
			this.label = label;
			return this;
		}
		withIsRequired(isRequired = true) {
			this.isRequired = isRequired;
			return this;
		}
		withErrorMessage(errorMessage) {
			this.errorMessage = errorMessage;
			return this;
		}
		withValueChangedAction(valueChangedAction) {
			this.valueChangedAction = valueChangedAction;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withMaxLength(maxLength) {
			this.maxLength = maxLength;
			return this;
		}
		withIsMultiline(isMultiline = true) {
			this.isMultiline = isMultiline;
			return this;
		}
		withPlaceholder(placeholder) {
			this.placeholder = placeholder;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withInlineAction(inlineAction) {
			this.inlineAction = inlineAction;
			return this;
		}
		withRegex(regex) {
			this.regex = regex;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isDateInput(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Input.Date";
	}
	var DateInput = class DateInput {
		/**
		* Must be **Input.Date**.
		*/
		type = "Input.Date";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The label of the input.
		
		A label should **always** be provided to ensure the best user experience especially for users of assistive technology.
		*/
		label;
		/**
		* Controls whether the input is required. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		isRequired;
		/**
		* The error message to display when the input fails validation. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		errorMessage;
		/**
		* An Action.ResetInputs action that will be executed when the value of the input changes.
		*/
		valueChangedAction;
		/**
		* The default value of the input, in the `YYYY-MM-DD` format.
		*/
		value;
		/**
		* The text to display as a placeholder when the user has not selected a date.
		*/
		placeholder;
		/**
		* The minimum date that can be selected.
		*/
		min;
		/**
		* The maximum date that can be selected.
		*/
		max;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new DateInput(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withLabel(label) {
			this.label = label;
			return this;
		}
		withIsRequired(isRequired = true) {
			this.isRequired = isRequired;
			return this;
		}
		withErrorMessage(errorMessage) {
			this.errorMessage = errorMessage;
			return this;
		}
		withValueChangedAction(valueChangedAction) {
			this.valueChangedAction = valueChangedAction;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withPlaceholder(placeholder) {
			this.placeholder = placeholder;
			return this;
		}
		withMin(min) {
			this.min = min;
			return this;
		}
		withMax(max) {
			this.max = max;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isTimeInput(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Input.Time";
	}
	var TimeInput = class TimeInput {
		/**
		* Must be **Input.Time**.
		*/
		type = "Input.Time";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The label of the input.
		
		A label should **always** be provided to ensure the best user experience especially for users of assistive technology.
		*/
		label;
		/**
		* Controls whether the input is required. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		isRequired;
		/**
		* The error message to display when the input fails validation. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		errorMessage;
		/**
		* An Action.ResetInputs action that will be executed when the value of the input changes.
		*/
		valueChangedAction;
		/**
		* The default value of the input, in the `HH:MM` format.
		*/
		value;
		/**
		* The text to display as a placeholder when the user hasn't entered a value.
		*/
		placeholder;
		/**
		* The minimum time that can be selected, in the `HH:MM` format.
		*/
		min;
		/**
		* The maximum time that can be selected, in the `HH:MM` format.
		*/
		max;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TimeInput(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withLabel(label) {
			this.label = label;
			return this;
		}
		withIsRequired(isRequired = true) {
			this.isRequired = isRequired;
			return this;
		}
		withErrorMessage(errorMessage) {
			this.errorMessage = errorMessage;
			return this;
		}
		withValueChangedAction(valueChangedAction) {
			this.valueChangedAction = valueChangedAction;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withPlaceholder(placeholder) {
			this.placeholder = placeholder;
			return this;
		}
		withMin(min) {
			this.min = min;
			return this;
		}
		withMax(max) {
			this.max = max;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isNumberInput(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Input.Number";
	}
	var NumberInput = class NumberInput {
		/**
		* Must be **Input.Number**.
		*/
		type = "Input.Number";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The label of the input.
		
		A label should **always** be provided to ensure the best user experience especially for users of assistive technology.
		*/
		label;
		/**
		* Controls whether the input is required. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		isRequired;
		/**
		* The error message to display when the input fails validation. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		errorMessage;
		/**
		* An Action.ResetInputs action that will be executed when the value of the input changes.
		*/
		valueChangedAction;
		/**
		* The default value of the input.
		*/
		value;
		/**
		* The text to display as a placeholder when the user hasn't entered a value.
		*/
		placeholder;
		/**
		* The minimum value that can be entered.
		*/
		min;
		/**
		* The maximum value that can be entered.
		*/
		max;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new NumberInput(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withLabel(label) {
			this.label = label;
			return this;
		}
		withIsRequired(isRequired = true) {
			this.isRequired = isRequired;
			return this;
		}
		withErrorMessage(errorMessage) {
			this.errorMessage = errorMessage;
			return this;
		}
		withValueChangedAction(valueChangedAction) {
			this.valueChangedAction = valueChangedAction;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withPlaceholder(placeholder) {
			this.placeholder = placeholder;
			return this;
		}
		withMin(min) {
			this.min = min;
			return this;
		}
		withMax(max) {
			this.max = max;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isToggleInput(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Input.Toggle";
	}
	var ToggleInput = class ToggleInput {
		/**
		* Must be **Input.Toggle**.
		*/
		type = "Input.Toggle";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The label of the input.
		
		A label should **always** be provided to ensure the best user experience especially for users of assistive technology.
		*/
		label;
		/**
		* Controls whether the input is required. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		isRequired;
		/**
		* The error message to display when the input fails validation. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		errorMessage;
		/**
		* An Action.ResetInputs action that will be executed when the value of the input changes.
		*/
		valueChangedAction;
		/**
		* The default value of the input.
		*/
		value;
		/**
		* The title (caption) to display next to the toggle.
		*/
		title;
		/**
		* The value to send to the Bot when the toggle is on.
		*/
		valueOn;
		/**
		* The value to send to the Bot when the toggle is off.
		*/
		valueOff;
		/**
		* Controls if the title should wrap.
		*/
		wrap;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(title, options = {}) {
			Object.assign(this, options);
			this.title = title;
		}
		static from(options) {
			return new ToggleInput(options.title, options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withLabel(label) {
			this.label = label;
			return this;
		}
		withIsRequired(isRequired = true) {
			this.isRequired = isRequired;
			return this;
		}
		withErrorMessage(errorMessage) {
			this.errorMessage = errorMessage;
			return this;
		}
		withValueChangedAction(valueChangedAction) {
			this.valueChangedAction = valueChangedAction;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withValueOn(valueOn) {
			this.valueOn = valueOn;
			return this;
		}
		withValueOff(valueOff) {
			this.valueOff = valueOff;
			return this;
		}
		withWrap(wrap = false) {
			this.wrap = wrap;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isChoiceSetInput(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Input.ChoiceSet";
	}
	var ChoiceSetInput = class {
		/**
		* Must be **Input.ChoiceSet**.
		*/
		type = "Input.ChoiceSet";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The label of the input.
		
		A label should **always** be provided to ensure the best user experience especially for users of assistive technology.
		*/
		label;
		/**
		* Controls whether the input is required. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		isRequired;
		/**
		* The error message to display when the input fails validation. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		errorMessage;
		/**
		* An Action.ResetInputs action that will be executed when the value of the input changes.
		*/
		valueChangedAction;
		/**
		* The default value of the input.
		*/
		value;
		/**
		* The choices associated with the input.
		*/
		choices;
		/**
		* A Data.Query object that defines the dataset from which to dynamically fetch the choices for the input.
		*/
		"choices.data";
		/**
		* Controls whether the input should be displayed as a dropdown (compact) or a list of radio buttons or checkboxes (expanded).
		*/
		style;
		/**
		* Controls whether multiple choices can be selected.
		*/
		isMultiSelect;
		/**
		* The text to display as a placeholder when the user has not entered any value.
		*/
		placeholder;
		/**
		* Controls if choice titles should wrap.
		*/
		wrap;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(...choices) {
			this.choices = choices;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withLabel(label) {
			this.label = label;
			return this;
		}
		withIsRequired(isRequired = true) {
			this.isRequired = isRequired;
			return this;
		}
		withErrorMessage(errorMessage) {
			this.errorMessage = errorMessage;
			return this;
		}
		withValueChangedAction(valueChangedAction) {
			this.valueChangedAction = valueChangedAction;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withChoices(...choices) {
			this.choices = choices;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withIsMultiSelect(isMultiSelect = true) {
			this.isMultiSelect = isMultiSelect;
			return this;
		}
		withPlaceholder(placeholder) {
			this.placeholder = placeholder;
			return this;
		}
		withWrap(wrap = false) {
			this.wrap = wrap;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var Choice = class Choice {
		/**
		* The text to display for the choice.
		*/
		title;
		/**
		* The value associated with the choice, as sent to the Bot when an Action.Submit or Action.Execute is invoked
		*/
		value;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new Choice(options);
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
	};
	function isQueryData(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Data.Query";
	}
	var QueryData = class QueryData {
		/**
		* Must be **Data.Query**.
		*/
		type = "Data.Query";
		/**
		* The dataset from which to fetch the data.
		*/
		dataset;
		/**
		* Controls which inputs are associated with the Data.Query. When a Data.Query is executed, the values of the associated inputs are sent to the Bot, allowing it to perform filtering operations based on the user's input.
		*/
		associatedInputs;
		/**
		* The maximum number of data items that should be returned by the query. Card authors should not specify this property in their card payload. It is determined by the client and sent to the Bot to enable pagination.
		*/
		count;
		/**
		* The number of data items to be skipped by the query. Card authors should not specify this property in their card payload. It is determined by the client and sent to the Bot to enable pagination.
		*/
		skip;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new QueryData(options);
		}
		withDataset(dataset) {
			this.dataset = dataset;
			return this;
		}
		withAssociatedInputs(associatedInputs) {
			this.associatedInputs = associatedInputs;
			return this;
		}
		withCount(count) {
			this.count = count;
			return this;
		}
		withSkip(skip) {
			this.skip = skip;
			return this;
		}
	};
	function isRatingInput(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Input.Rating";
	}
	var RatingInput = class RatingInput {
		/**
		* Must be **Input.Rating**.
		*/
		type = "Input.Rating";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The label of the input.
		
		A label should **always** be provided to ensure the best user experience especially for users of assistive technology.
		*/
		label;
		/**
		* Controls whether the input is required. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		isRequired;
		/**
		* The error message to display when the input fails validation. See [Input validation](https://adaptivecards.microsoft.com/?topic=input-validation) for more details.
		*/
		errorMessage;
		/**
		* An Action.ResetInputs action that will be executed when the value of the input changes.
		*/
		valueChangedAction;
		/**
		* The default value of the input.
		*/
		value;
		/**
		* The number of stars to display.
		*/
		max;
		/**
		* Controls if the user can select half stars.
		*/
		allowHalfSteps;
		/**
		* The size of the stars.
		*/
		size;
		/**
		* The color of the stars.
		*/
		color;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new RatingInput(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withLabel(label) {
			this.label = label;
			return this;
		}
		withIsRequired(isRequired = true) {
			this.isRequired = isRequired;
			return this;
		}
		withErrorMessage(errorMessage) {
			this.errorMessage = errorMessage;
			return this;
		}
		withValueChangedAction(valueChangedAction) {
			this.valueChangedAction = valueChangedAction;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withMax(max) {
			this.max = max;
			return this;
		}
		withAllowHalfSteps(allowHalfSteps = true) {
			this.allowHalfSteps = allowHalfSteps;
			return this;
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isRating(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Rating";
	}
	var Rating = class Rating {
		/**
		* Must be **Rating**.
		*/
		type = "Rating";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The value of the rating. Must be between 0 and max.
		*/
		value;
		/**
		* The number of "votes" associated with the rating.
		*/
		count;
		/**
		* The number of stars to display.
		*/
		max;
		/**
		* The size of the stars.
		*/
		size;
		/**
		* The color of the stars.
		*/
		color;
		/**
		* The style of the stars.
		*/
		style;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new Rating(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withCount(count) {
			this.count = count;
			return this;
		}
		withMax(max) {
			this.max = max;
			return this;
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isCompoundButton(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "CompoundButton";
	}
	var CompoundButton = class CompoundButton {
		/**
		* Must be **CompoundButton**.
		*/
		type = "CompoundButton";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The icon to show on the button.
		*/
		icon;
		/**
		* The badge to show on the button.
		*/
		badge;
		/**
		* The title of the button.
		*/
		title;
		/**
		* The description text of the button.
		*/
		description;
		/**
		* An Action that will be invoked when the button is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new CompoundButton(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withIcon(icon) {
			this.icon = icon;
			return this;
		}
		withBadge(badge) {
			this.badge = badge;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withDescription(description) {
			this.description = description;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var IconInfo = class IconInfo {
		/**
		* The name of the icon to display.
		*/
		name;
		/**
		* The size of the icon.
		*/
		size;
		/**
		* The style of the icon.
		*/
		style;
		/**
		* The color of the icon.
		*/
		color;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new IconInfo(options);
		}
		withName(name) {
			this.name = name;
			return this;
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
	};
	function isIcon(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Icon";
	}
	var Icon = class Icon {
		/**
		* Must be **Icon**.
		*/
		type = "Icon";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The name of the icon to display.
		*/
		name;
		/**
		* The size of the icon.
		*/
		size;
		/**
		* The style of the icon.
		*/
		style;
		/**
		* The color of the icon.
		*/
		color;
		/**
		* An Action that will be invoked when the icon is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(name, options = {}) {
			Object.assign(this, options);
			this.name = name;
		}
		static from(options) {
			return new Icon(options.name, options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withName(name) {
			this.name = name;
			return this;
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isCarousel(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Carousel";
	}
	var Carousel = class Carousel {
		/**
		* Must be **Carousel**.
		*/
		type = "Carousel";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* Controls if the container should bleed into its parent. A bleeding container extends into its parent's padding.
		*/
		bleed;
		/**
		* The minimum height, in pixels, of the container, in the `<number>px` format.
		*/
		minHeight;
		/**
		* Controls the type of animation to use to navigate between pages.
		*/
		pageAnimation;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The pages in the carousel.
		*/
		pages;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new Carousel(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withBleed(bleed = true) {
			this.bleed = bleed;
			return this;
		}
		withMinHeight(minHeight) {
			this.minHeight = minHeight;
			return this;
		}
		withPageAnimation(pageAnimation) {
			this.pageAnimation = pageAnimation;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withPages(...pages) {
			this.pages = pages;
			return this;
		}
	};
	function isBadge(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Badge";
	}
	var Badge = class Badge {
		/**
		* Must be **Badge**.
		*/
		type = "Badge";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The text to display.
		*/
		text;
		/**
		* The name of an icon from the [Adaptive Card icon catalog](https://adaptivecards.microsoft.com/?topic=icon-catalog) to display, in the `<icon-name>[,regular|filled]` format. If the style is not specified, the regular style is used.
		*/
		icon;
		/**
		* Controls the position of the icon.
		*/
		iconPosition;
		/**
		* Controls the strength of the background color.
		*/
		appearance;
		/**
		* The size of the badge.
		*/
		size;
		/**
		* Controls the shape of the badge.
		*/
		shape;
		/**
		* The style of the badge.
		*/
		style;
		/**
		* Controls the tooltip text to display when the badge is hovered over.
		*/
		tooltip;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new Badge(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withText(text) {
			this.text = text;
			return this;
		}
		withIcon(icon) {
			this.icon = icon;
			return this;
		}
		withIconPosition(iconPosition) {
			this.iconPosition = iconPosition;
			return this;
		}
		withAppearance(appearance) {
			this.appearance = appearance;
			return this;
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withShape(shape) {
			this.shape = shape;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withTooltip(tooltip) {
			this.tooltip = tooltip;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isDonutChart(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Chart.Donut";
	}
	var DonutChart = class DonutChart {
		/**
		* Must be **Chart.Donut**.
		*/
		type = "Chart.Donut";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The title of the chart.
		*/
		title;
		/**
		* The name of the set of colors to use to render the chart. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		colorSet;
		/**
		* The data to display in the chart.
		*/
		data;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new DonutChart(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withColorSet(colorSet) {
			this.colorSet = colorSet;
			return this;
		}
		withData(...data) {
			this.data = data;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var DonutChartData = class DonutChartData {
		/**
		* The legend of the chart.
		*/
		legend;
		/**
		* The value associated with the data point.
		*/
		value;
		/**
		* The color to use for the data point. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new DonutChartData(options);
		}
		withLegend(legend) {
			this.legend = legend;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
	};
	function isPieChart(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Chart.Pie";
	}
	var PieChart = class PieChart {
		/**
		* Must be **Chart.Pie**.
		*/
		type = "Chart.Pie";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The title of the chart.
		*/
		title;
		/**
		* The name of the set of colors to use to render the chart. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		colorSet;
		/**
		* The data to display in the chart.
		*/
		data;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new PieChart(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withColorSet(colorSet) {
			this.colorSet = colorSet;
			return this;
		}
		withData(...data) {
			this.data = data;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isGroupedVerticalBarChart(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Chart.VerticalBar.Grouped";
	}
	var GroupedVerticalBarChart = class GroupedVerticalBarChart {
		/**
		* Must be **Chart.VerticalBar.Grouped**.
		*/
		type = "Chart.VerticalBar.Grouped";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The title of the chart.
		*/
		title;
		/**
		* The name of the set of colors to use to render the chart. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		colorSet;
		/**
		* The title of the x axis.
		*/
		xAxisTitle;
		/**
		* The title of the y axis.
		*/
		yAxisTitle;
		/**
		* The color to use for all data points. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		/**
		* Controls if bars in the chart should  be displayed as stacked instead of grouped.
		*/
		stacked;
		/**
		* The data points in a series.
		*/
		data;
		/**
		* Controls if values should be displayed on each bar.
		*/
		showBarValues;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new GroupedVerticalBarChart(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withColorSet(colorSet) {
			this.colorSet = colorSet;
			return this;
		}
		withXAxisTitle(xAxisTitle) {
			this.xAxisTitle = xAxisTitle;
			return this;
		}
		withYAxisTitle(yAxisTitle) {
			this.yAxisTitle = yAxisTitle;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withStacked(stacked = true) {
			this.stacked = stacked;
			return this;
		}
		withData(...data) {
			this.data = data;
			return this;
		}
		withShowBarValues(showBarValues = true) {
			this.showBarValues = showBarValues;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var GroupedVerticalBarChartData = class GroupedVerticalBarChartData {
		/**
		* The legend of the chart.
		*/
		legend;
		/**
		* The data points in the series.
		*/
		values;
		/**
		* The color to use for all data points in the series. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new GroupedVerticalBarChartData(options);
		}
		withLegend(legend) {
			this.legend = legend;
			return this;
		}
		withValues(...values) {
			this.values = values;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
	};
	var BarChartDataValue = class BarChartDataValue {
		/**
		* The x axis value of the data point.
		*/
		x;
		/**
		* The y axis value of the data point.
		*/
		y;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new BarChartDataValue(options);
		}
		withX(x) {
			this.x = x;
			return this;
		}
		withY(y) {
			this.y = y;
			return this;
		}
	};
	function isVerticalBarChart(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Chart.VerticalBar";
	}
	var VerticalBarChart = class VerticalBarChart {
		/**
		* Must be **Chart.VerticalBar**.
		*/
		type = "Chart.VerticalBar";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The title of the chart.
		*/
		title;
		/**
		* The name of the set of colors to use to render the chart. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		colorSet;
		/**
		* The title of the x axis.
		*/
		xAxisTitle;
		/**
		* The title of the y axis.
		*/
		yAxisTitle;
		/**
		* The data to display in the chart.
		*/
		data;
		/**
		* The color to use for all data points. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		/**
		* Controls if the bar values should be displayed.
		*/
		showBarValues;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new VerticalBarChart(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withColorSet(colorSet) {
			this.colorSet = colorSet;
			return this;
		}
		withXAxisTitle(xAxisTitle) {
			this.xAxisTitle = xAxisTitle;
			return this;
		}
		withYAxisTitle(yAxisTitle) {
			this.yAxisTitle = yAxisTitle;
			return this;
		}
		withData(...data) {
			this.data = data;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withShowBarValues(showBarValues = true) {
			this.showBarValues = showBarValues;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var VerticalBarChartDataValue = class VerticalBarChartDataValue {
		/**
		* The x axis value of the data point.
		*/
		x;
		/**
		* The y axis value of the data point.
		*/
		y;
		/**
		* The color to use for the bar associated with the data point. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new VerticalBarChartDataValue(options);
		}
		withX(x) {
			this.x = x;
			return this;
		}
		withY(y) {
			this.y = y;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
	};
	function isHorizontalBarChart(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Chart.HorizontalBar";
	}
	var HorizontalBarChart = class HorizontalBarChart {
		/**
		* Must be **Chart.HorizontalBar**.
		*/
		type = "Chart.HorizontalBar";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The title of the chart.
		*/
		title;
		/**
		* The name of the set of colors to use to render the chart. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		colorSet;
		/**
		* The title of the x axis.
		*/
		xAxisTitle;
		/**
		* The title of the y axis.
		*/
		yAxisTitle;
		/**
		* The color to use for all data points. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		/**
		* The data points in the chart.
		*/
		data;
		/**
		* Controls how the chart should be visually laid out.
		*/
		displayMode;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new HorizontalBarChart(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withColorSet(colorSet) {
			this.colorSet = colorSet;
			return this;
		}
		withXAxisTitle(xAxisTitle) {
			this.xAxisTitle = xAxisTitle;
			return this;
		}
		withYAxisTitle(yAxisTitle) {
			this.yAxisTitle = yAxisTitle;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withData(...data) {
			this.data = data;
			return this;
		}
		withDisplayMode(displayMode) {
			this.displayMode = displayMode;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var HorizontalBarChartDataValue = class HorizontalBarChartDataValue {
		/**
		* The x axis value of the data point.
		*/
		x;
		/**
		* The y axis value of the data point.
		*/
		y;
		/**
		* The color of the bar associated with the data point. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new HorizontalBarChartDataValue(options);
		}
		withX(x) {
			this.x = x;
			return this;
		}
		withY(y) {
			this.y = y;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
	};
	function isStackedHorizontalBarChart(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Chart.HorizontalBar.Stacked";
	}
	var StackedHorizontalBarChart = class StackedHorizontalBarChart {
		/**
		* Must be **Chart.HorizontalBar.Stacked**.
		*/
		type = "Chart.HorizontalBar.Stacked";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The title of the chart.
		*/
		title;
		/**
		* The name of the set of colors to use to render the chart. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		colorSet;
		/**
		* The title of the x axis.
		*/
		xAxisTitle;
		/**
		* The title of the y axis.
		*/
		yAxisTitle;
		/**
		* The color to use for all data points. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		/**
		* The data to display in the chart.
		*/
		data;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new StackedHorizontalBarChart(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withColorSet(colorSet) {
			this.colorSet = colorSet;
			return this;
		}
		withXAxisTitle(xAxisTitle) {
			this.xAxisTitle = xAxisTitle;
			return this;
		}
		withYAxisTitle(yAxisTitle) {
			this.yAxisTitle = yAxisTitle;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withData(...data) {
			this.data = data;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var StackedHorizontalBarChartData = class StackedHorizontalBarChartData {
		/**
		* The title of the series.
		*/
		title;
		/**
		* The data points in the series.
		*/
		data;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new StackedHorizontalBarChartData(options);
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withData(...data) {
			this.data = data;
			return this;
		}
	};
	var StackedHorizontalBarChartDataPoint = class StackedHorizontalBarChartDataPoint {
		/**
		* The legend associated with the data point.
		*/
		legend;
		/**
		* The value of the data point.
		*/
		value;
		/**
		* The color to use to render the bar associated with the data point. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new StackedHorizontalBarChartDataPoint(options);
		}
		withLegend(legend) {
			this.legend = legend;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
	};
	function isLineChart(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Chart.Line";
	}
	var LineChart = class LineChart {
		/**
		* Must be **Chart.Line**.
		*/
		type = "Chart.Line";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The title of the chart.
		*/
		title;
		/**
		* The name of the set of colors to use to render the chart. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		colorSet;
		/**
		* The title of the x axis.
		*/
		xAxisTitle;
		/**
		* The title of the y axis.
		*/
		yAxisTitle;
		/**
		* The color to use for all data points. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		/**
		* The data point series in the line chart.
		*/
		data;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new LineChart(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withColorSet(colorSet) {
			this.colorSet = colorSet;
			return this;
		}
		withXAxisTitle(xAxisTitle) {
			this.xAxisTitle = xAxisTitle;
			return this;
		}
		withYAxisTitle(yAxisTitle) {
			this.yAxisTitle = yAxisTitle;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withData(...data) {
			this.data = data;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var LineChartData = class LineChartData {
		/**
		* The legend of the chart.
		*/
		legend;
		/**
		* The data points in the series.
		*/
		values;
		/**
		* The color all data points in the series. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new LineChartData(options);
		}
		withLegend(legend) {
			this.legend = legend;
			return this;
		}
		withValues(...values) {
			this.values = values;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
	};
	var LineChartValue = class LineChartValue {
		/**
		* The x axis value of the data point.
		
		If all x values of the x [Chart.Line](https://adaptivecards.microsoft.com/?topic=Chart.Line) are expressed as a number, or if all x values are expressed as a date string in the `YYYY-MM-DD` format, the chart will be rendered as a time series chart, i.e. x axis values will span across the minimum x value to maximum x value range.
		
		Otherwise, if x values are represented as a mix of numbers and strings or if at least one x value isn't in the `YYYY-MM-DD` format, the chart will be rendered as a categorical chart, i.e. x axis values will be displayed as categories.
		*/
		x;
		/**
		* The y axis value of the data point.
		*/
		y;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new LineChartValue(options);
		}
		withX(x) {
			this.x = x;
			return this;
		}
		withY(y) {
			this.y = y;
			return this;
		}
	};
	function isGaugeChart(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Chart.Gauge";
	}
	var GaugeChart = class GaugeChart {
		/**
		* Must be **Chart.Gauge**.
		*/
		type = "Chart.Gauge";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The title of the chart.
		*/
		title;
		/**
		* The name of the set of colors to use to render the chart. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		colorSet;
		/**
		* The minimum value of the gauge.
		*/
		min;
		/**
		* The maximum value of the gauge.
		*/
		max;
		/**
		* The sub-label of the gauge.
		*/
		subLabel;
		/**
		* Controls if the min/max values should be displayed.
		*/
		showMinMax;
		/**
		* Controls if the legend should be displayed.
		*/
		showLegend;
		/**
		* The segments to display in the gauge.
		*/
		segments;
		/**
		* The value of the gauge.
		*/
		value;
		/**
		* The format used to display the gauge's value.
		*/
		valueFormat;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new GaugeChart(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withColorSet(colorSet) {
			this.colorSet = colorSet;
			return this;
		}
		withMin(min) {
			this.min = min;
			return this;
		}
		withMax(max) {
			this.max = max;
			return this;
		}
		withSubLabel(subLabel) {
			this.subLabel = subLabel;
			return this;
		}
		withShowMinMax(showMinMax = false) {
			this.showMinMax = showMinMax;
			return this;
		}
		withShowLegend(showLegend = false) {
			this.showLegend = showLegend;
			return this;
		}
		withSegments(...segments) {
			this.segments = segments;
			return this;
		}
		withValue(value) {
			this.value = value;
			return this;
		}
		withValueFormat(valueFormat) {
			this.valueFormat = valueFormat;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var GaugeChartLegend = class GaugeChartLegend {
		/**
		* The size of the segment.
		*/
		size;
		/**
		* The legend text associated with the segment.
		*/
		legend;
		/**
		* The color to use for the segment. See [Chart colors reference](https://adaptivecards.microsoft.com/?topic=chart-colors-reference).
		*/
		color;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new GaugeChartLegend(options);
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withLegend(legend) {
			this.legend = legend;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
	};
	function isCodeBlock(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "CodeBlock";
	}
	var CodeBlock = class CodeBlock {
		/**
		* Must be **CodeBlock**.
		*/
		type = "CodeBlock";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The code snippet to display.
		*/
		codeSnippet;
		/**
		* The language the code snippet is expressed in.
		*/
		language;
		/**
		* A number that represents the line in the file from where the code snippet was extracted.
		*/
		startLineNumber;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new CodeBlock(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withCodeSnippet(codeSnippet) {
			this.codeSnippet = codeSnippet;
			return this;
		}
		withLanguage(language) {
			this.language = language;
			return this;
		}
		withStartLineNumber(startLineNumber) {
			this.startLineNumber = startLineNumber;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isComUserMicrosoftGraphComponent(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Component" && obj.name === "graph.microsoft.com/user";
	}
	var ComUserMicrosoftGraphComponent = class ComUserMicrosoftGraphComponent {
		/**
		* Must be **Component**.
		*/
		type = "Component";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* Must be **graph.microsoft.com/user**.
		*/
		name = "graph.microsoft.com/user";
		/**
		* The properties of the user.
		*/
		properties;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ComUserMicrosoftGraphComponent(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withProperties(properties) {
			this.properties = properties;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var PersonaProperties = class PersonaProperties {
		/**
		* The UPN of the persona.
		*/
		userPrincipalName;
		/**
		* The display name of the persona.
		*/
		displayName;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new PersonaProperties(options);
		}
		withUserPrincipalName(userPrincipalName) {
			this.userPrincipalName = userPrincipalName;
			return this;
		}
		withDisplayName(displayName) {
			this.displayName = displayName;
			return this;
		}
	};
	function isComUsersMicrosoftGraphComponent(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Component" && obj.name === "graph.microsoft.com/users";
	}
	var ComUsersMicrosoftGraphComponent = class ComUsersMicrosoftGraphComponent {
		/**
		* Must be **Component**.
		*/
		type = "Component";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* Must be **graph.microsoft.com/users**.
		*/
		name = "graph.microsoft.com/users";
		/**
		* The properties of the set.
		*/
		properties;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ComUsersMicrosoftGraphComponent(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withProperties(properties) {
			this.properties = properties;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var PersonaSetProperties = class PersonaSetProperties {
		/**
		* The users a PersonaSet component should display.
		*/
		users;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new PersonaSetProperties(options);
		}
		withUsers(...users) {
			this.users = users;
			return this;
		}
	};
	function isComResourceMicrosoftGraphComponent(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Component" && obj.name === "graph.microsoft.com/resource";
	}
	var ComResourceMicrosoftGraphComponent = class ComResourceMicrosoftGraphComponent {
		/**
		* Must be **Component**.
		*/
		type = "Component";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* Must be **graph.microsoft.com/resource**.
		*/
		name = "graph.microsoft.com/resource";
		/**
		* The properties of the resource.
		*/
		properties;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ComResourceMicrosoftGraphComponent(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withProperties(properties) {
			this.properties = properties;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var ResourceProperties = class ResourceProperties {
		/**
		* The Id of the resource.
		*/
		id;
		/**
		* The reference to the resource.
		*/
		resourceReference;
		/**
		* The visualization of the resource.
		*/
		resourceVisualization;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ResourceProperties(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withResourceReference(resourceReference) {
			this.resourceReference = resourceReference;
			return this;
		}
		withResourceVisualization(resourceVisualization) {
			this.resourceVisualization = resourceVisualization;
			return this;
		}
	};
	var ResourceVisualization = class ResourceVisualization {
		/**
		* The media associated with the resource.
		*/
		media;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ResourceVisualization(options);
		}
		withMedia(media) {
			this.media = media;
			return this;
		}
	};
	function isComFileMicrosoftGraphComponent(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Component" && obj.name === "graph.microsoft.com/file";
	}
	var ComFileMicrosoftGraphComponent = class ComFileMicrosoftGraphComponent {
		/**
		* Must be **Component**.
		*/
		type = "Component";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* Must be **graph.microsoft.com/file**.
		*/
		name = "graph.microsoft.com/file";
		/**
		* The properties of the file.
		*/
		properties;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ComFileMicrosoftGraphComponent(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withProperties(properties) {
			this.properties = properties;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var FileProperties = class FileProperties {
		/**
		* The name of the file.
		*/
		name;
		/**
		* The file extension.
		*/
		extension;
		/**
		* The URL of the file.
		*/
		url;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new FileProperties(options);
		}
		withName(name) {
			this.name = name;
			return this;
		}
		withExtension(extension) {
			this.extension = extension;
			return this;
		}
		withUrl(url) {
			this.url = url;
			return this;
		}
	};
	function isComEventMicrosoftGraphComponent(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Component" && obj.name === "graph.microsoft.com/event";
	}
	var ComEventMicrosoftGraphComponent = class ComEventMicrosoftGraphComponent {
		/**
		* Must be **Component**.
		*/
		type = "Component";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* Must be **graph.microsoft.com/event**.
		*/
		name = "graph.microsoft.com/event";
		/**
		* The properties of the event.
		*/
		properties;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new ComEventMicrosoftGraphComponent(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withProperties(properties) {
			this.properties = properties;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	var CalendarEventProperties = class CalendarEventProperties {
		/**
		* The ID of the event.
		*/
		id;
		/**
		* The title of the event.
		*/
		title;
		/**
		* The start date and time of the event.
		*/
		start;
		/**
		* The end date and time of the event.
		*/
		end;
		/**
		* The status of the event.
		*/
		status;
		/**
		* The locations of the event.
		*/
		locations;
		/**
		* The URL of the online meeting.
		*/
		onlineMeetingUrl;
		/**
		* Indicates if the event is all day.
		*/
		isAllDay;
		/**
		* The extension of the event.
		*/
		extension;
		/**
		* The URL of the event.
		*/
		url;
		/**
		* The attendees of the event.
		*/
		attendees;
		/**
		* The organizer of the event.
		*/
		organizer;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new CalendarEventProperties(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withStart(start) {
			this.start = start;
			return this;
		}
		withEnd(end) {
			this.end = end;
			return this;
		}
		withStatus(status) {
			this.status = status;
			return this;
		}
		withLocations(...locations) {
			this.locations = locations;
			return this;
		}
		withOnlineMeetingUrl(onlineMeetingUrl) {
			this.onlineMeetingUrl = onlineMeetingUrl;
			return this;
		}
		withIsAllDay(isAllDay) {
			this.isAllDay = isAllDay;
			return this;
		}
		withExtension(extension) {
			this.extension = extension;
			return this;
		}
		withUrl(url) {
			this.url = url;
			return this;
		}
		withAttendees(...attendees) {
			this.attendees = attendees;
			return this;
		}
		withOrganizer(organizer) {
			this.organizer = organizer;
			return this;
		}
	};
	var CalendarEventAttendee = class CalendarEventAttendee {
		/**
		* The name of the attendee.
		*/
		name;
		/**
		* The email address of the attendee.
		*/
		email;
		/**
		* The title of the attendee.
		*/
		title;
		/**
		* The type of the attendee.
		*/
		type;
		/**
		* The status of the attendee.
		*/
		status;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new CalendarEventAttendee(options);
		}
		withName(name) {
			this.name = name;
			return this;
		}
		withEmail(email) {
			this.email = email;
			return this;
		}
		withTitle(title) {
			this.title = title;
			return this;
		}
		withType(type) {
			this.type = type;
			return this;
		}
		withStatus(status) {
			this.status = status;
			return this;
		}
	};
	function isCarouselPage(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "CarouselPage";
	}
	var CarouselPage = class {
		/**
		* Must be **CarouselPage**.
		*/
		type = "CarouselPage";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* An Action that will be invoked when the element is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The style of the container. Container styles control the colors of the background, border and text inside the container, in such a way that contrast requirements are always met.
		*/
		style;
		/**
		* Controls if a border should be displayed around the container.
		*/
		showBorder;
		/**
		* Controls if the container should have rounded corners.
		*/
		roundedCorners;
		/**
		* The layouts associated with the container. The container can dynamically switch from one layout to another as the card's width changes. See [Container layouts](https://adaptivecards.microsoft.com/?topic=container-layouts) for more details.
		*/
		layouts;
		/**
		* The minimum height, in pixels, of the container, in the `<number>px` format.
		*/
		minHeight;
		/**
		* Defines the container's background image.
		*/
		backgroundImage;
		/**
		* Controls how the container's content should be vertically aligned.
		*/
		verticalContentAlignment;
		/**
		* Controls if the content of the card is to be rendered left-to-right or right-to-left.
		*/
		rtl;
		/**
		* The maximum height, in pixels, of the container, in the `<number>px` format. When the content of a container exceeds the container's maximum height, a vertical scrollbar is displayed.
		*/
		maxHeight;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The elements in the page.
		*/
		items;
		constructor(...items) {
			this.items = items;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withShowBorder(showBorder = true) {
			this.showBorder = showBorder;
			return this;
		}
		withRoundedCorners(roundedCorners = true) {
			this.roundedCorners = roundedCorners;
			return this;
		}
		withLayouts(...layouts) {
			this.layouts = layouts;
			return this;
		}
		withMinHeight(minHeight) {
			this.minHeight = minHeight;
			return this;
		}
		withBackgroundImage(backgroundImage) {
			this.backgroundImage = backgroundImage;
			return this;
		}
		withVerticalContentAlignment(verticalContentAlignment) {
			this.verticalContentAlignment = verticalContentAlignment;
			return this;
		}
		withRtl(rtl) {
			this.rtl = rtl;
			return this;
		}
		withMaxHeight(maxHeight) {
			this.maxHeight = maxHeight;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withItems(...items) {
			this.items = items;
			return this;
		}
	};
	function isTableRow(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "TableRow";
	}
	var TableRow = class TableRow {
		/**
		* Must be **TableRow**.
		*/
		type = "TableRow";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* Controls if a border should be displayed around the container.
		*/
		showBorder;
		/**
		* Controls if the container should have rounded corners.
		*/
		roundedCorners;
		/**
		* The style of the container. Container styles control the colors of the background, border and text inside the container, in such a way that contrast requirements are always met.
		*/
		style;
		/**
		* Controls how the content of every cell in the row should be horizontally aligned by default. This property overrides the horizontalCellContentAlignment property of the table and columns.
		*/
		horizontalCellContentAlignment;
		/**
		* Controls how the content of every cell in the row should be vertically aligned by default. This property overrides the verticalCellContentAlignment property of the table and columns.
		*/
		verticalCellContentAlignment;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The cells in the row.
		*/
		cells;
		constructor(options = {}) {
			Object.assign(this, options);
		}
		static from(options) {
			return new TableRow(options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withShowBorder(showBorder = true) {
			this.showBorder = showBorder;
			return this;
		}
		withRoundedCorners(roundedCorners = true) {
			this.roundedCorners = roundedCorners;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withHorizontalCellContentAlignment(horizontalCellContentAlignment) {
			this.horizontalCellContentAlignment = horizontalCellContentAlignment;
			return this;
		}
		withVerticalCellContentAlignment(verticalCellContentAlignment) {
			this.verticalCellContentAlignment = verticalCellContentAlignment;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withCells(...cells) {
			this.cells = cells;
			return this;
		}
	};
	function isTableCell(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "TableCell";
	}
	var TableCell = class {
		/**
		* Must be **TableCell**.
		*/
		type = "TableCell";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* An Action that will be invoked when the element is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The style of the container. Container styles control the colors of the background, border and text inside the container, in such a way that contrast requirements are always met.
		*/
		style;
		/**
		* The layouts associated with the container. The container can dynamically switch from one layout to another as the card's width changes. See [Container layouts](https://adaptivecards.microsoft.com/?topic=container-layouts) for more details.
		*/
		layouts;
		/**
		* Controls if the container should bleed into its parent. A bleeding container extends into its parent's padding.
		*/
		bleed;
		/**
		* The minimum height, in pixels, of the container, in the `<number>px` format.
		*/
		minHeight;
		/**
		* Defines the container's background image.
		*/
		backgroundImage;
		/**
		* Controls how the container's content should be vertically aligned.
		*/
		verticalContentAlignment;
		/**
		* Controls if the content of the card is to be rendered left-to-right or right-to-left.
		*/
		rtl;
		/**
		* The maximum height, in pixels, of the container, in the `<number>px` format. When the content of a container exceeds the container's maximum height, a vertical scrollbar is displayed.
		*/
		maxHeight;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The items (elements) in the cell.
		*/
		items;
		constructor(...items) {
			this.items = items;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withLayouts(...layouts) {
			this.layouts = layouts;
			return this;
		}
		withBleed(bleed = true) {
			this.bleed = bleed;
			return this;
		}
		withMinHeight(minHeight) {
			this.minHeight = minHeight;
			return this;
		}
		withBackgroundImage(backgroundImage) {
			this.backgroundImage = backgroundImage;
			return this;
		}
		withVerticalContentAlignment(verticalContentAlignment) {
			this.verticalContentAlignment = verticalContentAlignment;
			return this;
		}
		withRtl(rtl) {
			this.rtl = rtl;
			return this;
		}
		withMaxHeight(maxHeight) {
			this.maxHeight = maxHeight;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withItems(...items) {
			this.items = items;
			return this;
		}
	};
	function isTextRun(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "TextRun";
	}
	var TextRun = class TextRun {
		/**
		* Must be **TextRun**.
		*/
		type = "TextRun";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* The text to display. A subset of markdown is supported.
		*/
		text;
		/**
		* The size of the text.
		*/
		size;
		/**
		* The weight of the text.
		*/
		weight;
		/**
		* The color of the text.
		*/
		color;
		/**
		* Controls whether the text should be renderer using a subtler variant of the select color.
		*/
		isSubtle;
		/**
		* The type of font to use for rendering.
		*/
		fontType;
		/**
		* Controls if the text should be italicized.
		*/
		italic;
		/**
		* Controls if the text should be struck through.
		*/
		strikethrough;
		/**
		* Controls if the text should be highlighted.
		*/
		highlight;
		/**
		* Controls if the text should be underlined.
		*/
		underline;
		/**
		* An Action that will be invoked when the text is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		constructor(text, options = {}) {
			Object.assign(this, options);
			this.text = text;
		}
		static from(options) {
			return new TextRun(options.text, options);
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withText(text) {
			this.text = text;
			return this;
		}
		withSize(size) {
			this.size = size;
			return this;
		}
		withWeight(weight) {
			this.weight = weight;
			return this;
		}
		withColor(color) {
			this.color = color;
			return this;
		}
		withIsSubtle(isSubtle) {
			this.isSubtle = isSubtle;
			return this;
		}
		withFontType(fontType) {
			this.fontType = fontType;
			return this;
		}
		withItalic(italic = true) {
			this.italic = italic;
			return this;
		}
		withStrikethrough(strikethrough = true) {
			this.strikethrough = strikethrough;
			return this;
		}
		withHighlight(highlight = true) {
			this.highlight = highlight;
			return this;
		}
		withUnderline(underline = true) {
			this.underline = underline;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
	};
	function isColumn(value) {
		const obj = value;
		return typeof obj === "object" && obj.type === "Column";
	}
	var Column = class {
		/**
		* Optional. If specified, must be **Column**.
		*/
		type = "Column";
		/**
		* A unique identifier for the element or action. Input elements must have an id, otherwise they will not be validated and their values will not be sent to the Bot.
		*/
		id;
		/**
		* A list of capabilities the element requires the host application to support. If the host application doesn't support at least one of the listed capabilities, the element is not rendered (or its fallback is rendered if provided).
		*/
		requires;
		/**
		* The locale associated with the element.
		*/
		lang;
		/**
		* Controls the visibility of the element.
		*/
		isVisible;
		/**
		* Controls whether a separator line should be displayed above the element to visually separate it from the previous element. No separator will be displayed for the first element in a container, even if this property is set to true.
		*/
		separator;
		/**
		* The height of the element. When set to stretch, the element will use the remaining vertical space in its container.
		*/
		height;
		/**
		* Controls how the element should be horizontally aligned.
		*/
		horizontalAlignment;
		/**
		* Controls the amount of space between this element and the previous one. No space will be added for the first element in a container.
		*/
		spacing;
		/**
		* Controls for which card width the element should be displayed. If targetWidth isn't specified, the element is rendered at all card widths. Using targetWidth makes it possible to author responsive cards that adapt their layout to the available horizontal space. For more details, see [Responsive layout](https://adaptivecards.microsoft.com/?topic=responsive-layout).
		*/
		targetWidth;
		/**
		* Controls whether the element should be used as a sort key by elements that allow sorting across a collection of elements.
		*/
		isSortKey;
		/**
		* An Action that will be invoked when the element is tapped or clicked. Action.ShowCard is not supported.
		*/
		selectAction;
		/**
		* The style of the container. Container styles control the colors of the background, border and text inside the container, in such a way that contrast requirements are always met.
		*/
		style;
		/**
		* Controls if a border should be displayed around the container.
		*/
		showBorder;
		/**
		* Controls if the container should have rounded corners.
		*/
		roundedCorners;
		/**
		* The layouts associated with the container. The container can dynamically switch from one layout to another as the card's width changes. See [Container layouts](https://adaptivecards.microsoft.com/?topic=container-layouts) for more details.
		*/
		layouts;
		/**
		* Controls if the container should bleed into its parent. A bleeding container extends into its parent's padding.
		*/
		bleed;
		/**
		* The minimum height, in pixels, of the container, in the `<number>px` format.
		*/
		minHeight;
		/**
		* Defines the container's background image.
		*/
		backgroundImage;
		/**
		* Controls how the container's content should be vertically aligned.
		*/
		verticalContentAlignment;
		/**
		* Controls if the content of the card is to be rendered left-to-right or right-to-left.
		*/
		rtl;
		/**
		* The maximum height, in pixels, of the container, in the `<number>px` format. When the content of a container exceeds the container's maximum height, a vertical scrollbar is displayed.
		*/
		maxHeight;
		/**
		* The width of the column. If expressed as a number, represents the relative weight of the column in the set. If expressed as a string, `auto` will automatically adjust the column's width according to its content, `stretch` will make the column use the remaining horizontal space (shared with other columns with width set to `stretch`) and using the `<number>px` format will give the column an explicit width in pixels.
		*/
		width;
		/**
		* The area of a Layout.AreaGrid layout in which an element should be displayed.
		*/
		"grid.area";
		/**
		* An alternate element to render if the type of this one is unsupported or if the host application doesn't support all the capabilities specified in the requires property.
		*/
		fallback;
		/**
		* The elements in the column.
		*/
		items;
		constructor(...items) {
			this.items = items;
		}
		withOptions(value) {
			Object.assign(this, value);
			return this;
		}
		withId(id) {
			this.id = id;
			return this;
		}
		withRequires(requires) {
			this.requires = requires;
			return this;
		}
		withLang(lang) {
			this.lang = lang;
			return this;
		}
		withIsVisible(isVisible = false) {
			this.isVisible = isVisible;
			return this;
		}
		withSeparator(separator = true) {
			this.separator = separator;
			return this;
		}
		withHeight(height) {
			this.height = height;
			return this;
		}
		withHorizontalAlignment(horizontalAlignment) {
			this.horizontalAlignment = horizontalAlignment;
			return this;
		}
		withSpacing(spacing) {
			this.spacing = spacing;
			return this;
		}
		withTargetWidth(targetWidth) {
			this.targetWidth = targetWidth;
			return this;
		}
		withIsSortKey(isSortKey = true) {
			this.isSortKey = isSortKey;
			return this;
		}
		withSelectAction(selectAction) {
			this.selectAction = selectAction;
			return this;
		}
		withStyle(style) {
			this.style = style;
			return this;
		}
		withShowBorder(showBorder = true) {
			this.showBorder = showBorder;
			return this;
		}
		withRoundedCorners(roundedCorners = true) {
			this.roundedCorners = roundedCorners;
			return this;
		}
		withLayouts(...layouts) {
			this.layouts = layouts;
			return this;
		}
		withBleed(bleed = true) {
			this.bleed = bleed;
			return this;
		}
		withMinHeight(minHeight) {
			this.minHeight = minHeight;
			return this;
		}
		withBackgroundImage(backgroundImage) {
			this.backgroundImage = backgroundImage;
			return this;
		}
		withVerticalContentAlignment(verticalContentAlignment) {
			this.verticalContentAlignment = verticalContentAlignment;
			return this;
		}
		withRtl(rtl) {
			this.rtl = rtl;
			return this;
		}
		withMaxHeight(maxHeight) {
			this.maxHeight = maxHeight;
			return this;
		}
		withWidth(width) {
			this.width = width;
			return this;
		}
		withFallback(fallback) {
			this.fallback = fallback;
			return this;
		}
		withItems(...items) {
			this.items = items;
			return this;
		}
	};
	exports.ActionSet = ActionSet;
	exports.AdaptiveCard = AdaptiveCard;
	exports.AreaGridLayout = AreaGridLayout;
	exports.AuthCardButton = AuthCardButton;
	exports.Authentication = Authentication;
	exports.BackgroundImage = BackgroundImage;
	exports.Badge = Badge;
	exports.BarChartDataValue = BarChartDataValue;
	exports.CalendarEventAttendee = CalendarEventAttendee;
	exports.CalendarEventProperties = CalendarEventProperties;
	exports.CaptionSource = CaptionSource;
	exports.CardMetadata = CardMetadata;
	exports.Carousel = Carousel;
	exports.CarouselPage = CarouselPage;
	exports.Choice = Choice;
	exports.ChoiceSetInput = ChoiceSetInput;
	exports.CodeBlock = CodeBlock;
	exports.Column = Column;
	exports.ColumnDefinition = ColumnDefinition;
	exports.ColumnSet = ColumnSet;
	exports.ComEventMicrosoftGraphComponent = ComEventMicrosoftGraphComponent;
	exports.ComFileMicrosoftGraphComponent = ComFileMicrosoftGraphComponent;
	exports.ComResourceMicrosoftGraphComponent = ComResourceMicrosoftGraphComponent;
	exports.ComUserMicrosoftGraphComponent = ComUserMicrosoftGraphComponent;
	exports.ComUsersMicrosoftGraphComponent = ComUsersMicrosoftGraphComponent;
	exports.CompoundButton = CompoundButton;
	exports.Container = Container;
	exports.DateInput = DateInput;
	exports.DonutChart = DonutChart;
	exports.DonutChartData = DonutChartData;
	exports.ExecuteAction = ExecuteAction;
	exports.Fact = Fact;
	exports.FactSet = FactSet;
	exports.FileProperties = FileProperties;
	exports.FlowLayout = FlowLayout;
	exports.GaugeChart = GaugeChart;
	exports.GaugeChartLegend = GaugeChartLegend;
	exports.GridArea = GridArea;
	exports.GroupedVerticalBarChart = GroupedVerticalBarChart;
	exports.GroupedVerticalBarChartData = GroupedVerticalBarChartData;
	exports.HorizontalBarChart = HorizontalBarChart;
	exports.HorizontalBarChartDataValue = HorizontalBarChartDataValue;
	exports.HostCapabilities = HostCapabilities;
	exports.Icon = Icon;
	exports.IconInfo = IconInfo;
	exports.Image = Image;
	exports.ImageSet = ImageSet;
	exports.LineChart = LineChart;
	exports.LineChartData = LineChartData;
	exports.LineChartValue = LineChartValue;
	exports.Media = Media;
	exports.MediaSource = MediaSource;
	exports.Mention = Mention;
	exports.MentionedEntity = MentionedEntity;
	exports.NumberInput = NumberInput;
	exports.OpenUrlAction = OpenUrlAction;
	exports.PersonaProperties = PersonaProperties;
	exports.PersonaSetProperties = PersonaSetProperties;
	exports.PieChart = PieChart;
	exports.QueryData = QueryData;
	exports.Rating = Rating;
	exports.RatingInput = RatingInput;
	exports.RefreshDefinition = RefreshDefinition;
	exports.ResetInputsAction = ResetInputsAction;
	exports.ResourceProperties = ResourceProperties;
	exports.ResourceVisualization = ResourceVisualization;
	exports.RichTextBlock = RichTextBlock;
	exports.ShowCardAction = ShowCardAction;
	exports.StackLayout = StackLayout;
	exports.StackedHorizontalBarChart = StackedHorizontalBarChart;
	exports.StackedHorizontalBarChartData = StackedHorizontalBarChartData;
	exports.StackedHorizontalBarChartDataPoint = StackedHorizontalBarChartDataPoint;
	exports.SubmitAction = SubmitAction;
	exports.Table = Table;
	exports.TableCell = TableCell;
	exports.TableRow = TableRow;
	exports.TargetElement = TargetElement;
	exports.TeamsCardProperties = TeamsCardProperties;
	exports.TeamsImageProperties = TeamsImageProperties;
	exports.TeamsSubmitActionFeedback = TeamsSubmitActionFeedback;
	exports.TeamsSubmitActionProperties = TeamsSubmitActionProperties;
	exports.TextBlock = TextBlock;
	exports.TextInput = TextInput;
	exports.TextRun = TextRun;
	exports.TimeInput = TimeInput;
	exports.ToggleInput = ToggleInput;
	exports.ToggleVisibilityAction = ToggleVisibilityAction;
	exports.TokenExchangeResource = TokenExchangeResource;
	exports.VerticalBarChart = VerticalBarChart;
	exports.VerticalBarChartDataValue = VerticalBarChartDataValue;
	exports.isActionSet = isActionSet;
	exports.isAdaptiveCard = isAdaptiveCard;
	exports.isAreaGridLayout = isAreaGridLayout;
	exports.isBadge = isBadge;
	exports.isCarousel = isCarousel;
	exports.isCarouselPage = isCarouselPage;
	exports.isChoiceSetInput = isChoiceSetInput;
	exports.isCodeBlock = isCodeBlock;
	exports.isColumn = isColumn;
	exports.isColumnSet = isColumnSet;
	exports.isComEventMicrosoftGraphComponent = isComEventMicrosoftGraphComponent;
	exports.isComFileMicrosoftGraphComponent = isComFileMicrosoftGraphComponent;
	exports.isComResourceMicrosoftGraphComponent = isComResourceMicrosoftGraphComponent;
	exports.isComUserMicrosoftGraphComponent = isComUserMicrosoftGraphComponent;
	exports.isComUsersMicrosoftGraphComponent = isComUsersMicrosoftGraphComponent;
	exports.isCompoundButton = isCompoundButton;
	exports.isContainer = isContainer;
	exports.isDateInput = isDateInput;
	exports.isDonutChart = isDonutChart;
	exports.isExecuteAction = isExecuteAction;
	exports.isFactSet = isFactSet;
	exports.isFlowLayout = isFlowLayout;
	exports.isGaugeChart = isGaugeChart;
	exports.isGroupedVerticalBarChart = isGroupedVerticalBarChart;
	exports.isHorizontalBarChart = isHorizontalBarChart;
	exports.isIcon = isIcon;
	exports.isImage = isImage;
	exports.isImageSet = isImageSet;
	exports.isLineChart = isLineChart;
	exports.isMedia = isMedia;
	exports.isMention = isMention;
	exports.isNumberInput = isNumberInput;
	exports.isOpenUrlAction = isOpenUrlAction;
	exports.isPieChart = isPieChart;
	exports.isQueryData = isQueryData;
	exports.isRating = isRating;
	exports.isRatingInput = isRatingInput;
	exports.isResetInputsAction = isResetInputsAction;
	exports.isRichTextBlock = isRichTextBlock;
	exports.isShowCardAction = isShowCardAction;
	exports.isStackLayout = isStackLayout;
	exports.isStackedHorizontalBarChart = isStackedHorizontalBarChart;
	exports.isSubmitAction = isSubmitAction;
	exports.isTable = isTable;
	exports.isTableCell = isTableCell;
	exports.isTableRow = isTableRow;
	exports.isTextBlock = isTextBlock;
	exports.isTextInput = isTextInput;
	exports.isTextRun = isTextRun;
	exports.isTimeInput = isTimeInput;
	exports.isToggleInput = isToggleInput;
	exports.isToggleVisibilityAction = isToggleVisibilityAction;
	exports.isVerticalBarChart = isVerticalBarChart;
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/actions/submit/im-back.js
var require_im_back = /* @__PURE__ */ __commonJSMin(((exports) => {
	var core = require_core();
	var IMBackAction = class IMBackAction extends core.SubmitAction {
		/**
		* Initial data that input fields will be combined with. These are essentially ‘hidden’ properties.
		*/
		data;
		constructor(value, options = {}) {
			super(options);
			Object.assign(this, options);
			this.data = { msteams: new IMBackData(value) };
		}
		static from(options) {
			return new IMBackAction(options.data.msteams.value, options);
		}
		withData(value) {
			super.withData({ msteams: value });
			return this;
		}
		withValue(value) {
			this.data.msteams.value = value;
			return this;
		}
	};
	var IMBackData = class {
		type;
		/**
		* String that needs to be echoed back in the chat.
		*/
		value;
		constructor(value) {
			this.type = "imBack";
			this.value = value;
		}
	};
	exports.IMBackAction = IMBackAction;
	exports.IMBackData = IMBackData;
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/actions/submit/invoke.js
var require_invoke$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var core = require_core();
	var InvokeAction = class InvokeAction extends core.SubmitAction {
		/**
		* Initial data that input fields will be combined with. These are essentially ‘hidden’ properties.
		*/
		data;
		constructor(value, options = {}) {
			super(options);
			Object.assign(this, options);
			this.data = { msteams: new InvokeData(value) };
		}
		static from(options) {
			return new InvokeAction(options.data.msteams.value, options);
		}
		withData(value) {
			super.withData({ msteams: value });
			return this;
		}
		withValue(value) {
			this.data.msteams.value = value;
			return this;
		}
	};
	var InvokeData = class {
		type;
		/**
		* Set the value to send with the invoke
		*/
		value;
		constructor(value) {
			this.type = "invoke";
			this.value = value;
		}
	};
	exports.InvokeAction = InvokeAction;
	exports.InvokeData = InvokeData;
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/actions/submit/message-back.js
var require_message_back = /* @__PURE__ */ __commonJSMin(((exports) => {
	var core = require_core();
	var MessageBackAction = class MessageBackAction extends core.SubmitAction {
		/**
		* Initial data that input fields will be combined with. These are essentially ‘hidden’ properties.
		*/
		data;
		constructor(data, options = {}) {
			super(options);
			Object.assign(this, options);
			this.data = { msteams: new MessageBackData(data.text, data.value, data.displayText) };
		}
		static from(options) {
			return new MessageBackAction(options.data.msteams, options);
		}
		withData(value) {
			super.withData({ msteams: value });
			return this;
		}
	};
	var MessageBackData = class {
		type;
		/**
		* Sent to your bot when the action is performed.
		*/
		text;
		/**
		* Used by the user in the chat stream when the action is performed.
		* This text isn't sent to your bot.
		*/
		displayText;
		/**
		* Sent to your bot when the action is performed. You can encode context
		* for the action, such as unique identifiers or a `JSON` object.
		*/
		value;
		constructor(text, value, displayText) {
			this.type = "messageBack";
			this.text = text;
			this.value = value;
			this.displayText = displayText;
		}
		withDisplayText(value) {
			this.displayText = value;
			return this;
		}
	};
	exports.MessageBackAction = MessageBackAction;
	exports.MessageBackData = MessageBackData;
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/actions/submit/sign-in.js
var require_sign_in$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var core = require_core();
	var SignInAction = class SignInAction extends core.SubmitAction {
		/**
		* Initial data that input fields will be combined with. These are essentially ‘hidden’ properties.
		*/
		data;
		constructor(value, options = {}) {
			super(options);
			Object.assign(this, options);
			this.data = { msteams: new SignInData(value) };
		}
		static from(options) {
			return new SignInAction(options.data.msteams.value, options);
		}
		withData(value) {
			super.withData({ msteams: value });
			return this;
		}
		withValue(value) {
			this.data.msteams.value = value;
			return this;
		}
	};
	var SignInData = class {
		type;
		/**
		* Set to the `URL` where you want to redirect.
		*/
		value;
		constructor(value) {
			this.type = "signin";
			this.value = value;
		}
	};
	exports.SignInAction = SignInAction;
	exports.SignInData = SignInData;
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/actions/submit/task-fetch.js
var require_task_fetch$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var core = require_core();
	var TaskFetchAction = class TaskFetchAction extends core.SubmitAction {
		/**
		* Initial data that input fields will be combined with. These are essentially ‘hidden’ properties.
		*/
		data;
		constructor(value, options = {}) {
			super(options);
			Object.assign(this, options);
			this.data = {
				...value,
				msteams: { type: "task/fetch" }
			};
		}
		static from(options) {
			return new TaskFetchAction(options.data, options);
		}
		withData(value) {
			this.data = value;
			return this;
		}
		withValue(value) {
			super.withData({
				...this.data,
				...value,
				msteams: { type: "task/fetch" }
			});
			return this;
		}
	};
	var TaskFetchData = class {
		msteams = { type: "task/fetch" };
		constructor(data) {
			if (data) {
				const { msteams, ...rest } = data;
				Object.assign(this, rest);
			}
		}
	};
	exports.TaskFetchAction = TaskFetchAction;
	exports.TaskFetchData = TaskFetchData;
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/actions/submit/collab-stage.js
var require_collab_stage = /* @__PURE__ */ __commonJSMin(((exports) => {
	var core = require_core();
	var CollabStageAction = class CollabStageAction extends core.SubmitAction {
		/**
		* Initial data that input fields will be combined with. These are essentially ‘hidden’ properties.
		*/
		data;
		constructor(tab, options = {}) {
			super(options);
			Object.assign(this, options);
			this.data = { msteams: {
				type: "invoke",
				value: tab ? {
					type: "tab/tabInfoAction",
					tabInfo: tab
				} : void 0
			} };
		}
		static from(options) {
			return new CollabStageAction(options.data.msteams.value?.tabInfo, options);
		}
		withData(value) {
			super.withData({ msteams: value });
			return this;
		}
		withValue(value) {
			this.data.msteams.value = new CollabStageValueData(value);
			return this;
		}
	};
	var CollabStageData = class {
		type;
		/**
		* Set the value to send with the invoke
		*/
		value;
		constructor(value) {
			this.type = "invoke";
			this.value = value;
		}
	};
	var CollabStageValueData = class {
		type;
		/**
		* Information about the iFrame content, rendered in the collab stage popout window.
		*/
		tabInfo;
		constructor(tab) {
			this.type = "tab/tabInfoAction";
			this.tabInfo = tab;
		}
	};
	exports.CollabStageAction = CollabStageAction;
	exports.CollabStageData = CollabStageData;
	exports.CollabStageValueData = CollabStageValueData;
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/actions/submit/index.js
var require_submit = /* @__PURE__ */ __commonJSMin(((exports) => {
	var imBack = require_im_back();
	var invoke = require_invoke$1();
	var messageBack = require_message_back();
	var signIn = require_sign_in$1();
	var taskFetch = require_task_fetch$1();
	var collabStage = require_collab_stage();
	Object.keys(imBack).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return imBack[k];
			}
		});
	});
	Object.keys(invoke).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return invoke[k];
			}
		});
	});
	Object.keys(messageBack).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageBack[k];
			}
		});
	});
	Object.keys(signIn).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signIn[k];
			}
		});
	});
	Object.keys(taskFetch).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskFetch[k];
			}
		});
	});
	Object.keys(collabStage).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return collabStage[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/actions/index.js
var require_actions = /* @__PURE__ */ __commonJSMin(((exports) => {
	var submit = require_submit();
	Object.keys(submit).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return submit[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/common/tab-info.js
var require_tab_info = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/common/index.js
var require_common = /* @__PURE__ */ __commonJSMin(((exports) => {
	var tabInfo = require_tab_info();
	Object.keys(tabInfo).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabInfo[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.cards/dist/index.js
var require_dist$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var core = require_core();
	var actions = require_actions();
	var common = require_common();
	Object.keys(core).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return core[k];
			}
		});
	});
	Object.keys(actions).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return actions[k];
			}
		});
	});
	Object.keys(common).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return common[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/utils/to-activity-params.js
var require_to_activity_params = /* @__PURE__ */ __commonJSMin(((exports) => {
	var teams_cards = require_dist$1();
	var message = require_message$1();
	function toActivityParams(activity) {
		if (typeof activity === "string") activity = {
			type: "message",
			text: activity
		};
		else if (teams_cards.isAdaptiveCard(activity)) activity = new message.MessageActivity().addCard("adaptive", activity);
		return activity;
	}
	exports.toActivityParams = toActivityParams;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/utils/index.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	var stripMentionsText = require_strip_mentions_text();
	var toActivityParams = require_to_activity_params();
	Object.keys(stripMentionsText).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return stripMentionsText[k];
			}
		});
	});
	Object.keys(toActivityParams).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return toActivityParams[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/message/message.js
var require_message$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var models = require_models();
	var activity = require_activity();
	var utils = require_utils();
	exports.MessageActivity = class MessageActivity extends activity.Activity {
		/**
		* The text content of the message.
		*/
		text;
		/**
		* The text to speak.
		*/
		speak;
		/**
		* Indicates whether your bot is accepting,
		* expecting, or ignoring user input after the message is delivered to the client. Possible
		* values include: 'acceptingInput', 'ignoringInput', 'expectingInput'
		*/
		inputHint;
		/**
		* The text to display if the channel cannot render cards.
		*/
		summary;
		/**
		* Format of text fields Default:markdown. Possible values include: 'markdown', 'plain', 'xml'
		*/
		textFormat;
		/**
		* The layout hint for multiple attachments. Default: list. Possible values include: 'list',
		* 'carousel'
		*/
		attachmentLayout;
		/**
		* Attachments
		*/
		attachments;
		/**
		* The suggested actions for the activity.
		*/
		suggestedActions;
		/**
		* The importance of the activity. Possible values include: 'low', 'normal', 'high'
		*/
		importance;
		/**
		* A delivery hint to signal to the recipient alternate delivery paths for the activity.
		* The default delivery mode is "default". Possible values include: 'normal', 'notification'
		*/
		deliveryMode;
		/**
		* The time at which the activity should be considered to be "expired" and should not be
		* presented to the recipient.
		*/
		expiration;
		/**
		* A value that is associated with the activity.
		*/
		value;
		constructor(text = "", value = {}) {
			super({
				...value,
				type: "message"
			});
			Object.assign(this, {
				text,
				...value
			});
		}
		/**
		* initialize from interface
		*/
		static from(activity) {
			return new MessageActivity(activity.text, activity);
		}
		/**
		* convert to interface
		*/
		toInterface() {
			return Object.assign({
				stripMentionsText: this.stripMentionsText.bind(this),
				isRecipientMentioned: this.isRecipientMentioned.bind(this),
				getAccountMention: this.getAccountMention.bind(this)
			}, this);
		}
		/**
		* copy to a new instance
		*/
		clone(options = {}) {
			return new MessageActivity(this.text, {
				...this.toInterface(),
				...options
			});
		}
		/**
		* The text content of the message.
		*/
		withText(value) {
			this.text = value;
			return this;
		}
		/**
		* The text to speak.
		*/
		withSpeak(value) {
			this.speak = value;
			return this;
		}
		/**
		* Indicates whether your bot is accepting,
		* expecting, or ignoring user input after the message is delivered to the client. Possible
		* values include: 'acceptingInput', 'ignoringInput', 'expectingInput'
		*/
		withInputHint(value) {
			this.inputHint = value;
			return this;
		}
		/**
		* The text to display if the channel cannot render cards.
		*/
		withSummary(value) {
			this.summary = value;
			return this;
		}
		/**
		* Format of text fields Default:markdown. Possible values include: 'markdown', 'plain', 'xml'
		*/
		withTextFormat(value) {
			this.textFormat = value;
			return this;
		}
		/**
		* The layout hint for multiple attachments. Default: list. Possible values include: 'list',
		* 'carousel'
		*/
		withAttachmentLayout(value) {
			this.attachmentLayout = value;
			return this;
		}
		/**
		* The suggested actions for the activity.
		*/
		withSuggestedActions(value) {
			this.suggestedActions = value;
			return this;
		}
		/**
		* The importance of the activity. Possible values include: 'low', 'normal', 'high'
		*/
		withImportance(value) {
			this.importance = value;
			return this;
		}
		/**
		* A delivery hint to signal to the recipient alternate delivery paths for the activity.
		* The default delivery mode is "default". Possible values include: 'normal', 'notification'
		*/
		withDeliveryMode(value) {
			this.deliveryMode = value;
			return this;
		}
		/**
		* The time at which the activity should be considered to be "expired" and should not be
		* presented to the recipient.
		*/
		withExpiration(value) {
			this.expiration = value;
			return this;
		}
		/**
		* Append text
		*/
		addText(text) {
			this.text += text;
			return this;
		}
		/**
		* Attachments
		*/
		addAttachments(...value) {
			if (!this.attachments) this.attachments = [];
			this.attachments.push(...value);
			return this;
		}
		/**
		* `@mention` an account
		* @param account the account to mention
		* @param options options to customize the mention
		*/
		addMention(account, options = {}) {
			const text = options.text || account.name;
			if (options.addText ?? true) this.addText(`<at>${text}</at>`);
			return this.addEntity({
				type: "mention",
				mentioned: account,
				text: `<at>${text}</at>`
			});
		}
		/**
		* Add a card attachment
		*/
		addCard(type, content) {
			return this.addAttachments(models.cardAttachment(type, content));
		}
		/**
		* remove "\<at>...\</at>" text from an activity
		*/
		stripMentionsText(options = {}) {
			this.text = utils.stripMentionsText(this, options);
			return this;
		}
		/**
		* is the recipient account mentioned
		*/
		isRecipientMentioned() {
			return (this.entities || []).filter((e) => e.type === "mention").some((e) => e.mentioned.id === this.recipient.id);
		}
		/**
		* get a mention by the account id if exists
		*/
		getAccountMention(accountId) {
			return (this.entities || []).filter((e) => e.type === "mention").find((e) => e.mentioned.id === accountId);
		}
		/**
		* Add stream info, making
		* this a final stream message
		*/
		addStreamFinal() {
			if (!this.channelData) this.channelData = {};
			this.channelData.streamId = this.id;
			this.channelData.streamType = "final";
			return this.addEntity({
				type: "streaminfo",
				streamId: this.id,
				streamType: "final"
			});
		}
		/**
		* Set the recipient of this message, optionally marking it as a targeted (ephemeral) message.
		* Targeted messages are only visible to the specified recipient in a shared conversation.
		* @param account - The recipient account
		* @param isTargeted - If true, marks this as a targeted message visible only to the recipient
		* @returns this instance for chaining
		*
		* @experimental This API is in preview and may change in the future.
		* Diagnostic: ExperimentalTeamsTargeted
		*/
		withRecipient(account, isTargeted = false) {
			super.withRecipient(account, isTargeted);
			return this;
		}
	};
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/message/message-update.js
var require_message_update = /* @__PURE__ */ __commonJSMin(((exports) => {
	var activity = require_activity();
	exports.MessageUpdateActivity = class MessageUpdateActivity extends activity.Activity {
		/**
		* The text content of the message.
		*/
		text;
		/**
		* The text to speak.
		*/
		speak;
		/**
		* The text to display if the channel cannot render cards.
		*/
		summary;
		/**
		* The time at which the activity should be considered to be "expired" and should not be
		* presented to the recipient.
		*/
		expiration;
		/**
		* A value that is associated with the activity.
		*/
		value;
		constructor(eventType, value = {}) {
			super({
				...value,
				type: "messageUpdate",
				channelData: {
					...value?.channelData,
					eventType
				}
			});
			Object.assign(this, {
				...value,
				channelData: {
					...value?.channelData,
					eventType
				}
			});
		}
		/**
		* initialize from interface
		*/
		static from(activity) {
			return new MessageUpdateActivity(activity.channelData.eventType, activity);
		}
		/**
		* convert to interface
		*/
		toInterface() {
			return Object.assign({}, this);
		}
		/**
		* copy to a new instance
		*/
		clone(options = {}) {
			return new MessageUpdateActivity(this.channelData.eventType, {
				...this.toInterface(),
				...options
			});
		}
		/**
		* The text content of the message.
		*/
		withText(value) {
			this.text = value;
			return this;
		}
		/**
		* The text to speak.
		*/
		withSpeak(value) {
			this.speak = value;
			return this;
		}
		/**
		* The text to display if the channel cannot render cards.
		*/
		withSummary(value) {
			this.summary = value;
			return this;
		}
		/**
		* The time at which the activity should be considered to be "expired" and should not be
		* presented to the recipient.
		*/
		withExpiration(value) {
			this.expiration = value;
			return this;
		}
	};
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/message/message-reaction.js
var require_message_reaction = /* @__PURE__ */ __commonJSMin(((exports) => {
	var activity = require_activity();
	exports.MessageReactionActivity = class MessageReactionActivity extends activity.Activity {
		/**
		* The collection of reactions added to the conversation.
		*/
		reactionsAdded;
		/**
		* The collection of reactions removed from the conversation.
		*/
		reactionsRemoved;
		constructor(value = {}) {
			super({
				...value,
				type: "messageReaction"
			});
			Object.assign(this, value);
		}
		/**
		* initialize from interface
		*/
		static from(activity) {
			return new MessageReactionActivity(activity);
		}
		/**
		* convert to interface
		*/
		toInterface() {
			return Object.assign({}, this);
		}
		/**
		* copy to a new instance
		*/
		clone(options = {}) {
			return new MessageReactionActivity({
				...this.toInterface(),
				...options
			});
		}
		/**
		* Add a message reaction.
		* @deprecated Use the api.reactions.add instead.
		*/
		addReaction(reaction) {
			if (!this.reactionsAdded) this.reactionsAdded = [];
			this.reactionsAdded.push(reaction);
			return this;
		}
		/**
		* Remove a message reaction.
		* @deprecated Use the api.reactions.remove instead.
		*/
		removeReaction(reaction) {
			if (!this.reactionsRemoved) this.reactionsRemoved = [];
			if (this.reactionsAdded) {
				const i = this.reactionsAdded.findIndex((r) => r.type === reaction.type && r.user?.id === reaction.user?.id);
				if (i > -1) this.reactionsAdded.splice(i, 1);
			}
			this.reactionsRemoved.push(reaction);
			return this;
		}
	};
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/message/index.js
var require_message$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var messageDelete = require_message_delete();
	var message = require_message$2();
	var messageUpdate = require_message_update();
	var messageReaction = require_message_reaction();
	Object.keys(messageDelete).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageDelete[k];
			}
		});
	});
	Object.keys(message).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return message[k];
			}
		});
	});
	Object.keys(messageUpdate).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageUpdate[k];
			}
		});
	});
	Object.keys(messageReaction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageReaction[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/event/meeting-end.js
var require_meeting_end = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/event/meeting-participant-join.js
var require_meeting_participant_join = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/event/meeting-participant-leave.js
var require_meeting_participant_leave = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/event/meeting-start.js
var require_meeting_start = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/event/read-receipt.js
var require_read_receipt = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/event/index.js
var require_event = /* @__PURE__ */ __commonJSMin(((exports) => {
	var meetingEnd = require_meeting_end();
	var meetingParticipantJoin = require_meeting_participant_join();
	var meetingParticipantLeave = require_meeting_participant_leave();
	var meetingStart = require_meeting_start();
	var readReceipt = require_read_receipt();
	Object.keys(meetingEnd).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meetingEnd[k];
			}
		});
	});
	Object.keys(meetingParticipantJoin).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meetingParticipantJoin[k];
			}
		});
	});
	Object.keys(meetingParticipantLeave).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meetingParticipantLeave[k];
			}
		});
	});
	Object.keys(meetingStart).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return meetingStart[k];
			}
		});
	});
	Object.keys(readReceipt).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return readReceipt[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/file-consent.js
var require_file_consent = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/execute-action.js
var require_execute_action = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/anon-query-link.js
var require_anon_query_link = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/card-button-clicked.js
var require_card_button_clicked = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/fetch-task.js
var require_fetch_task = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/query.js
var require_query = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/query-link.js
var require_query_link = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/query-setting-url.js
var require_query_setting_url = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/select-item.js
var require_select_item = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/setting.js
var require_setting = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/submit-action.js
var require_submit_action$1 = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message-extension/index.js
var require_message_extension = /* @__PURE__ */ __commonJSMin(((exports) => {
	var anonQueryLink = require_anon_query_link();
	var cardButtonClicked = require_card_button_clicked();
	var fetchTask = require_fetch_task();
	var query = require_query();
	var queryLink = require_query_link();
	var querySettingUrl = require_query_setting_url();
	var selectItem = require_select_item();
	var setting = require_setting();
	var submitAction = require_submit_action$1();
	Object.keys(anonQueryLink).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return anonQueryLink[k];
			}
		});
	});
	Object.keys(cardButtonClicked).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return cardButtonClicked[k];
			}
		});
	});
	Object.keys(fetchTask).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return fetchTask[k];
			}
		});
	});
	Object.keys(query).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return query[k];
			}
		});
	});
	Object.keys(queryLink).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return queryLink[k];
			}
		});
	});
	Object.keys(querySettingUrl).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return querySettingUrl[k];
			}
		});
	});
	Object.keys(selectItem).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return selectItem[k];
			}
		});
	});
	Object.keys(setting).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return setting[k];
			}
		});
	});
	Object.keys(submitAction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return submitAction[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/config/config-fetch.js
var require_config_fetch = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/config/config-submit.js
var require_config_submit = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/config/index.js
var require_config = /* @__PURE__ */ __commonJSMin(((exports) => {
	var configFetch = require_config_fetch();
	var configSubmit = require_config_submit();
	Object.keys(configFetch).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return configFetch[k];
			}
		});
	});
	Object.keys(configSubmit).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return configSubmit[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/tab/tab-fetch.js
var require_tab_fetch = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/tab/tab-submit.js
var require_tab_submit = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/tab/index.js
var require_tab = /* @__PURE__ */ __commonJSMin(((exports) => {
	var tabFetch = require_tab_fetch();
	var tabSubmit = require_tab_submit();
	Object.keys(tabFetch).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabFetch[k];
			}
		});
	});
	Object.keys(tabSubmit).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tabSubmit[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/task/task-fetch.js
var require_task_fetch = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/task/task-submit.js
var require_task_submit = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/task/index.js
var require_task = /* @__PURE__ */ __commonJSMin(((exports) => {
	var taskFetch = require_task_fetch();
	var taskSubmit = require_task_submit();
	Object.keys(taskFetch).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskFetch[k];
			}
		});
	});
	Object.keys(taskSubmit).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return taskSubmit[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message/submit-action.js
var require_submit_action = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/message/index.js
var require_message = /* @__PURE__ */ __commonJSMin(((exports) => {
	var submitAction = require_submit_action();
	Object.keys(submitAction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return submitAction[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/handoff-action.js
var require_handoff_action = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/sign-in/failure.js
var require_failure = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/sign-in/token-exchange.js
var require_token_exchange = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/sign-in/verify-state.js
var require_verify_state = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/sign-in/index.js
var require_sign_in = /* @__PURE__ */ __commonJSMin(((exports) => {
	var failure = require_failure();
	var tokenExchange = require_token_exchange();
	var verifyState = require_verify_state();
	Object.keys(failure).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return failure[k];
			}
		});
	});
	Object.keys(tokenExchange).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tokenExchange[k];
			}
		});
	});
	Object.keys(verifyState).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return verifyState[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/adaptive-card/action.js
var require_action = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/adaptive-card/index.js
var require_adaptive_card = /* @__PURE__ */ __commonJSMin(((exports) => {
	var action = require_action();
	Object.keys(action).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return action[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/invoke/index.js
var require_invoke = /* @__PURE__ */ __commonJSMin(((exports) => {
	var fileConsent = require_file_consent();
	var executeAction = require_execute_action();
	var messageExtension = require_message_extension();
	var config = require_config();
	var tab = require_tab();
	var task = require_task();
	var message = require_message();
	var handoffAction = require_handoff_action();
	var signIn = require_sign_in();
	var adaptiveCard = require_adaptive_card();
	Object.keys(fileConsent).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return fileConsent[k];
			}
		});
	});
	Object.keys(executeAction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return executeAction[k];
			}
		});
	});
	Object.keys(messageExtension).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return messageExtension[k];
			}
		});
	});
	Object.keys(config).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return config[k];
			}
		});
	});
	Object.keys(tab).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return tab[k];
			}
		});
	});
	Object.keys(task).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return task[k];
			}
		});
	});
	Object.keys(message).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return message[k];
			}
		});
	});
	Object.keys(handoffAction).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return handoffAction[k];
			}
		});
	});
	Object.keys(signIn).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return signIn[k];
			}
		});
	});
	Object.keys(adaptiveCard).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return adaptiveCard[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/trace.js
var require_trace = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/typing.js
var require_typing = /* @__PURE__ */ __commonJSMin(((exports) => {
	var activity = require_activity();
	exports.TypingActivity = class TypingActivity extends activity.Activity {
		/**
		* The text content of the message.
		*/
		text;
		constructor(value = {}) {
			super({
				type: "typing",
				...value
			});
			Object.assign(this, value);
		}
		/**
		* initialize from interface
		*/
		static from(activity) {
			return new TypingActivity(activity);
		}
		/**
		* convert to interface
		*/
		toInterface() {
			return Object.assign({}, this);
		}
		/**
		* copy to a new instance
		*/
		clone(options = {}) {
			return new TypingActivity({
				...this.toInterface(),
				...options
			});
		}
		/**
		* The text content of the message.
		*/
		withText(value) {
			this.text = value;
			return this;
		}
		/**
		* Append text
		*/
		addText(text) {
			if (!this.text) this.text = "";
			this.text += text;
			return this;
		}
		/**
		* Add stream informative update
		* @param id the stream id
		* @param sequence the sequence number (index) of the chunk
		*/
		addStreamUpdate(sequence = 0) {
			if (!this.channelData) this.channelData = {};
			if (!this.channelData.streamId) this.channelData.streamId = this.id;
			if (!this.channelData.streamType) this.channelData.streamType = "streaming";
			if (!this.channelData.streamSequence) this.channelData.streamSequence = sequence;
			return this.addEntity({
				type: "streaminfo",
				streamId: this.id,
				streamType: this.channelData.streamType,
				streamSequence: this.channelData.streamSequence
			});
		}
	};
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/handoff.js
var require_handoff = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/conversation/conversation-update.js
var require_conversation_update = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/conversation/end-of-conversation.js
var require_end_of_conversation = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/conversation/index.js
var require_conversation = /* @__PURE__ */ __commonJSMin(((exports) => {
	var conversationUpdate = require_conversation_update();
	var endOfConversation = require_end_of_conversation();
	Object.keys(conversationUpdate).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return conversationUpdate[k];
			}
		});
	});
	Object.keys(endOfConversation).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return endOfConversation[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/command/command-result.js
var require_command_result = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/command/command-send.js
var require_command_send = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/command/index.js
var require_command = /* @__PURE__ */ __commonJSMin(((exports) => {
	var commandResult = require_command_result();
	var commandSend = require_command_send();
	Object.keys(commandResult).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return commandResult[k];
			}
		});
	});
	Object.keys(commandSend).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return commandSend[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/install-update/add.js
var require_add = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/install-update/remove.js
var require_remove = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/install-update/index.js
var require_install_update = /* @__PURE__ */ __commonJSMin(((exports) => {
	var add = require_add();
	var remove = require_remove();
	Object.keys(add).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return add[k];
			}
		});
	});
	Object.keys(remove).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return remove[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/activities/index.js
var require_activities = /* @__PURE__ */ __commonJSMin(((exports) => {
	var message = require_message$1();
	var event = require_event();
	var invoke = require_invoke();
	var trace = require_trace();
	var typing = require_typing();
	var handoff = require_handoff();
	var conversation = require_conversation();
	var command = require_command();
	var installUpdate = require_install_update();
	var utils = require_utils();
	var activity = require_activity();
	Object.defineProperty(exports, "$Activity", {
		enumerable: true,
		get: function() {
			return activity.Activity;
		}
	});
	Object.keys(message).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return message[k];
			}
		});
	});
	Object.keys(event).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return event[k];
			}
		});
	});
	Object.keys(invoke).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return invoke[k];
			}
		});
	});
	Object.keys(trace).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return trace[k];
			}
		});
	});
	Object.keys(typing).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return typing[k];
			}
		});
	});
	Object.keys(handoff).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return handoff[k];
			}
		});
	});
	Object.keys(conversation).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return conversation[k];
			}
		});
	});
	Object.keys(command).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return command[k];
			}
		});
	});
	Object.keys(installUpdate).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return installUpdate[k];
			}
		});
	});
	Object.keys(utils).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return utils[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/auth/token.js
var require_token = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/jwt-decode/build/cjs/index.js
var require_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.jwtDecode = exports.InvalidTokenError = void 0;
	var InvalidTokenError = class extends Error {};
	exports.InvalidTokenError = InvalidTokenError;
	InvalidTokenError.prototype.name = "InvalidTokenError";
	function b64DecodeUnicode(str) {
		return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
			let code = p.charCodeAt(0).toString(16).toUpperCase();
			if (code.length < 2) code = "0" + code;
			return "%" + code;
		}));
	}
	function base64UrlDecode(str) {
		let output = str.replace(/-/g, "+").replace(/_/g, "/");
		switch (output.length % 4) {
			case 0: break;
			case 2:
				output += "==";
				break;
			case 3:
				output += "=";
				break;
			default: throw new Error("base64 string is not of the correct length");
		}
		try {
			return b64DecodeUnicode(output);
		} catch (err) {
			return atob(output);
		}
	}
	function jwtDecode(token, options) {
		if (typeof token !== "string") throw new InvalidTokenError("Invalid token specified: must be a string");
		options || (options = {});
		const pos = options.header === true ? 0 : 1;
		const part = token.split(".")[pos];
		if (typeof part !== "string") throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
		let decoded;
		try {
			decoded = base64UrlDecode(part);
		} catch (e) {
			throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
		}
		try {
			return JSON.parse(decoded);
		} catch (e) {
			throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
		}
	}
	exports.jwtDecode = jwtDecode;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/auth/caller.js
var require_caller = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.CallerIds = {
		azure: "urn:botframework:azure",
		gov: "urn:botframework:azureusgov",
		bot: "urn:botframework:aadappid"
	};
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/auth/json-web-token.js
var require_json_web_token = /* @__PURE__ */ __commonJSMin(((exports) => {
	var jwtDecode = require_cjs();
	var caller = require_caller();
	var JsonWebToken = class {
		get audience() {
			return this._payload.aud;
		}
		get issuer() {
			return this._payload.iss;
		}
		get keyId() {
			return this._payload["kid"];
		}
		get appId() {
			return this._payload["appid"];
		}
		get appDisplayName() {
			return this._payload["app_displayname"];
		}
		get tenantId() {
			return this._payload["tid"];
		}
		get version() {
			return this._payload["version"];
		}
		get serviceUrl() {
			let v = this._payload["serviceurl"] || "https://smba.trafficmanager.net/teams";
			if (v.endsWith("/")) v = v.slice(0, v.length - 1);
			return v;
		}
		get from() {
			if (this.appId) return "bot";
			return "azure";
		}
		get fromId() {
			if (this.from === "bot") return `${caller.CallerIds.bot}:${this.appId}`;
			return caller.CallerIds.azure;
		}
		get expiration() {
			if (this._payload.exp) return this._payload.exp * 1e3;
		}
		_value;
		_payload;
		constructor(value) {
			this._value = value;
			this._payload = jwtDecode.jwtDecode(value);
		}
		isExpired(bufferMs = 1e3 * 60 * 5) {
			if (!this.expiration) return false;
			return this.expiration < Date.now() + bufferMs;
		}
		toString() {
			return this._value;
		}
	};
	exports.JsonWebToken = JsonWebToken;
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/auth/credentials.js
var require_credentials = /* @__PURE__ */ __commonJSMin((() => {}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/auth/index.js
var require_auth = /* @__PURE__ */ __commonJSMin(((exports) => {
	var token = require_token();
	var jsonWebToken = require_json_web_token();
	var credentials = require_credentials();
	Object.keys(token).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return token[k];
			}
		});
	});
	Object.keys(jsonWebToken).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return jsonWebToken[k];
			}
		});
	});
	Object.keys(credentials).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return credentials[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/@microsoft/teams.api/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	var clients = require_clients();
	var models = require_models();
	var activities = require_activities();
	var auth = require_auth();
	Object.keys(clients).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return clients[k];
			}
		});
	});
	Object.keys(models).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return models[k];
			}
		});
	});
	Object.keys(activities).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return activities[k];
			}
		});
	});
	Object.keys(auth).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return auth[k];
			}
		});
	});
}));
//#endregion
export { require_lib as n, require_dist as t };
