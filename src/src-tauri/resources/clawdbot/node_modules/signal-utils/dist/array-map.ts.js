import { signal } from './index.ts.js';

let _initProto;
function _applyDecs(e, t, n, r, o, i) { var a, c, u, s, f, l, p, d = Symbol.metadata || Symbol.for("Symbol.metadata"), m = Object.defineProperty, h = Object.create, y = [h(null), h(null)], v = t.length; function g(t, n, r) { return function (o, i) { n && (i = o, o = e); for (var a = 0; a < t.length; a++) i = t[a].apply(o, r ? [i] : []); return r ? i : o; }; } function b(e, t, n, r) { if ("function" != typeof e && (r || void 0 !== e)) throw new TypeError(t + " must " + (n || "be") + " a function" + (r ? "" : " or undefined")); return e; } function applyDec(e, t, n, r, o, i, u, s, f, l, p) { function d(e) { if (!p(e)) throw new TypeError("Attempted to access private element on non-instance"); } var h = [].concat(t[0]), v = t[3], w = !u, D = 1 === o, S = 3 === o, j = 4 === o, E = 2 === o; function I(t, n, r) { return function (o, i) { return n && (i = o, o = e), r && r(o), P[t].call(o, i); }; } if (!w) { var P = {}, k = [], F = S ? "get" : j || D ? "set" : "value"; if (f ? (l || D ? P = { get: _setFunctionName(function () { return v(this); }, r, "get"), set: function (e) { t[4](this, e); } } : P[F] = v, l || _setFunctionName(P[F], r, E ? "" : F)) : l || (P = Object.getOwnPropertyDescriptor(e, r)), !l && !f) { if ((c = y[+s][r]) && 7 != (c ^ o)) throw Error("Decorating two elements with the same name (" + P[F].name + ") is not supported yet"); y[+s][r] = o < 3 ? 1 : o; } } for (var N = e, O = h.length - 1; O >= 0; O -= n ? 2 : 1) { var z = b(h[O], "A decorator", "be", !0), A = n ? h[O - 1] : void 0, H = {}, K = { kind: ["field", "accessor", "method", "getter", "setter", "class"][o], name: r, metadata: a, addInitializer: function (e, t) { if (e.v) throw Error("attempted to call addInitializer after decoration was finished"); b(t, "An initializer", "be", !0), i.push(t); }.bind(null, H) }; if (w) c = z.call(A, N, K), H.v = 1, b(c, "class decorators", "return") && (N = c);else if (K.static = s, K.private = f, c = K.access = { has: f ? p.bind() : function (e) { return r in e; } }, j || (c.get = f ? E ? function (e) { return d(e), P.value; } : I("get", 0, d) : function (e) { return e[r]; }), E || S || (c.set = f ? I("set", 0, d) : function (e, t) { e[r] = t; }), N = z.call(A, D ? { get: P.get, set: P.set } : P[F], K), H.v = 1, D) { if ("object" == typeof N && N) (c = b(N.get, "accessor.get")) && (P.get = c), (c = b(N.set, "accessor.set")) && (P.set = c), (c = b(N.init, "accessor.init")) && k.unshift(c);else if (void 0 !== N) throw new TypeError("accessor decorators must return an object with get, set, or init properties or undefined"); } else b(N, (l ? "field" : "method") + " decorators", "return") && (l ? k.unshift(N) : P[F] = N); } return o < 2 && u.push(g(k, s, 1), g(i, s, 0)), l || w || (f ? D ? u.splice(-1, 0, I("get", s), I("set", s)) : u.push(E ? P[F] : b.call.bind(P[F])) : m(e, r, P)), N; } function w(e) { return m(e, d, { configurable: !0, enumerable: !0, value: a }); } return void 0 !== i && (a = i[d]), a = h(null == a ? null : a), f = [], l = function (e) { e && f.push(g(e)); }, p = function (t, r) { for (var i = 0; i < n.length; i++) { var a = n[i], c = a[1], l = 7 & c; if ((8 & c) == t && !l == r) { var p = a[2], d = !!a[3], m = 16 & c; applyDec(t ? e : e.prototype, a, m, d ? "#" + p : _toPropertyKey(p), l, l < 2 ? [] : t ? s = s || [] : u = u || [], f, !!t, d, r, t && d ? function (t) { return _checkInRHS(t) === e; } : o); } } }, p(8, 0), p(0, 0), p(8, 1), p(0, 1), l(u), l(s), c = f, v || w(e), { e: c, get c() { var n = []; return v && [w(e = applyDec(e, [t], r, e.name, 5, n)), g(n, 1)]; } }; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _setFunctionName(e, t, n) { "symbol" == typeof t && (t = (t = t.description) ? "[" + t + "]" : ""); try { Object.defineProperty(e, "name", { configurable: !0, value: n ? n + " " + t : t }); } catch (e) {} return e; }
function _checkInRHS(e) { if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (null !== e ? typeof e : "null")); return e; }

