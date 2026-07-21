function Dx(e, n) {
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
function Nx(e) {
  const o = String(e || "").toLowerCase().split(".");
  if (o.length !== 4 || o.some((a) => !/^\d+$/.test(a))) return !1;
  const i = o.map(Number);
  return i.some((a) => a < 0 || a > 255) ? !1 : i[0] === 10 || i[0] === 172 && i[1] >= 16 && i[1] <= 31 || i[0] === 192 && i[1] === 168;
}
function cg(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function qh(e) {
  return cg(e) || Nx(e);
}
function Ix(e) {
  return !e || cg(e) ? "127.0.0.1" : e;
}
const Fx = (() => {
  var p, m, g, v;
  const { protocol: e, hostname: n, port: o } = window.location, i = String(window.SYNAPSE_BACKEND_PORT || ((m = (p = document.body) == null ? void 0 : p.dataset) == null ? void 0 : m.apiPort) || "8001").trim(), a = `http://${Ix(n)}:${i || "8001"}`, c = String(window.SYNAPSE_API_BASE || ((v = (g = document.body) == null ? void 0 : g.dataset) == null ? void 0 : v.apiBase) || "").replace(/\/+$/, ""), d = `${e}//${window.location.host}`.replace(/\/+$/, "");
  return c && !(qh(n) && o !== i && c === d) ? c : e === "file:" || qh(n) && o !== i ? a : `${e}//${window.location.host}`;
})();
class Vs extends Error {
  constructor(n, { cause: o } = {}) {
    super(n), this.name = "ApiConnectionError", this.cause = o;
  }
}
const em = "synapse.client.id.v1";
function Ln() {
  return globalThis.window || globalThis;
}
function Xr(e, n = 220) {
  return String(e || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
}
function tm() {
  const e = globalThis.crypto || Ln().crypto;
  return e != null && e.randomUUID ? e.randomUUID() : `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
function jx() {
  var n, o;
  const e = Ln();
  try {
    const i = (n = e.localStorage) == null ? void 0 : n.getItem(em);
    if (i) return i;
    const a = tm();
    return (o = e.localStorage) == null || o.setItem(em, a), a;
  } catch {
    return tm();
  }
}
function Ox(e = {}) {
  if (typeof Headers < "u" && e instanceof Headers) {
    const n = {};
    return e.forEach((o, i) => {
      n[i] = o;
    }), n;
  }
  return Array.isArray(e) ? Object.fromEntries(e) : { ...e || {} };
}
class dg {
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
    const o = Ln(), i = Ox(n);
    i["X-Synapse-Client-Id"] = Xr(jx(), 160);
    const a = (d = (c = o.SynapseAuth) == null ? void 0 : c.getStoredSession) == null ? void 0 : d.call(c);
    if (a && typeof a == "object" && (a.accountId && (i["X-Synapse-User-Id"] = Xr(a.accountId, 160)), a.email && (i["X-Synapse-User-Email"] = Xr(a.email, 220)), a.displayName && (i["X-Synapse-User-Name"] = Xr(a.displayName, 180)), a.authMode && (i["X-Synapse-Auth-Mode"] = Xr(a.authMode, 60)), a.role && (i["X-Synapse-User-Role"] = Xr(a.role, 80))), (p = o.SynapseAuth) != null && p.authHeaders && !i.Authorization && !i.authorization)
      try {
        const m = await o.SynapseAuth.authHeaders({});
        m != null && m.Authorization && (i.Authorization = m.Authorization), m != null && m.authorization && (i.authorization = m.authorization);
      } catch (m) {
        console.warn("Synapse auth headers were not attached:", m);
      }
    return i;
  }
  async fetch(n, o = {}) {
    var l;
    const i = this.endpoint(n), { timeoutMs: a, ...c } = o || {};
    c.headers = await this.requestHeaders(c.headers || {});
    const d = Number(a || 0);
    let p = null, m = null, g = null;
    const v = c.signal;
    d > 0 && typeof AbortController < "u" && (p = new AbortController(), g = () => p.abort(), v && (v.aborted ? p.abort() : v.addEventListener("abort", g, { once: !0 })), m = Ln().setTimeout(() => p.abort(), d), c.signal = p.signal);
    try {
      return await this.fetchImpl(i, c);
    } catch (f) {
      throw (l = p == null ? void 0 : p.signal) != null && l.aborted ? new Vs(this.timeoutMessage(d), { cause: f }) : new Vs(this.connectionMessage(), { cause: f });
    } finally {
      m && Ln().clearTimeout(m), v && g && v.removeEventListener("abort", g);
    }
  }
  async warmup({ attempts: n = 2, retryDelayMs: o = 1500, timeoutMs: i = 6e4, maxWaitMs: a = 0, signal: c } = {}) {
    const d = Math.max(1, Math.floor(Number(n) || 1)), p = Math.max(0, Number(a) || 0), m = Date.now();
    let g = null;
    for (let v = 0; v < d; v += 1) {
      const l = Date.now() - m, f = p > 0 ? p - l : 0;
      if (p > 0 && f <= 0) break;
      try {
        const S = await this.fetch("/healthz", {
          method: "GET",
          signal: c,
          timeoutMs: p > 0 ? Math.min(i, f) : i
        });
        if (S != null && S.ok) return S;
        g = new Vs(
          `Synapse hosted service returned ${(S == null ? void 0 : S.status) || "an unexpected status"} while preparing your analysis.`
        );
      } catch (S) {
        g = S;
      }
      if (v < d - 1 && o > 0) {
        const S = p > 0 ? p - (Date.now() - m) : o;
        if (p > 0 && S <= 0) break;
        await new Promise((w) => Ln().setTimeout(w, Math.min(o, S)));
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
      a > 0 && await new Promise((m) => Ln().setTimeout(m, a));
    }
    return d;
  }
}
var ri = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function fg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Iu = { exports: {} }, fe = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var nm;
function Lx() {
  if (nm) return fe;
  nm = 1;
  var e = Symbol.for("react.element"), n = Symbol.for("react.portal"), o = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), d = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), l = Symbol.iterator;
  function f(D) {
    return D === null || typeof D != "object" ? null : (D = l && D[l] || D["@@iterator"], typeof D == "function" ? D : null);
  }
  var S = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, w = Object.assign, T = {};
  function _(D, V, ce) {
    this.props = D, this.context = V, this.refs = T, this.updater = ce || S;
  }
  _.prototype.isReactComponent = {}, _.prototype.setState = function(D, V) {
    if (typeof D != "object" && typeof D != "function" && D != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, D, V, "setState");
  }, _.prototype.forceUpdate = function(D) {
    this.updater.enqueueForceUpdate(this, D, "forceUpdate");
  };
  function A() {
  }
  A.prototype = _.prototype;
  function E(D, V, ce) {
    this.props = D, this.context = V, this.refs = T, this.updater = ce || S;
  }
  var M = E.prototype = new A();
  M.constructor = E, w(M, _.prototype), M.isPureReactComponent = !0;
  var N = Array.isArray, O = Object.prototype.hasOwnProperty, W = { current: null }, K = { key: !0, ref: !0, __self: !0, __source: !0 };
  function G(D, V, ce) {
    var pe, me = {}, ye = null, Ae = null;
    if (V != null) for (pe in V.ref !== void 0 && (Ae = V.ref), V.key !== void 0 && (ye = "" + V.key), V) O.call(V, pe) && !K.hasOwnProperty(pe) && (me[pe] = V[pe]);
    var we = arguments.length - 2;
    if (we === 1) me.children = ce;
    else if (1 < we) {
      for (var Me = Array(we), mt = 0; mt < we; mt++) Me[mt] = arguments[mt + 2];
      me.children = Me;
    }
    if (D && D.defaultProps) for (pe in we = D.defaultProps, we) me[pe] === void 0 && (me[pe] = we[pe]);
    return { $$typeof: e, type: D, key: ye, ref: Ae, props: me, _owner: W.current };
  }
  function L(D, V) {
    return { $$typeof: e, type: D.type, key: V, ref: D.ref, props: D.props, _owner: D._owner };
  }
  function Q(D) {
    return typeof D == "object" && D !== null && D.$$typeof === e;
  }
  function ae(D) {
    var V = { "=": "=0", ":": "=2" };
    return "$" + D.replace(/[=:]/g, function(ce) {
      return V[ce];
    });
  }
  var J = /\/+/g;
  function de(D, V) {
    return typeof D == "object" && D !== null && D.key != null ? ae("" + D.key) : V.toString(36);
  }
  function ue(D, V, ce, pe, me) {
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
    if (Ae) return Ae = D, me = me(Ae), D = pe === "" ? "." + de(Ae, 0) : pe, N(me) ? (ce = "", D != null && (ce = D.replace(J, "$&/") + "/"), ue(me, V, ce, "", function(mt) {
      return mt;
    })) : me != null && (Q(me) && (me = L(me, ce + (!me.key || Ae && Ae.key === me.key ? "" : ("" + me.key).replace(J, "$&/") + "/") + D)), V.push(me)), 1;
    if (Ae = 0, pe = pe === "" ? "." : pe + ":", N(D)) for (var we = 0; we < D.length; we++) {
      ye = D[we];
      var Me = pe + de(ye, we);
      Ae += ue(ye, V, ce, Me, me);
    }
    else if (Me = f(D), typeof Me == "function") for (D = Me.call(D), we = 0; !(ye = D.next()).done; ) ye = ye.value, Me = pe + de(ye, we++), Ae += ue(ye, V, ce, Me, me);
    else if (ye === "object") throw V = String(D), Error("Objects are not valid as a React child (found: " + (V === "[object Object]" ? "object with keys {" + Object.keys(D).join(", ") + "}" : V) + "). If you meant to render a collection of children, use an array instead.");
    return Ae;
  }
  function _e(D, V, ce) {
    if (D == null) return D;
    var pe = [], me = 0;
    return ue(D, pe, "", "", function(ye) {
      return V.call(ce, ye, me++);
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
  var Se = { current: null }, U = { transition: null }, X = { ReactCurrentDispatcher: Se, ReactCurrentBatchConfig: U, ReactCurrentOwner: W };
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
    if (!Q(D)) throw Error("React.Children.only expected to receive a single React element child.");
    return D;
  } }, fe.Component = _, fe.Fragment = o, fe.Profiler = a, fe.PureComponent = E, fe.StrictMode = i, fe.Suspense = m, fe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = X, fe.act = Y, fe.cloneElement = function(D, V, ce) {
    if (D == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + D + ".");
    var pe = w({}, D.props), me = D.key, ye = D.ref, Ae = D._owner;
    if (V != null) {
      if (V.ref !== void 0 && (ye = V.ref, Ae = W.current), V.key !== void 0 && (me = "" + V.key), D.type && D.type.defaultProps) var we = D.type.defaultProps;
      for (Me in V) O.call(V, Me) && !K.hasOwnProperty(Me) && (pe[Me] = V[Me] === void 0 && we !== void 0 ? we[Me] : V[Me]);
    }
    var Me = arguments.length - 2;
    if (Me === 1) pe.children = ce;
    else if (1 < Me) {
      we = Array(Me);
      for (var mt = 0; mt < Me; mt++) we[mt] = arguments[mt + 2];
      pe.children = we;
    }
    return { $$typeof: e, type: D.type, key: me, ref: ye, props: pe, _owner: Ae };
  }, fe.createContext = function(D) {
    return D = { $$typeof: d, _currentValue: D, _currentValue2: D, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, D.Provider = { $$typeof: c, _context: D }, D.Consumer = D;
  }, fe.createElement = G, fe.createFactory = function(D) {
    var V = G.bind(null, D);
    return V.type = D, V;
  }, fe.createRef = function() {
    return { current: null };
  }, fe.forwardRef = function(D) {
    return { $$typeof: p, render: D };
  }, fe.isValidElement = Q, fe.lazy = function(D) {
    return { $$typeof: v, _payload: { _status: -1, _result: D }, _init: ve };
  }, fe.memo = function(D, V) {
    return { $$typeof: g, type: D, compare: V === void 0 ? null : V };
  }, fe.startTransition = function(D) {
    var V = U.transition;
    U.transition = {};
    try {
      D();
    } finally {
      U.transition = V;
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
var rm;
function ad() {
  return rm || (rm = 1, Iu.exports = Lx()), Iu.exports;
}
var C = ad();
const pn = /* @__PURE__ */ fg(C), Tr = /* @__PURE__ */ Dx({
  __proto__: null,
  default: pn
}, [C]);
var Bs = {}, Fu = { exports: {} }, pt = {}, ju = { exports: {} }, Ou = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var om;
function Vx() {
  return om || (om = 1, (function(e) {
    function n(U, X) {
      var Y = U.length;
      U.push(X);
      e: for (; 0 < Y; ) {
        var D = Y - 1 >>> 1, V = U[D];
        if (0 < a(V, X)) U[D] = X, U[Y] = V, Y = D;
        else break e;
      }
    }
    function o(U) {
      return U.length === 0 ? null : U[0];
    }
    function i(U) {
      if (U.length === 0) return null;
      var X = U[0], Y = U.pop();
      if (Y !== X) {
        U[0] = Y;
        e: for (var D = 0, V = U.length, ce = V >>> 1; D < ce; ) {
          var pe = 2 * (D + 1) - 1, me = U[pe], ye = pe + 1, Ae = U[ye];
          if (0 > a(me, Y)) ye < V && 0 > a(Ae, me) ? (U[D] = Ae, U[ye] = Y, D = ye) : (U[D] = me, U[pe] = Y, D = pe);
          else if (ye < V && 0 > a(Ae, Y)) U[D] = Ae, U[ye] = Y, D = ye;
          else break e;
        }
      }
      return X;
    }
    function a(U, X) {
      var Y = U.sortIndex - X.sortIndex;
      return Y !== 0 ? Y : U.id - X.id;
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
    var m = [], g = [], v = 1, l = null, f = 3, S = !1, w = !1, T = !1, _ = typeof setTimeout == "function" ? setTimeout : null, A = typeof clearTimeout == "function" ? clearTimeout : null, E = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function M(U) {
      for (var X = o(g); X !== null; ) {
        if (X.callback === null) i(g);
        else if (X.startTime <= U) i(g), X.sortIndex = X.expirationTime, n(m, X);
        else break;
        X = o(g);
      }
    }
    function N(U) {
      if (T = !1, M(U), !w) if (o(m) !== null) w = !0, ve(O);
      else {
        var X = o(g);
        X !== null && Se(N, X.startTime - U);
      }
    }
    function O(U, X) {
      w = !1, T && (T = !1, A(G), G = -1), S = !0;
      var Y = f;
      try {
        for (M(X), l = o(m); l !== null && (!(l.expirationTime > X) || U && !ae()); ) {
          var D = l.callback;
          if (typeof D == "function") {
            l.callback = null, f = l.priorityLevel;
            var V = D(l.expirationTime <= X);
            X = e.unstable_now(), typeof V == "function" ? l.callback = V : l === o(m) && i(m), M(X);
          } else i(m);
          l = o(m);
        }
        if (l !== null) var ce = !0;
        else {
          var pe = o(g);
          pe !== null && Se(N, pe.startTime - X), ce = !1;
        }
        return ce;
      } finally {
        l = null, f = Y, S = !1;
      }
    }
    var W = !1, K = null, G = -1, L = 5, Q = -1;
    function ae() {
      return !(e.unstable_now() - Q < L);
    }
    function J() {
      if (K !== null) {
        var U = e.unstable_now();
        Q = U;
        var X = !0;
        try {
          X = K(!0, U);
        } finally {
          X ? de() : (W = !1, K = null);
        }
      } else W = !1;
    }
    var de;
    if (typeof E == "function") de = function() {
      E(J);
    };
    else if (typeof MessageChannel < "u") {
      var ue = new MessageChannel(), _e = ue.port2;
      ue.port1.onmessage = J, de = function() {
        _e.postMessage(null);
      };
    } else de = function() {
      _(J, 0);
    };
    function ve(U) {
      K = U, W || (W = !0, de());
    }
    function Se(U, X) {
      G = _(function() {
        U(e.unstable_now());
      }, X);
    }
    e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(U) {
      U.callback = null;
    }, e.unstable_continueExecution = function() {
      w || S || (w = !0, ve(O));
    }, e.unstable_forceFrameRate = function(U) {
      0 > U || 125 < U ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : L = 0 < U ? Math.floor(1e3 / U) : 5;
    }, e.unstable_getCurrentPriorityLevel = function() {
      return f;
    }, e.unstable_getFirstCallbackNode = function() {
      return o(m);
    }, e.unstable_next = function(U) {
      switch (f) {
        case 1:
        case 2:
        case 3:
          var X = 3;
          break;
        default:
          X = f;
      }
      var Y = f;
      f = X;
      try {
        return U();
      } finally {
        f = Y;
      }
    }, e.unstable_pauseExecution = function() {
    }, e.unstable_requestPaint = function() {
    }, e.unstable_runWithPriority = function(U, X) {
      switch (U) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          U = 3;
      }
      var Y = f;
      f = U;
      try {
        return X();
      } finally {
        f = Y;
      }
    }, e.unstable_scheduleCallback = function(U, X, Y) {
      var D = e.unstable_now();
      switch (typeof Y == "object" && Y !== null ? (Y = Y.delay, Y = typeof Y == "number" && 0 < Y ? D + Y : D) : Y = D, U) {
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
      return V = Y + V, U = { id: v++, callback: X, priorityLevel: U, startTime: Y, expirationTime: V, sortIndex: -1 }, Y > D ? (U.sortIndex = Y, n(g, U), o(m) === null && U === o(g) && (T ? (A(G), G = -1) : T = !0, Se(N, Y - D))) : (U.sortIndex = V, n(m, U), w || S || (w = !0, ve(O))), U;
    }, e.unstable_shouldYield = ae, e.unstable_wrapCallback = function(U) {
      var X = f;
      return function() {
        var Y = f;
        f = X;
        try {
          return U.apply(this, arguments);
        } finally {
          f = Y;
        }
      };
    };
  })(Ou)), Ou;
}
var im;
function Bx() {
  return im || (im = 1, ju.exports = Vx()), ju.exports;
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
var sm;
function zx() {
  if (sm) return pt;
  sm = 1;
  var e = ad(), n = Bx();
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
  var p = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), m = Object.prototype.hasOwnProperty, g = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, v = {}, l = {};
  function f(t) {
    return m.call(l, t) ? !0 : m.call(v, t) ? !1 : g.test(t) ? l[t] = !0 : (v[t] = !0, !1);
  }
  function S(t, r, s, u) {
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
    if (r === null || typeof r > "u" || S(t, r, s, u)) return !0;
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
  function T(t, r, s, u, h, y, x) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = u, this.attributeNamespace = h, this.mustUseProperty = s, this.propertyName = t, this.type = r, this.sanitizeURL = y, this.removeEmptyString = x;
  }
  var _ = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t) {
    _[t] = new T(t, 0, !1, t, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(t) {
    var r = t[0];
    _[r] = new T(r, 1, !1, t[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(t) {
    _[t] = new T(t, 2, !1, t.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(t) {
    _[t] = new T(t, 2, !1, t, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t) {
    _[t] = new T(t, 3, !1, t.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(t) {
    _[t] = new T(t, 3, !0, t, null, !1, !1);
  }), ["capture", "download"].forEach(function(t) {
    _[t] = new T(t, 4, !1, t, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(t) {
    _[t] = new T(t, 6, !1, t, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(t) {
    _[t] = new T(t, 5, !1, t.toLowerCase(), null, !1, !1);
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
    _[r] = new T(r, 1, !1, t, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t) {
    var r = t.replace(A, E);
    _[r] = new T(r, 1, !1, t, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(t) {
    var r = t.replace(A, E);
    _[r] = new T(r, 1, !1, t, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(t) {
    _[t] = new T(t, 1, !1, t.toLowerCase(), null, !1, !1);
  }), _.xlinkHref = new T("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(t) {
    _[t] = new T(t, 1, !1, t.toLowerCase(), null, !0, !0);
  });
  function M(t, r, s, u) {
    var h = _.hasOwnProperty(r) ? _[r] : null;
    (h !== null ? h.type !== 0 : u || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (w(r, s, h, u) && (s = null), u || h === null ? f(r) && (s === null ? t.removeAttribute(r) : t.setAttribute(r, "" + s)) : h.mustUseProperty ? t[h.propertyName] = s === null ? h.type === 3 ? !1 : "" : s : (r = h.attributeName, u = h.attributeNamespace, s === null ? t.removeAttribute(r) : (h = h.type, s = h === 3 || h === 4 && s === !0 ? "" : "" + s, u ? t.setAttributeNS(u, r, s) : t.setAttribute(r, s))));
  }
  var N = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, O = Symbol.for("react.element"), W = Symbol.for("react.portal"), K = Symbol.for("react.fragment"), G = Symbol.for("react.strict_mode"), L = Symbol.for("react.profiler"), Q = Symbol.for("react.provider"), ae = Symbol.for("react.context"), J = Symbol.for("react.forward_ref"), de = Symbol.for("react.suspense"), ue = Symbol.for("react.suspense_list"), _e = Symbol.for("react.memo"), ve = Symbol.for("react.lazy"), Se = Symbol.for("react.offscreen"), U = Symbol.iterator;
  function X(t) {
    return t === null || typeof t != "object" ? null : (t = U && t[U] || t["@@iterator"], typeof t == "function" ? t : null);
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
        } catch (j) {
          var u = j;
        }
        Reflect.construct(t, [], r);
      } else {
        try {
          r.call();
        } catch (j) {
          u = j;
        }
        t.call(r.prototype);
      }
      else {
        try {
          throw Error();
        } catch (j) {
          u = j;
        }
        t();
      }
    } catch (j) {
      if (j && u && typeof j.stack == "string") {
        for (var h = j.stack.split(`
`), y = u.stack.split(`
`), x = h.length - 1, P = y.length - 1; 1 <= x && 0 <= P && h[x] !== y[P]; ) P--;
        for (; 1 <= x && 0 <= P; x--, P--) if (h[x] !== y[P]) {
          if (x !== 1 || P !== 1)
            do
              if (x--, P--, 0 > P || h[x] !== y[P]) {
                var b = `
` + h[x].replace(" at new ", " at ");
                return t.displayName && b.includes("<anonymous>") && (b = b.replace("<anonymous>", t.displayName)), b;
              }
            while (1 <= x && 0 <= P);
          break;
        }
      }
    } finally {
      ce = !1, Error.prepareStackTrace = s;
    }
    return (t = t ? t.displayName || t.name : "") ? V(t) : "";
  }
  function me(t) {
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
      case W:
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
      case Q:
        return (t._context.displayName || "Context") + ".Provider";
      case J:
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
  function mt(t) {
    var r = Me(t) ? "checked" : "value", s = Object.getOwnPropertyDescriptor(t.constructor.prototype, r), u = "" + t[r];
    if (!t.hasOwnProperty(r) && typeof s < "u" && typeof s.get == "function" && typeof s.set == "function") {
      var h = s.get, y = s.set;
      return Object.defineProperty(t, r, { configurable: !0, get: function() {
        return h.call(this);
      }, set: function(x) {
        u = "" + x, y.call(this, x);
      } }), Object.defineProperty(t, r, { enumerable: s.enumerable }), { getValue: function() {
        return u;
      }, setValue: function(x) {
        u = "" + x;
      }, stopTracking: function() {
        t._valueTracker = null, delete t[r];
      } };
    }
  }
  function bi(t) {
    t._valueTracker || (t._valueTracker = mt(t));
  }
  function of(t) {
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
  function za(t, r) {
    var s = r.checked;
    return Y({}, r, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: s ?? t._wrapperState.initialChecked });
  }
  function sf(t, r) {
    var s = r.defaultValue == null ? "" : r.defaultValue, u = r.checked != null ? r.checked : r.defaultChecked;
    s = we(r.value != null ? r.value : s), t._wrapperState = { initialChecked: u, initialValue: s, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function af(t, r) {
    r = r.checked, r != null && M(t, "checked", r, !1);
  }
  function Ua(t, r) {
    af(t, r);
    var s = we(r.value), u = r.type;
    if (s != null) u === "number" ? (s === 0 && t.value === "" || t.value != s) && (t.value = "" + s) : t.value !== "" + s && (t.value = "" + s);
    else if (u === "submit" || u === "reset") {
      t.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? $a(t, r.type, s) : r.hasOwnProperty("defaultValue") && $a(t, r.type, we(r.defaultValue)), r.checked == null && r.defaultChecked != null && (t.defaultChecked = !!r.defaultChecked);
  }
  function lf(t, r, s) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var u = r.type;
      if (!(u !== "submit" && u !== "reset" || r.value !== void 0 && r.value !== null)) return;
      r = "" + t._wrapperState.initialValue, s || r === t.value || (t.value = r), t.defaultValue = r;
    }
    s = t.name, s !== "" && (t.name = ""), t.defaultChecked = !!t._wrapperState.initialChecked, s !== "" && (t.name = s);
  }
  function $a(t, r, s) {
    (r !== "number" || Mi(t.ownerDocument) !== t) && (s == null ? t.defaultValue = "" + t._wrapperState.initialValue : t.defaultValue !== "" + s && (t.defaultValue = "" + s));
  }
  var vo = Array.isArray;
  function Ar(t, r, s, u) {
    if (t = t.options, r) {
      r = {};
      for (var h = 0; h < s.length; h++) r["$" + s[h]] = !0;
      for (s = 0; s < t.length; s++) h = r.hasOwnProperty("$" + t[s].value), t[s].selected !== h && (t[s].selected = h), h && u && (t[s].defaultSelected = !0);
    } else {
      for (s = "" + we(s), r = null, h = 0; h < t.length; h++) {
        if (t[h].value === s) {
          t[h].selected = !0, u && (t[h].defaultSelected = !0);
          return;
        }
        r !== null || t[h].disabled || (r = t[h]);
      }
      r !== null && (r.selected = !0);
    }
  }
  function Ha(t, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(o(91));
    return Y({}, r, { value: void 0, defaultValue: void 0, children: "" + t._wrapperState.initialValue });
  }
  function uf(t, r) {
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
  function cf(t, r) {
    var s = we(r.value), u = we(r.defaultValue);
    s != null && (s = "" + s, s !== t.value && (t.value = s), r.defaultValue == null && t.defaultValue !== s && (t.defaultValue = s)), u != null && (t.defaultValue = "" + u);
  }
  function df(t) {
    var r = t.textContent;
    r === t._wrapperState.initialValue && r !== "" && r !== null && (t.value = r);
  }
  function ff(t) {
    switch (t) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Wa(t, r) {
    return t == null || t === "http://www.w3.org/1999/xhtml" ? ff(r) : t === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : t;
  }
  var Ri, pf = (function(t) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, s, u, h) {
      MSApp.execUnsafeLocalFunction(function() {
        return t(r, s, u, h);
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
  }, jS = ["Webkit", "ms", "Moz", "O"];
  Object.keys(wo).forEach(function(t) {
    jS.forEach(function(r) {
      r = r + t.charAt(0).toUpperCase() + t.substring(1), wo[r] = wo[t];
    });
  });
  function hf(t, r, s) {
    return r == null || typeof r == "boolean" || r === "" ? "" : s || typeof r != "number" || r === 0 || wo.hasOwnProperty(t) && wo[t] ? ("" + r).trim() : r + "px";
  }
  function mf(t, r) {
    t = t.style;
    for (var s in r) if (r.hasOwnProperty(s)) {
      var u = s.indexOf("--") === 0, h = hf(s, r[s], u);
      s === "float" && (s = "cssFloat"), u ? t.setProperty(s, h) : t[s] = h;
    }
  }
  var OS = Y({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Ga(t, r) {
    if (r) {
      if (OS[t] && (r.children != null || r.dangerouslySetInnerHTML != null)) throw Error(o(137, t));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null) throw Error(o(60));
        if (typeof r.dangerouslySetInnerHTML != "object" || !("__html" in r.dangerouslySetInnerHTML)) throw Error(o(61));
      }
      if (r.style != null && typeof r.style != "object") throw Error(o(62));
    }
  }
  function Ka(t, r) {
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
  var Ya = null;
  function Qa(t) {
    return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
  }
  var Xa = null, Cr = null, Pr = null;
  function yf(t) {
    if (t = Uo(t)) {
      if (typeof Xa != "function") throw Error(o(280));
      var r = t.stateNode;
      r && (r = es(r), Xa(t.stateNode, t.type, r));
    }
  }
  function gf(t) {
    Cr ? Pr ? Pr.push(t) : Pr = [t] : Cr = t;
  }
  function vf() {
    if (Cr) {
      var t = Cr, r = Pr;
      if (Pr = Cr = null, yf(t), r) for (t = 0; t < r.length; t++) yf(r[t]);
    }
  }
  function Sf(t, r) {
    return t(r);
  }
  function wf() {
  }
  var Za = !1;
  function xf(t, r, s) {
    if (Za) return t(r, s);
    Za = !0;
    try {
      return Sf(t, r, s);
    } finally {
      Za = !1, (Cr !== null || Pr !== null) && (wf(), vf());
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
  var Ja = !1;
  if (p) try {
    var _o = {};
    Object.defineProperty(_o, "passive", { get: function() {
      Ja = !0;
    } }), window.addEventListener("test", _o, _o), window.removeEventListener("test", _o, _o);
  } catch {
    Ja = !1;
  }
  function LS(t, r, s, u, h, y, x, P, b) {
    var j = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(s, j);
    } catch (z) {
      this.onError(z);
    }
  }
  var To = !1, Di = null, Ni = !1, qa = null, VS = { onError: function(t) {
    To = !0, Di = t;
  } };
  function BS(t, r, s, u, h, y, x, P, b) {
    To = !1, Di = null, LS.apply(VS, arguments);
  }
  function zS(t, r, s, u, h, y, x, P, b) {
    if (BS.apply(this, arguments), To) {
      if (To) {
        var j = Di;
        To = !1, Di = null;
      } else throw Error(o(198));
      Ni || (Ni = !0, qa = j);
    }
  }
  function Yn(t) {
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
  function _f(t) {
    if (t.tag === 13) {
      var r = t.memoizedState;
      if (r === null && (t = t.alternate, t !== null && (r = t.memoizedState)), r !== null) return r.dehydrated;
    }
    return null;
  }
  function Tf(t) {
    if (Yn(t) !== t) throw Error(o(188));
  }
  function US(t) {
    var r = t.alternate;
    if (!r) {
      if (r = Yn(t), r === null) throw Error(o(188));
      return r !== t ? null : t;
    }
    for (var s = t, u = r; ; ) {
      var h = s.return;
      if (h === null) break;
      var y = h.alternate;
      if (y === null) {
        if (u = h.return, u !== null) {
          s = u;
          continue;
        }
        break;
      }
      if (h.child === y.child) {
        for (y = h.child; y; ) {
          if (y === s) return Tf(h), t;
          if (y === u) return Tf(h), r;
          y = y.sibling;
        }
        throw Error(o(188));
      }
      if (s.return !== u.return) s = h, u = y;
      else {
        for (var x = !1, P = h.child; P; ) {
          if (P === s) {
            x = !0, s = h, u = y;
            break;
          }
          if (P === u) {
            x = !0, u = h, s = y;
            break;
          }
          P = P.sibling;
        }
        if (!x) {
          for (P = y.child; P; ) {
            if (P === s) {
              x = !0, s = y, u = h;
              break;
            }
            if (P === u) {
              x = !0, u = y, s = h;
              break;
            }
            P = P.sibling;
          }
          if (!x) throw Error(o(189));
        }
      }
      if (s.alternate !== u) throw Error(o(190));
    }
    if (s.tag !== 3) throw Error(o(188));
    return s.stateNode.current === s ? t : r;
  }
  function kf(t) {
    return t = US(t), t !== null ? Af(t) : null;
  }
  function Af(t) {
    if (t.tag === 5 || t.tag === 6) return t;
    for (t = t.child; t !== null; ) {
      var r = Af(t);
      if (r !== null) return r;
      t = t.sibling;
    }
    return null;
  }
  var Cf = n.unstable_scheduleCallback, Pf = n.unstable_cancelCallback, $S = n.unstable_shouldYield, HS = n.unstable_requestPaint, je = n.unstable_now, WS = n.unstable_getCurrentPriorityLevel, el = n.unstable_ImmediatePriority, Ef = n.unstable_UserBlockingPriority, Ii = n.unstable_NormalPriority, GS = n.unstable_LowPriority, bf = n.unstable_IdlePriority, Fi = null, Ut = null;
  function KS(t) {
    if (Ut && typeof Ut.onCommitFiberRoot == "function") try {
      Ut.onCommitFiberRoot(Fi, t, void 0, (t.current.flags & 128) === 128);
    } catch {
    }
  }
  var Rt = Math.clz32 ? Math.clz32 : XS, YS = Math.log, QS = Math.LN2;
  function XS(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (YS(t) / QS | 0) | 0;
  }
  var ji = 64, Oi = 4194304;
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
    var u = 0, h = t.suspendedLanes, y = t.pingedLanes, x = s & 268435455;
    if (x !== 0) {
      var P = x & ~h;
      P !== 0 ? u = ko(P) : (y &= x, y !== 0 && (u = ko(y)));
    } else x = s & ~h, x !== 0 ? u = ko(x) : y !== 0 && (u = ko(y));
    if (u === 0) return 0;
    if (r !== 0 && r !== u && (r & h) === 0 && (h = u & -u, y = r & -r, h >= y || h === 16 && (y & 4194240) !== 0)) return r;
    if ((u & 4) !== 0 && (u |= s & 16), r = t.entangledLanes, r !== 0) for (t = t.entanglements, r &= u; 0 < r; ) s = 31 - Rt(r), h = 1 << s, u |= t[s], r &= ~h;
    return u;
  }
  function ZS(t, r) {
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
  function JS(t, r) {
    for (var s = t.suspendedLanes, u = t.pingedLanes, h = t.expirationTimes, y = t.pendingLanes; 0 < y; ) {
      var x = 31 - Rt(y), P = 1 << x, b = h[x];
      b === -1 ? ((P & s) === 0 || (P & u) !== 0) && (h[x] = ZS(P, r)) : b <= r && (t.expiredLanes |= P), y &= ~P;
    }
  }
  function tl(t) {
    return t = t.pendingLanes & -1073741825, t !== 0 ? t : t & 1073741824 ? 1073741824 : 0;
  }
  function Mf() {
    var t = ji;
    return ji <<= 1, (ji & 4194240) === 0 && (ji = 64), t;
  }
  function nl(t) {
    for (var r = [], s = 0; 31 > s; s++) r.push(t);
    return r;
  }
  function Ao(t, r, s) {
    t.pendingLanes |= r, r !== 536870912 && (t.suspendedLanes = 0, t.pingedLanes = 0), t = t.eventTimes, r = 31 - Rt(r), t[r] = s;
  }
  function qS(t, r) {
    var s = t.pendingLanes & ~r;
    t.pendingLanes = r, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= r, t.mutableReadLanes &= r, t.entangledLanes &= r, r = t.entanglements;
    var u = t.eventTimes;
    for (t = t.expirationTimes; 0 < s; ) {
      var h = 31 - Rt(s), y = 1 << h;
      r[h] = 0, u[h] = -1, t[h] = -1, s &= ~y;
    }
  }
  function rl(t, r) {
    var s = t.entangledLanes |= r;
    for (t = t.entanglements; s; ) {
      var u = 31 - Rt(s), h = 1 << u;
      h & r | t[u] & r && (t[u] |= r), s &= ~h;
    }
  }
  var xe = 0;
  function Rf(t) {
    return t &= -t, 1 < t ? 4 < t ? (t & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Df, ol, Nf, If, Ff, il = !1, Vi = [], yn = null, gn = null, vn = null, Co = /* @__PURE__ */ new Map(), Po = /* @__PURE__ */ new Map(), Sn = [], ew = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function jf(t, r) {
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
  function Eo(t, r, s, u, h, y) {
    return t === null || t.nativeEvent !== y ? (t = { blockedOn: r, domEventName: s, eventSystemFlags: u, nativeEvent: y, targetContainers: [h] }, r !== null && (r = Uo(r), r !== null && ol(r)), t) : (t.eventSystemFlags |= u, r = t.targetContainers, h !== null && r.indexOf(h) === -1 && r.push(h), t);
  }
  function tw(t, r, s, u, h) {
    switch (r) {
      case "focusin":
        return yn = Eo(yn, t, r, s, u, h), !0;
      case "dragenter":
        return gn = Eo(gn, t, r, s, u, h), !0;
      case "mouseover":
        return vn = Eo(vn, t, r, s, u, h), !0;
      case "pointerover":
        var y = h.pointerId;
        return Co.set(y, Eo(Co.get(y) || null, t, r, s, u, h)), !0;
      case "gotpointercapture":
        return y = h.pointerId, Po.set(y, Eo(Po.get(y) || null, t, r, s, u, h)), !0;
    }
    return !1;
  }
  function Of(t) {
    var r = Qn(t.target);
    if (r !== null) {
      var s = Yn(r);
      if (s !== null) {
        if (r = s.tag, r === 13) {
          if (r = _f(s), r !== null) {
            t.blockedOn = r, Ff(t.priority, function() {
              Nf(s);
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
      var s = al(t.domEventName, t.eventSystemFlags, r[0], t.nativeEvent);
      if (s === null) {
        s = t.nativeEvent;
        var u = new s.constructor(s.type, s);
        Ya = u, s.target.dispatchEvent(u), Ya = null;
      } else return r = Uo(s), r !== null && ol(r), t.blockedOn = s, !1;
      r.shift();
    }
    return !0;
  }
  function Lf(t, r, s) {
    Bi(t) && s.delete(r);
  }
  function nw() {
    il = !1, yn !== null && Bi(yn) && (yn = null), gn !== null && Bi(gn) && (gn = null), vn !== null && Bi(vn) && (vn = null), Co.forEach(Lf), Po.forEach(Lf);
  }
  function bo(t, r) {
    t.blockedOn === r && (t.blockedOn = null, il || (il = !0, n.unstable_scheduleCallback(n.unstable_NormalPriority, nw)));
  }
  function Mo(t) {
    function r(h) {
      return bo(h, t);
    }
    if (0 < Vi.length) {
      bo(Vi[0], t);
      for (var s = 1; s < Vi.length; s++) {
        var u = Vi[s];
        u.blockedOn === t && (u.blockedOn = null);
      }
    }
    for (yn !== null && bo(yn, t), gn !== null && bo(gn, t), vn !== null && bo(vn, t), Co.forEach(r), Po.forEach(r), s = 0; s < Sn.length; s++) u = Sn[s], u.blockedOn === t && (u.blockedOn = null);
    for (; 0 < Sn.length && (s = Sn[0], s.blockedOn === null); ) Of(s), s.blockedOn === null && Sn.shift();
  }
  var Er = N.ReactCurrentBatchConfig, zi = !0;
  function rw(t, r, s, u) {
    var h = xe, y = Er.transition;
    Er.transition = null;
    try {
      xe = 1, sl(t, r, s, u);
    } finally {
      xe = h, Er.transition = y;
    }
  }
  function ow(t, r, s, u) {
    var h = xe, y = Er.transition;
    Er.transition = null;
    try {
      xe = 4, sl(t, r, s, u);
    } finally {
      xe = h, Er.transition = y;
    }
  }
  function sl(t, r, s, u) {
    if (zi) {
      var h = al(t, r, s, u);
      if (h === null) kl(t, r, u, Ui, s), jf(t, u);
      else if (tw(h, t, r, s, u)) u.stopPropagation();
      else if (jf(t, u), r & 4 && -1 < ew.indexOf(t)) {
        for (; h !== null; ) {
          var y = Uo(h);
          if (y !== null && Df(y), y = al(t, r, s, u), y === null && kl(t, r, u, Ui, s), y === h) break;
          h = y;
        }
        h !== null && u.stopPropagation();
      } else kl(t, r, u, null, s);
    }
  }
  var Ui = null;
  function al(t, r, s, u) {
    if (Ui = null, t = Qa(u), t = Qn(t), t !== null) if (r = Yn(t), r === null) t = null;
    else if (s = r.tag, s === 13) {
      if (t = _f(r), t !== null) return t;
      t = null;
    } else if (s === 3) {
      if (r.stateNode.current.memoizedState.isDehydrated) return r.tag === 3 ? r.stateNode.containerInfo : null;
      t = null;
    } else r !== t && (t = null);
    return Ui = t, null;
  }
  function Vf(t) {
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
        switch (WS()) {
          case el:
            return 1;
          case Ef:
            return 4;
          case Ii:
          case GS:
            return 16;
          case bf:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var wn = null, ll = null, $i = null;
  function Bf() {
    if ($i) return $i;
    var t, r = ll, s = r.length, u, h = "value" in wn ? wn.value : wn.textContent, y = h.length;
    for (t = 0; t < s && r[t] === h[t]; t++) ;
    var x = s - t;
    for (u = 1; u <= x && r[s - u] === h[y - u]; u++) ;
    return $i = h.slice(t, 1 < u ? 1 - u : void 0);
  }
  function Hi(t) {
    var r = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && r === 13 && (t = 13)) : t = r, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function Wi() {
    return !0;
  }
  function zf() {
    return !1;
  }
  function yt(t) {
    function r(s, u, h, y, x) {
      this._reactName = s, this._targetInst = h, this.type = u, this.nativeEvent = y, this.target = x, this.currentTarget = null;
      for (var P in t) t.hasOwnProperty(P) && (s = t[P], this[P] = s ? s(y) : y[P]);
      return this.isDefaultPrevented = (y.defaultPrevented != null ? y.defaultPrevented : y.returnValue === !1) ? Wi : zf, this.isPropagationStopped = zf, this;
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
  }, defaultPrevented: 0, isTrusted: 0 }, ul = yt(br), Ro = Y({}, br, { view: 0, detail: 0 }), iw = yt(Ro), cl, dl, Do, Gi = Y({}, Ro, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: pl, button: 0, buttons: 0, relatedTarget: function(t) {
    return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
  }, movementX: function(t) {
    return "movementX" in t ? t.movementX : (t !== Do && (Do && t.type === "mousemove" ? (cl = t.screenX - Do.screenX, dl = t.screenY - Do.screenY) : dl = cl = 0, Do = t), cl);
  }, movementY: function(t) {
    return "movementY" in t ? t.movementY : dl;
  } }), Uf = yt(Gi), sw = Y({}, Gi, { dataTransfer: 0 }), aw = yt(sw), lw = Y({}, Ro, { relatedTarget: 0 }), fl = yt(lw), uw = Y({}, br, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), cw = yt(uw), dw = Y({}, br, { clipboardData: function(t) {
    return "clipboardData" in t ? t.clipboardData : window.clipboardData;
  } }), fw = yt(dw), pw = Y({}, br, { data: 0 }), $f = yt(pw), hw = {
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
  }, mw = {
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
  }, yw = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function gw(t) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(t) : (t = yw[t]) ? !!r[t] : !1;
  }
  function pl() {
    return gw;
  }
  var vw = Y({}, Ro, { key: function(t) {
    if (t.key) {
      var r = hw[t.key] || t.key;
      if (r !== "Unidentified") return r;
    }
    return t.type === "keypress" ? (t = Hi(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? mw[t.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: pl, charCode: function(t) {
    return t.type === "keypress" ? Hi(t) : 0;
  }, keyCode: function(t) {
    return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  }, which: function(t) {
    return t.type === "keypress" ? Hi(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  } }), Sw = yt(vw), ww = Y({}, Gi, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Hf = yt(ww), xw = Y({}, Ro, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: pl }), _w = yt(xw), Tw = Y({}, br, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), kw = yt(Tw), Aw = Y({}, Gi, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Cw = yt(Aw), Pw = [9, 13, 27, 32], hl = p && "CompositionEvent" in window, No = null;
  p && "documentMode" in document && (No = document.documentMode);
  var Ew = p && "TextEvent" in window && !No, Wf = p && (!hl || No && 8 < No && 11 >= No), Gf = " ", Kf = !1;
  function Yf(t, r) {
    switch (t) {
      case "keyup":
        return Pw.indexOf(r.keyCode) !== -1;
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
  function Qf(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var Mr = !1;
  function bw(t, r) {
    switch (t) {
      case "compositionend":
        return Qf(r);
      case "keypress":
        return r.which !== 32 ? null : (Kf = !0, Gf);
      case "textInput":
        return t = r.data, t === Gf && Kf ? null : t;
      default:
        return null;
    }
  }
  function Mw(t, r) {
    if (Mr) return t === "compositionend" || !hl && Yf(t, r) ? (t = Bf(), $i = ll = wn = null, Mr = !1, t) : null;
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
        return Wf && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var Rw = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Xf(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r === "input" ? !!Rw[t.type] : r === "textarea";
  }
  function Zf(t, r, s, u) {
    gf(u), r = Zi(r, "onChange"), 0 < r.length && (s = new ul("onChange", "change", null, s, u), t.push({ event: s, listeners: r }));
  }
  var Io = null, Fo = null;
  function Dw(t) {
    mp(t, 0);
  }
  function Ki(t) {
    var r = Fr(t);
    if (of(r)) return t;
  }
  function Nw(t, r) {
    if (t === "change") return r;
  }
  var Jf = !1;
  if (p) {
    var ml;
    if (p) {
      var yl = "oninput" in document;
      if (!yl) {
        var qf = document.createElement("div");
        qf.setAttribute("oninput", "return;"), yl = typeof qf.oninput == "function";
      }
      ml = yl;
    } else ml = !1;
    Jf = ml && (!document.documentMode || 9 < document.documentMode);
  }
  function ep() {
    Io && (Io.detachEvent("onpropertychange", tp), Fo = Io = null);
  }
  function tp(t) {
    if (t.propertyName === "value" && Ki(Fo)) {
      var r = [];
      Zf(r, Fo, t, Qa(t)), xf(Dw, r);
    }
  }
  function Iw(t, r, s) {
    t === "focusin" ? (ep(), Io = r, Fo = s, Io.attachEvent("onpropertychange", tp)) : t === "focusout" && ep();
  }
  function Fw(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown") return Ki(Fo);
  }
  function jw(t, r) {
    if (t === "click") return Ki(r);
  }
  function Ow(t, r) {
    if (t === "input" || t === "change") return Ki(r);
  }
  function Lw(t, r) {
    return t === r && (t !== 0 || 1 / t === 1 / r) || t !== t && r !== r;
  }
  var Dt = typeof Object.is == "function" ? Object.is : Lw;
  function jo(t, r) {
    if (Dt(t, r)) return !0;
    if (typeof t != "object" || t === null || typeof r != "object" || r === null) return !1;
    var s = Object.keys(t), u = Object.keys(r);
    if (s.length !== u.length) return !1;
    for (u = 0; u < s.length; u++) {
      var h = s[u];
      if (!m.call(r, h) || !Dt(t[h], r[h])) return !1;
    }
    return !0;
  }
  function np(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function rp(t, r) {
    var s = np(t);
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
      s = np(s);
    }
  }
  function op(t, r) {
    return t && r ? t === r ? !0 : t && t.nodeType === 3 ? !1 : r && r.nodeType === 3 ? op(t, r.parentNode) : "contains" in t ? t.contains(r) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function ip() {
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
  function gl(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r && (r === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || r === "textarea" || t.contentEditable === "true");
  }
  function Vw(t) {
    var r = ip(), s = t.focusedElem, u = t.selectionRange;
    if (r !== s && s && s.ownerDocument && op(s.ownerDocument.documentElement, s)) {
      if (u !== null && gl(s)) {
        if (r = u.start, t = u.end, t === void 0 && (t = r), "selectionStart" in s) s.selectionStart = r, s.selectionEnd = Math.min(t, s.value.length);
        else if (t = (r = s.ownerDocument || document) && r.defaultView || window, t.getSelection) {
          t = t.getSelection();
          var h = s.textContent.length, y = Math.min(u.start, h);
          u = u.end === void 0 ? y : Math.min(u.end, h), !t.extend && y > u && (h = u, u = y, y = h), h = rp(s, y);
          var x = rp(
            s,
            u
          );
          h && x && (t.rangeCount !== 1 || t.anchorNode !== h.node || t.anchorOffset !== h.offset || t.focusNode !== x.node || t.focusOffset !== x.offset) && (r = r.createRange(), r.setStart(h.node, h.offset), t.removeAllRanges(), y > u ? (t.addRange(r), t.extend(x.node, x.offset)) : (r.setEnd(x.node, x.offset), t.addRange(r)));
        }
      }
      for (r = [], t = s; t = t.parentNode; ) t.nodeType === 1 && r.push({ element: t, left: t.scrollLeft, top: t.scrollTop });
      for (typeof s.focus == "function" && s.focus(), s = 0; s < r.length; s++) t = r[s], t.element.scrollLeft = t.left, t.element.scrollTop = t.top;
    }
  }
  var Bw = p && "documentMode" in document && 11 >= document.documentMode, Rr = null, vl = null, Oo = null, Sl = !1;
  function sp(t, r, s) {
    var u = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument;
    Sl || Rr == null || Rr !== Mi(u) || (u = Rr, "selectionStart" in u && gl(u) ? u = { start: u.selectionStart, end: u.selectionEnd } : (u = (u.ownerDocument && u.ownerDocument.defaultView || window).getSelection(), u = { anchorNode: u.anchorNode, anchorOffset: u.anchorOffset, focusNode: u.focusNode, focusOffset: u.focusOffset }), Oo && jo(Oo, u) || (Oo = u, u = Zi(vl, "onSelect"), 0 < u.length && (r = new ul("onSelect", "select", null, r, s), t.push({ event: r, listeners: u }), r.target = Rr)));
  }
  function Yi(t, r) {
    var s = {};
    return s[t.toLowerCase()] = r.toLowerCase(), s["Webkit" + t] = "webkit" + r, s["Moz" + t] = "moz" + r, s;
  }
  var Dr = { animationend: Yi("Animation", "AnimationEnd"), animationiteration: Yi("Animation", "AnimationIteration"), animationstart: Yi("Animation", "AnimationStart"), transitionend: Yi("Transition", "TransitionEnd") }, wl = {}, ap = {};
  p && (ap = document.createElement("div").style, "AnimationEvent" in window || (delete Dr.animationend.animation, delete Dr.animationiteration.animation, delete Dr.animationstart.animation), "TransitionEvent" in window || delete Dr.transitionend.transition);
  function Qi(t) {
    if (wl[t]) return wl[t];
    if (!Dr[t]) return t;
    var r = Dr[t], s;
    for (s in r) if (r.hasOwnProperty(s) && s in ap) return wl[t] = r[s];
    return t;
  }
  var lp = Qi("animationend"), up = Qi("animationiteration"), cp = Qi("animationstart"), dp = Qi("transitionend"), fp = /* @__PURE__ */ new Map(), pp = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function xn(t, r) {
    fp.set(t, r), c(r, [t]);
  }
  for (var xl = 0; xl < pp.length; xl++) {
    var _l = pp[xl], zw = _l.toLowerCase(), Uw = _l[0].toUpperCase() + _l.slice(1);
    xn(zw, "on" + Uw);
  }
  xn(lp, "onAnimationEnd"), xn(up, "onAnimationIteration"), xn(cp, "onAnimationStart"), xn("dblclick", "onDoubleClick"), xn("focusin", "onFocus"), xn("focusout", "onBlur"), xn(dp, "onTransitionEnd"), d("onMouseEnter", ["mouseout", "mouseover"]), d("onMouseLeave", ["mouseout", "mouseover"]), d("onPointerEnter", ["pointerout", "pointerover"]), d("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Lo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), $w = new Set("cancel close invalid load scroll toggle".split(" ").concat(Lo));
  function hp(t, r, s) {
    var u = t.type || "unknown-event";
    t.currentTarget = s, zS(u, r, void 0, t), t.currentTarget = null;
  }
  function mp(t, r) {
    r = (r & 4) !== 0;
    for (var s = 0; s < t.length; s++) {
      var u = t[s], h = u.event;
      u = u.listeners;
      e: {
        var y = void 0;
        if (r) for (var x = u.length - 1; 0 <= x; x--) {
          var P = u[x], b = P.instance, j = P.currentTarget;
          if (P = P.listener, b !== y && h.isPropagationStopped()) break e;
          hp(h, P, j), y = b;
        }
        else for (x = 0; x < u.length; x++) {
          if (P = u[x], b = P.instance, j = P.currentTarget, P = P.listener, b !== y && h.isPropagationStopped()) break e;
          hp(h, P, j), y = b;
        }
      }
    }
    if (Ni) throw t = qa, Ni = !1, qa = null, t;
  }
  function Pe(t, r) {
    var s = r[Ml];
    s === void 0 && (s = r[Ml] = /* @__PURE__ */ new Set());
    var u = t + "__bubble";
    s.has(u) || (yp(r, t, 2, !1), s.add(u));
  }
  function Tl(t, r, s) {
    var u = 0;
    r && (u |= 4), yp(s, t, u, r);
  }
  var Xi = "_reactListening" + Math.random().toString(36).slice(2);
  function Vo(t) {
    if (!t[Xi]) {
      t[Xi] = !0, i.forEach(function(s) {
        s !== "selectionchange" && ($w.has(s) || Tl(s, !1, t), Tl(s, !0, t));
      });
      var r = t.nodeType === 9 ? t : t.ownerDocument;
      r === null || r[Xi] || (r[Xi] = !0, Tl("selectionchange", !1, r));
    }
  }
  function yp(t, r, s, u) {
    switch (Vf(r)) {
      case 1:
        var h = rw;
        break;
      case 4:
        h = ow;
        break;
      default:
        h = sl;
    }
    s = h.bind(null, r, s, t), h = void 0, !Ja || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (h = !0), u ? h !== void 0 ? t.addEventListener(r, s, { capture: !0, passive: h }) : t.addEventListener(r, s, !0) : h !== void 0 ? t.addEventListener(r, s, { passive: h }) : t.addEventListener(r, s, !1);
  }
  function kl(t, r, s, u, h) {
    var y = u;
    if ((r & 1) === 0 && (r & 2) === 0 && u !== null) e: for (; ; ) {
      if (u === null) return;
      var x = u.tag;
      if (x === 3 || x === 4) {
        var P = u.stateNode.containerInfo;
        if (P === h || P.nodeType === 8 && P.parentNode === h) break;
        if (x === 4) for (x = u.return; x !== null; ) {
          var b = x.tag;
          if ((b === 3 || b === 4) && (b = x.stateNode.containerInfo, b === h || b.nodeType === 8 && b.parentNode === h)) return;
          x = x.return;
        }
        for (; P !== null; ) {
          if (x = Qn(P), x === null) return;
          if (b = x.tag, b === 5 || b === 6) {
            u = y = x;
            continue e;
          }
          P = P.parentNode;
        }
      }
      u = u.return;
    }
    xf(function() {
      var j = y, z = Qa(s), $ = [];
      e: {
        var B = fp.get(t);
        if (B !== void 0) {
          var Z = ul, ee = t;
          switch (t) {
            case "keypress":
              if (Hi(s) === 0) break e;
            case "keydown":
            case "keyup":
              Z = Sw;
              break;
            case "focusin":
              ee = "focus", Z = fl;
              break;
            case "focusout":
              ee = "blur", Z = fl;
              break;
            case "beforeblur":
            case "afterblur":
              Z = fl;
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
              Z = Uf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              Z = aw;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              Z = _w;
              break;
            case lp:
            case up:
            case cp:
              Z = cw;
              break;
            case dp:
              Z = kw;
              break;
            case "scroll":
              Z = iw;
              break;
            case "wheel":
              Z = Cw;
              break;
            case "copy":
            case "cut":
            case "paste":
              Z = fw;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              Z = Hf;
          }
          var re = (r & 4) !== 0, Oe = !re && t === "scroll", I = re ? B !== null ? B + "Capture" : null : B;
          re = [];
          for (var R = j, F; R !== null; ) {
            F = R;
            var H = F.stateNode;
            if (F.tag === 5 && H !== null && (F = H, I !== null && (H = xo(R, I), H != null && re.push(Bo(R, H, F)))), Oe) break;
            R = R.return;
          }
          0 < re.length && (B = new Z(B, ee, null, s, z), $.push({ event: B, listeners: re }));
        }
      }
      if ((r & 7) === 0) {
        e: {
          if (B = t === "mouseover" || t === "pointerover", Z = t === "mouseout" || t === "pointerout", B && s !== Ya && (ee = s.relatedTarget || s.fromElement) && (Qn(ee) || ee[nn])) break e;
          if ((Z || B) && (B = z.window === z ? z : (B = z.ownerDocument) ? B.defaultView || B.parentWindow : window, Z ? (ee = s.relatedTarget || s.toElement, Z = j, ee = ee ? Qn(ee) : null, ee !== null && (Oe = Yn(ee), ee !== Oe || ee.tag !== 5 && ee.tag !== 6) && (ee = null)) : (Z = null, ee = j), Z !== ee)) {
            if (re = Uf, H = "onMouseLeave", I = "onMouseEnter", R = "mouse", (t === "pointerout" || t === "pointerover") && (re = Hf, H = "onPointerLeave", I = "onPointerEnter", R = "pointer"), Oe = Z == null ? B : Fr(Z), F = ee == null ? B : Fr(ee), B = new re(H, R + "leave", Z, s, z), B.target = Oe, B.relatedTarget = F, H = null, Qn(z) === j && (re = new re(I, R + "enter", ee, s, z), re.target = F, re.relatedTarget = Oe, H = re), Oe = H, Z && ee) t: {
              for (re = Z, I = ee, R = 0, F = re; F; F = Nr(F)) R++;
              for (F = 0, H = I; H; H = Nr(H)) F++;
              for (; 0 < R - F; ) re = Nr(re), R--;
              for (; 0 < F - R; ) I = Nr(I), F--;
              for (; R--; ) {
                if (re === I || I !== null && re === I.alternate) break t;
                re = Nr(re), I = Nr(I);
              }
              re = null;
            }
            else re = null;
            Z !== null && gp($, B, Z, re, !1), ee !== null && Oe !== null && gp($, Oe, ee, re, !0);
          }
        }
        e: {
          if (B = j ? Fr(j) : window, Z = B.nodeName && B.nodeName.toLowerCase(), Z === "select" || Z === "input" && B.type === "file") var oe = Nw;
          else if (Xf(B)) if (Jf) oe = Ow;
          else {
            oe = Fw;
            var ie = Iw;
          }
          else (Z = B.nodeName) && Z.toLowerCase() === "input" && (B.type === "checkbox" || B.type === "radio") && (oe = jw);
          if (oe && (oe = oe(t, j))) {
            Zf($, oe, s, z);
            break e;
          }
          ie && ie(t, B, j), t === "focusout" && (ie = B._wrapperState) && ie.controlled && B.type === "number" && $a(B, "number", B.value);
        }
        switch (ie = j ? Fr(j) : window, t) {
          case "focusin":
            (Xf(ie) || ie.contentEditable === "true") && (Rr = ie, vl = j, Oo = null);
            break;
          case "focusout":
            Oo = vl = Rr = null;
            break;
          case "mousedown":
            Sl = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Sl = !1, sp($, s, z);
            break;
          case "selectionchange":
            if (Bw) break;
          case "keydown":
          case "keyup":
            sp($, s, z);
        }
        var se;
        if (hl) e: {
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
        else Mr ? Yf(t, s) && (le = "onCompositionEnd") : t === "keydown" && s.keyCode === 229 && (le = "onCompositionStart");
        le && (Wf && s.locale !== "ko" && (Mr || le !== "onCompositionStart" ? le === "onCompositionEnd" && Mr && (se = Bf()) : (wn = z, ll = "value" in wn ? wn.value : wn.textContent, Mr = !0)), ie = Zi(j, le), 0 < ie.length && (le = new $f(le, t, null, s, z), $.push({ event: le, listeners: ie }), se ? le.data = se : (se = Qf(s), se !== null && (le.data = se)))), (se = Ew ? bw(t, s) : Mw(t, s)) && (j = Zi(j, "onBeforeInput"), 0 < j.length && (z = new $f("onBeforeInput", "beforeinput", null, s, z), $.push({ event: z, listeners: j }), z.data = se));
      }
      mp($, r);
    });
  }
  function Bo(t, r, s) {
    return { instance: t, listener: r, currentTarget: s };
  }
  function Zi(t, r) {
    for (var s = r + "Capture", u = []; t !== null; ) {
      var h = t, y = h.stateNode;
      h.tag === 5 && y !== null && (h = y, y = xo(t, s), y != null && u.unshift(Bo(t, y, h)), y = xo(t, r), y != null && u.push(Bo(t, y, h))), t = t.return;
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
  function gp(t, r, s, u, h) {
    for (var y = r._reactName, x = []; s !== null && s !== u; ) {
      var P = s, b = P.alternate, j = P.stateNode;
      if (b !== null && b === u) break;
      P.tag === 5 && j !== null && (P = j, h ? (b = xo(s, y), b != null && x.unshift(Bo(s, b, P))) : h || (b = xo(s, y), b != null && x.push(Bo(s, b, P)))), s = s.return;
    }
    x.length !== 0 && t.push({ event: r, listeners: x });
  }
  var Hw = /\r\n?/g, Ww = /\u0000|\uFFFD/g;
  function vp(t) {
    return (typeof t == "string" ? t : "" + t).replace(Hw, `
`).replace(Ww, "");
  }
  function Ji(t, r, s) {
    if (r = vp(r), vp(t) !== r && s) throw Error(o(425));
  }
  function qi() {
  }
  var Al = null, Cl = null;
  function Pl(t, r) {
    return t === "textarea" || t === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var El = typeof setTimeout == "function" ? setTimeout : void 0, Gw = typeof clearTimeout == "function" ? clearTimeout : void 0, Sp = typeof Promise == "function" ? Promise : void 0, Kw = typeof queueMicrotask == "function" ? queueMicrotask : typeof Sp < "u" ? function(t) {
    return Sp.resolve(null).then(t).catch(Yw);
  } : El;
  function Yw(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function bl(t, r) {
    var s = r, u = 0;
    do {
      var h = s.nextSibling;
      if (t.removeChild(s), h && h.nodeType === 8) if (s = h.data, s === "/$") {
        if (u === 0) {
          t.removeChild(h), Mo(r);
          return;
        }
        u--;
      } else s !== "$" && s !== "$?" && s !== "$!" || u++;
      s = h;
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
  function wp(t) {
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
  var Ir = Math.random().toString(36).slice(2), $t = "__reactFiber$" + Ir, zo = "__reactProps$" + Ir, nn = "__reactContainer$" + Ir, Ml = "__reactEvents$" + Ir, Qw = "__reactListeners$" + Ir, Xw = "__reactHandles$" + Ir;
  function Qn(t) {
    var r = t[$t];
    if (r) return r;
    for (var s = t.parentNode; s; ) {
      if (r = s[nn] || s[$t]) {
        if (s = r.alternate, r.child !== null || s !== null && s.child !== null) for (t = wp(t); t !== null; ) {
          if (s = t[$t]) return s;
          t = wp(t);
        }
        return r;
      }
      t = s, s = t.parentNode;
    }
    return null;
  }
  function Uo(t) {
    return t = t[$t] || t[nn], !t || t.tag !== 5 && t.tag !== 6 && t.tag !== 13 && t.tag !== 3 ? null : t;
  }
  function Fr(t) {
    if (t.tag === 5 || t.tag === 6) return t.stateNode;
    throw Error(o(33));
  }
  function es(t) {
    return t[zo] || null;
  }
  var Rl = [], jr = -1;
  function Tn(t) {
    return { current: t };
  }
  function Ee(t) {
    0 > jr || (t.current = Rl[jr], Rl[jr] = null, jr--);
  }
  function Ce(t, r) {
    jr++, Rl[jr] = t.current, t.current = r;
  }
  var kn = {}, qe = Tn(kn), lt = Tn(!1), Xn = kn;
  function Or(t, r) {
    var s = t.type.contextTypes;
    if (!s) return kn;
    var u = t.stateNode;
    if (u && u.__reactInternalMemoizedUnmaskedChildContext === r) return u.__reactInternalMemoizedMaskedChildContext;
    var h = {}, y;
    for (y in s) h[y] = r[y];
    return u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = r, t.__reactInternalMemoizedMaskedChildContext = h), h;
  }
  function ut(t) {
    return t = t.childContextTypes, t != null;
  }
  function ts() {
    Ee(lt), Ee(qe);
  }
  function xp(t, r, s) {
    if (qe.current !== kn) throw Error(o(168));
    Ce(qe, r), Ce(lt, s);
  }
  function _p(t, r, s) {
    var u = t.stateNode;
    if (r = r.childContextTypes, typeof u.getChildContext != "function") return s;
    u = u.getChildContext();
    for (var h in u) if (!(h in r)) throw Error(o(108, Ae(t) || "Unknown", h));
    return Y({}, s, u);
  }
  function ns(t) {
    return t = (t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext || kn, Xn = qe.current, Ce(qe, t), Ce(lt, lt.current), !0;
  }
  function Tp(t, r, s) {
    var u = t.stateNode;
    if (!u) throw Error(o(169));
    s ? (t = _p(t, r, Xn), u.__reactInternalMemoizedMergedChildContext = t, Ee(lt), Ee(qe), Ce(qe, t)) : Ee(lt), Ce(lt, s);
  }
  var rn = null, rs = !1, Dl = !1;
  function kp(t) {
    rn === null ? rn = [t] : rn.push(t);
  }
  function Zw(t) {
    rs = !0, kp(t);
  }
  function An() {
    if (!Dl && rn !== null) {
      Dl = !0;
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
      } catch (h) {
        throw rn !== null && (rn = rn.slice(t + 1)), Cf(el, An), h;
      } finally {
        xe = r, Dl = !1;
      }
    }
    return null;
  }
  var Lr = [], Vr = 0, os = null, is = 0, _t = [], Tt = 0, Zn = null, on = 1, sn = "";
  function Jn(t, r) {
    Lr[Vr++] = is, Lr[Vr++] = os, os = t, is = r;
  }
  function Ap(t, r, s) {
    _t[Tt++] = on, _t[Tt++] = sn, _t[Tt++] = Zn, Zn = t;
    var u = on;
    t = sn;
    var h = 32 - Rt(u) - 1;
    u &= ~(1 << h), s += 1;
    var y = 32 - Rt(r) + h;
    if (30 < y) {
      var x = h - h % 5;
      y = (u & (1 << x) - 1).toString(32), u >>= x, h -= x, on = 1 << 32 - Rt(r) + h | s << h | u, sn = y + t;
    } else on = 1 << y | s << h | u, sn = t;
  }
  function Nl(t) {
    t.return !== null && (Jn(t, 1), Ap(t, 1, 0));
  }
  function Il(t) {
    for (; t === os; ) os = Lr[--Vr], Lr[Vr] = null, is = Lr[--Vr], Lr[Vr] = null;
    for (; t === Zn; ) Zn = _t[--Tt], _t[Tt] = null, sn = _t[--Tt], _t[Tt] = null, on = _t[--Tt], _t[Tt] = null;
  }
  var gt = null, vt = null, Re = !1, Nt = null;
  function Cp(t, r) {
    var s = Pt(5, null, null, 0);
    s.elementType = "DELETED", s.stateNode = r, s.return = t, r = t.deletions, r === null ? (t.deletions = [s], t.flags |= 16) : r.push(s);
  }
  function Pp(t, r) {
    switch (t.tag) {
      case 5:
        var s = t.type;
        return r = r.nodeType !== 1 || s.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (t.stateNode = r, gt = t, vt = _n(r.firstChild), !0) : !1;
      case 6:
        return r = t.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (t.stateNode = r, gt = t, vt = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (s = Zn !== null ? { id: on, overflow: sn } : null, t.memoizedState = { dehydrated: r, treeContext: s, retryLane: 1073741824 }, s = Pt(18, null, null, 0), s.stateNode = r, s.return = t, t.child = s, gt = t, vt = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Fl(t) {
    return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
  }
  function jl(t) {
    if (Re) {
      var r = vt;
      if (r) {
        var s = r;
        if (!Pp(t, r)) {
          if (Fl(t)) throw Error(o(418));
          r = _n(s.nextSibling);
          var u = gt;
          r && Pp(t, r) ? Cp(u, s) : (t.flags = t.flags & -4097 | 2, Re = !1, gt = t);
        }
      } else {
        if (Fl(t)) throw Error(o(418));
        t.flags = t.flags & -4097 | 2, Re = !1, gt = t;
      }
    }
  }
  function Ep(t) {
    for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; ) t = t.return;
    gt = t;
  }
  function ss(t) {
    if (t !== gt) return !1;
    if (!Re) return Ep(t), Re = !0, !1;
    var r;
    if ((r = t.tag !== 3) && !(r = t.tag !== 5) && (r = t.type, r = r !== "head" && r !== "body" && !Pl(t.type, t.memoizedProps)), r && (r = vt)) {
      if (Fl(t)) throw bp(), Error(o(418));
      for (; r; ) Cp(t, r), r = _n(r.nextSibling);
    }
    if (Ep(t), t.tag === 13) {
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
  function bp() {
    for (var t = vt; t; ) t = _n(t.nextSibling);
  }
  function Br() {
    vt = gt = null, Re = !1;
  }
  function Ol(t) {
    Nt === null ? Nt = [t] : Nt.push(t);
  }
  var Jw = N.ReactCurrentBatchConfig;
  function $o(t, r, s) {
    if (t = s.ref, t !== null && typeof t != "function" && typeof t != "object") {
      if (s._owner) {
        if (s = s._owner, s) {
          if (s.tag !== 1) throw Error(o(309));
          var u = s.stateNode;
        }
        if (!u) throw Error(o(147, t));
        var h = u, y = "" + t;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === y ? r.ref : (r = function(x) {
          var P = h.refs;
          x === null ? delete P[y] : P[y] = x;
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
  function Mp(t) {
    var r = t._init;
    return r(t._payload);
  }
  function Rp(t) {
    function r(I, R) {
      if (t) {
        var F = I.deletions;
        F === null ? (I.deletions = [R], I.flags |= 16) : F.push(R);
      }
    }
    function s(I, R) {
      if (!t) return null;
      for (; R !== null; ) r(I, R), R = R.sibling;
      return null;
    }
    function u(I, R) {
      for (I = /* @__PURE__ */ new Map(); R !== null; ) R.key !== null ? I.set(R.key, R) : I.set(R.index, R), R = R.sibling;
      return I;
    }
    function h(I, R) {
      return I = Nn(I, R), I.index = 0, I.sibling = null, I;
    }
    function y(I, R, F) {
      return I.index = F, t ? (F = I.alternate, F !== null ? (F = F.index, F < R ? (I.flags |= 2, R) : F) : (I.flags |= 2, R)) : (I.flags |= 1048576, R);
    }
    function x(I) {
      return t && I.alternate === null && (I.flags |= 2), I;
    }
    function P(I, R, F, H) {
      return R === null || R.tag !== 6 ? (R = Eu(F, I.mode, H), R.return = I, R) : (R = h(R, F), R.return = I, R);
    }
    function b(I, R, F, H) {
      var oe = F.type;
      return oe === K ? z(I, R, F.props.children, H, F.key) : R !== null && (R.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ve && Mp(oe) === R.type) ? (H = h(R, F.props), H.ref = $o(I, R, F), H.return = I, H) : (H = Rs(F.type, F.key, F.props, null, I.mode, H), H.ref = $o(I, R, F), H.return = I, H);
    }
    function j(I, R, F, H) {
      return R === null || R.tag !== 4 || R.stateNode.containerInfo !== F.containerInfo || R.stateNode.implementation !== F.implementation ? (R = bu(F, I.mode, H), R.return = I, R) : (R = h(R, F.children || []), R.return = I, R);
    }
    function z(I, R, F, H, oe) {
      return R === null || R.tag !== 7 ? (R = sr(F, I.mode, H, oe), R.return = I, R) : (R = h(R, F), R.return = I, R);
    }
    function $(I, R, F) {
      if (typeof R == "string" && R !== "" || typeof R == "number") return R = Eu("" + R, I.mode, F), R.return = I, R;
      if (typeof R == "object" && R !== null) {
        switch (R.$$typeof) {
          case O:
            return F = Rs(R.type, R.key, R.props, null, I.mode, F), F.ref = $o(I, null, R), F.return = I, F;
          case W:
            return R = bu(R, I.mode, F), R.return = I, R;
          case ve:
            var H = R._init;
            return $(I, H(R._payload), F);
        }
        if (vo(R) || X(R)) return R = sr(R, I.mode, F, null), R.return = I, R;
        as(I, R);
      }
      return null;
    }
    function B(I, R, F, H) {
      var oe = R !== null ? R.key : null;
      if (typeof F == "string" && F !== "" || typeof F == "number") return oe !== null ? null : P(I, R, "" + F, H);
      if (typeof F == "object" && F !== null) {
        switch (F.$$typeof) {
          case O:
            return F.key === oe ? b(I, R, F, H) : null;
          case W:
            return F.key === oe ? j(I, R, F, H) : null;
          case ve:
            return oe = F._init, B(
              I,
              R,
              oe(F._payload),
              H
            );
        }
        if (vo(F) || X(F)) return oe !== null ? null : z(I, R, F, H, null);
        as(I, F);
      }
      return null;
    }
    function Z(I, R, F, H, oe) {
      if (typeof H == "string" && H !== "" || typeof H == "number") return I = I.get(F) || null, P(R, I, "" + H, oe);
      if (typeof H == "object" && H !== null) {
        switch (H.$$typeof) {
          case O:
            return I = I.get(H.key === null ? F : H.key) || null, b(R, I, H, oe);
          case W:
            return I = I.get(H.key === null ? F : H.key) || null, j(R, I, H, oe);
          case ve:
            var ie = H._init;
            return Z(I, R, F, ie(H._payload), oe);
        }
        if (vo(H) || X(H)) return I = I.get(F) || null, z(R, I, H, oe, null);
        as(R, H);
      }
      return null;
    }
    function ee(I, R, F, H) {
      for (var oe = null, ie = null, se = R, le = R = 0, We = null; se !== null && le < F.length; le++) {
        se.index > le ? (We = se, se = null) : We = se.sibling;
        var ge = B(I, se, F[le], H);
        if (ge === null) {
          se === null && (se = We);
          break;
        }
        t && se && ge.alternate === null && r(I, se), R = y(ge, R, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge, se = We;
      }
      if (le === F.length) return s(I, se), Re && Jn(I, le), oe;
      if (se === null) {
        for (; le < F.length; le++) se = $(I, F[le], H), se !== null && (R = y(se, R, le), ie === null ? oe = se : ie.sibling = se, ie = se);
        return Re && Jn(I, le), oe;
      }
      for (se = u(I, se); le < F.length; le++) We = Z(se, I, le, F[le], H), We !== null && (t && We.alternate !== null && se.delete(We.key === null ? le : We.key), R = y(We, R, le), ie === null ? oe = We : ie.sibling = We, ie = We);
      return t && se.forEach(function(In) {
        return r(I, In);
      }), Re && Jn(I, le), oe;
    }
    function re(I, R, F, H) {
      var oe = X(F);
      if (typeof oe != "function") throw Error(o(150));
      if (F = oe.call(F), F == null) throw Error(o(151));
      for (var ie = oe = null, se = R, le = R = 0, We = null, ge = F.next(); se !== null && !ge.done; le++, ge = F.next()) {
        se.index > le ? (We = se, se = null) : We = se.sibling;
        var In = B(I, se, ge.value, H);
        if (In === null) {
          se === null && (se = We);
          break;
        }
        t && se && In.alternate === null && r(I, se), R = y(In, R, le), ie === null ? oe = In : ie.sibling = In, ie = In, se = We;
      }
      if (ge.done) return s(
        I,
        se
      ), Re && Jn(I, le), oe;
      if (se === null) {
        for (; !ge.done; le++, ge = F.next()) ge = $(I, ge.value, H), ge !== null && (R = y(ge, R, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge);
        return Re && Jn(I, le), oe;
      }
      for (se = u(I, se); !ge.done; le++, ge = F.next()) ge = Z(se, I, le, ge.value, H), ge !== null && (t && ge.alternate !== null && se.delete(ge.key === null ? le : ge.key), R = y(ge, R, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge);
      return t && se.forEach(function(Rx) {
        return r(I, Rx);
      }), Re && Jn(I, le), oe;
    }
    function Oe(I, R, F, H) {
      if (typeof F == "object" && F !== null && F.type === K && F.key === null && (F = F.props.children), typeof F == "object" && F !== null) {
        switch (F.$$typeof) {
          case O:
            e: {
              for (var oe = F.key, ie = R; ie !== null; ) {
                if (ie.key === oe) {
                  if (oe = F.type, oe === K) {
                    if (ie.tag === 7) {
                      s(I, ie.sibling), R = h(ie, F.props.children), R.return = I, I = R;
                      break e;
                    }
                  } else if (ie.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ve && Mp(oe) === ie.type) {
                    s(I, ie.sibling), R = h(ie, F.props), R.ref = $o(I, ie, F), R.return = I, I = R;
                    break e;
                  }
                  s(I, ie);
                  break;
                } else r(I, ie);
                ie = ie.sibling;
              }
              F.type === K ? (R = sr(F.props.children, I.mode, H, F.key), R.return = I, I = R) : (H = Rs(F.type, F.key, F.props, null, I.mode, H), H.ref = $o(I, R, F), H.return = I, I = H);
            }
            return x(I);
          case W:
            e: {
              for (ie = F.key; R !== null; ) {
                if (R.key === ie) if (R.tag === 4 && R.stateNode.containerInfo === F.containerInfo && R.stateNode.implementation === F.implementation) {
                  s(I, R.sibling), R = h(R, F.children || []), R.return = I, I = R;
                  break e;
                } else {
                  s(I, R);
                  break;
                }
                else r(I, R);
                R = R.sibling;
              }
              R = bu(F, I.mode, H), R.return = I, I = R;
            }
            return x(I);
          case ve:
            return ie = F._init, Oe(I, R, ie(F._payload), H);
        }
        if (vo(F)) return ee(I, R, F, H);
        if (X(F)) return re(I, R, F, H);
        as(I, F);
      }
      return typeof F == "string" && F !== "" || typeof F == "number" ? (F = "" + F, R !== null && R.tag === 6 ? (s(I, R.sibling), R = h(R, F), R.return = I, I = R) : (s(I, R), R = Eu(F, I.mode, H), R.return = I, I = R), x(I)) : s(I, R);
    }
    return Oe;
  }
  var zr = Rp(!0), Dp = Rp(!1), ls = Tn(null), us = null, Ur = null, Ll = null;
  function Vl() {
    Ll = Ur = us = null;
  }
  function Bl(t) {
    var r = ls.current;
    Ee(ls), t._currentValue = r;
  }
  function zl(t, r, s) {
    for (; t !== null; ) {
      var u = t.alternate;
      if ((t.childLanes & r) !== r ? (t.childLanes |= r, u !== null && (u.childLanes |= r)) : u !== null && (u.childLanes & r) !== r && (u.childLanes |= r), t === s) break;
      t = t.return;
    }
  }
  function $r(t, r) {
    us = t, Ll = Ur = null, t = t.dependencies, t !== null && t.firstContext !== null && ((t.lanes & r) !== 0 && (ct = !0), t.firstContext = null);
  }
  function kt(t) {
    var r = t._currentValue;
    if (Ll !== t) if (t = { context: t, memoizedValue: r, next: null }, Ur === null) {
      if (us === null) throw Error(o(308));
      Ur = t, us.dependencies = { lanes: 0, firstContext: t };
    } else Ur = Ur.next = t;
    return r;
  }
  var qn = null;
  function Ul(t) {
    qn === null ? qn = [t] : qn.push(t);
  }
  function Np(t, r, s, u) {
    var h = r.interleaved;
    return h === null ? (s.next = s, Ul(r)) : (s.next = h.next, h.next = s), r.interleaved = s, an(t, u);
  }
  function an(t, r) {
    t.lanes |= r;
    var s = t.alternate;
    for (s !== null && (s.lanes |= r), s = t, t = t.return; t !== null; ) t.childLanes |= r, s = t.alternate, s !== null && (s.childLanes |= r), s = t, t = t.return;
    return s.tag === 3 ? s.stateNode : null;
  }
  var Cn = !1;
  function $l(t) {
    t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Ip(t, r) {
    t = t.updateQueue, r.updateQueue === t && (r.updateQueue = { baseState: t.baseState, firstBaseUpdate: t.firstBaseUpdate, lastBaseUpdate: t.lastBaseUpdate, shared: t.shared, effects: t.effects });
  }
  function ln(t, r) {
    return { eventTime: t, lane: r, tag: 0, payload: null, callback: null, next: null };
  }
  function Pn(t, r, s) {
    var u = t.updateQueue;
    if (u === null) return null;
    if (u = u.shared, (he & 2) !== 0) {
      var h = u.pending;
      return h === null ? r.next = r : (r.next = h.next, h.next = r), u.pending = r, an(t, s);
    }
    return h = u.interleaved, h === null ? (r.next = r, Ul(u)) : (r.next = h.next, h.next = r), u.interleaved = r, an(t, s);
  }
  function cs(t, r, s) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (s & 4194240) !== 0)) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, rl(t, s);
    }
  }
  function Fp(t, r) {
    var s = t.updateQueue, u = t.alternate;
    if (u !== null && (u = u.updateQueue, s === u)) {
      var h = null, y = null;
      if (s = s.firstBaseUpdate, s !== null) {
        do {
          var x = { eventTime: s.eventTime, lane: s.lane, tag: s.tag, payload: s.payload, callback: s.callback, next: null };
          y === null ? h = y = x : y = y.next = x, s = s.next;
        } while (s !== null);
        y === null ? h = y = r : y = y.next = r;
      } else h = y = r;
      s = { baseState: u.baseState, firstBaseUpdate: h, lastBaseUpdate: y, shared: u.shared, effects: u.effects }, t.updateQueue = s;
      return;
    }
    t = s.lastBaseUpdate, t === null ? s.firstBaseUpdate = r : t.next = r, s.lastBaseUpdate = r;
  }
  function ds(t, r, s, u) {
    var h = t.updateQueue;
    Cn = !1;
    var y = h.firstBaseUpdate, x = h.lastBaseUpdate, P = h.shared.pending;
    if (P !== null) {
      h.shared.pending = null;
      var b = P, j = b.next;
      b.next = null, x === null ? y = j : x.next = j, x = b;
      var z = t.alternate;
      z !== null && (z = z.updateQueue, P = z.lastBaseUpdate, P !== x && (P === null ? z.firstBaseUpdate = j : P.next = j, z.lastBaseUpdate = b));
    }
    if (y !== null) {
      var $ = h.baseState;
      x = 0, z = j = b = null, P = y;
      do {
        var B = P.lane, Z = P.eventTime;
        if ((u & B) === B) {
          z !== null && (z = z.next = {
            eventTime: Z,
            lane: 0,
            tag: P.tag,
            payload: P.payload,
            callback: P.callback,
            next: null
          });
          e: {
            var ee = t, re = P;
            switch (B = r, Z = s, re.tag) {
              case 1:
                if (ee = re.payload, typeof ee == "function") {
                  $ = ee.call(Z, $, B);
                  break e;
                }
                $ = ee;
                break e;
              case 3:
                ee.flags = ee.flags & -65537 | 128;
              case 0:
                if (ee = re.payload, B = typeof ee == "function" ? ee.call(Z, $, B) : ee, B == null) break e;
                $ = Y({}, $, B);
                break e;
              case 2:
                Cn = !0;
            }
          }
          P.callback !== null && P.lane !== 0 && (t.flags |= 64, B = h.effects, B === null ? h.effects = [P] : B.push(P));
        } else Z = { eventTime: Z, lane: B, tag: P.tag, payload: P.payload, callback: P.callback, next: null }, z === null ? (j = z = Z, b = $) : z = z.next = Z, x |= B;
        if (P = P.next, P === null) {
          if (P = h.shared.pending, P === null) break;
          B = P, P = B.next, B.next = null, h.lastBaseUpdate = B, h.shared.pending = null;
        }
      } while (!0);
      if (z === null && (b = $), h.baseState = b, h.firstBaseUpdate = j, h.lastBaseUpdate = z, r = h.shared.interleaved, r !== null) {
        h = r;
        do
          x |= h.lane, h = h.next;
        while (h !== r);
      } else y === null && (h.shared.lanes = 0);
      nr |= x, t.lanes = x, t.memoizedState = $;
    }
  }
  function jp(t, r, s) {
    if (t = r.effects, r.effects = null, t !== null) for (r = 0; r < t.length; r++) {
      var u = t[r], h = u.callback;
      if (h !== null) {
        if (u.callback = null, u = s, typeof h != "function") throw Error(o(191, h));
        h.call(u);
      }
    }
  }
  var Ho = {}, Ht = Tn(Ho), Wo = Tn(Ho), Go = Tn(Ho);
  function er(t) {
    if (t === Ho) throw Error(o(174));
    return t;
  }
  function Hl(t, r) {
    switch (Ce(Go, r), Ce(Wo, t), Ce(Ht, Ho), t = r.nodeType, t) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : Wa(null, "");
        break;
      default:
        t = t === 8 ? r.parentNode : r, r = t.namespaceURI || null, t = t.tagName, r = Wa(r, t);
    }
    Ee(Ht), Ce(Ht, r);
  }
  function Hr() {
    Ee(Ht), Ee(Wo), Ee(Go);
  }
  function Op(t) {
    er(Go.current);
    var r = er(Ht.current), s = Wa(r, t.type);
    r !== s && (Ce(Wo, t), Ce(Ht, s));
  }
  function Wl(t) {
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
  var Gl = [];
  function Kl() {
    for (var t = 0; t < Gl.length; t++) Gl[t]._workInProgressVersionPrimary = null;
    Gl.length = 0;
  }
  var ps = N.ReactCurrentDispatcher, Yl = N.ReactCurrentBatchConfig, tr = 0, Ne = null, Be = null, $e = null, hs = !1, Ko = !1, Yo = 0, qw = 0;
  function et() {
    throw Error(o(321));
  }
  function Ql(t, r) {
    if (r === null) return !1;
    for (var s = 0; s < r.length && s < t.length; s++) if (!Dt(t[s], r[s])) return !1;
    return !0;
  }
  function Xl(t, r, s, u, h, y) {
    if (tr = y, Ne = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, ps.current = t === null || t.memoizedState === null ? rx : ox, t = s(u, h), Ko) {
      y = 0;
      do {
        if (Ko = !1, Yo = 0, 25 <= y) throw Error(o(301));
        y += 1, $e = Be = null, r.updateQueue = null, ps.current = ix, t = s(u, h);
      } while (Ko);
    }
    if (ps.current = gs, r = Be !== null && Be.next !== null, tr = 0, $e = Be = Ne = null, hs = !1, r) throw Error(o(300));
    return t;
  }
  function Zl() {
    var t = Yo !== 0;
    return Yo = 0, t;
  }
  function Wt() {
    var t = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return $e === null ? Ne.memoizedState = $e = t : $e = $e.next = t, $e;
  }
  function At() {
    if (Be === null) {
      var t = Ne.alternate;
      t = t !== null ? t.memoizedState : null;
    } else t = Be.next;
    var r = $e === null ? Ne.memoizedState : $e.next;
    if (r !== null) $e = r, Be = t;
    else {
      if (t === null) throw Error(o(310));
      Be = t, t = { memoizedState: Be.memoizedState, baseState: Be.baseState, baseQueue: Be.baseQueue, queue: Be.queue, next: null }, $e === null ? Ne.memoizedState = $e = t : $e = $e.next = t;
    }
    return $e;
  }
  function Qo(t, r) {
    return typeof r == "function" ? r(t) : r;
  }
  function Jl(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = t;
    var u = Be, h = u.baseQueue, y = s.pending;
    if (y !== null) {
      if (h !== null) {
        var x = h.next;
        h.next = y.next, y.next = x;
      }
      u.baseQueue = h = y, s.pending = null;
    }
    if (h !== null) {
      y = h.next, u = u.baseState;
      var P = x = null, b = null, j = y;
      do {
        var z = j.lane;
        if ((tr & z) === z) b !== null && (b = b.next = { lane: 0, action: j.action, hasEagerState: j.hasEagerState, eagerState: j.eagerState, next: null }), u = j.hasEagerState ? j.eagerState : t(u, j.action);
        else {
          var $ = {
            lane: z,
            action: j.action,
            hasEagerState: j.hasEagerState,
            eagerState: j.eagerState,
            next: null
          };
          b === null ? (P = b = $, x = u) : b = b.next = $, Ne.lanes |= z, nr |= z;
        }
        j = j.next;
      } while (j !== null && j !== y);
      b === null ? x = u : b.next = P, Dt(u, r.memoizedState) || (ct = !0), r.memoizedState = u, r.baseState = x, r.baseQueue = b, s.lastRenderedState = u;
    }
    if (t = s.interleaved, t !== null) {
      h = t;
      do
        y = h.lane, Ne.lanes |= y, nr |= y, h = h.next;
      while (h !== t);
    } else h === null && (s.lanes = 0);
    return [r.memoizedState, s.dispatch];
  }
  function ql(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = t;
    var u = s.dispatch, h = s.pending, y = r.memoizedState;
    if (h !== null) {
      s.pending = null;
      var x = h = h.next;
      do
        y = t(y, x.action), x = x.next;
      while (x !== h);
      Dt(y, r.memoizedState) || (ct = !0), r.memoizedState = y, r.baseQueue === null && (r.baseState = y), s.lastRenderedState = y;
    }
    return [y, u];
  }
  function Lp() {
  }
  function Vp(t, r) {
    var s = Ne, u = At(), h = r(), y = !Dt(u.memoizedState, h);
    if (y && (u.memoizedState = h, ct = !0), u = u.queue, eu(Up.bind(null, s, u, t), [t]), u.getSnapshot !== r || y || $e !== null && $e.memoizedState.tag & 1) {
      if (s.flags |= 2048, Xo(9, zp.bind(null, s, u, h, r), void 0, null), He === null) throw Error(o(349));
      (tr & 30) !== 0 || Bp(s, r, h);
    }
    return h;
  }
  function Bp(t, r, s) {
    t.flags |= 16384, t = { getSnapshot: r, value: s }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.stores = [t]) : (s = r.stores, s === null ? r.stores = [t] : s.push(t));
  }
  function zp(t, r, s, u) {
    r.value = s, r.getSnapshot = u, $p(r) && Hp(t);
  }
  function Up(t, r, s) {
    return s(function() {
      $p(r) && Hp(t);
    });
  }
  function $p(t) {
    var r = t.getSnapshot;
    t = t.value;
    try {
      var s = r();
      return !Dt(t, s);
    } catch {
      return !0;
    }
  }
  function Hp(t) {
    var r = an(t, 1);
    r !== null && Ot(r, t, 1, -1);
  }
  function Wp(t) {
    var r = Wt();
    return typeof t == "function" && (t = t()), r.memoizedState = r.baseState = t, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Qo, lastRenderedState: t }, r.queue = t, t = t.dispatch = nx.bind(null, Ne, t), [r.memoizedState, t];
  }
  function Xo(t, r, s, u) {
    return t = { tag: t, create: r, destroy: s, deps: u, next: null }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.lastEffect = t.next = t) : (s = r.lastEffect, s === null ? r.lastEffect = t.next = t : (u = s.next, s.next = t, t.next = u, r.lastEffect = t)), t;
  }
  function Gp() {
    return At().memoizedState;
  }
  function ms(t, r, s, u) {
    var h = Wt();
    Ne.flags |= t, h.memoizedState = Xo(1 | r, s, void 0, u === void 0 ? null : u);
  }
  function ys(t, r, s, u) {
    var h = At();
    u = u === void 0 ? null : u;
    var y = void 0;
    if (Be !== null) {
      var x = Be.memoizedState;
      if (y = x.destroy, u !== null && Ql(u, x.deps)) {
        h.memoizedState = Xo(r, s, y, u);
        return;
      }
    }
    Ne.flags |= t, h.memoizedState = Xo(1 | r, s, y, u);
  }
  function Kp(t, r) {
    return ms(8390656, 8, t, r);
  }
  function eu(t, r) {
    return ys(2048, 8, t, r);
  }
  function Yp(t, r) {
    return ys(4, 2, t, r);
  }
  function Qp(t, r) {
    return ys(4, 4, t, r);
  }
  function Xp(t, r) {
    if (typeof r == "function") return t = t(), r(t), function() {
      r(null);
    };
    if (r != null) return t = t(), r.current = t, function() {
      r.current = null;
    };
  }
  function Zp(t, r, s) {
    return s = s != null ? s.concat([t]) : null, ys(4, 4, Xp.bind(null, r, t), s);
  }
  function tu() {
  }
  function Jp(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && Ql(r, u[1]) ? u[0] : (s.memoizedState = [t, r], t);
  }
  function qp(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && Ql(r, u[1]) ? u[0] : (t = t(), s.memoizedState = [t, r], t);
  }
  function eh(t, r, s) {
    return (tr & 21) === 0 ? (t.baseState && (t.baseState = !1, ct = !0), t.memoizedState = s) : (Dt(s, r) || (s = Mf(), Ne.lanes |= s, nr |= s, t.baseState = !0), r);
  }
  function ex(t, r) {
    var s = xe;
    xe = s !== 0 && 4 > s ? s : 4, t(!0);
    var u = Yl.transition;
    Yl.transition = {};
    try {
      t(!1), r();
    } finally {
      xe = s, Yl.transition = u;
    }
  }
  function th() {
    return At().memoizedState;
  }
  function tx(t, r, s) {
    var u = Rn(t);
    if (s = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null }, nh(t)) rh(r, s);
    else if (s = Np(t, r, s, u), s !== null) {
      var h = ot();
      Ot(s, t, u, h), oh(s, r, u);
    }
  }
  function nx(t, r, s) {
    var u = Rn(t), h = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null };
    if (nh(t)) rh(r, h);
    else {
      var y = t.alternate;
      if (t.lanes === 0 && (y === null || y.lanes === 0) && (y = r.lastRenderedReducer, y !== null)) try {
        var x = r.lastRenderedState, P = y(x, s);
        if (h.hasEagerState = !0, h.eagerState = P, Dt(P, x)) {
          var b = r.interleaved;
          b === null ? (h.next = h, Ul(r)) : (h.next = b.next, b.next = h), r.interleaved = h;
          return;
        }
      } catch {
      } finally {
      }
      s = Np(t, r, h, u), s !== null && (h = ot(), Ot(s, t, u, h), oh(s, r, u));
    }
  }
  function nh(t) {
    var r = t.alternate;
    return t === Ne || r !== null && r === Ne;
  }
  function rh(t, r) {
    Ko = hs = !0;
    var s = t.pending;
    s === null ? r.next = r : (r.next = s.next, s.next = r), t.pending = r;
  }
  function oh(t, r, s) {
    if ((s & 4194240) !== 0) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, rl(t, s);
    }
  }
  var gs = { readContext: kt, useCallback: et, useContext: et, useEffect: et, useImperativeHandle: et, useInsertionEffect: et, useLayoutEffect: et, useMemo: et, useReducer: et, useRef: et, useState: et, useDebugValue: et, useDeferredValue: et, useTransition: et, useMutableSource: et, useSyncExternalStore: et, useId: et, unstable_isNewReconciler: !1 }, rx = { readContext: kt, useCallback: function(t, r) {
    return Wt().memoizedState = [t, r === void 0 ? null : r], t;
  }, useContext: kt, useEffect: Kp, useImperativeHandle: function(t, r, s) {
    return s = s != null ? s.concat([t]) : null, ms(
      4194308,
      4,
      Xp.bind(null, r, t),
      s
    );
  }, useLayoutEffect: function(t, r) {
    return ms(4194308, 4, t, r);
  }, useInsertionEffect: function(t, r) {
    return ms(4, 2, t, r);
  }, useMemo: function(t, r) {
    var s = Wt();
    return r = r === void 0 ? null : r, t = t(), s.memoizedState = [t, r], t;
  }, useReducer: function(t, r, s) {
    var u = Wt();
    return r = s !== void 0 ? s(r) : r, u.memoizedState = u.baseState = r, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: r }, u.queue = t, t = t.dispatch = tx.bind(null, Ne, t), [u.memoizedState, t];
  }, useRef: function(t) {
    var r = Wt();
    return t = { current: t }, r.memoizedState = t;
  }, useState: Wp, useDebugValue: tu, useDeferredValue: function(t) {
    return Wt().memoizedState = t;
  }, useTransition: function() {
    var t = Wp(!1), r = t[0];
    return t = ex.bind(null, t[1]), Wt().memoizedState = t, [r, t];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(t, r, s) {
    var u = Ne, h = Wt();
    if (Re) {
      if (s === void 0) throw Error(o(407));
      s = s();
    } else {
      if (s = r(), He === null) throw Error(o(349));
      (tr & 30) !== 0 || Bp(u, r, s);
    }
    h.memoizedState = s;
    var y = { value: s, getSnapshot: r };
    return h.queue = y, Kp(Up.bind(
      null,
      u,
      y,
      t
    ), [t]), u.flags |= 2048, Xo(9, zp.bind(null, u, y, s, r), void 0, null), s;
  }, useId: function() {
    var t = Wt(), r = He.identifierPrefix;
    if (Re) {
      var s = sn, u = on;
      s = (u & ~(1 << 32 - Rt(u) - 1)).toString(32) + s, r = ":" + r + "R" + s, s = Yo++, 0 < s && (r += "H" + s.toString(32)), r += ":";
    } else s = qw++, r = ":" + r + "r" + s.toString(32) + ":";
    return t.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, ox = {
    readContext: kt,
    useCallback: Jp,
    useContext: kt,
    useEffect: eu,
    useImperativeHandle: Zp,
    useInsertionEffect: Yp,
    useLayoutEffect: Qp,
    useMemo: qp,
    useReducer: Jl,
    useRef: Gp,
    useState: function() {
      return Jl(Qo);
    },
    useDebugValue: tu,
    useDeferredValue: function(t) {
      var r = At();
      return eh(r, Be.memoizedState, t);
    },
    useTransition: function() {
      var t = Jl(Qo)[0], r = At().memoizedState;
      return [t, r];
    },
    useMutableSource: Lp,
    useSyncExternalStore: Vp,
    useId: th,
    unstable_isNewReconciler: !1
  }, ix = { readContext: kt, useCallback: Jp, useContext: kt, useEffect: eu, useImperativeHandle: Zp, useInsertionEffect: Yp, useLayoutEffect: Qp, useMemo: qp, useReducer: ql, useRef: Gp, useState: function() {
    return ql(Qo);
  }, useDebugValue: tu, useDeferredValue: function(t) {
    var r = At();
    return Be === null ? r.memoizedState = t : eh(r, Be.memoizedState, t);
  }, useTransition: function() {
    var t = ql(Qo)[0], r = At().memoizedState;
    return [t, r];
  }, useMutableSource: Lp, useSyncExternalStore: Vp, useId: th, unstable_isNewReconciler: !1 };
  function It(t, r) {
    if (t && t.defaultProps) {
      r = Y({}, r), t = t.defaultProps;
      for (var s in t) r[s] === void 0 && (r[s] = t[s]);
      return r;
    }
    return r;
  }
  function nu(t, r, s, u) {
    r = t.memoizedState, s = s(u, r), s = s == null ? r : Y({}, r, s), t.memoizedState = s, t.lanes === 0 && (t.updateQueue.baseState = s);
  }
  var vs = { isMounted: function(t) {
    return (t = t._reactInternals) ? Yn(t) === t : !1;
  }, enqueueSetState: function(t, r, s) {
    t = t._reactInternals;
    var u = ot(), h = Rn(t), y = ln(u, h);
    y.payload = r, s != null && (y.callback = s), r = Pn(t, y, h), r !== null && (Ot(r, t, h, u), cs(r, t, h));
  }, enqueueReplaceState: function(t, r, s) {
    t = t._reactInternals;
    var u = ot(), h = Rn(t), y = ln(u, h);
    y.tag = 1, y.payload = r, s != null && (y.callback = s), r = Pn(t, y, h), r !== null && (Ot(r, t, h, u), cs(r, t, h));
  }, enqueueForceUpdate: function(t, r) {
    t = t._reactInternals;
    var s = ot(), u = Rn(t), h = ln(s, u);
    h.tag = 2, r != null && (h.callback = r), r = Pn(t, h, u), r !== null && (Ot(r, t, u, s), cs(r, t, u));
  } };
  function ih(t, r, s, u, h, y, x) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(u, y, x) : r.prototype && r.prototype.isPureReactComponent ? !jo(s, u) || !jo(h, y) : !0;
  }
  function sh(t, r, s) {
    var u = !1, h = kn, y = r.contextType;
    return typeof y == "object" && y !== null ? y = kt(y) : (h = ut(r) ? Xn : qe.current, u = r.contextTypes, y = (u = u != null) ? Or(t, h) : kn), r = new r(s, y), t.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = vs, t.stateNode = r, r._reactInternals = t, u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = h, t.__reactInternalMemoizedMaskedChildContext = y), r;
  }
  function ah(t, r, s, u) {
    t = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(s, u), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(s, u), r.state !== t && vs.enqueueReplaceState(r, r.state, null);
  }
  function ru(t, r, s, u) {
    var h = t.stateNode;
    h.props = s, h.state = t.memoizedState, h.refs = {}, $l(t);
    var y = r.contextType;
    typeof y == "object" && y !== null ? h.context = kt(y) : (y = ut(r) ? Xn : qe.current, h.context = Or(t, y)), h.state = t.memoizedState, y = r.getDerivedStateFromProps, typeof y == "function" && (nu(t, r, y, s), h.state = t.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof h.getSnapshotBeforeUpdate == "function" || typeof h.UNSAFE_componentWillMount != "function" && typeof h.componentWillMount != "function" || (r = h.state, typeof h.componentWillMount == "function" && h.componentWillMount(), typeof h.UNSAFE_componentWillMount == "function" && h.UNSAFE_componentWillMount(), r !== h.state && vs.enqueueReplaceState(h, h.state, null), ds(t, s, h, u), h.state = t.memoizedState), typeof h.componentDidMount == "function" && (t.flags |= 4194308);
  }
  function Wr(t, r) {
    try {
      var s = "", u = r;
      do
        s += me(u), u = u.return;
      while (u);
      var h = s;
    } catch (y) {
      h = `
Error generating stack: ` + y.message + `
` + y.stack;
    }
    return { value: t, source: r, stack: h, digest: null };
  }
  function ou(t, r, s) {
    return { value: t, source: null, stack: s ?? null, digest: r ?? null };
  }
  function iu(t, r) {
    try {
      console.error(r.value);
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  var sx = typeof WeakMap == "function" ? WeakMap : Map;
  function lh(t, r, s) {
    s = ln(-1, s), s.tag = 3, s.payload = { element: null };
    var u = r.value;
    return s.callback = function() {
      As || (As = !0, wu = u), iu(t, r);
    }, s;
  }
  function uh(t, r, s) {
    s = ln(-1, s), s.tag = 3;
    var u = t.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var h = r.value;
      s.payload = function() {
        return u(h);
      }, s.callback = function() {
        iu(t, r);
      };
    }
    var y = t.stateNode;
    return y !== null && typeof y.componentDidCatch == "function" && (s.callback = function() {
      iu(t, r), typeof u != "function" && (bn === null ? bn = /* @__PURE__ */ new Set([this]) : bn.add(this));
      var x = r.stack;
      this.componentDidCatch(r.value, { componentStack: x !== null ? x : "" });
    }), s;
  }
  function ch(t, r, s) {
    var u = t.pingCache;
    if (u === null) {
      u = t.pingCache = new sx();
      var h = /* @__PURE__ */ new Set();
      u.set(r, h);
    } else h = u.get(r), h === void 0 && (h = /* @__PURE__ */ new Set(), u.set(r, h));
    h.has(s) || (h.add(s), t = wx.bind(null, t, r, s), r.then(t, t));
  }
  function dh(t) {
    do {
      var r;
      if ((r = t.tag === 13) && (r = t.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r) return t;
      t = t.return;
    } while (t !== null);
    return null;
  }
  function fh(t, r, s, u, h) {
    return (t.mode & 1) === 0 ? (t === r ? t.flags |= 65536 : (t.flags |= 128, s.flags |= 131072, s.flags &= -52805, s.tag === 1 && (s.alternate === null ? s.tag = 17 : (r = ln(-1, 1), r.tag = 2, Pn(s, r, 1))), s.lanes |= 1), t) : (t.flags |= 65536, t.lanes = h, t);
  }
  var ax = N.ReactCurrentOwner, ct = !1;
  function rt(t, r, s, u) {
    r.child = t === null ? Dp(r, null, s, u) : zr(r, t.child, s, u);
  }
  function ph(t, r, s, u, h) {
    s = s.render;
    var y = r.ref;
    return $r(r, h), u = Xl(t, r, s, u, y, h), s = Zl(), t !== null && !ct ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~h, un(t, r, h)) : (Re && s && Nl(r), r.flags |= 1, rt(t, r, u, h), r.child);
  }
  function hh(t, r, s, u, h) {
    if (t === null) {
      var y = s.type;
      return typeof y == "function" && !Pu(y) && y.defaultProps === void 0 && s.compare === null && s.defaultProps === void 0 ? (r.tag = 15, r.type = y, mh(t, r, y, u, h)) : (t = Rs(s.type, null, u, r, r.mode, h), t.ref = r.ref, t.return = r, r.child = t);
    }
    if (y = t.child, (t.lanes & h) === 0) {
      var x = y.memoizedProps;
      if (s = s.compare, s = s !== null ? s : jo, s(x, u) && t.ref === r.ref) return un(t, r, h);
    }
    return r.flags |= 1, t = Nn(y, u), t.ref = r.ref, t.return = r, r.child = t;
  }
  function mh(t, r, s, u, h) {
    if (t !== null) {
      var y = t.memoizedProps;
      if (jo(y, u) && t.ref === r.ref) if (ct = !1, r.pendingProps = u = y, (t.lanes & h) !== 0) (t.flags & 131072) !== 0 && (ct = !0);
      else return r.lanes = t.lanes, un(t, r, h);
    }
    return su(t, r, s, u, h);
  }
  function yh(t, r, s) {
    var u = r.pendingProps, h = u.children, y = t !== null ? t.memoizedState : null;
    if (u.mode === "hidden") if ((r.mode & 1) === 0) r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Ce(Kr, St), St |= s;
    else {
      if ((s & 1073741824) === 0) return t = y !== null ? y.baseLanes | s : s, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: t, cachePool: null, transitions: null }, r.updateQueue = null, Ce(Kr, St), St |= t, null;
      r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, u = y !== null ? y.baseLanes : s, Ce(Kr, St), St |= u;
    }
    else y !== null ? (u = y.baseLanes | s, r.memoizedState = null) : u = s, Ce(Kr, St), St |= u;
    return rt(t, r, h, s), r.child;
  }
  function gh(t, r) {
    var s = r.ref;
    (t === null && s !== null || t !== null && t.ref !== s) && (r.flags |= 512, r.flags |= 2097152);
  }
  function su(t, r, s, u, h) {
    var y = ut(s) ? Xn : qe.current;
    return y = Or(r, y), $r(r, h), s = Xl(t, r, s, u, y, h), u = Zl(), t !== null && !ct ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~h, un(t, r, h)) : (Re && u && Nl(r), r.flags |= 1, rt(t, r, s, h), r.child);
  }
  function vh(t, r, s, u, h) {
    if (ut(s)) {
      var y = !0;
      ns(r);
    } else y = !1;
    if ($r(r, h), r.stateNode === null) ws(t, r), sh(r, s, u), ru(r, s, u, h), u = !0;
    else if (t === null) {
      var x = r.stateNode, P = r.memoizedProps;
      x.props = P;
      var b = x.context, j = s.contextType;
      typeof j == "object" && j !== null ? j = kt(j) : (j = ut(s) ? Xn : qe.current, j = Or(r, j));
      var z = s.getDerivedStateFromProps, $ = typeof z == "function" || typeof x.getSnapshotBeforeUpdate == "function";
      $ || typeof x.UNSAFE_componentWillReceiveProps != "function" && typeof x.componentWillReceiveProps != "function" || (P !== u || b !== j) && ah(r, x, u, j), Cn = !1;
      var B = r.memoizedState;
      x.state = B, ds(r, u, x, h), b = r.memoizedState, P !== u || B !== b || lt.current || Cn ? (typeof z == "function" && (nu(r, s, z, u), b = r.memoizedState), (P = Cn || ih(r, s, P, u, B, b, j)) ? ($ || typeof x.UNSAFE_componentWillMount != "function" && typeof x.componentWillMount != "function" || (typeof x.componentWillMount == "function" && x.componentWillMount(), typeof x.UNSAFE_componentWillMount == "function" && x.UNSAFE_componentWillMount()), typeof x.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof x.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = u, r.memoizedState = b), x.props = u, x.state = b, x.context = j, u = P) : (typeof x.componentDidMount == "function" && (r.flags |= 4194308), u = !1);
    } else {
      x = r.stateNode, Ip(t, r), P = r.memoizedProps, j = r.type === r.elementType ? P : It(r.type, P), x.props = j, $ = r.pendingProps, B = x.context, b = s.contextType, typeof b == "object" && b !== null ? b = kt(b) : (b = ut(s) ? Xn : qe.current, b = Or(r, b));
      var Z = s.getDerivedStateFromProps;
      (z = typeof Z == "function" || typeof x.getSnapshotBeforeUpdate == "function") || typeof x.UNSAFE_componentWillReceiveProps != "function" && typeof x.componentWillReceiveProps != "function" || (P !== $ || B !== b) && ah(r, x, u, b), Cn = !1, B = r.memoizedState, x.state = B, ds(r, u, x, h);
      var ee = r.memoizedState;
      P !== $ || B !== ee || lt.current || Cn ? (typeof Z == "function" && (nu(r, s, Z, u), ee = r.memoizedState), (j = Cn || ih(r, s, j, u, B, ee, b) || !1) ? (z || typeof x.UNSAFE_componentWillUpdate != "function" && typeof x.componentWillUpdate != "function" || (typeof x.componentWillUpdate == "function" && x.componentWillUpdate(u, ee, b), typeof x.UNSAFE_componentWillUpdate == "function" && x.UNSAFE_componentWillUpdate(u, ee, b)), typeof x.componentDidUpdate == "function" && (r.flags |= 4), typeof x.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof x.componentDidUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 4), typeof x.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 1024), r.memoizedProps = u, r.memoizedState = ee), x.props = u, x.state = ee, x.context = b, u = j) : (typeof x.componentDidUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 4), typeof x.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 1024), u = !1);
    }
    return au(t, r, s, u, y, h);
  }
  function au(t, r, s, u, h, y) {
    gh(t, r);
    var x = (r.flags & 128) !== 0;
    if (!u && !x) return h && Tp(r, s, !1), un(t, r, y);
    u = r.stateNode, ax.current = r;
    var P = x && typeof s.getDerivedStateFromError != "function" ? null : u.render();
    return r.flags |= 1, t !== null && x ? (r.child = zr(r, t.child, null, y), r.child = zr(r, null, P, y)) : rt(t, r, P, y), r.memoizedState = u.state, h && Tp(r, s, !0), r.child;
  }
  function Sh(t) {
    var r = t.stateNode;
    r.pendingContext ? xp(t, r.pendingContext, r.pendingContext !== r.context) : r.context && xp(t, r.context, !1), Hl(t, r.containerInfo);
  }
  function wh(t, r, s, u, h) {
    return Br(), Ol(h), r.flags |= 256, rt(t, r, s, u), r.child;
  }
  var lu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function uu(t) {
    return { baseLanes: t, cachePool: null, transitions: null };
  }
  function xh(t, r, s) {
    var u = r.pendingProps, h = De.current, y = !1, x = (r.flags & 128) !== 0, P;
    if ((P = x) || (P = t !== null && t.memoizedState === null ? !1 : (h & 2) !== 0), P ? (y = !0, r.flags &= -129) : (t === null || t.memoizedState !== null) && (h |= 1), Ce(De, h & 1), t === null)
      return jl(r), t = r.memoizedState, t !== null && (t = t.dehydrated, t !== null) ? ((r.mode & 1) === 0 ? r.lanes = 1 : t.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824, null) : (x = u.children, t = u.fallback, y ? (u = r.mode, y = r.child, x = { mode: "hidden", children: x }, (u & 1) === 0 && y !== null ? (y.childLanes = 0, y.pendingProps = x) : y = Ds(x, u, 0, null), t = sr(t, u, s, null), y.return = r, t.return = r, y.sibling = t, r.child = y, r.child.memoizedState = uu(s), r.memoizedState = lu, t) : cu(r, x));
    if (h = t.memoizedState, h !== null && (P = h.dehydrated, P !== null)) return lx(t, r, x, u, P, h, s);
    if (y) {
      y = u.fallback, x = r.mode, h = t.child, P = h.sibling;
      var b = { mode: "hidden", children: u.children };
      return (x & 1) === 0 && r.child !== h ? (u = r.child, u.childLanes = 0, u.pendingProps = b, r.deletions = null) : (u = Nn(h, b), u.subtreeFlags = h.subtreeFlags & 14680064), P !== null ? y = Nn(P, y) : (y = sr(y, x, s, null), y.flags |= 2), y.return = r, u.return = r, u.sibling = y, r.child = u, u = y, y = r.child, x = t.child.memoizedState, x = x === null ? uu(s) : { baseLanes: x.baseLanes | s, cachePool: null, transitions: x.transitions }, y.memoizedState = x, y.childLanes = t.childLanes & ~s, r.memoizedState = lu, u;
    }
    return y = t.child, t = y.sibling, u = Nn(y, { mode: "visible", children: u.children }), (r.mode & 1) === 0 && (u.lanes = s), u.return = r, u.sibling = null, t !== null && (s = r.deletions, s === null ? (r.deletions = [t], r.flags |= 16) : s.push(t)), r.child = u, r.memoizedState = null, u;
  }
  function cu(t, r) {
    return r = Ds({ mode: "visible", children: r }, t.mode, 0, null), r.return = t, t.child = r;
  }
  function Ss(t, r, s, u) {
    return u !== null && Ol(u), zr(r, t.child, null, s), t = cu(r, r.pendingProps.children), t.flags |= 2, r.memoizedState = null, t;
  }
  function lx(t, r, s, u, h, y, x) {
    if (s)
      return r.flags & 256 ? (r.flags &= -257, u = ou(Error(o(422))), Ss(t, r, x, u)) : r.memoizedState !== null ? (r.child = t.child, r.flags |= 128, null) : (y = u.fallback, h = r.mode, u = Ds({ mode: "visible", children: u.children }, h, 0, null), y = sr(y, h, x, null), y.flags |= 2, u.return = r, y.return = r, u.sibling = y, r.child = u, (r.mode & 1) !== 0 && zr(r, t.child, null, x), r.child.memoizedState = uu(x), r.memoizedState = lu, y);
    if ((r.mode & 1) === 0) return Ss(t, r, x, null);
    if (h.data === "$!") {
      if (u = h.nextSibling && h.nextSibling.dataset, u) var P = u.dgst;
      return u = P, y = Error(o(419)), u = ou(y, u, void 0), Ss(t, r, x, u);
    }
    if (P = (x & t.childLanes) !== 0, ct || P) {
      if (u = He, u !== null) {
        switch (x & -x) {
          case 4:
            h = 2;
            break;
          case 16:
            h = 8;
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
            h = 32;
            break;
          case 536870912:
            h = 268435456;
            break;
          default:
            h = 0;
        }
        h = (h & (u.suspendedLanes | x)) !== 0 ? 0 : h, h !== 0 && h !== y.retryLane && (y.retryLane = h, an(t, h), Ot(u, t, h, -1));
      }
      return Cu(), u = ou(Error(o(421))), Ss(t, r, x, u);
    }
    return h.data === "$?" ? (r.flags |= 128, r.child = t.child, r = xx.bind(null, t), h._reactRetry = r, null) : (t = y.treeContext, vt = _n(h.nextSibling), gt = r, Re = !0, Nt = null, t !== null && (_t[Tt++] = on, _t[Tt++] = sn, _t[Tt++] = Zn, on = t.id, sn = t.overflow, Zn = r), r = cu(r, u.children), r.flags |= 4096, r);
  }
  function _h(t, r, s) {
    t.lanes |= r;
    var u = t.alternate;
    u !== null && (u.lanes |= r), zl(t.return, r, s);
  }
  function du(t, r, s, u, h) {
    var y = t.memoizedState;
    y === null ? t.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: u, tail: s, tailMode: h } : (y.isBackwards = r, y.rendering = null, y.renderingStartTime = 0, y.last = u, y.tail = s, y.tailMode = h);
  }
  function Th(t, r, s) {
    var u = r.pendingProps, h = u.revealOrder, y = u.tail;
    if (rt(t, r, u.children, s), u = De.current, (u & 2) !== 0) u = u & 1 | 2, r.flags |= 128;
    else {
      if (t !== null && (t.flags & 128) !== 0) e: for (t = r.child; t !== null; ) {
        if (t.tag === 13) t.memoizedState !== null && _h(t, s, r);
        else if (t.tag === 19) _h(t, s, r);
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
    else switch (h) {
      case "forwards":
        for (s = r.child, h = null; s !== null; ) t = s.alternate, t !== null && fs(t) === null && (h = s), s = s.sibling;
        s = h, s === null ? (h = r.child, r.child = null) : (h = s.sibling, s.sibling = null), du(r, !1, h, s, y);
        break;
      case "backwards":
        for (s = null, h = r.child, r.child = null; h !== null; ) {
          if (t = h.alternate, t !== null && fs(t) === null) {
            r.child = h;
            break;
          }
          t = h.sibling, h.sibling = s, s = h, h = t;
        }
        du(r, !0, s, null, y);
        break;
      case "together":
        du(r, !1, null, null, void 0);
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
    if (t !== null && (r.dependencies = t.dependencies), nr |= r.lanes, (s & r.childLanes) === 0) return null;
    if (t !== null && r.child !== t.child) throw Error(o(153));
    if (r.child !== null) {
      for (t = r.child, s = Nn(t, t.pendingProps), r.child = s, s.return = r; t.sibling !== null; ) t = t.sibling, s = s.sibling = Nn(t, t.pendingProps), s.return = r;
      s.sibling = null;
    }
    return r.child;
  }
  function ux(t, r, s) {
    switch (r.tag) {
      case 3:
        Sh(r), Br();
        break;
      case 5:
        Op(r);
        break;
      case 1:
        ut(r.type) && ns(r);
        break;
      case 4:
        Hl(r, r.stateNode.containerInfo);
        break;
      case 10:
        var u = r.type._context, h = r.memoizedProps.value;
        Ce(ls, u._currentValue), u._currentValue = h;
        break;
      case 13:
        if (u = r.memoizedState, u !== null)
          return u.dehydrated !== null ? (Ce(De, De.current & 1), r.flags |= 128, null) : (s & r.child.childLanes) !== 0 ? xh(t, r, s) : (Ce(De, De.current & 1), t = un(t, r, s), t !== null ? t.sibling : null);
        Ce(De, De.current & 1);
        break;
      case 19:
        if (u = (s & r.childLanes) !== 0, (t.flags & 128) !== 0) {
          if (u) return Th(t, r, s);
          r.flags |= 128;
        }
        if (h = r.memoizedState, h !== null && (h.rendering = null, h.tail = null, h.lastEffect = null), Ce(De, De.current), u) break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, yh(t, r, s);
    }
    return un(t, r, s);
  }
  var kh, fu, Ah, Ch;
  kh = function(t, r) {
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
  }, fu = function() {
  }, Ah = function(t, r, s, u) {
    var h = t.memoizedProps;
    if (h !== u) {
      t = r.stateNode, er(Ht.current);
      var y = null;
      switch (s) {
        case "input":
          h = za(t, h), u = za(t, u), y = [];
          break;
        case "select":
          h = Y({}, h, { value: void 0 }), u = Y({}, u, { value: void 0 }), y = [];
          break;
        case "textarea":
          h = Ha(t, h), u = Ha(t, u), y = [];
          break;
        default:
          typeof h.onClick != "function" && typeof u.onClick == "function" && (t.onclick = qi);
      }
      Ga(s, u);
      var x;
      s = null;
      for (j in h) if (!u.hasOwnProperty(j) && h.hasOwnProperty(j) && h[j] != null) if (j === "style") {
        var P = h[j];
        for (x in P) P.hasOwnProperty(x) && (s || (s = {}), s[x] = "");
      } else j !== "dangerouslySetInnerHTML" && j !== "children" && j !== "suppressContentEditableWarning" && j !== "suppressHydrationWarning" && j !== "autoFocus" && (a.hasOwnProperty(j) ? y || (y = []) : (y = y || []).push(j, null));
      for (j in u) {
        var b = u[j];
        if (P = h != null ? h[j] : void 0, u.hasOwnProperty(j) && b !== P && (b != null || P != null)) if (j === "style") if (P) {
          for (x in P) !P.hasOwnProperty(x) || b && b.hasOwnProperty(x) || (s || (s = {}), s[x] = "");
          for (x in b) b.hasOwnProperty(x) && P[x] !== b[x] && (s || (s = {}), s[x] = b[x]);
        } else s || (y || (y = []), y.push(
          j,
          s
        )), s = b;
        else j === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, P = P ? P.__html : void 0, b != null && P !== b && (y = y || []).push(j, b)) : j === "children" ? typeof b != "string" && typeof b != "number" || (y = y || []).push(j, "" + b) : j !== "suppressContentEditableWarning" && j !== "suppressHydrationWarning" && (a.hasOwnProperty(j) ? (b != null && j === "onScroll" && Pe("scroll", t), y || P === b || (y = [])) : (y = y || []).push(j, b));
      }
      s && (y = y || []).push("style", s);
      var j = y;
      (r.updateQueue = j) && (r.flags |= 4);
    }
  }, Ch = function(t, r, s, u) {
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
    if (r) for (var h = t.child; h !== null; ) s |= h.lanes | h.childLanes, u |= h.subtreeFlags & 14680064, u |= h.flags & 14680064, h.return = t, h = h.sibling;
    else for (h = t.child; h !== null; ) s |= h.lanes | h.childLanes, u |= h.subtreeFlags, u |= h.flags, h.return = t, h = h.sibling;
    return t.subtreeFlags |= u, t.childLanes = s, r;
  }
  function cx(t, r, s) {
    var u = r.pendingProps;
    switch (Il(r), r.tag) {
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
        return u = r.stateNode, Hr(), Ee(lt), Ee(qe), Kl(), u.pendingContext && (u.context = u.pendingContext, u.pendingContext = null), (t === null || t.child === null) && (ss(r) ? r.flags |= 4 : t === null || t.memoizedState.isDehydrated && (r.flags & 256) === 0 || (r.flags |= 1024, Nt !== null && (Tu(Nt), Nt = null))), fu(t, r), tt(r), null;
      case 5:
        Wl(r);
        var h = er(Go.current);
        if (s = r.type, t !== null && r.stateNode != null) Ah(t, r, s, u, h), t.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!u) {
            if (r.stateNode === null) throw Error(o(166));
            return tt(r), null;
          }
          if (t = er(Ht.current), ss(r)) {
            u = r.stateNode, s = r.type;
            var y = r.memoizedProps;
            switch (u[$t] = r, u[zo] = y, t = (r.mode & 1) !== 0, s) {
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
                for (h = 0; h < Lo.length; h++) Pe(Lo[h], u);
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
                sf(u, y), Pe("invalid", u);
                break;
              case "select":
                u._wrapperState = { wasMultiple: !!y.multiple }, Pe("invalid", u);
                break;
              case "textarea":
                uf(u, y), Pe("invalid", u);
            }
            Ga(s, y), h = null;
            for (var x in y) if (y.hasOwnProperty(x)) {
              var P = y[x];
              x === "children" ? typeof P == "string" ? u.textContent !== P && (y.suppressHydrationWarning !== !0 && Ji(u.textContent, P, t), h = ["children", P]) : typeof P == "number" && u.textContent !== "" + P && (y.suppressHydrationWarning !== !0 && Ji(
                u.textContent,
                P,
                t
              ), h = ["children", "" + P]) : a.hasOwnProperty(x) && P != null && x === "onScroll" && Pe("scroll", u);
            }
            switch (s) {
              case "input":
                bi(u), lf(u, y, !0);
                break;
              case "textarea":
                bi(u), df(u);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof y.onClick == "function" && (u.onclick = qi);
            }
            u = h, r.updateQueue = u, u !== null && (r.flags |= 4);
          } else {
            x = h.nodeType === 9 ? h : h.ownerDocument, t === "http://www.w3.org/1999/xhtml" && (t = ff(s)), t === "http://www.w3.org/1999/xhtml" ? s === "script" ? (t = x.createElement("div"), t.innerHTML = "<script><\/script>", t = t.removeChild(t.firstChild)) : typeof u.is == "string" ? t = x.createElement(s, { is: u.is }) : (t = x.createElement(s), s === "select" && (x = t, u.multiple ? x.multiple = !0 : u.size && (x.size = u.size))) : t = x.createElementNS(t, s), t[$t] = r, t[zo] = u, kh(t, r, !1, !1), r.stateNode = t;
            e: {
              switch (x = Ka(s, u), s) {
                case "dialog":
                  Pe("cancel", t), Pe("close", t), h = u;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Pe("load", t), h = u;
                  break;
                case "video":
                case "audio":
                  for (h = 0; h < Lo.length; h++) Pe(Lo[h], t);
                  h = u;
                  break;
                case "source":
                  Pe("error", t), h = u;
                  break;
                case "img":
                case "image":
                case "link":
                  Pe(
                    "error",
                    t
                  ), Pe("load", t), h = u;
                  break;
                case "details":
                  Pe("toggle", t), h = u;
                  break;
                case "input":
                  sf(t, u), h = za(t, u), Pe("invalid", t);
                  break;
                case "option":
                  h = u;
                  break;
                case "select":
                  t._wrapperState = { wasMultiple: !!u.multiple }, h = Y({}, u, { value: void 0 }), Pe("invalid", t);
                  break;
                case "textarea":
                  uf(t, u), h = Ha(t, u), Pe("invalid", t);
                  break;
                default:
                  h = u;
              }
              Ga(s, h), P = h;
              for (y in P) if (P.hasOwnProperty(y)) {
                var b = P[y];
                y === "style" ? mf(t, b) : y === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, b != null && pf(t, b)) : y === "children" ? typeof b == "string" ? (s !== "textarea" || b !== "") && So(t, b) : typeof b == "number" && So(t, "" + b) : y !== "suppressContentEditableWarning" && y !== "suppressHydrationWarning" && y !== "autoFocus" && (a.hasOwnProperty(y) ? b != null && y === "onScroll" && Pe("scroll", t) : b != null && M(t, y, b, x));
              }
              switch (s) {
                case "input":
                  bi(t), lf(t, u, !1);
                  break;
                case "textarea":
                  bi(t), df(t);
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
                  typeof h.onClick == "function" && (t.onclick = qi);
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
        if (t && r.stateNode != null) Ch(t, r, t.memoizedProps, u);
        else {
          if (typeof u != "string" && r.stateNode === null) throw Error(o(166));
          if (s = er(Go.current), er(Ht.current), ss(r)) {
            if (u = r.stateNode, s = r.memoizedProps, u[$t] = r, (y = u.nodeValue !== s) && (t = gt, t !== null)) switch (t.tag) {
              case 3:
                Ji(u.nodeValue, s, (t.mode & 1) !== 0);
                break;
              case 5:
                t.memoizedProps.suppressHydrationWarning !== !0 && Ji(u.nodeValue, s, (t.mode & 1) !== 0);
            }
            y && (r.flags |= 4);
          } else u = (s.nodeType === 9 ? s : s.ownerDocument).createTextNode(u), u[$t] = r, r.stateNode = u;
        }
        return tt(r), null;
      case 13:
        if (Ee(De), u = r.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (Re && vt !== null && (r.mode & 1) !== 0 && (r.flags & 128) === 0) bp(), Br(), r.flags |= 98560, y = !1;
          else if (y = ss(r), u !== null && u.dehydrated !== null) {
            if (t === null) {
              if (!y) throw Error(o(318));
              if (y = r.memoizedState, y = y !== null ? y.dehydrated : null, !y) throw Error(o(317));
              y[$t] = r;
            } else Br(), (r.flags & 128) === 0 && (r.memoizedState = null), r.flags |= 4;
            tt(r), y = !1;
          } else Nt !== null && (Tu(Nt), Nt = null), y = !0;
          if (!y) return r.flags & 65536 ? r : null;
        }
        return (r.flags & 128) !== 0 ? (r.lanes = s, r) : (u = u !== null, u !== (t !== null && t.memoizedState !== null) && u && (r.child.flags |= 8192, (r.mode & 1) !== 0 && (t === null || (De.current & 1) !== 0 ? ze === 0 && (ze = 3) : Cu())), r.updateQueue !== null && (r.flags |= 4), tt(r), null);
      case 4:
        return Hr(), fu(t, r), t === null && Vo(r.stateNode.containerInfo), tt(r), null;
      case 10:
        return Bl(r.type._context), tt(r), null;
      case 17:
        return ut(r.type) && ts(), tt(r), null;
      case 19:
        if (Ee(De), y = r.memoizedState, y === null) return tt(r), null;
        if (u = (r.flags & 128) !== 0, x = y.rendering, x === null) if (u) Zo(y, !1);
        else {
          if (ze !== 0 || t !== null && (t.flags & 128) !== 0) for (t = r.child; t !== null; ) {
            if (x = fs(t), x !== null) {
              for (r.flags |= 128, Zo(y, !1), u = x.updateQueue, u !== null && (r.updateQueue = u, r.flags |= 4), r.subtreeFlags = 0, u = s, s = r.child; s !== null; ) y = s, t = u, y.flags &= 14680066, x = y.alternate, x === null ? (y.childLanes = 0, y.lanes = t, y.child = null, y.subtreeFlags = 0, y.memoizedProps = null, y.memoizedState = null, y.updateQueue = null, y.dependencies = null, y.stateNode = null) : (y.childLanes = x.childLanes, y.lanes = x.lanes, y.child = x.child, y.subtreeFlags = 0, y.deletions = null, y.memoizedProps = x.memoizedProps, y.memoizedState = x.memoizedState, y.updateQueue = x.updateQueue, y.type = x.type, t = x.dependencies, y.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), s = s.sibling;
              return Ce(De, De.current & 1 | 2), r.child;
            }
            t = t.sibling;
          }
          y.tail !== null && je() > Yr && (r.flags |= 128, u = !0, Zo(y, !1), r.lanes = 4194304);
        }
        else {
          if (!u) if (t = fs(x), t !== null) {
            if (r.flags |= 128, u = !0, s = t.updateQueue, s !== null && (r.updateQueue = s, r.flags |= 4), Zo(y, !0), y.tail === null && y.tailMode === "hidden" && !x.alternate && !Re) return tt(r), null;
          } else 2 * je() - y.renderingStartTime > Yr && s !== 1073741824 && (r.flags |= 128, u = !0, Zo(y, !1), r.lanes = 4194304);
          y.isBackwards ? (x.sibling = r.child, r.child = x) : (s = y.last, s !== null ? s.sibling = x : r.child = x, y.last = x);
        }
        return y.tail !== null ? (r = y.tail, y.rendering = r, y.tail = r.sibling, y.renderingStartTime = je(), r.sibling = null, s = De.current, Ce(De, u ? s & 1 | 2 : s & 1), r) : (tt(r), null);
      case 22:
      case 23:
        return Au(), u = r.memoizedState !== null, t !== null && t.memoizedState !== null !== u && (r.flags |= 8192), u && (r.mode & 1) !== 0 ? (St & 1073741824) !== 0 && (tt(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : tt(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(o(156, r.tag));
  }
  function dx(t, r) {
    switch (Il(r), r.tag) {
      case 1:
        return ut(r.type) && ts(), t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 3:
        return Hr(), Ee(lt), Ee(qe), Kl(), t = r.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (r.flags = t & -65537 | 128, r) : null;
      case 5:
        return Wl(r), null;
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
        return Bl(r.type._context), null;
      case 22:
      case 23:
        return Au(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var xs = !1, nt = !1, fx = typeof WeakSet == "function" ? WeakSet : Set, q = null;
  function Gr(t, r) {
    var s = t.ref;
    if (s !== null) if (typeof s == "function") try {
      s(null);
    } catch (u) {
      Fe(t, r, u);
    }
    else s.current = null;
  }
  function pu(t, r, s) {
    try {
      s();
    } catch (u) {
      Fe(t, r, u);
    }
  }
  var Ph = !1;
  function px(t, r) {
    if (Al = zi, t = ip(), gl(t)) {
      if ("selectionStart" in t) var s = { start: t.selectionStart, end: t.selectionEnd };
      else e: {
        s = (s = t.ownerDocument) && s.defaultView || window;
        var u = s.getSelection && s.getSelection();
        if (u && u.rangeCount !== 0) {
          s = u.anchorNode;
          var h = u.anchorOffset, y = u.focusNode;
          u = u.focusOffset;
          try {
            s.nodeType, y.nodeType;
          } catch {
            s = null;
            break e;
          }
          var x = 0, P = -1, b = -1, j = 0, z = 0, $ = t, B = null;
          t: for (; ; ) {
            for (var Z; $ !== s || h !== 0 && $.nodeType !== 3 || (P = x + h), $ !== y || u !== 0 && $.nodeType !== 3 || (b = x + u), $.nodeType === 3 && (x += $.nodeValue.length), (Z = $.firstChild) !== null; )
              B = $, $ = Z;
            for (; ; ) {
              if ($ === t) break t;
              if (B === s && ++j === h && (P = x), B === y && ++z === u && (b = x), (Z = $.nextSibling) !== null) break;
              $ = B, B = $.parentNode;
            }
            $ = Z;
          }
          s = P === -1 || b === -1 ? null : { start: P, end: b };
        } else s = null;
      }
      s = s || { start: 0, end: 0 };
    } else s = null;
    for (Cl = { focusedElem: t, selectionRange: s }, zi = !1, q = r; q !== null; ) if (r = q, t = r.child, (r.subtreeFlags & 1028) !== 0 && t !== null) t.return = r, q = t;
    else for (; q !== null; ) {
      r = q;
      try {
        var ee = r.alternate;
        if ((r.flags & 1024) !== 0) switch (r.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (ee !== null) {
              var re = ee.memoizedProps, Oe = ee.memoizedState, I = r.stateNode, R = I.getSnapshotBeforeUpdate(r.elementType === r.type ? re : It(r.type, re), Oe);
              I.__reactInternalSnapshotBeforeUpdate = R;
            }
            break;
          case 3:
            var F = r.stateNode.containerInfo;
            F.nodeType === 1 ? F.textContent = "" : F.nodeType === 9 && F.documentElement && F.removeChild(F.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(o(163));
        }
      } catch (H) {
        Fe(r, r.return, H);
      }
      if (t = r.sibling, t !== null) {
        t.return = r.return, q = t;
        break;
      }
      q = r.return;
    }
    return ee = Ph, Ph = !1, ee;
  }
  function Jo(t, r, s) {
    var u = r.updateQueue;
    if (u = u !== null ? u.lastEffect : null, u !== null) {
      var h = u = u.next;
      do {
        if ((h.tag & t) === t) {
          var y = h.destroy;
          h.destroy = void 0, y !== void 0 && pu(r, s, y);
        }
        h = h.next;
      } while (h !== u);
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
  function hu(t) {
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
  function Eh(t) {
    var r = t.alternate;
    r !== null && (t.alternate = null, Eh(r)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (r = t.stateNode, r !== null && (delete r[$t], delete r[zo], delete r[Ml], delete r[Qw], delete r[Xw])), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  function bh(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 4;
  }
  function Mh(t) {
    e: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || bh(t.return)) return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
        if (t.flags & 2 || t.child === null || t.tag === 4) continue e;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function mu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.nodeType === 8 ? s.parentNode.insertBefore(t, r) : s.insertBefore(t, r) : (s.nodeType === 8 ? (r = s.parentNode, r.insertBefore(t, s)) : (r = s, r.appendChild(t)), s = s._reactRootContainer, s != null || r.onclick !== null || (r.onclick = qi));
    else if (u !== 4 && (t = t.child, t !== null)) for (mu(t, r, s), t = t.sibling; t !== null; ) mu(t, r, s), t = t.sibling;
  }
  function yu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.insertBefore(t, r) : s.appendChild(t);
    else if (u !== 4 && (t = t.child, t !== null)) for (yu(t, r, s), t = t.sibling; t !== null; ) yu(t, r, s), t = t.sibling;
  }
  var Ye = null, Ft = !1;
  function En(t, r, s) {
    for (s = s.child; s !== null; ) Rh(t, r, s), s = s.sibling;
  }
  function Rh(t, r, s) {
    if (Ut && typeof Ut.onCommitFiberUnmount == "function") try {
      Ut.onCommitFiberUnmount(Fi, s);
    } catch {
    }
    switch (s.tag) {
      case 5:
        nt || Gr(s, r);
      case 6:
        var u = Ye, h = Ft;
        Ye = null, En(t, r, s), Ye = u, Ft = h, Ye !== null && (Ft ? (t = Ye, s = s.stateNode, t.nodeType === 8 ? t.parentNode.removeChild(s) : t.removeChild(s)) : Ye.removeChild(s.stateNode));
        break;
      case 18:
        Ye !== null && (Ft ? (t = Ye, s = s.stateNode, t.nodeType === 8 ? bl(t.parentNode, s) : t.nodeType === 1 && bl(t, s), Mo(t)) : bl(Ye, s.stateNode));
        break;
      case 4:
        u = Ye, h = Ft, Ye = s.stateNode.containerInfo, Ft = !0, En(t, r, s), Ye = u, Ft = h;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!nt && (u = s.updateQueue, u !== null && (u = u.lastEffect, u !== null))) {
          h = u = u.next;
          do {
            var y = h, x = y.destroy;
            y = y.tag, x !== void 0 && ((y & 2) !== 0 || (y & 4) !== 0) && pu(s, r, x), h = h.next;
          } while (h !== u);
        }
        En(t, r, s);
        break;
      case 1:
        if (!nt && (Gr(s, r), u = s.stateNode, typeof u.componentWillUnmount == "function")) try {
          u.props = s.memoizedProps, u.state = s.memoizedState, u.componentWillUnmount();
        } catch (P) {
          Fe(s, r, P);
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
  function Dh(t) {
    var r = t.updateQueue;
    if (r !== null) {
      t.updateQueue = null;
      var s = t.stateNode;
      s === null && (s = t.stateNode = new fx()), r.forEach(function(u) {
        var h = _x.bind(null, t, u);
        s.has(u) || (s.add(u), u.then(h, h));
      });
    }
  }
  function jt(t, r) {
    var s = r.deletions;
    if (s !== null) for (var u = 0; u < s.length; u++) {
      var h = s[u];
      try {
        var y = t, x = r, P = x;
        e: for (; P !== null; ) {
          switch (P.tag) {
            case 5:
              Ye = P.stateNode, Ft = !1;
              break e;
            case 3:
              Ye = P.stateNode.containerInfo, Ft = !0;
              break e;
            case 4:
              Ye = P.stateNode.containerInfo, Ft = !0;
              break e;
          }
          P = P.return;
        }
        if (Ye === null) throw Error(o(160));
        Rh(y, x, h), Ye = null, Ft = !1;
        var b = h.alternate;
        b !== null && (b.return = null), h.return = null;
      } catch (j) {
        Fe(h, r, j);
      }
    }
    if (r.subtreeFlags & 12854) for (r = r.child; r !== null; ) Nh(r, t), r = r.sibling;
  }
  function Nh(t, r) {
    var s = t.alternate, u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (jt(r, t), Gt(t), u & 4) {
          try {
            Jo(3, t, t.return), _s(3, t);
          } catch (re) {
            Fe(t, t.return, re);
          }
          try {
            Jo(5, t, t.return);
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        break;
      case 1:
        jt(r, t), Gt(t), u & 512 && s !== null && Gr(s, s.return);
        break;
      case 5:
        if (jt(r, t), Gt(t), u & 512 && s !== null && Gr(s, s.return), t.flags & 32) {
          var h = t.stateNode;
          try {
            So(h, "");
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        if (u & 4 && (h = t.stateNode, h != null)) {
          var y = t.memoizedProps, x = s !== null ? s.memoizedProps : y, P = t.type, b = t.updateQueue;
          if (t.updateQueue = null, b !== null) try {
            P === "input" && y.type === "radio" && y.name != null && af(h, y), Ka(P, x);
            var j = Ka(P, y);
            for (x = 0; x < b.length; x += 2) {
              var z = b[x], $ = b[x + 1];
              z === "style" ? mf(h, $) : z === "dangerouslySetInnerHTML" ? pf(h, $) : z === "children" ? So(h, $) : M(h, z, $, j);
            }
            switch (P) {
              case "input":
                Ua(h, y);
                break;
              case "textarea":
                cf(h, y);
                break;
              case "select":
                var B = h._wrapperState.wasMultiple;
                h._wrapperState.wasMultiple = !!y.multiple;
                var Z = y.value;
                Z != null ? Ar(h, !!y.multiple, Z, !1) : B !== !!y.multiple && (y.defaultValue != null ? Ar(
                  h,
                  !!y.multiple,
                  y.defaultValue,
                  !0
                ) : Ar(h, !!y.multiple, y.multiple ? [] : "", !1));
            }
            h[zo] = y;
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        break;
      case 6:
        if (jt(r, t), Gt(t), u & 4) {
          if (t.stateNode === null) throw Error(o(162));
          h = t.stateNode, y = t.memoizedProps;
          try {
            h.nodeValue = y;
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        break;
      case 3:
        if (jt(r, t), Gt(t), u & 4 && s !== null && s.memoizedState.isDehydrated) try {
          Mo(r.containerInfo);
        } catch (re) {
          Fe(t, t.return, re);
        }
        break;
      case 4:
        jt(r, t), Gt(t);
        break;
      case 13:
        jt(r, t), Gt(t), h = t.child, h.flags & 8192 && (y = h.memoizedState !== null, h.stateNode.isHidden = y, !y || h.alternate !== null && h.alternate.memoizedState !== null || (Su = je())), u & 4 && Dh(t);
        break;
      case 22:
        if (z = s !== null && s.memoizedState !== null, t.mode & 1 ? (nt = (j = nt) || z, jt(r, t), nt = j) : jt(r, t), Gt(t), u & 8192) {
          if (j = t.memoizedState !== null, (t.stateNode.isHidden = j) && !z && (t.mode & 1) !== 0) for (q = t, z = t.child; z !== null; ) {
            for ($ = q = z; q !== null; ) {
              switch (B = q, Z = B.child, B.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Jo(4, B, B.return);
                  break;
                case 1:
                  Gr(B, B.return);
                  var ee = B.stateNode;
                  if (typeof ee.componentWillUnmount == "function") {
                    u = B, s = B.return;
                    try {
                      r = u, ee.props = r.memoizedProps, ee.state = r.memoizedState, ee.componentWillUnmount();
                    } catch (re) {
                      Fe(u, s, re);
                    }
                  }
                  break;
                case 5:
                  Gr(B, B.return);
                  break;
                case 22:
                  if (B.memoizedState !== null) {
                    jh($);
                    continue;
                  }
              }
              Z !== null ? (Z.return = B, q = Z) : jh($);
            }
            z = z.sibling;
          }
          e: for (z = null, $ = t; ; ) {
            if ($.tag === 5) {
              if (z === null) {
                z = $;
                try {
                  h = $.stateNode, j ? (y = h.style, typeof y.setProperty == "function" ? y.setProperty("display", "none", "important") : y.display = "none") : (P = $.stateNode, b = $.memoizedProps.style, x = b != null && b.hasOwnProperty("display") ? b.display : null, P.style.display = hf("display", x));
                } catch (re) {
                  Fe(t, t.return, re);
                }
              }
            } else if ($.tag === 6) {
              if (z === null) try {
                $.stateNode.nodeValue = j ? "" : $.memoizedProps;
              } catch (re) {
                Fe(t, t.return, re);
              }
            } else if (($.tag !== 22 && $.tag !== 23 || $.memoizedState === null || $ === t) && $.child !== null) {
              $.child.return = $, $ = $.child;
              continue;
            }
            if ($ === t) break e;
            for (; $.sibling === null; ) {
              if ($.return === null || $.return === t) break e;
              z === $ && (z = null), $ = $.return;
            }
            z === $ && (z = null), $.sibling.return = $.return, $ = $.sibling;
          }
        }
        break;
      case 19:
        jt(r, t), Gt(t), u & 4 && Dh(t);
        break;
      case 21:
        break;
      default:
        jt(
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
            if (bh(s)) {
              var u = s;
              break e;
            }
            s = s.return;
          }
          throw Error(o(160));
        }
        switch (u.tag) {
          case 5:
            var h = u.stateNode;
            u.flags & 32 && (So(h, ""), u.flags &= -33);
            var y = Mh(t);
            yu(t, y, h);
            break;
          case 3:
          case 4:
            var x = u.stateNode.containerInfo, P = Mh(t);
            mu(t, P, x);
            break;
          default:
            throw Error(o(161));
        }
      } catch (b) {
        Fe(t, t.return, b);
      }
      t.flags &= -3;
    }
    r & 4096 && (t.flags &= -4097);
  }
  function hx(t, r, s) {
    q = t, Ih(t);
  }
  function Ih(t, r, s) {
    for (var u = (t.mode & 1) !== 0; q !== null; ) {
      var h = q, y = h.child;
      if (h.tag === 22 && u) {
        var x = h.memoizedState !== null || xs;
        if (!x) {
          var P = h.alternate, b = P !== null && P.memoizedState !== null || nt;
          P = xs;
          var j = nt;
          if (xs = x, (nt = b) && !j) for (q = h; q !== null; ) x = q, b = x.child, x.tag === 22 && x.memoizedState !== null ? Oh(h) : b !== null ? (b.return = x, q = b) : Oh(h);
          for (; y !== null; ) q = y, Ih(y), y = y.sibling;
          q = h, xs = P, nt = j;
        }
        Fh(t);
      } else (h.subtreeFlags & 8772) !== 0 && y !== null ? (y.return = h, q = y) : Fh(t);
    }
  }
  function Fh(t) {
    for (; q !== null; ) {
      var r = q;
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
                var h = r.elementType === r.type ? s.memoizedProps : It(r.type, s.memoizedProps);
                u.componentDidUpdate(h, s.memoizedState, u.__reactInternalSnapshotBeforeUpdate);
              }
              var y = r.updateQueue;
              y !== null && jp(r, y, u);
              break;
            case 3:
              var x = r.updateQueue;
              if (x !== null) {
                if (s = null, r.child !== null) switch (r.child.tag) {
                  case 5:
                    s = r.child.stateNode;
                    break;
                  case 1:
                    s = r.child.stateNode;
                }
                jp(r, x, s);
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
                var j = r.alternate;
                if (j !== null) {
                  var z = j.memoizedState;
                  if (z !== null) {
                    var $ = z.dehydrated;
                    $ !== null && Mo($);
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
          nt || r.flags & 512 && hu(r);
        } catch (B) {
          Fe(r, r.return, B);
        }
      }
      if (r === t) {
        q = null;
        break;
      }
      if (s = r.sibling, s !== null) {
        s.return = r.return, q = s;
        break;
      }
      q = r.return;
    }
  }
  function jh(t) {
    for (; q !== null; ) {
      var r = q;
      if (r === t) {
        q = null;
        break;
      }
      var s = r.sibling;
      if (s !== null) {
        s.return = r.return, q = s;
        break;
      }
      q = r.return;
    }
  }
  function Oh(t) {
    for (; q !== null; ) {
      var r = q;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var s = r.return;
            try {
              _s(4, r);
            } catch (b) {
              Fe(r, s, b);
            }
            break;
          case 1:
            var u = r.stateNode;
            if (typeof u.componentDidMount == "function") {
              var h = r.return;
              try {
                u.componentDidMount();
              } catch (b) {
                Fe(r, h, b);
              }
            }
            var y = r.return;
            try {
              hu(r);
            } catch (b) {
              Fe(r, y, b);
            }
            break;
          case 5:
            var x = r.return;
            try {
              hu(r);
            } catch (b) {
              Fe(r, x, b);
            }
        }
      } catch (b) {
        Fe(r, r.return, b);
      }
      if (r === t) {
        q = null;
        break;
      }
      var P = r.sibling;
      if (P !== null) {
        P.return = r.return, q = P;
        break;
      }
      q = r.return;
    }
  }
  var mx = Math.ceil, Ts = N.ReactCurrentDispatcher, gu = N.ReactCurrentOwner, Ct = N.ReactCurrentBatchConfig, he = 0, He = null, Le = null, Qe = 0, St = 0, Kr = Tn(0), ze = 0, qo = null, nr = 0, ks = 0, vu = 0, ei = null, dt = null, Su = 0, Yr = 1 / 0, cn = null, As = !1, wu = null, bn = null, Cs = !1, Mn = null, Ps = 0, ti = 0, xu = null, Es = -1, bs = 0;
  function ot() {
    return (he & 6) !== 0 ? je() : Es !== -1 ? Es : Es = je();
  }
  function Rn(t) {
    return (t.mode & 1) === 0 ? 1 : (he & 2) !== 0 && Qe !== 0 ? Qe & -Qe : Jw.transition !== null ? (bs === 0 && (bs = Mf()), bs) : (t = xe, t !== 0 || (t = window.event, t = t === void 0 ? 16 : Vf(t.type)), t);
  }
  function Ot(t, r, s, u) {
    if (50 < ti) throw ti = 0, xu = null, Error(o(185));
    Ao(t, s, u), ((he & 2) === 0 || t !== He) && (t === He && ((he & 2) === 0 && (ks |= s), ze === 4 && Dn(t, Qe)), ft(t, u), s === 1 && he === 0 && (r.mode & 1) === 0 && (Yr = je() + 500, rs && An()));
  }
  function ft(t, r) {
    var s = t.callbackNode;
    JS(t, r);
    var u = Li(t, t === He ? Qe : 0);
    if (u === 0) s !== null && Pf(s), t.callbackNode = null, t.callbackPriority = 0;
    else if (r = u & -u, t.callbackPriority !== r) {
      if (s != null && Pf(s), r === 1) t.tag === 0 ? Zw(Vh.bind(null, t)) : kp(Vh.bind(null, t)), Kw(function() {
        (he & 6) === 0 && An();
      }), s = null;
      else {
        switch (Rf(u)) {
          case 1:
            s = el;
            break;
          case 4:
            s = Ef;
            break;
          case 16:
            s = Ii;
            break;
          case 536870912:
            s = bf;
            break;
          default:
            s = Ii;
        }
        s = Kh(s, Lh.bind(null, t));
      }
      t.callbackPriority = r, t.callbackNode = s;
    }
  }
  function Lh(t, r) {
    if (Es = -1, bs = 0, (he & 6) !== 0) throw Error(o(327));
    var s = t.callbackNode;
    if (Qr() && t.callbackNode !== s) return null;
    var u = Li(t, t === He ? Qe : 0);
    if (u === 0) return null;
    if ((u & 30) !== 0 || (u & t.expiredLanes) !== 0 || r) r = Ms(t, u);
    else {
      r = u;
      var h = he;
      he |= 2;
      var y = zh();
      (He !== t || Qe !== r) && (cn = null, Yr = je() + 500, or(t, r));
      do
        try {
          vx();
          break;
        } catch (P) {
          Bh(t, P);
        }
      while (!0);
      Vl(), Ts.current = y, he = h, Le !== null ? r = 0 : (He = null, Qe = 0, r = ze);
    }
    if (r !== 0) {
      if (r === 2 && (h = tl(t), h !== 0 && (u = h, r = _u(t, h))), r === 1) throw s = qo, or(t, 0), Dn(t, u), ft(t, je()), s;
      if (r === 6) Dn(t, u);
      else {
        if (h = t.current.alternate, (u & 30) === 0 && !yx(h) && (r = Ms(t, u), r === 2 && (y = tl(t), y !== 0 && (u = y, r = _u(t, y))), r === 1)) throw s = qo, or(t, 0), Dn(t, u), ft(t, je()), s;
        switch (t.finishedWork = h, t.finishedLanes = u, r) {
          case 0:
          case 1:
            throw Error(o(345));
          case 2:
            ir(t, dt, cn);
            break;
          case 3:
            if (Dn(t, u), (u & 130023424) === u && (r = Su + 500 - je(), 10 < r)) {
              if (Li(t, 0) !== 0) break;
              if (h = t.suspendedLanes, (h & u) !== u) {
                ot(), t.pingedLanes |= t.suspendedLanes & h;
                break;
              }
              t.timeoutHandle = El(ir.bind(null, t, dt, cn), r);
              break;
            }
            ir(t, dt, cn);
            break;
          case 4:
            if (Dn(t, u), (u & 4194240) === u) break;
            for (r = t.eventTimes, h = -1; 0 < u; ) {
              var x = 31 - Rt(u);
              y = 1 << x, x = r[x], x > h && (h = x), u &= ~y;
            }
            if (u = h, u = je() - u, u = (120 > u ? 120 : 480 > u ? 480 : 1080 > u ? 1080 : 1920 > u ? 1920 : 3e3 > u ? 3e3 : 4320 > u ? 4320 : 1960 * mx(u / 1960)) - u, 10 < u) {
              t.timeoutHandle = El(ir.bind(null, t, dt, cn), u);
              break;
            }
            ir(t, dt, cn);
            break;
          case 5:
            ir(t, dt, cn);
            break;
          default:
            throw Error(o(329));
        }
      }
    }
    return ft(t, je()), t.callbackNode === s ? Lh.bind(null, t) : null;
  }
  function _u(t, r) {
    var s = ei;
    return t.current.memoizedState.isDehydrated && (or(t, r).flags |= 256), t = Ms(t, r), t !== 2 && (r = dt, dt = s, r !== null && Tu(r)), t;
  }
  function Tu(t) {
    dt === null ? dt = t : dt.push.apply(dt, t);
  }
  function yx(t) {
    for (var r = t; ; ) {
      if (r.flags & 16384) {
        var s = r.updateQueue;
        if (s !== null && (s = s.stores, s !== null)) for (var u = 0; u < s.length; u++) {
          var h = s[u], y = h.getSnapshot;
          h = h.value;
          try {
            if (!Dt(y(), h)) return !1;
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
    for (r &= ~vu, r &= ~ks, t.suspendedLanes |= r, t.pingedLanes &= ~r, t = t.expirationTimes; 0 < r; ) {
      var s = 31 - Rt(r), u = 1 << s;
      t[s] = -1, r &= ~u;
    }
  }
  function Vh(t) {
    if ((he & 6) !== 0) throw Error(o(327));
    Qr();
    var r = Li(t, 0);
    if ((r & 1) === 0) return ft(t, je()), null;
    var s = Ms(t, r);
    if (t.tag !== 0 && s === 2) {
      var u = tl(t);
      u !== 0 && (r = u, s = _u(t, u));
    }
    if (s === 1) throw s = qo, or(t, 0), Dn(t, r), ft(t, je()), s;
    if (s === 6) throw Error(o(345));
    return t.finishedWork = t.current.alternate, t.finishedLanes = r, ir(t, dt, cn), ft(t, je()), null;
  }
  function ku(t, r) {
    var s = he;
    he |= 1;
    try {
      return t(r);
    } finally {
      he = s, he === 0 && (Yr = je() + 500, rs && An());
    }
  }
  function rr(t) {
    Mn !== null && Mn.tag === 0 && (he & 6) === 0 && Qr();
    var r = he;
    he |= 1;
    var s = Ct.transition, u = xe;
    try {
      if (Ct.transition = null, xe = 1, t) return t();
    } finally {
      xe = u, Ct.transition = s, he = r, (he & 6) === 0 && An();
    }
  }
  function Au() {
    St = Kr.current, Ee(Kr);
  }
  function or(t, r) {
    t.finishedWork = null, t.finishedLanes = 0;
    var s = t.timeoutHandle;
    if (s !== -1 && (t.timeoutHandle = -1, Gw(s)), Le !== null) for (s = Le.return; s !== null; ) {
      var u = s;
      switch (Il(u), u.tag) {
        case 1:
          u = u.type.childContextTypes, u != null && ts();
          break;
        case 3:
          Hr(), Ee(lt), Ee(qe), Kl();
          break;
        case 5:
          Wl(u);
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
          Bl(u.type._context);
          break;
        case 22:
        case 23:
          Au();
      }
      s = s.return;
    }
    if (He = t, Le = t = Nn(t.current, null), Qe = St = r, ze = 0, qo = null, vu = ks = nr = 0, dt = ei = null, qn !== null) {
      for (r = 0; r < qn.length; r++) if (s = qn[r], u = s.interleaved, u !== null) {
        s.interleaved = null;
        var h = u.next, y = s.pending;
        if (y !== null) {
          var x = y.next;
          y.next = h, u.next = x;
        }
        s.pending = u;
      }
      qn = null;
    }
    return t;
  }
  function Bh(t, r) {
    do {
      var s = Le;
      try {
        if (Vl(), ps.current = gs, hs) {
          for (var u = Ne.memoizedState; u !== null; ) {
            var h = u.queue;
            h !== null && (h.pending = null), u = u.next;
          }
          hs = !1;
        }
        if (tr = 0, $e = Be = Ne = null, Ko = !1, Yo = 0, gu.current = null, s === null || s.return === null) {
          ze = 1, qo = r, Le = null;
          break;
        }
        e: {
          var y = t, x = s.return, P = s, b = r;
          if (r = Qe, P.flags |= 32768, b !== null && typeof b == "object" && typeof b.then == "function") {
            var j = b, z = P, $ = z.tag;
            if ((z.mode & 1) === 0 && ($ === 0 || $ === 11 || $ === 15)) {
              var B = z.alternate;
              B ? (z.updateQueue = B.updateQueue, z.memoizedState = B.memoizedState, z.lanes = B.lanes) : (z.updateQueue = null, z.memoizedState = null);
            }
            var Z = dh(x);
            if (Z !== null) {
              Z.flags &= -257, fh(Z, x, P, y, r), Z.mode & 1 && ch(y, j, r), r = Z, b = j;
              var ee = r.updateQueue;
              if (ee === null) {
                var re = /* @__PURE__ */ new Set();
                re.add(b), r.updateQueue = re;
              } else ee.add(b);
              break e;
            } else {
              if ((r & 1) === 0) {
                ch(y, j, r), Cu();
                break e;
              }
              b = Error(o(426));
            }
          } else if (Re && P.mode & 1) {
            var Oe = dh(x);
            if (Oe !== null) {
              (Oe.flags & 65536) === 0 && (Oe.flags |= 256), fh(Oe, x, P, y, r), Ol(Wr(b, P));
              break e;
            }
          }
          y = b = Wr(b, P), ze !== 4 && (ze = 2), ei === null ? ei = [y] : ei.push(y), y = x;
          do {
            switch (y.tag) {
              case 3:
                y.flags |= 65536, r &= -r, y.lanes |= r;
                var I = lh(y, b, r);
                Fp(y, I);
                break e;
              case 1:
                P = b;
                var R = y.type, F = y.stateNode;
                if ((y.flags & 128) === 0 && (typeof R.getDerivedStateFromError == "function" || F !== null && typeof F.componentDidCatch == "function" && (bn === null || !bn.has(F)))) {
                  y.flags |= 65536, r &= -r, y.lanes |= r;
                  var H = uh(y, P, r);
                  Fp(y, H);
                  break e;
                }
            }
            y = y.return;
          } while (y !== null);
        }
        $h(s);
      } catch (oe) {
        r = oe, Le === s && s !== null && (Le = s = s.return);
        continue;
      }
      break;
    } while (!0);
  }
  function zh() {
    var t = Ts.current;
    return Ts.current = gs, t === null ? gs : t;
  }
  function Cu() {
    (ze === 0 || ze === 3 || ze === 2) && (ze = 4), He === null || (nr & 268435455) === 0 && (ks & 268435455) === 0 || Dn(He, Qe);
  }
  function Ms(t, r) {
    var s = he;
    he |= 2;
    var u = zh();
    (He !== t || Qe !== r) && (cn = null, or(t, r));
    do
      try {
        gx();
        break;
      } catch (h) {
        Bh(t, h);
      }
    while (!0);
    if (Vl(), he = s, Ts.current = u, Le !== null) throw Error(o(261));
    return He = null, Qe = 0, ze;
  }
  function gx() {
    for (; Le !== null; ) Uh(Le);
  }
  function vx() {
    for (; Le !== null && !$S(); ) Uh(Le);
  }
  function Uh(t) {
    var r = Gh(t.alternate, t, St);
    t.memoizedProps = t.pendingProps, r === null ? $h(t) : Le = r, gu.current = null;
  }
  function $h(t) {
    var r = t;
    do {
      var s = r.alternate;
      if (t = r.return, (r.flags & 32768) === 0) {
        if (s = cx(s, r, St), s !== null) {
          Le = s;
          return;
        }
      } else {
        if (s = dx(s, r), s !== null) {
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
  function ir(t, r, s) {
    var u = xe, h = Ct.transition;
    try {
      Ct.transition = null, xe = 1, Sx(t, r, s, u);
    } finally {
      Ct.transition = h, xe = u;
    }
    return null;
  }
  function Sx(t, r, s, u) {
    do
      Qr();
    while (Mn !== null);
    if ((he & 6) !== 0) throw Error(o(327));
    s = t.finishedWork;
    var h = t.finishedLanes;
    if (s === null) return null;
    if (t.finishedWork = null, t.finishedLanes = 0, s === t.current) throw Error(o(177));
    t.callbackNode = null, t.callbackPriority = 0;
    var y = s.lanes | s.childLanes;
    if (qS(t, y), t === He && (Le = He = null, Qe = 0), (s.subtreeFlags & 2064) === 0 && (s.flags & 2064) === 0 || Cs || (Cs = !0, Kh(Ii, function() {
      return Qr(), null;
    })), y = (s.flags & 15990) !== 0, (s.subtreeFlags & 15990) !== 0 || y) {
      y = Ct.transition, Ct.transition = null;
      var x = xe;
      xe = 1;
      var P = he;
      he |= 4, gu.current = null, px(t, s), Nh(s, t), Vw(Cl), zi = !!Al, Cl = Al = null, t.current = s, hx(s), HS(), he = P, xe = x, Ct.transition = y;
    } else t.current = s;
    if (Cs && (Cs = !1, Mn = t, Ps = h), y = t.pendingLanes, y === 0 && (bn = null), KS(s.stateNode), ft(t, je()), r !== null) for (u = t.onRecoverableError, s = 0; s < r.length; s++) h = r[s], u(h.value, { componentStack: h.stack, digest: h.digest });
    if (As) throw As = !1, t = wu, wu = null, t;
    return (Ps & 1) !== 0 && t.tag !== 0 && Qr(), y = t.pendingLanes, (y & 1) !== 0 ? t === xu ? ti++ : (ti = 0, xu = t) : ti = 0, An(), null;
  }
  function Qr() {
    if (Mn !== null) {
      var t = Rf(Ps), r = Ct.transition, s = xe;
      try {
        if (Ct.transition = null, xe = 16 > t ? 16 : t, Mn === null) var u = !1;
        else {
          if (t = Mn, Mn = null, Ps = 0, (he & 6) !== 0) throw Error(o(331));
          var h = he;
          for (he |= 4, q = t.current; q !== null; ) {
            var y = q, x = y.child;
            if ((q.flags & 16) !== 0) {
              var P = y.deletions;
              if (P !== null) {
                for (var b = 0; b < P.length; b++) {
                  var j = P[b];
                  for (q = j; q !== null; ) {
                    var z = q;
                    switch (z.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Jo(8, z, y);
                    }
                    var $ = z.child;
                    if ($ !== null) $.return = z, q = $;
                    else for (; q !== null; ) {
                      z = q;
                      var B = z.sibling, Z = z.return;
                      if (Eh(z), z === j) {
                        q = null;
                        break;
                      }
                      if (B !== null) {
                        B.return = Z, q = B;
                        break;
                      }
                      q = Z;
                    }
                  }
                }
                var ee = y.alternate;
                if (ee !== null) {
                  var re = ee.child;
                  if (re !== null) {
                    ee.child = null;
                    do {
                      var Oe = re.sibling;
                      re.sibling = null, re = Oe;
                    } while (re !== null);
                  }
                }
                q = y;
              }
            }
            if ((y.subtreeFlags & 2064) !== 0 && x !== null) x.return = y, q = x;
            else e: for (; q !== null; ) {
              if (y = q, (y.flags & 2048) !== 0) switch (y.tag) {
                case 0:
                case 11:
                case 15:
                  Jo(9, y, y.return);
              }
              var I = y.sibling;
              if (I !== null) {
                I.return = y.return, q = I;
                break e;
              }
              q = y.return;
            }
          }
          var R = t.current;
          for (q = R; q !== null; ) {
            x = q;
            var F = x.child;
            if ((x.subtreeFlags & 2064) !== 0 && F !== null) F.return = x, q = F;
            else e: for (x = R; q !== null; ) {
              if (P = q, (P.flags & 2048) !== 0) try {
                switch (P.tag) {
                  case 0:
                  case 11:
                  case 15:
                    _s(9, P);
                }
              } catch (oe) {
                Fe(P, P.return, oe);
              }
              if (P === x) {
                q = null;
                break e;
              }
              var H = P.sibling;
              if (H !== null) {
                H.return = P.return, q = H;
                break e;
              }
              q = P.return;
            }
          }
          if (he = h, An(), Ut && typeof Ut.onPostCommitFiberRoot == "function") try {
            Ut.onPostCommitFiberRoot(Fi, t);
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
  function Hh(t, r, s) {
    r = Wr(s, r), r = lh(t, r, 1), t = Pn(t, r, 1), r = ot(), t !== null && (Ao(t, 1, r), ft(t, r));
  }
  function Fe(t, r, s) {
    if (t.tag === 3) Hh(t, t, s);
    else for (; r !== null; ) {
      if (r.tag === 3) {
        Hh(r, t, s);
        break;
      } else if (r.tag === 1) {
        var u = r.stateNode;
        if (typeof r.type.getDerivedStateFromError == "function" || typeof u.componentDidCatch == "function" && (bn === null || !bn.has(u))) {
          t = Wr(s, t), t = uh(r, t, 1), r = Pn(r, t, 1), t = ot(), r !== null && (Ao(r, 1, t), ft(r, t));
          break;
        }
      }
      r = r.return;
    }
  }
  function wx(t, r, s) {
    var u = t.pingCache;
    u !== null && u.delete(r), r = ot(), t.pingedLanes |= t.suspendedLanes & s, He === t && (Qe & s) === s && (ze === 4 || ze === 3 && (Qe & 130023424) === Qe && 500 > je() - Su ? or(t, 0) : vu |= s), ft(t, r);
  }
  function Wh(t, r) {
    r === 0 && ((t.mode & 1) === 0 ? r = 1 : (r = Oi, Oi <<= 1, (Oi & 130023424) === 0 && (Oi = 4194304)));
    var s = ot();
    t = an(t, r), t !== null && (Ao(t, r, s), ft(t, s));
  }
  function xx(t) {
    var r = t.memoizedState, s = 0;
    r !== null && (s = r.retryLane), Wh(t, s);
  }
  function _x(t, r) {
    var s = 0;
    switch (t.tag) {
      case 13:
        var u = t.stateNode, h = t.memoizedState;
        h !== null && (s = h.retryLane);
        break;
      case 19:
        u = t.stateNode;
        break;
      default:
        throw Error(o(314));
    }
    u !== null && u.delete(r), Wh(t, s);
  }
  var Gh;
  Gh = function(t, r, s) {
    if (t !== null) if (t.memoizedProps !== r.pendingProps || lt.current) ct = !0;
    else {
      if ((t.lanes & s) === 0 && (r.flags & 128) === 0) return ct = !1, ux(t, r, s);
      ct = (t.flags & 131072) !== 0;
    }
    else ct = !1, Re && (r.flags & 1048576) !== 0 && Ap(r, is, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var u = r.type;
        ws(t, r), t = r.pendingProps;
        var h = Or(r, qe.current);
        $r(r, s), h = Xl(null, r, u, t, h, s);
        var y = Zl();
        return r.flags |= 1, typeof h == "object" && h !== null && typeof h.render == "function" && h.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, ut(u) ? (y = !0, ns(r)) : y = !1, r.memoizedState = h.state !== null && h.state !== void 0 ? h.state : null, $l(r), h.updater = vs, r.stateNode = h, h._reactInternals = r, ru(r, u, t, s), r = au(null, r, u, !0, y, s)) : (r.tag = 0, Re && y && Nl(r), rt(null, r, h, s), r = r.child), r;
      case 16:
        u = r.elementType;
        e: {
          switch (ws(t, r), t = r.pendingProps, h = u._init, u = h(u._payload), r.type = u, h = r.tag = kx(u), t = It(u, t), h) {
            case 0:
              r = su(null, r, u, t, s);
              break e;
            case 1:
              r = vh(null, r, u, t, s);
              break e;
            case 11:
              r = ph(null, r, u, t, s);
              break e;
            case 14:
              r = hh(null, r, u, It(u.type, t), s);
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
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : It(u, h), su(t, r, u, h, s);
      case 1:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : It(u, h), vh(t, r, u, h, s);
      case 3:
        e: {
          if (Sh(r), t === null) throw Error(o(387));
          u = r.pendingProps, y = r.memoizedState, h = y.element, Ip(t, r), ds(r, u, null, s);
          var x = r.memoizedState;
          if (u = x.element, y.isDehydrated) if (y = { element: u, isDehydrated: !1, cache: x.cache, pendingSuspenseBoundaries: x.pendingSuspenseBoundaries, transitions: x.transitions }, r.updateQueue.baseState = y, r.memoizedState = y, r.flags & 256) {
            h = Wr(Error(o(423)), r), r = wh(t, r, u, s, h);
            break e;
          } else if (u !== h) {
            h = Wr(Error(o(424)), r), r = wh(t, r, u, s, h);
            break e;
          } else for (vt = _n(r.stateNode.containerInfo.firstChild), gt = r, Re = !0, Nt = null, s = Dp(r, null, u, s), r.child = s; s; ) s.flags = s.flags & -3 | 4096, s = s.sibling;
          else {
            if (Br(), u === h) {
              r = un(t, r, s);
              break e;
            }
            rt(t, r, u, s);
          }
          r = r.child;
        }
        return r;
      case 5:
        return Op(r), t === null && jl(r), u = r.type, h = r.pendingProps, y = t !== null ? t.memoizedProps : null, x = h.children, Pl(u, h) ? x = null : y !== null && Pl(u, y) && (r.flags |= 32), gh(t, r), rt(t, r, x, s), r.child;
      case 6:
        return t === null && jl(r), null;
      case 13:
        return xh(t, r, s);
      case 4:
        return Hl(r, r.stateNode.containerInfo), u = r.pendingProps, t === null ? r.child = zr(r, null, u, s) : rt(t, r, u, s), r.child;
      case 11:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : It(u, h), ph(t, r, u, h, s);
      case 7:
        return rt(t, r, r.pendingProps, s), r.child;
      case 8:
        return rt(t, r, r.pendingProps.children, s), r.child;
      case 12:
        return rt(t, r, r.pendingProps.children, s), r.child;
      case 10:
        e: {
          if (u = r.type._context, h = r.pendingProps, y = r.memoizedProps, x = h.value, Ce(ls, u._currentValue), u._currentValue = x, y !== null) if (Dt(y.value, x)) {
            if (y.children === h.children && !lt.current) {
              r = un(t, r, s);
              break e;
            }
          } else for (y = r.child, y !== null && (y.return = r); y !== null; ) {
            var P = y.dependencies;
            if (P !== null) {
              x = y.child;
              for (var b = P.firstContext; b !== null; ) {
                if (b.context === u) {
                  if (y.tag === 1) {
                    b = ln(-1, s & -s), b.tag = 2;
                    var j = y.updateQueue;
                    if (j !== null) {
                      j = j.shared;
                      var z = j.pending;
                      z === null ? b.next = b : (b.next = z.next, z.next = b), j.pending = b;
                    }
                  }
                  y.lanes |= s, b = y.alternate, b !== null && (b.lanes |= s), zl(
                    y.return,
                    s,
                    r
                  ), P.lanes |= s;
                  break;
                }
                b = b.next;
              }
            } else if (y.tag === 10) x = y.type === r.type ? null : y.child;
            else if (y.tag === 18) {
              if (x = y.return, x === null) throw Error(o(341));
              x.lanes |= s, P = x.alternate, P !== null && (P.lanes |= s), zl(x, s, r), x = y.sibling;
            } else x = y.child;
            if (x !== null) x.return = y;
            else for (x = y; x !== null; ) {
              if (x === r) {
                x = null;
                break;
              }
              if (y = x.sibling, y !== null) {
                y.return = x.return, x = y;
                break;
              }
              x = x.return;
            }
            y = x;
          }
          rt(t, r, h.children, s), r = r.child;
        }
        return r;
      case 9:
        return h = r.type, u = r.pendingProps.children, $r(r, s), h = kt(h), u = u(h), r.flags |= 1, rt(t, r, u, s), r.child;
      case 14:
        return u = r.type, h = It(u, r.pendingProps), h = It(u.type, h), hh(t, r, u, h, s);
      case 15:
        return mh(t, r, r.type, r.pendingProps, s);
      case 17:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : It(u, h), ws(t, r), r.tag = 1, ut(u) ? (t = !0, ns(r)) : t = !1, $r(r, s), sh(r, u, h), ru(r, u, h, s), au(null, r, u, !0, t, s);
      case 19:
        return Th(t, r, s);
      case 22:
        return yh(t, r, s);
    }
    throw Error(o(156, r.tag));
  };
  function Kh(t, r) {
    return Cf(t, r);
  }
  function Tx(t, r, s, u) {
    this.tag = t, this.key = s, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = u, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Pt(t, r, s, u) {
    return new Tx(t, r, s, u);
  }
  function Pu(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function kx(t) {
    if (typeof t == "function") return Pu(t) ? 1 : 0;
    if (t != null) {
      if (t = t.$$typeof, t === J) return 11;
      if (t === _e) return 14;
    }
    return 2;
  }
  function Nn(t, r) {
    var s = t.alternate;
    return s === null ? (s = Pt(t.tag, r, t.key, t.mode), s.elementType = t.elementType, s.type = t.type, s.stateNode = t.stateNode, s.alternate = t, t.alternate = s) : (s.pendingProps = r, s.type = t.type, s.flags = 0, s.subtreeFlags = 0, s.deletions = null), s.flags = t.flags & 14680064, s.childLanes = t.childLanes, s.lanes = t.lanes, s.child = t.child, s.memoizedProps = t.memoizedProps, s.memoizedState = t.memoizedState, s.updateQueue = t.updateQueue, r = t.dependencies, s.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, s.sibling = t.sibling, s.index = t.index, s.ref = t.ref, s;
  }
  function Rs(t, r, s, u, h, y) {
    var x = 2;
    if (u = t, typeof t == "function") Pu(t) && (x = 1);
    else if (typeof t == "string") x = 5;
    else e: switch (t) {
      case K:
        return sr(s.children, h, y, r);
      case G:
        x = 8, h |= 8;
        break;
      case L:
        return t = Pt(12, s, r, h | 2), t.elementType = L, t.lanes = y, t;
      case de:
        return t = Pt(13, s, r, h), t.elementType = de, t.lanes = y, t;
      case ue:
        return t = Pt(19, s, r, h), t.elementType = ue, t.lanes = y, t;
      case Se:
        return Ds(s, h, y, r);
      default:
        if (typeof t == "object" && t !== null) switch (t.$$typeof) {
          case Q:
            x = 10;
            break e;
          case ae:
            x = 9;
            break e;
          case J:
            x = 11;
            break e;
          case _e:
            x = 14;
            break e;
          case ve:
            x = 16, u = null;
            break e;
        }
        throw Error(o(130, t == null ? t : typeof t, ""));
    }
    return r = Pt(x, s, r, h), r.elementType = t, r.type = u, r.lanes = y, r;
  }
  function sr(t, r, s, u) {
    return t = Pt(7, t, u, r), t.lanes = s, t;
  }
  function Ds(t, r, s, u) {
    return t = Pt(22, t, u, r), t.elementType = Se, t.lanes = s, t.stateNode = { isHidden: !1 }, t;
  }
  function Eu(t, r, s) {
    return t = Pt(6, t, null, r), t.lanes = s, t;
  }
  function bu(t, r, s) {
    return r = Pt(4, t.children !== null ? t.children : [], t.key, r), r.lanes = s, r.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, r;
  }
  function Ax(t, r, s, u, h) {
    this.tag = r, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = nl(0), this.expirationTimes = nl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = nl(0), this.identifierPrefix = u, this.onRecoverableError = h, this.mutableSourceEagerHydrationData = null;
  }
  function Mu(t, r, s, u, h, y, x, P, b) {
    return t = new Ax(t, r, s, P, b), r === 1 ? (r = 1, y === !0 && (r |= 8)) : r = 0, y = Pt(3, null, null, r), t.current = y, y.stateNode = t, y.memoizedState = { element: u, isDehydrated: s, cache: null, transitions: null, pendingSuspenseBoundaries: null }, $l(y), t;
  }
  function Cx(t, r, s) {
    var u = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: W, key: u == null ? null : "" + u, children: t, containerInfo: r, implementation: s };
  }
  function Yh(t) {
    if (!t) return kn;
    t = t._reactInternals;
    e: {
      if (Yn(t) !== t || t.tag !== 1) throw Error(o(170));
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
      if (ut(s)) return _p(t, s, r);
    }
    return r;
  }
  function Qh(t, r, s, u, h, y, x, P, b) {
    return t = Mu(s, u, !0, t, h, y, x, P, b), t.context = Yh(null), s = t.current, u = ot(), h = Rn(s), y = ln(u, h), y.callback = r ?? null, Pn(s, y, h), t.current.lanes = h, Ao(t, h, u), ft(t, u), t;
  }
  function Ns(t, r, s, u) {
    var h = r.current, y = ot(), x = Rn(h);
    return s = Yh(s), r.context === null ? r.context = s : r.pendingContext = s, r = ln(y, x), r.payload = { element: t }, u = u === void 0 ? null : u, u !== null && (r.callback = u), t = Pn(h, r, x), t !== null && (Ot(t, h, x, y), cs(t, h, x)), x;
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
  function Xh(t, r) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var s = t.retryLane;
      t.retryLane = s !== 0 && s < r ? s : r;
    }
  }
  function Ru(t, r) {
    Xh(t, r), (t = t.alternate) && Xh(t, r);
  }
  function Px() {
    return null;
  }
  var Zh = typeof reportError == "function" ? reportError : function(t) {
    console.error(t);
  };
  function Du(t) {
    this._internalRoot = t;
  }
  Fs.prototype.render = Du.prototype.render = function(t) {
    var r = this._internalRoot;
    if (r === null) throw Error(o(409));
    Ns(t, r, null, null);
  }, Fs.prototype.unmount = Du.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var r = t.containerInfo;
      rr(function() {
        Ns(null, t, null, null);
      }), r[nn] = null;
    }
  };
  function Fs(t) {
    this._internalRoot = t;
  }
  Fs.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var r = If();
      t = { blockedOn: null, target: t, priority: r };
      for (var s = 0; s < Sn.length && r !== 0 && r < Sn[s].priority; s++) ;
      Sn.splice(s, 0, t), s === 0 && Of(t);
    }
  };
  function Nu(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function js(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11 && (t.nodeType !== 8 || t.nodeValue !== " react-mount-point-unstable "));
  }
  function Jh() {
  }
  function Ex(t, r, s, u, h) {
    if (h) {
      if (typeof u == "function") {
        var y = u;
        u = function() {
          var j = Is(x);
          y.call(j);
        };
      }
      var x = Qh(r, u, t, 0, null, !1, !1, "", Jh);
      return t._reactRootContainer = x, t[nn] = x.current, Vo(t.nodeType === 8 ? t.parentNode : t), rr(), x;
    }
    for (; h = t.lastChild; ) t.removeChild(h);
    if (typeof u == "function") {
      var P = u;
      u = function() {
        var j = Is(b);
        P.call(j);
      };
    }
    var b = Mu(t, 0, !1, null, null, !1, !1, "", Jh);
    return t._reactRootContainer = b, t[nn] = b.current, Vo(t.nodeType === 8 ? t.parentNode : t), rr(function() {
      Ns(r, b, s, u);
    }), b;
  }
  function Os(t, r, s, u, h) {
    var y = s._reactRootContainer;
    if (y) {
      var x = y;
      if (typeof h == "function") {
        var P = h;
        h = function() {
          var b = Is(x);
          P.call(b);
        };
      }
      Ns(r, x, t, h);
    } else x = Ex(s, r, t, h, u);
    return Is(x);
  }
  Df = function(t) {
    switch (t.tag) {
      case 3:
        var r = t.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var s = ko(r.pendingLanes);
          s !== 0 && (rl(r, s | 1), ft(r, je()), (he & 6) === 0 && (Yr = je() + 500, An()));
        }
        break;
      case 13:
        rr(function() {
          var u = an(t, 1);
          if (u !== null) {
            var h = ot();
            Ot(u, t, 1, h);
          }
        }), Ru(t, 1);
    }
  }, ol = function(t) {
    if (t.tag === 13) {
      var r = an(t, 134217728);
      if (r !== null) {
        var s = ot();
        Ot(r, t, 134217728, s);
      }
      Ru(t, 134217728);
    }
  }, Nf = function(t) {
    if (t.tag === 13) {
      var r = Rn(t), s = an(t, r);
      if (s !== null) {
        var u = ot();
        Ot(s, t, r, u);
      }
      Ru(t, r);
    }
  }, If = function() {
    return xe;
  }, Ff = function(t, r) {
    var s = xe;
    try {
      return xe = t, r();
    } finally {
      xe = s;
    }
  }, Xa = function(t, r, s) {
    switch (r) {
      case "input":
        if (Ua(t, s), r = s.name, s.type === "radio" && r != null) {
          for (s = t; s.parentNode; ) s = s.parentNode;
          for (s = s.querySelectorAll("input[name=" + JSON.stringify("" + r) + '][type="radio"]'), r = 0; r < s.length; r++) {
            var u = s[r];
            if (u !== t && u.form === t.form) {
              var h = es(u);
              if (!h) throw Error(o(90));
              of(u), Ua(u, h);
            }
          }
        }
        break;
      case "textarea":
        cf(t, s);
        break;
      case "select":
        r = s.value, r != null && Ar(t, !!s.multiple, r, !1);
    }
  }, Sf = ku, wf = rr;
  var bx = { usingClientEntryPoint: !1, Events: [Uo, Fr, es, gf, vf, ku] }, ni = { findFiberByHostInstance: Qn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Mx = { bundleType: ni.bundleType, version: ni.version, rendererPackageName: ni.rendererPackageName, rendererConfig: ni.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: N.ReactCurrentDispatcher, findHostInstanceByFiber: function(t) {
    return t = kf(t), t === null ? null : t.stateNode;
  }, findFiberByHostInstance: ni.findFiberByHostInstance || Px, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Ls = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Ls.isDisabled && Ls.supportsFiber) try {
      Fi = Ls.inject(Mx), Ut = Ls;
    } catch {
    }
  }
  return pt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = bx, pt.createPortal = function(t, r) {
    var s = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Nu(r)) throw Error(o(200));
    return Cx(t, r, null, s);
  }, pt.createRoot = function(t, r) {
    if (!Nu(t)) throw Error(o(299));
    var s = !1, u = "", h = Zh;
    return r != null && (r.unstable_strictMode === !0 && (s = !0), r.identifierPrefix !== void 0 && (u = r.identifierPrefix), r.onRecoverableError !== void 0 && (h = r.onRecoverableError)), r = Mu(t, 1, !1, null, null, s, !1, u, h), t[nn] = r.current, Vo(t.nodeType === 8 ? t.parentNode : t), new Du(r);
  }, pt.findDOMNode = function(t) {
    if (t == null) return null;
    if (t.nodeType === 1) return t;
    var r = t._reactInternals;
    if (r === void 0)
      throw typeof t.render == "function" ? Error(o(188)) : (t = Object.keys(t).join(","), Error(o(268, t)));
    return t = kf(r), t = t === null ? null : t.stateNode, t;
  }, pt.flushSync = function(t) {
    return rr(t);
  }, pt.hydrate = function(t, r, s) {
    if (!js(r)) throw Error(o(200));
    return Os(null, t, r, !0, s);
  }, pt.hydrateRoot = function(t, r, s) {
    if (!Nu(t)) throw Error(o(405));
    var u = s != null && s.hydratedSources || null, h = !1, y = "", x = Zh;
    if (s != null && (s.unstable_strictMode === !0 && (h = !0), s.identifierPrefix !== void 0 && (y = s.identifierPrefix), s.onRecoverableError !== void 0 && (x = s.onRecoverableError)), r = Qh(r, null, t, 1, s ?? null, h, !1, y, x), t[nn] = r.current, Vo(t), u) for (t = 0; t < u.length; t++) s = u[t], h = s._getVersion, h = h(s._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [s, h] : r.mutableSourceEagerHydrationData.push(
      s,
      h
    );
    return new Fs(r);
  }, pt.render = function(t, r, s) {
    if (!js(r)) throw Error(o(200));
    return Os(null, t, r, !1, s);
  }, pt.unmountComponentAtNode = function(t) {
    if (!js(t)) throw Error(o(40));
    return t._reactRootContainer ? (rr(function() {
      Os(null, null, t, !1, function() {
        t._reactRootContainer = null, t[nn] = null;
      });
    }), !0) : !1;
  }, pt.unstable_batchedUpdates = ku, pt.unstable_renderSubtreeIntoContainer = function(t, r, s, u) {
    if (!js(s)) throw Error(o(200));
    if (t == null || t._reactInternals === void 0) throw Error(o(38));
    return Os(t, r, s, !1, u);
  }, pt.version = "18.3.1-next-f1338f8080-20240426", pt;
}
var am;
function pg() {
  if (am) return Fu.exports;
  am = 1;
  function e() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (n) {
        console.error(n);
      }
  }
  return e(), Fu.exports = zx(), Fu.exports;
}
var lm;
function Ux() {
  if (lm) return Bs;
  lm = 1;
  var e = pg();
  return Bs.createRoot = e.createRoot, Bs.hydrateRoot = e.hydrateRoot, Bs;
}
var $x = Ux(), Lu = { exports: {} }, oi = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var um;
function Hx() {
  if (um) return oi;
  um = 1;
  var e = ad(), n = Symbol.for("react.element"), o = Symbol.for("react.fragment"), i = Object.prototype.hasOwnProperty, a = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function d(p, m, g) {
    var v, l = {}, f = null, S = null;
    g !== void 0 && (f = "" + g), m.key !== void 0 && (f = "" + m.key), m.ref !== void 0 && (S = m.ref);
    for (v in m) i.call(m, v) && !c.hasOwnProperty(v) && (l[v] = m[v]);
    if (p && p.defaultProps) for (v in m = p.defaultProps, m) l[v] === void 0 && (l[v] = m[v]);
    return { $$typeof: n, type: p, key: f, ref: S, props: l, _owner: a.current };
  }
  return oi.Fragment = o, oi.jsx = d, oi.jsxs = d, oi;
}
var cm;
function Wx() {
  return cm || (cm = 1, Lu.exports = Hx()), Lu.exports;
}
var k = Wx();
const dm = (e) => Symbol.iterator in e, fm = (e) => (
  // HACK: avoid checking entries type
  "entries" in e
), pm = (e, n) => {
  const o = e instanceof Map ? e : new Map(e.entries()), i = n instanceof Map ? n : new Map(n.entries());
  if (o.size !== i.size)
    return !1;
  for (const [a, c] of o)
    if (!i.has(a) || !Object.is(c, i.get(a)))
      return !1;
  return !0;
}, Gx = (e, n) => {
  const o = e[Symbol.iterator](), i = n[Symbol.iterator]();
  let a = o.next(), c = i.next();
  for (; !a.done && !c.done; ) {
    if (!Object.is(a.value, c.value))
      return !1;
    a = o.next(), c = i.next();
  }
  return !!a.done && !!c.done;
};
function Kx(e, n) {
  return Object.is(e, n) ? !0 : typeof e != "object" || e === null || typeof n != "object" || n === null || Object.getPrototypeOf(e) !== Object.getPrototypeOf(n) ? !1 : dm(e) && dm(n) ? fm(e) && fm(n) ? pm(e, n) : Gx(e, n) : pm(
    { entries: () => Object.entries(e) },
    { entries: () => Object.entries(n) }
  );
}
function Yx(e) {
  const n = pn.useRef(void 0);
  return (o) => {
    const i = e(o);
    return Kx(n.current, i) ? n.current : n.current = i;
  };
}
const ld = C.createContext({});
function ud(e) {
  const n = C.useRef(null);
  return n.current === null && (n.current = e()), n.current;
}
const Qx = typeof window < "u", hg = Qx ? C.useLayoutEffect : C.useEffect, ba = /* @__PURE__ */ C.createContext(null);
function cd(e, n) {
  e.indexOf(n) === -1 && e.push(n);
}
function ha(e, n) {
  const o = e.indexOf(n);
  o > -1 && e.splice(o, 1);
}
const en = (e, n, o) => o > n ? n : o < e ? e : o;
function hm(e, n) {
  return n ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${n}` : e;
}
let xi = () => {
}, Sr = () => {
};
var ag;
typeof process < "u" && ((ag = process.env) == null ? void 0 : ag.NODE_ENV) !== "production" && (xi = (e, n, o) => {
  !e && typeof console < "u" && console.warn(hm(n, o));
}, Sr = (e, n, o) => {
  if (!e)
    throw new Error(hm(n, o));
});
const Wn = {}, mg = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), yg = (e) => typeof e == "object" && e !== null, gg = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function vg(e) {
  let n;
  return () => (n === void 0 && (n = e()), n);
}
const Mt = /* @__NO_SIDE_EFFECTS__ */ (e) => e, _i = (...e) => e.reduce((n, o) => (i) => o(n(i))), pi = /* @__NO_SIDE_EFFECTS__ */ (e, n, o) => {
  const i = n - e;
  return i ? (o - e) / i : 1;
};
class dd {
  constructor() {
    this.subscriptions = [];
  }
  add(n) {
    return cd(this.subscriptions, n), () => ha(this.subscriptions, n);
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
const ht = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, bt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, Sg = /* @__NO_SIDE_EFFECTS__ */ (e, n) => n ? e * (1e3 / n) : 0, wg = (e, n, o) => (((1 - 3 * o + 3 * n) * e + (3 * o - 6 * n)) * e + 3 * n) * e, Xx = 1e-7, Zx = 12;
function Jx(e, n, o, i, a) {
  let c, d, p = 0;
  do
    d = n + (o - n) / 2, c = wg(d, i, a) - e, c > 0 ? o = d : n = d;
  while (Math.abs(c) > Xx && ++p < Zx);
  return d;
}
// @__NO_SIDE_EFFECTS__
function Ti(e, n, o, i) {
  if (e === n && o === i)
    return Mt;
  const a = (c) => Jx(c, 0, 1, e, o);
  return (c) => c === 0 || c === 1 ? c : wg(a(c), n, i);
}
const xg = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => n <= 0.5 ? e(2 * n) / 2 : (2 - e(2 * (1 - n))) / 2, _g = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => 1 - e(1 - n), Tg = /* @__PURE__ */ Ti(0.33, 1.53, 0.69, 0.99), fd = /* @__PURE__ */ _g(Tg), kg = /* @__PURE__ */ xg(fd), Ag = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * fd(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), pd = (e) => 1 - Math.sin(Math.acos(e)), Cg = /* @__PURE__ */ _g(pd), Pg = /* @__PURE__ */ xg(pd), qx = /* @__PURE__ */ Ti(0.42, 0, 1, 1), e_ = /* @__PURE__ */ Ti(0, 0, 0.58, 1), Eg = /* @__PURE__ */ Ti(0.42, 0, 0.58, 1), t_ = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number", bg = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", mm = {
  linear: Mt,
  easeIn: qx,
  easeInOut: Eg,
  easeOut: e_,
  circIn: pd,
  circInOut: Pg,
  circOut: Cg,
  backIn: fd,
  backInOut: kg,
  backOut: Tg,
  anticipate: Ag
}, n_ = (e) => typeof e == "string", ym = (e) => {
  if (/* @__PURE__ */ bg(e)) {
    Sr(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [n, o, i, a] = e;
    return /* @__PURE__ */ Ti(n, o, i, a);
  } else if (n_(e))
    return Sr(mm[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), mm[e];
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
function r_(e, n) {
  let o = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = !1, c = !1;
  const d = /* @__PURE__ */ new WeakSet();
  let p = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function m(v) {
    d.has(v) && (g.schedule(v), e()), v(p);
  }
  const g = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (v, l = !1, f = !1) => {
      const w = f && a ? o : i;
      return l && d.add(v), w.add(v), v;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (v) => {
      i.delete(v), d.delete(v);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (v) => {
      if (p = v, a) {
        c = !0;
        return;
      }
      a = !0;
      const l = o;
      o = i, i = l, o.forEach(m), o.clear(), a = !1, c && (c = !1, g.process(v));
    }
  };
  return g;
}
const o_ = 40;
function Mg(e, n) {
  let o = !1, i = !0;
  const a = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, c = () => o = !0, d = zs.reduce((M, N) => (M[N] = r_(c), M), {}), { setup: p, read: m, resolveKeyframes: g, preUpdate: v, update: l, preRender: f, render: S, postRender: w } = d, T = () => {
    const M = Wn.useManualTiming, N = M ? a.timestamp : performance.now();
    o = !1, M || (a.delta = i ? 1e3 / 60 : Math.max(Math.min(N - a.timestamp, o_), 1)), a.timestamp = N, a.isProcessing = !0, p.process(a), m.process(a), g.process(a), v.process(a), l.process(a), f.process(a), S.process(a), w.process(a), a.isProcessing = !1, o && n && (i = !1, e(T));
  }, _ = () => {
    o = !0, i = !0, a.isProcessing || e(T);
  };
  return { schedule: zs.reduce((M, N) => {
    const O = d[N];
    return M[N] = (W, K = !1, G = !1) => (o || _(), O.schedule(W, K, G)), M;
  }, {}), cancel: (M) => {
    for (let N = 0; N < zs.length; N++)
      d[zs[N]].cancel(M);
  }, state: a, steps: d };
}
const { schedule: ke, cancel: Gn, state: Xe, steps: Vu } = /* @__PURE__ */ Mg(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Mt, !0);
let na;
function i_() {
  na = void 0;
}
const it = {
  now: () => (na === void 0 && it.set(Xe.isProcessing || Wn.useManualTiming ? Xe.timestamp : performance.now()), na),
  set: (e) => {
    na = e, queueMicrotask(i_);
  }
}, Rg = (e) => (n) => typeof n == "string" && n.startsWith(e), Dg = /* @__PURE__ */ Rg("--"), s_ = /* @__PURE__ */ Rg("var(--"), hd = (e) => s_(e) ? a_.test(e.split("/*")[0].trim()) : !1, a_ = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function gm(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
const fo = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, hi = {
  ...fo,
  transform: (e) => en(0, 1, e)
}, Us = {
  ...fo,
  default: 1
}, li = (e) => Math.round(e * 1e5) / 1e5, md = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function l_(e) {
  return e == null;
}
const u_ = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, yd = (e, n) => (o) => !!(typeof o == "string" && u_.test(o) && o.startsWith(e) || n && !l_(o) && Object.prototype.hasOwnProperty.call(o, n)), Ng = (e, n, o) => (i) => {
  if (typeof i != "string")
    return i;
  const [a, c, d, p] = i.match(md);
  return {
    [e]: parseFloat(a),
    [n]: parseFloat(c),
    [o]: parseFloat(d),
    alpha: p !== void 0 ? parseFloat(p) : 1
  };
}, c_ = (e) => en(0, 255, e), Bu = {
  ...fo,
  transform: (e) => Math.round(c_(e))
}, dr = {
  test: /* @__PURE__ */ yd("rgb", "red"),
  parse: /* @__PURE__ */ Ng("red", "green", "blue"),
  transform: ({ red: e, green: n, blue: o, alpha: i = 1 }) => "rgba(" + Bu.transform(e) + ", " + Bu.transform(n) + ", " + Bu.transform(o) + ", " + li(hi.transform(i)) + ")"
};
function d_(e) {
  let n = "", o = "", i = "", a = "";
  return e.length > 5 ? (n = e.substring(1, 3), o = e.substring(3, 5), i = e.substring(5, 7), a = e.substring(7, 9)) : (n = e.substring(1, 2), o = e.substring(2, 3), i = e.substring(3, 4), a = e.substring(4, 5), n += n, o += o, i += i, a += a), {
    red: parseInt(n, 16),
    green: parseInt(o, 16),
    blue: parseInt(i, 16),
    alpha: a ? parseInt(a, 16) / 255 : 1
  };
}
const fc = {
  test: /* @__PURE__ */ yd("#"),
  parse: d_,
  transform: dr.transform
}, ki = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (n) => typeof n == "string" && n.endsWith(e) && n.split(" ").length === 1,
  parse: parseFloat,
  transform: (n) => `${n}${e}`
}), dn = /* @__PURE__ */ ki("deg"), qt = /* @__PURE__ */ ki("%"), te = /* @__PURE__ */ ki("px"), f_ = /* @__PURE__ */ ki("vh"), p_ = /* @__PURE__ */ ki("vw"), vm = {
  ...qt,
  parse: (e) => qt.parse(e) / 100,
  transform: (e) => qt.transform(e * 100)
}, no = {
  test: /* @__PURE__ */ yd("hsl", "hue"),
  parse: /* @__PURE__ */ Ng("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: n, lightness: o, alpha: i = 1 }) => "hsla(" + Math.round(e) + ", " + qt.transform(li(n)) + ", " + qt.transform(li(o)) + ", " + li(hi.transform(i)) + ")"
}, Ve = {
  test: (e) => dr.test(e) || fc.test(e) || no.test(e),
  parse: (e) => dr.test(e) ? dr.parse(e) : no.test(e) ? no.parse(e) : fc.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? dr.transform(e) : no.transform(e),
  getAnimatableNone: (e) => {
    const n = Ve.parse(e);
    return n.alpha = 0, Ve.transform(n);
  }
}, h_ = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function m_(e) {
  var n, o;
  return isNaN(e) && typeof e == "string" && (((n = e.match(md)) == null ? void 0 : n.length) || 0) + (((o = e.match(h_)) == null ? void 0 : o.length) || 0) > 0;
}
const Ig = "number", Fg = "color", y_ = "var", g_ = "var(", Sm = "${}", v_ = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function lo(e) {
  const n = e.toString(), o = [], i = {
    color: [],
    number: [],
    var: []
  }, a = [];
  let c = 0;
  const p = n.replace(v_, (m) => (Ve.test(m) ? (i.color.push(c), a.push(Fg), o.push(Ve.parse(m))) : m.startsWith(g_) ? (i.var.push(c), a.push(y_), o.push(m)) : (i.number.push(c), a.push(Ig), o.push(parseFloat(m))), ++c, Sm)).split(Sm);
  return { values: o, split: p, indexes: i, types: a };
}
function S_(e) {
  return lo(e).values;
}
function jg({ split: e, types: n }) {
  const o = e.length;
  return (i) => {
    let a = "";
    for (let c = 0; c < o; c++)
      if (a += e[c], i[c] !== void 0) {
        const d = n[c];
        d === Ig ? a += li(i[c]) : d === Fg ? a += Ve.transform(i[c]) : a += i[c];
      }
    return a;
  };
}
function w_(e) {
  return jg(lo(e));
}
const x_ = (e) => typeof e == "number" ? 0 : Ve.test(e) ? Ve.getAnimatableNone(e) : e, __ = (e, n) => typeof e == "number" ? n != null && n.trim().endsWith("/") ? e : 0 : x_(e);
function T_(e) {
  const n = lo(e);
  return jg(n)(n.values.map((i, a) => __(i, n.split[a])));
}
const Bt = {
  test: m_,
  parse: S_,
  createTransformer: w_,
  getAnimatableNone: T_
};
function zu(e, n, o) {
  return o < 0 && (o += 1), o > 1 && (o -= 1), o < 1 / 6 ? e + (n - e) * 6 * o : o < 1 / 2 ? n : o < 2 / 3 ? e + (n - e) * (2 / 3 - o) * 6 : e;
}
function k_({ hue: e, saturation: n, lightness: o, alpha: i }) {
  e /= 360, n /= 100, o /= 100;
  let a = 0, c = 0, d = 0;
  if (!n)
    a = c = d = o;
  else {
    const p = o < 0.5 ? o * (1 + n) : o + n - o * n, m = 2 * o - p;
    a = zu(m, p, e + 1 / 3), c = zu(m, p, e), d = zu(m, p, e - 1 / 3);
  }
  return {
    red: Math.round(a * 255),
    green: Math.round(c * 255),
    blue: Math.round(d * 255),
    alpha: i
  };
}
function ma(e, n) {
  return (o) => o > 0 ? n : e;
}
const Te = (e, n, o) => e + (n - e) * o, Uu = (e, n, o) => {
  const i = e * e, a = o * (n * n - i) + i;
  return a < 0 ? 0 : Math.sqrt(a);
}, A_ = [fc, dr, no], C_ = (e) => A_.find((n) => n.test(e));
function wm(e) {
  const n = C_(e);
  if (xi(!!n, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !n)
    return !1;
  let o = n.parse(e);
  return n === no && (o = k_(o)), o;
}
const xm = (e, n) => {
  const o = wm(e), i = wm(n);
  if (!o || !i)
    return ma(e, n);
  const a = { ...o };
  return (c) => (a.red = Uu(o.red, i.red, c), a.green = Uu(o.green, i.green, c), a.blue = Uu(o.blue, i.blue, c), a.alpha = Te(o.alpha, i.alpha, c), dr.transform(a));
}, pc = /* @__PURE__ */ new Set(["none", "hidden"]);
function P_(e, n) {
  return pc.has(e) ? (o) => o <= 0 ? e : n : (o) => o >= 1 ? n : e;
}
function E_(e, n) {
  return (o) => Te(e, n, o);
}
function gd(e) {
  return typeof e == "number" ? E_ : typeof e == "string" ? hd(e) ? ma : Ve.test(e) ? xm : R_ : Array.isArray(e) ? Og : typeof e == "object" ? Ve.test(e) ? xm : b_ : ma;
}
function Og(e, n) {
  const o = [...e], i = o.length, a = e.map((c, d) => gd(c)(c, n[d]));
  return (c) => {
    for (let d = 0; d < i; d++)
      o[d] = a[d](c);
    return o;
  };
}
function b_(e, n) {
  const o = { ...e, ...n }, i = {};
  for (const a in o)
    e[a] !== void 0 && n[a] !== void 0 && (i[a] = gd(e[a])(e[a], n[a]));
  return (a) => {
    for (const c in i)
      o[c] = i[c](a);
    return o;
  };
}
function M_(e, n) {
  const o = [], i = { color: 0, var: 0, number: 0 };
  for (let a = 0; a < n.values.length; a++) {
    const c = n.types[a], d = e.indexes[c][i[c]], p = e.values[d] ?? 0;
    o[a] = p, i[c]++;
  }
  return o;
}
const R_ = (e, n) => {
  const o = Bt.createTransformer(n), i = lo(e), a = lo(n);
  return i.indexes.var.length === a.indexes.var.length && i.indexes.color.length === a.indexes.color.length && i.indexes.number.length >= a.indexes.number.length ? pc.has(e) && !a.values.length || pc.has(n) && !i.values.length ? P_(e, n) : _i(Og(M_(i, a), a.values), o) : (xi(!0, `Complex values '${e}' and '${n}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), ma(e, n));
};
function Lg(e, n, o) {
  return typeof e == "number" && typeof n == "number" && typeof o == "number" ? Te(e, n, o) : gd(e)(e, n);
}
const D_ = (e) => {
  const n = ({ timestamp: o }) => e(o);
  return {
    start: (o = !0) => ke.update(n, o),
    stop: () => Gn(n),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Xe.isProcessing ? Xe.timestamp : it.now()
  };
}, Vg = (e, n, o = 10) => {
  let i = "";
  const a = Math.max(Math.round(n / o), 2);
  for (let c = 0; c < a; c++)
    i += Math.round(e(c / (a - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${i.substring(0, i.length - 2)})`;
}, ya = 2e4;
function vd(e) {
  let n = 0;
  const o = 50;
  let i = e.next(n);
  for (; !i.done && n < ya; )
    n += o, i = e.next(n);
  return n >= ya ? 1 / 0 : n;
}
function N_(e, n = 100, o) {
  const i = o({ ...e, keyframes: [0, n] }), a = Math.min(vd(i), ya);
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
function hc(e, n) {
  return e * Math.sqrt(1 - n * n);
}
const I_ = 12;
function F_(e, n, o) {
  let i = o;
  for (let a = 1; a < I_; a++)
    i = i - e(i) / n(i);
  return i;
}
const $u = 1e-3;
function j_({ duration: e = Ie.duration, bounce: n = Ie.bounce, velocity: o = Ie.velocity, mass: i = Ie.mass }) {
  let a, c;
  xi(e <= /* @__PURE__ */ ht(Ie.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let d = 1 - n;
  d = en(Ie.minDamping, Ie.maxDamping, d), e = en(Ie.minDuration, Ie.maxDuration, /* @__PURE__ */ bt(e)), d < 1 ? (a = (g) => {
    const v = g * d, l = v * e, f = v - o, S = hc(g, d), w = Math.exp(-l);
    return $u - f / S * w;
  }, c = (g) => {
    const l = g * d * e, f = l * o + o, S = Math.pow(d, 2) * Math.pow(g, 2) * e, w = Math.exp(-l), T = hc(Math.pow(g, 2), d);
    return (-a(g) + $u > 0 ? -1 : 1) * ((f - S) * w) / T;
  }) : (a = (g) => {
    const v = Math.exp(-g * e), l = (g - o) * e + 1;
    return -$u + v * l;
  }, c = (g) => {
    const v = Math.exp(-g * e), l = (o - g) * (e * e);
    return v * l;
  });
  const p = 5 / e, m = F_(a, c, p);
  if (e = /* @__PURE__ */ ht(e), isNaN(m))
    return {
      stiffness: Ie.stiffness,
      damping: Ie.damping,
      duration: e
    };
  {
    const g = Math.pow(m, 2) * i;
    return {
      stiffness: g,
      damping: d * 2 * Math.sqrt(i * g),
      duration: e
    };
  }
}
const O_ = ["duration", "bounce"], L_ = ["stiffness", "damping", "mass"];
function _m(e, n) {
  return n.some((o) => e[o] !== void 0);
}
function V_(e) {
  let n = {
    velocity: Ie.velocity,
    stiffness: Ie.stiffness,
    damping: Ie.damping,
    mass: Ie.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!_m(e, L_) && _m(e, O_))
    if (n.velocity = 0, e.visualDuration) {
      const o = e.visualDuration, i = 2 * Math.PI / (o * 1.2), a = i * i, c = 2 * en(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(a);
      n = {
        ...n,
        mass: Ie.mass,
        stiffness: a,
        damping: c
      };
    } else {
      const o = j_({ ...e, velocity: 0 });
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
  const c = o.keyframes[0], d = o.keyframes[o.keyframes.length - 1], p = { done: !1, value: c }, { stiffness: m, damping: g, mass: v, duration: l, velocity: f, isResolvedFromDuration: S } = V_({
    ...o,
    velocity: -/* @__PURE__ */ bt(o.velocity || 0)
  }), w = f || 0, T = g / (2 * Math.sqrt(m * v)), _ = d - c, A = /* @__PURE__ */ bt(Math.sqrt(m / v)), E = Math.abs(_) < 5;
  i || (i = E ? Ie.restSpeed.granular : Ie.restSpeed.default), a || (a = E ? Ie.restDelta.granular : Ie.restDelta.default);
  let M, N, O, W, K, G;
  if (T < 1)
    O = hc(A, T), W = (w + T * A * _) / O, M = (Q) => {
      const ae = Math.exp(-T * A * Q);
      return d - ae * (W * Math.sin(O * Q) + _ * Math.cos(O * Q));
    }, K = T * A * W + _ * O, G = T * A * _ - W * O, N = (Q) => Math.exp(-T * A * Q) * (K * Math.sin(O * Q) + G * Math.cos(O * Q));
  else if (T === 1) {
    M = (ae) => d - Math.exp(-A * ae) * (_ + (w + A * _) * ae);
    const Q = w + A * _;
    N = (ae) => Math.exp(-A * ae) * (A * Q * ae - w);
  } else {
    const Q = A * Math.sqrt(T * T - 1);
    M = (ue) => {
      const _e = Math.exp(-T * A * ue), ve = Math.min(Q * ue, 300);
      return d - _e * ((w + T * A * _) * Math.sinh(ve) + Q * _ * Math.cosh(ve)) / Q;
    };
    const ae = (w + T * A * _) / Q, J = T * A * ae - _ * Q, de = T * A * _ - ae * Q;
    N = (ue) => {
      const _e = Math.exp(-T * A * ue), ve = Math.min(Q * ue, 300);
      return _e * (J * Math.sinh(ve) + de * Math.cosh(ve));
    };
  }
  const L = {
    calculatedDuration: S && l || null,
    velocity: (Q) => /* @__PURE__ */ ht(N(Q)),
    next: (Q) => {
      if (!S && T < 1) {
        const J = Math.exp(-T * A * Q), de = Math.sin(O * Q), ue = Math.cos(O * Q), _e = d - J * (W * de + _ * ue), ve = /* @__PURE__ */ ht(J * (K * de + G * ue));
        return p.done = Math.abs(ve) <= i && Math.abs(d - _e) <= a, p.value = p.done ? d : _e, p;
      }
      const ae = M(Q);
      if (S)
        p.done = Q >= l;
      else {
        const J = /* @__PURE__ */ ht(N(Q));
        p.done = Math.abs(J) <= i && Math.abs(d - ae) <= a;
      }
      return p.value = p.done ? d : ae, p;
    },
    toString: () => {
      const Q = Math.min(vd(L), ya), ae = Vg((J) => L.next(Q * J).value, Q, 30);
      return Q + "ms " + ae;
    },
    toTransition: () => {
    }
  };
  return L;
}
ga.applyToOptions = (e) => {
  const n = N_(e, 100, ga);
  return e.ease = n.ease, e.duration = /* @__PURE__ */ ht(n.duration), e.type = "keyframes", e;
};
const B_ = 5;
function Bg(e, n, o) {
  const i = Math.max(n - B_, 0);
  return /* @__PURE__ */ Sg(o - e(i), n - i);
}
function mc({ keyframes: e, velocity: n = 0, power: o = 0.8, timeConstant: i = 325, bounceDamping: a = 10, bounceStiffness: c = 500, modifyTarget: d, min: p, max: m, restDelta: g = 0.5, restSpeed: v }) {
  const l = e[0], f = {
    done: !1,
    value: l
  }, S = (G) => p !== void 0 && G < p || m !== void 0 && G > m, w = (G) => p === void 0 ? m : m === void 0 || Math.abs(p - G) < Math.abs(m - G) ? p : m;
  let T = o * n;
  const _ = l + T, A = d === void 0 ? _ : d(_);
  A !== _ && (T = A - l);
  const E = (G) => -T * Math.exp(-G / i), M = (G) => A + E(G), N = (G) => {
    const L = E(G), Q = M(G);
    f.done = Math.abs(L) <= g, f.value = f.done ? A : Q;
  };
  let O, W;
  const K = (G) => {
    S(f.value) && (O = G, W = ga({
      keyframes: [f.value, w(f.value)],
      velocity: Bg(M, G, f.value),
      // TODO: This should be passing * 1000
      damping: a,
      stiffness: c,
      restDelta: g,
      restSpeed: v
    }));
  };
  return K(0), {
    calculatedDuration: null,
    next: (G) => {
      let L = !1;
      return !W && O === void 0 && (L = !0, N(G), K(G)), O !== void 0 && G >= O ? W.next(G - O) : (!L && N(G), f);
    }
  };
}
function z_(e, n, o) {
  const i = [], a = o || Wn.mix || Lg, c = e.length - 1;
  for (let d = 0; d < c; d++) {
    let p = a(e[d], e[d + 1]);
    if (n) {
      const m = Array.isArray(n) ? n[d] || Mt : n;
      p = _i(m, p);
    }
    i.push(p);
  }
  return i;
}
function U_(e, n, { clamp: o = !0, ease: i, mixer: a } = {}) {
  const c = e.length;
  if (Sr(c === n.length, "Both input and output ranges must be the same length", "range-length"), c === 1)
    return () => n[0];
  if (c === 2 && n[0] === n[1])
    return () => n[1];
  const d = e[0] === e[1];
  e[0] > e[c - 1] && (e = [...e].reverse(), n = [...n].reverse());
  const p = z_(n, i, a), m = p.length, g = (v) => {
    if (d && v < e[0])
      return n[0];
    let l = 0;
    if (m > 1)
      for (; l < e.length - 2 && !(v < e[l + 1]); l++)
        ;
    const f = /* @__PURE__ */ pi(e[l], e[l + 1], v);
    return p[l](f);
  };
  return o ? (v) => g(en(e[0], e[c - 1], v)) : g;
}
function $_(e, n) {
  const o = e[e.length - 1];
  for (let i = 1; i <= n; i++) {
    const a = /* @__PURE__ */ pi(0, n, i);
    e.push(Te(o, 1, a));
  }
}
function H_(e) {
  const n = [0];
  return $_(n, e.length - 1), n;
}
function W_(e, n) {
  return e.map((o) => o * n);
}
function G_(e, n) {
  return e.map(() => n || Eg).splice(0, e.length - 1);
}
function ui({ duration: e = 300, keyframes: n, times: o, ease: i = "easeInOut" }) {
  const a = /* @__PURE__ */ t_(i) ? i.map(ym) : ym(i), c = {
    done: !1,
    value: n[0]
  }, d = W_(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    o && o.length === n.length ? o : H_(n),
    e
  ), p = U_(d, n, {
    ease: Array.isArray(a) ? a : G_(n, a)
  });
  return {
    calculatedDuration: e,
    next: (m) => (c.value = p(m), c.done = m >= e, c)
  };
}
const K_ = (e) => e !== null;
function Ma(e, { repeat: n, repeatType: o = "loop" }, i, a = 1) {
  const c = e.filter(K_), p = a < 0 || n && o !== "loop" && n % 2 === 1 ? 0 : c.length - 1;
  return !p || i === void 0 ? c[p] : i;
}
const Y_ = {
  decay: mc,
  inertia: mc,
  tween: ui,
  keyframes: ui,
  spring: ga
};
function zg(e) {
  typeof e.type == "string" && (e.type = Y_[e.type]);
}
class Sd {
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
const Q_ = (e) => e / 100;
class va extends Sd {
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
    zg(n);
    const { type: o = ui, repeat: i = 0, repeatDelay: a = 0, repeatType: c, velocity: d = 0 } = n;
    let { keyframes: p } = n;
    const m = o || ui;
    m !== ui && typeof p[0] != "number" && (this.mixKeyframes = _i(Q_, Lg(p[0], p[1])), p = [0, 100]);
    const g = m({ ...n, keyframes: p });
    c === "mirror" && (this.mirroredGenerator = m({
      ...n,
      keyframes: [...p].reverse(),
      velocity: -d
    })), g.calculatedDuration === null && (g.calculatedDuration = vd(g));
    const { calculatedDuration: v } = g;
    this.calculatedDuration = v, this.resolvedDuration = v + a, this.totalDuration = this.resolvedDuration * (i + 1) - a, this.generator = g;
  }
  updateTime(n) {
    const o = Math.round(n - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = o;
  }
  tick(n, o = !1) {
    const { generator: i, totalDuration: a, mixKeyframes: c, mirroredGenerator: d, resolvedDuration: p, calculatedDuration: m } = this;
    if (this.startTime === null)
      return i.next(0);
    const { delay: g = 0, keyframes: v, repeat: l, repeatType: f, repeatDelay: S, type: w, onUpdate: T, finalKeyframe: _ } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, n) : this.speed < 0 && (this.startTime = Math.min(n - a / this.speed, this.startTime)), o ? this.currentTime = n : this.updateTime(n);
    const A = this.currentTime - g * (this.playbackSpeed >= 0 ? 1 : -1), E = this.playbackSpeed >= 0 ? A < 0 : A > a;
    this.currentTime = Math.max(A, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = a);
    let M = this.currentTime, N = i;
    if (l) {
      const G = Math.min(this.currentTime, a) / p;
      let L = Math.floor(G), Q = G % 1;
      !Q && G >= 1 && (Q = 1), Q === 1 && L--, L = Math.min(L, l + 1), !!(L % 2) && (f === "reverse" ? (Q = 1 - Q, S && (Q -= S / p)) : f === "mirror" && (N = d)), M = en(0, 1, Q) * p;
    }
    let O;
    E ? (this.delayState.value = v[0], O = this.delayState) : O = N.next(M), c && !E && (O.value = c(O.value));
    let { done: W } = O;
    !E && m !== null && (W = this.playbackSpeed >= 0 ? this.currentTime >= a : this.currentTime <= 0);
    const K = this.holdTime === null && (this.state === "finished" || this.state === "running" && W);
    return K && w !== mc && (O.value = Ma(v, this.options, _, this.speed)), T && T(O.value), K && this.finish(), O;
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
    n = /* @__PURE__ */ ht(n), this.currentTime = n, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = n : this.driver && (this.startTime = this.driver.now() - n / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = n, this.tick(n));
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
    return Bg((i) => this.generator.next(i).value, n, o);
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
    const { driver: n = D_, startTime: o } = this.options;
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
function X_(e) {
  for (let n = 1; n < e.length; n++)
    e[n] ?? (e[n] = e[n - 1]);
}
const fr = (e) => e * 180 / Math.PI, yc = (e) => {
  const n = fr(Math.atan2(e[1], e[0]));
  return gc(n);
}, Z_ = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: yc,
  rotateZ: yc,
  skewX: (e) => fr(Math.atan(e[1])),
  skewY: (e) => fr(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, gc = (e) => (e = e % 360, e < 0 && (e += 360), e), Tm = yc, km = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), Am = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), J_ = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: km,
  scaleY: Am,
  scale: (e) => (km(e) + Am(e)) / 2,
  rotateX: (e) => gc(fr(Math.atan2(e[6], e[5]))),
  rotateY: (e) => gc(fr(Math.atan2(-e[2], e[0]))),
  rotateZ: Tm,
  rotate: Tm,
  skewX: (e) => fr(Math.atan(e[4])),
  skewY: (e) => fr(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function vc(e) {
  return e.includes("scale") ? 1 : 0;
}
function Sc(e, n) {
  if (!e || e === "none")
    return vc(n);
  const o = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let i, a;
  if (o)
    i = J_, a = o;
  else {
    const p = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    i = Z_, a = p;
  }
  if (!a)
    return vc(n);
  const c = i[n], d = a[1].split(",").map(e1);
  return typeof c == "function" ? c(d) : d[c];
}
const q_ = (e, n) => {
  const { transform: o = "none" } = getComputedStyle(e);
  return Sc(o, n);
};
function e1(e) {
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
], ho = /* @__PURE__ */ new Set([...po, "pathRotation"]), Cm = (e) => e === fo || e === te, t1 = /* @__PURE__ */ new Set(["x", "y", "z"]), n1 = po.filter((e) => !t1.has(e));
function r1(e) {
  const n = [];
  return n1.forEach((o) => {
    const i = e.getValue(o);
    i !== void 0 && (n.push([o, i.get()]), i.set(o.startsWith("scale") ? 1 : 0));
  }), n;
}
const Un = {
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
  x: (e, { transform: n }) => Sc(n, "x"),
  y: (e, { transform: n }) => Sc(n, "y")
};
Un.translateX = Un.x;
Un.translateY = Un.y;
const pr = /* @__PURE__ */ new Set();
let wc = !1, xc = !1, _c = !1;
function Ug() {
  if (xc) {
    const e = Array.from(pr).filter((i) => i.needsMeasurement), n = new Set(e.map((i) => i.element)), o = /* @__PURE__ */ new Map();
    n.forEach((i) => {
      const a = r1(i);
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
  xc = !1, wc = !1, pr.forEach((e) => e.complete(_c)), pr.clear();
}
function $g() {
  pr.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (xc = !0);
  });
}
function o1() {
  _c = !0, $g(), Ug(), _c = !1;
}
class wd {
  constructor(n, o, i, a, c, d = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...n], this.onComplete = o, this.name = i, this.motionValue = a, this.element = c, this.isAsync = d;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (pr.add(this), wc || (wc = !0, ke.read($g), ke.resolveKeyframes(Ug))) : (this.readKeyframes(), this.complete());
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
    X_(n);
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
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, n), pr.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (pr.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const i1 = (e) => e.startsWith("--");
function Hg(e, n, o) {
  i1(n) ? e.style.setProperty(n, o) : e.style[n] = o;
}
const s1 = {};
function Wg(e, n) {
  const o = /* @__PURE__ */ vg(e);
  return () => s1[n] ?? o();
}
const a1 = /* @__PURE__ */ Wg(() => window.ScrollTimeline !== void 0, "scrollTimeline"), Gg = /* @__PURE__ */ Wg(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), si = ([e, n, o, i]) => `cubic-bezier(${e}, ${n}, ${o}, ${i})`, Pm = {
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
function Kg(e, n) {
  if (e)
    return typeof e == "function" ? Gg() ? Vg(e, n) : "ease-out" : /* @__PURE__ */ bg(e) ? si(e) : Array.isArray(e) ? e.map((o) => Kg(o, n) || Pm.easeOut) : Pm[e];
}
function l1(e, n, o, { delay: i = 0, duration: a = 300, repeat: c = 0, repeatType: d = "loop", ease: p = "easeOut", times: m } = {}, g = void 0) {
  const v = {
    [n]: o
  };
  m && (v.offset = m);
  const l = Kg(p, a);
  Array.isArray(l) && (v.easing = l);
  const f = {
    delay: i,
    duration: a,
    easing: Array.isArray(l) ? "linear" : l,
    fill: "both",
    iterations: c + 1,
    direction: d === "reverse" ? "alternate" : "normal"
  };
  return g && (f.pseudoElement = g), e.animate(v, f);
}
function Yg(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function u1({ type: e, ...n }) {
  return Yg(e) && Gg() ? e.applyToOptions(n) : (n.duration ?? (n.duration = 300), n.ease ?? (n.ease = "easeOut"), n);
}
class Qg extends Sd {
  constructor(n) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !n)
      return;
    const { element: o, name: i, keyframes: a, pseudoElement: c, allowFlatten: d = !1, finalKeyframe: p, onComplete: m } = n;
    this.isPseudoElement = !!c, this.allowFlatten = d, this.options = n, Sr(typeof n.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const g = u1(n);
    this.animation = l1(o, i, a, g, c), g.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !c) {
        const v = Ma(a, this.options, p, this.speed);
        this.updateMotionValue && this.updateMotionValue(v), Hg(o, i, v), this.animation.cancel();
      }
      m == null || m(), this.notifyFinished();
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
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ ht(n), o && this.animation.pause();
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
    return this.allowFlatten && ((c = this.animation.effect) == null || c.updateTiming({ easing: "linear" })), this.animation.onfinish = null, n && a1() ? (this.animation.timeline = n, o && (this.animation.rangeStart = o), i && (this.animation.rangeEnd = i), Mt) : a(this);
  }
}
const Xg = {
  anticipate: Ag,
  backInOut: kg,
  circInOut: Pg
};
function c1(e) {
  return e in Xg;
}
function d1(e) {
  typeof e.ease == "string" && c1(e.ease) && (e.ease = Xg[e.ease]);
}
const Hu = 10;
class f1 extends Qg {
  constructor(n) {
    d1(n), zg(n), super(n), n.startTime !== void 0 && n.autoplay !== !1 && (this.startTime = n.startTime), this.options = n;
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
    }), m = Math.max(Hu, it.now() - this.startTime), g = en(0, Hu, m - Hu), v = p.sample(m).value, { name: l } = this.options;
    c && l && Hg(c, l, v), o.setWithVelocity(p.sample(Math.max(0, m - g)).value, v, g), p.stop();
  }
}
const Em = (e, n) => n === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(Bt.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function p1(e) {
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
  const c = e[e.length - 1], d = Em(a, n), p = Em(c, n);
  return xi(d === p, `You are trying to animate ${n} from "${a}" to "${c}". "${d ? c : a}" is not an animatable value.`, "value-not-animatable"), !d || !p ? !1 : p1(e) || (o === "spring" || Yg(o)) && i;
}
function Tc(e) {
  e.duration = 0, e.type = "keyframes";
}
const Zg = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), m1 = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function y1(e) {
  for (let n = 0; n < e.length; n++)
    if (typeof e[n] == "string" && m1.test(e[n]))
      return !0;
  return !1;
}
const g1 = /* @__PURE__ */ new Set([
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
]), v1 = /* @__PURE__ */ vg(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function S1(e) {
  var l;
  const { motionValue: n, name: o, repeatDelay: i, repeatType: a, damping: c, type: d, keyframes: p } = e;
  if (!(((l = n == null ? void 0 : n.owner) == null ? void 0 : l.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: g, transformTemplate: v } = n.owner.getProps();
  return v1() && o && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (Zg.has(o) || g1.has(o) && y1(p)) && (o !== "transform" || !v) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !g && !i && a !== "mirror" && c !== 0 && d !== "inertia";
}
const w1 = 40;
class x1 extends Sd {
  constructor({ autoplay: n = !0, delay: o = 0, type: i = "keyframes", repeat: a = 0, repeatDelay: c = 0, repeatType: d = "loop", keyframes: p, name: m, motionValue: g, element: v, ...l }) {
    var w;
    super(), this.stop = () => {
      var T, _;
      this._animation && (this._animation.stop(), (T = this.stopTimeline) == null || T.call(this)), (_ = this.keyframeResolver) == null || _.cancel();
    }, this.createdAt = it.now();
    const f = {
      autoplay: n,
      delay: o,
      type: i,
      repeat: a,
      repeatDelay: c,
      repeatType: d,
      name: m,
      motionValue: g,
      element: v,
      ...l
    }, S = (v == null ? void 0 : v.KeyframeResolver) || wd;
    this.keyframeResolver = new S(p, (T, _, A) => this.onKeyframesResolved(T, _, f, !A), m, g, v), (w = this.keyframeResolver) == null || w.scheduleResolve();
  }
  onKeyframesResolved(n, o, i, a) {
    var A, E;
    this.keyframeResolver = void 0;
    const { name: c, type: d, velocity: p, delay: m, isHandoff: g, onUpdate: v } = i;
    this.resolvedAt = it.now();
    let l = !0;
    h1(n, c, d, p) || (l = !1, (Wn.instantAnimations || !m) && (v == null || v(Ma(n, i, o))), n[0] = n[n.length - 1], Tc(i), i.repeat = 0);
    const S = {
      startTime: a ? this.resolvedAt ? this.resolvedAt - this.createdAt > w1 ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: o,
      ...i,
      keyframes: n
    }, w = l && !g && S1(S), T = (E = (A = S.motionValue) == null ? void 0 : A.owner) == null ? void 0 : E.current;
    let _;
    if (w)
      try {
        _ = new f1({
          ...S,
          element: T
        });
      } catch {
        _ = new va(S);
      }
    else
      _ = new va(S);
    _.finished.then(() => {
      this.notifyFinished();
    }).catch(Mt), this.pendingTimeline && (this.stopTimeline = _.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = _;
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
    return this._animation || ((n = this.keyframeResolver) == null || n.resume(), o1()), this._animation;
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
function Jg(e, n, o, i = 0, a = 1) {
  const c = Array.from(e).sort((g, v) => g.sortNodePosition(v)).indexOf(n), d = e.size, p = (d - 1) * i;
  return typeof o == "function" ? o(c, d) : a === 1 ? c * i : p - c * i;
}
const bm = 30, _1 = (e) => !isNaN(parseFloat(e));
class T1 {
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
    this.current = n, this.updatedAt = it.now(), this.canTrackVelocity === null && n !== void 0 && (this.canTrackVelocity = _1(this.current));
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
    this.events[n] || (this.events[n] = new dd());
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
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || n - this.updatedAt > bm)
      return 0;
    const o = Math.min(this.updatedAt - this.prevUpdatedAt, bm);
    return /* @__PURE__ */ Sg(parseFloat(this.current) - parseFloat(this.prevFrameValue), o);
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
  return new T1(e, n);
}
function qg(e, n) {
  if (e != null && e.inherit && n) {
    const { inherit: o, ...i } = e;
    return { ...n, ...i };
  }
  return e;
}
function xd(e, n) {
  const o = (e == null ? void 0 : e[n]) ?? (e == null ? void 0 : e.default) ?? e;
  return o !== e ? qg(o, e) : o;
}
const k1 = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, A1 = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), C1 = {
  type: "keyframes",
  duration: 0.8
}, P1 = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, E1 = (e, { keyframes: n }) => n.length > 2 ? C1 : ho.has(e) ? e.startsWith("scale") ? A1(n[1]) : k1 : P1, b1 = /* @__PURE__ */ new Set([
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
function M1(e) {
  for (const n in e)
    if (!b1.has(n))
      return !0;
  return !1;
}
const _d = (e, n, o, i = {}, a, c) => (d) => {
  const p = xd(i, e) || {}, m = p.delay || i.delay || 0;
  let { elapsed: g = 0 } = i;
  g = g - /* @__PURE__ */ ht(m);
  const v = {
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
  M1(p) || Object.assign(v, E1(e, v)), v.duration && (v.duration = /* @__PURE__ */ ht(v.duration)), v.repeatDelay && (v.repeatDelay = /* @__PURE__ */ ht(v.repeatDelay)), v.from !== void 0 && (v.keyframes[0] = v.from);
  let l = !1;
  if ((v.type === !1 || v.duration === 0 && !v.repeatDelay) && (Tc(v), v.delay === 0 && (l = !0)), (Wn.instantAnimations || Wn.skipAnimations || a != null && a.shouldSkipAnimations || p.skipAnimations) && (l = !0, Tc(v), v.delay = 0), v.allowFlatten = !p.type && !p.ease, l && !c && n.get() !== void 0) {
    const f = Ma(v.keyframes, p);
    if (f !== void 0) {
      ke.update(() => {
        v.onUpdate(f), v.onComplete();
      });
      return;
    }
  }
  return p.isSync ? new va(v) : new x1(v);
}, R1 = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function D1(e) {
  const n = R1.exec(e);
  if (!n)
    return [,];
  const [, o, i, a] = n;
  return [`--${o ?? i}`, a];
}
const N1 = 4;
function ev(e, n, o = 1) {
  Sr(o <= N1, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [i, a] = D1(e);
  if (!i)
    return;
  const c = window.getComputedStyle(n).getPropertyValue(i);
  if (c) {
    const d = c.trim();
    return mg(d) ? parseFloat(d) : d;
  }
  return hd(a) ? ev(a, n, o + 1) : a;
}
function Mm(e) {
  const n = [{}, {}];
  return e == null || e.values.forEach((o, i) => {
    n[0][i] = o.get(), n[1][i] = o.getVelocity();
  }), n;
}
function Td(e, n, o, i) {
  if (typeof n == "function") {
    const [a, c] = Mm(i);
    n = n(o !== void 0 ? o : e.custom, a, c);
  }
  if (typeof n == "string" && (n = e.variants && e.variants[n]), typeof n == "function") {
    const [a, c] = Mm(i);
    n = n(o !== void 0 ? o : e.custom, a, c);
  }
  return n;
}
function hr(e, n, o) {
  const i = e.getProps();
  return Td(i, n, o !== void 0 ? o : i.custom, e);
}
const tv = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...po
]), kc = (e) => Array.isArray(e);
function I1(e, n, o) {
  e.hasValue(n) ? e.getValue(n).set(o) : e.addValue(n, uo(o));
}
function F1(e) {
  return kc(e) ? e[e.length - 1] || 0 : e;
}
function j1(e, n) {
  const o = hr(e, n);
  let { transitionEnd: i = {}, transition: a = {}, ...c } = o || {};
  c = { ...c, ...i };
  for (const d in c) {
    const p = F1(c[d]);
    I1(e, d, p);
  }
}
const Ze = (e) => !!(e && e.getVelocity);
function O1(e) {
  return !!(Ze(e) && e.add);
}
function Ac(e, n) {
  const o = e.getValue("willChange");
  if (O1(o))
    return o.add(n);
  if (!o && Wn.WillChange) {
    const i = new Wn.WillChange("auto");
    e.addValue("willChange", i), i.add(n);
  }
}
function kd(e) {
  return e.replace(/([A-Z])/g, (n) => `-${n.toLowerCase()}`);
}
const L1 = "framerAppearId", nv = "data-" + kd(L1);
function rv(e) {
  return e.props[nv];
}
function V1({ protectedKeys: e, needsAnimating: n }, o) {
  const i = e.hasOwnProperty(o) && n[o] !== !0;
  return n[o] = !1, i;
}
function ov(e, n, { delay: o = 0, transitionOverride: i, type: a } = {}) {
  let { transition: c, transitionEnd: d, ...p } = n;
  const m = e.getDefaultTransition();
  c = c ? qg(c, m) : m;
  const g = c == null ? void 0 : c.reduceMotion, v = c == null ? void 0 : c.skipAnimations;
  i && (c = i);
  const l = [], f = a && e.animationState && e.animationState.getState()[a], S = c == null ? void 0 : c.path;
  S && S.animateVisualElement(e, p, c, o, l);
  for (const w in p) {
    const T = e.getValue(w, e.latestValues[w] ?? null), _ = p[w];
    if (_ === void 0 || f && V1(f, w))
      continue;
    const A = {
      delay: o,
      ...xd(c || {}, w)
    };
    v && (A.skipAnimations = !0);
    const E = T.get();
    if (E !== void 0 && !T.isAnimating() && !Array.isArray(_) && _ === E && !A.velocity) {
      ke.update(() => T.set(_));
      continue;
    }
    let M = !1;
    if (window.MotionHandoffAnimation) {
      const W = rv(e);
      if (W) {
        const K = window.MotionHandoffAnimation(W, w, ke);
        K !== null && (A.startTime = K, M = !0);
      }
    }
    Ac(e, w);
    const N = g ?? e.shouldReduceMotion;
    T.start(_d(w, T, _, N && tv.has(w) ? { type: !1 } : A, e, M));
    const O = T.animation;
    O && l.push(O);
  }
  if (d) {
    const w = () => ke.update(() => {
      d && j1(e, d);
    });
    l.length ? Promise.all(l).then(w) : w();
  }
  return l;
}
function Cc(e, n, o = {}) {
  var m;
  const i = hr(e, n, o.type === "exit" ? (m = e.presenceContext) == null ? void 0 : m.custom : void 0);
  let { transition: a = e.getDefaultTransition() || {} } = i || {};
  o.transitionOverride && (a = o.transitionOverride);
  const c = i ? () => Promise.all(ov(e, i, o)) : () => Promise.resolve(), d = e.variantChildren && e.variantChildren.size ? (g = 0) => {
    const { delayChildren: v = 0, staggerChildren: l, staggerDirection: f } = a;
    return B1(e, n, g, v, l, f, o);
  } : () => Promise.resolve(), { when: p } = a;
  if (p) {
    const [g, v] = p === "beforeChildren" ? [c, d] : [d, c];
    return g().then(() => v());
  } else
    return Promise.all([c(), d(o.delay)]);
}
function B1(e, n, o = 0, i = 0, a = 0, c = 1, d) {
  const p = [];
  for (const m of e.variantChildren)
    m.notify("AnimationStart", n), p.push(Cc(m, n, {
      ...d,
      delay: o + (typeof i == "function" ? 0 : i) + Jg(e.variantChildren, m, i, a, c)
    }).then(() => m.notify("AnimationComplete", n)));
  return Promise.all(p);
}
function z1(e, n, o = {}) {
  e.notify("AnimationStart", n);
  let i;
  if (Array.isArray(n)) {
    const a = n.map((c) => Cc(e, c, o));
    i = Promise.all(a);
  } else if (typeof n == "string")
    i = Cc(e, n, o);
  else {
    const a = typeof n == "function" ? hr(e, n, o.custom) : n;
    i = Promise.all(ov(e, a, o));
  }
  return i.then(() => {
    e.notify("AnimationComplete", n);
  });
}
const U1 = {
  test: (e) => e === "auto",
  parse: (e) => e
}, iv = (e) => (n) => n.test(e), sv = [fo, te, qt, dn, p_, f_, U1], Rm = (e) => sv.find(iv(e));
function $1(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || gg(e) : !0;
}
const H1 = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function W1(e) {
  const [n, o] = e.slice(0, -1).split("(");
  if (n === "drop-shadow")
    return e;
  const [i] = o.match(md) || [];
  if (!i)
    return e;
  const a = o.replace(i, "");
  let c = H1.has(n) ? 1 : 0;
  return i !== o && (c *= 100), n + "(" + c + a + ")";
}
const G1 = /\b([a-z-]*)\(.*?\)/gu, Pc = {
  ...Bt,
  getAnimatableNone: (e) => {
    const n = e.match(G1);
    return n ? n.map(W1).join(" ") : e;
  }
}, Ec = {
  ...Bt,
  getAnimatableNone: (e) => {
    const n = Bt.parse(e);
    return Bt.createTransformer(e)(n.map((i) => typeof i == "number" ? 0 : typeof i == "object" ? { ...i, alpha: 1 } : i));
  }
}, Dm = {
  ...fo,
  transform: Math.round
}, K1 = {
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
  scale: Us,
  scaleX: Us,
  scaleY: Us,
  scaleZ: Us,
  skew: dn,
  skewX: dn,
  skewY: dn,
  distance: te,
  translateX: te,
  translateY: te,
  translateZ: te,
  x: te,
  y: te,
  z: te,
  perspective: te,
  transformPerspective: te,
  opacity: hi,
  originX: vm,
  originY: vm,
  originZ: te
}, Sa = {
  // Border props
  borderWidth: te,
  borderTopWidth: te,
  borderRightWidth: te,
  borderBottomWidth: te,
  borderLeftWidth: te,
  borderRadius: te,
  borderTopLeftRadius: te,
  borderTopRightRadius: te,
  borderBottomRightRadius: te,
  borderBottomLeftRadius: te,
  // Positioning props
  width: te,
  maxWidth: te,
  height: te,
  maxHeight: te,
  top: te,
  right: te,
  bottom: te,
  left: te,
  inset: te,
  insetBlock: te,
  insetBlockStart: te,
  insetBlockEnd: te,
  insetInline: te,
  insetInlineStart: te,
  insetInlineEnd: te,
  // Spacing props
  padding: te,
  paddingTop: te,
  paddingRight: te,
  paddingBottom: te,
  paddingLeft: te,
  paddingBlock: te,
  paddingBlockStart: te,
  paddingBlockEnd: te,
  paddingInline: te,
  paddingInlineStart: te,
  paddingInlineEnd: te,
  margin: te,
  marginTop: te,
  marginRight: te,
  marginBottom: te,
  marginLeft: te,
  marginBlock: te,
  marginBlockStart: te,
  marginBlockEnd: te,
  marginInline: te,
  marginInlineStart: te,
  marginInlineEnd: te,
  // Typography
  fontSize: te,
  // Misc
  backgroundPositionX: te,
  backgroundPositionY: te,
  ...K1,
  zIndex: Dm,
  // SVG
  fillOpacity: hi,
  strokeOpacity: hi,
  numOctaves: Dm
}, Y1 = {
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
  filter: Pc,
  WebkitFilter: Pc,
  mask: Ec,
  WebkitMask: Ec
}, av = (e) => Y1[e], Q1 = /* @__PURE__ */ new Set([Pc, Ec]);
function lv(e, n) {
  let o = av(e);
  return Q1.has(o) || (o = Bt), o.getAnimatableNone ? o.getAnimatableNone(n) : void 0;
}
const X1 = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function Z1(e, n, o) {
  let i = 0, a;
  for (; i < e.length && !a; ) {
    const c = e[i];
    typeof c == "string" && !X1.has(c) && lo(c).values.length && (a = e[i]), i++;
  }
  if (a && o)
    for (const c of n)
      e[c] = lv(o, a);
}
class J1 extends wd {
  constructor(n, o, i, a, c) {
    super(n, o, i, a, c, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: n, element: o, name: i } = this;
    if (!o || !o.current)
      return;
    super.readKeyframes();
    for (let v = 0; v < n.length; v++) {
      let l = n[v];
      if (typeof l == "string" && (l = l.trim(), hd(l))) {
        const f = ev(l, o.current);
        f !== void 0 && (n[v] = f), v === n.length - 1 && (this.finalKeyframe = l);
      }
    }
    if (this.resolveNoneKeyframes(), !tv.has(i) || n.length !== 2)
      return;
    const [a, c] = n, d = Rm(a), p = Rm(c), m = gm(a), g = gm(c);
    if (m !== g && Un[i]) {
      this.needsMeasurement = !0;
      return;
    }
    if (d !== p)
      if (Cm(d) && Cm(p))
        for (let v = 0; v < n.length; v++) {
          const l = n[v];
          typeof l == "string" && (n[v] = parseFloat(l));
        }
      else Un[i] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: n, name: o } = this, i = [];
    for (let a = 0; a < n.length; a++)
      (n[a] === null || $1(n[a])) && i.push(a);
    i.length && Z1(n, i, o);
  }
  measureInitialState() {
    const { element: n, unresolvedKeyframes: o, name: i } = this;
    if (!n || !n.current)
      return;
    i === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = Un[i](n.measureViewportBox(), window.getComputedStyle(n.current)), o[0] = this.measuredOrigin;
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
    i[c] = Un[o](n.measureViewportBox(), window.getComputedStyle(n.current)), d !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = d), (p = this.removedTransforms) != null && p.length && this.removedTransforms.forEach(([m, g]) => {
      n.getValue(m).set(g);
    }), this.resolveNoneKeyframes();
  }
}
function uv(e, n, o) {
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
const bc = (e, n) => n && typeof e == "number" ? n.transform(e) : e;
function ra(e) {
  return yg(e) && "offsetHeight" in e && !("ownerSVGElement" in e);
}
const { schedule: Ad } = /* @__PURE__ */ Mg(queueMicrotask, !1), Vt = {
  x: !1,
  y: !1
};
function cv() {
  return Vt.x || Vt.y;
}
function q1(e) {
  return e === "x" || e === "y" ? Vt[e] ? null : (Vt[e] = !0, () => {
    Vt[e] = !1;
  }) : Vt.x || Vt.y ? null : (Vt.x = Vt.y = !0, () => {
    Vt.x = Vt.y = !1;
  });
}
function dv(e, n) {
  const o = uv(e), i = new AbortController(), a = {
    passive: !0,
    ...n,
    signal: i.signal
  };
  return [o, a, () => i.abort()];
}
function eT(e) {
  return !(e.pointerType === "touch" || cv());
}
function tT(e, n, o = {}) {
  const [i, a, c] = dv(e, o);
  return i.forEach((d) => {
    let p = !1, m = !1, g;
    const v = () => {
      d.removeEventListener("pointerleave", w);
    }, l = (_) => {
      g && (g(_), g = void 0), v();
    }, f = (_) => {
      p = !1, window.removeEventListener("pointerup", f), window.removeEventListener("pointercancel", f), m && (m = !1, l(_));
    }, S = () => {
      p = !0, window.addEventListener("pointerup", f, a), window.addEventListener("pointercancel", f, a);
    }, w = (_) => {
      if (_.pointerType !== "touch") {
        if (p) {
          m = !0;
          return;
        }
        l(_);
      }
    }, T = (_) => {
      if (!eT(_))
        return;
      m = !1;
      const A = n(d, _);
      typeof A == "function" && (g = A, d.addEventListener("pointerleave", w, a));
    };
    d.addEventListener("pointerenter", T, a), d.addEventListener("pointerdown", S, a);
  }), c;
}
const fv = (e, n) => n ? e === n ? !0 : fv(e, n.parentElement) : !1, Cd = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, nT = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function rT(e) {
  return nT.has(e.tagName) || e.isContentEditable === !0;
}
const oT = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function iT(e) {
  return oT.has(e.tagName) || e.isContentEditable === !0;
}
const oa = /* @__PURE__ */ new WeakSet();
function Nm(e) {
  return (n) => {
    n.key === "Enter" && e(n);
  };
}
function Wu(e, n) {
  e.dispatchEvent(new PointerEvent("pointer" + n, { isPrimary: !0, bubbles: !0 }));
}
const sT = (e, n) => {
  const o = e.currentTarget;
  if (!o)
    return;
  const i = Nm(() => {
    if (oa.has(o))
      return;
    Wu(o, "down");
    const a = Nm(() => {
      Wu(o, "up");
    }), c = () => Wu(o, "cancel");
    o.addEventListener("keyup", a, n), o.addEventListener("blur", c, n);
  });
  o.addEventListener("keydown", i, n), o.addEventListener("blur", () => o.removeEventListener("keydown", i), n);
};
function Im(e) {
  return Cd(e) && !cv();
}
const Fm = /* @__PURE__ */ new WeakSet();
function aT(e, n, o = {}) {
  const [i, a, c] = dv(e, o), d = (p) => {
    const m = p.currentTarget;
    if (!Im(p) || Fm.has(p))
      return;
    oa.add(m), o.stopPropagation && Fm.add(p);
    const g = n(m, p), v = (S, w) => {
      window.removeEventListener("pointerup", l), window.removeEventListener("pointercancel", f), oa.has(m) && oa.delete(m), Im(S) && typeof g == "function" && g(S, { success: w });
    }, l = (S) => {
      v(S, m === window || m === document || o.useGlobalTarget || fv(m, S.target));
    }, f = (S) => {
      v(S, !1);
    };
    window.addEventListener("pointerup", l, a), window.addEventListener("pointercancel", f, a);
  };
  return i.forEach((p) => {
    (o.useGlobalTarget ? window : p).addEventListener("pointerdown", d, a), ra(p) && (p.addEventListener("focus", (g) => sT(g, a)), !rT(p) && !p.hasAttribute("tabindex") && (p.tabIndex = 0));
  }), c;
}
function Pd(e) {
  return yg(e) && "ownerSVGElement" in e;
}
const ia = /* @__PURE__ */ new WeakMap();
let On;
const pv = (e, n, o) => (i, a) => a && a[0] ? a[0][e + "Size"] : Pd(i) && "getBBox" in i ? i.getBBox()[n] : i[o], lT = /* @__PURE__ */ pv("inline", "width", "offsetWidth"), uT = /* @__PURE__ */ pv("block", "height", "offsetHeight");
function cT({ target: e, borderBoxSize: n }) {
  var o;
  (o = ia.get(e)) == null || o.forEach((i) => {
    i(e, {
      get width() {
        return lT(e, n);
      },
      get height() {
        return uT(e, n);
      }
    });
  });
}
function dT(e) {
  e.forEach(cT);
}
function fT() {
  typeof ResizeObserver > "u" || (On = new ResizeObserver(dT));
}
function pT(e, n) {
  On || fT();
  const o = uv(e);
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
function mT(e) {
  return sa.add(e), ro || hT(), () => {
    sa.delete(e), !sa.size && typeof ro == "function" && (window.removeEventListener("resize", ro), ro = void 0);
  };
}
function jm(e, n) {
  return typeof e == "function" ? mT(e) : pT(e, n);
}
function yT(e) {
  return Pd(e) && e.tagName === "svg";
}
const gT = [...sv, Ve, Bt], vT = (e) => gT.find(iv(e)), Om = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), oo = () => ({
  x: Om(),
  y: Om()
}), Lm = () => ({ min: 0, max: 0 }), Ue = () => ({
  x: Lm(),
  y: Lm()
}), ST = /* @__PURE__ */ new WeakMap();
function Ra(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function mi(e) {
  return typeof e == "string" || Array.isArray(e);
}
const Ed = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], bd = ["initial", ...Ed];
function Da(e) {
  return Ra(e.animate) || bd.some((n) => mi(e[n]));
}
function hv(e) {
  return !!(Da(e) || e.variants);
}
function wT(e, n, o) {
  for (const i in n) {
    const a = n[i], c = o[i];
    if (Ze(a))
      e.addValue(i, a);
    else if (Ze(c))
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
const Mc = { current: null }, mv = { current: !1 }, xT = typeof window < "u";
function _T() {
  if (mv.current = !0, !!xT)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), n = () => Mc.current = e.matches;
      e.addEventListener("change", n), n();
    } else
      Mc.current = !1;
}
const Vm = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let wa = {};
function yv(e) {
  wa = e;
}
function TT() {
  return wa;
}
class kT {
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
  constructor({ parent: n, props: o, presenceContext: i, reducedMotionConfig: a, skipAnimations: c, blockInitialAnimation: d, visualState: p }, m = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = wd, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const S = it.now();
      this.renderScheduledAt < S && (this.renderScheduledAt = S, ke.render(this.render, !1, !0));
    };
    const { latestValues: g, renderState: v } = p;
    this.latestValues = g, this.baseTarget = { ...g }, this.initialValues = o.initial ? { ...g } : {}, this.renderState = v, this.parent = n, this.props = o, this.presenceContext = i, this.depth = n ? n.depth + 1 : 0, this.reducedMotionConfig = a, this.skipAnimationsConfig = c, this.options = m, this.blockInitialAnimation = !!d, this.isControllingVariants = Da(o), this.isVariantNode = hv(o), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(n && n.current);
    const { willChange: l, ...f } = this.scrapeMotionValuesFromProps(o, {}, this);
    for (const S in f) {
      const w = f[S];
      g[S] !== void 0 && Ze(w) && w.set(g[S]);
    }
  }
  mount(n) {
    var o, i;
    if (this.hasBeenMounted)
      for (const a in this.initialValues)
        (o = this.values.get(a)) == null || o.jump(this.initialValues[a]), this.latestValues[a] = this.initialValues[a];
    this.current = n, ST.set(n, this), this.projection && !this.projection.instance && this.projection.mount(n), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((a, c) => this.bindToMotionValue(c, a)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (mv.current || _T(), this.shouldReduceMotion = Mc.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (i = this.parent) == null || i.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
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
    if (this.valueSubscriptions.has(n) && this.valueSubscriptions.get(n)(), o.accelerate && Zg.has(n) && this.current instanceof HTMLElement) {
      const { factory: d, keyframes: p, times: m, ease: g, duration: v } = o.accelerate, l = new Qg({
        element: this.current,
        name: n,
        keyframes: p,
        times: m,
        ease: g,
        duration: /* @__PURE__ */ ht(v)
      }), f = d(l);
      this.valueSubscriptions.set(n, () => {
        f(), l.cancel();
      });
      return;
    }
    const i = ho.has(n);
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
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : Ue();
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
    for (let i = 0; i < Vm.length; i++) {
      const a = Vm[i];
      this.propEventSubscriptions[a] && (this.propEventSubscriptions[a](), delete this.propEventSubscriptions[a]);
      const c = "on" + a, d = n[c];
      d && (this.propEventSubscriptions[a] = this.on(a, d));
    }
    this.prevMotionValues = wT(this, this.scrapeMotionValuesFromProps(n, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
    return i != null && (typeof i == "string" && (mg(i) || gg(i)) ? i = parseFloat(i) : !vT(i) && Bt.test(o) && (i = lv(n, o)), this.setBaseTarget(n, Ze(i) ? i.get() : i)), Ze(i) ? i.get() : i;
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
      const d = Td(this.props, o, (c = this.presenceContext) == null ? void 0 : c.custom);
      d && (i = d[n]);
    }
    if (o && i !== void 0)
      return i;
    const a = this.getBaseTargetFromProps(this.props, n);
    return a !== void 0 && !Ze(a) ? a : this.initialValues[n] !== void 0 && i === void 0 ? void 0 : this.baseTarget[n];
  }
  on(n, o) {
    return this.events[n] || (this.events[n] = new dd()), this.events[n].add(o);
  }
  notify(n, ...o) {
    this.events[n] && this.events[n].notify(...o);
  }
  scheduleRenderMicrotask() {
    Ad.render(this.render);
  }
}
class gv extends kT {
  constructor() {
    super(...arguments), this.KeyframeResolver = J1;
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
    Ze(n) && (this.childSubscription = n.on("change", (o) => {
      this.current && (this.current.textContent = `${o}`);
    }));
  }
}
class Kn {
  constructor(n) {
    this.isMounted = !1, this.node = n;
  }
  update() {
  }
}
function vv({ top: e, left: n, right: o, bottom: i }) {
  return {
    x: { min: n, max: o },
    y: { min: e, max: i }
  };
}
function AT({ x: e, y: n }) {
  return { top: n.min, right: e.max, bottom: n.max, left: e.min };
}
function CT(e, n) {
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
function Gu(e) {
  return e === void 0 || e === 1;
}
function Rc({ scale: e, scaleX: n, scaleY: o }) {
  return !Gu(e) || !Gu(n) || !Gu(o);
}
function lr(e) {
  return Rc(e) || Sv(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function Sv(e) {
  return Bm(e.x) || Bm(e.y);
}
function Bm(e) {
  return e && e !== "0%";
}
function xa(e, n, o) {
  const i = e - o, a = n * i;
  return o + a;
}
function zm(e, n, o, i, a) {
  return a !== void 0 && (e = xa(e, a, i)), xa(e, o, i) + n;
}
function Dc(e, n = 0, o = 1, i, a) {
  e.min = zm(e.min, n, o, i, a), e.max = zm(e.max, n, o, i, a);
}
function wv(e, { x: n, y: o }) {
  Dc(e.x, n.translate, n.scale, n.originPoint), Dc(e.y, o.translate, o.scale, o.originPoint);
}
const Um = 0.999999999999, $m = 1.0000000000001;
function PT(e, n, o, i = !1) {
  var p;
  const a = o.length;
  if (!a)
    return;
  n.x = n.y = 1;
  let c, d;
  for (let m = 0; m < a; m++) {
    c = o[m], d = c.projectionDelta;
    const { visualElement: g } = c.options;
    g && g.props.style && g.props.style.display === "contents" || (i && c.options.layoutScroll && c.scroll && c !== c.root && (Xt(e.x, -c.scroll.offset.x), Xt(e.y, -c.scroll.offset.y)), d && (n.x *= d.x.scale, n.y *= d.y.scale, wv(e, d)), i && lr(c.latestValues) && aa(e, c.latestValues, (p = c.layout) == null ? void 0 : p.layoutBox));
  }
  n.x < $m && n.x > Um && (n.x = 1), n.y < $m && n.y > Um && (n.y = 1);
}
function Xt(e, n) {
  e.min += n, e.max += n;
}
function Hm(e, n, o, i, a = 0.5) {
  const c = Te(e.min, e.max, a);
  Dc(e, n, o, c, i);
}
function Wm(e, n) {
  return typeof e == "string" ? parseFloat(e) / 100 * (n.max - n.min) : e;
}
function aa(e, n, o) {
  const i = o ?? e;
  Hm(e.x, Wm(n.x, i.x), n.scaleX, n.scale, n.originX), Hm(e.y, Wm(n.y, i.y), n.scaleY, n.scale, n.originY);
}
function xv(e, n) {
  return vv(CT(e.getBoundingClientRect(), n));
}
function ET(e, n, o) {
  const i = xv(e, o), { scroll: a } = n;
  return a && (Xt(i.x, a.offset.x), Xt(i.y, a.offset.y)), i;
}
const bT = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, MT = po.length;
function RT(e, n, o) {
  let i = "", a = !0;
  for (let d = 0; d < MT; d++) {
    const p = po[d], m = e[p];
    if (m === void 0)
      continue;
    let g = !0;
    if (typeof m == "number")
      g = m === (p.startsWith("scale") ? 1 : 0);
    else {
      const v = parseFloat(m);
      g = p.startsWith("scale") ? v === 1 : v === 0;
    }
    if (!g || o) {
      const v = bc(m, Sa[p]);
      if (!g) {
        a = !1;
        const l = bT[p] || p;
        i += `${l}(${v}) `;
      }
      o && (n[p] = v);
    }
  }
  const c = e.pathRotation;
  return c && (a = !1, i += `rotate(${bc(c, Sa.pathRotation)}) `), i = i.trim(), o ? i = o(n, a ? "" : i) : a && (i = "none"), i;
}
function Md(e, n, o) {
  const { style: i, vars: a, transformOrigin: c } = e;
  let d = !1, p = !1;
  for (const m in n) {
    const g = n[m];
    if (ho.has(m)) {
      d = !0;
      continue;
    } else if (Dg(m)) {
      a[m] = g;
      continue;
    } else {
      const v = bc(g, Sa[m]);
      m.startsWith("origin") ? (p = !0, c[m] = v) : i[m] = v;
    }
  }
  if (n.transform || (d || o ? i.transform = RT(n, e.transform, o) : i.transform && (i.transform = "none")), p) {
    const { originX: m = "50%", originY: g = "50%", originZ: v = 0 } = c;
    i.transformOrigin = `${m} ${g} ${v}`;
  }
}
function _v(e, { style: n, vars: o }, i, a) {
  const c = e.style;
  let d;
  for (d in n)
    c[d] = n[d];
  a == null || a.applyProjectionStyles(c, i);
  for (d in o)
    c.setProperty(d, o[d]);
}
function Gm(e, n) {
  return n.max === n.min ? 0 : e / (n.max - n.min) * 100;
}
const ii = {
  correct: (e, n) => {
    if (!n.target)
      return e;
    if (typeof e == "string")
      if (te.test(e))
        e = parseFloat(e);
      else
        return e;
    const o = Gm(e, n.target.x), i = Gm(e, n.target.y);
    return `${o}% ${i}%`;
  }
}, DT = {
  correct: (e, { treeScale: n, projectionDelta: o }) => {
    const i = e, a = Bt.parse(e);
    if (a.length > 5)
      return i;
    const c = Bt.createTransformer(e), d = typeof a[0] != "number" ? 1 : 0, p = o.x.scale * n.x, m = o.y.scale * n.y;
    a[0 + d] /= p, a[1 + d] /= m;
    const g = Te(p, m, 0.5);
    return typeof a[2 + d] == "number" && (a[2 + d] /= g), typeof a[3 + d] == "number" && (a[3 + d] /= g), c(a);
  }
}, Nc = {
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
  boxShadow: DT
};
function Tv(e, { layout: n, layoutId: o }) {
  return ho.has(e) || e.startsWith("origin") || (n || o !== void 0) && (!!Nc[e] || e === "opacity");
}
function Rd(e, n, o) {
  var d;
  const i = e.style, a = n == null ? void 0 : n.style, c = {};
  if (!i)
    return c;
  for (const p in i)
    (Ze(i[p]) || a && Ze(a[p]) || Tv(p, e) || ((d = o == null ? void 0 : o.getValue(p)) == null ? void 0 : d.liveStyle) !== void 0) && (c[p] = i[p]);
  return c;
}
function NT(e) {
  return window.getComputedStyle(e);
}
class IT extends gv {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = _v;
  }
  readValueFromInstance(n, o) {
    var i;
    if (ho.has(o))
      return (i = this.projection) != null && i.isProjecting ? vc(o) : q_(n, o);
    {
      const a = NT(n), c = (Dg(o) ? a.getPropertyValue(o) : a[o]) || 0;
      return typeof c == "string" ? c.trim() : c;
    }
  }
  measureInstanceViewportBox(n, { transformPagePoint: o }) {
    return xv(n, o);
  }
  build(n, o, i) {
    Md(n, o, i.transformTemplate);
  }
  scrapeMotionValuesFromProps(n, o, i) {
    return Rd(n, o, i);
  }
}
const FT = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, jT = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function OT(e, n, o = 1, i = 0, a = !0) {
  e.pathLength = 1;
  const c = a ? FT : jT;
  e[c.offset] = `${-i}`, e[c.array] = `${n} ${o}`;
}
const LT = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function kv(e, {
  attrX: n,
  attrY: o,
  attrScale: i,
  pathLength: a,
  pathSpacing: c = 1,
  pathOffset: d = 0,
  // This is object creation, which we try to avoid per-frame.
  ...p
}, m, g, v) {
  if (Md(e, p, g), m) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: l, style: f } = e;
  l.transform && (f.transform = l.transform, delete l.transform), (f.transform || l.transformOrigin) && (f.transformOrigin = l.transformOrigin ?? "50% 50%", delete l.transformOrigin), f.transform && (f.transformBox = (v == null ? void 0 : v.transformBox) ?? "fill-box", delete l.transformBox);
  for (const S of LT)
    l[S] !== void 0 && (f[S] = l[S], delete l[S]);
  n !== void 0 && (l.x = n), o !== void 0 && (l.y = o), i !== void 0 && (l.scale = i), a !== void 0 && OT(l, a, c, d, !1);
}
const Av = /* @__PURE__ */ new Set([
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
]), Cv = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function VT(e, n, o, i) {
  _v(e, n, void 0, i);
  for (const a in n.attrs)
    e.setAttribute(Av.has(a) ? a : kd(a), n.attrs[a]);
}
function Pv(e, n, o) {
  const i = Rd(e, n, o);
  for (const a in e)
    if (Ze(e[a]) || Ze(n[a])) {
      const c = po.indexOf(a) !== -1 ? "attr" + a.charAt(0).toUpperCase() + a.substring(1) : a;
      i[c] = e[a];
    }
  return i;
}
class BT extends gv {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Ue;
  }
  getBaseTargetFromProps(n, o) {
    return n[o];
  }
  readValueFromInstance(n, o) {
    if (ho.has(o)) {
      const i = av(o);
      return i && i.default || 0;
    }
    return o = Av.has(o) ? o : kd(o), n.getAttribute(o);
  }
  scrapeMotionValuesFromProps(n, o, i) {
    return Pv(n, o, i);
  }
  build(n, o, i) {
    kv(n, o, this.isSVGTag, i.transformTemplate, i.style);
  }
  renderInstance(n, o, i, a) {
    VT(n, o, i, a);
  }
  mount(n) {
    this.isSVGTag = Cv(n.tagName), super.mount(n);
  }
}
const zT = bd.length;
function Ev(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const o = e.parent ? Ev(e.parent) || {} : {};
    return e.props.initial !== void 0 && (o.initial = e.props.initial), o;
  }
  const n = {};
  for (let o = 0; o < zT; o++) {
    const i = bd[o], a = e.props[i];
    (mi(a) || a === !1) && (n[i] = a);
  }
  return n;
}
function bv(e, n) {
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
const UT = [...Ed].reverse(), $T = Ed.length;
function HT(e) {
  return (n) => Promise.all(n.map(({ animation: o, options: i }) => z1(e, o, i)));
}
function WT(e) {
  let n = HT(e), o = Km(), i = !0, a = !1;
  const c = (g) => (v, l) => {
    var S;
    const f = hr(e, l, g === "exit" ? (S = e.presenceContext) == null ? void 0 : S.custom : void 0);
    if (f) {
      const { transition: w, transitionEnd: T, ..._ } = f;
      v = { ...v, ..._, ...T };
    }
    return v;
  };
  function d(g) {
    n = g(e);
  }
  function p(g) {
    const { props: v } = e, l = Ev(e.parent) || {}, f = [], S = /* @__PURE__ */ new Set();
    let w = {}, T = 1 / 0;
    for (let A = 0; A < $T; A++) {
      const E = UT[A], M = o[E], N = v[E] !== void 0 ? v[E] : l[E], O = mi(N), W = E === g ? M.isActive : null;
      W === !1 && (T = A);
      let K = N === l[E] && N !== v[E] && O;
      if (K && (i || a) && e.manuallyAnimateOnMount && (K = !1), M.protectedKeys = { ...w }, // If it isn't active and hasn't *just* been set as inactive
      !M.isActive && W === null || // If we didn't and don't have any defined prop for this animation type
      !N && !M.prevProp || // Or if the prop doesn't define an animation
      Ra(N) || typeof N == "boolean")
        continue;
      if (E === "exit" && M.isActive && W !== !0) {
        M.prevResolvedValues && (w = {
          ...w,
          ...M.prevResolvedValues
        });
        continue;
      }
      const G = GT(M.prevProp, N);
      let L = G || // If we're making this variant active, we want to always make it active
      E === g && M.isActive && !K && O || // If we removed a higher-priority variant (i is in reverse order)
      A > T && O, Q = !1;
      const ae = Array.isArray(N) ? N : [N];
      let J = ae.reduce(c(E), {});
      W === !1 && (J = {});
      const { prevResolvedValues: de = {} } = M, ue = {
        ...de,
        ...J
      }, _e = (U) => {
        L = !0, S.has(U) && (Q = !0, S.delete(U)), M.needsAnimating[U] = !0;
        const X = e.getValue(U);
        X && (X.liveStyle = !1);
      };
      for (const U in ue) {
        const X = J[U], Y = de[U];
        if (w.hasOwnProperty(U))
          continue;
        let D = !1;
        kc(X) && kc(Y) ? D = !bv(X, Y) || G : D = X !== Y, D ? X != null ? _e(U) : S.add(U) : X !== void 0 && S.has(U) ? _e(U) : M.protectedKeys[U] = !0;
      }
      M.prevProp = N, M.prevResolvedValues = J, M.isActive && (w = { ...w, ...J }), (i || a) && e.blockInitialAnimation && (L = !1);
      const ve = K && G;
      L && (!ve || Q) && f.push(...ae.map((U) => {
        const X = { type: E };
        if (typeof U == "string" && (i || a) && !ve && e.manuallyAnimateOnMount && e.parent) {
          const { parent: Y } = e, D = hr(Y, U);
          if (Y.enteringChildren && D) {
            const { delayChildren: V } = D.transition || {};
            X.delay = Jg(Y.enteringChildren, e, V);
          }
        }
        return {
          animation: U,
          options: X
        };
      }));
    }
    if (S.size) {
      const A = {};
      if (typeof v.initial != "boolean") {
        const E = hr(e, Array.isArray(v.initial) ? v.initial[0] : v.initial);
        E && E.transition && (A.transition = E.transition);
      }
      S.forEach((E) => {
        const M = e.getBaseTarget(E), N = e.getValue(E);
        N && (N.liveStyle = !0), A[E] = M ?? null;
      }), f.push({ animation: A });
    }
    let _ = !!f.length;
    return i && (v.initial === !1 || v.initial === v.animate) && !e.manuallyAnimateOnMount && (_ = !1), i = !1, a = !1, _ ? n(f) : Promise.resolve();
  }
  function m(g, v) {
    var f;
    if (o[g].isActive === v)
      return Promise.resolve();
    (f = e.variantChildren) == null || f.forEach((S) => {
      var w;
      return (w = S.animationState) == null ? void 0 : w.setActive(g, v);
    }), o[g].isActive = v;
    const l = p(g);
    for (const S in o)
      o[S].protectedKeys = {};
    return l;
  }
  return {
    animateChanges: p,
    setActive: m,
    setAnimateFunction: d,
    getState: () => o,
    reset: () => {
      o = Km(), a = !0;
    }
  };
}
function GT(e, n) {
  return typeof n == "string" ? n !== e : Array.isArray(n) ? !bv(n, e) : !1;
}
function ar(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Km() {
  return {
    animate: ar(!0),
    whileInView: ar(),
    whileHover: ar(),
    whileTap: ar(),
    whileDrag: ar(),
    whileFocus: ar(),
    exit: ar()
  };
}
function Ic(e, n) {
  e.min = n.min, e.max = n.max;
}
function Lt(e, n) {
  Ic(e.x, n.x), Ic(e.y, n.y);
}
function Ym(e, n) {
  e.translate = n.translate, e.scale = n.scale, e.originPoint = n.originPoint, e.origin = n.origin;
}
const Mv = 1e-4, KT = 1 - Mv, YT = 1 + Mv, Rv = 0.01, QT = 0 - Rv, XT = 0 + Rv;
function st(e) {
  return e.max - e.min;
}
function ZT(e, n, o) {
  return Math.abs(e - n) <= o;
}
function Qm(e, n, o, i = 0.5) {
  e.origin = i, e.originPoint = Te(n.min, n.max, e.origin), e.scale = st(o) / st(n), e.translate = Te(o.min, o.max, e.origin) - e.originPoint, (e.scale >= KT && e.scale <= YT || isNaN(e.scale)) && (e.scale = 1), (e.translate >= QT && e.translate <= XT || isNaN(e.translate)) && (e.translate = 0);
}
function ci(e, n, o, i) {
  Qm(e.x, n.x, o.x, i ? i.originX : void 0), Qm(e.y, n.y, o.y, i ? i.originY : void 0);
}
function Xm(e, n, o, i = 0) {
  const a = i ? Te(o.min, o.max, i) : o.min;
  e.min = a + n.min, e.max = e.min + st(n);
}
function JT(e, n, o, i) {
  Xm(e.x, n.x, o.x, i == null ? void 0 : i.x), Xm(e.y, n.y, o.y, i == null ? void 0 : i.y);
}
function Zm(e, n, o, i = 0) {
  const a = i ? Te(o.min, o.max, i) : o.min;
  e.min = n.min - a, e.max = e.min + st(n);
}
function _a(e, n, o, i) {
  Zm(e.x, n.x, o.x, i == null ? void 0 : i.x), Zm(e.y, n.y, o.y, i == null ? void 0 : i.y);
}
function Jm(e, n, o, i, a) {
  return e -= n, e = xa(e, 1 / o, i), a !== void 0 && (e = xa(e, 1 / a, i)), e;
}
function qT(e, n = 0, o = 1, i = 0.5, a, c = e, d = e) {
  if (qt.test(n) && (n = parseFloat(n), n = Te(d.min, d.max, n / 100) - d.min), typeof n != "number")
    return;
  let p = Te(c.min, c.max, i);
  e === c && (p -= n), e.min = Jm(e.min, n, o, p, a), e.max = Jm(e.max, n, o, p, a);
}
function qm(e, n, [o, i, a], c, d) {
  qT(e, n[o], n[i], n[a], n.scale, c, d);
}
const ek = ["x", "scaleX", "originX"], tk = ["y", "scaleY", "originY"];
function ey(e, n, o, i) {
  qm(e.x, n, ek, o ? o.x : void 0, i ? i.x : void 0), qm(e.y, n, tk, o ? o.y : void 0, i ? i.y : void 0);
}
function ty(e) {
  return e.translate === 0 && e.scale === 1;
}
function Dv(e) {
  return ty(e.x) && ty(e.y);
}
function ny(e, n) {
  return e.min === n.min && e.max === n.max;
}
function nk(e, n) {
  return ny(e.x, n.x) && ny(e.y, n.y);
}
function ry(e, n) {
  return Math.round(e.min) === Math.round(n.min) && Math.round(e.max) === Math.round(n.max);
}
function Nv(e, n) {
  return ry(e.x, n.x) && ry(e.y, n.y);
}
function oy(e) {
  return st(e.x) / st(e.y);
}
function iy(e, n) {
  return e.translate === n.translate && e.scale === n.scale && e.originPoint === n.originPoint;
}
function Yt(e) {
  return [e("x"), e("y")];
}
function rk(e, n, o) {
  let i = "";
  const a = e.x.translate / n.x, c = e.y.translate / n.y, d = (o == null ? void 0 : o.z) || 0;
  if ((a || c || d) && (i = `translate3d(${a}px, ${c}px, ${d}px) `), (n.x !== 1 || n.y !== 1) && (i += `scale(${1 / n.x}, ${1 / n.y}) `), o) {
    const { transformPerspective: g, rotate: v, pathRotation: l, rotateX: f, rotateY: S, skewX: w, skewY: T } = o;
    g && (i = `perspective(${g}px) ${i}`), v && (i += `rotate(${v}deg) `), l && (i += `rotate(${l}deg) `), f && (i += `rotateX(${f}deg) `), S && (i += `rotateY(${S}deg) `), w && (i += `skewX(${w}deg) `), T && (i += `skewY(${T}deg) `);
  }
  const p = e.x.scale * n.x, m = e.y.scale * n.y;
  return (p !== 1 || m !== 1) && (i += `scale(${p}, ${m})`), i || "none";
}
const Iv = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
], ok = Iv.length, sy = (e) => typeof e == "string" ? parseFloat(e) : e, ay = (e) => typeof e == "number" || te.test(e);
function ik(e, n, o, i, a, c) {
  a ? (e.opacity = Te(0, o.opacity ?? 1, sk(i)), e.opacityExit = Te(n.opacity ?? 1, 0, ak(i))) : c && (e.opacity = Te(n.opacity ?? 1, o.opacity ?? 1, i));
  for (let d = 0; d < ok; d++) {
    const p = Iv[d];
    let m = ly(n, p), g = ly(o, p);
    if (m === void 0 && g === void 0)
      continue;
    m || (m = 0), g || (g = 0), m === 0 || g === 0 || ay(m) === ay(g) ? (e[p] = Math.max(Te(sy(m), sy(g), i), 0), (qt.test(g) || qt.test(m)) && (e[p] += "%")) : e[p] = g;
  }
  (n.rotate || o.rotate) && (e.rotate = Te(n.rotate || 0, o.rotate || 0, i));
}
function ly(e, n) {
  return e[n] !== void 0 ? e[n] : e.borderRadius;
}
const sk = /* @__PURE__ */ Fv(0, 0.5, Cg), ak = /* @__PURE__ */ Fv(0.5, 0.95, Mt);
function Fv(e, n, o) {
  return (i) => i < e ? 0 : i > n ? 1 : o(/* @__PURE__ */ pi(e, n, i));
}
function lk(e, n, o) {
  const i = Ze(e) ? e : uo(e);
  return i.start(_d("", i, n, o)), i.animation;
}
function yi(e, n, o, i = { passive: !0 }) {
  return e.addEventListener(n, o, i), () => e.removeEventListener(n, o);
}
const uk = (e, n) => e.depth - n.depth;
class ck {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(n) {
    cd(this.children, n), this.isDirty = !0;
  }
  remove(n) {
    ha(this.children, n), this.isDirty = !0;
  }
  forEach(n) {
    this.isDirty && this.children.sort(uk), this.isDirty = !1, this.children.forEach(n);
  }
}
function dk(e, n) {
  const o = it.now(), i = ({ timestamp: a }) => {
    const c = a - o;
    c >= n && (Gn(i), e(c - n));
  };
  return ke.setup(i, !0), () => Gn(i);
}
function la(e) {
  return Ze(e) ? e.get() : e;
}
class fk {
  constructor() {
    this.members = [];
  }
  add(n) {
    cd(this.members, n);
    for (let o = this.members.length - 1; o >= 0; o--) {
      const i = this.members[o];
      if (i === n || i === this.lead || i === this.prevLead)
        continue;
      const a = i.instance;
      (!a || a.isConnected === !1) && !i.snapshot && (ha(this.members, i), i.unmount());
    }
    n.scheduleRender();
  }
  remove(n) {
    if (ha(this.members, n), n === this.prevLead && (this.prevLead = void 0), n === this.lead) {
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
}, Ku = ["", "X", "Y", "Z"], pk = 1e3;
let hk = 0;
function Yu(e, n, o, i) {
  const { latestValues: a } = n;
  a[e] && (o[e] = a[e], n.setStaticValue(e, 0), i && (i[e] = 0));
}
function jv(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: n } = e.options;
  if (!n)
    return;
  const o = rv(n);
  if (window.MotionHasOptimisedAnimation(o, "transform")) {
    const { layout: a, layoutId: c } = e.options;
    window.MotionCancelOptimisedAnimation(o, "transform", ke, !(a || c));
  }
  const { parent: i } = e;
  i && !i.hasCheckedOptimisedAppear && jv(i);
}
function Ov({ attachResizeListener: e, defaultParent: n, measureScroll: o, checkIsScrollRoot: i, resetTransform: a }) {
  return class {
    constructor(d = {}, p = n == null ? void 0 : n()) {
      this.id = hk++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(gk), this.nodes.forEach(Tk), this.nodes.forEach(kk), this.nodes.forEach(vk);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = d, this.root = p ? p.root || p : this, this.path = p ? [...p.path, p] : [], this.parent = p, this.depth = p ? p.depth + 1 : 0;
      for (let m = 0; m < this.path.length; m++)
        this.path[m].shouldResetTransform = !0;
      this.root === this && (this.nodes = new ck());
    }
    addEventListener(d, p) {
      return this.eventHandlers.has(d) || this.eventHandlers.set(d, new dd()), this.eventHandlers.get(d).add(p);
    }
    notifyListeners(d, ...p) {
      const m = this.eventHandlers.get(d);
      m && m.notify(...p);
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
      this.isSVG = Pd(d) && !yT(d), this.instance = d;
      const { layoutId: p, layout: m, visualElement: g } = this.options;
      if (g && !g.current && g.mount(d), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (m || p) && (this.isLayoutDirty = !0), e) {
        let v, l = 0;
        const f = () => this.root.updateBlockedByResize = !1;
        ke.read(() => {
          l = window.innerWidth;
        }), e(d, () => {
          const S = window.innerWidth;
          S !== l && (l = S, this.root.updateBlockedByResize = !0, v && v(), v = dk(f, 250), ua.hasAnimatedSinceResize && (ua.hasAnimatedSinceResize = !1, this.nodes.forEach(dy)));
        });
      }
      p && this.root.registerSharedNode(p, this), this.options.animate !== !1 && g && (p || m) && this.addEventListener("didUpdate", ({ delta: v, hasLayoutChanged: l, hasRelativeLayoutChanged: f, layout: S }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const w = this.options.transition || g.getDefaultTransition() || bk, { onLayoutAnimationStart: T, onLayoutAnimationComplete: _ } = g.getProps(), A = !this.targetLayout || !Nv(this.targetLayout, S), E = !l && f;
        if (this.options.layoutRoot || this.resumeFrom || E || l && (A || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const M = {
            ...xd(w, "layout"),
            onPlay: T,
            onComplete: _
          };
          (g.shouldReduceMotion || this.options.layoutRoot) && (M.delay = 0, M.type = !1), this.startAnimation(M), this.setAnimationOrigin(v, E, M.path);
        } else
          l || dy(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = S;
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(Ak), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && jv(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let v = 0; v < this.path.length; v++) {
        const l = this.path[v];
        l.shouldResetTransform = !0, (typeof l.latestValues.x == "string" || typeof l.latestValues.y == "string") && (l.isLayoutDirty = !0), l.updateScroll("snapshot"), l.options.layoutRoot && l.willUpdate(!1);
      }
      const { layoutId: p, layout: m } = this.options;
      if (p === void 0 && !m)
        return;
      const g = this.getTransformTemplate();
      this.prevTransformTemplateValue = g ? g(this.latestValues, "") : void 0, this.updateSnapshot(), d && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const m = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), m && this.nodes.forEach(wk), this.nodes.forEach(uy);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(cy);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(xk), this.nodes.forEach(_k), this.nodes.forEach(mk), this.nodes.forEach(yk)) : this.nodes.forEach(cy), this.clearAllSnapshots();
      const p = it.now();
      Xe.delta = en(0, 1e3 / 60, p - Xe.timestamp), Xe.timestamp = p, Xe.isProcessing = !0, Vu.update.process(Xe), Vu.preRender.process(Xe), Vu.render.process(Xe), Xe.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, Ad.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(Sk), this.sharedNodes.forEach(Ck);
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
        for (let m = 0; m < this.path.length; m++)
          this.path[m].updateScroll();
      const d = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = Ue()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: p } = this.options;
      p && p.notify("LayoutMeasure", this.layout.layoutBox, d ? d.layoutBox : void 0);
    }
    updateScroll(d = "measure") {
      let p = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === d && (p = !1), p && this.instance) {
        const m = i(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: d,
          isRoot: m,
          offset: o(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : m
        };
      }
    }
    resetTransform() {
      if (!a)
        return;
      const d = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, p = this.projectionDelta && !Dv(this.projectionDelta), m = this.getTransformTemplate(), g = m ? m(this.latestValues, "") : void 0, v = g !== this.prevTransformTemplateValue;
      d && this.instance && (p || lr(this.latestValues) || v) && (a(this.instance, g), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(d = !0) {
      const p = this.measurePageBox();
      let m = this.removeElementScroll(p);
      return d && (m = this.removeTransform(m)), Mk(m), {
        animationId: this.root.animationId,
        measuredBox: p,
        layoutBox: m,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      var g;
      const { visualElement: d } = this.options;
      if (!d)
        return Ue();
      const p = d.measureViewportBox();
      if (!(((g = this.scroll) == null ? void 0 : g.wasRoot) || this.path.some(Rk))) {
        const { scroll: v } = this.root;
        v && (Xt(p.x, v.offset.x), Xt(p.y, v.offset.y));
      }
      return p;
    }
    removeElementScroll(d) {
      var m;
      const p = Ue();
      if (Lt(p, d), (m = this.scroll) != null && m.wasRoot)
        return p;
      for (let g = 0; g < this.path.length; g++) {
        const v = this.path[g], { scroll: l, options: f } = v;
        v !== this.root && l && f.layoutScroll && (l.wasRoot && Lt(p, d), Xt(p.x, l.offset.x), Xt(p.y, l.offset.y));
      }
      return p;
    }
    applyTransform(d, p = !1, m) {
      var v, l;
      const g = m || Ue();
      Lt(g, d);
      for (let f = 0; f < this.path.length; f++) {
        const S = this.path[f];
        !p && S.options.layoutScroll && S.scroll && S !== S.root && (Xt(g.x, -S.scroll.offset.x), Xt(g.y, -S.scroll.offset.y)), lr(S.latestValues) && aa(g, S.latestValues, (v = S.layout) == null ? void 0 : v.layoutBox);
      }
      return lr(this.latestValues) && aa(g, this.latestValues, (l = this.layout) == null ? void 0 : l.layoutBox), g;
    }
    removeTransform(d) {
      var m;
      const p = Ue();
      Lt(p, d);
      for (let g = 0; g < this.path.length; g++) {
        const v = this.path[g];
        if (!lr(v.latestValues))
          continue;
        let l;
        v.instance && (Rc(v.latestValues) && v.updateSnapshot(), l = Ue(), Lt(l, v.measurePageBox())), ey(p, v.latestValues, (m = v.snapshot) == null ? void 0 : m.layoutBox, l);
      }
      return lr(this.latestValues) && ey(p, this.latestValues), p;
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
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== Xe.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(d = !1) {
      var S;
      const p = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = p.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = p.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = p.isSharedProjectionDirty);
      const m = !!this.resumingFrom || this !== p;
      if (!(d || m && this.isSharedProjectionDirty || this.isProjectionDirty || (S = this.parent) != null && S.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: v, layoutId: l } = this.options;
      if (!this.layout || !(v || l))
        return;
      this.resolvedRelativeTargetAt = Xe.timestamp;
      const f = this.getClosestProjectingParent();
      f && this.linkedParentVersion !== f.layoutVersion && !f.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && f && f.layout ? this.createRelativeTarget(f, this.layout.layoutBox, f.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = Ue(), this.targetWithTransforms = Ue()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), JT(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : Lt(this.target, this.layout.layoutBox), wv(this.target, this.targetDelta)) : Lt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? this.createRelativeTarget(f, this.target, f.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Rc(this.parent.latestValues) || Sv(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(d, p, m) {
      this.relativeParent = d, this.linkedParentVersion = d.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Ue(), this.relativeTargetOrigin = Ue(), _a(this.relativeTargetOrigin, p, m, this.options.layoutAnchor || void 0), Lt(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      var w;
      const d = this.getLead(), p = !!this.resumingFrom || this !== d;
      let m = !0;
      if ((this.isProjectionDirty || (w = this.parent) != null && w.isProjectionDirty) && (m = !1), p && (this.isSharedProjectionDirty || this.isTransformDirty) && (m = !1), this.resolvedRelativeTargetAt === Xe.timestamp && (m = !1), m)
        return;
      const { layout: g, layoutId: v } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(g || v))
        return;
      Lt(this.layoutCorrected, this.layout.layoutBox);
      const l = this.treeScale.x, f = this.treeScale.y;
      PT(this.layoutCorrected, this.treeScale, this.path, p), d.layout && !d.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (d.target = d.layout.layoutBox, d.targetWithTransforms = Ue());
      const { target: S } = d;
      if (!S) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Ym(this.prevProjectionDelta.x, this.projectionDelta.x), Ym(this.prevProjectionDelta.y, this.projectionDelta.y)), ci(this.projectionDelta, this.layoutCorrected, S, this.latestValues), (this.treeScale.x !== l || this.treeScale.y !== f || !iy(this.projectionDelta.x, this.prevProjectionDelta.x) || !iy(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", S));
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
        const m = this.getStack();
        m && m.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = oo(), this.projectionDelta = oo(), this.projectionDeltaWithTransform = oo();
    }
    setAnimationOrigin(d, p = !1, m) {
      const g = this.snapshot, v = g ? g.latestValues : {}, l = { ...this.latestValues }, f = oo();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !p;
      const S = Ue(), w = g ? g.source : void 0, T = this.layout ? this.layout.source : void 0, _ = w !== T, A = this.getStack(), E = !A || A.members.length <= 1, M = !!(_ && !E && this.options.crossfade === !0 && !this.path.some(Ek));
      this.animationProgress = 0;
      let N;
      const O = m == null ? void 0 : m.interpolateProjection(d);
      this.mixTargetDelta = (W) => {
        const K = W / 1e3, G = O == null ? void 0 : O(K);
        G ? (f.x.translate = G.x, f.x.scale = Te(d.x.scale, 1, K), f.x.origin = d.x.origin, f.x.originPoint = d.x.originPoint, f.y.translate = G.y, f.y.scale = Te(d.y.scale, 1, K), f.y.origin = d.y.origin, f.y.originPoint = d.y.originPoint) : (fy(f.x, d.x, K), fy(f.y, d.y, K)), this.setTargetDelta(f), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (_a(S, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), Pk(this.relativeTarget, this.relativeTargetOrigin, S, K), N && nk(this.relativeTarget, N) && (this.isProjectionDirty = !1), N || (N = Ue()), Lt(N, this.relativeTarget)), _ && (this.animationValues = l, ik(l, v, this.latestValues, K, M, E)), G && G.rotate !== void 0 && (this.animationValues || (this.animationValues = l), this.animationValues.pathRotation = G.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = K;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(d) {
      var p, m, g;
      this.notifyListeners("animationStart"), (p = this.currentAnimation) == null || p.stop(), (g = (m = this.resumingFrom) == null ? void 0 : m.currentAnimation) == null || g.stop(), this.pendingAnimation && (Gn(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = ke.update(() => {
        ua.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = uo(0)), this.motionValue.jump(0, !1), this.currentAnimation = lk(this.motionValue, [0, 1e3], {
          ...d,
          velocity: 0,
          isSync: !0,
          onUpdate: (v) => {
            this.mixTargetDelta(v), d.onUpdate && d.onUpdate(v);
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(pk), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const d = this.getLead();
      let { targetWithTransforms: p, target: m, layout: g, latestValues: v } = d;
      if (!(!p || !m || !g)) {
        if (this !== d && this.layout && g && Lv(this.options.animationType, this.layout.layoutBox, g.layoutBox)) {
          m = this.target || Ue();
          const l = st(this.layout.layoutBox.x);
          m.x.min = d.target.x.min, m.x.max = m.x.min + l;
          const f = st(this.layout.layoutBox.y);
          m.y.min = d.target.y.min, m.y.max = m.y.min + f;
        }
        Lt(p, m), aa(p, v), ci(this.projectionDeltaWithTransform, this.layoutCorrected, p, v);
      }
    }
    registerSharedNode(d, p) {
      this.sharedNodes.has(d) || this.sharedNodes.set(d, new fk()), this.sharedNodes.get(d).add(p);
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
    promote({ needsReset: d, transition: p, preserveFollowOpacity: m } = {}) {
      const g = this.getStack();
      g && g.promote(this, m), d && (this.projectionDelta = void 0, this.needsReset = !0), p && this.setOptions({ transition: p });
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
      const { latestValues: m } = d;
      if ((m.z || m.rotate || m.rotateX || m.rotateY || m.rotateZ || m.skewX || m.skewY) && (p = !0), !p)
        return;
      const g = {};
      m.z && Yu("z", d, g, this.animationValues);
      for (let v = 0; v < Ku.length; v++)
        Yu(`rotate${Ku[v]}`, d, g, this.animationValues), Yu(`skew${Ku[v]}`, d, g, this.animationValues);
      d.render();
      for (const v in g)
        d.setStaticValue(v, g[v]), this.animationValues && (this.animationValues[v] = g[v]);
      d.scheduleRender();
    }
    applyProjectionStyles(d, p) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        d.visibility = "hidden";
        return;
      }
      const m = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = !1, d.visibility = "", d.opacity = "", d.pointerEvents = la(p == null ? void 0 : p.pointerEvents) || "", d.transform = m ? m(this.latestValues, "") : "none";
        return;
      }
      const g = this.getLead();
      if (!this.projectionDelta || !this.layout || !g.target) {
        this.options.layoutId && (d.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, d.pointerEvents = la(p == null ? void 0 : p.pointerEvents) || ""), this.hasProjected && !lr(this.latestValues) && (d.transform = m ? m({}, "") : "none", this.hasProjected = !1);
        return;
      }
      d.visibility = "";
      const v = g.animationValues || g.latestValues;
      this.applyTransformsToTarget();
      let l = rk(this.projectionDeltaWithTransform, this.treeScale, v);
      m && (l = m(v, l)), d.transform = l;
      const { x: f, y: S } = this.projectionDelta;
      d.transformOrigin = `${f.origin * 100}% ${S.origin * 100}% 0`, g.animationValues ? d.opacity = g === this ? v.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : v.opacityExit : d.opacity = g === this ? v.opacity !== void 0 ? v.opacity : "" : v.opacityExit !== void 0 ? v.opacityExit : 0;
      for (const w in Nc) {
        if (v[w] === void 0)
          continue;
        const { correct: T, applyTo: _, isCSSVariable: A } = Nc[w], E = l === "none" ? v[w] : T(v[w], g);
        if (_) {
          const M = _.length;
          for (let N = 0; N < M; N++)
            d[_[N]] = E;
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
      }), this.root.nodes.forEach(uy), this.root.sharedNodes.clear();
    }
  };
}
function mk(e) {
  e.updateLayout();
}
function yk(e) {
  var o;
  const n = ((o = e.resumeFrom) == null ? void 0 : o.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: i, measuredBox: a } = e.layout, { animationType: c } = e.options, d = n.source !== e.layout.source;
    if (c === "size")
      Yt((l) => {
        const f = d ? n.measuredBox[l] : n.layoutBox[l], S = st(f);
        f.min = i[l].min, f.max = f.min + S;
      });
    else if (c === "x" || c === "y") {
      const l = c === "x" ? "y" : "x";
      Ic(d ? n.measuredBox[l] : n.layoutBox[l], i[l]);
    } else Lv(c, n.layoutBox, i) && Yt((l) => {
      const f = d ? n.measuredBox[l] : n.layoutBox[l], S = st(i[l]);
      f.max = f.min + S, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[l].max = e.relativeTarget[l].min + S);
    });
    const p = oo();
    ci(p, i, n.layoutBox);
    const m = oo();
    d ? ci(m, e.applyTransform(a, !0), n.measuredBox) : ci(m, i, n.layoutBox);
    const g = !Dv(p);
    let v = !1;
    if (!e.resumeFrom) {
      const l = e.getClosestProjectingParent();
      if (l && !l.resumeFrom) {
        const { snapshot: f, layout: S } = l;
        if (f && S) {
          const w = e.options.layoutAnchor || void 0, T = Ue();
          _a(T, n.layoutBox, f.layoutBox, w);
          const _ = Ue();
          _a(_, i, S.layoutBox, w), Nv(T, _) || (v = !0), l.options.layoutRoot && (e.relativeTarget = _, e.relativeTargetOrigin = T, e.relativeParent = l);
        }
      }
    }
    e.notifyListeners("didUpdate", {
      layout: i,
      snapshot: n,
      delta: m,
      layoutDelta: p,
      hasLayoutChanged: g,
      hasRelativeLayoutChanged: v
    });
  } else if (e.isLead()) {
    const { onExitComplete: i } = e.options;
    i && i();
  }
  e.options.transition = void 0;
}
function gk(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function vk(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function Sk(e) {
  e.clearSnapshot();
}
function uy(e) {
  e.clearMeasurements();
}
function wk(e) {
  e.isLayoutDirty = !0, e.updateLayout();
}
function cy(e) {
  e.isLayoutDirty = !1;
}
function xk(e) {
  e.isAnimationBlocked && e.layout && !e.isLayoutDirty && (e.snapshot = e.layout, e.isLayoutDirty = !0);
}
function _k(e) {
  const { visualElement: n } = e.options;
  n && n.getProps().onBeforeLayoutMeasure && n.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function dy(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function Tk(e) {
  e.resolveTargetDelta();
}
function kk(e) {
  e.calcProjection();
}
function Ak(e) {
  e.resetSkewAndRotation();
}
function Ck(e) {
  e.removeLeadSnapshot();
}
function fy(e, n, o) {
  e.translate = Te(n.translate, 0, o), e.scale = Te(n.scale, 1, o), e.origin = n.origin, e.originPoint = n.originPoint;
}
function py(e, n, o, i) {
  e.min = Te(n.min, o.min, i), e.max = Te(n.max, o.max, i);
}
function Pk(e, n, o, i) {
  py(e.x, n.x, o.x, i), py(e.y, n.y, o.y, i);
}
function Ek(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const bk = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, hy = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), my = hy("applewebkit/") && !hy("chrome/") ? Math.round : Mt;
function yy(e) {
  e.min = my(e.min), e.max = my(e.max);
}
function Mk(e) {
  yy(e.x), yy(e.y);
}
function Lv(e, n, o) {
  return e === "position" || e === "preserve-aspect" && !ZT(oy(n), oy(o), 0.2);
}
function Rk(e) {
  var n;
  return e !== e.root && ((n = e.scroll) == null ? void 0 : n.wasRoot);
}
const Dk = Ov({
  attachResizeListener: (e, n) => yi(e, "resize", n),
  measureScroll: () => {
    var e, n;
    return {
      x: document.documentElement.scrollLeft || ((e = document.body) == null ? void 0 : e.scrollLeft) || 0,
      y: document.documentElement.scrollTop || ((n = document.body) == null ? void 0 : n.scrollTop) || 0
    };
  },
  checkIsScrollRoot: () => !0
}), Qu = {
  current: void 0
}, Vv = Ov({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!Qu.current) {
      const e = new Dk({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), Qu.current = e;
    }
    return Qu.current;
  },
  resetTransform: (e, n) => {
    e.style.transform = n !== void 0 ? n : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), Dd = C.createContext({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
function gy(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function Nk(...e) {
  return (n) => {
    let o = !1;
    const i = e.map((a) => {
      const c = gy(a, n);
      return !o && typeof c == "function" && (o = !0), c;
    });
    if (o)
      return () => {
        for (let a = 0; a < i.length; a++) {
          const c = i[a];
          typeof c == "function" ? c() : gy(e[a], null);
        }
      };
  };
}
function Ik(...e) {
  return C.useCallback(Nk(...e), e);
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
function jk({ children: e, isPresent: n, anchorX: o, anchorY: i, root: a, pop: c }) {
  var f;
  const d = C.useId(), p = C.useRef(null), m = C.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: g } = C.useContext(Dd), v = ((f = e.props) == null ? void 0 : f.ref) ?? (e == null ? void 0 : e.ref), l = Ik(p, v);
  return C.useInsertionEffect(() => {
    const { width: S, height: w, top: T, left: _, right: A, bottom: E, direction: M } = m.current;
    if (n || c === !1 || !p.current || !S || !w)
      return;
    const N = M === "rtl", O = o === "left" ? N ? `right: ${A}` : `left: ${_}` : N ? `left: ${_}` : `right: ${A}`, W = i === "bottom" ? `bottom: ${E}` : `top: ${T}`;
    p.current.dataset.motionPopId = d;
    const K = document.createElement("style");
    g && (K.nonce = g);
    const G = a ?? document.head;
    return G.appendChild(K), K.sheet && K.sheet.insertRule(`
          [data-motion-pop-id="${d}"] {
            position: absolute !important;
            width: ${S}px !important;
            height: ${w}px !important;
            ${O}px !important;
            ${W}px !important;
          }
        `), () => {
      var L;
      (L = p.current) == null || L.removeAttribute("data-motion-pop-id"), G.contains(K) && G.removeChild(K);
    };
  }, [n]), k.jsx(Fk, { isPresent: n, childRef: p, sizeRef: m, pop: c, children: c === !1 ? e : C.cloneElement(e, { ref: l }) });
}
const Ok = ({ children: e, initial: n, isPresent: o, onExitComplete: i, custom: a, presenceAffectsLayout: c, mode: d, anchorX: p, anchorY: m, root: g }) => {
  const v = ud(Lk), l = C.useId();
  let f = !0, S = C.useMemo(() => (f = !1, {
    id: l,
    initial: n,
    isPresent: o,
    custom: a,
    onExitComplete: (w) => {
      v.set(w, !0);
      for (const T of v.values())
        if (!T)
          return;
      i && i();
    },
    register: (w) => (v.set(w, !1), () => v.delete(w))
  }), [o, v, i]);
  return c && f && (S = { ...S }), C.useMemo(() => {
    v.forEach((w, T) => v.set(T, !1));
  }, [o]), C.useEffect(() => {
    !o && !v.size && i && i();
  }, [o]), e = k.jsx(jk, { pop: d === "popLayout", isPresent: o, anchorX: p, anchorY: m, root: g, children: e }), k.jsx(ba.Provider, { value: S, children: e });
};
function Lk() {
  return /* @__PURE__ */ new Map();
}
function Bv(e = !0) {
  const n = C.useContext(ba);
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
const $s = (e) => e.key || "";
function vy(e) {
  const n = [];
  return C.Children.forEach(e, (o) => {
    C.isValidElement(o) && n.push(o);
  }), n;
}
const Na = ({ children: e, custom: n, initial: o = !0, onExitComplete: i, presenceAffectsLayout: a = !0, mode: c = "sync", propagate: d = !1, anchorX: p = "left", anchorY: m = "top", root: g }) => {
  const [v, l] = Bv(d), f = C.useMemo(() => vy(e), [e]), S = d && !v ? [] : f.map($s), w = C.useRef(!0), T = C.useRef(f), _ = ud(() => /* @__PURE__ */ new Map()), A = C.useRef(/* @__PURE__ */ new Set()), [E, M] = C.useState(f), [N, O] = C.useState(f);
  hg(() => {
    w.current = !1, T.current = f;
    for (let G = 0; G < N.length; G++) {
      const L = $s(N[G]);
      S.includes(L) ? (_.delete(L), A.current.delete(L)) : _.get(L) !== !0 && _.set(L, !1);
    }
  }, [N, S.length, S.join("-")]);
  const W = [];
  if (f !== E) {
    let G = [...f];
    for (let L = 0; L < N.length; L++) {
      const Q = N[L], ae = $s(Q);
      S.includes(ae) || (G.splice(L, 0, Q), W.push(Q));
    }
    return c === "wait" && W.length && (G = W), O(vy(G)), M(f), null;
  }
  const { forceRender: K } = C.useContext(ld);
  return k.jsx(k.Fragment, { children: N.map((G) => {
    const L = $s(G), Q = d && !v ? !1 : f === N || S.includes(L), ae = () => {
      if (A.current.has(L))
        return;
      if (_.has(L))
        A.current.add(L), _.set(L, !0);
      else
        return;
      let J = !0;
      _.forEach((de) => {
        de || (J = !1);
      }), J && (K == null || K(), O(T.current), d && (l == null || l()), i && i());
    };
    return k.jsx(Ok, { isPresent: Q, initial: !w.current || o ? void 0 : !1, custom: n, presenceAffectsLayout: a, mode: c, root: g, onExitComplete: Q ? void 0 : ae, anchorX: p, anchorY: m, children: G }, L);
  }) });
}, zv = C.createContext({ strict: !1 }), Sy = {
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
let wy = !1;
function Vk() {
  if (wy)
    return;
  const e = {};
  for (const n in Sy)
    e[n] = {
      isEnabled: (o) => Sy[n].some((i) => !!o[i])
    };
  yv(e), wy = !0;
}
function Uv() {
  return Vk(), TT();
}
function Bk(e) {
  const n = Uv();
  for (const o in e)
    n[o] = {
      ...n[o],
      ...e[o]
    };
  yv(n);
}
const zk = /* @__PURE__ */ new Set([
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
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || zk.has(e);
}
let $v = (e) => !Ta(e);
function Uk(e) {
  typeof e == "function" && ($v = (n) => n.startsWith("on") ? !Ta(n) : e(n));
}
try {
  Uk(require("@emotion/is-prop-valid").default);
} catch {
}
function $k(e, n, o) {
  const i = {};
  for (const a in e)
    a === "values" && typeof e.values == "object" || Ze(e[a]) || ($v(a) || o === !0 && Ta(a) || !n && !Ta(a) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && a.startsWith("onDrag")) && (i[a] = e[a]);
  return i;
}
const Ia = /* @__PURE__ */ C.createContext({});
function Hk(e, n) {
  if (Da(e)) {
    const { initial: o, animate: i } = e;
    return {
      initial: o === !1 || mi(o) ? o : void 0,
      animate: mi(i) ? i : void 0
    };
  }
  return e.inherit !== !1 ? n : {};
}
function Wk(e) {
  const { initial: n, animate: o } = Hk(e, C.useContext(Ia));
  return C.useMemo(() => ({ initial: n, animate: o }), [xy(n), xy(o)]);
}
function xy(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const Nd = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function Hv(e, n, o) {
  for (const i in n)
    !Ze(n[i]) && !Tv(i, o) && (e[i] = n[i]);
}
function Gk({ transformTemplate: e }, n) {
  return C.useMemo(() => {
    const o = Nd();
    return Md(o, n, e), Object.assign({}, o.vars, o.style);
  }, [n]);
}
function Kk(e, n) {
  const o = e.style || {}, i = {};
  return Hv(i, o, e), Object.assign(i, Gk(e, n)), i;
}
function Yk(e, n) {
  const o = {}, i = Kk(e, n);
  return e.drag && e.dragListener !== !1 && (o.draggable = !1, i.userSelect = i.WebkitUserSelect = i.WebkitTouchCallout = "none", i.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (o.tabIndex = 0), o.style = i, o;
}
const Wv = () => ({
  ...Nd(),
  attrs: {}
});
function Qk(e, n, o, i) {
  const a = C.useMemo(() => {
    const c = Wv();
    return kv(c, n, Cv(i), e.transformTemplate, e.style), {
      ...c.attrs,
      style: { ...c.style }
    };
  }, [n]);
  if (e.style) {
    const c = {};
    Hv(c, e.style, e), a.style = { ...c, ...a.style };
  }
  return a;
}
const Xk = [
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
function Id(e) {
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
      !!(Xk.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function Zk(e, n, o, { latestValues: i }, a, c = !1, d) {
  const m = (d ?? Id(e) ? Qk : Yk)(n, i, a, e), g = $k(n, typeof e == "string", c), v = e !== C.Fragment ? { ...g, ...m, ref: o } : {}, { children: l } = n, f = C.useMemo(() => Ze(l) ? l.get() : l, [l]);
  return C.createElement(e, {
    ...v,
    children: f
  });
}
function Jk({ scrapeMotionValuesFromProps: e, createRenderState: n }, o, i, a) {
  return {
    latestValues: qk(o, i, a, e),
    renderState: n()
  };
}
function qk(e, n, o, i) {
  const a = {}, c = i(e, {});
  for (const f in c)
    a[f] = la(c[f]);
  let { initial: d, animate: p } = e;
  const m = Da(e), g = hv(e);
  n && g && !m && e.inherit !== !1 && (d === void 0 && (d = n.initial), p === void 0 && (p = n.animate));
  let v = o ? o.initial === !1 : !1;
  v = v || d === !1;
  const l = v ? p : d;
  if (l && typeof l != "boolean" && !Ra(l)) {
    const f = Array.isArray(l) ? l : [l];
    for (let S = 0; S < f.length; S++) {
      const w = Td(e, f[S]);
      if (w) {
        const { transitionEnd: T, transition: _, ...A } = w;
        for (const E in A) {
          let M = A[E];
          if (Array.isArray(M)) {
            const N = v ? M.length - 1 : 0;
            M = M[N];
          }
          M !== null && (a[E] = M);
        }
        for (const E in T)
          a[E] = T[E];
      }
    }
  }
  return a;
}
const Gv = (e) => (n, o) => {
  const i = C.useContext(Ia), a = C.useContext(ba), c = () => Jk(e, n, i, a);
  return o ? c() : ud(c);
}, eA = /* @__PURE__ */ Gv({
  scrapeMotionValuesFromProps: Rd,
  createRenderState: Nd
}), tA = /* @__PURE__ */ Gv({
  scrapeMotionValuesFromProps: Pv,
  createRenderState: Wv
}), nA = Symbol.for("motionComponentSymbol");
function rA(e, n, o) {
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
        const m = d(c);
        typeof m == "function" && (a.current = m);
      } else a.current ? (a.current(), a.current = null) : d(c);
    else d && (d.current = c);
  }, [n]);
}
const Kv = C.createContext({});
function eo(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function oA(e, n, o, i, a, c) {
  var M, N;
  const { visualElement: d } = C.useContext(Ia), p = C.useContext(zv), m = C.useContext(ba), g = C.useContext(Dd), v = g.reducedMotion, l = g.skipAnimations, f = C.useRef(null), S = C.useRef(!1);
  i = i || p.renderer, !f.current && i && (f.current = i(e, {
    visualState: n,
    parent: d,
    props: o,
    presenceContext: m,
    blockInitialAnimation: m ? m.initial === !1 : !1,
    reducedMotionConfig: v,
    skipAnimations: l,
    isSVG: c
  }), S.current && f.current && (f.current.manuallyAnimateOnMount = !0));
  const w = f.current, T = C.useContext(Kv);
  w && !w.projection && a && (w.type === "html" || w.type === "svg") && iA(f.current, o, a, T);
  const _ = C.useRef(!1);
  C.useInsertionEffect(() => {
    w && _.current && w.update(o, m);
  });
  const A = o[nv], E = C.useRef(!!A && typeof window < "u" && !((M = window.MotionHandoffIsComplete) != null && M.call(window, A)) && ((N = window.MotionHasOptimisedAnimation) == null ? void 0 : N.call(window, A)));
  return hg(() => {
    S.current = !0, w && (_.current = !0, window.MotionIsMounted = !0, w.updateFeatures(), w.scheduleRenderMicrotask(), E.current && w.animationState && w.animationState.animateChanges());
  }), C.useEffect(() => {
    w && (!E.current && w.animationState && w.animationState.animateChanges(), E.current && (queueMicrotask(() => {
      var O;
      (O = window.MotionHandoffMarkAsComplete) == null || O.call(window, A);
    }), E.current = !1), w.enteringChildren = void 0);
  }), w;
}
function iA(e, n, o, i) {
  const { layoutId: a, layout: c, drag: d, dragConstraints: p, layoutScroll: m, layoutRoot: g, layoutAnchor: v, layoutCrossfade: l } = n;
  e.projection = new o(e.latestValues, n["data-framer-portal-id"] ? void 0 : Yv(e.parent)), e.projection.setOptions({
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
    layoutScroll: m,
    layoutRoot: g,
    layoutAnchor: v
  });
}
function Yv(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Yv(e.parent);
}
function Xu(e, { forwardMotionProps: n = !1, type: o } = {}, i, a) {
  i && Bk(i);
  const c = o ? o === "svg" : Id(e), d = c ? tA : eA;
  function p(g, v) {
    let l;
    const f = {
      ...C.useContext(Dd),
      ...g,
      layoutId: sA(g)
    }, { isStatic: S } = f, w = Wk(g), T = d(g, S);
    if (!S && typeof window < "u") {
      aA();
      const _ = lA(f);
      l = _.MeasureLayout, w.visualElement = oA(e, T, f, a, _.ProjectionNode, c);
    }
    return k.jsxs(Ia.Provider, { value: w, children: [l && w.visualElement ? k.jsx(l, { visualElement: w.visualElement, ...f }) : null, Zk(e, g, rA(T, w.visualElement, v), T, S, n, c)] });
  }
  p.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const m = C.forwardRef(p);
  return m[nA] = e, m;
}
function sA({ layoutId: e }) {
  const n = C.useContext(ld).id;
  return n && e !== void 0 ? n + "-" + e : e;
}
function aA(e, n) {
  C.useContext(zv).strict;
}
function lA(e) {
  const n = Uv(), { drag: o, layout: i } = n;
  if (!o && !i)
    return {};
  const a = { ...o, ...i };
  return {
    MeasureLayout: o != null && o.isEnabled(e) || i != null && i.isEnabled(e) ? a.MeasureLayout : void 0,
    ProjectionNode: a.ProjectionNode
  };
}
function uA(e, n) {
  if (typeof Proxy > "u")
    return Xu;
  const o = /* @__PURE__ */ new Map(), i = (c, d) => Xu(c, d, e, n), a = (c, d) => i(c, d);
  return new Proxy(a, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (c, d) => d === "create" ? i : (o.has(d) || o.set(d, Xu(d, void 0, e, n)), o.get(d))
  });
}
const cA = (e, n) => n.isSVG ?? Id(e) ? new BT(n) : new IT(n, {
  allowProjection: e !== C.Fragment
});
class dA extends Kn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(n) {
    super(n), n.animationState || (n.animationState = WT(n));
  }
  updateAnimationControlsSubscription() {
    const { animate: n } = this.node.getProps();
    Ra(n) && (this.unmountControls = n.subscribe(this.node));
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
let fA = 0;
class pA extends Kn {
  constructor() {
    super(...arguments), this.id = fA++, this.isExitComplete = !1;
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
          const m = hr(this.node, d, p);
          if (m) {
            const { transition: g, transitionEnd: v, ...l } = m;
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
    Feature: dA
  },
  exit: {
    Feature: pA
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
const mA = (e) => (n) => Cd(n) && e(n, Ai(n));
function di(e, n, o, i) {
  return yi(e, n, mA(o), i);
}
const Qv = ({ current: e }) => e ? e.ownerDocument.defaultView : null, _y = (e, n) => Math.abs(e - n);
function yA(e, n) {
  const o = _y(e.x, n.x), i = _y(e.y, n.y);
  return Math.sqrt(o ** 2 + i ** 2);
}
const Ty = /* @__PURE__ */ new Set(["auto", "scroll"]);
class Xv {
  constructor(n, o, { transformPagePoint: i, contextWindow: a = window, dragSnapToOrigin: c = !1, distanceThreshold: d = 3, element: p } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (S) => {
      this.handleScroll(S.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = Hs(this.lastRawMoveEventInfo, this.transformPagePoint));
      const S = Zu(this.lastMoveEventInfo, this.history), w = this.startEvent !== null, T = yA(S.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!w && !T)
        return;
      const { point: _ } = S, { timestamp: A } = Xe;
      this.history.push({ ..._, timestamp: A });
      const { onStart: E, onMove: M } = this.handlers;
      w || (E && E(this.lastMoveEvent, S), this.startEvent = this.lastMoveEvent), M && M(this.lastMoveEvent, S);
    }, this.handlePointerMove = (S, w) => {
      this.lastMoveEvent = S, this.lastRawMoveEventInfo = w, this.lastMoveEventInfo = Hs(w, this.transformPagePoint), ke.update(this.updatePoint, !0);
    }, this.handlePointerUp = (S, w) => {
      this.end();
      const { onEnd: T, onSessionEnd: _, resumeAnimation: A } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && A && A(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const E = Zu(S.type === "pointercancel" ? this.lastMoveEventInfo : Hs(w, this.transformPagePoint), this.history);
      this.startEvent && T && T(S, E), _ && _(S, E);
    }, !Cd(n))
      return;
    this.dragSnapToOrigin = c, this.handlers = o, this.transformPagePoint = i, this.distanceThreshold = d, this.contextWindow = a || window;
    const m = Ai(n), g = Hs(m, this.transformPagePoint), { point: v } = g, { timestamp: l } = Xe;
    this.history = [{ ...v, timestamp: l }];
    const { onSessionStart: f } = o;
    f && f(n, Zu(g, this.history)), this.removeListeners = _i(di(this.contextWindow, "pointermove", this.handlePointerMove), di(this.contextWindow, "pointerup", this.handlePointerUp), di(this.contextWindow, "pointercancel", this.handlePointerUp)), p && this.startScrollTracking(p);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(n) {
    let o = n.parentElement;
    for (; o; ) {
      const i = getComputedStyle(o);
      (Ty.has(i.overflowX) || Ty.has(i.overflowY)) && this.scrollPositions.set(o, {
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
function ky(e, n) {
  return { x: e.x - n.x, y: e.y - n.y };
}
function Zu({ point: e }, n) {
  return {
    point: e,
    delta: ky(e, Zv(n)),
    offset: ky(e, gA(n)),
    velocity: vA(n, 0.1)
  };
}
function gA(e) {
  return e[0];
}
function Zv(e) {
  return e[e.length - 1];
}
function vA(e, n) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let o = e.length - 1, i = null;
  const a = Zv(e);
  for (; o >= 0 && (i = e[o], !(a.timestamp - i.timestamp > /* @__PURE__ */ ht(n))); )
    o--;
  if (!i)
    return { x: 0, y: 0 };
  i === e[0] && e.length > 2 && a.timestamp - i.timestamp > /* @__PURE__ */ ht(n) * 2 && (i = e[1]);
  const c = /* @__PURE__ */ bt(a.timestamp - i.timestamp);
  if (c === 0)
    return { x: 0, y: 0 };
  const d = {
    x: (a.x - i.x) / c,
    y: (a.y - i.y) / c
  };
  return d.x === 1 / 0 && (d.x = 0), d.y === 1 / 0 && (d.y = 0), d;
}
function SA(e, { min: n, max: o }, i) {
  return n !== void 0 && e < n ? e = i ? Te(n, e, i.min) : Math.max(e, n) : o !== void 0 && e > o && (e = i ? Te(o, e, i.max) : Math.min(e, o)), e;
}
function Ay(e, n, o) {
  return {
    min: n !== void 0 ? e.min + n : void 0,
    max: o !== void 0 ? e.max + o - (e.max - e.min) : void 0
  };
}
function wA(e, { top: n, left: o, bottom: i, right: a }) {
  return {
    x: Ay(e.x, o, a),
    y: Ay(e.y, n, i)
  };
}
function Cy(e, n) {
  let o = n.min - e.min, i = n.max - e.max;
  return n.max - n.min < e.max - e.min && ([o, i] = [i, o]), { min: o, max: i };
}
function xA(e, n) {
  return {
    x: Cy(e.x, n.x),
    y: Cy(e.y, n.y)
  };
}
function _A(e, n) {
  let o = 0.5;
  const i = st(e), a = st(n);
  return a > i ? o = /* @__PURE__ */ pi(n.min, n.max - i, e.min) : i > a && (o = /* @__PURE__ */ pi(e.min, e.max - a, n.min)), en(0, 1, o);
}
function TA(e, n) {
  const o = {};
  return n.min !== void 0 && (o.min = n.min - e.min), n.max !== void 0 && (o.max = n.max - e.min), o;
}
const Fc = 0.35;
function kA(e = Fc) {
  return e === !1 ? e = 0 : e === !0 && (e = Fc), {
    x: Py(e, "left", "right"),
    y: Py(e, "top", "bottom")
  };
}
function Py(e, n, o) {
  return {
    min: Ey(e, n),
    max: Ey(e, o)
  };
}
function Ey(e, n) {
  return typeof e == "number" ? e : e[n] || 0;
}
const AA = /* @__PURE__ */ new WeakMap();
class CA {
  constructor(n) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = Ue(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = n;
  }
  start(n, { snapToCursor: o = !1, distanceThreshold: i } = {}) {
    const { presenceContext: a } = this.visualElement;
    if (a && a.isPresent === !1)
      return;
    const c = (l) => {
      o && this.snapToCursor(Ai(l).point), this.stopAnimation();
    }, d = (l, f) => {
      const { drag: S, dragPropagation: w, onDragStart: T } = this.getProps();
      if (S && !w && (this.openDragLock && this.openDragLock(), this.openDragLock = q1(S), !this.openDragLock))
        return;
      this.latestPointerEvent = l, this.latestPanInfo = f, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Yt((A) => {
        let E = this.getAxisMotionValue(A).get() || 0;
        if (qt.test(E)) {
          const { projection: M } = this.visualElement;
          if (M && M.layout) {
            const N = M.layout.layoutBox[A];
            N && (E = st(N) * (parseFloat(E) / 100));
          }
        }
        this.originPoint[A] = E;
      }), T && ke.update(() => T(l, f), !1, !0), Ac(this.visualElement, "transform");
      const { animationState: _ } = this.visualElement;
      _ && _.setActive("whileDrag", !0);
    }, p = (l, f) => {
      this.latestPointerEvent = l, this.latestPanInfo = f;
      const { dragPropagation: S, dragDirectionLock: w, onDirectionLock: T, onDrag: _ } = this.getProps();
      if (!S && !this.openDragLock)
        return;
      const { offset: A } = f;
      if (w && this.currentDirection === null) {
        this.currentDirection = EA(A), this.currentDirection !== null && T && T(this.currentDirection);
        return;
      }
      this.updateAxis("x", f.point, A), this.updateAxis("y", f.point, A), this.visualElement.render(), _ && ke.update(() => _(l, f), !1, !0);
    }, m = (l, f) => {
      this.latestPointerEvent = l, this.latestPanInfo = f, this.stop(l, f), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, g = () => {
      const { dragSnapToOrigin: l } = this.getProps();
      (l || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: v } = this.getProps();
    this.panSession = new Xv(n, {
      onSessionStart: c,
      onStart: d,
      onMove: p,
      onSessionEnd: m,
      resumeAnimation: g
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: v,
      distanceThreshold: i,
      contextWindow: Qv(this.visualElement),
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
    this.constraints && this.constraints[n] && (d = SA(d, this.constraints[n], this.elastic[n])), c.set(d);
  }
  resolveConstraints() {
    var c;
    const { dragConstraints: n, dragElastic: o } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (c = this.visualElement.projection) == null ? void 0 : c.layout, a = this.constraints;
    n && eo(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && i ? this.constraints = wA(i.layoutBox, n) : this.constraints = !1, this.elastic = kA(o), a !== this.constraints && !eo(n) && i && this.constraints && !this.hasMutatedConstraints && Yt((d) => {
      this.constraints !== !1 && this.getAxisMotionValue(d) && (this.constraints[d] = TA(i.layoutBox[d], this.constraints[d]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: n, onMeasureDragConstraints: o } = this.getProps();
    if (!n || !eo(n))
      return !1;
    const i = n.current;
    Sr(i !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: a } = this.visualElement;
    if (!a || !a.layout)
      return !1;
    a.root && (a.root.scroll = void 0, a.root.updateScroll());
    const c = ET(i, a.root, this.visualElement.getTransformPagePoint());
    let d = xA(a.layout.layoutBox, c);
    if (o) {
      const p = o(AT(d));
      this.hasMutatedConstraints = !!p, p && (d = vv(p));
    }
    return d;
  }
  startAnimation(n) {
    const { drag: o, dragMomentum: i, dragElastic: a, dragTransition: c, dragSnapToOrigin: d, onDragTransitionEnd: p } = this.getProps(), m = this.constraints || {}, g = Yt((v) => {
      if (!Ws(v, o, this.currentDirection))
        return;
      let l = m && m[v] || {};
      (d === !0 || d === v) && (l = { min: 0, max: 0 });
      const f = a ? 200 : 1e6, S = a ? 40 : 1e7, w = {
        type: "inertia",
        velocity: i ? n[v] : 0,
        bounceStiffness: f,
        bounceDamping: S,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...c,
        ...l
      };
      return this.startAxisValueAnimation(v, w);
    });
    return Promise.all(g).then(p);
  }
  startAxisValueAnimation(n, o) {
    const i = this.getAxisMotionValue(n);
    return Ac(this.visualElement, n), i.start(_d(n, i, 0, o, this.visualElement, !1));
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
        const { min: d, max: p } = a.layout.layoutBox[o], m = c.get() || 0;
        c.set(n[o] - Te(d, p, 0.5) + m);
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
        const m = p.get();
        a[d] = _A({ min: m, max: m }, this.constraints[d]);
      }
    });
    const { transformTemplate: c } = this.visualElement.getProps();
    this.visualElement.current.style.transform = c ? c({}, "") : "none", i.root && i.root.updateScroll(), i.updateLayout(), this.constraints = !1, this.resolveConstraints(), Yt((d) => {
      if (!Ws(d, n, null))
        return;
      const p = this.getAxisMotionValue(d), { min: m, max: g } = this.constraints[d];
      p.set(Te(m, g, a[d]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    AA.set(this.visualElement, this);
    const n = this.visualElement.current, o = di(n, "pointerdown", (g) => {
      const { drag: v, dragListener: l = !0 } = this.getProps(), f = g.target, S = f !== n && iT(f);
      v && l && !S && this.start(g);
    });
    let i;
    const a = () => {
      const { dragConstraints: g } = this.getProps();
      eo(g) && g.current && (this.constraints = this.resolveRefConstraints(), i || (i = PA(n, g.current, () => this.scalePositionWithinConstraints())));
    }, { projection: c } = this.visualElement, d = c.addEventListener("measure", a);
    c && !c.layout && (c.root && c.root.updateScroll(), c.updateLayout()), ke.read(a);
    const p = yi(window, "resize", () => this.scalePositionWithinConstraints()), m = c.addEventListener("didUpdate", (({ delta: g, hasLayoutChanged: v }) => {
      this.isDragging && v && (Yt((l) => {
        const f = this.getAxisMotionValue(l);
        f && (this.originPoint[l] += g[l].translate, f.set(f.get() + g[l].translate));
      }), this.visualElement.render());
    }));
    return () => {
      p(), o(), d(), m && m(), i && i();
    };
  }
  getProps() {
    const n = this.visualElement.getProps(), { drag: o = !1, dragDirectionLock: i = !1, dragPropagation: a = !1, dragConstraints: c = !1, dragElastic: d = Fc, dragMomentum: p = !0 } = n;
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
function by(e) {
  let n = !0;
  return () => {
    if (n) {
      n = !1;
      return;
    }
    e();
  };
}
function PA(e, n, o) {
  const i = jm(e, by(o)), a = jm(n, by(o));
  return () => {
    i(), a();
  };
}
function Ws(e, n, o) {
  return (n === !0 || n === e) && (o === null || o === e);
}
function EA(e, n = 10) {
  let o = null;
  return Math.abs(e.y) > n ? o = "y" : Math.abs(e.x) > n && (o = "x"), o;
}
class bA extends Kn {
  constructor(n) {
    super(n), this.removeGroupControls = Mt, this.removeListeners = Mt, this.controls = new CA(n);
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
const Ju = (e) => (n, o) => {
  e && ke.update(() => e(n, o), !1, !0);
};
class MA extends Kn {
  constructor() {
    super(...arguments), this.removePointerDownListener = Mt;
  }
  onPointerDown(n) {
    this.session = new Xv(n, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Qv(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: n, onPanStart: o, onPan: i, onPanEnd: a } = this.node.getProps();
    return {
      onSessionStart: Ju(n),
      onStart: Ju(o),
      onMove: Ju(i),
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
let qu = !1;
class RA extends C.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: n, layoutGroup: o, switchLayoutGroup: i, layoutId: a } = this.props, { projection: c } = n;
    c && (o.group && o.group.add(c), i && i.register && a && i.register(c), qu && c.root.didUpdate(), c.addEventListener("animationComplete", () => {
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
    }), qu = !0, a || n.layoutDependency !== o || o === void 0 || n.isPresent !== c ? d.willUpdate() : this.safeToRemove(), n.isPresent !== c && (c ? d.promote() : d.relegate() || ke.postRender(() => {
      const p = d.getStack();
      (!p || !p.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: n, layoutAnchor: o } = this.props, { projection: i } = n;
    i && (i.options.layoutAnchor = o, i.root.didUpdate(), Ad.postRender(() => {
      !i.currentAnimation && i.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: n, layoutGroup: o, switchLayoutGroup: i } = this.props, { projection: a } = n;
    qu = !0, a && (a.scheduleCheckAfterUnmount(), o && o.group && o.group.remove(a), i && i.deregister && i.deregister(a));
  }
  safeToRemove() {
    const { safeToRemove: n } = this.props;
    n && n();
  }
  render() {
    return null;
  }
}
function Jv(e) {
  const [n, o] = Bv(), i = C.useContext(ld);
  return k.jsx(RA, { ...e, layoutGroup: i, switchLayoutGroup: C.useContext(Kv), isPresent: n, safeToRemove: o });
}
const DA = {
  pan: {
    Feature: MA
  },
  drag: {
    Feature: bA,
    ProjectionNode: Vv,
    MeasureLayout: Jv
  }
};
function My(e, n, o) {
  const { props: i } = e;
  e.animationState && i.whileHover && e.animationState.setActive("whileHover", o === "Start");
  const a = "onHover" + o, c = i[a];
  c && ke.postRender(() => c(n, Ai(n)));
}
class NA extends Kn {
  mount() {
    const { current: n } = this.node;
    n && (this.unmount = tT(n, (o, i) => (My(this.node, i, "Start"), (a) => My(this.node, a, "End"))));
  }
  unmount() {
  }
}
class IA extends Kn {
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
function Ry(e, n, o) {
  const { props: i } = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
    return;
  e.animationState && i.whileTap && e.animationState.setActive("whileTap", o === "Start");
  const a = "onTap" + (o === "End" ? "" : o), c = i[a];
  c && ke.postRender(() => c(n, Ai(n)));
}
class FA extends Kn {
  mount() {
    const { current: n } = this.node;
    if (!n)
      return;
    const { globalTapTarget: o, propagate: i } = this.node.props;
    this.unmount = aT(n, (a, c) => (Ry(this.node, c, "Start"), (d, { success: p }) => Ry(this.node, d, p ? "End" : "Cancel")), {
      useGlobalTarget: o,
      stopPropagation: (i == null ? void 0 : i.tap) === !1
    });
  }
  unmount() {
  }
}
const jc = /* @__PURE__ */ new WeakMap(), ec = /* @__PURE__ */ new WeakMap(), jA = (e) => {
  const n = jc.get(e.target);
  n && n(e);
}, OA = (e) => {
  e.forEach(jA);
};
function LA({ root: e, ...n }) {
  const o = e || document;
  ec.has(o) || ec.set(o, {});
  const i = ec.get(o), a = JSON.stringify(n);
  return i[a] || (i[a] = new IntersectionObserver(OA, { root: e, ...n })), i[a];
}
function VA(e, n, o) {
  const i = LA(n);
  return jc.set(e, o), i.observe(e), () => {
    jc.delete(e), i.unobserve(e);
  };
}
const BA = {
  some: 0,
  all: 1
};
class zA extends Kn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var m;
    (m = this.stopObserver) == null || m.call(this);
    const { viewport: n = {} } = this.node.getProps(), { root: o, margin: i, amount: a = "some", once: c } = n, d = {
      root: o ? o.current : void 0,
      rootMargin: i,
      threshold: typeof a == "number" ? a : BA[a]
    }, p = (g) => {
      const { isIntersecting: v } = g;
      if (this.isInView === v || (this.isInView = v, c && !v && this.hasEnteredView))
        return;
      v && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", v);
      const { onViewportEnter: l, onViewportLeave: f } = this.node.getProps(), S = v ? l : f;
      S && S(g);
    };
    this.stopObserver = VA(this.node.current, d, p);
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
const $A = {
  inView: {
    Feature: zA
  },
  tap: {
    Feature: FA
  },
  focus: {
    Feature: IA
  },
  hover: {
    Feature: NA
  }
}, HA = {
  layout: {
    ProjectionNode: Vv,
    MeasureLayout: Jv
  }
}, WA = {
  ...hA,
  ...$A,
  ...DA,
  ...HA
}, wr = /* @__PURE__ */ uA(WA, cA);
function GA(e) {
  const o = String(e || "").toLowerCase().split(".");
  if (o.length !== 4 || o.some((a) => !/^\d+$/.test(a))) return !1;
  const i = o.map(Number);
  return i.some((a) => a < 0 || a > 255) ? !1 : i[0] === 10 || i[0] === 172 && i[1] >= 16 && i[1] <= 31 || i[0] === 192 && i[1] === 168;
}
function qv(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function Dy(e) {
  return qv(e) || GA(e);
}
function KA(e) {
  return !e || qv(e) ? "127.0.0.1" : e;
}
const YA = (() => {
  var v, l, f, S;
  const e = globalThis.window || globalThis, n = globalThis.document || {}, o = e.location || {}, i = String(e.SYNAPSE_DATA_API_PORT || ((l = (v = n.body) == null ? void 0 : v.dataset) == null ? void 0 : l.dataApiPort) || "3001").trim(), { protocol: a = "file:", hostname: c = "127.0.0.1", port: d = "" } = o, p = `http://${KA(c)}:${i || "3001"}`, m = String(e.SYNAPSE_DATA_API_BASE || ((S = (f = n.body) == null ? void 0 : f.dataset) == null ? void 0 : S.dataApiBase) || "").replace(/\/+$/, ""), g = `${a}//${o.host || (d ? `${c}:${d}` : c)}`.replace(/\/+$/, "");
  return m && !(Dy(c) && d !== i && m === g) ? m : a === "file:" || Dy(c) && d !== i ? p : `${a}//${o.host || c}`;
})(), QA = new dg(YA), tc = Number((globalThis.window || globalThis).SYNAPSE_DATA_API_TIMEOUT_MS || 6e3), XA = Number.isFinite(tc) && tc > 0 ? tc : 6e3;
function ZA(e, n) {
  typeof window > "u" || console.warn(e, n);
}
async function JA(e) {
  var i, a;
  const o = (((a = (i = e.headers) == null ? void 0 : i.get) == null ? void 0 : a.call(i, "content-type")) || "").includes("application/json") ? await e.json() : {};
  if (!e.ok || (o == null ? void 0 : o.ok) === !1)
    throw new Error((o == null ? void 0 : o.error) || `Synapse data API returned HTTP ${e.status}`);
  return o;
}
async function qA(e, n = {}) {
  const o = await QA.fetch(e, {
    timeoutMs: XA,
    ...n
  });
  return JA(o);
}
async function eC(e) {
  try {
    return (await qA("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e || {})
    })).item || null;
  } catch (n) {
    return ZA("Synapse data API focus-session save skipped:", n), null;
  }
}
class tC {
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
const e0 = new tC();
function Fd(e, n) {
  return e0.readJSON(e, n);
}
function jd(e, n) {
  return e0.writeJSON(e, n);
}
const t0 = "synapse.focusRoom.sessions.v1", n0 = "synapse.focusRoom.draft.v1", r0 = "synapse.focusRoom.active-session.v1", Oc = 40, Ny = Object.freeze([
  "idle",
  "running",
  "paused",
  "completed",
  "break",
  "restoring"
]), nC = Object.freeze({
  studying: "running",
  running: "running",
  idle: "idle",
  paused: "paused",
  completed: "completed",
  break: "break",
  restoring: "restoring"
});
let Lc = [];
const ur = (e) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(e)}`, $n = [
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
    streamUrl: ur("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
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
], Ge = {
  nature: {
    id: "nature-forest",
    title: "Forest ambience",
    artist: "nille",
    streamUrl: ur("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: ur("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: ur("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: ur("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: ur("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: ur("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, Hn = [
  {
    label: "Nature",
    layers: [Ge.nature],
    pageUrl: Ge.nature.pageUrl,
    license: Ge.nature.license
  },
  {
    label: "Cafe Rain",
    layers: [Ge.cafe, Ge.rain],
    pageUrl: Ge.cafe.pageUrl,
    license: "CC0 / Public domain"
  },
  {
    label: "Rain",
    layers: [Ge.rain],
    pageUrl: Ge.rain.pageUrl,
    license: Ge.rain.license
  },
  {
    label: "White Noise",
    layers: [Ge.whiteNoise],
    pageUrl: Ge.whiteNoise.pageUrl,
    license: Ge.whiteNoise.license
  },
  {
    label: "Ocean",
    layers: [Ge.ocean],
    pageUrl: Ge.ocean.pageUrl,
    license: Ge.ocean.license
  },
  {
    label: "Wind",
    layers: [Ge.wind],
    pageUrl: Ge.wind.pageUrl,
    license: Ge.wind.license
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
], rC = [25, 45, 50, 90];
function oC(e = "") {
  const n = String(e || "");
  return $n.find((o) => o.label === n) || $n[0];
}
function iC(e = "") {
  const n = String(e || "");
  return Hn.find((o) => o.label === n) || Hn[0];
}
function Fa(e = {}) {
  const n = oC(e == null ? void 0 : e.musicType), o = iC(e == null ? void 0 : e.ambientSound);
  return {
    musicTrack: n,
    ambientSound: o,
    ambientLayers: o.layers.map((i) => ({
      ...i,
      volumeBias: Vn(i.volumeBias, 1)
    }))
  };
}
function sC(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function o0(e) {
  return String(e || "").trim();
}
function aC({ material: e, goal: n, durationMinutes: o }) {
  var v;
  const i = Math.max(10, Number(o) || 25), a = (v = e == null ? void 0 : e.studyHeadings) != null && v.length ? e.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], c = String(n || "").trim() || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`, d = Math.max(1, Math.floor(i * 0.2)), p = Math.max(1, Math.floor(i * 0.4)), m = Math.max(1, Math.floor(i * 0.2)), g = Math.max(1, i - d - p - m);
  return [
    { minutes: d, task: `Set the goal: ${c}` },
    { minutes: p, task: `Review ${a[0] || "the core ideas"}` },
    { minutes: m, task: `Practice with ${a[1] || a[0] || "the generated examples"}` },
    { minutes: g, task: "Summarize mistakes and choose the next study step" }
  ];
}
function i0() {
  return Fd(n0, null);
}
function lC(e) {
  return jd(n0, e || null);
}
function s0(e) {
  if (!e || typeof e != "object")
    return { materials: {} };
  const n = sC(e.materials);
  return {
    ...e,
    materials: { ...n }
  };
}
function co(e, n = "idle") {
  const o = nC[String(e || "").trim().toLowerCase()];
  return o && Ny.includes(o) ? o : Ny.includes(n) ? n : "idle";
}
function Od(e) {
  return co(e) === "running" ? "studying" : co(e);
}
function a0(e = {}, n = {}) {
  const o = e && typeof e == "object" ? e : {}, i = n && typeof n == "object" ? n : {}, a = Object.prototype.hasOwnProperty.call(o, "timerStatus"), c = Object.prototype.hasOwnProperty.call(o, "timerState") || Object.prototype.hasOwnProperty.call(o, "timerPhase"), d = co(
    c ? o.timerState || o.timerPhase : a ? o.timerStatus : o.status || i.timerState,
    co(i.timerState || i.timerPhase || i.timerStatus)
  ), p = o.timerMode === "countup" || i.timerMode === "countup" && !Object.prototype.hasOwnProperty.call(o, "timerMode") ? "countup" : "countdown", g = Object.fromEntries(["timerAnchorAtMs", "timerPausedAtMs", "timerUpdatedAtMs", "timerRestoredAtMs"].map((l) => {
    const f = Object.prototype.hasOwnProperty.call(o, l) ? o[l] : i[l], S = Number(f);
    return [l, Number.isFinite(S) && S > 0 ? S : null];
  })), v = Math.max(0, Vn(
    Object.prototype.hasOwnProperty.call(o, "elapsedSeconds") ? o.elapsedSeconds : i.elapsedSeconds,
    0
  ));
  return {
    ...i,
    ...o,
    timerState: d,
    timerPhase: d,
    status: d,
    timerStatus: Od(d),
    timerMode: p,
    elapsedSeconds: v,
    ...g
  };
}
function l0() {
  return s0(Fd(r0, null));
}
function uC(e) {
  return jd(r0, s0(e));
}
function cC(e) {
  const n = o0(e);
  if (!n) return null;
  const i = l0().materials[n];
  return i && typeof i == "object" ? a0(i) : null;
}
function Ld(e, n) {
  const o = o0(e);
  if (!o) return !1;
  const i = l0();
  return n && typeof n == "object" ? i.materials[o] = {
    ...a0(n, i.materials[o]),
    materialId: o,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  } : delete i.materials[o], uC(i);
}
function u0(e) {
  return Ld(e, null);
}
function Vc() {
  const e = Fd(t0, []), n = Array.isArray(e) ? e : [], o = /* @__PURE__ */ new Set();
  return [...Lc, ...n].filter((i) => {
    const a = String((i == null ? void 0 : i.sessionId) || "");
    return !a || o.has(a) ? !1 : (o.add(a), !0);
  }).slice(0, Oc);
}
function Vn(e, n) {
  const o = Number(e);
  return Number.isFinite(o) ? o : n;
}
function dC(e = {}) {
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
  }, persisted: !0 }, a = Vc().filter((m) => m.sessionId !== i.sessionId), c = [i, ...a.map((m) => ({ ...m, persisted: !0 }))].slice(0, Oc), d = jd(t0, c), p = { ...i, persisted: d };
  return eC(p).catch((m) => {
    console.warn("Synapse data API focus-session background save failed:", m);
  }), d ? Lc = [] : Lc = [p, ...a].slice(0, Oc), p;
}
function c0(e) {
  const n = Math.max(0, Vn(e || 0, 0)), o = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60);
  return o ? `${o}h ${i}m` : `${i}m`;
}
var lg;
const Bc = ((lg = xr[0]) == null ? void 0 : lg.id) || "morning-window", Bn = rC[0], fC = 10, ja = 180, Vd = 60, d0 = ja * 60, pC = 0, hC = 100, mC = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"], zc = new Set(mC), Bd = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function yC(e, n, o, i) {
  const a = Number(e);
  return Number.isFinite(a) ? Math.min(i, Math.max(o, a)) : n;
}
function mr(e, n, o, i) {
  return Math.round(yC(e, n, o, i));
}
function yr(e, n = 50) {
  return mr(e, n, pC, hC);
}
function Oa(e, n = Bn) {
  return mr(e, n, fC, ja);
}
function kr(e, n = Bn * 60) {
  return mr(e, n, Vd, d0);
}
function zd(e) {
  return xr.find((n) => n.id === e) || null;
}
function _r(e = Bc) {
  return zd(e) || xr[0] || {
    id: Bc,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function f0(e) {
  return Array.isArray(e) ? e.map((n) => ({
    minutes: mr(n == null ? void 0 : n.minutes, 5, 1, ja),
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
function p0(e) {
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
function Uc(e, n, o) {
  return e ? aC({
    material: e,
    goal: n,
    durationMinutes: o
  }) : [];
}
function gi(e) {
  const n = Oa(e);
  return n > 0 ? n * 60 : 0;
}
function $c(e) {
  const n = Math.max(0, Math.floor(Number(e) || 0)), o = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60), a = n % 60, c = (d) => String(d).padStart(2, "0");
  return o ? `${o}:${c(i)}:${c(a)}` : `${c(i)}:${c(a)}`;
}
function Iy(e) {
  const n = (e == null ? void 0 : e.flashcards) || [];
  return Array.isArray(n) ? n.slice(0, 24) : [];
}
function gC(e, n) {
  return String((e == null ? void 0 : e.id) || (e == null ? void 0 : e.front) || (e == null ? void 0 : e.term) || n);
}
function vC(e) {
  var n;
  return Array.isArray(e == null ? void 0 : e.questions) ? e.questions : Array.isArray((n = e == null ? void 0 : e.quiz) == null ? void 0 : n.questions) ? e.quiz.questions : [];
}
function Hc(e) {
  return (Array.isArray(e == null ? void 0 : e.quizzes) ? e.quizzes : []).flatMap((o) => vC(o).map((i) => {
    var a;
    return {
      ...i,
      quizTitle: (o == null ? void 0 : o.title) || ((a = o == null ? void 0 : o.quiz) == null ? void 0 : a.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function SC(e, n) {
  return (e == null ? void 0 : e.question) || (e == null ? void 0 : e.prompt) || (e == null ? void 0 : e.stem) || `Question ${n + 1}`;
}
function Ud(e) {
  return String((e == null ? void 0 : e.type) || "").toLowerCase();
}
function wC(e) {
  return String((e == null ? void 0 : e.label) || (e == null ? void 0 : e.text) || e).trim();
}
function ka(e) {
  const n = (e == null ? void 0 : e.choices) || (e == null ? void 0 : e.options) || (e == null ? void 0 : e.answers);
  return Array.isArray(n) && n.length ? n.map(wC).filter(Boolean) : Ud(e) === "true_false" ? ["True", "False"] : [];
}
function Wc(e) {
  const n = (e == null ? void 0 : e.correctOptionIndexes) || (e == null ? void 0 : e.correct_option_indexes) || (e == null ? void 0 : e.correctIndexes);
  return Array.isArray(n) ? n.map((o) => Number(o)).filter(Number.isInteger) : [];
}
function xC(e, n) {
  const o = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [], i = Array.isArray(n) ? [...n].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [];
  return o.length === i.length && o.every((a, c) => a === i[c]);
}
function gr(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Aa(e, n) {
  if (Number.isInteger(n)) return n;
  const o = Number(n);
  if (typeof n != "string" && Number.isInteger(o)) return o;
  const i = ka(e), a = gr(n);
  return i.findIndex((c) => gr(c) === a);
}
function h0(e, n) {
  if (typeof n == "boolean") return n;
  if (n === 0) return !0;
  if (n === 1) return !1;
  const o = ka(e), i = gr(n);
  return i === "true" ? !0 : i === "false" ? !1 : gr(o[0]) === i ? !0 : gr(o[1]) === i ? !1 : null;
}
function _C(e, n, o) {
  const i = Ud(e);
  if (i === "multiple_choice") {
    const a = Aa(e, n);
    if (!Number.isInteger(a) || a < 0) return [];
    const c = Array.isArray(o) ? [...o] : [];
    return c.includes(a) ? c.filter((d) => d !== a) : [...c, a].sort((d, p) => d - p);
  }
  if (i === "single_choice") {
    const a = Aa(e, n);
    return Number.isInteger(a) && a >= 0 ? a : "";
  }
  if (i === "true_false") {
    const a = h0(e, n);
    return a === null ? "" : a;
  }
  return String(n || "");
}
function m0(e) {
  const n = (e == null ? void 0 : e.correctAnswer) ?? (e == null ? void 0 : e.correct_answer) ?? (e == null ? void 0 : e.answer) ?? (e == null ? void 0 : e.correct), o = Wc(e);
  if (o.length) {
    const i = ka(e);
    return o.map((a) => i[a] || "").filter(Boolean).join(", ");
  }
  if (typeof (e == null ? void 0 : e.correctBoolean) == "boolean" || typeof (e == null ? void 0 : e.correct_boolean) == "boolean") {
    const i = ka(e);
    return (typeof e.correctBoolean == "boolean" ? e.correctBoolean : e.correct_boolean) ? i[0] || "True" : i[1] || "False";
  }
  return e != null && e.expectedAnswer || e != null && e.expected_answer ? String(e.expectedAnswer || e.expected_answer || "").trim() : Array.isArray(n) ? n.map((i) => String(i)).join(", ") : String(n || "").trim();
}
function TC(e, n) {
  const o = Ud(e);
  if (o === "single_choice") {
    const a = Wc(e)[0], c = Aa(e, n);
    return Number.isInteger(a) ? c === a : null;
  }
  if (o === "multiple_choice") {
    const a = Wc(e), c = Array.isArray(n) ? n : [Aa(e, n)].filter(Number.isInteger);
    return a.length ? xC(c, a) : null;
  }
  if (o === "true_false") {
    const a = typeof (e == null ? void 0 : e.correctBoolean) == "boolean" ? e.correctBoolean : e == null ? void 0 : e.correct_boolean, c = h0(e, n);
    return typeof a == "boolean" && c !== null ? c === a : null;
  }
  const i = m0(e);
  return i ? gr(n) === gr(i) : null;
}
function y0(e, n, o) {
  var p;
  const i = String(e || "").trim(), a = String((n == null ? void 0 : n.summaryText) || (n == null ? void 0 : n.aiSummary) || "").slice(0, 420), c = ((p = n == null ? void 0 : n.studyHeadings) == null ? void 0 : p[0]) || (n == null ? void 0 : n.materialTitle) || "this material", d = o || `Study ${(n == null ? void 0 : n.materialTitle) || "this material"}`;
  return i ? [
    `For ${c}: ${a || "use the selected material as your main source."}`,
    `Your current goal is: ${d}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function kC() {
  return /* @__PURE__ */ k.jsx("svg", { className: "liquid-glass-filter-defs", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ k.jsx("defs", { children: /* @__PURE__ */ k.jsxs("filter", { id: "liquid-glass-displacement", x: "-12%", y: "-12%", width: "124%", height: "124%", colorInterpolationFilters: "sRGB", children: [
    /* @__PURE__ */ k.jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.024", numOctaves: "2", seed: "17", result: "liquid-noise" }),
    /* @__PURE__ */ k.jsx("feDisplacementMap", { in: "SourceGraphic", in2: "liquid-noise", scale: "7", xChannelSelector: "R", yChannelSelector: "B", result: "refracted-surface" }),
    /* @__PURE__ */ k.jsx("feColorMatrix", { in: "refracted-surface", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.04 0", result: "edge-alpha" }),
    /* @__PURE__ */ k.jsx("feGaussianBlur", { in: "edge-alpha", stdDeviation: "0.25", result: "soft-edge" }),
    /* @__PURE__ */ k.jsx("feBlend", { in: "soft-edge", in2: "refracted-surface", mode: "screen" })
  ] }) }) });
}
function AC({ scene: e }) {
  const [n, o] = C.useState(!1), [i, a] = C.useState(!1);
  return C.useEffect(() => {
    o(!1), a(!1);
  }, [e == null ? void 0 : e.id]), /* @__PURE__ */ k.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ k.jsx(kC, {}),
    /* @__PURE__ */ k.jsx(Na, { mode: "wait", children: /* @__PURE__ */ k.jsxs(
      wr.div,
      {
        className: "focus-background",
        style: { backgroundImage: i ? "none" : void 0 },
        initial: { opacity: 0, scale: 1.035 },
        animate: { opacity: 1, scale: 1.02 },
        exit: { opacity: 0, scale: 1.015 },
        transition: { duration: 0.8, ease: "easeOut" },
        children: [
          e != null && e.image ? /* @__PURE__ */ k.jsx(
            "img",
            {
              className: `focus-background-media focus-background-poster ${n ? "is-ready" : ""}`.trim(),
              src: e.image,
              alt: "",
              onLoad: () => o(!0),
              onError: () => a(!0)
            }
          ) : null,
          e != null && e.video ? /* @__PURE__ */ k.jsx(
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
    /* @__PURE__ */ k.jsx("div", { className: "focus-overlay" }),
    /* @__PURE__ */ k.jsx("div", { className: "focus-vignette" })
  ] });
}
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CC = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), PC = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (n, o, i) => i ? i.toUpperCase() : o.toLowerCase()
), Fy = (e) => {
  const n = PC(e);
  return n.charAt(0).toUpperCase() + n.slice(1);
}, g0 = (...e) => e.filter((n, o, i) => !!n && n.trim() !== "" && i.indexOf(n) === o).join(" ").trim(), EC = (e) => {
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
var bC = {
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
const MC = C.forwardRef(
  ({
    color: e = "currentColor",
    size: n = 24,
    strokeWidth: o = 2,
    absoluteStrokeWidth: i,
    className: a = "",
    children: c,
    iconNode: d,
    ...p
  }, m) => C.createElement(
    "svg",
    {
      ref: m,
      ...bC,
      width: n,
      height: n,
      stroke: e,
      strokeWidth: i ? Number(o) * 24 / Number(n) : o,
      className: g0("lucide", a),
      ...!c && !EC(p) && { "aria-hidden": "true" },
      ...p
    },
    [
      ...d.map(([g, v]) => C.createElement(g, v)),
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
const Je = (e, n) => {
  const o = C.forwardRef(
    ({ className: i, ...a }, c) => C.createElement(MC, {
      ref: c,
      iconNode: n,
      className: g0(
        `lucide-${CC(Fy(e))}`,
        `lucide-${e}`,
        i
      ),
      ...a
    })
  );
  return o.displayName = Fy(e), o;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const RC = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], v0 = Je("check", RC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const DC = [
  ["rect", { width: "12", height: "12", x: "2", y: "10", rx: "2", ry: "2", key: "6agr2n" }],
  [
    "path",
    { d: "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6", key: "1o487t" }
  ],
  ["path", { d: "M6 18h.01", key: "uhywen" }],
  ["path", { d: "M10 14h.01", key: "ssrbsk" }],
  ["path", { d: "M15 6h.01", key: "cblpky" }],
  ["path", { d: "M18 9h.01", key: "2061c0" }]
], NC = Je("dices", DC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const IC = [
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
], FC = Je("door-open", IC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jC = [
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
], Ca = Je("footprints", jC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const OC = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
], LC = Je("minimize-2", OC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const VC = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], jy = Je("pause", VC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const BC = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], zC = Je("play", BC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UC = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], $C = Je("rotate-ccw", UC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const HC = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
], S0 = Je("save", HC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const WC = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
], w0 = Je("settings-2", WC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const GC = [
  ["path", { d: "m18 14 4 4-4 4", key: "10pe0f" }],
  ["path", { d: "m18 2 4 4-4 4", key: "pucp1d" }],
  ["path", { d: "M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22", key: "1ailkh" }],
  ["path", { d: "M2 6h1.972a4 4 0 0 1 3.6 2.2", key: "km57vx" }],
  ["path", { d: "M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45", key: "os18l9" }]
], KC = Je("shuffle", GC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const YC = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], QC = Je("skip-forward", YC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const XC = [
  ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
  ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
  ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
  ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
  ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
  ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
  ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
  ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
  ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }]
], ZC = Je("sliders-horizontal", XC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const JC = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
], Pa = Je("users", JC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qC = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], La = Je("volume-2", qC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const eP = [
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
], x0 = Je("waves", eP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tP = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], _0 = Je("x", tP), Oy = (e) => {
  let n;
  const o = /* @__PURE__ */ new Set(), i = (g, v) => {
    const l = typeof g == "function" ? g(n) : g;
    if (!Object.is(l, n)) {
      const f = n;
      n = v ?? (typeof l != "object" || l === null) ? l : Object.assign({}, n, l), o.forEach((S) => S(n, f));
    }
  }, a = () => n, p = { setState: i, getState: a, getInitialState: () => m, subscribe: (g) => (o.add(g), () => o.delete(g)) }, m = n = e(i, a, p);
  return p;
}, nP = ((e) => e ? Oy(e) : Oy), rP = (e) => e;
function oP(e, n = rP) {
  const o = pn.useSyncExternalStore(
    e.subscribe,
    pn.useCallback(() => n(e.getState()), [e, n]),
    pn.useCallback(() => n(e.getInitialState()), [e, n])
  );
  return pn.useDebugValue(o), o;
}
const Ly = (e) => {
  const n = nP(e), o = (i) => oP(n, i);
  return Object.assign(o, n), o;
}, iP = ((e) => e ? Ly(e) : Ly), $d = Object.freeze({
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
function sP() {
  return xr[0] || _r(Bc);
}
function aP(e) {
  const n = String(e || "");
  if (!n) return null;
  const i = p0(i0()).materials[n];
  return i && typeof i == "object" ? i : null;
}
function Fn(e) {
  var i;
  const n = String(e.selectedMaterialId || ((i = e.selectedMaterial) == null ? void 0 : i.materialId) || "");
  if (!n) return;
  const o = p0(i0());
  o.materials[n] = {
    materialId: n,
    selectedScene: e.selectedScene,
    musicType: e.musicType,
    ambientSound: e.ambientSound,
    musicVolume: yr(e.musicVolume),
    ambientVolume: yr(e.ambientVolume),
    audioChannels: { ...$d, ...e.audioChannels || {} },
    durationMinutes: Oa(e.pomodoroDuration),
    durationSeconds: kr(e.pomodoroDurationSeconds, gi(e.pomodoroDuration)),
    studyGoal: e.studyGoal,
    studyPlan: f0(e.studyPlan),
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks.filter(Boolean) : [],
    workspaceNotes: String(e.workspaceNotes || ""),
    workspaceUpdatedAt: e.workspaceUpdatedAt || "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, lC(o);
}
function lP(e) {
  return Array.isArray(e == null ? void 0 : e.completedTasks) ? e.completedTasks.map((n) => String(n || "").trim()).filter(Boolean) : [];
}
function Gc(e = {}) {
  return {
    sectionTitle: String(e.sectionTitle || "").trim(),
    excerpt: String(e.excerpt || "").trim().slice(0, 1800)
  };
}
function T0(e = null) {
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
function Ea(e = {}, n = wt()) {
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
    timerStatus: Od(o),
    timerUpdatedAtMs: n
  };
}
function uP(e = {}) {
  const n = Zt(e);
  return {
    timerState: n,
    timerPhase: n,
    status: n,
    timerStatus: Od(n),
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
function jn(e) {
  var o;
  const n = String(e.selectedMaterialId || ((o = e.selectedMaterial) == null ? void 0 : o.materialId) || "");
  return !n || e.view !== "session" ? !1 : Ld(n, uP(e));
}
function Vy(e, n = wt()) {
  const o = Ea(e, n), i = zn(e), a = e.timerMode !== "countup" && i > 0 && o >= i, c = a ? "completed" : Zt(e);
  return {
    ...Qt(c, n),
    elapsedSeconds: a ? i : o,
    timerAnchorAtMs: c === "running" ? e.timerAnchorAtMs : null,
    timerPausedAtMs: c === "running" ? null : e.timerPausedAtMs || n,
    audioPlaying: c === "running" ? e.audioPlaying : !1
  };
}
function cP(e, n = {}) {
  const o = _r(n.selectedScene), i = aP(e == null ? void 0 : e.materialId), a = zd(i == null ? void 0 : i.selectedScene) ? i.selectedScene : o.id, c = _r(a), d = String((i == null ? void 0 : i.musicType) || c.musicType || "Deep Focus"), p = String((i == null ? void 0 : i.ambientSound) || c.ambientSound || "Nature"), m = yr(i == null ? void 0 : i.musicVolume, n.musicVolume ?? 60), g = yr(i == null ? void 0 : i.ambientVolume, n.ambientVolume ?? 50), v = Oa(i == null ? void 0 : i.durationMinutes, n.pomodoroDuration ?? Bn), l = kr(
    i == null ? void 0 : i.durationSeconds,
    n.pomodoroDurationSeconds ?? v * 60
  ), f = String((i == null ? void 0 : i.studyGoal) || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`), S = f0(i == null ? void 0 : i.studyPlan), w = S.length ? S : Uc(e, f, v), T = lP(i), _ = String((i == null ? void 0 : i.workspaceNotes) || ""), A = (i == null ? void 0 : i.workspaceUpdatedAt) || (i == null ? void 0 : i.updatedAt) || "";
  return {
    selectedScene: a,
    musicType: d,
    ambientSound: p,
    musicVolume: m,
    ambientVolume: g,
    audioChannels: { ...$d, ...(i == null ? void 0 : i.audioChannels) || n.audioChannels || {} },
    pomodoroDuration: v,
    pomodoroDurationSeconds: l,
    studyGoal: f,
    studyPlan: w,
    completedTasks: T,
    workspaceNotes: _,
    workspaceUpdatedAt: A
  };
}
function dP(e) {
  const n = cC(e);
  if (!n || typeof n != "object") return null;
  const o = Zt(n), i = wt(), a = Number(n.timerAnchorAtMs), c = Date.parse(n.startedAt || ""), d = Number.isFinite(c) ? c : NaN, p = o === "running" ? Ea({
    ...n,
    timerState: "running",
    timerAnchorAtMs: Number.isFinite(a) && a > 0 ? a : d
  }, i) : Math.max(0, Number(n.elapsedSeconds) || 0), m = zn(n), g = o === "running" ? m > 0 && p >= m ? "completed" : "paused" : o, v = o === "running";
  return {
    route: n.view === "session" ? "session" : "setup",
    view: n.view === "session" ? "session" : "setup",
    ...Qt(v ? "restoring" : g, i),
    timerRestoreTarget: v ? g : null,
    timerMode: n.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: null,
    timerPausedAtMs: v ? null : Number(n.timerPausedAtMs) || null,
    timerRestoredAtMs: v ? null : i,
    timerDurationSeconds: m,
    ...Number(n.pomodoroDurationSeconds) > 0 ? { pomodoroDurationSeconds: kr(n.pomodoroDurationSeconds) } : {},
    elapsedSeconds: m > 0 ? Math.min(m, p) : p,
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
    panelTab: zc.has(n.panelTab) ? n.panelTab : "materials",
    workspaceNotes: String(n.workspaceNotes || ""),
    workspaceUpdatedAt: n.workspaceUpdatedAt || n.updatedAt || "",
    activeNoteSection: String(n.activeNoteSection || ""),
    activeSourceHighlight: T0(n.activeSourceHighlight),
    assistantContext: Gc(n.assistantContext),
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
function fP(e) {
  return Object.values(e.flashcardProgress || {}).filter((n) => n && n.difficulty).length;
}
function pP(e) {
  const n = Object.values(e.quizChecked || {}).filter((i) => i && i.hasKnownAnswer);
  if (!n.length) return null;
  const o = n.filter((i) => i.correct).length;
  return Math.round(o / n.length * 100);
}
function hP(e) {
  const n = Hc(e.selectedMaterial);
  return Object.entries(e.quizChecked || {}).filter(([, o]) => o && o.hasKnownAnswer && !o.correct).map(([o]) => SC(n[Number(o)], Number(o))).filter(Boolean);
}
async function mP(e, n, o, i = {}) {
  var d, p;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: y0(e, o, ne.getState().studyGoal),
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
const ne = iP((e, n) => {
  const o = sP();
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
    audioChannels: { ...$d },
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
      const d = n(), p = !!a, m = p ? a.materialId : String(i.materialId || "");
      if (!p) {
        e({
          route: "setup",
          view: "setup",
          selectedMaterialId: m,
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
      const g = d.selectedMaterialId === m, v = g && c ? null : dP(m), l = g && c ? {} : cP(a, d), f = g && c ? {} : {
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
      }, S = g && c ? d.view === "session" ? "session" : "setup" : (v == null ? void 0 : v.view) === "session" ? "session" : "setup";
      if (e({
        ...l,
        ...f,
        ...v,
        route: S,
        view: S,
        selectedMaterialId: m,
        selectedMaterial: a,
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null
      }), (v == null ? void 0 : v.timerState) === "restoring") {
        const w = v.timerRestoreTarget || "paused";
        Promise.resolve().then(() => {
          const T = n();
          if (T.selectedMaterialId !== m || T.timerState !== "restoring") return;
          const _ = wt(), A = zn(T), E = A > 0 ? Math.min(A, Math.max(0, Number(T.elapsedSeconds) || 0)) : Math.max(0, Number(T.elapsedSeconds) || 0), M = {
            ...Qt(w, _),
            timerRestoreTarget: null,
            timerAnchorAtMs: null,
            timerPausedAtMs: w === "paused" ? _ : null,
            timerRestoredAtMs: _,
            elapsedSeconds: E,
            audioPlaying: !1
          };
          e(M), jn({ ...T, ...M });
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
        sessionHistory: Vc()
      });
    },
    selectScene(i) {
      const a = zd(i);
      a && e((c) => {
        const d = {
          selectedScene: a.id,
          musicType: a.musicType || c.musicType,
          ambientSound: a.ambientSound || c.ambientSound
        }, p = { ...c, ...d };
        return Fn(p), d;
      });
    },
    setPomodoroDurationSeconds(i) {
      e((a) => {
        const c = kr(i, a.pomodoroDurationSeconds), d = Math.max(1, Math.round(c / 60)), p = a.selectedMaterial ? Uc(a.selectedMaterial, a.studyGoal, d) : [], m = {
          pomodoroDuration: d,
          pomodoroDurationSeconds: c,
          studyPlan: p,
          timerDurationSeconds: a.timerMode === "countup" ? 0 : c
        };
        return Fn({ ...a, ...m }), m;
      });
    },
    setPomodoroDuration(i) {
      const a = Oa(i, n().pomodoroDuration);
      n().setPomodoroDurationSeconds(a * 60);
    },
    setStudyGoal(i) {
      e((a) => {
        const c = String(i ?? ""), d = a.selectedMaterial ? Uc(a.selectedMaterial, c, a.pomodoroDuration) : [], p = { studyGoal: c, studyPlan: d };
        return Fn({ ...a, ...p }), p;
      });
    },
    setSound(i, a) {
      e((c) => {
        var p;
        let d = {};
        if (i === "musicVolume" && (d = { musicVolume: yr(a, c.musicVolume) }), i === "ambientVolume" && (d = { ambientVolume: yr(a, c.ambientVolume) }), i === "musicType" && (d = { musicType: String(a || c.musicType) }), i === "ambientSound" && (d = { ambientSound: String(a || c.ambientSound) }), String(i).startsWith("audioChannel:")) {
          const m = String(i).slice(13);
          d = { audioChannels: { ...c.audioChannels, [m]: yr(a, ((p = c.audioChannels) == null ? void 0 : p[m]) ?? 0) } };
        }
        return Fn({ ...c, ...d }), d;
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
      const a = zc.has(String(i || "")) ? String(i) : "materials";
      e({
        panelTab: a,
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    selectSourceHighlight(i = null, { openPanel: a = !0 } = {}) {
      const c = T0(i);
      e({
        activeSourceHighlight: c,
        activeNoteSection: (c == null ? void 0 : c.sectionTitle) || n().activeNoteSection || "",
        assistantContext: c ? Gc({
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
        panelTab: zc.has(a) ? a : "materials",
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    startSession() {
      const i = n();
      Fn(i), e({
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
      const d = zn(i), p = c === "completed" || c === "break" || d > 0 && i.elapsedSeconds >= d, m = p ? 0 : Math.max(0, Number(i.elapsedSeconds) || 0), g = {
        view: "session",
        route: "session",
        ...Qt("running", a),
        audioPlaying: !0,
        summaryRecord: null,
        elapsedSeconds: m,
        startedAt: !i.startedAt || p ? new Date(a).toISOString() : i.startedAt,
        timerAnchorAtMs: a - m * 1e3,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerRestoreTarget: null,
        timerDurationSeconds: d,
        ...p ? Gs() : {}
      };
      e(g), jn({ ...i, ...g });
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
      e(p), jn({ ...a, ...p });
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
      e(a), jn({ ...n(), ...a });
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
      e(d), jn({ ...i, ...d });
    },
    tickTimer() {
      const i = n();
      if (i.view !== "session" || Zt(i) !== "running") return;
      const a = wt(), c = zn(i), d = c ? Math.min(c, Ea(i, a)) : Ea(i, a), p = c > 0 && d >= c ? "completed" : "running", m = {
        ...Qt(p, a),
        elapsedSeconds: d,
        timerAnchorAtMs: p === "running" ? i.timerAnchorAtMs : null,
        timerPausedAtMs: p === "running" ? null : a,
        timerDurationSeconds: c,
        audioPlaying: p === "running" ? i.audioPlaying : !1
      };
      d === i.elapsedSeconds && p === Zt(i) || (e(m), jn({ ...i, ...m }));
    },
    setTimerMode(i = "countdown") {
      const a = i === "countup" ? "countup" : "countdown", c = {
        timerMode: a,
        timerDurationSeconds: a === "countup" ? 0 : io(n())
      };
      e(c), jn({ ...n(), ...c });
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
      e(a), jn({ ...n(), ...a });
    },
    getTimerState() {
      return Zt(n());
    },
    endSession() {
      var v;
      const i = n(), a = wt(), c = new Date(a).toISOString(), d = Zt(i) === "running" ? Vy(i, a) : i, p = zn(d), m = p ? Math.min(p, d.elapsedSeconds) : d.elapsedSeconds, g = dC({
        sessionId: (v = i.currentSession) == null ? void 0 : v.sessionId,
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
        totalFocusTime: m,
        flashcardsCompleted: 0,
        quizScore: null,
        mistakesMade: [],
        completedTasks: [],
        recommendedNextStep: "Start another protected focus block when you are ready."
      });
      u0("focus-room"), e({
        summaryRecord: g,
        sessionHistory: Vc(),
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
        return Fn({ ...a, ...c }), c;
      });
    },
    setAssistantContext(i = {}) {
      e({ assistantContext: Gc(i) });
    },
    toggleTask(i) {
      e((a) => {
        const c = a.studyPlan[Number(i)];
        if (!c) return {};
        const d = String(c.task || ""), p = a.completedTasks.includes(d) ? a.completedTasks.filter((m) => m !== d) : [...a.completedTasks, d];
        return Fn({ ...a, completedTasks: p }), { completedTasks: p };
      });
    },
    updatePlanTask(i, a = null, c = null) {
      e((d) => {
        const p = Number(i), m = d.studyPlan[p];
        if (!m) return {};
        const g = String(m.task || ""), v = c == null ? g : String(c || "").trim(), l = a == null ? m.minutes : mr(a, m.minutes, 1, ja), f = d.studyPlan.map((T, _) => _ === p ? { minutes: l, task: v || g } : T);
        let S = d.completedTasks;
        g && g !== f[p].task && S.includes(g) && (S = S.filter((T) => T !== g).concat(f[p].task));
        const w = { studyPlan: f, completedTasks: S };
        return Fn({ ...d, ...w }), w;
      });
    },
    setFlashcardIndex(i) {
      const a = Iy(n().selectedMaterial);
      e({
        flashcardIndex: mr(i, n().flashcardIndex, 0, Math.max(0, a.length - 1)),
        flashcardSide: "front"
      });
    },
    flipFlashcard() {
      e((i) => ({
        flashcardSide: i.flashcardSide === "back" ? "front" : "back"
      }));
    },
    rateFlashcard(i) {
      const a = n(), c = Iy(a.selectedMaterial);
      if (!c.length) return;
      const d = mr(a.flashcardIndex, 0, 0, c.length - 1), p = c[d], m = ["easy", "medium", "hard"].includes(String(i)) ? String(i) : "medium";
      e({
        flashcardProgress: {
          ...a.flashcardProgress,
          [gC(p, d)]: {
            difficulty: m,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: d < c.length - 1 ? d + 1 : d
      });
    },
    answerQuizQuestion(i, a) {
      const c = Number(i), d = Hc(n().selectedMaterial)[c];
      if (!d) return;
      const p = String(c);
      e((m) => ({
        quizAnswers: {
          ...m.quizAnswers,
          [p]: _C(d, a, m.quizAnswers[p])
        }
      }));
    },
    checkQuizQuestion(i) {
      const a = Hc(n().selectedMaterial), c = Number(i), d = a[c];
      if (!d) return;
      const p = String(c), m = n(), g = Object.prototype.hasOwnProperty.call(m.quizAnswers, p) ? m.quizAnswers[p] : "", v = TC(d, g), l = m0(d);
      e({
        quizChecked: {
          ...m.quizChecked,
          [p]: {
            answer: g,
            correct: v === null ? !1 : v,
            hasKnownAnswer: v !== null,
            explanation: d.explanation || d.rationale || (l ? `Correct answer: ${l}` : ""),
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
    },
    async askAssistant(i) {
      const a = String(i || "").trim();
      if (!a) return;
      const c = n(), d = c.selectedMaterial, p = ai(c.chatMessages).slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
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
        const m = await mP(a, p, d, c.assistantContext);
        e((g) => ({
          chatMessages: ai([
            ...g.chatMessages,
            { role: "assistant", text: m.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: m.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (m) {
        e((g) => ({
          chatMessages: ai([
            ...g.chatMessages,
            { role: "assistant", text: y0(a, d, n().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${m.message || "request failed"}`
        }));
      } finally {
        e({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return fP(n());
    },
    focusQuizScore() {
      return pP(n());
    },
    focusQuizMistakes() {
      return hP(n());
    },
    formatFocusedTime() {
      return c0(n().elapsedSeconds);
    }
  };
});
function be({
  children: e,
  className: n = "",
  variant: o = "ghost",
  type: i = "button",
  ...a
}) {
  const { onPointerMove: c, onPointerLeave: d, ...p } = a;
  return /* @__PURE__ */ k.jsx(
    "button",
    {
      className: `glass-button glass-button-${o} ${n}`.trim(),
      type: i,
      onPointerMove: (m) => {
        const g = m.currentTarget.getBoundingClientRect();
        m.currentTarget.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, (m.clientX - g.left) / g.width * 100))}%`), m.currentTarget.style.setProperty("--glass-y", `${Math.max(0, Math.min(100, (m.clientY - g.top) / g.height * 100))}%`), c == null || c(m);
      },
      onPointerLeave: (m) => {
        m.currentTarget.style.setProperty("--glass-x", "50%"), m.currentTarget.style.setProperty("--glass-y", "0%"), d == null || d(m);
      },
      ...p,
      children: e
    }
  );
}
function yP({ onWorkspace: e, onOpenTrail: n, onOpenCompanion: o, onOpenSettings: i, onExit: a }) {
  const c = ne((p) => p.selectedScene), d = _r(c);
  return /* @__PURE__ */ k.jsxs("header", { className: "focus-room-header", children: [
    /* @__PURE__ */ k.jsxs("button", { type: "button", className: "focus-wordmark", onClick: e, "aria-label": "Return to Synapse workspace", children: [
      /* @__PURE__ */ k.jsx("span", { className: "focus-wordmark-mark", children: "S" }),
      /* @__PURE__ */ k.jsx("span", { children: "synapse" })
    ] }),
    /* @__PURE__ */ k.jsxs("div", { className: "focus-room-context", "aria-label": "Current focus context", children: [
      /* @__PURE__ */ k.jsx("span", { children: d.name }),
      /* @__PURE__ */ k.jsx("small", { children: "Quiet study room" })
    ] }),
    /* @__PURE__ */ k.jsxs("nav", { className: "focus-room-header-actions", "aria-label": "Focus Room controls", children: [
      /* @__PURE__ */ k.jsxs(be, { className: "header-icon-button", onClick: n, title: "Open Focus Trail", "aria-label": "Open Focus Trail", children: [
        /* @__PURE__ */ k.jsx(Ca, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Focus Trail" })
      ] }),
      /* @__PURE__ */ k.jsxs(be, { className: "header-icon-button", onClick: o, title: "Open Companion Room", "aria-label": "Open Companion Room", children: [
        /* @__PURE__ */ k.jsx(Pa, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Companion" })
      ] }),
      /* @__PURE__ */ k.jsxs(be, { className: "header-icon-button", onClick: i, title: "Open room settings", "aria-label": "Open room settings", children: [
        /* @__PURE__ */ k.jsx(w0, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Settings" })
      ] }),
      /* @__PURE__ */ k.jsxs(be, { className: "header-icon-button header-exit-button", onClick: a, title: "Exit Focus Room", "aria-label": "Exit Focus Room", children: [
        /* @__PURE__ */ k.jsx(FC, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Exit" })
      ] })
    ] })
  ] });
}
const k0 = {
  minutes: Math.floor(d0 / 60),
  seconds: 59
}, gP = {
  minutes: 3,
  seconds: 2
};
function Hd(e) {
  const n = kr(e, Vd);
  return {
    minutes: Math.floor(n / 60),
    seconds: n % 60
  };
}
function By(e, n) {
  const o = Math.max(0, Math.floor(Number(e) || 0)), i = Math.max(0, Math.floor(Number(n) || 0));
  return kr(o * 60 + i, Vd);
}
function Kc(e, n) {
  return String(Math.max(0, Math.floor(Number(e) || 0))).padStart(2, "0");
}
function Wd(e) {
  const { minutes: n, seconds: o } = Hd(e);
  return `${Kc(n, "minutes")}:${Kc(o, "seconds")}`;
}
function vP(e, n, o) {
  const i = gP[o] || 2;
  return `${String(e || "").replace(/\D/g, "")}${String(n).replace(/\D/g, "")}`.slice(-i) || "";
}
function SP(e, n) {
  const o = Number(String(e || "").replace(/\D/g, "")) || 0;
  return Math.min(k0[n], o);
}
function wP(e, n, o) {
  const i = Hd(e), a = SP(o, n);
  return n === "seconds" ? By(i.minutes, a) : By(a, i.seconds);
}
const xP = { minutes: "Minutes", seconds: "Seconds" };
function zy({
  segment: e,
  value: n,
  disabled: o,
  active: i,
  onFocusSegment: a,
  onType: c,
  onCommit: d,
  onMove: p,
  segmentRef: m
}) {
  const g = xP[e], v = (l) => {
    if (o) return;
    const { key: f } = l;
    if (f >= "0" && f <= "9") {
      l.preventDefault(), c(e, f);
      return;
    }
    if (f === "ArrowLeft") {
      l.preventDefault(), p(-1);
      return;
    }
    if (f === "ArrowRight" || f === "Tab" && !l.shiftKey && e === "minutes") {
      f === "ArrowRight" && (l.preventDefault(), p(1));
      return;
    }
    (f === "Backspace" || f === "Delete") && (l.preventDefault(), d());
  };
  return /* @__PURE__ */ k.jsx("span", { className: `timer-editor-segment${i ? " is-active" : ""}`, children: /* @__PURE__ */ k.jsx(
    "span",
    {
      ref: m,
      className: "timer-editor-digits",
      role: "spinbutton",
      tabIndex: o ? -1 : 0,
      "aria-label": g,
      "aria-valuemin": 0,
      "aria-valuemax": k0[e],
      "aria-valuenow": n,
      "aria-valuetext": `${n} ${g.toLowerCase()}`,
      "aria-disabled": o || void 0,
      onFocus: () => a(e),
      onKeyDown: v,
      children: Kc(n, e)
    }
  ) });
}
function _P({
  valueSeconds: e,
  onChange: n,
  disabled: o = !1,
  size: i = "hero",
  ariaLabel: a = "Set focus block length",
  className: c = ""
}) {
  const { minutes: d, seconds: p } = Hd(e), [m, g] = C.useState(null), v = C.useRef(""), l = C.useRef(null), f = C.useRef(null), S = C.useRef(null), w = C.useCallback(() => {
    v.current = "";
  }, []), T = C.useCallback((M) => {
    v.current = "", g(M);
  }, []), _ = C.useCallback(
    (M, N) => {
      if (o) return;
      const O = vP(v.current, N, M);
      v.current = O, g(M), n == null || n(wP(e, M, O));
    },
    [o, n, e]
  ), A = C.useCallback((M) => {
    var O;
    const N = M < 0 ? "minutes" : "seconds";
    v.current = "", g(N), (O = (M < 0 ? l : f).current) == null || O.focus();
  }, []), E = (M) => {
    var N;
    (N = S.current) != null && N.contains(M.relatedTarget) || (w(), g(null));
  };
  return /* @__PURE__ */ k.jsxs(
    "div",
    {
      ref: S,
      className: `timer-editor timer-editor-${i}${o ? " is-readonly" : ""} ${c}`.trim(),
      role: "group",
      "aria-label": a,
      onBlur: E,
      children: [
        o ? /* @__PURE__ */ k.jsx("span", { className: "timer-editor-static", "aria-hidden": "true", children: Wd(e) }) : /* @__PURE__ */ k.jsxs(k.Fragment, { children: [
          /* @__PURE__ */ k.jsx(
            zy,
            {
              segment: "minutes",
              value: d,
              disabled: o,
              active: m === "minutes",
              segmentRef: l,
              onFocusSegment: T,
              onType: _,
              onCommit: w,
              onMove: A
            }
          ),
          /* @__PURE__ */ k.jsx("span", { className: "timer-editor-colon", "aria-hidden": "true", children: ":" }),
          /* @__PURE__ */ k.jsx(
            zy,
            {
              segment: "seconds",
              value: p,
              disabled: o,
              active: m === "seconds",
              segmentRef: f,
              onFocusSegment: T,
              onType: _,
              onCommit: w,
              onMove: A
            }
          )
        ] }),
        !o && /* @__PURE__ */ k.jsx("span", { className: "sr-only", children: "Editable focus timer. Click minutes or seconds, then type digits to set the value." })
      ]
    }
  );
}
function TP(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function kP({ onFocusMode: e, audioState: n }) {
  const o = ne((L) => L.timerStatus), i = ne((L) => L.elapsedSeconds), a = ne((L) => L.pomodoroDuration), c = ne((L) => L.pomodoroDurationSeconds), d = ne((L) => L.timerMode), p = ne((L) => L.studyGoal), m = ne((L) => L.currentSession), g = ne((L) => L.startTimer), v = ne((L) => L.pauseTimer), l = ne((L) => L.resetTimer), f = ne((L) => L.skipTimer), S = ne((L) => L.toggleAudio), w = ne((L) => L.audioPlaying), T = ne((L) => L.setPomodoroDurationSeconds), _ = Number(c) || (Number(a) || 0) * 60, A = d === "countup" ? i : Math.max(0, _ - i), E = o === "paused", M = o === "studying", N = o === "completed", O = o === "idle" && d !== "countup", W = N && d !== "countup" ? "00:00" : $c(A), K = E ? "Paused" : N ? "Complete" : M ? "In focus" : "Ready", G = E ? "Resume timer" : M ? "Pause timer" : "Start timer";
  return /* @__PURE__ */ k.jsxs("div", { className: "focus-session-dock liquid-glass", "aria-label": "Focus session controls", children: [
    /* @__PURE__ */ k.jsxs("div", { className: "dock-timer-block", children: [
      /* @__PURE__ */ k.jsxs("div", { className: "dock-eyebrow", children: [
        "POMODORO #",
        (m == null ? void 0 : m.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ k.jsxs("div", { className: "dock-status", children: [
        /* @__PURE__ */ k.jsx("span", { className: `dock-status-dot ${E || !M ? "is-paused" : ""}` }),
        K
      ] }),
      O ? /* @__PURE__ */ k.jsx(
        _P,
        {
          className: "dock-time-editor",
          valueSeconds: _,
          onChange: T,
          size: "dock",
          ariaLabel: "Set focus block length"
        }
      ) : /* @__PURE__ */ k.jsx("strong", { className: "dock-time", "aria-live": "off", children: W }),
      /* @__PURE__ */ k.jsx("div", { className: "dock-progress", "aria-hidden": "true", children: /* @__PURE__ */ k.jsx("span", { style: { width: `${TP(i, _)}%` } }) })
    ] }),
    /* @__PURE__ */ k.jsxs("div", { className: "dock-goal-block", children: [
      /* @__PURE__ */ k.jsx("span", { className: "dock-eyebrow", children: "TODAY'S GOAL" }),
      /* @__PURE__ */ k.jsx("strong", { children: p || "A quiet block for meaningful progress" }),
      /* @__PURE__ */ k.jsxs("span", { className: "dock-goal-meta", children: [
        d === "countup" ? "Count-up" : `${Wd(_)} block`,
        " · ",
        $c(i),
        " focused"
      ] })
    ] }),
    /* @__PURE__ */ k.jsxs("div", { className: "dock-action-block", children: [
      /* @__PURE__ */ k.jsxs(be, { className: "dock-action-button", onClick: S, "aria-label": w ? "Pause room audio" : "Play room audio", children: [
        w ? /* @__PURE__ */ k.jsx(jy, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ k.jsx(La, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: n != null && n.playing ? "Pause audio" : "Audio" })
      ] }),
      /* @__PURE__ */ k.jsxs(be, { className: "dock-action-button", onClick: () => M ? v() : g(), variant: "primary", "aria-label": G, children: [
        M ? /* @__PURE__ */ k.jsx(jy, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ k.jsx(zC, { size: 15, fill: "currentColor", "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: E ? "Resume" : M ? "Pause" : "Start" })
      ] }),
      /* @__PURE__ */ k.jsxs(be, { className: "dock-action-button", onClick: f, "aria-label": "Skip timer", children: [
        /* @__PURE__ */ k.jsx(QC, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Skip" })
      ] }),
      /* @__PURE__ */ k.jsxs(be, { className: "dock-action-button", onClick: l, "aria-label": "Reset timer", children: [
        /* @__PURE__ */ k.jsx($C, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Reset" })
      ] }),
      /* @__PURE__ */ k.jsxs(be, { className: "dock-focus-mode", onClick: e, "aria-label": "Enter distraction-free Focus Mode", children: [
        /* @__PURE__ */ k.jsx(ZC, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Focus Mode" })
      ] })
    ] })
  ] });
}
var AP = Object.defineProperty, mo = (e, n) => AP(e, "name", { value: n, configurable: !0 }), A0 = !!(typeof window < "u" && window.document && window.document.createElement);
function vr(e, n, { checkForDefaultPrevented: o = !0 } = {}) {
  return /* @__PURE__ */ mo(function(a) {
    if (e == null || e(a), o === !1 || !a || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  }, "handleEvent");
}
mo(vr, "composeEventHandlers");
function CP(e) {
  var n;
  if (!A0)
    throw new Error("Cannot access window outside of the DOM");
  return ((n = e == null ? void 0 : e.ownerDocument) == null ? void 0 : n.defaultView) ?? window;
}
mo(CP, "getOwnerWindow");
function Yc(e) {
  if (!A0)
    throw new Error("Cannot access document outside of the DOM");
  return (e == null ? void 0 : e.ownerDocument) ?? document;
}
mo(Yc, "getOwnerDocument");
function C0(e, n = !1) {
  const { activeElement: o } = Yc(e);
  if (!(o != null && o.nodeName))
    return null;
  if (P0(o) && o.contentDocument)
    return C0(o.contentDocument.body, n);
  if (n) {
    const i = o.getAttribute("aria-activedescendant");
    if (i) {
      const a = Yc(o).getElementById(i);
      if (a)
        return a;
    }
  }
  return o;
}
mo(C0, "getActiveElement");
function P0(e) {
  return e.tagName === "IFRAME";
}
mo(P0, "isFrame");
function Uy(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function PP(...e) {
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
  return C.useCallback(PP(...e), e);
}
function EP(e, n = []) {
  let o = [];
  function i(c, d) {
    const p = C.createContext(d);
    p.displayName = c + "Context";
    const m = o.length;
    o = [...o, d];
    const g = (l) => {
      var A;
      const { scope: f, children: S, ...w } = l, T = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[m]) || p, _ = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ k.jsx(T.Provider, { value: _, children: S });
    };
    g.displayName = c + "Provider";
    function v(l, f, S = {}) {
      var A;
      const { optional: w = !1 } = S, T = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[m]) || p, _ = C.useContext(T);
      if (_) return _;
      if (d !== void 0) return d;
      if (!w)
        throw new Error(`\`${l}\` must be used within \`${c}\``);
    }
    return [g, v];
  }
  const a = () => {
    const c = o.map((d) => C.createContext(d));
    return function(p) {
      const m = (p == null ? void 0 : p[e]) || c;
      return C.useMemo(
        () => ({ [`__scope${e}`]: { ...p, [e]: m } }),
        [p, m]
      );
    };
  };
  return a.scopeName = e, [i, bP(a, ...n)];
}
function bP(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const o = () => {
    const i = e.map((a) => ({
      useScope: a(),
      scopeName: a.scopeName
    }));
    return function(c) {
      const d = i.reduce((p, { useScope: m, scopeName: g }) => {
        const l = m(c)[`__scope${g}`];
        return { ...p, ...l };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return o.scopeName = n.scopeName, o;
}
var tn = globalThis != null && globalThis.document ? C.useLayoutEffect : () => {
}, MP = Tr[" useId ".trim().toString()] || (() => {
}), RP = 0;
function nc(e) {
  const [n, o] = C.useState(MP());
  return tn(() => {
    o((i) => i ?? String(RP++));
  }, [e]), e || (n ? `radix-${n}` : "");
}
var $y = Tr[" useEffectEvent ".trim().toString()], Hy = Tr[" useInsertionEffect ".trim().toString()];
function DP(e) {
  if (typeof $y == "function")
    return $y(e);
  const n = C.useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  return typeof Hy == "function" ? Hy(() => {
    n.current = e;
  }) : tn(() => {
    n.current = e;
  }), C.useMemo(() => ((...o) => {
    var i;
    return (i = n.current) == null ? void 0 : i.call(n, ...o);
  }), []);
}
var NP = Object.defineProperty, Ci = (e, n) => NP(e, "name", { value: n, configurable: !0 }), IP = Tr[" useInsertionEffect ".trim().toString()] || tn;
function E0({
  prop: e,
  defaultProp: n,
  onChange: o = /* @__PURE__ */ Ci(() => {
  }, "onChange"),
  caller: i
}) {
  const [a, c, d] = b0({
    defaultProp: n,
    onChange: o
  }), p = e !== void 0, m = p ? e : a, g = C.useCallback(
    (v) => {
      var l;
      if (p) {
        const f = M0(v) ? v(e) : v;
        f !== e && ((l = d.current) == null || l.call(d, f));
      } else
        c(v);
    },
    [p, e, c, d]
  );
  return [m, g];
}
Ci(E0, "useControllableState");
function b0({
  defaultProp: e,
  onChange: n
}) {
  const [o, i] = C.useState(e), a = C.useRef(o), c = C.useRef(n);
  return IP(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== o && ((d = c.current) == null || d.call(c, o), a.current = o);
  }, [o, a]), [o, i, c];
}
Ci(b0, "useUncontrolledState");
function M0(e) {
  return typeof e == "function";
}
Ci(M0, "isFunction");
var Wy = Symbol("RADIX:SYNC_STATE");
function FP(e, n, o, i) {
  const { prop: a, defaultProp: c, onChange: d, caller: p } = n, m = a !== void 0, g = DP(d), v = [{ ...o, state: c }];
  i && v.push(i);
  const [l, f] = C.useReducer(
    (_, A) => {
      if (A.type === Wy)
        return { ..._, state: A.state };
      const E = e(_, A);
      return m && !Object.is(E.state, _.state) && g(E.state), E;
    },
    ...v
  ), S = l.state, w = C.useRef(S);
  C.useEffect(() => {
    w.current !== S && (w.current = S, m || g(S));
  }, [S, w, m]);
  const T = C.useMemo(() => a !== void 0 ? { ...l, state: a } : l, [l, a]);
  return C.useEffect(() => {
    m && !Object.is(a, l.state) && f({ type: Wy, state: a });
  }, [a, l.state, m]), [T, f];
}
Ci(FP, "useControllableStateReducer");
var R0 = pg();
// @__NO_SIDE_EFFECTS__
function D0(e) {
  const n = C.forwardRef((o, i) => {
    let { children: a, ...c } = o, d = null, p = !1;
    const m = [];
    Gy(a) && typeof Ks == "function" && (a = Ks(a._payload)), C.Children.forEach(a, (f) => {
      var S;
      if (BP(f)) {
        p = !0;
        const w = f;
        let T = "child" in w.props ? w.props.child : w.props.children;
        Gy(T) && typeof Ks == "function" && (T = Ks(T._payload)), d = OP(w, T), m.push((S = d == null ? void 0 : d.props) == null ? void 0 : S.children);
      } else
        m.push(f);
    }), d ? d = C.cloneElement(d, void 0, m) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !p && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const g = d ? VP(d) : void 0, v = xt(i, g);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          p ? HP(e) : $P(e)
        );
      return a;
    }
    const l = LP(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = i ? v : g), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var jP = Symbol.for("radix.slottable"), OP = (e, n) => {
  if ("child" in e.props) {
    const o = e.props.child;
    return C.isValidElement(o) ? C.cloneElement(o, void 0, e.props.children(o.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function LP(e, n) {
  const o = { ...n };
  for (const i in n) {
    const a = e[i], c = n[i];
    /^on[A-Z]/.test(i) ? a && c ? o[i] = (...p) => {
      const m = c(...p);
      return a(...p), m;
    } : a && (o[i] = a) : i === "style" ? o[i] = { ...a, ...c } : i === "className" && (o[i] = [a, c].filter(Boolean).join(" "));
  }
  return { ...e, ...o };
}
function VP(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
function BP(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === jP;
}
var zP = Symbol.for("react.lazy");
function Gy(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === zP && "_payload" in e && UP(e._payload);
}
function UP(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var $P = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, HP = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, Ks = Tr[" use ".trim().toString()], WP = [
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
], yo = WP.reduce((e, n) => {
  const o = /* @__PURE__ */ D0(`Primitive.${n}`), i = C.forwardRef((a, c) => {
    const { asChild: d, ...p } = a, m = d ? o : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ k.jsx(m, { ...p, ref: c });
  });
  return i.displayName = `Primitive.${n}`, { ...e, [n]: i };
}, {});
function GP(e, n) {
  e && R0.flushSync(() => e.dispatchEvent(n));
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
var KP = Object.defineProperty, Ke = (e, n) => KP(e, "name", { value: n, configurable: !0 }), Qc = "dismissableLayer.update", YP = "dismissableLayer.pointerDownOutside", QP = "dismissableLayer.focusOutside", Ky, N0 = C.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
}), XP = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ Ke(function(n, o) {
    const {
      disableOutsidePointerEvents: i = !1,
      deferPointerDownOutside: a = !1,
      onEscapeKeyDown: c,
      onPointerDownOutside: d,
      onFocusOutside: p,
      onInteractOutside: m,
      onDismiss: g,
      ...v
    } = n, l = C.useContext(N0), [f, S] = C.useState(null), w = (f == null ? void 0 : f.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, T] = C.useState({}), _ = xt(o, S), A = Array.from(l.layers), [E] = [
      ...l.layersWithOutsidePointerEventsDisabled
    ].slice(-1), M = E ? A.indexOf(E) : -1, N = f ? A.indexOf(f) : -1, O = l.layersWithOutsidePointerEventsDisabled.size > 0, W = N >= M, K = C.useRef(!1), G = F0(
      (J) => {
        d == null || d(J), m == null || m(J), J.defaultPrevented || g == null || g();
      },
      {
        ownerDocument: w,
        deferPointerDownOutside: a,
        isDeferredPointerDownOutsideRef: K,
        dismissableSurfaces: l.dismissableSurfaces,
        shouldHandlePointerDownOutside: C.useCallback(
          (J) => {
            if (!(J instanceof Node))
              return !1;
            const de = [...l.branches].some(
              (ue) => ue.contains(J)
            );
            return W && !de;
          },
          [l.branches, W]
        )
      }
    ), L = j0((J) => {
      if (a && K.current)
        return;
      const de = J.target;
      [...l.branches].some((_e) => _e.contains(de)) || (p == null || p(J), m == null || m(J), J.defaultPrevented || g == null || g());
    }, w), Q = f ? N === A.length - 1 : !1, ae = vi((J) => {
      J.key === "Escape" && (c == null || c(J), !J.defaultPrevented && g && (J.preventDefault(), g()));
    });
    return C.useEffect(() => {
      if (Q)
        return w.addEventListener("keydown", ae, { capture: !0 }), () => w.removeEventListener("keydown", ae, { capture: !0 });
    }, [w, Q, ae]), C.useEffect(() => {
      if (f)
        return i && (l.layersWithOutsidePointerEventsDisabled.size === 0 && (Ky = w.body.style.pointerEvents, w.body.style.pointerEvents = "none"), l.layersWithOutsidePointerEventsDisabled.add(f)), l.layers.add(f), Xc(), () => {
          i && (l.layersWithOutsidePointerEventsDisabled.delete(f), l.layersWithOutsidePointerEventsDisabled.size === 0 && (w.body.style.pointerEvents = Ky));
        };
    }, [f, w, i, l]), C.useEffect(() => () => {
      f && (l.layers.delete(f), l.layersWithOutsidePointerEventsDisabled.delete(f), Xc());
    }, [f, l]), C.useEffect(() => {
      const J = /* @__PURE__ */ Ke(() => T({}), "handleUpdate");
      return document.addEventListener(Qc, J), () => document.removeEventListener(Qc, J);
    }, []), /* @__PURE__ */ k.jsx(
      yo.div,
      {
        ...v,
        ref: _,
        style: {
          pointerEvents: O ? W ? "auto" : "none" : void 0,
          ...n.style
        },
        onFocusCapture: vr(n.onFocusCapture, L.onFocusCapture),
        onBlurCapture: vr(n.onBlurCapture, L.onBlurCapture),
        onPointerDownCapture: vr(
          n.onPointerDownCapture,
          G.onPointerDownCapture
        )
      }
    );
  }, "DismissableLayer")
);
function I0() {
  const e = C.useContext(N0), [n, o] = C.useState(null);
  return C.useEffect(() => {
    if (n)
      return e.dismissableSurfaces.add(n), () => {
        e.dismissableSurfaces.delete(n);
      };
  }, [n, e.dismissableSurfaces]), o;
}
Ke(I0, "useDismissableLayerSurface");
var ZP = /* @__PURE__ */ Ke(() => !0, "IS_TRUE");
function F0(e, n) {
  const {
    ownerDocument: o = globalThis == null ? void 0 : globalThis.document,
    deferPointerDownOutside: i = !1,
    isDeferredPointerDownOutsideRef: a,
    dismissableSurfaces: c,
    shouldHandlePointerDownOutside: d = ZP
  } = n, p = vi(e), m = C.useRef(!1), g = C.useRef(!1), v = C.useRef(/* @__PURE__ */ new Map()), l = C.useRef(() => {
  });
  return C.useEffect(() => {
    function f() {
      g.current = !1, a.current = !1, v.current.clear();
    }
    Ke(f, "resetOutsideInteraction");
    function S() {
      return Array.from(v.current.values()).some(Boolean);
    }
    Ke(S, "isOutsideInteractionIntercepted");
    function w(M) {
      if (!g.current)
        return;
      const N = M.target;
      N instanceof Node && [...c].some((W) => W.contains(N)) || v.current.set(M.type, !0), M.type === "click" && window.setTimeout(() => {
        g.current && l.current();
      }, 0);
    }
    Ke(w, "handleInteractionCapture");
    function T(M) {
      g.current && v.current.set(M.type, !1);
    }
    Ke(T, "handleInteractionBubble");
    const _ = /* @__PURE__ */ Ke((M) => {
      if (M.target && !m.current) {
        let N = function() {
          o.removeEventListener("click", l.current);
          const W = S();
          f(), W || Gd(
            YP,
            p,
            O,
            { discrete: !0 }
          );
        };
        if (Ke(N, "handleAndDispatchPointerDownOutsideEvent"), !d(M.target)) {
          o.removeEventListener("click", l.current), f(), m.current = !1;
          return;
        }
        const O = { originalEvent: M };
        g.current = !0, a.current = i && M.button === 0, v.current.clear(), !i || M.button !== 0 ? N() : (o.removeEventListener("click", l.current), l.current = N, o.addEventListener("click", l.current, { once: !0 }));
      } else
        o.removeEventListener("click", l.current), f();
      m.current = !1;
    }, "handlePointerDown"), A = [
      "pointerup",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "click"
    ];
    for (const M of A)
      o.addEventListener(M, w, !0), o.addEventListener(M, T);
    const E = window.setTimeout(() => {
      o.addEventListener("pointerdown", _);
    }, 0);
    return () => {
      window.clearTimeout(E), o.removeEventListener("pointerdown", _), o.removeEventListener("click", l.current);
      for (const M of A)
        o.removeEventListener(M, w, !0), o.removeEventListener(M, T);
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
    onPointerDownCapture: /* @__PURE__ */ Ke(() => m.current = !0, "onPointerDownCapture")
  };
}
Ke(F0, "usePointerDownOutside");
function j0(e, n = globalThis == null ? void 0 : globalThis.document) {
  const o = vi(e), i = C.useRef(!1);
  return C.useEffect(() => {
    const a = /* @__PURE__ */ Ke((c) => {
      c.target && !i.current && Gd(QP, o, { originalEvent: c }, {
        discrete: !1
      });
    }, "handleFocus");
    return n.addEventListener("focusin", a), () => n.removeEventListener("focusin", a);
  }, [n, o]), {
    onFocusCapture: /* @__PURE__ */ Ke(() => i.current = !0, "onFocusCapture"),
    onBlurCapture: /* @__PURE__ */ Ke(() => i.current = !1, "onBlurCapture")
  };
}
Ke(j0, "useFocusOutside");
function Xc() {
  const e = new CustomEvent(Qc);
  document.dispatchEvent(e);
}
Ke(Xc, "dispatchUpdate");
function Gd(e, n, o, { discrete: i }) {
  const a = o.originalEvent.target, c = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: o });
  n && a.addEventListener(e, n, { once: !0 }), i ? GP(a, c) : a.dispatchEvent(c);
}
Ke(Gd, "handleAndDispatchCustomEvent");
var JP = Object.defineProperty, at = (e, n) => JP(e, "name", { value: n, configurable: !0 }), rc = "focusScope.autoFocusOnMount", oc = "focusScope.autoFocusOnUnmount", Yy = { bubbles: !1, cancelable: !0 }, qP = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ at(function(n, o) {
    const {
      loop: i = !1,
      trapped: a = !1,
      onMountAutoFocus: c,
      onUnmountAutoFocus: d,
      ...p
    } = n, [m, g] = C.useState(null), v = vi(c), l = vi(d), f = C.useRef(null), S = xt(o, g), w = C.useRef({
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
        let _ = function(N) {
          if (w.paused || !m) return;
          const O = N.target;
          m.contains(O) ? f.current = O : fn(f.current, { select: !0 });
        }, A = function(N) {
          if (w.paused || !m) return;
          const O = N.relatedTarget;
          O !== null && (m.contains(O) || fn(f.current, { select: !0 }));
        }, E = function(N) {
          if (document.activeElement === document.body)
            for (const W of N)
              W.removedNodes.length > 0 && fn(m);
        };
        at(_, "handleFocusIn"), at(A, "handleFocusOut"), at(E, "handleMutations"), document.addEventListener("focusin", _), document.addEventListener("focusout", A);
        const M = new MutationObserver(E);
        return m && M.observe(m, { childList: !0, subtree: !0 }), () => {
          document.removeEventListener("focusin", _), document.removeEventListener("focusout", A), M.disconnect();
        };
      }
    }, [a, m, w.paused]), C.useEffect(() => {
      if (m) {
        Qy.add(w);
        const _ = document.activeElement;
        if (!m.contains(_)) {
          const E = new CustomEvent(rc, Yy);
          m.addEventListener(rc, v), m.dispatchEvent(E), E.defaultPrevented || (O0(U0(Kd(m)), { select: !0 }), document.activeElement === _ && fn(m));
        }
        return () => {
          m.removeEventListener(rc, v), setTimeout(() => {
            const E = new CustomEvent(oc, Yy);
            m.addEventListener(oc, l), m.dispatchEvent(E), E.defaultPrevented || fn(_ ?? document.body, { select: !0 }), m.removeEventListener(oc, l), Qy.remove(w);
          }, 0);
        };
      }
    }, [m, v, l, w]);
    const T = C.useCallback(
      (_) => {
        if (!i && !a || w.paused) return;
        const A = _.key === "Tab" && !_.altKey && !_.ctrlKey && !_.metaKey, E = document.activeElement;
        if (A && E) {
          const M = _.currentTarget, [N, O] = L0(M);
          N && O ? !_.shiftKey && E === O ? (_.preventDefault(), i && fn(N, { select: !0 })) : _.shiftKey && E === N && (_.preventDefault(), i && fn(O, { select: !0 })) : E === M && _.preventDefault();
        }
      },
      [i, a, w.paused]
    );
    return /* @__PURE__ */ k.jsx(yo.div, { tabIndex: -1, ...p, ref: S, onKeyDown: T });
  }, "FocusScope")
);
function O0(e, { select: n = !1 } = {}) {
  const o = document.activeElement;
  for (const i of e)
    if (fn(i, { select: n }), document.activeElement !== o) return;
}
at(O0, "focusFirst");
function L0(e) {
  const n = Kd(e), o = Zc(n, e), i = Zc(n.reverse(), e);
  return [o, i];
}
at(L0, "getTabbableEdges");
function Kd(e) {
  const n = [], o = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: /* @__PURE__ */ at((i) => {
      const a = i.tagName === "INPUT" && i.type === "hidden";
      return i.disabled || i.hidden || a ? NodeFilter.FILTER_SKIP : i.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }, "acceptNode")
  });
  for (; o.nextNode(); ) n.push(o.currentNode);
  return n;
}
at(Kd, "getTabbableCandidates");
function Zc(e, n) {
  const o = typeof n.checkVisibility == "function" && n.checkVisibility({ checkVisibilityCSS: !0 });
  for (const i of e)
    if (!(o ? !i.checkVisibility({ checkVisibilityCSS: !0 }) : V0(i, { upTo: n })))
      return i;
}
at(Zc, "findVisible");
function V0(e, { upTo: n }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (n !== void 0 && e === n) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
at(V0, "isHidden");
function B0(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
at(B0, "isSelectableInput");
function fn(e, { select: n = !1 } = {}) {
  if (e && e.focus) {
    const o = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== o && B0(e) && n && e.select();
  }
}
at(fn, "focus");
var Qy = z0();
function z0() {
  let e = [];
  return {
    add(n) {
      const o = e[0];
      n !== o && (o == null || o.pause()), e = Jc(e, n), e.unshift(n);
    },
    remove(n) {
      var o;
      e = Jc(e, n), (o = e[0]) == null || o.resume();
    }
  };
}
at(z0, "createFocusScopesStack");
function Jc(e, n) {
  const o = [...e], i = o.indexOf(n);
  return i !== -1 && o.splice(i, 1), o;
}
at(Jc, "arrayRemove");
function U0(e) {
  return e.filter((n) => n.tagName !== "A");
}
at(U0, "removeLinks");
var eE = Object.defineProperty, tE = (e, n) => eE(e, "name", { value: n, configurable: !0 }), nE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ tE(function(n, o) {
    var m;
    const { container: i, ...a } = n, [c, d] = C.useState(!1);
    tn(() => d(!0), []);
    const p = i || c && ((m = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : m.body);
    return p ? R0.createPortal(/* @__PURE__ */ k.jsx(yo.div, { ...a, ref: o }), p) : null;
  }, "Portal")
), rE = Object.defineProperty, hn = (e, n) => rE(e, "name", { value: n, configurable: !0 });
function $0(e, n) {
  return C.useReducer((o, i) => n[o][i] ?? o, e);
}
hn($0, "useStateMachine");
var Yd = /* @__PURE__ */ hn((e) => {
  const { present: n, children: o } = e, i = H0(n), a = typeof o == "function" ? o({ present: i.isPresent }) : C.Children.only(o), c = W0(i.ref, G0(a));
  return typeof o == "function" || i.isPresent ? C.cloneElement(a, { ref: c }) : null;
}, "Presence");
function H0(e) {
  const [n, o] = C.useState(), i = C.useRef(null), a = C.useRef(e), c = C.useRef("none"), d = C.useRef(void 0), p = e ? "mounted" : "unmounted", [m, g] = $0(p, {
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
    m === "mounted" ? (c.current = d.current ?? to(i.current), d.current = void 0) : c.current = "none";
  }, [m]), tn(() => {
    const v = i.current, l = a.current;
    if (l !== e) {
      const S = c.current, w = to(v);
      e ? (d.current = w, g("MOUNT")) : w === "none" || (v == null ? void 0 : v.display) === "none" ? g("UNMOUNT") : g(l && S !== w ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
    }
  }, [e, g]), tn(() => {
    if (n) {
      let v;
      const l = n.ownerDocument.defaultView ?? window, f = /* @__PURE__ */ hn((w) => {
        const _ = to(i.current).includes(CSS.escape(w.animationName));
        if (w.target === n && _ && (g("ANIMATION_END"), !a.current)) {
          const A = n.style.animationFillMode;
          n.style.animationFillMode = "forwards", v = l.setTimeout(() => {
            n.style.animationFillMode === "forwards" && (n.style.animationFillMode = A);
          });
        }
      }, "handleAnimationEnd"), S = /* @__PURE__ */ hn((w) => {
        w.target === n && (c.current = to(i.current));
      }, "handleAnimationStart");
      return n.addEventListener("animationstart", S), n.addEventListener("animationcancel", f), n.addEventListener("animationend", f), () => {
        l.clearTimeout(v), n.removeEventListener("animationstart", S), n.removeEventListener("animationcancel", f), n.removeEventListener("animationend", f);
      };
    } else
      g("ANIMATION_END");
  }, [n, g]), {
    isPresent: ["mounted", "unmountSuspended"].includes(m),
    ref: C.useCallback((v) => {
      if (v) {
        const l = getComputedStyle(v);
        i.current = l, d.current = to(l);
      } else
        i.current = null;
      o(v);
    }, [])
  };
}
hn(H0, "usePresence");
function qc(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
hn(qc, "setRef");
function W0(...e) {
  const n = C.useRef(e);
  return n.current = e, C.useCallback((o) => {
    const i = n.current;
    let a = !1;
    const c = i.map((d) => {
      const p = qc(d, o);
      return !a && typeof p == "function" && (a = !0), p;
    });
    if (a)
      return () => {
        for (let d = 0; d < c.length; d++) {
          const p = c[d];
          typeof p == "function" ? p() : qc(i[d], null);
        }
      };
  }, []);
}
hn(W0, "useStableComposedRefs");
function to(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
hn(to, "getAnimationName");
function G0(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
hn(G0, "getElementRef");
var Ys = 0, Kt = null;
function oE() {
  C.useEffect(() => {
    Kt || (Kt = { start: Xy(), end: Xy() });
    const { start: e, end: n } = Kt;
    return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== n && document.body.insertAdjacentElement("beforeend", n), Ys++, () => {
      Ys === 1 && (Kt == null || Kt.start.remove(), Kt == null || Kt.end.remove(), Kt = null), Ys = Math.max(0, Ys - 1);
    };
  }, []);
}
function Xy() {
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
function K0(e, n) {
  var o = {};
  for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && n.indexOf(i) < 0 && (o[i] = e[i]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var a = 0, i = Object.getOwnPropertySymbols(e); a < i.length; a++)
      n.indexOf(i[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, i[a]) && (o[i[a]] = e[i[a]]);
  return o;
}
function iE(e, n, o) {
  if (o || arguments.length === 2) for (var i = 0, a = n.length, c; i < a; i++)
    (c || !(i in n)) && (c || (c = Array.prototype.slice.call(n, 0, i)), c[i] = n[i]);
  return e.concat(c || Array.prototype.slice.call(n));
}
var ca = "right-scroll-bar-position", da = "width-before-scroll-bar", sE = "with-scroll-bars-hidden", aE = "--removed-body-scroll-bar-size";
function ic(e, n) {
  return typeof e == "function" ? e(n) : e && (e.current = n), e;
}
function lE(e, n) {
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
var uE = typeof window < "u" ? C.useLayoutEffect : C.useEffect, Zy = /* @__PURE__ */ new WeakMap();
function cE(e, n) {
  var o = lE(null, function(i) {
    return e.forEach(function(a) {
      return ic(a, i);
    });
  });
  return uE(function() {
    var i = Zy.get(o);
    if (i) {
      var a = new Set(i), c = new Set(e), d = o.current;
      a.forEach(function(p) {
        c.has(p) || ic(p, null);
      }), c.forEach(function(p) {
        a.has(p) || ic(p, d);
      });
    }
    Zy.set(o, e);
  }, [e]), o;
}
function dE(e) {
  return e;
}
function fE(e, n) {
  n === void 0 && (n = dE);
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
      var m = function() {
        var v = d;
        d = [], v.forEach(c);
      }, g = function() {
        return Promise.resolve().then(m);
      };
      g(), o = {
        push: function(v) {
          d.push(v), g();
        },
        filter: function(v) {
          return d = d.filter(v), o;
        }
      };
    }
  };
  return a;
}
function pE(e) {
  e === void 0 && (e = {});
  var n = fE(null);
  return n.options = Jt({ async: !0, ssr: !1 }, e), n;
}
var Y0 = function(e) {
  var n = e.sideCar, o = K0(e, ["sideCar"]);
  if (!n)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var i = n.read();
  if (!i)
    throw new Error("Sidecar medium not found");
  return C.createElement(i, Jt({}, o));
};
Y0.isSideCarExport = !0;
function hE(e, n) {
  return e.useMedium(n), Y0;
}
var Q0 = pE(), sc = function() {
}, Va = C.forwardRef(function(e, n) {
  var o = C.useRef(null), i = C.useState({
    onScrollCapture: sc,
    onWheelCapture: sc,
    onTouchMoveCapture: sc
  }), a = i[0], c = i[1], d = e.forwardProps, p = e.children, m = e.className, g = e.removeScrollBar, v = e.enabled, l = e.shards, f = e.sideCar, S = e.noRelative, w = e.noIsolation, T = e.inert, _ = e.allowPinchZoom, A = e.as, E = A === void 0 ? "div" : A, M = e.gapMode, N = K0(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), O = f, W = cE([o, n]), K = Jt(Jt({}, N), a);
  return C.createElement(
    C.Fragment,
    null,
    v && C.createElement(O, { sideCar: Q0, removeScrollBar: g, shards: l, noRelative: S, noIsolation: w, inert: T, setCallbacks: c, allowPinchZoom: !!_, lockRef: o, gapMode: M }),
    d ? C.cloneElement(C.Children.only(p), Jt(Jt({}, K), { ref: W })) : C.createElement(E, Jt({}, K, { className: m, ref: W }), p)
  );
});
Va.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
Va.classNames = {
  fullWidth: da,
  zeroRight: ca
};
var mE = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function yE() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var n = mE();
  return n && e.setAttribute("nonce", n), e;
}
function gE(e, n) {
  e.styleSheet ? e.styleSheet.cssText = n : e.appendChild(document.createTextNode(n));
}
function vE(e) {
  var n = document.head || document.getElementsByTagName("head")[0];
  n.appendChild(e);
}
var SE = function() {
  var e = 0, n = null;
  return {
    add: function(o) {
      e == 0 && (n = yE()) && (gE(n, o), vE(n)), e++;
    },
    remove: function() {
      e--, !e && n && (n.parentNode && n.parentNode.removeChild(n), n = null);
    }
  };
}, wE = function() {
  var e = SE();
  return function(n, o) {
    C.useEffect(function() {
      return e.add(n), function() {
        e.remove();
      };
    }, [n && o]);
  };
}, X0 = function() {
  var e = wE(), n = function(o) {
    var i = o.styles, a = o.dynamic;
    return e(i, a), null;
  };
  return n;
}, xE = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, ac = function(e) {
  return parseInt(e || "", 10) || 0;
}, _E = function(e) {
  var n = window.getComputedStyle(document.body), o = n[e === "padding" ? "paddingLeft" : "marginLeft"], i = n[e === "padding" ? "paddingTop" : "marginTop"], a = n[e === "padding" ? "paddingRight" : "marginRight"];
  return [ac(o), ac(i), ac(a)];
}, TE = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return xE;
  var n = _E(e), o = document.documentElement.clientWidth, i = window.innerWidth;
  return {
    left: n[0],
    top: n[1],
    right: n[2],
    gap: Math.max(0, i - o + n[2] - n[0])
  };
}, kE = X0(), ao = "data-scroll-locked", AE = function(e, n, o, i) {
  var a = e.left, c = e.top, d = e.right, p = e.gap;
  return o === void 0 && (o = "margin"), `
  .`.concat(sE, ` {
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
    `).concat(aE, ": ").concat(p, `px;
  }
`);
}, Jy = function() {
  var e = parseInt(document.body.getAttribute(ao) || "0", 10);
  return isFinite(e) ? e : 0;
}, CE = function() {
  C.useEffect(function() {
    return document.body.setAttribute(ao, (Jy() + 1).toString()), function() {
      var e = Jy() - 1;
      e <= 0 ? document.body.removeAttribute(ao) : document.body.setAttribute(ao, e.toString());
    };
  }, []);
}, PE = function(e) {
  var n = e.noRelative, o = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
  CE();
  var c = C.useMemo(function() {
    return TE(a);
  }, [a]);
  return C.createElement(kE, { styles: AE(c, !n, a, o ? "" : "!important") });
}, ed = !1;
if (typeof window < "u")
  try {
    var Qs = Object.defineProperty({}, "passive", {
      get: function() {
        return ed = !0, !0;
      }
    });
    window.addEventListener("test", Qs, Qs), window.removeEventListener("test", Qs, Qs);
  } catch {
    ed = !1;
  }
var Zr = ed ? { passive: !1 } : !1, EE = function(e) {
  return e.tagName === "TEXTAREA";
}, Z0 = function(e, n) {
  if (!(e instanceof Element))
    return !1;
  var o = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    o[n] !== "hidden" && // contains scroll inside self
    !(o.overflowY === o.overflowX && !EE(e) && o[n] === "visible")
  );
}, bE = function(e) {
  return Z0(e, "overflowY");
}, ME = function(e) {
  return Z0(e, "overflowX");
}, qy = function(e, n) {
  var o = n.ownerDocument, i = n;
  do {
    typeof ShadowRoot < "u" && i instanceof ShadowRoot && (i = i.host);
    var a = J0(e, i);
    if (a) {
      var c = q0(e, i), d = c[1], p = c[2];
      if (d > p)
        return !0;
    }
    i = i.parentNode;
  } while (i && i !== o.body);
  return !1;
}, RE = function(e) {
  var n = e.scrollTop, o = e.scrollHeight, i = e.clientHeight;
  return [
    n,
    o,
    i
  ];
}, DE = function(e) {
  var n = e.scrollLeft, o = e.scrollWidth, i = e.clientWidth;
  return [
    n,
    o,
    i
  ];
}, J0 = function(e, n) {
  return e === "v" ? bE(n) : ME(n);
}, q0 = function(e, n) {
  return e === "v" ? RE(n) : DE(n);
}, NE = function(e, n) {
  return e === "h" && n === "rtl" ? -1 : 1;
}, IE = function(e, n, o, i, a) {
  var c = NE(e, window.getComputedStyle(n).direction), d = c * i, p = o.target, m = n.contains(p), g = !1, v = d > 0, l = 0, f = 0;
  do {
    if (!p)
      break;
    var S = q0(e, p), w = S[0], T = S[1], _ = S[2], A = T - _ - c * w;
    (w || A) && J0(e, p) && (l += A, f += w);
    var E = p.parentNode;
    p = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !m && p !== document.body || // self content
    m && (n.contains(p) || n === p)
  );
  return (v && Math.abs(l) < 1 || !v && Math.abs(f) < 1) && (g = !0), g;
}, Xs = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, eg = function(e) {
  return [e.deltaX, e.deltaY];
}, tg = function(e) {
  return e && "current" in e ? e.current : e;
}, FE = function(e, n) {
  return e[0] === n[0] && e[1] === n[1];
}, jE = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, OE = 0, Jr = [];
function LE(e) {
  var n = C.useRef([]), o = C.useRef([0, 0]), i = C.useRef(), a = C.useState(OE++)[0], c = C.useState(X0)[0], d = C.useRef(e);
  C.useEffect(function() {
    d.current = e;
  }, [e]), C.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(a));
      var T = iE([e.lockRef.current], (e.shards || []).map(tg), !0).filter(Boolean);
      return T.forEach(function(_) {
        return _.classList.add("allow-interactivity-".concat(a));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(a)), T.forEach(function(_) {
          return _.classList.remove("allow-interactivity-".concat(a));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var p = C.useCallback(function(T, _) {
    if ("touches" in T && T.touches.length === 2 || T.type === "wheel" && T.ctrlKey)
      return !d.current.allowPinchZoom;
    var A = Xs(T), E = o.current, M = "deltaX" in T ? T.deltaX : E[0] - A[0], N = "deltaY" in T ? T.deltaY : E[1] - A[1], O, W = T.target, K = Math.abs(M) > Math.abs(N) ? "h" : "v";
    if ("touches" in T && K === "h" && W.type === "range")
      return !1;
    var G = window.getSelection(), L = G && G.anchorNode, Q = L ? L === W || L.contains(W) : !1;
    if (Q)
      return !1;
    var ae = qy(K, W);
    if (!ae)
      return !0;
    if (ae ? O = K : (O = K === "v" ? "h" : "v", ae = qy(K, W)), !ae)
      return !1;
    if (!i.current && "changedTouches" in T && (M || N) && (i.current = O), !O)
      return !0;
    var J = i.current || O;
    return IE(J, _, T, J === "h" ? M : N);
  }, []), m = C.useCallback(function(T) {
    var _ = T;
    if (!(!Jr.length || Jr[Jr.length - 1] !== c)) {
      var A = "deltaY" in _ ? eg(_) : Xs(_), E = n.current.filter(function(O) {
        return O.name === _.type && (O.target === _.target || _.target === O.shadowParent) && FE(O.delta, A);
      })[0];
      if (E && E.should) {
        _.cancelable && _.preventDefault();
        return;
      }
      if (!E) {
        var M = (d.current.shards || []).map(tg).filter(Boolean).filter(function(O) {
          return O.contains(_.target);
        }), N = M.length > 0 ? p(_, M[0]) : !d.current.noIsolation;
        N && _.cancelable && _.preventDefault();
      }
    }
  }, []), g = C.useCallback(function(T, _, A, E) {
    var M = { name: T, delta: _, target: A, should: E, shadowParent: VE(A) };
    n.current.push(M), setTimeout(function() {
      n.current = n.current.filter(function(N) {
        return N !== M;
      });
    }, 1);
  }, []), v = C.useCallback(function(T) {
    o.current = Xs(T), i.current = void 0;
  }, []), l = C.useCallback(function(T) {
    g(T.type, eg(T), T.target, p(T, e.lockRef.current));
  }, []), f = C.useCallback(function(T) {
    g(T.type, Xs(T), T.target, p(T, e.lockRef.current));
  }, []);
  C.useEffect(function() {
    return Jr.push(c), e.setCallbacks({
      onScrollCapture: l,
      onWheelCapture: l,
      onTouchMoveCapture: f
    }), document.addEventListener("wheel", m, Zr), document.addEventListener("touchmove", m, Zr), document.addEventListener("touchstart", v, Zr), function() {
      Jr = Jr.filter(function(T) {
        return T !== c;
      }), document.removeEventListener("wheel", m, Zr), document.removeEventListener("touchmove", m, Zr), document.removeEventListener("touchstart", v, Zr);
    };
  }, []);
  var S = e.removeScrollBar, w = e.inert;
  return C.createElement(
    C.Fragment,
    null,
    w ? C.createElement(c, { styles: jE(a) }) : null,
    S ? C.createElement(PE, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function VE(e) {
  for (var n = null; e !== null; )
    e instanceof ShadowRoot && (n = e.host, e = e.host), e = e.parentNode;
  return n;
}
const BE = hE(Q0, LE);
var eS = C.forwardRef(function(e, n) {
  return C.createElement(Va, Jt({}, e, { ref: n, sideCar: BE }));
});
eS.classNames = Va.classNames;
var zE = function(e) {
  if (typeof document > "u")
    return null;
  var n = Array.isArray(e) ? e[0] : e;
  return n.ownerDocument.body;
}, qr = /* @__PURE__ */ new WeakMap(), Zs = /* @__PURE__ */ new WeakMap(), Js = {}, lc = 0, tS = function(e) {
  return e && (e.host || tS(e.parentNode));
}, UE = function(e, n) {
  return n.map(function(o) {
    if (e.contains(o))
      return o;
    var i = tS(o);
    return i && e.contains(i) ? i : (console.error("aria-hidden", o, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(o) {
    return !!o;
  });
}, $E = function(e, n, o, i) {
  var a = UE(n, Array.isArray(e) ? e : [e]);
  Js[o] || (Js[o] = /* @__PURE__ */ new WeakMap());
  var c = Js[o], d = [], p = /* @__PURE__ */ new Set(), m = new Set(a), g = function(l) {
    !l || p.has(l) || (p.add(l), g(l.parentNode));
  };
  a.forEach(g);
  var v = function(l) {
    !l || m.has(l) || Array.prototype.forEach.call(l.children, function(f) {
      if (p.has(f))
        v(f);
      else
        try {
          var S = f.getAttribute(i), w = S !== null && S !== "false", T = (qr.get(f) || 0) + 1, _ = (c.get(f) || 0) + 1;
          qr.set(f, T), c.set(f, _), d.push(f), T === 1 && w && Zs.set(f, !0), _ === 1 && f.setAttribute(o, "true"), w || f.setAttribute(i, "true");
        } catch (A) {
          console.error("aria-hidden: cannot operate on ", f, A);
        }
    });
  };
  return v(n), p.clear(), lc++, function() {
    d.forEach(function(l) {
      var f = qr.get(l) - 1, S = c.get(l) - 1;
      qr.set(l, f), c.set(l, S), f || (Zs.has(l) || l.removeAttribute(i), Zs.delete(l)), S || l.removeAttribute(o);
    }), lc--, lc || (qr = /* @__PURE__ */ new WeakMap(), qr = /* @__PURE__ */ new WeakMap(), Zs = /* @__PURE__ */ new WeakMap(), Js = {});
  };
}, HE = function(e, n, o) {
  o === void 0 && (o = "data-aria-hidden");
  var i = Array.from(Array.isArray(e) ? e : [e]), a = zE(e);
  return a ? (i.push.apply(i, Array.from(a.querySelectorAll("[aria-live], script"))), $E(i, a, o, "aria-hidden")) : function() {
    return null;
  };
}, WE = Object.defineProperty, zt = (e, n) => WE(e, "name", { value: n, configurable: !0 }), Qd = "Dialog", [nS] = EP(Qd), [GE, mn] = nS(Qd), KE = /* @__PURE__ */ zt((e) => {
  const {
    __scopeDialog: n,
    children: o,
    open: i,
    defaultOpen: a,
    onOpenChange: c,
    modal: d = !0
  } = e, p = C.useRef(null), m = C.useRef(null), [g, v] = E0({
    prop: i,
    defaultProp: a ?? !1,
    onChange: c,
    caller: Qd
  }), [l, f] = C.useState(0), [S, w] = C.useState(0);
  return /* @__PURE__ */ k.jsx(
    GE,
    {
      scope: n,
      triggerRef: p,
      contentRef: m,
      contentId: nc(),
      titleId: nc(),
      descriptionId: nc(),
      titlePresent: l > 0,
      descriptionPresent: S > 0,
      setTitleCount: f,
      setDescriptionCount: w,
      open: g,
      onOpenChange: v,
      onOpenToggle: C.useCallback(() => v((T) => !T), [v]),
      modal: d,
      children: o
    }
  );
}, "Dialog"), rS = "DialogPortal", [YE, oS] = nS(rS, {
  forceMount: void 0
}), QE = /* @__PURE__ */ zt((e) => {
  const { __scopeDialog: n, forceMount: o, children: i, container: a } = e, c = mn(rS, n);
  return /* @__PURE__ */ k.jsx(YE, { scope: n, forceMount: o, children: C.Children.map(i, (d) => /* @__PURE__ */ k.jsx(Yd, { present: o || c.open, children: /* @__PURE__ */ k.jsx(nE, { asChild: !0, container: a, children: d }) })) });
}, "DialogPortal"), td = "DialogOverlay", XE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const i = oS(td, n.__scopeDialog), { forceMount: a = i.forceMount, ...c } = n, d = mn(td, n.__scopeDialog);
    return d.modal ? /* @__PURE__ */ k.jsx(Yd, { present: a || d.open, children: /* @__PURE__ */ k.jsx(JE, { ...c, ref: o }) }) : null;
  }, "DialogOverlay")
), ZE = /* @__PURE__ */ D0("DialogOverlay.RemoveScroll"), JE = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = mn(td, i), d = I0(), p = xt(o, d);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ k.jsx(eS, { as: ZE, allowPinchZoom: !0, shards: [c.contentRef], children: /* @__PURE__ */ k.jsx(
        yo.div,
        {
          "data-state": Xd(c.open),
          ...a,
          ref: p,
          style: { pointerEvents: "auto", ...a.style }
        }
      ) })
    );
  }, "DialogOverlayImpl")
), Si = "DialogContent", qE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const i = oS(Si, n.__scopeDialog), { forceMount: a = i.forceMount, ...c } = n, d = mn(Si, n.__scopeDialog);
    return /* @__PURE__ */ k.jsx(Yd, { present: a || d.open, children: d.modal ? /* @__PURE__ */ k.jsx(eb, { ...c, ref: o }) : /* @__PURE__ */ k.jsx(tb, { ...c, ref: o }) });
  }, "DialogContent")
), eb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const i = mn(Si, n.__scopeDialog), a = C.useRef(null), c = xt(o, i.contentRef, a);
    return C.useEffect(() => {
      const d = a.current;
      if (d) return HE(d);
    }, []), /* @__PURE__ */ k.jsx(
      iS,
      {
        ...n,
        ref: c,
        trapFocus: i.open,
        disableOutsidePointerEvents: i.open,
        onCloseAutoFocus: vr(n.onCloseAutoFocus, (d) => {
          var p;
          d.preventDefault(), (p = i.triggerRef.current) == null || p.focus();
        }),
        onPointerDownOutside: vr(n.onPointerDownOutside, (d) => {
          const p = d.detail.originalEvent, m = p.button === 0 && p.ctrlKey === !0;
          (p.button === 2 || m) && d.preventDefault();
        }),
        onFocusOutside: vr(
          n.onFocusOutside,
          (d) => d.preventDefault()
        )
      }
    );
  }, "DialogContentModal")
), tb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const i = mn(Si, n.__scopeDialog), a = C.useRef(!1), c = C.useRef(!1);
    return /* @__PURE__ */ k.jsx(
      iS,
      {
        ...n,
        ref: o,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (d) => {
          var p, m;
          (p = n.onCloseAutoFocus) == null || p.call(n, d), d.defaultPrevented || (a.current || (m = i.triggerRef.current) == null || m.focus(), d.preventDefault()), a.current = !1, c.current = !1;
        },
        onInteractOutside: (d) => {
          var g, v;
          (g = n.onInteractOutside) == null || g.call(n, d), d.defaultPrevented || (a.current = !0, d.detail.originalEvent.type === "pointerdown" && (c.current = !0));
          const p = d.target;
          ((v = i.triggerRef.current) == null ? void 0 : v.contains(p)) && d.preventDefault(), d.detail.originalEvent.type === "focusin" && c.current && d.preventDefault();
        }
      }
    );
  }, "DialogContentNonModal")
), iS = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, trapFocus: a, onOpenAutoFocus: c, onCloseAutoFocus: d, ...p } = n, m = mn(Si, i);
    return oE(), /* @__PURE__ */ k.jsx(k.Fragment, { children: /* @__PURE__ */ k.jsx(
      qP,
      {
        asChild: !0,
        loop: !0,
        trapped: a,
        onMountAutoFocus: c,
        onUnmountAutoFocus: d,
        children: /* @__PURE__ */ k.jsx(
          XP,
          {
            role: "dialog",
            id: m.contentId,
            "aria-describedby": m.descriptionPresent ? m.descriptionId : void 0,
            "aria-labelledby": m.titlePresent ? m.titleId : void 0,
            "data-state": Xd(m.open),
            ...p,
            ref: o,
            deferPointerDownOutside: !0,
            onDismiss: () => m.onOpenChange(!1)
          }
        )
      }
    ) });
  }, "DialogContentImpl")
), nb = "DialogTitle", rb = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = mn(nb, i), { setTitleCount: d } = c;
    return tn(() => (d((p) => p + 1), () => d((p) => p - 1)), [d]), /* @__PURE__ */ k.jsx(yo.h2, { id: c.titleId, ...a, ref: o });
  }, "DialogTitle")
), ob = "DialogDescription", ib = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = mn(ob, i), { setDescriptionCount: d } = c;
    return tn(() => (d((p) => p + 1), () => d((p) => p - 1)), [d]), /* @__PURE__ */ k.jsx(yo.p, { id: c.descriptionId, ...a, ref: o });
  }, "DialogDescription")
);
function Xd(e) {
  return e ? "open" : "closed";
}
zt(Xd, "getState");
function sb() {
  const e = ne((a) => a.summaryRecord), n = ne((a) => a.closeSummary), o = ne((a) => a.startTimer), i = _r(e == null ? void 0 : e.selectedScene);
  return /* @__PURE__ */ k.jsx(KE, { open: !!e, onOpenChange: (a) => !a && n(), children: /* @__PURE__ */ k.jsx(Na, { children: e ? /* @__PURE__ */ k.jsxs(QE, { forceMount: !0, children: [
    /* @__PURE__ */ k.jsx(XE, { asChild: !0, children: /* @__PURE__ */ k.jsx(
      wr.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ k.jsx(qE, { asChild: !0, children: /* @__PURE__ */ k.jsxs(
      wr.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ k.jsx(rb, { children: "Focus block complete" }),
          /* @__PURE__ */ k.jsx(ib, { className: "sr-only", children: "Summary of the completed focus block." }),
          /* @__PURE__ */ k.jsx("p", { children: "You protected a focused block in your quiet study room." }),
          /* @__PURE__ */ k.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ k.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ k.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ k.jsx("strong", { children: c0(e.totalFocusTime) })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ k.jsx("span", { children: "Planned block" }),
              /* @__PURE__ */ k.jsxs("strong", { children: [
                e.pomodoroDuration,
                "m"
              ] })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ k.jsx("span", { children: "Scene" }),
              /* @__PURE__ */ k.jsx("strong", { children: i.name })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ k.jsx("span", { children: "Room state" }),
              /* @__PURE__ */ k.jsx("strong", { children: "Saved" })
            ] })
          ] }),
          e.persisted === !1 ? /* @__PURE__ */ k.jsx("p", { children: "This session is visible for now, but could not be saved to this device history." }) : null,
          /* @__PURE__ */ k.jsxs("div", { className: "focus-button-row", children: [
            /* @__PURE__ */ k.jsx(be, { variant: "primary", onClick: () => {
              n(), o();
            }, children: "Continue studying" }),
            /* @__PURE__ */ k.jsx(be, { onClick: n, children: "Done" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function sS(e, [n, o]) {
  return Math.min(o, Math.max(n, e));
}
function so(e, n, { checkForDefaultPrevented: o = !0 } = {}) {
  return function(a) {
    if (e == null || e(a), o === !1 || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  };
}
function aS(e, n = []) {
  let o = [];
  function i(c, d) {
    const p = C.createContext(d);
    p.displayName = c + "Context";
    const m = o.length;
    o = [...o, d];
    const g = (l) => {
      var A;
      const { scope: f, children: S, ...w } = l, T = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[m]) || p, _ = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ k.jsx(T.Provider, { value: _, children: S });
    };
    g.displayName = c + "Provider";
    function v(l, f) {
      var T;
      const S = ((T = f == null ? void 0 : f[e]) == null ? void 0 : T[m]) || p, w = C.useContext(S);
      if (w) return w;
      if (d !== void 0) return d;
      throw new Error(`\`${l}\` must be used within \`${c}\``);
    }
    return [g, v];
  }
  const a = () => {
    const c = o.map((d) => C.createContext(d));
    return function(p) {
      const m = (p == null ? void 0 : p[e]) || c;
      return C.useMemo(
        () => ({ [`__scope${e}`]: { ...p, [e]: m } }),
        [p, m]
      );
    };
  };
  return a.scopeName = e, [i, ab(a, ...n)];
}
function ab(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const o = () => {
    const i = e.map((a) => ({
      useScope: a(),
      scopeName: a.scopeName
    }));
    return function(c) {
      const d = i.reduce((p, { useScope: m, scopeName: g }) => {
        const l = m(c)[`__scope${g}`];
        return { ...p, ...l };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return o.scopeName = n.scopeName, o;
}
var lb = Tr[" useInsertionEffect ".trim().toString()] || tn;
function ub({
  prop: e,
  defaultProp: n,
  onChange: o = () => {
  },
  caller: i
}) {
  const [a, c, d] = cb({
    defaultProp: n,
    onChange: o
  }), p = e !== void 0, m = p ? e : a;
  {
    const v = C.useRef(e !== void 0);
    C.useEffect(() => {
      const l = v.current;
      l !== p && console.warn(
        `${i} is changing from ${l ? "controlled" : "uncontrolled"} to ${p ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), v.current = p;
    }, [p, i]);
  }
  const g = C.useCallback(
    (v) => {
      var l;
      if (p) {
        const f = db(v) ? v(e) : v;
        f !== e && ((l = d.current) == null || l.call(d, f));
      } else
        c(v);
    },
    [p, e, c, d]
  );
  return [m, g];
}
function cb({
  defaultProp: e,
  onChange: n
}) {
  const [o, i] = C.useState(e), a = C.useRef(o), c = C.useRef(n);
  return lb(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== o && ((d = c.current) == null || d.call(c, o), a.current = o);
  }, [o, a]), [o, i, c];
}
function db(e) {
  return typeof e == "function";
}
var fb = C.createContext(void 0);
function pb(e) {
  const n = C.useContext(fb);
  return e || n || "ltr";
}
function hb(e) {
  const n = C.useRef({ value: e, previous: e });
  return C.useMemo(() => (n.current.value !== e && (n.current.previous = n.current.value, n.current.value = e), n.current.previous), [e]);
}
function mb(e) {
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
          const m = c.borderBoxSize, g = Array.isArray(m) ? m[0] : m;
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
function nd(e) {
  const n = C.forwardRef((o, i) => {
    let { children: a, ...c } = o, d = null, p = !1;
    const m = [];
    ng(a) && typeof qs == "function" && (a = qs(a._payload)), C.Children.forEach(a, (f) => {
      var S;
      if (wb(f)) {
        p = !0;
        const w = f;
        let T = "child" in w.props ? w.props.child : w.props.children;
        ng(T) && typeof qs == "function" && (T = qs(T._payload)), d = gb(w, T), m.push((S = d == null ? void 0 : d.props) == null ? void 0 : S.children);
      } else
        m.push(f);
    }), d ? d = C.cloneElement(d, void 0, m) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !p && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const g = d ? Sb(d) : void 0, v = xt(i, g);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          p ? kb(e) : Tb(e)
        );
      return a;
    }
    const l = vb(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = i ? v : g), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var yb = Symbol.for("radix.slottable"), gb = (e, n) => {
  if ("child" in e.props) {
    const o = e.props.child;
    return C.isValidElement(o) ? C.cloneElement(o, void 0, e.props.children(o.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function vb(e, n) {
  const o = { ...n };
  for (const i in n) {
    const a = e[i], c = n[i];
    /^on[A-Z]/.test(i) ? a && c ? o[i] = (...p) => {
      const m = c(...p);
      return a(...p), m;
    } : a && (o[i] = a) : i === "style" ? o[i] = { ...a, ...c } : i === "className" && (o[i] = [a, c].filter(Boolean).join(" "));
  }
  return { ...e, ...o };
}
function Sb(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
function wb(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === yb;
}
var xb = Symbol.for("react.lazy");
function ng(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === xb && "_payload" in e && _b(e._payload);
}
function _b(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var Tb = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, kb = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, qs = Tr[" use ".trim().toString()], Ab = [
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
], Pi = Ab.reduce((e, n) => {
  const o = /* @__PURE__ */ nd(`Primitive.${n}`), i = C.forwardRef((a, c) => {
    const { asChild: d, ...p } = a, m = d ? o : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ k.jsx(m, { ...p, ref: c });
  });
  return i.displayName = `Primitive.${n}`, { ...e, [n]: i };
}, {});
function Cb(e) {
  const n = e + "CollectionProvider", [o, i] = aS(n), [a, c] = o(
    n,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), d = (T) => {
    const { scope: _, children: A } = T, E = C.useRef(null), M = C.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ k.jsx(a, { scope: _, itemMap: M, collectionRef: E, children: A });
  };
  d.displayName = n;
  const p = e + "CollectionSlot", m = /* @__PURE__ */ nd(p), g = C.forwardRef(
    (T, _) => {
      const { scope: A, children: E } = T, M = c(p, A), N = xt(_, M.collectionRef);
      return /* @__PURE__ */ k.jsx(m, { ref: N, children: E });
    }
  );
  g.displayName = p;
  const v = e + "CollectionItemSlot", l = "data-radix-collection-item", f = /* @__PURE__ */ nd(v), S = C.forwardRef(
    (T, _) => {
      const { scope: A, children: E, ...M } = T, N = C.useRef(null), O = xt(_, N), W = c(v, A);
      return C.useEffect(() => (W.itemMap.set(N, { ref: N, ...M }), () => void W.itemMap.delete(N))), /* @__PURE__ */ k.jsx(f, { [l]: "", ref: O, children: E });
    }
  );
  S.displayName = v;
  function w(T) {
    const _ = c(e + "CollectionConsumer", T);
    return C.useCallback(() => {
      const E = _.collectionRef.current;
      if (!E) return [];
      const M = Array.from(E.querySelectorAll(`[${l}]`));
      return Array.from(_.itemMap.values()).sort(
        (W, K) => M.indexOf(W.ref.current) - M.indexOf(K.ref.current)
      );
    }, [_.collectionRef, _.itemMap]);
  }
  return [
    { Provider: d, Slot: g, ItemSlot: S },
    w,
    i
  ];
}
var lS = ["PageUp", "PageDown"], uS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], cS = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, go = "Slider", [rd, Pb, Eb] = Cb(go), [Zd] = aS(go, [
  Eb
]), [bb, Ei] = Zd(go), Jd = C.forwardRef(
  (e, n) => {
    const {
      name: o,
      min: i = 0,
      max: a = 100,
      step: c = 1,
      orientation: d = "horizontal",
      disabled: p = !1,
      minStepsBetweenThumbs: m = 0,
      defaultValue: g = [i],
      value: v,
      onValueChange: l = () => {
      },
      onValueCommit: f = () => {
      },
      inverted: S = !1,
      form: w,
      ...T
    } = e, _ = C.useRef(/* @__PURE__ */ new Set()), A = C.useRef(0), E = C.useRef(!1), N = d === "horizontal" ? Mb : Rb, [O = [], W] = ub({
      prop: v,
      defaultProp: g,
      onChange: (J) => {
        var ue;
        (ue = [..._.current][A.current]) == null || ue.focus({
          preventScroll: !0,
          focusVisible: E.current
        }), E.current = !1, l(J);
      }
    }), K = C.useRef(O);
    function G(J) {
      const de = Fb(O, J);
      ae(J, de);
    }
    function L(J) {
      ae(J, A.current);
    }
    function Q() {
      const J = K.current[A.current];
      O[A.current] !== J && f(O);
    }
    function ae(J, de, { commit: ue } = { commit: !1 }) {
      const _e = Vb(c), ve = Bb(Math.round((J - i) / c) * c + i, _e), Se = sS(ve, [i, a]);
      W((U = []) => {
        const X = Nb(U, Se, de);
        if (Lb(X, m * c)) {
          A.current = X.indexOf(Se);
          const Y = String(X) !== String(U);
          return Y && ue && f(X), Y ? X : U;
        } else
          return U;
      });
    }
    return /* @__PURE__ */ k.jsx(
      bb,
      {
        scope: e.__scopeSlider,
        name: o,
        disabled: p,
        min: i,
        max: a,
        valueIndexToChangeRef: A,
        thumbs: _.current,
        values: O,
        orientation: d,
        form: w,
        children: /* @__PURE__ */ k.jsx(rd.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ k.jsx(rd.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ k.jsx(
          N,
          {
            "aria-disabled": p,
            "data-disabled": p ? "" : void 0,
            ...T,
            ref: n,
            onPointerDown: so(T.onPointerDown, () => {
              p || (K.current = O, E.current = !1);
            }),
            min: i,
            max: a,
            inverted: S,
            onSlideStart: p ? void 0 : G,
            onSlideMove: p ? void 0 : L,
            onSlideEnd: p ? void 0 : Q,
            onHomeKeyDown: () => {
              p || (E.current = !0, ae(i, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              p || (E.current = !0, ae(a, O.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: J, direction: de }) => {
              if (!p) {
                E.current = !0;
                const ve = lS.includes(J.key) || J.shiftKey && uS.includes(J.key) ? 10 : 1, Se = A.current, U = O[Se], X = c * ve * de;
                ae(U + X, Se, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Jd.displayName = go;
var [dS, fS] = Zd(go, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), Mb = C.forwardRef(
  (e, n) => {
    const {
      min: o,
      max: i,
      dir: a,
      inverted: c,
      onSlideStart: d,
      onSlideMove: p,
      onSlideEnd: m,
      onStepKeyDown: g,
      ...v
    } = e, [l, f] = C.useState(null), S = xt(n, (M) => f(M)), w = C.useRef(void 0), T = pb(a), _ = T === "ltr", A = _ && !c || !_ && c;
    function E(M) {
      const N = w.current || l.getBoundingClientRect(), O = [0, N.width], K = nf(O, A ? [o, i] : [i, o]);
      return w.current = N, K(M - N.left);
    }
    return /* @__PURE__ */ k.jsx(
      dS,
      {
        scope: e.__scopeSlider,
        startEdge: A ? "left" : "right",
        endEdge: A ? "right" : "left",
        direction: A ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ k.jsx(
          pS,
          {
            dir: T,
            "data-orientation": "horizontal",
            ...v,
            ref: S,
            style: {
              ...v.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (M) => {
              const N = E(M.clientX);
              d == null || d(N);
            },
            onSlideMove: (M) => {
              const N = E(M.clientX);
              p == null || p(N);
            },
            onSlideEnd: () => {
              w.current = void 0, m == null || m();
            },
            onStepKeyDown: (M) => {
              const O = cS[A ? "from-left" : "from-right"].includes(M.key);
              g == null || g({ event: M, direction: O ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), Rb = C.forwardRef(
  (e, n) => {
    const {
      min: o,
      max: i,
      inverted: a,
      onSlideStart: c,
      onSlideMove: d,
      onSlideEnd: p,
      onStepKeyDown: m,
      ...g
    } = e, v = C.useRef(null), l = xt(n, v), f = C.useRef(void 0), S = !a;
    function w(T) {
      const _ = f.current || v.current.getBoundingClientRect(), A = [0, _.height], M = nf(A, S ? [i, o] : [o, i]);
      return f.current = _, M(T - _.top);
    }
    return /* @__PURE__ */ k.jsx(
      dS,
      {
        scope: e.__scopeSlider,
        startEdge: S ? "bottom" : "top",
        endEdge: S ? "top" : "bottom",
        size: "height",
        direction: S ? 1 : -1,
        children: /* @__PURE__ */ k.jsx(
          pS,
          {
            "data-orientation": "vertical",
            ...g,
            ref: l,
            style: {
              ...g.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (T) => {
              const _ = w(T.clientY);
              c == null || c(_);
            },
            onSlideMove: (T) => {
              const _ = w(T.clientY);
              d == null || d(_);
            },
            onSlideEnd: () => {
              f.current = void 0, p == null || p();
            },
            onStepKeyDown: (T) => {
              const A = cS[S ? "from-bottom" : "from-top"].includes(T.key);
              m == null || m({ event: T, direction: A ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), pS = C.forwardRef(
  (e, n) => {
    const {
      __scopeSlider: o,
      onSlideStart: i,
      onSlideMove: a,
      onSlideEnd: c,
      onHomeKeyDown: d,
      onEndKeyDown: p,
      onStepKeyDown: m,
      ...g
    } = e, v = Ei(go, o);
    return /* @__PURE__ */ k.jsx(
      Pi.span,
      {
        ...g,
        ref: n,
        onKeyDown: so(e.onKeyDown, (l) => {
          l.key === "Home" ? (d(l), l.preventDefault()) : l.key === "End" ? (p(l), l.preventDefault()) : lS.concat(uS).includes(l.key) && (m(l), l.preventDefault());
        }),
        onPointerDown: so(e.onPointerDown, (l) => {
          const f = l.target;
          f.setPointerCapture(l.pointerId), l.preventDefault(), v.thumbs.has(f) ? f.focus({ preventScroll: !0, focusVisible: !1 }) : i(l);
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
), hS = "SliderTrack", qd = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Ei(hS, o);
    return /* @__PURE__ */ k.jsx(
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
qd.displayName = hS;
var od = "SliderRange", ef = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Ei(od, o), c = fS(od, o), d = C.useRef(null), p = xt(n, d), m = a.values.length, g = a.values.map(
      (f) => _S(f, a.min, a.max)
    ), v = m > 1 ? Math.min(...g) : 0, l = 100 - Math.max(...g);
    return /* @__PURE__ */ k.jsx(
      Pi.span,
      {
        "data-orientation": a.orientation,
        "data-disabled": a.disabled ? "" : void 0,
        ...i,
        ref: p,
        style: {
          ...e.style,
          [c.startEdge]: v + "%",
          [c.endEdge]: l + "%"
        }
      }
    );
  }
);
ef.displayName = od;
var mS = "SliderThumb", [Db, yS] = Zd(mS), gS = "SliderThumbProvider";
function vS(e) {
  const {
    __scopeSlider: n,
    name: o,
    children: i,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: a
  } = e, c = Ei(gS, n), d = Pb(n), [p, m] = C.useState(null), g = C.useMemo(
    () => p ? d().findIndex((_) => _.ref.current === p) : -1,
    [d, p]
  ), v = mb(p), l = p ? !!c.form || !!p.closest("form") : !0, f = c.values[g], S = o ?? (c.name ? c.name + (c.values.length > 1 ? "[]" : "") : void 0), w = f === void 0 ? 0 : _S(f, c.min, c.max);
  C.useEffect(() => {
    if (p)
      return c.thumbs.add(p), () => {
        c.thumbs.delete(p);
      };
  }, [p, c.thumbs]);
  const T = {
    value: f,
    name: S,
    form: c.form,
    isFormControl: l,
    index: g,
    thumb: p,
    onThumbChange: m,
    percent: w,
    size: v
  };
  return /* @__PURE__ */ k.jsx(Db, { scope: n, ...T, children: zb(a) ? a(T) : i });
}
vS.displayName = gS;
var fa = "SliderThumbTrigger", SS = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Ei(fa, o), c = fS(fa, o), { index: d, value: p, percent: m, size: g, onThumbChange: v } = yS(
      fa,
      o
    ), l = xt(n, (T) => v(T)), f = Ib(d, a.values.length), S = g == null ? void 0 : g[c.size], w = S ? jb(S, m, c.direction) : 0;
    return /* @__PURE__ */ k.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [c.startEdge]: `calc(${m}% + ${w}px)`
        },
        children: /* @__PURE__ */ k.jsx(rd.ItemSlot, { scope: o, children: /* @__PURE__ */ k.jsx(
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
SS.displayName = fa;
var tf = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, name: i, ...a } = e;
    return /* @__PURE__ */ k.jsx(
      vS,
      {
        __scopeSlider: o,
        name: i,
        internal_do_not_use_render: ({ index: c, isFormControl: d }) => /* @__PURE__ */ k.jsxs(k.Fragment, { children: [
          /* @__PURE__ */ k.jsx(
            SS,
            {
              ...a,
              ref: n,
              __scopeSlider: o
            }
          ),
          d ? /* @__PURE__ */ k.jsx(
            xS,
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
tf.displayName = mS;
var wS = "SliderBubbleInput", xS = C.forwardRef(
  ({ __scopeSlider: e, ...n }, o) => {
    const { value: i, name: a, form: c } = yS(wS, e), d = C.useRef(null), p = xt(d, o), m = hb(i);
    return C.useEffect(() => {
      const g = d.current;
      if (!g) return;
      const v = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(v, "value").set;
      if (m !== i && f) {
        const S = new Event("input", { bubbles: !0 });
        f.call(g, i), g.dispatchEvent(S);
      }
    }, [m, i]), /* @__PURE__ */ k.jsx(
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
xS.displayName = wS;
function Nb(e = [], n, o) {
  const i = [...e];
  return i[o] = n, i.sort((a, c) => a - c);
}
function _S(e, n, o) {
  const c = 100 / (o - n) * (e - n);
  return sS(c, [0, 100]);
}
function Ib(e, n) {
  return n > 2 ? `Value ${e + 1} of ${n}` : n === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function Fb(e, n) {
  if (e.length === 1) return 0;
  const o = e.map((a) => Math.abs(a - n)), i = Math.min(...o);
  return o.indexOf(i);
}
function jb(e, n, o) {
  const i = e / 2, c = nf([0, 50], [0, i]);
  return (i - c(n) * o) * o;
}
function Ob(e) {
  return e.slice(0, -1).map((n, o) => e[o + 1] - n);
}
function Lb(e, n) {
  if (n > 0) {
    const o = Ob(e);
    return Math.min(...o) >= n;
  }
  return !0;
}
function nf(e, n) {
  return (o) => {
    if (e[0] === e[1] || n[0] === n[1]) return n[0];
    const i = (n[1] - n[0]) / (e[1] - e[0]);
    return n[0] + i * (o - e[0]);
  };
}
function Vb(e) {
  if (!Number.isFinite(e)) return 0;
  const n = e.toString();
  if (n.includes("e")) {
    const [i, a] = n.split("e"), c = i.split(".")[1] || "", d = Number(a);
    return Math.max(0, c.length - d);
  }
  const o = n.split(".")[1];
  return o ? o.length : 0;
}
function Bb(e, n) {
  const o = Math.pow(10, n);
  return Math.round(e * o) / o;
}
function zb(e) {
  return typeof e == "function";
}
function Ub({ scene: e, active: n, onSelect: o }) {
  return /* @__PURE__ */ k.jsxs(
    wr.button,
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
        /* @__PURE__ */ k.jsx("span", { className: "focus-pill", children: e.kicker }),
        /* @__PURE__ */ k.jsx("strong", { children: e.name }),
        /* @__PURE__ */ k.jsx("span", { children: e.description })
      ]
    }
  );
}
function TS() {
  const e = ne((o) => o.selectedScene), n = ne((o) => o.selectScene);
  return /* @__PURE__ */ k.jsx("div", { className: "scene-selector", "aria-label": "Study scenes", children: xr.map((o) => /* @__PURE__ */ k.jsx(Ub, { scene: o, active: o.id === e, onSelect: n }, o.id)) });
}
function rg({ label: e, icon: n, value: o, onChange: i }) {
  return /* @__PURE__ */ k.jsxs("label", { className: "sound-slider", children: [
    /* @__PURE__ */ k.jsxs("span", { className: "sound-slider-head", children: [
      /* @__PURE__ */ k.jsxs("span", { className: "sound-slider-label", children: [
        n,
        /* @__PURE__ */ k.jsx("span", { children: e })
      ] }),
      /* @__PURE__ */ k.jsxs("strong", { children: [
        o,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ k.jsxs(
      Jd,
      {
        className: "radix-slider-root",
        value: [o],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (a) => i(a[0]),
        children: [
          /* @__PURE__ */ k.jsx(qd, { className: "radix-slider-track", children: /* @__PURE__ */ k.jsx(ef, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ k.jsx(tf, { className: "radix-slider-thumb", "aria-label": e })
        ]
      }
    )
  ] });
}
function $b({ audioState: e }) {
  const n = ne((v) => v.musicType), o = ne((v) => v.ambientSound), i = ne((v) => v.musicVolume), a = ne((v) => v.ambientVolume), c = ne((v) => v.audioPlaying), d = ne((v) => v.setSound), p = ne((v) => v.toggleAudio), m = Fa({ musicType: n, ambientSound: o }), g = m.ambientLayers.map((v) => v.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ k.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ k.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ k.jsx("select", { value: n, onChange: (v) => d("musicType", v.target.value), children: $n.map((v) => /* @__PURE__ */ k.jsx("option", { value: v.label, children: v.label }, v.label)) })
    ] }),
    /* @__PURE__ */ k.jsx(
      rg,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ k.jsx(La, { size: 16, "aria-hidden": "true" }),
        value: i,
        onChange: (v) => d("musicVolume", v)
      }
    ),
    /* @__PURE__ */ k.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ k.jsx("select", { value: o, onChange: (v) => d("ambientSound", v.target.value), children: Hn.map((v) => /* @__PURE__ */ k.jsx("option", { value: v.label, children: v.label }, v.label)) })
    ] }),
    /* @__PURE__ */ k.jsx(
      rg,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ k.jsx(x0, { size: 16, "aria-hidden": "true" }),
        value: a,
        onChange: (v) => d("ambientVolume", v)
      }
    ),
    /* @__PURE__ */ k.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ k.jsxs("div", { children: [
        /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ k.jsx("strong", { children: m.musicTrack.title }),
        /* @__PURE__ */ k.jsx("p", { children: g }),
        e != null && e.error ? /* @__PURE__ */ k.jsx("p", { className: "audio-error", children: e.error }) : null
      ] }),
      /* @__PURE__ */ k.jsx(be, { variant: c ? "primary" : "ghost", onClick: p, children: c ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ k.jsx("div", { className: "audio-links", children: [m.musicTrack, ...m.ambientLayers].filter((v) => v == null ? void 0 : v.pageUrl).map((v) => /* @__PURE__ */ k.jsx("a", { href: v.pageUrl, target: "_blank", rel: "noreferrer", children: v.title || v.label || "Audio source" }, v.pageUrl)) })
  ] });
}
const Hb = [
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
], Wb = [
  ["white-noise", "White noise"],
  ["pink-noise", "Pink noise"],
  ["brown-noise", "Brown noise"]
], Gb = [
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
  return /* @__PURE__ */ k.jsxs("label", { className: [
    "room-channel",
    i ? "room-channel-master" : "",
    c ? "room-channel-card" : "",
    p ? "is-active" : ""
  ].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ k.jsxs("span", { className: "room-channel-head", children: [
      /* @__PURE__ */ k.jsxs("span", { className: "room-channel-label", children: [
        i || /* @__PURE__ */ k.jsx("i", { className: `mixer-channel-dot mixer-${e}`, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: n })
      ] }),
      /* @__PURE__ */ k.jsxs("strong", { children: [
        d,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ k.jsxs(
      Jd,
      {
        className: "radix-slider-root",
        value: [d],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (m) => a(e, m[0]),
        children: [
          /* @__PURE__ */ k.jsx(qd, { className: "radix-slider-track", children: /* @__PURE__ */ k.jsx(ef, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ k.jsx(tf, { className: "radix-slider-thumb", "aria-label": `${n} volume` })
        ]
      }
    )
  ] });
}
function Kb({ audioState: e, scene: n, onClose: o }) {
  const i = ne((_) => _.audioChannels), a = ne((_) => _.setSound), c = ne((_) => _.musicType), d = ne((_) => _.ambientSound), p = ne((_) => _.musicVolume), m = ne((_) => _.ambientVolume), [g, v] = C.useState(!1), l = (_, A) => {
    v(!1), a(`audioChannel:${_}`, A);
  }, f = (_, A) => a("musicVolume", A), S = (_, A) => a("ambientVolume", A), w = () => {
    const _ = $n[Math.floor(Math.random() * $n.length)], A = Hn[Math.floor(Math.random() * Hn.length)];
    a("musicType", _.label), a("ambientSound", A.label), v(!1);
  }, T = () => {
    a("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), a("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), v(!0);
  };
  return /* @__PURE__ */ k.jsxs(
    wr.aside,
    {
      className: "focus-utility-panel room-control-panel liquid-glass",
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 14 },
      transition: Bd,
      role: "dialog",
      "aria-label": "Room settings",
      children: [
        /* @__PURE__ */ k.jsxs("header", { className: "room-control-head", children: [
          /* @__PURE__ */ k.jsxs("div", { children: [
            /* @__PURE__ */ k.jsx("span", { className: "control-eyebrow", children: "Control" }),
            /* @__PURE__ */ k.jsx("h2", { children: "Room settings" })
          ] }),
          /* @__PURE__ */ k.jsx(be, { className: "room-control-close", "aria-label": "Close room settings", onClick: o, children: /* @__PURE__ */ k.jsx(_0, { size: 16, "aria-hidden": "true" }) })
        ] }),
        /* @__PURE__ */ k.jsx("div", { className: "room-control-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsxs("div", { className: "room-control-grid", children: [
          /* @__PURE__ */ k.jsxs("section", { className: "room-control-col room-control-scenes", "aria-label": "Scenes", children: [
            /* @__PURE__ */ k.jsx("h3", { className: "room-control-section-title", children: "Scenes" }),
            /* @__PURE__ */ k.jsx(TS, {})
          ] }),
          /* @__PURE__ */ k.jsxs("section", { className: "room-control-col room-control-audio", children: [
            /* @__PURE__ */ k.jsxs("div", { className: "room-control-masters", children: [
              /* @__PURE__ */ k.jsxs("div", { className: "room-control-block", children: [
                /* @__PURE__ */ k.jsxs("div", { className: "room-control-block-head", children: [
                  /* @__PURE__ */ k.jsx("h3", { className: "room-control-section-title", children: "Music" }),
                  /* @__PURE__ */ k.jsx(be, { className: "room-control-icon-btn", "aria-label": "Shuffle to a random track", onClick: w, children: /* @__PURE__ */ k.jsx(KC, { size: 15, "aria-hidden": "true" }) })
                ] }),
                /* @__PURE__ */ k.jsxs("label", { className: "room-select-field", children: [
                  /* @__PURE__ */ k.jsx("span", { className: "sr-only", children: "Music track" }),
                  /* @__PURE__ */ k.jsx("select", { value: c, onChange: (_) => {
                    v(!1), a("musicType", _.target.value);
                  }, children: $n.map((_) => /* @__PURE__ */ k.jsx("option", { value: _.label, children: _.label }, _.label)) })
                ] }),
                /* @__PURE__ */ k.jsx(ea, { id: "music-volume", label: "Music volume", icon: /* @__PURE__ */ k.jsx(La, { size: 15, "aria-hidden": "true" }), value: p, onChange: f })
              ] }),
              /* @__PURE__ */ k.jsxs("div", { className: "room-control-block", children: [
                /* @__PURE__ */ k.jsxs("div", { className: "room-control-block-head", children: [
                  /* @__PURE__ */ k.jsx("h3", { className: "room-control-section-title", children: "Scene sound" }),
                  /* @__PURE__ */ k.jsx(be, { className: "room-control-icon-btn", "aria-label": g ? "Mix saved" : "Save current mix", onClick: () => v(!0), children: g ? /* @__PURE__ */ k.jsx(v0, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ k.jsx(S0, { size: 15, "aria-hidden": "true" }) })
                ] }),
                /* @__PURE__ */ k.jsxs("p", { className: "room-scene-recommend", children: [
                  "Recommended for ",
                  /* @__PURE__ */ k.jsx("strong", { children: n == null ? void 0 : n.name }),
                  /* @__PURE__ */ k.jsxs("span", { children: [
                    n == null ? void 0 : n.musicType,
                    " · ",
                    n == null ? void 0 : n.ambientSound
                  ] })
                ] }),
                /* @__PURE__ */ k.jsxs("button", { type: "button", className: "room-scene-apply", onClick: T, children: [
                  "Apply scene mix ",
                  /* @__PURE__ */ k.jsx("span", { "aria-hidden": "true", children: "↗" })
                ] }),
                /* @__PURE__ */ k.jsxs("label", { className: "room-select-field", children: [
                  /* @__PURE__ */ k.jsx("span", { className: "sr-only", children: "Ambient sound" }),
                  /* @__PURE__ */ k.jsx("select", { value: d, onChange: (_) => {
                    v(!1), a("ambientSound", _.target.value);
                  }, children: Hn.map((_) => /* @__PURE__ */ k.jsx("option", { value: _.label, children: _.label }, _.label)) })
                ] }),
                /* @__PURE__ */ k.jsx(ea, { id: "ambient-volume", label: "Ambient volume", icon: /* @__PURE__ */ k.jsx(x0, { size: 15, "aria-hidden": "true" }), value: m, onChange: S })
              ] })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "room-control-block", children: [
              /* @__PURE__ */ k.jsx("h3", { className: "room-control-section-title", children: "Focus noise" }),
              /* @__PURE__ */ k.jsx("div", { className: "room-noise-row", children: Wb.map(([_, A]) => /* @__PURE__ */ k.jsx(ea, { id: _, label: A, value: i == null ? void 0 : i[_], onChange: l, card: !0 }, _)) })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "room-control-block", children: [
              /* @__PURE__ */ k.jsx("h3", { className: "room-control-section-title", children: "Ambient atmosphere" }),
              /* @__PURE__ */ k.jsx("div", { className: "room-ambient-grid", children: Gb.map(([_, A]) => /* @__PURE__ */ k.jsx(ea, { id: _, label: A, value: i == null ? void 0 : i[_], onChange: l, card: !0 }, _)) })
            ] }),
            e != null && e.error ? /* @__PURE__ */ k.jsx("p", { className: "audio-error", children: e.error }) : null
          ] })
        ] })
      ]
    }
  );
}
function ta({ title: e, kicker: n, icon: o, children: i, onClose: a, className: c = "" }) {
  return /* @__PURE__ */ k.jsxs(wr.aside, { className: `focus-utility-panel liquid-glass ${c}`.trim(), initial: { opacity: 0, y: 12, x: -18 }, animate: { opacity: 1, y: 0, x: 0 }, exit: { opacity: 0, y: 10, x: -18 }, transition: Bd, role: "dialog", "aria-label": e, children: [
    /* @__PURE__ */ k.jsxs("div", { className: "drawer-head", children: [
      /* @__PURE__ */ k.jsxs("div", { className: "utility-title", children: [
        /* @__PURE__ */ k.jsx("span", { className: "utility-title-icon", children: o }),
        /* @__PURE__ */ k.jsxs("div", { children: [
          /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: n }),
          /* @__PURE__ */ k.jsx("h2", { children: e })
        ] })
      ] }),
      /* @__PURE__ */ k.jsx(be, { "aria-label": `Close ${e}`, onClick: a, children: /* @__PURE__ */ k.jsx(_0, { size: 16, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ k.jsx("div", { className: "utility-panel-body", children: i })
  ] });
}
function Yb({ audioState: e, scene: n }) {
  const o = ne((g) => g.audioChannels), i = ne((g) => g.setSound), [a, c] = C.useState(!1), d = (g, v) => {
    c(!1), i(`audioChannel:${g}`, v);
  }, p = () => {
    const g = $n[Math.floor(Math.random() * $n.length)], v = Hn[Math.floor(Math.random() * Hn.length)];
    i("musicType", g.label), i("ambientSound", v.label), c(!0);
  }, m = () => {
    i("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), i("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), c(!0);
  };
  return /* @__PURE__ */ k.jsxs("div", { className: "sound-mixer", children: [
    /* @__PURE__ */ k.jsxs("div", { className: "mixer-featured-row", children: [
      /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Music library" }),
      /* @__PURE__ */ k.jsxs(be, { onClick: p, children: [
        /* @__PURE__ */ k.jsx(NC, { size: 14, "aria-hidden": "true" }),
        " Random track"
      ] })
    ] }),
    /* @__PURE__ */ k.jsx($b, { audioState: e, compact: !0 }),
    /* @__PURE__ */ k.jsxs("div", { className: "mixer-preset-row", children: [
      /* @__PURE__ */ k.jsxs("button", { type: "button", className: "mixer-preset-button", onClick: m, children: [
        "Apply scene mix ",
        /* @__PURE__ */ k.jsx("span", { children: "↗" })
      ] }),
      /* @__PURE__ */ k.jsxs(be, { onClick: () => c(!0), children: [
        a ? /* @__PURE__ */ k.jsx(v0, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ k.jsx(S0, { size: 14, "aria-hidden": "true" }),
        " ",
        a ? "Saved" : "Save current mix"
      ] })
    ] }),
    /* @__PURE__ */ k.jsx("div", { className: "mixer-channel-grid", children: Hb.map(([g, v]) => /* @__PURE__ */ k.jsxs("label", { className: "mixer-channel", children: [
      /* @__PURE__ */ k.jsxs("span", { children: [
        /* @__PURE__ */ k.jsx("i", { className: `mixer-channel-dot mixer-${g}` }),
        v
      ] }),
      /* @__PURE__ */ k.jsxs("strong", { children: [
        o[g],
        "%"
      ] }),
      /* @__PURE__ */ k.jsx("input", { type: "range", min: "0", max: "100", value: o[g], "aria-label": `${v} volume`, onChange: (l) => d(g, l.target.value) })
    ] }, g)) }),
    e != null && e.error ? /* @__PURE__ */ k.jsx("p", { className: "audio-error", children: e.error }) : null
  ] });
}
function Qb() {
  const e = () => {
    var i, a, c;
    return ((c = (a = (i = globalThis.window) == null ? void 0 : i.SynapseAuth) == null ? void 0 : a.getStoredSession) == null ? void 0 : c.call(a)) || null;
  }, [n, o] = C.useState(e);
  return C.useEffect(() => {
    var d, p, m, g;
    let i = !0;
    const a = (v) => {
      var l;
      i && o(((l = v == null ? void 0 : v.detail) == null ? void 0 : l.session) || e());
    };
    (d = globalThis.window) == null || d.addEventListener("synapse-auth-changed", a);
    const c = (g = (m = (p = globalThis.window) == null ? void 0 : p.SynapseAuth) == null ? void 0 : m.syncSessionFromProvider) == null ? void 0 : g.call(m);
    return Promise.resolve(c).finally(() => a()), () => {
      var v;
      i = !1, (v = globalThis.window) == null || v.removeEventListener("synapse-auth-changed", a);
    };
  }, []), n;
}
function Xb({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ k.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ k.jsx(Ca, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ k.jsx("h3", { children: "Your Focus Trail" }),
    /* @__PURE__ */ k.jsx("p", { children: "Recent sessions and progress remain available through Synapse history." }),
    /* @__PURE__ */ k.jsx(be, { variant: "primary", onClick: () => e == null ? void 0 : e("", "history"), children: "Open session history" })
  ] }) : /* @__PURE__ */ k.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ k.jsx(Ca, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Your rhythm, remembered" }),
    /* @__PURE__ */ k.jsx("h3", { children: "Sign in to view your Focus Trail" }),
    /* @__PURE__ */ k.jsx("p", { children: "Track deep-work time, completed goals, and your study streak across devices." }),
    /* @__PURE__ */ k.jsx(be, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Sign in with Synapse" }),
    /* @__PURE__ */ k.jsx("small", { children: "Your current session continues without an account." })
  ] });
}
function Zb({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ k.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ k.jsx(Pa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ k.jsx("h3", { children: "Companion Room" }),
    /* @__PURE__ */ k.jsx("p", { children: "Invite a study partner from your Synapse workspace to share this quiet room." }),
    /* @__PURE__ */ k.jsx(be, { variant: "primary", onClick: () => e == null ? void 0 : e("", "companion"), children: "Open Companion Room" })
  ] }) : /* @__PURE__ */ k.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ k.jsx(Pa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Study alongside someone" }),
    /* @__PURE__ */ k.jsx("h3", { children: "Sign in to use Companion Room" }),
    /* @__PURE__ */ k.jsx("p", { children: "Keep your own goal private while sharing the feeling of showing up together." }),
    /* @__PURE__ */ k.jsx(be, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Go to sign in" }),
    /* @__PURE__ */ k.jsx("small", { children: "No companion data is created in Focus Room." })
  ] });
}
function Jb({ audioState: e, utilityPanel: n, onClose: o, onWorkspace: i }) {
  const a = ne((g) => g.activeDrawer), c = ne((g) => g.closeDrawer), d = ne((g) => g.selectedScene), p = Qb(), m = C.useMemo(() => xr.find((g) => g.id === d) || xr[0], [d]);
  return /* @__PURE__ */ k.jsxs(Na, { children: [
    n === "trail" ? /* @__PURE__ */ k.jsx(ta, { title: "Focus Trail", kicker: "Your progress", icon: /* @__PURE__ */ k.jsx(Ca, { size: 16 }), onClose: o, children: /* @__PURE__ */ k.jsx(Xb, { onWorkspace: i, session: p }) }) : null,
    n === "companion" ? /* @__PURE__ */ k.jsx(ta, { title: "Companion Room", kicker: "Shared focus", icon: /* @__PURE__ */ k.jsx(Pa, { size: 16 }), onClose: o, children: /* @__PURE__ */ k.jsx(Zb, { onWorkspace: i, session: p }) }) : null,
    n === "settings" ? /* @__PURE__ */ k.jsx(Kb, { audioState: e, scene: m, onClose: o }) : null,
    !n && a === "scene" ? /* @__PURE__ */ k.jsx(ta, { title: "Choose scene", kicker: "Scene", icon: /* @__PURE__ */ k.jsx(w0, { size: 16 }), onClose: c, children: /* @__PURE__ */ k.jsx(TS, {}) }) : null,
    !n && a === "music" ? /* @__PURE__ */ k.jsx(ta, { title: "Sound atmosphere", kicker: "Room audio", icon: /* @__PURE__ */ k.jsx(La, { size: 16 }), onClose: c, children: /* @__PURE__ */ k.jsx(Yb, { audioState: e, scene: m }) }) : null
  ] });
}
function qb(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function eM({ onExit: e }) {
  const n = ne((g) => g.elapsedSeconds), o = ne((g) => g.pomodoroDuration), i = ne((g) => g.pomodoroDurationSeconds), a = ne((g) => g.timerMode), c = ne((g) => g.timerStatus), d = ne((g) => g.currentSession), p = Number(i) || (Number(o) || 0) * 60, m = a === "countup" ? n : Math.max(0, p - n);
  return /* @__PURE__ */ k.jsxs("div", { className: "compact-focus-mode-card", "aria-label": "Distraction-free focus timer", children: [
    /* @__PURE__ */ k.jsxs("div", { className: "compact-focus-card-top", children: [
      /* @__PURE__ */ k.jsxs("span", { children: [
        "POMODORO #",
        (d == null ? void 0 : d.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ k.jsx(be, { className: "compact-exit-button", onClick: e, "aria-label": "Exit Focus Mode", children: /* @__PURE__ */ k.jsx(LC, { size: 14, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ k.jsxs("span", { className: "compact-focus-status", children: [
      /* @__PURE__ */ k.jsx("i", {}),
      c === "paused" ? "Paused" : "In focus"
    ] }),
    /* @__PURE__ */ k.jsx("strong", { children: $c(m) }),
    /* @__PURE__ */ k.jsx("div", { className: "compact-focus-progress", children: /* @__PURE__ */ k.jsx("span", { style: { width: `${qb(n, p)}%` } }) }),
    /* @__PURE__ */ k.jsxs("small", { children: [
      Wd(p),
      " session"
    ] }),
    /* @__PURE__ */ k.jsx("span", { className: "sr-only", children: "Press Escape to exit Focus Mode." })
  ] });
}
var uc = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var og;
function tM() {
  return og || (og = 1, (function(e) {
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
          if (l = parseFloat(l), f.ctx || v(), typeof l < "u" && l >= 0 && l <= 1) {
            if (f._volume = l, f._muted)
              return f;
            f.usingWebAudio && f.masterGain.gain.setValueAtTime(l, o.ctx.currentTime);
            for (var S = 0; S < f._howls.length; S++)
              if (!f._howls[S]._webAudio)
                for (var w = f._howls[S]._getSoundIds(), T = 0; T < w.length; T++) {
                  var _ = f._howls[S]._soundById(w[T]);
                  _ && _._node && (_._node.volume = _._volume * l);
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
          f.ctx || v(), f._muted = l, f.usingWebAudio && f.masterGain.gain.setValueAtTime(l ? 0 : f._volume, o.ctx.currentTime);
          for (var S = 0; S < f._howls.length; S++)
            if (!f._howls[S]._webAudio)
              for (var w = f._howls[S]._getSoundIds(), T = 0; T < w.length; T++) {
                var _ = f._howls[S]._soundById(w[T]);
                _ && _._node && (_._node.muted = l ? !0 : _._muted);
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
          return l.usingWebAudio && l.ctx && typeof l.ctx.close < "u" && (l.ctx.close(), l.ctx = null, v()), l;
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
          var S = f.canPlayType("audio/mpeg;").replace(/^no$/, ""), w = l._navigator ? l._navigator.userAgent : "", T = w.match(/OPR\/(\d+)/g), _ = T && parseInt(T[0].split("/")[1], 10) < 33, A = w.indexOf("Safari") !== -1 && w.indexOf("Chrome") === -1, E = w.match(/Version\/(.*?) /), M = A && E && parseInt(E[1], 10) < 15;
          return l._codecs = {
            mp3: !!(!_ && (S || f.canPlayType("audio/mp3;").replace(/^no$/, ""))),
            mpeg: !!S,
            opus: !!f.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
            ogg: !!f.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            oga: !!f.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            wav: !!(f.canPlayType('audio/wav; codecs="1"') || f.canPlayType("audio/wav")).replace(/^no$/, ""),
            aac: !!f.canPlayType("audio/aac;").replace(/^no$/, ""),
            caf: !!f.canPlayType("audio/x-caf;").replace(/^no$/, ""),
            m4a: !!(f.canPlayType("audio/x-m4a;") || f.canPlayType("audio/m4a;") || f.canPlayType("audio/aac;")).replace(/^no$/, ""),
            m4b: !!(f.canPlayType("audio/x-m4b;") || f.canPlayType("audio/m4b;") || f.canPlayType("audio/aac;")).replace(/^no$/, ""),
            mp4: !!(f.canPlayType("audio/x-mp4;") || f.canPlayType("audio/mp4;") || f.canPlayType("audio/aac;")).replace(/^no$/, ""),
            weba: !!(!M && f.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            webm: !!(!M && f.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
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
            var f = function(S) {
              for (; l._html5AudioPool.length < l.html5PoolSize; )
                try {
                  var w = new Audio();
                  w._unlocked = !0, l._releaseHtml5Audio(w);
                } catch {
                  l.noAudio = !0;
                  break;
                }
              for (var T = 0; T < l._howls.length; T++)
                if (!l._howls[T]._webAudio)
                  for (var _ = l._howls[T]._getSoundIds(), A = 0; A < _.length; A++) {
                    var E = l._howls[T]._soundById(_[A]);
                    E && E._node && !E._node._unlocked && (E._node._unlocked = !0, E._node.load());
                  }
              l._autoResume();
              var M = l.ctx.createBufferSource();
              M.buffer = l._scratchBuffer, M.connect(l.ctx.destination), typeof M.start > "u" ? M.noteOn(0) : M.start(0), typeof l.ctx.resume == "function" && l.ctx.resume(), M.onended = function() {
                M.disconnect(0), l._audioUnlocked = !0, document.removeEventListener("touchstart", f, !0), document.removeEventListener("touchend", f, !0), document.removeEventListener("click", f, !0), document.removeEventListener("keydown", f, !0);
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
                for (var S = 0; S < l._howls[f]._sounds.length; S++)
                  if (!l._howls[f]._sounds[S]._paused)
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
          return o.ctx || v(), f._autoplay = l.autoplay || !1, f._format = typeof l.format != "string" ? l.format : [l.format], f._html5 = l.html5 || !1, f._muted = l.mute || !1, f._loop = l.loop || !1, f._pool = l.pool || 5, f._preload = typeof l.preload == "boolean" || l.preload === "metadata" ? l.preload : !0, f._rate = l.rate || 1, f._sprite = l.sprite || {}, f._src = typeof l.src != "string" ? l.src : [l.src], f._volume = l.volume !== void 0 ? l.volume : 1, f._xhr = {
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
          for (var S = 0; S < l._src.length; S++) {
            var w, T;
            if (l._format && l._format[S])
              w = l._format[S];
            else {
              if (T = l._src[S], typeof T != "string") {
                l._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              w = /^data:audio\/([^;,]+);/i.exec(T), w || (w = /\.([^.]+)$/.exec(T.split("?", 1)[0])), w && (w = w[1].toLowerCase());
            }
            if (w || console.warn('No file extension was found. Consider using the "format" property or specify an extension.'), w && o.codecs(w)) {
              f = l._src[S];
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
          var S = this, w = null;
          if (typeof l == "number")
            w = l, l = null;
          else {
            if (typeof l == "string" && S._state === "loaded" && !S._sprite[l])
              return null;
            if (typeof l > "u" && (l = "__default", !S._playLock)) {
              for (var T = 0, _ = 0; _ < S._sounds.length; _++)
                S._sounds[_]._paused && !S._sounds[_]._ended && (T++, w = S._sounds[_]._id);
              T === 1 ? l = null : w = null;
            }
          }
          var A = w ? S._soundById(w) : S._inactiveSound();
          if (!A)
            return null;
          if (w && !l && (l = A._sprite || "__default"), S._state !== "loaded") {
            A._sprite = l, A._ended = !1;
            var E = A._id;
            return S._queue.push({
              event: "play",
              action: function() {
                S.play(E);
              }
            }), E;
          }
          if (w && !A._paused)
            return f || S._loadQueue("play"), A._id;
          S._webAudio && o._autoResume();
          var M = Math.max(0, A._seek > 0 ? A._seek : S._sprite[l][0] / 1e3), N = Math.max(0, (S._sprite[l][0] + S._sprite[l][1]) / 1e3 - M), O = N * 1e3 / Math.abs(A._rate), W = S._sprite[l][0] / 1e3, K = (S._sprite[l][0] + S._sprite[l][1]) / 1e3;
          A._sprite = l, A._ended = !1;
          var G = function() {
            A._paused = !1, A._seek = M, A._start = W, A._stop = K, A._loop = !!(A._loop || S._sprite[l][2]);
          };
          if (M >= K) {
            S._ended(A);
            return;
          }
          var L = A._node;
          if (S._webAudio) {
            var Q = function() {
              S._playLock = !1, G(), S._refreshBuffer(A);
              var ue = A._muted || S._muted ? 0 : A._volume;
              L.gain.setValueAtTime(ue, o.ctx.currentTime), A._playStart = o.ctx.currentTime, typeof L.bufferSource.start > "u" ? A._loop ? L.bufferSource.noteGrainOn(0, M, 86400) : L.bufferSource.noteGrainOn(0, M, N) : A._loop ? L.bufferSource.start(0, M, 86400) : L.bufferSource.start(0, M, N), O !== 1 / 0 && (S._endTimers[A._id] = setTimeout(S._ended.bind(S, A), O)), f || setTimeout(function() {
                S._emit("play", A._id), S._loadQueue();
              }, 0);
            };
            o.state === "running" && o.ctx.state !== "interrupted" ? Q() : (S._playLock = !0, S.once("resume", Q), S._clearTimer(A._id));
          } else {
            var ae = function() {
              L.currentTime = M, L.muted = A._muted || S._muted || o._muted || L.muted, L.volume = A._volume * o.volume(), L.playbackRate = A._rate;
              try {
                var ue = L.play();
                if (ue && typeof Promise < "u" && (ue instanceof Promise || typeof ue.then == "function") ? (S._playLock = !0, G(), ue.then(function() {
                  S._playLock = !1, L._unlocked = !0, f ? S._loadQueue() : S._emit("play", A._id);
                }).catch(function() {
                  S._playLock = !1, S._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), A._ended = !0, A._paused = !0;
                })) : f || (S._playLock = !1, G(), S._emit("play", A._id)), L.playbackRate = A._rate, L.paused) {
                  S._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                l !== "__default" || A._loop ? S._endTimers[A._id] = setTimeout(S._ended.bind(S, A), O) : (S._endTimers[A._id] = function() {
                  S._ended(A), L.removeEventListener("ended", S._endTimers[A._id], !1);
                }, L.addEventListener("ended", S._endTimers[A._id], !1));
              } catch (_e) {
                S._emit("playerror", A._id, _e);
              }
            };
            L.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (L.src = S._src, L.load());
            var J = window && window.ejecta || !L.readyState && o._navigator.isCocoonJS;
            if (L.readyState >= 3 || J)
              ae();
            else {
              S._playLock = !0, S._state = "loading";
              var de = function() {
                S._state = "loaded", ae(), L.removeEventListener(o._canPlayEvent, de, !1);
              };
              L.addEventListener(o._canPlayEvent, de, !1), S._clearTimer(A._id);
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
          for (var S = f._getSoundIds(l), w = 0; w < S.length; w++) {
            f._clearTimer(S[w]);
            var T = f._soundById(S[w]);
            if (T && !T._paused && (T._seek = f.seek(S[w]), T._rateSeek = 0, T._paused = !0, f._stopFade(S[w]), T._node))
              if (f._webAudio) {
                if (!T._node.bufferSource)
                  continue;
                typeof T._node.bufferSource.stop > "u" ? T._node.bufferSource.noteOff(0) : T._node.bufferSource.stop(0), f._cleanBuffer(T._node);
              } else (!isNaN(T._node.duration) || T._node.duration === 1 / 0) && T._node.pause();
            arguments[1] || f._emit("pause", T ? T._id : null);
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
          var S = this;
          if (S._state !== "loaded" || S._playLock)
            return S._queue.push({
              event: "stop",
              action: function() {
                S.stop(l);
              }
            }), S;
          for (var w = S._getSoundIds(l), T = 0; T < w.length; T++) {
            S._clearTimer(w[T]);
            var _ = S._soundById(w[T]);
            _ && (_._seek = _._start || 0, _._rateSeek = 0, _._paused = !0, _._ended = !0, S._stopFade(w[T]), _._node && (S._webAudio ? _._node.bufferSource && (typeof _._node.bufferSource.stop > "u" ? _._node.bufferSource.noteOff(0) : _._node.bufferSource.stop(0), S._cleanBuffer(_._node)) : (!isNaN(_._node.duration) || _._node.duration === 1 / 0) && (_._node.currentTime = _._start || 0, _._node.pause(), _._node.duration === 1 / 0 && S._clearSound(_._node))), f || S._emit("stop", _._id));
          }
          return S;
        },
        /**
         * Mute/unmute a single sound or all sounds in this Howl group.
         * @param  {Boolean} muted Set to true to mute and false to unmute.
         * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
         * @return {Howl}
         */
        mute: function(l, f) {
          var S = this;
          if (S._state !== "loaded" || S._playLock)
            return S._queue.push({
              event: "mute",
              action: function() {
                S.mute(l, f);
              }
            }), S;
          if (typeof f > "u")
            if (typeof l == "boolean")
              S._muted = l;
            else
              return S._muted;
          for (var w = S._getSoundIds(f), T = 0; T < w.length; T++) {
            var _ = S._soundById(w[T]);
            _ && (_._muted = l, _._interval && S._stopFade(_._id), S._webAudio && _._node ? _._node.gain.setValueAtTime(l ? 0 : _._volume, o.ctx.currentTime) : _._node && (_._node.muted = o._muted ? !0 : l), S._emit("mute", _._id));
          }
          return S;
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
          var l = this, f = arguments, S, w;
          if (f.length === 0)
            return l._volume;
          if (f.length === 1 || f.length === 2 && typeof f[1] > "u") {
            var T = l._getSoundIds(), _ = T.indexOf(f[0]);
            _ >= 0 ? w = parseInt(f[0], 10) : S = parseFloat(f[0]);
          } else f.length >= 2 && (S = parseFloat(f[0]), w = parseInt(f[1], 10));
          var A;
          if (typeof S < "u" && S >= 0 && S <= 1) {
            if (l._state !== "loaded" || l._playLock)
              return l._queue.push({
                event: "volume",
                action: function() {
                  l.volume.apply(l, f);
                }
              }), l;
            typeof w > "u" && (l._volume = S), w = l._getSoundIds(w);
            for (var E = 0; E < w.length; E++)
              A = l._soundById(w[E]), A && (A._volume = S, f[2] || l._stopFade(w[E]), l._webAudio && A._node && !A._muted ? A._node.gain.setValueAtTime(S, o.ctx.currentTime) : A._node && !A._muted && (A._node.volume = S * o.volume()), l._emit("volume", A._id));
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
        fade: function(l, f, S, w) {
          var T = this;
          if (T._state !== "loaded" || T._playLock)
            return T._queue.push({
              event: "fade",
              action: function() {
                T.fade(l, f, S, w);
              }
            }), T;
          l = Math.min(Math.max(0, parseFloat(l)), 1), f = Math.min(Math.max(0, parseFloat(f)), 1), S = parseFloat(S), T.volume(l, w);
          for (var _ = T._getSoundIds(w), A = 0; A < _.length; A++) {
            var E = T._soundById(_[A]);
            if (E) {
              if (w || T._stopFade(_[A]), T._webAudio && !E._muted) {
                var M = o.ctx.currentTime, N = M + S / 1e3;
                E._volume = l, E._node.gain.setValueAtTime(l, M), E._node.gain.linearRampToValueAtTime(f, N);
              }
              T._startFadeInterval(E, l, f, S, _[A], typeof w > "u");
            }
          }
          return T;
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
        _startFadeInterval: function(l, f, S, w, T, _) {
          var A = this, E = f, M = S - f, N = Math.abs(M / 0.01), O = Math.max(4, N > 0 ? w / N : w), W = Date.now();
          l._fadeTo = S, l._interval = setInterval(function() {
            var K = (Date.now() - W) / w;
            W = Date.now(), E += M * K, E = Math.round(E * 100) / 100, M < 0 ? E = Math.max(S, E) : E = Math.min(S, E), A._webAudio ? l._volume = E : A.volume(E, l._id, !0), _ && (A._volume = E), (S < f && E <= S || S > f && E >= S) && (clearInterval(l._interval), l._interval = null, l._fadeTo = null, A.volume(S, l._id), A._emit("fade", l._id));
          }, O);
        },
        /**
         * Internal method that stops the currently playing fade when
         * a new fade starts, volume is changed or the sound is stopped.
         * @param  {Number} id The sound id.
         * @return {Howl}
         */
        _stopFade: function(l) {
          var f = this, S = f._soundById(l);
          return S && S._interval && (f._webAudio && S._node.gain.cancelScheduledValues(o.ctx.currentTime), clearInterval(S._interval), S._interval = null, f.volume(S._fadeTo, l), S._fadeTo = null, f._emit("fade", l)), f;
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
          var l = this, f = arguments, S, w, T;
          if (f.length === 0)
            return l._loop;
          if (f.length === 1)
            if (typeof f[0] == "boolean")
              S = f[0], l._loop = S;
            else
              return T = l._soundById(parseInt(f[0], 10)), T ? T._loop : !1;
          else f.length === 2 && (S = f[0], w = parseInt(f[1], 10));
          for (var _ = l._getSoundIds(w), A = 0; A < _.length; A++)
            T = l._soundById(_[A]), T && (T._loop = S, l._webAudio && T._node && T._node.bufferSource && (T._node.bufferSource.loop = S, S && (T._node.bufferSource.loopStart = T._start || 0, T._node.bufferSource.loopEnd = T._stop, l.playing(_[A]) && (l.pause(_[A], !0), l.play(_[A], !0)))));
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
          var l = this, f = arguments, S, w;
          if (f.length === 0)
            w = l._sounds[0]._id;
          else if (f.length === 1) {
            var T = l._getSoundIds(), _ = T.indexOf(f[0]);
            _ >= 0 ? w = parseInt(f[0], 10) : S = parseFloat(f[0]);
          } else f.length === 2 && (S = parseFloat(f[0]), w = parseInt(f[1], 10));
          var A;
          if (typeof S == "number") {
            if (l._state !== "loaded" || l._playLock)
              return l._queue.push({
                event: "rate",
                action: function() {
                  l.rate.apply(l, f);
                }
              }), l;
            typeof w > "u" && (l._rate = S), w = l._getSoundIds(w);
            for (var E = 0; E < w.length; E++)
              if (A = l._soundById(w[E]), A) {
                l.playing(w[E]) && (A._rateSeek = l.seek(w[E]), A._playStart = l._webAudio ? o.ctx.currentTime : A._playStart), A._rate = S, l._webAudio && A._node && A._node.bufferSource ? A._node.bufferSource.playbackRate.setValueAtTime(S, o.ctx.currentTime) : A._node && (A._node.playbackRate = S);
                var M = l.seek(w[E]), N = (l._sprite[A._sprite][0] + l._sprite[A._sprite][1]) / 1e3 - M, O = N * 1e3 / Math.abs(A._rate);
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
          var l = this, f = arguments, S, w;
          if (f.length === 0)
            l._sounds.length && (w = l._sounds[0]._id);
          else if (f.length === 1) {
            var T = l._getSoundIds(), _ = T.indexOf(f[0]);
            _ >= 0 ? w = parseInt(f[0], 10) : l._sounds.length && (w = l._sounds[0]._id, S = parseFloat(f[0]));
          } else f.length === 2 && (S = parseFloat(f[0]), w = parseInt(f[1], 10));
          if (typeof w > "u")
            return 0;
          if (typeof S == "number" && (l._state !== "loaded" || l._playLock))
            return l._queue.push({
              event: "seek",
              action: function() {
                l.seek.apply(l, f);
              }
            }), l;
          var A = l._soundById(w);
          if (A)
            if (typeof S == "number" && S >= 0) {
              var E = l.playing(w);
              E && l.pause(w, !0), A._seek = S, A._ended = !1, l._clearTimer(w), !l._webAudio && A._node && !isNaN(A._node.duration) && (A._node.currentTime = S);
              var M = function() {
                E && l.play(w, !0), l._emit("seek", w);
              };
              if (E && !l._webAudio) {
                var N = function() {
                  l._playLock ? setTimeout(N, 0) : M();
                };
                setTimeout(N, 0);
              } else
                M();
            } else if (l._webAudio) {
              var O = l.playing(w) ? o.ctx.currentTime - A._playStart : 0, W = A._rateSeek ? A._rateSeek - A._seek : 0;
              return A._seek + (W + O * Math.abs(A._rate));
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
            var S = f._soundById(l);
            return S ? !S._paused : !1;
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
          var f = this, S = f._duration, w = f._soundById(l);
          return w && (S = f._sprite[w._sprite][1] / 1e3), S;
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
          for (var l = this, f = l._sounds, S = 0; S < f.length; S++)
            f[S]._paused || l.stop(f[S]._id), l._webAudio || (l._clearSound(f[S]._node), f[S]._node.removeEventListener("error", f[S]._errorFn, !1), f[S]._node.removeEventListener(o._canPlayEvent, f[S]._loadFn, !1), f[S]._node.removeEventListener("ended", f[S]._endFn, !1), o._releaseHtml5Audio(f[S]._node)), delete f[S]._node, l._clearTimer(f[S]._id);
          var w = o._howls.indexOf(l);
          w >= 0 && o._howls.splice(w, 1);
          var T = !0;
          for (S = 0; S < o._howls.length; S++)
            if (o._howls[S]._src === l._src || l._src.indexOf(o._howls[S]._src) >= 0) {
              T = !1;
              break;
            }
          return c && T && delete c[l._src], o.noAudio = !1, l._state = "unloaded", l._sounds = [], l = null, null;
        },
        /**
         * Listen to a custom event.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
         * @return {Howl}
         */
        on: function(l, f, S, w) {
          var T = this, _ = T["_on" + l];
          return typeof f == "function" && _.push(w ? { id: S, fn: f, once: w } : { id: S, fn: f }), T;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(l, f, S) {
          var w = this, T = w["_on" + l], _ = 0;
          if (typeof f == "number" && (S = f, f = null), f || S)
            for (_ = 0; _ < T.length; _++) {
              var A = S === T[_].id;
              if (f === T[_].fn && A || !f && A) {
                T.splice(_, 1);
                break;
              }
            }
          else if (l)
            w["_on" + l] = [];
          else {
            var E = Object.keys(w);
            for (_ = 0; _ < E.length; _++)
              E[_].indexOf("_on") === 0 && Array.isArray(w[E[_]]) && (w[E[_]] = []);
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
        once: function(l, f, S) {
          var w = this;
          return w.on(l, f, S, 1), w;
        },
        /**
         * Emit all events of a specific type and pass the sound id.
         * @param  {String} event Event name.
         * @param  {Number} id    Sound ID.
         * @param  {Number} msg   Message to go with event.
         * @return {Howl}
         */
        _emit: function(l, f, S) {
          for (var w = this, T = w["_on" + l], _ = T.length - 1; _ >= 0; _--)
            (!T[_].id || T[_].id === f || l === "load") && (setTimeout((function(A) {
              A.call(this, f, S);
            }).bind(w, T[_].fn), 0), T[_].once && w.off(l, T[_].fn, T[_].id));
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
            var S = f._queue[0];
            S.event === l && (f._queue.shift(), f._loadQueue()), l || S.action();
          }
          return f;
        },
        /**
         * Fired when playback ends at the end of the duration.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _ended: function(l) {
          var f = this, S = l._sprite;
          if (!f._webAudio && l._node && !l._node.paused && !l._node.ended && l._node.currentTime < l._stop)
            return setTimeout(f._ended.bind(f, l), 100), f;
          var w = !!(l._loop || f._sprite[S][2]);
          if (f._emit("end", l._id), !f._webAudio && w && f.stop(l._id, !0).play(l._id), f._webAudio && w) {
            f._emit("play", l._id), l._seek = l._start || 0, l._rateSeek = 0, l._playStart = o.ctx.currentTime;
            var T = (l._stop - l._start) * 1e3 / Math.abs(l._rate);
            f._endTimers[l._id] = setTimeout(f._ended.bind(f, l), T);
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
              var S = f._soundById(l);
              S && S._node && S._node.removeEventListener("ended", f._endTimers[l], !1);
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
          for (var f = this, S = 0; S < f._sounds.length; S++)
            if (l === f._sounds[S]._id)
              return f._sounds[S];
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
          var l = this, f = l._pool, S = 0, w = 0;
          if (!(l._sounds.length < f)) {
            for (w = 0; w < l._sounds.length; w++)
              l._sounds[w]._ended && S++;
            for (w = l._sounds.length - 1; w >= 0; w--) {
              if (S <= f)
                return;
              l._sounds[w]._ended && (l._webAudio && l._sounds[w]._node && l._sounds[w]._node.disconnect(0), l._sounds.splice(w, 1), S--);
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
            for (var S = [], w = 0; w < f._sounds.length; w++)
              S.push(f._sounds[w]._id);
            return S;
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
          var f = this, S = o._navigator && o._navigator.vendor.indexOf("Apple") >= 0;
          if (!l.bufferSource)
            return f;
          if (o._scratchBuffer && l.bufferSource && (l.bufferSource.onended = null, l.bufferSource.disconnect(0), S))
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
          var l = this, f = l._parent, S = o._muted || l._muted || l._parent._muted ? 0 : l._volume;
          return f._webAudio ? (l._node = typeof o.ctx.createGain > "u" ? o.ctx.createGainNode() : o.ctx.createGain(), l._node.gain.setValueAtTime(S, o.ctx.currentTime), l._node.paused = !0, l._node.connect(o.masterGain)) : o.noAudio || (l._node = o._obtainHtml5Audio(), l._errorFn = l._errorListener.bind(l), l._node.addEventListener("error", l._errorFn, !1), l._loadFn = l._loadListener.bind(l), l._node.addEventListener(o._canPlayEvent, l._loadFn, !1), l._endFn = l._endListener.bind(l), l._node.addEventListener("ended", l._endFn, !1), l._node.src = f._src, l._node.preload = f._preload === !0 ? "auto" : f._preload, l._node.volume = S * o.volume(), l._node.load()), l;
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
          for (var S = atob(f.split(",")[1]), w = new Uint8Array(S.length), T = 0; T < S.length; ++T)
            w[T] = S.charCodeAt(T);
          m(w.buffer, l);
        } else {
          var _ = new XMLHttpRequest();
          _.open(l._xhr.method, f, !0), _.withCredentials = l._xhr.withCredentials, _.responseType = "arraybuffer", l._xhr.headers && Object.keys(l._xhr.headers).forEach(function(A) {
            _.setRequestHeader(A, l._xhr.headers[A]);
          }), _.onload = function() {
            var A = (_.status + "")[0];
            if (A !== "0" && A !== "2" && A !== "3") {
              l._emit("loaderror", null, "Failed loading audio file with status: " + _.status + ".");
              return;
            }
            m(_.response, l);
          }, _.onerror = function() {
            l._webAudio && (l._html5 = !0, l._webAudio = !1, l._sounds = [], delete c[f], l.load());
          }, p(_);
        }
      }, p = function(l) {
        try {
          l.send();
        } catch {
          l.onerror();
        }
      }, m = function(l, f) {
        var S = function() {
          f._emit("loaderror", null, "Decoding audio data failed.");
        }, w = function(T) {
          T && f._sounds.length > 0 ? (c[f._src] = T, g(f, T)) : S();
        };
        typeof Promise < "u" && o.ctx.decodeAudioData.length === 1 ? o.ctx.decodeAudioData(l).then(w).catch(S) : o.ctx.decodeAudioData(l, w, S);
      }, g = function(l, f) {
        f && !l._duration && (l._duration = f.duration), Object.keys(l._sprite).length === 0 && (l._sprite = { __default: [0, l._duration * 1e3] }), l._state !== "loaded" && (l._state = "loaded", l._emit("load"), l._loadQueue());
      }, v = function() {
        if (o.usingWebAudio) {
          try {
            typeof AudioContext < "u" ? o.ctx = new AudioContext() : typeof webkitAudioContext < "u" ? o.ctx = new webkitAudioContext() : o.usingWebAudio = !1;
          } catch {
            o.usingWebAudio = !1;
          }
          o.ctx || (o.usingWebAudio = !1);
          var l = /iP(hone|od|ad)/.test(o._navigator && o._navigator.platform), f = o._navigator && o._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), S = f ? parseInt(f[1], 10) : null;
          if (l && S && S < 9) {
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
        var m = this;
        if (!m.ctx || !m.ctx.listener)
          return m;
        var g = m._orientation;
        if (i = typeof i != "number" ? g[1] : i, a = typeof a != "number" ? g[2] : a, c = typeof c != "number" ? g[3] : c, d = typeof d != "number" ? g[4] : d, p = typeof p != "number" ? g[5] : p, typeof o == "number")
          m._orientation = [o, i, a, c, d, p], typeof m.ctx.listener.forwardX < "u" ? (m.ctx.listener.forwardX.setTargetAtTime(o, Howler.ctx.currentTime, 0.1), m.ctx.listener.forwardY.setTargetAtTime(i, Howler.ctx.currentTime, 0.1), m.ctx.listener.forwardZ.setTargetAtTime(a, Howler.ctx.currentTime, 0.1), m.ctx.listener.upX.setTargetAtTime(c, Howler.ctx.currentTime, 0.1), m.ctx.listener.upY.setTargetAtTime(d, Howler.ctx.currentTime, 0.1), m.ctx.listener.upZ.setTargetAtTime(p, Howler.ctx.currentTime, 0.1)) : m.ctx.listener.setOrientation(o, i, a, c, d, p);
        else
          return g;
        return m;
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
          var m = a._soundById(d[p]);
          if (m)
            if (typeof o == "number")
              m._stereo = o, m._pos = [o, 0, 0], m._node && (m._pannerAttr.panningModel = "equalpower", (!m._panner || !m._panner.pan) && n(m, c), c === "spatial" ? typeof m._panner.positionX < "u" ? (m._panner.positionX.setValueAtTime(o, Howler.ctx.currentTime), m._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime), m._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime)) : m._panner.setPosition(o, 0, 0) : m._panner.pan.setValueAtTime(o, Howler.ctx.currentTime)), a._emit("stereo", m._id);
            else
              return m._stereo;
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
        for (var p = d._getSoundIds(c), m = 0; m < p.length; m++) {
          var g = d._soundById(p[m]);
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
        for (var p = d._getSoundIds(c), m = 0; m < p.length; m++) {
          var g = d._soundById(p[m]);
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
        for (var p = o._getSoundIds(c), m = 0; m < p.length; m++)
          if (d = o._soundById(p[m]), d) {
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
            var v = d._panner;
            v || (d._pos || (d._pos = o._pos || [0, 0, -0.5]), n(d, "spatial"), v = d._panner), v.coneInnerAngle = g.coneInnerAngle, v.coneOuterAngle = g.coneOuterAngle, v.coneOuterGain = g.coneOuterGain, v.distanceModel = g.distanceModel, v.maxDistance = g.maxDistance, v.refDistance = g.refDistance, v.rolloffFactor = g.rolloffFactor, v.panningModel = g.panningModel;
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
  })(uc)), uc;
}
var nM = tM();
const rM = /* @__PURE__ */ fg(nM), { Howl: kS } = rM, id = 500, Et = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let cr = {}, fi = !1, sd = "";
function wi() {
  return typeof kS == "function";
}
function cc(e, n = 50) {
  const o = Number(e), i = Number.isFinite(o) ? o : n;
  return Math.min(1, Math.max(0, i / 100));
}
function AS(e) {
  return new kS({
    src: [e],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function CS(e, n, o = id) {
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
function Ba(e, { unload: n = !1 } = {}) {
  var o;
  e && (CS(e, 0, Math.min(id, 300)), (o = globalThis.setTimeout) == null || o.call(globalThis, () => {
    try {
      e.pause(), n && e.unload();
    } catch {
    }
  }, Math.min(id, 320)));
}
function oM(e) {
  return !(e != null && e.streamUrl) || !wi() ? null : ((!Et.music || Et.music.__synapseSrc !== e.streamUrl) && (Ba(Et.music, { unload: !0 }), Et.music = AS(e.streamUrl), Et.music.__synapseSrc = e.streamUrl), Et.music);
}
function iM(e) {
  if (!(e != null && e.streamUrl) || !wi()) return null;
  const n = e.id || e.streamUrl, o = Et.ambient.get(n);
  if (o && o.__synapseSrc === e.streamUrl) return o;
  Ba(o, { unload: !0 });
  const i = AS(e.streamUrl);
  return i.__synapseSrc = e.streamUrl, Et.ambient.set(n, i), i;
}
function sM() {
  return [
    Et.music,
    ...Et.ambient.values()
  ].filter(Boolean);
}
function PS() {
  sM().forEach((e) => Ba(e));
}
function aM(e) {
  for (const [n, o] of Et.ambient.entries())
    e.has(n) || (Ba(o, { unload: !0 }), Et.ambient.delete(n));
}
function ig(e, n) {
  if (e)
    try {
      e.playing() || e.play(), CS(e, n), sd = "";
    } catch (o) {
      sd = (o == null ? void 0 : o.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function lM(e = {}) {
  cr = { ...cr, ...e };
  const n = Fa(cr);
  if (!wi()) return pa(n);
  if (!fi)
    return PS(), pa(n);
  const o = oM(n.musicTrack), i = cc(cr.musicVolume, 60), a = cc(cr.ambientVolume, 50), c = /* @__PURE__ */ new Set(), d = [];
  return n.ambientLayers.forEach((p) => {
    var f;
    const m = p.id || p.streamUrl;
    c.add(m);
    const g = iM(p), v = Number((f = cr.audioChannels) == null ? void 0 : f[p.id]), l = Number.isFinite(v) ? cc(v, 0) : Math.min(1, Math.max(0, a * (p.volumeBias ?? 1)));
    d.push([g, l]);
  }), aM(c), ig(o, i), d.forEach(([p, m]) => ig(p, m)), pa(n);
}
function uM(e) {
  return fi = !!e, fi || PS(), fi;
}
function pa(e = Fa(cr)) {
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
    error: sd
  };
}
const cM = "synapse.focusRoom.audioPrefs.v1";
function dM(e) {
  var n;
  try {
    (n = globalThis.localStorage) == null || n.setItem(cM, JSON.stringify({
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
function fM() {
  const e = ne((m) => m.musicType), n = ne((m) => m.ambientSound), o = ne((m) => m.musicVolume), i = ne((m) => m.ambientVolume), a = ne((m) => m.audioChannels), c = ne((m) => m.audioPlaying), [d, p] = C.useState(() => pa(Fa({
    musicType: e,
    ambientSound: n
  })));
  return C.useEffect(() => {
    const m = { musicType: e, ambientSound: n, musicVolume: o, ambientVolume: i, audioChannels: a };
    let g = !1;
    return uM(c), dM(m), lM(m).then((v) => {
      g || p(v);
    }), () => {
      g = !0;
    };
  }, [n, i, a, c, e, o]), d;
}
function pM() {
  const e = ne(), n = C.useCallback(async (i = "", a = "", c = {}) => {
    var v;
    e.pauseTimer({ pauseAudio: !0 }), e.closeSummary();
    const d = typeof i == "string" || typeof i == "number" ? i : "", p = typeof a == "string" ? a : "", m = hM(p, c), g = String(d || e.selectedMaterialId || ((v = e.selectedMaterial) == null ? void 0 : v.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const l = globalThis.returnFromFocusRoomToWorkspace(g, m);
        l && typeof l.then == "function" && await l, sg(m.action || p, m);
        return;
      } catch (l) {
        console.error("Could not return from Focus Room:", l);
      }
    globalThis.location.hash = "", sg(m.action || p, m);
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
function ES(e) {
  const n = String(e || "").trim().toLowerCase();
  return ["flashcards", "quiz", "assistant", "mindmap", "timeline", "source", "notes"].includes(n) ? n : "";
}
function hM(e, n = {}) {
  const o = n && typeof n == "object" && !Array.isArray(n) ? n : {}, i = ES(e || o.action);
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
function sg(e, n = {}) {
  const o = ES(e);
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
function mM(e = 3e3) {
  const n = ne((i) => i.setIdle), o = ne((i) => i.isIdle);
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
function yM() {
  const e = ne((i) => i.timerState || (i.timerStatus === "studying" ? "running" : i.timerStatus)), n = ne((i) => i.view), o = ne((i) => i.tickTimer);
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
function gM() {
  const e = ne((n) => n.selectedScene);
  return _r(e);
}
function vM(e) {
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
function SM() {
  const [e, n] = C.useState(""), [o, i] = C.useState(!1), [a, c] = C.useState(!1), d = ne((A) => A.view), p = mM(3e3), m = gM(), g = fM(), v = pM();
  yM();
  const l = ne(Yx(vM)), f = ne((A) => A.summaryRecord), S = ne((A) => A.endSession), w = ne((A) => A.initializeFocusRoom);
  C.useEffect(() => {
    w();
  }, [w]), C.useEffect(() => {
    l != null && l.materialId && Ld(l.materialId, l);
  }, [l]), C.useEffect(() => {
    d === "session" || !f || u0("focus-room");
  }, [f, d]), C.useEffect(() => {
    d !== "session" && (i(!1), n(""), c(!1));
  }, [d]), C.useEffect(() => {
    const A = (E) => {
      E.key === "Escape" && (o ? (E.preventDefault(), i(!1)) : e ? n("") : a && c(!1));
    };
    return window.addEventListener("keydown", A), () => window.removeEventListener("keydown", A);
  }, [a, o, e]);
  const T = (...A) => {
    v.returnToWorkspace(...A);
  }, _ = async () => {
    c(!1), i(!1), n(""), S(), await T();
  };
  return /* @__PURE__ */ k.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${p ? "is-idle" : ""}`.trim(),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ k.jsx(AC, { scene: m }),
        /* @__PURE__ */ k.jsx(Na, { mode: "wait", children: d === "session" ? /* @__PURE__ */ k.jsxs(
          wr.div,
          {
            className: "focus-room-view focus-session-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: Bd,
            children: [
              o ? /* @__PURE__ */ k.jsx("button", { type: "button", className: "focus-mode-exit-hit-area", onClick: () => i(!1), children: "Exit Focus Mode" }) : /* @__PURE__ */ k.jsx(yP, { onWorkspace: T, onOpenTrail: () => n("trail"), onOpenCompanion: () => n("companion"), onOpenSettings: () => n("settings"), onExit: () => c(!0) }),
              /* @__PURE__ */ k.jsx("section", { className: `focus-session-stage ${o ? "is-focus-mode" : ""}`.trim(), "aria-hidden": "true" }),
              o ? /* @__PURE__ */ k.jsx(eM, { onExit: () => i(!1) }) : /* @__PURE__ */ k.jsx(kP, { audioState: g, onFocusMode: () => i(!0) }),
              o ? null : /* @__PURE__ */ k.jsx(Jb, { audioState: g, utilityPanel: e, onClose: () => n(""), onWorkspace: T }),
              /* @__PURE__ */ k.jsx(sb, {}),
              /* @__PURE__ */ k.jsx(wM, { open: a, onClose: () => c(!1), onConfirm: _ })
            ]
          },
          "session"
        ) : null })
      ]
    }
  );
}
function wM({ open: e, onClose: n, onConfirm: o }) {
  return e ? /* @__PURE__ */ k.jsx("div", { className: "focus-exit-overlay", role: "presentation", children: /* @__PURE__ */ k.jsxs("div", { className: "focus-exit-dialog liquid-glass", role: "dialog", "aria-modal": "true", "aria-labelledby": "focus-exit-title", children: [
    /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Leave this room?" }),
    /* @__PURE__ */ k.jsx("h2", { id: "focus-exit-title", children: "End focus session" }),
    /* @__PURE__ */ k.jsx("p", { children: "Your focused time will be saved to your Focus Trail." }),
    /* @__PURE__ */ k.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ k.jsx(be, { onClick: n, children: "Continue focusing" }),
      /* @__PURE__ */ k.jsx(be, { variant: "primary", onClick: o, children: "End and exit" })
    ] })
  ] }) }) : null;
}
let dc = null;
function xM(e, n) {
  const o = globalThis.__synapseFocusRoomApi || {};
  if (typeof o[e] != "function") {
    console.warn(`Synapse Focus Room action "${e}" is not available yet.`);
    return;
  }
  return o[e](...n);
}
function _M() {
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
    globalThis[n] = (...i) => xM(o, i);
  });
}
function TM(e = {}) {
  _M();
  const n = e.root || document.getElementById("focusRoomRoot");
  if (!n)
    throw new Error("Focus Room root element was not found.");
  dc || (dc = $x.createRoot(n), dc.render(
    pn.createElement(
      pn.StrictMode,
      null,
      pn.createElement(SM)
    )
  ));
}
const kM = "synapse.generated.history.v6", bS = "synapse.active.generated.v6", AM = "synapse.flashcards.deck.v1", CM = "synapse.quiz.history.v1", PM = "synapse.focusRoom.return-target.v1";
function rf(e, n) {
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
function EM(e, n) {
  var o;
  try {
    return (o = globalThis.localStorage) == null || o.setItem(e, n), !0;
  } catch (i) {
    return console.warn(`Could not write ${e}:`, i), !1;
  }
}
function bM(e, n) {
  var o;
  try {
    return (o = globalThis.localStorage) == null || o.setItem(e, JSON.stringify(n)), !0;
  } catch (i) {
    return console.warn(`Could not write ${e}:`, i), !1;
  }
}
function MS() {
  const e = rf(kM, []);
  return Array.isArray(e) ? e : [];
}
function MM(e) {
  const n = String((e == null ? void 0 : e.title) || "").trim();
  return n || String((e == null ? void 0 : e.summary) || "").split(/\n+/).map((i) => i.replace(/^#+\s*/, "").trim()).find((i) => i.length > 4) || "Generated Study Notes";
}
function RS(e = {}) {
  return [
    e.id ? `history:${e.id}` : "",
    e.sourceFingerprint ? `fingerprint:${e.sourceFingerprint}` : "",
    e.clientFingerprint ? `fingerprint:${e.clientFingerprint}` : ""
  ].filter(Boolean);
}
function RM(e = {}) {
  const n = rf(AM, {}), i = RS(e).map((a) => n == null ? void 0 : n[a]).find((a) => a && Array.isArray(a.cards) && a.cards.length);
  return (i == null ? void 0 : i.cards) || [];
}
function DM(e = {}) {
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
function NM(e = []) {
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
function IM(e = {}) {
  const n = rf(CM, {}), i = RS(e).flatMap((c) => Array.isArray(n == null ? void 0 : n[c]) ? n[c] : []), a = /* @__PURE__ */ new Set();
  return NM(i).filter((c) => {
    const d = DM(c);
    return !d || a.has(d) ? !1 : (a.add(d), !0);
  }).sort((c, d) => new Date(d.createdAt || 0) - new Date(c.createdAt || 0));
}
function FM(e = {}) {
  return {
    materialId: String(e.id || e.sourceFingerprint || e.clientFingerprint || "current-material"),
    materialTitle: MM(e),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: e.summary || "",
    sections: e.sections || {},
    flashcards: RM(e),
    quizzes: IM(e),
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
function DS() {
  return MS().filter((e) => e && (e.id || e.summary)).map(FM);
}
function NS(e = "") {
  const n = String(e || "");
  return n && DS().find(
    (o) => o.materialId === n || o.sourceFingerprint === n || o.clientFingerprint === n
  ) || null;
}
function IS() {
  var n;
  const e = ((n = globalThis.localStorage) == null ? void 0 : n.getItem(bS)) || "";
  return NS(e);
}
function jM(e = "") {
  var i;
  const n = e || ((i = IS()) == null ? void 0 : i.materialId) || "", o = n ? `/${encodeURIComponent(n)}` : "";
  globalThis.location.hash = `#/focus-room${o}`;
}
function OM(e = "", n = {}) {
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
async function LM(e = "", n = {}) {
  const o = String(e || ""), i = MS().find(
    (d) => String((d == null ? void 0 : d.id) || "") === o || String((d == null ? void 0 : d.sourceFingerprint) || (d == null ? void 0 : d.source_fingerprint) || "") === o || String((d == null ? void 0 : d.clientFingerprint) || (d == null ? void 0 : d.client_fingerprint) || "") === o
  ) || null, a = String((i == null ? void 0 : i.id) || "");
  a && EM(bS, a);
  const c = OM(a, n);
  c.action && bM(PM, c), globalThis.location.href = a ? `index.html?focusReturn=${encodeURIComponent(a)}` : "index.html";
}
function VM() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: IS,
    getSynapseFocusRoomMaterial: NS,
    getSynapseFocusRoomMaterials: DS,
    openSynapseFocusRoom: jM,
    returnFromFocusRoomToWorkspace: LM
  });
}
const FS = document.getElementById("focusRoomRoot");
if (!FS)
  throw new Error("Focus Room root element was not found.");
var ug;
(ug = document.getElementById("focusRoomFallbackTitle")) == null || ug.remove();
globalThis.apiClient = new dg(Fx);
VM();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
TM({ root: FS });
