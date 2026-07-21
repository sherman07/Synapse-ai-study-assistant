function Nx(e, n) {
  for (var o = 0; o < n.length; o++) {
    const i = n[o];
    if (typeof i != "string" && !Array.isArray(i)) {
      for (const a in i)
        if (a !== "default" && !(a in e)) {
          const c = Object.getOwnPropertyDescriptor(i, a);
          c && Object.defineProperty(e, a, c.get ? c : {
            enumerable: !0,
            get: () => i[a]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }));
}
function Ix(e) {
  const o = String(e || "").toLowerCase().split(".");
  if (o.length !== 4 || o.some((a) => !/^\d+$/.test(a))) return !1;
  const i = o.map(Number);
  return i.some((a) => a < 0 || a > 255) ? !1 : i[0] === 10 || i[0] === 172 && i[1] >= 16 && i[1] <= 31 || i[0] === 192 && i[1] === 168;
}
function dg(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function th(e) {
  return dg(e) || Ix(e);
}
function jx(e) {
  return !e || dg(e) ? "127.0.0.1" : e;
}
const Fx = (() => {
  var p, h, g, S;
  const { protocol: e, hostname: n, port: o } = window.location, i = String(window.SYNAPSE_BACKEND_PORT || ((h = (p = document.body) == null ? void 0 : p.dataset) == null ? void 0 : h.apiPort) || "8001").trim(), a = `http://${jx(n)}:${i || "8001"}`, c = String(window.SYNAPSE_API_BASE || ((S = (g = document.body) == null ? void 0 : g.dataset) == null ? void 0 : S.apiBase) || "").replace(/\/+$/, ""), d = `${e}//${window.location.host}`.replace(/\/+$/, "");
  return c && !(th(n) && o !== i && c === d) ? c : e === "file:" || th(n) && o !== i ? a : `${e}//${window.location.host}`;
})();
class Vs extends Error {
  constructor(n, { cause: o } = {}) {
    super(n), this.name = "ApiConnectionError", this.cause = o;
  }
}
const nh = "synapse.client.id.v1";
function Ln() {
  return globalThis.window || globalThis;
}
function Xr(e, n = 220) {
  return String(e || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
}
function rh() {
  const e = globalThis.crypto || Ln().crypto;
  return e != null && e.randomUUID ? e.randomUUID() : `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
function Ox() {
  var n, o;
  const e = Ln();
  try {
    const i = (n = e.localStorage) == null ? void 0 : n.getItem(nh);
    if (i) return i;
    const a = rh();
    return (o = e.localStorage) == null || o.setItem(nh, a), a;
  } catch {
    return rh();
  }
}
function Lx(e = {}) {
  if (typeof Headers < "u" && e instanceof Headers) {
    const n = {};
    return e.forEach((o, i) => {
      n[i] = o;
    }), n;
  }
  return Array.isArray(e) ? Object.fromEntries(e) : { ...e || {} };
}
class fg {
  constructor(n, { fetchImpl: o } = {}) {
    var a, c;
    const i = Ln();
    this.baseUrl = String(n || "").replace(/\/+$/, ""), this.fetchImpl = o || ((a = i.fetch) == null ? void 0 : a.bind(i)) || ((c = globalThis.fetch) == null ? void 0 : c.bind(globalThis));
  }
  endpoint(n) {
    const o = String(n || "").replace(/^\/+/, "");
    return `${this.baseUrl}/${o}`;
  }
  timeoutMessage(n) {
    return `Synapse backend did not respond within ${Math.max(1, Math.round(Number(n || 0) / 1e3))} seconds. Try a smaller source set or increase window.SYNAPSE_ANALYSIS_TIMEOUT_MS.`;
  }
  isLocalBackend() {
    try {
      const n = new URL(this.baseUrl).hostname.toLowerCase();
      return n === "localhost" || n === "127.0.0.1" || n === "0.0.0.0";
    } catch {
      return !0;
    }
  }
  connectionMessage() {
    return this.isLocalBackend() ? [
      `Cannot reach the Synapse backend at ${this.baseUrl}.`,
      "Start the local stack with `bash scripts/start_local_stack.sh`, or run `.venv/bin/python run_backend.py` manually, then try again."
    ].join(" ") : [
      `Synapse could not reach its hosted service at ${this.baseUrl}.`,
      "The service may be waking up. Wait a moment and retry; if this keeps happening, contact Synapse support."
    ].join(" ");
  }
  async requestHeaders(n = {}) {
    var c, d, p;
    const o = Ln(), i = Lx(n);
    i["X-Synapse-Client-Id"] = Xr(Ox(), 160);
    const a = (d = (c = o.SynapseAuth) == null ? void 0 : c.getStoredSession) == null ? void 0 : d.call(c);
    if (a && typeof a == "object" && (a.accountId && (i["X-Synapse-User-Id"] = Xr(a.accountId, 160)), a.email && (i["X-Synapse-User-Email"] = Xr(a.email, 220)), a.displayName && (i["X-Synapse-User-Name"] = Xr(a.displayName, 180)), a.authMode && (i["X-Synapse-Auth-Mode"] = Xr(a.authMode, 60)), a.role && (i["X-Synapse-User-Role"] = Xr(a.role, 80))), (p = o.SynapseAuth) != null && p.authHeaders && !i.Authorization && !i.authorization)
      try {
        const h = await o.SynapseAuth.authHeaders({});
        h != null && h.Authorization && (i.Authorization = h.Authorization), h != null && h.authorization && (i.authorization = h.authorization);
      } catch (h) {
        console.warn("Synapse auth headers were not attached:", h);
      }
    return i;
  }
  async fetch(n, o = {}) {
    var l;
    const i = this.endpoint(n), { timeoutMs: a, ...c } = o || {};
    c.headers = await this.requestHeaders(c.headers || {});
    const d = Number(a || 0);
    let p = null, h = null, g = null;
    const S = c.signal;
    d > 0 && typeof AbortController < "u" && (p = new AbortController(), g = () => p.abort(), S && (S.aborted ? p.abort() : S.addEventListener("abort", g, { once: !0 })), h = Ln().setTimeout(() => p.abort(), d), c.signal = p.signal);
    try {
      return await this.fetchImpl(i, c);
    } catch (f) {
      throw (l = p == null ? void 0 : p.signal) != null && l.aborted ? new Vs(this.timeoutMessage(d), { cause: f }) : new Vs(this.connectionMessage(), { cause: f });
    } finally {
      h && Ln().clearTimeout(h), S && g && S.removeEventListener("abort", g);
    }
  }
  async warmup({ attempts: n = 2, retryDelayMs: o = 1500, timeoutMs: i = 6e4, maxWaitMs: a = 0, signal: c } = {}) {
    const d = Math.max(1, Math.floor(Number(n) || 1)), p = Math.max(0, Number(a) || 0), h = Date.now();
    let g = null;
    for (let S = 0; S < d; S += 1) {
      const l = Date.now() - h, f = p > 0 ? p - l : 0;
      if (p > 0 && f <= 0) break;
      try {
        const v = await this.fetch("/healthz", {
          method: "GET",
          signal: c,
          timeoutMs: p > 0 ? Math.min(i, f) : i
        });
        if (v != null && v.ok) return v;
        g = new Vs(
          `Synapse hosted service returned ${(v == null ? void 0 : v.status) || "an unexpected status"} while preparing your analysis.`
        );
      } catch (v) {
        g = v;
      }
      if (S < d - 1 && o > 0) {
        const v = p > 0 ? p - (Date.now() - h) : o;
        if (p > 0 && v <= 0) break;
        await new Promise((w) => Ln().setTimeout(w, Math.min(o, v)));
      }
    }
    throw g || new Vs(this.connectionMessage());
  }
  isRetryableResponse(n) {
    return [502, 503, 504].includes(Number(n == null ? void 0 : n.status));
  }
  async fetchWithRetry(n, o = {}, { attempts: i = 3, retryDelayMs: a = 3e3 } = {}) {
    const c = Math.max(1, Math.floor(Number(i) || 1));
    let d = null;
    for (let p = 0; p < c; p += 1) {
      if (d = await this.fetch(n, o), !this.isRetryableResponse(d) || p === c - 1) return d;
      a > 0 && await new Promise((h) => Ln().setTimeout(h, a));
    }
    return d;
  }
}
var ri = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function pg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Lu = { exports: {} }, fe = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var oh;
function Vx() {
  if (oh) return fe;
  oh = 1;
  var e = Symbol.for("react.element"), n = Symbol.for("react.portal"), o = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), d = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), h = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), S = Symbol.for("react.lazy"), l = Symbol.iterator;
  function f(D) {
    return D === null || typeof D != "object" ? null : (D = l && D[l] || D["@@iterator"], typeof D == "function" ? D : null);
  }
  var v = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, w = Object.assign, k = {};
  function x(D, V, ce) {
    this.props = D, this.context = V, this.refs = k, this.updater = ce || v;
  }
  x.prototype.isReactComponent = {}, x.prototype.setState = function(D, V) {
    if (typeof D != "object" && typeof D != "function" && D != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, D, V, "setState");
  }, x.prototype.forceUpdate = function(D) {
    this.updater.enqueueForceUpdate(this, D, "forceUpdate");
  };
  function A() {
  }
  A.prototype = x.prototype;
  function E(D, V, ce) {
    this.props = D, this.context = V, this.refs = k, this.updater = ce || v;
  }
  var R = E.prototype = new A();
  R.constructor = E, w(R, x.prototype), R.isPureReactComponent = !0;
  var N = Array.isArray, O = Object.prototype.hasOwnProperty, U = { current: null }, K = { key: !0, ref: !0, __self: !0, __source: !0 };
  function G(D, V, ce) {
    var pe, he = {}, ye = null, Ae = null;
    if (V != null) for (pe in V.ref !== void 0 && (Ae = V.ref), V.key !== void 0 && (ye = "" + V.key), V) O.call(V, pe) && !K.hasOwnProperty(pe) && (he[pe] = V[pe]);
    var we = arguments.length - 2;
    if (we === 1) he.children = ce;
    else if (1 < we) {
      for (var Me = Array(we), ht = 0; ht < we; ht++) Me[ht] = arguments[ht + 2];
      he.children = Me;
    }
    if (D && D.defaultProps) for (pe in we = D.defaultProps, we) he[pe] === void 0 && (he[pe] = we[pe]);
    return { $$typeof: e, type: D, key: ye, ref: Ae, props: he, _owner: U.current };
  }
  function L(D, V) {
    return { $$typeof: e, type: D.type, key: V, ref: D.ref, props: D.props, _owner: D._owner };
  }
  function X(D) {
    return typeof D == "object" && D !== null && D.$$typeof === e;
  }
  function ae(D) {
    var V = { "=": "=0", ":": "=2" };
    return "$" + D.replace(/[=:]/g, function(ce) {
      return V[ce];
    });
  }
  var q = /\/+/g;
  function de(D, V) {
    return typeof D == "object" && D !== null && D.key != null ? ae("" + D.key) : V.toString(36);
  }
  function ue(D, V, ce, pe, he) {
    var ye = typeof D;
    (ye === "undefined" || ye === "boolean") && (D = null);
    var Ae = !1;
    if (D === null) Ae = !0;
    else switch (ye) {
      case "string":
      case "number":
        Ae = !0;
        break;
      case "object":
        switch (D.$$typeof) {
          case e:
          case n:
            Ae = !0;
        }
    }
    if (Ae) return Ae = D, he = he(Ae), D = pe === "" ? "." + de(Ae, 0) : pe, N(he) ? (ce = "", D != null && (ce = D.replace(q, "$&/") + "/"), ue(he, V, ce, "", function(ht) {
      return ht;
    })) : he != null && (X(he) && (he = L(he, ce + (!he.key || Ae && Ae.key === he.key ? "" : ("" + he.key).replace(q, "$&/") + "/") + D)), V.push(he)), 1;
    if (Ae = 0, pe = pe === "" ? "." : pe + ":", N(D)) for (var we = 0; we < D.length; we++) {
      ye = D[we];
      var Me = pe + de(ye, we);
      Ae += ue(ye, V, ce, Me, he);
    }
    else if (Me = f(D), typeof Me == "function") for (D = Me.call(D), we = 0; !(ye = D.next()).done; ) ye = ye.value, Me = pe + de(ye, we++), Ae += ue(ye, V, ce, Me, he);
    else if (ye === "object") throw V = String(D), Error("Objects are not valid as a React child (found: " + (V === "[object Object]" ? "object with keys {" + Object.keys(D).join(", ") + "}" : V) + "). If you meant to render a collection of children, use an array instead.");
    return Ae;
  }
  function _e(D, V, ce) {
    if (D == null) return D;
    var pe = [], he = 0;
    return ue(D, pe, "", "", function(ye) {
      return V.call(ce, ye, he++);
    }), pe;
  }
  function ve(D) {
    if (D._status === -1) {
      var V = D._result;
      V = V(), V.then(function(ce) {
        (D._status === 0 || D._status === -1) && (D._status = 1, D._result = ce);
      }, function(ce) {
        (D._status === 0 || D._status === -1) && (D._status = 2, D._result = ce);
      }), D._status === -1 && (D._status = 0, D._result = V);
    }
    if (D._status === 1) return D._result.default;
    throw D._result;
  }
  var Se = { current: null }, $ = { transition: null }, Z = { ReactCurrentDispatcher: Se, ReactCurrentBatchConfig: $, ReactCurrentOwner: U };
  function Y() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return fe.Children = { map: _e, forEach: function(D, V, ce) {
    _e(D, function() {
      V.apply(this, arguments);
    }, ce);
  }, count: function(D) {
    var V = 0;
    return _e(D, function() {
      V++;
    }), V;
  }, toArray: function(D) {
    return _e(D, function(V) {
      return V;
    }) || [];
  }, only: function(D) {
    if (!X(D)) throw Error("React.Children.only expected to receive a single React element child.");
    return D;
  } }, fe.Component = x, fe.Fragment = o, fe.Profiler = a, fe.PureComponent = E, fe.StrictMode = i, fe.Suspense = h, fe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Z, fe.act = Y, fe.cloneElement = function(D, V, ce) {
    if (D == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + D + ".");
    var pe = w({}, D.props), he = D.key, ye = D.ref, Ae = D._owner;
    if (V != null) {
      if (V.ref !== void 0 && (ye = V.ref, Ae = U.current), V.key !== void 0 && (he = "" + V.key), D.type && D.type.defaultProps) var we = D.type.defaultProps;
      for (Me in V) O.call(V, Me) && !K.hasOwnProperty(Me) && (pe[Me] = V[Me] === void 0 && we !== void 0 ? we[Me] : V[Me]);
    }
    var Me = arguments.length - 2;
    if (Me === 1) pe.children = ce;
    else if (1 < Me) {
      we = Array(Me);
      for (var ht = 0; ht < Me; ht++) we[ht] = arguments[ht + 2];
      pe.children = we;
    }
    return { $$typeof: e, type: D.type, key: he, ref: ye, props: pe, _owner: Ae };
  }, fe.createContext = function(D) {
    return D = { $$typeof: d, _currentValue: D, _currentValue2: D, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, D.Provider = { $$typeof: c, _context: D }, D.Consumer = D;
  }, fe.createElement = G, fe.createFactory = function(D) {
    var V = G.bind(null, D);
    return V.type = D, V;
  }, fe.createRef = function() {
    return { current: null };
  }, fe.forwardRef = function(D) {
    return { $$typeof: p, render: D };
  }, fe.isValidElement = X, fe.lazy = function(D) {
    return { $$typeof: S, _payload: { _status: -1, _result: D }, _init: ve };
  }, fe.memo = function(D, V) {
    return { $$typeof: g, type: D, compare: V === void 0 ? null : V };
  }, fe.startTransition = function(D) {
    var V = $.transition;
    $.transition = {};
    try {
      D();
    } finally {
      $.transition = V;
    }
  }, fe.unstable_act = Y, fe.useCallback = function(D, V) {
    return Se.current.useCallback(D, V);
  }, fe.useContext = function(D) {
    return Se.current.useContext(D);
  }, fe.useDebugValue = function() {
  }, fe.useDeferredValue = function(D) {
    return Se.current.useDeferredValue(D);
  }, fe.useEffect = function(D, V) {
    return Se.current.useEffect(D, V);
  }, fe.useId = function() {
    return Se.current.useId();
  }, fe.useImperativeHandle = function(D, V, ce) {
    return Se.current.useImperativeHandle(D, V, ce);
  }, fe.useInsertionEffect = function(D, V) {
    return Se.current.useInsertionEffect(D, V);
  }, fe.useLayoutEffect = function(D, V) {
    return Se.current.useLayoutEffect(D, V);
  }, fe.useMemo = function(D, V) {
    return Se.current.useMemo(D, V);
  }, fe.useReducer = function(D, V, ce) {
    return Se.current.useReducer(D, V, ce);
  }, fe.useRef = function(D) {
    return Se.current.useRef(D);
  }, fe.useState = function(D) {
    return Se.current.useState(D);
  }, fe.useSyncExternalStore = function(D, V, ce) {
    return Se.current.useSyncExternalStore(D, V, ce);
  }, fe.useTransition = function() {
    return Se.current.useTransition();
  }, fe.version = "18.3.1", fe;
}
var ih;
function cd() {
  return ih || (ih = 1, Lu.exports = Vx()), Lu.exports;
}
var C = cd();
const pn = /* @__PURE__ */ pg(C), Tr = /* @__PURE__ */ Nx({
  __proto__: null,
  default: pn
}, [C]);
var Bs = {}, Vu = { exports: {} }, pt = {}, Bu = { exports: {} }, zu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var sh;
function Bx() {
  return sh || (sh = 1, (function(e) {
    function n($, Z) {
      var Y = $.length;
      $.push(Z);
      e: for (; 0 < Y; ) {
        var D = Y - 1 >>> 1, V = $[D];
        if (0 < a(V, Z)) $[D] = Z, $[Y] = V, Y = D;
        else break e;
      }
    }
    function o($) {
      return $.length === 0 ? null : $[0];
    }
    function i($) {
      if ($.length === 0) return null;
      var Z = $[0], Y = $.pop();
      if (Y !== Z) {
        $[0] = Y;
        e: for (var D = 0, V = $.length, ce = V >>> 1; D < ce; ) {
          var pe = 2 * (D + 1) - 1, he = $[pe], ye = pe + 1, Ae = $[ye];
          if (0 > a(he, Y)) ye < V && 0 > a(Ae, he) ? ($[D] = Ae, $[ye] = Y, D = ye) : ($[D] = he, $[pe] = Y, D = pe);
          else if (ye < V && 0 > a(Ae, Y)) $[D] = Ae, $[ye] = Y, D = ye;
          else break e;
        }
      }
      return Z;
    }
    function a($, Z) {
      var Y = $.sortIndex - Z.sortIndex;
      return Y !== 0 ? Y : $.id - Z.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var c = performance;
      e.unstable_now = function() {
        return c.now();
      };
    } else {
      var d = Date, p = d.now();
      e.unstable_now = function() {
        return d.now() - p;
      };
    }
    var h = [], g = [], S = 1, l = null, f = 3, v = !1, w = !1, k = !1, x = typeof setTimeout == "function" ? setTimeout : null, A = typeof clearTimeout == "function" ? clearTimeout : null, E = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function R($) {
      for (var Z = o(g); Z !== null; ) {
        if (Z.callback === null) i(g);
        else if (Z.startTime <= $) i(g), Z.sortIndex = Z.expirationTime, n(h, Z);
        else break;
        Z = o(g);
      }
    }
    function N($) {
      if (k = !1, R($), !w) if (o(h) !== null) w = !0, ve(O);
      else {
        var Z = o(g);
        Z !== null && Se(N, Z.startTime - $);
      }
    }
    function O($, Z) {
      w = !1, k && (k = !1, A(G), G = -1), v = !0;
      var Y = f;
      try {
        for (R(Z), l = o(h); l !== null && (!(l.expirationTime > Z) || $ && !ae()); ) {
          var D = l.callback;
          if (typeof D == "function") {
            l.callback = null, f = l.priorityLevel;
            var V = D(l.expirationTime <= Z);
            Z = e.unstable_now(), typeof V == "function" ? l.callback = V : l === o(h) && i(h), R(Z);
          } else i(h);
          l = o(h);
        }
        if (l !== null) var ce = !0;
        else {
          var pe = o(g);
          pe !== null && Se(N, pe.startTime - Z), ce = !1;
        }
        return ce;
      } finally {
        l = null, f = Y, v = !1;
      }
    }
    var U = !1, K = null, G = -1, L = 5, X = -1;
    function ae() {
      return !(e.unstable_now() - X < L);
    }
    function q() {
      if (K !== null) {
        var $ = e.unstable_now();
        X = $;
        var Z = !0;
        try {
          Z = K(!0, $);
        } finally {
          Z ? de() : (U = !1, K = null);
        }
      } else U = !1;
    }
    var de;
    if (typeof E == "function") de = function() {
      E(q);
    };
    else if (typeof MessageChannel < "u") {
      var ue = new MessageChannel(), _e = ue.port2;
      ue.port1.onmessage = q, de = function() {
        _e.postMessage(null);
      };
    } else de = function() {
      x(q, 0);
    };
    function ve($) {
      K = $, U || (U = !0, de());
    }
    function Se($, Z) {
      G = x(function() {
        $(e.unstable_now());
      }, Z);
    }
    e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function($) {
      $.callback = null;
    }, e.unstable_continueExecution = function() {
      w || v || (w = !0, ve(O));
    }, e.unstable_forceFrameRate = function($) {
      0 > $ || 125 < $ ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : L = 0 < $ ? Math.floor(1e3 / $) : 5;
    }, e.unstable_getCurrentPriorityLevel = function() {
      return f;
    }, e.unstable_getFirstCallbackNode = function() {
      return o(h);
    }, e.unstable_next = function($) {
      switch (f) {
        case 1:
        case 2:
        case 3:
          var Z = 3;
          break;
        default:
          Z = f;
      }
      var Y = f;
      f = Z;
      try {
        return $();
      } finally {
        f = Y;
      }
    }, e.unstable_pauseExecution = function() {
    }, e.unstable_requestPaint = function() {
    }, e.unstable_runWithPriority = function($, Z) {
      switch ($) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          $ = 3;
      }
      var Y = f;
      f = $;
      try {
        return Z();
      } finally {
        f = Y;
      }
    }, e.unstable_scheduleCallback = function($, Z, Y) {
      var D = e.unstable_now();
      switch (typeof Y == "object" && Y !== null ? (Y = Y.delay, Y = typeof Y == "number" && 0 < Y ? D + Y : D) : Y = D, $) {
        case 1:
          var V = -1;
          break;
        case 2:
          V = 250;
          break;
        case 5:
          V = 1073741823;
          break;
        case 4:
          V = 1e4;
          break;
        default:
          V = 5e3;
      }
      return V = Y + V, $ = { id: S++, callback: Z, priorityLevel: $, startTime: Y, expirationTime: V, sortIndex: -1 }, Y > D ? ($.sortIndex = Y, n(g, $), o(h) === null && $ === o(g) && (k ? (A(G), G = -1) : k = !0, Se(N, Y - D))) : ($.sortIndex = V, n(h, $), w || v || (w = !0, ve(O))), $;
    }, e.unstable_shouldYield = ae, e.unstable_wrapCallback = function($) {
      var Z = f;
      return function() {
        var Y = f;
        f = Z;
        try {
          return $.apply(this, arguments);
        } finally {
          f = Y;
        }
      };
    };
  })(zu)), zu;
}
var ah;
function zx() {
  return ah || (ah = 1, Bu.exports = Bx()), Bu.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lh;
function $x() {
  if (lh) return pt;
  lh = 1;
  var e = cd(), n = zx();
  function o(t) {
    for (var r = "https://reactjs.org/docs/error-decoder.html?invariant=" + t, s = 1; s < arguments.length; s++) r += "&args[]=" + encodeURIComponent(arguments[s]);
    return "Minified React error #" + t + "; visit " + r + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var i = /* @__PURE__ */ new Set(), a = {};
  function c(t, r) {
    d(t, r), d(t + "Capture", r);
  }
  function d(t, r) {
    for (a[t] = r, t = 0; t < r.length; t++) i.add(r[t]);
  }
  var p = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), h = Object.prototype.hasOwnProperty, g = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, S = {}, l = {};
  function f(t) {
    return h.call(l, t) ? !0 : h.call(S, t) ? !1 : g.test(t) ? l[t] = !0 : (S[t] = !0, !1);
  }
  function v(t, r, s, u) {
    if (s !== null && s.type === 0) return !1;
    switch (typeof r) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return u ? !1 : s !== null ? !s.acceptsBooleans : (t = t.toLowerCase().slice(0, 5), t !== "data-" && t !== "aria-");
      default:
        return !1;
    }
  }
  function w(t, r, s, u) {
    if (r === null || typeof r > "u" || v(t, r, s, u)) return !0;
    if (u) return !1;
    if (s !== null) switch (s.type) {
      case 3:
        return !r;
      case 4:
        return r === !1;
      case 5:
        return isNaN(r);
      case 6:
        return isNaN(r) || 1 > r;
    }
    return !1;
  }
  function k(t, r, s, u, m, y, _) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = u, this.attributeNamespace = m, this.mustUseProperty = s, this.propertyName = t, this.type = r, this.sanitizeURL = y, this.removeEmptyString = _;
  }
  var x = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t) {
    x[t] = new k(t, 0, !1, t, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(t) {
    var r = t[0];
    x[r] = new k(r, 1, !1, t[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(t) {
    x[t] = new k(t, 2, !1, t.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(t) {
    x[t] = new k(t, 2, !1, t, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t) {
    x[t] = new k(t, 3, !1, t.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(t) {
    x[t] = new k(t, 3, !0, t, null, !1, !1);
  }), ["capture", "download"].forEach(function(t) {
    x[t] = new k(t, 4, !1, t, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(t) {
    x[t] = new k(t, 6, !1, t, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(t) {
    x[t] = new k(t, 5, !1, t.toLowerCase(), null, !1, !1);
  });
  var A = /[\-:]([a-z])/g;
  function E(t) {
    return t[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t) {
    var r = t.replace(
      A,
      E
    );
    x[r] = new k(r, 1, !1, t, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t) {
    var r = t.replace(A, E);
    x[r] = new k(r, 1, !1, t, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(t) {
    var r = t.replace(A, E);
    x[r] = new k(r, 1, !1, t, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(t) {
    x[t] = new k(t, 1, !1, t.toLowerCase(), null, !1, !1);
  }), x.xlinkHref = new k("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(t) {
    x[t] = new k(t, 1, !1, t.toLowerCase(), null, !0, !0);
  });
  function R(t, r, s, u) {
    var m = x.hasOwnProperty(r) ? x[r] : null;
    (m !== null ? m.type !== 0 : u || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (w(r, s, m, u) && (s = null), u || m === null ? f(r) && (s === null ? t.removeAttribute(r) : t.setAttribute(r, "" + s)) : m.mustUseProperty ? t[m.propertyName] = s === null ? m.type === 3 ? !1 : "" : s : (r = m.attributeName, u = m.attributeNamespace, s === null ? t.removeAttribute(r) : (m = m.type, s = m === 3 || m === 4 && s === !0 ? "" : "" + s, u ? t.setAttributeNS(u, r, s) : t.setAttribute(r, s))));
  }
  var N = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, O = Symbol.for("react.element"), U = Symbol.for("react.portal"), K = Symbol.for("react.fragment"), G = Symbol.for("react.strict_mode"), L = Symbol.for("react.profiler"), X = Symbol.for("react.provider"), ae = Symbol.for("react.context"), q = Symbol.for("react.forward_ref"), de = Symbol.for("react.suspense"), ue = Symbol.for("react.suspense_list"), _e = Symbol.for("react.memo"), ve = Symbol.for("react.lazy"), Se = Symbol.for("react.offscreen"), $ = Symbol.iterator;
  function Z(t) {
    return t === null || typeof t != "object" ? null : (t = $ && t[$] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var Y = Object.assign, D;
  function V(t) {
    if (D === void 0) try {
      throw Error();
    } catch (s) {
      var r = s.stack.trim().match(/\n( *(at )?)/);
      D = r && r[1] || "";
    }
    return `
` + D + t;
  }
  var ce = !1;
  function pe(t, r) {
    if (!t || ce) return "";
    ce = !0;
    var s = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (r) if (r = function() {
        throw Error();
      }, Object.defineProperty(r.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(r, []);
        } catch (F) {
          var u = F;
        }
        Reflect.construct(t, [], r);
      } else {
        try {
          r.call();
        } catch (F) {
          u = F;
        }
        t.call(r.prototype);
      }
      else {
        try {
          throw Error();
        } catch (F) {
          u = F;
        }
        t();
      }
    } catch (F) {
      if (F && u && typeof F.stack == "string") {
        for (var m = F.stack.split(`
`), y = u.stack.split(`
`), _ = m.length - 1, P = y.length - 1; 1 <= _ && 0 <= P && m[_] !== y[P]; ) P--;
        for (; 1 <= _ && 0 <= P; _--, P--) if (m[_] !== y[P]) {
          if (_ !== 1 || P !== 1)
            do
              if (_--, P--, 0 > P || m[_] !== y[P]) {
                var b = `
` + m[_].replace(" at new ", " at ");
                return t.displayName && b.includes("<anonymous>") && (b = b.replace("<anonymous>", t.displayName)), b;
              }
            while (1 <= _ && 0 <= P);
          break;
        }
      }
    } finally {
      ce = !1, Error.prepareStackTrace = s;
    }
    return (t = t ? t.displayName || t.name : "") ? V(t) : "";
  }
  function he(t) {
    switch (t.tag) {
      case 5:
        return V(t.type);
      case 16:
        return V("Lazy");
      case 13:
        return V("Suspense");
      case 19:
        return V("SuspenseList");
      case 0:
      case 2:
      case 15:
        return t = pe(t.type, !1), t;
      case 11:
        return t = pe(t.type.render, !1), t;
      case 1:
        return t = pe(t.type, !0), t;
      default:
        return "";
    }
  }
  function ye(t) {
    if (t == null) return null;
    if (typeof t == "function") return t.displayName || t.name || null;
    if (typeof t == "string") return t;
    switch (t) {
      case K:
        return "Fragment";
      case U:
        return "Portal";
      case L:
        return "Profiler";
      case G:
        return "StrictMode";
      case de:
        return "Suspense";
      case ue:
        return "SuspenseList";
    }
    if (typeof t == "object") switch (t.$$typeof) {
      case ae:
        return (t.displayName || "Context") + ".Consumer";
      case X:
        return (t._context.displayName || "Context") + ".Provider";
      case q:
        var r = t.render;
        return t = t.displayName, t || (t = r.displayName || r.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
      case _e:
        return r = t.displayName || null, r !== null ? r : ye(t.type) || "Memo";
      case ve:
        r = t._payload, t = t._init;
        try {
          return ye(t(r));
        } catch {
        }
    }
    return null;
  }
  function Ae(t) {
    var r = t.type;
    switch (t.tag) {
      case 24:
        return "Cache";
      case 9:
        return (r.displayName || "Context") + ".Consumer";
      case 10:
        return (r._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return t = r.render, t = t.displayName || t.name || "", r.displayName || (t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return r;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return ye(r);
      case 8:
        return r === G ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof r == "function") return r.displayName || r.name || null;
        if (typeof r == "string") return r;
    }
    return null;
  }
  function we(t) {
    switch (typeof t) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return t;
      case "object":
        return t;
      default:
        return "";
    }
  }
  function Me(t) {
    var r = t.type;
    return (t = t.nodeName) && t.toLowerCase() === "input" && (r === "checkbox" || r === "radio");
  }
  function ht(t) {
    var r = Me(t) ? "checked" : "value", s = Object.getOwnPropertyDescriptor(t.constructor.prototype, r), u = "" + t[r];
    if (!t.hasOwnProperty(r) && typeof s < "u" && typeof s.get == "function" && typeof s.set == "function") {
      var m = s.get, y = s.set;
      return Object.defineProperty(t, r, { configurable: !0, get: function() {
        return m.call(this);
      }, set: function(_) {
        u = "" + _, y.call(this, _);
      } }), Object.defineProperty(t, r, { enumerable: s.enumerable }), { getValue: function() {
        return u;
      }, setValue: function(_) {
        u = "" + _;
      }, stopTracking: function() {
        t._valueTracker = null, delete t[r];
      } };
    }
  }
  function bi(t) {
    t._valueTracker || (t._valueTracker = ht(t));
  }
  function af(t) {
    if (!t) return !1;
    var r = t._valueTracker;
    if (!r) return !0;
    var s = r.getValue(), u = "";
    return t && (u = Me(t) ? t.checked ? "true" : "false" : t.value), t = u, t !== s ? (r.setValue(t), !0) : !1;
  }
  function Mi(t) {
    if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u") return null;
    try {
      return t.activeElement || t.body;
    } catch {
      return t.body;
    }
  }
  function Wa(t, r) {
    var s = r.checked;
    return Y({}, r, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: s ?? t._wrapperState.initialChecked });
  }
  function lf(t, r) {
    var s = r.defaultValue == null ? "" : r.defaultValue, u = r.checked != null ? r.checked : r.defaultChecked;
    s = we(r.value != null ? r.value : s), t._wrapperState = { initialChecked: u, initialValue: s, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function uf(t, r) {
    r = r.checked, r != null && R(t, "checked", r, !1);
  }
  function Ga(t, r) {
    uf(t, r);
    var s = we(r.value), u = r.type;
    if (s != null) u === "number" ? (s === 0 && t.value === "" || t.value != s) && (t.value = "" + s) : t.value !== "" + s && (t.value = "" + s);
    else if (u === "submit" || u === "reset") {
      t.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? Ka(t, r.type, s) : r.hasOwnProperty("defaultValue") && Ka(t, r.type, we(r.defaultValue)), r.checked == null && r.defaultChecked != null && (t.defaultChecked = !!r.defaultChecked);
  }
  function cf(t, r, s) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var u = r.type;
      if (!(u !== "submit" && u !== "reset" || r.value !== void 0 && r.value !== null)) return;
      r = "" + t._wrapperState.initialValue, s || r === t.value || (t.value = r), t.defaultValue = r;
    }
    s = t.name, s !== "" && (t.name = ""), t.defaultChecked = !!t._wrapperState.initialChecked, s !== "" && (t.name = s);
  }
  function Ka(t, r, s) {
    (r !== "number" || Mi(t.ownerDocument) !== t) && (s == null ? t.defaultValue = "" + t._wrapperState.initialValue : t.defaultValue !== "" + s && (t.defaultValue = "" + s));
  }
  var vo = Array.isArray;
  function Ar(t, r, s, u) {
    if (t = t.options, r) {
      r = {};
      for (var m = 0; m < s.length; m++) r["$" + s[m]] = !0;
      for (s = 0; s < t.length; s++) m = r.hasOwnProperty("$" + t[s].value), t[s].selected !== m && (t[s].selected = m), m && u && (t[s].defaultSelected = !0);
    } else {
      for (s = "" + we(s), r = null, m = 0; m < t.length; m++) {
        if (t[m].value === s) {
          t[m].selected = !0, u && (t[m].defaultSelected = !0);
          return;
        }
        r !== null || t[m].disabled || (r = t[m]);
      }
      r !== null && (r.selected = !0);
    }
  }
  function Ya(t, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(o(91));
    return Y({}, r, { value: void 0, defaultValue: void 0, children: "" + t._wrapperState.initialValue });
  }
  function df(t, r) {
    var s = r.value;
    if (s == null) {
      if (s = r.children, r = r.defaultValue, s != null) {
        if (r != null) throw Error(o(92));
        if (vo(s)) {
          if (1 < s.length) throw Error(o(93));
          s = s[0];
        }
        r = s;
      }
      r == null && (r = ""), s = r;
    }
    t._wrapperState = { initialValue: we(s) };
  }
  function ff(t, r) {
    var s = we(r.value), u = we(r.defaultValue);
    s != null && (s = "" + s, s !== t.value && (t.value = s), r.defaultValue == null && t.defaultValue !== s && (t.defaultValue = s)), u != null && (t.defaultValue = "" + u);
  }
  function pf(t) {
    var r = t.textContent;
    r === t._wrapperState.initialValue && r !== "" && r !== null && (t.value = r);
  }
  function mf(t) {
    switch (t) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Qa(t, r) {
    return t == null || t === "http://www.w3.org/1999/xhtml" ? mf(r) : t === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : t;
  }
  var Ri, hf = (function(t) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, s, u, m) {
      MSApp.execUnsafeLocalFunction(function() {
        return t(r, s, u, m);
      });
    } : t;
  })(function(t, r) {
    if (t.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in t) t.innerHTML = r;
    else {
      for (Ri = Ri || document.createElement("div"), Ri.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>", r = Ri.firstChild; t.firstChild; ) t.removeChild(t.firstChild);
      for (; r.firstChild; ) t.appendChild(r.firstChild);
    }
  });
  function So(t, r) {
    if (r) {
      var s = t.firstChild;
      if (s && s === t.lastChild && s.nodeType === 3) {
        s.nodeValue = r;
        return;
      }
    }
    t.textContent = r;
  }
  var wo = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  }, OS = ["Webkit", "ms", "Moz", "O"];
  Object.keys(wo).forEach(function(t) {
    OS.forEach(function(r) {
      r = r + t.charAt(0).toUpperCase() + t.substring(1), wo[r] = wo[t];
    });
  });
  function yf(t, r, s) {
    return r == null || typeof r == "boolean" || r === "" ? "" : s || typeof r != "number" || r === 0 || wo.hasOwnProperty(t) && wo[t] ? ("" + r).trim() : r + "px";
  }
  function gf(t, r) {
    t = t.style;
    for (var s in r) if (r.hasOwnProperty(s)) {
      var u = s.indexOf("--") === 0, m = yf(s, r[s], u);
      s === "float" && (s = "cssFloat"), u ? t.setProperty(s, m) : t[s] = m;
    }
  }
  var LS = Y({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Xa(t, r) {
    if (r) {
      if (LS[t] && (r.children != null || r.dangerouslySetInnerHTML != null)) throw Error(o(137, t));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null) throw Error(o(60));
        if (typeof r.dangerouslySetInnerHTML != "object" || !("__html" in r.dangerouslySetInnerHTML)) throw Error(o(61));
      }
      if (r.style != null && typeof r.style != "object") throw Error(o(62));
    }
  }
  function Za(t, r) {
    if (t.indexOf("-") === -1) return typeof r.is == "string";
    switch (t) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Ja = null;
  function qa(t) {
    return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
  }
  var el = null, Cr = null, Pr = null;
  function vf(t) {
    if (t = $o(t)) {
      if (typeof el != "function") throw Error(o(280));
      var r = t.stateNode;
      r && (r = es(r), el(t.stateNode, t.type, r));
    }
  }
  function Sf(t) {
    Cr ? Pr ? Pr.push(t) : Pr = [t] : Cr = t;
  }
  function wf() {
    if (Cr) {
      var t = Cr, r = Pr;
      if (Pr = Cr = null, vf(t), r) for (t = 0; t < r.length; t++) vf(r[t]);
    }
  }
  function xf(t, r) {
    return t(r);
  }
  function _f() {
  }
  var tl = !1;
  function Tf(t, r, s) {
    if (tl) return t(r, s);
    tl = !0;
    try {
      return xf(t, r, s);
    } finally {
      tl = !1, (Cr !== null || Pr !== null) && (_f(), wf());
    }
  }
  function xo(t, r) {
    var s = t.stateNode;
    if (s === null) return null;
    var u = es(s);
    if (u === null) return null;
    s = u[r];
    e: switch (r) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (u = !u.disabled) || (t = t.type, u = !(t === "button" || t === "input" || t === "select" || t === "textarea")), t = !u;
        break e;
      default:
        t = !1;
    }
    if (t) return null;
    if (s && typeof s != "function") throw Error(o(231, r, typeof s));
    return s;
  }
  var nl = !1;
  if (p) try {
    var _o = {};
    Object.defineProperty(_o, "passive", { get: function() {
      nl = !0;
    } }), window.addEventListener("test", _o, _o), window.removeEventListener("test", _o, _o);
  } catch {
    nl = !1;
  }
  function VS(t, r, s, u, m, y, _, P, b) {
    var F = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(s, F);
    } catch (z) {
      this.onError(z);
    }
  }
  var To = !1, Di = null, Ni = !1, rl = null, BS = { onError: function(t) {
    To = !0, Di = t;
  } };
  function zS(t, r, s, u, m, y, _, P, b) {
    To = !1, Di = null, VS.apply(BS, arguments);
  }
  function $S(t, r, s, u, m, y, _, P, b) {
    if (zS.apply(this, arguments), To) {
      if (To) {
        var F = Di;
        To = !1, Di = null;
      } else throw Error(o(198));
      Ni || (Ni = !0, rl = F);
    }
  }
  function Qn(t) {
    var r = t, s = t;
    if (t.alternate) for (; r.return; ) r = r.return;
    else {
      t = r;
      do
        r = t, (r.flags & 4098) !== 0 && (s = r.return), t = r.return;
      while (t);
    }
    return r.tag === 3 ? s : null;
  }
  function kf(t) {
    if (t.tag === 13) {
      var r = t.memoizedState;
      if (r === null && (t = t.alternate, t !== null && (r = t.memoizedState)), r !== null) return r.dehydrated;
    }
    return null;
  }
  function Af(t) {
    if (Qn(t) !== t) throw Error(o(188));
  }
  function US(t) {
    var r = t.alternate;
    if (!r) {
      if (r = Qn(t), r === null) throw Error(o(188));
      return r !== t ? null : t;
    }
    for (var s = t, u = r; ; ) {
      var m = s.return;
      if (m === null) break;
      var y = m.alternate;
      if (y === null) {
        if (u = m.return, u !== null) {
          s = u;
          continue;
        }
        break;
      }
      if (m.child === y.child) {
        for (y = m.child; y; ) {
          if (y === s) return Af(m), t;
          if (y === u) return Af(m), r;
          y = y.sibling;
        }
        throw Error(o(188));
      }
      if (s.return !== u.return) s = m, u = y;
      else {
        for (var _ = !1, P = m.child; P; ) {
          if (P === s) {
            _ = !0, s = m, u = y;
            break;
          }
          if (P === u) {
            _ = !0, u = m, s = y;
            break;
          }
          P = P.sibling;
        }
        if (!_) {
          for (P = y.child; P; ) {
            if (P === s) {
              _ = !0, s = y, u = m;
              break;
            }
            if (P === u) {
              _ = !0, u = y, s = m;
              break;
            }
            P = P.sibling;
          }
          if (!_) throw Error(o(189));
        }
      }
      if (s.alternate !== u) throw Error(o(190));
    }
    if (s.tag !== 3) throw Error(o(188));
    return s.stateNode.current === s ? t : r;
  }
  function Cf(t) {
    return t = US(t), t !== null ? Pf(t) : null;
  }
  function Pf(t) {
    if (t.tag === 5 || t.tag === 6) return t;
    for (t = t.child; t !== null; ) {
      var r = Pf(t);
      if (r !== null) return r;
      t = t.sibling;
    }
    return null;
  }
  var Ef = n.unstable_scheduleCallback, bf = n.unstable_cancelCallback, HS = n.unstable_shouldYield, WS = n.unstable_requestPaint, Fe = n.unstable_now, GS = n.unstable_getCurrentPriorityLevel, ol = n.unstable_ImmediatePriority, Mf = n.unstable_UserBlockingPriority, Ii = n.unstable_NormalPriority, KS = n.unstable_LowPriority, Rf = n.unstable_IdlePriority, ji = null, $t = null;
  function YS(t) {
    if ($t && typeof $t.onCommitFiberRoot == "function") try {
      $t.onCommitFiberRoot(ji, t, void 0, (t.current.flags & 128) === 128);
    } catch {
    }
  }
  var Rt = Math.clz32 ? Math.clz32 : ZS, QS = Math.log, XS = Math.LN2;
  function ZS(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (QS(t) / XS | 0) | 0;
  }
  var Fi = 64, Oi = 4194304;
  function ko(t) {
    switch (t & -t) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return t & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return t;
    }
  }
  function Li(t, r) {
    var s = t.pendingLanes;
    if (s === 0) return 0;
    var u = 0, m = t.suspendedLanes, y = t.pingedLanes, _ = s & 268435455;
    if (_ !== 0) {
      var P = _ & ~m;
      P !== 0 ? u = ko(P) : (y &= _, y !== 0 && (u = ko(y)));
    } else _ = s & ~m, _ !== 0 ? u = ko(_) : y !== 0 && (u = ko(y));
    if (u === 0) return 0;
    if (r !== 0 && r !== u && (r & m) === 0 && (m = u & -u, y = r & -r, m >= y || m === 16 && (y & 4194240) !== 0)) return r;
    if ((u & 4) !== 0 && (u |= s & 16), r = t.entangledLanes, r !== 0) for (t = t.entanglements, r &= u; 0 < r; ) s = 31 - Rt(r), m = 1 << s, u |= t[s], r &= ~m;
    return u;
  }
  function JS(t, r) {
    switch (t) {
      case 1:
      case 2:
      case 4:
        return r + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return r + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function qS(t, r) {
    for (var s = t.suspendedLanes, u = t.pingedLanes, m = t.expirationTimes, y = t.pendingLanes; 0 < y; ) {
      var _ = 31 - Rt(y), P = 1 << _, b = m[_];
      b === -1 ? ((P & s) === 0 || (P & u) !== 0) && (m[_] = JS(P, r)) : b <= r && (t.expiredLanes |= P), y &= ~P;
    }
  }
  function il(t) {
    return t = t.pendingLanes & -1073741825, t !== 0 ? t : t & 1073741824 ? 1073741824 : 0;
  }
  function Df() {
    var t = Fi;
    return Fi <<= 1, (Fi & 4194240) === 0 && (Fi = 64), t;
  }
  function sl(t) {
    for (var r = [], s = 0; 31 > s; s++) r.push(t);
    return r;
  }
  function Ao(t, r, s) {
    t.pendingLanes |= r, r !== 536870912 && (t.suspendedLanes = 0, t.pingedLanes = 0), t = t.eventTimes, r = 31 - Rt(r), t[r] = s;
  }
  function ew(t, r) {
    var s = t.pendingLanes & ~r;
    t.pendingLanes = r, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= r, t.mutableReadLanes &= r, t.entangledLanes &= r, r = t.entanglements;
    var u = t.eventTimes;
    for (t = t.expirationTimes; 0 < s; ) {
      var m = 31 - Rt(s), y = 1 << m;
      r[m] = 0, u[m] = -1, t[m] = -1, s &= ~y;
    }
  }
  function al(t, r) {
    var s = t.entangledLanes |= r;
    for (t = t.entanglements; s; ) {
      var u = 31 - Rt(s), m = 1 << u;
      m & r | t[u] & r && (t[u] |= r), s &= ~m;
    }
  }
  var xe = 0;
  function Nf(t) {
    return t &= -t, 1 < t ? 4 < t ? (t & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var If, ll, jf, Ff, Of, ul = !1, Vi = [], yn = null, gn = null, vn = null, Co = /* @__PURE__ */ new Map(), Po = /* @__PURE__ */ new Map(), Sn = [], tw = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function Lf(t, r) {
    switch (t) {
      case "focusin":
      case "focusout":
        yn = null;
        break;
      case "dragenter":
      case "dragleave":
        gn = null;
        break;
      case "mouseover":
      case "mouseout":
        vn = null;
        break;
      case "pointerover":
      case "pointerout":
        Co.delete(r.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Po.delete(r.pointerId);
    }
  }
  function Eo(t, r, s, u, m, y) {
    return t === null || t.nativeEvent !== y ? (t = { blockedOn: r, domEventName: s, eventSystemFlags: u, nativeEvent: y, targetContainers: [m] }, r !== null && (r = $o(r), r !== null && ll(r)), t) : (t.eventSystemFlags |= u, r = t.targetContainers, m !== null && r.indexOf(m) === -1 && r.push(m), t);
  }
  function nw(t, r, s, u, m) {
    switch (r) {
      case "focusin":
        return yn = Eo(yn, t, r, s, u, m), !0;
      case "dragenter":
        return gn = Eo(gn, t, r, s, u, m), !0;
      case "mouseover":
        return vn = Eo(vn, t, r, s, u, m), !0;
      case "pointerover":
        var y = m.pointerId;
        return Co.set(y, Eo(Co.get(y) || null, t, r, s, u, m)), !0;
      case "gotpointercapture":
        return y = m.pointerId, Po.set(y, Eo(Po.get(y) || null, t, r, s, u, m)), !0;
    }
    return !1;
  }
  function Vf(t) {
    var r = Xn(t.target);
    if (r !== null) {
      var s = Qn(r);
      if (s !== null) {
        if (r = s.tag, r === 13) {
          if (r = kf(s), r !== null) {
            t.blockedOn = r, Of(t.priority, function() {
              jf(s);
            });
            return;
          }
        } else if (r === 3 && s.stateNode.current.memoizedState.isDehydrated) {
          t.blockedOn = s.tag === 3 ? s.stateNode.containerInfo : null;
          return;
        }
      }
    }
    t.blockedOn = null;
  }
  function Bi(t) {
    if (t.blockedOn !== null) return !1;
    for (var r = t.targetContainers; 0 < r.length; ) {
      var s = dl(t.domEventName, t.eventSystemFlags, r[0], t.nativeEvent);
      if (s === null) {
        s = t.nativeEvent;
        var u = new s.constructor(s.type, s);
        Ja = u, s.target.dispatchEvent(u), Ja = null;
      } else return r = $o(s), r !== null && ll(r), t.blockedOn = s, !1;
      r.shift();
    }
    return !0;
  }
  function Bf(t, r, s) {
    Bi(t) && s.delete(r);
  }
  function rw() {
    ul = !1, yn !== null && Bi(yn) && (yn = null), gn !== null && Bi(gn) && (gn = null), vn !== null && Bi(vn) && (vn = null), Co.forEach(Bf), Po.forEach(Bf);
  }
  function bo(t, r) {
    t.blockedOn === r && (t.blockedOn = null, ul || (ul = !0, n.unstable_scheduleCallback(n.unstable_NormalPriority, rw)));
  }
  function Mo(t) {
    function r(m) {
      return bo(m, t);
    }
    if (0 < Vi.length) {
      bo(Vi[0], t);
      for (var s = 1; s < Vi.length; s++) {
        var u = Vi[s];
        u.blockedOn === t && (u.blockedOn = null);
      }
    }
    for (yn !== null && bo(yn, t), gn !== null && bo(gn, t), vn !== null && bo(vn, t), Co.forEach(r), Po.forEach(r), s = 0; s < Sn.length; s++) u = Sn[s], u.blockedOn === t && (u.blockedOn = null);
    for (; 0 < Sn.length && (s = Sn[0], s.blockedOn === null); ) Vf(s), s.blockedOn === null && Sn.shift();
  }
  var Er = N.ReactCurrentBatchConfig, zi = !0;
  function ow(t, r, s, u) {
    var m = xe, y = Er.transition;
    Er.transition = null;
    try {
      xe = 1, cl(t, r, s, u);
    } finally {
      xe = m, Er.transition = y;
    }
  }
  function iw(t, r, s, u) {
    var m = xe, y = Er.transition;
    Er.transition = null;
    try {
      xe = 4, cl(t, r, s, u);
    } finally {
      xe = m, Er.transition = y;
    }
  }
  function cl(t, r, s, u) {
    if (zi) {
      var m = dl(t, r, s, u);
      if (m === null) El(t, r, u, $i, s), Lf(t, u);
      else if (nw(m, t, r, s, u)) u.stopPropagation();
      else if (Lf(t, u), r & 4 && -1 < tw.indexOf(t)) {
        for (; m !== null; ) {
          var y = $o(m);
          if (y !== null && If(y), y = dl(t, r, s, u), y === null && El(t, r, u, $i, s), y === m) break;
          m = y;
        }
        m !== null && u.stopPropagation();
      } else El(t, r, u, null, s);
    }
  }
  var $i = null;
  function dl(t, r, s, u) {
    if ($i = null, t = qa(u), t = Xn(t), t !== null) if (r = Qn(t), r === null) t = null;
    else if (s = r.tag, s === 13) {
      if (t = kf(r), t !== null) return t;
      t = null;
    } else if (s === 3) {
      if (r.stateNode.current.memoizedState.isDehydrated) return r.tag === 3 ? r.stateNode.containerInfo : null;
      t = null;
    } else r !== t && (t = null);
    return $i = t, null;
  }
  function zf(t) {
    switch (t) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (GS()) {
          case ol:
            return 1;
          case Mf:
            return 4;
          case Ii:
          case KS:
            return 16;
          case Rf:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var wn = null, fl = null, Ui = null;
  function $f() {
    if (Ui) return Ui;
    var t, r = fl, s = r.length, u, m = "value" in wn ? wn.value : wn.textContent, y = m.length;
    for (t = 0; t < s && r[t] === m[t]; t++) ;
    var _ = s - t;
    for (u = 1; u <= _ && r[s - u] === m[y - u]; u++) ;
    return Ui = m.slice(t, 1 < u ? 1 - u : void 0);
  }
  function Hi(t) {
    var r = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && r === 13 && (t = 13)) : t = r, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function Wi() {
    return !0;
  }
  function Uf() {
    return !1;
  }
  function yt(t) {
    function r(s, u, m, y, _) {
      this._reactName = s, this._targetInst = m, this.type = u, this.nativeEvent = y, this.target = _, this.currentTarget = null;
      for (var P in t) t.hasOwnProperty(P) && (s = t[P], this[P] = s ? s(y) : y[P]);
      return this.isDefaultPrevented = (y.defaultPrevented != null ? y.defaultPrevented : y.returnValue === !1) ? Wi : Uf, this.isPropagationStopped = Uf, this;
    }
    return Y(r.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var s = this.nativeEvent;
      s && (s.preventDefault ? s.preventDefault() : typeof s.returnValue != "unknown" && (s.returnValue = !1), this.isDefaultPrevented = Wi);
    }, stopPropagation: function() {
      var s = this.nativeEvent;
      s && (s.stopPropagation ? s.stopPropagation() : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0), this.isPropagationStopped = Wi);
    }, persist: function() {
    }, isPersistent: Wi }), r;
  }
  var br = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(t) {
    return t.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, pl = yt(br), Ro = Y({}, br, { view: 0, detail: 0 }), sw = yt(Ro), ml, hl, Do, Gi = Y({}, Ro, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: gl, button: 0, buttons: 0, relatedTarget: function(t) {
    return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
  }, movementX: function(t) {
    return "movementX" in t ? t.movementX : (t !== Do && (Do && t.type === "mousemove" ? (ml = t.screenX - Do.screenX, hl = t.screenY - Do.screenY) : hl = ml = 0, Do = t), ml);
  }, movementY: function(t) {
    return "movementY" in t ? t.movementY : hl;
  } }), Hf = yt(Gi), aw = Y({}, Gi, { dataTransfer: 0 }), lw = yt(aw), uw = Y({}, Ro, { relatedTarget: 0 }), yl = yt(uw), cw = Y({}, br, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), dw = yt(cw), fw = Y({}, br, { clipboardData: function(t) {
    return "clipboardData" in t ? t.clipboardData : window.clipboardData;
  } }), pw = yt(fw), mw = Y({}, br, { data: 0 }), Wf = yt(mw), hw = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, yw = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, gw = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function vw(t) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(t) : (t = gw[t]) ? !!r[t] : !1;
  }
  function gl() {
    return vw;
  }
  var Sw = Y({}, Ro, { key: function(t) {
    if (t.key) {
      var r = hw[t.key] || t.key;
      if (r !== "Unidentified") return r;
    }
    return t.type === "keypress" ? (t = Hi(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? yw[t.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: gl, charCode: function(t) {
    return t.type === "keypress" ? Hi(t) : 0;
  }, keyCode: function(t) {
    return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  }, which: function(t) {
    return t.type === "keypress" ? Hi(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  } }), ww = yt(Sw), xw = Y({}, Gi, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Gf = yt(xw), _w = Y({}, Ro, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: gl }), Tw = yt(_w), kw = Y({}, br, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Aw = yt(kw), Cw = Y({}, Gi, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Pw = yt(Cw), Ew = [9, 13, 27, 32], vl = p && "CompositionEvent" in window, No = null;
  p && "documentMode" in document && (No = document.documentMode);
  var bw = p && "TextEvent" in window && !No, Kf = p && (!vl || No && 8 < No && 11 >= No), Yf = " ", Qf = !1;
  function Xf(t, r) {
    switch (t) {
      case "keyup":
        return Ew.indexOf(r.keyCode) !== -1;
      case "keydown":
        return r.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Zf(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var Mr = !1;
  function Mw(t, r) {
    switch (t) {
      case "compositionend":
        return Zf(r);
      case "keypress":
        return r.which !== 32 ? null : (Qf = !0, Yf);
      case "textInput":
        return t = r.data, t === Yf && Qf ? null : t;
      default:
        return null;
    }
  }
  function Rw(t, r) {
    if (Mr) return t === "compositionend" || !vl && Xf(t, r) ? (t = $f(), Ui = fl = wn = null, Mr = !1, t) : null;
    switch (t) {
      case "paste":
        return null;
      case "keypress":
        if (!(r.ctrlKey || r.altKey || r.metaKey) || r.ctrlKey && r.altKey) {
          if (r.char && 1 < r.char.length) return r.char;
          if (r.which) return String.fromCharCode(r.which);
        }
        return null;
      case "compositionend":
        return Kf && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var Dw = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Jf(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r === "input" ? !!Dw[t.type] : r === "textarea";
  }
  function qf(t, r, s, u) {
    Sf(u), r = Zi(r, "onChange"), 0 < r.length && (s = new pl("onChange", "change", null, s, u), t.push({ event: s, listeners: r }));
  }
  var Io = null, jo = null;
  function Nw(t) {
    gp(t, 0);
  }
  function Ki(t) {
    var r = jr(t);
    if (af(r)) return t;
  }
  function Iw(t, r) {
    if (t === "change") return r;
  }
  var ep = !1;
  if (p) {
    var Sl;
    if (p) {
      var wl = "oninput" in document;
      if (!wl) {
        var tp = document.createElement("div");
        tp.setAttribute("oninput", "return;"), wl = typeof tp.oninput == "function";
      }
      Sl = wl;
    } else Sl = !1;
    ep = Sl && (!document.documentMode || 9 < document.documentMode);
  }
  function np() {
    Io && (Io.detachEvent("onpropertychange", rp), jo = Io = null);
  }
  function rp(t) {
    if (t.propertyName === "value" && Ki(jo)) {
      var r = [];
      qf(r, jo, t, qa(t)), Tf(Nw, r);
    }
  }
  function jw(t, r, s) {
    t === "focusin" ? (np(), Io = r, jo = s, Io.attachEvent("onpropertychange", rp)) : t === "focusout" && np();
  }
  function Fw(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown") return Ki(jo);
  }
  function Ow(t, r) {
    if (t === "click") return Ki(r);
  }
  function Lw(t, r) {
    if (t === "input" || t === "change") return Ki(r);
  }
  function Vw(t, r) {
    return t === r && (t !== 0 || 1 / t === 1 / r) || t !== t && r !== r;
  }
  var Dt = typeof Object.is == "function" ? Object.is : Vw;
  function Fo(t, r) {
    if (Dt(t, r)) return !0;
    if (typeof t != "object" || t === null || typeof r != "object" || r === null) return !1;
    var s = Object.keys(t), u = Object.keys(r);
    if (s.length !== u.length) return !1;
    for (u = 0; u < s.length; u++) {
      var m = s[u];
      if (!h.call(r, m) || !Dt(t[m], r[m])) return !1;
    }
    return !0;
  }
  function op(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function ip(t, r) {
    var s = op(t);
    t = 0;
    for (var u; s; ) {
      if (s.nodeType === 3) {
        if (u = t + s.textContent.length, t <= r && u >= r) return { node: s, offset: r - t };
        t = u;
      }
      e: {
        for (; s; ) {
          if (s.nextSibling) {
            s = s.nextSibling;
            break e;
          }
          s = s.parentNode;
        }
        s = void 0;
      }
      s = op(s);
    }
  }
  function sp(t, r) {
    return t && r ? t === r ? !0 : t && t.nodeType === 3 ? !1 : r && r.nodeType === 3 ? sp(t, r.parentNode) : "contains" in t ? t.contains(r) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function ap() {
    for (var t = window, r = Mi(); r instanceof t.HTMLIFrameElement; ) {
      try {
        var s = typeof r.contentWindow.location.href == "string";
      } catch {
        s = !1;
      }
      if (s) t = r.contentWindow;
      else break;
      r = Mi(t.document);
    }
    return r;
  }
  function xl(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r && (r === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || r === "textarea" || t.contentEditable === "true");
  }
  function Bw(t) {
    var r = ap(), s = t.focusedElem, u = t.selectionRange;
    if (r !== s && s && s.ownerDocument && sp(s.ownerDocument.documentElement, s)) {
      if (u !== null && xl(s)) {
        if (r = u.start, t = u.end, t === void 0 && (t = r), "selectionStart" in s) s.selectionStart = r, s.selectionEnd = Math.min(t, s.value.length);
        else if (t = (r = s.ownerDocument || document) && r.defaultView || window, t.getSelection) {
          t = t.getSelection();
          var m = s.textContent.length, y = Math.min(u.start, m);
          u = u.end === void 0 ? y : Math.min(u.end, m), !t.extend && y > u && (m = u, u = y, y = m), m = ip(s, y);
          var _ = ip(
            s,
            u
          );
          m && _ && (t.rangeCount !== 1 || t.anchorNode !== m.node || t.anchorOffset !== m.offset || t.focusNode !== _.node || t.focusOffset !== _.offset) && (r = r.createRange(), r.setStart(m.node, m.offset), t.removeAllRanges(), y > u ? (t.addRange(r), t.extend(_.node, _.offset)) : (r.setEnd(_.node, _.offset), t.addRange(r)));
        }
      }
      for (r = [], t = s; t = t.parentNode; ) t.nodeType === 1 && r.push({ element: t, left: t.scrollLeft, top: t.scrollTop });
      for (typeof s.focus == "function" && s.focus(), s = 0; s < r.length; s++) t = r[s], t.element.scrollLeft = t.left, t.element.scrollTop = t.top;
    }
  }
  var zw = p && "documentMode" in document && 11 >= document.documentMode, Rr = null, _l = null, Oo = null, Tl = !1;
  function lp(t, r, s) {
    var u = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument;
    Tl || Rr == null || Rr !== Mi(u) || (u = Rr, "selectionStart" in u && xl(u) ? u = { start: u.selectionStart, end: u.selectionEnd } : (u = (u.ownerDocument && u.ownerDocument.defaultView || window).getSelection(), u = { anchorNode: u.anchorNode, anchorOffset: u.anchorOffset, focusNode: u.focusNode, focusOffset: u.focusOffset }), Oo && Fo(Oo, u) || (Oo = u, u = Zi(_l, "onSelect"), 0 < u.length && (r = new pl("onSelect", "select", null, r, s), t.push({ event: r, listeners: u }), r.target = Rr)));
  }
  function Yi(t, r) {
    var s = {};
    return s[t.toLowerCase()] = r.toLowerCase(), s["Webkit" + t] = "webkit" + r, s["Moz" + t] = "moz" + r, s;
  }
  var Dr = { animationend: Yi("Animation", "AnimationEnd"), animationiteration: Yi("Animation", "AnimationIteration"), animationstart: Yi("Animation", "AnimationStart"), transitionend: Yi("Transition", "TransitionEnd") }, kl = {}, up = {};
  p && (up = document.createElement("div").style, "AnimationEvent" in window || (delete Dr.animationend.animation, delete Dr.animationiteration.animation, delete Dr.animationstart.animation), "TransitionEvent" in window || delete Dr.transitionend.transition);
  function Qi(t) {
    if (kl[t]) return kl[t];
    if (!Dr[t]) return t;
    var r = Dr[t], s;
    for (s in r) if (r.hasOwnProperty(s) && s in up) return kl[t] = r[s];
    return t;
  }
  var cp = Qi("animationend"), dp = Qi("animationiteration"), fp = Qi("animationstart"), pp = Qi("transitionend"), mp = /* @__PURE__ */ new Map(), hp = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function xn(t, r) {
    mp.set(t, r), c(r, [t]);
  }
  for (var Al = 0; Al < hp.length; Al++) {
    var Cl = hp[Al], $w = Cl.toLowerCase(), Uw = Cl[0].toUpperCase() + Cl.slice(1);
    xn($w, "on" + Uw);
  }
  xn(cp, "onAnimationEnd"), xn(dp, "onAnimationIteration"), xn(fp, "onAnimationStart"), xn("dblclick", "onDoubleClick"), xn("focusin", "onFocus"), xn("focusout", "onBlur"), xn(pp, "onTransitionEnd"), d("onMouseEnter", ["mouseout", "mouseover"]), d("onMouseLeave", ["mouseout", "mouseover"]), d("onPointerEnter", ["pointerout", "pointerover"]), d("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Lo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Hw = new Set("cancel close invalid load scroll toggle".split(" ").concat(Lo));
  function yp(t, r, s) {
    var u = t.type || "unknown-event";
    t.currentTarget = s, $S(u, r, void 0, t), t.currentTarget = null;
  }
  function gp(t, r) {
    r = (r & 4) !== 0;
    for (var s = 0; s < t.length; s++) {
      var u = t[s], m = u.event;
      u = u.listeners;
      e: {
        var y = void 0;
        if (r) for (var _ = u.length - 1; 0 <= _; _--) {
          var P = u[_], b = P.instance, F = P.currentTarget;
          if (P = P.listener, b !== y && m.isPropagationStopped()) break e;
          yp(m, P, F), y = b;
        }
        else for (_ = 0; _ < u.length; _++) {
          if (P = u[_], b = P.instance, F = P.currentTarget, P = P.listener, b !== y && m.isPropagationStopped()) break e;
          yp(m, P, F), y = b;
        }
      }
    }
    if (Ni) throw t = rl, Ni = !1, rl = null, t;
  }
  function Pe(t, r) {
    var s = r[Il];
    s === void 0 && (s = r[Il] = /* @__PURE__ */ new Set());
    var u = t + "__bubble";
    s.has(u) || (vp(r, t, 2, !1), s.add(u));
  }
  function Pl(t, r, s) {
    var u = 0;
    r && (u |= 4), vp(s, t, u, r);
  }
  var Xi = "_reactListening" + Math.random().toString(36).slice(2);
  function Vo(t) {
    if (!t[Xi]) {
      t[Xi] = !0, i.forEach(function(s) {
        s !== "selectionchange" && (Hw.has(s) || Pl(s, !1, t), Pl(s, !0, t));
      });
      var r = t.nodeType === 9 ? t : t.ownerDocument;
      r === null || r[Xi] || (r[Xi] = !0, Pl("selectionchange", !1, r));
    }
  }
  function vp(t, r, s, u) {
    switch (zf(r)) {
      case 1:
        var m = ow;
        break;
      case 4:
        m = iw;
        break;
      default:
        m = cl;
    }
    s = m.bind(null, r, s, t), m = void 0, !nl || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (m = !0), u ? m !== void 0 ? t.addEventListener(r, s, { capture: !0, passive: m }) : t.addEventListener(r, s, !0) : m !== void 0 ? t.addEventListener(r, s, { passive: m }) : t.addEventListener(r, s, !1);
  }
  function El(t, r, s, u, m) {
    var y = u;
    if ((r & 1) === 0 && (r & 2) === 0 && u !== null) e: for (; ; ) {
      if (u === null) return;
      var _ = u.tag;
      if (_ === 3 || _ === 4) {
        var P = u.stateNode.containerInfo;
        if (P === m || P.nodeType === 8 && P.parentNode === m) break;
        if (_ === 4) for (_ = u.return; _ !== null; ) {
          var b = _.tag;
          if ((b === 3 || b === 4) && (b = _.stateNode.containerInfo, b === m || b.nodeType === 8 && b.parentNode === m)) return;
          _ = _.return;
        }
        for (; P !== null; ) {
          if (_ = Xn(P), _ === null) return;
          if (b = _.tag, b === 5 || b === 6) {
            u = y = _;
            continue e;
          }
          P = P.parentNode;
        }
      }
      u = u.return;
    }
    Tf(function() {
      var F = y, z = qa(s), H = [];
      e: {
        var B = mp.get(t);
        if (B !== void 0) {
          var J = pl, te = t;
          switch (t) {
            case "keypress":
              if (Hi(s) === 0) break e;
            case "keydown":
            case "keyup":
              J = ww;
              break;
            case "focusin":
              te = "focus", J = yl;
              break;
            case "focusout":
              te = "blur", J = yl;
              break;
            case "beforeblur":
            case "afterblur":
              J = yl;
              break;
            case "click":
              if (s.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              J = Hf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              J = lw;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              J = Tw;
              break;
            case cp:
            case dp:
            case fp:
              J = dw;
              break;
            case pp:
              J = Aw;
              break;
            case "scroll":
              J = sw;
              break;
            case "wheel":
              J = Pw;
              break;
            case "copy":
            case "cut":
            case "paste":
              J = pw;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              J = Gf;
          }
          var re = (r & 4) !== 0, Oe = !re && t === "scroll", I = re ? B !== null ? B + "Capture" : null : B;
          re = [];
          for (var M = F, j; M !== null; ) {
            j = M;
            var W = j.stateNode;
            if (j.tag === 5 && W !== null && (j = W, I !== null && (W = xo(M, I), W != null && re.push(Bo(M, W, j)))), Oe) break;
            M = M.return;
          }
          0 < re.length && (B = new J(B, te, null, s, z), H.push({ event: B, listeners: re }));
        }
      }
      if ((r & 7) === 0) {
        e: {
          if (B = t === "mouseover" || t === "pointerover", J = t === "mouseout" || t === "pointerout", B && s !== Ja && (te = s.relatedTarget || s.fromElement) && (Xn(te) || te[nn])) break e;
          if ((J || B) && (B = z.window === z ? z : (B = z.ownerDocument) ? B.defaultView || B.parentWindow : window, J ? (te = s.relatedTarget || s.toElement, J = F, te = te ? Xn(te) : null, te !== null && (Oe = Qn(te), te !== Oe || te.tag !== 5 && te.tag !== 6) && (te = null)) : (J = null, te = F), J !== te)) {
            if (re = Hf, W = "onMouseLeave", I = "onMouseEnter", M = "mouse", (t === "pointerout" || t === "pointerover") && (re = Gf, W = "onPointerLeave", I = "onPointerEnter", M = "pointer"), Oe = J == null ? B : jr(J), j = te == null ? B : jr(te), B = new re(W, M + "leave", J, s, z), B.target = Oe, B.relatedTarget = j, W = null, Xn(z) === F && (re = new re(I, M + "enter", te, s, z), re.target = j, re.relatedTarget = Oe, W = re), Oe = W, J && te) t: {
              for (re = J, I = te, M = 0, j = re; j; j = Nr(j)) M++;
              for (j = 0, W = I; W; W = Nr(W)) j++;
              for (; 0 < M - j; ) re = Nr(re), M--;
              for (; 0 < j - M; ) I = Nr(I), j--;
              for (; M--; ) {
                if (re === I || I !== null && re === I.alternate) break t;
                re = Nr(re), I = Nr(I);
              }
              re = null;
            }
            else re = null;
            J !== null && Sp(H, B, J, re, !1), te !== null && Oe !== null && Sp(H, Oe, te, re, !0);
          }
        }
        e: {
          if (B = F ? jr(F) : window, J = B.nodeName && B.nodeName.toLowerCase(), J === "select" || J === "input" && B.type === "file") var oe = Iw;
          else if (Jf(B)) if (ep) oe = Lw;
          else {
            oe = Fw;
            var ie = jw;
          }
          else (J = B.nodeName) && J.toLowerCase() === "input" && (B.type === "checkbox" || B.type === "radio") && (oe = Ow);
          if (oe && (oe = oe(t, F))) {
            qf(H, oe, s, z);
            break e;
          }
          ie && ie(t, B, F), t === "focusout" && (ie = B._wrapperState) && ie.controlled && B.type === "number" && Ka(B, "number", B.value);
        }
        switch (ie = F ? jr(F) : window, t) {
          case "focusin":
            (Jf(ie) || ie.contentEditable === "true") && (Rr = ie, _l = F, Oo = null);
            break;
          case "focusout":
            Oo = _l = Rr = null;
            break;
          case "mousedown":
            Tl = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Tl = !1, lp(H, s, z);
            break;
          case "selectionchange":
            if (zw) break;
          case "keydown":
          case "keyup":
            lp(H, s, z);
        }
        var se;
        if (vl) e: {
          switch (t) {
            case "compositionstart":
              var le = "onCompositionStart";
              break e;
            case "compositionend":
              le = "onCompositionEnd";
              break e;
            case "compositionupdate":
              le = "onCompositionUpdate";
              break e;
          }
          le = void 0;
        }
        else Mr ? Xf(t, s) && (le = "onCompositionEnd") : t === "keydown" && s.keyCode === 229 && (le = "onCompositionStart");
        le && (Kf && s.locale !== "ko" && (Mr || le !== "onCompositionStart" ? le === "onCompositionEnd" && Mr && (se = $f()) : (wn = z, fl = "value" in wn ? wn.value : wn.textContent, Mr = !0)), ie = Zi(F, le), 0 < ie.length && (le = new Wf(le, t, null, s, z), H.push({ event: le, listeners: ie }), se ? le.data = se : (se = Zf(s), se !== null && (le.data = se)))), (se = bw ? Mw(t, s) : Rw(t, s)) && (F = Zi(F, "onBeforeInput"), 0 < F.length && (z = new Wf("onBeforeInput", "beforeinput", null, s, z), H.push({ event: z, listeners: F }), z.data = se));
      }
      gp(H, r);
    });
  }
  function Bo(t, r, s) {
    return { instance: t, listener: r, currentTarget: s };
  }
  function Zi(t, r) {
    for (var s = r + "Capture", u = []; t !== null; ) {
      var m = t, y = m.stateNode;
      m.tag === 5 && y !== null && (m = y, y = xo(t, s), y != null && u.unshift(Bo(t, y, m)), y = xo(t, r), y != null && u.push(Bo(t, y, m))), t = t.return;
    }
    return u;
  }
  function Nr(t) {
    if (t === null) return null;
    do
      t = t.return;
    while (t && t.tag !== 5);
    return t || null;
  }
  function Sp(t, r, s, u, m) {
    for (var y = r._reactName, _ = []; s !== null && s !== u; ) {
      var P = s, b = P.alternate, F = P.stateNode;
      if (b !== null && b === u) break;
      P.tag === 5 && F !== null && (P = F, m ? (b = xo(s, y), b != null && _.unshift(Bo(s, b, P))) : m || (b = xo(s, y), b != null && _.push(Bo(s, b, P)))), s = s.return;
    }
    _.length !== 0 && t.push({ event: r, listeners: _ });
  }
  var Ww = /\r\n?/g, Gw = /\u0000|\uFFFD/g;
  function wp(t) {
    return (typeof t == "string" ? t : "" + t).replace(Ww, `
`).replace(Gw, "");
  }
  function Ji(t, r, s) {
    if (r = wp(r), wp(t) !== r && s) throw Error(o(425));
  }
  function qi() {
  }
  var bl = null, Ml = null;
  function Rl(t, r) {
    return t === "textarea" || t === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var Dl = typeof setTimeout == "function" ? setTimeout : void 0, Kw = typeof clearTimeout == "function" ? clearTimeout : void 0, xp = typeof Promise == "function" ? Promise : void 0, Yw = typeof queueMicrotask == "function" ? queueMicrotask : typeof xp < "u" ? function(t) {
    return xp.resolve(null).then(t).catch(Qw);
  } : Dl;
  function Qw(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function Nl(t, r) {
    var s = r, u = 0;
    do {
      var m = s.nextSibling;
      if (t.removeChild(s), m && m.nodeType === 8) if (s = m.data, s === "/$") {
        if (u === 0) {
          t.removeChild(m), Mo(r);
          return;
        }
        u--;
      } else s !== "$" && s !== "$?" && s !== "$!" || u++;
      s = m;
    } while (s);
    Mo(r);
  }
  function _n(t) {
    for (; t != null; t = t.nextSibling) {
      var r = t.nodeType;
      if (r === 1 || r === 3) break;
      if (r === 8) {
        if (r = t.data, r === "$" || r === "$!" || r === "$?") break;
        if (r === "/$") return null;
      }
    }
    return t;
  }
  function _p(t) {
    t = t.previousSibling;
    for (var r = 0; t; ) {
      if (t.nodeType === 8) {
        var s = t.data;
        if (s === "$" || s === "$!" || s === "$?") {
          if (r === 0) return t;
          r--;
        } else s === "/$" && r++;
      }
      t = t.previousSibling;
    }
    return null;
  }
  var Ir = Math.random().toString(36).slice(2), Ut = "__reactFiber$" + Ir, zo = "__reactProps$" + Ir, nn = "__reactContainer$" + Ir, Il = "__reactEvents$" + Ir, Xw = "__reactListeners$" + Ir, Zw = "__reactHandles$" + Ir;
  function Xn(t) {
    var r = t[Ut];
    if (r) return r;
    for (var s = t.parentNode; s; ) {
      if (r = s[nn] || s[Ut]) {
        if (s = r.alternate, r.child !== null || s !== null && s.child !== null) for (t = _p(t); t !== null; ) {
          if (s = t[Ut]) return s;
          t = _p(t);
        }
        return r;
      }
      t = s, s = t.parentNode;
    }
    return null;
  }
  function $o(t) {
    return t = t[Ut] || t[nn], !t || t.tag !== 5 && t.tag !== 6 && t.tag !== 13 && t.tag !== 3 ? null : t;
  }
  function jr(t) {
    if (t.tag === 5 || t.tag === 6) return t.stateNode;
    throw Error(o(33));
  }
  function es(t) {
    return t[zo] || null;
  }
  var jl = [], Fr = -1;
  function Tn(t) {
    return { current: t };
  }
  function Ee(t) {
    0 > Fr || (t.current = jl[Fr], jl[Fr] = null, Fr--);
  }
  function Ce(t, r) {
    Fr++, jl[Fr] = t.current, t.current = r;
  }
  var kn = {}, qe = Tn(kn), lt = Tn(!1), Zn = kn;
  function Or(t, r) {
    var s = t.type.contextTypes;
    if (!s) return kn;
    var u = t.stateNode;
    if (u && u.__reactInternalMemoizedUnmaskedChildContext === r) return u.__reactInternalMemoizedMaskedChildContext;
    var m = {}, y;
    for (y in s) m[y] = r[y];
    return u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = r, t.__reactInternalMemoizedMaskedChildContext = m), m;
  }
  function ut(t) {
    return t = t.childContextTypes, t != null;
  }
  function ts() {
    Ee(lt), Ee(qe);
  }
  function Tp(t, r, s) {
    if (qe.current !== kn) throw Error(o(168));
    Ce(qe, r), Ce(lt, s);
  }
  function kp(t, r, s) {
    var u = t.stateNode;
    if (r = r.childContextTypes, typeof u.getChildContext != "function") return s;
    u = u.getChildContext();
    for (var m in u) if (!(m in r)) throw Error(o(108, Ae(t) || "Unknown", m));
    return Y({}, s, u);
  }
  function ns(t) {
    return t = (t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext || kn, Zn = qe.current, Ce(qe, t), Ce(lt, lt.current), !0;
  }
  function Ap(t, r, s) {
    var u = t.stateNode;
    if (!u) throw Error(o(169));
    s ? (t = kp(t, r, Zn), u.__reactInternalMemoizedMergedChildContext = t, Ee(lt), Ee(qe), Ce(qe, t)) : Ee(lt), Ce(lt, s);
  }
  var rn = null, rs = !1, Fl = !1;
  function Cp(t) {
    rn === null ? rn = [t] : rn.push(t);
  }
  function Jw(t) {
    rs = !0, Cp(t);
  }
  function An() {
    if (!Fl && rn !== null) {
      Fl = !0;
      var t = 0, r = xe;
      try {
        var s = rn;
        for (xe = 1; t < s.length; t++) {
          var u = s[t];
          do
            u = u(!0);
          while (u !== null);
        }
        rn = null, rs = !1;
      } catch (m) {
        throw rn !== null && (rn = rn.slice(t + 1)), Ef(ol, An), m;
      } finally {
        xe = r, Fl = !1;
      }
    }
    return null;
  }
  var Lr = [], Vr = 0, os = null, is = 0, _t = [], Tt = 0, Jn = null, on = 1, sn = "";
  function qn(t, r) {
    Lr[Vr++] = is, Lr[Vr++] = os, os = t, is = r;
  }
  function Pp(t, r, s) {
    _t[Tt++] = on, _t[Tt++] = sn, _t[Tt++] = Jn, Jn = t;
    var u = on;
    t = sn;
    var m = 32 - Rt(u) - 1;
    u &= ~(1 << m), s += 1;
    var y = 32 - Rt(r) + m;
    if (30 < y) {
      var _ = m - m % 5;
      y = (u & (1 << _) - 1).toString(32), u >>= _, m -= _, on = 1 << 32 - Rt(r) + m | s << m | u, sn = y + t;
    } else on = 1 << y | s << m | u, sn = t;
  }
  function Ol(t) {
    t.return !== null && (qn(t, 1), Pp(t, 1, 0));
  }
  function Ll(t) {
    for (; t === os; ) os = Lr[--Vr], Lr[Vr] = null, is = Lr[--Vr], Lr[Vr] = null;
    for (; t === Jn; ) Jn = _t[--Tt], _t[Tt] = null, sn = _t[--Tt], _t[Tt] = null, on = _t[--Tt], _t[Tt] = null;
  }
  var gt = null, vt = null, Re = !1, Nt = null;
  function Ep(t, r) {
    var s = Pt(5, null, null, 0);
    s.elementType = "DELETED", s.stateNode = r, s.return = t, r = t.deletions, r === null ? (t.deletions = [s], t.flags |= 16) : r.push(s);
  }
  function bp(t, r) {
    switch (t.tag) {
      case 5:
        var s = t.type;
        return r = r.nodeType !== 1 || s.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (t.stateNode = r, gt = t, vt = _n(r.firstChild), !0) : !1;
      case 6:
        return r = t.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (t.stateNode = r, gt = t, vt = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (s = Jn !== null ? { id: on, overflow: sn } : null, t.memoizedState = { dehydrated: r, treeContext: s, retryLane: 1073741824 }, s = Pt(18, null, null, 0), s.stateNode = r, s.return = t, t.child = s, gt = t, vt = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Vl(t) {
    return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
  }
  function Bl(t) {
    if (Re) {
      var r = vt;
      if (r) {
        var s = r;
        if (!bp(t, r)) {
          if (Vl(t)) throw Error(o(418));
          r = _n(s.nextSibling);
          var u = gt;
          r && bp(t, r) ? Ep(u, s) : (t.flags = t.flags & -4097 | 2, Re = !1, gt = t);
        }
      } else {
        if (Vl(t)) throw Error(o(418));
        t.flags = t.flags & -4097 | 2, Re = !1, gt = t;
      }
    }
  }
  function Mp(t) {
    for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; ) t = t.return;
    gt = t;
  }
  function ss(t) {
    if (t !== gt) return !1;
    if (!Re) return Mp(t), Re = !0, !1;
    var r;
    if ((r = t.tag !== 3) && !(r = t.tag !== 5) && (r = t.type, r = r !== "head" && r !== "body" && !Rl(t.type, t.memoizedProps)), r && (r = vt)) {
      if (Vl(t)) throw Rp(), Error(o(418));
      for (; r; ) Ep(t, r), r = _n(r.nextSibling);
    }
    if (Mp(t), t.tag === 13) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(o(317));
      e: {
        for (t = t.nextSibling, r = 0; t; ) {
          if (t.nodeType === 8) {
            var s = t.data;
            if (s === "/$") {
              if (r === 0) {
                vt = _n(t.nextSibling);
                break e;
              }
              r--;
            } else s !== "$" && s !== "$!" && s !== "$?" || r++;
          }
          t = t.nextSibling;
        }
        vt = null;
      }
    } else vt = gt ? _n(t.stateNode.nextSibling) : null;
    return !0;
  }
  function Rp() {
    for (var t = vt; t; ) t = _n(t.nextSibling);
  }
  function Br() {
    vt = gt = null, Re = !1;
  }
  function zl(t) {
    Nt === null ? Nt = [t] : Nt.push(t);
  }
  var qw = N.ReactCurrentBatchConfig;
  function Uo(t, r, s) {
    if (t = s.ref, t !== null && typeof t != "function" && typeof t != "object") {
      if (s._owner) {
        if (s = s._owner, s) {
          if (s.tag !== 1) throw Error(o(309));
          var u = s.stateNode;
        }
        if (!u) throw Error(o(147, t));
        var m = u, y = "" + t;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === y ? r.ref : (r = function(_) {
          var P = m.refs;
          _ === null ? delete P[y] : P[y] = _;
        }, r._stringRef = y, r);
      }
      if (typeof t != "string") throw Error(o(284));
      if (!s._owner) throw Error(o(290, t));
    }
    return t;
  }
  function as(t, r) {
    throw t = Object.prototype.toString.call(r), Error(o(31, t === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : t));
  }
  function Dp(t) {
    var r = t._init;
    return r(t._payload);
  }
  function Np(t) {
    function r(I, M) {
      if (t) {
        var j = I.deletions;
        j === null ? (I.deletions = [M], I.flags |= 16) : j.push(M);
      }
    }
    function s(I, M) {
      if (!t) return null;
      for (; M !== null; ) r(I, M), M = M.sibling;
      return null;
    }
    function u(I, M) {
      for (I = /* @__PURE__ */ new Map(); M !== null; ) M.key !== null ? I.set(M.key, M) : I.set(M.index, M), M = M.sibling;
      return I;
    }
    function m(I, M) {
      return I = Nn(I, M), I.index = 0, I.sibling = null, I;
    }
    function y(I, M, j) {
      return I.index = j, t ? (j = I.alternate, j !== null ? (j = j.index, j < M ? (I.flags |= 2, M) : j) : (I.flags |= 2, M)) : (I.flags |= 1048576, M);
    }
    function _(I) {
      return t && I.alternate === null && (I.flags |= 2), I;
    }
    function P(I, M, j, W) {
      return M === null || M.tag !== 6 ? (M = Du(j, I.mode, W), M.return = I, M) : (M = m(M, j), M.return = I, M);
    }
    function b(I, M, j, W) {
      var oe = j.type;
      return oe === K ? z(I, M, j.props.children, W, j.key) : M !== null && (M.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ve && Dp(oe) === M.type) ? (W = m(M, j.props), W.ref = Uo(I, M, j), W.return = I, W) : (W = Rs(j.type, j.key, j.props, null, I.mode, W), W.ref = Uo(I, M, j), W.return = I, W);
    }
    function F(I, M, j, W) {
      return M === null || M.tag !== 4 || M.stateNode.containerInfo !== j.containerInfo || M.stateNode.implementation !== j.implementation ? (M = Nu(j, I.mode, W), M.return = I, M) : (M = m(M, j.children || []), M.return = I, M);
    }
    function z(I, M, j, W, oe) {
      return M === null || M.tag !== 7 ? (M = ar(j, I.mode, W, oe), M.return = I, M) : (M = m(M, j), M.return = I, M);
    }
    function H(I, M, j) {
      if (typeof M == "string" && M !== "" || typeof M == "number") return M = Du("" + M, I.mode, j), M.return = I, M;
      if (typeof M == "object" && M !== null) {
        switch (M.$$typeof) {
          case O:
            return j = Rs(M.type, M.key, M.props, null, I.mode, j), j.ref = Uo(I, null, M), j.return = I, j;
          case U:
            return M = Nu(M, I.mode, j), M.return = I, M;
          case ve:
            var W = M._init;
            return H(I, W(M._payload), j);
        }
        if (vo(M) || Z(M)) return M = ar(M, I.mode, j, null), M.return = I, M;
        as(I, M);
      }
      return null;
    }
    function B(I, M, j, W) {
      var oe = M !== null ? M.key : null;
      if (typeof j == "string" && j !== "" || typeof j == "number") return oe !== null ? null : P(I, M, "" + j, W);
      if (typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case O:
            return j.key === oe ? b(I, M, j, W) : null;
          case U:
            return j.key === oe ? F(I, M, j, W) : null;
          case ve:
            return oe = j._init, B(
              I,
              M,
              oe(j._payload),
              W
            );
        }
        if (vo(j) || Z(j)) return oe !== null ? null : z(I, M, j, W, null);
        as(I, j);
      }
      return null;
    }
    function J(I, M, j, W, oe) {
      if (typeof W == "string" && W !== "" || typeof W == "number") return I = I.get(j) || null, P(M, I, "" + W, oe);
      if (typeof W == "object" && W !== null) {
        switch (W.$$typeof) {
          case O:
            return I = I.get(W.key === null ? j : W.key) || null, b(M, I, W, oe);
          case U:
            return I = I.get(W.key === null ? j : W.key) || null, F(M, I, W, oe);
          case ve:
            var ie = W._init;
            return J(I, M, j, ie(W._payload), oe);
        }
        if (vo(W) || Z(W)) return I = I.get(j) || null, z(M, I, W, oe, null);
        as(M, W);
      }
      return null;
    }
    function te(I, M, j, W) {
      for (var oe = null, ie = null, se = M, le = M = 0, Ge = null; se !== null && le < j.length; le++) {
        se.index > le ? (Ge = se, se = null) : Ge = se.sibling;
        var ge = B(I, se, j[le], W);
        if (ge === null) {
          se === null && (se = Ge);
          break;
        }
        t && se && ge.alternate === null && r(I, se), M = y(ge, M, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge, se = Ge;
      }
      if (le === j.length) return s(I, se), Re && qn(I, le), oe;
      if (se === null) {
        for (; le < j.length; le++) se = H(I, j[le], W), se !== null && (M = y(se, M, le), ie === null ? oe = se : ie.sibling = se, ie = se);
        return Re && qn(I, le), oe;
      }
      for (se = u(I, se); le < j.length; le++) Ge = J(se, I, le, j[le], W), Ge !== null && (t && Ge.alternate !== null && se.delete(Ge.key === null ? le : Ge.key), M = y(Ge, M, le), ie === null ? oe = Ge : ie.sibling = Ge, ie = Ge);
      return t && se.forEach(function(In) {
        return r(I, In);
      }), Re && qn(I, le), oe;
    }
    function re(I, M, j, W) {
      var oe = Z(j);
      if (typeof oe != "function") throw Error(o(150));
      if (j = oe.call(j), j == null) throw Error(o(151));
      for (var ie = oe = null, se = M, le = M = 0, Ge = null, ge = j.next(); se !== null && !ge.done; le++, ge = j.next()) {
        se.index > le ? (Ge = se, se = null) : Ge = se.sibling;
        var In = B(I, se, ge.value, W);
        if (In === null) {
          se === null && (se = Ge);
          break;
        }
        t && se && In.alternate === null && r(I, se), M = y(In, M, le), ie === null ? oe = In : ie.sibling = In, ie = In, se = Ge;
      }
      if (ge.done) return s(
        I,
        se
      ), Re && qn(I, le), oe;
      if (se === null) {
        for (; !ge.done; le++, ge = j.next()) ge = H(I, ge.value, W), ge !== null && (M = y(ge, M, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge);
        return Re && qn(I, le), oe;
      }
      for (se = u(I, se); !ge.done; le++, ge = j.next()) ge = J(se, I, le, ge.value, W), ge !== null && (t && ge.alternate !== null && se.delete(ge.key === null ? le : ge.key), M = y(ge, M, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge);
      return t && se.forEach(function(Dx) {
        return r(I, Dx);
      }), Re && qn(I, le), oe;
    }
    function Oe(I, M, j, W) {
      if (typeof j == "object" && j !== null && j.type === K && j.key === null && (j = j.props.children), typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case O:
            e: {
              for (var oe = j.key, ie = M; ie !== null; ) {
                if (ie.key === oe) {
                  if (oe = j.type, oe === K) {
                    if (ie.tag === 7) {
                      s(I, ie.sibling), M = m(ie, j.props.children), M.return = I, I = M;
                      break e;
                    }
                  } else if (ie.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ve && Dp(oe) === ie.type) {
                    s(I, ie.sibling), M = m(ie, j.props), M.ref = Uo(I, ie, j), M.return = I, I = M;
                    break e;
                  }
                  s(I, ie);
                  break;
                } else r(I, ie);
                ie = ie.sibling;
              }
              j.type === K ? (M = ar(j.props.children, I.mode, W, j.key), M.return = I, I = M) : (W = Rs(j.type, j.key, j.props, null, I.mode, W), W.ref = Uo(I, M, j), W.return = I, I = W);
            }
            return _(I);
          case U:
            e: {
              for (ie = j.key; M !== null; ) {
                if (M.key === ie) if (M.tag === 4 && M.stateNode.containerInfo === j.containerInfo && M.stateNode.implementation === j.implementation) {
                  s(I, M.sibling), M = m(M, j.children || []), M.return = I, I = M;
                  break e;
                } else {
                  s(I, M);
                  break;
                }
                else r(I, M);
                M = M.sibling;
              }
              M = Nu(j, I.mode, W), M.return = I, I = M;
            }
            return _(I);
          case ve:
            return ie = j._init, Oe(I, M, ie(j._payload), W);
        }
        if (vo(j)) return te(I, M, j, W);
        if (Z(j)) return re(I, M, j, W);
        as(I, j);
      }
      return typeof j == "string" && j !== "" || typeof j == "number" ? (j = "" + j, M !== null && M.tag === 6 ? (s(I, M.sibling), M = m(M, j), M.return = I, I = M) : (s(I, M), M = Du(j, I.mode, W), M.return = I, I = M), _(I)) : s(I, M);
    }
    return Oe;
  }
  var zr = Np(!0), Ip = Np(!1), ls = Tn(null), us = null, $r = null, $l = null;
  function Ul() {
    $l = $r = us = null;
  }
  function Hl(t) {
    var r = ls.current;
    Ee(ls), t._currentValue = r;
  }
  function Wl(t, r, s) {
    for (; t !== null; ) {
      var u = t.alternate;
      if ((t.childLanes & r) !== r ? (t.childLanes |= r, u !== null && (u.childLanes |= r)) : u !== null && (u.childLanes & r) !== r && (u.childLanes |= r), t === s) break;
      t = t.return;
    }
  }
  function Ur(t, r) {
    us = t, $l = $r = null, t = t.dependencies, t !== null && t.firstContext !== null && ((t.lanes & r) !== 0 && (ct = !0), t.firstContext = null);
  }
  function kt(t) {
    var r = t._currentValue;
    if ($l !== t) if (t = { context: t, memoizedValue: r, next: null }, $r === null) {
      if (us === null) throw Error(o(308));
      $r = t, us.dependencies = { lanes: 0, firstContext: t };
    } else $r = $r.next = t;
    return r;
  }
  var er = null;
  function Gl(t) {
    er === null ? er = [t] : er.push(t);
  }
  function jp(t, r, s, u) {
    var m = r.interleaved;
    return m === null ? (s.next = s, Gl(r)) : (s.next = m.next, m.next = s), r.interleaved = s, an(t, u);
  }
  function an(t, r) {
    t.lanes |= r;
    var s = t.alternate;
    for (s !== null && (s.lanes |= r), s = t, t = t.return; t !== null; ) t.childLanes |= r, s = t.alternate, s !== null && (s.childLanes |= r), s = t, t = t.return;
    return s.tag === 3 ? s.stateNode : null;
  }
  var Cn = !1;
  function Kl(t) {
    t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Fp(t, r) {
    t = t.updateQueue, r.updateQueue === t && (r.updateQueue = { baseState: t.baseState, firstBaseUpdate: t.firstBaseUpdate, lastBaseUpdate: t.lastBaseUpdate, shared: t.shared, effects: t.effects });
  }
  function ln(t, r) {
    return { eventTime: t, lane: r, tag: 0, payload: null, callback: null, next: null };
  }
  function Pn(t, r, s) {
    var u = t.updateQueue;
    if (u === null) return null;
    if (u = u.shared, (me & 2) !== 0) {
      var m = u.pending;
      return m === null ? r.next = r : (r.next = m.next, m.next = r), u.pending = r, an(t, s);
    }
    return m = u.interleaved, m === null ? (r.next = r, Gl(u)) : (r.next = m.next, m.next = r), u.interleaved = r, an(t, s);
  }
  function cs(t, r, s) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (s & 4194240) !== 0)) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, al(t, s);
    }
  }
  function Op(t, r) {
    var s = t.updateQueue, u = t.alternate;
    if (u !== null && (u = u.updateQueue, s === u)) {
      var m = null, y = null;
      if (s = s.firstBaseUpdate, s !== null) {
        do {
          var _ = { eventTime: s.eventTime, lane: s.lane, tag: s.tag, payload: s.payload, callback: s.callback, next: null };
          y === null ? m = y = _ : y = y.next = _, s = s.next;
        } while (s !== null);
        y === null ? m = y = r : y = y.next = r;
      } else m = y = r;
      s = { baseState: u.baseState, firstBaseUpdate: m, lastBaseUpdate: y, shared: u.shared, effects: u.effects }, t.updateQueue = s;
      return;
    }
    t = s.lastBaseUpdate, t === null ? s.firstBaseUpdate = r : t.next = r, s.lastBaseUpdate = r;
  }
  function ds(t, r, s, u) {
    var m = t.updateQueue;
    Cn = !1;
    var y = m.firstBaseUpdate, _ = m.lastBaseUpdate, P = m.shared.pending;
    if (P !== null) {
      m.shared.pending = null;
      var b = P, F = b.next;
      b.next = null, _ === null ? y = F : _.next = F, _ = b;
      var z = t.alternate;
      z !== null && (z = z.updateQueue, P = z.lastBaseUpdate, P !== _ && (P === null ? z.firstBaseUpdate = F : P.next = F, z.lastBaseUpdate = b));
    }
    if (y !== null) {
      var H = m.baseState;
      _ = 0, z = F = b = null, P = y;
      do {
        var B = P.lane, J = P.eventTime;
        if ((u & B) === B) {
          z !== null && (z = z.next = {
            eventTime: J,
            lane: 0,
            tag: P.tag,
            payload: P.payload,
            callback: P.callback,
            next: null
          });
          e: {
            var te = t, re = P;
            switch (B = r, J = s, re.tag) {
              case 1:
                if (te = re.payload, typeof te == "function") {
                  H = te.call(J, H, B);
                  break e;
                }
                H = te;
                break e;
              case 3:
                te.flags = te.flags & -65537 | 128;
              case 0:
                if (te = re.payload, B = typeof te == "function" ? te.call(J, H, B) : te, B == null) break e;
                H = Y({}, H, B);
                break e;
              case 2:
                Cn = !0;
            }
          }
          P.callback !== null && P.lane !== 0 && (t.flags |= 64, B = m.effects, B === null ? m.effects = [P] : B.push(P));
        } else J = { eventTime: J, lane: B, tag: P.tag, payload: P.payload, callback: P.callback, next: null }, z === null ? (F = z = J, b = H) : z = z.next = J, _ |= B;
        if (P = P.next, P === null) {
          if (P = m.shared.pending, P === null) break;
          B = P, P = B.next, B.next = null, m.lastBaseUpdate = B, m.shared.pending = null;
        }
      } while (!0);
      if (z === null && (b = H), m.baseState = b, m.firstBaseUpdate = F, m.lastBaseUpdate = z, r = m.shared.interleaved, r !== null) {
        m = r;
        do
          _ |= m.lane, m = m.next;
        while (m !== r);
      } else y === null && (m.shared.lanes = 0);
      rr |= _, t.lanes = _, t.memoizedState = H;
    }
  }
  function Lp(t, r, s) {
    if (t = r.effects, r.effects = null, t !== null) for (r = 0; r < t.length; r++) {
      var u = t[r], m = u.callback;
      if (m !== null) {
        if (u.callback = null, u = s, typeof m != "function") throw Error(o(191, m));
        m.call(u);
      }
    }
  }
  var Ho = {}, Ht = Tn(Ho), Wo = Tn(Ho), Go = Tn(Ho);
  function tr(t) {
    if (t === Ho) throw Error(o(174));
    return t;
  }
  function Yl(t, r) {
    switch (Ce(Go, r), Ce(Wo, t), Ce(Ht, Ho), t = r.nodeType, t) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : Qa(null, "");
        break;
      default:
        t = t === 8 ? r.parentNode : r, r = t.namespaceURI || null, t = t.tagName, r = Qa(r, t);
    }
    Ee(Ht), Ce(Ht, r);
  }
  function Hr() {
    Ee(Ht), Ee(Wo), Ee(Go);
  }
  function Vp(t) {
    tr(Go.current);
    var r = tr(Ht.current), s = Qa(r, t.type);
    r !== s && (Ce(Wo, t), Ce(Ht, s));
  }
  function Ql(t) {
    Wo.current === t && (Ee(Ht), Ee(Wo));
  }
  var De = Tn(0);
  function fs(t) {
    for (var r = t; r !== null; ) {
      if (r.tag === 13) {
        var s = r.memoizedState;
        if (s !== null && (s = s.dehydrated, s === null || s.data === "$?" || s.data === "$!")) return r;
      } else if (r.tag === 19 && r.memoizedProps.revealOrder !== void 0) {
        if ((r.flags & 128) !== 0) return r;
      } else if (r.child !== null) {
        r.child.return = r, r = r.child;
        continue;
      }
      if (r === t) break;
      for (; r.sibling === null; ) {
        if (r.return === null || r.return === t) return null;
        r = r.return;
      }
      r.sibling.return = r.return, r = r.sibling;
    }
    return null;
  }
  var Xl = [];
  function Zl() {
    for (var t = 0; t < Xl.length; t++) Xl[t]._workInProgressVersionPrimary = null;
    Xl.length = 0;
  }
  var ps = N.ReactCurrentDispatcher, Jl = N.ReactCurrentBatchConfig, nr = 0, Ne = null, Be = null, He = null, ms = !1, Ko = !1, Yo = 0, ex = 0;
  function et() {
    throw Error(o(321));
  }
  function ql(t, r) {
    if (r === null) return !1;
    for (var s = 0; s < r.length && s < t.length; s++) if (!Dt(t[s], r[s])) return !1;
    return !0;
  }
  function eu(t, r, s, u, m, y) {
    if (nr = y, Ne = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, ps.current = t === null || t.memoizedState === null ? ox : ix, t = s(u, m), Ko) {
      y = 0;
      do {
        if (Ko = !1, Yo = 0, 25 <= y) throw Error(o(301));
        y += 1, He = Be = null, r.updateQueue = null, ps.current = sx, t = s(u, m);
      } while (Ko);
    }
    if (ps.current = gs, r = Be !== null && Be.next !== null, nr = 0, He = Be = Ne = null, ms = !1, r) throw Error(o(300));
    return t;
  }
  function tu() {
    var t = Yo !== 0;
    return Yo = 0, t;
  }
  function Wt() {
    var t = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return He === null ? Ne.memoizedState = He = t : He = He.next = t, He;
  }
  function At() {
    if (Be === null) {
      var t = Ne.alternate;
      t = t !== null ? t.memoizedState : null;
    } else t = Be.next;
    var r = He === null ? Ne.memoizedState : He.next;
    if (r !== null) He = r, Be = t;
    else {
      if (t === null) throw Error(o(310));
      Be = t, t = { memoizedState: Be.memoizedState, baseState: Be.baseState, baseQueue: Be.baseQueue, queue: Be.queue, next: null }, He === null ? Ne.memoizedState = He = t : He = He.next = t;
    }
    return He;
  }
  function Qo(t, r) {
    return typeof r == "function" ? r(t) : r;
  }
  function nu(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = t;
    var u = Be, m = u.baseQueue, y = s.pending;
    if (y !== null) {
      if (m !== null) {
        var _ = m.next;
        m.next = y.next, y.next = _;
      }
      u.baseQueue = m = y, s.pending = null;
    }
    if (m !== null) {
      y = m.next, u = u.baseState;
      var P = _ = null, b = null, F = y;
      do {
        var z = F.lane;
        if ((nr & z) === z) b !== null && (b = b.next = { lane: 0, action: F.action, hasEagerState: F.hasEagerState, eagerState: F.eagerState, next: null }), u = F.hasEagerState ? F.eagerState : t(u, F.action);
        else {
          var H = {
            lane: z,
            action: F.action,
            hasEagerState: F.hasEagerState,
            eagerState: F.eagerState,
            next: null
          };
          b === null ? (P = b = H, _ = u) : b = b.next = H, Ne.lanes |= z, rr |= z;
        }
        F = F.next;
      } while (F !== null && F !== y);
      b === null ? _ = u : b.next = P, Dt(u, r.memoizedState) || (ct = !0), r.memoizedState = u, r.baseState = _, r.baseQueue = b, s.lastRenderedState = u;
    }
    if (t = s.interleaved, t !== null) {
      m = t;
      do
        y = m.lane, Ne.lanes |= y, rr |= y, m = m.next;
      while (m !== t);
    } else m === null && (s.lanes = 0);
    return [r.memoizedState, s.dispatch];
  }
  function ru(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = t;
    var u = s.dispatch, m = s.pending, y = r.memoizedState;
    if (m !== null) {
      s.pending = null;
      var _ = m = m.next;
      do
        y = t(y, _.action), _ = _.next;
      while (_ !== m);
      Dt(y, r.memoizedState) || (ct = !0), r.memoizedState = y, r.baseQueue === null && (r.baseState = y), s.lastRenderedState = y;
    }
    return [y, u];
  }
  function Bp() {
  }
  function zp(t, r) {
    var s = Ne, u = At(), m = r(), y = !Dt(u.memoizedState, m);
    if (y && (u.memoizedState = m, ct = !0), u = u.queue, ou(Hp.bind(null, s, u, t), [t]), u.getSnapshot !== r || y || He !== null && He.memoizedState.tag & 1) {
      if (s.flags |= 2048, Xo(9, Up.bind(null, s, u, m, r), void 0, null), We === null) throw Error(o(349));
      (nr & 30) !== 0 || $p(s, r, m);
    }
    return m;
  }
  function $p(t, r, s) {
    t.flags |= 16384, t = { getSnapshot: r, value: s }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.stores = [t]) : (s = r.stores, s === null ? r.stores = [t] : s.push(t));
  }
  function Up(t, r, s, u) {
    r.value = s, r.getSnapshot = u, Wp(r) && Gp(t);
  }
  function Hp(t, r, s) {
    return s(function() {
      Wp(r) && Gp(t);
    });
  }
  function Wp(t) {
    var r = t.getSnapshot;
    t = t.value;
    try {
      var s = r();
      return !Dt(t, s);
    } catch {
      return !0;
    }
  }
  function Gp(t) {
    var r = an(t, 1);
    r !== null && Ot(r, t, 1, -1);
  }
  function Kp(t) {
    var r = Wt();
    return typeof t == "function" && (t = t()), r.memoizedState = r.baseState = t, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Qo, lastRenderedState: t }, r.queue = t, t = t.dispatch = rx.bind(null, Ne, t), [r.memoizedState, t];
  }
  function Xo(t, r, s, u) {
    return t = { tag: t, create: r, destroy: s, deps: u, next: null }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.lastEffect = t.next = t) : (s = r.lastEffect, s === null ? r.lastEffect = t.next = t : (u = s.next, s.next = t, t.next = u, r.lastEffect = t)), t;
  }
  function Yp() {
    return At().memoizedState;
  }
  function hs(t, r, s, u) {
    var m = Wt();
    Ne.flags |= t, m.memoizedState = Xo(1 | r, s, void 0, u === void 0 ? null : u);
  }
  function ys(t, r, s, u) {
    var m = At();
    u = u === void 0 ? null : u;
    var y = void 0;
    if (Be !== null) {
      var _ = Be.memoizedState;
      if (y = _.destroy, u !== null && ql(u, _.deps)) {
        m.memoizedState = Xo(r, s, y, u);
        return;
      }
    }
    Ne.flags |= t, m.memoizedState = Xo(1 | r, s, y, u);
  }
  function Qp(t, r) {
    return hs(8390656, 8, t, r);
  }
  function ou(t, r) {
    return ys(2048, 8, t, r);
  }
  function Xp(t, r) {
    return ys(4, 2, t, r);
  }
  function Zp(t, r) {
    return ys(4, 4, t, r);
  }
  function Jp(t, r) {
    if (typeof r == "function") return t = t(), r(t), function() {
      r(null);
    };
    if (r != null) return t = t(), r.current = t, function() {
      r.current = null;
    };
  }
  function qp(t, r, s) {
    return s = s != null ? s.concat([t]) : null, ys(4, 4, Jp.bind(null, r, t), s);
  }
  function iu() {
  }
  function em(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && ql(r, u[1]) ? u[0] : (s.memoizedState = [t, r], t);
  }
  function tm(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && ql(r, u[1]) ? u[0] : (t = t(), s.memoizedState = [t, r], t);
  }
  function nm(t, r, s) {
    return (nr & 21) === 0 ? (t.baseState && (t.baseState = !1, ct = !0), t.memoizedState = s) : (Dt(s, r) || (s = Df(), Ne.lanes |= s, rr |= s, t.baseState = !0), r);
  }
  function tx(t, r) {
    var s = xe;
    xe = s !== 0 && 4 > s ? s : 4, t(!0);
    var u = Jl.transition;
    Jl.transition = {};
    try {
      t(!1), r();
    } finally {
      xe = s, Jl.transition = u;
    }
  }
  function rm() {
    return At().memoizedState;
  }
  function nx(t, r, s) {
    var u = Rn(t);
    if (s = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null }, om(t)) im(r, s);
    else if (s = jp(t, r, s, u), s !== null) {
      var m = ot();
      Ot(s, t, u, m), sm(s, r, u);
    }
  }
  function rx(t, r, s) {
    var u = Rn(t), m = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null };
    if (om(t)) im(r, m);
    else {
      var y = t.alternate;
      if (t.lanes === 0 && (y === null || y.lanes === 0) && (y = r.lastRenderedReducer, y !== null)) try {
        var _ = r.lastRenderedState, P = y(_, s);
        if (m.hasEagerState = !0, m.eagerState = P, Dt(P, _)) {
          var b = r.interleaved;
          b === null ? (m.next = m, Gl(r)) : (m.next = b.next, b.next = m), r.interleaved = m;
          return;
        }
      } catch {
      } finally {
      }
      s = jp(t, r, m, u), s !== null && (m = ot(), Ot(s, t, u, m), sm(s, r, u));
    }
  }
  function om(t) {
    var r = t.alternate;
    return t === Ne || r !== null && r === Ne;
  }
  function im(t, r) {
    Ko = ms = !0;
    var s = t.pending;
    s === null ? r.next = r : (r.next = s.next, s.next = r), t.pending = r;
  }
  function sm(t, r, s) {
    if ((s & 4194240) !== 0) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, al(t, s);
    }
  }
  var gs = { readContext: kt, useCallback: et, useContext: et, useEffect: et, useImperativeHandle: et, useInsertionEffect: et, useLayoutEffect: et, useMemo: et, useReducer: et, useRef: et, useState: et, useDebugValue: et, useDeferredValue: et, useTransition: et, useMutableSource: et, useSyncExternalStore: et, useId: et, unstable_isNewReconciler: !1 }, ox = { readContext: kt, useCallback: function(t, r) {
    return Wt().memoizedState = [t, r === void 0 ? null : r], t;
  }, useContext: kt, useEffect: Qp, useImperativeHandle: function(t, r, s) {
    return s = s != null ? s.concat([t]) : null, hs(
      4194308,
      4,
      Jp.bind(null, r, t),
      s
    );
  }, useLayoutEffect: function(t, r) {
    return hs(4194308, 4, t, r);
  }, useInsertionEffect: function(t, r) {
    return hs(4, 2, t, r);
  }, useMemo: function(t, r) {
    var s = Wt();
    return r = r === void 0 ? null : r, t = t(), s.memoizedState = [t, r], t;
  }, useReducer: function(t, r, s) {
    var u = Wt();
    return r = s !== void 0 ? s(r) : r, u.memoizedState = u.baseState = r, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: r }, u.queue = t, t = t.dispatch = nx.bind(null, Ne, t), [u.memoizedState, t];
  }, useRef: function(t) {
    var r = Wt();
    return t = { current: t }, r.memoizedState = t;
  }, useState: Kp, useDebugValue: iu, useDeferredValue: function(t) {
    return Wt().memoizedState = t;
  }, useTransition: function() {
    var t = Kp(!1), r = t[0];
    return t = tx.bind(null, t[1]), Wt().memoizedState = t, [r, t];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(t, r, s) {
    var u = Ne, m = Wt();
    if (Re) {
      if (s === void 0) throw Error(o(407));
      s = s();
    } else {
      if (s = r(), We === null) throw Error(o(349));
      (nr & 30) !== 0 || $p(u, r, s);
    }
    m.memoizedState = s;
    var y = { value: s, getSnapshot: r };
    return m.queue = y, Qp(Hp.bind(
      null,
      u,
      y,
      t
    ), [t]), u.flags |= 2048, Xo(9, Up.bind(null, u, y, s, r), void 0, null), s;
  }, useId: function() {
    var t = Wt(), r = We.identifierPrefix;
    if (Re) {
      var s = sn, u = on;
      s = (u & ~(1 << 32 - Rt(u) - 1)).toString(32) + s, r = ":" + r + "R" + s, s = Yo++, 0 < s && (r += "H" + s.toString(32)), r += ":";
    } else s = ex++, r = ":" + r + "r" + s.toString(32) + ":";
    return t.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, ix = {
    readContext: kt,
    useCallback: em,
    useContext: kt,
    useEffect: ou,
    useImperativeHandle: qp,
    useInsertionEffect: Xp,
    useLayoutEffect: Zp,
    useMemo: tm,
    useReducer: nu,
    useRef: Yp,
    useState: function() {
      return nu(Qo);
    },
    useDebugValue: iu,
    useDeferredValue: function(t) {
      var r = At();
      return nm(r, Be.memoizedState, t);
    },
    useTransition: function() {
      var t = nu(Qo)[0], r = At().memoizedState;
      return [t, r];
    },
    useMutableSource: Bp,
    useSyncExternalStore: zp,
    useId: rm,
    unstable_isNewReconciler: !1
  }, sx = { readContext: kt, useCallback: em, useContext: kt, useEffect: ou, useImperativeHandle: qp, useInsertionEffect: Xp, useLayoutEffect: Zp, useMemo: tm, useReducer: ru, useRef: Yp, useState: function() {
    return ru(Qo);
  }, useDebugValue: iu, useDeferredValue: function(t) {
    var r = At();
    return Be === null ? r.memoizedState = t : nm(r, Be.memoizedState, t);
  }, useTransition: function() {
    var t = ru(Qo)[0], r = At().memoizedState;
    return [t, r];
  }, useMutableSource: Bp, useSyncExternalStore: zp, useId: rm, unstable_isNewReconciler: !1 };
  function It(t, r) {
    if (t && t.defaultProps) {
      r = Y({}, r), t = t.defaultProps;
      for (var s in t) r[s] === void 0 && (r[s] = t[s]);
      return r;
    }
    return r;
  }
  function su(t, r, s, u) {
    r = t.memoizedState, s = s(u, r), s = s == null ? r : Y({}, r, s), t.memoizedState = s, t.lanes === 0 && (t.updateQueue.baseState = s);
  }
  var vs = { isMounted: function(t) {
    return (t = t._reactInternals) ? Qn(t) === t : !1;
  }, enqueueSetState: function(t, r, s) {
    t = t._reactInternals;
    var u = ot(), m = Rn(t), y = ln(u, m);
    y.payload = r, s != null && (y.callback = s), r = Pn(t, y, m), r !== null && (Ot(r, t, m, u), cs(r, t, m));
  }, enqueueReplaceState: function(t, r, s) {
    t = t._reactInternals;
    var u = ot(), m = Rn(t), y = ln(u, m);
    y.tag = 1, y.payload = r, s != null && (y.callback = s), r = Pn(t, y, m), r !== null && (Ot(r, t, m, u), cs(r, t, m));
  }, enqueueForceUpdate: function(t, r) {
    t = t._reactInternals;
    var s = ot(), u = Rn(t), m = ln(s, u);
    m.tag = 2, r != null && (m.callback = r), r = Pn(t, m, u), r !== null && (Ot(r, t, u, s), cs(r, t, u));
  } };
  function am(t, r, s, u, m, y, _) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(u, y, _) : r.prototype && r.prototype.isPureReactComponent ? !Fo(s, u) || !Fo(m, y) : !0;
  }
  function lm(t, r, s) {
    var u = !1, m = kn, y = r.contextType;
    return typeof y == "object" && y !== null ? y = kt(y) : (m = ut(r) ? Zn : qe.current, u = r.contextTypes, y = (u = u != null) ? Or(t, m) : kn), r = new r(s, y), t.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = vs, t.stateNode = r, r._reactInternals = t, u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = m, t.__reactInternalMemoizedMaskedChildContext = y), r;
  }
  function um(t, r, s, u) {
    t = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(s, u), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(s, u), r.state !== t && vs.enqueueReplaceState(r, r.state, null);
  }
  function au(t, r, s, u) {
    var m = t.stateNode;
    m.props = s, m.state = t.memoizedState, m.refs = {}, Kl(t);
    var y = r.contextType;
    typeof y == "object" && y !== null ? m.context = kt(y) : (y = ut(r) ? Zn : qe.current, m.context = Or(t, y)), m.state = t.memoizedState, y = r.getDerivedStateFromProps, typeof y == "function" && (su(t, r, y, s), m.state = t.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof m.getSnapshotBeforeUpdate == "function" || typeof m.UNSAFE_componentWillMount != "function" && typeof m.componentWillMount != "function" || (r = m.state, typeof m.componentWillMount == "function" && m.componentWillMount(), typeof m.UNSAFE_componentWillMount == "function" && m.UNSAFE_componentWillMount(), r !== m.state && vs.enqueueReplaceState(m, m.state, null), ds(t, s, m, u), m.state = t.memoizedState), typeof m.componentDidMount == "function" && (t.flags |= 4194308);
  }
  function Wr(t, r) {
    try {
      var s = "", u = r;
      do
        s += he(u), u = u.return;
      while (u);
      var m = s;
    } catch (y) {
      m = `
Error generating stack: ` + y.message + `
` + y.stack;
    }
    return { value: t, source: r, stack: m, digest: null };
  }
  function lu(t, r, s) {
    return { value: t, source: null, stack: s ?? null, digest: r ?? null };
  }
  function uu(t, r) {
    try {
      console.error(r.value);
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  var ax = typeof WeakMap == "function" ? WeakMap : Map;
  function cm(t, r, s) {
    s = ln(-1, s), s.tag = 3, s.payload = { element: null };
    var u = r.value;
    return s.callback = function() {
      As || (As = !0, ku = u), uu(t, r);
    }, s;
  }
  function dm(t, r, s) {
    s = ln(-1, s), s.tag = 3;
    var u = t.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var m = r.value;
      s.payload = function() {
        return u(m);
      }, s.callback = function() {
        uu(t, r);
      };
    }
    var y = t.stateNode;
    return y !== null && typeof y.componentDidCatch == "function" && (s.callback = function() {
      uu(t, r), typeof u != "function" && (bn === null ? bn = /* @__PURE__ */ new Set([this]) : bn.add(this));
      var _ = r.stack;
      this.componentDidCatch(r.value, { componentStack: _ !== null ? _ : "" });
    }), s;
  }
  function fm(t, r, s) {
    var u = t.pingCache;
    if (u === null) {
      u = t.pingCache = new ax();
      var m = /* @__PURE__ */ new Set();
      u.set(r, m);
    } else m = u.get(r), m === void 0 && (m = /* @__PURE__ */ new Set(), u.set(r, m));
    m.has(s) || (m.add(s), t = xx.bind(null, t, r, s), r.then(t, t));
  }
  function pm(t) {
    do {
      var r;
      if ((r = t.tag === 13) && (r = t.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r) return t;
      t = t.return;
    } while (t !== null);
    return null;
  }
  function mm(t, r, s, u, m) {
    return (t.mode & 1) === 0 ? (t === r ? t.flags |= 65536 : (t.flags |= 128, s.flags |= 131072, s.flags &= -52805, s.tag === 1 && (s.alternate === null ? s.tag = 17 : (r = ln(-1, 1), r.tag = 2, Pn(s, r, 1))), s.lanes |= 1), t) : (t.flags |= 65536, t.lanes = m, t);
  }
  var lx = N.ReactCurrentOwner, ct = !1;
  function rt(t, r, s, u) {
    r.child = t === null ? Ip(r, null, s, u) : zr(r, t.child, s, u);
  }
  function hm(t, r, s, u, m) {
    s = s.render;
    var y = r.ref;
    return Ur(r, m), u = eu(t, r, s, u, y, m), s = tu(), t !== null && !ct ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~m, un(t, r, m)) : (Re && s && Ol(r), r.flags |= 1, rt(t, r, u, m), r.child);
  }
  function ym(t, r, s, u, m) {
    if (t === null) {
      var y = s.type;
      return typeof y == "function" && !Ru(y) && y.defaultProps === void 0 && s.compare === null && s.defaultProps === void 0 ? (r.tag = 15, r.type = y, gm(t, r, y, u, m)) : (t = Rs(s.type, null, u, r, r.mode, m), t.ref = r.ref, t.return = r, r.child = t);
    }
    if (y = t.child, (t.lanes & m) === 0) {
      var _ = y.memoizedProps;
      if (s = s.compare, s = s !== null ? s : Fo, s(_, u) && t.ref === r.ref) return un(t, r, m);
    }
    return r.flags |= 1, t = Nn(y, u), t.ref = r.ref, t.return = r, r.child = t;
  }
  function gm(t, r, s, u, m) {
    if (t !== null) {
      var y = t.memoizedProps;
      if (Fo(y, u) && t.ref === r.ref) if (ct = !1, r.pendingProps = u = y, (t.lanes & m) !== 0) (t.flags & 131072) !== 0 && (ct = !0);
      else return r.lanes = t.lanes, un(t, r, m);
    }
    return cu(t, r, s, u, m);
  }
  function vm(t, r, s) {
    var u = r.pendingProps, m = u.children, y = t !== null ? t.memoizedState : null;
    if (u.mode === "hidden") if ((r.mode & 1) === 0) r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Ce(Kr, St), St |= s;
    else {
      if ((s & 1073741824) === 0) return t = y !== null ? y.baseLanes | s : s, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: t, cachePool: null, transitions: null }, r.updateQueue = null, Ce(Kr, St), St |= t, null;
      r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, u = y !== null ? y.baseLanes : s, Ce(Kr, St), St |= u;
    }
    else y !== null ? (u = y.baseLanes | s, r.memoizedState = null) : u = s, Ce(Kr, St), St |= u;
    return rt(t, r, m, s), r.child;
  }
  function Sm(t, r) {
    var s = r.ref;
    (t === null && s !== null || t !== null && t.ref !== s) && (r.flags |= 512, r.flags |= 2097152);
  }
  function cu(t, r, s, u, m) {
    var y = ut(s) ? Zn : qe.current;
    return y = Or(r, y), Ur(r, m), s = eu(t, r, s, u, y, m), u = tu(), t !== null && !ct ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~m, un(t, r, m)) : (Re && u && Ol(r), r.flags |= 1, rt(t, r, s, m), r.child);
  }
  function wm(t, r, s, u, m) {
    if (ut(s)) {
      var y = !0;
      ns(r);
    } else y = !1;
    if (Ur(r, m), r.stateNode === null) ws(t, r), lm(r, s, u), au(r, s, u, m), u = !0;
    else if (t === null) {
      var _ = r.stateNode, P = r.memoizedProps;
      _.props = P;
      var b = _.context, F = s.contextType;
      typeof F == "object" && F !== null ? F = kt(F) : (F = ut(s) ? Zn : qe.current, F = Or(r, F));
      var z = s.getDerivedStateFromProps, H = typeof z == "function" || typeof _.getSnapshotBeforeUpdate == "function";
      H || typeof _.UNSAFE_componentWillReceiveProps != "function" && typeof _.componentWillReceiveProps != "function" || (P !== u || b !== F) && um(r, _, u, F), Cn = !1;
      var B = r.memoizedState;
      _.state = B, ds(r, u, _, m), b = r.memoizedState, P !== u || B !== b || lt.current || Cn ? (typeof z == "function" && (su(r, s, z, u), b = r.memoizedState), (P = Cn || am(r, s, P, u, B, b, F)) ? (H || typeof _.UNSAFE_componentWillMount != "function" && typeof _.componentWillMount != "function" || (typeof _.componentWillMount == "function" && _.componentWillMount(), typeof _.UNSAFE_componentWillMount == "function" && _.UNSAFE_componentWillMount()), typeof _.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof _.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = u, r.memoizedState = b), _.props = u, _.state = b, _.context = F, u = P) : (typeof _.componentDidMount == "function" && (r.flags |= 4194308), u = !1);
    } else {
      _ = r.stateNode, Fp(t, r), P = r.memoizedProps, F = r.type === r.elementType ? P : It(r.type, P), _.props = F, H = r.pendingProps, B = _.context, b = s.contextType, typeof b == "object" && b !== null ? b = kt(b) : (b = ut(s) ? Zn : qe.current, b = Or(r, b));
      var J = s.getDerivedStateFromProps;
      (z = typeof J == "function" || typeof _.getSnapshotBeforeUpdate == "function") || typeof _.UNSAFE_componentWillReceiveProps != "function" && typeof _.componentWillReceiveProps != "function" || (P !== H || B !== b) && um(r, _, u, b), Cn = !1, B = r.memoizedState, _.state = B, ds(r, u, _, m);
      var te = r.memoizedState;
      P !== H || B !== te || lt.current || Cn ? (typeof J == "function" && (su(r, s, J, u), te = r.memoizedState), (F = Cn || am(r, s, F, u, B, te, b) || !1) ? (z || typeof _.UNSAFE_componentWillUpdate != "function" && typeof _.componentWillUpdate != "function" || (typeof _.componentWillUpdate == "function" && _.componentWillUpdate(u, te, b), typeof _.UNSAFE_componentWillUpdate == "function" && _.UNSAFE_componentWillUpdate(u, te, b)), typeof _.componentDidUpdate == "function" && (r.flags |= 4), typeof _.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof _.componentDidUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 4), typeof _.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 1024), r.memoizedProps = u, r.memoizedState = te), _.props = u, _.state = te, _.context = b, u = F) : (typeof _.componentDidUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 4), typeof _.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 1024), u = !1);
    }
    return du(t, r, s, u, y, m);
  }
  function du(t, r, s, u, m, y) {
    Sm(t, r);
    var _ = (r.flags & 128) !== 0;
    if (!u && !_) return m && Ap(r, s, !1), un(t, r, y);
    u = r.stateNode, lx.current = r;
    var P = _ && typeof s.getDerivedStateFromError != "function" ? null : u.render();
    return r.flags |= 1, t !== null && _ ? (r.child = zr(r, t.child, null, y), r.child = zr(r, null, P, y)) : rt(t, r, P, y), r.memoizedState = u.state, m && Ap(r, s, !0), r.child;
  }
  function xm(t) {
    var r = t.stateNode;
    r.pendingContext ? Tp(t, r.pendingContext, r.pendingContext !== r.context) : r.context && Tp(t, r.context, !1), Yl(t, r.containerInfo);
  }
  function _m(t, r, s, u, m) {
    return Br(), zl(m), r.flags |= 256, rt(t, r, s, u), r.child;
  }
  var fu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function pu(t) {
    return { baseLanes: t, cachePool: null, transitions: null };
  }
  function Tm(t, r, s) {
    var u = r.pendingProps, m = De.current, y = !1, _ = (r.flags & 128) !== 0, P;
    if ((P = _) || (P = t !== null && t.memoizedState === null ? !1 : (m & 2) !== 0), P ? (y = !0, r.flags &= -129) : (t === null || t.memoizedState !== null) && (m |= 1), Ce(De, m & 1), t === null)
      return Bl(r), t = r.memoizedState, t !== null && (t = t.dehydrated, t !== null) ? ((r.mode & 1) === 0 ? r.lanes = 1 : t.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824, null) : (_ = u.children, t = u.fallback, y ? (u = r.mode, y = r.child, _ = { mode: "hidden", children: _ }, (u & 1) === 0 && y !== null ? (y.childLanes = 0, y.pendingProps = _) : y = Ds(_, u, 0, null), t = ar(t, u, s, null), y.return = r, t.return = r, y.sibling = t, r.child = y, r.child.memoizedState = pu(s), r.memoizedState = fu, t) : mu(r, _));
    if (m = t.memoizedState, m !== null && (P = m.dehydrated, P !== null)) return ux(t, r, _, u, P, m, s);
    if (y) {
      y = u.fallback, _ = r.mode, m = t.child, P = m.sibling;
      var b = { mode: "hidden", children: u.children };
      return (_ & 1) === 0 && r.child !== m ? (u = r.child, u.childLanes = 0, u.pendingProps = b, r.deletions = null) : (u = Nn(m, b), u.subtreeFlags = m.subtreeFlags & 14680064), P !== null ? y = Nn(P, y) : (y = ar(y, _, s, null), y.flags |= 2), y.return = r, u.return = r, u.sibling = y, r.child = u, u = y, y = r.child, _ = t.child.memoizedState, _ = _ === null ? pu(s) : { baseLanes: _.baseLanes | s, cachePool: null, transitions: _.transitions }, y.memoizedState = _, y.childLanes = t.childLanes & ~s, r.memoizedState = fu, u;
    }
    return y = t.child, t = y.sibling, u = Nn(y, { mode: "visible", children: u.children }), (r.mode & 1) === 0 && (u.lanes = s), u.return = r, u.sibling = null, t !== null && (s = r.deletions, s === null ? (r.deletions = [t], r.flags |= 16) : s.push(t)), r.child = u, r.memoizedState = null, u;
  }
  function mu(t, r) {
    return r = Ds({ mode: "visible", children: r }, t.mode, 0, null), r.return = t, t.child = r;
  }
  function Ss(t, r, s, u) {
    return u !== null && zl(u), zr(r, t.child, null, s), t = mu(r, r.pendingProps.children), t.flags |= 2, r.memoizedState = null, t;
  }
  function ux(t, r, s, u, m, y, _) {
    if (s)
      return r.flags & 256 ? (r.flags &= -257, u = lu(Error(o(422))), Ss(t, r, _, u)) : r.memoizedState !== null ? (r.child = t.child, r.flags |= 128, null) : (y = u.fallback, m = r.mode, u = Ds({ mode: "visible", children: u.children }, m, 0, null), y = ar(y, m, _, null), y.flags |= 2, u.return = r, y.return = r, u.sibling = y, r.child = u, (r.mode & 1) !== 0 && zr(r, t.child, null, _), r.child.memoizedState = pu(_), r.memoizedState = fu, y);
    if ((r.mode & 1) === 0) return Ss(t, r, _, null);
    if (m.data === "$!") {
      if (u = m.nextSibling && m.nextSibling.dataset, u) var P = u.dgst;
      return u = P, y = Error(o(419)), u = lu(y, u, void 0), Ss(t, r, _, u);
    }
    if (P = (_ & t.childLanes) !== 0, ct || P) {
      if (u = We, u !== null) {
        switch (_ & -_) {
          case 4:
            m = 2;
            break;
          case 16:
            m = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            m = 32;
            break;
          case 536870912:
            m = 268435456;
            break;
          default:
            m = 0;
        }
        m = (m & (u.suspendedLanes | _)) !== 0 ? 0 : m, m !== 0 && m !== y.retryLane && (y.retryLane = m, an(t, m), Ot(u, t, m, -1));
      }
      return Mu(), u = lu(Error(o(421))), Ss(t, r, _, u);
    }
    return m.data === "$?" ? (r.flags |= 128, r.child = t.child, r = _x.bind(null, t), m._reactRetry = r, null) : (t = y.treeContext, vt = _n(m.nextSibling), gt = r, Re = !0, Nt = null, t !== null && (_t[Tt++] = on, _t[Tt++] = sn, _t[Tt++] = Jn, on = t.id, sn = t.overflow, Jn = r), r = mu(r, u.children), r.flags |= 4096, r);
  }
  function km(t, r, s) {
    t.lanes |= r;
    var u = t.alternate;
    u !== null && (u.lanes |= r), Wl(t.return, r, s);
  }
  function hu(t, r, s, u, m) {
    var y = t.memoizedState;
    y === null ? t.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: u, tail: s, tailMode: m } : (y.isBackwards = r, y.rendering = null, y.renderingStartTime = 0, y.last = u, y.tail = s, y.tailMode = m);
  }
  function Am(t, r, s) {
    var u = r.pendingProps, m = u.revealOrder, y = u.tail;
    if (rt(t, r, u.children, s), u = De.current, (u & 2) !== 0) u = u & 1 | 2, r.flags |= 128;
    else {
      if (t !== null && (t.flags & 128) !== 0) e: for (t = r.child; t !== null; ) {
        if (t.tag === 13) t.memoizedState !== null && km(t, s, r);
        else if (t.tag === 19) km(t, s, r);
        else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === r) break e;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === r) break e;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      u &= 1;
    }
    if (Ce(De, u), (r.mode & 1) === 0) r.memoizedState = null;
    else switch (m) {
      case "forwards":
        for (s = r.child, m = null; s !== null; ) t = s.alternate, t !== null && fs(t) === null && (m = s), s = s.sibling;
        s = m, s === null ? (m = r.child, r.child = null) : (m = s.sibling, s.sibling = null), hu(r, !1, m, s, y);
        break;
      case "backwards":
        for (s = null, m = r.child, r.child = null; m !== null; ) {
          if (t = m.alternate, t !== null && fs(t) === null) {
            r.child = m;
            break;
          }
          t = m.sibling, m.sibling = s, s = m, m = t;
        }
        hu(r, !0, s, null, y);
        break;
      case "together":
        hu(r, !1, null, null, void 0);
        break;
      default:
        r.memoizedState = null;
    }
    return r.child;
  }
  function ws(t, r) {
    (r.mode & 1) === 0 && t !== null && (t.alternate = null, r.alternate = null, r.flags |= 2);
  }
  function un(t, r, s) {
    if (t !== null && (r.dependencies = t.dependencies), rr |= r.lanes, (s & r.childLanes) === 0) return null;
    if (t !== null && r.child !== t.child) throw Error(o(153));
    if (r.child !== null) {
      for (t = r.child, s = Nn(t, t.pendingProps), r.child = s, s.return = r; t.sibling !== null; ) t = t.sibling, s = s.sibling = Nn(t, t.pendingProps), s.return = r;
      s.sibling = null;
    }
    return r.child;
  }
  function cx(t, r, s) {
    switch (r.tag) {
      case 3:
        xm(r), Br();
        break;
      case 5:
        Vp(r);
        break;
      case 1:
        ut(r.type) && ns(r);
        break;
      case 4:
        Yl(r, r.stateNode.containerInfo);
        break;
      case 10:
        var u = r.type._context, m = r.memoizedProps.value;
        Ce(ls, u._currentValue), u._currentValue = m;
        break;
      case 13:
        if (u = r.memoizedState, u !== null)
          return u.dehydrated !== null ? (Ce(De, De.current & 1), r.flags |= 128, null) : (s & r.child.childLanes) !== 0 ? Tm(t, r, s) : (Ce(De, De.current & 1), t = un(t, r, s), t !== null ? t.sibling : null);
        Ce(De, De.current & 1);
        break;
      case 19:
        if (u = (s & r.childLanes) !== 0, (t.flags & 128) !== 0) {
          if (u) return Am(t, r, s);
          r.flags |= 128;
        }
        if (m = r.memoizedState, m !== null && (m.rendering = null, m.tail = null, m.lastEffect = null), Ce(De, De.current), u) break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, vm(t, r, s);
    }
    return un(t, r, s);
  }
  var Cm, yu, Pm, Em;
  Cm = function(t, r) {
    for (var s = r.child; s !== null; ) {
      if (s.tag === 5 || s.tag === 6) t.appendChild(s.stateNode);
      else if (s.tag !== 4 && s.child !== null) {
        s.child.return = s, s = s.child;
        continue;
      }
      if (s === r) break;
      for (; s.sibling === null; ) {
        if (s.return === null || s.return === r) return;
        s = s.return;
      }
      s.sibling.return = s.return, s = s.sibling;
    }
  }, yu = function() {
  }, Pm = function(t, r, s, u) {
    var m = t.memoizedProps;
    if (m !== u) {
      t = r.stateNode, tr(Ht.current);
      var y = null;
      switch (s) {
        case "input":
          m = Wa(t, m), u = Wa(t, u), y = [];
          break;
        case "select":
          m = Y({}, m, { value: void 0 }), u = Y({}, u, { value: void 0 }), y = [];
          break;
        case "textarea":
          m = Ya(t, m), u = Ya(t, u), y = [];
          break;
        default:
          typeof m.onClick != "function" && typeof u.onClick == "function" && (t.onclick = qi);
      }
      Xa(s, u);
      var _;
      s = null;
      for (F in m) if (!u.hasOwnProperty(F) && m.hasOwnProperty(F) && m[F] != null) if (F === "style") {
        var P = m[F];
        for (_ in P) P.hasOwnProperty(_) && (s || (s = {}), s[_] = "");
      } else F !== "dangerouslySetInnerHTML" && F !== "children" && F !== "suppressContentEditableWarning" && F !== "suppressHydrationWarning" && F !== "autoFocus" && (a.hasOwnProperty(F) ? y || (y = []) : (y = y || []).push(F, null));
      for (F in u) {
        var b = u[F];
        if (P = m != null ? m[F] : void 0, u.hasOwnProperty(F) && b !== P && (b != null || P != null)) if (F === "style") if (P) {
          for (_ in P) !P.hasOwnProperty(_) || b && b.hasOwnProperty(_) || (s || (s = {}), s[_] = "");
          for (_ in b) b.hasOwnProperty(_) && P[_] !== b[_] && (s || (s = {}), s[_] = b[_]);
        } else s || (y || (y = []), y.push(
          F,
          s
        )), s = b;
        else F === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, P = P ? P.__html : void 0, b != null && P !== b && (y = y || []).push(F, b)) : F === "children" ? typeof b != "string" && typeof b != "number" || (y = y || []).push(F, "" + b) : F !== "suppressContentEditableWarning" && F !== "suppressHydrationWarning" && (a.hasOwnProperty(F) ? (b != null && F === "onScroll" && Pe("scroll", t), y || P === b || (y = [])) : (y = y || []).push(F, b));
      }
      s && (y = y || []).push("style", s);
      var F = y;
      (r.updateQueue = F) && (r.flags |= 4);
    }
  }, Em = function(t, r, s, u) {
    s !== u && (r.flags |= 4);
  };
  function Zo(t, r) {
    if (!Re) switch (t.tailMode) {
      case "hidden":
        r = t.tail;
        for (var s = null; r !== null; ) r.alternate !== null && (s = r), r = r.sibling;
        s === null ? t.tail = null : s.sibling = null;
        break;
      case "collapsed":
        s = t.tail;
        for (var u = null; s !== null; ) s.alternate !== null && (u = s), s = s.sibling;
        u === null ? r || t.tail === null ? t.tail = null : t.tail.sibling = null : u.sibling = null;
    }
  }
  function tt(t) {
    var r = t.alternate !== null && t.alternate.child === t.child, s = 0, u = 0;
    if (r) for (var m = t.child; m !== null; ) s |= m.lanes | m.childLanes, u |= m.subtreeFlags & 14680064, u |= m.flags & 14680064, m.return = t, m = m.sibling;
    else for (m = t.child; m !== null; ) s |= m.lanes | m.childLanes, u |= m.subtreeFlags, u |= m.flags, m.return = t, m = m.sibling;
    return t.subtreeFlags |= u, t.childLanes = s, r;
  }
  function dx(t, r, s) {
    var u = r.pendingProps;
    switch (Ll(r), r.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return tt(r), null;
      case 1:
        return ut(r.type) && ts(), tt(r), null;
      case 3:
        return u = r.stateNode, Hr(), Ee(lt), Ee(qe), Zl(), u.pendingContext && (u.context = u.pendingContext, u.pendingContext = null), (t === null || t.child === null) && (ss(r) ? r.flags |= 4 : t === null || t.memoizedState.isDehydrated && (r.flags & 256) === 0 || (r.flags |= 1024, Nt !== null && (Pu(Nt), Nt = null))), yu(t, r), tt(r), null;
      case 5:
        Ql(r);
        var m = tr(Go.current);
        if (s = r.type, t !== null && r.stateNode != null) Pm(t, r, s, u, m), t.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!u) {
            if (r.stateNode === null) throw Error(o(166));
            return tt(r), null;
          }
          if (t = tr(Ht.current), ss(r)) {
            u = r.stateNode, s = r.type;
            var y = r.memoizedProps;
            switch (u[Ut] = r, u[zo] = y, t = (r.mode & 1) !== 0, s) {
              case "dialog":
                Pe("cancel", u), Pe("close", u);
                break;
              case "iframe":
              case "object":
              case "embed":
                Pe("load", u);
                break;
              case "video":
              case "audio":
                for (m = 0; m < Lo.length; m++) Pe(Lo[m], u);
                break;
              case "source":
                Pe("error", u);
                break;
              case "img":
              case "image":
              case "link":
                Pe(
                  "error",
                  u
                ), Pe("load", u);
                break;
              case "details":
                Pe("toggle", u);
                break;
              case "input":
                lf(u, y), Pe("invalid", u);
                break;
              case "select":
                u._wrapperState = { wasMultiple: !!y.multiple }, Pe("invalid", u);
                break;
              case "textarea":
                df(u, y), Pe("invalid", u);
            }
            Xa(s, y), m = null;
            for (var _ in y) if (y.hasOwnProperty(_)) {
              var P = y[_];
              _ === "children" ? typeof P == "string" ? u.textContent !== P && (y.suppressHydrationWarning !== !0 && Ji(u.textContent, P, t), m = ["children", P]) : typeof P == "number" && u.textContent !== "" + P && (y.suppressHydrationWarning !== !0 && Ji(
                u.textContent,
                P,
                t
              ), m = ["children", "" + P]) : a.hasOwnProperty(_) && P != null && _ === "onScroll" && Pe("scroll", u);
            }
            switch (s) {
              case "input":
                bi(u), cf(u, y, !0);
                break;
              case "textarea":
                bi(u), pf(u);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof y.onClick == "function" && (u.onclick = qi);
            }
            u = m, r.updateQueue = u, u !== null && (r.flags |= 4);
          } else {
            _ = m.nodeType === 9 ? m : m.ownerDocument, t === "http://www.w3.org/1999/xhtml" && (t = mf(s)), t === "http://www.w3.org/1999/xhtml" ? s === "script" ? (t = _.createElement("div"), t.innerHTML = "<script><\/script>", t = t.removeChild(t.firstChild)) : typeof u.is == "string" ? t = _.createElement(s, { is: u.is }) : (t = _.createElement(s), s === "select" && (_ = t, u.multiple ? _.multiple = !0 : u.size && (_.size = u.size))) : t = _.createElementNS(t, s), t[Ut] = r, t[zo] = u, Cm(t, r, !1, !1), r.stateNode = t;
            e: {
              switch (_ = Za(s, u), s) {
                case "dialog":
                  Pe("cancel", t), Pe("close", t), m = u;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Pe("load", t), m = u;
                  break;
                case "video":
                case "audio":
                  for (m = 0; m < Lo.length; m++) Pe(Lo[m], t);
                  m = u;
                  break;
                case "source":
                  Pe("error", t), m = u;
                  break;
                case "img":
                case "image":
                case "link":
                  Pe(
                    "error",
                    t
                  ), Pe("load", t), m = u;
                  break;
                case "details":
                  Pe("toggle", t), m = u;
                  break;
                case "input":
                  lf(t, u), m = Wa(t, u), Pe("invalid", t);
                  break;
                case "option":
                  m = u;
                  break;
                case "select":
                  t._wrapperState = { wasMultiple: !!u.multiple }, m = Y({}, u, { value: void 0 }), Pe("invalid", t);
                  break;
                case "textarea":
                  df(t, u), m = Ya(t, u), Pe("invalid", t);
                  break;
                default:
                  m = u;
              }
              Xa(s, m), P = m;
              for (y in P) if (P.hasOwnProperty(y)) {
                var b = P[y];
                y === "style" ? gf(t, b) : y === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, b != null && hf(t, b)) : y === "children" ? typeof b == "string" ? (s !== "textarea" || b !== "") && So(t, b) : typeof b == "number" && So(t, "" + b) : y !== "suppressContentEditableWarning" && y !== "suppressHydrationWarning" && y !== "autoFocus" && (a.hasOwnProperty(y) ? b != null && y === "onScroll" && Pe("scroll", t) : b != null && R(t, y, b, _));
              }
              switch (s) {
                case "input":
                  bi(t), cf(t, u, !1);
                  break;
                case "textarea":
                  bi(t), pf(t);
                  break;
                case "option":
                  u.value != null && t.setAttribute("value", "" + we(u.value));
                  break;
                case "select":
                  t.multiple = !!u.multiple, y = u.value, y != null ? Ar(t, !!u.multiple, y, !1) : u.defaultValue != null && Ar(
                    t,
                    !!u.multiple,
                    u.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof m.onClick == "function" && (t.onclick = qi);
              }
              switch (s) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  u = !!u.autoFocus;
                  break e;
                case "img":
                  u = !0;
                  break e;
                default:
                  u = !1;
              }
            }
            u && (r.flags |= 4);
          }
          r.ref !== null && (r.flags |= 512, r.flags |= 2097152);
        }
        return tt(r), null;
      case 6:
        if (t && r.stateNode != null) Em(t, r, t.memoizedProps, u);
        else {
          if (typeof u != "string" && r.stateNode === null) throw Error(o(166));
          if (s = tr(Go.current), tr(Ht.current), ss(r)) {
            if (u = r.stateNode, s = r.memoizedProps, u[Ut] = r, (y = u.nodeValue !== s) && (t = gt, t !== null)) switch (t.tag) {
              case 3:
                Ji(u.nodeValue, s, (t.mode & 1) !== 0);
                break;
              case 5:
                t.memoizedProps.suppressHydrationWarning !== !0 && Ji(u.nodeValue, s, (t.mode & 1) !== 0);
            }
            y && (r.flags |= 4);
          } else u = (s.nodeType === 9 ? s : s.ownerDocument).createTextNode(u), u[Ut] = r, r.stateNode = u;
        }
        return tt(r), null;
      case 13:
        if (Ee(De), u = r.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (Re && vt !== null && (r.mode & 1) !== 0 && (r.flags & 128) === 0) Rp(), Br(), r.flags |= 98560, y = !1;
          else if (y = ss(r), u !== null && u.dehydrated !== null) {
            if (t === null) {
              if (!y) throw Error(o(318));
              if (y = r.memoizedState, y = y !== null ? y.dehydrated : null, !y) throw Error(o(317));
              y[Ut] = r;
            } else Br(), (r.flags & 128) === 0 && (r.memoizedState = null), r.flags |= 4;
            tt(r), y = !1;
          } else Nt !== null && (Pu(Nt), Nt = null), y = !0;
          if (!y) return r.flags & 65536 ? r : null;
        }
        return (r.flags & 128) !== 0 ? (r.lanes = s, r) : (u = u !== null, u !== (t !== null && t.memoizedState !== null) && u && (r.child.flags |= 8192, (r.mode & 1) !== 0 && (t === null || (De.current & 1) !== 0 ? ze === 0 && (ze = 3) : Mu())), r.updateQueue !== null && (r.flags |= 4), tt(r), null);
      case 4:
        return Hr(), yu(t, r), t === null && Vo(r.stateNode.containerInfo), tt(r), null;
      case 10:
        return Hl(r.type._context), tt(r), null;
      case 17:
        return ut(r.type) && ts(), tt(r), null;
      case 19:
        if (Ee(De), y = r.memoizedState, y === null) return tt(r), null;
        if (u = (r.flags & 128) !== 0, _ = y.rendering, _ === null) if (u) Zo(y, !1);
        else {
          if (ze !== 0 || t !== null && (t.flags & 128) !== 0) for (t = r.child; t !== null; ) {
            if (_ = fs(t), _ !== null) {
              for (r.flags |= 128, Zo(y, !1), u = _.updateQueue, u !== null && (r.updateQueue = u, r.flags |= 4), r.subtreeFlags = 0, u = s, s = r.child; s !== null; ) y = s, t = u, y.flags &= 14680066, _ = y.alternate, _ === null ? (y.childLanes = 0, y.lanes = t, y.child = null, y.subtreeFlags = 0, y.memoizedProps = null, y.memoizedState = null, y.updateQueue = null, y.dependencies = null, y.stateNode = null) : (y.childLanes = _.childLanes, y.lanes = _.lanes, y.child = _.child, y.subtreeFlags = 0, y.deletions = null, y.memoizedProps = _.memoizedProps, y.memoizedState = _.memoizedState, y.updateQueue = _.updateQueue, y.type = _.type, t = _.dependencies, y.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), s = s.sibling;
              return Ce(De, De.current & 1 | 2), r.child;
            }
            t = t.sibling;
          }
          y.tail !== null && Fe() > Yr && (r.flags |= 128, u = !0, Zo(y, !1), r.lanes = 4194304);
        }
        else {
          if (!u) if (t = fs(_), t !== null) {
            if (r.flags |= 128, u = !0, s = t.updateQueue, s !== null && (r.updateQueue = s, r.flags |= 4), Zo(y, !0), y.tail === null && y.tailMode === "hidden" && !_.alternate && !Re) return tt(r), null;
          } else 2 * Fe() - y.renderingStartTime > Yr && s !== 1073741824 && (r.flags |= 128, u = !0, Zo(y, !1), r.lanes = 4194304);
          y.isBackwards ? (_.sibling = r.child, r.child = _) : (s = y.last, s !== null ? s.sibling = _ : r.child = _, y.last = _);
        }
        return y.tail !== null ? (r = y.tail, y.rendering = r, y.tail = r.sibling, y.renderingStartTime = Fe(), r.sibling = null, s = De.current, Ce(De, u ? s & 1 | 2 : s & 1), r) : (tt(r), null);
      case 22:
      case 23:
        return bu(), u = r.memoizedState !== null, t !== null && t.memoizedState !== null !== u && (r.flags |= 8192), u && (r.mode & 1) !== 0 ? (St & 1073741824) !== 0 && (tt(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : tt(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(o(156, r.tag));
  }
  function fx(t, r) {
    switch (Ll(r), r.tag) {
      case 1:
        return ut(r.type) && ts(), t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 3:
        return Hr(), Ee(lt), Ee(qe), Zl(), t = r.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (r.flags = t & -65537 | 128, r) : null;
      case 5:
        return Ql(r), null;
      case 13:
        if (Ee(De), t = r.memoizedState, t !== null && t.dehydrated !== null) {
          if (r.alternate === null) throw Error(o(340));
          Br();
        }
        return t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 19:
        return Ee(De), null;
      case 4:
        return Hr(), null;
      case 10:
        return Hl(r.type._context), null;
      case 22:
      case 23:
        return bu(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var xs = !1, nt = !1, px = typeof WeakSet == "function" ? WeakSet : Set, ee = null;
  function Gr(t, r) {
    var s = t.ref;
    if (s !== null) if (typeof s == "function") try {
      s(null);
    } catch (u) {
      je(t, r, u);
    }
    else s.current = null;
  }
  function gu(t, r, s) {
    try {
      s();
    } catch (u) {
      je(t, r, u);
    }
  }
  var bm = !1;
  function mx(t, r) {
    if (bl = zi, t = ap(), xl(t)) {
      if ("selectionStart" in t) var s = { start: t.selectionStart, end: t.selectionEnd };
      else e: {
        s = (s = t.ownerDocument) && s.defaultView || window;
        var u = s.getSelection && s.getSelection();
        if (u && u.rangeCount !== 0) {
          s = u.anchorNode;
          var m = u.anchorOffset, y = u.focusNode;
          u = u.focusOffset;
          try {
            s.nodeType, y.nodeType;
          } catch {
            s = null;
            break e;
          }
          var _ = 0, P = -1, b = -1, F = 0, z = 0, H = t, B = null;
          t: for (; ; ) {
            for (var J; H !== s || m !== 0 && H.nodeType !== 3 || (P = _ + m), H !== y || u !== 0 && H.nodeType !== 3 || (b = _ + u), H.nodeType === 3 && (_ += H.nodeValue.length), (J = H.firstChild) !== null; )
              B = H, H = J;
            for (; ; ) {
              if (H === t) break t;
              if (B === s && ++F === m && (P = _), B === y && ++z === u && (b = _), (J = H.nextSibling) !== null) break;
              H = B, B = H.parentNode;
            }
            H = J;
          }
          s = P === -1 || b === -1 ? null : { start: P, end: b };
        } else s = null;
      }
      s = s || { start: 0, end: 0 };
    } else s = null;
    for (Ml = { focusedElem: t, selectionRange: s }, zi = !1, ee = r; ee !== null; ) if (r = ee, t = r.child, (r.subtreeFlags & 1028) !== 0 && t !== null) t.return = r, ee = t;
    else for (; ee !== null; ) {
      r = ee;
      try {
        var te = r.alternate;
        if ((r.flags & 1024) !== 0) switch (r.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (te !== null) {
              var re = te.memoizedProps, Oe = te.memoizedState, I = r.stateNode, M = I.getSnapshotBeforeUpdate(r.elementType === r.type ? re : It(r.type, re), Oe);
              I.__reactInternalSnapshotBeforeUpdate = M;
            }
            break;
          case 3:
            var j = r.stateNode.containerInfo;
            j.nodeType === 1 ? j.textContent = "" : j.nodeType === 9 && j.documentElement && j.removeChild(j.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(o(163));
        }
      } catch (W) {
        je(r, r.return, W);
      }
      if (t = r.sibling, t !== null) {
        t.return = r.return, ee = t;
        break;
      }
      ee = r.return;
    }
    return te = bm, bm = !1, te;
  }
  function Jo(t, r, s) {
    var u = r.updateQueue;
    if (u = u !== null ? u.lastEffect : null, u !== null) {
      var m = u = u.next;
      do {
        if ((m.tag & t) === t) {
          var y = m.destroy;
          m.destroy = void 0, y !== void 0 && gu(r, s, y);
        }
        m = m.next;
      } while (m !== u);
    }
  }
  function _s(t, r) {
    if (r = r.updateQueue, r = r !== null ? r.lastEffect : null, r !== null) {
      var s = r = r.next;
      do {
        if ((s.tag & t) === t) {
          var u = s.create;
          s.destroy = u();
        }
        s = s.next;
      } while (s !== r);
    }
  }
  function vu(t) {
    var r = t.ref;
    if (r !== null) {
      var s = t.stateNode;
      switch (t.tag) {
        case 5:
          t = s;
          break;
        default:
          t = s;
      }
      typeof r == "function" ? r(t) : r.current = t;
    }
  }
  function Mm(t) {
    var r = t.alternate;
    r !== null && (t.alternate = null, Mm(r)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (r = t.stateNode, r !== null && (delete r[Ut], delete r[zo], delete r[Il], delete r[Xw], delete r[Zw])), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  function Rm(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 4;
  }
  function Dm(t) {
    e: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || Rm(t.return)) return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
        if (t.flags & 2 || t.child === null || t.tag === 4) continue e;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function Su(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.nodeType === 8 ? s.parentNode.insertBefore(t, r) : s.insertBefore(t, r) : (s.nodeType === 8 ? (r = s.parentNode, r.insertBefore(t, s)) : (r = s, r.appendChild(t)), s = s._reactRootContainer, s != null || r.onclick !== null || (r.onclick = qi));
    else if (u !== 4 && (t = t.child, t !== null)) for (Su(t, r, s), t = t.sibling; t !== null; ) Su(t, r, s), t = t.sibling;
  }
  function wu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.insertBefore(t, r) : s.appendChild(t);
    else if (u !== 4 && (t = t.child, t !== null)) for (wu(t, r, s), t = t.sibling; t !== null; ) wu(t, r, s), t = t.sibling;
  }
  var Qe = null, jt = !1;
  function En(t, r, s) {
    for (s = s.child; s !== null; ) Nm(t, r, s), s = s.sibling;
  }
  function Nm(t, r, s) {
    if ($t && typeof $t.onCommitFiberUnmount == "function") try {
      $t.onCommitFiberUnmount(ji, s);
    } catch {
    }
    switch (s.tag) {
      case 5:
        nt || Gr(s, r);
      case 6:
        var u = Qe, m = jt;
        Qe = null, En(t, r, s), Qe = u, jt = m, Qe !== null && (jt ? (t = Qe, s = s.stateNode, t.nodeType === 8 ? t.parentNode.removeChild(s) : t.removeChild(s)) : Qe.removeChild(s.stateNode));
        break;
      case 18:
        Qe !== null && (jt ? (t = Qe, s = s.stateNode, t.nodeType === 8 ? Nl(t.parentNode, s) : t.nodeType === 1 && Nl(t, s), Mo(t)) : Nl(Qe, s.stateNode));
        break;
      case 4:
        u = Qe, m = jt, Qe = s.stateNode.containerInfo, jt = !0, En(t, r, s), Qe = u, jt = m;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!nt && (u = s.updateQueue, u !== null && (u = u.lastEffect, u !== null))) {
          m = u = u.next;
          do {
            var y = m, _ = y.destroy;
            y = y.tag, _ !== void 0 && ((y & 2) !== 0 || (y & 4) !== 0) && gu(s, r, _), m = m.next;
          } while (m !== u);
        }
        En(t, r, s);
        break;
      case 1:
        if (!nt && (Gr(s, r), u = s.stateNode, typeof u.componentWillUnmount == "function")) try {
          u.props = s.memoizedProps, u.state = s.memoizedState, u.componentWillUnmount();
        } catch (P) {
          je(s, r, P);
        }
        En(t, r, s);
        break;
      case 21:
        En(t, r, s);
        break;
      case 22:
        s.mode & 1 ? (nt = (u = nt) || s.memoizedState !== null, En(t, r, s), nt = u) : En(t, r, s);
        break;
      default:
        En(t, r, s);
    }
  }
  function Im(t) {
    var r = t.updateQueue;
    if (r !== null) {
      t.updateQueue = null;
      var s = t.stateNode;
      s === null && (s = t.stateNode = new px()), r.forEach(function(u) {
        var m = Tx.bind(null, t, u);
        s.has(u) || (s.add(u), u.then(m, m));
      });
    }
  }
  function Ft(t, r) {
    var s = r.deletions;
    if (s !== null) for (var u = 0; u < s.length; u++) {
      var m = s[u];
      try {
        var y = t, _ = r, P = _;
        e: for (; P !== null; ) {
          switch (P.tag) {
            case 5:
              Qe = P.stateNode, jt = !1;
              break e;
            case 3:
              Qe = P.stateNode.containerInfo, jt = !0;
              break e;
            case 4:
              Qe = P.stateNode.containerInfo, jt = !0;
              break e;
          }
          P = P.return;
        }
        if (Qe === null) throw Error(o(160));
        Nm(y, _, m), Qe = null, jt = !1;
        var b = m.alternate;
        b !== null && (b.return = null), m.return = null;
      } catch (F) {
        je(m, r, F);
      }
    }
    if (r.subtreeFlags & 12854) for (r = r.child; r !== null; ) jm(r, t), r = r.sibling;
  }
  function jm(t, r) {
    var s = t.alternate, u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Ft(r, t), Gt(t), u & 4) {
          try {
            Jo(3, t, t.return), _s(3, t);
          } catch (re) {
            je(t, t.return, re);
          }
          try {
            Jo(5, t, t.return);
          } catch (re) {
            je(t, t.return, re);
          }
        }
        break;
      case 1:
        Ft(r, t), Gt(t), u & 512 && s !== null && Gr(s, s.return);
        break;
      case 5:
        if (Ft(r, t), Gt(t), u & 512 && s !== null && Gr(s, s.return), t.flags & 32) {
          var m = t.stateNode;
          try {
            So(m, "");
          } catch (re) {
            je(t, t.return, re);
          }
        }
        if (u & 4 && (m = t.stateNode, m != null)) {
          var y = t.memoizedProps, _ = s !== null ? s.memoizedProps : y, P = t.type, b = t.updateQueue;
          if (t.updateQueue = null, b !== null) try {
            P === "input" && y.type === "radio" && y.name != null && uf(m, y), Za(P, _);
            var F = Za(P, y);
            for (_ = 0; _ < b.length; _ += 2) {
              var z = b[_], H = b[_ + 1];
              z === "style" ? gf(m, H) : z === "dangerouslySetInnerHTML" ? hf(m, H) : z === "children" ? So(m, H) : R(m, z, H, F);
            }
            switch (P) {
              case "input":
                Ga(m, y);
                break;
              case "textarea":
                ff(m, y);
                break;
              case "select":
                var B = m._wrapperState.wasMultiple;
                m._wrapperState.wasMultiple = !!y.multiple;
                var J = y.value;
                J != null ? Ar(m, !!y.multiple, J, !1) : B !== !!y.multiple && (y.defaultValue != null ? Ar(
                  m,
                  !!y.multiple,
                  y.defaultValue,
                  !0
                ) : Ar(m, !!y.multiple, y.multiple ? [] : "", !1));
            }
            m[zo] = y;
          } catch (re) {
            je(t, t.return, re);
          }
        }
        break;
      case 6:
        if (Ft(r, t), Gt(t), u & 4) {
          if (t.stateNode === null) throw Error(o(162));
          m = t.stateNode, y = t.memoizedProps;
          try {
            m.nodeValue = y;
          } catch (re) {
            je(t, t.return, re);
          }
        }
        break;
      case 3:
        if (Ft(r, t), Gt(t), u & 4 && s !== null && s.memoizedState.isDehydrated) try {
          Mo(r.containerInfo);
        } catch (re) {
          je(t, t.return, re);
        }
        break;
      case 4:
        Ft(r, t), Gt(t);
        break;
      case 13:
        Ft(r, t), Gt(t), m = t.child, m.flags & 8192 && (y = m.memoizedState !== null, m.stateNode.isHidden = y, !y || m.alternate !== null && m.alternate.memoizedState !== null || (Tu = Fe())), u & 4 && Im(t);
        break;
      case 22:
        if (z = s !== null && s.memoizedState !== null, t.mode & 1 ? (nt = (F = nt) || z, Ft(r, t), nt = F) : Ft(r, t), Gt(t), u & 8192) {
          if (F = t.memoizedState !== null, (t.stateNode.isHidden = F) && !z && (t.mode & 1) !== 0) for (ee = t, z = t.child; z !== null; ) {
            for (H = ee = z; ee !== null; ) {
              switch (B = ee, J = B.child, B.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Jo(4, B, B.return);
                  break;
                case 1:
                  Gr(B, B.return);
                  var te = B.stateNode;
                  if (typeof te.componentWillUnmount == "function") {
                    u = B, s = B.return;
                    try {
                      r = u, te.props = r.memoizedProps, te.state = r.memoizedState, te.componentWillUnmount();
                    } catch (re) {
                      je(u, s, re);
                    }
                  }
                  break;
                case 5:
                  Gr(B, B.return);
                  break;
                case 22:
                  if (B.memoizedState !== null) {
                    Lm(H);
                    continue;
                  }
              }
              J !== null ? (J.return = B, ee = J) : Lm(H);
            }
            z = z.sibling;
          }
          e: for (z = null, H = t; ; ) {
            if (H.tag === 5) {
              if (z === null) {
                z = H;
                try {
                  m = H.stateNode, F ? (y = m.style, typeof y.setProperty == "function" ? y.setProperty("display", "none", "important") : y.display = "none") : (P = H.stateNode, b = H.memoizedProps.style, _ = b != null && b.hasOwnProperty("display") ? b.display : null, P.style.display = yf("display", _));
                } catch (re) {
                  je(t, t.return, re);
                }
              }
            } else if (H.tag === 6) {
              if (z === null) try {
                H.stateNode.nodeValue = F ? "" : H.memoizedProps;
              } catch (re) {
                je(t, t.return, re);
              }
            } else if ((H.tag !== 22 && H.tag !== 23 || H.memoizedState === null || H === t) && H.child !== null) {
              H.child.return = H, H = H.child;
              continue;
            }
            if (H === t) break e;
            for (; H.sibling === null; ) {
              if (H.return === null || H.return === t) break e;
              z === H && (z = null), H = H.return;
            }
            z === H && (z = null), H.sibling.return = H.return, H = H.sibling;
          }
        }
        break;
      case 19:
        Ft(r, t), Gt(t), u & 4 && Im(t);
        break;
      case 21:
        break;
      default:
        Ft(
          r,
          t
        ), Gt(t);
    }
  }
  function Gt(t) {
    var r = t.flags;
    if (r & 2) {
      try {
        e: {
          for (var s = t.return; s !== null; ) {
            if (Rm(s)) {
              var u = s;
              break e;
            }
            s = s.return;
          }
          throw Error(o(160));
        }
        switch (u.tag) {
          case 5:
            var m = u.stateNode;
            u.flags & 32 && (So(m, ""), u.flags &= -33);
            var y = Dm(t);
            wu(t, y, m);
            break;
          case 3:
          case 4:
            var _ = u.stateNode.containerInfo, P = Dm(t);
            Su(t, P, _);
            break;
          default:
            throw Error(o(161));
        }
      } catch (b) {
        je(t, t.return, b);
      }
      t.flags &= -3;
    }
    r & 4096 && (t.flags &= -4097);
  }
  function hx(t, r, s) {
    ee = t, Fm(t);
  }
  function Fm(t, r, s) {
    for (var u = (t.mode & 1) !== 0; ee !== null; ) {
      var m = ee, y = m.child;
      if (m.tag === 22 && u) {
        var _ = m.memoizedState !== null || xs;
        if (!_) {
          var P = m.alternate, b = P !== null && P.memoizedState !== null || nt;
          P = xs;
          var F = nt;
          if (xs = _, (nt = b) && !F) for (ee = m; ee !== null; ) _ = ee, b = _.child, _.tag === 22 && _.memoizedState !== null ? Vm(m) : b !== null ? (b.return = _, ee = b) : Vm(m);
          for (; y !== null; ) ee = y, Fm(y), y = y.sibling;
          ee = m, xs = P, nt = F;
        }
        Om(t);
      } else (m.subtreeFlags & 8772) !== 0 && y !== null ? (y.return = m, ee = y) : Om(t);
    }
  }
  function Om(t) {
    for (; ee !== null; ) {
      var r = ee;
      if ((r.flags & 8772) !== 0) {
        var s = r.alternate;
        try {
          if ((r.flags & 8772) !== 0) switch (r.tag) {
            case 0:
            case 11:
            case 15:
              nt || _s(5, r);
              break;
            case 1:
              var u = r.stateNode;
              if (r.flags & 4 && !nt) if (s === null) u.componentDidMount();
              else {
                var m = r.elementType === r.type ? s.memoizedProps : It(r.type, s.memoizedProps);
                u.componentDidUpdate(m, s.memoizedState, u.__reactInternalSnapshotBeforeUpdate);
              }
              var y = r.updateQueue;
              y !== null && Lp(r, y, u);
              break;
            case 3:
              var _ = r.updateQueue;
              if (_ !== null) {
                if (s = null, r.child !== null) switch (r.child.tag) {
                  case 5:
                    s = r.child.stateNode;
                    break;
                  case 1:
                    s = r.child.stateNode;
                }
                Lp(r, _, s);
              }
              break;
            case 5:
              var P = r.stateNode;
              if (s === null && r.flags & 4) {
                s = P;
                var b = r.memoizedProps;
                switch (r.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    b.autoFocus && s.focus();
                    break;
                  case "img":
                    b.src && (s.src = b.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (r.memoizedState === null) {
                var F = r.alternate;
                if (F !== null) {
                  var z = F.memoizedState;
                  if (z !== null) {
                    var H = z.dehydrated;
                    H !== null && Mo(H);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(o(163));
          }
          nt || r.flags & 512 && vu(r);
        } catch (B) {
          je(r, r.return, B);
        }
      }
      if (r === t) {
        ee = null;
        break;
      }
      if (s = r.sibling, s !== null) {
        s.return = r.return, ee = s;
        break;
      }
      ee = r.return;
    }
  }
  function Lm(t) {
    for (; ee !== null; ) {
      var r = ee;
      if (r === t) {
        ee = null;
        break;
      }
      var s = r.sibling;
      if (s !== null) {
        s.return = r.return, ee = s;
        break;
      }
      ee = r.return;
    }
  }
  function Vm(t) {
    for (; ee !== null; ) {
      var r = ee;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var s = r.return;
            try {
              _s(4, r);
            } catch (b) {
              je(r, s, b);
            }
            break;
          case 1:
            var u = r.stateNode;
            if (typeof u.componentDidMount == "function") {
              var m = r.return;
              try {
                u.componentDidMount();
              } catch (b) {
                je(r, m, b);
              }
            }
            var y = r.return;
            try {
              vu(r);
            } catch (b) {
              je(r, y, b);
            }
            break;
          case 5:
            var _ = r.return;
            try {
              vu(r);
            } catch (b) {
              je(r, _, b);
            }
        }
      } catch (b) {
        je(r, r.return, b);
      }
      if (r === t) {
        ee = null;
        break;
      }
      var P = r.sibling;
      if (P !== null) {
        P.return = r.return, ee = P;
        break;
      }
      ee = r.return;
    }
  }
  var yx = Math.ceil, Ts = N.ReactCurrentDispatcher, xu = N.ReactCurrentOwner, Ct = N.ReactCurrentBatchConfig, me = 0, We = null, Le = null, Xe = 0, St = 0, Kr = Tn(0), ze = 0, qo = null, rr = 0, ks = 0, _u = 0, ei = null, dt = null, Tu = 0, Yr = 1 / 0, cn = null, As = !1, ku = null, bn = null, Cs = !1, Mn = null, Ps = 0, ti = 0, Au = null, Es = -1, bs = 0;
  function ot() {
    return (me & 6) !== 0 ? Fe() : Es !== -1 ? Es : Es = Fe();
  }
  function Rn(t) {
    return (t.mode & 1) === 0 ? 1 : (me & 2) !== 0 && Xe !== 0 ? Xe & -Xe : qw.transition !== null ? (bs === 0 && (bs = Df()), bs) : (t = xe, t !== 0 || (t = window.event, t = t === void 0 ? 16 : zf(t.type)), t);
  }
  function Ot(t, r, s, u) {
    if (50 < ti) throw ti = 0, Au = null, Error(o(185));
    Ao(t, s, u), ((me & 2) === 0 || t !== We) && (t === We && ((me & 2) === 0 && (ks |= s), ze === 4 && Dn(t, Xe)), ft(t, u), s === 1 && me === 0 && (r.mode & 1) === 0 && (Yr = Fe() + 500, rs && An()));
  }
  function ft(t, r) {
    var s = t.callbackNode;
    qS(t, r);
    var u = Li(t, t === We ? Xe : 0);
    if (u === 0) s !== null && bf(s), t.callbackNode = null, t.callbackPriority = 0;
    else if (r = u & -u, t.callbackPriority !== r) {
      if (s != null && bf(s), r === 1) t.tag === 0 ? Jw(zm.bind(null, t)) : Cp(zm.bind(null, t)), Yw(function() {
        (me & 6) === 0 && An();
      }), s = null;
      else {
        switch (Nf(u)) {
          case 1:
            s = ol;
            break;
          case 4:
            s = Mf;
            break;
          case 16:
            s = Ii;
            break;
          case 536870912:
            s = Rf;
            break;
          default:
            s = Ii;
        }
        s = Qm(s, Bm.bind(null, t));
      }
      t.callbackPriority = r, t.callbackNode = s;
    }
  }
  function Bm(t, r) {
    if (Es = -1, bs = 0, (me & 6) !== 0) throw Error(o(327));
    var s = t.callbackNode;
    if (Qr() && t.callbackNode !== s) return null;
    var u = Li(t, t === We ? Xe : 0);
    if (u === 0) return null;
    if ((u & 30) !== 0 || (u & t.expiredLanes) !== 0 || r) r = Ms(t, u);
    else {
      r = u;
      var m = me;
      me |= 2;
      var y = Um();
      (We !== t || Xe !== r) && (cn = null, Yr = Fe() + 500, ir(t, r));
      do
        try {
          Sx();
          break;
        } catch (P) {
          $m(t, P);
        }
      while (!0);
      Ul(), Ts.current = y, me = m, Le !== null ? r = 0 : (We = null, Xe = 0, r = ze);
    }
    if (r !== 0) {
      if (r === 2 && (m = il(t), m !== 0 && (u = m, r = Cu(t, m))), r === 1) throw s = qo, ir(t, 0), Dn(t, u), ft(t, Fe()), s;
      if (r === 6) Dn(t, u);
      else {
        if (m = t.current.alternate, (u & 30) === 0 && !gx(m) && (r = Ms(t, u), r === 2 && (y = il(t), y !== 0 && (u = y, r = Cu(t, y))), r === 1)) throw s = qo, ir(t, 0), Dn(t, u), ft(t, Fe()), s;
        switch (t.finishedWork = m, t.finishedLanes = u, r) {
          case 0:
          case 1:
            throw Error(o(345));
          case 2:
            sr(t, dt, cn);
            break;
          case 3:
            if (Dn(t, u), (u & 130023424) === u && (r = Tu + 500 - Fe(), 10 < r)) {
              if (Li(t, 0) !== 0) break;
              if (m = t.suspendedLanes, (m & u) !== u) {
                ot(), t.pingedLanes |= t.suspendedLanes & m;
                break;
              }
              t.timeoutHandle = Dl(sr.bind(null, t, dt, cn), r);
              break;
            }
            sr(t, dt, cn);
            break;
          case 4:
            if (Dn(t, u), (u & 4194240) === u) break;
            for (r = t.eventTimes, m = -1; 0 < u; ) {
              var _ = 31 - Rt(u);
              y = 1 << _, _ = r[_], _ > m && (m = _), u &= ~y;
            }
            if (u = m, u = Fe() - u, u = (120 > u ? 120 : 480 > u ? 480 : 1080 > u ? 1080 : 1920 > u ? 1920 : 3e3 > u ? 3e3 : 4320 > u ? 4320 : 1960 * yx(u / 1960)) - u, 10 < u) {
              t.timeoutHandle = Dl(sr.bind(null, t, dt, cn), u);
              break;
            }
            sr(t, dt, cn);
            break;
          case 5:
            sr(t, dt, cn);
            break;
          default:
            throw Error(o(329));
        }
      }
    }
    return ft(t, Fe()), t.callbackNode === s ? Bm.bind(null, t) : null;
  }
  function Cu(t, r) {
    var s = ei;
    return t.current.memoizedState.isDehydrated && (ir(t, r).flags |= 256), t = Ms(t, r), t !== 2 && (r = dt, dt = s, r !== null && Pu(r)), t;
  }
  function Pu(t) {
    dt === null ? dt = t : dt.push.apply(dt, t);
  }
  function gx(t) {
    for (var r = t; ; ) {
      if (r.flags & 16384) {
        var s = r.updateQueue;
        if (s !== null && (s = s.stores, s !== null)) for (var u = 0; u < s.length; u++) {
          var m = s[u], y = m.getSnapshot;
          m = m.value;
          try {
            if (!Dt(y(), m)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (s = r.child, r.subtreeFlags & 16384 && s !== null) s.return = r, r = s;
      else {
        if (r === t) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === t) return !0;
          r = r.return;
        }
        r.sibling.return = r.return, r = r.sibling;
      }
    }
    return !0;
  }
  function Dn(t, r) {
    for (r &= ~_u, r &= ~ks, t.suspendedLanes |= r, t.pingedLanes &= ~r, t = t.expirationTimes; 0 < r; ) {
      var s = 31 - Rt(r), u = 1 << s;
      t[s] = -1, r &= ~u;
    }
  }
  function zm(t) {
    if ((me & 6) !== 0) throw Error(o(327));
    Qr();
    var r = Li(t, 0);
    if ((r & 1) === 0) return ft(t, Fe()), null;
    var s = Ms(t, r);
    if (t.tag !== 0 && s === 2) {
      var u = il(t);
      u !== 0 && (r = u, s = Cu(t, u));
    }
    if (s === 1) throw s = qo, ir(t, 0), Dn(t, r), ft(t, Fe()), s;
    if (s === 6) throw Error(o(345));
    return t.finishedWork = t.current.alternate, t.finishedLanes = r, sr(t, dt, cn), ft(t, Fe()), null;
  }
  function Eu(t, r) {
    var s = me;
    me |= 1;
    try {
      return t(r);
    } finally {
      me = s, me === 0 && (Yr = Fe() + 500, rs && An());
    }
  }
  function or(t) {
    Mn !== null && Mn.tag === 0 && (me & 6) === 0 && Qr();
    var r = me;
    me |= 1;
    var s = Ct.transition, u = xe;
    try {
      if (Ct.transition = null, xe = 1, t) return t();
    } finally {
      xe = u, Ct.transition = s, me = r, (me & 6) === 0 && An();
    }
  }
  function bu() {
    St = Kr.current, Ee(Kr);
  }
  function ir(t, r) {
    t.finishedWork = null, t.finishedLanes = 0;
    var s = t.timeoutHandle;
    if (s !== -1 && (t.timeoutHandle = -1, Kw(s)), Le !== null) for (s = Le.return; s !== null; ) {
      var u = s;
      switch (Ll(u), u.tag) {
        case 1:
          u = u.type.childContextTypes, u != null && ts();
          break;
        case 3:
          Hr(), Ee(lt), Ee(qe), Zl();
          break;
        case 5:
          Ql(u);
          break;
        case 4:
          Hr();
          break;
        case 13:
          Ee(De);
          break;
        case 19:
          Ee(De);
          break;
        case 10:
          Hl(u.type._context);
          break;
        case 22:
        case 23:
          bu();
      }
      s = s.return;
    }
    if (We = t, Le = t = Nn(t.current, null), Xe = St = r, ze = 0, qo = null, _u = ks = rr = 0, dt = ei = null, er !== null) {
      for (r = 0; r < er.length; r++) if (s = er[r], u = s.interleaved, u !== null) {
        s.interleaved = null;
        var m = u.next, y = s.pending;
        if (y !== null) {
          var _ = y.next;
          y.next = m, u.next = _;
        }
        s.pending = u;
      }
      er = null;
    }
    return t;
  }
  function $m(t, r) {
    do {
      var s = Le;
      try {
        if (Ul(), ps.current = gs, ms) {
          for (var u = Ne.memoizedState; u !== null; ) {
            var m = u.queue;
            m !== null && (m.pending = null), u = u.next;
          }
          ms = !1;
        }
        if (nr = 0, He = Be = Ne = null, Ko = !1, Yo = 0, xu.current = null, s === null || s.return === null) {
          ze = 1, qo = r, Le = null;
          break;
        }
        e: {
          var y = t, _ = s.return, P = s, b = r;
          if (r = Xe, P.flags |= 32768, b !== null && typeof b == "object" && typeof b.then == "function") {
            var F = b, z = P, H = z.tag;
            if ((z.mode & 1) === 0 && (H === 0 || H === 11 || H === 15)) {
              var B = z.alternate;
              B ? (z.updateQueue = B.updateQueue, z.memoizedState = B.memoizedState, z.lanes = B.lanes) : (z.updateQueue = null, z.memoizedState = null);
            }
            var J = pm(_);
            if (J !== null) {
              J.flags &= -257, mm(J, _, P, y, r), J.mode & 1 && fm(y, F, r), r = J, b = F;
              var te = r.updateQueue;
              if (te === null) {
                var re = /* @__PURE__ */ new Set();
                re.add(b), r.updateQueue = re;
              } else te.add(b);
              break e;
            } else {
              if ((r & 1) === 0) {
                fm(y, F, r), Mu();
                break e;
              }
              b = Error(o(426));
            }
          } else if (Re && P.mode & 1) {
            var Oe = pm(_);
            if (Oe !== null) {
              (Oe.flags & 65536) === 0 && (Oe.flags |= 256), mm(Oe, _, P, y, r), zl(Wr(b, P));
              break e;
            }
          }
          y = b = Wr(b, P), ze !== 4 && (ze = 2), ei === null ? ei = [y] : ei.push(y), y = _;
          do {
            switch (y.tag) {
              case 3:
                y.flags |= 65536, r &= -r, y.lanes |= r;
                var I = cm(y, b, r);
                Op(y, I);
                break e;
              case 1:
                P = b;
                var M = y.type, j = y.stateNode;
                if ((y.flags & 128) === 0 && (typeof M.getDerivedStateFromError == "function" || j !== null && typeof j.componentDidCatch == "function" && (bn === null || !bn.has(j)))) {
                  y.flags |= 65536, r &= -r, y.lanes |= r;
                  var W = dm(y, P, r);
                  Op(y, W);
                  break e;
                }
            }
            y = y.return;
          } while (y !== null);
        }
        Wm(s);
      } catch (oe) {
        r = oe, Le === s && s !== null && (Le = s = s.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Um() {
    var t = Ts.current;
    return Ts.current = gs, t === null ? gs : t;
  }
  function Mu() {
    (ze === 0 || ze === 3 || ze === 2) && (ze = 4), We === null || (rr & 268435455) === 0 && (ks & 268435455) === 0 || Dn(We, Xe);
  }
  function Ms(t, r) {
    var s = me;
    me |= 2;
    var u = Um();
    (We !== t || Xe !== r) && (cn = null, ir(t, r));
    do
      try {
        vx();
        break;
      } catch (m) {
        $m(t, m);
      }
    while (!0);
    if (Ul(), me = s, Ts.current = u, Le !== null) throw Error(o(261));
    return We = null, Xe = 0, ze;
  }
  function vx() {
    for (; Le !== null; ) Hm(Le);
  }
  function Sx() {
    for (; Le !== null && !HS(); ) Hm(Le);
  }
  function Hm(t) {
    var r = Ym(t.alternate, t, St);
    t.memoizedProps = t.pendingProps, r === null ? Wm(t) : Le = r, xu.current = null;
  }
  function Wm(t) {
    var r = t;
    do {
      var s = r.alternate;
      if (t = r.return, (r.flags & 32768) === 0) {
        if (s = dx(s, r, St), s !== null) {
          Le = s;
          return;
        }
      } else {
        if (s = fx(s, r), s !== null) {
          s.flags &= 32767, Le = s;
          return;
        }
        if (t !== null) t.flags |= 32768, t.subtreeFlags = 0, t.deletions = null;
        else {
          ze = 6, Le = null;
          return;
        }
      }
      if (r = r.sibling, r !== null) {
        Le = r;
        return;
      }
      Le = r = t;
    } while (r !== null);
    ze === 0 && (ze = 5);
  }
  function sr(t, r, s) {
    var u = xe, m = Ct.transition;
    try {
      Ct.transition = null, xe = 1, wx(t, r, s, u);
    } finally {
      Ct.transition = m, xe = u;
    }
    return null;
  }
  function wx(t, r, s, u) {
    do
      Qr();
    while (Mn !== null);
    if ((me & 6) !== 0) throw Error(o(327));
    s = t.finishedWork;
    var m = t.finishedLanes;
    if (s === null) return null;
    if (t.finishedWork = null, t.finishedLanes = 0, s === t.current) throw Error(o(177));
    t.callbackNode = null, t.callbackPriority = 0;
    var y = s.lanes | s.childLanes;
    if (ew(t, y), t === We && (Le = We = null, Xe = 0), (s.subtreeFlags & 2064) === 0 && (s.flags & 2064) === 0 || Cs || (Cs = !0, Qm(Ii, function() {
      return Qr(), null;
    })), y = (s.flags & 15990) !== 0, (s.subtreeFlags & 15990) !== 0 || y) {
      y = Ct.transition, Ct.transition = null;
      var _ = xe;
      xe = 1;
      var P = me;
      me |= 4, xu.current = null, mx(t, s), jm(s, t), Bw(Ml), zi = !!bl, Ml = bl = null, t.current = s, hx(s), WS(), me = P, xe = _, Ct.transition = y;
    } else t.current = s;
    if (Cs && (Cs = !1, Mn = t, Ps = m), y = t.pendingLanes, y === 0 && (bn = null), YS(s.stateNode), ft(t, Fe()), r !== null) for (u = t.onRecoverableError, s = 0; s < r.length; s++) m = r[s], u(m.value, { componentStack: m.stack, digest: m.digest });
    if (As) throw As = !1, t = ku, ku = null, t;
    return (Ps & 1) !== 0 && t.tag !== 0 && Qr(), y = t.pendingLanes, (y & 1) !== 0 ? t === Au ? ti++ : (ti = 0, Au = t) : ti = 0, An(), null;
  }
  function Qr() {
    if (Mn !== null) {
      var t = Nf(Ps), r = Ct.transition, s = xe;
      try {
        if (Ct.transition = null, xe = 16 > t ? 16 : t, Mn === null) var u = !1;
        else {
          if (t = Mn, Mn = null, Ps = 0, (me & 6) !== 0) throw Error(o(331));
          var m = me;
          for (me |= 4, ee = t.current; ee !== null; ) {
            var y = ee, _ = y.child;
            if ((ee.flags & 16) !== 0) {
              var P = y.deletions;
              if (P !== null) {
                for (var b = 0; b < P.length; b++) {
                  var F = P[b];
                  for (ee = F; ee !== null; ) {
                    var z = ee;
                    switch (z.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Jo(8, z, y);
                    }
                    var H = z.child;
                    if (H !== null) H.return = z, ee = H;
                    else for (; ee !== null; ) {
                      z = ee;
                      var B = z.sibling, J = z.return;
                      if (Mm(z), z === F) {
                        ee = null;
                        break;
                      }
                      if (B !== null) {
                        B.return = J, ee = B;
                        break;
                      }
                      ee = J;
                    }
                  }
                }
                var te = y.alternate;
                if (te !== null) {
                  var re = te.child;
                  if (re !== null) {
                    te.child = null;
                    do {
                      var Oe = re.sibling;
                      re.sibling = null, re = Oe;
                    } while (re !== null);
                  }
                }
                ee = y;
              }
            }
            if ((y.subtreeFlags & 2064) !== 0 && _ !== null) _.return = y, ee = _;
            else e: for (; ee !== null; ) {
              if (y = ee, (y.flags & 2048) !== 0) switch (y.tag) {
                case 0:
                case 11:
                case 15:
                  Jo(9, y, y.return);
              }
              var I = y.sibling;
              if (I !== null) {
                I.return = y.return, ee = I;
                break e;
              }
              ee = y.return;
            }
          }
          var M = t.current;
          for (ee = M; ee !== null; ) {
            _ = ee;
            var j = _.child;
            if ((_.subtreeFlags & 2064) !== 0 && j !== null) j.return = _, ee = j;
            else e: for (_ = M; ee !== null; ) {
              if (P = ee, (P.flags & 2048) !== 0) try {
                switch (P.tag) {
                  case 0:
                  case 11:
                  case 15:
                    _s(9, P);
                }
              } catch (oe) {
                je(P, P.return, oe);
              }
              if (P === _) {
                ee = null;
                break e;
              }
              var W = P.sibling;
              if (W !== null) {
                W.return = P.return, ee = W;
                break e;
              }
              ee = P.return;
            }
          }
          if (me = m, An(), $t && typeof $t.onPostCommitFiberRoot == "function") try {
            $t.onPostCommitFiberRoot(ji, t);
          } catch {
          }
          u = !0;
        }
        return u;
      } finally {
        xe = s, Ct.transition = r;
      }
    }
    return !1;
  }
  function Gm(t, r, s) {
    r = Wr(s, r), r = cm(t, r, 1), t = Pn(t, r, 1), r = ot(), t !== null && (Ao(t, 1, r), ft(t, r));
  }
  function je(t, r, s) {
    if (t.tag === 3) Gm(t, t, s);
    else for (; r !== null; ) {
      if (r.tag === 3) {
        Gm(r, t, s);
        break;
      } else if (r.tag === 1) {
        var u = r.stateNode;
        if (typeof r.type.getDerivedStateFromError == "function" || typeof u.componentDidCatch == "function" && (bn === null || !bn.has(u))) {
          t = Wr(s, t), t = dm(r, t, 1), r = Pn(r, t, 1), t = ot(), r !== null && (Ao(r, 1, t), ft(r, t));
          break;
        }
      }
      r = r.return;
    }
  }
  function xx(t, r, s) {
    var u = t.pingCache;
    u !== null && u.delete(r), r = ot(), t.pingedLanes |= t.suspendedLanes & s, We === t && (Xe & s) === s && (ze === 4 || ze === 3 && (Xe & 130023424) === Xe && 500 > Fe() - Tu ? ir(t, 0) : _u |= s), ft(t, r);
  }
  function Km(t, r) {
    r === 0 && ((t.mode & 1) === 0 ? r = 1 : (r = Oi, Oi <<= 1, (Oi & 130023424) === 0 && (Oi = 4194304)));
    var s = ot();
    t = an(t, r), t !== null && (Ao(t, r, s), ft(t, s));
  }
  function _x(t) {
    var r = t.memoizedState, s = 0;
    r !== null && (s = r.retryLane), Km(t, s);
  }
  function Tx(t, r) {
    var s = 0;
    switch (t.tag) {
      case 13:
        var u = t.stateNode, m = t.memoizedState;
        m !== null && (s = m.retryLane);
        break;
      case 19:
        u = t.stateNode;
        break;
      default:
        throw Error(o(314));
    }
    u !== null && u.delete(r), Km(t, s);
  }
  var Ym;
  Ym = function(t, r, s) {
    if (t !== null) if (t.memoizedProps !== r.pendingProps || lt.current) ct = !0;
    else {
      if ((t.lanes & s) === 0 && (r.flags & 128) === 0) return ct = !1, cx(t, r, s);
      ct = (t.flags & 131072) !== 0;
    }
    else ct = !1, Re && (r.flags & 1048576) !== 0 && Pp(r, is, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var u = r.type;
        ws(t, r), t = r.pendingProps;
        var m = Or(r, qe.current);
        Ur(r, s), m = eu(null, r, u, t, m, s);
        var y = tu();
        return r.flags |= 1, typeof m == "object" && m !== null && typeof m.render == "function" && m.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, ut(u) ? (y = !0, ns(r)) : y = !1, r.memoizedState = m.state !== null && m.state !== void 0 ? m.state : null, Kl(r), m.updater = vs, r.stateNode = m, m._reactInternals = r, au(r, u, t, s), r = du(null, r, u, !0, y, s)) : (r.tag = 0, Re && y && Ol(r), rt(null, r, m, s), r = r.child), r;
      case 16:
        u = r.elementType;
        e: {
          switch (ws(t, r), t = r.pendingProps, m = u._init, u = m(u._payload), r.type = u, m = r.tag = Ax(u), t = It(u, t), m) {
            case 0:
              r = cu(null, r, u, t, s);
              break e;
            case 1:
              r = wm(null, r, u, t, s);
              break e;
            case 11:
              r = hm(null, r, u, t, s);
              break e;
            case 14:
              r = ym(null, r, u, It(u.type, t), s);
              break e;
          }
          throw Error(o(
            306,
            u,
            ""
          ));
        }
        return r;
      case 0:
        return u = r.type, m = r.pendingProps, m = r.elementType === u ? m : It(u, m), cu(t, r, u, m, s);
      case 1:
        return u = r.type, m = r.pendingProps, m = r.elementType === u ? m : It(u, m), wm(t, r, u, m, s);
      case 3:
        e: {
          if (xm(r), t === null) throw Error(o(387));
          u = r.pendingProps, y = r.memoizedState, m = y.element, Fp(t, r), ds(r, u, null, s);
          var _ = r.memoizedState;
          if (u = _.element, y.isDehydrated) if (y = { element: u, isDehydrated: !1, cache: _.cache, pendingSuspenseBoundaries: _.pendingSuspenseBoundaries, transitions: _.transitions }, r.updateQueue.baseState = y, r.memoizedState = y, r.flags & 256) {
            m = Wr(Error(o(423)), r), r = _m(t, r, u, s, m);
            break e;
          } else if (u !== m) {
            m = Wr(Error(o(424)), r), r = _m(t, r, u, s, m);
            break e;
          } else for (vt = _n(r.stateNode.containerInfo.firstChild), gt = r, Re = !0, Nt = null, s = Ip(r, null, u, s), r.child = s; s; ) s.flags = s.flags & -3 | 4096, s = s.sibling;
          else {
            if (Br(), u === m) {
              r = un(t, r, s);
              break e;
            }
            rt(t, r, u, s);
          }
          r = r.child;
        }
        return r;
      case 5:
        return Vp(r), t === null && Bl(r), u = r.type, m = r.pendingProps, y = t !== null ? t.memoizedProps : null, _ = m.children, Rl(u, m) ? _ = null : y !== null && Rl(u, y) && (r.flags |= 32), Sm(t, r), rt(t, r, _, s), r.child;
      case 6:
        return t === null && Bl(r), null;
      case 13:
        return Tm(t, r, s);
      case 4:
        return Yl(r, r.stateNode.containerInfo), u = r.pendingProps, t === null ? r.child = zr(r, null, u, s) : rt(t, r, u, s), r.child;
      case 11:
        return u = r.type, m = r.pendingProps, m = r.elementType === u ? m : It(u, m), hm(t, r, u, m, s);
      case 7:
        return rt(t, r, r.pendingProps, s), r.child;
      case 8:
        return rt(t, r, r.pendingProps.children, s), r.child;
      case 12:
        return rt(t, r, r.pendingProps.children, s), r.child;
      case 10:
        e: {
          if (u = r.type._context, m = r.pendingProps, y = r.memoizedProps, _ = m.value, Ce(ls, u._currentValue), u._currentValue = _, y !== null) if (Dt(y.value, _)) {
            if (y.children === m.children && !lt.current) {
              r = un(t, r, s);
              break e;
            }
          } else for (y = r.child, y !== null && (y.return = r); y !== null; ) {
            var P = y.dependencies;
            if (P !== null) {
              _ = y.child;
              for (var b = P.firstContext; b !== null; ) {
                if (b.context === u) {
                  if (y.tag === 1) {
                    b = ln(-1, s & -s), b.tag = 2;
                    var F = y.updateQueue;
                    if (F !== null) {
                      F = F.shared;
                      var z = F.pending;
                      z === null ? b.next = b : (b.next = z.next, z.next = b), F.pending = b;
                    }
                  }
                  y.lanes |= s, b = y.alternate, b !== null && (b.lanes |= s), Wl(
                    y.return,
                    s,
                    r
                  ), P.lanes |= s;
                  break;
                }
                b = b.next;
              }
            } else if (y.tag === 10) _ = y.type === r.type ? null : y.child;
            else if (y.tag === 18) {
              if (_ = y.return, _ === null) throw Error(o(341));
              _.lanes |= s, P = _.alternate, P !== null && (P.lanes |= s), Wl(_, s, r), _ = y.sibling;
            } else _ = y.child;
            if (_ !== null) _.return = y;
            else for (_ = y; _ !== null; ) {
              if (_ === r) {
                _ = null;
                break;
              }
              if (y = _.sibling, y !== null) {
                y.return = _.return, _ = y;
                break;
              }
              _ = _.return;
            }
            y = _;
          }
          rt(t, r, m.children, s), r = r.child;
        }
        return r;
      case 9:
        return m = r.type, u = r.pendingProps.children, Ur(r, s), m = kt(m), u = u(m), r.flags |= 1, rt(t, r, u, s), r.child;
      case 14:
        return u = r.type, m = It(u, r.pendingProps), m = It(u.type, m), ym(t, r, u, m, s);
      case 15:
        return gm(t, r, r.type, r.pendingProps, s);
      case 17:
        return u = r.type, m = r.pendingProps, m = r.elementType === u ? m : It(u, m), ws(t, r), r.tag = 1, ut(u) ? (t = !0, ns(r)) : t = !1, Ur(r, s), lm(r, u, m), au(r, u, m, s), du(null, r, u, !0, t, s);
      case 19:
        return Am(t, r, s);
      case 22:
        return vm(t, r, s);
    }
    throw Error(o(156, r.tag));
  };
  function Qm(t, r) {
    return Ef(t, r);
  }
  function kx(t, r, s, u) {
    this.tag = t, this.key = s, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = u, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Pt(t, r, s, u) {
    return new kx(t, r, s, u);
  }
  function Ru(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function Ax(t) {
    if (typeof t == "function") return Ru(t) ? 1 : 0;
    if (t != null) {
      if (t = t.$$typeof, t === q) return 11;
      if (t === _e) return 14;
    }
    return 2;
  }
  function Nn(t, r) {
    var s = t.alternate;
    return s === null ? (s = Pt(t.tag, r, t.key, t.mode), s.elementType = t.elementType, s.type = t.type, s.stateNode = t.stateNode, s.alternate = t, t.alternate = s) : (s.pendingProps = r, s.type = t.type, s.flags = 0, s.subtreeFlags = 0, s.deletions = null), s.flags = t.flags & 14680064, s.childLanes = t.childLanes, s.lanes = t.lanes, s.child = t.child, s.memoizedProps = t.memoizedProps, s.memoizedState = t.memoizedState, s.updateQueue = t.updateQueue, r = t.dependencies, s.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, s.sibling = t.sibling, s.index = t.index, s.ref = t.ref, s;
  }
  function Rs(t, r, s, u, m, y) {
    var _ = 2;
    if (u = t, typeof t == "function") Ru(t) && (_ = 1);
    else if (typeof t == "string") _ = 5;
    else e: switch (t) {
      case K:
        return ar(s.children, m, y, r);
      case G:
        _ = 8, m |= 8;
        break;
      case L:
        return t = Pt(12, s, r, m | 2), t.elementType = L, t.lanes = y, t;
      case de:
        return t = Pt(13, s, r, m), t.elementType = de, t.lanes = y, t;
      case ue:
        return t = Pt(19, s, r, m), t.elementType = ue, t.lanes = y, t;
      case Se:
        return Ds(s, m, y, r);
      default:
        if (typeof t == "object" && t !== null) switch (t.$$typeof) {
          case X:
            _ = 10;
            break e;
          case ae:
            _ = 9;
            break e;
          case q:
            _ = 11;
            break e;
          case _e:
            _ = 14;
            break e;
          case ve:
            _ = 16, u = null;
            break e;
        }
        throw Error(o(130, t == null ? t : typeof t, ""));
    }
    return r = Pt(_, s, r, m), r.elementType = t, r.type = u, r.lanes = y, r;
  }
  function ar(t, r, s, u) {
    return t = Pt(7, t, u, r), t.lanes = s, t;
  }
  function Ds(t, r, s, u) {
    return t = Pt(22, t, u, r), t.elementType = Se, t.lanes = s, t.stateNode = { isHidden: !1 }, t;
  }
  function Du(t, r, s) {
    return t = Pt(6, t, null, r), t.lanes = s, t;
  }
  function Nu(t, r, s) {
    return r = Pt(4, t.children !== null ? t.children : [], t.key, r), r.lanes = s, r.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, r;
  }
  function Cx(t, r, s, u, m) {
    this.tag = r, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = sl(0), this.expirationTimes = sl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = sl(0), this.identifierPrefix = u, this.onRecoverableError = m, this.mutableSourceEagerHydrationData = null;
  }
  function Iu(t, r, s, u, m, y, _, P, b) {
    return t = new Cx(t, r, s, P, b), r === 1 ? (r = 1, y === !0 && (r |= 8)) : r = 0, y = Pt(3, null, null, r), t.current = y, y.stateNode = t, y.memoizedState = { element: u, isDehydrated: s, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Kl(y), t;
  }
  function Px(t, r, s) {
    var u = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: U, key: u == null ? null : "" + u, children: t, containerInfo: r, implementation: s };
  }
  function Xm(t) {
    if (!t) return kn;
    t = t._reactInternals;
    e: {
      if (Qn(t) !== t || t.tag !== 1) throw Error(o(170));
      var r = t;
      do {
        switch (r.tag) {
          case 3:
            r = r.stateNode.context;
            break e;
          case 1:
            if (ut(r.type)) {
              r = r.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        r = r.return;
      } while (r !== null);
      throw Error(o(171));
    }
    if (t.tag === 1) {
      var s = t.type;
      if (ut(s)) return kp(t, s, r);
    }
    return r;
  }
  function Zm(t, r, s, u, m, y, _, P, b) {
    return t = Iu(s, u, !0, t, m, y, _, P, b), t.context = Xm(null), s = t.current, u = ot(), m = Rn(s), y = ln(u, m), y.callback = r ?? null, Pn(s, y, m), t.current.lanes = m, Ao(t, m, u), ft(t, u), t;
  }
  function Ns(t, r, s, u) {
    var m = r.current, y = ot(), _ = Rn(m);
    return s = Xm(s), r.context === null ? r.context = s : r.pendingContext = s, r = ln(y, _), r.payload = { element: t }, u = u === void 0 ? null : u, u !== null && (r.callback = u), t = Pn(m, r, _), t !== null && (Ot(t, m, _, y), cs(t, m, _)), _;
  }
  function Is(t) {
    if (t = t.current, !t.child) return null;
    switch (t.child.tag) {
      case 5:
        return t.child.stateNode;
      default:
        return t.child.stateNode;
    }
  }
  function Jm(t, r) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var s = t.retryLane;
      t.retryLane = s !== 0 && s < r ? s : r;
    }
  }
  function ju(t, r) {
    Jm(t, r), (t = t.alternate) && Jm(t, r);
  }
  function Ex() {
    return null;
  }
  var qm = typeof reportError == "function" ? reportError : function(t) {
    console.error(t);
  };
  function Fu(t) {
    this._internalRoot = t;
  }
  js.prototype.render = Fu.prototype.render = function(t) {
    var r = this._internalRoot;
    if (r === null) throw Error(o(409));
    Ns(t, r, null, null);
  }, js.prototype.unmount = Fu.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var r = t.containerInfo;
      or(function() {
        Ns(null, t, null, null);
      }), r[nn] = null;
    }
  };
  function js(t) {
    this._internalRoot = t;
  }
  js.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var r = Ff();
      t = { blockedOn: null, target: t, priority: r };
      for (var s = 0; s < Sn.length && r !== 0 && r < Sn[s].priority; s++) ;
      Sn.splice(s, 0, t), s === 0 && Vf(t);
    }
  };
  function Ou(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function Fs(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11 && (t.nodeType !== 8 || t.nodeValue !== " react-mount-point-unstable "));
  }
  function eh() {
  }
  function bx(t, r, s, u, m) {
    if (m) {
      if (typeof u == "function") {
        var y = u;
        u = function() {
          var F = Is(_);
          y.call(F);
        };
      }
      var _ = Zm(r, u, t, 0, null, !1, !1, "", eh);
      return t._reactRootContainer = _, t[nn] = _.current, Vo(t.nodeType === 8 ? t.parentNode : t), or(), _;
    }
    for (; m = t.lastChild; ) t.removeChild(m);
    if (typeof u == "function") {
      var P = u;
      u = function() {
        var F = Is(b);
        P.call(F);
      };
    }
    var b = Iu(t, 0, !1, null, null, !1, !1, "", eh);
    return t._reactRootContainer = b, t[nn] = b.current, Vo(t.nodeType === 8 ? t.parentNode : t), or(function() {
      Ns(r, b, s, u);
    }), b;
  }
  function Os(t, r, s, u, m) {
    var y = s._reactRootContainer;
    if (y) {
      var _ = y;
      if (typeof m == "function") {
        var P = m;
        m = function() {
          var b = Is(_);
          P.call(b);
        };
      }
      Ns(r, _, t, m);
    } else _ = bx(s, r, t, m, u);
    return Is(_);
  }
  If = function(t) {
    switch (t.tag) {
      case 3:
        var r = t.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var s = ko(r.pendingLanes);
          s !== 0 && (al(r, s | 1), ft(r, Fe()), (me & 6) === 0 && (Yr = Fe() + 500, An()));
        }
        break;
      case 13:
        or(function() {
          var u = an(t, 1);
          if (u !== null) {
            var m = ot();
            Ot(u, t, 1, m);
          }
        }), ju(t, 1);
    }
  }, ll = function(t) {
    if (t.tag === 13) {
      var r = an(t, 134217728);
      if (r !== null) {
        var s = ot();
        Ot(r, t, 134217728, s);
      }
      ju(t, 134217728);
    }
  }, jf = function(t) {
    if (t.tag === 13) {
      var r = Rn(t), s = an(t, r);
      if (s !== null) {
        var u = ot();
        Ot(s, t, r, u);
      }
      ju(t, r);
    }
  }, Ff = function() {
    return xe;
  }, Of = function(t, r) {
    var s = xe;
    try {
      return xe = t, r();
    } finally {
      xe = s;
    }
  }, el = function(t, r, s) {
    switch (r) {
      case "input":
        if (Ga(t, s), r = s.name, s.type === "radio" && r != null) {
          for (s = t; s.parentNode; ) s = s.parentNode;
          for (s = s.querySelectorAll("input[name=" + JSON.stringify("" + r) + '][type="radio"]'), r = 0; r < s.length; r++) {
            var u = s[r];
            if (u !== t && u.form === t.form) {
              var m = es(u);
              if (!m) throw Error(o(90));
              af(u), Ga(u, m);
            }
          }
        }
        break;
      case "textarea":
        ff(t, s);
        break;
      case "select":
        r = s.value, r != null && Ar(t, !!s.multiple, r, !1);
    }
  }, xf = Eu, _f = or;
  var Mx = { usingClientEntryPoint: !1, Events: [$o, jr, es, Sf, wf, Eu] }, ni = { findFiberByHostInstance: Xn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Rx = { bundleType: ni.bundleType, version: ni.version, rendererPackageName: ni.rendererPackageName, rendererConfig: ni.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: N.ReactCurrentDispatcher, findHostInstanceByFiber: function(t) {
    return t = Cf(t), t === null ? null : t.stateNode;
  }, findFiberByHostInstance: ni.findFiberByHostInstance || Ex, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Ls = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Ls.isDisabled && Ls.supportsFiber) try {
      ji = Ls.inject(Rx), $t = Ls;
    } catch {
    }
  }
  return pt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Mx, pt.createPortal = function(t, r) {
    var s = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Ou(r)) throw Error(o(200));
    return Px(t, r, null, s);
  }, pt.createRoot = function(t, r) {
    if (!Ou(t)) throw Error(o(299));
    var s = !1, u = "", m = qm;
    return r != null && (r.unstable_strictMode === !0 && (s = !0), r.identifierPrefix !== void 0 && (u = r.identifierPrefix), r.onRecoverableError !== void 0 && (m = r.onRecoverableError)), r = Iu(t, 1, !1, null, null, s, !1, u, m), t[nn] = r.current, Vo(t.nodeType === 8 ? t.parentNode : t), new Fu(r);
  }, pt.findDOMNode = function(t) {
    if (t == null) return null;
    if (t.nodeType === 1) return t;
    var r = t._reactInternals;
    if (r === void 0)
      throw typeof t.render == "function" ? Error(o(188)) : (t = Object.keys(t).join(","), Error(o(268, t)));
    return t = Cf(r), t = t === null ? null : t.stateNode, t;
  }, pt.flushSync = function(t) {
    return or(t);
  }, pt.hydrate = function(t, r, s) {
    if (!Fs(r)) throw Error(o(200));
    return Os(null, t, r, !0, s);
  }, pt.hydrateRoot = function(t, r, s) {
    if (!Ou(t)) throw Error(o(405));
    var u = s != null && s.hydratedSources || null, m = !1, y = "", _ = qm;
    if (s != null && (s.unstable_strictMode === !0 && (m = !0), s.identifierPrefix !== void 0 && (y = s.identifierPrefix), s.onRecoverableError !== void 0 && (_ = s.onRecoverableError)), r = Zm(r, null, t, 1, s ?? null, m, !1, y, _), t[nn] = r.current, Vo(t), u) for (t = 0; t < u.length; t++) s = u[t], m = s._getVersion, m = m(s._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [s, m] : r.mutableSourceEagerHydrationData.push(
      s,
      m
    );
    return new js(r);
  }, pt.render = function(t, r, s) {
    if (!Fs(r)) throw Error(o(200));
    return Os(null, t, r, !1, s);
  }, pt.unmountComponentAtNode = function(t) {
    if (!Fs(t)) throw Error(o(40));
    return t._reactRootContainer ? (or(function() {
      Os(null, null, t, !1, function() {
        t._reactRootContainer = null, t[nn] = null;
      });
    }), !0) : !1;
  }, pt.unstable_batchedUpdates = Eu, pt.unstable_renderSubtreeIntoContainer = function(t, r, s, u) {
    if (!Fs(s)) throw Error(o(200));
    if (t == null || t._reactInternals === void 0) throw Error(o(38));
    return Os(t, r, s, !1, u);
  }, pt.version = "18.3.1-next-f1338f8080-20240426", pt;
}
var uh;
function mg() {
  if (uh) return Vu.exports;
  uh = 1;
  function e() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (n) {
        console.error(n);
      }
  }
  return e(), Vu.exports = $x(), Vu.exports;
}
var ch;
function Ux() {
  if (ch) return Bs;
  ch = 1;
  var e = mg();
  return Bs.createRoot = e.createRoot, Bs.hydrateRoot = e.hydrateRoot, Bs;
}
var Hx = Ux(), $u = { exports: {} }, oi = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var dh;
function Wx() {
  if (dh) return oi;
  dh = 1;
  var e = cd(), n = Symbol.for("react.element"), o = Symbol.for("react.fragment"), i = Object.prototype.hasOwnProperty, a = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function d(p, h, g) {
    var S, l = {}, f = null, v = null;
    g !== void 0 && (f = "" + g), h.key !== void 0 && (f = "" + h.key), h.ref !== void 0 && (v = h.ref);
    for (S in h) i.call(h, S) && !c.hasOwnProperty(S) && (l[S] = h[S]);
    if (p && p.defaultProps) for (S in h = p.defaultProps, h) l[S] === void 0 && (l[S] = h[S]);
    return { $$typeof: n, type: p, key: f, ref: v, props: l, _owner: a.current };
  }
  return oi.Fragment = o, oi.jsx = d, oi.jsxs = d, oi;
}
var fh;
function Gx() {
  return fh || (fh = 1, $u.exports = Wx()), $u.exports;
}
var T = Gx();
const ph = (e) => Symbol.iterator in e, mh = (e) => (
  // HACK: avoid checking entries type
  "entries" in e
), hh = (e, n) => {
  const o = e instanceof Map ? e : new Map(e.entries()), i = n instanceof Map ? n : new Map(n.entries());
  if (o.size !== i.size)
    return !1;
  for (const [a, c] of o)
    if (!i.has(a) || !Object.is(c, i.get(a)))
      return !1;
  return !0;
}, Kx = (e, n) => {
  const o = e[Symbol.iterator](), i = n[Symbol.iterator]();
  let a = o.next(), c = i.next();
  for (; !a.done && !c.done; ) {
    if (!Object.is(a.value, c.value))
      return !1;
    a = o.next(), c = i.next();
  }
  return !!a.done && !!c.done;
};
function Yx(e, n) {
  return Object.is(e, n) ? !0 : typeof e != "object" || e === null || typeof n != "object" || n === null || Object.getPrototypeOf(e) !== Object.getPrototypeOf(n) ? !1 : ph(e) && ph(n) ? mh(e) && mh(n) ? hh(e, n) : Kx(e, n) : hh(
    { entries: () => Object.entries(e) },
    { entries: () => Object.entries(n) }
  );
}
function Qx(e) {
  const n = pn.useRef(void 0);
  return (o) => {
    const i = e(o);
    return Yx(n.current, i) ? n.current : n.current = i;
  };
}
const dd = C.createContext({});
function fd(e) {
  const n = C.useRef(null);
  return n.current === null && (n.current = e()), n.current;
}
const Xx = typeof window < "u", hg = Xx ? C.useLayoutEffect : C.useEffect, Da = /* @__PURE__ */ C.createContext(null);
function pd(e, n) {
  e.indexOf(n) === -1 && e.push(n);
}
function ma(e, n) {
  const o = e.indexOf(n);
  o > -1 && e.splice(o, 1);
}
const en = (e, n, o) => o > n ? n : o < e ? e : o;
function yh(e, n) {
  return n ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${n}` : e;
}
let xi = () => {
}, wr = () => {
};
var lg;
typeof process < "u" && ((lg = process.env) == null ? void 0 : lg.NODE_ENV) !== "production" && (xi = (e, n, o) => {
  !e && typeof console < "u" && console.warn(yh(n, o));
}, wr = (e, n, o) => {
  if (!e)
    throw new Error(yh(n, o));
});
const Wn = {}, yg = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), gg = (e) => typeof e == "object" && e !== null, vg = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function Sg(e) {
  let n;
  return () => (n === void 0 && (n = e()), n);
}
const Mt = /* @__NO_SIDE_EFFECTS__ */ (e) => e, _i = (...e) => e.reduce((n, o) => (i) => o(n(i))), pi = /* @__NO_SIDE_EFFECTS__ */ (e, n, o) => {
  const i = n - e;
  return i ? (o - e) / i : 1;
};
class md {
  constructor() {
    this.subscriptions = [];
  }
  add(n) {
    return pd(this.subscriptions, n), () => ma(this.subscriptions, n);
  }
  notify(n, o, i) {
    const a = this.subscriptions.length;
    if (a)
      if (a === 1)
        this.subscriptions[0](n, o, i);
      else
        for (let c = 0; c < a; c++) {
          const d = this.subscriptions[c];
          d && d(n, o, i);
        }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
const mt = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, bt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, wg = /* @__NO_SIDE_EFFECTS__ */ (e, n) => n ? e * (1e3 / n) : 0, xg = (e, n, o) => (((1 - 3 * o + 3 * n) * e + (3 * o - 6 * n)) * e + 3 * n) * e, Zx = 1e-7, Jx = 12;
function qx(e, n, o, i, a) {
  let c, d, p = 0;
  do
    d = n + (o - n) / 2, c = xg(d, i, a) - e, c > 0 ? o = d : n = d;
  while (Math.abs(c) > Zx && ++p < Jx);
  return d;
}
// @__NO_SIDE_EFFECTS__
function Ti(e, n, o, i) {
  if (e === n && o === i)
    return Mt;
  const a = (c) => qx(c, 0, 1, e, o);
  return (c) => c === 0 || c === 1 ? c : xg(a(c), n, i);
}
const _g = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => n <= 0.5 ? e(2 * n) / 2 : (2 - e(2 * (1 - n))) / 2, Tg = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => 1 - e(1 - n), kg = /* @__PURE__ */ Ti(0.33, 1.53, 0.69, 0.99), hd = /* @__PURE__ */ Tg(kg), Ag = /* @__PURE__ */ _g(hd), Cg = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * hd(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), yd = (e) => 1 - Math.sin(Math.acos(e)), Pg = /* @__PURE__ */ Tg(yd), Eg = /* @__PURE__ */ _g(yd), e_ = /* @__PURE__ */ Ti(0.42, 0, 1, 1), t_ = /* @__PURE__ */ Ti(0, 0, 0.58, 1), bg = /* @__PURE__ */ Ti(0.42, 0, 0.58, 1), n_ = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number", Mg = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", gh = {
  linear: Mt,
  easeIn: e_,
  easeInOut: bg,
  easeOut: t_,
  circIn: yd,
  circInOut: Eg,
  circOut: Pg,
  backIn: hd,
  backInOut: Ag,
  backOut: kg,
  anticipate: Cg
}, r_ = (e) => typeof e == "string", vh = (e) => {
  if (/* @__PURE__ */ Mg(e)) {
    wr(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [n, o, i, a] = e;
    return /* @__PURE__ */ Ti(n, o, i, a);
  } else if (r_(e))
    return wr(gh[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), gh[e];
  return e;
}, zs = [
  "setup",
  // Compute
  "read",
  // Read
  "resolveKeyframes",
  // Write/Read/Write/Read
  "preUpdate",
  // Compute
  "update",
  // Compute
  "preRender",
  // Compute
  "render",
  // Write
  "postRender"
  // Compute
];
function o_(e, n) {
  let o = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = !1, c = !1;
  const d = /* @__PURE__ */ new WeakSet();
  let p = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function h(S) {
    d.has(S) && (g.schedule(S), e()), S(p);
  }
  const g = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (S, l = !1, f = !1) => {
      const w = f && a ? o : i;
      return l && d.add(S), w.add(S), S;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (S) => {
      i.delete(S), d.delete(S);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (S) => {
      if (p = S, a) {
        c = !0;
        return;
      }
      a = !0;
      const l = o;
      o = i, i = l, o.forEach(h), o.clear(), a = !1, c && (c = !1, g.process(S));
    }
  };
  return g;
}
const i_ = 40;
function Rg(e, n) {
  let o = !1, i = !0;
  const a = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, c = () => o = !0, d = zs.reduce((R, N) => (R[N] = o_(c), R), {}), { setup: p, read: h, resolveKeyframes: g, preUpdate: S, update: l, preRender: f, render: v, postRender: w } = d, k = () => {
    const R = Wn.useManualTiming, N = R ? a.timestamp : performance.now();
    o = !1, R || (a.delta = i ? 1e3 / 60 : Math.max(Math.min(N - a.timestamp, i_), 1)), a.timestamp = N, a.isProcessing = !0, p.process(a), h.process(a), g.process(a), S.process(a), l.process(a), f.process(a), v.process(a), w.process(a), a.isProcessing = !1, o && n && (i = !1, e(k));
  }, x = () => {
    o = !0, i = !0, a.isProcessing || e(k);
  };
  return { schedule: zs.reduce((R, N) => {
    const O = d[N];
    return R[N] = (U, K = !1, G = !1) => (o || x(), O.schedule(U, K, G)), R;
  }, {}), cancel: (R) => {
    for (let N = 0; N < zs.length; N++)
      d[zs[N]].cancel(R);
  }, state: a, steps: d };
}
const { schedule: ke, cancel: Gn, state: Ze, steps: Uu } = /* @__PURE__ */ Rg(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Mt, !0);
let na;
function s_() {
  na = void 0;
}
const it = {
  now: () => (na === void 0 && it.set(Ze.isProcessing || Wn.useManualTiming ? Ze.timestamp : performance.now()), na),
  set: (e) => {
    na = e, queueMicrotask(s_);
  }
}, Dg = (e) => (n) => typeof n == "string" && n.startsWith(e), Ng = /* @__PURE__ */ Dg("--"), a_ = /* @__PURE__ */ Dg("var(--"), gd = (e) => a_(e) ? l_.test(e.split("/*")[0].trim()) : !1, l_ = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function Sh(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
const fo = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, mi = {
  ...fo,
  transform: (e) => en(0, 1, e)
}, $s = {
  ...fo,
  default: 1
}, li = (e) => Math.round(e * 1e5) / 1e5, vd = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function u_(e) {
  return e == null;
}
const c_ = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, Sd = (e, n) => (o) => !!(typeof o == "string" && c_.test(o) && o.startsWith(e) || n && !u_(o) && Object.prototype.hasOwnProperty.call(o, n)), Ig = (e, n, o) => (i) => {
  if (typeof i != "string")
    return i;
  const [a, c, d, p] = i.match(vd);
  return {
    [e]: parseFloat(a),
    [n]: parseFloat(c),
    [o]: parseFloat(d),
    alpha: p !== void 0 ? parseFloat(p) : 1
  };
}, d_ = (e) => en(0, 255, e), Hu = {
  ...fo,
  transform: (e) => Math.round(d_(e))
}, fr = {
  test: /* @__PURE__ */ Sd("rgb", "red"),
  parse: /* @__PURE__ */ Ig("red", "green", "blue"),
  transform: ({ red: e, green: n, blue: o, alpha: i = 1 }) => "rgba(" + Hu.transform(e) + ", " + Hu.transform(n) + ", " + Hu.transform(o) + ", " + li(mi.transform(i)) + ")"
};
function f_(e) {
  let n = "", o = "", i = "", a = "";
  return e.length > 5 ? (n = e.substring(1, 3), o = e.substring(3, 5), i = e.substring(5, 7), a = e.substring(7, 9)) : (n = e.substring(1, 2), o = e.substring(2, 3), i = e.substring(3, 4), a = e.substring(4, 5), n += n, o += o, i += i, a += a), {
    red: parseInt(n, 16),
    green: parseInt(o, 16),
    blue: parseInt(i, 16),
    alpha: a ? parseInt(a, 16) / 255 : 1
  };
}
const yc = {
  test: /* @__PURE__ */ Sd("#"),
  parse: f_,
  transform: fr.transform
}, ki = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (n) => typeof n == "string" && n.endsWith(e) && n.split(" ").length === 1,
  parse: parseFloat,
  transform: (n) => `${n}${e}`
}), dn = /* @__PURE__ */ ki("deg"), qt = /* @__PURE__ */ ki("%"), ne = /* @__PURE__ */ ki("px"), p_ = /* @__PURE__ */ ki("vh"), m_ = /* @__PURE__ */ ki("vw"), wh = {
  ...qt,
  parse: (e) => qt.parse(e) / 100,
  transform: (e) => qt.transform(e * 100)
}, no = {
  test: /* @__PURE__ */ Sd("hsl", "hue"),
  parse: /* @__PURE__ */ Ig("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: n, lightness: o, alpha: i = 1 }) => "hsla(" + Math.round(e) + ", " + qt.transform(li(n)) + ", " + qt.transform(li(o)) + ", " + li(mi.transform(i)) + ")"
}, Ve = {
  test: (e) => fr.test(e) || yc.test(e) || no.test(e),
  parse: (e) => fr.test(e) ? fr.parse(e) : no.test(e) ? no.parse(e) : yc.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? fr.transform(e) : no.transform(e),
  getAnimatableNone: (e) => {
    const n = Ve.parse(e);
    return n.alpha = 0, Ve.transform(n);
  }
}, h_ = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function y_(e) {
  var n, o;
  return isNaN(e) && typeof e == "string" && (((n = e.match(vd)) == null ? void 0 : n.length) || 0) + (((o = e.match(h_)) == null ? void 0 : o.length) || 0) > 0;
}
const jg = "number", Fg = "color", g_ = "var", v_ = "var(", xh = "${}", S_ = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function lo(e) {
  const n = e.toString(), o = [], i = {
    color: [],
    number: [],
    var: []
  }, a = [];
  let c = 0;
  const p = n.replace(S_, (h) => (Ve.test(h) ? (i.color.push(c), a.push(Fg), o.push(Ve.parse(h))) : h.startsWith(v_) ? (i.var.push(c), a.push(g_), o.push(h)) : (i.number.push(c), a.push(jg), o.push(parseFloat(h))), ++c, xh)).split(xh);
  return { values: o, split: p, indexes: i, types: a };
}
function w_(e) {
  return lo(e).values;
}
function Og({ split: e, types: n }) {
  const o = e.length;
  return (i) => {
    let a = "";
    for (let c = 0; c < o; c++)
      if (a += e[c], i[c] !== void 0) {
        const d = n[c];
        d === jg ? a += li(i[c]) : d === Fg ? a += Ve.transform(i[c]) : a += i[c];
      }
    return a;
  };
}
function x_(e) {
  return Og(lo(e));
}
const __ = (e) => typeof e == "number" ? 0 : Ve.test(e) ? Ve.getAnimatableNone(e) : e, T_ = (e, n) => typeof e == "number" ? n != null && n.trim().endsWith("/") ? e : 0 : __(e);
function k_(e) {
  const n = lo(e);
  return Og(n)(n.values.map((i, a) => T_(i, n.split[a])));
}
const Bt = {
  test: y_,
  parse: w_,
  createTransformer: x_,
  getAnimatableNone: k_
};
function Wu(e, n, o) {
  return o < 0 && (o += 1), o > 1 && (o -= 1), o < 1 / 6 ? e + (n - e) * 6 * o : o < 1 / 2 ? n : o < 2 / 3 ? e + (n - e) * (2 / 3 - o) * 6 : e;
}
function A_({ hue: e, saturation: n, lightness: o, alpha: i }) {
  e /= 360, n /= 100, o /= 100;
  let a = 0, c = 0, d = 0;
  if (!n)
    a = c = d = o;
  else {
    const p = o < 0.5 ? o * (1 + n) : o + n - o * n, h = 2 * o - p;
    a = Wu(h, p, e + 1 / 3), c = Wu(h, p, e), d = Wu(h, p, e - 1 / 3);
  }
  return {
    red: Math.round(a * 255),
    green: Math.round(c * 255),
    blue: Math.round(d * 255),
    alpha: i
  };
}
function ha(e, n) {
  return (o) => o > 0 ? n : e;
}
const Te = (e, n, o) => e + (n - e) * o, Gu = (e, n, o) => {
  const i = e * e, a = o * (n * n - i) + i;
  return a < 0 ? 0 : Math.sqrt(a);
}, C_ = [yc, fr, no], P_ = (e) => C_.find((n) => n.test(e));
function _h(e) {
  const n = P_(e);
  if (xi(!!n, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !n)
    return !1;
  let o = n.parse(e);
  return n === no && (o = A_(o)), o;
}
const Th = (e, n) => {
  const o = _h(e), i = _h(n);
  if (!o || !i)
    return ha(e, n);
  const a = { ...o };
  return (c) => (a.red = Gu(o.red, i.red, c), a.green = Gu(o.green, i.green, c), a.blue = Gu(o.blue, i.blue, c), a.alpha = Te(o.alpha, i.alpha, c), fr.transform(a));
}, gc = /* @__PURE__ */ new Set(["none", "hidden"]);
function E_(e, n) {
  return gc.has(e) ? (o) => o <= 0 ? e : n : (o) => o >= 1 ? n : e;
}
function b_(e, n) {
  return (o) => Te(e, n, o);
}
function wd(e) {
  return typeof e == "number" ? b_ : typeof e == "string" ? gd(e) ? ha : Ve.test(e) ? Th : D_ : Array.isArray(e) ? Lg : typeof e == "object" ? Ve.test(e) ? Th : M_ : ha;
}
function Lg(e, n) {
  const o = [...e], i = o.length, a = e.map((c, d) => wd(c)(c, n[d]));
  return (c) => {
    for (let d = 0; d < i; d++)
      o[d] = a[d](c);
    return o;
  };
}
function M_(e, n) {
  const o = { ...e, ...n }, i = {};
  for (const a in o)
    e[a] !== void 0 && n[a] !== void 0 && (i[a] = wd(e[a])(e[a], n[a]));
  return (a) => {
    for (const c in i)
      o[c] = i[c](a);
    return o;
  };
}
function R_(e, n) {
  const o = [], i = { color: 0, var: 0, number: 0 };
  for (let a = 0; a < n.values.length; a++) {
    const c = n.types[a], d = e.indexes[c][i[c]], p = e.values[d] ?? 0;
    o[a] = p, i[c]++;
  }
  return o;
}
const D_ = (e, n) => {
  const o = Bt.createTransformer(n), i = lo(e), a = lo(n);
  return i.indexes.var.length === a.indexes.var.length && i.indexes.color.length === a.indexes.color.length && i.indexes.number.length >= a.indexes.number.length ? gc.has(e) && !a.values.length || gc.has(n) && !i.values.length ? E_(e, n) : _i(Lg(R_(i, a), a.values), o) : (xi(!0, `Complex values '${e}' and '${n}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), ha(e, n));
};
function Vg(e, n, o) {
  return typeof e == "number" && typeof n == "number" && typeof o == "number" ? Te(e, n, o) : wd(e)(e, n);
}
const N_ = (e) => {
  const n = ({ timestamp: o }) => e(o);
  return {
    start: (o = !0) => ke.update(n, o),
    stop: () => Gn(n),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Ze.isProcessing ? Ze.timestamp : it.now()
  };
}, Bg = (e, n, o = 10) => {
  let i = "";
  const a = Math.max(Math.round(n / o), 2);
  for (let c = 0; c < a; c++)
    i += Math.round(e(c / (a - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${i.substring(0, i.length - 2)})`;
}, ya = 2e4;
function xd(e) {
  let n = 0;
  const o = 50;
  let i = e.next(n);
  for (; !i.done && n < ya; )
    n += o, i = e.next(n);
  return n >= ya ? 1 / 0 : n;
}
function I_(e, n = 100, o) {
  const i = o({ ...e, keyframes: [0, n] }), a = Math.min(xd(i), ya);
  return {
    type: "keyframes",
    ease: (c) => i.next(a * c).value / n,
    duration: /* @__PURE__ */ bt(a)
  };
}
const Ie = {
  // Default spring physics
  stiffness: 100,
  damping: 10,
  mass: 1,
  velocity: 0,
  // Default duration/bounce-based options
  duration: 800,
  // in ms
  bounce: 0.3,
  visualDuration: 0.3,
  // in seconds
  // Rest thresholds
  restSpeed: {
    granular: 0.01,
    default: 2
  },
  restDelta: {
    granular: 5e-3,
    default: 0.5
  },
  // Limits
  minDuration: 0.01,
  // in seconds
  maxDuration: 10,
  // in seconds
  minDamping: 0.05,
  maxDamping: 1
};
function vc(e, n) {
  return e * Math.sqrt(1 - n * n);
}
const j_ = 12;
function F_(e, n, o) {
  let i = o;
  for (let a = 1; a < j_; a++)
    i = i - e(i) / n(i);
  return i;
}
const Ku = 1e-3;
function O_({ duration: e = Ie.duration, bounce: n = Ie.bounce, velocity: o = Ie.velocity, mass: i = Ie.mass }) {
  let a, c;
  xi(e <= /* @__PURE__ */ mt(Ie.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let d = 1 - n;
  d = en(Ie.minDamping, Ie.maxDamping, d), e = en(Ie.minDuration, Ie.maxDuration, /* @__PURE__ */ bt(e)), d < 1 ? (a = (g) => {
    const S = g * d, l = S * e, f = S - o, v = vc(g, d), w = Math.exp(-l);
    return Ku - f / v * w;
  }, c = (g) => {
    const l = g * d * e, f = l * o + o, v = Math.pow(d, 2) * Math.pow(g, 2) * e, w = Math.exp(-l), k = vc(Math.pow(g, 2), d);
    return (-a(g) + Ku > 0 ? -1 : 1) * ((f - v) * w) / k;
  }) : (a = (g) => {
    const S = Math.exp(-g * e), l = (g - o) * e + 1;
    return -Ku + S * l;
  }, c = (g) => {
    const S = Math.exp(-g * e), l = (o - g) * (e * e);
    return S * l;
  });
  const p = 5 / e, h = F_(a, c, p);
  if (e = /* @__PURE__ */ mt(e), isNaN(h))
    return {
      stiffness: Ie.stiffness,
      damping: Ie.damping,
      duration: e
    };
  {
    const g = Math.pow(h, 2) * i;
    return {
      stiffness: g,
      damping: d * 2 * Math.sqrt(i * g),
      duration: e
    };
  }
}
const L_ = ["duration", "bounce"], V_ = ["stiffness", "damping", "mass"];
function kh(e, n) {
  return n.some((o) => e[o] !== void 0);
}
function B_(e) {
  let n = {
    velocity: Ie.velocity,
    stiffness: Ie.stiffness,
    damping: Ie.damping,
    mass: Ie.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!kh(e, V_) && kh(e, L_))
    if (n.velocity = 0, e.visualDuration) {
      const o = e.visualDuration, i = 2 * Math.PI / (o * 1.2), a = i * i, c = 2 * en(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(a);
      n = {
        ...n,
        mass: Ie.mass,
        stiffness: a,
        damping: c
      };
    } else {
      const o = O_({ ...e, velocity: 0 });
      n = {
        ...n,
        ...o,
        mass: Ie.mass
      }, n.isResolvedFromDuration = !0;
    }
  return n;
}
function ga(e = Ie.visualDuration, n = Ie.bounce) {
  const o = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: n
  } : e;
  let { restSpeed: i, restDelta: a } = o;
  const c = o.keyframes[0], d = o.keyframes[o.keyframes.length - 1], p = { done: !1, value: c }, { stiffness: h, damping: g, mass: S, duration: l, velocity: f, isResolvedFromDuration: v } = B_({
    ...o,
    velocity: -/* @__PURE__ */ bt(o.velocity || 0)
  }), w = f || 0, k = g / (2 * Math.sqrt(h * S)), x = d - c, A = /* @__PURE__ */ bt(Math.sqrt(h / S)), E = Math.abs(x) < 5;
  i || (i = E ? Ie.restSpeed.granular : Ie.restSpeed.default), a || (a = E ? Ie.restDelta.granular : Ie.restDelta.default);
  let R, N, O, U, K, G;
  if (k < 1)
    O = vc(A, k), U = (w + k * A * x) / O, R = (X) => {
      const ae = Math.exp(-k * A * X);
      return d - ae * (U * Math.sin(O * X) + x * Math.cos(O * X));
    }, K = k * A * U + x * O, G = k * A * x - U * O, N = (X) => Math.exp(-k * A * X) * (K * Math.sin(O * X) + G * Math.cos(O * X));
  else if (k === 1) {
    R = (ae) => d - Math.exp(-A * ae) * (x + (w + A * x) * ae);
    const X = w + A * x;
    N = (ae) => Math.exp(-A * ae) * (A * X * ae - w);
  } else {
    const X = A * Math.sqrt(k * k - 1);
    R = (ue) => {
      const _e = Math.exp(-k * A * ue), ve = Math.min(X * ue, 300);
      return d - _e * ((w + k * A * x) * Math.sinh(ve) + X * x * Math.cosh(ve)) / X;
    };
    const ae = (w + k * A * x) / X, q = k * A * ae - x * X, de = k * A * x - ae * X;
    N = (ue) => {
      const _e = Math.exp(-k * A * ue), ve = Math.min(X * ue, 300);
      return _e * (q * Math.sinh(ve) + de * Math.cosh(ve));
    };
  }
  const L = {
    calculatedDuration: v && l || null,
    velocity: (X) => /* @__PURE__ */ mt(N(X)),
    next: (X) => {
      if (!v && k < 1) {
        const q = Math.exp(-k * A * X), de = Math.sin(O * X), ue = Math.cos(O * X), _e = d - q * (U * de + x * ue), ve = /* @__PURE__ */ mt(q * (K * de + G * ue));
        return p.done = Math.abs(ve) <= i && Math.abs(d - _e) <= a, p.value = p.done ? d : _e, p;
      }
      const ae = R(X);
      if (v)
        p.done = X >= l;
      else {
        const q = /* @__PURE__ */ mt(N(X));
        p.done = Math.abs(q) <= i && Math.abs(d - ae) <= a;
      }
      return p.value = p.done ? d : ae, p;
    },
    toString: () => {
      const X = Math.min(xd(L), ya), ae = Bg((q) => L.next(X * q).value, X, 30);
      return X + "ms " + ae;
    },
    toTransition: () => {
    }
  };
  return L;
}
ga.applyToOptions = (e) => {
  const n = I_(e, 100, ga);
  return e.ease = n.ease, e.duration = /* @__PURE__ */ mt(n.duration), e.type = "keyframes", e;
};
const z_ = 5;
function zg(e, n, o) {
  const i = Math.max(n - z_, 0);
  return /* @__PURE__ */ wg(o - e(i), n - i);
}
function Sc({ keyframes: e, velocity: n = 0, power: o = 0.8, timeConstant: i = 325, bounceDamping: a = 10, bounceStiffness: c = 500, modifyTarget: d, min: p, max: h, restDelta: g = 0.5, restSpeed: S }) {
  const l = e[0], f = {
    done: !1,
    value: l
  }, v = (G) => p !== void 0 && G < p || h !== void 0 && G > h, w = (G) => p === void 0 ? h : h === void 0 || Math.abs(p - G) < Math.abs(h - G) ? p : h;
  let k = o * n;
  const x = l + k, A = d === void 0 ? x : d(x);
  A !== x && (k = A - l);
  const E = (G) => -k * Math.exp(-G / i), R = (G) => A + E(G), N = (G) => {
    const L = E(G), X = R(G);
    f.done = Math.abs(L) <= g, f.value = f.done ? A : X;
  };
  let O, U;
  const K = (G) => {
    v(f.value) && (O = G, U = ga({
      keyframes: [f.value, w(f.value)],
      velocity: zg(R, G, f.value),
      // TODO: This should be passing * 1000
      damping: a,
      stiffness: c,
      restDelta: g,
      restSpeed: S
    }));
  };
  return K(0), {
    calculatedDuration: null,
    next: (G) => {
      let L = !1;
      return !U && O === void 0 && (L = !0, N(G), K(G)), O !== void 0 && G >= O ? U.next(G - O) : (!L && N(G), f);
    }
  };
}
function $_(e, n, o) {
  const i = [], a = o || Wn.mix || Vg, c = e.length - 1;
  for (let d = 0; d < c; d++) {
    let p = a(e[d], e[d + 1]);
    if (n) {
      const h = Array.isArray(n) ? n[d] || Mt : n;
      p = _i(h, p);
    }
    i.push(p);
  }
  return i;
}
function U_(e, n, { clamp: o = !0, ease: i, mixer: a } = {}) {
  const c = e.length;
  if (wr(c === n.length, "Both input and output ranges must be the same length", "range-length"), c === 1)
    return () => n[0];
  if (c === 2 && n[0] === n[1])
    return () => n[1];
  const d = e[0] === e[1];
  e[0] > e[c - 1] && (e = [...e].reverse(), n = [...n].reverse());
  const p = $_(n, i, a), h = p.length, g = (S) => {
    if (d && S < e[0])
      return n[0];
    let l = 0;
    if (h > 1)
      for (; l < e.length - 2 && !(S < e[l + 1]); l++)
        ;
    const f = /* @__PURE__ */ pi(e[l], e[l + 1], S);
    return p[l](f);
  };
  return o ? (S) => g(en(e[0], e[c - 1], S)) : g;
}
function H_(e, n) {
  const o = e[e.length - 1];
  for (let i = 1; i <= n; i++) {
    const a = /* @__PURE__ */ pi(0, n, i);
    e.push(Te(o, 1, a));
  }
}
function W_(e) {
  const n = [0];
  return H_(n, e.length - 1), n;
}
function G_(e, n) {
  return e.map((o) => o * n);
}
function K_(e, n) {
  return e.map(() => n || bg).splice(0, e.length - 1);
}
function ui({ duration: e = 300, keyframes: n, times: o, ease: i = "easeInOut" }) {
  const a = /* @__PURE__ */ n_(i) ? i.map(vh) : vh(i), c = {
    done: !1,
    value: n[0]
  }, d = G_(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    o && o.length === n.length ? o : W_(n),
    e
  ), p = U_(d, n, {
    ease: Array.isArray(a) ? a : K_(n, a)
  });
  return {
    calculatedDuration: e,
    next: (h) => (c.value = p(h), c.done = h >= e, c)
  };
}
const Y_ = (e) => e !== null;
function Na(e, { repeat: n, repeatType: o = "loop" }, i, a = 1) {
  const c = e.filter(Y_), p = a < 0 || n && o !== "loop" && n % 2 === 1 ? 0 : c.length - 1;
  return !p || i === void 0 ? c[p] : i;
}
const Q_ = {
  decay: Sc,
  inertia: Sc,
  tween: ui,
  keyframes: ui,
  spring: ga
};
function $g(e) {
  typeof e.type == "string" && (e.type = Q_[e.type]);
}
class _d {
  constructor() {
    this.updateFinished();
  }
  get finished() {
    return this._finished;
  }
  updateFinished() {
    this._finished = new Promise((n) => {
      this.resolve = n;
    });
  }
  notifyFinished() {
    this.resolve();
  }
  /**
   * Allows the animation to be awaited.
   *
   * @deprecated Use `finished` instead.
   */
  then(n, o) {
    return this.finished.then(n, o);
  }
}
const X_ = (e) => e / 100;
class va extends _d {
  constructor(n) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      var i, a;
      const { motionValue: o } = this.options;
      o && o.updatedAt !== it.now() && this.tick(it.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), (a = (i = this.options).onStop) == null || a.call(i));
    }, this.options = n, this.initAnimation(), this.play(), n.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: n } = this;
    $g(n);
    const { type: o = ui, repeat: i = 0, repeatDelay: a = 0, repeatType: c, velocity: d = 0 } = n;
    let { keyframes: p } = n;
    const h = o || ui;
    h !== ui && typeof p[0] != "number" && (this.mixKeyframes = _i(X_, Vg(p[0], p[1])), p = [0, 100]);
    const g = h({ ...n, keyframes: p });
    c === "mirror" && (this.mirroredGenerator = h({
      ...n,
      keyframes: [...p].reverse(),
      velocity: -d
    })), g.calculatedDuration === null && (g.calculatedDuration = xd(g));
    const { calculatedDuration: S } = g;
    this.calculatedDuration = S, this.resolvedDuration = S + a, this.totalDuration = this.resolvedDuration * (i + 1) - a, this.generator = g;
  }
  updateTime(n) {
    const o = Math.round(n - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = o;
  }
  tick(n, o = !1) {
    const { generator: i, totalDuration: a, mixKeyframes: c, mirroredGenerator: d, resolvedDuration: p, calculatedDuration: h } = this;
    if (this.startTime === null)
      return i.next(0);
    const { delay: g = 0, keyframes: S, repeat: l, repeatType: f, repeatDelay: v, type: w, onUpdate: k, finalKeyframe: x } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, n) : this.speed < 0 && (this.startTime = Math.min(n - a / this.speed, this.startTime)), o ? this.currentTime = n : this.updateTime(n);
    const A = this.currentTime - g * (this.playbackSpeed >= 0 ? 1 : -1), E = this.playbackSpeed >= 0 ? A < 0 : A > a;
    this.currentTime = Math.max(A, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = a);
    let R = this.currentTime, N = i;
    if (l) {
      const G = Math.min(this.currentTime, a) / p;
      let L = Math.floor(G), X = G % 1;
      !X && G >= 1 && (X = 1), X === 1 && L--, L = Math.min(L, l + 1), !!(L % 2) && (f === "reverse" ? (X = 1 - X, v && (X -= v / p)) : f === "mirror" && (N = d)), R = en(0, 1, X) * p;
    }
    let O;
    E ? (this.delayState.value = S[0], O = this.delayState) : O = N.next(R), c && !E && (O.value = c(O.value));
    let { done: U } = O;
    !E && h !== null && (U = this.playbackSpeed >= 0 ? this.currentTime >= a : this.currentTime <= 0);
    const K = this.holdTime === null && (this.state === "finished" || this.state === "running" && U);
    return K && w !== Sc && (O.value = Na(S, this.options, x, this.speed)), k && k(O.value), K && this.finish(), O;
  }
  /**
   * Allows the returned animation to be awaited or promise-chained. Currently
   * resolves when the animation finishes at all but in a future update could/should
   * reject if its cancels.
   */
  then(n, o) {
    return this.finished.then(n, o);
  }
  get duration() {
    return /* @__PURE__ */ bt(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: n = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ bt(n);
  }
  get time() {
    return /* @__PURE__ */ bt(this.currentTime);
  }
  set time(n) {
    n = /* @__PURE__ */ mt(n), this.currentTime = n, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = n : this.driver && (this.startTime = this.driver.now() - n / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = n, this.tick(n));
  }
  /**
   * Returns the generator's velocity at the current time in units/second.
   * Uses the analytical derivative when available (springs), avoiding
   * the MotionValue's frame-dependent velocity estimation.
   */
  getGeneratorVelocity() {
    const n = this.currentTime;
    if (n <= 0)
      return this.options.velocity || 0;
    if (this.generator.velocity)
      return this.generator.velocity(n);
    const o = this.generator.next(n).value;
    return zg((i) => this.generator.next(i).value, n, o);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(n) {
    const o = this.playbackSpeed !== n;
    o && this.driver && this.updateTime(it.now()), this.playbackSpeed = n, o && this.driver && (this.time = /* @__PURE__ */ bt(this.currentTime));
  }
  play() {
    var a, c;
    if (this.isStopped)
      return;
    const { driver: n = N_, startTime: o } = this.options;
    this.driver || (this.driver = n((d) => this.tick(d))), (c = (a = this.options).onPlay) == null || c.call(a);
    const i = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = i) : this.holdTime !== null ? this.startTime = i - this.holdTime : this.startTime || (this.startTime = o ?? i), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(it.now()), this.holdTime = this.currentTime;
  }
  complete() {
    this.state !== "running" && this.play(), this.state = "finished", this.holdTime = null;
  }
  finish() {
    var n, o;
    this.notifyFinished(), this.teardown(), this.state = "finished", (o = (n = this.options).onComplete) == null || o.call(n);
  }
  cancel() {
    var n, o;
    this.holdTime = null, this.startTime = 0, this.tick(0), this.teardown(), (o = (n = this.options).onCancel) == null || o.call(n);
  }
  teardown() {
    this.state = "idle", this.stopDriver(), this.startTime = this.holdTime = null;
  }
  stopDriver() {
    this.driver && (this.driver.stop(), this.driver = void 0);
  }
  sample(n) {
    return this.startTime = 0, this.tick(n, !0);
  }
  attachTimeline(n) {
    var o;
    return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), (o = this.driver) == null || o.stop(), n.observe(this);
  }
}
function Z_(e) {
  for (let n = 1; n < e.length; n++)
    e[n] ?? (e[n] = e[n - 1]);
}
const pr = (e) => e * 180 / Math.PI, wc = (e) => {
  const n = pr(Math.atan2(e[1], e[0]));
  return xc(n);
}, J_ = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: wc,
  rotateZ: wc,
  skewX: (e) => pr(Math.atan(e[1])),
  skewY: (e) => pr(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, xc = (e) => (e = e % 360, e < 0 && (e += 360), e), Ah = wc, Ch = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), Ph = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), q_ = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: Ch,
  scaleY: Ph,
  scale: (e) => (Ch(e) + Ph(e)) / 2,
  rotateX: (e) => xc(pr(Math.atan2(e[6], e[5]))),
  rotateY: (e) => xc(pr(Math.atan2(-e[2], e[0]))),
  rotateZ: Ah,
  rotate: Ah,
  skewX: (e) => pr(Math.atan(e[4])),
  skewY: (e) => pr(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function _c(e) {
  return e.includes("scale") ? 1 : 0;
}
function Tc(e, n) {
  if (!e || e === "none")
    return _c(n);
  const o = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let i, a;
  if (o)
    i = q_, a = o;
  else {
    const p = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    i = J_, a = p;
  }
  if (!a)
    return _c(n);
  const c = i[n], d = a[1].split(",").map(t1);
  return typeof c == "function" ? c(d) : d[c];
}
const e1 = (e, n) => {
  const { transform: o = "none" } = getComputedStyle(e);
  return Tc(o, n);
};
function t1(e) {
  return parseFloat(e.trim());
}
const po = [
  "transformPerspective",
  "x",
  "y",
  "z",
  "translateX",
  "translateY",
  "translateZ",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skew",
  "skewX",
  "skewY"
], mo = /* @__PURE__ */ new Set([...po, "pathRotation"]), Eh = (e) => e === fo || e === ne, n1 = /* @__PURE__ */ new Set(["x", "y", "z"]), r1 = po.filter((e) => !n1.has(e));
function o1(e) {
  const n = [];
  return r1.forEach((o) => {
    const i = e.getValue(o);
    i !== void 0 && (n.push([o, i.get()]), i.set(o.startsWith("scale") ? 1 : 0));
  }), n;
}
const $n = {
  // Dimensions
  width: ({ x: e }, { paddingLeft: n = "0", paddingRight: o = "0", boxSizing: i }) => {
    const a = e.max - e.min;
    return i === "border-box" ? a : a - parseFloat(n) - parseFloat(o);
  },
  height: ({ y: e }, { paddingTop: n = "0", paddingBottom: o = "0", boxSizing: i }) => {
    const a = e.max - e.min;
    return i === "border-box" ? a : a - parseFloat(n) - parseFloat(o);
  },
  top: (e, { top: n }) => parseFloat(n),
  left: (e, { left: n }) => parseFloat(n),
  bottom: ({ y: e }, { top: n }) => parseFloat(n) + (e.max - e.min),
  right: ({ x: e }, { left: n }) => parseFloat(n) + (e.max - e.min),
  // Transform
  x: (e, { transform: n }) => Tc(n, "x"),
  y: (e, { transform: n }) => Tc(n, "y")
};
$n.translateX = $n.x;
$n.translateY = $n.y;
const mr = /* @__PURE__ */ new Set();
let kc = !1, Ac = !1, Cc = !1;
function Ug() {
  if (Ac) {
    const e = Array.from(mr).filter((i) => i.needsMeasurement), n = new Set(e.map((i) => i.element)), o = /* @__PURE__ */ new Map();
    n.forEach((i) => {
      const a = o1(i);
      a.length && (o.set(i, a), i.render());
    }), e.forEach((i) => i.measureInitialState()), n.forEach((i) => {
      i.render();
      const a = o.get(i);
      a && a.forEach(([c, d]) => {
        var p;
        (p = i.getValue(c)) == null || p.set(d);
      });
    }), e.forEach((i) => i.measureEndState()), e.forEach((i) => {
      i.suspendedScrollY !== void 0 && window.scrollTo(0, i.suspendedScrollY);
    });
  }
  Ac = !1, kc = !1, mr.forEach((e) => e.complete(Cc)), mr.clear();
}
function Hg() {
  mr.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (Ac = !0);
  });
}
function i1() {
  Cc = !0, Hg(), Ug(), Cc = !1;
}
class Td {
  constructor(n, o, i, a, c, d = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...n], this.onComplete = o, this.name = i, this.motionValue = a, this.element = c, this.isAsync = d;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (mr.add(this), kc || (kc = !0, ke.read(Hg), ke.resolveKeyframes(Ug))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: n, name: o, element: i, motionValue: a } = this;
    if (n[0] === null) {
      const c = a == null ? void 0 : a.get(), d = n[n.length - 1];
      if (c !== void 0)
        n[0] = c;
      else if (i && o) {
        const p = i.readValue(o, d);
        p != null && (n[0] = p);
      }
      n[0] === void 0 && (n[0] = d), a && c === void 0 && a.set(n[0]);
    }
    Z_(n);
  }
  setFinalKeyframe() {
  }
  measureInitialState() {
  }
  renderEndStyles() {
  }
  measureEndState() {
  }
  complete(n = !1) {
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, n), mr.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (mr.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const s1 = (e) => e.startsWith("--");
function Wg(e, n, o) {
  s1(n) ? e.style.setProperty(n, o) : e.style[n] = o;
}
const a1 = {};
function Gg(e, n) {
  const o = /* @__PURE__ */ Sg(e);
  return () => a1[n] ?? o();
}
const l1 = /* @__PURE__ */ Gg(() => window.ScrollTimeline !== void 0, "scrollTimeline"), Kg = /* @__PURE__ */ Gg(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), si = ([e, n, o, i]) => `cubic-bezier(${e}, ${n}, ${o}, ${i})`, bh = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ si([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ si([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ si([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ si([0.33, 1.53, 0.69, 0.99])
};
function Yg(e, n) {
  if (e)
    return typeof e == "function" ? Kg() ? Bg(e, n) : "ease-out" : /* @__PURE__ */ Mg(e) ? si(e) : Array.isArray(e) ? e.map((o) => Yg(o, n) || bh.easeOut) : bh[e];
}
function u1(e, n, o, { delay: i = 0, duration: a = 300, repeat: c = 0, repeatType: d = "loop", ease: p = "easeOut", times: h } = {}, g = void 0) {
  const S = {
    [n]: o
  };
  h && (S.offset = h);
  const l = Yg(p, a);
  Array.isArray(l) && (S.easing = l);
  const f = {
    delay: i,
    duration: a,
    easing: Array.isArray(l) ? "linear" : l,
    fill: "both",
    iterations: c + 1,
    direction: d === "reverse" ? "alternate" : "normal"
  };
  return g && (f.pseudoElement = g), e.animate(S, f);
}
function Qg(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function c1({ type: e, ...n }) {
  return Qg(e) && Kg() ? e.applyToOptions(n) : (n.duration ?? (n.duration = 300), n.ease ?? (n.ease = "easeOut"), n);
}
class Xg extends _d {
  constructor(n) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !n)
      return;
    const { element: o, name: i, keyframes: a, pseudoElement: c, allowFlatten: d = !1, finalKeyframe: p, onComplete: h } = n;
    this.isPseudoElement = !!c, this.allowFlatten = d, this.options = n, wr(typeof n.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const g = c1(n);
    this.animation = u1(o, i, a, g, c), g.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !c) {
        const S = Na(a, this.options, p, this.speed);
        this.updateMotionValue && this.updateMotionValue(S), Wg(o, i, S), this.animation.cancel();
      }
      h == null || h(), this.notifyFinished();
    };
  }
  play() {
    this.isStopped || (this.manualStartTime = null, this.animation.play(), this.state === "finished" && this.updateFinished());
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    var n, o;
    (o = (n = this.animation).finish) == null || o.call(n);
  }
  cancel() {
    try {
      this.animation.cancel();
    } catch {
    }
  }
  stop() {
    if (this.isStopped)
      return;
    this.isStopped = !0;
    const { state: n } = this;
    n === "idle" || n === "finished" || (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel());
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * In this method, we commit styles back to the DOM before cancelling
   * the animation.
   *
   * This is designed to be overridden by NativeAnimationExtended, which
   * will create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to also correctly calculate velocity for any subsequent animation
   * while deferring the commit until the next animation frame.
   */
  commitStyles() {
    var o, i, a;
    const n = (o = this.options) == null ? void 0 : o.element;
    !this.isPseudoElement && (n != null && n.isConnected) && ((a = (i = this.animation).commitStyles) == null || a.call(i));
  }
  get duration() {
    var o, i;
    const n = ((i = (o = this.animation.effect) == null ? void 0 : o.getComputedTiming) == null ? void 0 : i.call(o).duration) || 0;
    return /* @__PURE__ */ bt(Number(n));
  }
  get iterationDuration() {
    const { delay: n = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ bt(n);
  }
  get time() {
    return /* @__PURE__ */ bt(Number(this.animation.currentTime) || 0);
  }
  set time(n) {
    const o = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ mt(n), o && this.animation.pause();
  }
  /**
   * The playback speed of the animation.
   * 1 = normal speed, 2 = double speed, 0.5 = half speed.
   */
  get speed() {
    return this.animation.playbackRate;
  }
  set speed(n) {
    n < 0 && (this.finishedTime = null), this.animation.playbackRate = n;
  }
  get state() {
    return this.finishedTime !== null ? "finished" : this.animation.playState;
  }
  get startTime() {
    return this.manualStartTime ?? Number(this.animation.startTime);
  }
  set startTime(n) {
    this.manualStartTime = this.animation.startTime = n;
  }
  /**
   * Attaches a timeline to the animation, for instance the `ScrollTimeline`.
   */
  attachTimeline({ timeline: n, rangeStart: o, rangeEnd: i, observe: a }) {
    var c;
    return this.allowFlatten && ((c = this.animation.effect) == null || c.updateTiming({ easing: "linear" })), this.animation.onfinish = null, n && l1() ? (this.animation.timeline = n, o && (this.animation.rangeStart = o), i && (this.animation.rangeEnd = i), Mt) : a(this);
  }
}
const Zg = {
  anticipate: Cg,
  backInOut: Ag,
  circInOut: Eg
};
function d1(e) {
  return e in Zg;
}
function f1(e) {
  typeof e.ease == "string" && d1(e.ease) && (e.ease = Zg[e.ease]);
}
const Yu = 10;
class p1 extends Xg {
  constructor(n) {
    f1(n), $g(n), super(n), n.startTime !== void 0 && n.autoplay !== !1 && (this.startTime = n.startTime), this.options = n;
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * Rather than read committed styles back out of the DOM, we can
   * create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to calculate velocity for any subsequent animation.
   */
  updateMotionValue(n) {
    const { motionValue: o, onUpdate: i, onComplete: a, element: c, ...d } = this.options;
    if (!o)
      return;
    if (n !== void 0) {
      o.set(n);
      return;
    }
    const p = new va({
      ...d,
      autoplay: !1
    }), h = Math.max(Yu, it.now() - this.startTime), g = en(0, Yu, h - Yu), S = p.sample(h).value, { name: l } = this.options;
    c && l && Wg(c, l, S), o.setWithVelocity(p.sample(Math.max(0, h - g)).value, S, g), p.stop();
  }
}
const Mh = (e, n) => n === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(Bt.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function m1(e) {
  const n = e[0];
  if (e.length === 1)
    return !0;
  for (let o = 0; o < e.length; o++)
    if (e[o] !== n)
      return !0;
}
function h1(e, n, o, i) {
  const a = e[0];
  if (a === null)
    return !1;
  if (n === "display" || n === "visibility")
    return !0;
  const c = e[e.length - 1], d = Mh(a, n), p = Mh(c, n);
  return xi(d === p, `You are trying to animate ${n} from "${a}" to "${c}". "${d ? c : a}" is not an animatable value.`, "value-not-animatable"), !d || !p ? !1 : m1(e) || (o === "spring" || Qg(o)) && i;
}
function Pc(e) {
  e.duration = 0, e.type = "keyframes";
}
const Jg = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), y1 = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function g1(e) {
  for (let n = 0; n < e.length; n++)
    if (typeof e[n] == "string" && y1.test(e[n]))
      return !0;
  return !1;
}
const v1 = /* @__PURE__ */ new Set([
  "color",
  "backgroundColor",
  "outlineColor",
  "fill",
  "stroke",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor"
]), S1 = /* @__PURE__ */ Sg(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function w1(e) {
  var l;
  const { motionValue: n, name: o, repeatDelay: i, repeatType: a, damping: c, type: d, keyframes: p } = e;
  if (!(((l = n == null ? void 0 : n.owner) == null ? void 0 : l.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: g, transformTemplate: S } = n.owner.getProps();
  return S1() && o && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (Jg.has(o) || v1.has(o) && g1(p)) && (o !== "transform" || !S) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !g && !i && a !== "mirror" && c !== 0 && d !== "inertia";
}
const x1 = 40;
class _1 extends _d {
  constructor({ autoplay: n = !0, delay: o = 0, type: i = "keyframes", repeat: a = 0, repeatDelay: c = 0, repeatType: d = "loop", keyframes: p, name: h, motionValue: g, element: S, ...l }) {
    var w;
    super(), this.stop = () => {
      var k, x;
      this._animation && (this._animation.stop(), (k = this.stopTimeline) == null || k.call(this)), (x = this.keyframeResolver) == null || x.cancel();
    }, this.createdAt = it.now();
    const f = {
      autoplay: n,
      delay: o,
      type: i,
      repeat: a,
      repeatDelay: c,
      repeatType: d,
      name: h,
      motionValue: g,
      element: S,
      ...l
    }, v = (S == null ? void 0 : S.KeyframeResolver) || Td;
    this.keyframeResolver = new v(p, (k, x, A) => this.onKeyframesResolved(k, x, f, !A), h, g, S), (w = this.keyframeResolver) == null || w.scheduleResolve();
  }
  onKeyframesResolved(n, o, i, a) {
    var A, E;
    this.keyframeResolver = void 0;
    const { name: c, type: d, velocity: p, delay: h, isHandoff: g, onUpdate: S } = i;
    this.resolvedAt = it.now();
    let l = !0;
    h1(n, c, d, p) || (l = !1, (Wn.instantAnimations || !h) && (S == null || S(Na(n, i, o))), n[0] = n[n.length - 1], Pc(i), i.repeat = 0);
    const v = {
      startTime: a ? this.resolvedAt ? this.resolvedAt - this.createdAt > x1 ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: o,
      ...i,
      keyframes: n
    }, w = l && !g && w1(v), k = (E = (A = v.motionValue) == null ? void 0 : A.owner) == null ? void 0 : E.current;
    let x;
    if (w)
      try {
        x = new p1({
          ...v,
          element: k
        });
      } catch {
        x = new va(v);
      }
    else
      x = new va(v);
    x.finished.then(() => {
      this.notifyFinished();
    }).catch(Mt), this.pendingTimeline && (this.stopTimeline = x.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = x;
  }
  get finished() {
    return this._animation ? this.animation.finished : this._finished;
  }
  then(n, o) {
    return this.finished.finally(n).then(() => {
    });
  }
  get animation() {
    var n;
    return this._animation || ((n = this.keyframeResolver) == null || n.resume(), i1()), this._animation;
  }
  get duration() {
    return this.animation.duration;
  }
  get iterationDuration() {
    return this.animation.iterationDuration;
  }
  get time() {
    return this.animation.time;
  }
  set time(n) {
    this.animation.time = n;
  }
  get speed() {
    return this.animation.speed;
  }
  get state() {
    return this.animation.state;
  }
  set speed(n) {
    this.animation.speed = n;
  }
  get startTime() {
    return this.animation.startTime;
  }
  attachTimeline(n) {
    return this._animation ? this.stopTimeline = this.animation.attachTimeline(n) : this.pendingTimeline = n, () => this.stop();
  }
  play() {
    this.animation.play();
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.complete();
  }
  cancel() {
    var n;
    this._animation && this.animation.cancel(), (n = this.keyframeResolver) == null || n.cancel();
  }
}
function qg(e, n, o, i = 0, a = 1) {
  const c = Array.from(e).sort((g, S) => g.sortNodePosition(S)).indexOf(n), d = e.size, p = (d - 1) * i;
  return typeof o == "function" ? o(c, d) : a === 1 ? c * i : p - c * i;
}
const Rh = 30, T1 = (e) => !isNaN(parseFloat(e));
class k1 {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(n, o = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (i) => {
      var c;
      const a = it.now();
      if (this.updatedAt !== a && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(i), this.current !== this.prev && ((c = this.events.change) == null || c.notify(this.current), this.dependents))
        for (const d of this.dependents)
          d.dirty();
    }, this.hasAnimated = !1, this.setCurrent(n), this.owner = o.owner;
  }
  setCurrent(n) {
    this.current = n, this.updatedAt = it.now(), this.canTrackVelocity === null && n !== void 0 && (this.canTrackVelocity = T1(this.current));
  }
  setPrevFrameValue(n = this.current) {
    this.prevFrameValue = n, this.prevUpdatedAt = this.updatedAt;
  }
  /**
   * Adds a function that will be notified when the `MotionValue` is updated.
   *
   * It returns a function that, when called, will cancel the subscription.
   *
   * When calling `onChange` inside a React component, it should be wrapped with the
   * `useEffect` hook. As it returns an unsubscribe function, this should be returned
   * from the `useEffect` function to ensure you don't add duplicate subscribers..
   *
   * ```jsx
   * export const MyComponent = () => {
   *   const x = useMotionValue(0)
   *   const y = useMotionValue(0)
   *   const opacity = useMotionValue(1)
   *
   *   useEffect(() => {
   *     function updateOpacity() {
   *       const maxXY = Math.max(x.get(), y.get())
   *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
   *       opacity.set(newOpacity)
   *     }
   *
   *     const unsubscribeX = x.on("change", updateOpacity)
   *     const unsubscribeY = y.on("change", updateOpacity)
   *
   *     return () => {
   *       unsubscribeX()
   *       unsubscribeY()
   *     }
   *   }, [])
   *
   *   return <motion.div style={{ x }} />
   * }
   * ```
   *
   * @param subscriber - A function that receives the latest value.
   * @returns A function that, when called, will cancel this subscription.
   *
   * @deprecated
   */
  onChange(n) {
    return this.on("change", n);
  }
  on(n, o) {
    this.events[n] || (this.events[n] = new md());
    const i = this.events[n].add(o);
    return n === "change" ? () => {
      i(), ke.read(() => {
        this.events.change.getSize() || this.stop();
      });
    } : i;
  }
  clearListeners() {
    for (const n in this.events)
      this.events[n].clear();
  }
  /**
   * Attaches a passive effect to the `MotionValue`.
   */
  attach(n, o) {
    this.passiveEffect = n, this.stopPassiveEffect = o;
  }
  /**
   * Sets the state of the `MotionValue`.
   *
   * @remarks
   *
   * ```jsx
   * const x = useMotionValue(0)
   * x.set(10)
   * ```
   *
   * @param latest - Latest value to set.
   * @param render - Whether to notify render subscribers. Defaults to `true`
   *
   * @public
   */
  set(n) {
    this.passiveEffect ? this.passiveEffect(n, this.updateAndNotify) : this.updateAndNotify(n);
  }
  setWithVelocity(n, o, i) {
    this.set(o), this.prev = void 0, this.prevFrameValue = n, this.prevUpdatedAt = this.updatedAt - i;
  }
  /**
   * Set the state of the `MotionValue`, stopping any active animations,
   * effects, and resets velocity to `0`.
   */
  jump(n, o = !0) {
    this.updateAndNotify(n), this.prev = n, this.prevUpdatedAt = this.prevFrameValue = void 0, o && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
  dirty() {
    var n;
    (n = this.events.change) == null || n.notify(this.current);
  }
  addDependent(n) {
    this.dependents || (this.dependents = /* @__PURE__ */ new Set()), this.dependents.add(n);
  }
  removeDependent(n) {
    this.dependents && this.dependents.delete(n);
  }
  /**
   * Returns the latest state of `MotionValue`
   *
   * @returns - The latest state of `MotionValue`
   *
   * @public
   */
  get() {
    return this.current;
  }
  /**
   * @public
   */
  getPrevious() {
    return this.prev;
  }
  /**
   * Returns the latest velocity of `MotionValue`
   *
   * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
   *
   * @public
   */
  getVelocity() {
    const n = it.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || n - this.updatedAt > Rh)
      return 0;
    const o = Math.min(this.updatedAt - this.prevUpdatedAt, Rh);
    return /* @__PURE__ */ wg(parseFloat(this.current) - parseFloat(this.prevFrameValue), o);
  }
  /**
   * Registers a new animation to control this `MotionValue`. Only one
   * animation can drive a `MotionValue` at one time.
   *
   * ```jsx
   * value.start()
   * ```
   *
   * @param animation - A function that starts the provided animation
   */
  start(n) {
    return this.stop(), new Promise((o) => {
      this.hasAnimated = !0, this.animation = n(o), this.events.animationStart && this.events.animationStart.notify();
    }).then(() => {
      this.events.animationComplete && this.events.animationComplete.notify(), this.clearAnimation();
    });
  }
  /**
   * Stop the currently active animation.
   *
   * @public
   */
  stop() {
    this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()), this.clearAnimation();
  }
  /**
   * Returns `true` if this value is currently animating.
   *
   * @public
   */
  isAnimating() {
    return !!this.animation;
  }
  clearAnimation() {
    delete this.animation;
  }
  /**
   * Destroy and clean up subscribers to this `MotionValue`.
   *
   * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
   * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
   * created a `MotionValue` via the `motionValue` function.
   *
   * @public
   */
  destroy() {
    var n, o;
    (n = this.dependents) == null || n.clear(), (o = this.events.destroy) == null || o.notify(), this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
}
function uo(e, n) {
  return new k1(e, n);
}
function ev(e, n) {
  if (e != null && e.inherit && n) {
    const { inherit: o, ...i } = e;
    return { ...n, ...i };
  }
  return e;
}
function kd(e, n) {
  const o = (e == null ? void 0 : e[n]) ?? (e == null ? void 0 : e.default) ?? e;
  return o !== e ? ev(o, e) : o;
}
const A1 = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, C1 = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), P1 = {
  type: "keyframes",
  duration: 0.8
}, E1 = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, b1 = (e, { keyframes: n }) => n.length > 2 ? P1 : mo.has(e) ? e.startsWith("scale") ? C1(n[1]) : A1 : E1, M1 = /* @__PURE__ */ new Set([
  "when",
  "delay",
  "delayChildren",
  "staggerChildren",
  "staggerDirection",
  "repeat",
  "repeatType",
  "repeatDelay",
  "from",
  "elapsed"
]);
function R1(e) {
  for (const n in e)
    if (!M1.has(n))
      return !0;
  return !1;
}
const Ad = (e, n, o, i = {}, a, c) => (d) => {
  const p = kd(i, e) || {}, h = p.delay || i.delay || 0;
  let { elapsed: g = 0 } = i;
  g = g - /* @__PURE__ */ mt(h);
  const S = {
    keyframes: Array.isArray(o) ? o : [null, o],
    ease: "easeOut",
    velocity: n.getVelocity(),
    ...p,
    delay: -g,
    onUpdate: (f) => {
      n.set(f), p.onUpdate && p.onUpdate(f);
    },
    onComplete: () => {
      d(), p.onComplete && p.onComplete();
    },
    name: e,
    motionValue: n,
    element: c ? void 0 : a
  };
  R1(p) || Object.assign(S, b1(e, S)), S.duration && (S.duration = /* @__PURE__ */ mt(S.duration)), S.repeatDelay && (S.repeatDelay = /* @__PURE__ */ mt(S.repeatDelay)), S.from !== void 0 && (S.keyframes[0] = S.from);
  let l = !1;
  if ((S.type === !1 || S.duration === 0 && !S.repeatDelay) && (Pc(S), S.delay === 0 && (l = !0)), (Wn.instantAnimations || Wn.skipAnimations || a != null && a.shouldSkipAnimations || p.skipAnimations) && (l = !0, Pc(S), S.delay = 0), S.allowFlatten = !p.type && !p.ease, l && !c && n.get() !== void 0) {
    const f = Na(S.keyframes, p);
    if (f !== void 0) {
      ke.update(() => {
        S.onUpdate(f), S.onComplete();
      });
      return;
    }
  }
  return p.isSync ? new va(S) : new _1(S);
}, D1 = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function N1(e) {
  const n = D1.exec(e);
  if (!n)
    return [,];
  const [, o, i, a] = n;
  return [`--${o ?? i}`, a];
}
const I1 = 4;
function tv(e, n, o = 1) {
  wr(o <= I1, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [i, a] = N1(e);
  if (!i)
    return;
  const c = window.getComputedStyle(n).getPropertyValue(i);
  if (c) {
    const d = c.trim();
    return yg(d) ? parseFloat(d) : d;
  }
  return gd(a) ? tv(a, n, o + 1) : a;
}
function Dh(e) {
  const n = [{}, {}];
  return e == null || e.values.forEach((o, i) => {
    n[0][i] = o.get(), n[1][i] = o.getVelocity();
  }), n;
}
function Cd(e, n, o, i) {
  if (typeof n == "function") {
    const [a, c] = Dh(i);
    n = n(o !== void 0 ? o : e.custom, a, c);
  }
  if (typeof n == "string" && (n = e.variants && e.variants[n]), typeof n == "function") {
    const [a, c] = Dh(i);
    n = n(o !== void 0 ? o : e.custom, a, c);
  }
  return n;
}
function hr(e, n, o) {
  const i = e.getProps();
  return Cd(i, n, o !== void 0 ? o : i.custom, e);
}
const nv = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...po
]), Ec = (e) => Array.isArray(e);
function j1(e, n, o) {
  e.hasValue(n) ? e.getValue(n).set(o) : e.addValue(n, uo(o));
}
function F1(e) {
  return Ec(e) ? e[e.length - 1] || 0 : e;
}
function O1(e, n) {
  const o = hr(e, n);
  let { transitionEnd: i = {}, transition: a = {}, ...c } = o || {};
  c = { ...c, ...i };
  for (const d in c) {
    const p = F1(c[d]);
    j1(e, d, p);
  }
}
const Je = (e) => !!(e && e.getVelocity);
function L1(e) {
  return !!(Je(e) && e.add);
}
function bc(e, n) {
  const o = e.getValue("willChange");
  if (L1(o))
    return o.add(n);
  if (!o && Wn.WillChange) {
    const i = new Wn.WillChange("auto");
    e.addValue("willChange", i), i.add(n);
  }
}
function Pd(e) {
  return e.replace(/([A-Z])/g, (n) => `-${n.toLowerCase()}`);
}
const V1 = "framerAppearId", rv = "data-" + Pd(V1);
function ov(e) {
  return e.props[rv];
}
function B1({ protectedKeys: e, needsAnimating: n }, o) {
  const i = e.hasOwnProperty(o) && n[o] !== !0;
  return n[o] = !1, i;
}
function iv(e, n, { delay: o = 0, transitionOverride: i, type: a } = {}) {
  let { transition: c, transitionEnd: d, ...p } = n;
  const h = e.getDefaultTransition();
  c = c ? ev(c, h) : h;
  const g = c == null ? void 0 : c.reduceMotion, S = c == null ? void 0 : c.skipAnimations;
  i && (c = i);
  const l = [], f = a && e.animationState && e.animationState.getState()[a], v = c == null ? void 0 : c.path;
  v && v.animateVisualElement(e, p, c, o, l);
  for (const w in p) {
    const k = e.getValue(w, e.latestValues[w] ?? null), x = p[w];
    if (x === void 0 || f && B1(f, w))
      continue;
    const A = {
      delay: o,
      ...kd(c || {}, w)
    };
    S && (A.skipAnimations = !0);
    const E = k.get();
    if (E !== void 0 && !k.isAnimating() && !Array.isArray(x) && x === E && !A.velocity) {
      ke.update(() => k.set(x));
      continue;
    }
    let R = !1;
    if (window.MotionHandoffAnimation) {
      const U = ov(e);
      if (U) {
        const K = window.MotionHandoffAnimation(U, w, ke);
        K !== null && (A.startTime = K, R = !0);
      }
    }
    bc(e, w);
    const N = g ?? e.shouldReduceMotion;
    k.start(Ad(w, k, x, N && nv.has(w) ? { type: !1 } : A, e, R));
    const O = k.animation;
    O && l.push(O);
  }
  if (d) {
    const w = () => ke.update(() => {
      d && O1(e, d);
    });
    l.length ? Promise.all(l).then(w) : w();
  }
  return l;
}
function Mc(e, n, o = {}) {
  var h;
  const i = hr(e, n, o.type === "exit" ? (h = e.presenceContext) == null ? void 0 : h.custom : void 0);
  let { transition: a = e.getDefaultTransition() || {} } = i || {};
  o.transitionOverride && (a = o.transitionOverride);
  const c = i ? () => Promise.all(iv(e, i, o)) : () => Promise.resolve(), d = e.variantChildren && e.variantChildren.size ? (g = 0) => {
    const { delayChildren: S = 0, staggerChildren: l, staggerDirection: f } = a;
    return z1(e, n, g, S, l, f, o);
  } : () => Promise.resolve(), { when: p } = a;
  if (p) {
    const [g, S] = p === "beforeChildren" ? [c, d] : [d, c];
    return g().then(() => S());
  } else
    return Promise.all([c(), d(o.delay)]);
}
function z1(e, n, o = 0, i = 0, a = 0, c = 1, d) {
  const p = [];
  for (const h of e.variantChildren)
    h.notify("AnimationStart", n), p.push(Mc(h, n, {
      ...d,
      delay: o + (typeof i == "function" ? 0 : i) + qg(e.variantChildren, h, i, a, c)
    }).then(() => h.notify("AnimationComplete", n)));
  return Promise.all(p);
}
function $1(e, n, o = {}) {
  e.notify("AnimationStart", n);
  let i;
  if (Array.isArray(n)) {
    const a = n.map((c) => Mc(e, c, o));
    i = Promise.all(a);
  } else if (typeof n == "string")
    i = Mc(e, n, o);
  else {
    const a = typeof n == "function" ? hr(e, n, o.custom) : n;
    i = Promise.all(iv(e, a, o));
  }
  return i.then(() => {
    e.notify("AnimationComplete", n);
  });
}
const U1 = {
  test: (e) => e === "auto",
  parse: (e) => e
}, sv = (e) => (n) => n.test(e), av = [fo, ne, qt, dn, m_, p_, U1], Nh = (e) => av.find(sv(e));
function H1(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || vg(e) : !0;
}
const W1 = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function G1(e) {
  const [n, o] = e.slice(0, -1).split("(");
  if (n === "drop-shadow")
    return e;
  const [i] = o.match(vd) || [];
  if (!i)
    return e;
  const a = o.replace(i, "");
  let c = W1.has(n) ? 1 : 0;
  return i !== o && (c *= 100), n + "(" + c + a + ")";
}
const K1 = /\b([a-z-]*)\(.*?\)/gu, Rc = {
  ...Bt,
  getAnimatableNone: (e) => {
    const n = e.match(K1);
    return n ? n.map(G1).join(" ") : e;
  }
}, Dc = {
  ...Bt,
  getAnimatableNone: (e) => {
    const n = Bt.parse(e);
    return Bt.createTransformer(e)(n.map((i) => typeof i == "number" ? 0 : typeof i == "object" ? { ...i, alpha: 1 } : i));
  }
}, Ih = {
  ...fo,
  transform: Math.round
}, Y1 = {
  rotate: dn,
  /**
   * Internal channel for `transition.path` orientToPath. Composed onto
   * `rotate` at the transform-build sites so the user's `rotate` is
   * never read or overwritten. Not part of `transformPropOrder`.
   */
  pathRotation: dn,
  rotateX: dn,
  rotateY: dn,
  rotateZ: dn,
  scale: $s,
  scaleX: $s,
  scaleY: $s,
  scaleZ: $s,
  skew: dn,
  skewX: dn,
  skewY: dn,
  distance: ne,
  translateX: ne,
  translateY: ne,
  translateZ: ne,
  x: ne,
  y: ne,
  z: ne,
  perspective: ne,
  transformPerspective: ne,
  opacity: mi,
  originX: wh,
  originY: wh,
  originZ: ne
}, Sa = {
  // Border props
  borderWidth: ne,
  borderTopWidth: ne,
  borderRightWidth: ne,
  borderBottomWidth: ne,
  borderLeftWidth: ne,
  borderRadius: ne,
  borderTopLeftRadius: ne,
  borderTopRightRadius: ne,
  borderBottomRightRadius: ne,
  borderBottomLeftRadius: ne,
  // Positioning props
  width: ne,
  maxWidth: ne,
  height: ne,
  maxHeight: ne,
  top: ne,
  right: ne,
  bottom: ne,
  left: ne,
  inset: ne,
  insetBlock: ne,
  insetBlockStart: ne,
  insetBlockEnd: ne,
  insetInline: ne,
  insetInlineStart: ne,
  insetInlineEnd: ne,
  // Spacing props
  padding: ne,
  paddingTop: ne,
  paddingRight: ne,
  paddingBottom: ne,
  paddingLeft: ne,
  paddingBlock: ne,
  paddingBlockStart: ne,
  paddingBlockEnd: ne,
  paddingInline: ne,
  paddingInlineStart: ne,
  paddingInlineEnd: ne,
  margin: ne,
  marginTop: ne,
  marginRight: ne,
  marginBottom: ne,
  marginLeft: ne,
  marginBlock: ne,
  marginBlockStart: ne,
  marginBlockEnd: ne,
  marginInline: ne,
  marginInlineStart: ne,
  marginInlineEnd: ne,
  // Typography
  fontSize: ne,
  // Misc
  backgroundPositionX: ne,
  backgroundPositionY: ne,
  ...Y1,
  zIndex: Ih,
  // SVG
  fillOpacity: mi,
  strokeOpacity: mi,
  numOctaves: Ih
}, Q1 = {
  ...Sa,
  // Color props
  color: Ve,
  backgroundColor: Ve,
  outlineColor: Ve,
  fill: Ve,
  stroke: Ve,
  // Border props
  borderColor: Ve,
  borderTopColor: Ve,
  borderRightColor: Ve,
  borderBottomColor: Ve,
  borderLeftColor: Ve,
  filter: Rc,
  WebkitFilter: Rc,
  mask: Dc,
  WebkitMask: Dc
}, lv = (e) => Q1[e], X1 = /* @__PURE__ */ new Set([Rc, Dc]);
function uv(e, n) {
  let o = lv(e);
  return X1.has(o) || (o = Bt), o.getAnimatableNone ? o.getAnimatableNone(n) : void 0;
}
const Z1 = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function J1(e, n, o) {
  let i = 0, a;
  for (; i < e.length && !a; ) {
    const c = e[i];
    typeof c == "string" && !Z1.has(c) && lo(c).values.length && (a = e[i]), i++;
  }
  if (a && o)
    for (const c of n)
      e[c] = uv(o, a);
}
class q1 extends Td {
  constructor(n, o, i, a, c) {
    super(n, o, i, a, c, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: n, element: o, name: i } = this;
    if (!o || !o.current)
      return;
    super.readKeyframes();
    for (let S = 0; S < n.length; S++) {
      let l = n[S];
      if (typeof l == "string" && (l = l.trim(), gd(l))) {
        const f = tv(l, o.current);
        f !== void 0 && (n[S] = f), S === n.length - 1 && (this.finalKeyframe = l);
      }
    }
    if (this.resolveNoneKeyframes(), !nv.has(i) || n.length !== 2)
      return;
    const [a, c] = n, d = Nh(a), p = Nh(c), h = Sh(a), g = Sh(c);
    if (h !== g && $n[i]) {
      this.needsMeasurement = !0;
      return;
    }
    if (d !== p)
      if (Eh(d) && Eh(p))
        for (let S = 0; S < n.length; S++) {
          const l = n[S];
          typeof l == "string" && (n[S] = parseFloat(l));
        }
      else $n[i] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: n, name: o } = this, i = [];
    for (let a = 0; a < n.length; a++)
      (n[a] === null || H1(n[a])) && i.push(a);
    i.length && J1(n, i, o);
  }
  measureInitialState() {
    const { element: n, unresolvedKeyframes: o, name: i } = this;
    if (!n || !n.current)
      return;
    i === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = $n[i](n.measureViewportBox(), window.getComputedStyle(n.current)), o[0] = this.measuredOrigin;
    const a = o[o.length - 1];
    a !== void 0 && n.getValue(i, a).jump(a, !1);
  }
  measureEndState() {
    var p;
    const { element: n, name: o, unresolvedKeyframes: i } = this;
    if (!n || !n.current)
      return;
    const a = n.getValue(o);
    a && a.jump(this.measuredOrigin, !1);
    const c = i.length - 1, d = i[c];
    i[c] = $n[o](n.measureViewportBox(), window.getComputedStyle(n.current)), d !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = d), (p = this.removedTransforms) != null && p.length && this.removedTransforms.forEach(([h, g]) => {
      n.getValue(h).set(g);
    }), this.resolveNoneKeyframes();
  }
}
function cv(e, n, o) {
  if (e == null)
    return [];
  if (e instanceof EventTarget)
    return [e];
  if (typeof e == "string") {
    let i = document;
    const a = (o == null ? void 0 : o[e]) ?? i.querySelectorAll(e);
    return a ? Array.from(a) : [];
  }
  return Array.from(e).filter((i) => i != null);
}
const Nc = (e, n) => n && typeof e == "number" ? n.transform(e) : e;
function ra(e) {
  return gg(e) && "offsetHeight" in e && !("ownerSVGElement" in e);
}
const { schedule: Ed } = /* @__PURE__ */ Rg(queueMicrotask, !1), Vt = {
  x: !1,
  y: !1
};
function dv() {
  return Vt.x || Vt.y;
}
function eT(e) {
  return e === "x" || e === "y" ? Vt[e] ? null : (Vt[e] = !0, () => {
    Vt[e] = !1;
  }) : Vt.x || Vt.y ? null : (Vt.x = Vt.y = !0, () => {
    Vt.x = Vt.y = !1;
  });
}
function fv(e, n) {
  const o = cv(e), i = new AbortController(), a = {
    passive: !0,
    ...n,
    signal: i.signal
  };
  return [o, a, () => i.abort()];
}
function tT(e) {
  return !(e.pointerType === "touch" || dv());
}
function nT(e, n, o = {}) {
  const [i, a, c] = fv(e, o);
  return i.forEach((d) => {
    let p = !1, h = !1, g;
    const S = () => {
      d.removeEventListener("pointerleave", w);
    }, l = (x) => {
      g && (g(x), g = void 0), S();
    }, f = (x) => {
      p = !1, window.removeEventListener("pointerup", f), window.removeEventListener("pointercancel", f), h && (h = !1, l(x));
    }, v = () => {
      p = !0, window.addEventListener("pointerup", f, a), window.addEventListener("pointercancel", f, a);
    }, w = (x) => {
      if (x.pointerType !== "touch") {
        if (p) {
          h = !0;
          return;
        }
        l(x);
      }
    }, k = (x) => {
      if (!tT(x))
        return;
      h = !1;
      const A = n(d, x);
      typeof A == "function" && (g = A, d.addEventListener("pointerleave", w, a));
    };
    d.addEventListener("pointerenter", k, a), d.addEventListener("pointerdown", v, a);
  }), c;
}
const pv = (e, n) => n ? e === n ? !0 : pv(e, n.parentElement) : !1, bd = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, rT = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function oT(e) {
  return rT.has(e.tagName) || e.isContentEditable === !0;
}
const iT = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function sT(e) {
  return iT.has(e.tagName) || e.isContentEditable === !0;
}
const oa = /* @__PURE__ */ new WeakSet();
function jh(e) {
  return (n) => {
    n.key === "Enter" && e(n);
  };
}
function Qu(e, n) {
  e.dispatchEvent(new PointerEvent("pointer" + n, { isPrimary: !0, bubbles: !0 }));
}
const aT = (e, n) => {
  const o = e.currentTarget;
  if (!o)
    return;
  const i = jh(() => {
    if (oa.has(o))
      return;
    Qu(o, "down");
    const a = jh(() => {
      Qu(o, "up");
    }), c = () => Qu(o, "cancel");
    o.addEventListener("keyup", a, n), o.addEventListener("blur", c, n);
  });
  o.addEventListener("keydown", i, n), o.addEventListener("blur", () => o.removeEventListener("keydown", i), n);
};
function Fh(e) {
  return bd(e) && !dv();
}
const Oh = /* @__PURE__ */ new WeakSet();
function lT(e, n, o = {}) {
  const [i, a, c] = fv(e, o), d = (p) => {
    const h = p.currentTarget;
    if (!Fh(p) || Oh.has(p))
      return;
    oa.add(h), o.stopPropagation && Oh.add(p);
    const g = n(h, p), S = (v, w) => {
      window.removeEventListener("pointerup", l), window.removeEventListener("pointercancel", f), oa.has(h) && oa.delete(h), Fh(v) && typeof g == "function" && g(v, { success: w });
    }, l = (v) => {
      S(v, h === window || h === document || o.useGlobalTarget || pv(h, v.target));
    }, f = (v) => {
      S(v, !1);
    };
    window.addEventListener("pointerup", l, a), window.addEventListener("pointercancel", f, a);
  };
  return i.forEach((p) => {
    (o.useGlobalTarget ? window : p).addEventListener("pointerdown", d, a), ra(p) && (p.addEventListener("focus", (g) => aT(g, a)), !oT(p) && !p.hasAttribute("tabindex") && (p.tabIndex = 0));
  }), c;
}
function Md(e) {
  return gg(e) && "ownerSVGElement" in e;
}
const ia = /* @__PURE__ */ new WeakMap();
let On;
const mv = (e, n, o) => (i, a) => a && a[0] ? a[0][e + "Size"] : Md(i) && "getBBox" in i ? i.getBBox()[n] : i[o], uT = /* @__PURE__ */ mv("inline", "width", "offsetWidth"), cT = /* @__PURE__ */ mv("block", "height", "offsetHeight");
function dT({ target: e, borderBoxSize: n }) {
  var o;
  (o = ia.get(e)) == null || o.forEach((i) => {
    i(e, {
      get width() {
        return uT(e, n);
      },
      get height() {
        return cT(e, n);
      }
    });
  });
}
function fT(e) {
  e.forEach(dT);
}
function pT() {
  typeof ResizeObserver > "u" || (On = new ResizeObserver(fT));
}
function mT(e, n) {
  On || pT();
  const o = cv(e);
  return o.forEach((i) => {
    let a = ia.get(i);
    a || (a = /* @__PURE__ */ new Set(), ia.set(i, a)), a.add(n), On == null || On.observe(i);
  }), () => {
    o.forEach((i) => {
      const a = ia.get(i);
      a == null || a.delete(n), a != null && a.size || On == null || On.unobserve(i);
    });
  };
}
const sa = /* @__PURE__ */ new Set();
let ro;
function hT() {
  ro = () => {
    const e = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    sa.forEach((n) => n(e));
  }, window.addEventListener("resize", ro);
}
function yT(e) {
  return sa.add(e), ro || hT(), () => {
    sa.delete(e), !sa.size && typeof ro == "function" && (window.removeEventListener("resize", ro), ro = void 0);
  };
}
function Lh(e, n) {
  return typeof e == "function" ? yT(e) : mT(e, n);
}
function gT(e) {
  return Md(e) && e.tagName === "svg";
}
const vT = [...av, Ve, Bt], ST = (e) => vT.find(sv(e)), Vh = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), oo = () => ({
  x: Vh(),
  y: Vh()
}), Bh = () => ({ min: 0, max: 0 }), $e = () => ({
  x: Bh(),
  y: Bh()
}), wT = /* @__PURE__ */ new WeakMap();
function Ia(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function hi(e) {
  return typeof e == "string" || Array.isArray(e);
}
const Rd = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], Dd = ["initial", ...Rd];
function ja(e) {
  return Ia(e.animate) || Dd.some((n) => hi(e[n]));
}
function hv(e) {
  return !!(ja(e) || e.variants);
}
function xT(e, n, o) {
  for (const i in n) {
    const a = n[i], c = o[i];
    if (Je(a))
      e.addValue(i, a);
    else if (Je(c))
      e.addValue(i, uo(a, { owner: e }));
    else if (c !== a)
      if (e.hasValue(i)) {
        const d = e.getValue(i);
        d.liveStyle === !0 ? d.jump(a) : d.hasAnimated || d.set(a);
      } else {
        const d = e.getStaticValue(i);
        e.addValue(i, uo(d !== void 0 ? d : a, { owner: e }));
      }
  }
  for (const i in o)
    n[i] === void 0 && e.removeValue(i);
  return n;
}
const Ic = { current: null }, yv = { current: !1 }, _T = typeof window < "u";
function TT() {
  if (yv.current = !0, !!_T)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), n = () => Ic.current = e.matches;
      e.addEventListener("change", n), n();
    } else
      Ic.current = !1;
}
const zh = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let wa = {};
function gv(e) {
  wa = e;
}
function kT() {
  return wa;
}
class AT {
  /**
   * This method takes React props and returns found MotionValues. For example, HTML
   * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
   *
   * This isn't an abstract method as it needs calling in the constructor, but it is
   * intended to be one.
   */
  scrapeMotionValuesFromProps(n, o, i) {
    return {};
  }
  constructor({ parent: n, props: o, presenceContext: i, reducedMotionConfig: a, skipAnimations: c, blockInitialAnimation: d, visualState: p }, h = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = Td, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const v = it.now();
      this.renderScheduledAt < v && (this.renderScheduledAt = v, ke.render(this.render, !1, !0));
    };
    const { latestValues: g, renderState: S } = p;
    this.latestValues = g, this.baseTarget = { ...g }, this.initialValues = o.initial ? { ...g } : {}, this.renderState = S, this.parent = n, this.props = o, this.presenceContext = i, this.depth = n ? n.depth + 1 : 0, this.reducedMotionConfig = a, this.skipAnimationsConfig = c, this.options = h, this.blockInitialAnimation = !!d, this.isControllingVariants = ja(o), this.isVariantNode = hv(o), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(n && n.current);
    const { willChange: l, ...f } = this.scrapeMotionValuesFromProps(o, {}, this);
    for (const v in f) {
      const w = f[v];
      g[v] !== void 0 && Je(w) && w.set(g[v]);
    }
  }
  mount(n) {
    var o, i;
    if (this.hasBeenMounted)
      for (const a in this.initialValues)
        (o = this.values.get(a)) == null || o.jump(this.initialValues[a]), this.latestValues[a] = this.initialValues[a];
    this.current = n, wT.set(n, this), this.projection && !this.projection.instance && this.projection.mount(n), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((a, c) => this.bindToMotionValue(c, a)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (yv.current || TT(), this.shouldReduceMotion = Ic.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (i = this.parent) == null || i.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    var n;
    this.projection && this.projection.unmount(), Gn(this.notifyUpdate), Gn(this.render), this.valueSubscriptions.forEach((o) => o()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), (n = this.parent) == null || n.removeChild(this);
    for (const o in this.events)
      this.events[o].clear();
    for (const o in this.features) {
      const i = this.features[o];
      i && (i.unmount(), i.isMounted = !1);
    }
    this.current = null;
  }
  addChild(n) {
    this.children.add(n), this.enteringChildren ?? (this.enteringChildren = /* @__PURE__ */ new Set()), this.enteringChildren.add(n);
  }
  removeChild(n) {
    this.children.delete(n), this.enteringChildren && this.enteringChildren.delete(n);
  }
  bindToMotionValue(n, o) {
    if (this.valueSubscriptions.has(n) && this.valueSubscriptions.get(n)(), o.accelerate && Jg.has(n) && this.current instanceof HTMLElement) {
      const { factory: d, keyframes: p, times: h, ease: g, duration: S } = o.accelerate, l = new Xg({
        element: this.current,
        name: n,
        keyframes: p,
        times: h,
        ease: g,
        duration: /* @__PURE__ */ mt(S)
      }), f = d(l);
      this.valueSubscriptions.set(n, () => {
        f(), l.cancel();
      });
      return;
    }
    const i = mo.has(n);
    i && this.onBindTransform && this.onBindTransform();
    const a = o.on("change", (d) => {
      this.latestValues[n] = d, this.props.onUpdate && ke.preRender(this.notifyUpdate), i && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
    });
    let c;
    typeof window < "u" && window.MotionCheckAppearSync && (c = window.MotionCheckAppearSync(this, n, o)), this.valueSubscriptions.set(n, () => {
      a(), c && c();
    });
  }
  sortNodePosition(n) {
    return !this.current || !this.sortInstanceNodePosition || this.type !== n.type ? 0 : this.sortInstanceNodePosition(this.current, n.current);
  }
  updateFeatures() {
    let n = "animation";
    for (n in wa) {
      const o = wa[n];
      if (!o)
        continue;
      const { isEnabled: i, Feature: a } = o;
      if (!this.features[n] && a && i(this.props) && (this.features[n] = new a(this)), this.features[n]) {
        const c = this.features[n];
        c.isMounted ? c.update() : (c.mount(), c.isMounted = !0);
      }
    }
  }
  triggerBuild() {
    this.build(this.renderState, this.latestValues, this.props);
  }
  /**
   * Measure the current viewport box with or without transforms.
   * Only measures axis-aligned boxes, rotate and skew must be manually
   * removed with a re-render to work.
   */
  measureViewportBox() {
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : $e();
  }
  getStaticValue(n) {
    return this.latestValues[n];
  }
  setStaticValue(n, o) {
    this.latestValues[n] = o;
  }
  /**
   * Update the provided props. Ensure any newly-added motion values are
   * added to our map, old ones removed, and listeners updated.
   */
  update(n, o) {
    (n.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = n, this.prevPresenceContext = this.presenceContext, this.presenceContext = o;
    for (let i = 0; i < zh.length; i++) {
      const a = zh[i];
      this.propEventSubscriptions[a] && (this.propEventSubscriptions[a](), delete this.propEventSubscriptions[a]);
      const c = "on" + a, d = n[c];
      d && (this.propEventSubscriptions[a] = this.on(a, d));
    }
    this.prevMotionValues = xT(this, this.scrapeMotionValuesFromProps(n, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
  }
  getProps() {
    return this.props;
  }
  /**
   * Returns the variant definition with a given name.
   */
  getVariant(n) {
    return this.props.variants ? this.props.variants[n] : void 0;
  }
  /**
   * Returns the defined default transition on this component.
   */
  getDefaultTransition() {
    return this.props.transition;
  }
  getTransformPagePoint() {
    return this.props.transformPagePoint;
  }
  getClosestVariantNode() {
    return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
  }
  /**
   * Add a child visual element to our set of children.
   */
  addVariantChild(n) {
    const o = this.getClosestVariantNode();
    if (o)
      return o.variantChildren && o.variantChildren.add(n), () => o.variantChildren.delete(n);
  }
  /**
   * Add a motion value and bind it to this visual element.
   */
  addValue(n, o) {
    const i = this.values.get(n);
    o !== i && (i && this.removeValue(n), this.bindToMotionValue(n, o), this.values.set(n, o), this.latestValues[n] = o.get());
  }
  /**
   * Remove a motion value and unbind any active subscriptions.
   */
  removeValue(n) {
    this.values.delete(n);
    const o = this.valueSubscriptions.get(n);
    o && (o(), this.valueSubscriptions.delete(n)), delete this.latestValues[n], this.removeValueFromRenderState(n, this.renderState);
  }
  /**
   * Check whether we have a motion value for this key
   */
  hasValue(n) {
    return this.values.has(n);
  }
  getValue(n, o) {
    if (this.props.values && this.props.values[n])
      return this.props.values[n];
    let i = this.values.get(n);
    return i === void 0 && o !== void 0 && (i = uo(o === null ? void 0 : o, { owner: this }), this.addValue(n, i)), i;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(n, o) {
    let i = this.latestValues[n] !== void 0 || !this.current ? this.latestValues[n] : this.getBaseTargetFromProps(this.props, n) ?? this.readValueFromInstance(this.current, n, this.options);
    return i != null && (typeof i == "string" && (yg(i) || vg(i)) ? i = parseFloat(i) : !ST(i) && Bt.test(o) && (i = uv(n, o)), this.setBaseTarget(n, Je(i) ? i.get() : i)), Je(i) ? i.get() : i;
  }
  /**
   * Set the base target to later animate back to. This is currently
   * only hydrated on creation and when we first read a value.
   */
  setBaseTarget(n, o) {
    this.baseTarget[n] = o;
  }
  /**
   * Find the base target for a value thats been removed from all animation
   * props.
   */
  getBaseTarget(n) {
    var c;
    const { initial: o } = this.props;
    let i;
    if (typeof o == "string" || typeof o == "object") {
      const d = Cd(this.props, o, (c = this.presenceContext) == null ? void 0 : c.custom);
      d && (i = d[n]);
    }
    if (o && i !== void 0)
      return i;
    const a = this.getBaseTargetFromProps(this.props, n);
    return a !== void 0 && !Je(a) ? a : this.initialValues[n] !== void 0 && i === void 0 ? void 0 : this.baseTarget[n];
  }
  on(n, o) {
    return this.events[n] || (this.events[n] = new md()), this.events[n].add(o);
  }
  notify(n, ...o) {
    this.events[n] && this.events[n].notify(...o);
  }
  scheduleRenderMicrotask() {
    Ed.render(this.render);
  }
}
class vv extends AT {
  constructor() {
    super(...arguments), this.KeyframeResolver = q1;
  }
  sortInstanceNodePosition(n, o) {
    return n.compareDocumentPosition(o) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(n, o) {
    const i = n.style;
    return i ? i[o] : void 0;
  }
  removeValueFromRenderState(n, { vars: o, style: i }) {
    delete o[n], delete i[n];
  }
  handleChildMotionValue() {
    this.childSubscription && (this.childSubscription(), delete this.childSubscription);
    const { children: n } = this.props;
    Je(n) && (this.childSubscription = n.on("change", (o) => {
      this.current && (this.current.textContent = `${o}`);
    }));
  }
}
class Yn {
  constructor(n) {
    this.isMounted = !1, this.node = n;
  }
  update() {
  }
}
function Sv({ top: e, left: n, right: o, bottom: i }) {
  return {
    x: { min: n, max: o },
    y: { min: e, max: i }
  };
}
function CT({ x: e, y: n }) {
  return { top: n.min, right: e.max, bottom: n.max, left: e.min };
}
function PT(e, n) {
  if (!n)
    return e;
  const o = n({ x: e.left, y: e.top }), i = n({ x: e.right, y: e.bottom });
  return {
    top: o.y,
    left: o.x,
    bottom: i.y,
    right: i.x
  };
}
function Xu(e) {
  return e === void 0 || e === 1;
}
function jc({ scale: e, scaleX: n, scaleY: o }) {
  return !Xu(e) || !Xu(n) || !Xu(o);
}
function ur(e) {
  return jc(e) || wv(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function wv(e) {
  return $h(e.x) || $h(e.y);
}
function $h(e) {
  return e && e !== "0%";
}
function xa(e, n, o) {
  const i = e - o, a = n * i;
  return o + a;
}
function Uh(e, n, o, i, a) {
  return a !== void 0 && (e = xa(e, a, i)), xa(e, o, i) + n;
}
function Fc(e, n = 0, o = 1, i, a) {
  e.min = Uh(e.min, n, o, i, a), e.max = Uh(e.max, n, o, i, a);
}
function xv(e, { x: n, y: o }) {
  Fc(e.x, n.translate, n.scale, n.originPoint), Fc(e.y, o.translate, o.scale, o.originPoint);
}
const Hh = 0.999999999999, Wh = 1.0000000000001;
function ET(e, n, o, i = !1) {
  var p;
  const a = o.length;
  if (!a)
    return;
  n.x = n.y = 1;
  let c, d;
  for (let h = 0; h < a; h++) {
    c = o[h], d = c.projectionDelta;
    const { visualElement: g } = c.options;
    g && g.props.style && g.props.style.display === "contents" || (i && c.options.layoutScroll && c.scroll && c !== c.root && (Xt(e.x, -c.scroll.offset.x), Xt(e.y, -c.scroll.offset.y)), d && (n.x *= d.x.scale, n.y *= d.y.scale, xv(e, d)), i && ur(c.latestValues) && aa(e, c.latestValues, (p = c.layout) == null ? void 0 : p.layoutBox));
  }
  n.x < Wh && n.x > Hh && (n.x = 1), n.y < Wh && n.y > Hh && (n.y = 1);
}
function Xt(e, n) {
  e.min += n, e.max += n;
}
function Gh(e, n, o, i, a = 0.5) {
  const c = Te(e.min, e.max, a);
  Fc(e, n, o, c, i);
}
function Kh(e, n) {
  return typeof e == "string" ? parseFloat(e) / 100 * (n.max - n.min) : e;
}
function aa(e, n, o) {
  const i = o ?? e;
  Gh(e.x, Kh(n.x, i.x), n.scaleX, n.scale, n.originX), Gh(e.y, Kh(n.y, i.y), n.scaleY, n.scale, n.originY);
}
function _v(e, n) {
  return Sv(PT(e.getBoundingClientRect(), n));
}
function bT(e, n, o) {
  const i = _v(e, o), { scroll: a } = n;
  return a && (Xt(i.x, a.offset.x), Xt(i.y, a.offset.y)), i;
}
const MT = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, RT = po.length;
function DT(e, n, o) {
  let i = "", a = !0;
  for (let d = 0; d < RT; d++) {
    const p = po[d], h = e[p];
    if (h === void 0)
      continue;
    let g = !0;
    if (typeof h == "number")
      g = h === (p.startsWith("scale") ? 1 : 0);
    else {
      const S = parseFloat(h);
      g = p.startsWith("scale") ? S === 1 : S === 0;
    }
    if (!g || o) {
      const S = Nc(h, Sa[p]);
      if (!g) {
        a = !1;
        const l = MT[p] || p;
        i += `${l}(${S}) `;
      }
      o && (n[p] = S);
    }
  }
  const c = e.pathRotation;
  return c && (a = !1, i += `rotate(${Nc(c, Sa.pathRotation)}) `), i = i.trim(), o ? i = o(n, a ? "" : i) : a && (i = "none"), i;
}
function Nd(e, n, o) {
  const { style: i, vars: a, transformOrigin: c } = e;
  let d = !1, p = !1;
  for (const h in n) {
    const g = n[h];
    if (mo.has(h)) {
      d = !0;
      continue;
    } else if (Ng(h)) {
      a[h] = g;
      continue;
    } else {
      const S = Nc(g, Sa[h]);
      h.startsWith("origin") ? (p = !0, c[h] = S) : i[h] = S;
    }
  }
  if (n.transform || (d || o ? i.transform = DT(n, e.transform, o) : i.transform && (i.transform = "none")), p) {
    const { originX: h = "50%", originY: g = "50%", originZ: S = 0 } = c;
    i.transformOrigin = `${h} ${g} ${S}`;
  }
}
function Tv(e, { style: n, vars: o }, i, a) {
  const c = e.style;
  let d;
  for (d in n)
    c[d] = n[d];
  a == null || a.applyProjectionStyles(c, i);
  for (d in o)
    c.setProperty(d, o[d]);
}
function Yh(e, n) {
  return n.max === n.min ? 0 : e / (n.max - n.min) * 100;
}
const ii = {
  correct: (e, n) => {
    if (!n.target)
      return e;
    if (typeof e == "string")
      if (ne.test(e))
        e = parseFloat(e);
      else
        return e;
    const o = Yh(e, n.target.x), i = Yh(e, n.target.y);
    return `${o}% ${i}%`;
  }
}, NT = {
  correct: (e, { treeScale: n, projectionDelta: o }) => {
    const i = e, a = Bt.parse(e);
    if (a.length > 5)
      return i;
    const c = Bt.createTransformer(e), d = typeof a[0] != "number" ? 1 : 0, p = o.x.scale * n.x, h = o.y.scale * n.y;
    a[0 + d] /= p, a[1 + d] /= h;
    const g = Te(p, h, 0.5);
    return typeof a[2 + d] == "number" && (a[2 + d] /= g), typeof a[3 + d] == "number" && (a[3 + d] /= g), c(a);
  }
}, Oc = {
  borderRadius: {
    ...ii,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: ii,
  borderTopRightRadius: ii,
  borderBottomLeftRadius: ii,
  borderBottomRightRadius: ii,
  boxShadow: NT
};
function kv(e, { layout: n, layoutId: o }) {
  return mo.has(e) || e.startsWith("origin") || (n || o !== void 0) && (!!Oc[e] || e === "opacity");
}
function Id(e, n, o) {
  var d;
  const i = e.style, a = n == null ? void 0 : n.style, c = {};
  if (!i)
    return c;
  for (const p in i)
    (Je(i[p]) || a && Je(a[p]) || kv(p, e) || ((d = o == null ? void 0 : o.getValue(p)) == null ? void 0 : d.liveStyle) !== void 0) && (c[p] = i[p]);
  return c;
}
function IT(e) {
  return window.getComputedStyle(e);
}
class jT extends vv {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = Tv;
  }
  readValueFromInstance(n, o) {
    var i;
    if (mo.has(o))
      return (i = this.projection) != null && i.isProjecting ? _c(o) : e1(n, o);
    {
      const a = IT(n), c = (Ng(o) ? a.getPropertyValue(o) : a[o]) || 0;
      return typeof c == "string" ? c.trim() : c;
    }
  }
  measureInstanceViewportBox(n, { transformPagePoint: o }) {
    return _v(n, o);
  }
  build(n, o, i) {
    Nd(n, o, i.transformTemplate);
  }
  scrapeMotionValuesFromProps(n, o, i) {
    return Id(n, o, i);
  }
}
const FT = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, OT = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function LT(e, n, o = 1, i = 0, a = !0) {
  e.pathLength = 1;
  const c = a ? FT : OT;
  e[c.offset] = `${-i}`, e[c.array] = `${n} ${o}`;
}
const VT = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function Av(e, {
  attrX: n,
  attrY: o,
  attrScale: i,
  pathLength: a,
  pathSpacing: c = 1,
  pathOffset: d = 0,
  // This is object creation, which we try to avoid per-frame.
  ...p
}, h, g, S) {
  if (Nd(e, p, g), h) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: l, style: f } = e;
  l.transform && (f.transform = l.transform, delete l.transform), (f.transform || l.transformOrigin) && (f.transformOrigin = l.transformOrigin ?? "50% 50%", delete l.transformOrigin), f.transform && (f.transformBox = (S == null ? void 0 : S.transformBox) ?? "fill-box", delete l.transformBox);
  for (const v of VT)
    l[v] !== void 0 && (f[v] = l[v], delete l[v]);
  n !== void 0 && (l.x = n), o !== void 0 && (l.y = o), i !== void 0 && (l.scale = i), a !== void 0 && LT(l, a, c, d, !1);
}
const Cv = /* @__PURE__ */ new Set([
  "baseFrequency",
  "diffuseConstant",
  "kernelMatrix",
  "kernelUnitLength",
  "keySplines",
  "keyTimes",
  "limitingConeAngle",
  "markerHeight",
  "markerWidth",
  "numOctaves",
  "targetX",
  "targetY",
  "surfaceScale",
  "specularConstant",
  "specularExponent",
  "stdDeviation",
  "tableValues",
  "viewBox",
  "gradientTransform",
  "pathLength",
  "startOffset",
  "textLength",
  "lengthAdjust"
]), Pv = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function BT(e, n, o, i) {
  Tv(e, n, void 0, i);
  for (const a in n.attrs)
    e.setAttribute(Cv.has(a) ? a : Pd(a), n.attrs[a]);
}
function Ev(e, n, o) {
  const i = Id(e, n, o);
  for (const a in e)
    if (Je(e[a]) || Je(n[a])) {
      const c = po.indexOf(a) !== -1 ? "attr" + a.charAt(0).toUpperCase() + a.substring(1) : a;
      i[c] = e[a];
    }
  return i;
}
class zT extends vv {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = $e;
  }
  getBaseTargetFromProps(n, o) {
    return n[o];
  }
  readValueFromInstance(n, o) {
    if (mo.has(o)) {
      const i = lv(o);
      return i && i.default || 0;
    }
    return o = Cv.has(o) ? o : Pd(o), n.getAttribute(o);
  }
  scrapeMotionValuesFromProps(n, o, i) {
    return Ev(n, o, i);
  }
  build(n, o, i) {
    Av(n, o, this.isSVGTag, i.transformTemplate, i.style);
  }
  renderInstance(n, o, i, a) {
    BT(n, o, i, a);
  }
  mount(n) {
    this.isSVGTag = Pv(n.tagName), super.mount(n);
  }
}
const $T = Dd.length;
function bv(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const o = e.parent ? bv(e.parent) || {} : {};
    return e.props.initial !== void 0 && (o.initial = e.props.initial), o;
  }
  const n = {};
  for (let o = 0; o < $T; o++) {
    const i = Dd[o], a = e.props[i];
    (hi(a) || a === !1) && (n[i] = a);
  }
  return n;
}
function Mv(e, n) {
  if (!Array.isArray(n))
    return !1;
  const o = n.length;
  if (o !== e.length)
    return !1;
  for (let i = 0; i < o; i++)
    if (n[i] !== e[i])
      return !1;
  return !0;
}
const UT = [...Rd].reverse(), HT = Rd.length;
function WT(e) {
  return (n) => Promise.all(n.map(({ animation: o, options: i }) => $1(e, o, i)));
}
function GT(e) {
  let n = WT(e), o = Qh(), i = !0, a = !1;
  const c = (g) => (S, l) => {
    var v;
    const f = hr(e, l, g === "exit" ? (v = e.presenceContext) == null ? void 0 : v.custom : void 0);
    if (f) {
      const { transition: w, transitionEnd: k, ...x } = f;
      S = { ...S, ...x, ...k };
    }
    return S;
  };
  function d(g) {
    n = g(e);
  }
  function p(g) {
    const { props: S } = e, l = bv(e.parent) || {}, f = [], v = /* @__PURE__ */ new Set();
    let w = {}, k = 1 / 0;
    for (let A = 0; A < HT; A++) {
      const E = UT[A], R = o[E], N = S[E] !== void 0 ? S[E] : l[E], O = hi(N), U = E === g ? R.isActive : null;
      U === !1 && (k = A);
      let K = N === l[E] && N !== S[E] && O;
      if (K && (i || a) && e.manuallyAnimateOnMount && (K = !1), R.protectedKeys = { ...w }, // If it isn't active and hasn't *just* been set as inactive
      !R.isActive && U === null || // If we didn't and don't have any defined prop for this animation type
      !N && !R.prevProp || // Or if the prop doesn't define an animation
      Ia(N) || typeof N == "boolean")
        continue;
      if (E === "exit" && R.isActive && U !== !0) {
        R.prevResolvedValues && (w = {
          ...w,
          ...R.prevResolvedValues
        });
        continue;
      }
      const G = KT(R.prevProp, N);
      let L = G || // If we're making this variant active, we want to always make it active
      E === g && R.isActive && !K && O || // If we removed a higher-priority variant (i is in reverse order)
      A > k && O, X = !1;
      const ae = Array.isArray(N) ? N : [N];
      let q = ae.reduce(c(E), {});
      U === !1 && (q = {});
      const { prevResolvedValues: de = {} } = R, ue = {
        ...de,
        ...q
      }, _e = ($) => {
        L = !0, v.has($) && (X = !0, v.delete($)), R.needsAnimating[$] = !0;
        const Z = e.getValue($);
        Z && (Z.liveStyle = !1);
      };
      for (const $ in ue) {
        const Z = q[$], Y = de[$];
        if (w.hasOwnProperty($))
          continue;
        let D = !1;
        Ec(Z) && Ec(Y) ? D = !Mv(Z, Y) || G : D = Z !== Y, D ? Z != null ? _e($) : v.add($) : Z !== void 0 && v.has($) ? _e($) : R.protectedKeys[$] = !0;
      }
      R.prevProp = N, R.prevResolvedValues = q, R.isActive && (w = { ...w, ...q }), (i || a) && e.blockInitialAnimation && (L = !1);
      const ve = K && G;
      L && (!ve || X) && f.push(...ae.map(($) => {
        const Z = { type: E };
        if (typeof $ == "string" && (i || a) && !ve && e.manuallyAnimateOnMount && e.parent) {
          const { parent: Y } = e, D = hr(Y, $);
          if (Y.enteringChildren && D) {
            const { delayChildren: V } = D.transition || {};
            Z.delay = qg(Y.enteringChildren, e, V);
          }
        }
        return {
          animation: $,
          options: Z
        };
      }));
    }
    if (v.size) {
      const A = {};
      if (typeof S.initial != "boolean") {
        const E = hr(e, Array.isArray(S.initial) ? S.initial[0] : S.initial);
        E && E.transition && (A.transition = E.transition);
      }
      v.forEach((E) => {
        const R = e.getBaseTarget(E), N = e.getValue(E);
        N && (N.liveStyle = !0), A[E] = R ?? null;
      }), f.push({ animation: A });
    }
    let x = !!f.length;
    return i && (S.initial === !1 || S.initial === S.animate) && !e.manuallyAnimateOnMount && (x = !1), i = !1, a = !1, x ? n(f) : Promise.resolve();
  }
  function h(g, S) {
    var f;
    if (o[g].isActive === S)
      return Promise.resolve();
    (f = e.variantChildren) == null || f.forEach((v) => {
      var w;
      return (w = v.animationState) == null ? void 0 : w.setActive(g, S);
    }), o[g].isActive = S;
    const l = p(g);
    for (const v in o)
      o[v].protectedKeys = {};
    return l;
  }
  return {
    animateChanges: p,
    setActive: h,
    setAnimateFunction: d,
    getState: () => o,
    reset: () => {
      o = Qh(), a = !0;
    }
  };
}
function KT(e, n) {
  return typeof n == "string" ? n !== e : Array.isArray(n) ? !Mv(n, e) : !1;
}
function lr(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Qh() {
  return {
    animate: lr(!0),
    whileInView: lr(),
    whileHover: lr(),
    whileTap: lr(),
    whileDrag: lr(),
    whileFocus: lr(),
    exit: lr()
  };
}
function Lc(e, n) {
  e.min = n.min, e.max = n.max;
}
function Lt(e, n) {
  Lc(e.x, n.x), Lc(e.y, n.y);
}
function Xh(e, n) {
  e.translate = n.translate, e.scale = n.scale, e.originPoint = n.originPoint, e.origin = n.origin;
}
const Rv = 1e-4, YT = 1 - Rv, QT = 1 + Rv, Dv = 0.01, XT = 0 - Dv, ZT = 0 + Dv;
function st(e) {
  return e.max - e.min;
}
function JT(e, n, o) {
  return Math.abs(e - n) <= o;
}
function Zh(e, n, o, i = 0.5) {
  e.origin = i, e.originPoint = Te(n.min, n.max, e.origin), e.scale = st(o) / st(n), e.translate = Te(o.min, o.max, e.origin) - e.originPoint, (e.scale >= YT && e.scale <= QT || isNaN(e.scale)) && (e.scale = 1), (e.translate >= XT && e.translate <= ZT || isNaN(e.translate)) && (e.translate = 0);
}
function ci(e, n, o, i) {
  Zh(e.x, n.x, o.x, i ? i.originX : void 0), Zh(e.y, n.y, o.y, i ? i.originY : void 0);
}
function Jh(e, n, o, i = 0) {
  const a = i ? Te(o.min, o.max, i) : o.min;
  e.min = a + n.min, e.max = e.min + st(n);
}
function qT(e, n, o, i) {
  Jh(e.x, n.x, o.x, i == null ? void 0 : i.x), Jh(e.y, n.y, o.y, i == null ? void 0 : i.y);
}
function qh(e, n, o, i = 0) {
  const a = i ? Te(o.min, o.max, i) : o.min;
  e.min = n.min - a, e.max = e.min + st(n);
}
function _a(e, n, o, i) {
  qh(e.x, n.x, o.x, i == null ? void 0 : i.x), qh(e.y, n.y, o.y, i == null ? void 0 : i.y);
}
function ey(e, n, o, i, a) {
  return e -= n, e = xa(e, 1 / o, i), a !== void 0 && (e = xa(e, 1 / a, i)), e;
}
function ek(e, n = 0, o = 1, i = 0.5, a, c = e, d = e) {
  if (qt.test(n) && (n = parseFloat(n), n = Te(d.min, d.max, n / 100) - d.min), typeof n != "number")
    return;
  let p = Te(c.min, c.max, i);
  e === c && (p -= n), e.min = ey(e.min, n, o, p, a), e.max = ey(e.max, n, o, p, a);
}
function ty(e, n, [o, i, a], c, d) {
  ek(e, n[o], n[i], n[a], n.scale, c, d);
}
const tk = ["x", "scaleX", "originX"], nk = ["y", "scaleY", "originY"];
function ny(e, n, o, i) {
  ty(e.x, n, tk, o ? o.x : void 0, i ? i.x : void 0), ty(e.y, n, nk, o ? o.y : void 0, i ? i.y : void 0);
}
function ry(e) {
  return e.translate === 0 && e.scale === 1;
}
function Nv(e) {
  return ry(e.x) && ry(e.y);
}
function oy(e, n) {
  return e.min === n.min && e.max === n.max;
}
function rk(e, n) {
  return oy(e.x, n.x) && oy(e.y, n.y);
}
function iy(e, n) {
  return Math.round(e.min) === Math.round(n.min) && Math.round(e.max) === Math.round(n.max);
}
function Iv(e, n) {
  return iy(e.x, n.x) && iy(e.y, n.y);
}
function sy(e) {
  return st(e.x) / st(e.y);
}
function ay(e, n) {
  return e.translate === n.translate && e.scale === n.scale && e.originPoint === n.originPoint;
}
function Yt(e) {
  return [e("x"), e("y")];
}
function ok(e, n, o) {
  let i = "";
  const a = e.x.translate / n.x, c = e.y.translate / n.y, d = (o == null ? void 0 : o.z) || 0;
  if ((a || c || d) && (i = `translate3d(${a}px, ${c}px, ${d}px) `), (n.x !== 1 || n.y !== 1) && (i += `scale(${1 / n.x}, ${1 / n.y}) `), o) {
    const { transformPerspective: g, rotate: S, pathRotation: l, rotateX: f, rotateY: v, skewX: w, skewY: k } = o;
    g && (i = `perspective(${g}px) ${i}`), S && (i += `rotate(${S}deg) `), l && (i += `rotate(${l}deg) `), f && (i += `rotateX(${f}deg) `), v && (i += `rotateY(${v}deg) `), w && (i += `skewX(${w}deg) `), k && (i += `skewY(${k}deg) `);
  }
  const p = e.x.scale * n.x, h = e.y.scale * n.y;
  return (p !== 1 || h !== 1) && (i += `scale(${p}, ${h})`), i || "none";
}
const jv = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
], ik = jv.length, ly = (e) => typeof e == "string" ? parseFloat(e) : e, uy = (e) => typeof e == "number" || ne.test(e);
function sk(e, n, o, i, a, c) {
  a ? (e.opacity = Te(0, o.opacity ?? 1, ak(i)), e.opacityExit = Te(n.opacity ?? 1, 0, lk(i))) : c && (e.opacity = Te(n.opacity ?? 1, o.opacity ?? 1, i));
  for (let d = 0; d < ik; d++) {
    const p = jv[d];
    let h = cy(n, p), g = cy(o, p);
    if (h === void 0 && g === void 0)
      continue;
    h || (h = 0), g || (g = 0), h === 0 || g === 0 || uy(h) === uy(g) ? (e[p] = Math.max(Te(ly(h), ly(g), i), 0), (qt.test(g) || qt.test(h)) && (e[p] += "%")) : e[p] = g;
  }
  (n.rotate || o.rotate) && (e.rotate = Te(n.rotate || 0, o.rotate || 0, i));
}
function cy(e, n) {
  return e[n] !== void 0 ? e[n] : e.borderRadius;
}
const ak = /* @__PURE__ */ Fv(0, 0.5, Pg), lk = /* @__PURE__ */ Fv(0.5, 0.95, Mt);
function Fv(e, n, o) {
  return (i) => i < e ? 0 : i > n ? 1 : o(/* @__PURE__ */ pi(e, n, i));
}
function uk(e, n, o) {
  const i = Je(e) ? e : uo(e);
  return i.start(Ad("", i, n, o)), i.animation;
}
function yi(e, n, o, i = { passive: !0 }) {
  return e.addEventListener(n, o, i), () => e.removeEventListener(n, o);
}
const ck = (e, n) => e.depth - n.depth;
class dk {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(n) {
    pd(this.children, n), this.isDirty = !0;
  }
  remove(n) {
    ma(this.children, n), this.isDirty = !0;
  }
  forEach(n) {
    this.isDirty && this.children.sort(ck), this.isDirty = !1, this.children.forEach(n);
  }
}
function fk(e, n) {
  const o = it.now(), i = ({ timestamp: a }) => {
    const c = a - o;
    c >= n && (Gn(i), e(c - n));
  };
  return ke.setup(i, !0), () => Gn(i);
}
function la(e) {
  return Je(e) ? e.get() : e;
}
class pk {
  constructor() {
    this.members = [];
  }
  add(n) {
    pd(this.members, n);
    for (let o = this.members.length - 1; o >= 0; o--) {
      const i = this.members[o];
      if (i === n || i === this.lead || i === this.prevLead)
        continue;
      const a = i.instance;
      (!a || a.isConnected === !1) && !i.snapshot && (ma(this.members, i), i.unmount());
    }
    n.scheduleRender();
  }
  remove(n) {
    if (ma(this.members, n), n === this.prevLead && (this.prevLead = void 0), n === this.lead) {
      const o = this.members[this.members.length - 1];
      o && this.promote(o);
    }
  }
  relegate(n) {
    var o;
    for (let i = this.members.indexOf(n) - 1; i >= 0; i--) {
      const a = this.members[i];
      if (a.isPresent !== !1 && ((o = a.instance) == null ? void 0 : o.isConnected) !== !1)
        return this.promote(a), !0;
    }
    return !1;
  }
  promote(n, o) {
    var a;
    const i = this.lead;
    if (n !== i && (this.prevLead = i, this.lead = n, n.show(), i)) {
      i.updateSnapshot(), n.scheduleRender();
      const { layoutDependency: c } = i.options, { layoutDependency: d } = n.options;
      (c === void 0 || c !== d) && (n.resumeFrom = i, o && (i.preserveOpacity = !0), i.snapshot && (n.snapshot = i.snapshot, n.snapshot.latestValues = i.animationValues || i.latestValues), (a = n.root) != null && a.isUpdating && (n.isLayoutDirty = !0)), n.options.crossfade === !1 && i.hide();
    }
  }
  exitAnimationComplete() {
    this.members.forEach((n) => {
      var o, i, a, c, d;
      (i = (o = n.options).onExitComplete) == null || i.call(o), (d = (a = n.resumingFrom) == null ? void 0 : (c = a.options).onExitComplete) == null || d.call(c);
    });
  }
  scheduleRender() {
    this.members.forEach((n) => n.instance && n.scheduleRender(!1));
  }
  removeLeadSnapshot() {
    var n;
    (n = this.lead) != null && n.snapshot && (this.lead.snapshot = void 0);
  }
}
const ua = {
  /**
   * Global flag as to whether the tree has animated since the last time
   * we resized the window
   */
  hasAnimatedSinceResize: !0,
  /**
   * We set this to true once, on the first update. Any nodes added to the tree beyond that
   * update will be given a `data-projection-id` attribute.
   */
  hasEverUpdated: !1
}, Zu = ["", "X", "Y", "Z"], mk = 1e3;
let hk = 0;
function Ju(e, n, o, i) {
  const { latestValues: a } = n;
  a[e] && (o[e] = a[e], n.setStaticValue(e, 0), i && (i[e] = 0));
}
function Ov(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: n } = e.options;
  if (!n)
    return;
  const o = ov(n);
  if (window.MotionHasOptimisedAnimation(o, "transform")) {
    const { layout: a, layoutId: c } = e.options;
    window.MotionCancelOptimisedAnimation(o, "transform", ke, !(a || c));
  }
  const { parent: i } = e;
  i && !i.hasCheckedOptimisedAppear && Ov(i);
}
function Lv({ attachResizeListener: e, defaultParent: n, measureScroll: o, checkIsScrollRoot: i, resetTransform: a }) {
  return class {
    constructor(d = {}, p = n == null ? void 0 : n()) {
      this.id = hk++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(vk), this.nodes.forEach(kk), this.nodes.forEach(Ak), this.nodes.forEach(Sk);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = d, this.root = p ? p.root || p : this, this.path = p ? [...p.path, p] : [], this.parent = p, this.depth = p ? p.depth + 1 : 0;
      for (let h = 0; h < this.path.length; h++)
        this.path[h].shouldResetTransform = !0;
      this.root === this && (this.nodes = new dk());
    }
    addEventListener(d, p) {
      return this.eventHandlers.has(d) || this.eventHandlers.set(d, new md()), this.eventHandlers.get(d).add(p);
    }
    notifyListeners(d, ...p) {
      const h = this.eventHandlers.get(d);
      h && h.notify(...p);
    }
    hasListeners(d) {
      return this.eventHandlers.has(d);
    }
    /**
     * Lifecycles
     */
    mount(d) {
      if (this.instance)
        return;
      this.isSVG = Md(d) && !gT(d), this.instance = d;
      const { layoutId: p, layout: h, visualElement: g } = this.options;
      if (g && !g.current && g.mount(d), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (h || p) && (this.isLayoutDirty = !0), e) {
        let S, l = 0;
        const f = () => this.root.updateBlockedByResize = !1;
        ke.read(() => {
          l = window.innerWidth;
        }), e(d, () => {
          const v = window.innerWidth;
          v !== l && (l = v, this.root.updateBlockedByResize = !0, S && S(), S = fk(f, 250), ua.hasAnimatedSinceResize && (ua.hasAnimatedSinceResize = !1, this.nodes.forEach(py)));
        });
      }
      p && this.root.registerSharedNode(p, this), this.options.animate !== !1 && g && (p || h) && this.addEventListener("didUpdate", ({ delta: S, hasLayoutChanged: l, hasRelativeLayoutChanged: f, layout: v }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const w = this.options.transition || g.getDefaultTransition() || Mk, { onLayoutAnimationStart: k, onLayoutAnimationComplete: x } = g.getProps(), A = !this.targetLayout || !Iv(this.targetLayout, v), E = !l && f;
        if (this.options.layoutRoot || this.resumeFrom || E || l && (A || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const R = {
            ...kd(w, "layout"),
            onPlay: k,
            onComplete: x
          };
          (g.shouldReduceMotion || this.options.layoutRoot) && (R.delay = 0, R.type = !1), this.startAnimation(R), this.setAnimationOrigin(S, E, R.path);
        } else
          l || py(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = v;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const d = this.getStack();
      d && d.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), Gn(this.updateProjection);
    }
    // only on the root
    blockUpdate() {
      this.updateManuallyBlocked = !0;
    }
    unblockUpdate() {
      this.updateManuallyBlocked = !1;
    }
    isUpdateBlocked() {
      return this.updateManuallyBlocked || this.updateBlockedByResize;
    }
    isTreeAnimationBlocked() {
      return this.isAnimationBlocked || this.parent && this.parent.isTreeAnimationBlocked() || !1;
    }
    // Note: currently only running on root node
    startUpdate() {
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(Ck), this.animationId++);
    }
    getTransformTemplate() {
      const { visualElement: d } = this.options;
      return d && d.getProps().transformTemplate;
    }
    willUpdate(d = !0) {
      if (this.root.hasTreeAnimated = !0, this.root.isUpdateBlocked()) {
        this.options.onExitComplete && this.options.onExitComplete();
        return;
      }
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && Ov(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let S = 0; S < this.path.length; S++) {
        const l = this.path[S];
        l.shouldResetTransform = !0, (typeof l.latestValues.x == "string" || typeof l.latestValues.y == "string") && (l.isLayoutDirty = !0), l.updateScroll("snapshot"), l.options.layoutRoot && l.willUpdate(!1);
      }
      const { layoutId: p, layout: h } = this.options;
      if (p === void 0 && !h)
        return;
      const g = this.getTransformTemplate();
      this.prevTransformTemplateValue = g ? g(this.latestValues, "") : void 0, this.updateSnapshot(), d && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const h = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), h && this.nodes.forEach(xk), this.nodes.forEach(dy);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(fy);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(_k), this.nodes.forEach(Tk), this.nodes.forEach(yk), this.nodes.forEach(gk)) : this.nodes.forEach(fy), this.clearAllSnapshots();
      const p = it.now();
      Ze.delta = en(0, 1e3 / 60, p - Ze.timestamp), Ze.timestamp = p, Ze.isProcessing = !0, Uu.update.process(Ze), Uu.preRender.process(Ze), Uu.render.process(Ze), Ze.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, Ed.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(wk), this.sharedNodes.forEach(Pk);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, ke.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      ke.postRender(() => {
        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !st(this.snapshot.measuredBox.x) && !st(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let h = 0; h < this.path.length; h++)
          this.path[h].updateScroll();
      const d = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = $e()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: p } = this.options;
      p && p.notify("LayoutMeasure", this.layout.layoutBox, d ? d.layoutBox : void 0);
    }
    updateScroll(d = "measure") {
      let p = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === d && (p = !1), p && this.instance) {
        const h = i(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: d,
          isRoot: h,
          offset: o(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : h
        };
      }
    }
    resetTransform() {
      if (!a)
        return;
      const d = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, p = this.projectionDelta && !Nv(this.projectionDelta), h = this.getTransformTemplate(), g = h ? h(this.latestValues, "") : void 0, S = g !== this.prevTransformTemplateValue;
      d && this.instance && (p || ur(this.latestValues) || S) && (a(this.instance, g), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(d = !0) {
      const p = this.measurePageBox();
      let h = this.removeElementScroll(p);
      return d && (h = this.removeTransform(h)), Rk(h), {
        animationId: this.root.animationId,
        measuredBox: p,
        layoutBox: h,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      var g;
      const { visualElement: d } = this.options;
      if (!d)
        return $e();
      const p = d.measureViewportBox();
      if (!(((g = this.scroll) == null ? void 0 : g.wasRoot) || this.path.some(Dk))) {
        const { scroll: S } = this.root;
        S && (Xt(p.x, S.offset.x), Xt(p.y, S.offset.y));
      }
      return p;
    }
    removeElementScroll(d) {
      var h;
      const p = $e();
      if (Lt(p, d), (h = this.scroll) != null && h.wasRoot)
        return p;
      for (let g = 0; g < this.path.length; g++) {
        const S = this.path[g], { scroll: l, options: f } = S;
        S !== this.root && l && f.layoutScroll && (l.wasRoot && Lt(p, d), Xt(p.x, l.offset.x), Xt(p.y, l.offset.y));
      }
      return p;
    }
    applyTransform(d, p = !1, h) {
      var S, l;
      const g = h || $e();
      Lt(g, d);
      for (let f = 0; f < this.path.length; f++) {
        const v = this.path[f];
        !p && v.options.layoutScroll && v.scroll && v !== v.root && (Xt(g.x, -v.scroll.offset.x), Xt(g.y, -v.scroll.offset.y)), ur(v.latestValues) && aa(g, v.latestValues, (S = v.layout) == null ? void 0 : S.layoutBox);
      }
      return ur(this.latestValues) && aa(g, this.latestValues, (l = this.layout) == null ? void 0 : l.layoutBox), g;
    }
    removeTransform(d) {
      var h;
      const p = $e();
      Lt(p, d);
      for (let g = 0; g < this.path.length; g++) {
        const S = this.path[g];
        if (!ur(S.latestValues))
          continue;
        let l;
        S.instance && (jc(S.latestValues) && S.updateSnapshot(), l = $e(), Lt(l, S.measurePageBox())), ny(p, S.latestValues, (h = S.snapshot) == null ? void 0 : h.layoutBox, l);
      }
      return ur(this.latestValues) && ny(p, this.latestValues), p;
    }
    setTargetDelta(d) {
      this.targetDelta = d, this.root.scheduleUpdateProjection(), this.isProjectionDirty = !0;
    }
    setOptions(d) {
      this.options = {
        ...this.options,
        ...d,
        crossfade: d.crossfade !== void 0 ? d.crossfade : !0
      };
    }
    clearMeasurements() {
      this.scroll = void 0, this.layout = void 0, this.snapshot = void 0, this.prevTransformTemplateValue = void 0, this.targetDelta = void 0, this.target = void 0, this.isLayoutDirty = !1;
    }
    forceRelativeParentToResolveTarget() {
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== Ze.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(d = !1) {
      var v;
      const p = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = p.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = p.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = p.isSharedProjectionDirty);
      const h = !!this.resumingFrom || this !== p;
      if (!(d || h && this.isSharedProjectionDirty || this.isProjectionDirty || (v = this.parent) != null && v.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: S, layoutId: l } = this.options;
      if (!this.layout || !(S || l))
        return;
      this.resolvedRelativeTargetAt = Ze.timestamp;
      const f = this.getClosestProjectingParent();
      f && this.linkedParentVersion !== f.layoutVersion && !f.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && f && f.layout ? this.createRelativeTarget(f, this.layout.layoutBox, f.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = $e(), this.targetWithTransforms = $e()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), qT(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : Lt(this.target, this.layout.layoutBox), xv(this.target, this.targetDelta)) : Lt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? this.createRelativeTarget(f, this.target, f.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || jc(this.parent.latestValues) || wv(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(d, p, h) {
      this.relativeParent = d, this.linkedParentVersion = d.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = $e(), this.relativeTargetOrigin = $e(), _a(this.relativeTargetOrigin, p, h, this.options.layoutAnchor || void 0), Lt(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      var w;
      const d = this.getLead(), p = !!this.resumingFrom || this !== d;
      let h = !0;
      if ((this.isProjectionDirty || (w = this.parent) != null && w.isProjectionDirty) && (h = !1), p && (this.isSharedProjectionDirty || this.isTransformDirty) && (h = !1), this.resolvedRelativeTargetAt === Ze.timestamp && (h = !1), h)
        return;
      const { layout: g, layoutId: S } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(g || S))
        return;
      Lt(this.layoutCorrected, this.layout.layoutBox);
      const l = this.treeScale.x, f = this.treeScale.y;
      ET(this.layoutCorrected, this.treeScale, this.path, p), d.layout && !d.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (d.target = d.layout.layoutBox, d.targetWithTransforms = $e());
      const { target: v } = d;
      if (!v) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Xh(this.prevProjectionDelta.x, this.projectionDelta.x), Xh(this.prevProjectionDelta.y, this.projectionDelta.y)), ci(this.projectionDelta, this.layoutCorrected, v, this.latestValues), (this.treeScale.x !== l || this.treeScale.y !== f || !ay(this.projectionDelta.x, this.prevProjectionDelta.x) || !ay(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", v));
    }
    hide() {
      this.isVisible = !1;
    }
    show() {
      this.isVisible = !0;
    }
    scheduleRender(d = !0) {
      var p;
      if ((p = this.options.visualElement) == null || p.scheduleRender(), d) {
        const h = this.getStack();
        h && h.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = oo(), this.projectionDelta = oo(), this.projectionDeltaWithTransform = oo();
    }
    setAnimationOrigin(d, p = !1, h) {
      const g = this.snapshot, S = g ? g.latestValues : {}, l = { ...this.latestValues }, f = oo();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !p;
      const v = $e(), w = g ? g.source : void 0, k = this.layout ? this.layout.source : void 0, x = w !== k, A = this.getStack(), E = !A || A.members.length <= 1, R = !!(x && !E && this.options.crossfade === !0 && !this.path.some(bk));
      this.animationProgress = 0;
      let N;
      const O = h == null ? void 0 : h.interpolateProjection(d);
      this.mixTargetDelta = (U) => {
        const K = U / 1e3, G = O == null ? void 0 : O(K);
        G ? (f.x.translate = G.x, f.x.scale = Te(d.x.scale, 1, K), f.x.origin = d.x.origin, f.x.originPoint = d.x.originPoint, f.y.translate = G.y, f.y.scale = Te(d.y.scale, 1, K), f.y.origin = d.y.origin, f.y.originPoint = d.y.originPoint) : (my(f.x, d.x, K), my(f.y, d.y, K)), this.setTargetDelta(f), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (_a(v, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), Ek(this.relativeTarget, this.relativeTargetOrigin, v, K), N && rk(this.relativeTarget, N) && (this.isProjectionDirty = !1), N || (N = $e()), Lt(N, this.relativeTarget)), x && (this.animationValues = l, sk(l, S, this.latestValues, K, R, E)), G && G.rotate !== void 0 && (this.animationValues || (this.animationValues = l), this.animationValues.pathRotation = G.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = K;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(d) {
      var p, h, g;
      this.notifyListeners("animationStart"), (p = this.currentAnimation) == null || p.stop(), (g = (h = this.resumingFrom) == null ? void 0 : h.currentAnimation) == null || g.stop(), this.pendingAnimation && (Gn(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = ke.update(() => {
        ua.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = uo(0)), this.motionValue.jump(0, !1), this.currentAnimation = uk(this.motionValue, [0, 1e3], {
          ...d,
          velocity: 0,
          isSync: !0,
          onUpdate: (S) => {
            this.mixTargetDelta(S), d.onUpdate && d.onUpdate(S);
          },
          onStop: () => {
          },
          onComplete: () => {
            d.onComplete && d.onComplete(), this.completeAnimation();
          }
        }), this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation), this.pendingAnimation = void 0;
      });
    }
    completeAnimation() {
      this.resumingFrom && (this.resumingFrom.currentAnimation = void 0, this.resumingFrom.preserveOpacity = void 0);
      const d = this.getStack();
      d && d.exitAnimationComplete(), this.resumingFrom = this.currentAnimation = this.animationValues = void 0, this.notifyListeners("animationComplete");
    }
    finishAnimation() {
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(mk), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const d = this.getLead();
      let { targetWithTransforms: p, target: h, layout: g, latestValues: S } = d;
      if (!(!p || !h || !g)) {
        if (this !== d && this.layout && g && Vv(this.options.animationType, this.layout.layoutBox, g.layoutBox)) {
          h = this.target || $e();
          const l = st(this.layout.layoutBox.x);
          h.x.min = d.target.x.min, h.x.max = h.x.min + l;
          const f = st(this.layout.layoutBox.y);
          h.y.min = d.target.y.min, h.y.max = h.y.min + f;
        }
        Lt(p, h), aa(p, S), ci(this.projectionDeltaWithTransform, this.layoutCorrected, p, S);
      }
    }
    registerSharedNode(d, p) {
      this.sharedNodes.has(d) || this.sharedNodes.set(d, new pk()), this.sharedNodes.get(d).add(p);
      const g = p.options.initialPromotionConfig;
      p.promote({
        transition: g ? g.transition : void 0,
        preserveFollowOpacity: g && g.shouldPreserveFollowOpacity ? g.shouldPreserveFollowOpacity(p) : void 0
      });
    }
    isLead() {
      const d = this.getStack();
      return d ? d.lead === this : !0;
    }
    getLead() {
      var p;
      const { layoutId: d } = this.options;
      return d ? ((p = this.getStack()) == null ? void 0 : p.lead) || this : this;
    }
    getPrevLead() {
      var p;
      const { layoutId: d } = this.options;
      return d ? (p = this.getStack()) == null ? void 0 : p.prevLead : void 0;
    }
    getStack() {
      const { layoutId: d } = this.options;
      if (d)
        return this.root.sharedNodes.get(d);
    }
    promote({ needsReset: d, transition: p, preserveFollowOpacity: h } = {}) {
      const g = this.getStack();
      g && g.promote(this, h), d && (this.projectionDelta = void 0, this.needsReset = !0), p && this.setOptions({ transition: p });
    }
    relegate() {
      const d = this.getStack();
      return d ? d.relegate(this) : !1;
    }
    resetSkewAndRotation() {
      const { visualElement: d } = this.options;
      if (!d)
        return;
      let p = !1;
      const { latestValues: h } = d;
      if ((h.z || h.rotate || h.rotateX || h.rotateY || h.rotateZ || h.skewX || h.skewY) && (p = !0), !p)
        return;
      const g = {};
      h.z && Ju("z", d, g, this.animationValues);
      for (let S = 0; S < Zu.length; S++)
        Ju(`rotate${Zu[S]}`, d, g, this.animationValues), Ju(`skew${Zu[S]}`, d, g, this.animationValues);
      d.render();
      for (const S in g)
        d.setStaticValue(S, g[S]), this.animationValues && (this.animationValues[S] = g[S]);
      d.scheduleRender();
    }
    applyProjectionStyles(d, p) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        d.visibility = "hidden";
        return;
      }
      const h = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = !1, d.visibility = "", d.opacity = "", d.pointerEvents = la(p == null ? void 0 : p.pointerEvents) || "", d.transform = h ? h(this.latestValues, "") : "none";
        return;
      }
      const g = this.getLead();
      if (!this.projectionDelta || !this.layout || !g.target) {
        this.options.layoutId && (d.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, d.pointerEvents = la(p == null ? void 0 : p.pointerEvents) || ""), this.hasProjected && !ur(this.latestValues) && (d.transform = h ? h({}, "") : "none", this.hasProjected = !1);
        return;
      }
      d.visibility = "";
      const S = g.animationValues || g.latestValues;
      this.applyTransformsToTarget();
      let l = ok(this.projectionDeltaWithTransform, this.treeScale, S);
      h && (l = h(S, l)), d.transform = l;
      const { x: f, y: v } = this.projectionDelta;
      d.transformOrigin = `${f.origin * 100}% ${v.origin * 100}% 0`, g.animationValues ? d.opacity = g === this ? S.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : S.opacityExit : d.opacity = g === this ? S.opacity !== void 0 ? S.opacity : "" : S.opacityExit !== void 0 ? S.opacityExit : 0;
      for (const w in Oc) {
        if (S[w] === void 0)
          continue;
        const { correct: k, applyTo: x, isCSSVariable: A } = Oc[w], E = l === "none" ? S[w] : k(S[w], g);
        if (x) {
          const R = x.length;
          for (let N = 0; N < R; N++)
            d[x[N]] = E;
        } else
          A ? this.options.visualElement.renderState.vars[w] = E : d[w] = E;
      }
      this.options.layoutId && (d.pointerEvents = g === this ? la(p == null ? void 0 : p.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((d) => {
        var p;
        return (p = d.currentAnimation) == null ? void 0 : p.stop();
      }), this.root.nodes.forEach(dy), this.root.sharedNodes.clear();
    }
  };
}
function yk(e) {
  e.updateLayout();
}
function gk(e) {
  var o;
  const n = ((o = e.resumeFrom) == null ? void 0 : o.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: i, measuredBox: a } = e.layout, { animationType: c } = e.options, d = n.source !== e.layout.source;
    if (c === "size")
      Yt((l) => {
        const f = d ? n.measuredBox[l] : n.layoutBox[l], v = st(f);
        f.min = i[l].min, f.max = f.min + v;
      });
    else if (c === "x" || c === "y") {
      const l = c === "x" ? "y" : "x";
      Lc(d ? n.measuredBox[l] : n.layoutBox[l], i[l]);
    } else Vv(c, n.layoutBox, i) && Yt((l) => {
      const f = d ? n.measuredBox[l] : n.layoutBox[l], v = st(i[l]);
      f.max = f.min + v, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[l].max = e.relativeTarget[l].min + v);
    });
    const p = oo();
    ci(p, i, n.layoutBox);
    const h = oo();
    d ? ci(h, e.applyTransform(a, !0), n.measuredBox) : ci(h, i, n.layoutBox);
    const g = !Nv(p);
    let S = !1;
    if (!e.resumeFrom) {
      const l = e.getClosestProjectingParent();
      if (l && !l.resumeFrom) {
        const { snapshot: f, layout: v } = l;
        if (f && v) {
          const w = e.options.layoutAnchor || void 0, k = $e();
          _a(k, n.layoutBox, f.layoutBox, w);
          const x = $e();
          _a(x, i, v.layoutBox, w), Iv(k, x) || (S = !0), l.options.layoutRoot && (e.relativeTarget = x, e.relativeTargetOrigin = k, e.relativeParent = l);
        }
      }
    }
    e.notifyListeners("didUpdate", {
      layout: i,
      snapshot: n,
      delta: h,
      layoutDelta: p,
      hasLayoutChanged: g,
      hasRelativeLayoutChanged: S
    });
  } else if (e.isLead()) {
    const { onExitComplete: i } = e.options;
    i && i();
  }
  e.options.transition = void 0;
}
function vk(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function Sk(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function wk(e) {
  e.clearSnapshot();
}
function dy(e) {
  e.clearMeasurements();
}
function xk(e) {
  e.isLayoutDirty = !0, e.updateLayout();
}
function fy(e) {
  e.isLayoutDirty = !1;
}
function _k(e) {
  e.isAnimationBlocked && e.layout && !e.isLayoutDirty && (e.snapshot = e.layout, e.isLayoutDirty = !0);
}
function Tk(e) {
  const { visualElement: n } = e.options;
  n && n.getProps().onBeforeLayoutMeasure && n.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function py(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function kk(e) {
  e.resolveTargetDelta();
}
function Ak(e) {
  e.calcProjection();
}
function Ck(e) {
  e.resetSkewAndRotation();
}
function Pk(e) {
  e.removeLeadSnapshot();
}
function my(e, n, o) {
  e.translate = Te(n.translate, 0, o), e.scale = Te(n.scale, 1, o), e.origin = n.origin, e.originPoint = n.originPoint;
}
function hy(e, n, o, i) {
  e.min = Te(n.min, o.min, i), e.max = Te(n.max, o.max, i);
}
function Ek(e, n, o, i) {
  hy(e.x, n.x, o.x, i), hy(e.y, n.y, o.y, i);
}
function bk(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const Mk = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, yy = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), gy = yy("applewebkit/") && !yy("chrome/") ? Math.round : Mt;
function vy(e) {
  e.min = gy(e.min), e.max = gy(e.max);
}
function Rk(e) {
  vy(e.x), vy(e.y);
}
function Vv(e, n, o) {
  return e === "position" || e === "preserve-aspect" && !JT(sy(n), sy(o), 0.2);
}
function Dk(e) {
  var n;
  return e !== e.root && ((n = e.scroll) == null ? void 0 : n.wasRoot);
}
const Nk = Lv({
  attachResizeListener: (e, n) => yi(e, "resize", n),
  measureScroll: () => {
    var e, n;
    return {
      x: document.documentElement.scrollLeft || ((e = document.body) == null ? void 0 : e.scrollLeft) || 0,
      y: document.documentElement.scrollTop || ((n = document.body) == null ? void 0 : n.scrollTop) || 0
    };
  },
  checkIsScrollRoot: () => !0
}), qu = {
  current: void 0
}, Bv = Lv({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!qu.current) {
      const e = new Nk({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), qu.current = e;
    }
    return qu.current;
  },
  resetTransform: (e, n) => {
    e.style.transform = n !== void 0 ? n : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), jd = C.createContext({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
function Sy(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function Ik(...e) {
  return (n) => {
    let o = !1;
    const i = e.map((a) => {
      const c = Sy(a, n);
      return !o && typeof c == "function" && (o = !0), c;
    });
    if (o)
      return () => {
        for (let a = 0; a < i.length; a++) {
          const c = i[a];
          typeof c == "function" ? c() : Sy(e[a], null);
        }
      };
  };
}
function jk(...e) {
  return C.useCallback(Ik(...e), e);
}
class Fk extends C.Component {
  getSnapshotBeforeUpdate(n) {
    const o = this.props.childRef.current;
    if (ra(o) && n.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const i = o.offsetParent, a = ra(i) && i.offsetWidth || 0, c = ra(i) && i.offsetHeight || 0, d = getComputedStyle(o), p = this.props.sizeRef.current;
      p.height = parseFloat(d.height), p.width = parseFloat(d.width), p.top = o.offsetTop, p.left = o.offsetLeft, p.right = a - p.width - p.left, p.bottom = c - p.height - p.top, p.direction = d.direction;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function Ok({ children: e, isPresent: n, anchorX: o, anchorY: i, root: a, pop: c }) {
  var f;
  const d = C.useId(), p = C.useRef(null), h = C.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: g } = C.useContext(jd), S = ((f = e.props) == null ? void 0 : f.ref) ?? (e == null ? void 0 : e.ref), l = jk(p, S);
  return C.useInsertionEffect(() => {
    const { width: v, height: w, top: k, left: x, right: A, bottom: E, direction: R } = h.current;
    if (n || c === !1 || !p.current || !v || !w)
      return;
    const N = R === "rtl", O = o === "left" ? N ? `right: ${A}` : `left: ${x}` : N ? `left: ${x}` : `right: ${A}`, U = i === "bottom" ? `bottom: ${E}` : `top: ${k}`;
    p.current.dataset.motionPopId = d;
    const K = document.createElement("style");
    g && (K.nonce = g);
    const G = a ?? document.head;
    return G.appendChild(K), K.sheet && K.sheet.insertRule(`
          [data-motion-pop-id="${d}"] {
            position: absolute !important;
            width: ${v}px !important;
            height: ${w}px !important;
            ${O}px !important;
            ${U}px !important;
          }
        `), () => {
      var L;
      (L = p.current) == null || L.removeAttribute("data-motion-pop-id"), G.contains(K) && G.removeChild(K);
    };
  }, [n]), T.jsx(Fk, { isPresent: n, childRef: p, sizeRef: h, pop: c, children: c === !1 ? e : C.cloneElement(e, { ref: l }) });
}
const Lk = ({ children: e, initial: n, isPresent: o, onExitComplete: i, custom: a, presenceAffectsLayout: c, mode: d, anchorX: p, anchorY: h, root: g }) => {
  const S = fd(Vk), l = C.useId();
  let f = !0, v = C.useMemo(() => (f = !1, {
    id: l,
    initial: n,
    isPresent: o,
    custom: a,
    onExitComplete: (w) => {
      S.set(w, !0);
      for (const k of S.values())
        if (!k)
          return;
      i && i();
    },
    register: (w) => (S.set(w, !1), () => S.delete(w))
  }), [o, S, i]);
  return c && f && (v = { ...v }), C.useMemo(() => {
    S.forEach((w, k) => S.set(k, !1));
  }, [o]), C.useEffect(() => {
    !o && !S.size && i && i();
  }, [o]), e = T.jsx(Ok, { pop: d === "popLayout", isPresent: o, anchorX: p, anchorY: h, root: g, children: e }), T.jsx(Da.Provider, { value: v, children: e });
};
function Vk() {
  return /* @__PURE__ */ new Map();
}
function zv(e = !0) {
  const n = C.useContext(Da);
  if (n === null)
    return [!0, null];
  const { isPresent: o, onExitComplete: i, register: a } = n, c = C.useId();
  C.useEffect(() => {
    if (e)
      return a(c);
  }, [e]);
  const d = C.useCallback(() => e && i && i(c), [c, i, e]);
  return !o && i ? [!1, d] : [!0];
}
const Us = (e) => e.key || "";
function wy(e) {
  const n = [];
  return C.Children.forEach(e, (o) => {
    C.isValidElement(o) && n.push(o);
  }), n;
}
const Fa = ({ children: e, custom: n, initial: o = !0, onExitComplete: i, presenceAffectsLayout: a = !0, mode: c = "sync", propagate: d = !1, anchorX: p = "left", anchorY: h = "top", root: g }) => {
  const [S, l] = zv(d), f = C.useMemo(() => wy(e), [e]), v = d && !S ? [] : f.map(Us), w = C.useRef(!0), k = C.useRef(f), x = fd(() => /* @__PURE__ */ new Map()), A = C.useRef(/* @__PURE__ */ new Set()), [E, R] = C.useState(f), [N, O] = C.useState(f);
  hg(() => {
    w.current = !1, k.current = f;
    for (let G = 0; G < N.length; G++) {
      const L = Us(N[G]);
      v.includes(L) ? (x.delete(L), A.current.delete(L)) : x.get(L) !== !0 && x.set(L, !1);
    }
  }, [N, v.length, v.join("-")]);
  const U = [];
  if (f !== E) {
    let G = [...f];
    for (let L = 0; L < N.length; L++) {
      const X = N[L], ae = Us(X);
      v.includes(ae) || (G.splice(L, 0, X), U.push(X));
    }
    return c === "wait" && U.length && (G = U), O(wy(G)), R(f), null;
  }
  const { forceRender: K } = C.useContext(dd);
  return T.jsx(T.Fragment, { children: N.map((G) => {
    const L = Us(G), X = d && !S ? !1 : f === N || v.includes(L), ae = () => {
      if (A.current.has(L))
        return;
      if (x.has(L))
        A.current.add(L), x.set(L, !0);
      else
        return;
      let q = !0;
      x.forEach((de) => {
        de || (q = !1);
      }), q && (K == null || K(), O(k.current), d && (l == null || l()), i && i());
    };
    return T.jsx(Lk, { isPresent: X, initial: !w.current || o ? void 0 : !1, custom: n, presenceAffectsLayout: a, mode: c, root: g, onExitComplete: X ? void 0 : ae, anchorX: p, anchorY: h, children: G }, L);
  }) });
}, $v = C.createContext({ strict: !1 }), xy = {
  animation: [
    "animate",
    "variants",
    "whileHover",
    "whileTap",
    "exit",
    "whileInView",
    "whileFocus",
    "whileDrag"
  ],
  exit: ["exit"],
  drag: ["drag", "dragControls"],
  focus: ["whileFocus"],
  hover: ["whileHover", "onHoverStart", "onHoverEnd"],
  tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
  pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
  inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
  layout: ["layout", "layoutId"]
};
let _y = !1;
function Bk() {
  if (_y)
    return;
  const e = {};
  for (const n in xy)
    e[n] = {
      isEnabled: (o) => xy[n].some((i) => !!o[i])
    };
  gv(e), _y = !0;
}
function Uv() {
  return Bk(), kT();
}
function zk(e) {
  const n = Uv();
  for (const o in e)
    n[o] = {
      ...n[o],
      ...e[o]
    };
  gv(n);
}
const $k = /* @__PURE__ */ new Set([
  "animate",
  "exit",
  "variants",
  "initial",
  "style",
  "values",
  "variants",
  "transition",
  "transformTemplate",
  "custom",
  "inherit",
  "onBeforeLayoutMeasure",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onDragStart",
  "onDrag",
  "onDragEnd",
  "onMeasureDragConstraints",
  "onDirectionLock",
  "onDragTransitionEnd",
  "_dragX",
  "_dragY",
  "onHoverStart",
  "onHoverEnd",
  "onViewportEnter",
  "onViewportLeave",
  "globalTapTarget",
  "propagate",
  "ignoreStrict",
  "viewport"
]);
function Ta(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || $k.has(e);
}
let Hv = (e) => !Ta(e);
function Uk(e) {
  typeof e == "function" && (Hv = (n) => n.startsWith("on") ? !Ta(n) : e(n));
}
try {
  Uk(require("@emotion/is-prop-valid").default);
} catch {
}
function Hk(e, n, o) {
  const i = {};
  for (const a in e)
    a === "values" && typeof e.values == "object" || Je(e[a]) || (Hv(a) || o === !0 && Ta(a) || !n && !Ta(a) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && a.startsWith("onDrag")) && (i[a] = e[a]);
  return i;
}
const Oa = /* @__PURE__ */ C.createContext({});
function Wk(e, n) {
  if (ja(e)) {
    const { initial: o, animate: i } = e;
    return {
      initial: o === !1 || hi(o) ? o : void 0,
      animate: hi(i) ? i : void 0
    };
  }
  return e.inherit !== !1 ? n : {};
}
function Gk(e) {
  const { initial: n, animate: o } = Wk(e, C.useContext(Oa));
  return C.useMemo(() => ({ initial: n, animate: o }), [Ty(n), Ty(o)]);
}
function Ty(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const Fd = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function Wv(e, n, o) {
  for (const i in n)
    !Je(n[i]) && !kv(i, o) && (e[i] = n[i]);
}
function Kk({ transformTemplate: e }, n) {
  return C.useMemo(() => {
    const o = Fd();
    return Nd(o, n, e), Object.assign({}, o.vars, o.style);
  }, [n]);
}
function Yk(e, n) {
  const o = e.style || {}, i = {};
  return Wv(i, o, e), Object.assign(i, Kk(e, n)), i;
}
function Qk(e, n) {
  const o = {}, i = Yk(e, n);
  return e.drag && e.dragListener !== !1 && (o.draggable = !1, i.userSelect = i.WebkitUserSelect = i.WebkitTouchCallout = "none", i.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (o.tabIndex = 0), o.style = i, o;
}
const Gv = () => ({
  ...Fd(),
  attrs: {}
});
function Xk(e, n, o, i) {
  const a = C.useMemo(() => {
    const c = Gv();
    return Av(c, n, Pv(i), e.transformTemplate, e.style), {
      ...c.attrs,
      style: { ...c.style }
    };
  }, [n]);
  if (e.style) {
    const c = {};
    Wv(c, e.style, e), a.style = { ...c, ...a.style };
  }
  return a;
}
const Zk = [
  "animate",
  "circle",
  "defs",
  "desc",
  "ellipse",
  "g",
  "image",
  "line",
  "filter",
  "marker",
  "mask",
  "metadata",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "switch",
  "symbol",
  "svg",
  "text",
  "tspan",
  "use",
  "view"
];
function Od(e) {
  return (
    /**
     * If it's not a string, it's a custom React component. Currently we only support
     * HTML custom React components.
     */
    typeof e != "string" || /**
     * If it contains a dash, the element is a custom HTML webcomponent.
     */
    e.includes("-") ? !1 : (
      /**
       * If it's in our list of lowercase SVG tags, it's an SVG component
       */
      !!(Zk.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function Jk(e, n, o, { latestValues: i }, a, c = !1, d) {
  const h = (d ?? Od(e) ? Xk : Qk)(n, i, a, e), g = Hk(n, typeof e == "string", c), S = e !== C.Fragment ? { ...g, ...h, ref: o } : {}, { children: l } = n, f = C.useMemo(() => Je(l) ? l.get() : l, [l]);
  return C.createElement(e, {
    ...S,
    children: f
  });
}
function qk({ scrapeMotionValuesFromProps: e, createRenderState: n }, o, i, a) {
  return {
    latestValues: eA(o, i, a, e),
    renderState: n()
  };
}
function eA(e, n, o, i) {
  const a = {}, c = i(e, {});
  for (const f in c)
    a[f] = la(c[f]);
  let { initial: d, animate: p } = e;
  const h = ja(e), g = hv(e);
  n && g && !h && e.inherit !== !1 && (d === void 0 && (d = n.initial), p === void 0 && (p = n.animate));
  let S = o ? o.initial === !1 : !1;
  S = S || d === !1;
  const l = S ? p : d;
  if (l && typeof l != "boolean" && !Ia(l)) {
    const f = Array.isArray(l) ? l : [l];
    for (let v = 0; v < f.length; v++) {
      const w = Cd(e, f[v]);
      if (w) {
        const { transitionEnd: k, transition: x, ...A } = w;
        for (const E in A) {
          let R = A[E];
          if (Array.isArray(R)) {
            const N = S ? R.length - 1 : 0;
            R = R[N];
          }
          R !== null && (a[E] = R);
        }
        for (const E in k)
          a[E] = k[E];
      }
    }
  }
  return a;
}
const Kv = (e) => (n, o) => {
  const i = C.useContext(Oa), a = C.useContext(Da), c = () => qk(e, n, i, a);
  return o ? c() : fd(c);
}, tA = /* @__PURE__ */ Kv({
  scrapeMotionValuesFromProps: Id,
  createRenderState: Fd
}), nA = /* @__PURE__ */ Kv({
  scrapeMotionValuesFromProps: Ev,
  createRenderState: Gv
}), rA = Symbol.for("motionComponentSymbol");
function oA(e, n, o) {
  const i = C.useRef(o);
  C.useInsertionEffect(() => {
    i.current = o;
  });
  const a = C.useRef(null);
  return C.useCallback((c) => {
    var p;
    c && ((p = e.onMount) == null || p.call(e, c)), n && (c ? n.mount(c) : n.unmount());
    const d = i.current;
    if (typeof d == "function")
      if (c) {
        const h = d(c);
        typeof h == "function" && (a.current = h);
      } else a.current ? (a.current(), a.current = null) : d(c);
    else d && (d.current = c);
  }, [n]);
}
const Yv = C.createContext({});
function eo(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function iA(e, n, o, i, a, c) {
  var R, N;
  const { visualElement: d } = C.useContext(Oa), p = C.useContext($v), h = C.useContext(Da), g = C.useContext(jd), S = g.reducedMotion, l = g.skipAnimations, f = C.useRef(null), v = C.useRef(!1);
  i = i || p.renderer, !f.current && i && (f.current = i(e, {
    visualState: n,
    parent: d,
    props: o,
    presenceContext: h,
    blockInitialAnimation: h ? h.initial === !1 : !1,
    reducedMotionConfig: S,
    skipAnimations: l,
    isSVG: c
  }), v.current && f.current && (f.current.manuallyAnimateOnMount = !0));
  const w = f.current, k = C.useContext(Yv);
  w && !w.projection && a && (w.type === "html" || w.type === "svg") && sA(f.current, o, a, k);
  const x = C.useRef(!1);
  C.useInsertionEffect(() => {
    w && x.current && w.update(o, h);
  });
  const A = o[rv], E = C.useRef(!!A && typeof window < "u" && !((R = window.MotionHandoffIsComplete) != null && R.call(window, A)) && ((N = window.MotionHasOptimisedAnimation) == null ? void 0 : N.call(window, A)));
  return hg(() => {
    v.current = !0, w && (x.current = !0, window.MotionIsMounted = !0, w.updateFeatures(), w.scheduleRenderMicrotask(), E.current && w.animationState && w.animationState.animateChanges());
  }), C.useEffect(() => {
    w && (!E.current && w.animationState && w.animationState.animateChanges(), E.current && (queueMicrotask(() => {
      var O;
      (O = window.MotionHandoffMarkAsComplete) == null || O.call(window, A);
    }), E.current = !1), w.enteringChildren = void 0);
  }), w;
}
function sA(e, n, o, i) {
  const { layoutId: a, layout: c, drag: d, dragConstraints: p, layoutScroll: h, layoutRoot: g, layoutAnchor: S, layoutCrossfade: l } = n;
  e.projection = new o(e.latestValues, n["data-framer-portal-id"] ? void 0 : Qv(e.parent)), e.projection.setOptions({
    layoutId: a,
    layout: c,
    alwaysMeasureLayout: !!d || p && eo(p),
    visualElement: e,
    /**
     * TODO: Update options in an effect. This could be tricky as it'll be too late
     * to update by the time layout animations run.
     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
     * ensuring it gets called if there's no potential layout animations.
     *
     */
    animationType: typeof c == "string" ? c : "both",
    initialPromotionConfig: i,
    crossfade: l,
    layoutScroll: h,
    layoutRoot: g,
    layoutAnchor: S
  });
}
function Qv(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Qv(e.parent);
}
function ec(e, { forwardMotionProps: n = !1, type: o } = {}, i, a) {
  i && zk(i);
  const c = o ? o === "svg" : Od(e), d = c ? nA : tA;
  function p(g, S) {
    let l;
    const f = {
      ...C.useContext(jd),
      ...g,
      layoutId: aA(g)
    }, { isStatic: v } = f, w = Gk(g), k = d(g, v);
    if (!v && typeof window < "u") {
      lA();
      const x = uA(f);
      l = x.MeasureLayout, w.visualElement = iA(e, k, f, a, x.ProjectionNode, c);
    }
    return T.jsxs(Oa.Provider, { value: w, children: [l && w.visualElement ? T.jsx(l, { visualElement: w.visualElement, ...f }) : null, Jk(e, g, oA(k, w.visualElement, S), k, v, n, c)] });
  }
  p.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const h = C.forwardRef(p);
  return h[rA] = e, h;
}
function aA({ layoutId: e }) {
  const n = C.useContext(dd).id;
  return n && e !== void 0 ? n + "-" + e : e;
}
function lA(e, n) {
  C.useContext($v).strict;
}
function uA(e) {
  const n = Uv(), { drag: o, layout: i } = n;
  if (!o && !i)
    return {};
  const a = { ...o, ...i };
  return {
    MeasureLayout: o != null && o.isEnabled(e) || i != null && i.isEnabled(e) ? a.MeasureLayout : void 0,
    ProjectionNode: a.ProjectionNode
  };
}
function cA(e, n) {
  if (typeof Proxy > "u")
    return ec;
  const o = /* @__PURE__ */ new Map(), i = (c, d) => ec(c, d, e, n), a = (c, d) => i(c, d);
  return new Proxy(a, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (c, d) => d === "create" ? i : (o.has(d) || o.set(d, ec(d, void 0, e, n)), o.get(d))
  });
}
const dA = (e, n) => n.isSVG ?? Od(e) ? new zT(n) : new jT(n, {
  allowProjection: e !== C.Fragment
});
class fA extends Yn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(n) {
    super(n), n.animationState || (n.animationState = GT(n));
  }
  updateAnimationControlsSubscription() {
    const { animate: n } = this.node.getProps();
    Ia(n) && (this.unmountControls = n.subscribe(this.node));
  }
  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.updateAnimationControlsSubscription();
  }
  update() {
    const { animate: n } = this.node.getProps(), { animate: o } = this.node.prevProps || {};
    n !== o && this.updateAnimationControlsSubscription();
  }
  unmount() {
    var n;
    this.node.animationState.reset(), (n = this.unmountControls) == null || n.call(this);
  }
}
let pA = 0;
class mA extends Yn {
  constructor() {
    super(...arguments), this.id = pA++, this.isExitComplete = !1;
  }
  update() {
    var c;
    if (!this.node.presenceContext)
      return;
    const { isPresent: n, onExitComplete: o } = this.node.presenceContext, { isPresent: i } = this.node.prevPresenceContext || {};
    if (!this.node.animationState || n === i)
      return;
    if (n && i === !1) {
      if (this.isExitComplete) {
        const { initial: d, custom: p } = this.node.getProps();
        if (typeof d == "string" || typeof d == "object" && d !== null && !Array.isArray(d)) {
          const h = hr(this.node, d, p);
          if (h) {
            const { transition: g, transitionEnd: S, ...l } = h;
            for (const f in l)
              (c = this.node.getValue(f)) == null || c.jump(l[f]);
          }
        }
        this.node.animationState.reset(), this.node.animationState.animateChanges();
      } else
        this.node.animationState.setActive("exit", !1);
      this.isExitComplete = !1;
      return;
    }
    const a = this.node.animationState.setActive("exit", !n);
    o && !n && a.then(() => {
      this.isExitComplete = !0, o(this.id);
    });
  }
  mount() {
    const { register: n, onExitComplete: o } = this.node.presenceContext || {};
    o && o(this.id), n && (this.unmount = n(this.id));
  }
  unmount() {
  }
}
const hA = {
  animation: {
    Feature: fA
  },
  exit: {
    Feature: mA
  }
};
function Ai(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const yA = (e) => (n) => bd(n) && e(n, Ai(n));
function di(e, n, o, i) {
  return yi(e, n, yA(o), i);
}
const Xv = ({ current: e }) => e ? e.ownerDocument.defaultView : null, ky = (e, n) => Math.abs(e - n);
function gA(e, n) {
  const o = ky(e.x, n.x), i = ky(e.y, n.y);
  return Math.sqrt(o ** 2 + i ** 2);
}
const Ay = /* @__PURE__ */ new Set(["auto", "scroll"]);
class Zv {
  constructor(n, o, { transformPagePoint: i, contextWindow: a = window, dragSnapToOrigin: c = !1, distanceThreshold: d = 3, element: p } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (v) => {
      this.handleScroll(v.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = Hs(this.lastRawMoveEventInfo, this.transformPagePoint));
      const v = tc(this.lastMoveEventInfo, this.history), w = this.startEvent !== null, k = gA(v.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!w && !k)
        return;
      const { point: x } = v, { timestamp: A } = Ze;
      this.history.push({ ...x, timestamp: A });
      const { onStart: E, onMove: R } = this.handlers;
      w || (E && E(this.lastMoveEvent, v), this.startEvent = this.lastMoveEvent), R && R(this.lastMoveEvent, v);
    }, this.handlePointerMove = (v, w) => {
      this.lastMoveEvent = v, this.lastRawMoveEventInfo = w, this.lastMoveEventInfo = Hs(w, this.transformPagePoint), ke.update(this.updatePoint, !0);
    }, this.handlePointerUp = (v, w) => {
      this.end();
      const { onEnd: k, onSessionEnd: x, resumeAnimation: A } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && A && A(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const E = tc(v.type === "pointercancel" ? this.lastMoveEventInfo : Hs(w, this.transformPagePoint), this.history);
      this.startEvent && k && k(v, E), x && x(v, E);
    }, !bd(n))
      return;
    this.dragSnapToOrigin = c, this.handlers = o, this.transformPagePoint = i, this.distanceThreshold = d, this.contextWindow = a || window;
    const h = Ai(n), g = Hs(h, this.transformPagePoint), { point: S } = g, { timestamp: l } = Ze;
    this.history = [{ ...S, timestamp: l }];
    const { onSessionStart: f } = o;
    f && f(n, tc(g, this.history)), this.removeListeners = _i(di(this.contextWindow, "pointermove", this.handlePointerMove), di(this.contextWindow, "pointerup", this.handlePointerUp), di(this.contextWindow, "pointercancel", this.handlePointerUp)), p && this.startScrollTracking(p);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(n) {
    let o = n.parentElement;
    for (; o; ) {
      const i = getComputedStyle(o);
      (Ay.has(i.overflowX) || Ay.has(i.overflowY)) && this.scrollPositions.set(o, {
        x: o.scrollLeft,
        y: o.scrollTop
      }), o = o.parentElement;
    }
    this.scrollPositions.set(window, {
      x: window.scrollX,
      y: window.scrollY
    }), window.addEventListener("scroll", this.onElementScroll, {
      capture: !0
    }), window.addEventListener("scroll", this.onWindowScroll), this.removeScrollListeners = () => {
      window.removeEventListener("scroll", this.onElementScroll, {
        capture: !0
      }), window.removeEventListener("scroll", this.onWindowScroll);
    };
  }
  /**
   * Handle scroll compensation during drag.
   *
   * For element scroll: adjusts history origin since pageX/pageY doesn't change.
   * For window scroll: adjusts lastMoveEventInfo since pageX/pageY would change.
   */
  handleScroll(n) {
    const o = this.scrollPositions.get(n);
    if (!o)
      return;
    const i = n === window, a = i ? { x: window.scrollX, y: window.scrollY } : {
      x: n.scrollLeft,
      y: n.scrollTop
    }, c = { x: a.x - o.x, y: a.y - o.y };
    c.x === 0 && c.y === 0 || (i ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += c.x, this.lastMoveEventInfo.point.y += c.y) : this.history.length > 0 && (this.history[0].x -= c.x, this.history[0].y -= c.y), this.scrollPositions.set(n, a), ke.update(this.updatePoint, !0));
  }
  updateHandlers(n) {
    this.handlers = n;
  }
  end() {
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), Gn(this.updatePoint);
  }
}
function Hs(e, n) {
  return n ? { point: n(e.point) } : e;
}
function Cy(e, n) {
  return { x: e.x - n.x, y: e.y - n.y };
}
function tc({ point: e }, n) {
  return {
    point: e,
    delta: Cy(e, Jv(n)),
    offset: Cy(e, vA(n)),
    velocity: SA(n, 0.1)
  };
}
function vA(e) {
  return e[0];
}
function Jv(e) {
  return e[e.length - 1];
}
function SA(e, n) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let o = e.length - 1, i = null;
  const a = Jv(e);
  for (; o >= 0 && (i = e[o], !(a.timestamp - i.timestamp > /* @__PURE__ */ mt(n))); )
    o--;
  if (!i)
    return { x: 0, y: 0 };
  i === e[0] && e.length > 2 && a.timestamp - i.timestamp > /* @__PURE__ */ mt(n) * 2 && (i = e[1]);
  const c = /* @__PURE__ */ bt(a.timestamp - i.timestamp);
  if (c === 0)
    return { x: 0, y: 0 };
  const d = {
    x: (a.x - i.x) / c,
    y: (a.y - i.y) / c
  };
  return d.x === 1 / 0 && (d.x = 0), d.y === 1 / 0 && (d.y = 0), d;
}
function wA(e, { min: n, max: o }, i) {
  return n !== void 0 && e < n ? e = i ? Te(n, e, i.min) : Math.max(e, n) : o !== void 0 && e > o && (e = i ? Te(o, e, i.max) : Math.min(e, o)), e;
}
function Py(e, n, o) {
  return {
    min: n !== void 0 ? e.min + n : void 0,
    max: o !== void 0 ? e.max + o - (e.max - e.min) : void 0
  };
}
function xA(e, { top: n, left: o, bottom: i, right: a }) {
  return {
    x: Py(e.x, o, a),
    y: Py(e.y, n, i)
  };
}
function Ey(e, n) {
  let o = n.min - e.min, i = n.max - e.max;
  return n.max - n.min < e.max - e.min && ([o, i] = [i, o]), { min: o, max: i };
}
function _A(e, n) {
  return {
    x: Ey(e.x, n.x),
    y: Ey(e.y, n.y)
  };
}
function TA(e, n) {
  let o = 0.5;
  const i = st(e), a = st(n);
  return a > i ? o = /* @__PURE__ */ pi(n.min, n.max - i, e.min) : i > a && (o = /* @__PURE__ */ pi(e.min, e.max - a, n.min)), en(0, 1, o);
}
function kA(e, n) {
  const o = {};
  return n.min !== void 0 && (o.min = n.min - e.min), n.max !== void 0 && (o.max = n.max - e.min), o;
}
const Vc = 0.35;
function AA(e = Vc) {
  return e === !1 ? e = 0 : e === !0 && (e = Vc), {
    x: by(e, "left", "right"),
    y: by(e, "top", "bottom")
  };
}
function by(e, n, o) {
  return {
    min: My(e, n),
    max: My(e, o)
  };
}
function My(e, n) {
  return typeof e == "number" ? e : e[n] || 0;
}
const CA = /* @__PURE__ */ new WeakMap();
class PA {
  constructor(n) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = $e(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = n;
  }
  start(n, { snapToCursor: o = !1, distanceThreshold: i } = {}) {
    const { presenceContext: a } = this.visualElement;
    if (a && a.isPresent === !1)
      return;
    const c = (l) => {
      o && this.snapToCursor(Ai(l).point), this.stopAnimation();
    }, d = (l, f) => {
      const { drag: v, dragPropagation: w, onDragStart: k } = this.getProps();
      if (v && !w && (this.openDragLock && this.openDragLock(), this.openDragLock = eT(v), !this.openDragLock))
        return;
      this.latestPointerEvent = l, this.latestPanInfo = f, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Yt((A) => {
        let E = this.getAxisMotionValue(A).get() || 0;
        if (qt.test(E)) {
          const { projection: R } = this.visualElement;
          if (R && R.layout) {
            const N = R.layout.layoutBox[A];
            N && (E = st(N) * (parseFloat(E) / 100));
          }
        }
        this.originPoint[A] = E;
      }), k && ke.update(() => k(l, f), !1, !0), bc(this.visualElement, "transform");
      const { animationState: x } = this.visualElement;
      x && x.setActive("whileDrag", !0);
    }, p = (l, f) => {
      this.latestPointerEvent = l, this.latestPanInfo = f;
      const { dragPropagation: v, dragDirectionLock: w, onDirectionLock: k, onDrag: x } = this.getProps();
      if (!v && !this.openDragLock)
        return;
      const { offset: A } = f;
      if (w && this.currentDirection === null) {
        this.currentDirection = bA(A), this.currentDirection !== null && k && k(this.currentDirection);
        return;
      }
      this.updateAxis("x", f.point, A), this.updateAxis("y", f.point, A), this.visualElement.render(), x && ke.update(() => x(l, f), !1, !0);
    }, h = (l, f) => {
      this.latestPointerEvent = l, this.latestPanInfo = f, this.stop(l, f), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, g = () => {
      const { dragSnapToOrigin: l } = this.getProps();
      (l || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: S } = this.getProps();
    this.panSession = new Zv(n, {
      onSessionStart: c,
      onStart: d,
      onMove: p,
      onSessionEnd: h,
      resumeAnimation: g
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: S,
      distanceThreshold: i,
      contextWindow: Xv(this.visualElement),
      element: this.visualElement.current
    });
  }
  /**
   * @internal
   */
  stop(n, o) {
    const i = n || this.latestPointerEvent, a = o || this.latestPanInfo, c = this.isDragging;
    if (this.cancel(), !c || !a || !i)
      return;
    const { velocity: d } = a;
    this.startAnimation(d);
    const { onDragEnd: p } = this.getProps();
    p && ke.postRender(() => p(i, a));
  }
  /**
   * @internal
   */
  cancel() {
    this.isDragging = !1;
    const { projection: n, animationState: o } = this.visualElement;
    n && (n.isAnimationBlocked = !1), this.endPanSession();
    const { dragPropagation: i } = this.getProps();
    !i && this.openDragLock && (this.openDragLock(), this.openDragLock = null), o && o.setActive("whileDrag", !1);
  }
  /**
   * Clean up the pan session without modifying other drag state.
   * This is used during unmount to ensure event listeners are removed
   * without affecting projection animations or drag locks.
   * @internal
   */
  endPanSession() {
    this.panSession && this.panSession.end(), this.panSession = void 0;
  }
  updateAxis(n, o, i) {
    const { drag: a } = this.getProps();
    if (!i || !Ws(n, a, this.currentDirection))
      return;
    const c = this.getAxisMotionValue(n);
    let d = this.originPoint[n] + i[n];
    this.constraints && this.constraints[n] && (d = wA(d, this.constraints[n], this.elastic[n])), c.set(d);
  }
  resolveConstraints() {
    var c;
    const { dragConstraints: n, dragElastic: o } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (c = this.visualElement.projection) == null ? void 0 : c.layout, a = this.constraints;
    n && eo(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && i ? this.constraints = xA(i.layoutBox, n) : this.constraints = !1, this.elastic = AA(o), a !== this.constraints && !eo(n) && i && this.constraints && !this.hasMutatedConstraints && Yt((d) => {
      this.constraints !== !1 && this.getAxisMotionValue(d) && (this.constraints[d] = kA(i.layoutBox[d], this.constraints[d]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: n, onMeasureDragConstraints: o } = this.getProps();
    if (!n || !eo(n))
      return !1;
    const i = n.current;
    wr(i !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: a } = this.visualElement;
    if (!a || !a.layout)
      return !1;
    a.root && (a.root.scroll = void 0, a.root.updateScroll());
    const c = bT(i, a.root, this.visualElement.getTransformPagePoint());
    let d = _A(a.layout.layoutBox, c);
    if (o) {
      const p = o(CT(d));
      this.hasMutatedConstraints = !!p, p && (d = Sv(p));
    }
    return d;
  }
  startAnimation(n) {
    const { drag: o, dragMomentum: i, dragElastic: a, dragTransition: c, dragSnapToOrigin: d, onDragTransitionEnd: p } = this.getProps(), h = this.constraints || {}, g = Yt((S) => {
      if (!Ws(S, o, this.currentDirection))
        return;
      let l = h && h[S] || {};
      (d === !0 || d === S) && (l = { min: 0, max: 0 });
      const f = a ? 200 : 1e6, v = a ? 40 : 1e7, w = {
        type: "inertia",
        velocity: i ? n[S] : 0,
        bounceStiffness: f,
        bounceDamping: v,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...c,
        ...l
      };
      return this.startAxisValueAnimation(S, w);
    });
    return Promise.all(g).then(p);
  }
  startAxisValueAnimation(n, o) {
    const i = this.getAxisMotionValue(n);
    return bc(this.visualElement, n), i.start(Ad(n, i, 0, o, this.visualElement, !1));
  }
  stopAnimation() {
    Yt((n) => this.getAxisMotionValue(n).stop());
  }
  /**
   * Drag works differently depending on which props are provided.
   *
   * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
   * - Otherwise, we apply the delta to the x/y motion values.
   */
  getAxisMotionValue(n) {
    const o = `_drag${n.toUpperCase()}`, a = this.visualElement.getProps()[o];
    return a || this.visualElement.getValue(n, this.visualElement.latestValues[n] ?? 0);
  }
  snapToCursor(n) {
    Yt((o) => {
      const { drag: i } = this.getProps();
      if (!Ws(o, i, this.currentDirection))
        return;
      const { projection: a } = this.visualElement, c = this.getAxisMotionValue(o);
      if (a && a.layout) {
        const { min: d, max: p } = a.layout.layoutBox[o], h = c.get() || 0;
        c.set(n[o] - Te(d, p, 0.5) + h);
      }
    });
  }
  /**
   * When the viewport resizes we want to check if the measured constraints
   * have changed and, if so, reposition the element within those new constraints
   * relative to where it was before the resize.
   */
  scalePositionWithinConstraints() {
    if (!this.visualElement.current)
      return;
    const { drag: n, dragConstraints: o } = this.getProps(), { projection: i } = this.visualElement;
    if (!eo(o) || !i || !this.constraints)
      return;
    this.stopAnimation();
    const a = { x: 0, y: 0 };
    Yt((d) => {
      const p = this.getAxisMotionValue(d);
      if (p && this.constraints !== !1) {
        const h = p.get();
        a[d] = TA({ min: h, max: h }, this.constraints[d]);
      }
    });
    const { transformTemplate: c } = this.visualElement.getProps();
    this.visualElement.current.style.transform = c ? c({}, "") : "none", i.root && i.root.updateScroll(), i.updateLayout(), this.constraints = !1, this.resolveConstraints(), Yt((d) => {
      if (!Ws(d, n, null))
        return;
      const p = this.getAxisMotionValue(d), { min: h, max: g } = this.constraints[d];
      p.set(Te(h, g, a[d]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    CA.set(this.visualElement, this);
    const n = this.visualElement.current, o = di(n, "pointerdown", (g) => {
      const { drag: S, dragListener: l = !0 } = this.getProps(), f = g.target, v = f !== n && sT(f);
      S && l && !v && this.start(g);
    });
    let i;
    const a = () => {
      const { dragConstraints: g } = this.getProps();
      eo(g) && g.current && (this.constraints = this.resolveRefConstraints(), i || (i = EA(n, g.current, () => this.scalePositionWithinConstraints())));
    }, { projection: c } = this.visualElement, d = c.addEventListener("measure", a);
    c && !c.layout && (c.root && c.root.updateScroll(), c.updateLayout()), ke.read(a);
    const p = yi(window, "resize", () => this.scalePositionWithinConstraints()), h = c.addEventListener("didUpdate", (({ delta: g, hasLayoutChanged: S }) => {
      this.isDragging && S && (Yt((l) => {
        const f = this.getAxisMotionValue(l);
        f && (this.originPoint[l] += g[l].translate, f.set(f.get() + g[l].translate));
      }), this.visualElement.render());
    }));
    return () => {
      p(), o(), d(), h && h(), i && i();
    };
  }
  getProps() {
    const n = this.visualElement.getProps(), { drag: o = !1, dragDirectionLock: i = !1, dragPropagation: a = !1, dragConstraints: c = !1, dragElastic: d = Vc, dragMomentum: p = !0 } = n;
    return {
      ...n,
      drag: o,
      dragDirectionLock: i,
      dragPropagation: a,
      dragConstraints: c,
      dragElastic: d,
      dragMomentum: p
    };
  }
}
function Ry(e) {
  let n = !0;
  return () => {
    if (n) {
      n = !1;
      return;
    }
    e();
  };
}
function EA(e, n, o) {
  const i = Lh(e, Ry(o)), a = Lh(n, Ry(o));
  return () => {
    i(), a();
  };
}
function Ws(e, n, o) {
  return (n === !0 || n === e) && (o === null || o === e);
}
function bA(e, n = 10) {
  let o = null;
  return Math.abs(e.y) > n ? o = "y" : Math.abs(e.x) > n && (o = "x"), o;
}
class MA extends Yn {
  constructor(n) {
    super(n), this.removeGroupControls = Mt, this.removeListeners = Mt, this.controls = new PA(n);
  }
  mount() {
    const { dragControls: n } = this.node.getProps();
    n && (this.removeGroupControls = n.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || Mt;
  }
  update() {
    const { dragControls: n } = this.node.getProps(), { dragControls: o } = this.node.prevProps || {};
    n !== o && (this.removeGroupControls(), n && (this.removeGroupControls = n.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const nc = (e) => (n, o) => {
  e && ke.update(() => e(n, o), !1, !0);
};
class RA extends Yn {
  constructor() {
    super(...arguments), this.removePointerDownListener = Mt;
  }
  onPointerDown(n) {
    this.session = new Zv(n, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Xv(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: n, onPanStart: o, onPan: i, onPanEnd: a } = this.node.getProps();
    return {
      onSessionStart: nc(n),
      onStart: nc(o),
      onMove: nc(i),
      onEnd: (c, d) => {
        delete this.session, a && ke.postRender(() => a(c, d));
      }
    };
  }
  mount() {
    this.removePointerDownListener = di(this.node.current, "pointerdown", (n) => this.onPointerDown(n));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let rc = !1;
class DA extends C.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: n, layoutGroup: o, switchLayoutGroup: i, layoutId: a } = this.props, { projection: c } = n;
    c && (o.group && o.group.add(c), i && i.register && a && i.register(c), rc && c.root.didUpdate(), c.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), c.setOptions({
      ...c.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), ua.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(n) {
    const { layoutDependency: o, visualElement: i, drag: a, isPresent: c } = this.props, { projection: d } = i;
    return d && (d.isPresent = c, n.layoutDependency !== o && d.setOptions({
      ...d.options,
      layoutDependency: o
    }), rc = !0, a || n.layoutDependency !== o || o === void 0 || n.isPresent !== c ? d.willUpdate() : this.safeToRemove(), n.isPresent !== c && (c ? d.promote() : d.relegate() || ke.postRender(() => {
      const p = d.getStack();
      (!p || !p.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: n, layoutAnchor: o } = this.props, { projection: i } = n;
    i && (i.options.layoutAnchor = o, i.root.didUpdate(), Ed.postRender(() => {
      !i.currentAnimation && i.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: n, layoutGroup: o, switchLayoutGroup: i } = this.props, { projection: a } = n;
    rc = !0, a && (a.scheduleCheckAfterUnmount(), o && o.group && o.group.remove(a), i && i.deregister && i.deregister(a));
  }
  safeToRemove() {
    const { safeToRemove: n } = this.props;
    n && n();
  }
  render() {
    return null;
  }
}
function qv(e) {
  const [n, o] = zv(), i = C.useContext(dd);
  return T.jsx(DA, { ...e, layoutGroup: i, switchLayoutGroup: C.useContext(Yv), isPresent: n, safeToRemove: o });
}
const NA = {
  pan: {
    Feature: RA
  },
  drag: {
    Feature: MA,
    ProjectionNode: Bv,
    MeasureLayout: qv
  }
};
function Dy(e, n, o) {
  const { props: i } = e;
  e.animationState && i.whileHover && e.animationState.setActive("whileHover", o === "Start");
  const a = "onHover" + o, c = i[a];
  c && ke.postRender(() => c(n, Ai(n)));
}
class IA extends Yn {
  mount() {
    const { current: n } = this.node;
    n && (this.unmount = nT(n, (o, i) => (Dy(this.node, i, "Start"), (a) => Dy(this.node, a, "End"))));
  }
  unmount() {
  }
}
class jA extends Yn {
  constructor() {
    super(...arguments), this.isActive = !1;
  }
  onFocus() {
    let n = !1;
    try {
      n = this.node.current.matches(":focus-visible");
    } catch {
      n = !0;
    }
    !n || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !0), this.isActive = !0);
  }
  onBlur() {
    !this.isActive || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !1), this.isActive = !1);
  }
  mount() {
    this.unmount = _i(yi(this.node.current, "focus", () => this.onFocus()), yi(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function Ny(e, n, o) {
  const { props: i } = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
    return;
  e.animationState && i.whileTap && e.animationState.setActive("whileTap", o === "Start");
  const a = "onTap" + (o === "End" ? "" : o), c = i[a];
  c && ke.postRender(() => c(n, Ai(n)));
}
class FA extends Yn {
  mount() {
    const { current: n } = this.node;
    if (!n)
      return;
    const { globalTapTarget: o, propagate: i } = this.node.props;
    this.unmount = lT(n, (a, c) => (Ny(this.node, c, "Start"), (d, { success: p }) => Ny(this.node, d, p ? "End" : "Cancel")), {
      useGlobalTarget: o,
      stopPropagation: (i == null ? void 0 : i.tap) === !1
    });
  }
  unmount() {
  }
}
const Bc = /* @__PURE__ */ new WeakMap(), oc = /* @__PURE__ */ new WeakMap(), OA = (e) => {
  const n = Bc.get(e.target);
  n && n(e);
}, LA = (e) => {
  e.forEach(OA);
};
function VA({ root: e, ...n }) {
  const o = e || document;
  oc.has(o) || oc.set(o, {});
  const i = oc.get(o), a = JSON.stringify(n);
  return i[a] || (i[a] = new IntersectionObserver(LA, { root: e, ...n })), i[a];
}
function BA(e, n, o) {
  const i = VA(n);
  return Bc.set(e, o), i.observe(e), () => {
    Bc.delete(e), i.unobserve(e);
  };
}
const zA = {
  some: 0,
  all: 1
};
class $A extends Yn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var h;
    (h = this.stopObserver) == null || h.call(this);
    const { viewport: n = {} } = this.node.getProps(), { root: o, margin: i, amount: a = "some", once: c } = n, d = {
      root: o ? o.current : void 0,
      rootMargin: i,
      threshold: typeof a == "number" ? a : zA[a]
    }, p = (g) => {
      const { isIntersecting: S } = g;
      if (this.isInView === S || (this.isInView = S, c && !S && this.hasEnteredView))
        return;
      S && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", S);
      const { onViewportEnter: l, onViewportLeave: f } = this.node.getProps(), v = S ? l : f;
      v && v(g);
    };
    this.stopObserver = BA(this.node.current, d, p);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: n, prevProps: o } = this.node;
    ["amount", "margin", "root"].some(UA(n, o)) && this.startObserver();
  }
  unmount() {
    var n;
    (n = this.stopObserver) == null || n.call(this), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function UA({ viewport: e = {} }, { viewport: n = {} } = {}) {
  return (o) => e[o] !== n[o];
}
const HA = {
  inView: {
    Feature: $A
  },
  tap: {
    Feature: FA
  },
  focus: {
    Feature: jA
  },
  hover: {
    Feature: IA
  }
}, WA = {
  layout: {
    ProjectionNode: Bv,
    MeasureLayout: qv
  }
}, GA = {
  ...hA,
  ...HA,
  ...NA,
  ...WA
}, Kn = /* @__PURE__ */ cA(GA, dA);
function KA(e) {
  const o = String(e || "").toLowerCase().split(".");
  if (o.length !== 4 || o.some((a) => !/^\d+$/.test(a))) return !1;
  const i = o.map(Number);
  return i.some((a) => a < 0 || a > 255) ? !1 : i[0] === 10 || i[0] === 172 && i[1] >= 16 && i[1] <= 31 || i[0] === 192 && i[1] === 168;
}
function e0(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function Iy(e) {
  return e0(e) || KA(e);
}
function YA(e) {
  return !e || e0(e) ? "127.0.0.1" : e;
}
const QA = (() => {
  var S, l, f, v;
  const e = globalThis.window || globalThis, n = globalThis.document || {}, o = e.location || {}, i = String(e.SYNAPSE_DATA_API_PORT || ((l = (S = n.body) == null ? void 0 : S.dataset) == null ? void 0 : l.dataApiPort) || "3001").trim(), { protocol: a = "file:", hostname: c = "127.0.0.1", port: d = "" } = o, p = `http://${YA(c)}:${i || "3001"}`, h = String(e.SYNAPSE_DATA_API_BASE || ((v = (f = n.body) == null ? void 0 : f.dataset) == null ? void 0 : v.dataApiBase) || "").replace(/\/+$/, ""), g = `${a}//${o.host || (d ? `${c}:${d}` : c)}`.replace(/\/+$/, "");
  return h && !(Iy(c) && d !== i && h === g) ? h : a === "file:" || Iy(c) && d !== i ? p : `${a}//${o.host || c}`;
})(), XA = new fg(QA), ic = Number((globalThis.window || globalThis).SYNAPSE_DATA_API_TIMEOUT_MS || 6e3), ZA = Number.isFinite(ic) && ic > 0 ? ic : 6e3;
function JA(e, n) {
  typeof window > "u" || console.warn(e, n);
}
async function qA(e) {
  var i, a;
  const o = (((a = (i = e.headers) == null ? void 0 : i.get) == null ? void 0 : a.call(i, "content-type")) || "").includes("application/json") ? await e.json() : {};
  if (!e.ok || (o == null ? void 0 : o.ok) === !1)
    throw new Error((o == null ? void 0 : o.error) || `Synapse data API returned HTTP ${e.status}`);
  return o;
}
async function eC(e, n = {}) {
  const o = await XA.fetch(e, {
    timeoutMs: ZA,
    ...n
  });
  return qA(o);
}
async function tC(e) {
  try {
    return (await eC("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e || {})
    })).item || null;
  } catch (n) {
    return JA("Synapse data API focus-session save skipped:", n), null;
  }
}
class nC {
  constructor(n = () => globalThis.localStorage) {
    this.storageProvider = n;
  }
  get storage() {
    return this.storageProvider();
  }
  set(n, o) {
    try {
      return this.storage.setItem(n, o), !0;
    } catch (i) {
      return console.warn(`Could not save ${n} to localStorage:`, i), !1;
    }
  }
  get(n, o = "") {
    try {
      const i = this.storage.getItem(n);
      return i === null ? o : i;
    } catch (i) {
      return console.warn(`Could not read ${n} from localStorage:`, i), o;
    }
  }
  remove(n) {
    try {
      return this.storage.removeItem(n), !0;
    } catch (o) {
      return console.warn(`Could not remove ${n} from localStorage:`, o), !1;
    }
  }
  readJSON(n, o) {
    const i = this.get(n, "");
    if (!i) return o;
    try {
      const a = JSON.parse(i);
      return a ?? o;
    } catch (a) {
      return console.warn(`Could not parse ${n} from localStorage:`, a), o;
    }
  }
  writeJSON(n, o) {
    try {
      return this.set(n, JSON.stringify(o));
    } catch (i) {
      return console.warn(`Could not serialize ${n} for localStorage:`, i), !1;
    }
  }
}
const t0 = new nC();
function Ld(e, n) {
  return t0.readJSON(e, n);
}
function Vd(e, n) {
  return t0.writeJSON(e, n);
}
const n0 = "synapse.focusRoom.sessions.v1", r0 = "synapse.focusRoom.draft.v1", o0 = "synapse.focusRoom.active-session.v1", zc = 40, jy = Object.freeze([
  "idle",
  "running",
  "paused",
  "completed",
  "break",
  "restoring"
]), rC = Object.freeze({
  studying: "running",
  running: "running",
  idle: "idle",
  paused: "paused",
  completed: "completed",
  break: "break",
  restoring: "restoring"
});
let $c = [];
const cr = (e) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(e)}`, Un = [
  {
    label: "Deep Focus",
    title: "Chasing Daylight",
    artist: "Scott Buckley",
    streamUrl: "https://www.scottbuckley.com.au/library/wp-content/uploads/2021/03/sb_chasingdaylight.mp3",
    pageUrl: "https://www.scottbuckley.com.au/library/chasing-daylight/",
    license: "CC BY 4.0",
    attribution: "'Chasing Daylight' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
  },
  {
    label: "Lo-fi",
    title: "Lofi Hip Hop Upbeat",
    artist: "raspberrymusic",
    streamUrl: cr("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg",
    license: "CC BY 4.0",
    attribution: "Raspberrymusic - Lofi Hip Hop Upbeat by raspberrymusic"
  },
  {
    label: "Piano",
    title: "The Long Dark",
    artist: "Scott Buckley",
    streamUrl: "https://www.scottbuckley.com.au/library/wp-content/uploads/2023/01/TheLongDark.mp3",
    pageUrl: "https://www.scottbuckley.com.au/library/the-long-dark/",
    license: "CC BY 4.0",
    attribution: "'The Long Dark' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
  },
  {
    label: "Minimal",
    title: "Computations in a Snowstorm",
    artist: "Scott Buckley",
    streamUrl: "https://www.scottbuckley.com.au/library/wp-content/uploads/2019/01/sb_computations_altmix.mp3",
    pageUrl: "https://www.scottbuckley.com.au/library/computations/",
    license: "CC BY 4.0",
    attribution: "'Computations in a Snowstorm' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
  }
], Ke = {
  nature: {
    id: "nature-forest",
    title: "Forest ambience",
    artist: "nille",
    streamUrl: cr("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: cr("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: cr("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: cr("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: cr("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: cr("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, Hn = [
  {
    label: "Nature",
    layers: [Ke.nature],
    pageUrl: Ke.nature.pageUrl,
    license: Ke.nature.license
  },
  {
    label: "Cafe Rain",
    layers: [Ke.cafe, Ke.rain],
    pageUrl: Ke.cafe.pageUrl,
    license: "CC0 / Public domain"
  },
  {
    label: "Rain",
    layers: [Ke.rain],
    pageUrl: Ke.rain.pageUrl,
    license: Ke.rain.license
  },
  {
    label: "White Noise",
    layers: [Ke.whiteNoise],
    pageUrl: Ke.whiteNoise.pageUrl,
    license: Ke.whiteNoise.license
  },
  {
    label: "Ocean",
    layers: [Ke.ocean],
    pageUrl: Ke.ocean.pageUrl,
    license: Ke.ocean.license
  },
  {
    label: "Wind",
    layers: [Ke.wind],
    pageUrl: Ke.wind.pageUrl,
    license: Ke.wind.license
  }
], xr = [
  {
    id: "morning-window",
    name: "Morning Window",
    kicker: "Bright focus",
    description: "Soft daylight, quiet desk, gentle outdoor calm.",
    image: "./assets/focus-room/morning-window.webp",
    ambientSound: "Nature",
    musicType: "Piano"
  },
  {
    id: "rainy-cafe",
    name: "Rainy Cafe",
    kicker: "Low hum",
    description: "Window rain, warm lights, steady cafe ambience.",
    image: "./assets/focus-room/rainy-cafe.webp",
    ambientSound: "Cafe Rain",
    musicType: "Lo-fi"
  },
  {
    id: "library-night",
    name: "Library Night",
    kicker: "Quiet review",
    description: "Desk lamp, bookshelves, late-night concentration.",
    image: "./assets/focus-room/library-night.webp",
    ambientSound: "White Noise",
    musicType: "Minimal"
  },
  {
    id: "ocean-study-room",
    name: "Ocean Study Room",
    kicker: "Open air",
    description: "Blue horizon, slow waves, clean study energy.",
    image: "./assets/focus-room/ocean-study-room.webp",
    ambientSound: "Cafe Rain",
    musicType: "Lo-fi"
  },
  {
    id: "mountain-cabin",
    name: "Mountain Cabin",
    kicker: "Warm retreat",
    description: "Timber, mountain air, and an unhurried study block.",
    image: "./assets/focus-room/mountain-cabin.webp",
    ambientSound: "Wind",
    musicType: "Piano"
  },
  {
    id: "minimal-desk",
    name: "Minimal Desk",
    kicker: "Clean reset",
    description: "A clear desk, soft light, and room to think.",
    image: "./assets/focus-room/minimal-desk.webp",
    ambientSound: "White Noise",
    musicType: "Deep Focus"
  }
], oC = [25, 45, 50, 90];
function iC(e = "") {
  const n = String(e || "");
  return Un.find((o) => o.label === n) || Un[0];
}
function sC(e = "") {
  const n = String(e || "");
  return Hn.find((o) => o.label === n) || Hn[0];
}
function La(e = {}) {
  const n = iC(e == null ? void 0 : e.musicType), o = sC(e == null ? void 0 : e.ambientSound);
  return {
    musicTrack: n,
    ambientSound: o,
    ambientLayers: o.layers.map((i) => ({
      ...i,
      volumeBias: Vn(i.volumeBias, 1)
    }))
  };
}
function aC(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function i0(e) {
  return String(e || "").trim();
}
function lC({ material: e, goal: n, durationMinutes: o }) {
  var S;
  const i = Math.max(10, Number(o) || 25), a = (S = e == null ? void 0 : e.studyHeadings) != null && S.length ? e.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], c = String(n || "").trim() || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`, d = Math.max(1, Math.floor(i * 0.2)), p = Math.max(1, Math.floor(i * 0.4)), h = Math.max(1, Math.floor(i * 0.2)), g = Math.max(1, i - d - p - h);
  return [
    { minutes: d, task: `Set the goal: ${c}` },
    { minutes: p, task: `Review ${a[0] || "the core ideas"}` },
    { minutes: h, task: `Practice with ${a[1] || a[0] || "the generated examples"}` },
    { minutes: g, task: "Summarize mistakes and choose the next study step" }
  ];
}
function s0() {
  return Ld(r0, null);
}
function uC(e) {
  return Vd(r0, e || null);
}
function a0(e) {
  if (!e || typeof e != "object")
    return { materials: {} };
  const n = aC(e.materials);
  return {
    ...e,
    materials: { ...n }
  };
}
function co(e, n = "idle") {
  const o = rC[String(e || "").trim().toLowerCase()];
  return o && jy.includes(o) ? o : jy.includes(n) ? n : "idle";
}
function Bd(e) {
  return co(e) === "running" ? "studying" : co(e);
}
function l0(e = {}, n = {}) {
  const o = e && typeof e == "object" ? e : {}, i = n && typeof n == "object" ? n : {}, a = Object.prototype.hasOwnProperty.call(o, "timerStatus"), c = Object.prototype.hasOwnProperty.call(o, "timerState") || Object.prototype.hasOwnProperty.call(o, "timerPhase"), d = co(
    c ? o.timerState || o.timerPhase : a ? o.timerStatus : o.status || i.timerState,
    co(i.timerState || i.timerPhase || i.timerStatus)
  ), p = o.timerMode === "countup" || i.timerMode === "countup" && !Object.prototype.hasOwnProperty.call(o, "timerMode") ? "countup" : "countdown", g = Object.fromEntries(["timerAnchorAtMs", "timerPausedAtMs", "timerUpdatedAtMs", "timerRestoredAtMs"].map((l) => {
    const f = Object.prototype.hasOwnProperty.call(o, l) ? o[l] : i[l], v = Number(f);
    return [l, Number.isFinite(v) && v > 0 ? v : null];
  })), S = Math.max(0, Vn(
    Object.prototype.hasOwnProperty.call(o, "elapsedSeconds") ? o.elapsedSeconds : i.elapsedSeconds,
    0
  ));
  return {
    ...i,
    ...o,
    timerState: d,
    timerPhase: d,
    status: d,
    timerStatus: Bd(d),
    timerMode: p,
    elapsedSeconds: S,
    ...g
  };
}
function u0() {
  return a0(Ld(o0, null));
}
function cC(e) {
  return Vd(o0, a0(e));
}
function dC(e) {
  const n = i0(e);
  if (!n) return null;
  const i = u0().materials[n];
  return i && typeof i == "object" ? l0(i) : null;
}
function zd(e, n) {
  const o = i0(e);
  if (!o) return !1;
  const i = u0();
  return n && typeof n == "object" ? i.materials[o] = {
    ...l0(n, i.materials[o]),
    materialId: o,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  } : delete i.materials[o], cC(i);
}
function c0(e) {
  return zd(e, null);
}
function Uc() {
  const e = Ld(n0, []), n = Array.isArray(e) ? e : [], o = /* @__PURE__ */ new Set();
  return [...$c, ...n].filter((i) => {
    const a = String((i == null ? void 0 : i.sessionId) || "");
    return !a || o.has(a) ? !1 : (o.add(a), !0);
  }).slice(0, zc);
}
function Vn(e, n) {
  const o = Number(e);
  return Number.isFinite(o) ? o : n;
}
function fC(e = {}) {
  const n = (/* @__PURE__ */ new Date()).toISOString(), i = { ...{
    sessionId: e.sessionId || `focus-${Date.now()}`,
    materialId: String(e.materialId || ""),
    materialTitle: e.materialTitle || "Study material",
    studyGoal: e.studyGoal || "",
    selectedScene: e.selectedScene || "morning-window",
    musicType: e.musicType || "Deep Focus",
    ambientSound: e.ambientSound || "Nature",
    musicVolume: Vn(e.musicVolume ?? 60, 60),
    ambientVolume: Vn(e.ambientVolume ?? 50, 50),
    pomodoroDuration: Vn(e.pomodoroDuration || 25, 25),
    startedAt: e.startedAt || n,
    endedAt: e.endedAt || n,
    totalFocusTime: Math.max(0, Vn(e.totalFocusTime || 0, 0)),
    flashcardsCompleted: Math.max(0, Vn(e.flashcardsCompleted || 0, 0)),
    quizScore: e.quizScore === null || e.quizScore === void 0 || e.quizScore === "" ? null : Number.isFinite(Number(e.quizScore)) ? Number(e.quizScore) : null,
    mistakesMade: Array.isArray(e.mistakesMade) ? e.mistakesMade : [],
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks : [],
    aiReflection: e.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: e.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: e.sessionDate || n
  }, persisted: !0 }, a = Uc().filter((h) => h.sessionId !== i.sessionId), c = [i, ...a.map((h) => ({ ...h, persisted: !0 }))].slice(0, zc), d = Vd(n0, c), p = { ...i, persisted: d };
  return tC(p).catch((h) => {
    console.warn("Synapse data API focus-session background save failed:", h);
  }), d ? $c = [] : $c = [p, ...a].slice(0, zc), p;
}
function d0(e) {
  const n = Math.max(0, Vn(e || 0, 0)), o = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60);
  return o ? `${o}h ${i}m` : `${i}m`;
}
var ug;
const Hc = ((ug = xr[0]) == null ? void 0 : ug.id) || "morning-window", Bn = oC[0], pC = 10, Va = 180, $d = 60, f0 = Va * 60, mC = 0, hC = 100, yC = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"], Wc = new Set(yC), Ud = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function gC(e, n, o, i) {
  const a = Number(e);
  return Number.isFinite(a) ? Math.min(i, Math.max(o, a)) : n;
}
function yr(e, n, o, i) {
  return Math.round(gC(e, n, o, i));
}
function gr(e, n = 50) {
  return yr(e, n, mC, hC);
}
function Ba(e, n = Bn) {
  return yr(e, n, pC, Va);
}
function kr(e, n = Bn * 60) {
  return yr(e, n, $d, f0);
}
function Hd(e) {
  return xr.find((n) => n.id === e) || null;
}
function _r(e = Hc) {
  return Hd(e) || xr[0] || {
    id: Hc,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function p0(e) {
  return Array.isArray(e) ? e.map((n) => ({
    minutes: yr(n == null ? void 0 : n.minutes, 5, 1, Va),
    task: String((n == null ? void 0 : n.task) || "").trim()
  })).filter((n) => n.task) : [];
}
function ai(e) {
  return Array.isArray(e) ? e.map((n) => ({
    role: String((n == null ? void 0 : n.role) || "assistant") === "user" ? "user" : "assistant",
    text: String((n == null ? void 0 : n.text) || "").trim(),
    createdAt: (n == null ? void 0 : n.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
  })).filter((n) => n.text).slice(-24) : [];
}
function m0(e) {
  if (!e || typeof e != "object")
    return { materials: {} };
  if (e.materials && typeof e.materials == "object")
    return {
      ...e,
      materials: { ...e.materials }
    };
  const n = String(e.materialId || "");
  return n ? {
    materials: {
      [n]: e
    }
  } : { materials: {} };
}
function Gc(e, n, o) {
  return e ? lC({
    material: e,
    goal: n,
    durationMinutes: o
  }) : [];
}
function gi(e) {
  const n = Ba(e);
  return n > 0 ? n * 60 : 0;
}
function ka(e) {
  const n = Math.max(0, Math.floor(Number(e) || 0)), o = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60), a = n % 60, c = (d) => String(d).padStart(2, "0");
  return o ? `${o}:${c(i)}:${c(a)}` : `${c(i)}:${c(a)}`;
}
function Fy(e) {
  const n = (e == null ? void 0 : e.flashcards) || [];
  return Array.isArray(n) ? n.slice(0, 24) : [];
}
function vC(e, n) {
  return String((e == null ? void 0 : e.id) || (e == null ? void 0 : e.front) || (e == null ? void 0 : e.term) || n);
}
function SC(e) {
  var n;
  return Array.isArray(e == null ? void 0 : e.questions) ? e.questions : Array.isArray((n = e == null ? void 0 : e.quiz) == null ? void 0 : n.questions) ? e.quiz.questions : [];
}
function Kc(e) {
  return (Array.isArray(e == null ? void 0 : e.quizzes) ? e.quizzes : []).flatMap((o) => SC(o).map((i) => {
    var a;
    return {
      ...i,
      quizTitle: (o == null ? void 0 : o.title) || ((a = o == null ? void 0 : o.quiz) == null ? void 0 : a.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function wC(e, n) {
  return (e == null ? void 0 : e.question) || (e == null ? void 0 : e.prompt) || (e == null ? void 0 : e.stem) || `Question ${n + 1}`;
}
function Wd(e) {
  return String((e == null ? void 0 : e.type) || "").toLowerCase();
}
function xC(e) {
  return String((e == null ? void 0 : e.label) || (e == null ? void 0 : e.text) || e).trim();
}
function Aa(e) {
  const n = (e == null ? void 0 : e.choices) || (e == null ? void 0 : e.options) || (e == null ? void 0 : e.answers);
  return Array.isArray(n) && n.length ? n.map(xC).filter(Boolean) : Wd(e) === "true_false" ? ["True", "False"] : [];
}
function Yc(e) {
  const n = (e == null ? void 0 : e.correctOptionIndexes) || (e == null ? void 0 : e.correct_option_indexes) || (e == null ? void 0 : e.correctIndexes);
  return Array.isArray(n) ? n.map((o) => Number(o)).filter(Number.isInteger) : [];
}
function _C(e, n) {
  const o = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [], i = Array.isArray(n) ? [...n].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [];
  return o.length === i.length && o.every((a, c) => a === i[c]);
}
function vr(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Ca(e, n) {
  if (Number.isInteger(n)) return n;
  const o = Number(n);
  if (typeof n != "string" && Number.isInteger(o)) return o;
  const i = Aa(e), a = vr(n);
  return i.findIndex((c) => vr(c) === a);
}
function h0(e, n) {
  if (typeof n == "boolean") return n;
  if (n === 0) return !0;
  if (n === 1) return !1;
  const o = Aa(e), i = vr(n);
  return i === "true" ? !0 : i === "false" ? !1 : vr(o[0]) === i ? !0 : vr(o[1]) === i ? !1 : null;
}
function TC(e, n, o) {
  const i = Wd(e);
  if (i === "multiple_choice") {
    const a = Ca(e, n);
    if (!Number.isInteger(a) || a < 0) return [];
    const c = Array.isArray(o) ? [...o] : [];
    return c.includes(a) ? c.filter((d) => d !== a) : [...c, a].sort((d, p) => d - p);
  }
  if (i === "single_choice") {
    const a = Ca(e, n);
    return Number.isInteger(a) && a >= 0 ? a : "";
  }
  if (i === "true_false") {
    const a = h0(e, n);
    return a === null ? "" : a;
  }
  return String(n || "");
}
function y0(e) {
  const n = (e == null ? void 0 : e.correctAnswer) ?? (e == null ? void 0 : e.correct_answer) ?? (e == null ? void 0 : e.answer) ?? (e == null ? void 0 : e.correct), o = Yc(e);
  if (o.length) {
    const i = Aa(e);
    return o.map((a) => i[a] || "").filter(Boolean).join(", ");
  }
  if (typeof (e == null ? void 0 : e.correctBoolean) == "boolean" || typeof (e == null ? void 0 : e.correct_boolean) == "boolean") {
    const i = Aa(e);
    return (typeof e.correctBoolean == "boolean" ? e.correctBoolean : e.correct_boolean) ? i[0] || "True" : i[1] || "False";
  }
  return e != null && e.expectedAnswer || e != null && e.expected_answer ? String(e.expectedAnswer || e.expected_answer || "").trim() : Array.isArray(n) ? n.map((i) => String(i)).join(", ") : String(n || "").trim();
}
function kC(e, n) {
  const o = Wd(e);
  if (o === "single_choice") {
    const a = Yc(e)[0], c = Ca(e, n);
    return Number.isInteger(a) ? c === a : null;
  }
  if (o === "multiple_choice") {
    const a = Yc(e), c = Array.isArray(n) ? n : [Ca(e, n)].filter(Number.isInteger);
    return a.length ? _C(c, a) : null;
  }
  if (o === "true_false") {
    const a = typeof (e == null ? void 0 : e.correctBoolean) == "boolean" ? e.correctBoolean : e == null ? void 0 : e.correct_boolean, c = h0(e, n);
    return typeof a == "boolean" && c !== null ? c === a : null;
  }
  const i = y0(e);
  return i ? vr(n) === vr(i) : null;
}
function g0(e, n, o) {
  var p;
  const i = String(e || "").trim(), a = String((n == null ? void 0 : n.summaryText) || (n == null ? void 0 : n.aiSummary) || "").slice(0, 420), c = ((p = n == null ? void 0 : n.studyHeadings) == null ? void 0 : p[0]) || (n == null ? void 0 : n.materialTitle) || "this material", d = o || `Study ${(n == null ? void 0 : n.materialTitle) || "this material"}`;
  return i ? [
    `For ${c}: ${a || "use the selected material as your main source."}`,
    `Your current goal is: ${d}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function AC() {
  return /* @__PURE__ */ T.jsx("svg", { className: "liquid-glass-filter-defs", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ T.jsx("defs", { children: /* @__PURE__ */ T.jsxs("filter", { id: "liquid-glass-displacement", x: "-12%", y: "-12%", width: "124%", height: "124%", colorInterpolationFilters: "sRGB", children: [
    /* @__PURE__ */ T.jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.024", numOctaves: "2", seed: "17", result: "liquid-noise" }),
    /* @__PURE__ */ T.jsx("feDisplacementMap", { in: "SourceGraphic", in2: "liquid-noise", scale: "7", xChannelSelector: "R", yChannelSelector: "B", result: "refracted-surface" }),
    /* @__PURE__ */ T.jsx("feColorMatrix", { in: "refracted-surface", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.04 0", result: "edge-alpha" }),
    /* @__PURE__ */ T.jsx("feGaussianBlur", { in: "edge-alpha", stdDeviation: "0.25", result: "soft-edge" }),
    /* @__PURE__ */ T.jsx("feBlend", { in: "soft-edge", in2: "refracted-surface", mode: "screen" })
  ] }) }) });
}
function CC({ scene: e }) {
  const [n, o] = C.useState(!1), [i, a] = C.useState(!1);
  return C.useEffect(() => {
    o(!1), a(!1);
  }, [e == null ? void 0 : e.id]), /* @__PURE__ */ T.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ T.jsx(AC, {}),
    /* @__PURE__ */ T.jsx(Fa, { mode: "wait", children: /* @__PURE__ */ T.jsxs(
      Kn.div,
      {
        className: "focus-background",
        style: { backgroundImage: i ? "none" : void 0 },
        initial: { opacity: 0, scale: 1.035 },
        animate: { opacity: 1, scale: 1.02 },
        exit: { opacity: 0, scale: 1.015 },
        transition: { duration: 0.8, ease: "easeOut" },
        children: [
          e != null && e.image ? /* @__PURE__ */ T.jsx(
            "img",
            {
              className: `focus-background-media focus-background-poster ${n ? "is-ready" : ""}`.trim(),
              src: e.image,
              alt: "",
              onLoad: () => o(!0),
              onError: () => a(!0)
            }
          ) : null,
          e != null && e.video ? /* @__PURE__ */ T.jsx(
            "video",
            {
              className: `focus-background-media focus-background-video ${n ? "is-ready" : ""}`.trim(),
              src: e.video,
              poster: e.image,
              autoPlay: !0,
              muted: !0,
              loop: !0,
              playsInline: !0,
              preload: "metadata",
              onLoadedData: () => o(!0),
              onError: () => a(!0)
            }
          ) : null
        ]
      },
      (e == null ? void 0 : e.id) || "focus-background"
    ) }),
    /* @__PURE__ */ T.jsx("div", { className: "focus-overlay" }),
    /* @__PURE__ */ T.jsx("div", { className: "focus-vignette" })
  ] });
}
const Oy = (e) => {
  let n;
  const o = /* @__PURE__ */ new Set(), i = (g, S) => {
    const l = typeof g == "function" ? g(n) : g;
    if (!Object.is(l, n)) {
      const f = n;
      n = S ?? (typeof l != "object" || l === null) ? l : Object.assign({}, n, l), o.forEach((v) => v(n, f));
    }
  }, a = () => n, p = { setState: i, getState: a, getInitialState: () => h, subscribe: (g) => (o.add(g), () => o.delete(g)) }, h = n = e(i, a, p);
  return p;
}, PC = ((e) => e ? Oy(e) : Oy), EC = (e) => e;
function bC(e, n = EC) {
  const o = pn.useSyncExternalStore(
    e.subscribe,
    pn.useCallback(() => n(e.getState()), [e, n]),
    pn.useCallback(() => n(e.getInitialState()), [e, n])
  );
  return pn.useDebugValue(o), o;
}
const Ly = (e) => {
  const n = PC(e), o = (i) => bC(n, i);
  return Object.assign(o, n), o;
}, MC = ((e) => e ? Ly(e) : Ly), Gd = Object.freeze({
  "white-noise": 0,
  "pink-noise": 0,
  "brown-noise": 0,
  "light-rain": 24,
  "heavy-rain": 0,
  "ocean-waves": 0,
  wind: 0,
  fireplace: 0,
  train: 0,
  cafe: 0,
  street: 0,
  forest: 0,
  "summer-night": 0,
  waterfall: 0,
  typing: 0,
  "page-turning": 0,
  writing: 0
});
function RC() {
  return xr[0] || _r(Hc);
}
function DC(e) {
  const n = String(e || "");
  if (!n) return null;
  const i = m0(s0()).materials[n];
  return i && typeof i == "object" ? i : null;
}
function jn(e) {
  var i;
  const n = String(e.selectedMaterialId || ((i = e.selectedMaterial) == null ? void 0 : i.materialId) || "");
  if (!n) return;
  const o = m0(s0());
  o.materials[n] = {
    materialId: n,
    selectedScene: e.selectedScene,
    musicType: e.musicType,
    ambientSound: e.ambientSound,
    musicVolume: gr(e.musicVolume),
    ambientVolume: gr(e.ambientVolume),
    audioChannels: { ...Gd, ...e.audioChannels || {} },
    durationMinutes: Ba(e.pomodoroDuration),
    durationSeconds: kr(e.pomodoroDurationSeconds, gi(e.pomodoroDuration)),
    studyGoal: e.studyGoal,
    studyPlan: p0(e.studyPlan),
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks.filter(Boolean) : [],
    workspaceNotes: String(e.workspaceNotes || ""),
    workspaceUpdatedAt: e.workspaceUpdatedAt || "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, uC(o);
}
function NC(e) {
  return Array.isArray(e == null ? void 0 : e.completedTasks) ? e.completedTasks.map((n) => String(n || "").trim()).filter(Boolean) : [];
}
function Qc(e = {}) {
  return {
    sectionTitle: String(e.sectionTitle || "").trim(),
    excerpt: String(e.excerpt || "").trim().slice(0, 1800)
  };
}
function v0(e = null) {
  return !e || typeof e != "object" ? null : {
    id: String(e.id || "").trim(),
    title: String(e.title || "").trim(),
    excerpt: String(e.excerpt || "").trim().slice(0, 1800),
    sourceId: String(e.sourceId || e.source_id || "").trim(),
    sourceIndex: Number(e.sourceIndex || e.source_index || 0) || 0,
    sourceLabel: String(e.sourceLabel || e.source_label || "").trim(),
    sourceKind: String(e.sourceKind || e.source_kind || "").trim(),
    sectionTitle: String(e.sectionTitle || e.section_title || "").trim(),
    kind: String(e.kind || "evidence").trim()
  };
}
function wt() {
  const e = Date.now();
  return Number.isFinite(e) ? e : 0;
}
function Zt(e = {}) {
  return co(e.timerState || e.timerPhase || e.status || e.timerStatus);
}
function io(e = {}) {
  const n = Number(e.pomodoroDurationSeconds);
  return Number.isFinite(n) && n > 0 ? kr(n, gi(e.pomodoroDuration)) : gi(e.pomodoroDuration);
}
function zn(e = {}) {
  if (e.timerMode === "countup") return 0;
  const n = Number(e.timerDurationSeconds);
  return Number.isFinite(n) && n > 0 ? n : io(e);
}
function Pa(e = {}, n = wt()) {
  const o = Math.max(0, Number(e.elapsedSeconds) || 0);
  if (Zt(e) !== "running") return o;
  const i = Number(e.timerAnchorAtMs);
  return !Number.isFinite(i) || i <= 0 ? o : Math.max(o, Math.floor(Math.max(0, n - i) / 1e3));
}
function Qt(e, n = wt()) {
  const o = co(e);
  return {
    timerState: o,
    timerPhase: o,
    status: o,
    timerStatus: Bd(o),
    timerUpdatedAtMs: n
  };
}
function IC(e = {}) {
  const n = Zt(e);
  return {
    timerState: n,
    timerPhase: n,
    status: n,
    timerStatus: Bd(n),
    timerMode: e.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: Number.isFinite(Number(e.timerAnchorAtMs)) ? Number(e.timerAnchorAtMs) : null,
    timerPausedAtMs: Number.isFinite(Number(e.timerPausedAtMs)) ? Number(e.timerPausedAtMs) : null,
    timerUpdatedAtMs: Number.isFinite(Number(e.timerUpdatedAtMs)) ? Number(e.timerUpdatedAtMs) : null,
    timerRestoredAtMs: Number.isFinite(Number(e.timerRestoredAtMs)) ? Number(e.timerRestoredAtMs) : null,
    timerDurationSeconds: zn(e),
    pomodoroDuration: e.pomodoroDuration,
    pomodoroDurationSeconds: io(e),
    elapsedSeconds: Math.max(0, Number(e.elapsedSeconds) || 0),
    startedAt: e.startedAt || null,
    currentSession: e.currentSession || null,
    view: e.view
  };
}
function Fn(e) {
  var o;
  const n = String(e.selectedMaterialId || ((o = e.selectedMaterial) == null ? void 0 : o.materialId) || "");
  return !n || e.view !== "session" ? !1 : zd(n, IC(e));
}
function Vy(e, n = wt()) {
  const o = Pa(e, n), i = zn(e), a = e.timerMode !== "countup" && i > 0 && o >= i, c = a ? "completed" : Zt(e);
  return {
    ...Qt(c, n),
    elapsedSeconds: a ? i : o,
    timerAnchorAtMs: c === "running" ? e.timerAnchorAtMs : null,
    timerPausedAtMs: c === "running" ? null : e.timerPausedAtMs || n,
    audioPlaying: c === "running" ? e.audioPlaying : !1
  };
}
function jC(e, n = {}) {
  const o = _r(n.selectedScene), i = DC(e == null ? void 0 : e.materialId), a = Hd(i == null ? void 0 : i.selectedScene) ? i.selectedScene : o.id, c = _r(a), d = String((i == null ? void 0 : i.musicType) || c.musicType || "Deep Focus"), p = String((i == null ? void 0 : i.ambientSound) || c.ambientSound || "Nature"), h = gr(i == null ? void 0 : i.musicVolume, n.musicVolume ?? 60), g = gr(i == null ? void 0 : i.ambientVolume, n.ambientVolume ?? 50), S = Ba(i == null ? void 0 : i.durationMinutes, n.pomodoroDuration ?? Bn), l = kr(
    i == null ? void 0 : i.durationSeconds,
    n.pomodoroDurationSeconds ?? S * 60
  ), f = String((i == null ? void 0 : i.studyGoal) || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`), v = p0(i == null ? void 0 : i.studyPlan), w = v.length ? v : Gc(e, f, S), k = NC(i), x = String((i == null ? void 0 : i.workspaceNotes) || ""), A = (i == null ? void 0 : i.workspaceUpdatedAt) || (i == null ? void 0 : i.updatedAt) || "";
  return {
    selectedScene: a,
    musicType: d,
    ambientSound: p,
    musicVolume: h,
    ambientVolume: g,
    audioChannels: { ...Gd, ...(i == null ? void 0 : i.audioChannels) || n.audioChannels || {} },
    pomodoroDuration: S,
    pomodoroDurationSeconds: l,
    studyGoal: f,
    studyPlan: w,
    completedTasks: k,
    workspaceNotes: x,
    workspaceUpdatedAt: A
  };
}
function FC(e) {
  const n = dC(e);
  if (!n || typeof n != "object") return null;
  const o = Zt(n), i = wt(), a = Number(n.timerAnchorAtMs), c = Date.parse(n.startedAt || ""), d = Number.isFinite(c) ? c : NaN, p = o === "running" ? Pa({
    ...n,
    timerState: "running",
    timerAnchorAtMs: Number.isFinite(a) && a > 0 ? a : d
  }, i) : Math.max(0, Number(n.elapsedSeconds) || 0), h = zn(n), g = o === "running" ? h > 0 && p >= h ? "completed" : "paused" : o, S = o === "running";
  return {
    route: n.view === "session" ? "session" : "setup",
    view: n.view === "session" ? "session" : "setup",
    ...Qt(S ? "restoring" : g, i),
    timerRestoreTarget: S ? g : null,
    timerMode: n.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: null,
    timerPausedAtMs: S ? null : Number(n.timerPausedAtMs) || null,
    timerRestoredAtMs: S ? null : i,
    timerDurationSeconds: h,
    ...Number(n.pomodoroDurationSeconds) > 0 ? { pomodoroDurationSeconds: kr(n.pomodoroDurationSeconds) } : {},
    elapsedSeconds: h > 0 ? Math.min(h, p) : p,
    startedAt: n.startedAt || null,
    currentSession: n.currentSession || null,
    completedTasks: Array.isArray(n.completedTasks) ? n.completedTasks.filter(Boolean) : [],
    flashcardIndex: Math.max(0, Number(n.flashcardIndex) || 0),
    flashcardSide: n.flashcardSide === "back" ? "back" : "front",
    flashcardProgress: n.flashcardProgress && typeof n.flashcardProgress == "object" && !Array.isArray(n.flashcardProgress) ? n.flashcardProgress : {},
    quizAnswers: n.quizAnswers && typeof n.quizAnswers == "object" && !Array.isArray(n.quizAnswers) ? n.quizAnswers : {},
    quizChecked: n.quizChecked && typeof n.quizChecked == "object" && !Array.isArray(n.quizChecked) ? n.quizChecked : {},
    chatMessages: ai(n.chatMessages),
    chatPending: !1,
    chatError: "",
    panelTab: Wc.has(n.panelTab) ? n.panelTab : "materials",
    workspaceNotes: String(n.workspaceNotes || ""),
    workspaceUpdatedAt: n.workspaceUpdatedAt || n.updatedAt || "",
    activeNoteSection: String(n.activeNoteSection || ""),
    activeSourceHighlight: v0(n.activeSourceHighlight),
    assistantContext: Qc(n.assistantContext),
    audioPlaying: !1
  };
}
function Gs() {
  return {
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {}
  };
}
function OC(e) {
  return Object.values(e.flashcardProgress || {}).filter((n) => n && n.difficulty).length;
}
function LC(e) {
  const n = Object.values(e.quizChecked || {}).filter((i) => i && i.hasKnownAnswer);
  if (!n.length) return null;
  const o = n.filter((i) => i.correct).length;
  return Math.round(o / n.length * 100);
}
function VC(e) {
  const n = Kc(e.selectedMaterial);
  return Object.entries(e.quizChecked || {}).filter(([, o]) => o && o.hasKnownAnswer && !o.correct).map(([o]) => wC(n[Number(o)], Number(o))).filter(Boolean);
}
async function BC(e, n, o, i = {}) {
  var d, p;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: g0(e, o, Q.getState().studyGoal),
      offline: !0
    };
  const a = await globalThis.apiClient.fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: e,
      selected_section: i.sectionTitle || ((d = o == null ? void 0 : o.studyHeadings) == null ? void 0 : d[0]) || "",
      selected_excerpt: i.excerpt || "",
      source_strict: !!(o != null && o.isSourceRestricted),
      preferred_language: ((p = globalThis.preferredLanguage) == null ? void 0 : p.value) || "auto",
      title: (o == null ? void 0 : o.materialTitle) || "Study material",
      summary: (o == null ? void 0 : o.aiSummary) || (o == null ? void 0 : o.summaryText) || "",
      sections: (o == null ? void 0 : o.sections) || {},
      source_identity: (o == null ? void 0 : o.materialId) || "",
      source_fingerprint: (o == null ? void 0 : o.sourceFingerprint) || "",
      chat_history: n
    })
  });
  let c = null;
  try {
    c = await a.json();
  } catch {
    throw new Error("Backend returned non-JSON response.");
  }
  if (!a.ok || c != null && c.error)
    throw new Error((c == null ? void 0 : c.error) || "AI request failed.");
  return {
    answer: (c == null ? void 0 : c.answer) || "No answer returned.",
    usedExternalResearch: !!(c != null && c.used_external_research),
    researchSources: Array.isArray(c == null ? void 0 : c.research_sources) ? c.research_sources : []
  };
}
const Q = MC((e, n) => {
  const o = RC();
  return {
    route: "session",
    view: "session",
    materials: [],
    materialsStatus: "idle",
    materialsError: "",
    selectedMaterialId: "focus-room",
    selectedMaterial: null,
    selectedScene: o.id,
    musicType: o.musicType || "Deep Focus",
    ambientSound: o.ambientSound || "Nature",
    musicVolume: 60,
    ambientVolume: 50,
    audioChannels: { ...Gd },
    pomodoroDuration: Bn,
    pomodoroDurationSeconds: gi(Bn),
    timerStatus: "idle",
    timerState: "idle",
    timerPhase: "idle",
    status: "idle",
    timerRestoreTarget: null,
    timerMode: "countdown",
    timerAnchorAtMs: null,
    timerPausedAtMs: null,
    timerUpdatedAtMs: null,
    timerRestoredAtMs: null,
    timerDurationSeconds: gi(Bn),
    studyGoal: "Deep work block",
    studyPlan: [],
    aiPanelOpen: !1,
    isIdle: !1,
    currentSession: {
      sessionId: `focus-${Date.now()}`,
      materialId: "focus-room",
      studyGoal: "Deep work block",
      selectedScene: o.id,
      musicType: o.musicType || "Deep Focus",
      ambientSound: o.ambientSound || "Nature",
      musicVolume: 60,
      ambientVolume: 50,
      pomodoroDuration: Bn,
      startedAt: null
    },
    sessionHistory: [],
    activeDrawer: "",
    audioPlaying: !1,
    elapsedSeconds: 0,
    startedAt: null,
    panelTab: "materials",
    summaryRecord: null,
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {},
    workspaceNotes: "",
    workspaceUpdatedAt: "",
    activeNoteSection: "",
    activeSourceHighlight: null,
    assistantContext: { sectionTitle: "", excerpt: "" },
    chatMessages: [],
    chatPending: !1,
    chatError: "",
    setIdle: (i) => e({ isIdle: i }),
    initializeFocusRoom() {
      const i = n();
      if (i.view === "session" && i.selectedMaterialId === "focus-room" && i.currentSession) return;
      const a = _r(i.selectedScene);
      e({
        route: "session",
        view: "session",
        selectedMaterialId: "focus-room",
        selectedMaterial: null,
        studyGoal: i.studyGoal || "Deep work block",
        studyPlan: [],
        completedTasks: [],
        currentSession: {
          sessionId: `focus-${Date.now()}`,
          materialId: "focus-room",
          studyGoal: i.studyGoal || "Deep work block",
          selectedScene: a.id,
          musicType: i.musicType,
          ambientSound: i.ambientSound,
          musicVolume: i.musicVolume,
          ambientVolume: i.ambientVolume,
          pomodoroDuration: i.pomodoroDuration,
          startedAt: null
        }
      });
    },
    setMaterialsState({ items: i = [], status: a = "ready", error: c = "" } = {}) {
      e({
        materials: Array.isArray(i) ? i : [],
        materialsStatus: a === "error" ? "error" : a === "loading" ? "loading" : "ready",
        materialsError: String(c || "")
      });
    },
    hydrateFocusRoute(i, a, { preserveSession: c = !1 } = {}) {
      const d = n(), p = !!a, h = p ? a.materialId : String(i.materialId || "");
      if (!p) {
        e({
          route: "setup",
          view: "setup",
          selectedMaterialId: h,
          selectedMaterial: null,
          aiPanelOpen: !1,
          activeDrawer: "",
          summaryRecord: null,
          studyPlan: [],
          workspaceNotes: "",
          workspaceUpdatedAt: "",
          activeNoteSection: "",
          activeSourceHighlight: null,
          assistantContext: { sectionTitle: "", excerpt: "" }
        });
        return;
      }
      const g = d.selectedMaterialId === h, S = g && c ? null : FC(h), l = g && c ? {} : jC(a, d), f = g && c ? {} : {
        timerStatus: "idle",
        timerState: "idle",
        timerPhase: "idle",
        status: "idle",
        timerRestoreTarget: null,
        timerMode: "countdown",
        timerAnchorAtMs: null,
        timerPausedAtMs: null,
        timerUpdatedAtMs: null,
        timerRestoredAtMs: null,
        timerDurationSeconds: io({
          pomodoroDuration: l.pomodoroDuration || Bn,
          pomodoroDurationSeconds: l.pomodoroDurationSeconds
        }),
        elapsedSeconds: 0,
        startedAt: null,
        currentSession: null,
        ...Gs(),
        chatMessages: [],
        chatPending: !1,
        chatError: "",
        activeNoteSection: "",
        activeSourceHighlight: null,
        assistantContext: { sectionTitle: "", excerpt: "" }
      }, v = g && c ? d.view === "session" ? "session" : "setup" : (S == null ? void 0 : S.view) === "session" ? "session" : "setup";
      if (e({
        ...l,
        ...f,
        ...S,
        route: v,
        view: v,
        selectedMaterialId: h,
        selectedMaterial: a,
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null
      }), (S == null ? void 0 : S.timerState) === "restoring") {
        const w = S.timerRestoreTarget || "paused";
        Promise.resolve().then(() => {
          const k = n();
          if (k.selectedMaterialId !== h || k.timerState !== "restoring") return;
          const x = wt(), A = zn(k), E = A > 0 ? Math.min(A, Math.max(0, Number(k.elapsedSeconds) || 0)) : Math.max(0, Number(k.elapsedSeconds) || 0), R = {
            ...Qt(w, x),
            timerRestoreTarget: null,
            timerAnchorAtMs: null,
            timerPausedAtMs: w === "paused" ? x : null,
            timerRestoredAtMs: x,
            elapsedSeconds: E,
            audioPlaying: !1
          };
          e(R), Fn({ ...k, ...R });
        });
      }
    },
    showStudyHistory() {
      e({
        route: "history",
        view: "history",
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null,
        sessionHistory: Uc()
      });
    },
    selectScene(i) {
      const a = Hd(i);
      a && e((c) => {
        const d = {
          selectedScene: a.id,
          musicType: a.musicType || c.musicType,
          ambientSound: a.ambientSound || c.ambientSound
        }, p = { ...c, ...d };
        return jn(p), d;
      });
    },
    setPomodoroDurationSeconds(i) {
      e((a) => {
        const c = kr(i, a.pomodoroDurationSeconds), d = Math.max(1, Math.round(c / 60)), p = a.selectedMaterial ? Gc(a.selectedMaterial, a.studyGoal, d) : [], h = {
          pomodoroDuration: d,
          pomodoroDurationSeconds: c,
          studyPlan: p,
          timerDurationSeconds: a.timerMode === "countup" ? 0 : c
        };
        return jn({ ...a, ...h }), h;
      });
    },
    setPomodoroDuration(i) {
      const a = Ba(i, n().pomodoroDuration);
      n().setPomodoroDurationSeconds(a * 60);
    },
    setStudyGoal(i) {
      e((a) => {
        const c = String(i ?? ""), d = a.selectedMaterial ? Gc(a.selectedMaterial, c, a.pomodoroDuration) : [], p = { studyGoal: c, studyPlan: d };
        return jn({ ...a, ...p }), p;
      });
    },
    setSound(i, a) {
      e((c) => {
        var p;
        let d = {};
        if (i === "musicVolume" && (d = { musicVolume: gr(a, c.musicVolume) }), i === "ambientVolume" && (d = { ambientVolume: gr(a, c.ambientVolume) }), i === "musicType" && (d = { musicType: String(a || c.musicType) }), i === "ambientSound" && (d = { ambientSound: String(a || c.ambientSound) }), String(i).startsWith("audioChannel:")) {
          const h = String(i).slice(13);
          d = { audioChannels: { ...c.audioChannels, [h]: gr(a, ((p = c.audioChannels) == null ? void 0 : p[h]) ?? 0) } };
        }
        return jn({ ...c, ...d }), d;
      });
    },
    toggleAudio() {
      e((i) => ({ audioPlaying: !i.audioPlaying }));
    },
    setAudioPlaying(i) {
      e({ audioPlaying: !!i });
    },
    openDrawer(i) {
      e({
        activeDrawer: i
      });
    },
    closeDrawer() {
      e({
        activeDrawer: ""
      });
    },
    toggleAIPanel(i = null) {
      e((a) => ({ aiPanelOpen: typeof i == "boolean" ? i : !a.aiPanelOpen }));
    },
    openStudyPanel(i = "materials") {
      const a = Wc.has(String(i || "")) ? String(i) : "materials";
      e({
        panelTab: a,
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    selectSourceHighlight(i = null, { openPanel: a = !0 } = {}) {
      const c = v0(i);
      e({
        activeSourceHighlight: c,
        activeNoteSection: (c == null ? void 0 : c.sectionTitle) || n().activeNoteSection || "",
        assistantContext: c ? Qc({
          sectionTitle: c.sectionTitle,
          excerpt: c.excerpt
        }) : n().assistantContext,
        ...a ? { panelTab: "sources", aiPanelOpen: !0, activeDrawer: "" } : {}
      });
    },
    setActiveNoteSection(i = "") {
      e({
        activeNoteSection: String(i || "").trim()
      });
    },
    setPanelTab(i) {
      const a = String(i || "materials");
      e({
        panelTab: Wc.has(a) ? a : "materials",
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    startSession() {
      const i = n();
      jn(i), e({
        route: "session",
        view: "session",
        timerStatus: "idle",
        timerState: "idle",
        timerPhase: "idle",
        status: "idle",
        timerRestoreTarget: null,
        timerMode: "countdown",
        timerAnchorAtMs: null,
        timerPausedAtMs: null,
        timerUpdatedAtMs: wt(),
        timerRestoredAtMs: null,
        timerDurationSeconds: io(i),
        elapsedSeconds: 0,
        startedAt: null,
        summaryRecord: null,
        aiPanelOpen: !1,
        activeDrawer: "",
        currentSession: {
          sessionId: `focus-${Date.now()}`,
          materialId: "focus-room",
          studyGoal: i.studyGoal,
          selectedScene: i.selectedScene,
          musicType: i.musicType,
          ambientSound: i.ambientSound,
          musicVolume: i.musicVolume,
          ambientVolume: i.ambientVolume,
          pomodoroDuration: i.pomodoroDuration,
          startedAt: null
        },
        ...Gs(),
        chatMessages: [],
        chatPending: !1,
        chatError: ""
      });
    },
    startTimer() {
      const i = n(), a = wt(), c = Zt(i);
      if (c === "running") {
        n().tickTimer();
        return;
      }
      const d = zn(i), p = c === "completed" || c === "break" || d > 0 && i.elapsedSeconds >= d, h = p ? 0 : Math.max(0, Number(i.elapsedSeconds) || 0), g = {
        view: "session",
        route: "session",
        ...Qt("running", a),
        audioPlaying: !0,
        summaryRecord: null,
        elapsedSeconds: h,
        startedAt: !i.startedAt || p ? new Date(a).toISOString() : i.startedAt,
        timerAnchorAtMs: a - h * 1e3,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerRestoreTarget: null,
        timerDurationSeconds: d,
        ...p ? Gs() : {}
      };
      e(g), Fn({ ...i, ...g });
    },
    pauseTimer({ pauseAudio: i = !0 } = {}) {
      const a = n(), c = wt();
      if (Zt(a) !== "running") {
        i && a.audioPlaying && e({ audioPlaying: !1 });
        return;
      }
      const d = Vy(a, c), p = {
        ...d,
        ...Qt(d.timerState === "completed" ? "completed" : "paused", c),
        timerAnchorAtMs: null,
        timerPausedAtMs: c,
        audioPlaying: i ? !1 : a.audioPlaying
      };
      e(p), Fn({ ...a, ...p });
    },
    resetTimer() {
      const i = wt(), a = {
        ...Qt("idle", i),
        timerRestoreTarget: null,
        timerMode: "countdown",
        timerAnchorAtMs: null,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerDurationSeconds: io(n()),
        audioPlaying: !1,
        startedAt: null,
        elapsedSeconds: 0,
        summaryRecord: null,
        ...Gs()
      };
      e(a), Fn({ ...n(), ...a });
    },
    skipTimer() {
      const i = n(), a = wt(), c = zn(i), d = {
        ...Qt("completed", a),
        elapsedSeconds: c || Math.max(0, Number(i.elapsedSeconds) || 0),
        audioPlaying: !1,
        startedAt: i.startedAt || new Date(a).toISOString(),
        timerAnchorAtMs: null,
        timerPausedAtMs: a,
        timerDurationSeconds: c
      };
      e(d), Fn({ ...i, ...d });
    },
    tickTimer() {
      const i = n();
      if (i.view !== "session" || Zt(i) !== "running") return;
      const a = wt(), c = zn(i), d = c ? Math.min(c, Pa(i, a)) : Pa(i, a), p = c > 0 && d >= c ? "completed" : "running", h = {
        ...Qt(p, a),
        elapsedSeconds: d,
        timerAnchorAtMs: p === "running" ? i.timerAnchorAtMs : null,
        timerPausedAtMs: p === "running" ? null : a,
        timerDurationSeconds: c,
        audioPlaying: p === "running" ? i.audioPlaying : !1
      };
      d === i.elapsedSeconds && p === Zt(i) || (e(h), Fn({ ...i, ...h }));
    },
    setTimerMode(i = "countdown") {
      const a = i === "countup" ? "countup" : "countdown", c = {
        timerMode: a,
        timerDurationSeconds: a === "countup" ? 0 : io(n())
      };
      e(c), Fn({ ...n(), ...c });
    },
    startBreak() {
      const i = wt(), a = {
        ...Qt("break", i),
        timerRestoreTarget: null,
        timerAnchorAtMs: null,
        timerPausedAtMs: i,
        timerDurationSeconds: 0,
        audioPlaying: !1
      };
      e(a), Fn({ ...n(), ...a });
    },
    getTimerState() {
      return Zt(n());
    },
    endSession() {
      var S;
      const i = n(), a = wt(), c = new Date(a).toISOString(), d = Zt(i) === "running" ? Vy(i, a) : i, p = zn(d), h = p ? Math.min(p, d.elapsedSeconds) : d.elapsedSeconds, g = fC({
        sessionId: (S = i.currentSession) == null ? void 0 : S.sessionId,
        materialId: "focus-room",
        materialTitle: "Focus Room",
        studyGoal: i.studyGoal,
        selectedScene: i.selectedScene,
        musicType: i.musicType,
        ambientSound: i.ambientSound,
        musicVolume: i.musicVolume,
        ambientVolume: i.ambientVolume,
        pomodoroDuration: i.pomodoroDuration,
        startedAt: i.startedAt || c,
        endedAt: c,
        totalFocusTime: h,
        flashcardsCompleted: 0,
        quizScore: null,
        mistakesMade: [],
        completedTasks: [],
        recommendedNextStep: "Start another protected focus block when you are ready."
      });
      c0("focus-room"), e({
        summaryRecord: g,
        sessionHistory: Uc(),
        ...Qt("completed", a),
        audioPlaying: !1,
        timerAnchorAtMs: null,
        timerPausedAtMs: a,
        timerDurationSeconds: p,
        elapsedSeconds: p ? Math.min(p, d.elapsedSeconds) : d.elapsedSeconds,
        currentSession: null
      });
    },
    closeSummary() {
      e({ summaryRecord: null });
    },
    setWorkspaceNotes(i) {
      e((a) => {
        const c = {
          workspaceNotes: String(i ?? ""),
          workspaceUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        return jn({ ...a, ...c }), c;
      });
    },
    setAssistantContext(i = {}) {
      e({ assistantContext: Qc(i) });
    },
    toggleTask(i) {
      e((a) => {
        const c = a.studyPlan[Number(i)];
        if (!c) return {};
        const d = String(c.task || ""), p = a.completedTasks.includes(d) ? a.completedTasks.filter((h) => h !== d) : [...a.completedTasks, d];
        return jn({ ...a, completedTasks: p }), { completedTasks: p };
      });
    },
    updatePlanTask(i, a = null, c = null) {
      e((d) => {
        const p = Number(i), h = d.studyPlan[p];
        if (!h) return {};
        const g = String(h.task || ""), S = c == null ? g : String(c || "").trim(), l = a == null ? h.minutes : yr(a, h.minutes, 1, Va), f = d.studyPlan.map((k, x) => x === p ? { minutes: l, task: S || g } : k);
        let v = d.completedTasks;
        g && g !== f[p].task && v.includes(g) && (v = v.filter((k) => k !== g).concat(f[p].task));
        const w = { studyPlan: f, completedTasks: v };
        return jn({ ...d, ...w }), w;
      });
    },
    setFlashcardIndex(i) {
      const a = Fy(n().selectedMaterial);
      e({
        flashcardIndex: yr(i, n().flashcardIndex, 0, Math.max(0, a.length - 1)),
        flashcardSide: "front"
      });
    },
    flipFlashcard() {
      e((i) => ({
        flashcardSide: i.flashcardSide === "back" ? "front" : "back"
      }));
    },
    rateFlashcard(i) {
      const a = n(), c = Fy(a.selectedMaterial);
      if (!c.length) return;
      const d = yr(a.flashcardIndex, 0, 0, c.length - 1), p = c[d], h = ["easy", "medium", "hard"].includes(String(i)) ? String(i) : "medium";
      e({
        flashcardProgress: {
          ...a.flashcardProgress,
          [vC(p, d)]: {
            difficulty: h,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: d < c.length - 1 ? d + 1 : d
      });
    },
    answerQuizQuestion(i, a) {
      const c = Number(i), d = Kc(n().selectedMaterial)[c];
      if (!d) return;
      const p = String(c);
      e((h) => ({
        quizAnswers: {
          ...h.quizAnswers,
          [p]: TC(d, a, h.quizAnswers[p])
        }
      }));
    },
    checkQuizQuestion(i) {
      const a = Kc(n().selectedMaterial), c = Number(i), d = a[c];
      if (!d) return;
      const p = String(c), h = n(), g = Object.prototype.hasOwnProperty.call(h.quizAnswers, p) ? h.quizAnswers[p] : "", S = kC(d, g), l = y0(d);
      e({
        quizChecked: {
          ...h.quizChecked,
          [p]: {
            answer: g,
            correct: S === null ? !1 : S,
            hasKnownAnswer: S !== null,
            explanation: d.explanation || d.rationale || (l ? `Correct answer: ${l}` : ""),
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
    },
    async askAssistant(i) {
      const a = String(i || "").trim();
      if (!a) return;
      const c = n(), d = c.selectedMaterial, p = ai(c.chatMessages).slice(-10).map((h) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text
      }));
      e({
        chatMessages: ai([
          ...c.chatMessages,
          { role: "user", text: a, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        ]),
        chatPending: !0,
        chatError: ""
      });
      try {
        const h = await BC(a, p, d, c.assistantContext);
        e((g) => ({
          chatMessages: ai([
            ...g.chatMessages,
            { role: "assistant", text: h.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: h.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (h) {
        e((g) => ({
          chatMessages: ai([
            ...g.chatMessages,
            { role: "assistant", text: g0(a, d, n().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${h.message || "request failed"}`
        }));
      } finally {
        e({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return OC(n());
    },
    focusQuizScore() {
      return LC(n());
    },
    focusQuizMistakes() {
      return VC(n());
    },
    formatFocusedTime() {
      return d0(n().elapsedSeconds);
    }
  };
});
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zC = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), $C = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (n, o, i) => i ? i.toUpperCase() : o.toLowerCase()
), By = (e) => {
  const n = $C(e);
  return n.charAt(0).toUpperCase() + n.slice(1);
}, S0 = (...e) => e.filter((n, o, i) => !!n && n.trim() !== "" && i.indexOf(n) === o).join(" ").trim(), UC = (e) => {
  for (const n in e)
    if (n.startsWith("aria-") || n === "role" || n === "title")
      return !0;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var HC = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const WC = C.forwardRef(
  ({
    color: e = "currentColor",
    size: n = 24,
    strokeWidth: o = 2,
    absoluteStrokeWidth: i,
    className: a = "",
    children: c,
    iconNode: d,
    ...p
  }, h) => C.createElement(
    "svg",
    {
      ref: h,
      ...HC,
      width: n,
      height: n,
      stroke: e,
      strokeWidth: i ? Number(o) * 24 / Number(n) : o,
      className: S0("lucide", a),
      ...!c && !UC(p) && { "aria-hidden": "true" },
      ...p
    },
    [
      ...d.map(([g, S]) => C.createElement(g, S)),
      ...Array.isArray(c) ? c : [c]
    ]
  )
);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ue = (e, n) => {
  const o = C.forwardRef(
    ({ className: i, ...a }, c) => C.createElement(WC, {
      ref: c,
      iconNode: n,
      className: S0(
        `lucide-${zC(By(e))}`,
        `lucide-${e}`,
        i
      ),
      ...a
    })
  );
  return o.displayName = By(e), o;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const GC = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], w0 = Ue("check", GC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const KC = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]], YC = Ue("chevron-down", KC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const QC = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]], XC = Ue("chevron-up", QC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ZC = [
  ["rect", { width: "12", height: "12", x: "2", y: "10", rx: "2", ry: "2", key: "6agr2n" }],
  [
    "path",
    { d: "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6", key: "1o487t" }
  ],
  ["path", { d: "M6 18h.01", key: "uhywen" }],
  ["path", { d: "M10 14h.01", key: "ssrbsk" }],
  ["path", { d: "M15 6h.01", key: "cblpky" }],
  ["path", { d: "M18 9h.01", key: "2061c0" }]
], JC = Ue("dices", ZC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qC = [
  ["path", { d: "M11 20H2", key: "nlcfvz" }],
  [
    "path",
    {
      d: "M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z",
      key: "au4z13"
    }
  ],
  ["path", { d: "M11 4H8a2 2 0 0 0-2 2v14", key: "74r1mk" }],
  ["path", { d: "M14 12h.01", key: "1jfl7z" }],
  ["path", { d: "M22 20h-3", key: "vhrsz" }]
], eP = Ue("door-open", qC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tP = [
  [
    "path",
    {
      d: "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",
      key: "1dudjm"
    }
  ],
  [
    "path",
    {
      d: "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",
      key: "l2t8xc"
    }
  ],
  ["path", { d: "M16 17h4", key: "1dejxt" }],
  ["path", { d: "M4 13h4", key: "1bwh8b" }]
], Ea = Ue("footprints", tP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nP = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
], rP = Ue("minimize-2", nP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const oP = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], zy = Ue("pause", oP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const iP = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], sP = Ue("play", iP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const aP = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], lP = Ue("rotate-ccw", aP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uP = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
], x0 = Ue("save", uP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cP = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
], _0 = Ue("settings-2", cP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dP = [
  ["path", { d: "m18 14 4 4-4 4", key: "10pe0f" }],
  ["path", { d: "m18 2 4 4-4 4", key: "pucp1d" }],
  ["path", { d: "M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22", key: "1ailkh" }],
  ["path", { d: "M2 6h1.972a4 4 0 0 1 3.6 2.2", key: "km57vx" }],
  ["path", { d: "M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45", key: "os18l9" }]
], fP = Ue("shuffle", dP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pP = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], mP = Ue("skip-forward", pP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hP = [
  ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
  ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
  ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
  ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
  ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
  ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
  ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
  ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
  ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }]
], yP = Ue("sliders-horizontal", hP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gP = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
], ba = Ue("users", gP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vP = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], za = Ue("volume-2", vP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const SP = [
  [
    "path",
    {
      d: "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "knzxuh"
    }
  ],
  [
    "path",
    {
      d: "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "2jd2cc"
    }
  ],
  [
    "path",
    {
      d: "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "rd2r6e"
    }
  ]
], T0 = Ue("waves", SP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wP = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], k0 = Ue("x", wP), Ma = {
  minutes: Math.floor(f0 / 60),
  seconds: 59
}, xP = {
  minutes: 3,
  seconds: 2
};
function $a(e) {
  const n = kr(e, $d);
  return {
    minutes: Math.floor(n / 60),
    seconds: n % 60
  };
}
function Ra(e, n) {
  const o = Math.max(0, Math.floor(Number(e) || 0)), i = Math.max(0, Math.floor(Number(n) || 0));
  return kr(o * 60 + i, $d);
}
function Xc(e, n) {
  return String(Math.max(0, Math.floor(Number(e) || 0))).padStart(2, "0");
}
function Kd(e) {
  const { minutes: n, seconds: o } = $a(e);
  return `${Xc(n, "minutes")}:${Xc(o, "seconds")}`;
}
function _P(e, n, o = 1) {
  const i = $a(e), a = Math.trunc(Number(o) || 0);
  if (n === "seconds") {
    const d = Math.min(Ma.seconds, Math.max(0, i.seconds + a));
    return Ra(i.minutes, d);
  }
  const c = Math.min(Ma.minutes, Math.max(0, i.minutes + a));
  return Ra(c, i.seconds);
}
function TP(e, n, o) {
  const i = xP[o] || 2;
  return `${String(e || "").replace(/\D/g, "")}${String(n).replace(/\D/g, "")}`.slice(-i) || "";
}
function kP(e, n) {
  const o = Number(String(e || "").replace(/\D/g, "")) || 0;
  return Math.min(Ma[n], o);
}
function AP(e, n, o) {
  const i = $a(e), a = kP(o, n);
  return n === "seconds" ? Ra(i.minutes, a) : Ra(a, i.seconds);
}
const CP = { minutes: "Minutes", seconds: "Seconds" };
function $y({
  segment: e,
  value: n,
  disabled: o,
  active: i,
  size: a,
  onFocusSegment: c,
  onStep: d,
  onType: p,
  onCommit: h,
  segmentRef: g
}) {
  const S = CP[e], l = (f) => {
    if (o) return;
    const { key: v } = f;
    if (v >= "0" && v <= "9") {
      f.preventDefault(), p(e, v);
      return;
    }
    if (v === "ArrowUp") {
      f.preventDefault(), d(e, 1);
      return;
    }
    if (v === "ArrowDown") {
      f.preventDefault(), d(e, -1);
      return;
    }
    if (v === "PageUp") {
      f.preventDefault(), d(e, 5);
      return;
    }
    if (v === "PageDown") {
      f.preventDefault(), d(e, -5);
      return;
    }
    (v === "Backspace" || v === "Delete") && (f.preventDefault(), h());
  };
  return /* @__PURE__ */ T.jsxs("span", { className: `timer-editor-segment${i ? " is-active" : ""}`, children: [
    /* @__PURE__ */ T.jsx(
      "button",
      {
        type: "button",
        className: "timer-editor-step timer-editor-step-up",
        tabIndex: -1,
        "aria-label": `Increase ${S.toLowerCase()}`,
        disabled: o,
        onClick: () => d(e, 1),
        children: /* @__PURE__ */ T.jsx(XC, { size: a === "hero" ? 20 : 14, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ T.jsx(
      "span",
      {
        ref: g,
        className: "timer-editor-digits",
        role: "spinbutton",
        tabIndex: o ? -1 : 0,
        "aria-label": S,
        "aria-valuemin": 0,
        "aria-valuemax": Ma[e],
        "aria-valuenow": n,
        "aria-valuetext": `${n} ${S.toLowerCase()}`,
        "aria-disabled": o || void 0,
        onFocus: () => c(e),
        onKeyDown: l,
        children: Xc(n, e)
      }
    ),
    /* @__PURE__ */ T.jsx(
      "button",
      {
        type: "button",
        className: "timer-editor-step timer-editor-step-down",
        tabIndex: -1,
        "aria-label": `Decrease ${S.toLowerCase()}`,
        disabled: o,
        onClick: () => d(e, -1),
        children: /* @__PURE__ */ T.jsx(YC, { size: a === "hero" ? 20 : 14, "aria-hidden": "true" })
      }
    )
  ] });
}
function A0({
  valueSeconds: e,
  onChange: n,
  disabled: o = !1,
  size: i = "hero",
  ariaLabel: a = "Set focus block length",
  className: c = ""
}) {
  const { minutes: d, seconds: p } = $a(e), [h, g] = C.useState(null), S = C.useRef(""), l = C.useRef(null), f = C.useRef(null), v = C.useRef(null), w = (N) => N === "minutes" ? l : f, k = C.useCallback(() => {
    S.current = "";
  }, []), x = C.useCallback((N) => {
    S.current = "", g(N);
  }, []), A = C.useCallback(
    (N, O) => {
      var U;
      o || (S.current = "", g(N), n == null || n(_P(e, N, O)), (U = w(N).current) == null || U.focus());
    },
    [o, n, e]
  ), E = C.useCallback(
    (N, O) => {
      if (o) return;
      const U = TP(S.current, O, N);
      S.current = U, g(N), n == null || n(AP(e, N, U));
    },
    [o, n, e]
  );
  C.useEffect(() => {
    if (o) return;
    const O = [
      [l.current, "minutes"],
      [f.current, "seconds"]
    ].filter(([U]) => U).map(([U, K]) => {
      const G = (L) => {
        L.preventDefault(), A(K, L.deltaY < 0 ? 1 : -1);
      };
      return U.addEventListener("wheel", G, { passive: !1 }), [U, G];
    });
    return () => {
      O.forEach(([U, K]) => U.removeEventListener("wheel", K));
    };
  }, [o, A]);
  const R = (N) => {
    var O;
    (O = v.current) != null && O.contains(N.relatedTarget) || (k(), g(null));
  };
  return /* @__PURE__ */ T.jsxs(
    "div",
    {
      ref: v,
      className: `timer-editor timer-editor-${i}${o ? " is-readonly" : ""} ${c}`.trim(),
      role: "group",
      "aria-label": a,
      onBlur: R,
      children: [
        o ? /* @__PURE__ */ T.jsx("span", { className: "timer-editor-static", "aria-hidden": "true", children: Kd(e) }) : /* @__PURE__ */ T.jsxs(T.Fragment, { children: [
          /* @__PURE__ */ T.jsx(
            $y,
            {
              segment: "minutes",
              value: d,
              disabled: o,
              active: h === "minutes",
              size: i,
              segmentRef: l,
              onFocusSegment: x,
              onStep: A,
              onType: E,
              onCommit: k
            }
          ),
          /* @__PURE__ */ T.jsx("span", { className: "timer-editor-colon", "aria-hidden": "true", children: ":" }),
          /* @__PURE__ */ T.jsx(
            $y,
            {
              segment: "seconds",
              value: p,
              disabled: o,
              active: h === "seconds",
              size: i,
              segmentRef: f,
              onFocusSegment: x,
              onStep: A,
              onType: E,
              onCommit: k
            }
          )
        ] }),
        !o && /* @__PURE__ */ T.jsx("span", { className: "sr-only", children: "Editable focus timer. Click minutes or seconds, then type a number or use the arrow keys to adjust." })
      ]
    }
  );
}
function PP(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function EP() {
  const e = Q((E) => E.elapsedSeconds), n = Q((E) => E.pomodoroDuration), o = Q((E) => E.pomodoroDurationSeconds), i = Q((E) => E.timerStatus), a = Q((E) => E.timerMode), c = Q((E) => E.isIdle), d = Q((E) => E.currentSession), p = Q((E) => E.setPomodoroDurationSeconds), h = i === "studying", g = i === "paused", S = i === "completed", l = i === "idle" && a !== "countup", f = Number(o) || (Number(n) || 0) * 60, v = a === "countup" ? e : Math.max(0, f - e), w = S && a !== "countup" ? 0 : v, k = g ? "Paused" : S ? "Complete" : h ? "In focus" : "Ready", x = c ? 0.97 : 1, A = h ? { scale: [x, x + 0.01, x], opacity: 1 } : { scale: x, opacity: 1 };
  return /* @__PURE__ */ T.jsxs(
    Kn.article,
    {
      className: "timer-card floating-pomodoro liquid-glass",
      animate: A,
      transition: h ? { duration: 4, repeat: 1 / 0, ease: "easeInOut" } : { duration: 0.25 },
      "aria-label": "Focus timer",
      children: [
        /* @__PURE__ */ T.jsx("div", { className: "floating-pomodoro-top", children: /* @__PURE__ */ T.jsxs("span", { className: "dock-eyebrow", children: [
          "POMODORO #",
          (d == null ? void 0 : d.pomodoroNumber) || 1
        ] }) }),
        /* @__PURE__ */ T.jsxs("div", { className: "dock-status floating-pomodoro-status", children: [
          /* @__PURE__ */ T.jsx("span", { className: `dock-status-dot ${g || !h ? "is-paused" : ""}` }),
          k
        ] }),
        l ? /* @__PURE__ */ T.jsx(
          A0,
          {
            className: "floating-pomodoro-editor",
            valueSeconds: f,
            onChange: p,
            size: "float",
            ariaLabel: "Set focus block length"
          }
        ) : /* @__PURE__ */ T.jsx("strong", { className: "floating-pomodoro-time", "aria-live": "polite", children: ka(w) }),
        /* @__PURE__ */ T.jsx("div", { className: "floating-pomodoro-progress", "aria-hidden": "true", children: /* @__PURE__ */ T.jsx("span", { style: { width: `${PP(e, f)}%` } }) })
      ]
    }
  );
}
function bP() {
  return /* @__PURE__ */ T.jsx(EP, {});
}
function be({
  children: e,
  className: n = "",
  variant: o = "ghost",
  type: i = "button",
  ...a
}) {
  const { onPointerMove: c, onPointerLeave: d, ...p } = a;
  return /* @__PURE__ */ T.jsx(
    "button",
    {
      className: `glass-button glass-button-${o} ${n}`.trim(),
      type: i,
      onPointerMove: (h) => {
        const g = h.currentTarget.getBoundingClientRect();
        h.currentTarget.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, (h.clientX - g.left) / g.width * 100))}%`), h.currentTarget.style.setProperty("--glass-y", `${Math.max(0, Math.min(100, (h.clientY - g.top) / g.height * 100))}%`), c == null || c(h);
      },
      onPointerLeave: (h) => {
        h.currentTarget.style.setProperty("--glass-x", "50%"), h.currentTarget.style.setProperty("--glass-y", "0%"), d == null || d(h);
      },
      ...p,
      children: e
    }
  );
}
function MP({ onWorkspace: e, onOpenTrail: n, onOpenCompanion: o, onOpenSettings: i, onExit: a }) {
  const c = Q((p) => p.selectedScene), d = _r(c);
  return /* @__PURE__ */ T.jsxs("header", { className: "focus-room-header", children: [
    /* @__PURE__ */ T.jsxs("button", { type: "button", className: "focus-wordmark", onClick: e, "aria-label": "Return to Synapse workspace", children: [
      /* @__PURE__ */ T.jsx("span", { className: "focus-wordmark-mark", children: "S" }),
      /* @__PURE__ */ T.jsx("span", { children: "synapse" })
    ] }),
    /* @__PURE__ */ T.jsxs("div", { className: "focus-room-context", "aria-label": "Current focus context", children: [
      /* @__PURE__ */ T.jsx("span", { children: d.name }),
      /* @__PURE__ */ T.jsx("small", { children: "Quiet study room" })
    ] }),
    /* @__PURE__ */ T.jsxs("nav", { className: "focus-room-header-actions", "aria-label": "Focus Room controls", children: [
      /* @__PURE__ */ T.jsxs(be, { className: "header-icon-button", onClick: n, title: "Open Focus Trail", "aria-label": "Open Focus Trail", children: [
        /* @__PURE__ */ T.jsx(Ea, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Focus Trail" })
      ] }),
      /* @__PURE__ */ T.jsxs(be, { className: "header-icon-button", onClick: o, title: "Open Companion Room", "aria-label": "Open Companion Room", children: [
        /* @__PURE__ */ T.jsx(ba, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Companion" })
      ] }),
      /* @__PURE__ */ T.jsxs(be, { className: "header-icon-button", onClick: i, title: "Open room settings", "aria-label": "Open room settings", children: [
        /* @__PURE__ */ T.jsx(_0, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Settings" })
      ] }),
      /* @__PURE__ */ T.jsxs(be, { className: "header-icon-button header-exit-button", onClick: a, title: "Exit Focus Room", "aria-label": "Exit Focus Room", children: [
        /* @__PURE__ */ T.jsx(eP, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Exit" })
      ] })
    ] })
  ] });
}
function RP(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function DP({ onFocusMode: e, audioState: n }) {
  const o = Q((L) => L.timerStatus), i = Q((L) => L.elapsedSeconds), a = Q((L) => L.pomodoroDuration), c = Q((L) => L.pomodoroDurationSeconds), d = Q((L) => L.timerMode), p = Q((L) => L.studyGoal), h = Q((L) => L.currentSession), g = Q((L) => L.startTimer), S = Q((L) => L.pauseTimer), l = Q((L) => L.resetTimer), f = Q((L) => L.skipTimer), v = Q((L) => L.toggleAudio), w = Q((L) => L.audioPlaying), k = Q((L) => L.setPomodoroDurationSeconds), x = Number(c) || (Number(a) || 0) * 60, A = d === "countup" ? i : Math.max(0, x - i), E = o === "paused", R = o === "studying", N = o === "completed", O = o === "idle" && d !== "countup", U = N && d !== "countup" ? "00:00" : ka(A), K = E ? "Paused" : N ? "Complete" : R ? "In focus" : "Ready", G = E ? "Resume timer" : R ? "Pause timer" : "Start timer";
  return /* @__PURE__ */ T.jsxs("div", { className: "focus-session-dock liquid-glass", "aria-label": "Focus session controls", children: [
    /* @__PURE__ */ T.jsxs("div", { className: "dock-timer-block", children: [
      /* @__PURE__ */ T.jsxs("div", { className: "dock-eyebrow", children: [
        "POMODORO #",
        (h == null ? void 0 : h.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ T.jsxs("div", { className: "dock-status", children: [
        /* @__PURE__ */ T.jsx("span", { className: `dock-status-dot ${E || !R ? "is-paused" : ""}` }),
        K
      ] }),
      O ? /* @__PURE__ */ T.jsx(
        A0,
        {
          className: "dock-time-editor",
          valueSeconds: x,
          onChange: k,
          size: "dock",
          ariaLabel: "Set focus block length"
        }
      ) : /* @__PURE__ */ T.jsx("strong", { className: "dock-time", "aria-live": "off", children: U }),
      /* @__PURE__ */ T.jsx("div", { className: "dock-progress", "aria-hidden": "true", children: /* @__PURE__ */ T.jsx("span", { style: { width: `${RP(i, x)}%` } }) })
    ] }),
    /* @__PURE__ */ T.jsxs("div", { className: "dock-goal-block", children: [
      /* @__PURE__ */ T.jsx("span", { className: "dock-eyebrow", children: "TODAY'S GOAL" }),
      /* @__PURE__ */ T.jsx("strong", { children: p || "A quiet block for meaningful progress" }),
      /* @__PURE__ */ T.jsxs("span", { className: "dock-goal-meta", children: [
        d === "countup" ? "Count-up" : `${Kd(x)} block`,
        " · ",
        ka(i),
        " focused"
      ] })
    ] }),
    /* @__PURE__ */ T.jsxs("div", { className: "dock-action-block", children: [
      /* @__PURE__ */ T.jsxs(be, { className: "dock-action-button", onClick: v, "aria-label": w ? "Pause room audio" : "Play room audio", children: [
        w ? /* @__PURE__ */ T.jsx(zy, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ T.jsx(za, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: n != null && n.playing ? "Pause audio" : "Audio" })
      ] }),
      /* @__PURE__ */ T.jsxs(be, { className: "dock-action-button", onClick: () => R ? S() : g(), variant: "primary", "aria-label": G, children: [
        R ? /* @__PURE__ */ T.jsx(zy, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ T.jsx(sP, { size: 15, fill: "currentColor", "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: E ? "Resume" : R ? "Pause" : "Start" })
      ] }),
      /* @__PURE__ */ T.jsxs(be, { className: "dock-action-button", onClick: f, "aria-label": "Skip timer", children: [
        /* @__PURE__ */ T.jsx(mP, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Skip" })
      ] }),
      /* @__PURE__ */ T.jsxs(be, { className: "dock-action-button", onClick: l, "aria-label": "Reset timer", children: [
        /* @__PURE__ */ T.jsx(lP, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Reset" })
      ] }),
      /* @__PURE__ */ T.jsxs(be, { className: "dock-focus-mode", onClick: e, "aria-label": "Enter distraction-free Focus Mode", children: [
        /* @__PURE__ */ T.jsx(yP, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Focus Mode" })
      ] })
    ] })
  ] });
}
var NP = Object.defineProperty, ho = (e, n) => NP(e, "name", { value: n, configurable: !0 }), C0 = !!(typeof window < "u" && window.document && window.document.createElement);
function Sr(e, n, { checkForDefaultPrevented: o = !0 } = {}) {
  return /* @__PURE__ */ ho(function(a) {
    if (e == null || e(a), o === !1 || !a || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  }, "handleEvent");
}
ho(Sr, "composeEventHandlers");
function IP(e) {
  var n;
  if (!C0)
    throw new Error("Cannot access window outside of the DOM");
  return ((n = e == null ? void 0 : e.ownerDocument) == null ? void 0 : n.defaultView) ?? window;
}
ho(IP, "getOwnerWindow");
function Zc(e) {
  if (!C0)
    throw new Error("Cannot access document outside of the DOM");
  return (e == null ? void 0 : e.ownerDocument) ?? document;
}
ho(Zc, "getOwnerDocument");
function P0(e, n = !1) {
  const { activeElement: o } = Zc(e);
  if (!(o != null && o.nodeName))
    return null;
  if (E0(o) && o.contentDocument)
    return P0(o.contentDocument.body, n);
  if (n) {
    const i = o.getAttribute("aria-activedescendant");
    if (i) {
      const a = Zc(o).getElementById(i);
      if (a)
        return a;
    }
  }
  return o;
}
ho(P0, "getActiveElement");
function E0(e) {
  return e.tagName === "IFRAME";
}
ho(E0, "isFrame");
function Uy(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function jP(...e) {
  return (n) => {
    let o = !1;
    const i = e.map((a) => {
      const c = Uy(a, n);
      return !o && typeof c == "function" && (o = !0), c;
    });
    if (o)
      return () => {
        for (let a = 0; a < i.length; a++) {
          const c = i[a];
          typeof c == "function" ? c() : Uy(e[a], null);
        }
      };
  };
}
function xt(...e) {
  return C.useCallback(jP(...e), e);
}
function FP(e, n = []) {
  let o = [];
  function i(c, d) {
    const p = C.createContext(d);
    p.displayName = c + "Context";
    const h = o.length;
    o = [...o, d];
    const g = (l) => {
      var A;
      const { scope: f, children: v, ...w } = l, k = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[h]) || p, x = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ T.jsx(k.Provider, { value: x, children: v });
    };
    g.displayName = c + "Provider";
    function S(l, f, v = {}) {
      var A;
      const { optional: w = !1 } = v, k = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[h]) || p, x = C.useContext(k);
      if (x) return x;
      if (d !== void 0) return d;
      if (!w)
        throw new Error(`\`${l}\` must be used within \`${c}\``);
    }
    return [g, S];
  }
  const a = () => {
    const c = o.map((d) => C.createContext(d));
    return function(p) {
      const h = (p == null ? void 0 : p[e]) || c;
      return C.useMemo(
        () => ({ [`__scope${e}`]: { ...p, [e]: h } }),
        [p, h]
      );
    };
  };
  return a.scopeName = e, [i, OP(a, ...n)];
}
function OP(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const o = () => {
    const i = e.map((a) => ({
      useScope: a(),
      scopeName: a.scopeName
    }));
    return function(c) {
      const d = i.reduce((p, { useScope: h, scopeName: g }) => {
        const l = h(c)[`__scope${g}`];
        return { ...p, ...l };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return o.scopeName = n.scopeName, o;
}
var tn = globalThis != null && globalThis.document ? C.useLayoutEffect : () => {
}, LP = Tr[" useId ".trim().toString()] || (() => {
}), VP = 0;
function sc(e) {
  const [n, o] = C.useState(LP());
  return tn(() => {
    o((i) => i ?? String(VP++));
  }, [e]), e || (n ? `radix-${n}` : "");
}
var Hy = Tr[" useEffectEvent ".trim().toString()], Wy = Tr[" useInsertionEffect ".trim().toString()];
function BP(e) {
  if (typeof Hy == "function")
    return Hy(e);
  const n = C.useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  return typeof Wy == "function" ? Wy(() => {
    n.current = e;
  }) : tn(() => {
    n.current = e;
  }), C.useMemo(() => ((...o) => {
    var i;
    return (i = n.current) == null ? void 0 : i.call(n, ...o);
  }), []);
}
var zP = Object.defineProperty, Ci = (e, n) => zP(e, "name", { value: n, configurable: !0 }), $P = Tr[" useInsertionEffect ".trim().toString()] || tn;
function b0({
  prop: e,
  defaultProp: n,
  onChange: o = /* @__PURE__ */ Ci(() => {
  }, "onChange"),
  caller: i
}) {
  const [a, c, d] = M0({
    defaultProp: n,
    onChange: o
  }), p = e !== void 0, h = p ? e : a, g = C.useCallback(
    (S) => {
      var l;
      if (p) {
        const f = R0(S) ? S(e) : S;
        f !== e && ((l = d.current) == null || l.call(d, f));
      } else
        c(S);
    },
    [p, e, c, d]
  );
  return [h, g];
}
Ci(b0, "useControllableState");
function M0({
  defaultProp: e,
  onChange: n
}) {
  const [o, i] = C.useState(e), a = C.useRef(o), c = C.useRef(n);
  return $P(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== o && ((d = c.current) == null || d.call(c, o), a.current = o);
  }, [o, a]), [o, i, c];
}
Ci(M0, "useUncontrolledState");
function R0(e) {
  return typeof e == "function";
}
Ci(R0, "isFunction");
var Gy = Symbol("RADIX:SYNC_STATE");
function UP(e, n, o, i) {
  const { prop: a, defaultProp: c, onChange: d, caller: p } = n, h = a !== void 0, g = BP(d), S = [{ ...o, state: c }];
  i && S.push(i);
  const [l, f] = C.useReducer(
    (x, A) => {
      if (A.type === Gy)
        return { ...x, state: A.state };
      const E = e(x, A);
      return h && !Object.is(E.state, x.state) && g(E.state), E;
    },
    ...S
  ), v = l.state, w = C.useRef(v);
  C.useEffect(() => {
    w.current !== v && (w.current = v, h || g(v));
  }, [v, w, h]);
  const k = C.useMemo(() => a !== void 0 ? { ...l, state: a } : l, [l, a]);
  return C.useEffect(() => {
    h && !Object.is(a, l.state) && f({ type: Gy, state: a });
  }, [a, l.state, h]), [k, f];
}
Ci(UP, "useControllableStateReducer");
var D0 = mg();
// @__NO_SIDE_EFFECTS__
function N0(e) {
  const n = C.forwardRef((o, i) => {
    let { children: a, ...c } = o, d = null, p = !1;
    const h = [];
    Ky(a) && typeof Ks == "function" && (a = Ks(a._payload)), C.Children.forEach(a, (f) => {
      var v;
      if (YP(f)) {
        p = !0;
        const w = f;
        let k = "child" in w.props ? w.props.child : w.props.children;
        Ky(k) && typeof Ks == "function" && (k = Ks(k._payload)), d = WP(w, k), h.push((v = d == null ? void 0 : d.props) == null ? void 0 : v.children);
      } else
        h.push(f);
    }), d ? d = C.cloneElement(d, void 0, h) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !p && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const g = d ? KP(d) : void 0, S = xt(i, g);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          p ? JP(e) : ZP(e)
        );
      return a;
    }
    const l = GP(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = i ? S : g), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var HP = Symbol.for("radix.slottable"), WP = (e, n) => {
  if ("child" in e.props) {
    const o = e.props.child;
    return C.isValidElement(o) ? C.cloneElement(o, void 0, e.props.children(o.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function GP(e, n) {
  const o = { ...n };
  for (const i in n) {
    const a = e[i], c = n[i];
    /^on[A-Z]/.test(i) ? a && c ? o[i] = (...p) => {
      const h = c(...p);
      return a(...p), h;
    } : a && (o[i] = a) : i === "style" ? o[i] = { ...a, ...c } : i === "className" && (o[i] = [a, c].filter(Boolean).join(" "));
  }
  return { ...e, ...o };
}
function KP(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
function YP(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === HP;
}
var QP = Symbol.for("react.lazy");
function Ky(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === QP && "_payload" in e && XP(e._payload);
}
function XP(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var ZP = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, JP = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, Ks = Tr[" use ".trim().toString()], qP = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], yo = qP.reduce((e, n) => {
  const o = /* @__PURE__ */ N0(`Primitive.${n}`), i = C.forwardRef((a, c) => {
    const { asChild: d, ...p } = a, h = d ? o : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ T.jsx(h, { ...p, ref: c });
  });
  return i.displayName = `Primitive.${n}`, { ...e, [n]: i };
}, {});
function eE(e, n) {
  e && D0.flushSync(() => e.dispatchEvent(n));
}
function vi(e) {
  const n = C.useRef(e);
  return C.useEffect(() => {
    n.current = e;
  }), C.useMemo(() => ((...o) => {
    var i;
    return (i = n.current) == null ? void 0 : i.call(n, ...o);
  }), []);
}
var tE = Object.defineProperty, Ye = (e, n) => tE(e, "name", { value: n, configurable: !0 }), Jc = "dismissableLayer.update", nE = "dismissableLayer.pointerDownOutside", rE = "dismissableLayer.focusOutside", Yy, I0 = C.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
}), oE = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ Ye(function(n, o) {
    const {
      disableOutsidePointerEvents: i = !1,
      deferPointerDownOutside: a = !1,
      onEscapeKeyDown: c,
      onPointerDownOutside: d,
      onFocusOutside: p,
      onInteractOutside: h,
      onDismiss: g,
      ...S
    } = n, l = C.useContext(I0), [f, v] = C.useState(null), w = (f == null ? void 0 : f.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, k] = C.useState({}), x = xt(o, v), A = Array.from(l.layers), [E] = [
      ...l.layersWithOutsidePointerEventsDisabled
    ].slice(-1), R = E ? A.indexOf(E) : -1, N = f ? A.indexOf(f) : -1, O = l.layersWithOutsidePointerEventsDisabled.size > 0, U = N >= R, K = C.useRef(!1), G = F0(
      (q) => {
        d == null || d(q), h == null || h(q), q.defaultPrevented || g == null || g();
      },
      {
        ownerDocument: w,
        deferPointerDownOutside: a,
        isDeferredPointerDownOutsideRef: K,
        dismissableSurfaces: l.dismissableSurfaces,
        shouldHandlePointerDownOutside: C.useCallback(
          (q) => {
            if (!(q instanceof Node))
              return !1;
            const de = [...l.branches].some(
              (ue) => ue.contains(q)
            );
            return U && !de;
          },
          [l.branches, U]
        )
      }
    ), L = O0((q) => {
      if (a && K.current)
        return;
      const de = q.target;
      [...l.branches].some((_e) => _e.contains(de)) || (p == null || p(q), h == null || h(q), q.defaultPrevented || g == null || g());
    }, w), X = f ? N === A.length - 1 : !1, ae = vi((q) => {
      q.key === "Escape" && (c == null || c(q), !q.defaultPrevented && g && (q.preventDefault(), g()));
    });
    return C.useEffect(() => {
      if (X)
        return w.addEventListener("keydown", ae, { capture: !0 }), () => w.removeEventListener("keydown", ae, { capture: !0 });
    }, [w, X, ae]), C.useEffect(() => {
      if (f)
        return i && (l.layersWithOutsidePointerEventsDisabled.size === 0 && (Yy = w.body.style.pointerEvents, w.body.style.pointerEvents = "none"), l.layersWithOutsidePointerEventsDisabled.add(f)), l.layers.add(f), qc(), () => {
          i && (l.layersWithOutsidePointerEventsDisabled.delete(f), l.layersWithOutsidePointerEventsDisabled.size === 0 && (w.body.style.pointerEvents = Yy));
        };
    }, [f, w, i, l]), C.useEffect(() => () => {
      f && (l.layers.delete(f), l.layersWithOutsidePointerEventsDisabled.delete(f), qc());
    }, [f, l]), C.useEffect(() => {
      const q = /* @__PURE__ */ Ye(() => k({}), "handleUpdate");
      return document.addEventListener(Jc, q), () => document.removeEventListener(Jc, q);
    }, []), /* @__PURE__ */ T.jsx(
      yo.div,
      {
        ...S,
        ref: x,
        style: {
          pointerEvents: O ? U ? "auto" : "none" : void 0,
          ...n.style
        },
        onFocusCapture: Sr(n.onFocusCapture, L.onFocusCapture),
        onBlurCapture: Sr(n.onBlurCapture, L.onBlurCapture),
        onPointerDownCapture: Sr(
          n.onPointerDownCapture,
          G.onPointerDownCapture
        )
      }
    );
  }, "DismissableLayer")
);
function j0() {
  const e = C.useContext(I0), [n, o] = C.useState(null);
  return C.useEffect(() => {
    if (n)
      return e.dismissableSurfaces.add(n), () => {
        e.dismissableSurfaces.delete(n);
      };
  }, [n, e.dismissableSurfaces]), o;
}
Ye(j0, "useDismissableLayerSurface");
var iE = /* @__PURE__ */ Ye(() => !0, "IS_TRUE");
function F0(e, n) {
  const {
    ownerDocument: o = globalThis == null ? void 0 : globalThis.document,
    deferPointerDownOutside: i = !1,
    isDeferredPointerDownOutsideRef: a,
    dismissableSurfaces: c,
    shouldHandlePointerDownOutside: d = iE
  } = n, p = vi(e), h = C.useRef(!1), g = C.useRef(!1), S = C.useRef(/* @__PURE__ */ new Map()), l = C.useRef(() => {
  });
  return C.useEffect(() => {
    function f() {
      g.current = !1, a.current = !1, S.current.clear();
    }
    Ye(f, "resetOutsideInteraction");
    function v() {
      return Array.from(S.current.values()).some(Boolean);
    }
    Ye(v, "isOutsideInteractionIntercepted");
    function w(R) {
      if (!g.current)
        return;
      const N = R.target;
      N instanceof Node && [...c].some((U) => U.contains(N)) || S.current.set(R.type, !0), R.type === "click" && window.setTimeout(() => {
        g.current && l.current();
      }, 0);
    }
    Ye(w, "handleInteractionCapture");
    function k(R) {
      g.current && S.current.set(R.type, !1);
    }
    Ye(k, "handleInteractionBubble");
    const x = /* @__PURE__ */ Ye((R) => {
      if (R.target && !h.current) {
        let N = function() {
          o.removeEventListener("click", l.current);
          const U = v();
          f(), U || Yd(
            nE,
            p,
            O,
            { discrete: !0 }
          );
        };
        if (Ye(N, "handleAndDispatchPointerDownOutsideEvent"), !d(R.target)) {
          o.removeEventListener("click", l.current), f(), h.current = !1;
          return;
        }
        const O = { originalEvent: R };
        g.current = !0, a.current = i && R.button === 0, S.current.clear(), !i || R.button !== 0 ? N() : (o.removeEventListener("click", l.current), l.current = N, o.addEventListener("click", l.current, { once: !0 }));
      } else
        o.removeEventListener("click", l.current), f();
      h.current = !1;
    }, "handlePointerDown"), A = [
      "pointerup",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "click"
    ];
    for (const R of A)
      o.addEventListener(R, w, !0), o.addEventListener(R, k);
    const E = window.setTimeout(() => {
      o.addEventListener("pointerdown", x);
    }, 0);
    return () => {
      window.clearTimeout(E), o.removeEventListener("pointerdown", x), o.removeEventListener("click", l.current);
      for (const R of A)
        o.removeEventListener(R, w, !0), o.removeEventListener(R, k);
    };
  }, [
    o,
    p,
    i,
    a,
    c,
    d
  ]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: /* @__PURE__ */ Ye(() => h.current = !0, "onPointerDownCapture")
  };
}
Ye(F0, "usePointerDownOutside");
function O0(e, n = globalThis == null ? void 0 : globalThis.document) {
  const o = vi(e), i = C.useRef(!1);
  return C.useEffect(() => {
    const a = /* @__PURE__ */ Ye((c) => {
      c.target && !i.current && Yd(rE, o, { originalEvent: c }, {
        discrete: !1
      });
    }, "handleFocus");
    return n.addEventListener("focusin", a), () => n.removeEventListener("focusin", a);
  }, [n, o]), {
    onFocusCapture: /* @__PURE__ */ Ye(() => i.current = !0, "onFocusCapture"),
    onBlurCapture: /* @__PURE__ */ Ye(() => i.current = !1, "onBlurCapture")
  };
}
Ye(O0, "useFocusOutside");
function qc() {
  const e = new CustomEvent(Jc);
  document.dispatchEvent(e);
}
Ye(qc, "dispatchUpdate");
function Yd(e, n, o, { discrete: i }) {
  const a = o.originalEvent.target, c = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: o });
  n && a.addEventListener(e, n, { once: !0 }), i ? eE(a, c) : a.dispatchEvent(c);
}
Ye(Yd, "handleAndDispatchCustomEvent");
var sE = Object.defineProperty, at = (e, n) => sE(e, "name", { value: n, configurable: !0 }), ac = "focusScope.autoFocusOnMount", lc = "focusScope.autoFocusOnUnmount", Qy = { bubbles: !1, cancelable: !0 }, aE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ at(function(n, o) {
    const {
      loop: i = !1,
      trapped: a = !1,
      onMountAutoFocus: c,
      onUnmountAutoFocus: d,
      ...p
    } = n, [h, g] = C.useState(null), S = vi(c), l = vi(d), f = C.useRef(null), v = xt(o, g), w = C.useRef({
      paused: !1,
      pause() {
        this.paused = !0;
      },
      resume() {
        this.paused = !1;
      }
    }).current;
    C.useEffect(() => {
      if (a) {
        let x = function(N) {
          if (w.paused || !h) return;
          const O = N.target;
          h.contains(O) ? f.current = O : fn(f.current, { select: !0 });
        }, A = function(N) {
          if (w.paused || !h) return;
          const O = N.relatedTarget;
          O !== null && (h.contains(O) || fn(f.current, { select: !0 }));
        }, E = function(N) {
          if (document.activeElement === document.body)
            for (const U of N)
              U.removedNodes.length > 0 && fn(h);
        };
        at(x, "handleFocusIn"), at(A, "handleFocusOut"), at(E, "handleMutations"), document.addEventListener("focusin", x), document.addEventListener("focusout", A);
        const R = new MutationObserver(E);
        return h && R.observe(h, { childList: !0, subtree: !0 }), () => {
          document.removeEventListener("focusin", x), document.removeEventListener("focusout", A), R.disconnect();
        };
      }
    }, [a, h, w.paused]), C.useEffect(() => {
      if (h) {
        Xy.add(w);
        const x = document.activeElement;
        if (!h.contains(x)) {
          const E = new CustomEvent(ac, Qy);
          h.addEventListener(ac, S), h.dispatchEvent(E), E.defaultPrevented || (L0(U0(Qd(h)), { select: !0 }), document.activeElement === x && fn(h));
        }
        return () => {
          h.removeEventListener(ac, S), setTimeout(() => {
            const E = new CustomEvent(lc, Qy);
            h.addEventListener(lc, l), h.dispatchEvent(E), E.defaultPrevented || fn(x ?? document.body, { select: !0 }), h.removeEventListener(lc, l), Xy.remove(w);
          }, 0);
        };
      }
    }, [h, S, l, w]);
    const k = C.useCallback(
      (x) => {
        if (!i && !a || w.paused) return;
        const A = x.key === "Tab" && !x.altKey && !x.ctrlKey && !x.metaKey, E = document.activeElement;
        if (A && E) {
          const R = x.currentTarget, [N, O] = V0(R);
          N && O ? !x.shiftKey && E === O ? (x.preventDefault(), i && fn(N, { select: !0 })) : x.shiftKey && E === N && (x.preventDefault(), i && fn(O, { select: !0 })) : E === R && x.preventDefault();
        }
      },
      [i, a, w.paused]
    );
    return /* @__PURE__ */ T.jsx(yo.div, { tabIndex: -1, ...p, ref: v, onKeyDown: k });
  }, "FocusScope")
);
function L0(e, { select: n = !1 } = {}) {
  const o = document.activeElement;
  for (const i of e)
    if (fn(i, { select: n }), document.activeElement !== o) return;
}
at(L0, "focusFirst");
function V0(e) {
  const n = Qd(e), o = ed(n, e), i = ed(n.reverse(), e);
  return [o, i];
}
at(V0, "getTabbableEdges");
function Qd(e) {
  const n = [], o = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: /* @__PURE__ */ at((i) => {
      const a = i.tagName === "INPUT" && i.type === "hidden";
      return i.disabled || i.hidden || a ? NodeFilter.FILTER_SKIP : i.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }, "acceptNode")
  });
  for (; o.nextNode(); ) n.push(o.currentNode);
  return n;
}
at(Qd, "getTabbableCandidates");
function ed(e, n) {
  const o = typeof n.checkVisibility == "function" && n.checkVisibility({ checkVisibilityCSS: !0 });
  for (const i of e)
    if (!(o ? !i.checkVisibility({ checkVisibilityCSS: !0 }) : B0(i, { upTo: n })))
      return i;
}
at(ed, "findVisible");
function B0(e, { upTo: n }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (n !== void 0 && e === n) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
at(B0, "isHidden");
function z0(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
at(z0, "isSelectableInput");
function fn(e, { select: n = !1 } = {}) {
  if (e && e.focus) {
    const o = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== o && z0(e) && n && e.select();
  }
}
at(fn, "focus");
var Xy = $0();
function $0() {
  let e = [];
  return {
    add(n) {
      const o = e[0];
      n !== o && (o == null || o.pause()), e = td(e, n), e.unshift(n);
    },
    remove(n) {
      var o;
      e = td(e, n), (o = e[0]) == null || o.resume();
    }
  };
}
at($0, "createFocusScopesStack");
function td(e, n) {
  const o = [...e], i = o.indexOf(n);
  return i !== -1 && o.splice(i, 1), o;
}
at(td, "arrayRemove");
function U0(e) {
  return e.filter((n) => n.tagName !== "A");
}
at(U0, "removeLinks");
var lE = Object.defineProperty, uE = (e, n) => lE(e, "name", { value: n, configurable: !0 }), cE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ uE(function(n, o) {
    var h;
    const { container: i, ...a } = n, [c, d] = C.useState(!1);
    tn(() => d(!0), []);
    const p = i || c && ((h = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : h.body);
    return p ? D0.createPortal(/* @__PURE__ */ T.jsx(yo.div, { ...a, ref: o }), p) : null;
  }, "Portal")
), dE = Object.defineProperty, mn = (e, n) => dE(e, "name", { value: n, configurable: !0 });
function H0(e, n) {
  return C.useReducer((o, i) => n[o][i] ?? o, e);
}
mn(H0, "useStateMachine");
var Xd = /* @__PURE__ */ mn((e) => {
  const { present: n, children: o } = e, i = W0(n), a = typeof o == "function" ? o({ present: i.isPresent }) : C.Children.only(o), c = G0(i.ref, K0(a));
  return typeof o == "function" || i.isPresent ? C.cloneElement(a, { ref: c }) : null;
}, "Presence");
function W0(e) {
  const [n, o] = C.useState(), i = C.useRef(null), a = C.useRef(e), c = C.useRef("none"), d = C.useRef(void 0), p = e ? "mounted" : "unmounted", [h, g] = H0(p, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  return C.useEffect(() => {
    h === "mounted" ? (c.current = d.current ?? to(i.current), d.current = void 0) : c.current = "none";
  }, [h]), tn(() => {
    const S = i.current, l = a.current;
    if (l !== e) {
      const v = c.current, w = to(S);
      e ? (d.current = w, g("MOUNT")) : w === "none" || (S == null ? void 0 : S.display) === "none" ? g("UNMOUNT") : g(l && v !== w ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
    }
  }, [e, g]), tn(() => {
    if (n) {
      let S;
      const l = n.ownerDocument.defaultView ?? window, f = /* @__PURE__ */ mn((w) => {
        const x = to(i.current).includes(CSS.escape(w.animationName));
        if (w.target === n && x && (g("ANIMATION_END"), !a.current)) {
          const A = n.style.animationFillMode;
          n.style.animationFillMode = "forwards", S = l.setTimeout(() => {
            n.style.animationFillMode === "forwards" && (n.style.animationFillMode = A);
          });
        }
      }, "handleAnimationEnd"), v = /* @__PURE__ */ mn((w) => {
        w.target === n && (c.current = to(i.current));
      }, "handleAnimationStart");
      return n.addEventListener("animationstart", v), n.addEventListener("animationcancel", f), n.addEventListener("animationend", f), () => {
        l.clearTimeout(S), n.removeEventListener("animationstart", v), n.removeEventListener("animationcancel", f), n.removeEventListener("animationend", f);
      };
    } else
      g("ANIMATION_END");
  }, [n, g]), {
    isPresent: ["mounted", "unmountSuspended"].includes(h),
    ref: C.useCallback((S) => {
      if (S) {
        const l = getComputedStyle(S);
        i.current = l, d.current = to(l);
      } else
        i.current = null;
      o(S);
    }, [])
  };
}
mn(W0, "usePresence");
function nd(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
mn(nd, "setRef");
function G0(...e) {
  const n = C.useRef(e);
  return n.current = e, C.useCallback((o) => {
    const i = n.current;
    let a = !1;
    const c = i.map((d) => {
      const p = nd(d, o);
      return !a && typeof p == "function" && (a = !0), p;
    });
    if (a)
      return () => {
        for (let d = 0; d < c.length; d++) {
          const p = c[d];
          typeof p == "function" ? p() : nd(i[d], null);
        }
      };
  }, []);
}
mn(G0, "useStableComposedRefs");
function to(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
mn(to, "getAnimationName");
function K0(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
mn(K0, "getElementRef");
var Ys = 0, Kt = null;
function fE() {
  C.useEffect(() => {
    Kt || (Kt = { start: Zy(), end: Zy() });
    const { start: e, end: n } = Kt;
    return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== n && document.body.insertAdjacentElement("beforeend", n), Ys++, () => {
      Ys === 1 && (Kt == null || Kt.start.remove(), Kt == null || Kt.end.remove(), Kt = null), Ys = Math.max(0, Ys - 1);
    };
  }, []);
}
function Zy() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var Jt = function() {
  return Jt = Object.assign || function(n) {
    for (var o, i = 1, a = arguments.length; i < a; i++) {
      o = arguments[i];
      for (var c in o) Object.prototype.hasOwnProperty.call(o, c) && (n[c] = o[c]);
    }
    return n;
  }, Jt.apply(this, arguments);
};
function Y0(e, n) {
  var o = {};
  for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && n.indexOf(i) < 0 && (o[i] = e[i]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var a = 0, i = Object.getOwnPropertySymbols(e); a < i.length; a++)
      n.indexOf(i[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, i[a]) && (o[i[a]] = e[i[a]]);
  return o;
}
function pE(e, n, o) {
  if (o || arguments.length === 2) for (var i = 0, a = n.length, c; i < a; i++)
    (c || !(i in n)) && (c || (c = Array.prototype.slice.call(n, 0, i)), c[i] = n[i]);
  return e.concat(c || Array.prototype.slice.call(n));
}
var ca = "right-scroll-bar-position", da = "width-before-scroll-bar", mE = "with-scroll-bars-hidden", hE = "--removed-body-scroll-bar-size";
function uc(e, n) {
  return typeof e == "function" ? e(n) : e && (e.current = n), e;
}
function yE(e, n) {
  var o = C.useState(function() {
    return {
      // value
      value: e,
      // last callback
      callback: n,
      // "memoized" public interface
      facade: {
        get current() {
          return o.value;
        },
        set current(i) {
          var a = o.value;
          a !== i && (o.value = i, o.callback(i, a));
        }
      }
    };
  })[0];
  return o.callback = n, o.facade;
}
var gE = typeof window < "u" ? C.useLayoutEffect : C.useEffect, Jy = /* @__PURE__ */ new WeakMap();
function vE(e, n) {
  var o = yE(null, function(i) {
    return e.forEach(function(a) {
      return uc(a, i);
    });
  });
  return gE(function() {
    var i = Jy.get(o);
    if (i) {
      var a = new Set(i), c = new Set(e), d = o.current;
      a.forEach(function(p) {
        c.has(p) || uc(p, null);
      }), c.forEach(function(p) {
        a.has(p) || uc(p, d);
      });
    }
    Jy.set(o, e);
  }, [e]), o;
}
function SE(e) {
  return e;
}
function wE(e, n) {
  n === void 0 && (n = SE);
  var o = [], i = !1, a = {
    read: function() {
      if (i)
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      return o.length ? o[o.length - 1] : e;
    },
    useMedium: function(c) {
      var d = n(c, i);
      return o.push(d), function() {
        o = o.filter(function(p) {
          return p !== d;
        });
      };
    },
    assignSyncMedium: function(c) {
      for (i = !0; o.length; ) {
        var d = o;
        o = [], d.forEach(c);
      }
      o = {
        push: function(p) {
          return c(p);
        },
        filter: function() {
          return o;
        }
      };
    },
    assignMedium: function(c) {
      i = !0;
      var d = [];
      if (o.length) {
        var p = o;
        o = [], p.forEach(c), d = o;
      }
      var h = function() {
        var S = d;
        d = [], S.forEach(c);
      }, g = function() {
        return Promise.resolve().then(h);
      };
      g(), o = {
        push: function(S) {
          d.push(S), g();
        },
        filter: function(S) {
          return d = d.filter(S), o;
        }
      };
    }
  };
  return a;
}
function xE(e) {
  e === void 0 && (e = {});
  var n = wE(null);
  return n.options = Jt({ async: !0, ssr: !1 }, e), n;
}
var Q0 = function(e) {
  var n = e.sideCar, o = Y0(e, ["sideCar"]);
  if (!n)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var i = n.read();
  if (!i)
    throw new Error("Sidecar medium not found");
  return C.createElement(i, Jt({}, o));
};
Q0.isSideCarExport = !0;
function _E(e, n) {
  return e.useMedium(n), Q0;
}
var X0 = xE(), cc = function() {
}, Ua = C.forwardRef(function(e, n) {
  var o = C.useRef(null), i = C.useState({
    onScrollCapture: cc,
    onWheelCapture: cc,
    onTouchMoveCapture: cc
  }), a = i[0], c = i[1], d = e.forwardProps, p = e.children, h = e.className, g = e.removeScrollBar, S = e.enabled, l = e.shards, f = e.sideCar, v = e.noRelative, w = e.noIsolation, k = e.inert, x = e.allowPinchZoom, A = e.as, E = A === void 0 ? "div" : A, R = e.gapMode, N = Y0(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), O = f, U = vE([o, n]), K = Jt(Jt({}, N), a);
  return C.createElement(
    C.Fragment,
    null,
    S && C.createElement(O, { sideCar: X0, removeScrollBar: g, shards: l, noRelative: v, noIsolation: w, inert: k, setCallbacks: c, allowPinchZoom: !!x, lockRef: o, gapMode: R }),
    d ? C.cloneElement(C.Children.only(p), Jt(Jt({}, K), { ref: U })) : C.createElement(E, Jt({}, K, { className: h, ref: U }), p)
  );
});
Ua.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
Ua.classNames = {
  fullWidth: da,
  zeroRight: ca
};
var TE = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function kE() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var n = TE();
  return n && e.setAttribute("nonce", n), e;
}
function AE(e, n) {
  e.styleSheet ? e.styleSheet.cssText = n : e.appendChild(document.createTextNode(n));
}
function CE(e) {
  var n = document.head || document.getElementsByTagName("head")[0];
  n.appendChild(e);
}
var PE = function() {
  var e = 0, n = null;
  return {
    add: function(o) {
      e == 0 && (n = kE()) && (AE(n, o), CE(n)), e++;
    },
    remove: function() {
      e--, !e && n && (n.parentNode && n.parentNode.removeChild(n), n = null);
    }
  };
}, EE = function() {
  var e = PE();
  return function(n, o) {
    C.useEffect(function() {
      return e.add(n), function() {
        e.remove();
      };
    }, [n && o]);
  };
}, Z0 = function() {
  var e = EE(), n = function(o) {
    var i = o.styles, a = o.dynamic;
    return e(i, a), null;
  };
  return n;
}, bE = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, dc = function(e) {
  return parseInt(e || "", 10) || 0;
}, ME = function(e) {
  var n = window.getComputedStyle(document.body), o = n[e === "padding" ? "paddingLeft" : "marginLeft"], i = n[e === "padding" ? "paddingTop" : "marginTop"], a = n[e === "padding" ? "paddingRight" : "marginRight"];
  return [dc(o), dc(i), dc(a)];
}, RE = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return bE;
  var n = ME(e), o = document.documentElement.clientWidth, i = window.innerWidth;
  return {
    left: n[0],
    top: n[1],
    right: n[2],
    gap: Math.max(0, i - o + n[2] - n[0])
  };
}, DE = Z0(), ao = "data-scroll-locked", NE = function(e, n, o, i) {
  var a = e.left, c = e.top, d = e.right, p = e.gap;
  return o === void 0 && (o = "margin"), `
  .`.concat(mE, ` {
   overflow: hidden `).concat(i, `;
   padding-right: `).concat(p, "px ").concat(i, `;
  }
  body[`).concat(ao, `] {
    overflow: hidden `).concat(i, `;
    overscroll-behavior: contain;
    `).concat([
    n && "position: relative ".concat(i, ";"),
    o === "margin" && `
    padding-left: `.concat(a, `px;
    padding-top: `).concat(c, `px;
    padding-right: `).concat(d, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(p, "px ").concat(i, `;
    `),
    o === "padding" && "padding-right: ".concat(p, "px ").concat(i, ";")
  ].filter(Boolean).join(""), `
  }
  
  .`).concat(ca, ` {
    right: `).concat(p, "px ").concat(i, `;
  }
  
  .`).concat(da, ` {
    margin-right: `).concat(p, "px ").concat(i, `;
  }
  
  .`).concat(ca, " .").concat(ca, ` {
    right: 0 `).concat(i, `;
  }
  
  .`).concat(da, " .").concat(da, ` {
    margin-right: 0 `).concat(i, `;
  }
  
  body[`).concat(ao, `] {
    `).concat(hE, ": ").concat(p, `px;
  }
`);
}, qy = function() {
  var e = parseInt(document.body.getAttribute(ao) || "0", 10);
  return isFinite(e) ? e : 0;
}, IE = function() {
  C.useEffect(function() {
    return document.body.setAttribute(ao, (qy() + 1).toString()), function() {
      var e = qy() - 1;
      e <= 0 ? document.body.removeAttribute(ao) : document.body.setAttribute(ao, e.toString());
    };
  }, []);
}, jE = function(e) {
  var n = e.noRelative, o = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
  IE();
  var c = C.useMemo(function() {
    return RE(a);
  }, [a]);
  return C.createElement(DE, { styles: NE(c, !n, a, o ? "" : "!important") });
}, rd = !1;
if (typeof window < "u")
  try {
    var Qs = Object.defineProperty({}, "passive", {
      get: function() {
        return rd = !0, !0;
      }
    });
    window.addEventListener("test", Qs, Qs), window.removeEventListener("test", Qs, Qs);
  } catch {
    rd = !1;
  }
var Zr = rd ? { passive: !1 } : !1, FE = function(e) {
  return e.tagName === "TEXTAREA";
}, J0 = function(e, n) {
  if (!(e instanceof Element))
    return !1;
  var o = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    o[n] !== "hidden" && // contains scroll inside self
    !(o.overflowY === o.overflowX && !FE(e) && o[n] === "visible")
  );
}, OE = function(e) {
  return J0(e, "overflowY");
}, LE = function(e) {
  return J0(e, "overflowX");
}, eg = function(e, n) {
  var o = n.ownerDocument, i = n;
  do {
    typeof ShadowRoot < "u" && i instanceof ShadowRoot && (i = i.host);
    var a = q0(e, i);
    if (a) {
      var c = eS(e, i), d = c[1], p = c[2];
      if (d > p)
        return !0;
    }
    i = i.parentNode;
  } while (i && i !== o.body);
  return !1;
}, VE = function(e) {
  var n = e.scrollTop, o = e.scrollHeight, i = e.clientHeight;
  return [
    n,
    o,
    i
  ];
}, BE = function(e) {
  var n = e.scrollLeft, o = e.scrollWidth, i = e.clientWidth;
  return [
    n,
    o,
    i
  ];
}, q0 = function(e, n) {
  return e === "v" ? OE(n) : LE(n);
}, eS = function(e, n) {
  return e === "v" ? VE(n) : BE(n);
}, zE = function(e, n) {
  return e === "h" && n === "rtl" ? -1 : 1;
}, $E = function(e, n, o, i, a) {
  var c = zE(e, window.getComputedStyle(n).direction), d = c * i, p = o.target, h = n.contains(p), g = !1, S = d > 0, l = 0, f = 0;
  do {
    if (!p)
      break;
    var v = eS(e, p), w = v[0], k = v[1], x = v[2], A = k - x - c * w;
    (w || A) && q0(e, p) && (l += A, f += w);
    var E = p.parentNode;
    p = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !h && p !== document.body || // self content
    h && (n.contains(p) || n === p)
  );
  return (S && Math.abs(l) < 1 || !S && Math.abs(f) < 1) && (g = !0), g;
}, Xs = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, tg = function(e) {
  return [e.deltaX, e.deltaY];
}, ng = function(e) {
  return e && "current" in e ? e.current : e;
}, UE = function(e, n) {
  return e[0] === n[0] && e[1] === n[1];
}, HE = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, WE = 0, Jr = [];
function GE(e) {
  var n = C.useRef([]), o = C.useRef([0, 0]), i = C.useRef(), a = C.useState(WE++)[0], c = C.useState(Z0)[0], d = C.useRef(e);
  C.useEffect(function() {
    d.current = e;
  }, [e]), C.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(a));
      var k = pE([e.lockRef.current], (e.shards || []).map(ng), !0).filter(Boolean);
      return k.forEach(function(x) {
        return x.classList.add("allow-interactivity-".concat(a));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(a)), k.forEach(function(x) {
          return x.classList.remove("allow-interactivity-".concat(a));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var p = C.useCallback(function(k, x) {
    if ("touches" in k && k.touches.length === 2 || k.type === "wheel" && k.ctrlKey)
      return !d.current.allowPinchZoom;
    var A = Xs(k), E = o.current, R = "deltaX" in k ? k.deltaX : E[0] - A[0], N = "deltaY" in k ? k.deltaY : E[1] - A[1], O, U = k.target, K = Math.abs(R) > Math.abs(N) ? "h" : "v";
    if ("touches" in k && K === "h" && U.type === "range")
      return !1;
    var G = window.getSelection(), L = G && G.anchorNode, X = L ? L === U || L.contains(U) : !1;
    if (X)
      return !1;
    var ae = eg(K, U);
    if (!ae)
      return !0;
    if (ae ? O = K : (O = K === "v" ? "h" : "v", ae = eg(K, U)), !ae)
      return !1;
    if (!i.current && "changedTouches" in k && (R || N) && (i.current = O), !O)
      return !0;
    var q = i.current || O;
    return $E(q, x, k, q === "h" ? R : N);
  }, []), h = C.useCallback(function(k) {
    var x = k;
    if (!(!Jr.length || Jr[Jr.length - 1] !== c)) {
      var A = "deltaY" in x ? tg(x) : Xs(x), E = n.current.filter(function(O) {
        return O.name === x.type && (O.target === x.target || x.target === O.shadowParent) && UE(O.delta, A);
      })[0];
      if (E && E.should) {
        x.cancelable && x.preventDefault();
        return;
      }
      if (!E) {
        var R = (d.current.shards || []).map(ng).filter(Boolean).filter(function(O) {
          return O.contains(x.target);
        }), N = R.length > 0 ? p(x, R[0]) : !d.current.noIsolation;
        N && x.cancelable && x.preventDefault();
      }
    }
  }, []), g = C.useCallback(function(k, x, A, E) {
    var R = { name: k, delta: x, target: A, should: E, shadowParent: KE(A) };
    n.current.push(R), setTimeout(function() {
      n.current = n.current.filter(function(N) {
        return N !== R;
      });
    }, 1);
  }, []), S = C.useCallback(function(k) {
    o.current = Xs(k), i.current = void 0;
  }, []), l = C.useCallback(function(k) {
    g(k.type, tg(k), k.target, p(k, e.lockRef.current));
  }, []), f = C.useCallback(function(k) {
    g(k.type, Xs(k), k.target, p(k, e.lockRef.current));
  }, []);
  C.useEffect(function() {
    return Jr.push(c), e.setCallbacks({
      onScrollCapture: l,
      onWheelCapture: l,
      onTouchMoveCapture: f
    }), document.addEventListener("wheel", h, Zr), document.addEventListener("touchmove", h, Zr), document.addEventListener("touchstart", S, Zr), function() {
      Jr = Jr.filter(function(k) {
        return k !== c;
      }), document.removeEventListener("wheel", h, Zr), document.removeEventListener("touchmove", h, Zr), document.removeEventListener("touchstart", S, Zr);
    };
  }, []);
  var v = e.removeScrollBar, w = e.inert;
  return C.createElement(
    C.Fragment,
    null,
    w ? C.createElement(c, { styles: HE(a) }) : null,
    v ? C.createElement(jE, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function KE(e) {
  for (var n = null; e !== null; )
    e instanceof ShadowRoot && (n = e.host, e = e.host), e = e.parentNode;
  return n;
}
const YE = _E(X0, GE);
var tS = C.forwardRef(function(e, n) {
  return C.createElement(Ua, Jt({}, e, { ref: n, sideCar: YE }));
});
tS.classNames = Ua.classNames;
var QE = function(e) {
  if (typeof document > "u")
    return null;
  var n = Array.isArray(e) ? e[0] : e;
  return n.ownerDocument.body;
}, qr = /* @__PURE__ */ new WeakMap(), Zs = /* @__PURE__ */ new WeakMap(), Js = {}, fc = 0, nS = function(e) {
  return e && (e.host || nS(e.parentNode));
}, XE = function(e, n) {
  return n.map(function(o) {
    if (e.contains(o))
      return o;
    var i = nS(o);
    return i && e.contains(i) ? i : (console.error("aria-hidden", o, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(o) {
    return !!o;
  });
}, ZE = function(e, n, o, i) {
  var a = XE(n, Array.isArray(e) ? e : [e]);
  Js[o] || (Js[o] = /* @__PURE__ */ new WeakMap());
  var c = Js[o], d = [], p = /* @__PURE__ */ new Set(), h = new Set(a), g = function(l) {
    !l || p.has(l) || (p.add(l), g(l.parentNode));
  };
  a.forEach(g);
  var S = function(l) {
    !l || h.has(l) || Array.prototype.forEach.call(l.children, function(f) {
      if (p.has(f))
        S(f);
      else
        try {
          var v = f.getAttribute(i), w = v !== null && v !== "false", k = (qr.get(f) || 0) + 1, x = (c.get(f) || 0) + 1;
          qr.set(f, k), c.set(f, x), d.push(f), k === 1 && w && Zs.set(f, !0), x === 1 && f.setAttribute(o, "true"), w || f.setAttribute(i, "true");
        } catch (A) {
          console.error("aria-hidden: cannot operate on ", f, A);
        }
    });
  };
  return S(n), p.clear(), fc++, function() {
    d.forEach(function(l) {
      var f = qr.get(l) - 1, v = c.get(l) - 1;
      qr.set(l, f), c.set(l, v), f || (Zs.has(l) || l.removeAttribute(i), Zs.delete(l)), v || l.removeAttribute(o);
    }), fc--, fc || (qr = /* @__PURE__ */ new WeakMap(), qr = /* @__PURE__ */ new WeakMap(), Zs = /* @__PURE__ */ new WeakMap(), Js = {});
  };
}, JE = function(e, n, o) {
  o === void 0 && (o = "data-aria-hidden");
  var i = Array.from(Array.isArray(e) ? e : [e]), a = QE(e);
  return a ? (i.push.apply(i, Array.from(a.querySelectorAll("[aria-live], script"))), ZE(i, a, o, "aria-hidden")) : function() {
    return null;
  };
}, qE = Object.defineProperty, zt = (e, n) => qE(e, "name", { value: n, configurable: !0 }), Zd = "Dialog", [rS] = FP(Zd), [eb, hn] = rS(Zd), tb = /* @__PURE__ */ zt((e) => {
  const {
    __scopeDialog: n,
    children: o,
    open: i,
    defaultOpen: a,
    onOpenChange: c,
    modal: d = !0
  } = e, p = C.useRef(null), h = C.useRef(null), [g, S] = b0({
    prop: i,
    defaultProp: a ?? !1,
    onChange: c,
    caller: Zd
  }), [l, f] = C.useState(0), [v, w] = C.useState(0);
  return /* @__PURE__ */ T.jsx(
    eb,
    {
      scope: n,
      triggerRef: p,
      contentRef: h,
      contentId: sc(),
      titleId: sc(),
      descriptionId: sc(),
      titlePresent: l > 0,
      descriptionPresent: v > 0,
      setTitleCount: f,
      setDescriptionCount: w,
      open: g,
      onOpenChange: S,
      onOpenToggle: C.useCallback(() => S((k) => !k), [S]),
      modal: d,
      children: o
    }
  );
}, "Dialog"), oS = "DialogPortal", [nb, iS] = rS(oS, {
  forceMount: void 0
}), rb = /* @__PURE__ */ zt((e) => {
  const { __scopeDialog: n, forceMount: o, children: i, container: a } = e, c = hn(oS, n);
  return /* @__PURE__ */ T.jsx(nb, { scope: n, forceMount: o, children: C.Children.map(i, (d) => /* @__PURE__ */ T.jsx(Xd, { present: o || c.open, children: /* @__PURE__ */ T.jsx(cE, { asChild: !0, container: a, children: d }) })) });
}, "DialogPortal"), od = "DialogOverlay", ob = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const i = iS(od, n.__scopeDialog), { forceMount: a = i.forceMount, ...c } = n, d = hn(od, n.__scopeDialog);
    return d.modal ? /* @__PURE__ */ T.jsx(Xd, { present: a || d.open, children: /* @__PURE__ */ T.jsx(sb, { ...c, ref: o }) }) : null;
  }, "DialogOverlay")
), ib = /* @__PURE__ */ N0("DialogOverlay.RemoveScroll"), sb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = hn(od, i), d = j0(), p = xt(o, d);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ T.jsx(tS, { as: ib, allowPinchZoom: !0, shards: [c.contentRef], children: /* @__PURE__ */ T.jsx(
        yo.div,
        {
          "data-state": Jd(c.open),
          ...a,
          ref: p,
          style: { pointerEvents: "auto", ...a.style }
        }
      ) })
    );
  }, "DialogOverlayImpl")
), Si = "DialogContent", ab = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const i = iS(Si, n.__scopeDialog), { forceMount: a = i.forceMount, ...c } = n, d = hn(Si, n.__scopeDialog);
    return /* @__PURE__ */ T.jsx(Xd, { present: a || d.open, children: d.modal ? /* @__PURE__ */ T.jsx(lb, { ...c, ref: o }) : /* @__PURE__ */ T.jsx(ub, { ...c, ref: o }) });
  }, "DialogContent")
), lb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const i = hn(Si, n.__scopeDialog), a = C.useRef(null), c = xt(o, i.contentRef, a);
    return C.useEffect(() => {
      const d = a.current;
      if (d) return JE(d);
    }, []), /* @__PURE__ */ T.jsx(
      sS,
      {
        ...n,
        ref: c,
        trapFocus: i.open,
        disableOutsidePointerEvents: i.open,
        onCloseAutoFocus: Sr(n.onCloseAutoFocus, (d) => {
          var p;
          d.preventDefault(), (p = i.triggerRef.current) == null || p.focus();
        }),
        onPointerDownOutside: Sr(n.onPointerDownOutside, (d) => {
          const p = d.detail.originalEvent, h = p.button === 0 && p.ctrlKey === !0;
          (p.button === 2 || h) && d.preventDefault();
        }),
        onFocusOutside: Sr(
          n.onFocusOutside,
          (d) => d.preventDefault()
        )
      }
    );
  }, "DialogContentModal")
), ub = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const i = hn(Si, n.__scopeDialog), a = C.useRef(!1), c = C.useRef(!1);
    return /* @__PURE__ */ T.jsx(
      sS,
      {
        ...n,
        ref: o,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (d) => {
          var p, h;
          (p = n.onCloseAutoFocus) == null || p.call(n, d), d.defaultPrevented || (a.current || (h = i.triggerRef.current) == null || h.focus(), d.preventDefault()), a.current = !1, c.current = !1;
        },
        onInteractOutside: (d) => {
          var g, S;
          (g = n.onInteractOutside) == null || g.call(n, d), d.defaultPrevented || (a.current = !0, d.detail.originalEvent.type === "pointerdown" && (c.current = !0));
          const p = d.target;
          ((S = i.triggerRef.current) == null ? void 0 : S.contains(p)) && d.preventDefault(), d.detail.originalEvent.type === "focusin" && c.current && d.preventDefault();
        }
      }
    );
  }, "DialogContentNonModal")
), sS = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, trapFocus: a, onOpenAutoFocus: c, onCloseAutoFocus: d, ...p } = n, h = hn(Si, i);
    return fE(), /* @__PURE__ */ T.jsx(T.Fragment, { children: /* @__PURE__ */ T.jsx(
      aE,
      {
        asChild: !0,
        loop: !0,
        trapped: a,
        onMountAutoFocus: c,
        onUnmountAutoFocus: d,
        children: /* @__PURE__ */ T.jsx(
          oE,
          {
            role: "dialog",
            id: h.contentId,
            "aria-describedby": h.descriptionPresent ? h.descriptionId : void 0,
            "aria-labelledby": h.titlePresent ? h.titleId : void 0,
            "data-state": Jd(h.open),
            ...p,
            ref: o,
            deferPointerDownOutside: !0,
            onDismiss: () => h.onOpenChange(!1)
          }
        )
      }
    ) });
  }, "DialogContentImpl")
), cb = "DialogTitle", db = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = hn(cb, i), { setTitleCount: d } = c;
    return tn(() => (d((p) => p + 1), () => d((p) => p - 1)), [d]), /* @__PURE__ */ T.jsx(yo.h2, { id: c.titleId, ...a, ref: o });
  }, "DialogTitle")
), fb = "DialogDescription", pb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = hn(fb, i), { setDescriptionCount: d } = c;
    return tn(() => (d((p) => p + 1), () => d((p) => p - 1)), [d]), /* @__PURE__ */ T.jsx(yo.p, { id: c.descriptionId, ...a, ref: o });
  }, "DialogDescription")
);
function Jd(e) {
  return e ? "open" : "closed";
}
zt(Jd, "getState");
function mb() {
  const e = Q((a) => a.summaryRecord), n = Q((a) => a.closeSummary), o = Q((a) => a.startTimer), i = _r(e == null ? void 0 : e.selectedScene);
  return /* @__PURE__ */ T.jsx(tb, { open: !!e, onOpenChange: (a) => !a && n(), children: /* @__PURE__ */ T.jsx(Fa, { children: e ? /* @__PURE__ */ T.jsxs(rb, { forceMount: !0, children: [
    /* @__PURE__ */ T.jsx(ob, { asChild: !0, children: /* @__PURE__ */ T.jsx(
      Kn.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ T.jsx(ab, { asChild: !0, children: /* @__PURE__ */ T.jsxs(
      Kn.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ T.jsx(db, { children: "Focus block complete" }),
          /* @__PURE__ */ T.jsx(pb, { className: "sr-only", children: "Summary of the completed focus block." }),
          /* @__PURE__ */ T.jsx("p", { children: "You protected a focused block in your quiet study room." }),
          /* @__PURE__ */ T.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ T.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ T.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ T.jsx("strong", { children: d0(e.totalFocusTime) })
            ] }),
            /* @__PURE__ */ T.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ T.jsx("span", { children: "Planned block" }),
              /* @__PURE__ */ T.jsxs("strong", { children: [
                e.pomodoroDuration,
                "m"
              ] })
            ] }),
            /* @__PURE__ */ T.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ T.jsx("span", { children: "Scene" }),
              /* @__PURE__ */ T.jsx("strong", { children: i.name })
            ] }),
            /* @__PURE__ */ T.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ T.jsx("span", { children: "Room state" }),
              /* @__PURE__ */ T.jsx("strong", { children: "Saved" })
            ] })
          ] }),
          e.persisted === !1 ? /* @__PURE__ */ T.jsx("p", { children: "This session is visible for now, but could not be saved to this device history." }) : null,
          /* @__PURE__ */ T.jsxs("div", { className: "focus-button-row", children: [
            /* @__PURE__ */ T.jsx(be, { variant: "primary", onClick: () => {
              n(), o();
            }, children: "Continue studying" }),
            /* @__PURE__ */ T.jsx(be, { onClick: n, children: "Done" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function aS(e, [n, o]) {
  return Math.min(o, Math.max(n, e));
}
function so(e, n, { checkForDefaultPrevented: o = !0 } = {}) {
  return function(a) {
    if (e == null || e(a), o === !1 || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  };
}
function lS(e, n = []) {
  let o = [];
  function i(c, d) {
    const p = C.createContext(d);
    p.displayName = c + "Context";
    const h = o.length;
    o = [...o, d];
    const g = (l) => {
      var A;
      const { scope: f, children: v, ...w } = l, k = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[h]) || p, x = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ T.jsx(k.Provider, { value: x, children: v });
    };
    g.displayName = c + "Provider";
    function S(l, f) {
      var k;
      const v = ((k = f == null ? void 0 : f[e]) == null ? void 0 : k[h]) || p, w = C.useContext(v);
      if (w) return w;
      if (d !== void 0) return d;
      throw new Error(`\`${l}\` must be used within \`${c}\``);
    }
    return [g, S];
  }
  const a = () => {
    const c = o.map((d) => C.createContext(d));
    return function(p) {
      const h = (p == null ? void 0 : p[e]) || c;
      return C.useMemo(
        () => ({ [`__scope${e}`]: { ...p, [e]: h } }),
        [p, h]
      );
    };
  };
  return a.scopeName = e, [i, hb(a, ...n)];
}
function hb(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const o = () => {
    const i = e.map((a) => ({
      useScope: a(),
      scopeName: a.scopeName
    }));
    return function(c) {
      const d = i.reduce((p, { useScope: h, scopeName: g }) => {
        const l = h(c)[`__scope${g}`];
        return { ...p, ...l };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return o.scopeName = n.scopeName, o;
}
var yb = Tr[" useInsertionEffect ".trim().toString()] || tn;
function gb({
  prop: e,
  defaultProp: n,
  onChange: o = () => {
  },
  caller: i
}) {
  const [a, c, d] = vb({
    defaultProp: n,
    onChange: o
  }), p = e !== void 0, h = p ? e : a;
  {
    const S = C.useRef(e !== void 0);
    C.useEffect(() => {
      const l = S.current;
      l !== p && console.warn(
        `${i} is changing from ${l ? "controlled" : "uncontrolled"} to ${p ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), S.current = p;
    }, [p, i]);
  }
  const g = C.useCallback(
    (S) => {
      var l;
      if (p) {
        const f = Sb(S) ? S(e) : S;
        f !== e && ((l = d.current) == null || l.call(d, f));
      } else
        c(S);
    },
    [p, e, c, d]
  );
  return [h, g];
}
function vb({
  defaultProp: e,
  onChange: n
}) {
  const [o, i] = C.useState(e), a = C.useRef(o), c = C.useRef(n);
  return yb(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== o && ((d = c.current) == null || d.call(c, o), a.current = o);
  }, [o, a]), [o, i, c];
}
function Sb(e) {
  return typeof e == "function";
}
var wb = C.createContext(void 0);
function xb(e) {
  const n = C.useContext(wb);
  return e || n || "ltr";
}
function _b(e) {
  const n = C.useRef({ value: e, previous: e });
  return C.useMemo(() => (n.current.value !== e && (n.current.previous = n.current.value, n.current.value = e), n.current.previous), [e]);
}
function Tb(e) {
  const [n, o] = C.useState(void 0);
  return tn(() => {
    if (e) {
      o({ width: e.offsetWidth, height: e.offsetHeight });
      const i = new ResizeObserver((a) => {
        if (!Array.isArray(a) || !a.length)
          return;
        const c = a[0];
        let d, p;
        if ("borderBoxSize" in c) {
          const h = c.borderBoxSize, g = Array.isArray(h) ? h[0] : h;
          d = g.inlineSize, p = g.blockSize;
        } else
          d = e.offsetWidth, p = e.offsetHeight;
        o({ width: d, height: p });
      });
      return i.observe(e, { box: "border-box" }), () => i.unobserve(e);
    } else
      o(void 0);
  }, [e]), n;
}
// @__NO_SIDE_EFFECTS__
function id(e) {
  const n = C.forwardRef((o, i) => {
    let { children: a, ...c } = o, d = null, p = !1;
    const h = [];
    rg(a) && typeof qs == "function" && (a = qs(a._payload)), C.Children.forEach(a, (f) => {
      var v;
      if (Eb(f)) {
        p = !0;
        const w = f;
        let k = "child" in w.props ? w.props.child : w.props.children;
        rg(k) && typeof qs == "function" && (k = qs(k._payload)), d = Ab(w, k), h.push((v = d == null ? void 0 : d.props) == null ? void 0 : v.children);
      } else
        h.push(f);
    }), d ? d = C.cloneElement(d, void 0, h) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !p && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const g = d ? Pb(d) : void 0, S = xt(i, g);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          p ? Db(e) : Rb(e)
        );
      return a;
    }
    const l = Cb(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = i ? S : g), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var kb = Symbol.for("radix.slottable"), Ab = (e, n) => {
  if ("child" in e.props) {
    const o = e.props.child;
    return C.isValidElement(o) ? C.cloneElement(o, void 0, e.props.children(o.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function Cb(e, n) {
  const o = { ...n };
  for (const i in n) {
    const a = e[i], c = n[i];
    /^on[A-Z]/.test(i) ? a && c ? o[i] = (...p) => {
      const h = c(...p);
      return a(...p), h;
    } : a && (o[i] = a) : i === "style" ? o[i] = { ...a, ...c } : i === "className" && (o[i] = [a, c].filter(Boolean).join(" "));
  }
  return { ...e, ...o };
}
function Pb(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
function Eb(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === kb;
}
var bb = Symbol.for("react.lazy");
function rg(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === bb && "_payload" in e && Mb(e._payload);
}
function Mb(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var Rb = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, Db = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, qs = Tr[" use ".trim().toString()], Nb = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], Pi = Nb.reduce((e, n) => {
  const o = /* @__PURE__ */ id(`Primitive.${n}`), i = C.forwardRef((a, c) => {
    const { asChild: d, ...p } = a, h = d ? o : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ T.jsx(h, { ...p, ref: c });
  });
  return i.displayName = `Primitive.${n}`, { ...e, [n]: i };
}, {});
function Ib(e) {
  const n = e + "CollectionProvider", [o, i] = lS(n), [a, c] = o(
    n,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), d = (k) => {
    const { scope: x, children: A } = k, E = C.useRef(null), R = C.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ T.jsx(a, { scope: x, itemMap: R, collectionRef: E, children: A });
  };
  d.displayName = n;
  const p = e + "CollectionSlot", h = /* @__PURE__ */ id(p), g = C.forwardRef(
    (k, x) => {
      const { scope: A, children: E } = k, R = c(p, A), N = xt(x, R.collectionRef);
      return /* @__PURE__ */ T.jsx(h, { ref: N, children: E });
    }
  );
  g.displayName = p;
  const S = e + "CollectionItemSlot", l = "data-radix-collection-item", f = /* @__PURE__ */ id(S), v = C.forwardRef(
    (k, x) => {
      const { scope: A, children: E, ...R } = k, N = C.useRef(null), O = xt(x, N), U = c(S, A);
      return C.useEffect(() => (U.itemMap.set(N, { ref: N, ...R }), () => void U.itemMap.delete(N))), /* @__PURE__ */ T.jsx(f, { [l]: "", ref: O, children: E });
    }
  );
  v.displayName = S;
  function w(k) {
    const x = c(e + "CollectionConsumer", k);
    return C.useCallback(() => {
      const E = x.collectionRef.current;
      if (!E) return [];
      const R = Array.from(E.querySelectorAll(`[${l}]`));
      return Array.from(x.itemMap.values()).sort(
        (U, K) => R.indexOf(U.ref.current) - R.indexOf(K.ref.current)
      );
    }, [x.collectionRef, x.itemMap]);
  }
  return [
    { Provider: d, Slot: g, ItemSlot: v },
    w,
    i
  ];
}
var uS = ["PageUp", "PageDown"], cS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], dS = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, go = "Slider", [sd, jb, Fb] = Ib(go), [qd] = lS(go, [
  Fb
]), [Ob, Ei] = qd(go), ef = C.forwardRef(
  (e, n) => {
    const {
      name: o,
      min: i = 0,
      max: a = 100,
      step: c = 1,
      orientation: d = "horizontal",
      disabled: p = !1,
      minStepsBetweenThumbs: h = 0,
      defaultValue: g = [i],
      value: S,
      onValueChange: l = () => {
      },
      onValueCommit: f = () => {
      },
      inverted: v = !1,
      form: w,
      ...k
    } = e, x = C.useRef(/* @__PURE__ */ new Set()), A = C.useRef(0), E = C.useRef(!1), N = d === "horizontal" ? Lb : Vb, [O = [], U] = gb({
      prop: S,
      defaultProp: g,
      onChange: (q) => {
        var ue;
        (ue = [...x.current][A.current]) == null || ue.focus({
          preventScroll: !0,
          focusVisible: E.current
        }), E.current = !1, l(q);
      }
    }), K = C.useRef(O);
    function G(q) {
      const de = Ub(O, q);
      ae(q, de);
    }
    function L(q) {
      ae(q, A.current);
    }
    function X() {
      const q = K.current[A.current];
      O[A.current] !== q && f(O);
    }
    function ae(q, de, { commit: ue } = { commit: !1 }) {
      const _e = Kb(c), ve = Yb(Math.round((q - i) / c) * c + i, _e), Se = aS(ve, [i, a]);
      U(($ = []) => {
        const Z = zb($, Se, de);
        if (Gb(Z, h * c)) {
          A.current = Z.indexOf(Se);
          const Y = String(Z) !== String($);
          return Y && ue && f(Z), Y ? Z : $;
        } else
          return $;
      });
    }
    return /* @__PURE__ */ T.jsx(
      Ob,
      {
        scope: e.__scopeSlider,
        name: o,
        disabled: p,
        min: i,
        max: a,
        valueIndexToChangeRef: A,
        thumbs: x.current,
        values: O,
        orientation: d,
        form: w,
        children: /* @__PURE__ */ T.jsx(sd.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ T.jsx(sd.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ T.jsx(
          N,
          {
            "aria-disabled": p,
            "data-disabled": p ? "" : void 0,
            ...k,
            ref: n,
            onPointerDown: so(k.onPointerDown, () => {
              p || (K.current = O, E.current = !1);
            }),
            min: i,
            max: a,
            inverted: v,
            onSlideStart: p ? void 0 : G,
            onSlideMove: p ? void 0 : L,
            onSlideEnd: p ? void 0 : X,
            onHomeKeyDown: () => {
              p || (E.current = !0, ae(i, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              p || (E.current = !0, ae(a, O.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: q, direction: de }) => {
              if (!p) {
                E.current = !0;
                const ve = uS.includes(q.key) || q.shiftKey && cS.includes(q.key) ? 10 : 1, Se = A.current, $ = O[Se], Z = c * ve * de;
                ae($ + Z, Se, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
ef.displayName = go;
var [fS, pS] = qd(go, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), Lb = C.forwardRef(
  (e, n) => {
    const {
      min: o,
      max: i,
      dir: a,
      inverted: c,
      onSlideStart: d,
      onSlideMove: p,
      onSlideEnd: h,
      onStepKeyDown: g,
      ...S
    } = e, [l, f] = C.useState(null), v = xt(n, (R) => f(R)), w = C.useRef(void 0), k = xb(a), x = k === "ltr", A = x && !c || !x && c;
    function E(R) {
      const N = w.current || l.getBoundingClientRect(), O = [0, N.width], K = of(O, A ? [o, i] : [i, o]);
      return w.current = N, K(R - N.left);
    }
    return /* @__PURE__ */ T.jsx(
      fS,
      {
        scope: e.__scopeSlider,
        startEdge: A ? "left" : "right",
        endEdge: A ? "right" : "left",
        direction: A ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ T.jsx(
          mS,
          {
            dir: k,
            "data-orientation": "horizontal",
            ...S,
            ref: v,
            style: {
              ...S.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (R) => {
              const N = E(R.clientX);
              d == null || d(N);
            },
            onSlideMove: (R) => {
              const N = E(R.clientX);
              p == null || p(N);
            },
            onSlideEnd: () => {
              w.current = void 0, h == null || h();
            },
            onStepKeyDown: (R) => {
              const O = dS[A ? "from-left" : "from-right"].includes(R.key);
              g == null || g({ event: R, direction: O ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), Vb = C.forwardRef(
  (e, n) => {
    const {
      min: o,
      max: i,
      inverted: a,
      onSlideStart: c,
      onSlideMove: d,
      onSlideEnd: p,
      onStepKeyDown: h,
      ...g
    } = e, S = C.useRef(null), l = xt(n, S), f = C.useRef(void 0), v = !a;
    function w(k) {
      const x = f.current || S.current.getBoundingClientRect(), A = [0, x.height], R = of(A, v ? [i, o] : [o, i]);
      return f.current = x, R(k - x.top);
    }
    return /* @__PURE__ */ T.jsx(
      fS,
      {
        scope: e.__scopeSlider,
        startEdge: v ? "bottom" : "top",
        endEdge: v ? "top" : "bottom",
        size: "height",
        direction: v ? 1 : -1,
        children: /* @__PURE__ */ T.jsx(
          mS,
          {
            "data-orientation": "vertical",
            ...g,
            ref: l,
            style: {
              ...g.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (k) => {
              const x = w(k.clientY);
              c == null || c(x);
            },
            onSlideMove: (k) => {
              const x = w(k.clientY);
              d == null || d(x);
            },
            onSlideEnd: () => {
              f.current = void 0, p == null || p();
            },
            onStepKeyDown: (k) => {
              const A = dS[v ? "from-bottom" : "from-top"].includes(k.key);
              h == null || h({ event: k, direction: A ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), mS = C.forwardRef(
  (e, n) => {
    const {
      __scopeSlider: o,
      onSlideStart: i,
      onSlideMove: a,
      onSlideEnd: c,
      onHomeKeyDown: d,
      onEndKeyDown: p,
      onStepKeyDown: h,
      ...g
    } = e, S = Ei(go, o);
    return /* @__PURE__ */ T.jsx(
      Pi.span,
      {
        ...g,
        ref: n,
        onKeyDown: so(e.onKeyDown, (l) => {
          l.key === "Home" ? (d(l), l.preventDefault()) : l.key === "End" ? (p(l), l.preventDefault()) : uS.concat(cS).includes(l.key) && (h(l), l.preventDefault());
        }),
        onPointerDown: so(e.onPointerDown, (l) => {
          const f = l.target;
          f.setPointerCapture(l.pointerId), l.preventDefault(), S.thumbs.has(f) ? f.focus({ preventScroll: !0, focusVisible: !1 }) : i(l);
        }),
        onPointerMove: so(e.onPointerMove, (l) => {
          l.target.hasPointerCapture(l.pointerId) && a(l);
        }),
        onPointerUp: so(e.onPointerUp, (l) => {
          const f = l.target;
          f.hasPointerCapture(l.pointerId) && (f.releasePointerCapture(l.pointerId), c(l));
        })
      }
    );
  }
), hS = "SliderTrack", tf = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Ei(hS, o);
    return /* @__PURE__ */ T.jsx(
      Pi.span,
      {
        "data-disabled": a.disabled ? "" : void 0,
        "data-orientation": a.orientation,
        ...i,
        ref: n
      }
    );
  }
);
tf.displayName = hS;
var ad = "SliderRange", nf = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Ei(ad, o), c = pS(ad, o), d = C.useRef(null), p = xt(n, d), h = a.values.length, g = a.values.map(
      (f) => TS(f, a.min, a.max)
    ), S = h > 1 ? Math.min(...g) : 0, l = 100 - Math.max(...g);
    return /* @__PURE__ */ T.jsx(
      Pi.span,
      {
        "data-orientation": a.orientation,
        "data-disabled": a.disabled ? "" : void 0,
        ...i,
        ref: p,
        style: {
          ...e.style,
          [c.startEdge]: S + "%",
          [c.endEdge]: l + "%"
        }
      }
    );
  }
);
nf.displayName = ad;
var yS = "SliderThumb", [Bb, gS] = qd(yS), vS = "SliderThumbProvider";
function SS(e) {
  const {
    __scopeSlider: n,
    name: o,
    children: i,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: a
  } = e, c = Ei(vS, n), d = jb(n), [p, h] = C.useState(null), g = C.useMemo(
    () => p ? d().findIndex((x) => x.ref.current === p) : -1,
    [d, p]
  ), S = Tb(p), l = p ? !!c.form || !!p.closest("form") : !0, f = c.values[g], v = o ?? (c.name ? c.name + (c.values.length > 1 ? "[]" : "") : void 0), w = f === void 0 ? 0 : TS(f, c.min, c.max);
  C.useEffect(() => {
    if (p)
      return c.thumbs.add(p), () => {
        c.thumbs.delete(p);
      };
  }, [p, c.thumbs]);
  const k = {
    value: f,
    name: v,
    form: c.form,
    isFormControl: l,
    index: g,
    thumb: p,
    onThumbChange: h,
    percent: w,
    size: S
  };
  return /* @__PURE__ */ T.jsx(Bb, { scope: n, ...k, children: Qb(a) ? a(k) : i });
}
SS.displayName = vS;
var fa = "SliderThumbTrigger", wS = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Ei(fa, o), c = pS(fa, o), { index: d, value: p, percent: h, size: g, onThumbChange: S } = gS(
      fa,
      o
    ), l = xt(n, (k) => S(k)), f = $b(d, a.values.length), v = g == null ? void 0 : g[c.size], w = v ? Hb(v, h, c.direction) : 0;
    return /* @__PURE__ */ T.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [c.startEdge]: `calc(${h}% + ${w}px)`
        },
        children: /* @__PURE__ */ T.jsx(sd.ItemSlot, { scope: o, children: /* @__PURE__ */ T.jsx(
          Pi.span,
          {
            role: "slider",
            "aria-label": e["aria-label"] || f,
            "aria-valuemin": a.min,
            "aria-valuenow": p,
            "aria-valuemax": a.max,
            "aria-orientation": a.orientation,
            "data-orientation": a.orientation,
            "data-disabled": a.disabled ? "" : void 0,
            tabIndex: a.disabled ? void 0 : 0,
            ...i,
            ref: l,
            style: p === void 0 ? { display: "none" } : e.style,
            onFocus: so(e.onFocus, () => {
              a.valueIndexToChangeRef.current = d;
            })
          }
        ) })
      }
    );
  }
);
wS.displayName = fa;
var rf = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, name: i, ...a } = e;
    return /* @__PURE__ */ T.jsx(
      SS,
      {
        __scopeSlider: o,
        name: i,
        internal_do_not_use_render: ({ index: c, isFormControl: d }) => /* @__PURE__ */ T.jsxs(T.Fragment, { children: [
          /* @__PURE__ */ T.jsx(
            wS,
            {
              ...a,
              ref: n,
              __scopeSlider: o
            }
          ),
          d ? /* @__PURE__ */ T.jsx(
            _S,
            {
              __scopeSlider: o
            },
            c
          ) : null
        ] })
      }
    );
  }
);
rf.displayName = yS;
var xS = "SliderBubbleInput", _S = C.forwardRef(
  ({ __scopeSlider: e, ...n }, o) => {
    const { value: i, name: a, form: c } = gS(xS, e), d = C.useRef(null), p = xt(d, o), h = _b(i);
    return C.useEffect(() => {
      const g = d.current;
      if (!g) return;
      const S = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(S, "value").set;
      if (h !== i && f) {
        const v = new Event("input", { bubbles: !0 });
        f.call(g, i), g.dispatchEvent(v);
      }
    }, [h, i]), /* @__PURE__ */ T.jsx(
      Pi.input,
      {
        style: { display: "none" },
        name: a,
        form: c,
        ...n,
        ref: p,
        defaultValue: i
      }
    );
  }
);
_S.displayName = xS;
function zb(e = [], n, o) {
  const i = [...e];
  return i[o] = n, i.sort((a, c) => a - c);
}
function TS(e, n, o) {
  const c = 100 / (o - n) * (e - n);
  return aS(c, [0, 100]);
}
function $b(e, n) {
  return n > 2 ? `Value ${e + 1} of ${n}` : n === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function Ub(e, n) {
  if (e.length === 1) return 0;
  const o = e.map((a) => Math.abs(a - n)), i = Math.min(...o);
  return o.indexOf(i);
}
function Hb(e, n, o) {
  const i = e / 2, c = of([0, 50], [0, i]);
  return (i - c(n) * o) * o;
}
function Wb(e) {
  return e.slice(0, -1).map((n, o) => e[o + 1] - n);
}
function Gb(e, n) {
  if (n > 0) {
    const o = Wb(e);
    return Math.min(...o) >= n;
  }
  return !0;
}
function of(e, n) {
  return (o) => {
    if (e[0] === e[1] || n[0] === n[1]) return n[0];
    const i = (n[1] - n[0]) / (e[1] - e[0]);
    return n[0] + i * (o - e[0]);
  };
}
function Kb(e) {
  if (!Number.isFinite(e)) return 0;
  const n = e.toString();
  if (n.includes("e")) {
    const [i, a] = n.split("e"), c = i.split(".")[1] || "", d = Number(a);
    return Math.max(0, c.length - d);
  }
  const o = n.split(".")[1];
  return o ? o.length : 0;
}
function Yb(e, n) {
  const o = Math.pow(10, n);
  return Math.round(e * o) / o;
}
function Qb(e) {
  return typeof e == "function";
}
function Xb({ scene: e, active: n, onSelect: o }) {
  return /* @__PURE__ */ T.jsxs(
    Kn.button,
    {
      className: `scene-card ${n ? "active" : ""}`.trim(),
      type: "button",
      "aria-pressed": n,
      "aria-label": `${e.name}: ${e.description}`,
      onClick: () => o(e.id),
      style: { backgroundImage: `url("${e.image}")` },
      whileHover: { scale: 1.025, y: -2 },
      whileTap: { scale: 0.98 },
      children: [
        /* @__PURE__ */ T.jsx("span", { className: "focus-pill", children: e.kicker }),
        /* @__PURE__ */ T.jsx("strong", { children: e.name }),
        /* @__PURE__ */ T.jsx("span", { children: e.description })
      ]
    }
  );
}
function kS() {
  const e = Q((o) => o.selectedScene), n = Q((o) => o.selectScene);
  return /* @__PURE__ */ T.jsx("div", { className: "scene-selector", "aria-label": "Study scenes", children: xr.map((o) => /* @__PURE__ */ T.jsx(Xb, { scene: o, active: o.id === e, onSelect: n }, o.id)) });
}
function og({ label: e, icon: n, value: o, onChange: i }) {
  return /* @__PURE__ */ T.jsxs("label", { className: "sound-slider", children: [
    /* @__PURE__ */ T.jsxs("span", { className: "sound-slider-head", children: [
      /* @__PURE__ */ T.jsxs("span", { className: "sound-slider-label", children: [
        n,
        /* @__PURE__ */ T.jsx("span", { children: e })
      ] }),
      /* @__PURE__ */ T.jsxs("strong", { children: [
        o,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ T.jsxs(
      ef,
      {
        className: "radix-slider-root",
        value: [o],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (a) => i(a[0]),
        children: [
          /* @__PURE__ */ T.jsx(tf, { className: "radix-slider-track", children: /* @__PURE__ */ T.jsx(nf, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ T.jsx(rf, { className: "radix-slider-thumb", "aria-label": e })
        ]
      }
    )
  ] });
}
function Zb({ audioState: e }) {
  const n = Q((S) => S.musicType), o = Q((S) => S.ambientSound), i = Q((S) => S.musicVolume), a = Q((S) => S.ambientVolume), c = Q((S) => S.audioPlaying), d = Q((S) => S.setSound), p = Q((S) => S.toggleAudio), h = La({ musicType: n, ambientSound: o }), g = h.ambientLayers.map((S) => S.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ T.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ T.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ T.jsx("select", { value: n, onChange: (S) => d("musicType", S.target.value), children: Un.map((S) => /* @__PURE__ */ T.jsx("option", { value: S.label, children: S.label }, S.label)) })
    ] }),
    /* @__PURE__ */ T.jsx(
      og,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ T.jsx(za, { size: 16, "aria-hidden": "true" }),
        value: i,
        onChange: (S) => d("musicVolume", S)
      }
    ),
    /* @__PURE__ */ T.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ T.jsx("select", { value: o, onChange: (S) => d("ambientSound", S.target.value), children: Hn.map((S) => /* @__PURE__ */ T.jsx("option", { value: S.label, children: S.label }, S.label)) })
    ] }),
    /* @__PURE__ */ T.jsx(
      og,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ T.jsx(T0, { size: 16, "aria-hidden": "true" }),
        value: a,
        onChange: (S) => d("ambientVolume", S)
      }
    ),
    /* @__PURE__ */ T.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ T.jsxs("div", { children: [
        /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ T.jsx("strong", { children: h.musicTrack.title }),
        /* @__PURE__ */ T.jsx("p", { children: g }),
        e != null && e.error ? /* @__PURE__ */ T.jsx("p", { className: "audio-error", children: e.error }) : null
      ] }),
      /* @__PURE__ */ T.jsx(be, { variant: c ? "primary" : "ghost", onClick: p, children: c ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ T.jsx("div", { className: "audio-links", children: [h.musicTrack, ...h.ambientLayers].filter((S) => S == null ? void 0 : S.pageUrl).map((S) => /* @__PURE__ */ T.jsx("a", { href: S.pageUrl, target: "_blank", rel: "noreferrer", children: S.title || S.label || "Audio source" }, S.pageUrl)) })
  ] });
}
const Jb = [
  ["white-noise", "White noise"],
  ["pink-noise", "Pink noise"],
  ["brown-noise", "Brown noise"],
  ["light-rain", "Light rain"],
  ["heavy-rain", "Heavy rain"],
  ["ocean-waves", "Ocean waves"],
  ["wind", "Wind"],
  ["fireplace", "Fireplace"],
  ["train", "Train"],
  ["cafe", "Café"],
  ["street", "Street"],
  ["forest", "Forest"],
  ["summer-night", "Summer night"],
  ["waterfall", "Waterfall"],
  ["typing", "Typing"],
  ["page-turning", "Page turning"],
  ["writing", "Writing sounds"]
], qb = [
  ["white-noise", "White noise"],
  ["pink-noise", "Pink noise"],
  ["brown-noise", "Brown noise"]
], eM = [
  ["light-rain", "Light rain"],
  ["heavy-rain", "Heavy rain"],
  ["ocean-waves", "Ocean waves"],
  ["wind", "Wind"],
  ["fireplace", "Fireplace"],
  ["train", "Train"],
  ["cafe", "Café"],
  ["street", "Street"],
  ["forest", "Forest"],
  ["summer-night", "Summer night"],
  ["waterfall", "Waterfall"],
  ["typing", "Typing"],
  ["page-turning", "Page turning"],
  ["writing", "Writing sounds"]
];
function ea({ id: e, label: n, value: o, icon: i = null, onChange: a, card: c = !1 }) {
  const d = Number.isFinite(Number(o)) ? Number(o) : 0, p = d > 0;
  return /* @__PURE__ */ T.jsxs("label", { className: [
    "room-channel",
    i ? "room-channel-master" : "",
    c ? "room-channel-card" : "",
    p ? "is-active" : ""
  ].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ T.jsxs("span", { className: "room-channel-head", children: [
      /* @__PURE__ */ T.jsxs("span", { className: "room-channel-label", children: [
        i || /* @__PURE__ */ T.jsx("i", { className: `mixer-channel-dot mixer-${e}`, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: n })
      ] }),
      /* @__PURE__ */ T.jsxs("strong", { children: [
        d,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ T.jsxs(
      ef,
      {
        className: "radix-slider-root",
        value: [d],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (h) => a(e, h[0]),
        children: [
          /* @__PURE__ */ T.jsx(tf, { className: "radix-slider-track", children: /* @__PURE__ */ T.jsx(nf, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ T.jsx(rf, { className: "radix-slider-thumb", "aria-label": `${n} volume` })
        ]
      }
    )
  ] });
}
function tM({ audioState: e, scene: n, onClose: o }) {
  const i = Q((x) => x.audioChannels), a = Q((x) => x.setSound), c = Q((x) => x.musicType), d = Q((x) => x.ambientSound), p = Q((x) => x.musicVolume), h = Q((x) => x.ambientVolume), [g, S] = C.useState(!1), l = (x, A) => {
    S(!1), a(`audioChannel:${x}`, A);
  }, f = (x, A) => a("musicVolume", A), v = (x, A) => a("ambientVolume", A), w = () => {
    const x = Un[Math.floor(Math.random() * Un.length)], A = Hn[Math.floor(Math.random() * Hn.length)];
    a("musicType", x.label), a("ambientSound", A.label), S(!1);
  }, k = () => {
    a("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), a("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), S(!0);
  };
  return /* @__PURE__ */ T.jsxs(
    Kn.aside,
    {
      className: "focus-utility-panel room-control-panel liquid-glass",
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 14 },
      transition: Ud,
      role: "dialog",
      "aria-label": "Room settings",
      children: [
        /* @__PURE__ */ T.jsxs("header", { className: "room-control-head", children: [
          /* @__PURE__ */ T.jsxs("div", { children: [
            /* @__PURE__ */ T.jsx("span", { className: "control-eyebrow", children: "Control" }),
            /* @__PURE__ */ T.jsx("h2", { children: "Room settings" })
          ] }),
          /* @__PURE__ */ T.jsx(be, { className: "room-control-close", "aria-label": "Close room settings", onClick: o, children: /* @__PURE__ */ T.jsx(k0, { size: 16, "aria-hidden": "true" }) })
        ] }),
        /* @__PURE__ */ T.jsx("div", { className: "room-control-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsxs("div", { className: "room-control-grid", children: [
          /* @__PURE__ */ T.jsxs("section", { className: "room-control-col room-control-scenes", "aria-label": "Scenes", children: [
            /* @__PURE__ */ T.jsx("h3", { className: "room-control-section-title", children: "Scenes" }),
            /* @__PURE__ */ T.jsx(kS, {})
          ] }),
          /* @__PURE__ */ T.jsxs("section", { className: "room-control-col room-control-audio", children: [
            /* @__PURE__ */ T.jsxs("div", { className: "room-control-masters", children: [
              /* @__PURE__ */ T.jsxs("div", { className: "room-control-block", children: [
                /* @__PURE__ */ T.jsxs("div", { className: "room-control-block-head", children: [
                  /* @__PURE__ */ T.jsx("h3", { className: "room-control-section-title", children: "Music" }),
                  /* @__PURE__ */ T.jsx(be, { className: "room-control-icon-btn", "aria-label": "Shuffle to a random track", onClick: w, children: /* @__PURE__ */ T.jsx(fP, { size: 15, "aria-hidden": "true" }) })
                ] }),
                /* @__PURE__ */ T.jsxs("label", { className: "room-select-field", children: [
                  /* @__PURE__ */ T.jsx("span", { className: "sr-only", children: "Music track" }),
                  /* @__PURE__ */ T.jsx("select", { value: c, onChange: (x) => {
                    S(!1), a("musicType", x.target.value);
                  }, children: Un.map((x) => /* @__PURE__ */ T.jsx("option", { value: x.label, children: x.label }, x.label)) })
                ] }),
                /* @__PURE__ */ T.jsx(ea, { id: "music-volume", label: "Music volume", icon: /* @__PURE__ */ T.jsx(za, { size: 15, "aria-hidden": "true" }), value: p, onChange: f })
              ] }),
              /* @__PURE__ */ T.jsxs("div", { className: "room-control-block", children: [
                /* @__PURE__ */ T.jsxs("div", { className: "room-control-block-head", children: [
                  /* @__PURE__ */ T.jsx("h3", { className: "room-control-section-title", children: "Scene sound" }),
                  /* @__PURE__ */ T.jsx(be, { className: "room-control-icon-btn", "aria-label": g ? "Mix saved" : "Save current mix", onClick: () => S(!0), children: g ? /* @__PURE__ */ T.jsx(w0, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ T.jsx(x0, { size: 15, "aria-hidden": "true" }) })
                ] }),
                /* @__PURE__ */ T.jsxs("p", { className: "room-scene-recommend", children: [
                  "Recommended for ",
                  /* @__PURE__ */ T.jsx("strong", { children: n == null ? void 0 : n.name }),
                  /* @__PURE__ */ T.jsxs("span", { children: [
                    n == null ? void 0 : n.musicType,
                    " · ",
                    n == null ? void 0 : n.ambientSound
                  ] })
                ] }),
                /* @__PURE__ */ T.jsxs("button", { type: "button", className: "room-scene-apply", onClick: k, children: [
                  "Apply scene mix ",
                  /* @__PURE__ */ T.jsx("span", { "aria-hidden": "true", children: "↗" })
                ] }),
                /* @__PURE__ */ T.jsxs("label", { className: "room-select-field", children: [
                  /* @__PURE__ */ T.jsx("span", { className: "sr-only", children: "Ambient sound" }),
                  /* @__PURE__ */ T.jsx("select", { value: d, onChange: (x) => {
                    S(!1), a("ambientSound", x.target.value);
                  }, children: Hn.map((x) => /* @__PURE__ */ T.jsx("option", { value: x.label, children: x.label }, x.label)) })
                ] }),
                /* @__PURE__ */ T.jsx(ea, { id: "ambient-volume", label: "Ambient volume", icon: /* @__PURE__ */ T.jsx(T0, { size: 15, "aria-hidden": "true" }), value: h, onChange: v })
              ] })
            ] }),
            /* @__PURE__ */ T.jsxs("div", { className: "room-control-block", children: [
              /* @__PURE__ */ T.jsx("h3", { className: "room-control-section-title", children: "Focus noise" }),
              /* @__PURE__ */ T.jsx("div", { className: "room-noise-row", children: qb.map(([x, A]) => /* @__PURE__ */ T.jsx(ea, { id: x, label: A, value: i == null ? void 0 : i[x], onChange: l, card: !0 }, x)) })
            ] }),
            /* @__PURE__ */ T.jsxs("div", { className: "room-control-block", children: [
              /* @__PURE__ */ T.jsx("h3", { className: "room-control-section-title", children: "Ambient atmosphere" }),
              /* @__PURE__ */ T.jsx("div", { className: "room-ambient-grid", children: eM.map(([x, A]) => /* @__PURE__ */ T.jsx(ea, { id: x, label: A, value: i == null ? void 0 : i[x], onChange: l, card: !0 }, x)) })
            ] }),
            e != null && e.error ? /* @__PURE__ */ T.jsx("p", { className: "audio-error", children: e.error }) : null
          ] })
        ] })
      ]
    }
  );
}
function ta({ title: e, kicker: n, icon: o, children: i, onClose: a, className: c = "" }) {
  return /* @__PURE__ */ T.jsxs(Kn.aside, { className: `focus-utility-panel liquid-glass ${c}`.trim(), initial: { opacity: 0, y: 12, x: -18 }, animate: { opacity: 1, y: 0, x: 0 }, exit: { opacity: 0, y: 10, x: -18 }, transition: Ud, role: "dialog", "aria-label": e, children: [
    /* @__PURE__ */ T.jsxs("div", { className: "drawer-head", children: [
      /* @__PURE__ */ T.jsxs("div", { className: "utility-title", children: [
        /* @__PURE__ */ T.jsx("span", { className: "utility-title-icon", children: o }),
        /* @__PURE__ */ T.jsxs("div", { children: [
          /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: n }),
          /* @__PURE__ */ T.jsx("h2", { children: e })
        ] })
      ] }),
      /* @__PURE__ */ T.jsx(be, { "aria-label": `Close ${e}`, onClick: a, children: /* @__PURE__ */ T.jsx(k0, { size: 16, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ T.jsx("div", { className: "utility-panel-body", children: i })
  ] });
}
function nM({ audioState: e, scene: n }) {
  const o = Q((g) => g.audioChannels), i = Q((g) => g.setSound), [a, c] = C.useState(!1), d = (g, S) => {
    c(!1), i(`audioChannel:${g}`, S);
  }, p = () => {
    const g = Un[Math.floor(Math.random() * Un.length)], S = Hn[Math.floor(Math.random() * Hn.length)];
    i("musicType", g.label), i("ambientSound", S.label), c(!0);
  }, h = () => {
    i("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), i("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), c(!0);
  };
  return /* @__PURE__ */ T.jsxs("div", { className: "sound-mixer", children: [
    /* @__PURE__ */ T.jsxs("div", { className: "mixer-featured-row", children: [
      /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Music library" }),
      /* @__PURE__ */ T.jsxs(be, { onClick: p, children: [
        /* @__PURE__ */ T.jsx(JC, { size: 14, "aria-hidden": "true" }),
        " Random track"
      ] })
    ] }),
    /* @__PURE__ */ T.jsx(Zb, { audioState: e, compact: !0 }),
    /* @__PURE__ */ T.jsxs("div", { className: "mixer-preset-row", children: [
      /* @__PURE__ */ T.jsxs("button", { type: "button", className: "mixer-preset-button", onClick: h, children: [
        "Apply scene mix ",
        /* @__PURE__ */ T.jsx("span", { children: "↗" })
      ] }),
      /* @__PURE__ */ T.jsxs(be, { onClick: () => c(!0), children: [
        a ? /* @__PURE__ */ T.jsx(w0, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ T.jsx(x0, { size: 14, "aria-hidden": "true" }),
        " ",
        a ? "Saved" : "Save current mix"
      ] })
    ] }),
    /* @__PURE__ */ T.jsx("div", { className: "mixer-channel-grid", children: Jb.map(([g, S]) => /* @__PURE__ */ T.jsxs("label", { className: "mixer-channel", children: [
      /* @__PURE__ */ T.jsxs("span", { children: [
        /* @__PURE__ */ T.jsx("i", { className: `mixer-channel-dot mixer-${g}` }),
        S
      ] }),
      /* @__PURE__ */ T.jsxs("strong", { children: [
        o[g],
        "%"
      ] }),
      /* @__PURE__ */ T.jsx("input", { type: "range", min: "0", max: "100", value: o[g], "aria-label": `${S} volume`, onChange: (l) => d(g, l.target.value) })
    ] }, g)) }),
    e != null && e.error ? /* @__PURE__ */ T.jsx("p", { className: "audio-error", children: e.error }) : null
  ] });
}
function rM() {
  const e = () => {
    var i, a, c;
    return ((c = (a = (i = globalThis.window) == null ? void 0 : i.SynapseAuth) == null ? void 0 : a.getStoredSession) == null ? void 0 : c.call(a)) || null;
  }, [n, o] = C.useState(e);
  return C.useEffect(() => {
    var d, p, h, g;
    let i = !0;
    const a = (S) => {
      var l;
      i && o(((l = S == null ? void 0 : S.detail) == null ? void 0 : l.session) || e());
    };
    (d = globalThis.window) == null || d.addEventListener("synapse-auth-changed", a);
    const c = (g = (h = (p = globalThis.window) == null ? void 0 : p.SynapseAuth) == null ? void 0 : h.syncSessionFromProvider) == null ? void 0 : g.call(h);
    return Promise.resolve(c).finally(() => a()), () => {
      var S;
      i = !1, (S = globalThis.window) == null || S.removeEventListener("synapse-auth-changed", a);
    };
  }, []), n;
}
function oM({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ T.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ T.jsx(Ea, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ T.jsx("h3", { children: "Your Focus Trail" }),
    /* @__PURE__ */ T.jsx("p", { children: "Recent sessions and progress remain available through Synapse history." }),
    /* @__PURE__ */ T.jsx(be, { variant: "primary", onClick: () => e == null ? void 0 : e("", "history"), children: "Open session history" })
  ] }) : /* @__PURE__ */ T.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ T.jsx(Ea, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Your rhythm, remembered" }),
    /* @__PURE__ */ T.jsx("h3", { children: "Sign in to view your Focus Trail" }),
    /* @__PURE__ */ T.jsx("p", { children: "Track deep-work time, completed goals, and your study streak across devices." }),
    /* @__PURE__ */ T.jsx(be, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Sign in with Synapse" }),
    /* @__PURE__ */ T.jsx("small", { children: "Your current session continues without an account." })
  ] });
}
function iM({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ T.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ T.jsx(ba, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ T.jsx("h3", { children: "Companion Room" }),
    /* @__PURE__ */ T.jsx("p", { children: "Invite a study partner from your Synapse workspace to share this quiet room." }),
    /* @__PURE__ */ T.jsx(be, { variant: "primary", onClick: () => e == null ? void 0 : e("", "companion"), children: "Open Companion Room" })
  ] }) : /* @__PURE__ */ T.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ T.jsx(ba, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Study alongside someone" }),
    /* @__PURE__ */ T.jsx("h3", { children: "Sign in to use Companion Room" }),
    /* @__PURE__ */ T.jsx("p", { children: "Keep your own goal private while sharing the feeling of showing up together." }),
    /* @__PURE__ */ T.jsx(be, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Go to sign in" }),
    /* @__PURE__ */ T.jsx("small", { children: "No companion data is created in Focus Room." })
  ] });
}
function sM({ audioState: e, utilityPanel: n, onClose: o, onWorkspace: i }) {
  const a = Q((g) => g.activeDrawer), c = Q((g) => g.closeDrawer), d = Q((g) => g.selectedScene), p = rM(), h = C.useMemo(() => xr.find((g) => g.id === d) || xr[0], [d]);
  return /* @__PURE__ */ T.jsxs(Fa, { children: [
    n === "trail" ? /* @__PURE__ */ T.jsx(ta, { title: "Focus Trail", kicker: "Your progress", icon: /* @__PURE__ */ T.jsx(Ea, { size: 16 }), onClose: o, children: /* @__PURE__ */ T.jsx(oM, { onWorkspace: i, session: p }) }) : null,
    n === "companion" ? /* @__PURE__ */ T.jsx(ta, { title: "Companion Room", kicker: "Shared focus", icon: /* @__PURE__ */ T.jsx(ba, { size: 16 }), onClose: o, children: /* @__PURE__ */ T.jsx(iM, { onWorkspace: i, session: p }) }) : null,
    n === "settings" ? /* @__PURE__ */ T.jsx(tM, { audioState: e, scene: h, onClose: o }) : null,
    !n && a === "scene" ? /* @__PURE__ */ T.jsx(ta, { title: "Choose scene", kicker: "Scene", icon: /* @__PURE__ */ T.jsx(_0, { size: 16 }), onClose: c, children: /* @__PURE__ */ T.jsx(kS, {}) }) : null,
    !n && a === "music" ? /* @__PURE__ */ T.jsx(ta, { title: "Sound atmosphere", kicker: "Room audio", icon: /* @__PURE__ */ T.jsx(za, { size: 16 }), onClose: c, children: /* @__PURE__ */ T.jsx(nM, { audioState: e, scene: h }) }) : null
  ] });
}
function aM(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function lM({ onExit: e }) {
  const n = Q((g) => g.elapsedSeconds), o = Q((g) => g.pomodoroDuration), i = Q((g) => g.pomodoroDurationSeconds), a = Q((g) => g.timerMode), c = Q((g) => g.timerStatus), d = Q((g) => g.currentSession), p = Number(i) || (Number(o) || 0) * 60, h = a === "countup" ? n : Math.max(0, p - n);
  return /* @__PURE__ */ T.jsxs("div", { className: "compact-focus-mode-card", "aria-label": "Distraction-free focus timer", children: [
    /* @__PURE__ */ T.jsxs("div", { className: "compact-focus-card-top", children: [
      /* @__PURE__ */ T.jsxs("span", { children: [
        "POMODORO #",
        (d == null ? void 0 : d.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ T.jsx(be, { className: "compact-exit-button", onClick: e, "aria-label": "Exit Focus Mode", children: /* @__PURE__ */ T.jsx(rP, { size: 14, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ T.jsxs("span", { className: "compact-focus-status", children: [
      /* @__PURE__ */ T.jsx("i", {}),
      c === "paused" ? "Paused" : "In focus"
    ] }),
    /* @__PURE__ */ T.jsx("strong", { children: ka(h) }),
    /* @__PURE__ */ T.jsx("div", { className: "compact-focus-progress", children: /* @__PURE__ */ T.jsx("span", { style: { width: `${aM(n, p)}%` } }) }),
    /* @__PURE__ */ T.jsxs("small", { children: [
      Kd(p),
      " session"
    ] }),
    /* @__PURE__ */ T.jsx("span", { className: "sr-only", children: "Press Escape to exit Focus Mode." })
  ] });
}
var pc = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var ig;
function uM() {
  return ig || (ig = 1, (function(e) {
    (function() {
      var n = function() {
        this.init();
      };
      n.prototype = {
        /**
         * Initialize the global Howler object.
         * @return {Howler}
         */
        init: function() {
          var l = this || o;
          return l._counter = 1e3, l._html5AudioPool = [], l.html5PoolSize = 10, l._codecs = {}, l._howls = [], l._muted = !1, l._volume = 1, l._canPlayEvent = "canplaythrough", l._navigator = typeof window < "u" && window.navigator ? window.navigator : null, l.masterGain = null, l.noAudio = !1, l.usingWebAudio = !0, l.autoSuspend = !0, l.ctx = null, l.autoUnlock = !0, l._setup(), l;
        },
        /**
         * Get/set the global volume for all sounds.
         * @param  {Float} vol Volume from 0.0 to 1.0.
         * @return {Howler/Float}     Returns self or current volume.
         */
        volume: function(l) {
          var f = this || o;
          if (l = parseFloat(l), f.ctx || S(), typeof l < "u" && l >= 0 && l <= 1) {
            if (f._volume = l, f._muted)
              return f;
            f.usingWebAudio && f.masterGain.gain.setValueAtTime(l, o.ctx.currentTime);
            for (var v = 0; v < f._howls.length; v++)
              if (!f._howls[v]._webAudio)
                for (var w = f._howls[v]._getSoundIds(), k = 0; k < w.length; k++) {
                  var x = f._howls[v]._soundById(w[k]);
                  x && x._node && (x._node.volume = x._volume * l);
                }
            return f;
          }
          return f._volume;
        },
        /**
         * Handle muting and unmuting globally.
         * @param  {Boolean} muted Is muted or not.
         */
        mute: function(l) {
          var f = this || o;
          f.ctx || S(), f._muted = l, f.usingWebAudio && f.masterGain.gain.setValueAtTime(l ? 0 : f._volume, o.ctx.currentTime);
          for (var v = 0; v < f._howls.length; v++)
            if (!f._howls[v]._webAudio)
              for (var w = f._howls[v]._getSoundIds(), k = 0; k < w.length; k++) {
                var x = f._howls[v]._soundById(w[k]);
                x && x._node && (x._node.muted = l ? !0 : x._muted);
              }
          return f;
        },
        /**
         * Handle stopping all sounds globally.
         */
        stop: function() {
          for (var l = this || o, f = 0; f < l._howls.length; f++)
            l._howls[f].stop();
          return l;
        },
        /**
         * Unload and destroy all currently loaded Howl objects.
         * @return {Howler}
         */
        unload: function() {
          for (var l = this || o, f = l._howls.length - 1; f >= 0; f--)
            l._howls[f].unload();
          return l.usingWebAudio && l.ctx && typeof l.ctx.close < "u" && (l.ctx.close(), l.ctx = null, S()), l;
        },
        /**
         * Check for codec support of specific extension.
         * @param  {String} ext Audio file extention.
         * @return {Boolean}
         */
        codecs: function(l) {
          return (this || o)._codecs[l.replace(/^x-/, "")];
        },
        /**
         * Setup various state values for global tracking.
         * @return {Howler}
         */
        _setup: function() {
          var l = this || o;
          if (l.state = l.ctx && l.ctx.state || "suspended", l._autoSuspend(), !l.usingWebAudio)
            if (typeof Audio < "u")
              try {
                var f = new Audio();
                typeof f.oncanplaythrough > "u" && (l._canPlayEvent = "canplay");
              } catch {
                l.noAudio = !0;
              }
            else
              l.noAudio = !0;
          try {
            var f = new Audio();
            f.muted && (l.noAudio = !0);
          } catch {
          }
          return l.noAudio || l._setupCodecs(), l;
        },
        /**
         * Check for browser support for various codecs and cache the results.
         * @return {Howler}
         */
        _setupCodecs: function() {
          var l = this || o, f = null;
          try {
            f = typeof Audio < "u" ? new Audio() : null;
          } catch {
            return l;
          }
          if (!f || typeof f.canPlayType != "function")
            return l;
          var v = f.canPlayType("audio/mpeg;").replace(/^no$/, ""), w = l._navigator ? l._navigator.userAgent : "", k = w.match(/OPR\/(\d+)/g), x = k && parseInt(k[0].split("/")[1], 10) < 33, A = w.indexOf("Safari") !== -1 && w.indexOf("Chrome") === -1, E = w.match(/Version\/(.*?) /), R = A && E && parseInt(E[1], 10) < 15;
          return l._codecs = {
            mp3: !!(!x && (v || f.canPlayType("audio/mp3;").replace(/^no$/, ""))),
            mpeg: !!v,
            opus: !!f.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
            ogg: !!f.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            oga: !!f.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            wav: !!(f.canPlayType('audio/wav; codecs="1"') || f.canPlayType("audio/wav")).replace(/^no$/, ""),
            aac: !!f.canPlayType("audio/aac;").replace(/^no$/, ""),
            caf: !!f.canPlayType("audio/x-caf;").replace(/^no$/, ""),
            m4a: !!(f.canPlayType("audio/x-m4a;") || f.canPlayType("audio/m4a;") || f.canPlayType("audio/aac;")).replace(/^no$/, ""),
            m4b: !!(f.canPlayType("audio/x-m4b;") || f.canPlayType("audio/m4b;") || f.canPlayType("audio/aac;")).replace(/^no$/, ""),
            mp4: !!(f.canPlayType("audio/x-mp4;") || f.canPlayType("audio/mp4;") || f.canPlayType("audio/aac;")).replace(/^no$/, ""),
            weba: !!(!R && f.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            webm: !!(!R && f.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            dolby: !!f.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
            flac: !!(f.canPlayType("audio/x-flac;") || f.canPlayType("audio/flac;")).replace(/^no$/, "")
          }, l;
        },
        /**
         * Some browsers/devices will only allow audio to be played after a user interaction.
         * Attempt to automatically unlock audio on the first user interaction.
         * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         * @return {Howler}
         */
        _unlockAudio: function() {
          var l = this || o;
          if (!(l._audioUnlocked || !l.ctx)) {
            l._audioUnlocked = !1, l.autoUnlock = !1, !l._mobileUnloaded && l.ctx.sampleRate !== 44100 && (l._mobileUnloaded = !0, l.unload()), l._scratchBuffer = l.ctx.createBuffer(1, 1, 22050);
            var f = function(v) {
              for (; l._html5AudioPool.length < l.html5PoolSize; )
                try {
                  var w = new Audio();
                  w._unlocked = !0, l._releaseHtml5Audio(w);
                } catch {
                  l.noAudio = !0;
                  break;
                }
              for (var k = 0; k < l._howls.length; k++)
                if (!l._howls[k]._webAudio)
                  for (var x = l._howls[k]._getSoundIds(), A = 0; A < x.length; A++) {
                    var E = l._howls[k]._soundById(x[A]);
                    E && E._node && !E._node._unlocked && (E._node._unlocked = !0, E._node.load());
                  }
              l._autoResume();
              var R = l.ctx.createBufferSource();
              R.buffer = l._scratchBuffer, R.connect(l.ctx.destination), typeof R.start > "u" ? R.noteOn(0) : R.start(0), typeof l.ctx.resume == "function" && l.ctx.resume(), R.onended = function() {
                R.disconnect(0), l._audioUnlocked = !0, document.removeEventListener("touchstart", f, !0), document.removeEventListener("touchend", f, !0), document.removeEventListener("click", f, !0), document.removeEventListener("keydown", f, !0);
                for (var N = 0; N < l._howls.length; N++)
                  l._howls[N]._emit("unlock");
              };
            };
            return document.addEventListener("touchstart", f, !0), document.addEventListener("touchend", f, !0), document.addEventListener("click", f, !0), document.addEventListener("keydown", f, !0), l;
          }
        },
        /**
         * Get an unlocked HTML5 Audio object from the pool. If none are left,
         * return a new Audio object and throw a warning.
         * @return {Audio} HTML5 Audio object.
         */
        _obtainHtml5Audio: function() {
          var l = this || o;
          if (l._html5AudioPool.length)
            return l._html5AudioPool.pop();
          var f = new Audio().play();
          return f && typeof Promise < "u" && (f instanceof Promise || typeof f.then == "function") && f.catch(function() {
            console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
          }), new Audio();
        },
        /**
         * Return an activated HTML5 Audio object to the pool.
         * @return {Howler}
         */
        _releaseHtml5Audio: function(l) {
          var f = this || o;
          return l._unlocked && f._html5AudioPool.push(l), f;
        },
        /**
         * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
         * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
         * @return {Howler}
         */
        _autoSuspend: function() {
          var l = this;
          if (!(!l.autoSuspend || !l.ctx || typeof l.ctx.suspend > "u" || !o.usingWebAudio)) {
            for (var f = 0; f < l._howls.length; f++)
              if (l._howls[f]._webAudio) {
                for (var v = 0; v < l._howls[f]._sounds.length; v++)
                  if (!l._howls[f]._sounds[v]._paused)
                    return l;
              }
            return l._suspendTimer && clearTimeout(l._suspendTimer), l._suspendTimer = setTimeout(function() {
              if (l.autoSuspend) {
                l._suspendTimer = null, l.state = "suspending";
                var w = function() {
                  l.state = "suspended", l._resumeAfterSuspend && (delete l._resumeAfterSuspend, l._autoResume());
                };
                l.ctx.suspend().then(w, w);
              }
            }, 3e4), l;
          }
        },
        /**
         * Automatically resume the Web Audio AudioContext when a new sound is played.
         * @return {Howler}
         */
        _autoResume: function() {
          var l = this;
          if (!(!l.ctx || typeof l.ctx.resume > "u" || !o.usingWebAudio))
            return l.state === "running" && l.ctx.state !== "interrupted" && l._suspendTimer ? (clearTimeout(l._suspendTimer), l._suspendTimer = null) : l.state === "suspended" || l.state === "running" && l.ctx.state === "interrupted" ? (l.ctx.resume().then(function() {
              l.state = "running";
              for (var f = 0; f < l._howls.length; f++)
                l._howls[f]._emit("resume");
            }), l._suspendTimer && (clearTimeout(l._suspendTimer), l._suspendTimer = null)) : l.state === "suspending" && (l._resumeAfterSuspend = !0), l;
        }
      };
      var o = new n(), i = function(l) {
        var f = this;
        if (!l.src || l.src.length === 0) {
          console.error("An array of source files must be passed with any new Howl.");
          return;
        }
        f.init(l);
      };
      i.prototype = {
        /**
         * Initialize a new Howl group object.
         * @param  {Object} o Passed in properties for this group.
         * @return {Howl}
         */
        init: function(l) {
          var f = this;
          return o.ctx || S(), f._autoplay = l.autoplay || !1, f._format = typeof l.format != "string" ? l.format : [l.format], f._html5 = l.html5 || !1, f._muted = l.mute || !1, f._loop = l.loop || !1, f._pool = l.pool || 5, f._preload = typeof l.preload == "boolean" || l.preload === "metadata" ? l.preload : !0, f._rate = l.rate || 1, f._sprite = l.sprite || {}, f._src = typeof l.src != "string" ? l.src : [l.src], f._volume = l.volume !== void 0 ? l.volume : 1, f._xhr = {
            method: l.xhr && l.xhr.method ? l.xhr.method : "GET",
            headers: l.xhr && l.xhr.headers ? l.xhr.headers : null,
            withCredentials: l.xhr && l.xhr.withCredentials ? l.xhr.withCredentials : !1
          }, f._duration = 0, f._state = "unloaded", f._sounds = [], f._endTimers = {}, f._queue = [], f._playLock = !1, f._onend = l.onend ? [{ fn: l.onend }] : [], f._onfade = l.onfade ? [{ fn: l.onfade }] : [], f._onload = l.onload ? [{ fn: l.onload }] : [], f._onloaderror = l.onloaderror ? [{ fn: l.onloaderror }] : [], f._onplayerror = l.onplayerror ? [{ fn: l.onplayerror }] : [], f._onpause = l.onpause ? [{ fn: l.onpause }] : [], f._onplay = l.onplay ? [{ fn: l.onplay }] : [], f._onstop = l.onstop ? [{ fn: l.onstop }] : [], f._onmute = l.onmute ? [{ fn: l.onmute }] : [], f._onvolume = l.onvolume ? [{ fn: l.onvolume }] : [], f._onrate = l.onrate ? [{ fn: l.onrate }] : [], f._onseek = l.onseek ? [{ fn: l.onseek }] : [], f._onunlock = l.onunlock ? [{ fn: l.onunlock }] : [], f._onresume = [], f._webAudio = o.usingWebAudio && !f._html5, typeof o.ctx < "u" && o.ctx && o.autoUnlock && o._unlockAudio(), o._howls.push(f), f._autoplay && f._queue.push({
            event: "play",
            action: function() {
              f.play();
            }
          }), f._preload && f._preload !== "none" && f.load(), f;
        },
        /**
         * Load the audio file.
         * @return {Howler}
         */
        load: function() {
          var l = this, f = null;
          if (o.noAudio) {
            l._emit("loaderror", null, "No audio support.");
            return;
          }
          typeof l._src == "string" && (l._src = [l._src]);
          for (var v = 0; v < l._src.length; v++) {
            var w, k;
            if (l._format && l._format[v])
              w = l._format[v];
            else {
              if (k = l._src[v], typeof k != "string") {
                l._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              w = /^data:audio\/([^;,]+);/i.exec(k), w || (w = /\.([^.]+)$/.exec(k.split("?", 1)[0])), w && (w = w[1].toLowerCase());
            }
            if (w || console.warn('No file extension was found. Consider using the "format" property or specify an extension.'), w && o.codecs(w)) {
              f = l._src[v];
              break;
            }
          }
          if (!f) {
            l._emit("loaderror", null, "No codec support for selected audio sources.");
            return;
          }
          return l._src = f, l._state = "loading", window.location.protocol === "https:" && f.slice(0, 5) === "http:" && (l._html5 = !0, l._webAudio = !1), new a(l), l._webAudio && d(l), l;
        },
        /**
         * Play a sound or resume previous playback.
         * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Number}          Sound ID.
         */
        play: function(l, f) {
          var v = this, w = null;
          if (typeof l == "number")
            w = l, l = null;
          else {
            if (typeof l == "string" && v._state === "loaded" && !v._sprite[l])
              return null;
            if (typeof l > "u" && (l = "__default", !v._playLock)) {
              for (var k = 0, x = 0; x < v._sounds.length; x++)
                v._sounds[x]._paused && !v._sounds[x]._ended && (k++, w = v._sounds[x]._id);
              k === 1 ? l = null : w = null;
            }
          }
          var A = w ? v._soundById(w) : v._inactiveSound();
          if (!A)
            return null;
          if (w && !l && (l = A._sprite || "__default"), v._state !== "loaded") {
            A._sprite = l, A._ended = !1;
            var E = A._id;
            return v._queue.push({
              event: "play",
              action: function() {
                v.play(E);
              }
            }), E;
          }
          if (w && !A._paused)
            return f || v._loadQueue("play"), A._id;
          v._webAudio && o._autoResume();
          var R = Math.max(0, A._seek > 0 ? A._seek : v._sprite[l][0] / 1e3), N = Math.max(0, (v._sprite[l][0] + v._sprite[l][1]) / 1e3 - R), O = N * 1e3 / Math.abs(A._rate), U = v._sprite[l][0] / 1e3, K = (v._sprite[l][0] + v._sprite[l][1]) / 1e3;
          A._sprite = l, A._ended = !1;
          var G = function() {
            A._paused = !1, A._seek = R, A._start = U, A._stop = K, A._loop = !!(A._loop || v._sprite[l][2]);
          };
          if (R >= K) {
            v._ended(A);
            return;
          }
          var L = A._node;
          if (v._webAudio) {
            var X = function() {
              v._playLock = !1, G(), v._refreshBuffer(A);
              var ue = A._muted || v._muted ? 0 : A._volume;
              L.gain.setValueAtTime(ue, o.ctx.currentTime), A._playStart = o.ctx.currentTime, typeof L.bufferSource.start > "u" ? A._loop ? L.bufferSource.noteGrainOn(0, R, 86400) : L.bufferSource.noteGrainOn(0, R, N) : A._loop ? L.bufferSource.start(0, R, 86400) : L.bufferSource.start(0, R, N), O !== 1 / 0 && (v._endTimers[A._id] = setTimeout(v._ended.bind(v, A), O)), f || setTimeout(function() {
                v._emit("play", A._id), v._loadQueue();
              }, 0);
            };
            o.state === "running" && o.ctx.state !== "interrupted" ? X() : (v._playLock = !0, v.once("resume", X), v._clearTimer(A._id));
          } else {
            var ae = function() {
              L.currentTime = R, L.muted = A._muted || v._muted || o._muted || L.muted, L.volume = A._volume * o.volume(), L.playbackRate = A._rate;
              try {
                var ue = L.play();
                if (ue && typeof Promise < "u" && (ue instanceof Promise || typeof ue.then == "function") ? (v._playLock = !0, G(), ue.then(function() {
                  v._playLock = !1, L._unlocked = !0, f ? v._loadQueue() : v._emit("play", A._id);
                }).catch(function() {
                  v._playLock = !1, v._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), A._ended = !0, A._paused = !0;
                })) : f || (v._playLock = !1, G(), v._emit("play", A._id)), L.playbackRate = A._rate, L.paused) {
                  v._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                l !== "__default" || A._loop ? v._endTimers[A._id] = setTimeout(v._ended.bind(v, A), O) : (v._endTimers[A._id] = function() {
                  v._ended(A), L.removeEventListener("ended", v._endTimers[A._id], !1);
                }, L.addEventListener("ended", v._endTimers[A._id], !1));
              } catch (_e) {
                v._emit("playerror", A._id, _e);
              }
            };
            L.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (L.src = v._src, L.load());
            var q = window && window.ejecta || !L.readyState && o._navigator.isCocoonJS;
            if (L.readyState >= 3 || q)
              ae();
            else {
              v._playLock = !0, v._state = "loading";
              var de = function() {
                v._state = "loaded", ae(), L.removeEventListener(o._canPlayEvent, de, !1);
              };
              L.addEventListener(o._canPlayEvent, de, !1), v._clearTimer(A._id);
            }
          }
          return A._id;
        },
        /**
         * Pause playback and save current position.
         * @param  {Number} id The sound ID (empty to pause all in group).
         * @return {Howl}
         */
        pause: function(l) {
          var f = this;
          if (f._state !== "loaded" || f._playLock)
            return f._queue.push({
              event: "pause",
              action: function() {
                f.pause(l);
              }
            }), f;
          for (var v = f._getSoundIds(l), w = 0; w < v.length; w++) {
            f._clearTimer(v[w]);
            var k = f._soundById(v[w]);
            if (k && !k._paused && (k._seek = f.seek(v[w]), k._rateSeek = 0, k._paused = !0, f._stopFade(v[w]), k._node))
              if (f._webAudio) {
                if (!k._node.bufferSource)
                  continue;
                typeof k._node.bufferSource.stop > "u" ? k._node.bufferSource.noteOff(0) : k._node.bufferSource.stop(0), f._cleanBuffer(k._node);
              } else (!isNaN(k._node.duration) || k._node.duration === 1 / 0) && k._node.pause();
            arguments[1] || f._emit("pause", k ? k._id : null);
          }
          return f;
        },
        /**
         * Stop playback and reset to start.
         * @param  {Number} id The sound ID (empty to stop all in group).
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Howl}
         */
        stop: function(l, f) {
          var v = this;
          if (v._state !== "loaded" || v._playLock)
            return v._queue.push({
              event: "stop",
              action: function() {
                v.stop(l);
              }
            }), v;
          for (var w = v._getSoundIds(l), k = 0; k < w.length; k++) {
            v._clearTimer(w[k]);
            var x = v._soundById(w[k]);
            x && (x._seek = x._start || 0, x._rateSeek = 0, x._paused = !0, x._ended = !0, v._stopFade(w[k]), x._node && (v._webAudio ? x._node.bufferSource && (typeof x._node.bufferSource.stop > "u" ? x._node.bufferSource.noteOff(0) : x._node.bufferSource.stop(0), v._cleanBuffer(x._node)) : (!isNaN(x._node.duration) || x._node.duration === 1 / 0) && (x._node.currentTime = x._start || 0, x._node.pause(), x._node.duration === 1 / 0 && v._clearSound(x._node))), f || v._emit("stop", x._id));
          }
          return v;
        },
        /**
         * Mute/unmute a single sound or all sounds in this Howl group.
         * @param  {Boolean} muted Set to true to mute and false to unmute.
         * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
         * @return {Howl}
         */
        mute: function(l, f) {
          var v = this;
          if (v._state !== "loaded" || v._playLock)
            return v._queue.push({
              event: "mute",
              action: function() {
                v.mute(l, f);
              }
            }), v;
          if (typeof f > "u")
            if (typeof l == "boolean")
              v._muted = l;
            else
              return v._muted;
          for (var w = v._getSoundIds(f), k = 0; k < w.length; k++) {
            var x = v._soundById(w[k]);
            x && (x._muted = l, x._interval && v._stopFade(x._id), v._webAudio && x._node ? x._node.gain.setValueAtTime(l ? 0 : x._volume, o.ctx.currentTime) : x._node && (x._node.muted = o._muted ? !0 : l), v._emit("mute", x._id));
          }
          return v;
        },
        /**
         * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
         *   volume() -> Returns the group's volume value.
         *   volume(id) -> Returns the sound id's current volume.
         *   volume(vol) -> Sets the volume of all sounds in this Howl group.
         *   volume(vol, id) -> Sets the volume of passed sound id.
         * @return {Howl/Number} Returns self or current volume.
         */
        volume: function() {
          var l = this, f = arguments, v, w;
          if (f.length === 0)
            return l._volume;
          if (f.length === 1 || f.length === 2 && typeof f[1] > "u") {
            var k = l._getSoundIds(), x = k.indexOf(f[0]);
            x >= 0 ? w = parseInt(f[0], 10) : v = parseFloat(f[0]);
          } else f.length >= 2 && (v = parseFloat(f[0]), w = parseInt(f[1], 10));
          var A;
          if (typeof v < "u" && v >= 0 && v <= 1) {
            if (l._state !== "loaded" || l._playLock)
              return l._queue.push({
                event: "volume",
                action: function() {
                  l.volume.apply(l, f);
                }
              }), l;
            typeof w > "u" && (l._volume = v), w = l._getSoundIds(w);
            for (var E = 0; E < w.length; E++)
              A = l._soundById(w[E]), A && (A._volume = v, f[2] || l._stopFade(w[E]), l._webAudio && A._node && !A._muted ? A._node.gain.setValueAtTime(v, o.ctx.currentTime) : A._node && !A._muted && (A._node.volume = v * o.volume()), l._emit("volume", A._id));
          } else
            return A = w ? l._soundById(w) : l._sounds[0], A ? A._volume : 0;
          return l;
        },
        /**
         * Fade a currently playing sound between two volumes (if no id is passed, all sounds will fade).
         * @param  {Number} from The value to fade from (0.0 to 1.0).
         * @param  {Number} to   The volume to fade to (0.0 to 1.0).
         * @param  {Number} len  Time in milliseconds to fade.
         * @param  {Number} id   The sound id (omit to fade all sounds).
         * @return {Howl}
         */
        fade: function(l, f, v, w) {
          var k = this;
          if (k._state !== "loaded" || k._playLock)
            return k._queue.push({
              event: "fade",
              action: function() {
                k.fade(l, f, v, w);
              }
            }), k;
          l = Math.min(Math.max(0, parseFloat(l)), 1), f = Math.min(Math.max(0, parseFloat(f)), 1), v = parseFloat(v), k.volume(l, w);
          for (var x = k._getSoundIds(w), A = 0; A < x.length; A++) {
            var E = k._soundById(x[A]);
            if (E) {
              if (w || k._stopFade(x[A]), k._webAudio && !E._muted) {
                var R = o.ctx.currentTime, N = R + v / 1e3;
                E._volume = l, E._node.gain.setValueAtTime(l, R), E._node.gain.linearRampToValueAtTime(f, N);
              }
              k._startFadeInterval(E, l, f, v, x[A], typeof w > "u");
            }
          }
          return k;
        },
        /**
         * Starts the internal interval to fade a sound.
         * @param  {Object} sound Reference to sound to fade.
         * @param  {Number} from The value to fade from (0.0 to 1.0).
         * @param  {Number} to   The volume to fade to (0.0 to 1.0).
         * @param  {Number} len  Time in milliseconds to fade.
         * @param  {Number} id   The sound id to fade.
         * @param  {Boolean} isGroup   If true, set the volume on the group.
         */
        _startFadeInterval: function(l, f, v, w, k, x) {
          var A = this, E = f, R = v - f, N = Math.abs(R / 0.01), O = Math.max(4, N > 0 ? w / N : w), U = Date.now();
          l._fadeTo = v, l._interval = setInterval(function() {
            var K = (Date.now() - U) / w;
            U = Date.now(), E += R * K, E = Math.round(E * 100) / 100, R < 0 ? E = Math.max(v, E) : E = Math.min(v, E), A._webAudio ? l._volume = E : A.volume(E, l._id, !0), x && (A._volume = E), (v < f && E <= v || v > f && E >= v) && (clearInterval(l._interval), l._interval = null, l._fadeTo = null, A.volume(v, l._id), A._emit("fade", l._id));
          }, O);
        },
        /**
         * Internal method that stops the currently playing fade when
         * a new fade starts, volume is changed or the sound is stopped.
         * @param  {Number} id The sound id.
         * @return {Howl}
         */
        _stopFade: function(l) {
          var f = this, v = f._soundById(l);
          return v && v._interval && (f._webAudio && v._node.gain.cancelScheduledValues(o.ctx.currentTime), clearInterval(v._interval), v._interval = null, f.volume(v._fadeTo, l), v._fadeTo = null, f._emit("fade", l)), f;
        },
        /**
         * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
         *   loop() -> Returns the group's loop value.
         *   loop(id) -> Returns the sound id's loop value.
         *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
         *   loop(loop, id) -> Sets the loop value of passed sound id.
         * @return {Howl/Boolean} Returns self or current loop value.
         */
        loop: function() {
          var l = this, f = arguments, v, w, k;
          if (f.length === 0)
            return l._loop;
          if (f.length === 1)
            if (typeof f[0] == "boolean")
              v = f[0], l._loop = v;
            else
              return k = l._soundById(parseInt(f[0], 10)), k ? k._loop : !1;
          else f.length === 2 && (v = f[0], w = parseInt(f[1], 10));
          for (var x = l._getSoundIds(w), A = 0; A < x.length; A++)
            k = l._soundById(x[A]), k && (k._loop = v, l._webAudio && k._node && k._node.bufferSource && (k._node.bufferSource.loop = v, v && (k._node.bufferSource.loopStart = k._start || 0, k._node.bufferSource.loopEnd = k._stop, l.playing(x[A]) && (l.pause(x[A], !0), l.play(x[A], !0)))));
          return l;
        },
        /**
         * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
         *   rate() -> Returns the first sound node's current playback rate.
         *   rate(id) -> Returns the sound id's current playback rate.
         *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
         *   rate(rate, id) -> Sets the playback rate of passed sound id.
         * @return {Howl/Number} Returns self or the current playback rate.
         */
        rate: function() {
          var l = this, f = arguments, v, w;
          if (f.length === 0)
            w = l._sounds[0]._id;
          else if (f.length === 1) {
            var k = l._getSoundIds(), x = k.indexOf(f[0]);
            x >= 0 ? w = parseInt(f[0], 10) : v = parseFloat(f[0]);
          } else f.length === 2 && (v = parseFloat(f[0]), w = parseInt(f[1], 10));
          var A;
          if (typeof v == "number") {
            if (l._state !== "loaded" || l._playLock)
              return l._queue.push({
                event: "rate",
                action: function() {
                  l.rate.apply(l, f);
                }
              }), l;
            typeof w > "u" && (l._rate = v), w = l._getSoundIds(w);
            for (var E = 0; E < w.length; E++)
              if (A = l._soundById(w[E]), A) {
                l.playing(w[E]) && (A._rateSeek = l.seek(w[E]), A._playStart = l._webAudio ? o.ctx.currentTime : A._playStart), A._rate = v, l._webAudio && A._node && A._node.bufferSource ? A._node.bufferSource.playbackRate.setValueAtTime(v, o.ctx.currentTime) : A._node && (A._node.playbackRate = v);
                var R = l.seek(w[E]), N = (l._sprite[A._sprite][0] + l._sprite[A._sprite][1]) / 1e3 - R, O = N * 1e3 / Math.abs(A._rate);
                (l._endTimers[w[E]] || !A._paused) && (l._clearTimer(w[E]), l._endTimers[w[E]] = setTimeout(l._ended.bind(l, A), O)), l._emit("rate", A._id);
              }
          } else
            return A = l._soundById(w), A ? A._rate : l._rate;
          return l;
        },
        /**
         * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
         *   seek() -> Returns the first sound node's current seek position.
         *   seek(id) -> Returns the sound id's current seek position.
         *   seek(seek) -> Sets the seek position of the first sound node.
         *   seek(seek, id) -> Sets the seek position of passed sound id.
         * @return {Howl/Number} Returns self or the current seek position.
         */
        seek: function() {
          var l = this, f = arguments, v, w;
          if (f.length === 0)
            l._sounds.length && (w = l._sounds[0]._id);
          else if (f.length === 1) {
            var k = l._getSoundIds(), x = k.indexOf(f[0]);
            x >= 0 ? w = parseInt(f[0], 10) : l._sounds.length && (w = l._sounds[0]._id, v = parseFloat(f[0]));
          } else f.length === 2 && (v = parseFloat(f[0]), w = parseInt(f[1], 10));
          if (typeof w > "u")
            return 0;
          if (typeof v == "number" && (l._state !== "loaded" || l._playLock))
            return l._queue.push({
              event: "seek",
              action: function() {
                l.seek.apply(l, f);
              }
            }), l;
          var A = l._soundById(w);
          if (A)
            if (typeof v == "number" && v >= 0) {
              var E = l.playing(w);
              E && l.pause(w, !0), A._seek = v, A._ended = !1, l._clearTimer(w), !l._webAudio && A._node && !isNaN(A._node.duration) && (A._node.currentTime = v);
              var R = function() {
                E && l.play(w, !0), l._emit("seek", w);
              };
              if (E && !l._webAudio) {
                var N = function() {
                  l._playLock ? setTimeout(N, 0) : R();
                };
                setTimeout(N, 0);
              } else
                R();
            } else if (l._webAudio) {
              var O = l.playing(w) ? o.ctx.currentTime - A._playStart : 0, U = A._rateSeek ? A._rateSeek - A._seek : 0;
              return A._seek + (U + O * Math.abs(A._rate));
            } else
              return A._node.currentTime;
          return l;
        },
        /**
         * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
         * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
         * @return {Boolean} True if playing and false if not.
         */
        playing: function(l) {
          var f = this;
          if (typeof l == "number") {
            var v = f._soundById(l);
            return v ? !v._paused : !1;
          }
          for (var w = 0; w < f._sounds.length; w++)
            if (!f._sounds[w]._paused)
              return !0;
          return !1;
        },
        /**
         * Get the duration of this sound. Passing a sound id will return the sprite duration.
         * @param  {Number} id The sound id to check. If none is passed, return full source duration.
         * @return {Number} Audio duration in seconds.
         */
        duration: function(l) {
          var f = this, v = f._duration, w = f._soundById(l);
          return w && (v = f._sprite[w._sprite][1] / 1e3), v;
        },
        /**
         * Returns the current loaded state of this Howl.
         * @return {String} 'unloaded', 'loading', 'loaded'
         */
        state: function() {
          return this._state;
        },
        /**
         * Unload and destroy the current Howl object.
         * This will immediately stop all sound instances attached to this group.
         */
        unload: function() {
          for (var l = this, f = l._sounds, v = 0; v < f.length; v++)
            f[v]._paused || l.stop(f[v]._id), l._webAudio || (l._clearSound(f[v]._node), f[v]._node.removeEventListener("error", f[v]._errorFn, !1), f[v]._node.removeEventListener(o._canPlayEvent, f[v]._loadFn, !1), f[v]._node.removeEventListener("ended", f[v]._endFn, !1), o._releaseHtml5Audio(f[v]._node)), delete f[v]._node, l._clearTimer(f[v]._id);
          var w = o._howls.indexOf(l);
          w >= 0 && o._howls.splice(w, 1);
          var k = !0;
          for (v = 0; v < o._howls.length; v++)
            if (o._howls[v]._src === l._src || l._src.indexOf(o._howls[v]._src) >= 0) {
              k = !1;
              break;
            }
          return c && k && delete c[l._src], o.noAudio = !1, l._state = "unloaded", l._sounds = [], l = null, null;
        },
        /**
         * Listen to a custom event.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
         * @return {Howl}
         */
        on: function(l, f, v, w) {
          var k = this, x = k["_on" + l];
          return typeof f == "function" && x.push(w ? { id: v, fn: f, once: w } : { id: v, fn: f }), k;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(l, f, v) {
          var w = this, k = w["_on" + l], x = 0;
          if (typeof f == "number" && (v = f, f = null), f || v)
            for (x = 0; x < k.length; x++) {
              var A = v === k[x].id;
              if (f === k[x].fn && A || !f && A) {
                k.splice(x, 1);
                break;
              }
            }
          else if (l)
            w["_on" + l] = [];
          else {
            var E = Object.keys(w);
            for (x = 0; x < E.length; x++)
              E[x].indexOf("_on") === 0 && Array.isArray(w[E[x]]) && (w[E[x]] = []);
          }
          return w;
        },
        /**
         * Listen to a custom event and remove it once fired.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @return {Howl}
         */
        once: function(l, f, v) {
          var w = this;
          return w.on(l, f, v, 1), w;
        },
        /**
         * Emit all events of a specific type and pass the sound id.
         * @param  {String} event Event name.
         * @param  {Number} id    Sound ID.
         * @param  {Number} msg   Message to go with event.
         * @return {Howl}
         */
        _emit: function(l, f, v) {
          for (var w = this, k = w["_on" + l], x = k.length - 1; x >= 0; x--)
            (!k[x].id || k[x].id === f || l === "load") && (setTimeout((function(A) {
              A.call(this, f, v);
            }).bind(w, k[x].fn), 0), k[x].once && w.off(l, k[x].fn, k[x].id));
          return w._loadQueue(l), w;
        },
        /**
         * Queue of actions initiated before the sound has loaded.
         * These will be called in sequence, with the next only firing
         * after the previous has finished executing (even if async like play).
         * @return {Howl}
         */
        _loadQueue: function(l) {
          var f = this;
          if (f._queue.length > 0) {
            var v = f._queue[0];
            v.event === l && (f._queue.shift(), f._loadQueue()), l || v.action();
          }
          return f;
        },
        /**
         * Fired when playback ends at the end of the duration.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _ended: function(l) {
          var f = this, v = l._sprite;
          if (!f._webAudio && l._node && !l._node.paused && !l._node.ended && l._node.currentTime < l._stop)
            return setTimeout(f._ended.bind(f, l), 100), f;
          var w = !!(l._loop || f._sprite[v][2]);
          if (f._emit("end", l._id), !f._webAudio && w && f.stop(l._id, !0).play(l._id), f._webAudio && w) {
            f._emit("play", l._id), l._seek = l._start || 0, l._rateSeek = 0, l._playStart = o.ctx.currentTime;
            var k = (l._stop - l._start) * 1e3 / Math.abs(l._rate);
            f._endTimers[l._id] = setTimeout(f._ended.bind(f, l), k);
          }
          return f._webAudio && !w && (l._paused = !0, l._ended = !0, l._seek = l._start || 0, l._rateSeek = 0, f._clearTimer(l._id), f._cleanBuffer(l._node), o._autoSuspend()), !f._webAudio && !w && f.stop(l._id, !0), f;
        },
        /**
         * Clear the end timer for a sound playback.
         * @param  {Number} id The sound ID.
         * @return {Howl}
         */
        _clearTimer: function(l) {
          var f = this;
          if (f._endTimers[l]) {
            if (typeof f._endTimers[l] != "function")
              clearTimeout(f._endTimers[l]);
            else {
              var v = f._soundById(l);
              v && v._node && v._node.removeEventListener("ended", f._endTimers[l], !1);
            }
            delete f._endTimers[l];
          }
          return f;
        },
        /**
         * Return the sound identified by this ID, or return null.
         * @param  {Number} id Sound ID
         * @return {Object}    Sound object or null.
         */
        _soundById: function(l) {
          for (var f = this, v = 0; v < f._sounds.length; v++)
            if (l === f._sounds[v]._id)
              return f._sounds[v];
          return null;
        },
        /**
         * Return an inactive sound from the pool or create a new one.
         * @return {Sound} Sound playback object.
         */
        _inactiveSound: function() {
          var l = this;
          l._drain();
          for (var f = 0; f < l._sounds.length; f++)
            if (l._sounds[f]._ended)
              return l._sounds[f].reset();
          return new a(l);
        },
        /**
         * Drain excess inactive sounds from the pool.
         */
        _drain: function() {
          var l = this, f = l._pool, v = 0, w = 0;
          if (!(l._sounds.length < f)) {
            for (w = 0; w < l._sounds.length; w++)
              l._sounds[w]._ended && v++;
            for (w = l._sounds.length - 1; w >= 0; w--) {
              if (v <= f)
                return;
              l._sounds[w]._ended && (l._webAudio && l._sounds[w]._node && l._sounds[w]._node.disconnect(0), l._sounds.splice(w, 1), v--);
            }
          }
        },
        /**
         * Get all ID's from the sounds pool.
         * @param  {Number} id Only return one ID if one is passed.
         * @return {Array}    Array of IDs.
         */
        _getSoundIds: function(l) {
          var f = this;
          if (typeof l > "u") {
            for (var v = [], w = 0; w < f._sounds.length; w++)
              v.push(f._sounds[w]._id);
            return v;
          } else
            return [l];
        },
        /**
         * Load the sound back into the buffer source.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _refreshBuffer: function(l) {
          var f = this;
          return l._node.bufferSource = o.ctx.createBufferSource(), l._node.bufferSource.buffer = c[f._src], l._panner ? l._node.bufferSource.connect(l._panner) : l._node.bufferSource.connect(l._node), l._node.bufferSource.loop = l._loop, l._loop && (l._node.bufferSource.loopStart = l._start || 0, l._node.bufferSource.loopEnd = l._stop || 0), l._node.bufferSource.playbackRate.setValueAtTime(l._rate, o.ctx.currentTime), f;
        },
        /**
         * Prevent memory leaks by cleaning up the buffer source after playback.
         * @param  {Object} node Sound's audio node containing the buffer source.
         * @return {Howl}
         */
        _cleanBuffer: function(l) {
          var f = this, v = o._navigator && o._navigator.vendor.indexOf("Apple") >= 0;
          if (!l.bufferSource)
            return f;
          if (o._scratchBuffer && l.bufferSource && (l.bufferSource.onended = null, l.bufferSource.disconnect(0), v))
            try {
              l.bufferSource.buffer = o._scratchBuffer;
            } catch {
            }
          return l.bufferSource = null, f;
        },
        /**
         * Set the source to a 0-second silence to stop any downloading (except in IE).
         * @param  {Object} node Audio node to clear.
         */
        _clearSound: function(l) {
          var f = /MSIE |Trident\//.test(o._navigator && o._navigator.userAgent);
          f || (l.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        }
      };
      var a = function(l) {
        this._parent = l, this.init();
      };
      a.prototype = {
        /**
         * Initialize a new Sound object.
         * @return {Sound}
         */
        init: function() {
          var l = this, f = l._parent;
          return l._muted = f._muted, l._loop = f._loop, l._volume = f._volume, l._rate = f._rate, l._seek = 0, l._paused = !0, l._ended = !0, l._sprite = "__default", l._id = ++o._counter, f._sounds.push(l), l.create(), l;
        },
        /**
         * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
         * @return {Sound}
         */
        create: function() {
          var l = this, f = l._parent, v = o._muted || l._muted || l._parent._muted ? 0 : l._volume;
          return f._webAudio ? (l._node = typeof o.ctx.createGain > "u" ? o.ctx.createGainNode() : o.ctx.createGain(), l._node.gain.setValueAtTime(v, o.ctx.currentTime), l._node.paused = !0, l._node.connect(o.masterGain)) : o.noAudio || (l._node = o._obtainHtml5Audio(), l._errorFn = l._errorListener.bind(l), l._node.addEventListener("error", l._errorFn, !1), l._loadFn = l._loadListener.bind(l), l._node.addEventListener(o._canPlayEvent, l._loadFn, !1), l._endFn = l._endListener.bind(l), l._node.addEventListener("ended", l._endFn, !1), l._node.src = f._src, l._node.preload = f._preload === !0 ? "auto" : f._preload, l._node.volume = v * o.volume(), l._node.load()), l;
        },
        /**
         * Reset the parameters of this sound to the original state (for recycle).
         * @return {Sound}
         */
        reset: function() {
          var l = this, f = l._parent;
          return l._muted = f._muted, l._loop = f._loop, l._volume = f._volume, l._rate = f._rate, l._seek = 0, l._rateSeek = 0, l._paused = !0, l._ended = !0, l._sprite = "__default", l._id = ++o._counter, l;
        },
        /**
         * HTML5 Audio error listener callback.
         */
        _errorListener: function() {
          var l = this;
          l._parent._emit("loaderror", l._id, l._node.error ? l._node.error.code : 0), l._node.removeEventListener("error", l._errorFn, !1);
        },
        /**
         * HTML5 Audio canplaythrough listener callback.
         */
        _loadListener: function() {
          var l = this, f = l._parent;
          f._duration = Math.ceil(l._node.duration * 10) / 10, Object.keys(f._sprite).length === 0 && (f._sprite = { __default: [0, f._duration * 1e3] }), f._state !== "loaded" && (f._state = "loaded", f._emit("load"), f._loadQueue()), l._node.removeEventListener(o._canPlayEvent, l._loadFn, !1);
        },
        /**
         * HTML5 Audio ended listener callback.
         */
        _endListener: function() {
          var l = this, f = l._parent;
          f._duration === 1 / 0 && (f._duration = Math.ceil(l._node.duration * 10) / 10, f._sprite.__default[1] === 1 / 0 && (f._sprite.__default[1] = f._duration * 1e3), f._ended(l)), l._node.removeEventListener("ended", l._endFn, !1);
        }
      };
      var c = {}, d = function(l) {
        var f = l._src;
        if (c[f]) {
          l._duration = c[f].duration, g(l);
          return;
        }
        if (/^data:[^;]+;base64,/.test(f)) {
          for (var v = atob(f.split(",")[1]), w = new Uint8Array(v.length), k = 0; k < v.length; ++k)
            w[k] = v.charCodeAt(k);
          h(w.buffer, l);
        } else {
          var x = new XMLHttpRequest();
          x.open(l._xhr.method, f, !0), x.withCredentials = l._xhr.withCredentials, x.responseType = "arraybuffer", l._xhr.headers && Object.keys(l._xhr.headers).forEach(function(A) {
            x.setRequestHeader(A, l._xhr.headers[A]);
          }), x.onload = function() {
            var A = (x.status + "")[0];
            if (A !== "0" && A !== "2" && A !== "3") {
              l._emit("loaderror", null, "Failed loading audio file with status: " + x.status + ".");
              return;
            }
            h(x.response, l);
          }, x.onerror = function() {
            l._webAudio && (l._html5 = !0, l._webAudio = !1, l._sounds = [], delete c[f], l.load());
          }, p(x);
        }
      }, p = function(l) {
        try {
          l.send();
        } catch {
          l.onerror();
        }
      }, h = function(l, f) {
        var v = function() {
          f._emit("loaderror", null, "Decoding audio data failed.");
        }, w = function(k) {
          k && f._sounds.length > 0 ? (c[f._src] = k, g(f, k)) : v();
        };
        typeof Promise < "u" && o.ctx.decodeAudioData.length === 1 ? o.ctx.decodeAudioData(l).then(w).catch(v) : o.ctx.decodeAudioData(l, w, v);
      }, g = function(l, f) {
        f && !l._duration && (l._duration = f.duration), Object.keys(l._sprite).length === 0 && (l._sprite = { __default: [0, l._duration * 1e3] }), l._state !== "loaded" && (l._state = "loaded", l._emit("load"), l._loadQueue());
      }, S = function() {
        if (o.usingWebAudio) {
          try {
            typeof AudioContext < "u" ? o.ctx = new AudioContext() : typeof webkitAudioContext < "u" ? o.ctx = new webkitAudioContext() : o.usingWebAudio = !1;
          } catch {
            o.usingWebAudio = !1;
          }
          o.ctx || (o.usingWebAudio = !1);
          var l = /iP(hone|od|ad)/.test(o._navigator && o._navigator.platform), f = o._navigator && o._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), v = f ? parseInt(f[1], 10) : null;
          if (l && v && v < 9) {
            var w = /safari/.test(o._navigator && o._navigator.userAgent.toLowerCase());
            o._navigator && !w && (o.usingWebAudio = !1);
          }
          o.usingWebAudio && (o.masterGain = typeof o.ctx.createGain > "u" ? o.ctx.createGainNode() : o.ctx.createGain(), o.masterGain.gain.setValueAtTime(o._muted ? 0 : o._volume, o.ctx.currentTime), o.masterGain.connect(o.ctx.destination)), o._setup();
        }
      };
      e.Howler = o, e.Howl = i, typeof ri < "u" ? (ri.HowlerGlobal = n, ri.Howler = o, ri.Howl = i, ri.Sound = a) : typeof window < "u" && (window.HowlerGlobal = n, window.Howler = o, window.Howl = i, window.Sound = a);
    })();
    /*!
     *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
     *  
     *  howler.js v2.2.4
     *  howlerjs.com
     *
     *  (c) 2013-2020, James Simpson of GoldFire Studios
     *  goldfirestudios.com
     *
     *  MIT License
     */
    (function() {
      HowlerGlobal.prototype._pos = [0, 0, 0], HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0], HowlerGlobal.prototype.stereo = function(o) {
        var i = this;
        if (!i.ctx || !i.ctx.listener)
          return i;
        for (var a = i._howls.length - 1; a >= 0; a--)
          i._howls[a].stereo(o);
        return i;
      }, HowlerGlobal.prototype.pos = function(o, i, a) {
        var c = this;
        if (!c.ctx || !c.ctx.listener)
          return c;
        if (i = typeof i != "number" ? c._pos[1] : i, a = typeof a != "number" ? c._pos[2] : a, typeof o == "number")
          c._pos = [o, i, a], typeof c.ctx.listener.positionX < "u" ? (c.ctx.listener.positionX.setTargetAtTime(c._pos[0], Howler.ctx.currentTime, 0.1), c.ctx.listener.positionY.setTargetAtTime(c._pos[1], Howler.ctx.currentTime, 0.1), c.ctx.listener.positionZ.setTargetAtTime(c._pos[2], Howler.ctx.currentTime, 0.1)) : c.ctx.listener.setPosition(c._pos[0], c._pos[1], c._pos[2]);
        else
          return c._pos;
        return c;
      }, HowlerGlobal.prototype.orientation = function(o, i, a, c, d, p) {
        var h = this;
        if (!h.ctx || !h.ctx.listener)
          return h;
        var g = h._orientation;
        if (i = typeof i != "number" ? g[1] : i, a = typeof a != "number" ? g[2] : a, c = typeof c != "number" ? g[3] : c, d = typeof d != "number" ? g[4] : d, p = typeof p != "number" ? g[5] : p, typeof o == "number")
          h._orientation = [o, i, a, c, d, p], typeof h.ctx.listener.forwardX < "u" ? (h.ctx.listener.forwardX.setTargetAtTime(o, Howler.ctx.currentTime, 0.1), h.ctx.listener.forwardY.setTargetAtTime(i, Howler.ctx.currentTime, 0.1), h.ctx.listener.forwardZ.setTargetAtTime(a, Howler.ctx.currentTime, 0.1), h.ctx.listener.upX.setTargetAtTime(c, Howler.ctx.currentTime, 0.1), h.ctx.listener.upY.setTargetAtTime(d, Howler.ctx.currentTime, 0.1), h.ctx.listener.upZ.setTargetAtTime(p, Howler.ctx.currentTime, 0.1)) : h.ctx.listener.setOrientation(o, i, a, c, d, p);
        else
          return g;
        return h;
      }, Howl.prototype.init = /* @__PURE__ */ (function(o) {
        return function(i) {
          var a = this;
          return a._orientation = i.orientation || [1, 0, 0], a._stereo = i.stereo || null, a._pos = i.pos || null, a._pannerAttr = {
            coneInnerAngle: typeof i.coneInnerAngle < "u" ? i.coneInnerAngle : 360,
            coneOuterAngle: typeof i.coneOuterAngle < "u" ? i.coneOuterAngle : 360,
            coneOuterGain: typeof i.coneOuterGain < "u" ? i.coneOuterGain : 0,
            distanceModel: typeof i.distanceModel < "u" ? i.distanceModel : "inverse",
            maxDistance: typeof i.maxDistance < "u" ? i.maxDistance : 1e4,
            panningModel: typeof i.panningModel < "u" ? i.panningModel : "HRTF",
            refDistance: typeof i.refDistance < "u" ? i.refDistance : 1,
            rolloffFactor: typeof i.rolloffFactor < "u" ? i.rolloffFactor : 1
          }, a._onstereo = i.onstereo ? [{ fn: i.onstereo }] : [], a._onpos = i.onpos ? [{ fn: i.onpos }] : [], a._onorientation = i.onorientation ? [{ fn: i.onorientation }] : [], o.call(this, i);
        };
      })(Howl.prototype.init), Howl.prototype.stereo = function(o, i) {
        var a = this;
        if (!a._webAudio)
          return a;
        if (a._state !== "loaded")
          return a._queue.push({
            event: "stereo",
            action: function() {
              a.stereo(o, i);
            }
          }), a;
        var c = typeof Howler.ctx.createStereoPanner > "u" ? "spatial" : "stereo";
        if (typeof i > "u")
          if (typeof o == "number")
            a._stereo = o, a._pos = [o, 0, 0];
          else
            return a._stereo;
        for (var d = a._getSoundIds(i), p = 0; p < d.length; p++) {
          var h = a._soundById(d[p]);
          if (h)
            if (typeof o == "number")
              h._stereo = o, h._pos = [o, 0, 0], h._node && (h._pannerAttr.panningModel = "equalpower", (!h._panner || !h._panner.pan) && n(h, c), c === "spatial" ? typeof h._panner.positionX < "u" ? (h._panner.positionX.setValueAtTime(o, Howler.ctx.currentTime), h._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime), h._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime)) : h._panner.setPosition(o, 0, 0) : h._panner.pan.setValueAtTime(o, Howler.ctx.currentTime)), a._emit("stereo", h._id);
            else
              return h._stereo;
        }
        return a;
      }, Howl.prototype.pos = function(o, i, a, c) {
        var d = this;
        if (!d._webAudio)
          return d;
        if (d._state !== "loaded")
          return d._queue.push({
            event: "pos",
            action: function() {
              d.pos(o, i, a, c);
            }
          }), d;
        if (i = typeof i != "number" ? 0 : i, a = typeof a != "number" ? -0.5 : a, typeof c > "u")
          if (typeof o == "number")
            d._pos = [o, i, a];
          else
            return d._pos;
        for (var p = d._getSoundIds(c), h = 0; h < p.length; h++) {
          var g = d._soundById(p[h]);
          if (g)
            if (typeof o == "number")
              g._pos = [o, i, a], g._node && ((!g._panner || g._panner.pan) && n(g, "spatial"), typeof g._panner.positionX < "u" ? (g._panner.positionX.setValueAtTime(o, Howler.ctx.currentTime), g._panner.positionY.setValueAtTime(i, Howler.ctx.currentTime), g._panner.positionZ.setValueAtTime(a, Howler.ctx.currentTime)) : g._panner.setPosition(o, i, a)), d._emit("pos", g._id);
            else
              return g._pos;
        }
        return d;
      }, Howl.prototype.orientation = function(o, i, a, c) {
        var d = this;
        if (!d._webAudio)
          return d;
        if (d._state !== "loaded")
          return d._queue.push({
            event: "orientation",
            action: function() {
              d.orientation(o, i, a, c);
            }
          }), d;
        if (i = typeof i != "number" ? d._orientation[1] : i, a = typeof a != "number" ? d._orientation[2] : a, typeof c > "u")
          if (typeof o == "number")
            d._orientation = [o, i, a];
          else
            return d._orientation;
        for (var p = d._getSoundIds(c), h = 0; h < p.length; h++) {
          var g = d._soundById(p[h]);
          if (g)
            if (typeof o == "number")
              g._orientation = [o, i, a], g._node && (g._panner || (g._pos || (g._pos = d._pos || [0, 0, -0.5]), n(g, "spatial")), typeof g._panner.orientationX < "u" ? (g._panner.orientationX.setValueAtTime(o, Howler.ctx.currentTime), g._panner.orientationY.setValueAtTime(i, Howler.ctx.currentTime), g._panner.orientationZ.setValueAtTime(a, Howler.ctx.currentTime)) : g._panner.setOrientation(o, i, a)), d._emit("orientation", g._id);
            else
              return g._orientation;
        }
        return d;
      }, Howl.prototype.pannerAttr = function() {
        var o = this, i = arguments, a, c, d;
        if (!o._webAudio)
          return o;
        if (i.length === 0)
          return o._pannerAttr;
        if (i.length === 1)
          if (typeof i[0] == "object")
            a = i[0], typeof c > "u" && (a.pannerAttr || (a.pannerAttr = {
              coneInnerAngle: a.coneInnerAngle,
              coneOuterAngle: a.coneOuterAngle,
              coneOuterGain: a.coneOuterGain,
              distanceModel: a.distanceModel,
              maxDistance: a.maxDistance,
              refDistance: a.refDistance,
              rolloffFactor: a.rolloffFactor,
              panningModel: a.panningModel
            }), o._pannerAttr = {
              coneInnerAngle: typeof a.pannerAttr.coneInnerAngle < "u" ? a.pannerAttr.coneInnerAngle : o._coneInnerAngle,
              coneOuterAngle: typeof a.pannerAttr.coneOuterAngle < "u" ? a.pannerAttr.coneOuterAngle : o._coneOuterAngle,
              coneOuterGain: typeof a.pannerAttr.coneOuterGain < "u" ? a.pannerAttr.coneOuterGain : o._coneOuterGain,
              distanceModel: typeof a.pannerAttr.distanceModel < "u" ? a.pannerAttr.distanceModel : o._distanceModel,
              maxDistance: typeof a.pannerAttr.maxDistance < "u" ? a.pannerAttr.maxDistance : o._maxDistance,
              refDistance: typeof a.pannerAttr.refDistance < "u" ? a.pannerAttr.refDistance : o._refDistance,
              rolloffFactor: typeof a.pannerAttr.rolloffFactor < "u" ? a.pannerAttr.rolloffFactor : o._rolloffFactor,
              panningModel: typeof a.pannerAttr.panningModel < "u" ? a.pannerAttr.panningModel : o._panningModel
            });
          else
            return d = o._soundById(parseInt(i[0], 10)), d ? d._pannerAttr : o._pannerAttr;
        else i.length === 2 && (a = i[0], c = parseInt(i[1], 10));
        for (var p = o._getSoundIds(c), h = 0; h < p.length; h++)
          if (d = o._soundById(p[h]), d) {
            var g = d._pannerAttr;
            g = {
              coneInnerAngle: typeof a.coneInnerAngle < "u" ? a.coneInnerAngle : g.coneInnerAngle,
              coneOuterAngle: typeof a.coneOuterAngle < "u" ? a.coneOuterAngle : g.coneOuterAngle,
              coneOuterGain: typeof a.coneOuterGain < "u" ? a.coneOuterGain : g.coneOuterGain,
              distanceModel: typeof a.distanceModel < "u" ? a.distanceModel : g.distanceModel,
              maxDistance: typeof a.maxDistance < "u" ? a.maxDistance : g.maxDistance,
              refDistance: typeof a.refDistance < "u" ? a.refDistance : g.refDistance,
              rolloffFactor: typeof a.rolloffFactor < "u" ? a.rolloffFactor : g.rolloffFactor,
              panningModel: typeof a.panningModel < "u" ? a.panningModel : g.panningModel
            };
            var S = d._panner;
            S || (d._pos || (d._pos = o._pos || [0, 0, -0.5]), n(d, "spatial"), S = d._panner), S.coneInnerAngle = g.coneInnerAngle, S.coneOuterAngle = g.coneOuterAngle, S.coneOuterGain = g.coneOuterGain, S.distanceModel = g.distanceModel, S.maxDistance = g.maxDistance, S.refDistance = g.refDistance, S.rolloffFactor = g.rolloffFactor, S.panningModel = g.panningModel;
          }
        return o;
      }, Sound.prototype.init = /* @__PURE__ */ (function(o) {
        return function() {
          var i = this, a = i._parent;
          i._orientation = a._orientation, i._stereo = a._stereo, i._pos = a._pos, i._pannerAttr = a._pannerAttr, o.call(this), i._stereo ? a.stereo(i._stereo) : i._pos && a.pos(i._pos[0], i._pos[1], i._pos[2], i._id);
        };
      })(Sound.prototype.init), Sound.prototype.reset = /* @__PURE__ */ (function(o) {
        return function() {
          var i = this, a = i._parent;
          return i._orientation = a._orientation, i._stereo = a._stereo, i._pos = a._pos, i._pannerAttr = a._pannerAttr, i._stereo ? a.stereo(i._stereo) : i._pos ? a.pos(i._pos[0], i._pos[1], i._pos[2], i._id) : i._panner && (i._panner.disconnect(0), i._panner = void 0, a._refreshBuffer(i)), o.call(this);
        };
      })(Sound.prototype.reset);
      var n = function(o, i) {
        i = i || "spatial", i === "spatial" ? (o._panner = Howler.ctx.createPanner(), o._panner.coneInnerAngle = o._pannerAttr.coneInnerAngle, o._panner.coneOuterAngle = o._pannerAttr.coneOuterAngle, o._panner.coneOuterGain = o._pannerAttr.coneOuterGain, o._panner.distanceModel = o._pannerAttr.distanceModel, o._panner.maxDistance = o._pannerAttr.maxDistance, o._panner.refDistance = o._pannerAttr.refDistance, o._panner.rolloffFactor = o._pannerAttr.rolloffFactor, o._panner.panningModel = o._pannerAttr.panningModel, typeof o._panner.positionX < "u" ? (o._panner.positionX.setValueAtTime(o._pos[0], Howler.ctx.currentTime), o._panner.positionY.setValueAtTime(o._pos[1], Howler.ctx.currentTime), o._panner.positionZ.setValueAtTime(o._pos[2], Howler.ctx.currentTime)) : o._panner.setPosition(o._pos[0], o._pos[1], o._pos[2]), typeof o._panner.orientationX < "u" ? (o._panner.orientationX.setValueAtTime(o._orientation[0], Howler.ctx.currentTime), o._panner.orientationY.setValueAtTime(o._orientation[1], Howler.ctx.currentTime), o._panner.orientationZ.setValueAtTime(o._orientation[2], Howler.ctx.currentTime)) : o._panner.setOrientation(o._orientation[0], o._orientation[1], o._orientation[2])) : (o._panner = Howler.ctx.createStereoPanner(), o._panner.pan.setValueAtTime(o._stereo, Howler.ctx.currentTime)), o._panner.connect(o._node), o._paused || o._parent.pause(o._id, !0).play(o._id, !0);
      };
    })();
  })(pc)), pc;
}
var cM = uM();
const dM = /* @__PURE__ */ pg(cM), { Howl: AS } = dM, ld = 500, Et = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let dr = {}, fi = !1, ud = "";
function wi() {
  return typeof AS == "function";
}
function mc(e, n = 50) {
  const o = Number(e), i = Number.isFinite(o) ? o : n;
  return Math.min(1, Math.max(0, i / 100));
}
function CS(e) {
  return new AS({
    src: [e],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function PS(e, n, o = ld) {
  if (e)
    try {
      const i = typeof e.volume == "function" ? e.volume() : 0;
      e.fade(i, n, o);
    } catch {
      try {
        e.volume(n);
      } catch {
      }
    }
}
function Ha(e, { unload: n = !1 } = {}) {
  var o;
  e && (PS(e, 0, Math.min(ld, 300)), (o = globalThis.setTimeout) == null || o.call(globalThis, () => {
    try {
      e.pause(), n && e.unload();
    } catch {
    }
  }, Math.min(ld, 320)));
}
function fM(e) {
  return !(e != null && e.streamUrl) || !wi() ? null : ((!Et.music || Et.music.__synapseSrc !== e.streamUrl) && (Ha(Et.music, { unload: !0 }), Et.music = CS(e.streamUrl), Et.music.__synapseSrc = e.streamUrl), Et.music);
}
function pM(e) {
  if (!(e != null && e.streamUrl) || !wi()) return null;
  const n = e.id || e.streamUrl, o = Et.ambient.get(n);
  if (o && o.__synapseSrc === e.streamUrl) return o;
  Ha(o, { unload: !0 });
  const i = CS(e.streamUrl);
  return i.__synapseSrc = e.streamUrl, Et.ambient.set(n, i), i;
}
function mM() {
  return [
    Et.music,
    ...Et.ambient.values()
  ].filter(Boolean);
}
function ES() {
  mM().forEach((e) => Ha(e));
}
function hM(e) {
  for (const [n, o] of Et.ambient.entries())
    e.has(n) || (Ha(o, { unload: !0 }), Et.ambient.delete(n));
}
function sg(e, n) {
  if (e)
    try {
      e.playing() || e.play(), PS(e, n), ud = "";
    } catch (o) {
      ud = (o == null ? void 0 : o.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function yM(e = {}) {
  dr = { ...dr, ...e };
  const n = La(dr);
  if (!wi()) return pa(n);
  if (!fi)
    return ES(), pa(n);
  const o = fM(n.musicTrack), i = mc(dr.musicVolume, 60), a = mc(dr.ambientVolume, 50), c = /* @__PURE__ */ new Set(), d = [];
  return n.ambientLayers.forEach((p) => {
    var f;
    const h = p.id || p.streamUrl;
    c.add(h);
    const g = pM(p), S = Number((f = dr.audioChannels) == null ? void 0 : f[p.id]), l = Number.isFinite(S) ? mc(S, 0) : Math.min(1, Math.max(0, a * (p.volumeBias ?? 1)));
    d.push([g, l]);
  }), hM(c), sg(o, i), d.forEach(([p, h]) => sg(p, h)), pa(n);
}
function gM(e) {
  return fi = !!e, fi || ES(), fi;
}
function pa(e = La(dr)) {
  var n, o, i, a;
  return {
    available: wi(),
    playing: fi && wi(),
    musicTitle: ((n = e.musicTrack) == null ? void 0 : n.title) || "",
    musicArtist: ((o = e.musicTrack) == null ? void 0 : o.artist) || "",
    musicPageUrl: ((i = e.musicTrack) == null ? void 0 : i.pageUrl) || "",
    musicAttribution: ((a = e.musicTrack) == null ? void 0 : a.attribution) || "",
    ambientTitles: e.ambientLayers.map((c) => c.title).filter(Boolean),
    ambientPageUrls: e.ambientLayers.map((c) => c.pageUrl).filter(Boolean),
    ambientAttributions: e.ambientLayers.map((c) => c.attribution).filter(Boolean),
    error: ud
  };
}
const vM = "synapse.focusRoom.audioPrefs.v1";
function SM(e) {
  var n;
  try {
    (n = globalThis.localStorage) == null || n.setItem(vM, JSON.stringify({
      musicType: e.musicType,
      ambientSound: e.ambientSound,
      musicVolume: e.musicVolume,
      ambientVolume: e.ambientVolume,
      audioChannels: e.audioChannels,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
  } catch {
  }
}
function wM() {
  const e = Q((h) => h.musicType), n = Q((h) => h.ambientSound), o = Q((h) => h.musicVolume), i = Q((h) => h.ambientVolume), a = Q((h) => h.audioChannels), c = Q((h) => h.audioPlaying), [d, p] = C.useState(() => pa(La({
    musicType: e,
    ambientSound: n
  })));
  return C.useEffect(() => {
    const h = { musicType: e, ambientSound: n, musicVolume: o, ambientVolume: i, audioChannels: a };
    let g = !1;
    return gM(c), SM(h), yM(h).then((S) => {
      g || p(S);
    }), () => {
      g = !0;
    };
  }, [n, i, a, c, e, o]), d;
}
function xM() {
  const e = Q(), n = C.useCallback(async (i = "", a = "", c = {}) => {
    var S;
    e.pauseTimer({ pauseAudio: !0 }), e.closeSummary();
    const d = typeof i == "string" || typeof i == "number" ? i : "", p = typeof a == "string" ? a : "", h = _M(p, c), g = String(d || e.selectedMaterialId || ((S = e.selectedMaterial) == null ? void 0 : S.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const l = globalThis.returnFromFocusRoomToWorkspace(g, h);
        l && typeof l.then == "function" && await l, ag(h.action || p, h);
        return;
      } catch (l) {
        console.error("Could not return from Focus Room:", l);
      }
    globalThis.location.hash = "", ag(h.action || p, h);
  }, [e]), o = C.useMemo(() => ({
    answerFocusQuizQuestion: e.answerQuizQuestion,
    askFocusAssistant: e.askAssistant,
    checkFocusQuizQuestion: e.checkQuizQuestion,
    closeFocusSummary: e.closeSummary,
    endFocusRoomSession: e.endSession,
    flipFocusFlashcard: e.flipFlashcard,
    pauseFocusRoomTimer: e.pauseTimer,
    rateFocusFlashcard: e.rateFlashcard,
    resetFocusRoomTimer: e.resetTimer,
    returnFromFocusRoom: n,
    selectFocusScene: e.selectScene,
    setFocusDuration: e.setPomodoroDuration,
    setFocusFlashcardIndex: e.setFlashcardIndex,
    setFocusPanelTab: e.setPanelTab,
    showFocusStudyHistory: () => {
      e.openStudyPanel("history");
    },
    skipFocusRoomTimer: e.skipTimer,
    startFocusRoomSession: e.startSession,
    startFocusRoomTimer: e.startTimer,
    toggleFocusRoomAudioPlayback: e.toggleAudio,
    toggleFocusLearningPanel: e.toggleAIPanel,
    toggleFocusTask: e.toggleTask,
    updateFocusPlanTask: e.updatePlanTask,
    updateFocusGoal: e.setStudyGoal,
    updateFocusSound: e.setSound
  }), [n, e]);
  return globalThis.__synapseFocusRoomApi = o, C.useEffect(() => {
    globalThis.__synapseFocusRoomApi = o;
  }, [o]), {
    ...e,
    returnToWorkspace: n
  };
}
function bS(e) {
  const n = String(e || "").trim().toLowerCase();
  return ["flashcards", "quiz", "assistant", "mindmap", "timeline", "source", "notes"].includes(n) ? n : "";
}
function _M(e, n = {}) {
  const o = n && typeof n == "object" && !Array.isArray(n) ? n : {}, i = bS(e || o.action);
  return {
    ...o,
    action: i,
    sourceId: String(o.sourceId || o.source_id || ""),
    sourceIndex: Number(o.sourceIndex || o.source_index || 0) || 0,
    sourceLabel: String(o.sourceLabel || o.source_label || ""),
    sectionTitle: String(o.sectionTitle || o.section_title || ""),
    highlightId: String(o.highlightId || o.highlight_id || ""),
    excerpt: String(o.excerpt || "").slice(0, 1600)
  };
}
function ag(e, n = {}) {
  const o = bS(e);
  if (!o) return;
  const i = () => {
    if (o === "source") {
      typeof globalThis.toggleSourceViewer == "function" && globalThis.toggleSourceViewer(!0), n.sourceId && typeof globalThis.selectSourceItem == "function" && globalThis.selectSourceItem(n.sourceId);
      return;
    }
    if (o === "notes") {
      typeof globalThis.showFullSummary == "function" && globalThis.showFullSummary();
      return;
    }
    if (o === "assistant") {
      typeof globalThis.openAssistant == "function" && globalThis.openAssistant();
      return;
    }
    typeof globalThis.switchTool == "function" && globalThis.switchTool(o);
  };
  typeof globalThis.requestAnimationFrame == "function" ? globalThis.requestAnimationFrame(i) : setTimeout(i, 0);
}
function TM(e = 3e3) {
  const n = Q((i) => i.setIdle), o = Q((i) => i.isIdle);
  return C.useEffect(() => {
    let i;
    const a = () => {
      n(!1), clearTimeout(i), i = setTimeout(() => n(!0), e);
    };
    return window.addEventListener("mousemove", a), window.addEventListener("keydown", a), window.addEventListener("click", a), a(), () => {
      clearTimeout(i), window.removeEventListener("mousemove", a), window.removeEventListener("keydown", a), window.removeEventListener("click", a);
    };
  }, [e, n]), o;
}
function kM() {
  const e = Q((i) => i.timerState || (i.timerStatus === "studying" ? "running" : i.timerStatus)), n = Q((i) => i.view), o = Q((i) => i.tickTimer);
  C.useEffect(() => {
    if (n !== "session" || e !== "running" || typeof window > "u") return;
    let i = !0;
    const a = () => {
      i && o();
    }, c = window.setInterval(a, 1e3), d = () => {
      document.visibilityState === "visible" && a();
    };
    return document.addEventListener("visibilitychange", d), a(), () => {
      i = !1, window.clearInterval(c), document.removeEventListener("visibilitychange", d);
    };
  }, [o, e, n]);
}
function AM() {
  const e = Q((n) => n.selectedScene);
  return _r(e);
}
function CM(e) {
  return e.view !== "session" || e.summaryRecord ? null : {
    materialId: "focus-room",
    view: e.view,
    panelTab: e.panelTab,
    selectedScene: e.selectedScene,
    musicType: e.musicType,
    ambientSound: e.ambientSound,
    musicVolume: e.musicVolume,
    ambientVolume: e.ambientVolume,
    audioChannels: e.audioChannels,
    pomodoroDuration: e.pomodoroDuration,
    timerState: e.timerState,
    timerMode: e.timerMode,
    timerAnchorAtMs: e.timerAnchorAtMs,
    timerDurationSeconds: e.timerDurationSeconds,
    timerStatus: e.timerStatus,
    studyGoal: e.studyGoal,
    studyPlan: e.studyPlan,
    currentSession: e.currentSession,
    elapsedSeconds: e.elapsedSeconds,
    startedAt: e.startedAt
  };
}
function PM() {
  const [e, n] = C.useState(""), [o, i] = C.useState(!1), [a, c] = C.useState(!1), d = Q((A) => A.view), p = TM(3e3), h = AM(), g = wM(), S = xM();
  kM();
  const l = Q(Qx(CM)), f = Q((A) => A.summaryRecord), v = Q((A) => A.endSession), w = Q((A) => A.initializeFocusRoom);
  C.useEffect(() => {
    w();
  }, [w]), C.useEffect(() => {
    l != null && l.materialId && zd(l.materialId, l);
  }, [l]), C.useEffect(() => {
    d === "session" || !f || c0("focus-room");
  }, [f, d]), C.useEffect(() => {
    d !== "session" && (i(!1), n(""), c(!1));
  }, [d]), C.useEffect(() => {
    const A = (E) => {
      E.key === "Escape" && (o ? (E.preventDefault(), i(!1)) : e ? n("") : a && c(!1));
    };
    return window.addEventListener("keydown", A), () => window.removeEventListener("keydown", A);
  }, [a, o, e]);
  const k = (...A) => {
    S.returnToWorkspace(...A);
  }, x = async () => {
    c(!1), i(!1), n(""), v(), await k();
  };
  return /* @__PURE__ */ T.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${p ? "is-idle" : ""}`.trim(),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ T.jsx(CC, { scene: h }),
        /* @__PURE__ */ T.jsx(Fa, { mode: "wait", children: d === "session" ? /* @__PURE__ */ T.jsxs(
          Kn.div,
          {
            className: "focus-room-view focus-session-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: Ud,
            children: [
              o ? /* @__PURE__ */ T.jsx("button", { type: "button", className: "focus-mode-exit-hit-area", onClick: () => i(!1), children: "Exit Focus Mode" }) : /* @__PURE__ */ T.jsx(MP, { onWorkspace: k, onOpenTrail: () => n("trail"), onOpenCompanion: () => n("companion"), onOpenSettings: () => n("settings"), onExit: () => c(!0) }),
              /* @__PURE__ */ T.jsx("section", { className: `focus-session-stage ${o ? "is-focus-mode" : ""}`.trim(), children: /* @__PURE__ */ T.jsx("div", { className: "focus-session-grid", children: /* @__PURE__ */ T.jsx(bP, {}) }) }),
              o ? /* @__PURE__ */ T.jsx(lM, { onExit: () => i(!1) }) : /* @__PURE__ */ T.jsx(DP, { audioState: g, onFocusMode: () => i(!0) }),
              o ? null : /* @__PURE__ */ T.jsx(sM, { audioState: g, utilityPanel: e, onClose: () => n(""), onWorkspace: k }),
              /* @__PURE__ */ T.jsx(mb, {}),
              /* @__PURE__ */ T.jsx(EM, { open: a, onClose: () => c(!1), onConfirm: x })
            ]
          },
          "session"
        ) : null })
      ]
    }
  );
}
function EM({ open: e, onClose: n, onConfirm: o }) {
  return e ? /* @__PURE__ */ T.jsx("div", { className: "focus-exit-overlay", role: "presentation", children: /* @__PURE__ */ T.jsxs("div", { className: "focus-exit-dialog liquid-glass", role: "dialog", "aria-modal": "true", "aria-labelledby": "focus-exit-title", children: [
    /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Leave this room?" }),
    /* @__PURE__ */ T.jsx("h2", { id: "focus-exit-title", children: "End focus session" }),
    /* @__PURE__ */ T.jsx("p", { children: "Your focused time will be saved to your Focus Trail." }),
    /* @__PURE__ */ T.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ T.jsx(be, { onClick: n, children: "Continue focusing" }),
      /* @__PURE__ */ T.jsx(be, { variant: "primary", onClick: o, children: "End and exit" })
    ] })
  ] }) }) : null;
}
let hc = null;
function bM(e, n) {
  const o = globalThis.__synapseFocusRoomApi || {};
  if (typeof o[e] != "function") {
    console.warn(`Synapse Focus Room action "${e}" is not available yet.`);
    return;
  }
  return o[e](...n);
}
function MM() {
  Object.entries({
    answerFocusQuizQuestion: "answerFocusQuizQuestion",
    askFocusAssistant: "askFocusAssistant",
    checkFocusQuizQuestion: "checkFocusQuizQuestion",
    closeFocusSummary: "closeFocusSummary",
    endFocusRoomSession: "endFocusRoomSession",
    flipFocusFlashcard: "flipFocusFlashcard",
    pauseFocusRoomTimer: "pauseFocusRoomTimer",
    rateFocusFlashcard: "rateFocusFlashcard",
    resetFocusRoomTimer: "resetFocusRoomTimer",
    returnFromFocusRoom: "returnFromFocusRoom",
    selectFocusScene: "selectFocusScene",
    setFocusDuration: "setFocusDuration",
    setFocusFlashcardIndex: "setFocusFlashcardIndex",
    setFocusPanelTab: "setFocusPanelTab",
    showFocusStudyHistory: "showFocusStudyHistory",
    skipFocusRoomTimer: "skipFocusRoomTimer",
    startFocusRoomSession: "startFocusRoomSession",
    startFocusRoomTimer: "startFocusRoomTimer",
    toggleFocusRoomAudioPlayback: "toggleFocusRoomAudioPlayback",
    toggleFocusLearningPanel: "toggleFocusLearningPanel",
    toggleFocusTask: "toggleFocusTask",
    updateFocusPlanTask: "updateFocusPlanTask",
    updateFocusGoal: "updateFocusGoal",
    updateFocusSound: "updateFocusSound"
  }).forEach(([n, o]) => {
    globalThis[n] = (...i) => bM(o, i);
  });
}
function RM(e = {}) {
  MM();
  const n = e.root || document.getElementById("focusRoomRoot");
  if (!n)
    throw new Error("Focus Room root element was not found.");
  hc || (hc = Hx.createRoot(n), hc.render(
    pn.createElement(
      pn.StrictMode,
      null,
      pn.createElement(PM)
    )
  ));
}
const DM = "synapse.generated.history.v6", MS = "synapse.active.generated.v6", NM = "synapse.flashcards.deck.v1", IM = "synapse.quiz.history.v1", jM = "synapse.focusRoom.return-target.v1";
function sf(e, n) {
  var o;
  try {
    const i = (o = globalThis.localStorage) == null ? void 0 : o.getItem(e);
    if (!i) return n;
    const a = JSON.parse(i);
    return a ?? n;
  } catch (i) {
    return console.warn(`Could not read ${e}:`, i), n;
  }
}
function FM(e, n) {
  var o;
  try {
    return (o = globalThis.localStorage) == null || o.setItem(e, n), !0;
  } catch (i) {
    return console.warn(`Could not write ${e}:`, i), !1;
  }
}
function OM(e, n) {
  var o;
  try {
    return (o = globalThis.localStorage) == null || o.setItem(e, JSON.stringify(n)), !0;
  } catch (i) {
    return console.warn(`Could not write ${e}:`, i), !1;
  }
}
function RS() {
  const e = sf(DM, []);
  return Array.isArray(e) ? e : [];
}
function LM(e) {
  const n = String((e == null ? void 0 : e.title) || "").trim();
  return n || String((e == null ? void 0 : e.summary) || "").split(/\n+/).map((i) => i.replace(/^#+\s*/, "").trim()).find((i) => i.length > 4) || "Generated Study Notes";
}
function DS(e = {}) {
  return [
    e.id ? `history:${e.id}` : "",
    e.sourceFingerprint ? `fingerprint:${e.sourceFingerprint}` : "",
    e.clientFingerprint ? `fingerprint:${e.clientFingerprint}` : ""
  ].filter(Boolean);
}
function VM(e = {}) {
  const n = sf(NM, {}), i = DS(e).map((a) => n == null ? void 0 : n[a]).find((a) => a && Array.isArray(a.cards) && a.cards.length);
  return (i == null ? void 0 : i.cards) || [];
}
function BM(e = {}) {
  var o;
  const n = String(e.id || "").trim();
  if (n) return `id:${n}`;
  try {
    return `content:${JSON.stringify({
      title: e.title || "",
      createdAt: e.createdAt || "",
      updatedAt: e.updatedAt || "",
      questions: ((o = e.quiz) == null ? void 0 : o.questions) || e.questions || []
    })}`;
  } catch {
    return "";
  }
}
function zM(e = []) {
  return (Array.isArray(e) ? e : []).map((n) => {
    var o;
    return {
      id: n.id,
      title: n.title,
      createdAt: n.createdAt || n.created_at || "",
      updatedAt: n.updatedAt || n.updated_at || "",
      questions: ((o = n.quiz) == null ? void 0 : o.questions) || n.questions || [],
      report: n.report || null
    };
  });
}
function $M(e = {}) {
  const n = sf(IM, {}), i = DS(e).flatMap((c) => Array.isArray(n == null ? void 0 : n[c]) ? n[c] : []), a = /* @__PURE__ */ new Set();
  return zM(i).filter((c) => {
    const d = BM(c);
    return !d || a.has(d) ? !1 : (a.add(d), !0);
  }).sort((c, d) => new Date(d.createdAt || 0) - new Date(c.createdAt || 0));
}
function UM(e = {}) {
  return {
    materialId: String(e.id || e.sourceFingerprint || e.clientFingerprint || "current-material"),
    materialTitle: LM(e),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: e.summary || "",
    sections: e.sections || {},
    flashcards: VM(e),
    quizzes: $M(e),
    mindMap: e.mindMap || e.mind_map || e.brainstorm || null,
    studyPlan: e.studyPlan || [],
    progressHistory: [],
    sources: Array.isArray(e.sources) ? e.sources : [],
    sourceItems: Array.isArray(e.sourceItems) ? e.sourceItems : [],
    sourceHighlights: Array.isArray(e.sourceHighlights || e.source_highlights) ? e.sourceHighlights || e.source_highlights : [],
    sourceFingerprint: e.sourceFingerprint || e.clientFingerprint || "",
    createdAt: e.createdAt || "",
    updatedAt: e.updatedAt || ""
  };
}
function NS() {
  return RS().filter((e) => e && (e.id || e.summary)).map(UM);
}
function IS(e = "") {
  const n = String(e || "");
  return n && NS().find(
    (o) => o.materialId === n || o.sourceFingerprint === n || o.clientFingerprint === n
  ) || null;
}
function jS() {
  var n;
  const e = ((n = globalThis.localStorage) == null ? void 0 : n.getItem(MS)) || "";
  return IS(e);
}
function HM(e = "") {
  var i;
  const n = e || ((i = jS()) == null ? void 0 : i.materialId) || "", o = n ? `/${encodeURIComponent(n)}` : "";
  globalThis.location.hash = `#/focus-room${o}`;
}
function WM(e = "", n = {}) {
  const o = n && typeof n == "object" && !Array.isArray(n) ? n : {};
  return {
    materialId: String(e || ""),
    action: String(o.action || "").trim().toLowerCase(),
    sourceId: String(o.sourceId || o.source_id || ""),
    sourceIndex: Number(o.sourceIndex || o.source_index || 0) || 0,
    sourceLabel: String(o.sourceLabel || o.source_label || ""),
    sectionTitle: String(o.sectionTitle || o.section_title || ""),
    highlightId: String(o.highlightId || o.highlight_id || ""),
    excerpt: String(o.excerpt || "").slice(0, 1600),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function GM(e = "", n = {}) {
  const o = String(e || ""), i = RS().find(
    (d) => String((d == null ? void 0 : d.id) || "") === o || String((d == null ? void 0 : d.sourceFingerprint) || (d == null ? void 0 : d.source_fingerprint) || "") === o || String((d == null ? void 0 : d.clientFingerprint) || (d == null ? void 0 : d.client_fingerprint) || "") === o
  ) || null, a = String((i == null ? void 0 : i.id) || "");
  a && FM(MS, a);
  const c = WM(a, n);
  c.action && OM(jM, c), globalThis.location.href = a ? `index.html?focusReturn=${encodeURIComponent(a)}` : "index.html";
}
function KM() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: jS,
    getSynapseFocusRoomMaterial: IS,
    getSynapseFocusRoomMaterials: NS,
    openSynapseFocusRoom: HM,
    returnFromFocusRoomToWorkspace: GM
  });
}
const FS = document.getElementById("focusRoomRoot");
if (!FS)
  throw new Error("Focus Room root element was not found.");
var cg;
(cg = document.getElementById("focusRoomFallbackTitle")) == null || cg.remove();
globalThis.apiClient = new fg(Fx);
KM();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
RM({ root: FS });