/**
 * Public API of the return value of the [[map]] utility.
 */

/**
 * Reactivily apply a `map` function to each element in an array,
 * persisting map-results for each object, based on identity.
 *
 * This is useful when you have a large collection of items that
 * need to be transformed into a different shape (adding/removing/modifying data/properties)
 * and you want the transform to be efficient when iterating over that data.
 *
 * A common use case where this `map` utility provides benefits over is
 * ```js
 * class MyClass {\
 *   @signal
 *   get wrappedRecords() {
 *     return this.records.map(record => new SomeWrapper(record));
 *   }
 * }
 * ```
 *
 * Even though the above is a cached computed (via `@signal`), if any signal data accessed during the evaluation of `wrappedRecords`
 * changes, the entire array.map will re-run, often doing duplicate work for every unchanged item in the array.
 *
 * @return {MappedArray} an object that behaves like an array. This shouldn't be modified directly. Instead, you can freely modify the data returned by the `data` function, which should be auto-tracked in order to benefit from this abstraction.
 *
 * @example
 *
 * ```js
 *  import { arrayMap } from 'signal-utils/array-map';
 *
 *  class MyClass {
 *    wrappedRecords = map({
 *      data: () => this.records,
 *      map: (record) => new SomeWrapper(record),
 *    }),
 *  }
 * ```
 */
function arrayMap(options) {
  let {
    data,
    map
  } = options;
  return new TrackedArrayMap(data, map);
}
const AT = Symbol("__AT__");

/**
 * @private
 */
class TrackedArrayMap {
  static {
    [_initProto] = _applyDecs(this, [], [[signal, 3, "_records"]]).e;
  } // Tells TS that we can array-index-access
  // these can't be real private fields
  // until @cached is a real decorator
  _mapCache = (_initProto(this), new WeakMap());
  _dataFn;
  _mapFn;
  constructor(data, map) {
    this._dataFn = data;
    this._mapFn = map;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    /**
     * This is what allows square-bracket index-access to work.
     *
     * Unfortunately this means the returned value is
     * Proxy -> Proxy -> wrapper object -> *then* the class instance
     *
     * Maybe JS has a way to implement array-index access, but I don't know how
     */
    return new Proxy(this, {
      get(_target, property) {
        if (typeof property === "string") {
          let parsed = parseInt(property, 10);
          if (!isNaN(parsed)) {
            return self[AT](parsed);
          }
        }
        return self[property];
      }
      // Is there a way to do this without lying to TypeScript?
    });
  }
  get _records() {
    let data = this._dataFn();
    if (!data.every(datum => typeof datum === "object")) {
      throw new Error(`Every entry in the data passed to \`map\` must be an object.`);
    }
    return data;
  }
  values = () => [...this];
  get length() {
    return this._records.length;
  }
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => {
        if (i >= this.length) {
          return {
            done: true,
            value: null
          };
        }
        let value = this[AT](i);
        i++;
        return {
          value,
          done: false
        };
      }
    };
  }

  /**
   * @private
   *
   * don't conflict with
   *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
   */
  [AT] = i => {
    let record = this._records[i];
    if (!record) {
      throw new Error(`Expected record to exist at index ${i}, but it did not. ` + `The array item is expected to exist, because the map utility resource lazily iterates along the indices of the original array passed as data. ` + `This error could happen if the data array passed to map has been mutated while iterating. ` + `To resolve this error, do not mutate arrays while iteration occurs.`);
    }
    let value = this._mapCache.get(record);
    if (!value) {
      value = this._mapFn(record);
      this._mapCache.set(record, value);
    }
    return value;
  };
}

export { TrackedArrayMap, arrayMap };
//# sourceMappingURL=array-map.ts.js.map
