function rx(e, n) {
  for (var i = 0; i < n.length; i++) {
    const o = n[i];
    if (typeof o != "string" && !Array.isArray(o)) {
      for (const a in o)
        if (a !== "default" && !(a in e)) {
          const c = Object.getOwnPropertyDescriptor(o, a);
          c && Object.defineProperty(e, a, c.get ? c : {
            enumerable: !0,
            get: () => o[a]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }));
}
function ix(e) {
  const i = String(e || "").toLowerCase().split(".");
  if (i.length !== 4 || i.some((a) => !/^\d+$/.test(a))) return !1;
  const o = i.map(Number);
  return o.some((a) => a < 0 || a > 255) ? !1 : o[0] === 10 || o[0] === 172 && o[1] >= 16 && o[1] <= 31 || o[0] === 192 && o[1] === 168;
}
function $y(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function Ih(e) {
  return $y(e) || ix(e);
}
function ox(e) {
  return !e || $y(e) ? "127.0.0.1" : e;
}
const sx = (() => {
  var f, y, g, v;
  const { protocol: e, hostname: n, port: i } = window.location, o = String(window.SYNAPSE_BACKEND_PORT || ((y = (f = document.body) == null ? void 0 : f.dataset) == null ? void 0 : y.apiPort) || "8001").trim(), a = `http://${ox(n)}:${o || "8001"}`, c = String(window.SYNAPSE_API_BASE || ((v = (g = document.body) == null ? void 0 : g.dataset) == null ? void 0 : v.apiBase) || "").replace(/\/+$/, ""), d = `${e}//${window.location.host}`.replace(/\/+$/, "");
  return c && !(Ih(n) && i !== o && c === d) ? c : e === "file:" || Ih(n) && i !== o ? a : `${e}//${window.location.host}`;
})();
class Ds extends Error {
  constructor(n, { cause: i } = {}) {
    super(n), this.name = "ApiConnectionError", this.cause = i;
  }
}
const Fh = "synapse.client.id.v1";
function On() {
  return globalThis.window || globalThis;
}
function zr(e, n = 220) {
  return String(e || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
}
function Oh() {
  const e = globalThis.crypto || On().crypto;
  return e != null && e.randomUUID ? e.randomUUID() : `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
function ax() {
  var n, i;
  const e = On();
  try {
    const o = (n = e.localStorage) == null ? void 0 : n.getItem(Fh);
    if (o) return o;
    const a = Oh();
    return (i = e.localStorage) == null || i.setItem(Fh, a), a;
  } catch {
    return Oh();
  }
}
function lx(e = {}) {
  if (typeof Headers < "u" && e instanceof Headers) {
    const n = {};
    return e.forEach((i, o) => {
      n[o] = i;
    }), n;
  }
  return Array.isArray(e) ? Object.fromEntries(e) : { ...e || {} };
}
class Hy {
  constructor(n, { fetchImpl: i } = {}) {
    var a, c;
    const o = On();
    this.baseUrl = String(n || "").replace(/\/+$/, ""), this.fetchImpl = i || ((a = o.fetch) == null ? void 0 : a.bind(o)) || ((c = globalThis.fetch) == null ? void 0 : c.bind(globalThis));
  }
  endpoint(n) {
    const i = String(n || "").replace(/^\/+/, "");
    return `${this.baseUrl}/${i}`;
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
    var c, d, f;
    const i = On(), o = lx(n);
    o["X-Synapse-Client-Id"] = zr(ax(), 160);
    const a = (d = (c = i.SynapseAuth) == null ? void 0 : c.getStoredSession) == null ? void 0 : d.call(c);
    if (a && typeof a == "object" && (a.accountId && (o["X-Synapse-User-Id"] = zr(a.accountId, 160)), a.email && (o["X-Synapse-User-Email"] = zr(a.email, 220)), a.displayName && (o["X-Synapse-User-Name"] = zr(a.displayName, 180)), a.authMode && (o["X-Synapse-Auth-Mode"] = zr(a.authMode, 60)), a.role && (o["X-Synapse-User-Role"] = zr(a.role, 80))), (f = i.SynapseAuth) != null && f.authHeaders && !o.Authorization && !o.authorization)
      try {
        const y = await i.SynapseAuth.authHeaders({});
        y != null && y.Authorization && (o.Authorization = y.Authorization), y != null && y.authorization && (o.authorization = y.authorization);
      } catch (y) {
        console.warn("Synapse auth headers were not attached:", y);
      }
    return o;
  }
  async fetch(n, i = {}) {
    const o = this.endpoint(n), { timeoutMs: a, ...c } = i || {};
    c.headers = await this.requestHeaders(c.headers || {});
    const d = Number(a || 0);
    let f = null, y = null, g = null, v = !1;
    const l = c.signal;
    d > 0 && typeof AbortController < "u" && (f = new AbortController(), g = () => f.abort(), l && (l.aborted ? f.abort() : l.addEventListener("abort", g, { once: !0 })), y = On().setTimeout(() => {
      v = !0, f.abort();
    }, d), c.signal = f.signal);
    try {
      return await this.fetchImpl(o, c);
    } catch (h) {
      throw v ? new Ds(this.timeoutMessage(d), { cause: h }) : l != null && l.aborted ? h : new Ds(this.connectionMessage(), { cause: h });
    } finally {
      y && On().clearTimeout(y), l && g && l.removeEventListener("abort", g);
    }
  }
  async warmup({ attempts: n = 2, retryDelayMs: i = 1500, timeoutMs: o = 6e4, maxWaitMs: a = 0, signal: c } = {}) {
    const d = Math.max(1, Math.floor(Number(n) || 1)), f = Math.max(0, Number(a) || 0), y = Date.now();
    let g = null;
    for (let v = 0; v < d; v += 1) {
      const l = Date.now() - y, h = f > 0 ? f - l : 0;
      if (f > 0 && h <= 0) break;
      try {
        const S = await this.fetch("/healthz", {
          method: "GET",
          signal: c,
          timeoutMs: f > 0 ? Math.min(o, h) : o
        });
        if (S != null && S.ok) return S;
        g = new Ds(
          `Synapse hosted service returned ${(S == null ? void 0 : S.status) || "an unexpected status"} while preparing your analysis.`
        );
      } catch (S) {
        g = S;
      }
      if (v < d - 1 && i > 0) {
        const S = f > 0 ? f - (Date.now() - y) : i;
        if (f > 0 && S <= 0) break;
        await new Promise((w) => On().setTimeout(w, Math.min(i, S)));
      }
    }
    throw g || new Ds(this.connectionMessage());
  }
  isRetryableResponse(n) {
    return [502, 503, 504].includes(Number(n == null ? void 0 : n.status));
  }
  async fetchWithRetry(n, i = {}, { attempts: o = 3, retryDelayMs: a = 3e3 } = {}) {
    const c = Math.max(1, Math.floor(Number(o) || 1));
    let d = null;
    for (let f = 0; f < c; f += 1) {
      if (d = await this.fetch(n, i), !this.isRetryableResponse(d) || f === c - 1) return d;
      a > 0 && await new Promise((y) => On().setTimeout(y, a));
    }
    return d;
  }
}
var Gi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Wy(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Cu = { exports: {} }, pe = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var jh;
function ux() {
  if (jh) return pe;
  jh = 1;
  var e = Symbol.for("react.element"), n = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), o = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), d = Symbol.for("react.context"), f = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), l = Symbol.iterator;
  function h(N) {
    return N === null || typeof N != "object" ? null : (N = l && N[l] || N["@@iterator"], typeof N == "function" ? N : null);
  }
  var S = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, w = Object.assign, _ = {};
  function A(N, L, le) {
    this.props = N, this.context = L, this.refs = _, this.updater = le || S;
  }
  A.prototype.isReactComponent = {}, A.prototype.setState = function(N, L) {
    if (typeof N != "object" && typeof N != "function" && N != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, N, L, "setState");
  }, A.prototype.forceUpdate = function(N) {
    this.updater.enqueueForceUpdate(this, N, "forceUpdate");
  };
  function T() {
  }
  T.prototype = A.prototype;
  function M(N, L, le) {
    this.props = N, this.context = L, this.refs = _, this.updater = le || S;
  }
  var R = M.prototype = new T();
  R.constructor = M, w(R, A.prototype), R.isPureReactComponent = !0;
  var D = Array.isArray, j = Object.prototype.hasOwnProperty, G = { current: null }, K = { key: !0, ref: !0, __self: !0, __source: !0 };
  function $(N, L, le) {
    var fe, ge = {}, ve = null, Ce = null;
    if (L != null) for (fe in L.ref !== void 0 && (Ce = L.ref), L.key !== void 0 && (ve = "" + L.key), L) j.call(L, fe) && !K.hasOwnProperty(fe) && (ge[fe] = L[fe]);
    var xe = arguments.length - 2;
    if (xe === 1) ge.children = le;
    else if (1 < xe) {
      for (var be = Array(xe), gt = 0; gt < xe; gt++) be[gt] = arguments[gt + 2];
      ge.children = be;
    }
    if (N && N.defaultProps) for (fe in xe = N.defaultProps, xe) ge[fe] === void 0 && (ge[fe] = xe[fe]);
    return { $$typeof: e, type: N, key: ve, ref: Ce, props: ge, _owner: G.current };
  }
  function W(N, L) {
    return { $$typeof: e, type: N.type, key: L, ref: N.ref, props: N.props, _owner: N._owner };
  }
  function X(N) {
    return typeof N == "object" && N !== null && N.$$typeof === e;
  }
  function te(N) {
    var L = { "=": "=0", ":": "=2" };
    return "$" + N.replace(/[=:]/g, function(le) {
      return L[le];
    });
  }
  var de = /\/+/g;
  function he(N, L) {
    return typeof N == "object" && N !== null && N.key != null ? te("" + N.key) : L.toString(36);
  }
  function Q(N, L, le, fe, ge) {
    var ve = typeof N;
    (ve === "undefined" || ve === "boolean") && (N = null);
    var Ce = !1;
    if (N === null) Ce = !0;
    else switch (ve) {
      case "string":
      case "number":
        Ce = !0;
        break;
      case "object":
        switch (N.$$typeof) {
          case e:
          case n:
            Ce = !0;
        }
    }
    if (Ce) return Ce = N, ge = ge(Ce), N = fe === "" ? "." + he(Ce, 0) : fe, D(ge) ? (le = "", N != null && (le = N.replace(de, "$&/") + "/"), Q(ge, L, le, "", function(gt) {
      return gt;
    })) : ge != null && (X(ge) && (ge = W(ge, le + (!ge.key || Ce && Ce.key === ge.key ? "" : ("" + ge.key).replace(de, "$&/") + "/") + N)), L.push(ge)), 1;
    if (Ce = 0, fe = fe === "" ? "." : fe + ":", D(N)) for (var xe = 0; xe < N.length; xe++) {
      ve = N[xe];
      var be = fe + he(ve, xe);
      Ce += Q(ve, L, le, be, ge);
    }
    else if (be = h(N), typeof be == "function") for (N = be.call(N), xe = 0; !(ve = N.next()).done; ) ve = ve.value, be = fe + he(ve, xe++), Ce += Q(ve, L, le, be, ge);
    else if (ve === "object") throw L = String(N), Error("Objects are not valid as a React child (found: " + (L === "[object Object]" ? "object with keys {" + Object.keys(N).join(", ") + "}" : L) + "). If you meant to render a collection of children, use an array instead.");
    return Ce;
  }
  function we(N, L, le) {
    if (N == null) return N;
    var fe = [], ge = 0;
    return Q(N, fe, "", "", function(ve) {
      return L.call(le, ve, ge++);
    }), fe;
  }
  function ce(N) {
    if (N._status === -1) {
      var L = N._result;
      L = L(), L.then(function(le) {
        (N._status === 0 || N._status === -1) && (N._status = 1, N._result = le);
      }, function(le) {
        (N._status === 0 || N._status === -1) && (N._status = 2, N._result = le);
      }), N._status === -1 && (N._status = 0, N._result = L);
    }
    if (N._status === 1) return N._result.default;
    throw N._result;
  }
  var me = { current: null }, z = { transition: null }, ee = { ReactCurrentDispatcher: me, ReactCurrentBatchConfig: z, ReactCurrentOwner: G };
  function Y() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return pe.Children = { map: we, forEach: function(N, L, le) {
    we(N, function() {
      L.apply(this, arguments);
    }, le);
  }, count: function(N) {
    var L = 0;
    return we(N, function() {
      L++;
    }), L;
  }, toArray: function(N) {
    return we(N, function(L) {
      return L;
    }) || [];
  }, only: function(N) {
    if (!X(N)) throw Error("React.Children.only expected to receive a single React element child.");
    return N;
  } }, pe.Component = A, pe.Fragment = i, pe.Profiler = a, pe.PureComponent = M, pe.StrictMode = o, pe.Suspense = y, pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ee, pe.act = Y, pe.cloneElement = function(N, L, le) {
    if (N == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + N + ".");
    var fe = w({}, N.props), ge = N.key, ve = N.ref, Ce = N._owner;
    if (L != null) {
      if (L.ref !== void 0 && (ve = L.ref, Ce = G.current), L.key !== void 0 && (ge = "" + L.key), N.type && N.type.defaultProps) var xe = N.type.defaultProps;
      for (be in L) j.call(L, be) && !K.hasOwnProperty(be) && (fe[be] = L[be] === void 0 && xe !== void 0 ? xe[be] : L[be]);
    }
    var be = arguments.length - 2;
    if (be === 1) fe.children = le;
    else if (1 < be) {
      xe = Array(be);
      for (var gt = 0; gt < be; gt++) xe[gt] = arguments[gt + 2];
      fe.children = xe;
    }
    return { $$typeof: e, type: N.type, key: ge, ref: ve, props: fe, _owner: Ce };
  }, pe.createContext = function(N) {
    return N = { $$typeof: d, _currentValue: N, _currentValue2: N, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, N.Provider = { $$typeof: c, _context: N }, N.Consumer = N;
  }, pe.createElement = $, pe.createFactory = function(N) {
    var L = $.bind(null, N);
    return L.type = N, L;
  }, pe.createRef = function() {
    return { current: null };
  }, pe.forwardRef = function(N) {
    return { $$typeof: f, render: N };
  }, pe.isValidElement = X, pe.lazy = function(N) {
    return { $$typeof: v, _payload: { _status: -1, _result: N }, _init: ce };
  }, pe.memo = function(N, L) {
    return { $$typeof: g, type: N, compare: L === void 0 ? null : L };
  }, pe.startTransition = function(N) {
    var L = z.transition;
    z.transition = {};
    try {
      N();
    } finally {
      z.transition = L;
    }
  }, pe.unstable_act = Y, pe.useCallback = function(N, L) {
    return me.current.useCallback(N, L);
  }, pe.useContext = function(N) {
    return me.current.useContext(N);
  }, pe.useDebugValue = function() {
  }, pe.useDeferredValue = function(N) {
    return me.current.useDeferredValue(N);
  }, pe.useEffect = function(N, L) {
    return me.current.useEffect(N, L);
  }, pe.useId = function() {
    return me.current.useId();
  }, pe.useImperativeHandle = function(N, L, le) {
    return me.current.useImperativeHandle(N, L, le);
  }, pe.useInsertionEffect = function(N, L) {
    return me.current.useInsertionEffect(N, L);
  }, pe.useLayoutEffect = function(N, L) {
    return me.current.useLayoutEffect(N, L);
  }, pe.useMemo = function(N, L) {
    return me.current.useMemo(N, L);
  }, pe.useReducer = function(N, L, le) {
    return me.current.useReducer(N, L, le);
  }, pe.useRef = function(N) {
    return me.current.useRef(N);
  }, pe.useState = function(N) {
    return me.current.useState(N);
  }, pe.useSyncExternalStore = function(N, L, le) {
    return me.current.useSyncExternalStore(N, L, le);
  }, pe.useTransition = function() {
    return me.current.useTransition();
  }, pe.version = "18.3.1", pe;
}
var Lh;
function Gc() {
  return Lh || (Lh = 1, Cu.exports = ux()), Cu.exports;
}
var C = Gc();
const hn = /* @__PURE__ */ Wy(C), Kc = /* @__PURE__ */ rx({
  __proto__: null,
  default: hn
}, [C]);
var Ns = {}, Pu = { exports: {} }, ft = {}, Eu = { exports: {} }, Mu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Vh;
function cx() {
  return Vh || (Vh = 1, (function(e) {
    function n(z, ee) {
      var Y = z.length;
      z.push(ee);
      e: for (; 0 < Y; ) {
        var N = Y - 1 >>> 1, L = z[N];
        if (0 < a(L, ee)) z[N] = ee, z[Y] = L, Y = N;
        else break e;
      }
    }
    function i(z) {
      return z.length === 0 ? null : z[0];
    }
    function o(z) {
      if (z.length === 0) return null;
      var ee = z[0], Y = z.pop();
      if (Y !== ee) {
        z[0] = Y;
        e: for (var N = 0, L = z.length, le = L >>> 1; N < le; ) {
          var fe = 2 * (N + 1) - 1, ge = z[fe], ve = fe + 1, Ce = z[ve];
          if (0 > a(ge, Y)) ve < L && 0 > a(Ce, ge) ? (z[N] = Ce, z[ve] = Y, N = ve) : (z[N] = ge, z[fe] = Y, N = fe);
          else if (ve < L && 0 > a(Ce, Y)) z[N] = Ce, z[ve] = Y, N = ve;
          else break e;
        }
      }
      return ee;
    }
    function a(z, ee) {
      var Y = z.sortIndex - ee.sortIndex;
      return Y !== 0 ? Y : z.id - ee.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var c = performance;
      e.unstable_now = function() {
        return c.now();
      };
    } else {
      var d = Date, f = d.now();
      e.unstable_now = function() {
        return d.now() - f;
      };
    }
    var y = [], g = [], v = 1, l = null, h = 3, S = !1, w = !1, _ = !1, A = typeof setTimeout == "function" ? setTimeout : null, T = typeof clearTimeout == "function" ? clearTimeout : null, M = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function R(z) {
      for (var ee = i(g); ee !== null; ) {
        if (ee.callback === null) o(g);
        else if (ee.startTime <= z) o(g), ee.sortIndex = ee.expirationTime, n(y, ee);
        else break;
        ee = i(g);
      }
    }
    function D(z) {
      if (_ = !1, R(z), !w) if (i(y) !== null) w = !0, ce(j);
      else {
        var ee = i(g);
        ee !== null && me(D, ee.startTime - z);
      }
    }
    function j(z, ee) {
      w = !1, _ && (_ = !1, T($), $ = -1), S = !0;
      var Y = h;
      try {
        for (R(ee), l = i(y); l !== null && (!(l.expirationTime > ee) || z && !te()); ) {
          var N = l.callback;
          if (typeof N == "function") {
            l.callback = null, h = l.priorityLevel;
            var L = N(l.expirationTime <= ee);
            ee = e.unstable_now(), typeof L == "function" ? l.callback = L : l === i(y) && o(y), R(ee);
          } else o(y);
          l = i(y);
        }
        if (l !== null) var le = !0;
        else {
          var fe = i(g);
          fe !== null && me(D, fe.startTime - ee), le = !1;
        }
        return le;
      } finally {
        l = null, h = Y, S = !1;
      }
    }
    var G = !1, K = null, $ = -1, W = 5, X = -1;
    function te() {
      return !(e.unstable_now() - X < W);
    }
    function de() {
      if (K !== null) {
        var z = e.unstable_now();
        X = z;
        var ee = !0;
        try {
          ee = K(!0, z);
        } finally {
          ee ? he() : (G = !1, K = null);
        }
      } else G = !1;
    }
    var he;
    if (typeof M == "function") he = function() {
      M(de);
    };
    else if (typeof MessageChannel < "u") {
      var Q = new MessageChannel(), we = Q.port2;
      Q.port1.onmessage = de, he = function() {
        we.postMessage(null);
      };
    } else he = function() {
      A(de, 0);
    };
    function ce(z) {
      K = z, G || (G = !0, he());
    }
    function me(z, ee) {
      $ = A(function() {
        z(e.unstable_now());
      }, ee);
    }
    e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(z) {
      z.callback = null;
    }, e.unstable_continueExecution = function() {
      w || S || (w = !0, ce(j));
    }, e.unstable_forceFrameRate = function(z) {
      0 > z || 125 < z ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : W = 0 < z ? Math.floor(1e3 / z) : 5;
    }, e.unstable_getCurrentPriorityLevel = function() {
      return h;
    }, e.unstable_getFirstCallbackNode = function() {
      return i(y);
    }, e.unstable_next = function(z) {
      switch (h) {
        case 1:
        case 2:
        case 3:
          var ee = 3;
          break;
        default:
          ee = h;
      }
      var Y = h;
      h = ee;
      try {
        return z();
      } finally {
        h = Y;
      }
    }, e.unstable_pauseExecution = function() {
    }, e.unstable_requestPaint = function() {
    }, e.unstable_runWithPriority = function(z, ee) {
      switch (z) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          z = 3;
      }
      var Y = h;
      h = z;
      try {
        return ee();
      } finally {
        h = Y;
      }
    }, e.unstable_scheduleCallback = function(z, ee, Y) {
      var N = e.unstable_now();
      switch (typeof Y == "object" && Y !== null ? (Y = Y.delay, Y = typeof Y == "number" && 0 < Y ? N + Y : N) : Y = N, z) {
        case 1:
          var L = -1;
          break;
        case 2:
          L = 250;
          break;
        case 5:
          L = 1073741823;
          break;
        case 4:
          L = 1e4;
          break;
        default:
          L = 5e3;
      }
      return L = Y + L, z = { id: v++, callback: ee, priorityLevel: z, startTime: Y, expirationTime: L, sortIndex: -1 }, Y > N ? (z.sortIndex = Y, n(g, z), i(y) === null && z === i(g) && (_ ? (T($), $ = -1) : _ = !0, me(D, Y - N))) : (z.sortIndex = L, n(y, z), w || S || (w = !0, ce(j))), z;
    }, e.unstable_shouldYield = te, e.unstable_wrapCallback = function(z) {
      var ee = h;
      return function() {
        var Y = h;
        h = ee;
        try {
          return z.apply(this, arguments);
        } finally {
          h = Y;
        }
      };
    };
  })(Mu)), Mu;
}
var Bh;
function dx() {
  return Bh || (Bh = 1, Eu.exports = cx()), Eu.exports;
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
var zh;
function fx() {
  if (zh) return ft;
  zh = 1;
  var e = Gc(), n = dx();
  function i(t) {
    for (var r = "https://reactjs.org/docs/error-decoder.html?invariant=" + t, s = 1; s < arguments.length; s++) r += "&args[]=" + encodeURIComponent(arguments[s]);
    return "Minified React error #" + t + "; visit " + r + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var o = /* @__PURE__ */ new Set(), a = {};
  function c(t, r) {
    d(t, r), d(t + "Capture", r);
  }
  function d(t, r) {
    for (a[t] = r, t = 0; t < r.length; t++) o.add(r[t]);
  }
  var f = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), y = Object.prototype.hasOwnProperty, g = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, v = {}, l = {};
  function h(t) {
    return y.call(l, t) ? !0 : y.call(v, t) ? !1 : g.test(t) ? l[t] = !0 : (v[t] = !0, !1);
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
  function _(t, r, s, u, p, m, x) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = u, this.attributeNamespace = p, this.mustUseProperty = s, this.propertyName = t, this.type = r, this.sanitizeURL = m, this.removeEmptyString = x;
  }
  var A = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t) {
    A[t] = new _(t, 0, !1, t, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(t) {
    var r = t[0];
    A[r] = new _(r, 1, !1, t[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(t) {
    A[t] = new _(t, 2, !1, t.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(t) {
    A[t] = new _(t, 2, !1, t, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t) {
    A[t] = new _(t, 3, !1, t.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(t) {
    A[t] = new _(t, 3, !0, t, null, !1, !1);
  }), ["capture", "download"].forEach(function(t) {
    A[t] = new _(t, 4, !1, t, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(t) {
    A[t] = new _(t, 6, !1, t, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(t) {
    A[t] = new _(t, 5, !1, t.toLowerCase(), null, !1, !1);
  });
  var T = /[\-:]([a-z])/g;
  function M(t) {
    return t[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t) {
    var r = t.replace(
      T,
      M
    );
    A[r] = new _(r, 1, !1, t, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t) {
    var r = t.replace(T, M);
    A[r] = new _(r, 1, !1, t, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(t) {
    var r = t.replace(T, M);
    A[r] = new _(r, 1, !1, t, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(t) {
    A[t] = new _(t, 1, !1, t.toLowerCase(), null, !1, !1);
  }), A.xlinkHref = new _("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(t) {
    A[t] = new _(t, 1, !1, t.toLowerCase(), null, !0, !0);
  });
  function R(t, r, s, u) {
    var p = A.hasOwnProperty(r) ? A[r] : null;
    (p !== null ? p.type !== 0 : u || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (w(r, s, p, u) && (s = null), u || p === null ? h(r) && (s === null ? t.removeAttribute(r) : t.setAttribute(r, "" + s)) : p.mustUseProperty ? t[p.propertyName] = s === null ? p.type === 3 ? !1 : "" : s : (r = p.attributeName, u = p.attributeNamespace, s === null ? t.removeAttribute(r) : (p = p.type, s = p === 3 || p === 4 && s === !0 ? "" : "" + s, u ? t.setAttributeNS(u, r, s) : t.setAttribute(r, s))));
  }
  var D = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, j = Symbol.for("react.element"), G = Symbol.for("react.portal"), K = Symbol.for("react.fragment"), $ = Symbol.for("react.strict_mode"), W = Symbol.for("react.profiler"), X = Symbol.for("react.provider"), te = Symbol.for("react.context"), de = Symbol.for("react.forward_ref"), he = Symbol.for("react.suspense"), Q = Symbol.for("react.suspense_list"), we = Symbol.for("react.memo"), ce = Symbol.for("react.lazy"), me = Symbol.for("react.offscreen"), z = Symbol.iterator;
  function ee(t) {
    return t === null || typeof t != "object" ? null : (t = z && t[z] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var Y = Object.assign, N;
  function L(t) {
    if (N === void 0) try {
      throw Error();
    } catch (s) {
      var r = s.stack.trim().match(/\n( *(at )?)/);
      N = r && r[1] || "";
    }
    return `
` + N + t;
  }
  var le = !1;
  function fe(t, r) {
    if (!t || le) return "";
    le = !0;
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
        } catch (O) {
          var u = O;
        }
        Reflect.construct(t, [], r);
      } else {
        try {
          r.call();
        } catch (O) {
          u = O;
        }
        t.call(r.prototype);
      }
      else {
        try {
          throw Error();
        } catch (O) {
          u = O;
        }
        t();
      }
    } catch (O) {
      if (O && u && typeof O.stack == "string") {
        for (var p = O.stack.split(`
`), m = u.stack.split(`
`), x = p.length - 1, P = m.length - 1; 1 <= x && 0 <= P && p[x] !== m[P]; ) P--;
        for (; 1 <= x && 0 <= P; x--, P--) if (p[x] !== m[P]) {
          if (x !== 1 || P !== 1)
            do
              if (x--, P--, 0 > P || p[x] !== m[P]) {
                var E = `
` + p[x].replace(" at new ", " at ");
                return t.displayName && E.includes("<anonymous>") && (E = E.replace("<anonymous>", t.displayName)), E;
              }
            while (1 <= x && 0 <= P);
          break;
        }
      }
    } finally {
      le = !1, Error.prepareStackTrace = s;
    }
    return (t = t ? t.displayName || t.name : "") ? L(t) : "";
  }
  function ge(t) {
    switch (t.tag) {
      case 5:
        return L(t.type);
      case 16:
        return L("Lazy");
      case 13:
        return L("Suspense");
      case 19:
        return L("SuspenseList");
      case 0:
      case 2:
      case 15:
        return t = fe(t.type, !1), t;
      case 11:
        return t = fe(t.type.render, !1), t;
      case 1:
        return t = fe(t.type, !0), t;
      default:
        return "";
    }
  }
  function ve(t) {
    if (t == null) return null;
    if (typeof t == "function") return t.displayName || t.name || null;
    if (typeof t == "string") return t;
    switch (t) {
      case K:
        return "Fragment";
      case G:
        return "Portal";
      case W:
        return "Profiler";
      case $:
        return "StrictMode";
      case he:
        return "Suspense";
      case Q:
        return "SuspenseList";
    }
    if (typeof t == "object") switch (t.$$typeof) {
      case te:
        return (t.displayName || "Context") + ".Consumer";
      case X:
        return (t._context.displayName || "Context") + ".Provider";
      case de:
        var r = t.render;
        return t = t.displayName, t || (t = r.displayName || r.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
      case we:
        return r = t.displayName || null, r !== null ? r : ve(t.type) || "Memo";
      case ce:
        r = t._payload, t = t._init;
        try {
          return ve(t(r));
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
        return ve(r);
      case 8:
        return r === $ ? "StrictMode" : "Mode";
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
  function xe(t) {
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
  function be(t) {
    var r = t.type;
    return (t = t.nodeName) && t.toLowerCase() === "input" && (r === "checkbox" || r === "radio");
  }
  function gt(t) {
    var r = be(t) ? "checked" : "value", s = Object.getOwnPropertyDescriptor(t.constructor.prototype, r), u = "" + t[r];
    if (!t.hasOwnProperty(r) && typeof s < "u" && typeof s.get == "function" && typeof s.set == "function") {
      var p = s.get, m = s.set;
      return Object.defineProperty(t, r, { configurable: !0, get: function() {
        return p.call(this);
      }, set: function(x) {
        u = "" + x, m.call(this, x);
      } }), Object.defineProperty(t, r, { enumerable: s.enumerable }), { getValue: function() {
        return u;
      }, setValue: function(x) {
        u = "" + x;
      }, stopTracking: function() {
        t._valueTracker = null, delete t[r];
      } };
    }
  }
  function _o(t) {
    t._valueTracker || (t._valueTracker = gt(t));
  }
  function Vd(t) {
    if (!t) return !1;
    var r = t._valueTracker;
    if (!r) return !0;
    var s = r.getValue(), u = "";
    return t && (u = be(t) ? t.checked ? "true" : "false" : t.value), t = u, t !== s ? (r.setValue(t), !0) : !1;
  }
  function To(t) {
    if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u") return null;
    try {
      return t.activeElement || t.body;
    } catch {
      return t.body;
    }
  }
  function Na(t, r) {
    var s = r.checked;
    return Y({}, r, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: s ?? t._wrapperState.initialChecked });
  }
  function Bd(t, r) {
    var s = r.defaultValue == null ? "" : r.defaultValue, u = r.checked != null ? r.checked : r.defaultChecked;
    s = xe(r.value != null ? r.value : s), t._wrapperState = { initialChecked: u, initialValue: s, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function zd(t, r) {
    r = r.checked, r != null && R(t, "checked", r, !1);
  }
  function Ia(t, r) {
    zd(t, r);
    var s = xe(r.value), u = r.type;
    if (s != null) u === "number" ? (s === 0 && t.value === "" || t.value != s) && (t.value = "" + s) : t.value !== "" + s && (t.value = "" + s);
    else if (u === "submit" || u === "reset") {
      t.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? Fa(t, r.type, s) : r.hasOwnProperty("defaultValue") && Fa(t, r.type, xe(r.defaultValue)), r.checked == null && r.defaultChecked != null && (t.defaultChecked = !!r.defaultChecked);
  }
  function Ud(t, r, s) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var u = r.type;
      if (!(u !== "submit" && u !== "reset" || r.value !== void 0 && r.value !== null)) return;
      r = "" + t._wrapperState.initialValue, s || r === t.value || (t.value = r), t.defaultValue = r;
    }
    s = t.name, s !== "" && (t.name = ""), t.defaultChecked = !!t._wrapperState.initialChecked, s !== "" && (t.name = s);
  }
  function Fa(t, r, s) {
    (r !== "number" || To(t.ownerDocument) !== t) && (s == null ? t.defaultValue = "" + t._wrapperState.initialValue : t.defaultValue !== "" + s && (t.defaultValue = "" + s));
  }
  var ai = Array.isArray;
  function yr(t, r, s, u) {
    if (t = t.options, r) {
      r = {};
      for (var p = 0; p < s.length; p++) r["$" + s[p]] = !0;
      for (s = 0; s < t.length; s++) p = r.hasOwnProperty("$" + t[s].value), t[s].selected !== p && (t[s].selected = p), p && u && (t[s].defaultSelected = !0);
    } else {
      for (s = "" + xe(s), r = null, p = 0; p < t.length; p++) {
        if (t[p].value === s) {
          t[p].selected = !0, u && (t[p].defaultSelected = !0);
          return;
        }
        r !== null || t[p].disabled || (r = t[p]);
      }
      r !== null && (r.selected = !0);
    }
  }
  function Oa(t, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(i(91));
    return Y({}, r, { value: void 0, defaultValue: void 0, children: "" + t._wrapperState.initialValue });
  }
  function $d(t, r) {
    var s = r.value;
    if (s == null) {
      if (s = r.children, r = r.defaultValue, s != null) {
        if (r != null) throw Error(i(92));
        if (ai(s)) {
          if (1 < s.length) throw Error(i(93));
          s = s[0];
        }
        r = s;
      }
      r == null && (r = ""), s = r;
    }
    t._wrapperState = { initialValue: xe(s) };
  }
  function Hd(t, r) {
    var s = xe(r.value), u = xe(r.defaultValue);
    s != null && (s = "" + s, s !== t.value && (t.value = s), r.defaultValue == null && t.defaultValue !== s && (t.defaultValue = s)), u != null && (t.defaultValue = "" + u);
  }
  function Wd(t) {
    var r = t.textContent;
    r === t._wrapperState.initialValue && r !== "" && r !== null && (t.value = r);
  }
  function Gd(t) {
    switch (t) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function ja(t, r) {
    return t == null || t === "http://www.w3.org/1999/xhtml" ? Gd(r) : t === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : t;
  }
  var ko, Kd = (function(t) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, s, u, p) {
      MSApp.execUnsafeLocalFunction(function() {
        return t(r, s, u, p);
      });
    } : t;
  })(function(t, r) {
    if (t.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in t) t.innerHTML = r;
    else {
      for (ko = ko || document.createElement("div"), ko.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>", r = ko.firstChild; t.firstChild; ) t.removeChild(t.firstChild);
      for (; r.firstChild; ) t.appendChild(r.firstChild);
    }
  });
  function li(t, r) {
    if (r) {
      var s = t.firstChild;
      if (s && s === t.lastChild && s.nodeType === 3) {
        s.nodeValue = r;
        return;
      }
    }
    t.textContent = r;
  }
  var ui = {
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
  }, aS = ["Webkit", "ms", "Moz", "O"];
  Object.keys(ui).forEach(function(t) {
    aS.forEach(function(r) {
      r = r + t.charAt(0).toUpperCase() + t.substring(1), ui[r] = ui[t];
    });
  });
  function Yd(t, r, s) {
    return r == null || typeof r == "boolean" || r === "" ? "" : s || typeof r != "number" || r === 0 || ui.hasOwnProperty(t) && ui[t] ? ("" + r).trim() : r + "px";
  }
  function Qd(t, r) {
    t = t.style;
    for (var s in r) if (r.hasOwnProperty(s)) {
      var u = s.indexOf("--") === 0, p = Yd(s, r[s], u);
      s === "float" && (s = "cssFloat"), u ? t.setProperty(s, p) : t[s] = p;
    }
  }
  var lS = Y({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function La(t, r) {
    if (r) {
      if (lS[t] && (r.children != null || r.dangerouslySetInnerHTML != null)) throw Error(i(137, t));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null) throw Error(i(60));
        if (typeof r.dangerouslySetInnerHTML != "object" || !("__html" in r.dangerouslySetInnerHTML)) throw Error(i(61));
      }
      if (r.style != null && typeof r.style != "object") throw Error(i(62));
    }
  }
  function Va(t, r) {
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
  var Ba = null;
  function za(t) {
    return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
  }
  var Ua = null, gr = null, vr = null;
  function Xd(t) {
    if (t = Ri(t)) {
      if (typeof Ua != "function") throw Error(i(280));
      var r = t.stateNode;
      r && (r = Ko(r), Ua(t.stateNode, t.type, r));
    }
  }
  function Zd(t) {
    gr ? vr ? vr.push(t) : vr = [t] : gr = t;
  }
  function Jd() {
    if (gr) {
      var t = gr, r = vr;
      if (vr = gr = null, Xd(t), r) for (t = 0; t < r.length; t++) Xd(r[t]);
    }
  }
  function qd(t, r) {
    return t(r);
  }
  function ef() {
  }
  var $a = !1;
  function tf(t, r, s) {
    if ($a) return t(r, s);
    $a = !0;
    try {
      return qd(t, r, s);
    } finally {
      $a = !1, (gr !== null || vr !== null) && (ef(), Jd());
    }
  }
  function ci(t, r) {
    var s = t.stateNode;
    if (s === null) return null;
    var u = Ko(s);
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
    if (s && typeof s != "function") throw Error(i(231, r, typeof s));
    return s;
  }
  var Ha = !1;
  if (f) try {
    var di = {};
    Object.defineProperty(di, "passive", { get: function() {
      Ha = !0;
    } }), window.addEventListener("test", di, di), window.removeEventListener("test", di, di);
  } catch {
    Ha = !1;
  }
  function uS(t, r, s, u, p, m, x, P, E) {
    var O = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(s, O);
    } catch (B) {
      this.onError(B);
    }
  }
  var fi = !1, Ao = null, Co = !1, Wa = null, cS = { onError: function(t) {
    fi = !0, Ao = t;
  } };
  function dS(t, r, s, u, p, m, x, P, E) {
    fi = !1, Ao = null, uS.apply(cS, arguments);
  }
  function fS(t, r, s, u, p, m, x, P, E) {
    if (dS.apply(this, arguments), fi) {
      if (fi) {
        var O = Ao;
        fi = !1, Ao = null;
      } else throw Error(i(198));
      Co || (Co = !0, Wa = O);
    }
  }
  function Hn(t) {
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
  function nf(t) {
    if (t.tag === 13) {
      var r = t.memoizedState;
      if (r === null && (t = t.alternate, t !== null && (r = t.memoizedState)), r !== null) return r.dehydrated;
    }
    return null;
  }
  function rf(t) {
    if (Hn(t) !== t) throw Error(i(188));
  }
  function pS(t) {
    var r = t.alternate;
    if (!r) {
      if (r = Hn(t), r === null) throw Error(i(188));
      return r !== t ? null : t;
    }
    for (var s = t, u = r; ; ) {
      var p = s.return;
      if (p === null) break;
      var m = p.alternate;
      if (m === null) {
        if (u = p.return, u !== null) {
          s = u;
          continue;
        }
        break;
      }
      if (p.child === m.child) {
        for (m = p.child; m; ) {
          if (m === s) return rf(p), t;
          if (m === u) return rf(p), r;
          m = m.sibling;
        }
        throw Error(i(188));
      }
      if (s.return !== u.return) s = p, u = m;
      else {
        for (var x = !1, P = p.child; P; ) {
          if (P === s) {
            x = !0, s = p, u = m;
            break;
          }
          if (P === u) {
            x = !0, u = p, s = m;
            break;
          }
          P = P.sibling;
        }
        if (!x) {
          for (P = m.child; P; ) {
            if (P === s) {
              x = !0, s = m, u = p;
              break;
            }
            if (P === u) {
              x = !0, u = m, s = p;
              break;
            }
            P = P.sibling;
          }
          if (!x) throw Error(i(189));
        }
      }
      if (s.alternate !== u) throw Error(i(190));
    }
    if (s.tag !== 3) throw Error(i(188));
    return s.stateNode.current === s ? t : r;
  }
  function of(t) {
    return t = pS(t), t !== null ? sf(t) : null;
  }
  function sf(t) {
    if (t.tag === 5 || t.tag === 6) return t;
    for (t = t.child; t !== null; ) {
      var r = sf(t);
      if (r !== null) return r;
      t = t.sibling;
    }
    return null;
  }
  var af = n.unstable_scheduleCallback, lf = n.unstable_cancelCallback, hS = n.unstable_shouldYield, mS = n.unstable_requestPaint, Oe = n.unstable_now, yS = n.unstable_getCurrentPriorityLevel, Ga = n.unstable_ImmediatePriority, uf = n.unstable_UserBlockingPriority, Po = n.unstable_NormalPriority, gS = n.unstable_LowPriority, cf = n.unstable_IdlePriority, Eo = null, Ht = null;
  function vS(t) {
    if (Ht && typeof Ht.onCommitFiberRoot == "function") try {
      Ht.onCommitFiberRoot(Eo, t, void 0, (t.current.flags & 128) === 128);
    } catch {
    }
  }
  var Rt = Math.clz32 ? Math.clz32 : xS, SS = Math.log, wS = Math.LN2;
  function xS(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (SS(t) / wS | 0) | 0;
  }
  var Mo = 64, bo = 4194304;
  function pi(t) {
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
  function Ro(t, r) {
    var s = t.pendingLanes;
    if (s === 0) return 0;
    var u = 0, p = t.suspendedLanes, m = t.pingedLanes, x = s & 268435455;
    if (x !== 0) {
      var P = x & ~p;
      P !== 0 ? u = pi(P) : (m &= x, m !== 0 && (u = pi(m)));
    } else x = s & ~p, x !== 0 ? u = pi(x) : m !== 0 && (u = pi(m));
    if (u === 0) return 0;
    if (r !== 0 && r !== u && (r & p) === 0 && (p = u & -u, m = r & -r, p >= m || p === 16 && (m & 4194240) !== 0)) return r;
    if ((u & 4) !== 0 && (u |= s & 16), r = t.entangledLanes, r !== 0) for (t = t.entanglements, r &= u; 0 < r; ) s = 31 - Rt(r), p = 1 << s, u |= t[s], r &= ~p;
    return u;
  }
  function _S(t, r) {
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
  function TS(t, r) {
    for (var s = t.suspendedLanes, u = t.pingedLanes, p = t.expirationTimes, m = t.pendingLanes; 0 < m; ) {
      var x = 31 - Rt(m), P = 1 << x, E = p[x];
      E === -1 ? ((P & s) === 0 || (P & u) !== 0) && (p[x] = _S(P, r)) : E <= r && (t.expiredLanes |= P), m &= ~P;
    }
  }
  function Ka(t) {
    return t = t.pendingLanes & -1073741825, t !== 0 ? t : t & 1073741824 ? 1073741824 : 0;
  }
  function df() {
    var t = Mo;
    return Mo <<= 1, (Mo & 4194240) === 0 && (Mo = 64), t;
  }
  function Ya(t) {
    for (var r = [], s = 0; 31 > s; s++) r.push(t);
    return r;
  }
  function hi(t, r, s) {
    t.pendingLanes |= r, r !== 536870912 && (t.suspendedLanes = 0, t.pingedLanes = 0), t = t.eventTimes, r = 31 - Rt(r), t[r] = s;
  }
  function kS(t, r) {
    var s = t.pendingLanes & ~r;
    t.pendingLanes = r, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= r, t.mutableReadLanes &= r, t.entangledLanes &= r, r = t.entanglements;
    var u = t.eventTimes;
    for (t = t.expirationTimes; 0 < s; ) {
      var p = 31 - Rt(s), m = 1 << p;
      r[p] = 0, u[p] = -1, t[p] = -1, s &= ~m;
    }
  }
  function Qa(t, r) {
    var s = t.entangledLanes |= r;
    for (t = t.entanglements; s; ) {
      var u = 31 - Rt(s), p = 1 << u;
      p & r | t[u] & r && (t[u] |= r), s &= ~p;
    }
  }
  var _e = 0;
  function ff(t) {
    return t &= -t, 1 < t ? 4 < t ? (t & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var pf, Xa, hf, mf, yf, Za = !1, Do = [], mn = null, yn = null, gn = null, mi = /* @__PURE__ */ new Map(), yi = /* @__PURE__ */ new Map(), vn = [], AS = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function gf(t, r) {
    switch (t) {
      case "focusin":
      case "focusout":
        mn = null;
        break;
      case "dragenter":
      case "dragleave":
        yn = null;
        break;
      case "mouseover":
      case "mouseout":
        gn = null;
        break;
      case "pointerover":
      case "pointerout":
        mi.delete(r.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        yi.delete(r.pointerId);
    }
  }
  function gi(t, r, s, u, p, m) {
    return t === null || t.nativeEvent !== m ? (t = { blockedOn: r, domEventName: s, eventSystemFlags: u, nativeEvent: m, targetContainers: [p] }, r !== null && (r = Ri(r), r !== null && Xa(r)), t) : (t.eventSystemFlags |= u, r = t.targetContainers, p !== null && r.indexOf(p) === -1 && r.push(p), t);
  }
  function CS(t, r, s, u, p) {
    switch (r) {
      case "focusin":
        return mn = gi(mn, t, r, s, u, p), !0;
      case "dragenter":
        return yn = gi(yn, t, r, s, u, p), !0;
      case "mouseover":
        return gn = gi(gn, t, r, s, u, p), !0;
      case "pointerover":
        var m = p.pointerId;
        return mi.set(m, gi(mi.get(m) || null, t, r, s, u, p)), !0;
      case "gotpointercapture":
        return m = p.pointerId, yi.set(m, gi(yi.get(m) || null, t, r, s, u, p)), !0;
    }
    return !1;
  }
  function vf(t) {
    var r = Wn(t.target);
    if (r !== null) {
      var s = Hn(r);
      if (s !== null) {
        if (r = s.tag, r === 13) {
          if (r = nf(s), r !== null) {
            t.blockedOn = r, yf(t.priority, function() {
              hf(s);
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
  function No(t) {
    if (t.blockedOn !== null) return !1;
    for (var r = t.targetContainers; 0 < r.length; ) {
      var s = qa(t.domEventName, t.eventSystemFlags, r[0], t.nativeEvent);
      if (s === null) {
        s = t.nativeEvent;
        var u = new s.constructor(s.type, s);
        Ba = u, s.target.dispatchEvent(u), Ba = null;
      } else return r = Ri(s), r !== null && Xa(r), t.blockedOn = s, !1;
      r.shift();
    }
    return !0;
  }
  function Sf(t, r, s) {
    No(t) && s.delete(r);
  }
  function PS() {
    Za = !1, mn !== null && No(mn) && (mn = null), yn !== null && No(yn) && (yn = null), gn !== null && No(gn) && (gn = null), mi.forEach(Sf), yi.forEach(Sf);
  }
  function vi(t, r) {
    t.blockedOn === r && (t.blockedOn = null, Za || (Za = !0, n.unstable_scheduleCallback(n.unstable_NormalPriority, PS)));
  }
  function Si(t) {
    function r(p) {
      return vi(p, t);
    }
    if (0 < Do.length) {
      vi(Do[0], t);
      for (var s = 1; s < Do.length; s++) {
        var u = Do[s];
        u.blockedOn === t && (u.blockedOn = null);
      }
    }
    for (mn !== null && vi(mn, t), yn !== null && vi(yn, t), gn !== null && vi(gn, t), mi.forEach(r), yi.forEach(r), s = 0; s < vn.length; s++) u = vn[s], u.blockedOn === t && (u.blockedOn = null);
    for (; 0 < vn.length && (s = vn[0], s.blockedOn === null); ) vf(s), s.blockedOn === null && vn.shift();
  }
  var Sr = D.ReactCurrentBatchConfig, Io = !0;
  function ES(t, r, s, u) {
    var p = _e, m = Sr.transition;
    Sr.transition = null;
    try {
      _e = 1, Ja(t, r, s, u);
    } finally {
      _e = p, Sr.transition = m;
    }
  }
  function MS(t, r, s, u) {
    var p = _e, m = Sr.transition;
    Sr.transition = null;
    try {
      _e = 4, Ja(t, r, s, u);
    } finally {
      _e = p, Sr.transition = m;
    }
  }
  function Ja(t, r, s, u) {
    if (Io) {
      var p = qa(t, r, s, u);
      if (p === null) yl(t, r, u, Fo, s), gf(t, u);
      else if (CS(p, t, r, s, u)) u.stopPropagation();
      else if (gf(t, u), r & 4 && -1 < AS.indexOf(t)) {
        for (; p !== null; ) {
          var m = Ri(p);
          if (m !== null && pf(m), m = qa(t, r, s, u), m === null && yl(t, r, u, Fo, s), m === p) break;
          p = m;
        }
        p !== null && u.stopPropagation();
      } else yl(t, r, u, null, s);
    }
  }
  var Fo = null;
  function qa(t, r, s, u) {
    if (Fo = null, t = za(u), t = Wn(t), t !== null) if (r = Hn(t), r === null) t = null;
    else if (s = r.tag, s === 13) {
      if (t = nf(r), t !== null) return t;
      t = null;
    } else if (s === 3) {
      if (r.stateNode.current.memoizedState.isDehydrated) return r.tag === 3 ? r.stateNode.containerInfo : null;
      t = null;
    } else r !== t && (t = null);
    return Fo = t, null;
  }
  function wf(t) {
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
        switch (yS()) {
          case Ga:
            return 1;
          case uf:
            return 4;
          case Po:
          case gS:
            return 16;
          case cf:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Sn = null, el = null, Oo = null;
  function xf() {
    if (Oo) return Oo;
    var t, r = el, s = r.length, u, p = "value" in Sn ? Sn.value : Sn.textContent, m = p.length;
    for (t = 0; t < s && r[t] === p[t]; t++) ;
    var x = s - t;
    for (u = 1; u <= x && r[s - u] === p[m - u]; u++) ;
    return Oo = p.slice(t, 1 < u ? 1 - u : void 0);
  }
  function jo(t) {
    var r = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && r === 13 && (t = 13)) : t = r, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function Lo() {
    return !0;
  }
  function _f() {
    return !1;
  }
  function vt(t) {
    function r(s, u, p, m, x) {
      this._reactName = s, this._targetInst = p, this.type = u, this.nativeEvent = m, this.target = x, this.currentTarget = null;
      for (var P in t) t.hasOwnProperty(P) && (s = t[P], this[P] = s ? s(m) : m[P]);
      return this.isDefaultPrevented = (m.defaultPrevented != null ? m.defaultPrevented : m.returnValue === !1) ? Lo : _f, this.isPropagationStopped = _f, this;
    }
    return Y(r.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var s = this.nativeEvent;
      s && (s.preventDefault ? s.preventDefault() : typeof s.returnValue != "unknown" && (s.returnValue = !1), this.isDefaultPrevented = Lo);
    }, stopPropagation: function() {
      var s = this.nativeEvent;
      s && (s.stopPropagation ? s.stopPropagation() : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0), this.isPropagationStopped = Lo);
    }, persist: function() {
    }, isPersistent: Lo }), r;
  }
  var wr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(t) {
    return t.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, tl = vt(wr), wi = Y({}, wr, { view: 0, detail: 0 }), bS = vt(wi), nl, rl, xi, Vo = Y({}, wi, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: ol, button: 0, buttons: 0, relatedTarget: function(t) {
    return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
  }, movementX: function(t) {
    return "movementX" in t ? t.movementX : (t !== xi && (xi && t.type === "mousemove" ? (nl = t.screenX - xi.screenX, rl = t.screenY - xi.screenY) : rl = nl = 0, xi = t), nl);
  }, movementY: function(t) {
    return "movementY" in t ? t.movementY : rl;
  } }), Tf = vt(Vo), RS = Y({}, Vo, { dataTransfer: 0 }), DS = vt(RS), NS = Y({}, wi, { relatedTarget: 0 }), il = vt(NS), IS = Y({}, wr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), FS = vt(IS), OS = Y({}, wr, { clipboardData: function(t) {
    return "clipboardData" in t ? t.clipboardData : window.clipboardData;
  } }), jS = vt(OS), LS = Y({}, wr, { data: 0 }), kf = vt(LS), VS = {
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
  }, BS = {
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
  }, zS = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function US(t) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(t) : (t = zS[t]) ? !!r[t] : !1;
  }
  function ol() {
    return US;
  }
  var $S = Y({}, wi, { key: function(t) {
    if (t.key) {
      var r = VS[t.key] || t.key;
      if (r !== "Unidentified") return r;
    }
    return t.type === "keypress" ? (t = jo(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? BS[t.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: ol, charCode: function(t) {
    return t.type === "keypress" ? jo(t) : 0;
  }, keyCode: function(t) {
    return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  }, which: function(t) {
    return t.type === "keypress" ? jo(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  } }), HS = vt($S), WS = Y({}, Vo, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Af = vt(WS), GS = Y({}, wi, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: ol }), KS = vt(GS), YS = Y({}, wr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), QS = vt(YS), XS = Y({}, Vo, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), ZS = vt(XS), JS = [9, 13, 27, 32], sl = f && "CompositionEvent" in window, _i = null;
  f && "documentMode" in document && (_i = document.documentMode);
  var qS = f && "TextEvent" in window && !_i, Cf = f && (!sl || _i && 8 < _i && 11 >= _i), Pf = " ", Ef = !1;
  function Mf(t, r) {
    switch (t) {
      case "keyup":
        return JS.indexOf(r.keyCode) !== -1;
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
  function bf(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var xr = !1;
  function ew(t, r) {
    switch (t) {
      case "compositionend":
        return bf(r);
      case "keypress":
        return r.which !== 32 ? null : (Ef = !0, Pf);
      case "textInput":
        return t = r.data, t === Pf && Ef ? null : t;
      default:
        return null;
    }
  }
  function tw(t, r) {
    if (xr) return t === "compositionend" || !sl && Mf(t, r) ? (t = xf(), Oo = el = Sn = null, xr = !1, t) : null;
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
        return Cf && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var nw = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Rf(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r === "input" ? !!nw[t.type] : r === "textarea";
  }
  function Df(t, r, s, u) {
    Zd(u), r = Ho(r, "onChange"), 0 < r.length && (s = new tl("onChange", "change", null, s, u), t.push({ event: s, listeners: r }));
  }
  var Ti = null, ki = null;
  function rw(t) {
    Xf(t, 0);
  }
  function Bo(t) {
    var r = Cr(t);
    if (Vd(r)) return t;
  }
  function iw(t, r) {
    if (t === "change") return r;
  }
  var Nf = !1;
  if (f) {
    var al;
    if (f) {
      var ll = "oninput" in document;
      if (!ll) {
        var If = document.createElement("div");
        If.setAttribute("oninput", "return;"), ll = typeof If.oninput == "function";
      }
      al = ll;
    } else al = !1;
    Nf = al && (!document.documentMode || 9 < document.documentMode);
  }
  function Ff() {
    Ti && (Ti.detachEvent("onpropertychange", Of), ki = Ti = null);
  }
  function Of(t) {
    if (t.propertyName === "value" && Bo(ki)) {
      var r = [];
      Df(r, ki, t, za(t)), tf(rw, r);
    }
  }
  function ow(t, r, s) {
    t === "focusin" ? (Ff(), Ti = r, ki = s, Ti.attachEvent("onpropertychange", Of)) : t === "focusout" && Ff();
  }
  function sw(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown") return Bo(ki);
  }
  function aw(t, r) {
    if (t === "click") return Bo(r);
  }
  function lw(t, r) {
    if (t === "input" || t === "change") return Bo(r);
  }
  function uw(t, r) {
    return t === r && (t !== 0 || 1 / t === 1 / r) || t !== t && r !== r;
  }
  var Dt = typeof Object.is == "function" ? Object.is : uw;
  function Ai(t, r) {
    if (Dt(t, r)) return !0;
    if (typeof t != "object" || t === null || typeof r != "object" || r === null) return !1;
    var s = Object.keys(t), u = Object.keys(r);
    if (s.length !== u.length) return !1;
    for (u = 0; u < s.length; u++) {
      var p = s[u];
      if (!y.call(r, p) || !Dt(t[p], r[p])) return !1;
    }
    return !0;
  }
  function jf(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function Lf(t, r) {
    var s = jf(t);
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
      s = jf(s);
    }
  }
  function Vf(t, r) {
    return t && r ? t === r ? !0 : t && t.nodeType === 3 ? !1 : r && r.nodeType === 3 ? Vf(t, r.parentNode) : "contains" in t ? t.contains(r) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function Bf() {
    for (var t = window, r = To(); r instanceof t.HTMLIFrameElement; ) {
      try {
        var s = typeof r.contentWindow.location.href == "string";
      } catch {
        s = !1;
      }
      if (s) t = r.contentWindow;
      else break;
      r = To(t.document);
    }
    return r;
  }
  function ul(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r && (r === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || r === "textarea" || t.contentEditable === "true");
  }
  function cw(t) {
    var r = Bf(), s = t.focusedElem, u = t.selectionRange;
    if (r !== s && s && s.ownerDocument && Vf(s.ownerDocument.documentElement, s)) {
      if (u !== null && ul(s)) {
        if (r = u.start, t = u.end, t === void 0 && (t = r), "selectionStart" in s) s.selectionStart = r, s.selectionEnd = Math.min(t, s.value.length);
        else if (t = (r = s.ownerDocument || document) && r.defaultView || window, t.getSelection) {
          t = t.getSelection();
          var p = s.textContent.length, m = Math.min(u.start, p);
          u = u.end === void 0 ? m : Math.min(u.end, p), !t.extend && m > u && (p = u, u = m, m = p), p = Lf(s, m);
          var x = Lf(
            s,
            u
          );
          p && x && (t.rangeCount !== 1 || t.anchorNode !== p.node || t.anchorOffset !== p.offset || t.focusNode !== x.node || t.focusOffset !== x.offset) && (r = r.createRange(), r.setStart(p.node, p.offset), t.removeAllRanges(), m > u ? (t.addRange(r), t.extend(x.node, x.offset)) : (r.setEnd(x.node, x.offset), t.addRange(r)));
        }
      }
      for (r = [], t = s; t = t.parentNode; ) t.nodeType === 1 && r.push({ element: t, left: t.scrollLeft, top: t.scrollTop });
      for (typeof s.focus == "function" && s.focus(), s = 0; s < r.length; s++) t = r[s], t.element.scrollLeft = t.left, t.element.scrollTop = t.top;
    }
  }
  var dw = f && "documentMode" in document && 11 >= document.documentMode, _r = null, cl = null, Ci = null, dl = !1;
  function zf(t, r, s) {
    var u = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument;
    dl || _r == null || _r !== To(u) || (u = _r, "selectionStart" in u && ul(u) ? u = { start: u.selectionStart, end: u.selectionEnd } : (u = (u.ownerDocument && u.ownerDocument.defaultView || window).getSelection(), u = { anchorNode: u.anchorNode, anchorOffset: u.anchorOffset, focusNode: u.focusNode, focusOffset: u.focusOffset }), Ci && Ai(Ci, u) || (Ci = u, u = Ho(cl, "onSelect"), 0 < u.length && (r = new tl("onSelect", "select", null, r, s), t.push({ event: r, listeners: u }), r.target = _r)));
  }
  function zo(t, r) {
    var s = {};
    return s[t.toLowerCase()] = r.toLowerCase(), s["Webkit" + t] = "webkit" + r, s["Moz" + t] = "moz" + r, s;
  }
  var Tr = { animationend: zo("Animation", "AnimationEnd"), animationiteration: zo("Animation", "AnimationIteration"), animationstart: zo("Animation", "AnimationStart"), transitionend: zo("Transition", "TransitionEnd") }, fl = {}, Uf = {};
  f && (Uf = document.createElement("div").style, "AnimationEvent" in window || (delete Tr.animationend.animation, delete Tr.animationiteration.animation, delete Tr.animationstart.animation), "TransitionEvent" in window || delete Tr.transitionend.transition);
  function Uo(t) {
    if (fl[t]) return fl[t];
    if (!Tr[t]) return t;
    var r = Tr[t], s;
    for (s in r) if (r.hasOwnProperty(s) && s in Uf) return fl[t] = r[s];
    return t;
  }
  var $f = Uo("animationend"), Hf = Uo("animationiteration"), Wf = Uo("animationstart"), Gf = Uo("transitionend"), Kf = /* @__PURE__ */ new Map(), Yf = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function wn(t, r) {
    Kf.set(t, r), c(r, [t]);
  }
  for (var pl = 0; pl < Yf.length; pl++) {
    var hl = Yf[pl], fw = hl.toLowerCase(), pw = hl[0].toUpperCase() + hl.slice(1);
    wn(fw, "on" + pw);
  }
  wn($f, "onAnimationEnd"), wn(Hf, "onAnimationIteration"), wn(Wf, "onAnimationStart"), wn("dblclick", "onDoubleClick"), wn("focusin", "onFocus"), wn("focusout", "onBlur"), wn(Gf, "onTransitionEnd"), d("onMouseEnter", ["mouseout", "mouseover"]), d("onMouseLeave", ["mouseout", "mouseover"]), d("onPointerEnter", ["pointerout", "pointerover"]), d("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Pi = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), hw = new Set("cancel close invalid load scroll toggle".split(" ").concat(Pi));
  function Qf(t, r, s) {
    var u = t.type || "unknown-event";
    t.currentTarget = s, fS(u, r, void 0, t), t.currentTarget = null;
  }
  function Xf(t, r) {
    r = (r & 4) !== 0;
    for (var s = 0; s < t.length; s++) {
      var u = t[s], p = u.event;
      u = u.listeners;
      e: {
        var m = void 0;
        if (r) for (var x = u.length - 1; 0 <= x; x--) {
          var P = u[x], E = P.instance, O = P.currentTarget;
          if (P = P.listener, E !== m && p.isPropagationStopped()) break e;
          Qf(p, P, O), m = E;
        }
        else for (x = 0; x < u.length; x++) {
          if (P = u[x], E = P.instance, O = P.currentTarget, P = P.listener, E !== m && p.isPropagationStopped()) break e;
          Qf(p, P, O), m = E;
        }
      }
    }
    if (Co) throw t = Wa, Co = !1, Wa = null, t;
  }
  function Ee(t, r) {
    var s = r[_l];
    s === void 0 && (s = r[_l] = /* @__PURE__ */ new Set());
    var u = t + "__bubble";
    s.has(u) || (Zf(r, t, 2, !1), s.add(u));
  }
  function ml(t, r, s) {
    var u = 0;
    r && (u |= 4), Zf(s, t, u, r);
  }
  var $o = "_reactListening" + Math.random().toString(36).slice(2);
  function Ei(t) {
    if (!t[$o]) {
      t[$o] = !0, o.forEach(function(s) {
        s !== "selectionchange" && (hw.has(s) || ml(s, !1, t), ml(s, !0, t));
      });
      var r = t.nodeType === 9 ? t : t.ownerDocument;
      r === null || r[$o] || (r[$o] = !0, ml("selectionchange", !1, r));
    }
  }
  function Zf(t, r, s, u) {
    switch (wf(r)) {
      case 1:
        var p = ES;
        break;
      case 4:
        p = MS;
        break;
      default:
        p = Ja;
    }
    s = p.bind(null, r, s, t), p = void 0, !Ha || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (p = !0), u ? p !== void 0 ? t.addEventListener(r, s, { capture: !0, passive: p }) : t.addEventListener(r, s, !0) : p !== void 0 ? t.addEventListener(r, s, { passive: p }) : t.addEventListener(r, s, !1);
  }
  function yl(t, r, s, u, p) {
    var m = u;
    if ((r & 1) === 0 && (r & 2) === 0 && u !== null) e: for (; ; ) {
      if (u === null) return;
      var x = u.tag;
      if (x === 3 || x === 4) {
        var P = u.stateNode.containerInfo;
        if (P === p || P.nodeType === 8 && P.parentNode === p) break;
        if (x === 4) for (x = u.return; x !== null; ) {
          var E = x.tag;
          if ((E === 3 || E === 4) && (E = x.stateNode.containerInfo, E === p || E.nodeType === 8 && E.parentNode === p)) return;
          x = x.return;
        }
        for (; P !== null; ) {
          if (x = Wn(P), x === null) return;
          if (E = x.tag, E === 5 || E === 6) {
            u = m = x;
            continue e;
          }
          P = P.parentNode;
        }
      }
      u = u.return;
    }
    tf(function() {
      var O = m, B = za(s), U = [];
      e: {
        var V = Kf.get(t);
        if (V !== void 0) {
          var J = tl, ne = t;
          switch (t) {
            case "keypress":
              if (jo(s) === 0) break e;
            case "keydown":
            case "keyup":
              J = HS;
              break;
            case "focusin":
              ne = "focus", J = il;
              break;
            case "focusout":
              ne = "blur", J = il;
              break;
            case "beforeblur":
            case "afterblur":
              J = il;
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
              J = Tf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              J = DS;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              J = KS;
              break;
            case $f:
            case Hf:
            case Wf:
              J = FS;
              break;
            case Gf:
              J = QS;
              break;
            case "scroll":
              J = bS;
              break;
            case "wheel":
              J = ZS;
              break;
            case "copy":
            case "cut":
            case "paste":
              J = jS;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              J = Af;
          }
          var ie = (r & 4) !== 0, je = !ie && t === "scroll", I = ie ? V !== null ? V + "Capture" : null : V;
          ie = [];
          for (var b = O, F; b !== null; ) {
            F = b;
            var H = F.stateNode;
            if (F.tag === 5 && H !== null && (F = H, I !== null && (H = ci(b, I), H != null && ie.push(Mi(b, H, F)))), je) break;
            b = b.return;
          }
          0 < ie.length && (V = new J(V, ne, null, s, B), U.push({ event: V, listeners: ie }));
        }
      }
      if ((r & 7) === 0) {
        e: {
          if (V = t === "mouseover" || t === "pointerover", J = t === "mouseout" || t === "pointerout", V && s !== Ba && (ne = s.relatedTarget || s.fromElement) && (Wn(ne) || ne[nn])) break e;
          if ((J || V) && (V = B.window === B ? B : (V = B.ownerDocument) ? V.defaultView || V.parentWindow : window, J ? (ne = s.relatedTarget || s.toElement, J = O, ne = ne ? Wn(ne) : null, ne !== null && (je = Hn(ne), ne !== je || ne.tag !== 5 && ne.tag !== 6) && (ne = null)) : (J = null, ne = O), J !== ne)) {
            if (ie = Tf, H = "onMouseLeave", I = "onMouseEnter", b = "mouse", (t === "pointerout" || t === "pointerover") && (ie = Af, H = "onPointerLeave", I = "onPointerEnter", b = "pointer"), je = J == null ? V : Cr(J), F = ne == null ? V : Cr(ne), V = new ie(H, b + "leave", J, s, B), V.target = je, V.relatedTarget = F, H = null, Wn(B) === O && (ie = new ie(I, b + "enter", ne, s, B), ie.target = F, ie.relatedTarget = je, H = ie), je = H, J && ne) t: {
              for (ie = J, I = ne, b = 0, F = ie; F; F = kr(F)) b++;
              for (F = 0, H = I; H; H = kr(H)) F++;
              for (; 0 < b - F; ) ie = kr(ie), b--;
              for (; 0 < F - b; ) I = kr(I), F--;
              for (; b--; ) {
                if (ie === I || I !== null && ie === I.alternate) break t;
                ie = kr(ie), I = kr(I);
              }
              ie = null;
            }
            else ie = null;
            J !== null && Jf(U, V, J, ie, !1), ne !== null && je !== null && Jf(U, je, ne, ie, !0);
          }
        }
        e: {
          if (V = O ? Cr(O) : window, J = V.nodeName && V.nodeName.toLowerCase(), J === "select" || J === "input" && V.type === "file") var oe = iw;
          else if (Rf(V)) if (Nf) oe = lw;
          else {
            oe = sw;
            var se = ow;
          }
          else (J = V.nodeName) && J.toLowerCase() === "input" && (V.type === "checkbox" || V.type === "radio") && (oe = aw);
          if (oe && (oe = oe(t, O))) {
            Df(U, oe, s, B);
            break e;
          }
          se && se(t, V, O), t === "focusout" && (se = V._wrapperState) && se.controlled && V.type === "number" && Fa(V, "number", V.value);
        }
        switch (se = O ? Cr(O) : window, t) {
          case "focusin":
            (Rf(se) || se.contentEditable === "true") && (_r = se, cl = O, Ci = null);
            break;
          case "focusout":
            Ci = cl = _r = null;
            break;
          case "mousedown":
            dl = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            dl = !1, zf(U, s, B);
            break;
          case "selectionchange":
            if (dw) break;
          case "keydown":
          case "keyup":
            zf(U, s, B);
        }
        var ae;
        if (sl) e: {
          switch (t) {
            case "compositionstart":
              var ue = "onCompositionStart";
              break e;
            case "compositionend":
              ue = "onCompositionEnd";
              break e;
            case "compositionupdate":
              ue = "onCompositionUpdate";
              break e;
          }
          ue = void 0;
        }
        else xr ? Mf(t, s) && (ue = "onCompositionEnd") : t === "keydown" && s.keyCode === 229 && (ue = "onCompositionStart");
        ue && (Cf && s.locale !== "ko" && (xr || ue !== "onCompositionStart" ? ue === "onCompositionEnd" && xr && (ae = xf()) : (Sn = B, el = "value" in Sn ? Sn.value : Sn.textContent, xr = !0)), se = Ho(O, ue), 0 < se.length && (ue = new kf(ue, t, null, s, B), U.push({ event: ue, listeners: se }), ae ? ue.data = ae : (ae = bf(s), ae !== null && (ue.data = ae)))), (ae = qS ? ew(t, s) : tw(t, s)) && (O = Ho(O, "onBeforeInput"), 0 < O.length && (B = new kf("onBeforeInput", "beforeinput", null, s, B), U.push({ event: B, listeners: O }), B.data = ae));
      }
      Xf(U, r);
    });
  }
  function Mi(t, r, s) {
    return { instance: t, listener: r, currentTarget: s };
  }
  function Ho(t, r) {
    for (var s = r + "Capture", u = []; t !== null; ) {
      var p = t, m = p.stateNode;
      p.tag === 5 && m !== null && (p = m, m = ci(t, s), m != null && u.unshift(Mi(t, m, p)), m = ci(t, r), m != null && u.push(Mi(t, m, p))), t = t.return;
    }
    return u;
  }
  function kr(t) {
    if (t === null) return null;
    do
      t = t.return;
    while (t && t.tag !== 5);
    return t || null;
  }
  function Jf(t, r, s, u, p) {
    for (var m = r._reactName, x = []; s !== null && s !== u; ) {
      var P = s, E = P.alternate, O = P.stateNode;
      if (E !== null && E === u) break;
      P.tag === 5 && O !== null && (P = O, p ? (E = ci(s, m), E != null && x.unshift(Mi(s, E, P))) : p || (E = ci(s, m), E != null && x.push(Mi(s, E, P)))), s = s.return;
    }
    x.length !== 0 && t.push({ event: r, listeners: x });
  }
  var mw = /\r\n?/g, yw = /\u0000|\uFFFD/g;
  function qf(t) {
    return (typeof t == "string" ? t : "" + t).replace(mw, `
`).replace(yw, "");
  }
  function Wo(t, r, s) {
    if (r = qf(r), qf(t) !== r && s) throw Error(i(425));
  }
  function Go() {
  }
  var gl = null, vl = null;
  function Sl(t, r) {
    return t === "textarea" || t === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var wl = typeof setTimeout == "function" ? setTimeout : void 0, gw = typeof clearTimeout == "function" ? clearTimeout : void 0, ep = typeof Promise == "function" ? Promise : void 0, vw = typeof queueMicrotask == "function" ? queueMicrotask : typeof ep < "u" ? function(t) {
    return ep.resolve(null).then(t).catch(Sw);
  } : wl;
  function Sw(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function xl(t, r) {
    var s = r, u = 0;
    do {
      var p = s.nextSibling;
      if (t.removeChild(s), p && p.nodeType === 8) if (s = p.data, s === "/$") {
        if (u === 0) {
          t.removeChild(p), Si(r);
          return;
        }
        u--;
      } else s !== "$" && s !== "$?" && s !== "$!" || u++;
      s = p;
    } while (s);
    Si(r);
  }
  function xn(t) {
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
  function tp(t) {
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
  var Ar = Math.random().toString(36).slice(2), Wt = "__reactFiber$" + Ar, bi = "__reactProps$" + Ar, nn = "__reactContainer$" + Ar, _l = "__reactEvents$" + Ar, ww = "__reactListeners$" + Ar, xw = "__reactHandles$" + Ar;
  function Wn(t) {
    var r = t[Wt];
    if (r) return r;
    for (var s = t.parentNode; s; ) {
      if (r = s[nn] || s[Wt]) {
        if (s = r.alternate, r.child !== null || s !== null && s.child !== null) for (t = tp(t); t !== null; ) {
          if (s = t[Wt]) return s;
          t = tp(t);
        }
        return r;
      }
      t = s, s = t.parentNode;
    }
    return null;
  }
  function Ri(t) {
    return t = t[Wt] || t[nn], !t || t.tag !== 5 && t.tag !== 6 && t.tag !== 13 && t.tag !== 3 ? null : t;
  }
  function Cr(t) {
    if (t.tag === 5 || t.tag === 6) return t.stateNode;
    throw Error(i(33));
  }
  function Ko(t) {
    return t[bi] || null;
  }
  var Tl = [], Pr = -1;
  function _n(t) {
    return { current: t };
  }
  function Me(t) {
    0 > Pr || (t.current = Tl[Pr], Tl[Pr] = null, Pr--);
  }
  function Pe(t, r) {
    Pr++, Tl[Pr] = t.current, t.current = r;
  }
  var Tn = {}, Ze = _n(Tn), at = _n(!1), Gn = Tn;
  function Er(t, r) {
    var s = t.type.contextTypes;
    if (!s) return Tn;
    var u = t.stateNode;
    if (u && u.__reactInternalMemoizedUnmaskedChildContext === r) return u.__reactInternalMemoizedMaskedChildContext;
    var p = {}, m;
    for (m in s) p[m] = r[m];
    return u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = r, t.__reactInternalMemoizedMaskedChildContext = p), p;
  }
  function lt(t) {
    return t = t.childContextTypes, t != null;
  }
  function Yo() {
    Me(at), Me(Ze);
  }
  function np(t, r, s) {
    if (Ze.current !== Tn) throw Error(i(168));
    Pe(Ze, r), Pe(at, s);
  }
  function rp(t, r, s) {
    var u = t.stateNode;
    if (r = r.childContextTypes, typeof u.getChildContext != "function") return s;
    u = u.getChildContext();
    for (var p in u) if (!(p in r)) throw Error(i(108, Ce(t) || "Unknown", p));
    return Y({}, s, u);
  }
  function Qo(t) {
    return t = (t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext || Tn, Gn = Ze.current, Pe(Ze, t), Pe(at, at.current), !0;
  }
  function ip(t, r, s) {
    var u = t.stateNode;
    if (!u) throw Error(i(169));
    s ? (t = rp(t, r, Gn), u.__reactInternalMemoizedMergedChildContext = t, Me(at), Me(Ze), Pe(Ze, t)) : Me(at), Pe(at, s);
  }
  var rn = null, Xo = !1, kl = !1;
  function op(t) {
    rn === null ? rn = [t] : rn.push(t);
  }
  function _w(t) {
    Xo = !0, op(t);
  }
  function kn() {
    if (!kl && rn !== null) {
      kl = !0;
      var t = 0, r = _e;
      try {
        var s = rn;
        for (_e = 1; t < s.length; t++) {
          var u = s[t];
          do
            u = u(!0);
          while (u !== null);
        }
        rn = null, Xo = !1;
      } catch (p) {
        throw rn !== null && (rn = rn.slice(t + 1)), af(Ga, kn), p;
      } finally {
        _e = r, kl = !1;
      }
    }
    return null;
  }
  var Mr = [], br = 0, Zo = null, Jo = 0, _t = [], Tt = 0, Kn = null, on = 1, sn = "";
  function Yn(t, r) {
    Mr[br++] = Jo, Mr[br++] = Zo, Zo = t, Jo = r;
  }
  function sp(t, r, s) {
    _t[Tt++] = on, _t[Tt++] = sn, _t[Tt++] = Kn, Kn = t;
    var u = on;
    t = sn;
    var p = 32 - Rt(u) - 1;
    u &= ~(1 << p), s += 1;
    var m = 32 - Rt(r) + p;
    if (30 < m) {
      var x = p - p % 5;
      m = (u & (1 << x) - 1).toString(32), u >>= x, p -= x, on = 1 << 32 - Rt(r) + p | s << p | u, sn = m + t;
    } else on = 1 << m | s << p | u, sn = t;
  }
  function Al(t) {
    t.return !== null && (Yn(t, 1), sp(t, 1, 0));
  }
  function Cl(t) {
    for (; t === Zo; ) Zo = Mr[--br], Mr[br] = null, Jo = Mr[--br], Mr[br] = null;
    for (; t === Kn; ) Kn = _t[--Tt], _t[Tt] = null, sn = _t[--Tt], _t[Tt] = null, on = _t[--Tt], _t[Tt] = null;
  }
  var St = null, wt = null, Re = !1, Nt = null;
  function ap(t, r) {
    var s = Pt(5, null, null, 0);
    s.elementType = "DELETED", s.stateNode = r, s.return = t, r = t.deletions, r === null ? (t.deletions = [s], t.flags |= 16) : r.push(s);
  }
  function lp(t, r) {
    switch (t.tag) {
      case 5:
        var s = t.type;
        return r = r.nodeType !== 1 || s.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (t.stateNode = r, St = t, wt = xn(r.firstChild), !0) : !1;
      case 6:
        return r = t.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (t.stateNode = r, St = t, wt = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (s = Kn !== null ? { id: on, overflow: sn } : null, t.memoizedState = { dehydrated: r, treeContext: s, retryLane: 1073741824 }, s = Pt(18, null, null, 0), s.stateNode = r, s.return = t, t.child = s, St = t, wt = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Pl(t) {
    return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
  }
  function El(t) {
    if (Re) {
      var r = wt;
      if (r) {
        var s = r;
        if (!lp(t, r)) {
          if (Pl(t)) throw Error(i(418));
          r = xn(s.nextSibling);
          var u = St;
          r && lp(t, r) ? ap(u, s) : (t.flags = t.flags & -4097 | 2, Re = !1, St = t);
        }
      } else {
        if (Pl(t)) throw Error(i(418));
        t.flags = t.flags & -4097 | 2, Re = !1, St = t;
      }
    }
  }
  function up(t) {
    for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; ) t = t.return;
    St = t;
  }
  function qo(t) {
    if (t !== St) return !1;
    if (!Re) return up(t), Re = !0, !1;
    var r;
    if ((r = t.tag !== 3) && !(r = t.tag !== 5) && (r = t.type, r = r !== "head" && r !== "body" && !Sl(t.type, t.memoizedProps)), r && (r = wt)) {
      if (Pl(t)) throw cp(), Error(i(418));
      for (; r; ) ap(t, r), r = xn(r.nextSibling);
    }
    if (up(t), t.tag === 13) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(i(317));
      e: {
        for (t = t.nextSibling, r = 0; t; ) {
          if (t.nodeType === 8) {
            var s = t.data;
            if (s === "/$") {
              if (r === 0) {
                wt = xn(t.nextSibling);
                break e;
              }
              r--;
            } else s !== "$" && s !== "$!" && s !== "$?" || r++;
          }
          t = t.nextSibling;
        }
        wt = null;
      }
    } else wt = St ? xn(t.stateNode.nextSibling) : null;
    return !0;
  }
  function cp() {
    for (var t = wt; t; ) t = xn(t.nextSibling);
  }
  function Rr() {
    wt = St = null, Re = !1;
  }
  function Ml(t) {
    Nt === null ? Nt = [t] : Nt.push(t);
  }
  var Tw = D.ReactCurrentBatchConfig;
  function Di(t, r, s) {
    if (t = s.ref, t !== null && typeof t != "function" && typeof t != "object") {
      if (s._owner) {
        if (s = s._owner, s) {
          if (s.tag !== 1) throw Error(i(309));
          var u = s.stateNode;
        }
        if (!u) throw Error(i(147, t));
        var p = u, m = "" + t;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === m ? r.ref : (r = function(x) {
          var P = p.refs;
          x === null ? delete P[m] : P[m] = x;
        }, r._stringRef = m, r);
      }
      if (typeof t != "string") throw Error(i(284));
      if (!s._owner) throw Error(i(290, t));
    }
    return t;
  }
  function es(t, r) {
    throw t = Object.prototype.toString.call(r), Error(i(31, t === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : t));
  }
  function dp(t) {
    var r = t._init;
    return r(t._payload);
  }
  function fp(t) {
    function r(I, b) {
      if (t) {
        var F = I.deletions;
        F === null ? (I.deletions = [b], I.flags |= 16) : F.push(b);
      }
    }
    function s(I, b) {
      if (!t) return null;
      for (; b !== null; ) r(I, b), b = b.sibling;
      return null;
    }
    function u(I, b) {
      for (I = /* @__PURE__ */ new Map(); b !== null; ) b.key !== null ? I.set(b.key, b) : I.set(b.index, b), b = b.sibling;
      return I;
    }
    function p(I, b) {
      return I = Dn(I, b), I.index = 0, I.sibling = null, I;
    }
    function m(I, b, F) {
      return I.index = F, t ? (F = I.alternate, F !== null ? (F = F.index, F < b ? (I.flags |= 2, b) : F) : (I.flags |= 2, b)) : (I.flags |= 1048576, b);
    }
    function x(I) {
      return t && I.alternate === null && (I.flags |= 2), I;
    }
    function P(I, b, F, H) {
      return b === null || b.tag !== 6 ? (b = wu(F, I.mode, H), b.return = I, b) : (b = p(b, F), b.return = I, b);
    }
    function E(I, b, F, H) {
      var oe = F.type;
      return oe === K ? B(I, b, F.props.children, H, F.key) : b !== null && (b.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ce && dp(oe) === b.type) ? (H = p(b, F.props), H.ref = Di(I, b, F), H.return = I, H) : (H = ks(F.type, F.key, F.props, null, I.mode, H), H.ref = Di(I, b, F), H.return = I, H);
    }
    function O(I, b, F, H) {
      return b === null || b.tag !== 4 || b.stateNode.containerInfo !== F.containerInfo || b.stateNode.implementation !== F.implementation ? (b = xu(F, I.mode, H), b.return = I, b) : (b = p(b, F.children || []), b.return = I, b);
    }
    function B(I, b, F, H, oe) {
      return b === null || b.tag !== 7 ? (b = nr(F, I.mode, H, oe), b.return = I, b) : (b = p(b, F), b.return = I, b);
    }
    function U(I, b, F) {
      if (typeof b == "string" && b !== "" || typeof b == "number") return b = wu("" + b, I.mode, F), b.return = I, b;
      if (typeof b == "object" && b !== null) {
        switch (b.$$typeof) {
          case j:
            return F = ks(b.type, b.key, b.props, null, I.mode, F), F.ref = Di(I, null, b), F.return = I, F;
          case G:
            return b = xu(b, I.mode, F), b.return = I, b;
          case ce:
            var H = b._init;
            return U(I, H(b._payload), F);
        }
        if (ai(b) || ee(b)) return b = nr(b, I.mode, F, null), b.return = I, b;
        es(I, b);
      }
      return null;
    }
    function V(I, b, F, H) {
      var oe = b !== null ? b.key : null;
      if (typeof F == "string" && F !== "" || typeof F == "number") return oe !== null ? null : P(I, b, "" + F, H);
      if (typeof F == "object" && F !== null) {
        switch (F.$$typeof) {
          case j:
            return F.key === oe ? E(I, b, F, H) : null;
          case G:
            return F.key === oe ? O(I, b, F, H) : null;
          case ce:
            return oe = F._init, V(
              I,
              b,
              oe(F._payload),
              H
            );
        }
        if (ai(F) || ee(F)) return oe !== null ? null : B(I, b, F, H, null);
        es(I, F);
      }
      return null;
    }
    function J(I, b, F, H, oe) {
      if (typeof H == "string" && H !== "" || typeof H == "number") return I = I.get(F) || null, P(b, I, "" + H, oe);
      if (typeof H == "object" && H !== null) {
        switch (H.$$typeof) {
          case j:
            return I = I.get(H.key === null ? F : H.key) || null, E(b, I, H, oe);
          case G:
            return I = I.get(H.key === null ? F : H.key) || null, O(b, I, H, oe);
          case ce:
            var se = H._init;
            return J(I, b, F, se(H._payload), oe);
        }
        if (ai(H) || ee(H)) return I = I.get(F) || null, B(b, I, H, oe, null);
        es(b, H);
      }
      return null;
    }
    function ne(I, b, F, H) {
      for (var oe = null, se = null, ae = b, ue = b = 0, We = null; ae !== null && ue < F.length; ue++) {
        ae.index > ue ? (We = ae, ae = null) : We = ae.sibling;
        var Se = V(I, ae, F[ue], H);
        if (Se === null) {
          ae === null && (ae = We);
          break;
        }
        t && ae && Se.alternate === null && r(I, ae), b = m(Se, b, ue), se === null ? oe = Se : se.sibling = Se, se = Se, ae = We;
      }
      if (ue === F.length) return s(I, ae), Re && Yn(I, ue), oe;
      if (ae === null) {
        for (; ue < F.length; ue++) ae = U(I, F[ue], H), ae !== null && (b = m(ae, b, ue), se === null ? oe = ae : se.sibling = ae, se = ae);
        return Re && Yn(I, ue), oe;
      }
      for (ae = u(I, ae); ue < F.length; ue++) We = J(ae, I, ue, F[ue], H), We !== null && (t && We.alternate !== null && ae.delete(We.key === null ? ue : We.key), b = m(We, b, ue), se === null ? oe = We : se.sibling = We, se = We);
      return t && ae.forEach(function(Nn) {
        return r(I, Nn);
      }), Re && Yn(I, ue), oe;
    }
    function ie(I, b, F, H) {
      var oe = ee(F);
      if (typeof oe != "function") throw Error(i(150));
      if (F = oe.call(F), F == null) throw Error(i(151));
      for (var se = oe = null, ae = b, ue = b = 0, We = null, Se = F.next(); ae !== null && !Se.done; ue++, Se = F.next()) {
        ae.index > ue ? (We = ae, ae = null) : We = ae.sibling;
        var Nn = V(I, ae, Se.value, H);
        if (Nn === null) {
          ae === null && (ae = We);
          break;
        }
        t && ae && Nn.alternate === null && r(I, ae), b = m(Nn, b, ue), se === null ? oe = Nn : se.sibling = Nn, se = Nn, ae = We;
      }
      if (Se.done) return s(
        I,
        ae
      ), Re && Yn(I, ue), oe;
      if (ae === null) {
        for (; !Se.done; ue++, Se = F.next()) Se = U(I, Se.value, H), Se !== null && (b = m(Se, b, ue), se === null ? oe = Se : se.sibling = Se, se = Se);
        return Re && Yn(I, ue), oe;
      }
      for (ae = u(I, ae); !Se.done; ue++, Se = F.next()) Se = J(ae, I, ue, Se.value, H), Se !== null && (t && Se.alternate !== null && ae.delete(Se.key === null ? ue : Se.key), b = m(Se, b, ue), se === null ? oe = Se : se.sibling = Se, se = Se);
      return t && ae.forEach(function(nx) {
        return r(I, nx);
      }), Re && Yn(I, ue), oe;
    }
    function je(I, b, F, H) {
      if (typeof F == "object" && F !== null && F.type === K && F.key === null && (F = F.props.children), typeof F == "object" && F !== null) {
        switch (F.$$typeof) {
          case j:
            e: {
              for (var oe = F.key, se = b; se !== null; ) {
                if (se.key === oe) {
                  if (oe = F.type, oe === K) {
                    if (se.tag === 7) {
                      s(I, se.sibling), b = p(se, F.props.children), b.return = I, I = b;
                      break e;
                    }
                  } else if (se.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ce && dp(oe) === se.type) {
                    s(I, se.sibling), b = p(se, F.props), b.ref = Di(I, se, F), b.return = I, I = b;
                    break e;
                  }
                  s(I, se);
                  break;
                } else r(I, se);
                se = se.sibling;
              }
              F.type === K ? (b = nr(F.props.children, I.mode, H, F.key), b.return = I, I = b) : (H = ks(F.type, F.key, F.props, null, I.mode, H), H.ref = Di(I, b, F), H.return = I, I = H);
            }
            return x(I);
          case G:
            e: {
              for (se = F.key; b !== null; ) {
                if (b.key === se) if (b.tag === 4 && b.stateNode.containerInfo === F.containerInfo && b.stateNode.implementation === F.implementation) {
                  s(I, b.sibling), b = p(b, F.children || []), b.return = I, I = b;
                  break e;
                } else {
                  s(I, b);
                  break;
                }
                else r(I, b);
                b = b.sibling;
              }
              b = xu(F, I.mode, H), b.return = I, I = b;
            }
            return x(I);
          case ce:
            return se = F._init, je(I, b, se(F._payload), H);
        }
        if (ai(F)) return ne(I, b, F, H);
        if (ee(F)) return ie(I, b, F, H);
        es(I, F);
      }
      return typeof F == "string" && F !== "" || typeof F == "number" ? (F = "" + F, b !== null && b.tag === 6 ? (s(I, b.sibling), b = p(b, F), b.return = I, I = b) : (s(I, b), b = wu(F, I.mode, H), b.return = I, I = b), x(I)) : s(I, b);
    }
    return je;
  }
  var Dr = fp(!0), pp = fp(!1), ts = _n(null), ns = null, Nr = null, bl = null;
  function Rl() {
    bl = Nr = ns = null;
  }
  function Dl(t) {
    var r = ts.current;
    Me(ts), t._currentValue = r;
  }
  function Nl(t, r, s) {
    for (; t !== null; ) {
      var u = t.alternate;
      if ((t.childLanes & r) !== r ? (t.childLanes |= r, u !== null && (u.childLanes |= r)) : u !== null && (u.childLanes & r) !== r && (u.childLanes |= r), t === s) break;
      t = t.return;
    }
  }
  function Ir(t, r) {
    ns = t, bl = Nr = null, t = t.dependencies, t !== null && t.firstContext !== null && ((t.lanes & r) !== 0 && (ut = !0), t.firstContext = null);
  }
  function kt(t) {
    var r = t._currentValue;
    if (bl !== t) if (t = { context: t, memoizedValue: r, next: null }, Nr === null) {
      if (ns === null) throw Error(i(308));
      Nr = t, ns.dependencies = { lanes: 0, firstContext: t };
    } else Nr = Nr.next = t;
    return r;
  }
  var Qn = null;
  function Il(t) {
    Qn === null ? Qn = [t] : Qn.push(t);
  }
  function hp(t, r, s, u) {
    var p = r.interleaved;
    return p === null ? (s.next = s, Il(r)) : (s.next = p.next, p.next = s), r.interleaved = s, an(t, u);
  }
  function an(t, r) {
    t.lanes |= r;
    var s = t.alternate;
    for (s !== null && (s.lanes |= r), s = t, t = t.return; t !== null; ) t.childLanes |= r, s = t.alternate, s !== null && (s.childLanes |= r), s = t, t = t.return;
    return s.tag === 3 ? s.stateNode : null;
  }
  var An = !1;
  function Fl(t) {
    t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function mp(t, r) {
    t = t.updateQueue, r.updateQueue === t && (r.updateQueue = { baseState: t.baseState, firstBaseUpdate: t.firstBaseUpdate, lastBaseUpdate: t.lastBaseUpdate, shared: t.shared, effects: t.effects });
  }
  function ln(t, r) {
    return { eventTime: t, lane: r, tag: 0, payload: null, callback: null, next: null };
  }
  function Cn(t, r, s) {
    var u = t.updateQueue;
    if (u === null) return null;
    if (u = u.shared, (ye & 2) !== 0) {
      var p = u.pending;
      return p === null ? r.next = r : (r.next = p.next, p.next = r), u.pending = r, an(t, s);
    }
    return p = u.interleaved, p === null ? (r.next = r, Il(u)) : (r.next = p.next, p.next = r), u.interleaved = r, an(t, s);
  }
  function rs(t, r, s) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (s & 4194240) !== 0)) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, Qa(t, s);
    }
  }
  function yp(t, r) {
    var s = t.updateQueue, u = t.alternate;
    if (u !== null && (u = u.updateQueue, s === u)) {
      var p = null, m = null;
      if (s = s.firstBaseUpdate, s !== null) {
        do {
          var x = { eventTime: s.eventTime, lane: s.lane, tag: s.tag, payload: s.payload, callback: s.callback, next: null };
          m === null ? p = m = x : m = m.next = x, s = s.next;
        } while (s !== null);
        m === null ? p = m = r : m = m.next = r;
      } else p = m = r;
      s = { baseState: u.baseState, firstBaseUpdate: p, lastBaseUpdate: m, shared: u.shared, effects: u.effects }, t.updateQueue = s;
      return;
    }
    t = s.lastBaseUpdate, t === null ? s.firstBaseUpdate = r : t.next = r, s.lastBaseUpdate = r;
  }
  function is(t, r, s, u) {
    var p = t.updateQueue;
    An = !1;
    var m = p.firstBaseUpdate, x = p.lastBaseUpdate, P = p.shared.pending;
    if (P !== null) {
      p.shared.pending = null;
      var E = P, O = E.next;
      E.next = null, x === null ? m = O : x.next = O, x = E;
      var B = t.alternate;
      B !== null && (B = B.updateQueue, P = B.lastBaseUpdate, P !== x && (P === null ? B.firstBaseUpdate = O : P.next = O, B.lastBaseUpdate = E));
    }
    if (m !== null) {
      var U = p.baseState;
      x = 0, B = O = E = null, P = m;
      do {
        var V = P.lane, J = P.eventTime;
        if ((u & V) === V) {
          B !== null && (B = B.next = {
            eventTime: J,
            lane: 0,
            tag: P.tag,
            payload: P.payload,
            callback: P.callback,
            next: null
          });
          e: {
            var ne = t, ie = P;
            switch (V = r, J = s, ie.tag) {
              case 1:
                if (ne = ie.payload, typeof ne == "function") {
                  U = ne.call(J, U, V);
                  break e;
                }
                U = ne;
                break e;
              case 3:
                ne.flags = ne.flags & -65537 | 128;
              case 0:
                if (ne = ie.payload, V = typeof ne == "function" ? ne.call(J, U, V) : ne, V == null) break e;
                U = Y({}, U, V);
                break e;
              case 2:
                An = !0;
            }
          }
          P.callback !== null && P.lane !== 0 && (t.flags |= 64, V = p.effects, V === null ? p.effects = [P] : V.push(P));
        } else J = { eventTime: J, lane: V, tag: P.tag, payload: P.payload, callback: P.callback, next: null }, B === null ? (O = B = J, E = U) : B = B.next = J, x |= V;
        if (P = P.next, P === null) {
          if (P = p.shared.pending, P === null) break;
          V = P, P = V.next, V.next = null, p.lastBaseUpdate = V, p.shared.pending = null;
        }
      } while (!0);
      if (B === null && (E = U), p.baseState = E, p.firstBaseUpdate = O, p.lastBaseUpdate = B, r = p.shared.interleaved, r !== null) {
        p = r;
        do
          x |= p.lane, p = p.next;
        while (p !== r);
      } else m === null && (p.shared.lanes = 0);
      Jn |= x, t.lanes = x, t.memoizedState = U;
    }
  }
  function gp(t, r, s) {
    if (t = r.effects, r.effects = null, t !== null) for (r = 0; r < t.length; r++) {
      var u = t[r], p = u.callback;
      if (p !== null) {
        if (u.callback = null, u = s, typeof p != "function") throw Error(i(191, p));
        p.call(u);
      }
    }
  }
  var Ni = {}, Gt = _n(Ni), Ii = _n(Ni), Fi = _n(Ni);
  function Xn(t) {
    if (t === Ni) throw Error(i(174));
    return t;
  }
  function Ol(t, r) {
    switch (Pe(Fi, r), Pe(Ii, t), Pe(Gt, Ni), t = r.nodeType, t) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : ja(null, "");
        break;
      default:
        t = t === 8 ? r.parentNode : r, r = t.namespaceURI || null, t = t.tagName, r = ja(r, t);
    }
    Me(Gt), Pe(Gt, r);
  }
  function Fr() {
    Me(Gt), Me(Ii), Me(Fi);
  }
  function vp(t) {
    Xn(Fi.current);
    var r = Xn(Gt.current), s = ja(r, t.type);
    r !== s && (Pe(Ii, t), Pe(Gt, s));
  }
  function jl(t) {
    Ii.current === t && (Me(Gt), Me(Ii));
  }
  var De = _n(0);
  function os(t) {
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
  var Ll = [];
  function Vl() {
    for (var t = 0; t < Ll.length; t++) Ll[t]._workInProgressVersionPrimary = null;
    Ll.length = 0;
  }
  var ss = D.ReactCurrentDispatcher, Bl = D.ReactCurrentBatchConfig, Zn = 0, Ne = null, Be = null, $e = null, as = !1, Oi = !1, ji = 0, kw = 0;
  function Je() {
    throw Error(i(321));
  }
  function zl(t, r) {
    if (r === null) return !1;
    for (var s = 0; s < r.length && s < t.length; s++) if (!Dt(t[s], r[s])) return !1;
    return !0;
  }
  function Ul(t, r, s, u, p, m) {
    if (Zn = m, Ne = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, ss.current = t === null || t.memoizedState === null ? Ew : Mw, t = s(u, p), Oi) {
      m = 0;
      do {
        if (Oi = !1, ji = 0, 25 <= m) throw Error(i(301));
        m += 1, $e = Be = null, r.updateQueue = null, ss.current = bw, t = s(u, p);
      } while (Oi);
    }
    if (ss.current = cs, r = Be !== null && Be.next !== null, Zn = 0, $e = Be = Ne = null, as = !1, r) throw Error(i(300));
    return t;
  }
  function $l() {
    var t = ji !== 0;
    return ji = 0, t;
  }
  function Kt() {
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
      if (t === null) throw Error(i(310));
      Be = t, t = { memoizedState: Be.memoizedState, baseState: Be.baseState, baseQueue: Be.baseQueue, queue: Be.queue, next: null }, $e === null ? Ne.memoizedState = $e = t : $e = $e.next = t;
    }
    return $e;
  }
  function Li(t, r) {
    return typeof r == "function" ? r(t) : r;
  }
  function Hl(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(i(311));
    s.lastRenderedReducer = t;
    var u = Be, p = u.baseQueue, m = s.pending;
    if (m !== null) {
      if (p !== null) {
        var x = p.next;
        p.next = m.next, m.next = x;
      }
      u.baseQueue = p = m, s.pending = null;
    }
    if (p !== null) {
      m = p.next, u = u.baseState;
      var P = x = null, E = null, O = m;
      do {
        var B = O.lane;
        if ((Zn & B) === B) E !== null && (E = E.next = { lane: 0, action: O.action, hasEagerState: O.hasEagerState, eagerState: O.eagerState, next: null }), u = O.hasEagerState ? O.eagerState : t(u, O.action);
        else {
          var U = {
            lane: B,
            action: O.action,
            hasEagerState: O.hasEagerState,
            eagerState: O.eagerState,
            next: null
          };
          E === null ? (P = E = U, x = u) : E = E.next = U, Ne.lanes |= B, Jn |= B;
        }
        O = O.next;
      } while (O !== null && O !== m);
      E === null ? x = u : E.next = P, Dt(u, r.memoizedState) || (ut = !0), r.memoizedState = u, r.baseState = x, r.baseQueue = E, s.lastRenderedState = u;
    }
    if (t = s.interleaved, t !== null) {
      p = t;
      do
        m = p.lane, Ne.lanes |= m, Jn |= m, p = p.next;
      while (p !== t);
    } else p === null && (s.lanes = 0);
    return [r.memoizedState, s.dispatch];
  }
  function Wl(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(i(311));
    s.lastRenderedReducer = t;
    var u = s.dispatch, p = s.pending, m = r.memoizedState;
    if (p !== null) {
      s.pending = null;
      var x = p = p.next;
      do
        m = t(m, x.action), x = x.next;
      while (x !== p);
      Dt(m, r.memoizedState) || (ut = !0), r.memoizedState = m, r.baseQueue === null && (r.baseState = m), s.lastRenderedState = m;
    }
    return [m, u];
  }
  function Sp() {
  }
  function wp(t, r) {
    var s = Ne, u = At(), p = r(), m = !Dt(u.memoizedState, p);
    if (m && (u.memoizedState = p, ut = !0), u = u.queue, Gl(Tp.bind(null, s, u, t), [t]), u.getSnapshot !== r || m || $e !== null && $e.memoizedState.tag & 1) {
      if (s.flags |= 2048, Vi(9, _p.bind(null, s, u, p, r), void 0, null), He === null) throw Error(i(349));
      (Zn & 30) !== 0 || xp(s, r, p);
    }
    return p;
  }
  function xp(t, r, s) {
    t.flags |= 16384, t = { getSnapshot: r, value: s }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.stores = [t]) : (s = r.stores, s === null ? r.stores = [t] : s.push(t));
  }
  function _p(t, r, s, u) {
    r.value = s, r.getSnapshot = u, kp(r) && Ap(t);
  }
  function Tp(t, r, s) {
    return s(function() {
      kp(r) && Ap(t);
    });
  }
  function kp(t) {
    var r = t.getSnapshot;
    t = t.value;
    try {
      var s = r();
      return !Dt(t, s);
    } catch {
      return !0;
    }
  }
  function Ap(t) {
    var r = an(t, 1);
    r !== null && jt(r, t, 1, -1);
  }
  function Cp(t) {
    var r = Kt();
    return typeof t == "function" && (t = t()), r.memoizedState = r.baseState = t, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Li, lastRenderedState: t }, r.queue = t, t = t.dispatch = Pw.bind(null, Ne, t), [r.memoizedState, t];
  }
  function Vi(t, r, s, u) {
    return t = { tag: t, create: r, destroy: s, deps: u, next: null }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.lastEffect = t.next = t) : (s = r.lastEffect, s === null ? r.lastEffect = t.next = t : (u = s.next, s.next = t, t.next = u, r.lastEffect = t)), t;
  }
  function Pp() {
    return At().memoizedState;
  }
  function ls(t, r, s, u) {
    var p = Kt();
    Ne.flags |= t, p.memoizedState = Vi(1 | r, s, void 0, u === void 0 ? null : u);
  }
  function us(t, r, s, u) {
    var p = At();
    u = u === void 0 ? null : u;
    var m = void 0;
    if (Be !== null) {
      var x = Be.memoizedState;
      if (m = x.destroy, u !== null && zl(u, x.deps)) {
        p.memoizedState = Vi(r, s, m, u);
        return;
      }
    }
    Ne.flags |= t, p.memoizedState = Vi(1 | r, s, m, u);
  }
  function Ep(t, r) {
    return ls(8390656, 8, t, r);
  }
  function Gl(t, r) {
    return us(2048, 8, t, r);
  }
  function Mp(t, r) {
    return us(4, 2, t, r);
  }
  function bp(t, r) {
    return us(4, 4, t, r);
  }
  function Rp(t, r) {
    if (typeof r == "function") return t = t(), r(t), function() {
      r(null);
    };
    if (r != null) return t = t(), r.current = t, function() {
      r.current = null;
    };
  }
  function Dp(t, r, s) {
    return s = s != null ? s.concat([t]) : null, us(4, 4, Rp.bind(null, r, t), s);
  }
  function Kl() {
  }
  function Np(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && zl(r, u[1]) ? u[0] : (s.memoizedState = [t, r], t);
  }
  function Ip(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && zl(r, u[1]) ? u[0] : (t = t(), s.memoizedState = [t, r], t);
  }
  function Fp(t, r, s) {
    return (Zn & 21) === 0 ? (t.baseState && (t.baseState = !1, ut = !0), t.memoizedState = s) : (Dt(s, r) || (s = df(), Ne.lanes |= s, Jn |= s, t.baseState = !0), r);
  }
  function Aw(t, r) {
    var s = _e;
    _e = s !== 0 && 4 > s ? s : 4, t(!0);
    var u = Bl.transition;
    Bl.transition = {};
    try {
      t(!1), r();
    } finally {
      _e = s, Bl.transition = u;
    }
  }
  function Op() {
    return At().memoizedState;
  }
  function Cw(t, r, s) {
    var u = bn(t);
    if (s = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null }, jp(t)) Lp(r, s);
    else if (s = hp(t, r, s, u), s !== null) {
      var p = rt();
      jt(s, t, u, p), Vp(s, r, u);
    }
  }
  function Pw(t, r, s) {
    var u = bn(t), p = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null };
    if (jp(t)) Lp(r, p);
    else {
      var m = t.alternate;
      if (t.lanes === 0 && (m === null || m.lanes === 0) && (m = r.lastRenderedReducer, m !== null)) try {
        var x = r.lastRenderedState, P = m(x, s);
        if (p.hasEagerState = !0, p.eagerState = P, Dt(P, x)) {
          var E = r.interleaved;
          E === null ? (p.next = p, Il(r)) : (p.next = E.next, E.next = p), r.interleaved = p;
          return;
        }
      } catch {
      } finally {
      }
      s = hp(t, r, p, u), s !== null && (p = rt(), jt(s, t, u, p), Vp(s, r, u));
    }
  }
  function jp(t) {
    var r = t.alternate;
    return t === Ne || r !== null && r === Ne;
  }
  function Lp(t, r) {
    Oi = as = !0;
    var s = t.pending;
    s === null ? r.next = r : (r.next = s.next, s.next = r), t.pending = r;
  }
  function Vp(t, r, s) {
    if ((s & 4194240) !== 0) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, Qa(t, s);
    }
  }
  var cs = { readContext: kt, useCallback: Je, useContext: Je, useEffect: Je, useImperativeHandle: Je, useInsertionEffect: Je, useLayoutEffect: Je, useMemo: Je, useReducer: Je, useRef: Je, useState: Je, useDebugValue: Je, useDeferredValue: Je, useTransition: Je, useMutableSource: Je, useSyncExternalStore: Je, useId: Je, unstable_isNewReconciler: !1 }, Ew = { readContext: kt, useCallback: function(t, r) {
    return Kt().memoizedState = [t, r === void 0 ? null : r], t;
  }, useContext: kt, useEffect: Ep, useImperativeHandle: function(t, r, s) {
    return s = s != null ? s.concat([t]) : null, ls(
      4194308,
      4,
      Rp.bind(null, r, t),
      s
    );
  }, useLayoutEffect: function(t, r) {
    return ls(4194308, 4, t, r);
  }, useInsertionEffect: function(t, r) {
    return ls(4, 2, t, r);
  }, useMemo: function(t, r) {
    var s = Kt();
    return r = r === void 0 ? null : r, t = t(), s.memoizedState = [t, r], t;
  }, useReducer: function(t, r, s) {
    var u = Kt();
    return r = s !== void 0 ? s(r) : r, u.memoizedState = u.baseState = r, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: r }, u.queue = t, t = t.dispatch = Cw.bind(null, Ne, t), [u.memoizedState, t];
  }, useRef: function(t) {
    var r = Kt();
    return t = { current: t }, r.memoizedState = t;
  }, useState: Cp, useDebugValue: Kl, useDeferredValue: function(t) {
    return Kt().memoizedState = t;
  }, useTransition: function() {
    var t = Cp(!1), r = t[0];
    return t = Aw.bind(null, t[1]), Kt().memoizedState = t, [r, t];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(t, r, s) {
    var u = Ne, p = Kt();
    if (Re) {
      if (s === void 0) throw Error(i(407));
      s = s();
    } else {
      if (s = r(), He === null) throw Error(i(349));
      (Zn & 30) !== 0 || xp(u, r, s);
    }
    p.memoizedState = s;
    var m = { value: s, getSnapshot: r };
    return p.queue = m, Ep(Tp.bind(
      null,
      u,
      m,
      t
    ), [t]), u.flags |= 2048, Vi(9, _p.bind(null, u, m, s, r), void 0, null), s;
  }, useId: function() {
    var t = Kt(), r = He.identifierPrefix;
    if (Re) {
      var s = sn, u = on;
      s = (u & ~(1 << 32 - Rt(u) - 1)).toString(32) + s, r = ":" + r + "R" + s, s = ji++, 0 < s && (r += "H" + s.toString(32)), r += ":";
    } else s = kw++, r = ":" + r + "r" + s.toString(32) + ":";
    return t.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, Mw = {
    readContext: kt,
    useCallback: Np,
    useContext: kt,
    useEffect: Gl,
    useImperativeHandle: Dp,
    useInsertionEffect: Mp,
    useLayoutEffect: bp,
    useMemo: Ip,
    useReducer: Hl,
    useRef: Pp,
    useState: function() {
      return Hl(Li);
    },
    useDebugValue: Kl,
    useDeferredValue: function(t) {
      var r = At();
      return Fp(r, Be.memoizedState, t);
    },
    useTransition: function() {
      var t = Hl(Li)[0], r = At().memoizedState;
      return [t, r];
    },
    useMutableSource: Sp,
    useSyncExternalStore: wp,
    useId: Op,
    unstable_isNewReconciler: !1
  }, bw = { readContext: kt, useCallback: Np, useContext: kt, useEffect: Gl, useImperativeHandle: Dp, useInsertionEffect: Mp, useLayoutEffect: bp, useMemo: Ip, useReducer: Wl, useRef: Pp, useState: function() {
    return Wl(Li);
  }, useDebugValue: Kl, useDeferredValue: function(t) {
    var r = At();
    return Be === null ? r.memoizedState = t : Fp(r, Be.memoizedState, t);
  }, useTransition: function() {
    var t = Wl(Li)[0], r = At().memoizedState;
    return [t, r];
  }, useMutableSource: Sp, useSyncExternalStore: wp, useId: Op, unstable_isNewReconciler: !1 };
  function It(t, r) {
    if (t && t.defaultProps) {
      r = Y({}, r), t = t.defaultProps;
      for (var s in t) r[s] === void 0 && (r[s] = t[s]);
      return r;
    }
    return r;
  }
  function Yl(t, r, s, u) {
    r = t.memoizedState, s = s(u, r), s = s == null ? r : Y({}, r, s), t.memoizedState = s, t.lanes === 0 && (t.updateQueue.baseState = s);
  }
  var ds = { isMounted: function(t) {
    return (t = t._reactInternals) ? Hn(t) === t : !1;
  }, enqueueSetState: function(t, r, s) {
    t = t._reactInternals;
    var u = rt(), p = bn(t), m = ln(u, p);
    m.payload = r, s != null && (m.callback = s), r = Cn(t, m, p), r !== null && (jt(r, t, p, u), rs(r, t, p));
  }, enqueueReplaceState: function(t, r, s) {
    t = t._reactInternals;
    var u = rt(), p = bn(t), m = ln(u, p);
    m.tag = 1, m.payload = r, s != null && (m.callback = s), r = Cn(t, m, p), r !== null && (jt(r, t, p, u), rs(r, t, p));
  }, enqueueForceUpdate: function(t, r) {
    t = t._reactInternals;
    var s = rt(), u = bn(t), p = ln(s, u);
    p.tag = 2, r != null && (p.callback = r), r = Cn(t, p, u), r !== null && (jt(r, t, u, s), rs(r, t, u));
  } };
  function Bp(t, r, s, u, p, m, x) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(u, m, x) : r.prototype && r.prototype.isPureReactComponent ? !Ai(s, u) || !Ai(p, m) : !0;
  }
  function zp(t, r, s) {
    var u = !1, p = Tn, m = r.contextType;
    return typeof m == "object" && m !== null ? m = kt(m) : (p = lt(r) ? Gn : Ze.current, u = r.contextTypes, m = (u = u != null) ? Er(t, p) : Tn), r = new r(s, m), t.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = ds, t.stateNode = r, r._reactInternals = t, u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = p, t.__reactInternalMemoizedMaskedChildContext = m), r;
  }
  function Up(t, r, s, u) {
    t = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(s, u), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(s, u), r.state !== t && ds.enqueueReplaceState(r, r.state, null);
  }
  function Ql(t, r, s, u) {
    var p = t.stateNode;
    p.props = s, p.state = t.memoizedState, p.refs = {}, Fl(t);
    var m = r.contextType;
    typeof m == "object" && m !== null ? p.context = kt(m) : (m = lt(r) ? Gn : Ze.current, p.context = Er(t, m)), p.state = t.memoizedState, m = r.getDerivedStateFromProps, typeof m == "function" && (Yl(t, r, m, s), p.state = t.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof p.getSnapshotBeforeUpdate == "function" || typeof p.UNSAFE_componentWillMount != "function" && typeof p.componentWillMount != "function" || (r = p.state, typeof p.componentWillMount == "function" && p.componentWillMount(), typeof p.UNSAFE_componentWillMount == "function" && p.UNSAFE_componentWillMount(), r !== p.state && ds.enqueueReplaceState(p, p.state, null), is(t, s, p, u), p.state = t.memoizedState), typeof p.componentDidMount == "function" && (t.flags |= 4194308);
  }
  function Or(t, r) {
    try {
      var s = "", u = r;
      do
        s += ge(u), u = u.return;
      while (u);
      var p = s;
    } catch (m) {
      p = `
Error generating stack: ` + m.message + `
` + m.stack;
    }
    return { value: t, source: r, stack: p, digest: null };
  }
  function Xl(t, r, s) {
    return { value: t, source: null, stack: s ?? null, digest: r ?? null };
  }
  function Zl(t, r) {
    try {
      console.error(r.value);
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  var Rw = typeof WeakMap == "function" ? WeakMap : Map;
  function $p(t, r, s) {
    s = ln(-1, s), s.tag = 3, s.payload = { element: null };
    var u = r.value;
    return s.callback = function() {
      vs || (vs = !0, fu = u), Zl(t, r);
    }, s;
  }
  function Hp(t, r, s) {
    s = ln(-1, s), s.tag = 3;
    var u = t.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var p = r.value;
      s.payload = function() {
        return u(p);
      }, s.callback = function() {
        Zl(t, r);
      };
    }
    var m = t.stateNode;
    return m !== null && typeof m.componentDidCatch == "function" && (s.callback = function() {
      Zl(t, r), typeof u != "function" && (En === null ? En = /* @__PURE__ */ new Set([this]) : En.add(this));
      var x = r.stack;
      this.componentDidCatch(r.value, { componentStack: x !== null ? x : "" });
    }), s;
  }
  function Wp(t, r, s) {
    var u = t.pingCache;
    if (u === null) {
      u = t.pingCache = new Rw();
      var p = /* @__PURE__ */ new Set();
      u.set(r, p);
    } else p = u.get(r), p === void 0 && (p = /* @__PURE__ */ new Set(), u.set(r, p));
    p.has(s) || (p.add(s), t = Ww.bind(null, t, r, s), r.then(t, t));
  }
  function Gp(t) {
    do {
      var r;
      if ((r = t.tag === 13) && (r = t.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r) return t;
      t = t.return;
    } while (t !== null);
    return null;
  }
  function Kp(t, r, s, u, p) {
    return (t.mode & 1) === 0 ? (t === r ? t.flags |= 65536 : (t.flags |= 128, s.flags |= 131072, s.flags &= -52805, s.tag === 1 && (s.alternate === null ? s.tag = 17 : (r = ln(-1, 1), r.tag = 2, Cn(s, r, 1))), s.lanes |= 1), t) : (t.flags |= 65536, t.lanes = p, t);
  }
  var Dw = D.ReactCurrentOwner, ut = !1;
  function nt(t, r, s, u) {
    r.child = t === null ? pp(r, null, s, u) : Dr(r, t.child, s, u);
  }
  function Yp(t, r, s, u, p) {
    s = s.render;
    var m = r.ref;
    return Ir(r, p), u = Ul(t, r, s, u, m, p), s = $l(), t !== null && !ut ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~p, un(t, r, p)) : (Re && s && Al(r), r.flags |= 1, nt(t, r, u, p), r.child);
  }
  function Qp(t, r, s, u, p) {
    if (t === null) {
      var m = s.type;
      return typeof m == "function" && !Su(m) && m.defaultProps === void 0 && s.compare === null && s.defaultProps === void 0 ? (r.tag = 15, r.type = m, Xp(t, r, m, u, p)) : (t = ks(s.type, null, u, r, r.mode, p), t.ref = r.ref, t.return = r, r.child = t);
    }
    if (m = t.child, (t.lanes & p) === 0) {
      var x = m.memoizedProps;
      if (s = s.compare, s = s !== null ? s : Ai, s(x, u) && t.ref === r.ref) return un(t, r, p);
    }
    return r.flags |= 1, t = Dn(m, u), t.ref = r.ref, t.return = r, r.child = t;
  }
  function Xp(t, r, s, u, p) {
    if (t !== null) {
      var m = t.memoizedProps;
      if (Ai(m, u) && t.ref === r.ref) if (ut = !1, r.pendingProps = u = m, (t.lanes & p) !== 0) (t.flags & 131072) !== 0 && (ut = !0);
      else return r.lanes = t.lanes, un(t, r, p);
    }
    return Jl(t, r, s, u, p);
  }
  function Zp(t, r, s) {
    var u = r.pendingProps, p = u.children, m = t !== null ? t.memoizedState : null;
    if (u.mode === "hidden") if ((r.mode & 1) === 0) r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Pe(Lr, xt), xt |= s;
    else {
      if ((s & 1073741824) === 0) return t = m !== null ? m.baseLanes | s : s, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: t, cachePool: null, transitions: null }, r.updateQueue = null, Pe(Lr, xt), xt |= t, null;
      r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, u = m !== null ? m.baseLanes : s, Pe(Lr, xt), xt |= u;
    }
    else m !== null ? (u = m.baseLanes | s, r.memoizedState = null) : u = s, Pe(Lr, xt), xt |= u;
    return nt(t, r, p, s), r.child;
  }
  function Jp(t, r) {
    var s = r.ref;
    (t === null && s !== null || t !== null && t.ref !== s) && (r.flags |= 512, r.flags |= 2097152);
  }
  function Jl(t, r, s, u, p) {
    var m = lt(s) ? Gn : Ze.current;
    return m = Er(r, m), Ir(r, p), s = Ul(t, r, s, u, m, p), u = $l(), t !== null && !ut ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~p, un(t, r, p)) : (Re && u && Al(r), r.flags |= 1, nt(t, r, s, p), r.child);
  }
  function qp(t, r, s, u, p) {
    if (lt(s)) {
      var m = !0;
      Qo(r);
    } else m = !1;
    if (Ir(r, p), r.stateNode === null) ps(t, r), zp(r, s, u), Ql(r, s, u, p), u = !0;
    else if (t === null) {
      var x = r.stateNode, P = r.memoizedProps;
      x.props = P;
      var E = x.context, O = s.contextType;
      typeof O == "object" && O !== null ? O = kt(O) : (O = lt(s) ? Gn : Ze.current, O = Er(r, O));
      var B = s.getDerivedStateFromProps, U = typeof B == "function" || typeof x.getSnapshotBeforeUpdate == "function";
      U || typeof x.UNSAFE_componentWillReceiveProps != "function" && typeof x.componentWillReceiveProps != "function" || (P !== u || E !== O) && Up(r, x, u, O), An = !1;
      var V = r.memoizedState;
      x.state = V, is(r, u, x, p), E = r.memoizedState, P !== u || V !== E || at.current || An ? (typeof B == "function" && (Yl(r, s, B, u), E = r.memoizedState), (P = An || Bp(r, s, P, u, V, E, O)) ? (U || typeof x.UNSAFE_componentWillMount != "function" && typeof x.componentWillMount != "function" || (typeof x.componentWillMount == "function" && x.componentWillMount(), typeof x.UNSAFE_componentWillMount == "function" && x.UNSAFE_componentWillMount()), typeof x.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof x.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = u, r.memoizedState = E), x.props = u, x.state = E, x.context = O, u = P) : (typeof x.componentDidMount == "function" && (r.flags |= 4194308), u = !1);
    } else {
      x = r.stateNode, mp(t, r), P = r.memoizedProps, O = r.type === r.elementType ? P : It(r.type, P), x.props = O, U = r.pendingProps, V = x.context, E = s.contextType, typeof E == "object" && E !== null ? E = kt(E) : (E = lt(s) ? Gn : Ze.current, E = Er(r, E));
      var J = s.getDerivedStateFromProps;
      (B = typeof J == "function" || typeof x.getSnapshotBeforeUpdate == "function") || typeof x.UNSAFE_componentWillReceiveProps != "function" && typeof x.componentWillReceiveProps != "function" || (P !== U || V !== E) && Up(r, x, u, E), An = !1, V = r.memoizedState, x.state = V, is(r, u, x, p);
      var ne = r.memoizedState;
      P !== U || V !== ne || at.current || An ? (typeof J == "function" && (Yl(r, s, J, u), ne = r.memoizedState), (O = An || Bp(r, s, O, u, V, ne, E) || !1) ? (B || typeof x.UNSAFE_componentWillUpdate != "function" && typeof x.componentWillUpdate != "function" || (typeof x.componentWillUpdate == "function" && x.componentWillUpdate(u, ne, E), typeof x.UNSAFE_componentWillUpdate == "function" && x.UNSAFE_componentWillUpdate(u, ne, E)), typeof x.componentDidUpdate == "function" && (r.flags |= 4), typeof x.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof x.componentDidUpdate != "function" || P === t.memoizedProps && V === t.memoizedState || (r.flags |= 4), typeof x.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && V === t.memoizedState || (r.flags |= 1024), r.memoizedProps = u, r.memoizedState = ne), x.props = u, x.state = ne, x.context = E, u = O) : (typeof x.componentDidUpdate != "function" || P === t.memoizedProps && V === t.memoizedState || (r.flags |= 4), typeof x.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && V === t.memoizedState || (r.flags |= 1024), u = !1);
    }
    return ql(t, r, s, u, m, p);
  }
  function ql(t, r, s, u, p, m) {
    Jp(t, r);
    var x = (r.flags & 128) !== 0;
    if (!u && !x) return p && ip(r, s, !1), un(t, r, m);
    u = r.stateNode, Dw.current = r;
    var P = x && typeof s.getDerivedStateFromError != "function" ? null : u.render();
    return r.flags |= 1, t !== null && x ? (r.child = Dr(r, t.child, null, m), r.child = Dr(r, null, P, m)) : nt(t, r, P, m), r.memoizedState = u.state, p && ip(r, s, !0), r.child;
  }
  function eh(t) {
    var r = t.stateNode;
    r.pendingContext ? np(t, r.pendingContext, r.pendingContext !== r.context) : r.context && np(t, r.context, !1), Ol(t, r.containerInfo);
  }
  function th(t, r, s, u, p) {
    return Rr(), Ml(p), r.flags |= 256, nt(t, r, s, u), r.child;
  }
  var eu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function tu(t) {
    return { baseLanes: t, cachePool: null, transitions: null };
  }
  function nh(t, r, s) {
    var u = r.pendingProps, p = De.current, m = !1, x = (r.flags & 128) !== 0, P;
    if ((P = x) || (P = t !== null && t.memoizedState === null ? !1 : (p & 2) !== 0), P ? (m = !0, r.flags &= -129) : (t === null || t.memoizedState !== null) && (p |= 1), Pe(De, p & 1), t === null)
      return El(r), t = r.memoizedState, t !== null && (t = t.dehydrated, t !== null) ? ((r.mode & 1) === 0 ? r.lanes = 1 : t.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824, null) : (x = u.children, t = u.fallback, m ? (u = r.mode, m = r.child, x = { mode: "hidden", children: x }, (u & 1) === 0 && m !== null ? (m.childLanes = 0, m.pendingProps = x) : m = As(x, u, 0, null), t = nr(t, u, s, null), m.return = r, t.return = r, m.sibling = t, r.child = m, r.child.memoizedState = tu(s), r.memoizedState = eu, t) : nu(r, x));
    if (p = t.memoizedState, p !== null && (P = p.dehydrated, P !== null)) return Nw(t, r, x, u, P, p, s);
    if (m) {
      m = u.fallback, x = r.mode, p = t.child, P = p.sibling;
      var E = { mode: "hidden", children: u.children };
      return (x & 1) === 0 && r.child !== p ? (u = r.child, u.childLanes = 0, u.pendingProps = E, r.deletions = null) : (u = Dn(p, E), u.subtreeFlags = p.subtreeFlags & 14680064), P !== null ? m = Dn(P, m) : (m = nr(m, x, s, null), m.flags |= 2), m.return = r, u.return = r, u.sibling = m, r.child = u, u = m, m = r.child, x = t.child.memoizedState, x = x === null ? tu(s) : { baseLanes: x.baseLanes | s, cachePool: null, transitions: x.transitions }, m.memoizedState = x, m.childLanes = t.childLanes & ~s, r.memoizedState = eu, u;
    }
    return m = t.child, t = m.sibling, u = Dn(m, { mode: "visible", children: u.children }), (r.mode & 1) === 0 && (u.lanes = s), u.return = r, u.sibling = null, t !== null && (s = r.deletions, s === null ? (r.deletions = [t], r.flags |= 16) : s.push(t)), r.child = u, r.memoizedState = null, u;
  }
  function nu(t, r) {
    return r = As({ mode: "visible", children: r }, t.mode, 0, null), r.return = t, t.child = r;
  }
  function fs(t, r, s, u) {
    return u !== null && Ml(u), Dr(r, t.child, null, s), t = nu(r, r.pendingProps.children), t.flags |= 2, r.memoizedState = null, t;
  }
  function Nw(t, r, s, u, p, m, x) {
    if (s)
      return r.flags & 256 ? (r.flags &= -257, u = Xl(Error(i(422))), fs(t, r, x, u)) : r.memoizedState !== null ? (r.child = t.child, r.flags |= 128, null) : (m = u.fallback, p = r.mode, u = As({ mode: "visible", children: u.children }, p, 0, null), m = nr(m, p, x, null), m.flags |= 2, u.return = r, m.return = r, u.sibling = m, r.child = u, (r.mode & 1) !== 0 && Dr(r, t.child, null, x), r.child.memoizedState = tu(x), r.memoizedState = eu, m);
    if ((r.mode & 1) === 0) return fs(t, r, x, null);
    if (p.data === "$!") {
      if (u = p.nextSibling && p.nextSibling.dataset, u) var P = u.dgst;
      return u = P, m = Error(i(419)), u = Xl(m, u, void 0), fs(t, r, x, u);
    }
    if (P = (x & t.childLanes) !== 0, ut || P) {
      if (u = He, u !== null) {
        switch (x & -x) {
          case 4:
            p = 2;
            break;
          case 16:
            p = 8;
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
            p = 32;
            break;
          case 536870912:
            p = 268435456;
            break;
          default:
            p = 0;
        }
        p = (p & (u.suspendedLanes | x)) !== 0 ? 0 : p, p !== 0 && p !== m.retryLane && (m.retryLane = p, an(t, p), jt(u, t, p, -1));
      }
      return vu(), u = Xl(Error(i(421))), fs(t, r, x, u);
    }
    return p.data === "$?" ? (r.flags |= 128, r.child = t.child, r = Gw.bind(null, t), p._reactRetry = r, null) : (t = m.treeContext, wt = xn(p.nextSibling), St = r, Re = !0, Nt = null, t !== null && (_t[Tt++] = on, _t[Tt++] = sn, _t[Tt++] = Kn, on = t.id, sn = t.overflow, Kn = r), r = nu(r, u.children), r.flags |= 4096, r);
  }
  function rh(t, r, s) {
    t.lanes |= r;
    var u = t.alternate;
    u !== null && (u.lanes |= r), Nl(t.return, r, s);
  }
  function ru(t, r, s, u, p) {
    var m = t.memoizedState;
    m === null ? t.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: u, tail: s, tailMode: p } : (m.isBackwards = r, m.rendering = null, m.renderingStartTime = 0, m.last = u, m.tail = s, m.tailMode = p);
  }
  function ih(t, r, s) {
    var u = r.pendingProps, p = u.revealOrder, m = u.tail;
    if (nt(t, r, u.children, s), u = De.current, (u & 2) !== 0) u = u & 1 | 2, r.flags |= 128;
    else {
      if (t !== null && (t.flags & 128) !== 0) e: for (t = r.child; t !== null; ) {
        if (t.tag === 13) t.memoizedState !== null && rh(t, s, r);
        else if (t.tag === 19) rh(t, s, r);
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
    else switch (p) {
      case "forwards":
        for (s = r.child, p = null; s !== null; ) t = s.alternate, t !== null && os(t) === null && (p = s), s = s.sibling;
        s = p, s === null ? (p = r.child, r.child = null) : (p = s.sibling, s.sibling = null), ru(r, !1, p, s, m);
        break;
      case "backwards":
        for (s = null, p = r.child, r.child = null; p !== null; ) {
          if (t = p.alternate, t !== null && os(t) === null) {
            r.child = p;
            break;
          }
          t = p.sibling, p.sibling = s, s = p, p = t;
        }
        ru(r, !0, s, null, m);
        break;
      case "together":
        ru(r, !1, null, null, void 0);
        break;
      default:
        r.memoizedState = null;
    }
    return r.child;
  }
  function ps(t, r) {
    (r.mode & 1) === 0 && t !== null && (t.alternate = null, r.alternate = null, r.flags |= 2);
  }
  function un(t, r, s) {
    if (t !== null && (r.dependencies = t.dependencies), Jn |= r.lanes, (s & r.childLanes) === 0) return null;
    if (t !== null && r.child !== t.child) throw Error(i(153));
    if (r.child !== null) {
      for (t = r.child, s = Dn(t, t.pendingProps), r.child = s, s.return = r; t.sibling !== null; ) t = t.sibling, s = s.sibling = Dn(t, t.pendingProps), s.return = r;
      s.sibling = null;
    }
    return r.child;
  }
  function Iw(t, r, s) {
    switch (r.tag) {
      case 3:
        eh(r), Rr();
        break;
      case 5:
        vp(r);
        break;
      case 1:
        lt(r.type) && Qo(r);
        break;
      case 4:
        Ol(r, r.stateNode.containerInfo);
        break;
      case 10:
        var u = r.type._context, p = r.memoizedProps.value;
        Pe(ts, u._currentValue), u._currentValue = p;
        break;
      case 13:
        if (u = r.memoizedState, u !== null)
          return u.dehydrated !== null ? (Pe(De, De.current & 1), r.flags |= 128, null) : (s & r.child.childLanes) !== 0 ? nh(t, r, s) : (Pe(De, De.current & 1), t = un(t, r, s), t !== null ? t.sibling : null);
        Pe(De, De.current & 1);
        break;
      case 19:
        if (u = (s & r.childLanes) !== 0, (t.flags & 128) !== 0) {
          if (u) return ih(t, r, s);
          r.flags |= 128;
        }
        if (p = r.memoizedState, p !== null && (p.rendering = null, p.tail = null, p.lastEffect = null), Pe(De, De.current), u) break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, Zp(t, r, s);
    }
    return un(t, r, s);
  }
  var oh, iu, sh, ah;
  oh = function(t, r) {
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
  }, iu = function() {
  }, sh = function(t, r, s, u) {
    var p = t.memoizedProps;
    if (p !== u) {
      t = r.stateNode, Xn(Gt.current);
      var m = null;
      switch (s) {
        case "input":
          p = Na(t, p), u = Na(t, u), m = [];
          break;
        case "select":
          p = Y({}, p, { value: void 0 }), u = Y({}, u, { value: void 0 }), m = [];
          break;
        case "textarea":
          p = Oa(t, p), u = Oa(t, u), m = [];
          break;
        default:
          typeof p.onClick != "function" && typeof u.onClick == "function" && (t.onclick = Go);
      }
      La(s, u);
      var x;
      s = null;
      for (O in p) if (!u.hasOwnProperty(O) && p.hasOwnProperty(O) && p[O] != null) if (O === "style") {
        var P = p[O];
        for (x in P) P.hasOwnProperty(x) && (s || (s = {}), s[x] = "");
      } else O !== "dangerouslySetInnerHTML" && O !== "children" && O !== "suppressContentEditableWarning" && O !== "suppressHydrationWarning" && O !== "autoFocus" && (a.hasOwnProperty(O) ? m || (m = []) : (m = m || []).push(O, null));
      for (O in u) {
        var E = u[O];
        if (P = p != null ? p[O] : void 0, u.hasOwnProperty(O) && E !== P && (E != null || P != null)) if (O === "style") if (P) {
          for (x in P) !P.hasOwnProperty(x) || E && E.hasOwnProperty(x) || (s || (s = {}), s[x] = "");
          for (x in E) E.hasOwnProperty(x) && P[x] !== E[x] && (s || (s = {}), s[x] = E[x]);
        } else s || (m || (m = []), m.push(
          O,
          s
        )), s = E;
        else O === "dangerouslySetInnerHTML" ? (E = E ? E.__html : void 0, P = P ? P.__html : void 0, E != null && P !== E && (m = m || []).push(O, E)) : O === "children" ? typeof E != "string" && typeof E != "number" || (m = m || []).push(O, "" + E) : O !== "suppressContentEditableWarning" && O !== "suppressHydrationWarning" && (a.hasOwnProperty(O) ? (E != null && O === "onScroll" && Ee("scroll", t), m || P === E || (m = [])) : (m = m || []).push(O, E));
      }
      s && (m = m || []).push("style", s);
      var O = m;
      (r.updateQueue = O) && (r.flags |= 4);
    }
  }, ah = function(t, r, s, u) {
    s !== u && (r.flags |= 4);
  };
  function Bi(t, r) {
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
  function qe(t) {
    var r = t.alternate !== null && t.alternate.child === t.child, s = 0, u = 0;
    if (r) for (var p = t.child; p !== null; ) s |= p.lanes | p.childLanes, u |= p.subtreeFlags & 14680064, u |= p.flags & 14680064, p.return = t, p = p.sibling;
    else for (p = t.child; p !== null; ) s |= p.lanes | p.childLanes, u |= p.subtreeFlags, u |= p.flags, p.return = t, p = p.sibling;
    return t.subtreeFlags |= u, t.childLanes = s, r;
  }
  function Fw(t, r, s) {
    var u = r.pendingProps;
    switch (Cl(r), r.tag) {
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
        return qe(r), null;
      case 1:
        return lt(r.type) && Yo(), qe(r), null;
      case 3:
        return u = r.stateNode, Fr(), Me(at), Me(Ze), Vl(), u.pendingContext && (u.context = u.pendingContext, u.pendingContext = null), (t === null || t.child === null) && (qo(r) ? r.flags |= 4 : t === null || t.memoizedState.isDehydrated && (r.flags & 256) === 0 || (r.flags |= 1024, Nt !== null && (mu(Nt), Nt = null))), iu(t, r), qe(r), null;
      case 5:
        jl(r);
        var p = Xn(Fi.current);
        if (s = r.type, t !== null && r.stateNode != null) sh(t, r, s, u, p), t.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!u) {
            if (r.stateNode === null) throw Error(i(166));
            return qe(r), null;
          }
          if (t = Xn(Gt.current), qo(r)) {
            u = r.stateNode, s = r.type;
            var m = r.memoizedProps;
            switch (u[Wt] = r, u[bi] = m, t = (r.mode & 1) !== 0, s) {
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
                for (p = 0; p < Pi.length; p++) Ee(Pi[p], u);
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
                Bd(u, m), Ee("invalid", u);
                break;
              case "select":
                u._wrapperState = { wasMultiple: !!m.multiple }, Ee("invalid", u);
                break;
              case "textarea":
                $d(u, m), Ee("invalid", u);
            }
            La(s, m), p = null;
            for (var x in m) if (m.hasOwnProperty(x)) {
              var P = m[x];
              x === "children" ? typeof P == "string" ? u.textContent !== P && (m.suppressHydrationWarning !== !0 && Wo(u.textContent, P, t), p = ["children", P]) : typeof P == "number" && u.textContent !== "" + P && (m.suppressHydrationWarning !== !0 && Wo(
                u.textContent,
                P,
                t
              ), p = ["children", "" + P]) : a.hasOwnProperty(x) && P != null && x === "onScroll" && Ee("scroll", u);
            }
            switch (s) {
              case "input":
                _o(u), Ud(u, m, !0);
                break;
              case "textarea":
                _o(u), Wd(u);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof m.onClick == "function" && (u.onclick = Go);
            }
            u = p, r.updateQueue = u, u !== null && (r.flags |= 4);
          } else {
            x = p.nodeType === 9 ? p : p.ownerDocument, t === "http://www.w3.org/1999/xhtml" && (t = Gd(s)), t === "http://www.w3.org/1999/xhtml" ? s === "script" ? (t = x.createElement("div"), t.innerHTML = "<script><\/script>", t = t.removeChild(t.firstChild)) : typeof u.is == "string" ? t = x.createElement(s, { is: u.is }) : (t = x.createElement(s), s === "select" && (x = t, u.multiple ? x.multiple = !0 : u.size && (x.size = u.size))) : t = x.createElementNS(t, s), t[Wt] = r, t[bi] = u, oh(t, r, !1, !1), r.stateNode = t;
            e: {
              switch (x = Va(s, u), s) {
                case "dialog":
                  Ee("cancel", t), Ee("close", t), p = u;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Ee("load", t), p = u;
                  break;
                case "video":
                case "audio":
                  for (p = 0; p < Pi.length; p++) Ee(Pi[p], t);
                  p = u;
                  break;
                case "source":
                  Ee("error", t), p = u;
                  break;
                case "img":
                case "image":
                case "link":
                  Ee(
                    "error",
                    t
                  ), Ee("load", t), p = u;
                  break;
                case "details":
                  Ee("toggle", t), p = u;
                  break;
                case "input":
                  Bd(t, u), p = Na(t, u), Ee("invalid", t);
                  break;
                case "option":
                  p = u;
                  break;
                case "select":
                  t._wrapperState = { wasMultiple: !!u.multiple }, p = Y({}, u, { value: void 0 }), Ee("invalid", t);
                  break;
                case "textarea":
                  $d(t, u), p = Oa(t, u), Ee("invalid", t);
                  break;
                default:
                  p = u;
              }
              La(s, p), P = p;
              for (m in P) if (P.hasOwnProperty(m)) {
                var E = P[m];
                m === "style" ? Qd(t, E) : m === "dangerouslySetInnerHTML" ? (E = E ? E.__html : void 0, E != null && Kd(t, E)) : m === "children" ? typeof E == "string" ? (s !== "textarea" || E !== "") && li(t, E) : typeof E == "number" && li(t, "" + E) : m !== "suppressContentEditableWarning" && m !== "suppressHydrationWarning" && m !== "autoFocus" && (a.hasOwnProperty(m) ? E != null && m === "onScroll" && Ee("scroll", t) : E != null && R(t, m, E, x));
              }
              switch (s) {
                case "input":
                  _o(t), Ud(t, u, !1);
                  break;
                case "textarea":
                  _o(t), Wd(t);
                  break;
                case "option":
                  u.value != null && t.setAttribute("value", "" + xe(u.value));
                  break;
                case "select":
                  t.multiple = !!u.multiple, m = u.value, m != null ? yr(t, !!u.multiple, m, !1) : u.defaultValue != null && yr(
                    t,
                    !!u.multiple,
                    u.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof p.onClick == "function" && (t.onclick = Go);
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
        return qe(r), null;
      case 6:
        if (t && r.stateNode != null) ah(t, r, t.memoizedProps, u);
        else {
          if (typeof u != "string" && r.stateNode === null) throw Error(i(166));
          if (s = Xn(Fi.current), Xn(Gt.current), qo(r)) {
            if (u = r.stateNode, s = r.memoizedProps, u[Wt] = r, (m = u.nodeValue !== s) && (t = St, t !== null)) switch (t.tag) {
              case 3:
                Wo(u.nodeValue, s, (t.mode & 1) !== 0);
                break;
              case 5:
                t.memoizedProps.suppressHydrationWarning !== !0 && Wo(u.nodeValue, s, (t.mode & 1) !== 0);
            }
            m && (r.flags |= 4);
          } else u = (s.nodeType === 9 ? s : s.ownerDocument).createTextNode(u), u[Wt] = r, r.stateNode = u;
        }
        return qe(r), null;
      case 13:
        if (Me(De), u = r.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (Re && wt !== null && (r.mode & 1) !== 0 && (r.flags & 128) === 0) cp(), Rr(), r.flags |= 98560, m = !1;
          else if (m = qo(r), u !== null && u.dehydrated !== null) {
            if (t === null) {
              if (!m) throw Error(i(318));
              if (m = r.memoizedState, m = m !== null ? m.dehydrated : null, !m) throw Error(i(317));
              m[Wt] = r;
            } else Rr(), (r.flags & 128) === 0 && (r.memoizedState = null), r.flags |= 4;
            qe(r), m = !1;
          } else Nt !== null && (mu(Nt), Nt = null), m = !0;
          if (!m) return r.flags & 65536 ? r : null;
        }
        return (r.flags & 128) !== 0 ? (r.lanes = s, r) : (u = u !== null, u !== (t !== null && t.memoizedState !== null) && u && (r.child.flags |= 8192, (r.mode & 1) !== 0 && (t === null || (De.current & 1) !== 0 ? ze === 0 && (ze = 3) : vu())), r.updateQueue !== null && (r.flags |= 4), qe(r), null);
      case 4:
        return Fr(), iu(t, r), t === null && Ei(r.stateNode.containerInfo), qe(r), null;
      case 10:
        return Dl(r.type._context), qe(r), null;
      case 17:
        return lt(r.type) && Yo(), qe(r), null;
      case 19:
        if (Me(De), m = r.memoizedState, m === null) return qe(r), null;
        if (u = (r.flags & 128) !== 0, x = m.rendering, x === null) if (u) Bi(m, !1);
        else {
          if (ze !== 0 || t !== null && (t.flags & 128) !== 0) for (t = r.child; t !== null; ) {
            if (x = os(t), x !== null) {
              for (r.flags |= 128, Bi(m, !1), u = x.updateQueue, u !== null && (r.updateQueue = u, r.flags |= 4), r.subtreeFlags = 0, u = s, s = r.child; s !== null; ) m = s, t = u, m.flags &= 14680066, x = m.alternate, x === null ? (m.childLanes = 0, m.lanes = t, m.child = null, m.subtreeFlags = 0, m.memoizedProps = null, m.memoizedState = null, m.updateQueue = null, m.dependencies = null, m.stateNode = null) : (m.childLanes = x.childLanes, m.lanes = x.lanes, m.child = x.child, m.subtreeFlags = 0, m.deletions = null, m.memoizedProps = x.memoizedProps, m.memoizedState = x.memoizedState, m.updateQueue = x.updateQueue, m.type = x.type, t = x.dependencies, m.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), s = s.sibling;
              return Pe(De, De.current & 1 | 2), r.child;
            }
            t = t.sibling;
          }
          m.tail !== null && Oe() > Vr && (r.flags |= 128, u = !0, Bi(m, !1), r.lanes = 4194304);
        }
        else {
          if (!u) if (t = os(x), t !== null) {
            if (r.flags |= 128, u = !0, s = t.updateQueue, s !== null && (r.updateQueue = s, r.flags |= 4), Bi(m, !0), m.tail === null && m.tailMode === "hidden" && !x.alternate && !Re) return qe(r), null;
          } else 2 * Oe() - m.renderingStartTime > Vr && s !== 1073741824 && (r.flags |= 128, u = !0, Bi(m, !1), r.lanes = 4194304);
          m.isBackwards ? (x.sibling = r.child, r.child = x) : (s = m.last, s !== null ? s.sibling = x : r.child = x, m.last = x);
        }
        return m.tail !== null ? (r = m.tail, m.rendering = r, m.tail = r.sibling, m.renderingStartTime = Oe(), r.sibling = null, s = De.current, Pe(De, u ? s & 1 | 2 : s & 1), r) : (qe(r), null);
      case 22:
      case 23:
        return gu(), u = r.memoizedState !== null, t !== null && t.memoizedState !== null !== u && (r.flags |= 8192), u && (r.mode & 1) !== 0 ? (xt & 1073741824) !== 0 && (qe(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : qe(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(i(156, r.tag));
  }
  function Ow(t, r) {
    switch (Cl(r), r.tag) {
      case 1:
        return lt(r.type) && Yo(), t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 3:
        return Fr(), Me(at), Me(Ze), Vl(), t = r.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (r.flags = t & -65537 | 128, r) : null;
      case 5:
        return jl(r), null;
      case 13:
        if (Me(De), t = r.memoizedState, t !== null && t.dehydrated !== null) {
          if (r.alternate === null) throw Error(i(340));
          Rr();
        }
        return t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 19:
        return Me(De), null;
      case 4:
        return Fr(), null;
      case 10:
        return Dl(r.type._context), null;
      case 22:
      case 23:
        return gu(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var hs = !1, et = !1, jw = typeof WeakSet == "function" ? WeakSet : Set, q = null;
  function jr(t, r) {
    var s = t.ref;
    if (s !== null) if (typeof s == "function") try {
      s(null);
    } catch (u) {
      Fe(t, r, u);
    }
    else s.current = null;
  }
  function ou(t, r, s) {
    try {
      s();
    } catch (u) {
      Fe(t, r, u);
    }
  }
  var lh = !1;
  function Lw(t, r) {
    if (gl = Io, t = Bf(), ul(t)) {
      if ("selectionStart" in t) var s = { start: t.selectionStart, end: t.selectionEnd };
      else e: {
        s = (s = t.ownerDocument) && s.defaultView || window;
        var u = s.getSelection && s.getSelection();
        if (u && u.rangeCount !== 0) {
          s = u.anchorNode;
          var p = u.anchorOffset, m = u.focusNode;
          u = u.focusOffset;
          try {
            s.nodeType, m.nodeType;
          } catch {
            s = null;
            break e;
          }
          var x = 0, P = -1, E = -1, O = 0, B = 0, U = t, V = null;
          t: for (; ; ) {
            for (var J; U !== s || p !== 0 && U.nodeType !== 3 || (P = x + p), U !== m || u !== 0 && U.nodeType !== 3 || (E = x + u), U.nodeType === 3 && (x += U.nodeValue.length), (J = U.firstChild) !== null; )
              V = U, U = J;
            for (; ; ) {
              if (U === t) break t;
              if (V === s && ++O === p && (P = x), V === m && ++B === u && (E = x), (J = U.nextSibling) !== null) break;
              U = V, V = U.parentNode;
            }
            U = J;
          }
          s = P === -1 || E === -1 ? null : { start: P, end: E };
        } else s = null;
      }
      s = s || { start: 0, end: 0 };
    } else s = null;
    for (vl = { focusedElem: t, selectionRange: s }, Io = !1, q = r; q !== null; ) if (r = q, t = r.child, (r.subtreeFlags & 1028) !== 0 && t !== null) t.return = r, q = t;
    else for (; q !== null; ) {
      r = q;
      try {
        var ne = r.alternate;
        if ((r.flags & 1024) !== 0) switch (r.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (ne !== null) {
              var ie = ne.memoizedProps, je = ne.memoizedState, I = r.stateNode, b = I.getSnapshotBeforeUpdate(r.elementType === r.type ? ie : It(r.type, ie), je);
              I.__reactInternalSnapshotBeforeUpdate = b;
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
            throw Error(i(163));
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
    return ne = lh, lh = !1, ne;
  }
  function zi(t, r, s) {
    var u = r.updateQueue;
    if (u = u !== null ? u.lastEffect : null, u !== null) {
      var p = u = u.next;
      do {
        if ((p.tag & t) === t) {
          var m = p.destroy;
          p.destroy = void 0, m !== void 0 && ou(r, s, m);
        }
        p = p.next;
      } while (p !== u);
    }
  }
  function ms(t, r) {
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
  function su(t) {
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
  function uh(t) {
    var r = t.alternate;
    r !== null && (t.alternate = null, uh(r)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (r = t.stateNode, r !== null && (delete r[Wt], delete r[bi], delete r[_l], delete r[ww], delete r[xw])), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  function ch(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 4;
  }
  function dh(t) {
    e: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || ch(t.return)) return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
        if (t.flags & 2 || t.child === null || t.tag === 4) continue e;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function au(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.nodeType === 8 ? s.parentNode.insertBefore(t, r) : s.insertBefore(t, r) : (s.nodeType === 8 ? (r = s.parentNode, r.insertBefore(t, s)) : (r = s, r.appendChild(t)), s = s._reactRootContainer, s != null || r.onclick !== null || (r.onclick = Go));
    else if (u !== 4 && (t = t.child, t !== null)) for (au(t, r, s), t = t.sibling; t !== null; ) au(t, r, s), t = t.sibling;
  }
  function lu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.insertBefore(t, r) : s.appendChild(t);
    else if (u !== 4 && (t = t.child, t !== null)) for (lu(t, r, s), t = t.sibling; t !== null; ) lu(t, r, s), t = t.sibling;
  }
  var Ke = null, Ft = !1;
  function Pn(t, r, s) {
    for (s = s.child; s !== null; ) fh(t, r, s), s = s.sibling;
  }
  function fh(t, r, s) {
    if (Ht && typeof Ht.onCommitFiberUnmount == "function") try {
      Ht.onCommitFiberUnmount(Eo, s);
    } catch {
    }
    switch (s.tag) {
      case 5:
        et || jr(s, r);
      case 6:
        var u = Ke, p = Ft;
        Ke = null, Pn(t, r, s), Ke = u, Ft = p, Ke !== null && (Ft ? (t = Ke, s = s.stateNode, t.nodeType === 8 ? t.parentNode.removeChild(s) : t.removeChild(s)) : Ke.removeChild(s.stateNode));
        break;
      case 18:
        Ke !== null && (Ft ? (t = Ke, s = s.stateNode, t.nodeType === 8 ? xl(t.parentNode, s) : t.nodeType === 1 && xl(t, s), Si(t)) : xl(Ke, s.stateNode));
        break;
      case 4:
        u = Ke, p = Ft, Ke = s.stateNode.containerInfo, Ft = !0, Pn(t, r, s), Ke = u, Ft = p;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!et && (u = s.updateQueue, u !== null && (u = u.lastEffect, u !== null))) {
          p = u = u.next;
          do {
            var m = p, x = m.destroy;
            m = m.tag, x !== void 0 && ((m & 2) !== 0 || (m & 4) !== 0) && ou(s, r, x), p = p.next;
          } while (p !== u);
        }
        Pn(t, r, s);
        break;
      case 1:
        if (!et && (jr(s, r), u = s.stateNode, typeof u.componentWillUnmount == "function")) try {
          u.props = s.memoizedProps, u.state = s.memoizedState, u.componentWillUnmount();
        } catch (P) {
          Fe(s, r, P);
        }
        Pn(t, r, s);
        break;
      case 21:
        Pn(t, r, s);
        break;
      case 22:
        s.mode & 1 ? (et = (u = et) || s.memoizedState !== null, Pn(t, r, s), et = u) : Pn(t, r, s);
        break;
      default:
        Pn(t, r, s);
    }
  }
  function ph(t) {
    var r = t.updateQueue;
    if (r !== null) {
      t.updateQueue = null;
      var s = t.stateNode;
      s === null && (s = t.stateNode = new jw()), r.forEach(function(u) {
        var p = Kw.bind(null, t, u);
        s.has(u) || (s.add(u), u.then(p, p));
      });
    }
  }
  function Ot(t, r) {
    var s = r.deletions;
    if (s !== null) for (var u = 0; u < s.length; u++) {
      var p = s[u];
      try {
        var m = t, x = r, P = x;
        e: for (; P !== null; ) {
          switch (P.tag) {
            case 5:
              Ke = P.stateNode, Ft = !1;
              break e;
            case 3:
              Ke = P.stateNode.containerInfo, Ft = !0;
              break e;
            case 4:
              Ke = P.stateNode.containerInfo, Ft = !0;
              break e;
          }
          P = P.return;
        }
        if (Ke === null) throw Error(i(160));
        fh(m, x, p), Ke = null, Ft = !1;
        var E = p.alternate;
        E !== null && (E.return = null), p.return = null;
      } catch (O) {
        Fe(p, r, O);
      }
    }
    if (r.subtreeFlags & 12854) for (r = r.child; r !== null; ) hh(r, t), r = r.sibling;
  }
  function hh(t, r) {
    var s = t.alternate, u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Ot(r, t), Yt(t), u & 4) {
          try {
            zi(3, t, t.return), ms(3, t);
          } catch (ie) {
            Fe(t, t.return, ie);
          }
          try {
            zi(5, t, t.return);
          } catch (ie) {
            Fe(t, t.return, ie);
          }
        }
        break;
      case 1:
        Ot(r, t), Yt(t), u & 512 && s !== null && jr(s, s.return);
        break;
      case 5:
        if (Ot(r, t), Yt(t), u & 512 && s !== null && jr(s, s.return), t.flags & 32) {
          var p = t.stateNode;
          try {
            li(p, "");
          } catch (ie) {
            Fe(t, t.return, ie);
          }
        }
        if (u & 4 && (p = t.stateNode, p != null)) {
          var m = t.memoizedProps, x = s !== null ? s.memoizedProps : m, P = t.type, E = t.updateQueue;
          if (t.updateQueue = null, E !== null) try {
            P === "input" && m.type === "radio" && m.name != null && zd(p, m), Va(P, x);
            var O = Va(P, m);
            for (x = 0; x < E.length; x += 2) {
              var B = E[x], U = E[x + 1];
              B === "style" ? Qd(p, U) : B === "dangerouslySetInnerHTML" ? Kd(p, U) : B === "children" ? li(p, U) : R(p, B, U, O);
            }
            switch (P) {
              case "input":
                Ia(p, m);
                break;
              case "textarea":
                Hd(p, m);
                break;
              case "select":
                var V = p._wrapperState.wasMultiple;
                p._wrapperState.wasMultiple = !!m.multiple;
                var J = m.value;
                J != null ? yr(p, !!m.multiple, J, !1) : V !== !!m.multiple && (m.defaultValue != null ? yr(
                  p,
                  !!m.multiple,
                  m.defaultValue,
                  !0
                ) : yr(p, !!m.multiple, m.multiple ? [] : "", !1));
            }
            p[bi] = m;
          } catch (ie) {
            Fe(t, t.return, ie);
          }
        }
        break;
      case 6:
        if (Ot(r, t), Yt(t), u & 4) {
          if (t.stateNode === null) throw Error(i(162));
          p = t.stateNode, m = t.memoizedProps;
          try {
            p.nodeValue = m;
          } catch (ie) {
            Fe(t, t.return, ie);
          }
        }
        break;
      case 3:
        if (Ot(r, t), Yt(t), u & 4 && s !== null && s.memoizedState.isDehydrated) try {
          Si(r.containerInfo);
        } catch (ie) {
          Fe(t, t.return, ie);
        }
        break;
      case 4:
        Ot(r, t), Yt(t);
        break;
      case 13:
        Ot(r, t), Yt(t), p = t.child, p.flags & 8192 && (m = p.memoizedState !== null, p.stateNode.isHidden = m, !m || p.alternate !== null && p.alternate.memoizedState !== null || (du = Oe())), u & 4 && ph(t);
        break;
      case 22:
        if (B = s !== null && s.memoizedState !== null, t.mode & 1 ? (et = (O = et) || B, Ot(r, t), et = O) : Ot(r, t), Yt(t), u & 8192) {
          if (O = t.memoizedState !== null, (t.stateNode.isHidden = O) && !B && (t.mode & 1) !== 0) for (q = t, B = t.child; B !== null; ) {
            for (U = q = B; q !== null; ) {
              switch (V = q, J = V.child, V.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  zi(4, V, V.return);
                  break;
                case 1:
                  jr(V, V.return);
                  var ne = V.stateNode;
                  if (typeof ne.componentWillUnmount == "function") {
                    u = V, s = V.return;
                    try {
                      r = u, ne.props = r.memoizedProps, ne.state = r.memoizedState, ne.componentWillUnmount();
                    } catch (ie) {
                      Fe(u, s, ie);
                    }
                  }
                  break;
                case 5:
                  jr(V, V.return);
                  break;
                case 22:
                  if (V.memoizedState !== null) {
                    gh(U);
                    continue;
                  }
              }
              J !== null ? (J.return = V, q = J) : gh(U);
            }
            B = B.sibling;
          }
          e: for (B = null, U = t; ; ) {
            if (U.tag === 5) {
              if (B === null) {
                B = U;
                try {
                  p = U.stateNode, O ? (m = p.style, typeof m.setProperty == "function" ? m.setProperty("display", "none", "important") : m.display = "none") : (P = U.stateNode, E = U.memoizedProps.style, x = E != null && E.hasOwnProperty("display") ? E.display : null, P.style.display = Yd("display", x));
                } catch (ie) {
                  Fe(t, t.return, ie);
                }
              }
            } else if (U.tag === 6) {
              if (B === null) try {
                U.stateNode.nodeValue = O ? "" : U.memoizedProps;
              } catch (ie) {
                Fe(t, t.return, ie);
              }
            } else if ((U.tag !== 22 && U.tag !== 23 || U.memoizedState === null || U === t) && U.child !== null) {
              U.child.return = U, U = U.child;
              continue;
            }
            if (U === t) break e;
            for (; U.sibling === null; ) {
              if (U.return === null || U.return === t) break e;
              B === U && (B = null), U = U.return;
            }
            B === U && (B = null), U.sibling.return = U.return, U = U.sibling;
          }
        }
        break;
      case 19:
        Ot(r, t), Yt(t), u & 4 && ph(t);
        break;
      case 21:
        break;
      default:
        Ot(
          r,
          t
        ), Yt(t);
    }
  }
  function Yt(t) {
    var r = t.flags;
    if (r & 2) {
      try {
        e: {
          for (var s = t.return; s !== null; ) {
            if (ch(s)) {
              var u = s;
              break e;
            }
            s = s.return;
          }
          throw Error(i(160));
        }
        switch (u.tag) {
          case 5:
            var p = u.stateNode;
            u.flags & 32 && (li(p, ""), u.flags &= -33);
            var m = dh(t);
            lu(t, m, p);
            break;
          case 3:
          case 4:
            var x = u.stateNode.containerInfo, P = dh(t);
            au(t, P, x);
            break;
          default:
            throw Error(i(161));
        }
      } catch (E) {
        Fe(t, t.return, E);
      }
      t.flags &= -3;
    }
    r & 4096 && (t.flags &= -4097);
  }
  function Vw(t, r, s) {
    q = t, mh(t);
  }
  function mh(t, r, s) {
    for (var u = (t.mode & 1) !== 0; q !== null; ) {
      var p = q, m = p.child;
      if (p.tag === 22 && u) {
        var x = p.memoizedState !== null || hs;
        if (!x) {
          var P = p.alternate, E = P !== null && P.memoizedState !== null || et;
          P = hs;
          var O = et;
          if (hs = x, (et = E) && !O) for (q = p; q !== null; ) x = q, E = x.child, x.tag === 22 && x.memoizedState !== null ? vh(p) : E !== null ? (E.return = x, q = E) : vh(p);
          for (; m !== null; ) q = m, mh(m), m = m.sibling;
          q = p, hs = P, et = O;
        }
        yh(t);
      } else (p.subtreeFlags & 8772) !== 0 && m !== null ? (m.return = p, q = m) : yh(t);
    }
  }
  function yh(t) {
    for (; q !== null; ) {
      var r = q;
      if ((r.flags & 8772) !== 0) {
        var s = r.alternate;
        try {
          if ((r.flags & 8772) !== 0) switch (r.tag) {
            case 0:
            case 11:
            case 15:
              et || ms(5, r);
              break;
            case 1:
              var u = r.stateNode;
              if (r.flags & 4 && !et) if (s === null) u.componentDidMount();
              else {
                var p = r.elementType === r.type ? s.memoizedProps : It(r.type, s.memoizedProps);
                u.componentDidUpdate(p, s.memoizedState, u.__reactInternalSnapshotBeforeUpdate);
              }
              var m = r.updateQueue;
              m !== null && gp(r, m, u);
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
                gp(r, x, s);
              }
              break;
            case 5:
              var P = r.stateNode;
              if (s === null && r.flags & 4) {
                s = P;
                var E = r.memoizedProps;
                switch (r.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    E.autoFocus && s.focus();
                    break;
                  case "img":
                    E.src && (s.src = E.src);
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
                var O = r.alternate;
                if (O !== null) {
                  var B = O.memoizedState;
                  if (B !== null) {
                    var U = B.dehydrated;
                    U !== null && Si(U);
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
              throw Error(i(163));
          }
          et || r.flags & 512 && su(r);
        } catch (V) {
          Fe(r, r.return, V);
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
  function gh(t) {
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
  function vh(t) {
    for (; q !== null; ) {
      var r = q;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var s = r.return;
            try {
              ms(4, r);
            } catch (E) {
              Fe(r, s, E);
            }
            break;
          case 1:
            var u = r.stateNode;
            if (typeof u.componentDidMount == "function") {
              var p = r.return;
              try {
                u.componentDidMount();
              } catch (E) {
                Fe(r, p, E);
              }
            }
            var m = r.return;
            try {
              su(r);
            } catch (E) {
              Fe(r, m, E);
            }
            break;
          case 5:
            var x = r.return;
            try {
              su(r);
            } catch (E) {
              Fe(r, x, E);
            }
        }
      } catch (E) {
        Fe(r, r.return, E);
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
  var Bw = Math.ceil, ys = D.ReactCurrentDispatcher, uu = D.ReactCurrentOwner, Ct = D.ReactCurrentBatchConfig, ye = 0, He = null, Le = null, Ye = 0, xt = 0, Lr = _n(0), ze = 0, Ui = null, Jn = 0, gs = 0, cu = 0, $i = null, ct = null, du = 0, Vr = 1 / 0, cn = null, vs = !1, fu = null, En = null, Ss = !1, Mn = null, ws = 0, Hi = 0, pu = null, xs = -1, _s = 0;
  function rt() {
    return (ye & 6) !== 0 ? Oe() : xs !== -1 ? xs : xs = Oe();
  }
  function bn(t) {
    return (t.mode & 1) === 0 ? 1 : (ye & 2) !== 0 && Ye !== 0 ? Ye & -Ye : Tw.transition !== null ? (_s === 0 && (_s = df()), _s) : (t = _e, t !== 0 || (t = window.event, t = t === void 0 ? 16 : wf(t.type)), t);
  }
  function jt(t, r, s, u) {
    if (50 < Hi) throw Hi = 0, pu = null, Error(i(185));
    hi(t, s, u), ((ye & 2) === 0 || t !== He) && (t === He && ((ye & 2) === 0 && (gs |= s), ze === 4 && Rn(t, Ye)), dt(t, u), s === 1 && ye === 0 && (r.mode & 1) === 0 && (Vr = Oe() + 500, Xo && kn()));
  }
  function dt(t, r) {
    var s = t.callbackNode;
    TS(t, r);
    var u = Ro(t, t === He ? Ye : 0);
    if (u === 0) s !== null && lf(s), t.callbackNode = null, t.callbackPriority = 0;
    else if (r = u & -u, t.callbackPriority !== r) {
      if (s != null && lf(s), r === 1) t.tag === 0 ? _w(wh.bind(null, t)) : op(wh.bind(null, t)), vw(function() {
        (ye & 6) === 0 && kn();
      }), s = null;
      else {
        switch (ff(u)) {
          case 1:
            s = Ga;
            break;
          case 4:
            s = uf;
            break;
          case 16:
            s = Po;
            break;
          case 536870912:
            s = cf;
            break;
          default:
            s = Po;
        }
        s = Eh(s, Sh.bind(null, t));
      }
      t.callbackPriority = r, t.callbackNode = s;
    }
  }
  function Sh(t, r) {
    if (xs = -1, _s = 0, (ye & 6) !== 0) throw Error(i(327));
    var s = t.callbackNode;
    if (Br() && t.callbackNode !== s) return null;
    var u = Ro(t, t === He ? Ye : 0);
    if (u === 0) return null;
    if ((u & 30) !== 0 || (u & t.expiredLanes) !== 0 || r) r = Ts(t, u);
    else {
      r = u;
      var p = ye;
      ye |= 2;
      var m = _h();
      (He !== t || Ye !== r) && (cn = null, Vr = Oe() + 500, er(t, r));
      do
        try {
          $w();
          break;
        } catch (P) {
          xh(t, P);
        }
      while (!0);
      Rl(), ys.current = m, ye = p, Le !== null ? r = 0 : (He = null, Ye = 0, r = ze);
    }
    if (r !== 0) {
      if (r === 2 && (p = Ka(t), p !== 0 && (u = p, r = hu(t, p))), r === 1) throw s = Ui, er(t, 0), Rn(t, u), dt(t, Oe()), s;
      if (r === 6) Rn(t, u);
      else {
        if (p = t.current.alternate, (u & 30) === 0 && !zw(p) && (r = Ts(t, u), r === 2 && (m = Ka(t), m !== 0 && (u = m, r = hu(t, m))), r === 1)) throw s = Ui, er(t, 0), Rn(t, u), dt(t, Oe()), s;
        switch (t.finishedWork = p, t.finishedLanes = u, r) {
          case 0:
          case 1:
            throw Error(i(345));
          case 2:
            tr(t, ct, cn);
            break;
          case 3:
            if (Rn(t, u), (u & 130023424) === u && (r = du + 500 - Oe(), 10 < r)) {
              if (Ro(t, 0) !== 0) break;
              if (p = t.suspendedLanes, (p & u) !== u) {
                rt(), t.pingedLanes |= t.suspendedLanes & p;
                break;
              }
              t.timeoutHandle = wl(tr.bind(null, t, ct, cn), r);
              break;
            }
            tr(t, ct, cn);
            break;
          case 4:
            if (Rn(t, u), (u & 4194240) === u) break;
            for (r = t.eventTimes, p = -1; 0 < u; ) {
              var x = 31 - Rt(u);
              m = 1 << x, x = r[x], x > p && (p = x), u &= ~m;
            }
            if (u = p, u = Oe() - u, u = (120 > u ? 120 : 480 > u ? 480 : 1080 > u ? 1080 : 1920 > u ? 1920 : 3e3 > u ? 3e3 : 4320 > u ? 4320 : 1960 * Bw(u / 1960)) - u, 10 < u) {
              t.timeoutHandle = wl(tr.bind(null, t, ct, cn), u);
              break;
            }
            tr(t, ct, cn);
            break;
          case 5:
            tr(t, ct, cn);
            break;
          default:
            throw Error(i(329));
        }
      }
    }
    return dt(t, Oe()), t.callbackNode === s ? Sh.bind(null, t) : null;
  }
  function hu(t, r) {
    var s = $i;
    return t.current.memoizedState.isDehydrated && (er(t, r).flags |= 256), t = Ts(t, r), t !== 2 && (r = ct, ct = s, r !== null && mu(r)), t;
  }
  function mu(t) {
    ct === null ? ct = t : ct.push.apply(ct, t);
  }
  function zw(t) {
    for (var r = t; ; ) {
      if (r.flags & 16384) {
        var s = r.updateQueue;
        if (s !== null && (s = s.stores, s !== null)) for (var u = 0; u < s.length; u++) {
          var p = s[u], m = p.getSnapshot;
          p = p.value;
          try {
            if (!Dt(m(), p)) return !1;
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
  function Rn(t, r) {
    for (r &= ~cu, r &= ~gs, t.suspendedLanes |= r, t.pingedLanes &= ~r, t = t.expirationTimes; 0 < r; ) {
      var s = 31 - Rt(r), u = 1 << s;
      t[s] = -1, r &= ~u;
    }
  }
  function wh(t) {
    if ((ye & 6) !== 0) throw Error(i(327));
    Br();
    var r = Ro(t, 0);
    if ((r & 1) === 0) return dt(t, Oe()), null;
    var s = Ts(t, r);
    if (t.tag !== 0 && s === 2) {
      var u = Ka(t);
      u !== 0 && (r = u, s = hu(t, u));
    }
    if (s === 1) throw s = Ui, er(t, 0), Rn(t, r), dt(t, Oe()), s;
    if (s === 6) throw Error(i(345));
    return t.finishedWork = t.current.alternate, t.finishedLanes = r, tr(t, ct, cn), dt(t, Oe()), null;
  }
  function yu(t, r) {
    var s = ye;
    ye |= 1;
    try {
      return t(r);
    } finally {
      ye = s, ye === 0 && (Vr = Oe() + 500, Xo && kn());
    }
  }
  function qn(t) {
    Mn !== null && Mn.tag === 0 && (ye & 6) === 0 && Br();
    var r = ye;
    ye |= 1;
    var s = Ct.transition, u = _e;
    try {
      if (Ct.transition = null, _e = 1, t) return t();
    } finally {
      _e = u, Ct.transition = s, ye = r, (ye & 6) === 0 && kn();
    }
  }
  function gu() {
    xt = Lr.current, Me(Lr);
  }
  function er(t, r) {
    t.finishedWork = null, t.finishedLanes = 0;
    var s = t.timeoutHandle;
    if (s !== -1 && (t.timeoutHandle = -1, gw(s)), Le !== null) for (s = Le.return; s !== null; ) {
      var u = s;
      switch (Cl(u), u.tag) {
        case 1:
          u = u.type.childContextTypes, u != null && Yo();
          break;
        case 3:
          Fr(), Me(at), Me(Ze), Vl();
          break;
        case 5:
          jl(u);
          break;
        case 4:
          Fr();
          break;
        case 13:
          Me(De);
          break;
        case 19:
          Me(De);
          break;
        case 10:
          Dl(u.type._context);
          break;
        case 22:
        case 23:
          gu();
      }
      s = s.return;
    }
    if (He = t, Le = t = Dn(t.current, null), Ye = xt = r, ze = 0, Ui = null, cu = gs = Jn = 0, ct = $i = null, Qn !== null) {
      for (r = 0; r < Qn.length; r++) if (s = Qn[r], u = s.interleaved, u !== null) {
        s.interleaved = null;
        var p = u.next, m = s.pending;
        if (m !== null) {
          var x = m.next;
          m.next = p, u.next = x;
        }
        s.pending = u;
      }
      Qn = null;
    }
    return t;
  }
  function xh(t, r) {
    do {
      var s = Le;
      try {
        if (Rl(), ss.current = cs, as) {
          for (var u = Ne.memoizedState; u !== null; ) {
            var p = u.queue;
            p !== null && (p.pending = null), u = u.next;
          }
          as = !1;
        }
        if (Zn = 0, $e = Be = Ne = null, Oi = !1, ji = 0, uu.current = null, s === null || s.return === null) {
          ze = 1, Ui = r, Le = null;
          break;
        }
        e: {
          var m = t, x = s.return, P = s, E = r;
          if (r = Ye, P.flags |= 32768, E !== null && typeof E == "object" && typeof E.then == "function") {
            var O = E, B = P, U = B.tag;
            if ((B.mode & 1) === 0 && (U === 0 || U === 11 || U === 15)) {
              var V = B.alternate;
              V ? (B.updateQueue = V.updateQueue, B.memoizedState = V.memoizedState, B.lanes = V.lanes) : (B.updateQueue = null, B.memoizedState = null);
            }
            var J = Gp(x);
            if (J !== null) {
              J.flags &= -257, Kp(J, x, P, m, r), J.mode & 1 && Wp(m, O, r), r = J, E = O;
              var ne = r.updateQueue;
              if (ne === null) {
                var ie = /* @__PURE__ */ new Set();
                ie.add(E), r.updateQueue = ie;
              } else ne.add(E);
              break e;
            } else {
              if ((r & 1) === 0) {
                Wp(m, O, r), vu();
                break e;
              }
              E = Error(i(426));
            }
          } else if (Re && P.mode & 1) {
            var je = Gp(x);
            if (je !== null) {
              (je.flags & 65536) === 0 && (je.flags |= 256), Kp(je, x, P, m, r), Ml(Or(E, P));
              break e;
            }
          }
          m = E = Or(E, P), ze !== 4 && (ze = 2), $i === null ? $i = [m] : $i.push(m), m = x;
          do {
            switch (m.tag) {
              case 3:
                m.flags |= 65536, r &= -r, m.lanes |= r;
                var I = $p(m, E, r);
                yp(m, I);
                break e;
              case 1:
                P = E;
                var b = m.type, F = m.stateNode;
                if ((m.flags & 128) === 0 && (typeof b.getDerivedStateFromError == "function" || F !== null && typeof F.componentDidCatch == "function" && (En === null || !En.has(F)))) {
                  m.flags |= 65536, r &= -r, m.lanes |= r;
                  var H = Hp(m, P, r);
                  yp(m, H);
                  break e;
                }
            }
            m = m.return;
          } while (m !== null);
        }
        kh(s);
      } catch (oe) {
        r = oe, Le === s && s !== null && (Le = s = s.return);
        continue;
      }
      break;
    } while (!0);
  }
  function _h() {
    var t = ys.current;
    return ys.current = cs, t === null ? cs : t;
  }
  function vu() {
    (ze === 0 || ze === 3 || ze === 2) && (ze = 4), He === null || (Jn & 268435455) === 0 && (gs & 268435455) === 0 || Rn(He, Ye);
  }
  function Ts(t, r) {
    var s = ye;
    ye |= 2;
    var u = _h();
    (He !== t || Ye !== r) && (cn = null, er(t, r));
    do
      try {
        Uw();
        break;
      } catch (p) {
        xh(t, p);
      }
    while (!0);
    if (Rl(), ye = s, ys.current = u, Le !== null) throw Error(i(261));
    return He = null, Ye = 0, ze;
  }
  function Uw() {
    for (; Le !== null; ) Th(Le);
  }
  function $w() {
    for (; Le !== null && !hS(); ) Th(Le);
  }
  function Th(t) {
    var r = Ph(t.alternate, t, xt);
    t.memoizedProps = t.pendingProps, r === null ? kh(t) : Le = r, uu.current = null;
  }
  function kh(t) {
    var r = t;
    do {
      var s = r.alternate;
      if (t = r.return, (r.flags & 32768) === 0) {
        if (s = Fw(s, r, xt), s !== null) {
          Le = s;
          return;
        }
      } else {
        if (s = Ow(s, r), s !== null) {
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
  function tr(t, r, s) {
    var u = _e, p = Ct.transition;
    try {
      Ct.transition = null, _e = 1, Hw(t, r, s, u);
    } finally {
      Ct.transition = p, _e = u;
    }
    return null;
  }
  function Hw(t, r, s, u) {
    do
      Br();
    while (Mn !== null);
    if ((ye & 6) !== 0) throw Error(i(327));
    s = t.finishedWork;
    var p = t.finishedLanes;
    if (s === null) return null;
    if (t.finishedWork = null, t.finishedLanes = 0, s === t.current) throw Error(i(177));
    t.callbackNode = null, t.callbackPriority = 0;
    var m = s.lanes | s.childLanes;
    if (kS(t, m), t === He && (Le = He = null, Ye = 0), (s.subtreeFlags & 2064) === 0 && (s.flags & 2064) === 0 || Ss || (Ss = !0, Eh(Po, function() {
      return Br(), null;
    })), m = (s.flags & 15990) !== 0, (s.subtreeFlags & 15990) !== 0 || m) {
      m = Ct.transition, Ct.transition = null;
      var x = _e;
      _e = 1;
      var P = ye;
      ye |= 4, uu.current = null, Lw(t, s), hh(s, t), cw(vl), Io = !!gl, vl = gl = null, t.current = s, Vw(s), mS(), ye = P, _e = x, Ct.transition = m;
    } else t.current = s;
    if (Ss && (Ss = !1, Mn = t, ws = p), m = t.pendingLanes, m === 0 && (En = null), vS(s.stateNode), dt(t, Oe()), r !== null) for (u = t.onRecoverableError, s = 0; s < r.length; s++) p = r[s], u(p.value, { componentStack: p.stack, digest: p.digest });
    if (vs) throw vs = !1, t = fu, fu = null, t;
    return (ws & 1) !== 0 && t.tag !== 0 && Br(), m = t.pendingLanes, (m & 1) !== 0 ? t === pu ? Hi++ : (Hi = 0, pu = t) : Hi = 0, kn(), null;
  }
  function Br() {
    if (Mn !== null) {
      var t = ff(ws), r = Ct.transition, s = _e;
      try {
        if (Ct.transition = null, _e = 16 > t ? 16 : t, Mn === null) var u = !1;
        else {
          if (t = Mn, Mn = null, ws = 0, (ye & 6) !== 0) throw Error(i(331));
          var p = ye;
          for (ye |= 4, q = t.current; q !== null; ) {
            var m = q, x = m.child;
            if ((q.flags & 16) !== 0) {
              var P = m.deletions;
              if (P !== null) {
                for (var E = 0; E < P.length; E++) {
                  var O = P[E];
                  for (q = O; q !== null; ) {
                    var B = q;
                    switch (B.tag) {
                      case 0:
                      case 11:
                      case 15:
                        zi(8, B, m);
                    }
                    var U = B.child;
                    if (U !== null) U.return = B, q = U;
                    else for (; q !== null; ) {
                      B = q;
                      var V = B.sibling, J = B.return;
                      if (uh(B), B === O) {
                        q = null;
                        break;
                      }
                      if (V !== null) {
                        V.return = J, q = V;
                        break;
                      }
                      q = J;
                    }
                  }
                }
                var ne = m.alternate;
                if (ne !== null) {
                  var ie = ne.child;
                  if (ie !== null) {
                    ne.child = null;
                    do {
                      var je = ie.sibling;
                      ie.sibling = null, ie = je;
                    } while (ie !== null);
                  }
                }
                q = m;
              }
            }
            if ((m.subtreeFlags & 2064) !== 0 && x !== null) x.return = m, q = x;
            else e: for (; q !== null; ) {
              if (m = q, (m.flags & 2048) !== 0) switch (m.tag) {
                case 0:
                case 11:
                case 15:
                  zi(9, m, m.return);
              }
              var I = m.sibling;
              if (I !== null) {
                I.return = m.return, q = I;
                break e;
              }
              q = m.return;
            }
          }
          var b = t.current;
          for (q = b; q !== null; ) {
            x = q;
            var F = x.child;
            if ((x.subtreeFlags & 2064) !== 0 && F !== null) F.return = x, q = F;
            else e: for (x = b; q !== null; ) {
              if (P = q, (P.flags & 2048) !== 0) try {
                switch (P.tag) {
                  case 0:
                  case 11:
                  case 15:
                    ms(9, P);
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
          if (ye = p, kn(), Ht && typeof Ht.onPostCommitFiberRoot == "function") try {
            Ht.onPostCommitFiberRoot(Eo, t);
          } catch {
          }
          u = !0;
        }
        return u;
      } finally {
        _e = s, Ct.transition = r;
      }
    }
    return !1;
  }
  function Ah(t, r, s) {
    r = Or(s, r), r = $p(t, r, 1), t = Cn(t, r, 1), r = rt(), t !== null && (hi(t, 1, r), dt(t, r));
  }
  function Fe(t, r, s) {
    if (t.tag === 3) Ah(t, t, s);
    else for (; r !== null; ) {
      if (r.tag === 3) {
        Ah(r, t, s);
        break;
      } else if (r.tag === 1) {
        var u = r.stateNode;
        if (typeof r.type.getDerivedStateFromError == "function" || typeof u.componentDidCatch == "function" && (En === null || !En.has(u))) {
          t = Or(s, t), t = Hp(r, t, 1), r = Cn(r, t, 1), t = rt(), r !== null && (hi(r, 1, t), dt(r, t));
          break;
        }
      }
      r = r.return;
    }
  }
  function Ww(t, r, s) {
    var u = t.pingCache;
    u !== null && u.delete(r), r = rt(), t.pingedLanes |= t.suspendedLanes & s, He === t && (Ye & s) === s && (ze === 4 || ze === 3 && (Ye & 130023424) === Ye && 500 > Oe() - du ? er(t, 0) : cu |= s), dt(t, r);
  }
  function Ch(t, r) {
    r === 0 && ((t.mode & 1) === 0 ? r = 1 : (r = bo, bo <<= 1, (bo & 130023424) === 0 && (bo = 4194304)));
    var s = rt();
    t = an(t, r), t !== null && (hi(t, r, s), dt(t, s));
  }
  function Gw(t) {
    var r = t.memoizedState, s = 0;
    r !== null && (s = r.retryLane), Ch(t, s);
  }
  function Kw(t, r) {
    var s = 0;
    switch (t.tag) {
      case 13:
        var u = t.stateNode, p = t.memoizedState;
        p !== null && (s = p.retryLane);
        break;
      case 19:
        u = t.stateNode;
        break;
      default:
        throw Error(i(314));
    }
    u !== null && u.delete(r), Ch(t, s);
  }
  var Ph;
  Ph = function(t, r, s) {
    if (t !== null) if (t.memoizedProps !== r.pendingProps || at.current) ut = !0;
    else {
      if ((t.lanes & s) === 0 && (r.flags & 128) === 0) return ut = !1, Iw(t, r, s);
      ut = (t.flags & 131072) !== 0;
    }
    else ut = !1, Re && (r.flags & 1048576) !== 0 && sp(r, Jo, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var u = r.type;
        ps(t, r), t = r.pendingProps;
        var p = Er(r, Ze.current);
        Ir(r, s), p = Ul(null, r, u, t, p, s);
        var m = $l();
        return r.flags |= 1, typeof p == "object" && p !== null && typeof p.render == "function" && p.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, lt(u) ? (m = !0, Qo(r)) : m = !1, r.memoizedState = p.state !== null && p.state !== void 0 ? p.state : null, Fl(r), p.updater = ds, r.stateNode = p, p._reactInternals = r, Ql(r, u, t, s), r = ql(null, r, u, !0, m, s)) : (r.tag = 0, Re && m && Al(r), nt(null, r, p, s), r = r.child), r;
      case 16:
        u = r.elementType;
        e: {
          switch (ps(t, r), t = r.pendingProps, p = u._init, u = p(u._payload), r.type = u, p = r.tag = Qw(u), t = It(u, t), p) {
            case 0:
              r = Jl(null, r, u, t, s);
              break e;
            case 1:
              r = qp(null, r, u, t, s);
              break e;
            case 11:
              r = Yp(null, r, u, t, s);
              break e;
            case 14:
              r = Qp(null, r, u, It(u.type, t), s);
              break e;
          }
          throw Error(i(
            306,
            u,
            ""
          ));
        }
        return r;
      case 0:
        return u = r.type, p = r.pendingProps, p = r.elementType === u ? p : It(u, p), Jl(t, r, u, p, s);
      case 1:
        return u = r.type, p = r.pendingProps, p = r.elementType === u ? p : It(u, p), qp(t, r, u, p, s);
      case 3:
        e: {
          if (eh(r), t === null) throw Error(i(387));
          u = r.pendingProps, m = r.memoizedState, p = m.element, mp(t, r), is(r, u, null, s);
          var x = r.memoizedState;
          if (u = x.element, m.isDehydrated) if (m = { element: u, isDehydrated: !1, cache: x.cache, pendingSuspenseBoundaries: x.pendingSuspenseBoundaries, transitions: x.transitions }, r.updateQueue.baseState = m, r.memoizedState = m, r.flags & 256) {
            p = Or(Error(i(423)), r), r = th(t, r, u, s, p);
            break e;
          } else if (u !== p) {
            p = Or(Error(i(424)), r), r = th(t, r, u, s, p);
            break e;
          } else for (wt = xn(r.stateNode.containerInfo.firstChild), St = r, Re = !0, Nt = null, s = pp(r, null, u, s), r.child = s; s; ) s.flags = s.flags & -3 | 4096, s = s.sibling;
          else {
            if (Rr(), u === p) {
              r = un(t, r, s);
              break e;
            }
            nt(t, r, u, s);
          }
          r = r.child;
        }
        return r;
      case 5:
        return vp(r), t === null && El(r), u = r.type, p = r.pendingProps, m = t !== null ? t.memoizedProps : null, x = p.children, Sl(u, p) ? x = null : m !== null && Sl(u, m) && (r.flags |= 32), Jp(t, r), nt(t, r, x, s), r.child;
      case 6:
        return t === null && El(r), null;
      case 13:
        return nh(t, r, s);
      case 4:
        return Ol(r, r.stateNode.containerInfo), u = r.pendingProps, t === null ? r.child = Dr(r, null, u, s) : nt(t, r, u, s), r.child;
      case 11:
        return u = r.type, p = r.pendingProps, p = r.elementType === u ? p : It(u, p), Yp(t, r, u, p, s);
      case 7:
        return nt(t, r, r.pendingProps, s), r.child;
      case 8:
        return nt(t, r, r.pendingProps.children, s), r.child;
      case 12:
        return nt(t, r, r.pendingProps.children, s), r.child;
      case 10:
        e: {
          if (u = r.type._context, p = r.pendingProps, m = r.memoizedProps, x = p.value, Pe(ts, u._currentValue), u._currentValue = x, m !== null) if (Dt(m.value, x)) {
            if (m.children === p.children && !at.current) {
              r = un(t, r, s);
              break e;
            }
          } else for (m = r.child, m !== null && (m.return = r); m !== null; ) {
            var P = m.dependencies;
            if (P !== null) {
              x = m.child;
              for (var E = P.firstContext; E !== null; ) {
                if (E.context === u) {
                  if (m.tag === 1) {
                    E = ln(-1, s & -s), E.tag = 2;
                    var O = m.updateQueue;
                    if (O !== null) {
                      O = O.shared;
                      var B = O.pending;
                      B === null ? E.next = E : (E.next = B.next, B.next = E), O.pending = E;
                    }
                  }
                  m.lanes |= s, E = m.alternate, E !== null && (E.lanes |= s), Nl(
                    m.return,
                    s,
                    r
                  ), P.lanes |= s;
                  break;
                }
                E = E.next;
              }
            } else if (m.tag === 10) x = m.type === r.type ? null : m.child;
            else if (m.tag === 18) {
              if (x = m.return, x === null) throw Error(i(341));
              x.lanes |= s, P = x.alternate, P !== null && (P.lanes |= s), Nl(x, s, r), x = m.sibling;
            } else x = m.child;
            if (x !== null) x.return = m;
            else for (x = m; x !== null; ) {
              if (x === r) {
                x = null;
                break;
              }
              if (m = x.sibling, m !== null) {
                m.return = x.return, x = m;
                break;
              }
              x = x.return;
            }
            m = x;
          }
          nt(t, r, p.children, s), r = r.child;
        }
        return r;
      case 9:
        return p = r.type, u = r.pendingProps.children, Ir(r, s), p = kt(p), u = u(p), r.flags |= 1, nt(t, r, u, s), r.child;
      case 14:
        return u = r.type, p = It(u, r.pendingProps), p = It(u.type, p), Qp(t, r, u, p, s);
      case 15:
        return Xp(t, r, r.type, r.pendingProps, s);
      case 17:
        return u = r.type, p = r.pendingProps, p = r.elementType === u ? p : It(u, p), ps(t, r), r.tag = 1, lt(u) ? (t = !0, Qo(r)) : t = !1, Ir(r, s), zp(r, u, p), Ql(r, u, p, s), ql(null, r, u, !0, t, s);
      case 19:
        return ih(t, r, s);
      case 22:
        return Zp(t, r, s);
    }
    throw Error(i(156, r.tag));
  };
  function Eh(t, r) {
    return af(t, r);
  }
  function Yw(t, r, s, u) {
    this.tag = t, this.key = s, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = u, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Pt(t, r, s, u) {
    return new Yw(t, r, s, u);
  }
  function Su(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function Qw(t) {
    if (typeof t == "function") return Su(t) ? 1 : 0;
    if (t != null) {
      if (t = t.$$typeof, t === de) return 11;
      if (t === we) return 14;
    }
    return 2;
  }
  function Dn(t, r) {
    var s = t.alternate;
    return s === null ? (s = Pt(t.tag, r, t.key, t.mode), s.elementType = t.elementType, s.type = t.type, s.stateNode = t.stateNode, s.alternate = t, t.alternate = s) : (s.pendingProps = r, s.type = t.type, s.flags = 0, s.subtreeFlags = 0, s.deletions = null), s.flags = t.flags & 14680064, s.childLanes = t.childLanes, s.lanes = t.lanes, s.child = t.child, s.memoizedProps = t.memoizedProps, s.memoizedState = t.memoizedState, s.updateQueue = t.updateQueue, r = t.dependencies, s.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, s.sibling = t.sibling, s.index = t.index, s.ref = t.ref, s;
  }
  function ks(t, r, s, u, p, m) {
    var x = 2;
    if (u = t, typeof t == "function") Su(t) && (x = 1);
    else if (typeof t == "string") x = 5;
    else e: switch (t) {
      case K:
        return nr(s.children, p, m, r);
      case $:
        x = 8, p |= 8;
        break;
      case W:
        return t = Pt(12, s, r, p | 2), t.elementType = W, t.lanes = m, t;
      case he:
        return t = Pt(13, s, r, p), t.elementType = he, t.lanes = m, t;
      case Q:
        return t = Pt(19, s, r, p), t.elementType = Q, t.lanes = m, t;
      case me:
        return As(s, p, m, r);
      default:
        if (typeof t == "object" && t !== null) switch (t.$$typeof) {
          case X:
            x = 10;
            break e;
          case te:
            x = 9;
            break e;
          case de:
            x = 11;
            break e;
          case we:
            x = 14;
            break e;
          case ce:
            x = 16, u = null;
            break e;
        }
        throw Error(i(130, t == null ? t : typeof t, ""));
    }
    return r = Pt(x, s, r, p), r.elementType = t, r.type = u, r.lanes = m, r;
  }
  function nr(t, r, s, u) {
    return t = Pt(7, t, u, r), t.lanes = s, t;
  }
  function As(t, r, s, u) {
    return t = Pt(22, t, u, r), t.elementType = me, t.lanes = s, t.stateNode = { isHidden: !1 }, t;
  }
  function wu(t, r, s) {
    return t = Pt(6, t, null, r), t.lanes = s, t;
  }
  function xu(t, r, s) {
    return r = Pt(4, t.children !== null ? t.children : [], t.key, r), r.lanes = s, r.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, r;
  }
  function Xw(t, r, s, u, p) {
    this.tag = r, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Ya(0), this.expirationTimes = Ya(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ya(0), this.identifierPrefix = u, this.onRecoverableError = p, this.mutableSourceEagerHydrationData = null;
  }
  function _u(t, r, s, u, p, m, x, P, E) {
    return t = new Xw(t, r, s, P, E), r === 1 ? (r = 1, m === !0 && (r |= 8)) : r = 0, m = Pt(3, null, null, r), t.current = m, m.stateNode = t, m.memoizedState = { element: u, isDehydrated: s, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Fl(m), t;
  }
  function Zw(t, r, s) {
    var u = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: G, key: u == null ? null : "" + u, children: t, containerInfo: r, implementation: s };
  }
  function Mh(t) {
    if (!t) return Tn;
    t = t._reactInternals;
    e: {
      if (Hn(t) !== t || t.tag !== 1) throw Error(i(170));
      var r = t;
      do {
        switch (r.tag) {
          case 3:
            r = r.stateNode.context;
            break e;
          case 1:
            if (lt(r.type)) {
              r = r.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        r = r.return;
      } while (r !== null);
      throw Error(i(171));
    }
    if (t.tag === 1) {
      var s = t.type;
      if (lt(s)) return rp(t, s, r);
    }
    return r;
  }
  function bh(t, r, s, u, p, m, x, P, E) {
    return t = _u(s, u, !0, t, p, m, x, P, E), t.context = Mh(null), s = t.current, u = rt(), p = bn(s), m = ln(u, p), m.callback = r ?? null, Cn(s, m, p), t.current.lanes = p, hi(t, p, u), dt(t, u), t;
  }
  function Cs(t, r, s, u) {
    var p = r.current, m = rt(), x = bn(p);
    return s = Mh(s), r.context === null ? r.context = s : r.pendingContext = s, r = ln(m, x), r.payload = { element: t }, u = u === void 0 ? null : u, u !== null && (r.callback = u), t = Cn(p, r, x), t !== null && (jt(t, p, x, m), rs(t, p, x)), x;
  }
  function Ps(t) {
    if (t = t.current, !t.child) return null;
    switch (t.child.tag) {
      case 5:
        return t.child.stateNode;
      default:
        return t.child.stateNode;
    }
  }
  function Rh(t, r) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var s = t.retryLane;
      t.retryLane = s !== 0 && s < r ? s : r;
    }
  }
  function Tu(t, r) {
    Rh(t, r), (t = t.alternate) && Rh(t, r);
  }
  function Jw() {
    return null;
  }
  var Dh = typeof reportError == "function" ? reportError : function(t) {
    console.error(t);
  };
  function ku(t) {
    this._internalRoot = t;
  }
  Es.prototype.render = ku.prototype.render = function(t) {
    var r = this._internalRoot;
    if (r === null) throw Error(i(409));
    Cs(t, r, null, null);
  }, Es.prototype.unmount = ku.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var r = t.containerInfo;
      qn(function() {
        Cs(null, t, null, null);
      }), r[nn] = null;
    }
  };
  function Es(t) {
    this._internalRoot = t;
  }
  Es.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var r = mf();
      t = { blockedOn: null, target: t, priority: r };
      for (var s = 0; s < vn.length && r !== 0 && r < vn[s].priority; s++) ;
      vn.splice(s, 0, t), s === 0 && vf(t);
    }
  };
  function Au(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function Ms(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11 && (t.nodeType !== 8 || t.nodeValue !== " react-mount-point-unstable "));
  }
  function Nh() {
  }
  function qw(t, r, s, u, p) {
    if (p) {
      if (typeof u == "function") {
        var m = u;
        u = function() {
          var O = Ps(x);
          m.call(O);
        };
      }
      var x = bh(r, u, t, 0, null, !1, !1, "", Nh);
      return t._reactRootContainer = x, t[nn] = x.current, Ei(t.nodeType === 8 ? t.parentNode : t), qn(), x;
    }
    for (; p = t.lastChild; ) t.removeChild(p);
    if (typeof u == "function") {
      var P = u;
      u = function() {
        var O = Ps(E);
        P.call(O);
      };
    }
    var E = _u(t, 0, !1, null, null, !1, !1, "", Nh);
    return t._reactRootContainer = E, t[nn] = E.current, Ei(t.nodeType === 8 ? t.parentNode : t), qn(function() {
      Cs(r, E, s, u);
    }), E;
  }
  function bs(t, r, s, u, p) {
    var m = s._reactRootContainer;
    if (m) {
      var x = m;
      if (typeof p == "function") {
        var P = p;
        p = function() {
          var E = Ps(x);
          P.call(E);
        };
      }
      Cs(r, x, t, p);
    } else x = qw(s, r, t, p, u);
    return Ps(x);
  }
  pf = function(t) {
    switch (t.tag) {
      case 3:
        var r = t.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var s = pi(r.pendingLanes);
          s !== 0 && (Qa(r, s | 1), dt(r, Oe()), (ye & 6) === 0 && (Vr = Oe() + 500, kn()));
        }
        break;
      case 13:
        qn(function() {
          var u = an(t, 1);
          if (u !== null) {
            var p = rt();
            jt(u, t, 1, p);
          }
        }), Tu(t, 1);
    }
  }, Xa = function(t) {
    if (t.tag === 13) {
      var r = an(t, 134217728);
      if (r !== null) {
        var s = rt();
        jt(r, t, 134217728, s);
      }
      Tu(t, 134217728);
    }
  }, hf = function(t) {
    if (t.tag === 13) {
      var r = bn(t), s = an(t, r);
      if (s !== null) {
        var u = rt();
        jt(s, t, r, u);
      }
      Tu(t, r);
    }
  }, mf = function() {
    return _e;
  }, yf = function(t, r) {
    var s = _e;
    try {
      return _e = t, r();
    } finally {
      _e = s;
    }
  }, Ua = function(t, r, s) {
    switch (r) {
      case "input":
        if (Ia(t, s), r = s.name, s.type === "radio" && r != null) {
          for (s = t; s.parentNode; ) s = s.parentNode;
          for (s = s.querySelectorAll("input[name=" + JSON.stringify("" + r) + '][type="radio"]'), r = 0; r < s.length; r++) {
            var u = s[r];
            if (u !== t && u.form === t.form) {
              var p = Ko(u);
              if (!p) throw Error(i(90));
              Vd(u), Ia(u, p);
            }
          }
        }
        break;
      case "textarea":
        Hd(t, s);
        break;
      case "select":
        r = s.value, r != null && yr(t, !!s.multiple, r, !1);
    }
  }, qd = yu, ef = qn;
  var ex = { usingClientEntryPoint: !1, Events: [Ri, Cr, Ko, Zd, Jd, yu] }, Wi = { findFiberByHostInstance: Wn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, tx = { bundleType: Wi.bundleType, version: Wi.version, rendererPackageName: Wi.rendererPackageName, rendererConfig: Wi.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: D.ReactCurrentDispatcher, findHostInstanceByFiber: function(t) {
    return t = of(t), t === null ? null : t.stateNode;
  }, findFiberByHostInstance: Wi.findFiberByHostInstance || Jw, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Rs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Rs.isDisabled && Rs.supportsFiber) try {
      Eo = Rs.inject(tx), Ht = Rs;
    } catch {
    }
  }
  return ft.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ex, ft.createPortal = function(t, r) {
    var s = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Au(r)) throw Error(i(200));
    return Zw(t, r, null, s);
  }, ft.createRoot = function(t, r) {
    if (!Au(t)) throw Error(i(299));
    var s = !1, u = "", p = Dh;
    return r != null && (r.unstable_strictMode === !0 && (s = !0), r.identifierPrefix !== void 0 && (u = r.identifierPrefix), r.onRecoverableError !== void 0 && (p = r.onRecoverableError)), r = _u(t, 1, !1, null, null, s, !1, u, p), t[nn] = r.current, Ei(t.nodeType === 8 ? t.parentNode : t), new ku(r);
  }, ft.findDOMNode = function(t) {
    if (t == null) return null;
    if (t.nodeType === 1) return t;
    var r = t._reactInternals;
    if (r === void 0)
      throw typeof t.render == "function" ? Error(i(188)) : (t = Object.keys(t).join(","), Error(i(268, t)));
    return t = of(r), t = t === null ? null : t.stateNode, t;
  }, ft.flushSync = function(t) {
    return qn(t);
  }, ft.hydrate = function(t, r, s) {
    if (!Ms(r)) throw Error(i(200));
    return bs(null, t, r, !0, s);
  }, ft.hydrateRoot = function(t, r, s) {
    if (!Au(t)) throw Error(i(405));
    var u = s != null && s.hydratedSources || null, p = !1, m = "", x = Dh;
    if (s != null && (s.unstable_strictMode === !0 && (p = !0), s.identifierPrefix !== void 0 && (m = s.identifierPrefix), s.onRecoverableError !== void 0 && (x = s.onRecoverableError)), r = bh(r, null, t, 1, s ?? null, p, !1, m, x), t[nn] = r.current, Ei(t), u) for (t = 0; t < u.length; t++) s = u[t], p = s._getVersion, p = p(s._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [s, p] : r.mutableSourceEagerHydrationData.push(
      s,
      p
    );
    return new Es(r);
  }, ft.render = function(t, r, s) {
    if (!Ms(r)) throw Error(i(200));
    return bs(null, t, r, !1, s);
  }, ft.unmountComponentAtNode = function(t) {
    if (!Ms(t)) throw Error(i(40));
    return t._reactRootContainer ? (qn(function() {
      bs(null, null, t, !1, function() {
        t._reactRootContainer = null, t[nn] = null;
      });
    }), !0) : !1;
  }, ft.unstable_batchedUpdates = yu, ft.unstable_renderSubtreeIntoContainer = function(t, r, s, u) {
    if (!Ms(s)) throw Error(i(200));
    if (t == null || t._reactInternals === void 0) throw Error(i(38));
    return bs(t, r, s, !1, u);
  }, ft.version = "18.3.1-next-f1338f8080-20240426", ft;
}
var Uh;
function Gy() {
  if (Uh) return Pu.exports;
  Uh = 1;
  function e() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (n) {
        console.error(n);
      }
  }
  return e(), Pu.exports = fx(), Pu.exports;
}
var $h;
function px() {
  if ($h) return Ns;
  $h = 1;
  var e = Gy();
  return Ns.createRoot = e.createRoot, Ns.hydrateRoot = e.hydrateRoot, Ns;
}
var hx = px(), bu = { exports: {} }, Ki = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Hh;
function mx() {
  if (Hh) return Ki;
  Hh = 1;
  var e = Gc(), n = Symbol.for("react.element"), i = Symbol.for("react.fragment"), o = Object.prototype.hasOwnProperty, a = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function d(f, y, g) {
    var v, l = {}, h = null, S = null;
    g !== void 0 && (h = "" + g), y.key !== void 0 && (h = "" + y.key), y.ref !== void 0 && (S = y.ref);
    for (v in y) o.call(y, v) && !c.hasOwnProperty(v) && (l[v] = y[v]);
    if (f && f.defaultProps) for (v in y = f.defaultProps, y) l[v] === void 0 && (l[v] = y[v]);
    return { $$typeof: n, type: f, key: h, ref: S, props: l, _owner: a.current };
  }
  return Ki.Fragment = i, Ki.jsx = d, Ki.jsxs = d, Ki;
}
var Wh;
function yx() {
  return Wh || (Wh = 1, bu.exports = mx()), bu.exports;
}
var k = yx();
const Gh = (e) => Symbol.iterator in e, Kh = (e) => (
  // HACK: avoid checking entries type
  "entries" in e
), Yh = (e, n) => {
  const i = e instanceof Map ? e : new Map(e.entries()), o = n instanceof Map ? n : new Map(n.entries());
  if (i.size !== o.size)
    return !1;
  for (const [a, c] of i)
    if (!o.has(a) || !Object.is(c, o.get(a)))
      return !1;
  return !0;
}, gx = (e, n) => {
  const i = e[Symbol.iterator](), o = n[Symbol.iterator]();
  let a = i.next(), c = o.next();
  for (; !a.done && !c.done; ) {
    if (!Object.is(a.value, c.value))
      return !1;
    a = i.next(), c = o.next();
  }
  return !!a.done && !!c.done;
};
function vx(e, n) {
  return Object.is(e, n) ? !0 : typeof e != "object" || e === null || typeof n != "object" || n === null || Object.getPrototypeOf(e) !== Object.getPrototypeOf(n) ? !1 : Gh(e) && Gh(n) ? Kh(e) && Kh(n) ? Yh(e, n) : gx(e, n) : Yh(
    { entries: () => Object.entries(e) },
    { entries: () => Object.entries(n) }
  );
}
function Sx(e) {
  const n = hn.useRef(void 0);
  return (i) => {
    const o = e(i);
    return vx(n.current, o) ? n.current : n.current = o;
  };
}
const Yc = C.createContext({});
function Qc(e) {
  const n = C.useRef(null);
  return n.current === null && (n.current = e()), n.current;
}
const wx = typeof window < "u", Xc = wx ? C.useLayoutEffect : C.useEffect, _a = /* @__PURE__ */ C.createContext(null);
function Zc(e, n) {
  e.indexOf(n) === -1 && e.push(n);
}
function oa(e, n) {
  const i = e.indexOf(n);
  i > -1 && e.splice(i, 1);
}
const tn = (e, n, i) => i > n ? n : i < e ? e : i;
function Qh(e, n) {
  return n ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${n}` : e;
}
let yo = () => {
}, pr = () => {
};
var By;
typeof process < "u" && ((By = process.env) == null ? void 0 : By.NODE_ENV) !== "production" && (yo = (e, n, i) => {
  !e && typeof console < "u" && console.warn(Qh(n, i));
}, pr = (e, n, i) => {
  if (!e)
    throw new Error(Qh(n, i));
});
const Bn = {}, Ky = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), Yy = (e) => typeof e == "object" && e !== null, Qy = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function Xy(e) {
  let n;
  return () => (n === void 0 && (n = e()), n);
}
const bt = /* @__NO_SIDE_EFFECTS__ */ (e) => e, go = (...e) => e.reduce((n, i) => (o) => i(n(o))), so = /* @__NO_SIDE_EFFECTS__ */ (e, n, i) => {
  const o = n - e;
  return o ? (i - e) / o : 1;
};
class Jc {
  constructor() {
    this.subscriptions = [];
  }
  add(n) {
    return Zc(this.subscriptions, n), () => oa(this.subscriptions, n);
  }
  notify(n, i, o) {
    const a = this.subscriptions.length;
    if (a)
      if (a === 1)
        this.subscriptions[0](n, i, o);
      else
        for (let c = 0; c < a; c++) {
          const d = this.subscriptions[c];
          d && d(n, i, o);
        }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
const mt = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, Mt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, Zy = /* @__NO_SIDE_EFFECTS__ */ (e, n) => n ? e * (1e3 / n) : 0, Jy = (e, n, i) => (((1 - 3 * i + 3 * n) * e + (3 * i - 6 * n)) * e + 3 * n) * e, xx = 1e-7, _x = 12;
function Tx(e, n, i, o, a) {
  let c, d, f = 0;
  do
    d = n + (i - n) / 2, c = Jy(d, o, a) - e, c > 0 ? i = d : n = d;
  while (Math.abs(c) > xx && ++f < _x);
  return d;
}
// @__NO_SIDE_EFFECTS__
function vo(e, n, i, o) {
  if (e === n && i === o)
    return bt;
  const a = (c) => Tx(c, 0, 1, e, i);
  return (c) => c === 0 || c === 1 ? c : Jy(a(c), n, o);
}
const qy = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => n <= 0.5 ? e(2 * n) / 2 : (2 - e(2 * (1 - n))) / 2, eg = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => 1 - e(1 - n), tg = /* @__PURE__ */ vo(0.33, 1.53, 0.69, 0.99), qc = /* @__PURE__ */ eg(tg), ng = /* @__PURE__ */ qy(qc), rg = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * qc(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), ed = (e) => 1 - Math.sin(Math.acos(e)), ig = /* @__PURE__ */ eg(ed), og = /* @__PURE__ */ qy(ed), kx = /* @__PURE__ */ vo(0.42, 0, 1, 1), Ax = /* @__PURE__ */ vo(0, 0, 0.58, 1), sg = /* @__PURE__ */ vo(0.42, 0, 0.58, 1), Cx = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number", ag = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", Xh = {
  linear: bt,
  easeIn: kx,
  easeInOut: sg,
  easeOut: Ax,
  circIn: ed,
  circInOut: og,
  circOut: ig,
  backIn: qc,
  backInOut: ng,
  backOut: tg,
  anticipate: rg
}, Px = (e) => typeof e == "string", Zh = (e) => {
  if (/* @__PURE__ */ ag(e)) {
    pr(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [n, i, o, a] = e;
    return /* @__PURE__ */ vo(n, i, o, a);
  } else if (Px(e))
    return pr(Xh[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), Xh[e];
  return e;
}, Is = [
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
function Ex(e) {
  let n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), o = !1, a = !1;
  const c = /* @__PURE__ */ new WeakSet();
  let d = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function f(g) {
    c.has(g) && (y.schedule(g), e()), g(d);
  }
  const y = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (g, v = !1, l = !1) => {
      const S = l && o ? n : i;
      return v && c.add(g), S.add(g), g;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (g) => {
      i.delete(g), c.delete(g);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (g) => {
      if (d = g, o) {
        a = !0;
        return;
      }
      o = !0;
      const v = n;
      n = i, i = v, n.forEach(f), n.clear(), o = !1, a && (a = !1, y.process(g));
    }
  };
  return y;
}
const Mx = 40;
function lg(e, n) {
  let i = !1, o = !0;
  const a = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, c = () => i = !0, d = Is.reduce((R, D) => (R[D] = Ex(c), R), {}), { setup: f, read: y, resolveKeyframes: g, preUpdate: v, update: l, preRender: h, render: S, postRender: w } = d, _ = () => {
    const R = Bn.useManualTiming, D = R ? a.timestamp : performance.now();
    i = !1, R || (a.delta = o ? 1e3 / 60 : Math.max(Math.min(D - a.timestamp, Mx), 1)), a.timestamp = D, a.isProcessing = !0, f.process(a), y.process(a), g.process(a), v.process(a), l.process(a), h.process(a), S.process(a), w.process(a), a.isProcessing = !1, i && n && (o = !1, e(_));
  }, A = () => {
    i = !0, o = !0, a.isProcessing || e(_);
  };
  return { schedule: Is.reduce((R, D) => {
    const j = d[D];
    return R[D] = (G, K = !1, $ = !1) => (i || A(), j.schedule(G, K, $)), R;
  }, {}), cancel: (R) => {
    for (let D = 0; D < Is.length; D++)
      d[Is[D]].cancel(R);
  }, state: a, steps: d };
}
const { schedule: Ae, cancel: zn, state: Qe, steps: Ru } = /* @__PURE__ */ lg(typeof requestAnimationFrame < "u" ? requestAnimationFrame : bt, !0);
let Gs;
function bx() {
  Gs = void 0;
}
const it = {
  now: () => (Gs === void 0 && it.set(Qe.isProcessing || Bn.useManualTiming ? Qe.timestamp : performance.now()), Gs),
  set: (e) => {
    Gs = e, queueMicrotask(bx);
  }
}, ug = (e) => (n) => typeof n == "string" && n.startsWith(e), cg = /* @__PURE__ */ ug("--"), Rx = /* @__PURE__ */ ug("var(--"), td = (e) => Rx(e) ? Dx.test(e.split("/*")[0].trim()) : !1, Dx = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function Jh(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
const ri = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, ao = {
  ...ri,
  transform: (e) => tn(0, 1, e)
}, Fs = {
  ...ri,
  default: 1
}, qi = (e) => Math.round(e * 1e5) / 1e5, nd = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function Nx(e) {
  return e == null;
}
const Ix = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, rd = (e, n) => (i) => !!(typeof i == "string" && Ix.test(i) && i.startsWith(e) || n && !Nx(i) && Object.prototype.hasOwnProperty.call(i, n)), dg = (e, n, i) => (o) => {
  if (typeof o != "string")
    return o;
  const [a, c, d, f] = o.match(nd);
  return {
    [e]: parseFloat(a),
    [n]: parseFloat(c),
    [i]: parseFloat(d),
    alpha: f !== void 0 ? parseFloat(f) : 1
  };
}, Fx = (e) => tn(0, 255, e), Du = {
  ...ri,
  transform: (e) => Math.round(Fx(e))
}, ar = {
  test: /* @__PURE__ */ rd("rgb", "red"),
  parse: /* @__PURE__ */ dg("red", "green", "blue"),
  transform: ({ red: e, green: n, blue: i, alpha: o = 1 }) => "rgba(" + Du.transform(e) + ", " + Du.transform(n) + ", " + Du.transform(i) + ", " + qi(ao.transform(o)) + ")"
};
function Ox(e) {
  let n = "", i = "", o = "", a = "";
  return e.length > 5 ? (n = e.substring(1, 3), i = e.substring(3, 5), o = e.substring(5, 7), a = e.substring(7, 9)) : (n = e.substring(1, 2), i = e.substring(2, 3), o = e.substring(3, 4), a = e.substring(4, 5), n += n, i += i, o += o, a += a), {
    red: parseInt(n, 16),
    green: parseInt(i, 16),
    blue: parseInt(o, 16),
    alpha: a ? parseInt(a, 16) / 255 : 1
  };
}
const ic = {
  test: /* @__PURE__ */ rd("#"),
  parse: Ox,
  transform: ar.transform
}, So = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (n) => typeof n == "string" && n.endsWith(e) && n.split(" ").length === 1,
  parse: parseFloat,
  transform: (n) => `${n}${e}`
}), pn = /* @__PURE__ */ So("deg"), en = /* @__PURE__ */ So("%"), re = /* @__PURE__ */ So("px"), jx = /* @__PURE__ */ So("vh"), Lx = /* @__PURE__ */ So("vw"), qh = {
  ...en,
  parse: (e) => en.parse(e) / 100,
  transform: (e) => en.transform(e * 100)
}, Gr = {
  test: /* @__PURE__ */ rd("hsl", "hue"),
  parse: /* @__PURE__ */ dg("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: n, lightness: i, alpha: o = 1 }) => "hsla(" + Math.round(e) + ", " + en.transform(qi(n)) + ", " + en.transform(qi(i)) + ", " + qi(ao.transform(o)) + ")"
}, Ve = {
  test: (e) => ar.test(e) || ic.test(e) || Gr.test(e),
  parse: (e) => ar.test(e) ? ar.parse(e) : Gr.test(e) ? Gr.parse(e) : ic.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? ar.transform(e) : Gr.transform(e),
  getAnimatableNone: (e) => {
    const n = Ve.parse(e);
    return n.alpha = 0, Ve.transform(n);
  }
}, Vx = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function Bx(e) {
  var n, i;
  return isNaN(e) && typeof e == "string" && (((n = e.match(nd)) == null ? void 0 : n.length) || 0) + (((i = e.match(Vx)) == null ? void 0 : i.length) || 0) > 0;
}
const fg = "number", pg = "color", zx = "var", Ux = "var(", em = "${}", $x = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Jr(e) {
  const n = e.toString(), i = [], o = {
    color: [],
    number: [],
    var: []
  }, a = [];
  let c = 0;
  const f = n.replace($x, (y) => (Ve.test(y) ? (o.color.push(c), a.push(pg), i.push(Ve.parse(y))) : y.startsWith(Ux) ? (o.var.push(c), a.push(zx), i.push(y)) : (o.number.push(c), a.push(fg), i.push(parseFloat(y))), ++c, em)).split(em);
  return { values: i, split: f, indexes: o, types: a };
}
function Hx(e) {
  return Jr(e).values;
}
function hg({ split: e, types: n }) {
  const i = e.length;
  return (o) => {
    let a = "";
    for (let c = 0; c < i; c++)
      if (a += e[c], o[c] !== void 0) {
        const d = n[c];
        d === fg ? a += qi(o[c]) : d === pg ? a += Ve.transform(o[c]) : a += o[c];
      }
    return a;
  };
}
function Wx(e) {
  return hg(Jr(e));
}
const Gx = (e) => typeof e == "number" ? 0 : Ve.test(e) ? Ve.getAnimatableNone(e) : e, Kx = (e, n) => typeof e == "number" ? n != null && n.trim().endsWith("/") ? e : 0 : Gx(e);
function Yx(e) {
  const n = Jr(e);
  return hg(n)(n.values.map((o, a) => Kx(o, n.split[a])));
}
const Ut = {
  test: Bx,
  parse: Hx,
  createTransformer: Wx,
  getAnimatableNone: Yx
};
function Nu(e, n, i) {
  return i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? e + (n - e) * 6 * i : i < 1 / 2 ? n : i < 2 / 3 ? e + (n - e) * (2 / 3 - i) * 6 : e;
}
function Qx({ hue: e, saturation: n, lightness: i, alpha: o }) {
  e /= 360, n /= 100, i /= 100;
  let a = 0, c = 0, d = 0;
  if (!n)
    a = c = d = i;
  else {
    const f = i < 0.5 ? i * (1 + n) : i + n - i * n, y = 2 * i - f;
    a = Nu(y, f, e + 1 / 3), c = Nu(y, f, e), d = Nu(y, f, e - 1 / 3);
  }
  return {
    red: Math.round(a * 255),
    green: Math.round(c * 255),
    blue: Math.round(d * 255),
    alpha: o
  };
}
function sa(e, n) {
  return (i) => i > 0 ? n : e;
}
const Te = (e, n, i) => e + (n - e) * i, Iu = (e, n, i) => {
  const o = e * e, a = i * (n * n - o) + o;
  return a < 0 ? 0 : Math.sqrt(a);
}, Xx = [ic, ar, Gr], Zx = (e) => Xx.find((n) => n.test(e));
function tm(e) {
  const n = Zx(e);
  if (yo(!!n, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !n)
    return !1;
  let i = n.parse(e);
  return n === Gr && (i = Qx(i)), i;
}
const nm = (e, n) => {
  const i = tm(e), o = tm(n);
  if (!i || !o)
    return sa(e, n);
  const a = { ...i };
  return (c) => (a.red = Iu(i.red, o.red, c), a.green = Iu(i.green, o.green, c), a.blue = Iu(i.blue, o.blue, c), a.alpha = Te(i.alpha, o.alpha, c), ar.transform(a));
}, oc = /* @__PURE__ */ new Set(["none", "hidden"]);
function Jx(e, n) {
  return oc.has(e) ? (i) => i <= 0 ? e : n : (i) => i >= 1 ? n : e;
}
function qx(e, n) {
  return (i) => Te(e, n, i);
}
function id(e) {
  return typeof e == "number" ? qx : typeof e == "string" ? td(e) ? sa : Ve.test(e) ? nm : n_ : Array.isArray(e) ? mg : typeof e == "object" ? Ve.test(e) ? nm : e_ : sa;
}
function mg(e, n) {
  const i = [...e], o = i.length, a = e.map((c, d) => id(c)(c, n[d]));
  return (c) => {
    for (let d = 0; d < o; d++)
      i[d] = a[d](c);
    return i;
  };
}
function e_(e, n) {
  const i = { ...e, ...n }, o = {};
  for (const a in i)
    e[a] !== void 0 && n[a] !== void 0 && (o[a] = id(e[a])(e[a], n[a]));
  return (a) => {
    for (const c in o)
      i[c] = o[c](a);
    return i;
  };
}
function t_(e, n) {
  const i = [], o = { color: 0, var: 0, number: 0 };
  for (let a = 0; a < n.values.length; a++) {
    const c = n.types[a], d = e.indexes[c][o[c]], f = e.values[d] ?? 0;
    i[a] = f, o[c]++;
  }
  return i;
}
const n_ = (e, n) => {
  const i = Ut.createTransformer(n), o = Jr(e), a = Jr(n);
  return o.indexes.var.length === a.indexes.var.length && o.indexes.color.length === a.indexes.color.length && o.indexes.number.length >= a.indexes.number.length ? oc.has(e) && !a.values.length || oc.has(n) && !o.values.length ? Jx(e, n) : go(mg(t_(o, a), a.values), i) : (yo(!0, `Complex values '${e}' and '${n}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), sa(e, n));
};
function yg(e, n, i) {
  return typeof e == "number" && typeof n == "number" && typeof i == "number" ? Te(e, n, i) : id(e)(e, n);
}
const r_ = (e) => {
  const n = ({ timestamp: i }) => e(i);
  return {
    start: (i = !0) => Ae.update(n, i),
    stop: () => zn(n),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Qe.isProcessing ? Qe.timestamp : it.now()
  };
}, gg = (e, n, i = 10) => {
  let o = "";
  const a = Math.max(Math.round(n / i), 2);
  for (let c = 0; c < a; c++)
    o += Math.round(e(c / (a - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${o.substring(0, o.length - 2)})`;
}, aa = 2e4;
function od(e) {
  let n = 0;
  const i = 50;
  let o = e.next(n);
  for (; !o.done && n < aa; )
    n += i, o = e.next(n);
  return n >= aa ? 1 / 0 : n;
}
function i_(e, n = 100, i) {
  const o = i({ ...e, keyframes: [0, n] }), a = Math.min(od(o), aa);
  return {
    type: "keyframes",
    ease: (c) => o.next(a * c).value / n,
    duration: /* @__PURE__ */ Mt(a)
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
function sc(e, n) {
  return e * Math.sqrt(1 - n * n);
}
const o_ = 12;
function s_(e, n, i) {
  let o = i;
  for (let a = 1; a < o_; a++)
    o = o - e(o) / n(o);
  return o;
}
const Fu = 1e-3;
function a_({ duration: e = Ie.duration, bounce: n = Ie.bounce, velocity: i = Ie.velocity, mass: o = Ie.mass }) {
  let a, c;
  yo(e <= /* @__PURE__ */ mt(Ie.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let d = 1 - n;
  d = tn(Ie.minDamping, Ie.maxDamping, d), e = tn(Ie.minDuration, Ie.maxDuration, /* @__PURE__ */ Mt(e)), d < 1 ? (a = (g) => {
    const v = g * d, l = v * e, h = v - i, S = sc(g, d), w = Math.exp(-l);
    return Fu - h / S * w;
  }, c = (g) => {
    const l = g * d * e, h = l * i + i, S = Math.pow(d, 2) * Math.pow(g, 2) * e, w = Math.exp(-l), _ = sc(Math.pow(g, 2), d);
    return (-a(g) + Fu > 0 ? -1 : 1) * ((h - S) * w) / _;
  }) : (a = (g) => {
    const v = Math.exp(-g * e), l = (g - i) * e + 1;
    return -Fu + v * l;
  }, c = (g) => {
    const v = Math.exp(-g * e), l = (i - g) * (e * e);
    return v * l;
  });
  const f = 5 / e, y = s_(a, c, f);
  if (e = /* @__PURE__ */ mt(e), isNaN(y))
    return {
      stiffness: Ie.stiffness,
      damping: Ie.damping,
      duration: e
    };
  {
    const g = Math.pow(y, 2) * o;
    return {
      stiffness: g,
      damping: d * 2 * Math.sqrt(o * g),
      duration: e
    };
  }
}
const l_ = ["duration", "bounce"], u_ = ["stiffness", "damping", "mass"];
function rm(e, n) {
  return n.some((i) => e[i] !== void 0);
}
function c_(e) {
  let n = {
    velocity: Ie.velocity,
    stiffness: Ie.stiffness,
    damping: Ie.damping,
    mass: Ie.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!rm(e, u_) && rm(e, l_))
    if (n.velocity = 0, e.visualDuration) {
      const i = e.visualDuration, o = 2 * Math.PI / (i * 1.2), a = o * o, c = 2 * tn(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(a);
      n = {
        ...n,
        mass: Ie.mass,
        stiffness: a,
        damping: c
      };
    } else {
      const i = a_({ ...e, velocity: 0 });
      n = {
        ...n,
        ...i,
        mass: Ie.mass
      }, n.isResolvedFromDuration = !0;
    }
  return n;
}
function la(e = Ie.visualDuration, n = Ie.bounce) {
  const i = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: n
  } : e;
  let { restSpeed: o, restDelta: a } = i;
  const c = i.keyframes[0], d = i.keyframes[i.keyframes.length - 1], f = { done: !1, value: c }, { stiffness: y, damping: g, mass: v, duration: l, velocity: h, isResolvedFromDuration: S } = c_({
    ...i,
    velocity: -/* @__PURE__ */ Mt(i.velocity || 0)
  }), w = h || 0, _ = g / (2 * Math.sqrt(y * v)), A = d - c, T = /* @__PURE__ */ Mt(Math.sqrt(y / v)), M = Math.abs(A) < 5;
  o || (o = M ? Ie.restSpeed.granular : Ie.restSpeed.default), a || (a = M ? Ie.restDelta.granular : Ie.restDelta.default);
  let R, D, j, G, K, $;
  if (_ < 1)
    j = sc(T, _), G = (w + _ * T * A) / j, R = (X) => {
      const te = Math.exp(-_ * T * X);
      return d - te * (G * Math.sin(j * X) + A * Math.cos(j * X));
    }, K = _ * T * G + A * j, $ = _ * T * A - G * j, D = (X) => Math.exp(-_ * T * X) * (K * Math.sin(j * X) + $ * Math.cos(j * X));
  else if (_ === 1) {
    R = (te) => d - Math.exp(-T * te) * (A + (w + T * A) * te);
    const X = w + T * A;
    D = (te) => Math.exp(-T * te) * (T * X * te - w);
  } else {
    const X = T * Math.sqrt(_ * _ - 1);
    R = (Q) => {
      const we = Math.exp(-_ * T * Q), ce = Math.min(X * Q, 300);
      return d - we * ((w + _ * T * A) * Math.sinh(ce) + X * A * Math.cosh(ce)) / X;
    };
    const te = (w + _ * T * A) / X, de = _ * T * te - A * X, he = _ * T * A - te * X;
    D = (Q) => {
      const we = Math.exp(-_ * T * Q), ce = Math.min(X * Q, 300);
      return we * (de * Math.sinh(ce) + he * Math.cosh(ce));
    };
  }
  const W = {
    calculatedDuration: S && l || null,
    velocity: (X) => /* @__PURE__ */ mt(D(X)),
    next: (X) => {
      if (!S && _ < 1) {
        const de = Math.exp(-_ * T * X), he = Math.sin(j * X), Q = Math.cos(j * X), we = d - de * (G * he + A * Q), ce = /* @__PURE__ */ mt(de * (K * he + $ * Q));
        return f.done = Math.abs(ce) <= o && Math.abs(d - we) <= a, f.value = f.done ? d : we, f;
      }
      const te = R(X);
      if (S)
        f.done = X >= l;
      else {
        const de = /* @__PURE__ */ mt(D(X));
        f.done = Math.abs(de) <= o && Math.abs(d - te) <= a;
      }
      return f.value = f.done ? d : te, f;
    },
    toString: () => {
      const X = Math.min(od(W), aa), te = gg((de) => W.next(X * de).value, X, 30);
      return X + "ms " + te;
    },
    toTransition: () => {
    }
  };
  return W;
}
la.applyToOptions = (e) => {
  const n = i_(e, 100, la);
  return e.ease = n.ease, e.duration = /* @__PURE__ */ mt(n.duration), e.type = "keyframes", e;
};
const d_ = 5;
function vg(e, n, i) {
  const o = Math.max(n - d_, 0);
  return /* @__PURE__ */ Zy(i - e(o), n - o);
}
function ac({ keyframes: e, velocity: n = 0, power: i = 0.8, timeConstant: o = 325, bounceDamping: a = 10, bounceStiffness: c = 500, modifyTarget: d, min: f, max: y, restDelta: g = 0.5, restSpeed: v }) {
  const l = e[0], h = {
    done: !1,
    value: l
  }, S = ($) => f !== void 0 && $ < f || y !== void 0 && $ > y, w = ($) => f === void 0 ? y : y === void 0 || Math.abs(f - $) < Math.abs(y - $) ? f : y;
  let _ = i * n;
  const A = l + _, T = d === void 0 ? A : d(A);
  T !== A && (_ = T - l);
  const M = ($) => -_ * Math.exp(-$ / o), R = ($) => T + M($), D = ($) => {
    const W = M($), X = R($);
    h.done = Math.abs(W) <= g, h.value = h.done ? T : X;
  };
  let j, G;
  const K = ($) => {
    S(h.value) && (j = $, G = la({
      keyframes: [h.value, w(h.value)],
      velocity: vg(R, $, h.value),
      // TODO: This should be passing * 1000
      damping: a,
      stiffness: c,
      restDelta: g,
      restSpeed: v
    }));
  };
  return K(0), {
    calculatedDuration: null,
    next: ($) => {
      let W = !1;
      return !G && j === void 0 && (W = !0, D($), K($)), j !== void 0 && $ >= j ? G.next($ - j) : (!W && D($), h);
    }
  };
}
function f_(e, n, i) {
  const o = [], a = i || Bn.mix || yg, c = e.length - 1;
  for (let d = 0; d < c; d++) {
    let f = a(e[d], e[d + 1]);
    if (n) {
      const y = Array.isArray(n) ? n[d] || bt : n;
      f = go(y, f);
    }
    o.push(f);
  }
  return o;
}
function p_(e, n, { clamp: i = !0, ease: o, mixer: a } = {}) {
  const c = e.length;
  if (pr(c === n.length, "Both input and output ranges must be the same length", "range-length"), c === 1)
    return () => n[0];
  if (c === 2 && n[0] === n[1])
    return () => n[1];
  const d = e[0] === e[1];
  e[0] > e[c - 1] && (e = [...e].reverse(), n = [...n].reverse());
  const f = f_(n, o, a), y = f.length, g = (v) => {
    if (d && v < e[0])
      return n[0];
    let l = 0;
    if (y > 1)
      for (; l < e.length - 2 && !(v < e[l + 1]); l++)
        ;
    const h = /* @__PURE__ */ so(e[l], e[l + 1], v);
    return f[l](h);
  };
  return i ? (v) => g(tn(e[0], e[c - 1], v)) : g;
}
function h_(e, n) {
  const i = e[e.length - 1];
  for (let o = 1; o <= n; o++) {
    const a = /* @__PURE__ */ so(0, n, o);
    e.push(Te(i, 1, a));
  }
}
function m_(e) {
  const n = [0];
  return h_(n, e.length - 1), n;
}
function y_(e, n) {
  return e.map((i) => i * n);
}
function g_(e, n) {
  return e.map(() => n || sg).splice(0, e.length - 1);
}
function eo({ duration: e = 300, keyframes: n, times: i, ease: o = "easeInOut" }) {
  const a = /* @__PURE__ */ Cx(o) ? o.map(Zh) : Zh(o), c = {
    done: !1,
    value: n[0]
  }, d = y_(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    i && i.length === n.length ? i : m_(n),
    e
  ), f = p_(d, n, {
    ease: Array.isArray(a) ? a : g_(n, a)
  });
  return {
    calculatedDuration: e,
    next: (y) => (c.value = f(y), c.done = y >= e, c)
  };
}
const v_ = (e) => e !== null;
function Ta(e, { repeat: n, repeatType: i = "loop" }, o, a = 1) {
  const c = e.filter(v_), f = a < 0 || n && i !== "loop" && n % 2 === 1 ? 0 : c.length - 1;
  return !f || o === void 0 ? c[f] : o;
}
const S_ = {
  decay: ac,
  inertia: ac,
  tween: eo,
  keyframes: eo,
  spring: la
};
function Sg(e) {
  typeof e.type == "string" && (e.type = S_[e.type]);
}
class sd {
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
  then(n, i) {
    return this.finished.then(n, i);
  }
}
const w_ = (e) => e / 100;
class ua extends sd {
  constructor(n) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      var o, a;
      const { motionValue: i } = this.options;
      i && i.updatedAt !== it.now() && this.tick(it.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), (a = (o = this.options).onStop) == null || a.call(o));
    }, this.options = n, this.initAnimation(), this.play(), n.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: n } = this;
    Sg(n);
    const { type: i = eo, repeat: o = 0, repeatDelay: a = 0, repeatType: c, velocity: d = 0 } = n;
    let { keyframes: f } = n;
    const y = i || eo;
    y !== eo && typeof f[0] != "number" && (this.mixKeyframes = go(w_, yg(f[0], f[1])), f = [0, 100]);
    const g = y({ ...n, keyframes: f });
    c === "mirror" && (this.mirroredGenerator = y({
      ...n,
      keyframes: [...f].reverse(),
      velocity: -d
    })), g.calculatedDuration === null && (g.calculatedDuration = od(g));
    const { calculatedDuration: v } = g;
    this.calculatedDuration = v, this.resolvedDuration = v + a, this.totalDuration = this.resolvedDuration * (o + 1) - a, this.generator = g;
  }
  updateTime(n) {
    const i = Math.round(n - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = i;
  }
  tick(n, i = !1) {
    const { generator: o, totalDuration: a, mixKeyframes: c, mirroredGenerator: d, resolvedDuration: f, calculatedDuration: y } = this;
    if (this.startTime === null)
      return o.next(0);
    const { delay: g = 0, keyframes: v, repeat: l, repeatType: h, repeatDelay: S, type: w, onUpdate: _, finalKeyframe: A } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, n) : this.speed < 0 && (this.startTime = Math.min(n - a / this.speed, this.startTime)), i ? this.currentTime = n : this.updateTime(n);
    const T = this.currentTime - g * (this.playbackSpeed >= 0 ? 1 : -1), M = this.playbackSpeed >= 0 ? T < 0 : T > a;
    this.currentTime = Math.max(T, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = a);
    let R = this.currentTime, D = o;
    if (l) {
      const $ = Math.min(this.currentTime, a) / f;
      let W = Math.floor($), X = $ % 1;
      !X && $ >= 1 && (X = 1), X === 1 && W--, W = Math.min(W, l + 1), !!(W % 2) && (h === "reverse" ? (X = 1 - X, S && (X -= S / f)) : h === "mirror" && (D = d)), R = tn(0, 1, X) * f;
    }
    let j;
    M ? (this.delayState.value = v[0], j = this.delayState) : j = D.next(R), c && !M && (j.value = c(j.value));
    let { done: G } = j;
    !M && y !== null && (G = this.playbackSpeed >= 0 ? this.currentTime >= a : this.currentTime <= 0);
    const K = this.holdTime === null && (this.state === "finished" || this.state === "running" && G);
    return K && w !== ac && (j.value = Ta(v, this.options, A, this.speed)), _ && _(j.value), K && this.finish(), j;
  }
  /**
   * Allows the returned animation to be awaited or promise-chained. Currently
   * resolves when the animation finishes at all but in a future update could/should
   * reject if its cancels.
   */
  then(n, i) {
    return this.finished.then(n, i);
  }
  get duration() {
    return /* @__PURE__ */ Mt(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: n = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ Mt(n);
  }
  get time() {
    return /* @__PURE__ */ Mt(this.currentTime);
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
    const i = this.generator.next(n).value;
    return vg((o) => this.generator.next(o).value, n, i);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(n) {
    const i = this.playbackSpeed !== n;
    i && this.driver && this.updateTime(it.now()), this.playbackSpeed = n, i && this.driver && (this.time = /* @__PURE__ */ Mt(this.currentTime));
  }
  play() {
    var a, c;
    if (this.isStopped)
      return;
    const { driver: n = r_, startTime: i } = this.options;
    this.driver || (this.driver = n((d) => this.tick(d))), (c = (a = this.options).onPlay) == null || c.call(a);
    const o = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = o) : this.holdTime !== null ? this.startTime = o - this.holdTime : this.startTime || (this.startTime = i ?? o), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(it.now()), this.holdTime = this.currentTime;
  }
  complete() {
    this.state !== "running" && this.play(), this.state = "finished", this.holdTime = null;
  }
  finish() {
    var n, i;
    this.notifyFinished(), this.teardown(), this.state = "finished", (i = (n = this.options).onComplete) == null || i.call(n);
  }
  cancel() {
    var n, i;
    this.holdTime = null, this.startTime = 0, this.tick(0), this.teardown(), (i = (n = this.options).onCancel) == null || i.call(n);
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
    var i;
    return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), (i = this.driver) == null || i.stop(), n.observe(this);
  }
}
function x_(e) {
  for (let n = 1; n < e.length; n++)
    e[n] ?? (e[n] = e[n - 1]);
}
const lr = (e) => e * 180 / Math.PI, lc = (e) => {
  const n = lr(Math.atan2(e[1], e[0]));
  return uc(n);
}, __ = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: lc,
  rotateZ: lc,
  skewX: (e) => lr(Math.atan(e[1])),
  skewY: (e) => lr(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, uc = (e) => (e = e % 360, e < 0 && (e += 360), e), im = lc, om = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), sm = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), T_ = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: om,
  scaleY: sm,
  scale: (e) => (om(e) + sm(e)) / 2,
  rotateX: (e) => uc(lr(Math.atan2(e[6], e[5]))),
  rotateY: (e) => uc(lr(Math.atan2(-e[2], e[0]))),
  rotateZ: im,
  rotate: im,
  skewX: (e) => lr(Math.atan(e[4])),
  skewY: (e) => lr(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function cc(e) {
  return e.includes("scale") ? 1 : 0;
}
function dc(e, n) {
  if (!e || e === "none")
    return cc(n);
  const i = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let o, a;
  if (i)
    o = T_, a = i;
  else {
    const f = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    o = __, a = f;
  }
  if (!a)
    return cc(n);
  const c = o[n], d = a[1].split(",").map(A_);
  return typeof c == "function" ? c(d) : d[c];
}
const k_ = (e, n) => {
  const { transform: i = "none" } = getComputedStyle(e);
  return dc(i, n);
};
function A_(e) {
  return parseFloat(e.trim());
}
const ii = [
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
], oi = /* @__PURE__ */ new Set([...ii, "pathRotation"]), am = (e) => e === ri || e === re, C_ = /* @__PURE__ */ new Set(["x", "y", "z"]), P_ = ii.filter((e) => !C_.has(e));
function E_(e) {
  const n = [];
  return P_.forEach((i) => {
    const o = e.getValue(i);
    o !== void 0 && (n.push([i, o.get()]), o.set(i.startsWith("scale") ? 1 : 0));
  }), n;
}
const Vn = {
  // Dimensions
  width: ({ x: e }, { paddingLeft: n = "0", paddingRight: i = "0", boxSizing: o }) => {
    const a = e.max - e.min;
    return o === "border-box" ? a : a - parseFloat(n) - parseFloat(i);
  },
  height: ({ y: e }, { paddingTop: n = "0", paddingBottom: i = "0", boxSizing: o }) => {
    const a = e.max - e.min;
    return o === "border-box" ? a : a - parseFloat(n) - parseFloat(i);
  },
  top: (e, { top: n }) => parseFloat(n),
  left: (e, { left: n }) => parseFloat(n),
  bottom: ({ y: e }, { top: n }) => parseFloat(n) + (e.max - e.min),
  right: ({ x: e }, { left: n }) => parseFloat(n) + (e.max - e.min),
  // Transform
  x: (e, { transform: n }) => dc(n, "x"),
  y: (e, { transform: n }) => dc(n, "y")
};
Vn.translateX = Vn.x;
Vn.translateY = Vn.y;
const ur = /* @__PURE__ */ new Set();
let fc = !1, pc = !1, hc = !1;
function wg() {
  if (pc) {
    const e = Array.from(ur).filter((o) => o.needsMeasurement), n = new Set(e.map((o) => o.element)), i = /* @__PURE__ */ new Map();
    n.forEach((o) => {
      const a = E_(o);
      a.length && (i.set(o, a), o.render());
    }), e.forEach((o) => o.measureInitialState()), n.forEach((o) => {
      o.render();
      const a = i.get(o);
      a && a.forEach(([c, d]) => {
        var f;
        (f = o.getValue(c)) == null || f.set(d);
      });
    }), e.forEach((o) => o.measureEndState()), e.forEach((o) => {
      o.suspendedScrollY !== void 0 && window.scrollTo(0, o.suspendedScrollY);
    });
  }
  pc = !1, fc = !1, ur.forEach((e) => e.complete(hc)), ur.clear();
}
function xg() {
  ur.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (pc = !0);
  });
}
function M_() {
  hc = !0, xg(), wg(), hc = !1;
}
class ad {
  constructor(n, i, o, a, c, d = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...n], this.onComplete = i, this.name = o, this.motionValue = a, this.element = c, this.isAsync = d;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (ur.add(this), fc || (fc = !0, Ae.read(xg), Ae.resolveKeyframes(wg))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: n, name: i, element: o, motionValue: a } = this;
    if (n[0] === null) {
      const c = a == null ? void 0 : a.get(), d = n[n.length - 1];
      if (c !== void 0)
        n[0] = c;
      else if (o && i) {
        const f = o.readValue(i, d);
        f != null && (n[0] = f);
      }
      n[0] === void 0 && (n[0] = d), a && c === void 0 && a.set(n[0]);
    }
    x_(n);
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
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, n), ur.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (ur.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const b_ = (e) => e.startsWith("--");
function _g(e, n, i) {
  b_(n) ? e.style.setProperty(n, i) : e.style[n] = i;
}
const R_ = {};
function Tg(e, n) {
  const i = /* @__PURE__ */ Xy(e);
  return () => R_[n] ?? i();
}
const D_ = /* @__PURE__ */ Tg(() => window.ScrollTimeline !== void 0, "scrollTimeline"), kg = /* @__PURE__ */ Tg(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), Zi = ([e, n, i, o]) => `cubic-bezier(${e}, ${n}, ${i}, ${o})`, lm = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ Zi([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ Zi([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ Zi([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ Zi([0.33, 1.53, 0.69, 0.99])
};
function Ag(e, n) {
  if (e)
    return typeof e == "function" ? kg() ? gg(e, n) : "ease-out" : /* @__PURE__ */ ag(e) ? Zi(e) : Array.isArray(e) ? e.map((i) => Ag(i, n) || lm.easeOut) : lm[e];
}
function N_(e, n, i, { delay: o = 0, duration: a = 300, repeat: c = 0, repeatType: d = "loop", ease: f = "easeOut", times: y } = {}, g = void 0) {
  const v = {
    [n]: i
  };
  y && (v.offset = y);
  const l = Ag(f, a);
  Array.isArray(l) && (v.easing = l);
  const h = {
    delay: o,
    duration: a,
    easing: Array.isArray(l) ? "linear" : l,
    fill: "both",
    iterations: c + 1,
    direction: d === "reverse" ? "alternate" : "normal"
  };
  return g && (h.pseudoElement = g), e.animate(v, h);
}
function Cg(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function I_({ type: e, ...n }) {
  return Cg(e) && kg() ? e.applyToOptions(n) : (n.duration ?? (n.duration = 300), n.ease ?? (n.ease = "easeOut"), n);
}
class Pg extends sd {
  constructor(n) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !n)
      return;
    const { element: i, name: o, keyframes: a, pseudoElement: c, allowFlatten: d = !1, finalKeyframe: f, onComplete: y } = n;
    this.isPseudoElement = !!c, this.allowFlatten = d, this.options = n, pr(typeof n.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const g = I_(n);
    this.animation = N_(i, o, a, g, c), g.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !c) {
        const v = Ta(a, this.options, f, this.speed);
        this.updateMotionValue && this.updateMotionValue(v), _g(i, o, v), this.animation.cancel();
      }
      y == null || y(), this.notifyFinished();
    };
  }
  play() {
    this.isStopped || (this.manualStartTime = null, this.animation.play(), this.state === "finished" && this.updateFinished());
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    var n, i;
    (i = (n = this.animation).finish) == null || i.call(n);
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
    var i, o, a;
    const n = (i = this.options) == null ? void 0 : i.element;
    !this.isPseudoElement && (n != null && n.isConnected) && ((a = (o = this.animation).commitStyles) == null || a.call(o));
  }
  get duration() {
    var i, o;
    const n = ((o = (i = this.animation.effect) == null ? void 0 : i.getComputedTiming) == null ? void 0 : o.call(i).duration) || 0;
    return /* @__PURE__ */ Mt(Number(n));
  }
  get iterationDuration() {
    const { delay: n = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ Mt(n);
  }
  get time() {
    return /* @__PURE__ */ Mt(Number(this.animation.currentTime) || 0);
  }
  set time(n) {
    const i = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ mt(n), i && this.animation.pause();
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
  attachTimeline({ timeline: n, rangeStart: i, rangeEnd: o, observe: a }) {
    var c;
    return this.allowFlatten && ((c = this.animation.effect) == null || c.updateTiming({ easing: "linear" })), this.animation.onfinish = null, n && D_() ? (this.animation.timeline = n, i && (this.animation.rangeStart = i), o && (this.animation.rangeEnd = o), bt) : a(this);
  }
}
const Eg = {
  anticipate: rg,
  backInOut: ng,
  circInOut: og
};
function F_(e) {
  return e in Eg;
}
function O_(e) {
  typeof e.ease == "string" && F_(e.ease) && (e.ease = Eg[e.ease]);
}
const Ou = 10;
class j_ extends Pg {
  constructor(n) {
    O_(n), Sg(n), super(n), n.startTime !== void 0 && n.autoplay !== !1 && (this.startTime = n.startTime), this.options = n;
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
    const { motionValue: i, onUpdate: o, onComplete: a, element: c, ...d } = this.options;
    if (!i)
      return;
    if (n !== void 0) {
      i.set(n);
      return;
    }
    const f = new ua({
      ...d,
      autoplay: !1
    }), y = Math.max(Ou, it.now() - this.startTime), g = tn(0, Ou, y - Ou), v = f.sample(y).value, { name: l } = this.options;
    c && l && _g(c, l, v), i.setWithVelocity(f.sample(Math.max(0, y - g)).value, v, g), f.stop();
  }
}
const um = (e, n) => n === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(Ut.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function L_(e) {
  const n = e[0];
  if (e.length === 1)
    return !0;
  for (let i = 0; i < e.length; i++)
    if (e[i] !== n)
      return !0;
}
function V_(e, n, i, o) {
  const a = e[0];
  if (a === null)
    return !1;
  if (n === "display" || n === "visibility")
    return !0;
  const c = e[e.length - 1], d = um(a, n), f = um(c, n);
  return yo(d === f, `You are trying to animate ${n} from "${a}" to "${c}". "${d ? c : a}" is not an animatable value.`, "value-not-animatable"), !d || !f ? !1 : L_(e) || (i === "spring" || Cg(i)) && o;
}
function mc(e) {
  e.duration = 0, e.type = "keyframes";
}
const Mg = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), B_ = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function z_(e) {
  for (let n = 0; n < e.length; n++)
    if (typeof e[n] == "string" && B_.test(e[n]))
      return !0;
  return !1;
}
const U_ = /* @__PURE__ */ new Set([
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
]), $_ = /* @__PURE__ */ Xy(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function H_(e) {
  var l;
  const { motionValue: n, name: i, repeatDelay: o, repeatType: a, damping: c, type: d, keyframes: f } = e;
  if (!(((l = n == null ? void 0 : n.owner) == null ? void 0 : l.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: g, transformTemplate: v } = n.owner.getProps();
  return $_() && i && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (Mg.has(i) || U_.has(i) && z_(f)) && (i !== "transform" || !v) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !g && !o && a !== "mirror" && c !== 0 && d !== "inertia";
}
const W_ = 40;
class G_ extends sd {
  constructor({ autoplay: n = !0, delay: i = 0, type: o = "keyframes", repeat: a = 0, repeatDelay: c = 0, repeatType: d = "loop", keyframes: f, name: y, motionValue: g, element: v, ...l }) {
    var w;
    super(), this.stop = () => {
      var _, A;
      this._animation && (this._animation.stop(), (_ = this.stopTimeline) == null || _.call(this)), (A = this.keyframeResolver) == null || A.cancel();
    }, this.createdAt = it.now();
    const h = {
      autoplay: n,
      delay: i,
      type: o,
      repeat: a,
      repeatDelay: c,
      repeatType: d,
      name: y,
      motionValue: g,
      element: v,
      ...l
    }, S = (v == null ? void 0 : v.KeyframeResolver) || ad;
    this.keyframeResolver = new S(f, (_, A, T) => this.onKeyframesResolved(_, A, h, !T), y, g, v), (w = this.keyframeResolver) == null || w.scheduleResolve();
  }
  onKeyframesResolved(n, i, o, a) {
    var T, M;
    this.keyframeResolver = void 0;
    const { name: c, type: d, velocity: f, delay: y, isHandoff: g, onUpdate: v } = o;
    this.resolvedAt = it.now();
    let l = !0;
    V_(n, c, d, f) || (l = !1, (Bn.instantAnimations || !y) && (v == null || v(Ta(n, o, i))), n[0] = n[n.length - 1], mc(o), o.repeat = 0);
    const S = {
      startTime: a ? this.resolvedAt ? this.resolvedAt - this.createdAt > W_ ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: i,
      ...o,
      keyframes: n
    }, w = l && !g && H_(S), _ = (M = (T = S.motionValue) == null ? void 0 : T.owner) == null ? void 0 : M.current;
    let A;
    if (w)
      try {
        A = new j_({
          ...S,
          element: _
        });
      } catch {
        A = new ua(S);
      }
    else
      A = new ua(S);
    A.finished.then(() => {
      this.notifyFinished();
    }).catch(bt), this.pendingTimeline && (this.stopTimeline = A.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = A;
  }
  get finished() {
    return this._animation ? this.animation.finished : this._finished;
  }
  then(n, i) {
    return this.finished.finally(n).then(() => {
    });
  }
  get animation() {
    var n;
    return this._animation || ((n = this.keyframeResolver) == null || n.resume(), M_()), this._animation;
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
function bg(e, n, i, o = 0, a = 1) {
  const c = Array.from(e).sort((g, v) => g.sortNodePosition(v)).indexOf(n), d = e.size, f = (d - 1) * o;
  return typeof i == "function" ? i(c, d) : a === 1 ? c * o : f - c * o;
}
const cm = 30, K_ = (e) => !isNaN(parseFloat(e));
class Y_ {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(n, i = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (o) => {
      var c;
      const a = it.now();
      if (this.updatedAt !== a && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(o), this.current !== this.prev && ((c = this.events.change) == null || c.notify(this.current), this.dependents))
        for (const d of this.dependents)
          d.dirty();
    }, this.hasAnimated = !1, this.setCurrent(n), this.owner = i.owner;
  }
  setCurrent(n) {
    this.current = n, this.updatedAt = it.now(), this.canTrackVelocity === null && n !== void 0 && (this.canTrackVelocity = K_(this.current));
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
  on(n, i) {
    this.events[n] || (this.events[n] = new Jc());
    const o = this.events[n].add(i);
    return n === "change" ? () => {
      o(), Ae.read(() => {
        this.events.change.getSize() || this.stop();
      });
    } : o;
  }
  clearListeners() {
    for (const n in this.events)
      this.events[n].clear();
  }
  /**
   * Attaches a passive effect to the `MotionValue`.
   */
  attach(n, i) {
    this.passiveEffect = n, this.stopPassiveEffect = i;
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
  setWithVelocity(n, i, o) {
    this.set(i), this.prev = void 0, this.prevFrameValue = n, this.prevUpdatedAt = this.updatedAt - o;
  }
  /**
   * Set the state of the `MotionValue`, stopping any active animations,
   * effects, and resets velocity to `0`.
   */
  jump(n, i = !0) {
    this.updateAndNotify(n), this.prev = n, this.prevUpdatedAt = this.prevFrameValue = void 0, i && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
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
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || n - this.updatedAt > cm)
      return 0;
    const i = Math.min(this.updatedAt - this.prevUpdatedAt, cm);
    return /* @__PURE__ */ Zy(parseFloat(this.current) - parseFloat(this.prevFrameValue), i);
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
    return this.stop(), new Promise((i) => {
      this.hasAnimated = !0, this.animation = n(i), this.events.animationStart && this.events.animationStart.notify();
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
    var n, i;
    (n = this.dependents) == null || n.clear(), (i = this.events.destroy) == null || i.notify(), this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
}
function qr(e, n) {
  return new Y_(e, n);
}
function Rg(e, n) {
  if (e != null && e.inherit && n) {
    const { inherit: i, ...o } = e;
    return { ...n, ...o };
  }
  return e;
}
function ld(e, n) {
  const i = (e == null ? void 0 : e[n]) ?? (e == null ? void 0 : e.default) ?? e;
  return i !== e ? Rg(i, e) : i;
}
const Q_ = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, X_ = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), Z_ = {
  type: "keyframes",
  duration: 0.8
}, J_ = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, q_ = (e, { keyframes: n }) => n.length > 2 ? Z_ : oi.has(e) ? e.startsWith("scale") ? X_(n[1]) : Q_ : J_, e1 = /* @__PURE__ */ new Set([
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
function t1(e) {
  for (const n in e)
    if (!e1.has(n))
      return !0;
  return !1;
}
const ud = (e, n, i, o = {}, a, c) => (d) => {
  const f = ld(o, e) || {}, y = f.delay || o.delay || 0;
  let { elapsed: g = 0 } = o;
  g = g - /* @__PURE__ */ mt(y);
  const v = {
    keyframes: Array.isArray(i) ? i : [null, i],
    ease: "easeOut",
    velocity: n.getVelocity(),
    ...f,
    delay: -g,
    onUpdate: (h) => {
      n.set(h), f.onUpdate && f.onUpdate(h);
    },
    onComplete: () => {
      d(), f.onComplete && f.onComplete();
    },
    name: e,
    motionValue: n,
    element: c ? void 0 : a
  };
  t1(f) || Object.assign(v, q_(e, v)), v.duration && (v.duration = /* @__PURE__ */ mt(v.duration)), v.repeatDelay && (v.repeatDelay = /* @__PURE__ */ mt(v.repeatDelay)), v.from !== void 0 && (v.keyframes[0] = v.from);
  let l = !1;
  if ((v.type === !1 || v.duration === 0 && !v.repeatDelay) && (mc(v), v.delay === 0 && (l = !0)), (Bn.instantAnimations || Bn.skipAnimations || a != null && a.shouldSkipAnimations || f.skipAnimations) && (l = !0, mc(v), v.delay = 0), v.allowFlatten = !f.type && !f.ease, l && !c && n.get() !== void 0) {
    const h = Ta(v.keyframes, f);
    if (h !== void 0) {
      Ae.update(() => {
        v.onUpdate(h), v.onComplete();
      });
      return;
    }
  }
  return f.isSync ? new ua(v) : new G_(v);
}, n1 = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function r1(e) {
  const n = n1.exec(e);
  if (!n)
    return [,];
  const [, i, o, a] = n;
  return [`--${i ?? o}`, a];
}
const i1 = 4;
function Dg(e, n, i = 1) {
  pr(i <= i1, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [o, a] = r1(e);
  if (!o)
    return;
  const c = window.getComputedStyle(n).getPropertyValue(o);
  if (c) {
    const d = c.trim();
    return Ky(d) ? parseFloat(d) : d;
  }
  return td(a) ? Dg(a, n, i + 1) : a;
}
function dm(e) {
  const n = [{}, {}];
  return e == null || e.values.forEach((i, o) => {
    n[0][o] = i.get(), n[1][o] = i.getVelocity();
  }), n;
}
function cd(e, n, i, o) {
  if (typeof n == "function") {
    const [a, c] = dm(o);
    n = n(i !== void 0 ? i : e.custom, a, c);
  }
  if (typeof n == "string" && (n = e.variants && e.variants[n]), typeof n == "function") {
    const [a, c] = dm(o);
    n = n(i !== void 0 ? i : e.custom, a, c);
  }
  return n;
}
function cr(e, n, i) {
  const o = e.getProps();
  return cd(o, n, i !== void 0 ? i : o.custom, e);
}
const Ng = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...ii
]), yc = (e) => Array.isArray(e);
function o1(e, n, i) {
  e.hasValue(n) ? e.getValue(n).set(i) : e.addValue(n, qr(i));
}
function s1(e) {
  return yc(e) ? e[e.length - 1] || 0 : e;
}
function a1(e, n) {
  const i = cr(e, n);
  let { transitionEnd: o = {}, transition: a = {}, ...c } = i || {};
  c = { ...c, ...o };
  for (const d in c) {
    const f = s1(c[d]);
    o1(e, d, f);
  }
}
const Xe = (e) => !!(e && e.getVelocity);
function l1(e) {
  return !!(Xe(e) && e.add);
}
function gc(e, n) {
  const i = e.getValue("willChange");
  if (l1(i))
    return i.add(n);
  if (!i && Bn.WillChange) {
    const o = new Bn.WillChange("auto");
    e.addValue("willChange", o), o.add(n);
  }
}
function dd(e) {
  return e.replace(/([A-Z])/g, (n) => `-${n.toLowerCase()}`);
}
const u1 = "framerAppearId", Ig = "data-" + dd(u1);
function Fg(e) {
  return e.props[Ig];
}
function c1({ protectedKeys: e, needsAnimating: n }, i) {
  const o = e.hasOwnProperty(i) && n[i] !== !0;
  return n[i] = !1, o;
}
function Og(e, n, { delay: i = 0, transitionOverride: o, type: a } = {}) {
  let { transition: c, transitionEnd: d, ...f } = n;
  const y = e.getDefaultTransition();
  c = c ? Rg(c, y) : y;
  const g = c == null ? void 0 : c.reduceMotion, v = c == null ? void 0 : c.skipAnimations;
  o && (c = o);
  const l = [], h = a && e.animationState && e.animationState.getState()[a], S = c == null ? void 0 : c.path;
  S && S.animateVisualElement(e, f, c, i, l);
  for (const w in f) {
    const _ = e.getValue(w, e.latestValues[w] ?? null), A = f[w];
    if (A === void 0 || h && c1(h, w))
      continue;
    const T = {
      delay: i,
      ...ld(c || {}, w)
    };
    v && (T.skipAnimations = !0);
    const M = _.get();
    if (M !== void 0 && !_.isAnimating() && !Array.isArray(A) && A === M && !T.velocity) {
      Ae.update(() => _.set(A));
      continue;
    }
    let R = !1;
    if (window.MotionHandoffAnimation) {
      const G = Fg(e);
      if (G) {
        const K = window.MotionHandoffAnimation(G, w, Ae);
        K !== null && (T.startTime = K, R = !0);
      }
    }
    gc(e, w);
    const D = g ?? e.shouldReduceMotion;
    _.start(ud(w, _, A, D && Ng.has(w) ? { type: !1 } : T, e, R));
    const j = _.animation;
    j && l.push(j);
  }
  if (d) {
    const w = () => Ae.update(() => {
      d && a1(e, d);
    });
    l.length ? Promise.all(l).then(w) : w();
  }
  return l;
}
function vc(e, n, i = {}) {
  var y;
  const o = cr(e, n, i.type === "exit" ? (y = e.presenceContext) == null ? void 0 : y.custom : void 0);
  let { transition: a = e.getDefaultTransition() || {} } = o || {};
  i.transitionOverride && (a = i.transitionOverride);
  const c = o ? () => Promise.all(Og(e, o, i)) : () => Promise.resolve(), d = e.variantChildren && e.variantChildren.size ? (g = 0) => {
    const { delayChildren: v = 0, staggerChildren: l, staggerDirection: h } = a;
    return d1(e, n, g, v, l, h, i);
  } : () => Promise.resolve(), { when: f } = a;
  if (f) {
    const [g, v] = f === "beforeChildren" ? [c, d] : [d, c];
    return g().then(() => v());
  } else
    return Promise.all([c(), d(i.delay)]);
}
function d1(e, n, i = 0, o = 0, a = 0, c = 1, d) {
  const f = [];
  for (const y of e.variantChildren)
    y.notify("AnimationStart", n), f.push(vc(y, n, {
      ...d,
      delay: i + (typeof o == "function" ? 0 : o) + bg(e.variantChildren, y, o, a, c)
    }).then(() => y.notify("AnimationComplete", n)));
  return Promise.all(f);
}
function f1(e, n, i = {}) {
  e.notify("AnimationStart", n);
  let o;
  if (Array.isArray(n)) {
    const a = n.map((c) => vc(e, c, i));
    o = Promise.all(a);
  } else if (typeof n == "string")
    o = vc(e, n, i);
  else {
    const a = typeof n == "function" ? cr(e, n, i.custom) : n;
    o = Promise.all(Og(e, a, i));
  }
  return o.then(() => {
    e.notify("AnimationComplete", n);
  });
}
const p1 = {
  test: (e) => e === "auto",
  parse: (e) => e
}, jg = (e) => (n) => n.test(e), Lg = [ri, re, en, pn, Lx, jx, p1], fm = (e) => Lg.find(jg(e));
function h1(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || Qy(e) : !0;
}
const m1 = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function y1(e) {
  const [n, i] = e.slice(0, -1).split("(");
  if (n === "drop-shadow")
    return e;
  const [o] = i.match(nd) || [];
  if (!o)
    return e;
  const a = i.replace(o, "");
  let c = m1.has(n) ? 1 : 0;
  return o !== i && (c *= 100), n + "(" + c + a + ")";
}
const g1 = /\b([a-z-]*)\(.*?\)/gu, Sc = {
  ...Ut,
  getAnimatableNone: (e) => {
    const n = e.match(g1);
    return n ? n.map(y1).join(" ") : e;
  }
}, wc = {
  ...Ut,
  getAnimatableNone: (e) => {
    const n = Ut.parse(e);
    return Ut.createTransformer(e)(n.map((o) => typeof o == "number" ? 0 : typeof o == "object" ? { ...o, alpha: 1 } : o));
  }
}, pm = {
  ...ri,
  transform: Math.round
}, v1 = {
  rotate: pn,
  /**
   * Internal channel for `transition.path` orientToPath. Composed onto
   * `rotate` at the transform-build sites so the user's `rotate` is
   * never read or overwritten. Not part of `transformPropOrder`.
   */
  pathRotation: pn,
  rotateX: pn,
  rotateY: pn,
  rotateZ: pn,
  scale: Fs,
  scaleX: Fs,
  scaleY: Fs,
  scaleZ: Fs,
  skew: pn,
  skewX: pn,
  skewY: pn,
  distance: re,
  translateX: re,
  translateY: re,
  translateZ: re,
  x: re,
  y: re,
  z: re,
  perspective: re,
  transformPerspective: re,
  opacity: ao,
  originX: qh,
  originY: qh,
  originZ: re
}, ca = {
  // Border props
  borderWidth: re,
  borderTopWidth: re,
  borderRightWidth: re,
  borderBottomWidth: re,
  borderLeftWidth: re,
  borderRadius: re,
  borderTopLeftRadius: re,
  borderTopRightRadius: re,
  borderBottomRightRadius: re,
  borderBottomLeftRadius: re,
  // Positioning props
  width: re,
  maxWidth: re,
  height: re,
  maxHeight: re,
  top: re,
  right: re,
  bottom: re,
  left: re,
  inset: re,
  insetBlock: re,
  insetBlockStart: re,
  insetBlockEnd: re,
  insetInline: re,
  insetInlineStart: re,
  insetInlineEnd: re,
  // Spacing props
  padding: re,
  paddingTop: re,
  paddingRight: re,
  paddingBottom: re,
  paddingLeft: re,
  paddingBlock: re,
  paddingBlockStart: re,
  paddingBlockEnd: re,
  paddingInline: re,
  paddingInlineStart: re,
  paddingInlineEnd: re,
  margin: re,
  marginTop: re,
  marginRight: re,
  marginBottom: re,
  marginLeft: re,
  marginBlock: re,
  marginBlockStart: re,
  marginBlockEnd: re,
  marginInline: re,
  marginInlineStart: re,
  marginInlineEnd: re,
  // Typography
  fontSize: re,
  // Misc
  backgroundPositionX: re,
  backgroundPositionY: re,
  ...v1,
  zIndex: pm,
  // SVG
  fillOpacity: ao,
  strokeOpacity: ao,
  numOctaves: pm
}, S1 = {
  ...ca,
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
  filter: Sc,
  WebkitFilter: Sc,
  mask: wc,
  WebkitMask: wc
}, Vg = (e) => S1[e], w1 = /* @__PURE__ */ new Set([Sc, wc]);
function Bg(e, n) {
  let i = Vg(e);
  return w1.has(i) || (i = Ut), i.getAnimatableNone ? i.getAnimatableNone(n) : void 0;
}
const x1 = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function _1(e, n, i) {
  let o = 0, a;
  for (; o < e.length && !a; ) {
    const c = e[o];
    typeof c == "string" && !x1.has(c) && Jr(c).values.length && (a = e[o]), o++;
  }
  if (a && i)
    for (const c of n)
      e[c] = Bg(i, a);
}
class T1 extends ad {
  constructor(n, i, o, a, c) {
    super(n, i, o, a, c, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: n, element: i, name: o } = this;
    if (!i || !i.current)
      return;
    super.readKeyframes();
    for (let v = 0; v < n.length; v++) {
      let l = n[v];
      if (typeof l == "string" && (l = l.trim(), td(l))) {
        const h = Dg(l, i.current);
        h !== void 0 && (n[v] = h), v === n.length - 1 && (this.finalKeyframe = l);
      }
    }
    if (this.resolveNoneKeyframes(), !Ng.has(o) || n.length !== 2)
      return;
    const [a, c] = n, d = fm(a), f = fm(c), y = Jh(a), g = Jh(c);
    if (y !== g && Vn[o]) {
      this.needsMeasurement = !0;
      return;
    }
    if (d !== f)
      if (am(d) && am(f))
        for (let v = 0; v < n.length; v++) {
          const l = n[v];
          typeof l == "string" && (n[v] = parseFloat(l));
        }
      else Vn[o] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: n, name: i } = this, o = [];
    for (let a = 0; a < n.length; a++)
      (n[a] === null || h1(n[a])) && o.push(a);
    o.length && _1(n, o, i);
  }
  measureInitialState() {
    const { element: n, unresolvedKeyframes: i, name: o } = this;
    if (!n || !n.current)
      return;
    o === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = Vn[o](n.measureViewportBox(), window.getComputedStyle(n.current)), i[0] = this.measuredOrigin;
    const a = i[i.length - 1];
    a !== void 0 && n.getValue(o, a).jump(a, !1);
  }
  measureEndState() {
    var f;
    const { element: n, name: i, unresolvedKeyframes: o } = this;
    if (!n || !n.current)
      return;
    const a = n.getValue(i);
    a && a.jump(this.measuredOrigin, !1);
    const c = o.length - 1, d = o[c];
    o[c] = Vn[i](n.measureViewportBox(), window.getComputedStyle(n.current)), d !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = d), (f = this.removedTransforms) != null && f.length && this.removedTransforms.forEach(([y, g]) => {
      n.getValue(y).set(g);
    }), this.resolveNoneKeyframes();
  }
}
const fd = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius"
];
function zg(e, n, i) {
  if (e == null)
    return [];
  if (e instanceof EventTarget)
    return [e];
  if (typeof e == "string") {
    let o = document;
    const a = (i == null ? void 0 : i[e]) ?? o.querySelectorAll(e);
    return a ? Array.from(a) : [];
  }
  return Array.from(e).filter((o) => o != null);
}
const xc = (e, n) => n && typeof e == "number" ? n.transform(e) : e;
function Ks(e) {
  return Yy(e) && "offsetHeight" in e && !("ownerSVGElement" in e);
}
const { schedule: pd } = /* @__PURE__ */ lg(queueMicrotask, !1), Vt = {
  x: !1,
  y: !1
};
function Ug() {
  return Vt.x || Vt.y;
}
function k1(e) {
  return e === "x" || e === "y" ? Vt[e] ? null : (Vt[e] = !0, () => {
    Vt[e] = !1;
  }) : Vt.x || Vt.y ? null : (Vt.x = Vt.y = !0, () => {
    Vt.x = Vt.y = !1;
  });
}
function $g(e, n) {
  const i = zg(e), o = new AbortController(), a = {
    passive: !0,
    ...n,
    signal: o.signal
  };
  return [i, a, () => o.abort()];
}
function A1(e) {
  return !(e.pointerType === "touch" || Ug());
}
function C1(e, n, i = {}) {
  const [o, a, c] = $g(e, i);
  return o.forEach((d) => {
    let f = !1, y = !1, g;
    const v = () => {
      d.removeEventListener("pointerleave", w);
    }, l = (A) => {
      g && (g(A), g = void 0), v();
    }, h = (A) => {
      f = !1, window.removeEventListener("pointerup", h), window.removeEventListener("pointercancel", h), y && (y = !1, l(A));
    }, S = () => {
      f = !0, window.addEventListener("pointerup", h, a), window.addEventListener("pointercancel", h, a);
    }, w = (A) => {
      if (A.pointerType !== "touch") {
        if (f) {
          y = !0;
          return;
        }
        l(A);
      }
    }, _ = (A) => {
      if (!A1(A))
        return;
      y = !1;
      const T = n(d, A);
      typeof T == "function" && (g = T, d.addEventListener("pointerleave", w, a));
    };
    d.addEventListener("pointerenter", _, a), d.addEventListener("pointerdown", S, a);
  }), c;
}
const Hg = (e, n) => n ? e === n ? !0 : Hg(e, n.parentElement) : !1, hd = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, P1 = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function E1(e) {
  return P1.has(e.tagName) || e.isContentEditable === !0;
}
const M1 = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function b1(e) {
  return M1.has(e.tagName) || e.isContentEditable === !0;
}
const Ys = /* @__PURE__ */ new WeakSet();
function hm(e) {
  return (n) => {
    n.key === "Enter" && e(n);
  };
}
function ju(e, n) {
  e.dispatchEvent(new PointerEvent("pointer" + n, { isPrimary: !0, bubbles: !0 }));
}
const R1 = (e, n) => {
  const i = e.currentTarget;
  if (!i)
    return;
  const o = hm(() => {
    if (Ys.has(i))
      return;
    ju(i, "down");
    const a = hm(() => {
      ju(i, "up");
    }), c = () => ju(i, "cancel");
    i.addEventListener("keyup", a, n), i.addEventListener("blur", c, n);
  });
  i.addEventListener("keydown", o, n), i.addEventListener("blur", () => i.removeEventListener("keydown", o), n);
};
function mm(e) {
  return hd(e) && !Ug();
}
const ym = /* @__PURE__ */ new WeakSet();
function D1(e, n, i = {}) {
  const [o, a, c] = $g(e, i), d = (f) => {
    const y = f.currentTarget;
    if (!mm(f) || ym.has(f))
      return;
    Ys.add(y), i.stopPropagation && ym.add(f);
    const g = n(y, f), v = { ...a, capture: !0 }, l = (w, _) => {
      window.removeEventListener("pointerup", h, v), window.removeEventListener("pointercancel", S, v), Ys.has(y) && Ys.delete(y), mm(w) && typeof g == "function" && g(w, { success: _ });
    }, h = (w) => {
      l(w, y === window || y === document || i.useGlobalTarget || Hg(y, w.target));
    }, S = (w) => {
      l(w, !1);
    };
    window.addEventListener("pointerup", h, v), window.addEventListener("pointercancel", S, v);
  };
  return o.forEach((f) => {
    (i.useGlobalTarget ? window : f).addEventListener("pointerdown", d, a), Ks(f) && (f.addEventListener("focus", (g) => R1(g, a)), !E1(f) && !f.hasAttribute("tabindex") && (f.tabIndex = 0));
  }), c;
}
function md(e) {
  return Yy(e) && "ownerSVGElement" in e;
}
const Qs = /* @__PURE__ */ new WeakMap();
let In;
const Wg = (e, n, i) => (o, a) => a && a[0] ? a[0][e + "Size"] : md(o) && "getBBox" in o ? o.getBBox()[n] : o[i], N1 = /* @__PURE__ */ Wg("inline", "width", "offsetWidth"), I1 = /* @__PURE__ */ Wg("block", "height", "offsetHeight");
function F1({ target: e, borderBoxSize: n }) {
  var i;
  (i = Qs.get(e)) == null || i.forEach((o) => {
    o(e, {
      get width() {
        return N1(e, n);
      },
      get height() {
        return I1(e, n);
      }
    });
  });
}
function O1(e) {
  e.forEach(F1);
}
function j1() {
  typeof ResizeObserver > "u" || (In = new ResizeObserver(O1));
}
function L1(e, n) {
  In || j1();
  const i = zg(e);
  return i.forEach((o) => {
    let a = Qs.get(o);
    a || (a = /* @__PURE__ */ new Set(), Qs.set(o, a)), a.add(n), In == null || In.observe(o);
  }), () => {
    i.forEach((o) => {
      const a = Qs.get(o);
      a == null || a.delete(n), a != null && a.size || In == null || In.unobserve(o);
    });
  };
}
const Xs = /* @__PURE__ */ new Set();
let Kr;
function V1() {
  Kr = () => {
    const e = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    Xs.forEach((n) => n(e));
  }, window.addEventListener("resize", Kr);
}
function B1(e) {
  return Xs.add(e), Kr || V1(), () => {
    Xs.delete(e), !Xs.size && typeof Kr == "function" && (window.removeEventListener("resize", Kr), Kr = void 0);
  };
}
function gm(e, n) {
  return typeof e == "function" ? B1(e) : L1(e, n);
}
function z1(e) {
  return md(e) && e.tagName === "svg";
}
const U1 = [...Lg, Ve, Ut], $1 = (e) => U1.find(jg(e)), vm = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), Yr = () => ({
  x: vm(),
  y: vm()
}), Sm = () => ({ min: 0, max: 0 }), Ue = () => ({
  x: Sm(),
  y: Sm()
}), H1 = /* @__PURE__ */ new WeakMap();
function ka(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function lo(e) {
  return typeof e == "string" || Array.isArray(e);
}
const yd = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], gd = ["initial", ...yd];
function Aa(e) {
  return ka(e.animate) || gd.some((n) => lo(e[n]));
}
function Gg(e) {
  return !!(Aa(e) || e.variants);
}
function W1(e, n, i) {
  for (const o in n) {
    const a = n[o], c = i[o];
    if (Xe(a))
      e.addValue(o, a);
    else if (Xe(c))
      e.addValue(o, qr(a, { owner: e }));
    else if (c !== a)
      if (e.hasValue(o)) {
        const d = e.getValue(o);
        d.liveStyle === !0 ? d.jump(a) : d.hasAnimated || d.set(a);
      } else {
        const d = e.getStaticValue(o);
        e.addValue(o, qr(d !== void 0 ? d : a, { owner: e }));
      }
  }
  for (const o in i)
    n[o] === void 0 && e.removeValue(o);
  return n;
}
const _c = { current: null }, Kg = { current: !1 }, G1 = typeof window < "u";
function K1() {
  if (Kg.current = !0, !!G1)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), n = () => _c.current = e.matches;
      e.addEventListener("change", n), n();
    } else
      _c.current = !1;
}
const wm = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let da = {};
function Yg(e) {
  da = e;
}
function Y1() {
  return da;
}
class Q1 {
  /**
   * This method takes React props and returns found MotionValues. For example, HTML
   * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
   *
   * This isn't an abstract method as it needs calling in the constructor, but it is
   * intended to be one.
   */
  scrapeMotionValuesFromProps(n, i, o) {
    return {};
  }
  constructor({ parent: n, props: i, presenceContext: o, reducedMotionConfig: a, skipAnimations: c, blockInitialAnimation: d, visualState: f }, y = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = ad, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const S = it.now();
      this.renderScheduledAt < S && (this.renderScheduledAt = S, Ae.render(this.render, !1, !0));
    };
    const { latestValues: g, renderState: v } = f;
    this.latestValues = g, this.baseTarget = { ...g }, this.initialValues = i.initial ? { ...g } : {}, this.renderState = v, this.parent = n, this.props = i, this.presenceContext = o, this.depth = n ? n.depth + 1 : 0, this.reducedMotionConfig = a, this.skipAnimationsConfig = c, this.options = y, this.blockInitialAnimation = !!d, this.isControllingVariants = Aa(i), this.isVariantNode = Gg(i), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(n && n.current);
    const { willChange: l, ...h } = this.scrapeMotionValuesFromProps(i, {}, this);
    for (const S in h) {
      const w = h[S];
      g[S] !== void 0 && Xe(w) && w.set(g[S]);
    }
  }
  mount(n) {
    var i, o;
    if (this.hasBeenMounted)
      for (const a in this.initialValues)
        (i = this.values.get(a)) == null || i.jump(this.initialValues[a]), this.latestValues[a] = this.initialValues[a];
    this.current = n, H1.set(n, this), this.projection && !this.projection.instance && this.projection.mount(n), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((a, c) => this.bindToMotionValue(c, a)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Kg.current || K1(), this.shouldReduceMotion = _c.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (o = this.parent) == null || o.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    var n;
    this.projection && this.projection.unmount(), zn(this.notifyUpdate), zn(this.render), this.valueSubscriptions.forEach((i) => i()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), (n = this.parent) == null || n.removeChild(this);
    for (const i in this.events)
      this.events[i].clear();
    for (const i in this.features) {
      const o = this.features[i];
      o && (o.unmount(), o.isMounted = !1);
    }
    this.current = null;
  }
  addChild(n) {
    this.children.add(n), this.enteringChildren ?? (this.enteringChildren = /* @__PURE__ */ new Set()), this.enteringChildren.add(n);
  }
  removeChild(n) {
    this.children.delete(n), this.enteringChildren && this.enteringChildren.delete(n);
  }
  bindToMotionValue(n, i) {
    if (this.valueSubscriptions.has(n) && this.valueSubscriptions.get(n)(), i.accelerate && Mg.has(n) && this.current instanceof HTMLElement) {
      const { factory: d, keyframes: f, times: y, ease: g, duration: v } = i.accelerate, l = new Pg({
        element: this.current,
        name: n,
        keyframes: f,
        times: y,
        ease: g,
        duration: /* @__PURE__ */ mt(v)
      }), h = d(l);
      this.valueSubscriptions.set(n, () => {
        h(), l.cancel();
      });
      return;
    }
    const o = oi.has(n);
    o && this.onBindTransform && this.onBindTransform();
    const a = i.on("change", (d) => {
      this.latestValues[n] = d, this.props.onUpdate && Ae.preRender(this.notifyUpdate), o && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
    });
    let c;
    typeof window < "u" && window.MotionCheckAppearSync && (c = window.MotionCheckAppearSync(this, n, i)), this.valueSubscriptions.set(n, () => {
      a(), c && c();
    });
  }
  sortNodePosition(n) {
    return !this.current || !this.sortInstanceNodePosition || this.type !== n.type ? 0 : this.sortInstanceNodePosition(this.current, n.current);
  }
  updateFeatures() {
    let n = "animation";
    for (n in da) {
      const i = da[n];
      if (!i)
        continue;
      const { isEnabled: o, Feature: a } = i;
      if (!this.features[n] && a && o(this.props) && (this.features[n] = new a(this)), this.features[n]) {
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
  setStaticValue(n, i) {
    this.latestValues[n] = i;
  }
  /**
   * Update the provided props. Ensure any newly-added motion values are
   * added to our map, old ones removed, and listeners updated.
   */
  update(n, i) {
    (n.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = n, this.prevPresenceContext = this.presenceContext, this.presenceContext = i;
    for (let o = 0; o < wm.length; o++) {
      const a = wm[o];
      this.propEventSubscriptions[a] && (this.propEventSubscriptions[a](), delete this.propEventSubscriptions[a]);
      const c = "on" + a, d = n[c];
      d && (this.propEventSubscriptions[a] = this.on(a, d));
    }
    this.prevMotionValues = W1(this, this.scrapeMotionValuesFromProps(n, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
    const i = this.getClosestVariantNode();
    if (i)
      return i.variantChildren && i.variantChildren.add(n), () => i.variantChildren.delete(n);
  }
  /**
   * Add a motion value and bind it to this visual element.
   */
  addValue(n, i) {
    const o = this.values.get(n);
    i !== o && (o && this.removeValue(n), this.bindToMotionValue(n, i), this.values.set(n, i), this.latestValues[n] = i.get());
  }
  /**
   * Remove a motion value and unbind any active subscriptions.
   */
  removeValue(n) {
    this.values.delete(n);
    const i = this.valueSubscriptions.get(n);
    i && (i(), this.valueSubscriptions.delete(n)), delete this.latestValues[n], this.removeValueFromRenderState(n, this.renderState);
  }
  /**
   * Check whether we have a motion value for this key
   */
  hasValue(n) {
    return this.values.has(n);
  }
  getValue(n, i) {
    if (this.props.values && this.props.values[n])
      return this.props.values[n];
    let o = this.values.get(n);
    return o === void 0 && i !== void 0 && (o = qr(i === null ? void 0 : i, { owner: this }), this.addValue(n, o)), o;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(n, i) {
    let o = this.latestValues[n] !== void 0 || !this.current ? this.latestValues[n] : this.getBaseTargetFromProps(this.props, n) ?? this.readValueFromInstance(this.current, n, this.options);
    return o != null && (typeof o == "string" && (Ky(o) || Qy(o)) ? o = parseFloat(o) : !$1(o) && Ut.test(i) && (o = Bg(n, i)), this.setBaseTarget(n, Xe(o) ? o.get() : o)), Xe(o) ? o.get() : o;
  }
  /**
   * Set the base target to later animate back to. This is currently
   * only hydrated on creation and when we first read a value.
   */
  setBaseTarget(n, i) {
    this.baseTarget[n] = i;
  }
  /**
   * Find the base target for a value thats been removed from all animation
   * props.
   */
  getBaseTarget(n) {
    var c;
    const { initial: i } = this.props;
    let o;
    if (typeof i == "string" || typeof i == "object") {
      const d = cd(this.props, i, (c = this.presenceContext) == null ? void 0 : c.custom);
      d && (o = d[n]);
    }
    if (i && o !== void 0)
      return o;
    const a = this.getBaseTargetFromProps(this.props, n);
    return a !== void 0 && !Xe(a) ? a : this.initialValues[n] !== void 0 && o === void 0 ? void 0 : this.baseTarget[n];
  }
  on(n, i) {
    return this.events[n] || (this.events[n] = new Jc()), this.events[n].add(i);
  }
  notify(n, ...i) {
    this.events[n] && this.events[n].notify(...i);
  }
  scheduleRenderMicrotask() {
    pd.render(this.render);
  }
}
class Qg extends Q1 {
  constructor() {
    super(...arguments), this.KeyframeResolver = T1;
  }
  sortInstanceNodePosition(n, i) {
    return n.compareDocumentPosition(i) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(n, i) {
    const o = n.style;
    return o ? o[i] : void 0;
  }
  removeValueFromRenderState(n, { vars: i, style: o }) {
    delete i[n], delete o[n];
  }
  handleChildMotionValue() {
    this.childSubscription && (this.childSubscription(), delete this.childSubscription);
    const { children: n } = this.props;
    Xe(n) && (this.childSubscription = n.on("change", (i) => {
      this.current && (this.current.textContent = `${i}`);
    }));
  }
}
class $n {
  constructor(n) {
    this.isMounted = !1, this.node = n;
  }
  update() {
  }
}
function Xg({ top: e, left: n, right: i, bottom: o }) {
  return {
    x: { min: n, max: i },
    y: { min: e, max: o }
  };
}
function X1({ x: e, y: n }) {
  return { top: n.min, right: e.max, bottom: n.max, left: e.min };
}
function Z1(e, n) {
  if (!n)
    return e;
  const i = n({ x: e.left, y: e.top }), o = n({ x: e.right, y: e.bottom });
  return {
    top: i.y,
    left: i.x,
    bottom: o.y,
    right: o.x
  };
}
function Lu(e) {
  return e === void 0 || e === 1;
}
function Tc({ scale: e, scaleX: n, scaleY: i }) {
  return !Lu(e) || !Lu(n) || !Lu(i);
}
function ir(e) {
  return Tc(e) || Zg(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function Zg(e) {
  return xm(e.x) || xm(e.y);
}
function xm(e) {
  return e && e !== "0%";
}
function fa(e, n, i) {
  const o = e - i, a = n * o;
  return i + a;
}
function _m(e, n, i, o, a) {
  return a !== void 0 && (e = fa(e, a, o)), fa(e, i, o) + n;
}
function kc(e, n = 0, i = 1, o, a) {
  e.min = _m(e.min, n, i, o, a), e.max = _m(e.max, n, i, o, a);
}
function Jg(e, { x: n, y: i }) {
  kc(e.x, n.translate, n.scale, n.originPoint), kc(e.y, i.translate, i.scale, i.originPoint);
}
const Tm = 0.999999999999, km = 1.0000000000001;
function J1(e, n, i, o = !1) {
  var f;
  const a = i.length;
  if (!a)
    return;
  n.x = n.y = 1;
  let c, d;
  for (let y = 0; y < a; y++) {
    c = i[y], d = c.projectionDelta;
    const { visualElement: g } = c.options;
    g && g.props.style && g.props.style.display === "contents" || (o && c.options.layoutScroll && c.scroll && c !== c.root && (Jt(e.x, -c.scroll.offset.x), Jt(e.y, -c.scroll.offset.y)), d && (n.x *= d.x.scale, n.y *= d.y.scale, Jg(e, d)), o && ir(c.latestValues) && Zs(e, c.latestValues, (f = c.layout) == null ? void 0 : f.layoutBox));
  }
  n.x < km && n.x > Tm && (n.x = 1), n.y < km && n.y > Tm && (n.y = 1);
}
function Jt(e, n) {
  e.min += n, e.max += n;
}
function Am(e, n, i, o, a = 0.5) {
  const c = Te(e.min, e.max, a);
  kc(e, n, i, c, o);
}
function Cm(e, n) {
  return typeof e == "string" ? parseFloat(e) / 100 * (n.max - n.min) : e;
}
function Zs(e, n, i) {
  const o = i ?? e;
  Am(e.x, Cm(n.x, o.x), n.scaleX, n.scale, n.originX), Am(e.y, Cm(n.y, o.y), n.scaleY, n.scale, n.originY);
}
function qg(e, n) {
  return Xg(Z1(e.getBoundingClientRect(), n));
}
function q1(e, n, i) {
  const o = qg(e, i), { scroll: a } = n;
  return a && (Jt(o.x, a.offset.x), Jt(o.y, a.offset.y)), o;
}
const eT = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, tT = ii.length;
function nT(e, n, i) {
  let o = "", a = !0;
  for (let d = 0; d < tT; d++) {
    const f = ii[d], y = e[f];
    if (y === void 0)
      continue;
    let g = !0;
    if (typeof y == "number")
      g = y === (f.startsWith("scale") ? 1 : 0);
    else {
      const v = parseFloat(y);
      g = f.startsWith("scale") ? v === 1 : v === 0;
    }
    if (!g || i) {
      const v = xc(y, ca[f]);
      if (!g) {
        a = !1;
        const l = eT[f] || f;
        o += `${l}(${v}) `;
      }
      i && (n[f] = v);
    }
  }
  const c = e.pathRotation;
  return c && (a = !1, o += `rotate(${xc(c, ca.pathRotation)}) `), o = o.trim(), i ? o = i(n, a ? "" : o) : a && (o = "none"), o;
}
function vd(e, n, i) {
  const { style: o, vars: a, transformOrigin: c } = e;
  let d = !1, f = !1;
  for (const y in n) {
    const g = n[y];
    if (oi.has(y)) {
      d = !0;
      continue;
    } else if (cg(y)) {
      a[y] = g;
      continue;
    } else {
      const v = xc(g, ca[y]);
      y.startsWith("origin") ? (f = !0, c[y] = v) : o[y] = v;
    }
  }
  if (n.transform || (d || i ? o.transform = nT(n, e.transform, i) : o.transform && (o.transform = "none")), f) {
    const { originX: y = "50%", originY: g = "50%", originZ: v = 0 } = c;
    o.transformOrigin = `${y} ${g} ${v}`;
  }
}
function ev(e, { style: n, vars: i }, o, a) {
  const c = e.style;
  let d;
  for (d in n)
    c[d] = n[d];
  a == null || a.applyProjectionStyles(c, o);
  for (d in i)
    c.setProperty(d, i[d]);
}
function Pm(e, n) {
  return n.max === n.min ? 0 : e / (n.max - n.min) * 100;
}
const Yi = {
  correct: (e, n) => {
    if (!n.target)
      return e;
    if (typeof e == "string")
      if (re.test(e))
        e = parseFloat(e);
      else
        return e;
    const i = Pm(e, n.target.x), o = Pm(e, n.target.y);
    return `${i}% ${o}%`;
  }
}, rT = {
  correct: (e, { treeScale: n, projectionDelta: i }) => {
    const o = e, a = Ut.parse(e);
    if (a.length > 5)
      return o;
    const c = Ut.createTransformer(e), d = typeof a[0] != "number" ? 1 : 0, f = i.x.scale * n.x, y = i.y.scale * n.y;
    a[0 + d] /= f, a[1 + d] /= y;
    const g = Te(f, y, 0.5);
    return typeof a[2 + d] == "number" && (a[2 + d] /= g), typeof a[3 + d] == "number" && (a[3 + d] /= g), c(a);
  }
}, Ac = {
  borderRadius: {
    ...Yi,
    applyTo: [...fd]
  },
  borderTopLeftRadius: Yi,
  borderTopRightRadius: Yi,
  borderBottomLeftRadius: Yi,
  borderBottomRightRadius: Yi,
  boxShadow: rT
};
function tv(e, { layout: n, layoutId: i }) {
  return oi.has(e) || e.startsWith("origin") || (n || i !== void 0) && (!!Ac[e] || e === "opacity");
}
function Sd(e, n, i) {
  var d;
  const o = e.style, a = n == null ? void 0 : n.style, c = {};
  if (!o)
    return c;
  for (const f in o)
    (Xe(o[f]) || a && Xe(a[f]) || tv(f, e) || ((d = i == null ? void 0 : i.getValue(f)) == null ? void 0 : d.liveStyle) !== void 0) && (c[f] = o[f]);
  return c;
}
function iT(e) {
  return window.getComputedStyle(e);
}
class oT extends Qg {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = ev;
  }
  readValueFromInstance(n, i) {
    var o;
    if (oi.has(i))
      return (o = this.projection) != null && o.isProjecting ? cc(i) : k_(n, i);
    {
      const a = iT(n), c = (cg(i) ? a.getPropertyValue(i) : a[i]) || 0;
      return typeof c == "string" ? c.trim() : c;
    }
  }
  measureInstanceViewportBox(n, { transformPagePoint: i }) {
    return qg(n, i);
  }
  build(n, i, o) {
    vd(n, i, o.transformTemplate);
  }
  scrapeMotionValuesFromProps(n, i, o) {
    return Sd(n, i, o);
  }
}
const sT = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, aT = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function lT(e, n, i = 1, o = 0, a = !0) {
  e.pathLength = 1;
  const c = a ? sT : aT;
  e[c.offset] = `${-o}`, e[c.array] = `${n} ${i}`;
}
const uT = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function nv(e, {
  attrX: n,
  attrY: i,
  attrScale: o,
  pathLength: a,
  pathSpacing: c = 1,
  pathOffset: d = 0,
  // This is object creation, which we try to avoid per-frame.
  ...f
}, y, g, v) {
  if (vd(e, f, g), y) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: l, style: h } = e;
  l.transform && (h.transform = l.transform, delete l.transform), (h.transform || l.transformOrigin) && (h.transformOrigin = l.transformOrigin ?? "50% 50%", delete l.transformOrigin), h.transform && (h.transformBox = (v == null ? void 0 : v.transformBox) ?? "fill-box", delete l.transformBox);
  for (const S of uT)
    l[S] !== void 0 && (h[S] = l[S], delete l[S]);
  n !== void 0 && (l.x = n), i !== void 0 && (l.y = i), o !== void 0 && (l.scale = o), a !== void 0 && lT(l, a, c, d, !1);
}
const rv = /* @__PURE__ */ new Set([
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
]), iv = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function cT(e, n, i, o) {
  ev(e, n, void 0, o);
  for (const a in n.attrs)
    e.setAttribute(rv.has(a) ? a : dd(a), n.attrs[a]);
}
function ov(e, n, i) {
  const o = Sd(e, n, i);
  for (const a in e)
    if (Xe(e[a]) || Xe(n[a])) {
      const c = ii.indexOf(a) !== -1 ? "attr" + a.charAt(0).toUpperCase() + a.substring(1) : a;
      o[c] = e[a];
    }
  return o;
}
class dT extends Qg {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Ue;
  }
  getBaseTargetFromProps(n, i) {
    return n[i];
  }
  readValueFromInstance(n, i) {
    if (oi.has(i)) {
      const o = Vg(i);
      return o && o.default || 0;
    }
    return i = rv.has(i) ? i : dd(i), n.getAttribute(i);
  }
  scrapeMotionValuesFromProps(n, i, o) {
    return ov(n, i, o);
  }
  build(n, i, o) {
    nv(n, i, this.isSVGTag, o.transformTemplate, o.style);
  }
  renderInstance(n, i, o, a) {
    cT(n, i, o, a);
  }
  mount(n) {
    this.isSVGTag = iv(n.tagName), super.mount(n);
  }
}
const fT = gd.length;
function sv(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const i = e.parent ? sv(e.parent) || {} : {};
    return e.props.initial !== void 0 && (i.initial = e.props.initial), i;
  }
  const n = {};
  for (let i = 0; i < fT; i++) {
    const o = gd[i], a = e.props[o];
    (lo(a) || a === !1) && (n[o] = a);
  }
  return n;
}
function av(e, n) {
  if (!Array.isArray(n))
    return !1;
  const i = n.length;
  if (i !== e.length)
    return !1;
  for (let o = 0; o < i; o++)
    if (n[o] !== e[o])
      return !1;
  return !0;
}
const pT = [...yd].reverse(), hT = yd.length;
function mT(e) {
  return (n) => Promise.all(n.map(({ animation: i, options: o }) => f1(e, i, o)));
}
function yT(e) {
  let n = mT(e), i = Em(), o = !0, a = !1;
  const c = (g) => (v, l) => {
    var S;
    const h = cr(e, l, g === "exit" ? (S = e.presenceContext) == null ? void 0 : S.custom : void 0);
    if (h) {
      const { transition: w, transitionEnd: _, ...A } = h;
      v = { ...v, ...A, ..._ };
    }
    return v;
  };
  function d(g) {
    n = g(e);
  }
  function f(g) {
    const { props: v } = e, l = sv(e.parent) || {}, h = [], S = /* @__PURE__ */ new Set();
    let w = {}, _ = 1 / 0;
    for (let T = 0; T < hT; T++) {
      const M = pT[T], R = i[M], D = v[M] !== void 0 ? v[M] : l[M], j = lo(D), G = M === g ? R.isActive : null;
      G === !1 && (_ = T);
      let K = D === l[M] && D !== v[M] && j;
      if (K && (o || a) && e.manuallyAnimateOnMount && (K = !1), R.protectedKeys = { ...w }, // If it isn't active and hasn't *just* been set as inactive
      !R.isActive && G === null || // If we didn't and don't have any defined prop for this animation type
      !D && !R.prevProp || // Or if the prop doesn't define an animation
      ka(D) || typeof D == "boolean")
        continue;
      if (M === "exit" && R.isActive && G !== !0) {
        R.prevResolvedValues && (w = {
          ...w,
          ...R.prevResolvedValues
        });
        continue;
      }
      const $ = gT(R.prevProp, D);
      let W = $ || // If we're making this variant active, we want to always make it active
      M === g && R.isActive && !K && j || // If we removed a higher-priority variant (i is in reverse order)
      T > _ && j, X = !1;
      const te = Array.isArray(D) ? D : [D];
      let de = te.reduce(c(M), {});
      G === !1 && (de = {});
      const { prevResolvedValues: he = {} } = R, Q = {
        ...he,
        ...de
      }, we = (z) => {
        W = !0, S.has(z) && (X = !0, S.delete(z)), R.needsAnimating[z] = !0;
        const ee = e.getValue(z);
        ee && (ee.liveStyle = !1);
      };
      for (const z in Q) {
        const ee = de[z], Y = he[z];
        if (w.hasOwnProperty(z))
          continue;
        let N = !1;
        yc(ee) && yc(Y) ? N = !av(ee, Y) || $ : N = ee !== Y, N ? ee != null ? we(z) : S.add(z) : ee !== void 0 && S.has(z) ? we(z) : R.protectedKeys[z] = !0;
      }
      R.prevProp = D, R.prevResolvedValues = de, R.isActive && (w = { ...w, ...de }), (o || a) && e.blockInitialAnimation && (W = !1);
      const ce = K && $;
      W && (!ce || X) && h.push(...te.map((z) => {
        const ee = { type: M };
        if (typeof z == "string" && (o || a) && !ce && e.manuallyAnimateOnMount && e.parent) {
          const { parent: Y } = e, N = cr(Y, z);
          if (Y.enteringChildren && N) {
            const { delayChildren: L } = N.transition || {};
            ee.delay = bg(Y.enteringChildren, e, L);
          }
        }
        return {
          animation: z,
          options: ee
        };
      }));
    }
    if (S.size) {
      const T = {};
      if (typeof v.initial != "boolean") {
        const M = cr(e, Array.isArray(v.initial) ? v.initial[0] : v.initial);
        M && M.transition && (T.transition = M.transition);
      }
      S.forEach((M) => {
        const R = e.getBaseTarget(M), D = e.getValue(M);
        D && (D.liveStyle = !0), T[M] = R ?? null;
      }), h.push({ animation: T });
    }
    let A = !!h.length;
    return o && (v.initial === !1 || v.initial === v.animate) && !e.manuallyAnimateOnMount && (A = !1), o = !1, a = !1, A ? n(h) : Promise.resolve();
  }
  function y(g, v) {
    var h;
    if (i[g].isActive === v)
      return Promise.resolve();
    (h = e.variantChildren) == null || h.forEach((S) => {
      var w;
      return (w = S.animationState) == null ? void 0 : w.setActive(g, v);
    }), i[g].isActive = v;
    const l = f(g);
    for (const S in i)
      i[S].protectedKeys = {};
    return l;
  }
  return {
    animateChanges: f,
    setActive: y,
    setAnimateFunction: d,
    getState: () => i,
    reset: () => {
      i = Em(), a = !0;
    }
  };
}
function gT(e, n) {
  return typeof n == "string" ? n !== e : Array.isArray(n) ? !av(n, e) : !1;
}
function rr(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Em() {
  return {
    animate: rr(!0),
    whileInView: rr(),
    whileHover: rr(),
    whileTap: rr(),
    whileDrag: rr(),
    whileFocus: rr(),
    exit: rr()
  };
}
function Cc(e, n) {
  e.min = n.min, e.max = n.max;
}
function Lt(e, n) {
  Cc(e.x, n.x), Cc(e.y, n.y);
}
function Mm(e, n) {
  e.translate = n.translate, e.scale = n.scale, e.originPoint = n.originPoint, e.origin = n.origin;
}
const lv = 1e-4, vT = 1 - lv, ST = 1 + lv, uv = 0.01, wT = 0 - uv, xT = 0 + uv;
function ot(e) {
  return e.max - e.min;
}
function _T(e, n, i) {
  return Math.abs(e - n) <= i;
}
function bm(e, n, i, o = 0.5) {
  e.origin = o, e.originPoint = Te(n.min, n.max, e.origin), e.scale = ot(i) / ot(n), e.translate = Te(i.min, i.max, e.origin) - e.originPoint, (e.scale >= vT && e.scale <= ST || isNaN(e.scale)) && (e.scale = 1), (e.translate >= wT && e.translate <= xT || isNaN(e.translate)) && (e.translate = 0);
}
function to(e, n, i, o) {
  bm(e.x, n.x, i.x, o ? o.originX : void 0), bm(e.y, n.y, i.y, o ? o.originY : void 0);
}
function Rm(e, n, i, o = 0) {
  const a = o ? Te(i.min, i.max, o) : i.min;
  e.min = a + n.min, e.max = e.min + ot(n);
}
function TT(e, n, i, o) {
  Rm(e.x, n.x, i.x, o == null ? void 0 : o.x), Rm(e.y, n.y, i.y, o == null ? void 0 : o.y);
}
function Dm(e, n, i, o = 0) {
  const a = o ? Te(i.min, i.max, o) : i.min;
  e.min = n.min - a, e.max = e.min + ot(n);
}
function pa(e, n, i, o) {
  Dm(e.x, n.x, i.x, o == null ? void 0 : o.x), Dm(e.y, n.y, i.y, o == null ? void 0 : o.y);
}
function Nm(e, n, i, o, a) {
  return e -= n, e = fa(e, 1 / i, o), a !== void 0 && (e = fa(e, 1 / a, o)), e;
}
function kT(e, n = 0, i = 1, o = 0.5, a, c = e, d = e) {
  if (en.test(n) && (n = parseFloat(n), n = Te(d.min, d.max, n / 100) - d.min), typeof n != "number")
    return;
  let f = Te(c.min, c.max, o);
  e === c && (f -= n), e.min = Nm(e.min, n, i, f, a), e.max = Nm(e.max, n, i, f, a);
}
function Im(e, n, [i, o, a], c, d) {
  kT(e, n[i], n[o], n[a], n.scale, c, d);
}
const AT = ["x", "scaleX", "originX"], CT = ["y", "scaleY", "originY"];
function Fm(e, n, i, o) {
  Im(e.x, n, AT, i ? i.x : void 0, o ? o.x : void 0), Im(e.y, n, CT, i ? i.y : void 0, o ? o.y : void 0);
}
function Om(e) {
  return e.translate === 0 && e.scale === 1;
}
function cv(e) {
  return Om(e.x) && Om(e.y);
}
function jm(e, n) {
  return e.min === n.min && e.max === n.max;
}
function PT(e, n) {
  return jm(e.x, n.x) && jm(e.y, n.y);
}
function Lm(e, n) {
  return Math.round(e.min) === Math.round(n.min) && Math.round(e.max) === Math.round(n.max);
}
function dv(e, n) {
  return Lm(e.x, n.x) && Lm(e.y, n.y);
}
function Vm(e) {
  return ot(e.x) / ot(e.y);
}
function Bm(e, n) {
  return e.translate === n.translate && e.scale === n.scale && e.originPoint === n.originPoint;
}
function Zt(e) {
  return [e("x"), e("y")];
}
function ET(e, n, i) {
  let o = "";
  const a = e.x.translate / n.x, c = e.y.translate / n.y, d = (i == null ? void 0 : i.z) || 0;
  if ((a || c || d) && (o = `translate3d(${a}px, ${c}px, ${d}px) `), (n.x !== 1 || n.y !== 1) && (o += `scale(${1 / n.x}, ${1 / n.y}) `), i) {
    const { transformPerspective: g, rotate: v, pathRotation: l, rotateX: h, rotateY: S, skewX: w, skewY: _ } = i;
    g && (o = `perspective(${g}px) ${o}`), v && (o += `rotate(${v}deg) `), l && (o += `rotate(${l}deg) `), h && (o += `rotateX(${h}deg) `), S && (o += `rotateY(${S}deg) `), w && (o += `skewX(${w}deg) `), _ && (o += `skewY(${_}deg) `);
  }
  const f = e.x.scale * n.x, y = e.y.scale * n.y;
  return (f !== 1 || y !== 1) && (o += `scale(${f}, ${y})`), o || "none";
}
const MT = fd.length, zm = (e) => typeof e == "string" ? parseFloat(e) : e, Um = (e) => typeof e == "number" || re.test(e);
function bT(e, n, i, o, a, c) {
  a ? (e.opacity = Te(0, i.opacity ?? 1, RT(o)), e.opacityExit = Te(n.opacity ?? 1, 0, DT(o))) : c && (e.opacity = Te(n.opacity ?? 1, i.opacity ?? 1, o));
  for (let d = 0; d < MT; d++) {
    const f = fd[d];
    let y = $m(n, f), g = $m(i, f);
    if (y === void 0 && g === void 0)
      continue;
    y || (y = 0), g || (g = 0), y === 0 || g === 0 || Um(y) === Um(g) ? (e[f] = Math.max(Te(zm(y), zm(g), o), 0), (en.test(g) || en.test(y)) && (e[f] += "%")) : e[f] = g;
  }
  (n.rotate || i.rotate) && (e.rotate = Te(n.rotate || 0, i.rotate || 0, o));
}
function $m(e, n) {
  return e[n] !== void 0 ? e[n] : e.borderRadius;
}
const RT = /* @__PURE__ */ fv(0, 0.5, ig), DT = /* @__PURE__ */ fv(0.5, 0.95, bt);
function fv(e, n, i) {
  return (o) => o < e ? 0 : o > n ? 1 : i(/* @__PURE__ */ so(e, n, o));
}
function NT(e, n, i) {
  const o = Xe(e) ? e : qr(e);
  return o.start(ud("", o, n, i)), o.animation;
}
function uo(e, n, i, o = { passive: !0 }) {
  return e.addEventListener(n, i, o), () => e.removeEventListener(n, i, o);
}
const IT = (e, n) => e.depth - n.depth;
class FT {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(n) {
    Zc(this.children, n), this.isDirty = !0;
  }
  remove(n) {
    oa(this.children, n), this.isDirty = !0;
  }
  forEach(n) {
    this.isDirty && this.children.sort(IT), this.isDirty = !1, this.children.forEach(n);
  }
}
function OT(e, n) {
  const i = it.now(), o = ({ timestamp: a }) => {
    const c = a - i;
    c >= n && (zn(o), e(c - n));
  };
  return Ae.setup(o, !0), () => zn(o);
}
function Js(e) {
  return Xe(e) ? e.get() : e;
}
class jT {
  constructor() {
    this.members = [];
  }
  add(n) {
    Zc(this.members, n);
    for (let i = this.members.length - 1; i >= 0; i--) {
      const o = this.members[i];
      if (o === n || o === this.lead || o === this.prevLead)
        continue;
      const a = o.instance;
      (!a || a.isConnected === !1) && !o.snapshot && (oa(this.members, o), o.unmount());
    }
    n.scheduleRender();
  }
  remove(n) {
    if (oa(this.members, n), n === this.prevLead && (this.prevLead = void 0), n === this.lead) {
      const i = this.members[this.members.length - 1];
      i && this.promote(i);
    }
  }
  relegate(n) {
    var i;
    for (let o = this.members.indexOf(n) - 1; o >= 0; o--) {
      const a = this.members[o];
      if (a.isPresent !== !1 && ((i = a.instance) == null ? void 0 : i.isConnected) !== !1)
        return this.promote(a), !0;
    }
    return !1;
  }
  promote(n, i) {
    var a;
    const o = this.lead;
    if (n !== o && (this.prevLead = o, this.lead = n, n.show(), o)) {
      o.updateSnapshot(), n.scheduleRender();
      const { layoutDependency: c } = o.options, { layoutDependency: d } = n.options;
      (c === void 0 || c !== d) && (n.resumeFrom = o, i && (o.preserveOpacity = !0), o.snapshot && (n.snapshot = o.snapshot, n.snapshot.latestValues = o.animationValues || o.latestValues), (a = n.root) != null && a.isUpdating && (n.isLayoutDirty = !0)), n.options.crossfade === !1 && o.hide();
    }
  }
  exitAnimationComplete() {
    this.members.forEach((n) => {
      var i, o, a, c, d;
      (o = (i = n.options).onExitComplete) == null || o.call(i), (d = (a = n.resumingFrom) == null ? void 0 : (c = a.options).onExitComplete) == null || d.call(c);
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
const qs = {
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
}, Vu = ["", "X", "Y", "Z"], LT = 1e3;
let VT = 0;
function Bu(e, n, i, o) {
  const { latestValues: a } = n;
  a[e] && (i[e] = a[e], n.setStaticValue(e, 0), o && (o[e] = 0));
}
function pv(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: n } = e.options;
  if (!n)
    return;
  const i = Fg(n);
  if (window.MotionHasOptimisedAnimation(i, "transform")) {
    const { layout: a, layoutId: c } = e.options;
    window.MotionCancelOptimisedAnimation(i, "transform", Ae, !(a || c));
  }
  const { parent: o } = e;
  o && !o.hasCheckedOptimisedAppear && pv(o);
}
function hv({ attachResizeListener: e, defaultParent: n, measureScroll: i, checkIsScrollRoot: o, resetTransform: a }) {
  return class {
    constructor(d = {}, f = n == null ? void 0 : n()) {
      this.id = VT++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(UT), this.nodes.forEach(YT), this.nodes.forEach(QT), this.nodes.forEach($T);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = d, this.root = f ? f.root || f : this, this.path = f ? [...f.path, f] : [], this.parent = f, this.depth = f ? f.depth + 1 : 0;
      for (let y = 0; y < this.path.length; y++)
        this.path[y].shouldResetTransform = !0;
      this.root === this && (this.nodes = new FT());
    }
    addEventListener(d, f) {
      return this.eventHandlers.has(d) || this.eventHandlers.set(d, new Jc()), this.eventHandlers.get(d).add(f);
    }
    notifyListeners(d, ...f) {
      const y = this.eventHandlers.get(d);
      y && y.notify(...f);
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
      this.isSVG = md(d) && !z1(d), this.instance = d;
      const { layoutId: f, layout: y, visualElement: g } = this.options;
      if (g && !g.current && g.mount(d), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (y || f) && (this.isLayoutDirty = !0), e) {
        let v, l = 0;
        const h = () => this.root.updateBlockedByResize = !1;
        Ae.read(() => {
          l = window.innerWidth;
        }), e(d, () => {
          const S = window.innerWidth;
          S !== l && (l = S, this.root.updateBlockedByResize = !0, v && v(), v = OT(h, 250), qs.hasAnimatedSinceResize && (qs.hasAnimatedSinceResize = !1, this.nodes.forEach(Gm)));
        });
      }
      f && this.root.registerSharedNode(f, this), this.options.animate !== !1 && g && (f || y) && this.addEventListener("didUpdate", ({ delta: v, hasLayoutChanged: l, hasRelativeLayoutChanged: h, layout: S }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const w = this.options.transition || g.getDefaultTransition() || ek, { onLayoutAnimationStart: _, onLayoutAnimationComplete: A } = g.getProps(), T = !this.targetLayout || !dv(this.targetLayout, S), M = !l && h;
        if (this.options.layoutRoot || this.resumeFrom || M || l && (T || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const R = {
            ...ld(w, "layout"),
            onPlay: _,
            onComplete: A
          };
          (g.shouldReduceMotion || this.options.layoutRoot) && (R.delay = 0, R.type = !1), this.startAnimation(R), this.setAnimationOrigin(v, M, R.path);
        } else
          l || Gm(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = S;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const d = this.getStack();
      d && d.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), zn(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(XT), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && pv(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let v = 0; v < this.path.length; v++) {
        const l = this.path[v];
        l.shouldResetTransform = !0, (typeof l.latestValues.x == "string" || typeof l.latestValues.y == "string") && (l.isLayoutDirty = !0), l.updateScroll("snapshot"), l.options.layoutRoot && l.willUpdate(!1);
      }
      const { layoutId: f, layout: y } = this.options;
      if (f === void 0 && !y)
        return;
      const g = this.getTransformTemplate();
      this.prevTransformTemplateValue = g ? g(this.latestValues, "") : void 0, this.updateSnapshot(), d && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const y = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), y && this.nodes.forEach(WT), this.nodes.forEach(Hm);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(Wm);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(GT), this.nodes.forEach(KT), this.nodes.forEach(BT), this.nodes.forEach(zT)) : this.nodes.forEach(Wm), this.clearAllSnapshots();
      const f = it.now();
      Qe.delta = tn(0, 1e3 / 60, f - Qe.timestamp), Qe.timestamp = f, Qe.isProcessing = !0, Ru.update.process(Qe), Ru.preRender.process(Qe), Ru.render.process(Qe), Qe.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, pd.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(HT), this.sharedNodes.forEach(ZT);
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
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !ot(this.snapshot.measuredBox.x) && !ot(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let y = 0; y < this.path.length; y++)
          this.path[y].updateScroll();
      const d = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = Ue()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: f } = this.options;
      f && f.notify("LayoutMeasure", this.layout.layoutBox, d ? d.layoutBox : void 0);
    }
    updateScroll(d = "measure") {
      let f = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === d && (f = !1), f && this.instance) {
        const y = o(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: d,
          isRoot: y,
          offset: i(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : y
        };
      }
    }
    resetTransform() {
      if (!a)
        return;
      const d = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, f = this.projectionDelta && !cv(this.projectionDelta), y = this.getTransformTemplate(), g = y ? y(this.latestValues, "") : void 0, v = g !== this.prevTransformTemplateValue;
      d && this.instance && (f || ir(this.latestValues) || v) && (a(this.instance, g), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(d = !0) {
      const f = this.measurePageBox();
      let y = this.removeElementScroll(f);
      return d && (y = this.removeTransform(y)), tk(y), {
        animationId: this.root.animationId,
        measuredBox: f,
        layoutBox: y,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      var g;
      const { visualElement: d } = this.options;
      if (!d)
        return Ue();
      const f = d.measureViewportBox();
      if (!(((g = this.scroll) == null ? void 0 : g.wasRoot) || this.path.some(nk))) {
        const { scroll: v } = this.root;
        v && (Jt(f.x, v.offset.x), Jt(f.y, v.offset.y));
      }
      return f;
    }
    removeElementScroll(d) {
      var y;
      const f = Ue();
      if (Lt(f, d), (y = this.scroll) != null && y.wasRoot)
        return f;
      for (let g = 0; g < this.path.length; g++) {
        const v = this.path[g], { scroll: l, options: h } = v;
        v !== this.root && l && h.layoutScroll && (l.wasRoot && Lt(f, d), Jt(f.x, l.offset.x), Jt(f.y, l.offset.y));
      }
      return f;
    }
    applyTransform(d, f = !1, y) {
      var v, l;
      const g = y || Ue();
      Lt(g, d);
      for (let h = 0; h < this.path.length; h++) {
        const S = this.path[h];
        !f && S.options.layoutScroll && S.scroll && S !== S.root && (Jt(g.x, -S.scroll.offset.x), Jt(g.y, -S.scroll.offset.y)), ir(S.latestValues) && Zs(g, S.latestValues, (v = S.layout) == null ? void 0 : v.layoutBox);
      }
      return ir(this.latestValues) && Zs(g, this.latestValues, (l = this.layout) == null ? void 0 : l.layoutBox), g;
    }
    removeTransform(d) {
      var y;
      const f = Ue();
      Lt(f, d);
      for (let g = 0; g < this.path.length; g++) {
        const v = this.path[g];
        if (!ir(v.latestValues))
          continue;
        let l;
        v.instance && (Tc(v.latestValues) && v.updateSnapshot(), l = Ue(), Lt(l, v.measurePageBox())), Fm(f, v.latestValues, (y = v.snapshot) == null ? void 0 : y.layoutBox, l);
      }
      return ir(this.latestValues) && Fm(f, this.latestValues), f;
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
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== Qe.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(d = !1) {
      var S;
      const f = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = f.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = f.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = f.isSharedProjectionDirty);
      const y = !!this.resumingFrom || this !== f;
      if (!(d || y && this.isSharedProjectionDirty || this.isProjectionDirty || (S = this.parent) != null && S.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: v, layoutId: l } = this.options;
      if (!this.layout || !(v || l))
        return;
      this.resolvedRelativeTargetAt = Qe.timestamp;
      const h = this.getClosestProjectingParent();
      h && this.linkedParentVersion !== h.layoutVersion && !h.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && h && h.layout ? this.createRelativeTarget(h, this.layout.layoutBox, h.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = Ue(), this.targetWithTransforms = Ue()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), TT(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : Lt(this.target, this.layout.layoutBox), Jg(this.target, this.targetDelta)) : Lt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && h && !!h.resumingFrom == !!this.resumingFrom && !h.options.layoutScroll && h.target && this.animationProgress !== 1 ? this.createRelativeTarget(h, this.target, h.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Tc(this.parent.latestValues) || Zg(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(d, f, y) {
      this.relativeParent = d, this.linkedParentVersion = d.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Ue(), this.relativeTargetOrigin = Ue(), pa(this.relativeTargetOrigin, f, y, this.options.layoutAnchor || void 0), Lt(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      var w;
      const d = this.getLead(), f = !!this.resumingFrom || this !== d;
      let y = !0;
      if ((this.isProjectionDirty || (w = this.parent) != null && w.isProjectionDirty) && (y = !1), f && (this.isSharedProjectionDirty || this.isTransformDirty) && (y = !1), this.resolvedRelativeTargetAt === Qe.timestamp && (y = !1), y)
        return;
      const { layout: g, layoutId: v } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(g || v))
        return;
      Lt(this.layoutCorrected, this.layout.layoutBox);
      const l = this.treeScale.x, h = this.treeScale.y;
      J1(this.layoutCorrected, this.treeScale, this.path, f), d.layout && !d.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (d.target = d.layout.layoutBox, d.targetWithTransforms = Ue());
      const { target: S } = d;
      if (!S) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Mm(this.prevProjectionDelta.x, this.projectionDelta.x), Mm(this.prevProjectionDelta.y, this.projectionDelta.y)), to(this.projectionDelta, this.layoutCorrected, S, this.latestValues), (this.treeScale.x !== l || this.treeScale.y !== h || !Bm(this.projectionDelta.x, this.prevProjectionDelta.x) || !Bm(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", S));
    }
    hide() {
      this.isVisible = !1;
    }
    show() {
      this.isVisible = !0;
    }
    scheduleRender(d = !0) {
      var f;
      if ((f = this.options.visualElement) == null || f.scheduleRender(), d) {
        const y = this.getStack();
        y && y.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = Yr(), this.projectionDelta = Yr(), this.projectionDeltaWithTransform = Yr();
    }
    setAnimationOrigin(d, f = !1, y) {
      const g = this.snapshot, v = g ? g.latestValues : {}, l = { ...this.latestValues }, h = Yr();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !f;
      const S = Ue(), w = g ? g.source : void 0, _ = this.layout ? this.layout.source : void 0, A = w !== _, T = this.getStack(), M = !T || T.members.length <= 1, R = !!(A && !M && this.options.crossfade === !0 && !this.path.some(qT));
      this.animationProgress = 0;
      let D;
      const j = y == null ? void 0 : y.interpolateProjection(d);
      this.mixTargetDelta = (G) => {
        const K = G / 1e3, $ = j == null ? void 0 : j(K);
        $ ? (h.x.translate = $.x, h.x.scale = Te(d.x.scale, 1, K), h.x.origin = d.x.origin, h.x.originPoint = d.x.originPoint, h.y.translate = $.y, h.y.scale = Te(d.y.scale, 1, K), h.y.origin = d.y.origin, h.y.originPoint = d.y.originPoint) : (Km(h.x, d.x, K), Km(h.y, d.y, K)), this.setTargetDelta(h), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (pa(S, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), JT(this.relativeTarget, this.relativeTargetOrigin, S, K), D && PT(this.relativeTarget, D) && (this.isProjectionDirty = !1), D || (D = Ue()), Lt(D, this.relativeTarget)), A && (this.animationValues = l, bT(l, v, this.latestValues, K, R, M)), $ && $.rotate !== void 0 && (this.animationValues || (this.animationValues = l), this.animationValues.pathRotation = $.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = K;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(d) {
      var f, y, g;
      this.notifyListeners("animationStart"), (f = this.currentAnimation) == null || f.stop(), (g = (y = this.resumingFrom) == null ? void 0 : y.currentAnimation) == null || g.stop(), this.pendingAnimation && (zn(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Ae.update(() => {
        qs.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = qr(0)), this.motionValue.jump(0, !1), this.currentAnimation = NT(this.motionValue, [0, 1e3], {
          ...d,
          velocity: 0,
          isSync: !0,
          onUpdate: (v) => {
            this.mixTargetDelta(v), d.onUpdate && d.onUpdate(v);
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(LT), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const d = this.getLead();
      let { targetWithTransforms: f, target: y, layout: g, latestValues: v } = d;
      if (!(!f || !y || !g)) {
        if (this !== d && this.layout && g && mv(this.options.animationType, this.layout.layoutBox, g.layoutBox)) {
          y = this.target || Ue();
          const l = ot(this.layout.layoutBox.x);
          y.x.min = d.target.x.min, y.x.max = y.x.min + l;
          const h = ot(this.layout.layoutBox.y);
          y.y.min = d.target.y.min, y.y.max = y.y.min + h;
        }
        Lt(f, y), Zs(f, v), to(this.projectionDeltaWithTransform, this.layoutCorrected, f, v);
      }
    }
    registerSharedNode(d, f) {
      this.sharedNodes.has(d) || this.sharedNodes.set(d, new jT()), this.sharedNodes.get(d).add(f);
      const g = f.options.initialPromotionConfig;
      f.promote({
        transition: g ? g.transition : void 0,
        preserveFollowOpacity: g && g.shouldPreserveFollowOpacity ? g.shouldPreserveFollowOpacity(f) : void 0
      });
    }
    isLead() {
      const d = this.getStack();
      return d ? d.lead === this : !0;
    }
    getLead() {
      var f;
      const { layoutId: d } = this.options;
      return d ? ((f = this.getStack()) == null ? void 0 : f.lead) || this : this;
    }
    getPrevLead() {
      var f;
      const { layoutId: d } = this.options;
      return d ? (f = this.getStack()) == null ? void 0 : f.prevLead : void 0;
    }
    getStack() {
      const { layoutId: d } = this.options;
      if (d)
        return this.root.sharedNodes.get(d);
    }
    promote({ needsReset: d, transition: f, preserveFollowOpacity: y } = {}) {
      const g = this.getStack();
      g && g.promote(this, y), d && (this.projectionDelta = void 0, this.needsReset = !0), f && this.setOptions({ transition: f });
    }
    relegate() {
      const d = this.getStack();
      return d ? d.relegate(this) : !1;
    }
    resetSkewAndRotation() {
      const { visualElement: d } = this.options;
      if (!d)
        return;
      let f = !1;
      const { latestValues: y } = d;
      if ((y.z || y.rotate || y.rotateX || y.rotateY || y.rotateZ || y.skewX || y.skewY) && (f = !0), !f)
        return;
      const g = {};
      y.z && Bu("z", d, g, this.animationValues);
      for (let v = 0; v < Vu.length; v++)
        Bu(`rotate${Vu[v]}`, d, g, this.animationValues), Bu(`skew${Vu[v]}`, d, g, this.animationValues);
      d.render();
      for (const v in g)
        d.setStaticValue(v, g[v]), this.animationValues && (this.animationValues[v] = g[v]);
      d.scheduleRender();
    }
    applyProjectionStyles(d, f) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        d.visibility = "hidden";
        return;
      }
      const y = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = !1, d.visibility = "", d.opacity = "", d.pointerEvents = Js(f == null ? void 0 : f.pointerEvents) || "", d.transform = y ? y(this.latestValues, "") : "none";
        return;
      }
      const g = this.getLead();
      if (!this.projectionDelta || !this.layout || !g.target) {
        this.options.layoutId && (d.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, d.pointerEvents = Js(f == null ? void 0 : f.pointerEvents) || ""), this.hasProjected && !ir(this.latestValues) && (d.transform = y ? y({}, "") : "none", this.hasProjected = !1);
        return;
      }
      d.visibility = "";
      const v = g.animationValues || g.latestValues;
      this.applyTransformsToTarget();
      let l = ET(this.projectionDeltaWithTransform, this.treeScale, v);
      y && (l = y(v, l)), d.transform = l;
      const { x: h, y: S } = this.projectionDelta;
      d.transformOrigin = `${h.origin * 100}% ${S.origin * 100}% 0`, g.animationValues ? d.opacity = g === this ? v.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : v.opacityExit : d.opacity = g === this ? v.opacity !== void 0 ? v.opacity : "" : v.opacityExit !== void 0 ? v.opacityExit : 0;
      for (const w in Ac) {
        if (v[w] === void 0)
          continue;
        const { correct: _, applyTo: A, isCSSVariable: T } = Ac[w], M = l === "none" ? v[w] : _(v[w], g);
        if (A) {
          const R = A.length;
          for (let D = 0; D < R; D++)
            d[A[D]] = M;
        } else
          T ? this.options.visualElement.renderState.vars[w] = M : d[w] = M;
      }
      this.options.layoutId && (d.pointerEvents = g === this ? Js(f == null ? void 0 : f.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((d) => {
        var f;
        return (f = d.currentAnimation) == null ? void 0 : f.stop();
      }), this.root.nodes.forEach(Hm), this.root.sharedNodes.clear();
    }
  };
}
function BT(e) {
  e.updateLayout();
}
function zT(e) {
  var i;
  const n = ((i = e.resumeFrom) == null ? void 0 : i.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: o, measuredBox: a } = e.layout, { animationType: c } = e.options, d = n.source !== e.layout.source;
    if (c === "size")
      Zt((l) => {
        const h = d ? n.measuredBox[l] : n.layoutBox[l], S = ot(h);
        h.min = o[l].min, h.max = h.min + S;
      });
    else if (c === "x" || c === "y") {
      const l = c === "x" ? "y" : "x";
      Cc(d ? n.measuredBox[l] : n.layoutBox[l], o[l]);
    } else mv(c, n.layoutBox, o) && Zt((l) => {
      const h = d ? n.measuredBox[l] : n.layoutBox[l], S = ot(o[l]);
      h.max = h.min + S, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[l].max = e.relativeTarget[l].min + S);
    });
    const f = Yr();
    to(f, o, n.layoutBox);
    const y = Yr();
    d ? to(y, e.applyTransform(a, !0), n.measuredBox) : to(y, o, n.layoutBox);
    const g = !cv(f);
    let v = !1;
    if (!e.resumeFrom) {
      const l = e.getClosestProjectingParent();
      if (l && !l.resumeFrom) {
        const { snapshot: h, layout: S } = l;
        if (h && S) {
          const w = e.options.layoutAnchor || void 0, _ = Ue();
          pa(_, n.layoutBox, h.layoutBox, w);
          const A = Ue();
          pa(A, o, S.layoutBox, w), dv(_, A) || (v = !0), l.options.layoutRoot && (e.relativeTarget = A, e.relativeTargetOrigin = _, e.relativeParent = l);
        }
      }
    }
    e.notifyListeners("didUpdate", {
      layout: o,
      snapshot: n,
      delta: y,
      layoutDelta: f,
      hasLayoutChanged: g,
      hasRelativeLayoutChanged: v
    });
  } else if (e.isLead()) {
    const { onExitComplete: o } = e.options;
    o && o();
  }
  e.options.transition = void 0;
}
function UT(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function $T(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function HT(e) {
  e.clearSnapshot();
}
function Hm(e) {
  e.clearMeasurements();
}
function WT(e) {
  e.isLayoutDirty = !0, e.updateLayout();
}
function Wm(e) {
  e.isLayoutDirty = !1;
}
function GT(e) {
  e.isAnimationBlocked && e.layout && !e.isLayoutDirty && (e.snapshot = e.layout, e.isLayoutDirty = !0);
}
function KT(e) {
  const { visualElement: n } = e.options;
  n && n.getProps().onBeforeLayoutMeasure && n.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function Gm(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function YT(e) {
  e.resolveTargetDelta();
}
function QT(e) {
  e.calcProjection();
}
function XT(e) {
  e.resetSkewAndRotation();
}
function ZT(e) {
  e.removeLeadSnapshot();
}
function Km(e, n, i) {
  e.translate = Te(n.translate, 0, i), e.scale = Te(n.scale, 1, i), e.origin = n.origin, e.originPoint = n.originPoint;
}
function Ym(e, n, i, o) {
  e.min = Te(n.min, i.min, o), e.max = Te(n.max, i.max, o);
}
function JT(e, n, i, o) {
  Ym(e.x, n.x, i.x, o), Ym(e.y, n.y, i.y, o);
}
function qT(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const ek = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, Qm = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), Xm = Qm("applewebkit/") && !Qm("chrome/") ? Math.round : bt;
function Zm(e) {
  e.min = Xm(e.min), e.max = Xm(e.max);
}
function tk(e) {
  Zm(e.x), Zm(e.y);
}
function mv(e, n, i) {
  return e === "position" || e === "preserve-aspect" && !_T(Vm(n), Vm(i), 0.2);
}
function nk(e) {
  var n;
  return e !== e.root && ((n = e.scroll) == null ? void 0 : n.wasRoot);
}
const rk = hv({
  attachResizeListener: (e, n) => uo(e, "resize", n),
  measureScroll: () => {
    var e, n;
    return {
      x: document.documentElement.scrollLeft || ((e = document.body) == null ? void 0 : e.scrollLeft) || 0,
      y: document.documentElement.scrollTop || ((n = document.body) == null ? void 0 : n.scrollTop) || 0
    };
  },
  checkIsScrollRoot: () => !0
}), zu = {
  current: void 0
}, yv = hv({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!zu.current) {
      const e = new rk({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), zu.current = e;
    }
    return zu.current;
  },
  resetTransform: (e, n) => {
    e.style.transform = n !== void 0 ? n : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), wd = C.createContext({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
function Jm(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function ik(...e) {
  return (n) => {
    let i = !1;
    const o = e.map((a) => {
      const c = Jm(a, n);
      return !i && typeof c == "function" && (i = !0), c;
    });
    if (i)
      return () => {
        for (let a = 0; a < o.length; a++) {
          const c = o[a];
          typeof c == "function" ? c() : Jm(e[a], null);
        }
      };
  };
}
function ok(...e) {
  return C.useCallback(ik(...e), e);
}
class sk extends C.Component {
  getSnapshotBeforeUpdate(n) {
    const i = this.props.childRef.current;
    if (Ks(i) && n.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const o = i.offsetParent, a = Ks(o) && o.offsetWidth || 0, c = Ks(o) && o.offsetHeight || 0, d = getComputedStyle(i), f = this.props.sizeRef.current;
      f.height = parseFloat(d.height), f.width = parseFloat(d.width), f.top = i.offsetTop, f.left = i.offsetLeft, f.right = a - f.width - f.left, f.bottom = c - f.height - f.top, f.direction = d.direction;
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
function ak({ children: e, isPresent: n, anchorX: i, anchorY: o, root: a, pop: c }) {
  var h;
  const d = C.useId(), f = C.useRef(null), y = C.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: g } = C.useContext(wd), v = ((h = e.props) == null ? void 0 : h.ref) ?? (e == null ? void 0 : e.ref), l = ok(f, v);
  return C.useInsertionEffect(() => {
    const { width: S, height: w, top: _, left: A, right: T, bottom: M, direction: R } = y.current;
    if (n || c === !1 || !f.current || !S || !w)
      return;
    const D = R === "rtl", j = i === "left" ? D ? `right: ${T}` : `left: ${A}` : D ? `left: ${A}` : `right: ${T}`, G = o === "bottom" ? `bottom: ${M}` : `top: ${_}`;
    f.current.dataset.motionPopId = d;
    const K = document.createElement("style");
    g && (K.nonce = g);
    const $ = a ?? document.head;
    return $.appendChild(K), K.sheet && K.sheet.insertRule(`
          [data-motion-pop-id="${d}"] {
            position: absolute !important;
            width: ${S}px !important;
            height: ${w}px !important;
            ${j}px !important;
            ${G}px !important;
          }
        `), () => {
      var W;
      (W = f.current) == null || W.removeAttribute("data-motion-pop-id"), $.contains(K) && $.removeChild(K);
    };
  }, [n]), k.jsx(sk, { isPresent: n, childRef: f, sizeRef: y, pop: c, children: c === !1 ? e : C.cloneElement(e, { ref: l }) });
}
const lk = ({ children: e, initial: n, isPresent: i, onExitComplete: o, custom: a, presenceAffectsLayout: c, mode: d, anchorX: f, anchorY: y, root: g }) => {
  const v = Qc(uk), l = C.useId(), h = C.useRef(i), S = C.useRef(o);
  Xc(() => {
    h.current = i, S.current = o;
  });
  let w = !0, _ = C.useMemo(() => (w = !1, {
    id: l,
    initial: n,
    isPresent: i,
    custom: a,
    onExitComplete: (A) => {
      v.set(A, !0);
      for (const T of v.values())
        if (!T)
          return;
      o && o();
    },
    register: (A) => (v.set(A, !1), () => {
      var T;
      v.delete(A), !h.current && !v.size && ((T = S.current) == null || T.call(S));
    })
  }), [i, v, o]);
  return c && w && (_ = { ..._ }), C.useMemo(() => {
    v.forEach((A, T) => v.set(T, !1));
  }, [i]), C.useEffect(() => {
    !i && !v.size && o && o();
  }, [i]), e = k.jsx(ak, { pop: d === "popLayout", isPresent: i, anchorX: f, anchorY: y, root: g, children: e }), k.jsx(_a.Provider, { value: _, children: e });
};
function uk() {
  return /* @__PURE__ */ new Map();
}
function gv(e = !0) {
  const n = C.useContext(_a);
  if (n === null)
    return [!0, null];
  const { isPresent: i, onExitComplete: o, register: a } = n, c = C.useId();
  C.useEffect(() => {
    if (e)
      return a(c);
  }, [e]);
  const d = C.useCallback(() => e && o && o(c), [c, o, e]);
  return !i && o ? [!1, d] : [!0];
}
const Os = (e) => e.key || "";
function qm(e) {
  const n = [];
  return C.Children.forEach(e, (i) => {
    C.isValidElement(i) && n.push(i);
  }), n;
}
const Ca = ({ children: e, custom: n, initial: i = !0, onExitComplete: o, presenceAffectsLayout: a = !0, mode: c = "sync", propagate: d = !1, anchorX: f = "left", anchorY: y = "top", root: g }) => {
  const [v, l] = gv(d), h = C.useMemo(() => qm(e), [e]), S = d && !v ? [] : h.map(Os), w = C.useRef(!0), _ = C.useRef(h), A = Qc(() => /* @__PURE__ */ new Map()), T = C.useRef(/* @__PURE__ */ new Set()), [M, R] = C.useState(h), [D, j] = C.useState(h);
  Xc(() => {
    w.current = !1, _.current = h;
    for (let $ = 0; $ < D.length; $++) {
      const W = Os(D[$]);
      S.includes(W) ? (A.delete(W), T.current.delete(W)) : A.get(W) !== !0 && A.set(W, !1);
    }
  }, [D, S.length, S.join("-")]);
  const G = [];
  if (h !== M) {
    let $ = [...h];
    for (let W = 0; W < D.length; W++) {
      const X = D[W], te = Os(X);
      S.includes(te) || ($.splice(W, 0, X), G.push(X));
    }
    return c === "wait" && G.length && ($ = G), j(qm($)), R(h), null;
  }
  const { forceRender: K } = C.useContext(Yc);
  return k.jsx(k.Fragment, { children: D.map(($) => {
    const W = Os($), X = d && !v ? !1 : h === D || S.includes(W), te = () => {
      if (T.current.has(W))
        return;
      if (A.has(W))
        T.current.add(W), A.set(W, !0);
      else
        return;
      let de = !0;
      A.forEach((he) => {
        he || (de = !1);
      }), de && (K == null || K(), j(_.current), d && (l == null || l()), o && o());
    };
    return k.jsx(lk, { isPresent: X, initial: !w.current || i ? void 0 : !1, custom: n, presenceAffectsLayout: a, mode: c, root: g, onExitComplete: X ? void 0 : te, anchorX: f, anchorY: y, children: $ }, W);
  }) });
}, vv = C.createContext({ strict: !1 }), ey = {
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
let ty = !1;
function ck() {
  if (ty)
    return;
  const e = {};
  for (const n in ey)
    e[n] = {
      isEnabled: (i) => ey[n].some((o) => !!i[o])
    };
  Yg(e), ty = !0;
}
function Sv() {
  return ck(), Y1();
}
function dk(e) {
  const n = Sv();
  for (const i in e)
    n[i] = {
      ...n[i],
      ...e[i]
    };
  Yg(n);
}
const fk = /* @__PURE__ */ new Set([
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
function ha(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || fk.has(e);
}
let wv = (e) => !ha(e);
function pk(e) {
  typeof e == "function" && (wv = (n) => n.startsWith("on") ? !ha(n) : e(n));
}
try {
  pk(require("@emotion/is-prop-valid").default);
} catch {
}
function hk(e, n, i) {
  const o = {};
  for (const a in e)
    a === "values" && typeof e.values == "object" || Xe(e[a]) || (wv(a) || i === !0 && ha(a) || !n && !ha(a) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && a.startsWith("onDrag")) && (o[a] = e[a]);
  return o;
}
const Pa = /* @__PURE__ */ C.createContext({});
function mk(e, n) {
  if (Aa(e)) {
    const { initial: i, animate: o } = e;
    return {
      initial: i === !1 || lo(i) ? i : void 0,
      animate: lo(o) ? o : void 0
    };
  }
  return e.inherit !== !1 ? n : {};
}
function yk(e) {
  const { initial: n, animate: i } = mk(e, C.useContext(Pa));
  return C.useMemo(() => ({ initial: n, animate: i }), [ny(n), ny(i)]);
}
function ny(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const xd = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function xv(e, n, i) {
  for (const o in n)
    !Xe(n[o]) && !tv(o, i) && (e[o] = n[o]);
}
function gk({ transformTemplate: e }, n) {
  return C.useMemo(() => {
    const i = xd();
    return vd(i, n, e), Object.assign({}, i.vars, i.style);
  }, [n]);
}
function vk(e, n) {
  const i = e.style || {}, o = {};
  return xv(o, i, e), Object.assign(o, gk(e, n)), o;
}
function Sk(e, n) {
  const i = {}, o = vk(e, n);
  return e.drag && e.dragListener !== !1 && (i.draggable = !1, o.userSelect = o.WebkitUserSelect = o.WebkitTouchCallout = "none", o.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (i.tabIndex = 0), i.style = o, i;
}
const _v = () => ({
  ...xd(),
  attrs: {}
});
function wk(e, n, i, o) {
  const a = C.useMemo(() => {
    const c = _v();
    return nv(c, n, iv(o), e.transformTemplate, e.style), {
      ...c.attrs,
      style: { ...c.style }
    };
  }, [n]);
  if (e.style) {
    const c = {};
    xv(c, e.style, e), a.style = { ...c, ...a.style };
  }
  return a;
}
const xk = [
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
function _d(e) {
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
      !!(xk.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function _k(e, n, i, { latestValues: o }, a, c = !1, d) {
  const y = (d ?? _d(e) ? wk : Sk)(n, o, a, e), g = hk(n, typeof e == "string", c), v = e !== C.Fragment ? { ...g, ...y, ref: i } : {}, { children: l } = n, h = C.useMemo(() => Xe(l) ? l.get() : l, [l]);
  return C.createElement(e, {
    ...v,
    children: h
  });
}
function Tk({ scrapeMotionValuesFromProps: e, createRenderState: n }, i, o, a) {
  return {
    latestValues: kk(i, o, a, e),
    renderState: n()
  };
}
function kk(e, n, i, o) {
  const a = {}, c = o(e, {});
  for (const h in c)
    a[h] = Js(c[h]);
  let { initial: d, animate: f } = e;
  const y = Aa(e), g = Gg(e);
  n && g && !y && e.inherit !== !1 && (d === void 0 && (d = n.initial), f === void 0 && (f = n.animate));
  let v = i ? i.initial === !1 : !1;
  v = v || d === !1;
  const l = v ? f : d;
  if (l && typeof l != "boolean" && !ka(l)) {
    const h = Array.isArray(l) ? l : [l];
    for (let S = 0; S < h.length; S++) {
      const w = cd(e, h[S]);
      if (w) {
        const { transitionEnd: _, transition: A, ...T } = w;
        for (const M in T) {
          let R = T[M];
          if (Array.isArray(R)) {
            const D = v ? R.length - 1 : 0;
            R = R[D];
          }
          R !== null && (a[M] = R);
        }
        for (const M in _)
          a[M] = _[M];
      }
    }
  }
  return a;
}
const Tv = (e) => (n, i) => {
  const o = C.useContext(Pa), a = C.useContext(_a), c = () => Tk(e, n, o, a);
  return i ? c() : Qc(c);
}, Ak = /* @__PURE__ */ Tv({
  scrapeMotionValuesFromProps: Sd,
  createRenderState: xd
}), Ck = /* @__PURE__ */ Tv({
  scrapeMotionValuesFromProps: ov,
  createRenderState: _v
}), Pk = Symbol.for("motionComponentSymbol");
function Ek(e, n, i) {
  const o = C.useRef(i);
  C.useInsertionEffect(() => {
    o.current = i;
  });
  const a = C.useRef(null);
  return C.useCallback((c) => {
    var f;
    c && ((f = e.onMount) == null || f.call(e, c)), n && (c ? n.mount(c) : n.unmount());
    const d = o.current;
    if (typeof d == "function")
      if (c) {
        const y = d(c);
        typeof y == "function" && (a.current = y);
      } else a.current ? (a.current(), a.current = null) : d(c);
    else d && (d.current = c);
  }, [n]);
}
const kv = C.createContext({});
function Wr(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function Mk(e, n, i, o, a, c) {
  var R, D;
  const { visualElement: d } = C.useContext(Pa), f = C.useContext(vv), y = C.useContext(_a), g = C.useContext(wd), v = g.reducedMotion, l = g.skipAnimations, h = C.useRef(null), S = C.useRef(!1);
  o = o || f.renderer, !h.current && o && (h.current = o(e, {
    visualState: n,
    parent: d,
    props: i,
    presenceContext: y,
    blockInitialAnimation: y ? y.initial === !1 : !1,
    reducedMotionConfig: v,
    skipAnimations: l,
    isSVG: c
  }), S.current && h.current && (h.current.manuallyAnimateOnMount = !0));
  const w = h.current, _ = C.useContext(kv);
  w && !w.projection && a && (w.type === "html" || w.type === "svg") && bk(h.current, i, a, _);
  const A = C.useRef(!1);
  C.useInsertionEffect(() => {
    w && A.current && w.update(i, y);
  });
  const T = i[Ig], M = C.useRef(!!T && typeof window < "u" && !((R = window.MotionHandoffIsComplete) != null && R.call(window, T)) && ((D = window.MotionHasOptimisedAnimation) == null ? void 0 : D.call(window, T)));
  return Xc(() => {
    S.current = !0, w && (A.current = !0, window.MotionIsMounted = !0, w.updateFeatures(), w.scheduleRenderMicrotask(), M.current && w.animationState && w.animationState.animateChanges());
  }), C.useEffect(() => {
    w && (!M.current && w.animationState && w.animationState.animateChanges(), M.current && (queueMicrotask(() => {
      var j;
      (j = window.MotionHandoffMarkAsComplete) == null || j.call(window, T);
    }), M.current = !1), w.enteringChildren = void 0);
  }), w;
}
function bk(e, n, i, o) {
  const { layoutId: a, layout: c, drag: d, dragConstraints: f, layoutScroll: y, layoutRoot: g, layoutAnchor: v, layoutCrossfade: l } = n;
  e.projection = new i(e.latestValues, n["data-framer-portal-id"] ? void 0 : Av(e.parent)), e.projection.setOptions({
    layoutId: a,
    layout: c,
    alwaysMeasureLayout: !!d || f && Wr(f),
    visualElement: e,
    /**
     * TODO: Update options in an effect. This could be tricky as it'll be too late
     * to update by the time layout animations run.
     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
     * ensuring it gets called if there's no potential layout animations.
     *
     */
    animationType: typeof c == "string" ? c : "both",
    initialPromotionConfig: o,
    crossfade: l,
    layoutScroll: y,
    layoutRoot: g,
    layoutAnchor: v
  });
}
function Av(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Av(e.parent);
}
function Uu(e, { forwardMotionProps: n = !1, type: i } = {}, o, a) {
  o && dk(o);
  const c = i ? i === "svg" : _d(e), d = c ? Ck : Ak;
  function f(g, v) {
    let l;
    const h = {
      ...C.useContext(wd),
      ...g,
      layoutId: Rk(g)
    }, { isStatic: S } = h, w = yk(g), _ = d(g, S);
    if (!S && typeof window < "u") {
      Dk();
      const A = Nk(h);
      l = A.MeasureLayout, w.visualElement = Mk(e, _, h, a, A.ProjectionNode, c);
    }
    return k.jsxs(Pa.Provider, { value: w, children: [l && w.visualElement ? k.jsx(l, { visualElement: w.visualElement, ...h }) : null, _k(e, g, Ek(_, w.visualElement, v), _, S, n, c)] });
  }
  f.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const y = C.forwardRef(f);
  return y[Pk] = e, y;
}
function Rk({ layoutId: e }) {
  const n = C.useContext(Yc).id;
  return n && e !== void 0 ? n + "-" + e : e;
}
function Dk(e, n) {
  C.useContext(vv).strict;
}
function Nk(e) {
  const n = Sv(), { drag: i, layout: o } = n;
  if (!i && !o)
    return {};
  const a = { ...i, ...o };
  return {
    MeasureLayout: i != null && i.isEnabled(e) || o != null && o.isEnabled(e) ? a.MeasureLayout : void 0,
    ProjectionNode: a.ProjectionNode
  };
}
function Ik(e, n) {
  if (typeof Proxy > "u")
    return Uu;
  const i = /* @__PURE__ */ new Map(), o = (c, d) => Uu(c, d, e, n), a = (c, d) => o(c, d);
  return new Proxy(a, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (c, d) => d === "create" ? o : (i.has(d) || i.set(d, Uu(d, void 0, e, n)), i.get(d))
  });
}
const Fk = (e, n) => n.isSVG ?? _d(e) ? new dT(n) : new oT(n, {
  allowProjection: e !== C.Fragment
});
class Ok extends $n {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(n) {
    super(n), n.animationState || (n.animationState = yT(n));
  }
  updateAnimationControlsSubscription() {
    const { animate: n } = this.node.getProps();
    ka(n) && (this.unmountControls = n.subscribe(this.node));
  }
  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.updateAnimationControlsSubscription();
  }
  update() {
    const { animate: n } = this.node.getProps(), { animate: i } = this.node.prevProps || {};
    n !== i && this.updateAnimationControlsSubscription();
  }
  unmount() {
    var n;
    this.node.animationState.reset(), (n = this.unmountControls) == null || n.call(this);
  }
}
let jk = 0;
class Lk extends $n {
  constructor() {
    super(...arguments), this.id = jk++, this.isExitComplete = !1;
  }
  update() {
    var c;
    if (!this.node.presenceContext)
      return;
    const { isPresent: n, onExitComplete: i } = this.node.presenceContext, { isPresent: o } = this.node.prevPresenceContext || {};
    if (!this.node.animationState || n === o)
      return;
    if (n && o === !1) {
      if (this.isExitComplete) {
        const { initial: d, custom: f } = this.node.getProps();
        if (typeof d == "string" || typeof d == "object" && d !== null && !Array.isArray(d)) {
          const y = cr(this.node, d, f);
          if (y) {
            const { transition: g, transitionEnd: v, ...l } = y;
            for (const h in l)
              (c = this.node.getValue(h)) == null || c.jump(l[h]);
          }
        }
        this.node.animationState.reset(), this.node.animationState.animateChanges();
      } else
        this.node.animationState.setActive("exit", !1);
      this.isExitComplete = !1;
      return;
    }
    const a = this.node.animationState.setActive("exit", !n);
    i && !n && a.then(() => {
      this.isExitComplete = !0, i(this.id);
    });
  }
  mount() {
    const { register: n, onExitComplete: i } = this.node.presenceContext || {};
    i && i(this.id), n && (this.unmount = n(this.id));
  }
  unmount() {
  }
}
const Vk = {
  animation: {
    Feature: Ok
  },
  exit: {
    Feature: Lk
  }
};
function wo(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const Bk = (e) => (n) => hd(n) && e(n, wo(n));
function no(e, n, i, o) {
  return uo(e, n, Bk(i), o);
}
const Cv = ({ current: e }) => e ? e.ownerDocument.defaultView : null, ry = (e, n) => Math.abs(e - n);
function zk(e, n) {
  const i = ry(e.x, n.x), o = ry(e.y, n.y);
  return Math.sqrt(i ** 2 + o ** 2);
}
const iy = /* @__PURE__ */ new Set(["auto", "scroll"]);
class Pv {
  constructor(n, i, { transformPagePoint: o, contextWindow: a = window, dragSnapToOrigin: c = !1, distanceThreshold: d = 3, element: f } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (w) => {
      this.handleScroll(w.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = js(this.lastRawMoveEventInfo, this.transformPagePoint));
      const w = $u(this.lastMoveEventInfo, this.history), _ = this.startEvent !== null, A = zk(w.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!_ && !A)
        return;
      const { point: T } = w, { timestamp: M } = Qe;
      this.history.push({ ...T, timestamp: M });
      const { onStart: R, onMove: D } = this.handlers;
      _ || (R && R(this.lastMoveEvent, w), this.startEvent = this.lastMoveEvent), D && D(this.lastMoveEvent, w);
    }, this.handlePointerMove = (w, _) => {
      this.lastMoveEvent = w, this.lastRawMoveEventInfo = _, this.lastMoveEventInfo = js(_, this.transformPagePoint), Ae.update(this.updatePoint, !0);
    }, this.handlePointerUp = (w, _) => {
      this.end();
      const { onEnd: A, onSessionEnd: T, resumeAnimation: M } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && M && M(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const R = $u(w.type === "pointercancel" ? this.lastMoveEventInfo : js(_, this.transformPagePoint), this.history);
      this.startEvent && A && A(w, R), T && T(w, R);
    }, !hd(n))
      return;
    this.dragSnapToOrigin = c, this.handlers = i, this.transformPagePoint = o, this.distanceThreshold = d, this.contextWindow = a || window;
    const y = wo(n), g = js(y, this.transformPagePoint), { point: v } = g, { timestamp: l } = Qe;
    this.history = [{ ...v, timestamp: l }];
    const { onSessionStart: h } = i;
    h && h(n, $u(g, this.history));
    const S = { passive: !0, capture: !0 };
    this.removeListeners = go(no(this.contextWindow, "pointermove", this.handlePointerMove, S), no(this.contextWindow, "pointerup", this.handlePointerUp, S), no(this.contextWindow, "pointercancel", this.handlePointerUp, S)), f && this.startScrollTracking(f);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(n) {
    let i = n.parentElement;
    for (; i; ) {
      const o = getComputedStyle(i);
      (iy.has(o.overflowX) || iy.has(o.overflowY)) && this.scrollPositions.set(i, {
        x: i.scrollLeft,
        y: i.scrollTop
      }), i = i.parentElement;
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
    const i = this.scrollPositions.get(n);
    if (!i)
      return;
    const o = n === window, a = o ? { x: window.scrollX, y: window.scrollY } : {
      x: n.scrollLeft,
      y: n.scrollTop
    }, c = { x: a.x - i.x, y: a.y - i.y };
    c.x === 0 && c.y === 0 || (o ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += c.x, this.lastMoveEventInfo.point.y += c.y) : this.history.length > 0 && (this.history[0].x -= c.x, this.history[0].y -= c.y), this.scrollPositions.set(n, a), Ae.update(this.updatePoint, !0));
  }
  updateHandlers(n) {
    this.handlers = n;
  }
  end() {
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), zn(this.updatePoint);
  }
}
function js(e, n) {
  return n ? { point: n(e.point) } : e;
}
function oy(e, n) {
  return { x: e.x - n.x, y: e.y - n.y };
}
function $u({ point: e }, n) {
  return {
    point: e,
    delta: oy(e, Ev(n)),
    offset: oy(e, Uk(n)),
    velocity: $k(n, 0.1)
  };
}
function Uk(e) {
  return e[0];
}
function Ev(e) {
  return e[e.length - 1];
}
function $k(e, n) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let i = e.length - 1, o = null;
  const a = Ev(e);
  for (; i >= 0 && (o = e[i], !(a.timestamp - o.timestamp > /* @__PURE__ */ mt(n))); )
    i--;
  if (!o)
    return { x: 0, y: 0 };
  o === e[0] && e.length > 2 && a.timestamp - o.timestamp > /* @__PURE__ */ mt(n) * 2 && (o = e[1]);
  const c = /* @__PURE__ */ Mt(a.timestamp - o.timestamp);
  if (c === 0)
    return { x: 0, y: 0 };
  const d = {
    x: (a.x - o.x) / c,
    y: (a.y - o.y) / c
  };
  return d.x === 1 / 0 && (d.x = 0), d.y === 1 / 0 && (d.y = 0), d;
}
function Hk(e, { min: n, max: i }, o) {
  return n !== void 0 && e < n ? e = o ? Te(n, e, o.min) : Math.max(e, n) : i !== void 0 && e > i && (e = o ? Te(i, e, o.max) : Math.min(e, i)), e;
}
function sy(e, n, i) {
  return {
    min: n !== void 0 ? e.min + n : void 0,
    max: i !== void 0 ? e.max + i - (e.max - e.min) : void 0
  };
}
function Wk(e, { top: n, left: i, bottom: o, right: a }) {
  return {
    x: sy(e.x, i, a),
    y: sy(e.y, n, o)
  };
}
function ay(e, n) {
  let i = n.min - e.min, o = n.max - e.max;
  return n.max - n.min < e.max - e.min && ([i, o] = [o, i]), { min: i, max: o };
}
function Gk(e, n) {
  return {
    x: ay(e.x, n.x),
    y: ay(e.y, n.y)
  };
}
function Kk(e, n) {
  let i = 0.5;
  const o = ot(e), a = ot(n);
  return a > o ? i = /* @__PURE__ */ so(n.min, n.max - o, e.min) : o > a && (i = /* @__PURE__ */ so(e.min, e.max - a, n.min)), tn(0, 1, i);
}
function Yk(e, n) {
  const i = {};
  return n.min !== void 0 && (i.min = n.min - e.min), n.max !== void 0 && (i.max = n.max - e.min), i;
}
const Pc = 0.35;
function Qk(e = Pc) {
  return e === !1 ? e = 0 : e === !0 && (e = Pc), {
    x: ly(e, "left", "right"),
    y: ly(e, "top", "bottom")
  };
}
function ly(e, n, i) {
  return {
    min: uy(e, n),
    max: uy(e, i)
  };
}
function uy(e, n) {
  return typeof e == "number" ? e : e[n] || 0;
}
const Xk = /* @__PURE__ */ new WeakMap();
class Zk {
  constructor(n) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = Ue(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = n;
  }
  start(n, { snapToCursor: i = !1, distanceThreshold: o } = {}) {
    const { presenceContext: a } = this.visualElement;
    if (a && a.isPresent === !1)
      return;
    const c = (l) => {
      i && this.snapToCursor(wo(l).point), this.stopAnimation();
    }, d = (l, h) => {
      const { drag: S, dragPropagation: w, onDragStart: _ } = this.getProps();
      if (S && !w && (this.openDragLock && this.openDragLock(), this.openDragLock = k1(S), !this.openDragLock))
        return;
      this.latestPointerEvent = l, this.latestPanInfo = h, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Zt((T) => {
        let M = this.getAxisMotionValue(T).get() || 0;
        if (en.test(M)) {
          const { projection: R } = this.visualElement;
          if (R && R.layout) {
            const D = R.layout.layoutBox[T];
            D && (M = ot(D) * (parseFloat(M) / 100));
          }
        }
        this.originPoint[T] = M;
      }), _ && Ae.update(() => _(l, h), !1, !0), gc(this.visualElement, "transform");
      const { animationState: A } = this.visualElement;
      A && A.setActive("whileDrag", !0);
    }, f = (l, h) => {
      this.latestPointerEvent = l, this.latestPanInfo = h;
      const { dragPropagation: S, dragDirectionLock: w, onDirectionLock: _, onDrag: A } = this.getProps();
      if (!S && !this.openDragLock)
        return;
      const { offset: T } = h;
      if (w && this.currentDirection === null) {
        this.currentDirection = qk(T), this.currentDirection !== null && _ && _(this.currentDirection);
        return;
      }
      this.updateAxis("x", h.point, T), this.updateAxis("y", h.point, T), this.visualElement.render(), A && Ae.update(() => A(l, h), !1, !0);
    }, y = (l, h) => {
      this.latestPointerEvent = l, this.latestPanInfo = h, this.stop(l, h), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, g = () => {
      const { dragSnapToOrigin: l } = this.getProps();
      (l || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: v } = this.getProps();
    this.panSession = new Pv(n, {
      onSessionStart: c,
      onStart: d,
      onMove: f,
      onSessionEnd: y,
      resumeAnimation: g
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: v,
      distanceThreshold: o,
      contextWindow: Cv(this.visualElement),
      element: this.visualElement.current
    });
  }
  /**
   * @internal
   */
  stop(n, i) {
    const o = n || this.latestPointerEvent, a = i || this.latestPanInfo, c = this.isDragging;
    if (this.cancel(), !c || !a || !o)
      return;
    const { velocity: d } = a;
    this.startAnimation(d);
    const { onDragEnd: f } = this.getProps();
    f && Ae.postRender(() => f(o, a));
  }
  /**
   * @internal
   */
  cancel() {
    this.isDragging = !1;
    const { projection: n, animationState: i } = this.visualElement;
    n && (n.isAnimationBlocked = !1), this.endPanSession();
    const { dragPropagation: o } = this.getProps();
    !o && this.openDragLock && (this.openDragLock(), this.openDragLock = null), i && i.setActive("whileDrag", !1);
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
  updateAxis(n, i, o) {
    const { drag: a } = this.getProps();
    if (!o || !Ls(n, a, this.currentDirection))
      return;
    const c = this.getAxisMotionValue(n);
    let d = this.originPoint[n] + o[n];
    this.constraints && this.constraints[n] && (d = Hk(d, this.constraints[n], this.elastic[n])), c.set(d);
  }
  resolveConstraints() {
    var c;
    const { dragConstraints: n, dragElastic: i } = this.getProps(), o = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (c = this.visualElement.projection) == null ? void 0 : c.layout, a = this.constraints;
    n && Wr(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && o ? this.constraints = Wk(o.layoutBox, n) : this.constraints = !1, this.elastic = Qk(i), a !== this.constraints && !Wr(n) && o && this.constraints && !this.hasMutatedConstraints && Zt((d) => {
      this.constraints !== !1 && this.getAxisMotionValue(d) && (this.constraints[d] = Yk(o.layoutBox[d], this.constraints[d]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: n, onMeasureDragConstraints: i } = this.getProps();
    if (!n || !Wr(n))
      return !1;
    const o = n.current;
    pr(o !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: a } = this.visualElement;
    if (!a || !a.layout)
      return !1;
    a.root && (a.root.scroll = void 0, a.root.updateScroll());
    const c = q1(o, a.root, this.visualElement.getTransformPagePoint());
    let d = Gk(a.layout.layoutBox, c);
    if (i) {
      const f = i(X1(d));
      this.hasMutatedConstraints = !!f, f && (d = Xg(f));
    }
    return d;
  }
  startAnimation(n) {
    const { drag: i, dragMomentum: o, dragElastic: a, dragTransition: c, dragSnapToOrigin: d, onDragTransitionEnd: f } = this.getProps(), y = this.constraints || {}, g = Zt((v) => {
      if (!Ls(v, i, this.currentDirection))
        return;
      let l = y && y[v] || {};
      (d === !0 || d === v) && (l = { min: 0, max: 0 });
      const h = a ? 200 : 1e6, S = a ? 40 : 1e7, w = {
        type: "inertia",
        velocity: o ? n[v] : 0,
        bounceStiffness: h,
        bounceDamping: S,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...c,
        ...l
      };
      return this.startAxisValueAnimation(v, w);
    });
    return Promise.all(g).then(f);
  }
  startAxisValueAnimation(n, i) {
    const o = this.getAxisMotionValue(n);
    return gc(this.visualElement, n), o.start(ud(n, o, 0, i, this.visualElement, !1));
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
    const i = `_drag${n.toUpperCase()}`, a = this.visualElement.getProps()[i];
    return a || this.visualElement.getValue(n, this.visualElement.latestValues[n] ?? 0);
  }
  snapToCursor(n) {
    Zt((i) => {
      const { drag: o } = this.getProps();
      if (!Ls(i, o, this.currentDirection))
        return;
      const { projection: a } = this.visualElement, c = this.getAxisMotionValue(i);
      if (a && a.layout) {
        const { min: d, max: f } = a.layout.layoutBox[i], y = c.get() || 0;
        c.set(n[i] - Te(d, f, 0.5) + y);
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
    const { drag: n, dragConstraints: i } = this.getProps(), { projection: o } = this.visualElement;
    if (!Wr(i) || !o || !this.constraints)
      return;
    this.stopAnimation();
    const a = { x: 0, y: 0 };
    Zt((d) => {
      const f = this.getAxisMotionValue(d);
      if (f && this.constraints !== !1) {
        const y = f.get();
        a[d] = Kk({ min: y, max: y }, this.constraints[d]);
      }
    });
    const { transformTemplate: c } = this.visualElement.getProps();
    this.visualElement.current.style.transform = c ? c({}, "") : "none", o.root && o.root.updateScroll(), o.updateLayout(), this.constraints = !1, this.resolveConstraints(), Zt((d) => {
      if (!Ls(d, n, null))
        return;
      const f = this.getAxisMotionValue(d), { min: y, max: g } = this.constraints[d];
      f.set(Te(y, g, a[d]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    Xk.set(this.visualElement, this);
    const n = this.visualElement.current, i = no(n, "pointerdown", (g) => {
      const { drag: v, dragListener: l = !0 } = this.getProps(), h = g.target, S = h !== n && b1(h);
      v && l && !S && this.start(g);
    });
    let o;
    const a = () => {
      const { dragConstraints: g } = this.getProps();
      Wr(g) && g.current && (this.constraints = this.resolveRefConstraints(), o || (o = Jk(n, g.current, () => this.scalePositionWithinConstraints())));
    }, { projection: c } = this.visualElement, d = c.addEventListener("measure", a);
    c && !c.layout && (c.root && c.root.updateScroll(), c.updateLayout()), Ae.read(a);
    const f = uo(window, "resize", () => this.scalePositionWithinConstraints()), y = c.addEventListener("didUpdate", (({ delta: g, hasLayoutChanged: v }) => {
      this.isDragging && v && (Zt((l) => {
        const h = this.getAxisMotionValue(l);
        h && (this.originPoint[l] += g[l].translate, h.set(h.get() + g[l].translate));
      }), this.visualElement.render());
    }));
    return () => {
      f(), i(), d(), y && y(), o && o();
    };
  }
  getProps() {
    const n = this.visualElement.getProps(), { drag: i = !1, dragDirectionLock: o = !1, dragPropagation: a = !1, dragConstraints: c = !1, dragElastic: d = Pc, dragMomentum: f = !0 } = n;
    return {
      ...n,
      drag: i,
      dragDirectionLock: o,
      dragPropagation: a,
      dragConstraints: c,
      dragElastic: d,
      dragMomentum: f
    };
  }
}
function cy(e) {
  let n = !0;
  return () => {
    if (n) {
      n = !1;
      return;
    }
    e();
  };
}
function Jk(e, n, i) {
  const o = gm(e, cy(i)), a = gm(n, cy(i));
  return () => {
    o(), a();
  };
}
function Ls(e, n, i) {
  return (n === !0 || n === e) && (i === null || i === e);
}
function qk(e, n = 10) {
  let i = null;
  return Math.abs(e.y) > n ? i = "y" : Math.abs(e.x) > n && (i = "x"), i;
}
class eA extends $n {
  constructor(n) {
    super(n), this.removeGroupControls = bt, this.removeListeners = bt, this.controls = new Zk(n);
  }
  mount() {
    const { dragControls: n } = this.node.getProps();
    n && (this.removeGroupControls = n.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || bt;
  }
  update() {
    const { dragControls: n } = this.node.getProps(), { dragControls: i } = this.node.prevProps || {};
    n !== i && (this.removeGroupControls(), n && (this.removeGroupControls = n.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const Hu = (e) => (n, i) => {
  e && Ae.update(() => e(n, i), !1, !0);
};
class tA extends $n {
  constructor() {
    super(...arguments), this.removePointerDownListener = bt;
  }
  onPointerDown(n) {
    this.session = new Pv(n, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Cv(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: n, onPanStart: i, onPan: o, onPanEnd: a } = this.node.getProps();
    return {
      onSessionStart: Hu(n),
      onStart: Hu(i),
      onMove: Hu(o),
      onEnd: (c, d) => {
        delete this.session, a && Ae.postRender(() => a(c, d));
      }
    };
  }
  mount() {
    this.removePointerDownListener = no(this.node.current, "pointerdown", (n) => this.onPointerDown(n));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let Wu = !1;
class nA extends C.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: n, layoutGroup: i, switchLayoutGroup: o, layoutId: a } = this.props, { projection: c } = n;
    c && (i.group && i.group.add(c), o && o.register && a && o.register(c), Wu && c.root.didUpdate(), c.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), c.setOptions({
      ...c.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), qs.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(n) {
    const { layoutDependency: i, visualElement: o, drag: a, isPresent: c } = this.props, { projection: d } = o;
    return d && (d.isPresent = c, n.layoutDependency !== i && d.setOptions({
      ...d.options,
      layoutDependency: i
    }), Wu = !0, a || n.layoutDependency !== i || i === void 0 || n.isPresent !== c ? d.willUpdate() : this.safeToRemove(), n.isPresent !== c && (c ? d.promote() : d.relegate() || Ae.postRender(() => {
      const f = d.getStack();
      (!f || !f.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: n, layoutAnchor: i } = this.props, { projection: o } = n;
    o && (o.options.layoutAnchor = i, o.root.didUpdate(), pd.postRender(() => {
      !o.currentAnimation && o.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: n, layoutGroup: i, switchLayoutGroup: o } = this.props, { projection: a } = n;
    Wu = !0, a && (a.scheduleCheckAfterUnmount(), i && i.group && i.group.remove(a), o && o.deregister && o.deregister(a));
  }
  safeToRemove() {
    const { safeToRemove: n } = this.props;
    n && n();
  }
  render() {
    return null;
  }
}
function Mv(e) {
  const [n, i] = gv(), o = C.useContext(Yc);
  return k.jsx(nA, { ...e, layoutGroup: o, switchLayoutGroup: C.useContext(kv), isPresent: n, safeToRemove: i });
}
const rA = {
  pan: {
    Feature: tA
  },
  drag: {
    Feature: eA,
    ProjectionNode: yv,
    MeasureLayout: Mv
  }
};
function dy(e, n, i) {
  const { props: o } = e;
  e.animationState && o.whileHover && e.animationState.setActive("whileHover", i === "Start");
  const a = "onHover" + i, c = o[a];
  c && Ae.postRender(() => c(n, wo(n)));
}
class iA extends $n {
  mount() {
    const { current: n } = this.node;
    n && (this.unmount = C1(n, (i, o) => (dy(this.node, o, "Start"), (a) => dy(this.node, a, "End"))));
  }
  unmount() {
  }
}
class oA extends $n {
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
    this.unmount = go(uo(this.node.current, "focus", () => this.onFocus()), uo(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function fy(e, n, i) {
  const { props: o } = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
    return;
  e.animationState && o.whileTap && e.animationState.setActive("whileTap", i === "Start");
  const a = "onTap" + (i === "End" ? "" : i), c = o[a];
  c && Ae.postRender(() => c(n, wo(n)));
}
class sA extends $n {
  mount() {
    const { current: n } = this.node;
    if (!n)
      return;
    const { globalTapTarget: i, propagate: o } = this.node.props;
    this.unmount = D1(n, (a, c) => (fy(this.node, c, "Start"), (d, { success: f }) => fy(this.node, d, f ? "End" : "Cancel")), {
      useGlobalTarget: i,
      stopPropagation: (o == null ? void 0 : o.tap) === !1
    });
  }
  unmount() {
  }
}
const Ec = /* @__PURE__ */ new WeakMap(), Gu = /* @__PURE__ */ new WeakMap(), aA = (e) => {
  const n = Ec.get(e.target);
  n && n(e);
}, lA = (e) => {
  e.forEach(aA);
};
function uA({ root: e, ...n }) {
  const i = e || document;
  Gu.has(i) || Gu.set(i, {});
  const o = Gu.get(i), a = JSON.stringify(n);
  return o[a] || (o[a] = new IntersectionObserver(lA, { root: e, ...n })), o[a];
}
function cA(e, n, i) {
  const o = uA(n);
  return Ec.set(e, i), o.observe(e), () => {
    Ec.delete(e), o.unobserve(e);
  };
}
const dA = {
  some: 0,
  all: 1
};
class fA extends $n {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var y;
    (y = this.stopObserver) == null || y.call(this);
    const { viewport: n = {} } = this.node.getProps(), { root: i, margin: o, amount: a = "some", once: c } = n, d = {
      root: i ? i.current : void 0,
      rootMargin: o,
      threshold: typeof a == "number" ? a : dA[a]
    }, f = (g) => {
      const { isIntersecting: v } = g;
      if (this.isInView === v || (this.isInView = v, c && !v && this.hasEnteredView))
        return;
      v && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", v);
      const { onViewportEnter: l, onViewportLeave: h } = this.node.getProps(), S = v ? l : h;
      S && S(g);
    };
    this.stopObserver = cA(this.node.current, d, f);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: n, prevProps: i } = this.node;
    ["amount", "margin", "root"].some(pA(n, i)) && this.startObserver();
  }
  unmount() {
    var n;
    (n = this.stopObserver) == null || n.call(this), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function pA({ viewport: e = {} }, { viewport: n = {} } = {}) {
  return (i) => e[i] !== n[i];
}
const hA = {
  inView: {
    Feature: fA
  },
  tap: {
    Feature: sA
  },
  focus: {
    Feature: oA
  },
  hover: {
    Feature: iA
  }
}, mA = {
  layout: {
    ProjectionNode: yv,
    MeasureLayout: Mv
  }
}, yA = {
  ...Vk,
  ...hA,
  ...rA,
  ...mA
}, gA = /* @__PURE__ */ Ik(yA, Fk), hr = gA;
function vA(e) {
  const i = String(e || "").toLowerCase().split(".");
  if (i.length !== 4 || i.some((a) => !/^\d+$/.test(a))) return !1;
  const o = i.map(Number);
  return o.some((a) => a < 0 || a > 255) ? !1 : o[0] === 10 || o[0] === 172 && o[1] >= 16 && o[1] <= 31 || o[0] === 192 && o[1] === 168;
}
function bv(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function py(e) {
  return bv(e) || vA(e);
}
function SA(e) {
  return !e || bv(e) ? "127.0.0.1" : e;
}
const wA = (() => {
  var v, l, h, S;
  const e = globalThis.window || globalThis, n = globalThis.document || {}, i = e.location || {}, o = String(e.SYNAPSE_DATA_API_PORT || ((l = (v = n.body) == null ? void 0 : v.dataset) == null ? void 0 : l.dataApiPort) || "3001").trim(), { protocol: a = "file:", hostname: c = "127.0.0.1", port: d = "" } = i, f = `http://${SA(c)}:${o || "3001"}`, y = String(e.SYNAPSE_DATA_API_BASE || ((S = (h = n.body) == null ? void 0 : h.dataset) == null ? void 0 : S.dataApiBase) || "").replace(/\/+$/, ""), g = `${a}//${i.host || (d ? `${c}:${d}` : c)}`.replace(/\/+$/, "");
  return y && !(py(c) && d !== o && y === g) ? y : a === "file:" || py(c) && d !== o ? f : `${a}//${i.host || c}`;
})(), xA = new Hy(wA), Ku = Number((globalThis.window || globalThis).SYNAPSE_DATA_API_TIMEOUT_MS || 6e3), _A = Number.isFinite(Ku) && Ku > 0 ? Ku : 6e3;
function TA(e, n) {
  typeof window > "u" || console.warn(e, n);
}
async function kA(e) {
  var o, a;
  const i = (((a = (o = e.headers) == null ? void 0 : o.get) == null ? void 0 : a.call(o, "content-type")) || "").includes("application/json") ? await e.json() : {};
  if (!e.ok || (i == null ? void 0 : i.ok) === !1)
    throw new Error((i == null ? void 0 : i.error) || `Synapse data API returned HTTP ${e.status}`);
  return i;
}
async function AA(e, n = {}) {
  const i = await xA.fetch(e, {
    timeoutMs: _A,
    ...n
  });
  return kA(i);
}
async function CA(e) {
  try {
    return (await AA("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e || {})
    })).item || null;
  } catch (n) {
    return TA("Synapse data API focus-session save skipped:", n), null;
  }
}
class PA {
  constructor(n = () => globalThis.localStorage) {
    this.storageProvider = n;
  }
  get storage() {
    return this.storageProvider();
  }
  set(n, i) {
    try {
      return this.storage.setItem(n, i), !0;
    } catch (o) {
      return console.warn(`Could not save ${n} to localStorage:`, o), !1;
    }
  }
  get(n, i = "") {
    try {
      const o = this.storage.getItem(n);
      return o === null ? i : o;
    } catch (o) {
      return console.warn(`Could not read ${n} from localStorage:`, o), i;
    }
  }
  remove(n) {
    try {
      return this.storage.removeItem(n), !0;
    } catch (i) {
      return console.warn(`Could not remove ${n} from localStorage:`, i), !1;
    }
  }
  readJSON(n, i) {
    const o = this.get(n, "");
    if (!o) return i;
    try {
      const a = JSON.parse(o);
      return a ?? i;
    } catch (a) {
      return console.warn(`Could not parse ${n} from localStorage:`, a), i;
    }
  }
  writeJSON(n, i) {
    try {
      return this.set(n, JSON.stringify(i));
    } catch (o) {
      return console.warn(`Could not serialize ${n} for localStorage:`, o), !1;
    }
  }
}
const Rv = new PA();
function Td(e, n) {
  return Rv.readJSON(e, n);
}
function kd(e, n) {
  return Rv.writeJSON(e, n);
}
const Dv = "synapse.focusRoom.sessions.v1", Nv = "synapse.focusRoom.draft.v1", Iv = "synapse.focusRoom.active-session.v1", Mc = 40, hy = Object.freeze([
  "idle",
  "running",
  "paused",
  "completed",
  "break",
  "restoring"
]), EA = Object.freeze({
  studying: "running",
  running: "running",
  idle: "idle",
  paused: "paused",
  completed: "completed",
  break: "break",
  restoring: "restoring"
});
let bc = [];
const or = (e) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(e)}`, co = [
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
    streamUrl: or("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
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
    streamUrl: or("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: or("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: or("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: or("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: or("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: or("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, fo = [
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
], mr = [
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
], MA = [25, 45, 50, 90];
function bA(e = "") {
  const n = String(e || "");
  return co.find((i) => i.label === n) || co[0];
}
function RA(e = "") {
  const n = String(e || "");
  return fo.find((i) => i.label === n) || fo[0];
}
function Ea(e = {}) {
  const n = bA(e == null ? void 0 : e.musicType), i = RA(e == null ? void 0 : e.ambientSound);
  return {
    musicTrack: n,
    ambientSound: i,
    ambientLayers: i.layers.map((o) => ({
      ...o,
      volumeBias: jn(o.volumeBias, 1)
    }))
  };
}
function DA(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Fv(e) {
  return String(e || "").trim();
}
function NA({ material: e, goal: n, durationMinutes: i }) {
  var v;
  const o = Math.max(10, Number(i) || 25), a = (v = e == null ? void 0 : e.studyHeadings) != null && v.length ? e.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], c = String(n || "").trim() || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`, d = Math.max(1, Math.floor(o * 0.2)), f = Math.max(1, Math.floor(o * 0.4)), y = Math.max(1, Math.floor(o * 0.2)), g = Math.max(1, o - d - f - y);
  return [
    { minutes: d, task: `Set the goal: ${c}` },
    { minutes: f, task: `Review ${a[0] || "the core ideas"}` },
    { minutes: y, task: `Practice with ${a[1] || a[0] || "the generated examples"}` },
    { minutes: g, task: "Summarize mistakes and choose the next study step" }
  ];
}
function Ov() {
  return Td(Nv, null);
}
function IA(e) {
  return kd(Nv, e || null);
}
function jv(e) {
  if (!e || typeof e != "object")
    return { materials: {} };
  const n = DA(e.materials);
  return {
    ...e,
    materials: { ...n }
  };
}
function ei(e, n = "idle") {
  const i = EA[String(e || "").trim().toLowerCase()];
  return i && hy.includes(i) ? i : hy.includes(n) ? n : "idle";
}
function Ad(e) {
  return ei(e) === "running" ? "studying" : ei(e);
}
function Lv(e = {}, n = {}) {
  const i = e && typeof e == "object" ? e : {}, o = n && typeof n == "object" ? n : {}, a = Object.prototype.hasOwnProperty.call(i, "timerStatus"), c = Object.prototype.hasOwnProperty.call(i, "timerState") || Object.prototype.hasOwnProperty.call(i, "timerPhase"), d = ei(
    c ? i.timerState || i.timerPhase : a ? i.timerStatus : i.status || o.timerState,
    ei(o.timerState || o.timerPhase || o.timerStatus)
  ), f = i.timerMode === "countup" || o.timerMode === "countup" && !Object.prototype.hasOwnProperty.call(i, "timerMode") ? "countup" : "countdown", g = Object.fromEntries(["timerAnchorAtMs", "timerPausedAtMs", "timerUpdatedAtMs", "timerRestoredAtMs"].map((l) => {
    const h = Object.prototype.hasOwnProperty.call(i, l) ? i[l] : o[l], S = Number(h);
    return [l, Number.isFinite(S) && S > 0 ? S : null];
  })), v = Math.max(0, jn(
    Object.prototype.hasOwnProperty.call(i, "elapsedSeconds") ? i.elapsedSeconds : o.elapsedSeconds,
    0
  ));
  return {
    ...o,
    ...i,
    timerState: d,
    timerPhase: d,
    status: d,
    timerStatus: Ad(d),
    timerMode: f,
    elapsedSeconds: v,
    ...g
  };
}
function Vv() {
  return jv(Td(Iv, null));
}
function FA(e) {
  return kd(Iv, jv(e));
}
function OA(e) {
  const n = Fv(e);
  if (!n) return null;
  const o = Vv().materials[n];
  return o && typeof o == "object" ? Lv(o) : null;
}
function Cd(e, n) {
  const i = Fv(e);
  if (!i) return !1;
  const o = Vv();
  return n && typeof n == "object" ? o.materials[i] = {
    ...Lv(n, o.materials[i]),
    materialId: i,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  } : delete o.materials[i], FA(o);
}
function Bv(e) {
  return Cd(e, null);
}
function Rc() {
  const e = Td(Dv, []), n = Array.isArray(e) ? e : [], i = /* @__PURE__ */ new Set();
  return [...bc, ...n].filter((o) => {
    const a = String((o == null ? void 0 : o.sessionId) || "");
    return !a || i.has(a) ? !1 : (i.add(a), !0);
  }).slice(0, Mc);
}
function jn(e, n) {
  const i = Number(e);
  return Number.isFinite(i) ? i : n;
}
function jA(e = {}) {
  const n = (/* @__PURE__ */ new Date()).toISOString(), o = { ...{
    sessionId: e.sessionId || `focus-${Date.now()}`,
    materialId: String(e.materialId || ""),
    materialTitle: e.materialTitle || "Study material",
    studyGoal: e.studyGoal || "",
    selectedScene: e.selectedScene || "morning-window",
    musicType: e.musicType || "Deep Focus",
    ambientSound: e.ambientSound || "Nature",
    musicVolume: jn(e.musicVolume ?? 60, 60),
    ambientVolume: jn(e.ambientVolume ?? 50, 50),
    pomodoroDuration: jn(e.pomodoroDuration || 25, 25),
    startedAt: e.startedAt || n,
    endedAt: e.endedAt || n,
    totalFocusTime: Math.max(0, jn(e.totalFocusTime || 0, 0)),
    flashcardsCompleted: Math.max(0, jn(e.flashcardsCompleted || 0, 0)),
    quizScore: e.quizScore === null || e.quizScore === void 0 || e.quizScore === "" ? null : Number.isFinite(Number(e.quizScore)) ? Number(e.quizScore) : null,
    mistakesMade: Array.isArray(e.mistakesMade) ? e.mistakesMade : [],
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks : [],
    aiReflection: e.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: e.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: e.sessionDate || n
  }, persisted: !0 }, a = Rc().filter((y) => y.sessionId !== o.sessionId), c = [o, ...a.map((y) => ({ ...y, persisted: !0 }))].slice(0, Mc), d = kd(Dv, c), f = { ...o, persisted: d };
  return CA(f).catch((y) => {
    console.warn("Synapse data API focus-session background save failed:", y);
  }), d ? bc = [] : bc = [f, ...a].slice(0, Mc), f;
}
function Pd(e) {
  const n = Math.max(0, jn(e || 0, 0)), i = Math.floor(n / 3600), o = Math.floor(n % 3600 / 60);
  return i ? `${i}h ${o}m` : `${o}m`;
}
var zy;
const Dc = ((zy = mr[0]) == null ? void 0 : zy.id) || "morning-window", Qr = MA[0], zv = 10, ma = 180, LA = 0, VA = 100, BA = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"], Nc = new Set(BA), Uv = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function zA(e, n, i, o) {
  const a = Number(e);
  return Number.isFinite(a) ? Math.min(o, Math.max(i, a)) : n;
}
function Xr(e, n, i, o) {
  return Math.round(zA(e, n, i, o));
}
function dr(e, n = 50) {
  return Xr(e, n, LA, VA);
}
function po(e, n = Qr) {
  return Xr(e, n, zv, ma);
}
function Ed(e) {
  return mr.find((n) => n.id === e) || null;
}
function Un(e = Dc) {
  return Ed(e) || mr[0] || {
    id: Dc,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function $v(e) {
  return Array.isArray(e) ? e.map((n) => ({
    minutes: Xr(n == null ? void 0 : n.minutes, 5, 1, ma),
    task: String((n == null ? void 0 : n.task) || "").trim()
  })).filter((n) => n.task) : [];
}
function Ji(e) {
  return Array.isArray(e) ? e.map((n) => ({
    role: String((n == null ? void 0 : n.role) || "assistant") === "user" ? "user" : "assistant",
    text: String((n == null ? void 0 : n.text) || "").trim(),
    createdAt: (n == null ? void 0 : n.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
  })).filter((n) => n.text).slice(-24) : [];
}
function Hv(e) {
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
function Ic(e, n, i) {
  return e ? NA({
    material: e,
    goal: n,
    durationMinutes: i
  }) : [];
}
function Xt(e) {
  const n = po(e);
  return n > 0 ? n * 60 : 0;
}
function ro(e) {
  const n = Math.max(0, Math.floor(Number(e) || 0)), i = Math.floor(n / 3600), o = Math.floor(n % 3600 / 60), a = n % 60, c = (d) => String(d).padStart(2, "0");
  return i ? `${i}:${c(o)}:${c(a)}` : `${c(o)}:${c(a)}`;
}
function my(e) {
  const n = (e == null ? void 0 : e.flashcards) || [];
  return Array.isArray(n) ? n.slice(0, 24) : [];
}
function UA(e, n) {
  return String((e == null ? void 0 : e.id) || (e == null ? void 0 : e.front) || (e == null ? void 0 : e.term) || n);
}
function $A(e) {
  var n;
  return Array.isArray(e == null ? void 0 : e.questions) ? e.questions : Array.isArray((n = e == null ? void 0 : e.quiz) == null ? void 0 : n.questions) ? e.quiz.questions : [];
}
function Fc(e) {
  return (Array.isArray(e == null ? void 0 : e.quizzes) ? e.quizzes : []).flatMap((i) => $A(i).map((o) => {
    var a;
    return {
      ...o,
      quizTitle: (i == null ? void 0 : i.title) || ((a = i == null ? void 0 : i.quiz) == null ? void 0 : a.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function HA(e, n) {
  return (e == null ? void 0 : e.question) || (e == null ? void 0 : e.prompt) || (e == null ? void 0 : e.stem) || `Question ${n + 1}`;
}
function Md(e) {
  return String((e == null ? void 0 : e.type) || "").toLowerCase();
}
function WA(e) {
  return String((e == null ? void 0 : e.label) || (e == null ? void 0 : e.text) || e).trim();
}
function ya(e) {
  const n = (e == null ? void 0 : e.choices) || (e == null ? void 0 : e.options) || (e == null ? void 0 : e.answers);
  return Array.isArray(n) && n.length ? n.map(WA).filter(Boolean) : Md(e) === "true_false" ? ["True", "False"] : [];
}
function Oc(e) {
  const n = (e == null ? void 0 : e.correctOptionIndexes) || (e == null ? void 0 : e.correct_option_indexes) || (e == null ? void 0 : e.correctIndexes);
  return Array.isArray(n) ? n.map((i) => Number(i)).filter(Number.isInteger) : [];
}
function GA(e, n) {
  const i = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [], o = Array.isArray(n) ? [...n].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [];
  return i.length === o.length && i.every((a, c) => a === o[c]);
}
function fr(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function ga(e, n) {
  if (Number.isInteger(n)) return n;
  const i = Number(n);
  if (typeof n != "string" && Number.isInteger(i)) return i;
  const o = ya(e), a = fr(n);
  return o.findIndex((c) => fr(c) === a);
}
function Wv(e, n) {
  if (typeof n == "boolean") return n;
  if (n === 0) return !0;
  if (n === 1) return !1;
  const i = ya(e), o = fr(n);
  return o === "true" ? !0 : o === "false" ? !1 : fr(i[0]) === o ? !0 : fr(i[1]) === o ? !1 : null;
}
function KA(e, n, i) {
  const o = Md(e);
  if (o === "multiple_choice") {
    const a = ga(e, n);
    if (!Number.isInteger(a) || a < 0) return [];
    const c = Array.isArray(i) ? [...i] : [];
    return c.includes(a) ? c.filter((d) => d !== a) : [...c, a].sort((d, f) => d - f);
  }
  if (o === "single_choice") {
    const a = ga(e, n);
    return Number.isInteger(a) && a >= 0 ? a : "";
  }
  if (o === "true_false") {
    const a = Wv(e, n);
    return a === null ? "" : a;
  }
  return String(n || "");
}
function Gv(e) {
  const n = (e == null ? void 0 : e.correctAnswer) ?? (e == null ? void 0 : e.correct_answer) ?? (e == null ? void 0 : e.answer) ?? (e == null ? void 0 : e.correct), i = Oc(e);
  if (i.length) {
    const o = ya(e);
    return i.map((a) => o[a] || "").filter(Boolean).join(", ");
  }
  if (typeof (e == null ? void 0 : e.correctBoolean) == "boolean" || typeof (e == null ? void 0 : e.correct_boolean) == "boolean") {
    const o = ya(e);
    return (typeof e.correctBoolean == "boolean" ? e.correctBoolean : e.correct_boolean) ? o[0] || "True" : o[1] || "False";
  }
  return e != null && e.expectedAnswer || e != null && e.expected_answer ? String(e.expectedAnswer || e.expected_answer || "").trim() : Array.isArray(n) ? n.map((o) => String(o)).join(", ") : String(n || "").trim();
}
function YA(e, n) {
  const i = Md(e);
  if (i === "single_choice") {
    const a = Oc(e)[0], c = ga(e, n);
    return Number.isInteger(a) ? c === a : null;
  }
  if (i === "multiple_choice") {
    const a = Oc(e), c = Array.isArray(n) ? n : [ga(e, n)].filter(Number.isInteger);
    return a.length ? GA(c, a) : null;
  }
  if (i === "true_false") {
    const a = typeof (e == null ? void 0 : e.correctBoolean) == "boolean" ? e.correctBoolean : e == null ? void 0 : e.correct_boolean, c = Wv(e, n);
    return typeof a == "boolean" && c !== null ? c === a : null;
  }
  const o = Gv(e);
  return o ? fr(n) === fr(o) : null;
}
function Kv(e, n, i) {
  var f;
  const o = String(e || "").trim(), a = String((n == null ? void 0 : n.summaryText) || (n == null ? void 0 : n.aiSummary) || "").slice(0, 420), c = ((f = n == null ? void 0 : n.studyHeadings) == null ? void 0 : f[0]) || (n == null ? void 0 : n.materialTitle) || "this material", d = i || `Study ${(n == null ? void 0 : n.materialTitle) || "this material"}`;
  return o ? [
    `For ${c}: ${a || "use the selected material as your main source."}`,
    `Your current goal is: ${d}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function QA() {
  return /* @__PURE__ */ k.jsx("svg", { className: "liquid-glass-filter-defs", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ k.jsx("defs", { children: /* @__PURE__ */ k.jsxs("filter", { id: "liquid-glass-displacement", x: "-12%", y: "-12%", width: "124%", height: "124%", colorInterpolationFilters: "sRGB", children: [
    /* @__PURE__ */ k.jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.024", numOctaves: "2", seed: "17", result: "liquid-noise" }),
    /* @__PURE__ */ k.jsx("feDisplacementMap", { in: "SourceGraphic", in2: "liquid-noise", scale: "7", xChannelSelector: "R", yChannelSelector: "B", result: "refracted-surface" }),
    /* @__PURE__ */ k.jsx("feColorMatrix", { in: "refracted-surface", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.04 0", result: "edge-alpha" }),
    /* @__PURE__ */ k.jsx("feGaussianBlur", { in: "edge-alpha", stdDeviation: "0.25", result: "soft-edge" }),
    /* @__PURE__ */ k.jsx("feBlend", { in: "soft-edge", in2: "refracted-surface", mode: "screen" })
  ] }) }) });
}
function XA({ scene: e }) {
  const [n, i] = C.useState(!1), [o, a] = C.useState(!1);
  return C.useEffect(() => {
    i(!1), a(!1);
  }, [e == null ? void 0 : e.id]), /* @__PURE__ */ k.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ k.jsx(QA, {}),
    /* @__PURE__ */ k.jsx(Ca, { mode: "wait", children: /* @__PURE__ */ k.jsxs(
      hr.div,
      {
        className: "focus-background",
        style: { backgroundImage: o ? "none" : void 0 },
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
              onLoad: () => i(!0),
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
              onLoadedData: () => i(!0),
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
const ZA = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), JA = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (n, i, o) => o ? o.toUpperCase() : i.toLowerCase()
), yy = (e) => {
  const n = JA(e);
  return n.charAt(0).toUpperCase() + n.slice(1);
}, Yv = (...e) => e.filter((n, i, o) => !!n && n.trim() !== "" && o.indexOf(n) === i).join(" ").trim(), qA = (e) => {
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
var eC = {
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
const tC = C.forwardRef(
  ({
    color: e = "currentColor",
    size: n = 24,
    strokeWidth: i = 2,
    absoluteStrokeWidth: o,
    className: a = "",
    children: c,
    iconNode: d,
    ...f
  }, y) => C.createElement(
    "svg",
    {
      ref: y,
      ...eC,
      width: n,
      height: n,
      stroke: e,
      strokeWidth: o ? Number(i) * 24 / Number(n) : i,
      className: Yv("lucide", a),
      ...!c && !qA(f) && { "aria-hidden": "true" },
      ...f
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
const tt = (e, n) => {
  const i = C.forwardRef(
    ({ className: o, ...a }, c) => C.createElement(tC, {
      ref: c,
      iconNode: n,
      className: Yv(
        `lucide-${ZA(yy(e))}`,
        `lucide-${e}`,
        o
      ),
      ...a
    })
  );
  return i.displayName = yy(e), i;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nC = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], rC = tt("check", nC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const iC = [
  ["rect", { width: "12", height: "12", x: "2", y: "10", rx: "2", ry: "2", key: "6agr2n" }],
  [
    "path",
    { d: "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6", key: "1o487t" }
  ],
  ["path", { d: "M6 18h.01", key: "uhywen" }],
  ["path", { d: "M10 14h.01", key: "ssrbsk" }],
  ["path", { d: "M15 6h.01", key: "cblpky" }],
  ["path", { d: "M18 9h.01", key: "2061c0" }]
], oC = tt("dices", iC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sC = [
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
], aC = tt("door-open", sC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lC = [
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
], va = tt("footprints", lC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uC = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
], cC = tt("minimize-2", uC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dC = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], jc = tt("pause", dC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fC = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], Qv = tt("play", fC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pC = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], Xv = tt("rotate-ccw", pC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hC = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
], mC = tt("save", hC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yC = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
], Lc = tt("settings-2", yC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gC = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], Zv = tt("skip-forward", gC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vC = [
  ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
  ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
  ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
  ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
  ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
  ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
  ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
  ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
  ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }]
], SC = tt("sliders-horizontal", vC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wC = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
], Sa = tt("users", wC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xC = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], bd = tt("volume-2", xC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _C = [
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
], TC = tt("waves", _C);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kC = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], AC = tt("x", kC), gy = (e) => {
  let n;
  const i = /* @__PURE__ */ new Set(), o = (g, v) => {
    const l = typeof g == "function" ? g(n) : g;
    if (!Object.is(l, n)) {
      const h = n;
      n = v ?? (typeof l != "object" || l === null) ? l : Object.assign({}, n, l), i.forEach((S) => S(n, h));
    }
  }, a = () => n, f = { setState: o, getState: a, getInitialState: () => y, subscribe: (g) => (i.add(g), () => i.delete(g)) }, y = n = e(o, a, f);
  return f;
}, CC = ((e) => e ? gy(e) : gy), PC = (e) => e;
function EC(e, n = PC) {
  const i = hn.useSyncExternalStore(
    e.subscribe,
    hn.useCallback(() => n(e.getState()), [e, n]),
    hn.useCallback(() => n(e.getInitialState()), [e, n])
  );
  return hn.useDebugValue(i), i;
}
const vy = (e) => {
  const n = CC(e), i = (o) => EC(n, o);
  return Object.assign(i, n), i;
}, MC = ((e) => e ? vy(e) : vy), Rd = Object.freeze({
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
function bC() {
  return mr[0] || Un(Dc);
}
function RC(e) {
  const n = String(e || "");
  if (!n) return null;
  const o = Hv(Ov()).materials[n];
  return o && typeof o == "object" ? o : null;
}
function dn(e) {
  var o;
  const n = String(e.selectedMaterialId || ((o = e.selectedMaterial) == null ? void 0 : o.materialId) || "");
  if (!n) return;
  const i = Hv(Ov());
  i.materials[n] = {
    materialId: n,
    selectedScene: e.selectedScene,
    musicType: e.musicType,
    ambientSound: e.ambientSound,
    musicVolume: dr(e.musicVolume),
    ambientVolume: dr(e.ambientVolume),
    audioChannels: { ...Rd, ...e.audioChannels || {} },
    durationMinutes: po(e.pomodoroDuration),
    studyGoal: e.studyGoal,
    studyPlan: $v(e.studyPlan),
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks.filter(Boolean) : [],
    workspaceNotes: String(e.workspaceNotes || ""),
    workspaceUpdatedAt: e.workspaceUpdatedAt || "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, IA(i);
}
function DC(e) {
  return Array.isArray(e == null ? void 0 : e.completedTasks) ? e.completedTasks.map((n) => String(n || "").trim()).filter(Boolean) : [];
}
function Vc(e = {}) {
  return {
    sectionTitle: String(e.sectionTitle || "").trim(),
    excerpt: String(e.excerpt || "").trim().slice(0, 1800)
  };
}
function Jv(e = null) {
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
function pt() {
  const e = Date.now();
  return Number.isFinite(e) ? e : 0;
}
function zt(e = {}) {
  return ei(e.timerState || e.timerPhase || e.status || e.timerStatus);
}
function Ln(e = {}) {
  if (e.timerMode === "countup") return 0;
  const n = Number(e.timerDurationSeconds);
  return Number.isFinite(n) && n > 0 ? n : Xt(e.pomodoroDuration);
}
function io(e = {}, n = pt()) {
  const i = Math.max(0, Number(e.elapsedSeconds) || 0);
  if (zt(e) !== "running") return i;
  const o = Number(e.timerAnchorAtMs);
  return !Number.isFinite(o) || o <= 0 ? i : Math.max(i, Math.floor(Math.max(0, n - o) / 1e3));
}
function Bt(e, n = pt()) {
  const i = ei(e);
  return {
    timerState: i,
    timerPhase: i,
    status: i,
    timerStatus: Ad(i),
    timerUpdatedAtMs: n
  };
}
function NC(e = {}) {
  const n = zt(e);
  return {
    timerState: n,
    timerPhase: n,
    status: n,
    timerStatus: Ad(n),
    timerMode: e.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: Number.isFinite(Number(e.timerAnchorAtMs)) ? Number(e.timerAnchorAtMs) : null,
    timerPausedAtMs: Number.isFinite(Number(e.timerPausedAtMs)) ? Number(e.timerPausedAtMs) : null,
    timerUpdatedAtMs: Number.isFinite(Number(e.timerUpdatedAtMs)) ? Number(e.timerUpdatedAtMs) : null,
    timerRestoredAtMs: Number.isFinite(Number(e.timerRestoredAtMs)) ? Number(e.timerRestoredAtMs) : null,
    timerDurationSeconds: Ln(e),
    pomodoroDuration: e.pomodoroDuration,
    elapsedSeconds: Math.max(0, Number(e.elapsedSeconds) || 0),
    startedAt: e.startedAt || null,
    currentSession: e.currentSession || null,
    view: e.view
  };
}
function fn(e) {
  var i;
  const n = String(e.selectedMaterialId || ((i = e.selectedMaterial) == null ? void 0 : i.materialId) || "");
  return !n || e.view !== "session" ? !1 : Cd(n, NC(e));
}
function Sy(e, n = pt()) {
  const i = io(e, n), o = Ln(e), a = e.timerMode !== "countup" && o > 0 && i >= o, c = a ? "completed" : zt(e);
  return {
    ...Bt(c, n),
    elapsedSeconds: a ? o : i,
    timerAnchorAtMs: c === "running" ? e.timerAnchorAtMs : null,
    timerPausedAtMs: c === "running" ? null : e.timerPausedAtMs || n,
    audioPlaying: c === "running" ? e.audioPlaying : !1
  };
}
function IC(e, n = {}) {
  const i = Un(n.selectedScene), o = RC(e == null ? void 0 : e.materialId), a = Ed(o == null ? void 0 : o.selectedScene) ? o.selectedScene : i.id, c = Un(a), d = String((o == null ? void 0 : o.musicType) || c.musicType || "Deep Focus"), f = String((o == null ? void 0 : o.ambientSound) || c.ambientSound || "Nature"), y = dr(o == null ? void 0 : o.musicVolume, n.musicVolume ?? 60), g = dr(o == null ? void 0 : o.ambientVolume, n.ambientVolume ?? 50), v = po(o == null ? void 0 : o.durationMinutes, n.pomodoroDuration ?? Qr), l = String((o == null ? void 0 : o.studyGoal) || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`), h = $v(o == null ? void 0 : o.studyPlan), S = h.length ? h : Ic(e, l, v), w = DC(o), _ = String((o == null ? void 0 : o.workspaceNotes) || ""), A = (o == null ? void 0 : o.workspaceUpdatedAt) || (o == null ? void 0 : o.updatedAt) || "";
  return {
    selectedScene: a,
    musicType: d,
    ambientSound: f,
    musicVolume: y,
    ambientVolume: g,
    audioChannels: { ...Rd, ...(o == null ? void 0 : o.audioChannels) || n.audioChannels || {} },
    pomodoroDuration: v,
    studyGoal: l,
    studyPlan: S,
    completedTasks: w,
    workspaceNotes: _,
    workspaceUpdatedAt: A
  };
}
function FC(e) {
  const n = OA(e);
  if (!n || typeof n != "object") return null;
  const i = zt(n), o = pt(), a = Number(n.timerAnchorAtMs), c = Date.parse(n.startedAt || ""), d = Number.isFinite(c) ? c : NaN, f = i === "running" ? io({
    ...n,
    timerState: "running",
    timerAnchorAtMs: Number.isFinite(a) && a > 0 ? a : d
  }, o) : Math.max(0, Number(n.elapsedSeconds) || 0), y = Ln(n), g = i === "running" ? y > 0 && f >= y ? "completed" : "paused" : i, v = i === "running";
  return {
    route: n.view === "session" ? "session" : "setup",
    view: n.view === "session" ? "session" : "setup",
    ...Bt(v ? "restoring" : g, o),
    timerRestoreTarget: v ? g : null,
    timerMode: n.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: null,
    timerPausedAtMs: v ? null : Number(n.timerPausedAtMs) || null,
    timerRestoredAtMs: v ? null : o,
    timerDurationSeconds: y,
    elapsedSeconds: y > 0 ? Math.min(y, f) : f,
    startedAt: n.startedAt || null,
    currentSession: n.currentSession || null,
    completedTasks: Array.isArray(n.completedTasks) ? n.completedTasks.filter(Boolean) : [],
    flashcardIndex: Math.max(0, Number(n.flashcardIndex) || 0),
    flashcardSide: n.flashcardSide === "back" ? "back" : "front",
    flashcardProgress: n.flashcardProgress && typeof n.flashcardProgress == "object" && !Array.isArray(n.flashcardProgress) ? n.flashcardProgress : {},
    quizAnswers: n.quizAnswers && typeof n.quizAnswers == "object" && !Array.isArray(n.quizAnswers) ? n.quizAnswers : {},
    quizChecked: n.quizChecked && typeof n.quizChecked == "object" && !Array.isArray(n.quizChecked) ? n.quizChecked : {},
    chatMessages: Ji(n.chatMessages),
    chatPending: !1,
    chatError: "",
    panelTab: Nc.has(n.panelTab) ? n.panelTab : "materials",
    workspaceNotes: String(n.workspaceNotes || ""),
    workspaceUpdatedAt: n.workspaceUpdatedAt || n.updatedAt || "",
    activeNoteSection: String(n.activeNoteSection || ""),
    activeSourceHighlight: Jv(n.activeSourceHighlight),
    assistantContext: Vc(n.assistantContext),
    audioPlaying: !1
  };
}
function Vs() {
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
function jC(e) {
  const n = Object.values(e.quizChecked || {}).filter((o) => o && o.hasKnownAnswer);
  if (!n.length) return null;
  const i = n.filter((o) => o.correct).length;
  return Math.round(i / n.length * 100);
}
function LC(e) {
  const n = Fc(e.selectedMaterial);
  return Object.entries(e.quizChecked || {}).filter(([, i]) => i && i.hasKnownAnswer && !i.correct).map(([i]) => HA(n[Number(i)], Number(i))).filter(Boolean);
}
async function VC(e, n, i, o = {}) {
  var d, f;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: Kv(e, i, Z.getState().studyGoal),
      offline: !0
    };
  const a = await globalThis.apiClient.fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: e,
      selected_section: o.sectionTitle || ((d = i == null ? void 0 : i.studyHeadings) == null ? void 0 : d[0]) || "",
      selected_excerpt: o.excerpt || "",
      source_strict: !!(i != null && i.isSourceRestricted),
      preferred_language: ((f = globalThis.preferredLanguage) == null ? void 0 : f.value) || "auto",
      title: (i == null ? void 0 : i.materialTitle) || "Study material",
      summary: (i == null ? void 0 : i.aiSummary) || (i == null ? void 0 : i.summaryText) || "",
      sections: (i == null ? void 0 : i.sections) || {},
      source_identity: (i == null ? void 0 : i.materialId) || "",
      source_fingerprint: (i == null ? void 0 : i.sourceFingerprint) || "",
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
const Z = MC((e, n) => {
  const i = bC();
  return {
    route: "session",
    view: "session",
    materials: [],
    materialsStatus: "idle",
    materialsError: "",
    selectedMaterialId: "focus-room",
    selectedMaterial: null,
    selectedScene: i.id,
    musicType: i.musicType || "Deep Focus",
    ambientSound: i.ambientSound || "Nature",
    musicVolume: 60,
    ambientVolume: 50,
    audioChannels: { ...Rd },
    pomodoroDuration: Qr,
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
    timerDurationSeconds: Xt(Qr),
    studyGoal: "Deep work block",
    studyPlan: [],
    aiPanelOpen: !1,
    isIdle: !1,
    currentSession: {
      sessionId: `focus-${Date.now()}`,
      materialId: "focus-room",
      studyGoal: "Deep work block",
      selectedScene: i.id,
      musicType: i.musicType || "Deep Focus",
      ambientSound: i.ambientSound || "Nature",
      musicVolume: 60,
      ambientVolume: 50,
      pomodoroDuration: Qr,
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
    setIdle: (o) => e({ isIdle: o }),
    initializeFocusRoom() {
      const o = n();
      if (o.view === "session" && o.selectedMaterialId === "focus-room" && o.currentSession) return;
      const a = Un(o.selectedScene);
      e({
        route: "session",
        view: "session",
        selectedMaterialId: "focus-room",
        selectedMaterial: null,
        studyGoal: o.studyGoal || "Deep work block",
        studyPlan: [],
        completedTasks: [],
        currentSession: {
          sessionId: `focus-${Date.now()}`,
          materialId: "focus-room",
          studyGoal: o.studyGoal || "Deep work block",
          selectedScene: a.id,
          musicType: o.musicType,
          ambientSound: o.ambientSound,
          musicVolume: o.musicVolume,
          ambientVolume: o.ambientVolume,
          pomodoroDuration: o.pomodoroDuration,
          startedAt: null
        }
      });
    },
    setMaterialsState({ items: o = [], status: a = "ready", error: c = "" } = {}) {
      e({
        materials: Array.isArray(o) ? o : [],
        materialsStatus: a === "error" ? "error" : a === "loading" ? "loading" : "ready",
        materialsError: String(c || "")
      });
    },
    hydrateFocusRoute(o, a, { preserveSession: c = !1 } = {}) {
      const d = n(), f = !!a, y = f ? a.materialId : String(o.materialId || "");
      if (!f) {
        e({
          route: "setup",
          view: "setup",
          selectedMaterialId: y,
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
      const g = d.selectedMaterialId === y, v = g && c ? null : FC(y), l = g && c ? {} : IC(a, d), h = g && c ? {} : {
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
        timerDurationSeconds: Xt(l.pomodoroDuration || Qr),
        elapsedSeconds: 0,
        startedAt: null,
        currentSession: null,
        ...Vs(),
        chatMessages: [],
        chatPending: !1,
        chatError: "",
        activeNoteSection: "",
        activeSourceHighlight: null,
        assistantContext: { sectionTitle: "", excerpt: "" }
      }, S = g && c ? d.view === "session" ? "session" : "setup" : (v == null ? void 0 : v.view) === "session" ? "session" : "setup";
      if (e({
        ...l,
        ...h,
        ...v,
        route: S,
        view: S,
        selectedMaterialId: y,
        selectedMaterial: a,
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null
      }), (v == null ? void 0 : v.timerState) === "restoring") {
        const w = v.timerRestoreTarget || "paused";
        Promise.resolve().then(() => {
          const _ = n();
          if (_.selectedMaterialId !== y || _.timerState !== "restoring") return;
          const A = pt(), T = Ln(_), M = T > 0 ? Math.min(T, Math.max(0, Number(_.elapsedSeconds) || 0)) : Math.max(0, Number(_.elapsedSeconds) || 0), R = {
            ...Bt(w, A),
            timerRestoreTarget: null,
            timerAnchorAtMs: null,
            timerPausedAtMs: w === "paused" ? A : null,
            timerRestoredAtMs: A,
            elapsedSeconds: M,
            audioPlaying: !1
          };
          e(R), fn({ ..._, ...R });
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
        sessionHistory: Rc()
      });
    },
    selectScene(o) {
      const a = Ed(o);
      a && e((c) => {
        const d = {
          selectedScene: a.id,
          musicType: a.musicType || c.musicType,
          ambientSound: a.ambientSound || c.ambientSound
        }, f = { ...c, ...d };
        return dn(f), d;
      });
    },
    setPomodoroDuration(o) {
      e((a) => {
        const c = po(o, a.pomodoroDuration), d = a.selectedMaterial ? Ic(a.selectedMaterial, a.studyGoal, c) : [], f = {
          pomodoroDuration: c,
          studyPlan: d,
          timerDurationSeconds: a.timerMode === "countup" ? 0 : Xt(c)
        };
        return dn({ ...a, ...f }), f;
      });
    },
    setSessionDuration(o, a = 0) {
      e((c) => {
        const d = Math.max(0, Number.parseInt(o, 10) || 0), f = Math.min(59, Math.max(0, Number.parseInt(a, 10) || 0)), y = d * 60 + f, g = Xt(zv), v = Xt(ma), l = c.timerMode === "countup" ? 0 : Math.min(v, Math.max(g, y || Xt(c.pomodoroDuration))), h = c.timerMode === "countup" ? po(o, c.pomodoroDuration) : Math.floor(l / 60), S = pt(), w = zt(c), _ = io(c, S), A = c.timerMode === "countup" ? _ : Math.min(_, l), T = w === "completed" ? "paused" : w, M = {
          pomodoroDuration: h,
          timerDurationSeconds: l,
          elapsedSeconds: A,
          ...Bt(T, S),
          timerAnchorAtMs: T === "running" ? S - A * 1e3 : null,
          timerPausedAtMs: T === "paused" ? S : null
        };
        return dn({ ...c, ...M }), fn({ ...c, ...M }), M;
      });
    },
    setStudyGoal(o) {
      e((a) => {
        const c = String(o ?? ""), d = a.selectedMaterial ? Ic(a.selectedMaterial, c, a.pomodoroDuration) : [], f = { studyGoal: c, studyPlan: d };
        return dn({ ...a, ...f }), f;
      });
    },
    setSound(o, a) {
      e((c) => {
        var f;
        let d = {};
        if (o === "musicVolume" && (d = { musicVolume: dr(a, c.musicVolume) }), o === "ambientVolume" && (d = { ambientVolume: dr(a, c.ambientVolume) }), o === "musicType" && (d = { musicType: String(a || c.musicType) }), o === "ambientSound" && (d = { ambientSound: String(a || c.ambientSound) }), String(o).startsWith("audioChannel:")) {
          const y = String(o).slice(13);
          d = { audioChannels: { ...c.audioChannels, [y]: dr(a, ((f = c.audioChannels) == null ? void 0 : f[y]) ?? 0) } };
        }
        return dn({ ...c, ...d }), d;
      });
    },
    toggleAudio() {
      e((o) => ({ audioPlaying: !o.audioPlaying }));
    },
    setAudioPlaying(o) {
      e({ audioPlaying: !!o });
    },
    openDrawer(o) {
      e({
        activeDrawer: o
      });
    },
    closeDrawer() {
      e({
        activeDrawer: ""
      });
    },
    toggleAIPanel(o = null) {
      e((a) => ({ aiPanelOpen: typeof o == "boolean" ? o : !a.aiPanelOpen }));
    },
    openStudyPanel(o = "materials") {
      const a = Nc.has(String(o || "")) ? String(o) : "materials";
      e({
        panelTab: a,
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    selectSourceHighlight(o = null, { openPanel: a = !0 } = {}) {
      const c = Jv(o);
      e({
        activeSourceHighlight: c,
        activeNoteSection: (c == null ? void 0 : c.sectionTitle) || n().activeNoteSection || "",
        assistantContext: c ? Vc({
          sectionTitle: c.sectionTitle,
          excerpt: c.excerpt
        }) : n().assistantContext,
        ...a ? { panelTab: "sources", aiPanelOpen: !0, activeDrawer: "" } : {}
      });
    },
    setActiveNoteSection(o = "") {
      e({
        activeNoteSection: String(o || "").trim()
      });
    },
    setPanelTab(o) {
      const a = String(o || "materials");
      e({
        panelTab: Nc.has(a) ? a : "materials",
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    startSession() {
      const o = n();
      dn(o), e({
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
        timerUpdatedAtMs: pt(),
        timerRestoredAtMs: null,
        timerDurationSeconds: Xt(o.pomodoroDuration),
        elapsedSeconds: 0,
        startedAt: null,
        summaryRecord: null,
        aiPanelOpen: !1,
        activeDrawer: "",
        currentSession: {
          sessionId: `focus-${Date.now()}`,
          materialId: "focus-room",
          studyGoal: o.studyGoal,
          selectedScene: o.selectedScene,
          musicType: o.musicType,
          ambientSound: o.ambientSound,
          musicVolume: o.musicVolume,
          ambientVolume: o.ambientVolume,
          pomodoroDuration: o.pomodoroDuration,
          startedAt: null
        },
        ...Vs(),
        chatMessages: [],
        chatPending: !1,
        chatError: ""
      });
    },
    startTimer() {
      const o = n(), a = pt(), c = zt(o);
      if (c === "running") {
        n().tickTimer();
        return;
      }
      const d = Ln(o), f = c === "completed" || c === "break" || d > 0 && o.elapsedSeconds >= d, y = f ? 0 : Math.max(0, Number(o.elapsedSeconds) || 0), g = {
        view: "session",
        route: "session",
        ...Bt("running", a),
        audioPlaying: !0,
        summaryRecord: null,
        elapsedSeconds: y,
        startedAt: !o.startedAt || f ? new Date(a).toISOString() : o.startedAt,
        timerAnchorAtMs: a - y * 1e3,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerRestoreTarget: null,
        timerDurationSeconds: d,
        ...f ? Vs() : {}
      };
      e(g), fn({ ...o, ...g });
    },
    pauseTimer({ pauseAudio: o = !0 } = {}) {
      const a = n(), c = pt();
      if (zt(a) !== "running") {
        o && a.audioPlaying && e({ audioPlaying: !1 });
        return;
      }
      const d = Sy(a, c), f = {
        ...d,
        ...Bt(d.timerState === "completed" ? "completed" : "paused", c),
        timerAnchorAtMs: null,
        timerPausedAtMs: c,
        audioPlaying: o ? !1 : a.audioPlaying
      };
      e(f), fn({ ...a, ...f });
    },
    resetTimer() {
      const o = pt(), a = {
        ...Bt("idle", o),
        timerRestoreTarget: null,
        timerMode: "countdown",
        timerAnchorAtMs: null,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerDurationSeconds: Xt(n().pomodoroDuration),
        audioPlaying: !1,
        startedAt: null,
        elapsedSeconds: 0,
        summaryRecord: null,
        ...Vs()
      };
      e(a), fn({ ...n(), ...a });
    },
    skipTimer() {
      const o = n(), a = pt(), c = Ln(o), d = {
        ...Bt("completed", a),
        elapsedSeconds: c || Math.max(0, Number(o.elapsedSeconds) || 0),
        audioPlaying: !1,
        startedAt: o.startedAt || new Date(a).toISOString(),
        timerAnchorAtMs: null,
        timerPausedAtMs: a,
        timerDurationSeconds: c
      };
      e(d), fn({ ...o, ...d });
    },
    tickTimer() {
      const o = n();
      if (o.view !== "session" || zt(o) !== "running") return;
      const a = pt(), c = Ln(o), d = c ? Math.min(c, io(o, a)) : io(o, a), f = c > 0 && d >= c ? "completed" : "running", y = {
        ...Bt(f, a),
        elapsedSeconds: d,
        timerAnchorAtMs: f === "running" ? o.timerAnchorAtMs : null,
        timerPausedAtMs: f === "running" ? null : a,
        timerDurationSeconds: c,
        audioPlaying: f === "running" ? o.audioPlaying : !1
      };
      d === o.elapsedSeconds && f === zt(o) || (e(y), fn({ ...o, ...y }));
    },
    setTimerMode(o = "countdown") {
      const a = o === "countup" ? "countup" : "countdown", c = {
        timerMode: a,
        timerDurationSeconds: a === "countup" ? 0 : Xt(n().pomodoroDuration)
      };
      e(c), fn({ ...n(), ...c });
    },
    startBreak() {
      const o = pt(), a = {
        ...Bt("break", o),
        timerRestoreTarget: null,
        timerAnchorAtMs: null,
        timerPausedAtMs: o,
        timerDurationSeconds: 0,
        audioPlaying: !1
      };
      e(a), fn({ ...n(), ...a });
    },
    getTimerState() {
      return zt(n());
    },
    endSession() {
      var v;
      const o = n(), a = pt(), c = new Date(a).toISOString(), d = zt(o) === "running" ? Sy(o, a) : o, f = Ln(d), y = f ? Math.min(f, d.elapsedSeconds) : d.elapsedSeconds, g = jA({
        sessionId: (v = o.currentSession) == null ? void 0 : v.sessionId,
        materialId: "focus-room",
        materialTitle: "Focus Room",
        studyGoal: o.studyGoal,
        selectedScene: o.selectedScene,
        musicType: o.musicType,
        ambientSound: o.ambientSound,
        musicVolume: o.musicVolume,
        ambientVolume: o.ambientVolume,
        pomodoroDuration: o.pomodoroDuration,
        startedAt: o.startedAt || c,
        endedAt: c,
        totalFocusTime: y,
        flashcardsCompleted: 0,
        quizScore: null,
        mistakesMade: [],
        completedTasks: [],
        recommendedNextStep: "Start another protected focus block when you are ready."
      });
      Bv("focus-room"), e({
        summaryRecord: g,
        sessionHistory: Rc(),
        ...Bt("completed", a),
        audioPlaying: !1,
        timerAnchorAtMs: null,
        timerPausedAtMs: a,
        timerDurationSeconds: f,
        elapsedSeconds: f ? Math.min(f, d.elapsedSeconds) : d.elapsedSeconds,
        currentSession: null
      });
    },
    closeSummary() {
      e({ summaryRecord: null });
    },
    setWorkspaceNotes(o) {
      e((a) => {
        const c = {
          workspaceNotes: String(o ?? ""),
          workspaceUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        return dn({ ...a, ...c }), c;
      });
    },
    setAssistantContext(o = {}) {
      e({ assistantContext: Vc(o) });
    },
    toggleTask(o) {
      e((a) => {
        const c = a.studyPlan[Number(o)];
        if (!c) return {};
        const d = String(c.task || ""), f = a.completedTasks.includes(d) ? a.completedTasks.filter((y) => y !== d) : [...a.completedTasks, d];
        return dn({ ...a, completedTasks: f }), { completedTasks: f };
      });
    },
    updatePlanTask(o, a = null, c = null) {
      e((d) => {
        const f = Number(o), y = d.studyPlan[f];
        if (!y) return {};
        const g = String(y.task || ""), v = c == null ? g : String(c || "").trim(), l = a == null ? y.minutes : Xr(a, y.minutes, 1, ma), h = d.studyPlan.map((_, A) => A === f ? { minutes: l, task: v || g } : _);
        let S = d.completedTasks;
        g && g !== h[f].task && S.includes(g) && (S = S.filter((_) => _ !== g).concat(h[f].task));
        const w = { studyPlan: h, completedTasks: S };
        return dn({ ...d, ...w }), w;
      });
    },
    setFlashcardIndex(o) {
      const a = my(n().selectedMaterial);
      e({
        flashcardIndex: Xr(o, n().flashcardIndex, 0, Math.max(0, a.length - 1)),
        flashcardSide: "front"
      });
    },
    flipFlashcard() {
      e((o) => ({
        flashcardSide: o.flashcardSide === "back" ? "front" : "back"
      }));
    },
    rateFlashcard(o) {
      const a = n(), c = my(a.selectedMaterial);
      if (!c.length) return;
      const d = Xr(a.flashcardIndex, 0, 0, c.length - 1), f = c[d], y = ["easy", "medium", "hard"].includes(String(o)) ? String(o) : "medium";
      e({
        flashcardProgress: {
          ...a.flashcardProgress,
          [UA(f, d)]: {
            difficulty: y,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: d < c.length - 1 ? d + 1 : d
      });
    },
    answerQuizQuestion(o, a) {
      const c = Number(o), d = Fc(n().selectedMaterial)[c];
      if (!d) return;
      const f = String(c);
      e((y) => ({
        quizAnswers: {
          ...y.quizAnswers,
          [f]: KA(d, a, y.quizAnswers[f])
        }
      }));
    },
    checkQuizQuestion(o) {
      const a = Fc(n().selectedMaterial), c = Number(o), d = a[c];
      if (!d) return;
      const f = String(c), y = n(), g = Object.prototype.hasOwnProperty.call(y.quizAnswers, f) ? y.quizAnswers[f] : "", v = YA(d, g), l = Gv(d);
      e({
        quizChecked: {
          ...y.quizChecked,
          [f]: {
            answer: g,
            correct: v === null ? !1 : v,
            hasKnownAnswer: v !== null,
            explanation: d.explanation || d.rationale || (l ? `Correct answer: ${l}` : ""),
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
    },
    async askAssistant(o) {
      const a = String(o || "").trim();
      if (!a) return;
      const c = n(), d = c.selectedMaterial, f = Ji(c.chatMessages).slice(-10).map((y) => ({
        role: y.role === "user" ? "user" : "assistant",
        content: y.text
      }));
      e({
        chatMessages: Ji([
          ...c.chatMessages,
          { role: "user", text: a, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        ]),
        chatPending: !0,
        chatError: ""
      });
      try {
        const y = await VC(a, f, d, c.assistantContext);
        e((g) => ({
          chatMessages: Ji([
            ...g.chatMessages,
            { role: "assistant", text: y.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: y.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (y) {
        e((g) => ({
          chatMessages: Ji([
            ...g.chatMessages,
            { role: "assistant", text: Kv(a, d, n().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${y.message || "request failed"}`
        }));
      } finally {
        e({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return OC(n());
    },
    focusQuizScore() {
      return jC(n());
    },
    focusQuizMistakes() {
      return LC(n());
    },
    formatFocusedTime() {
      return Pd(n().elapsedSeconds);
    }
  };
});
function ke({
  children: e,
  className: n = "",
  variant: i = "ghost",
  type: o = "button",
  ...a
}) {
  const { onPointerMove: c, onPointerLeave: d, ...f } = a;
  return /* @__PURE__ */ k.jsx(
    "button",
    {
      className: `glass-button glass-button-${i} ${n}`.trim(),
      type: o,
      onPointerMove: (y) => {
        const g = y.currentTarget.getBoundingClientRect();
        y.currentTarget.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, (y.clientX - g.left) / g.width * 100))}%`), y.currentTarget.style.setProperty("--glass-y", `${Math.max(0, Math.min(100, (y.clientY - g.top) / g.height * 100))}%`), c == null || c(y);
      },
      onPointerLeave: (y) => {
        y.currentTarget.style.setProperty("--glass-x", "50%"), y.currentTarget.style.setProperty("--glass-y", "0%"), d == null || d(y);
      },
      ...f,
      children: e
    }
  );
}
function BC(e) {
  return e === "paused" ? "Resume" : e === "completed" ? "Restart" : "Start";
}
function zC() {
  const e = Z((D) => D.elapsedSeconds), n = Z((D) => D.pomodoroDuration), i = Z((D) => D.timerDurationSeconds), o = Z((D) => D.timerStatus), a = Z((D) => D.isIdle), c = Z((D) => D.studyGoal), d = Z((D) => D.selectedScene), f = Z((D) => D.musicType), y = Z((D) => D.ambientSound), g = Z((D) => D.startTimer), v = Z((D) => D.pauseTimer), l = Z((D) => D.resetTimer), h = Z((D) => D.skipTimer), S = o === "studying", w = Number(i) || n * 60, _ = Math.max(0, w - e), A = w ? Math.min(100, Math.max(0, e / w * 100)) : 0, T = a ? 0.96 : 1, M = o === "studying" ? { scale: [T, T + 0.012, T] } : { scale: T }, R = Un(d);
  return /* @__PURE__ */ k.jsxs(
    hr.article,
    {
      className: "timer-card liquid-glass",
      animate: M,
      transition: o === "studying" ? { duration: 4, repeat: 1 / 0, ease: "easeInOut" } : { duration: 0.2 },
      children: [
        /* @__PURE__ */ k.jsxs("span", { className: "focus-kicker", children: [
          "Focus Block / ",
          o
        ] }),
        /* @__PURE__ */ k.jsxs("div", { className: "timer-card-head", children: [
          /* @__PURE__ */ k.jsxs("div", { children: [
            /* @__PURE__ */ k.jsx("h2", { children: c || "Deep work block" }),
            /* @__PURE__ */ k.jsx("p", { children: R.name })
          ] }),
          /* @__PURE__ */ k.jsxs("div", { className: "timer-pill-row", children: [
            /* @__PURE__ */ k.jsxs("span", { className: "focus-pill", children: [
              f,
              " / ",
              y
            ] }),
            /* @__PURE__ */ k.jsx("span", { className: "focus-pill", children: "Quiet room" })
          ] })
        ] }),
        /* @__PURE__ */ k.jsx("div", { className: "timer-value", "aria-live": "polite", children: ro(_) }),
        /* @__PURE__ */ k.jsxs("div", { className: "timer-meta-grid", children: [
          /* @__PURE__ */ k.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ k.jsx("span", { children: "Focused" }),
            /* @__PURE__ */ k.jsx("strong", { children: Pd(e) })
          ] }),
          /* @__PURE__ */ k.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ k.jsx("span", { children: "Block" }),
            /* @__PURE__ */ k.jsxs("strong", { children: [
              n,
              "m"
            ] })
          ] }),
          /* @__PURE__ */ k.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ k.jsx("span", { children: "Scene" }),
            /* @__PURE__ */ k.jsx("strong", { children: R.name })
          ] })
        ] }),
        /* @__PURE__ */ k.jsx("div", { className: "focus-progress-track", "aria-label": "Focus progress", children: /* @__PURE__ */ k.jsx("div", { className: "focus-progress-fill", style: { width: `${A.toFixed(1)}%` } }) }),
        /* @__PURE__ */ k.jsxs("div", { className: "timer-actions", children: [
          /* @__PURE__ */ k.jsxs(ke, { variant: o === "studying" ? "primary" : "ghost", onClick: g, children: [
            /* @__PURE__ */ k.jsx(Qv, { size: 16, "aria-hidden": "true" }),
            " ",
            BC(o)
          ] }),
          /* @__PURE__ */ k.jsxs(ke, { onClick: () => v(), disabled: !S, "aria-label": S ? "Pause timer" : "Pause timer unavailable", children: [
            /* @__PURE__ */ k.jsx(jc, { size: 16, "aria-hidden": "true" }),
            " Pause"
          ] }),
          /* @__PURE__ */ k.jsxs(ke, { onClick: l, children: [
            /* @__PURE__ */ k.jsx(Xv, { size: 16, "aria-hidden": "true" }),
            " Reset"
          ] }),
          /* @__PURE__ */ k.jsxs(ke, { onClick: h, children: [
            /* @__PURE__ */ k.jsx(Zv, { size: 16, "aria-hidden": "true" }),
            " Skip"
          ] })
        ] })
      ]
    }
  );
}
function UC() {
  return /* @__PURE__ */ k.jsx(zC, {});
}
function $C({ onWorkspace: e, onOpenTrail: n, onOpenCompanion: i, onOpenSettings: o, onExit: a }) {
  const c = Z((f) => f.selectedScene), d = Un(c);
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
      /* @__PURE__ */ k.jsxs(ke, { className: "header-icon-button", onClick: n, title: "Open Focus Trail", "aria-label": "Open Focus Trail", children: [
        /* @__PURE__ */ k.jsx(va, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Focus Trail" })
      ] }),
      /* @__PURE__ */ k.jsxs(ke, { className: "header-icon-button", onClick: i, title: "Open Companion Room", "aria-label": "Open Companion Room", children: [
        /* @__PURE__ */ k.jsx(Sa, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Companion" })
      ] }),
      /* @__PURE__ */ k.jsxs(ke, { className: "header-icon-button", onClick: o, title: "Open room settings", "aria-label": "Open room settings", children: [
        /* @__PURE__ */ k.jsx(Lc, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Settings" })
      ] }),
      /* @__PURE__ */ k.jsxs(ke, { className: "header-icon-button header-exit-button", onClick: a, title: "Exit Focus Room", "aria-label": "Exit Focus Room", children: [
        /* @__PURE__ */ k.jsx(aC, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Exit" })
      ] })
    ] })
  ] });
}
function HC({ onFocusMode: e, audioState: n }) {
  const i = Z((Q) => Q.timerStatus), o = Z((Q) => Q.elapsedSeconds), a = Z((Q) => Q.pomodoroDuration), c = Z((Q) => Q.timerDurationSeconds), d = Z((Q) => Q.timerMode), f = Z((Q) => Q.studyGoal), y = Z((Q) => Q.currentSession), g = Z((Q) => Q.startTimer), v = Z((Q) => Q.pauseTimer), l = Z((Q) => Q.resetTimer), h = Z((Q) => Q.skipTimer), S = Z((Q) => Q.setSessionDuration), w = Z((Q) => Q.toggleAudio), _ = Z((Q) => Q.audioPlaying), [A, T] = C.useState(!1), [M, R] = C.useState("25:00"), D = d === "countup" ? 0 : Number(c) || (Number(a) || 0) * 60, j = d === "countup" ? o : Math.max(0, D - o), G = i === "paused", K = i === "studying", $ = i === "completed", W = $ && d !== "countup" ? "00:00" : ro(j), X = G ? "Paused" : $ ? "Complete" : "In focus", te = G ? "Resume timer" : K ? "Pause timer" : "Start timer", de = () => {
    R(W), T(!0);
  }, he = () => {
    const [Q = "", we = "0"] = String(M).split(":");
    S(Q, we), T(!1);
  };
  return /* @__PURE__ */ k.jsxs("div", { className: "focus-session-dock liquid-glass", "aria-label": "Focus session controls", children: [
    /* @__PURE__ */ k.jsxs("div", { className: "dock-timer-block", children: [
      /* @__PURE__ */ k.jsxs("div", { className: "dock-eyebrow", children: [
        "POMODORO #",
        (y == null ? void 0 : y.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ k.jsxs("div", { className: "dock-status", children: [
        /* @__PURE__ */ k.jsx("span", { className: `dock-status-dot ${G ? "is-paused" : ""}` }),
        X
      ] }),
      A ? /* @__PURE__ */ k.jsx(
        "input",
        {
          autoFocus: !0,
          className: "dock-time-input",
          type: "text",
          inputMode: "text",
          maxLength: 6,
          value: M,
          "aria-label": "Focus duration in minutes and seconds",
          onChange: (Q) => R(Q.target.value.replace(/[^0-9:]/g, "")),
          onFocus: (Q) => Q.currentTarget.select(),
          onKeyDown: (Q) => {
            Q.key === "Enter" && (Q.preventDefault(), he()), Q.key === "Escape" && (Q.preventDefault(), Q.currentTarget.dataset.cancel = "true", T(!1));
          },
          onBlur: (Q) => {
            Q.currentTarget.dataset.cancel !== "true" && he();
          }
        }
      ) : /* @__PURE__ */ k.jsx("button", { type: "button", className: "dock-time-edit", onClick: de, "aria-label": `Change focus duration, currently ${a} minutes`, title: "Click to change focus duration", children: /* @__PURE__ */ k.jsx("strong", { className: "dock-time", "aria-live": "off", children: W }) }),
      /* @__PURE__ */ k.jsx("div", { className: "dock-progress", "aria-hidden": "true", children: /* @__PURE__ */ k.jsx("span", { style: { width: `${D ? Math.min(100, Math.max(0, o / D * 100)) : 0}%` } }) })
    ] }),
    /* @__PURE__ */ k.jsxs("div", { className: "dock-goal-block", children: [
      /* @__PURE__ */ k.jsx("span", { className: "dock-eyebrow", children: "TODAY'S GOAL" }),
      /* @__PURE__ */ k.jsx("strong", { children: f || "A quiet block for meaningful progress" }),
      /* @__PURE__ */ k.jsxs("span", { className: "dock-goal-meta", children: [
        d === "countup" ? "Count-up" : `${ro(D)} session`,
        " · ",
        ro(o),
        " focused"
      ] })
    ] }),
    /* @__PURE__ */ k.jsxs("div", { className: "dock-action-block", children: [
      /* @__PURE__ */ k.jsxs(ke, { className: "dock-action-button", onClick: w, "aria-label": _ ? "Pause room audio" : "Play room audio", children: [
        _ ? /* @__PURE__ */ k.jsx(jc, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ k.jsx(bd, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: n != null && n.playing ? "Pause audio" : "Audio" })
      ] }),
      /* @__PURE__ */ k.jsxs(ke, { className: "dock-action-button", onClick: () => K ? v() : g(), variant: "primary", "aria-label": te, children: [
        K ? /* @__PURE__ */ k.jsx(jc, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ k.jsx(Qv, { size: 15, fill: "currentColor", "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: G ? "Resume" : K ? "Pause" : "Start" })
      ] }),
      /* @__PURE__ */ k.jsxs(ke, { className: "dock-action-button", onClick: h, "aria-label": "Skip timer", children: [
        /* @__PURE__ */ k.jsx(Zv, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Skip" })
      ] }),
      /* @__PURE__ */ k.jsxs(ke, { className: "dock-action-button", onClick: l, "aria-label": "Reset timer", children: [
        /* @__PURE__ */ k.jsx(Xv, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Reset" })
      ] }),
      /* @__PURE__ */ k.jsxs(ke, { className: "dock-focus-mode", onClick: e, "aria-label": "Enter distraction-free Focus Mode", children: [
        /* @__PURE__ */ k.jsx(SC, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ k.jsx("span", { children: "Focus Mode" })
      ] })
    ] })
  ] });
}
function ht(e, n, { checkForDefaultPrevented: i = !0 } = {}) {
  return function(a) {
    if (e == null || e(a), i === !1 || !a || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  };
}
function wy(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function WC(...e) {
  return (n) => {
    let i = !1;
    const o = e.map((a) => {
      const c = wy(a, n);
      return !i && typeof c == "function" && (i = !0), c;
    });
    if (i)
      return () => {
        for (let a = 0; a < o.length; a++) {
          const c = o[a];
          typeof c == "function" ? c() : wy(e[a], null);
        }
      };
  };
}
function st(...e) {
  return C.useCallback(WC(...e), e);
}
function Dd(e, n = []) {
  let i = [];
  function o(c, d) {
    const f = C.createContext(d);
    f.displayName = c + "Context";
    const y = i.length;
    i = [...i, d];
    const g = (l) => {
      var T;
      const { scope: h, children: S, ...w } = l, _ = ((T = h == null ? void 0 : h[e]) == null ? void 0 : T[y]) || f, A = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ k.jsx(_.Provider, { value: A, children: S });
    };
    g.displayName = c + "Provider";
    function v(l, h, S = {}) {
      var T;
      const { optional: w = !1 } = S, _ = ((T = h == null ? void 0 : h[e]) == null ? void 0 : T[y]) || f, A = C.useContext(_);
      if (A) return A;
      if (d !== void 0) return d;
      if (!w)
        throw new Error(`\`${l}\` must be used within \`${c}\``);
    }
    return [g, v];
  }
  const a = () => {
    const c = i.map((d) => C.createContext(d));
    return function(f) {
      const y = (f == null ? void 0 : f[e]) || c;
      return C.useMemo(
        () => ({ [`__scope${e}`]: { ...f, [e]: y } }),
        [f, y]
      );
    };
  };
  return a.scopeName = e, [o, GC(a, ...n)];
}
function GC(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const i = () => {
    const o = e.map((a) => ({
      useScope: a(),
      scopeName: a.scopeName
    }));
    return function(c) {
      const d = o.reduce((f, { useScope: y, scopeName: g }) => {
        const l = y(c)[`__scope${g}`];
        return { ...f, ...l };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return i.scopeName = n.scopeName, i;
}
var ti = globalThis != null && globalThis.document ? C.useLayoutEffect : () => {
}, KC = Kc[" useId ".trim().toString()] || (() => {
}), YC = 0;
function Yu(e) {
  const [n, i] = C.useState(KC());
  return ti(() => {
    i((o) => o ?? String(YC++));
  }, [e]), e || (n ? `radix-${n}` : "");
}
var QC = Kc[" useInsertionEffect ".trim().toString()] || ti;
function qv({
  prop: e,
  defaultProp: n,
  onChange: i = () => {
  },
  caller: o
}) {
  const [a, c, d] = XC({
    defaultProp: n,
    onChange: i
  }), f = e !== void 0, y = f ? e : a;
  {
    const v = C.useRef(e !== void 0);
    C.useEffect(() => {
      const l = v.current;
      l !== f && console.warn(
        `${o} is changing from ${l ? "controlled" : "uncontrolled"} to ${f ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), v.current = f;
    }, [f, o]);
  }
  const g = C.useCallback(
    (v) => {
      var l;
      if (f) {
        const h = ZC(v) ? v(e) : v;
        h !== e && ((l = d.current) == null || l.call(d, h));
      } else
        c(v);
    },
    [f, e, c, d]
  );
  return [y, g];
}
function XC({
  defaultProp: e,
  onChange: n
}) {
  const [i, o] = C.useState(e), a = C.useRef(i), c = C.useRef(n);
  return QC(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== i && ((d = c.current) == null || d.call(c, i), a.current = i);
  }, [i, a]), [i, o, c];
}
function ZC(e) {
  return typeof e == "function";
}
var e0 = Gy();
// @__NO_SIDE_EFFECTS__
function wa(e) {
  const n = C.forwardRef((i, o) => {
    let { children: a, ...c } = i, d = null, f = !1;
    const y = [];
    xy(a) && typeof Bs == "function" && (a = Bs(a._payload)), C.Children.forEach(a, (h) => {
      var S;
      if (nP(h)) {
        f = !0;
        const w = h;
        let _ = "child" in w.props ? w.props.child : w.props.children;
        xy(_) && typeof Bs == "function" && (_ = Bs(_._payload)), d = qC(w, _), y.push((S = d == null ? void 0 : d.props) == null ? void 0 : S.children);
      } else
        y.push(h);
    }), d ? d = C.cloneElement(d, void 0, y) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !f && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const g = d ? tP(d) : void 0, v = st(o, g);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          f ? sP(e) : oP(e)
        );
      return a;
    }
    const l = eP(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = o ? v : g), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var JC = Symbol.for("radix.slottable"), qC = (e, n) => {
  if ("child" in e.props) {
    const i = e.props.child;
    return C.isValidElement(i) ? C.cloneElement(i, void 0, e.props.children(i.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function eP(e, n) {
  const i = { ...n };
  for (const o in n) {
    const a = e[o], c = n[o];
    /^on[A-Z]/.test(o) ? a && c ? i[o] = (...f) => {
      const y = c(...f);
      return a(...f), y;
    } : a && (i[o] = a) : o === "style" ? i[o] = { ...a, ...c } : o === "className" && (i[o] = [a, c].filter(Boolean).join(" "));
  }
  return { ...e, ...i };
}
function tP(e) {
  var o, a;
  let n = (o = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : o.get, i = n && "isReactWarning" in n && n.isReactWarning;
  return i ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, i = n && "isReactWarning" in n && n.isReactWarning, i ? e.props.ref : e.props.ref || e.ref);
}
function nP(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === JC;
}
var rP = Symbol.for("react.lazy");
function xy(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === rP && "_payload" in e && iP(e._payload);
}
function iP(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var oP = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, sP = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, Bs = Kc[" use ".trim().toString()], aP = [
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
], yt = aP.reduce((e, n) => {
  const i = /* @__PURE__ */ wa(`Primitive.${n}`), o = C.forwardRef((a, c) => {
    const { asChild: d, ...f } = a, y = d ? i : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ k.jsx(y, { ...f, ref: c });
  });
  return o.displayName = `Primitive.${n}`, { ...e, [n]: o };
}, {});
function lP(e, n) {
  e && e0.flushSync(() => e.dispatchEvent(n));
}
function ho(e) {
  const n = C.useRef(e);
  return C.useEffect(() => {
    n.current = e;
  }), C.useMemo(() => ((...i) => {
    var o;
    return (o = n.current) == null ? void 0 : o.call(n, ...i);
  }), []);
}
var uP = "DismissableLayer", Bc = "dismissableLayer.update", cP = "dismissableLayer.pointerDownOutside", dP = "dismissableLayer.focusOutside", _y, Nd = C.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
}), t0 = C.forwardRef(
  (e, n) => {
    const {
      disableOutsidePointerEvents: i = !1,
      deferPointerDownOutside: o = !1,
      onEscapeKeyDown: a,
      onPointerDownOutside: c,
      onFocusOutside: d,
      onInteractOutside: f,
      onDismiss: y,
      ...g
    } = e, v = C.useContext(Nd), [l, h] = C.useState(null), S = (l == null ? void 0 : l.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, w] = C.useState({}), _ = st(n, h), A = Array.from(v.layers), [T] = [
      ...v.layersWithOutsidePointerEventsDisabled
    ].slice(-1), M = T ? A.indexOf(T) : -1, R = l ? A.indexOf(l) : -1, D = v.layersWithOutsidePointerEventsDisabled.size > 0, j = R >= M, G = C.useRef(!1), K = yP(
      (te) => {
        c == null || c(te), f == null || f(te), te.defaultPrevented || y == null || y();
      },
      {
        ownerDocument: S,
        deferPointerDownOutside: o,
        isDeferredPointerDownOutsideRef: G,
        dismissableSurfaces: v.dismissableSurfaces,
        shouldHandlePointerDownOutside: C.useCallback(
          (te) => {
            if (!(te instanceof Node))
              return !1;
            const de = [...v.branches].some(
              (he) => he.contains(te)
            );
            return j && !de;
          },
          [v.branches, j]
        )
      }
    ), $ = gP((te) => {
      if (o && G.current)
        return;
      const de = te.target;
      [...v.branches].some((Q) => Q.contains(de)) || (d == null || d(te), f == null || f(te), te.defaultPrevented || y == null || y());
    }, S), W = l ? R === A.length - 1 : !1, X = ho((te) => {
      te.key === "Escape" && (a == null || a(te), !te.defaultPrevented && y && (te.preventDefault(), y()));
    });
    return C.useEffect(() => {
      if (W)
        return S.addEventListener("keydown", X, { capture: !0 }), () => S.removeEventListener("keydown", X, { capture: !0 });
    }, [S, W, X]), C.useEffect(() => {
      if (l)
        return i && (v.layersWithOutsidePointerEventsDisabled.size === 0 && (_y = S.body.style.pointerEvents, S.body.style.pointerEvents = "none"), v.layersWithOutsidePointerEventsDisabled.add(l)), v.layers.add(l), Ty(), () => {
          i && (v.layersWithOutsidePointerEventsDisabled.delete(l), v.layersWithOutsidePointerEventsDisabled.size === 0 && (S.body.style.pointerEvents = _y));
        };
    }, [l, S, i, v]), C.useEffect(() => () => {
      l && (v.layers.delete(l), v.layersWithOutsidePointerEventsDisabled.delete(l), Ty());
    }, [l, v]), C.useEffect(() => {
      const te = () => w({});
      return document.addEventListener(Bc, te), () => document.removeEventListener(Bc, te);
    }, []), /* @__PURE__ */ k.jsx(
      yt.div,
      {
        ...g,
        ref: _,
        style: {
          pointerEvents: D ? j ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: ht(e.onFocusCapture, $.onFocusCapture),
        onBlurCapture: ht(e.onBlurCapture, $.onBlurCapture),
        onPointerDownCapture: ht(
          e.onPointerDownCapture,
          K.onPointerDownCapture
        )
      }
    );
  }
);
t0.displayName = uP;
var fP = "DismissableLayerBranch", pP = C.forwardRef((e, n) => {
  const i = C.useContext(Nd), o = C.useRef(null), a = st(n, o);
  return C.useEffect(() => {
    const c = o.current;
    if (c)
      return i.branches.add(c), () => {
        i.branches.delete(c);
      };
  }, [i.branches]), /* @__PURE__ */ k.jsx(yt.div, { ...e, ref: a });
});
pP.displayName = fP;
function hP() {
  const e = C.useContext(Nd), [n, i] = C.useState(null);
  return C.useEffect(() => {
    if (n)
      return e.dismissableSurfaces.add(n), () => {
        e.dismissableSurfaces.delete(n);
      };
  }, [n, e.dismissableSurfaces]), i;
}
var mP = () => !0;
function yP(e, n) {
  const {
    ownerDocument: i = globalThis == null ? void 0 : globalThis.document,
    deferPointerDownOutside: o = !1,
    isDeferredPointerDownOutsideRef: a,
    dismissableSurfaces: c,
    shouldHandlePointerDownOutside: d = mP
  } = n, f = ho(e), y = C.useRef(!1), g = C.useRef(!1), v = C.useRef(/* @__PURE__ */ new Map()), l = C.useRef(() => {
  });
  return C.useEffect(() => {
    function h() {
      g.current = !1, a.current = !1, v.current.clear();
    }
    function S() {
      return Array.from(v.current.values()).some(Boolean);
    }
    function w(R) {
      if (!g.current)
        return;
      const D = R.target;
      D instanceof Node && [...c].some((G) => G.contains(D)) || v.current.set(R.type, !0), R.type === "click" && window.setTimeout(() => {
        g.current && l.current();
      }, 0);
    }
    function _(R) {
      g.current && v.current.set(R.type, !1);
    }
    const A = (R) => {
      if (R.target && !y.current) {
        let D = function() {
          i.removeEventListener("click", l.current);
          const G = S();
          h(), G || n0(
            cP,
            f,
            j,
            { discrete: !0 }
          );
        };
        if (!d(R.target)) {
          i.removeEventListener("click", l.current), h(), y.current = !1;
          return;
        }
        const j = { originalEvent: R };
        g.current = !0, a.current = o && R.button === 0, v.current.clear(), !o || R.button !== 0 ? D() : (i.removeEventListener("click", l.current), l.current = D, i.addEventListener("click", l.current, { once: !0 }));
      } else
        i.removeEventListener("click", l.current), h();
      y.current = !1;
    }, T = [
      "pointerup",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "click"
    ];
    for (const R of T)
      i.addEventListener(R, w, !0), i.addEventListener(R, _);
    const M = window.setTimeout(() => {
      i.addEventListener("pointerdown", A);
    }, 0);
    return () => {
      window.clearTimeout(M), i.removeEventListener("pointerdown", A), i.removeEventListener("click", l.current);
      for (const R of T)
        i.removeEventListener(R, w, !0), i.removeEventListener(R, _);
    };
  }, [
    i,
    f,
    o,
    a,
    c,
    d
  ]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => y.current = !0
  };
}
function gP(e, n = globalThis == null ? void 0 : globalThis.document) {
  const i = ho(e), o = C.useRef(!1);
  return C.useEffect(() => {
    const a = (c) => {
      c.target && !o.current && n0(dP, i, { originalEvent: c }, {
        discrete: !1
      });
    };
    return n.addEventListener("focusin", a), () => n.removeEventListener("focusin", a);
  }, [n, i]), {
    onFocusCapture: () => o.current = !0,
    onBlurCapture: () => o.current = !1
  };
}
function Ty() {
  const e = new CustomEvent(Bc);
  document.dispatchEvent(e);
}
function n0(e, n, i, { discrete: o }) {
  const a = i.originalEvent.target, c = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: i });
  n && a.addEventListener(e, n, { once: !0 }), o ? lP(a, c) : a.dispatchEvent(c);
}
var Qu = "focusScope.autoFocusOnMount", Xu = "focusScope.autoFocusOnUnmount", ky = { bubbles: !1, cancelable: !0 }, vP = "FocusScope", r0 = C.forwardRef((e, n) => {
  const {
    loop: i = !1,
    trapped: o = !1,
    onMountAutoFocus: a,
    onUnmountAutoFocus: c,
    ...d
  } = e, [f, y] = C.useState(null), g = ho(a), v = ho(c), l = C.useRef(null), h = st(n, y), S = C.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  C.useEffect(() => {
    if (o) {
      let _ = function(R) {
        if (S.paused || !f) return;
        const D = R.target;
        f.contains(D) ? l.current = D : Fn(l.current, { select: !0 });
      }, A = function(R) {
        if (S.paused || !f) return;
        const D = R.relatedTarget;
        D !== null && (f.contains(D) || Fn(l.current, { select: !0 }));
      }, T = function(R) {
        if (document.activeElement === document.body)
          for (const j of R)
            j.removedNodes.length > 0 && Fn(f);
      };
      document.addEventListener("focusin", _), document.addEventListener("focusout", A);
      const M = new MutationObserver(T);
      return f && M.observe(f, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", _), document.removeEventListener("focusout", A), M.disconnect();
      };
    }
  }, [o, f, S.paused]), C.useEffect(() => {
    if (f) {
      Cy.add(S);
      const _ = document.activeElement;
      if (!f.contains(_)) {
        const T = new CustomEvent(Qu, ky);
        f.addEventListener(Qu, g), f.dispatchEvent(T), T.defaultPrevented || (SP(kP(i0(f)), { select: !0 }), document.activeElement === _ && Fn(f));
      }
      return () => {
        f.removeEventListener(Qu, g), setTimeout(() => {
          const T = new CustomEvent(Xu, ky);
          f.addEventListener(Xu, v), f.dispatchEvent(T), T.defaultPrevented || Fn(_ ?? document.body, { select: !0 }), f.removeEventListener(Xu, v), Cy.remove(S);
        }, 0);
      };
    }
  }, [f, g, v, S]);
  const w = C.useCallback(
    (_) => {
      if (!i && !o || S.paused) return;
      const A = _.key === "Tab" && !_.altKey && !_.ctrlKey && !_.metaKey, T = document.activeElement;
      if (A && T) {
        const M = _.currentTarget, [R, D] = wP(M);
        R && D ? !_.shiftKey && T === D ? (_.preventDefault(), i && Fn(R, { select: !0 })) : _.shiftKey && T === R && (_.preventDefault(), i && Fn(D, { select: !0 })) : T === M && _.preventDefault();
      }
    },
    [i, o, S.paused]
  );
  return /* @__PURE__ */ k.jsx(yt.div, { tabIndex: -1, ...d, ref: h, onKeyDown: w });
});
r0.displayName = vP;
function SP(e, { select: n = !1 } = {}) {
  const i = document.activeElement;
  for (const o of e)
    if (Fn(o, { select: n }), document.activeElement !== i) return;
}
function wP(e) {
  const n = i0(e), i = Ay(n, e), o = Ay(n.reverse(), e);
  return [i, o];
}
function i0(e) {
  const n = [], i = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (o) => {
      const a = o.tagName === "INPUT" && o.type === "hidden";
      return o.disabled || o.hidden || a ? NodeFilter.FILTER_SKIP : o.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; i.nextNode(); ) n.push(i.currentNode);
  return n;
}
function Ay(e, n) {
  const i = typeof n.checkVisibility == "function" && n.checkVisibility({ checkVisibilityCSS: !0 });
  for (const o of e)
    if (!(i ? !o.checkVisibility({ checkVisibilityCSS: !0 }) : xP(o, { upTo: n })))
      return o;
}
function xP(e, { upTo: n }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (n !== void 0 && e === n) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function _P(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function Fn(e, { select: n = !1 } = {}) {
  if (e && e.focus) {
    const i = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== i && _P(e) && n && e.select();
  }
}
var Cy = TP();
function TP() {
  let e = [];
  return {
    add(n) {
      const i = e[0];
      n !== i && (i == null || i.pause()), e = Py(e, n), e.unshift(n);
    },
    remove(n) {
      var i;
      e = Py(e, n), (i = e[0]) == null || i.resume();
    }
  };
}
function Py(e, n) {
  const i = [...e], o = i.indexOf(n);
  return o !== -1 && i.splice(o, 1), i;
}
function kP(e) {
  return e.filter((n) => n.tagName !== "A");
}
var AP = "Portal", o0 = C.forwardRef((e, n) => {
  var f;
  const { container: i, ...o } = e, [a, c] = C.useState(!1);
  ti(() => c(!0), []);
  const d = i || a && ((f = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : f.body);
  return d ? e0.createPortal(/* @__PURE__ */ k.jsx(yt.div, { ...o, ref: n }), d) : null;
});
o0.displayName = AP;
function CP(e, n) {
  return C.useReducer((i, o) => n[i][o] ?? i, e);
}
var Ma = (e) => {
  const { present: n, children: i } = e, o = PP(n), a = typeof i == "function" ? i({ present: o.isPresent }) : C.Children.only(i), c = EP(o.ref, MP(a));
  return typeof i == "function" || o.isPresent ? C.cloneElement(a, { ref: c }) : null;
};
Ma.displayName = "Presence";
function PP(e) {
  const [n, i] = C.useState(), o = C.useRef(null), a = C.useRef(e), c = C.useRef("none"), d = C.useRef(void 0), f = e ? "mounted" : "unmounted", [y, g] = CP(f, {
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
    y === "mounted" ? (c.current = d.current ?? Qi(o.current), d.current = void 0) : c.current = "none";
  }, [y]), ti(() => {
    const v = o.current, l = a.current;
    if (l !== e) {
      const S = c.current, w = Qi(v);
      e ? (d.current = w, g("MOUNT")) : w === "none" || (v == null ? void 0 : v.display) === "none" ? g("UNMOUNT") : g(l && S !== w ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
    }
  }, [e, g]), ti(() => {
    if (n) {
      let v;
      const l = n.ownerDocument.defaultView ?? window, h = (w) => {
        const A = Qi(o.current).includes(CSS.escape(w.animationName));
        if (w.target === n && A && (g("ANIMATION_END"), !a.current)) {
          const T = n.style.animationFillMode;
          n.style.animationFillMode = "forwards", v = l.setTimeout(() => {
            n.style.animationFillMode === "forwards" && (n.style.animationFillMode = T);
          });
        }
      }, S = (w) => {
        w.target === n && (c.current = Qi(o.current));
      };
      return n.addEventListener("animationstart", S), n.addEventListener("animationcancel", h), n.addEventListener("animationend", h), () => {
        l.clearTimeout(v), n.removeEventListener("animationstart", S), n.removeEventListener("animationcancel", h), n.removeEventListener("animationend", h);
      };
    } else
      g("ANIMATION_END");
  }, [n, g]), {
    isPresent: ["mounted", "unmountSuspended"].includes(y),
    ref: C.useCallback((v) => {
      if (v) {
        const l = getComputedStyle(v);
        o.current = l, d.current = Qi(l);
      } else
        o.current = null;
      i(v);
    }, [])
  };
}
function Ey(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function EP(...e) {
  const n = C.useRef(e);
  return n.current = e, C.useCallback((i) => {
    const o = n.current;
    let a = !1;
    const c = o.map((d) => {
      const f = Ey(d, i);
      return !a && typeof f == "function" && (a = !0), f;
    });
    if (a)
      return () => {
        for (let d = 0; d < c.length; d++) {
          const f = c[d];
          typeof f == "function" ? f() : Ey(o[d], null);
        }
      };
  }, []);
}
function Qi(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
function MP(e) {
  var o, a;
  let n = (o = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : o.get, i = n && "isReactWarning" in n && n.isReactWarning;
  return i ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, i = n && "isReactWarning" in n && n.isReactWarning, i ? e.props.ref : e.props.ref || e.ref);
}
var zs = 0, Qt = null;
function bP() {
  C.useEffect(() => {
    Qt || (Qt = { start: My(), end: My() });
    const { start: e, end: n } = Qt;
    return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== n && document.body.insertAdjacentElement("beforeend", n), zs++, () => {
      zs === 1 && (Qt == null || Qt.start.remove(), Qt == null || Qt.end.remove(), Qt = null), zs = Math.max(0, zs - 1);
    };
  }, []);
}
function My() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var qt = function() {
  return qt = Object.assign || function(n) {
    for (var i, o = 1, a = arguments.length; o < a; o++) {
      i = arguments[o];
      for (var c in i) Object.prototype.hasOwnProperty.call(i, c) && (n[c] = i[c]);
    }
    return n;
  }, qt.apply(this, arguments);
};
function s0(e, n) {
  var i = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && n.indexOf(o) < 0 && (i[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var a = 0, o = Object.getOwnPropertySymbols(e); a < o.length; a++)
      n.indexOf(o[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[a]) && (i[o[a]] = e[o[a]]);
  return i;
}
function RP(e, n, i) {
  if (i || arguments.length === 2) for (var o = 0, a = n.length, c; o < a; o++)
    (c || !(o in n)) && (c || (c = Array.prototype.slice.call(n, 0, o)), c[o] = n[o]);
  return e.concat(c || Array.prototype.slice.call(n));
}
var ea = "right-scroll-bar-position", ta = "width-before-scroll-bar", DP = "with-scroll-bars-hidden", NP = "--removed-body-scroll-bar-size";
function Zu(e, n) {
  return typeof e == "function" ? e(n) : e && (e.current = n), e;
}
function IP(e, n) {
  var i = C.useState(function() {
    return {
      // value
      value: e,
      // last callback
      callback: n,
      // "memoized" public interface
      facade: {
        get current() {
          return i.value;
        },
        set current(o) {
          var a = i.value;
          a !== o && (i.value = o, i.callback(o, a));
        }
      }
    };
  })[0];
  return i.callback = n, i.facade;
}
var FP = typeof window < "u" ? C.useLayoutEffect : C.useEffect, by = /* @__PURE__ */ new WeakMap();
function OP(e, n) {
  var i = IP(null, function(o) {
    return e.forEach(function(a) {
      return Zu(a, o);
    });
  });
  return FP(function() {
    var o = by.get(i);
    if (o) {
      var a = new Set(o), c = new Set(e), d = i.current;
      a.forEach(function(f) {
        c.has(f) || Zu(f, null);
      }), c.forEach(function(f) {
        a.has(f) || Zu(f, d);
      });
    }
    by.set(i, e);
  }, [e]), i;
}
function jP(e) {
  return e;
}
function LP(e, n) {
  n === void 0 && (n = jP);
  var i = [], o = !1, a = {
    read: function() {
      if (o)
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      return i.length ? i[i.length - 1] : e;
    },
    useMedium: function(c) {
      var d = n(c, o);
      return i.push(d), function() {
        i = i.filter(function(f) {
          return f !== d;
        });
      };
    },
    assignSyncMedium: function(c) {
      for (o = !0; i.length; ) {
        var d = i;
        i = [], d.forEach(c);
      }
      i = {
        push: function(f) {
          return c(f);
        },
        filter: function() {
          return i;
        }
      };
    },
    assignMedium: function(c) {
      o = !0;
      var d = [];
      if (i.length) {
        var f = i;
        i = [], f.forEach(c), d = i;
      }
      var y = function() {
        var v = d;
        d = [], v.forEach(c);
      }, g = function() {
        return Promise.resolve().then(y);
      };
      g(), i = {
        push: function(v) {
          d.push(v), g();
        },
        filter: function(v) {
          return d = d.filter(v), i;
        }
      };
    }
  };
  return a;
}
function VP(e) {
  e === void 0 && (e = {});
  var n = LP(null);
  return n.options = qt({ async: !0, ssr: !1 }, e), n;
}
var a0 = function(e) {
  var n = e.sideCar, i = s0(e, ["sideCar"]);
  if (!n)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = n.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return C.createElement(o, qt({}, i));
};
a0.isSideCarExport = !0;
function BP(e, n) {
  return e.useMedium(n), a0;
}
var l0 = VP(), Ju = function() {
}, ba = C.forwardRef(function(e, n) {
  var i = C.useRef(null), o = C.useState({
    onScrollCapture: Ju,
    onWheelCapture: Ju,
    onTouchMoveCapture: Ju
  }), a = o[0], c = o[1], d = e.forwardProps, f = e.children, y = e.className, g = e.removeScrollBar, v = e.enabled, l = e.shards, h = e.sideCar, S = e.noRelative, w = e.noIsolation, _ = e.inert, A = e.allowPinchZoom, T = e.as, M = T === void 0 ? "div" : T, R = e.gapMode, D = s0(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), j = h, G = OP([i, n]), K = qt(qt({}, D), a);
  return C.createElement(
    C.Fragment,
    null,
    v && C.createElement(j, { sideCar: l0, removeScrollBar: g, shards: l, noRelative: S, noIsolation: w, inert: _, setCallbacks: c, allowPinchZoom: !!A, lockRef: i, gapMode: R }),
    d ? C.cloneElement(C.Children.only(f), qt(qt({}, K), { ref: G })) : C.createElement(M, qt({}, K, { className: y, ref: G }), f)
  );
});
ba.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
ba.classNames = {
  fullWidth: ta,
  zeroRight: ea
};
var zP = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function UP() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var n = zP();
  return n && e.setAttribute("nonce", n), e;
}
function $P(e, n) {
  e.styleSheet ? e.styleSheet.cssText = n : e.appendChild(document.createTextNode(n));
}
function HP(e) {
  var n = document.head || document.getElementsByTagName("head")[0];
  n.appendChild(e);
}
var WP = function() {
  var e = 0, n = null;
  return {
    add: function(i) {
      e == 0 && (n = UP()) && ($P(n, i), HP(n)), e++;
    },
    remove: function() {
      e--, !e && n && (n.parentNode && n.parentNode.removeChild(n), n = null);
    }
  };
}, GP = function() {
  var e = WP();
  return function(n, i) {
    C.useEffect(function() {
      return e.add(n), function() {
        e.remove();
      };
    }, [n && i]);
  };
}, u0 = function() {
  var e = GP(), n = function(i) {
    var o = i.styles, a = i.dynamic;
    return e(o, a), null;
  };
  return n;
}, KP = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, qu = function(e) {
  return parseInt(e || "", 10) || 0;
}, YP = function(e) {
  var n = window.getComputedStyle(document.body), i = n[e === "padding" ? "paddingLeft" : "marginLeft"], o = n[e === "padding" ? "paddingTop" : "marginTop"], a = n[e === "padding" ? "paddingRight" : "marginRight"];
  return [qu(i), qu(o), qu(a)];
}, QP = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return KP;
  var n = YP(e), i = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: n[0],
    top: n[1],
    right: n[2],
    gap: Math.max(0, o - i + n[2] - n[0])
  };
}, XP = u0(), Zr = "data-scroll-locked", ZP = function(e, n, i, o) {
  var a = e.left, c = e.top, d = e.right, f = e.gap;
  return i === void 0 && (i = "margin"), `
  .`.concat(DP, ` {
   overflow: hidden `).concat(o, `;
   padding-right: `).concat(f, "px ").concat(o, `;
  }
  body[`).concat(Zr, `] {
    overflow: hidden `).concat(o, `;
    overscroll-behavior: contain;
    `).concat([
    n && "position: relative ".concat(o, ";"),
    i === "margin" && `
    padding-left: `.concat(a, `px;
    padding-top: `).concat(c, `px;
    padding-right: `).concat(d, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(f, "px ").concat(o, `;
    `),
    i === "padding" && "padding-right: ".concat(f, "px ").concat(o, ";")
  ].filter(Boolean).join(""), `
  }
  
  .`).concat(ea, ` {
    right: `).concat(f, "px ").concat(o, `;
  }
  
  .`).concat(ta, ` {
    margin-right: `).concat(f, "px ").concat(o, `;
  }
  
  .`).concat(ea, " .").concat(ea, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(ta, " .").concat(ta, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(Zr, `] {
    `).concat(NP, ": ").concat(f, `px;
  }
`);
}, Ry = function() {
  var e = parseInt(document.body.getAttribute(Zr) || "0", 10);
  return isFinite(e) ? e : 0;
}, JP = function() {
  C.useEffect(function() {
    return document.body.setAttribute(Zr, (Ry() + 1).toString()), function() {
      var e = Ry() - 1;
      e <= 0 ? document.body.removeAttribute(Zr) : document.body.setAttribute(Zr, e.toString());
    };
  }, []);
}, qP = function(e) {
  var n = e.noRelative, i = e.noImportant, o = e.gapMode, a = o === void 0 ? "margin" : o;
  JP();
  var c = C.useMemo(function() {
    return QP(a);
  }, [a]);
  return C.createElement(XP, { styles: ZP(c, !n, a, i ? "" : "!important") });
}, zc = !1;
if (typeof window < "u")
  try {
    var Us = Object.defineProperty({}, "passive", {
      get: function() {
        return zc = !0, !0;
      }
    });
    window.addEventListener("test", Us, Us), window.removeEventListener("test", Us, Us);
  } catch {
    zc = !1;
  }
var Ur = zc ? { passive: !1 } : !1, eE = function(e) {
  return e.tagName === "TEXTAREA";
}, c0 = function(e, n) {
  if (!(e instanceof Element))
    return !1;
  var i = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    i[n] !== "hidden" && // contains scroll inside self
    !(i.overflowY === i.overflowX && !eE(e) && i[n] === "visible")
  );
}, tE = function(e) {
  return c0(e, "overflowY");
}, nE = function(e) {
  return c0(e, "overflowX");
}, Dy = function(e, n) {
  var i = n.ownerDocument, o = n;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var a = d0(e, o);
    if (a) {
      var c = f0(e, o), d = c[1], f = c[2];
      if (d > f)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== i.body);
  return !1;
}, rE = function(e) {
  var n = e.scrollTop, i = e.scrollHeight, o = e.clientHeight;
  return [
    n,
    i,
    o
  ];
}, iE = function(e) {
  var n = e.scrollLeft, i = e.scrollWidth, o = e.clientWidth;
  return [
    n,
    i,
    o
  ];
}, d0 = function(e, n) {
  return e === "v" ? tE(n) : nE(n);
}, f0 = function(e, n) {
  return e === "v" ? rE(n) : iE(n);
}, oE = function(e, n) {
  return e === "h" && n === "rtl" ? -1 : 1;
}, sE = function(e, n, i, o, a) {
  var c = oE(e, window.getComputedStyle(n).direction), d = c * o, f = i.target, y = n.contains(f), g = !1, v = d > 0, l = 0, h = 0;
  do {
    if (!f)
      break;
    var S = f0(e, f), w = S[0], _ = S[1], A = S[2], T = _ - A - c * w;
    (w || T) && d0(e, f) && (l += T, h += w);
    var M = f.parentNode;
    f = M && M.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? M.host : M;
  } while (
    // portaled content
    !y && f !== document.body || // self content
    y && (n.contains(f) || n === f)
  );
  return (v && Math.abs(l) < 1 || !v && Math.abs(h) < 1) && (g = !0), g;
}, $s = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Ny = function(e) {
  return [e.deltaX, e.deltaY];
}, Iy = function(e) {
  return e && "current" in e ? e.current : e;
}, aE = function(e, n) {
  return e[0] === n[0] && e[1] === n[1];
}, lE = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, uE = 0, $r = [];
function cE(e) {
  var n = C.useRef([]), i = C.useRef([0, 0]), o = C.useRef(), a = C.useState(uE++)[0], c = C.useState(u0)[0], d = C.useRef(e);
  C.useEffect(function() {
    d.current = e;
  }, [e]), C.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(a));
      var _ = RP([e.lockRef.current], (e.shards || []).map(Iy), !0).filter(Boolean);
      return _.forEach(function(A) {
        return A.classList.add("allow-interactivity-".concat(a));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(a)), _.forEach(function(A) {
          return A.classList.remove("allow-interactivity-".concat(a));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var f = C.useCallback(function(_, A) {
    if ("touches" in _ && _.touches.length === 2 || _.type === "wheel" && _.ctrlKey)
      return !d.current.allowPinchZoom;
    var T = $s(_), M = i.current, R = "deltaX" in _ ? _.deltaX : M[0] - T[0], D = "deltaY" in _ ? _.deltaY : M[1] - T[1], j, G = _.target, K = Math.abs(R) > Math.abs(D) ? "h" : "v";
    if ("touches" in _ && K === "h" && G.type === "range")
      return !1;
    var $ = window.getSelection(), W = $ && $.anchorNode, X = W ? W === G || W.contains(G) : !1;
    if (X)
      return !1;
    var te = Dy(K, G);
    if (!te)
      return !0;
    if (te ? j = K : (j = K === "v" ? "h" : "v", te = Dy(K, G)), !te)
      return !1;
    if (!o.current && "changedTouches" in _ && (R || D) && (o.current = j), !j)
      return !0;
    var de = o.current || j;
    return sE(de, A, _, de === "h" ? R : D);
  }, []), y = C.useCallback(function(_) {
    var A = _;
    if (!(!$r.length || $r[$r.length - 1] !== c)) {
      var T = "deltaY" in A ? Ny(A) : $s(A), M = n.current.filter(function(j) {
        return j.name === A.type && (j.target === A.target || A.target === j.shadowParent) && aE(j.delta, T);
      })[0];
      if (M && M.should) {
        A.cancelable && A.preventDefault();
        return;
      }
      if (!M) {
        var R = (d.current.shards || []).map(Iy).filter(Boolean).filter(function(j) {
          return j.contains(A.target);
        }), D = R.length > 0 ? f(A, R[0]) : !d.current.noIsolation;
        D && A.cancelable && A.preventDefault();
      }
    }
  }, []), g = C.useCallback(function(_, A, T, M) {
    var R = { name: _, delta: A, target: T, should: M, shadowParent: dE(T) };
    n.current.push(R), setTimeout(function() {
      n.current = n.current.filter(function(D) {
        return D !== R;
      });
    }, 1);
  }, []), v = C.useCallback(function(_) {
    i.current = $s(_), o.current = void 0;
  }, []), l = C.useCallback(function(_) {
    g(_.type, Ny(_), _.target, f(_, e.lockRef.current));
  }, []), h = C.useCallback(function(_) {
    g(_.type, $s(_), _.target, f(_, e.lockRef.current));
  }, []);
  C.useEffect(function() {
    return $r.push(c), e.setCallbacks({
      onScrollCapture: l,
      onWheelCapture: l,
      onTouchMoveCapture: h
    }), document.addEventListener("wheel", y, Ur), document.addEventListener("touchmove", y, Ur), document.addEventListener("touchstart", v, Ur), function() {
      $r = $r.filter(function(_) {
        return _ !== c;
      }), document.removeEventListener("wheel", y, Ur), document.removeEventListener("touchmove", y, Ur), document.removeEventListener("touchstart", v, Ur);
    };
  }, []);
  var S = e.removeScrollBar, w = e.inert;
  return C.createElement(
    C.Fragment,
    null,
    w ? C.createElement(c, { styles: lE(a) }) : null,
    S ? C.createElement(qP, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function dE(e) {
  for (var n = null; e !== null; )
    e instanceof ShadowRoot && (n = e.host, e = e.host), e = e.parentNode;
  return n;
}
const fE = BP(l0, cE);
var p0 = C.forwardRef(function(e, n) {
  return C.createElement(ba, qt({}, e, { ref: n, sideCar: fE }));
});
p0.classNames = ba.classNames;
var pE = function(e) {
  if (typeof document > "u")
    return null;
  var n = Array.isArray(e) ? e[0] : e;
  return n.ownerDocument.body;
}, Hr = /* @__PURE__ */ new WeakMap(), Hs = /* @__PURE__ */ new WeakMap(), Ws = {}, ec = 0, h0 = function(e) {
  return e && (e.host || h0(e.parentNode));
}, hE = function(e, n) {
  return n.map(function(i) {
    if (e.contains(i))
      return i;
    var o = h0(i);
    return o && e.contains(o) ? o : (console.error("aria-hidden", i, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(i) {
    return !!i;
  });
}, mE = function(e, n, i, o) {
  var a = hE(n, Array.isArray(e) ? e : [e]);
  Ws[i] || (Ws[i] = /* @__PURE__ */ new WeakMap());
  var c = Ws[i], d = [], f = /* @__PURE__ */ new Set(), y = new Set(a), g = function(l) {
    !l || f.has(l) || (f.add(l), g(l.parentNode));
  };
  a.forEach(g);
  var v = function(l) {
    !l || y.has(l) || Array.prototype.forEach.call(l.children, function(h) {
      if (f.has(h))
        v(h);
      else
        try {
          var S = h.getAttribute(o), w = S !== null && S !== "false", _ = (Hr.get(h) || 0) + 1, A = (c.get(h) || 0) + 1;
          Hr.set(h, _), c.set(h, A), d.push(h), _ === 1 && w && Hs.set(h, !0), A === 1 && h.setAttribute(i, "true"), w || h.setAttribute(o, "true");
        } catch (T) {
          console.error("aria-hidden: cannot operate on ", h, T);
        }
    });
  };
  return v(n), f.clear(), ec++, function() {
    d.forEach(function(l) {
      var h = Hr.get(l) - 1, S = c.get(l) - 1;
      Hr.set(l, h), c.set(l, S), h || (Hs.has(l) || l.removeAttribute(o), Hs.delete(l)), S || l.removeAttribute(i);
    }), ec--, ec || (Hr = /* @__PURE__ */ new WeakMap(), Hr = /* @__PURE__ */ new WeakMap(), Hs = /* @__PURE__ */ new WeakMap(), Ws = {});
  };
}, yE = function(e, n, i) {
  i === void 0 && (i = "data-aria-hidden");
  var o = Array.from(Array.isArray(e) ? e : [e]), a = pE(e);
  return a ? (o.push.apply(o, Array.from(a.querySelectorAll("[aria-live], script"))), mE(o, a, i, "aria-hidden")) : function() {
    return null;
  };
}, Ra = "Dialog", [m0] = Dd(Ra), [gE, $t] = m0(Ra), y0 = (e) => {
  const {
    __scopeDialog: n,
    children: i,
    open: o,
    defaultOpen: a,
    onOpenChange: c,
    modal: d = !0
  } = e, f = C.useRef(null), y = C.useRef(null), [g, v] = qv({
    prop: o,
    defaultProp: a ?? !1,
    onChange: c,
    caller: Ra
  });
  return /* @__PURE__ */ k.jsx(
    gE,
    {
      scope: n,
      triggerRef: f,
      contentRef: y,
      contentId: Yu(),
      titleId: Yu(),
      descriptionId: Yu(),
      open: g,
      onOpenChange: v,
      onOpenToggle: C.useCallback(() => v((l) => !l), [v]),
      modal: d,
      children: i
    }
  );
};
y0.displayName = Ra;
var g0 = "DialogTrigger", vE = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(g0, i), c = st(n, a.triggerRef);
    return /* @__PURE__ */ k.jsx(
      yt.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": a.open,
        "aria-controls": a.open ? a.contentId : void 0,
        "data-state": Fd(a.open),
        ...o,
        ref: c,
        onClick: ht(e.onClick, a.onOpenToggle)
      }
    );
  }
);
vE.displayName = g0;
var Id = "DialogPortal", [SE, v0] = m0(Id, {
  forceMount: void 0
}), S0 = (e) => {
  const { __scopeDialog: n, forceMount: i, children: o, container: a } = e, c = $t(Id, n);
  return /* @__PURE__ */ k.jsx(SE, { scope: n, forceMount: i, children: C.Children.map(o, (d) => /* @__PURE__ */ k.jsx(Ma, { present: i || c.open, children: /* @__PURE__ */ k.jsx(o0, { asChild: !0, container: a, children: d }) })) });
};
S0.displayName = Id;
var xa = "DialogOverlay", w0 = C.forwardRef(
  (e, n) => {
    const i = v0(xa, e.__scopeDialog), { forceMount: o = i.forceMount, ...a } = e, c = $t(xa, e.__scopeDialog);
    return c.modal ? /* @__PURE__ */ k.jsx(Ma, { present: o || c.open, children: /* @__PURE__ */ k.jsx(xE, { ...a, ref: n }) }) : null;
  }
);
w0.displayName = xa;
var wE = /* @__PURE__ */ wa("DialogOverlay.RemoveScroll"), xE = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(xa, i), c = hP(), d = st(n, c);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ k.jsx(p0, { as: wE, allowPinchZoom: !0, shards: [a.contentRef], children: /* @__PURE__ */ k.jsx(
        yt.div,
        {
          "data-state": Fd(a.open),
          ...o,
          ref: d,
          style: { pointerEvents: "auto", ...o.style }
        }
      ) })
    );
  }
), ni = "DialogContent", x0 = C.forwardRef(
  (e, n) => {
    const i = v0(ni, e.__scopeDialog), { forceMount: o = i.forceMount, ...a } = e, c = $t(ni, e.__scopeDialog);
    return /* @__PURE__ */ k.jsx(Ma, { present: o || c.open, children: c.modal ? /* @__PURE__ */ k.jsx(_E, { ...a, ref: n }) : /* @__PURE__ */ k.jsx(TE, { ...a, ref: n }) });
  }
);
x0.displayName = ni;
var _E = C.forwardRef(
  (e, n) => {
    const i = $t(ni, e.__scopeDialog), o = C.useRef(null), a = st(n, i.contentRef, o);
    return C.useEffect(() => {
      const c = o.current;
      if (c) return yE(c);
    }, []), /* @__PURE__ */ k.jsx(
      _0,
      {
        ...e,
        ref: a,
        trapFocus: i.open,
        disableOutsidePointerEvents: i.open,
        onCloseAutoFocus: ht(e.onCloseAutoFocus, (c) => {
          var d;
          c.preventDefault(), (d = i.triggerRef.current) == null || d.focus();
        }),
        onPointerDownOutside: ht(e.onPointerDownOutside, (c) => {
          const d = c.detail.originalEvent, f = d.button === 0 && d.ctrlKey === !0;
          (d.button === 2 || f) && c.preventDefault();
        }),
        onFocusOutside: ht(
          e.onFocusOutside,
          (c) => c.preventDefault()
        )
      }
    );
  }
), TE = C.forwardRef(
  (e, n) => {
    const i = $t(ni, e.__scopeDialog), o = C.useRef(!1), a = C.useRef(!1);
    return /* @__PURE__ */ k.jsx(
      _0,
      {
        ...e,
        ref: n,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (c) => {
          var d, f;
          (d = e.onCloseAutoFocus) == null || d.call(e, c), c.defaultPrevented || (o.current || (f = i.triggerRef.current) == null || f.focus(), c.preventDefault()), o.current = !1, a.current = !1;
        },
        onInteractOutside: (c) => {
          var y, g;
          (y = e.onInteractOutside) == null || y.call(e, c), c.defaultPrevented || (o.current = !0, c.detail.originalEvent.type === "pointerdown" && (a.current = !0));
          const d = c.target;
          ((g = i.triggerRef.current) == null ? void 0 : g.contains(d)) && c.preventDefault(), c.detail.originalEvent.type === "focusin" && a.current && c.preventDefault();
        }
      }
    );
  }
), _0 = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, trapFocus: o, onOpenAutoFocus: a, onCloseAutoFocus: c, ...d } = e, f = $t(ni, i);
    return bP(), /* @__PURE__ */ k.jsx(k.Fragment, { children: /* @__PURE__ */ k.jsx(
      r0,
      {
        asChild: !0,
        loop: !0,
        trapped: o,
        onMountAutoFocus: a,
        onUnmountAutoFocus: c,
        children: /* @__PURE__ */ k.jsx(
          t0,
          {
            role: "dialog",
            id: f.contentId,
            "aria-describedby": f.descriptionId,
            "aria-labelledby": f.titleId,
            "data-state": Fd(f.open),
            ...d,
            ref: n,
            deferPointerDownOutside: !0,
            onDismiss: () => f.onOpenChange(!1)
          }
        )
      }
    ) });
  }
), T0 = "DialogTitle", k0 = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(T0, i);
    return /* @__PURE__ */ k.jsx(yt.h2, { id: a.titleId, ...o, ref: n });
  }
);
k0.displayName = T0;
var A0 = "DialogDescription", C0 = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(A0, i);
    return /* @__PURE__ */ k.jsx(yt.p, { id: a.descriptionId, ...o, ref: n });
  }
);
C0.displayName = A0;
var P0 = "DialogClose", kE = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(P0, i);
    return /* @__PURE__ */ k.jsx(
      yt.button,
      {
        type: "button",
        ...o,
        ref: n,
        onClick: ht(e.onClick, () => a.onOpenChange(!1))
      }
    );
  }
);
kE.displayName = P0;
function Fd(e) {
  return e ? "open" : "closed";
}
function AE() {
  const e = Z((a) => a.summaryRecord), n = Z((a) => a.closeSummary), i = Z((a) => a.startTimer), o = Un(e == null ? void 0 : e.selectedScene);
  return /* @__PURE__ */ k.jsx(y0, { open: !!e, onOpenChange: (a) => !a && n(), children: /* @__PURE__ */ k.jsx(Ca, { children: e ? /* @__PURE__ */ k.jsxs(S0, { forceMount: !0, children: [
    /* @__PURE__ */ k.jsx(w0, { asChild: !0, children: /* @__PURE__ */ k.jsx(
      hr.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ k.jsx(x0, { asChild: !0, children: /* @__PURE__ */ k.jsxs(
      hr.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ k.jsx(k0, { children: "Focus block complete" }),
          /* @__PURE__ */ k.jsx(C0, { className: "sr-only", children: "Summary of the completed focus block." }),
          /* @__PURE__ */ k.jsx("p", { children: "You protected a focused block in your quiet study room." }),
          /* @__PURE__ */ k.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ k.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ k.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ k.jsx("strong", { children: Pd(e.totalFocusTime) })
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
              /* @__PURE__ */ k.jsx("strong", { children: o.name })
            ] }),
            /* @__PURE__ */ k.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ k.jsx("span", { children: "Room state" }),
              /* @__PURE__ */ k.jsx("strong", { children: "Saved" })
            ] })
          ] }),
          e.persisted === !1 ? /* @__PURE__ */ k.jsx("p", { children: "This session is visible for now, but could not be saved to this device history." }) : null,
          /* @__PURE__ */ k.jsxs("div", { className: "focus-button-row", children: [
            /* @__PURE__ */ k.jsx(ke, { variant: "primary", onClick: () => {
              n(), i();
            }, children: "Continue studying" }),
            /* @__PURE__ */ k.jsx(ke, { onClick: n, children: "Done" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function CE({ scene: e, active: n, onSelect: i }) {
  return /* @__PURE__ */ k.jsxs(
    hr.button,
    {
      className: `scene-card ${n ? "active" : ""}`.trim(),
      type: "button",
      "aria-pressed": n,
      "aria-label": `${e.name}: ${e.description}`,
      onClick: () => i(e.id),
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
function PE() {
  const e = Z((i) => i.selectedScene), n = Z((i) => i.selectScene);
  return /* @__PURE__ */ k.jsx("div", { className: "scene-selector", "aria-label": "Study scenes", children: mr.map((i) => /* @__PURE__ */ k.jsx(CE, { scene: i, active: i.id === e, onSelect: n }, i.id)) });
}
function E0(e, [n, i]) {
  return Math.min(i, Math.max(n, e));
}
var EE = C.createContext(void 0);
function ME(e) {
  const n = C.useContext(EE);
  return e || n || "ltr";
}
function bE(e) {
  const n = C.useRef({ value: e, previous: e });
  return C.useMemo(() => (n.current.value !== e && (n.current.previous = n.current.value, n.current.value = e), n.current.previous), [e]);
}
function RE(e) {
  const [n, i] = C.useState(void 0);
  return ti(() => {
    if (e) {
      i({ width: e.offsetWidth, height: e.offsetHeight });
      const o = new ResizeObserver((a) => {
        if (!Array.isArray(a) || !a.length)
          return;
        const c = a[0];
        let d, f;
        if ("borderBoxSize" in c) {
          const y = c.borderBoxSize, g = Array.isArray(y) ? y[0] : y;
          d = g.inlineSize, f = g.blockSize;
        } else
          d = e.offsetWidth, f = e.offsetHeight;
        i({ width: d, height: f });
      });
      return o.observe(e, { box: "border-box" }), () => o.unobserve(e);
    } else
      i(void 0);
  }, [e]), n;
}
function DE(e) {
  const n = e + "CollectionProvider", [i, o] = Dd(n), [a, c] = i(
    n,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), d = (_) => {
    const { scope: A, children: T } = _, M = C.useRef(null), R = C.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ k.jsx(a, { scope: A, itemMap: R, collectionRef: M, children: T });
  };
  d.displayName = n;
  const f = e + "CollectionSlot", y = /* @__PURE__ */ wa(f), g = C.forwardRef(
    (_, A) => {
      const { scope: T, children: M } = _, R = c(f, T), D = st(A, R.collectionRef);
      return /* @__PURE__ */ k.jsx(y, { ref: D, children: M });
    }
  );
  g.displayName = f;
  const v = e + "CollectionItemSlot", l = "data-radix-collection-item", h = /* @__PURE__ */ wa(v), S = C.forwardRef(
    (_, A) => {
      const { scope: T, children: M, ...R } = _, D = C.useRef(null), j = st(A, D), G = c(v, T);
      return C.useEffect(() => (G.itemMap.set(D, { ref: D, ...R }), () => void G.itemMap.delete(D))), /* @__PURE__ */ k.jsx(h, { [l]: "", ref: j, children: M });
    }
  );
  S.displayName = v;
  function w(_) {
    const A = c(e + "CollectionConsumer", _);
    return C.useCallback(() => {
      const M = A.collectionRef.current;
      if (!M) return [];
      const R = Array.from(M.querySelectorAll(`[${l}]`));
      return Array.from(A.itemMap.values()).sort(
        (G, K) => R.indexOf(G.ref.current) - R.indexOf(K.ref.current)
      );
    }, [A.collectionRef, A.itemMap]);
  }
  return [
    { Provider: d, Slot: g, ItemSlot: S },
    w,
    o
  ];
}
var M0 = ["PageUp", "PageDown"], b0 = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], R0 = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, si = "Slider", [Uc, NE, IE] = DE(si), [Od] = Dd(si, [
  IE
]), [FE, xo] = Od(si), D0 = C.forwardRef(
  (e, n) => {
    const {
      name: i,
      min: o = 0,
      max: a = 100,
      step: c = 1,
      orientation: d = "horizontal",
      disabled: f = !1,
      minStepsBetweenThumbs: y = 0,
      defaultValue: g = [o],
      value: v,
      onValueChange: l = () => {
      },
      onValueCommit: h = () => {
      },
      inverted: S = !1,
      form: w,
      ..._
    } = e, A = C.useRef(/* @__PURE__ */ new Set()), T = C.useRef(0), M = C.useRef(!1), D = d === "horizontal" ? OE : jE, [j, G] = C.useState(null), K = st(n, G), [$ = [], W] = qv({
      prop: v,
      defaultProp: g,
      onChange: (ce) => {
        var z;
        (z = [...A.current][T.current]) == null || z.focus({
          preventScroll: !0,
          focusVisible: M.current
        }), M.current = !1, l(ce);
      }
    }), X = C.useRef($), te = C.useRef($);
    C.useEffect(() => {
      const ce = w ? j == null ? void 0 : j.ownerDocument.getElementById(w) : j == null ? void 0 : j.closest("form");
      if (ce instanceof HTMLFormElement) {
        const me = () => W(te.current);
        return ce.addEventListener("reset", me), () => ce.removeEventListener("reset", me);
      }
    }, [j, w, W]);
    function de(ce) {
      const me = zE($, ce);
      we(ce, me);
    }
    function he(ce) {
      we(ce, T.current);
    }
    function Q() {
      const ce = X.current[T.current];
      $[T.current] !== ce && h($);
    }
    function we(ce, me, { commit: z } = { commit: !1 }) {
      const ee = Y0(c), Y = ra(Math.round((ce - o) / c) * c + o, ee), N = E0(Y, [o, a]);
      W((L = []) => {
        const le = VE(L, N, me);
        if (HE(le, y * c)) {
          T.current = le.indexOf(N);
          const fe = String(le) !== String(L);
          return fe && z && h(le), fe ? le : L;
        } else
          return L;
      });
    }
    return /* @__PURE__ */ k.jsx(
      FE,
      {
        scope: e.__scopeSlider,
        name: i,
        disabled: f,
        min: o,
        max: a,
        valueIndexToChangeRef: T,
        thumbs: A.current,
        values: $,
        orientation: d,
        form: w,
        children: /* @__PURE__ */ k.jsx(Uc.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ k.jsx(Uc.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ k.jsx(
          D,
          {
            "aria-disabled": f,
            "data-disabled": f ? "" : void 0,
            ..._,
            ref: K,
            onPointerDown: ht(_.onPointerDown, () => {
              f || (X.current = $, M.current = !1);
            }),
            min: o,
            max: a,
            inverted: S,
            onSlideStart: f ? void 0 : de,
            onSlideMove: f ? void 0 : he,
            onSlideEnd: f ? void 0 : Q,
            onHomeKeyDown: () => {
              f || (M.current = !0, we(o, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              f || (M.current = !0, we(a, $.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: ce, direction: me }) => {
              if (!f) {
                M.current = !0;
                const Y = M0.includes(ce.key) || ce.shiftKey && b0.includes(ce.key) ? 10 : 1, N = T.current, L = $[N], le = WE(L, {
                  min: o,
                  step: c,
                  direction: me,
                  multiplier: Y
                });
                we(le, N, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
D0.displayName = si;
var [N0, I0] = Od(si, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), OE = C.forwardRef(
  (e, n) => {
    const {
      min: i,
      max: o,
      dir: a,
      inverted: c,
      onSlideStart: d,
      onSlideMove: f,
      onSlideEnd: y,
      onStepKeyDown: g,
      ...v
    } = e, [l, h] = C.useState(null), S = st(n, h), w = C.useRef(void 0), _ = ME(a), A = _ === "ltr", T = A && !c || !A && c;
    function M(R) {
      const D = w.current || l.getBoundingClientRect(), j = [0, D.width], K = jd(j, T ? [i, o] : [o, i]);
      return w.current = D, K(R - D.left);
    }
    return /* @__PURE__ */ k.jsx(
      N0,
      {
        scope: e.__scopeSlider,
        startEdge: T ? "left" : "right",
        endEdge: T ? "right" : "left",
        direction: T ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ k.jsx(
          F0,
          {
            dir: _,
            "data-orientation": "horizontal",
            ...v,
            ref: S,
            style: {
              ...v.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (R) => {
              const D = M(R.clientX);
              d == null || d(D);
            },
            onSlideMove: (R) => {
              const D = M(R.clientX);
              f == null || f(D);
            },
            onSlideEnd: () => {
              w.current = void 0, y == null || y();
            },
            onStepKeyDown: (R) => {
              const j = R0[T ? "from-left" : "from-right"].includes(R.key);
              g == null || g({ event: R, direction: j ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), jE = C.forwardRef(
  (e, n) => {
    const {
      min: i,
      max: o,
      inverted: a,
      onSlideStart: c,
      onSlideMove: d,
      onSlideEnd: f,
      onStepKeyDown: y,
      ...g
    } = e, v = C.useRef(null), l = st(n, v), h = C.useRef(void 0), S = !a;
    function w(_) {
      const A = h.current || v.current.getBoundingClientRect(), T = [0, A.height], R = jd(T, S ? [o, i] : [i, o]);
      return h.current = A, R(_ - A.top);
    }
    return /* @__PURE__ */ k.jsx(
      N0,
      {
        scope: e.__scopeSlider,
        startEdge: S ? "bottom" : "top",
        endEdge: S ? "top" : "bottom",
        size: "height",
        direction: S ? 1 : -1,
        children: /* @__PURE__ */ k.jsx(
          F0,
          {
            "data-orientation": "vertical",
            ...g,
            ref: l,
            style: {
              ...g.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (_) => {
              const A = w(_.clientY);
              c == null || c(A);
            },
            onSlideMove: (_) => {
              const A = w(_.clientY);
              d == null || d(A);
            },
            onSlideEnd: () => {
              h.current = void 0, f == null || f();
            },
            onStepKeyDown: (_) => {
              const T = R0[S ? "from-bottom" : "from-top"].includes(_.key);
              y == null || y({ event: _, direction: T ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), F0 = C.forwardRef(
  (e, n) => {
    const {
      __scopeSlider: i,
      onSlideStart: o,
      onSlideMove: a,
      onSlideEnd: c,
      onHomeKeyDown: d,
      onEndKeyDown: f,
      onStepKeyDown: y,
      ...g
    } = e, v = xo(si, i);
    return /* @__PURE__ */ k.jsx(
      yt.span,
      {
        ...g,
        ref: n,
        onKeyDown: ht(e.onKeyDown, (l) => {
          l.key === "Home" ? (d(l), l.preventDefault()) : l.key === "End" ? (f(l), l.preventDefault()) : M0.concat(b0).includes(l.key) && (y(l), l.preventDefault());
        }),
        onPointerDown: ht(e.onPointerDown, (l) => {
          const h = l.target;
          h.setPointerCapture(l.pointerId), l.preventDefault(), v.thumbs.has(h) ? h.focus({ preventScroll: !0, focusVisible: !1 }) : o(l);
        }),
        onPointerMove: ht(e.onPointerMove, (l) => {
          l.target.hasPointerCapture(l.pointerId) && a(l);
        }),
        onPointerUp: ht(e.onPointerUp, (l) => {
          const h = l.target;
          h.hasPointerCapture(l.pointerId) && (h.releasePointerCapture(l.pointerId), c(l));
        })
      }
    );
  }
), O0 = "SliderTrack", j0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: i, ...o } = e, a = xo(O0, i);
    return /* @__PURE__ */ k.jsx(
      yt.span,
      {
        "data-disabled": a.disabled ? "" : void 0,
        "data-orientation": a.orientation,
        ...o,
        ref: n
      }
    );
  }
);
j0.displayName = O0;
var $c = "SliderRange", L0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: i, ...o } = e, a = xo($c, i), c = I0($c, i), d = C.useRef(null), f = st(n, d), y = a.values.length, g = a.values.map(
      (h) => K0(h, a.min, a.max)
    ), v = y > 1 ? Math.min(...g) : 0, l = 100 - Math.max(...g);
    return /* @__PURE__ */ k.jsx(
      yt.span,
      {
        "data-orientation": a.orientation,
        "data-disabled": a.disabled ? "" : void 0,
        ...o,
        ref: f,
        style: {
          ...e.style,
          [c.startEdge]: v + "%",
          [c.endEdge]: l + "%"
        }
      }
    );
  }
);
L0.displayName = $c;
var V0 = "SliderThumb", [LE, B0] = Od(V0), z0 = "SliderThumbProvider";
function U0(e) {
  const {
    __scopeSlider: n,
    name: i,
    children: o,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: a
  } = e, c = xo(z0, n), d = NE(n), [f, y] = C.useState(null), g = C.useMemo(
    () => f ? d().findIndex((A) => A.ref.current === f) : -1,
    [d, f]
  ), v = RE(f), l = f ? !!c.form || !!f.closest("form") : !0, h = c.values[g], S = i ?? (c.name ? c.name + (c.values.length > 1 ? "[]" : "") : void 0), w = h === void 0 ? 0 : K0(h, c.min, c.max);
  C.useEffect(() => {
    if (f)
      return c.thumbs.add(f), () => {
        c.thumbs.delete(f);
      };
  }, [f, c.thumbs]);
  const _ = {
    value: h,
    name: S,
    form: c.form,
    isFormControl: l,
    index: g,
    thumb: f,
    onThumbChange: y,
    percent: w,
    size: v
  };
  return /* @__PURE__ */ k.jsx(LE, { scope: n, ..._, children: GE(a) ? a(_) : o });
}
U0.displayName = z0;
var na = "SliderThumbTrigger", $0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: i, ...o } = e, a = xo(na, i), c = I0(na, i), { index: d, value: f, percent: y, size: g, onThumbChange: v } = B0(
      na,
      i
    ), l = st(n, v), h = BE(d, a.values.length), S = g == null ? void 0 : g[c.size], w = S ? UE(S, y, c.direction) : 0;
    return /* @__PURE__ */ k.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [c.startEdge]: `calc(${y}% + ${w}px)`
        },
        children: /* @__PURE__ */ k.jsx(Uc.ItemSlot, { scope: i, children: /* @__PURE__ */ k.jsx(
          yt.span,
          {
            role: "slider",
            "aria-label": e["aria-label"] || h,
            "aria-valuemin": a.min,
            "aria-valuenow": f,
            "aria-valuemax": a.max,
            "aria-orientation": a.orientation,
            "data-orientation": a.orientation,
            "data-disabled": a.disabled ? "" : void 0,
            tabIndex: a.disabled ? void 0 : 0,
            ...o,
            ref: l,
            style: f === void 0 ? { display: "none" } : e.style,
            onFocus: ht(e.onFocus, () => {
              a.valueIndexToChangeRef.current = d;
            })
          }
        ) })
      }
    );
  }
);
$0.displayName = na;
var H0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: i, name: o, ...a } = e;
    return /* @__PURE__ */ k.jsx(
      U0,
      {
        __scopeSlider: i,
        name: o,
        internal_do_not_use_render: ({ index: c, isFormControl: d }) => /* @__PURE__ */ k.jsxs(k.Fragment, { children: [
          /* @__PURE__ */ k.jsx(
            $0,
            {
              ...a,
              ref: n,
              __scopeSlider: i
            }
          ),
          d ? /* @__PURE__ */ k.jsx(
            G0,
            {
              __scopeSlider: i
            },
            c
          ) : null
        ] })
      }
    );
  }
);
H0.displayName = V0;
var W0 = "SliderBubbleInput", G0 = C.forwardRef(
  ({ __scopeSlider: e, ...n }, i) => {
    const { value: o, name: a, form: c } = B0(W0, e), d = C.useRef(null), f = st(d, i), y = bE(o);
    return C.useEffect(() => {
      const g = d.current;
      if (!g) return;
      const v = window.HTMLInputElement.prototype, h = Object.getOwnPropertyDescriptor(v, "value").set;
      if (y !== o && h) {
        const S = new Event("input", { bubbles: !0 });
        h.call(g, o), g.dispatchEvent(S);
      }
    }, [y, o]), /* @__PURE__ */ k.jsx(
      yt.input,
      {
        style: { display: "none" },
        name: a,
        form: c,
        ...n,
        ref: f,
        defaultValue: o
      }
    );
  }
);
G0.displayName = W0;
function VE(e = [], n, i) {
  const o = [...e];
  return o[i] = n, o.sort((a, c) => a - c);
}
function K0(e, n, i) {
  const c = 100 / (i - n) * (e - n);
  return E0(c, [0, 100]);
}
function BE(e, n) {
  return n > 2 ? `Value ${e + 1} of ${n}` : n === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function zE(e, n) {
  if (e.length === 1) return 0;
  const i = e.map((a) => Math.abs(a - n)), o = Math.min(...i);
  return i.indexOf(o);
}
function UE(e, n, i) {
  const o = e / 2, c = jd([0, 50], [0, o]);
  return (o - c(n) * i) * i;
}
function $E(e) {
  return e.slice(0, -1).map((n, i) => e[i + 1] - n);
}
function HE(e, n) {
  if (n > 0) {
    const i = $E(e);
    return Math.min(...i) >= n;
  }
  return !0;
}
function jd(e, n) {
  return (i) => {
    if (e[0] === e[1] || n[0] === n[1]) return n[0];
    const o = (n[1] - n[0]) / (e[1] - e[0]);
    return n[0] + o * (i - e[0]);
  };
}
function Y0(e) {
  if (!Number.isFinite(e)) return 0;
  const n = e.toString();
  if (n.includes("e")) {
    const [o, a] = n.split("e"), c = o.split(".")[1] || "", d = Number(a);
    return Math.max(0, c.length - d);
  }
  const i = n.split(".")[1];
  return i ? i.length : 0;
}
function ra(e, n) {
  const i = Math.pow(10, n);
  return Math.round(e * i) / i;
}
function WE(e, {
  min: n,
  step: i,
  direction: o,
  multiplier: a
}) {
  const c = Y0(i), d = (e - n) / i, f = Math.round(d), y = ra(f * i + n, c) === ra(e, c);
  let g;
  return y ? g = f + a * o : o > 0 ? g = Math.ceil(d) : g = Math.floor(d), ra(g * i + n, c);
}
function GE(e) {
  return typeof e == "function";
}
function Fy({ label: e, icon: n, value: i, onChange: o }) {
  return /* @__PURE__ */ k.jsxs("label", { className: "sound-slider", children: [
    /* @__PURE__ */ k.jsxs("span", { className: "sound-slider-head", children: [
      /* @__PURE__ */ k.jsxs("span", { className: "sound-slider-label", children: [
        n,
        /* @__PURE__ */ k.jsx("span", { children: e })
      ] }),
      /* @__PURE__ */ k.jsxs("strong", { children: [
        i,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ k.jsxs(
      D0,
      {
        className: "radix-slider-root",
        value: [i],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (a) => o(a[0]),
        children: [
          /* @__PURE__ */ k.jsx(j0, { className: "radix-slider-track", children: /* @__PURE__ */ k.jsx(L0, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ k.jsx(H0, { className: "radix-slider-thumb", "aria-label": e })
        ]
      }
    )
  ] });
}
function KE({ audioState: e }) {
  const n = Z((v) => v.musicType), i = Z((v) => v.ambientSound), o = Z((v) => v.musicVolume), a = Z((v) => v.ambientVolume), c = Z((v) => v.audioPlaying), d = Z((v) => v.setSound), f = Z((v) => v.toggleAudio), y = Ea({ musicType: n, ambientSound: i }), g = y.ambientLayers.map((v) => v.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ k.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ k.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ k.jsx("select", { value: n, onChange: (v) => d("musicType", v.target.value), children: co.map((v) => /* @__PURE__ */ k.jsx("option", { value: v.label, children: v.label }, v.label)) })
    ] }),
    /* @__PURE__ */ k.jsx(
      Fy,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ k.jsx(bd, { size: 16, "aria-hidden": "true" }),
        value: o,
        onChange: (v) => d("musicVolume", v)
      }
    ),
    /* @__PURE__ */ k.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ k.jsx("select", { value: i, onChange: (v) => d("ambientSound", v.target.value), children: fo.map((v) => /* @__PURE__ */ k.jsx("option", { value: v.label, children: v.label }, v.label)) })
    ] }),
    /* @__PURE__ */ k.jsx(
      Fy,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ k.jsx(TC, { size: 16, "aria-hidden": "true" }),
        value: a,
        onChange: (v) => d("ambientVolume", v)
      }
    ),
    /* @__PURE__ */ k.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ k.jsxs("div", { children: [
        /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ k.jsx("strong", { children: y.musicTrack.title }),
        /* @__PURE__ */ k.jsx("p", { children: g }),
        e != null && e.error ? /* @__PURE__ */ k.jsx("p", { className: "audio-error", children: e.error }) : null
      ] }),
      /* @__PURE__ */ k.jsx(ke, { variant: c ? "primary" : "ghost", onClick: f, children: c ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ k.jsx("div", { className: "audio-links", children: [y.musicTrack, ...y.ambientLayers].filter((v) => v == null ? void 0 : v.pageUrl).map((v) => /* @__PURE__ */ k.jsx("a", { href: v.pageUrl, target: "_blank", rel: "noreferrer", children: v.title || v.label || "Audio source" }, v.pageUrl)) })
  ] });
}
const YE = [
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
];
function Xi({ title: e, kicker: n, icon: i, children: o, onClose: a, className: c = "" }) {
  return /* @__PURE__ */ k.jsxs(hr.aside, { className: `focus-utility-panel liquid-glass ${c}`.trim(), initial: { opacity: 0, y: 12, x: 18 }, animate: { opacity: 1, y: 0, x: 0 }, exit: { opacity: 0, y: 10, x: 18 }, transition: Uv, role: "dialog", "aria-label": e, children: [
    /* @__PURE__ */ k.jsxs("div", { className: "drawer-head", children: [
      /* @__PURE__ */ k.jsxs("div", { className: "utility-title", children: [
        /* @__PURE__ */ k.jsx("span", { className: "utility-title-icon", children: i }),
        /* @__PURE__ */ k.jsxs("div", { children: [
          /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: n }),
          /* @__PURE__ */ k.jsx("h2", { children: e })
        ] })
      ] }),
      /* @__PURE__ */ k.jsx(ke, { "aria-label": `Close ${e}`, onClick: a, children: /* @__PURE__ */ k.jsx(AC, { size: 16, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ k.jsx("div", { className: "utility-panel-body", children: o })
  ] });
}
function Oy({ audioState: e, scene: n }) {
  const i = Z((g) => g.audioChannels), o = Z((g) => g.setSound), [a, c] = C.useState(!1), d = (g, v) => {
    c(!1), o(`audioChannel:${g}`, v);
  }, f = () => {
    const g = co[Math.floor(Math.random() * co.length)], v = fo[Math.floor(Math.random() * fo.length)];
    o("musicType", g.label), o("ambientSound", v.label), c(!0);
  }, y = () => {
    o("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), o("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), c(!0);
  };
  return /* @__PURE__ */ k.jsxs("div", { className: "sound-mixer", children: [
    /* @__PURE__ */ k.jsxs("div", { className: "mixer-featured-row", children: [
      /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Music library" }),
      /* @__PURE__ */ k.jsxs(ke, { onClick: f, children: [
        /* @__PURE__ */ k.jsx(oC, { size: 14, "aria-hidden": "true" }),
        " Random track"
      ] })
    ] }),
    /* @__PURE__ */ k.jsx(KE, { audioState: e, compact: !0 }),
    /* @__PURE__ */ k.jsxs("div", { className: "mixer-preset-row", children: [
      /* @__PURE__ */ k.jsxs("button", { type: "button", className: "mixer-preset-button", onClick: y, children: [
        "Apply scene mix ",
        /* @__PURE__ */ k.jsx("span", { children: "↗" })
      ] }),
      /* @__PURE__ */ k.jsxs(ke, { onClick: () => c(!0), children: [
        a ? /* @__PURE__ */ k.jsx(rC, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ k.jsx(mC, { size: 14, "aria-hidden": "true" }),
        " ",
        a ? "Saved" : "Save current mix"
      ] })
    ] }),
    /* @__PURE__ */ k.jsx("div", { className: "mixer-channel-grid", children: YE.map(([g, v]) => /* @__PURE__ */ k.jsxs("label", { className: "mixer-channel", children: [
      /* @__PURE__ */ k.jsxs("span", { children: [
        /* @__PURE__ */ k.jsx("i", { className: `mixer-channel-dot mixer-${g}` }),
        v
      ] }),
      /* @__PURE__ */ k.jsxs("strong", { children: [
        i[g],
        "%"
      ] }),
      /* @__PURE__ */ k.jsx("input", { type: "range", min: "0", max: "100", value: i[g], "aria-label": `${v} volume`, onChange: (l) => d(g, l.target.value) })
    ] }, g)) }),
    e != null && e.error ? /* @__PURE__ */ k.jsx("p", { className: "audio-error", children: e.error }) : null
  ] });
}
function QE() {
  const e = () => {
    var o, a, c;
    return ((c = (a = (o = globalThis.window) == null ? void 0 : o.SynapseAuth) == null ? void 0 : a.getStoredSession) == null ? void 0 : c.call(a)) || null;
  }, [n, i] = C.useState(e);
  return C.useEffect(() => {
    var d, f, y, g;
    let o = !0;
    const a = (v) => {
      var l;
      o && i(((l = v == null ? void 0 : v.detail) == null ? void 0 : l.session) || e());
    };
    (d = globalThis.window) == null || d.addEventListener("synapse-auth-changed", a);
    const c = (g = (y = (f = globalThis.window) == null ? void 0 : f.SynapseAuth) == null ? void 0 : y.syncSessionFromProvider) == null ? void 0 : g.call(y);
    return Promise.resolve(c).finally(() => a()), () => {
      var v;
      o = !1, (v = globalThis.window) == null || v.removeEventListener("synapse-auth-changed", a);
    };
  }, []), n;
}
function XE({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ k.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ k.jsx(va, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ k.jsx("h3", { children: "Your Focus Trail" }),
    /* @__PURE__ */ k.jsx("p", { children: "Recent sessions and progress remain available through Synapse history." }),
    /* @__PURE__ */ k.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e("", "history"), children: "Open session history" })
  ] }) : /* @__PURE__ */ k.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ k.jsx(va, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Your rhythm, remembered" }),
    /* @__PURE__ */ k.jsx("h3", { children: "Sign in to view your Focus Trail" }),
    /* @__PURE__ */ k.jsx("p", { children: "Track deep-work time, completed goals, and your study streak across devices." }),
    /* @__PURE__ */ k.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Sign in with Synapse" }),
    /* @__PURE__ */ k.jsx("small", { children: "Your current session continues without an account." })
  ] });
}
function ZE({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ k.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ k.jsx(Sa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ k.jsx("h3", { children: "Companion Room" }),
    /* @__PURE__ */ k.jsx("p", { children: "Invite a study partner from your Synapse workspace to share this quiet room." }),
    /* @__PURE__ */ k.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e("", "companion"), children: "Open Companion Room" })
  ] }) : /* @__PURE__ */ k.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ k.jsx(Sa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Study alongside someone" }),
    /* @__PURE__ */ k.jsx("h3", { children: "Sign in to use Companion Room" }),
    /* @__PURE__ */ k.jsx("p", { children: "Keep your own goal private while sharing the feeling of showing up together." }),
    /* @__PURE__ */ k.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Go to sign in" }),
    /* @__PURE__ */ k.jsx("small", { children: "No companion data is created in Focus Room." })
  ] });
}
function JE({ audioState: e, utilityPanel: n, onClose: i, onWorkspace: o }) {
  const a = Z((v) => v.activeDrawer), c = Z((v) => v.closeDrawer), d = Z((v) => v.selectedScene), f = Z((v) => v.openDrawer), y = QE(), g = C.useMemo(() => mr.find((v) => v.id === d) || mr[0], [d]);
  return /* @__PURE__ */ k.jsxs(Ca, { children: [
    n === "trail" ? /* @__PURE__ */ k.jsx(Xi, { title: "Focus Trail", kicker: "Your progress", icon: /* @__PURE__ */ k.jsx(va, { size: 16 }), onClose: i, children: /* @__PURE__ */ k.jsx(XE, { onWorkspace: o, session: y }) }) : null,
    n === "companion" ? /* @__PURE__ */ k.jsx(Xi, { title: "Companion Room", kicker: "Shared focus", icon: /* @__PURE__ */ k.jsx(Sa, { size: 16 }), onClose: i, children: /* @__PURE__ */ k.jsx(ZE, { onWorkspace: o, session: y }) }) : null,
    n === "settings" ? /* @__PURE__ */ k.jsxs(Xi, { title: "Room settings", kicker: "Customize your atmosphere", icon: /* @__PURE__ */ k.jsx(Lc, { size: 16 }), onClose: i, className: "room-settings-utility", children: [
      /* @__PURE__ */ k.jsxs("div", { className: "settings-scene-summary", children: [
        /* @__PURE__ */ k.jsx("span", { className: "settings-scene-image", style: { backgroundImage: `url(${(g == null ? void 0 : g.image) || ""})` } }),
        /* @__PURE__ */ k.jsxs("div", { children: [
          /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Current scene" }),
          /* @__PURE__ */ k.jsx("strong", { children: g == null ? void 0 : g.name }),
          /* @__PURE__ */ k.jsx("small", { children: g == null ? void 0 : g.description })
        ] })
      ] }),
      /* @__PURE__ */ k.jsx(ke, { onClick: () => {
        i == null || i(), f("scene");
      }, children: "Change scene" }),
      /* @__PURE__ */ k.jsx("h3", { className: "utility-section-title", children: "Sound mixer" }),
      /* @__PURE__ */ k.jsx(Oy, { audioState: e, scene: g })
    ] }) : null,
    !n && a === "scene" ? /* @__PURE__ */ k.jsx(Xi, { title: "Choose scene", kicker: "Scene", icon: /* @__PURE__ */ k.jsx(Lc, { size: 16 }), onClose: c, children: /* @__PURE__ */ k.jsx(PE, {}) }) : null,
    !n && a === "music" ? /* @__PURE__ */ k.jsx(Xi, { title: "Sound atmosphere", kicker: "Room audio", icon: /* @__PURE__ */ k.jsx(bd, { size: 16 }), onClose: c, children: /* @__PURE__ */ k.jsx(Oy, { audioState: e, scene: g }) }) : null
  ] });
}
function qE({ onExit: e }) {
  const n = Z((g) => g.elapsedSeconds), i = Z((g) => g.pomodoroDuration), o = Z((g) => g.timerDurationSeconds), a = Z((g) => g.timerMode), c = Z((g) => g.timerStatus), d = Z((g) => g.currentSession), f = Number(o) || (Number(i) || 0) * 60, y = a === "countup" ? n : Math.max(0, f - n);
  return /* @__PURE__ */ k.jsxs("div", { className: "compact-focus-mode-card", "aria-label": "Distraction-free focus timer", children: [
    /* @__PURE__ */ k.jsxs("div", { className: "compact-focus-card-top", children: [
      /* @__PURE__ */ k.jsxs("span", { children: [
        "POMODORO #",
        (d == null ? void 0 : d.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ k.jsx(ke, { className: "compact-exit-button", onClick: e, "aria-label": "Exit Focus Mode", children: /* @__PURE__ */ k.jsx(cC, { size: 14, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ k.jsxs("span", { className: "compact-focus-status", children: [
      /* @__PURE__ */ k.jsx("i", {}),
      c === "paused" ? "Paused" : "In focus"
    ] }),
    /* @__PURE__ */ k.jsx("strong", { children: ro(y) }),
    /* @__PURE__ */ k.jsx("div", { className: "compact-focus-progress", children: /* @__PURE__ */ k.jsx("span", { style: { width: `${f ? Math.min(100, Math.max(0, n / f * 100)) : 0}%` } }) }),
    /* @__PURE__ */ k.jsxs("small", { children: [
      i,
      " min session"
    ] }),
    /* @__PURE__ */ k.jsx("span", { className: "sr-only", children: "Press Escape to exit Focus Mode." })
  ] });
}
var tc = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var jy;
function eM() {
  return jy || (jy = 1, (function(e) {
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
          var l = this || i;
          return l._counter = 1e3, l._html5AudioPool = [], l.html5PoolSize = 10, l._codecs = {}, l._howls = [], l._muted = !1, l._volume = 1, l._canPlayEvent = "canplaythrough", l._navigator = typeof window < "u" && window.navigator ? window.navigator : null, l.masterGain = null, l.noAudio = !1, l.usingWebAudio = !0, l.autoSuspend = !0, l.ctx = null, l.autoUnlock = !0, l._setup(), l;
        },
        /**
         * Get/set the global volume for all sounds.
         * @param  {Float} vol Volume from 0.0 to 1.0.
         * @return {Howler/Float}     Returns self or current volume.
         */
        volume: function(l) {
          var h = this || i;
          if (l = parseFloat(l), h.ctx || v(), typeof l < "u" && l >= 0 && l <= 1) {
            if (h._volume = l, h._muted)
              return h;
            h.usingWebAudio && h.masterGain.gain.setValueAtTime(l, i.ctx.currentTime);
            for (var S = 0; S < h._howls.length; S++)
              if (!h._howls[S]._webAudio)
                for (var w = h._howls[S]._getSoundIds(), _ = 0; _ < w.length; _++) {
                  var A = h._howls[S]._soundById(w[_]);
                  A && A._node && (A._node.volume = A._volume * l);
                }
            return h;
          }
          return h._volume;
        },
        /**
         * Handle muting and unmuting globally.
         * @param  {Boolean} muted Is muted or not.
         */
        mute: function(l) {
          var h = this || i;
          h.ctx || v(), h._muted = l, h.usingWebAudio && h.masterGain.gain.setValueAtTime(l ? 0 : h._volume, i.ctx.currentTime);
          for (var S = 0; S < h._howls.length; S++)
            if (!h._howls[S]._webAudio)
              for (var w = h._howls[S]._getSoundIds(), _ = 0; _ < w.length; _++) {
                var A = h._howls[S]._soundById(w[_]);
                A && A._node && (A._node.muted = l ? !0 : A._muted);
              }
          return h;
        },
        /**
         * Handle stopping all sounds globally.
         */
        stop: function() {
          for (var l = this || i, h = 0; h < l._howls.length; h++)
            l._howls[h].stop();
          return l;
        },
        /**
         * Unload and destroy all currently loaded Howl objects.
         * @return {Howler}
         */
        unload: function() {
          for (var l = this || i, h = l._howls.length - 1; h >= 0; h--)
            l._howls[h].unload();
          return l.usingWebAudio && l.ctx && typeof l.ctx.close < "u" && (l.ctx.close(), l.ctx = null, v()), l;
        },
        /**
         * Check for codec support of specific extension.
         * @param  {String} ext Audio file extention.
         * @return {Boolean}
         */
        codecs: function(l) {
          return (this || i)._codecs[l.replace(/^x-/, "")];
        },
        /**
         * Setup various state values for global tracking.
         * @return {Howler}
         */
        _setup: function() {
          var l = this || i;
          if (l.state = l.ctx && l.ctx.state || "suspended", l._autoSuspend(), !l.usingWebAudio)
            if (typeof Audio < "u")
              try {
                var h = new Audio();
                typeof h.oncanplaythrough > "u" && (l._canPlayEvent = "canplay");
              } catch {
                l.noAudio = !0;
              }
            else
              l.noAudio = !0;
          try {
            var h = new Audio();
            h.muted && (l.noAudio = !0);
          } catch {
          }
          return l.noAudio || l._setupCodecs(), l;
        },
        /**
         * Check for browser support for various codecs and cache the results.
         * @return {Howler}
         */
        _setupCodecs: function() {
          var l = this || i, h = null;
          try {
            h = typeof Audio < "u" ? new Audio() : null;
          } catch {
            return l;
          }
          if (!h || typeof h.canPlayType != "function")
            return l;
          var S = h.canPlayType("audio/mpeg;").replace(/^no$/, ""), w = l._navigator ? l._navigator.userAgent : "", _ = w.match(/OPR\/(\d+)/g), A = _ && parseInt(_[0].split("/")[1], 10) < 33, T = w.indexOf("Safari") !== -1 && w.indexOf("Chrome") === -1, M = w.match(/Version\/(.*?) /), R = T && M && parseInt(M[1], 10) < 15;
          return l._codecs = {
            mp3: !!(!A && (S || h.canPlayType("audio/mp3;").replace(/^no$/, ""))),
            mpeg: !!S,
            opus: !!h.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
            ogg: !!h.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            oga: !!h.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            wav: !!(h.canPlayType('audio/wav; codecs="1"') || h.canPlayType("audio/wav")).replace(/^no$/, ""),
            aac: !!h.canPlayType("audio/aac;").replace(/^no$/, ""),
            caf: !!h.canPlayType("audio/x-caf;").replace(/^no$/, ""),
            m4a: !!(h.canPlayType("audio/x-m4a;") || h.canPlayType("audio/m4a;") || h.canPlayType("audio/aac;")).replace(/^no$/, ""),
            m4b: !!(h.canPlayType("audio/x-m4b;") || h.canPlayType("audio/m4b;") || h.canPlayType("audio/aac;")).replace(/^no$/, ""),
            mp4: !!(h.canPlayType("audio/x-mp4;") || h.canPlayType("audio/mp4;") || h.canPlayType("audio/aac;")).replace(/^no$/, ""),
            weba: !!(!R && h.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            webm: !!(!R && h.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            dolby: !!h.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
            flac: !!(h.canPlayType("audio/x-flac;") || h.canPlayType("audio/flac;")).replace(/^no$/, "")
          }, l;
        },
        /**
         * Some browsers/devices will only allow audio to be played after a user interaction.
         * Attempt to automatically unlock audio on the first user interaction.
         * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         * @return {Howler}
         */
        _unlockAudio: function() {
          var l = this || i;
          if (!(l._audioUnlocked || !l.ctx)) {
            l._audioUnlocked = !1, l.autoUnlock = !1, !l._mobileUnloaded && l.ctx.sampleRate !== 44100 && (l._mobileUnloaded = !0, l.unload()), l._scratchBuffer = l.ctx.createBuffer(1, 1, 22050);
            var h = function(S) {
              for (; l._html5AudioPool.length < l.html5PoolSize; )
                try {
                  var w = new Audio();
                  w._unlocked = !0, l._releaseHtml5Audio(w);
                } catch {
                  l.noAudio = !0;
                  break;
                }
              for (var _ = 0; _ < l._howls.length; _++)
                if (!l._howls[_]._webAudio)
                  for (var A = l._howls[_]._getSoundIds(), T = 0; T < A.length; T++) {
                    var M = l._howls[_]._soundById(A[T]);
                    M && M._node && !M._node._unlocked && (M._node._unlocked = !0, M._node.load());
                  }
              l._autoResume();
              var R = l.ctx.createBufferSource();
              R.buffer = l._scratchBuffer, R.connect(l.ctx.destination), typeof R.start > "u" ? R.noteOn(0) : R.start(0), typeof l.ctx.resume == "function" && l.ctx.resume(), R.onended = function() {
                R.disconnect(0), l._audioUnlocked = !0, document.removeEventListener("touchstart", h, !0), document.removeEventListener("touchend", h, !0), document.removeEventListener("click", h, !0), document.removeEventListener("keydown", h, !0);
                for (var D = 0; D < l._howls.length; D++)
                  l._howls[D]._emit("unlock");
              };
            };
            return document.addEventListener("touchstart", h, !0), document.addEventListener("touchend", h, !0), document.addEventListener("click", h, !0), document.addEventListener("keydown", h, !0), l;
          }
        },
        /**
         * Get an unlocked HTML5 Audio object from the pool. If none are left,
         * return a new Audio object and throw a warning.
         * @return {Audio} HTML5 Audio object.
         */
        _obtainHtml5Audio: function() {
          var l = this || i;
          if (l._html5AudioPool.length)
            return l._html5AudioPool.pop();
          var h = new Audio().play();
          return h && typeof Promise < "u" && (h instanceof Promise || typeof h.then == "function") && h.catch(function() {
            console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
          }), new Audio();
        },
        /**
         * Return an activated HTML5 Audio object to the pool.
         * @return {Howler}
         */
        _releaseHtml5Audio: function(l) {
          var h = this || i;
          return l._unlocked && h._html5AudioPool.push(l), h;
        },
        /**
         * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
         * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
         * @return {Howler}
         */
        _autoSuspend: function() {
          var l = this;
          if (!(!l.autoSuspend || !l.ctx || typeof l.ctx.suspend > "u" || !i.usingWebAudio)) {
            for (var h = 0; h < l._howls.length; h++)
              if (l._howls[h]._webAudio) {
                for (var S = 0; S < l._howls[h]._sounds.length; S++)
                  if (!l._howls[h]._sounds[S]._paused)
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
          if (!(!l.ctx || typeof l.ctx.resume > "u" || !i.usingWebAudio))
            return l.state === "running" && l.ctx.state !== "interrupted" && l._suspendTimer ? (clearTimeout(l._suspendTimer), l._suspendTimer = null) : l.state === "suspended" || l.state === "running" && l.ctx.state === "interrupted" ? (l.ctx.resume().then(function() {
              l.state = "running";
              for (var h = 0; h < l._howls.length; h++)
                l._howls[h]._emit("resume");
            }), l._suspendTimer && (clearTimeout(l._suspendTimer), l._suspendTimer = null)) : l.state === "suspending" && (l._resumeAfterSuspend = !0), l;
        }
      };
      var i = new n(), o = function(l) {
        var h = this;
        if (!l.src || l.src.length === 0) {
          console.error("An array of source files must be passed with any new Howl.");
          return;
        }
        h.init(l);
      };
      o.prototype = {
        /**
         * Initialize a new Howl group object.
         * @param  {Object} o Passed in properties for this group.
         * @return {Howl}
         */
        init: function(l) {
          var h = this;
          return i.ctx || v(), h._autoplay = l.autoplay || !1, h._format = typeof l.format != "string" ? l.format : [l.format], h._html5 = l.html5 || !1, h._muted = l.mute || !1, h._loop = l.loop || !1, h._pool = l.pool || 5, h._preload = typeof l.preload == "boolean" || l.preload === "metadata" ? l.preload : !0, h._rate = l.rate || 1, h._sprite = l.sprite || {}, h._src = typeof l.src != "string" ? l.src : [l.src], h._volume = l.volume !== void 0 ? l.volume : 1, h._xhr = {
            method: l.xhr && l.xhr.method ? l.xhr.method : "GET",
            headers: l.xhr && l.xhr.headers ? l.xhr.headers : null,
            withCredentials: l.xhr && l.xhr.withCredentials ? l.xhr.withCredentials : !1
          }, h._duration = 0, h._state = "unloaded", h._sounds = [], h._endTimers = {}, h._queue = [], h._playLock = !1, h._onend = l.onend ? [{ fn: l.onend }] : [], h._onfade = l.onfade ? [{ fn: l.onfade }] : [], h._onload = l.onload ? [{ fn: l.onload }] : [], h._onloaderror = l.onloaderror ? [{ fn: l.onloaderror }] : [], h._onplayerror = l.onplayerror ? [{ fn: l.onplayerror }] : [], h._onpause = l.onpause ? [{ fn: l.onpause }] : [], h._onplay = l.onplay ? [{ fn: l.onplay }] : [], h._onstop = l.onstop ? [{ fn: l.onstop }] : [], h._onmute = l.onmute ? [{ fn: l.onmute }] : [], h._onvolume = l.onvolume ? [{ fn: l.onvolume }] : [], h._onrate = l.onrate ? [{ fn: l.onrate }] : [], h._onseek = l.onseek ? [{ fn: l.onseek }] : [], h._onunlock = l.onunlock ? [{ fn: l.onunlock }] : [], h._onresume = [], h._webAudio = i.usingWebAudio && !h._html5, typeof i.ctx < "u" && i.ctx && i.autoUnlock && i._unlockAudio(), i._howls.push(h), h._autoplay && h._queue.push({
            event: "play",
            action: function() {
              h.play();
            }
          }), h._preload && h._preload !== "none" && h.load(), h;
        },
        /**
         * Load the audio file.
         * @return {Howler}
         */
        load: function() {
          var l = this, h = null;
          if (i.noAudio) {
            l._emit("loaderror", null, "No audio support.");
            return;
          }
          typeof l._src == "string" && (l._src = [l._src]);
          for (var S = 0; S < l._src.length; S++) {
            var w, _;
            if (l._format && l._format[S])
              w = l._format[S];
            else {
              if (_ = l._src[S], typeof _ != "string") {
                l._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              w = /^data:audio\/([^;,]+);/i.exec(_), w || (w = /\.([^.]+)$/.exec(_.split("?", 1)[0])), w && (w = w[1].toLowerCase());
            }
            if (w || console.warn('No file extension was found. Consider using the "format" property or specify an extension.'), w && i.codecs(w)) {
              h = l._src[S];
              break;
            }
          }
          if (!h) {
            l._emit("loaderror", null, "No codec support for selected audio sources.");
            return;
          }
          return l._src = h, l._state = "loading", window.location.protocol === "https:" && h.slice(0, 5) === "http:" && (l._html5 = !0, l._webAudio = !1), new a(l), l._webAudio && d(l), l;
        },
        /**
         * Play a sound or resume previous playback.
         * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Number}          Sound ID.
         */
        play: function(l, h) {
          var S = this, w = null;
          if (typeof l == "number")
            w = l, l = null;
          else {
            if (typeof l == "string" && S._state === "loaded" && !S._sprite[l])
              return null;
            if (typeof l > "u" && (l = "__default", !S._playLock)) {
              for (var _ = 0, A = 0; A < S._sounds.length; A++)
                S._sounds[A]._paused && !S._sounds[A]._ended && (_++, w = S._sounds[A]._id);
              _ === 1 ? l = null : w = null;
            }
          }
          var T = w ? S._soundById(w) : S._inactiveSound();
          if (!T)
            return null;
          if (w && !l && (l = T._sprite || "__default"), S._state !== "loaded") {
            T._sprite = l, T._ended = !1;
            var M = T._id;
            return S._queue.push({
              event: "play",
              action: function() {
                S.play(M);
              }
            }), M;
          }
          if (w && !T._paused)
            return h || S._loadQueue("play"), T._id;
          S._webAudio && i._autoResume();
          var R = Math.max(0, T._seek > 0 ? T._seek : S._sprite[l][0] / 1e3), D = Math.max(0, (S._sprite[l][0] + S._sprite[l][1]) / 1e3 - R), j = D * 1e3 / Math.abs(T._rate), G = S._sprite[l][0] / 1e3, K = (S._sprite[l][0] + S._sprite[l][1]) / 1e3;
          T._sprite = l, T._ended = !1;
          var $ = function() {
            T._paused = !1, T._seek = R, T._start = G, T._stop = K, T._loop = !!(T._loop || S._sprite[l][2]);
          };
          if (R >= K) {
            S._ended(T);
            return;
          }
          var W = T._node;
          if (S._webAudio) {
            var X = function() {
              S._playLock = !1, $(), S._refreshBuffer(T);
              var Q = T._muted || S._muted ? 0 : T._volume;
              W.gain.setValueAtTime(Q, i.ctx.currentTime), T._playStart = i.ctx.currentTime, typeof W.bufferSource.start > "u" ? T._loop ? W.bufferSource.noteGrainOn(0, R, 86400) : W.bufferSource.noteGrainOn(0, R, D) : T._loop ? W.bufferSource.start(0, R, 86400) : W.bufferSource.start(0, R, D), j !== 1 / 0 && (S._endTimers[T._id] = setTimeout(S._ended.bind(S, T), j)), h || setTimeout(function() {
                S._emit("play", T._id), S._loadQueue();
              }, 0);
            };
            i.state === "running" && i.ctx.state !== "interrupted" ? X() : (S._playLock = !0, S.once("resume", X), S._clearTimer(T._id));
          } else {
            var te = function() {
              W.currentTime = R, W.muted = T._muted || S._muted || i._muted || W.muted, W.volume = T._volume * i.volume(), W.playbackRate = T._rate;
              try {
                var Q = W.play();
                if (Q && typeof Promise < "u" && (Q instanceof Promise || typeof Q.then == "function") ? (S._playLock = !0, $(), Q.then(function() {
                  S._playLock = !1, W._unlocked = !0, h ? S._loadQueue() : S._emit("play", T._id);
                }).catch(function() {
                  S._playLock = !1, S._emit("playerror", T._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), T._ended = !0, T._paused = !0;
                })) : h || (S._playLock = !1, $(), S._emit("play", T._id)), W.playbackRate = T._rate, W.paused) {
                  S._emit("playerror", T._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                l !== "__default" || T._loop ? S._endTimers[T._id] = setTimeout(S._ended.bind(S, T), j) : (S._endTimers[T._id] = function() {
                  S._ended(T), W.removeEventListener("ended", S._endTimers[T._id], !1);
                }, W.addEventListener("ended", S._endTimers[T._id], !1));
              } catch (we) {
                S._emit("playerror", T._id, we);
              }
            };
            W.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (W.src = S._src, W.load());
            var de = window && window.ejecta || !W.readyState && i._navigator.isCocoonJS;
            if (W.readyState >= 3 || de)
              te();
            else {
              S._playLock = !0, S._state = "loading";
              var he = function() {
                S._state = "loaded", te(), W.removeEventListener(i._canPlayEvent, he, !1);
              };
              W.addEventListener(i._canPlayEvent, he, !1), S._clearTimer(T._id);
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
          var h = this;
          if (h._state !== "loaded" || h._playLock)
            return h._queue.push({
              event: "pause",
              action: function() {
                h.pause(l);
              }
            }), h;
          for (var S = h._getSoundIds(l), w = 0; w < S.length; w++) {
            h._clearTimer(S[w]);
            var _ = h._soundById(S[w]);
            if (_ && !_._paused && (_._seek = h.seek(S[w]), _._rateSeek = 0, _._paused = !0, h._stopFade(S[w]), _._node))
              if (h._webAudio) {
                if (!_._node.bufferSource)
                  continue;
                typeof _._node.bufferSource.stop > "u" ? _._node.bufferSource.noteOff(0) : _._node.bufferSource.stop(0), h._cleanBuffer(_._node);
              } else (!isNaN(_._node.duration) || _._node.duration === 1 / 0) && _._node.pause();
            arguments[1] || h._emit("pause", _ ? _._id : null);
          }
          return h;
        },
        /**
         * Stop playback and reset to start.
         * @param  {Number} id The sound ID (empty to stop all in group).
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Howl}
         */
        stop: function(l, h) {
          var S = this;
          if (S._state !== "loaded" || S._playLock)
            return S._queue.push({
              event: "stop",
              action: function() {
                S.stop(l);
              }
            }), S;
          for (var w = S._getSoundIds(l), _ = 0; _ < w.length; _++) {
            S._clearTimer(w[_]);
            var A = S._soundById(w[_]);
            A && (A._seek = A._start || 0, A._rateSeek = 0, A._paused = !0, A._ended = !0, S._stopFade(w[_]), A._node && (S._webAudio ? A._node.bufferSource && (typeof A._node.bufferSource.stop > "u" ? A._node.bufferSource.noteOff(0) : A._node.bufferSource.stop(0), S._cleanBuffer(A._node)) : (!isNaN(A._node.duration) || A._node.duration === 1 / 0) && (A._node.currentTime = A._start || 0, A._node.pause(), A._node.duration === 1 / 0 && S._clearSound(A._node))), h || S._emit("stop", A._id));
          }
          return S;
        },
        /**
         * Mute/unmute a single sound or all sounds in this Howl group.
         * @param  {Boolean} muted Set to true to mute and false to unmute.
         * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
         * @return {Howl}
         */
        mute: function(l, h) {
          var S = this;
          if (S._state !== "loaded" || S._playLock)
            return S._queue.push({
              event: "mute",
              action: function() {
                S.mute(l, h);
              }
            }), S;
          if (typeof h > "u")
            if (typeof l == "boolean")
              S._muted = l;
            else
              return S._muted;
          for (var w = S._getSoundIds(h), _ = 0; _ < w.length; _++) {
            var A = S._soundById(w[_]);
            A && (A._muted = l, A._interval && S._stopFade(A._id), S._webAudio && A._node ? A._node.gain.setValueAtTime(l ? 0 : A._volume, i.ctx.currentTime) : A._node && (A._node.muted = i._muted ? !0 : l), S._emit("mute", A._id));
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
          var l = this, h = arguments, S, w;
          if (h.length === 0)
            return l._volume;
          if (h.length === 1 || h.length === 2 && typeof h[1] > "u") {
            var _ = l._getSoundIds(), A = _.indexOf(h[0]);
            A >= 0 ? w = parseInt(h[0], 10) : S = parseFloat(h[0]);
          } else h.length >= 2 && (S = parseFloat(h[0]), w = parseInt(h[1], 10));
          var T;
          if (typeof S < "u" && S >= 0 && S <= 1) {
            if (l._state !== "loaded" || l._playLock)
              return l._queue.push({
                event: "volume",
                action: function() {
                  l.volume.apply(l, h);
                }
              }), l;
            typeof w > "u" && (l._volume = S), w = l._getSoundIds(w);
            for (var M = 0; M < w.length; M++)
              T = l._soundById(w[M]), T && (T._volume = S, h[2] || l._stopFade(w[M]), l._webAudio && T._node && !T._muted ? T._node.gain.setValueAtTime(S, i.ctx.currentTime) : T._node && !T._muted && (T._node.volume = S * i.volume()), l._emit("volume", T._id));
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
        fade: function(l, h, S, w) {
          var _ = this;
          if (_._state !== "loaded" || _._playLock)
            return _._queue.push({
              event: "fade",
              action: function() {
                _.fade(l, h, S, w);
              }
            }), _;
          l = Math.min(Math.max(0, parseFloat(l)), 1), h = Math.min(Math.max(0, parseFloat(h)), 1), S = parseFloat(S), _.volume(l, w);
          for (var A = _._getSoundIds(w), T = 0; T < A.length; T++) {
            var M = _._soundById(A[T]);
            if (M) {
              if (w || _._stopFade(A[T]), _._webAudio && !M._muted) {
                var R = i.ctx.currentTime, D = R + S / 1e3;
                M._volume = l, M._node.gain.setValueAtTime(l, R), M._node.gain.linearRampToValueAtTime(h, D);
              }
              _._startFadeInterval(M, l, h, S, A[T], typeof w > "u");
            }
          }
          return _;
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
        _startFadeInterval: function(l, h, S, w, _, A) {
          var T = this, M = h, R = S - h, D = Math.abs(R / 0.01), j = Math.max(4, D > 0 ? w / D : w), G = Date.now();
          l._fadeTo = S, l._interval = setInterval(function() {
            var K = (Date.now() - G) / w;
            G = Date.now(), M += R * K, M = Math.round(M * 100) / 100, R < 0 ? M = Math.max(S, M) : M = Math.min(S, M), T._webAudio ? l._volume = M : T.volume(M, l._id, !0), A && (T._volume = M), (S < h && M <= S || S > h && M >= S) && (clearInterval(l._interval), l._interval = null, l._fadeTo = null, T.volume(S, l._id), T._emit("fade", l._id));
          }, j);
        },
        /**
         * Internal method that stops the currently playing fade when
         * a new fade starts, volume is changed or the sound is stopped.
         * @param  {Number} id The sound id.
         * @return {Howl}
         */
        _stopFade: function(l) {
          var h = this, S = h._soundById(l);
          return S && S._interval && (h._webAudio && S._node.gain.cancelScheduledValues(i.ctx.currentTime), clearInterval(S._interval), S._interval = null, h.volume(S._fadeTo, l), S._fadeTo = null, h._emit("fade", l)), h;
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
          var l = this, h = arguments, S, w, _;
          if (h.length === 0)
            return l._loop;
          if (h.length === 1)
            if (typeof h[0] == "boolean")
              S = h[0], l._loop = S;
            else
              return _ = l._soundById(parseInt(h[0], 10)), _ ? _._loop : !1;
          else h.length === 2 && (S = h[0], w = parseInt(h[1], 10));
          for (var A = l._getSoundIds(w), T = 0; T < A.length; T++)
            _ = l._soundById(A[T]), _ && (_._loop = S, l._webAudio && _._node && _._node.bufferSource && (_._node.bufferSource.loop = S, S && (_._node.bufferSource.loopStart = _._start || 0, _._node.bufferSource.loopEnd = _._stop, l.playing(A[T]) && (l.pause(A[T], !0), l.play(A[T], !0)))));
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
          var l = this, h = arguments, S, w;
          if (h.length === 0)
            w = l._sounds[0]._id;
          else if (h.length === 1) {
            var _ = l._getSoundIds(), A = _.indexOf(h[0]);
            A >= 0 ? w = parseInt(h[0], 10) : S = parseFloat(h[0]);
          } else h.length === 2 && (S = parseFloat(h[0]), w = parseInt(h[1], 10));
          var T;
          if (typeof S == "number") {
            if (l._state !== "loaded" || l._playLock)
              return l._queue.push({
                event: "rate",
                action: function() {
                  l.rate.apply(l, h);
                }
              }), l;
            typeof w > "u" && (l._rate = S), w = l._getSoundIds(w);
            for (var M = 0; M < w.length; M++)
              if (T = l._soundById(w[M]), T) {
                l.playing(w[M]) && (T._rateSeek = l.seek(w[M]), T._playStart = l._webAudio ? i.ctx.currentTime : T._playStart), T._rate = S, l._webAudio && T._node && T._node.bufferSource ? T._node.bufferSource.playbackRate.setValueAtTime(S, i.ctx.currentTime) : T._node && (T._node.playbackRate = S);
                var R = l.seek(w[M]), D = (l._sprite[T._sprite][0] + l._sprite[T._sprite][1]) / 1e3 - R, j = D * 1e3 / Math.abs(T._rate);
                (l._endTimers[w[M]] || !T._paused) && (l._clearTimer(w[M]), l._endTimers[w[M]] = setTimeout(l._ended.bind(l, T), j)), l._emit("rate", T._id);
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
          var l = this, h = arguments, S, w;
          if (h.length === 0)
            l._sounds.length && (w = l._sounds[0]._id);
          else if (h.length === 1) {
            var _ = l._getSoundIds(), A = _.indexOf(h[0]);
            A >= 0 ? w = parseInt(h[0], 10) : l._sounds.length && (w = l._sounds[0]._id, S = parseFloat(h[0]));
          } else h.length === 2 && (S = parseFloat(h[0]), w = parseInt(h[1], 10));
          if (typeof w > "u")
            return 0;
          if (typeof S == "number" && (l._state !== "loaded" || l._playLock))
            return l._queue.push({
              event: "seek",
              action: function() {
                l.seek.apply(l, h);
              }
            }), l;
          var T = l._soundById(w);
          if (T)
            if (typeof S == "number" && S >= 0) {
              var M = l.playing(w);
              M && l.pause(w, !0), T._seek = S, T._ended = !1, l._clearTimer(w), !l._webAudio && T._node && !isNaN(T._node.duration) && (T._node.currentTime = S);
              var R = function() {
                M && l.play(w, !0), l._emit("seek", w);
              };
              if (M && !l._webAudio) {
                var D = function() {
                  l._playLock ? setTimeout(D, 0) : R();
                };
                setTimeout(D, 0);
              } else
                R();
            } else if (l._webAudio) {
              var j = l.playing(w) ? i.ctx.currentTime - T._playStart : 0, G = T._rateSeek ? T._rateSeek - T._seek : 0;
              return T._seek + (G + j * Math.abs(T._rate));
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
          var h = this;
          if (typeof l == "number") {
            var S = h._soundById(l);
            return S ? !S._paused : !1;
          }
          for (var w = 0; w < h._sounds.length; w++)
            if (!h._sounds[w]._paused)
              return !0;
          return !1;
        },
        /**
         * Get the duration of this sound. Passing a sound id will return the sprite duration.
         * @param  {Number} id The sound id to check. If none is passed, return full source duration.
         * @return {Number} Audio duration in seconds.
         */
        duration: function(l) {
          var h = this, S = h._duration, w = h._soundById(l);
          return w && (S = h._sprite[w._sprite][1] / 1e3), S;
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
          for (var l = this, h = l._sounds, S = 0; S < h.length; S++)
            h[S]._paused || l.stop(h[S]._id), l._webAudio || (l._clearSound(h[S]._node), h[S]._node.removeEventListener("error", h[S]._errorFn, !1), h[S]._node.removeEventListener(i._canPlayEvent, h[S]._loadFn, !1), h[S]._node.removeEventListener("ended", h[S]._endFn, !1), i._releaseHtml5Audio(h[S]._node)), delete h[S]._node, l._clearTimer(h[S]._id);
          var w = i._howls.indexOf(l);
          w >= 0 && i._howls.splice(w, 1);
          var _ = !0;
          for (S = 0; S < i._howls.length; S++)
            if (i._howls[S]._src === l._src || l._src.indexOf(i._howls[S]._src) >= 0) {
              _ = !1;
              break;
            }
          return c && _ && delete c[l._src], i.noAudio = !1, l._state = "unloaded", l._sounds = [], l = null, null;
        },
        /**
         * Listen to a custom event.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
         * @return {Howl}
         */
        on: function(l, h, S, w) {
          var _ = this, A = _["_on" + l];
          return typeof h == "function" && A.push(w ? { id: S, fn: h, once: w } : { id: S, fn: h }), _;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(l, h, S) {
          var w = this, _ = w["_on" + l], A = 0;
          if (typeof h == "number" && (S = h, h = null), h || S)
            for (A = 0; A < _.length; A++) {
              var T = S === _[A].id;
              if (h === _[A].fn && T || !h && T) {
                _.splice(A, 1);
                break;
              }
            }
          else if (l)
            w["_on" + l] = [];
          else {
            var M = Object.keys(w);
            for (A = 0; A < M.length; A++)
              M[A].indexOf("_on") === 0 && Array.isArray(w[M[A]]) && (w[M[A]] = []);
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
        once: function(l, h, S) {
          var w = this;
          return w.on(l, h, S, 1), w;
        },
        /**
         * Emit all events of a specific type and pass the sound id.
         * @param  {String} event Event name.
         * @param  {Number} id    Sound ID.
         * @param  {Number} msg   Message to go with event.
         * @return {Howl}
         */
        _emit: function(l, h, S) {
          for (var w = this, _ = w["_on" + l], A = _.length - 1; A >= 0; A--)
            (!_[A].id || _[A].id === h || l === "load") && (setTimeout((function(T) {
              T.call(this, h, S);
            }).bind(w, _[A].fn), 0), _[A].once && w.off(l, _[A].fn, _[A].id));
          return w._loadQueue(l), w;
        },
        /**
         * Queue of actions initiated before the sound has loaded.
         * These will be called in sequence, with the next only firing
         * after the previous has finished executing (even if async like play).
         * @return {Howl}
         */
        _loadQueue: function(l) {
          var h = this;
          if (h._queue.length > 0) {
            var S = h._queue[0];
            S.event === l && (h._queue.shift(), h._loadQueue()), l || S.action();
          }
          return h;
        },
        /**
         * Fired when playback ends at the end of the duration.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _ended: function(l) {
          var h = this, S = l._sprite;
          if (!h._webAudio && l._node && !l._node.paused && !l._node.ended && l._node.currentTime < l._stop)
            return setTimeout(h._ended.bind(h, l), 100), h;
          var w = !!(l._loop || h._sprite[S][2]);
          if (h._emit("end", l._id), !h._webAudio && w && h.stop(l._id, !0).play(l._id), h._webAudio && w) {
            h._emit("play", l._id), l._seek = l._start || 0, l._rateSeek = 0, l._playStart = i.ctx.currentTime;
            var _ = (l._stop - l._start) * 1e3 / Math.abs(l._rate);
            h._endTimers[l._id] = setTimeout(h._ended.bind(h, l), _);
          }
          return h._webAudio && !w && (l._paused = !0, l._ended = !0, l._seek = l._start || 0, l._rateSeek = 0, h._clearTimer(l._id), h._cleanBuffer(l._node), i._autoSuspend()), !h._webAudio && !w && h.stop(l._id, !0), h;
        },
        /**
         * Clear the end timer for a sound playback.
         * @param  {Number} id The sound ID.
         * @return {Howl}
         */
        _clearTimer: function(l) {
          var h = this;
          if (h._endTimers[l]) {
            if (typeof h._endTimers[l] != "function")
              clearTimeout(h._endTimers[l]);
            else {
              var S = h._soundById(l);
              S && S._node && S._node.removeEventListener("ended", h._endTimers[l], !1);
            }
            delete h._endTimers[l];
          }
          return h;
        },
        /**
         * Return the sound identified by this ID, or return null.
         * @param  {Number} id Sound ID
         * @return {Object}    Sound object or null.
         */
        _soundById: function(l) {
          for (var h = this, S = 0; S < h._sounds.length; S++)
            if (l === h._sounds[S]._id)
              return h._sounds[S];
          return null;
        },
        /**
         * Return an inactive sound from the pool or create a new one.
         * @return {Sound} Sound playback object.
         */
        _inactiveSound: function() {
          var l = this;
          l._drain();
          for (var h = 0; h < l._sounds.length; h++)
            if (l._sounds[h]._ended)
              return l._sounds[h].reset();
          return new a(l);
        },
        /**
         * Drain excess inactive sounds from the pool.
         */
        _drain: function() {
          var l = this, h = l._pool, S = 0, w = 0;
          if (!(l._sounds.length < h)) {
            for (w = 0; w < l._sounds.length; w++)
              l._sounds[w]._ended && S++;
            for (w = l._sounds.length - 1; w >= 0; w--) {
              if (S <= h)
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
          var h = this;
          if (typeof l > "u") {
            for (var S = [], w = 0; w < h._sounds.length; w++)
              S.push(h._sounds[w]._id);
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
          var h = this;
          return l._node.bufferSource = i.ctx.createBufferSource(), l._node.bufferSource.buffer = c[h._src], l._panner ? l._node.bufferSource.connect(l._panner) : l._node.bufferSource.connect(l._node), l._node.bufferSource.loop = l._loop, l._loop && (l._node.bufferSource.loopStart = l._start || 0, l._node.bufferSource.loopEnd = l._stop || 0), l._node.bufferSource.playbackRate.setValueAtTime(l._rate, i.ctx.currentTime), h;
        },
        /**
         * Prevent memory leaks by cleaning up the buffer source after playback.
         * @param  {Object} node Sound's audio node containing the buffer source.
         * @return {Howl}
         */
        _cleanBuffer: function(l) {
          var h = this, S = i._navigator && i._navigator.vendor.indexOf("Apple") >= 0;
          if (!l.bufferSource)
            return h;
          if (i._scratchBuffer && l.bufferSource && (l.bufferSource.onended = null, l.bufferSource.disconnect(0), S))
            try {
              l.bufferSource.buffer = i._scratchBuffer;
            } catch {
            }
          return l.bufferSource = null, h;
        },
        /**
         * Set the source to a 0-second silence to stop any downloading (except in IE).
         * @param  {Object} node Audio node to clear.
         */
        _clearSound: function(l) {
          var h = /MSIE |Trident\//.test(i._navigator && i._navigator.userAgent);
          h || (l.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
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
          var l = this, h = l._parent;
          return l._muted = h._muted, l._loop = h._loop, l._volume = h._volume, l._rate = h._rate, l._seek = 0, l._paused = !0, l._ended = !0, l._sprite = "__default", l._id = ++i._counter, h._sounds.push(l), l.create(), l;
        },
        /**
         * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
         * @return {Sound}
         */
        create: function() {
          var l = this, h = l._parent, S = i._muted || l._muted || l._parent._muted ? 0 : l._volume;
          return h._webAudio ? (l._node = typeof i.ctx.createGain > "u" ? i.ctx.createGainNode() : i.ctx.createGain(), l._node.gain.setValueAtTime(S, i.ctx.currentTime), l._node.paused = !0, l._node.connect(i.masterGain)) : i.noAudio || (l._node = i._obtainHtml5Audio(), l._errorFn = l._errorListener.bind(l), l._node.addEventListener("error", l._errorFn, !1), l._loadFn = l._loadListener.bind(l), l._node.addEventListener(i._canPlayEvent, l._loadFn, !1), l._endFn = l._endListener.bind(l), l._node.addEventListener("ended", l._endFn, !1), l._node.src = h._src, l._node.preload = h._preload === !0 ? "auto" : h._preload, l._node.volume = S * i.volume(), l._node.load()), l;
        },
        /**
         * Reset the parameters of this sound to the original state (for recycle).
         * @return {Sound}
         */
        reset: function() {
          var l = this, h = l._parent;
          return l._muted = h._muted, l._loop = h._loop, l._volume = h._volume, l._rate = h._rate, l._seek = 0, l._rateSeek = 0, l._paused = !0, l._ended = !0, l._sprite = "__default", l._id = ++i._counter, l;
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
          var l = this, h = l._parent;
          h._duration = Math.ceil(l._node.duration * 10) / 10, Object.keys(h._sprite).length === 0 && (h._sprite = { __default: [0, h._duration * 1e3] }), h._state !== "loaded" && (h._state = "loaded", h._emit("load"), h._loadQueue()), l._node.removeEventListener(i._canPlayEvent, l._loadFn, !1);
        },
        /**
         * HTML5 Audio ended listener callback.
         */
        _endListener: function() {
          var l = this, h = l._parent;
          h._duration === 1 / 0 && (h._duration = Math.ceil(l._node.duration * 10) / 10, h._sprite.__default[1] === 1 / 0 && (h._sprite.__default[1] = h._duration * 1e3), h._ended(l)), l._node.removeEventListener("ended", l._endFn, !1);
        }
      };
      var c = {}, d = function(l) {
        var h = l._src;
        if (c[h]) {
          l._duration = c[h].duration, g(l);
          return;
        }
        if (/^data:[^;]+;base64,/.test(h)) {
          for (var S = atob(h.split(",")[1]), w = new Uint8Array(S.length), _ = 0; _ < S.length; ++_)
            w[_] = S.charCodeAt(_);
          y(w.buffer, l);
        } else {
          var A = new XMLHttpRequest();
          A.open(l._xhr.method, h, !0), A.withCredentials = l._xhr.withCredentials, A.responseType = "arraybuffer", l._xhr.headers && Object.keys(l._xhr.headers).forEach(function(T) {
            A.setRequestHeader(T, l._xhr.headers[T]);
          }), A.onload = function() {
            var T = (A.status + "")[0];
            if (T !== "0" && T !== "2" && T !== "3") {
              l._emit("loaderror", null, "Failed loading audio file with status: " + A.status + ".");
              return;
            }
            y(A.response, l);
          }, A.onerror = function() {
            l._webAudio && (l._html5 = !0, l._webAudio = !1, l._sounds = [], delete c[h], l.load());
          }, f(A);
        }
      }, f = function(l) {
        try {
          l.send();
        } catch {
          l.onerror();
        }
      }, y = function(l, h) {
        var S = function() {
          h._emit("loaderror", null, "Decoding audio data failed.");
        }, w = function(_) {
          _ && h._sounds.length > 0 ? (c[h._src] = _, g(h, _)) : S();
        };
        typeof Promise < "u" && i.ctx.decodeAudioData.length === 1 ? i.ctx.decodeAudioData(l).then(w).catch(S) : i.ctx.decodeAudioData(l, w, S);
      }, g = function(l, h) {
        h && !l._duration && (l._duration = h.duration), Object.keys(l._sprite).length === 0 && (l._sprite = { __default: [0, l._duration * 1e3] }), l._state !== "loaded" && (l._state = "loaded", l._emit("load"), l._loadQueue());
      }, v = function() {
        if (i.usingWebAudio) {
          try {
            typeof AudioContext < "u" ? i.ctx = new AudioContext() : typeof webkitAudioContext < "u" ? i.ctx = new webkitAudioContext() : i.usingWebAudio = !1;
          } catch {
            i.usingWebAudio = !1;
          }
          i.ctx || (i.usingWebAudio = !1);
          var l = /iP(hone|od|ad)/.test(i._navigator && i._navigator.platform), h = i._navigator && i._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), S = h ? parseInt(h[1], 10) : null;
          if (l && S && S < 9) {
            var w = /safari/.test(i._navigator && i._navigator.userAgent.toLowerCase());
            i._navigator && !w && (i.usingWebAudio = !1);
          }
          i.usingWebAudio && (i.masterGain = typeof i.ctx.createGain > "u" ? i.ctx.createGainNode() : i.ctx.createGain(), i.masterGain.gain.setValueAtTime(i._muted ? 0 : i._volume, i.ctx.currentTime), i.masterGain.connect(i.ctx.destination)), i._setup();
        }
      };
      e.Howler = i, e.Howl = o, typeof Gi < "u" ? (Gi.HowlerGlobal = n, Gi.Howler = i, Gi.Howl = o, Gi.Sound = a) : typeof window < "u" && (window.HowlerGlobal = n, window.Howler = i, window.Howl = o, window.Sound = a);
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
      HowlerGlobal.prototype._pos = [0, 0, 0], HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0], HowlerGlobal.prototype.stereo = function(i) {
        var o = this;
        if (!o.ctx || !o.ctx.listener)
          return o;
        for (var a = o._howls.length - 1; a >= 0; a--)
          o._howls[a].stereo(i);
        return o;
      }, HowlerGlobal.prototype.pos = function(i, o, a) {
        var c = this;
        if (!c.ctx || !c.ctx.listener)
          return c;
        if (o = typeof o != "number" ? c._pos[1] : o, a = typeof a != "number" ? c._pos[2] : a, typeof i == "number")
          c._pos = [i, o, a], typeof c.ctx.listener.positionX < "u" ? (c.ctx.listener.positionX.setTargetAtTime(c._pos[0], Howler.ctx.currentTime, 0.1), c.ctx.listener.positionY.setTargetAtTime(c._pos[1], Howler.ctx.currentTime, 0.1), c.ctx.listener.positionZ.setTargetAtTime(c._pos[2], Howler.ctx.currentTime, 0.1)) : c.ctx.listener.setPosition(c._pos[0], c._pos[1], c._pos[2]);
        else
          return c._pos;
        return c;
      }, HowlerGlobal.prototype.orientation = function(i, o, a, c, d, f) {
        var y = this;
        if (!y.ctx || !y.ctx.listener)
          return y;
        var g = y._orientation;
        if (o = typeof o != "number" ? g[1] : o, a = typeof a != "number" ? g[2] : a, c = typeof c != "number" ? g[3] : c, d = typeof d != "number" ? g[4] : d, f = typeof f != "number" ? g[5] : f, typeof i == "number")
          y._orientation = [i, o, a, c, d, f], typeof y.ctx.listener.forwardX < "u" ? (y.ctx.listener.forwardX.setTargetAtTime(i, Howler.ctx.currentTime, 0.1), y.ctx.listener.forwardY.setTargetAtTime(o, Howler.ctx.currentTime, 0.1), y.ctx.listener.forwardZ.setTargetAtTime(a, Howler.ctx.currentTime, 0.1), y.ctx.listener.upX.setTargetAtTime(c, Howler.ctx.currentTime, 0.1), y.ctx.listener.upY.setTargetAtTime(d, Howler.ctx.currentTime, 0.1), y.ctx.listener.upZ.setTargetAtTime(f, Howler.ctx.currentTime, 0.1)) : y.ctx.listener.setOrientation(i, o, a, c, d, f);
        else
          return g;
        return y;
      }, Howl.prototype.init = /* @__PURE__ */ (function(i) {
        return function(o) {
          var a = this;
          return a._orientation = o.orientation || [1, 0, 0], a._stereo = o.stereo || null, a._pos = o.pos || null, a._pannerAttr = {
            coneInnerAngle: typeof o.coneInnerAngle < "u" ? o.coneInnerAngle : 360,
            coneOuterAngle: typeof o.coneOuterAngle < "u" ? o.coneOuterAngle : 360,
            coneOuterGain: typeof o.coneOuterGain < "u" ? o.coneOuterGain : 0,
            distanceModel: typeof o.distanceModel < "u" ? o.distanceModel : "inverse",
            maxDistance: typeof o.maxDistance < "u" ? o.maxDistance : 1e4,
            panningModel: typeof o.panningModel < "u" ? o.panningModel : "HRTF",
            refDistance: typeof o.refDistance < "u" ? o.refDistance : 1,
            rolloffFactor: typeof o.rolloffFactor < "u" ? o.rolloffFactor : 1
          }, a._onstereo = o.onstereo ? [{ fn: o.onstereo }] : [], a._onpos = o.onpos ? [{ fn: o.onpos }] : [], a._onorientation = o.onorientation ? [{ fn: o.onorientation }] : [], i.call(this, o);
        };
      })(Howl.prototype.init), Howl.prototype.stereo = function(i, o) {
        var a = this;
        if (!a._webAudio)
          return a;
        if (a._state !== "loaded")
          return a._queue.push({
            event: "stereo",
            action: function() {
              a.stereo(i, o);
            }
          }), a;
        var c = typeof Howler.ctx.createStereoPanner > "u" ? "spatial" : "stereo";
        if (typeof o > "u")
          if (typeof i == "number")
            a._stereo = i, a._pos = [i, 0, 0];
          else
            return a._stereo;
        for (var d = a._getSoundIds(o), f = 0; f < d.length; f++) {
          var y = a._soundById(d[f]);
          if (y)
            if (typeof i == "number")
              y._stereo = i, y._pos = [i, 0, 0], y._node && (y._pannerAttr.panningModel = "equalpower", (!y._panner || !y._panner.pan) && n(y, c), c === "spatial" ? typeof y._panner.positionX < "u" ? (y._panner.positionX.setValueAtTime(i, Howler.ctx.currentTime), y._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime), y._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime)) : y._panner.setPosition(i, 0, 0) : y._panner.pan.setValueAtTime(i, Howler.ctx.currentTime)), a._emit("stereo", y._id);
            else
              return y._stereo;
        }
        return a;
      }, Howl.prototype.pos = function(i, o, a, c) {
        var d = this;
        if (!d._webAudio)
          return d;
        if (d._state !== "loaded")
          return d._queue.push({
            event: "pos",
            action: function() {
              d.pos(i, o, a, c);
            }
          }), d;
        if (o = typeof o != "number" ? 0 : o, a = typeof a != "number" ? -0.5 : a, typeof c > "u")
          if (typeof i == "number")
            d._pos = [i, o, a];
          else
            return d._pos;
        for (var f = d._getSoundIds(c), y = 0; y < f.length; y++) {
          var g = d._soundById(f[y]);
          if (g)
            if (typeof i == "number")
              g._pos = [i, o, a], g._node && ((!g._panner || g._panner.pan) && n(g, "spatial"), typeof g._panner.positionX < "u" ? (g._panner.positionX.setValueAtTime(i, Howler.ctx.currentTime), g._panner.positionY.setValueAtTime(o, Howler.ctx.currentTime), g._panner.positionZ.setValueAtTime(a, Howler.ctx.currentTime)) : g._panner.setPosition(i, o, a)), d._emit("pos", g._id);
            else
              return g._pos;
        }
        return d;
      }, Howl.prototype.orientation = function(i, o, a, c) {
        var d = this;
        if (!d._webAudio)
          return d;
        if (d._state !== "loaded")
          return d._queue.push({
            event: "orientation",
            action: function() {
              d.orientation(i, o, a, c);
            }
          }), d;
        if (o = typeof o != "number" ? d._orientation[1] : o, a = typeof a != "number" ? d._orientation[2] : a, typeof c > "u")
          if (typeof i == "number")
            d._orientation = [i, o, a];
          else
            return d._orientation;
        for (var f = d._getSoundIds(c), y = 0; y < f.length; y++) {
          var g = d._soundById(f[y]);
          if (g)
            if (typeof i == "number")
              g._orientation = [i, o, a], g._node && (g._panner || (g._pos || (g._pos = d._pos || [0, 0, -0.5]), n(g, "spatial")), typeof g._panner.orientationX < "u" ? (g._panner.orientationX.setValueAtTime(i, Howler.ctx.currentTime), g._panner.orientationY.setValueAtTime(o, Howler.ctx.currentTime), g._panner.orientationZ.setValueAtTime(a, Howler.ctx.currentTime)) : g._panner.setOrientation(i, o, a)), d._emit("orientation", g._id);
            else
              return g._orientation;
        }
        return d;
      }, Howl.prototype.pannerAttr = function() {
        var i = this, o = arguments, a, c, d;
        if (!i._webAudio)
          return i;
        if (o.length === 0)
          return i._pannerAttr;
        if (o.length === 1)
          if (typeof o[0] == "object")
            a = o[0], typeof c > "u" && (a.pannerAttr || (a.pannerAttr = {
              coneInnerAngle: a.coneInnerAngle,
              coneOuterAngle: a.coneOuterAngle,
              coneOuterGain: a.coneOuterGain,
              distanceModel: a.distanceModel,
              maxDistance: a.maxDistance,
              refDistance: a.refDistance,
              rolloffFactor: a.rolloffFactor,
              panningModel: a.panningModel
            }), i._pannerAttr = {
              coneInnerAngle: typeof a.pannerAttr.coneInnerAngle < "u" ? a.pannerAttr.coneInnerAngle : i._coneInnerAngle,
              coneOuterAngle: typeof a.pannerAttr.coneOuterAngle < "u" ? a.pannerAttr.coneOuterAngle : i._coneOuterAngle,
              coneOuterGain: typeof a.pannerAttr.coneOuterGain < "u" ? a.pannerAttr.coneOuterGain : i._coneOuterGain,
              distanceModel: typeof a.pannerAttr.distanceModel < "u" ? a.pannerAttr.distanceModel : i._distanceModel,
              maxDistance: typeof a.pannerAttr.maxDistance < "u" ? a.pannerAttr.maxDistance : i._maxDistance,
              refDistance: typeof a.pannerAttr.refDistance < "u" ? a.pannerAttr.refDistance : i._refDistance,
              rolloffFactor: typeof a.pannerAttr.rolloffFactor < "u" ? a.pannerAttr.rolloffFactor : i._rolloffFactor,
              panningModel: typeof a.pannerAttr.panningModel < "u" ? a.pannerAttr.panningModel : i._panningModel
            });
          else
            return d = i._soundById(parseInt(o[0], 10)), d ? d._pannerAttr : i._pannerAttr;
        else o.length === 2 && (a = o[0], c = parseInt(o[1], 10));
        for (var f = i._getSoundIds(c), y = 0; y < f.length; y++)
          if (d = i._soundById(f[y]), d) {
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
            v || (d._pos || (d._pos = i._pos || [0, 0, -0.5]), n(d, "spatial"), v = d._panner), v.coneInnerAngle = g.coneInnerAngle, v.coneOuterAngle = g.coneOuterAngle, v.coneOuterGain = g.coneOuterGain, v.distanceModel = g.distanceModel, v.maxDistance = g.maxDistance, v.refDistance = g.refDistance, v.rolloffFactor = g.rolloffFactor, v.panningModel = g.panningModel;
          }
        return i;
      }, Sound.prototype.init = /* @__PURE__ */ (function(i) {
        return function() {
          var o = this, a = o._parent;
          o._orientation = a._orientation, o._stereo = a._stereo, o._pos = a._pos, o._pannerAttr = a._pannerAttr, i.call(this), o._stereo ? a.stereo(o._stereo) : o._pos && a.pos(o._pos[0], o._pos[1], o._pos[2], o._id);
        };
      })(Sound.prototype.init), Sound.prototype.reset = /* @__PURE__ */ (function(i) {
        return function() {
          var o = this, a = o._parent;
          return o._orientation = a._orientation, o._stereo = a._stereo, o._pos = a._pos, o._pannerAttr = a._pannerAttr, o._stereo ? a.stereo(o._stereo) : o._pos ? a.pos(o._pos[0], o._pos[1], o._pos[2], o._id) : o._panner && (o._panner.disconnect(0), o._panner = void 0, a._refreshBuffer(o)), i.call(this);
        };
      })(Sound.prototype.reset);
      var n = function(i, o) {
        o = o || "spatial", o === "spatial" ? (i._panner = Howler.ctx.createPanner(), i._panner.coneInnerAngle = i._pannerAttr.coneInnerAngle, i._panner.coneOuterAngle = i._pannerAttr.coneOuterAngle, i._panner.coneOuterGain = i._pannerAttr.coneOuterGain, i._panner.distanceModel = i._pannerAttr.distanceModel, i._panner.maxDistance = i._pannerAttr.maxDistance, i._panner.refDistance = i._pannerAttr.refDistance, i._panner.rolloffFactor = i._pannerAttr.rolloffFactor, i._panner.panningModel = i._pannerAttr.panningModel, typeof i._panner.positionX < "u" ? (i._panner.positionX.setValueAtTime(i._pos[0], Howler.ctx.currentTime), i._panner.positionY.setValueAtTime(i._pos[1], Howler.ctx.currentTime), i._panner.positionZ.setValueAtTime(i._pos[2], Howler.ctx.currentTime)) : i._panner.setPosition(i._pos[0], i._pos[1], i._pos[2]), typeof i._panner.orientationX < "u" ? (i._panner.orientationX.setValueAtTime(i._orientation[0], Howler.ctx.currentTime), i._panner.orientationY.setValueAtTime(i._orientation[1], Howler.ctx.currentTime), i._panner.orientationZ.setValueAtTime(i._orientation[2], Howler.ctx.currentTime)) : i._panner.setOrientation(i._orientation[0], i._orientation[1], i._orientation[2])) : (i._panner = Howler.ctx.createStereoPanner(), i._panner.pan.setValueAtTime(i._stereo, Howler.ctx.currentTime)), i._panner.connect(i._node), i._paused || i._parent.pause(i._id, !0).play(i._id, !0);
      };
    })();
  })(tc)), tc;
}
var tM = eM();
const nM = /* @__PURE__ */ Wy(tM), { Howl: Q0 } = nM, Hc = 500, Et = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let sr = {}, oo = !1, Wc = "";
function mo() {
  return typeof Q0 == "function";
}
function nc(e, n = 50) {
  const i = Number(e), o = Number.isFinite(i) ? i : n;
  return Math.min(1, Math.max(0, o / 100));
}
function X0(e) {
  return new Q0({
    src: [e],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function Z0(e, n, i = Hc) {
  if (e)
    try {
      const o = typeof e.volume == "function" ? e.volume() : 0;
      e.fade(o, n, i);
    } catch {
      try {
        e.volume(n);
      } catch {
      }
    }
}
function Da(e, { unload: n = !1 } = {}) {
  var i;
  e && (Z0(e, 0, Math.min(Hc, 300)), (i = globalThis.setTimeout) == null || i.call(globalThis, () => {
    try {
      e.pause(), n && e.unload();
    } catch {
    }
  }, Math.min(Hc, 320)));
}
function rM(e) {
  return !(e != null && e.streamUrl) || !mo() ? null : ((!Et.music || Et.music.__synapseSrc !== e.streamUrl) && (Da(Et.music, { unload: !0 }), Et.music = X0(e.streamUrl), Et.music.__synapseSrc = e.streamUrl), Et.music);
}
function iM(e) {
  if (!(e != null && e.streamUrl) || !mo()) return null;
  const n = e.id || e.streamUrl, i = Et.ambient.get(n);
  if (i && i.__synapseSrc === e.streamUrl) return i;
  Da(i, { unload: !0 });
  const o = X0(e.streamUrl);
  return o.__synapseSrc = e.streamUrl, Et.ambient.set(n, o), o;
}
function oM() {
  return [
    Et.music,
    ...Et.ambient.values()
  ].filter(Boolean);
}
function J0() {
  oM().forEach((e) => Da(e));
}
function sM(e) {
  for (const [n, i] of Et.ambient.entries())
    e.has(n) || (Da(i, { unload: !0 }), Et.ambient.delete(n));
}
function Ly(e, n) {
  if (e)
    try {
      e.playing() || e.play(), Z0(e, n), Wc = "";
    } catch (i) {
      Wc = (i == null ? void 0 : i.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function aM(e = {}) {
  sr = { ...sr, ...e };
  const n = Ea(sr);
  if (!mo()) return ia(n);
  if (!oo)
    return J0(), ia(n);
  const i = rM(n.musicTrack), o = nc(sr.musicVolume, 60), a = nc(sr.ambientVolume, 50), c = /* @__PURE__ */ new Set(), d = [];
  return n.ambientLayers.forEach((f) => {
    var h;
    const y = f.id || f.streamUrl;
    c.add(y);
    const g = iM(f), v = Number((h = sr.audioChannels) == null ? void 0 : h[f.id]), l = Number.isFinite(v) ? nc(v, 0) : Math.min(1, Math.max(0, a * (f.volumeBias ?? 1)));
    d.push([g, l]);
  }), sM(c), Ly(i, o), d.forEach(([f, y]) => Ly(f, y)), ia(n);
}
function lM(e) {
  return oo = !!e, oo || J0(), oo;
}
function ia(e = Ea(sr)) {
  var n, i, o, a;
  return {
    available: mo(),
    playing: oo && mo(),
    musicTitle: ((n = e.musicTrack) == null ? void 0 : n.title) || "",
    musicArtist: ((i = e.musicTrack) == null ? void 0 : i.artist) || "",
    musicPageUrl: ((o = e.musicTrack) == null ? void 0 : o.pageUrl) || "",
    musicAttribution: ((a = e.musicTrack) == null ? void 0 : a.attribution) || "",
    ambientTitles: e.ambientLayers.map((c) => c.title).filter(Boolean),
    ambientPageUrls: e.ambientLayers.map((c) => c.pageUrl).filter(Boolean),
    ambientAttributions: e.ambientLayers.map((c) => c.attribution).filter(Boolean),
    error: Wc
  };
}
const uM = "synapse.focusRoom.audioPrefs.v1";
function cM(e) {
  var n;
  try {
    (n = globalThis.localStorage) == null || n.setItem(uM, JSON.stringify({
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
function dM() {
  const e = Z((y) => y.musicType), n = Z((y) => y.ambientSound), i = Z((y) => y.musicVolume), o = Z((y) => y.ambientVolume), a = Z((y) => y.audioChannels), c = Z((y) => y.audioPlaying), [d, f] = C.useState(() => ia(Ea({
    musicType: e,
    ambientSound: n
  })));
  return C.useEffect(() => {
    const y = { musicType: e, ambientSound: n, musicVolume: i, ambientVolume: o, audioChannels: a };
    let g = !1;
    return lM(c), cM(y), aM(y).then((v) => {
      g || f(v);
    }), () => {
      g = !0;
    };
  }, [n, o, a, c, e, i]), d;
}
function fM() {
  const e = Z(), n = C.useCallback(async (o = "", a = "", c = {}) => {
    var v;
    e.pauseTimer({ pauseAudio: !0 }), e.closeSummary();
    const d = typeof o == "string" || typeof o == "number" ? o : "", f = typeof a == "string" ? a : "", y = pM(f, c), g = String(d || e.selectedMaterialId || ((v = e.selectedMaterial) == null ? void 0 : v.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const l = globalThis.returnFromFocusRoomToWorkspace(g, y);
        l && typeof l.then == "function" && await l, Vy(y.action || f, y);
        return;
      } catch (l) {
        console.error("Could not return from Focus Room:", l);
      }
    globalThis.location.hash = "", Vy(y.action || f, y);
  }, [e]), i = C.useMemo(() => ({
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
  return globalThis.__synapseFocusRoomApi = i, C.useEffect(() => {
    globalThis.__synapseFocusRoomApi = i;
  }, [i]), {
    ...e,
    returnToWorkspace: n
  };
}
function q0(e) {
  const n = String(e || "").trim().toLowerCase();
  return ["flashcards", "quiz", "assistant", "mindmap", "timeline", "source", "notes"].includes(n) ? n : "";
}
function pM(e, n = {}) {
  const i = n && typeof n == "object" && !Array.isArray(n) ? n : {}, o = q0(e || i.action);
  return {
    ...i,
    action: o,
    sourceId: String(i.sourceId || i.source_id || ""),
    sourceIndex: Number(i.sourceIndex || i.source_index || 0) || 0,
    sourceLabel: String(i.sourceLabel || i.source_label || ""),
    sectionTitle: String(i.sectionTitle || i.section_title || ""),
    highlightId: String(i.highlightId || i.highlight_id || ""),
    excerpt: String(i.excerpt || "").slice(0, 1600)
  };
}
function Vy(e, n = {}) {
  const i = q0(e);
  if (!i) return;
  const o = () => {
    if (i === "source") {
      typeof globalThis.toggleSourceViewer == "function" && globalThis.toggleSourceViewer(!0), n.sourceId && typeof globalThis.selectSourceItem == "function" && globalThis.selectSourceItem(n.sourceId);
      return;
    }
    if (i === "notes") {
      typeof globalThis.showFullSummary == "function" && globalThis.showFullSummary();
      return;
    }
    if (i === "assistant") {
      typeof globalThis.openAssistant == "function" && globalThis.openAssistant();
      return;
    }
    typeof globalThis.switchTool == "function" && globalThis.switchTool(i);
  };
  typeof globalThis.requestAnimationFrame == "function" ? globalThis.requestAnimationFrame(o) : setTimeout(o, 0);
}
function hM(e = 3e3) {
  const n = Z((o) => o.setIdle), i = Z((o) => o.isIdle);
  return C.useEffect(() => {
    let o;
    const a = () => {
      n(!1), clearTimeout(o), o = setTimeout(() => n(!0), e);
    };
    return window.addEventListener("mousemove", a), window.addEventListener("keydown", a), window.addEventListener("click", a), a(), () => {
      clearTimeout(o), window.removeEventListener("mousemove", a), window.removeEventListener("keydown", a), window.removeEventListener("click", a);
    };
  }, [e, n]), i;
}
function mM() {
  const e = Z((o) => o.timerState || (o.timerStatus === "studying" ? "running" : o.timerStatus)), n = Z((o) => o.view), i = Z((o) => o.tickTimer);
  C.useEffect(() => {
    if (n !== "session" || e !== "running" || typeof window > "u") return;
    let o = !0;
    const a = () => {
      o && i();
    }, c = window.setInterval(a, 1e3), d = () => {
      document.visibilityState === "visible" && a();
    };
    return document.addEventListener("visibilitychange", d), a(), () => {
      o = !1, window.clearInterval(c), document.removeEventListener("visibilitychange", d);
    };
  }, [i, e, n]);
}
function yM() {
  const e = Z((n) => n.selectedScene);
  return Un(e);
}
function gM(e) {
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
function vM() {
  const [e, n] = C.useState(""), [i, o] = C.useState(!1), [a, c] = C.useState(!1), d = Z((T) => T.view), f = hM(3e3), y = yM(), g = dM(), v = fM();
  mM();
  const l = Z(Sx(gM)), h = Z((T) => T.summaryRecord), S = Z((T) => T.endSession), w = Z((T) => T.initializeFocusRoom);
  C.useEffect(() => {
    w();
  }, [w]), C.useEffect(() => {
    l != null && l.materialId && Cd(l.materialId, l);
  }, [l]), C.useEffect(() => {
    d === "session" || !h || Bv("focus-room");
  }, [h, d]), C.useEffect(() => {
    d !== "session" && (o(!1), n(""), c(!1));
  }, [d]), C.useEffect(() => {
    const T = (M) => {
      M.key === "Escape" && (i ? (M.preventDefault(), o(!1)) : e ? n("") : a && c(!1));
    };
    return window.addEventListener("keydown", T), () => window.removeEventListener("keydown", T);
  }, [a, i, e]);
  const _ = (...T) => {
    v.returnToWorkspace(...T);
  }, A = async () => {
    c(!1), o(!1), n(""), S(), await _();
  };
  return /* @__PURE__ */ k.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${f ? "is-idle" : ""}`.trim(),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ k.jsx(XA, { scene: y }),
        /* @__PURE__ */ k.jsx(Ca, { mode: "wait", children: d === "session" ? /* @__PURE__ */ k.jsxs(
          hr.div,
          {
            className: "focus-room-view focus-session-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: Uv,
            children: [
              i ? /* @__PURE__ */ k.jsx("button", { type: "button", className: "focus-mode-exit-hit-area", onClick: () => o(!1), children: "Exit Focus Mode" }) : /* @__PURE__ */ k.jsx($C, { onWorkspace: _, onOpenTrail: () => n("trail"), onOpenCompanion: () => n("companion"), onOpenSettings: () => n("settings"), onExit: () => c(!0) }),
              /* @__PURE__ */ k.jsx("section", { className: `focus-session-stage ${i ? "is-focus-mode" : ""}`.trim(), children: /* @__PURE__ */ k.jsx("div", { className: "focus-session-grid", children: /* @__PURE__ */ k.jsx(UC, {}) }) }),
              i ? /* @__PURE__ */ k.jsx(qE, { onExit: () => o(!1) }) : /* @__PURE__ */ k.jsx(HC, { audioState: g, onFocusMode: () => o(!0) }),
              i ? null : /* @__PURE__ */ k.jsx(JE, { audioState: g, utilityPanel: e, onClose: () => n(""), onWorkspace: _ }),
              /* @__PURE__ */ k.jsx(AE, {}),
              /* @__PURE__ */ k.jsx(SM, { open: a, onClose: () => c(!1), onConfirm: A })
            ]
          },
          "session"
        ) : null })
      ]
    }
  );
}
function SM({ open: e, onClose: n, onConfirm: i }) {
  return e ? /* @__PURE__ */ k.jsx("div", { className: "focus-exit-overlay", role: "presentation", children: /* @__PURE__ */ k.jsxs("div", { className: "focus-exit-dialog liquid-glass", role: "dialog", "aria-modal": "true", "aria-labelledby": "focus-exit-title", children: [
    /* @__PURE__ */ k.jsx("span", { className: "focus-kicker", children: "Leave this room?" }),
    /* @__PURE__ */ k.jsx("h2", { id: "focus-exit-title", children: "End focus session" }),
    /* @__PURE__ */ k.jsx("p", { children: "Your focused time will be saved to your Focus Trail." }),
    /* @__PURE__ */ k.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ k.jsx(ke, { onClick: n, children: "Continue focusing" }),
      /* @__PURE__ */ k.jsx(ke, { variant: "primary", onClick: i, children: "End and exit" })
    ] })
  ] }) }) : null;
}
let rc = null;
function wM(e, n) {
  const i = globalThis.__synapseFocusRoomApi || {};
  if (typeof i[e] != "function") {
    console.warn(`Synapse Focus Room action "${e}" is not available yet.`);
    return;
  }
  return i[e](...n);
}
function xM() {
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
  }).forEach(([n, i]) => {
    globalThis[n] = (...o) => wM(i, o);
  });
}
function _M(e = {}) {
  xM();
  const n = e.root || document.getElementById("focusRoomRoot");
  if (!n)
    throw new Error("Focus Room root element was not found.");
  rc || (rc = hx.createRoot(n), rc.render(
    hn.createElement(
      hn.StrictMode,
      null,
      hn.createElement(vM)
    )
  ));
}
const TM = "synapse.generated.history.v6", eS = "synapse.active.generated.v6", kM = "synapse.flashcards.deck.v1", AM = "synapse.quiz.history.v1", CM = "synapse.focusRoom.return-target.v1";
function Ld(e, n) {
  var i;
  try {
    const o = (i = globalThis.localStorage) == null ? void 0 : i.getItem(e);
    if (!o) return n;
    const a = JSON.parse(o);
    return a ?? n;
  } catch (o) {
    return console.warn(`Could not read ${e}:`, o), n;
  }
}
function PM(e, n) {
  var i;
  try {
    return (i = globalThis.localStorage) == null || i.setItem(e, n), !0;
  } catch (o) {
    return console.warn(`Could not write ${e}:`, o), !1;
  }
}
function EM(e, n) {
  var i;
  try {
    return (i = globalThis.localStorage) == null || i.setItem(e, JSON.stringify(n)), !0;
  } catch (o) {
    return console.warn(`Could not write ${e}:`, o), !1;
  }
}
function tS() {
  const e = Ld(TM, []);
  return Array.isArray(e) ? e : [];
}
function MM(e) {
  const n = String((e == null ? void 0 : e.title) || "").trim();
  return n || String((e == null ? void 0 : e.summary) || "").split(/\n+/).map((o) => o.replace(/^#+\s*/, "").trim()).find((o) => o.length > 4) || "Generated Study Notes";
}
function nS(e = {}) {
  return [
    e.id ? `history:${e.id}` : "",
    e.sourceFingerprint ? `fingerprint:${e.sourceFingerprint}` : "",
    e.clientFingerprint ? `fingerprint:${e.clientFingerprint}` : ""
  ].filter(Boolean);
}
function bM(e = {}) {
  const n = Ld(kM, {}), o = nS(e).map((a) => n == null ? void 0 : n[a]).find((a) => a && Array.isArray(a.cards) && a.cards.length);
  return (o == null ? void 0 : o.cards) || [];
}
function RM(e = {}) {
  var i;
  const n = String(e.id || "").trim();
  if (n) return `id:${n}`;
  try {
    return `content:${JSON.stringify({
      title: e.title || "",
      createdAt: e.createdAt || "",
      updatedAt: e.updatedAt || "",
      questions: ((i = e.quiz) == null ? void 0 : i.questions) || e.questions || []
    })}`;
  } catch {
    return "";
  }
}
function DM(e = []) {
  return (Array.isArray(e) ? e : []).map((n) => {
    var i;
    return {
      id: n.id,
      title: n.title,
      createdAt: n.createdAt || n.created_at || "",
      updatedAt: n.updatedAt || n.updated_at || "",
      questions: ((i = n.quiz) == null ? void 0 : i.questions) || n.questions || [],
      report: n.report || null
    };
  });
}
function NM(e = {}) {
  const n = Ld(AM, {}), o = nS(e).flatMap((c) => Array.isArray(n == null ? void 0 : n[c]) ? n[c] : []), a = /* @__PURE__ */ new Set();
  return DM(o).filter((c) => {
    const d = RM(c);
    return !d || a.has(d) ? !1 : (a.add(d), !0);
  }).sort((c, d) => new Date(d.createdAt || 0) - new Date(c.createdAt || 0));
}
function IM(e = {}) {
  return {
    materialId: String(e.id || e.sourceFingerprint || e.clientFingerprint || "current-material"),
    materialTitle: MM(e),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: e.summary || "",
    sections: e.sections || {},
    flashcards: bM(e),
    quizzes: NM(e),
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
function rS() {
  return tS().filter((e) => e && (e.id || e.summary)).map(IM);
}
function iS(e = "") {
  const n = String(e || "");
  return n && rS().find(
    (i) => i.materialId === n || i.sourceFingerprint === n || i.clientFingerprint === n
  ) || null;
}
function oS() {
  var n;
  const e = ((n = globalThis.localStorage) == null ? void 0 : n.getItem(eS)) || "";
  return iS(e);
}
function FM(e = "") {
  var o;
  const n = e || ((o = oS()) == null ? void 0 : o.materialId) || "", i = n ? `/${encodeURIComponent(n)}` : "";
  globalThis.location.hash = `#/focus-room${i}`;
}
function OM(e = "", n = {}) {
  const i = n && typeof n == "object" && !Array.isArray(n) ? n : {};
  return {
    materialId: String(e || ""),
    action: String(i.action || "").trim().toLowerCase(),
    sourceId: String(i.sourceId || i.source_id || ""),
    sourceIndex: Number(i.sourceIndex || i.source_index || 0) || 0,
    sourceLabel: String(i.sourceLabel || i.source_label || ""),
    sectionTitle: String(i.sectionTitle || i.section_title || ""),
    highlightId: String(i.highlightId || i.highlight_id || ""),
    excerpt: String(i.excerpt || "").slice(0, 1600),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function jM(e = "", n = {}) {
  const i = String(e || ""), o = tS().find(
    (d) => String((d == null ? void 0 : d.id) || "") === i || String((d == null ? void 0 : d.sourceFingerprint) || (d == null ? void 0 : d.source_fingerprint) || "") === i || String((d == null ? void 0 : d.clientFingerprint) || (d == null ? void 0 : d.client_fingerprint) || "") === i
  ) || null, a = String((o == null ? void 0 : o.id) || "");
  a && PM(eS, a);
  const c = OM(a, n);
  c.action && EM(CM, c), globalThis.location.href = a ? `index.html?focusReturn=${encodeURIComponent(a)}` : "index.html";
}
function LM() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: oS,
    getSynapseFocusRoomMaterial: iS,
    getSynapseFocusRoomMaterials: rS,
    openSynapseFocusRoom: FM,
    returnFromFocusRoomToWorkspace: jM
  });
}
const sS = document.getElementById("focusRoomRoot");
if (!sS)
  throw new Error("Focus Room root element was not found.");
var Uy;
(Uy = document.getElementById("focusRoomFallbackTitle")) == null || Uy.remove();
globalThis.apiClient = new Hy(sx);
LM();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
_M({ root: sS });
