function b_(e, n) {
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
function R_(e) {
  const o = String(e || "").toLowerCase().split(".");
  if (o.length !== 4 || o.some((a) => !/^\d+$/.test(a))) return !1;
  const i = o.map(Number);
  return i.some((a) => a < 0 || a > 255) ? !1 : i[0] === 10 || i[0] === 172 && i[1] >= 16 && i[1] <= 31 || i[0] === 192 && i[1] === 168;
}
function lg(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function Jh(e) {
  return lg(e) || R_(e);
}
function D_(e) {
  return !e || lg(e) ? "127.0.0.1" : e;
}
const N_ = (() => {
  var p, m, g, v;
  const { protocol: e, hostname: n, port: o } = window.location, i = String(window.SYNAPSE_BACKEND_PORT || ((m = (p = document.body) == null ? void 0 : p.dataset) == null ? void 0 : m.apiPort) || "8001").trim(), a = `http://${D_(n)}:${i || "8001"}`, c = String(window.SYNAPSE_API_BASE || ((v = (g = document.body) == null ? void 0 : g.dataset) == null ? void 0 : v.apiBase) || "").replace(/\/+$/, ""), d = `${e}//${window.location.host}`.replace(/\/+$/, "");
  return c && !(Jh(n) && o !== i && c === d) ? c : e === "file:" || Jh(n) && o !== i ? a : `${e}//${window.location.host}`;
})();
class Bs extends Error {
  constructor(n, { cause: o } = {}) {
    super(n), this.name = "ApiConnectionError", this.cause = o;
  }
}
const qh = "synapse.client.id.v1";
function Ln() {
  return globalThis.window || globalThis;
}
function Yr(e, n = 220) {
  return String(e || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
}
function em() {
  const e = globalThis.crypto || Ln().crypto;
  return e != null && e.randomUUID ? e.randomUUID() : `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
function I_() {
  var n, o;
  const e = Ln();
  try {
    const i = (n = e.localStorage) == null ? void 0 : n.getItem(qh);
    if (i) return i;
    const a = em();
    return (o = e.localStorage) == null || o.setItem(qh, a), a;
  } catch {
    return em();
  }
}
function F_(e = {}) {
  if (typeof Headers < "u" && e instanceof Headers) {
    const n = {};
    return e.forEach((o, i) => {
      n[i] = o;
    }), n;
  }
  return Array.isArray(e) ? Object.fromEntries(e) : { ...e || {} };
}
class ug {
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
    const o = Ln(), i = F_(n);
    i["X-Synapse-Client-Id"] = Yr(I_(), 160);
    const a = (d = (c = o.SynapseAuth) == null ? void 0 : c.getStoredSession) == null ? void 0 : d.call(c);
    if (a && typeof a == "object" && (a.accountId && (i["X-Synapse-User-Id"] = Yr(a.accountId, 160)), a.email && (i["X-Synapse-User-Email"] = Yr(a.email, 220)), a.displayName && (i["X-Synapse-User-Name"] = Yr(a.displayName, 180)), a.authMode && (i["X-Synapse-Auth-Mode"] = Yr(a.authMode, 60)), a.role && (i["X-Synapse-User-Role"] = Yr(a.role, 80))), (p = o.SynapseAuth) != null && p.authHeaders && !i.Authorization && !i.authorization)
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
      throw (l = p == null ? void 0 : p.signal) != null && l.aborted ? new Bs(this.timeoutMessage(d), { cause: f }) : new Bs(this.connectionMessage(), { cause: f });
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
        g = new Bs(
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
    throw g || new Bs(this.connectionMessage());
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
var ti = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function cg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ou = { exports: {} }, fe = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var tm;
function O_() {
  if (tm) return fe;
  tm = 1;
  var e = Symbol.for("react.element"), n = Symbol.for("react.portal"), o = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), d = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), l = Symbol.iterator;
  function f(D) {
    return D === null || typeof D != "object" ? null : (D = l && D[l] || D["@@iterator"], typeof D == "function" ? D : null);
  }
  var S = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, w = Object.assign, x = {};
  function k(D, B, ce) {
    this.props = D, this.context = B, this.refs = x, this.updater = ce || S;
  }
  k.prototype.isReactComponent = {}, k.prototype.setState = function(D, B) {
    if (typeof D != "object" && typeof D != "function" && D != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, D, B, "setState");
  }, k.prototype.forceUpdate = function(D) {
    this.updater.enqueueForceUpdate(this, D, "forceUpdate");
  };
  function A() {
  }
  A.prototype = k.prototype;
  function E(D, B, ce) {
    this.props = D, this.context = B, this.refs = x, this.updater = ce || S;
  }
  var R = E.prototype = new A();
  R.constructor = E, w(R, k.prototype), R.isPureReactComponent = !0;
  var N = Array.isArray, j = Object.prototype.hasOwnProperty, L = { current: null }, V = { key: !0, ref: !0, __self: !0, __source: !0 };
  function G(D, B, ce) {
    var pe, me = {}, ye = null, Ce = null;
    if (B != null) for (pe in B.ref !== void 0 && (Ce = B.ref), B.key !== void 0 && (ye = "" + B.key), B) j.call(B, pe) && !V.hasOwnProperty(pe) && (me[pe] = B[pe]);
    var we = arguments.length - 2;
    if (we === 1) me.children = ce;
    else if (1 < we) {
      for (var be = Array(we), mt = 0; mt < we; mt++) be[mt] = arguments[mt + 2];
      me.children = be;
    }
    if (D && D.defaultProps) for (pe in we = D.defaultProps, we) me[pe] === void 0 && (me[pe] = we[pe]);
    return { $$typeof: e, type: D, key: ye, ref: Ce, props: me, _owner: L.current };
  }
  function K(D, B) {
    return { $$typeof: e, type: D.type, key: B, ref: D.ref, props: D.props, _owner: D._owner };
  }
  function X(D) {
    return typeof D == "object" && D !== null && D.$$typeof === e;
  }
  function ae(D) {
    var B = { "=": "=0", ":": "=2" };
    return "$" + D.replace(/[=:]/g, function(ce) {
      return B[ce];
    });
  }
  var q = /\/+/g;
  function de(D, B) {
    return typeof D == "object" && D !== null && D.key != null ? ae("" + D.key) : B.toString(36);
  }
  function ue(D, B, ce, pe, me) {
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
    if (Ce) return Ce = D, me = me(Ce), D = pe === "" ? "." + de(Ce, 0) : pe, N(me) ? (ce = "", D != null && (ce = D.replace(q, "$&/") + "/"), ue(me, B, ce, "", function(mt) {
      return mt;
    })) : me != null && (X(me) && (me = K(me, ce + (!me.key || Ce && Ce.key === me.key ? "" : ("" + me.key).replace(q, "$&/") + "/") + D)), B.push(me)), 1;
    if (Ce = 0, pe = pe === "" ? "." : pe + ":", N(D)) for (var we = 0; we < D.length; we++) {
      ye = D[we];
      var be = pe + de(ye, we);
      Ce += ue(ye, B, ce, be, me);
    }
    else if (be = f(D), typeof be == "function") for (D = be.call(D), we = 0; !(ye = D.next()).done; ) ye = ye.value, be = pe + de(ye, we++), Ce += ue(ye, B, ce, be, me);
    else if (ye === "object") throw B = String(D), Error("Objects are not valid as a React child (found: " + (B === "[object Object]" ? "object with keys {" + Object.keys(D).join(", ") + "}" : B) + "). If you meant to render a collection of children, use an array instead.");
    return Ce;
  }
  function xe(D, B, ce) {
    if (D == null) return D;
    var pe = [], me = 0;
    return ue(D, pe, "", "", function(ye) {
      return B.call(ce, ye, me++);
    }), pe;
  }
  function ve(D) {
    if (D._status === -1) {
      var B = D._result;
      B = B(), B.then(function(ce) {
        (D._status === 0 || D._status === -1) && (D._status = 1, D._result = ce);
      }, function(ce) {
        (D._status === 0 || D._status === -1) && (D._status = 2, D._result = ce);
      }), D._status === -1 && (D._status = 0, D._result = B);
    }
    if (D._status === 1) return D._result.default;
    throw D._result;
  }
  var Se = { current: null }, $ = { transition: null }, Z = { ReactCurrentDispatcher: Se, ReactCurrentBatchConfig: $, ReactCurrentOwner: L };
  function Y() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return fe.Children = { map: xe, forEach: function(D, B, ce) {
    xe(D, function() {
      B.apply(this, arguments);
    }, ce);
  }, count: function(D) {
    var B = 0;
    return xe(D, function() {
      B++;
    }), B;
  }, toArray: function(D) {
    return xe(D, function(B) {
      return B;
    }) || [];
  }, only: function(D) {
    if (!X(D)) throw Error("React.Children.only expected to receive a single React element child.");
    return D;
  } }, fe.Component = k, fe.Fragment = o, fe.Profiler = a, fe.PureComponent = E, fe.StrictMode = i, fe.Suspense = m, fe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Z, fe.act = Y, fe.cloneElement = function(D, B, ce) {
    if (D == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + D + ".");
    var pe = w({}, D.props), me = D.key, ye = D.ref, Ce = D._owner;
    if (B != null) {
      if (B.ref !== void 0 && (ye = B.ref, Ce = L.current), B.key !== void 0 && (me = "" + B.key), D.type && D.type.defaultProps) var we = D.type.defaultProps;
      for (be in B) j.call(B, be) && !V.hasOwnProperty(be) && (pe[be] = B[be] === void 0 && we !== void 0 ? we[be] : B[be]);
    }
    var be = arguments.length - 2;
    if (be === 1) pe.children = ce;
    else if (1 < be) {
      we = Array(be);
      for (var mt = 0; mt < be; mt++) we[mt] = arguments[mt + 2];
      pe.children = we;
    }
    return { $$typeof: e, type: D.type, key: me, ref: ye, props: pe, _owner: Ce };
  }, fe.createContext = function(D) {
    return D = { $$typeof: d, _currentValue: D, _currentValue2: D, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, D.Provider = { $$typeof: c, _context: D }, D.Consumer = D;
  }, fe.createElement = G, fe.createFactory = function(D) {
    var B = G.bind(null, D);
    return B.type = D, B;
  }, fe.createRef = function() {
    return { current: null };
  }, fe.forwardRef = function(D) {
    return { $$typeof: p, render: D };
  }, fe.isValidElement = X, fe.lazy = function(D) {
    return { $$typeof: v, _payload: { _status: -1, _result: D }, _init: ve };
  }, fe.memo = function(D, B) {
    return { $$typeof: g, type: D, compare: B === void 0 ? null : B };
  }, fe.startTransition = function(D) {
    var B = $.transition;
    $.transition = {};
    try {
      D();
    } finally {
      $.transition = B;
    }
  }, fe.unstable_act = Y, fe.useCallback = function(D, B) {
    return Se.current.useCallback(D, B);
  }, fe.useContext = function(D) {
    return Se.current.useContext(D);
  }, fe.useDebugValue = function() {
  }, fe.useDeferredValue = function(D) {
    return Se.current.useDeferredValue(D);
  }, fe.useEffect = function(D, B) {
    return Se.current.useEffect(D, B);
  }, fe.useId = function() {
    return Se.current.useId();
  }, fe.useImperativeHandle = function(D, B, ce) {
    return Se.current.useImperativeHandle(D, B, ce);
  }, fe.useInsertionEffect = function(D, B) {
    return Se.current.useInsertionEffect(D, B);
  }, fe.useLayoutEffect = function(D, B) {
    return Se.current.useLayoutEffect(D, B);
  }, fe.useMemo = function(D, B) {
    return Se.current.useMemo(D, B);
  }, fe.useReducer = function(D, B, ce) {
    return Se.current.useReducer(D, B, ce);
  }, fe.useRef = function(D) {
    return Se.current.useRef(D);
  }, fe.useState = function(D) {
    return Se.current.useState(D);
  }, fe.useSyncExternalStore = function(D, B, ce) {
    return Se.current.useSyncExternalStore(D, B, ce);
  }, fe.useTransition = function() {
    return Se.current.useTransition();
  }, fe.version = "18.3.1", fe;
}
var nm;
function cd() {
  return nm || (nm = 1, Ou.exports = O_()), Ou.exports;
}
var C = cd();
const pn = /* @__PURE__ */ cg(C), _r = /* @__PURE__ */ b_({
  __proto__: null,
  default: pn
}, [C]);
var zs = {}, ju = { exports: {} }, pt = {}, Lu = { exports: {} }, Vu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var rm;
function j_() {
  return rm || (rm = 1, (function(e) {
    function n($, Z) {
      var Y = $.length;
      $.push(Z);
      e: for (; 0 < Y; ) {
        var D = Y - 1 >>> 1, B = $[D];
        if (0 < a(B, Z)) $[D] = Z, $[Y] = B, Y = D;
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
        e: for (var D = 0, B = $.length, ce = B >>> 1; D < ce; ) {
          var pe = 2 * (D + 1) - 1, me = $[pe], ye = pe + 1, Ce = $[ye];
          if (0 > a(me, Y)) ye < B && 0 > a(Ce, me) ? ($[D] = Ce, $[ye] = Y, D = ye) : ($[D] = me, $[pe] = Y, D = pe);
          else if (ye < B && 0 > a(Ce, Y)) $[D] = Ce, $[ye] = Y, D = ye;
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
    var m = [], g = [], v = 1, l = null, f = 3, S = !1, w = !1, x = !1, k = typeof setTimeout == "function" ? setTimeout : null, A = typeof clearTimeout == "function" ? clearTimeout : null, E = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function R($) {
      for (var Z = o(g); Z !== null; ) {
        if (Z.callback === null) i(g);
        else if (Z.startTime <= $) i(g), Z.sortIndex = Z.expirationTime, n(m, Z);
        else break;
        Z = o(g);
      }
    }
    function N($) {
      if (x = !1, R($), !w) if (o(m) !== null) w = !0, ve(j);
      else {
        var Z = o(g);
        Z !== null && Se(N, Z.startTime - $);
      }
    }
    function j($, Z) {
      w = !1, x && (x = !1, A(G), G = -1), S = !0;
      var Y = f;
      try {
        for (R(Z), l = o(m); l !== null && (!(l.expirationTime > Z) || $ && !ae()); ) {
          var D = l.callback;
          if (typeof D == "function") {
            l.callback = null, f = l.priorityLevel;
            var B = D(l.expirationTime <= Z);
            Z = e.unstable_now(), typeof B == "function" ? l.callback = B : l === o(m) && i(m), R(Z);
          } else i(m);
          l = o(m);
        }
        if (l !== null) var ce = !0;
        else {
          var pe = o(g);
          pe !== null && Se(N, pe.startTime - Z), ce = !1;
        }
        return ce;
      } finally {
        l = null, f = Y, S = !1;
      }
    }
    var L = !1, V = null, G = -1, K = 5, X = -1;
    function ae() {
      return !(e.unstable_now() - X < K);
    }
    function q() {
      if (V !== null) {
        var $ = e.unstable_now();
        X = $;
        var Z = !0;
        try {
          Z = V(!0, $);
        } finally {
          Z ? de() : (L = !1, V = null);
        }
      } else L = !1;
    }
    var de;
    if (typeof E == "function") de = function() {
      E(q);
    };
    else if (typeof MessageChannel < "u") {
      var ue = new MessageChannel(), xe = ue.port2;
      ue.port1.onmessage = q, de = function() {
        xe.postMessage(null);
      };
    } else de = function() {
      k(q, 0);
    };
    function ve($) {
      V = $, L || (L = !0, de());
    }
    function Se($, Z) {
      G = k(function() {
        $(e.unstable_now());
      }, Z);
    }
    e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function($) {
      $.callback = null;
    }, e.unstable_continueExecution = function() {
      w || S || (w = !0, ve(j));
    }, e.unstable_forceFrameRate = function($) {
      0 > $ || 125 < $ ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : K = 0 < $ ? Math.floor(1e3 / $) : 5;
    }, e.unstable_getCurrentPriorityLevel = function() {
      return f;
    }, e.unstable_getFirstCallbackNode = function() {
      return o(m);
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
          var B = -1;
          break;
        case 2:
          B = 250;
          break;
        case 5:
          B = 1073741823;
          break;
        case 4:
          B = 1e4;
          break;
        default:
          B = 5e3;
      }
      return B = Y + B, $ = { id: v++, callback: Z, priorityLevel: $, startTime: Y, expirationTime: B, sortIndex: -1 }, Y > D ? ($.sortIndex = Y, n(g, $), o(m) === null && $ === o(g) && (x ? (A(G), G = -1) : x = !0, Se(N, Y - D))) : ($.sortIndex = B, n(m, $), w || S || (w = !0, ve(j))), $;
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
  })(Vu)), Vu;
}
var om;
function L_() {
  return om || (om = 1, Lu.exports = j_()), Lu.exports;
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
var im;
function V_() {
  if (im) return pt;
  im = 1;
  var e = cd(), n = L_();
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
  function x(t, r, s, u, h, y, _) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = u, this.attributeNamespace = h, this.mustUseProperty = s, this.propertyName = t, this.type = r, this.sanitizeURL = y, this.removeEmptyString = _;
  }
  var k = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t) {
    k[t] = new x(t, 0, !1, t, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(t) {
    var r = t[0];
    k[r] = new x(r, 1, !1, t[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(t) {
    k[t] = new x(t, 2, !1, t.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(t) {
    k[t] = new x(t, 2, !1, t, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t) {
    k[t] = new x(t, 3, !1, t.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(t) {
    k[t] = new x(t, 3, !0, t, null, !1, !1);
  }), ["capture", "download"].forEach(function(t) {
    k[t] = new x(t, 4, !1, t, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(t) {
    k[t] = new x(t, 6, !1, t, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(t) {
    k[t] = new x(t, 5, !1, t.toLowerCase(), null, !1, !1);
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
    k[r] = new x(r, 1, !1, t, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t) {
    var r = t.replace(A, E);
    k[r] = new x(r, 1, !1, t, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(t) {
    var r = t.replace(A, E);
    k[r] = new x(r, 1, !1, t, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(t) {
    k[t] = new x(t, 1, !1, t.toLowerCase(), null, !1, !1);
  }), k.xlinkHref = new x("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(t) {
    k[t] = new x(t, 1, !1, t.toLowerCase(), null, !0, !0);
  });
  function R(t, r, s, u) {
    var h = k.hasOwnProperty(r) ? k[r] : null;
    (h !== null ? h.type !== 0 : u || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (w(r, s, h, u) && (s = null), u || h === null ? f(r) && (s === null ? t.removeAttribute(r) : t.setAttribute(r, "" + s)) : h.mustUseProperty ? t[h.propertyName] = s === null ? h.type === 3 ? !1 : "" : s : (r = h.attributeName, u = h.attributeNamespace, s === null ? t.removeAttribute(r) : (h = h.type, s = h === 3 || h === 4 && s === !0 ? "" : "" + s, u ? t.setAttributeNS(u, r, s) : t.setAttribute(r, s))));
  }
  var N = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, j = Symbol.for("react.element"), L = Symbol.for("react.portal"), V = Symbol.for("react.fragment"), G = Symbol.for("react.strict_mode"), K = Symbol.for("react.profiler"), X = Symbol.for("react.provider"), ae = Symbol.for("react.context"), q = Symbol.for("react.forward_ref"), de = Symbol.for("react.suspense"), ue = Symbol.for("react.suspense_list"), xe = Symbol.for("react.memo"), ve = Symbol.for("react.lazy"), Se = Symbol.for("react.offscreen"), $ = Symbol.iterator;
  function Z(t) {
    return t === null || typeof t != "object" ? null : (t = $ && t[$] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var Y = Object.assign, D;
  function B(t) {
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
        for (var h = O.stack.split(`
`), y = u.stack.split(`
`), _ = h.length - 1, P = y.length - 1; 1 <= _ && 0 <= P && h[_] !== y[P]; ) P--;
        for (; 1 <= _ && 0 <= P; _--, P--) if (h[_] !== y[P]) {
          if (_ !== 1 || P !== 1)
            do
              if (_--, P--, 0 > P || h[_] !== y[P]) {
                var M = `
` + h[_].replace(" at new ", " at ");
                return t.displayName && M.includes("<anonymous>") && (M = M.replace("<anonymous>", t.displayName)), M;
              }
            while (1 <= _ && 0 <= P);
          break;
        }
      }
    } finally {
      ce = !1, Error.prepareStackTrace = s;
    }
    return (t = t ? t.displayName || t.name : "") ? B(t) : "";
  }
  function me(t) {
    switch (t.tag) {
      case 5:
        return B(t.type);
      case 16:
        return B("Lazy");
      case 13:
        return B("Suspense");
      case 19:
        return B("SuspenseList");
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
      case V:
        return "Fragment";
      case L:
        return "Portal";
      case K:
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
      case xe:
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
  function be(t) {
    var r = t.type;
    return (t = t.nodeName) && t.toLowerCase() === "input" && (r === "checkbox" || r === "radio");
  }
  function mt(t) {
    var r = be(t) ? "checked" : "value", s = Object.getOwnPropertyDescriptor(t.constructor.prototype, r), u = "" + t[r];
    if (!t.hasOwnProperty(r) && typeof s < "u" && typeof s.get == "function" && typeof s.set == "function") {
      var h = s.get, y = s.set;
      return Object.defineProperty(t, r, { configurable: !0, get: function() {
        return h.call(this);
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
    t._valueTracker || (t._valueTracker = mt(t));
  }
  function rf(t) {
    if (!t) return !1;
    var r = t._valueTracker;
    if (!r) return !0;
    var s = r.getValue(), u = "";
    return t && (u = be(t) ? t.checked ? "true" : "false" : t.value), t = u, t !== s ? (r.setValue(t), !0) : !1;
  }
  function Ri(t) {
    if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u") return null;
    try {
      return t.activeElement || t.body;
    } catch {
      return t.body;
    }
  }
  function $a(t, r) {
    var s = r.checked;
    return Y({}, r, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: s ?? t._wrapperState.initialChecked });
  }
  function of(t, r) {
    var s = r.defaultValue == null ? "" : r.defaultValue, u = r.checked != null ? r.checked : r.defaultChecked;
    s = we(r.value != null ? r.value : s), t._wrapperState = { initialChecked: u, initialValue: s, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function sf(t, r) {
    r = r.checked, r != null && R(t, "checked", r, !1);
  }
  function Ha(t, r) {
    sf(t, r);
    var s = we(r.value), u = r.type;
    if (s != null) u === "number" ? (s === 0 && t.value === "" || t.value != s) && (t.value = "" + s) : t.value !== "" + s && (t.value = "" + s);
    else if (u === "submit" || u === "reset") {
      t.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? Wa(t, r.type, s) : r.hasOwnProperty("defaultValue") && Wa(t, r.type, we(r.defaultValue)), r.checked == null && r.defaultChecked != null && (t.defaultChecked = !!r.defaultChecked);
  }
  function af(t, r, s) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var u = r.type;
      if (!(u !== "submit" && u !== "reset" || r.value !== void 0 && r.value !== null)) return;
      r = "" + t._wrapperState.initialValue, s || r === t.value || (t.value = r), t.defaultValue = r;
    }
    s = t.name, s !== "" && (t.name = ""), t.defaultChecked = !!t._wrapperState.initialChecked, s !== "" && (t.name = s);
  }
  function Wa(t, r, s) {
    (r !== "number" || Ri(t.ownerDocument) !== t) && (s == null ? t.defaultValue = "" + t._wrapperState.initialValue : t.defaultValue !== "" + s && (t.defaultValue = "" + s));
  }
  var yo = Array.isArray;
  function Tr(t, r, s, u) {
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
  function Ga(t, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(o(91));
    return Y({}, r, { value: void 0, defaultValue: void 0, children: "" + t._wrapperState.initialValue });
  }
  function lf(t, r) {
    var s = r.value;
    if (s == null) {
      if (s = r.children, r = r.defaultValue, s != null) {
        if (r != null) throw Error(o(92));
        if (yo(s)) {
          if (1 < s.length) throw Error(o(93));
          s = s[0];
        }
        r = s;
      }
      r == null && (r = ""), s = r;
    }
    t._wrapperState = { initialValue: we(s) };
  }
  function uf(t, r) {
    var s = we(r.value), u = we(r.defaultValue);
    s != null && (s = "" + s, s !== t.value && (t.value = s), r.defaultValue == null && t.defaultValue !== s && (t.defaultValue = s)), u != null && (t.defaultValue = "" + u);
  }
  function cf(t) {
    var r = t.textContent;
    r === t._wrapperState.initialValue && r !== "" && r !== null && (t.value = r);
  }
  function df(t) {
    switch (t) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Ka(t, r) {
    return t == null || t === "http://www.w3.org/1999/xhtml" ? df(r) : t === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : t;
  }
  var Di, ff = (function(t) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, s, u, h) {
      MSApp.execUnsafeLocalFunction(function() {
        return t(r, s, u, h);
      });
    } : t;
  })(function(t, r) {
    if (t.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in t) t.innerHTML = r;
    else {
      for (Di = Di || document.createElement("div"), Di.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>", r = Di.firstChild; t.firstChild; ) t.removeChild(t.firstChild);
      for (; r.firstChild; ) t.appendChild(r.firstChild);
    }
  });
  function go(t, r) {
    if (r) {
      var s = t.firstChild;
      if (s && s === t.lastChild && s.nodeType === 3) {
        s.nodeValue = r;
        return;
      }
    }
    t.textContent = r;
  }
  var vo = {
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
  }, IS = ["Webkit", "ms", "Moz", "O"];
  Object.keys(vo).forEach(function(t) {
    IS.forEach(function(r) {
      r = r + t.charAt(0).toUpperCase() + t.substring(1), vo[r] = vo[t];
    });
  });
  function pf(t, r, s) {
    return r == null || typeof r == "boolean" || r === "" ? "" : s || typeof r != "number" || r === 0 || vo.hasOwnProperty(t) && vo[t] ? ("" + r).trim() : r + "px";
  }
  function hf(t, r) {
    t = t.style;
    for (var s in r) if (r.hasOwnProperty(s)) {
      var u = s.indexOf("--") === 0, h = pf(s, r[s], u);
      s === "float" && (s = "cssFloat"), u ? t.setProperty(s, h) : t[s] = h;
    }
  }
  var FS = Y({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Ya(t, r) {
    if (r) {
      if (FS[t] && (r.children != null || r.dangerouslySetInnerHTML != null)) throw Error(o(137, t));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null) throw Error(o(60));
        if (typeof r.dangerouslySetInnerHTML != "object" || !("__html" in r.dangerouslySetInnerHTML)) throw Error(o(61));
      }
      if (r.style != null && typeof r.style != "object") throw Error(o(62));
    }
  }
  function Qa(t, r) {
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
  var Xa = null;
  function Za(t) {
    return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
  }
  var Ja = null, kr = null, Ar = null;
  function mf(t) {
    if (t = Bo(t)) {
      if (typeof Ja != "function") throw Error(o(280));
      var r = t.stateNode;
      r && (r = ts(r), Ja(t.stateNode, t.type, r));
    }
  }
  function yf(t) {
    kr ? Ar ? Ar.push(t) : Ar = [t] : kr = t;
  }
  function gf() {
    if (kr) {
      var t = kr, r = Ar;
      if (Ar = kr = null, mf(t), r) for (t = 0; t < r.length; t++) mf(r[t]);
    }
  }
  function vf(t, r) {
    return t(r);
  }
  function Sf() {
  }
  var qa = !1;
  function wf(t, r, s) {
    if (qa) return t(r, s);
    qa = !0;
    try {
      return vf(t, r, s);
    } finally {
      qa = !1, (kr !== null || Ar !== null) && (Sf(), gf());
    }
  }
  function So(t, r) {
    var s = t.stateNode;
    if (s === null) return null;
    var u = ts(s);
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
  var el = !1;
  if (p) try {
    var wo = {};
    Object.defineProperty(wo, "passive", { get: function() {
      el = !0;
    } }), window.addEventListener("test", wo, wo), window.removeEventListener("test", wo, wo);
  } catch {
    el = !1;
  }
  function OS(t, r, s, u, h, y, _, P, M) {
    var O = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(s, O);
    } catch (U) {
      this.onError(U);
    }
  }
  var _o = !1, Ni = null, Ii = !1, tl = null, jS = { onError: function(t) {
    _o = !0, Ni = t;
  } };
  function LS(t, r, s, u, h, y, _, P, M) {
    _o = !1, Ni = null, OS.apply(jS, arguments);
  }
  function VS(t, r, s, u, h, y, _, P, M) {
    if (LS.apply(this, arguments), _o) {
      if (_o) {
        var O = Ni;
        _o = !1, Ni = null;
      } else throw Error(o(198));
      Ii || (Ii = !0, tl = O);
    }
  }
  function Kn(t) {
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
  function xf(t) {
    if (Kn(t) !== t) throw Error(o(188));
  }
  function BS(t) {
    var r = t.alternate;
    if (!r) {
      if (r = Kn(t), r === null) throw Error(o(188));
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
          if (y === s) return xf(h), t;
          if (y === u) return xf(h), r;
          y = y.sibling;
        }
        throw Error(o(188));
      }
      if (s.return !== u.return) s = h, u = y;
      else {
        for (var _ = !1, P = h.child; P; ) {
          if (P === s) {
            _ = !0, s = h, u = y;
            break;
          }
          if (P === u) {
            _ = !0, u = h, s = y;
            break;
          }
          P = P.sibling;
        }
        if (!_) {
          for (P = y.child; P; ) {
            if (P === s) {
              _ = !0, s = y, u = h;
              break;
            }
            if (P === u) {
              _ = !0, u = y, s = h;
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
  function Tf(t) {
    return t = BS(t), t !== null ? kf(t) : null;
  }
  function kf(t) {
    if (t.tag === 5 || t.tag === 6) return t;
    for (t = t.child; t !== null; ) {
      var r = kf(t);
      if (r !== null) return r;
      t = t.sibling;
    }
    return null;
  }
  var Af = n.unstable_scheduleCallback, Cf = n.unstable_cancelCallback, zS = n.unstable_shouldYield, US = n.unstable_requestPaint, Oe = n.unstable_now, $S = n.unstable_getCurrentPriorityLevel, nl = n.unstable_ImmediatePriority, Pf = n.unstable_UserBlockingPriority, Fi = n.unstable_NormalPriority, HS = n.unstable_LowPriority, Ef = n.unstable_IdlePriority, Oi = null, Ut = null;
  function WS(t) {
    if (Ut && typeof Ut.onCommitFiberRoot == "function") try {
      Ut.onCommitFiberRoot(Oi, t, void 0, (t.current.flags & 128) === 128);
    } catch {
    }
  }
  var Rt = Math.clz32 ? Math.clz32 : YS, GS = Math.log, KS = Math.LN2;
  function YS(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (GS(t) / KS | 0) | 0;
  }
  var ji = 64, Li = 4194304;
  function xo(t) {
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
  function Vi(t, r) {
    var s = t.pendingLanes;
    if (s === 0) return 0;
    var u = 0, h = t.suspendedLanes, y = t.pingedLanes, _ = s & 268435455;
    if (_ !== 0) {
      var P = _ & ~h;
      P !== 0 ? u = xo(P) : (y &= _, y !== 0 && (u = xo(y)));
    } else _ = s & ~h, _ !== 0 ? u = xo(_) : y !== 0 && (u = xo(y));
    if (u === 0) return 0;
    if (r !== 0 && r !== u && (r & h) === 0 && (h = u & -u, y = r & -r, h >= y || h === 16 && (y & 4194240) !== 0)) return r;
    if ((u & 4) !== 0 && (u |= s & 16), r = t.entangledLanes, r !== 0) for (t = t.entanglements, r &= u; 0 < r; ) s = 31 - Rt(r), h = 1 << s, u |= t[s], r &= ~h;
    return u;
  }
  function QS(t, r) {
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
  function XS(t, r) {
    for (var s = t.suspendedLanes, u = t.pingedLanes, h = t.expirationTimes, y = t.pendingLanes; 0 < y; ) {
      var _ = 31 - Rt(y), P = 1 << _, M = h[_];
      M === -1 ? ((P & s) === 0 || (P & u) !== 0) && (h[_] = QS(P, r)) : M <= r && (t.expiredLanes |= P), y &= ~P;
    }
  }
  function rl(t) {
    return t = t.pendingLanes & -1073741825, t !== 0 ? t : t & 1073741824 ? 1073741824 : 0;
  }
  function Mf() {
    var t = ji;
    return ji <<= 1, (ji & 4194240) === 0 && (ji = 64), t;
  }
  function ol(t) {
    for (var r = [], s = 0; 31 > s; s++) r.push(t);
    return r;
  }
  function To(t, r, s) {
    t.pendingLanes |= r, r !== 536870912 && (t.suspendedLanes = 0, t.pingedLanes = 0), t = t.eventTimes, r = 31 - Rt(r), t[r] = s;
  }
  function ZS(t, r) {
    var s = t.pendingLanes & ~r;
    t.pendingLanes = r, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= r, t.mutableReadLanes &= r, t.entangledLanes &= r, r = t.entanglements;
    var u = t.eventTimes;
    for (t = t.expirationTimes; 0 < s; ) {
      var h = 31 - Rt(s), y = 1 << h;
      r[h] = 0, u[h] = -1, t[h] = -1, s &= ~y;
    }
  }
  function il(t, r) {
    var s = t.entangledLanes |= r;
    for (t = t.entanglements; s; ) {
      var u = 31 - Rt(s), h = 1 << u;
      h & r | t[u] & r && (t[u] |= r), s &= ~h;
    }
  }
  var _e = 0;
  function bf(t) {
    return t &= -t, 1 < t ? 4 < t ? (t & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Rf, sl, Df, Nf, If, al = !1, Bi = [], yn = null, gn = null, vn = null, ko = /* @__PURE__ */ new Map(), Ao = /* @__PURE__ */ new Map(), Sn = [], JS = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function Ff(t, r) {
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
        ko.delete(r.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Ao.delete(r.pointerId);
    }
  }
  function Co(t, r, s, u, h, y) {
    return t === null || t.nativeEvent !== y ? (t = { blockedOn: r, domEventName: s, eventSystemFlags: u, nativeEvent: y, targetContainers: [h] }, r !== null && (r = Bo(r), r !== null && sl(r)), t) : (t.eventSystemFlags |= u, r = t.targetContainers, h !== null && r.indexOf(h) === -1 && r.push(h), t);
  }
  function qS(t, r, s, u, h) {
    switch (r) {
      case "focusin":
        return yn = Co(yn, t, r, s, u, h), !0;
      case "dragenter":
        return gn = Co(gn, t, r, s, u, h), !0;
      case "mouseover":
        return vn = Co(vn, t, r, s, u, h), !0;
      case "pointerover":
        var y = h.pointerId;
        return ko.set(y, Co(ko.get(y) || null, t, r, s, u, h)), !0;
      case "gotpointercapture":
        return y = h.pointerId, Ao.set(y, Co(Ao.get(y) || null, t, r, s, u, h)), !0;
    }
    return !1;
  }
  function Of(t) {
    var r = Yn(t.target);
    if (r !== null) {
      var s = Kn(r);
      if (s !== null) {
        if (r = s.tag, r === 13) {
          if (r = _f(s), r !== null) {
            t.blockedOn = r, If(t.priority, function() {
              Df(s);
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
  function zi(t) {
    if (t.blockedOn !== null) return !1;
    for (var r = t.targetContainers; 0 < r.length; ) {
      var s = ul(t.domEventName, t.eventSystemFlags, r[0], t.nativeEvent);
      if (s === null) {
        s = t.nativeEvent;
        var u = new s.constructor(s.type, s);
        Xa = u, s.target.dispatchEvent(u), Xa = null;
      } else return r = Bo(s), r !== null && sl(r), t.blockedOn = s, !1;
      r.shift();
    }
    return !0;
  }
  function jf(t, r, s) {
    zi(t) && s.delete(r);
  }
  function ew() {
    al = !1, yn !== null && zi(yn) && (yn = null), gn !== null && zi(gn) && (gn = null), vn !== null && zi(vn) && (vn = null), ko.forEach(jf), Ao.forEach(jf);
  }
  function Po(t, r) {
    t.blockedOn === r && (t.blockedOn = null, al || (al = !0, n.unstable_scheduleCallback(n.unstable_NormalPriority, ew)));
  }
  function Eo(t) {
    function r(h) {
      return Po(h, t);
    }
    if (0 < Bi.length) {
      Po(Bi[0], t);
      for (var s = 1; s < Bi.length; s++) {
        var u = Bi[s];
        u.blockedOn === t && (u.blockedOn = null);
      }
    }
    for (yn !== null && Po(yn, t), gn !== null && Po(gn, t), vn !== null && Po(vn, t), ko.forEach(r), Ao.forEach(r), s = 0; s < Sn.length; s++) u = Sn[s], u.blockedOn === t && (u.blockedOn = null);
    for (; 0 < Sn.length && (s = Sn[0], s.blockedOn === null); ) Of(s), s.blockedOn === null && Sn.shift();
  }
  var Cr = N.ReactCurrentBatchConfig, Ui = !0;
  function tw(t, r, s, u) {
    var h = _e, y = Cr.transition;
    Cr.transition = null;
    try {
      _e = 1, ll(t, r, s, u);
    } finally {
      _e = h, Cr.transition = y;
    }
  }
  function nw(t, r, s, u) {
    var h = _e, y = Cr.transition;
    Cr.transition = null;
    try {
      _e = 4, ll(t, r, s, u);
    } finally {
      _e = h, Cr.transition = y;
    }
  }
  function ll(t, r, s, u) {
    if (Ui) {
      var h = ul(t, r, s, u);
      if (h === null) Cl(t, r, u, $i, s), Ff(t, u);
      else if (qS(h, t, r, s, u)) u.stopPropagation();
      else if (Ff(t, u), r & 4 && -1 < JS.indexOf(t)) {
        for (; h !== null; ) {
          var y = Bo(h);
          if (y !== null && Rf(y), y = ul(t, r, s, u), y === null && Cl(t, r, u, $i, s), y === h) break;
          h = y;
        }
        h !== null && u.stopPropagation();
      } else Cl(t, r, u, null, s);
    }
  }
  var $i = null;
  function ul(t, r, s, u) {
    if ($i = null, t = Za(u), t = Yn(t), t !== null) if (r = Kn(t), r === null) t = null;
    else if (s = r.tag, s === 13) {
      if (t = _f(r), t !== null) return t;
      t = null;
    } else if (s === 3) {
      if (r.stateNode.current.memoizedState.isDehydrated) return r.tag === 3 ? r.stateNode.containerInfo : null;
      t = null;
    } else r !== t && (t = null);
    return $i = t, null;
  }
  function Lf(t) {
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
        switch ($S()) {
          case nl:
            return 1;
          case Pf:
            return 4;
          case Fi:
          case HS:
            return 16;
          case Ef:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var wn = null, cl = null, Hi = null;
  function Vf() {
    if (Hi) return Hi;
    var t, r = cl, s = r.length, u, h = "value" in wn ? wn.value : wn.textContent, y = h.length;
    for (t = 0; t < s && r[t] === h[t]; t++) ;
    var _ = s - t;
    for (u = 1; u <= _ && r[s - u] === h[y - u]; u++) ;
    return Hi = h.slice(t, 1 < u ? 1 - u : void 0);
  }
  function Wi(t) {
    var r = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && r === 13 && (t = 13)) : t = r, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function Gi() {
    return !0;
  }
  function Bf() {
    return !1;
  }
  function yt(t) {
    function r(s, u, h, y, _) {
      this._reactName = s, this._targetInst = h, this.type = u, this.nativeEvent = y, this.target = _, this.currentTarget = null;
      for (var P in t) t.hasOwnProperty(P) && (s = t[P], this[P] = s ? s(y) : y[P]);
      return this.isDefaultPrevented = (y.defaultPrevented != null ? y.defaultPrevented : y.returnValue === !1) ? Gi : Bf, this.isPropagationStopped = Bf, this;
    }
    return Y(r.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var s = this.nativeEvent;
      s && (s.preventDefault ? s.preventDefault() : typeof s.returnValue != "unknown" && (s.returnValue = !1), this.isDefaultPrevented = Gi);
    }, stopPropagation: function() {
      var s = this.nativeEvent;
      s && (s.stopPropagation ? s.stopPropagation() : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0), this.isPropagationStopped = Gi);
    }, persist: function() {
    }, isPersistent: Gi }), r;
  }
  var Pr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(t) {
    return t.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, dl = yt(Pr), Mo = Y({}, Pr, { view: 0, detail: 0 }), rw = yt(Mo), fl, pl, bo, Ki = Y({}, Mo, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: ml, button: 0, buttons: 0, relatedTarget: function(t) {
    return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
  }, movementX: function(t) {
    return "movementX" in t ? t.movementX : (t !== bo && (bo && t.type === "mousemove" ? (fl = t.screenX - bo.screenX, pl = t.screenY - bo.screenY) : pl = fl = 0, bo = t), fl);
  }, movementY: function(t) {
    return "movementY" in t ? t.movementY : pl;
  } }), zf = yt(Ki), ow = Y({}, Ki, { dataTransfer: 0 }), iw = yt(ow), sw = Y({}, Mo, { relatedTarget: 0 }), hl = yt(sw), aw = Y({}, Pr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), lw = yt(aw), uw = Y({}, Pr, { clipboardData: function(t) {
    return "clipboardData" in t ? t.clipboardData : window.clipboardData;
  } }), cw = yt(uw), dw = Y({}, Pr, { data: 0 }), Uf = yt(dw), fw = {
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
  }, pw = {
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
  }, hw = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function mw(t) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(t) : (t = hw[t]) ? !!r[t] : !1;
  }
  function ml() {
    return mw;
  }
  var yw = Y({}, Mo, { key: function(t) {
    if (t.key) {
      var r = fw[t.key] || t.key;
      if (r !== "Unidentified") return r;
    }
    return t.type === "keypress" ? (t = Wi(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? pw[t.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: ml, charCode: function(t) {
    return t.type === "keypress" ? Wi(t) : 0;
  }, keyCode: function(t) {
    return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  }, which: function(t) {
    return t.type === "keypress" ? Wi(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  } }), gw = yt(yw), vw = Y({}, Ki, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), $f = yt(vw), Sw = Y({}, Mo, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: ml }), ww = yt(Sw), _w = Y({}, Pr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), xw = yt(_w), Tw = Y({}, Ki, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), kw = yt(Tw), Aw = [9, 13, 27, 32], yl = p && "CompositionEvent" in window, Ro = null;
  p && "documentMode" in document && (Ro = document.documentMode);
  var Cw = p && "TextEvent" in window && !Ro, Hf = p && (!yl || Ro && 8 < Ro && 11 >= Ro), Wf = " ", Gf = !1;
  function Kf(t, r) {
    switch (t) {
      case "keyup":
        return Aw.indexOf(r.keyCode) !== -1;
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
  function Yf(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var Er = !1;
  function Pw(t, r) {
    switch (t) {
      case "compositionend":
        return Yf(r);
      case "keypress":
        return r.which !== 32 ? null : (Gf = !0, Wf);
      case "textInput":
        return t = r.data, t === Wf && Gf ? null : t;
      default:
        return null;
    }
  }
  function Ew(t, r) {
    if (Er) return t === "compositionend" || !yl && Kf(t, r) ? (t = Vf(), Hi = cl = wn = null, Er = !1, t) : null;
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
        return Hf && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var Mw = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Qf(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r === "input" ? !!Mw[t.type] : r === "textarea";
  }
  function Xf(t, r, s, u) {
    yf(u), r = Ji(r, "onChange"), 0 < r.length && (s = new dl("onChange", "change", null, s, u), t.push({ event: s, listeners: r }));
  }
  var Do = null, No = null;
  function bw(t) {
    hp(t, 0);
  }
  function Yi(t) {
    var r = Nr(t);
    if (rf(r)) return t;
  }
  function Rw(t, r) {
    if (t === "change") return r;
  }
  var Zf = !1;
  if (p) {
    var gl;
    if (p) {
      var vl = "oninput" in document;
      if (!vl) {
        var Jf = document.createElement("div");
        Jf.setAttribute("oninput", "return;"), vl = typeof Jf.oninput == "function";
      }
      gl = vl;
    } else gl = !1;
    Zf = gl && (!document.documentMode || 9 < document.documentMode);
  }
  function qf() {
    Do && (Do.detachEvent("onpropertychange", ep), No = Do = null);
  }
  function ep(t) {
    if (t.propertyName === "value" && Yi(No)) {
      var r = [];
      Xf(r, No, t, Za(t)), wf(bw, r);
    }
  }
  function Dw(t, r, s) {
    t === "focusin" ? (qf(), Do = r, No = s, Do.attachEvent("onpropertychange", ep)) : t === "focusout" && qf();
  }
  function Nw(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown") return Yi(No);
  }
  function Iw(t, r) {
    if (t === "click") return Yi(r);
  }
  function Fw(t, r) {
    if (t === "input" || t === "change") return Yi(r);
  }
  function Ow(t, r) {
    return t === r && (t !== 0 || 1 / t === 1 / r) || t !== t && r !== r;
  }
  var Dt = typeof Object.is == "function" ? Object.is : Ow;
  function Io(t, r) {
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
  function tp(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function np(t, r) {
    var s = tp(t);
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
      s = tp(s);
    }
  }
  function rp(t, r) {
    return t && r ? t === r ? !0 : t && t.nodeType === 3 ? !1 : r && r.nodeType === 3 ? rp(t, r.parentNode) : "contains" in t ? t.contains(r) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function op() {
    for (var t = window, r = Ri(); r instanceof t.HTMLIFrameElement; ) {
      try {
        var s = typeof r.contentWindow.location.href == "string";
      } catch {
        s = !1;
      }
      if (s) t = r.contentWindow;
      else break;
      r = Ri(t.document);
    }
    return r;
  }
  function Sl(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r && (r === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || r === "textarea" || t.contentEditable === "true");
  }
  function jw(t) {
    var r = op(), s = t.focusedElem, u = t.selectionRange;
    if (r !== s && s && s.ownerDocument && rp(s.ownerDocument.documentElement, s)) {
      if (u !== null && Sl(s)) {
        if (r = u.start, t = u.end, t === void 0 && (t = r), "selectionStart" in s) s.selectionStart = r, s.selectionEnd = Math.min(t, s.value.length);
        else if (t = (r = s.ownerDocument || document) && r.defaultView || window, t.getSelection) {
          t = t.getSelection();
          var h = s.textContent.length, y = Math.min(u.start, h);
          u = u.end === void 0 ? y : Math.min(u.end, h), !t.extend && y > u && (h = u, u = y, y = h), h = np(s, y);
          var _ = np(
            s,
            u
          );
          h && _ && (t.rangeCount !== 1 || t.anchorNode !== h.node || t.anchorOffset !== h.offset || t.focusNode !== _.node || t.focusOffset !== _.offset) && (r = r.createRange(), r.setStart(h.node, h.offset), t.removeAllRanges(), y > u ? (t.addRange(r), t.extend(_.node, _.offset)) : (r.setEnd(_.node, _.offset), t.addRange(r)));
        }
      }
      for (r = [], t = s; t = t.parentNode; ) t.nodeType === 1 && r.push({ element: t, left: t.scrollLeft, top: t.scrollTop });
      for (typeof s.focus == "function" && s.focus(), s = 0; s < r.length; s++) t = r[s], t.element.scrollLeft = t.left, t.element.scrollTop = t.top;
    }
  }
  var Lw = p && "documentMode" in document && 11 >= document.documentMode, Mr = null, wl = null, Fo = null, _l = !1;
  function ip(t, r, s) {
    var u = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument;
    _l || Mr == null || Mr !== Ri(u) || (u = Mr, "selectionStart" in u && Sl(u) ? u = { start: u.selectionStart, end: u.selectionEnd } : (u = (u.ownerDocument && u.ownerDocument.defaultView || window).getSelection(), u = { anchorNode: u.anchorNode, anchorOffset: u.anchorOffset, focusNode: u.focusNode, focusOffset: u.focusOffset }), Fo && Io(Fo, u) || (Fo = u, u = Ji(wl, "onSelect"), 0 < u.length && (r = new dl("onSelect", "select", null, r, s), t.push({ event: r, listeners: u }), r.target = Mr)));
  }
  function Qi(t, r) {
    var s = {};
    return s[t.toLowerCase()] = r.toLowerCase(), s["Webkit" + t] = "webkit" + r, s["Moz" + t] = "moz" + r, s;
  }
  var br = { animationend: Qi("Animation", "AnimationEnd"), animationiteration: Qi("Animation", "AnimationIteration"), animationstart: Qi("Animation", "AnimationStart"), transitionend: Qi("Transition", "TransitionEnd") }, xl = {}, sp = {};
  p && (sp = document.createElement("div").style, "AnimationEvent" in window || (delete br.animationend.animation, delete br.animationiteration.animation, delete br.animationstart.animation), "TransitionEvent" in window || delete br.transitionend.transition);
  function Xi(t) {
    if (xl[t]) return xl[t];
    if (!br[t]) return t;
    var r = br[t], s;
    for (s in r) if (r.hasOwnProperty(s) && s in sp) return xl[t] = r[s];
    return t;
  }
  var ap = Xi("animationend"), lp = Xi("animationiteration"), up = Xi("animationstart"), cp = Xi("transitionend"), dp = /* @__PURE__ */ new Map(), fp = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function _n(t, r) {
    dp.set(t, r), c(r, [t]);
  }
  for (var Tl = 0; Tl < fp.length; Tl++) {
    var kl = fp[Tl], Vw = kl.toLowerCase(), Bw = kl[0].toUpperCase() + kl.slice(1);
    _n(Vw, "on" + Bw);
  }
  _n(ap, "onAnimationEnd"), _n(lp, "onAnimationIteration"), _n(up, "onAnimationStart"), _n("dblclick", "onDoubleClick"), _n("focusin", "onFocus"), _n("focusout", "onBlur"), _n(cp, "onTransitionEnd"), d("onMouseEnter", ["mouseout", "mouseover"]), d("onMouseLeave", ["mouseout", "mouseover"]), d("onPointerEnter", ["pointerout", "pointerover"]), d("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Oo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), zw = new Set("cancel close invalid load scroll toggle".split(" ").concat(Oo));
  function pp(t, r, s) {
    var u = t.type || "unknown-event";
    t.currentTarget = s, VS(u, r, void 0, t), t.currentTarget = null;
  }
  function hp(t, r) {
    r = (r & 4) !== 0;
    for (var s = 0; s < t.length; s++) {
      var u = t[s], h = u.event;
      u = u.listeners;
      e: {
        var y = void 0;
        if (r) for (var _ = u.length - 1; 0 <= _; _--) {
          var P = u[_], M = P.instance, O = P.currentTarget;
          if (P = P.listener, M !== y && h.isPropagationStopped()) break e;
          pp(h, P, O), y = M;
        }
        else for (_ = 0; _ < u.length; _++) {
          if (P = u[_], M = P.instance, O = P.currentTarget, P = P.listener, M !== y && h.isPropagationStopped()) break e;
          pp(h, P, O), y = M;
        }
      }
    }
    if (Ii) throw t = tl, Ii = !1, tl = null, t;
  }
  function Ee(t, r) {
    var s = r[Dl];
    s === void 0 && (s = r[Dl] = /* @__PURE__ */ new Set());
    var u = t + "__bubble";
    s.has(u) || (mp(r, t, 2, !1), s.add(u));
  }
  function Al(t, r, s) {
    var u = 0;
    r && (u |= 4), mp(s, t, u, r);
  }
  var Zi = "_reactListening" + Math.random().toString(36).slice(2);
  function jo(t) {
    if (!t[Zi]) {
      t[Zi] = !0, i.forEach(function(s) {
        s !== "selectionchange" && (zw.has(s) || Al(s, !1, t), Al(s, !0, t));
      });
      var r = t.nodeType === 9 ? t : t.ownerDocument;
      r === null || r[Zi] || (r[Zi] = !0, Al("selectionchange", !1, r));
    }
  }
  function mp(t, r, s, u) {
    switch (Lf(r)) {
      case 1:
        var h = tw;
        break;
      case 4:
        h = nw;
        break;
      default:
        h = ll;
    }
    s = h.bind(null, r, s, t), h = void 0, !el || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (h = !0), u ? h !== void 0 ? t.addEventListener(r, s, { capture: !0, passive: h }) : t.addEventListener(r, s, !0) : h !== void 0 ? t.addEventListener(r, s, { passive: h }) : t.addEventListener(r, s, !1);
  }
  function Cl(t, r, s, u, h) {
    var y = u;
    if ((r & 1) === 0 && (r & 2) === 0 && u !== null) e: for (; ; ) {
      if (u === null) return;
      var _ = u.tag;
      if (_ === 3 || _ === 4) {
        var P = u.stateNode.containerInfo;
        if (P === h || P.nodeType === 8 && P.parentNode === h) break;
        if (_ === 4) for (_ = u.return; _ !== null; ) {
          var M = _.tag;
          if ((M === 3 || M === 4) && (M = _.stateNode.containerInfo, M === h || M.nodeType === 8 && M.parentNode === h)) return;
          _ = _.return;
        }
        for (; P !== null; ) {
          if (_ = Yn(P), _ === null) return;
          if (M = _.tag, M === 5 || M === 6) {
            u = y = _;
            continue e;
          }
          P = P.parentNode;
        }
      }
      u = u.return;
    }
    wf(function() {
      var O = y, U = Za(s), H = [];
      e: {
        var z = dp.get(t);
        if (z !== void 0) {
          var J = dl, te = t;
          switch (t) {
            case "keypress":
              if (Wi(s) === 0) break e;
            case "keydown":
            case "keyup":
              J = gw;
              break;
            case "focusin":
              te = "focus", J = hl;
              break;
            case "focusout":
              te = "blur", J = hl;
              break;
            case "beforeblur":
            case "afterblur":
              J = hl;
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
              J = zf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              J = iw;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              J = ww;
              break;
            case ap:
            case lp:
            case up:
              J = lw;
              break;
            case cp:
              J = xw;
              break;
            case "scroll":
              J = rw;
              break;
            case "wheel":
              J = kw;
              break;
            case "copy":
            case "cut":
            case "paste":
              J = cw;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              J = $f;
          }
          var re = (r & 4) !== 0, je = !re && t === "scroll", I = re ? z !== null ? z + "Capture" : null : z;
          re = [];
          for (var b = O, F; b !== null; ) {
            F = b;
            var W = F.stateNode;
            if (F.tag === 5 && W !== null && (F = W, I !== null && (W = So(b, I), W != null && re.push(Lo(b, W, F)))), je) break;
            b = b.return;
          }
          0 < re.length && (z = new J(z, te, null, s, U), H.push({ event: z, listeners: re }));
        }
      }
      if ((r & 7) === 0) {
        e: {
          if (z = t === "mouseover" || t === "pointerover", J = t === "mouseout" || t === "pointerout", z && s !== Xa && (te = s.relatedTarget || s.fromElement) && (Yn(te) || te[nn])) break e;
          if ((J || z) && (z = U.window === U ? U : (z = U.ownerDocument) ? z.defaultView || z.parentWindow : window, J ? (te = s.relatedTarget || s.toElement, J = O, te = te ? Yn(te) : null, te !== null && (je = Kn(te), te !== je || te.tag !== 5 && te.tag !== 6) && (te = null)) : (J = null, te = O), J !== te)) {
            if (re = zf, W = "onMouseLeave", I = "onMouseEnter", b = "mouse", (t === "pointerout" || t === "pointerover") && (re = $f, W = "onPointerLeave", I = "onPointerEnter", b = "pointer"), je = J == null ? z : Nr(J), F = te == null ? z : Nr(te), z = new re(W, b + "leave", J, s, U), z.target = je, z.relatedTarget = F, W = null, Yn(U) === O && (re = new re(I, b + "enter", te, s, U), re.target = F, re.relatedTarget = je, W = re), je = W, J && te) t: {
              for (re = J, I = te, b = 0, F = re; F; F = Rr(F)) b++;
              for (F = 0, W = I; W; W = Rr(W)) F++;
              for (; 0 < b - F; ) re = Rr(re), b--;
              for (; 0 < F - b; ) I = Rr(I), F--;
              for (; b--; ) {
                if (re === I || I !== null && re === I.alternate) break t;
                re = Rr(re), I = Rr(I);
              }
              re = null;
            }
            else re = null;
            J !== null && yp(H, z, J, re, !1), te !== null && je !== null && yp(H, je, te, re, !0);
          }
        }
        e: {
          if (z = O ? Nr(O) : window, J = z.nodeName && z.nodeName.toLowerCase(), J === "select" || J === "input" && z.type === "file") var oe = Rw;
          else if (Qf(z)) if (Zf) oe = Fw;
          else {
            oe = Nw;
            var ie = Dw;
          }
          else (J = z.nodeName) && J.toLowerCase() === "input" && (z.type === "checkbox" || z.type === "radio") && (oe = Iw);
          if (oe && (oe = oe(t, O))) {
            Xf(H, oe, s, U);
            break e;
          }
          ie && ie(t, z, O), t === "focusout" && (ie = z._wrapperState) && ie.controlled && z.type === "number" && Wa(z, "number", z.value);
        }
        switch (ie = O ? Nr(O) : window, t) {
          case "focusin":
            (Qf(ie) || ie.contentEditable === "true") && (Mr = ie, wl = O, Fo = null);
            break;
          case "focusout":
            Fo = wl = Mr = null;
            break;
          case "mousedown":
            _l = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            _l = !1, ip(H, s, U);
            break;
          case "selectionchange":
            if (Lw) break;
          case "keydown":
          case "keyup":
            ip(H, s, U);
        }
        var se;
        if (yl) e: {
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
        else Er ? Kf(t, s) && (le = "onCompositionEnd") : t === "keydown" && s.keyCode === 229 && (le = "onCompositionStart");
        le && (Hf && s.locale !== "ko" && (Er || le !== "onCompositionStart" ? le === "onCompositionEnd" && Er && (se = Vf()) : (wn = U, cl = "value" in wn ? wn.value : wn.textContent, Er = !0)), ie = Ji(O, le), 0 < ie.length && (le = new Uf(le, t, null, s, U), H.push({ event: le, listeners: ie }), se ? le.data = se : (se = Yf(s), se !== null && (le.data = se)))), (se = Cw ? Pw(t, s) : Ew(t, s)) && (O = Ji(O, "onBeforeInput"), 0 < O.length && (U = new Uf("onBeforeInput", "beforeinput", null, s, U), H.push({ event: U, listeners: O }), U.data = se));
      }
      hp(H, r);
    });
  }
  function Lo(t, r, s) {
    return { instance: t, listener: r, currentTarget: s };
  }
  function Ji(t, r) {
    for (var s = r + "Capture", u = []; t !== null; ) {
      var h = t, y = h.stateNode;
      h.tag === 5 && y !== null && (h = y, y = So(t, s), y != null && u.unshift(Lo(t, y, h)), y = So(t, r), y != null && u.push(Lo(t, y, h))), t = t.return;
    }
    return u;
  }
  function Rr(t) {
    if (t === null) return null;
    do
      t = t.return;
    while (t && t.tag !== 5);
    return t || null;
  }
  function yp(t, r, s, u, h) {
    for (var y = r._reactName, _ = []; s !== null && s !== u; ) {
      var P = s, M = P.alternate, O = P.stateNode;
      if (M !== null && M === u) break;
      P.tag === 5 && O !== null && (P = O, h ? (M = So(s, y), M != null && _.unshift(Lo(s, M, P))) : h || (M = So(s, y), M != null && _.push(Lo(s, M, P)))), s = s.return;
    }
    _.length !== 0 && t.push({ event: r, listeners: _ });
  }
  var Uw = /\r\n?/g, $w = /\u0000|\uFFFD/g;
  function gp(t) {
    return (typeof t == "string" ? t : "" + t).replace(Uw, `
`).replace($w, "");
  }
  function qi(t, r, s) {
    if (r = gp(r), gp(t) !== r && s) throw Error(o(425));
  }
  function es() {
  }
  var Pl = null, El = null;
  function Ml(t, r) {
    return t === "textarea" || t === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var bl = typeof setTimeout == "function" ? setTimeout : void 0, Hw = typeof clearTimeout == "function" ? clearTimeout : void 0, vp = typeof Promise == "function" ? Promise : void 0, Ww = typeof queueMicrotask == "function" ? queueMicrotask : typeof vp < "u" ? function(t) {
    return vp.resolve(null).then(t).catch(Gw);
  } : bl;
  function Gw(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function Rl(t, r) {
    var s = r, u = 0;
    do {
      var h = s.nextSibling;
      if (t.removeChild(s), h && h.nodeType === 8) if (s = h.data, s === "/$") {
        if (u === 0) {
          t.removeChild(h), Eo(r);
          return;
        }
        u--;
      } else s !== "$" && s !== "$?" && s !== "$!" || u++;
      s = h;
    } while (s);
    Eo(r);
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
  function Sp(t) {
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
  var Dr = Math.random().toString(36).slice(2), $t = "__reactFiber$" + Dr, Vo = "__reactProps$" + Dr, nn = "__reactContainer$" + Dr, Dl = "__reactEvents$" + Dr, Kw = "__reactListeners$" + Dr, Yw = "__reactHandles$" + Dr;
  function Yn(t) {
    var r = t[$t];
    if (r) return r;
    for (var s = t.parentNode; s; ) {
      if (r = s[nn] || s[$t]) {
        if (s = r.alternate, r.child !== null || s !== null && s.child !== null) for (t = Sp(t); t !== null; ) {
          if (s = t[$t]) return s;
          t = Sp(t);
        }
        return r;
      }
      t = s, s = t.parentNode;
    }
    return null;
  }
  function Bo(t) {
    return t = t[$t] || t[nn], !t || t.tag !== 5 && t.tag !== 6 && t.tag !== 13 && t.tag !== 3 ? null : t;
  }
  function Nr(t) {
    if (t.tag === 5 || t.tag === 6) return t.stateNode;
    throw Error(o(33));
  }
  function ts(t) {
    return t[Vo] || null;
  }
  var Nl = [], Ir = -1;
  function Tn(t) {
    return { current: t };
  }
  function Me(t) {
    0 > Ir || (t.current = Nl[Ir], Nl[Ir] = null, Ir--);
  }
  function Pe(t, r) {
    Ir++, Nl[Ir] = t.current, t.current = r;
  }
  var kn = {}, qe = Tn(kn), lt = Tn(!1), Qn = kn;
  function Fr(t, r) {
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
  function ns() {
    Me(lt), Me(qe);
  }
  function wp(t, r, s) {
    if (qe.current !== kn) throw Error(o(168));
    Pe(qe, r), Pe(lt, s);
  }
  function _p(t, r, s) {
    var u = t.stateNode;
    if (r = r.childContextTypes, typeof u.getChildContext != "function") return s;
    u = u.getChildContext();
    for (var h in u) if (!(h in r)) throw Error(o(108, Ce(t) || "Unknown", h));
    return Y({}, s, u);
  }
  function rs(t) {
    return t = (t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext || kn, Qn = qe.current, Pe(qe, t), Pe(lt, lt.current), !0;
  }
  function xp(t, r, s) {
    var u = t.stateNode;
    if (!u) throw Error(o(169));
    s ? (t = _p(t, r, Qn), u.__reactInternalMemoizedMergedChildContext = t, Me(lt), Me(qe), Pe(qe, t)) : Me(lt), Pe(lt, s);
  }
  var rn = null, os = !1, Il = !1;
  function Tp(t) {
    rn === null ? rn = [t] : rn.push(t);
  }
  function Qw(t) {
    os = !0, Tp(t);
  }
  function An() {
    if (!Il && rn !== null) {
      Il = !0;
      var t = 0, r = _e;
      try {
        var s = rn;
        for (_e = 1; t < s.length; t++) {
          var u = s[t];
          do
            u = u(!0);
          while (u !== null);
        }
        rn = null, os = !1;
      } catch (h) {
        throw rn !== null && (rn = rn.slice(t + 1)), Af(nl, An), h;
      } finally {
        _e = r, Il = !1;
      }
    }
    return null;
  }
  var Or = [], jr = 0, is = null, ss = 0, xt = [], Tt = 0, Xn = null, on = 1, sn = "";
  function Zn(t, r) {
    Or[jr++] = ss, Or[jr++] = is, is = t, ss = r;
  }
  function kp(t, r, s) {
    xt[Tt++] = on, xt[Tt++] = sn, xt[Tt++] = Xn, Xn = t;
    var u = on;
    t = sn;
    var h = 32 - Rt(u) - 1;
    u &= ~(1 << h), s += 1;
    var y = 32 - Rt(r) + h;
    if (30 < y) {
      var _ = h - h % 5;
      y = (u & (1 << _) - 1).toString(32), u >>= _, h -= _, on = 1 << 32 - Rt(r) + h | s << h | u, sn = y + t;
    } else on = 1 << y | s << h | u, sn = t;
  }
  function Fl(t) {
    t.return !== null && (Zn(t, 1), kp(t, 1, 0));
  }
  function Ol(t) {
    for (; t === is; ) is = Or[--jr], Or[jr] = null, ss = Or[--jr], Or[jr] = null;
    for (; t === Xn; ) Xn = xt[--Tt], xt[Tt] = null, sn = xt[--Tt], xt[Tt] = null, on = xt[--Tt], xt[Tt] = null;
  }
  var gt = null, vt = null, Re = !1, Nt = null;
  function Ap(t, r) {
    var s = Pt(5, null, null, 0);
    s.elementType = "DELETED", s.stateNode = r, s.return = t, r = t.deletions, r === null ? (t.deletions = [s], t.flags |= 16) : r.push(s);
  }
  function Cp(t, r) {
    switch (t.tag) {
      case 5:
        var s = t.type;
        return r = r.nodeType !== 1 || s.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (t.stateNode = r, gt = t, vt = xn(r.firstChild), !0) : !1;
      case 6:
        return r = t.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (t.stateNode = r, gt = t, vt = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (s = Xn !== null ? { id: on, overflow: sn } : null, t.memoizedState = { dehydrated: r, treeContext: s, retryLane: 1073741824 }, s = Pt(18, null, null, 0), s.stateNode = r, s.return = t, t.child = s, gt = t, vt = null, !0) : !1;
      default:
        return !1;
    }
  }
  function jl(t) {
    return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
  }
  function Ll(t) {
    if (Re) {
      var r = vt;
      if (r) {
        var s = r;
        if (!Cp(t, r)) {
          if (jl(t)) throw Error(o(418));
          r = xn(s.nextSibling);
          var u = gt;
          r && Cp(t, r) ? Ap(u, s) : (t.flags = t.flags & -4097 | 2, Re = !1, gt = t);
        }
      } else {
        if (jl(t)) throw Error(o(418));
        t.flags = t.flags & -4097 | 2, Re = !1, gt = t;
      }
    }
  }
  function Pp(t) {
    for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; ) t = t.return;
    gt = t;
  }
  function as(t) {
    if (t !== gt) return !1;
    if (!Re) return Pp(t), Re = !0, !1;
    var r;
    if ((r = t.tag !== 3) && !(r = t.tag !== 5) && (r = t.type, r = r !== "head" && r !== "body" && !Ml(t.type, t.memoizedProps)), r && (r = vt)) {
      if (jl(t)) throw Ep(), Error(o(418));
      for (; r; ) Ap(t, r), r = xn(r.nextSibling);
    }
    if (Pp(t), t.tag === 13) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(o(317));
      e: {
        for (t = t.nextSibling, r = 0; t; ) {
          if (t.nodeType === 8) {
            var s = t.data;
            if (s === "/$") {
              if (r === 0) {
                vt = xn(t.nextSibling);
                break e;
              }
              r--;
            } else s !== "$" && s !== "$!" && s !== "$?" || r++;
          }
          t = t.nextSibling;
        }
        vt = null;
      }
    } else vt = gt ? xn(t.stateNode.nextSibling) : null;
    return !0;
  }
  function Ep() {
    for (var t = vt; t; ) t = xn(t.nextSibling);
  }
  function Lr() {
    vt = gt = null, Re = !1;
  }
  function Vl(t) {
    Nt === null ? Nt = [t] : Nt.push(t);
  }
  var Xw = N.ReactCurrentBatchConfig;
  function zo(t, r, s) {
    if (t = s.ref, t !== null && typeof t != "function" && typeof t != "object") {
      if (s._owner) {
        if (s = s._owner, s) {
          if (s.tag !== 1) throw Error(o(309));
          var u = s.stateNode;
        }
        if (!u) throw Error(o(147, t));
        var h = u, y = "" + t;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === y ? r.ref : (r = function(_) {
          var P = h.refs;
          _ === null ? delete P[y] : P[y] = _;
        }, r._stringRef = y, r);
      }
      if (typeof t != "string") throw Error(o(284));
      if (!s._owner) throw Error(o(290, t));
    }
    return t;
  }
  function ls(t, r) {
    throw t = Object.prototype.toString.call(r), Error(o(31, t === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : t));
  }
  function Mp(t) {
    var r = t._init;
    return r(t._payload);
  }
  function bp(t) {
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
    function h(I, b) {
      return I = Nn(I, b), I.index = 0, I.sibling = null, I;
    }
    function y(I, b, F) {
      return I.index = F, t ? (F = I.alternate, F !== null ? (F = F.index, F < b ? (I.flags |= 2, b) : F) : (I.flags |= 2, b)) : (I.flags |= 1048576, b);
    }
    function _(I) {
      return t && I.alternate === null && (I.flags |= 2), I;
    }
    function P(I, b, F, W) {
      return b === null || b.tag !== 6 ? (b = bu(F, I.mode, W), b.return = I, b) : (b = h(b, F), b.return = I, b);
    }
    function M(I, b, F, W) {
      var oe = F.type;
      return oe === V ? U(I, b, F.props.children, W, F.key) : b !== null && (b.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ve && Mp(oe) === b.type) ? (W = h(b, F.props), W.ref = zo(I, b, F), W.return = I, W) : (W = Ds(F.type, F.key, F.props, null, I.mode, W), W.ref = zo(I, b, F), W.return = I, W);
    }
    function O(I, b, F, W) {
      return b === null || b.tag !== 4 || b.stateNode.containerInfo !== F.containerInfo || b.stateNode.implementation !== F.implementation ? (b = Ru(F, I.mode, W), b.return = I, b) : (b = h(b, F.children || []), b.return = I, b);
    }
    function U(I, b, F, W, oe) {
      return b === null || b.tag !== 7 ? (b = ir(F, I.mode, W, oe), b.return = I, b) : (b = h(b, F), b.return = I, b);
    }
    function H(I, b, F) {
      if (typeof b == "string" && b !== "" || typeof b == "number") return b = bu("" + b, I.mode, F), b.return = I, b;
      if (typeof b == "object" && b !== null) {
        switch (b.$$typeof) {
          case j:
            return F = Ds(b.type, b.key, b.props, null, I.mode, F), F.ref = zo(I, null, b), F.return = I, F;
          case L:
            return b = Ru(b, I.mode, F), b.return = I, b;
          case ve:
            var W = b._init;
            return H(I, W(b._payload), F);
        }
        if (yo(b) || Z(b)) return b = ir(b, I.mode, F, null), b.return = I, b;
        ls(I, b);
      }
      return null;
    }
    function z(I, b, F, W) {
      var oe = b !== null ? b.key : null;
      if (typeof F == "string" && F !== "" || typeof F == "number") return oe !== null ? null : P(I, b, "" + F, W);
      if (typeof F == "object" && F !== null) {
        switch (F.$$typeof) {
          case j:
            return F.key === oe ? M(I, b, F, W) : null;
          case L:
            return F.key === oe ? O(I, b, F, W) : null;
          case ve:
            return oe = F._init, z(
              I,
              b,
              oe(F._payload),
              W
            );
        }
        if (yo(F) || Z(F)) return oe !== null ? null : U(I, b, F, W, null);
        ls(I, F);
      }
      return null;
    }
    function J(I, b, F, W, oe) {
      if (typeof W == "string" && W !== "" || typeof W == "number") return I = I.get(F) || null, P(b, I, "" + W, oe);
      if (typeof W == "object" && W !== null) {
        switch (W.$$typeof) {
          case j:
            return I = I.get(W.key === null ? F : W.key) || null, M(b, I, W, oe);
          case L:
            return I = I.get(W.key === null ? F : W.key) || null, O(b, I, W, oe);
          case ve:
            var ie = W._init;
            return J(I, b, F, ie(W._payload), oe);
        }
        if (yo(W) || Z(W)) return I = I.get(F) || null, U(b, I, W, oe, null);
        ls(b, W);
      }
      return null;
    }
    function te(I, b, F, W) {
      for (var oe = null, ie = null, se = b, le = b = 0, We = null; se !== null && le < F.length; le++) {
        se.index > le ? (We = se, se = null) : We = se.sibling;
        var ge = z(I, se, F[le], W);
        if (ge === null) {
          se === null && (se = We);
          break;
        }
        t && se && ge.alternate === null && r(I, se), b = y(ge, b, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge, se = We;
      }
      if (le === F.length) return s(I, se), Re && Zn(I, le), oe;
      if (se === null) {
        for (; le < F.length; le++) se = H(I, F[le], W), se !== null && (b = y(se, b, le), ie === null ? oe = se : ie.sibling = se, ie = se);
        return Re && Zn(I, le), oe;
      }
      for (se = u(I, se); le < F.length; le++) We = J(se, I, le, F[le], W), We !== null && (t && We.alternate !== null && se.delete(We.key === null ? le : We.key), b = y(We, b, le), ie === null ? oe = We : ie.sibling = We, ie = We);
      return t && se.forEach(function(In) {
        return r(I, In);
      }), Re && Zn(I, le), oe;
    }
    function re(I, b, F, W) {
      var oe = Z(F);
      if (typeof oe != "function") throw Error(o(150));
      if (F = oe.call(F), F == null) throw Error(o(151));
      for (var ie = oe = null, se = b, le = b = 0, We = null, ge = F.next(); se !== null && !ge.done; le++, ge = F.next()) {
        se.index > le ? (We = se, se = null) : We = se.sibling;
        var In = z(I, se, ge.value, W);
        if (In === null) {
          se === null && (se = We);
          break;
        }
        t && se && In.alternate === null && r(I, se), b = y(In, b, le), ie === null ? oe = In : ie.sibling = In, ie = In, se = We;
      }
      if (ge.done) return s(
        I,
        se
      ), Re && Zn(I, le), oe;
      if (se === null) {
        for (; !ge.done; le++, ge = F.next()) ge = H(I, ge.value, W), ge !== null && (b = y(ge, b, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge);
        return Re && Zn(I, le), oe;
      }
      for (se = u(I, se); !ge.done; le++, ge = F.next()) ge = J(se, I, le, ge.value, W), ge !== null && (t && ge.alternate !== null && se.delete(ge.key === null ? le : ge.key), b = y(ge, b, le), ie === null ? oe = ge : ie.sibling = ge, ie = ge);
      return t && se.forEach(function(M_) {
        return r(I, M_);
      }), Re && Zn(I, le), oe;
    }
    function je(I, b, F, W) {
      if (typeof F == "object" && F !== null && F.type === V && F.key === null && (F = F.props.children), typeof F == "object" && F !== null) {
        switch (F.$$typeof) {
          case j:
            e: {
              for (var oe = F.key, ie = b; ie !== null; ) {
                if (ie.key === oe) {
                  if (oe = F.type, oe === V) {
                    if (ie.tag === 7) {
                      s(I, ie.sibling), b = h(ie, F.props.children), b.return = I, I = b;
                      break e;
                    }
                  } else if (ie.elementType === oe || typeof oe == "object" && oe !== null && oe.$$typeof === ve && Mp(oe) === ie.type) {
                    s(I, ie.sibling), b = h(ie, F.props), b.ref = zo(I, ie, F), b.return = I, I = b;
                    break e;
                  }
                  s(I, ie);
                  break;
                } else r(I, ie);
                ie = ie.sibling;
              }
              F.type === V ? (b = ir(F.props.children, I.mode, W, F.key), b.return = I, I = b) : (W = Ds(F.type, F.key, F.props, null, I.mode, W), W.ref = zo(I, b, F), W.return = I, I = W);
            }
            return _(I);
          case L:
            e: {
              for (ie = F.key; b !== null; ) {
                if (b.key === ie) if (b.tag === 4 && b.stateNode.containerInfo === F.containerInfo && b.stateNode.implementation === F.implementation) {
                  s(I, b.sibling), b = h(b, F.children || []), b.return = I, I = b;
                  break e;
                } else {
                  s(I, b);
                  break;
                }
                else r(I, b);
                b = b.sibling;
              }
              b = Ru(F, I.mode, W), b.return = I, I = b;
            }
            return _(I);
          case ve:
            return ie = F._init, je(I, b, ie(F._payload), W);
        }
        if (yo(F)) return te(I, b, F, W);
        if (Z(F)) return re(I, b, F, W);
        ls(I, F);
      }
      return typeof F == "string" && F !== "" || typeof F == "number" ? (F = "" + F, b !== null && b.tag === 6 ? (s(I, b.sibling), b = h(b, F), b.return = I, I = b) : (s(I, b), b = bu(F, I.mode, W), b.return = I, I = b), _(I)) : s(I, b);
    }
    return je;
  }
  var Vr = bp(!0), Rp = bp(!1), us = Tn(null), cs = null, Br = null, Bl = null;
  function zl() {
    Bl = Br = cs = null;
  }
  function Ul(t) {
    var r = us.current;
    Me(us), t._currentValue = r;
  }
  function $l(t, r, s) {
    for (; t !== null; ) {
      var u = t.alternate;
      if ((t.childLanes & r) !== r ? (t.childLanes |= r, u !== null && (u.childLanes |= r)) : u !== null && (u.childLanes & r) !== r && (u.childLanes |= r), t === s) break;
      t = t.return;
    }
  }
  function zr(t, r) {
    cs = t, Bl = Br = null, t = t.dependencies, t !== null && t.firstContext !== null && ((t.lanes & r) !== 0 && (ct = !0), t.firstContext = null);
  }
  function kt(t) {
    var r = t._currentValue;
    if (Bl !== t) if (t = { context: t, memoizedValue: r, next: null }, Br === null) {
      if (cs === null) throw Error(o(308));
      Br = t, cs.dependencies = { lanes: 0, firstContext: t };
    } else Br = Br.next = t;
    return r;
  }
  var Jn = null;
  function Hl(t) {
    Jn === null ? Jn = [t] : Jn.push(t);
  }
  function Dp(t, r, s, u) {
    var h = r.interleaved;
    return h === null ? (s.next = s, Hl(r)) : (s.next = h.next, h.next = s), r.interleaved = s, an(t, u);
  }
  function an(t, r) {
    t.lanes |= r;
    var s = t.alternate;
    for (s !== null && (s.lanes |= r), s = t, t = t.return; t !== null; ) t.childLanes |= r, s = t.alternate, s !== null && (s.childLanes |= r), s = t, t = t.return;
    return s.tag === 3 ? s.stateNode : null;
  }
  var Cn = !1;
  function Wl(t) {
    t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Np(t, r) {
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
    return h = u.interleaved, h === null ? (r.next = r, Hl(u)) : (r.next = h.next, h.next = r), u.interleaved = r, an(t, s);
  }
  function ds(t, r, s) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (s & 4194240) !== 0)) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, il(t, s);
    }
  }
  function Ip(t, r) {
    var s = t.updateQueue, u = t.alternate;
    if (u !== null && (u = u.updateQueue, s === u)) {
      var h = null, y = null;
      if (s = s.firstBaseUpdate, s !== null) {
        do {
          var _ = { eventTime: s.eventTime, lane: s.lane, tag: s.tag, payload: s.payload, callback: s.callback, next: null };
          y === null ? h = y = _ : y = y.next = _, s = s.next;
        } while (s !== null);
        y === null ? h = y = r : y = y.next = r;
      } else h = y = r;
      s = { baseState: u.baseState, firstBaseUpdate: h, lastBaseUpdate: y, shared: u.shared, effects: u.effects }, t.updateQueue = s;
      return;
    }
    t = s.lastBaseUpdate, t === null ? s.firstBaseUpdate = r : t.next = r, s.lastBaseUpdate = r;
  }
  function fs(t, r, s, u) {
    var h = t.updateQueue;
    Cn = !1;
    var y = h.firstBaseUpdate, _ = h.lastBaseUpdate, P = h.shared.pending;
    if (P !== null) {
      h.shared.pending = null;
      var M = P, O = M.next;
      M.next = null, _ === null ? y = O : _.next = O, _ = M;
      var U = t.alternate;
      U !== null && (U = U.updateQueue, P = U.lastBaseUpdate, P !== _ && (P === null ? U.firstBaseUpdate = O : P.next = O, U.lastBaseUpdate = M));
    }
    if (y !== null) {
      var H = h.baseState;
      _ = 0, U = O = M = null, P = y;
      do {
        var z = P.lane, J = P.eventTime;
        if ((u & z) === z) {
          U !== null && (U = U.next = {
            eventTime: J,
            lane: 0,
            tag: P.tag,
            payload: P.payload,
            callback: P.callback,
            next: null
          });
          e: {
            var te = t, re = P;
            switch (z = r, J = s, re.tag) {
              case 1:
                if (te = re.payload, typeof te == "function") {
                  H = te.call(J, H, z);
                  break e;
                }
                H = te;
                break e;
              case 3:
                te.flags = te.flags & -65537 | 128;
              case 0:
                if (te = re.payload, z = typeof te == "function" ? te.call(J, H, z) : te, z == null) break e;
                H = Y({}, H, z);
                break e;
              case 2:
                Cn = !0;
            }
          }
          P.callback !== null && P.lane !== 0 && (t.flags |= 64, z = h.effects, z === null ? h.effects = [P] : z.push(P));
        } else J = { eventTime: J, lane: z, tag: P.tag, payload: P.payload, callback: P.callback, next: null }, U === null ? (O = U = J, M = H) : U = U.next = J, _ |= z;
        if (P = P.next, P === null) {
          if (P = h.shared.pending, P === null) break;
          z = P, P = z.next, z.next = null, h.lastBaseUpdate = z, h.shared.pending = null;
        }
      } while (!0);
      if (U === null && (M = H), h.baseState = M, h.firstBaseUpdate = O, h.lastBaseUpdate = U, r = h.shared.interleaved, r !== null) {
        h = r;
        do
          _ |= h.lane, h = h.next;
        while (h !== r);
      } else y === null && (h.shared.lanes = 0);
      tr |= _, t.lanes = _, t.memoizedState = H;
    }
  }
  function Fp(t, r, s) {
    if (t = r.effects, r.effects = null, t !== null) for (r = 0; r < t.length; r++) {
      var u = t[r], h = u.callback;
      if (h !== null) {
        if (u.callback = null, u = s, typeof h != "function") throw Error(o(191, h));
        h.call(u);
      }
    }
  }
  var Uo = {}, Ht = Tn(Uo), $o = Tn(Uo), Ho = Tn(Uo);
  function qn(t) {
    if (t === Uo) throw Error(o(174));
    return t;
  }
  function Gl(t, r) {
    switch (Pe(Ho, r), Pe($o, t), Pe(Ht, Uo), t = r.nodeType, t) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : Ka(null, "");
        break;
      default:
        t = t === 8 ? r.parentNode : r, r = t.namespaceURI || null, t = t.tagName, r = Ka(r, t);
    }
    Me(Ht), Pe(Ht, r);
  }
  function Ur() {
    Me(Ht), Me($o), Me(Ho);
  }
  function Op(t) {
    qn(Ho.current);
    var r = qn(Ht.current), s = Ka(r, t.type);
    r !== s && (Pe($o, t), Pe(Ht, s));
  }
  function Kl(t) {
    $o.current === t && (Me(Ht), Me($o));
  }
  var De = Tn(0);
  function ps(t) {
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
  var Yl = [];
  function Ql() {
    for (var t = 0; t < Yl.length; t++) Yl[t]._workInProgressVersionPrimary = null;
    Yl.length = 0;
  }
  var hs = N.ReactCurrentDispatcher, Xl = N.ReactCurrentBatchConfig, er = 0, Ne = null, Be = null, $e = null, ms = !1, Wo = !1, Go = 0, Zw = 0;
  function et() {
    throw Error(o(321));
  }
  function Zl(t, r) {
    if (r === null) return !1;
    for (var s = 0; s < r.length && s < t.length; s++) if (!Dt(t[s], r[s])) return !1;
    return !0;
  }
  function Jl(t, r, s, u, h, y) {
    if (er = y, Ne = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, hs.current = t === null || t.memoizedState === null ? t_ : n_, t = s(u, h), Wo) {
      y = 0;
      do {
        if (Wo = !1, Go = 0, 25 <= y) throw Error(o(301));
        y += 1, $e = Be = null, r.updateQueue = null, hs.current = r_, t = s(u, h);
      } while (Wo);
    }
    if (hs.current = vs, r = Be !== null && Be.next !== null, er = 0, $e = Be = Ne = null, ms = !1, r) throw Error(o(300));
    return t;
  }
  function ql() {
    var t = Go !== 0;
    return Go = 0, t;
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
  function Ko(t, r) {
    return typeof r == "function" ? r(t) : r;
  }
  function eu(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = t;
    var u = Be, h = u.baseQueue, y = s.pending;
    if (y !== null) {
      if (h !== null) {
        var _ = h.next;
        h.next = y.next, y.next = _;
      }
      u.baseQueue = h = y, s.pending = null;
    }
    if (h !== null) {
      y = h.next, u = u.baseState;
      var P = _ = null, M = null, O = y;
      do {
        var U = O.lane;
        if ((er & U) === U) M !== null && (M = M.next = { lane: 0, action: O.action, hasEagerState: O.hasEagerState, eagerState: O.eagerState, next: null }), u = O.hasEagerState ? O.eagerState : t(u, O.action);
        else {
          var H = {
            lane: U,
            action: O.action,
            hasEagerState: O.hasEagerState,
            eagerState: O.eagerState,
            next: null
          };
          M === null ? (P = M = H, _ = u) : M = M.next = H, Ne.lanes |= U, tr |= U;
        }
        O = O.next;
      } while (O !== null && O !== y);
      M === null ? _ = u : M.next = P, Dt(u, r.memoizedState) || (ct = !0), r.memoizedState = u, r.baseState = _, r.baseQueue = M, s.lastRenderedState = u;
    }
    if (t = s.interleaved, t !== null) {
      h = t;
      do
        y = h.lane, Ne.lanes |= y, tr |= y, h = h.next;
      while (h !== t);
    } else h === null && (s.lanes = 0);
    return [r.memoizedState, s.dispatch];
  }
  function tu(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = t;
    var u = s.dispatch, h = s.pending, y = r.memoizedState;
    if (h !== null) {
      s.pending = null;
      var _ = h = h.next;
      do
        y = t(y, _.action), _ = _.next;
      while (_ !== h);
      Dt(y, r.memoizedState) || (ct = !0), r.memoizedState = y, r.baseQueue === null && (r.baseState = y), s.lastRenderedState = y;
    }
    return [y, u];
  }
  function jp() {
  }
  function Lp(t, r) {
    var s = Ne, u = At(), h = r(), y = !Dt(u.memoizedState, h);
    if (y && (u.memoizedState = h, ct = !0), u = u.queue, nu(zp.bind(null, s, u, t), [t]), u.getSnapshot !== r || y || $e !== null && $e.memoizedState.tag & 1) {
      if (s.flags |= 2048, Yo(9, Bp.bind(null, s, u, h, r), void 0, null), He === null) throw Error(o(349));
      (er & 30) !== 0 || Vp(s, r, h);
    }
    return h;
  }
  function Vp(t, r, s) {
    t.flags |= 16384, t = { getSnapshot: r, value: s }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.stores = [t]) : (s = r.stores, s === null ? r.stores = [t] : s.push(t));
  }
  function Bp(t, r, s, u) {
    r.value = s, r.getSnapshot = u, Up(r) && $p(t);
  }
  function zp(t, r, s) {
    return s(function() {
      Up(r) && $p(t);
    });
  }
  function Up(t) {
    var r = t.getSnapshot;
    t = t.value;
    try {
      var s = r();
      return !Dt(t, s);
    } catch {
      return !0;
    }
  }
  function $p(t) {
    var r = an(t, 1);
    r !== null && jt(r, t, 1, -1);
  }
  function Hp(t) {
    var r = Wt();
    return typeof t == "function" && (t = t()), r.memoizedState = r.baseState = t, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Ko, lastRenderedState: t }, r.queue = t, t = t.dispatch = e_.bind(null, Ne, t), [r.memoizedState, t];
  }
  function Yo(t, r, s, u) {
    return t = { tag: t, create: r, destroy: s, deps: u, next: null }, r = Ne.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Ne.updateQueue = r, r.lastEffect = t.next = t) : (s = r.lastEffect, s === null ? r.lastEffect = t.next = t : (u = s.next, s.next = t, t.next = u, r.lastEffect = t)), t;
  }
  function Wp() {
    return At().memoizedState;
  }
  function ys(t, r, s, u) {
    var h = Wt();
    Ne.flags |= t, h.memoizedState = Yo(1 | r, s, void 0, u === void 0 ? null : u);
  }
  function gs(t, r, s, u) {
    var h = At();
    u = u === void 0 ? null : u;
    var y = void 0;
    if (Be !== null) {
      var _ = Be.memoizedState;
      if (y = _.destroy, u !== null && Zl(u, _.deps)) {
        h.memoizedState = Yo(r, s, y, u);
        return;
      }
    }
    Ne.flags |= t, h.memoizedState = Yo(1 | r, s, y, u);
  }
  function Gp(t, r) {
    return ys(8390656, 8, t, r);
  }
  function nu(t, r) {
    return gs(2048, 8, t, r);
  }
  function Kp(t, r) {
    return gs(4, 2, t, r);
  }
  function Yp(t, r) {
    return gs(4, 4, t, r);
  }
  function Qp(t, r) {
    if (typeof r == "function") return t = t(), r(t), function() {
      r(null);
    };
    if (r != null) return t = t(), r.current = t, function() {
      r.current = null;
    };
  }
  function Xp(t, r, s) {
    return s = s != null ? s.concat([t]) : null, gs(4, 4, Qp.bind(null, r, t), s);
  }
  function ru() {
  }
  function Zp(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && Zl(r, u[1]) ? u[0] : (s.memoizedState = [t, r], t);
  }
  function Jp(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && Zl(r, u[1]) ? u[0] : (t = t(), s.memoizedState = [t, r], t);
  }
  function qp(t, r, s) {
    return (er & 21) === 0 ? (t.baseState && (t.baseState = !1, ct = !0), t.memoizedState = s) : (Dt(s, r) || (s = Mf(), Ne.lanes |= s, tr |= s, t.baseState = !0), r);
  }
  function Jw(t, r) {
    var s = _e;
    _e = s !== 0 && 4 > s ? s : 4, t(!0);
    var u = Xl.transition;
    Xl.transition = {};
    try {
      t(!1), r();
    } finally {
      _e = s, Xl.transition = u;
    }
  }
  function eh() {
    return At().memoizedState;
  }
  function qw(t, r, s) {
    var u = Rn(t);
    if (s = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null }, th(t)) nh(r, s);
    else if (s = Dp(t, r, s, u), s !== null) {
      var h = ot();
      jt(s, t, u, h), rh(s, r, u);
    }
  }
  function e_(t, r, s) {
    var u = Rn(t), h = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null };
    if (th(t)) nh(r, h);
    else {
      var y = t.alternate;
      if (t.lanes === 0 && (y === null || y.lanes === 0) && (y = r.lastRenderedReducer, y !== null)) try {
        var _ = r.lastRenderedState, P = y(_, s);
        if (h.hasEagerState = !0, h.eagerState = P, Dt(P, _)) {
          var M = r.interleaved;
          M === null ? (h.next = h, Hl(r)) : (h.next = M.next, M.next = h), r.interleaved = h;
          return;
        }
      } catch {
      } finally {
      }
      s = Dp(t, r, h, u), s !== null && (h = ot(), jt(s, t, u, h), rh(s, r, u));
    }
  }
  function th(t) {
    var r = t.alternate;
    return t === Ne || r !== null && r === Ne;
  }
  function nh(t, r) {
    Wo = ms = !0;
    var s = t.pending;
    s === null ? r.next = r : (r.next = s.next, s.next = r), t.pending = r;
  }
  function rh(t, r, s) {
    if ((s & 4194240) !== 0) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, il(t, s);
    }
  }
  var vs = { readContext: kt, useCallback: et, useContext: et, useEffect: et, useImperativeHandle: et, useInsertionEffect: et, useLayoutEffect: et, useMemo: et, useReducer: et, useRef: et, useState: et, useDebugValue: et, useDeferredValue: et, useTransition: et, useMutableSource: et, useSyncExternalStore: et, useId: et, unstable_isNewReconciler: !1 }, t_ = { readContext: kt, useCallback: function(t, r) {
    return Wt().memoizedState = [t, r === void 0 ? null : r], t;
  }, useContext: kt, useEffect: Gp, useImperativeHandle: function(t, r, s) {
    return s = s != null ? s.concat([t]) : null, ys(
      4194308,
      4,
      Qp.bind(null, r, t),
      s
    );
  }, useLayoutEffect: function(t, r) {
    return ys(4194308, 4, t, r);
  }, useInsertionEffect: function(t, r) {
    return ys(4, 2, t, r);
  }, useMemo: function(t, r) {
    var s = Wt();
    return r = r === void 0 ? null : r, t = t(), s.memoizedState = [t, r], t;
  }, useReducer: function(t, r, s) {
    var u = Wt();
    return r = s !== void 0 ? s(r) : r, u.memoizedState = u.baseState = r, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: r }, u.queue = t, t = t.dispatch = qw.bind(null, Ne, t), [u.memoizedState, t];
  }, useRef: function(t) {
    var r = Wt();
    return t = { current: t }, r.memoizedState = t;
  }, useState: Hp, useDebugValue: ru, useDeferredValue: function(t) {
    return Wt().memoizedState = t;
  }, useTransition: function() {
    var t = Hp(!1), r = t[0];
    return t = Jw.bind(null, t[1]), Wt().memoizedState = t, [r, t];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(t, r, s) {
    var u = Ne, h = Wt();
    if (Re) {
      if (s === void 0) throw Error(o(407));
      s = s();
    } else {
      if (s = r(), He === null) throw Error(o(349));
      (er & 30) !== 0 || Vp(u, r, s);
    }
    h.memoizedState = s;
    var y = { value: s, getSnapshot: r };
    return h.queue = y, Gp(zp.bind(
      null,
      u,
      y,
      t
    ), [t]), u.flags |= 2048, Yo(9, Bp.bind(null, u, y, s, r), void 0, null), s;
  }, useId: function() {
    var t = Wt(), r = He.identifierPrefix;
    if (Re) {
      var s = sn, u = on;
      s = (u & ~(1 << 32 - Rt(u) - 1)).toString(32) + s, r = ":" + r + "R" + s, s = Go++, 0 < s && (r += "H" + s.toString(32)), r += ":";
    } else s = Zw++, r = ":" + r + "r" + s.toString(32) + ":";
    return t.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, n_ = {
    readContext: kt,
    useCallback: Zp,
    useContext: kt,
    useEffect: nu,
    useImperativeHandle: Xp,
    useInsertionEffect: Kp,
    useLayoutEffect: Yp,
    useMemo: Jp,
    useReducer: eu,
    useRef: Wp,
    useState: function() {
      return eu(Ko);
    },
    useDebugValue: ru,
    useDeferredValue: function(t) {
      var r = At();
      return qp(r, Be.memoizedState, t);
    },
    useTransition: function() {
      var t = eu(Ko)[0], r = At().memoizedState;
      return [t, r];
    },
    useMutableSource: jp,
    useSyncExternalStore: Lp,
    useId: eh,
    unstable_isNewReconciler: !1
  }, r_ = { readContext: kt, useCallback: Zp, useContext: kt, useEffect: nu, useImperativeHandle: Xp, useInsertionEffect: Kp, useLayoutEffect: Yp, useMemo: Jp, useReducer: tu, useRef: Wp, useState: function() {
    return tu(Ko);
  }, useDebugValue: ru, useDeferredValue: function(t) {
    var r = At();
    return Be === null ? r.memoizedState = t : qp(r, Be.memoizedState, t);
  }, useTransition: function() {
    var t = tu(Ko)[0], r = At().memoizedState;
    return [t, r];
  }, useMutableSource: jp, useSyncExternalStore: Lp, useId: eh, unstable_isNewReconciler: !1 };
  function It(t, r) {
    if (t && t.defaultProps) {
      r = Y({}, r), t = t.defaultProps;
      for (var s in t) r[s] === void 0 && (r[s] = t[s]);
      return r;
    }
    return r;
  }
  function ou(t, r, s, u) {
    r = t.memoizedState, s = s(u, r), s = s == null ? r : Y({}, r, s), t.memoizedState = s, t.lanes === 0 && (t.updateQueue.baseState = s);
  }
  var Ss = { isMounted: function(t) {
    return (t = t._reactInternals) ? Kn(t) === t : !1;
  }, enqueueSetState: function(t, r, s) {
    t = t._reactInternals;
    var u = ot(), h = Rn(t), y = ln(u, h);
    y.payload = r, s != null && (y.callback = s), r = Pn(t, y, h), r !== null && (jt(r, t, h, u), ds(r, t, h));
  }, enqueueReplaceState: function(t, r, s) {
    t = t._reactInternals;
    var u = ot(), h = Rn(t), y = ln(u, h);
    y.tag = 1, y.payload = r, s != null && (y.callback = s), r = Pn(t, y, h), r !== null && (jt(r, t, h, u), ds(r, t, h));
  }, enqueueForceUpdate: function(t, r) {
    t = t._reactInternals;
    var s = ot(), u = Rn(t), h = ln(s, u);
    h.tag = 2, r != null && (h.callback = r), r = Pn(t, h, u), r !== null && (jt(r, t, u, s), ds(r, t, u));
  } };
  function oh(t, r, s, u, h, y, _) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(u, y, _) : r.prototype && r.prototype.isPureReactComponent ? !Io(s, u) || !Io(h, y) : !0;
  }
  function ih(t, r, s) {
    var u = !1, h = kn, y = r.contextType;
    return typeof y == "object" && y !== null ? y = kt(y) : (h = ut(r) ? Qn : qe.current, u = r.contextTypes, y = (u = u != null) ? Fr(t, h) : kn), r = new r(s, y), t.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = Ss, t.stateNode = r, r._reactInternals = t, u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = h, t.__reactInternalMemoizedMaskedChildContext = y), r;
  }
  function sh(t, r, s, u) {
    t = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(s, u), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(s, u), r.state !== t && Ss.enqueueReplaceState(r, r.state, null);
  }
  function iu(t, r, s, u) {
    var h = t.stateNode;
    h.props = s, h.state = t.memoizedState, h.refs = {}, Wl(t);
    var y = r.contextType;
    typeof y == "object" && y !== null ? h.context = kt(y) : (y = ut(r) ? Qn : qe.current, h.context = Fr(t, y)), h.state = t.memoizedState, y = r.getDerivedStateFromProps, typeof y == "function" && (ou(t, r, y, s), h.state = t.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof h.getSnapshotBeforeUpdate == "function" || typeof h.UNSAFE_componentWillMount != "function" && typeof h.componentWillMount != "function" || (r = h.state, typeof h.componentWillMount == "function" && h.componentWillMount(), typeof h.UNSAFE_componentWillMount == "function" && h.UNSAFE_componentWillMount(), r !== h.state && Ss.enqueueReplaceState(h, h.state, null), fs(t, s, h, u), h.state = t.memoizedState), typeof h.componentDidMount == "function" && (t.flags |= 4194308);
  }
  function $r(t, r) {
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
  function su(t, r, s) {
    return { value: t, source: null, stack: s ?? null, digest: r ?? null };
  }
  function au(t, r) {
    try {
      console.error(r.value);
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  var o_ = typeof WeakMap == "function" ? WeakMap : Map;
  function ah(t, r, s) {
    s = ln(-1, s), s.tag = 3, s.payload = { element: null };
    var u = r.value;
    return s.callback = function() {
      Cs || (Cs = !0, xu = u), au(t, r);
    }, s;
  }
  function lh(t, r, s) {
    s = ln(-1, s), s.tag = 3;
    var u = t.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var h = r.value;
      s.payload = function() {
        return u(h);
      }, s.callback = function() {
        au(t, r);
      };
    }
    var y = t.stateNode;
    return y !== null && typeof y.componentDidCatch == "function" && (s.callback = function() {
      au(t, r), typeof u != "function" && (Mn === null ? Mn = /* @__PURE__ */ new Set([this]) : Mn.add(this));
      var _ = r.stack;
      this.componentDidCatch(r.value, { componentStack: _ !== null ? _ : "" });
    }), s;
  }
  function uh(t, r, s) {
    var u = t.pingCache;
    if (u === null) {
      u = t.pingCache = new o_();
      var h = /* @__PURE__ */ new Set();
      u.set(r, h);
    } else h = u.get(r), h === void 0 && (h = /* @__PURE__ */ new Set(), u.set(r, h));
    h.has(s) || (h.add(s), t = v_.bind(null, t, r, s), r.then(t, t));
  }
  function ch(t) {
    do {
      var r;
      if ((r = t.tag === 13) && (r = t.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r) return t;
      t = t.return;
    } while (t !== null);
    return null;
  }
  function dh(t, r, s, u, h) {
    return (t.mode & 1) === 0 ? (t === r ? t.flags |= 65536 : (t.flags |= 128, s.flags |= 131072, s.flags &= -52805, s.tag === 1 && (s.alternate === null ? s.tag = 17 : (r = ln(-1, 1), r.tag = 2, Pn(s, r, 1))), s.lanes |= 1), t) : (t.flags |= 65536, t.lanes = h, t);
  }
  var i_ = N.ReactCurrentOwner, ct = !1;
  function rt(t, r, s, u) {
    r.child = t === null ? Rp(r, null, s, u) : Vr(r, t.child, s, u);
  }
  function fh(t, r, s, u, h) {
    s = s.render;
    var y = r.ref;
    return zr(r, h), u = Jl(t, r, s, u, y, h), s = ql(), t !== null && !ct ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~h, un(t, r, h)) : (Re && s && Fl(r), r.flags |= 1, rt(t, r, u, h), r.child);
  }
  function ph(t, r, s, u, h) {
    if (t === null) {
      var y = s.type;
      return typeof y == "function" && !Mu(y) && y.defaultProps === void 0 && s.compare === null && s.defaultProps === void 0 ? (r.tag = 15, r.type = y, hh(t, r, y, u, h)) : (t = Ds(s.type, null, u, r, r.mode, h), t.ref = r.ref, t.return = r, r.child = t);
    }
    if (y = t.child, (t.lanes & h) === 0) {
      var _ = y.memoizedProps;
      if (s = s.compare, s = s !== null ? s : Io, s(_, u) && t.ref === r.ref) return un(t, r, h);
    }
    return r.flags |= 1, t = Nn(y, u), t.ref = r.ref, t.return = r, r.child = t;
  }
  function hh(t, r, s, u, h) {
    if (t !== null) {
      var y = t.memoizedProps;
      if (Io(y, u) && t.ref === r.ref) if (ct = !1, r.pendingProps = u = y, (t.lanes & h) !== 0) (t.flags & 131072) !== 0 && (ct = !0);
      else return r.lanes = t.lanes, un(t, r, h);
    }
    return lu(t, r, s, u, h);
  }
  function mh(t, r, s) {
    var u = r.pendingProps, h = u.children, y = t !== null ? t.memoizedState : null;
    if (u.mode === "hidden") if ((r.mode & 1) === 0) r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Pe(Wr, St), St |= s;
    else {
      if ((s & 1073741824) === 0) return t = y !== null ? y.baseLanes | s : s, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: t, cachePool: null, transitions: null }, r.updateQueue = null, Pe(Wr, St), St |= t, null;
      r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, u = y !== null ? y.baseLanes : s, Pe(Wr, St), St |= u;
    }
    else y !== null ? (u = y.baseLanes | s, r.memoizedState = null) : u = s, Pe(Wr, St), St |= u;
    return rt(t, r, h, s), r.child;
  }
  function yh(t, r) {
    var s = r.ref;
    (t === null && s !== null || t !== null && t.ref !== s) && (r.flags |= 512, r.flags |= 2097152);
  }
  function lu(t, r, s, u, h) {
    var y = ut(s) ? Qn : qe.current;
    return y = Fr(r, y), zr(r, h), s = Jl(t, r, s, u, y, h), u = ql(), t !== null && !ct ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~h, un(t, r, h)) : (Re && u && Fl(r), r.flags |= 1, rt(t, r, s, h), r.child);
  }
  function gh(t, r, s, u, h) {
    if (ut(s)) {
      var y = !0;
      rs(r);
    } else y = !1;
    if (zr(r, h), r.stateNode === null) _s(t, r), ih(r, s, u), iu(r, s, u, h), u = !0;
    else if (t === null) {
      var _ = r.stateNode, P = r.memoizedProps;
      _.props = P;
      var M = _.context, O = s.contextType;
      typeof O == "object" && O !== null ? O = kt(O) : (O = ut(s) ? Qn : qe.current, O = Fr(r, O));
      var U = s.getDerivedStateFromProps, H = typeof U == "function" || typeof _.getSnapshotBeforeUpdate == "function";
      H || typeof _.UNSAFE_componentWillReceiveProps != "function" && typeof _.componentWillReceiveProps != "function" || (P !== u || M !== O) && sh(r, _, u, O), Cn = !1;
      var z = r.memoizedState;
      _.state = z, fs(r, u, _, h), M = r.memoizedState, P !== u || z !== M || lt.current || Cn ? (typeof U == "function" && (ou(r, s, U, u), M = r.memoizedState), (P = Cn || oh(r, s, P, u, z, M, O)) ? (H || typeof _.UNSAFE_componentWillMount != "function" && typeof _.componentWillMount != "function" || (typeof _.componentWillMount == "function" && _.componentWillMount(), typeof _.UNSAFE_componentWillMount == "function" && _.UNSAFE_componentWillMount()), typeof _.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof _.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = u, r.memoizedState = M), _.props = u, _.state = M, _.context = O, u = P) : (typeof _.componentDidMount == "function" && (r.flags |= 4194308), u = !1);
    } else {
      _ = r.stateNode, Np(t, r), P = r.memoizedProps, O = r.type === r.elementType ? P : It(r.type, P), _.props = O, H = r.pendingProps, z = _.context, M = s.contextType, typeof M == "object" && M !== null ? M = kt(M) : (M = ut(s) ? Qn : qe.current, M = Fr(r, M));
      var J = s.getDerivedStateFromProps;
      (U = typeof J == "function" || typeof _.getSnapshotBeforeUpdate == "function") || typeof _.UNSAFE_componentWillReceiveProps != "function" && typeof _.componentWillReceiveProps != "function" || (P !== H || z !== M) && sh(r, _, u, M), Cn = !1, z = r.memoizedState, _.state = z, fs(r, u, _, h);
      var te = r.memoizedState;
      P !== H || z !== te || lt.current || Cn ? (typeof J == "function" && (ou(r, s, J, u), te = r.memoizedState), (O = Cn || oh(r, s, O, u, z, te, M) || !1) ? (U || typeof _.UNSAFE_componentWillUpdate != "function" && typeof _.componentWillUpdate != "function" || (typeof _.componentWillUpdate == "function" && _.componentWillUpdate(u, te, M), typeof _.UNSAFE_componentWillUpdate == "function" && _.UNSAFE_componentWillUpdate(u, te, M)), typeof _.componentDidUpdate == "function" && (r.flags |= 4), typeof _.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof _.componentDidUpdate != "function" || P === t.memoizedProps && z === t.memoizedState || (r.flags |= 4), typeof _.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && z === t.memoizedState || (r.flags |= 1024), r.memoizedProps = u, r.memoizedState = te), _.props = u, _.state = te, _.context = M, u = O) : (typeof _.componentDidUpdate != "function" || P === t.memoizedProps && z === t.memoizedState || (r.flags |= 4), typeof _.getSnapshotBeforeUpdate != "function" || P === t.memoizedProps && z === t.memoizedState || (r.flags |= 1024), u = !1);
    }
    return uu(t, r, s, u, y, h);
  }
  function uu(t, r, s, u, h, y) {
    yh(t, r);
    var _ = (r.flags & 128) !== 0;
    if (!u && !_) return h && xp(r, s, !1), un(t, r, y);
    u = r.stateNode, i_.current = r;
    var P = _ && typeof s.getDerivedStateFromError != "function" ? null : u.render();
    return r.flags |= 1, t !== null && _ ? (r.child = Vr(r, t.child, null, y), r.child = Vr(r, null, P, y)) : rt(t, r, P, y), r.memoizedState = u.state, h && xp(r, s, !0), r.child;
  }
  function vh(t) {
    var r = t.stateNode;
    r.pendingContext ? wp(t, r.pendingContext, r.pendingContext !== r.context) : r.context && wp(t, r.context, !1), Gl(t, r.containerInfo);
  }
  function Sh(t, r, s, u, h) {
    return Lr(), Vl(h), r.flags |= 256, rt(t, r, s, u), r.child;
  }
  var cu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function du(t) {
    return { baseLanes: t, cachePool: null, transitions: null };
  }
  function wh(t, r, s) {
    var u = r.pendingProps, h = De.current, y = !1, _ = (r.flags & 128) !== 0, P;
    if ((P = _) || (P = t !== null && t.memoizedState === null ? !1 : (h & 2) !== 0), P ? (y = !0, r.flags &= -129) : (t === null || t.memoizedState !== null) && (h |= 1), Pe(De, h & 1), t === null)
      return Ll(r), t = r.memoizedState, t !== null && (t = t.dehydrated, t !== null) ? ((r.mode & 1) === 0 ? r.lanes = 1 : t.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824, null) : (_ = u.children, t = u.fallback, y ? (u = r.mode, y = r.child, _ = { mode: "hidden", children: _ }, (u & 1) === 0 && y !== null ? (y.childLanes = 0, y.pendingProps = _) : y = Ns(_, u, 0, null), t = ir(t, u, s, null), y.return = r, t.return = r, y.sibling = t, r.child = y, r.child.memoizedState = du(s), r.memoizedState = cu, t) : fu(r, _));
    if (h = t.memoizedState, h !== null && (P = h.dehydrated, P !== null)) return s_(t, r, _, u, P, h, s);
    if (y) {
      y = u.fallback, _ = r.mode, h = t.child, P = h.sibling;
      var M = { mode: "hidden", children: u.children };
      return (_ & 1) === 0 && r.child !== h ? (u = r.child, u.childLanes = 0, u.pendingProps = M, r.deletions = null) : (u = Nn(h, M), u.subtreeFlags = h.subtreeFlags & 14680064), P !== null ? y = Nn(P, y) : (y = ir(y, _, s, null), y.flags |= 2), y.return = r, u.return = r, u.sibling = y, r.child = u, u = y, y = r.child, _ = t.child.memoizedState, _ = _ === null ? du(s) : { baseLanes: _.baseLanes | s, cachePool: null, transitions: _.transitions }, y.memoizedState = _, y.childLanes = t.childLanes & ~s, r.memoizedState = cu, u;
    }
    return y = t.child, t = y.sibling, u = Nn(y, { mode: "visible", children: u.children }), (r.mode & 1) === 0 && (u.lanes = s), u.return = r, u.sibling = null, t !== null && (s = r.deletions, s === null ? (r.deletions = [t], r.flags |= 16) : s.push(t)), r.child = u, r.memoizedState = null, u;
  }
  function fu(t, r) {
    return r = Ns({ mode: "visible", children: r }, t.mode, 0, null), r.return = t, t.child = r;
  }
  function ws(t, r, s, u) {
    return u !== null && Vl(u), Vr(r, t.child, null, s), t = fu(r, r.pendingProps.children), t.flags |= 2, r.memoizedState = null, t;
  }
  function s_(t, r, s, u, h, y, _) {
    if (s)
      return r.flags & 256 ? (r.flags &= -257, u = su(Error(o(422))), ws(t, r, _, u)) : r.memoizedState !== null ? (r.child = t.child, r.flags |= 128, null) : (y = u.fallback, h = r.mode, u = Ns({ mode: "visible", children: u.children }, h, 0, null), y = ir(y, h, _, null), y.flags |= 2, u.return = r, y.return = r, u.sibling = y, r.child = u, (r.mode & 1) !== 0 && Vr(r, t.child, null, _), r.child.memoizedState = du(_), r.memoizedState = cu, y);
    if ((r.mode & 1) === 0) return ws(t, r, _, null);
    if (h.data === "$!") {
      if (u = h.nextSibling && h.nextSibling.dataset, u) var P = u.dgst;
      return u = P, y = Error(o(419)), u = su(y, u, void 0), ws(t, r, _, u);
    }
    if (P = (_ & t.childLanes) !== 0, ct || P) {
      if (u = He, u !== null) {
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
        h = (h & (u.suspendedLanes | _)) !== 0 ? 0 : h, h !== 0 && h !== y.retryLane && (y.retryLane = h, an(t, h), jt(u, t, h, -1));
      }
      return Eu(), u = su(Error(o(421))), ws(t, r, _, u);
    }
    return h.data === "$?" ? (r.flags |= 128, r.child = t.child, r = S_.bind(null, t), h._reactRetry = r, null) : (t = y.treeContext, vt = xn(h.nextSibling), gt = r, Re = !0, Nt = null, t !== null && (xt[Tt++] = on, xt[Tt++] = sn, xt[Tt++] = Xn, on = t.id, sn = t.overflow, Xn = r), r = fu(r, u.children), r.flags |= 4096, r);
  }
  function _h(t, r, s) {
    t.lanes |= r;
    var u = t.alternate;
    u !== null && (u.lanes |= r), $l(t.return, r, s);
  }
  function pu(t, r, s, u, h) {
    var y = t.memoizedState;
    y === null ? t.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: u, tail: s, tailMode: h } : (y.isBackwards = r, y.rendering = null, y.renderingStartTime = 0, y.last = u, y.tail = s, y.tailMode = h);
  }
  function xh(t, r, s) {
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
    if (Pe(De, u), (r.mode & 1) === 0) r.memoizedState = null;
    else switch (h) {
      case "forwards":
        for (s = r.child, h = null; s !== null; ) t = s.alternate, t !== null && ps(t) === null && (h = s), s = s.sibling;
        s = h, s === null ? (h = r.child, r.child = null) : (h = s.sibling, s.sibling = null), pu(r, !1, h, s, y);
        break;
      case "backwards":
        for (s = null, h = r.child, r.child = null; h !== null; ) {
          if (t = h.alternate, t !== null && ps(t) === null) {
            r.child = h;
            break;
          }
          t = h.sibling, h.sibling = s, s = h, h = t;
        }
        pu(r, !0, s, null, y);
        break;
      case "together":
        pu(r, !1, null, null, void 0);
        break;
      default:
        r.memoizedState = null;
    }
    return r.child;
  }
  function _s(t, r) {
    (r.mode & 1) === 0 && t !== null && (t.alternate = null, r.alternate = null, r.flags |= 2);
  }
  function un(t, r, s) {
    if (t !== null && (r.dependencies = t.dependencies), tr |= r.lanes, (s & r.childLanes) === 0) return null;
    if (t !== null && r.child !== t.child) throw Error(o(153));
    if (r.child !== null) {
      for (t = r.child, s = Nn(t, t.pendingProps), r.child = s, s.return = r; t.sibling !== null; ) t = t.sibling, s = s.sibling = Nn(t, t.pendingProps), s.return = r;
      s.sibling = null;
    }
    return r.child;
  }
  function a_(t, r, s) {
    switch (r.tag) {
      case 3:
        vh(r), Lr();
        break;
      case 5:
        Op(r);
        break;
      case 1:
        ut(r.type) && rs(r);
        break;
      case 4:
        Gl(r, r.stateNode.containerInfo);
        break;
      case 10:
        var u = r.type._context, h = r.memoizedProps.value;
        Pe(us, u._currentValue), u._currentValue = h;
        break;
      case 13:
        if (u = r.memoizedState, u !== null)
          return u.dehydrated !== null ? (Pe(De, De.current & 1), r.flags |= 128, null) : (s & r.child.childLanes) !== 0 ? wh(t, r, s) : (Pe(De, De.current & 1), t = un(t, r, s), t !== null ? t.sibling : null);
        Pe(De, De.current & 1);
        break;
      case 19:
        if (u = (s & r.childLanes) !== 0, (t.flags & 128) !== 0) {
          if (u) return xh(t, r, s);
          r.flags |= 128;
        }
        if (h = r.memoizedState, h !== null && (h.rendering = null, h.tail = null, h.lastEffect = null), Pe(De, De.current), u) break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, mh(t, r, s);
    }
    return un(t, r, s);
  }
  var Th, hu, kh, Ah;
  Th = function(t, r) {
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
  }, hu = function() {
  }, kh = function(t, r, s, u) {
    var h = t.memoizedProps;
    if (h !== u) {
      t = r.stateNode, qn(Ht.current);
      var y = null;
      switch (s) {
        case "input":
          h = $a(t, h), u = $a(t, u), y = [];
          break;
        case "select":
          h = Y({}, h, { value: void 0 }), u = Y({}, u, { value: void 0 }), y = [];
          break;
        case "textarea":
          h = Ga(t, h), u = Ga(t, u), y = [];
          break;
        default:
          typeof h.onClick != "function" && typeof u.onClick == "function" && (t.onclick = es);
      }
      Ya(s, u);
      var _;
      s = null;
      for (O in h) if (!u.hasOwnProperty(O) && h.hasOwnProperty(O) && h[O] != null) if (O === "style") {
        var P = h[O];
        for (_ in P) P.hasOwnProperty(_) && (s || (s = {}), s[_] = "");
      } else O !== "dangerouslySetInnerHTML" && O !== "children" && O !== "suppressContentEditableWarning" && O !== "suppressHydrationWarning" && O !== "autoFocus" && (a.hasOwnProperty(O) ? y || (y = []) : (y = y || []).push(O, null));
      for (O in u) {
        var M = u[O];
        if (P = h != null ? h[O] : void 0, u.hasOwnProperty(O) && M !== P && (M != null || P != null)) if (O === "style") if (P) {
          for (_ in P) !P.hasOwnProperty(_) || M && M.hasOwnProperty(_) || (s || (s = {}), s[_] = "");
          for (_ in M) M.hasOwnProperty(_) && P[_] !== M[_] && (s || (s = {}), s[_] = M[_]);
        } else s || (y || (y = []), y.push(
          O,
          s
        )), s = M;
        else O === "dangerouslySetInnerHTML" ? (M = M ? M.__html : void 0, P = P ? P.__html : void 0, M != null && P !== M && (y = y || []).push(O, M)) : O === "children" ? typeof M != "string" && typeof M != "number" || (y = y || []).push(O, "" + M) : O !== "suppressContentEditableWarning" && O !== "suppressHydrationWarning" && (a.hasOwnProperty(O) ? (M != null && O === "onScroll" && Ee("scroll", t), y || P === M || (y = [])) : (y = y || []).push(O, M));
      }
      s && (y = y || []).push("style", s);
      var O = y;
      (r.updateQueue = O) && (r.flags |= 4);
    }
  }, Ah = function(t, r, s, u) {
    s !== u && (r.flags |= 4);
  };
  function Qo(t, r) {
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
  function l_(t, r, s) {
    var u = r.pendingProps;
    switch (Ol(r), r.tag) {
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
        return ut(r.type) && ns(), tt(r), null;
      case 3:
        return u = r.stateNode, Ur(), Me(lt), Me(qe), Ql(), u.pendingContext && (u.context = u.pendingContext, u.pendingContext = null), (t === null || t.child === null) && (as(r) ? r.flags |= 4 : t === null || t.memoizedState.isDehydrated && (r.flags & 256) === 0 || (r.flags |= 1024, Nt !== null && (Au(Nt), Nt = null))), hu(t, r), tt(r), null;
      case 5:
        Kl(r);
        var h = qn(Ho.current);
        if (s = r.type, t !== null && r.stateNode != null) kh(t, r, s, u, h), t.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!u) {
            if (r.stateNode === null) throw Error(o(166));
            return tt(r), null;
          }
          if (t = qn(Ht.current), as(r)) {
            u = r.stateNode, s = r.type;
            var y = r.memoizedProps;
            switch (u[$t] = r, u[Vo] = y, t = (r.mode & 1) !== 0, s) {
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
                for (h = 0; h < Oo.length; h++) Ee(Oo[h], u);
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
                of(u, y), Ee("invalid", u);
                break;
              case "select":
                u._wrapperState = { wasMultiple: !!y.multiple }, Ee("invalid", u);
                break;
              case "textarea":
                lf(u, y), Ee("invalid", u);
            }
            Ya(s, y), h = null;
            for (var _ in y) if (y.hasOwnProperty(_)) {
              var P = y[_];
              _ === "children" ? typeof P == "string" ? u.textContent !== P && (y.suppressHydrationWarning !== !0 && qi(u.textContent, P, t), h = ["children", P]) : typeof P == "number" && u.textContent !== "" + P && (y.suppressHydrationWarning !== !0 && qi(
                u.textContent,
                P,
                t
              ), h = ["children", "" + P]) : a.hasOwnProperty(_) && P != null && _ === "onScroll" && Ee("scroll", u);
            }
            switch (s) {
              case "input":
                bi(u), af(u, y, !0);
                break;
              case "textarea":
                bi(u), cf(u);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof y.onClick == "function" && (u.onclick = es);
            }
            u = h, r.updateQueue = u, u !== null && (r.flags |= 4);
          } else {
            _ = h.nodeType === 9 ? h : h.ownerDocument, t === "http://www.w3.org/1999/xhtml" && (t = df(s)), t === "http://www.w3.org/1999/xhtml" ? s === "script" ? (t = _.createElement("div"), t.innerHTML = "<script><\/script>", t = t.removeChild(t.firstChild)) : typeof u.is == "string" ? t = _.createElement(s, { is: u.is }) : (t = _.createElement(s), s === "select" && (_ = t, u.multiple ? _.multiple = !0 : u.size && (_.size = u.size))) : t = _.createElementNS(t, s), t[$t] = r, t[Vo] = u, Th(t, r, !1, !1), r.stateNode = t;
            e: {
              switch (_ = Qa(s, u), s) {
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
                  for (h = 0; h < Oo.length; h++) Ee(Oo[h], t);
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
                  of(t, u), h = $a(t, u), Ee("invalid", t);
                  break;
                case "option":
                  h = u;
                  break;
                case "select":
                  t._wrapperState = { wasMultiple: !!u.multiple }, h = Y({}, u, { value: void 0 }), Ee("invalid", t);
                  break;
                case "textarea":
                  lf(t, u), h = Ga(t, u), Ee("invalid", t);
                  break;
                default:
                  h = u;
              }
              Ya(s, h), P = h;
              for (y in P) if (P.hasOwnProperty(y)) {
                var M = P[y];
                y === "style" ? hf(t, M) : y === "dangerouslySetInnerHTML" ? (M = M ? M.__html : void 0, M != null && ff(t, M)) : y === "children" ? typeof M == "string" ? (s !== "textarea" || M !== "") && go(t, M) : typeof M == "number" && go(t, "" + M) : y !== "suppressContentEditableWarning" && y !== "suppressHydrationWarning" && y !== "autoFocus" && (a.hasOwnProperty(y) ? M != null && y === "onScroll" && Ee("scroll", t) : M != null && R(t, y, M, _));
              }
              switch (s) {
                case "input":
                  bi(t), af(t, u, !1);
                  break;
                case "textarea":
                  bi(t), cf(t);
                  break;
                case "option":
                  u.value != null && t.setAttribute("value", "" + we(u.value));
                  break;
                case "select":
                  t.multiple = !!u.multiple, y = u.value, y != null ? Tr(t, !!u.multiple, y, !1) : u.defaultValue != null && Tr(
                    t,
                    !!u.multiple,
                    u.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof h.onClick == "function" && (t.onclick = es);
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
        if (t && r.stateNode != null) Ah(t, r, t.memoizedProps, u);
        else {
          if (typeof u != "string" && r.stateNode === null) throw Error(o(166));
          if (s = qn(Ho.current), qn(Ht.current), as(r)) {
            if (u = r.stateNode, s = r.memoizedProps, u[$t] = r, (y = u.nodeValue !== s) && (t = gt, t !== null)) switch (t.tag) {
              case 3:
                qi(u.nodeValue, s, (t.mode & 1) !== 0);
                break;
              case 5:
                t.memoizedProps.suppressHydrationWarning !== !0 && qi(u.nodeValue, s, (t.mode & 1) !== 0);
            }
            y && (r.flags |= 4);
          } else u = (s.nodeType === 9 ? s : s.ownerDocument).createTextNode(u), u[$t] = r, r.stateNode = u;
        }
        return tt(r), null;
      case 13:
        if (Me(De), u = r.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (Re && vt !== null && (r.mode & 1) !== 0 && (r.flags & 128) === 0) Ep(), Lr(), r.flags |= 98560, y = !1;
          else if (y = as(r), u !== null && u.dehydrated !== null) {
            if (t === null) {
              if (!y) throw Error(o(318));
              if (y = r.memoizedState, y = y !== null ? y.dehydrated : null, !y) throw Error(o(317));
              y[$t] = r;
            } else Lr(), (r.flags & 128) === 0 && (r.memoizedState = null), r.flags |= 4;
            tt(r), y = !1;
          } else Nt !== null && (Au(Nt), Nt = null), y = !0;
          if (!y) return r.flags & 65536 ? r : null;
        }
        return (r.flags & 128) !== 0 ? (r.lanes = s, r) : (u = u !== null, u !== (t !== null && t.memoizedState !== null) && u && (r.child.flags |= 8192, (r.mode & 1) !== 0 && (t === null || (De.current & 1) !== 0 ? ze === 0 && (ze = 3) : Eu())), r.updateQueue !== null && (r.flags |= 4), tt(r), null);
      case 4:
        return Ur(), hu(t, r), t === null && jo(r.stateNode.containerInfo), tt(r), null;
      case 10:
        return Ul(r.type._context), tt(r), null;
      case 17:
        return ut(r.type) && ns(), tt(r), null;
      case 19:
        if (Me(De), y = r.memoizedState, y === null) return tt(r), null;
        if (u = (r.flags & 128) !== 0, _ = y.rendering, _ === null) if (u) Qo(y, !1);
        else {
          if (ze !== 0 || t !== null && (t.flags & 128) !== 0) for (t = r.child; t !== null; ) {
            if (_ = ps(t), _ !== null) {
              for (r.flags |= 128, Qo(y, !1), u = _.updateQueue, u !== null && (r.updateQueue = u, r.flags |= 4), r.subtreeFlags = 0, u = s, s = r.child; s !== null; ) y = s, t = u, y.flags &= 14680066, _ = y.alternate, _ === null ? (y.childLanes = 0, y.lanes = t, y.child = null, y.subtreeFlags = 0, y.memoizedProps = null, y.memoizedState = null, y.updateQueue = null, y.dependencies = null, y.stateNode = null) : (y.childLanes = _.childLanes, y.lanes = _.lanes, y.child = _.child, y.subtreeFlags = 0, y.deletions = null, y.memoizedProps = _.memoizedProps, y.memoizedState = _.memoizedState, y.updateQueue = _.updateQueue, y.type = _.type, t = _.dependencies, y.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), s = s.sibling;
              return Pe(De, De.current & 1 | 2), r.child;
            }
            t = t.sibling;
          }
          y.tail !== null && Oe() > Gr && (r.flags |= 128, u = !0, Qo(y, !1), r.lanes = 4194304);
        }
        else {
          if (!u) if (t = ps(_), t !== null) {
            if (r.flags |= 128, u = !0, s = t.updateQueue, s !== null && (r.updateQueue = s, r.flags |= 4), Qo(y, !0), y.tail === null && y.tailMode === "hidden" && !_.alternate && !Re) return tt(r), null;
          } else 2 * Oe() - y.renderingStartTime > Gr && s !== 1073741824 && (r.flags |= 128, u = !0, Qo(y, !1), r.lanes = 4194304);
          y.isBackwards ? (_.sibling = r.child, r.child = _) : (s = y.last, s !== null ? s.sibling = _ : r.child = _, y.last = _);
        }
        return y.tail !== null ? (r = y.tail, y.rendering = r, y.tail = r.sibling, y.renderingStartTime = Oe(), r.sibling = null, s = De.current, Pe(De, u ? s & 1 | 2 : s & 1), r) : (tt(r), null);
      case 22:
      case 23:
        return Pu(), u = r.memoizedState !== null, t !== null && t.memoizedState !== null !== u && (r.flags |= 8192), u && (r.mode & 1) !== 0 ? (St & 1073741824) !== 0 && (tt(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : tt(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(o(156, r.tag));
  }
  function u_(t, r) {
    switch (Ol(r), r.tag) {
      case 1:
        return ut(r.type) && ns(), t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 3:
        return Ur(), Me(lt), Me(qe), Ql(), t = r.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (r.flags = t & -65537 | 128, r) : null;
      case 5:
        return Kl(r), null;
      case 13:
        if (Me(De), t = r.memoizedState, t !== null && t.dehydrated !== null) {
          if (r.alternate === null) throw Error(o(340));
          Lr();
        }
        return t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 19:
        return Me(De), null;
      case 4:
        return Ur(), null;
      case 10:
        return Ul(r.type._context), null;
      case 22:
      case 23:
        return Pu(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var xs = !1, nt = !1, c_ = typeof WeakSet == "function" ? WeakSet : Set, ee = null;
  function Hr(t, r) {
    var s = t.ref;
    if (s !== null) if (typeof s == "function") try {
      s(null);
    } catch (u) {
      Fe(t, r, u);
    }
    else s.current = null;
  }
  function mu(t, r, s) {
    try {
      s();
    } catch (u) {
      Fe(t, r, u);
    }
  }
  var Ch = !1;
  function d_(t, r) {
    if (Pl = Ui, t = op(), Sl(t)) {
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
          var _ = 0, P = -1, M = -1, O = 0, U = 0, H = t, z = null;
          t: for (; ; ) {
            for (var J; H !== s || h !== 0 && H.nodeType !== 3 || (P = _ + h), H !== y || u !== 0 && H.nodeType !== 3 || (M = _ + u), H.nodeType === 3 && (_ += H.nodeValue.length), (J = H.firstChild) !== null; )
              z = H, H = J;
            for (; ; ) {
              if (H === t) break t;
              if (z === s && ++O === h && (P = _), z === y && ++U === u && (M = _), (J = H.nextSibling) !== null) break;
              H = z, z = H.parentNode;
            }
            H = J;
          }
          s = P === -1 || M === -1 ? null : { start: P, end: M };
        } else s = null;
      }
      s = s || { start: 0, end: 0 };
    } else s = null;
    for (El = { focusedElem: t, selectionRange: s }, Ui = !1, ee = r; ee !== null; ) if (r = ee, t = r.child, (r.subtreeFlags & 1028) !== 0 && t !== null) t.return = r, ee = t;
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
              var re = te.memoizedProps, je = te.memoizedState, I = r.stateNode, b = I.getSnapshotBeforeUpdate(r.elementType === r.type ? re : It(r.type, re), je);
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
            throw Error(o(163));
        }
      } catch (W) {
        Fe(r, r.return, W);
      }
      if (t = r.sibling, t !== null) {
        t.return = r.return, ee = t;
        break;
      }
      ee = r.return;
    }
    return te = Ch, Ch = !1, te;
  }
  function Xo(t, r, s) {
    var u = r.updateQueue;
    if (u = u !== null ? u.lastEffect : null, u !== null) {
      var h = u = u.next;
      do {
        if ((h.tag & t) === t) {
          var y = h.destroy;
          h.destroy = void 0, y !== void 0 && mu(r, s, y);
        }
        h = h.next;
      } while (h !== u);
    }
  }
  function Ts(t, r) {
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
  function yu(t) {
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
  function Ph(t) {
    var r = t.alternate;
    r !== null && (t.alternate = null, Ph(r)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (r = t.stateNode, r !== null && (delete r[$t], delete r[Vo], delete r[Dl], delete r[Kw], delete r[Yw])), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  function Eh(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 4;
  }
  function Mh(t) {
    e: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || Eh(t.return)) return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
        if (t.flags & 2 || t.child === null || t.tag === 4) continue e;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function gu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.nodeType === 8 ? s.parentNode.insertBefore(t, r) : s.insertBefore(t, r) : (s.nodeType === 8 ? (r = s.parentNode, r.insertBefore(t, s)) : (r = s, r.appendChild(t)), s = s._reactRootContainer, s != null || r.onclick !== null || (r.onclick = es));
    else if (u !== 4 && (t = t.child, t !== null)) for (gu(t, r, s), t = t.sibling; t !== null; ) gu(t, r, s), t = t.sibling;
  }
  function vu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.insertBefore(t, r) : s.appendChild(t);
    else if (u !== 4 && (t = t.child, t !== null)) for (vu(t, r, s), t = t.sibling; t !== null; ) vu(t, r, s), t = t.sibling;
  }
  var Qe = null, Ft = !1;
  function En(t, r, s) {
    for (s = s.child; s !== null; ) bh(t, r, s), s = s.sibling;
  }
  function bh(t, r, s) {
    if (Ut && typeof Ut.onCommitFiberUnmount == "function") try {
      Ut.onCommitFiberUnmount(Oi, s);
    } catch {
    }
    switch (s.tag) {
      case 5:
        nt || Hr(s, r);
      case 6:
        var u = Qe, h = Ft;
        Qe = null, En(t, r, s), Qe = u, Ft = h, Qe !== null && (Ft ? (t = Qe, s = s.stateNode, t.nodeType === 8 ? t.parentNode.removeChild(s) : t.removeChild(s)) : Qe.removeChild(s.stateNode));
        break;
      case 18:
        Qe !== null && (Ft ? (t = Qe, s = s.stateNode, t.nodeType === 8 ? Rl(t.parentNode, s) : t.nodeType === 1 && Rl(t, s), Eo(t)) : Rl(Qe, s.stateNode));
        break;
      case 4:
        u = Qe, h = Ft, Qe = s.stateNode.containerInfo, Ft = !0, En(t, r, s), Qe = u, Ft = h;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!nt && (u = s.updateQueue, u !== null && (u = u.lastEffect, u !== null))) {
          h = u = u.next;
          do {
            var y = h, _ = y.destroy;
            y = y.tag, _ !== void 0 && ((y & 2) !== 0 || (y & 4) !== 0) && mu(s, r, _), h = h.next;
          } while (h !== u);
        }
        En(t, r, s);
        break;
      case 1:
        if (!nt && (Hr(s, r), u = s.stateNode, typeof u.componentWillUnmount == "function")) try {
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
  function Rh(t) {
    var r = t.updateQueue;
    if (r !== null) {
      t.updateQueue = null;
      var s = t.stateNode;
      s === null && (s = t.stateNode = new c_()), r.forEach(function(u) {
        var h = w_.bind(null, t, u);
        s.has(u) || (s.add(u), u.then(h, h));
      });
    }
  }
  function Ot(t, r) {
    var s = r.deletions;
    if (s !== null) for (var u = 0; u < s.length; u++) {
      var h = s[u];
      try {
        var y = t, _ = r, P = _;
        e: for (; P !== null; ) {
          switch (P.tag) {
            case 5:
              Qe = P.stateNode, Ft = !1;
              break e;
            case 3:
              Qe = P.stateNode.containerInfo, Ft = !0;
              break e;
            case 4:
              Qe = P.stateNode.containerInfo, Ft = !0;
              break e;
          }
          P = P.return;
        }
        if (Qe === null) throw Error(o(160));
        bh(y, _, h), Qe = null, Ft = !1;
        var M = h.alternate;
        M !== null && (M.return = null), h.return = null;
      } catch (O) {
        Fe(h, r, O);
      }
    }
    if (r.subtreeFlags & 12854) for (r = r.child; r !== null; ) Dh(r, t), r = r.sibling;
  }
  function Dh(t, r) {
    var s = t.alternate, u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Ot(r, t), Gt(t), u & 4) {
          try {
            Xo(3, t, t.return), Ts(3, t);
          } catch (re) {
            Fe(t, t.return, re);
          }
          try {
            Xo(5, t, t.return);
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        break;
      case 1:
        Ot(r, t), Gt(t), u & 512 && s !== null && Hr(s, s.return);
        break;
      case 5:
        if (Ot(r, t), Gt(t), u & 512 && s !== null && Hr(s, s.return), t.flags & 32) {
          var h = t.stateNode;
          try {
            go(h, "");
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        if (u & 4 && (h = t.stateNode, h != null)) {
          var y = t.memoizedProps, _ = s !== null ? s.memoizedProps : y, P = t.type, M = t.updateQueue;
          if (t.updateQueue = null, M !== null) try {
            P === "input" && y.type === "radio" && y.name != null && sf(h, y), Qa(P, _);
            var O = Qa(P, y);
            for (_ = 0; _ < M.length; _ += 2) {
              var U = M[_], H = M[_ + 1];
              U === "style" ? hf(h, H) : U === "dangerouslySetInnerHTML" ? ff(h, H) : U === "children" ? go(h, H) : R(h, U, H, O);
            }
            switch (P) {
              case "input":
                Ha(h, y);
                break;
              case "textarea":
                uf(h, y);
                break;
              case "select":
                var z = h._wrapperState.wasMultiple;
                h._wrapperState.wasMultiple = !!y.multiple;
                var J = y.value;
                J != null ? Tr(h, !!y.multiple, J, !1) : z !== !!y.multiple && (y.defaultValue != null ? Tr(
                  h,
                  !!y.multiple,
                  y.defaultValue,
                  !0
                ) : Tr(h, !!y.multiple, y.multiple ? [] : "", !1));
            }
            h[Vo] = y;
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        break;
      case 6:
        if (Ot(r, t), Gt(t), u & 4) {
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
        if (Ot(r, t), Gt(t), u & 4 && s !== null && s.memoizedState.isDehydrated) try {
          Eo(r.containerInfo);
        } catch (re) {
          Fe(t, t.return, re);
        }
        break;
      case 4:
        Ot(r, t), Gt(t);
        break;
      case 13:
        Ot(r, t), Gt(t), h = t.child, h.flags & 8192 && (y = h.memoizedState !== null, h.stateNode.isHidden = y, !y || h.alternate !== null && h.alternate.memoizedState !== null || (_u = Oe())), u & 4 && Rh(t);
        break;
      case 22:
        if (U = s !== null && s.memoizedState !== null, t.mode & 1 ? (nt = (O = nt) || U, Ot(r, t), nt = O) : Ot(r, t), Gt(t), u & 8192) {
          if (O = t.memoizedState !== null, (t.stateNode.isHidden = O) && !U && (t.mode & 1) !== 0) for (ee = t, U = t.child; U !== null; ) {
            for (H = ee = U; ee !== null; ) {
              switch (z = ee, J = z.child, z.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Xo(4, z, z.return);
                  break;
                case 1:
                  Hr(z, z.return);
                  var te = z.stateNode;
                  if (typeof te.componentWillUnmount == "function") {
                    u = z, s = z.return;
                    try {
                      r = u, te.props = r.memoizedProps, te.state = r.memoizedState, te.componentWillUnmount();
                    } catch (re) {
                      Fe(u, s, re);
                    }
                  }
                  break;
                case 5:
                  Hr(z, z.return);
                  break;
                case 22:
                  if (z.memoizedState !== null) {
                    Fh(H);
                    continue;
                  }
              }
              J !== null ? (J.return = z, ee = J) : Fh(H);
            }
            U = U.sibling;
          }
          e: for (U = null, H = t; ; ) {
            if (H.tag === 5) {
              if (U === null) {
                U = H;
                try {
                  h = H.stateNode, O ? (y = h.style, typeof y.setProperty == "function" ? y.setProperty("display", "none", "important") : y.display = "none") : (P = H.stateNode, M = H.memoizedProps.style, _ = M != null && M.hasOwnProperty("display") ? M.display : null, P.style.display = pf("display", _));
                } catch (re) {
                  Fe(t, t.return, re);
                }
              }
            } else if (H.tag === 6) {
              if (U === null) try {
                H.stateNode.nodeValue = O ? "" : H.memoizedProps;
              } catch (re) {
                Fe(t, t.return, re);
              }
            } else if ((H.tag !== 22 && H.tag !== 23 || H.memoizedState === null || H === t) && H.child !== null) {
              H.child.return = H, H = H.child;
              continue;
            }
            if (H === t) break e;
            for (; H.sibling === null; ) {
              if (H.return === null || H.return === t) break e;
              U === H && (U = null), H = H.return;
            }
            U === H && (U = null), H.sibling.return = H.return, H = H.sibling;
          }
        }
        break;
      case 19:
        Ot(r, t), Gt(t), u & 4 && Rh(t);
        break;
      case 21:
        break;
      default:
        Ot(
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
            if (Eh(s)) {
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
            u.flags & 32 && (go(h, ""), u.flags &= -33);
            var y = Mh(t);
            vu(t, y, h);
            break;
          case 3:
          case 4:
            var _ = u.stateNode.containerInfo, P = Mh(t);
            gu(t, P, _);
            break;
          default:
            throw Error(o(161));
        }
      } catch (M) {
        Fe(t, t.return, M);
      }
      t.flags &= -3;
    }
    r & 4096 && (t.flags &= -4097);
  }
  function f_(t, r, s) {
    ee = t, Nh(t);
  }
  function Nh(t, r, s) {
    for (var u = (t.mode & 1) !== 0; ee !== null; ) {
      var h = ee, y = h.child;
      if (h.tag === 22 && u) {
        var _ = h.memoizedState !== null || xs;
        if (!_) {
          var P = h.alternate, M = P !== null && P.memoizedState !== null || nt;
          P = xs;
          var O = nt;
          if (xs = _, (nt = M) && !O) for (ee = h; ee !== null; ) _ = ee, M = _.child, _.tag === 22 && _.memoizedState !== null ? Oh(h) : M !== null ? (M.return = _, ee = M) : Oh(h);
          for (; y !== null; ) ee = y, Nh(y), y = y.sibling;
          ee = h, xs = P, nt = O;
        }
        Ih(t);
      } else (h.subtreeFlags & 8772) !== 0 && y !== null ? (y.return = h, ee = y) : Ih(t);
    }
  }
  function Ih(t) {
    for (; ee !== null; ) {
      var r = ee;
      if ((r.flags & 8772) !== 0) {
        var s = r.alternate;
        try {
          if ((r.flags & 8772) !== 0) switch (r.tag) {
            case 0:
            case 11:
            case 15:
              nt || Ts(5, r);
              break;
            case 1:
              var u = r.stateNode;
              if (r.flags & 4 && !nt) if (s === null) u.componentDidMount();
              else {
                var h = r.elementType === r.type ? s.memoizedProps : It(r.type, s.memoizedProps);
                u.componentDidUpdate(h, s.memoizedState, u.__reactInternalSnapshotBeforeUpdate);
              }
              var y = r.updateQueue;
              y !== null && Fp(r, y, u);
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
                Fp(r, _, s);
              }
              break;
            case 5:
              var P = r.stateNode;
              if (s === null && r.flags & 4) {
                s = P;
                var M = r.memoizedProps;
                switch (r.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    M.autoFocus && s.focus();
                    break;
                  case "img":
                    M.src && (s.src = M.src);
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
                  var U = O.memoizedState;
                  if (U !== null) {
                    var H = U.dehydrated;
                    H !== null && Eo(H);
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
          nt || r.flags & 512 && yu(r);
        } catch (z) {
          Fe(r, r.return, z);
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
  function Fh(t) {
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
  function Oh(t) {
    for (; ee !== null; ) {
      var r = ee;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var s = r.return;
            try {
              Ts(4, r);
            } catch (M) {
              Fe(r, s, M);
            }
            break;
          case 1:
            var u = r.stateNode;
            if (typeof u.componentDidMount == "function") {
              var h = r.return;
              try {
                u.componentDidMount();
              } catch (M) {
                Fe(r, h, M);
              }
            }
            var y = r.return;
            try {
              yu(r);
            } catch (M) {
              Fe(r, y, M);
            }
            break;
          case 5:
            var _ = r.return;
            try {
              yu(r);
            } catch (M) {
              Fe(r, _, M);
            }
        }
      } catch (M) {
        Fe(r, r.return, M);
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
  var p_ = Math.ceil, ks = N.ReactCurrentDispatcher, Su = N.ReactCurrentOwner, Ct = N.ReactCurrentBatchConfig, he = 0, He = null, Le = null, Xe = 0, St = 0, Wr = Tn(0), ze = 0, Zo = null, tr = 0, As = 0, wu = 0, Jo = null, dt = null, _u = 0, Gr = 1 / 0, cn = null, Cs = !1, xu = null, Mn = null, Ps = !1, bn = null, Es = 0, qo = 0, Tu = null, Ms = -1, bs = 0;
  function ot() {
    return (he & 6) !== 0 ? Oe() : Ms !== -1 ? Ms : Ms = Oe();
  }
  function Rn(t) {
    return (t.mode & 1) === 0 ? 1 : (he & 2) !== 0 && Xe !== 0 ? Xe & -Xe : Xw.transition !== null ? (bs === 0 && (bs = Mf()), bs) : (t = _e, t !== 0 || (t = window.event, t = t === void 0 ? 16 : Lf(t.type)), t);
  }
  function jt(t, r, s, u) {
    if (50 < qo) throw qo = 0, Tu = null, Error(o(185));
    To(t, s, u), ((he & 2) === 0 || t !== He) && (t === He && ((he & 2) === 0 && (As |= s), ze === 4 && Dn(t, Xe)), ft(t, u), s === 1 && he === 0 && (r.mode & 1) === 0 && (Gr = Oe() + 500, os && An()));
  }
  function ft(t, r) {
    var s = t.callbackNode;
    XS(t, r);
    var u = Vi(t, t === He ? Xe : 0);
    if (u === 0) s !== null && Cf(s), t.callbackNode = null, t.callbackPriority = 0;
    else if (r = u & -u, t.callbackPriority !== r) {
      if (s != null && Cf(s), r === 1) t.tag === 0 ? Qw(Lh.bind(null, t)) : Tp(Lh.bind(null, t)), Ww(function() {
        (he & 6) === 0 && An();
      }), s = null;
      else {
        switch (bf(u)) {
          case 1:
            s = nl;
            break;
          case 4:
            s = Pf;
            break;
          case 16:
            s = Fi;
            break;
          case 536870912:
            s = Ef;
            break;
          default:
            s = Fi;
        }
        s = Gh(s, jh.bind(null, t));
      }
      t.callbackPriority = r, t.callbackNode = s;
    }
  }
  function jh(t, r) {
    if (Ms = -1, bs = 0, (he & 6) !== 0) throw Error(o(327));
    var s = t.callbackNode;
    if (Kr() && t.callbackNode !== s) return null;
    var u = Vi(t, t === He ? Xe : 0);
    if (u === 0) return null;
    if ((u & 30) !== 0 || (u & t.expiredLanes) !== 0 || r) r = Rs(t, u);
    else {
      r = u;
      var h = he;
      he |= 2;
      var y = Bh();
      (He !== t || Xe !== r) && (cn = null, Gr = Oe() + 500, rr(t, r));
      do
        try {
          y_();
          break;
        } catch (P) {
          Vh(t, P);
        }
      while (!0);
      zl(), ks.current = y, he = h, Le !== null ? r = 0 : (He = null, Xe = 0, r = ze);
    }
    if (r !== 0) {
      if (r === 2 && (h = rl(t), h !== 0 && (u = h, r = ku(t, h))), r === 1) throw s = Zo, rr(t, 0), Dn(t, u), ft(t, Oe()), s;
      if (r === 6) Dn(t, u);
      else {
        if (h = t.current.alternate, (u & 30) === 0 && !h_(h) && (r = Rs(t, u), r === 2 && (y = rl(t), y !== 0 && (u = y, r = ku(t, y))), r === 1)) throw s = Zo, rr(t, 0), Dn(t, u), ft(t, Oe()), s;
        switch (t.finishedWork = h, t.finishedLanes = u, r) {
          case 0:
          case 1:
            throw Error(o(345));
          case 2:
            or(t, dt, cn);
            break;
          case 3:
            if (Dn(t, u), (u & 130023424) === u && (r = _u + 500 - Oe(), 10 < r)) {
              if (Vi(t, 0) !== 0) break;
              if (h = t.suspendedLanes, (h & u) !== u) {
                ot(), t.pingedLanes |= t.suspendedLanes & h;
                break;
              }
              t.timeoutHandle = bl(or.bind(null, t, dt, cn), r);
              break;
            }
            or(t, dt, cn);
            break;
          case 4:
            if (Dn(t, u), (u & 4194240) === u) break;
            for (r = t.eventTimes, h = -1; 0 < u; ) {
              var _ = 31 - Rt(u);
              y = 1 << _, _ = r[_], _ > h && (h = _), u &= ~y;
            }
            if (u = h, u = Oe() - u, u = (120 > u ? 120 : 480 > u ? 480 : 1080 > u ? 1080 : 1920 > u ? 1920 : 3e3 > u ? 3e3 : 4320 > u ? 4320 : 1960 * p_(u / 1960)) - u, 10 < u) {
              t.timeoutHandle = bl(or.bind(null, t, dt, cn), u);
              break;
            }
            or(t, dt, cn);
            break;
          case 5:
            or(t, dt, cn);
            break;
          default:
            throw Error(o(329));
        }
      }
    }
    return ft(t, Oe()), t.callbackNode === s ? jh.bind(null, t) : null;
  }
  function ku(t, r) {
    var s = Jo;
    return t.current.memoizedState.isDehydrated && (rr(t, r).flags |= 256), t = Rs(t, r), t !== 2 && (r = dt, dt = s, r !== null && Au(r)), t;
  }
  function Au(t) {
    dt === null ? dt = t : dt.push.apply(dt, t);
  }
  function h_(t) {
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
    for (r &= ~wu, r &= ~As, t.suspendedLanes |= r, t.pingedLanes &= ~r, t = t.expirationTimes; 0 < r; ) {
      var s = 31 - Rt(r), u = 1 << s;
      t[s] = -1, r &= ~u;
    }
  }
  function Lh(t) {
    if ((he & 6) !== 0) throw Error(o(327));
    Kr();
    var r = Vi(t, 0);
    if ((r & 1) === 0) return ft(t, Oe()), null;
    var s = Rs(t, r);
    if (t.tag !== 0 && s === 2) {
      var u = rl(t);
      u !== 0 && (r = u, s = ku(t, u));
    }
    if (s === 1) throw s = Zo, rr(t, 0), Dn(t, r), ft(t, Oe()), s;
    if (s === 6) throw Error(o(345));
    return t.finishedWork = t.current.alternate, t.finishedLanes = r, or(t, dt, cn), ft(t, Oe()), null;
  }
  function Cu(t, r) {
    var s = he;
    he |= 1;
    try {
      return t(r);
    } finally {
      he = s, he === 0 && (Gr = Oe() + 500, os && An());
    }
  }
  function nr(t) {
    bn !== null && bn.tag === 0 && (he & 6) === 0 && Kr();
    var r = he;
    he |= 1;
    var s = Ct.transition, u = _e;
    try {
      if (Ct.transition = null, _e = 1, t) return t();
    } finally {
      _e = u, Ct.transition = s, he = r, (he & 6) === 0 && An();
    }
  }
  function Pu() {
    St = Wr.current, Me(Wr);
  }
  function rr(t, r) {
    t.finishedWork = null, t.finishedLanes = 0;
    var s = t.timeoutHandle;
    if (s !== -1 && (t.timeoutHandle = -1, Hw(s)), Le !== null) for (s = Le.return; s !== null; ) {
      var u = s;
      switch (Ol(u), u.tag) {
        case 1:
          u = u.type.childContextTypes, u != null && ns();
          break;
        case 3:
          Ur(), Me(lt), Me(qe), Ql();
          break;
        case 5:
          Kl(u);
          break;
        case 4:
          Ur();
          break;
        case 13:
          Me(De);
          break;
        case 19:
          Me(De);
          break;
        case 10:
          Ul(u.type._context);
          break;
        case 22:
        case 23:
          Pu();
      }
      s = s.return;
    }
    if (He = t, Le = t = Nn(t.current, null), Xe = St = r, ze = 0, Zo = null, wu = As = tr = 0, dt = Jo = null, Jn !== null) {
      for (r = 0; r < Jn.length; r++) if (s = Jn[r], u = s.interleaved, u !== null) {
        s.interleaved = null;
        var h = u.next, y = s.pending;
        if (y !== null) {
          var _ = y.next;
          y.next = h, u.next = _;
        }
        s.pending = u;
      }
      Jn = null;
    }
    return t;
  }
  function Vh(t, r) {
    do {
      var s = Le;
      try {
        if (zl(), hs.current = vs, ms) {
          for (var u = Ne.memoizedState; u !== null; ) {
            var h = u.queue;
            h !== null && (h.pending = null), u = u.next;
          }
          ms = !1;
        }
        if (er = 0, $e = Be = Ne = null, Wo = !1, Go = 0, Su.current = null, s === null || s.return === null) {
          ze = 1, Zo = r, Le = null;
          break;
        }
        e: {
          var y = t, _ = s.return, P = s, M = r;
          if (r = Xe, P.flags |= 32768, M !== null && typeof M == "object" && typeof M.then == "function") {
            var O = M, U = P, H = U.tag;
            if ((U.mode & 1) === 0 && (H === 0 || H === 11 || H === 15)) {
              var z = U.alternate;
              z ? (U.updateQueue = z.updateQueue, U.memoizedState = z.memoizedState, U.lanes = z.lanes) : (U.updateQueue = null, U.memoizedState = null);
            }
            var J = ch(_);
            if (J !== null) {
              J.flags &= -257, dh(J, _, P, y, r), J.mode & 1 && uh(y, O, r), r = J, M = O;
              var te = r.updateQueue;
              if (te === null) {
                var re = /* @__PURE__ */ new Set();
                re.add(M), r.updateQueue = re;
              } else te.add(M);
              break e;
            } else {
              if ((r & 1) === 0) {
                uh(y, O, r), Eu();
                break e;
              }
              M = Error(o(426));
            }
          } else if (Re && P.mode & 1) {
            var je = ch(_);
            if (je !== null) {
              (je.flags & 65536) === 0 && (je.flags |= 256), dh(je, _, P, y, r), Vl($r(M, P));
              break e;
            }
          }
          y = M = $r(M, P), ze !== 4 && (ze = 2), Jo === null ? Jo = [y] : Jo.push(y), y = _;
          do {
            switch (y.tag) {
              case 3:
                y.flags |= 65536, r &= -r, y.lanes |= r;
                var I = ah(y, M, r);
                Ip(y, I);
                break e;
              case 1:
                P = M;
                var b = y.type, F = y.stateNode;
                if ((y.flags & 128) === 0 && (typeof b.getDerivedStateFromError == "function" || F !== null && typeof F.componentDidCatch == "function" && (Mn === null || !Mn.has(F)))) {
                  y.flags |= 65536, r &= -r, y.lanes |= r;
                  var W = lh(y, P, r);
                  Ip(y, W);
                  break e;
                }
            }
            y = y.return;
          } while (y !== null);
        }
        Uh(s);
      } catch (oe) {
        r = oe, Le === s && s !== null && (Le = s = s.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Bh() {
    var t = ks.current;
    return ks.current = vs, t === null ? vs : t;
  }
  function Eu() {
    (ze === 0 || ze === 3 || ze === 2) && (ze = 4), He === null || (tr & 268435455) === 0 && (As & 268435455) === 0 || Dn(He, Xe);
  }
  function Rs(t, r) {
    var s = he;
    he |= 2;
    var u = Bh();
    (He !== t || Xe !== r) && (cn = null, rr(t, r));
    do
      try {
        m_();
        break;
      } catch (h) {
        Vh(t, h);
      }
    while (!0);
    if (zl(), he = s, ks.current = u, Le !== null) throw Error(o(261));
    return He = null, Xe = 0, ze;
  }
  function m_() {
    for (; Le !== null; ) zh(Le);
  }
  function y_() {
    for (; Le !== null && !zS(); ) zh(Le);
  }
  function zh(t) {
    var r = Wh(t.alternate, t, St);
    t.memoizedProps = t.pendingProps, r === null ? Uh(t) : Le = r, Su.current = null;
  }
  function Uh(t) {
    var r = t;
    do {
      var s = r.alternate;
      if (t = r.return, (r.flags & 32768) === 0) {
        if (s = l_(s, r, St), s !== null) {
          Le = s;
          return;
        }
      } else {
        if (s = u_(s, r), s !== null) {
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
  function or(t, r, s) {
    var u = _e, h = Ct.transition;
    try {
      Ct.transition = null, _e = 1, g_(t, r, s, u);
    } finally {
      Ct.transition = h, _e = u;
    }
    return null;
  }
  function g_(t, r, s, u) {
    do
      Kr();
    while (bn !== null);
    if ((he & 6) !== 0) throw Error(o(327));
    s = t.finishedWork;
    var h = t.finishedLanes;
    if (s === null) return null;
    if (t.finishedWork = null, t.finishedLanes = 0, s === t.current) throw Error(o(177));
    t.callbackNode = null, t.callbackPriority = 0;
    var y = s.lanes | s.childLanes;
    if (ZS(t, y), t === He && (Le = He = null, Xe = 0), (s.subtreeFlags & 2064) === 0 && (s.flags & 2064) === 0 || Ps || (Ps = !0, Gh(Fi, function() {
      return Kr(), null;
    })), y = (s.flags & 15990) !== 0, (s.subtreeFlags & 15990) !== 0 || y) {
      y = Ct.transition, Ct.transition = null;
      var _ = _e;
      _e = 1;
      var P = he;
      he |= 4, Su.current = null, d_(t, s), Dh(s, t), jw(El), Ui = !!Pl, El = Pl = null, t.current = s, f_(s), US(), he = P, _e = _, Ct.transition = y;
    } else t.current = s;
    if (Ps && (Ps = !1, bn = t, Es = h), y = t.pendingLanes, y === 0 && (Mn = null), WS(s.stateNode), ft(t, Oe()), r !== null) for (u = t.onRecoverableError, s = 0; s < r.length; s++) h = r[s], u(h.value, { componentStack: h.stack, digest: h.digest });
    if (Cs) throw Cs = !1, t = xu, xu = null, t;
    return (Es & 1) !== 0 && t.tag !== 0 && Kr(), y = t.pendingLanes, (y & 1) !== 0 ? t === Tu ? qo++ : (qo = 0, Tu = t) : qo = 0, An(), null;
  }
  function Kr() {
    if (bn !== null) {
      var t = bf(Es), r = Ct.transition, s = _e;
      try {
        if (Ct.transition = null, _e = 16 > t ? 16 : t, bn === null) var u = !1;
        else {
          if (t = bn, bn = null, Es = 0, (he & 6) !== 0) throw Error(o(331));
          var h = he;
          for (he |= 4, ee = t.current; ee !== null; ) {
            var y = ee, _ = y.child;
            if ((ee.flags & 16) !== 0) {
              var P = y.deletions;
              if (P !== null) {
                for (var M = 0; M < P.length; M++) {
                  var O = P[M];
                  for (ee = O; ee !== null; ) {
                    var U = ee;
                    switch (U.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Xo(8, U, y);
                    }
                    var H = U.child;
                    if (H !== null) H.return = U, ee = H;
                    else for (; ee !== null; ) {
                      U = ee;
                      var z = U.sibling, J = U.return;
                      if (Ph(U), U === O) {
                        ee = null;
                        break;
                      }
                      if (z !== null) {
                        z.return = J, ee = z;
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
                      var je = re.sibling;
                      re.sibling = null, re = je;
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
                  Xo(9, y, y.return);
              }
              var I = y.sibling;
              if (I !== null) {
                I.return = y.return, ee = I;
                break e;
              }
              ee = y.return;
            }
          }
          var b = t.current;
          for (ee = b; ee !== null; ) {
            _ = ee;
            var F = _.child;
            if ((_.subtreeFlags & 2064) !== 0 && F !== null) F.return = _, ee = F;
            else e: for (_ = b; ee !== null; ) {
              if (P = ee, (P.flags & 2048) !== 0) try {
                switch (P.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Ts(9, P);
                }
              } catch (oe) {
                Fe(P, P.return, oe);
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
          if (he = h, An(), Ut && typeof Ut.onPostCommitFiberRoot == "function") try {
            Ut.onPostCommitFiberRoot(Oi, t);
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
  function $h(t, r, s) {
    r = $r(s, r), r = ah(t, r, 1), t = Pn(t, r, 1), r = ot(), t !== null && (To(t, 1, r), ft(t, r));
  }
  function Fe(t, r, s) {
    if (t.tag === 3) $h(t, t, s);
    else for (; r !== null; ) {
      if (r.tag === 3) {
        $h(r, t, s);
        break;
      } else if (r.tag === 1) {
        var u = r.stateNode;
        if (typeof r.type.getDerivedStateFromError == "function" || typeof u.componentDidCatch == "function" && (Mn === null || !Mn.has(u))) {
          t = $r(s, t), t = lh(r, t, 1), r = Pn(r, t, 1), t = ot(), r !== null && (To(r, 1, t), ft(r, t));
          break;
        }
      }
      r = r.return;
    }
  }
  function v_(t, r, s) {
    var u = t.pingCache;
    u !== null && u.delete(r), r = ot(), t.pingedLanes |= t.suspendedLanes & s, He === t && (Xe & s) === s && (ze === 4 || ze === 3 && (Xe & 130023424) === Xe && 500 > Oe() - _u ? rr(t, 0) : wu |= s), ft(t, r);
  }
  function Hh(t, r) {
    r === 0 && ((t.mode & 1) === 0 ? r = 1 : (r = Li, Li <<= 1, (Li & 130023424) === 0 && (Li = 4194304)));
    var s = ot();
    t = an(t, r), t !== null && (To(t, r, s), ft(t, s));
  }
  function S_(t) {
    var r = t.memoizedState, s = 0;
    r !== null && (s = r.retryLane), Hh(t, s);
  }
  function w_(t, r) {
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
    u !== null && u.delete(r), Hh(t, s);
  }
  var Wh;
  Wh = function(t, r, s) {
    if (t !== null) if (t.memoizedProps !== r.pendingProps || lt.current) ct = !0;
    else {
      if ((t.lanes & s) === 0 && (r.flags & 128) === 0) return ct = !1, a_(t, r, s);
      ct = (t.flags & 131072) !== 0;
    }
    else ct = !1, Re && (r.flags & 1048576) !== 0 && kp(r, ss, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var u = r.type;
        _s(t, r), t = r.pendingProps;
        var h = Fr(r, qe.current);
        zr(r, s), h = Jl(null, r, u, t, h, s);
        var y = ql();
        return r.flags |= 1, typeof h == "object" && h !== null && typeof h.render == "function" && h.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, ut(u) ? (y = !0, rs(r)) : y = !1, r.memoizedState = h.state !== null && h.state !== void 0 ? h.state : null, Wl(r), h.updater = Ss, r.stateNode = h, h._reactInternals = r, iu(r, u, t, s), r = uu(null, r, u, !0, y, s)) : (r.tag = 0, Re && y && Fl(r), rt(null, r, h, s), r = r.child), r;
      case 16:
        u = r.elementType;
        e: {
          switch (_s(t, r), t = r.pendingProps, h = u._init, u = h(u._payload), r.type = u, h = r.tag = x_(u), t = It(u, t), h) {
            case 0:
              r = lu(null, r, u, t, s);
              break e;
            case 1:
              r = gh(null, r, u, t, s);
              break e;
            case 11:
              r = fh(null, r, u, t, s);
              break e;
            case 14:
              r = ph(null, r, u, It(u.type, t), s);
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
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : It(u, h), lu(t, r, u, h, s);
      case 1:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : It(u, h), gh(t, r, u, h, s);
      case 3:
        e: {
          if (vh(r), t === null) throw Error(o(387));
          u = r.pendingProps, y = r.memoizedState, h = y.element, Np(t, r), fs(r, u, null, s);
          var _ = r.memoizedState;
          if (u = _.element, y.isDehydrated) if (y = { element: u, isDehydrated: !1, cache: _.cache, pendingSuspenseBoundaries: _.pendingSuspenseBoundaries, transitions: _.transitions }, r.updateQueue.baseState = y, r.memoizedState = y, r.flags & 256) {
            h = $r(Error(o(423)), r), r = Sh(t, r, u, s, h);
            break e;
          } else if (u !== h) {
            h = $r(Error(o(424)), r), r = Sh(t, r, u, s, h);
            break e;
          } else for (vt = xn(r.stateNode.containerInfo.firstChild), gt = r, Re = !0, Nt = null, s = Rp(r, null, u, s), r.child = s; s; ) s.flags = s.flags & -3 | 4096, s = s.sibling;
          else {
            if (Lr(), u === h) {
              r = un(t, r, s);
              break e;
            }
            rt(t, r, u, s);
          }
          r = r.child;
        }
        return r;
      case 5:
        return Op(r), t === null && Ll(r), u = r.type, h = r.pendingProps, y = t !== null ? t.memoizedProps : null, _ = h.children, Ml(u, h) ? _ = null : y !== null && Ml(u, y) && (r.flags |= 32), yh(t, r), rt(t, r, _, s), r.child;
      case 6:
        return t === null && Ll(r), null;
      case 13:
        return wh(t, r, s);
      case 4:
        return Gl(r, r.stateNode.containerInfo), u = r.pendingProps, t === null ? r.child = Vr(r, null, u, s) : rt(t, r, u, s), r.child;
      case 11:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : It(u, h), fh(t, r, u, h, s);
      case 7:
        return rt(t, r, r.pendingProps, s), r.child;
      case 8:
        return rt(t, r, r.pendingProps.children, s), r.child;
      case 12:
        return rt(t, r, r.pendingProps.children, s), r.child;
      case 10:
        e: {
          if (u = r.type._context, h = r.pendingProps, y = r.memoizedProps, _ = h.value, Pe(us, u._currentValue), u._currentValue = _, y !== null) if (Dt(y.value, _)) {
            if (y.children === h.children && !lt.current) {
              r = un(t, r, s);
              break e;
            }
          } else for (y = r.child, y !== null && (y.return = r); y !== null; ) {
            var P = y.dependencies;
            if (P !== null) {
              _ = y.child;
              for (var M = P.firstContext; M !== null; ) {
                if (M.context === u) {
                  if (y.tag === 1) {
                    M = ln(-1, s & -s), M.tag = 2;
                    var O = y.updateQueue;
                    if (O !== null) {
                      O = O.shared;
                      var U = O.pending;
                      U === null ? M.next = M : (M.next = U.next, U.next = M), O.pending = M;
                    }
                  }
                  y.lanes |= s, M = y.alternate, M !== null && (M.lanes |= s), $l(
                    y.return,
                    s,
                    r
                  ), P.lanes |= s;
                  break;
                }
                M = M.next;
              }
            } else if (y.tag === 10) _ = y.type === r.type ? null : y.child;
            else if (y.tag === 18) {
              if (_ = y.return, _ === null) throw Error(o(341));
              _.lanes |= s, P = _.alternate, P !== null && (P.lanes |= s), $l(_, s, r), _ = y.sibling;
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
          rt(t, r, h.children, s), r = r.child;
        }
        return r;
      case 9:
        return h = r.type, u = r.pendingProps.children, zr(r, s), h = kt(h), u = u(h), r.flags |= 1, rt(t, r, u, s), r.child;
      case 14:
        return u = r.type, h = It(u, r.pendingProps), h = It(u.type, h), ph(t, r, u, h, s);
      case 15:
        return hh(t, r, r.type, r.pendingProps, s);
      case 17:
        return u = r.type, h = r.pendingProps, h = r.elementType === u ? h : It(u, h), _s(t, r), r.tag = 1, ut(u) ? (t = !0, rs(r)) : t = !1, zr(r, s), ih(r, u, h), iu(r, u, h, s), uu(null, r, u, !0, t, s);
      case 19:
        return xh(t, r, s);
      case 22:
        return mh(t, r, s);
    }
    throw Error(o(156, r.tag));
  };
  function Gh(t, r) {
    return Af(t, r);
  }
  function __(t, r, s, u) {
    this.tag = t, this.key = s, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = u, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Pt(t, r, s, u) {
    return new __(t, r, s, u);
  }
  function Mu(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function x_(t) {
    if (typeof t == "function") return Mu(t) ? 1 : 0;
    if (t != null) {
      if (t = t.$$typeof, t === q) return 11;
      if (t === xe) return 14;
    }
    return 2;
  }
  function Nn(t, r) {
    var s = t.alternate;
    return s === null ? (s = Pt(t.tag, r, t.key, t.mode), s.elementType = t.elementType, s.type = t.type, s.stateNode = t.stateNode, s.alternate = t, t.alternate = s) : (s.pendingProps = r, s.type = t.type, s.flags = 0, s.subtreeFlags = 0, s.deletions = null), s.flags = t.flags & 14680064, s.childLanes = t.childLanes, s.lanes = t.lanes, s.child = t.child, s.memoizedProps = t.memoizedProps, s.memoizedState = t.memoizedState, s.updateQueue = t.updateQueue, r = t.dependencies, s.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, s.sibling = t.sibling, s.index = t.index, s.ref = t.ref, s;
  }
  function Ds(t, r, s, u, h, y) {
    var _ = 2;
    if (u = t, typeof t == "function") Mu(t) && (_ = 1);
    else if (typeof t == "string") _ = 5;
    else e: switch (t) {
      case V:
        return ir(s.children, h, y, r);
      case G:
        _ = 8, h |= 8;
        break;
      case K:
        return t = Pt(12, s, r, h | 2), t.elementType = K, t.lanes = y, t;
      case de:
        return t = Pt(13, s, r, h), t.elementType = de, t.lanes = y, t;
      case ue:
        return t = Pt(19, s, r, h), t.elementType = ue, t.lanes = y, t;
      case Se:
        return Ns(s, h, y, r);
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
          case xe:
            _ = 14;
            break e;
          case ve:
            _ = 16, u = null;
            break e;
        }
        throw Error(o(130, t == null ? t : typeof t, ""));
    }
    return r = Pt(_, s, r, h), r.elementType = t, r.type = u, r.lanes = y, r;
  }
  function ir(t, r, s, u) {
    return t = Pt(7, t, u, r), t.lanes = s, t;
  }
  function Ns(t, r, s, u) {
    return t = Pt(22, t, u, r), t.elementType = Se, t.lanes = s, t.stateNode = { isHidden: !1 }, t;
  }
  function bu(t, r, s) {
    return t = Pt(6, t, null, r), t.lanes = s, t;
  }
  function Ru(t, r, s) {
    return r = Pt(4, t.children !== null ? t.children : [], t.key, r), r.lanes = s, r.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, r;
  }
  function T_(t, r, s, u, h) {
    this.tag = r, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = ol(0), this.expirationTimes = ol(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ol(0), this.identifierPrefix = u, this.onRecoverableError = h, this.mutableSourceEagerHydrationData = null;
  }
  function Du(t, r, s, u, h, y, _, P, M) {
    return t = new T_(t, r, s, P, M), r === 1 ? (r = 1, y === !0 && (r |= 8)) : r = 0, y = Pt(3, null, null, r), t.current = y, y.stateNode = t, y.memoizedState = { element: u, isDehydrated: s, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Wl(y), t;
  }
  function k_(t, r, s) {
    var u = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: L, key: u == null ? null : "" + u, children: t, containerInfo: r, implementation: s };
  }
  function Kh(t) {
    if (!t) return kn;
    t = t._reactInternals;
    e: {
      if (Kn(t) !== t || t.tag !== 1) throw Error(o(170));
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
  function Yh(t, r, s, u, h, y, _, P, M) {
    return t = Du(s, u, !0, t, h, y, _, P, M), t.context = Kh(null), s = t.current, u = ot(), h = Rn(s), y = ln(u, h), y.callback = r ?? null, Pn(s, y, h), t.current.lanes = h, To(t, h, u), ft(t, u), t;
  }
  function Is(t, r, s, u) {
    var h = r.current, y = ot(), _ = Rn(h);
    return s = Kh(s), r.context === null ? r.context = s : r.pendingContext = s, r = ln(y, _), r.payload = { element: t }, u = u === void 0 ? null : u, u !== null && (r.callback = u), t = Pn(h, r, _), t !== null && (jt(t, h, _, y), ds(t, h, _)), _;
  }
  function Fs(t) {
    if (t = t.current, !t.child) return null;
    switch (t.child.tag) {
      case 5:
        return t.child.stateNode;
      default:
        return t.child.stateNode;
    }
  }
  function Qh(t, r) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var s = t.retryLane;
      t.retryLane = s !== 0 && s < r ? s : r;
    }
  }
  function Nu(t, r) {
    Qh(t, r), (t = t.alternate) && Qh(t, r);
  }
  function A_() {
    return null;
  }
  var Xh = typeof reportError == "function" ? reportError : function(t) {
    console.error(t);
  };
  function Iu(t) {
    this._internalRoot = t;
  }
  Os.prototype.render = Iu.prototype.render = function(t) {
    var r = this._internalRoot;
    if (r === null) throw Error(o(409));
    Is(t, r, null, null);
  }, Os.prototype.unmount = Iu.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var r = t.containerInfo;
      nr(function() {
        Is(null, t, null, null);
      }), r[nn] = null;
    }
  };
  function Os(t) {
    this._internalRoot = t;
  }
  Os.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var r = Nf();
      t = { blockedOn: null, target: t, priority: r };
      for (var s = 0; s < Sn.length && r !== 0 && r < Sn[s].priority; s++) ;
      Sn.splice(s, 0, t), s === 0 && Of(t);
    }
  };
  function Fu(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function js(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11 && (t.nodeType !== 8 || t.nodeValue !== " react-mount-point-unstable "));
  }
  function Zh() {
  }
  function C_(t, r, s, u, h) {
    if (h) {
      if (typeof u == "function") {
        var y = u;
        u = function() {
          var O = Fs(_);
          y.call(O);
        };
      }
      var _ = Yh(r, u, t, 0, null, !1, !1, "", Zh);
      return t._reactRootContainer = _, t[nn] = _.current, jo(t.nodeType === 8 ? t.parentNode : t), nr(), _;
    }
    for (; h = t.lastChild; ) t.removeChild(h);
    if (typeof u == "function") {
      var P = u;
      u = function() {
        var O = Fs(M);
        P.call(O);
      };
    }
    var M = Du(t, 0, !1, null, null, !1, !1, "", Zh);
    return t._reactRootContainer = M, t[nn] = M.current, jo(t.nodeType === 8 ? t.parentNode : t), nr(function() {
      Is(r, M, s, u);
    }), M;
  }
  function Ls(t, r, s, u, h) {
    var y = s._reactRootContainer;
    if (y) {
      var _ = y;
      if (typeof h == "function") {
        var P = h;
        h = function() {
          var M = Fs(_);
          P.call(M);
        };
      }
      Is(r, _, t, h);
    } else _ = C_(s, r, t, h, u);
    return Fs(_);
  }
  Rf = function(t) {
    switch (t.tag) {
      case 3:
        var r = t.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var s = xo(r.pendingLanes);
          s !== 0 && (il(r, s | 1), ft(r, Oe()), (he & 6) === 0 && (Gr = Oe() + 500, An()));
        }
        break;
      case 13:
        nr(function() {
          var u = an(t, 1);
          if (u !== null) {
            var h = ot();
            jt(u, t, 1, h);
          }
        }), Nu(t, 1);
    }
  }, sl = function(t) {
    if (t.tag === 13) {
      var r = an(t, 134217728);
      if (r !== null) {
        var s = ot();
        jt(r, t, 134217728, s);
      }
      Nu(t, 134217728);
    }
  }, Df = function(t) {
    if (t.tag === 13) {
      var r = Rn(t), s = an(t, r);
      if (s !== null) {
        var u = ot();
        jt(s, t, r, u);
      }
      Nu(t, r);
    }
  }, Nf = function() {
    return _e;
  }, If = function(t, r) {
    var s = _e;
    try {
      return _e = t, r();
    } finally {
      _e = s;
    }
  }, Ja = function(t, r, s) {
    switch (r) {
      case "input":
        if (Ha(t, s), r = s.name, s.type === "radio" && r != null) {
          for (s = t; s.parentNode; ) s = s.parentNode;
          for (s = s.querySelectorAll("input[name=" + JSON.stringify("" + r) + '][type="radio"]'), r = 0; r < s.length; r++) {
            var u = s[r];
            if (u !== t && u.form === t.form) {
              var h = ts(u);
              if (!h) throw Error(o(90));
              rf(u), Ha(u, h);
            }
          }
        }
        break;
      case "textarea":
        uf(t, s);
        break;
      case "select":
        r = s.value, r != null && Tr(t, !!s.multiple, r, !1);
    }
  }, vf = Cu, Sf = nr;
  var P_ = { usingClientEntryPoint: !1, Events: [Bo, Nr, ts, yf, gf, Cu] }, ei = { findFiberByHostInstance: Yn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, E_ = { bundleType: ei.bundleType, version: ei.version, rendererPackageName: ei.rendererPackageName, rendererConfig: ei.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: N.ReactCurrentDispatcher, findHostInstanceByFiber: function(t) {
    return t = Tf(t), t === null ? null : t.stateNode;
  }, findFiberByHostInstance: ei.findFiberByHostInstance || A_, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Vs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Vs.isDisabled && Vs.supportsFiber) try {
      Oi = Vs.inject(E_), Ut = Vs;
    } catch {
    }
  }
  return pt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = P_, pt.createPortal = function(t, r) {
    var s = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Fu(r)) throw Error(o(200));
    return k_(t, r, null, s);
  }, pt.createRoot = function(t, r) {
    if (!Fu(t)) throw Error(o(299));
    var s = !1, u = "", h = Xh;
    return r != null && (r.unstable_strictMode === !0 && (s = !0), r.identifierPrefix !== void 0 && (u = r.identifierPrefix), r.onRecoverableError !== void 0 && (h = r.onRecoverableError)), r = Du(t, 1, !1, null, null, s, !1, u, h), t[nn] = r.current, jo(t.nodeType === 8 ? t.parentNode : t), new Iu(r);
  }, pt.findDOMNode = function(t) {
    if (t == null) return null;
    if (t.nodeType === 1) return t;
    var r = t._reactInternals;
    if (r === void 0)
      throw typeof t.render == "function" ? Error(o(188)) : (t = Object.keys(t).join(","), Error(o(268, t)));
    return t = Tf(r), t = t === null ? null : t.stateNode, t;
  }, pt.flushSync = function(t) {
    return nr(t);
  }, pt.hydrate = function(t, r, s) {
    if (!js(r)) throw Error(o(200));
    return Ls(null, t, r, !0, s);
  }, pt.hydrateRoot = function(t, r, s) {
    if (!Fu(t)) throw Error(o(405));
    var u = s != null && s.hydratedSources || null, h = !1, y = "", _ = Xh;
    if (s != null && (s.unstable_strictMode === !0 && (h = !0), s.identifierPrefix !== void 0 && (y = s.identifierPrefix), s.onRecoverableError !== void 0 && (_ = s.onRecoverableError)), r = Yh(r, null, t, 1, s ?? null, h, !1, y, _), t[nn] = r.current, jo(t), u) for (t = 0; t < u.length; t++) s = u[t], h = s._getVersion, h = h(s._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [s, h] : r.mutableSourceEagerHydrationData.push(
      s,
      h
    );
    return new Os(r);
  }, pt.render = function(t, r, s) {
    if (!js(r)) throw Error(o(200));
    return Ls(null, t, r, !1, s);
  }, pt.unmountComponentAtNode = function(t) {
    if (!js(t)) throw Error(o(40));
    return t._reactRootContainer ? (nr(function() {
      Ls(null, null, t, !1, function() {
        t._reactRootContainer = null, t[nn] = null;
      });
    }), !0) : !1;
  }, pt.unstable_batchedUpdates = Cu, pt.unstable_renderSubtreeIntoContainer = function(t, r, s, u) {
    if (!js(s)) throw Error(o(200));
    if (t == null || t._reactInternals === void 0) throw Error(o(38));
    return Ls(t, r, s, !1, u);
  }, pt.version = "18.3.1-next-f1338f8080-20240426", pt;
}
var sm;
function dg() {
  if (sm) return ju.exports;
  sm = 1;
  function e() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (n) {
        console.error(n);
      }
  }
  return e(), ju.exports = V_(), ju.exports;
}
var am;
function B_() {
  if (am) return zs;
  am = 1;
  var e = dg();
  return zs.createRoot = e.createRoot, zs.hydrateRoot = e.hydrateRoot, zs;
}
var z_ = B_(), Bu = { exports: {} }, ni = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lm;
function U_() {
  if (lm) return ni;
  lm = 1;
  var e = cd(), n = Symbol.for("react.element"), o = Symbol.for("react.fragment"), i = Object.prototype.hasOwnProperty, a = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function d(p, m, g) {
    var v, l = {}, f = null, S = null;
    g !== void 0 && (f = "" + g), m.key !== void 0 && (f = "" + m.key), m.ref !== void 0 && (S = m.ref);
    for (v in m) i.call(m, v) && !c.hasOwnProperty(v) && (l[v] = m[v]);
    if (p && p.defaultProps) for (v in m = p.defaultProps, m) l[v] === void 0 && (l[v] = m[v]);
    return { $$typeof: n, type: p, key: f, ref: S, props: l, _owner: a.current };
  }
  return ni.Fragment = o, ni.jsx = d, ni.jsxs = d, ni;
}
var um;
function $_() {
  return um || (um = 1, Bu.exports = U_()), Bu.exports;
}
var T = $_();
const cm = (e) => Symbol.iterator in e, dm = (e) => (
  // HACK: avoid checking entries type
  "entries" in e
), fm = (e, n) => {
  const o = e instanceof Map ? e : new Map(e.entries()), i = n instanceof Map ? n : new Map(n.entries());
  if (o.size !== i.size)
    return !1;
  for (const [a, c] of o)
    if (!i.has(a) || !Object.is(c, i.get(a)))
      return !1;
  return !0;
}, H_ = (e, n) => {
  const o = e[Symbol.iterator](), i = n[Symbol.iterator]();
  let a = o.next(), c = i.next();
  for (; !a.done && !c.done; ) {
    if (!Object.is(a.value, c.value))
      return !1;
    a = o.next(), c = i.next();
  }
  return !!a.done && !!c.done;
};
function W_(e, n) {
  return Object.is(e, n) ? !0 : typeof e != "object" || e === null || typeof n != "object" || n === null || Object.getPrototypeOf(e) !== Object.getPrototypeOf(n) ? !1 : cm(e) && cm(n) ? dm(e) && dm(n) ? fm(e, n) : H_(e, n) : fm(
    { entries: () => Object.entries(e) },
    { entries: () => Object.entries(n) }
  );
}
function G_(e) {
  const n = pn.useRef(void 0);
  return (o) => {
    const i = e(o);
    return W_(n.current, i) ? n.current : n.current = i;
  };
}
const dd = C.createContext({});
function fd(e) {
  const n = C.useRef(null);
  return n.current === null && (n.current = e()), n.current;
}
const K_ = typeof window < "u", fg = K_ ? C.useLayoutEffect : C.useEffect, Ra = /* @__PURE__ */ C.createContext(null);
function pd(e, n) {
  e.indexOf(n) === -1 && e.push(n);
}
function pa(e, n) {
  const o = e.indexOf(n);
  o > -1 && e.splice(o, 1);
}
const en = (e, n, o) => o > n ? n : o < e ? e : o;
function pm(e, n) {
  return n ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${n}` : e;
}
let xi = () => {
}, vr = () => {
};
var ig;
typeof process < "u" && ((ig = process.env) == null ? void 0 : ig.NODE_ENV) !== "production" && (xi = (e, n, o) => {
  !e && typeof console < "u" && console.warn(pm(n, o));
}, vr = (e, n, o) => {
  if (!e)
    throw new Error(pm(n, o));
});
const $n = {}, pg = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), hg = (e) => typeof e == "object" && e !== null, mg = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function yg(e) {
  let n;
  return () => (n === void 0 && (n = e()), n);
}
const bt = /* @__NO_SIDE_EFFECTS__ */ (e) => e, Ti = (...e) => e.reduce((n, o) => (i) => o(n(i))), fi = /* @__NO_SIDE_EFFECTS__ */ (e, n, o) => {
  const i = n - e;
  return i ? (o - e) / i : 1;
};
class hd {
  constructor() {
    this.subscriptions = [];
  }
  add(n) {
    return pd(this.subscriptions, n), () => pa(this.subscriptions, n);
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
const ht = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, Mt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, gg = /* @__NO_SIDE_EFFECTS__ */ (e, n) => n ? e * (1e3 / n) : 0, vg = (e, n, o) => (((1 - 3 * o + 3 * n) * e + (3 * o - 6 * n)) * e + 3 * n) * e, Y_ = 1e-7, Q_ = 12;
function X_(e, n, o, i, a) {
  let c, d, p = 0;
  do
    d = n + (o - n) / 2, c = vg(d, i, a) - e, c > 0 ? o = d : n = d;
  while (Math.abs(c) > Y_ && ++p < Q_);
  return d;
}
// @__NO_SIDE_EFFECTS__
function ki(e, n, o, i) {
  if (e === n && o === i)
    return bt;
  const a = (c) => X_(c, 0, 1, e, o);
  return (c) => c === 0 || c === 1 ? c : vg(a(c), n, i);
}
const Sg = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => n <= 0.5 ? e(2 * n) / 2 : (2 - e(2 * (1 - n))) / 2, wg = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => 1 - e(1 - n), _g = /* @__PURE__ */ ki(0.33, 1.53, 0.69, 0.99), md = /* @__PURE__ */ wg(_g), xg = /* @__PURE__ */ Sg(md), Tg = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * md(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), yd = (e) => 1 - Math.sin(Math.acos(e)), kg = /* @__PURE__ */ wg(yd), Ag = /* @__PURE__ */ Sg(yd), Z_ = /* @__PURE__ */ ki(0.42, 0, 1, 1), J_ = /* @__PURE__ */ ki(0, 0, 0.58, 1), Cg = /* @__PURE__ */ ki(0.42, 0, 0.58, 1), q_ = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number", Pg = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", hm = {
  linear: bt,
  easeIn: Z_,
  easeInOut: Cg,
  easeOut: J_,
  circIn: yd,
  circInOut: Ag,
  circOut: kg,
  backIn: md,
  backInOut: xg,
  backOut: _g,
  anticipate: Tg
}, ex = (e) => typeof e == "string", mm = (e) => {
  if (/* @__PURE__ */ Pg(e)) {
    vr(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [n, o, i, a] = e;
    return /* @__PURE__ */ ki(n, o, i, a);
  } else if (ex(e))
    return vr(hm[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), hm[e];
  return e;
}, Us = [
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
function tx(e, n) {
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
const nx = 40;
function Eg(e, n) {
  let o = !1, i = !0;
  const a = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, c = () => o = !0, d = Us.reduce((R, N) => (R[N] = tx(c), R), {}), { setup: p, read: m, resolveKeyframes: g, preUpdate: v, update: l, preRender: f, render: S, postRender: w } = d, x = () => {
    const R = $n.useManualTiming, N = R ? a.timestamp : performance.now();
    o = !1, R || (a.delta = i ? 1e3 / 60 : Math.max(Math.min(N - a.timestamp, nx), 1)), a.timestamp = N, a.isProcessing = !0, p.process(a), m.process(a), g.process(a), v.process(a), l.process(a), f.process(a), S.process(a), w.process(a), a.isProcessing = !1, o && n && (i = !1, e(x));
  }, k = () => {
    o = !0, i = !0, a.isProcessing || e(x);
  };
  return { schedule: Us.reduce((R, N) => {
    const j = d[N];
    return R[N] = (L, V = !1, G = !1) => (o || k(), j.schedule(L, V, G)), R;
  }, {}), cancel: (R) => {
    for (let N = 0; N < Us.length; N++)
      d[Us[N]].cancel(R);
  }, state: a, steps: d };
}
const { schedule: Ae, cancel: Hn, state: Ze, steps: zu } = /* @__PURE__ */ Eg(typeof requestAnimationFrame < "u" ? requestAnimationFrame : bt, !0);
let ta;
function rx() {
  ta = void 0;
}
const it = {
  now: () => (ta === void 0 && it.set(Ze.isProcessing || $n.useManualTiming ? Ze.timestamp : performance.now()), ta),
  set: (e) => {
    ta = e, queueMicrotask(rx);
  }
}, Mg = (e) => (n) => typeof n == "string" && n.startsWith(e), bg = /* @__PURE__ */ Mg("--"), ox = /* @__PURE__ */ Mg("var(--"), gd = (e) => ox(e) ? ix.test(e.split("/*")[0].trim()) : !1, ix = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function ym(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
const uo = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, pi = {
  ...uo,
  transform: (e) => en(0, 1, e)
}, $s = {
  ...uo,
  default: 1
}, ai = (e) => Math.round(e * 1e5) / 1e5, vd = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function sx(e) {
  return e == null;
}
const ax = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, Sd = (e, n) => (o) => !!(typeof o == "string" && ax.test(o) && o.startsWith(e) || n && !sx(o) && Object.prototype.hasOwnProperty.call(o, n)), Rg = (e, n, o) => (i) => {
  if (typeof i != "string")
    return i;
  const [a, c, d, p] = i.match(vd);
  return {
    [e]: parseFloat(a),
    [n]: parseFloat(c),
    [o]: parseFloat(d),
    alpha: p !== void 0 ? parseFloat(p) : 1
  };
}, lx = (e) => en(0, 255, e), Uu = {
  ...uo,
  transform: (e) => Math.round(lx(e))
}, cr = {
  test: /* @__PURE__ */ Sd("rgb", "red"),
  parse: /* @__PURE__ */ Rg("red", "green", "blue"),
  transform: ({ red: e, green: n, blue: o, alpha: i = 1 }) => "rgba(" + Uu.transform(e) + ", " + Uu.transform(n) + ", " + Uu.transform(o) + ", " + ai(pi.transform(i)) + ")"
};
function ux(e) {
  let n = "", o = "", i = "", a = "";
  return e.length > 5 ? (n = e.substring(1, 3), o = e.substring(3, 5), i = e.substring(5, 7), a = e.substring(7, 9)) : (n = e.substring(1, 2), o = e.substring(2, 3), i = e.substring(3, 4), a = e.substring(4, 5), n += n, o += o, i += i, a += a), {
    red: parseInt(n, 16),
    green: parseInt(o, 16),
    blue: parseInt(i, 16),
    alpha: a ? parseInt(a, 16) / 255 : 1
  };
}
const hc = {
  test: /* @__PURE__ */ Sd("#"),
  parse: ux,
  transform: cr.transform
}, Ai = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (n) => typeof n == "string" && n.endsWith(e) && n.split(" ").length === 1,
  parse: parseFloat,
  transform: (n) => `${n}${e}`
}), dn = /* @__PURE__ */ Ai("deg"), qt = /* @__PURE__ */ Ai("%"), ne = /* @__PURE__ */ Ai("px"), cx = /* @__PURE__ */ Ai("vh"), dx = /* @__PURE__ */ Ai("vw"), gm = {
  ...qt,
  parse: (e) => qt.parse(e) / 100,
  transform: (e) => qt.transform(e * 100)
}, eo = {
  test: /* @__PURE__ */ Sd("hsl", "hue"),
  parse: /* @__PURE__ */ Rg("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: n, lightness: o, alpha: i = 1 }) => "hsla(" + Math.round(e) + ", " + qt.transform(ai(n)) + ", " + qt.transform(ai(o)) + ", " + ai(pi.transform(i)) + ")"
}, Ve = {
  test: (e) => cr.test(e) || hc.test(e) || eo.test(e),
  parse: (e) => cr.test(e) ? cr.parse(e) : eo.test(e) ? eo.parse(e) : hc.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? cr.transform(e) : eo.transform(e),
  getAnimatableNone: (e) => {
    const n = Ve.parse(e);
    return n.alpha = 0, Ve.transform(n);
  }
}, fx = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function px(e) {
  var n, o;
  return isNaN(e) && typeof e == "string" && (((n = e.match(vd)) == null ? void 0 : n.length) || 0) + (((o = e.match(fx)) == null ? void 0 : o.length) || 0) > 0;
}
const Dg = "number", Ng = "color", hx = "var", mx = "var(", vm = "${}", yx = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function so(e) {
  const n = e.toString(), o = [], i = {
    color: [],
    number: [],
    var: []
  }, a = [];
  let c = 0;
  const p = n.replace(yx, (m) => (Ve.test(m) ? (i.color.push(c), a.push(Ng), o.push(Ve.parse(m))) : m.startsWith(mx) ? (i.var.push(c), a.push(hx), o.push(m)) : (i.number.push(c), a.push(Dg), o.push(parseFloat(m))), ++c, vm)).split(vm);
  return { values: o, split: p, indexes: i, types: a };
}
function gx(e) {
  return so(e).values;
}
function Ig({ split: e, types: n }) {
  const o = e.length;
  return (i) => {
    let a = "";
    for (let c = 0; c < o; c++)
      if (a += e[c], i[c] !== void 0) {
        const d = n[c];
        d === Dg ? a += ai(i[c]) : d === Ng ? a += Ve.transform(i[c]) : a += i[c];
      }
    return a;
  };
}
function vx(e) {
  return Ig(so(e));
}
const Sx = (e) => typeof e == "number" ? 0 : Ve.test(e) ? Ve.getAnimatableNone(e) : e, wx = (e, n) => typeof e == "number" ? n != null && n.trim().endsWith("/") ? e : 0 : Sx(e);
function _x(e) {
  const n = so(e);
  return Ig(n)(n.values.map((i, a) => wx(i, n.split[a])));
}
const Bt = {
  test: px,
  parse: gx,
  createTransformer: vx,
  getAnimatableNone: _x
};
function $u(e, n, o) {
  return o < 0 && (o += 1), o > 1 && (o -= 1), o < 1 / 6 ? e + (n - e) * 6 * o : o < 1 / 2 ? n : o < 2 / 3 ? e + (n - e) * (2 / 3 - o) * 6 : e;
}
function xx({ hue: e, saturation: n, lightness: o, alpha: i }) {
  e /= 360, n /= 100, o /= 100;
  let a = 0, c = 0, d = 0;
  if (!n)
    a = c = d = o;
  else {
    const p = o < 0.5 ? o * (1 + n) : o + n - o * n, m = 2 * o - p;
    a = $u(m, p, e + 1 / 3), c = $u(m, p, e), d = $u(m, p, e - 1 / 3);
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
const Te = (e, n, o) => e + (n - e) * o, Hu = (e, n, o) => {
  const i = e * e, a = o * (n * n - i) + i;
  return a < 0 ? 0 : Math.sqrt(a);
}, Tx = [hc, cr, eo], kx = (e) => Tx.find((n) => n.test(e));
function Sm(e) {
  const n = kx(e);
  if (xi(!!n, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !n)
    return !1;
  let o = n.parse(e);
  return n === eo && (o = xx(o)), o;
}
const wm = (e, n) => {
  const o = Sm(e), i = Sm(n);
  if (!o || !i)
    return ha(e, n);
  const a = { ...o };
  return (c) => (a.red = Hu(o.red, i.red, c), a.green = Hu(o.green, i.green, c), a.blue = Hu(o.blue, i.blue, c), a.alpha = Te(o.alpha, i.alpha, c), cr.transform(a));
}, mc = /* @__PURE__ */ new Set(["none", "hidden"]);
function Ax(e, n) {
  return mc.has(e) ? (o) => o <= 0 ? e : n : (o) => o >= 1 ? n : e;
}
function Cx(e, n) {
  return (o) => Te(e, n, o);
}
function wd(e) {
  return typeof e == "number" ? Cx : typeof e == "string" ? gd(e) ? ha : Ve.test(e) ? wm : Mx : Array.isArray(e) ? Fg : typeof e == "object" ? Ve.test(e) ? wm : Px : ha;
}
function Fg(e, n) {
  const o = [...e], i = o.length, a = e.map((c, d) => wd(c)(c, n[d]));
  return (c) => {
    for (let d = 0; d < i; d++)
      o[d] = a[d](c);
    return o;
  };
}
function Px(e, n) {
  const o = { ...e, ...n }, i = {};
  for (const a in o)
    e[a] !== void 0 && n[a] !== void 0 && (i[a] = wd(e[a])(e[a], n[a]));
  return (a) => {
    for (const c in i)
      o[c] = i[c](a);
    return o;
  };
}
function Ex(e, n) {
  const o = [], i = { color: 0, var: 0, number: 0 };
  for (let a = 0; a < n.values.length; a++) {
    const c = n.types[a], d = e.indexes[c][i[c]], p = e.values[d] ?? 0;
    o[a] = p, i[c]++;
  }
  return o;
}
const Mx = (e, n) => {
  const o = Bt.createTransformer(n), i = so(e), a = so(n);
  return i.indexes.var.length === a.indexes.var.length && i.indexes.color.length === a.indexes.color.length && i.indexes.number.length >= a.indexes.number.length ? mc.has(e) && !a.values.length || mc.has(n) && !i.values.length ? Ax(e, n) : Ti(Fg(Ex(i, a), a.values), o) : (xi(!0, `Complex values '${e}' and '${n}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), ha(e, n));
};
function Og(e, n, o) {
  return typeof e == "number" && typeof n == "number" && typeof o == "number" ? Te(e, n, o) : wd(e)(e, n);
}
const bx = (e) => {
  const n = ({ timestamp: o }) => e(o);
  return {
    start: (o = !0) => Ae.update(n, o),
    stop: () => Hn(n),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Ze.isProcessing ? Ze.timestamp : it.now()
  };
}, jg = (e, n, o = 10) => {
  let i = "";
  const a = Math.max(Math.round(n / o), 2);
  for (let c = 0; c < a; c++)
    i += Math.round(e(c / (a - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${i.substring(0, i.length - 2)})`;
}, ma = 2e4;
function _d(e) {
  let n = 0;
  const o = 50;
  let i = e.next(n);
  for (; !i.done && n < ma; )
    n += o, i = e.next(n);
  return n >= ma ? 1 / 0 : n;
}
function Rx(e, n = 100, o) {
  const i = o({ ...e, keyframes: [0, n] }), a = Math.min(_d(i), ma);
  return {
    type: "keyframes",
    ease: (c) => i.next(a * c).value / n,
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
function yc(e, n) {
  return e * Math.sqrt(1 - n * n);
}
const Dx = 12;
function Nx(e, n, o) {
  let i = o;
  for (let a = 1; a < Dx; a++)
    i = i - e(i) / n(i);
  return i;
}
const Wu = 1e-3;
function Ix({ duration: e = Ie.duration, bounce: n = Ie.bounce, velocity: o = Ie.velocity, mass: i = Ie.mass }) {
  let a, c;
  xi(e <= /* @__PURE__ */ ht(Ie.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let d = 1 - n;
  d = en(Ie.minDamping, Ie.maxDamping, d), e = en(Ie.minDuration, Ie.maxDuration, /* @__PURE__ */ Mt(e)), d < 1 ? (a = (g) => {
    const v = g * d, l = v * e, f = v - o, S = yc(g, d), w = Math.exp(-l);
    return Wu - f / S * w;
  }, c = (g) => {
    const l = g * d * e, f = l * o + o, S = Math.pow(d, 2) * Math.pow(g, 2) * e, w = Math.exp(-l), x = yc(Math.pow(g, 2), d);
    return (-a(g) + Wu > 0 ? -1 : 1) * ((f - S) * w) / x;
  }) : (a = (g) => {
    const v = Math.exp(-g * e), l = (g - o) * e + 1;
    return -Wu + v * l;
  }, c = (g) => {
    const v = Math.exp(-g * e), l = (o - g) * (e * e);
    return v * l;
  });
  const p = 5 / e, m = Nx(a, c, p);
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
const Fx = ["duration", "bounce"], Ox = ["stiffness", "damping", "mass"];
function _m(e, n) {
  return n.some((o) => e[o] !== void 0);
}
function jx(e) {
  let n = {
    velocity: Ie.velocity,
    stiffness: Ie.stiffness,
    damping: Ie.damping,
    mass: Ie.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!_m(e, Ox) && _m(e, Fx))
    if (n.velocity = 0, e.visualDuration) {
      const o = e.visualDuration, i = 2 * Math.PI / (o * 1.2), a = i * i, c = 2 * en(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(a);
      n = {
        ...n,
        mass: Ie.mass,
        stiffness: a,
        damping: c
      };
    } else {
      const o = Ix({ ...e, velocity: 0 });
      n = {
        ...n,
        ...o,
        mass: Ie.mass
      }, n.isResolvedFromDuration = !0;
    }
  return n;
}
function ya(e = Ie.visualDuration, n = Ie.bounce) {
  const o = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: n
  } : e;
  let { restSpeed: i, restDelta: a } = o;
  const c = o.keyframes[0], d = o.keyframes[o.keyframes.length - 1], p = { done: !1, value: c }, { stiffness: m, damping: g, mass: v, duration: l, velocity: f, isResolvedFromDuration: S } = jx({
    ...o,
    velocity: -/* @__PURE__ */ Mt(o.velocity || 0)
  }), w = f || 0, x = g / (2 * Math.sqrt(m * v)), k = d - c, A = /* @__PURE__ */ Mt(Math.sqrt(m / v)), E = Math.abs(k) < 5;
  i || (i = E ? Ie.restSpeed.granular : Ie.restSpeed.default), a || (a = E ? Ie.restDelta.granular : Ie.restDelta.default);
  let R, N, j, L, V, G;
  if (x < 1)
    j = yc(A, x), L = (w + x * A * k) / j, R = (X) => {
      const ae = Math.exp(-x * A * X);
      return d - ae * (L * Math.sin(j * X) + k * Math.cos(j * X));
    }, V = x * A * L + k * j, G = x * A * k - L * j, N = (X) => Math.exp(-x * A * X) * (V * Math.sin(j * X) + G * Math.cos(j * X));
  else if (x === 1) {
    R = (ae) => d - Math.exp(-A * ae) * (k + (w + A * k) * ae);
    const X = w + A * k;
    N = (ae) => Math.exp(-A * ae) * (A * X * ae - w);
  } else {
    const X = A * Math.sqrt(x * x - 1);
    R = (ue) => {
      const xe = Math.exp(-x * A * ue), ve = Math.min(X * ue, 300);
      return d - xe * ((w + x * A * k) * Math.sinh(ve) + X * k * Math.cosh(ve)) / X;
    };
    const ae = (w + x * A * k) / X, q = x * A * ae - k * X, de = x * A * k - ae * X;
    N = (ue) => {
      const xe = Math.exp(-x * A * ue), ve = Math.min(X * ue, 300);
      return xe * (q * Math.sinh(ve) + de * Math.cosh(ve));
    };
  }
  const K = {
    calculatedDuration: S && l || null,
    velocity: (X) => /* @__PURE__ */ ht(N(X)),
    next: (X) => {
      if (!S && x < 1) {
        const q = Math.exp(-x * A * X), de = Math.sin(j * X), ue = Math.cos(j * X), xe = d - q * (L * de + k * ue), ve = /* @__PURE__ */ ht(q * (V * de + G * ue));
        return p.done = Math.abs(ve) <= i && Math.abs(d - xe) <= a, p.value = p.done ? d : xe, p;
      }
      const ae = R(X);
      if (S)
        p.done = X >= l;
      else {
        const q = /* @__PURE__ */ ht(N(X));
        p.done = Math.abs(q) <= i && Math.abs(d - ae) <= a;
      }
      return p.value = p.done ? d : ae, p;
    },
    toString: () => {
      const X = Math.min(_d(K), ma), ae = jg((q) => K.next(X * q).value, X, 30);
      return X + "ms " + ae;
    },
    toTransition: () => {
    }
  };
  return K;
}
ya.applyToOptions = (e) => {
  const n = Rx(e, 100, ya);
  return e.ease = n.ease, e.duration = /* @__PURE__ */ ht(n.duration), e.type = "keyframes", e;
};
const Lx = 5;
function Lg(e, n, o) {
  const i = Math.max(n - Lx, 0);
  return /* @__PURE__ */ gg(o - e(i), n - i);
}
function gc({ keyframes: e, velocity: n = 0, power: o = 0.8, timeConstant: i = 325, bounceDamping: a = 10, bounceStiffness: c = 500, modifyTarget: d, min: p, max: m, restDelta: g = 0.5, restSpeed: v }) {
  const l = e[0], f = {
    done: !1,
    value: l
  }, S = (G) => p !== void 0 && G < p || m !== void 0 && G > m, w = (G) => p === void 0 ? m : m === void 0 || Math.abs(p - G) < Math.abs(m - G) ? p : m;
  let x = o * n;
  const k = l + x, A = d === void 0 ? k : d(k);
  A !== k && (x = A - l);
  const E = (G) => -x * Math.exp(-G / i), R = (G) => A + E(G), N = (G) => {
    const K = E(G), X = R(G);
    f.done = Math.abs(K) <= g, f.value = f.done ? A : X;
  };
  let j, L;
  const V = (G) => {
    S(f.value) && (j = G, L = ya({
      keyframes: [f.value, w(f.value)],
      velocity: Lg(R, G, f.value),
      // TODO: This should be passing * 1000
      damping: a,
      stiffness: c,
      restDelta: g,
      restSpeed: v
    }));
  };
  return V(0), {
    calculatedDuration: null,
    next: (G) => {
      let K = !1;
      return !L && j === void 0 && (K = !0, N(G), V(G)), j !== void 0 && G >= j ? L.next(G - j) : (!K && N(G), f);
    }
  };
}
function Vx(e, n, o) {
  const i = [], a = o || $n.mix || Og, c = e.length - 1;
  for (let d = 0; d < c; d++) {
    let p = a(e[d], e[d + 1]);
    if (n) {
      const m = Array.isArray(n) ? n[d] || bt : n;
      p = Ti(m, p);
    }
    i.push(p);
  }
  return i;
}
function Bx(e, n, { clamp: o = !0, ease: i, mixer: a } = {}) {
  const c = e.length;
  if (vr(c === n.length, "Both input and output ranges must be the same length", "range-length"), c === 1)
    return () => n[0];
  if (c === 2 && n[0] === n[1])
    return () => n[1];
  const d = e[0] === e[1];
  e[0] > e[c - 1] && (e = [...e].reverse(), n = [...n].reverse());
  const p = Vx(n, i, a), m = p.length, g = (v) => {
    if (d && v < e[0])
      return n[0];
    let l = 0;
    if (m > 1)
      for (; l < e.length - 2 && !(v < e[l + 1]); l++)
        ;
    const f = /* @__PURE__ */ fi(e[l], e[l + 1], v);
    return p[l](f);
  };
  return o ? (v) => g(en(e[0], e[c - 1], v)) : g;
}
function zx(e, n) {
  const o = e[e.length - 1];
  for (let i = 1; i <= n; i++) {
    const a = /* @__PURE__ */ fi(0, n, i);
    e.push(Te(o, 1, a));
  }
}
function Ux(e) {
  const n = [0];
  return zx(n, e.length - 1), n;
}
function $x(e, n) {
  return e.map((o) => o * n);
}
function Hx(e, n) {
  return e.map(() => n || Cg).splice(0, e.length - 1);
}
function li({ duration: e = 300, keyframes: n, times: o, ease: i = "easeInOut" }) {
  const a = /* @__PURE__ */ q_(i) ? i.map(mm) : mm(i), c = {
    done: !1,
    value: n[0]
  }, d = $x(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    o && o.length === n.length ? o : Ux(n),
    e
  ), p = Bx(d, n, {
    ease: Array.isArray(a) ? a : Hx(n, a)
  });
  return {
    calculatedDuration: e,
    next: (m) => (c.value = p(m), c.done = m >= e, c)
  };
}
const Wx = (e) => e !== null;
function Da(e, { repeat: n, repeatType: o = "loop" }, i, a = 1) {
  const c = e.filter(Wx), p = a < 0 || n && o !== "loop" && n % 2 === 1 ? 0 : c.length - 1;
  return !p || i === void 0 ? c[p] : i;
}
const Gx = {
  decay: gc,
  inertia: gc,
  tween: li,
  keyframes: li,
  spring: ya
};
function Vg(e) {
  typeof e.type == "string" && (e.type = Gx[e.type]);
}
class xd {
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
const Kx = (e) => e / 100;
class ga extends xd {
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
    Vg(n);
    const { type: o = li, repeat: i = 0, repeatDelay: a = 0, repeatType: c, velocity: d = 0 } = n;
    let { keyframes: p } = n;
    const m = o || li;
    m !== li && typeof p[0] != "number" && (this.mixKeyframes = Ti(Kx, Og(p[0], p[1])), p = [0, 100]);
    const g = m({ ...n, keyframes: p });
    c === "mirror" && (this.mirroredGenerator = m({
      ...n,
      keyframes: [...p].reverse(),
      velocity: -d
    })), g.calculatedDuration === null && (g.calculatedDuration = _d(g));
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
    const { delay: g = 0, keyframes: v, repeat: l, repeatType: f, repeatDelay: S, type: w, onUpdate: x, finalKeyframe: k } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, n) : this.speed < 0 && (this.startTime = Math.min(n - a / this.speed, this.startTime)), o ? this.currentTime = n : this.updateTime(n);
    const A = this.currentTime - g * (this.playbackSpeed >= 0 ? 1 : -1), E = this.playbackSpeed >= 0 ? A < 0 : A > a;
    this.currentTime = Math.max(A, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = a);
    let R = this.currentTime, N = i;
    if (l) {
      const G = Math.min(this.currentTime, a) / p;
      let K = Math.floor(G), X = G % 1;
      !X && G >= 1 && (X = 1), X === 1 && K--, K = Math.min(K, l + 1), !!(K % 2) && (f === "reverse" ? (X = 1 - X, S && (X -= S / p)) : f === "mirror" && (N = d)), R = en(0, 1, X) * p;
    }
    let j;
    E ? (this.delayState.value = v[0], j = this.delayState) : j = N.next(R), c && !E && (j.value = c(j.value));
    let { done: L } = j;
    !E && m !== null && (L = this.playbackSpeed >= 0 ? this.currentTime >= a : this.currentTime <= 0);
    const V = this.holdTime === null && (this.state === "finished" || this.state === "running" && L);
    return V && w !== gc && (j.value = Da(v, this.options, k, this.speed)), x && x(j.value), V && this.finish(), j;
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
    return Lg((i) => this.generator.next(i).value, n, o);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(n) {
    const o = this.playbackSpeed !== n;
    o && this.driver && this.updateTime(it.now()), this.playbackSpeed = n, o && this.driver && (this.time = /* @__PURE__ */ Mt(this.currentTime));
  }
  play() {
    var a, c;
    if (this.isStopped)
      return;
    const { driver: n = bx, startTime: o } = this.options;
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
function Yx(e) {
  for (let n = 1; n < e.length; n++)
    e[n] ?? (e[n] = e[n - 1]);
}
const dr = (e) => e * 180 / Math.PI, vc = (e) => {
  const n = dr(Math.atan2(e[1], e[0]));
  return Sc(n);
}, Qx = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: vc,
  rotateZ: vc,
  skewX: (e) => dr(Math.atan(e[1])),
  skewY: (e) => dr(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, Sc = (e) => (e = e % 360, e < 0 && (e += 360), e), xm = vc, Tm = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), km = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), Xx = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: Tm,
  scaleY: km,
  scale: (e) => (Tm(e) + km(e)) / 2,
  rotateX: (e) => Sc(dr(Math.atan2(e[6], e[5]))),
  rotateY: (e) => Sc(dr(Math.atan2(-e[2], e[0]))),
  rotateZ: xm,
  rotate: xm,
  skewX: (e) => dr(Math.atan(e[4])),
  skewY: (e) => dr(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function wc(e) {
  return e.includes("scale") ? 1 : 0;
}
function _c(e, n) {
  if (!e || e === "none")
    return wc(n);
  const o = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let i, a;
  if (o)
    i = Xx, a = o;
  else {
    const p = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    i = Qx, a = p;
  }
  if (!a)
    return wc(n);
  const c = i[n], d = a[1].split(",").map(Jx);
  return typeof c == "function" ? c(d) : d[c];
}
const Zx = (e, n) => {
  const { transform: o = "none" } = getComputedStyle(e);
  return _c(o, n);
};
function Jx(e) {
  return parseFloat(e.trim());
}
const co = [
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
], fo = /* @__PURE__ */ new Set([...co, "pathRotation"]), Am = (e) => e === uo || e === ne, qx = /* @__PURE__ */ new Set(["x", "y", "z"]), e1 = co.filter((e) => !qx.has(e));
function t1(e) {
  const n = [];
  return e1.forEach((o) => {
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
  x: (e, { transform: n }) => _c(n, "x"),
  y: (e, { transform: n }) => _c(n, "y")
};
Un.translateX = Un.x;
Un.translateY = Un.y;
const fr = /* @__PURE__ */ new Set();
let xc = !1, Tc = !1, kc = !1;
function Bg() {
  if (Tc) {
    const e = Array.from(fr).filter((i) => i.needsMeasurement), n = new Set(e.map((i) => i.element)), o = /* @__PURE__ */ new Map();
    n.forEach((i) => {
      const a = t1(i);
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
  Tc = !1, xc = !1, fr.forEach((e) => e.complete(kc)), fr.clear();
}
function zg() {
  fr.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (Tc = !0);
  });
}
function n1() {
  kc = !0, zg(), Bg(), kc = !1;
}
class Td {
  constructor(n, o, i, a, c, d = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...n], this.onComplete = o, this.name = i, this.motionValue = a, this.element = c, this.isAsync = d;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (fr.add(this), xc || (xc = !0, Ae.read(zg), Ae.resolveKeyframes(Bg))) : (this.readKeyframes(), this.complete());
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
    Yx(n);
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
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, n), fr.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (fr.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const r1 = (e) => e.startsWith("--");
function Ug(e, n, o) {
  r1(n) ? e.style.setProperty(n, o) : e.style[n] = o;
}
const o1 = {};
function $g(e, n) {
  const o = /* @__PURE__ */ yg(e);
  return () => o1[n] ?? o();
}
const i1 = /* @__PURE__ */ $g(() => window.ScrollTimeline !== void 0, "scrollTimeline"), Hg = /* @__PURE__ */ $g(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), ii = ([e, n, o, i]) => `cubic-bezier(${e}, ${n}, ${o}, ${i})`, Cm = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ ii([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ ii([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ ii([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ ii([0.33, 1.53, 0.69, 0.99])
};
function Wg(e, n) {
  if (e)
    return typeof e == "function" ? Hg() ? jg(e, n) : "ease-out" : /* @__PURE__ */ Pg(e) ? ii(e) : Array.isArray(e) ? e.map((o) => Wg(o, n) || Cm.easeOut) : Cm[e];
}
function s1(e, n, o, { delay: i = 0, duration: a = 300, repeat: c = 0, repeatType: d = "loop", ease: p = "easeOut", times: m } = {}, g = void 0) {
  const v = {
    [n]: o
  };
  m && (v.offset = m);
  const l = Wg(p, a);
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
function Gg(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function a1({ type: e, ...n }) {
  return Gg(e) && Hg() ? e.applyToOptions(n) : (n.duration ?? (n.duration = 300), n.ease ?? (n.ease = "easeOut"), n);
}
class Kg extends xd {
  constructor(n) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !n)
      return;
    const { element: o, name: i, keyframes: a, pseudoElement: c, allowFlatten: d = !1, finalKeyframe: p, onComplete: m } = n;
    this.isPseudoElement = !!c, this.allowFlatten = d, this.options = n, vr(typeof n.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const g = a1(n);
    this.animation = s1(o, i, a, g, c), g.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !c) {
        const v = Da(a, this.options, p, this.speed);
        this.updateMotionValue && this.updateMotionValue(v), Ug(o, i, v), this.animation.cancel();
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
    return this.allowFlatten && ((c = this.animation.effect) == null || c.updateTiming({ easing: "linear" })), this.animation.onfinish = null, n && i1() ? (this.animation.timeline = n, o && (this.animation.rangeStart = o), i && (this.animation.rangeEnd = i), bt) : a(this);
  }
}
const Yg = {
  anticipate: Tg,
  backInOut: xg,
  circInOut: Ag
};
function l1(e) {
  return e in Yg;
}
function u1(e) {
  typeof e.ease == "string" && l1(e.ease) && (e.ease = Yg[e.ease]);
}
const Gu = 10;
class c1 extends Kg {
  constructor(n) {
    u1(n), Vg(n), super(n), n.startTime !== void 0 && n.autoplay !== !1 && (this.startTime = n.startTime), this.options = n;
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
    const p = new ga({
      ...d,
      autoplay: !1
    }), m = Math.max(Gu, it.now() - this.startTime), g = en(0, Gu, m - Gu), v = p.sample(m).value, { name: l } = this.options;
    c && l && Ug(c, l, v), o.setWithVelocity(p.sample(Math.max(0, m - g)).value, v, g), p.stop();
  }
}
const Pm = (e, n) => n === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(Bt.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function d1(e) {
  const n = e[0];
  if (e.length === 1)
    return !0;
  for (let o = 0; o < e.length; o++)
    if (e[o] !== n)
      return !0;
}
function f1(e, n, o, i) {
  const a = e[0];
  if (a === null)
    return !1;
  if (n === "display" || n === "visibility")
    return !0;
  const c = e[e.length - 1], d = Pm(a, n), p = Pm(c, n);
  return xi(d === p, `You are trying to animate ${n} from "${a}" to "${c}". "${d ? c : a}" is not an animatable value.`, "value-not-animatable"), !d || !p ? !1 : d1(e) || (o === "spring" || Gg(o)) && i;
}
function Ac(e) {
  e.duration = 0, e.type = "keyframes";
}
const Qg = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), p1 = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function h1(e) {
  for (let n = 0; n < e.length; n++)
    if (typeof e[n] == "string" && p1.test(e[n]))
      return !0;
  return !1;
}
const m1 = /* @__PURE__ */ new Set([
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
]), y1 = /* @__PURE__ */ yg(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function g1(e) {
  var l;
  const { motionValue: n, name: o, repeatDelay: i, repeatType: a, damping: c, type: d, keyframes: p } = e;
  if (!(((l = n == null ? void 0 : n.owner) == null ? void 0 : l.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: g, transformTemplate: v } = n.owner.getProps();
  return y1() && o && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (Qg.has(o) || m1.has(o) && h1(p)) && (o !== "transform" || !v) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !g && !i && a !== "mirror" && c !== 0 && d !== "inertia";
}
const v1 = 40;
class S1 extends xd {
  constructor({ autoplay: n = !0, delay: o = 0, type: i = "keyframes", repeat: a = 0, repeatDelay: c = 0, repeatType: d = "loop", keyframes: p, name: m, motionValue: g, element: v, ...l }) {
    var w;
    super(), this.stop = () => {
      var x, k;
      this._animation && (this._animation.stop(), (x = this.stopTimeline) == null || x.call(this)), (k = this.keyframeResolver) == null || k.cancel();
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
    }, S = (v == null ? void 0 : v.KeyframeResolver) || Td;
    this.keyframeResolver = new S(p, (x, k, A) => this.onKeyframesResolved(x, k, f, !A), m, g, v), (w = this.keyframeResolver) == null || w.scheduleResolve();
  }
  onKeyframesResolved(n, o, i, a) {
    var A, E;
    this.keyframeResolver = void 0;
    const { name: c, type: d, velocity: p, delay: m, isHandoff: g, onUpdate: v } = i;
    this.resolvedAt = it.now();
    let l = !0;
    f1(n, c, d, p) || (l = !1, ($n.instantAnimations || !m) && (v == null || v(Da(n, i, o))), n[0] = n[n.length - 1], Ac(i), i.repeat = 0);
    const S = {
      startTime: a ? this.resolvedAt ? this.resolvedAt - this.createdAt > v1 ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: o,
      ...i,
      keyframes: n
    }, w = l && !g && g1(S), x = (E = (A = S.motionValue) == null ? void 0 : A.owner) == null ? void 0 : E.current;
    let k;
    if (w)
      try {
        k = new c1({
          ...S,
          element: x
        });
      } catch {
        k = new ga(S);
      }
    else
      k = new ga(S);
    k.finished.then(() => {
      this.notifyFinished();
    }).catch(bt), this.pendingTimeline && (this.stopTimeline = k.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = k;
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
    return this._animation || ((n = this.keyframeResolver) == null || n.resume(), n1()), this._animation;
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
function Xg(e, n, o, i = 0, a = 1) {
  const c = Array.from(e).sort((g, v) => g.sortNodePosition(v)).indexOf(n), d = e.size, p = (d - 1) * i;
  return typeof o == "function" ? o(c, d) : a === 1 ? c * i : p - c * i;
}
const Em = 30, w1 = (e) => !isNaN(parseFloat(e));
class _1 {
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
    this.current = n, this.updatedAt = it.now(), this.canTrackVelocity === null && n !== void 0 && (this.canTrackVelocity = w1(this.current));
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
    this.events[n] || (this.events[n] = new hd());
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
    const n = it.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || n - this.updatedAt > Em)
      return 0;
    const o = Math.min(this.updatedAt - this.prevUpdatedAt, Em);
    return /* @__PURE__ */ gg(parseFloat(this.current) - parseFloat(this.prevFrameValue), o);
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
function ao(e, n) {
  return new _1(e, n);
}
function Zg(e, n) {
  if (e != null && e.inherit && n) {
    const { inherit: o, ...i } = e;
    return { ...n, ...i };
  }
  return e;
}
function kd(e, n) {
  const o = (e == null ? void 0 : e[n]) ?? (e == null ? void 0 : e.default) ?? e;
  return o !== e ? Zg(o, e) : o;
}
const x1 = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, T1 = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), k1 = {
  type: "keyframes",
  duration: 0.8
}, A1 = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, C1 = (e, { keyframes: n }) => n.length > 2 ? k1 : fo.has(e) ? e.startsWith("scale") ? T1(n[1]) : x1 : A1, P1 = /* @__PURE__ */ new Set([
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
function E1(e) {
  for (const n in e)
    if (!P1.has(n))
      return !0;
  return !1;
}
const Ad = (e, n, o, i = {}, a, c) => (d) => {
  const p = kd(i, e) || {}, m = p.delay || i.delay || 0;
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
  E1(p) || Object.assign(v, C1(e, v)), v.duration && (v.duration = /* @__PURE__ */ ht(v.duration)), v.repeatDelay && (v.repeatDelay = /* @__PURE__ */ ht(v.repeatDelay)), v.from !== void 0 && (v.keyframes[0] = v.from);
  let l = !1;
  if ((v.type === !1 || v.duration === 0 && !v.repeatDelay) && (Ac(v), v.delay === 0 && (l = !0)), ($n.instantAnimations || $n.skipAnimations || a != null && a.shouldSkipAnimations || p.skipAnimations) && (l = !0, Ac(v), v.delay = 0), v.allowFlatten = !p.type && !p.ease, l && !c && n.get() !== void 0) {
    const f = Da(v.keyframes, p);
    if (f !== void 0) {
      Ae.update(() => {
        v.onUpdate(f), v.onComplete();
      });
      return;
    }
  }
  return p.isSync ? new ga(v) : new S1(v);
}, M1 = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function b1(e) {
  const n = M1.exec(e);
  if (!n)
    return [,];
  const [, o, i, a] = n;
  return [`--${o ?? i}`, a];
}
const R1 = 4;
function Jg(e, n, o = 1) {
  vr(o <= R1, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [i, a] = b1(e);
  if (!i)
    return;
  const c = window.getComputedStyle(n).getPropertyValue(i);
  if (c) {
    const d = c.trim();
    return pg(d) ? parseFloat(d) : d;
  }
  return gd(a) ? Jg(a, n, o + 1) : a;
}
function Mm(e) {
  const n = [{}, {}];
  return e == null || e.values.forEach((o, i) => {
    n[0][i] = o.get(), n[1][i] = o.getVelocity();
  }), n;
}
function Cd(e, n, o, i) {
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
function pr(e, n, o) {
  const i = e.getProps();
  return Cd(i, n, o !== void 0 ? o : i.custom, e);
}
const qg = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...co
]), Cc = (e) => Array.isArray(e);
function D1(e, n, o) {
  e.hasValue(n) ? e.getValue(n).set(o) : e.addValue(n, ao(o));
}
function N1(e) {
  return Cc(e) ? e[e.length - 1] || 0 : e;
}
function I1(e, n) {
  const o = pr(e, n);
  let { transitionEnd: i = {}, transition: a = {}, ...c } = o || {};
  c = { ...c, ...i };
  for (const d in c) {
    const p = N1(c[d]);
    D1(e, d, p);
  }
}
const Je = (e) => !!(e && e.getVelocity);
function F1(e) {
  return !!(Je(e) && e.add);
}
function Pc(e, n) {
  const o = e.getValue("willChange");
  if (F1(o))
    return o.add(n);
  if (!o && $n.WillChange) {
    const i = new $n.WillChange("auto");
    e.addValue("willChange", i), i.add(n);
  }
}
function Pd(e) {
  return e.replace(/([A-Z])/g, (n) => `-${n.toLowerCase()}`);
}
const O1 = "framerAppearId", ev = "data-" + Pd(O1);
function tv(e) {
  return e.props[ev];
}
function j1({ protectedKeys: e, needsAnimating: n }, o) {
  const i = e.hasOwnProperty(o) && n[o] !== !0;
  return n[o] = !1, i;
}
function nv(e, n, { delay: o = 0, transitionOverride: i, type: a } = {}) {
  let { transition: c, transitionEnd: d, ...p } = n;
  const m = e.getDefaultTransition();
  c = c ? Zg(c, m) : m;
  const g = c == null ? void 0 : c.reduceMotion, v = c == null ? void 0 : c.skipAnimations;
  i && (c = i);
  const l = [], f = a && e.animationState && e.animationState.getState()[a], S = c == null ? void 0 : c.path;
  S && S.animateVisualElement(e, p, c, o, l);
  for (const w in p) {
    const x = e.getValue(w, e.latestValues[w] ?? null), k = p[w];
    if (k === void 0 || f && j1(f, w))
      continue;
    const A = {
      delay: o,
      ...kd(c || {}, w)
    };
    v && (A.skipAnimations = !0);
    const E = x.get();
    if (E !== void 0 && !x.isAnimating() && !Array.isArray(k) && k === E && !A.velocity) {
      Ae.update(() => x.set(k));
      continue;
    }
    let R = !1;
    if (window.MotionHandoffAnimation) {
      const L = tv(e);
      if (L) {
        const V = window.MotionHandoffAnimation(L, w, Ae);
        V !== null && (A.startTime = V, R = !0);
      }
    }
    Pc(e, w);
    const N = g ?? e.shouldReduceMotion;
    x.start(Ad(w, x, k, N && qg.has(w) ? { type: !1 } : A, e, R));
    const j = x.animation;
    j && l.push(j);
  }
  if (d) {
    const w = () => Ae.update(() => {
      d && I1(e, d);
    });
    l.length ? Promise.all(l).then(w) : w();
  }
  return l;
}
function Ec(e, n, o = {}) {
  var m;
  const i = pr(e, n, o.type === "exit" ? (m = e.presenceContext) == null ? void 0 : m.custom : void 0);
  let { transition: a = e.getDefaultTransition() || {} } = i || {};
  o.transitionOverride && (a = o.transitionOverride);
  const c = i ? () => Promise.all(nv(e, i, o)) : () => Promise.resolve(), d = e.variantChildren && e.variantChildren.size ? (g = 0) => {
    const { delayChildren: v = 0, staggerChildren: l, staggerDirection: f } = a;
    return L1(e, n, g, v, l, f, o);
  } : () => Promise.resolve(), { when: p } = a;
  if (p) {
    const [g, v] = p === "beforeChildren" ? [c, d] : [d, c];
    return g().then(() => v());
  } else
    return Promise.all([c(), d(o.delay)]);
}
function L1(e, n, o = 0, i = 0, a = 0, c = 1, d) {
  const p = [];
  for (const m of e.variantChildren)
    m.notify("AnimationStart", n), p.push(Ec(m, n, {
      ...d,
      delay: o + (typeof i == "function" ? 0 : i) + Xg(e.variantChildren, m, i, a, c)
    }).then(() => m.notify("AnimationComplete", n)));
  return Promise.all(p);
}
function V1(e, n, o = {}) {
  e.notify("AnimationStart", n);
  let i;
  if (Array.isArray(n)) {
    const a = n.map((c) => Ec(e, c, o));
    i = Promise.all(a);
  } else if (typeof n == "string")
    i = Ec(e, n, o);
  else {
    const a = typeof n == "function" ? pr(e, n, o.custom) : n;
    i = Promise.all(nv(e, a, o));
  }
  return i.then(() => {
    e.notify("AnimationComplete", n);
  });
}
const B1 = {
  test: (e) => e === "auto",
  parse: (e) => e
}, rv = (e) => (n) => n.test(e), ov = [uo, ne, qt, dn, dx, cx, B1], bm = (e) => ov.find(rv(e));
function z1(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || mg(e) : !0;
}
const U1 = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function $1(e) {
  const [n, o] = e.slice(0, -1).split("(");
  if (n === "drop-shadow")
    return e;
  const [i] = o.match(vd) || [];
  if (!i)
    return e;
  const a = o.replace(i, "");
  let c = U1.has(n) ? 1 : 0;
  return i !== o && (c *= 100), n + "(" + c + a + ")";
}
const H1 = /\b([a-z-]*)\(.*?\)/gu, Mc = {
  ...Bt,
  getAnimatableNone: (e) => {
    const n = e.match(H1);
    return n ? n.map($1).join(" ") : e;
  }
}, bc = {
  ...Bt,
  getAnimatableNone: (e) => {
    const n = Bt.parse(e);
    return Bt.createTransformer(e)(n.map((i) => typeof i == "number" ? 0 : typeof i == "object" ? { ...i, alpha: 1 } : i));
  }
}, Rm = {
  ...uo,
  transform: Math.round
}, W1 = {
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
  opacity: pi,
  originX: gm,
  originY: gm,
  originZ: ne
}, va = {
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
  ...W1,
  zIndex: Rm,
  // SVG
  fillOpacity: pi,
  strokeOpacity: pi,
  numOctaves: Rm
}, G1 = {
  ...va,
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
  filter: Mc,
  WebkitFilter: Mc,
  mask: bc,
  WebkitMask: bc
}, iv = (e) => G1[e], K1 = /* @__PURE__ */ new Set([Mc, bc]);
function sv(e, n) {
  let o = iv(e);
  return K1.has(o) || (o = Bt), o.getAnimatableNone ? o.getAnimatableNone(n) : void 0;
}
const Y1 = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function Q1(e, n, o) {
  let i = 0, a;
  for (; i < e.length && !a; ) {
    const c = e[i];
    typeof c == "string" && !Y1.has(c) && so(c).values.length && (a = e[i]), i++;
  }
  if (a && o)
    for (const c of n)
      e[c] = sv(o, a);
}
class X1 extends Td {
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
      if (typeof l == "string" && (l = l.trim(), gd(l))) {
        const f = Jg(l, o.current);
        f !== void 0 && (n[v] = f), v === n.length - 1 && (this.finalKeyframe = l);
      }
    }
    if (this.resolveNoneKeyframes(), !qg.has(i) || n.length !== 2)
      return;
    const [a, c] = n, d = bm(a), p = bm(c), m = ym(a), g = ym(c);
    if (m !== g && Un[i]) {
      this.needsMeasurement = !0;
      return;
    }
    if (d !== p)
      if (Am(d) && Am(p))
        for (let v = 0; v < n.length; v++) {
          const l = n[v];
          typeof l == "string" && (n[v] = parseFloat(l));
        }
      else Un[i] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: n, name: o } = this, i = [];
    for (let a = 0; a < n.length; a++)
      (n[a] === null || z1(n[a])) && i.push(a);
    i.length && Q1(n, i, o);
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
function av(e, n, o) {
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
const Rc = (e, n) => n && typeof e == "number" ? n.transform(e) : e;
function na(e) {
  return hg(e) && "offsetHeight" in e && !("ownerSVGElement" in e);
}
const { schedule: Ed } = /* @__PURE__ */ Eg(queueMicrotask, !1), Vt = {
  x: !1,
  y: !1
};
function lv() {
  return Vt.x || Vt.y;
}
function Z1(e) {
  return e === "x" || e === "y" ? Vt[e] ? null : (Vt[e] = !0, () => {
    Vt[e] = !1;
  }) : Vt.x || Vt.y ? null : (Vt.x = Vt.y = !0, () => {
    Vt.x = Vt.y = !1;
  });
}
function uv(e, n) {
  const o = av(e), i = new AbortController(), a = {
    passive: !0,
    ...n,
    signal: i.signal
  };
  return [o, a, () => i.abort()];
}
function J1(e) {
  return !(e.pointerType === "touch" || lv());
}
function q1(e, n, o = {}) {
  const [i, a, c] = uv(e, o);
  return i.forEach((d) => {
    let p = !1, m = !1, g;
    const v = () => {
      d.removeEventListener("pointerleave", w);
    }, l = (k) => {
      g && (g(k), g = void 0), v();
    }, f = (k) => {
      p = !1, window.removeEventListener("pointerup", f), window.removeEventListener("pointercancel", f), m && (m = !1, l(k));
    }, S = () => {
      p = !0, window.addEventListener("pointerup", f, a), window.addEventListener("pointercancel", f, a);
    }, w = (k) => {
      if (k.pointerType !== "touch") {
        if (p) {
          m = !0;
          return;
        }
        l(k);
      }
    }, x = (k) => {
      if (!J1(k))
        return;
      m = !1;
      const A = n(d, k);
      typeof A == "function" && (g = A, d.addEventListener("pointerleave", w, a));
    };
    d.addEventListener("pointerenter", x, a), d.addEventListener("pointerdown", S, a);
  }), c;
}
const cv = (e, n) => n ? e === n ? !0 : cv(e, n.parentElement) : !1, Md = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, eT = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function tT(e) {
  return eT.has(e.tagName) || e.isContentEditable === !0;
}
const nT = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function rT(e) {
  return nT.has(e.tagName) || e.isContentEditable === !0;
}
const ra = /* @__PURE__ */ new WeakSet();
function Dm(e) {
  return (n) => {
    n.key === "Enter" && e(n);
  };
}
function Ku(e, n) {
  e.dispatchEvent(new PointerEvent("pointer" + n, { isPrimary: !0, bubbles: !0 }));
}
const oT = (e, n) => {
  const o = e.currentTarget;
  if (!o)
    return;
  const i = Dm(() => {
    if (ra.has(o))
      return;
    Ku(o, "down");
    const a = Dm(() => {
      Ku(o, "up");
    }), c = () => Ku(o, "cancel");
    o.addEventListener("keyup", a, n), o.addEventListener("blur", c, n);
  });
  o.addEventListener("keydown", i, n), o.addEventListener("blur", () => o.removeEventListener("keydown", i), n);
};
function Nm(e) {
  return Md(e) && !lv();
}
const Im = /* @__PURE__ */ new WeakSet();
function iT(e, n, o = {}) {
  const [i, a, c] = uv(e, o), d = (p) => {
    const m = p.currentTarget;
    if (!Nm(p) || Im.has(p))
      return;
    ra.add(m), o.stopPropagation && Im.add(p);
    const g = n(m, p), v = (S, w) => {
      window.removeEventListener("pointerup", l), window.removeEventListener("pointercancel", f), ra.has(m) && ra.delete(m), Nm(S) && typeof g == "function" && g(S, { success: w });
    }, l = (S) => {
      v(S, m === window || m === document || o.useGlobalTarget || cv(m, S.target));
    }, f = (S) => {
      v(S, !1);
    };
    window.addEventListener("pointerup", l, a), window.addEventListener("pointercancel", f, a);
  };
  return i.forEach((p) => {
    (o.useGlobalTarget ? window : p).addEventListener("pointerdown", d, a), na(p) && (p.addEventListener("focus", (g) => oT(g, a)), !tT(p) && !p.hasAttribute("tabindex") && (p.tabIndex = 0));
  }), c;
}
function bd(e) {
  return hg(e) && "ownerSVGElement" in e;
}
const oa = /* @__PURE__ */ new WeakMap();
let jn;
const dv = (e, n, o) => (i, a) => a && a[0] ? a[0][e + "Size"] : bd(i) && "getBBox" in i ? i.getBBox()[n] : i[o], sT = /* @__PURE__ */ dv("inline", "width", "offsetWidth"), aT = /* @__PURE__ */ dv("block", "height", "offsetHeight");
function lT({ target: e, borderBoxSize: n }) {
  var o;
  (o = oa.get(e)) == null || o.forEach((i) => {
    i(e, {
      get width() {
        return sT(e, n);
      },
      get height() {
        return aT(e, n);
      }
    });
  });
}
function uT(e) {
  e.forEach(lT);
}
function cT() {
  typeof ResizeObserver > "u" || (jn = new ResizeObserver(uT));
}
function dT(e, n) {
  jn || cT();
  const o = av(e);
  return o.forEach((i) => {
    let a = oa.get(i);
    a || (a = /* @__PURE__ */ new Set(), oa.set(i, a)), a.add(n), jn == null || jn.observe(i);
  }), () => {
    o.forEach((i) => {
      const a = oa.get(i);
      a == null || a.delete(n), a != null && a.size || jn == null || jn.unobserve(i);
    });
  };
}
const ia = /* @__PURE__ */ new Set();
let to;
function fT() {
  to = () => {
    const e = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    ia.forEach((n) => n(e));
  }, window.addEventListener("resize", to);
}
function pT(e) {
  return ia.add(e), to || fT(), () => {
    ia.delete(e), !ia.size && typeof to == "function" && (window.removeEventListener("resize", to), to = void 0);
  };
}
function Fm(e, n) {
  return typeof e == "function" ? pT(e) : dT(e, n);
}
function hT(e) {
  return bd(e) && e.tagName === "svg";
}
const mT = [...ov, Ve, Bt], yT = (e) => mT.find(rv(e)), Om = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), no = () => ({
  x: Om(),
  y: Om()
}), jm = () => ({ min: 0, max: 0 }), Ue = () => ({
  x: jm(),
  y: jm()
}), gT = /* @__PURE__ */ new WeakMap();
function Na(e) {
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
function Ia(e) {
  return Na(e.animate) || Dd.some((n) => hi(e[n]));
}
function fv(e) {
  return !!(Ia(e) || e.variants);
}
function vT(e, n, o) {
  for (const i in n) {
    const a = n[i], c = o[i];
    if (Je(a))
      e.addValue(i, a);
    else if (Je(c))
      e.addValue(i, ao(a, { owner: e }));
    else if (c !== a)
      if (e.hasValue(i)) {
        const d = e.getValue(i);
        d.liveStyle === !0 ? d.jump(a) : d.hasAnimated || d.set(a);
      } else {
        const d = e.getStaticValue(i);
        e.addValue(i, ao(d !== void 0 ? d : a, { owner: e }));
      }
  }
  for (const i in o)
    n[i] === void 0 && e.removeValue(i);
  return n;
}
const Dc = { current: null }, pv = { current: !1 }, ST = typeof window < "u";
function wT() {
  if (pv.current = !0, !!ST)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), n = () => Dc.current = e.matches;
      e.addEventListener("change", n), n();
    } else
      Dc.current = !1;
}
const Lm = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let Sa = {};
function hv(e) {
  Sa = e;
}
function _T() {
  return Sa;
}
class xT {
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
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = Td, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const S = it.now();
      this.renderScheduledAt < S && (this.renderScheduledAt = S, Ae.render(this.render, !1, !0));
    };
    const { latestValues: g, renderState: v } = p;
    this.latestValues = g, this.baseTarget = { ...g }, this.initialValues = o.initial ? { ...g } : {}, this.renderState = v, this.parent = n, this.props = o, this.presenceContext = i, this.depth = n ? n.depth + 1 : 0, this.reducedMotionConfig = a, this.skipAnimationsConfig = c, this.options = m, this.blockInitialAnimation = !!d, this.isControllingVariants = Ia(o), this.isVariantNode = fv(o), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(n && n.current);
    const { willChange: l, ...f } = this.scrapeMotionValuesFromProps(o, {}, this);
    for (const S in f) {
      const w = f[S];
      g[S] !== void 0 && Je(w) && w.set(g[S]);
    }
  }
  mount(n) {
    var o, i;
    if (this.hasBeenMounted)
      for (const a in this.initialValues)
        (o = this.values.get(a)) == null || o.jump(this.initialValues[a]), this.latestValues[a] = this.initialValues[a];
    this.current = n, gT.set(n, this), this.projection && !this.projection.instance && this.projection.mount(n), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((a, c) => this.bindToMotionValue(c, a)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (pv.current || wT(), this.shouldReduceMotion = Dc.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (i = this.parent) == null || i.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    var n;
    this.projection && this.projection.unmount(), Hn(this.notifyUpdate), Hn(this.render), this.valueSubscriptions.forEach((o) => o()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), (n = this.parent) == null || n.removeChild(this);
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
    if (this.valueSubscriptions.has(n) && this.valueSubscriptions.get(n)(), o.accelerate && Qg.has(n) && this.current instanceof HTMLElement) {
      const { factory: d, keyframes: p, times: m, ease: g, duration: v } = o.accelerate, l = new Kg({
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
    const i = fo.has(n);
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
    for (n in Sa) {
      const o = Sa[n];
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
    for (let i = 0; i < Lm.length; i++) {
      const a = Lm[i];
      this.propEventSubscriptions[a] && (this.propEventSubscriptions[a](), delete this.propEventSubscriptions[a]);
      const c = "on" + a, d = n[c];
      d && (this.propEventSubscriptions[a] = this.on(a, d));
    }
    this.prevMotionValues = vT(this, this.scrapeMotionValuesFromProps(n, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
    return i === void 0 && o !== void 0 && (i = ao(o === null ? void 0 : o, { owner: this }), this.addValue(n, i)), i;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(n, o) {
    let i = this.latestValues[n] !== void 0 || !this.current ? this.latestValues[n] : this.getBaseTargetFromProps(this.props, n) ?? this.readValueFromInstance(this.current, n, this.options);
    return i != null && (typeof i == "string" && (pg(i) || mg(i)) ? i = parseFloat(i) : !yT(i) && Bt.test(o) && (i = sv(n, o)), this.setBaseTarget(n, Je(i) ? i.get() : i)), Je(i) ? i.get() : i;
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
    return this.events[n] || (this.events[n] = new hd()), this.events[n].add(o);
  }
  notify(n, ...o) {
    this.events[n] && this.events[n].notify(...o);
  }
  scheduleRenderMicrotask() {
    Ed.render(this.render);
  }
}
class mv extends xT {
  constructor() {
    super(...arguments), this.KeyframeResolver = X1;
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
class Gn {
  constructor(n) {
    this.isMounted = !1, this.node = n;
  }
  update() {
  }
}
function yv({ top: e, left: n, right: o, bottom: i }) {
  return {
    x: { min: n, max: o },
    y: { min: e, max: i }
  };
}
function TT({ x: e, y: n }) {
  return { top: n.min, right: e.max, bottom: n.max, left: e.min };
}
function kT(e, n) {
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
function Yu(e) {
  return e === void 0 || e === 1;
}
function Nc({ scale: e, scaleX: n, scaleY: o }) {
  return !Yu(e) || !Yu(n) || !Yu(o);
}
function ar(e) {
  return Nc(e) || gv(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function gv(e) {
  return Vm(e.x) || Vm(e.y);
}
function Vm(e) {
  return e && e !== "0%";
}
function wa(e, n, o) {
  const i = e - o, a = n * i;
  return o + a;
}
function Bm(e, n, o, i, a) {
  return a !== void 0 && (e = wa(e, a, i)), wa(e, o, i) + n;
}
function Ic(e, n = 0, o = 1, i, a) {
  e.min = Bm(e.min, n, o, i, a), e.max = Bm(e.max, n, o, i, a);
}
function vv(e, { x: n, y: o }) {
  Ic(e.x, n.translate, n.scale, n.originPoint), Ic(e.y, o.translate, o.scale, o.originPoint);
}
const zm = 0.999999999999, Um = 1.0000000000001;
function AT(e, n, o, i = !1) {
  var p;
  const a = o.length;
  if (!a)
    return;
  n.x = n.y = 1;
  let c, d;
  for (let m = 0; m < a; m++) {
    c = o[m], d = c.projectionDelta;
    const { visualElement: g } = c.options;
    g && g.props.style && g.props.style.display === "contents" || (i && c.options.layoutScroll && c.scroll && c !== c.root && (Xt(e.x, -c.scroll.offset.x), Xt(e.y, -c.scroll.offset.y)), d && (n.x *= d.x.scale, n.y *= d.y.scale, vv(e, d)), i && ar(c.latestValues) && sa(e, c.latestValues, (p = c.layout) == null ? void 0 : p.layoutBox));
  }
  n.x < Um && n.x > zm && (n.x = 1), n.y < Um && n.y > zm && (n.y = 1);
}
function Xt(e, n) {
  e.min += n, e.max += n;
}
function $m(e, n, o, i, a = 0.5) {
  const c = Te(e.min, e.max, a);
  Ic(e, n, o, c, i);
}
function Hm(e, n) {
  return typeof e == "string" ? parseFloat(e) / 100 * (n.max - n.min) : e;
}
function sa(e, n, o) {
  const i = o ?? e;
  $m(e.x, Hm(n.x, i.x), n.scaleX, n.scale, n.originX), $m(e.y, Hm(n.y, i.y), n.scaleY, n.scale, n.originY);
}
function Sv(e, n) {
  return yv(kT(e.getBoundingClientRect(), n));
}
function CT(e, n, o) {
  const i = Sv(e, o), { scroll: a } = n;
  return a && (Xt(i.x, a.offset.x), Xt(i.y, a.offset.y)), i;
}
const PT = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, ET = co.length;
function MT(e, n, o) {
  let i = "", a = !0;
  for (let d = 0; d < ET; d++) {
    const p = co[d], m = e[p];
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
      const v = Rc(m, va[p]);
      if (!g) {
        a = !1;
        const l = PT[p] || p;
        i += `${l}(${v}) `;
      }
      o && (n[p] = v);
    }
  }
  const c = e.pathRotation;
  return c && (a = !1, i += `rotate(${Rc(c, va.pathRotation)}) `), i = i.trim(), o ? i = o(n, a ? "" : i) : a && (i = "none"), i;
}
function Nd(e, n, o) {
  const { style: i, vars: a, transformOrigin: c } = e;
  let d = !1, p = !1;
  for (const m in n) {
    const g = n[m];
    if (fo.has(m)) {
      d = !0;
      continue;
    } else if (bg(m)) {
      a[m] = g;
      continue;
    } else {
      const v = Rc(g, va[m]);
      m.startsWith("origin") ? (p = !0, c[m] = v) : i[m] = v;
    }
  }
  if (n.transform || (d || o ? i.transform = MT(n, e.transform, o) : i.transform && (i.transform = "none")), p) {
    const { originX: m = "50%", originY: g = "50%", originZ: v = 0 } = c;
    i.transformOrigin = `${m} ${g} ${v}`;
  }
}
function wv(e, { style: n, vars: o }, i, a) {
  const c = e.style;
  let d;
  for (d in n)
    c[d] = n[d];
  a == null || a.applyProjectionStyles(c, i);
  for (d in o)
    c.setProperty(d, o[d]);
}
function Wm(e, n) {
  return n.max === n.min ? 0 : e / (n.max - n.min) * 100;
}
const ri = {
  correct: (e, n) => {
    if (!n.target)
      return e;
    if (typeof e == "string")
      if (ne.test(e))
        e = parseFloat(e);
      else
        return e;
    const o = Wm(e, n.target.x), i = Wm(e, n.target.y);
    return `${o}% ${i}%`;
  }
}, bT = {
  correct: (e, { treeScale: n, projectionDelta: o }) => {
    const i = e, a = Bt.parse(e);
    if (a.length > 5)
      return i;
    const c = Bt.createTransformer(e), d = typeof a[0] != "number" ? 1 : 0, p = o.x.scale * n.x, m = o.y.scale * n.y;
    a[0 + d] /= p, a[1 + d] /= m;
    const g = Te(p, m, 0.5);
    return typeof a[2 + d] == "number" && (a[2 + d] /= g), typeof a[3 + d] == "number" && (a[3 + d] /= g), c(a);
  }
}, Fc = {
  borderRadius: {
    ...ri,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: ri,
  borderTopRightRadius: ri,
  borderBottomLeftRadius: ri,
  borderBottomRightRadius: ri,
  boxShadow: bT
};
function _v(e, { layout: n, layoutId: o }) {
  return fo.has(e) || e.startsWith("origin") || (n || o !== void 0) && (!!Fc[e] || e === "opacity");
}
function Id(e, n, o) {
  var d;
  const i = e.style, a = n == null ? void 0 : n.style, c = {};
  if (!i)
    return c;
  for (const p in i)
    (Je(i[p]) || a && Je(a[p]) || _v(p, e) || ((d = o == null ? void 0 : o.getValue(p)) == null ? void 0 : d.liveStyle) !== void 0) && (c[p] = i[p]);
  return c;
}
function RT(e) {
  return window.getComputedStyle(e);
}
class DT extends mv {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = wv;
  }
  readValueFromInstance(n, o) {
    var i;
    if (fo.has(o))
      return (i = this.projection) != null && i.isProjecting ? wc(o) : Zx(n, o);
    {
      const a = RT(n), c = (bg(o) ? a.getPropertyValue(o) : a[o]) || 0;
      return typeof c == "string" ? c.trim() : c;
    }
  }
  measureInstanceViewportBox(n, { transformPagePoint: o }) {
    return Sv(n, o);
  }
  build(n, o, i) {
    Nd(n, o, i.transformTemplate);
  }
  scrapeMotionValuesFromProps(n, o, i) {
    return Id(n, o, i);
  }
}
const NT = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, IT = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function FT(e, n, o = 1, i = 0, a = !0) {
  e.pathLength = 1;
  const c = a ? NT : IT;
  e[c.offset] = `${-i}`, e[c.array] = `${n} ${o}`;
}
const OT = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function xv(e, {
  attrX: n,
  attrY: o,
  attrScale: i,
  pathLength: a,
  pathSpacing: c = 1,
  pathOffset: d = 0,
  // This is object creation, which we try to avoid per-frame.
  ...p
}, m, g, v) {
  if (Nd(e, p, g), m) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: l, style: f } = e;
  l.transform && (f.transform = l.transform, delete l.transform), (f.transform || l.transformOrigin) && (f.transformOrigin = l.transformOrigin ?? "50% 50%", delete l.transformOrigin), f.transform && (f.transformBox = (v == null ? void 0 : v.transformBox) ?? "fill-box", delete l.transformBox);
  for (const S of OT)
    l[S] !== void 0 && (f[S] = l[S], delete l[S]);
  n !== void 0 && (l.x = n), o !== void 0 && (l.y = o), i !== void 0 && (l.scale = i), a !== void 0 && FT(l, a, c, d, !1);
}
const Tv = /* @__PURE__ */ new Set([
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
]), kv = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function jT(e, n, o, i) {
  wv(e, n, void 0, i);
  for (const a in n.attrs)
    e.setAttribute(Tv.has(a) ? a : Pd(a), n.attrs[a]);
}
function Av(e, n, o) {
  const i = Id(e, n, o);
  for (const a in e)
    if (Je(e[a]) || Je(n[a])) {
      const c = co.indexOf(a) !== -1 ? "attr" + a.charAt(0).toUpperCase() + a.substring(1) : a;
      i[c] = e[a];
    }
  return i;
}
class LT extends mv {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Ue;
  }
  getBaseTargetFromProps(n, o) {
    return n[o];
  }
  readValueFromInstance(n, o) {
    if (fo.has(o)) {
      const i = iv(o);
      return i && i.default || 0;
    }
    return o = Tv.has(o) ? o : Pd(o), n.getAttribute(o);
  }
  scrapeMotionValuesFromProps(n, o, i) {
    return Av(n, o, i);
  }
  build(n, o, i) {
    xv(n, o, this.isSVGTag, i.transformTemplate, i.style);
  }
  renderInstance(n, o, i, a) {
    jT(n, o, i, a);
  }
  mount(n) {
    this.isSVGTag = kv(n.tagName), super.mount(n);
  }
}
const VT = Dd.length;
function Cv(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const o = e.parent ? Cv(e.parent) || {} : {};
    return e.props.initial !== void 0 && (o.initial = e.props.initial), o;
  }
  const n = {};
  for (let o = 0; o < VT; o++) {
    const i = Dd[o], a = e.props[i];
    (hi(a) || a === !1) && (n[i] = a);
  }
  return n;
}
function Pv(e, n) {
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
const BT = [...Rd].reverse(), zT = Rd.length;
function UT(e) {
  return (n) => Promise.all(n.map(({ animation: o, options: i }) => V1(e, o, i)));
}
function $T(e) {
  let n = UT(e), o = Gm(), i = !0, a = !1;
  const c = (g) => (v, l) => {
    var S;
    const f = pr(e, l, g === "exit" ? (S = e.presenceContext) == null ? void 0 : S.custom : void 0);
    if (f) {
      const { transition: w, transitionEnd: x, ...k } = f;
      v = { ...v, ...k, ...x };
    }
    return v;
  };
  function d(g) {
    n = g(e);
  }
  function p(g) {
    const { props: v } = e, l = Cv(e.parent) || {}, f = [], S = /* @__PURE__ */ new Set();
    let w = {}, x = 1 / 0;
    for (let A = 0; A < zT; A++) {
      const E = BT[A], R = o[E], N = v[E] !== void 0 ? v[E] : l[E], j = hi(N), L = E === g ? R.isActive : null;
      L === !1 && (x = A);
      let V = N === l[E] && N !== v[E] && j;
      if (V && (i || a) && e.manuallyAnimateOnMount && (V = !1), R.protectedKeys = { ...w }, // If it isn't active and hasn't *just* been set as inactive
      !R.isActive && L === null || // If we didn't and don't have any defined prop for this animation type
      !N && !R.prevProp || // Or if the prop doesn't define an animation
      Na(N) || typeof N == "boolean")
        continue;
      if (E === "exit" && R.isActive && L !== !0) {
        R.prevResolvedValues && (w = {
          ...w,
          ...R.prevResolvedValues
        });
        continue;
      }
      const G = HT(R.prevProp, N);
      let K = G || // If we're making this variant active, we want to always make it active
      E === g && R.isActive && !V && j || // If we removed a higher-priority variant (i is in reverse order)
      A > x && j, X = !1;
      const ae = Array.isArray(N) ? N : [N];
      let q = ae.reduce(c(E), {});
      L === !1 && (q = {});
      const { prevResolvedValues: de = {} } = R, ue = {
        ...de,
        ...q
      }, xe = ($) => {
        K = !0, S.has($) && (X = !0, S.delete($)), R.needsAnimating[$] = !0;
        const Z = e.getValue($);
        Z && (Z.liveStyle = !1);
      };
      for (const $ in ue) {
        const Z = q[$], Y = de[$];
        if (w.hasOwnProperty($))
          continue;
        let D = !1;
        Cc(Z) && Cc(Y) ? D = !Pv(Z, Y) || G : D = Z !== Y, D ? Z != null ? xe($) : S.add($) : Z !== void 0 && S.has($) ? xe($) : R.protectedKeys[$] = !0;
      }
      R.prevProp = N, R.prevResolvedValues = q, R.isActive && (w = { ...w, ...q }), (i || a) && e.blockInitialAnimation && (K = !1);
      const ve = V && G;
      K && (!ve || X) && f.push(...ae.map(($) => {
        const Z = { type: E };
        if (typeof $ == "string" && (i || a) && !ve && e.manuallyAnimateOnMount && e.parent) {
          const { parent: Y } = e, D = pr(Y, $);
          if (Y.enteringChildren && D) {
            const { delayChildren: B } = D.transition || {};
            Z.delay = Xg(Y.enteringChildren, e, B);
          }
        }
        return {
          animation: $,
          options: Z
        };
      }));
    }
    if (S.size) {
      const A = {};
      if (typeof v.initial != "boolean") {
        const E = pr(e, Array.isArray(v.initial) ? v.initial[0] : v.initial);
        E && E.transition && (A.transition = E.transition);
      }
      S.forEach((E) => {
        const R = e.getBaseTarget(E), N = e.getValue(E);
        N && (N.liveStyle = !0), A[E] = R ?? null;
      }), f.push({ animation: A });
    }
    let k = !!f.length;
    return i && (v.initial === !1 || v.initial === v.animate) && !e.manuallyAnimateOnMount && (k = !1), i = !1, a = !1, k ? n(f) : Promise.resolve();
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
      o = Gm(), a = !0;
    }
  };
}
function HT(e, n) {
  return typeof n == "string" ? n !== e : Array.isArray(n) ? !Pv(n, e) : !1;
}
function sr(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Gm() {
  return {
    animate: sr(!0),
    whileInView: sr(),
    whileHover: sr(),
    whileTap: sr(),
    whileDrag: sr(),
    whileFocus: sr(),
    exit: sr()
  };
}
function Oc(e, n) {
  e.min = n.min, e.max = n.max;
}
function Lt(e, n) {
  Oc(e.x, n.x), Oc(e.y, n.y);
}
function Km(e, n) {
  e.translate = n.translate, e.scale = n.scale, e.originPoint = n.originPoint, e.origin = n.origin;
}
const Ev = 1e-4, WT = 1 - Ev, GT = 1 + Ev, Mv = 0.01, KT = 0 - Mv, YT = 0 + Mv;
function st(e) {
  return e.max - e.min;
}
function QT(e, n, o) {
  return Math.abs(e - n) <= o;
}
function Ym(e, n, o, i = 0.5) {
  e.origin = i, e.originPoint = Te(n.min, n.max, e.origin), e.scale = st(o) / st(n), e.translate = Te(o.min, o.max, e.origin) - e.originPoint, (e.scale >= WT && e.scale <= GT || isNaN(e.scale)) && (e.scale = 1), (e.translate >= KT && e.translate <= YT || isNaN(e.translate)) && (e.translate = 0);
}
function ui(e, n, o, i) {
  Ym(e.x, n.x, o.x, i ? i.originX : void 0), Ym(e.y, n.y, o.y, i ? i.originY : void 0);
}
function Qm(e, n, o, i = 0) {
  const a = i ? Te(o.min, o.max, i) : o.min;
  e.min = a + n.min, e.max = e.min + st(n);
}
function XT(e, n, o, i) {
  Qm(e.x, n.x, o.x, i == null ? void 0 : i.x), Qm(e.y, n.y, o.y, i == null ? void 0 : i.y);
}
function Xm(e, n, o, i = 0) {
  const a = i ? Te(o.min, o.max, i) : o.min;
  e.min = n.min - a, e.max = e.min + st(n);
}
function _a(e, n, o, i) {
  Xm(e.x, n.x, o.x, i == null ? void 0 : i.x), Xm(e.y, n.y, o.y, i == null ? void 0 : i.y);
}
function Zm(e, n, o, i, a) {
  return e -= n, e = wa(e, 1 / o, i), a !== void 0 && (e = wa(e, 1 / a, i)), e;
}
function ZT(e, n = 0, o = 1, i = 0.5, a, c = e, d = e) {
  if (qt.test(n) && (n = parseFloat(n), n = Te(d.min, d.max, n / 100) - d.min), typeof n != "number")
    return;
  let p = Te(c.min, c.max, i);
  e === c && (p -= n), e.min = Zm(e.min, n, o, p, a), e.max = Zm(e.max, n, o, p, a);
}
function Jm(e, n, [o, i, a], c, d) {
  ZT(e, n[o], n[i], n[a], n.scale, c, d);
}
const JT = ["x", "scaleX", "originX"], qT = ["y", "scaleY", "originY"];
function qm(e, n, o, i) {
  Jm(e.x, n, JT, o ? o.x : void 0, i ? i.x : void 0), Jm(e.y, n, qT, o ? o.y : void 0, i ? i.y : void 0);
}
function ey(e) {
  return e.translate === 0 && e.scale === 1;
}
function bv(e) {
  return ey(e.x) && ey(e.y);
}
function ty(e, n) {
  return e.min === n.min && e.max === n.max;
}
function ek(e, n) {
  return ty(e.x, n.x) && ty(e.y, n.y);
}
function ny(e, n) {
  return Math.round(e.min) === Math.round(n.min) && Math.round(e.max) === Math.round(n.max);
}
function Rv(e, n) {
  return ny(e.x, n.x) && ny(e.y, n.y);
}
function ry(e) {
  return st(e.x) / st(e.y);
}
function oy(e, n) {
  return e.translate === n.translate && e.scale === n.scale && e.originPoint === n.originPoint;
}
function Yt(e) {
  return [e("x"), e("y")];
}
function tk(e, n, o) {
  let i = "";
  const a = e.x.translate / n.x, c = e.y.translate / n.y, d = (o == null ? void 0 : o.z) || 0;
  if ((a || c || d) && (i = `translate3d(${a}px, ${c}px, ${d}px) `), (n.x !== 1 || n.y !== 1) && (i += `scale(${1 / n.x}, ${1 / n.y}) `), o) {
    const { transformPerspective: g, rotate: v, pathRotation: l, rotateX: f, rotateY: S, skewX: w, skewY: x } = o;
    g && (i = `perspective(${g}px) ${i}`), v && (i += `rotate(${v}deg) `), l && (i += `rotate(${l}deg) `), f && (i += `rotateX(${f}deg) `), S && (i += `rotateY(${S}deg) `), w && (i += `skewX(${w}deg) `), x && (i += `skewY(${x}deg) `);
  }
  const p = e.x.scale * n.x, m = e.y.scale * n.y;
  return (p !== 1 || m !== 1) && (i += `scale(${p}, ${m})`), i || "none";
}
const Dv = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
], nk = Dv.length, iy = (e) => typeof e == "string" ? parseFloat(e) : e, sy = (e) => typeof e == "number" || ne.test(e);
function rk(e, n, o, i, a, c) {
  a ? (e.opacity = Te(0, o.opacity ?? 1, ok(i)), e.opacityExit = Te(n.opacity ?? 1, 0, ik(i))) : c && (e.opacity = Te(n.opacity ?? 1, o.opacity ?? 1, i));
  for (let d = 0; d < nk; d++) {
    const p = Dv[d];
    let m = ay(n, p), g = ay(o, p);
    if (m === void 0 && g === void 0)
      continue;
    m || (m = 0), g || (g = 0), m === 0 || g === 0 || sy(m) === sy(g) ? (e[p] = Math.max(Te(iy(m), iy(g), i), 0), (qt.test(g) || qt.test(m)) && (e[p] += "%")) : e[p] = g;
  }
  (n.rotate || o.rotate) && (e.rotate = Te(n.rotate || 0, o.rotate || 0, i));
}
function ay(e, n) {
  return e[n] !== void 0 ? e[n] : e.borderRadius;
}
const ok = /* @__PURE__ */ Nv(0, 0.5, kg), ik = /* @__PURE__ */ Nv(0.5, 0.95, bt);
function Nv(e, n, o) {
  return (i) => i < e ? 0 : i > n ? 1 : o(/* @__PURE__ */ fi(e, n, i));
}
function sk(e, n, o) {
  const i = Je(e) ? e : ao(e);
  return i.start(Ad("", i, n, o)), i.animation;
}
function mi(e, n, o, i = { passive: !0 }) {
  return e.addEventListener(n, o, i), () => e.removeEventListener(n, o);
}
const ak = (e, n) => e.depth - n.depth;
class lk {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(n) {
    pd(this.children, n), this.isDirty = !0;
  }
  remove(n) {
    pa(this.children, n), this.isDirty = !0;
  }
  forEach(n) {
    this.isDirty && this.children.sort(ak), this.isDirty = !1, this.children.forEach(n);
  }
}
function uk(e, n) {
  const o = it.now(), i = ({ timestamp: a }) => {
    const c = a - o;
    c >= n && (Hn(i), e(c - n));
  };
  return Ae.setup(i, !0), () => Hn(i);
}
function aa(e) {
  return Je(e) ? e.get() : e;
}
class ck {
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
      (!a || a.isConnected === !1) && !i.snapshot && (pa(this.members, i), i.unmount());
    }
    n.scheduleRender();
  }
  remove(n) {
    if (pa(this.members, n), n === this.prevLead && (this.prevLead = void 0), n === this.lead) {
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
const la = {
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
}, Qu = ["", "X", "Y", "Z"], dk = 1e3;
let fk = 0;
function Xu(e, n, o, i) {
  const { latestValues: a } = n;
  a[e] && (o[e] = a[e], n.setStaticValue(e, 0), i && (i[e] = 0));
}
function Iv(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: n } = e.options;
  if (!n)
    return;
  const o = tv(n);
  if (window.MotionHasOptimisedAnimation(o, "transform")) {
    const { layout: a, layoutId: c } = e.options;
    window.MotionCancelOptimisedAnimation(o, "transform", Ae, !(a || c));
  }
  const { parent: i } = e;
  i && !i.hasCheckedOptimisedAppear && Iv(i);
}
function Fv({ attachResizeListener: e, defaultParent: n, measureScroll: o, checkIsScrollRoot: i, resetTransform: a }) {
  return class {
    constructor(d = {}, p = n == null ? void 0 : n()) {
      this.id = fk++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(mk), this.nodes.forEach(_k), this.nodes.forEach(xk), this.nodes.forEach(yk);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = d, this.root = p ? p.root || p : this, this.path = p ? [...p.path, p] : [], this.parent = p, this.depth = p ? p.depth + 1 : 0;
      for (let m = 0; m < this.path.length; m++)
        this.path[m].shouldResetTransform = !0;
      this.root === this && (this.nodes = new lk());
    }
    addEventListener(d, p) {
      return this.eventHandlers.has(d) || this.eventHandlers.set(d, new hd()), this.eventHandlers.get(d).add(p);
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
      this.isSVG = bd(d) && !hT(d), this.instance = d;
      const { layoutId: p, layout: m, visualElement: g } = this.options;
      if (g && !g.current && g.mount(d), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (m || p) && (this.isLayoutDirty = !0), e) {
        let v, l = 0;
        const f = () => this.root.updateBlockedByResize = !1;
        Ae.read(() => {
          l = window.innerWidth;
        }), e(d, () => {
          const S = window.innerWidth;
          S !== l && (l = S, this.root.updateBlockedByResize = !0, v && v(), v = uk(f, 250), la.hasAnimatedSinceResize && (la.hasAnimatedSinceResize = !1, this.nodes.forEach(cy)));
        });
      }
      p && this.root.registerSharedNode(p, this), this.options.animate !== !1 && g && (p || m) && this.addEventListener("didUpdate", ({ delta: v, hasLayoutChanged: l, hasRelativeLayoutChanged: f, layout: S }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const w = this.options.transition || g.getDefaultTransition() || Pk, { onLayoutAnimationStart: x, onLayoutAnimationComplete: k } = g.getProps(), A = !this.targetLayout || !Rv(this.targetLayout, S), E = !l && f;
        if (this.options.layoutRoot || this.resumeFrom || E || l && (A || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const R = {
            ...kd(w, "layout"),
            onPlay: x,
            onComplete: k
          };
          (g.shouldReduceMotion || this.options.layoutRoot) && (R.delay = 0, R.type = !1), this.startAnimation(R), this.setAnimationOrigin(v, E, R.path);
        } else
          l || cy(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = S;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const d = this.getStack();
      d && d.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), Hn(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(Tk), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && Iv(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
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
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), m && this.nodes.forEach(vk), this.nodes.forEach(ly);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(uy);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(Sk), this.nodes.forEach(wk), this.nodes.forEach(pk), this.nodes.forEach(hk)) : this.nodes.forEach(uy), this.clearAllSnapshots();
      const p = it.now();
      Ze.delta = en(0, 1e3 / 60, p - Ze.timestamp), Ze.timestamp = p, Ze.isProcessing = !0, zu.update.process(Ze), zu.preRender.process(Ze), zu.render.process(Ze), Ze.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, Ed.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(gk), this.sharedNodes.forEach(kk);
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
      const d = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, p = this.projectionDelta && !bv(this.projectionDelta), m = this.getTransformTemplate(), g = m ? m(this.latestValues, "") : void 0, v = g !== this.prevTransformTemplateValue;
      d && this.instance && (p || ar(this.latestValues) || v) && (a(this.instance, g), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(d = !0) {
      const p = this.measurePageBox();
      let m = this.removeElementScroll(p);
      return d && (m = this.removeTransform(m)), Ek(m), {
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
      if (!(((g = this.scroll) == null ? void 0 : g.wasRoot) || this.path.some(Mk))) {
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
        !p && S.options.layoutScroll && S.scroll && S !== S.root && (Xt(g.x, -S.scroll.offset.x), Xt(g.y, -S.scroll.offset.y)), ar(S.latestValues) && sa(g, S.latestValues, (v = S.layout) == null ? void 0 : v.layoutBox);
      }
      return ar(this.latestValues) && sa(g, this.latestValues, (l = this.layout) == null ? void 0 : l.layoutBox), g;
    }
    removeTransform(d) {
      var m;
      const p = Ue();
      Lt(p, d);
      for (let g = 0; g < this.path.length; g++) {
        const v = this.path[g];
        if (!ar(v.latestValues))
          continue;
        let l;
        v.instance && (Nc(v.latestValues) && v.updateSnapshot(), l = Ue(), Lt(l, v.measurePageBox())), qm(p, v.latestValues, (m = v.snapshot) == null ? void 0 : m.layoutBox, l);
      }
      return ar(this.latestValues) && qm(p, this.latestValues), p;
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
      f && this.linkedParentVersion !== f.layoutVersion && !f.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && f && f.layout ? this.createRelativeTarget(f, this.layout.layoutBox, f.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = Ue(), this.targetWithTransforms = Ue()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), XT(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : Lt(this.target, this.layout.layoutBox), vv(this.target, this.targetDelta)) : Lt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? this.createRelativeTarget(f, this.target, f.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Nc(this.parent.latestValues) || gv(this.parent.latestValues)))
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
      if ((this.isProjectionDirty || (w = this.parent) != null && w.isProjectionDirty) && (m = !1), p && (this.isSharedProjectionDirty || this.isTransformDirty) && (m = !1), this.resolvedRelativeTargetAt === Ze.timestamp && (m = !1), m)
        return;
      const { layout: g, layoutId: v } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(g || v))
        return;
      Lt(this.layoutCorrected, this.layout.layoutBox);
      const l = this.treeScale.x, f = this.treeScale.y;
      AT(this.layoutCorrected, this.treeScale, this.path, p), d.layout && !d.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (d.target = d.layout.layoutBox, d.targetWithTransforms = Ue());
      const { target: S } = d;
      if (!S) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Km(this.prevProjectionDelta.x, this.projectionDelta.x), Km(this.prevProjectionDelta.y, this.projectionDelta.y)), ui(this.projectionDelta, this.layoutCorrected, S, this.latestValues), (this.treeScale.x !== l || this.treeScale.y !== f || !oy(this.projectionDelta.x, this.prevProjectionDelta.x) || !oy(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", S));
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
      this.prevProjectionDelta = no(), this.projectionDelta = no(), this.projectionDeltaWithTransform = no();
    }
    setAnimationOrigin(d, p = !1, m) {
      const g = this.snapshot, v = g ? g.latestValues : {}, l = { ...this.latestValues }, f = no();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !p;
      const S = Ue(), w = g ? g.source : void 0, x = this.layout ? this.layout.source : void 0, k = w !== x, A = this.getStack(), E = !A || A.members.length <= 1, R = !!(k && !E && this.options.crossfade === !0 && !this.path.some(Ck));
      this.animationProgress = 0;
      let N;
      const j = m == null ? void 0 : m.interpolateProjection(d);
      this.mixTargetDelta = (L) => {
        const V = L / 1e3, G = j == null ? void 0 : j(V);
        G ? (f.x.translate = G.x, f.x.scale = Te(d.x.scale, 1, V), f.x.origin = d.x.origin, f.x.originPoint = d.x.originPoint, f.y.translate = G.y, f.y.scale = Te(d.y.scale, 1, V), f.y.origin = d.y.origin, f.y.originPoint = d.y.originPoint) : (dy(f.x, d.x, V), dy(f.y, d.y, V)), this.setTargetDelta(f), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (_a(S, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), Ak(this.relativeTarget, this.relativeTargetOrigin, S, V), N && ek(this.relativeTarget, N) && (this.isProjectionDirty = !1), N || (N = Ue()), Lt(N, this.relativeTarget)), k && (this.animationValues = l, rk(l, v, this.latestValues, V, R, E)), G && G.rotate !== void 0 && (this.animationValues || (this.animationValues = l), this.animationValues.pathRotation = G.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = V;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(d) {
      var p, m, g;
      this.notifyListeners("animationStart"), (p = this.currentAnimation) == null || p.stop(), (g = (m = this.resumingFrom) == null ? void 0 : m.currentAnimation) == null || g.stop(), this.pendingAnimation && (Hn(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Ae.update(() => {
        la.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = ao(0)), this.motionValue.jump(0, !1), this.currentAnimation = sk(this.motionValue, [0, 1e3], {
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(dk), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const d = this.getLead();
      let { targetWithTransforms: p, target: m, layout: g, latestValues: v } = d;
      if (!(!p || !m || !g)) {
        if (this !== d && this.layout && g && Ov(this.options.animationType, this.layout.layoutBox, g.layoutBox)) {
          m = this.target || Ue();
          const l = st(this.layout.layoutBox.x);
          m.x.min = d.target.x.min, m.x.max = m.x.min + l;
          const f = st(this.layout.layoutBox.y);
          m.y.min = d.target.y.min, m.y.max = m.y.min + f;
        }
        Lt(p, m), sa(p, v), ui(this.projectionDeltaWithTransform, this.layoutCorrected, p, v);
      }
    }
    registerSharedNode(d, p) {
      this.sharedNodes.has(d) || this.sharedNodes.set(d, new ck()), this.sharedNodes.get(d).add(p);
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
      m.z && Xu("z", d, g, this.animationValues);
      for (let v = 0; v < Qu.length; v++)
        Xu(`rotate${Qu[v]}`, d, g, this.animationValues), Xu(`skew${Qu[v]}`, d, g, this.animationValues);
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
        this.needsReset = !1, d.visibility = "", d.opacity = "", d.pointerEvents = aa(p == null ? void 0 : p.pointerEvents) || "", d.transform = m ? m(this.latestValues, "") : "none";
        return;
      }
      const g = this.getLead();
      if (!this.projectionDelta || !this.layout || !g.target) {
        this.options.layoutId && (d.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, d.pointerEvents = aa(p == null ? void 0 : p.pointerEvents) || ""), this.hasProjected && !ar(this.latestValues) && (d.transform = m ? m({}, "") : "none", this.hasProjected = !1);
        return;
      }
      d.visibility = "";
      const v = g.animationValues || g.latestValues;
      this.applyTransformsToTarget();
      let l = tk(this.projectionDeltaWithTransform, this.treeScale, v);
      m && (l = m(v, l)), d.transform = l;
      const { x: f, y: S } = this.projectionDelta;
      d.transformOrigin = `${f.origin * 100}% ${S.origin * 100}% 0`, g.animationValues ? d.opacity = g === this ? v.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : v.opacityExit : d.opacity = g === this ? v.opacity !== void 0 ? v.opacity : "" : v.opacityExit !== void 0 ? v.opacityExit : 0;
      for (const w in Fc) {
        if (v[w] === void 0)
          continue;
        const { correct: x, applyTo: k, isCSSVariable: A } = Fc[w], E = l === "none" ? v[w] : x(v[w], g);
        if (k) {
          const R = k.length;
          for (let N = 0; N < R; N++)
            d[k[N]] = E;
        } else
          A ? this.options.visualElement.renderState.vars[w] = E : d[w] = E;
      }
      this.options.layoutId && (d.pointerEvents = g === this ? aa(p == null ? void 0 : p.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((d) => {
        var p;
        return (p = d.currentAnimation) == null ? void 0 : p.stop();
      }), this.root.nodes.forEach(ly), this.root.sharedNodes.clear();
    }
  };
}
function pk(e) {
  e.updateLayout();
}
function hk(e) {
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
      Oc(d ? n.measuredBox[l] : n.layoutBox[l], i[l]);
    } else Ov(c, n.layoutBox, i) && Yt((l) => {
      const f = d ? n.measuredBox[l] : n.layoutBox[l], S = st(i[l]);
      f.max = f.min + S, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[l].max = e.relativeTarget[l].min + S);
    });
    const p = no();
    ui(p, i, n.layoutBox);
    const m = no();
    d ? ui(m, e.applyTransform(a, !0), n.measuredBox) : ui(m, i, n.layoutBox);
    const g = !bv(p);
    let v = !1;
    if (!e.resumeFrom) {
      const l = e.getClosestProjectingParent();
      if (l && !l.resumeFrom) {
        const { snapshot: f, layout: S } = l;
        if (f && S) {
          const w = e.options.layoutAnchor || void 0, x = Ue();
          _a(x, n.layoutBox, f.layoutBox, w);
          const k = Ue();
          _a(k, i, S.layoutBox, w), Rv(x, k) || (v = !0), l.options.layoutRoot && (e.relativeTarget = k, e.relativeTargetOrigin = x, e.relativeParent = l);
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
function mk(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function yk(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function gk(e) {
  e.clearSnapshot();
}
function ly(e) {
  e.clearMeasurements();
}
function vk(e) {
  e.isLayoutDirty = !0, e.updateLayout();
}
function uy(e) {
  e.isLayoutDirty = !1;
}
function Sk(e) {
  e.isAnimationBlocked && e.layout && !e.isLayoutDirty && (e.snapshot = e.layout, e.isLayoutDirty = !0);
}
function wk(e) {
  const { visualElement: n } = e.options;
  n && n.getProps().onBeforeLayoutMeasure && n.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function cy(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function _k(e) {
  e.resolveTargetDelta();
}
function xk(e) {
  e.calcProjection();
}
function Tk(e) {
  e.resetSkewAndRotation();
}
function kk(e) {
  e.removeLeadSnapshot();
}
function dy(e, n, o) {
  e.translate = Te(n.translate, 0, o), e.scale = Te(n.scale, 1, o), e.origin = n.origin, e.originPoint = n.originPoint;
}
function fy(e, n, o, i) {
  e.min = Te(n.min, o.min, i), e.max = Te(n.max, o.max, i);
}
function Ak(e, n, o, i) {
  fy(e.x, n.x, o.x, i), fy(e.y, n.y, o.y, i);
}
function Ck(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const Pk = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, py = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), hy = py("applewebkit/") && !py("chrome/") ? Math.round : bt;
function my(e) {
  e.min = hy(e.min), e.max = hy(e.max);
}
function Ek(e) {
  my(e.x), my(e.y);
}
function Ov(e, n, o) {
  return e === "position" || e === "preserve-aspect" && !QT(ry(n), ry(o), 0.2);
}
function Mk(e) {
  var n;
  return e !== e.root && ((n = e.scroll) == null ? void 0 : n.wasRoot);
}
const bk = Fv({
  attachResizeListener: (e, n) => mi(e, "resize", n),
  measureScroll: () => {
    var e, n;
    return {
      x: document.documentElement.scrollLeft || ((e = document.body) == null ? void 0 : e.scrollLeft) || 0,
      y: document.documentElement.scrollTop || ((n = document.body) == null ? void 0 : n.scrollTop) || 0
    };
  },
  checkIsScrollRoot: () => !0
}), Zu = {
  current: void 0
}, jv = Fv({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!Zu.current) {
      const e = new bk({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), Zu.current = e;
    }
    return Zu.current;
  },
  resetTransform: (e, n) => {
    e.style.transform = n !== void 0 ? n : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), Fd = C.createContext({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
function yy(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function Rk(...e) {
  return (n) => {
    let o = !1;
    const i = e.map((a) => {
      const c = yy(a, n);
      return !o && typeof c == "function" && (o = !0), c;
    });
    if (o)
      return () => {
        for (let a = 0; a < i.length; a++) {
          const c = i[a];
          typeof c == "function" ? c() : yy(e[a], null);
        }
      };
  };
}
function Dk(...e) {
  return C.useCallback(Rk(...e), e);
}
class Nk extends C.Component {
  getSnapshotBeforeUpdate(n) {
    const o = this.props.childRef.current;
    if (na(o) && n.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const i = o.offsetParent, a = na(i) && i.offsetWidth || 0, c = na(i) && i.offsetHeight || 0, d = getComputedStyle(o), p = this.props.sizeRef.current;
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
function Ik({ children: e, isPresent: n, anchorX: o, anchorY: i, root: a, pop: c }) {
  var f;
  const d = C.useId(), p = C.useRef(null), m = C.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: g } = C.useContext(Fd), v = ((f = e.props) == null ? void 0 : f.ref) ?? (e == null ? void 0 : e.ref), l = Dk(p, v);
  return C.useInsertionEffect(() => {
    const { width: S, height: w, top: x, left: k, right: A, bottom: E, direction: R } = m.current;
    if (n || c === !1 || !p.current || !S || !w)
      return;
    const N = R === "rtl", j = o === "left" ? N ? `right: ${A}` : `left: ${k}` : N ? `left: ${k}` : `right: ${A}`, L = i === "bottom" ? `bottom: ${E}` : `top: ${x}`;
    p.current.dataset.motionPopId = d;
    const V = document.createElement("style");
    g && (V.nonce = g);
    const G = a ?? document.head;
    return G.appendChild(V), V.sheet && V.sheet.insertRule(`
          [data-motion-pop-id="${d}"] {
            position: absolute !important;
            width: ${S}px !important;
            height: ${w}px !important;
            ${j}px !important;
            ${L}px !important;
          }
        `), () => {
      var K;
      (K = p.current) == null || K.removeAttribute("data-motion-pop-id"), G.contains(V) && G.removeChild(V);
    };
  }, [n]), T.jsx(Nk, { isPresent: n, childRef: p, sizeRef: m, pop: c, children: c === !1 ? e : C.cloneElement(e, { ref: l }) });
}
const Fk = ({ children: e, initial: n, isPresent: o, onExitComplete: i, custom: a, presenceAffectsLayout: c, mode: d, anchorX: p, anchorY: m, root: g }) => {
  const v = fd(Ok), l = C.useId();
  let f = !0, S = C.useMemo(() => (f = !1, {
    id: l,
    initial: n,
    isPresent: o,
    custom: a,
    onExitComplete: (w) => {
      v.set(w, !0);
      for (const x of v.values())
        if (!x)
          return;
      i && i();
    },
    register: (w) => (v.set(w, !1), () => v.delete(w))
  }), [o, v, i]);
  return c && f && (S = { ...S }), C.useMemo(() => {
    v.forEach((w, x) => v.set(x, !1));
  }, [o]), C.useEffect(() => {
    !o && !v.size && i && i();
  }, [o]), e = T.jsx(Ik, { pop: d === "popLayout", isPresent: o, anchorX: p, anchorY: m, root: g, children: e }), T.jsx(Ra.Provider, { value: S, children: e });
};
function Ok() {
  return /* @__PURE__ */ new Map();
}
function Lv(e = !0) {
  const n = C.useContext(Ra);
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
const Hs = (e) => e.key || "";
function gy(e) {
  const n = [];
  return C.Children.forEach(e, (o) => {
    C.isValidElement(o) && n.push(o);
  }), n;
}
const Fa = ({ children: e, custom: n, initial: o = !0, onExitComplete: i, presenceAffectsLayout: a = !0, mode: c = "sync", propagate: d = !1, anchorX: p = "left", anchorY: m = "top", root: g }) => {
  const [v, l] = Lv(d), f = C.useMemo(() => gy(e), [e]), S = d && !v ? [] : f.map(Hs), w = C.useRef(!0), x = C.useRef(f), k = fd(() => /* @__PURE__ */ new Map()), A = C.useRef(/* @__PURE__ */ new Set()), [E, R] = C.useState(f), [N, j] = C.useState(f);
  fg(() => {
    w.current = !1, x.current = f;
    for (let G = 0; G < N.length; G++) {
      const K = Hs(N[G]);
      S.includes(K) ? (k.delete(K), A.current.delete(K)) : k.get(K) !== !0 && k.set(K, !1);
    }
  }, [N, S.length, S.join("-")]);
  const L = [];
  if (f !== E) {
    let G = [...f];
    for (let K = 0; K < N.length; K++) {
      const X = N[K], ae = Hs(X);
      S.includes(ae) || (G.splice(K, 0, X), L.push(X));
    }
    return c === "wait" && L.length && (G = L), j(gy(G)), R(f), null;
  }
  const { forceRender: V } = C.useContext(dd);
  return T.jsx(T.Fragment, { children: N.map((G) => {
    const K = Hs(G), X = d && !v ? !1 : f === N || S.includes(K), ae = () => {
      if (A.current.has(K))
        return;
      if (k.has(K))
        A.current.add(K), k.set(K, !0);
      else
        return;
      let q = !0;
      k.forEach((de) => {
        de || (q = !1);
      }), q && (V == null || V(), j(x.current), d && (l == null || l()), i && i());
    };
    return T.jsx(Fk, { isPresent: X, initial: !w.current || o ? void 0 : !1, custom: n, presenceAffectsLayout: a, mode: c, root: g, onExitComplete: X ? void 0 : ae, anchorX: p, anchorY: m, children: G }, K);
  }) });
}, Vv = C.createContext({ strict: !1 }), vy = {
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
let Sy = !1;
function jk() {
  if (Sy)
    return;
  const e = {};
  for (const n in vy)
    e[n] = {
      isEnabled: (o) => vy[n].some((i) => !!o[i])
    };
  hv(e), Sy = !0;
}
function Bv() {
  return jk(), _T();
}
function Lk(e) {
  const n = Bv();
  for (const o in e)
    n[o] = {
      ...n[o],
      ...e[o]
    };
  hv(n);
}
const Vk = /* @__PURE__ */ new Set([
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
function xa(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || Vk.has(e);
}
let zv = (e) => !xa(e);
function Bk(e) {
  typeof e == "function" && (zv = (n) => n.startsWith("on") ? !xa(n) : e(n));
}
try {
  Bk(require("@emotion/is-prop-valid").default);
} catch {
}
function zk(e, n, o) {
  const i = {};
  for (const a in e)
    a === "values" && typeof e.values == "object" || Je(e[a]) || (zv(a) || o === !0 && xa(a) || !n && !xa(a) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && a.startsWith("onDrag")) && (i[a] = e[a]);
  return i;
}
const Oa = /* @__PURE__ */ C.createContext({});
function Uk(e, n) {
  if (Ia(e)) {
    const { initial: o, animate: i } = e;
    return {
      initial: o === !1 || hi(o) ? o : void 0,
      animate: hi(i) ? i : void 0
    };
  }
  return e.inherit !== !1 ? n : {};
}
function $k(e) {
  const { initial: n, animate: o } = Uk(e, C.useContext(Oa));
  return C.useMemo(() => ({ initial: n, animate: o }), [wy(n), wy(o)]);
}
function wy(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const Od = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function Uv(e, n, o) {
  for (const i in n)
    !Je(n[i]) && !_v(i, o) && (e[i] = n[i]);
}
function Hk({ transformTemplate: e }, n) {
  return C.useMemo(() => {
    const o = Od();
    return Nd(o, n, e), Object.assign({}, o.vars, o.style);
  }, [n]);
}
function Wk(e, n) {
  const o = e.style || {}, i = {};
  return Uv(i, o, e), Object.assign(i, Hk(e, n)), i;
}
function Gk(e, n) {
  const o = {}, i = Wk(e, n);
  return e.drag && e.dragListener !== !1 && (o.draggable = !1, i.userSelect = i.WebkitUserSelect = i.WebkitTouchCallout = "none", i.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (o.tabIndex = 0), o.style = i, o;
}
const $v = () => ({
  ...Od(),
  attrs: {}
});
function Kk(e, n, o, i) {
  const a = C.useMemo(() => {
    const c = $v();
    return xv(c, n, kv(i), e.transformTemplate, e.style), {
      ...c.attrs,
      style: { ...c.style }
    };
  }, [n]);
  if (e.style) {
    const c = {};
    Uv(c, e.style, e), a.style = { ...c, ...a.style };
  }
  return a;
}
const Yk = [
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
function jd(e) {
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
      !!(Yk.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function Qk(e, n, o, { latestValues: i }, a, c = !1, d) {
  const m = (d ?? jd(e) ? Kk : Gk)(n, i, a, e), g = zk(n, typeof e == "string", c), v = e !== C.Fragment ? { ...g, ...m, ref: o } : {}, { children: l } = n, f = C.useMemo(() => Je(l) ? l.get() : l, [l]);
  return C.createElement(e, {
    ...v,
    children: f
  });
}
function Xk({ scrapeMotionValuesFromProps: e, createRenderState: n }, o, i, a) {
  return {
    latestValues: Zk(o, i, a, e),
    renderState: n()
  };
}
function Zk(e, n, o, i) {
  const a = {}, c = i(e, {});
  for (const f in c)
    a[f] = aa(c[f]);
  let { initial: d, animate: p } = e;
  const m = Ia(e), g = fv(e);
  n && g && !m && e.inherit !== !1 && (d === void 0 && (d = n.initial), p === void 0 && (p = n.animate));
  let v = o ? o.initial === !1 : !1;
  v = v || d === !1;
  const l = v ? p : d;
  if (l && typeof l != "boolean" && !Na(l)) {
    const f = Array.isArray(l) ? l : [l];
    for (let S = 0; S < f.length; S++) {
      const w = Cd(e, f[S]);
      if (w) {
        const { transitionEnd: x, transition: k, ...A } = w;
        for (const E in A) {
          let R = A[E];
          if (Array.isArray(R)) {
            const N = v ? R.length - 1 : 0;
            R = R[N];
          }
          R !== null && (a[E] = R);
        }
        for (const E in x)
          a[E] = x[E];
      }
    }
  }
  return a;
}
const Hv = (e) => (n, o) => {
  const i = C.useContext(Oa), a = C.useContext(Ra), c = () => Xk(e, n, i, a);
  return o ? c() : fd(c);
}, Jk = /* @__PURE__ */ Hv({
  scrapeMotionValuesFromProps: Id,
  createRenderState: Od
}), qk = /* @__PURE__ */ Hv({
  scrapeMotionValuesFromProps: Av,
  createRenderState: $v
}), eA = Symbol.for("motionComponentSymbol");
function tA(e, n, o) {
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
const Wv = C.createContext({});
function Jr(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function nA(e, n, o, i, a, c) {
  var R, N;
  const { visualElement: d } = C.useContext(Oa), p = C.useContext(Vv), m = C.useContext(Ra), g = C.useContext(Fd), v = g.reducedMotion, l = g.skipAnimations, f = C.useRef(null), S = C.useRef(!1);
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
  const w = f.current, x = C.useContext(Wv);
  w && !w.projection && a && (w.type === "html" || w.type === "svg") && rA(f.current, o, a, x);
  const k = C.useRef(!1);
  C.useInsertionEffect(() => {
    w && k.current && w.update(o, m);
  });
  const A = o[ev], E = C.useRef(!!A && typeof window < "u" && !((R = window.MotionHandoffIsComplete) != null && R.call(window, A)) && ((N = window.MotionHasOptimisedAnimation) == null ? void 0 : N.call(window, A)));
  return fg(() => {
    S.current = !0, w && (k.current = !0, window.MotionIsMounted = !0, w.updateFeatures(), w.scheduleRenderMicrotask(), E.current && w.animationState && w.animationState.animateChanges());
  }), C.useEffect(() => {
    w && (!E.current && w.animationState && w.animationState.animateChanges(), E.current && (queueMicrotask(() => {
      var j;
      (j = window.MotionHandoffMarkAsComplete) == null || j.call(window, A);
    }), E.current = !1), w.enteringChildren = void 0);
  }), w;
}
function rA(e, n, o, i) {
  const { layoutId: a, layout: c, drag: d, dragConstraints: p, layoutScroll: m, layoutRoot: g, layoutAnchor: v, layoutCrossfade: l } = n;
  e.projection = new o(e.latestValues, n["data-framer-portal-id"] ? void 0 : Gv(e.parent)), e.projection.setOptions({
    layoutId: a,
    layout: c,
    alwaysMeasureLayout: !!d || p && Jr(p),
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
function Gv(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Gv(e.parent);
}
function Ju(e, { forwardMotionProps: n = !1, type: o } = {}, i, a) {
  i && Lk(i);
  const c = o ? o === "svg" : jd(e), d = c ? qk : Jk;
  function p(g, v) {
    let l;
    const f = {
      ...C.useContext(Fd),
      ...g,
      layoutId: oA(g)
    }, { isStatic: S } = f, w = $k(g), x = d(g, S);
    if (!S && typeof window < "u") {
      iA();
      const k = sA(f);
      l = k.MeasureLayout, w.visualElement = nA(e, x, f, a, k.ProjectionNode, c);
    }
    return T.jsxs(Oa.Provider, { value: w, children: [l && w.visualElement ? T.jsx(l, { visualElement: w.visualElement, ...f }) : null, Qk(e, g, tA(x, w.visualElement, v), x, S, n, c)] });
  }
  p.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const m = C.forwardRef(p);
  return m[eA] = e, m;
}
function oA({ layoutId: e }) {
  const n = C.useContext(dd).id;
  return n && e !== void 0 ? n + "-" + e : e;
}
function iA(e, n) {
  C.useContext(Vv).strict;
}
function sA(e) {
  const n = Bv(), { drag: o, layout: i } = n;
  if (!o && !i)
    return {};
  const a = { ...o, ...i };
  return {
    MeasureLayout: o != null && o.isEnabled(e) || i != null && i.isEnabled(e) ? a.MeasureLayout : void 0,
    ProjectionNode: a.ProjectionNode
  };
}
function aA(e, n) {
  if (typeof Proxy > "u")
    return Ju;
  const o = /* @__PURE__ */ new Map(), i = (c, d) => Ju(c, d, e, n), a = (c, d) => i(c, d);
  return new Proxy(a, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (c, d) => d === "create" ? i : (o.has(d) || o.set(d, Ju(d, void 0, e, n)), o.get(d))
  });
}
const lA = (e, n) => n.isSVG ?? jd(e) ? new LT(n) : new DT(n, {
  allowProjection: e !== C.Fragment
});
class uA extends Gn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(n) {
    super(n), n.animationState || (n.animationState = $T(n));
  }
  updateAnimationControlsSubscription() {
    const { animate: n } = this.node.getProps();
    Na(n) && (this.unmountControls = n.subscribe(this.node));
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
let cA = 0;
class dA extends Gn {
  constructor() {
    super(...arguments), this.id = cA++, this.isExitComplete = !1;
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
          const m = pr(this.node, d, p);
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
const fA = {
  animation: {
    Feature: uA
  },
  exit: {
    Feature: dA
  }
};
function Ci(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const pA = (e) => (n) => Md(n) && e(n, Ci(n));
function ci(e, n, o, i) {
  return mi(e, n, pA(o), i);
}
const Kv = ({ current: e }) => e ? e.ownerDocument.defaultView : null, _y = (e, n) => Math.abs(e - n);
function hA(e, n) {
  const o = _y(e.x, n.x), i = _y(e.y, n.y);
  return Math.sqrt(o ** 2 + i ** 2);
}
const xy = /* @__PURE__ */ new Set(["auto", "scroll"]);
class Yv {
  constructor(n, o, { transformPagePoint: i, contextWindow: a = window, dragSnapToOrigin: c = !1, distanceThreshold: d = 3, element: p } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (S) => {
      this.handleScroll(S.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = Ws(this.lastRawMoveEventInfo, this.transformPagePoint));
      const S = qu(this.lastMoveEventInfo, this.history), w = this.startEvent !== null, x = hA(S.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!w && !x)
        return;
      const { point: k } = S, { timestamp: A } = Ze;
      this.history.push({ ...k, timestamp: A });
      const { onStart: E, onMove: R } = this.handlers;
      w || (E && E(this.lastMoveEvent, S), this.startEvent = this.lastMoveEvent), R && R(this.lastMoveEvent, S);
    }, this.handlePointerMove = (S, w) => {
      this.lastMoveEvent = S, this.lastRawMoveEventInfo = w, this.lastMoveEventInfo = Ws(w, this.transformPagePoint), Ae.update(this.updatePoint, !0);
    }, this.handlePointerUp = (S, w) => {
      this.end();
      const { onEnd: x, onSessionEnd: k, resumeAnimation: A } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && A && A(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const E = qu(S.type === "pointercancel" ? this.lastMoveEventInfo : Ws(w, this.transformPagePoint), this.history);
      this.startEvent && x && x(S, E), k && k(S, E);
    }, !Md(n))
      return;
    this.dragSnapToOrigin = c, this.handlers = o, this.transformPagePoint = i, this.distanceThreshold = d, this.contextWindow = a || window;
    const m = Ci(n), g = Ws(m, this.transformPagePoint), { point: v } = g, { timestamp: l } = Ze;
    this.history = [{ ...v, timestamp: l }];
    const { onSessionStart: f } = o;
    f && f(n, qu(g, this.history)), this.removeListeners = Ti(ci(this.contextWindow, "pointermove", this.handlePointerMove), ci(this.contextWindow, "pointerup", this.handlePointerUp), ci(this.contextWindow, "pointercancel", this.handlePointerUp)), p && this.startScrollTracking(p);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(n) {
    let o = n.parentElement;
    for (; o; ) {
      const i = getComputedStyle(o);
      (xy.has(i.overflowX) || xy.has(i.overflowY)) && this.scrollPositions.set(o, {
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
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), Hn(this.updatePoint);
  }
}
function Ws(e, n) {
  return n ? { point: n(e.point) } : e;
}
function Ty(e, n) {
  return { x: e.x - n.x, y: e.y - n.y };
}
function qu({ point: e }, n) {
  return {
    point: e,
    delta: Ty(e, Qv(n)),
    offset: Ty(e, mA(n)),
    velocity: yA(n, 0.1)
  };
}
function mA(e) {
  return e[0];
}
function Qv(e) {
  return e[e.length - 1];
}
function yA(e, n) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let o = e.length - 1, i = null;
  const a = Qv(e);
  for (; o >= 0 && (i = e[o], !(a.timestamp - i.timestamp > /* @__PURE__ */ ht(n))); )
    o--;
  if (!i)
    return { x: 0, y: 0 };
  i === e[0] && e.length > 2 && a.timestamp - i.timestamp > /* @__PURE__ */ ht(n) * 2 && (i = e[1]);
  const c = /* @__PURE__ */ Mt(a.timestamp - i.timestamp);
  if (c === 0)
    return { x: 0, y: 0 };
  const d = {
    x: (a.x - i.x) / c,
    y: (a.y - i.y) / c
  };
  return d.x === 1 / 0 && (d.x = 0), d.y === 1 / 0 && (d.y = 0), d;
}
function gA(e, { min: n, max: o }, i) {
  return n !== void 0 && e < n ? e = i ? Te(n, e, i.min) : Math.max(e, n) : o !== void 0 && e > o && (e = i ? Te(o, e, i.max) : Math.min(e, o)), e;
}
function ky(e, n, o) {
  return {
    min: n !== void 0 ? e.min + n : void 0,
    max: o !== void 0 ? e.max + o - (e.max - e.min) : void 0
  };
}
function vA(e, { top: n, left: o, bottom: i, right: a }) {
  return {
    x: ky(e.x, o, a),
    y: ky(e.y, n, i)
  };
}
function Ay(e, n) {
  let o = n.min - e.min, i = n.max - e.max;
  return n.max - n.min < e.max - e.min && ([o, i] = [i, o]), { min: o, max: i };
}
function SA(e, n) {
  return {
    x: Ay(e.x, n.x),
    y: Ay(e.y, n.y)
  };
}
function wA(e, n) {
  let o = 0.5;
  const i = st(e), a = st(n);
  return a > i ? o = /* @__PURE__ */ fi(n.min, n.max - i, e.min) : i > a && (o = /* @__PURE__ */ fi(e.min, e.max - a, n.min)), en(0, 1, o);
}
function _A(e, n) {
  const o = {};
  return n.min !== void 0 && (o.min = n.min - e.min), n.max !== void 0 && (o.max = n.max - e.min), o;
}
const jc = 0.35;
function xA(e = jc) {
  return e === !1 ? e = 0 : e === !0 && (e = jc), {
    x: Cy(e, "left", "right"),
    y: Cy(e, "top", "bottom")
  };
}
function Cy(e, n, o) {
  return {
    min: Py(e, n),
    max: Py(e, o)
  };
}
function Py(e, n) {
  return typeof e == "number" ? e : e[n] || 0;
}
const TA = /* @__PURE__ */ new WeakMap();
class kA {
  constructor(n) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = Ue(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = n;
  }
  start(n, { snapToCursor: o = !1, distanceThreshold: i } = {}) {
    const { presenceContext: a } = this.visualElement;
    if (a && a.isPresent === !1)
      return;
    const c = (l) => {
      o && this.snapToCursor(Ci(l).point), this.stopAnimation();
    }, d = (l, f) => {
      const { drag: S, dragPropagation: w, onDragStart: x } = this.getProps();
      if (S && !w && (this.openDragLock && this.openDragLock(), this.openDragLock = Z1(S), !this.openDragLock))
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
      }), x && Ae.update(() => x(l, f), !1, !0), Pc(this.visualElement, "transform");
      const { animationState: k } = this.visualElement;
      k && k.setActive("whileDrag", !0);
    }, p = (l, f) => {
      this.latestPointerEvent = l, this.latestPanInfo = f;
      const { dragPropagation: S, dragDirectionLock: w, onDirectionLock: x, onDrag: k } = this.getProps();
      if (!S && !this.openDragLock)
        return;
      const { offset: A } = f;
      if (w && this.currentDirection === null) {
        this.currentDirection = CA(A), this.currentDirection !== null && x && x(this.currentDirection);
        return;
      }
      this.updateAxis("x", f.point, A), this.updateAxis("y", f.point, A), this.visualElement.render(), k && Ae.update(() => k(l, f), !1, !0);
    }, m = (l, f) => {
      this.latestPointerEvent = l, this.latestPanInfo = f, this.stop(l, f), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, g = () => {
      const { dragSnapToOrigin: l } = this.getProps();
      (l || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: v } = this.getProps();
    this.panSession = new Yv(n, {
      onSessionStart: c,
      onStart: d,
      onMove: p,
      onSessionEnd: m,
      resumeAnimation: g
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: v,
      distanceThreshold: i,
      contextWindow: Kv(this.visualElement),
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
    if (!i || !Gs(n, a, this.currentDirection))
      return;
    const c = this.getAxisMotionValue(n);
    let d = this.originPoint[n] + i[n];
    this.constraints && this.constraints[n] && (d = gA(d, this.constraints[n], this.elastic[n])), c.set(d);
  }
  resolveConstraints() {
    var c;
    const { dragConstraints: n, dragElastic: o } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (c = this.visualElement.projection) == null ? void 0 : c.layout, a = this.constraints;
    n && Jr(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && i ? this.constraints = vA(i.layoutBox, n) : this.constraints = !1, this.elastic = xA(o), a !== this.constraints && !Jr(n) && i && this.constraints && !this.hasMutatedConstraints && Yt((d) => {
      this.constraints !== !1 && this.getAxisMotionValue(d) && (this.constraints[d] = _A(i.layoutBox[d], this.constraints[d]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: n, onMeasureDragConstraints: o } = this.getProps();
    if (!n || !Jr(n))
      return !1;
    const i = n.current;
    vr(i !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: a } = this.visualElement;
    if (!a || !a.layout)
      return !1;
    a.root && (a.root.scroll = void 0, a.root.updateScroll());
    const c = CT(i, a.root, this.visualElement.getTransformPagePoint());
    let d = SA(a.layout.layoutBox, c);
    if (o) {
      const p = o(TT(d));
      this.hasMutatedConstraints = !!p, p && (d = yv(p));
    }
    return d;
  }
  startAnimation(n) {
    const { drag: o, dragMomentum: i, dragElastic: a, dragTransition: c, dragSnapToOrigin: d, onDragTransitionEnd: p } = this.getProps(), m = this.constraints || {}, g = Yt((v) => {
      if (!Gs(v, o, this.currentDirection))
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
    return Pc(this.visualElement, n), i.start(Ad(n, i, 0, o, this.visualElement, !1));
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
      if (!Gs(o, i, this.currentDirection))
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
    if (!Jr(o) || !i || !this.constraints)
      return;
    this.stopAnimation();
    const a = { x: 0, y: 0 };
    Yt((d) => {
      const p = this.getAxisMotionValue(d);
      if (p && this.constraints !== !1) {
        const m = p.get();
        a[d] = wA({ min: m, max: m }, this.constraints[d]);
      }
    });
    const { transformTemplate: c } = this.visualElement.getProps();
    this.visualElement.current.style.transform = c ? c({}, "") : "none", i.root && i.root.updateScroll(), i.updateLayout(), this.constraints = !1, this.resolveConstraints(), Yt((d) => {
      if (!Gs(d, n, null))
        return;
      const p = this.getAxisMotionValue(d), { min: m, max: g } = this.constraints[d];
      p.set(Te(m, g, a[d]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    TA.set(this.visualElement, this);
    const n = this.visualElement.current, o = ci(n, "pointerdown", (g) => {
      const { drag: v, dragListener: l = !0 } = this.getProps(), f = g.target, S = f !== n && rT(f);
      v && l && !S && this.start(g);
    });
    let i;
    const a = () => {
      const { dragConstraints: g } = this.getProps();
      Jr(g) && g.current && (this.constraints = this.resolveRefConstraints(), i || (i = AA(n, g.current, () => this.scalePositionWithinConstraints())));
    }, { projection: c } = this.visualElement, d = c.addEventListener("measure", a);
    c && !c.layout && (c.root && c.root.updateScroll(), c.updateLayout()), Ae.read(a);
    const p = mi(window, "resize", () => this.scalePositionWithinConstraints()), m = c.addEventListener("didUpdate", (({ delta: g, hasLayoutChanged: v }) => {
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
    const n = this.visualElement.getProps(), { drag: o = !1, dragDirectionLock: i = !1, dragPropagation: a = !1, dragConstraints: c = !1, dragElastic: d = jc, dragMomentum: p = !0 } = n;
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
function Ey(e) {
  let n = !0;
  return () => {
    if (n) {
      n = !1;
      return;
    }
    e();
  };
}
function AA(e, n, o) {
  const i = Fm(e, Ey(o)), a = Fm(n, Ey(o));
  return () => {
    i(), a();
  };
}
function Gs(e, n, o) {
  return (n === !0 || n === e) && (o === null || o === e);
}
function CA(e, n = 10) {
  let o = null;
  return Math.abs(e.y) > n ? o = "y" : Math.abs(e.x) > n && (o = "x"), o;
}
class PA extends Gn {
  constructor(n) {
    super(n), this.removeGroupControls = bt, this.removeListeners = bt, this.controls = new kA(n);
  }
  mount() {
    const { dragControls: n } = this.node.getProps();
    n && (this.removeGroupControls = n.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || bt;
  }
  update() {
    const { dragControls: n } = this.node.getProps(), { dragControls: o } = this.node.prevProps || {};
    n !== o && (this.removeGroupControls(), n && (this.removeGroupControls = n.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const ec = (e) => (n, o) => {
  e && Ae.update(() => e(n, o), !1, !0);
};
class EA extends Gn {
  constructor() {
    super(...arguments), this.removePointerDownListener = bt;
  }
  onPointerDown(n) {
    this.session = new Yv(n, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Kv(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: n, onPanStart: o, onPan: i, onPanEnd: a } = this.node.getProps();
    return {
      onSessionStart: ec(n),
      onStart: ec(o),
      onMove: ec(i),
      onEnd: (c, d) => {
        delete this.session, a && Ae.postRender(() => a(c, d));
      }
    };
  }
  mount() {
    this.removePointerDownListener = ci(this.node.current, "pointerdown", (n) => this.onPointerDown(n));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let tc = !1;
class MA extends C.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: n, layoutGroup: o, switchLayoutGroup: i, layoutId: a } = this.props, { projection: c } = n;
    c && (o.group && o.group.add(c), i && i.register && a && i.register(c), tc && c.root.didUpdate(), c.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), c.setOptions({
      ...c.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), la.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(n) {
    const { layoutDependency: o, visualElement: i, drag: a, isPresent: c } = this.props, { projection: d } = i;
    return d && (d.isPresent = c, n.layoutDependency !== o && d.setOptions({
      ...d.options,
      layoutDependency: o
    }), tc = !0, a || n.layoutDependency !== o || o === void 0 || n.isPresent !== c ? d.willUpdate() : this.safeToRemove(), n.isPresent !== c && (c ? d.promote() : d.relegate() || Ae.postRender(() => {
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
    tc = !0, a && (a.scheduleCheckAfterUnmount(), o && o.group && o.group.remove(a), i && i.deregister && i.deregister(a));
  }
  safeToRemove() {
    const { safeToRemove: n } = this.props;
    n && n();
  }
  render() {
    return null;
  }
}
function Xv(e) {
  const [n, o] = Lv(), i = C.useContext(dd);
  return T.jsx(MA, { ...e, layoutGroup: i, switchLayoutGroup: C.useContext(Wv), isPresent: n, safeToRemove: o });
}
const bA = {
  pan: {
    Feature: EA
  },
  drag: {
    Feature: PA,
    ProjectionNode: jv,
    MeasureLayout: Xv
  }
};
function My(e, n, o) {
  const { props: i } = e;
  e.animationState && i.whileHover && e.animationState.setActive("whileHover", o === "Start");
  const a = "onHover" + o, c = i[a];
  c && Ae.postRender(() => c(n, Ci(n)));
}
class RA extends Gn {
  mount() {
    const { current: n } = this.node;
    n && (this.unmount = q1(n, (o, i) => (My(this.node, i, "Start"), (a) => My(this.node, a, "End"))));
  }
  unmount() {
  }
}
class DA extends Gn {
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
    this.unmount = Ti(mi(this.node.current, "focus", () => this.onFocus()), mi(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function by(e, n, o) {
  const { props: i } = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
    return;
  e.animationState && i.whileTap && e.animationState.setActive("whileTap", o === "Start");
  const a = "onTap" + (o === "End" ? "" : o), c = i[a];
  c && Ae.postRender(() => c(n, Ci(n)));
}
class NA extends Gn {
  mount() {
    const { current: n } = this.node;
    if (!n)
      return;
    const { globalTapTarget: o, propagate: i } = this.node.props;
    this.unmount = iT(n, (a, c) => (by(this.node, c, "Start"), (d, { success: p }) => by(this.node, d, p ? "End" : "Cancel")), {
      useGlobalTarget: o,
      stopPropagation: (i == null ? void 0 : i.tap) === !1
    });
  }
  unmount() {
  }
}
const Lc = /* @__PURE__ */ new WeakMap(), nc = /* @__PURE__ */ new WeakMap(), IA = (e) => {
  const n = Lc.get(e.target);
  n && n(e);
}, FA = (e) => {
  e.forEach(IA);
};
function OA({ root: e, ...n }) {
  const o = e || document;
  nc.has(o) || nc.set(o, {});
  const i = nc.get(o), a = JSON.stringify(n);
  return i[a] || (i[a] = new IntersectionObserver(FA, { root: e, ...n })), i[a];
}
function jA(e, n, o) {
  const i = OA(n);
  return Lc.set(e, o), i.observe(e), () => {
    Lc.delete(e), i.unobserve(e);
  };
}
const LA = {
  some: 0,
  all: 1
};
class VA extends Gn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var m;
    (m = this.stopObserver) == null || m.call(this);
    const { viewport: n = {} } = this.node.getProps(), { root: o, margin: i, amount: a = "some", once: c } = n, d = {
      root: o ? o.current : void 0,
      rootMargin: i,
      threshold: typeof a == "number" ? a : LA[a]
    }, p = (g) => {
      const { isIntersecting: v } = g;
      if (this.isInView === v || (this.isInView = v, c && !v && this.hasEnteredView))
        return;
      v && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", v);
      const { onViewportEnter: l, onViewportLeave: f } = this.node.getProps(), S = v ? l : f;
      S && S(g);
    };
    this.stopObserver = jA(this.node.current, d, p);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: n, prevProps: o } = this.node;
    ["amount", "margin", "root"].some(BA(n, o)) && this.startObserver();
  }
  unmount() {
    var n;
    (n = this.stopObserver) == null || n.call(this), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function BA({ viewport: e = {} }, { viewport: n = {} } = {}) {
  return (o) => e[o] !== n[o];
}
const zA = {
  inView: {
    Feature: VA
  },
  tap: {
    Feature: NA
  },
  focus: {
    Feature: DA
  },
  hover: {
    Feature: RA
  }
}, UA = {
  layout: {
    ProjectionNode: jv,
    MeasureLayout: Xv
  }
}, $A = {
  ...fA,
  ...zA,
  ...bA,
  ...UA
}, Sr = /* @__PURE__ */ aA($A, lA);
function HA(e) {
  const o = String(e || "").toLowerCase().split(".");
  if (o.length !== 4 || o.some((a) => !/^\d+$/.test(a))) return !1;
  const i = o.map(Number);
  return i.some((a) => a < 0 || a > 255) ? !1 : i[0] === 10 || i[0] === 172 && i[1] >= 16 && i[1] <= 31 || i[0] === 192 && i[1] === 168;
}
function Zv(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function Ry(e) {
  return Zv(e) || HA(e);
}
function WA(e) {
  return !e || Zv(e) ? "127.0.0.1" : e;
}
const GA = (() => {
  var v, l, f, S;
  const e = globalThis.window || globalThis, n = globalThis.document || {}, o = e.location || {}, i = String(e.SYNAPSE_DATA_API_PORT || ((l = (v = n.body) == null ? void 0 : v.dataset) == null ? void 0 : l.dataApiPort) || "3001").trim(), { protocol: a = "file:", hostname: c = "127.0.0.1", port: d = "" } = o, p = `http://${WA(c)}:${i || "3001"}`, m = String(e.SYNAPSE_DATA_API_BASE || ((S = (f = n.body) == null ? void 0 : f.dataset) == null ? void 0 : S.dataApiBase) || "").replace(/\/+$/, ""), g = `${a}//${o.host || (d ? `${c}:${d}` : c)}`.replace(/\/+$/, "");
  return m && !(Ry(c) && d !== i && m === g) ? m : a === "file:" || Ry(c) && d !== i ? p : `${a}//${o.host || c}`;
})(), KA = new ug(GA), rc = Number((globalThis.window || globalThis).SYNAPSE_DATA_API_TIMEOUT_MS || 6e3), YA = Number.isFinite(rc) && rc > 0 ? rc : 6e3;
function QA(e, n) {
  typeof window > "u" || console.warn(e, n);
}
async function XA(e) {
  var i, a;
  const o = (((a = (i = e.headers) == null ? void 0 : i.get) == null ? void 0 : a.call(i, "content-type")) || "").includes("application/json") ? await e.json() : {};
  if (!e.ok || (o == null ? void 0 : o.ok) === !1)
    throw new Error((o == null ? void 0 : o.error) || `Synapse data API returned HTTP ${e.status}`);
  return o;
}
async function ZA(e, n = {}) {
  const o = await KA.fetch(e, {
    timeoutMs: YA,
    ...n
  });
  return XA(o);
}
async function JA(e) {
  try {
    return (await ZA("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e || {})
    })).item || null;
  } catch (n) {
    return QA("Synapse data API focus-session save skipped:", n), null;
  }
}
class qA {
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
const Jv = new qA();
function Ld(e, n) {
  return Jv.readJSON(e, n);
}
function Vd(e, n) {
  return Jv.writeJSON(e, n);
}
const qv = "synapse.focusRoom.sessions.v1", e0 = "synapse.focusRoom.draft.v1", t0 = "synapse.focusRoom.active-session.v1", Vc = 40, Dy = Object.freeze([
  "idle",
  "running",
  "paused",
  "completed",
  "break",
  "restoring"
]), eC = Object.freeze({
  studying: "running",
  running: "running",
  idle: "idle",
  paused: "paused",
  completed: "completed",
  break: "break",
  restoring: "restoring"
});
let Bc = [];
const lr = (e) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(e)}`, yi = [
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
    streamUrl: lr("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
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
    streamUrl: lr("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: lr("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: lr("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: lr("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: lr("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: lr("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, gi = [
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
], wr = [
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
], tC = [25, 45, 50, 90];
function nC(e = "") {
  const n = String(e || "");
  return yi.find((o) => o.label === n) || yi[0];
}
function rC(e = "") {
  const n = String(e || "");
  return gi.find((o) => o.label === n) || gi[0];
}
function ja(e = {}) {
  const n = nC(e == null ? void 0 : e.musicType), o = rC(e == null ? void 0 : e.ambientSound);
  return {
    musicTrack: n,
    ambientSound: o,
    ambientLayers: o.layers.map((i) => ({
      ...i,
      volumeBias: Vn(i.volumeBias, 1)
    }))
  };
}
function oC(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function n0(e) {
  return String(e || "").trim();
}
function iC({ material: e, goal: n, durationMinutes: o }) {
  var v;
  const i = Math.max(10, Number(o) || 25), a = (v = e == null ? void 0 : e.studyHeadings) != null && v.length ? e.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], c = String(n || "").trim() || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`, d = Math.max(1, Math.floor(i * 0.2)), p = Math.max(1, Math.floor(i * 0.4)), m = Math.max(1, Math.floor(i * 0.2)), g = Math.max(1, i - d - p - m);
  return [
    { minutes: d, task: `Set the goal: ${c}` },
    { minutes: p, task: `Review ${a[0] || "the core ideas"}` },
    { minutes: m, task: `Practice with ${a[1] || a[0] || "the generated examples"}` },
    { minutes: g, task: "Summarize mistakes and choose the next study step" }
  ];
}
function r0() {
  return Ld(e0, null);
}
function sC(e) {
  return Vd(e0, e || null);
}
function o0(e) {
  if (!e || typeof e != "object")
    return { materials: {} };
  const n = oC(e.materials);
  return {
    ...e,
    materials: { ...n }
  };
}
function lo(e, n = "idle") {
  const o = eC[String(e || "").trim().toLowerCase()];
  return o && Dy.includes(o) ? o : Dy.includes(n) ? n : "idle";
}
function Bd(e) {
  return lo(e) === "running" ? "studying" : lo(e);
}
function i0(e = {}, n = {}) {
  const o = e && typeof e == "object" ? e : {}, i = n && typeof n == "object" ? n : {}, a = Object.prototype.hasOwnProperty.call(o, "timerStatus"), c = Object.prototype.hasOwnProperty.call(o, "timerState") || Object.prototype.hasOwnProperty.call(o, "timerPhase"), d = lo(
    c ? o.timerState || o.timerPhase : a ? o.timerStatus : o.status || i.timerState,
    lo(i.timerState || i.timerPhase || i.timerStatus)
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
    timerStatus: Bd(d),
    timerMode: p,
    elapsedSeconds: v,
    ...g
  };
}
function s0() {
  return o0(Ld(t0, null));
}
function aC(e) {
  return Vd(t0, o0(e));
}
function lC(e) {
  const n = n0(e);
  if (!n) return null;
  const i = s0().materials[n];
  return i && typeof i == "object" ? i0(i) : null;
}
function zd(e, n) {
  const o = n0(e);
  if (!o) return !1;
  const i = s0();
  return n && typeof n == "object" ? i.materials[o] = {
    ...i0(n, i.materials[o]),
    materialId: o,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  } : delete i.materials[o], aC(i);
}
function a0(e) {
  return zd(e, null);
}
function zc() {
  const e = Ld(qv, []), n = Array.isArray(e) ? e : [], o = /* @__PURE__ */ new Set();
  return [...Bc, ...n].filter((i) => {
    const a = String((i == null ? void 0 : i.sessionId) || "");
    return !a || o.has(a) ? !1 : (o.add(a), !0);
  }).slice(0, Vc);
}
function Vn(e, n) {
  const o = Number(e);
  return Number.isFinite(o) ? o : n;
}
function uC(e = {}) {
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
  }, persisted: !0 }, a = zc().filter((m) => m.sessionId !== i.sessionId), c = [i, ...a.map((m) => ({ ...m, persisted: !0 }))].slice(0, Vc), d = Vd(qv, c), p = { ...i, persisted: d };
  return JA(p).catch((m) => {
    console.warn("Synapse data API focus-session background save failed:", m);
  }), d ? Bc = [] : Bc = [p, ...a].slice(0, Vc), p;
}
function Ud(e) {
  const n = Math.max(0, Vn(e || 0, 0)), o = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60);
  return o ? `${o}h ${i}m` : `${i}m`;
}
var sg;
const Uc = ((sg = wr[0]) == null ? void 0 : sg.id) || "morning-window", Bn = tC[0], cC = 10, La = 180, $d = 60, l0 = La * 60, dC = 0, fC = 100, pC = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"], $c = new Set(pC), u0 = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function hC(e, n, o, i) {
  const a = Number(e);
  return Number.isFinite(a) ? Math.min(i, Math.max(o, a)) : n;
}
function hr(e, n, o, i) {
  return Math.round(hC(e, n, o, i));
}
function mr(e, n = 50) {
  return hr(e, n, dC, fC);
}
function Va(e, n = Bn) {
  return hr(e, n, cC, La);
}
function xr(e, n = Bn * 60) {
  return hr(e, n, $d, l0);
}
function Hd(e) {
  return wr.find((n) => n.id === e) || null;
}
function Wn(e = Uc) {
  return Hd(e) || wr[0] || {
    id: Uc,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function c0(e) {
  return Array.isArray(e) ? e.map((n) => ({
    minutes: hr(n == null ? void 0 : n.minutes, 5, 1, La),
    task: String((n == null ? void 0 : n.task) || "").trim()
  })).filter((n) => n.task) : [];
}
function si(e) {
  return Array.isArray(e) ? e.map((n) => ({
    role: String((n == null ? void 0 : n.role) || "assistant") === "user" ? "user" : "assistant",
    text: String((n == null ? void 0 : n.text) || "").trim(),
    createdAt: (n == null ? void 0 : n.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
  })).filter((n) => n.text).slice(-24) : [];
}
function d0(e) {
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
function Hc(e, n, o) {
  return e ? iC({
    material: e,
    goal: n,
    durationMinutes: o
  }) : [];
}
function vi(e) {
  const n = Va(e);
  return n > 0 ? n * 60 : 0;
}
function Ta(e) {
  const n = Math.max(0, Math.floor(Number(e) || 0)), o = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60), a = n % 60, c = (d) => String(d).padStart(2, "0");
  return o ? `${o}:${c(i)}:${c(a)}` : `${c(i)}:${c(a)}`;
}
function Ny(e) {
  const n = (e == null ? void 0 : e.flashcards) || [];
  return Array.isArray(n) ? n.slice(0, 24) : [];
}
function mC(e, n) {
  return String((e == null ? void 0 : e.id) || (e == null ? void 0 : e.front) || (e == null ? void 0 : e.term) || n);
}
function yC(e) {
  var n;
  return Array.isArray(e == null ? void 0 : e.questions) ? e.questions : Array.isArray((n = e == null ? void 0 : e.quiz) == null ? void 0 : n.questions) ? e.quiz.questions : [];
}
function Wc(e) {
  return (Array.isArray(e == null ? void 0 : e.quizzes) ? e.quizzes : []).flatMap((o) => yC(o).map((i) => {
    var a;
    return {
      ...i,
      quizTitle: (o == null ? void 0 : o.title) || ((a = o == null ? void 0 : o.quiz) == null ? void 0 : a.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function gC(e, n) {
  return (e == null ? void 0 : e.question) || (e == null ? void 0 : e.prompt) || (e == null ? void 0 : e.stem) || `Question ${n + 1}`;
}
function Wd(e) {
  return String((e == null ? void 0 : e.type) || "").toLowerCase();
}
function vC(e) {
  return String((e == null ? void 0 : e.label) || (e == null ? void 0 : e.text) || e).trim();
}
function ka(e) {
  const n = (e == null ? void 0 : e.choices) || (e == null ? void 0 : e.options) || (e == null ? void 0 : e.answers);
  return Array.isArray(n) && n.length ? n.map(vC).filter(Boolean) : Wd(e) === "true_false" ? ["True", "False"] : [];
}
function Gc(e) {
  const n = (e == null ? void 0 : e.correctOptionIndexes) || (e == null ? void 0 : e.correct_option_indexes) || (e == null ? void 0 : e.correctIndexes);
  return Array.isArray(n) ? n.map((o) => Number(o)).filter(Number.isInteger) : [];
}
function SC(e, n) {
  const o = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [], i = Array.isArray(n) ? [...n].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [];
  return o.length === i.length && o.every((a, c) => a === i[c]);
}
function yr(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Aa(e, n) {
  if (Number.isInteger(n)) return n;
  const o = Number(n);
  if (typeof n != "string" && Number.isInteger(o)) return o;
  const i = ka(e), a = yr(n);
  return i.findIndex((c) => yr(c) === a);
}
function f0(e, n) {
  if (typeof n == "boolean") return n;
  if (n === 0) return !0;
  if (n === 1) return !1;
  const o = ka(e), i = yr(n);
  return i === "true" ? !0 : i === "false" ? !1 : yr(o[0]) === i ? !0 : yr(o[1]) === i ? !1 : null;
}
function wC(e, n, o) {
  const i = Wd(e);
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
    const a = f0(e, n);
    return a === null ? "" : a;
  }
  return String(n || "");
}
function p0(e) {
  const n = (e == null ? void 0 : e.correctAnswer) ?? (e == null ? void 0 : e.correct_answer) ?? (e == null ? void 0 : e.answer) ?? (e == null ? void 0 : e.correct), o = Gc(e);
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
function _C(e, n) {
  const o = Wd(e);
  if (o === "single_choice") {
    const a = Gc(e)[0], c = Aa(e, n);
    return Number.isInteger(a) ? c === a : null;
  }
  if (o === "multiple_choice") {
    const a = Gc(e), c = Array.isArray(n) ? n : [Aa(e, n)].filter(Number.isInteger);
    return a.length ? SC(c, a) : null;
  }
  if (o === "true_false") {
    const a = typeof (e == null ? void 0 : e.correctBoolean) == "boolean" ? e.correctBoolean : e == null ? void 0 : e.correct_boolean, c = f0(e, n);
    return typeof a == "boolean" && c !== null ? c === a : null;
  }
  const i = p0(e);
  return i ? yr(n) === yr(i) : null;
}
function h0(e, n, o) {
  var p;
  const i = String(e || "").trim(), a = String((n == null ? void 0 : n.summaryText) || (n == null ? void 0 : n.aiSummary) || "").slice(0, 420), c = ((p = n == null ? void 0 : n.studyHeadings) == null ? void 0 : p[0]) || (n == null ? void 0 : n.materialTitle) || "this material", d = o || `Study ${(n == null ? void 0 : n.materialTitle) || "this material"}`;
  return i ? [
    `For ${c}: ${a || "use the selected material as your main source."}`,
    `Your current goal is: ${d}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function xC() {
  return /* @__PURE__ */ T.jsx("svg", { className: "liquid-glass-filter-defs", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ T.jsx("defs", { children: /* @__PURE__ */ T.jsxs("filter", { id: "liquid-glass-displacement", x: "-12%", y: "-12%", width: "124%", height: "124%", colorInterpolationFilters: "sRGB", children: [
    /* @__PURE__ */ T.jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.024", numOctaves: "2", seed: "17", result: "liquid-noise" }),
    /* @__PURE__ */ T.jsx("feDisplacementMap", { in: "SourceGraphic", in2: "liquid-noise", scale: "7", xChannelSelector: "R", yChannelSelector: "B", result: "refracted-surface" }),
    /* @__PURE__ */ T.jsx("feColorMatrix", { in: "refracted-surface", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.04 0", result: "edge-alpha" }),
    /* @__PURE__ */ T.jsx("feGaussianBlur", { in: "edge-alpha", stdDeviation: "0.25", result: "soft-edge" }),
    /* @__PURE__ */ T.jsx("feBlend", { in: "soft-edge", in2: "refracted-surface", mode: "screen" })
  ] }) }) });
}
function TC({ scene: e }) {
  const [n, o] = C.useState(!1), [i, a] = C.useState(!1);
  return C.useEffect(() => {
    o(!1), a(!1);
  }, [e == null ? void 0 : e.id]), /* @__PURE__ */ T.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ T.jsx(xC, {}),
    /* @__PURE__ */ T.jsx(Fa, { mode: "wait", children: /* @__PURE__ */ T.jsxs(
      Sr.div,
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
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kC = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), AC = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (n, o, i) => i ? i.toUpperCase() : o.toLowerCase()
), Iy = (e) => {
  const n = AC(e);
  return n.charAt(0).toUpperCase() + n.slice(1);
}, m0 = (...e) => e.filter((n, o, i) => !!n && n.trim() !== "" && i.indexOf(n) === o).join(" ").trim(), CC = (e) => {
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
var PC = {
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
const EC = C.forwardRef(
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
      ...PC,
      width: n,
      height: n,
      stroke: e,
      strokeWidth: i ? Number(o) * 24 / Number(n) : o,
      className: m0("lucide", a),
      ...!c && !CC(p) && { "aria-hidden": "true" },
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
const Ye = (e, n) => {
  const o = C.forwardRef(
    ({ className: i, ...a }, c) => C.createElement(EC, {
      ref: c,
      iconNode: n,
      className: m0(
        `lucide-${kC(Iy(e))}`,
        `lucide-${e}`,
        i
      ),
      ...a
    })
  );
  return o.displayName = Iy(e), o;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MC = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], bC = Ye("check", MC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const RC = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]], DC = Ye("chevron-down", RC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const NC = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]], IC = Ye("chevron-up", NC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FC = [
  ["rect", { width: "12", height: "12", x: "2", y: "10", rx: "2", ry: "2", key: "6agr2n" }],
  [
    "path",
    { d: "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6", key: "1o487t" }
  ],
  ["path", { d: "M6 18h.01", key: "uhywen" }],
  ["path", { d: "M10 14h.01", key: "ssrbsk" }],
  ["path", { d: "M15 6h.01", key: "cblpky" }],
  ["path", { d: "M18 9h.01", key: "2061c0" }]
], OC = Ye("dices", FC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jC = [
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
], LC = Ye("door-open", jC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const VC = [
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
], Ca = Ye("footprints", VC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const BC = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
], zC = Ye("minimize-2", BC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UC = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], Kc = Ye("pause", UC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $C = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], y0 = Ye("play", $C);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const HC = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], g0 = Ye("rotate-ccw", HC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const WC = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
], GC = Ye("save", WC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const KC = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
], Yc = Ye("settings-2", KC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const YC = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], v0 = Ye("skip-forward", YC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const QC = [
  ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
  ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
  ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
  ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
  ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
  ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
  ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
  ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
  ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }]
], XC = Ye("sliders-horizontal", QC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ZC = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
], Pa = Ye("users", ZC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const JC = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], Gd = Ye("volume-2", JC);
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
], eP = Ye("waves", qC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tP = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], nP = Ye("x", tP), Fy = (e) => {
  let n;
  const o = /* @__PURE__ */ new Set(), i = (g, v) => {
    const l = typeof g == "function" ? g(n) : g;
    if (!Object.is(l, n)) {
      const f = n;
      n = v ?? (typeof l != "object" || l === null) ? l : Object.assign({}, n, l), o.forEach((S) => S(n, f));
    }
  }, a = () => n, p = { setState: i, getState: a, getInitialState: () => m, subscribe: (g) => (o.add(g), () => o.delete(g)) }, m = n = e(i, a, p);
  return p;
}, rP = ((e) => e ? Fy(e) : Fy), oP = (e) => e;
function iP(e, n = oP) {
  const o = pn.useSyncExternalStore(
    e.subscribe,
    pn.useCallback(() => n(e.getState()), [e, n]),
    pn.useCallback(() => n(e.getInitialState()), [e, n])
  );
  return pn.useDebugValue(o), o;
}
const Oy = (e) => {
  const n = rP(e), o = (i) => iP(n, i);
  return Object.assign(o, n), o;
}, sP = ((e) => e ? Oy(e) : Oy), Kd = Object.freeze({
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
function aP() {
  return wr[0] || Wn(Uc);
}
function lP(e) {
  const n = String(e || "");
  if (!n) return null;
  const i = d0(r0()).materials[n];
  return i && typeof i == "object" ? i : null;
}
function Fn(e) {
  var i;
  const n = String(e.selectedMaterialId || ((i = e.selectedMaterial) == null ? void 0 : i.materialId) || "");
  if (!n) return;
  const o = d0(r0());
  o.materials[n] = {
    materialId: n,
    selectedScene: e.selectedScene,
    musicType: e.musicType,
    ambientSound: e.ambientSound,
    musicVolume: mr(e.musicVolume),
    ambientVolume: mr(e.ambientVolume),
    audioChannels: { ...Kd, ...e.audioChannels || {} },
    durationMinutes: Va(e.pomodoroDuration),
    durationSeconds: xr(e.pomodoroDurationSeconds, vi(e.pomodoroDuration)),
    studyGoal: e.studyGoal,
    studyPlan: c0(e.studyPlan),
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks.filter(Boolean) : [],
    workspaceNotes: String(e.workspaceNotes || ""),
    workspaceUpdatedAt: e.workspaceUpdatedAt || "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, sC(o);
}
function uP(e) {
  return Array.isArray(e == null ? void 0 : e.completedTasks) ? e.completedTasks.map((n) => String(n || "").trim()).filter(Boolean) : [];
}
function Qc(e = {}) {
  return {
    sectionTitle: String(e.sectionTitle || "").trim(),
    excerpt: String(e.excerpt || "").trim().slice(0, 1800)
  };
}
function S0(e = null) {
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
  return lo(e.timerState || e.timerPhase || e.status || e.timerStatus);
}
function ro(e = {}) {
  const n = Number(e.pomodoroDurationSeconds);
  return Number.isFinite(n) && n > 0 ? xr(n, vi(e.pomodoroDuration)) : vi(e.pomodoroDuration);
}
function zn(e = {}) {
  if (e.timerMode === "countup") return 0;
  const n = Number(e.timerDurationSeconds);
  return Number.isFinite(n) && n > 0 ? n : ro(e);
}
function Ea(e = {}, n = wt()) {
  const o = Math.max(0, Number(e.elapsedSeconds) || 0);
  if (Zt(e) !== "running") return o;
  const i = Number(e.timerAnchorAtMs);
  return !Number.isFinite(i) || i <= 0 ? o : Math.max(o, Math.floor(Math.max(0, n - i) / 1e3));
}
function Qt(e, n = wt()) {
  const o = lo(e);
  return {
    timerState: o,
    timerPhase: o,
    status: o,
    timerStatus: Bd(o),
    timerUpdatedAtMs: n
  };
}
function cP(e = {}) {
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
    pomodoroDurationSeconds: ro(e),
    elapsedSeconds: Math.max(0, Number(e.elapsedSeconds) || 0),
    startedAt: e.startedAt || null,
    currentSession: e.currentSession || null,
    view: e.view
  };
}
function On(e) {
  var o;
  const n = String(e.selectedMaterialId || ((o = e.selectedMaterial) == null ? void 0 : o.materialId) || "");
  return !n || e.view !== "session" ? !1 : zd(n, cP(e));
}
function jy(e, n = wt()) {
  const o = Ea(e, n), i = zn(e), a = e.timerMode !== "countup" && i > 0 && o >= i, c = a ? "completed" : Zt(e);
  return {
    ...Qt(c, n),
    elapsedSeconds: a ? i : o,
    timerAnchorAtMs: c === "running" ? e.timerAnchorAtMs : null,
    timerPausedAtMs: c === "running" ? null : e.timerPausedAtMs || n,
    audioPlaying: c === "running" ? e.audioPlaying : !1
  };
}
function dP(e, n = {}) {
  const o = Wn(n.selectedScene), i = lP(e == null ? void 0 : e.materialId), a = Hd(i == null ? void 0 : i.selectedScene) ? i.selectedScene : o.id, c = Wn(a), d = String((i == null ? void 0 : i.musicType) || c.musicType || "Deep Focus"), p = String((i == null ? void 0 : i.ambientSound) || c.ambientSound || "Nature"), m = mr(i == null ? void 0 : i.musicVolume, n.musicVolume ?? 60), g = mr(i == null ? void 0 : i.ambientVolume, n.ambientVolume ?? 50), v = Va(i == null ? void 0 : i.durationMinutes, n.pomodoroDuration ?? Bn), l = xr(
    i == null ? void 0 : i.durationSeconds,
    n.pomodoroDurationSeconds ?? v * 60
  ), f = String((i == null ? void 0 : i.studyGoal) || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`), S = c0(i == null ? void 0 : i.studyPlan), w = S.length ? S : Hc(e, f, v), x = uP(i), k = String((i == null ? void 0 : i.workspaceNotes) || ""), A = (i == null ? void 0 : i.workspaceUpdatedAt) || (i == null ? void 0 : i.updatedAt) || "";
  return {
    selectedScene: a,
    musicType: d,
    ambientSound: p,
    musicVolume: m,
    ambientVolume: g,
    audioChannels: { ...Kd, ...(i == null ? void 0 : i.audioChannels) || n.audioChannels || {} },
    pomodoroDuration: v,
    pomodoroDurationSeconds: l,
    studyGoal: f,
    studyPlan: w,
    completedTasks: x,
    workspaceNotes: k,
    workspaceUpdatedAt: A
  };
}
function fP(e) {
  const n = lC(e);
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
    ...Number(n.pomodoroDurationSeconds) > 0 ? { pomodoroDurationSeconds: xr(n.pomodoroDurationSeconds) } : {},
    elapsedSeconds: m > 0 ? Math.min(m, p) : p,
    startedAt: n.startedAt || null,
    currentSession: n.currentSession || null,
    completedTasks: Array.isArray(n.completedTasks) ? n.completedTasks.filter(Boolean) : [],
    flashcardIndex: Math.max(0, Number(n.flashcardIndex) || 0),
    flashcardSide: n.flashcardSide === "back" ? "back" : "front",
    flashcardProgress: n.flashcardProgress && typeof n.flashcardProgress == "object" && !Array.isArray(n.flashcardProgress) ? n.flashcardProgress : {},
    quizAnswers: n.quizAnswers && typeof n.quizAnswers == "object" && !Array.isArray(n.quizAnswers) ? n.quizAnswers : {},
    quizChecked: n.quizChecked && typeof n.quizChecked == "object" && !Array.isArray(n.quizChecked) ? n.quizChecked : {},
    chatMessages: si(n.chatMessages),
    chatPending: !1,
    chatError: "",
    panelTab: $c.has(n.panelTab) ? n.panelTab : "materials",
    workspaceNotes: String(n.workspaceNotes || ""),
    workspaceUpdatedAt: n.workspaceUpdatedAt || n.updatedAt || "",
    activeNoteSection: String(n.activeNoteSection || ""),
    activeSourceHighlight: S0(n.activeSourceHighlight),
    assistantContext: Qc(n.assistantContext),
    audioPlaying: !1
  };
}
function Ks() {
  return {
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {}
  };
}
function pP(e) {
  return Object.values(e.flashcardProgress || {}).filter((n) => n && n.difficulty).length;
}
function hP(e) {
  const n = Object.values(e.quizChecked || {}).filter((i) => i && i.hasKnownAnswer);
  if (!n.length) return null;
  const o = n.filter((i) => i.correct).length;
  return Math.round(o / n.length * 100);
}
function mP(e) {
  const n = Wc(e.selectedMaterial);
  return Object.entries(e.quizChecked || {}).filter(([, o]) => o && o.hasKnownAnswer && !o.correct).map(([o]) => gC(n[Number(o)], Number(o))).filter(Boolean);
}
async function yP(e, n, o, i = {}) {
  var d, p;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: h0(e, o, Q.getState().studyGoal),
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
const Q = sP((e, n) => {
  const o = aP();
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
    audioChannels: { ...Kd },
    pomodoroDuration: Bn,
    pomodoroDurationSeconds: vi(Bn),
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
    timerDurationSeconds: vi(Bn),
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
      const a = Wn(i.selectedScene);
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
      const g = d.selectedMaterialId === m, v = g && c ? null : fP(m), l = g && c ? {} : dP(a, d), f = g && c ? {} : {
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
        timerDurationSeconds: ro({
          pomodoroDuration: l.pomodoroDuration || Bn,
          pomodoroDurationSeconds: l.pomodoroDurationSeconds
        }),
        elapsedSeconds: 0,
        startedAt: null,
        currentSession: null,
        ...Ks(),
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
          const x = n();
          if (x.selectedMaterialId !== m || x.timerState !== "restoring") return;
          const k = wt(), A = zn(x), E = A > 0 ? Math.min(A, Math.max(0, Number(x.elapsedSeconds) || 0)) : Math.max(0, Number(x.elapsedSeconds) || 0), R = {
            ...Qt(w, k),
            timerRestoreTarget: null,
            timerAnchorAtMs: null,
            timerPausedAtMs: w === "paused" ? k : null,
            timerRestoredAtMs: k,
            elapsedSeconds: E,
            audioPlaying: !1
          };
          e(R), On({ ...x, ...R });
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
        sessionHistory: zc()
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
        return Fn(p), d;
      });
    },
    setPomodoroDurationSeconds(i) {
      e((a) => {
        const c = xr(i, a.pomodoroDurationSeconds), d = Math.max(1, Math.round(c / 60)), p = a.selectedMaterial ? Hc(a.selectedMaterial, a.studyGoal, d) : [], m = {
          pomodoroDuration: d,
          pomodoroDurationSeconds: c,
          studyPlan: p,
          timerDurationSeconds: a.timerMode === "countup" ? 0 : c
        };
        return Fn({ ...a, ...m }), m;
      });
    },
    setPomodoroDuration(i) {
      const a = Va(i, n().pomodoroDuration);
      n().setPomodoroDurationSeconds(a * 60);
    },
    setStudyGoal(i) {
      e((a) => {
        const c = String(i ?? ""), d = a.selectedMaterial ? Hc(a.selectedMaterial, c, a.pomodoroDuration) : [], p = { studyGoal: c, studyPlan: d };
        return Fn({ ...a, ...p }), p;
      });
    },
    setSound(i, a) {
      e((c) => {
        var p;
        let d = {};
        if (i === "musicVolume" && (d = { musicVolume: mr(a, c.musicVolume) }), i === "ambientVolume" && (d = { ambientVolume: mr(a, c.ambientVolume) }), i === "musicType" && (d = { musicType: String(a || c.musicType) }), i === "ambientSound" && (d = { ambientSound: String(a || c.ambientSound) }), String(i).startsWith("audioChannel:")) {
          const m = String(i).slice(13);
          d = { audioChannels: { ...c.audioChannels, [m]: mr(a, ((p = c.audioChannels) == null ? void 0 : p[m]) ?? 0) } };
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
      const a = $c.has(String(i || "")) ? String(i) : "materials";
      e({
        panelTab: a,
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    selectSourceHighlight(i = null, { openPanel: a = !0 } = {}) {
      const c = S0(i);
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
        panelTab: $c.has(a) ? a : "materials",
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
        timerDurationSeconds: ro(i),
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
        ...Ks(),
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
        ...p ? Ks() : {}
      };
      e(g), On({ ...i, ...g });
    },
    pauseTimer({ pauseAudio: i = !0 } = {}) {
      const a = n(), c = wt();
      if (Zt(a) !== "running") {
        i && a.audioPlaying && e({ audioPlaying: !1 });
        return;
      }
      const d = jy(a, c), p = {
        ...d,
        ...Qt(d.timerState === "completed" ? "completed" : "paused", c),
        timerAnchorAtMs: null,
        timerPausedAtMs: c,
        audioPlaying: i ? !1 : a.audioPlaying
      };
      e(p), On({ ...a, ...p });
    },
    resetTimer() {
      const i = wt(), a = {
        ...Qt("idle", i),
        timerRestoreTarget: null,
        timerMode: "countdown",
        timerAnchorAtMs: null,
        timerPausedAtMs: null,
        timerRestoredAtMs: null,
        timerDurationSeconds: ro(n()),
        audioPlaying: !1,
        startedAt: null,
        elapsedSeconds: 0,
        summaryRecord: null,
        ...Ks()
      };
      e(a), On({ ...n(), ...a });
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
      e(d), On({ ...i, ...d });
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
      d === i.elapsedSeconds && p === Zt(i) || (e(m), On({ ...i, ...m }));
    },
    setTimerMode(i = "countdown") {
      const a = i === "countup" ? "countup" : "countdown", c = {
        timerMode: a,
        timerDurationSeconds: a === "countup" ? 0 : ro(n())
      };
      e(c), On({ ...n(), ...c });
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
      e(a), On({ ...n(), ...a });
    },
    getTimerState() {
      return Zt(n());
    },
    endSession() {
      var v;
      const i = n(), a = wt(), c = new Date(a).toISOString(), d = Zt(i) === "running" ? jy(i, a) : i, p = zn(d), m = p ? Math.min(p, d.elapsedSeconds) : d.elapsedSeconds, g = uC({
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
      a0("focus-room"), e({
        summaryRecord: g,
        sessionHistory: zc(),
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
      e({ assistantContext: Qc(i) });
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
        const g = String(m.task || ""), v = c == null ? g : String(c || "").trim(), l = a == null ? m.minutes : hr(a, m.minutes, 1, La), f = d.studyPlan.map((x, k) => k === p ? { minutes: l, task: v || g } : x);
        let S = d.completedTasks;
        g && g !== f[p].task && S.includes(g) && (S = S.filter((x) => x !== g).concat(f[p].task));
        const w = { studyPlan: f, completedTasks: S };
        return Fn({ ...d, ...w }), w;
      });
    },
    setFlashcardIndex(i) {
      const a = Ny(n().selectedMaterial);
      e({
        flashcardIndex: hr(i, n().flashcardIndex, 0, Math.max(0, a.length - 1)),
        flashcardSide: "front"
      });
    },
    flipFlashcard() {
      e((i) => ({
        flashcardSide: i.flashcardSide === "back" ? "front" : "back"
      }));
    },
    rateFlashcard(i) {
      const a = n(), c = Ny(a.selectedMaterial);
      if (!c.length) return;
      const d = hr(a.flashcardIndex, 0, 0, c.length - 1), p = c[d], m = ["easy", "medium", "hard"].includes(String(i)) ? String(i) : "medium";
      e({
        flashcardProgress: {
          ...a.flashcardProgress,
          [mC(p, d)]: {
            difficulty: m,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: d < c.length - 1 ? d + 1 : d
      });
    },
    answerQuizQuestion(i, a) {
      const c = Number(i), d = Wc(n().selectedMaterial)[c];
      if (!d) return;
      const p = String(c);
      e((m) => ({
        quizAnswers: {
          ...m.quizAnswers,
          [p]: wC(d, a, m.quizAnswers[p])
        }
      }));
    },
    checkQuizQuestion(i) {
      const a = Wc(n().selectedMaterial), c = Number(i), d = a[c];
      if (!d) return;
      const p = String(c), m = n(), g = Object.prototype.hasOwnProperty.call(m.quizAnswers, p) ? m.quizAnswers[p] : "", v = _C(d, g), l = p0(d);
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
      const c = n(), d = c.selectedMaterial, p = si(c.chatMessages).slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
      }));
      e({
        chatMessages: si([
          ...c.chatMessages,
          { role: "user", text: a, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        ]),
        chatPending: !0,
        chatError: ""
      });
      try {
        const m = await yP(a, p, d, c.assistantContext);
        e((g) => ({
          chatMessages: si([
            ...g.chatMessages,
            { role: "assistant", text: m.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: m.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (m) {
        e((g) => ({
          chatMessages: si([
            ...g.chatMessages,
            { role: "assistant", text: h0(a, d, n().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${m.message || "request failed"}`
        }));
      } finally {
        e({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return pP(n());
    },
    focusQuizScore() {
      return hP(n());
    },
    focusQuizMistakes() {
      return mP(n());
    },
    formatFocusedTime() {
      return Ud(n().elapsedSeconds);
    }
  };
}), Ma = {
  minutes: Math.floor(l0 / 60),
  seconds: 59
}, gP = {
  minutes: 3,
  seconds: 2
};
function Ba(e) {
  const n = xr(e, $d);
  return {
    minutes: Math.floor(n / 60),
    seconds: n % 60
  };
}
function ba(e, n) {
  const o = Math.max(0, Math.floor(Number(e) || 0)), i = Math.max(0, Math.floor(Number(n) || 0));
  return xr(o * 60 + i, $d);
}
function Xc(e, n) {
  return String(Math.max(0, Math.floor(Number(e) || 0))).padStart(2, "0");
}
function Yd(e) {
  const { minutes: n, seconds: o } = Ba(e);
  return `${Xc(n, "minutes")}:${Xc(o, "seconds")}`;
}
function vP(e, n, o = 1) {
  const i = Ba(e), a = Math.trunc(Number(o) || 0);
  if (n === "seconds") {
    const d = Math.min(Ma.seconds, Math.max(0, i.seconds + a));
    return ba(i.minutes, d);
  }
  const c = Math.min(Ma.minutes, Math.max(0, i.minutes + a));
  return ba(c, i.seconds);
}
function SP(e, n, o) {
  const i = gP[o] || 2;
  return `${String(e || "").replace(/\D/g, "")}${String(n).replace(/\D/g, "")}`.slice(-i) || "";
}
function wP(e, n) {
  const o = Number(String(e || "").replace(/\D/g, "")) || 0;
  return Math.min(Ma[n], o);
}
function _P(e, n, o) {
  const i = Ba(e), a = wP(o, n);
  return n === "seconds" ? ba(i.minutes, a) : ba(a, i.seconds);
}
const xP = { minutes: "Minutes", seconds: "Seconds" };
function Ly({
  segment: e,
  value: n,
  disabled: o,
  active: i,
  size: a,
  onFocusSegment: c,
  onStep: d,
  onType: p,
  onCommit: m,
  segmentRef: g
}) {
  const v = xP[e], l = (f) => {
    if (o) return;
    const { key: S } = f;
    if (S >= "0" && S <= "9") {
      f.preventDefault(), p(e, S);
      return;
    }
    if (S === "ArrowUp") {
      f.preventDefault(), d(e, 1);
      return;
    }
    if (S === "ArrowDown") {
      f.preventDefault(), d(e, -1);
      return;
    }
    if (S === "PageUp") {
      f.preventDefault(), d(e, 5);
      return;
    }
    if (S === "PageDown") {
      f.preventDefault(), d(e, -5);
      return;
    }
    (S === "Backspace" || S === "Delete") && (f.preventDefault(), m());
  };
  return /* @__PURE__ */ T.jsxs("span", { className: `timer-editor-segment${i ? " is-active" : ""}`, children: [
    /* @__PURE__ */ T.jsx(
      "button",
      {
        type: "button",
        className: "timer-editor-step timer-editor-step-up",
        tabIndex: -1,
        "aria-label": `Increase ${v.toLowerCase()}`,
        disabled: o,
        onClick: () => d(e, 1),
        children: /* @__PURE__ */ T.jsx(IC, { size: a === "hero" ? 20 : 14, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ T.jsx(
      "span",
      {
        ref: g,
        className: "timer-editor-digits",
        role: "spinbutton",
        tabIndex: o ? -1 : 0,
        "aria-label": v,
        "aria-valuemin": 0,
        "aria-valuemax": Ma[e],
        "aria-valuenow": n,
        "aria-valuetext": `${n} ${v.toLowerCase()}`,
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
        "aria-label": `Decrease ${v.toLowerCase()}`,
        disabled: o,
        onClick: () => d(e, -1),
        children: /* @__PURE__ */ T.jsx(DC, { size: a === "hero" ? 20 : 14, "aria-hidden": "true" })
      }
    )
  ] });
}
function TP({
  valueSeconds: e,
  onChange: n,
  disabled: o = !1,
  size: i = "hero",
  ariaLabel: a = "Set focus block length",
  className: c = ""
}) {
  const { minutes: d, seconds: p } = Ba(e), [m, g] = C.useState(null), v = C.useRef(""), l = C.useRef(null), f = C.useRef(null), S = C.useRef(null), w = (N) => N === "minutes" ? l : f, x = C.useCallback(() => {
    v.current = "";
  }, []), k = C.useCallback((N) => {
    v.current = "", g(N);
  }, []), A = C.useCallback(
    (N, j) => {
      var L;
      o || (v.current = "", g(N), n == null || n(vP(e, N, j)), (L = w(N).current) == null || L.focus());
    },
    [o, n, e]
  ), E = C.useCallback(
    (N, j) => {
      if (o) return;
      const L = SP(v.current, j, N);
      v.current = L, g(N), n == null || n(_P(e, N, L));
    },
    [o, n, e]
  );
  C.useEffect(() => {
    if (o) return;
    const j = [
      [l.current, "minutes"],
      [f.current, "seconds"]
    ].filter(([L]) => L).map(([L, V]) => {
      const G = (K) => {
        K.preventDefault(), A(V, K.deltaY < 0 ? 1 : -1);
      };
      return L.addEventListener("wheel", G, { passive: !1 }), [L, G];
    });
    return () => {
      j.forEach(([L, V]) => L.removeEventListener("wheel", V));
    };
  }, [o, A]);
  const R = (N) => {
    var j;
    (j = S.current) != null && j.contains(N.relatedTarget) || (x(), g(null));
  };
  return /* @__PURE__ */ T.jsxs(
    "div",
    {
      ref: S,
      className: `timer-editor timer-editor-${i}${o ? " is-readonly" : ""} ${c}`.trim(),
      role: "group",
      "aria-label": a,
      onBlur: R,
      children: [
        o ? /* @__PURE__ */ T.jsx("span", { className: "timer-editor-static", "aria-hidden": "true", children: Yd(e) }) : /* @__PURE__ */ T.jsxs(T.Fragment, { children: [
          /* @__PURE__ */ T.jsx(
            Ly,
            {
              segment: "minutes",
              value: d,
              disabled: o,
              active: m === "minutes",
              size: i,
              segmentRef: l,
              onFocusSegment: k,
              onStep: A,
              onType: E,
              onCommit: x
            }
          ),
          /* @__PURE__ */ T.jsx("span", { className: "timer-editor-colon", "aria-hidden": "true", children: ":" }),
          /* @__PURE__ */ T.jsx(
            Ly,
            {
              segment: "seconds",
              value: p,
              disabled: o,
              active: m === "seconds",
              size: i,
              segmentRef: f,
              onFocusSegment: k,
              onStep: A,
              onType: E,
              onCommit: x
            }
          )
        ] }),
        !o && /* @__PURE__ */ T.jsx("span", { className: "sr-only", children: "Editable focus timer. Click minutes or seconds, then type a number or use the arrow keys to adjust." })
      ]
    }
  );
}
function ke({
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
function kP(e) {
  return e === "paused" ? "Resume" : e === "completed" ? "Restart" : "Start";
}
function AP() {
  const e = Q((L) => L.elapsedSeconds), n = Q((L) => L.pomodoroDuration), o = Q((L) => L.pomodoroDurationSeconds), i = Q((L) => L.timerStatus), a = Q((L) => L.isIdle), c = Q((L) => L.studyGoal), d = Q((L) => L.selectedScene), p = Q((L) => L.musicType), m = Q((L) => L.ambientSound), g = Q((L) => L.startTimer), v = Q((L) => L.pauseTimer), l = Q((L) => L.resetTimer), f = Q((L) => L.skipTimer), S = Q((L) => L.setPomodoroDurationSeconds), w = i === "studying", x = i === "idle", k = Number(o) || n * 60, A = Math.max(0, k - e), E = k ? Math.min(100, Math.max(0, e / k * 100)) : 0, R = a ? 0.96 : 1, N = i === "studying" ? { scale: [R, R + 0.012, R] } : { scale: R }, j = Wn(d);
  return /* @__PURE__ */ T.jsxs(
    Sr.article,
    {
      className: "timer-card liquid-glass",
      animate: N,
      transition: i === "studying" ? { duration: 4, repeat: 1 / 0, ease: "easeInOut" } : { duration: 0.2 },
      children: [
        /* @__PURE__ */ T.jsxs("span", { className: "focus-kicker", children: [
          "Focus Block / ",
          i
        ] }),
        /* @__PURE__ */ T.jsxs("div", { className: "timer-card-head", children: [
          /* @__PURE__ */ T.jsxs("div", { children: [
            /* @__PURE__ */ T.jsx("h2", { children: c || "Deep work block" }),
            /* @__PURE__ */ T.jsx("p", { children: j.name })
          ] }),
          /* @__PURE__ */ T.jsxs("div", { className: "timer-pill-row", children: [
            /* @__PURE__ */ T.jsxs("span", { className: "focus-pill", children: [
              p,
              " / ",
              m
            ] }),
            /* @__PURE__ */ T.jsx("span", { className: "focus-pill", children: "Quiet room" })
          ] })
        ] }),
        x ? /* @__PURE__ */ T.jsx(
          TP,
          {
            className: "timer-value-editor",
            valueSeconds: o,
            onChange: S,
            size: "hero",
            ariaLabel: "Set focus block length before starting"
          }
        ) : /* @__PURE__ */ T.jsx("div", { className: "timer-value", "aria-live": "polite", children: Ta(A) }),
        /* @__PURE__ */ T.jsxs("div", { className: "timer-meta-grid", children: [
          /* @__PURE__ */ T.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ T.jsx("span", { children: "Focused" }),
            /* @__PURE__ */ T.jsx("strong", { children: Ud(e) })
          ] }),
          /* @__PURE__ */ T.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ T.jsx("span", { children: "Block" }),
            /* @__PURE__ */ T.jsxs("strong", { children: [
              n,
              "m"
            ] })
          ] }),
          /* @__PURE__ */ T.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ T.jsx("span", { children: "Scene" }),
            /* @__PURE__ */ T.jsx("strong", { children: j.name })
          ] })
        ] }),
        /* @__PURE__ */ T.jsx("div", { className: "focus-progress-track", "aria-label": "Focus progress", children: /* @__PURE__ */ T.jsx("div", { className: "focus-progress-fill", style: { width: `${E.toFixed(1)}%` } }) }),
        /* @__PURE__ */ T.jsxs("div", { className: "timer-actions", children: [
          /* @__PURE__ */ T.jsxs(ke, { variant: i === "studying" ? "primary" : "ghost", onClick: g, children: [
            /* @__PURE__ */ T.jsx(y0, { size: 16, "aria-hidden": "true" }),
            " ",
            kP(i)
          ] }),
          /* @__PURE__ */ T.jsxs(ke, { onClick: () => v(), disabled: !w, "aria-label": w ? "Pause timer" : "Pause timer unavailable", children: [
            /* @__PURE__ */ T.jsx(Kc, { size: 16, "aria-hidden": "true" }),
            " Pause"
          ] }),
          /* @__PURE__ */ T.jsxs(ke, { onClick: l, children: [
            /* @__PURE__ */ T.jsx(g0, { size: 16, "aria-hidden": "true" }),
            " Reset"
          ] }),
          /* @__PURE__ */ T.jsxs(ke, { onClick: f, children: [
            /* @__PURE__ */ T.jsx(v0, { size: 16, "aria-hidden": "true" }),
            " Skip"
          ] })
        ] })
      ]
    }
  );
}
function CP() {
  return /* @__PURE__ */ T.jsx(AP, {});
}
function PP({ onWorkspace: e, onOpenTrail: n, onOpenCompanion: o, onOpenSettings: i, onExit: a }) {
  const c = Q((p) => p.selectedScene), d = Wn(c);
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
      /* @__PURE__ */ T.jsxs(ke, { className: "header-icon-button", onClick: n, title: "Open Focus Trail", "aria-label": "Open Focus Trail", children: [
        /* @__PURE__ */ T.jsx(Ca, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Focus Trail" })
      ] }),
      /* @__PURE__ */ T.jsxs(ke, { className: "header-icon-button", onClick: o, title: "Open Companion Room", "aria-label": "Open Companion Room", children: [
        /* @__PURE__ */ T.jsx(Pa, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Companion" })
      ] }),
      /* @__PURE__ */ T.jsxs(ke, { className: "header-icon-button", onClick: i, title: "Open room settings", "aria-label": "Open room settings", children: [
        /* @__PURE__ */ T.jsx(Yc, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Settings" })
      ] }),
      /* @__PURE__ */ T.jsxs(ke, { className: "header-icon-button header-exit-button", onClick: a, title: "Exit Focus Room", "aria-label": "Exit Focus Room", children: [
        /* @__PURE__ */ T.jsx(LC, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Exit" })
      ] })
    ] })
  ] });
}
function EP(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function MP({ onFocusMode: e, audioState: n }) {
  const o = Q((V) => V.timerStatus), i = Q((V) => V.elapsedSeconds), a = Q((V) => V.pomodoroDuration), c = Q((V) => V.pomodoroDurationSeconds), d = Q((V) => V.timerMode), p = Q((V) => V.studyGoal), m = Q((V) => V.currentSession), g = Q((V) => V.startTimer), v = Q((V) => V.pauseTimer), l = Q((V) => V.resetTimer), f = Q((V) => V.skipTimer), S = Q((V) => V.toggleAudio), w = Q((V) => V.audioPlaying), x = Number(c) || (Number(a) || 0) * 60, k = d === "countup" ? i : Math.max(0, x - i), A = o === "paused", E = o === "studying", R = o === "completed", N = R && d !== "countup" ? "00:00" : Ta(k), j = A ? "Paused" : R ? "Complete" : "In focus", L = A ? "Resume timer" : E ? "Pause timer" : "Start timer";
  return /* @__PURE__ */ T.jsxs("div", { className: "focus-session-dock liquid-glass", "aria-label": "Focus session controls", children: [
    /* @__PURE__ */ T.jsxs("div", { className: "dock-timer-block", children: [
      /* @__PURE__ */ T.jsxs("div", { className: "dock-eyebrow", children: [
        "POMODORO #",
        (m == null ? void 0 : m.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ T.jsxs("div", { className: "dock-status", children: [
        /* @__PURE__ */ T.jsx("span", { className: `dock-status-dot ${A ? "is-paused" : ""}` }),
        j
      ] }),
      /* @__PURE__ */ T.jsx("strong", { className: "dock-time", "aria-live": "off", children: N }),
      /* @__PURE__ */ T.jsx("div", { className: "dock-progress", "aria-hidden": "true", children: /* @__PURE__ */ T.jsx("span", { style: { width: `${EP(i, x)}%` } }) })
    ] }),
    /* @__PURE__ */ T.jsxs("div", { className: "dock-goal-block", children: [
      /* @__PURE__ */ T.jsx("span", { className: "dock-eyebrow", children: "TODAY'S GOAL" }),
      /* @__PURE__ */ T.jsx("strong", { children: p || "A quiet block for meaningful progress" }),
      /* @__PURE__ */ T.jsxs("span", { className: "dock-goal-meta", children: [
        d === "countup" ? "Count-up" : `${Yd(x)} block`,
        " · ",
        Ta(i),
        " focused"
      ] })
    ] }),
    /* @__PURE__ */ T.jsxs("div", { className: "dock-action-block", children: [
      /* @__PURE__ */ T.jsxs(ke, { className: "dock-action-button", onClick: S, "aria-label": w ? "Pause room audio" : "Play room audio", children: [
        w ? /* @__PURE__ */ T.jsx(Kc, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ T.jsx(Gd, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: n != null && n.playing ? "Pause audio" : "Audio" })
      ] }),
      /* @__PURE__ */ T.jsxs(ke, { className: "dock-action-button", onClick: () => E ? v() : g(), variant: "primary", "aria-label": L, children: [
        E ? /* @__PURE__ */ T.jsx(Kc, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ T.jsx(y0, { size: 15, fill: "currentColor", "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: A ? "Resume" : E ? "Pause" : "Start" })
      ] }),
      /* @__PURE__ */ T.jsxs(ke, { className: "dock-action-button", onClick: f, "aria-label": "Skip timer", children: [
        /* @__PURE__ */ T.jsx(v0, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Skip" })
      ] }),
      /* @__PURE__ */ T.jsxs(ke, { className: "dock-action-button", onClick: l, "aria-label": "Reset timer", children: [
        /* @__PURE__ */ T.jsx(g0, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Reset" })
      ] }),
      /* @__PURE__ */ T.jsxs(ke, { className: "dock-focus-mode", onClick: e, "aria-label": "Enter distraction-free Focus Mode", children: [
        /* @__PURE__ */ T.jsx(XC, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ T.jsx("span", { children: "Focus Mode" })
      ] })
    ] })
  ] });
}
var bP = Object.defineProperty, po = (e, n) => bP(e, "name", { value: n, configurable: !0 }), w0 = !!(typeof window < "u" && window.document && window.document.createElement);
function gr(e, n, { checkForDefaultPrevented: o = !0 } = {}) {
  return /* @__PURE__ */ po(function(a) {
    if (e == null || e(a), o === !1 || !a || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  }, "handleEvent");
}
po(gr, "composeEventHandlers");
function RP(e) {
  var n;
  if (!w0)
    throw new Error("Cannot access window outside of the DOM");
  return ((n = e == null ? void 0 : e.ownerDocument) == null ? void 0 : n.defaultView) ?? window;
}
po(RP, "getOwnerWindow");
function Zc(e) {
  if (!w0)
    throw new Error("Cannot access document outside of the DOM");
  return (e == null ? void 0 : e.ownerDocument) ?? document;
}
po(Zc, "getOwnerDocument");
function _0(e, n = !1) {
  const { activeElement: o } = Zc(e);
  if (!(o != null && o.nodeName))
    return null;
  if (x0(o) && o.contentDocument)
    return _0(o.contentDocument.body, n);
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
po(_0, "getActiveElement");
function x0(e) {
  return e.tagName === "IFRAME";
}
po(x0, "isFrame");
function Vy(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function DP(...e) {
  return (n) => {
    let o = !1;
    const i = e.map((a) => {
      const c = Vy(a, n);
      return !o && typeof c == "function" && (o = !0), c;
    });
    if (o)
      return () => {
        for (let a = 0; a < i.length; a++) {
          const c = i[a];
          typeof c == "function" ? c() : Vy(e[a], null);
        }
      };
  };
}
function _t(...e) {
  return C.useCallback(DP(...e), e);
}
function NP(e, n = []) {
  let o = [];
  function i(c, d) {
    const p = C.createContext(d);
    p.displayName = c + "Context";
    const m = o.length;
    o = [...o, d];
    const g = (l) => {
      var A;
      const { scope: f, children: S, ...w } = l, x = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[m]) || p, k = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ T.jsx(x.Provider, { value: k, children: S });
    };
    g.displayName = c + "Provider";
    function v(l, f, S = {}) {
      var A;
      const { optional: w = !1 } = S, x = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[m]) || p, k = C.useContext(x);
      if (k) return k;
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
}, FP = _r[" useId ".trim().toString()] || (() => {
}), OP = 0;
function oc(e) {
  const [n, o] = C.useState(FP());
  return tn(() => {
    o((i) => i ?? String(OP++));
  }, [e]), e || (n ? `radix-${n}` : "");
}
var By = _r[" useEffectEvent ".trim().toString()], zy = _r[" useInsertionEffect ".trim().toString()];
function jP(e) {
  if (typeof By == "function")
    return By(e);
  const n = C.useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  return typeof zy == "function" ? zy(() => {
    n.current = e;
  }) : tn(() => {
    n.current = e;
  }), C.useMemo(() => ((...o) => {
    var i;
    return (i = n.current) == null ? void 0 : i.call(n, ...o);
  }), []);
}
var LP = Object.defineProperty, Pi = (e, n) => LP(e, "name", { value: n, configurable: !0 }), VP = _r[" useInsertionEffect ".trim().toString()] || tn;
function T0({
  prop: e,
  defaultProp: n,
  onChange: o = /* @__PURE__ */ Pi(() => {
  }, "onChange"),
  caller: i
}) {
  const [a, c, d] = k0({
    defaultProp: n,
    onChange: o
  }), p = e !== void 0, m = p ? e : a, g = C.useCallback(
    (v) => {
      var l;
      if (p) {
        const f = A0(v) ? v(e) : v;
        f !== e && ((l = d.current) == null || l.call(d, f));
      } else
        c(v);
    },
    [p, e, c, d]
  );
  return [m, g];
}
Pi(T0, "useControllableState");
function k0({
  defaultProp: e,
  onChange: n
}) {
  const [o, i] = C.useState(e), a = C.useRef(o), c = C.useRef(n);
  return VP(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== o && ((d = c.current) == null || d.call(c, o), a.current = o);
  }, [o, a]), [o, i, c];
}
Pi(k0, "useUncontrolledState");
function A0(e) {
  return typeof e == "function";
}
Pi(A0, "isFunction");
var Uy = Symbol("RADIX:SYNC_STATE");
function BP(e, n, o, i) {
  const { prop: a, defaultProp: c, onChange: d, caller: p } = n, m = a !== void 0, g = jP(d), v = [{ ...o, state: c }];
  i && v.push(i);
  const [l, f] = C.useReducer(
    (k, A) => {
      if (A.type === Uy)
        return { ...k, state: A.state };
      const E = e(k, A);
      return m && !Object.is(E.state, k.state) && g(E.state), E;
    },
    ...v
  ), S = l.state, w = C.useRef(S);
  C.useEffect(() => {
    w.current !== S && (w.current = S, m || g(S));
  }, [S, w, m]);
  const x = C.useMemo(() => a !== void 0 ? { ...l, state: a } : l, [l, a]);
  return C.useEffect(() => {
    m && !Object.is(a, l.state) && f({ type: Uy, state: a });
  }, [a, l.state, m]), [x, f];
}
Pi(BP, "useControllableStateReducer");
var C0 = dg();
// @__NO_SIDE_EFFECTS__
function P0(e) {
  const n = C.forwardRef((o, i) => {
    let { children: a, ...c } = o, d = null, p = !1;
    const m = [];
    $y(a) && typeof Ys == "function" && (a = Ys(a._payload)), C.Children.forEach(a, (f) => {
      var S;
      if (WP(f)) {
        p = !0;
        const w = f;
        let x = "child" in w.props ? w.props.child : w.props.children;
        $y(x) && typeof Ys == "function" && (x = Ys(x._payload)), d = UP(w, x), m.push((S = d == null ? void 0 : d.props) == null ? void 0 : S.children);
      } else
        m.push(f);
    }), d ? d = C.cloneElement(d, void 0, m) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !p && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const g = d ? HP(d) : void 0, v = _t(i, g);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          p ? QP(e) : YP(e)
        );
      return a;
    }
    const l = $P(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = i ? v : g), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var zP = Symbol.for("radix.slottable"), UP = (e, n) => {
  if ("child" in e.props) {
    const o = e.props.child;
    return C.isValidElement(o) ? C.cloneElement(o, void 0, e.props.children(o.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function $P(e, n) {
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
function HP(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
function WP(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === zP;
}
var GP = Symbol.for("react.lazy");
function $y(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === GP && "_payload" in e && KP(e._payload);
}
function KP(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var YP = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, QP = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, Ys = _r[" use ".trim().toString()], XP = [
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
], ho = XP.reduce((e, n) => {
  const o = /* @__PURE__ */ P0(`Primitive.${n}`), i = C.forwardRef((a, c) => {
    const { asChild: d, ...p } = a, m = d ? o : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ T.jsx(m, { ...p, ref: c });
  });
  return i.displayName = `Primitive.${n}`, { ...e, [n]: i };
}, {});
function ZP(e, n) {
  e && C0.flushSync(() => e.dispatchEvent(n));
}
function Si(e) {
  const n = C.useRef(e);
  return C.useEffect(() => {
    n.current = e;
  }), C.useMemo(() => ((...o) => {
    var i;
    return (i = n.current) == null ? void 0 : i.call(n, ...o);
  }), []);
}
var JP = Object.defineProperty, Ke = (e, n) => JP(e, "name", { value: n, configurable: !0 }), Jc = "dismissableLayer.update", qP = "dismissableLayer.pointerDownOutside", eE = "dismissableLayer.focusOutside", Hy, E0 = C.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
}), tE = /* @__PURE__ */ C.forwardRef(
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
    } = n, l = C.useContext(E0), [f, S] = C.useState(null), w = (f == null ? void 0 : f.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, x] = C.useState({}), k = _t(o, S), A = Array.from(l.layers), [E] = [
      ...l.layersWithOutsidePointerEventsDisabled
    ].slice(-1), R = E ? A.indexOf(E) : -1, N = f ? A.indexOf(f) : -1, j = l.layersWithOutsidePointerEventsDisabled.size > 0, L = N >= R, V = C.useRef(!1), G = b0(
      (q) => {
        d == null || d(q), m == null || m(q), q.defaultPrevented || g == null || g();
      },
      {
        ownerDocument: w,
        deferPointerDownOutside: a,
        isDeferredPointerDownOutsideRef: V,
        dismissableSurfaces: l.dismissableSurfaces,
        shouldHandlePointerDownOutside: C.useCallback(
          (q) => {
            if (!(q instanceof Node))
              return !1;
            const de = [...l.branches].some(
              (ue) => ue.contains(q)
            );
            return L && !de;
          },
          [l.branches, L]
        )
      }
    ), K = R0((q) => {
      if (a && V.current)
        return;
      const de = q.target;
      [...l.branches].some((xe) => xe.contains(de)) || (p == null || p(q), m == null || m(q), q.defaultPrevented || g == null || g());
    }, w), X = f ? N === A.length - 1 : !1, ae = Si((q) => {
      q.key === "Escape" && (c == null || c(q), !q.defaultPrevented && g && (q.preventDefault(), g()));
    });
    return C.useEffect(() => {
      if (X)
        return w.addEventListener("keydown", ae, { capture: !0 }), () => w.removeEventListener("keydown", ae, { capture: !0 });
    }, [w, X, ae]), C.useEffect(() => {
      if (f)
        return i && (l.layersWithOutsidePointerEventsDisabled.size === 0 && (Hy = w.body.style.pointerEvents, w.body.style.pointerEvents = "none"), l.layersWithOutsidePointerEventsDisabled.add(f)), l.layers.add(f), qc(), () => {
          i && (l.layersWithOutsidePointerEventsDisabled.delete(f), l.layersWithOutsidePointerEventsDisabled.size === 0 && (w.body.style.pointerEvents = Hy));
        };
    }, [f, w, i, l]), C.useEffect(() => () => {
      f && (l.layers.delete(f), l.layersWithOutsidePointerEventsDisabled.delete(f), qc());
    }, [f, l]), C.useEffect(() => {
      const q = /* @__PURE__ */ Ke(() => x({}), "handleUpdate");
      return document.addEventListener(Jc, q), () => document.removeEventListener(Jc, q);
    }, []), /* @__PURE__ */ T.jsx(
      ho.div,
      {
        ...v,
        ref: k,
        style: {
          pointerEvents: j ? L ? "auto" : "none" : void 0,
          ...n.style
        },
        onFocusCapture: gr(n.onFocusCapture, K.onFocusCapture),
        onBlurCapture: gr(n.onBlurCapture, K.onBlurCapture),
        onPointerDownCapture: gr(
          n.onPointerDownCapture,
          G.onPointerDownCapture
        )
      }
    );
  }, "DismissableLayer")
);
function M0() {
  const e = C.useContext(E0), [n, o] = C.useState(null);
  return C.useEffect(() => {
    if (n)
      return e.dismissableSurfaces.add(n), () => {
        e.dismissableSurfaces.delete(n);
      };
  }, [n, e.dismissableSurfaces]), o;
}
Ke(M0, "useDismissableLayerSurface");
var nE = /* @__PURE__ */ Ke(() => !0, "IS_TRUE");
function b0(e, n) {
  const {
    ownerDocument: o = globalThis == null ? void 0 : globalThis.document,
    deferPointerDownOutside: i = !1,
    isDeferredPointerDownOutsideRef: a,
    dismissableSurfaces: c,
    shouldHandlePointerDownOutside: d = nE
  } = n, p = Si(e), m = C.useRef(!1), g = C.useRef(!1), v = C.useRef(/* @__PURE__ */ new Map()), l = C.useRef(() => {
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
    function w(R) {
      if (!g.current)
        return;
      const N = R.target;
      N instanceof Node && [...c].some((L) => L.contains(N)) || v.current.set(R.type, !0), R.type === "click" && window.setTimeout(() => {
        g.current && l.current();
      }, 0);
    }
    Ke(w, "handleInteractionCapture");
    function x(R) {
      g.current && v.current.set(R.type, !1);
    }
    Ke(x, "handleInteractionBubble");
    const k = /* @__PURE__ */ Ke((R) => {
      if (R.target && !m.current) {
        let N = function() {
          o.removeEventListener("click", l.current);
          const L = S();
          f(), L || Qd(
            qP,
            p,
            j,
            { discrete: !0 }
          );
        };
        if (Ke(N, "handleAndDispatchPointerDownOutsideEvent"), !d(R.target)) {
          o.removeEventListener("click", l.current), f(), m.current = !1;
          return;
        }
        const j = { originalEvent: R };
        g.current = !0, a.current = i && R.button === 0, v.current.clear(), !i || R.button !== 0 ? N() : (o.removeEventListener("click", l.current), l.current = N, o.addEventListener("click", l.current, { once: !0 }));
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
    for (const R of A)
      o.addEventListener(R, w, !0), o.addEventListener(R, x);
    const E = window.setTimeout(() => {
      o.addEventListener("pointerdown", k);
    }, 0);
    return () => {
      window.clearTimeout(E), o.removeEventListener("pointerdown", k), o.removeEventListener("click", l.current);
      for (const R of A)
        o.removeEventListener(R, w, !0), o.removeEventListener(R, x);
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
Ke(b0, "usePointerDownOutside");
function R0(e, n = globalThis == null ? void 0 : globalThis.document) {
  const o = Si(e), i = C.useRef(!1);
  return C.useEffect(() => {
    const a = /* @__PURE__ */ Ke((c) => {
      c.target && !i.current && Qd(eE, o, { originalEvent: c }, {
        discrete: !1
      });
    }, "handleFocus");
    return n.addEventListener("focusin", a), () => n.removeEventListener("focusin", a);
  }, [n, o]), {
    onFocusCapture: /* @__PURE__ */ Ke(() => i.current = !0, "onFocusCapture"),
    onBlurCapture: /* @__PURE__ */ Ke(() => i.current = !1, "onBlurCapture")
  };
}
Ke(R0, "useFocusOutside");
function qc() {
  const e = new CustomEvent(Jc);
  document.dispatchEvent(e);
}
Ke(qc, "dispatchUpdate");
function Qd(e, n, o, { discrete: i }) {
  const a = o.originalEvent.target, c = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: o });
  n && a.addEventListener(e, n, { once: !0 }), i ? ZP(a, c) : a.dispatchEvent(c);
}
Ke(Qd, "handleAndDispatchCustomEvent");
var rE = Object.defineProperty, at = (e, n) => rE(e, "name", { value: n, configurable: !0 }), ic = "focusScope.autoFocusOnMount", sc = "focusScope.autoFocusOnUnmount", Wy = { bubbles: !1, cancelable: !0 }, oE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ at(function(n, o) {
    const {
      loop: i = !1,
      trapped: a = !1,
      onMountAutoFocus: c,
      onUnmountAutoFocus: d,
      ...p
    } = n, [m, g] = C.useState(null), v = Si(c), l = Si(d), f = C.useRef(null), S = _t(o, g), w = C.useRef({
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
        let k = function(N) {
          if (w.paused || !m) return;
          const j = N.target;
          m.contains(j) ? f.current = j : fn(f.current, { select: !0 });
        }, A = function(N) {
          if (w.paused || !m) return;
          const j = N.relatedTarget;
          j !== null && (m.contains(j) || fn(f.current, { select: !0 }));
        }, E = function(N) {
          if (document.activeElement === document.body)
            for (const L of N)
              L.removedNodes.length > 0 && fn(m);
        };
        at(k, "handleFocusIn"), at(A, "handleFocusOut"), at(E, "handleMutations"), document.addEventListener("focusin", k), document.addEventListener("focusout", A);
        const R = new MutationObserver(E);
        return m && R.observe(m, { childList: !0, subtree: !0 }), () => {
          document.removeEventListener("focusin", k), document.removeEventListener("focusout", A), R.disconnect();
        };
      }
    }, [a, m, w.paused]), C.useEffect(() => {
      if (m) {
        Gy.add(w);
        const k = document.activeElement;
        if (!m.contains(k)) {
          const E = new CustomEvent(ic, Wy);
          m.addEventListener(ic, v), m.dispatchEvent(E), E.defaultPrevented || (D0(j0(Xd(m)), { select: !0 }), document.activeElement === k && fn(m));
        }
        return () => {
          m.removeEventListener(ic, v), setTimeout(() => {
            const E = new CustomEvent(sc, Wy);
            m.addEventListener(sc, l), m.dispatchEvent(E), E.defaultPrevented || fn(k ?? document.body, { select: !0 }), m.removeEventListener(sc, l), Gy.remove(w);
          }, 0);
        };
      }
    }, [m, v, l, w]);
    const x = C.useCallback(
      (k) => {
        if (!i && !a || w.paused) return;
        const A = k.key === "Tab" && !k.altKey && !k.ctrlKey && !k.metaKey, E = document.activeElement;
        if (A && E) {
          const R = k.currentTarget, [N, j] = N0(R);
          N && j ? !k.shiftKey && E === j ? (k.preventDefault(), i && fn(N, { select: !0 })) : k.shiftKey && E === N && (k.preventDefault(), i && fn(j, { select: !0 })) : E === R && k.preventDefault();
        }
      },
      [i, a, w.paused]
    );
    return /* @__PURE__ */ T.jsx(ho.div, { tabIndex: -1, ...p, ref: S, onKeyDown: x });
  }, "FocusScope")
);
function D0(e, { select: n = !1 } = {}) {
  const o = document.activeElement;
  for (const i of e)
    if (fn(i, { select: n }), document.activeElement !== o) return;
}
at(D0, "focusFirst");
function N0(e) {
  const n = Xd(e), o = ed(n, e), i = ed(n.reverse(), e);
  return [o, i];
}
at(N0, "getTabbableEdges");
function Xd(e) {
  const n = [], o = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: /* @__PURE__ */ at((i) => {
      const a = i.tagName === "INPUT" && i.type === "hidden";
      return i.disabled || i.hidden || a ? NodeFilter.FILTER_SKIP : i.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }, "acceptNode")
  });
  for (; o.nextNode(); ) n.push(o.currentNode);
  return n;
}
at(Xd, "getTabbableCandidates");
function ed(e, n) {
  const o = typeof n.checkVisibility == "function" && n.checkVisibility({ checkVisibilityCSS: !0 });
  for (const i of e)
    if (!(o ? !i.checkVisibility({ checkVisibilityCSS: !0 }) : I0(i, { upTo: n })))
      return i;
}
at(ed, "findVisible");
function I0(e, { upTo: n }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (n !== void 0 && e === n) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
at(I0, "isHidden");
function F0(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
at(F0, "isSelectableInput");
function fn(e, { select: n = !1 } = {}) {
  if (e && e.focus) {
    const o = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== o && F0(e) && n && e.select();
  }
}
at(fn, "focus");
var Gy = O0();
function O0() {
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
at(O0, "createFocusScopesStack");
function td(e, n) {
  const o = [...e], i = o.indexOf(n);
  return i !== -1 && o.splice(i, 1), o;
}
at(td, "arrayRemove");
function j0(e) {
  return e.filter((n) => n.tagName !== "A");
}
at(j0, "removeLinks");
var iE = Object.defineProperty, sE = (e, n) => iE(e, "name", { value: n, configurable: !0 }), aE = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ sE(function(n, o) {
    var m;
    const { container: i, ...a } = n, [c, d] = C.useState(!1);
    tn(() => d(!0), []);
    const p = i || c && ((m = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : m.body);
    return p ? C0.createPortal(/* @__PURE__ */ T.jsx(ho.div, { ...a, ref: o }), p) : null;
  }, "Portal")
), lE = Object.defineProperty, hn = (e, n) => lE(e, "name", { value: n, configurable: !0 });
function L0(e, n) {
  return C.useReducer((o, i) => n[o][i] ?? o, e);
}
hn(L0, "useStateMachine");
var Zd = /* @__PURE__ */ hn((e) => {
  const { present: n, children: o } = e, i = V0(n), a = typeof o == "function" ? o({ present: i.isPresent }) : C.Children.only(o), c = B0(i.ref, z0(a));
  return typeof o == "function" || i.isPresent ? C.cloneElement(a, { ref: c }) : null;
}, "Presence");
function V0(e) {
  const [n, o] = C.useState(), i = C.useRef(null), a = C.useRef(e), c = C.useRef("none"), d = C.useRef(void 0), p = e ? "mounted" : "unmounted", [m, g] = L0(p, {
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
    m === "mounted" ? (c.current = d.current ?? qr(i.current), d.current = void 0) : c.current = "none";
  }, [m]), tn(() => {
    const v = i.current, l = a.current;
    if (l !== e) {
      const S = c.current, w = qr(v);
      e ? (d.current = w, g("MOUNT")) : w === "none" || (v == null ? void 0 : v.display) === "none" ? g("UNMOUNT") : g(l && S !== w ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
    }
  }, [e, g]), tn(() => {
    if (n) {
      let v;
      const l = n.ownerDocument.defaultView ?? window, f = /* @__PURE__ */ hn((w) => {
        const k = qr(i.current).includes(CSS.escape(w.animationName));
        if (w.target === n && k && (g("ANIMATION_END"), !a.current)) {
          const A = n.style.animationFillMode;
          n.style.animationFillMode = "forwards", v = l.setTimeout(() => {
            n.style.animationFillMode === "forwards" && (n.style.animationFillMode = A);
          });
        }
      }, "handleAnimationEnd"), S = /* @__PURE__ */ hn((w) => {
        w.target === n && (c.current = qr(i.current));
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
        i.current = l, d.current = qr(l);
      } else
        i.current = null;
      o(v);
    }, [])
  };
}
hn(V0, "usePresence");
function nd(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
hn(nd, "setRef");
function B0(...e) {
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
hn(B0, "useStableComposedRefs");
function qr(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
hn(qr, "getAnimationName");
function z0(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
hn(z0, "getElementRef");
var Qs = 0, Kt = null;
function uE() {
  C.useEffect(() => {
    Kt || (Kt = { start: Ky(), end: Ky() });
    const { start: e, end: n } = Kt;
    return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== n && document.body.insertAdjacentElement("beforeend", n), Qs++, () => {
      Qs === 1 && (Kt == null || Kt.start.remove(), Kt == null || Kt.end.remove(), Kt = null), Qs = Math.max(0, Qs - 1);
    };
  }, []);
}
function Ky() {
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
function U0(e, n) {
  var o = {};
  for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && n.indexOf(i) < 0 && (o[i] = e[i]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var a = 0, i = Object.getOwnPropertySymbols(e); a < i.length; a++)
      n.indexOf(i[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, i[a]) && (o[i[a]] = e[i[a]]);
  return o;
}
function cE(e, n, o) {
  if (o || arguments.length === 2) for (var i = 0, a = n.length, c; i < a; i++)
    (c || !(i in n)) && (c || (c = Array.prototype.slice.call(n, 0, i)), c[i] = n[i]);
  return e.concat(c || Array.prototype.slice.call(n));
}
var ua = "right-scroll-bar-position", ca = "width-before-scroll-bar", dE = "with-scroll-bars-hidden", fE = "--removed-body-scroll-bar-size";
function ac(e, n) {
  return typeof e == "function" ? e(n) : e && (e.current = n), e;
}
function pE(e, n) {
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
var hE = typeof window < "u" ? C.useLayoutEffect : C.useEffect, Yy = /* @__PURE__ */ new WeakMap();
function mE(e, n) {
  var o = pE(null, function(i) {
    return e.forEach(function(a) {
      return ac(a, i);
    });
  });
  return hE(function() {
    var i = Yy.get(o);
    if (i) {
      var a = new Set(i), c = new Set(e), d = o.current;
      a.forEach(function(p) {
        c.has(p) || ac(p, null);
      }), c.forEach(function(p) {
        a.has(p) || ac(p, d);
      });
    }
    Yy.set(o, e);
  }, [e]), o;
}
function yE(e) {
  return e;
}
function gE(e, n) {
  n === void 0 && (n = yE);
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
function vE(e) {
  e === void 0 && (e = {});
  var n = gE(null);
  return n.options = Jt({ async: !0, ssr: !1 }, e), n;
}
var $0 = function(e) {
  var n = e.sideCar, o = U0(e, ["sideCar"]);
  if (!n)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var i = n.read();
  if (!i)
    throw new Error("Sidecar medium not found");
  return C.createElement(i, Jt({}, o));
};
$0.isSideCarExport = !0;
function SE(e, n) {
  return e.useMedium(n), $0;
}
var H0 = vE(), lc = function() {
}, za = C.forwardRef(function(e, n) {
  var o = C.useRef(null), i = C.useState({
    onScrollCapture: lc,
    onWheelCapture: lc,
    onTouchMoveCapture: lc
  }), a = i[0], c = i[1], d = e.forwardProps, p = e.children, m = e.className, g = e.removeScrollBar, v = e.enabled, l = e.shards, f = e.sideCar, S = e.noRelative, w = e.noIsolation, x = e.inert, k = e.allowPinchZoom, A = e.as, E = A === void 0 ? "div" : A, R = e.gapMode, N = U0(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), j = f, L = mE([o, n]), V = Jt(Jt({}, N), a);
  return C.createElement(
    C.Fragment,
    null,
    v && C.createElement(j, { sideCar: H0, removeScrollBar: g, shards: l, noRelative: S, noIsolation: w, inert: x, setCallbacks: c, allowPinchZoom: !!k, lockRef: o, gapMode: R }),
    d ? C.cloneElement(C.Children.only(p), Jt(Jt({}, V), { ref: L })) : C.createElement(E, Jt({}, V, { className: m, ref: L }), p)
  );
});
za.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
za.classNames = {
  fullWidth: ca,
  zeroRight: ua
};
var wE = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function _E() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var n = wE();
  return n && e.setAttribute("nonce", n), e;
}
function xE(e, n) {
  e.styleSheet ? e.styleSheet.cssText = n : e.appendChild(document.createTextNode(n));
}
function TE(e) {
  var n = document.head || document.getElementsByTagName("head")[0];
  n.appendChild(e);
}
var kE = function() {
  var e = 0, n = null;
  return {
    add: function(o) {
      e == 0 && (n = _E()) && (xE(n, o), TE(n)), e++;
    },
    remove: function() {
      e--, !e && n && (n.parentNode && n.parentNode.removeChild(n), n = null);
    }
  };
}, AE = function() {
  var e = kE();
  return function(n, o) {
    C.useEffect(function() {
      return e.add(n), function() {
        e.remove();
      };
    }, [n && o]);
  };
}, W0 = function() {
  var e = AE(), n = function(o) {
    var i = o.styles, a = o.dynamic;
    return e(i, a), null;
  };
  return n;
}, CE = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, uc = function(e) {
  return parseInt(e || "", 10) || 0;
}, PE = function(e) {
  var n = window.getComputedStyle(document.body), o = n[e === "padding" ? "paddingLeft" : "marginLeft"], i = n[e === "padding" ? "paddingTop" : "marginTop"], a = n[e === "padding" ? "paddingRight" : "marginRight"];
  return [uc(o), uc(i), uc(a)];
}, EE = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return CE;
  var n = PE(e), o = document.documentElement.clientWidth, i = window.innerWidth;
  return {
    left: n[0],
    top: n[1],
    right: n[2],
    gap: Math.max(0, i - o + n[2] - n[0])
  };
}, ME = W0(), io = "data-scroll-locked", bE = function(e, n, o, i) {
  var a = e.left, c = e.top, d = e.right, p = e.gap;
  return o === void 0 && (o = "margin"), `
  .`.concat(dE, ` {
   overflow: hidden `).concat(i, `;
   padding-right: `).concat(p, "px ").concat(i, `;
  }
  body[`).concat(io, `] {
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
  
  .`).concat(ua, ` {
    right: `).concat(p, "px ").concat(i, `;
  }
  
  .`).concat(ca, ` {
    margin-right: `).concat(p, "px ").concat(i, `;
  }
  
  .`).concat(ua, " .").concat(ua, ` {
    right: 0 `).concat(i, `;
  }
  
  .`).concat(ca, " .").concat(ca, ` {
    margin-right: 0 `).concat(i, `;
  }
  
  body[`).concat(io, `] {
    `).concat(fE, ": ").concat(p, `px;
  }
`);
}, Qy = function() {
  var e = parseInt(document.body.getAttribute(io) || "0", 10);
  return isFinite(e) ? e : 0;
}, RE = function() {
  C.useEffect(function() {
    return document.body.setAttribute(io, (Qy() + 1).toString()), function() {
      var e = Qy() - 1;
      e <= 0 ? document.body.removeAttribute(io) : document.body.setAttribute(io, e.toString());
    };
  }, []);
}, DE = function(e) {
  var n = e.noRelative, o = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
  RE();
  var c = C.useMemo(function() {
    return EE(a);
  }, [a]);
  return C.createElement(ME, { styles: bE(c, !n, a, o ? "" : "!important") });
}, rd = !1;
if (typeof window < "u")
  try {
    var Xs = Object.defineProperty({}, "passive", {
      get: function() {
        return rd = !0, !0;
      }
    });
    window.addEventListener("test", Xs, Xs), window.removeEventListener("test", Xs, Xs);
  } catch {
    rd = !1;
  }
var Qr = rd ? { passive: !1 } : !1, NE = function(e) {
  return e.tagName === "TEXTAREA";
}, G0 = function(e, n) {
  if (!(e instanceof Element))
    return !1;
  var o = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    o[n] !== "hidden" && // contains scroll inside self
    !(o.overflowY === o.overflowX && !NE(e) && o[n] === "visible")
  );
}, IE = function(e) {
  return G0(e, "overflowY");
}, FE = function(e) {
  return G0(e, "overflowX");
}, Xy = function(e, n) {
  var o = n.ownerDocument, i = n;
  do {
    typeof ShadowRoot < "u" && i instanceof ShadowRoot && (i = i.host);
    var a = K0(e, i);
    if (a) {
      var c = Y0(e, i), d = c[1], p = c[2];
      if (d > p)
        return !0;
    }
    i = i.parentNode;
  } while (i && i !== o.body);
  return !1;
}, OE = function(e) {
  var n = e.scrollTop, o = e.scrollHeight, i = e.clientHeight;
  return [
    n,
    o,
    i
  ];
}, jE = function(e) {
  var n = e.scrollLeft, o = e.scrollWidth, i = e.clientWidth;
  return [
    n,
    o,
    i
  ];
}, K0 = function(e, n) {
  return e === "v" ? IE(n) : FE(n);
}, Y0 = function(e, n) {
  return e === "v" ? OE(n) : jE(n);
}, LE = function(e, n) {
  return e === "h" && n === "rtl" ? -1 : 1;
}, VE = function(e, n, o, i, a) {
  var c = LE(e, window.getComputedStyle(n).direction), d = c * i, p = o.target, m = n.contains(p), g = !1, v = d > 0, l = 0, f = 0;
  do {
    if (!p)
      break;
    var S = Y0(e, p), w = S[0], x = S[1], k = S[2], A = x - k - c * w;
    (w || A) && K0(e, p) && (l += A, f += w);
    var E = p.parentNode;
    p = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !m && p !== document.body || // self content
    m && (n.contains(p) || n === p)
  );
  return (v && Math.abs(l) < 1 || !v && Math.abs(f) < 1) && (g = !0), g;
}, Zs = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Zy = function(e) {
  return [e.deltaX, e.deltaY];
}, Jy = function(e) {
  return e && "current" in e ? e.current : e;
}, BE = function(e, n) {
  return e[0] === n[0] && e[1] === n[1];
}, zE = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, UE = 0, Xr = [];
function $E(e) {
  var n = C.useRef([]), o = C.useRef([0, 0]), i = C.useRef(), a = C.useState(UE++)[0], c = C.useState(W0)[0], d = C.useRef(e);
  C.useEffect(function() {
    d.current = e;
  }, [e]), C.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(a));
      var x = cE([e.lockRef.current], (e.shards || []).map(Jy), !0).filter(Boolean);
      return x.forEach(function(k) {
        return k.classList.add("allow-interactivity-".concat(a));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(a)), x.forEach(function(k) {
          return k.classList.remove("allow-interactivity-".concat(a));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var p = C.useCallback(function(x, k) {
    if ("touches" in x && x.touches.length === 2 || x.type === "wheel" && x.ctrlKey)
      return !d.current.allowPinchZoom;
    var A = Zs(x), E = o.current, R = "deltaX" in x ? x.deltaX : E[0] - A[0], N = "deltaY" in x ? x.deltaY : E[1] - A[1], j, L = x.target, V = Math.abs(R) > Math.abs(N) ? "h" : "v";
    if ("touches" in x && V === "h" && L.type === "range")
      return !1;
    var G = window.getSelection(), K = G && G.anchorNode, X = K ? K === L || K.contains(L) : !1;
    if (X)
      return !1;
    var ae = Xy(V, L);
    if (!ae)
      return !0;
    if (ae ? j = V : (j = V === "v" ? "h" : "v", ae = Xy(V, L)), !ae)
      return !1;
    if (!i.current && "changedTouches" in x && (R || N) && (i.current = j), !j)
      return !0;
    var q = i.current || j;
    return VE(q, k, x, q === "h" ? R : N);
  }, []), m = C.useCallback(function(x) {
    var k = x;
    if (!(!Xr.length || Xr[Xr.length - 1] !== c)) {
      var A = "deltaY" in k ? Zy(k) : Zs(k), E = n.current.filter(function(j) {
        return j.name === k.type && (j.target === k.target || k.target === j.shadowParent) && BE(j.delta, A);
      })[0];
      if (E && E.should) {
        k.cancelable && k.preventDefault();
        return;
      }
      if (!E) {
        var R = (d.current.shards || []).map(Jy).filter(Boolean).filter(function(j) {
          return j.contains(k.target);
        }), N = R.length > 0 ? p(k, R[0]) : !d.current.noIsolation;
        N && k.cancelable && k.preventDefault();
      }
    }
  }, []), g = C.useCallback(function(x, k, A, E) {
    var R = { name: x, delta: k, target: A, should: E, shadowParent: HE(A) };
    n.current.push(R), setTimeout(function() {
      n.current = n.current.filter(function(N) {
        return N !== R;
      });
    }, 1);
  }, []), v = C.useCallback(function(x) {
    o.current = Zs(x), i.current = void 0;
  }, []), l = C.useCallback(function(x) {
    g(x.type, Zy(x), x.target, p(x, e.lockRef.current));
  }, []), f = C.useCallback(function(x) {
    g(x.type, Zs(x), x.target, p(x, e.lockRef.current));
  }, []);
  C.useEffect(function() {
    return Xr.push(c), e.setCallbacks({
      onScrollCapture: l,
      onWheelCapture: l,
      onTouchMoveCapture: f
    }), document.addEventListener("wheel", m, Qr), document.addEventListener("touchmove", m, Qr), document.addEventListener("touchstart", v, Qr), function() {
      Xr = Xr.filter(function(x) {
        return x !== c;
      }), document.removeEventListener("wheel", m, Qr), document.removeEventListener("touchmove", m, Qr), document.removeEventListener("touchstart", v, Qr);
    };
  }, []);
  var S = e.removeScrollBar, w = e.inert;
  return C.createElement(
    C.Fragment,
    null,
    w ? C.createElement(c, { styles: zE(a) }) : null,
    S ? C.createElement(DE, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function HE(e) {
  for (var n = null; e !== null; )
    e instanceof ShadowRoot && (n = e.host, e = e.host), e = e.parentNode;
  return n;
}
const WE = SE(H0, $E);
var Q0 = C.forwardRef(function(e, n) {
  return C.createElement(za, Jt({}, e, { ref: n, sideCar: WE }));
});
Q0.classNames = za.classNames;
var GE = function(e) {
  if (typeof document > "u")
    return null;
  var n = Array.isArray(e) ? e[0] : e;
  return n.ownerDocument.body;
}, Zr = /* @__PURE__ */ new WeakMap(), Js = /* @__PURE__ */ new WeakMap(), qs = {}, cc = 0, X0 = function(e) {
  return e && (e.host || X0(e.parentNode));
}, KE = function(e, n) {
  return n.map(function(o) {
    if (e.contains(o))
      return o;
    var i = X0(o);
    return i && e.contains(i) ? i : (console.error("aria-hidden", o, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(o) {
    return !!o;
  });
}, YE = function(e, n, o, i) {
  var a = KE(n, Array.isArray(e) ? e : [e]);
  qs[o] || (qs[o] = /* @__PURE__ */ new WeakMap());
  var c = qs[o], d = [], p = /* @__PURE__ */ new Set(), m = new Set(a), g = function(l) {
    !l || p.has(l) || (p.add(l), g(l.parentNode));
  };
  a.forEach(g);
  var v = function(l) {
    !l || m.has(l) || Array.prototype.forEach.call(l.children, function(f) {
      if (p.has(f))
        v(f);
      else
        try {
          var S = f.getAttribute(i), w = S !== null && S !== "false", x = (Zr.get(f) || 0) + 1, k = (c.get(f) || 0) + 1;
          Zr.set(f, x), c.set(f, k), d.push(f), x === 1 && w && Js.set(f, !0), k === 1 && f.setAttribute(o, "true"), w || f.setAttribute(i, "true");
        } catch (A) {
          console.error("aria-hidden: cannot operate on ", f, A);
        }
    });
  };
  return v(n), p.clear(), cc++, function() {
    d.forEach(function(l) {
      var f = Zr.get(l) - 1, S = c.get(l) - 1;
      Zr.set(l, f), c.set(l, S), f || (Js.has(l) || l.removeAttribute(i), Js.delete(l)), S || l.removeAttribute(o);
    }), cc--, cc || (Zr = /* @__PURE__ */ new WeakMap(), Zr = /* @__PURE__ */ new WeakMap(), Js = /* @__PURE__ */ new WeakMap(), qs = {});
  };
}, QE = function(e, n, o) {
  o === void 0 && (o = "data-aria-hidden");
  var i = Array.from(Array.isArray(e) ? e : [e]), a = GE(e);
  return a ? (i.push.apply(i, Array.from(a.querySelectorAll("[aria-live], script"))), YE(i, a, o, "aria-hidden")) : function() {
    return null;
  };
}, XE = Object.defineProperty, zt = (e, n) => XE(e, "name", { value: n, configurable: !0 }), Jd = "Dialog", [Z0] = NP(Jd), [ZE, mn] = Z0(Jd), JE = /* @__PURE__ */ zt((e) => {
  const {
    __scopeDialog: n,
    children: o,
    open: i,
    defaultOpen: a,
    onOpenChange: c,
    modal: d = !0
  } = e, p = C.useRef(null), m = C.useRef(null), [g, v] = T0({
    prop: i,
    defaultProp: a ?? !1,
    onChange: c,
    caller: Jd
  }), [l, f] = C.useState(0), [S, w] = C.useState(0);
  return /* @__PURE__ */ T.jsx(
    ZE,
    {
      scope: n,
      triggerRef: p,
      contentRef: m,
      contentId: oc(),
      titleId: oc(),
      descriptionId: oc(),
      titlePresent: l > 0,
      descriptionPresent: S > 0,
      setTitleCount: f,
      setDescriptionCount: w,
      open: g,
      onOpenChange: v,
      onOpenToggle: C.useCallback(() => v((x) => !x), [v]),
      modal: d,
      children: o
    }
  );
}, "Dialog"), J0 = "DialogPortal", [qE, q0] = Z0(J0, {
  forceMount: void 0
}), eM = /* @__PURE__ */ zt((e) => {
  const { __scopeDialog: n, forceMount: o, children: i, container: a } = e, c = mn(J0, n);
  return /* @__PURE__ */ T.jsx(qE, { scope: n, forceMount: o, children: C.Children.map(i, (d) => /* @__PURE__ */ T.jsx(Zd, { present: o || c.open, children: /* @__PURE__ */ T.jsx(aE, { asChild: !0, container: a, children: d }) })) });
}, "DialogPortal"), od = "DialogOverlay", tM = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const i = q0(od, n.__scopeDialog), { forceMount: a = i.forceMount, ...c } = n, d = mn(od, n.__scopeDialog);
    return d.modal ? /* @__PURE__ */ T.jsx(Zd, { present: a || d.open, children: /* @__PURE__ */ T.jsx(rM, { ...c, ref: o }) }) : null;
  }, "DialogOverlay")
), nM = /* @__PURE__ */ P0("DialogOverlay.RemoveScroll"), rM = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = mn(od, i), d = M0(), p = _t(o, d);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ T.jsx(Q0, { as: nM, allowPinchZoom: !0, shards: [c.contentRef], children: /* @__PURE__ */ T.jsx(
        ho.div,
        {
          "data-state": qd(c.open),
          ...a,
          ref: p,
          style: { pointerEvents: "auto", ...a.style }
        }
      ) })
    );
  }, "DialogOverlayImpl")
), wi = "DialogContent", oM = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const i = q0(wi, n.__scopeDialog), { forceMount: a = i.forceMount, ...c } = n, d = mn(wi, n.__scopeDialog);
    return /* @__PURE__ */ T.jsx(Zd, { present: a || d.open, children: d.modal ? /* @__PURE__ */ T.jsx(iM, { ...c, ref: o }) : /* @__PURE__ */ T.jsx(sM, { ...c, ref: o }) });
  }, "DialogContent")
), iM = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const i = mn(wi, n.__scopeDialog), a = C.useRef(null), c = _t(o, i.contentRef, a);
    return C.useEffect(() => {
      const d = a.current;
      if (d) return QE(d);
    }, []), /* @__PURE__ */ T.jsx(
      eS,
      {
        ...n,
        ref: c,
        trapFocus: i.open,
        disableOutsidePointerEvents: i.open,
        onCloseAutoFocus: gr(n.onCloseAutoFocus, (d) => {
          var p;
          d.preventDefault(), (p = i.triggerRef.current) == null || p.focus();
        }),
        onPointerDownOutside: gr(n.onPointerDownOutside, (d) => {
          const p = d.detail.originalEvent, m = p.button === 0 && p.ctrlKey === !0;
          (p.button === 2 || m) && d.preventDefault();
        }),
        onFocusOutside: gr(
          n.onFocusOutside,
          (d) => d.preventDefault()
        )
      }
    );
  }, "DialogContentModal")
), sM = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const i = mn(wi, n.__scopeDialog), a = C.useRef(!1), c = C.useRef(!1);
    return /* @__PURE__ */ T.jsx(
      eS,
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
), eS = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, trapFocus: a, onOpenAutoFocus: c, onCloseAutoFocus: d, ...p } = n, m = mn(wi, i);
    return uE(), /* @__PURE__ */ T.jsx(T.Fragment, { children: /* @__PURE__ */ T.jsx(
      oE,
      {
        asChild: !0,
        loop: !0,
        trapped: a,
        onMountAutoFocus: c,
        onUnmountAutoFocus: d,
        children: /* @__PURE__ */ T.jsx(
          tE,
          {
            role: "dialog",
            id: m.contentId,
            "aria-describedby": m.descriptionPresent ? m.descriptionId : void 0,
            "aria-labelledby": m.titlePresent ? m.titleId : void 0,
            "data-state": qd(m.open),
            ...p,
            ref: o,
            deferPointerDownOutside: !0,
            onDismiss: () => m.onOpenChange(!1)
          }
        )
      }
    ) });
  }, "DialogContentImpl")
), aM = "DialogTitle", lM = /* @__PURE__ */ C.forwardRef(
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = mn(aM, i), { setTitleCount: d } = c;
    return tn(() => (d((p) => p + 1), () => d((p) => p - 1)), [d]), /* @__PURE__ */ T.jsx(ho.h2, { id: c.titleId, ...a, ref: o });
  }, "DialogTitle")
), uM = "DialogDescription", cM = /* @__PURE__ */ C.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ zt(function(n, o) {
    const { __scopeDialog: i, ...a } = n, c = mn(uM, i), { setDescriptionCount: d } = c;
    return tn(() => (d((p) => p + 1), () => d((p) => p - 1)), [d]), /* @__PURE__ */ T.jsx(ho.p, { id: c.descriptionId, ...a, ref: o });
  }, "DialogDescription")
);
function qd(e) {
  return e ? "open" : "closed";
}
zt(qd, "getState");
function dM() {
  const e = Q((a) => a.summaryRecord), n = Q((a) => a.closeSummary), o = Q((a) => a.startTimer), i = Wn(e == null ? void 0 : e.selectedScene);
  return /* @__PURE__ */ T.jsx(JE, { open: !!e, onOpenChange: (a) => !a && n(), children: /* @__PURE__ */ T.jsx(Fa, { children: e ? /* @__PURE__ */ T.jsxs(eM, { forceMount: !0, children: [
    /* @__PURE__ */ T.jsx(tM, { asChild: !0, children: /* @__PURE__ */ T.jsx(
      Sr.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ T.jsx(oM, { asChild: !0, children: /* @__PURE__ */ T.jsxs(
      Sr.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ T.jsx(lM, { children: "Focus block complete" }),
          /* @__PURE__ */ T.jsx(cM, { className: "sr-only", children: "Summary of the completed focus block." }),
          /* @__PURE__ */ T.jsx("p", { children: "You protected a focused block in your quiet study room." }),
          /* @__PURE__ */ T.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ T.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ T.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ T.jsx("strong", { children: Ud(e.totalFocusTime) })
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
            /* @__PURE__ */ T.jsx(ke, { variant: "primary", onClick: () => {
              n(), o();
            }, children: "Continue studying" }),
            /* @__PURE__ */ T.jsx(ke, { onClick: n, children: "Done" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function fM({ scene: e, active: n, onSelect: o }) {
  return /* @__PURE__ */ T.jsxs(
    Sr.button,
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
function pM() {
  const e = Q((o) => o.selectedScene), n = Q((o) => o.selectScene);
  return /* @__PURE__ */ T.jsx("div", { className: "scene-selector", "aria-label": "Study scenes", children: wr.map((o) => /* @__PURE__ */ T.jsx(fM, { scene: o, active: o.id === e, onSelect: n }, o.id)) });
}
function tS(e, [n, o]) {
  return Math.min(o, Math.max(n, e));
}
function oo(e, n, { checkForDefaultPrevented: o = !0 } = {}) {
  return function(a) {
    if (e == null || e(a), o === !1 || !a.defaultPrevented)
      return n == null ? void 0 : n(a);
  };
}
function nS(e, n = []) {
  let o = [];
  function i(c, d) {
    const p = C.createContext(d);
    p.displayName = c + "Context";
    const m = o.length;
    o = [...o, d];
    const g = (l) => {
      var A;
      const { scope: f, children: S, ...w } = l, x = ((A = f == null ? void 0 : f[e]) == null ? void 0 : A[m]) || p, k = C.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ T.jsx(x.Provider, { value: k, children: S });
    };
    g.displayName = c + "Provider";
    function v(l, f) {
      var x;
      const S = ((x = f == null ? void 0 : f[e]) == null ? void 0 : x[m]) || p, w = C.useContext(S);
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
  return a.scopeName = e, [i, hM(a, ...n)];
}
function hM(...e) {
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
var mM = _r[" useInsertionEffect ".trim().toString()] || tn;
function yM({
  prop: e,
  defaultProp: n,
  onChange: o = () => {
  },
  caller: i
}) {
  const [a, c, d] = gM({
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
        const f = vM(v) ? v(e) : v;
        f !== e && ((l = d.current) == null || l.call(d, f));
      } else
        c(v);
    },
    [p, e, c, d]
  );
  return [m, g];
}
function gM({
  defaultProp: e,
  onChange: n
}) {
  const [o, i] = C.useState(e), a = C.useRef(o), c = C.useRef(n);
  return mM(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== o && ((d = c.current) == null || d.call(c, o), a.current = o);
  }, [o, a]), [o, i, c];
}
function vM(e) {
  return typeof e == "function";
}
var SM = C.createContext(void 0);
function wM(e) {
  const n = C.useContext(SM);
  return e || n || "ltr";
}
function _M(e) {
  const n = C.useRef({ value: e, previous: e });
  return C.useMemo(() => (n.current.value !== e && (n.current.previous = n.current.value, n.current.value = e), n.current.previous), [e]);
}
function xM(e) {
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
function id(e) {
  const n = C.forwardRef((o, i) => {
    let { children: a, ...c } = o, d = null, p = !1;
    const m = [];
    qy(a) && typeof ea == "function" && (a = ea(a._payload)), C.Children.forEach(a, (f) => {
      var S;
      if (PM(f)) {
        p = !0;
        const w = f;
        let x = "child" in w.props ? w.props.child : w.props.children;
        qy(x) && typeof ea == "function" && (x = ea(x._payload)), d = kM(w, x), m.push((S = d == null ? void 0 : d.props) == null ? void 0 : S.children);
      } else
        m.push(f);
    }), d ? d = C.cloneElement(d, void 0, m) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !p && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const g = d ? CM(d) : void 0, v = _t(i, g);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          p ? RM(e) : bM(e)
        );
      return a;
    }
    const l = AM(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = i ? v : g), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var TM = Symbol.for("radix.slottable"), kM = (e, n) => {
  if ("child" in e.props) {
    const o = e.props.child;
    return C.isValidElement(o) ? C.cloneElement(o, void 0, e.props.children(o.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function AM(e, n) {
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
function CM(e) {
  var i, a;
  let n = (i = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : i.get, o = n && "isReactWarning" in n && n.isReactWarning;
  return o ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, o = n && "isReactWarning" in n && n.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
function PM(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === TM;
}
var EM = Symbol.for("react.lazy");
function qy(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === EM && "_payload" in e && MM(e._payload);
}
function MM(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var bM = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, RM = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, ea = _r[" use ".trim().toString()], DM = [
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
], Ei = DM.reduce((e, n) => {
  const o = /* @__PURE__ */ id(`Primitive.${n}`), i = C.forwardRef((a, c) => {
    const { asChild: d, ...p } = a, m = d ? o : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ T.jsx(m, { ...p, ref: c });
  });
  return i.displayName = `Primitive.${n}`, { ...e, [n]: i };
}, {});
function NM(e) {
  const n = e + "CollectionProvider", [o, i] = nS(n), [a, c] = o(
    n,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), d = (x) => {
    const { scope: k, children: A } = x, E = C.useRef(null), R = C.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ T.jsx(a, { scope: k, itemMap: R, collectionRef: E, children: A });
  };
  d.displayName = n;
  const p = e + "CollectionSlot", m = /* @__PURE__ */ id(p), g = C.forwardRef(
    (x, k) => {
      const { scope: A, children: E } = x, R = c(p, A), N = _t(k, R.collectionRef);
      return /* @__PURE__ */ T.jsx(m, { ref: N, children: E });
    }
  );
  g.displayName = p;
  const v = e + "CollectionItemSlot", l = "data-radix-collection-item", f = /* @__PURE__ */ id(v), S = C.forwardRef(
    (x, k) => {
      const { scope: A, children: E, ...R } = x, N = C.useRef(null), j = _t(k, N), L = c(v, A);
      return C.useEffect(() => (L.itemMap.set(N, { ref: N, ...R }), () => void L.itemMap.delete(N))), /* @__PURE__ */ T.jsx(f, { [l]: "", ref: j, children: E });
    }
  );
  S.displayName = v;
  function w(x) {
    const k = c(e + "CollectionConsumer", x);
    return C.useCallback(() => {
      const E = k.collectionRef.current;
      if (!E) return [];
      const R = Array.from(E.querySelectorAll(`[${l}]`));
      return Array.from(k.itemMap.values()).sort(
        (L, V) => R.indexOf(L.ref.current) - R.indexOf(V.ref.current)
      );
    }, [k.collectionRef, k.itemMap]);
  }
  return [
    { Provider: d, Slot: g, ItemSlot: S },
    w,
    i
  ];
}
var rS = ["PageUp", "PageDown"], oS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], iS = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, mo = "Slider", [sd, IM, FM] = NM(mo), [ef] = nS(mo, [
  FM
]), [OM, Mi] = ef(mo), sS = C.forwardRef(
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
      ...x
    } = e, k = C.useRef(/* @__PURE__ */ new Set()), A = C.useRef(0), E = C.useRef(!1), N = d === "horizontal" ? jM : LM, [j = [], L] = yM({
      prop: v,
      defaultProp: g,
      onChange: (q) => {
        var ue;
        (ue = [...k.current][A.current]) == null || ue.focus({
          preventScroll: !0,
          focusVisible: E.current
        }), E.current = !1, l(q);
      }
    }), V = C.useRef(j);
    function G(q) {
      const de = UM(j, q);
      ae(q, de);
    }
    function K(q) {
      ae(q, A.current);
    }
    function X() {
      const q = V.current[A.current];
      j[A.current] !== q && f(j);
    }
    function ae(q, de, { commit: ue } = { commit: !1 }) {
      const xe = GM(c), ve = KM(Math.round((q - i) / c) * c + i, xe), Se = tS(ve, [i, a]);
      L(($ = []) => {
        const Z = BM($, Se, de);
        if (WM(Z, m * c)) {
          A.current = Z.indexOf(Se);
          const Y = String(Z) !== String($);
          return Y && ue && f(Z), Y ? Z : $;
        } else
          return $;
      });
    }
    return /* @__PURE__ */ T.jsx(
      OM,
      {
        scope: e.__scopeSlider,
        name: o,
        disabled: p,
        min: i,
        max: a,
        valueIndexToChangeRef: A,
        thumbs: k.current,
        values: j,
        orientation: d,
        form: w,
        children: /* @__PURE__ */ T.jsx(sd.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ T.jsx(sd.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ T.jsx(
          N,
          {
            "aria-disabled": p,
            "data-disabled": p ? "" : void 0,
            ...x,
            ref: n,
            onPointerDown: oo(x.onPointerDown, () => {
              p || (V.current = j, E.current = !1);
            }),
            min: i,
            max: a,
            inverted: S,
            onSlideStart: p ? void 0 : G,
            onSlideMove: p ? void 0 : K,
            onSlideEnd: p ? void 0 : X,
            onHomeKeyDown: () => {
              p || (E.current = !0, ae(i, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              p || (E.current = !0, ae(a, j.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: q, direction: de }) => {
              if (!p) {
                E.current = !0;
                const ve = rS.includes(q.key) || q.shiftKey && oS.includes(q.key) ? 10 : 1, Se = A.current, $ = j[Se], Z = c * ve * de;
                ae($ + Z, Se, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
sS.displayName = mo;
var [aS, lS] = ef(mo, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), jM = C.forwardRef(
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
    } = e, [l, f] = C.useState(null), S = _t(n, (R) => f(R)), w = C.useRef(void 0), x = wM(a), k = x === "ltr", A = k && !c || !k && c;
    function E(R) {
      const N = w.current || l.getBoundingClientRect(), j = [0, N.width], V = tf(j, A ? [o, i] : [i, o]);
      return w.current = N, V(R - N.left);
    }
    return /* @__PURE__ */ T.jsx(
      aS,
      {
        scope: e.__scopeSlider,
        startEdge: A ? "left" : "right",
        endEdge: A ? "right" : "left",
        direction: A ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ T.jsx(
          uS,
          {
            dir: x,
            "data-orientation": "horizontal",
            ...v,
            ref: S,
            style: {
              ...v.style,
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
              w.current = void 0, m == null || m();
            },
            onStepKeyDown: (R) => {
              const j = iS[A ? "from-left" : "from-right"].includes(R.key);
              g == null || g({ event: R, direction: j ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), LM = C.forwardRef(
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
    } = e, v = C.useRef(null), l = _t(n, v), f = C.useRef(void 0), S = !a;
    function w(x) {
      const k = f.current || v.current.getBoundingClientRect(), A = [0, k.height], R = tf(A, S ? [i, o] : [o, i]);
      return f.current = k, R(x - k.top);
    }
    return /* @__PURE__ */ T.jsx(
      aS,
      {
        scope: e.__scopeSlider,
        startEdge: S ? "bottom" : "top",
        endEdge: S ? "top" : "bottom",
        size: "height",
        direction: S ? 1 : -1,
        children: /* @__PURE__ */ T.jsx(
          uS,
          {
            "data-orientation": "vertical",
            ...g,
            ref: l,
            style: {
              ...g.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (x) => {
              const k = w(x.clientY);
              c == null || c(k);
            },
            onSlideMove: (x) => {
              const k = w(x.clientY);
              d == null || d(k);
            },
            onSlideEnd: () => {
              f.current = void 0, p == null || p();
            },
            onStepKeyDown: (x) => {
              const A = iS[S ? "from-bottom" : "from-top"].includes(x.key);
              m == null || m({ event: x, direction: A ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), uS = C.forwardRef(
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
    } = e, v = Mi(mo, o);
    return /* @__PURE__ */ T.jsx(
      Ei.span,
      {
        ...g,
        ref: n,
        onKeyDown: oo(e.onKeyDown, (l) => {
          l.key === "Home" ? (d(l), l.preventDefault()) : l.key === "End" ? (p(l), l.preventDefault()) : rS.concat(oS).includes(l.key) && (m(l), l.preventDefault());
        }),
        onPointerDown: oo(e.onPointerDown, (l) => {
          const f = l.target;
          f.setPointerCapture(l.pointerId), l.preventDefault(), v.thumbs.has(f) ? f.focus({ preventScroll: !0, focusVisible: !1 }) : i(l);
        }),
        onPointerMove: oo(e.onPointerMove, (l) => {
          l.target.hasPointerCapture(l.pointerId) && a(l);
        }),
        onPointerUp: oo(e.onPointerUp, (l) => {
          const f = l.target;
          f.hasPointerCapture(l.pointerId) && (f.releasePointerCapture(l.pointerId), c(l));
        })
      }
    );
  }
), cS = "SliderTrack", dS = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Mi(cS, o);
    return /* @__PURE__ */ T.jsx(
      Ei.span,
      {
        "data-disabled": a.disabled ? "" : void 0,
        "data-orientation": a.orientation,
        ...i,
        ref: n
      }
    );
  }
);
dS.displayName = cS;
var ad = "SliderRange", fS = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Mi(ad, o), c = lS(ad, o), d = C.useRef(null), p = _t(n, d), m = a.values.length, g = a.values.map(
      (f) => _S(f, a.min, a.max)
    ), v = m > 1 ? Math.min(...g) : 0, l = 100 - Math.max(...g);
    return /* @__PURE__ */ T.jsx(
      Ei.span,
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
fS.displayName = ad;
var pS = "SliderThumb", [VM, hS] = ef(pS), mS = "SliderThumbProvider";
function yS(e) {
  const {
    __scopeSlider: n,
    name: o,
    children: i,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: a
  } = e, c = Mi(mS, n), d = IM(n), [p, m] = C.useState(null), g = C.useMemo(
    () => p ? d().findIndex((k) => k.ref.current === p) : -1,
    [d, p]
  ), v = xM(p), l = p ? !!c.form || !!p.closest("form") : !0, f = c.values[g], S = o ?? (c.name ? c.name + (c.values.length > 1 ? "[]" : "") : void 0), w = f === void 0 ? 0 : _S(f, c.min, c.max);
  C.useEffect(() => {
    if (p)
      return c.thumbs.add(p), () => {
        c.thumbs.delete(p);
      };
  }, [p, c.thumbs]);
  const x = {
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
  return /* @__PURE__ */ T.jsx(VM, { scope: n, ...x, children: YM(a) ? a(x) : i });
}
yS.displayName = mS;
var da = "SliderThumbTrigger", gS = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, ...i } = e, a = Mi(da, o), c = lS(da, o), { index: d, value: p, percent: m, size: g, onThumbChange: v } = hS(
      da,
      o
    ), l = _t(n, (x) => v(x)), f = zM(d, a.values.length), S = g == null ? void 0 : g[c.size], w = S ? $M(S, m, c.direction) : 0;
    return /* @__PURE__ */ T.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [c.startEdge]: `calc(${m}% + ${w}px)`
        },
        children: /* @__PURE__ */ T.jsx(sd.ItemSlot, { scope: o, children: /* @__PURE__ */ T.jsx(
          Ei.span,
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
            onFocus: oo(e.onFocus, () => {
              a.valueIndexToChangeRef.current = d;
            })
          }
        ) })
      }
    );
  }
);
gS.displayName = da;
var vS = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: o, name: i, ...a } = e;
    return /* @__PURE__ */ T.jsx(
      yS,
      {
        __scopeSlider: o,
        name: i,
        internal_do_not_use_render: ({ index: c, isFormControl: d }) => /* @__PURE__ */ T.jsxs(T.Fragment, { children: [
          /* @__PURE__ */ T.jsx(
            gS,
            {
              ...a,
              ref: n,
              __scopeSlider: o
            }
          ),
          d ? /* @__PURE__ */ T.jsx(
            wS,
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
vS.displayName = pS;
var SS = "SliderBubbleInput", wS = C.forwardRef(
  ({ __scopeSlider: e, ...n }, o) => {
    const { value: i, name: a, form: c } = hS(SS, e), d = C.useRef(null), p = _t(d, o), m = _M(i);
    return C.useEffect(() => {
      const g = d.current;
      if (!g) return;
      const v = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(v, "value").set;
      if (m !== i && f) {
        const S = new Event("input", { bubbles: !0 });
        f.call(g, i), g.dispatchEvent(S);
      }
    }, [m, i]), /* @__PURE__ */ T.jsx(
      Ei.input,
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
wS.displayName = SS;
function BM(e = [], n, o) {
  const i = [...e];
  return i[o] = n, i.sort((a, c) => a - c);
}
function _S(e, n, o) {
  const c = 100 / (o - n) * (e - n);
  return tS(c, [0, 100]);
}
function zM(e, n) {
  return n > 2 ? `Value ${e + 1} of ${n}` : n === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function UM(e, n) {
  if (e.length === 1) return 0;
  const o = e.map((a) => Math.abs(a - n)), i = Math.min(...o);
  return o.indexOf(i);
}
function $M(e, n, o) {
  const i = e / 2, c = tf([0, 50], [0, i]);
  return (i - c(n) * o) * o;
}
function HM(e) {
  return e.slice(0, -1).map((n, o) => e[o + 1] - n);
}
function WM(e, n) {
  if (n > 0) {
    const o = HM(e);
    return Math.min(...o) >= n;
  }
  return !0;
}
function tf(e, n) {
  return (o) => {
    if (e[0] === e[1] || n[0] === n[1]) return n[0];
    const i = (n[1] - n[0]) / (e[1] - e[0]);
    return n[0] + i * (o - e[0]);
  };
}
function GM(e) {
  if (!Number.isFinite(e)) return 0;
  const n = e.toString();
  if (n.includes("e")) {
    const [i, a] = n.split("e"), c = i.split(".")[1] || "", d = Number(a);
    return Math.max(0, c.length - d);
  }
  const o = n.split(".")[1];
  return o ? o.length : 0;
}
function KM(e, n) {
  const o = Math.pow(10, n);
  return Math.round(e * o) / o;
}
function YM(e) {
  return typeof e == "function";
}
function eg({ label: e, icon: n, value: o, onChange: i }) {
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
      sS,
      {
        className: "radix-slider-root",
        value: [o],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (a) => i(a[0]),
        children: [
          /* @__PURE__ */ T.jsx(dS, { className: "radix-slider-track", children: /* @__PURE__ */ T.jsx(fS, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ T.jsx(vS, { className: "radix-slider-thumb", "aria-label": e })
        ]
      }
    )
  ] });
}
function QM({ audioState: e }) {
  const n = Q((v) => v.musicType), o = Q((v) => v.ambientSound), i = Q((v) => v.musicVolume), a = Q((v) => v.ambientVolume), c = Q((v) => v.audioPlaying), d = Q((v) => v.setSound), p = Q((v) => v.toggleAudio), m = ja({ musicType: n, ambientSound: o }), g = m.ambientLayers.map((v) => v.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ T.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ T.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ T.jsx("select", { value: n, onChange: (v) => d("musicType", v.target.value), children: yi.map((v) => /* @__PURE__ */ T.jsx("option", { value: v.label, children: v.label }, v.label)) })
    ] }),
    /* @__PURE__ */ T.jsx(
      eg,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ T.jsx(Gd, { size: 16, "aria-hidden": "true" }),
        value: i,
        onChange: (v) => d("musicVolume", v)
      }
    ),
    /* @__PURE__ */ T.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ T.jsx("select", { value: o, onChange: (v) => d("ambientSound", v.target.value), children: gi.map((v) => /* @__PURE__ */ T.jsx("option", { value: v.label, children: v.label }, v.label)) })
    ] }),
    /* @__PURE__ */ T.jsx(
      eg,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ T.jsx(eP, { size: 16, "aria-hidden": "true" }),
        value: a,
        onChange: (v) => d("ambientVolume", v)
      }
    ),
    /* @__PURE__ */ T.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ T.jsxs("div", { children: [
        /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ T.jsx("strong", { children: m.musicTrack.title }),
        /* @__PURE__ */ T.jsx("p", { children: g }),
        e != null && e.error ? /* @__PURE__ */ T.jsx("p", { className: "audio-error", children: e.error }) : null
      ] }),
      /* @__PURE__ */ T.jsx(ke, { variant: c ? "primary" : "ghost", onClick: p, children: c ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ T.jsx("div", { className: "audio-links", children: [m.musicTrack, ...m.ambientLayers].filter((v) => v == null ? void 0 : v.pageUrl).map((v) => /* @__PURE__ */ T.jsx("a", { href: v.pageUrl, target: "_blank", rel: "noreferrer", children: v.title || v.label || "Audio source" }, v.pageUrl)) })
  ] });
}
const XM = [
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
function oi({ title: e, kicker: n, icon: o, children: i, onClose: a, className: c = "" }) {
  return /* @__PURE__ */ T.jsxs(Sr.aside, { className: `focus-utility-panel liquid-glass ${c}`.trim(), initial: { opacity: 0, y: 12, x: -18 }, animate: { opacity: 1, y: 0, x: 0 }, exit: { opacity: 0, y: 10, x: -18 }, transition: u0, role: "dialog", "aria-label": e, children: [
    /* @__PURE__ */ T.jsxs("div", { className: "drawer-head", children: [
      /* @__PURE__ */ T.jsxs("div", { className: "utility-title", children: [
        /* @__PURE__ */ T.jsx("span", { className: "utility-title-icon", children: o }),
        /* @__PURE__ */ T.jsxs("div", { children: [
          /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: n }),
          /* @__PURE__ */ T.jsx("h2", { children: e })
        ] })
      ] }),
      /* @__PURE__ */ T.jsx(ke, { "aria-label": `Close ${e}`, onClick: a, children: /* @__PURE__ */ T.jsx(nP, { size: 16, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ T.jsx("div", { className: "utility-panel-body", children: i })
  ] });
}
function tg({ audioState: e, scene: n }) {
  const o = Q((g) => g.audioChannels), i = Q((g) => g.setSound), [a, c] = C.useState(!1), d = (g, v) => {
    c(!1), i(`audioChannel:${g}`, v);
  }, p = () => {
    const g = yi[Math.floor(Math.random() * yi.length)], v = gi[Math.floor(Math.random() * gi.length)];
    i("musicType", g.label), i("ambientSound", v.label), c(!0);
  }, m = () => {
    i("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), i("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), c(!0);
  };
  return /* @__PURE__ */ T.jsxs("div", { className: "sound-mixer", children: [
    /* @__PURE__ */ T.jsxs("div", { className: "mixer-featured-row", children: [
      /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Music library" }),
      /* @__PURE__ */ T.jsxs(ke, { onClick: p, children: [
        /* @__PURE__ */ T.jsx(OC, { size: 14, "aria-hidden": "true" }),
        " Random track"
      ] })
    ] }),
    /* @__PURE__ */ T.jsx(QM, { audioState: e, compact: !0 }),
    /* @__PURE__ */ T.jsxs("div", { className: "mixer-preset-row", children: [
      /* @__PURE__ */ T.jsxs("button", { type: "button", className: "mixer-preset-button", onClick: m, children: [
        "Apply scene mix ",
        /* @__PURE__ */ T.jsx("span", { children: "↗" })
      ] }),
      /* @__PURE__ */ T.jsxs(ke, { onClick: () => c(!0), children: [
        a ? /* @__PURE__ */ T.jsx(bC, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ T.jsx(GC, { size: 14, "aria-hidden": "true" }),
        " ",
        a ? "Saved" : "Save current mix"
      ] })
    ] }),
    /* @__PURE__ */ T.jsx("div", { className: "mixer-channel-grid", children: XM.map(([g, v]) => /* @__PURE__ */ T.jsxs("label", { className: "mixer-channel", children: [
      /* @__PURE__ */ T.jsxs("span", { children: [
        /* @__PURE__ */ T.jsx("i", { className: `mixer-channel-dot mixer-${g}` }),
        v
      ] }),
      /* @__PURE__ */ T.jsxs("strong", { children: [
        o[g],
        "%"
      ] }),
      /* @__PURE__ */ T.jsx("input", { type: "range", min: "0", max: "100", value: o[g], "aria-label": `${v} volume`, onChange: (l) => d(g, l.target.value) })
    ] }, g)) }),
    e != null && e.error ? /* @__PURE__ */ T.jsx("p", { className: "audio-error", children: e.error }) : null
  ] });
}
function ZM() {
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
function JM({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ T.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ T.jsx(Ca, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ T.jsx("h3", { children: "Your Focus Trail" }),
    /* @__PURE__ */ T.jsx("p", { children: "Recent sessions and progress remain available through Synapse history." }),
    /* @__PURE__ */ T.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e("", "history"), children: "Open session history" })
  ] }) : /* @__PURE__ */ T.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ T.jsx(Ca, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Your rhythm, remembered" }),
    /* @__PURE__ */ T.jsx("h3", { children: "Sign in to view your Focus Trail" }),
    /* @__PURE__ */ T.jsx("p", { children: "Track deep-work time, completed goals, and your study streak across devices." }),
    /* @__PURE__ */ T.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Sign in with Synapse" }),
    /* @__PURE__ */ T.jsx("small", { children: "Your current session continues without an account." })
  ] });
}
function qM({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ T.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ T.jsx(Pa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ T.jsx("h3", { children: "Companion Room" }),
    /* @__PURE__ */ T.jsx("p", { children: "Invite a study partner from your Synapse workspace to share this quiet room." }),
    /* @__PURE__ */ T.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e("", "companion"), children: "Open Companion Room" })
  ] }) : /* @__PURE__ */ T.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ T.jsx(Pa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Study alongside someone" }),
    /* @__PURE__ */ T.jsx("h3", { children: "Sign in to use Companion Room" }),
    /* @__PURE__ */ T.jsx("p", { children: "Keep your own goal private while sharing the feeling of showing up together." }),
    /* @__PURE__ */ T.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Go to sign in" }),
    /* @__PURE__ */ T.jsx("small", { children: "No companion data is created in Focus Room." })
  ] });
}
function eb({ audioState: e, utilityPanel: n, onClose: o, onWorkspace: i }) {
  const a = Q((v) => v.activeDrawer), c = Q((v) => v.closeDrawer), d = Q((v) => v.selectedScene), p = Q((v) => v.openDrawer), m = ZM(), g = C.useMemo(() => wr.find((v) => v.id === d) || wr[0], [d]);
  return /* @__PURE__ */ T.jsxs(Fa, { children: [
    n === "trail" ? /* @__PURE__ */ T.jsx(oi, { title: "Focus Trail", kicker: "Your progress", icon: /* @__PURE__ */ T.jsx(Ca, { size: 16 }), onClose: o, children: /* @__PURE__ */ T.jsx(JM, { onWorkspace: i, session: m }) }) : null,
    n === "companion" ? /* @__PURE__ */ T.jsx(oi, { title: "Companion Room", kicker: "Shared focus", icon: /* @__PURE__ */ T.jsx(Pa, { size: 16 }), onClose: o, children: /* @__PURE__ */ T.jsx(qM, { onWorkspace: i, session: m }) }) : null,
    n === "settings" ? /* @__PURE__ */ T.jsxs(oi, { title: "Room settings", kicker: "Customize your atmosphere", icon: /* @__PURE__ */ T.jsx(Yc, { size: 16 }), onClose: o, className: "room-settings-utility", children: [
      /* @__PURE__ */ T.jsxs("div", { className: "settings-scene-summary", children: [
        /* @__PURE__ */ T.jsx("span", { className: "settings-scene-image", style: { backgroundImage: `url(${(g == null ? void 0 : g.image) || ""})` } }),
        /* @__PURE__ */ T.jsxs("div", { children: [
          /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Current scene" }),
          /* @__PURE__ */ T.jsx("strong", { children: g == null ? void 0 : g.name }),
          /* @__PURE__ */ T.jsx("small", { children: g == null ? void 0 : g.description })
        ] })
      ] }),
      /* @__PURE__ */ T.jsx(ke, { onClick: () => {
        o == null || o(), p("scene");
      }, children: "Change scene" }),
      /* @__PURE__ */ T.jsx("h3", { className: "utility-section-title", children: "Sound mixer" }),
      /* @__PURE__ */ T.jsx(tg, { audioState: e, scene: g })
    ] }) : null,
    !n && a === "scene" ? /* @__PURE__ */ T.jsx(oi, { title: "Choose scene", kicker: "Scene", icon: /* @__PURE__ */ T.jsx(Yc, { size: 16 }), onClose: c, children: /* @__PURE__ */ T.jsx(pM, {}) }) : null,
    !n && a === "music" ? /* @__PURE__ */ T.jsx(oi, { title: "Sound atmosphere", kicker: "Room audio", icon: /* @__PURE__ */ T.jsx(Gd, { size: 16 }), onClose: c, children: /* @__PURE__ */ T.jsx(tg, { audioState: e, scene: g }) }) : null
  ] });
}
function tb(e, n) {
  return n ? Math.min(100, Math.max(0, e / n * 100)) : 0;
}
function nb({ onExit: e }) {
  const n = Q((g) => g.elapsedSeconds), o = Q((g) => g.pomodoroDuration), i = Q((g) => g.pomodoroDurationSeconds), a = Q((g) => g.timerMode), c = Q((g) => g.timerStatus), d = Q((g) => g.currentSession), p = Number(i) || (Number(o) || 0) * 60, m = a === "countup" ? n : Math.max(0, p - n);
  return /* @__PURE__ */ T.jsxs("div", { className: "compact-focus-mode-card", "aria-label": "Distraction-free focus timer", children: [
    /* @__PURE__ */ T.jsxs("div", { className: "compact-focus-card-top", children: [
      /* @__PURE__ */ T.jsxs("span", { children: [
        "POMODORO #",
        (d == null ? void 0 : d.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ T.jsx(ke, { className: "compact-exit-button", onClick: e, "aria-label": "Exit Focus Mode", children: /* @__PURE__ */ T.jsx(zC, { size: 14, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ T.jsxs("span", { className: "compact-focus-status", children: [
      /* @__PURE__ */ T.jsx("i", {}),
      c === "paused" ? "Paused" : "In focus"
    ] }),
    /* @__PURE__ */ T.jsx("strong", { children: Ta(m) }),
    /* @__PURE__ */ T.jsx("div", { className: "compact-focus-progress", children: /* @__PURE__ */ T.jsx("span", { style: { width: `${tb(n, p)}%` } }) }),
    /* @__PURE__ */ T.jsxs("small", { children: [
      Yd(p),
      " session"
    ] }),
    /* @__PURE__ */ T.jsx("span", { className: "sr-only", children: "Press Escape to exit Focus Mode." })
  ] });
}
var dc = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var ng;
function rb() {
  return ng || (ng = 1, (function(e) {
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
                for (var w = f._howls[S]._getSoundIds(), x = 0; x < w.length; x++) {
                  var k = f._howls[S]._soundById(w[x]);
                  k && k._node && (k._node.volume = k._volume * l);
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
              for (var w = f._howls[S]._getSoundIds(), x = 0; x < w.length; x++) {
                var k = f._howls[S]._soundById(w[x]);
                k && k._node && (k._node.muted = l ? !0 : k._muted);
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
          var S = f.canPlayType("audio/mpeg;").replace(/^no$/, ""), w = l._navigator ? l._navigator.userAgent : "", x = w.match(/OPR\/(\d+)/g), k = x && parseInt(x[0].split("/")[1], 10) < 33, A = w.indexOf("Safari") !== -1 && w.indexOf("Chrome") === -1, E = w.match(/Version\/(.*?) /), R = A && E && parseInt(E[1], 10) < 15;
          return l._codecs = {
            mp3: !!(!k && (S || f.canPlayType("audio/mp3;").replace(/^no$/, ""))),
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
            var f = function(S) {
              for (; l._html5AudioPool.length < l.html5PoolSize; )
                try {
                  var w = new Audio();
                  w._unlocked = !0, l._releaseHtml5Audio(w);
                } catch {
                  l.noAudio = !0;
                  break;
                }
              for (var x = 0; x < l._howls.length; x++)
                if (!l._howls[x]._webAudio)
                  for (var k = l._howls[x]._getSoundIds(), A = 0; A < k.length; A++) {
                    var E = l._howls[x]._soundById(k[A]);
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
            var w, x;
            if (l._format && l._format[S])
              w = l._format[S];
            else {
              if (x = l._src[S], typeof x != "string") {
                l._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              w = /^data:audio\/([^;,]+);/i.exec(x), w || (w = /\.([^.]+)$/.exec(x.split("?", 1)[0])), w && (w = w[1].toLowerCase());
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
              for (var x = 0, k = 0; k < S._sounds.length; k++)
                S._sounds[k]._paused && !S._sounds[k]._ended && (x++, w = S._sounds[k]._id);
              x === 1 ? l = null : w = null;
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
          var R = Math.max(0, A._seek > 0 ? A._seek : S._sprite[l][0] / 1e3), N = Math.max(0, (S._sprite[l][0] + S._sprite[l][1]) / 1e3 - R), j = N * 1e3 / Math.abs(A._rate), L = S._sprite[l][0] / 1e3, V = (S._sprite[l][0] + S._sprite[l][1]) / 1e3;
          A._sprite = l, A._ended = !1;
          var G = function() {
            A._paused = !1, A._seek = R, A._start = L, A._stop = V, A._loop = !!(A._loop || S._sprite[l][2]);
          };
          if (R >= V) {
            S._ended(A);
            return;
          }
          var K = A._node;
          if (S._webAudio) {
            var X = function() {
              S._playLock = !1, G(), S._refreshBuffer(A);
              var ue = A._muted || S._muted ? 0 : A._volume;
              K.gain.setValueAtTime(ue, o.ctx.currentTime), A._playStart = o.ctx.currentTime, typeof K.bufferSource.start > "u" ? A._loop ? K.bufferSource.noteGrainOn(0, R, 86400) : K.bufferSource.noteGrainOn(0, R, N) : A._loop ? K.bufferSource.start(0, R, 86400) : K.bufferSource.start(0, R, N), j !== 1 / 0 && (S._endTimers[A._id] = setTimeout(S._ended.bind(S, A), j)), f || setTimeout(function() {
                S._emit("play", A._id), S._loadQueue();
              }, 0);
            };
            o.state === "running" && o.ctx.state !== "interrupted" ? X() : (S._playLock = !0, S.once("resume", X), S._clearTimer(A._id));
          } else {
            var ae = function() {
              K.currentTime = R, K.muted = A._muted || S._muted || o._muted || K.muted, K.volume = A._volume * o.volume(), K.playbackRate = A._rate;
              try {
                var ue = K.play();
                if (ue && typeof Promise < "u" && (ue instanceof Promise || typeof ue.then == "function") ? (S._playLock = !0, G(), ue.then(function() {
                  S._playLock = !1, K._unlocked = !0, f ? S._loadQueue() : S._emit("play", A._id);
                }).catch(function() {
                  S._playLock = !1, S._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), A._ended = !0, A._paused = !0;
                })) : f || (S._playLock = !1, G(), S._emit("play", A._id)), K.playbackRate = A._rate, K.paused) {
                  S._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                l !== "__default" || A._loop ? S._endTimers[A._id] = setTimeout(S._ended.bind(S, A), j) : (S._endTimers[A._id] = function() {
                  S._ended(A), K.removeEventListener("ended", S._endTimers[A._id], !1);
                }, K.addEventListener("ended", S._endTimers[A._id], !1));
              } catch (xe) {
                S._emit("playerror", A._id, xe);
              }
            };
            K.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (K.src = S._src, K.load());
            var q = window && window.ejecta || !K.readyState && o._navigator.isCocoonJS;
            if (K.readyState >= 3 || q)
              ae();
            else {
              S._playLock = !0, S._state = "loading";
              var de = function() {
                S._state = "loaded", ae(), K.removeEventListener(o._canPlayEvent, de, !1);
              };
              K.addEventListener(o._canPlayEvent, de, !1), S._clearTimer(A._id);
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
            var x = f._soundById(S[w]);
            if (x && !x._paused && (x._seek = f.seek(S[w]), x._rateSeek = 0, x._paused = !0, f._stopFade(S[w]), x._node))
              if (f._webAudio) {
                if (!x._node.bufferSource)
                  continue;
                typeof x._node.bufferSource.stop > "u" ? x._node.bufferSource.noteOff(0) : x._node.bufferSource.stop(0), f._cleanBuffer(x._node);
              } else (!isNaN(x._node.duration) || x._node.duration === 1 / 0) && x._node.pause();
            arguments[1] || f._emit("pause", x ? x._id : null);
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
          for (var w = S._getSoundIds(l), x = 0; x < w.length; x++) {
            S._clearTimer(w[x]);
            var k = S._soundById(w[x]);
            k && (k._seek = k._start || 0, k._rateSeek = 0, k._paused = !0, k._ended = !0, S._stopFade(w[x]), k._node && (S._webAudio ? k._node.bufferSource && (typeof k._node.bufferSource.stop > "u" ? k._node.bufferSource.noteOff(0) : k._node.bufferSource.stop(0), S._cleanBuffer(k._node)) : (!isNaN(k._node.duration) || k._node.duration === 1 / 0) && (k._node.currentTime = k._start || 0, k._node.pause(), k._node.duration === 1 / 0 && S._clearSound(k._node))), f || S._emit("stop", k._id));
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
          for (var w = S._getSoundIds(f), x = 0; x < w.length; x++) {
            var k = S._soundById(w[x]);
            k && (k._muted = l, k._interval && S._stopFade(k._id), S._webAudio && k._node ? k._node.gain.setValueAtTime(l ? 0 : k._volume, o.ctx.currentTime) : k._node && (k._node.muted = o._muted ? !0 : l), S._emit("mute", k._id));
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
            var x = l._getSoundIds(), k = x.indexOf(f[0]);
            k >= 0 ? w = parseInt(f[0], 10) : S = parseFloat(f[0]);
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
          var x = this;
          if (x._state !== "loaded" || x._playLock)
            return x._queue.push({
              event: "fade",
              action: function() {
                x.fade(l, f, S, w);
              }
            }), x;
          l = Math.min(Math.max(0, parseFloat(l)), 1), f = Math.min(Math.max(0, parseFloat(f)), 1), S = parseFloat(S), x.volume(l, w);
          for (var k = x._getSoundIds(w), A = 0; A < k.length; A++) {
            var E = x._soundById(k[A]);
            if (E) {
              if (w || x._stopFade(k[A]), x._webAudio && !E._muted) {
                var R = o.ctx.currentTime, N = R + S / 1e3;
                E._volume = l, E._node.gain.setValueAtTime(l, R), E._node.gain.linearRampToValueAtTime(f, N);
              }
              x._startFadeInterval(E, l, f, S, k[A], typeof w > "u");
            }
          }
          return x;
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
        _startFadeInterval: function(l, f, S, w, x, k) {
          var A = this, E = f, R = S - f, N = Math.abs(R / 0.01), j = Math.max(4, N > 0 ? w / N : w), L = Date.now();
          l._fadeTo = S, l._interval = setInterval(function() {
            var V = (Date.now() - L) / w;
            L = Date.now(), E += R * V, E = Math.round(E * 100) / 100, R < 0 ? E = Math.max(S, E) : E = Math.min(S, E), A._webAudio ? l._volume = E : A.volume(E, l._id, !0), k && (A._volume = E), (S < f && E <= S || S > f && E >= S) && (clearInterval(l._interval), l._interval = null, l._fadeTo = null, A.volume(S, l._id), A._emit("fade", l._id));
          }, j);
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
          var l = this, f = arguments, S, w, x;
          if (f.length === 0)
            return l._loop;
          if (f.length === 1)
            if (typeof f[0] == "boolean")
              S = f[0], l._loop = S;
            else
              return x = l._soundById(parseInt(f[0], 10)), x ? x._loop : !1;
          else f.length === 2 && (S = f[0], w = parseInt(f[1], 10));
          for (var k = l._getSoundIds(w), A = 0; A < k.length; A++)
            x = l._soundById(k[A]), x && (x._loop = S, l._webAudio && x._node && x._node.bufferSource && (x._node.bufferSource.loop = S, S && (x._node.bufferSource.loopStart = x._start || 0, x._node.bufferSource.loopEnd = x._stop, l.playing(k[A]) && (l.pause(k[A], !0), l.play(k[A], !0)))));
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
            var x = l._getSoundIds(), k = x.indexOf(f[0]);
            k >= 0 ? w = parseInt(f[0], 10) : S = parseFloat(f[0]);
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
                var R = l.seek(w[E]), N = (l._sprite[A._sprite][0] + l._sprite[A._sprite][1]) / 1e3 - R, j = N * 1e3 / Math.abs(A._rate);
                (l._endTimers[w[E]] || !A._paused) && (l._clearTimer(w[E]), l._endTimers[w[E]] = setTimeout(l._ended.bind(l, A), j)), l._emit("rate", A._id);
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
            var x = l._getSoundIds(), k = x.indexOf(f[0]);
            k >= 0 ? w = parseInt(f[0], 10) : l._sounds.length && (w = l._sounds[0]._id, S = parseFloat(f[0]));
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
              var j = l.playing(w) ? o.ctx.currentTime - A._playStart : 0, L = A._rateSeek ? A._rateSeek - A._seek : 0;
              return A._seek + (L + j * Math.abs(A._rate));
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
          var x = !0;
          for (S = 0; S < o._howls.length; S++)
            if (o._howls[S]._src === l._src || l._src.indexOf(o._howls[S]._src) >= 0) {
              x = !1;
              break;
            }
          return c && x && delete c[l._src], o.noAudio = !1, l._state = "unloaded", l._sounds = [], l = null, null;
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
          var x = this, k = x["_on" + l];
          return typeof f == "function" && k.push(w ? { id: S, fn: f, once: w } : { id: S, fn: f }), x;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(l, f, S) {
          var w = this, x = w["_on" + l], k = 0;
          if (typeof f == "number" && (S = f, f = null), f || S)
            for (k = 0; k < x.length; k++) {
              var A = S === x[k].id;
              if (f === x[k].fn && A || !f && A) {
                x.splice(k, 1);
                break;
              }
            }
          else if (l)
            w["_on" + l] = [];
          else {
            var E = Object.keys(w);
            for (k = 0; k < E.length; k++)
              E[k].indexOf("_on") === 0 && Array.isArray(w[E[k]]) && (w[E[k]] = []);
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
          for (var w = this, x = w["_on" + l], k = x.length - 1; k >= 0; k--)
            (!x[k].id || x[k].id === f || l === "load") && (setTimeout((function(A) {
              A.call(this, f, S);
            }).bind(w, x[k].fn), 0), x[k].once && w.off(l, x[k].fn, x[k].id));
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
            var x = (l._stop - l._start) * 1e3 / Math.abs(l._rate);
            f._endTimers[l._id] = setTimeout(f._ended.bind(f, l), x);
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
          for (var S = atob(f.split(",")[1]), w = new Uint8Array(S.length), x = 0; x < S.length; ++x)
            w[x] = S.charCodeAt(x);
          m(w.buffer, l);
        } else {
          var k = new XMLHttpRequest();
          k.open(l._xhr.method, f, !0), k.withCredentials = l._xhr.withCredentials, k.responseType = "arraybuffer", l._xhr.headers && Object.keys(l._xhr.headers).forEach(function(A) {
            k.setRequestHeader(A, l._xhr.headers[A]);
          }), k.onload = function() {
            var A = (k.status + "")[0];
            if (A !== "0" && A !== "2" && A !== "3") {
              l._emit("loaderror", null, "Failed loading audio file with status: " + k.status + ".");
              return;
            }
            m(k.response, l);
          }, k.onerror = function() {
            l._webAudio && (l._html5 = !0, l._webAudio = !1, l._sounds = [], delete c[f], l.load());
          }, p(k);
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
        }, w = function(x) {
          x && f._sounds.length > 0 ? (c[f._src] = x, g(f, x)) : S();
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
      e.Howler = o, e.Howl = i, typeof ti < "u" ? (ti.HowlerGlobal = n, ti.Howler = o, ti.Howl = i, ti.Sound = a) : typeof window < "u" && (window.HowlerGlobal = n, window.Howler = o, window.Howl = i, window.Sound = a);
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
  })(dc)), dc;
}
var ob = rb();
const ib = /* @__PURE__ */ cg(ob), { Howl: xS } = ib, ld = 500, Et = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let ur = {}, di = !1, ud = "";
function _i() {
  return typeof xS == "function";
}
function fc(e, n = 50) {
  const o = Number(e), i = Number.isFinite(o) ? o : n;
  return Math.min(1, Math.max(0, i / 100));
}
function TS(e) {
  return new xS({
    src: [e],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function kS(e, n, o = ld) {
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
function Ua(e, { unload: n = !1 } = {}) {
  var o;
  e && (kS(e, 0, Math.min(ld, 300)), (o = globalThis.setTimeout) == null || o.call(globalThis, () => {
    try {
      e.pause(), n && e.unload();
    } catch {
    }
  }, Math.min(ld, 320)));
}
function sb(e) {
  return !(e != null && e.streamUrl) || !_i() ? null : ((!Et.music || Et.music.__synapseSrc !== e.streamUrl) && (Ua(Et.music, { unload: !0 }), Et.music = TS(e.streamUrl), Et.music.__synapseSrc = e.streamUrl), Et.music);
}
function ab(e) {
  if (!(e != null && e.streamUrl) || !_i()) return null;
  const n = e.id || e.streamUrl, o = Et.ambient.get(n);
  if (o && o.__synapseSrc === e.streamUrl) return o;
  Ua(o, { unload: !0 });
  const i = TS(e.streamUrl);
  return i.__synapseSrc = e.streamUrl, Et.ambient.set(n, i), i;
}
function lb() {
  return [
    Et.music,
    ...Et.ambient.values()
  ].filter(Boolean);
}
function AS() {
  lb().forEach((e) => Ua(e));
}
function ub(e) {
  for (const [n, o] of Et.ambient.entries())
    e.has(n) || (Ua(o, { unload: !0 }), Et.ambient.delete(n));
}
function rg(e, n) {
  if (e)
    try {
      e.playing() || e.play(), kS(e, n), ud = "";
    } catch (o) {
      ud = (o == null ? void 0 : o.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function cb(e = {}) {
  ur = { ...ur, ...e };
  const n = ja(ur);
  if (!_i()) return fa(n);
  if (!di)
    return AS(), fa(n);
  const o = sb(n.musicTrack), i = fc(ur.musicVolume, 60), a = fc(ur.ambientVolume, 50), c = /* @__PURE__ */ new Set(), d = [];
  return n.ambientLayers.forEach((p) => {
    var f;
    const m = p.id || p.streamUrl;
    c.add(m);
    const g = ab(p), v = Number((f = ur.audioChannels) == null ? void 0 : f[p.id]), l = Number.isFinite(v) ? fc(v, 0) : Math.min(1, Math.max(0, a * (p.volumeBias ?? 1)));
    d.push([g, l]);
  }), ub(c), rg(o, i), d.forEach(([p, m]) => rg(p, m)), fa(n);
}
function db(e) {
  return di = !!e, di || AS(), di;
}
function fa(e = ja(ur)) {
  var n, o, i, a;
  return {
    available: _i(),
    playing: di && _i(),
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
const fb = "synapse.focusRoom.audioPrefs.v1";
function pb(e) {
  var n;
  try {
    (n = globalThis.localStorage) == null || n.setItem(fb, JSON.stringify({
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
function hb() {
  const e = Q((m) => m.musicType), n = Q((m) => m.ambientSound), o = Q((m) => m.musicVolume), i = Q((m) => m.ambientVolume), a = Q((m) => m.audioChannels), c = Q((m) => m.audioPlaying), [d, p] = C.useState(() => fa(ja({
    musicType: e,
    ambientSound: n
  })));
  return C.useEffect(() => {
    const m = { musicType: e, ambientSound: n, musicVolume: o, ambientVolume: i, audioChannels: a };
    let g = !1;
    return db(c), pb(m), cb(m).then((v) => {
      g || p(v);
    }), () => {
      g = !0;
    };
  }, [n, i, a, c, e, o]), d;
}
function mb() {
  const e = Q(), n = C.useCallback(async (i = "", a = "", c = {}) => {
    var v;
    e.pauseTimer({ pauseAudio: !0 }), e.closeSummary();
    const d = typeof i == "string" || typeof i == "number" ? i : "", p = typeof a == "string" ? a : "", m = yb(p, c), g = String(d || e.selectedMaterialId || ((v = e.selectedMaterial) == null ? void 0 : v.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const l = globalThis.returnFromFocusRoomToWorkspace(g, m);
        l && typeof l.then == "function" && await l, og(m.action || p, m);
        return;
      } catch (l) {
        console.error("Could not return from Focus Room:", l);
      }
    globalThis.location.hash = "", og(m.action || p, m);
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
function CS(e) {
  const n = String(e || "").trim().toLowerCase();
  return ["flashcards", "quiz", "assistant", "mindmap", "timeline", "source", "notes"].includes(n) ? n : "";
}
function yb(e, n = {}) {
  const o = n && typeof n == "object" && !Array.isArray(n) ? n : {}, i = CS(e || o.action);
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
function og(e, n = {}) {
  const o = CS(e);
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
function gb(e = 3e3) {
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
function vb() {
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
function Sb() {
  const e = Q((n) => n.selectedScene);
  return Wn(e);
}
function wb(e) {
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
function _b() {
  const [e, n] = C.useState(""), [o, i] = C.useState(!1), [a, c] = C.useState(!1), d = Q((A) => A.view), p = gb(3e3), m = Sb(), g = hb(), v = mb();
  vb();
  const l = Q(G_(wb)), f = Q((A) => A.summaryRecord), S = Q((A) => A.endSession), w = Q((A) => A.initializeFocusRoom);
  C.useEffect(() => {
    w();
  }, [w]), C.useEffect(() => {
    l != null && l.materialId && zd(l.materialId, l);
  }, [l]), C.useEffect(() => {
    d === "session" || !f || a0("focus-room");
  }, [f, d]), C.useEffect(() => {
    d !== "session" && (i(!1), n(""), c(!1));
  }, [d]), C.useEffect(() => {
    const A = (E) => {
      E.key === "Escape" && (o ? (E.preventDefault(), i(!1)) : e ? n("") : a && c(!1));
    };
    return window.addEventListener("keydown", A), () => window.removeEventListener("keydown", A);
  }, [a, o, e]);
  const x = (...A) => {
    v.returnToWorkspace(...A);
  }, k = async () => {
    c(!1), i(!1), n(""), S(), await x();
  };
  return /* @__PURE__ */ T.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${p ? "is-idle" : ""}`.trim(),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ T.jsx(TC, { scene: m }),
        /* @__PURE__ */ T.jsx(Fa, { mode: "wait", children: d === "session" ? /* @__PURE__ */ T.jsxs(
          Sr.div,
          {
            className: "focus-room-view focus-session-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: u0,
            children: [
              o ? /* @__PURE__ */ T.jsx("button", { type: "button", className: "focus-mode-exit-hit-area", onClick: () => i(!1), children: "Exit Focus Mode" }) : /* @__PURE__ */ T.jsx(PP, { onWorkspace: x, onOpenTrail: () => n("trail"), onOpenCompanion: () => n("companion"), onOpenSettings: () => n("settings"), onExit: () => c(!0) }),
              /* @__PURE__ */ T.jsx("section", { className: `focus-session-stage ${o ? "is-focus-mode" : ""}`.trim(), children: /* @__PURE__ */ T.jsx("div", { className: "focus-session-grid", children: /* @__PURE__ */ T.jsx(CP, {}) }) }),
              o ? /* @__PURE__ */ T.jsx(nb, { onExit: () => i(!1) }) : /* @__PURE__ */ T.jsx(MP, { audioState: g, onFocusMode: () => i(!0) }),
              o ? null : /* @__PURE__ */ T.jsx(eb, { audioState: g, utilityPanel: e, onClose: () => n(""), onWorkspace: x }),
              /* @__PURE__ */ T.jsx(dM, {}),
              /* @__PURE__ */ T.jsx(xb, { open: a, onClose: () => c(!1), onConfirm: k })
            ]
          },
          "session"
        ) : null })
      ]
    }
  );
}
function xb({ open: e, onClose: n, onConfirm: o }) {
  return e ? /* @__PURE__ */ T.jsx("div", { className: "focus-exit-overlay", role: "presentation", children: /* @__PURE__ */ T.jsxs("div", { className: "focus-exit-dialog liquid-glass", role: "dialog", "aria-modal": "true", "aria-labelledby": "focus-exit-title", children: [
    /* @__PURE__ */ T.jsx("span", { className: "focus-kicker", children: "Leave this room?" }),
    /* @__PURE__ */ T.jsx("h2", { id: "focus-exit-title", children: "End focus session" }),
    /* @__PURE__ */ T.jsx("p", { children: "Your focused time will be saved to your Focus Trail." }),
    /* @__PURE__ */ T.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ T.jsx(ke, { onClick: n, children: "Continue focusing" }),
      /* @__PURE__ */ T.jsx(ke, { variant: "primary", onClick: o, children: "End and exit" })
    ] })
  ] }) }) : null;
}
let pc = null;
function Tb(e, n) {
  const o = globalThis.__synapseFocusRoomApi || {};
  if (typeof o[e] != "function") {
    console.warn(`Synapse Focus Room action "${e}" is not available yet.`);
    return;
  }
  return o[e](...n);
}
function kb() {
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
    globalThis[n] = (...i) => Tb(o, i);
  });
}
function Ab(e = {}) {
  kb();
  const n = e.root || document.getElementById("focusRoomRoot");
  if (!n)
    throw new Error("Focus Room root element was not found.");
  pc || (pc = z_.createRoot(n), pc.render(
    pn.createElement(
      pn.StrictMode,
      null,
      pn.createElement(_b)
    )
  ));
}
const Cb = "synapse.generated.history.v6", PS = "synapse.active.generated.v6", Pb = "synapse.flashcards.deck.v1", Eb = "synapse.quiz.history.v1", Mb = "synapse.focusRoom.return-target.v1";
function nf(e, n) {
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
function bb(e, n) {
  var o;
  try {
    return (o = globalThis.localStorage) == null || o.setItem(e, n), !0;
  } catch (i) {
    return console.warn(`Could not write ${e}:`, i), !1;
  }
}
function Rb(e, n) {
  var o;
  try {
    return (o = globalThis.localStorage) == null || o.setItem(e, JSON.stringify(n)), !0;
  } catch (i) {
    return console.warn(`Could not write ${e}:`, i), !1;
  }
}
function ES() {
  const e = nf(Cb, []);
  return Array.isArray(e) ? e : [];
}
function Db(e) {
  const n = String((e == null ? void 0 : e.title) || "").trim();
  return n || String((e == null ? void 0 : e.summary) || "").split(/\n+/).map((i) => i.replace(/^#+\s*/, "").trim()).find((i) => i.length > 4) || "Generated Study Notes";
}
function MS(e = {}) {
  return [
    e.id ? `history:${e.id}` : "",
    e.sourceFingerprint ? `fingerprint:${e.sourceFingerprint}` : "",
    e.clientFingerprint ? `fingerprint:${e.clientFingerprint}` : ""
  ].filter(Boolean);
}
function Nb(e = {}) {
  const n = nf(Pb, {}), i = MS(e).map((a) => n == null ? void 0 : n[a]).find((a) => a && Array.isArray(a.cards) && a.cards.length);
  return (i == null ? void 0 : i.cards) || [];
}
function Ib(e = {}) {
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
function Fb(e = []) {
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
function Ob(e = {}) {
  const n = nf(Eb, {}), i = MS(e).flatMap((c) => Array.isArray(n == null ? void 0 : n[c]) ? n[c] : []), a = /* @__PURE__ */ new Set();
  return Fb(i).filter((c) => {
    const d = Ib(c);
    return !d || a.has(d) ? !1 : (a.add(d), !0);
  }).sort((c, d) => new Date(d.createdAt || 0) - new Date(c.createdAt || 0));
}
function jb(e = {}) {
  return {
    materialId: String(e.id || e.sourceFingerprint || e.clientFingerprint || "current-material"),
    materialTitle: Db(e),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: e.summary || "",
    sections: e.sections || {},
    flashcards: Nb(e),
    quizzes: Ob(e),
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
function bS() {
  return ES().filter((e) => e && (e.id || e.summary)).map(jb);
}
function RS(e = "") {
  const n = String(e || "");
  return n && bS().find(
    (o) => o.materialId === n || o.sourceFingerprint === n || o.clientFingerprint === n
  ) || null;
}
function DS() {
  var n;
  const e = ((n = globalThis.localStorage) == null ? void 0 : n.getItem(PS)) || "";
  return RS(e);
}
function Lb(e = "") {
  var i;
  const n = e || ((i = DS()) == null ? void 0 : i.materialId) || "", o = n ? `/${encodeURIComponent(n)}` : "";
  globalThis.location.hash = `#/focus-room${o}`;
}
function Vb(e = "", n = {}) {
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
async function Bb(e = "", n = {}) {
  const o = String(e || ""), i = ES().find(
    (d) => String((d == null ? void 0 : d.id) || "") === o || String((d == null ? void 0 : d.sourceFingerprint) || (d == null ? void 0 : d.source_fingerprint) || "") === o || String((d == null ? void 0 : d.clientFingerprint) || (d == null ? void 0 : d.client_fingerprint) || "") === o
  ) || null, a = String((i == null ? void 0 : i.id) || "");
  a && bb(PS, a);
  const c = Vb(a, n);
  c.action && Rb(Mb, c), globalThis.location.href = a ? `index.html?focusReturn=${encodeURIComponent(a)}` : "index.html";
}
function zb() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: DS,
    getSynapseFocusRoomMaterial: RS,
    getSynapseFocusRoomMaterials: bS,
    openSynapseFocusRoom: Lb,
    returnFromFocusRoomToWorkspace: Bb
  });
}
const NS = document.getElementById("focusRoomRoot");
if (!NS)
  throw new Error("Focus Room root element was not found.");
var ag;
(ag = document.getElementById("focusRoomFallbackTitle")) == null || ag.remove();
globalThis.apiClient = new ug(N_);
zb();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
Ab({ root: NS });
