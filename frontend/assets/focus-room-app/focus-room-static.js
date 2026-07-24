function Vx(e, n) {
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
function Bx(e) {
  const o = String(e || "").toLowerCase().split(".");
  if (o.length !== 4 || o.some((a) => !/^\d+$/.test(a))) return !1;
  const i = o.map(Number);
  return i.some((a) => a < 0 || a > 255) ? !1 : i[0] === 10 || i[0] === 172 && i[1] >= 16 && i[1] <= 31 || i[0] === 192 && i[1] === 168;
}
function hg(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function nh(e) {
  return hg(e) || Bx(e);
}
function zx(e) {
  return !e || hg(e) ? "127.0.0.1" : e;
}
const Ux = (() => {
  var p, m, y, v;
  const { protocol: e, hostname: n, port: o } = window.location, i = String(window.SYNAPSE_BACKEND_PORT || ((m = (p = document.body) == null ? void 0 : p.dataset) == null ? void 0 : m.apiPort) || "8001").trim(), a = `http://${zx(n)}:${i || "8001"}`, c = String(window.SYNAPSE_API_BASE || ((v = (y = document.body) == null ? void 0 : y.dataset) == null ? void 0 : v.apiBase) || "").replace(/\/+$/, ""), d = `${e}//${window.location.host}`.replace(/\/+$/, "");
  return c && !(nh(n) && o !== i && c === d) ? c : e === "file:" || nh(n) && o !== i ? a : `${e}//${window.location.host}`;
})();
class Us extends Error {
  constructor(n, { cause: o } = {}) {
    super(n), this.name = "ApiConnectionError", this.cause = o;
  }
}
const rh = "synapse.client.id.v1";
function Un() {
  return globalThis.window || globalThis;
}
function Zr(e, n = 220) {
  return String(e || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
}
function oh() {
  const e = globalThis.crypto || Un().crypto;
  return e != null && e.randomUUID ? e.randomUUID() : `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
function $x() {
  var n, o;
  const e = Un();
  try {
    const i = (n = e.localStorage) == null ? void 0 : n.getItem(rh);
    if (i) return i;
    const a = oh();
    return (o = e.localStorage) == null || o.setItem(rh, a), a;
  } catch {
    return oh();
  }
}
function Hx(e = {}) {
  if (typeof Headers < "u" && e instanceof Headers) {
    const n = {};
    return e.forEach((o, i) => {
      n[i] = o;
    }), n;
  }
  return Array.isArray(e) ? Object.fromEntries(e) : { ...e || {} };
}
class yg {
  constructor(n, { fetchImpl: o } = {}) {
    var a, c;
    const i = Un();
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
    const o = Un(), i = Hx(n);
    i["X-Synapse-Client-Id"] = Zr($x(), 160);
    const a = (d = (c = o.SynapseAuth) == null ? void 0 : c.getStoredSession) == null ? void 0 : d.call(c);
    if (a && typeof a == "object" && (a.accountId && (i["X-Synapse-User-Id"] = Zr(a.accountId, 160)), a.email && (i["X-Synapse-User-Email"] = Zr(a.email, 220)), a.displayName && (i["X-Synapse-User-Name"] = Zr(a.displayName, 180)), a.authMode && (i["X-Synapse-Auth-Mode"] = Zr(a.authMode, 60)), a.role && (i["X-Synapse-User-Role"] = Zr(a.role, 80))), (p = o.SynapseAuth) != null && p.authHeaders && !i.Authorization && !i.authorization)
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
    let p = null, m = null, y = null;
    const v = c.signal;
    d > 0 && typeof AbortController < "u" && (p = new AbortController(), y = () => p.abort(), v && (v.aborted ? p.abort() : v.addEventListener("abort", y, { once: !0 })), m = Un().setTimeout(() => p.abort(), d), c.signal = p.signal);
    try {
      return await this.fetchImpl(i, c);
    } catch (f) {
      throw (l = p == null ? void 0 : p.signal) != null && l.aborted ? new Us(this.timeoutMessage(d), { cause: f }) : new Us(this.connectionMessage(), { cause: f });
    } finally {
      m && Un().clearTimeout(m), v && y && v.removeEventListener("abort", y);
    }
  }
  async warmup({ attempts: n = 2, retryDelayMs: o = 1500, timeoutMs: i = 6e4, maxWaitMs: a = 0, signal: c } = {}) {
    const d = Math.max(1, Math.floor(Number(n) || 1)), p = Math.max(0, Number(a) || 0), m = Date.now();
    let y = null;
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
        y = new Us(
          `Synapse hosted service returned ${(S == null ? void 0 : S.status) || "an unexpected status"} while preparing your analysis.`
        );
      } catch (S) {
        y = S;
      }
      if (v < d - 1 && o > 0) {
        const S = p > 0 ? p - (Date.now() - m) : o;
        if (p > 0 && S <= 0) break;
        await new Promise((w) => Un().setTimeout(w, Math.min(o, S)));
      }
    }
    throw y || new Us(this.connectionMessage());
  }
  isRetryableResponse(n) {
    return [502, 503, 504].includes(Number(n == null ? void 0 : n.status));
  }
  async fetchWithRetry(n, o = {}, { attempts: i = 3, retryDelayMs: a = 3e3 } = {}) {
    const c = Math.max(1, Math.floor(Number(i) || 1));
    let d = null;
    for (let p = 0; p < c; p += 1) {
      if (d = await this.fetch(n, o), !this.isRetryableResponse(d) || p === c - 1) return d;
      a > 0 && await new Promise((m) => Un().setTimeout(m, a));
    }
    return d;
  }
}
var oi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function gg(e) {
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
var ih;
function Wx() {
  if (ih) return fe;
  ih = 1;
  var e = Symbol.for("react.element"), n = Symbol.for("react.portal"), o = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), d = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), y = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), l = Symbol.iterator;
  function f(D) {
    return D === null || typeof D != "object" ? null : (D = l && D[l] || D["@@iterator"], typeof D == "function" ? D : null);
  }
  var S = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, w = Object.assign, k = {};
  function A(D, V, ce) {
    this.props = D, this.context = V, this.refs = k, this.updater = ce || S;
  }
  A.prototype.isReactComponent = {}, A.prototype.setState = function(D, V) {
    if (typeof D != "object" && typeof D != "function" && D != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, D, V, "setState");
  }, A.prototype.forceUpdate = function(D) {
    this.updater.enqueueForceUpdate(this, D, "forceUpdate");
  };
  function T() {
  }
  T.prototype = A.prototype;
  function E(D, V, ce) {
    this.props = D, this.context = V, this.refs = k, this.updater = ce || S;
  }
  var M = E.prototype = new T();
  M.constructor = E, w(M, A.prototype), M.isPureReactComponent = !0;
  var N = Array.isArray, O = Object.prototype.hasOwnProperty, W = { current: null }, G = { key: !0, ref: !0, __self: !0, __source: !0 };
  function K(D, V, ce) {
    var pe, he = {}, ye = null, Ce = null;
    if (V != null) for (pe in V.ref !== void 0 && (Ce = V.ref), V.key !== void 0 && (ye = "" + V.key), V) O.call(V, pe) && !G.hasOwnProperty(pe) && (he[pe] = V[pe]);
    var we = arguments.length - 2;
    if (we === 1) he.children = ce;
    else if (1 < we) {
      for (var Me = Array(we), yt = 0; yt < we; yt++) Me[yt] = arguments[yt + 2];
      he.children = Me;
    }
    if (D && D.defaultProps) for (pe in we = D.defaultProps, we) he[pe] === void 0 && (he[pe] = we[pe]);
    return { $$typeof: e, type: D, key: ye, ref: Ce, props: he, _owner: W.current };
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
    var Ce = !1;
    if (D === null) Ce = !0;
    else switch (ye) {
      case "string":
      case "number":
        Ce = !0;
        break;
      case "object":
        switch (D.$$typeof) {
          case e:
          case n:
            Ce = !0;
        }
    }
    if (Ce) return Ce = D, he = he(Ce), D = pe === "" ? "." + de(Ce, 0) : pe, N(he) ? (ce = "", D != null && (ce = D.replace(q, "$&/") + "/"), ue(he, V, ce, "", function(yt) {
      return yt;
    })) : he != null && (X(he) && (he = L(he, ce + (!he.key || Ce && Ce.key === he.key ? "" : ("" + he.key).replace(q, "$&/") + "/") + D)), V.push(he)), 1;
    if (Ce = 0, pe = pe === "" ? "." : pe + ":", N(D)) for (var we = 0; we < D.length; we++) {
      ye = D[we];
      var Me = pe + de(ye, we);
      Ce += ue(ye, V, ce, Me, he);
    }
    else if (Me = f(D), typeof Me == "function") for (D = Me.call(D), we = 0; !(ye = D.next()).done; ) ye = ye.value, Me = pe + de(ye, we++), Ce += ue(ye, V, ce, Me, he);
    else if (ye === "object") throw V = String(D), Error("Objects are not valid as a React child (found: " + (V === "[object Object]" ? "object with keys {" + Object.keys(D).join(", ") + "}" : V) + "). If you meant to render a collection of children, use an array instead.");
    return Ce;
  }
  function Te(D, V, ce) {
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
  var Se = { current: null }, U = { transition: null }, Z = { ReactCurrentDispatcher: Se, ReactCurrentBatchConfig: U, ReactCurrentOwner: W };
  function Y() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return fe.Children = { map: Te, forEach: function(D, V, ce) {
    Te(D, function() {
      V.apply(this, arguments);
    }, ce);
  }, count: function(D) {
    var V = 0;
    return Te(D, function() {
      V++;
    }), V;
  }, toArray: function(D) {
    return Te(D, function(V) {
      return V;
    }) || [];
  }, only: function(D) {
    if (!X(D)) throw Error("React.Children.only expected to receive a single React element child.");
    return D;
  } }, fe.Component = A, fe.Fragment = o, fe.Profiler = a, fe.PureComponent = E, fe.StrictMode = i, fe.Suspense = m, fe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Z, fe.act = Y, fe.cloneElement = function(D, V, ce) {
    if (D == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + D + ".");
    var pe = w({}, D.props), he = D.key, ye = D.ref, Ce = D._owner;
    if (V != null) {
      if (V.ref !== void 0 && (ye = V.ref, Ce = W.current), V.key !== void 0 && (he = "" + V.key), D.type && D.type.defaultProps) var we = D.type.defaultProps;
      for (Me in V) O.call(V, Me) && !G.hasOwnProperty(Me) && (pe[Me] = V[Me] === void 0 && we !== void 0 ? we[Me] : V[Me]);
    }
    var Me = arguments.length - 2;
    if (Me === 1) pe.children = ce;
    else if (1 < Me) {
      we = Array(Me);
      for (var yt = 0; yt < Me; yt++) we[yt] = arguments[yt + 2];
      pe.children = we;
    }
    return { $$typeof: e, type: D.type, key: he, ref: ye, props: pe, _owner: Ce };
  }, fe.createContext = function(D) {
    return D = { $$typeof: d, _currentValue: D, _currentValue2: D, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, D.Provider = { $$typeof: c, _context: D }, D.Consumer = D;
  }, fe.createElement = K, fe.createFactory = function(D) {
    var V = K.bind(null, D);
    return V.type = D, V;
  }, fe.createRef = function() {
    return { current: null };
  }, fe.forwardRef = function(D) {
    return { $$typeof: p, render: D };
  }, fe.isValidElement = X, fe.lazy = function(D) {
    return { $$typeof: v, _payload: { _status: -1, _result: D }, _init: ve };
  }, fe.memo = function(D, V) {
    return { $$typeof: y, type: D, compare: V === void 0 ? null : V };
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
var sh;
function fd() {
  return sh || (sh = 1, Lu.exports = Wx()), Lu.exports;
}
var C = fd();
const gn = /* @__PURE__ */ gg(C), Ar = /* @__PURE__ */ Vx({
  __proto__: null,
  default: gn
}, [C]);
var $s = {}, Vu = { exports: {} }, mt = {}, Bu = { exports: {} }, zu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ah;
function Gx() {
  return ah || (ah = 1, (function(e) {
    function n(U, Z) {
      var Y = U.length;
      U.push(Z);
      e: for (; 0 < Y; ) {
        var D = Y - 1 >>> 1, V = U[D];
        if (0 < a(V, Z)) U[D] = Z, U[Y] = V, Y = D;
        else break e;
      }
    }
    function o(U) {
      return U.length === 0 ? null : U[0];
    }
    function i(U) {
      if (U.length === 0) return null;
      var Z = U[0], Y = U.pop();
      if (Y !== Z) {
        U[0] = Y;
        e: for (var D = 0, V = U.length, ce = V >>> 1; D < ce; ) {
          var pe = 2 * (D + 1) - 1, he = U[pe], ye = pe + 1, Ce = U[ye];
          if (0 > a(he, Y)) ye < V && 0 > a(Ce, he) ? (U[D] = Ce, U[ye] = Y, D = ye) : (U[D] = he, U[pe] = Y, D = pe);
          else if (ye < V && 0 > a(Ce, Y)) U[D] = Ce, U[ye] = Y, D = ye;
          else break e;
        }
      }
      return Z;
    }
    function a(U, Z) {
      var Y = U.sortIndex - Z.sortIndex;
      return Y !== 0 ? Y : U.id - Z.id;
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
    var m = [], y = [], v = 1, l = null, f = 3, S = !1, w = !1, k = !1, A = typeof setTimeout == "function" ? setTimeout : null, T = typeof clearTimeout == "function" ? clearTimeout : null, E = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function M(U) {
      for (var Z = o(y); Z !== null; ) {
        if (Z.callback === null) i(y);
        else if (Z.startTime <= U) i(y), Z.sortIndex = Z.expirationTime, n(m, Z);
        else break;
        Z = o(y);
      }
    }
    function N(U) {
      if (k = !1, M(U), !w) if (o(m) !== null) w = !0, ve(O);
      else {
        var Z = o(y);
        Z !== null && Se(N, Z.startTime - U);
      }
    }
    function O(U, Z) {
      w = !1, k && (k = !1, T(K), K = -1), S = !0;
      var Y = f;
      try {
        for (M(Z), l = o(m); l !== null && (!(l.expirationTime > Z) || U && !ae()); ) {
          var D = l.callback;
          if (typeof D == "function") {
            l.callback = null, f = l.priorityLevel;
            var V = D(l.expirationTime <= Z);
            Z = e.unstable_now(), typeof V == "function" ? l.callback = V : l === o(m) && i(m), M(Z);
          } else i(m);
          l = o(m);
        }
        if (l !== null) var ce = !0;
        else {
          var pe = o(y);
          pe !== null && Se(N, pe.startTime - Z), ce = !1;
        }
        return ce;
      } finally {
        l = null, f = Y, S = !1;
      }
    }
    var W = !1, G = null, K = -1, L = 5, X = -1;
    function ae() {
      return !(e.unstable_now() - X < L);
    }
    function q() {
      if (G !== null) {
        var U = e.unstable_now();
        X = U;
        var Z = !0;
        try {
          Z = G(!0, U);
        } finally {
          Z ? de() : (W = !1, G = null);
        }
      } else W = !1;
    }
    var de;
    if (typeof E == "function") de = function() {
      E(q);
    };
    else if (typeof MessageChannel < "u") {
      var ue = new MessageChannel(), Te = ue.port2;
      ue.port1.onmessage = q, de = function() {
        Te.postMessage(null);
      };
    } else de = function() {
      A(q, 0);
    };
    function ve(U) {
      G = U, W || (W = !0, de());
    }
    function Se(U, Z) {
      K = A(function() {
        U(e.unstable_now());
      }, Z);
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
          var Z = 3;
          break;
        default:
          Z = f;
      }
      var Y = f;
      f = Z;
      try {
        return U();
      } finally {
        f = Y;
      }
    }, e.unstable_pauseExecution = function() {
    }, e.unstable_requestPaint = function() {
    }, e.unstable_runWithPriority = function(U, Z) {
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
        return Z();
      } finally {
        f = Y;
      }
    }, e.unstable_scheduleCallback = function(U, Z, Y) {
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
      return V = Y + V, U = { id: v++, callback: Z, priorityLevel: U, startTime: Y, expirationTime: V, sortIndex: -1 }, Y > D ? (U.sortIndex = Y, n(y, U), o(m) === null && U === o(y) && (k ? (T(K), K = -1) : k = !0, Se(N, Y - D))) : (U.sortIndex = V, n(m, U), w || S || (w = !0, ve(O))), U;
    }, e.unstable_shouldYield = ae, e.unstable_wrapCallback = function(U) {
      var Z = f;
      return function() {
        var Y = f;
        f = Z;
        try {
          return U.apply(this, arguments);
        } finally {
          f = Y;
        }
      };
    };
  })(zu)), zu;
}
var lh;
function Kx() {
  return lh || (lh = 1, Bu.exports = Gx()), Bu.exports;
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
var uh;
function Yx() {
  if (uh) return mt;
  uh = 1;
  var e = fd(), n = Kx();
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
  var p = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), m = Object.prototype.hasOwnProperty, y = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, v = {}, l = {};
  function f(t) {
    return m.call(l, t) ? !0 : m.call(v, t) ? !1 : y.test(t) ? l[t] = !0 : (v[t] = !0, !1);
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
  function k(t, r, s, u, h, g, _) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = u, this.attributeNamespace = h, this.mustUseProperty = s, this.propertyName = t, this.type = r, this.sanitizeURL = g, this.removeEmptyString = _;
  }
  var A = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t) {
    A[t] = new k(t, 0, !1, t, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(t) {
    var r = t[0];
    A[r] = new k(r, 1, !1, t[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(t) {
    A[t] = new k(t, 2, !1, t.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(t) {
    A[t] = new k(t, 2, !1, t, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t) {
    A[t] = new k(t, 3, !1, t.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(t) {
    A[t] = new k(t, 3, !0, t, null, !1, !1);
  }), ["capture", "download"].forEach(function(t) {
    A[t] = new k(t, 4, !1, t, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(t) {
    A[t] = new k(t, 6, !1, t, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(t) {
    A[t] = new k(t, 5, !1, t.toLowerCase(), null, !1, !1);
  });
  var T = /[\-:]([a-z])/g;
  function E(t) {
    return t[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t) {
    var r = t.replace(
      T,
      E
    );
    A[r] = new k(r, 1, !1, t, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t) {
    var r = t.replace(T, E);
    A[r] = new k(r, 1, !1, t, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(t) {
    var r = t.replace(T, E);
    A[r] = new k(r, 1, !1, t, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(t) {
    A[t] = new k(t, 1, !1, t.toLowerCase(), null, !1, !1);
  }), A.xlinkHref = new k("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(t) {
    A[t] = new k(t, 1, !1, t.toLowerCase(), null, !0, !0);
  });
  function M(t, r, s, u) {
    var h = A.hasOwnProperty(r) ? A[r] : null;
    (h !== null ? h.type !== 0 : u || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (w(r, s, h, u) && (s = null), u || h === null ? f(r) && (s === null ? t.removeAttribute(r) : t.setAttribute(r, "" + s)) : h.mustUseProperty ? t[h.propertyName] = s === null ? h.type === 3 ? !1 : "" : s : (r = h.attributeName, u = h.attributeNamespace, s === null ? t.removeAttribute(r) : (h = h.type, s = h === 3 || h === 4 && s === !0 ? "" : "" + s, u ? t.setAttributeNS(u, r, s) : t.setAttribute(r, s))));
  }
  var N = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, O = Symbol.for("react.element"), W = Symbol.for("react.portal"), G = Symbol.for("react.fragment"), K = Symbol.for("react.strict_mode"), L = Symbol.for("react.profiler"), X = Symbol.for("react.provider"), ae = Symbol.for("react.context"), q = Symbol.for("react.forward_ref"), de = Symbol.for("react.suspense"), ue = Symbol.for("react.suspense_list"), Te = Symbol.for("react.memo"), ve = Symbol.for("react.lazy"), Se = Symbol.for("react.offscreen"), U = Symbol.iterator;
  function Z(t) {
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
        for (var h = F.stack.split(`
`), g = u.stack.split(`
`), _ = h.length - 1, P = g.length - 1; 1 <= _ && 0 <= P && h[_] !== g[P]; ) P--;
        for (; 1 <= _ && 0 <= P; _--, P--) if (h[_] !== g[P]) {
          if (_ !== 1 || P !== 1)
            do
              if (_--, P--, 0 > P || h[_] !== g[P]) {
                var b = `
` + h[_].replace(" at new ", " at ");
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
      case G:
        return "Fragment";
      case W:
        return "Portal";
      case L:
        return "Profiler";
      case K:
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
      case Te:
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
  function Ce(t) {
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
        return r === K ? "StrictMode" : "Mode";
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
  function yt(t) {
    var r = Me(t) ? "checked" : "value", s = Object.getOwnPropertyDescriptor(t.constructor.prototype, r), u = "" + t[r];
    if (!t.hasOwnProperty(r) && typeof s < "u" && typeof s.get == "function" && typeof s.set == "function") {
      var h = s.get, g = s.set;
      return Object.defineProperty(t, r, { configurable: !0, get: function() {
        return h.call(this);
      }, set: function(_) {
        u = "" + _, g.call(this, _);
      } }), Object.defineProperty(t, r, { enumerable: s.enumerable }), { getValue: function() {
        return u;
      }, setValue: function(_) {
        u = "" + _;
      }, stopTracking: function() {
        t._valueTracker = null, delete t[r];
      } };
    }
  }
  function Di(t) {
    t._valueTracker || (t._valueTracker = yt(t));
  }
  function lf(t) {
    if (!t) return !1;
    var r = t._valueTracker;
    if (!r) return !0;
    var s = r.getValue(), u = "";
    return t && (u = Me(t) ? t.checked ? "true" : "false" : t.value), t = u, t !== s ? (r.setValue(t), !0) : !1;
  }
  function Ni(t) {
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
  function uf(t, r) {
    var s = r.defaultValue == null ? "" : r.defaultValue, u = r.checked != null ? r.checked : r.defaultChecked;
    s = we(r.value != null ? r.value : s), t._wrapperState = { initialChecked: u, initialValue: s, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function cf(t, r) {
    r = r.checked, r != null && M(t, "checked", r, !1);
  }
  function Ga(t, r) {
    cf(t, r);
    var s = we(r.value), u = r.type;
    if (s != null) u === "number" ? (s === 0 && t.value === "" || t.value != s) && (t.value = "" + s) : t.value !== "" + s && (t.value = "" + s);
    else if (u === "submit" || u === "reset") {
      t.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? Ka(t, r.type, s) : r.hasOwnProperty("defaultValue") && Ka(t, r.type, we(r.defaultValue)), r.checked == null && r.defaultChecked != null && (t.defaultChecked = !!r.defaultChecked);
  }
  function df(t, r, s) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var u = r.type;
      if (!(u !== "submit" && u !== "reset" || r.value !== void 0 && r.value !== null)) return;
      r = "" + t._wrapperState.initialValue, s || r === t.value || (t.value = r), t.defaultValue = r;
    }
    s = t.name, s !== "" && (t.name = ""), t.defaultChecked = !!t._wrapperState.initialChecked, s !== "" && (t.name = s);
  }
  function Ka(t, r, s) {
    (r !== "number" || Ni(t.ownerDocument) !== t) && (s == null ? t.defaultValue = "" + t._wrapperState.initialValue : t.defaultValue !== "" + s && (t.defaultValue = "" + s));
  }
  var So = Array.isArray;
  function Cr(t, r, s, u) {
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
  function Ya(t, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(o(91));
    return Y({}, r, { value: void 0, defaultValue: void 0, children: "" + t._wrapperState.initialValue });
  }
  function ff(t, r) {
    var s = r.value;
    if (s == null) {
      if (s = r.children, r = r.defaultValue, s != null) {
        if (r != null) throw Error(o(92));
        if (So(s)) {
          if (1 < s.length) throw Error(o(93));
          s = s[0];
        }
        r = s;
      }
      r == null && (r = ""), s = r;
    }
    t._wrapperState = { initialValue: we(s) };
  }
  function pf(t, r) {
    var s = we(r.value), u = we(r.defaultValue);
    s != null && (s = "" + s, s !== t.value && (t.value = s), r.defaultValue == null && t.defaultValue !== s && (t.defaultValue = s)), u != null && (t.defaultValue = "" + u);
  }
  function mf(t) {
    var r = t.textContent;
    r === t._wrapperState.initialValue && r !== "" && r !== null && (t.value = r);
  }
  function hf(t) {
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
    return t == null || t === "http://www.w3.org/1999/xhtml" ? hf(r) : t === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : t;
  }
  var Ii, yf = (function(t) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, s, u, h) {
      MSApp.execUnsafeLocalFunction(function() {
        return t(r, s, u, h);
      });
    } : t;
  })(function(t, r) {
    if (t.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in t) t.innerHTML = r;
    else {
      for (Ii = Ii || document.createElement("div"), Ii.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>", r = Ii.firstChild; t.firstChild; ) t.removeChild(t.firstChild);
      for (; r.firstChild; ) t.appendChild(r.firstChild);
    }
  });
  function wo(t, r) {
    if (r) {
      var s = t.firstChild;
      if (s && s === t.lastChild && s.nodeType === 3) {
        s.nodeValue = r;
        return;
      }
    }
    t.textContent = r;
  }
  var xo = {
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
  }, $S = ["Webkit", "ms", "Moz", "O"];
  Object.keys(xo).forEach(function(t) {
    $S.forEach(function(r) {
      r = r + t.charAt(0).toUpperCase() + t.substring(1), xo[r] = xo[t];
    });
  });
  function gf(t, r, s) {
    return r == null || typeof r == "boolean" || r === "" ? "" : s || typeof r != "number" || r === 0 || xo.hasOwnProperty(t) && xo[t] ? ("" + r).trim() : r + "px";
  }
  function vf(t, r) {
    t = t.style;
    for (var s in r) if (r.hasOwnProperty(s)) {
      var u = s.indexOf("--") === 0, h = gf(s, r[s], u);
      s === "float" && (s = "cssFloat"), u ? t.setProperty(s, h) : t[s] = h;
    }
  }
  var HS = Y({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Xa(t, r) {
    if (r) {
      if (HS[t] && (r.children != null || r.dangerouslySetInnerHTML != null)) throw Error(o(137, t));
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
  var el = null, Pr = null, Er = null;
  function Sf(t) {
    if (t = $o(t)) {
      if (typeof el != "function") throw Error(o(280));
      var r = t.stateNode;
      r && (r = rs(r), el(t.stateNode, t.type, r));
    }
  }
  function wf(t) {
    Pr ? Er ? Er.push(t) : Er = [t] : Pr = t;
  }
  function xf() {
    if (Pr) {
      var t = Pr, r = Er;
      if (Er = Pr = null, Sf(t), r) for (t = 0; t < r.length; t++) Sf(r[t]);
    }
  }
  function _f(t, r) {
    return t(r);
  }
  function Tf() {
  }
  var tl = !1;
  function kf(t, r, s) {
    if (tl) return t(r, s);
    tl = !0;
    try {
      return _f(t, r, s);
    } finally {
      tl = !1, (Pr !== null || Er !== null) && (Tf(), xf());
    }
  }
  function _o(t, r) {
    var s = t.stateNode;
    if (s === null) return null;
    var u = rs(s);
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
    var To = {};
    Object.defineProperty(To, "passive", { get: function() {
      nl = !0;
    } }), window.addEventListener("test", To, To), window.removeEventListener("test", To, To);
  } catch {
    nl = !1;
  }
  function WS(t, r, s, u, h, g, _, P, b) {
    var F = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(s, F);
    } catch (z) {
      this.onError(z);
    }
  }
  var ko = !1, ji = null, Fi = !1, rl = null, GS = { onError: function(t) {
    ko = !0, ji = t;
  } };
  function KS(t, r, s, u, h, g, _, P, b) {
    ko = !1, ji = null, WS.apply(GS, arguments);
  }
  function YS(t, r, s, u, h, g, _, P, b) {
    if (KS.apply(this, arguments), ko) {
      if (ko) {
        var F = ji;
        ko = !1, ji = null;
      } else throw Error(o(198));
      Fi || (Fi = !0, rl = F);
    }
  }
  function Zn(t) {
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
  function Af(t) {
    if (t.tag === 13) {
      var r = t.memoizedState;
      if (r === null && (t = t.alternate, t !== null && (r = t.memoizedState)), r !== null) return r.dehydrated;
    }
    return null;
  }
  function Cf(t) {
    if (Zn(t) !== t) throw Error(o(188));
  }
  function QS(t) {
    var r = t.alternate;
    if (!r) {
      if (r = Zn(t), r === null) throw Error(o(188));
      return r !== t ? null : t;
    }
    for (var s = t, u = r; ; ) {
      var h = s.return;
      if (h === null) break;
      var g = h.alternate;
      if (g === null) {
        if (u = h.return, u !== null) {
          s = u;
          continue;
        }
        break;
      }
      if (h.child === g.child) {
        for (g = h.child; g; ) {
          if (g === s) return Cf(h), t;
          if (g === u) return Cf(h), r;
          g = g.sibling;
        }
        throw Error(o(188));
      }
      if (s.return !== u.return) s = h, u = g;
      else {
        for (var _ = !1, P = h.child; P; ) {
          if (P === s) {
            _ = !0, s = h, u = g;
            break;
          }
          if (P === u) {
            _ = !0, u = h, s = g;
            break;
          }
          P = P.sibling;
        }
        if (!_) {
          for (P = g.child; P; ) {
            if (P === s) {
              _ = !0, s = g, u = h;
              break;
            }
            if (P === u) {
              _ = !0, u = g, s = h;
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
  function Pf(t) {
    return t = QS(t), t !== null ? Ef(t) : null;
  }
  function Ef(t) {
    if (t.tag === 5 || t.tag === 6) return t;
    for (t = t.child; t !== null; ) {
      var r = Ef(t);
      if (r !== null) return r;
      t = t.sibling;
    }
    return null;
  }
  var bf = n.unstable_scheduleCallback, Mf = n.unstable_cancelCallback, XS = n.unstable_shouldYield, ZS = n.unstable_requestPaint, Fe = n.unstable_now, JS = n.unstable_getCurrentPriorityLevel, ol = n.unstable_ImmediatePriority, Rf = n.unstable_UserBlockingPriority, Oi = n.unstable_NormalPriority, qS = n.unstable_LowPriority, Df = n.unstable_IdlePriority, Li = null, Wt = null;
  function ew(t) {
    if (Wt && typeof Wt.onCommitFiberRoot == "function") try {
      Wt.onCommitFiberRoot(Li, t, void 0, (t.current.flags & 128) === 128);
    } catch {
    }
  }
  var Nt = Math.clz32 ? Math.clz32 : rw, tw = Math.log, nw = Math.LN2;
  function rw(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (tw(t) / nw | 0) | 0;
  }
  var Vi = 64, Bi = 4194304;
  function Ao(t) {
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
  function zi(t, r) {
    var s = t.pendingLanes;
    if (s === 0) return 0;
    var u = 0, h = t.suspendedLanes, g = t.pingedLanes, _ = s & 268435455;
    if (_ !== 0) {
      var P = _ & ~h;
      P !== 0 ? u = Ao(P) : (g &= _, g !== 0 && (u = Ao(g)));
    } else _ = s & ~h, _ !== 0 ? u = Ao(_) : g !== 0 && (u = Ao(g));
    if (u === 0) return 0;
    if (r !== 0 && r !== u && (r & h) === 0 && (h = u & -u, g = r & -r, h >= g || h === 16 && (g & 4194240) !== 0)) return r;
    if ((u & 4) !== 0 && (u |= s & 16), r = t.entangledLanes, r !== 0) for (t = t.entanglements, r &= u; 0 < r; ) s = 31 - Nt(r), h = 1 << s, u |= t[s], r &= ~h;
    return u;
  }
  function ow(t, r) {
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
  function iw(t, r) {
    for (var s = t.suspendedLanes, u = t.pingedLanes, h = t.expirationTimes, g = t.pendingLanes; 0 < g; ) {
      var _ = 31 - Nt(g), P = 1 << _, b = h[_];
      b === -1 ? ((P & s) === 0 || (P & u) !== 0) && (h[_] = ow(P, r)) : b <= r && (t.expiredLanes |= P), g &= ~P;
    }
  }
  function il(t) {
    return t = t.pendingLanes & -1073741825, t !== 0 ? t : t & 1073741824 ? 1073741824 : 0;
  }
  function Nf() {
    var t = Vi;
    return Vi <<= 1, (Vi & 4194240) === 0 && (Vi = 64), t;
  }
  function sl(t) {
    for (var r = [], s = 0; 31 > s; s++) r.push(t);
    return r;
  }
  function Co(t, r, s) {
    t.pendingLanes |= r, r !== 536870912 && (t.suspendedLanes = 0, t.pingedLanes = 0), t = t.eventTimes, r = 31 - Nt(r), t[r] = s;
  }
  function sw(t, r) {
    var s = t.pendingLanes & ~r;
    t.pendingLanes = r, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= r, t.mutableReadLanes &= r, t.entangledLanes &= r, r = t.entanglements;
    var u = t.eventTimes;
    for (t = t.expirationTimes; 0 < s; ) {
      var h = 31 - Nt(s), g = 1 << h;
      r[h] = 0, u[h] = -1, t[h] = -1, s &= ~g;
    }
  }
  function al(t, r) {
    var s = t.entangledLanes |= r;
    for (t = t.entanglements; s; ) {
      var u = 31 - Nt(s), h = 1 << u;
      h & r | t[u] & r && (t[u] |= r), s &= ~h;
    }
  }
  var xe = 0;
  function If(t) {
    return t &= -t, 1 < t ? 4 < t ? (t & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var jf, ll, Ff, Of, Lf, ul = !1, Ui = [], xn = null, _n = null, Tn = null, Po = /* @__PURE__ */ new Map(), Eo = /* @__PURE__ */ new Map(), kn = [], aw = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function Vf(t, r) {
    switch (t) {
      case "focusin":
      case "focusout":
        xn = null;
        break;
      case "dragenter":
      case "dragleave":
        _n = null;
        break;
      case "mouseover":
      case "mouseout":
        Tn = null;
        break;
      case "pointerover":
      case "pointerout":
        Po.delete(r.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Eo.delete(r.pointerId);
    }
  }
  function bo(t, r, s, u, h, g) {
    return t === null || t.nativeEvent !== g ? (t = { blockedOn: r, domEventName: s, eventSystemFlags: u, nativeEvent: g, targetContainers: [h] }, r !== null && (r = $o(r), r !== null && ll(r)), t) : (t.eventSystemFlags |= u, r = t.targetContainers, h !== null && r.indexOf(h) === -1 && r.push(h), t);
  }
  function lw(t, r, s, u, h) {
    switch (r) {
      case "focusin":
        return xn = bo(xn, t, r, s, u, h), !0;
      case "dragenter":
        return _n = bo(_n, t, r, s, u, h), !0;
      case "mouseover":
        return Tn = bo(Tn, t, r, s, u, h), !0;
      case "pointerover":
        var g = h.pointerId;
        return Po.set(g, bo(Po.get(g) || null, t, r, s, u, h)), !0;
      case "gotpointercapture":
        return g = h.pointerId, Eo.set(g, bo(Eo.get(g) || null, t, r, s, u, h)), !0;
    }
    return !1;
  }
  function Bf(t) {
    var r = Jn(t.target);
    if (r !== null) {
      var s = Zn(r);
      if (s !== null) {
        if (r = s.tag, r === 13) {
          if (r = Af(s), r !== null) {
            t.blockedOn = r, Lf(t.priority, function() {
              Ff(s);
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
  function $i(t) {
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
  function zf(t, r, s) {
    $i(t) && s.delete(r);
  }
  function uw() {
    ul = !1, xn !== null && $i(xn) && (xn = null), _n !== null && $i(_n) && (_n = null), Tn !== null && $i(Tn) && (Tn = null), Po.forEach(zf), Eo.forEach(zf);
  }
  function Mo(t, r) {
    t.blockedOn === r && (t.blockedOn = null, ul || (ul = !0, n.unstable_scheduleCallback(n.unstable_NormalPriority, uw)));
  }
  function Ro(t) {
    function r(h) {
      return Mo(h, t);
    }
    if (0 < Ui.length) {
      Mo(Ui[0], t);
      for (var s = 1; s < Ui.length; s++) {
        var u = Ui[s];
        u.blockedOn === t && (u.blockedOn = null);
      }
    }
    for (xn !== null && Mo(xn, t), _n !== null && Mo(_n, t), Tn !== null && Mo(Tn, t), Po.forEach(r), Eo.forEach(r), s = 0; s < kn.length; s++) u = kn[s], u.blockedOn === t && (u.blockedOn = null);
    for (; 0 < kn.length && (s = kn[0], s.blockedOn === null); ) Bf(s), s.blockedOn === null && kn.shift();
  }
  var br = N.ReactCurrentBatchConfig, Hi = !0;
  function cw(t, r, s, u) {
    var h = xe, g = br.transition;
    br.transition = null;
    try {
      xe = 1, cl(t, r, s, u);
    } finally {
      xe = h, br.transition = g;
    }
  }
  function dw(t, r, s, u) {
    var h = xe, g = br.transition;
    br.transition = null;
    try {
      xe = 4, cl(t, r, s, u);
    } finally {
      xe = h, br.transition = g;
    }
  }
  function cl(t, r, s, u) {
    if (Hi) {
      var h = dl(t, r, s, u);
      if (h === null) El(t, r, u, Wi, s), Vf(t, u);
      else if (lw(h, t, r, s, u)) u.stopPropagation();
      else if (Vf(t, u), r & 4 && -1 < aw.indexOf(t)) {
        for (; h !== null; ) {
          var g = $o(h);
          if (g !== null && jf(g), g = dl(t, r, s, u), g === null && El(t, r, u, Wi, s), g === h) break;
          h = g;
        }
        h !== null && u.stopPropagation();
      } else El(t, r, u, null, s);
    }
  }
  var Wi = null;
  function dl(t, r, s, u) {
    if (Wi = null, t = qa(u), t = Jn(t), t !== null) if (r = Zn(t), r === null) t = null;
    else if (s = r.tag, s === 13) {
      if (t = Af(r), t !== null) return t;
      t = null;
    } else if (s === 3) {
      if (r.stateNode.current.memoizedState.isDehydrated) return r.tag === 3 ? r.stateNode.containerInfo : null;
      t = null;
    } else r !== t && (t = null);
    return Wi = t, null;
  }
  function Uf(t) {
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
        switch (JS()) {
          case ol:
            return 1;
          case Rf:
            return 4;
          case Oi:
          case qS:
            return 16;
          case Df:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var An = null, fl = null, Gi = null;
  function $f() {
    if (Gi) return Gi;
    var t, r = fl, s = r.length, u, h = "value" in An ? An.value : An.textContent, g = h.length;
    for (t = 0; t < s && r[t] === h[t]; t++) ;
    var _ = s - t;
    for (u = 1; u <= _ && r[s - u] === h[g - u]; u++) ;
    return Gi = h.slice(t, 1 < u ? 1 - u : void 0);
  }
  function Ki(t) {
    var r = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && r === 13 && (t = 13)) : t = r, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function Yi() {
    return !0;
  }
  function Hf() {
    return !1;
  }
  function gt(t) {
    function r(s, u, h, g, _) {
      this._reactName = s, this._targetInst = h, this.type = u, this.nativeEvent = g, this.target = _, this.currentTarget = null;
      for (var P in t) t.hasOwnProperty(P) && (s = t[P], this[P] = s ? s(g) : g[P]);
      return this.isDefaultPrevented = (g.defaultPrevented != null ? g.defaultPrevented : g.returnValue === !1) ? Yi : Hf, this.isPropagationStopped = Hf, this;
    }
    return Y(r.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var s = this.nativeEvent;
      s && (s.preventDefault ? s.preventDefault() : typeof s.returnValue != "unknown" && (s.returnValue = !1), this.isDefaultPrevented = Yi);
    }, stopPropagation: function() {
      var s = this.nativeEvent;
      s && (s.stopPropagation ? s.stopPropagation() : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0), this.isPropagationStopped = Yi);
    }, persist: function() {
    }, isPersistent: Yi }), r;
  }
  var Mr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(t) {
    return t.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, pl = gt(Mr), Do = Y({}, Mr, { view: 0, detail: 0 }), fw = gt(Do), ml, hl, No, Qi = Y({}, Do, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: gl, button: 0, buttons: 0, relatedTarget: function(t) {
    return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
  }, movementX: function(t) {
    return "movementX" in t ? t.movementX : (t !== No && (No && t.type === "mousemove" ? (ml = t.screenX - No.screenX, hl = t.screenY - No.screenY) : hl = ml = 0, No = t), ml);
  }, movementY: function(t) {
    return "movementY" in t ? t.movementY : hl;
  } }), Wf = gt(Qi), pw = Y({}, Qi, { dataTransfer: 0 }), mw = gt(pw), hw = Y({}, Do, { relatedTarget: 0 }), yl = gt(hw), yw = Y({}, Mr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), gw = gt(yw), vw = Y({}, Mr, { clipboardData: function(t) {
    return "clipboardData" in t ? t.clipboardData : window.clipboardData;
  } }), Sw = gt(vw), ww = Y({}, Mr, { data: 0 }), Gf = gt(ww), xw = {
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
  }, _w = {
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
  }, Tw = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function kw(t) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(t) : (t = Tw[t]) ? !!r[t] : !1;
  }
  function gl() {
    return kw;
  }
  var Aw = Y({}, Do, { key: function(t) {
    if (t.key) {
      var r = xw[t.key] || t.key;
      if (r !== "Unidentified") return r;
    }
    return t.type === "keypress" ? (t = Ki(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? _w[t.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: gl, charCode: function(t) {
    return t.type === "keypress" ? Ki(t) : 0;
  }, keyCode: function(t) {
    return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  }, which: function(t) {
    return t.type === "keypress" ? Ki(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  } }), Cw = gt(Aw), Pw = Y({}, Qi, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Kf = gt(Pw), Ew = Y({}, Do, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: gl }), bw = gt(Ew), Mw = Y({}, Mr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Rw = gt(Mw), Dw = Y({}, Qi, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Nw = gt(Dw), Iw = [9, 13, 27, 32], vl = p && "CompositionEvent" in window, Io = null;
  p && "documentMode" in document && (Io = document.documentMode);
  var jw = p && "TextEvent" in window && !Io, Yf = p && (!vl || Io && 8 < Io && 11 >= Io), Qf = " ", Xf = !1;
  function Zf(t, r) {
    switch (t) {
      case "keyup":
        return Iw.indexOf(r.keyCode) !== -1;
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
  function Jf(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var Rr = !1;
  function Fw(t, r) {
    switch (t) {
      case "compositionend":
        return Jf(r);
      case "keypress":
        return r.which !== 32 ? null : (Xf = !0, Qf);
      case "textInput":
        return t = r.data, t === Qf && Xf ? null : t;
      default:
        return null;
    }
  }
  function Ow(t, r) {
    if (Rr) return t === "compositionend" || !vl && Zf(t, r) ? (t = $f(), Gi = fl = An = null, Rr = !1, t) : null;
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
        return Yf && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var Lw = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function qf(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r === "input" ? !!Lw[t.type] : r === "textarea";
  }
  function ep(t, r, s, u) {
    wf(u), r = es(r, "onChange"), 0 < r.length && (s = new pl("onChange", "change", null, s, u), t.push({ event: s, listeners: r }));
  }
  var jo = null, Fo = null;
  function Vw(t) {
    vp(t, 0);
  }
  function Xi(t) {
    var r = Fr(t);
    if (lf(r)) return t;
  }
  function Bw(t, r) {
    if (t === "change") return r;
  }
  var tp = !1;
  if (p) {
    var Sl;
    if (p) {
      var wl = "oninput" in document;
      if (!wl) {
        var np = document.createElement("div");
        np.setAttribute("oninput", "return;"), wl = typeof np.oninput == "function";
      }
      Sl = wl;
    } else Sl = !1;
    tp = Sl && (!document.documentMode || 9 < document.documentMode);
  }
  function rp() {
    jo && (jo.detachEvent("onpropertychange", op), Fo = jo = null);
  }
  function op(t) {
    if (t.propertyName === "value" && Xi(Fo)) {
      var r = [];
      ep(r, Fo, t, qa(t)), kf(Vw, r);
    }
  }
  function zw(t, r, s) {
    t === "focusin" ? (rp(), jo = r, Fo = s, jo.attachEvent("onpropertychange", op)) : t === "focusout" && rp();
  }
  function Uw(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown") return Xi(Fo);
  }
  function $w(t, r) {
    if (t === "click") return Xi(r);
  }
  function Hw(t, r) {
    if (t === "input" || t === "change") return Xi(r);
  }
  function Ww(t, r) {
    return t === r && (t !== 0 || 1 / t === 1 / r) || t !== t && r !== r;
  }
  var It = typeof Object.is == "function" ? Object.is : Ww;
  function Oo(t, r) {
    if (It(t, r)) return !0;
    if (typeof t != "object" || t === null || typeof r != "object" || r === null) return !1;
    var s = Object.keys(t), u = Object.keys(r);
    if (s.length !== u.length) return !1;
    for (u = 0; u < s.length; u++) {
      var h = s[u];
      if (!m.call(r, h) || !It(t[h], r[h])) return !1;
    }
    return !0;
  }
  function ip(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function sp(t, r) {
    var s = ip(t);
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
      s = ip(s);
    }
  }
  function ap(t, r) {
    return t && r ? t === r ? !0 : t && t.nodeType === 3 ? !1 : r && r.nodeType === 3 ? ap(t, r.parentNode) : "contains" in t ? t.contains(r) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function lp() {
    for (var t = window, r = Ni(); r instanceof t.HTMLIFrameElement; ) {
      try {
        var s = typeof r.contentWindow.location.href == "string";
      } catch {
        s = !1;
      }
      if (s) t = r.contentWindow;
      else break;
      r = Ni(t.document);
    }
    return r;
  }
  function xl(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r && (r === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || r === "textarea" || t.contentEditable === "true");
  }
  function Gw(t) {
    var r = lp(), s = t.focusedElem, u = t.selectionRange;
    if (r !== s && s && s.ownerDocument && ap(s.ownerDocument.documentElement, s)) {
      if (u !== null && xl(s)) {
        if (r = u.start, t = u.end, t === void 0 && (t = r), "selectionStart" in s) s.selectionStart = r, s.selectionEnd = Math.min(t, s.value.length);
        else if (t = (r = s.ownerDocument || document) && r.defaultView || window, t.getSelection) {
          t = t.getSelection();
          var h = s.textContent.length, g = Math.min(u.start, h);
          u = u.end === void 0 ? g : Math.min(u.end, h), !t.extend && g > u && (h = u, u = g, g = h), h = sp(s, g);
          var _ = sp(
            s,
            u
          );
          h && _ && (t.rangeCount !== 1 || t.anchorNode !== h.node || t.anchorOffset !== h.offset || t.focusNode !== _.node || t.focusOffset !== _.offset) && (r = r.createRange(), r.setStart(h.node, h.offset), t.removeAllRanges(), g > u ? (t.addRange(r), t.extend(_.node, _.offset)) : (r.setEnd(_.node, _.offset), t.addRange(r)));
        }
      }
      for (r = [], t = s; t = t.parentNode; ) t.nodeType === 1 && r.push({ element: t, left: t.scrollLeft, top: t.scrollTop });
      for (typeof s.focus == "function" && s.focus(), s = 0; s < r.length; s++) t = r[s], t.element.scrollLeft = t.left, t.element.scrollTop = t.top;
    }
  }
  var Kw = p && "documentMode" in document && 11 >= document.documentMode, Dr = null, _l = null, Lo = null, Tl = !1;
  function up(t, r, s) {
    var u = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument;
    Tl || Dr == null || Dr !== Ni(u) || (u = Dr, "selectionStart" in u && xl(u) ? u = { start: u.selectionStart, end: u.selectionEnd } : (u = (u.ownerDocument && u.ownerDocument.defaultView || window).getSelection(), u = { anchorNode: u.anchorNode, anchorOffset: u.anchorOffset, focusNode: u.focusNode, focusOffset: u.focusOffset }), Lo && Oo(Lo, u) || (Lo = u, u = es(_l, "onSelect"), 0 < u.length && (r = new pl("onSelect", "select", null, r, s), t.push({ event: r, listeners: u }), r.target = Dr)));
  }
  function Zi(t, r) {
    var s = {};
    return s[t.toLowerCase()] = r.toLowerCase(), s["Webkit" + t] = "webkit" + r, s["Moz" + t] = "moz" + r, s;
  }
  var Nr = { animationend: Zi("Animation", "AnimationEnd"), animationiteration: Zi("Animation", "AnimationIteration"), animationstart: Zi("Animation", "AnimationStart"), transitionend: Zi("Transition", "TransitionEnd") }, kl = {}, cp = {};
  p && (cp = document.createElement("div").style, "AnimationEvent" in window || (delete Nr.animationend.animation, delete Nr.animationiteration.animation, delete Nr.animationstart.animation), "TransitionEvent" in window || delete Nr.transitionend.transition);
  function Ji(t) {
    if (kl[t]) return kl[t];
    if (!Nr[t]) return t;
    var r = Nr[t], s;
    for (s in r) if (r.hasOwnProperty(s) && s in cp) return kl[t] = r[s];
    return t;
  }
  var dp = Ji("animationend"), fp = Ji("animationiteration"), pp = Ji("animationstart"), mp = Ji("transitionend"), hp = /* @__PURE__ */ new Map(), yp = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function Cn(t, r) {
    hp.set(t, r), c(r, [t]);
  }
  for (var Al = 0; Al < yp.length; Al++) {
    var Cl = yp[Al], Yw = Cl.toLowerCase(), Qw = Cl[0].toUpperCase() + Cl.slice(1);
    Cn(Yw, "on" + Qw);
  }
  Cn(dp, "onAnimationEnd"), Cn(fp, "onAnimationIteration"), Cn(pp, "onAnimationStart"), Cn("dblclick", "onDoubleClick"), Cn("focusin", "onFocus"), Cn("focusout", "onBlur"), Cn(mp, "onTransitionEnd"), d("onMouseEnter", ["mouseout", "mouseover"]), d("onMouseLeave", ["mouseout", "mouseover"]), d("onPointerEnter", ["pointerout", "pointerover"]), d("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Vo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Xw = new Set("cancel close invalid load scroll toggle".split(" ").concat(Vo));
  function gp(t, r, s) {
    var u = t.type || "unknown-event";
    t.currentTarget = s, YS(u, r, void 0, t), t.currentTarget = null;
  }
  function vp(t, r) {
    r = (r & 4) !== 0;
    for (var s = 0; s < t.length; s++) {
      var u = t[s], h = u.event;
      u = u.listeners;
      e: {
        var g = void 0;
        if (r) for (var _ = u.length - 1; 0 <= _; _--) {
          var P = u[_], b = P.instance, F = P.currentTarget;
          if (P = P.listener, b !== g && h.isPropagationStopped()) break e;
          gp(h, P, F), g = b;
        }
        else for (_ = 0; _ < u.length; _++) {
          if (P = u[_], b = P.instance, F = P.currentTarget, P = P.listener, b !== g && h.isPropagationStopped()) break e;
          gp(h, P, F), g = b;
        }
      }
    }
    if (Fi) throw t = rl, Fi = !1, rl = null, t;
  }
  function Ee(t, r) {
    var s = r[Il];
    s === void 0 && (s = r[Il] = /* @__PURE__ */ new Set());
    var u = t + "__bubble";
    s.has(u) || (Sp(r, t, 2, !1), s.add(u));
  }
  function Pl(t, r, s) {
    var u = 0;
    r && (u |= 4), Sp(s, t, u, r);
  }
  var qi = "_reactListening" + Math.random().toString(36).slice(2);
  function Bo(t) {
    if (!t[qi]) {
      t[qi] = !0, i.forEach(function(s) {
        s !== "selectionchange" && (Xw.has(s) || Pl(s, !1, t), Pl(s, !0, t));
      });
      var r = t.nodeType === 9 ? t : t.ownerDocument;
      r === null || r[qi] || (r[qi] = !0, Pl("selectionchange", !1, r));
    }
  }
  function Sp(t, r, s, u) {
    switch (Uf(r)) {
      case 1:
        var h = cw;
        break;
      case 4:
        h = dw;
        break;
      default:
        h = cl;
    }
    s = h.bind(null, r, s, t), h = void 0, !nl || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (h = !0), u ? h !== void 0 ? t.addEventListener(r, s, { capture: !0, passive: h }) : t.addEventListener(r, s, !0) : h !== void 0 ? t.addEventListener(r, s, { passive: h }) : t.addEventListener(r, s, !1);
  }
  function El(t, r, s, u, h) {
    var g = u;
    if ((r & 1) === 0 && (r & 2) === 0 && u !== null) e: for (; ; ) {
      if (u === null) return;
      var _ = u.tag;
      if (_ === 3 || _ === 4) {
        var P = u.stateNode.containerInfo;
        if (P === h || P.nodeType === 8 && P.parentNode === h) break;
        if (_ === 4) for (_ = u.return; _ !== null; ) {
          var b = _.tag;
          if ((b === 3 || b === 4) && (b = _.stateNode.containerInfo, b === h || b.nodeType === 8 && b.parentNode === h)) return;
          _ = _.return;
        }
        for (; P !== null; ) {
          if (_ = Jn(P), _ === null) return;
          if (b = _.tag, b === 5 || b === 6) {
            u = g = _;
            continue e;
          }
          P = P.parentNode;
        }
      }
      u = u.return;
    }
    kf(function() {
      var F = g, z = qa(s), $ = [];
      e: {
        var B = hp.get(t);
        if (B !== void 0) {
          var J = pl, te = t;
          switch (t) {
            case "keypress":
              if (Ki(s) === 0) break e;
            case "keydown":
            case "keyup":
              J = Cw;
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
              J = Wf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              J = mw;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              J = bw;
              break;
            case dp:
            case fp:
            case pp:
              J = gw;
              break;
            case mp:
              J = Rw;
              break;
            case "scroll":
              J = fw;
              break;
            case "wheel":
              J = Nw;
              break;
            case "copy":
            case "cut":
            case "paste":
              J = Sw;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              J = Kf;
          }
          var re = (r & 4) !== 0, Oe = !re && t === "scroll", I = re ? B !== null ? B + "Capture" : null : B;
          re = [];
          for (var R = F, j; R !== null; ) {
            j = R;
            var H = j.stateNode;
            if (j.tag === 5 && H !== null && (j = H, I !== null && (H = _o(R, I), H != null && re.push(zo(R, H, j)))), Oe) break;
            R = R.return;
          }
          0 < re.length && (B = new J(B, te, null, s, z), $.push({ event: B, listeners: re }));
        }
      }
      if ((r & 7) === 0) {
        e: {
          if (B = t === "mouseover" || t === "pointerover", J = t === "mouseout" || t === "pointerout", B && s !== Ja && (te = s.relatedTarget || s.fromElement) && (Jn(te) || te[sn])) break e;
          if ((J || B) && (B = z.window === z ? z : (B = z.ownerDocument) ? B.defaultView || B.parentWindow : window, J ? (te = s.relatedTarget || s.toElement, J = F, te = te ? Jn(te) : null, te !== null && (Oe = Zn(te), te !== Oe || te.tag !== 5 && te.tag !== 6) && (te = null)) : (J = null, te = F), J !== te)) {
            if (re = Wf, H = "onMouseLeave", I = "onMouseEnter", R = "mouse", (t === "pointerout" || t === "pointerover") && (re = Kf, H = "onPointerLeave", I = "onPointerEnter", R = "pointer"), Oe = J == null ? B : Fr(J), j = te == null ? B : Fr(te), B = new re(H, R + "leave", J, s, z), B.target = Oe, B.relatedTarget = j, H = null, Jn(z) === F && (re = new re(I, R + "enter", te, s, z), re.target = j, re.relatedTarget = Oe, H = re), Oe = H, J && te) t: {
              for (re = J, I = te, R = 0, j = re; j; j = Ir(j)) R++;
              for (j = 0, H = I; H; H = Ir(H)) j++;
              for (; 0 < R - j; ) re = Ir(re), R--;
              for (; 0 < j - R; ) I = Ir(I), j--;
              for (; R--; ) {
                if (re === I || I !== null && re === I.alternate) break t;
                re = Ir(re), I = Ir(I);
              }
              re = null;
            }
            else re = null;
            J !== null && wp($, B, J, re, !1), te !== null && Oe !== null && wp($, Oe, te, re, !0);
          }
        }
        e: {
          if (B = F ? Fr(F) : window, J = B.nodeName && B.nodeName.toLowerCase(), J === "select" || J === "input" && B.type === "file") var oe = Bw;
          else if (qf(B)) if (tp) oe = Hw;
          else {
            oe = Uw;
            var ie = zw;
          }
          else (J = B.nodeName) && J.toLowerCase() === "input" && (B.type === "checkbox" || B.type === "radio") && (oe = $w);
          if (oe && (oe = oe(t, F))) {
            ep($, oe, s, z);
            break e;
          }
          ie && ie(t, B, F), t === "focusout" && (ie = B._wrapperState) && ie.controlled && B.type === "number" && Ka(B, "number", B.value);
        }
        switch (ie = F ? Fr(F) : window, t) {
          case "focusin":
            (qf(ie) || ie.contentEditable === "true") && (Dr = ie, _l = F, Lo = null);
            break;
          case "focusout":
            Lo = _l = Dr = null;
            break;
          case "mousedown":
            Tl = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Tl = !1, up($, s, z);
            break;
          case "selectionchange":
            if (Kw) break;
          case "keydown":
          case "keyup":
            up($, s, z);
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
        else Rr ? Zf(t, s) && (le = "onCompositionEnd") : t === "keydown" && s.keyCode === 229 && (le = "onCompositionStart");
        le && (Yf && s.locale !== "ko" && (Rr || le !== "onCompositionStart" ? le === "onCompositionEnd" && Rr && (se = $f()) : (An = z, fl = "value" in An ? An.value : An.textContent, Rr = !0)), ie = es(F, le), 0 < ie.length && (le = new Gf(le, t, null, s, z), $.push({ event: le, listeners: ie }), se ? le.data = se : (se = Jf(s), se !== null && (le.data = se)))), (se = jw ? Fw(t, s) : Ow(t, s)) && (F = es(F, "onBeforeInput"), 0 < F.length && (z = new Gf("onBeforeInput", "beforeinput", null, s, z), $.push({ event: z, listeners: F }), z.data = se));
      }
      vp($, r);
    });
  }
  function zo(t, r, s) {
    return { instance: t, listener: r, currentTarget: s };
  }
  function es(t, r) {
    for (var s = r + "Capture", u = []; t !== null; ) {
      var h = t, g = h.stateNode;
      h.tag === 5 && g !== null && (h = g, g = _o(t, s), g != null && u.unshift(zo(t, g, h)), g = _o(t, r), g != null && u.push(zo(t, g, h))), t = t.return;
    }
    return u;
  }
  function Ir(t) {
    if (t === null) return null;
    do
      t = t.return;
    while (t && t.tag !== 5);
    return t || null;
  }
  function wp(t, r, s, u, h) {
    for (var g = r._reactName, _ = []; s !== null && s !== u; ) {
      var P = s, b = P.alternate, F = P.stateNode;
      if (b !== null && b === u) break;
      P.tag === 5 && F !== null && (P = F, h ? (b = _o(s, g), b != null && _.unshift(zo(s, b, P))) : h || (b = _o(s, g), b != null && _.push(zo(s, b, P)))), s = s.return;
    }
    _.length !== 0 && t.push({ event: r, listeners: _ });
  }
  var Zw = /\r\n?/g, Jw = /\u0000|\uFFFD/g;
  function xp(t) {
    return (typeof t == "string" ? t : "" + t).replace(Zw, `
`).replace(Jw, "");
  }
  function ts(t, r, s) {
    if (r = xp(r), xp(t) !== r && s) throw Error(o(425));
  }
  function ns() {
  }
  var bl = null, Ml = null;
  function Rl(t, r) {
    return t === "textarea" || t === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var Dl = typeof setTimeout == "function" ? setTimeout : void 0, qw = typeof clearTimeout == "function" ? clearTimeout : void 0, _p = typeof Promise == "function" ? Promise : void 0, ex = typeof queueMicrotask == "function" ? queueMicrotask : typeof _p < "u" ? function(t) {
    return _p.resolve(null).then(t).catch(tx);
  } : Dl;
  function tx(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function Nl(t, r) {
    var s = r, u = 0;
    do {
      var h = s.nextSibling;
      if (t.removeChild(s), h && h.nodeType === 8) if (s = h.data, s === "/$") {
        if (u === 0) {
          t.removeChild(h), Ro(r);
          return;
        }
        u--;
      } else s !== "$" && s !== "$?" && s !== "$!" || u++;
      s = h;
    } while (s);
    Ro(r);
  }
  function Pn(t) {
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
  function Tp(t) {
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
  var jr = Math.random().toString(36).slice(2), Gt = "__reactFiber$" + jr, Uo = "__reactProps$" + jr, sn = "__reactContainer$" + jr, Il = "__reactEvents$" + jr, nx = "__reactListeners$" + jr, rx = "__reactHandles$" + jr;
  function Jn(t) {
    var r = t[Gt];
    if (r) return r;
    for (var s = t.parentNode; s; ) {
      if (r = s[sn] || s[Gt]) {
        if (s = r.alternate, r.child !== null || s !== null && s.child !== null) for (t = Tp(t); t !== null; ) {
          if (s = t[Gt]) return s;
          t = Tp(t);
        }
        return r;
      }
      t = s, s = t.parentNode;
    }
    return null;
  }
  function $o(t) {
    return t = t[Gt] || t[sn], !t || t.tag !== 5 && t.tag !== 6 && t.tag !== 13 && t.tag !== 3 ? null : t;
  }
  function Fr(t) {
    if (t.tag === 5 || t.tag === 6) return t.stateNode;
    throw Error(o(33));
  }
  function rs(t) {
    return t[Uo] || null;
  }
  var jl = [], Or = -1;
  function En(t) {
    return { current: t };
  }
  function be(t) {
    0 > Or || (t.current = jl[Or], jl[Or] = null, Or--);
  }
  function Pe(t, r) {
    Or++, jl[Or] = t.current, t.current = r;
  }
  var bn = {}, qe = En(bn), ut = En(!1), qn = bn;
  function Lr(t, r) {
    var s = t.type.contextTypes;
    if (!s) return bn;
    var u = t.stateNode;
    if (u && u.__reactInternalMemoizedUnmaskedChildContext === r) return u.__reactInternalMemoizedMaskedChildContext;
    var h = {}, g;
    for (g in s) h[g] = r[g];
    return u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = r, t.__reactInternalMemoizedMaskedChildContext = h), h;
  }
  function ct(t) {
    return t = t.childContextTypes, t != null;
  }
  function os() {
    be(ut), be(qe);
  }
  function kp(t, r, s) {
    if (qe.current !== bn) throw Error(o(168));
    Pe(qe, r), Pe(ut, s);
  }
  function Ap(t, r, s) {
    var u = t.stateNode;
    if (r = r.childContextTypes, typeof u.getChildContext != "function") return s;
    u = u.getChildContext();
    for (var h in u) if (!(h in r)) throw Error(o(108, Ce(t) || "Unknown", h));
    return Y({}, s, u);
  }
  function is(t) {
    return t = (t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext || bn, qn = qe.current, Pe(qe, t), Pe(ut, ut.current), !0;
  }
  function Cp(t, r, s) {
    var u = t.stateNode;
    if (!u) throw Error(o(169));
    s ? (t = Ap(t, r, qn), u.__reactInternalMemoizedMergedChildContext = t, be(ut), be(qe), Pe(qe, t)) : be(ut), Pe(ut, s);
  }
  var an = null, ss = !1, Fl = !1;
  function Pp(t) {
    an === null ? an = [t] : an.push(t);
  }
  function ox(t) {
    ss = !0, Pp(t);
  }
  function Mn() {
    if (!Fl && an !== null) {
      Fl = !0;
      var t = 0, r = xe;
      try {
        var s = an;
        for (xe = 1; t < s.length; t++) {
          var u = s[t];
          do
            u = u(!0);
          while (u !== null);
        }
        an = null, ss = !1;
      } catch (h) {
        throw an !== null && (an = an.slice(t + 1)), bf(ol, Mn), h;
      } finally {
        xe = r, Fl = !1;
      }
    }
    return null;
  }
  var Vr = [], Br = 0, as = null, ls = 0, Tt = [], kt = 0, er = null, ln = 1, un = "";
  function tr(t, r) {
    Vr[Br++] = ls, Vr[Br++] = as, as = t, ls = r;
  }
  function Ep(t, r, s) {
    Tt[kt++] = ln, Tt[kt++] = un, Tt[kt++] = er, er = t;
    var u = ln;
    t = un;
    var h = 32 - Nt(u) - 1;
    u &= ~(1 << h), s += 1;
    var g = 32 - Nt(r) + h;
    if (30 < g) {
      var _ = h - h % 5;
      g = (u & (1 << _) - 1).toString(32), u >>= _, h -= _, ln = 1 << 32 - Nt(r) + h | s << h | u, un = g + t;
    } else ln = 1 << g | s << h | u, un = t;
  }
  function Ol(t) {
    t.return !== null && (tr(t, 1), Ep(t, 1, 0));
  }
  function Ll(t) {
    for (; t === as; ) as = Vr[--Br], Vr[Br] = null, ls = Vr[--Br], Vr[Br] = null;
    for (; t === er; ) er = Tt[--kt], Tt[kt] = null, un = Tt[--kt], Tt[kt] = null, ln = Tt[--kt], Tt[kt] = null;
  }
  var vt = null, St = null, Re = !1, jt = null;
  function bp(t, r) {
    var s = Et(5, null, null, 0);
    s.elementType = "DELETED", s.stateNode = r, s.return = t, r = t.deletions, r === null ? (t.deletions = [s], t.flags |= 16) : r.push(s);
  }
  function Mp(t, r) {
    switch (t.tag) {
      case 5:
        var s = t.type;
        return r = r.nodeType !== 1 || s.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (t.stateNode = r, vt = t, St = Pn(r.firstChild), !0) : !1;
      case 6:
        return r = t.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (t.stateNode = r, vt = t, St = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (s = er !== null ? { id: ln, overflow: un } : null, t.memoizedState = { dehydrated: r, treeContext: s, retryLane: 1073741824 }, s = Et(18, null, null, 0), s.stateNode = r, s.return = t, t.child = s, vt = t, St = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Vl(t) {
    return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
  }
  function Bl(t) {
    if (Re) {
      var r = St;
      if (r) {
        var s = r;
        if (!Mp(t, r)) {
          if (Vl(t)) throw Error(o(418));
          r = Pn(s.nextSibling);
          var u = vt;
          r && Mp(t, r) ? bp(u, s) : (t.flags = t.flags & -4097 | 2, Re = !1, vt = t);
        }
      } else {
        if (Vl(t)) throw Error(o(418));
        t.flags = t.flags & -4097 | 2, Re = !1, vt = t;
      }
    }
  }
  function Rp(t) {
    for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; ) t = t.return;
    vt = t;
  }
  function us(t) {
    if (t !== vt) return !1;
    if (!Re) return Rp(t), Re = !0, !1;
    var r;
    if ((r = t.tag !== 3) && !(r = t.tag !== 5) && (r = t.type, r = r !== "head" && r !== "body" && !Rl(t.type, t.memoizedProps)), r && (r = St)) {
      if (Vl(t)) throw Dp(), Error(o(418));
      for (; r; ) bp(t, r), r = Pn(r.nextSibling);
    }
    if (Rp(t), t.tag === 13) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(o(317));
      e: {
        for (t = t.nextSibling, r = 0; t; ) {
          if (t.nodeType === 8) {
            var s = t.data;
            if (s === "/$") {
              if (r === 0) {
                St = Pn(t.nextSibling);
                break e;
              }
              r--;
            } else s !== "$" && s !== "$!" && s !== "$?" || r++;
          }
          t = t.nextSibling;
        }
        St = null;
      }
    } else St = vt ? Pn(t.stateNode.nextSibling) : null;
    return !0;
  }
  function Dp() {
    for (var t = St; t; ) t = Pn(t.nextSibling);
  }
  function zr() {
    St = vt = null, Re = !1;
  }
  function zl(t) {
    jt === null ? jt = [t] : jt.push(t);
  }
  var ix = N.ReactCurrentBatchConfig;
  function Ho(t, r, s) {
    if (t = s.ref, t !== null && typeof t != "function" && typeof t != "object") {
      if (s._owner) {
        if (s = s._owner, s) {
          if (s.tag !== 1) throw Error(o(309));
          var u = s.stateNode;
        }
        if (!u) throw Error(o(147, t));
        var h = u, g = "" + t;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === g ? r.ref : (r = function(_) {
          var P = h.refs;
          _ === null ? delete P[g] : P[g] = _;
        }, r._stringRef = g, r);
      }
      if (typeof t != "string") throw Error(o(284));
      if (!s._owner) throw Error(o(290, t));
    }
    return t;
  }
  function cs(t, r) {
    throw t = Object.prototype.toString.call(r), Error(o(31, t === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : t));
  }
  function Np(t) {
    var r = t._init;
    return r(t._payload);
  }
  function Ip(t) {
    function r(I, R) {
      if (t) {
        var j = I.deletions;
        j === null ? (I.deletions = [R], I.flags |= 16) : j.push(R);
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
      return I = Ln(I, R), I.index = 0, I.sibling = null, I;
    }
    function g(I, R, j) {
      return I.index = j, t ? (j = I.alternate, j !== null ? (j = j.index, j < R ? (I.flags |= 2, R) : j) : (I.flags |= 2, R)) : (I.flags |= 1048576, R);
    }
    function _(I) {
      return t && I.alternate === null && (I.flags |= 2), I;
    }
    function P(I, R, j, H) {
      return R === null || R.tag !== 6 ? (R = Du(j, I.mode, H), R.return = I, R) : (R = h(R, j), R.return = I, R);
    }
    function b(I, R, j, H) {
      var oe = j.type;
      return oe === G ? z(I, R, j.props.children, H, j.key) : R !== null && (R.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ve && Np(oe) === R.type) ? (H = h(R, j.props), H.ref = Ho(I, R, j), H.return = I, H) : (H = Is(j.type, j.key, j.props, null, I.mode, H), H.ref = Ho(I, R, j), H.return = I, H);
    }
    function F(I, R, j, H) {
      return R === null || R.tag !== 4 || R.stateNode.containerInfo !== j.containerInfo || R.stateNode.implementation !== j.implementation ? (R = Nu(j, I.mode, H), R.return = I, R) : (R = h(R, j.children || []), R.return = I, R);
    }
    function z(I, R, j, H, oe) {
      return R === null || R.tag !== 7 ? (R = ur(j, I.mode, H, oe), R.return = I, R) : (R = h(R, j), R.return = I, R);
    }
    function $(I, R, j) {
      if (typeof R == "string" && R !== "" || typeof R == "number") return R = Du("" + R, I.mode, j), R.return = I, R;
      if (typeof R == "object" && R !== null) {
        switch (R.$$typeof) {
          case O:
            return j = Is(R.type, R.key, R.props, null, I.mode, j), j.ref = Ho(I, null, R), j.return = I, j;
          case W:
            return R = Nu(R, I.mode, j), R.return = I, R;
          case ve:
            var H = R._init;
            return $(I, H(R._payload), j);
        }
        if (So(R) || Z(R)) return R = ur(R, I.mode, j, null), R.return = I, R;
        cs(I, R);
      }
      return null;
    }
    function B(I, R, j, H) {
      var oe = R !== null ? R.key : null;
      if (typeof j == "string" && j !== "" || typeof j == "number") return oe !== null ? null : P(I, R, "" + j, H);
      if (typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case O:
            return j.key === oe ? b(I, R, j, H) : null;
          case W:
            return j.key === oe ? F(I, R, j, H) : null;
          case ve:
            return oe = j._init, B(
              I,
              R,
              oe(j._payload),
              H
            );
        }
        if (So(j) || Z(j)) return oe !== null ? null : z(I, R, j, H, null);
        cs(I, j);
      }
      return null;
    }
    function J(I, R, j, H, oe) {
      if (typeof H == "string" && H !== "" || typeof H == "number") return I = I.get(j) || null, P(R, I, "" + H, oe);
      if (typeof H == "object" && H !== null) {
        switch (H.$$typeof) {
          case O:
            return I = I.get(H.key === null ? j : H.key) || null, b(R, I, H, oe);
          case W:
            return I = I.get(H.key === null ? j : H.key) || null, F(R, I, H, oe);
          case ve:
            var ie = H._init;
            return J(I, R, j, ie(H._payload), oe);
        }
        if (So(H) || Z(H)) return I = I.get(j) || null, z(R, I, H, oe, null);
        cs(R, H);
      }
      return null;
    }
    function te(I, R, j, H) {
      for (var oe = null, ie = null, se = R, le = R = 0, Ge = null; se !== null && le < j.length; le++) {
        se.index > le ? (Ge = se, se = null) : Ge = se.sibling;
        var ge = B(I, se, j[le], H);
        if (ge === null) {
          se === null && (se = Ge);
          break;
        }
        t && se && ge.alternate === null && r(I, se), R = g(ge, R, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge, se = Ge;
      }
      if (le === j.length) return s(I, se), Re && tr(I, le), oe;
      if (se === null) {
        for (; le < j.length; le++) se = $(I, j[le], H), se !== null && (R = g(se, R, le), ie === null ? oe = se : ie.sibling = se, ie = se);
        return Re && tr(I, le), oe;
      }
      for (se = u(I, se); le < j.length; le++) Ge = J(se, I, le, j[le], H), Ge !== null && (t && Ge.alternate !== null && se.delete(Ge.key === null ? le : Ge.key), R = g(Ge, R, le), ie === null ? oe = Ge : ie.sibling = Ge, ie = Ge);
      return t && se.forEach(function(Vn) {
        return r(I, Vn);
      }), Re && tr(I, le), oe;
    }
    function re(I, R, j, H) {
      var oe = Z(j);
      if (typeof oe != "function") throw Error(o(150));
      if (j = oe.call(j), j == null) throw Error(o(151));
      for (var ie = oe = null, se = R, le = R = 0, Ge = null, ge = j.next(); se !== null && !ge.done; le++, ge = j.next()) {
        se.index > le ? (Ge = se, se = null) : Ge = se.sibling;
        var Vn = B(I, se, ge.value, H);
        if (Vn === null) {
          se === null && (se = Ge);
          break;
        }
        t && se && Vn.alternate === null && r(I, se), R = g(Vn, R, le), ie === null ? oe = Vn : ie.sibling = Vn, ie = Vn, se = Ge;
      }
      if (ge.done) return s(
        I,
        se
      ), Re && tr(I, le), oe;
      if (se === null) {
        for (; !ge.done; le++, ge = j.next()) ge = $(I, ge.value, H), ge !== null && (R = g(ge, R, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge);
        return Re && tr(I, le), oe;
      }
      for (se = u(I, se); !ge.done; le++, ge = j.next()) ge = J(se, I, le, ge.value, H), ge !== null && (t && ge.alternate !== null && se.delete(ge.key === null ? le : ge.key), R = g(ge, R, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge);
      return t && se.forEach(function(Lx) {
        return r(I, Lx);
      }), Re && tr(I, le), oe;
    }
    function Oe(I, R, j, H) {
      if (typeof j == "object" && j !== null && j.type === G && j.key === null && (j = j.props.children), typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case O:
            e: {
              for (var oe = j.key, ie = R; ie !== null; ) {
                if (ie.key === oe) {
                  if (oe = j.type, oe === G) {
                    if (ie.tag === 7) {
                      s(I, ie.sibling), R = h(ie, j.props.children), R.return = I, I = R;
                      break e;
                    }
                  } else if (ie.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ve && Np(oe) === ie.type) {
                    s(I, ie.sibling), R = h(ie, j.props), R.ref = Ho(I, ie, j), R.return = I, I = R;
                    break e;
                  }
                  s(I, ie);
                  break;
                } else r(I, ie);
                ie = ie.sibling;
              }
              j.type === G ? (R = ur(j.props.children, I.mode, H, j.key), R.return = I, I = R) : (H = Is(j.type, j.key, j.props, null, I.mode, H), H.ref = Ho(I, R, j), H.return = I, I = H);
            }
            return _(I);
          case W:
            e: {
              for (ie = j.key; R !== null; ) {
                if (R.key === ie) if (R.tag === 4 && R.stateNode.containerInfo === j.containerInfo && R.stateNode.implementation === j.implementation) {
                  s(I, R.sibling), R = h(R, j.children || []), R.return = I, I = R;
                  break e;
                } else {
                  s(I, R);
                  break;
                }
                else r(I, R);
                R = R.sibling;
              }
              R = Nu(j, I.mode, H), R.return = I, I = R;
            }
            return _(I);
          case ve:
            return ie = j._init, Oe(I, R, ie(j._payload), H);
        }
        if (So(j)) return te(I, R, j, H);
        if (Z(j)) return re(I, R, j, H);
        cs(I, j);
      }
      return typeof j == "string" && j !== "" || typeof j == "number" ? (j = "" + j, R !== null && R.tag === 6 ? (s(I, R.sibling), R = h(R, j), R.return = I, I = R) : (s(I, R), R = Du(j, I.mode, H), R.return = I, I = R), _(I)) : s(I, R);
    }
    return Oe;
  }
  var Ur = Ip(!0), jp = Ip(!1), ds = En(null), fs = null, $r = null, Ul = null;
  function $l() {
    Ul = $r = fs = null;
  }
  function Hl(t) {
    var r = ds.current;
    be(ds), t._currentValue = r;
  }
  function Wl(t, r, s) {
    for (; t !== null; ) {
      var u = t.alternate;
      if ((t.childLanes & r) !== r ? (t.childLanes |= r, u !== null && (u.childLanes |= r)) : u !== null && (u.childLanes & r) !== r && (u.childLanes |= r), t === s) break;
      t = t.return;
    }
  }
  function Hr(t, r) {
    fs = t, Ul = $r = null, t = t.dependencies, t !== null && t.firstContext !== null && ((t.lanes & r) !== 0 && (dt = !0), t.firstContext = null);
  }
  function At(t) {
    var r = t._currentValue;
    if (Ul !== t) if (t = { context: t, memoizedValue: r, next: null }, $r === null) {
      if (fs === null) throw Error(o(308));
      $r = t, fs.dependencies = { lanes: 0, firstContext: t };
    } else $r = $r.next = t;
    return r;
  }
  var nr = null;
  function Gl(t) {
    nr === null ? nr = [t] : nr.push(t);
  }
  function Fp(t, r, s, u) {
    var h = r.interleaved;
    return h === null ? (s.next = s, Gl(r)) : (s.next = h.next, h.next = s), r.interleaved = s, cn(t, u);
  }
  function cn(t, r) {
    t.lanes |= r;
    var s = t.alternate;
    for (s !== null && (s.lanes |= r), s = t, t = t.return; t !== null; ) t.childLanes |= r, s = t.alternate, s !== null && (s.childLanes |= r), s = t, t = t.return;
    return s.tag === 3 ? s.stateNode : null;
  }
  var Rn = !1;
  function Kl(t) {
    t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Op(t, r) {
    t = t.updateQueue, r.updateQueue === t && (r.updateQueue = { baseState: t.baseState, firstBaseUpdate: t.firstBaseUpdate, lastBaseUpdate: t.lastBaseUpdate, shared: t.shared, effects: t.effects });
  }
  function dn(t, r) {
    return { eventTime: t, lane: r, tag: 0, payload: null, callback: null, next: null };
  }
  function Dn(t, r, s) {
    var u = t.updateQueue;
    if (u === null) return null;
    if (u = u.shared, (me & 2) !== 0) {
      var h = u.pending;
      return h === null ? r.next = r : (r.next = h.next, h.next = r), u.pending = r, cn(t, s);
    }
    return h = u.interleaved, h === null ? (r.next = r, Gl(u)) : (r.next = h.next, h.next = r), u.interleaved = r, cn(t, s);
  }
  function ps(t, r, s) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (s & 4194240) !== 0)) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, al(t, s);
    }
  }
  function Lp(t, r) {
    var s = t.updateQueue, u = t.alternate;
    if (u !== null && (u = u.updateQueue, s === u)) {
      var h = null, g = null;
      if (s = s.firstBaseUpdate, s !== null) {
        do {
          var _ = { eventTime: s.eventTime, lane: s.lane, tag: s.tag, payload: s.payload, callback: s.callback, next: null };
          g === null ? h = g = _ : g = g.next = _, s = s.next;
        } while (s !== null);
        g === null ? h = g = r : g = g.next = r;
      } else h = g = r;
      s = { baseState: u.baseState, firstBaseUpdate: h, lastBaseUpdate: g, shared: u.shared, effects: u.effects }, t.updateQueue = s;
      return;
    }
    t = s.lastBaseUpdate, t === null ? s.firstBaseUpdate = r : t.next = r, s.lastBaseUpdate = r;
  }
  function ms(t, r, s, u) {
    var h = t.updateQueue;
    Rn = !1;
    var g = h.firstBaseUpdate, _ = h.lastBaseUpdate, P = h.shared.pending;
    if (P !== null) {
      h.shared.pending = null;
      var b = P, F = b.next;
      b.next = null, _ === null ? g = F : _.next = F, _ = b;
      var z = t.alternate;
      z !== null && (z = z.updateQueue, P = z.lastBaseUpdate, P !== _ && (P === null ? z.firstBaseUpdate = F : P.next = F, z.lastBaseUpdate = b));
    }
    if (g !== null) {
      var $ = h.baseState;
      _ = 0, z = F = b = null, P = g;
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
                  $ = te.call(J, $, B);
                  break e;
                }
                $ = te;
                break e;
              case 3:
                te.flags = te.flags & -65537 | 128;
              case 0:
                if (te = re.payload, B = typeof te == "function" ? te.call(J, $, B) : te, B == null) break e;
                $ = Y({}, $, B);
                break e;
              case 2:
                Rn = !0;
            }
          }
          P.callback !== null && P.lane !== 0 && (t.flags |= 64, B = h.effects, B === null ? h.effects = [P] : B.push(P));
        } else J = { eventTime: J, lane: B, tag: P.tag, payload: P.payload, callback: P.callback, next: null }, z === null ? (F = z = J, b = $) : z = z.next = J, _ |= B;
        if (P = P.next, P === null) {
          if (P = h.shared.pending, P === null) break;
          B = P, P = B.next, B.next = null, h.lastBaseUpdate = B, h.shared.pending = null;
        }
      } while (!0);
      if (z === null && (b = $), h.baseState = b, h.firstBaseUpdate = F, h.lastBaseUpdate = z, r = h.shared.interleaved, r !== null) {
        h = r;
        do
          _ |= h.lane, h = h.next;
        while (h !== r);
      } else g === null && (h.shared.lanes = 0);
      ir |= _, t.lanes = _, t.memoizedState = $;
    }
  }
  function Vp(t, r, s) {
    if (t = r.effects, r.effects = null, t !== null) for (r = 0; r < t.length; r++) {
      var u = t[r], h = u.callback;
      if (h !== null) {
        if (u.callback = null, u = s, typeof h != "function") throw Error(o(191, h));
        h.call(u);
      }
    }
  }
  var Wo = {}, Kt = En(Wo), Go = En(Wo), Ko = En(Wo);
  function rr(t) {
    if (t === Wo) throw Error(o(174));
    return t;
  }
  function Yl(t, r) {
    switch (Pe(Ko, r), Pe(Go, t), Pe(Kt, Wo), t = r.nodeType, t) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : Qa(null, "");
        break;
      default:
        t = t === 8 ? r.parentNode : r, r = t.namespaceURI || null, t = t.tagName, r = Qa(r, t);
    }
    be(Kt), Pe(Kt, r);
  }
  function Wr() {
    be(Kt), be(Go), be(Ko);
  }
  function Bp(t) {
    rr(Ko.current);
    var r = rr(Kt.current), s = Qa(r, t.type);
    r !== s && (Pe(Go, t), Pe(Kt, s));
  }
  function Ql(t) {
    Go.current === t && (be(Kt), be(Go));
  }
  var De = En(0);
  function hs(t) {
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
  var ys = N.ReactCurrentDispatcher, Jl = N.ReactCurrentBatchConfig, or = 0, Ne = null, ze = null, He = null, gs = !1, Yo = !1, Qo = 0, sx = 0;
  function et() {
    throw Error(o(321));
  }
  function ql(t, r) {
    if (r === null) return !1;
    for (var s = 0; s < r.length && s < t.length; s++) if (!It(t[s], r[s])) return !1;
    return !0;
  }
  function eu(t, r, s, u, h, g) {
    if (or = g, Ne = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, ys.current = t === null || t.memoizedState === null ? cx : dx, t = s(u, h), Yo) {
      g = 0;
      do {
        if (Yo = !1, Qo = 0, 25 <= g) throw Error(o(301));
        g += 1, He = ze = null, r.updateQueue = null, ys.current = fx, t = s(u, h);
      } while (Yo);
    }
    if (ys.current = ws, r = ze !== null && ze.next !== null, or = 0, He = ze = Ne = null, gs = !1, r) throw Error(o(300));
    return t;
  }
  function tu() {
    var t = Qo !== 0;
    return Qo = 0, t;
  }
  function Yt() {
    var t = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return He === null ? Ne.memoizedState = He = t : He = He.next = t, He;
  }
  function Ct() {
    if (ze === null) {
      var t = Ne.alternate;
      t = t !== null ? t.memoizedState : null;
    } else t = ze.next;
    var r = He === null ? Ne.memoizedState : He.next;
    if (r !== null) He = r, ze = t;
    else {
      if (t === null) throw Error(o(310));
      ze = t, t = { memoizedState: ze.memoizedState, baseState: ze.baseState, baseQueue: ze.baseQueue, queue: ze.queue, next: null }, He === null ? Ne.memoizedState = He = t : He = He.next = t;
    }
    return He;
  }
  function Xo(t, r) {
    return typeof r == "function" ? r(t) : r;
  }
  function nu(t) {
    var r = Ct(), s = r.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = t;
    var u = ze, h = u.baseQueue, g = s.pending;
    if (g !== null) {
      if (h !== null) {
        var _ = h.next;
        h.next = g.next, g.next = _;
      }
      u.baseQueue = h = g, s.pending = null;
    }
    if (h !== null) {
      g = h.next, u = u.baseState;
      var P = _ = null, b = null, F = g;
      do {
        var z = F.lane;
        if ((or & z) === z) b !== null && (b = b.next = { lane: 0, action: F.action, hasEagerState: F.hasEagerState, eagerState: F.eagerState, next: null }), u = F.hasEagerState ? F.eagerState : t(u, F.action);
        else {
          var $ = {
            lane: z,
            action: F.action,
            hasEagerState: F.hasEagerState,
            eagerState: F.eagerState,
            next: null
          };
          b === null ? (P = b = $, _ = u) : b = b.next = $, Ne.lanes |= z, ir |= z;
        }
        F = F.next;
      } while (F !== null && F !== g);
      b === null ? _ = u : b.next = P, It(u, r.memoizedState) || (dt = !0), r.memoizedState = u, r.baseState = _, r.baseQueue = b, s.lastRenderedState = u;
    }
    if (t = s.interleaved, t !== null) {
      h = t;
      do
        g = h.lane, Ne.lanes |= g, ir |= g, h = h.next;
      while (h !== t);
    } else h === null && (s.lanes = 0);
    return [r.memoizedState, s.dispatch];
  }
  function ru(t) {
    var r = Ct(), s = r.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = t;
    var u = s.dispatch, h = s.pending, g = r.memoizedState;
    if (h !== null) {
      s.pending = null;
      var _ = h = h.next;
      do
        g = t(g, _.action), _ = _.next;
      while (_ !== h);
      It(g, r.memoizedState) || (dt = !0), r.memoizedState = g, r.baseQueue === null && (r.baseState = g), s.lastRenderedState = g;
    }
    return [g, u];
  }
  function zp() {
  }
  function Up(t, r) {
    var s = Ne, u = Ct(), h = r(), g = !It(u.memoizedState, h);
    if (g && (u.memoizedState = h, dt = !0), u = u.queue, ou(Wp.bind(null, s, u, t), [t]), u.getSnapshot !== r || g || He !== null && He.memoizedState.tag & 1) {
      if (s.flags |= 2048, Zo(9, Hp.bind(null, s, u, h, r), void 0, null), We === null) throw Error(o(349));
      (or & 30) !== 0 || $p(s, r, h);
    }
    return h;
  }
  function $p(t, r, s) {
    t.flags |= 16384, t = { getSnapshot: r, value: s }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.stores = [t]) : (s = r.stores, s === null ? r.stores = [t] : s.push(t));
  }
  function Hp(t, r, s, u) {
    r.value = s, r.getSnapshot = u, Gp(r) && Kp(t);
  }
  function Wp(t, r, s) {
    return s(function() {
      Gp(r) && Kp(t);
    });
  }
  function Gp(t) {
    var r = t.getSnapshot;
    t = t.value;
    try {
      var s = r();
      return !It(t, s);
    } catch {
      return !0;
    }
  }
  function Kp(t) {
    var r = cn(t, 1);
    r !== null && Vt(r, t, 1, -1);
  }
  function Yp(t) {
    var r = Yt();
    return typeof t == "function" && (t = t()), r.memoizedState = r.baseState = t, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Xo, lastRenderedState: t }, r.queue = t, t = t.dispatch = ux.bind(null, Ne, t), [r.memoizedState, t];
  }
  function Zo(t, r, s, u) {
    return t = { tag: t, create: r, destroy: s, deps: u, next: null }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.lastEffect = t.next = t) : (s = r.lastEffect, s === null ? r.lastEffect = t.next = t : (u = s.next, s.next = t, t.next = u, r.lastEffect = t)), t;
  }
  function Qp() {
    return Ct().memoizedState;
  }
  function vs(t, r, s, u) {
    var h = Yt();
    Ne.flags |= t, h.memoizedState = Zo(1 | r, s, void 0, u === void 0 ? null : u);
  }
  function Ss(t, r, s, u) {
    var h = Ct();
    u = u === void 0 ? null : u;
    var g = void 0;
    if (ze !== null) {
      var _ = ze.memoizedState;
      if (g = _.destroy, u !== null && ql(u, _.deps)) {
        h.memoizedState = Zo(r, s, g, u);
        return;
      }
    }
    Ne.flags |= t, h.memoizedState = Zo(1 | r, s, g, u);
  }
  function Xp(t, r) {
    return vs(8390656, 8, t, r);
  }
  function ou(t, r) {
    return Ss(2048, 8, t, r);
  }
  function Zp(t, r) {
    return Ss(4, 2, t, r);
  }
  function Jp(t, r) {
    return Ss(4, 4, t, r);
  }
  function qp(t, r) {
    if (typeof r == "function") return t = t(), r(t), function() {
      r(null);
    };
    if (r != null) return t = t(), r.current = t, function() {
      r.current = null;
    };
  }
  function em(t, r, s) {
    return s = s != null ? s.concat([t]) : null, Ss(4, 4, qp.bind(null, r, t), s);
  }
  function iu() {
  }
  function tm(t, r) {
    var s = Ct();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && ql(r, u[1]) ? u[0] : (s.memoizedState = [t, r], t);
  }
  function nm(t, r) {
    var s = Ct();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && ql(r, u[1]) ? u[0] : (t = t(), s.memoizedState = [t, r], t);
  }
  function rm(t, r, s) {
    return (or & 21) === 0 ? (t.baseState && (t.baseState = !1, dt = !0), t.memoizedState = s) : (It(s, r) || (s = Nf(), Ne.lanes |= s, ir |= s, t.baseState = !0), r);
  }
  function ax(t, r) {
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
  function om() {
    return Ct().memoizedState;
  }
  function lx(t, r, s) {
    var u = Fn(t);
    if (s = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null }, im(t)) sm(r, s);
    else if (s = Fp(t, r, s, u), s !== null) {
      var h = ot();
      Vt(s, t, u, h), am(s, r, u);
    }
  }
  function ux(t, r, s) {
    var u = Fn(t), h = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null };
    if (im(t)) sm(r, h);
    else {
      var g = t.alternate;
      if (t.lanes === 0 && (g === null || g.lanes === 0) && (g = r.lastRenderedReducer, g !== null)) try {
        var _ = r.lastRenderedState, P = g(_, s);
        if (h.hasEagerState = !0, h.eagerState = P, It(P, _)) {
          var b = r.interleaved;
          b === null ? (h.next = h, Gl(r)) : (h.next = b.next, b.next = h), r.interleaved = h;
          return;
        }
      } catch {
      } finally {
      }
      s = Fp(t, r, h, u), s !== null && (h = ot(), Vt(s, t, u, h), am(s, r, u));
    }
  }
  function im(t) {
    var r = t.alternate;
    return t === Ne || r !== null && r === Ne;
  }
  function sm(t, r) {
    Yo = gs = !0;
    var s = t.pending;
    s === null ? r.next = r : (r.next = s.next, s.next = r), t.pending = r;
  }
  function am(t, r, s) {
    if ((s & 4194240) !== 0) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, al(t, s);
    }
  }
  var ws = { readContext: At, useCallback: et, useContext: et, useEffect: et, useImperativeHandle: et, useInsertionEffect: et, useLayoutEffect: et, useMemo: et, useReducer: et, useRef: et, useState: et, useDebugValue: et, useDeferredValue: et, useTransition: et, useMutableSource: et, useSyncExternalStore: et, useId: et, unstable_isNewReconciler: !1 }, cx = { readContext: At, useCallback: function(t, r) {
    return Yt().memoizedState = [t, r === void 0 ? null : r], t;
  }, useContext: At, useEffect: Xp, useImperativeHandle: function(t, r, s) {
    return s = s != null ? s.concat([t]) : null, vs(
      4194308,
      4,
      qp.bind(null, r, t),
      s
    );
  }, useLayoutEffect: function(t, r) {
    return vs(4194308, 4, t, r);
  }, useInsertionEffect: function(t, r) {
    return vs(4, 2, t, r);
  }, useMemo: function(t, r) {
    var s = Yt();
    return r = r === void 0 ? null : r, t = t(), s.memoizedState = [t, r], t;
  }, useReducer: function(t, r, s) {
    var u = Yt();
    return r = s !== void 0 ? s(r) : r, u.memoizedState = u.baseState = r, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: r }, u.queue = t, t = t.dispatch = lx.bind(null, Ne, t), [u.memoizedState, t];
  }, useRef: function(t) {
    var r = Yt();
    return t = { current: t }, r.memoizedState = t;
  }, useState: Yp, useDebugValue: iu, useDeferredValue: function(t) {
    return Yt().memoizedState = t;
  }, useTransition: function() {
    var t = Yp(!1), r = t[0];
    return t = ax.bind(null, t[1]), Yt().memoizedState = t, [r, t];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(t, r, s) {
    var u = Ne, h = Yt();
    if (Re) {
      if (s === void 0) throw Error(o(407));
      s = s();
    } else {
      if (s = r(), We === null) throw Error(o(349));
      (or & 30) !== 0 || $p(u, r, s);
    }
    h.memoizedState = s;
    var g = { value: s, getSnapshot: r };
    return h.queue = g, Xp(Wp.bind(
      null,
      u,
      g,
      t
    ), [t]), u.flags |= 2048, Zo(9, Hp.bind(null, u, g, s, r), void 0, null), s;
  }, useId: function() {
    var t = Yt(), r = We.identifierPrefix;
    if (Re) {
      var s = un, u = ln;
      s = (u & ~(1 << 32 - Nt(u) - 1)).toString(32) + s, r = ":" + r + "R" + s, s = Qo++, 0 < s && (r += "H" + s.toString(32)), r += ":";
    } else s = sx++, r = ":" + r + "r" + s.toString(32) + ":";
    return t.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, dx = {
    readContext: At,
    useCallback: tm,
    useContext: At,
    useEffect: ou,
    useImperativeHandle: em,
    useInsertionEffect: Zp,
    useLayoutEffect: Jp,
    useMemo: nm,
    useReducer: nu,
    useRef: Qp,
    useState: function() {
      return nu(Xo);
    },
    useDebugValue: iu,
    useDeferredValue: function(t) {
      var r = Ct();
      return rm(r, ze.memoizedState, t);
    },
    useTransition: function() {
      var t = nu(Xo)[0], r = Ct().memoizedState;
      return [t, r];
    },
    useMutableSource: zp,
    useSyncExternalStore: Up,
    useId: om,
    unstable_isNewReconciler: !1
  }, fx = { readContext: At, useCallback: tm, useContext: At, useEffect: ou, useImperativeHandle: em, useInsertionEffect: Zp, useLayoutEffect: Jp, useMemo: nm, useReducer: ru, useRef: Qp, useState: function() {
    return ru(Xo);
  }, useDebugValue: iu, useDeferredValue: function(t) {
    var r = Ct();
    return ze === null ? r.memoizedState = t : rm(r, ze.memoizedState, t);
  }, useTransition: function() {
    var t = ru(Xo)[0], r = Ct().memoizedState;
    return [t, r];
  }, useMutableSource: zp, useSyncExternalStore: Up, useId: om, unstable_isNewReconciler: !1 };
  function Ft(t, r) {
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
  var xs = { isMounted: function(t) {
    return (t = t._reactInternals) ? Zn(t) === t : !1;
  }, enqueueSetState: function(t, r, s) {
    t = t._reactInternals;
    var u = ot(), h = Fn(t), g = dn(u, h);
    g.payload = r, s != null && (g.callback = s), r = Dn(t, g, h), r !== null && (Vt(r, t, h, u), ps(r, t, h));
  }, enqueueReplaceState: function(t, r, s) {
    t = t._reactInternals;
    var u = ot(), h = Fn(t), g = dn(u, h);
    g.tag = 1, g.payload = r, s != null && (g.callback = s), r = Dn(t, g, h), r !== null && (Vt(r, t, h, u), ps(r, t, h));
  }, enqueueForceUpdate: function(t, r) {
    t = t._reactInternals;
    var s = ot(), u = Fn(t), h = dn(s, u);
    h.tag = 2, r != null && (h.callback = r), r = Dn(t, h, u), r !== null && (Vt(r, t, u, s), ps(r, t, u));
  } };
  function lm(t, r, s, u, h, g, _) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(u, g, _) : r.prototype && r.prototype.isPureReactComponent ? !Oo(s, u) || !Oo(h, g) : !0;
  }
  function um(t, r, s) {
    var u = !1, h = bn, g = r.contextType;
    return typeof g == "object" && g !== null ? g = At(g) : (h = ct(r) ? qn : qe.current, u = r.contextTypes, g = (u = u != null) ? Lr(t, h) : bn), r = new r(s, g), t.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = xs, t.stateNode = r, r._reactInternals = t, u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = h, t.__reactInternalMemoizedMaskedChildContext = g), r;
  }
  function cm(t, r, s, u) {
    t = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(s, u), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(s, u), r.state !== t && xs.enqueueReplaceState(r, r.state, null);
  }
  function au(t, r, s, u) {
    var h = t.stateNode;
    h.props = s, h.state = t.memoizedState, h.refs = {}, Kl(t);
    var g = r.contextType;
    typeof g == "object" && g !== null ? h.context = At(g) : (g = ct(r) ? qn : qe.current, h.context = Lr(t, g)), h.state = t.memoizedState, g = r.getDerivedStateFromProps, typeof g == "function" && (su(t, r, g, s), h.state = t.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof h.getSnapshotBeforeUpdate == "function" || typeof h.UNSAFE_componentWillMount != "function" && typeof h.componentWillMount != "function" || (r = h.state, typeof h.componentWillMount == "function" && h.componentWillMount(), typeof h.UNSAFE_componentWillMount == "function" && h.UNSAFE_componentWillMount(), r !== h.state && xs.enqueueReplaceState(h, h.state, null), ms(t, s, h, u), h.state = t.memoizedState), typeof h.componentDidMount == "function" && (t.flags |= 4194308);
  }
  function Gr(t, r) {
    try {
      var s = "", u = r;
      do
        s += he(u), u = u.return;
      while (u);
      var h = s;
    } catch (g) {
      h = `
Error generating stack: ` + g.message + `
` + g.stack;
    }
    return { value: t, source: r, stack: h, digest: null };
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
  var px = typeof WeakMap == "function" ? WeakMap : Map;
  function dm(t, r, s) {
    s = dn(-1, s), s.tag = 3, s.payload = { element: null };
    var u = r.value;
    return s.callback = function() {
      Es || (Es = !0, ku = u), uu(t, r);
    }, s;
  }
  function fm(t, r, s) {
    s = dn(-1, s), s.tag = 3;
    var u = t.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var h = r.value;
      s.payload = function() {
        return u(h);
      }, s.callback = function() {
        uu(t, r);
      };
    }
    var g = t.stateNode;
    return g !== null && typeof g.componentDidCatch == "function" && (s.callback = function() {
      uu(t, r), typeof u != "function" && (In === null ? In = /* @__PURE__ */ new Set([this]) : In.add(this));
      var _ = r.stack;
      this.componentDidCatch(r.value, { componentStack: _ !== null ? _ : "" });
    }), s;
  }
  function pm(t, r, s) {
    var u = t.pingCache;
    if (u === null) {
      u = t.pingCache = new px();
      var h = /* @__PURE__ */ new Set();
      u.set(r, h);
    } else h = u.get(r), h === void 0 && (h = /* @__PURE__ */ new Set(), u.set(r, h));
    h.has(s) || (h.add(s), t = Px.bind(null, t, r, s), r.then(t, t));
  }
  function mm(t) {
    do {
      var r;
      if ((r = t.tag === 13) && (r = t.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r) return t;
      t = t.return;
    } while (t !== null);
    return null;
  }
  function hm(t, r, s, u, h) {
    return (t.mode & 1) === 0 ? (t === r ? t.flags |= 65536 : (t.flags |= 128, s.flags |= 131072, s.flags &= -52805, s.tag === 1 && (s.alternate === null ? s.tag = 17 : (r = dn(-1, 1), r.tag = 2, Dn(s, r, 1))), s.lanes |= 1), t) : (t.flags |= 65536, t.lanes = h, t);
  }
  var mx = N.ReactCurrentOwner, dt = !1;
  function rt(t, r, s, u) {
    r.child = t === null ? jp(r, null, s, u) : Ur(r, t.child, s, u);
  }
  function ym(t, r, s, u, h) {
    s = s.render;
    var g = r.ref;
    return Hr(r, h), u = eu(t, r, s, u, g, h), s = tu(), t !== null && !dt ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~h, fn(t, r, h)) : (Re && s && Ol(r), r.flags |= 1, rt(t, r, u, h), r.child);
  }
  function gm(t, r, s, u, h) {
    if (t === null) {
      var g = s.type;
      return typeof g == "function" && !Ru(g) && g.defaultProps === void 0 && s.compare === null && s.defaultProps === void 0 ? (r.tag = 15, r.type = g, vm(t, r, g, u, h)) : (t = Is(s.type, null, u, r, r.mode, h), t.ref = r.ref, t.return = r, r.child = t);
    }
    if (g = t.child, (t.lanes & h) === 0) {
      var _ = g.memoizedProps;
      if (s = s.compare, s = s !== null ? s : Oo, s(_, u) && t.ref === r.ref) return fn(t, r, h);
    }
    return r.flags |= 1, t = Ln(g, u), t.ref = r.ref, t.return = r, r.child = t;
  }
  function vm(t, r, s, u, h) {
    if (t !== null) {
      var g = t.memoizedProps;
      if (Oo(g, u) && t.ref === r.ref) if (dt = !1, r.pendingProps = u = g, (t.lanes & h) !== 0) (t.flags & 131072) !== 0 && (dt = !0);
      else return r.lanes = t.lanes, fn(t, r, h);
    }
    return cu(t, r, s, u, h);
  }
  function Sm(t, r, s) {
    var u = r.pendingProps, h = u.children, g = t !== null ? t.memoizedState : null;
    if (u.mode === "hidden") if ((r.mode & 1) === 0) r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Pe(Yr, wt), wt |= s;
    else {
      if ((s & 1073741824) === 0) return t = g !== null ? g.baseLanes | s : s, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: t, cachePool: null, transitions: null }, r.updateQueue = null, Pe(Yr, wt), wt |= t, null;
      r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, u = g !== null ? g.baseLanes : s, Pe(Yr, wt), wt |= u;
    }
    else g !== null ? (u = g.baseLanes | s, r.memoizedState = null) : u = s, Pe(Yr, wt), wt |= u;
    return rt(t, r, h, s), r.child;
  }
  function wm(t, r) {
    var s = r.ref;
    (t === null && s !== null || t !== null && t.ref !== s) && (r.flags |= 512, r.flags |= 2097152);
  }
  function cu(t, r, s, u, h) {
    var g = ct(s) ? qn : qe.current;
    return g = Lr(r, g), Hr(r, h), s = eu(t, r, s, u, g, h), u = tu(), t !== null && !dt ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~h, fn(t, r, h)) : (Re && u && Ol(r), r.flags |= 1, rt(t, r, s, h), r.child);
  }
  function xm(t, r, s, u, h) {
    if (ct(s)) {
      var g = !0;
      is(r);
    } else g = !1;
    if (Hr(r, h), r.stateNode === null) Ts(t, r), um(r, s, u), au(r, s, u, h), u = !0;
    else if (t === null) {
      var _ = r.stateNode, P = r.memoizedProps;
      _.props = P;
      var b = _.context, F = s.contextType;
      typeof F == "object" && F !== null ? F = At(F) : (F = ct(s) ? qn : qe.current, F = Lr(r, F));
      var z = s.getDerivedStateFromProps, $ = typeof z == "function" || typeof _.getSnapshotBeforeUpdate == "function";
      $ || typeof _.UNSAFE_componentWillReceiveProps != "function" && typeof _.componentWillReceiveProps != "function" || (P !== u || b !== F) && cm(r, _, u, F), Rn = !1;
      var B = r.memoizedState;
      _.state = B, ms(r, u, _, h), b = r.memoizedState, P !== u || B !== b || ut.current || Rn ? (typeof z == "function" && (su(r, s, z, u), b = r.memoizedState), (P = Rn || lm(r, s, P, u, B, b, F)) ? ($ || typeof _.UNSAFE_componentWillMount != "function" && typeof _.componentWillMount != "function" || (typeof _.componentWillMount == "function" && _.componentWillMount(), typeof _.UNSAFE_componentWillMount == "function" && _.UNSAFE_componentWillMount()), typeof _.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof _.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = u, r.memoizedState = b), _.props = u, _.state = b, _.context = F, u = P) : (typeof _.componentDidMount == "function" && (r.flags |= 4194308), u = !1);
    } else {
      _ = r.stateNode, Op(t, r), P = r.memoizedProps, F = r.type === r.elementType ? P : Ft(r.type, P), _.props = F, $ = r.pendingProps, B = _.context, b = s.contextType, typeof b == "object" && b !== null ? b = At(b) : (b = ct(s) ? qn : qe.current, b = Lr(r, b));
      var J = s.getDerivedStateFromProps;
      (z = typeof J == "function" || typeof _.getSnapshotBeforeUpdate == "function") || typeof _.UNSAFE_componentWillReceiveProps != "function" && typeof _.componentWillReceiveProps != "function" || (P !== $ || B !== b) && cm(r, _, u, b), Rn = !1, B = r.memoizedState, _.state = B, ms(r, u, _, h);
      var te = r.memoizedState;
      P !== $ || B !== te || ut.current || Rn ? (typeof J == "function" && (su(r, s, J, u), te = r.memoizedState), (F = Rn || lm(r, s, F, u, B, te, b) || !1) ? (z || typeof _.UNSAFE_componentWillUpdate != "function" && typeof _.componentWillUpdate != "function" || (typeof _.componentWillUpdate == "function" && _.componentWillUpdate(u, te, b), typeof _.UNSAFE_componentWillUpdate == "function" && _.UNSAFE_componentWillUpdate(u, te, b)), typeof _.componentDidUpdate == "function" && (r.flags |= 4), typeof _.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof _.componentDidUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 4), typeof _.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 1024), r.memoizedProps = u, r.memoizedState = te), _.props = u, _.state = te, _.context = b, u = F) : (typeof _.componentDidUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 4), typeof _.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && B === t.memoizedState || (r.flags |= 1024), u = !1);
    }
    return du(t, r, s, u, g, h);
  }
  function du(t, r, s, u, h, g) {
    wm(t, r);
    var _ = (r.flags & 128) !== 0;
    if (!u && !_) return h && Cp(r, s, !1), fn(t, r, g);
    u = r.stateNode, mx.current = r;
    var P = _ && typeof s.getDerivedStateFromError != "function" ? null : u.render();
    return r.flags |= 1, t !== null && _ ? (r.child = Ur(r, t.child, null, g), r.child = Ur(r, null, P, g)) : rt(t, r, P, g), r.memoizedState = u.state, h && Cp(r, s, !0), r.child;
  }
  function _m(t) {
    var r = t.stateNode;
    r.pendingContext ? kp(t, r.pendingContext, r.pendingContext !== r.context) : r.context && kp(t, r.context, !1), Yl(t, r.containerInfo);
  }
  function Tm(t, r, s, u, h) {
    return zr(), zl(h), r.flags |= 256, rt(t, r, s, u), r.child;
  }
  var fu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function pu(t) {
    return { baseLanes: t, cachePool: null, transitions: null };
  }
  function km(t, r, s) {
    var u = r.pendingProps, h = De.current, g = !1, _ = (r.flags & 128) !== 0, P;
    if ((P = _) || (P = t !== null && t.memoizedState === null ? !1 : (h & 2) !== 0), P ? (g = !0, r.flags &= -129) : (t === null || t.memoizedState !== null) && (h |= 1), Pe(De, h & 1), t === null)
      return Bl(r), t = r.memoizedState, t !== null && (t = t.dehydrated, t !== null) ? ((r.mode & 1) === 0 ? r.lanes = 1 : t.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824, null) : (_ = u.children, t = u.fallback, g ? (u = r.mode, g = r.child, _ = { mode: "hidden", children: _ }, (u & 1) === 0 && g !== null ? (g.childLanes = 0, g.pendingProps = _) : g = js(_, u, 0, null), t = ur(t, u, s, null), g.return = r, t.return = r, g.sibling = t, r.child = g, r.child.memoizedState = pu(s), r.memoizedState = fu, t) : mu(r, _));
    if (h = t.memoizedState, h !== null && (P = h.dehydrated, P !== null)) return hx(t, r, _, u, P, h, s);
    if (g) {
      g = u.fallback, _ = r.mode, h = t.child, P = h.sibling;
      var b = { mode: "hidden", children: u.children };
      return (_ & 1) === 0 && r.child !== h ? (u = r.child, u.childLanes = 0, u.pendingProps = b, r.deletions = null) : (u = Ln(h, b), u.subtreeFlags = h.subtreeFlags & 14680064), P !== null ? g = Ln(P, g) : (g = ur(g, _, s, null), g.flags |= 2), g.return = r, u.return = r, u.sibling = g, r.child = u, u = g, g = r.child, _ = t.child.memoizedState, _ = _ === null ? pu(s) : { baseLanes: _.baseLanes | s, cachePool: null, transitions: _.transitions }, g.memoizedState = _, g.childLanes = t.childLanes & ~s, r.memoizedState = fu, u;
    }
    return g = t.child, t = g.sibling, u = Ln(g, { mode: "visible", children: u.children }), (r.mode & 1) === 0 && (u.lanes = s), u.return = r, u.sibling = null, t !== null && (s = r.deletions, s === null ? (r.deletions = [t], r.flags |= 16) : s.push(t)), r.child = u, r.memoizedState = null, u;
  }
  function mu(t, r) {
    return r = js({ mode: "visible", children: r }, t.mode, 0, null), r.return = t, t.child = r;
  }
  function _s(t, r, s, u) {
    return u !== null && zl(u), Ur(r, t.child, null, s), t = mu(r, r.pendingProps.children), t.flags |= 2, r.memoizedState = null, t;
  }
  function hx(t, r, s, u, h, g, _) {
    if (s)
      return r.flags & 256 ? (r.flags &= -257, u = lu(Error(o(422))), _s(t, r, _, u)) : r.memoizedState !== null ? (r.child = t.child, r.flags |= 128, null) : (g = u.fallback, h = r.mode, u = js({ mode: "visible", children: u.children }, h, 0, null), g = ur(g, h, _, null), g.flags |= 2, u.return = r, g.return = r, u.sibling = g, r.child = u, (r.mode & 1) !== 0 && Ur(r, t.child, null, _), r.child.memoizedState = pu(_), r.memoizedState = fu, g);
    if ((r.mode & 1) === 0) return _s(t, r, _, null);
    if (h.data === "$!") {
      if (u = h.nextSibling && h.nextSibling.dataset, u) var P = u.dgst;
      return u = P, g = Error(o(419)), u = lu(g, u, void 0), _s(t, r, _, u);
    }
    if (P = (_ & t.childLanes) !== 0, dt || P) {
      if (u = We, u !== null) {
        switch (_ & -_) {
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
        h = (h & (u.suspendedLanes | _)) !== 0 ? 0 : h, h !== 0 && h !== g.retryLane && (g.retryLane = h, cn(t, h), Vt(u, t, h, -1));
      }
      return Mu(), u = lu(Error(o(421))), _s(t, r, _, u);
    }
    return h.data === "$?" ? (r.flags |= 128, r.child = t.child, r = Ex.bind(null, t), h._reactRetry = r, null) : (t = g.treeContext, St = Pn(h.nextSibling), vt = r, Re = !0, jt = null, t !== null && (Tt[kt++] = ln, Tt[kt++] = un, Tt[kt++] = er, ln = t.id, un = t.overflow, er = r), r = mu(r, u.children), r.flags |= 4096, r);
  }
  function Am(t, r, s) {
    t.lanes |= r;
    var u = t.alternate;
    u !== null && (u.lanes |= r), Wl(t.return, r, s);
  }
  function hu(t, r, s, u, h) {
    var g = t.memoizedState;
    g === null ? t.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: u, tail: s, tailMode: h } : (g.isBackwards = r, g.rendering = null, g.renderingStartTime = 0, g.last = u, g.tail = s, g.tailMode = h);
  }
  function Cm(t, r, s) {
    var u = r.pendingProps, h = u.revealOrder, g = u.tail;
    if (rt(t, r, u.children, s), u = De.current, (u & 2) !== 0) u = u & 1 | 2, r.flags |= 128;
    else {
      if (t !== null && (t.flags & 128) !== 0) e: for (t = r.child; t !== null; ) {
        if (t.tag === 13) t.memoizedState !== null && Am(t, s, r);
        else if (t.tag === 19) Am(t, s, r);
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
    if (Pe(De, u), (r.mode & 1) === 0) r.memoizedState = null;
    else switch (h) {
      case "forwards":
        for (s = r.child, h = null; s !== null; ) t = s.alternate, t !== null && hs(t) === null && (h = s), s = s.sibling;
        s = h, s === null ? (h = r.child, r.child = null) : (h = s.sibling, s.sibling = null), hu(r, !1, h, s, g);
        break;
      case "backwards":
        for (s = null, h = r.child, r.child = null; h !== null; ) {
          if (t = h.alternate, t !== null && hs(t) === null) {
            r.child = h;
            break;
          }
          t = h.sibling, h.sibling = s, s = h, h = t;
        }
        hu(r, !0, s, null, g);
        break;
      case "together":
        hu(r, !1, null, null, void 0);
        break;
      default:
        r.memoizedState = null;
    }
    return r.child;
  }
  function Ts(t, r) {
    (r.mode & 1) === 0 && t !== null && (t.alternate = null, r.alternate = null, r.flags |= 2);
  }
  function fn(t, r, s) {
    if (t !== null && (r.dependencies = t.dependencies), ir |= r.lanes, (s & r.childLanes) === 0) return null;
    if (t !== null && r.child !== t.child) throw Error(o(153));
    if (r.child !== null) {
      for (t = r.child, s = Ln(t, t.pendingProps), r.child = s, s.return = r; t.sibling !== null; ) t = t.sibling, s = s.sibling = Ln(t, t.pendingProps), s.return = r;
      s.sibling = null;
    }
    return r.child;
  }
  function yx(t, r, s) {
    switch (r.tag) {
      case 3:
        _m(r), zr();
        break;
      case 5:
        Bp(r);
        break;
      case 1:
        ct(r.type) && is(r);
        break;
      case 4:
        Yl(r, r.stateNode.containerInfo);
        break;
      case 10:
        var u = r.type._context, h = r.memoizedProps.value;
        Pe(ds, u._currentValue), u._currentValue = h;
        break;
      case 13:
        if (u = r.memoizedState, u !== null)
          return u.dehydrated !== null ? (Pe(De, De.current & 1), r.flags |= 128, null) : (s & r.child.childLanes) !== 0 ? km(t, r, s) : (Pe(De, De.current & 1), t = fn(t, r, s), t !== null ? t.sibling : null);
        Pe(De, De.current & 1);
        break;
      case 19:
        if (u = (s & r.childLanes) !== 0, (t.flags & 128) !== 0) {
          if (u) return Cm(t, r, s);
          r.flags |= 128;
        }
        if (h = r.memoizedState, h !== null && (h.rendering = null, h.tail = null, h.lastEffect = null), Pe(De, De.current), u) break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, Sm(t, r, s);
    }
    return fn(t, r, s);
  }
  var Pm, yu, Em, bm;
  Pm = function(t, r) {
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
  }, Em = function(t, r, s, u) {
    var h = t.memoizedProps;
    if (h !== u) {
      t = r.stateNode, rr(Kt.current);
      var g = null;
      switch (s) {
        case "input":
          h = Wa(t, h), u = Wa(t, u), g = [];
          break;
        case "select":
          h = Y({}, h, { value: void 0 }), u = Y({}, u, { value: void 0 }), g = [];
          break;
        case "textarea":
          h = Ya(t, h), u = Ya(t, u), g = [];
          break;
        default:
          typeof h.onClick != "function" && typeof u.onClick == "function" && (t.onclick = ns);
      }
      Xa(s, u);
      var _;
      s = null;
      for (F in h) if (!u.hasOwnProperty(F) && h.hasOwnProperty(F) && h[F] != null) if (F === "style") {
        var P = h[F];
        for (_ in P) P.hasOwnProperty(_) && (s || (s = {}), s[_] = "");
      } else F !== "dangerouslySetInnerHTML" && F !== "children" && F !== "suppressContentEditableWarning" && F !== "suppressHydrationWarning" && F !== "autoFocus" && (a.hasOwnProperty(F) ? g || (g = []) : (g = g || []).push(F, null));
      for (F in u) {
        var b = u[F];
        if (P = h != null ? h[F] : void 0, u.hasOwnProperty(F) && b !== P && (b != null || P != null)) if (F === "style") if (P) {
          for (_ in P) !P.hasOwnProperty(_) || b && b.hasOwnProperty(_) || (s || (s = {}), s[_] = "");
          for (_ in b) b.hasOwnProperty(_) && P[_] !== b[_] && (s || (s = {}), s[_] = b[_]);
        } else s || (g || (g = []), g.push(
          F,
          s
        )), s = b;
        else F === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, P = P ? P.__html : void 0, b != null && P !== b && (g = g || []).push(F, b)) : F === "children" ? typeof b != "string" && typeof b != "number" || (g = g || []).push(F, "" + b) : F !== "suppressContentEditableWarning" && F !== "suppressHydrationWarning" && (a.hasOwnProperty(F) ? (b != null && F === "onScroll" && Ee("scroll", t), g || P === b || (g = [])) : (g = g || []).push(F, b));
      }
      s && (g = g || []).push("style", s);
      var F = g;
      (r.updateQueue = F) && (r.flags |= 4);
    }
  }, bm = function(t, r, s, u) {
    s !== u && (r.flags |= 4);
  };
  function Jo(t, r) {
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
  function gx(t, r, s) {
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
        return ct(r.type) && os(), tt(r), null;
      case 3:
        return u = r.stateNode, Wr(), be(ut), be(qe), Zl(), u.pendingContext && (u.context = u.pendingContext, u.pendingContext = null), (t === null || t.child === null) && (us(r) ? r.flags |= 4 : t === null || t.memoizedState.isDehydrated && (r.flags & 256) === 0 || (r.flags |= 1024, jt !== null && (Pu(jt), jt = null))), yu(t, r), tt(r), null;
      case 5:
        Ql(r);
        var h = rr(Ko.current);
        if (s = r.type, t !== null && r.stateNode != null) Em(t, r, s, u, h), t.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!u) {
            if (r.stateNode === null) throw Error(o(166));
            return tt(r), null;
          }
          if (t = rr(Kt.current), us(r)) {
            u = r.stateNode, s = r.type;
            var g = r.memoizedProps;
            switch (u[Gt] = r, u[Uo] = g, t = (r.mode & 1) !== 0, s) {
              case "dialog":
                Ee("cancel", u), Ee("close", u);
                break;
              case "iframe":
              case "object":
              case "embed":
                Ee("load", u);
                break;
              case "video":
              case "audio":
                for (h = 0; h < Vo.length; h++) Ee(Vo[h], u);
                break;
              case "source":
                Ee("error", u);
                break;
              case "img":
              case "image":
              case "link":
                Ee(
                  "error",
                  u
                ), Ee("load", u);
                break;
              case "details":
                Ee("toggle", u);
                break;
              case "input":
                uf(u, g), Ee("invalid", u);
                break;
              case "select":
                u._wrapperState = { wasMultiple: !!g.multiple }, Ee("invalid", u);
                break;
              case "textarea":
                ff(u, g), Ee("invalid", u);
            }
            Xa(s, g), h = null;
            for (var _ in g) if (g.hasOwnProperty(_)) {
              var P = g[_];
              _ === "children" ? typeof P == "string" ? u.textContent !== P && (g.suppressHydrationWarning !== !0 && ts(u.textContent, P, t), h = ["children", P]) : typeof P == "number" && u.textContent !== "" + P && (g.suppressHydrationWarning !== !0 && ts(
                u.textContent,
                P,
                t
              ), h = ["children", "" + P]) : a.hasOwnProperty(_) && P != null && _ === "onScroll" && Ee("scroll", u);
            }
            switch (s) {
              case "input":
                Di(u), df(u, g, !0);
                break;
              case "textarea":
                Di(u), mf(u);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof g.onClick == "function" && (u.onclick = ns);
            }
            u = h, r.updateQueue = u, u !== null && (r.flags |= 4);
          } else {
            _ = h.nodeType === 9 ? h : h.ownerDocument, t === "http://www.w3.org/1999/xhtml" && (t = hf(s)), t === "http://www.w3.org/1999/xhtml" ? s === "script" ? (t = _.createElement("div"), t.innerHTML = "<script><\/script>", t = t.removeChild(t.firstChild)) : typeof u.is == "string" ? t = _.createElement(s, { is: u.is }) : (t = _.createElement(s), s === "select" && (_ = t, u.multiple ? _.multiple = !0 : u.size && (_.size = u.size))) : t = _.createElementNS(t, s), t[Gt] = r, t[Uo] = u, Pm(t, r, !1, !1), r.stateNode = t;
            e: {
              switch (_ = Za(s, u), s) {
                case "dialog":
                  Ee("cancel", t), Ee("close", t), h = u;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Ee("load", t), h = u;
                  break;
                case "video":
                case "audio":
                  for (h = 0; h < Vo.length; h++) Ee(Vo[h], t);
                  h = u;
                  break;
                case "source":
                  Ee("error", t), h = u;
                  break;
                case "img":
                case "image":
                case "link":
                  Ee(
                    "error",
                    t
                  ), Ee("load", t), h = u;
                  break;
                case "details":
                  Ee("toggle", t), h = u;
                  break;
                case "input":
                  uf(t, u), h = Wa(t, u), Ee("invalid", t);
                  break;
                case "option":
                  h = u;
                  break;
                case "select":
                  t._wrapperState = { wasMultiple: !!u.multiple }, h = Y({}, u, { value: void 0 }), Ee("invalid", t);
                  break;
                case "textarea":
                  ff(t, u), h = Ya(t, u), Ee("invalid", t);
                  break;
                default:
                  h = u;
              }
              Xa(s, h), P = h;
              for (g in P) if (P.hasOwnProperty(g)) {
                var b = P[g];
                g === "style" ? vf(t, b) : g === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, b != null && yf(t, b)) : g === "children" ? typeof b == "string" ? (s !== "textarea" || b !== "") && wo(t, b) : typeof b == "number" && wo(t, "" + b) : g !== "suppressContentEditableWarning" && g !== "suppressHydrationWarning" && g !== "autoFocus" && (a.hasOwnProperty(g) ? b != null && g === "onScroll" && Ee("scroll", t) : b != null && M(t, g, b, _));
              }
              switch (s) {
                case "input":
                  Di(t), df(t, u, !1);
                  break;
                case "textarea":
                  Di(t), mf(t);
                  break;
                case "option":
                  u.value != null && t.setAttribute("value", "" + we(u.value));
                  break;
                case "select":
                  t.multiple = !!u.multiple, g = u.value, g != null ? Cr(t, !!u.multiple, g, !1) : u.defaultValue != null && Cr(
                    t,
                    !!u.multiple,
                    u.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof h.onClick == "function" && (t.onclick = ns);
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
        if (t && r.stateNode != null) bm(t, r, t.memoizedProps, u);
        else {
          if (typeof u != "string" && r.stateNode === null) throw Error(o(166));
          if (s = rr(Ko.current), rr(Kt.current), us(r)) {
            if (u = r.stateNode, s = r.memoizedProps, u[Gt] = r, (g = u.nodeValue !== s) && (t = vt, t !== null)) switch (t.tag) {
              case 3:
                ts(u.nodeValue, s, (t.mode & 1) !== 0);
                break;
              case 5:
                t.memoizedProps.suppressHydrationWarning !== !0 && ts(u.nodeValue, s, (t.mode & 1) !== 0);
            }
            g && (r.flags |= 4);
          } else u = (s.nodeType === 9 ? s : s.ownerDocument).createTextNode(u), u[Gt] = r, r.stateNode = u;
        }
        return tt(r), null;
      case 13:
        if (be(De), u = r.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (Re && St !== null && (r.mode & 1) !== 0 && (r.flags & 128) === 0) Dp(), zr(), r.flags |= 98560, g = !1;
          else if (g = us(r), u !== null && u.dehydrated !== null) {
            if (t === null) {
              if (!g) throw Error(o(318));
              if (g = r.memoizedState, g = g !== null ? g.dehydrated : null, !g) throw Error(o(317));
              g[Gt] = r;
            } else zr(), (r.flags & 128) === 0 && (r.memoizedState = null), r.flags |= 4;
            tt(r), g = !1;
          } else jt !== null && (Pu(jt), jt = null), g = !0;
          if (!g) return r.flags & 65536 ? r : null;
        }
        return (r.flags & 128) !== 0 ? (r.lanes = s, r) : (u = u !== null, u !== (t !== null && t.memoizedState !== null) && u && (r.child.flags |= 8192, (r.mode & 1) !== 0 && (t === null || (De.current & 1) !== 0 ? Ue === 0 && (Ue = 3) : Mu())), r.updateQueue !== null && (r.flags |= 4), tt(r), null);
      case 4:
        return Wr(), yu(t, r), t === null && Bo(r.stateNode.containerInfo), tt(r), null;
      case 10:
        return Hl(r.type._context), tt(r), null;
      case 17:
        return ct(r.type) && os(), tt(r), null;
      case 19:
        if (be(De), g = r.memoizedState, g === null) return tt(r), null;
        if (u = (r.flags & 128) !== 0, _ = g.rendering, _ === null) if (u) Jo(g, !1);
        else {
          if (Ue !== 0 || t !== null && (t.flags & 128) !== 0) for (t = r.child; t !== null; ) {
            if (_ = hs(t), _ !== null) {
              for (r.flags |= 128, Jo(g, !1), u = _.updateQueue, u !== null && (r.updateQueue = u, r.flags |= 4), r.subtreeFlags = 0, u = s, s = r.child; s !== null; ) g = s, t = u, g.flags &= 14680066, _ = g.alternate, _ === null ? (g.childLanes = 0, g.lanes = t, g.child = null, g.subtreeFlags = 0, g.memoizedProps = null, g.memoizedState = null, g.updateQueue = null, g.dependencies = null, g.stateNode = null) : (g.childLanes = _.childLanes, g.lanes = _.lanes, g.child = _.child, g.subtreeFlags = 0, g.deletions = null, g.memoizedProps = _.memoizedProps, g.memoizedState = _.memoizedState, g.updateQueue = _.updateQueue, g.type = _.type, t = _.dependencies, g.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), s = s.sibling;
              return Pe(De, De.current & 1 | 2), r.child;
            }
            t = t.sibling;
          }
          g.tail !== null && Fe() > Qr && (r.flags |= 128, u = !0, Jo(g, !1), r.lanes = 4194304);
        }
        else {
          if (!u) if (t = hs(_), t !== null) {
            if (r.flags |= 128, u = !0, s = t.updateQueue, s !== null && (r.updateQueue = s, r.flags |= 4), Jo(g, !0), g.tail === null && g.tailMode === "hidden" && !_.alternate && !Re) return tt(r), null;
          } else 2 * Fe() - g.renderingStartTime > Qr && s !== 1073741824 && (r.flags |= 128, u = !0, Jo(g, !1), r.lanes = 4194304);
          g.isBackwards ? (_.sibling = r.child, r.child = _) : (s = g.last, s !== null ? s.sibling = _ : r.child = _, g.last = _);
        }
        return g.tail !== null ? (r = g.tail, g.rendering = r, g.tail = r.sibling, g.renderingStartTime = Fe(), r.sibling = null, s = De.current, Pe(De, u ? s & 1 | 2 : s & 1), r) : (tt(r), null);
      case 22:
      case 23:
        return bu(), u = r.memoizedState !== null, t !== null && t.memoizedState !== null !== u && (r.flags |= 8192), u && (r.mode & 1) !== 0 ? (wt & 1073741824) !== 0 && (tt(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : tt(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(o(156, r.tag));
  }
  function vx(t, r) {
    switch (Ll(r), r.tag) {
      case 1:
        return ct(r.type) && os(), t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 3:
        return Wr(), be(ut), be(qe), Zl(), t = r.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (r.flags = t & -65537 | 128, r) : null;
      case 5:
        return Ql(r), null;
      case 13:
        if (be(De), t = r.memoizedState, t !== null && t.dehydrated !== null) {
          if (r.alternate === null) throw Error(o(340));
          zr();
        }
        return t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 19:
        return be(De), null;
      case 4:
        return Wr(), null;
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
  var ks = !1, nt = !1, Sx = typeof WeakSet == "function" ? WeakSet : Set, ee = null;
  function Kr(t, r) {
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
  var Mm = !1;
  function wx(t, r) {
    if (bl = Hi, t = lp(), xl(t)) {
      if ("selectionStart" in t) var s = { start: t.selectionStart, end: t.selectionEnd };
      else e: {
        s = (s = t.ownerDocument) && s.defaultView || window;
        var u = s.getSelection && s.getSelection();
        if (u && u.rangeCount !== 0) {
          s = u.anchorNode;
          var h = u.anchorOffset, g = u.focusNode;
          u = u.focusOffset;
          try {
            s.nodeType, g.nodeType;
          } catch {
            s = null;
            break e;
          }
          var _ = 0, P = -1, b = -1, F = 0, z = 0, $ = t, B = null;
          t: for (; ; ) {
            for (var J; $ !== s || h !== 0 && $.nodeType !== 3 || (P = _ + h), $ !== g || u !== 0 && $.nodeType !== 3 || (b = _ + u), $.nodeType === 3 && (_ += $.nodeValue.length), (J = $.firstChild) !== null; )
              B = $, $ = J;
            for (; ; ) {
              if ($ === t) break t;
              if (B === s && ++F === h && (P = _), B === g && ++z === u && (b = _), (J = $.nextSibling) !== null) break;
              $ = B, B = $.parentNode;
            }
            $ = J;
          }
          s = P === -1 || b === -1 ? null : { start: P, end: b };
        } else s = null;
      }
      s = s || { start: 0, end: 0 };
    } else s = null;
    for (Ml = { focusedElem: t, selectionRange: s }, Hi = !1, ee = r; ee !== null; ) if (r = ee, t = r.child, (r.subtreeFlags & 1028) !== 0 && t !== null) t.return = r, ee = t;
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
              var re = te.memoizedProps, Oe = te.memoizedState, I = r.stateNode, R = I.getSnapshotBeforeUpdate(r.elementType === r.type ? re : Ft(r.type, re), Oe);
              I.__reactInternalSnapshotBeforeUpdate = R;
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
      } catch (H) {
        je(r, r.return, H);
      }
      if (t = r.sibling, t !== null) {
        t.return = r.return, ee = t;
        break;
      }
      ee = r.return;
    }
    return te = Mm, Mm = !1, te;
  }
  function qo(t, r, s) {
    var u = r.updateQueue;
    if (u = u !== null ? u.lastEffect : null, u !== null) {
      var h = u = u.next;
      do {
        if ((h.tag & t) === t) {
          var g = h.destroy;
          h.destroy = void 0, g !== void 0 && gu(r, s, g);
        }
        h = h.next;
      } while (h !== u);
    }
  }
  function As(t, r) {
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
  function Rm(t) {
    var r = t.alternate;
    r !== null && (t.alternate = null, Rm(r)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (r = t.stateNode, r !== null && (delete r[Gt], delete r[Uo], delete r[Il], delete r[nx], delete r[rx])), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  function Dm(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 4;
  }
  function Nm(t) {
    e: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || Dm(t.return)) return null;
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
    if (u === 5 || u === 6) t = t.stateNode, r ? s.nodeType === 8 ? s.parentNode.insertBefore(t, r) : s.insertBefore(t, r) : (s.nodeType === 8 ? (r = s.parentNode, r.insertBefore(t, s)) : (r = s, r.appendChild(t)), s = s._reactRootContainer, s != null || r.onclick !== null || (r.onclick = ns));
    else if (u !== 4 && (t = t.child, t !== null)) for (Su(t, r, s), t = t.sibling; t !== null; ) Su(t, r, s), t = t.sibling;
  }
  function wu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.insertBefore(t, r) : s.appendChild(t);
    else if (u !== 4 && (t = t.child, t !== null)) for (wu(t, r, s), t = t.sibling; t !== null; ) wu(t, r, s), t = t.sibling;
  }
  var Qe = null, Ot = !1;
  function Nn(t, r, s) {
    for (s = s.child; s !== null; ) Im(t, r, s), s = s.sibling;
  }
  function Im(t, r, s) {
    if (Wt && typeof Wt.onCommitFiberUnmount == "function") try {
      Wt.onCommitFiberUnmount(Li, s);
    } catch {
    }
    switch (s.tag) {
      case 5:
        nt || Kr(s, r);
      case 6:
        var u = Qe, h = Ot;
        Qe = null, Nn(t, r, s), Qe = u, Ot = h, Qe !== null && (Ot ? (t = Qe, s = s.stateNode, t.nodeType === 8 ? t.parentNode.removeChild(s) : t.removeChild(s)) : Qe.removeChild(s.stateNode));
        break;
      case 18:
        Qe !== null && (Ot ? (t = Qe, s = s.stateNode, t.nodeType === 8 ? Nl(t.parentNode, s) : t.nodeType === 1 && Nl(t, s), Ro(t)) : Nl(Qe, s.stateNode));
        break;
      case 4:
        u = Qe, h = Ot, Qe = s.stateNode.containerInfo, Ot = !0, Nn(t, r, s), Qe = u, Ot = h;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!nt && (u = s.updateQueue, u !== null && (u = u.lastEffect, u !== null))) {
          h = u = u.next;
          do {
            var g = h, _ = g.destroy;
            g = g.tag, _ !== void 0 && ((g & 2) !== 0 || (g & 4) !== 0) && gu(s, r, _), h = h.next;
          } while (h !== u);
        }
        Nn(t, r, s);
        break;
      case 1:
        if (!nt && (Kr(s, r), u = s.stateNode, typeof u.componentWillUnmount == "function")) try {
          u.props = s.memoizedProps, u.state = s.memoizedState, u.componentWillUnmount();
        } catch (P) {
          je(s, r, P);
        }
        Nn(t, r, s);
        break;
      case 21:
        Nn(t, r, s);
        break;
      case 22:
        s.mode & 1 ? (nt = (u = nt) || s.memoizedState !== null, Nn(t, r, s), nt = u) : Nn(t, r, s);
        break;
      default:
        Nn(t, r, s);
    }
  }
  function jm(t) {
    var r = t.updateQueue;
    if (r !== null) {
      t.updateQueue = null;
      var s = t.stateNode;
      s === null && (s = t.stateNode = new Sx()), r.forEach(function(u) {
        var h = bx.bind(null, t, u);
        s.has(u) || (s.add(u), u.then(h, h));
      });
    }
  }
  function Lt(t, r) {
    var s = r.deletions;
    if (s !== null) for (var u = 0; u < s.length; u++) {
      var h = s[u];
      try {
        var g = t, _ = r, P = _;
        e: for (; P !== null; ) {
          switch (P.tag) {
            case 5:
              Qe = P.stateNode, Ot = !1;
              break e;
            case 3:
              Qe = P.stateNode.containerInfo, Ot = !0;
              break e;
            case 4:
              Qe = P.stateNode.containerInfo, Ot = !0;
              break e;
          }
          P = P.return;
        }
        if (Qe === null) throw Error(o(160));
        Im(g, _, h), Qe = null, Ot = !1;
        var b = h.alternate;
        b !== null && (b.return = null), h.return = null;
      } catch (F) {
        je(h, r, F);
      }
    }
    if (r.subtreeFlags & 12854) for (r = r.child; r !== null; ) Fm(r, t), r = r.sibling;
  }
  function Fm(t, r) {
    var s = t.alternate, u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Lt(r, t), Qt(t), u & 4) {
          try {
            qo(3, t, t.return), As(3, t);
          } catch (re) {
            je(t, t.return, re);
          }
          try {
            qo(5, t, t.return);
          } catch (re) {
            je(t, t.return, re);
          }
        }
        break;
      case 1:
        Lt(r, t), Qt(t), u & 512 && s !== null && Kr(s, s.return);
        break;
      case 5:
        if (Lt(r, t), Qt(t), u & 512 && s !== null && Kr(s, s.return), t.flags & 32) {
          var h = t.stateNode;
          try {
            wo(h, "");
          } catch (re) {
            je(t, t.return, re);
          }
        }
        if (u & 4 && (h = t.stateNode, h != null)) {
          var g = t.memoizedProps, _ = s !== null ? s.memoizedProps : g, P = t.type, b = t.updateQueue;
          if (t.updateQueue = null, b !== null) try {
            P === "input" && g.type === "radio" && g.name != null && cf(h, g), Za(P, _);
            var F = Za(P, g);
            for (_ = 0; _ < b.length; _ += 2) {
              var z = b[_], $ = b[_ + 1];
              z === "style" ? vf(h, $) : z === "dangerouslySetInnerHTML" ? yf(h, $) : z === "children" ? wo(h, $) : M(h, z, $, F);
            }
            switch (P) {
              case "input":
                Ga(h, g);
                break;
              case "textarea":
                pf(h, g);
                break;
              case "select":
                var B = h._wrapperState.wasMultiple;
                h._wrapperState.wasMultiple = !!g.multiple;
                var J = g.value;
                J != null ? Cr(h, !!g.multiple, J, !1) : B !== !!g.multiple && (g.defaultValue != null ? Cr(
                  h,
                  !!g.multiple,
                  g.defaultValue,
                  !0
                ) : Cr(h, !!g.multiple, g.multiple ? [] : "", !1));
            }
            h[Uo] = g;
          } catch (re) {
            je(t, t.return, re);
          }
        }
        break;
      case 6:
        if (Lt(r, t), Qt(t), u & 4) {
          if (t.stateNode === null) throw Error(o(162));
          h = t.stateNode, g = t.memoizedProps;
          try {
            h.nodeValue = g;
          } catch (re) {
            je(t, t.return, re);
          }
        }
        break;
      case 3:
        if (Lt(r, t), Qt(t), u & 4 && s !== null && s.memoizedState.isDehydrated) try {
          Ro(r.containerInfo);
        } catch (re) {
          je(t, t.return, re);
        }
        break;
      case 4:
        Lt(r, t), Qt(t);
        break;
      case 13:
        Lt(r, t), Qt(t), h = t.child, h.flags & 8192 && (g = h.memoizedState !== null, h.stateNode.isHidden = g, !g || h.alternate !== null && h.alternate.memoizedState !== null || (Tu = Fe())), u & 4 && jm(t);
        break;
      case 22:
        if (z = s !== null && s.memoizedState !== null, t.mode & 1 ? (nt = (F = nt) || z, Lt(r, t), nt = F) : Lt(r, t), Qt(t), u & 8192) {
          if (F = t.memoizedState !== null, (t.stateNode.isHidden = F) && !z && (t.mode & 1) !== 0) for (ee = t, z = t.child; z !== null; ) {
            for ($ = ee = z; ee !== null; ) {
              switch (B = ee, J = B.child, B.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  qo(4, B, B.return);
                  break;
                case 1:
                  Kr(B, B.return);
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
                  Kr(B, B.return);
                  break;
                case 22:
                  if (B.memoizedState !== null) {
                    Vm($);
                    continue;
                  }
              }
              J !== null ? (J.return = B, ee = J) : Vm($);
            }
            z = z.sibling;
          }
          e: for (z = null, $ = t; ; ) {
            if ($.tag === 5) {
              if (z === null) {
                z = $;
                try {
                  h = $.stateNode, F ? (g = h.style, typeof g.setProperty == "function" ? g.setProperty("display", "none", "important") : g.display = "none") : (P = $.stateNode, b = $.memoizedProps.style, _ = b != null && b.hasOwnProperty("display") ? b.display : null, P.style.display = gf("display", _));
                } catch (re) {
                  je(t, t.return, re);
                }
              }
            } else if ($.tag === 6) {
              if (z === null) try {
                $.stateNode.nodeValue = F ? "" : $.memoizedProps;
              } catch (re) {
                je(t, t.return, re);
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
        Lt(r, t), Qt(t), u & 4 && jm(t);
        break;
      case 21:
        break;
      default:
        Lt(
          r,
          t
        ), Qt(t);
    }
  }
  function Qt(t) {
    var r = t.flags;
    if (r & 2) {
      try {
        e: {
          for (var s = t.return; s !== null; ) {
            if (Dm(s)) {
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
            u.flags & 32 && (wo(h, ""), u.flags &= -33);
            var g = Nm(t);
            wu(t, g, h);
            break;
          case 3:
          case 4:
            var _ = u.stateNode.containerInfo, P = Nm(t);
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
  function xx(t, r, s) {
    ee = t, Om(t);
  }
  function Om(t, r, s) {
    for (var u = (t.mode & 1) !== 0; ee !== null; ) {
      var h = ee, g = h.child;
      if (h.tag === 22 && u) {
        var _ = h.memoizedState !== null || ks;
        if (!_) {
          var P = h.alternate, b = P !== null && P.memoizedState !== null || nt;
          P = ks;
          var F = nt;
          if (ks = _, (nt = b) && !F) for (ee = h; ee !== null; ) _ = ee, b = _.child, _.tag === 22 && _.memoizedState !== null ? Bm(h) : b !== null ? (b.return = _, ee = b) : Bm(h);
          for (; g !== null; ) ee = g, Om(g), g = g.sibling;
          ee = h, ks = P, nt = F;
        }
        Lm(t);
      } else (h.subtreeFlags & 8772) !== 0 && g !== null ? (g.return = h, ee = g) : Lm(t);
    }
  }
  function Lm(t) {
    for (; ee !== null; ) {
      var r = ee;
      if ((r.flags & 8772) !== 0) {
        var s = r.alternate;
        try {
          if ((r.flags & 8772) !== 0) switch (r.tag) {
            case 0:
            case 11:
            case 15:
              nt || As(5, r);
              break;
            case 1:
              var u = r.stateNode;
              if (r.flags & 4 && !nt) if (s === null) u.componentDidMount();
              else {
                var h = r.elementType === r.type ? s.memoizedProps : Ft(r.type, s.memoizedProps);
                u.componentDidUpdate(h, s.memoizedState, u.__reactInternalSnapshotBeforeUpdate);
              }
              var g = r.updateQueue;
              g !== null && Vp(r, g, u);
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
                Vp(r, _, s);
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
                    var $ = z.dehydrated;
                    $ !== null && Ro($);
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
  function Vm(t) {
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
  function Bm(t) {
    for (; ee !== null; ) {
      var r = ee;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var s = r.return;
            try {
              As(4, r);
            } catch (b) {
              je(r, s, b);
            }
            break;
          case 1:
            var u = r.stateNode;
            if (typeof u.componentDidMount == "function") {
              var h = r.return;
              try {
                u.componentDidMount();
              } catch (b) {
                je(r, h, b);
              }
            }
            var g = r.return;
            try {
              vu(r);
            } catch (b) {
              je(r, g, b);
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
  var _x = Math.ceil, Cs = N.ReactCurrentDispatcher, xu = N.ReactCurrentOwner, Pt = N.ReactCurrentBatchConfig, me = 0, We = null, Le = null, Xe = 0, wt = 0, Yr = En(0), Ue = 0, ei = null, ir = 0, Ps = 0, _u = 0, ti = null, ft = null, Tu = 0, Qr = 1 / 0, pn = null, Es = !1, ku = null, In = null, bs = !1, jn = null, Ms = 0, ni = 0, Au = null, Rs = -1, Ds = 0;
  function ot() {
    return (me & 6) !== 0 ? Fe() : Rs !== -1 ? Rs : Rs = Fe();
  }
  function Fn(t) {
    return (t.mode & 1) === 0 ? 1 : (me & 2) !== 0 && Xe !== 0 ? Xe & -Xe : ix.transition !== null ? (Ds === 0 && (Ds = Nf()), Ds) : (t = xe, t !== 0 || (t = window.event, t = t === void 0 ? 16 : Uf(t.type)), t);
  }
  function Vt(t, r, s, u) {
    if (50 < ni) throw ni = 0, Au = null, Error(o(185));
    Co(t, s, u), ((me & 2) === 0 || t !== We) && (t === We && ((me & 2) === 0 && (Ps |= s), Ue === 4 && On(t, Xe)), pt(t, u), s === 1 && me === 0 && (r.mode & 1) === 0 && (Qr = Fe() + 500, ss && Mn()));
  }
  function pt(t, r) {
    var s = t.callbackNode;
    iw(t, r);
    var u = zi(t, t === We ? Xe : 0);
    if (u === 0) s !== null && Mf(s), t.callbackNode = null, t.callbackPriority = 0;
    else if (r = u & -u, t.callbackPriority !== r) {
      if (s != null && Mf(s), r === 1) t.tag === 0 ? ox(Um.bind(null, t)) : Pp(Um.bind(null, t)), ex(function() {
        (me & 6) === 0 && Mn();
      }), s = null;
      else {
        switch (If(u)) {
          case 1:
            s = ol;
            break;
          case 4:
            s = Rf;
            break;
          case 16:
            s = Oi;
            break;
          case 536870912:
            s = Df;
            break;
          default:
            s = Oi;
        }
        s = Xm(s, zm.bind(null, t));
      }
      t.callbackPriority = r, t.callbackNode = s;
    }
  }
  function zm(t, r) {
    if (Rs = -1, Ds = 0, (me & 6) !== 0) throw Error(o(327));
    var s = t.callbackNode;
    if (Xr() && t.callbackNode !== s) return null;
    var u = zi(t, t === We ? Xe : 0);
    if (u === 0) return null;
    if ((u & 30) !== 0 || (u & t.expiredLanes) !== 0 || r) r = Ns(t, u);
    else {
      r = u;
      var h = me;
      me |= 2;
      var g = Hm();
      (We !== t || Xe !== r) && (pn = null, Qr = Fe() + 500, ar(t, r));
      do
        try {
          Ax();
          break;
        } catch (P) {
          $m(t, P);
        }
      while (!0);
      $l(), Cs.current = g, me = h, Le !== null ? r = 0 : (We = null, Xe = 0, r = Ue);
    }
    if (r !== 0) {
      if (r === 2 && (h = il(t), h !== 0 && (u = h, r = Cu(t, h))), r === 1) throw s = ei, ar(t, 0), On(t, u), pt(t, Fe()), s;
      if (r === 6) On(t, u);
      else {
        if (h = t.current.alternate, (u & 30) === 0 && !Tx(h) && (r = Ns(t, u), r === 2 && (g = il(t), g !== 0 && (u = g, r = Cu(t, g))), r === 1)) throw s = ei, ar(t, 0), On(t, u), pt(t, Fe()), s;
        switch (t.finishedWork = h, t.finishedLanes = u, r) {
          case 0:
          case 1:
            throw Error(o(345));
          case 2:
            lr(t, ft, pn);
            break;
          case 3:
            if (On(t, u), (u & 130023424) === u && (r = Tu + 500 - Fe(), 10 < r)) {
              if (zi(t, 0) !== 0) break;
              if (h = t.suspendedLanes, (h & u) !== u) {
                ot(), t.pingedLanes |= t.suspendedLanes & h;
                break;
              }
              t.timeoutHandle = Dl(lr.bind(null, t, ft, pn), r);
              break;
            }
            lr(t, ft, pn);
            break;
          case 4:
            if (On(t, u), (u & 4194240) === u) break;
            for (r = t.eventTimes, h = -1; 0 < u; ) {
              var _ = 31 - Nt(u);
              g = 1 << _, _ = r[_], _ > h && (h = _), u &= ~g;
            }
            if (u = h, u = Fe() - u, u = (120 > u ? 120 : 480 > u ? 480 : 1080 > u ? 1080 : 1920 > u ? 1920 : 3e3 > u ? 3e3 : 4320 > u ? 4320 : 1960 * _x(u / 1960)) - u, 10 < u) {
              t.timeoutHandle = Dl(lr.bind(null, t, ft, pn), u);
              break;
            }
            lr(t, ft, pn);
            break;
          case 5:
            lr(t, ft, pn);
            break;
          default:
            throw Error(o(329));
        }
      }
    }
    return pt(t, Fe()), t.callbackNode === s ? zm.bind(null, t) : null;
  }
  function Cu(t, r) {
    var s = ti;
    return t.current.memoizedState.isDehydrated && (ar(t, r).flags |= 256), t = Ns(t, r), t !== 2 && (r = ft, ft = s, r !== null && Pu(r)), t;
  }
  function Pu(t) {
    ft === null ? ft = t : ft.push.apply(ft, t);
  }
  function Tx(t) {
    for (var r = t; ; ) {
      if (r.flags & 16384) {
        var s = r.updateQueue;
        if (s !== null && (s = s.stores, s !== null)) for (var u = 0; u < s.length; u++) {
          var h = s[u], g = h.getSnapshot;
          h = h.value;
          try {
            if (!It(g(), h)) return !1;
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
  function On(t, r) {
    for (r &= ~_u, r &= ~Ps, t.suspendedLanes |= r, t.pingedLanes &= ~r, t = t.expirationTimes; 0 < r; ) {
      var s = 31 - Nt(r), u = 1 << s;
      t[s] = -1, r &= ~u;
    }
  }
  function Um(t) {
    if ((me & 6) !== 0) throw Error(o(327));
    Xr();
    var r = zi(t, 0);
    if ((r & 1) === 0) return pt(t, Fe()), null;
    var s = Ns(t, r);
    if (t.tag !== 0 && s === 2) {
      var u = il(t);
      u !== 0 && (r = u, s = Cu(t, u));
    }
    if (s === 1) throw s = ei, ar(t, 0), On(t, r), pt(t, Fe()), s;
    if (s === 6) throw Error(o(345));
    return t.finishedWork = t.current.alternate, t.finishedLanes = r, lr(t, ft, pn), pt(t, Fe()), null;
  }
  function Eu(t, r) {
    var s = me;
    me |= 1;
    try {
      return t(r);
    } finally {
      me = s, me === 0 && (Qr = Fe() + 500, ss && Mn());
    }
  }
  function sr(t) {
    jn !== null && jn.tag === 0 && (me & 6) === 0 && Xr();
    var r = me;
    me |= 1;
    var s = Pt.transition, u = xe;
    try {
      if (Pt.transition = null, xe = 1, t) return t();
    } finally {
      xe = u, Pt.transition = s, me = r, (me & 6) === 0 && Mn();
    }
  }
  function bu() {
    wt = Yr.current, be(Yr);
  }
  function ar(t, r) {
    t.finishedWork = null, t.finishedLanes = 0;
    var s = t.timeoutHandle;
    if (s !== -1 && (t.timeoutHandle = -1, qw(s)), Le !== null) for (s = Le.return; s !== null; ) {
      var u = s;
      switch (Ll(u), u.tag) {
        case 1:
          u = u.type.childContextTypes, u != null && os();
          break;
        case 3:
          Wr(), be(ut), be(qe), Zl();
          break;
        case 5:
          Ql(u);
          break;
        case 4:
          Wr();
          break;
        case 13:
          be(De);
          break;
        case 19:
          be(De);
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
    if (We = t, Le = t = Ln(t.current, null), Xe = wt = r, Ue = 0, ei = null, _u = Ps = ir = 0, ft = ti = null, nr !== null) {
      for (r = 0; r < nr.length; r++) if (s = nr[r], u = s.interleaved, u !== null) {
        s.interleaved = null;
        var h = u.next, g = s.pending;
        if (g !== null) {
          var _ = g.next;
          g.next = h, u.next = _;
        }
        s.pending = u;
      }
      nr = null;
    }
    return t;
  }
  function $m(t, r) {
    do {
      var s = Le;
      try {
        if ($l(), ys.current = ws, gs) {
          for (var u = Ne.memoizedState; u !== null; ) {
            var h = u.queue;
            h !== null && (h.pending = null), u = u.next;
          }
          gs = !1;
        }
        if (or = 0, He = ze = Ne = null, Yo = !1, Qo = 0, xu.current = null, s === null || s.return === null) {
          Ue = 1, ei = r, Le = null;
          break;
        }
        e: {
          var g = t, _ = s.return, P = s, b = r;
          if (r = Xe, P.flags |= 32768, b !== null && typeof b == "object" && typeof b.then == "function") {
            var F = b, z = P, $ = z.tag;
            if ((z.mode & 1) === 0 && ($ === 0 || $ === 11 || $ === 15)) {
              var B = z.alternate;
              B ? (z.updateQueue = B.updateQueue, z.memoizedState = B.memoizedState, z.lanes = B.lanes) : (z.updateQueue = null, z.memoizedState = null);
            }
            var J = mm(_);
            if (J !== null) {
              J.flags &= -257, hm(J, _, P, g, r), J.mode & 1 && pm(g, F, r), r = J, b = F;
              var te = r.updateQueue;
              if (te === null) {
                var re = /* @__PURE__ */ new Set();
                re.add(b), r.updateQueue = re;
              } else te.add(b);
              break e;
            } else {
              if ((r & 1) === 0) {
                pm(g, F, r), Mu();
                break e;
              }
              b = Error(o(426));
            }
          } else if (Re && P.mode & 1) {
            var Oe = mm(_);
            if (Oe !== null) {
              (Oe.flags & 65536) === 0 && (Oe.flags |= 256), hm(Oe, _, P, g, r), zl(Gr(b, P));
              break e;
            }
          }
          g = b = Gr(b, P), Ue !== 4 && (Ue = 2), ti === null ? ti = [g] : ti.push(g), g = _;
          do {
            switch (g.tag) {
              case 3:
                g.flags |= 65536, r &= -r, g.lanes |= r;
                var I = dm(g, b, r);
                Lp(g, I);
                break e;
              case 1:
                P = b;
                var R = g.type, j = g.stateNode;
                if ((g.flags & 128) === 0 && (typeof R.getDerivedStateFromError == "function" || j !== null && typeof j.componentDidCatch == "function" && (In === null || !In.has(j)))) {
                  g.flags |= 65536, r &= -r, g.lanes |= r;
                  var H = fm(g, P, r);
                  Lp(g, H);
                  break e;
                }
            }
            g = g.return;
          } while (g !== null);
        }
        Gm(s);
      } catch (oe) {
        r = oe, Le === s && s !== null && (Le = s = s.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Hm() {
    var t = Cs.current;
    return Cs.current = ws, t === null ? ws : t;
  }
  function Mu() {
    (Ue === 0 || Ue === 3 || Ue === 2) && (Ue = 4), We === null || (ir & 268435455) === 0 && (Ps & 268435455) === 0 || On(We, Xe);
  }
  function Ns(t, r) {
    var s = me;
    me |= 2;
    var u = Hm();
    (We !== t || Xe !== r) && (pn = null, ar(t, r));
    do
      try {
        kx();
        break;
      } catch (h) {
        $m(t, h);
      }
    while (!0);
    if ($l(), me = s, Cs.current = u, Le !== null) throw Error(o(261));
    return We = null, Xe = 0, Ue;
  }
  function kx() {
    for (; Le !== null; ) Wm(Le);
  }
  function Ax() {
    for (; Le !== null && !XS(); ) Wm(Le);
  }
  function Wm(t) {
    var r = Qm(t.alternate, t, wt);
    t.memoizedProps = t.pendingProps, r === null ? Gm(t) : Le = r, xu.current = null;
  }
  function Gm(t) {
    var r = t;
    do {
      var s = r.alternate;
      if (t = r.return, (r.flags & 32768) === 0) {
        if (s = gx(s, r, wt), s !== null) {
          Le = s;
          return;
        }
      } else {
        if (s = vx(s, r), s !== null) {
          s.flags &= 32767, Le = s;
          return;
        }
        if (t !== null) t.flags |= 32768, t.subtreeFlags = 0, t.deletions = null;
        else {
          Ue = 6, Le = null;
          return;
        }
      }
      if (r = r.sibling, r !== null) {
        Le = r;
        return;
      }
      Le = r = t;
    } while (r !== null);
    Ue === 0 && (Ue = 5);
  }
  function lr(t, r, s) {
    var u = xe, h = Pt.transition;
    try {
      Pt.transition = null, xe = 1, Cx(t, r, s, u);
    } finally {
      Pt.transition = h, xe = u;
    }
    return null;
  }
  function Cx(t, r, s, u) {
    do
      Xr();
    while (jn !== null);
    if ((me & 6) !== 0) throw Error(o(327));
    s = t.finishedWork;
    var h = t.finishedLanes;
    if (s === null) return null;
    if (t.finishedWork = null, t.finishedLanes = 0, s === t.current) throw Error(o(177));
    t.callbackNode = null, t.callbackPriority = 0;
    var g = s.lanes | s.childLanes;
    if (sw(t, g), t === We && (Le = We = null, Xe = 0), (s.subtreeFlags & 2064) === 0 && (s.flags & 2064) === 0 || bs || (bs = !0, Xm(Oi, function() {
      return Xr(), null;
    })), g = (s.flags & 15990) !== 0, (s.subtreeFlags & 15990) !== 0 || g) {
      g = Pt.transition, Pt.transition = null;
      var _ = xe;
      xe = 1;
      var P = me;
      me |= 4, xu.current = null, wx(t, s), Fm(s, t), Gw(Ml), Hi = !!bl, Ml = bl = null, t.current = s, xx(s), ZS(), me = P, xe = _, Pt.transition = g;
    } else t.current = s;
    if (bs && (bs = !1, jn = t, Ms = h), g = t.pendingLanes, g === 0 && (In = null), ew(s.stateNode), pt(t, Fe()), r !== null) for (u = t.onRecoverableError, s = 0; s < r.length; s++) h = r[s], u(h.value, { componentStack: h.stack, digest: h.digest });
    if (Es) throw Es = !1, t = ku, ku = null, t;
    return (Ms & 1) !== 0 && t.tag !== 0 && Xr(), g = t.pendingLanes, (g & 1) !== 0 ? t === Au ? ni++ : (ni = 0, Au = t) : ni = 0, Mn(), null;
  }
  function Xr() {
    if (jn !== null) {
      var t = If(Ms), r = Pt.transition, s = xe;
      try {
        if (Pt.transition = null, xe = 16 > t ? 16 : t, jn === null) var u = !1;
        else {
          if (t = jn, jn = null, Ms = 0, (me & 6) !== 0) throw Error(o(331));
          var h = me;
          for (me |= 4, ee = t.current; ee !== null; ) {
            var g = ee, _ = g.child;
            if ((ee.flags & 16) !== 0) {
              var P = g.deletions;
              if (P !== null) {
                for (var b = 0; b < P.length; b++) {
                  var F = P[b];
                  for (ee = F; ee !== null; ) {
                    var z = ee;
                    switch (z.tag) {
                      case 0:
                      case 11:
                      case 15:
                        qo(8, z, g);
                    }
                    var $ = z.child;
                    if ($ !== null) $.return = z, ee = $;
                    else for (; ee !== null; ) {
                      z = ee;
                      var B = z.sibling, J = z.return;
                      if (Rm(z), z === F) {
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
                var te = g.alternate;
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
                ee = g;
              }
            }
            if ((g.subtreeFlags & 2064) !== 0 && _ !== null) _.return = g, ee = _;
            else e: for (; ee !== null; ) {
              if (g = ee, (g.flags & 2048) !== 0) switch (g.tag) {
                case 0:
                case 11:
                case 15:
                  qo(9, g, g.return);
              }
              var I = g.sibling;
              if (I !== null) {
                I.return = g.return, ee = I;
                break e;
              }
              ee = g.return;
            }
          }
          var R = t.current;
          for (ee = R; ee !== null; ) {
            _ = ee;
            var j = _.child;
            if ((_.subtreeFlags & 2064) !== 0 && j !== null) j.return = _, ee = j;
            else e: for (_ = R; ee !== null; ) {
              if (P = ee, (P.flags & 2048) !== 0) try {
                switch (P.tag) {
                  case 0:
                  case 11:
                  case 15:
                    As(9, P);
                }
              } catch (oe) {
                je(P, P.return, oe);
              }
              if (P === _) {
                ee = null;
                break e;
              }
              var H = P.sibling;
              if (H !== null) {
                H.return = P.return, ee = H;
                break e;
              }
              ee = P.return;
            }
          }
          if (me = h, Mn(), Wt && typeof Wt.onPostCommitFiberRoot == "function") try {
            Wt.onPostCommitFiberRoot(Li, t);
          } catch {
          }
          u = !0;
        }
        return u;
      } finally {
        xe = s, Pt.transition = r;
      }
    }
    return !1;
  }
  function Km(t, r, s) {
    r = Gr(s, r), r = dm(t, r, 1), t = Dn(t, r, 1), r = ot(), t !== null && (Co(t, 1, r), pt(t, r));
  }
  function je(t, r, s) {
    if (t.tag === 3) Km(t, t, s);
    else for (; r !== null; ) {
      if (r.tag === 3) {
        Km(r, t, s);
        break;
      } else if (r.tag === 1) {
        var u = r.stateNode;
        if (typeof r.type.getDerivedStateFromError == "function" || typeof u.componentDidCatch == "function" && (In === null || !In.has(u))) {
          t = Gr(s, t), t = fm(r, t, 1), r = Dn(r, t, 1), t = ot(), r !== null && (Co(r, 1, t), pt(r, t));
          break;
        }
      }
      r = r.return;
    }
  }
  function Px(t, r, s) {
    var u = t.pingCache;
    u !== null && u.delete(r), r = ot(), t.pingedLanes |= t.suspendedLanes & s, We === t && (Xe & s) === s && (Ue === 4 || Ue === 3 && (Xe & 130023424) === Xe && 500 > Fe() - Tu ? ar(t, 0) : _u |= s), pt(t, r);
  }
  function Ym(t, r) {
    r === 0 && ((t.mode & 1) === 0 ? r = 1 : (r = Bi, Bi <<= 1, (Bi & 130023424) === 0 && (Bi = 4194304)));
    var s = ot();
    t = cn(t, r), t !== null && (Co(t, r, s), pt(t, s));
  }
  function Ex(t) {
    var r = t.memoizedState, s = 0;
    r !== null && (s = r.retryLane), Ym(t, s);
  }
  function bx(t, r) {
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
    u !== null && u.delete(r), Ym(t, s);
  }
  var Qm;
  Qm = function(t, r, s) {
    if (t !== null) if (t.memoizedProps !== r.pendingProps || ut.current) dt = !0;
    else {
      if ((t.lanes & s) === 0 && (r.flags & 128) === 0) return dt = !1, yx(t, r, s);
      dt = (t.flags & 131072) !== 0;
    }
    else dt = !1, Re && (r.flags & 1048576) !== 0 && Ep(r, ls, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var u = r.type;
        Ts(t, r), t = r.pendingProps;
        var h = Lr(r, qe.current);
        Hr(r, s), h = eu(null, r, u, t, h, s);
        var g = tu();
        return r.flags |= 1, typeof h == "object" && h !== null && typeof h.render == "function" && h.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, ct(u) ? (g = !0, is(r)) : g = !1, r.memoizedState = h.state !== null && h.state !== void 0 ? h.state : null, Kl(r), h.updater = xs, r.stateNode = h, h._reactInternals = r, au(r, u, t, s), r = du(null, r, u, !0, g, s)) : (r.tag = 0, Re && g && Ol(r), rt(null, r, h, s), r = r.child), r;
      case 16:
        u = r.elementType;
        e: {
          switch (Ts(t, r), t = r.pendingProps, h = u._init, u = h(u._payload), r.type = u, h = r.tag = Rx(u), t = Ft(u, t), h) {
            case 0:
              r = cu(null, r, u, t, s);
              break e;
            case 1:
              r = xm(null, r, u, t, s);
              break e;
            case 11:
              r = ym(null, r, u, t, s);
              break e;
            case 14:
              r = gm(null, r, u, Ft(u.type, t), s);
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
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : Ft(u, h), cu(t, r, u, h, s);
      case 1:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : Ft(u, h), xm(t, r, u, h, s);
      case 3:
        e: {
          if (_m(r), t === null) throw Error(o(387));
          u = r.pendingProps, g = r.memoizedState, h = g.element, Op(t, r), ms(r, u, null, s);
          var _ = r.memoizedState;
          if (u = _.element, g.isDehydrated) if (g = { element: u, isDehydrated: !1, cache: _.cache, pendingSuspenseBoundaries: _.pendingSuspenseBoundaries, transitions: _.transitions }, r.updateQueue.baseState = g, r.memoizedState = g, r.flags & 256) {
            h = Gr(Error(o(423)), r), r = Tm(t, r, u, s, h);
            break e;
          } else if (u !== h) {
            h = Gr(Error(o(424)), r), r = Tm(t, r, u, s, h);
            break e;
          } else for (St = Pn(r.stateNode.containerInfo.firstChild), vt = r, Re = !0, jt = null, s = jp(r, null, u, s), r.child = s; s; ) s.flags = s.flags & -3 | 4096, s = s.sibling;
          else {
            if (zr(), u === h) {
              r = fn(t, r, s);
              break e;
            }
            rt(t, r, u, s);
          }
          r = r.child;
        }
        return r;
      case 5:
        return Bp(r), t === null && Bl(r), u = r.type, h = r.pendingProps, g = t !== null ? t.memoizedProps : null, _ = h.children, Rl(u, h) ? _ = null : g !== null && Rl(u, g) && (r.flags |= 32), wm(t, r), rt(t, r, _, s), r.child;
      case 6:
        return t === null && Bl(r), null;
      case 13:
        return km(t, r, s);
      case 4:
        return Yl(r, r.stateNode.containerInfo), u = r.pendingProps, t === null ? r.child = Ur(r, null, u, s) : rt(t, r, u, s), r.child;
      case 11:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : Ft(u, h), ym(t, r, u, h, s);
      case 7:
        return rt(t, r, r.pendingProps, s), r.child;
      case 8:
        return rt(t, r, r.pendingProps.children, s), r.child;
      case 12:
        return rt(t, r, r.pendingProps.children, s), r.child;
      case 10:
        e: {
          if (u = r.type._context, h = r.pendingProps, g = r.memoizedProps, _ = h.value, Pe(ds, u._currentValue), u._currentValue = _, g !== null) if (It(g.value, _)) {
            if (g.children === h.children && !ut.current) {
              r = fn(t, r, s);
              break e;
            }
          } else for (g = r.child, g !== null && (g.return = r); g !== null; ) {
            var P = g.dependencies;
            if (P !== null) {
              _ = g.child;
              for (var b = P.firstContext; b !== null; ) {
                if (b.context === u) {
                  if (g.tag === 1) {
                    b = dn(-1, s & -s), b.tag = 2;
                    var F = g.updateQueue;
                    if (F !== null) {
                      F = F.shared;
                      var z = F.pending;
                      z === null ? b.next = b : (b.next = z.next, z.next = b), F.pending = b;
                    }
                  }
                  g.lanes |= s, b = g.alternate, b !== null && (b.lanes |= s), Wl(
                    g.return,
                    s,
                    r
                  ), P.lanes |= s;
                  break;
                }
                b = b.next;
              }
            } else if (g.tag === 10) _ = g.type === r.type ? null : g.child;
            else if (g.tag === 18) {
              if (_ = g.return, _ === null) throw Error(o(341));
              _.lanes |= s, P = _.alternate, P !== null && (P.lanes |= s), Wl(_, s, r), _ = g.sibling;
            } else _ = g.child;
            if (_ !== null) _.return = g;
            else for (_ = g; _ !== null; ) {
              if (_ === r) {
                _ = null;
                break;
              }
              if (g = _.sibling, g !== null) {
                g.return = _.return, _ = g;
                break;
              }
              _ = _.return;
            }
            g = _;
          }
          rt(t, r, h.children, s), r = r.child;
        }
        return r;
      case 9:
        return h = r.type, u = r.pendingProps.children, Hr(r, s), h = At(h), u = u(h), r.flags |= 1, rt(t, r, u, s), r.child;
      case 14:
        return u = r.type, h = Ft(u, r.pendingProps), h = Ft(u.type, h), gm(t, r, u, h, s);
      case 15:
        return vm(t, r, r.type, r.pendingProps, s);
      case 17:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : Ft(u, h), Ts(t, r), r.tag = 1, ct(u) ? (t = !0, is(r)) : t = !1, Hr(r, s), um(r, u, h), au(r, u, h, s), du(null, r, u, !0, t, s);
      case 19:
        return Cm(t, r, s);
      case 22:
        return Sm(t, r, s);
    }
    throw Error(o(156, r.tag));
  };
  function Xm(t, r) {
    return bf(t, r);
  }
  function Mx(t, r, s, u) {
    this.tag = t, this.key = s, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = u, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Et(t, r, s, u) {
    return new Mx(t, r, s, u);
  }
  function Ru(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function Rx(t) {
    if (typeof t == "function") return Ru(t) ? 1 : 0;
    if (t != null) {
      if (t = t.$$typeof, t === q) return 11;
      if (t === Te) return 14;
    }
    return 2;
  }
  function Ln(t, r) {
    var s = t.alternate;
    return s === null ? (s = Et(t.tag, r, t.key, t.mode), s.elementType = t.elementType, s.type = t.type, s.stateNode = t.stateNode, s.alternate = t, t.alternate = s) : (s.pendingProps = r, s.type = t.type, s.flags = 0, s.subtreeFlags = 0, s.deletions = null), s.flags = t.flags & 14680064, s.childLanes = t.childLanes, s.lanes = t.lanes, s.child = t.child, s.memoizedProps = t.memoizedProps, s.memoizedState = t.memoizedState, s.updateQueue = t.updateQueue, r = t.dependencies, s.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, s.sibling = t.sibling, s.index = t.index, s.ref = t.ref, s;
  }
  function Is(t, r, s, u, h, g) {
    var _ = 2;
    if (u = t, typeof t == "function") Ru(t) && (_ = 1);
    else if (typeof t == "string") _ = 5;
    else e: switch (t) {
      case G:
        return ur(s.children, h, g, r);
      case K:
        _ = 8, h |= 8;
        break;
      case L:
        return t = Et(12, s, r, h | 2), t.elementType = L, t.lanes = g, t;
      case de:
        return t = Et(13, s, r, h), t.elementType = de, t.lanes = g, t;
      case ue:
        return t = Et(19, s, r, h), t.elementType = ue, t.lanes = g, t;
      case Se:
        return js(s, h, g, r);
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
          case Te:
            _ = 14;
            break e;
          case ve:
            _ = 16, u = null;
            break e;
        }
        throw Error(o(130, t == null ? t : typeof t, ""));
    }
    return r = Et(_, s, r, h), r.elementType = t, r.type = u, r.lanes = g, r;
  }
  function ur(t, r, s, u) {
    return t = Et(7, t, u, r), t.lanes = s, t;
  }
  function js(t, r, s, u) {
    return t = Et(22, t, u, r), t.elementType = Se, t.lanes = s, t.stateNode = { isHidden: !1 }, t;
  }
  function Du(t, r, s) {
    return t = Et(6, t, null, r), t.lanes = s, t;
  }
  function Nu(t, r, s) {
    return r = Et(4, t.children !== null ? t.children : [], t.key, r), r.lanes = s, r.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, r;
  }
  function Dx(t, r, s, u, h) {
    this.tag = r, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = sl(0), this.expirationTimes = sl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = sl(0), this.identifierPrefix = u, this.onRecoverableError = h, this.mutableSourceEagerHydrationData = null;
  }
  function Iu(t, r, s, u, h, g, _, P, b) {
    return t = new Dx(t, r, s, P, b), r === 1 ? (r = 1, g === !0 && (r |= 8)) : r = 0, g = Et(3, null, null, r), t.current = g, g.stateNode = t, g.memoizedState = { element: u, isDehydrated: s, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Kl(g), t;
  }
  function Nx(t, r, s) {
    var u = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: W, key: u == null ? null : "" + u, children: t, containerInfo: r, implementation: s };
  }
  function Zm(t) {
    if (!t) return bn;
    t = t._reactInternals;
    e: {
      if (Zn(t) !== t || t.tag !== 1) throw Error(o(170));
      var r = t;
      do {
        switch (r.tag) {
          case 3:
            r = r.stateNode.context;
            break e;
          case 1:
            if (ct(r.type)) {
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
      if (ct(s)) return Ap(t, s, r);
    }
    return r;
  }
  function Jm(t, r, s, u, h, g, _, P, b) {
    return t = Iu(s, u, !0, t, h, g, _, P, b), t.context = Zm(null), s = t.current, u = ot(), h = Fn(s), g = dn(u, h), g.callback = r ?? null, Dn(s, g, h), t.current.lanes = h, Co(t, h, u), pt(t, u), t;
  }
  function Fs(t, r, s, u) {
    var h = r.current, g = ot(), _ = Fn(h);
    return s = Zm(s), r.context === null ? r.context = s : r.pendingContext = s, r = dn(g, _), r.payload = { element: t }, u = u === void 0 ? null : u, u !== null && (r.callback = u), t = Dn(h, r, _), t !== null && (Vt(t, h, _, g), ps(t, h, _)), _;
  }
  function Os(t) {
    if (t = t.current, !t.child) return null;
    switch (t.child.tag) {
      case 5:
        return t.child.stateNode;
      default:
        return t.child.stateNode;
    }
  }
  function qm(t, r) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var s = t.retryLane;
      t.retryLane = s !== 0 && s < r ? s : r;
    }
  }
  function ju(t, r) {
    qm(t, r), (t = t.alternate) && qm(t, r);
  }
  function Ix() {
    return null;
  }
  var eh = typeof reportError == "function" ? reportError : function(t) {
    console.error(t);
  };
  function Fu(t) {
    this._internalRoot = t;
  }
  Ls.prototype.render = Fu.prototype.render = function(t) {
    var r = this._internalRoot;
    if (r === null) throw Error(o(409));
    Fs(t, r, null, null);
  }, Ls.prototype.unmount = Fu.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var r = t.containerInfo;
      sr(function() {
        Fs(null, t, null, null);
      }), r[sn] = null;
    }
  };
  function Ls(t) {
    this._internalRoot = t;
  }
  Ls.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var r = Of();
      t = { blockedOn: null, target: t, priority: r };
      for (var s = 0; s < kn.length && r !== 0 && r < kn[s].priority; s++) ;
      kn.splice(s, 0, t), s === 0 && Bf(t);
    }
  };
  function Ou(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function Vs(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11 && (t.nodeType !== 8 || t.nodeValue !== " react-mount-point-unstable "));
  }
  function th() {
  }
  function jx(t, r, s, u, h) {
    if (h) {
      if (typeof u == "function") {
        var g = u;
        u = function() {
          var F = Os(_);
          g.call(F);
        };
      }
      var _ = Jm(r, u, t, 0, null, !1, !1, "", th);
      return t._reactRootContainer = _, t[sn] = _.current, Bo(t.nodeType === 8 ? t.parentNode : t), sr(), _;
    }
    for (; h = t.lastChild; ) t.removeChild(h);
    if (typeof u == "function") {
      var P = u;
      u = function() {
        var F = Os(b);
        P.call(F);
      };
    }
    var b = Iu(t, 0, !1, null, null, !1, !1, "", th);
    return t._reactRootContainer = b, t[sn] = b.current, Bo(t.nodeType === 8 ? t.parentNode : t), sr(function() {
      Fs(r, b, s, u);
    }), b;
  }
  function Bs(t, r, s, u, h) {
    var g = s._reactRootContainer;
    if (g) {
      var _ = g;
      if (typeof h == "function") {
        var P = h;
        h = function() {
          var b = Os(_);
          P.call(b);
        };
      }
      Fs(r, _, t, h);
    } else _ = jx(s, r, t, h, u);
    return Os(_);
  }
  jf = function(t) {
    switch (t.tag) {
      case 3:
        var r = t.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var s = Ao(r.pendingLanes);
          s !== 0 && (al(r, s | 1), pt(r, Fe()), (me & 6) === 0 && (Qr = Fe() + 500, Mn()));
        }
        break;
      case 13:
        sr(function() {
          var u = cn(t, 1);
          if (u !== null) {
            var h = ot();
            Vt(u, t, 1, h);
          }
        }), ju(t, 1);
    }
  }, ll = function(t) {
    if (t.tag === 13) {
      var r = cn(t, 134217728);
      if (r !== null) {
        var s = ot();
        Vt(r, t, 134217728, s);
      }
      ju(t, 134217728);
    }
  }, Ff = function(t) {
    if (t.tag === 13) {
      var r = Fn(t), s = cn(t, r);
      if (s !== null) {
        var u = ot();
        Vt(s, t, r, u);
      }
      ju(t, r);
    }
  }, Of = function() {
    return xe;
  }, Lf = function(t, r) {
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
              var h = rs(u);
              if (!h) throw Error(o(90));
              lf(u), Ga(u, h);
            }
          }
        }
        break;
      case "textarea":
        pf(t, s);
        break;
      case "select":
        r = s.value, r != null && Cr(t, !!s.multiple, r, !1);
    }
  }, _f = Eu, Tf = sr;
  var Fx = { usingClientEntryPoint: !1, Events: [$o, Fr, rs, wf, xf, Eu] }, ri = { findFiberByHostInstance: Jn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Ox = { bundleType: ri.bundleType, version: ri.version, rendererPackageName: ri.rendererPackageName, rendererConfig: ri.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: N.ReactCurrentDispatcher, findHostInstanceByFiber: function(t) {
    return t = Pf(t), t === null ? null : t.stateNode;
  }, findFiberByHostInstance: ri.findFiberByHostInstance || Ix, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var zs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!zs.isDisabled && zs.supportsFiber) try {
      Li = zs.inject(Ox), Wt = zs;
    } catch {
    }
  }
  return mt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Fx, mt.createPortal = function(t, r) {
    var s = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Ou(r)) throw Error(o(200));
    return Nx(t, r, null, s);
  }, mt.createRoot = function(t, r) {
    if (!Ou(t)) throw Error(o(299));
    var s = !1, u = "", h = eh;
    return r != null && (r.unstable_strictMode === !0 && (s = !0), r.identifierPrefix !== void 0 && (u = r.identifierPrefix), r.onRecoverableError !== void 0 && (h = r.onRecoverableError)), r = Iu(t, 1, !1, null, null, s, !1, u, h), t[sn] = r.current, Bo(t.nodeType === 8 ? t.parentNode : t), new Fu(r);
  }, mt.findDOMNode = function(t) {
    if (t == null) return null;
    if (t.nodeType === 1) return t;
    var r = t._reactInternals;
    if (r === void 0)
      throw typeof t.render == "function" ? Error(o(188)) : (t = Object.keys(t).join(","), Error(o(268, t)));
    return t = Pf(r), t = t === null ? null : t.stateNode, t;
  }, mt.flushSync = function(t) {
    return sr(t);
  }, mt.hydrate = function(t, r, s) {
    if (!Vs(r)) throw Error(o(200));
    return Bs(null, t, r, !0, s);
  }, mt.hydrateRoot = function(t, r, s) {
    if (!Ou(t)) throw Error(o(405));
    var u = s != null && s.hydratedSources || null, h = !1, g = "", _ = eh;
    if (s != null && (s.unstable_strictMode === !0 && (h = !0), s.identifierPrefix !== void 0 && (g = s.identifierPrefix), s.onRecoverableError !== void 0 && (_ = s.onRecoverableError)), r = Jm(r, null, t, 1, s ?? null, h, !1, g, _), t[sn] = r.current, Bo(t), u) for (t = 0; t < u.length; t++) s = u[t], h = s._getVersion, h = h(s._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [s, h] : r.mutableSourceEagerHydrationData.push(
      s,
      h
    );
    return new Ls(r);
  }, mt.render = function(t, r, s) {
    if (!Vs(r)) throw Error(o(200));
    return Bs(null, t, r, !1, s);
  }, mt.unmountComponentAtNode = function(t) {
    if (!Vs(t)) throw Error(o(40));
    return t._reactRootContainer ? (sr(function() {
      Bs(null, null, t, !1, function() {
        t._reactRootContainer = null, t[sn] = null;
      });
    }), !0) : !1;
  }, mt.unstable_batchedUpdates = Eu, mt.unstable_renderSubtreeIntoContainer = function(t, r, s, u) {
    if (!Vs(s)) throw Error(o(200));
    if (t == null || t._reactInternals === void 0) throw Error(o(38));
    return Bs(t, r, s, !1, u);
  }, mt.version = "18.3.1-next-f1338f8080-20240426", mt;
}
var ch;
function vg() {
  if (ch) return Vu.exports;
  ch = 1;
  function e() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (n) {
        console.error(n);
      }
  }
  return e(), Vu.exports = Yx(), Vu.exports;
}
var dh;
function Qx() {
  if (dh) return $s;
  dh = 1;
  var e = vg();
  return $s.createRoot = e.createRoot, $s.hydrateRoot = e.hydrateRoot, $s;
}
var Xx = Qx(), Uu = { exports: {} }, ii = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fh;
function Zx() {
  if (fh) return ii;
  fh = 1;
  var e = fd(), n = Symbol.for("react.element"), o = Symbol.for("react.fragment"), i = Object.prototype.hasOwnProperty, a = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function d(p, m, y) {
    var v, l = {}, f = null, S = null;
    y !== void 0 && (f = "" + y), m.key !== void 0 && (f = "" + m.key), m.ref !== void 0 && (S = m.ref);
    for (v in m) i.call(m, v) && !c.hasOwnProperty(v) && (l[v] = m[v]);
    if (p && p.defaultProps) for (v in m = p.defaultProps, m) l[v] === void 0 && (l[v] = m[v]);
    return { $$typeof: n, type: p, key: f, ref: S, props: l, _owner: a.current };
  }
  return ii.Fragment = o, ii.jsx = d, ii.jsxs = d, ii;
}
var ph;
function Jx() {
  return ph || (ph = 1, Uu.exports = Zx()), Uu.exports;
}
var x = Jx();
const mh = (e) => Symbol.iterator in e, hh = (e) => (
  // HACK: avoid checking entries type
  "entries" in e
), yh = (e, n) => {
  const o = e instanceof Map ? e : new Map(e.entries()), i = n instanceof Map ? n : new Map(n.entries());
  if (o.size !== i.size)
    return !1;
  for (const [a, c] of o)
    if (!i.has(a) || !Object.is(c, i.get(a)))
      return !1;
  return !0;
}, qx = (e, n) => {
  const o = e[Symbol.iterator](), i = n[Symbol.iterator]();
  let a = o.next(), c = i.next();
  for (; !a.done && !c.done; ) {
    if (!Object.is(a.value, c.value))
      return !1;
    a = o.next(), c = i.next();
  }
  return !!a.done && !!c.done;
};
function e_(e, n) {
  return Object.is(e, n) ? !0 : typeof e != "object" || e === null || typeof n != "object" || n === null || Object.getPrototypeOf(e) !== Object.getPrototypeOf(n) ? !1 : mh(e) && mh(n) ? hh(e) && hh(n) ? yh(e, n) : qx(e, n) : yh(
    { entries: () => Object.entries(e) },
    { entries: () => Object.entries(n) }
  );
}
function t_(e) {
  const n = gn.useRef(void 0);
  return (o) => {
    const i = e(o);
    return e_(n.current, i) ? n.current : n.current = i;
  };
}
const pd = C.createContext({});
function md(e) {
  const n = C.useRef(null);
  return n.current === null && (n.current = e()), n.current;
}
const n_ = typeof window < "u", Sg = n_ ? C.useLayoutEffect : C.useEffect, Ia = /* @__PURE__ */ C.createContext(null);
function hd(e, n) {
  e.indexOf(n) === -1 && e.push(n);
}
function va(e, n) {
  const o = e.indexOf(n);
  o > -1 && e.splice(o, 1);
}
const rn = (e, n, o) => o > n ? n : o < e ? e : o;
function gh(e, n) {
  return n ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${n}` : e;
}
let ki = () => {
}, Tr = () => {
};
var fg;
typeof process < "u" && ((fg = process.env) == null ? void 0 : fg.NODE_ENV) !== "production" && (ki = (e, n, o) => {
  !e && typeof console < "u" && console.warn(gh(n, o));
}, Tr = (e, n, o) => {
  if (!e)
    throw new Error(gh(n, o));
});
const Yn = {}, wg = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), xg = (e) => typeof e == "object" && e !== null, _g = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function Tg(e) {
  let n;
  return () => (n === void 0 && (n = e()), n);
}
const Dt = /* @__NO_SIDE_EFFECTS__ */ (e) => e, Ai = (...e) => e.reduce((n, o) => (i) => o(n(i))), hi = /* @__NO_SIDE_EFFECTS__ */ (e, n, o) => {
  const i = n - e;
  return i ? (o - e) / i : 1;
};
class yd {
  constructor() {
    this.subscriptions = [];
  }
  add(n) {
    return hd(this.subscriptions, n), () => va(this.subscriptions, n);
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
const ht = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, Rt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, kg = /* @__NO_SIDE_EFFECTS__ */ (e, n) => n ? e * (1e3 / n) : 0, Ag = (e, n, o) => (((1 - 3 * o + 3 * n) * e + (3 * o - 6 * n)) * e + 3 * n) * e, r_ = 1e-7, o_ = 12;
function i_(e, n, o, i, a) {
  let c, d, p = 0;
  do
    d = n + (o - n) / 2, c = Ag(d, i, a) - e, c > 0 ? o = d : n = d;
  while (Math.abs(c) > r_ && ++p < o_);
  return d;
}
// @__NO_SIDE_EFFECTS__
function Ci(e, n, o, i) {
  if (e === n && o === i)
    return Dt;
  const a = (c) => i_(c, 0, 1, e, o);
  return (c) => c === 0 || c === 1 ? c : Ag(a(c), n, i);
}
const Cg = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => n <= 0.5 ? e(2 * n) / 2 : (2 - e(2 * (1 - n))) / 2, Pg = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => 1 - e(1 - n), Eg = /* @__PURE__ */ Ci(0.33, 1.53, 0.69, 0.99), gd = /* @__PURE__ */ Pg(Eg), bg = /* @__PURE__ */ Cg(gd), Mg = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * gd(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), vd = (e) => 1 - Math.sin(Math.acos(e)), Rg = /* @__PURE__ */ Pg(vd), Dg = /* @__PURE__ */ Cg(vd), s_ = /* @__PURE__ */ Ci(0.42, 0, 1, 1), a_ = /* @__PURE__ */ Ci(0, 0, 0.58, 1), Ng = /* @__PURE__ */ Ci(0.42, 0, 0.58, 1), l_ = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number", Ig = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", vh = {
  linear: Dt,
  easeIn: s_,
  easeInOut: Ng,
  easeOut: a_,
  circIn: vd,
  circInOut: Dg,
  circOut: Rg,
  backIn: gd,
  backInOut: bg,
  backOut: Eg,
  anticipate: Mg
}, u_ = (e) => typeof e == "string", Sh = (e) => {
  if (/* @__PURE__ */ Ig(e)) {
    Tr(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [n, o, i, a] = e;
    return /* @__PURE__ */ Ci(n, o, i, a);
  } else if (u_(e))
    return Tr(vh[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), vh[e];
  return e;
}, Hs = [
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
function c_(e, n) {
  let o = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = !1, c = !1;
  const d = /* @__PURE__ */ new WeakSet();
  let p = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function m(v) {
    d.has(v) && (y.schedule(v), e()), v(p);
  }
  const y = {
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
      o = i, i = l, o.forEach(m), o.clear(), a = !1, c && (c = !1, y.process(v));
    }
  };
  return y;
}
const d_ = 40;
function jg(e, n) {
  let o = !1, i = !0;
  const a = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, c = () => o = !0, d = Hs.reduce((M, N) => (M[N] = c_(c), M), {}), { setup: p, read: m, resolveKeyframes: y, preUpdate: v, update: l, preRender: f, render: S, postRender: w } = d, k = () => {
    const M = Yn.useManualTiming, N = M ? a.timestamp : performance.now();
    o = !1, M || (a.delta = i ? 1e3 / 60 : Math.max(Math.min(N - a.timestamp, d_), 1)), a.timestamp = N, a.isProcessing = !0, p.process(a), m.process(a), y.process(a), v.process(a), l.process(a), f.process(a), S.process(a), w.process(a), a.isProcessing = !1, o && n && (i = !1, e(k));
  }, A = () => {
    o = !0, i = !0, a.isProcessing || e(k);
  };
  return { schedule: Hs.reduce((M, N) => {
    const O = d[N];
    return M[N] = (W, G = !1, K = !1) => (o || A(), O.schedule(W, G, K)), M;
  }, {}), cancel: (M) => {
    for (let N = 0; N < Hs.length; N++)
      d[Hs[N]].cancel(M);
  }, state: a, steps: d };
}
const { schedule: Ae, cancel: Qn, state: Ze, steps: $u } = /* @__PURE__ */ jg(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Dt, !0);
let ia;
function f_() {
  ia = void 0;
}
const st = {
  now: () => (ia === void 0 && st.set(Ze.isProcessing || Yn.useManualTiming ? Ze.timestamp : performance.now()), ia),
  set: (e) => {
    ia = e, queueMicrotask(f_);
  }
}, Fg = (e) => (n) => typeof n == "string" && n.startsWith(e), Og = /* @__PURE__ */ Fg("--"), p_ = /* @__PURE__ */ Fg("var(--"), Sd = (e) => p_(e) ? m_.test(e.split("/*")[0].trim()) : !1, m_ = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function wh(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
const po = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, yi = {
  ...po,
  transform: (e) => rn(0, 1, e)
}, Ws = {
  ...po,
  default: 1
}, ui = (e) => Math.round(e * 1e5) / 1e5, wd = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function h_(e) {
  return e == null;
}
const y_ = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, xd = (e, n) => (o) => !!(typeof o == "string" && y_.test(o) && o.startsWith(e) || n && !h_(o) && Object.prototype.hasOwnProperty.call(o, n)), Lg = (e, n, o) => (i) => {
  if (typeof i != "string")
    return i;
  const [a, c, d, p] = i.match(wd);
  return {
    [e]: parseFloat(a),
    [n]: parseFloat(c),
    [o]: parseFloat(d),
    alpha: p !== void 0 ? parseFloat(p) : 1
  };
}, g_ = (e) => rn(0, 255, e), Hu = {
  ...po,
  transform: (e) => Math.round(g_(e))
}, hr = {
  test: /* @__PURE__ */ xd("rgb", "red"),
  parse: /* @__PURE__ */ Lg("red", "green", "blue"),
  transform: ({ red: e, green: n, blue: o, alpha: i = 1 }) => "rgba(" + Hu.transform(e) + ", " + Hu.transform(n) + ", " + Hu.transform(o) + ", " + ui(yi.transform(i)) + ")"
};
function v_(e) {
  let n = "", o = "", i = "", a = "";
  return e.length > 5 ? (n = e.substring(1, 3), o = e.substring(3, 5), i = e.substring(5, 7), a = e.substring(7, 9)) : (n = e.substring(1, 2), o = e.substring(2, 3), i = e.substring(3, 4), a = e.substring(4, 5), n += n, o += o, i += i, a += a), {
    red: parseInt(n, 16),
    green: parseInt(o, 16),
    blue: parseInt(i, 16),
    alpha: a ? parseInt(a, 16) / 255 : 1
  };
}
const yc = {
  test: /* @__PURE__ */ xd("#"),
  parse: v_,
  transform: hr.transform
}, Pi = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (n) => typeof n == "string" && n.endsWith(e) && n.split(" ").length === 1,
  parse: parseFloat,
  transform: (n) => `${n}${e}`
}), hn = /* @__PURE__ */ Pi("deg"), tn = /* @__PURE__ */ Pi("%"), ne = /* @__PURE__ */ Pi("px"), S_ = /* @__PURE__ */ Pi("vh"), w_ = /* @__PURE__ */ Pi("vw"), xh = {
  ...tn,
  parse: (e) => tn.parse(e) / 100,
  transform: (e) => tn.transform(e * 100)
}, ro = {
  test: /* @__PURE__ */ xd("hsl", "hue"),
  parse: /* @__PURE__ */ Lg("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: n, lightness: o, alpha: i = 1 }) => "hsla(" + Math.round(e) + ", " + tn.transform(ui(n)) + ", " + tn.transform(ui(o)) + ", " + ui(yi.transform(i)) + ")"
}, Ve = {
  test: (e) => hr.test(e) || yc.test(e) || ro.test(e),
  parse: (e) => hr.test(e) ? hr.parse(e) : ro.test(e) ? ro.parse(e) : yc.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? hr.transform(e) : ro.transform(e),
  getAnimatableNone: (e) => {
    const n = Ve.parse(e);
    return n.alpha = 0, Ve.transform(n);
  }
}, x_ = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function __(e) {
  var n, o;
  return isNaN(e) && typeof e == "string" && (((n = e.match(wd)) == null ? void 0 : n.length) || 0) + (((o = e.match(x_)) == null ? void 0 : o.length) || 0) > 0;
}
const Vg = "number", Bg = "color", T_ = "var", k_ = "var(", _h = "${}", A_ = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function uo(e) {
  const n = e.toString(), o = [], i = {
    color: [],
    number: [],
    var: []
  }, a = [];
  let c = 0;
  const p = n.replace(A_, (m) => (Ve.test(m) ? (i.color.push(c), a.push(Bg), o.push(Ve.parse(m))) : m.startsWith(k_) ? (i.var.push(c), a.push(T_), o.push(m)) : (i.number.push(c), a.push(Vg), o.push(parseFloat(m))), ++c, _h)).split(_h);
  return { values: o, split: p, indexes: i, types: a };
}
function C_(e) {
  return uo(e).values;
}
function zg({ split: e, types: n }) {
  const o = e.length;
  return (i) => {
    let a = "";
    for (let c = 0; c < o; c++)
      if (a += e[c], i[c] !== void 0) {
        const d = n[c];
        d === Vg ? a += ui(i[c]) : d === Bg ? a += Ve.transform(i[c]) : a += i[c];
      }
    return a;
  };
}
function P_(e) {
  return zg(uo(e));
}
const E_ = (e) => typeof e == "number" ? 0 : Ve.test(e) ? Ve.getAnimatableNone(e) : e, b_ = (e, n) => typeof e == "number" ? n != null && n.trim().endsWith("/") ? e : 0 : E_(e);
function M_(e) {
  const n = uo(e);
  return zg(n)(n.values.map((i, a) => b_(i, n.split[a])));
}
const $t = {
  test: __,
  parse: C_,
  createTransformer: P_,
  getAnimatableNone: M_
};
function Wu(e, n, o) {
  return o < 0 && (o += 1), o > 1 && (o -= 1), o < 1 / 6 ? e + (n - e) * 6 * o : o < 1 / 2 ? n : o < 2 / 3 ? e + (n - e) * (2 / 3 - o) * 6 : e;
}
function R_({ hue: e, saturation: n, lightness: o, alpha: i }) {
  e /= 360, n /= 100, o /= 100;
  let a = 0, c = 0, d = 0;
  if (!n)
    a = c = d = o;
  else {
    const p = o < 0.5 ? o * (1 + n) : o + n - o * n, m = 2 * o - p;
    a = Wu(m, p, e + 1 / 3), c = Wu(m, p, e), d = Wu(m, p, e - 1 / 3);
  }
  return {
    red: Math.round(a * 255),
    green: Math.round(c * 255),
    blue: Math.round(d * 255),
    alpha: i
  };
}
function Sa(e, n) {
  return (o) => o > 0 ? n : e;
}
const ke = (e, n, o) => e + (n - e) * o, Gu = (e, n, o) => {
  const i = e * e, a = o * (n * n - i) + i;
  return a < 0 ? 0 : Math.sqrt(a);
}, D_ = [yc, hr, ro], N_ = (e) => D_.find((n) => n.test(e));
function Th(e) {
  const n = N_(e);
  if (ki(!!n, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !n)
    return !1;
  let o = n.parse(e);
  return n === ro && (o = R_(o)), o;
}
const kh = (e, n) => {
  const o = Th(e), i = Th(n);
  if (!o || !i)
    return Sa(e, n);
  const a = { ...o };
  return (c) => (a.red = Gu(o.red, i.red, c), a.green = Gu(o.green, i.green, c), a.blue = Gu(o.blue, i.blue, c), a.alpha = ke(o.alpha, i.alpha, c), hr.transform(a));
}, gc = /* @__PURE__ */ new Set(["none", "hidden"]);
function I_(e, n) {
  return gc.has(e) ? (o) => o <= 0 ? e : n : (o) => o >= 1 ? n : e;
}
function j_(e, n) {
  return (o) => ke(e, n, o);
}
function _d(e) {
  return typeof e == "number" ? j_ : typeof e == "string" ? Sd(e) ? Sa : Ve.test(e) ? kh : L_ : Array.isArray(e) ? Ug : typeof e == "object" ? Ve.test(e) ? kh : F_ : Sa;
}
function Ug(e, n) {
  const o = [...e], i = o.length, a = e.map((c, d) => _d(c)(c, n[d]));
  return (c) => {
    for (let d = 0; d < i; d++)
      o[d] = a[d](c);
    return o;
  };
}
function F_(e, n) {
  const o = { ...e, ...n }, i = {};
  for (const a in o)
    e[a] !== void 0 && n[a] !== void 0 && (i[a] = _d(e[a])(e[a], n[a]));
  return (a) => {
    for (const c in i)
      o[c] = i[c](a);
    return o;
  };
}
function O_(e, n) {
  const o = [], i = { color: 0, var: 0, number: 0 };
  for (let a = 0; a < n.values.length; a++) {
    const c = n.types[a], d = e.indexes[c][i[c]], p = e.values[d] ?? 0;
    o[a] = p, i[c]++;
  }
  return o;
}
const L_ = (e, n) => {
  const o = $t.createTransformer(n), i = uo(e), a = uo(n);
  return i.indexes.var.length === a.indexes.var.length && i.indexes.color.length === a.indexes.color.length && i.indexes.number.length >= a.indexes.number.length ? gc.has(e) && !a.values.length || gc.has(n) && !i.values.length ? I_(e, n) : Ai(Ug(O_(i, a), a.values), o) : (ki(!0, `Complex values '${e}' and '${n}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), Sa(e, n));
};
function $g(e, n, o) {
  return typeof e == "number" && typeof n == "number" && typeof o == "number" ? ke(e, n, o) : _d(e)(e, n);
}
const V_ = (e) => {
  const n = ({ timestamp: o }) => e(o);
  return {
    start: (o = !0) => Ae.update(n, o),
    stop: () => Qn(n),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Ze.isProcessing ? Ze.timestamp : st.now()
  };
}, Hg = (e, n, o = 10) => {
  let i = "";
  const a = Math.max(Math.round(n / o), 2);
  for (let c = 0; c < a; c++)
    i += Math.round(e(c / (a - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${i.substring(0, i.length - 2)})`;
}, wa = 2e4;
function Td(e) {
  let n = 0;
  const o = 50;
  let i = e.next(n);
  for (; !i.done && n < wa; )
    n += o, i = e.next(n);
  return n >= wa ? 1 / 0 : n;
}
function B_(e, n = 100, o) {
  const i = o({ ...e, keyframes: [0, n] }), a = Math.min(Td(i), wa);
  return {
    type: "keyframes",
    ease: (c) => i.next(a * c).value / n,
    duration: /* @__PURE__ */ Rt(a)
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
const z_ = 12;
function U_(e, n, o) {
  let i = o;
  for (let a = 1; a < z_; a++)
    i = i - e(i) / n(i);
  return i;
}
const Ku = 1e-3;
function $_({ duration: e = Ie.duration, bounce: n = Ie.bounce, velocity: o = Ie.velocity, mass: i = Ie.mass }) {
  let a, c;
  ki(e <= /* @__PURE__ */ ht(Ie.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let d = 1 - n;
  d = rn(Ie.minDamping, Ie.maxDamping, d), e = rn(Ie.minDuration, Ie.maxDuration, /* @__PURE__ */ Rt(e)), d < 1 ? (a = (y) => {
    const v = y * d, l = v * e, f = v - o, S = vc(y, d), w = Math.exp(-l);
    return Ku - f / S * w;
  }, c = (y) => {
    const l = y * d * e, f = l * o + o, S = Math.pow(d, 2) * Math.pow(y, 2) * e, w = Math.exp(-l), k = vc(Math.pow(y, 2), d);
    return (-a(y) + Ku > 0 ? -1 : 1) * ((f - S) * w) / k;
  }) : (a = (y) => {
    const v = Math.exp(-y * e), l = (y - o) * e + 1;
    return -Ku + v * l;
  }, c = (y) => {
    const v = Math.exp(-y * e), l = (o - y) * (e * e);
    return v * l;
  });
  const p = 5 / e, m = U_(a, c, p);
  if (e = /* @__PURE__ */ ht(e), isNaN(m))
    return {
      stiffness: Ie.stiffness,
      damping: Ie.damping,
      duration: e
    };
  {
    const y = Math.pow(m, 2) * i;
    return {
      stiffness: y,
      damping: d * 2 * Math.sqrt(i * y),
      duration: e
    };
  }
}
const H_ = ["duration", "bounce"], W_ = ["stiffness", "damping", "mass"];
function Ah(e, n) {
  return n.some((o) => e[o] !== void 0);
}
function G_(e) {
  let n = {
    velocity: Ie.velocity,
    stiffness: Ie.stiffness,
    damping: Ie.damping,
    mass: Ie.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!Ah(e, W_) && Ah(e, H_))
    if (n.velocity = 0, e.visualDuration) {
      const o = e.visualDuration, i = 2 * Math.PI / (o * 1.2), a = i * i, c = 2 * rn(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(a);
      n = {
        ...n,
        mass: Ie.mass,
        stiffness: a,
        damping: c
      };
    } else {
      const o = $_({ ...e, velocity: 0 });
      n = {
        ...n,
        ...o,
        mass: Ie.mass
      }, n.isResolvedFromDuration = !0;
    }
  return n;
}
function xa(e = Ie.visualDuration, n = Ie.bounce) {
  const o = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: n
  } : e;
  let { restSpeed: i, restDelta: a } = o;
  const c = o.keyframes[0], d = o.keyframes[o.keyframes.length - 1], p = { done: !1, value: c }, { stiffness: m, damping: y, mass: v, duration: l, velocity: f, isResolvedFromDuration: S } = G_({
    ...o,
    velocity: -/* @__PURE__ */ Rt(o.velocity || 0)
  }), w = f || 0, k = y / (2 * Math.sqrt(m * v)), A = d - c, T = /* @__PURE__ */ Rt(Math.sqrt(m / v)), E = Math.abs(A) < 5;
  i || (i = E ? Ie.restSpeed.granular : Ie.restSpeed.default), a || (a = E ? Ie.restDelta.granular : Ie.restDelta.default);
  let M, N, O, W, G, K;
  if (k < 1)
    O = vc(T, k), W = (w + k * T * A) / O, M = (X) => {
      const ae = Math.exp(-k * T * X);
      return d - ae * (W * Math.sin(O * X) + A * Math.cos(O * X));
    }, G = k * T * W + A * O, K = k * T * A - W * O, N = (X) => Math.exp(-k * T * X) * (G * Math.sin(O * X) + K * Math.cos(O * X));
  else if (k === 1) {
    M = (ae) => d - Math.exp(-T * ae) * (A + (w + T * A) * ae);
    const X = w + T * A;
    N = (ae) => Math.exp(-T * ae) * (T * X * ae - w);
  } else {
    const X = T * Math.sqrt(k * k - 1);
    M = (ue) => {
      const Te = Math.exp(-k * T * ue), ve = Math.min(X * ue, 300);
      return d - Te * ((w + k * T * A) * Math.sinh(ve) + X * A * Math.cosh(ve)) / X;
    };
    const ae = (w + k * T * A) / X, q = k * T * ae - A * X, de = k * T * A - ae * X;
    N = (ue) => {
      const Te = Math.exp(-k * T * ue), ve = Math.min(X * ue, 300);
      return Te * (q * Math.sinh(ve) + de * Math.cosh(ve));
    };
  }
  const L = {
    calculatedDuration: S && l || null,
    velocity: (X) => /* @__PURE__ */ ht(N(X)),
    next: (X) => {
      if (!S && k < 1) {
        const q = Math.exp(-k * T * X), de = Math.sin(O * X), ue = Math.cos(O * X), Te = d - q * (W * de + A * ue), ve = /* @__PURE__ */ ht(q * (G * de + K * ue));
        return p.done = Math.abs(ve) <= i && Math.abs(d - Te) <= a, p.value = p.done ? d : Te, p;
      }
      const ae = M(X);
      if (S)
        p.done = X >= l;
      else {
        const q = /* @__PURE__ */ ht(N(X));
        p.done = Math.abs(q) <= i && Math.abs(d - ae) <= a;
      }
      return p.value = p.done ? d : ae, p;
    },
    toString: () => {
      const X = Math.min(Td(L), wa), ae = Hg((q) => L.next(X * q).value, X, 30);
      return X + "ms " + ae;
    },
    toTransition: () => {
    }
  };
  return L;
}
xa.applyToOptions = (e) => {
  const n = B_(e, 100, xa);
  return e.ease = n.ease, e.duration = /* @__PURE__ */ ht(n.duration), e.type = "keyframes", e;
};
const K_ = 5;
function Wg(e, n, o) {
  const i = Math.max(n - K_, 0);
  return /* @__PURE__ */ kg(o - e(i), n - i);
}
function Sc({ keyframes: e, velocity: n = 0, power: o = 0.8, timeConstant: i = 325, bounceDamping: a = 10, bounceStiffness: c = 500, modifyTarget: d, min: p, max: m, restDelta: y = 0.5, restSpeed: v }) {
  const l = e[0], f = {
    done: !1,
    value: l
  }, S = (K) => p !== void 0 && K < p || m !== void 0 && K > m, w = (K) => p === void 0 ? m : m === void 0 || Math.abs(p - K) < Math.abs(m - K) ? p : m;
  let k = o * n;
  const A = l + k, T = d === void 0 ? A : d(A);
  T !== A && (k = T - l);
  const E = (K) => -k * Math.exp(-K / i), M = (K) => T + E(K), N = (K) => {
    const L = E(K), X = M(K);
    f.done = Math.abs(L) <= y, f.value = f.done ? T : X;
  };
  let O, W;
  const G = (K) => {
    S(f.value) && (O = K, W = xa({
      keyframes: [f.value, w(f.value)],
      velocity: Wg(M, K, f.value),
      // TODO: This should be passing * 1000
      damping: a,
      stiffness: c,
      restDelta: y,
      restSpeed: v
    }));
  };
  return G(0), {
    calculatedDuration: null,
    next: (K) => {
      let L = !1;
      return !W && O === void 0 && (L = !0, N(K), G(K)), O !== void 0 && K >= O ? W.next(K - O) : (!L && N(K), f);
    }
  };
}
function Y_(e, n, o) {
  const i = [], a = o || Yn.mix || $g, c = e.length - 1;
  for (let d = 0; d < c; d++) {
    let p = a(e[d], e[d + 1]);
    if (n) {
      const m = Array.isArray(n) ? n[d] || Dt : n;
      p = Ai(m, p);
    }
    i.push(p);
  }
  return i;
}
function Q_(e, n, { clamp: o = !0, ease: i, mixer: a } = {}) {
  const c = e.length;
  if (Tr(c === n.length, "Both input and output ranges must be the same length", "range-length"), c === 1)
    return () => n[0];
  if (c === 2 && n[0] === n[1])
    return () => n[1];
  const d = e[0] === e[1];
  e[0] > e[c - 1] && (e = [...e].reverse(), n = [...n].reverse());
  const p = Y_(n, i, a), m = p.length, y = (v) => {
    if (d && v < e[0])
      return n[0];
    let l = 0;
    if (m > 1)
      for (; l < e.length - 2 && !(v < e[l + 1]); l++)
        ;
    const f = /* @__PURE__ */ hi(e[l], e[l + 1], v);
    return p[l](f);
  };
  return o ? (v) => y(rn(e[0], e[c - 1], v)) : y;
}
function X_(e, n) {
  const o = e[e.length - 1];
  for (let i = 1; i <= n; i++) {
    const a = /* @__PURE__ */ hi(0, n, i);
    e.push(ke(o, 1, a));
  }
}
function Z_(e) {
  const n = [0];
  return X_(n, e.length - 1), n;
}
function J_(e, n) {
  return e.map((o) => o * n);
}
function q_(e, n) {
  return e.map(() => n || Ng).splice(0, e.length - 1);
}
function ci({ duration: e = 300, keyframes: n, times: o, ease: i = "easeInOut" }) {
  const a = /* @__PURE__ */ l_(i) ? i.map(Sh) : Sh(i), c = {
    done: !1,
    value: n[0]
  }, d = J_(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    o && o.length === n.length ? o : Z_(n),
    e
  ), p = Q_(d, n, {
    ease: Array.isArray(a) ? a : q_(n, a)
  });
  return {
    calculatedDuration: e,
    next: (m) => (c.value = p(m), c.done = m >= e, c)
  };
}
const e1 = (e) => e !== null;
function ja(e, { repeat: n, repeatType: o = "loop" }, i, a = 1) {
  const c = e.filter(e1), p = a < 0 || n && o !== "loop" && n % 2 === 1 ? 0 : c.length - 1;
  return !p || i === void 0 ? c[p] : i;
}
const t1 = {
  decay: Sc,
  inertia: Sc,
  tween: ci,
  keyframes: ci,
  spring: xa
};
function Gg(e) {
  typeof e.type == "string" && (e.type = t1[e.type]);
}
class kd {
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
const n1 = (e) => e / 100;
class _a extends kd {
  constructor(n) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      var i, a;
      const { motionValue: o } = this.options;
      o && o.updatedAt !== st.now() && this.tick(st.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), (a = (i = this.options).onStop) == null || a.call(i));
    }, this.options = n, this.initAnimation(), this.play(), n.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: n } = this;
    Gg(n);
    const { type: o = ci, repeat: i = 0, repeatDelay: a = 0, repeatType: c, velocity: d = 0 } = n;
    let { keyframes: p } = n;
    const m = o || ci;
    m !== ci && typeof p[0] != "number" && (this.mixKeyframes = Ai(n1, $g(p[0], p[1])), p = [0, 100]);
    const y = m({ ...n, keyframes: p });
    c === "mirror" && (this.mirroredGenerator = m({
      ...n,
      keyframes: [...p].reverse(),
      velocity: -d
    })), y.calculatedDuration === null && (y.calculatedDuration = Td(y));
    const { calculatedDuration: v } = y;
    this.calculatedDuration = v, this.resolvedDuration = v + a, this.totalDuration = this.resolvedDuration * (i + 1) - a, this.generator = y;
  }
  updateTime(n) {
    const o = Math.round(n - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = o;
  }
  tick(n, o = !1) {
    const { generator: i, totalDuration: a, mixKeyframes: c, mirroredGenerator: d, resolvedDuration: p, calculatedDuration: m } = this;
    if (this.startTime === null)
      return i.next(0);
    const { delay: y = 0, keyframes: v, repeat: l, repeatType: f, repeatDelay: S, type: w, onUpdate: k, finalKeyframe: A } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, n) : this.speed < 0 && (this.startTime = Math.min(n - a / this.speed, this.startTime)), o ? this.currentTime = n : this.updateTime(n);
    const T = this.currentTime - y * (this.playbackSpeed >= 0 ? 1 : -1), E = this.playbackSpeed >= 0 ? T < 0 : T > a;
    this.currentTime = Math.max(T, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = a);
    let M = this.currentTime, N = i;
    if (l) {
      const K = Math.min(this.currentTime, a) / p;
      let L = Math.floor(K), X = K % 1;
      !X && K >= 1 && (X = 1), X === 1 && L--, L = Math.min(L, l + 1), !!(L % 2) && (f === "reverse" ? (X = 1 - X, S && (X -= S / p)) : f === "mirror" && (N = d)), M = rn(0, 1, X) * p;
    }
    let O;
    E ? (this.delayState.value = v[0], O = this.delayState) : O = N.next(M), c && !E && (O.value = c(O.value));
    let { done: W } = O;
    !E && m !== null && (W = this.playbackSpeed >= 0 ? this.currentTime >= a : this.currentTime <= 0);
    const G = this.holdTime === null && (this.state === "finished" || this.state === "running" && W);
    return G && w !== Sc && (O.value = ja(v, this.options, A, this.speed)), k && k(O.value), G && this.finish(), O;
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
    return /* @__PURE__ */ Rt(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: n = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ Rt(n);
  }
  get time() {
    return /* @__PURE__ */ Rt(this.currentTime);
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
    return Wg((i) => this.generator.next(i).value, n, o);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(n) {
    const o = this.playbackSpeed !== n;
    o && this.driver && this.updateTime(st.now()), this.playbackSpeed = n, o && this.driver && (this.time = /* @__PURE__ */ Rt(this.currentTime));
  }
  play() {
    var a, c;
    if (this.isStopped)
      return;
    const { driver: n = V_, startTime: o } = this.options;
    this.driver || (this.driver = n((d) => this.tick(d))), (c = (a = this.options).onPlay) == null || c.call(a);
    const i = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = i) : this.holdTime !== null ? this.startTime = i - this.holdTime : this.startTime || (this.startTime = o ?? i), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(st.now()), this.holdTime = this.currentTime;
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
function r1(e) {
  for (let n = 1; n < e.length; n++)
    e[n] ?? (e[n] = e[n - 1]);
}
const yr = (e) => e * 180 / Math.PI, wc = (e) => {
  const n = yr(Math.atan2(e[1], e[0]));
  return xc(n);
}, o1 = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: wc,
  rotateZ: wc,
  skewX: (e) => yr(Math.atan(e[1])),
  skewY: (e) => yr(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, xc = (e) => (e = e % 360, e < 0 && (e += 360), e), Ch = wc, Ph = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), Eh = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), i1 = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: Ph,
  scaleY: Eh,
  scale: (e) => (Ph(e) + Eh(e)) / 2,
  rotateX: (e) => xc(yr(Math.atan2(e[6], e[5]))),
  rotateY: (e) => xc(yr(Math.atan2(-e[2], e[0]))),
  rotateZ: Ch,
  rotate: Ch,
  skewX: (e) => yr(Math.atan(e[4])),
  skewY: (e) => yr(Math.atan(e[1])),
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
    i = i1, a = o;
  else {
    const p = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    i = o1, a = p;
  }
  if (!a)
    return _c(n);
  const c = i[n], d = a[1].split(",").map(a1);
  return typeof c == "function" ? c(d) : d[c];
}
const s1 = (e, n) => {
  const { transform: o = "none" } = getComputedStyle(e);
  return Tc(o, n);
};
function a1(e) {
  return parseFloat(e.trim());
}
const mo = [
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
], ho = /* @__PURE__ */ new Set([...mo, "pathRotation"]), bh = (e) => e === po || e === ne, l1 = /* @__PURE__ */ new Set(["x", "y", "z"]), u1 = mo.filter((e) => !l1.has(e));
function c1(e) {
  const n = [];
  return u1.forEach((o) => {
    const i = e.getValue(o);
    i !== void 0 && (n.push([o, i.get()]), i.set(o.startsWith("scale") ? 1 : 0));
  }), n;
}
const Wn = {
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
Wn.translateX = Wn.x;
Wn.translateY = Wn.y;
const vr = /* @__PURE__ */ new Set();
let kc = !1, Ac = !1, Cc = !1;
function Kg() {
  if (Ac) {
    const e = Array.from(vr).filter((i) => i.needsMeasurement), n = new Set(e.map((i) => i.element)), o = /* @__PURE__ */ new Map();
    n.forEach((i) => {
      const a = c1(i);
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
  Ac = !1, kc = !1, vr.forEach((e) => e.complete(Cc)), vr.clear();
}
function Yg() {
  vr.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (Ac = !0);
  });
}
function d1() {
  Cc = !0, Yg(), Kg(), Cc = !1;
}
class Ad {
  constructor(n, o, i, a, c, d = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...n], this.onComplete = o, this.name = i, this.motionValue = a, this.element = c, this.isAsync = d;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (vr.add(this), kc || (kc = !0, Ae.read(Yg), Ae.resolveKeyframes(Kg))) : (this.readKeyframes(), this.complete());
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
    r1(n);
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
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, n), vr.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (vr.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const f1 = (e) => e.startsWith("--");
function Qg(e, n, o) {
  f1(n) ? e.style.setProperty(n, o) : e.style[n] = o;
}
const p1 = {};
function Xg(e, n) {
  const o = /* @__PURE__ */ Tg(e);
  return () => p1[n] ?? o();
}
const m1 = /* @__PURE__ */ Xg(() => window.ScrollTimeline !== void 0, "scrollTimeline"), Zg = /* @__PURE__ */ Xg(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), ai = ([e, n, o, i]) => `cubic-bezier(${e}, ${n}, ${o}, ${i})`, Mh = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ ai([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ ai([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ ai([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ ai([0.33, 1.53, 0.69, 0.99])
};
function Jg(e, n) {
  if (e)
    return typeof e == "function" ? Zg() ? Hg(e, n) : "ease-out" : /* @__PURE__ */ Ig(e) ? ai(e) : Array.isArray(e) ? e.map((o) => Jg(o, n) || Mh.easeOut) : Mh[e];
}
function h1(e, n, o, { delay: i = 0, duration: a = 300, repeat: c = 0, repeatType: d = "loop", ease: p = "easeOut", times: m } = {}, y = void 0) {
  const v = {
    [n]: o
  };
  m && (v.offset = m);
  const l = Jg(p, a);
  Array.isArray(l) && (v.easing = l);
  const f = {
    delay: i,
    duration: a,
    easing: Array.isArray(l) ? "linear" : l,
    fill: "both",
    iterations: c + 1,
    direction: d === "reverse" ? "alternate" : "normal"
  };
  return y && (f.pseudoElement = y), e.animate(v, f);
}
function qg(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function y1({ type: e, ...n }) {
  return qg(e) && Zg() ? e.applyToOptions(n) : (n.duration ?? (n.duration = 300), n.ease ?? (n.ease = "easeOut"), n);
}
class ev extends kd {
  constructor(n) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !n)
      return;
    const { element: o, name: i, keyframes: a, pseudoElement: c, allowFlatten: d = !1, finalKeyframe: p, onComplete: m } = n;
    this.isPseudoElement = !!c, this.allowFlatten = d, this.options = n, Tr(typeof n.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const y = y1(n);
    this.animation = h1(o, i, a, y, c), y.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !c) {
        const v = ja(a, this.options, p, this.speed);
        this.updateMotionValue && this.updateMotionValue(v), Qg(o, i, v), this.animation.cancel();
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
    return /* @__PURE__ */ Rt(Number(n));
  }
  get iterationDuration() {
    const { delay: n = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ Rt(n);
  }
  get time() {
    return /* @__PURE__ */ Rt(Number(this.animation.currentTime) || 0);
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
    return this.allowFlatten && ((c = this.animation.effect) == null || c.updateTiming({ easing: "linear" })), this.animation.onfinish = null, n && m1() ? (this.animation.timeline = n, o && (this.animation.rangeStart = o), i && (this.animation.rangeEnd = i), Dt) : a(this);
  }
}
const tv = {
  anticipate: Mg,
  backInOut: bg,
  circInOut: Dg
};
function g1(e) {
  return e in tv;
}
function v1(e) {
  typeof e.ease == "string" && g1(e.ease) && (e.ease = tv[e.ease]);
}
const Yu = 10;
class S1 extends ev {
  constructor(n) {
    v1(n), Gg(n), super(n), n.startTime !== void 0 && n.autoplay !== !1 && (this.startTime = n.startTime), this.options = n;
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
    const p = new _a({
      ...d,
      autoplay: !1
    }), m = Math.max(Yu, st.now() - this.startTime), y = rn(0, Yu, m - Yu), v = p.sample(m).value, { name: l } = this.options;
    c && l && Qg(c, l, v), o.setWithVelocity(p.sample(Math.max(0, m - y)).value, v, y), p.stop();
  }
}
const Rh = (e, n) => n === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
($t.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function w1(e) {
  const n = e[0];
  if (e.length === 1)
    return !0;
  for (let o = 0; o < e.length; o++)
    if (e[o] !== n)
      return !0;
}
function x1(e, n, o, i) {
  const a = e[0];
  if (a === null)
    return !1;
  if (n === "display" || n === "visibility")
    return !0;
  const c = e[e.length - 1], d = Rh(a, n), p = Rh(c, n);
  return ki(d === p, `You are trying to animate ${n} from "${a}" to "${c}". "${d ? c : a}" is not an animatable value.`, "value-not-animatable"), !d || !p ? !1 : w1(e) || (o === "spring" || qg(o)) && i;
}
function Pc(e) {
  e.duration = 0, e.type = "keyframes";
}
const nv = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), _1 = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function T1(e) {
  for (let n = 0; n < e.length; n++)
    if (typeof e[n] == "string" && _1.test(e[n]))
      return !0;
  return !1;
}
const k1 = /* @__PURE__ */ new Set([
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
]), A1 = /* @__PURE__ */ Tg(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function C1(e) {
  var l;
  const { motionValue: n, name: o, repeatDelay: i, repeatType: a, damping: c, type: d, keyframes: p } = e;
  if (!(((l = n == null ? void 0 : n.owner) == null ? void 0 : l.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: y, transformTemplate: v } = n.owner.getProps();
  return A1() && o && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (nv.has(o) || k1.has(o) && T1(p)) && (o !== "transform" || !v) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !y && !i && a !== "mirror" && c !== 0 && d !== "inertia";
}
const P1 = 40;
class E1 extends kd {
  constructor({ autoplay: n = !0, delay: o = 0, type: i = "keyframes", repeat: a = 0, repeatDelay: c = 0, repeatType: d = "loop", keyframes: p, name: m, motionValue: y, element: v, ...l }) {
    var w;
    super(), this.stop = () => {
      var k, A;
      this._animation && (this._animation.stop(), (k = this.stopTimeline) == null || k.call(this)), (A = this.keyframeResolver) == null || A.cancel();
    }, this.createdAt = st.now();
    const f = {
      autoplay: n,
      delay: o,
      type: i,
      repeat: a,
      repeatDelay: c,
      repeatType: d,
      name: m,
      motionValue: y,
      element: v,
      ...l
    }, S = (v == null ? void 0 : v.KeyframeResolver) || Ad;
    this.keyframeResolver = new S(p, (k, A, T) => this.onKeyframesResolved(k, A, f, !T), m, y, v), (w = this.keyframeResolver) == null || w.scheduleResolve();
  }
  onKeyframesResolved(n, o, i, a) {
    var T, E;
    this.keyframeResolver = void 0;
    const { name: c, type: d, velocity: p, delay: m, isHandoff: y, onUpdate: v } = i;
    this.resolvedAt = st.now();
    let l = !0;
    x1(n, c, d, p) || (l = !1, (Yn.instantAnimations || !m) && (v == null || v(ja(n, i, o))), n[0] = n[n.length - 1], Pc(i), i.repeat = 0);
    const S = {
      startTime: a ? this.resolvedAt ? this.resolvedAt - this.createdAt > P1 ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: o,
      ...i,
      keyframes: n
    }, w = l && !y && C1(S), k = (E = (T = S.motionValue) == null ? void 0 : T.owner) == null ? void 0 : E.current;
    let A;
    if (w)
      try {
        A = new S1({
          ...S,
          element: k
        });
      } catch {
        A = new _a(S);
      }
    else
      A = new _a(S);
    A.finished.then(() => {
      this.notifyFinished();
    }).catch(Dt), this.pendingTimeline && (this.stopTimeline = A.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = A;
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
    return this._animation || ((n = this.keyframeResolver) == null || n.resume(), d1()), this._animation;
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
function rv(e, n, o, i = 0, a = 1) {
  const c = Array.from(e).sort((y, v) => y.sortNodePosition(v)).indexOf(n), d = e.size, p = (d - 1) * i;
  return typeof o == "function" ? o(c, d) : a === 1 ? c * i : p - c * i;
}
const Dh = 30, b1 = (e) => !isNaN(parseFloat(e));
class M1 {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(n, o = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (i) => {
      var c;
      const a = st.now();
      if (this.updatedAt !== a && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(i), this.current !== this.prev && ((c = this.events.change) == null || c.notify(this.current), this.dependents))
        for (const d of this.dependents)
          d.dirty();
    }, this.hasAnimated = !1, this.setCurrent(n), this.owner = o.owner;
  }
  setCurrent(n) {
    this.current = n, this.updatedAt = st.now(), this.canTrackVelocity === null && n !== void 0 && (this.canTrackVelocity = b1(this.current));
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
    this.events[n] || (this.events[n] = new yd());
    const i = this.events[n].add(o);
    return n === "change" ? () => {
      i(), Ae.read(() => {
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
    const n = st.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || n - this.updatedAt > Dh)
      return 0;
    const o = Math.min(this.updatedAt - this.prevUpdatedAt, Dh);
    return /* @__PURE__ */ kg(parseFloat(this.current) - parseFloat(this.prevFrameValue), o);
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
function co(e, n) {
  return new M1(e, n);
}
function ov(e, n) {
  if (e != null && e.inherit && n) {
    const { inherit: o, ...i } = e;
    return { ...n, ...i };
  }
  return e;
}
function Cd(e, n) {
  const o = (e == null ? void 0 : e[n]) ?? (e == null ? void 0 : e.default) ?? e;
  return o !== e ? ov(o, e) : o;
}
const R1 = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, D1 = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), N1 = {
  type: "keyframes",
  duration: 0.8
}, I1 = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, j1 = (e, { keyframes: n }) => n.length > 2 ? N1 : ho.has(e) ? e.startsWith("scale") ? D1(n[1]) : R1 : I1, F1 = /* @__PURE__ */ new Set([
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
function O1(e) {
  for (const n in e)
    if (!F1.has(n))
      return !0;
  return !1;
}
const Pd = (e, n, o, i = {}, a, c) => (d) => {
  const p = Cd(i, e) || {}, m = p.delay || i.delay || 0;
  let { elapsed: y = 0 } = i;
  y = y - /* @__PURE__ */ ht(m);
  const v = {
    keyframes: Array.isArray(o) ? o : [null, o],
    ease: "easeOut",
    velocity: n.getVelocity(),
    ...p,
    delay: -y,
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
  O1(p) || Object.assign(v, j1(e, v)), v.duration && (v.duration = /* @__PURE__ */ ht(v.duration)), v.repeatDelay && (v.repeatDelay = /* @__PURE__ */ ht(v.repeatDelay)), v.from !== void 0 && (v.keyframes[0] = v.from);
  let l = !1;
  if ((v.type === !1 || v.duration === 0 && !v.repeatDelay) && (Pc(v), v.delay === 0 && (l = !0)), (Yn.instantAnimations || Yn.skipAnimations || a != null && a.shouldSkipAnimations || p.skipAnimations) && (l = !0, Pc(v), v.delay = 0), v.allowFlatten = !p.type && !p.ease, l && !c && n.get() !== void 0) {
    const f = ja(v.keyframes, p);
    if (f !== void 0) {
      Ae.update(() => {
        v.onUpdate(f), v.onComplete();
      });
      return;
    }
  }
  return p.isSync ? new _a(v) : new E1(v);
}, L1 = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function V1(e) {
  const n = L1.exec(e);
  if (!n)
    return [,];
  const [, o, i, a] = n;
  return [`--${o ?? i}`, a];
}
const B1 = 4;
function iv(e, n, o = 1) {
  Tr(o <= B1, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [i, a] = V1(e);
  if (!i)
    return;
  const c = window.getComputedStyle(n).getPropertyValue(i);
  if (c) {
    const d = c.trim();
    return wg(d) ? parseFloat(d) : d;
  }
  return Sd(a) ? iv(a, n, o + 1) : a;
}
function Nh(e) {
  const n = [{}, {}];
  return e == null || e.values.forEach((o, i) => {
    n[0][i] = o.get(), n[1][i] = o.getVelocity();
  }), n;
}
function Ed(e, n, o, i) {
  if (typeof n == "function") {
    const [a, c] = Nh(i);
    n = n(o !== void 0 ? o : e.custom, a, c);
  }
  if (typeof n == "string" && (n = e.variants && e.variants[n]), typeof n == "function") {
    const [a, c] = Nh(i);
    n = n(o !== void 0 ? o : e.custom, a, c);
  }
  return n;
}
function Sr(e, n, o) {
  const i = e.getProps();
  return Ed(i, n, o !== void 0 ? o : i.custom, e);
}
const sv = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...mo
]), Ec = (e) => Array.isArray(e);
function z1(e, n, o) {
  e.hasValue(n) ? e.getValue(n).set(o) : e.addValue(n, co(o));
}
function U1(e) {
  return Ec(e) ? e[e.length - 1] || 0 : e;
}
function $1(e, n) {
  const o = Sr(e, n);
  let { transitionEnd: i = {}, transition: a = {}, ...c } = o || {};
  c = { ...c, ...i };
  for (const d in c) {
    const p = U1(c[d]);
    z1(e, d, p);
  }
}
const Je = (e) => !!(e && e.getVelocity);
function H1(e) {
  return !!(Je(e) && e.add);
}
function bc(e, n) {
  const o = e.getValue("willChange");
  if (H1(o))
    return o.add(n);
  if (!o && Yn.WillChange) {
    const i = new Yn.WillChange("auto");
    e.addValue("willChange", i), i.add(n);
  }
}
function bd(e) {
  return e.replace(/([A-Z])/g, (n) => `-${n.toLowerCase()}`);
}
const W1 = "framerAppearId", av = "data-" + bd(W1);
function lv(e) {
  return e.props[av];
}
function G1({ protectedKeys: e, needsAnimating: n }, o) {
  const i = e.hasOwnProperty(o) && n[o] !== !0;
  return n[o] = !1, i;
}
function uv(e, n, { delay: o = 0, transitionOverride: i, type: a } = {}) {
  let { transition: c, transitionEnd: d, ...p } = n;
  const m = e.getDefaultTransition();
  c = c ? ov(c, m) : m;
  const y = c == null ? void 0 : c.reduceMotion, v = c == null ? void 0 : c.skipAnimations;
  i && (c = i);
  const l = [], f = a && e.animationState && e.animationState.getState()[a], S = c == null ? void 0 : c.path;
  S && S.animateVisualElement(e, p, c, o, l);
  for (const w in p) {
    const k = e.getValue(w, e.latestValues[w] ?? null), A = p[w];
    if (A === void 0 || f && G1(f, w))
      continue;
    const T = {
      delay: o,
      ...Cd(c || {}, w)
    };
    v && (T.skipAnimations = !0);
    const E = k.get();
    if (E !== void 0 && !k.isAnimating() && !Array.isArray(A) && A === E && !T.velocity) {
      Ae.update(() => k.set(A));
      continue;
    }
    let M = !1;
    if (window.MotionHandoffAnimation) {
      const W = lv(e);
      if (W) {
        const G = window.MotionHandoffAnimation(W, w, Ae);
        G !== null && (T.startTime = G, M = !0);
      }
    }
    bc(e, w);
    const N = y ?? e.shouldReduceMotion;
    k.start(Pd(w, k, A, N && sv.has(w) ? { type: !1 } : T, e, M));
    const O = k.animation;
    O && l.push(O);
  }
  if (d) {
    const w = () => Ae.update(() => {
      d && $1(e, d);
    });
    l.length ? Promise.all(l).then(w) : w();
  }
  return l;
}
function Mc(e, n, o = {}) {
  var m;
  const i = Sr(e, n, o.type === "exit" ? (m = e.presenceContext) == null ? void 0 : m.custom : void 0);
  let { transition: a = e.getDefaultTransition() || {} } = i || {};
  o.transitionOverride && (a = o.transitionOverride);
  const c = i ? () => Promise.all(uv(e, i, o)) : () => Promise.resolve(), d = e.variantChildren && e.variantChildren.size ? (y = 0) => {
    const { delayChildren: v = 0, staggerChildren: l, staggerDirection: f } = a;
    return K1(e, n, y, v, l, f, o);
  } : () => Promise.resolve(), { when: p } = a;
  if (p) {
    const [y, v] = p === "beforeChildren" ? [c, d] : [d, c];
    return y().then(() => v());
  } else
    return Promise.all([c(), d(o.delay)]);
}
function K1(e, n, o = 0, i = 0, a = 0, c = 1, d) {
  const p = [];
  for (const m of e.variantChildren)
    m.notify("AnimationStart", n), p.push(Mc(m, n, {
      ...d,
      delay: o + (typeof i == "function" ? 0 : i) + rv(e.variantChildren, m, i, a, c)
    }).then(() => m.notify("AnimationComplete", n)));
  return Promise.all(p);
}
function Y1(e, n, o = {}) {
  e.notify("AnimationStart", n);
  let i;
  if (Array.isArray(n)) {
    const a = n.map((c) => Mc(e, c, o));
    i = Promise.all(a);
  } else if (typeof n == "string")
    i = Mc(e, n, o);
  else {
    const a = typeof n == "function" ? Sr(e, n, o.custom) : n;
    i = Promise.all(uv(e, a, o));
  }
  return i.then(() => {
    e.notify("AnimationComplete", n);
  });
}
const Q1 = {
  test: (e) => e === "auto",
  parse: (e) => e
}, cv = (e) => (n) => n.test(e), dv = [po, ne, tn, hn, w_, S_, Q1], Ih = (e) => dv.find(cv(e));
function X1(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || _g(e) : !0;
}
const Z1 = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function J1(e) {
  const [n, o] = e.slice(0, -1).split("(");
  if (n === "drop-shadow")
    return e;
  const [i] = o.match(wd) || [];
  if (!i)
    return e;
  const a = o.replace(i, "");
  let c = Z1.has(n) ? 1 : 0;
  return i !== o && (c *= 100), n + "(" + c + a + ")";
}
const q1 = /\b([a-z-]*)\(.*?\)/gu, Rc = {
  ...$t,
  getAnimatableNone: (e) => {
    const n = e.match(q1);
    return n ? n.map(J1).join(" ") : e;
  }
}, Dc = {
  ...$t,
  getAnimatableNone: (e) => {
    const n = $t.parse(e);
    return $t.createTransformer(e)(n.map((i) => typeof i == "number" ? 0 : typeof i == "object" ? { ...i, alpha: 1 } : i));
  }
}, jh = {
  ...po,
  transform: Math.round
}, eT = {
  rotate: hn,
  /**
   * Internal channel for `transition.path` orientToPath. Composed onto
   * `rotate` at the transform-build sites so the user's `rotate` is
   * never read or overwritten. Not part of `transformPropOrder`.
   */
  pathRotation: hn,
  rotateX: hn,
  rotateY: hn,
  rotateZ: hn,
  scale: Ws,
  scaleX: Ws,
  scaleY: Ws,
  scaleZ: Ws,
  skew: hn,
  skewX: hn,
  skewY: hn,
  distance: ne,
  translateX: ne,
  translateY: ne,
  translateZ: ne,
  x: ne,
  y: ne,
  z: ne,
  perspective: ne,
  transformPerspective: ne,
  opacity: yi,
  originX: xh,
  originY: xh,
  originZ: ne
}, Ta = {
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
  ...eT,
  zIndex: jh,
  // SVG
  fillOpacity: yi,
  strokeOpacity: yi,
  numOctaves: jh
}, tT = {
  ...Ta,
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
}, fv = (e) => tT[e], nT = /* @__PURE__ */ new Set([Rc, Dc]);
function pv(e, n) {
  let o = fv(e);
  return nT.has(o) || (o = $t), o.getAnimatableNone ? o.getAnimatableNone(n) : void 0;
}
const rT = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function oT(e, n, o) {
  let i = 0, a;
  for (; i < e.length && !a; ) {
    const c = e[i];
    typeof c == "string" && !rT.has(c) && uo(c).values.length && (a = e[i]), i++;
  }
  if (a && o)
    for (const c of n)
      e[c] = pv(o, a);
}
class iT extends Ad {
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
      if (typeof l == "string" && (l = l.trim(), Sd(l))) {
        const f = iv(l, o.current);
        f !== void 0 && (n[v] = f), v === n.length - 1 && (this.finalKeyframe = l);
      }
    }
    if (this.resolveNoneKeyframes(), !sv.has(i) || n.length !== 2)
      return;
    const [a, c] = n, d = Ih(a), p = Ih(c), m = wh(a), y = wh(c);
    if (m !== y && Wn[i]) {
      this.needsMeasurement = !0;
      return;
    }
    if (d !== p)
      if (bh(d) && bh(p))
        for (let v = 0; v < n.length; v++) {
          const l = n[v];
          typeof l == "string" && (n[v] = parseFloat(l));
        }
      else Wn[i] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: n, name: o } = this, i = [];
    for (let a = 0; a < n.length; a++)
      (n[a] === null || X1(n[a])) && i.push(a);
    i.length && oT(n, i, o);
  }
  measureInitialState() {
    const { element: n, unresolvedKeyframes: o, name: i } = this;
    if (!n || !n.current)
      return;
    i === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = Wn[i](n.measureViewportBox(), window.getComputedStyle(n.current)), o[0] = this.measuredOrigin;
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
    i[c] = Wn[o](n.measureViewportBox(), window.getComputedStyle(n.current)), d !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = d), (p = this.removedTransforms) != null && p.length && this.removedTransforms.forEach(([m, y]) => {
      n.getValue(m).set(y);
    }), this.resolveNoneKeyframes();
  }
}
function mv(e, n, o) {
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
function sa(e) {
  return xg(e) && "offsetHeight" in e && !("ownerSVGElement" in e);
}
const { schedule: Md } = /* @__PURE__ */ jg(queueMicrotask, !1), zt = {
  x: !1,
  y: !1
};
function hv() {
  return zt.x || zt.y;
}
function sT(e) {
  return e === "x" || e === "y" ? zt[e] ? null : (zt[e] = !0, () => {
    zt[e] = !1;
  }) : zt.x || zt.y ? null : (zt.x = zt.y = !0, () => {
    zt.x = zt.y = !1;
  });
}
function yv(e, n) {
  const o = mv(e), i = new AbortController(), a = {
    passive: !0,
    ...n,
    signal: i.signal
  };
  return [o, a, () => i.abort()];
}
function aT(e) {
  return !(e.pointerType === "touch" || hv());
}
function lT(e, n, o = {}) {
  const [i, a, c] = yv(e, o);
  return i.forEach((d) => {
    let p = !1, m = !1, y;
    const v = () => {
      d.removeEventListener("pointerleave", w);
    }, l = (A) => {
      y && (y(A), y = void 0), v();
    }, f = (A) => {
      p = !1, window.removeEventListener("pointerup", f), window.removeEventListener("pointercancel", f), m && (m = !1, l(A));
    }, S = () => {
      p = !0, window.addEventListener("pointerup", f, a), window.addEventListener("pointercancel", f, a);
    }, w = (A) => {
      if (A.pointerType !== "touch") {
        if (p) {
          m = !0;
          return;
        }
        l(A);
      }
    }, k = (A) => {
      if (!aT(A))
        return;
      m = !1;
      const T = n(d, A);
      typeof T == "function" && (y = T, d.addEventListener("pointerleave", w, a));
    };
    d.addEventListener("pointerenter", k, a), d.addEventListener("pointerdown", S, a);
  }), c;
}
const gv = (e, n) => n ? e === n ? !0 : gv(e, n.parentElement) : !1, Rd = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, uT = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function cT(e) {
  return uT.has(e.tagName) || e.isContentEditable === !0;
}
const dT = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function fT(e) {
  return dT.has(e.tagName) || e.isContentEditable === !0;
}
const aa = /* @__PURE__ */ new WeakSet();
function Fh(e) {
  return (n) => {
    n.key === "Enter" && e(n);
  };
}
function Qu(e, n) {
  e.dispatchEvent(new PointerEvent("pointer" + n, { isPrimary: !0, bubbles: !0 }));
}
const pT = (e, n) => {
  const o = e.currentTarget;
  if (!o)
    return;
  const i = Fh(() => {
    if (aa.has(o))
      return;
    Qu(o, "down");
    const a = Fh(() => {
      Qu(o, "up");
    }), c = () => Qu(o, "cancel");
    o.addEventListener("keyup", a, n), o.addEventListener("blur", c, n);
  });
  o.addEventListener("keydown", i, n), o.addEventListener("blur", () => o.removeEventListener("keydown", i), n);
};
function Oh(e) {
  return Rd(e) && !hv();
}
const Lh = /* @__PURE__ */ new WeakSet();
function mT(e, n, o = {}) {
  const [i, a, c] = yv(e, o), d = (p) => {
    const m = p.currentTarget;
    if (!Oh(p) || Lh.has(p))
      return;
    aa.add(m), o.stopPropagation && Lh.add(p);
    const y = n(m, p), v = (S, w) => {
      window.removeEventListener("pointerup", l), window.removeEventListener("pointercancel", f), aa.has(m) && aa.delete(m), Oh(S) && typeof y == "function" && y(S, { success: w });
    }, l = (S) => {
      v(S, m === window || m === document || o.useGlobalTarget || gv(m, S.target));
    }, f = (S) => {
      v(S, !1);
    };
    window.addEventListener("pointerup", l, a), window.addEventListener("pointercancel", f, a);
  };
  return i.forEach((p) => {
    (o.useGlobalTarget ? window : p).addEventListener("pointerdown", d, a), sa(p) && (p.addEventListener("focus", (y) => pT(y, a)), !cT(p) && !p.hasAttribute("tabindex") && (p.tabIndex = 0));
  }), c;
}
function Dd(e) {
  return xg(e) && "ownerSVGElement" in e;
}
const la = /* @__PURE__ */ new WeakMap();
let zn;
const vv = (e, n, o) => (i, a) => a && a[0] ? a[0][e + "Size"] : Dd(i) && "getBBox" in i ? i.getBBox()[n] : i[o], hT = /* @__PURE__ */ vv("inline", "width", "offsetWidth"), yT = /* @__PURE__ */ vv("block", "height", "offsetHeight");
function gT({ target: e, borderBoxSize: n }) {
  var o;
  (o = la.get(e)) == null || o.forEach((i) => {
    i(e, {
      get width() {
        return hT(e, n);
      },
      get height() {
        return yT(e, n);
      }
    });
  });
}
function vT(e) {
  e.forEach(gT);
}
function ST() {
  typeof ResizeObserver > "u" || (zn = new ResizeObserver(vT));
}
function wT(e, n) {
  zn || ST();
  const o = mv(e);
  return o.forEach((i) => {
    let a = la.get(i);
    a || (a = /* @__PURE__ */ new Set(), la.set(i, a)), a.add(n), zn == null || zn.observe(i);
  }), () => {
    o.forEach((i) => {
      const a = la.get(i);
      a == null || a.delete(n), a != null && a.size || zn == null || zn.unobserve(i);
    });
  };
}
const ua = /* @__PURE__ */ new Set();
let oo;
function xT() {
  oo = () => {
    const e = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    ua.forEach((n) => n(e));
  }, window.addEventListener("resize", oo);
}
function _T(e) {
  return ua.add(e), oo || xT(), () => {
    ua.delete(e), !ua.size && typeof oo == "function" && (window.removeEventListener("resize", oo), oo = void 0);
  };
}
function Vh(e, n) {
  return typeof e == "function" ? _T(e) : wT(e, n);
}
function TT(e) {
  return Dd(e) && e.tagName === "svg";
}
const kT = [...dv, Ve, $t], AT = (e) => kT.find(cv(e)), Bh = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), io = () => ({
  x: Bh(),
  y: Bh()
}), zh = () => ({ min: 0, max: 0 }), $e = () => ({
  x: zh(),
  y: zh()
}), CT = /* @__PURE__ */ new WeakMap();
function Fa(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function gi(e) {
  return typeof e == "string" || Array.isArray(e);
}
const Nd = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], Id = ["initial", ...Nd];
function Oa(e) {
  return Fa(e.animate) || Id.some((n) => gi(e[n]));
}
function Sv(e) {
  return !!(Oa(e) || e.variants);
}
function PT(e, n, o) {
  for (const i in n) {
    const a = n[i], c = o[i];
    if (Je(a))
      e.addValue(i, a);
    else if (Je(c))
      e.addValue(i, co(a, { owner: e }));
    else if (c !== a)
      if (e.hasValue(i)) {
        const d = e.getValue(i);
        d.liveStyle === !0 ? d.jump(a) : d.hasAnimated || d.set(a);
      } else {
        const d = e.getStaticValue(i);
        e.addValue(i, co(d !== void 0 ? d : a, { owner: e }));
      }
  }
  for (const i in o)
    n[i] === void 0 && e.removeValue(i);
  return n;
}
const Ic = { current: null }, wv = { current: !1 }, ET = typeof window < "u";
function bT() {
  if (wv.current = !0, !!ET)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), n = () => Ic.current = e.matches;
      e.addEventListener("change", n), n();
    } else
      Ic.current = !1;
}
const Uh = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let ka = {};
function xv(e) {
  ka = e;
}
function MT() {
  return ka;
}
class RT {
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
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = Ad, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const S = st.now();
      this.renderScheduledAt < S && (this.renderScheduledAt = S, Ae.render(this.render, !1, !0));
    };
    const { latestValues: y, renderState: v } = p;
    this.latestValues = y, this.baseTarget = { ...y }, this.initialValues = o.initial ? { ...y } : {}, this.renderState = v, this.parent = n, this.props = o, this.presenceContext = i, this.depth = n ? n.depth + 1 : 0, this.reducedMotionConfig = a, this.skipAnimationsConfig = c, this.options = m, this.blockInitialAnimation = !!d, this.isControllingVariants = Oa(o), this.isVariantNode = Sv(o), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(n && n.current);
    const { willChange: l, ...f } = this.scrapeMotionValuesFromProps(o, {}, this);
    for (const S in f) {
      const w = f[S];
      y[S] !== void 0 && Je(w) && w.set(y[S]);
    }
  }
  mount(n) {
    var o, i;
    if (this.hasBeenMounted)
      for (const a in this.initialValues)
        (o = this.values.get(a)) == null || o.jump(this.initialValues[a]), this.latestValues[a] = this.initialValues[a];
    this.current = n, CT.set(n, this), this.projection && !this.projection.instance && this.projection.mount(n), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((a, c) => this.bindToMotionValue(c, a)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (wv.current || bT(), this.shouldReduceMotion = Ic.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (i = this.parent) == null || i.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    var n;
    this.projection && this.projection.unmount(), Qn(this.notifyUpdate), Qn(this.render), this.valueSubscriptions.forEach((o) => o()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), (n = this.parent) == null || n.removeChild(this);
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
    if (this.valueSubscriptions.has(n) && this.valueSubscriptions.get(n)(), o.accelerate && nv.has(n) && this.current instanceof HTMLElement) {
      const { factory: d, keyframes: p, times: m, ease: y, duration: v } = o.accelerate, l = new ev({
        element: this.current,
        name: n,
        keyframes: p,
        times: m,
        ease: y,
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
      this.latestValues[n] = d, this.props.onUpdate && Ae.preRender(this.notifyUpdate), i && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
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
    for (n in ka) {
      const o = ka[n];
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
    for (let i = 0; i < Uh.length; i++) {
      const a = Uh[i];
      this.propEventSubscriptions[a] && (this.propEventSubscriptions[a](), delete this.propEventSubscriptions[a]);
      const c = "on" + a, d = n[c];
      d && (this.propEventSubscriptions[a] = this.on(a, d));
    }
    this.prevMotionValues = PT(this, this.scrapeMotionValuesFromProps(n, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
    return i === void 0 && o !== void 0 && (i = co(o === null ? void 0 : o, { owner: this }), this.addValue(n, i)), i;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(n, o) {
    let i = this.latestValues[n] !== void 0 || !this.current ? this.latestValues[n] : this.getBaseTargetFromProps(this.props, n) ?? this.readValueFromInstance(this.current, n, this.options);
    return i != null && (typeof i == "string" && (wg(i) || _g(i)) ? i = parseFloat(i) : !AT(i) && $t.test(o) && (i = pv(n, o)), this.setBaseTarget(n, Je(i) ? i.get() : i)), Je(i) ? i.get() : i;
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
      const d = Ed(this.props, o, (c = this.presenceContext) == null ? void 0 : c.custom);
      d && (i = d[n]);
    }
    if (o && i !== void 0)
      return i;
    const a = this.getBaseTargetFromProps(this.props, n);
    return a !== void 0 && !Je(a) ? a : this.initialValues[n] !== void 0 && i === void 0 ? void 0 : this.baseTarget[n];
  }
  on(n, o) {
    return this.events[n] || (this.events[n] = new yd()), this.events[n].add(o);
  }
  notify(n, ...o) {
    this.events[n] && this.events[n].notify(...o);
  }
  scheduleRenderMicrotask() {
    Md.render(this.render);
  }
}
class _v extends RT {
  constructor() {
    super(...arguments), this.KeyframeResolver = iT;
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
class Xn {
  constructor(n) {
    this.isMounted = !1, this.node = n;
  }
  update() {
  }
}
function Tv({ top: e, left: n, right: o, bottom: i }) {
  return {
    x: { min: n, max: o },
    y: { min: e, max: i }
  };
}
function DT({ x: e, y: n }) {
  return { top: n.min, right: e.max, bottom: n.max, left: e.min };
}
function NT(e, n) {
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
function dr(e) {
  return jc(e) || kv(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function kv(e) {
  return $h(e.x) || $h(e.y);
}
function $h(e) {
  return e && e !== "0%";
}
function Aa(e, n, o) {
  const i = e - o, a = n * i;
  return o + a;
}
function Hh(e, n, o, i, a) {
  return a !== void 0 && (e = Aa(e, a, i)), Aa(e, o, i) + n;
}
function Fc(e, n = 0, o = 1, i, a) {
  e.min = Hh(e.min, n, o, i, a), e.max = Hh(e.max, n, o, i, a);
}
function Av(e, { x: n, y: o }) {
  Fc(e.x, n.translate, n.scale, n.originPoint), Fc(e.y, o.translate, o.scale, o.originPoint);
}
const Wh = 0.999999999999, Gh = 1.0000000000001;
function IT(e, n, o, i = !1) {
  var p;
  const a = o.length;
  if (!a)
    return;
  n.x = n.y = 1;
  let c, d;
  for (let m = 0; m < a; m++) {
    c = o[m], d = c.projectionDelta;
    const { visualElement: y } = c.options;
    y && y.props.style && y.props.style.display === "contents" || (i && c.options.layoutScroll && c.scroll && c !== c.root && (Jt(e.x, -c.scroll.offset.x), Jt(e.y, -c.scroll.offset.y)), d && (n.x *= d.x.scale, n.y *= d.y.scale, Av(e, d)), i && dr(c.latestValues) && ca(e, c.latestValues, (p = c.layout) == null ? void 0 : p.layoutBox));
  }
  n.x < Gh && n.x > Wh && (n.x = 1), n.y < Gh && n.y > Wh && (n.y = 1);
}
function Jt(e, n) {
  e.min += n, e.max += n;
}
function Kh(e, n, o, i, a = 0.5) {
  const c = ke(e.min, e.max, a);
  Fc(e, n, o, c, i);
}
function Yh(e, n) {
  return typeof e == "string" ? parseFloat(e) / 100 * (n.max - n.min) : e;
}
function ca(e, n, o) {
  const i = o ?? e;
  Kh(e.x, Yh(n.x, i.x), n.scaleX, n.scale, n.originX), Kh(e.y, Yh(n.y, i.y), n.scaleY, n.scale, n.originY);
}
function Cv(e, n) {
  return Tv(NT(e.getBoundingClientRect(), n));
}
function jT(e, n, o) {
  const i = Cv(e, o), { scroll: a } = n;
  return a && (Jt(i.x, a.offset.x), Jt(i.y, a.offset.y)), i;
}
const FT = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, OT = mo.length;
function LT(e, n, o) {
  let i = "", a = !0;
  for (let d = 0; d < OT; d++) {
    const p = mo[d], m = e[p];
    if (m === void 0)
      continue;
    let y = !0;
    if (typeof m == "number")
      y = m === (p.startsWith("scale") ? 1 : 0);
    else {
      const v = parseFloat(m);
      y = p.startsWith("scale") ? v === 1 : v === 0;
    }
    if (!y || o) {
      const v = Nc(m, Ta[p]);
      if (!y) {
        a = !1;
        const l = FT[p] || p;
        i += `${l}(${v}) `;
      }
      o && (n[p] = v);
    }
  }
  const c = e.pathRotation;
  return c && (a = !1, i += `rotate(${Nc(c, Ta.pathRotation)}) `), i = i.trim(), o ? i = o(n, a ? "" : i) : a && (i = "none"), i;
}
function jd(e, n, o) {
  const { style: i, vars: a, transformOrigin: c } = e;
  let d = !1, p = !1;
  for (const m in n) {
    const y = n[m];
    if (ho.has(m)) {
      d = !0;
      continue;
    } else if (Og(m)) {
      a[m] = y;
      continue;
    } else {
      const v = Nc(y, Ta[m]);
      m.startsWith("origin") ? (p = !0, c[m] = v) : i[m] = v;
    }
  }
  if (n.transform || (d || o ? i.transform = LT(n, e.transform, o) : i.transform && (i.transform = "none")), p) {
    const { originX: m = "50%", originY: y = "50%", originZ: v = 0 } = c;
    i.transformOrigin = `${m} ${y} ${v}`;
  }
}
function Pv(e, { style: n, vars: o }, i, a) {
  const c = e.style;
  let d;
  for (d in n)
    c[d] = n[d];
  a == null || a.applyProjectionStyles(c, i);
  for (d in o)
    c.setProperty(d, o[d]);
}
function Qh(e, n) {
  return n.max === n.min ? 0 : e / (n.max - n.min) * 100;
}
const si = {
  correct: (e, n) => {
    if (!n.target)
      return e;
    if (typeof e == "string")
      if (ne.test(e))
        e = parseFloat(e);
      else
        return e;
    const o = Qh(e, n.target.x), i = Qh(e, n.target.y);
    return `${o}% ${i}%`;
  }
}, VT = {
  correct: (e, { treeScale: n, projectionDelta: o }) => {
    const i = e, a = $t.parse(e);
    if (a.length > 5)
      return i;
    const c = $t.createTransformer(e), d = typeof a[0] != "number" ? 1 : 0, p = o.x.scale * n.x, m = o.y.scale * n.y;
    a[0 + d] /= p, a[1 + d] /= m;
    const y = ke(p, m, 0.5);
    return typeof a[2 + d] == "number" && (a[2 + d] /= y), typeof a[3 + d] == "number" && (a[3 + d] /= y), c(a);
  }
}, Oc = {
  borderRadius: {
    ...si,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: si,
  borderTopRightRadius: si,
  borderBottomLeftRadius: si,
  borderBottomRightRadius: si,
  boxShadow: VT
};
function Ev(e, { layout: n, layoutId: o }) {
  return ho.has(e) || e.startsWith("origin") || (n || o !== void 0) && (!!Oc[e] || e === "opacity");
}
function Fd(e, n, o) {
  var d;
  const i = e.style, a = n == null ? void 0 : n.style, c = {};
  if (!i)
    return c;
  for (const p in i)
    (Je(i[p]) || a && Je(a[p]) || Ev(p, e) || ((d = o == null ? void 0 : o.getValue(p)) == null ? void 0 : d.liveStyle) !== void 0) && (c[p] = i[p]);
  return c;
}
function BT(e) {
  return window.getComputedStyle(e);
}
class zT extends _v {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = Pv;
  }
  readValueFromInstance(n, o) {
    var i;
    if (ho.has(o))
      return (i = this.projection) != null && i.isProjecting ? _c(o) : s1(n, o);
    {
      const a = BT(n), c = (Og(o) ? a.getPropertyValue(o) : a[o]) || 0;
      return typeof c == "string" ? c.trim() : c;
    }
  }
  measureInstanceViewportBox(n, { transformPagePoint: o }) {
    return Cv(n, o);
  }
  build(n, o, i) {
    jd(n, o, i.transformTemplate);
  }
  scrapeMotionValuesFromProps(n, o, i) {
    return Fd(n, o, i);
  }
}
const UT = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, $T = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function HT(e, n, o = 1, i = 0, a = !0) {
  e.pathLength = 1;
  const c = a ? UT : $T;
  e[c.offset] = `${-i}`, e[c.array] = `${n} ${o}`;
}
const WT = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function bv(e, {
  attrX: n,
  attrY: o,
  attrScale: i,
  pathLength: a,
  pathSpacing: c = 1,
  pathOffset: d = 0,
  // This is object creation, which we try to avoid per-frame.
  ...p
}, m, y, v) {
  if (jd(e, p, y), m) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: l, style: f } = e;
  l.transform && (f.transform = l.transform, delete l.transform), (f.transform || l.transformOrigin) && (f.transformOrigin = l.transformOrigin ?? "50% 50%", delete l.transformOrigin), f.transform && (f.transformBox = (v == null ? void 0 : v.transformBox) ?? "fill-box", delete l.transformBox);
  for (const S of WT)
    l[S] !== void 0 && (f[S] = l[S], delete l[S]);
  n !== void 0 && (l.x = n), o !== void 0 && (l.y = o), i !== void 0 && (l.scale = i), a !== void 0 && HT(l, a, c, d, !1);
}
const Mv = /* @__PURE__ */ new Set([
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
]), Rv = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function GT(e, n, o, i) {
  Pv(e, n, void 0, i);
  for (const a in n.attrs)
    e.setAttribute(Mv.has(a) ? a : bd(a), n.attrs[a]);
}
function Dv(e, n, o) {
  const i = Fd(e, n, o);
  for (const a in e)
    if (Je(e[a]) || Je(n[a])) {
      const c = mo.indexOf(a) !== -1 ? "attr" + a.charAt(0).toUpperCase() + a.substring(1) : a;
      i[c] = e[a];
    }
  return i;
}
class KT extends _v {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = $e;
  }
  getBaseTargetFromProps(n, o) {
    return n[o];
  }
  readValueFromInstance(n, o) {
    if (ho.has(o)) {
      const i = fv(o);
      return i && i.default || 0;
    }
    return o = Mv.has(o) ? o : bd(o), n.getAttribute(o);
  }
  scrapeMotionValuesFromProps(n, o, i) {
    return Dv(n, o, i);
  }
  build(n, o, i) {
    bv(n, o, this.isSVGTag, i.transformTemplate, i.style);
  }
  renderInstance(n, o, i, a) {
    GT(n, o, i, a);
  }
  mount(n) {
    this.isSVGTag = Rv(n.tagName), super.mount(n);
  }
}
const YT = Id.length;
function Nv(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const o = e.parent ? Nv(e.parent) || {} : {};
    return e.props.initial !== void 0 && (o.initial = e.props.initial), o;
  }
  const n = {};
  for (let o = 0; o < YT; o++) {
    const i = Id[o], a = e.props[i];
    (gi(a) || a === !1) && (n[i] = a);
  }
  return n;
}
function Iv(e, n) {
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
const QT = [...Nd].reverse(), XT = Nd.length;
function ZT(e) {
  return (n) => Promise.all(n.map(({ animation: o, options: i }) => Y1(e, o, i)));
}
function JT(e) {
  let n = ZT(e), o = Xh(), i = !0, a = !1;
  const c = (y) => (v, l) => {
    var S;
    const f = Sr(e, l, y === "exit" ? (S = e.presenceContext) == null ? void 0 : S.custom : void 0);
    if (f) {
      const { transition: w, transitionEnd: k, ...A } = f;
      v = { ...v, ...A, ...k };
    }
    return v;
  };
  function d(y) {
    n = y(e);
  }
  function p(y) {
    const { props: v } = e, l = Nv(e.parent) || {}, f = [], S = /* @__PURE__ */ new Set();
    let w = {}, k = 1 / 0;
    for (let T = 0; T < XT; T++) {
      const E = QT[T], M = o[E], N = v[E] !== void 0 ? v[E] : l[E], O = gi(N), W = E === y ? M.isActive : null;
      W === !1 && (k = T);
      let G = N === l[E] && N !== v[E] && O;
      if (G && (i || a) && e.manuallyAnimateOnMount && (G = !1), M.protectedKeys = { ...w }, // If it isn't active and hasn't *just* been set as inactive
      !M.isActive && W === null || // If we didn't and don't have any defined prop for this animation type
      !N && !M.prevProp || // Or if the prop doesn't define an animation
      Fa(N) || typeof N == "boolean")
        continue;
      if (E === "exit" && M.isActive && W !== !0) {
        M.prevResolvedValues && (w = {
          ...w,
          ...M.prevResolvedValues
        });
        continue;
      }
      const K = qT(M.prevProp, N);
      let L = K || // If we're making this variant active, we want to always make it active
      E === y && M.isActive && !G && O || // If we removed a higher-priority variant (i is in reverse order)
      T > k && O, X = !1;
      const ae = Array.isArray(N) ? N : [N];
      let q = ae.reduce(c(E), {});
      W === !1 && (q = {});
      const { prevResolvedValues: de = {} } = M, ue = {
        ...de,
        ...q
      }, Te = (U) => {
        L = !0, S.has(U) && (X = !0, S.delete(U)), M.needsAnimating[U] = !0;
        const Z = e.getValue(U);
        Z && (Z.liveStyle = !1);
      };
      for (const U in ue) {
        const Z = q[U], Y = de[U];
        if (w.hasOwnProperty(U))
          continue;
        let D = !1;
        Ec(Z) && Ec(Y) ? D = !Iv(Z, Y) || K : D = Z !== Y, D ? Z != null ? Te(U) : S.add(U) : Z !== void 0 && S.has(U) ? Te(U) : M.protectedKeys[U] = !0;
      }
      M.prevProp = N, M.prevResolvedValues = q, M.isActive && (w = { ...w, ...q }), (i || a) && e.blockInitialAnimation && (L = !1);
      const ve = G && K;
      L && (!ve || X) && f.push(...ae.map((U) => {
        const Z = { type: E };
        if (typeof U == "string" && (i || a) && !ve && e.manuallyAnimateOnMount && e.parent) {
          const { parent: Y } = e, D = Sr(Y, U);
          if (Y.enteringChildren && D) {
            const { delayChildren: V } = D.transition || {};
            Z.delay = rv(Y.enteringChildren, e, V);
          }
        }
        return {
          animation: U,
          options: Z
        };
      }));
    }
    if (S.size) {
      const T = {};
      if (typeof v.initial != "boolean") {
        const E = Sr(e, Array.isArray(v.initial) ? v.initial[0] : v.initial);
        E && E.transition && (T.transition = E.transition);
      }
      S.forEach((E) => {
        const M = e.getBaseTarget(E), N = e.getValue(E);
        N && (N.liveStyle = !0), T[E] = M ?? null;
      }), f.push({ animation: T });
    }
    let A = !!f.length;
    return i && (v.initial === !1 || v.initial === v.animate) && !e.manuallyAnimateOnMount && (A = !1), i = !1, a = !1, A ? n(f) : Promise.resolve();
  }
  function m(y, v) {
    var f;
    if (o[y].isActive === v)
      return Promise.resolve();
    (f = e.variantChildren) == null || f.forEach((S) => {
      var w;
      return (w = S.animationState) == null ? void 0 : w.setActive(y, v);
    }), o[y].isActive = v;
    const l = p(y);
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
      o = Xh(), a = !0;
    }
  };
}
function qT(e, n) {
  return typeof n == "string" ? n !== e : Array.isArray(n) ? !Iv(n, e) : !1;
}
function cr(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Xh() {
  return {
    animate: cr(!0),
    whileInView: cr(),
    whileHover: cr(),
    whileTap: cr(),
    whileDrag: cr(),
    whileFocus: cr(),
    exit: cr()
  };
}
function Lc(e, n) {
  e.min = n.min, e.max = n.max;
}
function Bt(e, n) {
  Lc(e.x, n.x), Lc(e.y, n.y);
}
function Zh(e, n) {
  e.translate = n.translate, e.scale = n.scale, e.originPoint = n.originPoint, e.origin = n.origin;
}
const jv = 1e-4, ek = 1 - jv, tk = 1 + jv, Fv = 0.01, nk = 0 - Fv, rk = 0 + Fv;
function at(e) {
  return e.max - e.min;
}
function ok(e, n, o) {
  return Math.abs(e - n) <= o;
}
function Jh(e, n, o, i = 0.5) {
  e.origin = i, e.originPoint = ke(n.min, n.max, e.origin), e.scale = at(o) / at(n), e.translate = ke(o.min, o.max, e.origin) - e.originPoint, (e.scale >= ek && e.scale <= tk || isNaN(e.scale)) && (e.scale = 1), (e.translate >= nk && e.translate <= rk || isNaN(e.translate)) && (e.translate = 0);
}
function di(e, n, o, i) {
  Jh(e.x, n.x, o.x, i ? i.originX : void 0), Jh(e.y, n.y, o.y, i ? i.originY : void 0);
}
function qh(e, n, o, i = 0) {
  const a = i ? ke(o.min, o.max, i) : o.min;
  e.min = a + n.min, e.max = e.min + at(n);
}
function ik(e, n, o, i) {
  qh(e.x, n.x, o.x, i == null ? void 0 : i.x), qh(e.y, n.y, o.y, i == null ? void 0 : i.y);
}
function ey(e, n, o, i = 0) {
  const a = i ? ke(o.min, o.max, i) : o.min;
  e.min = n.min - a, e.max = e.min + at(n);
}
function Ca(e, n, o, i) {
  ey(e.x, n.x, o.x, i == null ? void 0 : i.x), ey(e.y, n.y, o.y, i == null ? void 0 : i.y);
}
function ty(e, n, o, i, a) {
  return e -= n, e = Aa(e, 1 / o, i), a !== void 0 && (e = Aa(e, 1 / a, i)), e;
}
function sk(e, n = 0, o = 1, i = 0.5, a, c = e, d = e) {
  if (tn.test(n) && (n = parseFloat(n), n = ke(d.min, d.max, n / 100) - d.min), typeof n != "number")
    return;
  let p = ke(c.min, c.max, i);
  e === c && (p -= n), e.min = ty(e.min, n, o, p, a), e.max = ty(e.max, n, o, p, a);
}
function ny(e, n, [o, i, a], c, d) {
  sk(e, n[o], n[i], n[a], n.scale, c, d);
}
const ak = ["x", "scaleX", "originX"], lk = ["y", "scaleY", "originY"];
function ry(e, n, o, i) {
  ny(e.x, n, ak, o ? o.x : void 0, i ? i.x : void 0), ny(e.y, n, lk, o ? o.y : void 0, i ? i.y : void 0);
}
function oy(e) {
  return e.translate === 0 && e.scale === 1;
}
function Ov(e) {
  return oy(e.x) && oy(e.y);
}
function iy(e, n) {
  return e.min === n.min && e.max === n.max;
}
function uk(e, n) {
  return iy(e.x, n.x) && iy(e.y, n.y);
}
function sy(e, n) {
  return Math.round(e.min) === Math.round(n.min) && Math.round(e.max) === Math.round(n.max);
}
function Lv(e, n) {
  return sy(e.x, n.x) && sy(e.y, n.y);
}
function ay(e) {
  return at(e.x) / at(e.y);
}
function ly(e, n) {
  return e.translate === n.translate && e.scale === n.scale && e.originPoint === n.originPoint;
}
function Zt(e) {
  return [e("x"), e("y")];
}
function ck(e, n, o) {
  let i = "";
  const a = e.x.translate / n.x, c = e.y.translate / n.y, d = (o == null ? void 0 : o.z) || 0;
  if ((a || c || d) && (i = `translate3d(${a}px, ${c}px, ${d}px) `), (n.x !== 1 || n.y !== 1) && (i += `scale(${1 / n.x}, ${1 / n.y}) `), o) {
    const { transformPerspective: y, rotate: v, pathRotation: l, rotateX: f, rotateY: S, skewX: w, skewY: k } = o;
    y && (i = `perspective(${y}px) ${i}`), v && (i += `rotate(${v}deg) `), l && (i += `rotate(${l}deg) `), f && (i += `rotateX(${f}deg) `), S && (i += `rotateY(${S}deg) `), w && (i += `skewX(${w}deg) `), k && (i += `skewY(${k}deg) `);
  }
  const p = e.x.scale * n.x, m = e.y.scale * n.y;
  return (p !== 1 || m !== 1) && (i += `scale(${p}, ${m})`), i || "none";
}
const Vv = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
], dk = Vv.length, uy = (e) => typeof e == "string" ? parseFloat(e) : e, cy = (e) => typeof e == "number" || ne.test(e);
function fk(e, n, o, i, a, c) {
  a ? (e.opacity = ke(0, o.opacity ?? 1, pk(i)), e.opacityExit = ke(n.opacity ?? 1, 0, mk(i))) : c && (e.opacity = ke(n.opacity ?? 1, o.opacity ?? 1, i));
  for (let d = 0; d < dk; d++) {
    const p = Vv[d];
    let m = dy(n, p), y = dy(o, p);
    if (m === void 0 && y === void 0)
      continue;
    m || (m = 0), y || (y = 0), m === 0 || y === 0 || cy(m) === cy(y) ? (e[p] = Math.max(ke(uy(m), uy(y), i), 0), (tn.test(y) || tn.test(m)) && (e[p] += "%")) : e[p] = y;
  }
  (n.rotate || o.rotate) && (e.rotate = ke(n.rotate || 0, o.rotate || 0, i));
}
function dy(e, n) {
  return e[n] !== void 0 ? e[n] : e.borderRadius;
}
const pk = /* @__PURE__ */ Bv(0, 0.5, Rg), mk = /* @__PURE__ */ Bv(0.5, 0.95, Dt);
function Bv(e, n, o) {
  return (i) => i < e ? 0 : i > n ? 1 : o(/* @__PURE__ */ hi(e, n, i));
}
function hk(e, n, o) {
  const i = Je(e) ? e : co(e);
  return i.start(Pd("", i, n, o)), i.animation;
}
function vi(e, n, o, i = { passive: !0 }) {
  return e.addEventListener(n, o, i), () => e.removeEventListener(n, o);
}
const yk = (e, n) => e.depth - n.depth;
class gk {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(n) {
    hd(this.children, n), this.isDirty = !0;
  }
  remove(n) {
    va(this.children, n), this.isDirty = !0;
  }
  forEach(n) {
    this.isDirty && this.children.sort(yk), this.isDirty = !1, this.children.forEach(n);
  }
}
function vk(e, n) {
  const o = st.now(), i = ({ timestamp: a }) => {
    const c = a - o;
    c >= n && (Qn(i), e(c - n));
  };
  return Ae.setup(i, !0), () => Qn(i);
}
function da(e) {
  return Je(e) ? e.get() : e;
}
class Sk {
  constructor() {
    this.members = [];
  }
  add(n) {
    hd(this.members, n);
    for (let o = this.members.length - 1; o >= 0; o--) {
      const i = this.members[o];
      if (i === n || i === this.lead || i === this.prevLead)
        continue;
      const a = i.instance;
      (!a || a.isConnected === !1) && !i.snapshot && (va(this.members, i), i.unmount());
    }
    n.scheduleRender();
  }
  remove(n) {
    if (va(this.members, n), n === this.prevLead && (this.prevLead = void 0), n === this.lead) {
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
const fa = {
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
}, Zu = ["", "X", "Y", "Z"], wk = 1e3;
let xk = 0;
function Ju(e, n, o, i) {
  const { latestValues: a } = n;
  a[e] && (o[e] = a[e], n.setStaticValue(e, 0), i && (i[e] = 0));
}
function zv(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: n } = e.options;
  if (!n)
    return;
  const o = lv(n);
  if (window.MotionHasOptimisedAnimation(o, "transform")) {
    const { layout: a, layoutId: c } = e.options;
    window.MotionCancelOptimisedAnimation(o, "transform", Ae, !(a || c));
  }
  const { parent: i } = e;
  i && !i.hasCheckedOptimisedAppear && zv(i);
}
function Uv({ attachResizeListener: e, defaultParent: n, measureScroll: o, checkIsScrollRoot: i, resetTransform: a }) {
  return class {
    constructor(d = {}, p = n == null ? void 0 : n()) {
      this.id = xk++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(kk), this.nodes.forEach(Mk), this.nodes.forEach(Rk), this.nodes.forEach(Ak);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = d, this.root = p ? p.root || p : this, this.path = p ? [...p.path, p] : [], this.parent = p, this.depth = p ? p.depth + 1 : 0;
      for (let m = 0; m < this.path.length; m++)
        this.path[m].shouldResetTransform = !0;
      this.root === this && (this.nodes = new gk());
    }
    addEventListener(d, p) {
      return this.eventHandlers.has(d) || this.eventHandlers.set(d, new yd()), this.eventHandlers.get(d).add(p);
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
      this.isSVG = Dd(d) && !TT(d), this.instance = d;
      const { layoutId: p, layout: m, visualElement: y } = this.options;
      if (y && !y.current && y.mount(d), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (m || p) && (this.isLayoutDirty = !0), e) {
        let v, l = 0;
        const f = () => this.root.updateBlockedByResize = !1;
        Ae.read(() => {
          l = window.innerWidth;
        }), e(d, () => {
          const S = window.innerWidth;
          S !== l && (l = S, this.root.updateBlockedByResize = !0, v && v(), v = vk(f, 250), fa.hasAnimatedSinceResize && (fa.hasAnimatedSinceResize = !1, this.nodes.forEach(my)));
        });
      }
      p && this.root.registerSharedNode(p, this), this.options.animate !== !1 && y && (p || m) && this.addEventListener("didUpdate", ({ delta: v, hasLayoutChanged: l, hasRelativeLayoutChanged: f, layout: S }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const w = this.options.transition || y.getDefaultTransition() || Fk, { onLayoutAnimationStart: k, onLayoutAnimationComplete: A } = y.getProps(), T = !this.targetLayout || !Lv(this.targetLayout, S), E = !l && f;
        if (this.options.layoutRoot || this.resumeFrom || E || l && (T || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const M = {
            ...Cd(w, "layout"),
            onPlay: k,
            onComplete: A
          };
          (y.shouldReduceMotion || this.options.layoutRoot) && (M.delay = 0, M.type = !1), this.startAnimation(M), this.setAnimationOrigin(v, E, M.path);
        } else
          l || my(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = S;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const d = this.getStack();
      d && d.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), Qn(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(Dk), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && zv(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let v = 0; v < this.path.length; v++) {
        const l = this.path[v];
        l.shouldResetTransform = !0, (typeof l.latestValues.x == "string" || typeof l.latestValues.y == "string") && (l.isLayoutDirty = !0), l.updateScroll("snapshot"), l.options.layoutRoot && l.willUpdate(!1);
      }
      const { layoutId: p, layout: m } = this.options;
      if (p === void 0 && !m)
        return;
      const y = this.getTransformTemplate();
      this.prevTransformTemplateValue = y ? y(this.latestValues, "") : void 0, this.updateSnapshot(), d && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const m = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), m && this.nodes.forEach(Pk), this.nodes.forEach(fy);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(py);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(Ek), this.nodes.forEach(bk), this.nodes.forEach(_k), this.nodes.forEach(Tk)) : this.nodes.forEach(py), this.clearAllSnapshots();
      const p = st.now();
      Ze.delta = rn(0, 1e3 / 60, p - Ze.timestamp), Ze.timestamp = p, Ze.isProcessing = !0, $u.update.process(Ze), $u.preRender.process(Ze), $u.render.process(Ze), Ze.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, Md.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(Ck), this.sharedNodes.forEach(Nk);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, Ae.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      Ae.postRender(() => {
        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !at(this.snapshot.measuredBox.x) && !at(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let m = 0; m < this.path.length; m++)
          this.path[m].updateScroll();
      const d = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = $e()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
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
      const d = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, p = this.projectionDelta && !Ov(this.projectionDelta), m = this.getTransformTemplate(), y = m ? m(this.latestValues, "") : void 0, v = y !== this.prevTransformTemplateValue;
      d && this.instance && (p || dr(this.latestValues) || v) && (a(this.instance, y), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(d = !0) {
      const p = this.measurePageBox();
      let m = this.removeElementScroll(p);
      return d && (m = this.removeTransform(m)), Ok(m), {
        animationId: this.root.animationId,
        measuredBox: p,
        layoutBox: m,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      var y;
      const { visualElement: d } = this.options;
      if (!d)
        return $e();
      const p = d.measureViewportBox();
      if (!(((y = this.scroll) == null ? void 0 : y.wasRoot) || this.path.some(Lk))) {
        const { scroll: v } = this.root;
        v && (Jt(p.x, v.offset.x), Jt(p.y, v.offset.y));
      }
      return p;
    }
    removeElementScroll(d) {
      var m;
      const p = $e();
      if (Bt(p, d), (m = this.scroll) != null && m.wasRoot)
        return p;
      for (let y = 0; y < this.path.length; y++) {
        const v = this.path[y], { scroll: l, options: f } = v;
        v !== this.root && l && f.layoutScroll && (l.wasRoot && Bt(p, d), Jt(p.x, l.offset.x), Jt(p.y, l.offset.y));
      }
      return p;
    }
    applyTransform(d, p = !1, m) {
      var v, l;
      const y = m || $e();
      Bt(y, d);
      for (let f = 0; f < this.path.length; f++) {
        const S = this.path[f];
        !p && S.options.layoutScroll && S.scroll && S !== S.root && (Jt(y.x, -S.scroll.offset.x), Jt(y.y, -S.scroll.offset.y)), dr(S.latestValues) && ca(y, S.latestValues, (v = S.layout) == null ? void 0 : v.layoutBox);
      }
      return dr(this.latestValues) && ca(y, this.latestValues, (l = this.layout) == null ? void 0 : l.layoutBox), y;
    }
    removeTransform(d) {
      var m;
      const p = $e();
      Bt(p, d);
      for (let y = 0; y < this.path.length; y++) {
        const v = this.path[y];
        if (!dr(v.latestValues))
          continue;
        let l;
        v.instance && (jc(v.latestValues) && v.updateSnapshot(), l = $e(), Bt(l, v.measurePageBox())), ry(p, v.latestValues, (m = v.snapshot) == null ? void 0 : m.layoutBox, l);
      }
      return dr(this.latestValues) && ry(p, this.latestValues), p;
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
      var S;
      const p = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = p.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = p.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = p.isSharedProjectionDirty);
      const m = !!this.resumingFrom || this !== p;
      if (!(d || m && this.isSharedProjectionDirty || this.isProjectionDirty || (S = this.parent) != null && S.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: v, layoutId: l } = this.options;
      if (!this.layout || !(v || l))
        return;
      this.resolvedRelativeTargetAt = Ze.timestamp;
      const f = this.getClosestProjectingParent();
      f && this.linkedParentVersion !== f.layoutVersion && !f.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && f && f.layout ? this.createRelativeTarget(f, this.layout.layoutBox, f.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = $e(), this.targetWithTransforms = $e()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), ik(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : Bt(this.target, this.layout.layoutBox), Av(this.target, this.targetDelta)) : Bt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? this.createRelativeTarget(f, this.target, f.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || jc(this.parent.latestValues) || kv(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(d, p, m) {
      this.relativeParent = d, this.linkedParentVersion = d.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = $e(), this.relativeTargetOrigin = $e(), Ca(this.relativeTargetOrigin, p, m, this.options.layoutAnchor || void 0), Bt(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      var w;
      const d = this.getLead(), p = !!this.resumingFrom || this !== d;
      let m = !0;
      if ((this.isProjectionDirty || (w = this.parent) != null && w.isProjectionDirty) && (m = !1), p && (this.isSharedProjectionDirty || this.isTransformDirty) && (m = !1), this.resolvedRelativeTargetAt === Ze.timestamp && (m = !1), m)
        return;
      const { layout: y, layoutId: v } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(y || v))
        return;
      Bt(this.layoutCorrected, this.layout.layoutBox);
      const l = this.treeScale.x, f = this.treeScale.y;
      IT(this.layoutCorrected, this.treeScale, this.path, p), d.layout && !d.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (d.target = d.layout.layoutBox, d.targetWithTransforms = $e());
      const { target: S } = d;
      if (!S) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Zh(this.prevProjectionDelta.x, this.projectionDelta.x), Zh(this.prevProjectionDelta.y, this.projectionDelta.y)), di(this.projectionDelta, this.layoutCorrected, S, this.latestValues), (this.treeScale.x !== l || this.treeScale.y !== f || !ly(this.projectionDelta.x, this.prevProjectionDelta.x) || !ly(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", S));
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
      this.prevProjectionDelta = io(), this.projectionDelta = io(), this.projectionDeltaWithTransform = io();
    }
    setAnimationOrigin(d, p = !1, m) {
      const y = this.snapshot, v = y ? y.latestValues : {}, l = { ...this.latestValues }, f = io();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !p;
      const S = $e(), w = y ? y.source : void 0, k = this.layout ? this.layout.source : void 0, A = w !== k, T = this.getStack(), E = !T || T.members.length <= 1, M = !!(A && !E && this.options.crossfade === !0 && !this.path.some(jk));
      this.animationProgress = 0;
      let N;
      const O = m == null ? void 0 : m.interpolateProjection(d);
      this.mixTargetDelta = (W) => {
        const G = W / 1e3, K = O == null ? void 0 : O(G);
        K ? (f.x.translate = K.x, f.x.scale = ke(d.x.scale, 1, G), f.x.origin = d.x.origin, f.x.originPoint = d.x.originPoint, f.y.translate = K.y, f.y.scale = ke(d.y.scale, 1, G), f.y.origin = d.y.origin, f.y.originPoint = d.y.originPoint) : (hy(f.x, d.x, G), hy(f.y, d.y, G)), this.setTargetDelta(f), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (Ca(S, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), Ik(this.relativeTarget, this.relativeTargetOrigin, S, G), N && uk(this.relativeTarget, N) && (this.isProjectionDirty = !1), N || (N = $e()), Bt(N, this.relativeTarget)), A && (this.animationValues = l, fk(l, v, this.latestValues, G, M, E)), K && K.rotate !== void 0 && (this.animationValues || (this.animationValues = l), this.animationValues.pathRotation = K.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = G;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(d) {
      var p, m, y;
      this.notifyListeners("animationStart"), (p = this.currentAnimation) == null || p.stop(), (y = (m = this.resumingFrom) == null ? void 0 : m.currentAnimation) == null || y.stop(), this.pendingAnimation && (Qn(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Ae.update(() => {
        fa.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = co(0)), this.motionValue.jump(0, !1), this.currentAnimation = hk(this.motionValue, [0, 1e3], {
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(wk), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const d = this.getLead();
      let { targetWithTransforms: p, target: m, layout: y, latestValues: v } = d;
      if (!(!p || !m || !y)) {
        if (this !== d && this.layout && y && $v(this.options.animationType, this.layout.layoutBox, y.layoutBox)) {
          m = this.target || $e();
          const l = at(this.layout.layoutBox.x);
          m.x.min = d.target.x.min, m.x.max = m.x.min + l;
          const f = at(this.layout.layoutBox.y);
          m.y.min = d.target.y.min, m.y.max = m.y.min + f;
        }
        Bt(p, m), ca(p, v), di(this.projectionDeltaWithTransform, this.layoutCorrected, p, v);
      }
    }
    registerSharedNode(d, p) {
      this.sharedNodes.has(d) || this.sharedNodes.set(d, new Sk()), this.sharedNodes.get(d).add(p);
      const y = p.options.initialPromotionConfig;
      p.promote({
        transition: y ? y.transition : void 0,
        preserveFollowOpacity: y && y.shouldPreserveFollowOpacity ? y.shouldPreserveFollowOpacity(p) : void 0
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
      const y = this.getStack();
      y && y.promote(this, m), d && (this.projectionDelta = void 0, this.needsReset = !0), p && this.setOptions({ transition: p });
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
      const y = {};
      m.z && Ju("z", d, y, this.animationValues);
      for (let v = 0; v < Zu.length; v++)
        Ju(`rotate${Zu[v]}`, d, y, this.animationValues), Ju(`skew${Zu[v]}`, d, y, this.animationValues);
      d.render();
      for (const v in y)
        d.setStaticValue(v, y[v]), this.animationValues && (this.animationValues[v] = y[v]);
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
        this.needsReset = !1, d.visibility = "", d.opacity = "", d.pointerEvents = da(p == null ? void 0 : p.pointerEvents) || "", d.transform = m ? m(this.latestValues, "") : "none";
        return;
      }
      const y = this.getLead();
      if (!this.projectionDelta || !this.layout || !y.target) {
        this.options.layoutId && (d.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, d.pointerEvents = da(p == null ? void 0 : p.pointerEvents) || ""), this.hasProjected && !dr(this.latestValues) && (d.transform = m ? m({}, "") : "none", this.hasProjected = !1);
        return;
      }
      d.visibility = "";
      const v = y.animationValues || y.latestValues;
      this.applyTransformsToTarget();
      let l = ck(this.projectionDeltaWithTransform, this.treeScale, v);
      m && (l = m(v, l)), d.transform = l;
      const { x: f, y: S } = this.projectionDelta;
      d.transformOrigin = `${f.origin * 100}% ${S.origin * 100}% 0`, y.animationValues ? d.opacity = y === this ? v.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : v.opacityExit : d.opacity = y === this ? v.opacity !== void 0 ? v.opacity : "" : v.opacityExit !== void 0 ? v.opacityExit : 0;
      for (const w in Oc) {
        if (v[w] === void 0)
          continue;
        const { correct: k, applyTo: A, isCSSVariable: T } = Oc[w], E = l === "none" ? v[w] : k(v[w], y);
        if (A) {
          const M = A.length;
          for (let N = 0; N < M; N++)
            d[A[N]] = E;
        } else
          T ? this.options.visualElement.renderState.vars[w] = E : d[w] = E;
      }
      this.options.layoutId && (d.pointerEvents = y === this ? da(p == null ? void 0 : p.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((d) => {
        var p;
        return (p = d.currentAnimation) == null ? void 0 : p.stop();
      }), this.root.nodes.forEach(fy), this.root.sharedNodes.clear();
    }
  };
}
function _k(e) {
  e.updateLayout();
}
function Tk(e) {
  var o;
  const n = ((o = e.resumeFrom) == null ? void 0 : o.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: i, measuredBox: a } = e.layout, { animationType: c } = e.options, d = n.source !== e.layout.source;
    if (c === "size")
      Zt((l) => {
        const f = d ? n.measuredBox[l] : n.layoutBox[l], S = at(f);
        f.min = i[l].min, f.max = f.min + S;
      });
    else if (c === "x" || c === "y") {
      const l = c === "x" ? "y" : "x";
      Lc(d ? n.measuredBox[l] : n.layoutBox[l], i[l]);
    } else $v(c, n.layoutBox, i) && Zt((l) => {
      const f = d ? n.measuredBox[l] : n.layoutBox[l], S = at(i[l]);
      f.max = f.min + S, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[l].max = e.relativeTarget[l].min + S);
    });
    const p = io();
    di(p, i, n.layoutBox);
    const m = io();
    d ? di(m, e.applyTransform(a, !0), n.measuredBox) : di(m, i, n.layoutBox);
    const y = !Ov(p);
    let v = !1;
    if (!e.resumeFrom) {
      const l = e.getClosestProjectingParent();
      if (l && !l.resumeFrom) {
        const { snapshot: f, layout: S } = l;
        if (f && S) {
          const w = e.options.layoutAnchor || void 0, k = $e();
          Ca(k, n.layoutBox, f.layoutBox, w);
          const A = $e();
          Ca(A, i, S.layoutBox, w), Lv(k, A) || (v = !0), l.options.layoutRoot && (e.relativeTarget = A, e.relativeTargetOrigin = k, e.relativeParent = l);
        }
      }
    }
    e.notifyListeners("didUpdate", {
      layout: i,
      snapshot: n,
      delta: m,
      layoutDelta: p,
      hasLayoutChanged: y,
      hasRelativeLayoutChanged: v
    });
  } else if (e.isLead()) {
    const { onExitComplete: i } = e.options;
    i && i();
  }
  e.options.transition = void 0;
}
function kk(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function Ak(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function Ck(e) {
  e.clearSnapshot();
}
function fy(e) {
  e.clearMeasurements();
}
function Pk(e) {
  e.isLayoutDirty = !0, e.updateLayout();
}
function py(e) {
  e.isLayoutDirty = !1;
}
function Ek(e) {
  e.isAnimationBlocked && e.layout && !e.isLayoutDirty && (e.snapshot = e.layout, e.isLayoutDirty = !0);
}
function bk(e) {
  const { visualElement: n } = e.options;
  n && n.getProps().onBeforeLayoutMeasure && n.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function my(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function Mk(e) {
  e.resolveTargetDelta();
}
function Rk(e) {
  e.calcProjection();
}
function Dk(e) {
  e.resetSkewAndRotation();
}
function Nk(e) {
  e.removeLeadSnapshot();
}
function hy(e, n, o) {
  e.translate = ke(n.translate, 0, o), e.scale = ke(n.scale, 1, o), e.origin = n.origin, e.originPoint = n.originPoint;
}
function yy(e, n, o, i) {
  e.min = ke(n.min, o.min, i), e.max = ke(n.max, o.max, i);
}
function Ik(e, n, o, i) {
  yy(e.x, n.x, o.x, i), yy(e.y, n.y, o.y, i);
}
function jk(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const Fk = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, gy = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), vy = gy("applewebkit/") && !gy("chrome/") ? Math.round : Dt;
function Sy(e) {
  e.min = vy(e.min), e.max = vy(e.max);
}
function Ok(e) {
  Sy(e.x), Sy(e.y);
}
function $v(e, n, o) {
  return e === "position" || e === "preserve-aspect" && !ok(ay(n), ay(o), 0.2);
}
function Lk(e) {
  var n;
  return e !== e.root && ((n = e.scroll) == null ? void 0 : n.wasRoot);
}
const Vk = Uv({
  attachResizeListener: (e, n) => vi(e, "resize", n),
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
}, Hv = Uv({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!qu.current) {
      const e = new Vk({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), qu.current = e;
    }
    return qu.current;
  },
  resetTransform: (e, n) => {
    e.style.transform = n !== void 0 ? n : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), Od = C.createContext({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
function wy(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function Bk(...e) {
  return (n) => {
    let o = !1;
    const i = e.map((a) => {
      const c = wy(a, n);
      return !o && typeof c == "function" && (o = !0), c;
    });
    if (o)
      return () => {
        for (let a = 0; a < i.length; a++) {
          const c = i[a];
          typeof c == "function" ? c() : wy(e[a], null);
        }
      };
  };
}
function zk(...e) {
  return C.useCallback(Bk(...e), e);
}
class Uk extends C.Component {
  getSnapshotBeforeUpdate(n) {
    const o = this.props.childRef.current;
    if (sa(o) && n.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const i = o.offsetParent, a = sa(i) && i.offsetWidth || 0, c = sa(i) && i.offsetHeight || 0, d = getComputedStyle(o), p = this.props.sizeRef.current;
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
function $k({ children: e, isPresent: n, anchorX: o, anchorY: i, root: a, pop: c }) {
  var f;
  const d = C.useId(), p = C.useRef(null), m = C.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: y } = C.useContext(Od), v = ((f = e.props) == null ? void 0 : f.ref) ?? (e == null ? void 0 : e.ref), l = zk(p, v);
  return C.useInsertionEffect(() => {
    const { width: S, height: w, top: k, left: A, right: T, bottom: E, direction: M } = m.current;
    if (n || c === !1 || !p.current || !S || !w)
      return;
    const N = M === "rtl", O = o === "left" ? N ? `right: ${T}` : `left: ${A}` : N ? `left: ${A}` : `right: ${T}`, W = i === "bottom" ? `bottom: ${E}` : `top: ${k}`;
    p.current.dataset.motionPopId = d;
    const G = document.createElement("style");
    y && (G.nonce = y);
    const K = a ?? document.head;
    return K.appendChild(G), G.sheet && G.sheet.insertRule(`
          [data-motion-pop-id="${d}"] {
            position: absolute !important;
            width: ${S}px !important;
            height: ${w}px !important;
            ${O}px !important;
            ${W}px !important;
          }
        `), () => {
      var L;
      (L = p.current) == null || L.removeAttribute("data-motion-pop-id"), K.contains(G) && K.removeChild(G);
    };
  }, [n]), x.jsx(Uk, { isPresent: n, childRef: p, sizeRef: m, pop: c, children: c === !1 ? e : C.cloneElement(e, { ref: l }) });
}
const Hk = ({ children: e, initial: n, isPresent: o, onExitComplete: i, custom: a, presenceAffectsLayout: c, mode: d, anchorX: p, anchorY: m, root: y }) => {
  const v = md(Wk), l = C.useId();
  let f = !0, S = C.useMemo(() => (f = !1, {
    id: l,
    initial: n,
    isPresent: o,
    custom: a,
    onExitComplete: (w) => {
      v.set(w, !0);
      for (const k of v.values())
        if (!k)
          return;
      i && i();
    },
    register: (w) => (v.set(w, !1), () => v.delete(w))
  }), [o, v, i]);
  return c && f && (S = { ...S }), C.useMemo(() => {
    v.forEach((w, k) => v.set(k, !1));
  }, [o]), C.useEffect(() => {
    !o && !v.size && i && i();
  }, [o]), e = x.jsx($k, { pop: d === "popLayout", isPresent: o, anchorX: p, anchorY: m, root: y, children: e }), x.jsx(Ia.Provider, { value: S, children: e });
};
function Wk() {
  return /* @__PURE__ */ new Map();
}
function Wv(e = !0) {
  const n = C.useContext(Ia);
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
const Gs = (e) => e.key || "";
function xy(e) {
  const n = [];
  return C.Children.forEach(e, (o) => {
    C.isValidElement(o) && n.push(o);
  }), n;
}
const La = ({ children: e, custom: n, initial: o = !0, onExitComplete: i, presenceAffectsLayout: a = !0, mode: c = "sync", propagate: d = !1, anchorX: p = "left", anchorY: m = "top", root: y }) => {
  const [v, l] = Wv(d), f = C.useMemo(() => xy(e), [e]), S = d && !v ? [] : f.map(Gs), w = C.useRef(!0), k = C.useRef(f), A = md(() => /* @__PURE__ */ new Map()), T = C.useRef(/* @__PURE__ */ new Set()), [E, M] = C.useState(f), [N, O] = C.useState(f);
  Sg(() => {
    w.current = !1, k.current = f;
    for (let K = 0; K < N.length; K++) {
      const L = Gs(N[K]);
      S.includes(L) ? (A.delete(L), T.current.delete(L)) : A.get(L) !== !0 && A.set(L, !1);
    }
  }, [N, S.length, S.join("-")]);
  const W = [];
  if (f !== E) {
    let K = [...f];
    for (let L = 0; L < N.length; L++) {
      const X = N[L], ae = Gs(X);
      S.includes(ae) || (K.splice(L, 0, X), W.push(X));
    }
    return c === "wait" && W.length && (K = W), O(xy(K)), M(f), null;
  }
  const { forceRender: G } = C.useContext(pd);
  return x.jsx(x.Fragment, { children: N.map((K) => {
    const L = Gs(K), X = d && !v ? !1 : f === N || S.includes(L), ae = () => {
      if (T.current.has(L))
        return;
      if (A.has(L))
        T.current.add(L), A.set(L, !0);
      else
        return;
      let q = !0;
      A.forEach((de) => {
        de || (q = !1);
      }), q && (G == null || G(), O(k.current), d && (l == null || l()), i && i());
    };
    return x.jsx(Hk, { isPresent: X, initial: !w.current || o ? void 0 : !1, custom: n, presenceAffectsLayout: a, mode: c, root: y, onExitComplete: X ? void 0 : ae, anchorX: p, anchorY: m, children: K }, L);
  }) });
}, Gv = C.createContext({ strict: !1 }), _y = {
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
let Ty = !1;
function Gk() {
  if (Ty)
    return;
  const e = {};
  for (const n in _y)
    e[n] = {
      isEnabled: (o) => _y[n].some((i) => !!o[i])
    };
  xv(e), Ty = !0;
}
function Kv() {
  return Gk(), MT();
}
function Kk(e) {
  const n = Kv();
  for (const o in e)
    n[o] = {
      ...n[o],
      ...e[o]
    };
  xv(n);
}
const Yk = /* @__PURE__ */ new Set([
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
function Pa(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || Yk.has(e);
}
let Yv = (e) => !Pa(e);
function Qk(e) {
  typeof e == "function" && (Yv = (n) => n.startsWith("on") ? !Pa(n) : e(n));
}
try {
  Qk(require("@emotion/is-prop-valid").default);
} catch {
}
function Xk(e, n, o) {
  const i = {};
  for (const a in e)
    a === "values" && typeof e.values == "object" || Je(e[a]) || (Yv(a) || o === !0 && Pa(a) || !n && !Pa(a) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && a.startsWith("onDrag")) && (i[a] = e[a]);
  return i;
}
const Va = /* @__PURE__ */ C.createContext({});
function Zk(e, n) {
  if (Oa(e)) {
    const { initial: o, animate: i } = e;
    return {
      initial: o === !1 || gi(o) ? o : void 0,
      animate: gi(i) ? i : void 0
    };
  }
  return e.inherit !== !1 ? n : {};
}
function Jk(e) {
  const { initial: n, animate: o } = Zk(e, C.useContext(Va));
  return C.useMemo(() => ({ initial: n, animate: o }), [ky(n), ky(o)]);
}
function ky(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const Ld = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function Qv(e, n, o) {
  for (const i in n)
    !Je(n[i]) && !Ev(i, o) && (e[i] = n[i]);
}
function qk({ transformTemplate: e }, n) {
  return C.useMemo(() => {
    const o = Ld();
    return jd(o, n, e), Object.assign({}, o.vars, o.style);
  }, [n]);
}
function eA(e, n) {
  const o = e.style || {}, i = {};
  return Qv(i, o, e), Object.assign(i, qk(e, n)), i;
}
function tA(e, n) {
  const o = {}, i = eA(e, n);
  return e.drag && e.dragListener !== !1 && (o.draggable = !1, i.userSelect = i.WebkitUserSelect = i.WebkitTouchCallout = "none", i.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (o.tabIndex = 0), o.style = i, o;
}
const Xv = () => ({
  ...Ld(),
  attrs: {}
});
function nA(e, n, o, i) {
  const a = C.useMemo(() => {
    const c = Xv();
    return bv(c, n, Rv(i), e.transformTemplate, e.style), {
      ...c.attrs,
      style: { ...c.style }
    };
  }, [n]);
  if (e.style) {
    const c = {};
    Qv(c, e.style, e), a.style = { ...c, ...a.style };
  }
  return a;
}
const rA = [
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
function Vd(e) {
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
      !!(rA.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function oA(e, n, o, { latestValues: i }, a, c = !1, d) {
  const m = (d ?? Vd(e) ? nA : tA)(n, i, a, e), y = Xk(n, typeof e == "string", c), v = e !== C.Fragment ? { ...y, ...m, ref: o } : {}, { children: l } = n, f = C.useMemo(() => Je(l) ? l.get() : l, [l]);
  return C.createElement(e, {
    ...v,
    children: f
  });
}
function iA({ scrapeMotionValuesFromProps: e, createRenderState: n }, o, i, a) {
  return {
    latestValues: sA(o, i, a, e),
    renderState: n()
  };
}
function sA(e, n, o, i) {
  const a = {}, c = i(e, {});
  for (const f in c)
    a[f] = da(c[f]);
  let { initial: d, animate: p } = e;
  const m = Oa(e), y = Sv(e);
  n && y && !m && e.inherit !== !1 && (d === void 0 && (d = n.initial), p === void 0 && (p = n.animate));
  let v = o ? o.initial === !1 : !1;
  v = v || d === !1;
  const l = v ? p : d;
  if (l && typeof l != "boolean" && !Fa(l)) {
    const f = Array.isArray(l) ? l : [l];
    for (let S = 0; S < f.length; S++) {
      const w = Ed(e, f[S]);
      if (w) {
        const { transitionEnd: k, transition: A, ...T } = w;
        for (const E in T) {
          let M = T[E];
          if (Array.isArray(M)) {
            const N = v ? M.length - 1 : 0;
            M = M[N];
          }
          M !== null && (a[E] = M);
        }
        for (const E in k)
          a[E] = k[E];
      }
    }
  }
  return a;
}
const Zv = (e) => (n, o) => {
  const i = C.useContext(Va), a = C.useContext(Ia), c = () => iA(e, n, i, a);
  return o ? c() : md(c);
}, aA = /* @__PURE__ */ Zv({
  scrapeMotionValuesFromProps: Fd,
  createRenderState: Ld
}), lA = /* @__PURE__ */ Zv({
  scrapeMotionValuesFromProps: Dv,
  createRenderState: Xv
}), uA = Symbol.for("motionComponentSymbol");
function cA(e, n, o) {
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
const Jv = C.createContext({});
function to(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function dA(e, n, o, i, a, c) {
  var M, N;
  const { visualElement: d } = C.useContext(Va), p = C.useContext(Gv), m = C.useContext(Ia), y = C.useContext(Od), v = y.reducedMotion, l = y.skipAnimations, f = C.useRef(null), S = C.useRef(!1);
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
  const w = f.current, k = C.useContext(Jv);
  w && !w.projection && a && (w.type === "html" || w.type === "svg") && fA(f.current, o, a, k);
  const A = C.useRef(!1);
  C.useInsertionEffect(() => {
    w && A.current && w.update(o, m);
  });
  const T = o[av], E = C.useRef(!!T && typeof window < "u" && !((M = window.MotionHandoffIsComplete) != null && M.call(window, T)) && ((N = window.MotionHasOptimisedAnimation) == null ? void 0 : N.call(window, T)));
  return Sg(() => {
    S.current = !0, w && (A.current = !0, window.MotionIsMounted = !0, w.updateFeatures(), w.scheduleRenderMicrotask(), E.current && w.animationState && w.animationState.animateChanges());
  }), C.useEffect(() => {
    w && (!E.current && w.animationState && w.animationState.animateChanges(), E.current && (queueMicrotask(() => {
      var O;
      (O = window.MotionHandoffMarkAsComplete) == null || O.call(window, T);
    }), E.current = !1), w.enteringChildren = void 0);
  }), w;
}
function fA(e, n, o, i) {
  const { layoutId: a, layout: c, drag: d, dragConstraints: p, layoutScroll: m, layoutRoot: y, layoutAnchor: v, layoutCrossfade: l } = n;
  e.projection = new o(e.latestValues, n["data-framer-portal-id"] ? void 0 : qv(e.parent)), e.projection.setOptions({
    layoutId: a,
    layout: c,
    alwaysMeasureLayout: !!d || p && to(p),
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
    layoutRoot: y,
    layoutAnchor: v
  });
}
function qv(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : qv(e.parent);
}
function ec(e, { forwardMotionProps: n = !1, type: o } = {}, i, a) {
  i && Kk(i);
  const c = o ? o === "svg" : Vd(e), d = c ? lA : aA;
  function p(y, v) {
    let l;
    const f = {
      ...C.useContext(Od),
      ...y,
      layoutId: pA(y)
    }, { isStatic: S } = f, w = Jk(y), k = d(y, S);
    if (!S && typeof window < "u") {
      mA();
      const A = hA(f);
      l = A.MeasureLayout, w.visualElement = dA(e, k, f, a, A.ProjectionNode, c);
    }
    return x.jsxs(Va.Provider, { value: w, children: [l && w.visualElement ? x.jsx(l, { visualElement: w.visualElement, ...f }) : null, oA(e, y, cA(k, w.visualElement, v), k, S, n, c)] });
  }
  p.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const m = C.forwardRef(p);
  return m[uA] = e, m;
}
function pA({ layoutId: e }) {
  const n = C.useContext(pd).id;
  return n && e !== void 0 ? n + "-" + e : e;
}
function mA(e, n) {
  C.useContext(Gv).strict;
}
function hA(e) {
  const n = Kv(), { drag: o, layout: i } = n;
  if (!o && !i)
    return {};
  const a = { ...o, ...i };
  return {
    MeasureLayout: o != null && o.isEnabled(e) || i != null && i.isEnabled(e) ? a.MeasureLayout : void 0,
    ProjectionNode: a.ProjectionNode
  };
}
function yA(e, n) {
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
const gA = (e, n) => n.isSVG ?? Vd(e) ? new KT(n) : new zT(n, {
  allowProjection: e !== C.Fragment
});
class vA extends Xn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(n) {
    super(n), n.animationState || (n.animationState = JT(n));
  }
  updateAnimationControlsSubscription() {
    const { animate: n } = this.node.getProps();
    Fa(n) && (this.unmountControls = n.subscribe(this.node));
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
let SA = 0;
class wA extends Xn {
  constructor() {
    super(...arguments), this.id = SA++, this.isExitComplete = !1;
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
          const m = Sr(this.node, d, p);
          if (m) {
            const { transition: y, transitionEnd: v, ...l } = m;
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
const xA = {
  animation: {
    Feature: vA
  },
  exit: {
    Feature: wA
  }
};
function Ei(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const _A = (e) => (n) => Rd(n) && e(n, Ei(n));
function fi(e, n, o, i) {
  return vi(e, n, _A(o), i);
}
const e0 = ({ current: e }) => e ? e.ownerDocument.defaultView : null, Ay = (e, n) => Math.abs(e - n);
function TA(e, n) {
  const o = Ay(e.x, n.x), i = Ay(e.y, n.y);
  return Math.sqrt(o ** 2 + i ** 2);
}
const Cy = /* @__PURE__ */ new Set(["auto", "scroll"]);
class t0 {
  constructor(n, o, { transformPagePoint: i, contextWindow: a = window, dragSnapToOrigin: c = !1, distanceThreshold: d = 3, element: p } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (S) => {
      this.handleScroll(S.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = Ks(this.lastRawMoveEventInfo, this.transformPagePoint));
      const S = tc(this.lastMoveEventInfo, this.history), w = this.startEvent !== null, k = TA(S.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!w && !k)
        return;
      const { point: A } = S, { timestamp: T } = Ze;
      this.history.push({ ...A, timestamp: T });
      const { onStart: E, onMove: M } = this.handlers;
      w || (E && E(this.lastMoveEvent, S), this.startEvent = this.lastMoveEvent), M && M(this.lastMoveEvent, S);
    }, this.handlePointerMove = (S, w) => {
      this.lastMoveEvent = S, this.lastRawMoveEventInfo = w, this.lastMoveEventInfo = Ks(w, this.transformPagePoint), Ae.update(this.updatePoint, !0);
    }, this.handlePointerUp = (S, w) => {
      this.end();
      const { onEnd: k, onSessionEnd: A, resumeAnimation: T } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && T && T(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const E = tc(S.type === "pointercancel" ? this.lastMoveEventInfo : Ks(w, this.transformPagePoint), this.history);
      this.startEvent && k && k(S, E), A && A(S, E);
    }, !Rd(n))
      return;
    this.dragSnapToOrigin = c, this.handlers = o, this.transformPagePoint = i, this.distanceThreshold = d, this.contextWindow = a || window;
    const m = Ei(n), y = Ks(m, this.transformPagePoint), { point: v } = y, { timestamp: l } = Ze;
    this.history = [{ ...v, timestamp: l }];
    const { onSessionStart: f } = o;
    f && f(n, tc(y, this.history)), this.removeListeners = Ai(fi(this.contextWindow, "pointermove", this.handlePointerMove), fi(this.contextWindow, "pointerup", this.handlePointerUp), fi(this.contextWindow, "pointercancel", this.handlePointerUp)), p && this.startScrollTracking(p);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(n) {
    let o = n.parentElement;
    for (; o; ) {
      const i = getComputedStyle(o);
      (Cy.has(i.overflowX) || Cy.has(i.overflowY)) && this.scrollPositions.set(o, {
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
    c.x === 0 && c.y === 0 || (i ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += c.x, this.lastMoveEventInfo.point.y += c.y) : this.history.length > 0 && (this.history[0].x -= c.x, this.history[0].y -= c.y), this.scrollPositions.set(n, a), Ae.update(this.updatePoint, !0));
  }
  updateHandlers(n) {
    this.handlers = n;
  }
  end() {
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), Qn(this.updatePoint);
  }
}
function Ks(e, n) {
  return n ? { point: n(e.point) } : e;
}
function Py(e, n) {
  return { x: e.x - n.x, y: e.y - n.y };
}
function tc({ point: e }, n) {
  return {
    point: e,
    delta: Py(e, n0(n)),
    offset: Py(e, kA(n)),
    velocity: AA(n, 0.1)
  };
}
function kA(e) {
  return e[0];
}
function n0(e) {
  return e[e.length - 1];
}
function AA(e, n) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let o = e.length - 1, i = null;
  const a = n0(e);
  for (; o >= 0 && (i = e[o], !(a.timestamp - i.timestamp > /* @__PURE__ */ ht(n))); )
    o--;
  if (!i)
    return { x: 0, y: 0 };
  i === e[0] && e.length > 2 && a.timestamp - i.timestamp > /* @__PURE__ */ ht(n) * 2 && (i = e[1]);
  const c = /* @__PURE__ */ Rt(a.timestamp - i.timestamp);
  if (c === 0)
    return { x: 0, y: 0 };
  const d = {
    x: (a.x - i.x) / c,
    y: (a.y - i.y) / c
  };
  return d.x === 1 / 0 && (d.x = 0), d.y === 1 / 0 && (d.y = 0), d;
}
function CA(e, { min: n, max: o }, i) {
  return n !== void 0 && e < n ? e = i ? ke(n, e, i.min) : Math.max(e, n) : o !== void 0 && e > o && (e = i ? ke(o, e, i.max) : Math.min(e, o)), e;
}
function Ey(e, n, o) {
  return {
    min: n !== void 0 ? e.min + n : void 0,
    max: o !== void 0 ? e.max + o - (e.max - e.min) : void 0
  };
}
function PA(e, { top: n, left: o, bottom: i, right: a }) {
  return {
    x: Ey(e.x, o, a),
    y: Ey(e.y, n, i)
  };
}
function by(e, n) {
  let o = n.min - e.min, i = n.max - e.max;
  return n.max - n.min < e.max - e.min && ([o, i] = [i, o]), { min: o, max: i };
}
function EA(e, n) {
  return {
    x: by(e.x, n.x),
    y: by(e.y, n.y)
  };
}
function bA(e, n) {
  let o = 0.5;
  const i = at(e), a = at(n);
  return a > i ? o = /* @__PURE__ */ hi(n.min, n.max - i, e.min) : i > a && (o = /* @__PURE__ */ hi(e.min, e.max - a, n.min)), rn(0, 1, o);
}
function MA(e, n) {
  const o = {};
  return n.min !== void 0 && (o.min = n.min - e.min), n.max !== void 0 && (o.max = n.max - e.min), o;
}
const Vc = 0.35;
function RA(e = Vc) {
  return e === !1 ? e = 0 : e === !0 && (e = Vc), {
    x: My(e, "left", "right"),
    y: My(e, "top", "bottom")
  };
}
function My(e, n, o) {
  return {
    min: Ry(e, n),
    max: Ry(e, o)
  };
}
function Ry(e, n) {
  return typeof e == "number" ? e : e[n] || 0;
}
const DA = /* @__PURE__ */ new WeakMap();
class NA {
  constructor(n) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = $e(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = n;
  }
  start(n, { snapToCursor: o = !1, distanceThreshold: i } = {}) {
    const { presenceContext: a } = this.visualElement;
    if (a && a.isPresent === !1)
      return;
    const c = (l) => {
      o && this.snapToCursor(Ei(l).point), this.stopAnimation();
    }, d = (l, f) => {
      const { drag: S, dragPropagation: w, onDragStart: k } = this.getProps();
      if (S && !w && (this.openDragLock && this.openDragLock(), this.openDragLock = sT(S), !this.openDragLock))
        return;
      this.latestPointerEvent = l, this.latestPanInfo = f, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Zt((T) => {
        let E = this.getAxisMotionValue(T).get() || 0;
        if (tn.test(E)) {
          const { projection: M } = this.visualElement;
          if (M && M.layout) {
            const N = M.layout.layoutBox[T];
            N && (E = at(N) * (parseFloat(E) / 100));
          }
        }
        this.originPoint[T] = E;
      }), k && Ae.update(() => k(l, f), !1, !0), bc(this.visualElement, "transform");
      const { animationState: A } = this.visualElement;
      A && A.setActive("whileDrag", !0);
    }, p = (l, f) => {
      this.latestPointerEvent = l, this.latestPanInfo = f;
      const { dragPropagation: S, dragDirectionLock: w, onDirectionLock: k, onDrag: A } = this.getProps();
      if (!S && !this.openDragLock)
        return;
      const { offset: T } = f;
      if (w && this.currentDirection === null) {
        this.currentDirection = jA(T), this.currentDirection !== null && k && k(this.currentDirection);
        return;
      }
      this.updateAxis("x", f.point, T), this.updateAxis("y", f.point, T), this.visualElement.render(), A && Ae.update(() => A(l, f), !1, !0);
    }, m = (l, f) => {
      this.latestPointerEvent = l, this.latestPanInfo = f, this.stop(l, f), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, y = () => {
      const { dragSnapToOrigin: l } = this.getProps();
      (l || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: v } = this.getProps();
    this.panSession = new t0(n, {
      onSessionStart: c,
      onStart: d,
      onMove: p,
      onSessionEnd: m,
      resumeAnimation: y
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: v,
      distanceThreshold: i,
      contextWindow: e0(this.visualElement),
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
    p && Ae.postRender(() => p(i, a));
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
    if (!i || !Ys(n, a, this.currentDirection))
      return;
    const c = this.getAxisMotionValue(n);
    let d = this.originPoint[n] + i[n];
    this.constraints && this.constraints[n] && (d = CA(d, this.constraints[n], this.elastic[n])), c.set(d);
  }
  resolveConstraints() {
    var c;
    const { dragConstraints: n, dragElastic: o } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (c = this.visualElement.projection) == null ? void 0 : c.layout, a = this.constraints;
    n && to(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && i ? this.constraints = PA(i.layoutBox, n) : this.constraints = !1, this.elastic = RA(o), a !== this.constraints && !to(n) && i && this.constraints && !this.hasMutatedConstraints && Zt((d) => {
      this.constraints !== !1 && this.getAxisMotionValue(d) && (this.constraints[d] = MA(i.layoutBox[d], this.constraints[d]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: n, onMeasureDragConstraints: o } = this.getProps();
    if (!n || !to(n))
      return !1;
    const i = n.current;
    Tr(i !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: a } = this.visualElement;
    if (!a || !a.layout)
      return !1;
    a.root && (a.root.scroll = void 0, a.root.updateScroll());
    const c = jT(i, a.root, this.visualElement.getTransformPagePoint());
    let d = EA(a.layout.layoutBox, c);
    if (o) {
      const p = o(DT(d));
      this.hasMutatedConstraints = !!p, p && (d = Tv(p));
    }
    return d;
  }
  startAnimation(n) {
    const { drag: o, dragMomentum: i, dragElastic: a, dragTransition: c, dragSnapToOrigin: d, onDragTransitionEnd: p } = this.getProps(), m = this.constraints || {}, y = Zt((v) => {
      if (!Ys(v, o, this.currentDirection))
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
    return Promise.all(y).then(p);
  }
  startAxisValueAnimation(n, o) {
    const i = this.getAxisMotionValue(n);
    return bc(this.visualElement, n), i.start(Pd(n, i, 0, o, this.visualElement, !1));
  }
  stopAnimation() {
    Zt((n) => this.getAxisMotionValue(n).stop());
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
    Zt((o) => {
      const { drag: i } = this.getProps();
      if (!Ys(o, i, this.currentDirection))
        return;
      const { projection: a } = this.visualElement, c = this.getAxisMotionValue(o);
      if (a && a.layout) {
        const { min: d, max: p } = a.layout.layoutBox[o], m = c.get() || 0;
        c.set(n[o] - ke(d, p, 0.5) + m);
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
    if (!to(o) || !i || !this.constraints)
      return;
    this.stopAnimation();
    const a = { x: 0, y: 0 };
    Zt((d) => {
      const p = this.getAxisMotionValue(d);
      if (p && this.constraints !== !1) {
        const m = p.get();
        a[d] = bA({ min: m, max: m }, this.constraints[d]);
      }
    });
    const { transformTemplate: c } = this.visualElement.getProps();
    this.visualElement.current.style.transform = c ? c({}, "") : "none", i.root && i.root.updateScroll(), i.updateLayout(), this.constraints = !1, this.resolveConstraints(), Zt((d) => {
      if (!Ys(d, n, null))
        return;
      const p = this.getAxisMotionValue(d), { min: m, max: y } = this.constraints[d];
      p.set(ke(m, y, a[d]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    DA.set(this.visualElement, this);
    const n = this.visualElement.current, o = fi(n, "pointerdown", (y) => {
      const { drag: v, dragListener: l = !0 } = this.getProps(), f = y.target, S = f !== n && fT(f);
      v && l && !S && this.start(y);
    });
    let i;
    const a = () => {
      const { dragConstraints: y } = this.getProps();
      to(y) && y.current && (this.constraints = this.resolveRefConstraints(), i || (i = IA(n, y.current, () => this.scalePositionWithinConstraints())));
    }, { projection: c } = this.visualElement, d = c.addEventListener("measure", a);
    c && !c.layout && (c.root && c.root.updateScroll(), c.updateLayout()), Ae.read(a);
    const p = vi(window, "resize", () => this.scalePositionWithinConstraints()), m = c.addEventListener("didUpdate", (({ delta: y, hasLayoutChanged: v }) => {
      this.isDragging && v && (Zt((l) => {
        const f = this.getAxisMotionValue(l);
        f && (this.originPoint[l] += y[l].translate, f.set(f.get() + y[l].translate));
      }), this.visualElement.render());
    }));
    return () => {
      p(), o(), d(), m && m(), i && i();
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
function Dy(e) {
  let n = !0;
  return () => {
    if (n) {
      n = !1;
      return;
    }
    e();
  };
}
function IA(e, n, o) {
  const i = Vh(e, Dy(o)), a = Vh(n, Dy(o));
  return () => {
    i(), a();
  };
}
function Ys(e, n, o) {
  return (n === !0 || n === e) && (o === null || o === e);
}
function jA(e, n = 10) {
  let o = null;
  return Math.abs(e.y) > n ? o = "y" : Math.abs(e.x) > n && (o = "x"), o;
}
class FA extends Xn {
  constructor(n) {
    super(n), this.removeGroupControls = Dt, this.removeListeners = Dt, this.controls = new NA(n);
  }
  mount() {
    const { dragControls: n } = this.node.getProps();
    n && (this.removeGroupControls = n.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || Dt;
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
  e && Ae.update(() => e(n, o), !1, !0);
};
class OA extends Xn {
  constructor() {
    super(...arguments), this.removePointerDownListener = Dt;
  }
  onPointerDown(n) {
    this.session = new t0(n, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: e0(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: n, onPanStart: o, onPan: i, onPanEnd: a } = this.node.getProps();
    return {
      onSessionStart: nc(n),
      onStart: nc(o),
      onMove: nc(i),
      onEnd: (c, d) => {
        delete this.session, a && Ae.postRender(() => a(c, d));
      }
    };
  }
  mount() {
    this.removePointerDownListener = fi(this.node.current, "pointerdown", (n) => this.onPointerDown(n));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let rc = !1;
class LA extends C.Component {
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
    })), fa.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(n) {
    const { layoutDependency: o, visualElement: i, drag: a, isPresent: c } = this.props, { projection: d } = i;
    return d && (d.isPresent = c, n.layoutDependency !== o && d.setOptions({
      ...d.options,
      layoutDependency: o
    }), rc = !0, a || n.layoutDependency !== o || o === void 0 || n.isPresent !== c ? d.willUpdate() : this.safeToRemove(), n.isPresent !== c && (c ? d.promote() : d.relegate() || Ae.postRender(() => {
      const p = d.getStack();
      (!p || !p.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: n, layoutAnchor: o } = this.props, { projection: i } = n;
    i && (i.options.layoutAnchor = o, i.root.didUpdate(), Md.postRender(() => {
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
function r0(e) {
  const [n, o] = Wv(), i = C.useContext(pd);
  return x.jsx(LA, { ...e, layoutGroup: i, switchLayoutGroup: C.useContext(Jv), isPresent: n, safeToRemove: o });
}
const VA = {
  pan: {
    Feature: OA
  },
  drag: {
    Feature: FA,
    ProjectionNode: Hv,
    MeasureLayout: r0
  }
};
function Ny(e, n, o) {
  const { props: i } = e;
  e.animationState && i.whileHover && e.animationState.setActive("whileHover", o === "Start");
  const a = "onHover" + o, c = i[a];
  c && Ae.postRender(() => c(n, Ei(n)));
}
class BA extends Xn {
  mount() {
    const { current: n } = this.node;
    n && (this.unmount = lT(n, (o, i) => (Ny(this.node, i, "Start"), (a) => Ny(this.node, a, "End"))));
  }
  unmount() {
  }
}
class zA extends Xn {
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
    this.unmount = Ai(vi(this.node.current, "focus", () => this.onFocus()), vi(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function Iy(e, n, o) {
  const { props: i } = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
    return;
  e.animationState && i.whileTap && e.animationState.setActive("whileTap", o === "Start");
  const a = "onTap" + (o === "End" ? "" : o), c = i[a];
  c && Ae.postRender(() => c(n, Ei(n)));
}
class UA extends Xn {
  mount() {
    const { current: n } = this.node;
    if (!n)
      return;
    const { globalTapTarget: o, propagate: i } = this.node.props;
    this.unmount = mT(n, (a, c) => (Iy(this.node, c, "Start"), (d, { success: p }) => Iy(this.node, d, p ? "End" : "Cancel")), {
      useGlobalTarget: o,
      stopPropagation: (i == null ? void 0 : i.tap) === !1
    });
  }
  unmount() {
  }
}
const Bc = /* @__PURE__ */ new WeakMap(), oc = /* @__PURE__ */ new WeakMap(), $A = (e) => {
  const n = Bc.get(e.target);
  n && n(e);
}, HA = (e) => {
  e.forEach($A);
};
function WA({ root: e, ...n }) {
  const o = e || document;
  oc.has(o) || oc.set(o, {});
  const i = oc.get(o), a = JSON.stringify(n);
  return i[a] || (i[a] = new IntersectionObserver(HA, { root: e, ...n })), i[a];
}
function GA(e, n, o) {
  const i = WA(n);
  return Bc.set(e, o), i.observe(e), () => {
    Bc.delete(e), i.unobserve(e);
  };
}
const KA = {
  some: 0,
  all: 1
};
class YA extends Xn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var m;
    (m = this.stopObserver) == null || m.call(this);
    const { viewport: n = {} } = this.node.getProps(), { root: o, margin: i, amount: a = "some", once: c } = n, d = {
      root: o ? o.current : void 0,
      rootMargin: i,
      threshold: typeof a == "number" ? a : KA[a]
    }, p = (y) => {
      const { isIntersecting: v } = y;
      if (this.isInView === v || (this.isInView = v, c && !v && this.hasEnteredView))
        return;
      v && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", v);
      const { onViewportEnter: l, onViewportLeave: f } = this.node.getProps(), S = v ? l : f;
      S && S(y);
    };
    this.stopObserver = GA(this.node.current, d, p);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: n, prevProps: o } = this.node;
    ["amount", "margin", "root"].some(QA(n, o)) && this.startObserver();
  }
  unmount() {
    var n;
    (n = this.stopObserver) == null || n.call(this), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function QA({ viewport: e = {} }, { viewport: n = {} } = {}) {
  return (o) => e[o] !== n[o];
}
const XA = {
  inView: {
    Feature: YA
  },
  tap: {
    Feature: UA
  },
  focus: {
    Feature: zA
  },
  hover: {
    Feature: BA
  }
}, ZA = {
  layout: {
    ProjectionNode: Hv,
    MeasureLayout: r0
  }
}, JA = {
  ...xA,
  ...XA,
  ...VA,
  ...ZA
}, vn = /* @__PURE__ */ yA(JA, gA);
function qA(e) {
  const o = String(e || "").toLowerCase().split(".");
  if (o.length !== 4 || o.some((a) => !/^\d+$/.test(a))) return !1;
  const i = o.map(Number);
  return i.some((a) => a < 0 || a > 255) ? !1 : i[0] === 10 || i[0] === 172 && i[1] >= 16 && i[1] <= 31 || i[0] === 192 && i[1] === 168;
}
function o0(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function jy(e) {
  return o0(e) || qA(e);
}
function eC(e) {
  return !e || o0(e) ? "127.0.0.1" : e;
}
const tC = (() => {
  var v, l, f, S;
  const e = globalThis.window || globalThis, n = globalThis.document || {}, o = e.location || {}, i = String(e.SYNAPSE_DATA_API_PORT || ((l = (v = n.body) == null ? void 0 : v.dataset) == null ? void 0 : l.dataApiPort) || "3001").trim(), { protocol: a = "file:", hostname: c = "127.0.0.1", port: d = "" } = o, p = `http://${eC(c)}:${i || "3001"}`, m = String(e.SYNAPSE_DATA_API_BASE || ((S = (f = n.body) == null ? void 0 : f.dataset) == null ? void 0 : S.dataApiBase) || "").replace(/\/+$/, ""), y = `${a}//${o.host || (d ? `${c}:${d}` : c)}`.replace(/\/+$/, "");
  return m && !(jy(c) && d !== i && m === y) ? m : a === "file:" || jy(c) && d !== i ? p : `${a}//${o.host || c}`;
})(), nC = new yg(tC), ic = Number((globalThis.window || globalThis).SYNAPSE_DATA_API_TIMEOUT_MS || 6e3), rC = Number.isFinite(ic) && ic > 0 ? ic : 6e3;
function oC(e, n) {
  typeof window > "u" || console.warn(e, n);
}
async function iC(e) {
  var i, a;
  const o = (((a = (i = e.headers) == null ? void 0 : i.get) == null ? void 0 : a.call(i, "content-type")) || "").includes("application/json") ? await e.json() : {};
  if (!e.ok || (o == null ? void 0 : o.ok) === !1)
    throw new Error((o == null ? void 0 : o.error) || `Synapse data API returned HTTP ${e.status}`);
  return o;
}
async function sC(e, n = {}) {
  const o = await nC.fetch(e, {
    timeoutMs: rC,
    ...n
  });
  return iC(o);
}
async function aC(e) {
  try {
    return (await sC("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e || {})
    })).item || null;
  } catch (n) {
    return oC("Synapse data API focus-session save skipped:", n), null;
  }
}
class lC {
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
const i0 = new lC();
function Bd(e, n) {
  return i0.readJSON(e, n);
}
function zd(e, n) {
  return i0.writeJSON(e, n);
}
const s0 = "synapse.focusRoom.sessions.v1", a0 = "synapse.focusRoom.draft.v1", l0 = "synapse.focusRoom.active-session.v1", zc = 40, Fy = Object.freeze([
  "idle",
  "running",
  "paused",
  "completed",
  "break",
  "restoring"
]), uC = Object.freeze({
  studying: "running",
  running: "running",
  idle: "idle",
  paused: "paused",
  completed: "completed",
  break: "break",
  restoring: "restoring"
});
let Uc = [];
const fr = (e) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(e)}`, Gn = [
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
    streamUrl: fr("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
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
    streamUrl: fr("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: fr("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: fr("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: fr("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: fr("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: fr("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, Kn = [
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
], kr = [
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
], u0 = [25, 45, 50, 90];
function cC(e = "") {
  const n = String(e || "");
  return Gn.find((o) => o.label === n) || Gn[0];
}
function dC(e = "") {
  const n = String(e || "");
  return Kn.find((o) => o.label === n) || Kn[0];
}
function Ba(e = {}) {
  const n = cC(e == null ? void 0 : e.musicType), o = dC(e == null ? void 0 : e.ambientSound);
  return {
    musicTrack: n,
    ambientSound: o,
    ambientLayers: o.layers.map((i) => ({
      ...i,
      volumeBias: $n(i.volumeBias, 1)
    }))
  };
}
function fC(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function c0(e) {
  return String(e || "").trim();
}
function pC({ material: e, goal: n, durationMinutes: o }) {
  var v;
  const i = Math.max(10, Number(o) || 25), a = (v = e == null ? void 0 : e.studyHeadings) != null && v.length ? e.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], c = String(n || "").trim() || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`, d = Math.max(1, Math.floor(i * 0.2)), p = Math.max(1, Math.floor(i * 0.4)), m = Math.max(1, Math.floor(i * 0.2)), y = Math.max(1, i - d - p - m);
  return [
    { minutes: d, task: `Set the goal: ${c}` },
    { minutes: p, task: `Review ${a[0] || "the core ideas"}` },
    { minutes: m, task: `Practice with ${a[1] || a[0] || "the generated examples"}` },
    { minutes: y, task: "Summarize mistakes and choose the next study step" }
  ];
}
function d0() {
  return Bd(a0, null);
}
function mC(e) {
  return zd(a0, e || null);
}
function f0(e) {
  if (!e || typeof e != "object")
    return { materials: {} };
  const n = fC(e.materials);
  return {
    ...e,
    materials: { ...n }
  };
}
function fo(e, n = "idle") {
  const o = uC[String(e || "").trim().toLowerCase()];
  return o && Fy.includes(o) ? o : Fy.includes(n) ? n : "idle";
}
function Ud(e) {
  return fo(e) === "running" ? "studying" : fo(e);
}
function p0(e = {}, n = {}) {
  const o = e && typeof e == "object" ? e : {}, i = n && typeof n == "object" ? n : {}, a = Object.prototype.hasOwnProperty.call(o, "timerStatus"), c = Object.prototype.hasOwnProperty.call(o, "timerState") || Object.prototype.hasOwnProperty.call(o, "timerPhase"), d = fo(
    c ? o.timerState || o.timerPhase : a ? o.timerStatus : o.status || i.timerState,
    fo(i.timerState || i.timerPhase || i.timerStatus)
  ), p = o.timerMode === "countup" || i.timerMode === "countup" && !Object.prototype.hasOwnProperty.call(o, "timerMode") ? "countup" : "countdown", y = Object.fromEntries(["timerAnchorAtMs", "timerPausedAtMs", "timerUpdatedAtMs", "timerRestoredAtMs"].map((l) => {
    const f = Object.prototype.hasOwnProperty.call(o, l) ? o[l] : i[l], S = Number(f);
    return [l, Number.isFinite(S) && S > 0 ? S : null];
  })), v = Math.max(0, $n(
    Object.prototype.hasOwnProperty.call(o, "elapsedSeconds") ? o.elapsedSeconds : i.elapsedSeconds,
    0
  ));
  return {
    ...i,
    ...o,
    timerState: d,
    timerPhase: d,
    status: d,
    timerStatus: Ud(d),
    timerMode: p,
    elapsedSeconds: v,
    ...y
  };
}
function m0() {
  return f0(Bd(l0, null));
}
function hC(e) {
  return zd(l0, f0(e));
}
function h0(e) {
  const n = c0(e);
  if (!n) return null;
  const i = m0().materials[n];
  return i && typeof i == "object" ? p0(i) : null;
}
function $d(e, n) {
  const o = c0(e);
  if (!o) return !1;
  const i = m0();
  return n && typeof n == "object" ? i.materials[o] = {
    ...p0(n, i.materials[o]),
    materialId: o,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  } : delete i.materials[o], hC(i);
}
function pa(e) {
  return $d(e, null);
}
function $c() {
  const e = Bd(s0, []), n = Array.isArray(e) ? e : [], o = /* @__PURE__ */ new Set();
  return [...Uc, ...n].filter((i) => {
    const a = String((i == null ? void 0 : i.sessionId) || "");
    return !a || o.has(a) ? !1 : (o.add(a), !0);
  }).slice(0, zc);
}
function $n(e, n) {
  const o = Number(e);
  return Number.isFinite(o) ? o : n;
}
function yC(e = {}) {
  const n = (/* @__PURE__ */ new Date()).toISOString(), i = { ...{
    sessionId: e.sessionId || `focus-${Date.now()}`,
    materialId: String(e.materialId || ""),
    materialTitle: e.materialTitle || "Study material",
    studyGoal: e.studyGoal || "",
    selectedScene: e.selectedScene || "morning-window",
    musicType: e.musicType || "Deep Focus",
    ambientSound: e.ambientSound || "Nature",
    musicVolume: $n(e.musicVolume ?? 60, 60),
    ambientVolume: $n(e.ambientVolume ?? 50, 50),
    pomodoroDuration: $n(e.pomodoroDuration || 25, 25),
    startedAt: e.startedAt || n,
    endedAt: e.endedAt || n,
    totalFocusTime: Math.max(0, $n(e.totalFocusTime || 0, 0)),
    flashcardsCompleted: Math.max(0, $n(e.flashcardsCompleted || 0, 0)),
    quizScore: e.quizScore === null || e.quizScore === void 0 || e.quizScore === "" ? null : Number.isFinite(Number(e.quizScore)) ? Number(e.quizScore) : null,
    mistakesMade: Array.isArray(e.mistakesMade) ? e.mistakesMade : [],
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks : [],
    aiReflection: e.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: e.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: e.sessionDate || n
  }, persisted: !0 }, a = $c().filter((m) => m.sessionId !== i.sessionId), c = [i, ...a.map((m) => ({ ...m, persisted: !0 }))].slice(0, zc), d = zd(s0, c), p = { ...i, persisted: d };
  return aC(p).catch((m) => {
    console.warn("Synapse data API focus-session background save failed:", m);
  }), d ? Uc = [] : Uc = [p, ...a].slice(0, zc), p;
}
function y0(e) {
  const n = Math.max(0, $n(e || 0, 0)), o = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60);
  return o ? `${o}h ${i}m` : `${i}m`;
}
var pg;
const Hc = ((pg = kr[0]) == null ? void 0 : pg.id) || "morning-window", ao = u0[0] || 25, gC = 10, za = 180, Hd = 60, g0 = za * 60, vC = 0, SC = 100, wC = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"], Wc = new Set(wC), Si = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function xC(e, n, o, i) {
  const a = Number(e);
  return Number.isFinite(a) ? Math.min(i, Math.max(o, a)) : n;
}
function wr(e, n, o, i) {
  return Math.round(xC(e, n, o, i));
}
function xt(e, n = 50) {
  return wr(e, n, vC, SC);
}
function gr(e, n = ao) {
  return wr(e, n, gC, za);
}
function en(e, n = ao * 60) {
  return wr(e, n, Hd, g0);
}
function Ea(e) {
  return kr.find((n) => n.id === e) || null;
}
function nn(e = Hc) {
  return Ea(e) || kr[0] || {
    id: Hc,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function v0(e) {
  return Array.isArray(e) ? e.map((n) => ({
    minutes: wr(n == null ? void 0 : n.minutes, 5, 1, za),
    task: String((n == null ? void 0 : n.task) || "").trim()
  })).filter((n) => n.task) : [];
}
function li(e) {
  return Array.isArray(e) ? e.map((n) => ({
    role: String((n == null ? void 0 : n.role) || "assistant") === "user" ? "user" : "assistant",
    text: String((n == null ? void 0 : n.text) || "").trim(),
    createdAt: (n == null ? void 0 : n.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
  })).filter((n) => n.text).slice(-24) : [];
}
function S0(e) {
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
  return e ? pC({
    material: e,
    goal: n,
    durationMinutes: o
  }) : [];
}
function wi(e) {
  const n = gr(e);
  return n > 0 ? n * 60 : 0;
}
function Kc(e) {
  const n = Math.max(0, Math.floor(Number(e) || 0)), o = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60), a = n % 60, c = (d) => String(d).padStart(2, "0");
  return o ? `${o}:${c(i)}:${c(a)}` : `${c(i)}:${c(a)}`;
}
function Oy(e) {
  const n = (e == null ? void 0 : e.flashcards) || [];
  return Array.isArray(n) ? n.slice(0, 24) : [];
}
function _C(e, n) {
  return String((e == null ? void 0 : e.id) || (e == null ? void 0 : e.front) || (e == null ? void 0 : e.term) || n);
}
function TC(e) {
  var n;
  return Array.isArray(e == null ? void 0 : e.questions) ? e.questions : Array.isArray((n = e == null ? void 0 : e.quiz) == null ? void 0 : n.questions) ? e.quiz.questions : [];
}
function Yc(e) {
  return (Array.isArray(e == null ? void 0 : e.quizzes) ? e.quizzes : []).flatMap((o) => TC(o).map((i) => {
    var a;
    return {
      ...i,
      quizTitle: (o == null ? void 0 : o.title) || ((a = o == null ? void 0 : o.quiz) == null ? void 0 : a.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function kC(e, n) {
  return (e == null ? void 0 : e.question) || (e == null ? void 0 : e.prompt) || (e == null ? void 0 : e.stem) || `Question ${n + 1}`;
}
function Wd(e) {
  return String((e == null ? void 0 : e.type) || "").toLowerCase();
}
function AC(e) {
  return String((e == null ? void 0 : e.label) || (e == null ? void 0 : e.text) || e).trim();
}
function ba(e) {
  const n = (e == null ? void 0 : e.choices) || (e == null ? void 0 : e.options) || (e == null ? void 0 : e.answers);
  return Array.isArray(n) && n.length ? n.map(AC).filter(Boolean) : Wd(e) === "true_false" ? ["True", "False"] : [];
}
function Qc(e) {
  const n = (e == null ? void 0 : e.correctOptionIndexes) || (e == null ? void 0 : e.correct_option_indexes) || (e == null ? void 0 : e.correctIndexes);
  return Array.isArray(n) ? n.map((o) => Number(o)).filter(Number.isInteger) : [];
}
function CC(e, n) {
  const o = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [], i = Array.isArray(n) ? [...n].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [];
  return o.length === i.length && o.every((a, c) => a === i[c]);
}
function xr(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Ma(e, n) {
  if (Number.isInteger(n)) return n;
  const o = Number(n);
  if (typeof n != "string" && Number.isInteger(o)) return o;
  const i = ba(e), a = xr(n);
  return i.findIndex((c) => xr(c) === a);
}
function w0(e, n) {
  if (typeof n == "boolean") return n;
  if (n === 0) return !0;
  if (n === 1) return !1;
  const o = ba(e), i = xr(n);
  return i === "true" ? !0 : i === "false" ? !1 : xr(o[0]) === i ? !0 : xr(o[1]) === i ? !1 : null;
}
function PC(e, n, o) {
  const i = Wd(e);
  if (i === "multiple_choice") {
    const a = Ma(e, n);
    if (!Number.isInteger(a) || a < 0) return [];
    const c = Array.isArray(o) ? [...o] : [];
    return c.includes(a) ? c.filter((d) => d !== a) : [...c, a].sort((d, p) => d - p);
  }
  if (i === "single_choice") {
    const a = Ma(e, n);
    return Number.isInteger(a) && a >= 0 ? a : "";
  }
  if (i === "true_false") {
    const a = w0(e, n);
    return a === null ? "" : a;
  }
  return String(n || "");
}
function x0(e) {
  const n = (e == null ? void 0 : e.correctAnswer) ?? (e == null ? void 0 : e.correct_answer) ?? (e == null ? void 0 : e.answer) ?? (e == null ? void 0 : e.correct), o = Qc(e);
  if (o.length) {
    const i = ba(e);
    return o.map((a) => i[a] || "").filter(Boolean).join(", ");
  }
  if (typeof (e == null ? void 0 : e.correctBoolean) == "boolean" || typeof (e == null ? void 0 : e.correct_boolean) == "boolean") {
    const i = ba(e);
    return (typeof e.correctBoolean == "boolean" ? e.correctBoolean : e.correct_boolean) ? i[0] || "True" : i[1] || "False";
  }
  return e != null && e.expectedAnswer || e != null && e.expected_answer ? String(e.expectedAnswer || e.expected_answer || "").trim() : Array.isArray(n) ? n.map((i) => String(i)).join(", ") : String(n || "").trim();
}
function EC(e, n) {
  const o = Wd(e);
  if (o === "single_choice") {
    const a = Qc(e)[0], c = Ma(e, n);
    return Number.isInteger(a) ? c === a : null;
  }
  if (o === "multiple_choice") {
    const a = Qc(e), c = Array.isArray(n) ? n : [Ma(e, n)].filter(Number.isInteger);
    return a.length ? CC(c, a) : null;
  }
  if (o === "true_false") {
    const a = typeof (e == null ? void 0 : e.correctBoolean) == "boolean" ? e.correctBoolean : e == null ? void 0 : e.correct_boolean, c = w0(e, n);
    return typeof a == "boolean" && c !== null ? c === a : null;
  }
  const i = x0(e);
  return i ? xr(n) === xr(i) : null;
}
function _0(e, n, o) {
  var p;
  const i = String(e || "").trim(), a = String((n == null ? void 0 : n.summaryText) || (n == null ? void 0 : n.aiSummary) || "").slice(0, 420), c = ((p = n == null ? void 0 : n.studyHeadings) == null ? void 0 : p[0]) || (n == null ? void 0 : n.materialTitle) || "this material", d = o || `Study ${(n == null ? void 0 : n.materialTitle) || "this material"}`;
  return i ? [
    `For ${c}: ${a || "use the selected material as your main source."}`,
    `Your current goal is: ${d}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function bC(e) {
  const n = e.currentTarget, o = n.getBoundingClientRect(), i = o.width ? (e.clientX - o.left) / o.width * 100 : 50, a = o.height ? (e.clientY - o.top) / o.height * 100 : 50;
  n.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, i))}%`), n.style.setProperty("--glass-y", `${Math.max(0, Math.min(100, a))}%`);
}
function MC(e) {
  e.currentTarget.style.setProperty("--glass-x", "50%"), e.currentTarget.style.setProperty("--glass-y", "0%");
}
function RC() {
  return /* @__PURE__ */ x.jsx("svg", { className: "liquid-glass-filter-defs", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ x.jsx("defs", { children: /* @__PURE__ */ x.jsxs("filter", { id: "liquid-glass-displacement", x: "-12%", y: "-12%", width: "124%", height: "124%", colorInterpolationFilters: "sRGB", children: [
    /* @__PURE__ */ x.jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.024", numOctaves: "2", seed: "17", result: "liquid-noise" }),
    /* @__PURE__ */ x.jsx("feDisplacementMap", { in: "SourceGraphic", in2: "liquid-noise", scale: "7", xChannelSelector: "R", yChannelSelector: "B", result: "refracted-surface" }),
    /* @__PURE__ */ x.jsx("feColorMatrix", { in: "refracted-surface", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.04 0", result: "edge-alpha" }),
    /* @__PURE__ */ x.jsx("feGaussianBlur", { in: "edge-alpha", stdDeviation: "0.25", result: "soft-edge" }),
    /* @__PURE__ */ x.jsx("feBlend", { in: "soft-edge", in2: "refracted-surface", mode: "screen" })
  ] }) }) });
}
function Ly({ as: e = "section", className: n = "", children: o, ...i }) {
  const { onPointerMove: a, onPointerLeave: c, ...d } = i;
  return /* @__PURE__ */ x.jsx(
    vn.div,
    {
      className: `liquid-glass ${n}`.trim(),
      initial: { opacity: 0, y: 14, filter: "blur(10px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      transition: Si,
      onPointerMove: (p) => {
        bC(p), a == null || a(p);
      },
      onPointerLeave: (p) => {
        MC(p), c == null || c(p);
      },
      ...d,
      children: e === "div" ? o : /* @__PURE__ */ x.jsx(e, { className: "liquid-glass-inner", children: o })
    }
  );
}
function DC({ scene: e }) {
  const [n, o] = C.useState(!1), [i, a] = C.useState(!1);
  return C.useEffect(() => {
    o(!1), a(!1);
  }, [e == null ? void 0 : e.id]), /* @__PURE__ */ x.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ x.jsx(RC, {}),
    /* @__PURE__ */ x.jsx(La, { mode: "wait", children: /* @__PURE__ */ x.jsxs(
      vn.div,
      {
        className: "focus-background",
        style: { backgroundImage: i ? "none" : void 0 },
        initial: { opacity: 0, scale: 1.035 },
        animate: { opacity: 1, scale: 1.02 },
        exit: { opacity: 0, scale: 1.015 },
        transition: { duration: 0.8, ease: "easeOut" },
        children: [
          e != null && e.image ? /* @__PURE__ */ x.jsx(
            "img",
            {
              className: `focus-background-media focus-background-poster ${n ? "is-ready" : ""}`.trim(),
              src: e.image,
              alt: "",
              onLoad: () => o(!0),
              onError: () => a(!0)
            }
          ) : null,
          e != null && e.video ? /* @__PURE__ */ x.jsx(
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
    /* @__PURE__ */ x.jsx("div", { className: "focus-overlay" }),
    /* @__PURE__ */ x.jsx("div", { className: "focus-vignette" })
  ] });
}
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const NC = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), IC = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (n, o, i) => i ? i.toUpperCase() : o.toLowerCase()
), Vy = (e) => {
  const n = IC(e);
  return n.charAt(0).toUpperCase() + n.slice(1);
}, T0 = (...e) => e.filter((n, o, i) => !!n && n.trim() !== "" && i.indexOf(n) === o).join(" ").trim(), jC = (e) => {
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
var FC = {
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
const OC = C.forwardRef(
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
      ...FC,
      width: n,
      height: n,
      stroke: e,
      strokeWidth: i ? Number(o) * 24 / Number(n) : o,
      className: T0("lucide", a),
      ...!c && !jC(p) && { "aria-hidden": "true" },
      ...p
    },
    [
      ...d.map(([y, v]) => C.createElement(y, v)),
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
const Be = (e, n) => {
  const o = C.forwardRef(
    ({ className: i, ...a }, c) => C.createElement(OC, {
      ref: c,
      iconNode: n,
      className: T0(
        `lucide-${NC(Vy(e))}`,
        `lucide-${e}`,
        i
      ),
      ...a
    })
  );
  return o.displayName = Vy(e), o;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const LC = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
], VC = Be("arrow-left", LC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const BC = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], k0 = Be("check", BC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zC = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
], UC = Be("clock", zC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $C = [
  ["rect", { width: "12", height: "12", x: "2", y: "10", rx: "2", ry: "2", key: "6agr2n" }],
  [
    "path",
    { d: "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6", key: "1o487t" }
  ],
  ["path", { d: "M6 18h.01", key: "uhywen" }],
  ["path", { d: "M10 14h.01", key: "ssrbsk" }],
  ["path", { d: "M15 6h.01", key: "cblpky" }],
  ["path", { d: "M18 9h.01", key: "2061c0" }]
], HC = Be("dices", $C);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const WC = [
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
], GC = Be("door-open", WC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const KC = [
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
], Ra = Be("footprints", KC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const YC = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
], QC = Be("minimize-2", YC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const XC = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], By = Be("pause", XC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ZC = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], JC = Be("play", ZC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qC = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], eP = Be("rotate-ccw", qC);
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
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
], A0 = Be("save", tP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nP = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
], C0 = Be("settings-2", nP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rP = [
  ["path", { d: "m18 14 4 4-4 4", key: "10pe0f" }],
  ["path", { d: "m18 2 4 4-4 4", key: "pucp1d" }],
  ["path", { d: "M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22", key: "1ailkh" }],
  ["path", { d: "M2 6h1.972a4 4 0 0 1 3.6 2.2", key: "km57vx" }],
  ["path", { d: "M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45", key: "os18l9" }]
], oP = Be("shuffle", rP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const iP = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], sP = Be("skip-forward", iP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const aP = [
  ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
  ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
  ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
  ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
  ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
  ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
  ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
  ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
  ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }]
], lP = Be("sliders-horizontal", aP);
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
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
], cP = Be("sparkles", uP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dP = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
], Da = Be("users", dP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fP = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], Ua = Be("volume-2", fP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pP = [
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
], P0 = Be("waves", pP);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mP = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], E0 = Be("x", mP), zy = (e) => {
  let n;
  const o = /* @__PURE__ */ new Set(), i = (y, v) => {
    const l = typeof y == "function" ? y(n) : y;
    if (!Object.is(l, n)) {
      const f = n;
      n = v ?? (typeof l != "object" || l === null) ? l : Object.assign({}, n, l), o.forEach((S) => S(n, f));
    }
  }, a = () => n, p = { setState: i, getState: a, getInitialState: () => m, subscribe: (y) => (o.add(y), () => o.delete(y)) }, m = n = e(i, a, p);
  return p;
}, hP = ((e) => e ? zy(e) : zy), yP = (e) => e;
function gP(e, n = yP) {
  const o = gn.useSyncExternalStore(
    e.subscribe,
    gn.useCallback(() => n(e.getState()), [e, n]),
    gn.useCallback(() => n(e.getInitialState()), [e, n])
  );
  return gn.useDebugValue(o), o;
}
const Uy = (e) => {
  const n = hP(e), o = (i) => gP(n, i);
  return Object.assign(o, n), o;
}, vP = ((e) => e ? Uy(e) : Uy), pi = Object.freeze({
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
function SP() {
  return kr[0] || nn(Hc);
}
function Xc(e) {
  const n = String(e || "");
  if (!n) return null;
  const i = S0(d0()).materials[n];
  return i && typeof i == "object" ? i : null;
}
function mn(e) {
  var i;
  const n = String(e.selectedMaterialId || ((i = e.selectedMaterial) == null ? void 0 : i.materialId) || "");
  if (!n) return;
  const o = S0(d0());
  o.materials[n] = {
    materialId: n,
    selectedScene: e.selectedScene,
    musicType: e.musicType,
    ambientSound: e.ambientSound,
    musicVolume: xt(e.musicVolume),
    ambientVolume: xt(e.ambientVolume),
    audioChannels: { ...pi, ...e.audioChannels || {} },
    durationMinutes: gr(e.pomodoroDuration),
    durationSeconds: en(e.pomodoroDurationSeconds, wi(e.pomodoroDuration)),
    studyGoal: e.studyGoal,
    studyPlan: v0(e.studyPlan),
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks.filter(Boolean) : [],
    workspaceNotes: String(e.workspaceNotes || ""),
    workspaceUpdatedAt: e.workspaceUpdatedAt || "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, mC(o);
}
function wP(e) {
  return Array.isArray(e == null ? void 0 : e.completedTasks) ? e.completedTasks.map((n) => String(n || "").trim()).filter(Boolean) : [];
}
function Zc(e = {}) {
  return {
    sectionTitle: String(e.sectionTitle || "").trim(),
    excerpt: String(e.excerpt || "").trim().slice(0, 1800)
  };
}
function b0(e = null) {
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
function it() {
  const e = Date.now();
  return Number.isFinite(e) ? e : 0;
}
function Ut(e = {}) {
  return fo(e.timerState || e.timerPhase || e.status || e.timerStatus);
}
function mr(e = {}) {
  const n = Number(e.pomodoroDurationSeconds);
  return Number.isFinite(n) && n > 0 ? en(n, wi(e.pomodoroDuration)) : wi(e.pomodoroDuration);
}
function Hn(e = {}) {
  if (e.timerMode === "countup") return 0;
  const n = Number(e.timerDurationSeconds);
  return Number.isFinite(n) && n > 0 ? n : mr(e);
}
function Na(e = {}, n = it()) {
  const o = Math.max(0, Number(e.elapsedSeconds) || 0);
  if (Ut(e) !== "running") return o;
  const i = Number(e.timerAnchorAtMs);
  return !Number.isFinite(i) || i <= 0 ? o : Math.max(o, Math.floor(Math.max(0, n - i) / 1e3));
}
function bt(e, n = it()) {
  const o = fo(e);
  return {
    timerState: o,
    timerPhase: o,
    status: o,
    timerStatus: Ud(o),
    timerUpdatedAtMs: n
  };
}
function xP(e = {}) {
  const n = Ut(e);
  return {
    timerState: n,
    timerPhase: n,
    status: n,
    timerStatus: Ud(n),
    timerMode: e.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: Number.isFinite(Number(e.timerAnchorAtMs)) ? Number(e.timerAnchorAtMs) : null,
    timerPausedAtMs: Number.isFinite(Number(e.timerPausedAtMs)) ? Number(e.timerPausedAtMs) : null,
    timerUpdatedAtMs: Number.isFinite(Number(e.timerUpdatedAtMs)) ? Number(e.timerUpdatedAtMs) : null,
    timerRestoredAtMs: Number.isFinite(Number(e.timerRestoredAtMs)) ? Number(e.timerRestoredAtMs) : null,
    timerDurationSeconds: Hn(e),
    pomodoroDuration: e.pomodoroDuration,
    pomodoroDurationSeconds: mr(e),
    elapsedSeconds: Math.max(0, Number(e.elapsedSeconds) || 0),
    startedAt: e.startedAt || null,
    currentSession: e.currentSession || null,
    view: e.view
  };
}
function Bn(e) {
  var o;
  const n = String(e.selectedMaterialId || ((o = e.selectedMaterial) == null ? void 0 : o.materialId) || "");
  return !n || e.view !== "session" ? !1 : $d(n, xP(e));
}
function $y(e, n = it()) {
  const o = Na(e, n), i = Hn(e), a = e.timerMode !== "countup" && i > 0 && o >= i, c = a ? "completed" : Ut(e);
  return {
    ...bt(c, n),
    elapsedSeconds: a ? i : o,
    timerAnchorAtMs: c === "running" ? e.timerAnchorAtMs : null,
    timerPausedAtMs: c === "running" ? null : e.timerPausedAtMs || n,
    audioPlaying: c === "running" ? e.audioPlaying : !1
  };
}
function _P(e, n = {}) {
  const o = nn(n.selectedScene), i = Xc(e == null ? void 0 : e.materialId), a = Ea(i == null ? void 0 : i.selectedScene) ? i.selectedScene : o.id, c = nn(a), d = String((i == null ? void 0 : i.musicType) || c.musicType || "Deep Focus"), p = String((i == null ? void 0 : i.ambientSound) || c.ambientSound || "Nature"), m = xt(i == null ? void 0 : i.musicVolume, n.musicVolume ?? 60), y = xt(i == null ? void 0 : i.ambientVolume, n.ambientVolume ?? 50), v = gr(i == null ? void 0 : i.durationMinutes, n.pomodoroDuration ?? ao), l = en(
    i == null ? void 0 : i.durationSeconds,
    n.pomodoroDurationSeconds ?? v * 60
  ), f = String((i == null ? void 0 : i.studyGoal) || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`), S = v0(i == null ? void 0 : i.studyPlan), w = S.length ? S : Gc(e, f, v), k = wP(i), A = String((i == null ? void 0 : i.workspaceNotes) || ""), T = (i == null ? void 0 : i.workspaceUpdatedAt) || (i == null ? void 0 : i.updatedAt) || "";
  return {
    selectedScene: a,
    musicType: d,
    ambientSound: p,
    musicVolume: m,
    ambientVolume: y,
    audioChannels: { ...pi, ...(i == null ? void 0 : i.audioChannels) || n.audioChannels || {} },
    pomodoroDuration: v,
    pomodoroDurationSeconds: l,
    studyGoal: f,
    studyPlan: w,
    completedTasks: k,
    workspaceNotes: A,
    workspaceUpdatedAt: T
  };
}
function Hy(e) {
  const n = h0(e);
  if (!n || typeof n != "object") return null;
  const o = Ut(n), i = it(), a = Number(n.timerAnchorAtMs), c = Date.parse(n.startedAt || ""), d = Number.isFinite(c) ? c : NaN, p = o === "running" ? Na({
    ...n,
    timerState: "running",
    timerAnchorAtMs: Number.isFinite(a) && a > 0 ? a : d
  }, i) : Math.max(0, Number(n.elapsedSeconds) || 0), m = Hn(n), y = o === "running" ? m > 0 && p >= m ? "completed" : "paused" : o, v = o === "running";
  return {
    route: n.view === "session" ? "session" : "setup",
    view: n.view === "session" ? "session" : "setup",
    ...bt(v ? "restoring" : y, i),
    timerRestoreTarget: v ? y : null,
    timerMode: n.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: null,
    timerPausedAtMs: v ? null : Number(n.timerPausedAtMs) || null,
    timerRestoredAtMs: v ? null : i,
    timerDurationSeconds: m,
    ...Number(n.pomodoroDurationSeconds) > 0 ? { pomodoroDurationSeconds: en(n.pomodoroDurationSeconds) } : {},
    elapsedSeconds: m > 0 ? Math.min(m, p) : p,
    startedAt: n.startedAt || null,
    currentSession: n.currentSession || null,
    completedTasks: Array.isArray(n.completedTasks) ? n.completedTasks.filter(Boolean) : [],
    flashcardIndex: Math.max(0, Number(n.flashcardIndex) || 0),
    flashcardSide: n.flashcardSide === "back" ? "back" : "front",
    flashcardProgress: n.flashcardProgress && typeof n.flashcardProgress == "object" && !Array.isArray(n.flashcardProgress) ? n.flashcardProgress : {},
    quizAnswers: n.quizAnswers && typeof n.quizAnswers == "object" && !Array.isArray(n.quizAnswers) ? n.quizAnswers : {},
    quizChecked: n.quizChecked && typeof n.quizChecked == "object" && !Array.isArray(n.quizChecked) ? n.quizChecked : {},
    chatMessages: li(n.chatMessages),
    chatPending: !1,
    chatError: "",
    panelTab: Wc.has(n.panelTab) ? n.panelTab : "materials",
    workspaceNotes: String(n.workspaceNotes || ""),
    workspaceUpdatedAt: n.workspaceUpdatedAt || n.updatedAt || "",
    activeNoteSection: String(n.activeNoteSection || ""),
    activeSourceHighlight: b0(n.activeSourceHighlight),
    assistantContext: Zc(n.assistantContext),
    audioPlaying: !1
  };
}
function Qs() {
  return {
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {}
  };
}
function TP(e) {
  return Object.values(e.flashcardProgress || {}).filter((n) => n && n.difficulty).length;
}
function kP(e) {
  const n = Object.values(e.quizChecked || {}).filter((i) => i && i.hasKnownAnswer);
  if (!n.length) return null;
  const o = n.filter((i) => i.correct).length;
  return Math.round(o / n.length * 100);
}
function AP(e) {
  const n = Yc(e.selectedMaterial);
  return Object.entries(e.quizChecked || {}).filter(([, o]) => o && o.hasKnownAnswer && !o.correct).map(([o]) => kC(n[Number(o)], Number(o))).filter(Boolean);
}
async function CP(e, n, o, i = {}) {
  var d, p;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: _0(e, o, Q.getState().studyGoal),
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
const Q = vP((e, n) => {
  const o = SP(), i = Xc("focus-room"), a = Ea(i == null ? void 0 : i.selectedScene) ? nn(i.selectedScene) : o, c = gr(i == null ? void 0 : i.durationMinutes, ao), d = en(
    i == null ? void 0 : i.durationSeconds,
    wi(c)
  );
  return {
    route: "setup",
    view: "setup",
    materials: [],
    materialsStatus: "idle",
    materialsError: "",
    selectedMaterialId: "focus-room",
    selectedMaterial: null,
    selectedScene: a.id,
    musicType: String((i == null ? void 0 : i.musicType) || a.musicType || "Deep Focus"),
    ambientSound: String((i == null ? void 0 : i.ambientSound) || a.ambientSound || "Nature"),
    musicVolume: xt(i == null ? void 0 : i.musicVolume, 60),
    ambientVolume: xt(i == null ? void 0 : i.ambientVolume, 50),
    audioChannels: { ...pi, ...(i == null ? void 0 : i.audioChannels) || {} },
    pomodoroDuration: c,
    pomodoroDurationSeconds: d,
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
    timerDurationSeconds: d,
    studyGoal: String((i == null ? void 0 : i.studyGoal) || "Deep work block"),
    studyPlan: [],
    aiPanelOpen: !1,
    isIdle: !1,
    currentSession: null,
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
    workspaceNotes: String((i == null ? void 0 : i.workspaceNotes) || ""),
    workspaceUpdatedAt: (i == null ? void 0 : i.workspaceUpdatedAt) || "",
    activeNoteSection: "",
    activeSourceHighlight: null,
    assistantContext: { sectionTitle: "", excerpt: "" },
    chatMessages: [],
    chatPending: !1,
    chatError: "",
    setIdle: (p) => e({ isIdle: p }),
    initializeFocusRoom() {
      const p = n(), m = h0("focus-room"), y = Hy("focus-room"), v = Ut(m || {});
      if (!!((y == null ? void 0 : y.view) === "session" && y.currentSession && v === "running")) {
        const A = nn((m == null ? void 0 : m.selectedScene) || p.selectedScene);
        e({
          selectedMaterialId: "focus-room",
          selectedMaterial: null,
          studyPlan: Array.isArray(m == null ? void 0 : m.studyPlan) ? m.studyPlan : [],
          selectedScene: A.id,
          musicType: (m == null ? void 0 : m.musicType) || p.musicType,
          ambientSound: (m == null ? void 0 : m.ambientSound) || p.ambientSound,
          musicVolume: xt(m == null ? void 0 : m.musicVolume, p.musicVolume),
          ambientVolume: xt(m == null ? void 0 : m.ambientVolume, p.ambientVolume),
          audioChannels: { ...pi, ...(m == null ? void 0 : m.audioChannels) || p.audioChannels || {} },
          pomodoroDuration: gr(m == null ? void 0 : m.pomodoroDuration, p.pomodoroDuration),
          pomodoroDurationSeconds: en(
            m == null ? void 0 : m.pomodoroDurationSeconds,
            p.pomodoroDurationSeconds
          ),
          studyGoal: String((m == null ? void 0 : m.studyGoal) || p.studyGoal || "Deep work block"),
          summaryRecord: null,
          ...y,
          route: "session",
          view: "session"
        });
        return;
      }
      pa("focus-room");
      const f = Xc("focus-room"), S = nn((f == null ? void 0 : f.selectedScene) || p.selectedScene), w = gr(f == null ? void 0 : f.durationMinutes, p.pomodoroDuration || ao), k = en(
        f == null ? void 0 : f.durationSeconds,
        p.pomodoroDurationSeconds || wi(w)
      );
      e({
        route: "setup",
        view: "setup",
        selectedMaterialId: "focus-room",
        selectedMaterial: null,
        selectedScene: S.id,
        musicType: String((f == null ? void 0 : f.musicType) || S.musicType || p.musicType || "Deep Focus"),
        ambientSound: String((f == null ? void 0 : f.ambientSound) || S.ambientSound || p.ambientSound || "Nature"),
        musicVolume: xt(f == null ? void 0 : f.musicVolume, p.musicVolume ?? 60),
        ambientVolume: xt(f == null ? void 0 : f.ambientVolume, p.ambientVolume ?? 50),
        audioChannels: { ...pi, ...(f == null ? void 0 : f.audioChannels) || p.audioChannels || {} },
        pomodoroDuration: w,
        pomodoroDurationSeconds: k,
        timerDurationSeconds: k,
        studyGoal: String((f == null ? void 0 : f.studyGoal) || p.studyGoal || "Deep work block"),
        studyPlan: [],
        completedTasks: [],
        currentSession: null,
        summaryRecord: null,
        audioPlaying: !1,
        elapsedSeconds: 0,
        startedAt: null,
        ...bt("idle", it()),
        timerAnchorAtMs: null,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerRestoreTarget: null,
        workspaceNotes: String((f == null ? void 0 : f.workspaceNotes) || p.workspaceNotes || ""),
        workspaceUpdatedAt: (f == null ? void 0 : f.workspaceUpdatedAt) || p.workspaceUpdatedAt || ""
      });
    },
    returnToSetup() {
      const p = n();
      mn(p), pa("focus-room"), e({
        route: "setup",
        view: "setup",
        currentSession: null,
        summaryRecord: null,
        audioPlaying: !1,
        aiPanelOpen: !1,
        activeDrawer: "",
        elapsedSeconds: 0,
        startedAt: null,
        ...bt("idle", it()),
        timerAnchorAtMs: null,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerRestoreTarget: null,
        timerDurationSeconds: mr(p)
      });
    },
    setMaterialsState({ items: p = [], status: m = "ready", error: y = "" } = {}) {
      e({
        materials: Array.isArray(p) ? p : [],
        materialsStatus: m === "error" ? "error" : m === "loading" ? "loading" : "ready",
        materialsError: String(y || "")
      });
    },
    hydrateFocusRoute(p, m, { preserveSession: y = !1 } = {}) {
      const v = n(), l = !!m, f = l ? m.materialId : String(p.materialId || "");
      if (!l) {
        e({
          route: "setup",
          view: "setup",
          selectedMaterialId: f,
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
      const S = v.selectedMaterialId === f, w = S && y ? null : Hy(f), k = S && y ? {} : _P(m, v), A = S && y ? {} : {
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
        timerDurationSeconds: mr({
          pomodoroDuration: k.pomodoroDuration || ao,
          pomodoroDurationSeconds: k.pomodoroDurationSeconds
        }),
        elapsedSeconds: 0,
        startedAt: null,
        currentSession: null,
        ...Qs(),
        chatMessages: [],
        chatPending: !1,
        chatError: "",
        activeNoteSection: "",
        activeSourceHighlight: null,
        assistantContext: { sectionTitle: "", excerpt: "" }
      }, T = S && y ? v.view === "session" ? "session" : "setup" : (w == null ? void 0 : w.view) === "session" ? "session" : "setup";
      if (e({
        ...k,
        ...A,
        ...w,
        route: T,
        view: T,
        selectedMaterialId: f,
        selectedMaterial: m,
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null
      }), (w == null ? void 0 : w.timerState) === "restoring") {
        const E = w.timerRestoreTarget || "paused";
        Promise.resolve().then(() => {
          const M = n();
          if (M.selectedMaterialId !== f || M.timerState !== "restoring") return;
          const N = it(), O = Hn(M), W = O > 0 ? Math.min(O, Math.max(0, Number(M.elapsedSeconds) || 0)) : Math.max(0, Number(M.elapsedSeconds) || 0), G = {
            ...bt(E, N),
            timerRestoreTarget: null,
            timerAnchorAtMs: null,
            timerPausedAtMs: E === "paused" ? N : null,
            timerRestoredAtMs: N,
            elapsedSeconds: W,
            audioPlaying: !1
          };
          e(G), Bn({ ...M, ...G });
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
        sessionHistory: $c()
      });
    },
    selectScene(p) {
      const m = Ea(p);
      m && e((y) => {
        const v = {
          selectedScene: m.id,
          musicType: m.musicType || y.musicType,
          ambientSound: m.ambientSound || y.ambientSound
        }, l = { ...y, ...v };
        return mn(l), v;
      });
    },
    setPomodoroDurationSeconds(p) {
      e((m) => {
        const y = en(p, m.pomodoroDurationSeconds), v = Math.max(1, Math.round(y / 60)), l = m.selectedMaterial ? Gc(m.selectedMaterial, m.studyGoal, v) : [], f = {
          pomodoroDuration: v,
          pomodoroDurationSeconds: y,
          studyPlan: l,
          timerDurationSeconds: m.timerMode === "countup" ? 0 : y
        };
        return mn({ ...m, ...f }), f;
      });
    },
    setPomodoroDuration(p) {
      const m = gr(p, n().pomodoroDuration);
      n().setPomodoroDurationSeconds(m * 60);
    },
    setStudyGoal(p) {
      e((m) => {
        const y = String(p ?? ""), v = m.selectedMaterial ? Gc(m.selectedMaterial, y, m.pomodoroDuration) : [], l = { studyGoal: y, studyPlan: v };
        return mn({ ...m, ...l }), l;
      });
    },
    setSound(p, m) {
      e((y) => {
        var l;
        let v = {};
        if (p === "musicVolume" && (v = { musicVolume: xt(m, y.musicVolume) }), p === "ambientVolume" && (v = { ambientVolume: xt(m, y.ambientVolume) }), p === "musicType" && (v = { musicType: String(m || y.musicType) }), p === "ambientSound" && (v = { ambientSound: String(m || y.ambientSound) }), String(p).startsWith("audioChannel:")) {
          const f = String(p).slice(13);
          v = { audioChannels: { ...y.audioChannels, [f]: xt(m, ((l = y.audioChannels) == null ? void 0 : l[f]) ?? 0) } };
        }
        return mn({ ...y, ...v }), v;
      });
    },
    toggleAudio() {
      e((p) => ({ audioPlaying: !p.audioPlaying }));
    },
    setAudioPlaying(p) {
      e({ audioPlaying: !!p });
    },
    openDrawer(p) {
      e({
        activeDrawer: p
      });
    },
    closeDrawer() {
      e({
        activeDrawer: ""
      });
    },
    toggleAIPanel(p = null) {
      e((m) => ({ aiPanelOpen: typeof p == "boolean" ? p : !m.aiPanelOpen }));
    },
    openStudyPanel(p = "materials") {
      const m = Wc.has(String(p || "")) ? String(p) : "materials";
      e({
        panelTab: m,
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    selectSourceHighlight(p = null, { openPanel: m = !0 } = {}) {
      const y = b0(p);
      e({
        activeSourceHighlight: y,
        activeNoteSection: (y == null ? void 0 : y.sectionTitle) || n().activeNoteSection || "",
        assistantContext: y ? Zc({
          sectionTitle: y.sectionTitle,
          excerpt: y.excerpt
        }) : n().assistantContext,
        ...m ? { panelTab: "sources", aiPanelOpen: !0, activeDrawer: "" } : {}
      });
    },
    setActiveNoteSection(p = "") {
      e({
        activeNoteSection: String(p || "").trim()
      });
    },
    setPanelTab(p) {
      const m = String(p || "materials");
      e({
        panelTab: Wc.has(m) ? m : "materials",
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    startSession() {
      const p = n();
      mn(p), e({
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
        timerUpdatedAtMs: it(),
        timerRestoredAtMs: null,
        timerDurationSeconds: mr(p),
        elapsedSeconds: 0,
        startedAt: null,
        summaryRecord: null,
        aiPanelOpen: !1,
        activeDrawer: "",
        currentSession: {
          sessionId: `focus-${Date.now()}`,
          materialId: "focus-room",
          studyGoal: p.studyGoal,
          selectedScene: p.selectedScene,
          musicType: p.musicType,
          ambientSound: p.ambientSound,
          musicVolume: p.musicVolume,
          ambientVolume: p.ambientVolume,
          pomodoroDuration: p.pomodoroDuration,
          startedAt: null
        },
        ...Qs(),
        chatMessages: [],
        chatPending: !1,
        chatError: ""
      });
    },
    startTimer() {
      const p = n();
      (!p.currentSession || p.view !== "session") && n().startSession();
      const m = n(), y = it(), v = Ut(m);
      if (v === "running") {
        n().tickTimer();
        return;
      }
      const l = Hn(m), f = v === "completed" || v === "break" || l > 0 && m.elapsedSeconds >= l, S = f ? 0 : Math.max(0, Number(m.elapsedSeconds) || 0), w = {
        view: "session",
        route: "session",
        ...bt("running", y),
        audioPlaying: !0,
        summaryRecord: null,
        elapsedSeconds: S,
        startedAt: !m.startedAt || f ? new Date(y).toISOString() : m.startedAt,
        timerAnchorAtMs: y - S * 1e3,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerRestoreTarget: null,
        timerDurationSeconds: l,
        ...f ? Qs() : {}
      };
      e(w), Bn({ ...m, ...w });
    },
    pauseTimer({ pauseAudio: p = !0 } = {}) {
      const m = n(), y = it();
      if (Ut(m) !== "running") {
        p && m.audioPlaying && e({ audioPlaying: !1 });
        return;
      }
      const v = $y(m, y), l = {
        ...v,
        ...bt(v.timerState === "completed" ? "completed" : "paused", y),
        timerAnchorAtMs: null,
        timerPausedAtMs: y,
        audioPlaying: p ? !1 : m.audioPlaying
      };
      e(l), Bn({ ...m, ...l });
    },
    resetTimer() {
      const p = it(), m = {
        ...bt("idle", p),
        timerRestoreTarget: null,
        timerMode: "countdown",
        timerAnchorAtMs: null,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerDurationSeconds: mr(n()),
        audioPlaying: !1,
        startedAt: null,
        elapsedSeconds: 0,
        summaryRecord: null,
        ...Qs()
      };
      e(m), Bn({ ...n(), ...m });
    },
    skipTimer() {
      const p = n(), m = it(), y = Hn(p), v = {
        ...bt("completed", m),
        elapsedSeconds: y || Math.max(0, Number(p.elapsedSeconds) || 0),
        audioPlaying: !1,
        startedAt: p.startedAt || new Date(m).toISOString(),
        timerAnchorAtMs: null,
        timerPausedAtMs: m,
        timerDurationSeconds: y
      };
      e(v), Bn({ ...p, ...v });
    },
    tickTimer() {
      const p = n();
      if (p.view !== "session" || Ut(p) !== "running") return;
      const m = it(), y = Hn(p), v = y ? Math.min(y, Na(p, m)) : Na(p, m), l = y > 0 && v >= y ? "completed" : "running", f = {
        ...bt(l, m),
        elapsedSeconds: v,
        timerAnchorAtMs: l === "running" ? p.timerAnchorAtMs : null,
        timerPausedAtMs: l === "running" ? null : m,
        timerDurationSeconds: y,
        audioPlaying: l === "running" ? p.audioPlaying : !1
      };
      v === p.elapsedSeconds && l === Ut(p) || (e(f), Bn({ ...p, ...f }));
    },
    setTimerMode(p = "countdown") {
      const m = p === "countup" ? "countup" : "countdown", y = {
        timerMode: m,
        timerDurationSeconds: m === "countup" ? 0 : mr(n())
      };
      e(y), Bn({ ...n(), ...y });
    },
    startBreak() {
      const p = it(), m = {
        ...bt("break", p),
        timerRestoreTarget: null,
        timerAnchorAtMs: null,
        timerPausedAtMs: p,
        timerDurationSeconds: 0,
        audioPlaying: !1
      };
      e(m), Bn({ ...n(), ...m });
    },
    getTimerState() {
      return Ut(n());
    },
    endSession() {
      var w;
      const p = n(), m = it(), y = new Date(m).toISOString(), v = Ut(p) === "running" ? $y(p, m) : p, l = Hn(v), f = l ? Math.min(l, v.elapsedSeconds) : v.elapsedSeconds, S = yC({
        sessionId: (w = p.currentSession) == null ? void 0 : w.sessionId,
        materialId: "focus-room",
        materialTitle: "Focus Room",
        studyGoal: p.studyGoal,
        selectedScene: p.selectedScene,
        musicType: p.musicType,
        ambientSound: p.ambientSound,
        musicVolume: p.musicVolume,
        ambientVolume: p.ambientVolume,
        pomodoroDuration: p.pomodoroDuration,
        startedAt: p.startedAt || y,
        endedAt: y,
        totalFocusTime: f,
        flashcardsCompleted: 0,
        quizScore: null,
        mistakesMade: [],
        completedTasks: [],
        recommendedNextStep: "Start another protected focus block when you are ready."
      });
      pa("focus-room"), e({
        summaryRecord: S,
        sessionHistory: $c(),
        ...bt("completed", m),
        audioPlaying: !1,
        timerAnchorAtMs: null,
        timerPausedAtMs: m,
        timerDurationSeconds: l,
        elapsedSeconds: l ? Math.min(l, v.elapsedSeconds) : v.elapsedSeconds,
        currentSession: null
      });
    },
    closeSummary() {
      e({ summaryRecord: null });
    },
    setWorkspaceNotes(p) {
      e((m) => {
        const y = {
          workspaceNotes: String(p ?? ""),
          workspaceUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        return mn({ ...m, ...y }), y;
      });
    },
    setAssistantContext(p = {}) {
      e({ assistantContext: Zc(p) });
    },
    toggleTask(p) {
      e((m) => {
        const y = m.studyPlan[Number(p)];
        if (!y) return {};
        const v = String(y.task || ""), l = m.completedTasks.includes(v) ? m.completedTasks.filter((f) => f !== v) : [...m.completedTasks, v];
        return mn({ ...m, completedTasks: l }), { completedTasks: l };
      });
    },
    updatePlanTask(p, m = null, y = null) {
      e((v) => {
        const l = Number(p), f = v.studyPlan[l];
        if (!f) return {};
        const S = String(f.task || ""), w = y == null ? S : String(y || "").trim(), k = m == null ? f.minutes : wr(m, f.minutes, 1, za), A = v.studyPlan.map((M, N) => N === l ? { minutes: k, task: w || S } : M);
        let T = v.completedTasks;
        S && S !== A[l].task && T.includes(S) && (T = T.filter((M) => M !== S).concat(A[l].task));
        const E = { studyPlan: A, completedTasks: T };
        return mn({ ...v, ...E }), E;
      });
    },
    setFlashcardIndex(p) {
      const m = Oy(n().selectedMaterial);
      e({
        flashcardIndex: wr(p, n().flashcardIndex, 0, Math.max(0, m.length - 1)),
        flashcardSide: "front"
      });
    },
    flipFlashcard() {
      e((p) => ({
        flashcardSide: p.flashcardSide === "back" ? "front" : "back"
      }));
    },
    rateFlashcard(p) {
      const m = n(), y = Oy(m.selectedMaterial);
      if (!y.length) return;
      const v = wr(m.flashcardIndex, 0, 0, y.length - 1), l = y[v], f = ["easy", "medium", "hard"].includes(String(p)) ? String(p) : "medium";
      e({
        flashcardProgress: {
          ...m.flashcardProgress,
          [_C(l, v)]: {
            difficulty: f,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: v < y.length - 1 ? v + 1 : v
      });
    },
    answerQuizQuestion(p, m) {
      const y = Number(p), v = Yc(n().selectedMaterial)[y];
      if (!v) return;
      const l = String(y);
      e((f) => ({
        quizAnswers: {
          ...f.quizAnswers,
          [l]: PC(v, m, f.quizAnswers[l])
        }
      }));
    },
    checkQuizQuestion(p) {
      const m = Yc(n().selectedMaterial), y = Number(p), v = m[y];
      if (!v) return;
      const l = String(y), f = n(), S = Object.prototype.hasOwnProperty.call(f.quizAnswers, l) ? f.quizAnswers[l] : "", w = EC(v, S), k = x0(v);
      e({
        quizChecked: {
          ...f.quizChecked,
          [l]: {
            answer: S,
            correct: w === null ? !1 : w,
            hasKnownAnswer: w !== null,
            explanation: v.explanation || v.rationale || (k ? `Correct answer: ${k}` : ""),
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
    },
    async askAssistant(p) {
      const m = String(p || "").trim();
      if (!m) return;
      const y = n(), v = y.selectedMaterial, l = li(y.chatMessages).slice(-10).map((f) => ({
        role: f.role === "user" ? "user" : "assistant",
        content: f.text
      }));
      e({
        chatMessages: li([
          ...y.chatMessages,
          { role: "user", text: m, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        ]),
        chatPending: !0,
        chatError: ""
      });
      try {
        const f = await CP(m, l, v, y.assistantContext);
        e((S) => ({
          chatMessages: li([
            ...S.chatMessages,
            { role: "assistant", text: f.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: f.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (f) {
        e((S) => ({
          chatMessages: li([
            ...S.chatMessages,
            { role: "assistant", text: _0(m, v, n().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${f.message || "request failed"}`
        }));
      } finally {
        e({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return TP(n());
    },
    focusQuizScore() {
      return kP(n());
    },
    focusQuizMistakes() {
      return AP(n());
    },
    formatFocusedTime() {
      return y0(n().elapsedSeconds);
    }
  };
}), M0 = {
  minutes: Math.floor(g0 / 60),
  seconds: 59
}, PP = {
  minutes: 3,
  seconds: 2
};
function Gd(e) {
  const n = en(e, Hd);
  return {
    minutes: Math.floor(n / 60),
    seconds: n % 60
  };
}
function Wy(e, n) {
  const o = Math.max(0, Math.floor(Number(e) || 0)), i = Math.max(0, Math.floor(Number(n) || 0));
  return en(o * 60 + i, Hd);
}
function Jc(e, n) {
  return String(Math.max(0, Math.floor(Number(e) || 0))).padStart(2, "0");
}
function Kd(e) {
  const { minutes: n, seconds: o } = Gd(e);
  return `${Jc(n, "minutes")}:${Jc(o, "seconds")}`;
}
function EP(e, n, o) {
  const i = PP[o] || 2;
  return `${String(e || "").replace(/\D/g, "")}${String(n).replace(/\D/g, "")}`.slice(-i) || "";
}
function bP(e, n) {
  const o = Number(String(e || "").replace(/\D/g, "")) || 0;
  return Math.min(M0[n], o);
}
function MP(e, n, o) {
  const i = Gd(e), a = bP(o, n);
  return n === "seconds" ? Wy(i.minutes, a) : Wy(a, i.seconds);
}
const RP = { minutes: "Minutes", seconds: "Seconds" };
function Gy({
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
  const y = RP[e], v = (l) => {
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
  return /* @__PURE__ */ x.jsx("span", { className: `timer-editor-segment${i ? " is-active" : ""}`, children: /* @__PURE__ */ x.jsx(
    "span",
    {
      ref: m,
      className: "timer-editor-digits",
      role: "spinbutton",
      tabIndex: o ? -1 : 0,
      "aria-label": y,
      "aria-valuemin": 0,
      "aria-valuemax": M0[e],
      "aria-valuenow": n,
      "aria-valuetext": `${n} ${y.toLowerCase()}`,
      "aria-disabled": o || void 0,
      onFocus: () => a(e),
      onKeyDown: v,
      children: Jc(n, e)
    }
  ) });
}
function R0({
  valueSeconds: e,
  onChange: n,
  disabled: o = !1,
  size: i = "hero",
  ariaLabel: a = "Set focus block length",
  className: c = ""
}) {
  const { minutes: d, seconds: p } = Gd(e), [m, y] = C.useState(null), v = C.useRef(""), l = C.useRef(null), f = C.useRef(null), S = C.useRef(null), w = C.useCallback(() => {
    v.current = "";
  }, []), k = C.useCallback((M) => {
    v.current = "", y(M);
  }, []), A = C.useCallback(
    (M, N) => {
      if (o) return;
      const O = EP(v.current, N, M);
      v.current = O, y(M), n == null || n(MP(e, M, O));
    },
    [o, n, e]
  ), T = C.useCallback((M) => {
    var O;
    const N = M < 0 ? "minutes" : "seconds";
    v.current = "", y(N), (O = (M < 0 ? l : f).current) == null || O.focus();
  }, []), E = (M) => {
    var N;
    (N = S.current) != null && N.contains(M.relatedTarget) || (w(), y(null));
  };
  return /* @__PURE__ */ x.jsxs(
    "div",
    {
      ref: S,
      className: `timer-editor timer-editor-${i}${o ? " is-readonly" : ""} ${c}`.trim(),
      role: "group",
      "aria-label": a,
      onBlur: E,
      children: [
        o ? /* @__PURE__ */ x.jsx("span", { className: "timer-editor-static", "aria-hidden": "true", children: Kd(e) }) : /* @__PURE__ */ x.jsxs(x.Fragment, { children: [
          /* @__PURE__ */ x.jsx(
            Gy,
            {
              segment: "minutes",
              value: d,
              disabled: o,
              active: m === "minutes",
              segmentRef: l,
              onFocusSegment: k,
              onType: A,
              onCommit: w,
              onMove: T
            }
          ),
          /* @__PURE__ */ x.jsx("span", { className: "timer-editor-colon", "aria-hidden": "true", children: ":" }),
          /* @__PURE__ */ x.jsx(
            Gy,
            {
              segment: "seconds",
              value: p,
              disabled: o,
              active: m === "seconds",
              segmentRef: f,
              onFocusSegment: k,
              onType: A,
              onCommit: w,
              onMove: T
            }
          )
        ] }),
        !o && /* @__PURE__ */ x.jsx("span", { className: "sr-only", children: "Editable focus timer. Click minutes or seconds, then type digits to set the value." })
      ]
    }
  );
}
function _e({
  children: e,
  className: n = "",
  variant: o = "ghost",
  type: i = "button",
  ...a
}) {
  const { onPointerMove: c, onPointerLeave: d, ...p } = a;
  return /* @__PURE__ */ x.jsx(
    "button",
    {
      className: `glass-button glass-button-${o} ${n}`.trim(),
      type: i,
      onPointerMove: (m) => {
        const y = m.currentTarget.getBoundingClientRect();
        m.currentTarget.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, (m.clientX - y.left) / y.width * 100))}%`), m.currentTarget.style.setProperty("--glass-y", `${Math.max(0, Math.min(100, (m.clientY - y.top) / y.height * 100))}%`), c == null || c(m);
      },
      onPointerLeave: (m) => {
        m.currentTarget.style.setProperty("--glass-x", "50%"), m.currentTarget.style.setProperty("--glass-y", "0%"), d == null || d(m);
      },
      ...p,
      children: e
    }
  );
}
function DP({ scene: e, active: n, onSelect: o }) {
  return /* @__PURE__ */ x.jsxs(
    vn.button,
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
        /* @__PURE__ */ x.jsx("span", { className: "focus-pill", children: e.kicker }),
        /* @__PURE__ */ x.jsx("strong", { children: e.name }),
        /* @__PURE__ */ x.jsx("span", { children: e.description })
      ]
    }
  );
}
function Yd() {
  const e = Q((o) => o.selectedScene), n = Q((o) => o.selectScene);
  return /* @__PURE__ */ x.jsx("div", { className: "scene-selector", "aria-label": "Study scenes", children: kr.map((o) => /* @__PURE__ */ x.jsx(DP, { scene: o, active: o.id === e, onSelect: n }, o.id)) });
}
function D0(e, [n, o]) {
  return Math.min(o, Math.max(n, e));
}
function so(e, n, { checkForDefaultPrevented: o = !0 } = {}) {
  return function(a) {
    if (e == null || e(a), o === !1 || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  };
}
function Ky(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function NP(...e) {
  return (n) => {
    let o = !1;
    const i = e.map((a) => {
      const c = Ky(a, n);
      return !o && typeof c == "function" && (o = !0), c;
    });
    if (o)
      return () => {
        for (let a = 0; a < i.length; a++) {
          const c = i[a];
          typeof c == "function" ? c() : Ky(e[a], null);
        }
      };
  };
}
function _t(...e) {
  return C.useCallback(NP(...e), e);
}
function N0(e, n = []) {
  let o = [];
  function i(c, d) {
    const p = C.createContext(d);
    p.displayName = c + "Context";
    const m = o.length;
    o = [...o, d];
    const y = (l) => {
      var T;
      const { scope: f, children: S, ...w } = l, k = ((T = f == null ? void 0 : f[e]) == null ? void 0 : T[m]) || p, A = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ x.jsx(k.Provider, { value: A, children: S });
    };
    y.displayName = c + "Provider";
    function v(l, f) {
      var k;
      const S = ((k = f == null ? void 0 : f[e]) == null ? void 0 : k[m]) || p, w = C.useContext(S);
      if (w) return w;
      if (d !== void 0) return d;
      throw new Error(`\`${l}\` must be used within \`${c}\``);
    }
    return [y, v];
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
  return a.scopeName = e, [i, IP(a, ...n)];
}
function IP(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const o = () => {
    const i = e.map((a) => ({
      useScope: a(),
      scopeName: a.scopeName
    }));
    return function(c) {
      const d = i.reduce((p, { useScope: m, scopeName: y }) => {
        const l = m(c)[`__scope${y}`];
        return { ...p, ...l };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return o.scopeName = n.scopeName, o;
}
var on = globalThis != null && globalThis.document ? C.useLayoutEffect : () => {
}, Yy = Ar[" useEffectEvent ".trim().toString()], Qy = Ar[" useInsertionEffect ".trim().toString()];
function jP(e) {
  if (typeof Yy == "function")
    return Yy(e);
  const n = C.useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  return typeof Qy == "function" ? Qy(() => {
    n.current = e;
  }) : on(() => {
    n.current = e;
  }), C.useMemo(() => ((...o) => {
    var i;
    return (i = n.current) == null ? void 0 : i.call(n, ...o);
  }), []);
}
var FP = Ar[" useInsertionEffect ".trim().toString()] || on;
function OP({
  prop: e,
  defaultProp: n,
  onChange: o = () => {
  },
  caller: i
}) {
  const [a, c, d] = LP({
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
  const y = C.useCallback(
    (v) => {
      var l;
      if (p) {
        const f = VP(v) ? v(e) : v;
        f !== e && ((l = d.current) == null || l.call(d, f));
      } else
        c(v);
    },
    [p, e, c, d]
  );
  return [m, y];
}
function LP({
  defaultProp: e,
  onChange: n
}) {
  const [o, i] = C.useState(e), a = C.useRef(o), c = C.useRef(n);
  return FP(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== o && ((d = c.current) == null || d.call(c, o), a.current = o);
  }, [o, a]), [o, i, c];
}
function VP(e) {
  return typeof e == "function";
}
var BP = C.createContext(void 0);
function zP(e) {
  const n = C.useContext(BP);
  return e || n || "ltr";
}
function UP(e) {
  const n = C.useRef({ value: e, previous: e });
  return C.useMemo(() => (n.current.value !== e && (n.current.previous = n.current.value, n.current.value = e), n.current.previous), [e]);
}
function $P(e) {
  const [n, o] = C.useState(void 0);
  return on(() => {
    if (e) {
      o({ width: e.offsetWidth, height: e.offsetHeight });
      const i = new ResizeObserver((a) => {
        if (!Array.isArray(a) || !a.length)
          return;
        const c = a[0];
        let d, p;
        if ("borderBoxSize" in c) {
          const m = c.borderBoxSize, y = Array.isArray(m) ? m[0] : m;
          d = y.inlineSize, p = y.blockSize;
        } else
          d = e.offsetWidth, p = e.offsetHeight;
        o({ width: d, height: p });
      });
      return i.observe(e, { box: "border-box" }), () => i.unobserve(e);
    } else
      o(void 0);
  }, [e]), n;
}
var I0 = vg();
// @__NO_SIDE_EFFECTS__
function qc(e) {
  const n = C.forwardRef((o, i) => {
    let { children: a, ...c } = o, d = null, p = !1;
    const m = [];
    Xy(a) && typeof Xs == "function" && (a = Xs(a._payload)), C.Children.forEach(a, (f) => {
      var S;
      if (YP(f)) {
        p = !0;
        const w = f;
        let k = "child" in w.props ? w.props.child : w.props.children;
        Xy(k) && typeof Xs == "function" && (k = Xs(k._payload)), d = WP(w, k), m.push((S = d == null ? void 0 : d.props) == null ? void 0 : S.children);
      } else
        m.push(f);
    }), d ? d = C.cloneElement(d, void 0, m) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !p && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const y = d ? KP(d) : void 0, v = _t(i, y);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          p ? JP(e) : ZP(e)
        );
      return a;
    }
    const l = GP(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = i ? v : y), C.cloneElement(d, l);
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
      const m = c(...p);
      return a(...p), m;
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
function Xy(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === QP && "_payload" in e && XP(e._payload);
}
function XP(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var ZP = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, JP = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, Xs = Ar[" use ".trim().toString()], qP = [
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
], bi = qP.reduce((e, n) => {
  const o = /* @__PURE__ */ qc(`Primitive.${n}`), i = C.forwardRef((a, c) => {
    const { asChild: d, ...p } = a, m = d ? o : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ x.jsx(m, { ...p, ref: c });
  });
  return i.displayName = `Primitive.${n}`, { ...e, [n]: i };
}, {});
function eE(e) {
  const n = e + "CollectionProvider", [o, i] = N0(n), [a, c] = o(
    n,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), d = (k) => {
    const { scope: A, children: T } = k, E = C.useRef(null), M = C.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ x.jsx(a, { scope: A, itemMap: M, collectionRef: E, children: T });
  };
  d.displayName = n;
  const p = e + "CollectionSlot", m = /* @__PURE__ */ qc(p), y = C.forwardRef(
    (k, A) => {
      const { scope: T, children: E } = k, M = c(p, T), N = _t(A, M.collectionRef);
      return /* @__PURE__ */ x.jsx(m, { ref: N, children: E });
    }
  );
  y.displayName = p;
  const v = e + "CollectionItemSlot", l = "data-radix-collection-item", f = /* @__PURE__ */ qc(v), S = C.forwardRef(
    (k, A) => {
      const { scope: T, children: E, ...M } = k, N = C.useRef(null), O = _t(A, N), W = c(v, T);
      return C.useEffect(() => (W.itemMap.set(N, { ref: N, ...M }), () => void W.itemMap.delete(N))), /* @__PURE__ */ x.jsx(f, { [l]: "", ref: O, children: E });
    }
  );
  S.displayName = v;
  function w(k) {
    const A = c(e + "CollectionConsumer", k);
    return C.useCallback(() => {
      const E = A.collectionRef.current;
      if (!E) return [];
      const M = Array.from(E.querySelectorAll(`[${l}]`));
      return Array.from(A.itemMap.values()).sort(
        (W, G) => M.indexOf(W.ref.current) - M.indexOf(G.ref.current)
      );
    }, [A.collectionRef, A.itemMap]);
  }
  return [
    { Provider: d, Slot: y, ItemSlot: S },
    w,
    i
  ];
}
var j0 = ["PageUp", "PageDown"], F0 = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], O0 = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, yo = "Slider", [ed, tE, nE] = eE(yo), [Qd] = N0(yo, [
  nE
]), [rE, Mi] = Qd(yo), Xd = C.forwardRef(
  (e, n) => {
    const {
      name: o,
      min: i = 0,
      max: a = 100,
      step: c = 1,
      orientation: d = "horizontal",
      disabled: p = !1,
      minStepsBetweenThumbs: m = 0,
      defaultValue: y = [i],
      value: v,
      onValueChange: l = () => {
      },
      onValueCommit: f = () => {
      },
      inverted: S = !1,
      form: w,
      ...k
    } = e, A = C.useRef(/* @__PURE__ */ new Set()), T = C.useRef(0), E = C.useRef(!1), N = d === "horizontal" ? oE : iE, [O = [], W] = OP({
      prop: v,
      defaultProp: y,
      onChange: (q) => {
        var ue;
        (ue = [...A.current][T.current]) == null || ue.focus({
          preventScroll: !0,
          focusVisible: E.current
        }), E.current = !1, l(q);
      }
    }), G = C.useRef(O);
    function K(q) {
      const de = uE(O, q);
      ae(q, de);
    }
    function L(q) {
      ae(q, T.current);
    }
    function X() {
      const q = G.current[T.current];
      O[T.current] !== q && f(O);
    }
    function ae(q, de, { commit: ue } = { commit: !1 }) {
      const Te = pE(c), ve = mE(Math.round((q - i) / c) * c + i, Te), Se = D0(ve, [i, a]);
      W((U = []) => {
        const Z = aE(U, Se, de);
        if (fE(Z, m * c)) {
          T.current = Z.indexOf(Se);
          const Y = String(Z) !== String(U);
          return Y && ue && f(Z), Y ? Z : U;
        } else
          return U;
      });
    }
    return /* @__PURE__ */ x.jsx(
      rE,
      {
        scope: e.__scopeSlider,
        name: o,
        disabled: p,
        min: i,
        max: a,
        valueIndexToChangeRef: T,
        thumbs: A.current,
        values: O,
        orientation: d,
        form: w,
        children: /* @__PURE__ */ x.jsx(ed.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ x.jsx(ed.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ x.jsx(
          N,
          {
            "aria-disabled": p,
            "data-disabled": p ? "" : void 0,
            ...k,
            ref: n,
            onPointerDown: so(k.onPointerDown, () => {
              p || (G.current = O, E.current = !1);
            }),
            min: i,
            max: a,
            inverted: S,
            onSlideStart: p ? void 0 : K,
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
                const ve = j0.includes(q.key) || q.shiftKey && F0.includes(q.key) ? 10 : 1, Se = T.current, U = O[Se], Z = c * ve * de;
                ae(U + Z, Se, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Xd.displayName = yo;
var [L0, V0] = Qd(yo, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), oE = C.forwardRef(
  (e, n) => {
    const {
      min: o,
      max: i,
      dir: a,
      inverted: c,
      onSlideStart: d,
      onSlideMove: p,
      onSlideEnd: m,
      onStepKeyDown: y,
      ...v
    } = e, [l, f] = C.useState(null), S = _t(n, (M) => f(M)), w = C.useRef(void 0), k = zP(a), A = k === "ltr", T = A && !c || !A && c;
    function E(M) {
      const N = w.current || l.getBoundingClientRect(), O = [0, N.width], G = ef(O, T ? [o, i] : [i, o]);
      return w.current = N, G(M - N.left);
    }
    return /* @__PURE__ */ x.jsx(
      L0,
      {
        scope: e.__scopeSlider,
        startEdge: T ? "left" : "right",
        endEdge: T ? "right" : "left",
        direction: T ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ x.jsx(
          B0,
          {
            dir: k,
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
              const O = O0[T ? "from-left" : "from-right"].includes(M.key);
              y == null || y({ event: M, direction: O ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), iE = C.forwardRef(
  (e, n) => {
    const {
      min: o,
      max: i,
      inverted: a,
      onSlideStart: c,
      onSlideMove: d,
      onSlideEnd: p,
      onStepKeyDown: m,
      ...y
    } = e, v = C.useRef(null), l = _t(n, v), f = C.useRef(void 0), S = !a;
    function w(k) {
      const A = f.current || v.current.getBoundingClientRect(), T = [0, A.height], M = ef(T, S ? [i, o] : [o, i]);
      return f.current = A, M(k - A.top);
    }
    return /* @__PURE__ */ x.jsx(
      L0,
      {
        scope: e.__scopeSlider,
        startEdge: S ? "bottom" : "top",
        endEdge: S ? "top" : "bottom",
        size: "height",
        direction: S ? 1 : -1,
        children: /* @__PURE__ */ x.jsx(
          B0,
          {
            "data-orientation": "vertical",
            ...y,
            ref: l,
            style: {
              ...y.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (k) => {
              const A = w(k.clientY);
              c == null || c(A);
            },
            onSlideMove: (k) => {
              const A = w(k.clientY);
              d == null || d(A);
            },
            onSlideEnd: () => {
              f.current = void 0, p == null || p();
            },
            onStepKeyDown: (k) => {
              const T = O0[S ? "from-bottom" : "from-top"].includes(k.key);
              m == null || m({ event: k, direction: T ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), B0 = C.forwardRef(
  (e, n) => {
    const {
      __scopeSlider: o,
      onSlideStart: i,
      onSlideMove: a,
      onSlideEnd: c,
      onHomeKeyDown: d,
      onEndKeyDown: p,
      onStepKeyDown: m,
      ...y
    } = e, v = Mi(yo, o);
    return /* @__PURE__ */ x.jsx(
      bi.span,
      {
        ...y,
        ref: n,
        onKeyDown: so(e.onKeyDown, (l) => {
          l.key === "Home" ? (d(l), l.preventDefault()) : l.key === "End" ? (p(l), l.preventDefault()) : j0.concat(F0).includes(l.key) && (m(l), l.preventDefault());
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
), z0 = "SliderTrack", Zd = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Mi(z0, o);
    return /* @__PURE__ */ x.jsx(
      bi.span,
      {
        "data-disabled": a.disabled ? "" : void 0,
        "data-orientation": a.orientation,
        ...i,
        ref: n
      }
    );
  }
);
Zd.displayName = z0;
var td = "SliderRange", Jd = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Mi(td, o), c = V0(td, o), d = C.useRef(null), p = _t(n, d), m = a.values.length, y = a.values.map(
      (f) => Q0(f, a.min, a.max)
    ), v = m > 1 ? Math.min(...y) : 0, l = 100 - Math.max(...y);
    return /* @__PURE__ */ x.jsx(
      bi.span,
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
Jd.displayName = td;
var U0 = "SliderThumb", [sE, $0] = Qd(U0), H0 = "SliderThumbProvider";
function W0(e) {
  const {
    __scopeSlider: n,
    name: o,
    children: i,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: a
  } = e, c = Mi(H0, n), d = tE(n), [p, m] = C.useState(null), y = C.useMemo(
    () => p ? d().findIndex((A) => A.ref.current === p) : -1,
    [d, p]
  ), v = $P(p), l = p ? !!c.form || !!p.closest("form") : !0, f = c.values[y], S = o ?? (c.name ? c.name + (c.values.length > 1 ? "[]" : "") : void 0), w = f === void 0 ? 0 : Q0(f, c.min, c.max);
  C.useEffect(() => {
    if (p)
      return c.thumbs.add(p), () => {
        c.thumbs.delete(p);
      };
  }, [p, c.thumbs]);
  const k = {
    value: f,
    name: S,
    form: c.form,
    isFormControl: l,
    index: y,
    thumb: p,
    onThumbChange: m,
    percent: w,
    size: v
  };
  return /* @__PURE__ */ x.jsx(sE, { scope: n, ...k, children: hE(a) ? a(k) : i });
}
W0.displayName = H0;
var ma = "SliderThumbTrigger", G0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Mi(ma, o), c = V0(ma, o), { index: d, value: p, percent: m, size: y, onThumbChange: v } = $0(
      ma,
      o
    ), l = _t(n, (k) => v(k)), f = lE(d, a.values.length), S = y == null ? void 0 : y[c.size], w = S ? cE(S, m, c.direction) : 0;
    return /* @__PURE__ */ x.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [c.startEdge]: `calc(${m}% + ${w}px)`
        },
        children: /* @__PURE__ */ x.jsx(ed.ItemSlot, { scope: o, children: /* @__PURE__ */ x.jsx(
          bi.span,
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
G0.displayName = ma;
var qd = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, name: i, ...a } = e;
    return /* @__PURE__ */ x.jsx(
      W0,
      {
        __scopeSlider: o,
        name: i,
        internal_do_not_use_render: ({ index: c, isFormControl: d }) => /* @__PURE__ */ x.jsxs(x.Fragment, { children: [
          /* @__PURE__ */ x.jsx(
            G0,
            {
              ...a,
              ref: n,
              __scopeSlider: o
            }
          ),
          d ? /* @__PURE__ */ x.jsx(
            Y0,
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
qd.displayName = U0;
var K0 = "SliderBubbleInput", Y0 = C.forwardRef(
  ({ __scopeSlider: e, ...n }, o) => {
    const { value: i, name: a, form: c } = $0(K0, e), d = C.useRef(null), p = _t(d, o), m = UP(i);
    return C.useEffect(() => {
      const y = d.current;
      if (!y) return;
      const v = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(v, "value").set;
      if (m !== i && f) {
        const S = new Event("input", { bubbles: !0 });
        f.call(y, i), y.dispatchEvent(S);
      }
    }, [m, i]), /* @__PURE__ */ x.jsx(
      bi.input,
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
Y0.displayName = K0;
function aE(e = [], n, o) {
  const i = [...e];
  return i[o] = n, i.sort((a, c) => a - c);
}
function Q0(e, n, o) {
  const c = 100 / (o - n) * (e - n);
  return D0(c, [0, 100]);
}
function lE(e, n) {
  return n > 2 ? `Value ${e + 1} of ${n}` : n === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function uE(e, n) {
  if (e.length === 1) return 0;
  const o = e.map((a) => Math.abs(a - n)), i = Math.min(...o);
  return o.indexOf(i);
}
function cE(e, n, o) {
  const i = e / 2, c = ef([0, 50], [0, i]);
  return (i - c(n) * o) * o;
}
function dE(e) {
  return e.slice(0, -1).map((n, o) => e[o + 1] - n);
}
function fE(e, n) {
  if (n > 0) {
    const o = dE(e);
    return Math.min(...o) >= n;
  }
  return !0;
}
function ef(e, n) {
  return (o) => {
    if (e[0] === e[1] || n[0] === n[1]) return n[0];
    const i = (n[1] - n[0]) / (e[1] - e[0]);
    return n[0] + i * (o - e[0]);
  };
}
function pE(e) {
  if (!Number.isFinite(e)) return 0;
  const n = e.toString();
  if (n.includes("e")) {
    const [i, a] = n.split("e"), c = i.split(".")[1] || "", d = Number(a);
    return Math.max(0, c.length - d);
  }
  const o = n.split(".")[1];
  return o ? o.length : 0;
}
function mE(e, n) {
  const o = Math.pow(10, n);
  return Math.round(e * o) / o;
}
function hE(e) {
  return typeof e == "function";
}
function Zy({ label: e, icon: n, value: o, onChange: i }) {
  return /* @__PURE__ */ x.jsxs("label", { className: "sound-slider", children: [
    /* @__PURE__ */ x.jsxs("span", { className: "sound-slider-head", children: [
      /* @__PURE__ */ x.jsxs("span", { className: "sound-slider-label", children: [
        n,
        /* @__PURE__ */ x.jsx("span", { children: e })
      ] }),
      /* @__PURE__ */ x.jsxs("strong", { children: [
        o,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ x.jsxs(
      Xd,
      {
        className: "radix-slider-root",
        value: [o],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (a) => i(a[0]),
        children: [
          /* @__PURE__ */ x.jsx(Zd, { className: "radix-slider-track", children: /* @__PURE__ */ x.jsx(Jd, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ x.jsx(qd, { className: "radix-slider-thumb", "aria-label": e })
        ]
      }
    )
  ] });
}
function X0({ audioState: e }) {
  const n = Q((v) => v.musicType), o = Q((v) => v.ambientSound), i = Q((v) => v.musicVolume), a = Q((v) => v.ambientVolume), c = Q((v) => v.audioPlaying), d = Q((v) => v.setSound), p = Q((v) => v.toggleAudio), m = Ba({ musicType: n, ambientSound: o }), y = m.ambientLayers.map((v) => v.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ x.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ x.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ x.jsx("select", { value: n, onChange: (v) => d("musicType", v.target.value), children: Gn.map((v) => /* @__PURE__ */ x.jsx("option", { value: v.label, children: v.label }, v.label)) })
    ] }),
    /* @__PURE__ */ x.jsx(
      Zy,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ x.jsx(Ua, { size: 16, "aria-hidden": "true" }),
        value: i,
        onChange: (v) => d("musicVolume", v)
      }
    ),
    /* @__PURE__ */ x.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ x.jsx("select", { value: o, onChange: (v) => d("ambientSound", v.target.value), children: Kn.map((v) => /* @__PURE__ */ x.jsx("option", { value: v.label, children: v.label }, v.label)) })
    ] }),
    /* @__PURE__ */ x.jsx(
      Zy,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ x.jsx(P0, { size: 16, "aria-hidden": "true" }),
        value: a,
        onChange: (v) => d("ambientVolume", v)
      }
    ),
    /* @__PURE__ */ x.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ x.jsxs("div", { children: [
        /* @__PURE__ */ x.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ x.jsx("strong", { children: m.musicTrack.title }),
        /* @__PURE__ */ x.jsx("p", { children: y }),
        e != null && e.error ? /* @__PURE__ */ x.jsx("p", { className: "audio-error", children: e.error }) : null
      ] }),
      /* @__PURE__ */ x.jsx(_e, { variant: c ? "primary" : "ghost", onClick: p, children: c ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ x.jsx("div", { className: "audio-links", children: [m.musicTrack, ...m.ambientLayers].filter((v) => v == null ? void 0 : v.pageUrl).map((v) => /* @__PURE__ */ x.jsx("a", { href: v.pageUrl, target: "_blank", rel: "noreferrer", children: v.title || v.label || "Audio source" }, v.pageUrl)) })
  ] });
}
function yE({ audioState: e, onWorkspace: n }) {
  const o = Q((f) => f.selectedScene), i = Q((f) => f.pomodoroDurationSeconds), a = Q((f) => f.studyGoal), c = Q((f) => f.setPomodoroDuration), d = Q((f) => f.setPomodoroDurationSeconds), p = Q((f) => f.setStudyGoal), m = Q((f) => f.startSession), y = nn(o), v = !!(o && i > 0 && String(a || "").trim()), l = () => {
    v && m();
  };
  return /* @__PURE__ */ x.jsxs("section", { className: "focus-setup-stage", "aria-label": "Focus Room setup", "data-focus-setup": "true", children: [
    /* @__PURE__ */ x.jsxs("header", { className: "focus-setup-heading", children: [
      /* @__PURE__ */ x.jsxs("button", { type: "button", className: "focus-wordmark", onClick: n, "aria-label": "Return to Synapse workspace", children: [
        /* @__PURE__ */ x.jsx("span", { className: "focus-wordmark-mark", children: "S" }),
        /* @__PURE__ */ x.jsx("span", { children: "synapse" })
      ] }),
      /* @__PURE__ */ x.jsx("div", { className: "focus-setup-heading-actions", children: /* @__PURE__ */ x.jsxs(_e, { className: "setup-quiet-action", onClick: n, children: [
        /* @__PURE__ */ x.jsx(VC, { size: 14, "aria-hidden": "true" }),
        " Workspace"
      ] }) })
    ] }),
    /* @__PURE__ */ x.jsxs("div", { className: "focus-setup-layout", children: [
      /* @__PURE__ */ x.jsxs(Ly, { className: "focus-setup-scenes", children: [
        /* @__PURE__ */ x.jsxs("div", { className: "setup-panel-intro", children: [
          /* @__PURE__ */ x.jsx("span", { className: "focus-step-label", children: "Step 01" }),
          /* @__PURE__ */ x.jsx("h1", { children: "Choose your study scene" }),
          /* @__PURE__ */ x.jsx("p", { children: "Pick the atmosphere first. The live preview behind this panel updates as you choose." })
        ] }),
        /* @__PURE__ */ x.jsx(Yd, {}),
        /* @__PURE__ */ x.jsxs("div", { className: "focus-setup-scene-preview", "aria-live": "polite", children: [
          /* @__PURE__ */ x.jsx("span", { className: "focus-pill", children: "Selected" }),
          /* @__PURE__ */ x.jsx("strong", { children: y.name }),
          /* @__PURE__ */ x.jsx("span", { children: y.description || "Quiet study room" })
        ] })
      ] }),
      /* @__PURE__ */ x.jsxs(Ly, { className: "focus-setup-controls", children: [
        /* @__PURE__ */ x.jsx("span", { className: "focus-step-label", children: "Step 02" }),
        /* @__PURE__ */ x.jsx("h2", { children: "Set sound atmosphere" }),
        /* @__PURE__ */ x.jsx(X0, { audioState: e }),
        /* @__PURE__ */ x.jsx("span", { className: "focus-step-label", children: "Step 03" }),
        /* @__PURE__ */ x.jsx("h2", { children: "Set Pomodoro" }),
        /* @__PURE__ */ x.jsx("div", { className: "duration-grid", "aria-label": "Pomodoro duration presets", children: u0.map((f) => {
          const S = f * 60 === i;
          return /* @__PURE__ */ x.jsxs(
            _e,
            {
              variant: S ? "primary" : "ghost",
              "aria-pressed": S,
              onClick: () => c(f),
              children: [
                /* @__PURE__ */ x.jsx(UC, { size: 16, "aria-hidden": "true" }),
                " ",
                f,
                "m"
              ]
            },
            f
          );
        }) }),
        /* @__PURE__ */ x.jsxs("div", { className: "focus-field focus-field-timer", children: [
          /* @__PURE__ */ x.jsx("span", { className: "focus-field-label", children: "Custom duration" }),
          /* @__PURE__ */ x.jsx(
            R0,
            {
              valueSeconds: i,
              onChange: d,
              size: "setup",
              ariaLabel: "Set custom Pomodoro length"
            }
          ),
          /* @__PURE__ */ x.jsx("span", { className: "focus-field-hint", children: "Click minutes or seconds, then type digits to set the length." })
        ] }),
        /* @__PURE__ */ x.jsxs("label", { className: "focus-field setup-goal-field", children: [
          "Focus intention",
          /* @__PURE__ */ x.jsx(
            "textarea",
            {
              value: a,
              onChange: (f) => p(f.target.value),
              placeholder: "What will you protect this block for?",
              rows: 3
            }
          )
        ] }),
        /* @__PURE__ */ x.jsx("p", { className: "setup-plan-hint", children: "After you enter, your timer, sound mix, and scene stay ready. You can still fine-tune room settings inside the Focus Room." }),
        /* @__PURE__ */ x.jsxs(
          _e,
          {
            className: "enter-focus-btn",
            variant: "primary",
            onClick: l,
            disabled: !v,
            "data-focus-enter": "true",
            children: [
              /* @__PURE__ */ x.jsx(cP, { size: 18, "aria-hidden": "true" }),
              " Enter Focus Room"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function gE({ onWorkspace: e, onOpenTrail: n, onOpenCompanion: o, onOpenSettings: i, onExit: a }) {
  const c = Q((p) => p.selectedScene), d = nn(c);
  return /* @__PURE__ */ x.jsxs("header", { className: "focus-room-header", children: [
    /* @__PURE__ */ x.jsxs("button", { type: "button", className: "focus-wordmark", onClick: e, "aria-label": "Return to Synapse workspace", children: [
      /* @__PURE__ */ x.jsx("span", { className: "focus-wordmark-mark", children: "S" }),
      /* @__PURE__ */ x.jsx("span", { children: "synapse" })
    ] }),
    /* @__PURE__ */ x.jsxs("div", { className: "focus-room-context", "aria-label": "Current focus context", children: [
      /* @__PURE__ */ x.jsx("span", { children: d.name }),
      /* @__PURE__ */ x.jsx("small", { children: "Quiet study room" })
    ] }),
    /* @__PURE__ */ x.jsxs("nav", { className: "focus-room-header-actions", "aria-label": "Focus Room controls", children: [
      /* @__PURE__ */ x.jsxs(_e, { className: "header-icon-button", onClick: n, title: "Open Focus Trail", "aria-label": "Open Focus Trail", children: [
        /* @__PURE__ */ x.jsx(Ra, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: "Focus Trail" })
      ] }),
      /* @__PURE__ */ x.jsxs(_e, { className: "header-icon-button", onClick: o, title: "Open Companion Room", "aria-label": "Open Companion Room", children: [
        /* @__PURE__ */ x.jsx(Da, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: "Companion" })
      ] }),
      /* @__PURE__ */ x.jsxs(_e, { className: "header-icon-button", onClick: i, title: "Open room settings", "aria-label": "Open room settings", children: [
        /* @__PURE__ */ x.jsx(C0, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: "Settings" })
      ] }),
      /* @__PURE__ */ x.jsxs(_e, { className: "header-icon-button header-exit-button", onClick: a, title: "Exit Focus Room", "aria-label": "Exit Focus Room", children: [
        /* @__PURE__ */ x.jsx(GC, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: "Exit" })
      ] })
    ] })
  ] });
}
function vE(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function SE({ onFocusMode: e, audioState: n }) {
  const o = Q((L) => L.timerStatus), i = Q((L) => L.elapsedSeconds), a = Q((L) => L.pomodoroDuration), c = Q((L) => L.pomodoroDurationSeconds), d = Q((L) => L.timerMode), p = Q((L) => L.studyGoal), m = Q((L) => L.currentSession), y = Q((L) => L.startTimer), v = Q((L) => L.pauseTimer), l = Q((L) => L.resetTimer), f = Q((L) => L.skipTimer), S = Q((L) => L.toggleAudio), w = Q((L) => L.audioPlaying), k = Q((L) => L.setPomodoroDurationSeconds), A = Number(c) || (Number(a) || 0) * 60, T = d === "countup" ? i : Math.max(0, A - i), E = o === "paused", M = o === "studying", N = o === "completed", O = o === "idle" && d !== "countup", W = N && d !== "countup" ? "00:00" : Kc(T), G = E ? "Paused" : N ? "Complete" : M ? "In focus" : "Ready", K = E ? "Resume timer" : M ? "Pause timer" : "Start timer";
  return /* @__PURE__ */ x.jsxs("div", { className: "focus-session-dock liquid-glass", "aria-label": "Focus session controls", children: [
    /* @__PURE__ */ x.jsxs("div", { className: "dock-timer-block", children: [
      /* @__PURE__ */ x.jsxs("div", { className: "dock-eyebrow", children: [
        "POMODORO #",
        (m == null ? void 0 : m.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ x.jsxs("div", { className: "dock-status", children: [
        /* @__PURE__ */ x.jsx("span", { className: `dock-status-dot ${E || !M ? "is-paused" : ""}` }),
        G
      ] }),
      O ? /* @__PURE__ */ x.jsx(
        R0,
        {
          className: "dock-time-editor",
          valueSeconds: A,
          onChange: k,
          size: "dock",
          ariaLabel: "Set focus block length"
        }
      ) : /* @__PURE__ */ x.jsx("strong", { className: "dock-time", "aria-live": "off", children: W }),
      /* @__PURE__ */ x.jsx("div", { className: "dock-progress", "aria-hidden": "true", children: /* @__PURE__ */ x.jsx("span", { style: { width: `${vE(i, A)}%` } }) })
    ] }),
    /* @__PURE__ */ x.jsxs("div", { className: "dock-goal-block", children: [
      /* @__PURE__ */ x.jsx("span", { className: "dock-eyebrow", children: "TODAY'S GOAL" }),
      /* @__PURE__ */ x.jsx("strong", { children: p || "A quiet block for meaningful progress" }),
      /* @__PURE__ */ x.jsxs("span", { className: "dock-goal-meta", children: [
        d === "countup" ? "Count-up" : `${Kd(A)} block`,
        " · ",
        Kc(i),
        " focused"
      ] })
    ] }),
    /* @__PURE__ */ x.jsxs("div", { className: "dock-action-block", children: [
      /* @__PURE__ */ x.jsxs(_e, { className: "dock-action-button", onClick: S, "aria-label": w ? "Pause room audio" : "Play room audio", children: [
        w ? /* @__PURE__ */ x.jsx(By, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ x.jsx(Ua, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: n != null && n.playing ? "Pause audio" : "Audio" })
      ] }),
      /* @__PURE__ */ x.jsxs(_e, { className: "dock-action-button", onClick: () => M ? v() : y(), variant: "primary", "aria-label": K, children: [
        M ? /* @__PURE__ */ x.jsx(By, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ x.jsx(JC, { size: 15, fill: "currentColor", "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: E ? "Resume" : M ? "Pause" : "Start" })
      ] }),
      /* @__PURE__ */ x.jsxs(_e, { className: "dock-action-button", onClick: f, "aria-label": "Skip timer", children: [
        /* @__PURE__ */ x.jsx(sP, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: "Skip" })
      ] }),
      /* @__PURE__ */ x.jsxs(_e, { className: "dock-action-button", onClick: l, "aria-label": "Reset timer", children: [
        /* @__PURE__ */ x.jsx(eP, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: "Reset" })
      ] }),
      /* @__PURE__ */ x.jsxs(_e, { className: "dock-focus-mode", onClick: e, "aria-label": "Enter distraction-free Focus Mode", children: [
        /* @__PURE__ */ x.jsx(lP, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: "Focus Mode" })
      ] })
    ] })
  ] });
}
var wE = Object.defineProperty, go = (e, n) => wE(e, "name", { value: n, configurable: !0 }), Z0 = !!(typeof window < "u" && window.document && window.document.createElement);
function _r(e, n, { checkForDefaultPrevented: o = !0 } = {}) {
  return /* @__PURE__ */ go(function(a) {
    if (e == null || e(a), o === !1 || !a || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  }, "handleEvent");
}
go(_r, "composeEventHandlers");
function xE(e) {
  var n;
  if (!Z0)
    throw new Error("Cannot access window outside of the DOM");
  return ((n = e == null ? void 0 : e.ownerDocument) == null ? void 0 : n.defaultView) ?? window;
}
go(xE, "getOwnerWindow");
function nd(e) {
  if (!Z0)
    throw new Error("Cannot access document outside of the DOM");
  return (e == null ? void 0 : e.ownerDocument) ?? document;
}
go(nd, "getOwnerDocument");
function J0(e, n = !1) {
  const { activeElement: o } = nd(e);
  if (!(o != null && o.nodeName))
    return null;
  if (q0(o) && o.contentDocument)
    return J0(o.contentDocument.body, n);
  if (n) {
    const i = o.getAttribute("aria-activedescendant");
    if (i) {
      const a = nd(o).getElementById(i);
      if (a)
        return a;
    }
  }
  return o;
}
go(J0, "getActiveElement");
function q0(e) {
  return e.tagName === "IFRAME";
}
go(q0, "isFrame");
function _E(e, n = []) {
  let o = [];
  function i(c, d) {
    const p = C.createContext(d);
    p.displayName = c + "Context";
    const m = o.length;
    o = [...o, d];
    const y = (l) => {
      var T;
      const { scope: f, children: S, ...w } = l, k = ((T = f == null ? void 0 : f[e]) == null ? void 0 : T[m]) || p, A = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ x.jsx(k.Provider, { value: A, children: S });
    };
    y.displayName = c + "Provider";
    function v(l, f, S = {}) {
      var T;
      const { optional: w = !1 } = S, k = ((T = f == null ? void 0 : f[e]) == null ? void 0 : T[m]) || p, A = C.useContext(k);
      if (A) return A;
      if (d !== void 0) return d;
      if (!w)
        throw new Error(`\`${l}\` must be used within \`${c}\``);
    }
    return [y, v];
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
  return a.scopeName = e, [i, TE(a, ...n)];
}
function TE(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const o = () => {
    const i = e.map((a) => ({
      useScope: a(),
      scopeName: a.scopeName
    }));
    return function(c) {
      const d = i.reduce((p, { useScope: m, scopeName: y }) => {
        const l = m(c)[`__scope${y}`];
        return { ...p, ...l };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return o.scopeName = n.scopeName, o;
}
var kE = Ar[" useId ".trim().toString()] || (() => {
}), AE = 0;
function sc(e) {
  const [n, o] = C.useState(kE());
  return on(() => {
    o((i) => i ?? String(AE++));
  }, [e]), e || (n ? `radix-${n}` : "");
}
var CE = Object.defineProperty, Ri = (e, n) => CE(e, "name", { value: n, configurable: !0 }), PE = Ar[" useInsertionEffect ".trim().toString()] || on;
function eS({
  prop: e,
  defaultProp: n,
  onChange: o = /* @__PURE__ */ Ri(() => {
  }, "onChange"),
  caller: i
}) {
  const [a, c, d] = tS({
    defaultProp: n,
    onChange: o
  }), p = e !== void 0, m = p ? e : a, y = C.useCallback(
    (v) => {
      var l;
      if (p) {
        const f = nS(v) ? v(e) : v;
        f !== e && ((l = d.current) == null || l.call(d, f));
      } else
        c(v);
    },
    [p, e, c, d]
  );
  return [m, y];
}
Ri(eS, "useControllableState");
function tS({
  defaultProp: e,
  onChange: n
}) {
  const [o, i] = C.useState(e), a = C.useRef(o), c = C.useRef(n);
  return PE(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== o && ((d = c.current) == null || d.call(c, o), a.current = o);
  }, [o, a]), [o, i, c];
}
Ri(tS, "useUncontrolledState");
function nS(e) {
  return typeof e == "function";
}
Ri(nS, "isFunction");
var Jy = Symbol("RADIX:SYNC_STATE");
function EE(e, n, o, i) {
  const { prop: a, defaultProp: c, onChange: d, caller: p } = n, m = a !== void 0, y = jP(d), v = [{ ...o, state: c }];
  i && v.push(i);
  const [l, f] = C.useReducer(
    (A, T) => {
      if (T.type === Jy)
        return { ...A, state: T.state };
      const E = e(A, T);
      return m && !Object.is(E.state, A.state) && y(E.state), E;
    },
    ...v
  ), S = l.state, w = C.useRef(S);
  C.useEffect(() => {
    w.current !== S && (w.current = S, m || y(S));
  }, [S, w, m]);
  const k = C.useMemo(() => a !== void 0 ? { ...l, state: a } : l, [l, a]);
  return C.useEffect(() => {
    m && !Object.is(a, l.state) && f({ type: Jy, state: a });
  }, [a, l.state, m]), [k, f];
}
Ri(EE, "useControllableStateReducer");
// @__NO_SIDE_EFFECTS__
function rS(e) {
  const n = C.forwardRef((o, i) => {
    let { children: a, ...c } = o, d = null, p = !1;
    const m = [];
    qy(a) && typeof Zs == "function" && (a = Zs(a._payload)), C.Children.forEach(a, (f) => {
      var S;
      if (NE(f)) {
        p = !0;
        const w = f;
        let k = "child" in w.props ? w.props.child : w.props.children;
        qy(k) && typeof Zs == "function" && (k = Zs(k._payload)), d = ME(w, k), m.push((S = d == null ? void 0 : d.props) == null ? void 0 : S.children);
      } else
        m.push(f);
    }), d ? d = C.cloneElement(d, void 0, m) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !p && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const y = d ? DE(d) : void 0, v = _t(i, y);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          p ? OE(e) : FE(e)
        );
      return a;
    }
    const l = RE(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = i ? v : y), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var bE = Symbol.for("radix.slottable"), ME = (e, n) => {
  if ("child" in e.props) {
    const o = e.props.child;
    return C.isValidElement(o) ? C.cloneElement(o, void 0, e.props.children(o.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function RE(e, n) {
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
function DE(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
function NE(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === bE;
}
var IE = Symbol.for("react.lazy");
function qy(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === IE && "_payload" in e && jE(e._payload);
}
function jE(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var FE = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, OE = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, Zs = Ar[" use ".trim().toString()], LE = [
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
], vo = LE.reduce((e, n) => {
  const o = /* @__PURE__ */ rS(`Primitive.${n}`), i = C.forwardRef((a, c) => {
    const { asChild: d, ...p } = a, m = d ? o : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ x.jsx(m, { ...p, ref: c });
  });
  return i.displayName = `Primitive.${n}`, { ...e, [n]: i };
}, {});
function VE(e, n) {
  e && I0.flushSync(() => e.dispatchEvent(n));
}
function xi(e) {
  const n = C.useRef(e);
  return C.useEffect(() => {
    n.current = e;
  }), C.useMemo(() => ((...o) => {
    var i;
    return (i = n.current) == null ? void 0 : i.call(n, ...o);
  }), []);
}
var BE = Object.defineProperty, Ye = (e, n) => BE(e, "name", { value: n, configurable: !0 }), rd = "dismissableLayer.update", zE = "dismissableLayer.pointerDownOutside", UE = "dismissableLayer.focusOutside", eg, oS = C.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
}), $E = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ Ye(function(n, o) {
    const {
      disableOutsidePointerEvents: i = !1,
      deferPointerDownOutside: a = !1,
      onEscapeKeyDown: c,
      onPointerDownOutside: d,
      onFocusOutside: p,
      onInteractOutside: m,
      onDismiss: y,
      ...v
    } = n, l = C.useContext(oS), [f, S] = C.useState(null), w = (f == null ? void 0 : f.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, k] = C.useState({}), A = _t(o, S), T = Array.from(l.layers), [E] = [
      ...l.layersWithOutsidePointerEventsDisabled
    ].slice(-1), M = E ? T.indexOf(E) : -1, N = f ? T.indexOf(f) : -1, O = l.layersWithOutsidePointerEventsDisabled.size > 0, W = N >= M, G = C.useRef(!1), K = sS(
      (q) => {
        d == null || d(q), m == null || m(q), q.defaultPrevented || y == null || y();
      },
      {
        ownerDocument: w,
        deferPointerDownOutside: a,
        isDeferredPointerDownOutsideRef: G,
        dismissableSurfaces: l.dismissableSurfaces,
        shouldHandlePointerDownOutside: C.useCallback(
          (q) => {
            if (!(q instanceof Node))
              return !1;
            const de = [...l.branches].some(
              (ue) => ue.contains(q)
            );
            return W && !de;
          },
          [l.branches, W]
        )
      }
    ), L = aS((q) => {
      if (a && G.current)
        return;
      const de = q.target;
      [...l.branches].some((Te) => Te.contains(de)) || (p == null || p(q), m == null || m(q), q.defaultPrevented || y == null || y());
    }, w), X = f ? N === T.length - 1 : !1, ae = xi((q) => {
      q.key === "Escape" && (c == null || c(q), !q.defaultPrevented && y && (q.preventDefault(), y()));
    });
    return C.useEffect(() => {
      if (X)
        return w.addEventListener("keydown", ae, { capture: !0 }), () => w.removeEventListener("keydown", ae, { capture: !0 });
    }, [w, X, ae]), C.useEffect(() => {
      if (f)
        return i && (l.layersWithOutsidePointerEventsDisabled.size === 0 && (eg = w.body.style.pointerEvents, w.body.style.pointerEvents = "none"), l.layersWithOutsidePointerEventsDisabled.add(f)), l.layers.add(f), od(), () => {
          i && (l.layersWithOutsidePointerEventsDisabled.delete(f), l.layersWithOutsidePointerEventsDisabled.size === 0 && (w.body.style.pointerEvents = eg));
        };
    }, [f, w, i, l]), C.useEffect(() => () => {
      f && (l.layers.delete(f), l.layersWithOutsidePointerEventsDisabled.delete(f), od());
    }, [f, l]), C.useEffect(() => {
      const q = /* @__PURE__ */ Ye(() => k({}), "handleUpdate");
      return document.addEventListener(rd, q), () => document.removeEventListener(rd, q);
    }, []), /* @__PURE__ */ x.jsx(
      vo.div,
      {
        ...v,
        ref: A,
        style: {
          pointerEvents: O ? W ? "auto" : "none" : void 0,
          ...n.style
        },
        onFocusCapture: _r(n.onFocusCapture, L.onFocusCapture),
        onBlurCapture: _r(n.onBlurCapture, L.onBlurCapture),
        onPointerDownCapture: _r(
          n.onPointerDownCapture,
          K.onPointerDownCapture
        )
      }
    );
  }, "DismissableLayer")
);
function iS() {
  const e = C.useContext(oS), [n, o] = C.useState(null);
  return C.useEffect(() => {
    if (n)
      return e.dismissableSurfaces.add(n), () => {
        e.dismissableSurfaces.delete(n);
      };
  }, [n, e.dismissableSurfaces]), o;
}
Ye(iS, "useDismissableLayerSurface");
var HE = /* @__PURE__ */ Ye(() => !0, "IS_TRUE");
function sS(e, n) {
  const {
    ownerDocument: o = globalThis == null ? void 0 : globalThis.document,
    deferPointerDownOutside: i = !1,
    isDeferredPointerDownOutsideRef: a,
    dismissableSurfaces: c,
    shouldHandlePointerDownOutside: d = HE
  } = n, p = xi(e), m = C.useRef(!1), y = C.useRef(!1), v = C.useRef(/* @__PURE__ */ new Map()), l = C.useRef(() => {
  });
  return C.useEffect(() => {
    function f() {
      y.current = !1, a.current = !1, v.current.clear();
    }
    Ye(f, "resetOutsideInteraction");
    function S() {
      return Array.from(v.current.values()).some(Boolean);
    }
    Ye(S, "isOutsideInteractionIntercepted");
    function w(M) {
      if (!y.current)
        return;
      const N = M.target;
      N instanceof Node && [...c].some((W) => W.contains(N)) || v.current.set(M.type, !0), M.type === "click" && window.setTimeout(() => {
        y.current && l.current();
      }, 0);
    }
    Ye(w, "handleInteractionCapture");
    function k(M) {
      y.current && v.current.set(M.type, !1);
    }
    Ye(k, "handleInteractionBubble");
    const A = /* @__PURE__ */ Ye((M) => {
      if (M.target && !m.current) {
        let N = function() {
          o.removeEventListener("click", l.current);
          const W = S();
          f(), W || tf(
            zE,
            p,
            O,
            { discrete: !0 }
          );
        };
        if (Ye(N, "handleAndDispatchPointerDownOutsideEvent"), !d(M.target)) {
          o.removeEventListener("click", l.current), f(), m.current = !1;
          return;
        }
        const O = { originalEvent: M };
        y.current = !0, a.current = i && M.button === 0, v.current.clear(), !i || M.button !== 0 ? N() : (o.removeEventListener("click", l.current), l.current = N, o.addEventListener("click", l.current, { once: !0 }));
      } else
        o.removeEventListener("click", l.current), f();
      m.current = !1;
    }, "handlePointerDown"), T = [
      "pointerup",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "click"
    ];
    for (const M of T)
      o.addEventListener(M, w, !0), o.addEventListener(M, k);
    const E = window.setTimeout(() => {
      o.addEventListener("pointerdown", A);
    }, 0);
    return () => {
      window.clearTimeout(E), o.removeEventListener("pointerdown", A), o.removeEventListener("click", l.current);
      for (const M of T)
        o.removeEventListener(M, w, !0), o.removeEventListener(M, k);
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
    onPointerDownCapture: /* @__PURE__ */ Ye(() => m.current = !0, "onPointerDownCapture")
  };
}
Ye(sS, "usePointerDownOutside");
function aS(e, n = globalThis == null ? void 0 : globalThis.document) {
  const o = xi(e), i = C.useRef(!1);
  return C.useEffect(() => {
    const a = /* @__PURE__ */ Ye((c) => {
      c.target && !i.current && tf(UE, o, { originalEvent: c }, {
        discrete: !1
      });
    }, "handleFocus");
    return n.addEventListener("focusin", a), () => n.removeEventListener("focusin", a);
  }, [n, o]), {
    onFocusCapture: /* @__PURE__ */ Ye(() => i.current = !0, "onFocusCapture"),
    onBlurCapture: /* @__PURE__ */ Ye(() => i.current = !1, "onBlurCapture")
  };
}
Ye(aS, "useFocusOutside");
function od() {
  const e = new CustomEvent(rd);
  document.dispatchEvent(e);
}
Ye(od, "dispatchUpdate");
function tf(e, n, o, { discrete: i }) {
  const a = o.originalEvent.target, c = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: o });
  n && a.addEventListener(e, n, { once: !0 }), i ? VE(a, c) : a.dispatchEvent(c);
}
Ye(tf, "handleAndDispatchCustomEvent");
var WE = Object.defineProperty, lt = (e, n) => WE(e, "name", { value: n, configurable: !0 }), ac = "focusScope.autoFocusOnMount", lc = "focusScope.autoFocusOnUnmount", tg = { bubbles: !1, cancelable: !0 }, GE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ lt(function(n, o) {
    const {
      loop: i = !1,
      trapped: a = !1,
      onMountAutoFocus: c,
      onUnmountAutoFocus: d,
      ...p
    } = n, [m, y] = C.useState(null), v = xi(c), l = xi(d), f = C.useRef(null), S = _t(o, y), w = C.useRef({
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
        let A = function(N) {
          if (w.paused || !m) return;
          const O = N.target;
          m.contains(O) ? f.current = O : yn(f.current, { select: !0 });
        }, T = function(N) {
          if (w.paused || !m) return;
          const O = N.relatedTarget;
          O !== null && (m.contains(O) || yn(f.current, { select: !0 }));
        }, E = function(N) {
          if (document.activeElement === document.body)
            for (const W of N)
              W.removedNodes.length > 0 && yn(m);
        };
        lt(A, "handleFocusIn"), lt(T, "handleFocusOut"), lt(E, "handleMutations"), document.addEventListener("focusin", A), document.addEventListener("focusout", T);
        const M = new MutationObserver(E);
        return m && M.observe(m, { childList: !0, subtree: !0 }), () => {
          document.removeEventListener("focusin", A), document.removeEventListener("focusout", T), M.disconnect();
        };
      }
    }, [a, m, w.paused]), C.useEffect(() => {
      if (m) {
        ng.add(w);
        const A = document.activeElement;
        if (!m.contains(A)) {
          const E = new CustomEvent(ac, tg);
          m.addEventListener(ac, v), m.dispatchEvent(E), E.defaultPrevented || (lS(pS(nf(m)), { select: !0 }), document.activeElement === A && yn(m));
        }
        return () => {
          m.removeEventListener(ac, v), setTimeout(() => {
            const E = new CustomEvent(lc, tg);
            m.addEventListener(lc, l), m.dispatchEvent(E), E.defaultPrevented || yn(A ?? document.body, { select: !0 }), m.removeEventListener(lc, l), ng.remove(w);
          }, 0);
        };
      }
    }, [m, v, l, w]);
    const k = C.useCallback(
      (A) => {
        if (!i && !a || w.paused) return;
        const T = A.key === "Tab" && !A.altKey && !A.ctrlKey && !A.metaKey, E = document.activeElement;
        if (T && E) {
          const M = A.currentTarget, [N, O] = uS(M);
          N && O ? !A.shiftKey && E === O ? (A.preventDefault(), i && yn(N, { select: !0 })) : A.shiftKey && E === N && (A.preventDefault(), i && yn(O, { select: !0 })) : E === M && A.preventDefault();
        }
      },
      [i, a, w.paused]
    );
    return /* @__PURE__ */ x.jsx(vo.div, { tabIndex: -1, ...p, ref: S, onKeyDown: k });
  }, "FocusScope")
);
function lS(e, { select: n = !1 } = {}) {
  const o = document.activeElement;
  for (const i of e)
    if (yn(i, { select: n }), document.activeElement !== o) return;
}
lt(lS, "focusFirst");
function uS(e) {
  const n = nf(e), o = id(n, e), i = id(n.reverse(), e);
  return [o, i];
}
lt(uS, "getTabbableEdges");
function nf(e) {
  const n = [], o = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: /* @__PURE__ */ lt((i) => {
      const a = i.tagName === "INPUT" && i.type === "hidden";
      return i.disabled || i.hidden || a ? NodeFilter.FILTER_SKIP : i.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }, "acceptNode")
  });
  for (; o.nextNode(); ) n.push(o.currentNode);
  return n;
}
lt(nf, "getTabbableCandidates");
function id(e, n) {
  const o = typeof n.checkVisibility == "function" && n.checkVisibility({ checkVisibilityCSS: !0 });
  for (const i of e)
    if (!(o ? !i.checkVisibility({ checkVisibilityCSS: !0 }) : cS(i, { upTo: n })))
      return i;
}
lt(id, "findVisible");
function cS(e, { upTo: n }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (n !== void 0 && e === n) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
lt(cS, "isHidden");
function dS(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
lt(dS, "isSelectableInput");
function yn(e, { select: n = !1 } = {}) {
  if (e && e.focus) {
    const o = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== o && dS(e) && n && e.select();
  }
}
lt(yn, "focus");
var ng = fS();
function fS() {
  let e = [];
  return {
    add(n) {
      const o = e[0];
      n !== o && (o == null || o.pause()), e = sd(e, n), e.unshift(n);
    },
    remove(n) {
      var o;
      e = sd(e, n), (o = e[0]) == null || o.resume();
    }
  };
}
lt(fS, "createFocusScopesStack");
function sd(e, n) {
  const o = [...e], i = o.indexOf(n);
  return i !== -1 && o.splice(i, 1), o;
}
lt(sd, "arrayRemove");
function pS(e) {
  return e.filter((n) => n.tagName !== "A");
}
lt(pS, "removeLinks");
var KE = Object.defineProperty, YE = (e, n) => KE(e, "name", { value: n, configurable: !0 }), QE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ YE(function(n, o) {
    var m;
    const { container: i, ...a } = n, [c, d] = C.useState(!1);
    on(() => d(!0), []);
    const p = i || c && ((m = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : m.body);
    return p ? I0.createPortal(/* @__PURE__ */ x.jsx(vo.div, { ...a, ref: o }), p) : null;
  }, "Portal")
), XE = Object.defineProperty, Sn = (e, n) => XE(e, "name", { value: n, configurable: !0 });
function mS(e, n) {
  return C.useReducer((o, i) => n[o][i] ?? o, e);
}
Sn(mS, "useStateMachine");
var rf = /* @__PURE__ */ Sn((e) => {
  const { present: n, children: o } = e, i = hS(n), a = typeof o == "function" ? o({ present: i.isPresent }) : C.Children.only(o), c = yS(i.ref, gS(a));
  return typeof o == "function" || i.isPresent ? C.cloneElement(a, { ref: c }) : null;
}, "Presence");
function hS(e) {
  const [n, o] = C.useState(), i = C.useRef(null), a = C.useRef(e), c = C.useRef("none"), d = C.useRef(void 0), p = e ? "mounted" : "unmounted", [m, y] = mS(p, {
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
    m === "mounted" ? (c.current = d.current ?? no(i.current), d.current = void 0) : c.current = "none";
  }, [m]), on(() => {
    const v = i.current, l = a.current;
    if (l !== e) {
      const S = c.current, w = no(v);
      e ? (d.current = w, y("MOUNT")) : w === "none" || (v == null ? void 0 : v.display) === "none" ? y("UNMOUNT") : y(l && S !== w ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
    }
  }, [e, y]), on(() => {
    if (n) {
      let v;
      const l = n.ownerDocument.defaultView ?? window, f = /* @__PURE__ */ Sn((w) => {
        const A = no(i.current).includes(CSS.escape(w.animationName));
        if (w.target === n && A && (y("ANIMATION_END"), !a.current)) {
          const T = n.style.animationFillMode;
          n.style.animationFillMode = "forwards", v = l.setTimeout(() => {
            n.style.animationFillMode === "forwards" && (n.style.animationFillMode = T);
          });
        }
      }, "handleAnimationEnd"), S = /* @__PURE__ */ Sn((w) => {
        w.target === n && (c.current = no(i.current));
      }, "handleAnimationStart");
      return n.addEventListener("animationstart", S), n.addEventListener("animationcancel", f), n.addEventListener("animationend", f), () => {
        l.clearTimeout(v), n.removeEventListener("animationstart", S), n.removeEventListener("animationcancel", f), n.removeEventListener("animationend", f);
      };
    } else
      y("ANIMATION_END");
  }, [n, y]), {
    isPresent: ["mounted", "unmountSuspended"].includes(m),
    ref: C.useCallback((v) => {
      if (v) {
        const l = getComputedStyle(v);
        i.current = l, d.current = no(l);
      } else
        i.current = null;
      o(v);
    }, [])
  };
}
Sn(hS, "usePresence");
function ad(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
Sn(ad, "setRef");
function yS(...e) {
  const n = C.useRef(e);
  return n.current = e, C.useCallback((o) => {
    const i = n.current;
    let a = !1;
    const c = i.map((d) => {
      const p = ad(d, o);
      return !a && typeof p == "function" && (a = !0), p;
    });
    if (a)
      return () => {
        for (let d = 0; d < c.length; d++) {
          const p = c[d];
          typeof p == "function" ? p() : ad(i[d], null);
        }
      };
  }, []);
}
Sn(yS, "useStableComposedRefs");
function no(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
Sn(no, "getAnimationName");
function gS(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
Sn(gS, "getElementRef");
var Js = 0, Xt = null;
function ZE() {
  C.useEffect(() => {
    Xt || (Xt = { start: rg(), end: rg() });
    const { start: e, end: n } = Xt;
    return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== n && document.body.insertAdjacentElement("beforeend", n), Js++, () => {
      Js === 1 && (Xt == null || Xt.start.remove(), Xt == null || Xt.end.remove(), Xt = null), Js = Math.max(0, Js - 1);
    };
  }, []);
}
function rg() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var qt = function() {
  return qt = Object.assign || function(n) {
    for (var o, i = 1, a = arguments.length; i < a; i++) {
      o = arguments[i];
      for (var c in o) Object.prototype.hasOwnProperty.call(o, c) && (n[c] = o[c]);
    }
    return n;
  }, qt.apply(this, arguments);
};
function vS(e, n) {
  var o = {};
  for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && n.indexOf(i) < 0 && (o[i] = e[i]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var a = 0, i = Object.getOwnPropertySymbols(e); a < i.length; a++)
      n.indexOf(i[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, i[a]) && (o[i[a]] = e[i[a]]);
  return o;
}
function JE(e, n, o) {
  if (o || arguments.length === 2) for (var i = 0, a = n.length, c; i < a; i++)
    (c || !(i in n)) && (c || (c = Array.prototype.slice.call(n, 0, i)), c[i] = n[i]);
  return e.concat(c || Array.prototype.slice.call(n));
}
var ha = "right-scroll-bar-position", ya = "width-before-scroll-bar", qE = "with-scroll-bars-hidden", eb = "--removed-body-scroll-bar-size";
function uc(e, n) {
  return typeof e == "function" ? e(n) : e && (e.current = n), e;
}
function tb(e, n) {
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
var nb = typeof window < "u" ? C.useLayoutEffect : C.useEffect, og = /* @__PURE__ */ new WeakMap();
function rb(e, n) {
  var o = tb(null, function(i) {
    return e.forEach(function(a) {
      return uc(a, i);
    });
  });
  return nb(function() {
    var i = og.get(o);
    if (i) {
      var a = new Set(i), c = new Set(e), d = o.current;
      a.forEach(function(p) {
        c.has(p) || uc(p, null);
      }), c.forEach(function(p) {
        a.has(p) || uc(p, d);
      });
    }
    og.set(o, e);
  }, [e]), o;
}
function ob(e) {
  return e;
}
function ib(e, n) {
  n === void 0 && (n = ob);
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
      }, y = function() {
        return Promise.resolve().then(m);
      };
      y(), o = {
        push: function(v) {
          d.push(v), y();
        },
        filter: function(v) {
          return d = d.filter(v), o;
        }
      };
    }
  };
  return a;
}
function sb(e) {
  e === void 0 && (e = {});
  var n = ib(null);
  return n.options = qt({ async: !0, ssr: !1 }, e), n;
}
var SS = function(e) {
  var n = e.sideCar, o = vS(e, ["sideCar"]);
  if (!n)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var i = n.read();
  if (!i)
    throw new Error("Sidecar medium not found");
  return C.createElement(i, qt({}, o));
};
SS.isSideCarExport = !0;
function ab(e, n) {
  return e.useMedium(n), SS;
}
var wS = sb(), cc = function() {
}, $a = C.forwardRef(function(e, n) {
  var o = C.useRef(null), i = C.useState({
    onScrollCapture: cc,
    onWheelCapture: cc,
    onTouchMoveCapture: cc
  }), a = i[0], c = i[1], d = e.forwardProps, p = e.children, m = e.className, y = e.removeScrollBar, v = e.enabled, l = e.shards, f = e.sideCar, S = e.noRelative, w = e.noIsolation, k = e.inert, A = e.allowPinchZoom, T = e.as, E = T === void 0 ? "div" : T, M = e.gapMode, N = vS(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), O = f, W = rb([o, n]), G = qt(qt({}, N), a);
  return C.createElement(
    C.Fragment,
    null,
    v && C.createElement(O, { sideCar: wS, removeScrollBar: y, shards: l, noRelative: S, noIsolation: w, inert: k, setCallbacks: c, allowPinchZoom: !!A, lockRef: o, gapMode: M }),
    d ? C.cloneElement(C.Children.only(p), qt(qt({}, G), { ref: W })) : C.createElement(E, qt({}, G, { className: m, ref: W }), p)
  );
});
$a.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
$a.classNames = {
  fullWidth: ya,
  zeroRight: ha
};
var lb = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function ub() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var n = lb();
  return n && e.setAttribute("nonce", n), e;
}
function cb(e, n) {
  e.styleSheet ? e.styleSheet.cssText = n : e.appendChild(document.createTextNode(n));
}
function db(e) {
  var n = document.head || document.getElementsByTagName("head")[0];
  n.appendChild(e);
}
var fb = function() {
  var e = 0, n = null;
  return {
    add: function(o) {
      e == 0 && (n = ub()) && (cb(n, o), db(n)), e++;
    },
    remove: function() {
      e--, !e && n && (n.parentNode && n.parentNode.removeChild(n), n = null);
    }
  };
}, pb = function() {
  var e = fb();
  return function(n, o) {
    C.useEffect(function() {
      return e.add(n), function() {
        e.remove();
      };
    }, [n && o]);
  };
}, xS = function() {
  var e = pb(), n = function(o) {
    var i = o.styles, a = o.dynamic;
    return e(i, a), null;
  };
  return n;
}, mb = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, dc = function(e) {
  return parseInt(e || "", 10) || 0;
}, hb = function(e) {
  var n = window.getComputedStyle(document.body), o = n[e === "padding" ? "paddingLeft" : "marginLeft"], i = n[e === "padding" ? "paddingTop" : "marginTop"], a = n[e === "padding" ? "paddingRight" : "marginRight"];
  return [dc(o), dc(i), dc(a)];
}, yb = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return mb;
  var n = hb(e), o = document.documentElement.clientWidth, i = window.innerWidth;
  return {
    left: n[0],
    top: n[1],
    right: n[2],
    gap: Math.max(0, i - o + n[2] - n[0])
  };
}, gb = xS(), lo = "data-scroll-locked", vb = function(e, n, o, i) {
  var a = e.left, c = e.top, d = e.right, p = e.gap;
  return o === void 0 && (o = "margin"), `
  .`.concat(qE, ` {
   overflow: hidden `).concat(i, `;
   padding-right: `).concat(p, "px ").concat(i, `;
  }
  body[`).concat(lo, `] {
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
  
  .`).concat(ha, ` {
    right: `).concat(p, "px ").concat(i, `;
  }
  
  .`).concat(ya, ` {
    margin-right: `).concat(p, "px ").concat(i, `;
  }
  
  .`).concat(ha, " .").concat(ha, ` {
    right: 0 `).concat(i, `;
  }
  
  .`).concat(ya, " .").concat(ya, ` {
    margin-right: 0 `).concat(i, `;
  }
  
  body[`).concat(lo, `] {
    `).concat(eb, ": ").concat(p, `px;
  }
`);
}, ig = function() {
  var e = parseInt(document.body.getAttribute(lo) || "0", 10);
  return isFinite(e) ? e : 0;
}, Sb = function() {
  C.useEffect(function() {
    return document.body.setAttribute(lo, (ig() + 1).toString()), function() {
      var e = ig() - 1;
      e <= 0 ? document.body.removeAttribute(lo) : document.body.setAttribute(lo, e.toString());
    };
  }, []);
}, wb = function(e) {
  var n = e.noRelative, o = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
  Sb();
  var c = C.useMemo(function() {
    return yb(a);
  }, [a]);
  return C.createElement(gb, { styles: vb(c, !n, a, o ? "" : "!important") });
}, ld = !1;
if (typeof window < "u")
  try {
    var qs = Object.defineProperty({}, "passive", {
      get: function() {
        return ld = !0, !0;
      }
    });
    window.addEventListener("test", qs, qs), window.removeEventListener("test", qs, qs);
  } catch {
    ld = !1;
  }
var Jr = ld ? { passive: !1 } : !1, xb = function(e) {
  return e.tagName === "TEXTAREA";
}, _S = function(e, n) {
  if (!(e instanceof Element))
    return !1;
  var o = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    o[n] !== "hidden" && // contains scroll inside self
    !(o.overflowY === o.overflowX && !xb(e) && o[n] === "visible")
  );
}, _b = function(e) {
  return _S(e, "overflowY");
}, Tb = function(e) {
  return _S(e, "overflowX");
}, sg = function(e, n) {
  var o = n.ownerDocument, i = n;
  do {
    typeof ShadowRoot < "u" && i instanceof ShadowRoot && (i = i.host);
    var a = TS(e, i);
    if (a) {
      var c = kS(e, i), d = c[1], p = c[2];
      if (d > p)
        return !0;
    }
    i = i.parentNode;
  } while (i && i !== o.body);
  return !1;
}, kb = function(e) {
  var n = e.scrollTop, o = e.scrollHeight, i = e.clientHeight;
  return [
    n,
    o,
    i
  ];
}, Ab = function(e) {
  var n = e.scrollLeft, o = e.scrollWidth, i = e.clientWidth;
  return [
    n,
    o,
    i
  ];
}, TS = function(e, n) {
  return e === "v" ? _b(n) : Tb(n);
}, kS = function(e, n) {
  return e === "v" ? kb(n) : Ab(n);
}, Cb = function(e, n) {
  return e === "h" && n === "rtl" ? -1 : 1;
}, Pb = function(e, n, o, i, a) {
  var c = Cb(e, window.getComputedStyle(n).direction), d = c * i, p = o.target, m = n.contains(p), y = !1, v = d > 0, l = 0, f = 0;
  do {
    if (!p)
      break;
    var S = kS(e, p), w = S[0], k = S[1], A = S[2], T = k - A - c * w;
    (w || T) && TS(e, p) && (l += T, f += w);
    var E = p.parentNode;
    p = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !m && p !== document.body || // self content
    m && (n.contains(p) || n === p)
  );
  return (v && Math.abs(l) < 1 || !v && Math.abs(f) < 1) && (y = !0), y;
}, ea = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, ag = function(e) {
  return [e.deltaX, e.deltaY];
}, lg = function(e) {
  return e && "current" in e ? e.current : e;
}, Eb = function(e, n) {
  return e[0] === n[0] && e[1] === n[1];
}, bb = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, Mb = 0, qr = [];
function Rb(e) {
  var n = C.useRef([]), o = C.useRef([0, 0]), i = C.useRef(), a = C.useState(Mb++)[0], c = C.useState(xS)[0], d = C.useRef(e);
  C.useEffect(function() {
    d.current = e;
  }, [e]), C.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(a));
      var k = JE([e.lockRef.current], (e.shards || []).map(lg), !0).filter(Boolean);
      return k.forEach(function(A) {
        return A.classList.add("allow-interactivity-".concat(a));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(a)), k.forEach(function(A) {
          return A.classList.remove("allow-interactivity-".concat(a));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var p = C.useCallback(function(k, A) {
    if ("touches" in k && k.touches.length === 2 || k.type === "wheel" && k.ctrlKey)
      return !d.current.allowPinchZoom;
    var T = ea(k), E = o.current, M = "deltaX" in k ? k.deltaX : E[0] - T[0], N = "deltaY" in k ? k.deltaY : E[1] - T[1], O, W = k.target, G = Math.abs(M) > Math.abs(N) ? "h" : "v";
    if ("touches" in k && G === "h" && W.type === "range")
      return !1;
    var K = window.getSelection(), L = K && K.anchorNode, X = L ? L === W || L.contains(W) : !1;
    if (X)
      return !1;
    var ae = sg(G, W);
    if (!ae)
      return !0;
    if (ae ? O = G : (O = G === "v" ? "h" : "v", ae = sg(G, W)), !ae)
      return !1;
    if (!i.current && "changedTouches" in k && (M || N) && (i.current = O), !O)
      return !0;
    var q = i.current || O;
    return Pb(q, A, k, q === "h" ? M : N);
  }, []), m = C.useCallback(function(k) {
    var A = k;
    if (!(!qr.length || qr[qr.length - 1] !== c)) {
      var T = "deltaY" in A ? ag(A) : ea(A), E = n.current.filter(function(O) {
        return O.name === A.type && (O.target === A.target || A.target === O.shadowParent) && Eb(O.delta, T);
      })[0];
      if (E && E.should) {
        A.cancelable && A.preventDefault();
        return;
      }
      if (!E) {
        var M = (d.current.shards || []).map(lg).filter(Boolean).filter(function(O) {
          return O.contains(A.target);
        }), N = M.length > 0 ? p(A, M[0]) : !d.current.noIsolation;
        N && A.cancelable && A.preventDefault();
      }
    }
  }, []), y = C.useCallback(function(k, A, T, E) {
    var M = { name: k, delta: A, target: T, should: E, shadowParent: Db(T) };
    n.current.push(M), setTimeout(function() {
      n.current = n.current.filter(function(N) {
        return N !== M;
      });
    }, 1);
  }, []), v = C.useCallback(function(k) {
    o.current = ea(k), i.current = void 0;
  }, []), l = C.useCallback(function(k) {
    y(k.type, ag(k), k.target, p(k, e.lockRef.current));
  }, []), f = C.useCallback(function(k) {
    y(k.type, ea(k), k.target, p(k, e.lockRef.current));
  }, []);
  C.useEffect(function() {
    return qr.push(c), e.setCallbacks({
      onScrollCapture: l,
      onWheelCapture: l,
      onTouchMoveCapture: f
    }), document.addEventListener("wheel", m, Jr), document.addEventListener("touchmove", m, Jr), document.addEventListener("touchstart", v, Jr), function() {
      qr = qr.filter(function(k) {
        return k !== c;
      }), document.removeEventListener("wheel", m, Jr), document.removeEventListener("touchmove", m, Jr), document.removeEventListener("touchstart", v, Jr);
    };
  }, []);
  var S = e.removeScrollBar, w = e.inert;
  return C.createElement(
    C.Fragment,
    null,
    w ? C.createElement(c, { styles: bb(a) }) : null,
    S ? C.createElement(wb, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function Db(e) {
  for (var n = null; e !== null; )
    e instanceof ShadowRoot && (n = e.host, e = e.host), e = e.parentNode;
  return n;
}
const Nb = ab(wS, Rb);
var AS = C.forwardRef(function(e, n) {
  return C.createElement($a, qt({}, e, { ref: n, sideCar: Nb }));
});
AS.classNames = $a.classNames;
var Ib = function(e) {
  if (typeof document > "u")
    return null;
  var n = Array.isArray(e) ? e[0] : e;
  return n.ownerDocument.body;
}, eo = /* @__PURE__ */ new WeakMap(), ta = /* @__PURE__ */ new WeakMap(), na = {}, fc = 0, CS = function(e) {
  return e && (e.host || CS(e.parentNode));
}, jb = function(e, n) {
  return n.map(function(o) {
    if (e.contains(o))
      return o;
    var i = CS(o);
    return i && e.contains(i) ? i : (console.error("aria-hidden", o, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(o) {
    return !!o;
  });
}, Fb = function(e, n, o, i) {
  var a = jb(n, Array.isArray(e) ? e : [e]);
  na[o] || (na[o] = /* @__PURE__ */ new WeakMap());
  var c = na[o], d = [], p = /* @__PURE__ */ new Set(), m = new Set(a), y = function(l) {
    !l || p.has(l) || (p.add(l), y(l.parentNode));
  };
  a.forEach(y);
  var v = function(l) {
    !l || m.has(l) || Array.prototype.forEach.call(l.children, function(f) {
      if (p.has(f))
        v(f);
      else
        try {
          var S = f.getAttribute(i), w = S !== null && S !== "false", k = (eo.get(f) || 0) + 1, A = (c.get(f) || 0) + 1;
          eo.set(f, k), c.set(f, A), d.push(f), k === 1 && w && ta.set(f, !0), A === 1 && f.setAttribute(o, "true"), w || f.setAttribute(i, "true");
        } catch (T) {
          console.error("aria-hidden: cannot operate on ", f, T);
        }
    });
  };
  return v(n), p.clear(), fc++, function() {
    d.forEach(function(l) {
      var f = eo.get(l) - 1, S = c.get(l) - 1;
      eo.set(l, f), c.set(l, S), f || (ta.has(l) || l.removeAttribute(i), ta.delete(l)), S || l.removeAttribute(o);
    }), fc--, fc || (eo = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), ta = /* @__PURE__ */ new WeakMap(), na = {});
  };
}, Ob = function(e, n, o) {
  o === void 0 && (o = "data-aria-hidden");
  var i = Array.from(Array.isArray(e) ? e : [e]), a = Ib(e);
  return a ? (i.push.apply(i, Array.from(a.querySelectorAll("[aria-live], script"))), Fb(i, a, o, "aria-hidden")) : function() {
    return null;
  };
}, Lb = Object.defineProperty, Ht = (e, n) => Lb(e, "name", { value: n, configurable: !0 }), of = "Dialog", [PS] = _E(of), [Vb, wn] = PS(of), Bb = /* @__PURE__ */ Ht((e) => {
  const {
    __scopeDialog: n,
    children: o,
    open: i,
    defaultOpen: a,
    onOpenChange: c,
    modal: d = !0
  } = e, p = C.useRef(null), m = C.useRef(null), [y, v] = eS({
    prop: i,
    defaultProp: a ?? !1,
    onChange: c,
    caller: of
  }), [l, f] = C.useState(0), [S, w] = C.useState(0);
  return /* @__PURE__ */ x.jsx(
    Vb,
    {
      scope: n,
      triggerRef: p,
      contentRef: m,
      contentId: sc(),
      titleId: sc(),
      descriptionId: sc(),
      titlePresent: l > 0,
      descriptionPresent: S > 0,
      setTitleCount: f,
      setDescriptionCount: w,
      open: y,
      onOpenChange: v,
      onOpenToggle: C.useCallback(() => v((k) => !k), [v]),
      modal: d,
      children: o
    }
  );
}, "Dialog"), ES = "DialogPortal", [zb, bS] = PS(ES, {
  forceMount: void 0
}), Ub = /* @__PURE__ */ Ht((e) => {
  const { __scopeDialog: n, forceMount: o, children: i, container: a } = e, c = wn(ES, n);
  return /* @__PURE__ */ x.jsx(zb, { scope: n, forceMount: o, children: C.Children.map(i, (d) => /* @__PURE__ */ x.jsx(rf, { present: o || c.open, children: /* @__PURE__ */ x.jsx(QE, { asChild: !0, container: a, children: d }) })) });
}, "DialogPortal"), ud = "DialogOverlay", $b = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ Ht(function(n, o) {
    const i = bS(ud, n.__scopeDialog), { forceMount: a = i.forceMount, ...c } = n, d = wn(ud, n.__scopeDialog);
    return d.modal ? /* @__PURE__ */ x.jsx(rf, { present: a || d.open, children: /* @__PURE__ */ x.jsx(Wb, { ...c, ref: o }) }) : null;
  }, "DialogOverlay")
), Hb = /* @__PURE__ */ rS("DialogOverlay.RemoveScroll"), Wb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ Ht(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = wn(ud, i), d = iS(), p = _t(o, d);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ x.jsx(AS, { as: Hb, allowPinchZoom: !0, shards: [c.contentRef], children: /* @__PURE__ */ x.jsx(
        vo.div,
        {
          "data-state": sf(c.open),
          ...a,
          ref: p,
          style: { pointerEvents: "auto", ...a.style }
        }
      ) })
    );
  }, "DialogOverlayImpl")
), _i = "DialogContent", Gb = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ Ht(function(n, o) {
    const i = bS(_i, n.__scopeDialog), { forceMount: a = i.forceMount, ...c } = n, d = wn(_i, n.__scopeDialog);
    return /* @__PURE__ */ x.jsx(rf, { present: a || d.open, children: d.modal ? /* @__PURE__ */ x.jsx(Kb, { ...c, ref: o }) : /* @__PURE__ */ x.jsx(Yb, { ...c, ref: o }) });
  }, "DialogContent")
), Kb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ Ht(function(n, o) {
    const i = wn(_i, n.__scopeDialog), a = C.useRef(null), c = _t(o, i.contentRef, a);
    return C.useEffect(() => {
      const d = a.current;
      if (d) return Ob(d);
    }, []), /* @__PURE__ */ x.jsx(
      MS,
      {
        ...n,
        ref: c,
        trapFocus: i.open,
        disableOutsidePointerEvents: i.open,
        onCloseAutoFocus: _r(n.onCloseAutoFocus, (d) => {
          var p;
          d.preventDefault(), (p = i.triggerRef.current) == null || p.focus();
        }),
        onPointerDownOutside: _r(n.onPointerDownOutside, (d) => {
          const p = d.detail.originalEvent, m = p.button === 0 && p.ctrlKey === !0;
          (p.button === 2 || m) && d.preventDefault();
        }),
        onFocusOutside: _r(
          n.onFocusOutside,
          (d) => d.preventDefault()
        )
      }
    );
  }, "DialogContentModal")
), Yb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ Ht(function(n, o) {
    const i = wn(_i, n.__scopeDialog), a = C.useRef(!1), c = C.useRef(!1);
    return /* @__PURE__ */ x.jsx(
      MS,
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
          var y, v;
          (y = n.onInteractOutside) == null || y.call(n, d), d.defaultPrevented || (a.current = !0, d.detail.originalEvent.type === "pointerdown" && (c.current = !0));
          const p = d.target;
          ((v = i.triggerRef.current) == null ? void 0 : v.contains(p)) && d.preventDefault(), d.detail.originalEvent.type === "focusin" && c.current && d.preventDefault();
        }
      }
    );
  }, "DialogContentNonModal")
), MS = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ Ht(function(n, o) {
    const { __scopeDialog: i, trapFocus: a, onOpenAutoFocus: c, onCloseAutoFocus: d, ...p } = n, m = wn(_i, i);
    return ZE(), /* @__PURE__ */ x.jsx(x.Fragment, { children: /* @__PURE__ */ x.jsx(
      GE,
      {
        asChild: !0,
        loop: !0,
        trapped: a,
        onMountAutoFocus: c,
        onUnmountAutoFocus: d,
        children: /* @__PURE__ */ x.jsx(
          $E,
          {
            role: "dialog",
            id: m.contentId,
            "aria-describedby": m.descriptionPresent ? m.descriptionId : void 0,
            "aria-labelledby": m.titlePresent ? m.titleId : void 0,
            "data-state": sf(m.open),
            ...p,
            ref: o,
            deferPointerDownOutside: !0,
            onDismiss: () => m.onOpenChange(!1)
          }
        )
      }
    ) });
  }, "DialogContentImpl")
), Qb = "DialogTitle", Xb = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ Ht(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = wn(Qb, i), { setTitleCount: d } = c;
    return on(() => (d((p) => p + 1), () => d((p) => p - 1)), [d]), /* @__PURE__ */ x.jsx(vo.h2, { id: c.titleId, ...a, ref: o });
  }, "DialogTitle")
), Zb = "DialogDescription", Jb = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ Ht(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = wn(Zb, i), { setDescriptionCount: d } = c;
    return on(() => (d((p) => p + 1), () => d((p) => p - 1)), [d]), /* @__PURE__ */ x.jsx(vo.p, { id: c.descriptionId, ...a, ref: o });
  }, "DialogDescription")
);
function sf(e) {
  return e ? "open" : "closed";
}
Ht(sf, "getState");
function qb() {
  const e = Q((a) => a.summaryRecord), n = Q((a) => a.closeSummary), o = Q((a) => a.startTimer), i = nn(e == null ? void 0 : e.selectedScene);
  return /* @__PURE__ */ x.jsx(Bb, { open: !!e, onOpenChange: (a) => !a && n(), children: /* @__PURE__ */ x.jsx(La, { children: e ? /* @__PURE__ */ x.jsxs(Ub, { forceMount: !0, children: [
    /* @__PURE__ */ x.jsx($b, { asChild: !0, children: /* @__PURE__ */ x.jsx(
      vn.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ x.jsx(Gb, { asChild: !0, children: /* @__PURE__ */ x.jsxs(
      vn.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ x.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ x.jsx(Xb, { children: "Focus block complete" }),
          /* @__PURE__ */ x.jsx(Jb, { className: "sr-only", children: "Summary of the completed focus block." }),
          /* @__PURE__ */ x.jsx("p", { children: "You protected a focused block in your quiet study room." }),
          /* @__PURE__ */ x.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ x.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ x.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ x.jsx("strong", { children: y0(e.totalFocusTime) })
            ] }),
            /* @__PURE__ */ x.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ x.jsx("span", { children: "Planned block" }),
              /* @__PURE__ */ x.jsxs("strong", { children: [
                e.pomodoroDuration,
                "m"
              ] })
            ] }),
            /* @__PURE__ */ x.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ x.jsx("span", { children: "Scene" }),
              /* @__PURE__ */ x.jsx("strong", { children: i.name })
            ] }),
            /* @__PURE__ */ x.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ x.jsx("span", { children: "Room state" }),
              /* @__PURE__ */ x.jsx("strong", { children: "Saved" })
            ] })
          ] }),
          e.persisted === !1 ? /* @__PURE__ */ x.jsx("p", { children: "This session is visible for now, but could not be saved to this device history." }) : null,
          /* @__PURE__ */ x.jsxs("div", { className: "focus-button-row", children: [
            /* @__PURE__ */ x.jsx(_e, { variant: "primary", onClick: () => {
              n(), o();
            }, children: "Continue studying" }),
            /* @__PURE__ */ x.jsx(_e, { onClick: n, children: "Done" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
const eM = [
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
], tM = [
  ["white-noise", "White noise"],
  ["pink-noise", "Pink noise"],
  ["brown-noise", "Brown noise"]
], nM = [
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
function ra({ id: e, label: n, value: o, icon: i = null, onChange: a, card: c = !1 }) {
  const d = Number.isFinite(Number(o)) ? Number(o) : 0, p = d > 0;
  return /* @__PURE__ */ x.jsxs("label", { className: [
    "room-channel",
    i ? "room-channel-master" : "",
    c ? "room-channel-card" : "",
    p ? "is-active" : ""
  ].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ x.jsxs("span", { className: "room-channel-head", children: [
      /* @__PURE__ */ x.jsxs("span", { className: "room-channel-label", children: [
        i || /* @__PURE__ */ x.jsx("i", { className: `mixer-channel-dot mixer-${e}`, "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("span", { children: n })
      ] }),
      /* @__PURE__ */ x.jsxs("strong", { children: [
        d,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ x.jsxs(
      Xd,
      {
        className: "radix-slider-root",
        value: [d],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (m) => a(e, m[0]),
        children: [
          /* @__PURE__ */ x.jsx(Zd, { className: "radix-slider-track", children: /* @__PURE__ */ x.jsx(Jd, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ x.jsx(qd, { className: "radix-slider-thumb", "aria-label": `${n} volume` })
        ]
      }
    )
  ] });
}
function rM({ audioState: e, scene: n, onClose: o }) {
  const i = Q((T) => T.audioChannels), a = Q((T) => T.setSound), c = Q((T) => T.returnToSetup), d = Q((T) => T.musicType), p = Q((T) => T.ambientSound), m = Q((T) => T.musicVolume), y = Q((T) => T.ambientVolume), [v, l] = C.useState(!1), f = (T, E) => {
    l(!1), a(`audioChannel:${T}`, E);
  }, S = (T, E) => a("musicVolume", E), w = (T, E) => a("ambientVolume", E), k = () => {
    const T = Gn[Math.floor(Math.random() * Gn.length)], E = Kn[Math.floor(Math.random() * Kn.length)];
    a("musicType", T.label), a("ambientSound", E.label), l(!1);
  }, A = () => {
    a("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), a("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), l(!0);
  };
  return /* @__PURE__ */ x.jsxs(
    vn.aside,
    {
      className: "focus-utility-panel room-control-panel liquid-glass",
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 14 },
      transition: Si,
      role: "dialog",
      "aria-label": "Room settings",
      children: [
        /* @__PURE__ */ x.jsxs("header", { className: "room-control-head", children: [
          /* @__PURE__ */ x.jsxs("div", { children: [
            /* @__PURE__ */ x.jsx("span", { className: "control-eyebrow", children: "Control" }),
            /* @__PURE__ */ x.jsx("h2", { children: "Room settings" })
          ] }),
          /* @__PURE__ */ x.jsx(_e, { className: "room-control-close", "aria-label": "Close room settings", onClick: o, children: /* @__PURE__ */ x.jsx(E0, { size: 16, "aria-hidden": "true" }) })
        ] }),
        /* @__PURE__ */ x.jsx("div", { className: "room-control-divider", "aria-hidden": "true" }),
        /* @__PURE__ */ x.jsx("div", { className: "room-control-setup-actions", children: /* @__PURE__ */ x.jsx(
          _e,
          {
            className: "room-control-setup-btn",
            onClick: () => {
              o == null || o(), c();
            },
            "data-focus-return-setup": "true",
            children: "Change scene & setup"
          }
        ) }),
        /* @__PURE__ */ x.jsxs("div", { className: "room-control-grid", children: [
          /* @__PURE__ */ x.jsxs("section", { className: "room-control-col room-control-scenes", "aria-label": "Scenes", children: [
            /* @__PURE__ */ x.jsx("h3", { className: "room-control-section-title", children: "Scenes" }),
            /* @__PURE__ */ x.jsx(Yd, {})
          ] }),
          /* @__PURE__ */ x.jsxs("section", { className: "room-control-col room-control-audio", children: [
            /* @__PURE__ */ x.jsxs("div", { className: "room-control-masters", children: [
              /* @__PURE__ */ x.jsxs("div", { className: "room-control-block", children: [
                /* @__PURE__ */ x.jsxs("div", { className: "room-control-block-head", children: [
                  /* @__PURE__ */ x.jsx("h3", { className: "room-control-section-title", children: "Music" }),
                  /* @__PURE__ */ x.jsx(_e, { className: "room-control-icon-btn", "aria-label": "Shuffle to a random track", onClick: k, children: /* @__PURE__ */ x.jsx(oP, { size: 15, "aria-hidden": "true" }) })
                ] }),
                /* @__PURE__ */ x.jsxs("label", { className: "room-select-field", children: [
                  /* @__PURE__ */ x.jsx("span", { className: "sr-only", children: "Music track" }),
                  /* @__PURE__ */ x.jsx("select", { value: d, onChange: (T) => {
                    l(!1), a("musicType", T.target.value);
                  }, children: Gn.map((T) => /* @__PURE__ */ x.jsx("option", { value: T.label, children: T.label }, T.label)) })
                ] }),
                /* @__PURE__ */ x.jsx(ra, { id: "music-volume", label: "Music volume", icon: /* @__PURE__ */ x.jsx(Ua, { size: 15, "aria-hidden": "true" }), value: m, onChange: S })
              ] }),
              /* @__PURE__ */ x.jsxs("div", { className: "room-control-block", children: [
                /* @__PURE__ */ x.jsxs("div", { className: "room-control-block-head", children: [
                  /* @__PURE__ */ x.jsx("h3", { className: "room-control-section-title", children: "Scene sound" }),
                  /* @__PURE__ */ x.jsx(_e, { className: "room-control-icon-btn", "aria-label": v ? "Mix saved" : "Save current mix", onClick: () => l(!0), children: v ? /* @__PURE__ */ x.jsx(k0, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ x.jsx(A0, { size: 15, "aria-hidden": "true" }) })
                ] }),
                /* @__PURE__ */ x.jsxs("p", { className: "room-scene-recommend", children: [
                  "Recommended for ",
                  /* @__PURE__ */ x.jsx("strong", { children: n == null ? void 0 : n.name }),
                  /* @__PURE__ */ x.jsxs("span", { children: [
                    n == null ? void 0 : n.musicType,
                    " · ",
                    n == null ? void 0 : n.ambientSound
                  ] })
                ] }),
                /* @__PURE__ */ x.jsxs("button", { type: "button", className: "room-scene-apply", onClick: A, children: [
                  "Apply scene mix ",
                  /* @__PURE__ */ x.jsx("span", { "aria-hidden": "true", children: "↗" })
                ] }),
                /* @__PURE__ */ x.jsxs("label", { className: "room-select-field", children: [
                  /* @__PURE__ */ x.jsx("span", { className: "sr-only", children: "Ambient sound" }),
                  /* @__PURE__ */ x.jsx("select", { value: p, onChange: (T) => {
                    l(!1), a("ambientSound", T.target.value);
                  }, children: Kn.map((T) => /* @__PURE__ */ x.jsx("option", { value: T.label, children: T.label }, T.label)) })
                ] }),
                /* @__PURE__ */ x.jsx(ra, { id: "ambient-volume", label: "Ambient volume", icon: /* @__PURE__ */ x.jsx(P0, { size: 15, "aria-hidden": "true" }), value: y, onChange: w })
              ] })
            ] }),
            /* @__PURE__ */ x.jsxs("div", { className: "room-control-block", children: [
              /* @__PURE__ */ x.jsx("h3", { className: "room-control-section-title", children: "Focus noise" }),
              /* @__PURE__ */ x.jsx("div", { className: "room-noise-row", children: tM.map(([T, E]) => /* @__PURE__ */ x.jsx(ra, { id: T, label: E, value: i == null ? void 0 : i[T], onChange: f, card: !0 }, T)) })
            ] }),
            /* @__PURE__ */ x.jsxs("div", { className: "room-control-block", children: [
              /* @__PURE__ */ x.jsx("h3", { className: "room-control-section-title", children: "Ambient atmosphere" }),
              /* @__PURE__ */ x.jsx("div", { className: "room-ambient-grid", children: nM.map(([T, E]) => /* @__PURE__ */ x.jsx(ra, { id: T, label: E, value: i == null ? void 0 : i[T], onChange: f, card: !0 }, T)) })
            ] }),
            e != null && e.error ? /* @__PURE__ */ x.jsx("p", { className: "audio-error", children: e.error }) : null
          ] })
        ] })
      ]
    }
  );
}
function oa({ title: e, kicker: n, icon: o, children: i, onClose: a, className: c = "" }) {
  return /* @__PURE__ */ x.jsxs(vn.aside, { className: `focus-utility-panel liquid-glass ${c}`.trim(), initial: { opacity: 0, y: 12, x: -18 }, animate: { opacity: 1, y: 0, x: 0 }, exit: { opacity: 0, y: 10, x: -18 }, transition: Si, role: "dialog", "aria-label": e, children: [
    /* @__PURE__ */ x.jsxs("div", { className: "drawer-head", children: [
      /* @__PURE__ */ x.jsxs("div", { className: "utility-title", children: [
        /* @__PURE__ */ x.jsx("span", { className: "utility-title-icon", children: o }),
        /* @__PURE__ */ x.jsxs("div", { children: [
          /* @__PURE__ */ x.jsx("span", { className: "focus-kicker", children: n }),
          /* @__PURE__ */ x.jsx("h2", { children: e })
        ] })
      ] }),
      /* @__PURE__ */ x.jsx(_e, { "aria-label": `Close ${e}`, onClick: a, children: /* @__PURE__ */ x.jsx(E0, { size: 16, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ x.jsx("div", { className: "utility-panel-body", children: i })
  ] });
}
function oM({ audioState: e, scene: n }) {
  const o = Q((y) => y.audioChannels), i = Q((y) => y.setSound), [a, c] = C.useState(!1), d = (y, v) => {
    c(!1), i(`audioChannel:${y}`, v);
  }, p = () => {
    const y = Gn[Math.floor(Math.random() * Gn.length)], v = Kn[Math.floor(Math.random() * Kn.length)];
    i("musicType", y.label), i("ambientSound", v.label), c(!0);
  }, m = () => {
    i("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), i("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), c(!0);
  };
  return /* @__PURE__ */ x.jsxs("div", { className: "sound-mixer", children: [
    /* @__PURE__ */ x.jsxs("div", { className: "mixer-featured-row", children: [
      /* @__PURE__ */ x.jsx("span", { className: "focus-kicker", children: "Music library" }),
      /* @__PURE__ */ x.jsxs(_e, { onClick: p, children: [
        /* @__PURE__ */ x.jsx(HC, { size: 14, "aria-hidden": "true" }),
        " Random track"
      ] })
    ] }),
    /* @__PURE__ */ x.jsx(X0, { audioState: e, compact: !0 }),
    /* @__PURE__ */ x.jsxs("div", { className: "mixer-preset-row", children: [
      /* @__PURE__ */ x.jsxs("button", { type: "button", className: "mixer-preset-button", onClick: m, children: [
        "Apply scene mix ",
        /* @__PURE__ */ x.jsx("span", { children: "↗" })
      ] }),
      /* @__PURE__ */ x.jsxs(_e, { onClick: () => c(!0), children: [
        a ? /* @__PURE__ */ x.jsx(k0, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ x.jsx(A0, { size: 14, "aria-hidden": "true" }),
        " ",
        a ? "Saved" : "Save current mix"
      ] })
    ] }),
    /* @__PURE__ */ x.jsx("div", { className: "mixer-channel-grid", children: eM.map(([y, v]) => /* @__PURE__ */ x.jsxs("label", { className: "mixer-channel", children: [
      /* @__PURE__ */ x.jsxs("span", { children: [
        /* @__PURE__ */ x.jsx("i", { className: `mixer-channel-dot mixer-${y}` }),
        v
      ] }),
      /* @__PURE__ */ x.jsxs("strong", { children: [
        o[y],
        "%"
      ] }),
      /* @__PURE__ */ x.jsx("input", { type: "range", min: "0", max: "100", value: o[y], "aria-label": `${v} volume`, onChange: (l) => d(y, l.target.value) })
    ] }, y)) }),
    e != null && e.error ? /* @__PURE__ */ x.jsx("p", { className: "audio-error", children: e.error }) : null
  ] });
}
function iM() {
  const e = () => {
    var i, a, c;
    return ((c = (a = (i = globalThis.window) == null ? void 0 : i.SynapseAuth) == null ? void 0 : a.getStoredSession) == null ? void 0 : c.call(a)) || null;
  }, [n, o] = C.useState(e);
  return C.useEffect(() => {
    var d, p, m, y;
    let i = !0;
    const a = (v) => {
      var l;
      i && o(((l = v == null ? void 0 : v.detail) == null ? void 0 : l.session) || e());
    };
    (d = globalThis.window) == null || d.addEventListener("synapse-auth-changed", a);
    const c = (y = (m = (p = globalThis.window) == null ? void 0 : p.SynapseAuth) == null ? void 0 : m.syncSessionFromProvider) == null ? void 0 : y.call(m);
    return Promise.resolve(c).finally(() => a()), () => {
      var v;
      i = !1, (v = globalThis.window) == null || v.removeEventListener("synapse-auth-changed", a);
    };
  }, []), n;
}
function sM({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ x.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ x.jsx(Ra, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ x.jsx("h3", { children: "Your Focus Trail" }),
    /* @__PURE__ */ x.jsx("p", { children: "Recent sessions and progress remain available through Synapse history." }),
    /* @__PURE__ */ x.jsx(_e, { variant: "primary", onClick: () => e == null ? void 0 : e("", "history"), children: "Open session history" })
  ] }) : /* @__PURE__ */ x.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ x.jsx(Ra, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ x.jsx("span", { className: "focus-kicker", children: "Your rhythm, remembered" }),
    /* @__PURE__ */ x.jsx("h3", { children: "Sign in to view your Focus Trail" }),
    /* @__PURE__ */ x.jsx("p", { children: "Track deep-work time, completed goals, and your study streak across devices." }),
    /* @__PURE__ */ x.jsx(_e, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Sign in with Synapse" }),
    /* @__PURE__ */ x.jsx("small", { children: "Your current session continues without an account." })
  ] });
}
function aM({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ x.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ x.jsx(Da, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ x.jsx("h3", { children: "Companion Room" }),
    /* @__PURE__ */ x.jsx("p", { children: "Invite a study partner from your Synapse workspace to share this quiet room." }),
    /* @__PURE__ */ x.jsx(_e, { variant: "primary", onClick: () => e == null ? void 0 : e("", "companion"), children: "Open Companion Room" })
  ] }) : /* @__PURE__ */ x.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ x.jsx(Da, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ x.jsx("span", { className: "focus-kicker", children: "Study alongside someone" }),
    /* @__PURE__ */ x.jsx("h3", { children: "Sign in to use Companion Room" }),
    /* @__PURE__ */ x.jsx("p", { children: "Keep your own goal private while sharing the feeling of showing up together." }),
    /* @__PURE__ */ x.jsx(_e, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Go to sign in" }),
    /* @__PURE__ */ x.jsx("small", { children: "No companion data is created in Focus Room." })
  ] });
}
function lM({ audioState: e, utilityPanel: n, onClose: o, onWorkspace: i }) {
  const a = Q((y) => y.activeDrawer), c = Q((y) => y.closeDrawer), d = Q((y) => y.selectedScene), p = iM(), m = C.useMemo(() => kr.find((y) => y.id === d) || kr[0], [d]);
  return /* @__PURE__ */ x.jsxs(La, { children: [
    n === "trail" ? /* @__PURE__ */ x.jsx(oa, { title: "Focus Trail", kicker: "Your progress", icon: /* @__PURE__ */ x.jsx(Ra, { size: 16 }), onClose: o, children: /* @__PURE__ */ x.jsx(sM, { onWorkspace: i, session: p }) }) : null,
    n === "companion" ? /* @__PURE__ */ x.jsx(oa, { title: "Companion Room", kicker: "Shared focus", icon: /* @__PURE__ */ x.jsx(Da, { size: 16 }), onClose: o, children: /* @__PURE__ */ x.jsx(aM, { onWorkspace: i, session: p }) }) : null,
    n === "settings" ? /* @__PURE__ */ x.jsx(rM, { audioState: e, scene: m, onClose: o }) : null,
    !n && a === "scene" ? /* @__PURE__ */ x.jsx(oa, { title: "Choose scene", kicker: "Scene", icon: /* @__PURE__ */ x.jsx(C0, { size: 16 }), onClose: c, children: /* @__PURE__ */ x.jsx(Yd, {}) }) : null,
    !n && a === "music" ? /* @__PURE__ */ x.jsx(oa, { title: "Sound atmosphere", kicker: "Room audio", icon: /* @__PURE__ */ x.jsx(Ua, { size: 16 }), onClose: c, children: /* @__PURE__ */ x.jsx(oM, { audioState: e, scene: m }) }) : null
  ] });
}
function uM(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function cM({ onExit: e }) {
  const n = Q((y) => y.elapsedSeconds), o = Q((y) => y.pomodoroDuration), i = Q((y) => y.pomodoroDurationSeconds), a = Q((y) => y.timerMode), c = Q((y) => y.timerStatus), d = Q((y) => y.currentSession), p = Number(i) || (Number(o) || 0) * 60, m = a === "countup" ? n : Math.max(0, p - n);
  return /* @__PURE__ */ x.jsxs("div", { className: "compact-focus-mode-card", "aria-label": "Distraction-free focus timer", children: [
    /* @__PURE__ */ x.jsxs("div", { className: "compact-focus-card-top", children: [
      /* @__PURE__ */ x.jsxs("span", { children: [
        "POMODORO #",
        (d == null ? void 0 : d.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ x.jsx(_e, { className: "compact-exit-button", onClick: e, "aria-label": "Exit Focus Mode", children: /* @__PURE__ */ x.jsx(QC, { size: 14, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ x.jsxs("span", { className: "compact-focus-status", children: [
      /* @__PURE__ */ x.jsx("i", {}),
      c === "paused" ? "Paused" : "In focus"
    ] }),
    /* @__PURE__ */ x.jsx("strong", { children: Kc(m) }),
    /* @__PURE__ */ x.jsx("div", { className: "compact-focus-progress", children: /* @__PURE__ */ x.jsx("span", { style: { width: `${uM(n, p)}%` } }) }),
    /* @__PURE__ */ x.jsxs("small", { children: [
      Kd(p),
      " session"
    ] }),
    /* @__PURE__ */ x.jsx("span", { className: "sr-only", children: "Press Escape to exit Focus Mode." })
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
var ug;
function dM() {
  return ug || (ug = 1, (function(e) {
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
                for (var w = f._howls[S]._getSoundIds(), k = 0; k < w.length; k++) {
                  var A = f._howls[S]._soundById(w[k]);
                  A && A._node && (A._node.volume = A._volume * l);
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
              for (var w = f._howls[S]._getSoundIds(), k = 0; k < w.length; k++) {
                var A = f._howls[S]._soundById(w[k]);
                A && A._node && (A._node.muted = l ? !0 : A._muted);
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
          var S = f.canPlayType("audio/mpeg;").replace(/^no$/, ""), w = l._navigator ? l._navigator.userAgent : "", k = w.match(/OPR\/(\d+)/g), A = k && parseInt(k[0].split("/")[1], 10) < 33, T = w.indexOf("Safari") !== -1 && w.indexOf("Chrome") === -1, E = w.match(/Version\/(.*?) /), M = T && E && parseInt(E[1], 10) < 15;
          return l._codecs = {
            mp3: !!(!A && (S || f.canPlayType("audio/mp3;").replace(/^no$/, ""))),
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
              for (var k = 0; k < l._howls.length; k++)
                if (!l._howls[k]._webAudio)
                  for (var A = l._howls[k]._getSoundIds(), T = 0; T < A.length; T++) {
                    var E = l._howls[k]._soundById(A[T]);
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
            var w, k;
            if (l._format && l._format[S])
              w = l._format[S];
            else {
              if (k = l._src[S], typeof k != "string") {
                l._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              w = /^data:audio\/([^;,]+);/i.exec(k), w || (w = /\.([^.]+)$/.exec(k.split("?", 1)[0])), w && (w = w[1].toLowerCase());
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
              for (var k = 0, A = 0; A < S._sounds.length; A++)
                S._sounds[A]._paused && !S._sounds[A]._ended && (k++, w = S._sounds[A]._id);
              k === 1 ? l = null : w = null;
            }
          }
          var T = w ? S._soundById(w) : S._inactiveSound();
          if (!T)
            return null;
          if (w && !l && (l = T._sprite || "__default"), S._state !== "loaded") {
            T._sprite = l, T._ended = !1;
            var E = T._id;
            return S._queue.push({
              event: "play",
              action: function() {
                S.play(E);
              }
            }), E;
          }
          if (w && !T._paused)
            return f || S._loadQueue("play"), T._id;
          S._webAudio && o._autoResume();
          var M = Math.max(0, T._seek > 0 ? T._seek : S._sprite[l][0] / 1e3), N = Math.max(0, (S._sprite[l][0] + S._sprite[l][1]) / 1e3 - M), O = N * 1e3 / Math.abs(T._rate), W = S._sprite[l][0] / 1e3, G = (S._sprite[l][0] + S._sprite[l][1]) / 1e3;
          T._sprite = l, T._ended = !1;
          var K = function() {
            T._paused = !1, T._seek = M, T._start = W, T._stop = G, T._loop = !!(T._loop || S._sprite[l][2]);
          };
          if (M >= G) {
            S._ended(T);
            return;
          }
          var L = T._node;
          if (S._webAudio) {
            var X = function() {
              S._playLock = !1, K(), S._refreshBuffer(T);
              var ue = T._muted || S._muted ? 0 : T._volume;
              L.gain.setValueAtTime(ue, o.ctx.currentTime), T._playStart = o.ctx.currentTime, typeof L.bufferSource.start > "u" ? T._loop ? L.bufferSource.noteGrainOn(0, M, 86400) : L.bufferSource.noteGrainOn(0, M, N) : T._loop ? L.bufferSource.start(0, M, 86400) : L.bufferSource.start(0, M, N), O !== 1 / 0 && (S._endTimers[T._id] = setTimeout(S._ended.bind(S, T), O)), f || setTimeout(function() {
                S._emit("play", T._id), S._loadQueue();
              }, 0);
            };
            o.state === "running" && o.ctx.state !== "interrupted" ? X() : (S._playLock = !0, S.once("resume", X), S._clearTimer(T._id));
          } else {
            var ae = function() {
              L.currentTime = M, L.muted = T._muted || S._muted || o._muted || L.muted, L.volume = T._volume * o.volume(), L.playbackRate = T._rate;
              try {
                var ue = L.play();
                if (ue && typeof Promise < "u" && (ue instanceof Promise || typeof ue.then == "function") ? (S._playLock = !0, K(), ue.then(function() {
                  S._playLock = !1, L._unlocked = !0, f ? S._loadQueue() : S._emit("play", T._id);
                }).catch(function() {
                  S._playLock = !1, S._emit("playerror", T._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), T._ended = !0, T._paused = !0;
                })) : f || (S._playLock = !1, K(), S._emit("play", T._id)), L.playbackRate = T._rate, L.paused) {
                  S._emit("playerror", T._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                l !== "__default" || T._loop ? S._endTimers[T._id] = setTimeout(S._ended.bind(S, T), O) : (S._endTimers[T._id] = function() {
                  S._ended(T), L.removeEventListener("ended", S._endTimers[T._id], !1);
                }, L.addEventListener("ended", S._endTimers[T._id], !1));
              } catch (Te) {
                S._emit("playerror", T._id, Te);
              }
            };
            L.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (L.src = S._src, L.load());
            var q = window && window.ejecta || !L.readyState && o._navigator.isCocoonJS;
            if (L.readyState >= 3 || q)
              ae();
            else {
              S._playLock = !0, S._state = "loading";
              var de = function() {
                S._state = "loaded", ae(), L.removeEventListener(o._canPlayEvent, de, !1);
              };
              L.addEventListener(o._canPlayEvent, de, !1), S._clearTimer(T._id);
            }
          }
          return T._id;
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
            var k = f._soundById(S[w]);
            if (k && !k._paused && (k._seek = f.seek(S[w]), k._rateSeek = 0, k._paused = !0, f._stopFade(S[w]), k._node))
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
          var S = this;
          if (S._state !== "loaded" || S._playLock)
            return S._queue.push({
              event: "stop",
              action: function() {
                S.stop(l);
              }
            }), S;
          for (var w = S._getSoundIds(l), k = 0; k < w.length; k++) {
            S._clearTimer(w[k]);
            var A = S._soundById(w[k]);
            A && (A._seek = A._start || 0, A._rateSeek = 0, A._paused = !0, A._ended = !0, S._stopFade(w[k]), A._node && (S._webAudio ? A._node.bufferSource && (typeof A._node.bufferSource.stop > "u" ? A._node.bufferSource.noteOff(0) : A._node.bufferSource.stop(0), S._cleanBuffer(A._node)) : (!isNaN(A._node.duration) || A._node.duration === 1 / 0) && (A._node.currentTime = A._start || 0, A._node.pause(), A._node.duration === 1 / 0 && S._clearSound(A._node))), f || S._emit("stop", A._id));
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
          for (var w = S._getSoundIds(f), k = 0; k < w.length; k++) {
            var A = S._soundById(w[k]);
            A && (A._muted = l, A._interval && S._stopFade(A._id), S._webAudio && A._node ? A._node.gain.setValueAtTime(l ? 0 : A._volume, o.ctx.currentTime) : A._node && (A._node.muted = o._muted ? !0 : l), S._emit("mute", A._id));
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
            var k = l._getSoundIds(), A = k.indexOf(f[0]);
            A >= 0 ? w = parseInt(f[0], 10) : S = parseFloat(f[0]);
          } else f.length >= 2 && (S = parseFloat(f[0]), w = parseInt(f[1], 10));
          var T;
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
              T = l._soundById(w[E]), T && (T._volume = S, f[2] || l._stopFade(w[E]), l._webAudio && T._node && !T._muted ? T._node.gain.setValueAtTime(S, o.ctx.currentTime) : T._node && !T._muted && (T._node.volume = S * o.volume()), l._emit("volume", T._id));
          } else
            return T = w ? l._soundById(w) : l._sounds[0], T ? T._volume : 0;
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
          var k = this;
          if (k._state !== "loaded" || k._playLock)
            return k._queue.push({
              event: "fade",
              action: function() {
                k.fade(l, f, S, w);
              }
            }), k;
          l = Math.min(Math.max(0, parseFloat(l)), 1), f = Math.min(Math.max(0, parseFloat(f)), 1), S = parseFloat(S), k.volume(l, w);
          for (var A = k._getSoundIds(w), T = 0; T < A.length; T++) {
            var E = k._soundById(A[T]);
            if (E) {
              if (w || k._stopFade(A[T]), k._webAudio && !E._muted) {
                var M = o.ctx.currentTime, N = M + S / 1e3;
                E._volume = l, E._node.gain.setValueAtTime(l, M), E._node.gain.linearRampToValueAtTime(f, N);
              }
              k._startFadeInterval(E, l, f, S, A[T], typeof w > "u");
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
        _startFadeInterval: function(l, f, S, w, k, A) {
          var T = this, E = f, M = S - f, N = Math.abs(M / 0.01), O = Math.max(4, N > 0 ? w / N : w), W = Date.now();
          l._fadeTo = S, l._interval = setInterval(function() {
            var G = (Date.now() - W) / w;
            W = Date.now(), E += M * G, E = Math.round(E * 100) / 100, M < 0 ? E = Math.max(S, E) : E = Math.min(S, E), T._webAudio ? l._volume = E : T.volume(E, l._id, !0), A && (T._volume = E), (S < f && E <= S || S > f && E >= S) && (clearInterval(l._interval), l._interval = null, l._fadeTo = null, T.volume(S, l._id), T._emit("fade", l._id));
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
          var l = this, f = arguments, S, w, k;
          if (f.length === 0)
            return l._loop;
          if (f.length === 1)
            if (typeof f[0] == "boolean")
              S = f[0], l._loop = S;
            else
              return k = l._soundById(parseInt(f[0], 10)), k ? k._loop : !1;
          else f.length === 2 && (S = f[0], w = parseInt(f[1], 10));
          for (var A = l._getSoundIds(w), T = 0; T < A.length; T++)
            k = l._soundById(A[T]), k && (k._loop = S, l._webAudio && k._node && k._node.bufferSource && (k._node.bufferSource.loop = S, S && (k._node.bufferSource.loopStart = k._start || 0, k._node.bufferSource.loopEnd = k._stop, l.playing(A[T]) && (l.pause(A[T], !0), l.play(A[T], !0)))));
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
            var k = l._getSoundIds(), A = k.indexOf(f[0]);
            A >= 0 ? w = parseInt(f[0], 10) : S = parseFloat(f[0]);
          } else f.length === 2 && (S = parseFloat(f[0]), w = parseInt(f[1], 10));
          var T;
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
              if (T = l._soundById(w[E]), T) {
                l.playing(w[E]) && (T._rateSeek = l.seek(w[E]), T._playStart = l._webAudio ? o.ctx.currentTime : T._playStart), T._rate = S, l._webAudio && T._node && T._node.bufferSource ? T._node.bufferSource.playbackRate.setValueAtTime(S, o.ctx.currentTime) : T._node && (T._node.playbackRate = S);
                var M = l.seek(w[E]), N = (l._sprite[T._sprite][0] + l._sprite[T._sprite][1]) / 1e3 - M, O = N * 1e3 / Math.abs(T._rate);
                (l._endTimers[w[E]] || !T._paused) && (l._clearTimer(w[E]), l._endTimers[w[E]] = setTimeout(l._ended.bind(l, T), O)), l._emit("rate", T._id);
              }
          } else
            return T = l._soundById(w), T ? T._rate : l._rate;
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
            var k = l._getSoundIds(), A = k.indexOf(f[0]);
            A >= 0 ? w = parseInt(f[0], 10) : l._sounds.length && (w = l._sounds[0]._id, S = parseFloat(f[0]));
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
          var T = l._soundById(w);
          if (T)
            if (typeof S == "number" && S >= 0) {
              var E = l.playing(w);
              E && l.pause(w, !0), T._seek = S, T._ended = !1, l._clearTimer(w), !l._webAudio && T._node && !isNaN(T._node.duration) && (T._node.currentTime = S);
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
              var O = l.playing(w) ? o.ctx.currentTime - T._playStart : 0, W = T._rateSeek ? T._rateSeek - T._seek : 0;
              return T._seek + (W + O * Math.abs(T._rate));
            } else
              return T._node.currentTime;
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
          var k = !0;
          for (S = 0; S < o._howls.length; S++)
            if (o._howls[S]._src === l._src || l._src.indexOf(o._howls[S]._src) >= 0) {
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
        on: function(l, f, S, w) {
          var k = this, A = k["_on" + l];
          return typeof f == "function" && A.push(w ? { id: S, fn: f, once: w } : { id: S, fn: f }), k;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(l, f, S) {
          var w = this, k = w["_on" + l], A = 0;
          if (typeof f == "number" && (S = f, f = null), f || S)
            for (A = 0; A < k.length; A++) {
              var T = S === k[A].id;
              if (f === k[A].fn && T || !f && T) {
                k.splice(A, 1);
                break;
              }
            }
          else if (l)
            w["_on" + l] = [];
          else {
            var E = Object.keys(w);
            for (A = 0; A < E.length; A++)
              E[A].indexOf("_on") === 0 && Array.isArray(w[E[A]]) && (w[E[A]] = []);
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
          for (var w = this, k = w["_on" + l], A = k.length - 1; A >= 0; A--)
            (!k[A].id || k[A].id === f || l === "load") && (setTimeout((function(T) {
              T.call(this, f, S);
            }).bind(w, k[A].fn), 0), k[A].once && w.off(l, k[A].fn, k[A].id));
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
          l._duration = c[f].duration, y(l);
          return;
        }
        if (/^data:[^;]+;base64,/.test(f)) {
          for (var S = atob(f.split(",")[1]), w = new Uint8Array(S.length), k = 0; k < S.length; ++k)
            w[k] = S.charCodeAt(k);
          m(w.buffer, l);
        } else {
          var A = new XMLHttpRequest();
          A.open(l._xhr.method, f, !0), A.withCredentials = l._xhr.withCredentials, A.responseType = "arraybuffer", l._xhr.headers && Object.keys(l._xhr.headers).forEach(function(T) {
            A.setRequestHeader(T, l._xhr.headers[T]);
          }), A.onload = function() {
            var T = (A.status + "")[0];
            if (T !== "0" && T !== "2" && T !== "3") {
              l._emit("loaderror", null, "Failed loading audio file with status: " + A.status + ".");
              return;
            }
            m(A.response, l);
          }, A.onerror = function() {
            l._webAudio && (l._html5 = !0, l._webAudio = !1, l._sounds = [], delete c[f], l.load());
          }, p(A);
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
        }, w = function(k) {
          k && f._sounds.length > 0 ? (c[f._src] = k, y(f, k)) : S();
        };
        typeof Promise < "u" && o.ctx.decodeAudioData.length === 1 ? o.ctx.decodeAudioData(l).then(w).catch(S) : o.ctx.decodeAudioData(l, w, S);
      }, y = function(l, f) {
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
      e.Howler = o, e.Howl = i, typeof oi < "u" ? (oi.HowlerGlobal = n, oi.Howler = o, oi.Howl = i, oi.Sound = a) : typeof window < "u" && (window.HowlerGlobal = n, window.Howler = o, window.Howl = i, window.Sound = a);
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
        var y = m._orientation;
        if (i = typeof i != "number" ? y[1] : i, a = typeof a != "number" ? y[2] : a, c = typeof c != "number" ? y[3] : c, d = typeof d != "number" ? y[4] : d, p = typeof p != "number" ? y[5] : p, typeof o == "number")
          m._orientation = [o, i, a, c, d, p], typeof m.ctx.listener.forwardX < "u" ? (m.ctx.listener.forwardX.setTargetAtTime(o, Howler.ctx.currentTime, 0.1), m.ctx.listener.forwardY.setTargetAtTime(i, Howler.ctx.currentTime, 0.1), m.ctx.listener.forwardZ.setTargetAtTime(a, Howler.ctx.currentTime, 0.1), m.ctx.listener.upX.setTargetAtTime(c, Howler.ctx.currentTime, 0.1), m.ctx.listener.upY.setTargetAtTime(d, Howler.ctx.currentTime, 0.1), m.ctx.listener.upZ.setTargetAtTime(p, Howler.ctx.currentTime, 0.1)) : m.ctx.listener.setOrientation(o, i, a, c, d, p);
        else
          return y;
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
          var y = d._soundById(p[m]);
          if (y)
            if (typeof o == "number")
              y._pos = [o, i, a], y._node && ((!y._panner || y._panner.pan) && n(y, "spatial"), typeof y._panner.positionX < "u" ? (y._panner.positionX.setValueAtTime(o, Howler.ctx.currentTime), y._panner.positionY.setValueAtTime(i, Howler.ctx.currentTime), y._panner.positionZ.setValueAtTime(a, Howler.ctx.currentTime)) : y._panner.setPosition(o, i, a)), d._emit("pos", y._id);
            else
              return y._pos;
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
          var y = d._soundById(p[m]);
          if (y)
            if (typeof o == "number")
              y._orientation = [o, i, a], y._node && (y._panner || (y._pos || (y._pos = d._pos || [0, 0, -0.5]), n(y, "spatial")), typeof y._panner.orientationX < "u" ? (y._panner.orientationX.setValueAtTime(o, Howler.ctx.currentTime), y._panner.orientationY.setValueAtTime(i, Howler.ctx.currentTime), y._panner.orientationZ.setValueAtTime(a, Howler.ctx.currentTime)) : y._panner.setOrientation(o, i, a)), d._emit("orientation", y._id);
            else
              return y._orientation;
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
            var y = d._pannerAttr;
            y = {
              coneInnerAngle: typeof a.coneInnerAngle < "u" ? a.coneInnerAngle : y.coneInnerAngle,
              coneOuterAngle: typeof a.coneOuterAngle < "u" ? a.coneOuterAngle : y.coneOuterAngle,
              coneOuterGain: typeof a.coneOuterGain < "u" ? a.coneOuterGain : y.coneOuterGain,
              distanceModel: typeof a.distanceModel < "u" ? a.distanceModel : y.distanceModel,
              maxDistance: typeof a.maxDistance < "u" ? a.maxDistance : y.maxDistance,
              refDistance: typeof a.refDistance < "u" ? a.refDistance : y.refDistance,
              rolloffFactor: typeof a.rolloffFactor < "u" ? a.rolloffFactor : y.rolloffFactor,
              panningModel: typeof a.panningModel < "u" ? a.panningModel : y.panningModel
            };
            var v = d._panner;
            v || (d._pos || (d._pos = o._pos || [0, 0, -0.5]), n(d, "spatial"), v = d._panner), v.coneInnerAngle = y.coneInnerAngle, v.coneOuterAngle = y.coneOuterAngle, v.coneOuterGain = y.coneOuterGain, v.distanceModel = y.distanceModel, v.maxDistance = y.maxDistance, v.refDistance = y.refDistance, v.rolloffFactor = y.rolloffFactor, v.panningModel = y.panningModel;
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
var fM = dM();
const pM = /* @__PURE__ */ gg(fM), { Howl: RS } = pM, cd = 500, Mt = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let pr = {}, mi = !1, dd = "";
function Ti() {
  return typeof RS == "function";
}
function mc(e, n = 50) {
  const o = Number(e), i = Number.isFinite(o) ? o : n;
  return Math.min(1, Math.max(0, i / 100));
}
function DS(e) {
  return new RS({
    src: [e],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function NS(e, n, o = cd) {
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
  e && (NS(e, 0, Math.min(cd, 300)), (o = globalThis.setTimeout) == null || o.call(globalThis, () => {
    try {
      e.pause(), n && e.unload();
    } catch {
    }
  }, Math.min(cd, 320)));
}
function mM(e) {
  return !(e != null && e.streamUrl) || !Ti() ? null : ((!Mt.music || Mt.music.__synapseSrc !== e.streamUrl) && (Ha(Mt.music, { unload: !0 }), Mt.music = DS(e.streamUrl), Mt.music.__synapseSrc = e.streamUrl), Mt.music);
}
function hM(e) {
  if (!(e != null && e.streamUrl) || !Ti()) return null;
  const n = e.id || e.streamUrl, o = Mt.ambient.get(n);
  if (o && o.__synapseSrc === e.streamUrl) return o;
  Ha(o, { unload: !0 });
  const i = DS(e.streamUrl);
  return i.__synapseSrc = e.streamUrl, Mt.ambient.set(n, i), i;
}
function yM() {
  return [
    Mt.music,
    ...Mt.ambient.values()
  ].filter(Boolean);
}
function IS() {
  yM().forEach((e) => Ha(e));
}
function gM(e) {
  for (const [n, o] of Mt.ambient.entries())
    e.has(n) || (Ha(o, { unload: !0 }), Mt.ambient.delete(n));
}
function cg(e, n) {
  if (e)
    try {
      e.playing() || e.play(), NS(e, n), dd = "";
    } catch (o) {
      dd = (o == null ? void 0 : o.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function vM(e = {}) {
  pr = { ...pr, ...e };
  const n = Ba(pr);
  if (!Ti()) return ga(n);
  if (!mi)
    return IS(), ga(n);
  const o = mM(n.musicTrack), i = mc(pr.musicVolume, 60), a = mc(pr.ambientVolume, 50), c = /* @__PURE__ */ new Set(), d = [];
  return n.ambientLayers.forEach((p) => {
    var f;
    const m = p.id || p.streamUrl;
    c.add(m);
    const y = hM(p), v = Number((f = pr.audioChannels) == null ? void 0 : f[p.id]), l = Number.isFinite(v) ? mc(v, 0) : Math.min(1, Math.max(0, a * (p.volumeBias ?? 1)));
    d.push([y, l]);
  }), gM(c), cg(o, i), d.forEach(([p, m]) => cg(p, m)), ga(n);
}
function SM(e) {
  return mi = !!e, mi || IS(), mi;
}
function ga(e = Ba(pr)) {
  var n, o, i, a;
  return {
    available: Ti(),
    playing: mi && Ti(),
    musicTitle: ((n = e.musicTrack) == null ? void 0 : n.title) || "",
    musicArtist: ((o = e.musicTrack) == null ? void 0 : o.artist) || "",
    musicPageUrl: ((i = e.musicTrack) == null ? void 0 : i.pageUrl) || "",
    musicAttribution: ((a = e.musicTrack) == null ? void 0 : a.attribution) || "",
    ambientTitles: e.ambientLayers.map((c) => c.title).filter(Boolean),
    ambientPageUrls: e.ambientLayers.map((c) => c.pageUrl).filter(Boolean),
    ambientAttributions: e.ambientLayers.map((c) => c.attribution).filter(Boolean),
    error: dd
  };
}
const wM = "synapse.focusRoom.audioPrefs.v1";
function xM(e) {
  var n;
  try {
    (n = globalThis.localStorage) == null || n.setItem(wM, JSON.stringify({
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
function _M() {
  const e = Q((m) => m.musicType), n = Q((m) => m.ambientSound), o = Q((m) => m.musicVolume), i = Q((m) => m.ambientVolume), a = Q((m) => m.audioChannels), c = Q((m) => m.audioPlaying), [d, p] = C.useState(() => ga(Ba({
    musicType: e,
    ambientSound: n
  })));
  return C.useEffect(() => {
    const m = { musicType: e, ambientSound: n, musicVolume: o, ambientVolume: i, audioChannels: a };
    let y = !1;
    return SM(c), xM(m), vM(m).then((v) => {
      y || p(v);
    }), () => {
      y = !0;
    };
  }, [n, i, a, c, e, o]), d;
}
function TM() {
  const e = Q(), n = C.useCallback(async (i = "", a = "", c = {}) => {
    var v;
    e.pauseTimer({ pauseAudio: !0 }), e.closeSummary();
    const d = typeof i == "string" || typeof i == "number" ? i : "", p = typeof a == "string" ? a : "", m = kM(p, c), y = String(d || e.selectedMaterialId || ((v = e.selectedMaterial) == null ? void 0 : v.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const l = globalThis.returnFromFocusRoomToWorkspace(y, m);
        l && typeof l.then == "function" && await l, dg(m.action || p, m);
        return;
      } catch (l) {
        console.error("Could not return from Focus Room:", l);
      }
    globalThis.location.hash = "", dg(m.action || p, m);
  }, [e]), o = C.useMemo(() => ({
    answerFocusQuizQuestion: e.answerQuizQuestion,
    askFocusAssistant: e.askAssistant,
    checkFocusQuizQuestion: e.checkQuizQuestion,
    closeFocusSummary: e.closeSummary,
    endFocusRoomSession: e.endSession,
    returnToFocusRoomSetup: e.returnToSetup,
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
function jS(e) {
  const n = String(e || "").trim().toLowerCase();
  return ["flashcards", "quiz", "assistant", "mindmap", "timeline", "source", "notes"].includes(n) ? n : "";
}
function kM(e, n = {}) {
  const o = n && typeof n == "object" && !Array.isArray(n) ? n : {}, i = jS(e || o.action);
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
function dg(e, n = {}) {
  const o = jS(e);
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
function AM(e = 3e3) {
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
function CM() {
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
function PM() {
  const e = Q((n) => n.selectedScene);
  return nn(e);
}
function EM(e) {
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
function bM() {
  const [e, n] = C.useState(""), [o, i] = C.useState(!1), [a, c] = C.useState(!1), d = Q((T) => T.view), p = AM(3e3), m = PM(), y = _M(), v = TM();
  CM();
  const l = Q(t_(EM)), f = Q((T) => T.summaryRecord), S = Q((T) => T.endSession), w = Q((T) => T.initializeFocusRoom);
  C.useEffect(() => {
    w();
  }, [w]), C.useEffect(() => {
    l != null && l.materialId && $d(l.materialId, l);
  }, [l]), C.useEffect(() => {
    d === "session" || !f || pa("focus-room");
  }, [f, d]), C.useEffect(() => {
    d !== "session" && (i(!1), n(""), c(!1));
  }, [d]), C.useEffect(() => {
    const T = (E) => {
      E.key === "Escape" && (o ? (E.preventDefault(), i(!1)) : e ? n("") : a && c(!1));
    };
    return window.addEventListener("keydown", T), () => window.removeEventListener("keydown", T);
  }, [a, o, e]);
  const k = (...T) => {
    v.returnToWorkspace(...T);
  }, A = async () => {
    c(!1), i(!1), n(""), S(), await k();
  };
  return /* @__PURE__ */ x.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${p ? "is-idle" : ""} ${d === "setup" ? "is-setup" : "is-session"}`.trim(),
      "aria-live": "polite",
      "data-focus-room-view": d,
      children: [
        /* @__PURE__ */ x.jsx(DC, { scene: m }),
        /* @__PURE__ */ x.jsxs(La, { mode: "wait", children: [
          d === "setup" ? /* @__PURE__ */ x.jsx(
            vn.div,
            {
              className: "focus-room-view focus-setup-view",
              initial: { opacity: 0, y: 16 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -10 },
              transition: Si,
              children: /* @__PURE__ */ x.jsx(yE, { audioState: y, onWorkspace: k })
            },
            "setup"
          ) : null,
          d === "session" ? /* @__PURE__ */ x.jsxs(
            vn.div,
            {
              className: "focus-room-view focus-session-view",
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -8 },
              transition: Si,
              children: [
                o ? /* @__PURE__ */ x.jsx("button", { type: "button", className: "focus-mode-exit-hit-area", onClick: () => i(!1), children: "Exit Focus Mode" }) : /* @__PURE__ */ x.jsx(gE, { onWorkspace: k, onOpenTrail: () => n("trail"), onOpenCompanion: () => n("companion"), onOpenSettings: () => n("settings"), onExit: () => c(!0) }),
                /* @__PURE__ */ x.jsx("section", { className: `focus-session-stage ${o ? "is-focus-mode" : ""}`.trim(), "aria-hidden": "true" }),
                o ? /* @__PURE__ */ x.jsx(cM, { onExit: () => i(!1) }) : /* @__PURE__ */ x.jsx(SE, { audioState: y, onFocusMode: () => i(!0) }),
                o ? null : /* @__PURE__ */ x.jsx(lM, { audioState: y, utilityPanel: e, onClose: () => n(""), onWorkspace: k }),
                /* @__PURE__ */ x.jsx(qb, {}),
                /* @__PURE__ */ x.jsx(MM, { open: a, onClose: () => c(!1), onConfirm: A })
              ]
            },
            "session"
          ) : null
        ] })
      ]
    }
  );
}
function MM({ open: e, onClose: n, onConfirm: o }) {
  return e ? /* @__PURE__ */ x.jsx("div", { className: "focus-exit-overlay", role: "presentation", children: /* @__PURE__ */ x.jsxs("div", { className: "focus-exit-dialog liquid-glass", role: "dialog", "aria-modal": "true", "aria-labelledby": "focus-exit-title", children: [
    /* @__PURE__ */ x.jsx("span", { className: "focus-kicker", children: "Leave this room?" }),
    /* @__PURE__ */ x.jsx("h2", { id: "focus-exit-title", children: "End focus session" }),
    /* @__PURE__ */ x.jsx("p", { children: "Your focused time will be saved to your Focus Trail." }),
    /* @__PURE__ */ x.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ x.jsx(_e, { onClick: n, children: "Continue focusing" }),
      /* @__PURE__ */ x.jsx(_e, { variant: "primary", onClick: o, children: "End and exit" })
    ] })
  ] }) }) : null;
}
let hc = null;
function RM(e, n) {
  const o = globalThis.__synapseFocusRoomApi || {};
  if (typeof o[e] != "function") {
    console.warn(`Synapse Focus Room action "${e}" is not available yet.`);
    return;
  }
  return o[e](...n);
}
function DM() {
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
    globalThis[n] = (...i) => RM(o, i);
  });
}
function NM(e = {}) {
  DM();
  const n = e.root || document.getElementById("focusRoomRoot");
  if (!n)
    throw new Error("Focus Room root element was not found.");
  hc || (hc = Xx.createRoot(n), hc.render(
    gn.createElement(
      gn.StrictMode,
      null,
      gn.createElement(bM)
    )
  ));
}
const IM = "synapse.generated.history.v6", FS = "synapse.active.generated.v6", jM = "synapse.flashcards.deck.v1", FM = "synapse.quiz.history.v1", OM = "synapse.focusRoom.return-target.v1";
function af(e, n) {
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
function LM(e, n) {
  var o;
  try {
    return (o = globalThis.localStorage) == null || o.setItem(e, n), !0;
  } catch (i) {
    return console.warn(`Could not write ${e}:`, i), !1;
  }
}
function VM(e, n) {
  var o;
  try {
    return (o = globalThis.localStorage) == null || o.setItem(e, JSON.stringify(n)), !0;
  } catch (i) {
    return console.warn(`Could not write ${e}:`, i), !1;
  }
}
function OS() {
  const e = af(IM, []);
  return Array.isArray(e) ? e : [];
}
function BM(e) {
  const n = String((e == null ? void 0 : e.title) || "").trim();
  return n || String((e == null ? void 0 : e.summary) || "").split(/\n+/).map((i) => i.replace(/^#+\s*/, "").trim()).find((i) => i.length > 4) || "Generated Study Notes";
}
function LS(e = {}) {
  return [
    e.id ? `history:${e.id}` : "",
    e.sourceFingerprint ? `fingerprint:${e.sourceFingerprint}` : "",
    e.clientFingerprint ? `fingerprint:${e.clientFingerprint}` : ""
  ].filter(Boolean);
}
function zM(e = {}) {
  const n = af(jM, {}), i = LS(e).map((a) => n == null ? void 0 : n[a]).find((a) => a && Array.isArray(a.cards) && a.cards.length);
  return (i == null ? void 0 : i.cards) || [];
}
function UM(e = {}) {
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
function $M(e = []) {
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
function HM(e = {}) {
  const n = af(FM, {}), i = LS(e).flatMap((c) => Array.isArray(n == null ? void 0 : n[c]) ? n[c] : []), a = /* @__PURE__ */ new Set();
  return $M(i).filter((c) => {
    const d = UM(c);
    return !d || a.has(d) ? !1 : (a.add(d), !0);
  }).sort((c, d) => new Date(d.createdAt || 0) - new Date(c.createdAt || 0));
}
function WM(e = {}) {
  return {
    materialId: String(e.id || e.sourceFingerprint || e.clientFingerprint || "current-material"),
    materialTitle: BM(e),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: e.summary || "",
    sections: e.sections || {},
    flashcards: zM(e),
    quizzes: HM(e),
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
function VS() {
  return OS().filter((e) => e && (e.id || e.summary) && e.kind !== "companion" && !String(e.id || "").startsWith("companion:")).map(WM);
}
function BS(e = "") {
  const n = String(e || "");
  return n && VS().find(
    (o) => o.materialId === n || o.sourceFingerprint === n || o.clientFingerprint === n
  ) || null;
}
function zS() {
  var n;
  const e = ((n = globalThis.localStorage) == null ? void 0 : n.getItem(FS)) || "";
  return BS(e);
}
function GM(e = "") {
  var i;
  const n = e || ((i = zS()) == null ? void 0 : i.materialId) || "", o = n ? `/${encodeURIComponent(n)}` : "";
  globalThis.location.hash = `#/focus-room${o}`;
}
function KM(e = "", n = {}) {
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
async function YM(e = "", n = {}) {
  const o = String(e || ""), i = OS().find(
    (d) => String((d == null ? void 0 : d.id) || "") === o || String((d == null ? void 0 : d.sourceFingerprint) || (d == null ? void 0 : d.source_fingerprint) || "") === o || String((d == null ? void 0 : d.clientFingerprint) || (d == null ? void 0 : d.client_fingerprint) || "") === o
  ) || null, a = String((i == null ? void 0 : i.id) || "");
  a && LM(FS, a);
  const c = KM(a, n);
  c.action && VM(OM, c), globalThis.location.href = a ? `index.html?focusReturn=${encodeURIComponent(a)}` : "index.html";
}
function QM() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: zS,
    getSynapseFocusRoomMaterial: BS,
    getSynapseFocusRoomMaterials: VS,
    openSynapseFocusRoom: GM,
    returnFromFocusRoomToWorkspace: YM
  });
}
const US = document.getElementById("focusRoomRoot");
if (!US)
  throw new Error("Focus Room root element was not found.");
var mg;
(mg = document.getElementById("focusRoomFallbackTitle")) == null || mg.remove();
globalThis.apiClient = new yg(Ux);
QM();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
NM({ root: US });
