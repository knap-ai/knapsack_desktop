import { signal } from './index.ts.js';

let _init_value, _init_extra_value;
function _applyDecs(e, t, n, r, o, i) { var a, c, u, s, f, l, p, d = Symbol.metadata || Symbol.for("Symbol.metadata"), m = Object.defineProperty, h = Object.create, y = [h(null), h(null)], v = t.length; function g(t, n, r) { return function (o, i) { n && (i = o, o = e); for (var a = 0; a < t.length; a++) i = t[a].apply(o, r ? [i] : []); return r ? i : o; }; } function b(e, t, n, r) { if ("function" != typeof e && (r || void 0 !== e)) throw new TypeError(t + " must " + (n || "be") + " a function" + (r ? "" : " or undefined")); return e; } function applyDec(e, t, n, r, o, i, u, s, f, l, p) { function d(e) { if (!p(e)) throw new TypeError("Attempted to access private element on non-instance"); } var h = [].concat(t[0]), v = t[3], w = !u, D = 1 === o, S = 3 === o, j = 4 === o, E = 2 === o; function I(t, n, r) { return function (o, i) { return n && (i = o, o = e), r && r(o), P[t].call(o, i); }; } if (!w) { var P = {}, k = [], F = S ? "get" : j || D ? "set" : "value"; if (f ? (l || D ? P = { get: _setFunctionName(function () { return v(this); }, r, "get"), set: function (e) { t[4](this, e); } } : P[F] = v, l || _setFunctionName(P[F], r, E ? "" : F)) : l || (P = Object.getOwnPropertyDescriptor(e, r)), !l && !f) { if ((c = y[+s][r]) && 7 != (c ^ o)) throw Error("Decorating two elements with the same name (" + P[F].name + ") is not supported yet"); y[+s][r] = o < 3 ? 1 : o; } } for (var N = e, O = h.length - 1; O >= 0; O -= n ? 2 : 1) { var z = b(h[O], "A decorator", "be", !0), A = n ? h[O - 1] : void 0, H = {}, K = { kind: ["field", "accessor", "method", "getter", "setter", "class"][o], name: r, metadata: a, addInitializer: function (e, t) { if (e.v) throw Error("attempted to call addInitializer after decoration was finished"); b(t, "An initializer", "be", !0), i.push(t); }.bind(null, H) }; if (w) c = z.call(A, N, K), H.v = 1, b(c, "class decorators", "return") && (N = c);else if (K.static = s, K.private = f, c = K.access = { has: f ? p.bind() : function (e) { return r in e; } }, j || (c.get = f ? E ? function (e) { return d(e), P.value; } : I("get", 0, d) : function (e) { return e[r]; }), E || S || (c.set = f ? I("set", 0, d) : function (e, t) { e[r] = t; }), N = z.call(A, D ? { get: P.get, set: P.set } : P[F], K), H.v = 1, D) { if ("object" == typeof N && N) (c = b(N.get, "accessor.get")) && (P.get = c), (c = b(N.set, "accessor.set")) && (P.set = c), (c = b(N.init, "accessor.init")) && k.unshift(c);else if (void 0 !== N) throw new TypeError("accessor decorators must return an object with get, set, or init properties or undefined"); } else b(N, (l ? "field" : "method") + " decorators", "return") && (l ? k.unshift(N) : P[F] = N); } return o < 2 && u.push(g(k, s, 1), g(i, s, 0)), l || w || (f ? D ? u.splice(-1, 0, I("get", s), I("set", s)) : u.push(E ? P[F] : b.call.bind(P[F])) : m(e, r, P)), N; } function w(e) { return m(e, d, { configurable: !0, enumerable: !0, value: a }); } return void 0 !== i && (a = i[d]), a = h(null == a ? null : a), f = [], l = function (e) { e && f.push(g(e)); }, p = function (t, r) { for (var i = 0; i < n.length; i++) { var a = n[i], c = a[1], l = 7 & c; if ((8 & c) == t && !l == r) { var p = a[2], d = !!a[3], m = 16 & c; applyDec(t ? e : e.prototype, a, m, d ? "#" + p : _toPropertyKey(p), l, l < 2 ? [] : t ? s = s || [] : u = u || [], f, !!t, d, r, t && d ? function (t) { return _checkInRHS(t) === e; } : o); } } }, p(8, 0), p(0, 0), p(8, 1), p(0, 1), l(u), l(s), c = f, v || w(e), { e: c, get c() { var n = []; return v && [w(e = applyDec(e, [t], r, e.name, 5, n)), g(n, 1)]; } }; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _setFunctionName(e, t, n) { "symbol" == typeof t && (t = (t = t.description) ? "[" + t + "]" : ""); try { Object.defineProperty(e, "name", { configurable: !0, value: n ? n + " " + t : t }); } catch (e) {} return e; }
function _checkInRHS(e) { if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (null !== e ? typeof e : "null")); return e; }
class Meta {
  static {
    [_init_value, _init_extra_value] = _applyDecs(this, [], [[signal, 1, "value"]]).e;
  }
  constructor() {
    _init_extra_value(this);
  }
  prevRemote;
  peek;
  #A = _init_value(this);
  get value() {
    return this.#A;
  }
  set value(v) {
    this.#A = v;
  }
}
function getOrCreateMeta(instance, metas, initializer) {
  let meta = metas.get(instance);
  if (meta === undefined) {
    meta = new Meta();
    metas.set(instance, meta);
    meta.value = meta.peek = typeof initializer === "function" ? initializer.call(instance) : initializer;
  }
  return meta;
}
function get(obj, path) {
  let current = obj;
  let parts = path.split(".");
  for (let part of parts) {
    if (!current) return current;
    if (!(part in current)) {
      throw new Error(`sub-path ${part} (from ${path}) does not exist on ${JSON.stringify(current)}.`);
    }
    current = current[part];
  }
  return current;
}

/**
 * Forks remote state for local modification
 *
 * ```js
 * import { Signal } from 'signal-polyfill';
 * import { localCopy } from 'signal-utils';
 *
 * const remote = new Signal.State(0);
 *
 * const local = localCopy(() => remote.get());
 * ```
 */

/**
 * Forks remote state for local modification
 *
 * ```js
 * import { localCopy } from 'signal-utils';
 *
 * class Demo {
 *    @localCopy('remote.value') accessor localValue;
 * }
 * ```
 */

/**
 * Forks remote state for local modification
 *
 * ```js
 * import { localCopy } from 'signal-utils';
 *
 * class Demo {
 *    @localCopy('remote.value') accessor localValue;
 * }
 * ```
 */
function localCopy(...args) {
  if (typeof args[0] === "function") {
    return localCopyFn(args[0]);
  }
  let [first, second] = args;
  return localCopyDecorator(first, second);
}
function localCopyFn(memoFn) {
  let metas = new WeakMap();
  return {
    get() {
      let meta = getOrCreateMeta(this, metas);
      let {
        prevRemote
      } = meta;
      let incomingValue = memoFn();
      if (prevRemote !== incomingValue) {
        // If the incoming value is not the same as the previous incoming value,
        // update the local value to match the new incoming value, and update
        // the previous incoming value.
        meta.value = meta.prevRemote = incomingValue;
      }
      return meta.value;
    },
    set(value) {
      if (!metas.has(this)) {
        let meta = getOrCreateMeta(this, metas);
        meta.prevRemote = memoFn();
        meta.value = value;
        return;
      }
      getOrCreateMeta(this, metas).value = value;
    }
  };
}
function localCopyDecorator(memo, initializer) {
  if (typeof memo !== "string") {
    throw new Error(`@localCopy() must be given a memo path as its first argument, received \`${String(memo)}\``);
  }
  let metas = new WeakMap();
  return function localCopyDecorator(_target, _context) {
    let memoFn = obj => get(obj, memo);
    return {
      get() {
        let meta = getOrCreateMeta(this, metas, initializer);
        let {
          prevRemote
        } = meta;
        let incomingValue = memoFn(this);
        if (prevRemote !== incomingValue) {
          // If the incoming value is not the same as the previous incoming value,
          // update the local value to match the new incoming value, and update
          // the previous incoming value.
          meta.value = meta.prevRemote = incomingValue;
        }
        return meta.value;
      },
      set(value) {
        if (!metas.has(this)) {
          let meta = getOrCreateMeta(this, metas, initializer);
          meta.prevRemote = memoFn(this);
          meta.value = value;
          return;
        }
        getOrCreateMeta(this, metas, initializer).value = value;
      }
    };
  };
}

export { localCopy };
//# sourceMappingURL=local-copy.ts.js.map
