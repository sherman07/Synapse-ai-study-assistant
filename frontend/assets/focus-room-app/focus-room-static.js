function lx(e, n) {
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
function ux(e) {
  const i = String(e || "").toLowerCase().split(".");
  if (i.length !== 4 || i.some((a) => !/^\d+$/.test(a))) return !1;
  const o = i.map(Number);
  return o.some((a) => a < 0 || a > 255) ? !1 : o[0] === 10 || o[0] === 172 && o[1] >= 16 && o[1] <= 31 || o[0] === 192 && o[1] === 168;
}
function Gy(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function Oh(e) {
  return Gy(e) || ux(e);
}
function cx(e) {
  return !e || Gy(e) ? "127.0.0.1" : e;
}
const dx = (() => {
  var f, y, v, S;
  const { protocol: e, hostname: n, port: i } = window.location, o = String(window.SYNAPSE_BACKEND_PORT || ((y = (f = document.body) == null ? void 0 : f.dataset) == null ? void 0 : y.apiPort) || "8001").trim(), a = `http://${cx(n)}:${o || "8001"}`, c = String(window.SYNAPSE_API_BASE || ((S = (v = document.body) == null ? void 0 : v.dataset) == null ? void 0 : S.apiBase) || "").replace(/\/+$/, ""), d = `${e}//${window.location.host}`.replace(/\/+$/, "");
  return c && !(Oh(n) && i !== o && c === d) ? c : e === "file:" || Oh(n) && i !== o ? a : `${e}//${window.location.host}`;
})();
class Ds extends Error {
  constructor(n, { cause: i } = {}) {
    super(n), this.name = "ApiConnectionError", this.cause = i;
  }
}
const Lh = "synapse.client.id.v1";
function Ln() {
  return globalThis.window || globalThis;
}
function zr(e, n = 220) {
  return String(e || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
}
function Vh() {
  const e = globalThis.crypto || Ln().crypto;
  return e != null && e.randomUUID ? e.randomUUID() : `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
function fx() {
  var n, i;
  const e = Ln();
  try {
    const o = (n = e.localStorage) == null ? void 0 : n.getItem(Lh);
    if (o) return o;
    const a = Vh();
    return (i = e.localStorage) == null || i.setItem(Lh, a), a;
  } catch {
    return Vh();
  }
}
function px(e = {}) {
  if (typeof Headers < "u" && e instanceof Headers) {
    const n = {};
    return e.forEach((i, o) => {
      n[o] = i;
    }), n;
  }
  return Array.isArray(e) ? Object.fromEntries(e) : { ...e || {} };
}
class Ky {
  constructor(n, { fetchImpl: i } = {}) {
    var a, c;
    const o = Ln();
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
    const i = Ln(), o = px(n);
    o["X-Synapse-Client-Id"] = zr(fx(), 160);
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
    let f = null, y = null, v = null, S = !1;
    const l = c.signal;
    d > 0 && typeof AbortController < "u" && (f = new AbortController(), v = () => f.abort(), l && (l.aborted ? f.abort() : l.addEventListener("abort", v, { once: !0 })), y = Ln().setTimeout(() => {
      S = !0, f.abort();
    }, d), c.signal = f.signal);
    try {
      return await this.fetchImpl(o, c);
    } catch (h) {
      throw S ? new Ds(this.timeoutMessage(d), { cause: h }) : l != null && l.aborted ? h : new Ds(this.connectionMessage(), { cause: h });
    } finally {
      y && Ln().clearTimeout(y), l && v && l.removeEventListener("abort", v);
    }
  }
  async warmup({ attempts: n = 2, retryDelayMs: i = 1500, timeoutMs: o = 6e4, maxWaitMs: a = 0, signal: c } = {}) {
    const d = Math.max(1, Math.floor(Number(n) || 1)), f = Math.max(0, Number(a) || 0), y = Date.now();
    let v = null;
    for (let S = 0; S < d; S += 1) {
      const l = Date.now() - y, h = f > 0 ? f - l : 0;
      if (f > 0 && h <= 0) break;
      try {
        const g = await this.fetch("/healthz", {
          method: "GET",
          signal: c,
          timeoutMs: f > 0 ? Math.min(o, h) : o
        });
        if (g != null && g.ok) return g;
        v = new Ds(
          `Synapse hosted service returned ${(g == null ? void 0 : g.status) || "an unexpected status"} while preparing your analysis.`
        );
      } catch (g) {
        v = g;
      }
      if (S < d - 1 && i > 0) {
        const g = f > 0 ? f - (Date.now() - y) : i;
        if (f > 0 && g <= 0) break;
        await new Promise((x) => Ln().setTimeout(x, Math.min(i, g)));
      }
    }
    throw v || new Ds(this.connectionMessage());
  }
  isRetryableResponse(n) {
    return [502, 503, 504].includes(Number(n == null ? void 0 : n.status));
  }
  async fetchWithRetry(n, i = {}, { attempts: o = 3, retryDelayMs: a = 3e3 } = {}) {
    const c = Math.max(1, Math.floor(Number(o) || 1));
    let d = null;
    for (let f = 0; f < c; f += 1) {
      if (d = await this.fetch(n, i), !this.isRetryableResponse(d) || f === c - 1) return d;
      a > 0 && await new Promise((y) => Ln().setTimeout(y, a));
    }
    return d;
  }
}
var Gi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Yy(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Pu = { exports: {} }, fe = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Bh;
function hx() {
  if (Bh) return fe;
  Bh = 1;
  var e = Symbol.for("react.element"), n = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), o = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), d = Symbol.for("react.context"), f = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), v = Symbol.for("react.memo"), S = Symbol.for("react.lazy"), l = Symbol.iterator;
  function h(P) {
    return P === null || typeof P != "object" ? null : (P = l && P[l] || P["@@iterator"], typeof P == "function" ? P : null);
  }
  var g = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, x = Object.assign, T = {};
  function k(P, O, ae) {
    this.props = P, this.context = O, this.refs = T, this.updater = ae || g;
  }
  k.prototype.isReactComponent = {}, k.prototype.setState = function(P, O) {
    if (typeof P != "object" && typeof P != "function" && P != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, P, O, "setState");
  }, k.prototype.forceUpdate = function(P) {
    this.updater.enqueueForceUpdate(this, P, "forceUpdate");
  };
  function A() {
  }
  A.prototype = k.prototype;
  function R(P, O, ae) {
    this.props = P, this.context = O, this.refs = T, this.updater = ae || g;
  }
  var b = R.prototype = new A();
  b.constructor = R, x(b, k.prototype), b.isPureReactComponent = !0;
  var D = Array.isArray, L = Object.prototype.hasOwnProperty, K = { current: null }, Q = { key: !0, ref: !0, __self: !0, __source: !0 };
  function $(P, O, ae) {
    var de, ge = {}, ve = null, Ce = null;
    if (O != null) for (de in O.ref !== void 0 && (Ce = O.ref), O.key !== void 0 && (ve = "" + O.key), O) L.call(O, de) && !Q.hasOwnProperty(de) && (ge[de] = O[de]);
    var xe = arguments.length - 2;
    if (xe === 1) ge.children = ae;
    else if (1 < xe) {
      for (var Re = Array(xe), gt = 0; gt < xe; gt++) Re[gt] = arguments[gt + 2];
      ge.children = Re;
    }
    if (P && P.defaultProps) for (de in xe = P.defaultProps, xe) ge[de] === void 0 && (ge[de] = xe[de]);
    return { $$typeof: e, type: P, key: ve, ref: Ce, props: ge, _owner: K.current };
  }
  function W(P, O) {
    return { $$typeof: e, type: P.type, key: O, ref: P.ref, props: P.props, _owner: P._owner };
  }
  function X(P) {
    return typeof P == "object" && P !== null && P.$$typeof === e;
  }
  function J(P) {
    var O = { "=": "=0", ":": "=2" };
    return "$" + P.replace(/[=:]/g, function(ae) {
      return O[ae];
    });
  }
  var ce = /\/+/g;
  function me(P, O) {
    return typeof P == "object" && P !== null && P.key != null ? J("" + P.key) : O.toString(36);
  }
  function pe(P, O, ae, de, ge) {
    var ve = typeof P;
    (ve === "undefined" || ve === "boolean") && (P = null);
    var Ce = !1;
    if (P === null) Ce = !0;
    else switch (ve) {
      case "string":
      case "number":
        Ce = !0;
        break;
      case "object":
        switch (P.$$typeof) {
          case e:
          case n:
            Ce = !0;
        }
    }
    if (Ce) return Ce = P, ge = ge(Ce), P = de === "" ? "." + me(Ce, 0) : de, D(ge) ? (ae = "", P != null && (ae = P.replace(ce, "$&/") + "/"), pe(ge, O, ae, "", function(gt) {
      return gt;
    })) : ge != null && (X(ge) && (ge = W(ge, ae + (!ge.key || Ce && Ce.key === ge.key ? "" : ("" + ge.key).replace(ce, "$&/") + "/") + P)), O.push(ge)), 1;
    if (Ce = 0, de = de === "" ? "." : de + ":", D(P)) for (var xe = 0; xe < P.length; xe++) {
      ve = P[xe];
      var Re = de + me(ve, xe);
      Ce += pe(ve, O, ae, Re, ge);
    }
    else if (Re = h(P), typeof Re == "function") for (P = Re.call(P), xe = 0; !(ve = P.next()).done; ) ve = ve.value, Re = de + me(ve, xe++), Ce += pe(ve, O, ae, Re, ge);
    else if (ve === "object") throw O = String(P), Error("Objects are not valid as a React child (found: " + (O === "[object Object]" ? "object with keys {" + Object.keys(P).join(", ") + "}" : O) + "). If you meant to render a collection of children, use an array instead.");
    return Ce;
  }
  function we(P, O, ae) {
    if (P == null) return P;
    var de = [], ge = 0;
    return pe(P, de, "", "", function(ve) {
      return O.call(ae, ve, ge++);
    }), de;
  }
  function ue(P) {
    if (P._status === -1) {
      var O = P._result;
      O = O(), O.then(function(ae) {
        (P._status === 0 || P._status === -1) && (P._status = 1, P._result = ae);
      }, function(ae) {
        (P._status === 0 || P._status === -1) && (P._status = 2, P._result = ae);
      }), P._status === -1 && (P._status = 0, P._result = O);
    }
    if (P._status === 1) return P._result.default;
    throw P._result;
  }
  var he = { current: null }, z = { transition: null }, q = { ReactCurrentDispatcher: he, ReactCurrentBatchConfig: z, ReactCurrentOwner: K };
  function Y() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return fe.Children = { map: we, forEach: function(P, O, ae) {
    we(P, function() {
      O.apply(this, arguments);
    }, ae);
  }, count: function(P) {
    var O = 0;
    return we(P, function() {
      O++;
    }), O;
  }, toArray: function(P) {
    return we(P, function(O) {
      return O;
    }) || [];
  }, only: function(P) {
    if (!X(P)) throw Error("React.Children.only expected to receive a single React element child.");
    return P;
  } }, fe.Component = k, fe.Fragment = i, fe.Profiler = a, fe.PureComponent = R, fe.StrictMode = o, fe.Suspense = y, fe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = q, fe.act = Y, fe.cloneElement = function(P, O, ae) {
    if (P == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + P + ".");
    var de = x({}, P.props), ge = P.key, ve = P.ref, Ce = P._owner;
    if (O != null) {
      if (O.ref !== void 0 && (ve = O.ref, Ce = K.current), O.key !== void 0 && (ge = "" + O.key), P.type && P.type.defaultProps) var xe = P.type.defaultProps;
      for (Re in O) L.call(O, Re) && !Q.hasOwnProperty(Re) && (de[Re] = O[Re] === void 0 && xe !== void 0 ? xe[Re] : O[Re]);
    }
    var Re = arguments.length - 2;
    if (Re === 1) de.children = ae;
    else if (1 < Re) {
      xe = Array(Re);
      for (var gt = 0; gt < Re; gt++) xe[gt] = arguments[gt + 2];
      de.children = xe;
    }
    return { $$typeof: e, type: P.type, key: ge, ref: ve, props: de, _owner: Ce };
  }, fe.createContext = function(P) {
    return P = { $$typeof: d, _currentValue: P, _currentValue2: P, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, P.Provider = { $$typeof: c, _context: P }, P.Consumer = P;
  }, fe.createElement = $, fe.createFactory = function(P) {
    var O = $.bind(null, P);
    return O.type = P, O;
  }, fe.createRef = function() {
    return { current: null };
  }, fe.forwardRef = function(P) {
    return { $$typeof: f, render: P };
  }, fe.isValidElement = X, fe.lazy = function(P) {
    return { $$typeof: S, _payload: { _status: -1, _result: P }, _init: ue };
  }, fe.memo = function(P, O) {
    return { $$typeof: v, type: P, compare: O === void 0 ? null : O };
  }, fe.startTransition = function(P) {
    var O = z.transition;
    z.transition = {};
    try {
      P();
    } finally {
      z.transition = O;
    }
  }, fe.unstable_act = Y, fe.useCallback = function(P, O) {
    return he.current.useCallback(P, O);
  }, fe.useContext = function(P) {
    return he.current.useContext(P);
  }, fe.useDebugValue = function() {
  }, fe.useDeferredValue = function(P) {
    return he.current.useDeferredValue(P);
  }, fe.useEffect = function(P, O) {
    return he.current.useEffect(P, O);
  }, fe.useId = function() {
    return he.current.useId();
  }, fe.useImperativeHandle = function(P, O, ae) {
    return he.current.useImperativeHandle(P, O, ae);
  }, fe.useInsertionEffect = function(P, O) {
    return he.current.useInsertionEffect(P, O);
  }, fe.useLayoutEffect = function(P, O) {
    return he.current.useLayoutEffect(P, O);
  }, fe.useMemo = function(P, O) {
    return he.current.useMemo(P, O);
  }, fe.useReducer = function(P, O, ae) {
    return he.current.useReducer(P, O, ae);
  }, fe.useRef = function(P) {
    return he.current.useRef(P);
  }, fe.useState = function(P) {
    return he.current.useState(P);
  }, fe.useSyncExternalStore = function(P, O, ae) {
    return he.current.useSyncExternalStore(P, O, ae);
  }, fe.useTransition = function() {
    return he.current.useTransition();
  }, fe.version = "18.3.1", fe;
}
var zh;
function Qc() {
  return zh || (zh = 1, Pu.exports = hx()), Pu.exports;
}
var C = Qc();
const mn = /* @__PURE__ */ Yy(C), Xc = /* @__PURE__ */ lx({
  __proto__: null,
  default: mn
}, [C]);
var js = {}, bu = { exports: {} }, ft = {}, Mu = { exports: {} }, Ru = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Uh;
function mx() {
  return Uh || (Uh = 1, (function(e) {
    function n(z, q) {
      var Y = z.length;
      z.push(q);
      e: for (; 0 < Y; ) {
        var P = Y - 1 >>> 1, O = z[P];
        if (0 < a(O, q)) z[P] = q, z[Y] = O, Y = P;
        else break e;
      }
    }
    function i(z) {
      return z.length === 0 ? null : z[0];
    }
    function o(z) {
      if (z.length === 0) return null;
      var q = z[0], Y = z.pop();
      if (Y !== q) {
        z[0] = Y;
        e: for (var P = 0, O = z.length, ae = O >>> 1; P < ae; ) {
          var de = 2 * (P + 1) - 1, ge = z[de], ve = de + 1, Ce = z[ve];
          if (0 > a(ge, Y)) ve < O && 0 > a(Ce, ge) ? (z[P] = Ce, z[ve] = Y, P = ve) : (z[P] = ge, z[de] = Y, P = de);
          else if (ve < O && 0 > a(Ce, Y)) z[P] = Ce, z[ve] = Y, P = ve;
          else break e;
        }
      }
      return q;
    }
    function a(z, q) {
      var Y = z.sortIndex - q.sortIndex;
      return Y !== 0 ? Y : z.id - q.id;
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
    var y = [], v = [], S = 1, l = null, h = 3, g = !1, x = !1, T = !1, k = typeof setTimeout == "function" ? setTimeout : null, A = typeof clearTimeout == "function" ? clearTimeout : null, R = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function b(z) {
      for (var q = i(v); q !== null; ) {
        if (q.callback === null) o(v);
        else if (q.startTime <= z) o(v), q.sortIndex = q.expirationTime, n(y, q);
        else break;
        q = i(v);
      }
    }
    function D(z) {
      if (T = !1, b(z), !x) if (i(y) !== null) x = !0, ue(L);
      else {
        var q = i(v);
        q !== null && he(D, q.startTime - z);
      }
    }
    function L(z, q) {
      x = !1, T && (T = !1, A($), $ = -1), g = !0;
      var Y = h;
      try {
        for (b(q), l = i(y); l !== null && (!(l.expirationTime > q) || z && !J()); ) {
          var P = l.callback;
          if (typeof P == "function") {
            l.callback = null, h = l.priorityLevel;
            var O = P(l.expirationTime <= q);
            q = e.unstable_now(), typeof O == "function" ? l.callback = O : l === i(y) && o(y), b(q);
          } else o(y);
          l = i(y);
        }
        if (l !== null) var ae = !0;
        else {
          var de = i(v);
          de !== null && he(D, de.startTime - q), ae = !1;
        }
        return ae;
      } finally {
        l = null, h = Y, g = !1;
      }
    }
    var K = !1, Q = null, $ = -1, W = 5, X = -1;
    function J() {
      return !(e.unstable_now() - X < W);
    }
    function ce() {
      if (Q !== null) {
        var z = e.unstable_now();
        X = z;
        var q = !0;
        try {
          q = Q(!0, z);
        } finally {
          q ? me() : (K = !1, Q = null);
        }
      } else K = !1;
    }
    var me;
    if (typeof R == "function") me = function() {
      R(ce);
    };
    else if (typeof MessageChannel < "u") {
      var pe = new MessageChannel(), we = pe.port2;
      pe.port1.onmessage = ce, me = function() {
        we.postMessage(null);
      };
    } else me = function() {
      k(ce, 0);
    };
    function ue(z) {
      Q = z, K || (K = !0, me());
    }
    function he(z, q) {
      $ = k(function() {
        z(e.unstable_now());
      }, q);
    }
    e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(z) {
      z.callback = null;
    }, e.unstable_continueExecution = function() {
      x || g || (x = !0, ue(L));
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
          var q = 3;
          break;
        default:
          q = h;
      }
      var Y = h;
      h = q;
      try {
        return z();
      } finally {
        h = Y;
      }
    }, e.unstable_pauseExecution = function() {
    }, e.unstable_requestPaint = function() {
    }, e.unstable_runWithPriority = function(z, q) {
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
        return q();
      } finally {
        h = Y;
      }
    }, e.unstable_scheduleCallback = function(z, q, Y) {
      var P = e.unstable_now();
      switch (typeof Y == "object" && Y !== null ? (Y = Y.delay, Y = typeof Y == "number" && 0 < Y ? P + Y : P) : Y = P, z) {
        case 1:
          var O = -1;
          break;
        case 2:
          O = 250;
          break;
        case 5:
          O = 1073741823;
          break;
        case 4:
          O = 1e4;
          break;
        default:
          O = 5e3;
      }
      return O = Y + O, z = { id: S++, callback: q, priorityLevel: z, startTime: Y, expirationTime: O, sortIndex: -1 }, Y > P ? (z.sortIndex = Y, n(v, z), i(y) === null && z === i(v) && (T ? (A($), $ = -1) : T = !0, he(D, Y - P))) : (z.sortIndex = O, n(y, z), x || g || (x = !0, ue(L))), z;
    }, e.unstable_shouldYield = J, e.unstable_wrapCallback = function(z) {
      var q = h;
      return function() {
        var Y = h;
        h = q;
        try {
          return z.apply(this, arguments);
        } finally {
          h = Y;
        }
      };
    };
  })(Ru)), Ru;
}
var $h;
function yx() {
  return $h || ($h = 1, Mu.exports = mx()), Mu.exports;
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
var Hh;
function gx() {
  if (Hh) return ft;
  Hh = 1;
  var e = Qc(), n = yx();
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
  var f = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), y = Object.prototype.hasOwnProperty, v = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, S = {}, l = {};
  function h(t) {
    return y.call(l, t) ? !0 : y.call(S, t) ? !1 : v.test(t) ? l[t] = !0 : (S[t] = !0, !1);
  }
  function g(t, r, s, u) {
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
  function x(t, r, s, u) {
    if (r === null || typeof r > "u" || g(t, r, s, u)) return !0;
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
  function T(t, r, s, u, p, m, _) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = u, this.attributeNamespace = p, this.mustUseProperty = s, this.propertyName = t, this.type = r, this.sanitizeURL = m, this.removeEmptyString = _;
  }
  var k = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t) {
    k[t] = new T(t, 0, !1, t, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(t) {
    var r = t[0];
    k[r] = new T(r, 1, !1, t[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(t) {
    k[t] = new T(t, 2, !1, t.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(t) {
    k[t] = new T(t, 2, !1, t, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t) {
    k[t] = new T(t, 3, !1, t.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(t) {
    k[t] = new T(t, 3, !0, t, null, !1, !1);
  }), ["capture", "download"].forEach(function(t) {
    k[t] = new T(t, 4, !1, t, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(t) {
    k[t] = new T(t, 6, !1, t, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(t) {
    k[t] = new T(t, 5, !1, t.toLowerCase(), null, !1, !1);
  });
  var A = /[\-:]([a-z])/g;
  function R(t) {
    return t[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t) {
    var r = t.replace(
      A,
      R
    );
    k[r] = new T(r, 1, !1, t, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t) {
    var r = t.replace(A, R);
    k[r] = new T(r, 1, !1, t, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(t) {
    var r = t.replace(A, R);
    k[r] = new T(r, 1, !1, t, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(t) {
    k[t] = new T(t, 1, !1, t.toLowerCase(), null, !1, !1);
  }), k.xlinkHref = new T("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(t) {
    k[t] = new T(t, 1, !1, t.toLowerCase(), null, !0, !0);
  });
  function b(t, r, s, u) {
    var p = k.hasOwnProperty(r) ? k[r] : null;
    (p !== null ? p.type !== 0 : u || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (x(r, s, p, u) && (s = null), u || p === null ? h(r) && (s === null ? t.removeAttribute(r) : t.setAttribute(r, "" + s)) : p.mustUseProperty ? t[p.propertyName] = s === null ? p.type === 3 ? !1 : "" : s : (r = p.attributeName, u = p.attributeNamespace, s === null ? t.removeAttribute(r) : (p = p.type, s = p === 3 || p === 4 && s === !0 ? "" : "" + s, u ? t.setAttributeNS(u, r, s) : t.setAttribute(r, s))));
  }
  var D = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, L = Symbol.for("react.element"), K = Symbol.for("react.portal"), Q = Symbol.for("react.fragment"), $ = Symbol.for("react.strict_mode"), W = Symbol.for("react.profiler"), X = Symbol.for("react.provider"), J = Symbol.for("react.context"), ce = Symbol.for("react.forward_ref"), me = Symbol.for("react.suspense"), pe = Symbol.for("react.suspense_list"), we = Symbol.for("react.memo"), ue = Symbol.for("react.lazy"), he = Symbol.for("react.offscreen"), z = Symbol.iterator;
  function q(t) {
    return t === null || typeof t != "object" ? null : (t = z && t[z] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var Y = Object.assign, P;
  function O(t) {
    if (P === void 0) try {
      throw Error();
    } catch (s) {
      var r = s.stack.trim().match(/\n( *(at )?)/);
      P = r && r[1] || "";
    }
    return `
` + P + t;
  }
  var ae = !1;
  function de(t, r) {
    if (!t || ae) return "";
    ae = !0;
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
        for (var p = F.stack.split(`
`), m = u.stack.split(`
`), _ = p.length - 1, E = m.length - 1; 1 <= _ && 0 <= E && p[_] !== m[E]; ) E--;
        for (; 1 <= _ && 0 <= E; _--, E--) if (p[_] !== m[E]) {
          if (_ !== 1 || E !== 1)
            do
              if (_--, E--, 0 > E || p[_] !== m[E]) {
                var M = `
` + p[_].replace(" at new ", " at ");
                return t.displayName && M.includes("<anonymous>") && (M = M.replace("<anonymous>", t.displayName)), M;
              }
            while (1 <= _ && 0 <= E);
          break;
        }
      }
    } finally {
      ae = !1, Error.prepareStackTrace = s;
    }
    return (t = t ? t.displayName || t.name : "") ? O(t) : "";
  }
  function ge(t) {
    switch (t.tag) {
      case 5:
        return O(t.type);
      case 16:
        return O("Lazy");
      case 13:
        return O("Suspense");
      case 19:
        return O("SuspenseList");
      case 0:
      case 2:
      case 15:
        return t = de(t.type, !1), t;
      case 11:
        return t = de(t.type.render, !1), t;
      case 1:
        return t = de(t.type, !0), t;
      default:
        return "";
    }
  }
  function ve(t) {
    if (t == null) return null;
    if (typeof t == "function") return t.displayName || t.name || null;
    if (typeof t == "string") return t;
    switch (t) {
      case Q:
        return "Fragment";
      case K:
        return "Portal";
      case W:
        return "Profiler";
      case $:
        return "StrictMode";
      case me:
        return "Suspense";
      case pe:
        return "SuspenseList";
    }
    if (typeof t == "object") switch (t.$$typeof) {
      case J:
        return (t.displayName || "Context") + ".Consumer";
      case X:
        return (t._context.displayName || "Context") + ".Provider";
      case ce:
        var r = t.render;
        return t = t.displayName, t || (t = r.displayName || r.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
      case we:
        return r = t.displayName || null, r !== null ? r : ve(t.type) || "Memo";
      case ue:
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
  function Re(t) {
    var r = t.type;
    return (t = t.nodeName) && t.toLowerCase() === "input" && (r === "checkbox" || r === "radio");
  }
  function gt(t) {
    var r = Re(t) ? "checked" : "value", s = Object.getOwnPropertyDescriptor(t.constructor.prototype, r), u = "" + t[r];
    if (!t.hasOwnProperty(r) && typeof s < "u" && typeof s.get == "function" && typeof s.set == "function") {
      var p = s.get, m = s.set;
      return Object.defineProperty(t, r, { configurable: !0, get: function() {
        return p.call(this);
      }, set: function(_) {
        u = "" + _, m.call(this, _);
      } }), Object.defineProperty(t, r, { enumerable: s.enumerable }), { getValue: function() {
        return u;
      }, setValue: function(_) {
        u = "" + _;
      }, stopTracking: function() {
        t._valueTracker = null, delete t[r];
      } };
    }
  }
  function To(t) {
    t._valueTracker || (t._valueTracker = gt(t));
  }
  function Ud(t) {
    if (!t) return !1;
    var r = t._valueTracker;
    if (!r) return !0;
    var s = r.getValue(), u = "";
    return t && (u = Re(t) ? t.checked ? "true" : "false" : t.value), t = u, t !== s ? (r.setValue(t), !0) : !1;
  }
  function ko(t) {
    if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u") return null;
    try {
      return t.activeElement || t.body;
    } catch {
      return t.body;
    }
  }
  function Ia(t, r) {
    var s = r.checked;
    return Y({}, r, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: s ?? t._wrapperState.initialChecked });
  }
  function $d(t, r) {
    var s = r.defaultValue == null ? "" : r.defaultValue, u = r.checked != null ? r.checked : r.defaultChecked;
    s = xe(r.value != null ? r.value : s), t._wrapperState = { initialChecked: u, initialValue: s, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function Hd(t, r) {
    r = r.checked, r != null && b(t, "checked", r, !1);
  }
  function Fa(t, r) {
    Hd(t, r);
    var s = xe(r.value), u = r.type;
    if (s != null) u === "number" ? (s === 0 && t.value === "" || t.value != s) && (t.value = "" + s) : t.value !== "" + s && (t.value = "" + s);
    else if (u === "submit" || u === "reset") {
      t.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? Oa(t, r.type, s) : r.hasOwnProperty("defaultValue") && Oa(t, r.type, xe(r.defaultValue)), r.checked == null && r.defaultChecked != null && (t.defaultChecked = !!r.defaultChecked);
  }
  function Wd(t, r, s) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var u = r.type;
      if (!(u !== "submit" && u !== "reset" || r.value !== void 0 && r.value !== null)) return;
      r = "" + t._wrapperState.initialValue, s || r === t.value || (t.value = r), t.defaultValue = r;
    }
    s = t.name, s !== "" && (t.name = ""), t.defaultChecked = !!t._wrapperState.initialChecked, s !== "" && (t.name = s);
  }
  function Oa(t, r, s) {
    (r !== "number" || ko(t.ownerDocument) !== t) && (s == null ? t.defaultValue = "" + t._wrapperState.initialValue : t.defaultValue !== "" + s && (t.defaultValue = "" + s));
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
  function La(t, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(i(91));
    return Y({}, r, { value: void 0, defaultValue: void 0, children: "" + t._wrapperState.initialValue });
  }
  function Gd(t, r) {
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
  function Kd(t, r) {
    var s = xe(r.value), u = xe(r.defaultValue);
    s != null && (s = "" + s, s !== t.value && (t.value = s), r.defaultValue == null && t.defaultValue !== s && (t.defaultValue = s)), u != null && (t.defaultValue = "" + u);
  }
  function Yd(t) {
    var r = t.textContent;
    r === t._wrapperState.initialValue && r !== "" && r !== null && (t.value = r);
  }
  function Qd(t) {
    switch (t) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Va(t, r) {
    return t == null || t === "http://www.w3.org/1999/xhtml" ? Qd(r) : t === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : t;
  }
  var Ao, Xd = (function(t) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, s, u, p) {
      MSApp.execUnsafeLocalFunction(function() {
        return t(r, s, u, p);
      });
    } : t;
  })(function(t, r) {
    if (t.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in t) t.innerHTML = r;
    else {
      for (Ao = Ao || document.createElement("div"), Ao.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>", r = Ao.firstChild; t.firstChild; ) t.removeChild(t.firstChild);
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
  }, fS = ["Webkit", "ms", "Moz", "O"];
  Object.keys(ui).forEach(function(t) {
    fS.forEach(function(r) {
      r = r + t.charAt(0).toUpperCase() + t.substring(1), ui[r] = ui[t];
    });
  });
  function Zd(t, r, s) {
    return r == null || typeof r == "boolean" || r === "" ? "" : s || typeof r != "number" || r === 0 || ui.hasOwnProperty(t) && ui[t] ? ("" + r).trim() : r + "px";
  }
  function Jd(t, r) {
    t = t.style;
    for (var s in r) if (r.hasOwnProperty(s)) {
      var u = s.indexOf("--") === 0, p = Zd(s, r[s], u);
      s === "float" && (s = "cssFloat"), u ? t.setProperty(s, p) : t[s] = p;
    }
  }
  var pS = Y({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Ba(t, r) {
    if (r) {
      if (pS[t] && (r.children != null || r.dangerouslySetInnerHTML != null)) throw Error(i(137, t));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null) throw Error(i(60));
        if (typeof r.dangerouslySetInnerHTML != "object" || !("__html" in r.dangerouslySetInnerHTML)) throw Error(i(61));
      }
      if (r.style != null && typeof r.style != "object") throw Error(i(62));
    }
  }
  function za(t, r) {
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
  var Ua = null;
  function $a(t) {
    return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
  }
  var Ha = null, gr = null, vr = null;
  function qd(t) {
    if (t = Ri(t)) {
      if (typeof Ha != "function") throw Error(i(280));
      var r = t.stateNode;
      r && (r = Yo(r), Ha(t.stateNode, t.type, r));
    }
  }
  function ef(t) {
    gr ? vr ? vr.push(t) : vr = [t] : gr = t;
  }
  function tf() {
    if (gr) {
      var t = gr, r = vr;
      if (vr = gr = null, qd(t), r) for (t = 0; t < r.length; t++) qd(r[t]);
    }
  }
  function nf(t, r) {
    return t(r);
  }
  function rf() {
  }
  var Wa = !1;
  function of(t, r, s) {
    if (Wa) return t(r, s);
    Wa = !0;
    try {
      return nf(t, r, s);
    } finally {
      Wa = !1, (gr !== null || vr !== null) && (rf(), tf());
    }
  }
  function ci(t, r) {
    var s = t.stateNode;
    if (s === null) return null;
    var u = Yo(s);
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
  var Ga = !1;
  if (f) try {
    var di = {};
    Object.defineProperty(di, "passive", { get: function() {
      Ga = !0;
    } }), window.addEventListener("test", di, di), window.removeEventListener("test", di, di);
  } catch {
    Ga = !1;
  }
  function hS(t, r, s, u, p, m, _, E, M) {
    var F = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(s, F);
    } catch (B) {
      this.onError(B);
    }
  }
  var fi = !1, Co = null, Eo = !1, Ka = null, mS = { onError: function(t) {
    fi = !0, Co = t;
  } };
  function yS(t, r, s, u, p, m, _, E, M) {
    fi = !1, Co = null, hS.apply(mS, arguments);
  }
  function gS(t, r, s, u, p, m, _, E, M) {
    if (yS.apply(this, arguments), fi) {
      if (fi) {
        var F = Co;
        fi = !1, Co = null;
      } else throw Error(i(198));
      Eo || (Eo = !0, Ka = F);
    }
  }
  function Gn(t) {
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
  function sf(t) {
    if (t.tag === 13) {
      var r = t.memoizedState;
      if (r === null && (t = t.alternate, t !== null && (r = t.memoizedState)), r !== null) return r.dehydrated;
    }
    return null;
  }
  function af(t) {
    if (Gn(t) !== t) throw Error(i(188));
  }
  function vS(t) {
    var r = t.alternate;
    if (!r) {
      if (r = Gn(t), r === null) throw Error(i(188));
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
          if (m === s) return af(p), t;
          if (m === u) return af(p), r;
          m = m.sibling;
        }
        throw Error(i(188));
      }
      if (s.return !== u.return) s = p, u = m;
      else {
        for (var _ = !1, E = p.child; E; ) {
          if (E === s) {
            _ = !0, s = p, u = m;
            break;
          }
          if (E === u) {
            _ = !0, u = p, s = m;
            break;
          }
          E = E.sibling;
        }
        if (!_) {
          for (E = m.child; E; ) {
            if (E === s) {
              _ = !0, s = m, u = p;
              break;
            }
            if (E === u) {
              _ = !0, u = m, s = p;
              break;
            }
            E = E.sibling;
          }
          if (!_) throw Error(i(189));
        }
      }
      if (s.alternate !== u) throw Error(i(190));
    }
    if (s.tag !== 3) throw Error(i(188));
    return s.stateNode.current === s ? t : r;
  }
  function lf(t) {
    return t = vS(t), t !== null ? uf(t) : null;
  }
  function uf(t) {
    if (t.tag === 5 || t.tag === 6) return t;
    for (t = t.child; t !== null; ) {
      var r = uf(t);
      if (r !== null) return r;
      t = t.sibling;
    }
    return null;
  }
  var cf = n.unstable_scheduleCallback, df = n.unstable_cancelCallback, SS = n.unstable_shouldYield, wS = n.unstable_requestPaint, Oe = n.unstable_now, xS = n.unstable_getCurrentPriorityLevel, Ya = n.unstable_ImmediatePriority, ff = n.unstable_UserBlockingPriority, Po = n.unstable_NormalPriority, _S = n.unstable_LowPriority, pf = n.unstable_IdlePriority, bo = null, Ht = null;
  function TS(t) {
    if (Ht && typeof Ht.onCommitFiberRoot == "function") try {
      Ht.onCommitFiberRoot(bo, t, void 0, (t.current.flags & 128) === 128);
    } catch {
    }
  }
  var Rt = Math.clz32 ? Math.clz32 : CS, kS = Math.log, AS = Math.LN2;
  function CS(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (kS(t) / AS | 0) | 0;
  }
  var Mo = 64, Ro = 4194304;
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
  function No(t, r) {
    var s = t.pendingLanes;
    if (s === 0) return 0;
    var u = 0, p = t.suspendedLanes, m = t.pingedLanes, _ = s & 268435455;
    if (_ !== 0) {
      var E = _ & ~p;
      E !== 0 ? u = pi(E) : (m &= _, m !== 0 && (u = pi(m)));
    } else _ = s & ~p, _ !== 0 ? u = pi(_) : m !== 0 && (u = pi(m));
    if (u === 0) return 0;
    if (r !== 0 && r !== u && (r & p) === 0 && (p = u & -u, m = r & -r, p >= m || p === 16 && (m & 4194240) !== 0)) return r;
    if ((u & 4) !== 0 && (u |= s & 16), r = t.entangledLanes, r !== 0) for (t = t.entanglements, r &= u; 0 < r; ) s = 31 - Rt(r), p = 1 << s, u |= t[s], r &= ~p;
    return u;
  }
  function ES(t, r) {
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
  function PS(t, r) {
    for (var s = t.suspendedLanes, u = t.pingedLanes, p = t.expirationTimes, m = t.pendingLanes; 0 < m; ) {
      var _ = 31 - Rt(m), E = 1 << _, M = p[_];
      M === -1 ? ((E & s) === 0 || (E & u) !== 0) && (p[_] = ES(E, r)) : M <= r && (t.expiredLanes |= E), m &= ~E;
    }
  }
  function Qa(t) {
    return t = t.pendingLanes & -1073741825, t !== 0 ? t : t & 1073741824 ? 1073741824 : 0;
  }
  function hf() {
    var t = Mo;
    return Mo <<= 1, (Mo & 4194240) === 0 && (Mo = 64), t;
  }
  function Xa(t) {
    for (var r = [], s = 0; 31 > s; s++) r.push(t);
    return r;
  }
  function hi(t, r, s) {
    t.pendingLanes |= r, r !== 536870912 && (t.suspendedLanes = 0, t.pingedLanes = 0), t = t.eventTimes, r = 31 - Rt(r), t[r] = s;
  }
  function bS(t, r) {
    var s = t.pendingLanes & ~r;
    t.pendingLanes = r, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= r, t.mutableReadLanes &= r, t.entangledLanes &= r, r = t.entanglements;
    var u = t.eventTimes;
    for (t = t.expirationTimes; 0 < s; ) {
      var p = 31 - Rt(s), m = 1 << p;
      r[p] = 0, u[p] = -1, t[p] = -1, s &= ~m;
    }
  }
  function Za(t, r) {
    var s = t.entangledLanes |= r;
    for (t = t.entanglements; s; ) {
      var u = 31 - Rt(s), p = 1 << u;
      p & r | t[u] & r && (t[u] |= r), s &= ~p;
    }
  }
  var _e = 0;
  function mf(t) {
    return t &= -t, 1 < t ? 4 < t ? (t & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var yf, Ja, gf, vf, Sf, qa = !1, Do = [], gn = null, vn = null, Sn = null, mi = /* @__PURE__ */ new Map(), yi = /* @__PURE__ */ new Map(), wn = [], MS = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function wf(t, r) {
    switch (t) {
      case "focusin":
      case "focusout":
        gn = null;
        break;
      case "dragenter":
      case "dragleave":
        vn = null;
        break;
      case "mouseover":
      case "mouseout":
        Sn = null;
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
    return t === null || t.nativeEvent !== m ? (t = { blockedOn: r, domEventName: s, eventSystemFlags: u, nativeEvent: m, targetContainers: [p] }, r !== null && (r = Ri(r), r !== null && Ja(r)), t) : (t.eventSystemFlags |= u, r = t.targetContainers, p !== null && r.indexOf(p) === -1 && r.push(p), t);
  }
  function RS(t, r, s, u, p) {
    switch (r) {
      case "focusin":
        return gn = gi(gn, t, r, s, u, p), !0;
      case "dragenter":
        return vn = gi(vn, t, r, s, u, p), !0;
      case "mouseover":
        return Sn = gi(Sn, t, r, s, u, p), !0;
      case "pointerover":
        var m = p.pointerId;
        return mi.set(m, gi(mi.get(m) || null, t, r, s, u, p)), !0;
      case "gotpointercapture":
        return m = p.pointerId, yi.set(m, gi(yi.get(m) || null, t, r, s, u, p)), !0;
    }
    return !1;
  }
  function xf(t) {
    var r = Kn(t.target);
    if (r !== null) {
      var s = Gn(r);
      if (s !== null) {
        if (r = s.tag, r === 13) {
          if (r = sf(s), r !== null) {
            t.blockedOn = r, Sf(t.priority, function() {
              gf(s);
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
  function jo(t) {
    if (t.blockedOn !== null) return !1;
    for (var r = t.targetContainers; 0 < r.length; ) {
      var s = tl(t.domEventName, t.eventSystemFlags, r[0], t.nativeEvent);
      if (s === null) {
        s = t.nativeEvent;
        var u = new s.constructor(s.type, s);
        Ua = u, s.target.dispatchEvent(u), Ua = null;
      } else return r = Ri(s), r !== null && Ja(r), t.blockedOn = s, !1;
      r.shift();
    }
    return !0;
  }
  function _f(t, r, s) {
    jo(t) && s.delete(r);
  }
  function NS() {
    qa = !1, gn !== null && jo(gn) && (gn = null), vn !== null && jo(vn) && (vn = null), Sn !== null && jo(Sn) && (Sn = null), mi.forEach(_f), yi.forEach(_f);
  }
  function vi(t, r) {
    t.blockedOn === r && (t.blockedOn = null, qa || (qa = !0, n.unstable_scheduleCallback(n.unstable_NormalPriority, NS)));
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
    for (gn !== null && vi(gn, t), vn !== null && vi(vn, t), Sn !== null && vi(Sn, t), mi.forEach(r), yi.forEach(r), s = 0; s < wn.length; s++) u = wn[s], u.blockedOn === t && (u.blockedOn = null);
    for (; 0 < wn.length && (s = wn[0], s.blockedOn === null); ) xf(s), s.blockedOn === null && wn.shift();
  }
  var Sr = D.ReactCurrentBatchConfig, Io = !0;
  function DS(t, r, s, u) {
    var p = _e, m = Sr.transition;
    Sr.transition = null;
    try {
      _e = 1, el(t, r, s, u);
    } finally {
      _e = p, Sr.transition = m;
    }
  }
  function jS(t, r, s, u) {
    var p = _e, m = Sr.transition;
    Sr.transition = null;
    try {
      _e = 4, el(t, r, s, u);
    } finally {
      _e = p, Sr.transition = m;
    }
  }
  function el(t, r, s, u) {
    if (Io) {
      var p = tl(t, r, s, u);
      if (p === null) vl(t, r, u, Fo, s), wf(t, u);
      else if (RS(p, t, r, s, u)) u.stopPropagation();
      else if (wf(t, u), r & 4 && -1 < MS.indexOf(t)) {
        for (; p !== null; ) {
          var m = Ri(p);
          if (m !== null && yf(m), m = tl(t, r, s, u), m === null && vl(t, r, u, Fo, s), m === p) break;
          p = m;
        }
        p !== null && u.stopPropagation();
      } else vl(t, r, u, null, s);
    }
  }
  var Fo = null;
  function tl(t, r, s, u) {
    if (Fo = null, t = $a(u), t = Kn(t), t !== null) if (r = Gn(t), r === null) t = null;
    else if (s = r.tag, s === 13) {
      if (t = sf(r), t !== null) return t;
      t = null;
    } else if (s === 3) {
      if (r.stateNode.current.memoizedState.isDehydrated) return r.tag === 3 ? r.stateNode.containerInfo : null;
      t = null;
    } else r !== t && (t = null);
    return Fo = t, null;
  }
  function Tf(t) {
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
        switch (xS()) {
          case Ya:
            return 1;
          case ff:
            return 4;
          case Po:
          case _S:
            return 16;
          case pf:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var xn = null, nl = null, Oo = null;
  function kf() {
    if (Oo) return Oo;
    var t, r = nl, s = r.length, u, p = "value" in xn ? xn.value : xn.textContent, m = p.length;
    for (t = 0; t < s && r[t] === p[t]; t++) ;
    var _ = s - t;
    for (u = 1; u <= _ && r[s - u] === p[m - u]; u++) ;
    return Oo = p.slice(t, 1 < u ? 1 - u : void 0);
  }
  function Lo(t) {
    var r = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && r === 13 && (t = 13)) : t = r, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function Vo() {
    return !0;
  }
  function Af() {
    return !1;
  }
  function vt(t) {
    function r(s, u, p, m, _) {
      this._reactName = s, this._targetInst = p, this.type = u, this.nativeEvent = m, this.target = _, this.currentTarget = null;
      for (var E in t) t.hasOwnProperty(E) && (s = t[E], this[E] = s ? s(m) : m[E]);
      return this.isDefaultPrevented = (m.defaultPrevented != null ? m.defaultPrevented : m.returnValue === !1) ? Vo : Af, this.isPropagationStopped = Af, this;
    }
    return Y(r.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var s = this.nativeEvent;
      s && (s.preventDefault ? s.preventDefault() : typeof s.returnValue != "unknown" && (s.returnValue = !1), this.isDefaultPrevented = Vo);
    }, stopPropagation: function() {
      var s = this.nativeEvent;
      s && (s.stopPropagation ? s.stopPropagation() : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0), this.isPropagationStopped = Vo);
    }, persist: function() {
    }, isPersistent: Vo }), r;
  }
  var wr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(t) {
    return t.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, rl = vt(wr), wi = Y({}, wr, { view: 0, detail: 0 }), IS = vt(wi), il, ol, xi, Bo = Y({}, wi, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: al, button: 0, buttons: 0, relatedTarget: function(t) {
    return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
  }, movementX: function(t) {
    return "movementX" in t ? t.movementX : (t !== xi && (xi && t.type === "mousemove" ? (il = t.screenX - xi.screenX, ol = t.screenY - xi.screenY) : ol = il = 0, xi = t), il);
  }, movementY: function(t) {
    return "movementY" in t ? t.movementY : ol;
  } }), Cf = vt(Bo), FS = Y({}, Bo, { dataTransfer: 0 }), OS = vt(FS), LS = Y({}, wi, { relatedTarget: 0 }), sl = vt(LS), VS = Y({}, wr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), BS = vt(VS), zS = Y({}, wr, { clipboardData: function(t) {
    return "clipboardData" in t ? t.clipboardData : window.clipboardData;
  } }), US = vt(zS), $S = Y({}, wr, { data: 0 }), Ef = vt($S), HS = {
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
  }, WS = {
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
  }, GS = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function KS(t) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(t) : (t = GS[t]) ? !!r[t] : !1;
  }
  function al() {
    return KS;
  }
  var YS = Y({}, wi, { key: function(t) {
    if (t.key) {
      var r = HS[t.key] || t.key;
      if (r !== "Unidentified") return r;
    }
    return t.type === "keypress" ? (t = Lo(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? WS[t.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: al, charCode: function(t) {
    return t.type === "keypress" ? Lo(t) : 0;
  }, keyCode: function(t) {
    return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  }, which: function(t) {
    return t.type === "keypress" ? Lo(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  } }), QS = vt(YS), XS = Y({}, Bo, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Pf = vt(XS), ZS = Y({}, wi, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: al }), JS = vt(ZS), qS = Y({}, wr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), ew = vt(qS), tw = Y({}, Bo, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), nw = vt(tw), rw = [9, 13, 27, 32], ll = f && "CompositionEvent" in window, _i = null;
  f && "documentMode" in document && (_i = document.documentMode);
  var iw = f && "TextEvent" in window && !_i, bf = f && (!ll || _i && 8 < _i && 11 >= _i), Mf = " ", Rf = !1;
  function Nf(t, r) {
    switch (t) {
      case "keyup":
        return rw.indexOf(r.keyCode) !== -1;
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
  function Df(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var xr = !1;
  function ow(t, r) {
    switch (t) {
      case "compositionend":
        return Df(r);
      case "keypress":
        return r.which !== 32 ? null : (Rf = !0, Mf);
      case "textInput":
        return t = r.data, t === Mf && Rf ? null : t;
      default:
        return null;
    }
  }
  function sw(t, r) {
    if (xr) return t === "compositionend" || !ll && Nf(t, r) ? (t = kf(), Oo = nl = xn = null, xr = !1, t) : null;
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
        return bf && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var aw = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function jf(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r === "input" ? !!aw[t.type] : r === "textarea";
  }
  function If(t, r, s, u) {
    ef(u), r = Wo(r, "onChange"), 0 < r.length && (s = new rl("onChange", "change", null, s, u), t.push({ event: s, listeners: r }));
  }
  var Ti = null, ki = null;
  function lw(t) {
    qf(t, 0);
  }
  function zo(t) {
    var r = Cr(t);
    if (Ud(r)) return t;
  }
  function uw(t, r) {
    if (t === "change") return r;
  }
  var Ff = !1;
  if (f) {
    var ul;
    if (f) {
      var cl = "oninput" in document;
      if (!cl) {
        var Of = document.createElement("div");
        Of.setAttribute("oninput", "return;"), cl = typeof Of.oninput == "function";
      }
      ul = cl;
    } else ul = !1;
    Ff = ul && (!document.documentMode || 9 < document.documentMode);
  }
  function Lf() {
    Ti && (Ti.detachEvent("onpropertychange", Vf), ki = Ti = null);
  }
  function Vf(t) {
    if (t.propertyName === "value" && zo(ki)) {
      var r = [];
      If(r, ki, t, $a(t)), of(lw, r);
    }
  }
  function cw(t, r, s) {
    t === "focusin" ? (Lf(), Ti = r, ki = s, Ti.attachEvent("onpropertychange", Vf)) : t === "focusout" && Lf();
  }
  function dw(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown") return zo(ki);
  }
  function fw(t, r) {
    if (t === "click") return zo(r);
  }
  function pw(t, r) {
    if (t === "input" || t === "change") return zo(r);
  }
  function hw(t, r) {
    return t === r && (t !== 0 || 1 / t === 1 / r) || t !== t && r !== r;
  }
  var Nt = typeof Object.is == "function" ? Object.is : hw;
  function Ai(t, r) {
    if (Nt(t, r)) return !0;
    if (typeof t != "object" || t === null || typeof r != "object" || r === null) return !1;
    var s = Object.keys(t), u = Object.keys(r);
    if (s.length !== u.length) return !1;
    for (u = 0; u < s.length; u++) {
      var p = s[u];
      if (!y.call(r, p) || !Nt(t[p], r[p])) return !1;
    }
    return !0;
  }
  function Bf(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function zf(t, r) {
    var s = Bf(t);
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
      s = Bf(s);
    }
  }
  function Uf(t, r) {
    return t && r ? t === r ? !0 : t && t.nodeType === 3 ? !1 : r && r.nodeType === 3 ? Uf(t, r.parentNode) : "contains" in t ? t.contains(r) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function $f() {
    for (var t = window, r = ko(); r instanceof t.HTMLIFrameElement; ) {
      try {
        var s = typeof r.contentWindow.location.href == "string";
      } catch {
        s = !1;
      }
      if (s) t = r.contentWindow;
      else break;
      r = ko(t.document);
    }
    return r;
  }
  function dl(t) {
    var r = t && t.nodeName && t.nodeName.toLowerCase();
    return r && (r === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || r === "textarea" || t.contentEditable === "true");
  }
  function mw(t) {
    var r = $f(), s = t.focusedElem, u = t.selectionRange;
    if (r !== s && s && s.ownerDocument && Uf(s.ownerDocument.documentElement, s)) {
      if (u !== null && dl(s)) {
        if (r = u.start, t = u.end, t === void 0 && (t = r), "selectionStart" in s) s.selectionStart = r, s.selectionEnd = Math.min(t, s.value.length);
        else if (t = (r = s.ownerDocument || document) && r.defaultView || window, t.getSelection) {
          t = t.getSelection();
          var p = s.textContent.length, m = Math.min(u.start, p);
          u = u.end === void 0 ? m : Math.min(u.end, p), !t.extend && m > u && (p = u, u = m, m = p), p = zf(s, m);
          var _ = zf(
            s,
            u
          );
          p && _ && (t.rangeCount !== 1 || t.anchorNode !== p.node || t.anchorOffset !== p.offset || t.focusNode !== _.node || t.focusOffset !== _.offset) && (r = r.createRange(), r.setStart(p.node, p.offset), t.removeAllRanges(), m > u ? (t.addRange(r), t.extend(_.node, _.offset)) : (r.setEnd(_.node, _.offset), t.addRange(r)));
        }
      }
      for (r = [], t = s; t = t.parentNode; ) t.nodeType === 1 && r.push({ element: t, left: t.scrollLeft, top: t.scrollTop });
      for (typeof s.focus == "function" && s.focus(), s = 0; s < r.length; s++) t = r[s], t.element.scrollLeft = t.left, t.element.scrollTop = t.top;
    }
  }
  var yw = f && "documentMode" in document && 11 >= document.documentMode, _r = null, fl = null, Ci = null, pl = !1;
  function Hf(t, r, s) {
    var u = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument;
    pl || _r == null || _r !== ko(u) || (u = _r, "selectionStart" in u && dl(u) ? u = { start: u.selectionStart, end: u.selectionEnd } : (u = (u.ownerDocument && u.ownerDocument.defaultView || window).getSelection(), u = { anchorNode: u.anchorNode, anchorOffset: u.anchorOffset, focusNode: u.focusNode, focusOffset: u.focusOffset }), Ci && Ai(Ci, u) || (Ci = u, u = Wo(fl, "onSelect"), 0 < u.length && (r = new rl("onSelect", "select", null, r, s), t.push({ event: r, listeners: u }), r.target = _r)));
  }
  function Uo(t, r) {
    var s = {};
    return s[t.toLowerCase()] = r.toLowerCase(), s["Webkit" + t] = "webkit" + r, s["Moz" + t] = "moz" + r, s;
  }
  var Tr = { animationend: Uo("Animation", "AnimationEnd"), animationiteration: Uo("Animation", "AnimationIteration"), animationstart: Uo("Animation", "AnimationStart"), transitionend: Uo("Transition", "TransitionEnd") }, hl = {}, Wf = {};
  f && (Wf = document.createElement("div").style, "AnimationEvent" in window || (delete Tr.animationend.animation, delete Tr.animationiteration.animation, delete Tr.animationstart.animation), "TransitionEvent" in window || delete Tr.transitionend.transition);
  function $o(t) {
    if (hl[t]) return hl[t];
    if (!Tr[t]) return t;
    var r = Tr[t], s;
    for (s in r) if (r.hasOwnProperty(s) && s in Wf) return hl[t] = r[s];
    return t;
  }
  var Gf = $o("animationend"), Kf = $o("animationiteration"), Yf = $o("animationstart"), Qf = $o("transitionend"), Xf = /* @__PURE__ */ new Map(), Zf = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function _n(t, r) {
    Xf.set(t, r), c(r, [t]);
  }
  for (var ml = 0; ml < Zf.length; ml++) {
    var yl = Zf[ml], gw = yl.toLowerCase(), vw = yl[0].toUpperCase() + yl.slice(1);
    _n(gw, "on" + vw);
  }
  _n(Gf, "onAnimationEnd"), _n(Kf, "onAnimationIteration"), _n(Yf, "onAnimationStart"), _n("dblclick", "onDoubleClick"), _n("focusin", "onFocus"), _n("focusout", "onBlur"), _n(Qf, "onTransitionEnd"), d("onMouseEnter", ["mouseout", "mouseover"]), d("onMouseLeave", ["mouseout", "mouseover"]), d("onPointerEnter", ["pointerout", "pointerover"]), d("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Ei = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Sw = new Set("cancel close invalid load scroll toggle".split(" ").concat(Ei));
  function Jf(t, r, s) {
    var u = t.type || "unknown-event";
    t.currentTarget = s, gS(u, r, void 0, t), t.currentTarget = null;
  }
  function qf(t, r) {
    r = (r & 4) !== 0;
    for (var s = 0; s < t.length; s++) {
      var u = t[s], p = u.event;
      u = u.listeners;
      e: {
        var m = void 0;
        if (r) for (var _ = u.length - 1; 0 <= _; _--) {
          var E = u[_], M = E.instance, F = E.currentTarget;
          if (E = E.listener, M !== m && p.isPropagationStopped()) break e;
          Jf(p, E, F), m = M;
        }
        else for (_ = 0; _ < u.length; _++) {
          if (E = u[_], M = E.instance, F = E.currentTarget, E = E.listener, M !== m && p.isPropagationStopped()) break e;
          Jf(p, E, F), m = M;
        }
      }
    }
    if (Eo) throw t = Ka, Eo = !1, Ka = null, t;
  }
  function Pe(t, r) {
    var s = r[kl];
    s === void 0 && (s = r[kl] = /* @__PURE__ */ new Set());
    var u = t + "__bubble";
    s.has(u) || (ep(r, t, 2, !1), s.add(u));
  }
  function gl(t, r, s) {
    var u = 0;
    r && (u |= 4), ep(s, t, u, r);
  }
  var Ho = "_reactListening" + Math.random().toString(36).slice(2);
  function Pi(t) {
    if (!t[Ho]) {
      t[Ho] = !0, o.forEach(function(s) {
        s !== "selectionchange" && (Sw.has(s) || gl(s, !1, t), gl(s, !0, t));
      });
      var r = t.nodeType === 9 ? t : t.ownerDocument;
      r === null || r[Ho] || (r[Ho] = !0, gl("selectionchange", !1, r));
    }
  }
  function ep(t, r, s, u) {
    switch (Tf(r)) {
      case 1:
        var p = DS;
        break;
      case 4:
        p = jS;
        break;
      default:
        p = el;
    }
    s = p.bind(null, r, s, t), p = void 0, !Ga || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (p = !0), u ? p !== void 0 ? t.addEventListener(r, s, { capture: !0, passive: p }) : t.addEventListener(r, s, !0) : p !== void 0 ? t.addEventListener(r, s, { passive: p }) : t.addEventListener(r, s, !1);
  }
  function vl(t, r, s, u, p) {
    var m = u;
    if ((r & 1) === 0 && (r & 2) === 0 && u !== null) e: for (; ; ) {
      if (u === null) return;
      var _ = u.tag;
      if (_ === 3 || _ === 4) {
        var E = u.stateNode.containerInfo;
        if (E === p || E.nodeType === 8 && E.parentNode === p) break;
        if (_ === 4) for (_ = u.return; _ !== null; ) {
          var M = _.tag;
          if ((M === 3 || M === 4) && (M = _.stateNode.containerInfo, M === p || M.nodeType === 8 && M.parentNode === p)) return;
          _ = _.return;
        }
        for (; E !== null; ) {
          if (_ = Kn(E), _ === null) return;
          if (M = _.tag, M === 5 || M === 6) {
            u = m = _;
            continue e;
          }
          E = E.parentNode;
        }
      }
      u = u.return;
    }
    of(function() {
      var F = m, B = $a(s), U = [];
      e: {
        var V = Xf.get(t);
        if (V !== void 0) {
          var Z = rl, te = t;
          switch (t) {
            case "keypress":
              if (Lo(s) === 0) break e;
            case "keydown":
            case "keyup":
              Z = QS;
              break;
            case "focusin":
              te = "focus", Z = sl;
              break;
            case "focusout":
              te = "blur", Z = sl;
              break;
            case "beforeblur":
            case "afterblur":
              Z = sl;
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
              Z = Cf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              Z = OS;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              Z = JS;
              break;
            case Gf:
            case Kf:
            case Yf:
              Z = BS;
              break;
            case Qf:
              Z = ew;
              break;
            case "scroll":
              Z = IS;
              break;
            case "wheel":
              Z = nw;
              break;
            case "copy":
            case "cut":
            case "paste":
              Z = US;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              Z = Pf;
          }
          var re = (r & 4) !== 0, Le = !re && t === "scroll", j = re ? V !== null ? V + "Capture" : null : V;
          re = [];
          for (var N = F, I; N !== null; ) {
            I = N;
            var H = I.stateNode;
            if (I.tag === 5 && H !== null && (I = H, j !== null && (H = ci(N, j), H != null && re.push(bi(N, H, I)))), Le) break;
            N = N.return;
          }
          0 < re.length && (V = new Z(V, te, null, s, B), U.push({ event: V, listeners: re }));
        }
      }
      if ((r & 7) === 0) {
        e: {
          if (V = t === "mouseover" || t === "pointerover", Z = t === "mouseout" || t === "pointerout", V && s !== Ua && (te = s.relatedTarget || s.fromElement) && (Kn(te) || te[rn])) break e;
          if ((Z || V) && (V = B.window === B ? B : (V = B.ownerDocument) ? V.defaultView || V.parentWindow : window, Z ? (te = s.relatedTarget || s.toElement, Z = F, te = te ? Kn(te) : null, te !== null && (Le = Gn(te), te !== Le || te.tag !== 5 && te.tag !== 6) && (te = null)) : (Z = null, te = F), Z !== te)) {
            if (re = Cf, H = "onMouseLeave", j = "onMouseEnter", N = "mouse", (t === "pointerout" || t === "pointerover") && (re = Pf, H = "onPointerLeave", j = "onPointerEnter", N = "pointer"), Le = Z == null ? V : Cr(Z), I = te == null ? V : Cr(te), V = new re(H, N + "leave", Z, s, B), V.target = Le, V.relatedTarget = I, H = null, Kn(B) === F && (re = new re(j, N + "enter", te, s, B), re.target = I, re.relatedTarget = Le, H = re), Le = H, Z && te) t: {
              for (re = Z, j = te, N = 0, I = re; I; I = kr(I)) N++;
              for (I = 0, H = j; H; H = kr(H)) I++;
              for (; 0 < N - I; ) re = kr(re), N--;
              for (; 0 < I - N; ) j = kr(j), I--;
              for (; N--; ) {
                if (re === j || j !== null && re === j.alternate) break t;
                re = kr(re), j = kr(j);
              }
              re = null;
            }
            else re = null;
            Z !== null && tp(U, V, Z, re, !1), te !== null && Le !== null && tp(U, Le, te, re, !0);
          }
        }
        e: {
          if (V = F ? Cr(F) : window, Z = V.nodeName && V.nodeName.toLowerCase(), Z === "select" || Z === "input" && V.type === "file") var ie = uw;
          else if (jf(V)) if (Ff) ie = pw;
          else {
            ie = dw;
            var oe = cw;
          }
          else (Z = V.nodeName) && Z.toLowerCase() === "input" && (V.type === "checkbox" || V.type === "radio") && (ie = fw);
          if (ie && (ie = ie(t, F))) {
            If(U, ie, s, B);
            break e;
          }
          oe && oe(t, V, F), t === "focusout" && (oe = V._wrapperState) && oe.controlled && V.type === "number" && Oa(V, "number", V.value);
        }
        switch (oe = F ? Cr(F) : window, t) {
          case "focusin":
            (jf(oe) || oe.contentEditable === "true") && (_r = oe, fl = F, Ci = null);
            break;
          case "focusout":
            Ci = fl = _r = null;
            break;
          case "mousedown":
            pl = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            pl = !1, Hf(U, s, B);
            break;
          case "selectionchange":
            if (yw) break;
          case "keydown":
          case "keyup":
            Hf(U, s, B);
        }
        var se;
        if (ll) e: {
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
        else xr ? Nf(t, s) && (le = "onCompositionEnd") : t === "keydown" && s.keyCode === 229 && (le = "onCompositionStart");
        le && (bf && s.locale !== "ko" && (xr || le !== "onCompositionStart" ? le === "onCompositionEnd" && xr && (se = kf()) : (xn = B, nl = "value" in xn ? xn.value : xn.textContent, xr = !0)), oe = Wo(F, le), 0 < oe.length && (le = new Ef(le, t, null, s, B), U.push({ event: le, listeners: oe }), se ? le.data = se : (se = Df(s), se !== null && (le.data = se)))), (se = iw ? ow(t, s) : sw(t, s)) && (F = Wo(F, "onBeforeInput"), 0 < F.length && (B = new Ef("onBeforeInput", "beforeinput", null, s, B), U.push({ event: B, listeners: F }), B.data = se));
      }
      qf(U, r);
    });
  }
  function bi(t, r, s) {
    return { instance: t, listener: r, currentTarget: s };
  }
  function Wo(t, r) {
    for (var s = r + "Capture", u = []; t !== null; ) {
      var p = t, m = p.stateNode;
      p.tag === 5 && m !== null && (p = m, m = ci(t, s), m != null && u.unshift(bi(t, m, p)), m = ci(t, r), m != null && u.push(bi(t, m, p))), t = t.return;
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
  function tp(t, r, s, u, p) {
    for (var m = r._reactName, _ = []; s !== null && s !== u; ) {
      var E = s, M = E.alternate, F = E.stateNode;
      if (M !== null && M === u) break;
      E.tag === 5 && F !== null && (E = F, p ? (M = ci(s, m), M != null && _.unshift(bi(s, M, E))) : p || (M = ci(s, m), M != null && _.push(bi(s, M, E)))), s = s.return;
    }
    _.length !== 0 && t.push({ event: r, listeners: _ });
  }
  var ww = /\r\n?/g, xw = /\u0000|\uFFFD/g;
  function np(t) {
    return (typeof t == "string" ? t : "" + t).replace(ww, `
`).replace(xw, "");
  }
  function Go(t, r, s) {
    if (r = np(r), np(t) !== r && s) throw Error(i(425));
  }
  function Ko() {
  }
  var Sl = null, wl = null;
  function xl(t, r) {
    return t === "textarea" || t === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var _l = typeof setTimeout == "function" ? setTimeout : void 0, _w = typeof clearTimeout == "function" ? clearTimeout : void 0, rp = typeof Promise == "function" ? Promise : void 0, Tw = typeof queueMicrotask == "function" ? queueMicrotask : typeof rp < "u" ? function(t) {
    return rp.resolve(null).then(t).catch(kw);
  } : _l;
  function kw(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function Tl(t, r) {
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
  function Tn(t) {
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
  function ip(t) {
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
  var Ar = Math.random().toString(36).slice(2), Wt = "__reactFiber$" + Ar, Mi = "__reactProps$" + Ar, rn = "__reactContainer$" + Ar, kl = "__reactEvents$" + Ar, Aw = "__reactListeners$" + Ar, Cw = "__reactHandles$" + Ar;
  function Kn(t) {
    var r = t[Wt];
    if (r) return r;
    for (var s = t.parentNode; s; ) {
      if (r = s[rn] || s[Wt]) {
        if (s = r.alternate, r.child !== null || s !== null && s.child !== null) for (t = ip(t); t !== null; ) {
          if (s = t[Wt]) return s;
          t = ip(t);
        }
        return r;
      }
      t = s, s = t.parentNode;
    }
    return null;
  }
  function Ri(t) {
    return t = t[Wt] || t[rn], !t || t.tag !== 5 && t.tag !== 6 && t.tag !== 13 && t.tag !== 3 ? null : t;
  }
  function Cr(t) {
    if (t.tag === 5 || t.tag === 6) return t.stateNode;
    throw Error(i(33));
  }
  function Yo(t) {
    return t[Mi] || null;
  }
  var Al = [], Er = -1;
  function kn(t) {
    return { current: t };
  }
  function be(t) {
    0 > Er || (t.current = Al[Er], Al[Er] = null, Er--);
  }
  function Ee(t, r) {
    Er++, Al[Er] = t.current, t.current = r;
  }
  var An = {}, Je = kn(An), at = kn(!1), Yn = An;
  function Pr(t, r) {
    var s = t.type.contextTypes;
    if (!s) return An;
    var u = t.stateNode;
    if (u && u.__reactInternalMemoizedUnmaskedChildContext === r) return u.__reactInternalMemoizedMaskedChildContext;
    var p = {}, m;
    for (m in s) p[m] = r[m];
    return u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = r, t.__reactInternalMemoizedMaskedChildContext = p), p;
  }
  function lt(t) {
    return t = t.childContextTypes, t != null;
  }
  function Qo() {
    be(at), be(Je);
  }
  function op(t, r, s) {
    if (Je.current !== An) throw Error(i(168));
    Ee(Je, r), Ee(at, s);
  }
  function sp(t, r, s) {
    var u = t.stateNode;
    if (r = r.childContextTypes, typeof u.getChildContext != "function") return s;
    u = u.getChildContext();
    for (var p in u) if (!(p in r)) throw Error(i(108, Ce(t) || "Unknown", p));
    return Y({}, s, u);
  }
  function Xo(t) {
    return t = (t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext || An, Yn = Je.current, Ee(Je, t), Ee(at, at.current), !0;
  }
  function ap(t, r, s) {
    var u = t.stateNode;
    if (!u) throw Error(i(169));
    s ? (t = sp(t, r, Yn), u.__reactInternalMemoizedMergedChildContext = t, be(at), be(Je), Ee(Je, t)) : be(at), Ee(at, s);
  }
  var on = null, Zo = !1, Cl = !1;
  function lp(t) {
    on === null ? on = [t] : on.push(t);
  }
  function Ew(t) {
    Zo = !0, lp(t);
  }
  function Cn() {
    if (!Cl && on !== null) {
      Cl = !0;
      var t = 0, r = _e;
      try {
        var s = on;
        for (_e = 1; t < s.length; t++) {
          var u = s[t];
          do
            u = u(!0);
          while (u !== null);
        }
        on = null, Zo = !1;
      } catch (p) {
        throw on !== null && (on = on.slice(t + 1)), cf(Ya, Cn), p;
      } finally {
        _e = r, Cl = !1;
      }
    }
    return null;
  }
  var br = [], Mr = 0, Jo = null, qo = 0, _t = [], Tt = 0, Qn = null, sn = 1, an = "";
  function Xn(t, r) {
    br[Mr++] = qo, br[Mr++] = Jo, Jo = t, qo = r;
  }
  function up(t, r, s) {
    _t[Tt++] = sn, _t[Tt++] = an, _t[Tt++] = Qn, Qn = t;
    var u = sn;
    t = an;
    var p = 32 - Rt(u) - 1;
    u &= ~(1 << p), s += 1;
    var m = 32 - Rt(r) + p;
    if (30 < m) {
      var _ = p - p % 5;
      m = (u & (1 << _) - 1).toString(32), u >>= _, p -= _, sn = 1 << 32 - Rt(r) + p | s << p | u, an = m + t;
    } else sn = 1 << m | s << p | u, an = t;
  }
  function El(t) {
    t.return !== null && (Xn(t, 1), up(t, 1, 0));
  }
  function Pl(t) {
    for (; t === Jo; ) Jo = br[--Mr], br[Mr] = null, qo = br[--Mr], br[Mr] = null;
    for (; t === Qn; ) Qn = _t[--Tt], _t[Tt] = null, an = _t[--Tt], _t[Tt] = null, sn = _t[--Tt], _t[Tt] = null;
  }
  var St = null, wt = null, Ne = !1, Dt = null;
  function cp(t, r) {
    var s = Et(5, null, null, 0);
    s.elementType = "DELETED", s.stateNode = r, s.return = t, r = t.deletions, r === null ? (t.deletions = [s], t.flags |= 16) : r.push(s);
  }
  function dp(t, r) {
    switch (t.tag) {
      case 5:
        var s = t.type;
        return r = r.nodeType !== 1 || s.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (t.stateNode = r, St = t, wt = Tn(r.firstChild), !0) : !1;
      case 6:
        return r = t.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (t.stateNode = r, St = t, wt = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (s = Qn !== null ? { id: sn, overflow: an } : null, t.memoizedState = { dehydrated: r, treeContext: s, retryLane: 1073741824 }, s = Et(18, null, null, 0), s.stateNode = r, s.return = t, t.child = s, St = t, wt = null, !0) : !1;
      default:
        return !1;
    }
  }
  function bl(t) {
    return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
  }
  function Ml(t) {
    if (Ne) {
      var r = wt;
      if (r) {
        var s = r;
        if (!dp(t, r)) {
          if (bl(t)) throw Error(i(418));
          r = Tn(s.nextSibling);
          var u = St;
          r && dp(t, r) ? cp(u, s) : (t.flags = t.flags & -4097 | 2, Ne = !1, St = t);
        }
      } else {
        if (bl(t)) throw Error(i(418));
        t.flags = t.flags & -4097 | 2, Ne = !1, St = t;
      }
    }
  }
  function fp(t) {
    for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; ) t = t.return;
    St = t;
  }
  function es(t) {
    if (t !== St) return !1;
    if (!Ne) return fp(t), Ne = !0, !1;
    var r;
    if ((r = t.tag !== 3) && !(r = t.tag !== 5) && (r = t.type, r = r !== "head" && r !== "body" && !xl(t.type, t.memoizedProps)), r && (r = wt)) {
      if (bl(t)) throw pp(), Error(i(418));
      for (; r; ) cp(t, r), r = Tn(r.nextSibling);
    }
    if (fp(t), t.tag === 13) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(i(317));
      e: {
        for (t = t.nextSibling, r = 0; t; ) {
          if (t.nodeType === 8) {
            var s = t.data;
            if (s === "/$") {
              if (r === 0) {
                wt = Tn(t.nextSibling);
                break e;
              }
              r--;
            } else s !== "$" && s !== "$!" && s !== "$?" || r++;
          }
          t = t.nextSibling;
        }
        wt = null;
      }
    } else wt = St ? Tn(t.stateNode.nextSibling) : null;
    return !0;
  }
  function pp() {
    for (var t = wt; t; ) t = Tn(t.nextSibling);
  }
  function Rr() {
    wt = St = null, Ne = !1;
  }
  function Rl(t) {
    Dt === null ? Dt = [t] : Dt.push(t);
  }
  var Pw = D.ReactCurrentBatchConfig;
  function Ni(t, r, s) {
    if (t = s.ref, t !== null && typeof t != "function" && typeof t != "object") {
      if (s._owner) {
        if (s = s._owner, s) {
          if (s.tag !== 1) throw Error(i(309));
          var u = s.stateNode;
        }
        if (!u) throw Error(i(147, t));
        var p = u, m = "" + t;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === m ? r.ref : (r = function(_) {
          var E = p.refs;
          _ === null ? delete E[m] : E[m] = _;
        }, r._stringRef = m, r);
      }
      if (typeof t != "string") throw Error(i(284));
      if (!s._owner) throw Error(i(290, t));
    }
    return t;
  }
  function ts(t, r) {
    throw t = Object.prototype.toString.call(r), Error(i(31, t === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : t));
  }
  function hp(t) {
    var r = t._init;
    return r(t._payload);
  }
  function mp(t) {
    function r(j, N) {
      if (t) {
        var I = j.deletions;
        I === null ? (j.deletions = [N], j.flags |= 16) : I.push(N);
      }
    }
    function s(j, N) {
      if (!t) return null;
      for (; N !== null; ) r(j, N), N = N.sibling;
      return null;
    }
    function u(j, N) {
      for (j = /* @__PURE__ */ new Map(); N !== null; ) N.key !== null ? j.set(N.key, N) : j.set(N.index, N), N = N.sibling;
      return j;
    }
    function p(j, N) {
      return j = jn(j, N), j.index = 0, j.sibling = null, j;
    }
    function m(j, N, I) {
      return j.index = I, t ? (I = j.alternate, I !== null ? (I = I.index, I < N ? (j.flags |= 2, N) : I) : (j.flags |= 2, N)) : (j.flags |= 1048576, N);
    }
    function _(j) {
      return t && j.alternate === null && (j.flags |= 2), j;
    }
    function E(j, N, I, H) {
      return N === null || N.tag !== 6 ? (N = _u(I, j.mode, H), N.return = j, N) : (N = p(N, I), N.return = j, N);
    }
    function M(j, N, I, H) {
      var ie = I.type;
      return ie === Q ? B(j, N, I.props.children, H, I.key) : N !== null && (N.elementType === ie || typeof ie == "object" && ie !== null && ie.$$typeof === ue && hp(ie) === N.type) ? (H = p(N, I.props), H.ref = Ni(j, N, I), H.return = j, H) : (H = As(I.type, I.key, I.props, null, j.mode, H), H.ref = Ni(j, N, I), H.return = j, H);
    }
    function F(j, N, I, H) {
      return N === null || N.tag !== 4 || N.stateNode.containerInfo !== I.containerInfo || N.stateNode.implementation !== I.implementation ? (N = Tu(I, j.mode, H), N.return = j, N) : (N = p(N, I.children || []), N.return = j, N);
    }
    function B(j, N, I, H, ie) {
      return N === null || N.tag !== 7 ? (N = ir(I, j.mode, H, ie), N.return = j, N) : (N = p(N, I), N.return = j, N);
    }
    function U(j, N, I) {
      if (typeof N == "string" && N !== "" || typeof N == "number") return N = _u("" + N, j.mode, I), N.return = j, N;
      if (typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case L:
            return I = As(N.type, N.key, N.props, null, j.mode, I), I.ref = Ni(j, null, N), I.return = j, I;
          case K:
            return N = Tu(N, j.mode, I), N.return = j, N;
          case ue:
            var H = N._init;
            return U(j, H(N._payload), I);
        }
        if (ai(N) || q(N)) return N = ir(N, j.mode, I, null), N.return = j, N;
        ts(j, N);
      }
      return null;
    }
    function V(j, N, I, H) {
      var ie = N !== null ? N.key : null;
      if (typeof I == "string" && I !== "" || typeof I == "number") return ie !== null ? null : E(j, N, "" + I, H);
      if (typeof I == "object" && I !== null) {
        switch (I.$$typeof) {
          case L:
            return I.key === ie ? M(j, N, I, H) : null;
          case K:
            return I.key === ie ? F(j, N, I, H) : null;
          case ue:
            return ie = I._init, V(
              j,
              N,
              ie(I._payload),
              H
            );
        }
        if (ai(I) || q(I)) return ie !== null ? null : B(j, N, I, H, null);
        ts(j, I);
      }
      return null;
    }
    function Z(j, N, I, H, ie) {
      if (typeof H == "string" && H !== "" || typeof H == "number") return j = j.get(I) || null, E(N, j, "" + H, ie);
      if (typeof H == "object" && H !== null) {
        switch (H.$$typeof) {
          case L:
            return j = j.get(H.key === null ? I : H.key) || null, M(N, j, H, ie);
          case K:
            return j = j.get(H.key === null ? I : H.key) || null, F(N, j, H, ie);
          case ue:
            var oe = H._init;
            return Z(j, N, I, oe(H._payload), ie);
        }
        if (ai(H) || q(H)) return j = j.get(I) || null, B(N, j, H, ie, null);
        ts(N, H);
      }
      return null;
    }
    function te(j, N, I, H) {
      for (var ie = null, oe = null, se = N, le = N = 0, Ge = null; se !== null && le < I.length; le++) {
        se.index > le ? (Ge = se, se = null) : Ge = se.sibling;
        var Se = V(j, se, I[le], H);
        if (Se === null) {
          se === null && (se = Ge);
          break;
        }
        t && se && Se.alternate === null && r(j, se), N = m(Se, N, le), oe === null ? ie = Se : oe.sibling = Se, oe = Se, se = Ge;
      }
      if (le === I.length) return s(j, se), Ne && Xn(j, le), ie;
      if (se === null) {
        for (; le < I.length; le++) se = U(j, I[le], H), se !== null && (N = m(se, N, le), oe === null ? ie = se : oe.sibling = se, oe = se);
        return Ne && Xn(j, le), ie;
      }
      for (se = u(j, se); le < I.length; le++) Ge = Z(se, j, le, I[le], H), Ge !== null && (t && Ge.alternate !== null && se.delete(Ge.key === null ? le : Ge.key), N = m(Ge, N, le), oe === null ? ie = Ge : oe.sibling = Ge, oe = Ge);
      return t && se.forEach(function(In) {
        return r(j, In);
      }), Ne && Xn(j, le), ie;
    }
    function re(j, N, I, H) {
      var ie = q(I);
      if (typeof ie != "function") throw Error(i(150));
      if (I = ie.call(I), I == null) throw Error(i(151));
      for (var oe = ie = null, se = N, le = N = 0, Ge = null, Se = I.next(); se !== null && !Se.done; le++, Se = I.next()) {
        se.index > le ? (Ge = se, se = null) : Ge = se.sibling;
        var In = V(j, se, Se.value, H);
        if (In === null) {
          se === null && (se = Ge);
          break;
        }
        t && se && In.alternate === null && r(j, se), N = m(In, N, le), oe === null ? ie = In : oe.sibling = In, oe = In, se = Ge;
      }
      if (Se.done) return s(
        j,
        se
      ), Ne && Xn(j, le), ie;
      if (se === null) {
        for (; !Se.done; le++, Se = I.next()) Se = U(j, Se.value, H), Se !== null && (N = m(Se, N, le), oe === null ? ie = Se : oe.sibling = Se, oe = Se);
        return Ne && Xn(j, le), ie;
      }
      for (se = u(j, se); !Se.done; le++, Se = I.next()) Se = Z(se, j, le, Se.value, H), Se !== null && (t && Se.alternate !== null && se.delete(Se.key === null ? le : Se.key), N = m(Se, N, le), oe === null ? ie = Se : oe.sibling = Se, oe = Se);
      return t && se.forEach(function(ax) {
        return r(j, ax);
      }), Ne && Xn(j, le), ie;
    }
    function Le(j, N, I, H) {
      if (typeof I == "object" && I !== null && I.type === Q && I.key === null && (I = I.props.children), typeof I == "object" && I !== null) {
        switch (I.$$typeof) {
          case L:
            e: {
              for (var ie = I.key, oe = N; oe !== null; ) {
                if (oe.key === ie) {
                  if (ie = I.type, ie === Q) {
                    if (oe.tag === 7) {
                      s(j, oe.sibling), N = p(oe, I.props.children), N.return = j, j = N;
                      break e;
                    }
                  } else if (oe.elementType === ie || typeof ie == "object" && ie !== null && ie.$$typeof === ue && hp(ie) === oe.type) {
                    s(j, oe.sibling), N = p(oe, I.props), N.ref = Ni(j, oe, I), N.return = j, j = N;
                    break e;
                  }
                  s(j, oe);
                  break;
                } else r(j, oe);
                oe = oe.sibling;
              }
              I.type === Q ? (N = ir(I.props.children, j.mode, H, I.key), N.return = j, j = N) : (H = As(I.type, I.key, I.props, null, j.mode, H), H.ref = Ni(j, N, I), H.return = j, j = H);
            }
            return _(j);
          case K:
            e: {
              for (oe = I.key; N !== null; ) {
                if (N.key === oe) if (N.tag === 4 && N.stateNode.containerInfo === I.containerInfo && N.stateNode.implementation === I.implementation) {
                  s(j, N.sibling), N = p(N, I.children || []), N.return = j, j = N;
                  break e;
                } else {
                  s(j, N);
                  break;
                }
                else r(j, N);
                N = N.sibling;
              }
              N = Tu(I, j.mode, H), N.return = j, j = N;
            }
            return _(j);
          case ue:
            return oe = I._init, Le(j, N, oe(I._payload), H);
        }
        if (ai(I)) return te(j, N, I, H);
        if (q(I)) return re(j, N, I, H);
        ts(j, I);
      }
      return typeof I == "string" && I !== "" || typeof I == "number" ? (I = "" + I, N !== null && N.tag === 6 ? (s(j, N.sibling), N = p(N, I), N.return = j, j = N) : (s(j, N), N = _u(I, j.mode, H), N.return = j, j = N), _(j)) : s(j, N);
    }
    return Le;
  }
  var Nr = mp(!0), yp = mp(!1), ns = kn(null), rs = null, Dr = null, Nl = null;
  function Dl() {
    Nl = Dr = rs = null;
  }
  function jl(t) {
    var r = ns.current;
    be(ns), t._currentValue = r;
  }
  function Il(t, r, s) {
    for (; t !== null; ) {
      var u = t.alternate;
      if ((t.childLanes & r) !== r ? (t.childLanes |= r, u !== null && (u.childLanes |= r)) : u !== null && (u.childLanes & r) !== r && (u.childLanes |= r), t === s) break;
      t = t.return;
    }
  }
  function jr(t, r) {
    rs = t, Nl = Dr = null, t = t.dependencies, t !== null && t.firstContext !== null && ((t.lanes & r) !== 0 && (ut = !0), t.firstContext = null);
  }
  function kt(t) {
    var r = t._currentValue;
    if (Nl !== t) if (t = { context: t, memoizedValue: r, next: null }, Dr === null) {
      if (rs === null) throw Error(i(308));
      Dr = t, rs.dependencies = { lanes: 0, firstContext: t };
    } else Dr = Dr.next = t;
    return r;
  }
  var Zn = null;
  function Fl(t) {
    Zn === null ? Zn = [t] : Zn.push(t);
  }
  function gp(t, r, s, u) {
    var p = r.interleaved;
    return p === null ? (s.next = s, Fl(r)) : (s.next = p.next, p.next = s), r.interleaved = s, ln(t, u);
  }
  function ln(t, r) {
    t.lanes |= r;
    var s = t.alternate;
    for (s !== null && (s.lanes |= r), s = t, t = t.return; t !== null; ) t.childLanes |= r, s = t.alternate, s !== null && (s.childLanes |= r), s = t, t = t.return;
    return s.tag === 3 ? s.stateNode : null;
  }
  var En = !1;
  function Ol(t) {
    t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function vp(t, r) {
    t = t.updateQueue, r.updateQueue === t && (r.updateQueue = { baseState: t.baseState, firstBaseUpdate: t.firstBaseUpdate, lastBaseUpdate: t.lastBaseUpdate, shared: t.shared, effects: t.effects });
  }
  function un(t, r) {
    return { eventTime: t, lane: r, tag: 0, payload: null, callback: null, next: null };
  }
  function Pn(t, r, s) {
    var u = t.updateQueue;
    if (u === null) return null;
    if (u = u.shared, (ye & 2) !== 0) {
      var p = u.pending;
      return p === null ? r.next = r : (r.next = p.next, p.next = r), u.pending = r, ln(t, s);
    }
    return p = u.interleaved, p === null ? (r.next = r, Fl(u)) : (r.next = p.next, p.next = r), u.interleaved = r, ln(t, s);
  }
  function is(t, r, s) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (s & 4194240) !== 0)) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, Za(t, s);
    }
  }
  function Sp(t, r) {
    var s = t.updateQueue, u = t.alternate;
    if (u !== null && (u = u.updateQueue, s === u)) {
      var p = null, m = null;
      if (s = s.firstBaseUpdate, s !== null) {
        do {
          var _ = { eventTime: s.eventTime, lane: s.lane, tag: s.tag, payload: s.payload, callback: s.callback, next: null };
          m === null ? p = m = _ : m = m.next = _, s = s.next;
        } while (s !== null);
        m === null ? p = m = r : m = m.next = r;
      } else p = m = r;
      s = { baseState: u.baseState, firstBaseUpdate: p, lastBaseUpdate: m, shared: u.shared, effects: u.effects }, t.updateQueue = s;
      return;
    }
    t = s.lastBaseUpdate, t === null ? s.firstBaseUpdate = r : t.next = r, s.lastBaseUpdate = r;
  }
  function os(t, r, s, u) {
    var p = t.updateQueue;
    En = !1;
    var m = p.firstBaseUpdate, _ = p.lastBaseUpdate, E = p.shared.pending;
    if (E !== null) {
      p.shared.pending = null;
      var M = E, F = M.next;
      M.next = null, _ === null ? m = F : _.next = F, _ = M;
      var B = t.alternate;
      B !== null && (B = B.updateQueue, E = B.lastBaseUpdate, E !== _ && (E === null ? B.firstBaseUpdate = F : E.next = F, B.lastBaseUpdate = M));
    }
    if (m !== null) {
      var U = p.baseState;
      _ = 0, B = F = M = null, E = m;
      do {
        var V = E.lane, Z = E.eventTime;
        if ((u & V) === V) {
          B !== null && (B = B.next = {
            eventTime: Z,
            lane: 0,
            tag: E.tag,
            payload: E.payload,
            callback: E.callback,
            next: null
          });
          e: {
            var te = t, re = E;
            switch (V = r, Z = s, re.tag) {
              case 1:
                if (te = re.payload, typeof te == "function") {
                  U = te.call(Z, U, V);
                  break e;
                }
                U = te;
                break e;
              case 3:
                te.flags = te.flags & -65537 | 128;
              case 0:
                if (te = re.payload, V = typeof te == "function" ? te.call(Z, U, V) : te, V == null) break e;
                U = Y({}, U, V);
                break e;
              case 2:
                En = !0;
            }
          }
          E.callback !== null && E.lane !== 0 && (t.flags |= 64, V = p.effects, V === null ? p.effects = [E] : V.push(E));
        } else Z = { eventTime: Z, lane: V, tag: E.tag, payload: E.payload, callback: E.callback, next: null }, B === null ? (F = B = Z, M = U) : B = B.next = Z, _ |= V;
        if (E = E.next, E === null) {
          if (E = p.shared.pending, E === null) break;
          V = E, E = V.next, V.next = null, p.lastBaseUpdate = V, p.shared.pending = null;
        }
      } while (!0);
      if (B === null && (M = U), p.baseState = M, p.firstBaseUpdate = F, p.lastBaseUpdate = B, r = p.shared.interleaved, r !== null) {
        p = r;
        do
          _ |= p.lane, p = p.next;
        while (p !== r);
      } else m === null && (p.shared.lanes = 0);
      er |= _, t.lanes = _, t.memoizedState = U;
    }
  }
  function wp(t, r, s) {
    if (t = r.effects, r.effects = null, t !== null) for (r = 0; r < t.length; r++) {
      var u = t[r], p = u.callback;
      if (p !== null) {
        if (u.callback = null, u = s, typeof p != "function") throw Error(i(191, p));
        p.call(u);
      }
    }
  }
  var Di = {}, Gt = kn(Di), ji = kn(Di), Ii = kn(Di);
  function Jn(t) {
    if (t === Di) throw Error(i(174));
    return t;
  }
  function Ll(t, r) {
    switch (Ee(Ii, r), Ee(ji, t), Ee(Gt, Di), t = r.nodeType, t) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : Va(null, "");
        break;
      default:
        t = t === 8 ? r.parentNode : r, r = t.namespaceURI || null, t = t.tagName, r = Va(r, t);
    }
    be(Gt), Ee(Gt, r);
  }
  function Ir() {
    be(Gt), be(ji), be(Ii);
  }
  function xp(t) {
    Jn(Ii.current);
    var r = Jn(Gt.current), s = Va(r, t.type);
    r !== s && (Ee(ji, t), Ee(Gt, s));
  }
  function Vl(t) {
    ji.current === t && (be(Gt), be(ji));
  }
  var De = kn(0);
  function ss(t) {
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
  var Bl = [];
  function zl() {
    for (var t = 0; t < Bl.length; t++) Bl[t]._workInProgressVersionPrimary = null;
    Bl.length = 0;
  }
  var as = D.ReactCurrentDispatcher, Ul = D.ReactCurrentBatchConfig, qn = 0, je = null, ze = null, He = null, ls = !1, Fi = !1, Oi = 0, bw = 0;
  function qe() {
    throw Error(i(321));
  }
  function $l(t, r) {
    if (r === null) return !1;
    for (var s = 0; s < r.length && s < t.length; s++) if (!Nt(t[s], r[s])) return !1;
    return !0;
  }
  function Hl(t, r, s, u, p, m) {
    if (qn = m, je = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, as.current = t === null || t.memoizedState === null ? Dw : jw, t = s(u, p), Fi) {
      m = 0;
      do {
        if (Fi = !1, Oi = 0, 25 <= m) throw Error(i(301));
        m += 1, He = ze = null, r.updateQueue = null, as.current = Iw, t = s(u, p);
      } while (Fi);
    }
    if (as.current = ds, r = ze !== null && ze.next !== null, qn = 0, He = ze = je = null, ls = !1, r) throw Error(i(300));
    return t;
  }
  function Wl() {
    var t = Oi !== 0;
    return Oi = 0, t;
  }
  function Kt() {
    var t = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return He === null ? je.memoizedState = He = t : He = He.next = t, He;
  }
  function At() {
    if (ze === null) {
      var t = je.alternate;
      t = t !== null ? t.memoizedState : null;
    } else t = ze.next;
    var r = He === null ? je.memoizedState : He.next;
    if (r !== null) He = r, ze = t;
    else {
      if (t === null) throw Error(i(310));
      ze = t, t = { memoizedState: ze.memoizedState, baseState: ze.baseState, baseQueue: ze.baseQueue, queue: ze.queue, next: null }, He === null ? je.memoizedState = He = t : He = He.next = t;
    }
    return He;
  }
  function Li(t, r) {
    return typeof r == "function" ? r(t) : r;
  }
  function Gl(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(i(311));
    s.lastRenderedReducer = t;
    var u = ze, p = u.baseQueue, m = s.pending;
    if (m !== null) {
      if (p !== null) {
        var _ = p.next;
        p.next = m.next, m.next = _;
      }
      u.baseQueue = p = m, s.pending = null;
    }
    if (p !== null) {
      m = p.next, u = u.baseState;
      var E = _ = null, M = null, F = m;
      do {
        var B = F.lane;
        if ((qn & B) === B) M !== null && (M = M.next = { lane: 0, action: F.action, hasEagerState: F.hasEagerState, eagerState: F.eagerState, next: null }), u = F.hasEagerState ? F.eagerState : t(u, F.action);
        else {
          var U = {
            lane: B,
            action: F.action,
            hasEagerState: F.hasEagerState,
            eagerState: F.eagerState,
            next: null
          };
          M === null ? (E = M = U, _ = u) : M = M.next = U, je.lanes |= B, er |= B;
        }
        F = F.next;
      } while (F !== null && F !== m);
      M === null ? _ = u : M.next = E, Nt(u, r.memoizedState) || (ut = !0), r.memoizedState = u, r.baseState = _, r.baseQueue = M, s.lastRenderedState = u;
    }
    if (t = s.interleaved, t !== null) {
      p = t;
      do
        m = p.lane, je.lanes |= m, er |= m, p = p.next;
      while (p !== t);
    } else p === null && (s.lanes = 0);
    return [r.memoizedState, s.dispatch];
  }
  function Kl(t) {
    var r = At(), s = r.queue;
    if (s === null) throw Error(i(311));
    s.lastRenderedReducer = t;
    var u = s.dispatch, p = s.pending, m = r.memoizedState;
    if (p !== null) {
      s.pending = null;
      var _ = p = p.next;
      do
        m = t(m, _.action), _ = _.next;
      while (_ !== p);
      Nt(m, r.memoizedState) || (ut = !0), r.memoizedState = m, r.baseQueue === null && (r.baseState = m), s.lastRenderedState = m;
    }
    return [m, u];
  }
  function _p() {
  }
  function Tp(t, r) {
    var s = je, u = At(), p = r(), m = !Nt(u.memoizedState, p);
    if (m && (u.memoizedState = p, ut = !0), u = u.queue, Yl(Cp.bind(null, s, u, t), [t]), u.getSnapshot !== r || m || He !== null && He.memoizedState.tag & 1) {
      if (s.flags |= 2048, Vi(9, Ap.bind(null, s, u, p, r), void 0, null), We === null) throw Error(i(349));
      (qn & 30) !== 0 || kp(s, r, p);
    }
    return p;
  }
  function kp(t, r, s) {
    t.flags |= 16384, t = { getSnapshot: r, value: s }, r = je.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, je.updateQueue = r, r.stores = [t]) : (s = r.stores, s === null ? r.stores = [t] : s.push(t));
  }
  function Ap(t, r, s, u) {
    r.value = s, r.getSnapshot = u, Ep(r) && Pp(t);
  }
  function Cp(t, r, s) {
    return s(function() {
      Ep(r) && Pp(t);
    });
  }
  function Ep(t) {
    var r = t.getSnapshot;
    t = t.value;
    try {
      var s = r();
      return !Nt(t, s);
    } catch {
      return !0;
    }
  }
  function Pp(t) {
    var r = ln(t, 1);
    r !== null && Ot(r, t, 1, -1);
  }
  function bp(t) {
    var r = Kt();
    return typeof t == "function" && (t = t()), r.memoizedState = r.baseState = t, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Li, lastRenderedState: t }, r.queue = t, t = t.dispatch = Nw.bind(null, je, t), [r.memoizedState, t];
  }
  function Vi(t, r, s, u) {
    return t = { tag: t, create: r, destroy: s, deps: u, next: null }, r = je.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, je.updateQueue = r, r.lastEffect = t.next = t) : (s = r.lastEffect, s === null ? r.lastEffect = t.next = t : (u = s.next, s.next = t, t.next = u, r.lastEffect = t)), t;
  }
  function Mp() {
    return At().memoizedState;
  }
  function us(t, r, s, u) {
    var p = Kt();
    je.flags |= t, p.memoizedState = Vi(1 | r, s, void 0, u === void 0 ? null : u);
  }
  function cs(t, r, s, u) {
    var p = At();
    u = u === void 0 ? null : u;
    var m = void 0;
    if (ze !== null) {
      var _ = ze.memoizedState;
      if (m = _.destroy, u !== null && $l(u, _.deps)) {
        p.memoizedState = Vi(r, s, m, u);
        return;
      }
    }
    je.flags |= t, p.memoizedState = Vi(1 | r, s, m, u);
  }
  function Rp(t, r) {
    return us(8390656, 8, t, r);
  }
  function Yl(t, r) {
    return cs(2048, 8, t, r);
  }
  function Np(t, r) {
    return cs(4, 2, t, r);
  }
  function Dp(t, r) {
    return cs(4, 4, t, r);
  }
  function jp(t, r) {
    if (typeof r == "function") return t = t(), r(t), function() {
      r(null);
    };
    if (r != null) return t = t(), r.current = t, function() {
      r.current = null;
    };
  }
  function Ip(t, r, s) {
    return s = s != null ? s.concat([t]) : null, cs(4, 4, jp.bind(null, r, t), s);
  }
  function Ql() {
  }
  function Fp(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && $l(r, u[1]) ? u[0] : (s.memoizedState = [t, r], t);
  }
  function Op(t, r) {
    var s = At();
    r = r === void 0 ? null : r;
    var u = s.memoizedState;
    return u !== null && r !== null && $l(r, u[1]) ? u[0] : (t = t(), s.memoizedState = [t, r], t);
  }
  function Lp(t, r, s) {
    return (qn & 21) === 0 ? (t.baseState && (t.baseState = !1, ut = !0), t.memoizedState = s) : (Nt(s, r) || (s = hf(), je.lanes |= s, er |= s, t.baseState = !0), r);
  }
  function Mw(t, r) {
    var s = _e;
    _e = s !== 0 && 4 > s ? s : 4, t(!0);
    var u = Ul.transition;
    Ul.transition = {};
    try {
      t(!1), r();
    } finally {
      _e = s, Ul.transition = u;
    }
  }
  function Vp() {
    return At().memoizedState;
  }
  function Rw(t, r, s) {
    var u = Nn(t);
    if (s = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null }, Bp(t)) zp(r, s);
    else if (s = gp(t, r, s, u), s !== null) {
      var p = rt();
      Ot(s, t, u, p), Up(s, r, u);
    }
  }
  function Nw(t, r, s) {
    var u = Nn(t), p = { lane: u, action: s, hasEagerState: !1, eagerState: null, next: null };
    if (Bp(t)) zp(r, p);
    else {
      var m = t.alternate;
      if (t.lanes === 0 && (m === null || m.lanes === 0) && (m = r.lastRenderedReducer, m !== null)) try {
        var _ = r.lastRenderedState, E = m(_, s);
        if (p.hasEagerState = !0, p.eagerState = E, Nt(E, _)) {
          var M = r.interleaved;
          M === null ? (p.next = p, Fl(r)) : (p.next = M.next, M.next = p), r.interleaved = p;
          return;
        }
      } catch {
      } finally {
      }
      s = gp(t, r, p, u), s !== null && (p = rt(), Ot(s, t, u, p), Up(s, r, u));
    }
  }
  function Bp(t) {
    var r = t.alternate;
    return t === je || r !== null && r === je;
  }
  function zp(t, r) {
    Fi = ls = !0;
    var s = t.pending;
    s === null ? r.next = r : (r.next = s.next, s.next = r), t.pending = r;
  }
  function Up(t, r, s) {
    if ((s & 4194240) !== 0) {
      var u = r.lanes;
      u &= t.pendingLanes, s |= u, r.lanes = s, Za(t, s);
    }
  }
  var ds = { readContext: kt, useCallback: qe, useContext: qe, useEffect: qe, useImperativeHandle: qe, useInsertionEffect: qe, useLayoutEffect: qe, useMemo: qe, useReducer: qe, useRef: qe, useState: qe, useDebugValue: qe, useDeferredValue: qe, useTransition: qe, useMutableSource: qe, useSyncExternalStore: qe, useId: qe, unstable_isNewReconciler: !1 }, Dw = { readContext: kt, useCallback: function(t, r) {
    return Kt().memoizedState = [t, r === void 0 ? null : r], t;
  }, useContext: kt, useEffect: Rp, useImperativeHandle: function(t, r, s) {
    return s = s != null ? s.concat([t]) : null, us(
      4194308,
      4,
      jp.bind(null, r, t),
      s
    );
  }, useLayoutEffect: function(t, r) {
    return us(4194308, 4, t, r);
  }, useInsertionEffect: function(t, r) {
    return us(4, 2, t, r);
  }, useMemo: function(t, r) {
    var s = Kt();
    return r = r === void 0 ? null : r, t = t(), s.memoizedState = [t, r], t;
  }, useReducer: function(t, r, s) {
    var u = Kt();
    return r = s !== void 0 ? s(r) : r, u.memoizedState = u.baseState = r, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: r }, u.queue = t, t = t.dispatch = Rw.bind(null, je, t), [u.memoizedState, t];
  }, useRef: function(t) {
    var r = Kt();
    return t = { current: t }, r.memoizedState = t;
  }, useState: bp, useDebugValue: Ql, useDeferredValue: function(t) {
    return Kt().memoizedState = t;
  }, useTransition: function() {
    var t = bp(!1), r = t[0];
    return t = Mw.bind(null, t[1]), Kt().memoizedState = t, [r, t];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(t, r, s) {
    var u = je, p = Kt();
    if (Ne) {
      if (s === void 0) throw Error(i(407));
      s = s();
    } else {
      if (s = r(), We === null) throw Error(i(349));
      (qn & 30) !== 0 || kp(u, r, s);
    }
    p.memoizedState = s;
    var m = { value: s, getSnapshot: r };
    return p.queue = m, Rp(Cp.bind(
      null,
      u,
      m,
      t
    ), [t]), u.flags |= 2048, Vi(9, Ap.bind(null, u, m, s, r), void 0, null), s;
  }, useId: function() {
    var t = Kt(), r = We.identifierPrefix;
    if (Ne) {
      var s = an, u = sn;
      s = (u & ~(1 << 32 - Rt(u) - 1)).toString(32) + s, r = ":" + r + "R" + s, s = Oi++, 0 < s && (r += "H" + s.toString(32)), r += ":";
    } else s = bw++, r = ":" + r + "r" + s.toString(32) + ":";
    return t.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, jw = {
    readContext: kt,
    useCallback: Fp,
    useContext: kt,
    useEffect: Yl,
    useImperativeHandle: Ip,
    useInsertionEffect: Np,
    useLayoutEffect: Dp,
    useMemo: Op,
    useReducer: Gl,
    useRef: Mp,
    useState: function() {
      return Gl(Li);
    },
    useDebugValue: Ql,
    useDeferredValue: function(t) {
      var r = At();
      return Lp(r, ze.memoizedState, t);
    },
    useTransition: function() {
      var t = Gl(Li)[0], r = At().memoizedState;
      return [t, r];
    },
    useMutableSource: _p,
    useSyncExternalStore: Tp,
    useId: Vp,
    unstable_isNewReconciler: !1
  }, Iw = { readContext: kt, useCallback: Fp, useContext: kt, useEffect: Yl, useImperativeHandle: Ip, useInsertionEffect: Np, useLayoutEffect: Dp, useMemo: Op, useReducer: Kl, useRef: Mp, useState: function() {
    return Kl(Li);
  }, useDebugValue: Ql, useDeferredValue: function(t) {
    var r = At();
    return ze === null ? r.memoizedState = t : Lp(r, ze.memoizedState, t);
  }, useTransition: function() {
    var t = Kl(Li)[0], r = At().memoizedState;
    return [t, r];
  }, useMutableSource: _p, useSyncExternalStore: Tp, useId: Vp, unstable_isNewReconciler: !1 };
  function jt(t, r) {
    if (t && t.defaultProps) {
      r = Y({}, r), t = t.defaultProps;
      for (var s in t) r[s] === void 0 && (r[s] = t[s]);
      return r;
    }
    return r;
  }
  function Xl(t, r, s, u) {
    r = t.memoizedState, s = s(u, r), s = s == null ? r : Y({}, r, s), t.memoizedState = s, t.lanes === 0 && (t.updateQueue.baseState = s);
  }
  var fs = { isMounted: function(t) {
    return (t = t._reactInternals) ? Gn(t) === t : !1;
  }, enqueueSetState: function(t, r, s) {
    t = t._reactInternals;
    var u = rt(), p = Nn(t), m = un(u, p);
    m.payload = r, s != null && (m.callback = s), r = Pn(t, m, p), r !== null && (Ot(r, t, p, u), is(r, t, p));
  }, enqueueReplaceState: function(t, r, s) {
    t = t._reactInternals;
    var u = rt(), p = Nn(t), m = un(u, p);
    m.tag = 1, m.payload = r, s != null && (m.callback = s), r = Pn(t, m, p), r !== null && (Ot(r, t, p, u), is(r, t, p));
  }, enqueueForceUpdate: function(t, r) {
    t = t._reactInternals;
    var s = rt(), u = Nn(t), p = un(s, u);
    p.tag = 2, r != null && (p.callback = r), r = Pn(t, p, u), r !== null && (Ot(r, t, u, s), is(r, t, u));
  } };
  function $p(t, r, s, u, p, m, _) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(u, m, _) : r.prototype && r.prototype.isPureReactComponent ? !Ai(s, u) || !Ai(p, m) : !0;
  }
  function Hp(t, r, s) {
    var u = !1, p = An, m = r.contextType;
    return typeof m == "object" && m !== null ? m = kt(m) : (p = lt(r) ? Yn : Je.current, u = r.contextTypes, m = (u = u != null) ? Pr(t, p) : An), r = new r(s, m), t.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = fs, t.stateNode = r, r._reactInternals = t, u && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = p, t.__reactInternalMemoizedMaskedChildContext = m), r;
  }
  function Wp(t, r, s, u) {
    t = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(s, u), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(s, u), r.state !== t && fs.enqueueReplaceState(r, r.state, null);
  }
  function Zl(t, r, s, u) {
    var p = t.stateNode;
    p.props = s, p.state = t.memoizedState, p.refs = {}, Ol(t);
    var m = r.contextType;
    typeof m == "object" && m !== null ? p.context = kt(m) : (m = lt(r) ? Yn : Je.current, p.context = Pr(t, m)), p.state = t.memoizedState, m = r.getDerivedStateFromProps, typeof m == "function" && (Xl(t, r, m, s), p.state = t.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof p.getSnapshotBeforeUpdate == "function" || typeof p.UNSAFE_componentWillMount != "function" && typeof p.componentWillMount != "function" || (r = p.state, typeof p.componentWillMount == "function" && p.componentWillMount(), typeof p.UNSAFE_componentWillMount == "function" && p.UNSAFE_componentWillMount(), r !== p.state && fs.enqueueReplaceState(p, p.state, null), os(t, s, p, u), p.state = t.memoizedState), typeof p.componentDidMount == "function" && (t.flags |= 4194308);
  }
  function Fr(t, r) {
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
  function Jl(t, r, s) {
    return { value: t, source: null, stack: s ?? null, digest: r ?? null };
  }
  function ql(t, r) {
    try {
      console.error(r.value);
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  var Fw = typeof WeakMap == "function" ? WeakMap : Map;
  function Gp(t, r, s) {
    s = un(-1, s), s.tag = 3, s.payload = { element: null };
    var u = r.value;
    return s.callback = function() {
      Ss || (Ss = !0, hu = u), ql(t, r);
    }, s;
  }
  function Kp(t, r, s) {
    s = un(-1, s), s.tag = 3;
    var u = t.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var p = r.value;
      s.payload = function() {
        return u(p);
      }, s.callback = function() {
        ql(t, r);
      };
    }
    var m = t.stateNode;
    return m !== null && typeof m.componentDidCatch == "function" && (s.callback = function() {
      ql(t, r), typeof u != "function" && (Mn === null ? Mn = /* @__PURE__ */ new Set([this]) : Mn.add(this));
      var _ = r.stack;
      this.componentDidCatch(r.value, { componentStack: _ !== null ? _ : "" });
    }), s;
  }
  function Yp(t, r, s) {
    var u = t.pingCache;
    if (u === null) {
      u = t.pingCache = new Fw();
      var p = /* @__PURE__ */ new Set();
      u.set(r, p);
    } else p = u.get(r), p === void 0 && (p = /* @__PURE__ */ new Set(), u.set(r, p));
    p.has(s) || (p.add(s), t = Xw.bind(null, t, r, s), r.then(t, t));
  }
  function Qp(t) {
    do {
      var r;
      if ((r = t.tag === 13) && (r = t.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r) return t;
      t = t.return;
    } while (t !== null);
    return null;
  }
  function Xp(t, r, s, u, p) {
    return (t.mode & 1) === 0 ? (t === r ? t.flags |= 65536 : (t.flags |= 128, s.flags |= 131072, s.flags &= -52805, s.tag === 1 && (s.alternate === null ? s.tag = 17 : (r = un(-1, 1), r.tag = 2, Pn(s, r, 1))), s.lanes |= 1), t) : (t.flags |= 65536, t.lanes = p, t);
  }
  var Ow = D.ReactCurrentOwner, ut = !1;
  function nt(t, r, s, u) {
    r.child = t === null ? yp(r, null, s, u) : Nr(r, t.child, s, u);
  }
  function Zp(t, r, s, u, p) {
    s = s.render;
    var m = r.ref;
    return jr(r, p), u = Hl(t, r, s, u, m, p), s = Wl(), t !== null && !ut ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~p, cn(t, r, p)) : (Ne && s && El(r), r.flags |= 1, nt(t, r, u, p), r.child);
  }
  function Jp(t, r, s, u, p) {
    if (t === null) {
      var m = s.type;
      return typeof m == "function" && !xu(m) && m.defaultProps === void 0 && s.compare === null && s.defaultProps === void 0 ? (r.tag = 15, r.type = m, qp(t, r, m, u, p)) : (t = As(s.type, null, u, r, r.mode, p), t.ref = r.ref, t.return = r, r.child = t);
    }
    if (m = t.child, (t.lanes & p) === 0) {
      var _ = m.memoizedProps;
      if (s = s.compare, s = s !== null ? s : Ai, s(_, u) && t.ref === r.ref) return cn(t, r, p);
    }
    return r.flags |= 1, t = jn(m, u), t.ref = r.ref, t.return = r, r.child = t;
  }
  function qp(t, r, s, u, p) {
    if (t !== null) {
      var m = t.memoizedProps;
      if (Ai(m, u) && t.ref === r.ref) if (ut = !1, r.pendingProps = u = m, (t.lanes & p) !== 0) (t.flags & 131072) !== 0 && (ut = !0);
      else return r.lanes = t.lanes, cn(t, r, p);
    }
    return eu(t, r, s, u, p);
  }
  function eh(t, r, s) {
    var u = r.pendingProps, p = u.children, m = t !== null ? t.memoizedState : null;
    if (u.mode === "hidden") if ((r.mode & 1) === 0) r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Ee(Lr, xt), xt |= s;
    else {
      if ((s & 1073741824) === 0) return t = m !== null ? m.baseLanes | s : s, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: t, cachePool: null, transitions: null }, r.updateQueue = null, Ee(Lr, xt), xt |= t, null;
      r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, u = m !== null ? m.baseLanes : s, Ee(Lr, xt), xt |= u;
    }
    else m !== null ? (u = m.baseLanes | s, r.memoizedState = null) : u = s, Ee(Lr, xt), xt |= u;
    return nt(t, r, p, s), r.child;
  }
  function th(t, r) {
    var s = r.ref;
    (t === null && s !== null || t !== null && t.ref !== s) && (r.flags |= 512, r.flags |= 2097152);
  }
  function eu(t, r, s, u, p) {
    var m = lt(s) ? Yn : Je.current;
    return m = Pr(r, m), jr(r, p), s = Hl(t, r, s, u, m, p), u = Wl(), t !== null && !ut ? (r.updateQueue = t.updateQueue, r.flags &= -2053, t.lanes &= ~p, cn(t, r, p)) : (Ne && u && El(r), r.flags |= 1, nt(t, r, s, p), r.child);
  }
  function nh(t, r, s, u, p) {
    if (lt(s)) {
      var m = !0;
      Xo(r);
    } else m = !1;
    if (jr(r, p), r.stateNode === null) hs(t, r), Hp(r, s, u), Zl(r, s, u, p), u = !0;
    else if (t === null) {
      var _ = r.stateNode, E = r.memoizedProps;
      _.props = E;
      var M = _.context, F = s.contextType;
      typeof F == "object" && F !== null ? F = kt(F) : (F = lt(s) ? Yn : Je.current, F = Pr(r, F));
      var B = s.getDerivedStateFromProps, U = typeof B == "function" || typeof _.getSnapshotBeforeUpdate == "function";
      U || typeof _.UNSAFE_componentWillReceiveProps != "function" && typeof _.componentWillReceiveProps != "function" || (E !== u || M !== F) && Wp(r, _, u, F), En = !1;
      var V = r.memoizedState;
      _.state = V, os(r, u, _, p), M = r.memoizedState, E !== u || V !== M || at.current || En ? (typeof B == "function" && (Xl(r, s, B, u), M = r.memoizedState), (E = En || $p(r, s, E, u, V, M, F)) ? (U || typeof _.UNSAFE_componentWillMount != "function" && typeof _.componentWillMount != "function" || (typeof _.componentWillMount == "function" && _.componentWillMount(), typeof _.UNSAFE_componentWillMount == "function" && _.UNSAFE_componentWillMount()), typeof _.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof _.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = u, r.memoizedState = M), _.props = u, _.state = M, _.context = F, u = E) : (typeof _.componentDidMount == "function" && (r.flags |= 4194308), u = !1);
    } else {
      _ = r.stateNode, vp(t, r), E = r.memoizedProps, F = r.type === r.elementType ? E : jt(r.type, E), _.props = F, U = r.pendingProps, V = _.context, M = s.contextType, typeof M == "object" && M !== null ? M = kt(M) : (M = lt(s) ? Yn : Je.current, M = Pr(r, M));
      var Z = s.getDerivedStateFromProps;
      (B = typeof Z == "function" || typeof _.getSnapshotBeforeUpdate == "function") || typeof _.UNSAFE_componentWillReceiveProps != "function" && typeof _.componentWillReceiveProps != "function" || (E !== U || V !== M) && Wp(r, _, u, M), En = !1, V = r.memoizedState, _.state = V, os(r, u, _, p);
      var te = r.memoizedState;
      E !== U || V !== te || at.current || En ? (typeof Z == "function" && (Xl(r, s, Z, u), te = r.memoizedState), (F = En || $p(r, s, F, u, V, te, M) || !1) ? (B || typeof _.UNSAFE_componentWillUpdate != "function" && typeof _.componentWillUpdate != "function" || (typeof _.componentWillUpdate == "function" && _.componentWillUpdate(u, te, M), typeof _.UNSAFE_componentWillUpdate == "function" && _.UNSAFE_componentWillUpdate(u, te, M)), typeof _.componentDidUpdate == "function" && (r.flags |= 4), typeof _.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof _.componentDidUpdate != "function" || E === t.memoizedProps && V === t.memoizedState || (r.flags |= 4), typeof _.getSnapshotBeforeUpdate != "function" || E === t.memoizedProps && V === t.memoizedState || (r.flags |= 1024), r.memoizedProps = u, r.memoizedState = te), _.props = u, _.state = te, _.context = M, u = F) : (typeof _.componentDidUpdate != "function" || E === t.memoizedProps && V === t.memoizedState || (r.flags |= 4), typeof _.getSnapshotBeforeUpdate != "function" || E === t.memoizedProps && V === t.memoizedState || (r.flags |= 1024), u = !1);
    }
    return tu(t, r, s, u, m, p);
  }
  function tu(t, r, s, u, p, m) {
    th(t, r);
    var _ = (r.flags & 128) !== 0;
    if (!u && !_) return p && ap(r, s, !1), cn(t, r, m);
    u = r.stateNode, Ow.current = r;
    var E = _ && typeof s.getDerivedStateFromError != "function" ? null : u.render();
    return r.flags |= 1, t !== null && _ ? (r.child = Nr(r, t.child, null, m), r.child = Nr(r, null, E, m)) : nt(t, r, E, m), r.memoizedState = u.state, p && ap(r, s, !0), r.child;
  }
  function rh(t) {
    var r = t.stateNode;
    r.pendingContext ? op(t, r.pendingContext, r.pendingContext !== r.context) : r.context && op(t, r.context, !1), Ll(t, r.containerInfo);
  }
  function ih(t, r, s, u, p) {
    return Rr(), Rl(p), r.flags |= 256, nt(t, r, s, u), r.child;
  }
  var nu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function ru(t) {
    return { baseLanes: t, cachePool: null, transitions: null };
  }
  function oh(t, r, s) {
    var u = r.pendingProps, p = De.current, m = !1, _ = (r.flags & 128) !== 0, E;
    if ((E = _) || (E = t !== null && t.memoizedState === null ? !1 : (p & 2) !== 0), E ? (m = !0, r.flags &= -129) : (t === null || t.memoizedState !== null) && (p |= 1), Ee(De, p & 1), t === null)
      return Ml(r), t = r.memoizedState, t !== null && (t = t.dehydrated, t !== null) ? ((r.mode & 1) === 0 ? r.lanes = 1 : t.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824, null) : (_ = u.children, t = u.fallback, m ? (u = r.mode, m = r.child, _ = { mode: "hidden", children: _ }, (u & 1) === 0 && m !== null ? (m.childLanes = 0, m.pendingProps = _) : m = Cs(_, u, 0, null), t = ir(t, u, s, null), m.return = r, t.return = r, m.sibling = t, r.child = m, r.child.memoizedState = ru(s), r.memoizedState = nu, t) : iu(r, _));
    if (p = t.memoizedState, p !== null && (E = p.dehydrated, E !== null)) return Lw(t, r, _, u, E, p, s);
    if (m) {
      m = u.fallback, _ = r.mode, p = t.child, E = p.sibling;
      var M = { mode: "hidden", children: u.children };
      return (_ & 1) === 0 && r.child !== p ? (u = r.child, u.childLanes = 0, u.pendingProps = M, r.deletions = null) : (u = jn(p, M), u.subtreeFlags = p.subtreeFlags & 14680064), E !== null ? m = jn(E, m) : (m = ir(m, _, s, null), m.flags |= 2), m.return = r, u.return = r, u.sibling = m, r.child = u, u = m, m = r.child, _ = t.child.memoizedState, _ = _ === null ? ru(s) : { baseLanes: _.baseLanes | s, cachePool: null, transitions: _.transitions }, m.memoizedState = _, m.childLanes = t.childLanes & ~s, r.memoizedState = nu, u;
    }
    return m = t.child, t = m.sibling, u = jn(m, { mode: "visible", children: u.children }), (r.mode & 1) === 0 && (u.lanes = s), u.return = r, u.sibling = null, t !== null && (s = r.deletions, s === null ? (r.deletions = [t], r.flags |= 16) : s.push(t)), r.child = u, r.memoizedState = null, u;
  }
  function iu(t, r) {
    return r = Cs({ mode: "visible", children: r }, t.mode, 0, null), r.return = t, t.child = r;
  }
  function ps(t, r, s, u) {
    return u !== null && Rl(u), Nr(r, t.child, null, s), t = iu(r, r.pendingProps.children), t.flags |= 2, r.memoizedState = null, t;
  }
  function Lw(t, r, s, u, p, m, _) {
    if (s)
      return r.flags & 256 ? (r.flags &= -257, u = Jl(Error(i(422))), ps(t, r, _, u)) : r.memoizedState !== null ? (r.child = t.child, r.flags |= 128, null) : (m = u.fallback, p = r.mode, u = Cs({ mode: "visible", children: u.children }, p, 0, null), m = ir(m, p, _, null), m.flags |= 2, u.return = r, m.return = r, u.sibling = m, r.child = u, (r.mode & 1) !== 0 && Nr(r, t.child, null, _), r.child.memoizedState = ru(_), r.memoizedState = nu, m);
    if ((r.mode & 1) === 0) return ps(t, r, _, null);
    if (p.data === "$!") {
      if (u = p.nextSibling && p.nextSibling.dataset, u) var E = u.dgst;
      return u = E, m = Error(i(419)), u = Jl(m, u, void 0), ps(t, r, _, u);
    }
    if (E = (_ & t.childLanes) !== 0, ut || E) {
      if (u = We, u !== null) {
        switch (_ & -_) {
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
        p = (p & (u.suspendedLanes | _)) !== 0 ? 0 : p, p !== 0 && p !== m.retryLane && (m.retryLane = p, ln(t, p), Ot(u, t, p, -1));
      }
      return wu(), u = Jl(Error(i(421))), ps(t, r, _, u);
    }
    return p.data === "$?" ? (r.flags |= 128, r.child = t.child, r = Zw.bind(null, t), p._reactRetry = r, null) : (t = m.treeContext, wt = Tn(p.nextSibling), St = r, Ne = !0, Dt = null, t !== null && (_t[Tt++] = sn, _t[Tt++] = an, _t[Tt++] = Qn, sn = t.id, an = t.overflow, Qn = r), r = iu(r, u.children), r.flags |= 4096, r);
  }
  function sh(t, r, s) {
    t.lanes |= r;
    var u = t.alternate;
    u !== null && (u.lanes |= r), Il(t.return, r, s);
  }
  function ou(t, r, s, u, p) {
    var m = t.memoizedState;
    m === null ? t.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: u, tail: s, tailMode: p } : (m.isBackwards = r, m.rendering = null, m.renderingStartTime = 0, m.last = u, m.tail = s, m.tailMode = p);
  }
  function ah(t, r, s) {
    var u = r.pendingProps, p = u.revealOrder, m = u.tail;
    if (nt(t, r, u.children, s), u = De.current, (u & 2) !== 0) u = u & 1 | 2, r.flags |= 128;
    else {
      if (t !== null && (t.flags & 128) !== 0) e: for (t = r.child; t !== null; ) {
        if (t.tag === 13) t.memoizedState !== null && sh(t, s, r);
        else if (t.tag === 19) sh(t, s, r);
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
    if (Ee(De, u), (r.mode & 1) === 0) r.memoizedState = null;
    else switch (p) {
      case "forwards":
        for (s = r.child, p = null; s !== null; ) t = s.alternate, t !== null && ss(t) === null && (p = s), s = s.sibling;
        s = p, s === null ? (p = r.child, r.child = null) : (p = s.sibling, s.sibling = null), ou(r, !1, p, s, m);
        break;
      case "backwards":
        for (s = null, p = r.child, r.child = null; p !== null; ) {
          if (t = p.alternate, t !== null && ss(t) === null) {
            r.child = p;
            break;
          }
          t = p.sibling, p.sibling = s, s = p, p = t;
        }
        ou(r, !0, s, null, m);
        break;
      case "together":
        ou(r, !1, null, null, void 0);
        break;
      default:
        r.memoizedState = null;
    }
    return r.child;
  }
  function hs(t, r) {
    (r.mode & 1) === 0 && t !== null && (t.alternate = null, r.alternate = null, r.flags |= 2);
  }
  function cn(t, r, s) {
    if (t !== null && (r.dependencies = t.dependencies), er |= r.lanes, (s & r.childLanes) === 0) return null;
    if (t !== null && r.child !== t.child) throw Error(i(153));
    if (r.child !== null) {
      for (t = r.child, s = jn(t, t.pendingProps), r.child = s, s.return = r; t.sibling !== null; ) t = t.sibling, s = s.sibling = jn(t, t.pendingProps), s.return = r;
      s.sibling = null;
    }
    return r.child;
  }
  function Vw(t, r, s) {
    switch (r.tag) {
      case 3:
        rh(r), Rr();
        break;
      case 5:
        xp(r);
        break;
      case 1:
        lt(r.type) && Xo(r);
        break;
      case 4:
        Ll(r, r.stateNode.containerInfo);
        break;
      case 10:
        var u = r.type._context, p = r.memoizedProps.value;
        Ee(ns, u._currentValue), u._currentValue = p;
        break;
      case 13:
        if (u = r.memoizedState, u !== null)
          return u.dehydrated !== null ? (Ee(De, De.current & 1), r.flags |= 128, null) : (s & r.child.childLanes) !== 0 ? oh(t, r, s) : (Ee(De, De.current & 1), t = cn(t, r, s), t !== null ? t.sibling : null);
        Ee(De, De.current & 1);
        break;
      case 19:
        if (u = (s & r.childLanes) !== 0, (t.flags & 128) !== 0) {
          if (u) return ah(t, r, s);
          r.flags |= 128;
        }
        if (p = r.memoizedState, p !== null && (p.rendering = null, p.tail = null, p.lastEffect = null), Ee(De, De.current), u) break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, eh(t, r, s);
    }
    return cn(t, r, s);
  }
  var lh, su, uh, ch;
  lh = function(t, r) {
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
  }, su = function() {
  }, uh = function(t, r, s, u) {
    var p = t.memoizedProps;
    if (p !== u) {
      t = r.stateNode, Jn(Gt.current);
      var m = null;
      switch (s) {
        case "input":
          p = Ia(t, p), u = Ia(t, u), m = [];
          break;
        case "select":
          p = Y({}, p, { value: void 0 }), u = Y({}, u, { value: void 0 }), m = [];
          break;
        case "textarea":
          p = La(t, p), u = La(t, u), m = [];
          break;
        default:
          typeof p.onClick != "function" && typeof u.onClick == "function" && (t.onclick = Ko);
      }
      Ba(s, u);
      var _;
      s = null;
      for (F in p) if (!u.hasOwnProperty(F) && p.hasOwnProperty(F) && p[F] != null) if (F === "style") {
        var E = p[F];
        for (_ in E) E.hasOwnProperty(_) && (s || (s = {}), s[_] = "");
      } else F !== "dangerouslySetInnerHTML" && F !== "children" && F !== "suppressContentEditableWarning" && F !== "suppressHydrationWarning" && F !== "autoFocus" && (a.hasOwnProperty(F) ? m || (m = []) : (m = m || []).push(F, null));
      for (F in u) {
        var M = u[F];
        if (E = p != null ? p[F] : void 0, u.hasOwnProperty(F) && M !== E && (M != null || E != null)) if (F === "style") if (E) {
          for (_ in E) !E.hasOwnProperty(_) || M && M.hasOwnProperty(_) || (s || (s = {}), s[_] = "");
          for (_ in M) M.hasOwnProperty(_) && E[_] !== M[_] && (s || (s = {}), s[_] = M[_]);
        } else s || (m || (m = []), m.push(
          F,
          s
        )), s = M;
        else F === "dangerouslySetInnerHTML" ? (M = M ? M.__html : void 0, E = E ? E.__html : void 0, M != null && E !== M && (m = m || []).push(F, M)) : F === "children" ? typeof M != "string" && typeof M != "number" || (m = m || []).push(F, "" + M) : F !== "suppressContentEditableWarning" && F !== "suppressHydrationWarning" && (a.hasOwnProperty(F) ? (M != null && F === "onScroll" && Pe("scroll", t), m || E === M || (m = [])) : (m = m || []).push(F, M));
      }
      s && (m = m || []).push("style", s);
      var F = m;
      (r.updateQueue = F) && (r.flags |= 4);
    }
  }, ch = function(t, r, s, u) {
    s !== u && (r.flags |= 4);
  };
  function Bi(t, r) {
    if (!Ne) switch (t.tailMode) {
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
  function et(t) {
    var r = t.alternate !== null && t.alternate.child === t.child, s = 0, u = 0;
    if (r) for (var p = t.child; p !== null; ) s |= p.lanes | p.childLanes, u |= p.subtreeFlags & 14680064, u |= p.flags & 14680064, p.return = t, p = p.sibling;
    else for (p = t.child; p !== null; ) s |= p.lanes | p.childLanes, u |= p.subtreeFlags, u |= p.flags, p.return = t, p = p.sibling;
    return t.subtreeFlags |= u, t.childLanes = s, r;
  }
  function Bw(t, r, s) {
    var u = r.pendingProps;
    switch (Pl(r), r.tag) {
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
        return et(r), null;
      case 1:
        return lt(r.type) && Qo(), et(r), null;
      case 3:
        return u = r.stateNode, Ir(), be(at), be(Je), zl(), u.pendingContext && (u.context = u.pendingContext, u.pendingContext = null), (t === null || t.child === null) && (es(r) ? r.flags |= 4 : t === null || t.memoizedState.isDehydrated && (r.flags & 256) === 0 || (r.flags |= 1024, Dt !== null && (gu(Dt), Dt = null))), su(t, r), et(r), null;
      case 5:
        Vl(r);
        var p = Jn(Ii.current);
        if (s = r.type, t !== null && r.stateNode != null) uh(t, r, s, u, p), t.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!u) {
            if (r.stateNode === null) throw Error(i(166));
            return et(r), null;
          }
          if (t = Jn(Gt.current), es(r)) {
            u = r.stateNode, s = r.type;
            var m = r.memoizedProps;
            switch (u[Wt] = r, u[Mi] = m, t = (r.mode & 1) !== 0, s) {
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
                for (p = 0; p < Ei.length; p++) Pe(Ei[p], u);
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
                $d(u, m), Pe("invalid", u);
                break;
              case "select":
                u._wrapperState = { wasMultiple: !!m.multiple }, Pe("invalid", u);
                break;
              case "textarea":
                Gd(u, m), Pe("invalid", u);
            }
            Ba(s, m), p = null;
            for (var _ in m) if (m.hasOwnProperty(_)) {
              var E = m[_];
              _ === "children" ? typeof E == "string" ? u.textContent !== E && (m.suppressHydrationWarning !== !0 && Go(u.textContent, E, t), p = ["children", E]) : typeof E == "number" && u.textContent !== "" + E && (m.suppressHydrationWarning !== !0 && Go(
                u.textContent,
                E,
                t
              ), p = ["children", "" + E]) : a.hasOwnProperty(_) && E != null && _ === "onScroll" && Pe("scroll", u);
            }
            switch (s) {
              case "input":
                To(u), Wd(u, m, !0);
                break;
              case "textarea":
                To(u), Yd(u);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof m.onClick == "function" && (u.onclick = Ko);
            }
            u = p, r.updateQueue = u, u !== null && (r.flags |= 4);
          } else {
            _ = p.nodeType === 9 ? p : p.ownerDocument, t === "http://www.w3.org/1999/xhtml" && (t = Qd(s)), t === "http://www.w3.org/1999/xhtml" ? s === "script" ? (t = _.createElement("div"), t.innerHTML = "<script><\/script>", t = t.removeChild(t.firstChild)) : typeof u.is == "string" ? t = _.createElement(s, { is: u.is }) : (t = _.createElement(s), s === "select" && (_ = t, u.multiple ? _.multiple = !0 : u.size && (_.size = u.size))) : t = _.createElementNS(t, s), t[Wt] = r, t[Mi] = u, lh(t, r, !1, !1), r.stateNode = t;
            e: {
              switch (_ = za(s, u), s) {
                case "dialog":
                  Pe("cancel", t), Pe("close", t), p = u;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Pe("load", t), p = u;
                  break;
                case "video":
                case "audio":
                  for (p = 0; p < Ei.length; p++) Pe(Ei[p], t);
                  p = u;
                  break;
                case "source":
                  Pe("error", t), p = u;
                  break;
                case "img":
                case "image":
                case "link":
                  Pe(
                    "error",
                    t
                  ), Pe("load", t), p = u;
                  break;
                case "details":
                  Pe("toggle", t), p = u;
                  break;
                case "input":
                  $d(t, u), p = Ia(t, u), Pe("invalid", t);
                  break;
                case "option":
                  p = u;
                  break;
                case "select":
                  t._wrapperState = { wasMultiple: !!u.multiple }, p = Y({}, u, { value: void 0 }), Pe("invalid", t);
                  break;
                case "textarea":
                  Gd(t, u), p = La(t, u), Pe("invalid", t);
                  break;
                default:
                  p = u;
              }
              Ba(s, p), E = p;
              for (m in E) if (E.hasOwnProperty(m)) {
                var M = E[m];
                m === "style" ? Jd(t, M) : m === "dangerouslySetInnerHTML" ? (M = M ? M.__html : void 0, M != null && Xd(t, M)) : m === "children" ? typeof M == "string" ? (s !== "textarea" || M !== "") && li(t, M) : typeof M == "number" && li(t, "" + M) : m !== "suppressContentEditableWarning" && m !== "suppressHydrationWarning" && m !== "autoFocus" && (a.hasOwnProperty(m) ? M != null && m === "onScroll" && Pe("scroll", t) : M != null && b(t, m, M, _));
              }
              switch (s) {
                case "input":
                  To(t), Wd(t, u, !1);
                  break;
                case "textarea":
                  To(t), Yd(t);
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
                  typeof p.onClick == "function" && (t.onclick = Ko);
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
        return et(r), null;
      case 6:
        if (t && r.stateNode != null) ch(t, r, t.memoizedProps, u);
        else {
          if (typeof u != "string" && r.stateNode === null) throw Error(i(166));
          if (s = Jn(Ii.current), Jn(Gt.current), es(r)) {
            if (u = r.stateNode, s = r.memoizedProps, u[Wt] = r, (m = u.nodeValue !== s) && (t = St, t !== null)) switch (t.tag) {
              case 3:
                Go(u.nodeValue, s, (t.mode & 1) !== 0);
                break;
              case 5:
                t.memoizedProps.suppressHydrationWarning !== !0 && Go(u.nodeValue, s, (t.mode & 1) !== 0);
            }
            m && (r.flags |= 4);
          } else u = (s.nodeType === 9 ? s : s.ownerDocument).createTextNode(u), u[Wt] = r, r.stateNode = u;
        }
        return et(r), null;
      case 13:
        if (be(De), u = r.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (Ne && wt !== null && (r.mode & 1) !== 0 && (r.flags & 128) === 0) pp(), Rr(), r.flags |= 98560, m = !1;
          else if (m = es(r), u !== null && u.dehydrated !== null) {
            if (t === null) {
              if (!m) throw Error(i(318));
              if (m = r.memoizedState, m = m !== null ? m.dehydrated : null, !m) throw Error(i(317));
              m[Wt] = r;
            } else Rr(), (r.flags & 128) === 0 && (r.memoizedState = null), r.flags |= 4;
            et(r), m = !1;
          } else Dt !== null && (gu(Dt), Dt = null), m = !0;
          if (!m) return r.flags & 65536 ? r : null;
        }
        return (r.flags & 128) !== 0 ? (r.lanes = s, r) : (u = u !== null, u !== (t !== null && t.memoizedState !== null) && u && (r.child.flags |= 8192, (r.mode & 1) !== 0 && (t === null || (De.current & 1) !== 0 ? Ue === 0 && (Ue = 3) : wu())), r.updateQueue !== null && (r.flags |= 4), et(r), null);
      case 4:
        return Ir(), su(t, r), t === null && Pi(r.stateNode.containerInfo), et(r), null;
      case 10:
        return jl(r.type._context), et(r), null;
      case 17:
        return lt(r.type) && Qo(), et(r), null;
      case 19:
        if (be(De), m = r.memoizedState, m === null) return et(r), null;
        if (u = (r.flags & 128) !== 0, _ = m.rendering, _ === null) if (u) Bi(m, !1);
        else {
          if (Ue !== 0 || t !== null && (t.flags & 128) !== 0) for (t = r.child; t !== null; ) {
            if (_ = ss(t), _ !== null) {
              for (r.flags |= 128, Bi(m, !1), u = _.updateQueue, u !== null && (r.updateQueue = u, r.flags |= 4), r.subtreeFlags = 0, u = s, s = r.child; s !== null; ) m = s, t = u, m.flags &= 14680066, _ = m.alternate, _ === null ? (m.childLanes = 0, m.lanes = t, m.child = null, m.subtreeFlags = 0, m.memoizedProps = null, m.memoizedState = null, m.updateQueue = null, m.dependencies = null, m.stateNode = null) : (m.childLanes = _.childLanes, m.lanes = _.lanes, m.child = _.child, m.subtreeFlags = 0, m.deletions = null, m.memoizedProps = _.memoizedProps, m.memoizedState = _.memoizedState, m.updateQueue = _.updateQueue, m.type = _.type, t = _.dependencies, m.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), s = s.sibling;
              return Ee(De, De.current & 1 | 2), r.child;
            }
            t = t.sibling;
          }
          m.tail !== null && Oe() > Vr && (r.flags |= 128, u = !0, Bi(m, !1), r.lanes = 4194304);
        }
        else {
          if (!u) if (t = ss(_), t !== null) {
            if (r.flags |= 128, u = !0, s = t.updateQueue, s !== null && (r.updateQueue = s, r.flags |= 4), Bi(m, !0), m.tail === null && m.tailMode === "hidden" && !_.alternate && !Ne) return et(r), null;
          } else 2 * Oe() - m.renderingStartTime > Vr && s !== 1073741824 && (r.flags |= 128, u = !0, Bi(m, !1), r.lanes = 4194304);
          m.isBackwards ? (_.sibling = r.child, r.child = _) : (s = m.last, s !== null ? s.sibling = _ : r.child = _, m.last = _);
        }
        return m.tail !== null ? (r = m.tail, m.rendering = r, m.tail = r.sibling, m.renderingStartTime = Oe(), r.sibling = null, s = De.current, Ee(De, u ? s & 1 | 2 : s & 1), r) : (et(r), null);
      case 22:
      case 23:
        return Su(), u = r.memoizedState !== null, t !== null && t.memoizedState !== null !== u && (r.flags |= 8192), u && (r.mode & 1) !== 0 ? (xt & 1073741824) !== 0 && (et(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : et(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(i(156, r.tag));
  }
  function zw(t, r) {
    switch (Pl(r), r.tag) {
      case 1:
        return lt(r.type) && Qo(), t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 3:
        return Ir(), be(at), be(Je), zl(), t = r.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (r.flags = t & -65537 | 128, r) : null;
      case 5:
        return Vl(r), null;
      case 13:
        if (be(De), t = r.memoizedState, t !== null && t.dehydrated !== null) {
          if (r.alternate === null) throw Error(i(340));
          Rr();
        }
        return t = r.flags, t & 65536 ? (r.flags = t & -65537 | 128, r) : null;
      case 19:
        return be(De), null;
      case 4:
        return Ir(), null;
      case 10:
        return jl(r.type._context), null;
      case 22:
      case 23:
        return Su(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var ms = !1, tt = !1, Uw = typeof WeakSet == "function" ? WeakSet : Set, ee = null;
  function Or(t, r) {
    var s = t.ref;
    if (s !== null) if (typeof s == "function") try {
      s(null);
    } catch (u) {
      Fe(t, r, u);
    }
    else s.current = null;
  }
  function au(t, r, s) {
    try {
      s();
    } catch (u) {
      Fe(t, r, u);
    }
  }
  var dh = !1;
  function $w(t, r) {
    if (Sl = Io, t = $f(), dl(t)) {
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
          var _ = 0, E = -1, M = -1, F = 0, B = 0, U = t, V = null;
          t: for (; ; ) {
            for (var Z; U !== s || p !== 0 && U.nodeType !== 3 || (E = _ + p), U !== m || u !== 0 && U.nodeType !== 3 || (M = _ + u), U.nodeType === 3 && (_ += U.nodeValue.length), (Z = U.firstChild) !== null; )
              V = U, U = Z;
            for (; ; ) {
              if (U === t) break t;
              if (V === s && ++F === p && (E = _), V === m && ++B === u && (M = _), (Z = U.nextSibling) !== null) break;
              U = V, V = U.parentNode;
            }
            U = Z;
          }
          s = E === -1 || M === -1 ? null : { start: E, end: M };
        } else s = null;
      }
      s = s || { start: 0, end: 0 };
    } else s = null;
    for (wl = { focusedElem: t, selectionRange: s }, Io = !1, ee = r; ee !== null; ) if (r = ee, t = r.child, (r.subtreeFlags & 1028) !== 0 && t !== null) t.return = r, ee = t;
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
              var re = te.memoizedProps, Le = te.memoizedState, j = r.stateNode, N = j.getSnapshotBeforeUpdate(r.elementType === r.type ? re : jt(r.type, re), Le);
              j.__reactInternalSnapshotBeforeUpdate = N;
            }
            break;
          case 3:
            var I = r.stateNode.containerInfo;
            I.nodeType === 1 ? I.textContent = "" : I.nodeType === 9 && I.documentElement && I.removeChild(I.documentElement);
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
        t.return = r.return, ee = t;
        break;
      }
      ee = r.return;
    }
    return te = dh, dh = !1, te;
  }
  function zi(t, r, s) {
    var u = r.updateQueue;
    if (u = u !== null ? u.lastEffect : null, u !== null) {
      var p = u = u.next;
      do {
        if ((p.tag & t) === t) {
          var m = p.destroy;
          p.destroy = void 0, m !== void 0 && au(r, s, m);
        }
        p = p.next;
      } while (p !== u);
    }
  }
  function ys(t, r) {
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
  function lu(t) {
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
  function fh(t) {
    var r = t.alternate;
    r !== null && (t.alternate = null, fh(r)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (r = t.stateNode, r !== null && (delete r[Wt], delete r[Mi], delete r[kl], delete r[Aw], delete r[Cw])), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  function ph(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 4;
  }
  function hh(t) {
    e: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || ph(t.return)) return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
        if (t.flags & 2 || t.child === null || t.tag === 4) continue e;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function uu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.nodeType === 8 ? s.parentNode.insertBefore(t, r) : s.insertBefore(t, r) : (s.nodeType === 8 ? (r = s.parentNode, r.insertBefore(t, s)) : (r = s, r.appendChild(t)), s = s._reactRootContainer, s != null || r.onclick !== null || (r.onclick = Ko));
    else if (u !== 4 && (t = t.child, t !== null)) for (uu(t, r, s), t = t.sibling; t !== null; ) uu(t, r, s), t = t.sibling;
  }
  function cu(t, r, s) {
    var u = t.tag;
    if (u === 5 || u === 6) t = t.stateNode, r ? s.insertBefore(t, r) : s.appendChild(t);
    else if (u !== 4 && (t = t.child, t !== null)) for (cu(t, r, s), t = t.sibling; t !== null; ) cu(t, r, s), t = t.sibling;
  }
  var Ye = null, It = !1;
  function bn(t, r, s) {
    for (s = s.child; s !== null; ) mh(t, r, s), s = s.sibling;
  }
  function mh(t, r, s) {
    if (Ht && typeof Ht.onCommitFiberUnmount == "function") try {
      Ht.onCommitFiberUnmount(bo, s);
    } catch {
    }
    switch (s.tag) {
      case 5:
        tt || Or(s, r);
      case 6:
        var u = Ye, p = It;
        Ye = null, bn(t, r, s), Ye = u, It = p, Ye !== null && (It ? (t = Ye, s = s.stateNode, t.nodeType === 8 ? t.parentNode.removeChild(s) : t.removeChild(s)) : Ye.removeChild(s.stateNode));
        break;
      case 18:
        Ye !== null && (It ? (t = Ye, s = s.stateNode, t.nodeType === 8 ? Tl(t.parentNode, s) : t.nodeType === 1 && Tl(t, s), Si(t)) : Tl(Ye, s.stateNode));
        break;
      case 4:
        u = Ye, p = It, Ye = s.stateNode.containerInfo, It = !0, bn(t, r, s), Ye = u, It = p;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!tt && (u = s.updateQueue, u !== null && (u = u.lastEffect, u !== null))) {
          p = u = u.next;
          do {
            var m = p, _ = m.destroy;
            m = m.tag, _ !== void 0 && ((m & 2) !== 0 || (m & 4) !== 0) && au(s, r, _), p = p.next;
          } while (p !== u);
        }
        bn(t, r, s);
        break;
      case 1:
        if (!tt && (Or(s, r), u = s.stateNode, typeof u.componentWillUnmount == "function")) try {
          u.props = s.memoizedProps, u.state = s.memoizedState, u.componentWillUnmount();
        } catch (E) {
          Fe(s, r, E);
        }
        bn(t, r, s);
        break;
      case 21:
        bn(t, r, s);
        break;
      case 22:
        s.mode & 1 ? (tt = (u = tt) || s.memoizedState !== null, bn(t, r, s), tt = u) : bn(t, r, s);
        break;
      default:
        bn(t, r, s);
    }
  }
  function yh(t) {
    var r = t.updateQueue;
    if (r !== null) {
      t.updateQueue = null;
      var s = t.stateNode;
      s === null && (s = t.stateNode = new Uw()), r.forEach(function(u) {
        var p = Jw.bind(null, t, u);
        s.has(u) || (s.add(u), u.then(p, p));
      });
    }
  }
  function Ft(t, r) {
    var s = r.deletions;
    if (s !== null) for (var u = 0; u < s.length; u++) {
      var p = s[u];
      try {
        var m = t, _ = r, E = _;
        e: for (; E !== null; ) {
          switch (E.tag) {
            case 5:
              Ye = E.stateNode, It = !1;
              break e;
            case 3:
              Ye = E.stateNode.containerInfo, It = !0;
              break e;
            case 4:
              Ye = E.stateNode.containerInfo, It = !0;
              break e;
          }
          E = E.return;
        }
        if (Ye === null) throw Error(i(160));
        mh(m, _, p), Ye = null, It = !1;
        var M = p.alternate;
        M !== null && (M.return = null), p.return = null;
      } catch (F) {
        Fe(p, r, F);
      }
    }
    if (r.subtreeFlags & 12854) for (r = r.child; r !== null; ) gh(r, t), r = r.sibling;
  }
  function gh(t, r) {
    var s = t.alternate, u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Ft(r, t), Yt(t), u & 4) {
          try {
            zi(3, t, t.return), ys(3, t);
          } catch (re) {
            Fe(t, t.return, re);
          }
          try {
            zi(5, t, t.return);
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        break;
      case 1:
        Ft(r, t), Yt(t), u & 512 && s !== null && Or(s, s.return);
        break;
      case 5:
        if (Ft(r, t), Yt(t), u & 512 && s !== null && Or(s, s.return), t.flags & 32) {
          var p = t.stateNode;
          try {
            li(p, "");
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        if (u & 4 && (p = t.stateNode, p != null)) {
          var m = t.memoizedProps, _ = s !== null ? s.memoizedProps : m, E = t.type, M = t.updateQueue;
          if (t.updateQueue = null, M !== null) try {
            E === "input" && m.type === "radio" && m.name != null && Hd(p, m), za(E, _);
            var F = za(E, m);
            for (_ = 0; _ < M.length; _ += 2) {
              var B = M[_], U = M[_ + 1];
              B === "style" ? Jd(p, U) : B === "dangerouslySetInnerHTML" ? Xd(p, U) : B === "children" ? li(p, U) : b(p, B, U, F);
            }
            switch (E) {
              case "input":
                Fa(p, m);
                break;
              case "textarea":
                Kd(p, m);
                break;
              case "select":
                var V = p._wrapperState.wasMultiple;
                p._wrapperState.wasMultiple = !!m.multiple;
                var Z = m.value;
                Z != null ? yr(p, !!m.multiple, Z, !1) : V !== !!m.multiple && (m.defaultValue != null ? yr(
                  p,
                  !!m.multiple,
                  m.defaultValue,
                  !0
                ) : yr(p, !!m.multiple, m.multiple ? [] : "", !1));
            }
            p[Mi] = m;
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        break;
      case 6:
        if (Ft(r, t), Yt(t), u & 4) {
          if (t.stateNode === null) throw Error(i(162));
          p = t.stateNode, m = t.memoizedProps;
          try {
            p.nodeValue = m;
          } catch (re) {
            Fe(t, t.return, re);
          }
        }
        break;
      case 3:
        if (Ft(r, t), Yt(t), u & 4 && s !== null && s.memoizedState.isDehydrated) try {
          Si(r.containerInfo);
        } catch (re) {
          Fe(t, t.return, re);
        }
        break;
      case 4:
        Ft(r, t), Yt(t);
        break;
      case 13:
        Ft(r, t), Yt(t), p = t.child, p.flags & 8192 && (m = p.memoizedState !== null, p.stateNode.isHidden = m, !m || p.alternate !== null && p.alternate.memoizedState !== null || (pu = Oe())), u & 4 && yh(t);
        break;
      case 22:
        if (B = s !== null && s.memoizedState !== null, t.mode & 1 ? (tt = (F = tt) || B, Ft(r, t), tt = F) : Ft(r, t), Yt(t), u & 8192) {
          if (F = t.memoizedState !== null, (t.stateNode.isHidden = F) && !B && (t.mode & 1) !== 0) for (ee = t, B = t.child; B !== null; ) {
            for (U = ee = B; ee !== null; ) {
              switch (V = ee, Z = V.child, V.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  zi(4, V, V.return);
                  break;
                case 1:
                  Or(V, V.return);
                  var te = V.stateNode;
                  if (typeof te.componentWillUnmount == "function") {
                    u = V, s = V.return;
                    try {
                      r = u, te.props = r.memoizedProps, te.state = r.memoizedState, te.componentWillUnmount();
                    } catch (re) {
                      Fe(u, s, re);
                    }
                  }
                  break;
                case 5:
                  Or(V, V.return);
                  break;
                case 22:
                  if (V.memoizedState !== null) {
                    wh(U);
                    continue;
                  }
              }
              Z !== null ? (Z.return = V, ee = Z) : wh(U);
            }
            B = B.sibling;
          }
          e: for (B = null, U = t; ; ) {
            if (U.tag === 5) {
              if (B === null) {
                B = U;
                try {
                  p = U.stateNode, F ? (m = p.style, typeof m.setProperty == "function" ? m.setProperty("display", "none", "important") : m.display = "none") : (E = U.stateNode, M = U.memoizedProps.style, _ = M != null && M.hasOwnProperty("display") ? M.display : null, E.style.display = Zd("display", _));
                } catch (re) {
                  Fe(t, t.return, re);
                }
              }
            } else if (U.tag === 6) {
              if (B === null) try {
                U.stateNode.nodeValue = F ? "" : U.memoizedProps;
              } catch (re) {
                Fe(t, t.return, re);
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
        Ft(r, t), Yt(t), u & 4 && yh(t);
        break;
      case 21:
        break;
      default:
        Ft(
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
            if (ph(s)) {
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
            var m = hh(t);
            cu(t, m, p);
            break;
          case 3:
          case 4:
            var _ = u.stateNode.containerInfo, E = hh(t);
            uu(t, E, _);
            break;
          default:
            throw Error(i(161));
        }
      } catch (M) {
        Fe(t, t.return, M);
      }
      t.flags &= -3;
    }
    r & 4096 && (t.flags &= -4097);
  }
  function Hw(t, r, s) {
    ee = t, vh(t);
  }
  function vh(t, r, s) {
    for (var u = (t.mode & 1) !== 0; ee !== null; ) {
      var p = ee, m = p.child;
      if (p.tag === 22 && u) {
        var _ = p.memoizedState !== null || ms;
        if (!_) {
          var E = p.alternate, M = E !== null && E.memoizedState !== null || tt;
          E = ms;
          var F = tt;
          if (ms = _, (tt = M) && !F) for (ee = p; ee !== null; ) _ = ee, M = _.child, _.tag === 22 && _.memoizedState !== null ? xh(p) : M !== null ? (M.return = _, ee = M) : xh(p);
          for (; m !== null; ) ee = m, vh(m), m = m.sibling;
          ee = p, ms = E, tt = F;
        }
        Sh(t);
      } else (p.subtreeFlags & 8772) !== 0 && m !== null ? (m.return = p, ee = m) : Sh(t);
    }
  }
  function Sh(t) {
    for (; ee !== null; ) {
      var r = ee;
      if ((r.flags & 8772) !== 0) {
        var s = r.alternate;
        try {
          if ((r.flags & 8772) !== 0) switch (r.tag) {
            case 0:
            case 11:
            case 15:
              tt || ys(5, r);
              break;
            case 1:
              var u = r.stateNode;
              if (r.flags & 4 && !tt) if (s === null) u.componentDidMount();
              else {
                var p = r.elementType === r.type ? s.memoizedProps : jt(r.type, s.memoizedProps);
                u.componentDidUpdate(p, s.memoizedState, u.__reactInternalSnapshotBeforeUpdate);
              }
              var m = r.updateQueue;
              m !== null && wp(r, m, u);
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
                wp(r, _, s);
              }
              break;
            case 5:
              var E = r.stateNode;
              if (s === null && r.flags & 4) {
                s = E;
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
                var F = r.alternate;
                if (F !== null) {
                  var B = F.memoizedState;
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
          tt || r.flags & 512 && lu(r);
        } catch (V) {
          Fe(r, r.return, V);
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
  function wh(t) {
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
  function xh(t) {
    for (; ee !== null; ) {
      var r = ee;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var s = r.return;
            try {
              ys(4, r);
            } catch (M) {
              Fe(r, s, M);
            }
            break;
          case 1:
            var u = r.stateNode;
            if (typeof u.componentDidMount == "function") {
              var p = r.return;
              try {
                u.componentDidMount();
              } catch (M) {
                Fe(r, p, M);
              }
            }
            var m = r.return;
            try {
              lu(r);
            } catch (M) {
              Fe(r, m, M);
            }
            break;
          case 5:
            var _ = r.return;
            try {
              lu(r);
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
      var E = r.sibling;
      if (E !== null) {
        E.return = r.return, ee = E;
        break;
      }
      ee = r.return;
    }
  }
  var Ww = Math.ceil, gs = D.ReactCurrentDispatcher, du = D.ReactCurrentOwner, Ct = D.ReactCurrentBatchConfig, ye = 0, We = null, Ve = null, Qe = 0, xt = 0, Lr = kn(0), Ue = 0, Ui = null, er = 0, vs = 0, fu = 0, $i = null, ct = null, pu = 0, Vr = 1 / 0, dn = null, Ss = !1, hu = null, Mn = null, ws = !1, Rn = null, xs = 0, Hi = 0, mu = null, _s = -1, Ts = 0;
  function rt() {
    return (ye & 6) !== 0 ? Oe() : _s !== -1 ? _s : _s = Oe();
  }
  function Nn(t) {
    return (t.mode & 1) === 0 ? 1 : (ye & 2) !== 0 && Qe !== 0 ? Qe & -Qe : Pw.transition !== null ? (Ts === 0 && (Ts = hf()), Ts) : (t = _e, t !== 0 || (t = window.event, t = t === void 0 ? 16 : Tf(t.type)), t);
  }
  function Ot(t, r, s, u) {
    if (50 < Hi) throw Hi = 0, mu = null, Error(i(185));
    hi(t, s, u), ((ye & 2) === 0 || t !== We) && (t === We && ((ye & 2) === 0 && (vs |= s), Ue === 4 && Dn(t, Qe)), dt(t, u), s === 1 && ye === 0 && (r.mode & 1) === 0 && (Vr = Oe() + 500, Zo && Cn()));
  }
  function dt(t, r) {
    var s = t.callbackNode;
    PS(t, r);
    var u = No(t, t === We ? Qe : 0);
    if (u === 0) s !== null && df(s), t.callbackNode = null, t.callbackPriority = 0;
    else if (r = u & -u, t.callbackPriority !== r) {
      if (s != null && df(s), r === 1) t.tag === 0 ? Ew(Th.bind(null, t)) : lp(Th.bind(null, t)), Tw(function() {
        (ye & 6) === 0 && Cn();
      }), s = null;
      else {
        switch (mf(u)) {
          case 1:
            s = Ya;
            break;
          case 4:
            s = ff;
            break;
          case 16:
            s = Po;
            break;
          case 536870912:
            s = pf;
            break;
          default:
            s = Po;
        }
        s = Rh(s, _h.bind(null, t));
      }
      t.callbackPriority = r, t.callbackNode = s;
    }
  }
  function _h(t, r) {
    if (_s = -1, Ts = 0, (ye & 6) !== 0) throw Error(i(327));
    var s = t.callbackNode;
    if (Br() && t.callbackNode !== s) return null;
    var u = No(t, t === We ? Qe : 0);
    if (u === 0) return null;
    if ((u & 30) !== 0 || (u & t.expiredLanes) !== 0 || r) r = ks(t, u);
    else {
      r = u;
      var p = ye;
      ye |= 2;
      var m = Ah();
      (We !== t || Qe !== r) && (dn = null, Vr = Oe() + 500, nr(t, r));
      do
        try {
          Yw();
          break;
        } catch (E) {
          kh(t, E);
        }
      while (!0);
      Dl(), gs.current = m, ye = p, Ve !== null ? r = 0 : (We = null, Qe = 0, r = Ue);
    }
    if (r !== 0) {
      if (r === 2 && (p = Qa(t), p !== 0 && (u = p, r = yu(t, p))), r === 1) throw s = Ui, nr(t, 0), Dn(t, u), dt(t, Oe()), s;
      if (r === 6) Dn(t, u);
      else {
        if (p = t.current.alternate, (u & 30) === 0 && !Gw(p) && (r = ks(t, u), r === 2 && (m = Qa(t), m !== 0 && (u = m, r = yu(t, m))), r === 1)) throw s = Ui, nr(t, 0), Dn(t, u), dt(t, Oe()), s;
        switch (t.finishedWork = p, t.finishedLanes = u, r) {
          case 0:
          case 1:
            throw Error(i(345));
          case 2:
            rr(t, ct, dn);
            break;
          case 3:
            if (Dn(t, u), (u & 130023424) === u && (r = pu + 500 - Oe(), 10 < r)) {
              if (No(t, 0) !== 0) break;
              if (p = t.suspendedLanes, (p & u) !== u) {
                rt(), t.pingedLanes |= t.suspendedLanes & p;
                break;
              }
              t.timeoutHandle = _l(rr.bind(null, t, ct, dn), r);
              break;
            }
            rr(t, ct, dn);
            break;
          case 4:
            if (Dn(t, u), (u & 4194240) === u) break;
            for (r = t.eventTimes, p = -1; 0 < u; ) {
              var _ = 31 - Rt(u);
              m = 1 << _, _ = r[_], _ > p && (p = _), u &= ~m;
            }
            if (u = p, u = Oe() - u, u = (120 > u ? 120 : 480 > u ? 480 : 1080 > u ? 1080 : 1920 > u ? 1920 : 3e3 > u ? 3e3 : 4320 > u ? 4320 : 1960 * Ww(u / 1960)) - u, 10 < u) {
              t.timeoutHandle = _l(rr.bind(null, t, ct, dn), u);
              break;
            }
            rr(t, ct, dn);
            break;
          case 5:
            rr(t, ct, dn);
            break;
          default:
            throw Error(i(329));
        }
      }
    }
    return dt(t, Oe()), t.callbackNode === s ? _h.bind(null, t) : null;
  }
  function yu(t, r) {
    var s = $i;
    return t.current.memoizedState.isDehydrated && (nr(t, r).flags |= 256), t = ks(t, r), t !== 2 && (r = ct, ct = s, r !== null && gu(r)), t;
  }
  function gu(t) {
    ct === null ? ct = t : ct.push.apply(ct, t);
  }
  function Gw(t) {
    for (var r = t; ; ) {
      if (r.flags & 16384) {
        var s = r.updateQueue;
        if (s !== null && (s = s.stores, s !== null)) for (var u = 0; u < s.length; u++) {
          var p = s[u], m = p.getSnapshot;
          p = p.value;
          try {
            if (!Nt(m(), p)) return !1;
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
    for (r &= ~fu, r &= ~vs, t.suspendedLanes |= r, t.pingedLanes &= ~r, t = t.expirationTimes; 0 < r; ) {
      var s = 31 - Rt(r), u = 1 << s;
      t[s] = -1, r &= ~u;
    }
  }
  function Th(t) {
    if ((ye & 6) !== 0) throw Error(i(327));
    Br();
    var r = No(t, 0);
    if ((r & 1) === 0) return dt(t, Oe()), null;
    var s = ks(t, r);
    if (t.tag !== 0 && s === 2) {
      var u = Qa(t);
      u !== 0 && (r = u, s = yu(t, u));
    }
    if (s === 1) throw s = Ui, nr(t, 0), Dn(t, r), dt(t, Oe()), s;
    if (s === 6) throw Error(i(345));
    return t.finishedWork = t.current.alternate, t.finishedLanes = r, rr(t, ct, dn), dt(t, Oe()), null;
  }
  function vu(t, r) {
    var s = ye;
    ye |= 1;
    try {
      return t(r);
    } finally {
      ye = s, ye === 0 && (Vr = Oe() + 500, Zo && Cn());
    }
  }
  function tr(t) {
    Rn !== null && Rn.tag === 0 && (ye & 6) === 0 && Br();
    var r = ye;
    ye |= 1;
    var s = Ct.transition, u = _e;
    try {
      if (Ct.transition = null, _e = 1, t) return t();
    } finally {
      _e = u, Ct.transition = s, ye = r, (ye & 6) === 0 && Cn();
    }
  }
  function Su() {
    xt = Lr.current, be(Lr);
  }
  function nr(t, r) {
    t.finishedWork = null, t.finishedLanes = 0;
    var s = t.timeoutHandle;
    if (s !== -1 && (t.timeoutHandle = -1, _w(s)), Ve !== null) for (s = Ve.return; s !== null; ) {
      var u = s;
      switch (Pl(u), u.tag) {
        case 1:
          u = u.type.childContextTypes, u != null && Qo();
          break;
        case 3:
          Ir(), be(at), be(Je), zl();
          break;
        case 5:
          Vl(u);
          break;
        case 4:
          Ir();
          break;
        case 13:
          be(De);
          break;
        case 19:
          be(De);
          break;
        case 10:
          jl(u.type._context);
          break;
        case 22:
        case 23:
          Su();
      }
      s = s.return;
    }
    if (We = t, Ve = t = jn(t.current, null), Qe = xt = r, Ue = 0, Ui = null, fu = vs = er = 0, ct = $i = null, Zn !== null) {
      for (r = 0; r < Zn.length; r++) if (s = Zn[r], u = s.interleaved, u !== null) {
        s.interleaved = null;
        var p = u.next, m = s.pending;
        if (m !== null) {
          var _ = m.next;
          m.next = p, u.next = _;
        }
        s.pending = u;
      }
      Zn = null;
    }
    return t;
  }
  function kh(t, r) {
    do {
      var s = Ve;
      try {
        if (Dl(), as.current = ds, ls) {
          for (var u = je.memoizedState; u !== null; ) {
            var p = u.queue;
            p !== null && (p.pending = null), u = u.next;
          }
          ls = !1;
        }
        if (qn = 0, He = ze = je = null, Fi = !1, Oi = 0, du.current = null, s === null || s.return === null) {
          Ue = 1, Ui = r, Ve = null;
          break;
        }
        e: {
          var m = t, _ = s.return, E = s, M = r;
          if (r = Qe, E.flags |= 32768, M !== null && typeof M == "object" && typeof M.then == "function") {
            var F = M, B = E, U = B.tag;
            if ((B.mode & 1) === 0 && (U === 0 || U === 11 || U === 15)) {
              var V = B.alternate;
              V ? (B.updateQueue = V.updateQueue, B.memoizedState = V.memoizedState, B.lanes = V.lanes) : (B.updateQueue = null, B.memoizedState = null);
            }
            var Z = Qp(_);
            if (Z !== null) {
              Z.flags &= -257, Xp(Z, _, E, m, r), Z.mode & 1 && Yp(m, F, r), r = Z, M = F;
              var te = r.updateQueue;
              if (te === null) {
                var re = /* @__PURE__ */ new Set();
                re.add(M), r.updateQueue = re;
              } else te.add(M);
              break e;
            } else {
              if ((r & 1) === 0) {
                Yp(m, F, r), wu();
                break e;
              }
              M = Error(i(426));
            }
          } else if (Ne && E.mode & 1) {
            var Le = Qp(_);
            if (Le !== null) {
              (Le.flags & 65536) === 0 && (Le.flags |= 256), Xp(Le, _, E, m, r), Rl(Fr(M, E));
              break e;
            }
          }
          m = M = Fr(M, E), Ue !== 4 && (Ue = 2), $i === null ? $i = [m] : $i.push(m), m = _;
          do {
            switch (m.tag) {
              case 3:
                m.flags |= 65536, r &= -r, m.lanes |= r;
                var j = Gp(m, M, r);
                Sp(m, j);
                break e;
              case 1:
                E = M;
                var N = m.type, I = m.stateNode;
                if ((m.flags & 128) === 0 && (typeof N.getDerivedStateFromError == "function" || I !== null && typeof I.componentDidCatch == "function" && (Mn === null || !Mn.has(I)))) {
                  m.flags |= 65536, r &= -r, m.lanes |= r;
                  var H = Kp(m, E, r);
                  Sp(m, H);
                  break e;
                }
            }
            m = m.return;
          } while (m !== null);
        }
        Eh(s);
      } catch (ie) {
        r = ie, Ve === s && s !== null && (Ve = s = s.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Ah() {
    var t = gs.current;
    return gs.current = ds, t === null ? ds : t;
  }
  function wu() {
    (Ue === 0 || Ue === 3 || Ue === 2) && (Ue = 4), We === null || (er & 268435455) === 0 && (vs & 268435455) === 0 || Dn(We, Qe);
  }
  function ks(t, r) {
    var s = ye;
    ye |= 2;
    var u = Ah();
    (We !== t || Qe !== r) && (dn = null, nr(t, r));
    do
      try {
        Kw();
        break;
      } catch (p) {
        kh(t, p);
      }
    while (!0);
    if (Dl(), ye = s, gs.current = u, Ve !== null) throw Error(i(261));
    return We = null, Qe = 0, Ue;
  }
  function Kw() {
    for (; Ve !== null; ) Ch(Ve);
  }
  function Yw() {
    for (; Ve !== null && !SS(); ) Ch(Ve);
  }
  function Ch(t) {
    var r = Mh(t.alternate, t, xt);
    t.memoizedProps = t.pendingProps, r === null ? Eh(t) : Ve = r, du.current = null;
  }
  function Eh(t) {
    var r = t;
    do {
      var s = r.alternate;
      if (t = r.return, (r.flags & 32768) === 0) {
        if (s = Bw(s, r, xt), s !== null) {
          Ve = s;
          return;
        }
      } else {
        if (s = zw(s, r), s !== null) {
          s.flags &= 32767, Ve = s;
          return;
        }
        if (t !== null) t.flags |= 32768, t.subtreeFlags = 0, t.deletions = null;
        else {
          Ue = 6, Ve = null;
          return;
        }
      }
      if (r = r.sibling, r !== null) {
        Ve = r;
        return;
      }
      Ve = r = t;
    } while (r !== null);
    Ue === 0 && (Ue = 5);
  }
  function rr(t, r, s) {
    var u = _e, p = Ct.transition;
    try {
      Ct.transition = null, _e = 1, Qw(t, r, s, u);
    } finally {
      Ct.transition = p, _e = u;
    }
    return null;
  }
  function Qw(t, r, s, u) {
    do
      Br();
    while (Rn !== null);
    if ((ye & 6) !== 0) throw Error(i(327));
    s = t.finishedWork;
    var p = t.finishedLanes;
    if (s === null) return null;
    if (t.finishedWork = null, t.finishedLanes = 0, s === t.current) throw Error(i(177));
    t.callbackNode = null, t.callbackPriority = 0;
    var m = s.lanes | s.childLanes;
    if (bS(t, m), t === We && (Ve = We = null, Qe = 0), (s.subtreeFlags & 2064) === 0 && (s.flags & 2064) === 0 || ws || (ws = !0, Rh(Po, function() {
      return Br(), null;
    })), m = (s.flags & 15990) !== 0, (s.subtreeFlags & 15990) !== 0 || m) {
      m = Ct.transition, Ct.transition = null;
      var _ = _e;
      _e = 1;
      var E = ye;
      ye |= 4, du.current = null, $w(t, s), gh(s, t), mw(wl), Io = !!Sl, wl = Sl = null, t.current = s, Hw(s), wS(), ye = E, _e = _, Ct.transition = m;
    } else t.current = s;
    if (ws && (ws = !1, Rn = t, xs = p), m = t.pendingLanes, m === 0 && (Mn = null), TS(s.stateNode), dt(t, Oe()), r !== null) for (u = t.onRecoverableError, s = 0; s < r.length; s++) p = r[s], u(p.value, { componentStack: p.stack, digest: p.digest });
    if (Ss) throw Ss = !1, t = hu, hu = null, t;
    return (xs & 1) !== 0 && t.tag !== 0 && Br(), m = t.pendingLanes, (m & 1) !== 0 ? t === mu ? Hi++ : (Hi = 0, mu = t) : Hi = 0, Cn(), null;
  }
  function Br() {
    if (Rn !== null) {
      var t = mf(xs), r = Ct.transition, s = _e;
      try {
        if (Ct.transition = null, _e = 16 > t ? 16 : t, Rn === null) var u = !1;
        else {
          if (t = Rn, Rn = null, xs = 0, (ye & 6) !== 0) throw Error(i(331));
          var p = ye;
          for (ye |= 4, ee = t.current; ee !== null; ) {
            var m = ee, _ = m.child;
            if ((ee.flags & 16) !== 0) {
              var E = m.deletions;
              if (E !== null) {
                for (var M = 0; M < E.length; M++) {
                  var F = E[M];
                  for (ee = F; ee !== null; ) {
                    var B = ee;
                    switch (B.tag) {
                      case 0:
                      case 11:
                      case 15:
                        zi(8, B, m);
                    }
                    var U = B.child;
                    if (U !== null) U.return = B, ee = U;
                    else for (; ee !== null; ) {
                      B = ee;
                      var V = B.sibling, Z = B.return;
                      if (fh(B), B === F) {
                        ee = null;
                        break;
                      }
                      if (V !== null) {
                        V.return = Z, ee = V;
                        break;
                      }
                      ee = Z;
                    }
                  }
                }
                var te = m.alternate;
                if (te !== null) {
                  var re = te.child;
                  if (re !== null) {
                    te.child = null;
                    do {
                      var Le = re.sibling;
                      re.sibling = null, re = Le;
                    } while (re !== null);
                  }
                }
                ee = m;
              }
            }
            if ((m.subtreeFlags & 2064) !== 0 && _ !== null) _.return = m, ee = _;
            else e: for (; ee !== null; ) {
              if (m = ee, (m.flags & 2048) !== 0) switch (m.tag) {
                case 0:
                case 11:
                case 15:
                  zi(9, m, m.return);
              }
              var j = m.sibling;
              if (j !== null) {
                j.return = m.return, ee = j;
                break e;
              }
              ee = m.return;
            }
          }
          var N = t.current;
          for (ee = N; ee !== null; ) {
            _ = ee;
            var I = _.child;
            if ((_.subtreeFlags & 2064) !== 0 && I !== null) I.return = _, ee = I;
            else e: for (_ = N; ee !== null; ) {
              if (E = ee, (E.flags & 2048) !== 0) try {
                switch (E.tag) {
                  case 0:
                  case 11:
                  case 15:
                    ys(9, E);
                }
              } catch (ie) {
                Fe(E, E.return, ie);
              }
              if (E === _) {
                ee = null;
                break e;
              }
              var H = E.sibling;
              if (H !== null) {
                H.return = E.return, ee = H;
                break e;
              }
              ee = E.return;
            }
          }
          if (ye = p, Cn(), Ht && typeof Ht.onPostCommitFiberRoot == "function") try {
            Ht.onPostCommitFiberRoot(bo, t);
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
  function Ph(t, r, s) {
    r = Fr(s, r), r = Gp(t, r, 1), t = Pn(t, r, 1), r = rt(), t !== null && (hi(t, 1, r), dt(t, r));
  }
  function Fe(t, r, s) {
    if (t.tag === 3) Ph(t, t, s);
    else for (; r !== null; ) {
      if (r.tag === 3) {
        Ph(r, t, s);
        break;
      } else if (r.tag === 1) {
        var u = r.stateNode;
        if (typeof r.type.getDerivedStateFromError == "function" || typeof u.componentDidCatch == "function" && (Mn === null || !Mn.has(u))) {
          t = Fr(s, t), t = Kp(r, t, 1), r = Pn(r, t, 1), t = rt(), r !== null && (hi(r, 1, t), dt(r, t));
          break;
        }
      }
      r = r.return;
    }
  }
  function Xw(t, r, s) {
    var u = t.pingCache;
    u !== null && u.delete(r), r = rt(), t.pingedLanes |= t.suspendedLanes & s, We === t && (Qe & s) === s && (Ue === 4 || Ue === 3 && (Qe & 130023424) === Qe && 500 > Oe() - pu ? nr(t, 0) : fu |= s), dt(t, r);
  }
  function bh(t, r) {
    r === 0 && ((t.mode & 1) === 0 ? r = 1 : (r = Ro, Ro <<= 1, (Ro & 130023424) === 0 && (Ro = 4194304)));
    var s = rt();
    t = ln(t, r), t !== null && (hi(t, r, s), dt(t, s));
  }
  function Zw(t) {
    var r = t.memoizedState, s = 0;
    r !== null && (s = r.retryLane), bh(t, s);
  }
  function Jw(t, r) {
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
    u !== null && u.delete(r), bh(t, s);
  }
  var Mh;
  Mh = function(t, r, s) {
    if (t !== null) if (t.memoizedProps !== r.pendingProps || at.current) ut = !0;
    else {
      if ((t.lanes & s) === 0 && (r.flags & 128) === 0) return ut = !1, Vw(t, r, s);
      ut = (t.flags & 131072) !== 0;
    }
    else ut = !1, Ne && (r.flags & 1048576) !== 0 && up(r, qo, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var u = r.type;
        hs(t, r), t = r.pendingProps;
        var p = Pr(r, Je.current);
        jr(r, s), p = Hl(null, r, u, t, p, s);
        var m = Wl();
        return r.flags |= 1, typeof p == "object" && p !== null && typeof p.render == "function" && p.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, lt(u) ? (m = !0, Xo(r)) : m = !1, r.memoizedState = p.state !== null && p.state !== void 0 ? p.state : null, Ol(r), p.updater = fs, r.stateNode = p, p._reactInternals = r, Zl(r, u, t, s), r = tu(null, r, u, !0, m, s)) : (r.tag = 0, Ne && m && El(r), nt(null, r, p, s), r = r.child), r;
      case 16:
        u = r.elementType;
        e: {
          switch (hs(t, r), t = r.pendingProps, p = u._init, u = p(u._payload), r.type = u, p = r.tag = ex(u), t = jt(u, t), p) {
            case 0:
              r = eu(null, r, u, t, s);
              break e;
            case 1:
              r = nh(null, r, u, t, s);
              break e;
            case 11:
              r = Zp(null, r, u, t, s);
              break e;
            case 14:
              r = Jp(null, r, u, jt(u.type, t), s);
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
        return u = r.type, p = r.pendingProps, p = r.elementType === u ? p : jt(u, p), eu(t, r, u, p, s);
      case 1:
        return u = r.type, p = r.pendingProps, p = r.elementType === u ? p : jt(u, p), nh(t, r, u, p, s);
      case 3:
        e: {
          if (rh(r), t === null) throw Error(i(387));
          u = r.pendingProps, m = r.memoizedState, p = m.element, vp(t, r), os(r, u, null, s);
          var _ = r.memoizedState;
          if (u = _.element, m.isDehydrated) if (m = { element: u, isDehydrated: !1, cache: _.cache, pendingSuspenseBoundaries: _.pendingSuspenseBoundaries, transitions: _.transitions }, r.updateQueue.baseState = m, r.memoizedState = m, r.flags & 256) {
            p = Fr(Error(i(423)), r), r = ih(t, r, u, s, p);
            break e;
          } else if (u !== p) {
            p = Fr(Error(i(424)), r), r = ih(t, r, u, s, p);
            break e;
          } else for (wt = Tn(r.stateNode.containerInfo.firstChild), St = r, Ne = !0, Dt = null, s = yp(r, null, u, s), r.child = s; s; ) s.flags = s.flags & -3 | 4096, s = s.sibling;
          else {
            if (Rr(), u === p) {
              r = cn(t, r, s);
              break e;
            }
            nt(t, r, u, s);
          }
          r = r.child;
        }
        return r;
      case 5:
        return xp(r), t === null && Ml(r), u = r.type, p = r.pendingProps, m = t !== null ? t.memoizedProps : null, _ = p.children, xl(u, p) ? _ = null : m !== null && xl(u, m) && (r.flags |= 32), th(t, r), nt(t, r, _, s), r.child;
      case 6:
        return t === null && Ml(r), null;
      case 13:
        return oh(t, r, s);
      case 4:
        return Ll(r, r.stateNode.containerInfo), u = r.pendingProps, t === null ? r.child = Nr(r, null, u, s) : nt(t, r, u, s), r.child;
      case 11:
        return u = r.type, p = r.pendingProps, p = r.elementType === u ? p : jt(u, p), Zp(t, r, u, p, s);
      case 7:
        return nt(t, r, r.pendingProps, s), r.child;
      case 8:
        return nt(t, r, r.pendingProps.children, s), r.child;
      case 12:
        return nt(t, r, r.pendingProps.children, s), r.child;
      case 10:
        e: {
          if (u = r.type._context, p = r.pendingProps, m = r.memoizedProps, _ = p.value, Ee(ns, u._currentValue), u._currentValue = _, m !== null) if (Nt(m.value, _)) {
            if (m.children === p.children && !at.current) {
              r = cn(t, r, s);
              break e;
            }
          } else for (m = r.child, m !== null && (m.return = r); m !== null; ) {
            var E = m.dependencies;
            if (E !== null) {
              _ = m.child;
              for (var M = E.firstContext; M !== null; ) {
                if (M.context === u) {
                  if (m.tag === 1) {
                    M = un(-1, s & -s), M.tag = 2;
                    var F = m.updateQueue;
                    if (F !== null) {
                      F = F.shared;
                      var B = F.pending;
                      B === null ? M.next = M : (M.next = B.next, B.next = M), F.pending = M;
                    }
                  }
                  m.lanes |= s, M = m.alternate, M !== null && (M.lanes |= s), Il(
                    m.return,
                    s,
                    r
                  ), E.lanes |= s;
                  break;
                }
                M = M.next;
              }
            } else if (m.tag === 10) _ = m.type === r.type ? null : m.child;
            else if (m.tag === 18) {
              if (_ = m.return, _ === null) throw Error(i(341));
              _.lanes |= s, E = _.alternate, E !== null && (E.lanes |= s), Il(_, s, r), _ = m.sibling;
            } else _ = m.child;
            if (_ !== null) _.return = m;
            else for (_ = m; _ !== null; ) {
              if (_ === r) {
                _ = null;
                break;
              }
              if (m = _.sibling, m !== null) {
                m.return = _.return, _ = m;
                break;
              }
              _ = _.return;
            }
            m = _;
          }
          nt(t, r, p.children, s), r = r.child;
        }
        return r;
      case 9:
        return p = r.type, u = r.pendingProps.children, jr(r, s), p = kt(p), u = u(p), r.flags |= 1, nt(t, r, u, s), r.child;
      case 14:
        return u = r.type, p = jt(u, r.pendingProps), p = jt(u.type, p), Jp(t, r, u, p, s);
      case 15:
        return qp(t, r, r.type, r.pendingProps, s);
      case 17:
        return u = r.type, p = r.pendingProps, p = r.elementType === u ? p : jt(u, p), hs(t, r), r.tag = 1, lt(u) ? (t = !0, Xo(r)) : t = !1, jr(r, s), Hp(r, u, p), Zl(r, u, p, s), tu(null, r, u, !0, t, s);
      case 19:
        return ah(t, r, s);
      case 22:
        return eh(t, r, s);
    }
    throw Error(i(156, r.tag));
  };
  function Rh(t, r) {
    return cf(t, r);
  }
  function qw(t, r, s, u) {
    this.tag = t, this.key = s, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = u, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Et(t, r, s, u) {
    return new qw(t, r, s, u);
  }
  function xu(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function ex(t) {
    if (typeof t == "function") return xu(t) ? 1 : 0;
    if (t != null) {
      if (t = t.$$typeof, t === ce) return 11;
      if (t === we) return 14;
    }
    return 2;
  }
  function jn(t, r) {
    var s = t.alternate;
    return s === null ? (s = Et(t.tag, r, t.key, t.mode), s.elementType = t.elementType, s.type = t.type, s.stateNode = t.stateNode, s.alternate = t, t.alternate = s) : (s.pendingProps = r, s.type = t.type, s.flags = 0, s.subtreeFlags = 0, s.deletions = null), s.flags = t.flags & 14680064, s.childLanes = t.childLanes, s.lanes = t.lanes, s.child = t.child, s.memoizedProps = t.memoizedProps, s.memoizedState = t.memoizedState, s.updateQueue = t.updateQueue, r = t.dependencies, s.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, s.sibling = t.sibling, s.index = t.index, s.ref = t.ref, s;
  }
  function As(t, r, s, u, p, m) {
    var _ = 2;
    if (u = t, typeof t == "function") xu(t) && (_ = 1);
    else if (typeof t == "string") _ = 5;
    else e: switch (t) {
      case Q:
        return ir(s.children, p, m, r);
      case $:
        _ = 8, p |= 8;
        break;
      case W:
        return t = Et(12, s, r, p | 2), t.elementType = W, t.lanes = m, t;
      case me:
        return t = Et(13, s, r, p), t.elementType = me, t.lanes = m, t;
      case pe:
        return t = Et(19, s, r, p), t.elementType = pe, t.lanes = m, t;
      case he:
        return Cs(s, p, m, r);
      default:
        if (typeof t == "object" && t !== null) switch (t.$$typeof) {
          case X:
            _ = 10;
            break e;
          case J:
            _ = 9;
            break e;
          case ce:
            _ = 11;
            break e;
          case we:
            _ = 14;
            break e;
          case ue:
            _ = 16, u = null;
            break e;
        }
        throw Error(i(130, t == null ? t : typeof t, ""));
    }
    return r = Et(_, s, r, p), r.elementType = t, r.type = u, r.lanes = m, r;
  }
  function ir(t, r, s, u) {
    return t = Et(7, t, u, r), t.lanes = s, t;
  }
  function Cs(t, r, s, u) {
    return t = Et(22, t, u, r), t.elementType = he, t.lanes = s, t.stateNode = { isHidden: !1 }, t;
  }
  function _u(t, r, s) {
    return t = Et(6, t, null, r), t.lanes = s, t;
  }
  function Tu(t, r, s) {
    return r = Et(4, t.children !== null ? t.children : [], t.key, r), r.lanes = s, r.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, r;
  }
  function tx(t, r, s, u, p) {
    this.tag = r, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Xa(0), this.expirationTimes = Xa(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Xa(0), this.identifierPrefix = u, this.onRecoverableError = p, this.mutableSourceEagerHydrationData = null;
  }
  function ku(t, r, s, u, p, m, _, E, M) {
    return t = new tx(t, r, s, E, M), r === 1 ? (r = 1, m === !0 && (r |= 8)) : r = 0, m = Et(3, null, null, r), t.current = m, m.stateNode = t, m.memoizedState = { element: u, isDehydrated: s, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Ol(m), t;
  }
  function nx(t, r, s) {
    var u = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: K, key: u == null ? null : "" + u, children: t, containerInfo: r, implementation: s };
  }
  function Nh(t) {
    if (!t) return An;
    t = t._reactInternals;
    e: {
      if (Gn(t) !== t || t.tag !== 1) throw Error(i(170));
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
      if (lt(s)) return sp(t, s, r);
    }
    return r;
  }
  function Dh(t, r, s, u, p, m, _, E, M) {
    return t = ku(s, u, !0, t, p, m, _, E, M), t.context = Nh(null), s = t.current, u = rt(), p = Nn(s), m = un(u, p), m.callback = r ?? null, Pn(s, m, p), t.current.lanes = p, hi(t, p, u), dt(t, u), t;
  }
  function Es(t, r, s, u) {
    var p = r.current, m = rt(), _ = Nn(p);
    return s = Nh(s), r.context === null ? r.context = s : r.pendingContext = s, r = un(m, _), r.payload = { element: t }, u = u === void 0 ? null : u, u !== null && (r.callback = u), t = Pn(p, r, _), t !== null && (Ot(t, p, _, m), is(t, p, _)), _;
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
  function jh(t, r) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var s = t.retryLane;
      t.retryLane = s !== 0 && s < r ? s : r;
    }
  }
  function Au(t, r) {
    jh(t, r), (t = t.alternate) && jh(t, r);
  }
  function rx() {
    return null;
  }
  var Ih = typeof reportError == "function" ? reportError : function(t) {
    console.error(t);
  };
  function Cu(t) {
    this._internalRoot = t;
  }
  bs.prototype.render = Cu.prototype.render = function(t) {
    var r = this._internalRoot;
    if (r === null) throw Error(i(409));
    Es(t, r, null, null);
  }, bs.prototype.unmount = Cu.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var r = t.containerInfo;
      tr(function() {
        Es(null, t, null, null);
      }), r[rn] = null;
    }
  };
  function bs(t) {
    this._internalRoot = t;
  }
  bs.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var r = vf();
      t = { blockedOn: null, target: t, priority: r };
      for (var s = 0; s < wn.length && r !== 0 && r < wn[s].priority; s++) ;
      wn.splice(s, 0, t), s === 0 && xf(t);
    }
  };
  function Eu(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function Ms(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11 && (t.nodeType !== 8 || t.nodeValue !== " react-mount-point-unstable "));
  }
  function Fh() {
  }
  function ix(t, r, s, u, p) {
    if (p) {
      if (typeof u == "function") {
        var m = u;
        u = function() {
          var F = Ps(_);
          m.call(F);
        };
      }
      var _ = Dh(r, u, t, 0, null, !1, !1, "", Fh);
      return t._reactRootContainer = _, t[rn] = _.current, Pi(t.nodeType === 8 ? t.parentNode : t), tr(), _;
    }
    for (; p = t.lastChild; ) t.removeChild(p);
    if (typeof u == "function") {
      var E = u;
      u = function() {
        var F = Ps(M);
        E.call(F);
      };
    }
    var M = ku(t, 0, !1, null, null, !1, !1, "", Fh);
    return t._reactRootContainer = M, t[rn] = M.current, Pi(t.nodeType === 8 ? t.parentNode : t), tr(function() {
      Es(r, M, s, u);
    }), M;
  }
  function Rs(t, r, s, u, p) {
    var m = s._reactRootContainer;
    if (m) {
      var _ = m;
      if (typeof p == "function") {
        var E = p;
        p = function() {
          var M = Ps(_);
          E.call(M);
        };
      }
      Es(r, _, t, p);
    } else _ = ix(s, r, t, p, u);
    return Ps(_);
  }
  yf = function(t) {
    switch (t.tag) {
      case 3:
        var r = t.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var s = pi(r.pendingLanes);
          s !== 0 && (Za(r, s | 1), dt(r, Oe()), (ye & 6) === 0 && (Vr = Oe() + 500, Cn()));
        }
        break;
      case 13:
        tr(function() {
          var u = ln(t, 1);
          if (u !== null) {
            var p = rt();
            Ot(u, t, 1, p);
          }
        }), Au(t, 1);
    }
  }, Ja = function(t) {
    if (t.tag === 13) {
      var r = ln(t, 134217728);
      if (r !== null) {
        var s = rt();
        Ot(r, t, 134217728, s);
      }
      Au(t, 134217728);
    }
  }, gf = function(t) {
    if (t.tag === 13) {
      var r = Nn(t), s = ln(t, r);
      if (s !== null) {
        var u = rt();
        Ot(s, t, r, u);
      }
      Au(t, r);
    }
  }, vf = function() {
    return _e;
  }, Sf = function(t, r) {
    var s = _e;
    try {
      return _e = t, r();
    } finally {
      _e = s;
    }
  }, Ha = function(t, r, s) {
    switch (r) {
      case "input":
        if (Fa(t, s), r = s.name, s.type === "radio" && r != null) {
          for (s = t; s.parentNode; ) s = s.parentNode;
          for (s = s.querySelectorAll("input[name=" + JSON.stringify("" + r) + '][type="radio"]'), r = 0; r < s.length; r++) {
            var u = s[r];
            if (u !== t && u.form === t.form) {
              var p = Yo(u);
              if (!p) throw Error(i(90));
              Ud(u), Fa(u, p);
            }
          }
        }
        break;
      case "textarea":
        Kd(t, s);
        break;
      case "select":
        r = s.value, r != null && yr(t, !!s.multiple, r, !1);
    }
  }, nf = vu, rf = tr;
  var ox = { usingClientEntryPoint: !1, Events: [Ri, Cr, Yo, ef, tf, vu] }, Wi = { findFiberByHostInstance: Kn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, sx = { bundleType: Wi.bundleType, version: Wi.version, rendererPackageName: Wi.rendererPackageName, rendererConfig: Wi.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: D.ReactCurrentDispatcher, findHostInstanceByFiber: function(t) {
    return t = lf(t), t === null ? null : t.stateNode;
  }, findFiberByHostInstance: Wi.findFiberByHostInstance || rx, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Ns = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Ns.isDisabled && Ns.supportsFiber) try {
      bo = Ns.inject(sx), Ht = Ns;
    } catch {
    }
  }
  return ft.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ox, ft.createPortal = function(t, r) {
    var s = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Eu(r)) throw Error(i(200));
    return nx(t, r, null, s);
  }, ft.createRoot = function(t, r) {
    if (!Eu(t)) throw Error(i(299));
    var s = !1, u = "", p = Ih;
    return r != null && (r.unstable_strictMode === !0 && (s = !0), r.identifierPrefix !== void 0 && (u = r.identifierPrefix), r.onRecoverableError !== void 0 && (p = r.onRecoverableError)), r = ku(t, 1, !1, null, null, s, !1, u, p), t[rn] = r.current, Pi(t.nodeType === 8 ? t.parentNode : t), new Cu(r);
  }, ft.findDOMNode = function(t) {
    if (t == null) return null;
    if (t.nodeType === 1) return t;
    var r = t._reactInternals;
    if (r === void 0)
      throw typeof t.render == "function" ? Error(i(188)) : (t = Object.keys(t).join(","), Error(i(268, t)));
    return t = lf(r), t = t === null ? null : t.stateNode, t;
  }, ft.flushSync = function(t) {
    return tr(t);
  }, ft.hydrate = function(t, r, s) {
    if (!Ms(r)) throw Error(i(200));
    return Rs(null, t, r, !0, s);
  }, ft.hydrateRoot = function(t, r, s) {
    if (!Eu(t)) throw Error(i(405));
    var u = s != null && s.hydratedSources || null, p = !1, m = "", _ = Ih;
    if (s != null && (s.unstable_strictMode === !0 && (p = !0), s.identifierPrefix !== void 0 && (m = s.identifierPrefix), s.onRecoverableError !== void 0 && (_ = s.onRecoverableError)), r = Dh(r, null, t, 1, s ?? null, p, !1, m, _), t[rn] = r.current, Pi(t), u) for (t = 0; t < u.length; t++) s = u[t], p = s._getVersion, p = p(s._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [s, p] : r.mutableSourceEagerHydrationData.push(
      s,
      p
    );
    return new bs(r);
  }, ft.render = function(t, r, s) {
    if (!Ms(r)) throw Error(i(200));
    return Rs(null, t, r, !1, s);
  }, ft.unmountComponentAtNode = function(t) {
    if (!Ms(t)) throw Error(i(40));
    return t._reactRootContainer ? (tr(function() {
      Rs(null, null, t, !1, function() {
        t._reactRootContainer = null, t[rn] = null;
      });
    }), !0) : !1;
  }, ft.unstable_batchedUpdates = vu, ft.unstable_renderSubtreeIntoContainer = function(t, r, s, u) {
    if (!Ms(s)) throw Error(i(200));
    if (t == null || t._reactInternals === void 0) throw Error(i(38));
    return Rs(t, r, s, !1, u);
  }, ft.version = "18.3.1-next-f1338f8080-20240426", ft;
}
var Wh;
function Qy() {
  if (Wh) return bu.exports;
  Wh = 1;
  function e() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (n) {
        console.error(n);
      }
  }
  return e(), bu.exports = gx(), bu.exports;
}
var Gh;
function vx() {
  if (Gh) return js;
  Gh = 1;
  var e = Qy();
  return js.createRoot = e.createRoot, js.hydrateRoot = e.hydrateRoot, js;
}
var Sx = vx(), Nu = { exports: {} }, Ki = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Kh;
function wx() {
  if (Kh) return Ki;
  Kh = 1;
  var e = Qc(), n = Symbol.for("react.element"), i = Symbol.for("react.fragment"), o = Object.prototype.hasOwnProperty, a = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function d(f, y, v) {
    var S, l = {}, h = null, g = null;
    v !== void 0 && (h = "" + v), y.key !== void 0 && (h = "" + y.key), y.ref !== void 0 && (g = y.ref);
    for (S in y) o.call(y, S) && !c.hasOwnProperty(S) && (l[S] = y[S]);
    if (f && f.defaultProps) for (S in y = f.defaultProps, y) l[S] === void 0 && (l[S] = y[S]);
    return { $$typeof: n, type: f, key: h, ref: g, props: l, _owner: a.current };
  }
  return Ki.Fragment = i, Ki.jsx = d, Ki.jsxs = d, Ki;
}
var Yh;
function xx() {
  return Yh || (Yh = 1, Nu.exports = wx()), Nu.exports;
}
var w = xx();
const Qh = (e) => Symbol.iterator in e, Xh = (e) => (
  // HACK: avoid checking entries type
  "entries" in e
), Zh = (e, n) => {
  const i = e instanceof Map ? e : new Map(e.entries()), o = n instanceof Map ? n : new Map(n.entries());
  if (i.size !== o.size)
    return !1;
  for (const [a, c] of i)
    if (!o.has(a) || !Object.is(c, o.get(a)))
      return !1;
  return !0;
}, _x = (e, n) => {
  const i = e[Symbol.iterator](), o = n[Symbol.iterator]();
  let a = i.next(), c = o.next();
  for (; !a.done && !c.done; ) {
    if (!Object.is(a.value, c.value))
      return !1;
    a = i.next(), c = o.next();
  }
  return !!a.done && !!c.done;
};
function Tx(e, n) {
  return Object.is(e, n) ? !0 : typeof e != "object" || e === null || typeof n != "object" || n === null || Object.getPrototypeOf(e) !== Object.getPrototypeOf(n) ? !1 : Qh(e) && Qh(n) ? Xh(e) && Xh(n) ? Zh(e, n) : _x(e, n) : Zh(
    { entries: () => Object.entries(e) },
    { entries: () => Object.entries(n) }
  );
}
function kx(e) {
  const n = mn.useRef(void 0);
  return (i) => {
    const o = e(i);
    return Tx(n.current, o) ? n.current : n.current = o;
  };
}
const Zc = C.createContext({});
function Jc(e) {
  const n = C.useRef(null);
  return n.current === null && (n.current = e()), n.current;
}
const Ax = typeof window < "u", qc = Ax ? C.useLayoutEffect : C.useEffect, ka = /* @__PURE__ */ C.createContext(null);
function ed(e, n) {
  e.indexOf(n) === -1 && e.push(n);
}
function aa(e, n) {
  const i = e.indexOf(n);
  i > -1 && e.splice(i, 1);
}
const nn = (e, n, i) => i > n ? n : i < e ? e : i;
function Jh(e, n) {
  return n ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${n}` : e;
}
let go = () => {
}, mr = () => {
};
var $y;
typeof process < "u" && (($y = process.env) == null ? void 0 : $y.NODE_ENV) !== "production" && (go = (e, n, i) => {
  !e && typeof console < "u" && console.warn(Jh(n, i));
}, mr = (e, n, i) => {
  if (!e)
    throw new Error(Jh(n, i));
});
const Un = {}, Xy = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), Zy = (e) => typeof e == "object" && e !== null, Jy = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function qy(e) {
  let n;
  return () => (n === void 0 && (n = e()), n);
}
const Mt = /* @__NO_SIDE_EFFECTS__ */ (e) => e, vo = (...e) => e.reduce((n, i) => (o) => i(n(o))), so = /* @__NO_SIDE_EFFECTS__ */ (e, n, i) => {
  const o = n - e;
  return o ? (i - e) / o : 1;
};
class td {
  constructor() {
    this.subscriptions = [];
  }
  add(n) {
    return ed(this.subscriptions, n), () => aa(this.subscriptions, n);
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
const mt = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, bt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, eg = /* @__NO_SIDE_EFFECTS__ */ (e, n) => n ? e * (1e3 / n) : 0, tg = (e, n, i) => (((1 - 3 * i + 3 * n) * e + (3 * i - 6 * n)) * e + 3 * n) * e, Cx = 1e-7, Ex = 12;
function Px(e, n, i, o, a) {
  let c, d, f = 0;
  do
    d = n + (i - n) / 2, c = tg(d, o, a) - e, c > 0 ? i = d : n = d;
  while (Math.abs(c) > Cx && ++f < Ex);
  return d;
}
// @__NO_SIDE_EFFECTS__
function So(e, n, i, o) {
  if (e === n && i === o)
    return Mt;
  const a = (c) => Px(c, 0, 1, e, i);
  return (c) => c === 0 || c === 1 ? c : tg(a(c), n, o);
}
const ng = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => n <= 0.5 ? e(2 * n) / 2 : (2 - e(2 * (1 - n))) / 2, rg = /* @__NO_SIDE_EFFECTS__ */ (e) => (n) => 1 - e(1 - n), ig = /* @__PURE__ */ So(0.33, 1.53, 0.69, 0.99), nd = /* @__PURE__ */ rg(ig), og = /* @__PURE__ */ ng(nd), sg = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * nd(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), rd = (e) => 1 - Math.sin(Math.acos(e)), ag = /* @__PURE__ */ rg(rd), lg = /* @__PURE__ */ ng(rd), bx = /* @__PURE__ */ So(0.42, 0, 1, 1), Mx = /* @__PURE__ */ So(0, 0, 0.58, 1), ug = /* @__PURE__ */ So(0.42, 0, 0.58, 1), Rx = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number", cg = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", qh = {
  linear: Mt,
  easeIn: bx,
  easeInOut: ug,
  easeOut: Mx,
  circIn: rd,
  circInOut: lg,
  circOut: ag,
  backIn: nd,
  backInOut: og,
  backOut: ig,
  anticipate: sg
}, Nx = (e) => typeof e == "string", em = (e) => {
  if (/* @__PURE__ */ cg(e)) {
    mr(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [n, i, o, a] = e;
    return /* @__PURE__ */ So(n, i, o, a);
  } else if (Nx(e))
    return mr(qh[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), qh[e];
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
function Dx(e) {
  let n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), o = !1, a = !1;
  const c = /* @__PURE__ */ new WeakSet();
  let d = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function f(v) {
    c.has(v) && (y.schedule(v), e()), v(d);
  }
  const y = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (v, S = !1, l = !1) => {
      const g = l && o ? n : i;
      return S && c.add(v), g.add(v), v;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (v) => {
      i.delete(v), c.delete(v);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (v) => {
      if (d = v, o) {
        a = !0;
        return;
      }
      o = !0;
      const S = n;
      n = i, i = S, n.forEach(f), n.clear(), o = !1, a && (a = !1, y.process(v));
    }
  };
  return y;
}
const jx = 40;
function dg(e, n) {
  let i = !1, o = !0;
  const a = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, c = () => i = !0, d = Is.reduce((b, D) => (b[D] = Dx(c), b), {}), { setup: f, read: y, resolveKeyframes: v, preUpdate: S, update: l, preRender: h, render: g, postRender: x } = d, T = () => {
    const b = Un.useManualTiming, D = b ? a.timestamp : performance.now();
    i = !1, b || (a.delta = o ? 1e3 / 60 : Math.max(Math.min(D - a.timestamp, jx), 1)), a.timestamp = D, a.isProcessing = !0, f.process(a), y.process(a), v.process(a), S.process(a), l.process(a), h.process(a), g.process(a), x.process(a), a.isProcessing = !1, i && n && (o = !1, e(T));
  }, k = () => {
    i = !0, o = !0, a.isProcessing || e(T);
  };
  return { schedule: Is.reduce((b, D) => {
    const L = d[D];
    return b[D] = (K, Q = !1, $ = !1) => (i || k(), L.schedule(K, Q, $)), b;
  }, {}), cancel: (b) => {
    for (let D = 0; D < Is.length; D++)
      d[Is[D]].cancel(b);
  }, state: a, steps: d };
}
const { schedule: Ae, cancel: $n, state: Xe, steps: Du } = /* @__PURE__ */ dg(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Mt, !0);
let Ks;
function Ix() {
  Ks = void 0;
}
const it = {
  now: () => (Ks === void 0 && it.set(Xe.isProcessing || Un.useManualTiming ? Xe.timestamp : performance.now()), Ks),
  set: (e) => {
    Ks = e, queueMicrotask(Ix);
  }
}, fg = (e) => (n) => typeof n == "string" && n.startsWith(e), pg = /* @__PURE__ */ fg("--"), Fx = /* @__PURE__ */ fg("var(--"), id = (e) => Fx(e) ? Ox.test(e.split("/*")[0].trim()) : !1, Ox = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function tm(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
const ri = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, ao = {
  ...ri,
  transform: (e) => nn(0, 1, e)
}, Fs = {
  ...ri,
  default: 1
}, qi = (e) => Math.round(e * 1e5) / 1e5, od = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function Lx(e) {
  return e == null;
}
const Vx = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, sd = (e, n) => (i) => !!(typeof i == "string" && Vx.test(i) && i.startsWith(e) || n && !Lx(i) && Object.prototype.hasOwnProperty.call(i, n)), hg = (e, n, i) => (o) => {
  if (typeof o != "string")
    return o;
  const [a, c, d, f] = o.match(od);
  return {
    [e]: parseFloat(a),
    [n]: parseFloat(c),
    [i]: parseFloat(d),
    alpha: f !== void 0 ? parseFloat(f) : 1
  };
}, Bx = (e) => nn(0, 255, e), ju = {
  ...ri,
  transform: (e) => Math.round(Bx(e))
}, ur = {
  test: /* @__PURE__ */ sd("rgb", "red"),
  parse: /* @__PURE__ */ hg("red", "green", "blue"),
  transform: ({ red: e, green: n, blue: i, alpha: o = 1 }) => "rgba(" + ju.transform(e) + ", " + ju.transform(n) + ", " + ju.transform(i) + ", " + qi(ao.transform(o)) + ")"
};
function zx(e) {
  let n = "", i = "", o = "", a = "";
  return e.length > 5 ? (n = e.substring(1, 3), i = e.substring(3, 5), o = e.substring(5, 7), a = e.substring(7, 9)) : (n = e.substring(1, 2), i = e.substring(2, 3), o = e.substring(3, 4), a = e.substring(4, 5), n += n, i += i, o += o, a += a), {
    red: parseInt(n, 16),
    green: parseInt(i, 16),
    blue: parseInt(o, 16),
    alpha: a ? parseInt(a, 16) / 255 : 1
  };
}
const sc = {
  test: /* @__PURE__ */ sd("#"),
  parse: zx,
  transform: ur.transform
}, wo = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (n) => typeof n == "string" && n.endsWith(e) && n.split(" ").length === 1,
  parse: parseFloat,
  transform: (n) => `${n}${e}`
}), hn = /* @__PURE__ */ wo("deg"), en = /* @__PURE__ */ wo("%"), ne = /* @__PURE__ */ wo("px"), Ux = /* @__PURE__ */ wo("vh"), $x = /* @__PURE__ */ wo("vw"), nm = {
  ...en,
  parse: (e) => en.parse(e) / 100,
  transform: (e) => en.transform(e * 100)
}, Gr = {
  test: /* @__PURE__ */ sd("hsl", "hue"),
  parse: /* @__PURE__ */ hg("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: n, lightness: i, alpha: o = 1 }) => "hsla(" + Math.round(e) + ", " + en.transform(qi(n)) + ", " + en.transform(qi(i)) + ", " + qi(ao.transform(o)) + ")"
}, Be = {
  test: (e) => ur.test(e) || sc.test(e) || Gr.test(e),
  parse: (e) => ur.test(e) ? ur.parse(e) : Gr.test(e) ? Gr.parse(e) : sc.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? ur.transform(e) : Gr.transform(e),
  getAnimatableNone: (e) => {
    const n = Be.parse(e);
    return n.alpha = 0, Be.transform(n);
  }
}, Hx = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function Wx(e) {
  var n, i;
  return isNaN(e) && typeof e == "string" && (((n = e.match(od)) == null ? void 0 : n.length) || 0) + (((i = e.match(Hx)) == null ? void 0 : i.length) || 0) > 0;
}
const mg = "number", yg = "color", Gx = "var", Kx = "var(", rm = "${}", Yx = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Jr(e) {
  const n = e.toString(), i = [], o = {
    color: [],
    number: [],
    var: []
  }, a = [];
  let c = 0;
  const f = n.replace(Yx, (y) => (Be.test(y) ? (o.color.push(c), a.push(yg), i.push(Be.parse(y))) : y.startsWith(Kx) ? (o.var.push(c), a.push(Gx), i.push(y)) : (o.number.push(c), a.push(mg), i.push(parseFloat(y))), ++c, rm)).split(rm);
  return { values: i, split: f, indexes: o, types: a };
}
function Qx(e) {
  return Jr(e).values;
}
function gg({ split: e, types: n }) {
  const i = e.length;
  return (o) => {
    let a = "";
    for (let c = 0; c < i; c++)
      if (a += e[c], o[c] !== void 0) {
        const d = n[c];
        d === mg ? a += qi(o[c]) : d === yg ? a += Be.transform(o[c]) : a += o[c];
      }
    return a;
  };
}
function Xx(e) {
  return gg(Jr(e));
}
const Zx = (e) => typeof e == "number" ? 0 : Be.test(e) ? Be.getAnimatableNone(e) : e, Jx = (e, n) => typeof e == "number" ? n != null && n.trim().endsWith("/") ? e : 0 : Zx(e);
function qx(e) {
  const n = Jr(e);
  return gg(n)(n.values.map((o, a) => Jx(o, n.split[a])));
}
const Ut = {
  test: Wx,
  parse: Qx,
  createTransformer: Xx,
  getAnimatableNone: qx
};
function Iu(e, n, i) {
  return i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? e + (n - e) * 6 * i : i < 1 / 2 ? n : i < 2 / 3 ? e + (n - e) * (2 / 3 - i) * 6 : e;
}
function e1({ hue: e, saturation: n, lightness: i, alpha: o }) {
  e /= 360, n /= 100, i /= 100;
  let a = 0, c = 0, d = 0;
  if (!n)
    a = c = d = i;
  else {
    const f = i < 0.5 ? i * (1 + n) : i + n - i * n, y = 2 * i - f;
    a = Iu(y, f, e + 1 / 3), c = Iu(y, f, e), d = Iu(y, f, e - 1 / 3);
  }
  return {
    red: Math.round(a * 255),
    green: Math.round(c * 255),
    blue: Math.round(d * 255),
    alpha: o
  };
}
function la(e, n) {
  return (i) => i > 0 ? n : e;
}
const Te = (e, n, i) => e + (n - e) * i, Fu = (e, n, i) => {
  const o = e * e, a = i * (n * n - o) + o;
  return a < 0 ? 0 : Math.sqrt(a);
}, t1 = [sc, ur, Gr], n1 = (e) => t1.find((n) => n.test(e));
function im(e) {
  const n = n1(e);
  if (go(!!n, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !n)
    return !1;
  let i = n.parse(e);
  return n === Gr && (i = e1(i)), i;
}
const om = (e, n) => {
  const i = im(e), o = im(n);
  if (!i || !o)
    return la(e, n);
  const a = { ...i };
  return (c) => (a.red = Fu(i.red, o.red, c), a.green = Fu(i.green, o.green, c), a.blue = Fu(i.blue, o.blue, c), a.alpha = Te(i.alpha, o.alpha, c), ur.transform(a));
}, ac = /* @__PURE__ */ new Set(["none", "hidden"]);
function r1(e, n) {
  return ac.has(e) ? (i) => i <= 0 ? e : n : (i) => i >= 1 ? n : e;
}
function i1(e, n) {
  return (i) => Te(e, n, i);
}
function ad(e) {
  return typeof e == "number" ? i1 : typeof e == "string" ? id(e) ? la : Be.test(e) ? om : a1 : Array.isArray(e) ? vg : typeof e == "object" ? Be.test(e) ? om : o1 : la;
}
function vg(e, n) {
  const i = [...e], o = i.length, a = e.map((c, d) => ad(c)(c, n[d]));
  return (c) => {
    for (let d = 0; d < o; d++)
      i[d] = a[d](c);
    return i;
  };
}
function o1(e, n) {
  const i = { ...e, ...n }, o = {};
  for (const a in i)
    e[a] !== void 0 && n[a] !== void 0 && (o[a] = ad(e[a])(e[a], n[a]));
  return (a) => {
    for (const c in o)
      i[c] = o[c](a);
    return i;
  };
}
function s1(e, n) {
  const i = [], o = { color: 0, var: 0, number: 0 };
  for (let a = 0; a < n.values.length; a++) {
    const c = n.types[a], d = e.indexes[c][o[c]], f = e.values[d] ?? 0;
    i[a] = f, o[c]++;
  }
  return i;
}
const a1 = (e, n) => {
  const i = Ut.createTransformer(n), o = Jr(e), a = Jr(n);
  return o.indexes.var.length === a.indexes.var.length && o.indexes.color.length === a.indexes.color.length && o.indexes.number.length >= a.indexes.number.length ? ac.has(e) && !a.values.length || ac.has(n) && !o.values.length ? r1(e, n) : vo(vg(s1(o, a), a.values), i) : (go(!0, `Complex values '${e}' and '${n}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), la(e, n));
};
function Sg(e, n, i) {
  return typeof e == "number" && typeof n == "number" && typeof i == "number" ? Te(e, n, i) : ad(e)(e, n);
}
const l1 = (e) => {
  const n = ({ timestamp: i }) => e(i);
  return {
    start: (i = !0) => Ae.update(n, i),
    stop: () => $n(n),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Xe.isProcessing ? Xe.timestamp : it.now()
  };
}, wg = (e, n, i = 10) => {
  let o = "";
  const a = Math.max(Math.round(n / i), 2);
  for (let c = 0; c < a; c++)
    o += Math.round(e(c / (a - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${o.substring(0, o.length - 2)})`;
}, ua = 2e4;
function ld(e) {
  let n = 0;
  const i = 50;
  let o = e.next(n);
  for (; !o.done && n < ua; )
    n += i, o = e.next(n);
  return n >= ua ? 1 / 0 : n;
}
function u1(e, n = 100, i) {
  const o = i({ ...e, keyframes: [0, n] }), a = Math.min(ld(o), ua);
  return {
    type: "keyframes",
    ease: (c) => o.next(a * c).value / n,
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
function lc(e, n) {
  return e * Math.sqrt(1 - n * n);
}
const c1 = 12;
function d1(e, n, i) {
  let o = i;
  for (let a = 1; a < c1; a++)
    o = o - e(o) / n(o);
  return o;
}
const Ou = 1e-3;
function f1({ duration: e = Ie.duration, bounce: n = Ie.bounce, velocity: i = Ie.velocity, mass: o = Ie.mass }) {
  let a, c;
  go(e <= /* @__PURE__ */ mt(Ie.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let d = 1 - n;
  d = nn(Ie.minDamping, Ie.maxDamping, d), e = nn(Ie.minDuration, Ie.maxDuration, /* @__PURE__ */ bt(e)), d < 1 ? (a = (v) => {
    const S = v * d, l = S * e, h = S - i, g = lc(v, d), x = Math.exp(-l);
    return Ou - h / g * x;
  }, c = (v) => {
    const l = v * d * e, h = l * i + i, g = Math.pow(d, 2) * Math.pow(v, 2) * e, x = Math.exp(-l), T = lc(Math.pow(v, 2), d);
    return (-a(v) + Ou > 0 ? -1 : 1) * ((h - g) * x) / T;
  }) : (a = (v) => {
    const S = Math.exp(-v * e), l = (v - i) * e + 1;
    return -Ou + S * l;
  }, c = (v) => {
    const S = Math.exp(-v * e), l = (i - v) * (e * e);
    return S * l;
  });
  const f = 5 / e, y = d1(a, c, f);
  if (e = /* @__PURE__ */ mt(e), isNaN(y))
    return {
      stiffness: Ie.stiffness,
      damping: Ie.damping,
      duration: e
    };
  {
    const v = Math.pow(y, 2) * o;
    return {
      stiffness: v,
      damping: d * 2 * Math.sqrt(o * v),
      duration: e
    };
  }
}
const p1 = ["duration", "bounce"], h1 = ["stiffness", "damping", "mass"];
function sm(e, n) {
  return n.some((i) => e[i] !== void 0);
}
function m1(e) {
  let n = {
    velocity: Ie.velocity,
    stiffness: Ie.stiffness,
    damping: Ie.damping,
    mass: Ie.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!sm(e, h1) && sm(e, p1))
    if (n.velocity = 0, e.visualDuration) {
      const i = e.visualDuration, o = 2 * Math.PI / (i * 1.2), a = o * o, c = 2 * nn(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(a);
      n = {
        ...n,
        mass: Ie.mass,
        stiffness: a,
        damping: c
      };
    } else {
      const i = f1({ ...e, velocity: 0 });
      n = {
        ...n,
        ...i,
        mass: Ie.mass
      }, n.isResolvedFromDuration = !0;
    }
  return n;
}
function ca(e = Ie.visualDuration, n = Ie.bounce) {
  const i = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: n
  } : e;
  let { restSpeed: o, restDelta: a } = i;
  const c = i.keyframes[0], d = i.keyframes[i.keyframes.length - 1], f = { done: !1, value: c }, { stiffness: y, damping: v, mass: S, duration: l, velocity: h, isResolvedFromDuration: g } = m1({
    ...i,
    velocity: -/* @__PURE__ */ bt(i.velocity || 0)
  }), x = h || 0, T = v / (2 * Math.sqrt(y * S)), k = d - c, A = /* @__PURE__ */ bt(Math.sqrt(y / S)), R = Math.abs(k) < 5;
  o || (o = R ? Ie.restSpeed.granular : Ie.restSpeed.default), a || (a = R ? Ie.restDelta.granular : Ie.restDelta.default);
  let b, D, L, K, Q, $;
  if (T < 1)
    L = lc(A, T), K = (x + T * A * k) / L, b = (X) => {
      const J = Math.exp(-T * A * X);
      return d - J * (K * Math.sin(L * X) + k * Math.cos(L * X));
    }, Q = T * A * K + k * L, $ = T * A * k - K * L, D = (X) => Math.exp(-T * A * X) * (Q * Math.sin(L * X) + $ * Math.cos(L * X));
  else if (T === 1) {
    b = (J) => d - Math.exp(-A * J) * (k + (x + A * k) * J);
    const X = x + A * k;
    D = (J) => Math.exp(-A * J) * (A * X * J - x);
  } else {
    const X = A * Math.sqrt(T * T - 1);
    b = (pe) => {
      const we = Math.exp(-T * A * pe), ue = Math.min(X * pe, 300);
      return d - we * ((x + T * A * k) * Math.sinh(ue) + X * k * Math.cosh(ue)) / X;
    };
    const J = (x + T * A * k) / X, ce = T * A * J - k * X, me = T * A * k - J * X;
    D = (pe) => {
      const we = Math.exp(-T * A * pe), ue = Math.min(X * pe, 300);
      return we * (ce * Math.sinh(ue) + me * Math.cosh(ue));
    };
  }
  const W = {
    calculatedDuration: g && l || null,
    velocity: (X) => /* @__PURE__ */ mt(D(X)),
    next: (X) => {
      if (!g && T < 1) {
        const ce = Math.exp(-T * A * X), me = Math.sin(L * X), pe = Math.cos(L * X), we = d - ce * (K * me + k * pe), ue = /* @__PURE__ */ mt(ce * (Q * me + $ * pe));
        return f.done = Math.abs(ue) <= o && Math.abs(d - we) <= a, f.value = f.done ? d : we, f;
      }
      const J = b(X);
      if (g)
        f.done = X >= l;
      else {
        const ce = /* @__PURE__ */ mt(D(X));
        f.done = Math.abs(ce) <= o && Math.abs(d - J) <= a;
      }
      return f.value = f.done ? d : J, f;
    },
    toString: () => {
      const X = Math.min(ld(W), ua), J = wg((ce) => W.next(X * ce).value, X, 30);
      return X + "ms " + J;
    },
    toTransition: () => {
    }
  };
  return W;
}
ca.applyToOptions = (e) => {
  const n = u1(e, 100, ca);
  return e.ease = n.ease, e.duration = /* @__PURE__ */ mt(n.duration), e.type = "keyframes", e;
};
const y1 = 5;
function xg(e, n, i) {
  const o = Math.max(n - y1, 0);
  return /* @__PURE__ */ eg(i - e(o), n - o);
}
function uc({ keyframes: e, velocity: n = 0, power: i = 0.8, timeConstant: o = 325, bounceDamping: a = 10, bounceStiffness: c = 500, modifyTarget: d, min: f, max: y, restDelta: v = 0.5, restSpeed: S }) {
  const l = e[0], h = {
    done: !1,
    value: l
  }, g = ($) => f !== void 0 && $ < f || y !== void 0 && $ > y, x = ($) => f === void 0 ? y : y === void 0 || Math.abs(f - $) < Math.abs(y - $) ? f : y;
  let T = i * n;
  const k = l + T, A = d === void 0 ? k : d(k);
  A !== k && (T = A - l);
  const R = ($) => -T * Math.exp(-$ / o), b = ($) => A + R($), D = ($) => {
    const W = R($), X = b($);
    h.done = Math.abs(W) <= v, h.value = h.done ? A : X;
  };
  let L, K;
  const Q = ($) => {
    g(h.value) && (L = $, K = ca({
      keyframes: [h.value, x(h.value)],
      velocity: xg(b, $, h.value),
      // TODO: This should be passing * 1000
      damping: a,
      stiffness: c,
      restDelta: v,
      restSpeed: S
    }));
  };
  return Q(0), {
    calculatedDuration: null,
    next: ($) => {
      let W = !1;
      return !K && L === void 0 && (W = !0, D($), Q($)), L !== void 0 && $ >= L ? K.next($ - L) : (!W && D($), h);
    }
  };
}
function g1(e, n, i) {
  const o = [], a = i || Un.mix || Sg, c = e.length - 1;
  for (let d = 0; d < c; d++) {
    let f = a(e[d], e[d + 1]);
    if (n) {
      const y = Array.isArray(n) ? n[d] || Mt : n;
      f = vo(y, f);
    }
    o.push(f);
  }
  return o;
}
function v1(e, n, { clamp: i = !0, ease: o, mixer: a } = {}) {
  const c = e.length;
  if (mr(c === n.length, "Both input and output ranges must be the same length", "range-length"), c === 1)
    return () => n[0];
  if (c === 2 && n[0] === n[1])
    return () => n[1];
  const d = e[0] === e[1];
  e[0] > e[c - 1] && (e = [...e].reverse(), n = [...n].reverse());
  const f = g1(n, o, a), y = f.length, v = (S) => {
    if (d && S < e[0])
      return n[0];
    let l = 0;
    if (y > 1)
      for (; l < e.length - 2 && !(S < e[l + 1]); l++)
        ;
    const h = /* @__PURE__ */ so(e[l], e[l + 1], S);
    return f[l](h);
  };
  return i ? (S) => v(nn(e[0], e[c - 1], S)) : v;
}
function S1(e, n) {
  const i = e[e.length - 1];
  for (let o = 1; o <= n; o++) {
    const a = /* @__PURE__ */ so(0, n, o);
    e.push(Te(i, 1, a));
  }
}
function w1(e) {
  const n = [0];
  return S1(n, e.length - 1), n;
}
function x1(e, n) {
  return e.map((i) => i * n);
}
function _1(e, n) {
  return e.map(() => n || ug).splice(0, e.length - 1);
}
function eo({ duration: e = 300, keyframes: n, times: i, ease: o = "easeInOut" }) {
  const a = /* @__PURE__ */ Rx(o) ? o.map(em) : em(o), c = {
    done: !1,
    value: n[0]
  }, d = x1(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    i && i.length === n.length ? i : w1(n),
    e
  ), f = v1(d, n, {
    ease: Array.isArray(a) ? a : _1(n, a)
  });
  return {
    calculatedDuration: e,
    next: (y) => (c.value = f(y), c.done = y >= e, c)
  };
}
const T1 = (e) => e !== null;
function Aa(e, { repeat: n, repeatType: i = "loop" }, o, a = 1) {
  const c = e.filter(T1), f = a < 0 || n && i !== "loop" && n % 2 === 1 ? 0 : c.length - 1;
  return !f || o === void 0 ? c[f] : o;
}
const k1 = {
  decay: uc,
  inertia: uc,
  tween: eo,
  keyframes: eo,
  spring: ca
};
function _g(e) {
  typeof e.type == "string" && (e.type = k1[e.type]);
}
class ud {
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
const A1 = (e) => e / 100;
class da extends ud {
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
    _g(n);
    const { type: i = eo, repeat: o = 0, repeatDelay: a = 0, repeatType: c, velocity: d = 0 } = n;
    let { keyframes: f } = n;
    const y = i || eo;
    y !== eo && typeof f[0] != "number" && (this.mixKeyframes = vo(A1, Sg(f[0], f[1])), f = [0, 100]);
    const v = y({ ...n, keyframes: f });
    c === "mirror" && (this.mirroredGenerator = y({
      ...n,
      keyframes: [...f].reverse(),
      velocity: -d
    })), v.calculatedDuration === null && (v.calculatedDuration = ld(v));
    const { calculatedDuration: S } = v;
    this.calculatedDuration = S, this.resolvedDuration = S + a, this.totalDuration = this.resolvedDuration * (o + 1) - a, this.generator = v;
  }
  updateTime(n) {
    const i = Math.round(n - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = i;
  }
  tick(n, i = !1) {
    const { generator: o, totalDuration: a, mixKeyframes: c, mirroredGenerator: d, resolvedDuration: f, calculatedDuration: y } = this;
    if (this.startTime === null)
      return o.next(0);
    const { delay: v = 0, keyframes: S, repeat: l, repeatType: h, repeatDelay: g, type: x, onUpdate: T, finalKeyframe: k } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, n) : this.speed < 0 && (this.startTime = Math.min(n - a / this.speed, this.startTime)), i ? this.currentTime = n : this.updateTime(n);
    const A = this.currentTime - v * (this.playbackSpeed >= 0 ? 1 : -1), R = this.playbackSpeed >= 0 ? A < 0 : A > a;
    this.currentTime = Math.max(A, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = a);
    let b = this.currentTime, D = o;
    if (l) {
      const $ = Math.min(this.currentTime, a) / f;
      let W = Math.floor($), X = $ % 1;
      !X && $ >= 1 && (X = 1), X === 1 && W--, W = Math.min(W, l + 1), !!(W % 2) && (h === "reverse" ? (X = 1 - X, g && (X -= g / f)) : h === "mirror" && (D = d)), b = nn(0, 1, X) * f;
    }
    let L;
    R ? (this.delayState.value = S[0], L = this.delayState) : L = D.next(b), c && !R && (L.value = c(L.value));
    let { done: K } = L;
    !R && y !== null && (K = this.playbackSpeed >= 0 ? this.currentTime >= a : this.currentTime <= 0);
    const Q = this.holdTime === null && (this.state === "finished" || this.state === "running" && K);
    return Q && x !== uc && (L.value = Aa(S, this.options, k, this.speed)), T && T(L.value), Q && this.finish(), L;
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
    const i = this.generator.next(n).value;
    return xg((o) => this.generator.next(o).value, n, i);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(n) {
    const i = this.playbackSpeed !== n;
    i && this.driver && this.updateTime(it.now()), this.playbackSpeed = n, i && this.driver && (this.time = /* @__PURE__ */ bt(this.currentTime));
  }
  play() {
    var a, c;
    if (this.isStopped)
      return;
    const { driver: n = l1, startTime: i } = this.options;
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
function C1(e) {
  for (let n = 1; n < e.length; n++)
    e[n] ?? (e[n] = e[n - 1]);
}
const cr = (e) => e * 180 / Math.PI, cc = (e) => {
  const n = cr(Math.atan2(e[1], e[0]));
  return dc(n);
}, E1 = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: cc,
  rotateZ: cc,
  skewX: (e) => cr(Math.atan(e[1])),
  skewY: (e) => cr(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, dc = (e) => (e = e % 360, e < 0 && (e += 360), e), am = cc, lm = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), um = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), P1 = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: lm,
  scaleY: um,
  scale: (e) => (lm(e) + um(e)) / 2,
  rotateX: (e) => dc(cr(Math.atan2(e[6], e[5]))),
  rotateY: (e) => dc(cr(Math.atan2(-e[2], e[0]))),
  rotateZ: am,
  rotate: am,
  skewX: (e) => cr(Math.atan(e[4])),
  skewY: (e) => cr(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function fc(e) {
  return e.includes("scale") ? 1 : 0;
}
function pc(e, n) {
  if (!e || e === "none")
    return fc(n);
  const i = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let o, a;
  if (i)
    o = P1, a = i;
  else {
    const f = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    o = E1, a = f;
  }
  if (!a)
    return fc(n);
  const c = o[n], d = a[1].split(",").map(M1);
  return typeof c == "function" ? c(d) : d[c];
}
const b1 = (e, n) => {
  const { transform: i = "none" } = getComputedStyle(e);
  return pc(i, n);
};
function M1(e) {
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
], oi = /* @__PURE__ */ new Set([...ii, "pathRotation"]), cm = (e) => e === ri || e === ne, R1 = /* @__PURE__ */ new Set(["x", "y", "z"]), N1 = ii.filter((e) => !R1.has(e));
function D1(e) {
  const n = [];
  return N1.forEach((i) => {
    const o = e.getValue(i);
    o !== void 0 && (n.push([i, o.get()]), o.set(i.startsWith("scale") ? 1 : 0));
  }), n;
}
const zn = {
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
  x: (e, { transform: n }) => pc(n, "x"),
  y: (e, { transform: n }) => pc(n, "y")
};
zn.translateX = zn.x;
zn.translateY = zn.y;
const dr = /* @__PURE__ */ new Set();
let hc = !1, mc = !1, yc = !1;
function Tg() {
  if (mc) {
    const e = Array.from(dr).filter((o) => o.needsMeasurement), n = new Set(e.map((o) => o.element)), i = /* @__PURE__ */ new Map();
    n.forEach((o) => {
      const a = D1(o);
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
  mc = !1, hc = !1, dr.forEach((e) => e.complete(yc)), dr.clear();
}
function kg() {
  dr.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (mc = !0);
  });
}
function j1() {
  yc = !0, kg(), Tg(), yc = !1;
}
class cd {
  constructor(n, i, o, a, c, d = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...n], this.onComplete = i, this.name = o, this.motionValue = a, this.element = c, this.isAsync = d;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (dr.add(this), hc || (hc = !0, Ae.read(kg), Ae.resolveKeyframes(Tg))) : (this.readKeyframes(), this.complete());
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
    C1(n);
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
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, n), dr.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (dr.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const I1 = (e) => e.startsWith("--");
function Ag(e, n, i) {
  I1(n) ? e.style.setProperty(n, i) : e.style[n] = i;
}
const F1 = {};
function Cg(e, n) {
  const i = /* @__PURE__ */ qy(e);
  return () => F1[n] ?? i();
}
const O1 = /* @__PURE__ */ Cg(() => window.ScrollTimeline !== void 0, "scrollTimeline"), Eg = /* @__PURE__ */ Cg(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), Zi = ([e, n, i, o]) => `cubic-bezier(${e}, ${n}, ${i}, ${o})`, dm = {
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
function Pg(e, n) {
  if (e)
    return typeof e == "function" ? Eg() ? wg(e, n) : "ease-out" : /* @__PURE__ */ cg(e) ? Zi(e) : Array.isArray(e) ? e.map((i) => Pg(i, n) || dm.easeOut) : dm[e];
}
function L1(e, n, i, { delay: o = 0, duration: a = 300, repeat: c = 0, repeatType: d = "loop", ease: f = "easeOut", times: y } = {}, v = void 0) {
  const S = {
    [n]: i
  };
  y && (S.offset = y);
  const l = Pg(f, a);
  Array.isArray(l) && (S.easing = l);
  const h = {
    delay: o,
    duration: a,
    easing: Array.isArray(l) ? "linear" : l,
    fill: "both",
    iterations: c + 1,
    direction: d === "reverse" ? "alternate" : "normal"
  };
  return v && (h.pseudoElement = v), e.animate(S, h);
}
function bg(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function V1({ type: e, ...n }) {
  return bg(e) && Eg() ? e.applyToOptions(n) : (n.duration ?? (n.duration = 300), n.ease ?? (n.ease = "easeOut"), n);
}
class Mg extends ud {
  constructor(n) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !n)
      return;
    const { element: i, name: o, keyframes: a, pseudoElement: c, allowFlatten: d = !1, finalKeyframe: f, onComplete: y } = n;
    this.isPseudoElement = !!c, this.allowFlatten = d, this.options = n, mr(typeof n.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const v = V1(n);
    this.animation = L1(i, o, a, v, c), v.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !c) {
        const S = Aa(a, this.options, f, this.speed);
        this.updateMotionValue && this.updateMotionValue(S), Ag(i, o, S), this.animation.cancel();
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
    return this.allowFlatten && ((c = this.animation.effect) == null || c.updateTiming({ easing: "linear" })), this.animation.onfinish = null, n && O1() ? (this.animation.timeline = n, i && (this.animation.rangeStart = i), o && (this.animation.rangeEnd = o), Mt) : a(this);
  }
}
const Rg = {
  anticipate: sg,
  backInOut: og,
  circInOut: lg
};
function B1(e) {
  return e in Rg;
}
function z1(e) {
  typeof e.ease == "string" && B1(e.ease) && (e.ease = Rg[e.ease]);
}
const Lu = 10;
class U1 extends Mg {
  constructor(n) {
    z1(n), _g(n), super(n), n.startTime !== void 0 && n.autoplay !== !1 && (this.startTime = n.startTime), this.options = n;
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
    const f = new da({
      ...d,
      autoplay: !1
    }), y = Math.max(Lu, it.now() - this.startTime), v = nn(0, Lu, y - Lu), S = f.sample(y).value, { name: l } = this.options;
    c && l && Ag(c, l, S), i.setWithVelocity(f.sample(Math.max(0, y - v)).value, S, v), f.stop();
  }
}
const fm = (e, n) => n === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(Ut.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function $1(e) {
  const n = e[0];
  if (e.length === 1)
    return !0;
  for (let i = 0; i < e.length; i++)
    if (e[i] !== n)
      return !0;
}
function H1(e, n, i, o) {
  const a = e[0];
  if (a === null)
    return !1;
  if (n === "display" || n === "visibility")
    return !0;
  const c = e[e.length - 1], d = fm(a, n), f = fm(c, n);
  return go(d === f, `You are trying to animate ${n} from "${a}" to "${c}". "${d ? c : a}" is not an animatable value.`, "value-not-animatable"), !d || !f ? !1 : $1(e) || (i === "spring" || bg(i)) && o;
}
function gc(e) {
  e.duration = 0, e.type = "keyframes";
}
const Ng = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), W1 = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function G1(e) {
  for (let n = 0; n < e.length; n++)
    if (typeof e[n] == "string" && W1.test(e[n]))
      return !0;
  return !1;
}
const K1 = /* @__PURE__ */ new Set([
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
]), Y1 = /* @__PURE__ */ qy(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function Q1(e) {
  var l;
  const { motionValue: n, name: i, repeatDelay: o, repeatType: a, damping: c, type: d, keyframes: f } = e;
  if (!(((l = n == null ? void 0 : n.owner) == null ? void 0 : l.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: v, transformTemplate: S } = n.owner.getProps();
  return Y1() && i && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (Ng.has(i) || K1.has(i) && G1(f)) && (i !== "transform" || !S) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !v && !o && a !== "mirror" && c !== 0 && d !== "inertia";
}
const X1 = 40;
class Z1 extends ud {
  constructor({ autoplay: n = !0, delay: i = 0, type: o = "keyframes", repeat: a = 0, repeatDelay: c = 0, repeatType: d = "loop", keyframes: f, name: y, motionValue: v, element: S, ...l }) {
    var x;
    super(), this.stop = () => {
      var T, k;
      this._animation && (this._animation.stop(), (T = this.stopTimeline) == null || T.call(this)), (k = this.keyframeResolver) == null || k.cancel();
    }, this.createdAt = it.now();
    const h = {
      autoplay: n,
      delay: i,
      type: o,
      repeat: a,
      repeatDelay: c,
      repeatType: d,
      name: y,
      motionValue: v,
      element: S,
      ...l
    }, g = (S == null ? void 0 : S.KeyframeResolver) || cd;
    this.keyframeResolver = new g(f, (T, k, A) => this.onKeyframesResolved(T, k, h, !A), y, v, S), (x = this.keyframeResolver) == null || x.scheduleResolve();
  }
  onKeyframesResolved(n, i, o, a) {
    var A, R;
    this.keyframeResolver = void 0;
    const { name: c, type: d, velocity: f, delay: y, isHandoff: v, onUpdate: S } = o;
    this.resolvedAt = it.now();
    let l = !0;
    H1(n, c, d, f) || (l = !1, (Un.instantAnimations || !y) && (S == null || S(Aa(n, o, i))), n[0] = n[n.length - 1], gc(o), o.repeat = 0);
    const g = {
      startTime: a ? this.resolvedAt ? this.resolvedAt - this.createdAt > X1 ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: i,
      ...o,
      keyframes: n
    }, x = l && !v && Q1(g), T = (R = (A = g.motionValue) == null ? void 0 : A.owner) == null ? void 0 : R.current;
    let k;
    if (x)
      try {
        k = new U1({
          ...g,
          element: T
        });
      } catch {
        k = new da(g);
      }
    else
      k = new da(g);
    k.finished.then(() => {
      this.notifyFinished();
    }).catch(Mt), this.pendingTimeline && (this.stopTimeline = k.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = k;
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
    return this._animation || ((n = this.keyframeResolver) == null || n.resume(), j1()), this._animation;
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
function Dg(e, n, i, o = 0, a = 1) {
  const c = Array.from(e).sort((v, S) => v.sortNodePosition(S)).indexOf(n), d = e.size, f = (d - 1) * o;
  return typeof i == "function" ? i(c, d) : a === 1 ? c * o : f - c * o;
}
const pm = 30, J1 = (e) => !isNaN(parseFloat(e));
class q1 {
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
    this.current = n, this.updatedAt = it.now(), this.canTrackVelocity === null && n !== void 0 && (this.canTrackVelocity = J1(this.current));
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
    this.events[n] || (this.events[n] = new td());
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
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || n - this.updatedAt > pm)
      return 0;
    const i = Math.min(this.updatedAt - this.prevUpdatedAt, pm);
    return /* @__PURE__ */ eg(parseFloat(this.current) - parseFloat(this.prevFrameValue), i);
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
  return new q1(e, n);
}
function jg(e, n) {
  if (e != null && e.inherit && n) {
    const { inherit: i, ...o } = e;
    return { ...n, ...o };
  }
  return e;
}
function dd(e, n) {
  const i = (e == null ? void 0 : e[n]) ?? (e == null ? void 0 : e.default) ?? e;
  return i !== e ? jg(i, e) : i;
}
const e_ = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, t_ = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), n_ = {
  type: "keyframes",
  duration: 0.8
}, r_ = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, i_ = (e, { keyframes: n }) => n.length > 2 ? n_ : oi.has(e) ? e.startsWith("scale") ? t_(n[1]) : e_ : r_, o_ = /* @__PURE__ */ new Set([
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
function s_(e) {
  for (const n in e)
    if (!o_.has(n))
      return !0;
  return !1;
}
const fd = (e, n, i, o = {}, a, c) => (d) => {
  const f = dd(o, e) || {}, y = f.delay || o.delay || 0;
  let { elapsed: v = 0 } = o;
  v = v - /* @__PURE__ */ mt(y);
  const S = {
    keyframes: Array.isArray(i) ? i : [null, i],
    ease: "easeOut",
    velocity: n.getVelocity(),
    ...f,
    delay: -v,
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
  s_(f) || Object.assign(S, i_(e, S)), S.duration && (S.duration = /* @__PURE__ */ mt(S.duration)), S.repeatDelay && (S.repeatDelay = /* @__PURE__ */ mt(S.repeatDelay)), S.from !== void 0 && (S.keyframes[0] = S.from);
  let l = !1;
  if ((S.type === !1 || S.duration === 0 && !S.repeatDelay) && (gc(S), S.delay === 0 && (l = !0)), (Un.instantAnimations || Un.skipAnimations || a != null && a.shouldSkipAnimations || f.skipAnimations) && (l = !0, gc(S), S.delay = 0), S.allowFlatten = !f.type && !f.ease, l && !c && n.get() !== void 0) {
    const h = Aa(S.keyframes, f);
    if (h !== void 0) {
      Ae.update(() => {
        S.onUpdate(h), S.onComplete();
      });
      return;
    }
  }
  return f.isSync ? new da(S) : new Z1(S);
}, a_ = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function l_(e) {
  const n = a_.exec(e);
  if (!n)
    return [,];
  const [, i, o, a] = n;
  return [`--${i ?? o}`, a];
}
const u_ = 4;
function Ig(e, n, i = 1) {
  mr(i <= u_, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [o, a] = l_(e);
  if (!o)
    return;
  const c = window.getComputedStyle(n).getPropertyValue(o);
  if (c) {
    const d = c.trim();
    return Xy(d) ? parseFloat(d) : d;
  }
  return id(a) ? Ig(a, n, i + 1) : a;
}
function hm(e) {
  const n = [{}, {}];
  return e == null || e.values.forEach((i, o) => {
    n[0][o] = i.get(), n[1][o] = i.getVelocity();
  }), n;
}
function pd(e, n, i, o) {
  if (typeof n == "function") {
    const [a, c] = hm(o);
    n = n(i !== void 0 ? i : e.custom, a, c);
  }
  if (typeof n == "string" && (n = e.variants && e.variants[n]), typeof n == "function") {
    const [a, c] = hm(o);
    n = n(i !== void 0 ? i : e.custom, a, c);
  }
  return n;
}
function fr(e, n, i) {
  const o = e.getProps();
  return pd(o, n, i !== void 0 ? i : o.custom, e);
}
const Fg = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...ii
]), vc = (e) => Array.isArray(e);
function c_(e, n, i) {
  e.hasValue(n) ? e.getValue(n).set(i) : e.addValue(n, qr(i));
}
function d_(e) {
  return vc(e) ? e[e.length - 1] || 0 : e;
}
function f_(e, n) {
  const i = fr(e, n);
  let { transitionEnd: o = {}, transition: a = {}, ...c } = i || {};
  c = { ...c, ...o };
  for (const d in c) {
    const f = d_(c[d]);
    c_(e, d, f);
  }
}
const Ze = (e) => !!(e && e.getVelocity);
function p_(e) {
  return !!(Ze(e) && e.add);
}
function Sc(e, n) {
  const i = e.getValue("willChange");
  if (p_(i))
    return i.add(n);
  if (!i && Un.WillChange) {
    const o = new Un.WillChange("auto");
    e.addValue("willChange", o), o.add(n);
  }
}
function hd(e) {
  return e.replace(/([A-Z])/g, (n) => `-${n.toLowerCase()}`);
}
const h_ = "framerAppearId", Og = "data-" + hd(h_);
function Lg(e) {
  return e.props[Og];
}
function m_({ protectedKeys: e, needsAnimating: n }, i) {
  const o = e.hasOwnProperty(i) && n[i] !== !0;
  return n[i] = !1, o;
}
function Vg(e, n, { delay: i = 0, transitionOverride: o, type: a } = {}) {
  let { transition: c, transitionEnd: d, ...f } = n;
  const y = e.getDefaultTransition();
  c = c ? jg(c, y) : y;
  const v = c == null ? void 0 : c.reduceMotion, S = c == null ? void 0 : c.skipAnimations;
  o && (c = o);
  const l = [], h = a && e.animationState && e.animationState.getState()[a], g = c == null ? void 0 : c.path;
  g && g.animateVisualElement(e, f, c, i, l);
  for (const x in f) {
    const T = e.getValue(x, e.latestValues[x] ?? null), k = f[x];
    if (k === void 0 || h && m_(h, x))
      continue;
    const A = {
      delay: i,
      ...dd(c || {}, x)
    };
    S && (A.skipAnimations = !0);
    const R = T.get();
    if (R !== void 0 && !T.isAnimating() && !Array.isArray(k) && k === R && !A.velocity) {
      Ae.update(() => T.set(k));
      continue;
    }
    let b = !1;
    if (window.MotionHandoffAnimation) {
      const K = Lg(e);
      if (K) {
        const Q = window.MotionHandoffAnimation(K, x, Ae);
        Q !== null && (A.startTime = Q, b = !0);
      }
    }
    Sc(e, x);
    const D = v ?? e.shouldReduceMotion;
    T.start(fd(x, T, k, D && Fg.has(x) ? { type: !1 } : A, e, b));
    const L = T.animation;
    L && l.push(L);
  }
  if (d) {
    const x = () => Ae.update(() => {
      d && f_(e, d);
    });
    l.length ? Promise.all(l).then(x) : x();
  }
  return l;
}
function wc(e, n, i = {}) {
  var y;
  const o = fr(e, n, i.type === "exit" ? (y = e.presenceContext) == null ? void 0 : y.custom : void 0);
  let { transition: a = e.getDefaultTransition() || {} } = o || {};
  i.transitionOverride && (a = i.transitionOverride);
  const c = o ? () => Promise.all(Vg(e, o, i)) : () => Promise.resolve(), d = e.variantChildren && e.variantChildren.size ? (v = 0) => {
    const { delayChildren: S = 0, staggerChildren: l, staggerDirection: h } = a;
    return y_(e, n, v, S, l, h, i);
  } : () => Promise.resolve(), { when: f } = a;
  if (f) {
    const [v, S] = f === "beforeChildren" ? [c, d] : [d, c];
    return v().then(() => S());
  } else
    return Promise.all([c(), d(i.delay)]);
}
function y_(e, n, i = 0, o = 0, a = 0, c = 1, d) {
  const f = [];
  for (const y of e.variantChildren)
    y.notify("AnimationStart", n), f.push(wc(y, n, {
      ...d,
      delay: i + (typeof o == "function" ? 0 : o) + Dg(e.variantChildren, y, o, a, c)
    }).then(() => y.notify("AnimationComplete", n)));
  return Promise.all(f);
}
function g_(e, n, i = {}) {
  e.notify("AnimationStart", n);
  let o;
  if (Array.isArray(n)) {
    const a = n.map((c) => wc(e, c, i));
    o = Promise.all(a);
  } else if (typeof n == "string")
    o = wc(e, n, i);
  else {
    const a = typeof n == "function" ? fr(e, n, i.custom) : n;
    o = Promise.all(Vg(e, a, i));
  }
  return o.then(() => {
    e.notify("AnimationComplete", n);
  });
}
const v_ = {
  test: (e) => e === "auto",
  parse: (e) => e
}, Bg = (e) => (n) => n.test(e), zg = [ri, ne, en, hn, $x, Ux, v_], mm = (e) => zg.find(Bg(e));
function S_(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || Jy(e) : !0;
}
const w_ = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function x_(e) {
  const [n, i] = e.slice(0, -1).split("(");
  if (n === "drop-shadow")
    return e;
  const [o] = i.match(od) || [];
  if (!o)
    return e;
  const a = i.replace(o, "");
  let c = w_.has(n) ? 1 : 0;
  return o !== i && (c *= 100), n + "(" + c + a + ")";
}
const __ = /\b([a-z-]*)\(.*?\)/gu, xc = {
  ...Ut,
  getAnimatableNone: (e) => {
    const n = e.match(__);
    return n ? n.map(x_).join(" ") : e;
  }
}, _c = {
  ...Ut,
  getAnimatableNone: (e) => {
    const n = Ut.parse(e);
    return Ut.createTransformer(e)(n.map((o) => typeof o == "number" ? 0 : typeof o == "object" ? { ...o, alpha: 1 } : o));
  }
}, ym = {
  ...ri,
  transform: Math.round
}, T_ = {
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
  scale: Fs,
  scaleX: Fs,
  scaleY: Fs,
  scaleZ: Fs,
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
  opacity: ao,
  originX: nm,
  originY: nm,
  originZ: ne
}, fa = {
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
  ...T_,
  zIndex: ym,
  // SVG
  fillOpacity: ao,
  strokeOpacity: ao,
  numOctaves: ym
}, k_ = {
  ...fa,
  // Color props
  color: Be,
  backgroundColor: Be,
  outlineColor: Be,
  fill: Be,
  stroke: Be,
  // Border props
  borderColor: Be,
  borderTopColor: Be,
  borderRightColor: Be,
  borderBottomColor: Be,
  borderLeftColor: Be,
  filter: xc,
  WebkitFilter: xc,
  mask: _c,
  WebkitMask: _c
}, Ug = (e) => k_[e], A_ = /* @__PURE__ */ new Set([xc, _c]);
function $g(e, n) {
  let i = Ug(e);
  return A_.has(i) || (i = Ut), i.getAnimatableNone ? i.getAnimatableNone(n) : void 0;
}
const C_ = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function E_(e, n, i) {
  let o = 0, a;
  for (; o < e.length && !a; ) {
    const c = e[o];
    typeof c == "string" && !C_.has(c) && Jr(c).values.length && (a = e[o]), o++;
  }
  if (a && i)
    for (const c of n)
      e[c] = $g(i, a);
}
class P_ extends cd {
  constructor(n, i, o, a, c) {
    super(n, i, o, a, c, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: n, element: i, name: o } = this;
    if (!i || !i.current)
      return;
    super.readKeyframes();
    for (let S = 0; S < n.length; S++) {
      let l = n[S];
      if (typeof l == "string" && (l = l.trim(), id(l))) {
        const h = Ig(l, i.current);
        h !== void 0 && (n[S] = h), S === n.length - 1 && (this.finalKeyframe = l);
      }
    }
    if (this.resolveNoneKeyframes(), !Fg.has(o) || n.length !== 2)
      return;
    const [a, c] = n, d = mm(a), f = mm(c), y = tm(a), v = tm(c);
    if (y !== v && zn[o]) {
      this.needsMeasurement = !0;
      return;
    }
    if (d !== f)
      if (cm(d) && cm(f))
        for (let S = 0; S < n.length; S++) {
          const l = n[S];
          typeof l == "string" && (n[S] = parseFloat(l));
        }
      else zn[o] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: n, name: i } = this, o = [];
    for (let a = 0; a < n.length; a++)
      (n[a] === null || S_(n[a])) && o.push(a);
    o.length && E_(n, o, i);
  }
  measureInitialState() {
    const { element: n, unresolvedKeyframes: i, name: o } = this;
    if (!n || !n.current)
      return;
    o === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = zn[o](n.measureViewportBox(), window.getComputedStyle(n.current)), i[0] = this.measuredOrigin;
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
    o[c] = zn[i](n.measureViewportBox(), window.getComputedStyle(n.current)), d !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = d), (f = this.removedTransforms) != null && f.length && this.removedTransforms.forEach(([y, v]) => {
      n.getValue(y).set(v);
    }), this.resolveNoneKeyframes();
  }
}
const md = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius"
];
function Hg(e, n, i) {
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
const Tc = (e, n) => n && typeof e == "number" ? n.transform(e) : e;
function Ys(e) {
  return Zy(e) && "offsetHeight" in e && !("ownerSVGElement" in e);
}
const { schedule: yd } = /* @__PURE__ */ dg(queueMicrotask, !1), Vt = {
  x: !1,
  y: !1
};
function Wg() {
  return Vt.x || Vt.y;
}
function b_(e) {
  return e === "x" || e === "y" ? Vt[e] ? null : (Vt[e] = !0, () => {
    Vt[e] = !1;
  }) : Vt.x || Vt.y ? null : (Vt.x = Vt.y = !0, () => {
    Vt.x = Vt.y = !1;
  });
}
function Gg(e, n) {
  const i = Hg(e), o = new AbortController(), a = {
    passive: !0,
    ...n,
    signal: o.signal
  };
  return [i, a, () => o.abort()];
}
function M_(e) {
  return !(e.pointerType === "touch" || Wg());
}
function R_(e, n, i = {}) {
  const [o, a, c] = Gg(e, i);
  return o.forEach((d) => {
    let f = !1, y = !1, v;
    const S = () => {
      d.removeEventListener("pointerleave", x);
    }, l = (k) => {
      v && (v(k), v = void 0), S();
    }, h = (k) => {
      f = !1, window.removeEventListener("pointerup", h), window.removeEventListener("pointercancel", h), y && (y = !1, l(k));
    }, g = () => {
      f = !0, window.addEventListener("pointerup", h, a), window.addEventListener("pointercancel", h, a);
    }, x = (k) => {
      if (k.pointerType !== "touch") {
        if (f) {
          y = !0;
          return;
        }
        l(k);
      }
    }, T = (k) => {
      if (!M_(k))
        return;
      y = !1;
      const A = n(d, k);
      typeof A == "function" && (v = A, d.addEventListener("pointerleave", x, a));
    };
    d.addEventListener("pointerenter", T, a), d.addEventListener("pointerdown", g, a);
  }), c;
}
const Kg = (e, n) => n ? e === n ? !0 : Kg(e, n.parentElement) : !1, gd = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, N_ = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function D_(e) {
  return N_.has(e.tagName) || e.isContentEditable === !0;
}
const j_ = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function I_(e) {
  return j_.has(e.tagName) || e.isContentEditable === !0;
}
const Qs = /* @__PURE__ */ new WeakSet();
function gm(e) {
  return (n) => {
    n.key === "Enter" && e(n);
  };
}
function Vu(e, n) {
  e.dispatchEvent(new PointerEvent("pointer" + n, { isPrimary: !0, bubbles: !0 }));
}
const F_ = (e, n) => {
  const i = e.currentTarget;
  if (!i)
    return;
  const o = gm(() => {
    if (Qs.has(i))
      return;
    Vu(i, "down");
    const a = gm(() => {
      Vu(i, "up");
    }), c = () => Vu(i, "cancel");
    i.addEventListener("keyup", a, n), i.addEventListener("blur", c, n);
  });
  i.addEventListener("keydown", o, n), i.addEventListener("blur", () => i.removeEventListener("keydown", o), n);
};
function vm(e) {
  return gd(e) && !Wg();
}
const Sm = /* @__PURE__ */ new WeakSet();
function O_(e, n, i = {}) {
  const [o, a, c] = Gg(e, i), d = (f) => {
    const y = f.currentTarget;
    if (!vm(f) || Sm.has(f))
      return;
    Qs.add(y), i.stopPropagation && Sm.add(f);
    const v = n(y, f), S = { ...a, capture: !0 }, l = (x, T) => {
      window.removeEventListener("pointerup", h, S), window.removeEventListener("pointercancel", g, S), Qs.has(y) && Qs.delete(y), vm(x) && typeof v == "function" && v(x, { success: T });
    }, h = (x) => {
      l(x, y === window || y === document || i.useGlobalTarget || Kg(y, x.target));
    }, g = (x) => {
      l(x, !1);
    };
    window.addEventListener("pointerup", h, S), window.addEventListener("pointercancel", g, S);
  };
  return o.forEach((f) => {
    (i.useGlobalTarget ? window : f).addEventListener("pointerdown", d, a), Ys(f) && (f.addEventListener("focus", (v) => F_(v, a)), !D_(f) && !f.hasAttribute("tabindex") && (f.tabIndex = 0));
  }), c;
}
function vd(e) {
  return Zy(e) && "ownerSVGElement" in e;
}
const Xs = /* @__PURE__ */ new WeakMap();
let Fn;
const Yg = (e, n, i) => (o, a) => a && a[0] ? a[0][e + "Size"] : vd(o) && "getBBox" in o ? o.getBBox()[n] : o[i], L_ = /* @__PURE__ */ Yg("inline", "width", "offsetWidth"), V_ = /* @__PURE__ */ Yg("block", "height", "offsetHeight");
function B_({ target: e, borderBoxSize: n }) {
  var i;
  (i = Xs.get(e)) == null || i.forEach((o) => {
    o(e, {
      get width() {
        return L_(e, n);
      },
      get height() {
        return V_(e, n);
      }
    });
  });
}
function z_(e) {
  e.forEach(B_);
}
function U_() {
  typeof ResizeObserver > "u" || (Fn = new ResizeObserver(z_));
}
function $_(e, n) {
  Fn || U_();
  const i = Hg(e);
  return i.forEach((o) => {
    let a = Xs.get(o);
    a || (a = /* @__PURE__ */ new Set(), Xs.set(o, a)), a.add(n), Fn == null || Fn.observe(o);
  }), () => {
    i.forEach((o) => {
      const a = Xs.get(o);
      a == null || a.delete(n), a != null && a.size || Fn == null || Fn.unobserve(o);
    });
  };
}
const Zs = /* @__PURE__ */ new Set();
let Kr;
function H_() {
  Kr = () => {
    const e = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    Zs.forEach((n) => n(e));
  }, window.addEventListener("resize", Kr);
}
function W_(e) {
  return Zs.add(e), Kr || H_(), () => {
    Zs.delete(e), !Zs.size && typeof Kr == "function" && (window.removeEventListener("resize", Kr), Kr = void 0);
  };
}
function wm(e, n) {
  return typeof e == "function" ? W_(e) : $_(e, n);
}
function G_(e) {
  return vd(e) && e.tagName === "svg";
}
const K_ = [...zg, Be, Ut], Y_ = (e) => K_.find(Bg(e)), xm = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), Yr = () => ({
  x: xm(),
  y: xm()
}), _m = () => ({ min: 0, max: 0 }), $e = () => ({
  x: _m(),
  y: _m()
}), Q_ = /* @__PURE__ */ new WeakMap();
function Ca(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function lo(e) {
  return typeof e == "string" || Array.isArray(e);
}
const Sd = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], wd = ["initial", ...Sd];
function Ea(e) {
  return Ca(e.animate) || wd.some((n) => lo(e[n]));
}
function Qg(e) {
  return !!(Ea(e) || e.variants);
}
function X_(e, n, i) {
  for (const o in n) {
    const a = n[o], c = i[o];
    if (Ze(a))
      e.addValue(o, a);
    else if (Ze(c))
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
const kc = { current: null }, Xg = { current: !1 }, Z_ = typeof window < "u";
function J_() {
  if (Xg.current = !0, !!Z_)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), n = () => kc.current = e.matches;
      e.addEventListener("change", n), n();
    } else
      kc.current = !1;
}
const Tm = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let pa = {};
function Zg(e) {
  pa = e;
}
function q_() {
  return pa;
}
class eT {
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
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = cd, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const g = it.now();
      this.renderScheduledAt < g && (this.renderScheduledAt = g, Ae.render(this.render, !1, !0));
    };
    const { latestValues: v, renderState: S } = f;
    this.latestValues = v, this.baseTarget = { ...v }, this.initialValues = i.initial ? { ...v } : {}, this.renderState = S, this.parent = n, this.props = i, this.presenceContext = o, this.depth = n ? n.depth + 1 : 0, this.reducedMotionConfig = a, this.skipAnimationsConfig = c, this.options = y, this.blockInitialAnimation = !!d, this.isControllingVariants = Ea(i), this.isVariantNode = Qg(i), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(n && n.current);
    const { willChange: l, ...h } = this.scrapeMotionValuesFromProps(i, {}, this);
    for (const g in h) {
      const x = h[g];
      v[g] !== void 0 && Ze(x) && x.set(v[g]);
    }
  }
  mount(n) {
    var i, o;
    if (this.hasBeenMounted)
      for (const a in this.initialValues)
        (i = this.values.get(a)) == null || i.jump(this.initialValues[a]), this.latestValues[a] = this.initialValues[a];
    this.current = n, Q_.set(n, this), this.projection && !this.projection.instance && this.projection.mount(n), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((a, c) => this.bindToMotionValue(c, a)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Xg.current || J_(), this.shouldReduceMotion = kc.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (o = this.parent) == null || o.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    var n;
    this.projection && this.projection.unmount(), $n(this.notifyUpdate), $n(this.render), this.valueSubscriptions.forEach((i) => i()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), (n = this.parent) == null || n.removeChild(this);
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
    if (this.valueSubscriptions.has(n) && this.valueSubscriptions.get(n)(), i.accelerate && Ng.has(n) && this.current instanceof HTMLElement) {
      const { factory: d, keyframes: f, times: y, ease: v, duration: S } = i.accelerate, l = new Mg({
        element: this.current,
        name: n,
        keyframes: f,
        times: y,
        ease: v,
        duration: /* @__PURE__ */ mt(S)
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
    for (n in pa) {
      const i = pa[n];
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
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : $e();
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
    for (let o = 0; o < Tm.length; o++) {
      const a = Tm[o];
      this.propEventSubscriptions[a] && (this.propEventSubscriptions[a](), delete this.propEventSubscriptions[a]);
      const c = "on" + a, d = n[c];
      d && (this.propEventSubscriptions[a] = this.on(a, d));
    }
    this.prevMotionValues = X_(this, this.scrapeMotionValuesFromProps(n, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
    return o != null && (typeof o == "string" && (Xy(o) || Jy(o)) ? o = parseFloat(o) : !Y_(o) && Ut.test(i) && (o = $g(n, i)), this.setBaseTarget(n, Ze(o) ? o.get() : o)), Ze(o) ? o.get() : o;
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
      const d = pd(this.props, i, (c = this.presenceContext) == null ? void 0 : c.custom);
      d && (o = d[n]);
    }
    if (i && o !== void 0)
      return o;
    const a = this.getBaseTargetFromProps(this.props, n);
    return a !== void 0 && !Ze(a) ? a : this.initialValues[n] !== void 0 && o === void 0 ? void 0 : this.baseTarget[n];
  }
  on(n, i) {
    return this.events[n] || (this.events[n] = new td()), this.events[n].add(i);
  }
  notify(n, ...i) {
    this.events[n] && this.events[n].notify(...i);
  }
  scheduleRenderMicrotask() {
    yd.render(this.render);
  }
}
class Jg extends eT {
  constructor() {
    super(...arguments), this.KeyframeResolver = P_;
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
    Ze(n) && (this.childSubscription = n.on("change", (i) => {
      this.current && (this.current.textContent = `${i}`);
    }));
  }
}
class Wn {
  constructor(n) {
    this.isMounted = !1, this.node = n;
  }
  update() {
  }
}
function qg({ top: e, left: n, right: i, bottom: o }) {
  return {
    x: { min: n, max: i },
    y: { min: e, max: o }
  };
}
function tT({ x: e, y: n }) {
  return { top: n.min, right: e.max, bottom: n.max, left: e.min };
}
function nT(e, n) {
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
function Bu(e) {
  return e === void 0 || e === 1;
}
function Ac({ scale: e, scaleX: n, scaleY: i }) {
  return !Bu(e) || !Bu(n) || !Bu(i);
}
function sr(e) {
  return Ac(e) || ev(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function ev(e) {
  return km(e.x) || km(e.y);
}
function km(e) {
  return e && e !== "0%";
}
function ha(e, n, i) {
  const o = e - i, a = n * o;
  return i + a;
}
function Am(e, n, i, o, a) {
  return a !== void 0 && (e = ha(e, a, o)), ha(e, i, o) + n;
}
function Cc(e, n = 0, i = 1, o, a) {
  e.min = Am(e.min, n, i, o, a), e.max = Am(e.max, n, i, o, a);
}
function tv(e, { x: n, y: i }) {
  Cc(e.x, n.translate, n.scale, n.originPoint), Cc(e.y, i.translate, i.scale, i.originPoint);
}
const Cm = 0.999999999999, Em = 1.0000000000001;
function rT(e, n, i, o = !1) {
  var f;
  const a = i.length;
  if (!a)
    return;
  n.x = n.y = 1;
  let c, d;
  for (let y = 0; y < a; y++) {
    c = i[y], d = c.projectionDelta;
    const { visualElement: v } = c.options;
    v && v.props.style && v.props.style.display === "contents" || (o && c.options.layoutScroll && c.scroll && c !== c.root && (Jt(e.x, -c.scroll.offset.x), Jt(e.y, -c.scroll.offset.y)), d && (n.x *= d.x.scale, n.y *= d.y.scale, tv(e, d)), o && sr(c.latestValues) && Js(e, c.latestValues, (f = c.layout) == null ? void 0 : f.layoutBox));
  }
  n.x < Em && n.x > Cm && (n.x = 1), n.y < Em && n.y > Cm && (n.y = 1);
}
function Jt(e, n) {
  e.min += n, e.max += n;
}
function Pm(e, n, i, o, a = 0.5) {
  const c = Te(e.min, e.max, a);
  Cc(e, n, i, c, o);
}
function bm(e, n) {
  return typeof e == "string" ? parseFloat(e) / 100 * (n.max - n.min) : e;
}
function Js(e, n, i) {
  const o = i ?? e;
  Pm(e.x, bm(n.x, o.x), n.scaleX, n.scale, n.originX), Pm(e.y, bm(n.y, o.y), n.scaleY, n.scale, n.originY);
}
function nv(e, n) {
  return qg(nT(e.getBoundingClientRect(), n));
}
function iT(e, n, i) {
  const o = nv(e, i), { scroll: a } = n;
  return a && (Jt(o.x, a.offset.x), Jt(o.y, a.offset.y)), o;
}
const oT = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, sT = ii.length;
function aT(e, n, i) {
  let o = "", a = !0;
  for (let d = 0; d < sT; d++) {
    const f = ii[d], y = e[f];
    if (y === void 0)
      continue;
    let v = !0;
    if (typeof y == "number")
      v = y === (f.startsWith("scale") ? 1 : 0);
    else {
      const S = parseFloat(y);
      v = f.startsWith("scale") ? S === 1 : S === 0;
    }
    if (!v || i) {
      const S = Tc(y, fa[f]);
      if (!v) {
        a = !1;
        const l = oT[f] || f;
        o += `${l}(${S}) `;
      }
      i && (n[f] = S);
    }
  }
  const c = e.pathRotation;
  return c && (a = !1, o += `rotate(${Tc(c, fa.pathRotation)}) `), o = o.trim(), i ? o = i(n, a ? "" : o) : a && (o = "none"), o;
}
function xd(e, n, i) {
  const { style: o, vars: a, transformOrigin: c } = e;
  let d = !1, f = !1;
  for (const y in n) {
    const v = n[y];
    if (oi.has(y)) {
      d = !0;
      continue;
    } else if (pg(y)) {
      a[y] = v;
      continue;
    } else {
      const S = Tc(v, fa[y]);
      y.startsWith("origin") ? (f = !0, c[y] = S) : o[y] = S;
    }
  }
  if (n.transform || (d || i ? o.transform = aT(n, e.transform, i) : o.transform && (o.transform = "none")), f) {
    const { originX: y = "50%", originY: v = "50%", originZ: S = 0 } = c;
    o.transformOrigin = `${y} ${v} ${S}`;
  }
}
function rv(e, { style: n, vars: i }, o, a) {
  const c = e.style;
  let d;
  for (d in n)
    c[d] = n[d];
  a == null || a.applyProjectionStyles(c, o);
  for (d in i)
    c.setProperty(d, i[d]);
}
function Mm(e, n) {
  return n.max === n.min ? 0 : e / (n.max - n.min) * 100;
}
const Yi = {
  correct: (e, n) => {
    if (!n.target)
      return e;
    if (typeof e == "string")
      if (ne.test(e))
        e = parseFloat(e);
      else
        return e;
    const i = Mm(e, n.target.x), o = Mm(e, n.target.y);
    return `${i}% ${o}%`;
  }
}, lT = {
  correct: (e, { treeScale: n, projectionDelta: i }) => {
    const o = e, a = Ut.parse(e);
    if (a.length > 5)
      return o;
    const c = Ut.createTransformer(e), d = typeof a[0] != "number" ? 1 : 0, f = i.x.scale * n.x, y = i.y.scale * n.y;
    a[0 + d] /= f, a[1 + d] /= y;
    const v = Te(f, y, 0.5);
    return typeof a[2 + d] == "number" && (a[2 + d] /= v), typeof a[3 + d] == "number" && (a[3 + d] /= v), c(a);
  }
}, Ec = {
  borderRadius: {
    ...Yi,
    applyTo: [...md]
  },
  borderTopLeftRadius: Yi,
  borderTopRightRadius: Yi,
  borderBottomLeftRadius: Yi,
  borderBottomRightRadius: Yi,
  boxShadow: lT
};
function iv(e, { layout: n, layoutId: i }) {
  return oi.has(e) || e.startsWith("origin") || (n || i !== void 0) && (!!Ec[e] || e === "opacity");
}
function _d(e, n, i) {
  var d;
  const o = e.style, a = n == null ? void 0 : n.style, c = {};
  if (!o)
    return c;
  for (const f in o)
    (Ze(o[f]) || a && Ze(a[f]) || iv(f, e) || ((d = i == null ? void 0 : i.getValue(f)) == null ? void 0 : d.liveStyle) !== void 0) && (c[f] = o[f]);
  return c;
}
function uT(e) {
  return window.getComputedStyle(e);
}
class cT extends Jg {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = rv;
  }
  readValueFromInstance(n, i) {
    var o;
    if (oi.has(i))
      return (o = this.projection) != null && o.isProjecting ? fc(i) : b1(n, i);
    {
      const a = uT(n), c = (pg(i) ? a.getPropertyValue(i) : a[i]) || 0;
      return typeof c == "string" ? c.trim() : c;
    }
  }
  measureInstanceViewportBox(n, { transformPagePoint: i }) {
    return nv(n, i);
  }
  build(n, i, o) {
    xd(n, i, o.transformTemplate);
  }
  scrapeMotionValuesFromProps(n, i, o) {
    return _d(n, i, o);
  }
}
const dT = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, fT = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function pT(e, n, i = 1, o = 0, a = !0) {
  e.pathLength = 1;
  const c = a ? dT : fT;
  e[c.offset] = `${-o}`, e[c.array] = `${n} ${i}`;
}
const hT = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function ov(e, {
  attrX: n,
  attrY: i,
  attrScale: o,
  pathLength: a,
  pathSpacing: c = 1,
  pathOffset: d = 0,
  // This is object creation, which we try to avoid per-frame.
  ...f
}, y, v, S) {
  if (xd(e, f, v), y) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: l, style: h } = e;
  l.transform && (h.transform = l.transform, delete l.transform), (h.transform || l.transformOrigin) && (h.transformOrigin = l.transformOrigin ?? "50% 50%", delete l.transformOrigin), h.transform && (h.transformBox = (S == null ? void 0 : S.transformBox) ?? "fill-box", delete l.transformBox);
  for (const g of hT)
    l[g] !== void 0 && (h[g] = l[g], delete l[g]);
  n !== void 0 && (l.x = n), i !== void 0 && (l.y = i), o !== void 0 && (l.scale = o), a !== void 0 && pT(l, a, c, d, !1);
}
const sv = /* @__PURE__ */ new Set([
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
]), av = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function mT(e, n, i, o) {
  rv(e, n, void 0, o);
  for (const a in n.attrs)
    e.setAttribute(sv.has(a) ? a : hd(a), n.attrs[a]);
}
function lv(e, n, i) {
  const o = _d(e, n, i);
  for (const a in e)
    if (Ze(e[a]) || Ze(n[a])) {
      const c = ii.indexOf(a) !== -1 ? "attr" + a.charAt(0).toUpperCase() + a.substring(1) : a;
      o[c] = e[a];
    }
  return o;
}
class yT extends Jg {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = $e;
  }
  getBaseTargetFromProps(n, i) {
    return n[i];
  }
  readValueFromInstance(n, i) {
    if (oi.has(i)) {
      const o = Ug(i);
      return o && o.default || 0;
    }
    return i = sv.has(i) ? i : hd(i), n.getAttribute(i);
  }
  scrapeMotionValuesFromProps(n, i, o) {
    return lv(n, i, o);
  }
  build(n, i, o) {
    ov(n, i, this.isSVGTag, o.transformTemplate, o.style);
  }
  renderInstance(n, i, o, a) {
    mT(n, i, o, a);
  }
  mount(n) {
    this.isSVGTag = av(n.tagName), super.mount(n);
  }
}
const gT = wd.length;
function uv(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const i = e.parent ? uv(e.parent) || {} : {};
    return e.props.initial !== void 0 && (i.initial = e.props.initial), i;
  }
  const n = {};
  for (let i = 0; i < gT; i++) {
    const o = wd[i], a = e.props[o];
    (lo(a) || a === !1) && (n[o] = a);
  }
  return n;
}
function cv(e, n) {
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
const vT = [...Sd].reverse(), ST = Sd.length;
function wT(e) {
  return (n) => Promise.all(n.map(({ animation: i, options: o }) => g_(e, i, o)));
}
function xT(e) {
  let n = wT(e), i = Rm(), o = !0, a = !1;
  const c = (v) => (S, l) => {
    var g;
    const h = fr(e, l, v === "exit" ? (g = e.presenceContext) == null ? void 0 : g.custom : void 0);
    if (h) {
      const { transition: x, transitionEnd: T, ...k } = h;
      S = { ...S, ...k, ...T };
    }
    return S;
  };
  function d(v) {
    n = v(e);
  }
  function f(v) {
    const { props: S } = e, l = uv(e.parent) || {}, h = [], g = /* @__PURE__ */ new Set();
    let x = {}, T = 1 / 0;
    for (let A = 0; A < ST; A++) {
      const R = vT[A], b = i[R], D = S[R] !== void 0 ? S[R] : l[R], L = lo(D), K = R === v ? b.isActive : null;
      K === !1 && (T = A);
      let Q = D === l[R] && D !== S[R] && L;
      if (Q && (o || a) && e.manuallyAnimateOnMount && (Q = !1), b.protectedKeys = { ...x }, // If it isn't active and hasn't *just* been set as inactive
      !b.isActive && K === null || // If we didn't and don't have any defined prop for this animation type
      !D && !b.prevProp || // Or if the prop doesn't define an animation
      Ca(D) || typeof D == "boolean")
        continue;
      if (R === "exit" && b.isActive && K !== !0) {
        b.prevResolvedValues && (x = {
          ...x,
          ...b.prevResolvedValues
        });
        continue;
      }
      const $ = _T(b.prevProp, D);
      let W = $ || // If we're making this variant active, we want to always make it active
      R === v && b.isActive && !Q && L || // If we removed a higher-priority variant (i is in reverse order)
      A > T && L, X = !1;
      const J = Array.isArray(D) ? D : [D];
      let ce = J.reduce(c(R), {});
      K === !1 && (ce = {});
      const { prevResolvedValues: me = {} } = b, pe = {
        ...me,
        ...ce
      }, we = (z) => {
        W = !0, g.has(z) && (X = !0, g.delete(z)), b.needsAnimating[z] = !0;
        const q = e.getValue(z);
        q && (q.liveStyle = !1);
      };
      for (const z in pe) {
        const q = ce[z], Y = me[z];
        if (x.hasOwnProperty(z))
          continue;
        let P = !1;
        vc(q) && vc(Y) ? P = !cv(q, Y) || $ : P = q !== Y, P ? q != null ? we(z) : g.add(z) : q !== void 0 && g.has(z) ? we(z) : b.protectedKeys[z] = !0;
      }
      b.prevProp = D, b.prevResolvedValues = ce, b.isActive && (x = { ...x, ...ce }), (o || a) && e.blockInitialAnimation && (W = !1);
      const ue = Q && $;
      W && (!ue || X) && h.push(...J.map((z) => {
        const q = { type: R };
        if (typeof z == "string" && (o || a) && !ue && e.manuallyAnimateOnMount && e.parent) {
          const { parent: Y } = e, P = fr(Y, z);
          if (Y.enteringChildren && P) {
            const { delayChildren: O } = P.transition || {};
            q.delay = Dg(Y.enteringChildren, e, O);
          }
        }
        return {
          animation: z,
          options: q
        };
      }));
    }
    if (g.size) {
      const A = {};
      if (typeof S.initial != "boolean") {
        const R = fr(e, Array.isArray(S.initial) ? S.initial[0] : S.initial);
        R && R.transition && (A.transition = R.transition);
      }
      g.forEach((R) => {
        const b = e.getBaseTarget(R), D = e.getValue(R);
        D && (D.liveStyle = !0), A[R] = b ?? null;
      }), h.push({ animation: A });
    }
    let k = !!h.length;
    return o && (S.initial === !1 || S.initial === S.animate) && !e.manuallyAnimateOnMount && (k = !1), o = !1, a = !1, k ? n(h) : Promise.resolve();
  }
  function y(v, S) {
    var h;
    if (i[v].isActive === S)
      return Promise.resolve();
    (h = e.variantChildren) == null || h.forEach((g) => {
      var x;
      return (x = g.animationState) == null ? void 0 : x.setActive(v, S);
    }), i[v].isActive = S;
    const l = f(v);
    for (const g in i)
      i[g].protectedKeys = {};
    return l;
  }
  return {
    animateChanges: f,
    setActive: y,
    setAnimateFunction: d,
    getState: () => i,
    reset: () => {
      i = Rm(), a = !0;
    }
  };
}
function _T(e, n) {
  return typeof n == "string" ? n !== e : Array.isArray(n) ? !cv(n, e) : !1;
}
function or(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Rm() {
  return {
    animate: or(!0),
    whileInView: or(),
    whileHover: or(),
    whileTap: or(),
    whileDrag: or(),
    whileFocus: or(),
    exit: or()
  };
}
function Pc(e, n) {
  e.min = n.min, e.max = n.max;
}
function Lt(e, n) {
  Pc(e.x, n.x), Pc(e.y, n.y);
}
function Nm(e, n) {
  e.translate = n.translate, e.scale = n.scale, e.originPoint = n.originPoint, e.origin = n.origin;
}
const dv = 1e-4, TT = 1 - dv, kT = 1 + dv, fv = 0.01, AT = 0 - fv, CT = 0 + fv;
function ot(e) {
  return e.max - e.min;
}
function ET(e, n, i) {
  return Math.abs(e - n) <= i;
}
function Dm(e, n, i, o = 0.5) {
  e.origin = o, e.originPoint = Te(n.min, n.max, e.origin), e.scale = ot(i) / ot(n), e.translate = Te(i.min, i.max, e.origin) - e.originPoint, (e.scale >= TT && e.scale <= kT || isNaN(e.scale)) && (e.scale = 1), (e.translate >= AT && e.translate <= CT || isNaN(e.translate)) && (e.translate = 0);
}
function to(e, n, i, o) {
  Dm(e.x, n.x, i.x, o ? o.originX : void 0), Dm(e.y, n.y, i.y, o ? o.originY : void 0);
}
function jm(e, n, i, o = 0) {
  const a = o ? Te(i.min, i.max, o) : i.min;
  e.min = a + n.min, e.max = e.min + ot(n);
}
function PT(e, n, i, o) {
  jm(e.x, n.x, i.x, o == null ? void 0 : o.x), jm(e.y, n.y, i.y, o == null ? void 0 : o.y);
}
function Im(e, n, i, o = 0) {
  const a = o ? Te(i.min, i.max, o) : i.min;
  e.min = n.min - a, e.max = e.min + ot(n);
}
function ma(e, n, i, o) {
  Im(e.x, n.x, i.x, o == null ? void 0 : o.x), Im(e.y, n.y, i.y, o == null ? void 0 : o.y);
}
function Fm(e, n, i, o, a) {
  return e -= n, e = ha(e, 1 / i, o), a !== void 0 && (e = ha(e, 1 / a, o)), e;
}
function bT(e, n = 0, i = 1, o = 0.5, a, c = e, d = e) {
  if (en.test(n) && (n = parseFloat(n), n = Te(d.min, d.max, n / 100) - d.min), typeof n != "number")
    return;
  let f = Te(c.min, c.max, o);
  e === c && (f -= n), e.min = Fm(e.min, n, i, f, a), e.max = Fm(e.max, n, i, f, a);
}
function Om(e, n, [i, o, a], c, d) {
  bT(e, n[i], n[o], n[a], n.scale, c, d);
}
const MT = ["x", "scaleX", "originX"], RT = ["y", "scaleY", "originY"];
function Lm(e, n, i, o) {
  Om(e.x, n, MT, i ? i.x : void 0, o ? o.x : void 0), Om(e.y, n, RT, i ? i.y : void 0, o ? o.y : void 0);
}
function Vm(e) {
  return e.translate === 0 && e.scale === 1;
}
function pv(e) {
  return Vm(e.x) && Vm(e.y);
}
function Bm(e, n) {
  return e.min === n.min && e.max === n.max;
}
function NT(e, n) {
  return Bm(e.x, n.x) && Bm(e.y, n.y);
}
function zm(e, n) {
  return Math.round(e.min) === Math.round(n.min) && Math.round(e.max) === Math.round(n.max);
}
function hv(e, n) {
  return zm(e.x, n.x) && zm(e.y, n.y);
}
function Um(e) {
  return ot(e.x) / ot(e.y);
}
function $m(e, n) {
  return e.translate === n.translate && e.scale === n.scale && e.originPoint === n.originPoint;
}
function Zt(e) {
  return [e("x"), e("y")];
}
function DT(e, n, i) {
  let o = "";
  const a = e.x.translate / n.x, c = e.y.translate / n.y, d = (i == null ? void 0 : i.z) || 0;
  if ((a || c || d) && (o = `translate3d(${a}px, ${c}px, ${d}px) `), (n.x !== 1 || n.y !== 1) && (o += `scale(${1 / n.x}, ${1 / n.y}) `), i) {
    const { transformPerspective: v, rotate: S, pathRotation: l, rotateX: h, rotateY: g, skewX: x, skewY: T } = i;
    v && (o = `perspective(${v}px) ${o}`), S && (o += `rotate(${S}deg) `), l && (o += `rotate(${l}deg) `), h && (o += `rotateX(${h}deg) `), g && (o += `rotateY(${g}deg) `), x && (o += `skewX(${x}deg) `), T && (o += `skewY(${T}deg) `);
  }
  const f = e.x.scale * n.x, y = e.y.scale * n.y;
  return (f !== 1 || y !== 1) && (o += `scale(${f}, ${y})`), o || "none";
}
const jT = md.length, Hm = (e) => typeof e == "string" ? parseFloat(e) : e, Wm = (e) => typeof e == "number" || ne.test(e);
function IT(e, n, i, o, a, c) {
  a ? (e.opacity = Te(0, i.opacity ?? 1, FT(o)), e.opacityExit = Te(n.opacity ?? 1, 0, OT(o))) : c && (e.opacity = Te(n.opacity ?? 1, i.opacity ?? 1, o));
  for (let d = 0; d < jT; d++) {
    const f = md[d];
    let y = Gm(n, f), v = Gm(i, f);
    if (y === void 0 && v === void 0)
      continue;
    y || (y = 0), v || (v = 0), y === 0 || v === 0 || Wm(y) === Wm(v) ? (e[f] = Math.max(Te(Hm(y), Hm(v), o), 0), (en.test(v) || en.test(y)) && (e[f] += "%")) : e[f] = v;
  }
  (n.rotate || i.rotate) && (e.rotate = Te(n.rotate || 0, i.rotate || 0, o));
}
function Gm(e, n) {
  return e[n] !== void 0 ? e[n] : e.borderRadius;
}
const FT = /* @__PURE__ */ mv(0, 0.5, ag), OT = /* @__PURE__ */ mv(0.5, 0.95, Mt);
function mv(e, n, i) {
  return (o) => o < e ? 0 : o > n ? 1 : i(/* @__PURE__ */ so(e, n, o));
}
function LT(e, n, i) {
  const o = Ze(e) ? e : qr(e);
  return o.start(fd("", o, n, i)), o.animation;
}
function uo(e, n, i, o = { passive: !0 }) {
  return e.addEventListener(n, i, o), () => e.removeEventListener(n, i, o);
}
const VT = (e, n) => e.depth - n.depth;
class BT {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(n) {
    ed(this.children, n), this.isDirty = !0;
  }
  remove(n) {
    aa(this.children, n), this.isDirty = !0;
  }
  forEach(n) {
    this.isDirty && this.children.sort(VT), this.isDirty = !1, this.children.forEach(n);
  }
}
function zT(e, n) {
  const i = it.now(), o = ({ timestamp: a }) => {
    const c = a - i;
    c >= n && ($n(o), e(c - n));
  };
  return Ae.setup(o, !0), () => $n(o);
}
function qs(e) {
  return Ze(e) ? e.get() : e;
}
class UT {
  constructor() {
    this.members = [];
  }
  add(n) {
    ed(this.members, n);
    for (let i = this.members.length - 1; i >= 0; i--) {
      const o = this.members[i];
      if (o === n || o === this.lead || o === this.prevLead)
        continue;
      const a = o.instance;
      (!a || a.isConnected === !1) && !o.snapshot && (aa(this.members, o), o.unmount());
    }
    n.scheduleRender();
  }
  remove(n) {
    if (aa(this.members, n), n === this.prevLead && (this.prevLead = void 0), n === this.lead) {
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
const ea = {
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
}, zu = ["", "X", "Y", "Z"], $T = 1e3;
let HT = 0;
function Uu(e, n, i, o) {
  const { latestValues: a } = n;
  a[e] && (i[e] = a[e], n.setStaticValue(e, 0), o && (o[e] = 0));
}
function yv(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: n } = e.options;
  if (!n)
    return;
  const i = Lg(n);
  if (window.MotionHasOptimisedAnimation(i, "transform")) {
    const { layout: a, layoutId: c } = e.options;
    window.MotionCancelOptimisedAnimation(i, "transform", Ae, !(a || c));
  }
  const { parent: o } = e;
  o && !o.hasCheckedOptimisedAppear && yv(o);
}
function gv({ attachResizeListener: e, defaultParent: n, measureScroll: i, checkIsScrollRoot: o, resetTransform: a }) {
  return class {
    constructor(d = {}, f = n == null ? void 0 : n()) {
      this.id = HT++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(KT), this.nodes.forEach(qT), this.nodes.forEach(ek), this.nodes.forEach(YT);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = d, this.root = f ? f.root || f : this, this.path = f ? [...f.path, f] : [], this.parent = f, this.depth = f ? f.depth + 1 : 0;
      for (let y = 0; y < this.path.length; y++)
        this.path[y].shouldResetTransform = !0;
      this.root === this && (this.nodes = new BT());
    }
    addEventListener(d, f) {
      return this.eventHandlers.has(d) || this.eventHandlers.set(d, new td()), this.eventHandlers.get(d).add(f);
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
      this.isSVG = vd(d) && !G_(d), this.instance = d;
      const { layoutId: f, layout: y, visualElement: v } = this.options;
      if (v && !v.current && v.mount(d), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (y || f) && (this.isLayoutDirty = !0), e) {
        let S, l = 0;
        const h = () => this.root.updateBlockedByResize = !1;
        Ae.read(() => {
          l = window.innerWidth;
        }), e(d, () => {
          const g = window.innerWidth;
          g !== l && (l = g, this.root.updateBlockedByResize = !0, S && S(), S = zT(h, 250), ea.hasAnimatedSinceResize && (ea.hasAnimatedSinceResize = !1, this.nodes.forEach(Qm)));
        });
      }
      f && this.root.registerSharedNode(f, this), this.options.animate !== !1 && v && (f || y) && this.addEventListener("didUpdate", ({ delta: S, hasLayoutChanged: l, hasRelativeLayoutChanged: h, layout: g }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const x = this.options.transition || v.getDefaultTransition() || ok, { onLayoutAnimationStart: T, onLayoutAnimationComplete: k } = v.getProps(), A = !this.targetLayout || !hv(this.targetLayout, g), R = !l && h;
        if (this.options.layoutRoot || this.resumeFrom || R || l && (A || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const b = {
            ...dd(x, "layout"),
            onPlay: T,
            onComplete: k
          };
          (v.shouldReduceMotion || this.options.layoutRoot) && (b.delay = 0, b.type = !1), this.startAnimation(b), this.setAnimationOrigin(S, R, b.path);
        } else
          l || Qm(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = g;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const d = this.getStack();
      d && d.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), $n(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(tk), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && yv(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let S = 0; S < this.path.length; S++) {
        const l = this.path[S];
        l.shouldResetTransform = !0, (typeof l.latestValues.x == "string" || typeof l.latestValues.y == "string") && (l.isLayoutDirty = !0), l.updateScroll("snapshot"), l.options.layoutRoot && l.willUpdate(!1);
      }
      const { layoutId: f, layout: y } = this.options;
      if (f === void 0 && !y)
        return;
      const v = this.getTransformTemplate();
      this.prevTransformTemplateValue = v ? v(this.latestValues, "") : void 0, this.updateSnapshot(), d && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const y = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), y && this.nodes.forEach(XT), this.nodes.forEach(Km);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(Ym);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(ZT), this.nodes.forEach(JT), this.nodes.forEach(WT), this.nodes.forEach(GT)) : this.nodes.forEach(Ym), this.clearAllSnapshots();
      const f = it.now();
      Xe.delta = nn(0, 1e3 / 60, f - Xe.timestamp), Xe.timestamp = f, Xe.isProcessing = !0, Du.update.process(Xe), Du.preRender.process(Xe), Du.render.process(Xe), Xe.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, yd.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(QT), this.sharedNodes.forEach(nk);
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
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = $e()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
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
      const d = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, f = this.projectionDelta && !pv(this.projectionDelta), y = this.getTransformTemplate(), v = y ? y(this.latestValues, "") : void 0, S = v !== this.prevTransformTemplateValue;
      d && this.instance && (f || sr(this.latestValues) || S) && (a(this.instance, v), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(d = !0) {
      const f = this.measurePageBox();
      let y = this.removeElementScroll(f);
      return d && (y = this.removeTransform(y)), sk(y), {
        animationId: this.root.animationId,
        measuredBox: f,
        layoutBox: y,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      var v;
      const { visualElement: d } = this.options;
      if (!d)
        return $e();
      const f = d.measureViewportBox();
      if (!(((v = this.scroll) == null ? void 0 : v.wasRoot) || this.path.some(ak))) {
        const { scroll: S } = this.root;
        S && (Jt(f.x, S.offset.x), Jt(f.y, S.offset.y));
      }
      return f;
    }
    removeElementScroll(d) {
      var y;
      const f = $e();
      if (Lt(f, d), (y = this.scroll) != null && y.wasRoot)
        return f;
      for (let v = 0; v < this.path.length; v++) {
        const S = this.path[v], { scroll: l, options: h } = S;
        S !== this.root && l && h.layoutScroll && (l.wasRoot && Lt(f, d), Jt(f.x, l.offset.x), Jt(f.y, l.offset.y));
      }
      return f;
    }
    applyTransform(d, f = !1, y) {
      var S, l;
      const v = y || $e();
      Lt(v, d);
      for (let h = 0; h < this.path.length; h++) {
        const g = this.path[h];
        !f && g.options.layoutScroll && g.scroll && g !== g.root && (Jt(v.x, -g.scroll.offset.x), Jt(v.y, -g.scroll.offset.y)), sr(g.latestValues) && Js(v, g.latestValues, (S = g.layout) == null ? void 0 : S.layoutBox);
      }
      return sr(this.latestValues) && Js(v, this.latestValues, (l = this.layout) == null ? void 0 : l.layoutBox), v;
    }
    removeTransform(d) {
      var y;
      const f = $e();
      Lt(f, d);
      for (let v = 0; v < this.path.length; v++) {
        const S = this.path[v];
        if (!sr(S.latestValues))
          continue;
        let l;
        S.instance && (Ac(S.latestValues) && S.updateSnapshot(), l = $e(), Lt(l, S.measurePageBox())), Lm(f, S.latestValues, (y = S.snapshot) == null ? void 0 : y.layoutBox, l);
      }
      return sr(this.latestValues) && Lm(f, this.latestValues), f;
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
      var g;
      const f = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = f.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = f.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = f.isSharedProjectionDirty);
      const y = !!this.resumingFrom || this !== f;
      if (!(d || y && this.isSharedProjectionDirty || this.isProjectionDirty || (g = this.parent) != null && g.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: S, layoutId: l } = this.options;
      if (!this.layout || !(S || l))
        return;
      this.resolvedRelativeTargetAt = Xe.timestamp;
      const h = this.getClosestProjectingParent();
      h && this.linkedParentVersion !== h.layoutVersion && !h.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && h && h.layout ? this.createRelativeTarget(h, this.layout.layoutBox, h.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = $e(), this.targetWithTransforms = $e()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), PT(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : Lt(this.target, this.layout.layoutBox), tv(this.target, this.targetDelta)) : Lt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && h && !!h.resumingFrom == !!this.resumingFrom && !h.options.layoutScroll && h.target && this.animationProgress !== 1 ? this.createRelativeTarget(h, this.target, h.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Ac(this.parent.latestValues) || ev(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(d, f, y) {
      this.relativeParent = d, this.linkedParentVersion = d.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = $e(), this.relativeTargetOrigin = $e(), ma(this.relativeTargetOrigin, f, y, this.options.layoutAnchor || void 0), Lt(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      var x;
      const d = this.getLead(), f = !!this.resumingFrom || this !== d;
      let y = !0;
      if ((this.isProjectionDirty || (x = this.parent) != null && x.isProjectionDirty) && (y = !1), f && (this.isSharedProjectionDirty || this.isTransformDirty) && (y = !1), this.resolvedRelativeTargetAt === Xe.timestamp && (y = !1), y)
        return;
      const { layout: v, layoutId: S } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(v || S))
        return;
      Lt(this.layoutCorrected, this.layout.layoutBox);
      const l = this.treeScale.x, h = this.treeScale.y;
      rT(this.layoutCorrected, this.treeScale, this.path, f), d.layout && !d.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (d.target = d.layout.layoutBox, d.targetWithTransforms = $e());
      const { target: g } = d;
      if (!g) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Nm(this.prevProjectionDelta.x, this.projectionDelta.x), Nm(this.prevProjectionDelta.y, this.projectionDelta.y)), to(this.projectionDelta, this.layoutCorrected, g, this.latestValues), (this.treeScale.x !== l || this.treeScale.y !== h || !$m(this.projectionDelta.x, this.prevProjectionDelta.x) || !$m(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", g));
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
      const v = this.snapshot, S = v ? v.latestValues : {}, l = { ...this.latestValues }, h = Yr();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !f;
      const g = $e(), x = v ? v.source : void 0, T = this.layout ? this.layout.source : void 0, k = x !== T, A = this.getStack(), R = !A || A.members.length <= 1, b = !!(k && !R && this.options.crossfade === !0 && !this.path.some(ik));
      this.animationProgress = 0;
      let D;
      const L = y == null ? void 0 : y.interpolateProjection(d);
      this.mixTargetDelta = (K) => {
        const Q = K / 1e3, $ = L == null ? void 0 : L(Q);
        $ ? (h.x.translate = $.x, h.x.scale = Te(d.x.scale, 1, Q), h.x.origin = d.x.origin, h.x.originPoint = d.x.originPoint, h.y.translate = $.y, h.y.scale = Te(d.y.scale, 1, Q), h.y.origin = d.y.origin, h.y.originPoint = d.y.originPoint) : (Xm(h.x, d.x, Q), Xm(h.y, d.y, Q)), this.setTargetDelta(h), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (ma(g, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), rk(this.relativeTarget, this.relativeTargetOrigin, g, Q), D && NT(this.relativeTarget, D) && (this.isProjectionDirty = !1), D || (D = $e()), Lt(D, this.relativeTarget)), k && (this.animationValues = l, IT(l, S, this.latestValues, Q, b, R)), $ && $.rotate !== void 0 && (this.animationValues || (this.animationValues = l), this.animationValues.pathRotation = $.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = Q;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(d) {
      var f, y, v;
      this.notifyListeners("animationStart"), (f = this.currentAnimation) == null || f.stop(), (v = (y = this.resumingFrom) == null ? void 0 : y.currentAnimation) == null || v.stop(), this.pendingAnimation && ($n(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Ae.update(() => {
        ea.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = qr(0)), this.motionValue.jump(0, !1), this.currentAnimation = LT(this.motionValue, [0, 1e3], {
          ...d,
          velocity: 0,
          isSync: !0,
          onUpdate: (S) => {
            this.mixTargetDelta(S), d.onUpdate && d.onUpdate(S);
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta($T), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const d = this.getLead();
      let { targetWithTransforms: f, target: y, layout: v, latestValues: S } = d;
      if (!(!f || !y || !v)) {
        if (this !== d && this.layout && v && vv(this.options.animationType, this.layout.layoutBox, v.layoutBox)) {
          y = this.target || $e();
          const l = ot(this.layout.layoutBox.x);
          y.x.min = d.target.x.min, y.x.max = y.x.min + l;
          const h = ot(this.layout.layoutBox.y);
          y.y.min = d.target.y.min, y.y.max = y.y.min + h;
        }
        Lt(f, y), Js(f, S), to(this.projectionDeltaWithTransform, this.layoutCorrected, f, S);
      }
    }
    registerSharedNode(d, f) {
      this.sharedNodes.has(d) || this.sharedNodes.set(d, new UT()), this.sharedNodes.get(d).add(f);
      const v = f.options.initialPromotionConfig;
      f.promote({
        transition: v ? v.transition : void 0,
        preserveFollowOpacity: v && v.shouldPreserveFollowOpacity ? v.shouldPreserveFollowOpacity(f) : void 0
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
      const v = this.getStack();
      v && v.promote(this, y), d && (this.projectionDelta = void 0, this.needsReset = !0), f && this.setOptions({ transition: f });
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
      const v = {};
      y.z && Uu("z", d, v, this.animationValues);
      for (let S = 0; S < zu.length; S++)
        Uu(`rotate${zu[S]}`, d, v, this.animationValues), Uu(`skew${zu[S]}`, d, v, this.animationValues);
      d.render();
      for (const S in v)
        d.setStaticValue(S, v[S]), this.animationValues && (this.animationValues[S] = v[S]);
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
        this.needsReset = !1, d.visibility = "", d.opacity = "", d.pointerEvents = qs(f == null ? void 0 : f.pointerEvents) || "", d.transform = y ? y(this.latestValues, "") : "none";
        return;
      }
      const v = this.getLead();
      if (!this.projectionDelta || !this.layout || !v.target) {
        this.options.layoutId && (d.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, d.pointerEvents = qs(f == null ? void 0 : f.pointerEvents) || ""), this.hasProjected && !sr(this.latestValues) && (d.transform = y ? y({}, "") : "none", this.hasProjected = !1);
        return;
      }
      d.visibility = "";
      const S = v.animationValues || v.latestValues;
      this.applyTransformsToTarget();
      let l = DT(this.projectionDeltaWithTransform, this.treeScale, S);
      y && (l = y(S, l)), d.transform = l;
      const { x: h, y: g } = this.projectionDelta;
      d.transformOrigin = `${h.origin * 100}% ${g.origin * 100}% 0`, v.animationValues ? d.opacity = v === this ? S.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : S.opacityExit : d.opacity = v === this ? S.opacity !== void 0 ? S.opacity : "" : S.opacityExit !== void 0 ? S.opacityExit : 0;
      for (const x in Ec) {
        if (S[x] === void 0)
          continue;
        const { correct: T, applyTo: k, isCSSVariable: A } = Ec[x], R = l === "none" ? S[x] : T(S[x], v);
        if (k) {
          const b = k.length;
          for (let D = 0; D < b; D++)
            d[k[D]] = R;
        } else
          A ? this.options.visualElement.renderState.vars[x] = R : d[x] = R;
      }
      this.options.layoutId && (d.pointerEvents = v === this ? qs(f == null ? void 0 : f.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((d) => {
        var f;
        return (f = d.currentAnimation) == null ? void 0 : f.stop();
      }), this.root.nodes.forEach(Km), this.root.sharedNodes.clear();
    }
  };
}
function WT(e) {
  e.updateLayout();
}
function GT(e) {
  var i;
  const n = ((i = e.resumeFrom) == null ? void 0 : i.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: o, measuredBox: a } = e.layout, { animationType: c } = e.options, d = n.source !== e.layout.source;
    if (c === "size")
      Zt((l) => {
        const h = d ? n.measuredBox[l] : n.layoutBox[l], g = ot(h);
        h.min = o[l].min, h.max = h.min + g;
      });
    else if (c === "x" || c === "y") {
      const l = c === "x" ? "y" : "x";
      Pc(d ? n.measuredBox[l] : n.layoutBox[l], o[l]);
    } else vv(c, n.layoutBox, o) && Zt((l) => {
      const h = d ? n.measuredBox[l] : n.layoutBox[l], g = ot(o[l]);
      h.max = h.min + g, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[l].max = e.relativeTarget[l].min + g);
    });
    const f = Yr();
    to(f, o, n.layoutBox);
    const y = Yr();
    d ? to(y, e.applyTransform(a, !0), n.measuredBox) : to(y, o, n.layoutBox);
    const v = !pv(f);
    let S = !1;
    if (!e.resumeFrom) {
      const l = e.getClosestProjectingParent();
      if (l && !l.resumeFrom) {
        const { snapshot: h, layout: g } = l;
        if (h && g) {
          const x = e.options.layoutAnchor || void 0, T = $e();
          ma(T, n.layoutBox, h.layoutBox, x);
          const k = $e();
          ma(k, o, g.layoutBox, x), hv(T, k) || (S = !0), l.options.layoutRoot && (e.relativeTarget = k, e.relativeTargetOrigin = T, e.relativeParent = l);
        }
      }
    }
    e.notifyListeners("didUpdate", {
      layout: o,
      snapshot: n,
      delta: y,
      layoutDelta: f,
      hasLayoutChanged: v,
      hasRelativeLayoutChanged: S
    });
  } else if (e.isLead()) {
    const { onExitComplete: o } = e.options;
    o && o();
  }
  e.options.transition = void 0;
}
function KT(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function YT(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function QT(e) {
  e.clearSnapshot();
}
function Km(e) {
  e.clearMeasurements();
}
function XT(e) {
  e.isLayoutDirty = !0, e.updateLayout();
}
function Ym(e) {
  e.isLayoutDirty = !1;
}
function ZT(e) {
  e.isAnimationBlocked && e.layout && !e.isLayoutDirty && (e.snapshot = e.layout, e.isLayoutDirty = !0);
}
function JT(e) {
  const { visualElement: n } = e.options;
  n && n.getProps().onBeforeLayoutMeasure && n.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function Qm(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function qT(e) {
  e.resolveTargetDelta();
}
function ek(e) {
  e.calcProjection();
}
function tk(e) {
  e.resetSkewAndRotation();
}
function nk(e) {
  e.removeLeadSnapshot();
}
function Xm(e, n, i) {
  e.translate = Te(n.translate, 0, i), e.scale = Te(n.scale, 1, i), e.origin = n.origin, e.originPoint = n.originPoint;
}
function Zm(e, n, i, o) {
  e.min = Te(n.min, i.min, o), e.max = Te(n.max, i.max, o);
}
function rk(e, n, i, o) {
  Zm(e.x, n.x, i.x, o), Zm(e.y, n.y, i.y, o);
}
function ik(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const ok = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, Jm = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), qm = Jm("applewebkit/") && !Jm("chrome/") ? Math.round : Mt;
function ey(e) {
  e.min = qm(e.min), e.max = qm(e.max);
}
function sk(e) {
  ey(e.x), ey(e.y);
}
function vv(e, n, i) {
  return e === "position" || e === "preserve-aspect" && !ET(Um(n), Um(i), 0.2);
}
function ak(e) {
  var n;
  return e !== e.root && ((n = e.scroll) == null ? void 0 : n.wasRoot);
}
const lk = gv({
  attachResizeListener: (e, n) => uo(e, "resize", n),
  measureScroll: () => {
    var e, n;
    return {
      x: document.documentElement.scrollLeft || ((e = document.body) == null ? void 0 : e.scrollLeft) || 0,
      y: document.documentElement.scrollTop || ((n = document.body) == null ? void 0 : n.scrollTop) || 0
    };
  },
  checkIsScrollRoot: () => !0
}), $u = {
  current: void 0
}, Sv = gv({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!$u.current) {
      const e = new lk({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), $u.current = e;
    }
    return $u.current;
  },
  resetTransform: (e, n) => {
    e.style.transform = n !== void 0 ? n : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), Td = C.createContext({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
function ty(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function uk(...e) {
  return (n) => {
    let i = !1;
    const o = e.map((a) => {
      const c = ty(a, n);
      return !i && typeof c == "function" && (i = !0), c;
    });
    if (i)
      return () => {
        for (let a = 0; a < o.length; a++) {
          const c = o[a];
          typeof c == "function" ? c() : ty(e[a], null);
        }
      };
  };
}
function ck(...e) {
  return C.useCallback(uk(...e), e);
}
class dk extends C.Component {
  getSnapshotBeforeUpdate(n) {
    const i = this.props.childRef.current;
    if (Ys(i) && n.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const o = i.offsetParent, a = Ys(o) && o.offsetWidth || 0, c = Ys(o) && o.offsetHeight || 0, d = getComputedStyle(i), f = this.props.sizeRef.current;
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
function fk({ children: e, isPresent: n, anchorX: i, anchorY: o, root: a, pop: c }) {
  var h;
  const d = C.useId(), f = C.useRef(null), y = C.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: v } = C.useContext(Td), S = ((h = e.props) == null ? void 0 : h.ref) ?? (e == null ? void 0 : e.ref), l = ck(f, S);
  return C.useInsertionEffect(() => {
    const { width: g, height: x, top: T, left: k, right: A, bottom: R, direction: b } = y.current;
    if (n || c === !1 || !f.current || !g || !x)
      return;
    const D = b === "rtl", L = i === "left" ? D ? `right: ${A}` : `left: ${k}` : D ? `left: ${k}` : `right: ${A}`, K = o === "bottom" ? `bottom: ${R}` : `top: ${T}`;
    f.current.dataset.motionPopId = d;
    const Q = document.createElement("style");
    v && (Q.nonce = v);
    const $ = a ?? document.head;
    return $.appendChild(Q), Q.sheet && Q.sheet.insertRule(`
          [data-motion-pop-id="${d}"] {
            position: absolute !important;
            width: ${g}px !important;
            height: ${x}px !important;
            ${L}px !important;
            ${K}px !important;
          }
        `), () => {
      var W;
      (W = f.current) == null || W.removeAttribute("data-motion-pop-id"), $.contains(Q) && $.removeChild(Q);
    };
  }, [n]), w.jsx(dk, { isPresent: n, childRef: f, sizeRef: y, pop: c, children: c === !1 ? e : C.cloneElement(e, { ref: l }) });
}
const pk = ({ children: e, initial: n, isPresent: i, onExitComplete: o, custom: a, presenceAffectsLayout: c, mode: d, anchorX: f, anchorY: y, root: v }) => {
  const S = Jc(hk), l = C.useId(), h = C.useRef(i), g = C.useRef(o);
  qc(() => {
    h.current = i, g.current = o;
  });
  let x = !0, T = C.useMemo(() => (x = !1, {
    id: l,
    initial: n,
    isPresent: i,
    custom: a,
    onExitComplete: (k) => {
      S.set(k, !0);
      for (const A of S.values())
        if (!A)
          return;
      o && o();
    },
    register: (k) => (S.set(k, !1), () => {
      var A;
      S.delete(k), !h.current && !S.size && ((A = g.current) == null || A.call(g));
    })
  }), [i, S, o]);
  return c && x && (T = { ...T }), C.useMemo(() => {
    S.forEach((k, A) => S.set(A, !1));
  }, [i]), C.useEffect(() => {
    !i && !S.size && o && o();
  }, [i]), e = w.jsx(fk, { pop: d === "popLayout", isPresent: i, anchorX: f, anchorY: y, root: v, children: e }), w.jsx(ka.Provider, { value: T, children: e });
};
function hk() {
  return /* @__PURE__ */ new Map();
}
function wv(e = !0) {
  const n = C.useContext(ka);
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
function ny(e) {
  const n = [];
  return C.Children.forEach(e, (i) => {
    C.isValidElement(i) && n.push(i);
  }), n;
}
const Pa = ({ children: e, custom: n, initial: i = !0, onExitComplete: o, presenceAffectsLayout: a = !0, mode: c = "sync", propagate: d = !1, anchorX: f = "left", anchorY: y = "top", root: v }) => {
  const [S, l] = wv(d), h = C.useMemo(() => ny(e), [e]), g = d && !S ? [] : h.map(Os), x = C.useRef(!0), T = C.useRef(h), k = Jc(() => /* @__PURE__ */ new Map()), A = C.useRef(/* @__PURE__ */ new Set()), [R, b] = C.useState(h), [D, L] = C.useState(h);
  qc(() => {
    x.current = !1, T.current = h;
    for (let $ = 0; $ < D.length; $++) {
      const W = Os(D[$]);
      g.includes(W) ? (k.delete(W), A.current.delete(W)) : k.get(W) !== !0 && k.set(W, !1);
    }
  }, [D, g.length, g.join("-")]);
  const K = [];
  if (h !== R) {
    let $ = [...h];
    for (let W = 0; W < D.length; W++) {
      const X = D[W], J = Os(X);
      g.includes(J) || ($.splice(W, 0, X), K.push(X));
    }
    return c === "wait" && K.length && ($ = K), L(ny($)), b(h), null;
  }
  const { forceRender: Q } = C.useContext(Zc);
  return w.jsx(w.Fragment, { children: D.map(($) => {
    const W = Os($), X = d && !S ? !1 : h === D || g.includes(W), J = () => {
      if (A.current.has(W))
        return;
      if (k.has(W))
        A.current.add(W), k.set(W, !0);
      else
        return;
      let ce = !0;
      k.forEach((me) => {
        me || (ce = !1);
      }), ce && (Q == null || Q(), L(T.current), d && (l == null || l()), o && o());
    };
    return w.jsx(pk, { isPresent: X, initial: !x.current || i ? void 0 : !1, custom: n, presenceAffectsLayout: a, mode: c, root: v, onExitComplete: X ? void 0 : J, anchorX: f, anchorY: y, children: $ }, W);
  }) });
}, xv = C.createContext({ strict: !1 }), ry = {
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
let iy = !1;
function mk() {
  if (iy)
    return;
  const e = {};
  for (const n in ry)
    e[n] = {
      isEnabled: (i) => ry[n].some((o) => !!i[o])
    };
  Zg(e), iy = !0;
}
function _v() {
  return mk(), q_();
}
function yk(e) {
  const n = _v();
  for (const i in e)
    n[i] = {
      ...n[i],
      ...e[i]
    };
  Zg(n);
}
const gk = /* @__PURE__ */ new Set([
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
function ya(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || gk.has(e);
}
let Tv = (e) => !ya(e);
function vk(e) {
  typeof e == "function" && (Tv = (n) => n.startsWith("on") ? !ya(n) : e(n));
}
try {
  vk(require("@emotion/is-prop-valid").default);
} catch {
}
function Sk(e, n, i) {
  const o = {};
  for (const a in e)
    a === "values" && typeof e.values == "object" || Ze(e[a]) || (Tv(a) || i === !0 && ya(a) || !n && !ya(a) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && a.startsWith("onDrag")) && (o[a] = e[a]);
  return o;
}
const ba = /* @__PURE__ */ C.createContext({});
function wk(e, n) {
  if (Ea(e)) {
    const { initial: i, animate: o } = e;
    return {
      initial: i === !1 || lo(i) ? i : void 0,
      animate: lo(o) ? o : void 0
    };
  }
  return e.inherit !== !1 ? n : {};
}
function xk(e) {
  const { initial: n, animate: i } = wk(e, C.useContext(ba));
  return C.useMemo(() => ({ initial: n, animate: i }), [oy(n), oy(i)]);
}
function oy(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const kd = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function kv(e, n, i) {
  for (const o in n)
    !Ze(n[o]) && !iv(o, i) && (e[o] = n[o]);
}
function _k({ transformTemplate: e }, n) {
  return C.useMemo(() => {
    const i = kd();
    return xd(i, n, e), Object.assign({}, i.vars, i.style);
  }, [n]);
}
function Tk(e, n) {
  const i = e.style || {}, o = {};
  return kv(o, i, e), Object.assign(o, _k(e, n)), o;
}
function kk(e, n) {
  const i = {}, o = Tk(e, n);
  return e.drag && e.dragListener !== !1 && (i.draggable = !1, o.userSelect = o.WebkitUserSelect = o.WebkitTouchCallout = "none", o.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (i.tabIndex = 0), i.style = o, i;
}
const Av = () => ({
  ...kd(),
  attrs: {}
});
function Ak(e, n, i, o) {
  const a = C.useMemo(() => {
    const c = Av();
    return ov(c, n, av(o), e.transformTemplate, e.style), {
      ...c.attrs,
      style: { ...c.style }
    };
  }, [n]);
  if (e.style) {
    const c = {};
    kv(c, e.style, e), a.style = { ...c, ...a.style };
  }
  return a;
}
const Ck = [
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
function Ad(e) {
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
      !!(Ck.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function Ek(e, n, i, { latestValues: o }, a, c = !1, d) {
  const y = (d ?? Ad(e) ? Ak : kk)(n, o, a, e), v = Sk(n, typeof e == "string", c), S = e !== C.Fragment ? { ...v, ...y, ref: i } : {}, { children: l } = n, h = C.useMemo(() => Ze(l) ? l.get() : l, [l]);
  return C.createElement(e, {
    ...S,
    children: h
  });
}
function Pk({ scrapeMotionValuesFromProps: e, createRenderState: n }, i, o, a) {
  return {
    latestValues: bk(i, o, a, e),
    renderState: n()
  };
}
function bk(e, n, i, o) {
  const a = {}, c = o(e, {});
  for (const h in c)
    a[h] = qs(c[h]);
  let { initial: d, animate: f } = e;
  const y = Ea(e), v = Qg(e);
  n && v && !y && e.inherit !== !1 && (d === void 0 && (d = n.initial), f === void 0 && (f = n.animate));
  let S = i ? i.initial === !1 : !1;
  S = S || d === !1;
  const l = S ? f : d;
  if (l && typeof l != "boolean" && !Ca(l)) {
    const h = Array.isArray(l) ? l : [l];
    for (let g = 0; g < h.length; g++) {
      const x = pd(e, h[g]);
      if (x) {
        const { transitionEnd: T, transition: k, ...A } = x;
        for (const R in A) {
          let b = A[R];
          if (Array.isArray(b)) {
            const D = S ? b.length - 1 : 0;
            b = b[D];
          }
          b !== null && (a[R] = b);
        }
        for (const R in T)
          a[R] = T[R];
      }
    }
  }
  return a;
}
const Cv = (e) => (n, i) => {
  const o = C.useContext(ba), a = C.useContext(ka), c = () => Pk(e, n, o, a);
  return i ? c() : Jc(c);
}, Mk = /* @__PURE__ */ Cv({
  scrapeMotionValuesFromProps: _d,
  createRenderState: kd
}), Rk = /* @__PURE__ */ Cv({
  scrapeMotionValuesFromProps: lv,
  createRenderState: Av
}), Nk = Symbol.for("motionComponentSymbol");
function Dk(e, n, i) {
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
const Ev = C.createContext({});
function Wr(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function jk(e, n, i, o, a, c) {
  var b, D;
  const { visualElement: d } = C.useContext(ba), f = C.useContext(xv), y = C.useContext(ka), v = C.useContext(Td), S = v.reducedMotion, l = v.skipAnimations, h = C.useRef(null), g = C.useRef(!1);
  o = o || f.renderer, !h.current && o && (h.current = o(e, {
    visualState: n,
    parent: d,
    props: i,
    presenceContext: y,
    blockInitialAnimation: y ? y.initial === !1 : !1,
    reducedMotionConfig: S,
    skipAnimations: l,
    isSVG: c
  }), g.current && h.current && (h.current.manuallyAnimateOnMount = !0));
  const x = h.current, T = C.useContext(Ev);
  x && !x.projection && a && (x.type === "html" || x.type === "svg") && Ik(h.current, i, a, T);
  const k = C.useRef(!1);
  C.useInsertionEffect(() => {
    x && k.current && x.update(i, y);
  });
  const A = i[Og], R = C.useRef(!!A && typeof window < "u" && !((b = window.MotionHandoffIsComplete) != null && b.call(window, A)) && ((D = window.MotionHasOptimisedAnimation) == null ? void 0 : D.call(window, A)));
  return qc(() => {
    g.current = !0, x && (k.current = !0, window.MotionIsMounted = !0, x.updateFeatures(), x.scheduleRenderMicrotask(), R.current && x.animationState && x.animationState.animateChanges());
  }), C.useEffect(() => {
    x && (!R.current && x.animationState && x.animationState.animateChanges(), R.current && (queueMicrotask(() => {
      var L;
      (L = window.MotionHandoffMarkAsComplete) == null || L.call(window, A);
    }), R.current = !1), x.enteringChildren = void 0);
  }), x;
}
function Ik(e, n, i, o) {
  const { layoutId: a, layout: c, drag: d, dragConstraints: f, layoutScroll: y, layoutRoot: v, layoutAnchor: S, layoutCrossfade: l } = n;
  e.projection = new i(e.latestValues, n["data-framer-portal-id"] ? void 0 : Pv(e.parent)), e.projection.setOptions({
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
    layoutRoot: v,
    layoutAnchor: S
  });
}
function Pv(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Pv(e.parent);
}
function Hu(e, { forwardMotionProps: n = !1, type: i } = {}, o, a) {
  o && yk(o);
  const c = i ? i === "svg" : Ad(e), d = c ? Rk : Mk;
  function f(v, S) {
    let l;
    const h = {
      ...C.useContext(Td),
      ...v,
      layoutId: Fk(v)
    }, { isStatic: g } = h, x = xk(v), T = d(v, g);
    if (!g && typeof window < "u") {
      Ok();
      const k = Lk(h);
      l = k.MeasureLayout, x.visualElement = jk(e, T, h, a, k.ProjectionNode, c);
    }
    return w.jsxs(ba.Provider, { value: x, children: [l && x.visualElement ? w.jsx(l, { visualElement: x.visualElement, ...h }) : null, Ek(e, v, Dk(T, x.visualElement, S), T, g, n, c)] });
  }
  f.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const y = C.forwardRef(f);
  return y[Nk] = e, y;
}
function Fk({ layoutId: e }) {
  const n = C.useContext(Zc).id;
  return n && e !== void 0 ? n + "-" + e : e;
}
function Ok(e, n) {
  C.useContext(xv).strict;
}
function Lk(e) {
  const n = _v(), { drag: i, layout: o } = n;
  if (!i && !o)
    return {};
  const a = { ...i, ...o };
  return {
    MeasureLayout: i != null && i.isEnabled(e) || o != null && o.isEnabled(e) ? a.MeasureLayout : void 0,
    ProjectionNode: a.ProjectionNode
  };
}
function Vk(e, n) {
  if (typeof Proxy > "u")
    return Hu;
  const i = /* @__PURE__ */ new Map(), o = (c, d) => Hu(c, d, e, n), a = (c, d) => o(c, d);
  return new Proxy(a, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (c, d) => d === "create" ? o : (i.has(d) || i.set(d, Hu(d, void 0, e, n)), i.get(d))
  });
}
const Bk = (e, n) => n.isSVG ?? Ad(e) ? new yT(n) : new cT(n, {
  allowProjection: e !== C.Fragment
});
class zk extends Wn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(n) {
    super(n), n.animationState || (n.animationState = xT(n));
  }
  updateAnimationControlsSubscription() {
    const { animate: n } = this.node.getProps();
    Ca(n) && (this.unmountControls = n.subscribe(this.node));
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
let Uk = 0;
class $k extends Wn {
  constructor() {
    super(...arguments), this.id = Uk++, this.isExitComplete = !1;
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
          const y = fr(this.node, d, f);
          if (y) {
            const { transition: v, transitionEnd: S, ...l } = y;
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
const Hk = {
  animation: {
    Feature: zk
  },
  exit: {
    Feature: $k
  }
};
function xo(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const Wk = (e) => (n) => gd(n) && e(n, xo(n));
function no(e, n, i, o) {
  return uo(e, n, Wk(i), o);
}
const bv = ({ current: e }) => e ? e.ownerDocument.defaultView : null, sy = (e, n) => Math.abs(e - n);
function Gk(e, n) {
  const i = sy(e.x, n.x), o = sy(e.y, n.y);
  return Math.sqrt(i ** 2 + o ** 2);
}
const ay = /* @__PURE__ */ new Set(["auto", "scroll"]);
class Mv {
  constructor(n, i, { transformPagePoint: o, contextWindow: a = window, dragSnapToOrigin: c = !1, distanceThreshold: d = 3, element: f } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (x) => {
      this.handleScroll(x.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = Ls(this.lastRawMoveEventInfo, this.transformPagePoint));
      const x = Wu(this.lastMoveEventInfo, this.history), T = this.startEvent !== null, k = Gk(x.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!T && !k)
        return;
      const { point: A } = x, { timestamp: R } = Xe;
      this.history.push({ ...A, timestamp: R });
      const { onStart: b, onMove: D } = this.handlers;
      T || (b && b(this.lastMoveEvent, x), this.startEvent = this.lastMoveEvent), D && D(this.lastMoveEvent, x);
    }, this.handlePointerMove = (x, T) => {
      this.lastMoveEvent = x, this.lastRawMoveEventInfo = T, this.lastMoveEventInfo = Ls(T, this.transformPagePoint), Ae.update(this.updatePoint, !0);
    }, this.handlePointerUp = (x, T) => {
      this.end();
      const { onEnd: k, onSessionEnd: A, resumeAnimation: R } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && R && R(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const b = Wu(x.type === "pointercancel" ? this.lastMoveEventInfo : Ls(T, this.transformPagePoint), this.history);
      this.startEvent && k && k(x, b), A && A(x, b);
    }, !gd(n))
      return;
    this.dragSnapToOrigin = c, this.handlers = i, this.transformPagePoint = o, this.distanceThreshold = d, this.contextWindow = a || window;
    const y = xo(n), v = Ls(y, this.transformPagePoint), { point: S } = v, { timestamp: l } = Xe;
    this.history = [{ ...S, timestamp: l }];
    const { onSessionStart: h } = i;
    h && h(n, Wu(v, this.history));
    const g = { passive: !0, capture: !0 };
    this.removeListeners = vo(no(this.contextWindow, "pointermove", this.handlePointerMove, g), no(this.contextWindow, "pointerup", this.handlePointerUp, g), no(this.contextWindow, "pointercancel", this.handlePointerUp, g)), f && this.startScrollTracking(f);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(n) {
    let i = n.parentElement;
    for (; i; ) {
      const o = getComputedStyle(i);
      (ay.has(o.overflowX) || ay.has(o.overflowY)) && this.scrollPositions.set(i, {
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
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), $n(this.updatePoint);
  }
}
function Ls(e, n) {
  return n ? { point: n(e.point) } : e;
}
function ly(e, n) {
  return { x: e.x - n.x, y: e.y - n.y };
}
function Wu({ point: e }, n) {
  return {
    point: e,
    delta: ly(e, Rv(n)),
    offset: ly(e, Kk(n)),
    velocity: Yk(n, 0.1)
  };
}
function Kk(e) {
  return e[0];
}
function Rv(e) {
  return e[e.length - 1];
}
function Yk(e, n) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let i = e.length - 1, o = null;
  const a = Rv(e);
  for (; i >= 0 && (o = e[i], !(a.timestamp - o.timestamp > /* @__PURE__ */ mt(n))); )
    i--;
  if (!o)
    return { x: 0, y: 0 };
  o === e[0] && e.length > 2 && a.timestamp - o.timestamp > /* @__PURE__ */ mt(n) * 2 && (o = e[1]);
  const c = /* @__PURE__ */ bt(a.timestamp - o.timestamp);
  if (c === 0)
    return { x: 0, y: 0 };
  const d = {
    x: (a.x - o.x) / c,
    y: (a.y - o.y) / c
  };
  return d.x === 1 / 0 && (d.x = 0), d.y === 1 / 0 && (d.y = 0), d;
}
function Qk(e, { min: n, max: i }, o) {
  return n !== void 0 && e < n ? e = o ? Te(n, e, o.min) : Math.max(e, n) : i !== void 0 && e > i && (e = o ? Te(i, e, o.max) : Math.min(e, i)), e;
}
function uy(e, n, i) {
  return {
    min: n !== void 0 ? e.min + n : void 0,
    max: i !== void 0 ? e.max + i - (e.max - e.min) : void 0
  };
}
function Xk(e, { top: n, left: i, bottom: o, right: a }) {
  return {
    x: uy(e.x, i, a),
    y: uy(e.y, n, o)
  };
}
function cy(e, n) {
  let i = n.min - e.min, o = n.max - e.max;
  return n.max - n.min < e.max - e.min && ([i, o] = [o, i]), { min: i, max: o };
}
function Zk(e, n) {
  return {
    x: cy(e.x, n.x),
    y: cy(e.y, n.y)
  };
}
function Jk(e, n) {
  let i = 0.5;
  const o = ot(e), a = ot(n);
  return a > o ? i = /* @__PURE__ */ so(n.min, n.max - o, e.min) : o > a && (i = /* @__PURE__ */ so(e.min, e.max - a, n.min)), nn(0, 1, i);
}
function qk(e, n) {
  const i = {};
  return n.min !== void 0 && (i.min = n.min - e.min), n.max !== void 0 && (i.max = n.max - e.min), i;
}
const bc = 0.35;
function eA(e = bc) {
  return e === !1 ? e = 0 : e === !0 && (e = bc), {
    x: dy(e, "left", "right"),
    y: dy(e, "top", "bottom")
  };
}
function dy(e, n, i) {
  return {
    min: fy(e, n),
    max: fy(e, i)
  };
}
function fy(e, n) {
  return typeof e == "number" ? e : e[n] || 0;
}
const tA = /* @__PURE__ */ new WeakMap();
class nA {
  constructor(n) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = $e(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = n;
  }
  start(n, { snapToCursor: i = !1, distanceThreshold: o } = {}) {
    const { presenceContext: a } = this.visualElement;
    if (a && a.isPresent === !1)
      return;
    const c = (l) => {
      i && this.snapToCursor(xo(l).point), this.stopAnimation();
    }, d = (l, h) => {
      const { drag: g, dragPropagation: x, onDragStart: T } = this.getProps();
      if (g && !x && (this.openDragLock && this.openDragLock(), this.openDragLock = b_(g), !this.openDragLock))
        return;
      this.latestPointerEvent = l, this.latestPanInfo = h, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Zt((A) => {
        let R = this.getAxisMotionValue(A).get() || 0;
        if (en.test(R)) {
          const { projection: b } = this.visualElement;
          if (b && b.layout) {
            const D = b.layout.layoutBox[A];
            D && (R = ot(D) * (parseFloat(R) / 100));
          }
        }
        this.originPoint[A] = R;
      }), T && Ae.update(() => T(l, h), !1, !0), Sc(this.visualElement, "transform");
      const { animationState: k } = this.visualElement;
      k && k.setActive("whileDrag", !0);
    }, f = (l, h) => {
      this.latestPointerEvent = l, this.latestPanInfo = h;
      const { dragPropagation: g, dragDirectionLock: x, onDirectionLock: T, onDrag: k } = this.getProps();
      if (!g && !this.openDragLock)
        return;
      const { offset: A } = h;
      if (x && this.currentDirection === null) {
        this.currentDirection = iA(A), this.currentDirection !== null && T && T(this.currentDirection);
        return;
      }
      this.updateAxis("x", h.point, A), this.updateAxis("y", h.point, A), this.visualElement.render(), k && Ae.update(() => k(l, h), !1, !0);
    }, y = (l, h) => {
      this.latestPointerEvent = l, this.latestPanInfo = h, this.stop(l, h), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, v = () => {
      const { dragSnapToOrigin: l } = this.getProps();
      (l || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: S } = this.getProps();
    this.panSession = new Mv(n, {
      onSessionStart: c,
      onStart: d,
      onMove: f,
      onSessionEnd: y,
      resumeAnimation: v
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: S,
      distanceThreshold: o,
      contextWindow: bv(this.visualElement),
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
    if (!o || !Vs(n, a, this.currentDirection))
      return;
    const c = this.getAxisMotionValue(n);
    let d = this.originPoint[n] + o[n];
    this.constraints && this.constraints[n] && (d = Qk(d, this.constraints[n], this.elastic[n])), c.set(d);
  }
  resolveConstraints() {
    var c;
    const { dragConstraints: n, dragElastic: i } = this.getProps(), o = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (c = this.visualElement.projection) == null ? void 0 : c.layout, a = this.constraints;
    n && Wr(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && o ? this.constraints = Xk(o.layoutBox, n) : this.constraints = !1, this.elastic = eA(i), a !== this.constraints && !Wr(n) && o && this.constraints && !this.hasMutatedConstraints && Zt((d) => {
      this.constraints !== !1 && this.getAxisMotionValue(d) && (this.constraints[d] = qk(o.layoutBox[d], this.constraints[d]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: n, onMeasureDragConstraints: i } = this.getProps();
    if (!n || !Wr(n))
      return !1;
    const o = n.current;
    mr(o !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: a } = this.visualElement;
    if (!a || !a.layout)
      return !1;
    a.root && (a.root.scroll = void 0, a.root.updateScroll());
    const c = iT(o, a.root, this.visualElement.getTransformPagePoint());
    let d = Zk(a.layout.layoutBox, c);
    if (i) {
      const f = i(tT(d));
      this.hasMutatedConstraints = !!f, f && (d = qg(f));
    }
    return d;
  }
  startAnimation(n) {
    const { drag: i, dragMomentum: o, dragElastic: a, dragTransition: c, dragSnapToOrigin: d, onDragTransitionEnd: f } = this.getProps(), y = this.constraints || {}, v = Zt((S) => {
      if (!Vs(S, i, this.currentDirection))
        return;
      let l = y && y[S] || {};
      (d === !0 || d === S) && (l = { min: 0, max: 0 });
      const h = a ? 200 : 1e6, g = a ? 40 : 1e7, x = {
        type: "inertia",
        velocity: o ? n[S] : 0,
        bounceStiffness: h,
        bounceDamping: g,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...c,
        ...l
      };
      return this.startAxisValueAnimation(S, x);
    });
    return Promise.all(v).then(f);
  }
  startAxisValueAnimation(n, i) {
    const o = this.getAxisMotionValue(n);
    return Sc(this.visualElement, n), o.start(fd(n, o, 0, i, this.visualElement, !1));
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
      if (!Vs(i, o, this.currentDirection))
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
        a[d] = Jk({ min: y, max: y }, this.constraints[d]);
      }
    });
    const { transformTemplate: c } = this.visualElement.getProps();
    this.visualElement.current.style.transform = c ? c({}, "") : "none", o.root && o.root.updateScroll(), o.updateLayout(), this.constraints = !1, this.resolveConstraints(), Zt((d) => {
      if (!Vs(d, n, null))
        return;
      const f = this.getAxisMotionValue(d), { min: y, max: v } = this.constraints[d];
      f.set(Te(y, v, a[d]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    tA.set(this.visualElement, this);
    const n = this.visualElement.current, i = no(n, "pointerdown", (v) => {
      const { drag: S, dragListener: l = !0 } = this.getProps(), h = v.target, g = h !== n && I_(h);
      S && l && !g && this.start(v);
    });
    let o;
    const a = () => {
      const { dragConstraints: v } = this.getProps();
      Wr(v) && v.current && (this.constraints = this.resolveRefConstraints(), o || (o = rA(n, v.current, () => this.scalePositionWithinConstraints())));
    }, { projection: c } = this.visualElement, d = c.addEventListener("measure", a);
    c && !c.layout && (c.root && c.root.updateScroll(), c.updateLayout()), Ae.read(a);
    const f = uo(window, "resize", () => this.scalePositionWithinConstraints()), y = c.addEventListener("didUpdate", (({ delta: v, hasLayoutChanged: S }) => {
      this.isDragging && S && (Zt((l) => {
        const h = this.getAxisMotionValue(l);
        h && (this.originPoint[l] += v[l].translate, h.set(h.get() + v[l].translate));
      }), this.visualElement.render());
    }));
    return () => {
      f(), i(), d(), y && y(), o && o();
    };
  }
  getProps() {
    const n = this.visualElement.getProps(), { drag: i = !1, dragDirectionLock: o = !1, dragPropagation: a = !1, dragConstraints: c = !1, dragElastic: d = bc, dragMomentum: f = !0 } = n;
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
function py(e) {
  let n = !0;
  return () => {
    if (n) {
      n = !1;
      return;
    }
    e();
  };
}
function rA(e, n, i) {
  const o = wm(e, py(i)), a = wm(n, py(i));
  return () => {
    o(), a();
  };
}
function Vs(e, n, i) {
  return (n === !0 || n === e) && (i === null || i === e);
}
function iA(e, n = 10) {
  let i = null;
  return Math.abs(e.y) > n ? i = "y" : Math.abs(e.x) > n && (i = "x"), i;
}
class oA extends Wn {
  constructor(n) {
    super(n), this.removeGroupControls = Mt, this.removeListeners = Mt, this.controls = new nA(n);
  }
  mount() {
    const { dragControls: n } = this.node.getProps();
    n && (this.removeGroupControls = n.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || Mt;
  }
  update() {
    const { dragControls: n } = this.node.getProps(), { dragControls: i } = this.node.prevProps || {};
    n !== i && (this.removeGroupControls(), n && (this.removeGroupControls = n.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const Gu = (e) => (n, i) => {
  e && Ae.update(() => e(n, i), !1, !0);
};
class sA extends Wn {
  constructor() {
    super(...arguments), this.removePointerDownListener = Mt;
  }
  onPointerDown(n) {
    this.session = new Mv(n, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: bv(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: n, onPanStart: i, onPan: o, onPanEnd: a } = this.node.getProps();
    return {
      onSessionStart: Gu(n),
      onStart: Gu(i),
      onMove: Gu(o),
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
let Ku = !1;
class aA extends C.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: n, layoutGroup: i, switchLayoutGroup: o, layoutId: a } = this.props, { projection: c } = n;
    c && (i.group && i.group.add(c), o && o.register && a && o.register(c), Ku && c.root.didUpdate(), c.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), c.setOptions({
      ...c.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), ea.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(n) {
    const { layoutDependency: i, visualElement: o, drag: a, isPresent: c } = this.props, { projection: d } = o;
    return d && (d.isPresent = c, n.layoutDependency !== i && d.setOptions({
      ...d.options,
      layoutDependency: i
    }), Ku = !0, a || n.layoutDependency !== i || i === void 0 || n.isPresent !== c ? d.willUpdate() : this.safeToRemove(), n.isPresent !== c && (c ? d.promote() : d.relegate() || Ae.postRender(() => {
      const f = d.getStack();
      (!f || !f.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: n, layoutAnchor: i } = this.props, { projection: o } = n;
    o && (o.options.layoutAnchor = i, o.root.didUpdate(), yd.postRender(() => {
      !o.currentAnimation && o.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: n, layoutGroup: i, switchLayoutGroup: o } = this.props, { projection: a } = n;
    Ku = !0, a && (a.scheduleCheckAfterUnmount(), i && i.group && i.group.remove(a), o && o.deregister && o.deregister(a));
  }
  safeToRemove() {
    const { safeToRemove: n } = this.props;
    n && n();
  }
  render() {
    return null;
  }
}
function Nv(e) {
  const [n, i] = wv(), o = C.useContext(Zc);
  return w.jsx(aA, { ...e, layoutGroup: o, switchLayoutGroup: C.useContext(Ev), isPresent: n, safeToRemove: i });
}
const lA = {
  pan: {
    Feature: sA
  },
  drag: {
    Feature: oA,
    ProjectionNode: Sv,
    MeasureLayout: Nv
  }
};
function hy(e, n, i) {
  const { props: o } = e;
  e.animationState && o.whileHover && e.animationState.setActive("whileHover", i === "Start");
  const a = "onHover" + i, c = o[a];
  c && Ae.postRender(() => c(n, xo(n)));
}
class uA extends Wn {
  mount() {
    const { current: n } = this.node;
    n && (this.unmount = R_(n, (i, o) => (hy(this.node, o, "Start"), (a) => hy(this.node, a, "End"))));
  }
  unmount() {
  }
}
class cA extends Wn {
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
    this.unmount = vo(uo(this.node.current, "focus", () => this.onFocus()), uo(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function my(e, n, i) {
  const { props: o } = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
    return;
  e.animationState && o.whileTap && e.animationState.setActive("whileTap", i === "Start");
  const a = "onTap" + (i === "End" ? "" : i), c = o[a];
  c && Ae.postRender(() => c(n, xo(n)));
}
class dA extends Wn {
  mount() {
    const { current: n } = this.node;
    if (!n)
      return;
    const { globalTapTarget: i, propagate: o } = this.node.props;
    this.unmount = O_(n, (a, c) => (my(this.node, c, "Start"), (d, { success: f }) => my(this.node, d, f ? "End" : "Cancel")), {
      useGlobalTarget: i,
      stopPropagation: (o == null ? void 0 : o.tap) === !1
    });
  }
  unmount() {
  }
}
const Mc = /* @__PURE__ */ new WeakMap(), Yu = /* @__PURE__ */ new WeakMap(), fA = (e) => {
  const n = Mc.get(e.target);
  n && n(e);
}, pA = (e) => {
  e.forEach(fA);
};
function hA({ root: e, ...n }) {
  const i = e || document;
  Yu.has(i) || Yu.set(i, {});
  const o = Yu.get(i), a = JSON.stringify(n);
  return o[a] || (o[a] = new IntersectionObserver(pA, { root: e, ...n })), o[a];
}
function mA(e, n, i) {
  const o = hA(n);
  return Mc.set(e, i), o.observe(e), () => {
    Mc.delete(e), o.unobserve(e);
  };
}
const yA = {
  some: 0,
  all: 1
};
class gA extends Wn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var y;
    (y = this.stopObserver) == null || y.call(this);
    const { viewport: n = {} } = this.node.getProps(), { root: i, margin: o, amount: a = "some", once: c } = n, d = {
      root: i ? i.current : void 0,
      rootMargin: o,
      threshold: typeof a == "number" ? a : yA[a]
    }, f = (v) => {
      const { isIntersecting: S } = v;
      if (this.isInView === S || (this.isInView = S, c && !S && this.hasEnteredView))
        return;
      S && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", S);
      const { onViewportEnter: l, onViewportLeave: h } = this.node.getProps(), g = S ? l : h;
      g && g(v);
    };
    this.stopObserver = mA(this.node.current, d, f);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: n, prevProps: i } = this.node;
    ["amount", "margin", "root"].some(vA(n, i)) && this.startObserver();
  }
  unmount() {
    var n;
    (n = this.stopObserver) == null || n.call(this), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function vA({ viewport: e = {} }, { viewport: n = {} } = {}) {
  return (i) => e[i] !== n[i];
}
const SA = {
  inView: {
    Feature: gA
  },
  tap: {
    Feature: dA
  },
  focus: {
    Feature: cA
  },
  hover: {
    Feature: uA
  }
}, wA = {
  layout: {
    ProjectionNode: Sv,
    MeasureLayout: Nv
  }
}, xA = {
  ...Hk,
  ...SA,
  ...lA,
  ...wA
}, _A = /* @__PURE__ */ Vk(xA, Bk), tn = _A;
function TA(e) {
  const i = String(e || "").toLowerCase().split(".");
  if (i.length !== 4 || i.some((a) => !/^\d+$/.test(a))) return !1;
  const o = i.map(Number);
  return o.some((a) => a < 0 || a > 255) ? !1 : o[0] === 10 || o[0] === 172 && o[1] >= 16 && o[1] <= 31 || o[0] === 192 && o[1] === 168;
}
function Dv(e) {
  const n = String(e || "").toLowerCase();
  return n === "127.0.0.1" || n === "localhost" || n === "::1" || n === "[::1]";
}
function yy(e) {
  return Dv(e) || TA(e);
}
function kA(e) {
  return !e || Dv(e) ? "127.0.0.1" : e;
}
const AA = (() => {
  var S, l, h, g;
  const e = globalThis.window || globalThis, n = globalThis.document || {}, i = e.location || {}, o = String(e.SYNAPSE_DATA_API_PORT || ((l = (S = n.body) == null ? void 0 : S.dataset) == null ? void 0 : l.dataApiPort) || "3001").trim(), { protocol: a = "file:", hostname: c = "127.0.0.1", port: d = "" } = i, f = `http://${kA(c)}:${o || "3001"}`, y = String(e.SYNAPSE_DATA_API_BASE || ((g = (h = n.body) == null ? void 0 : h.dataset) == null ? void 0 : g.dataApiBase) || "").replace(/\/+$/, ""), v = `${a}//${i.host || (d ? `${c}:${d}` : c)}`.replace(/\/+$/, "");
  return y && !(yy(c) && d !== o && y === v) ? y : a === "file:" || yy(c) && d !== o ? f : `${a}//${i.host || c}`;
})(), CA = new Ky(AA), Qu = Number((globalThis.window || globalThis).SYNAPSE_DATA_API_TIMEOUT_MS || 6e3), EA = Number.isFinite(Qu) && Qu > 0 ? Qu : 6e3;
function PA(e, n) {
  typeof window > "u" || console.warn(e, n);
}
async function bA(e) {
  var o, a;
  const i = (((a = (o = e.headers) == null ? void 0 : o.get) == null ? void 0 : a.call(o, "content-type")) || "").includes("application/json") ? await e.json() : {};
  if (!e.ok || (i == null ? void 0 : i.ok) === !1)
    throw new Error((i == null ? void 0 : i.error) || `Synapse data API returned HTTP ${e.status}`);
  return i;
}
async function MA(e, n = {}) {
  const i = await CA.fetch(e, {
    timeoutMs: EA,
    ...n
  });
  return bA(i);
}
async function RA(e) {
  try {
    return (await MA("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e || {})
    })).item || null;
  } catch (n) {
    return PA("Synapse data API focus-session save skipped:", n), null;
  }
}
class NA {
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
const jv = new NA();
function Cd(e, n) {
  return jv.readJSON(e, n);
}
function Ed(e, n) {
  return jv.writeJSON(e, n);
}
const Iv = "synapse.focusRoom.sessions.v1", Fv = "synapse.focusRoom.draft.v1", Ov = "synapse.focusRoom.active-session.v1", Rc = 40, gy = Object.freeze([
  "idle",
  "running",
  "paused",
  "completed",
  "break",
  "restoring"
]), DA = Object.freeze({
  studying: "running",
  running: "running",
  idle: "idle",
  paused: "paused",
  completed: "completed",
  break: "break",
  restoring: "restoring"
});
let Nc = [];
const ar = (e) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(e)}`, co = [
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
    streamUrl: ar("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
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
    streamUrl: ar("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: ar("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: ar("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: ar("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: ar("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: ar("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, fo = [
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
], yn = [
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
  },
  {
    id: "innook-cabin-twilight",
    name: "木屋黄昏",
    kicker: "暖光 · 放松",
    description: "Warm cabin light and an unhurried focus block.",
    image: "./assets/focus-room/innook/cabin-twilight.jpg",
    ambientSound: "Nature",
    musicType: "Piano",
    galleryOnly: !0
  },
  {
    id: "innook-last-room",
    name: "末世客厅",
    kicker: "废土 · 微光",
    description: "A quiet room with distant, low-lit calm.",
    image: "./assets/focus-room/innook/last-room.jpg",
    ambientSound: "White Noise",
    musicType: "Minimal",
    galleryOnly: !0
  },
  {
    id: "innook-garden-cafe",
    name: "绿植咖啡",
    kicker: "绿植 · 咖啡",
    description: "Soft café ambience among abundant greenery.",
    image: "./assets/focus-room/innook/garden-cafe.jpg",
    ambientSound: "Cafe Rain",
    musicType: "Lo-fi",
    galleryOnly: !0
  },
  {
    id: "innook-sunset-classroom",
    name: "晚霞教室",
    kicker: "教室 · 晚霞",
    description: "An empty classroom in the fading evening light.",
    image: "./assets/focus-room/innook/sunset-classroom.jpg",
    ambientSound: "Nature",
    musicType: "Piano",
    galleryOnly: !0
  },
  {
    id: "innook-tokyo-night",
    name: "东京夜景",
    kicker: "城市 · 夜色",
    description: "A city-night view for steady late study.",
    image: "./assets/focus-room/innook/tokyo-night-view.jpg",
    ambientSound: "White Noise",
    musicType: "Deep Focus",
    galleryOnly: !0
  },
  {
    id: "innook-snow-window-cabin",
    name: "雪窗木屋",
    kicker: "雪夜 · 木屋",
    description: "Snow beyond the window, warmth at the desk.",
    image: "./assets/focus-room/innook/snow-window-cabin.jpg",
    ambientSound: "Wind",
    musicType: "Minimal",
    galleryOnly: !0
  },
  {
    id: "innook-bamboo-cabin",
    name: "竹林小屋",
    kicker: "竹影 · 安静",
    description: "A bamboo retreat made for quiet concentration.",
    image: "./assets/focus-room/innook/bamboo-cabin.jpg",
    ambientSound: "Nature",
    musicType: "Deep Focus",
    galleryOnly: !0
  }
], jA = [
  {
    ...yn[0],
    name: "清晨窗边",
    kicker: "晨光 · 植物",
    description: "A bright morning desk beside a leafy window.",
    image: "./assets/focus-room/innook/morning-window.jpg"
  },
  ...yn.filter((e) => e.galleryOnly)
], Lv = [25, 45, 50, 90];
function IA(e = "") {
  const n = String(e || "");
  return co.find((i) => i.label === n) || co[0];
}
function FA(e = "") {
  const n = String(e || "");
  return fo.find((i) => i.label === n) || fo[0];
}
function Ma(e = {}) {
  const n = IA(e == null ? void 0 : e.musicType), i = FA(e == null ? void 0 : e.ambientSound);
  return {
    musicTrack: n,
    ambientSound: i,
    ambientLayers: i.layers.map((o) => ({
      ...o,
      volumeBias: Vn(o.volumeBias, 1)
    }))
  };
}
function OA(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Vv(e) {
  return String(e || "").trim();
}
function LA({ material: e, goal: n, durationMinutes: i }) {
  var S;
  const o = Math.max(10, Number(i) || 25), a = (S = e == null ? void 0 : e.studyHeadings) != null && S.length ? e.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], c = String(n || "").trim() || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`, d = Math.max(1, Math.floor(o * 0.2)), f = Math.max(1, Math.floor(o * 0.4)), y = Math.max(1, Math.floor(o * 0.2)), v = Math.max(1, o - d - f - y);
  return [
    { minutes: d, task: `Set the goal: ${c}` },
    { minutes: f, task: `Review ${a[0] || "the core ideas"}` },
    { minutes: y, task: `Practice with ${a[1] || a[0] || "the generated examples"}` },
    { minutes: v, task: "Summarize mistakes and choose the next study step" }
  ];
}
function Bv() {
  return Cd(Fv, null);
}
function VA(e) {
  return Ed(Fv, e || null);
}
function zv(e) {
  if (!e || typeof e != "object")
    return { materials: {} };
  const n = OA(e.materials);
  return {
    ...e,
    materials: { ...n }
  };
}
function ei(e, n = "idle") {
  const i = DA[String(e || "").trim().toLowerCase()];
  return i && gy.includes(i) ? i : gy.includes(n) ? n : "idle";
}
function Pd(e) {
  return ei(e) === "running" ? "studying" : ei(e);
}
function Uv(e = {}, n = {}) {
  const i = e && typeof e == "object" ? e : {}, o = n && typeof n == "object" ? n : {}, a = Object.prototype.hasOwnProperty.call(i, "timerStatus"), c = Object.prototype.hasOwnProperty.call(i, "timerState") || Object.prototype.hasOwnProperty.call(i, "timerPhase"), d = ei(
    c ? i.timerState || i.timerPhase : a ? i.timerStatus : i.status || o.timerState,
    ei(o.timerState || o.timerPhase || o.timerStatus)
  ), f = i.timerMode === "countup" || o.timerMode === "countup" && !Object.prototype.hasOwnProperty.call(i, "timerMode") ? "countup" : "countdown", v = Object.fromEntries(["timerAnchorAtMs", "timerPausedAtMs", "timerUpdatedAtMs", "timerRestoredAtMs"].map((l) => {
    const h = Object.prototype.hasOwnProperty.call(i, l) ? i[l] : o[l], g = Number(h);
    return [l, Number.isFinite(g) && g > 0 ? g : null];
  })), S = Math.max(0, Vn(
    Object.prototype.hasOwnProperty.call(i, "elapsedSeconds") ? i.elapsedSeconds : o.elapsedSeconds,
    0
  ));
  return {
    ...o,
    ...i,
    timerState: d,
    timerPhase: d,
    status: d,
    timerStatus: Pd(d),
    timerMode: f,
    elapsedSeconds: S,
    ...v
  };
}
function $v() {
  return zv(Cd(Ov, null));
}
function BA(e) {
  return Ed(Ov, zv(e));
}
function zA(e) {
  const n = Vv(e);
  if (!n) return null;
  const o = $v().materials[n];
  return o && typeof o == "object" ? Uv(o) : null;
}
function bd(e, n) {
  const i = Vv(e);
  if (!i) return !1;
  const o = $v();
  return n && typeof n == "object" ? o.materials[i] = {
    ...Uv(n, o.materials[i]),
    materialId: i,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  } : delete o.materials[i], BA(o);
}
function Hv(e) {
  return bd(e, null);
}
function Dc() {
  const e = Cd(Iv, []), n = Array.isArray(e) ? e : [], i = /* @__PURE__ */ new Set();
  return [...Nc, ...n].filter((o) => {
    const a = String((o == null ? void 0 : o.sessionId) || "");
    return !a || i.has(a) ? !1 : (i.add(a), !0);
  }).slice(0, Rc);
}
function Vn(e, n) {
  const i = Number(e);
  return Number.isFinite(i) ? i : n;
}
function UA(e = {}) {
  const n = (/* @__PURE__ */ new Date()).toISOString(), o = { ...{
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
  }, persisted: !0 }, a = Dc().filter((y) => y.sessionId !== o.sessionId), c = [o, ...a.map((y) => ({ ...y, persisted: !0 }))].slice(0, Rc), d = Ed(Iv, c), f = { ...o, persisted: d };
  return RA(f).catch((y) => {
    console.warn("Synapse data API focus-session background save failed:", y);
  }), d ? Nc = [] : Nc = [f, ...a].slice(0, Rc), f;
}
function Md(e) {
  const n = Math.max(0, Vn(e || 0, 0)), i = Math.floor(n / 3600), o = Math.floor(n % 3600 / 60);
  return i ? `${i}h ${o}m` : `${o}m`;
}
var Hy;
const jc = ((Hy = yn[0]) == null ? void 0 : Hy.id) || "morning-window", Qr = Lv[0] || 25, Wv = 10, ga = 180, $A = 0, HA = 100, WA = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"], Ic = new Set(WA), ta = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function GA(e, n, i, o) {
  const a = Number(e);
  return Number.isFinite(a) ? Math.min(o, Math.max(i, a)) : n;
}
function Xr(e, n, i, o) {
  return Math.round(GA(e, n, i, o));
}
function pr(e, n = 50) {
  return Xr(e, n, $A, HA);
}
function po(e, n = Qr) {
  return Xr(e, n, Wv, ga);
}
function Rd(e) {
  return yn.find((n) => n.id === e) || null;
}
function Hn(e = jc) {
  return Rd(e) || yn[0] || {
    id: jc,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function Gv(e) {
  return Array.isArray(e) ? e.map((n) => ({
    minutes: Xr(n == null ? void 0 : n.minutes, 5, 1, ga),
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
function Kv(e) {
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
function Fc(e, n, i) {
  return e ? LA({
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
function vy(e) {
  const n = (e == null ? void 0 : e.flashcards) || [];
  return Array.isArray(n) ? n.slice(0, 24) : [];
}
function KA(e, n) {
  return String((e == null ? void 0 : e.id) || (e == null ? void 0 : e.front) || (e == null ? void 0 : e.term) || n);
}
function YA(e) {
  var n;
  return Array.isArray(e == null ? void 0 : e.questions) ? e.questions : Array.isArray((n = e == null ? void 0 : e.quiz) == null ? void 0 : n.questions) ? e.quiz.questions : [];
}
function Oc(e) {
  return (Array.isArray(e == null ? void 0 : e.quizzes) ? e.quizzes : []).flatMap((i) => YA(i).map((o) => {
    var a;
    return {
      ...o,
      quizTitle: (i == null ? void 0 : i.title) || ((a = i == null ? void 0 : i.quiz) == null ? void 0 : a.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function QA(e, n) {
  return (e == null ? void 0 : e.question) || (e == null ? void 0 : e.prompt) || (e == null ? void 0 : e.stem) || `Question ${n + 1}`;
}
function Nd(e) {
  return String((e == null ? void 0 : e.type) || "").toLowerCase();
}
function XA(e) {
  return String((e == null ? void 0 : e.label) || (e == null ? void 0 : e.text) || e).trim();
}
function va(e) {
  const n = (e == null ? void 0 : e.choices) || (e == null ? void 0 : e.options) || (e == null ? void 0 : e.answers);
  return Array.isArray(n) && n.length ? n.map(XA).filter(Boolean) : Nd(e) === "true_false" ? ["True", "False"] : [];
}
function Lc(e) {
  const n = (e == null ? void 0 : e.correctOptionIndexes) || (e == null ? void 0 : e.correct_option_indexes) || (e == null ? void 0 : e.correctIndexes);
  return Array.isArray(n) ? n.map((i) => Number(i)).filter(Number.isInteger) : [];
}
function ZA(e, n) {
  const i = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [], o = Array.isArray(n) ? [...n].map(Number).filter(Number.isInteger).sort((a, c) => a - c) : [];
  return i.length === o.length && i.every((a, c) => a === o[c]);
}
function hr(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Sa(e, n) {
  if (Number.isInteger(n)) return n;
  const i = Number(n);
  if (typeof n != "string" && Number.isInteger(i)) return i;
  const o = va(e), a = hr(n);
  return o.findIndex((c) => hr(c) === a);
}
function Yv(e, n) {
  if (typeof n == "boolean") return n;
  if (n === 0) return !0;
  if (n === 1) return !1;
  const i = va(e), o = hr(n);
  return o === "true" ? !0 : o === "false" ? !1 : hr(i[0]) === o ? !0 : hr(i[1]) === o ? !1 : null;
}
function JA(e, n, i) {
  const o = Nd(e);
  if (o === "multiple_choice") {
    const a = Sa(e, n);
    if (!Number.isInteger(a) || a < 0) return [];
    const c = Array.isArray(i) ? [...i] : [];
    return c.includes(a) ? c.filter((d) => d !== a) : [...c, a].sort((d, f) => d - f);
  }
  if (o === "single_choice") {
    const a = Sa(e, n);
    return Number.isInteger(a) && a >= 0 ? a : "";
  }
  if (o === "true_false") {
    const a = Yv(e, n);
    return a === null ? "" : a;
  }
  return String(n || "");
}
function Qv(e) {
  const n = (e == null ? void 0 : e.correctAnswer) ?? (e == null ? void 0 : e.correct_answer) ?? (e == null ? void 0 : e.answer) ?? (e == null ? void 0 : e.correct), i = Lc(e);
  if (i.length) {
    const o = va(e);
    return i.map((a) => o[a] || "").filter(Boolean).join(", ");
  }
  if (typeof (e == null ? void 0 : e.correctBoolean) == "boolean" || typeof (e == null ? void 0 : e.correct_boolean) == "boolean") {
    const o = va(e);
    return (typeof e.correctBoolean == "boolean" ? e.correctBoolean : e.correct_boolean) ? o[0] || "True" : o[1] || "False";
  }
  return e != null && e.expectedAnswer || e != null && e.expected_answer ? String(e.expectedAnswer || e.expected_answer || "").trim() : Array.isArray(n) ? n.map((o) => String(o)).join(", ") : String(n || "").trim();
}
function qA(e, n) {
  const i = Nd(e);
  if (i === "single_choice") {
    const a = Lc(e)[0], c = Sa(e, n);
    return Number.isInteger(a) ? c === a : null;
  }
  if (i === "multiple_choice") {
    const a = Lc(e), c = Array.isArray(n) ? n : [Sa(e, n)].filter(Number.isInteger);
    return a.length ? ZA(c, a) : null;
  }
  if (i === "true_false") {
    const a = typeof (e == null ? void 0 : e.correctBoolean) == "boolean" ? e.correctBoolean : e == null ? void 0 : e.correct_boolean, c = Yv(e, n);
    return typeof a == "boolean" && c !== null ? c === a : null;
  }
  const o = Qv(e);
  return o ? hr(n) === hr(o) : null;
}
function Xv(e, n, i) {
  var f;
  const o = String(e || "").trim(), a = String((n == null ? void 0 : n.summaryText) || (n == null ? void 0 : n.aiSummary) || "").slice(0, 420), c = ((f = n == null ? void 0 : n.studyHeadings) == null ? void 0 : f[0]) || (n == null ? void 0 : n.materialTitle) || "this material", d = i || `Study ${(n == null ? void 0 : n.materialTitle) || "this material"}`;
  return o ? [
    `For ${c}: ${a || "use the selected material as your main source."}`,
    `Your current goal is: ${d}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function eC() {
  return /* @__PURE__ */ w.jsx("svg", { className: "liquid-glass-filter-defs", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ w.jsx("defs", { children: /* @__PURE__ */ w.jsxs("filter", { id: "liquid-glass-displacement", x: "-12%", y: "-12%", width: "124%", height: "124%", colorInterpolationFilters: "sRGB", children: [
    /* @__PURE__ */ w.jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.024", numOctaves: "2", seed: "17", result: "liquid-noise" }),
    /* @__PURE__ */ w.jsx("feDisplacementMap", { in: "SourceGraphic", in2: "liquid-noise", scale: "7", xChannelSelector: "R", yChannelSelector: "B", result: "refracted-surface" }),
    /* @__PURE__ */ w.jsx("feColorMatrix", { in: "refracted-surface", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.04 0", result: "edge-alpha" }),
    /* @__PURE__ */ w.jsx("feGaussianBlur", { in: "edge-alpha", stdDeviation: "0.25", result: "soft-edge" }),
    /* @__PURE__ */ w.jsx("feBlend", { in: "soft-edge", in2: "refracted-surface", mode: "screen" })
  ] }) }) });
}
function tC({ scene: e }) {
  const [n, i] = C.useState(!1), [o, a] = C.useState(!1);
  return C.useEffect(() => {
    i(!1), a(!1);
  }, [e == null ? void 0 : e.id]), /* @__PURE__ */ w.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ w.jsx(eC, {}),
    /* @__PURE__ */ w.jsx(Pa, { mode: "wait", children: /* @__PURE__ */ w.jsxs(
      tn.div,
      {
        className: "focus-background",
        style: { backgroundImage: o ? "none" : void 0 },
        initial: { opacity: 0, scale: 1.035 },
        animate: { opacity: 1, scale: 1.02 },
        exit: { opacity: 0, scale: 1.015 },
        transition: { duration: 0.8, ease: "easeOut" },
        children: [
          e != null && e.image ? /* @__PURE__ */ w.jsx(
            "img",
            {
              className: `focus-background-media focus-background-poster ${n ? "is-ready" : ""}`.trim(),
              src: e.image,
              alt: "",
              onLoad: () => i(!0),
              onError: () => a(!0)
            }
          ) : null,
          e != null && e.video ? /* @__PURE__ */ w.jsx(
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
    /* @__PURE__ */ w.jsx("div", { className: "focus-overlay" }),
    /* @__PURE__ */ w.jsx("div", { className: "focus-vignette" })
  ] });
}
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nC = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), rC = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (n, i, o) => o ? o.toUpperCase() : i.toLowerCase()
), Sy = (e) => {
  const n = rC(e);
  return n.charAt(0).toUpperCase() + n.slice(1);
}, Zv = (...e) => e.filter((n, i, o) => !!n && n.trim() !== "" && o.indexOf(n) === i).join(" ").trim(), iC = (e) => {
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
var oC = {
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
const sC = C.forwardRef(
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
      ...oC,
      width: n,
      height: n,
      stroke: e,
      strokeWidth: o ? Number(i) * 24 / Number(n) : i,
      className: Zv("lucide", a),
      ...!c && !iC(f) && { "aria-hidden": "true" },
      ...f
    },
    [
      ...d.map(([v, S]) => C.createElement(v, S)),
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
const Me = (e, n) => {
  const i = C.forwardRef(
    ({ className: o, ...a }, c) => C.createElement(sC, {
      ref: c,
      iconNode: n,
      className: Zv(
        `lucide-${nC(Sy(e))}`,
        `lucide-${e}`,
        o
      ),
      ...a
    })
  );
  return i.displayName = Sy(e), i;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const aC = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
], lC = Me("arrow-left", aC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uC = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
], Vc = Me("arrow-right", uC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cC = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
], dC = Me("book-open", cC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fC = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], pC = Me("check", fC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hC = [
  ["path", { d: "M10 2v2", key: "7u0qdc" }],
  ["path", { d: "M14 2v2", key: "6buw04" }],
  [
    "path",
    {
      d: "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",
      key: "pwadti"
    }
  ],
  ["path", { d: "M6 2v2", key: "colzsn" }]
], mC = Me("coffee", hC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yC = [
  ["rect", { width: "12", height: "12", x: "2", y: "10", rx: "2", ry: "2", key: "6agr2n" }],
  [
    "path",
    { d: "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6", key: "1o487t" }
  ],
  ["path", { d: "M6 18h.01", key: "uhywen" }],
  ["path", { d: "M10 14h.01", key: "ssrbsk" }],
  ["path", { d: "M15 6h.01", key: "cblpky" }],
  ["path", { d: "M18 9h.01", key: "2061c0" }]
], gC = Me("dices", yC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vC = [
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
], SC = Me("door-open", vC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wC = [
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
], wa = Me("footprints", wC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xC = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
], Bc = Me("history", xC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _C = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
], TC = Me("minimize-2", _C);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kC = [
  ["circle", { cx: "8", cy: "18", r: "4", key: "1fc0mg" }],
  ["path", { d: "M12 18V2l7 4", key: "g04rme" }]
], AC = Me("music-2", kC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CC = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], zc = Me("pause", CC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const EC = [
  [
    "path",
    {
      d: "M18.5 8c-1.4 0-2.6-.8-3.2-2A6.87 6.87 0 0 0 2 9v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8.5C22 9.6 20.4 8 18.5 8",
      key: "lag0yf"
    }
  ],
  ["path", { d: "M2 14h20", key: "myj16y" }],
  ["path", { d: "M6 14v4", key: "9ng0ue" }],
  ["path", { d: "M10 14v4", key: "1v8uk5" }],
  ["path", { d: "M14 14v4", key: "1tqops" }],
  ["path", { d: "M18 14v4", key: "18uqwm" }]
], PC = Me("piano", EC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const bC = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], Jv = Me("play", bC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MC = [
  ["path", { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9", key: "1vaf9d" }],
  ["path", { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", key: "u1ii0m" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", key: "1j5fej" }],
  ["path", { d: "M19.1 4.9C23 8.8 23 15.1 19.1 19", key: "10b0cb" }]
], RC = Me("radio", MC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const NC = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], qv = Me("rotate-ccw", NC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const DC = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
], jC = Me("save", DC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const IC = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
], ho = Me("settings-2", IC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FC = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], e0 = Me("skip-forward", FC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const OC = [
  ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
  ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
  ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
  ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
  ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
  ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
  ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
  ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
  ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }]
], LC = Me("sliders-horizontal", OC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const VC = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
], BC = Me("target", VC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zC = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
], xa = Me("users", zC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UC = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], Dd = Me("volume-2", UC);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $C = [
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
], t0 = Me("waves", $C);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const HC = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], WC = Me("x", HC);
function GC({ onStart: e, onWorkspace: n, onHistory: i }) {
  return /* @__PURE__ */ w.jsxs("div", { className: "focus-landing-shell", children: [
    /* @__PURE__ */ w.jsxs("header", { className: "focus-landing-header", children: [
      /* @__PURE__ */ w.jsxs("button", { type: "button", className: "focus-landing-brand", onClick: n, "aria-label": "Return to Synapse workspace", children: [
        /* @__PURE__ */ w.jsx("span", { className: "focus-wordmark-mark", children: "S" }),
        /* @__PURE__ */ w.jsxs("span", { className: "focus-landing-brand-copy", children: [
          /* @__PURE__ */ w.jsx("strong", { children: "synapse" }),
          /* @__PURE__ */ w.jsx("small", { children: "Focus Room" })
        ] })
      ] }),
      /* @__PURE__ */ w.jsxs("nav", { className: "focus-landing-actions", "aria-label": "Focus Room navigation", children: [
        /* @__PURE__ */ w.jsx("button", { type: "button", className: "focus-landing-icon", onClick: i, "aria-label": "Open Focus Trail", title: "Open Focus Trail", children: /* @__PURE__ */ w.jsx(Bc, { size: 16, "aria-hidden": "true" }) }),
        /* @__PURE__ */ w.jsxs("button", { type: "button", className: "focus-landing-language", "aria-label": "Current language", children: [
          "中文 ",
          /* @__PURE__ */ w.jsx("span", { "aria-hidden": "true", children: "⌄" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ w.jsxs("section", { className: "focus-landing-hero", "aria-labelledby": "focus-landing-title", children: [
      /* @__PURE__ */ w.jsx("p", { className: "focus-landing-eyebrow", children: "FOCUS · LEARN · GROW" }),
      /* @__PURE__ */ w.jsx("h1", { id: "focus-landing-title", children: "开启你的专注空间" }),
      /* @__PURE__ */ w.jsx("p", { className: "focus-landing-subtitle", children: "选择场景、音乐与节奏，把最清醒的时间留给真正重要的学习。" }),
      /* @__PURE__ */ w.jsxs("button", { type: "button", className: "focus-landing-enter", onClick: e, children: [
        /* @__PURE__ */ w.jsx("span", { children: "开始学习" }),
        /* @__PURE__ */ w.jsx(Vc, { size: 17, "aria-hidden": "true" })
      ] }),
      /* @__PURE__ */ w.jsxs("div", { className: "focus-landing-secondary", "aria-label": "Synapse Focus Room shortcuts", children: [
        /* @__PURE__ */ w.jsxs("span", { children: [
          /* @__PURE__ */ w.jsx(dC, { size: 13, "aria-hidden": "true" }),
          " Synapse Study Space"
        ] }),
        /* @__PURE__ */ w.jsxs("button", { type: "button", onClick: n, children: [
          /* @__PURE__ */ w.jsx(ho, { size: 13, "aria-hidden": "true" }),
          " Workspace"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ w.jsxs("footer", { className: "focus-landing-footer liquid-glass", children: [
      /* @__PURE__ */ w.jsxs("div", { className: "focus-landing-footer-grid", children: [
        /* @__PURE__ */ w.jsxs("div", { className: "focus-landing-footer-brand", children: [
          /* @__PURE__ */ w.jsxs("div", { className: "focus-landing-footer-lockup", children: [
            /* @__PURE__ */ w.jsx("span", { className: "focus-wordmark-mark", children: "S" }),
            /* @__PURE__ */ w.jsxs("span", { children: [
              /* @__PURE__ */ w.jsx("strong", { children: "synapse" }),
              /* @__PURE__ */ w.jsx("small", { children: "AI Study Assistant" })
            ] })
          ] }),
          /* @__PURE__ */ w.jsx("p", { children: "一个专注学习与成长的空间，让每一次学习都更有深度。" })
        ] }),
        /* @__PURE__ */ w.jsxs("div", { className: "focus-landing-footer-resource", children: [
          /* @__PURE__ */ w.jsx("strong", { children: "学习资源" }),
          /* @__PURE__ */ w.jsx("p", { children: "生成笔记、AI Tutor 与学习工具都会在你的 Focus Room 中保留。" })
        ] }),
        /* @__PURE__ */ w.jsxs("div", { className: "focus-landing-footer-actions", children: [
          /* @__PURE__ */ w.jsx("button", { type: "button", className: "focus-landing-icon", onClick: i, "aria-label": "Open Focus Trail", title: "Open Focus Trail", children: /* @__PURE__ */ w.jsx(Bc, { size: 17, "aria-hidden": "true" }) }),
          /* @__PURE__ */ w.jsx("button", { type: "button", className: "focus-landing-icon", onClick: n, "aria-label": "Open Synapse workspace", title: "Open Synapse workspace", children: /* @__PURE__ */ w.jsx(ho, { size: 17, "aria-hidden": "true" }) }),
          /* @__PURE__ */ w.jsx("button", { type: "button", className: "focus-landing-icon", onClick: e, "aria-label": "Start studying", title: "Start studying", children: /* @__PURE__ */ w.jsx(Vc, { size: 17, "aria-hidden": "true" }) })
        ] })
      ] }),
      /* @__PURE__ */ w.jsx("div", { className: "focus-landing-footer-meta", children: "Synapse Focus Room · Your materials, your pace, your space" })
    ] })
  ] });
}
const wy = (e) => {
  let n;
  const i = /* @__PURE__ */ new Set(), o = (v, S) => {
    const l = typeof v == "function" ? v(n) : v;
    if (!Object.is(l, n)) {
      const h = n;
      n = S ?? (typeof l != "object" || l === null) ? l : Object.assign({}, n, l), i.forEach((g) => g(n, h));
    }
  }, a = () => n, f = { setState: o, getState: a, getInitialState: () => y, subscribe: (v) => (i.add(v), () => i.delete(v)) }, y = n = e(o, a, f);
  return f;
}, KC = ((e) => e ? wy(e) : wy), YC = (e) => e;
function QC(e, n = YC) {
  const i = mn.useSyncExternalStore(
    e.subscribe,
    mn.useCallback(() => n(e.getState()), [e, n]),
    mn.useCallback(() => n(e.getInitialState()), [e, n])
  );
  return mn.useDebugValue(i), i;
}
const xy = (e) => {
  const n = KC(e), i = (o) => QC(n, o);
  return Object.assign(i, n), i;
}, XC = ((e) => e ? xy(e) : xy), jd = Object.freeze({
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
function ZC() {
  return yn[0] || Hn(jc);
}
function JC(e) {
  const n = String(e || "");
  if (!n) return null;
  const o = Kv(Bv()).materials[n];
  return o && typeof o == "object" ? o : null;
}
function fn(e) {
  var o;
  const n = String(e.selectedMaterialId || ((o = e.selectedMaterial) == null ? void 0 : o.materialId) || "");
  if (!n) return;
  const i = Kv(Bv());
  i.materials[n] = {
    materialId: n,
    selectedScene: e.selectedScene,
    musicType: e.musicType,
    ambientSound: e.ambientSound,
    musicVolume: pr(e.musicVolume),
    ambientVolume: pr(e.ambientVolume),
    audioChannels: { ...jd, ...e.audioChannels || {} },
    durationMinutes: po(e.pomodoroDuration),
    studyGoal: e.studyGoal,
    studyPlan: Gv(e.studyPlan),
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks.filter(Boolean) : [],
    workspaceNotes: String(e.workspaceNotes || ""),
    workspaceUpdatedAt: e.workspaceUpdatedAt || "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, VA(i);
}
function qC(e) {
  return Array.isArray(e == null ? void 0 : e.completedTasks) ? e.completedTasks.map((n) => String(n || "").trim()).filter(Boolean) : [];
}
function Uc(e = {}) {
  return {
    sectionTitle: String(e.sectionTitle || "").trim(),
    excerpt: String(e.excerpt || "").trim().slice(0, 1800)
  };
}
function n0(e = null) {
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
function Bn(e = {}) {
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
    timerStatus: Pd(i),
    timerUpdatedAtMs: n
  };
}
function eE(e = {}) {
  const n = zt(e);
  return {
    timerState: n,
    timerPhase: n,
    status: n,
    timerStatus: Pd(n),
    timerMode: e.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: Number.isFinite(Number(e.timerAnchorAtMs)) ? Number(e.timerAnchorAtMs) : null,
    timerPausedAtMs: Number.isFinite(Number(e.timerPausedAtMs)) ? Number(e.timerPausedAtMs) : null,
    timerUpdatedAtMs: Number.isFinite(Number(e.timerUpdatedAtMs)) ? Number(e.timerUpdatedAtMs) : null,
    timerRestoredAtMs: Number.isFinite(Number(e.timerRestoredAtMs)) ? Number(e.timerRestoredAtMs) : null,
    timerDurationSeconds: Bn(e),
    pomodoroDuration: e.pomodoroDuration,
    elapsedSeconds: Math.max(0, Number(e.elapsedSeconds) || 0),
    startedAt: e.startedAt || null,
    currentSession: e.currentSession || null,
    view: e.view
  };
}
function pn(e) {
  var i;
  const n = String(e.selectedMaterialId || ((i = e.selectedMaterial) == null ? void 0 : i.materialId) || "");
  return !n || e.view !== "session" ? !1 : bd(n, eE(e));
}
function _y(e, n = pt()) {
  const i = io(e, n), o = Bn(e), a = e.timerMode !== "countup" && o > 0 && i >= o, c = a ? "completed" : zt(e);
  return {
    ...Bt(c, n),
    elapsedSeconds: a ? o : i,
    timerAnchorAtMs: c === "running" ? e.timerAnchorAtMs : null,
    timerPausedAtMs: c === "running" ? null : e.timerPausedAtMs || n,
    audioPlaying: c === "running" ? e.audioPlaying : !1
  };
}
function tE(e, n = {}) {
  const i = Hn(n.selectedScene), o = JC(e == null ? void 0 : e.materialId), a = Rd(o == null ? void 0 : o.selectedScene) ? o.selectedScene : i.id, c = Hn(a), d = String((o == null ? void 0 : o.musicType) || c.musicType || "Deep Focus"), f = String((o == null ? void 0 : o.ambientSound) || c.ambientSound || "Nature"), y = pr(o == null ? void 0 : o.musicVolume, n.musicVolume ?? 60), v = pr(o == null ? void 0 : o.ambientVolume, n.ambientVolume ?? 50), S = po(o == null ? void 0 : o.durationMinutes, n.pomodoroDuration ?? Qr), l = String((o == null ? void 0 : o.studyGoal) || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`), h = Gv(o == null ? void 0 : o.studyPlan), g = h.length ? h : Fc(e, l, S), x = qC(o), T = String((o == null ? void 0 : o.workspaceNotes) || ""), k = (o == null ? void 0 : o.workspaceUpdatedAt) || (o == null ? void 0 : o.updatedAt) || "";
  return {
    selectedScene: a,
    musicType: d,
    ambientSound: f,
    musicVolume: y,
    ambientVolume: v,
    audioChannels: { ...jd, ...(o == null ? void 0 : o.audioChannels) || n.audioChannels || {} },
    pomodoroDuration: S,
    studyGoal: l,
    studyPlan: g,
    completedTasks: x,
    workspaceNotes: T,
    workspaceUpdatedAt: k
  };
}
function nE(e) {
  const n = zA(e);
  if (!n || typeof n != "object") return null;
  const i = zt(n), o = pt(), a = Number(n.timerAnchorAtMs), c = Date.parse(n.startedAt || ""), d = Number.isFinite(c) ? c : NaN, f = i === "running" ? io({
    ...n,
    timerState: "running",
    timerAnchorAtMs: Number.isFinite(a) && a > 0 ? a : d
  }, o) : Math.max(0, Number(n.elapsedSeconds) || 0), y = Bn(n), v = i === "running" ? y > 0 && f >= y ? "completed" : "paused" : i, S = i === "running";
  return {
    route: n.view === "session" ? "session" : "setup",
    view: n.view === "session" ? "session" : "setup",
    ...Bt(S ? "restoring" : v, o),
    timerRestoreTarget: S ? v : null,
    timerMode: n.timerMode === "countup" ? "countup" : "countdown",
    timerAnchorAtMs: null,
    timerPausedAtMs: S ? null : Number(n.timerPausedAtMs) || null,
    timerRestoredAtMs: S ? null : o,
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
    panelTab: Ic.has(n.panelTab) ? n.panelTab : "materials",
    workspaceNotes: String(n.workspaceNotes || ""),
    workspaceUpdatedAt: n.workspaceUpdatedAt || n.updatedAt || "",
    activeNoteSection: String(n.activeNoteSection || ""),
    activeSourceHighlight: n0(n.activeSourceHighlight),
    assistantContext: Uc(n.assistantContext),
    audioPlaying: !1
  };
}
function Bs() {
  return {
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {}
  };
}
function rE(e) {
  return Object.values(e.flashcardProgress || {}).filter((n) => n && n.difficulty).length;
}
function iE(e) {
  const n = Object.values(e.quizChecked || {}).filter((o) => o && o.hasKnownAnswer);
  if (!n.length) return null;
  const i = n.filter((o) => o.correct).length;
  return Math.round(i / n.length * 100);
}
function oE(e) {
  const n = Oc(e.selectedMaterial);
  return Object.entries(e.quizChecked || {}).filter(([, i]) => i && i.hasKnownAnswer && !i.correct).map(([i]) => QA(n[Number(i)], Number(i))).filter(Boolean);
}
async function sE(e, n, i, o = {}) {
  var d, f;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: Xv(e, i, G.getState().studyGoal),
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
const G = XC((e, n) => {
  const i = ZC();
  return {
    route: "landing",
    view: "landing",
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
    audioChannels: { ...jd },
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
      if (["landing", "setup", "session"].includes(o.view) && o.selectedMaterialId === "focus-room") return;
      const a = Hn(o.selectedScene);
      e({
        route: "landing",
        view: "landing",
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
    openSetup() {
      e({
        route: "setup",
        view: "setup",
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null
      });
    },
    openLanding() {
      e({
        route: "landing",
        view: "landing",
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null
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
      const v = d.selectedMaterialId === y, S = v && c ? null : nE(y), l = v && c ? {} : tE(a, d), h = v && c ? {} : {
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
        ...Bs(),
        chatMessages: [],
        chatPending: !1,
        chatError: "",
        activeNoteSection: "",
        activeSourceHighlight: null,
        assistantContext: { sectionTitle: "", excerpt: "" }
      }, g = v && c ? d.view === "session" ? "session" : "setup" : (S == null ? void 0 : S.view) === "session" ? "session" : "setup";
      if (e({
        ...l,
        ...h,
        ...S,
        route: g,
        view: g,
        selectedMaterialId: y,
        selectedMaterial: a,
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null
      }), (S == null ? void 0 : S.timerState) === "restoring") {
        const x = S.timerRestoreTarget || "paused";
        Promise.resolve().then(() => {
          const T = n();
          if (T.selectedMaterialId !== y || T.timerState !== "restoring") return;
          const k = pt(), A = Bn(T), R = A > 0 ? Math.min(A, Math.max(0, Number(T.elapsedSeconds) || 0)) : Math.max(0, Number(T.elapsedSeconds) || 0), b = {
            ...Bt(x, k),
            timerRestoreTarget: null,
            timerAnchorAtMs: null,
            timerPausedAtMs: x === "paused" ? k : null,
            timerRestoredAtMs: k,
            elapsedSeconds: R,
            audioPlaying: !1
          };
          e(b), pn({ ...T, ...b });
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
        sessionHistory: Dc()
      });
    },
    selectScene(o) {
      const a = Rd(o);
      a && e((c) => {
        const d = {
          selectedScene: a.id,
          musicType: a.musicType || c.musicType,
          ambientSound: a.ambientSound || c.ambientSound
        }, f = { ...c, ...d };
        return fn(f), d;
      });
    },
    setPomodoroDuration(o) {
      e((a) => {
        const c = po(o, a.pomodoroDuration), d = a.selectedMaterial ? Fc(a.selectedMaterial, a.studyGoal, c) : [], f = {
          pomodoroDuration: c,
          studyPlan: d,
          timerDurationSeconds: a.timerMode === "countup" ? 0 : Xt(c)
        };
        return fn({ ...a, ...f }), f;
      });
    },
    setSessionDuration(o, a = 0) {
      e((c) => {
        const d = Math.max(0, Number.parseInt(o, 10) || 0), f = Math.min(59, Math.max(0, Number.parseInt(a, 10) || 0)), y = d * 60 + f, v = Xt(Wv), S = Xt(ga), l = c.timerMode === "countup" ? 0 : Math.min(S, Math.max(v, y || Xt(c.pomodoroDuration))), h = c.timerMode === "countup" ? po(o, c.pomodoroDuration) : Math.floor(l / 60), g = pt(), x = zt(c), T = io(c, g), k = c.timerMode === "countup" ? T : Math.min(T, l), A = x === "completed" ? "paused" : x, R = {
          pomodoroDuration: h,
          timerDurationSeconds: l,
          elapsedSeconds: k,
          ...Bt(A, g),
          timerAnchorAtMs: A === "running" ? g - k * 1e3 : null,
          timerPausedAtMs: A === "paused" ? g : null
        };
        return fn({ ...c, ...R }), pn({ ...c, ...R }), R;
      });
    },
    setStudyGoal(o) {
      e((a) => {
        const c = String(o ?? ""), d = a.selectedMaterial ? Fc(a.selectedMaterial, c, a.pomodoroDuration) : [], f = { studyGoal: c, studyPlan: d };
        return fn({ ...a, ...f }), f;
      });
    },
    setSound(o, a) {
      e((c) => {
        var f;
        let d = {};
        if (o === "musicVolume" && (d = { musicVolume: pr(a, c.musicVolume) }), o === "ambientVolume" && (d = { ambientVolume: pr(a, c.ambientVolume) }), o === "musicType" && (d = { musicType: String(a || c.musicType) }), o === "ambientSound" && (d = { ambientSound: String(a || c.ambientSound) }), String(o).startsWith("audioChannel:")) {
          const y = String(o).slice(13);
          d = { audioChannels: { ...c.audioChannels, [y]: pr(a, ((f = c.audioChannels) == null ? void 0 : f[y]) ?? 0) } };
        }
        return fn({ ...c, ...d }), d;
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
      const a = Ic.has(String(o || "")) ? String(o) : "materials";
      e({
        panelTab: a,
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    selectSourceHighlight(o = null, { openPanel: a = !0 } = {}) {
      const c = n0(o);
      e({
        activeSourceHighlight: c,
        activeNoteSection: (c == null ? void 0 : c.sectionTitle) || n().activeNoteSection || "",
        assistantContext: c ? Uc({
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
        panelTab: Ic.has(a) ? a : "materials",
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    startSession() {
      const o = n();
      fn(o), e({
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
        ...Bs(),
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
      const d = Bn(o), f = c === "completed" || c === "break" || d > 0 && o.elapsedSeconds >= d, y = f ? 0 : Math.max(0, Number(o.elapsedSeconds) || 0), v = {
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
        ...f ? Bs() : {}
      };
      e(v), pn({ ...o, ...v });
    },
    pauseTimer({ pauseAudio: o = !0 } = {}) {
      const a = n(), c = pt();
      if (zt(a) !== "running") {
        o && a.audioPlaying && e({ audioPlaying: !1 });
        return;
      }
      const d = _y(a, c), f = {
        ...d,
        ...Bt(d.timerState === "completed" ? "completed" : "paused", c),
        timerAnchorAtMs: null,
        timerPausedAtMs: c,
        audioPlaying: o ? !1 : a.audioPlaying
      };
      e(f), pn({ ...a, ...f });
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
        ...Bs()
      };
      e(a), pn({ ...n(), ...a });
    },
    skipTimer() {
      const o = n(), a = pt(), c = Bn(o), d = {
        ...Bt("completed", a),
        elapsedSeconds: c || Math.max(0, Number(o.elapsedSeconds) || 0),
        audioPlaying: !1,
        startedAt: o.startedAt || new Date(a).toISOString(),
        timerAnchorAtMs: null,
        timerPausedAtMs: a,
        timerDurationSeconds: c
      };
      e(d), pn({ ...o, ...d });
    },
    tickTimer() {
      const o = n();
      if (o.view !== "session" || zt(o) !== "running") return;
      const a = pt(), c = Bn(o), d = c ? Math.min(c, io(o, a)) : io(o, a), f = c > 0 && d >= c ? "completed" : "running", y = {
        ...Bt(f, a),
        elapsedSeconds: d,
        timerAnchorAtMs: f === "running" ? o.timerAnchorAtMs : null,
        timerPausedAtMs: f === "running" ? null : a,
        timerDurationSeconds: c,
        audioPlaying: f === "running" ? o.audioPlaying : !1
      };
      d === o.elapsedSeconds && f === zt(o) || (e(y), pn({ ...o, ...y }));
    },
    setTimerMode(o = "countdown") {
      const a = o === "countup" ? "countup" : "countdown", c = {
        timerMode: a,
        timerDurationSeconds: a === "countup" ? 0 : Xt(n().pomodoroDuration)
      };
      e(c), pn({ ...n(), ...c });
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
      e(a), pn({ ...n(), ...a });
    },
    getTimerState() {
      return zt(n());
    },
    endSession() {
      var S;
      const o = n(), a = pt(), c = new Date(a).toISOString(), d = zt(o) === "running" ? _y(o, a) : o, f = Bn(d), y = f ? Math.min(f, d.elapsedSeconds) : d.elapsedSeconds, v = UA({
        sessionId: (S = o.currentSession) == null ? void 0 : S.sessionId,
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
      Hv("focus-room"), e({
        summaryRecord: v,
        sessionHistory: Dc(),
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
        return fn({ ...a, ...c }), c;
      });
    },
    setAssistantContext(o = {}) {
      e({ assistantContext: Uc(o) });
    },
    toggleTask(o) {
      e((a) => {
        const c = a.studyPlan[Number(o)];
        if (!c) return {};
        const d = String(c.task || ""), f = a.completedTasks.includes(d) ? a.completedTasks.filter((y) => y !== d) : [...a.completedTasks, d];
        return fn({ ...a, completedTasks: f }), { completedTasks: f };
      });
    },
    updatePlanTask(o, a = null, c = null) {
      e((d) => {
        const f = Number(o), y = d.studyPlan[f];
        if (!y) return {};
        const v = String(y.task || ""), S = c == null ? v : String(c || "").trim(), l = a == null ? y.minutes : Xr(a, y.minutes, 1, ga), h = d.studyPlan.map((T, k) => k === f ? { minutes: l, task: S || v } : T);
        let g = d.completedTasks;
        v && v !== h[f].task && g.includes(v) && (g = g.filter((T) => T !== v).concat(h[f].task));
        const x = { studyPlan: h, completedTasks: g };
        return fn({ ...d, ...x }), x;
      });
    },
    setFlashcardIndex(o) {
      const a = vy(n().selectedMaterial);
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
      const a = n(), c = vy(a.selectedMaterial);
      if (!c.length) return;
      const d = Xr(a.flashcardIndex, 0, 0, c.length - 1), f = c[d], y = ["easy", "medium", "hard"].includes(String(o)) ? String(o) : "medium";
      e({
        flashcardProgress: {
          ...a.flashcardProgress,
          [KA(f, d)]: {
            difficulty: y,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: d < c.length - 1 ? d + 1 : d
      });
    },
    answerQuizQuestion(o, a) {
      const c = Number(o), d = Oc(n().selectedMaterial)[c];
      if (!d) return;
      const f = String(c);
      e((y) => ({
        quizAnswers: {
          ...y.quizAnswers,
          [f]: JA(d, a, y.quizAnswers[f])
        }
      }));
    },
    checkQuizQuestion(o) {
      const a = Oc(n().selectedMaterial), c = Number(o), d = a[c];
      if (!d) return;
      const f = String(c), y = n(), v = Object.prototype.hasOwnProperty.call(y.quizAnswers, f) ? y.quizAnswers[f] : "", S = qA(d, v), l = Qv(d);
      e({
        quizChecked: {
          ...y.quizChecked,
          [f]: {
            answer: v,
            correct: S === null ? !1 : S,
            hasKnownAnswer: S !== null,
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
        const y = await sE(a, f, d, c.assistantContext);
        e((v) => ({
          chatMessages: Ji([
            ...v.chatMessages,
            { role: "assistant", text: y.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: y.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (y) {
        e((v) => ({
          chatMessages: Ji([
            ...v.chatMessages,
            { role: "assistant", text: Xv(a, d, n().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${y.message || "request failed"}`
        }));
      } finally {
        e({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return rE(n());
    },
    focusQuizScore() {
      return iE(n());
    },
    focusQuizMistakes() {
      return oE(n());
    },
    formatFocusedTime() {
      return Md(n().elapsedSeconds);
    }
  };
});
function aE({ scene: e, active: n, onSelect: i, variant: o = "default" }) {
  return o === "gallery" ? /* @__PURE__ */ w.jsxs(
    tn.button,
    {
      className: `scene-card scene-card-gallery ${n ? "active" : ""}`.trim(),
      type: "button",
      "aria-pressed": n,
      "aria-label": `${e.name}: ${e.description}`,
      onClick: () => i(e.id),
      whileHover: { y: -2 },
      whileTap: { scale: 0.985 },
      children: [
        /* @__PURE__ */ w.jsx("span", { className: "scene-card-gallery-media", style: { backgroundImage: `url("${e.image}")` }, children: /* @__PURE__ */ w.jsx("span", { children: e.kicker }) }),
        /* @__PURE__ */ w.jsxs("span", { className: "scene-card-gallery-copy", children: [
          /* @__PURE__ */ w.jsx("strong", { children: e.name }),
          /* @__PURE__ */ w.jsx("small", { children: e.kicker })
        ] })
      ]
    }
  ) : /* @__PURE__ */ w.jsxs(
    tn.button,
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
        /* @__PURE__ */ w.jsx("span", { className: "focus-pill", children: e.kicker }),
        /* @__PURE__ */ w.jsx("strong", { children: e.name }),
        /* @__PURE__ */ w.jsx("span", { children: e.description })
      ]
    }
  );
}
function r0({ variant: e = "default" }) {
  const n = G((a) => a.selectedScene), i = G((a) => a.selectScene), o = e === "gallery" ? jA : yn.filter((a) => !a.galleryOnly);
  return /* @__PURE__ */ w.jsx("div", { className: `scene-selector scene-selector-${e}`.trim(), "aria-label": "Study scenes", children: o.map((a) => /* @__PURE__ */ w.jsx(aE, { scene: a, active: a.id === n, onSelect: i, variant: e }, a.id)) });
}
const lE = [
  { label: "Piano", icon: PC, musicType: "Piano", ambientSound: "Nature" },
  { label: "Lo-fi", icon: AC, musicType: "Lo-fi", ambientSound: "Cafe Rain" },
  { label: "Nature", icon: t0, musicType: "Deep Focus", ambientSound: "Nature" },
  { label: "Ambient", icon: mC, musicType: "Minimal", ambientSound: "White Noise" },
  { label: "Deep Focus", icon: RC, musicType: "Deep Focus", ambientSound: "White Noise" }
];
function uE() {
  const e = G((g) => g.pomodoroDuration), n = G((g) => g.timerMode), i = G((g) => g.studyGoal), o = G((g) => g.setPomodoroDuration), a = G((g) => g.setTimerMode), c = G((g) => g.setStudyGoal), d = G((g) => g.setSound), f = G((g) => g.openLanding), y = G((g) => g.startSession), [v, S] = C.useState(!1), l = (g) => {
    d("musicType", g.musicType), d("ambientSound", g.ambientSound);
  }, h = (g) => {
    a("countdown"), o(g);
  };
  return /* @__PURE__ */ w.jsxs("section", { className: "focus-setup-stage innook-scene-setup", "aria-label": "Focus Room setup", children: [
    /* @__PURE__ */ w.jsxs("header", { className: "innook-setup-header", children: [
      /* @__PURE__ */ w.jsxs("div", { className: "innook-setup-brand", "aria-label": "Synapse Focus Room", children: [
        /* @__PURE__ */ w.jsx("span", { className: "innook-brand-mark", children: "S" }),
        /* @__PURE__ */ w.jsxs("span", { children: [
          /* @__PURE__ */ w.jsx("strong", { children: "synapse" }),
          /* @__PURE__ */ w.jsx("small", { children: "Focus Room" })
        ] })
      ] }),
      /* @__PURE__ */ w.jsxs("div", { className: "innook-setup-header-actions", children: [
        /* @__PURE__ */ w.jsx("button", { type: "button", className: "innook-header-action", "aria-label": "Focus Room history", title: "Focus Room history", children: /* @__PURE__ */ w.jsx(Bc, { size: 18, "aria-hidden": "true" }) }),
        /* @__PURE__ */ w.jsx("button", { type: "button", className: "innook-header-action", onClick: f, "aria-label": "Back to Focus Room welcome", title: "Back to Focus Room welcome", children: /* @__PURE__ */ w.jsx(lC, { size: 20, "aria-hidden": "true" }) })
      ] })
    ] }),
    /* @__PURE__ */ w.jsxs("div", { className: "innook-setup-layout", children: [
      /* @__PURE__ */ w.jsxs("section", { className: "innook-scene-panel", "aria-labelledby": "innook-scene-title", children: [
        /* @__PURE__ */ w.jsxs("div", { className: "innook-panel-heading", children: [
          /* @__PURE__ */ w.jsx("span", { children: "Step 01" }),
          /* @__PURE__ */ w.jsx("h1", { id: "innook-scene-title", children: "选择学习场景" })
        ] }),
        /* @__PURE__ */ w.jsx(r0, { variant: "gallery" })
      ] }),
      /* @__PURE__ */ w.jsxs("aside", { className: "innook-control-rail", "aria-label": "Study settings", children: [
        /* @__PURE__ */ w.jsx("div", { className: "innook-rail-group", "aria-label": "Music atmosphere", children: lE.map((g) => {
          const x = g.icon;
          return /* @__PURE__ */ w.jsx("button", { type: "button", className: "innook-rail-icon", onClick: () => l(g), "aria-label": `Use ${g.label} atmosphere`, title: g.label, children: /* @__PURE__ */ w.jsx(x, { size: 16, "aria-hidden": "true" }) }, g.label);
        }) }),
        /* @__PURE__ */ w.jsx("div", { className: "innook-rail-divider" }),
        /* @__PURE__ */ w.jsxs("div", { className: "innook-duration-list", "aria-label": "Focus duration", children: [
          Lv.map((g) => /* @__PURE__ */ w.jsx("button", { type: "button", className: `innook-duration ${n !== "countup" && g === e ? "is-active" : ""}`.trim(), onClick: () => h(g), "aria-pressed": n !== "countup" && g === e, children: g }, g)),
          /* @__PURE__ */ w.jsx("button", { type: "button", className: `innook-duration innook-duration-infinity ${n === "countup" ? "is-active" : ""}`.trim(), onClick: () => a("countup"), "aria-label": "Count up timer", "aria-pressed": n === "countup", children: "∞" })
        ] }),
        /* @__PURE__ */ w.jsx("div", { className: "innook-rail-divider" }),
        /* @__PURE__ */ w.jsx("button", { type: "button", className: `innook-rail-icon ${v ? "is-active" : ""}`.trim(), onClick: () => S((g) => !g), "aria-label": "Edit focus intention", title: "Edit focus intention", children: /* @__PURE__ */ w.jsx(BC, { size: 16, "aria-hidden": "true" }) }),
        /* @__PURE__ */ w.jsx("button", { type: "button", className: "innook-enter-button", onClick: y, "aria-label": "Enter Focus Room", title: "Enter Focus Room", children: /* @__PURE__ */ w.jsx(Vc, { size: 22, "aria-hidden": "true" }) }),
        v ? /* @__PURE__ */ w.jsxs("label", { className: "innook-goal-popover", children: [
          "今日目标",
          /* @__PURE__ */ w.jsx("textarea", { value: i, onChange: (g) => c(g.target.value), autoFocus: !0 })
        ] }) : null
      ] })
    ] })
  ] });
}
function ke({
  children: e,
  className: n = "",
  variant: i = "ghost",
  type: o = "button",
  ...a
}) {
  const { onPointerMove: c, onPointerLeave: d, ...f } = a;
  return /* @__PURE__ */ w.jsx(
    "button",
    {
      className: `glass-button glass-button-${i} ${n}`.trim(),
      type: o,
      onPointerMove: (y) => {
        const v = y.currentTarget.getBoundingClientRect();
        y.currentTarget.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, (y.clientX - v.left) / v.width * 100))}%`), y.currentTarget.style.setProperty("--glass-y", `${Math.max(0, Math.min(100, (y.clientY - v.top) / v.height * 100))}%`), c == null || c(y);
      },
      onPointerLeave: (y) => {
        y.currentTarget.style.setProperty("--glass-x", "50%"), y.currentTarget.style.setProperty("--glass-y", "0%"), d == null || d(y);
      },
      ...f,
      children: e
    }
  );
}
function cE(e) {
  return e === "paused" ? "Resume" : e === "completed" ? "Restart" : "Start";
}
function dE() {
  const e = G((D) => D.elapsedSeconds), n = G((D) => D.pomodoroDuration), i = G((D) => D.timerDurationSeconds), o = G((D) => D.timerStatus), a = G((D) => D.isIdle), c = G((D) => D.studyGoal), d = G((D) => D.selectedScene), f = G((D) => D.musicType), y = G((D) => D.ambientSound), v = G((D) => D.startTimer), S = G((D) => D.pauseTimer), l = G((D) => D.resetTimer), h = G((D) => D.skipTimer), g = o === "studying", x = Number(i) || n * 60, T = Math.max(0, x - e), k = x ? Math.min(100, Math.max(0, e / x * 100)) : 0, A = a ? 0.96 : 1, R = o === "studying" ? { scale: [A, A + 0.012, A] } : { scale: A }, b = Hn(d);
  return /* @__PURE__ */ w.jsxs(
    tn.article,
    {
      className: "timer-card liquid-glass",
      animate: R,
      transition: o === "studying" ? { duration: 4, repeat: 1 / 0, ease: "easeInOut" } : { duration: 0.2 },
      children: [
        /* @__PURE__ */ w.jsxs("span", { className: "focus-kicker", children: [
          "Focus Block / ",
          o
        ] }),
        /* @__PURE__ */ w.jsxs("div", { className: "timer-card-head", children: [
          /* @__PURE__ */ w.jsxs("div", { children: [
            /* @__PURE__ */ w.jsx("h2", { children: c || "Deep work block" }),
            /* @__PURE__ */ w.jsx("p", { children: b.name })
          ] }),
          /* @__PURE__ */ w.jsxs("div", { className: "timer-pill-row", children: [
            /* @__PURE__ */ w.jsxs("span", { className: "focus-pill", children: [
              f,
              " / ",
              y
            ] }),
            /* @__PURE__ */ w.jsx("span", { className: "focus-pill", children: "Quiet room" })
          ] })
        ] }),
        /* @__PURE__ */ w.jsx("div", { className: "timer-value", "aria-live": "polite", children: ro(T) }),
        /* @__PURE__ */ w.jsxs("div", { className: "timer-meta-grid", children: [
          /* @__PURE__ */ w.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ w.jsx("span", { children: "Focused" }),
            /* @__PURE__ */ w.jsx("strong", { children: Md(e) })
          ] }),
          /* @__PURE__ */ w.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ w.jsx("span", { children: "Block" }),
            /* @__PURE__ */ w.jsxs("strong", { children: [
              n,
              "m"
            ] })
          ] }),
          /* @__PURE__ */ w.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ w.jsx("span", { children: "Scene" }),
            /* @__PURE__ */ w.jsx("strong", { children: b.name })
          ] })
        ] }),
        /* @__PURE__ */ w.jsx("div", { className: "focus-progress-track", "aria-label": "Focus progress", children: /* @__PURE__ */ w.jsx("div", { className: "focus-progress-fill", style: { width: `${k.toFixed(1)}%` } }) }),
        /* @__PURE__ */ w.jsxs("div", { className: "timer-actions", children: [
          /* @__PURE__ */ w.jsxs(ke, { variant: o === "studying" ? "primary" : "ghost", onClick: v, children: [
            /* @__PURE__ */ w.jsx(Jv, { size: 16, "aria-hidden": "true" }),
            " ",
            cE(o)
          ] }),
          /* @__PURE__ */ w.jsxs(ke, { onClick: () => S(), disabled: !g, "aria-label": g ? "Pause timer" : "Pause timer unavailable", children: [
            /* @__PURE__ */ w.jsx(zc, { size: 16, "aria-hidden": "true" }),
            " Pause"
          ] }),
          /* @__PURE__ */ w.jsxs(ke, { onClick: l, children: [
            /* @__PURE__ */ w.jsx(qv, { size: 16, "aria-hidden": "true" }),
            " Reset"
          ] }),
          /* @__PURE__ */ w.jsxs(ke, { onClick: h, children: [
            /* @__PURE__ */ w.jsx(e0, { size: 16, "aria-hidden": "true" }),
            " Skip"
          ] })
        ] })
      ]
    }
  );
}
function fE() {
  return /* @__PURE__ */ w.jsx(dE, {});
}
function pE({ onWorkspace: e, onOpenTrail: n, onOpenCompanion: i, onOpenSettings: o, onExit: a }) {
  const c = G((f) => f.selectedScene), d = Hn(c);
  return /* @__PURE__ */ w.jsxs("header", { className: "focus-room-header", children: [
    /* @__PURE__ */ w.jsxs("button", { type: "button", className: "focus-wordmark", onClick: e, "aria-label": "Return to Synapse workspace", children: [
      /* @__PURE__ */ w.jsx("span", { className: "focus-wordmark-mark", children: "S" }),
      /* @__PURE__ */ w.jsx("span", { children: "synapse" })
    ] }),
    /* @__PURE__ */ w.jsxs("div", { className: "focus-room-context", "aria-label": "Current focus context", children: [
      /* @__PURE__ */ w.jsx("span", { children: d.name }),
      /* @__PURE__ */ w.jsx("small", { children: "Quiet study room" })
    ] }),
    /* @__PURE__ */ w.jsxs("nav", { className: "focus-room-header-actions", "aria-label": "Focus Room controls", children: [
      /* @__PURE__ */ w.jsxs(ke, { className: "header-icon-button", onClick: n, title: "Open Focus Trail", "aria-label": "Open Focus Trail", children: [
        /* @__PURE__ */ w.jsx(wa, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: "Focus Trail" })
      ] }),
      /* @__PURE__ */ w.jsxs(ke, { className: "header-icon-button", onClick: i, title: "Open Companion Room", "aria-label": "Open Companion Room", children: [
        /* @__PURE__ */ w.jsx(xa, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: "Companion" })
      ] }),
      /* @__PURE__ */ w.jsxs(ke, { className: "header-icon-button", onClick: o, title: "Open room settings", "aria-label": "Open room settings", children: [
        /* @__PURE__ */ w.jsx(ho, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: "Settings" })
      ] }),
      /* @__PURE__ */ w.jsxs(ke, { className: "header-icon-button header-exit-button", onClick: a, title: "Exit Focus Room", "aria-label": "Exit Focus Room", children: [
        /* @__PURE__ */ w.jsx(SC, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: "Exit" })
      ] })
    ] })
  ] });
}
function hE({ onFocusMode: e, audioState: n }) {
  const i = G((P) => P.timerStatus), o = G((P) => P.elapsedSeconds), a = G((P) => P.pomodoroDuration), c = G((P) => P.timerDurationSeconds), d = G((P) => P.timerMode), f = G((P) => P.studyGoal), y = G((P) => P.currentSession), v = G((P) => P.startTimer), S = G((P) => P.pauseTimer), l = G((P) => P.resetTimer), h = G((P) => P.skipTimer), g = G((P) => P.setSessionDuration), x = G((P) => P.toggleAudio), T = G((P) => P.audioPlaying), k = G((P) => P.setStudyGoal), [A, R] = C.useState(!1), [b, D] = C.useState("25:00"), [L, K] = C.useState(!1), [Q, $] = C.useState(""), W = d === "countup" ? 0 : Number(c) || (Number(a) || 0) * 60, X = d === "countup" ? o : Math.max(0, W - o), J = i === "paused", ce = i === "studying", me = i === "completed", pe = me && d !== "countup" ? "00:00" : ro(X), we = J ? "Paused" : me ? "Complete" : "In focus", ue = J ? "Resume timer" : ce ? "Pause timer" : "Start timer", he = () => {
    D(pe), R(!0);
  }, z = () => {
    const [P = "", O = "0"] = String(b).split(":");
    g(P, O), R(!1);
  }, q = () => {
    $(f || ""), K(!0);
  }, Y = () => {
    const P = Q.trim();
    P && k(P), K(!1);
  };
  return /* @__PURE__ */ w.jsxs("div", { className: "focus-session-dock liquid-glass", "aria-label": "Focus session controls", children: [
    /* @__PURE__ */ w.jsxs("div", { className: "dock-timer-block", children: [
      /* @__PURE__ */ w.jsxs("div", { className: "dock-eyebrow", children: [
        "POMODORO #",
        (y == null ? void 0 : y.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ w.jsxs("div", { className: "dock-status", children: [
        /* @__PURE__ */ w.jsx("span", { className: `dock-status-dot ${J ? "is-paused" : ""}` }),
        we
      ] }),
      A ? /* @__PURE__ */ w.jsx(
        "input",
        {
          autoFocus: !0,
          className: "dock-time-input",
          type: "text",
          inputMode: "text",
          maxLength: 6,
          value: b,
          "aria-label": "Focus duration in minutes and seconds",
          onChange: (P) => D(P.target.value.replace(/[^0-9:]/g, "")),
          onFocus: (P) => P.currentTarget.select(),
          onKeyDown: (P) => {
            P.key === "Enter" && (P.preventDefault(), z()), P.key === "Escape" && (P.preventDefault(), P.currentTarget.dataset.cancel = "true", R(!1));
          },
          onBlur: (P) => {
            P.currentTarget.dataset.cancel !== "true" && z();
          }
        }
      ) : /* @__PURE__ */ w.jsx("button", { type: "button", className: "dock-time-edit", onClick: he, "aria-label": `Change focus duration, currently ${a} minutes`, title: "Click to change focus duration", children: /* @__PURE__ */ w.jsx("strong", { className: "dock-time", "aria-live": "off", children: pe }) }),
      /* @__PURE__ */ w.jsx("div", { className: "dock-progress", "aria-hidden": "true", children: /* @__PURE__ */ w.jsx("span", { style: { width: `${W ? Math.min(100, Math.max(0, o / W * 100)) : 0}%` } }) })
    ] }),
    /* @__PURE__ */ w.jsxs("div", { className: "dock-goal-block", children: [
      /* @__PURE__ */ w.jsx("span", { className: "dock-eyebrow", children: "TODAY'S GOAL" }),
      L ? /* @__PURE__ */ w.jsx(
        "input",
        {
          autoFocus: !0,
          className: "dock-goal-input",
          type: "text",
          value: Q,
          maxLength: 140,
          "aria-label": "Edit today's goal",
          onChange: (P) => $(P.target.value),
          onFocus: (P) => P.currentTarget.select(),
          onKeyDown: (P) => {
            P.key === "Enter" && (P.preventDefault(), Y()), P.key === "Escape" && (P.preventDefault(), P.currentTarget.dataset.cancel = "true", K(!1));
          },
          onBlur: (P) => {
            P.currentTarget.dataset.cancel !== "true" && Y();
          }
        }
      ) : /* @__PURE__ */ w.jsx(
        "button",
        {
          type: "button",
          className: "dock-goal-edit",
          onClick: q,
          "aria-label": `Edit today's goal, currently ${f || "a quiet block for meaningful progress"}`,
          title: "Click to edit today's goal",
          children: /* @__PURE__ */ w.jsx("strong", { children: f || "A quiet block for meaningful progress" })
        }
      ),
      /* @__PURE__ */ w.jsxs("span", { className: "dock-goal-meta", children: [
        d === "countup" ? "Count-up" : `${ro(W)} session`,
        " · ",
        ro(o),
        " focused"
      ] })
    ] }),
    /* @__PURE__ */ w.jsxs("div", { className: "dock-action-block", children: [
      /* @__PURE__ */ w.jsxs(ke, { className: "dock-action-button", onClick: x, "aria-label": T ? "Pause room audio" : "Play room audio", children: [
        T ? /* @__PURE__ */ w.jsx(zc, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ w.jsx(Dd, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: n != null && n.playing ? "Pause audio" : "Audio" })
      ] }),
      /* @__PURE__ */ w.jsxs(ke, { className: "dock-action-button", onClick: () => ce ? S() : v(), variant: "primary", "aria-label": ue, children: [
        ce ? /* @__PURE__ */ w.jsx(zc, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ w.jsx(Jv, { size: 15, fill: "currentColor", "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: J ? "Resume" : ce ? "Pause" : "Start" })
      ] }),
      /* @__PURE__ */ w.jsxs(ke, { className: "dock-action-button", onClick: h, "aria-label": "Skip timer", children: [
        /* @__PURE__ */ w.jsx(e0, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: "Skip" })
      ] }),
      /* @__PURE__ */ w.jsxs(ke, { className: "dock-action-button", onClick: l, "aria-label": "Reset timer", children: [
        /* @__PURE__ */ w.jsx(qv, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: "Reset" })
      ] }),
      /* @__PURE__ */ w.jsxs(ke, { className: "dock-focus-mode", onClick: e, "aria-label": "Enter distraction-free Focus Mode", children: [
        /* @__PURE__ */ w.jsx(LC, { size: 15, "aria-hidden": "true" }),
        /* @__PURE__ */ w.jsx("span", { children: "Focus Mode" })
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
function Ty(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function mE(...e) {
  return (n) => {
    let i = !1;
    const o = e.map((a) => {
      const c = Ty(a, n);
      return !i && typeof c == "function" && (i = !0), c;
    });
    if (i)
      return () => {
        for (let a = 0; a < o.length; a++) {
          const c = o[a];
          typeof c == "function" ? c() : Ty(e[a], null);
        }
      };
  };
}
function st(...e) {
  return C.useCallback(mE(...e), e);
}
function Id(e, n = []) {
  let i = [];
  function o(c, d) {
    const f = C.createContext(d);
    f.displayName = c + "Context";
    const y = i.length;
    i = [...i, d];
    const v = (l) => {
      var A;
      const { scope: h, children: g, ...x } = l, T = ((A = h == null ? void 0 : h[e]) == null ? void 0 : A[y]) || f, k = C.useMemo(() => x, Object.values(x));
      return /* @__PURE__ */ w.jsx(T.Provider, { value: k, children: g });
    };
    v.displayName = c + "Provider";
    function S(l, h, g = {}) {
      var A;
      const { optional: x = !1 } = g, T = ((A = h == null ? void 0 : h[e]) == null ? void 0 : A[y]) || f, k = C.useContext(T);
      if (k) return k;
      if (d !== void 0) return d;
      if (!x)
        throw new Error(`\`${l}\` must be used within \`${c}\``);
    }
    return [v, S];
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
  return a.scopeName = e, [o, yE(a, ...n)];
}
function yE(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const i = () => {
    const o = e.map((a) => ({
      useScope: a(),
      scopeName: a.scopeName
    }));
    return function(c) {
      const d = o.reduce((f, { useScope: y, scopeName: v }) => {
        const l = y(c)[`__scope${v}`];
        return { ...f, ...l };
      }, {});
      return C.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return i.scopeName = n.scopeName, i;
}
var ti = globalThis != null && globalThis.document ? C.useLayoutEffect : () => {
}, gE = Xc[" useId ".trim().toString()] || (() => {
}), vE = 0;
function Xu(e) {
  const [n, i] = C.useState(gE());
  return ti(() => {
    i((o) => o ?? String(vE++));
  }, [e]), e || (n ? `radix-${n}` : "");
}
var SE = Xc[" useInsertionEffect ".trim().toString()] || ti;
function i0({
  prop: e,
  defaultProp: n,
  onChange: i = () => {
  },
  caller: o
}) {
  const [a, c, d] = wE({
    defaultProp: n,
    onChange: i
  }), f = e !== void 0, y = f ? e : a;
  {
    const S = C.useRef(e !== void 0);
    C.useEffect(() => {
      const l = S.current;
      l !== f && console.warn(
        `${o} is changing from ${l ? "controlled" : "uncontrolled"} to ${f ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), S.current = f;
    }, [f, o]);
  }
  const v = C.useCallback(
    (S) => {
      var l;
      if (f) {
        const h = xE(S) ? S(e) : S;
        h !== e && ((l = d.current) == null || l.call(d, h));
      } else
        c(S);
    },
    [f, e, c, d]
  );
  return [y, v];
}
function wE({
  defaultProp: e,
  onChange: n
}) {
  const [i, o] = C.useState(e), a = C.useRef(i), c = C.useRef(n);
  return SE(() => {
    c.current = n;
  }, [n]), C.useEffect(() => {
    var d;
    a.current !== i && ((d = c.current) == null || d.call(c, i), a.current = i);
  }, [i, a]), [i, o, c];
}
function xE(e) {
  return typeof e == "function";
}
var o0 = Qy();
// @__NO_SIDE_EFFECTS__
function _a(e) {
  const n = C.forwardRef((i, o) => {
    let { children: a, ...c } = i, d = null, f = !1;
    const y = [];
    ky(a) && typeof zs == "function" && (a = zs(a._payload)), C.Children.forEach(a, (h) => {
      var g;
      if (CE(h)) {
        f = !0;
        const x = h;
        let T = "child" in x.props ? x.props.child : x.props.children;
        ky(T) && typeof zs == "function" && (T = zs(T._payload)), d = TE(x, T), y.push((g = d == null ? void 0 : d.props) == null ? void 0 : g.children);
      } else
        y.push(h);
    }), d ? d = C.cloneElement(d, void 0, y) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !f && C.Children.count(a) === 1 && C.isValidElement(a) && (d = a)
    );
    const v = d ? AE(d) : void 0, S = st(o, v);
    if (!d) {
      if (a || a === 0)
        throw new Error(
          f ? ME(e) : bE(e)
        );
      return a;
    }
    const l = kE(c, d.props ?? {});
    return d.type !== C.Fragment && (l.ref = o ? S : v), C.cloneElement(d, l);
  });
  return n.displayName = `${e}.Slot`, n;
}
var _E = Symbol.for("radix.slottable"), TE = (e, n) => {
  if ("child" in e.props) {
    const i = e.props.child;
    return C.isValidElement(i) ? C.cloneElement(i, void 0, e.props.children(i.props.children)) : null;
  }
  return C.isValidElement(n) ? n : null;
};
function kE(e, n) {
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
function AE(e) {
  var o, a;
  let n = (o = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : o.get, i = n && "isReactWarning" in n && n.isReactWarning;
  return i ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, i = n && "isReactWarning" in n && n.isReactWarning, i ? e.props.ref : e.props.ref || e.ref);
}
function CE(e) {
  return C.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === _E;
}
var EE = Symbol.for("react.lazy");
function ky(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === EE && "_payload" in e && PE(e._payload);
}
function PE(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
var bE = (e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, ME = (e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, zs = Xc[" use ".trim().toString()], RE = [
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
], yt = RE.reduce((e, n) => {
  const i = /* @__PURE__ */ _a(`Primitive.${n}`), o = C.forwardRef((a, c) => {
    const { asChild: d, ...f } = a, y = d ? i : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ w.jsx(y, { ...f, ref: c });
  });
  return o.displayName = `Primitive.${n}`, { ...e, [n]: o };
}, {});
function NE(e, n) {
  e && o0.flushSync(() => e.dispatchEvent(n));
}
function mo(e) {
  const n = C.useRef(e);
  return C.useEffect(() => {
    n.current = e;
  }), C.useMemo(() => ((...i) => {
    var o;
    return (o = n.current) == null ? void 0 : o.call(n, ...i);
  }), []);
}
var DE = "DismissableLayer", $c = "dismissableLayer.update", jE = "dismissableLayer.pointerDownOutside", IE = "dismissableLayer.focusOutside", Ay, Fd = C.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
}), s0 = C.forwardRef(
  (e, n) => {
    const {
      disableOutsidePointerEvents: i = !1,
      deferPointerDownOutside: o = !1,
      onEscapeKeyDown: a,
      onPointerDownOutside: c,
      onFocusOutside: d,
      onInteractOutside: f,
      onDismiss: y,
      ...v
    } = e, S = C.useContext(Fd), [l, h] = C.useState(null), g = (l == null ? void 0 : l.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, x] = C.useState({}), T = st(n, h), k = Array.from(S.layers), [A] = [
      ...S.layersWithOutsidePointerEventsDisabled
    ].slice(-1), R = A ? k.indexOf(A) : -1, b = l ? k.indexOf(l) : -1, D = S.layersWithOutsidePointerEventsDisabled.size > 0, L = b >= R, K = C.useRef(!1), Q = BE(
      (J) => {
        c == null || c(J), f == null || f(J), J.defaultPrevented || y == null || y();
      },
      {
        ownerDocument: g,
        deferPointerDownOutside: o,
        isDeferredPointerDownOutsideRef: K,
        dismissableSurfaces: S.dismissableSurfaces,
        shouldHandlePointerDownOutside: C.useCallback(
          (J) => {
            if (!(J instanceof Node))
              return !1;
            const ce = [...S.branches].some(
              (me) => me.contains(J)
            );
            return L && !ce;
          },
          [S.branches, L]
        )
      }
    ), $ = zE((J) => {
      if (o && K.current)
        return;
      const ce = J.target;
      [...S.branches].some((pe) => pe.contains(ce)) || (d == null || d(J), f == null || f(J), J.defaultPrevented || y == null || y());
    }, g), W = l ? b === k.length - 1 : !1, X = mo((J) => {
      J.key === "Escape" && (a == null || a(J), !J.defaultPrevented && y && (J.preventDefault(), y()));
    });
    return C.useEffect(() => {
      if (W)
        return g.addEventListener("keydown", X, { capture: !0 }), () => g.removeEventListener("keydown", X, { capture: !0 });
    }, [g, W, X]), C.useEffect(() => {
      if (l)
        return i && (S.layersWithOutsidePointerEventsDisabled.size === 0 && (Ay = g.body.style.pointerEvents, g.body.style.pointerEvents = "none"), S.layersWithOutsidePointerEventsDisabled.add(l)), S.layers.add(l), Cy(), () => {
          i && (S.layersWithOutsidePointerEventsDisabled.delete(l), S.layersWithOutsidePointerEventsDisabled.size === 0 && (g.body.style.pointerEvents = Ay));
        };
    }, [l, g, i, S]), C.useEffect(() => () => {
      l && (S.layers.delete(l), S.layersWithOutsidePointerEventsDisabled.delete(l), Cy());
    }, [l, S]), C.useEffect(() => {
      const J = () => x({});
      return document.addEventListener($c, J), () => document.removeEventListener($c, J);
    }, []), /* @__PURE__ */ w.jsx(
      yt.div,
      {
        ...v,
        ref: T,
        style: {
          pointerEvents: D ? L ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: ht(e.onFocusCapture, $.onFocusCapture),
        onBlurCapture: ht(e.onBlurCapture, $.onBlurCapture),
        onPointerDownCapture: ht(
          e.onPointerDownCapture,
          Q.onPointerDownCapture
        )
      }
    );
  }
);
s0.displayName = DE;
var FE = "DismissableLayerBranch", OE = C.forwardRef((e, n) => {
  const i = C.useContext(Fd), o = C.useRef(null), a = st(n, o);
  return C.useEffect(() => {
    const c = o.current;
    if (c)
      return i.branches.add(c), () => {
        i.branches.delete(c);
      };
  }, [i.branches]), /* @__PURE__ */ w.jsx(yt.div, { ...e, ref: a });
});
OE.displayName = FE;
function LE() {
  const e = C.useContext(Fd), [n, i] = C.useState(null);
  return C.useEffect(() => {
    if (n)
      return e.dismissableSurfaces.add(n), () => {
        e.dismissableSurfaces.delete(n);
      };
  }, [n, e.dismissableSurfaces]), i;
}
var VE = () => !0;
function BE(e, n) {
  const {
    ownerDocument: i = globalThis == null ? void 0 : globalThis.document,
    deferPointerDownOutside: o = !1,
    isDeferredPointerDownOutsideRef: a,
    dismissableSurfaces: c,
    shouldHandlePointerDownOutside: d = VE
  } = n, f = mo(e), y = C.useRef(!1), v = C.useRef(!1), S = C.useRef(/* @__PURE__ */ new Map()), l = C.useRef(() => {
  });
  return C.useEffect(() => {
    function h() {
      v.current = !1, a.current = !1, S.current.clear();
    }
    function g() {
      return Array.from(S.current.values()).some(Boolean);
    }
    function x(b) {
      if (!v.current)
        return;
      const D = b.target;
      D instanceof Node && [...c].some((K) => K.contains(D)) || S.current.set(b.type, !0), b.type === "click" && window.setTimeout(() => {
        v.current && l.current();
      }, 0);
    }
    function T(b) {
      v.current && S.current.set(b.type, !1);
    }
    const k = (b) => {
      if (b.target && !y.current) {
        let D = function() {
          i.removeEventListener("click", l.current);
          const K = g();
          h(), K || a0(
            jE,
            f,
            L,
            { discrete: !0 }
          );
        };
        if (!d(b.target)) {
          i.removeEventListener("click", l.current), h(), y.current = !1;
          return;
        }
        const L = { originalEvent: b };
        v.current = !0, a.current = o && b.button === 0, S.current.clear(), !o || b.button !== 0 ? D() : (i.removeEventListener("click", l.current), l.current = D, i.addEventListener("click", l.current, { once: !0 }));
      } else
        i.removeEventListener("click", l.current), h();
      y.current = !1;
    }, A = [
      "pointerup",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "click"
    ];
    for (const b of A)
      i.addEventListener(b, x, !0), i.addEventListener(b, T);
    const R = window.setTimeout(() => {
      i.addEventListener("pointerdown", k);
    }, 0);
    return () => {
      window.clearTimeout(R), i.removeEventListener("pointerdown", k), i.removeEventListener("click", l.current);
      for (const b of A)
        i.removeEventListener(b, x, !0), i.removeEventListener(b, T);
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
function zE(e, n = globalThis == null ? void 0 : globalThis.document) {
  const i = mo(e), o = C.useRef(!1);
  return C.useEffect(() => {
    const a = (c) => {
      c.target && !o.current && a0(IE, i, { originalEvent: c }, {
        discrete: !1
      });
    };
    return n.addEventListener("focusin", a), () => n.removeEventListener("focusin", a);
  }, [n, i]), {
    onFocusCapture: () => o.current = !0,
    onBlurCapture: () => o.current = !1
  };
}
function Cy() {
  const e = new CustomEvent($c);
  document.dispatchEvent(e);
}
function a0(e, n, i, { discrete: o }) {
  const a = i.originalEvent.target, c = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: i });
  n && a.addEventListener(e, n, { once: !0 }), o ? NE(a, c) : a.dispatchEvent(c);
}
var Zu = "focusScope.autoFocusOnMount", Ju = "focusScope.autoFocusOnUnmount", Ey = { bubbles: !1, cancelable: !0 }, UE = "FocusScope", l0 = C.forwardRef((e, n) => {
  const {
    loop: i = !1,
    trapped: o = !1,
    onMountAutoFocus: a,
    onUnmountAutoFocus: c,
    ...d
  } = e, [f, y] = C.useState(null), v = mo(a), S = mo(c), l = C.useRef(null), h = st(n, y), g = C.useRef({
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
      let T = function(b) {
        if (g.paused || !f) return;
        const D = b.target;
        f.contains(D) ? l.current = D : On(l.current, { select: !0 });
      }, k = function(b) {
        if (g.paused || !f) return;
        const D = b.relatedTarget;
        D !== null && (f.contains(D) || On(l.current, { select: !0 }));
      }, A = function(b) {
        if (document.activeElement === document.body)
          for (const L of b)
            L.removedNodes.length > 0 && On(f);
      };
      document.addEventListener("focusin", T), document.addEventListener("focusout", k);
      const R = new MutationObserver(A);
      return f && R.observe(f, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", T), document.removeEventListener("focusout", k), R.disconnect();
      };
    }
  }, [o, f, g.paused]), C.useEffect(() => {
    if (f) {
      by.add(g);
      const T = document.activeElement;
      if (!f.contains(T)) {
        const A = new CustomEvent(Zu, Ey);
        f.addEventListener(Zu, v), f.dispatchEvent(A), A.defaultPrevented || ($E(YE(u0(f)), { select: !0 }), document.activeElement === T && On(f));
      }
      return () => {
        f.removeEventListener(Zu, v), setTimeout(() => {
          const A = new CustomEvent(Ju, Ey);
          f.addEventListener(Ju, S), f.dispatchEvent(A), A.defaultPrevented || On(T ?? document.body, { select: !0 }), f.removeEventListener(Ju, S), by.remove(g);
        }, 0);
      };
    }
  }, [f, v, S, g]);
  const x = C.useCallback(
    (T) => {
      if (!i && !o || g.paused) return;
      const k = T.key === "Tab" && !T.altKey && !T.ctrlKey && !T.metaKey, A = document.activeElement;
      if (k && A) {
        const R = T.currentTarget, [b, D] = HE(R);
        b && D ? !T.shiftKey && A === D ? (T.preventDefault(), i && On(b, { select: !0 })) : T.shiftKey && A === b && (T.preventDefault(), i && On(D, { select: !0 })) : A === R && T.preventDefault();
      }
    },
    [i, o, g.paused]
  );
  return /* @__PURE__ */ w.jsx(yt.div, { tabIndex: -1, ...d, ref: h, onKeyDown: x });
});
l0.displayName = UE;
function $E(e, { select: n = !1 } = {}) {
  const i = document.activeElement;
  for (const o of e)
    if (On(o, { select: n }), document.activeElement !== i) return;
}
function HE(e) {
  const n = u0(e), i = Py(n, e), o = Py(n.reverse(), e);
  return [i, o];
}
function u0(e) {
  const n = [], i = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (o) => {
      const a = o.tagName === "INPUT" && o.type === "hidden";
      return o.disabled || o.hidden || a ? NodeFilter.FILTER_SKIP : o.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; i.nextNode(); ) n.push(i.currentNode);
  return n;
}
function Py(e, n) {
  const i = typeof n.checkVisibility == "function" && n.checkVisibility({ checkVisibilityCSS: !0 });
  for (const o of e)
    if (!(i ? !o.checkVisibility({ checkVisibilityCSS: !0 }) : WE(o, { upTo: n })))
      return o;
}
function WE(e, { upTo: n }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (n !== void 0 && e === n) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function GE(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function On(e, { select: n = !1 } = {}) {
  if (e && e.focus) {
    const i = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== i && GE(e) && n && e.select();
  }
}
var by = KE();
function KE() {
  let e = [];
  return {
    add(n) {
      const i = e[0];
      n !== i && (i == null || i.pause()), e = My(e, n), e.unshift(n);
    },
    remove(n) {
      var i;
      e = My(e, n), (i = e[0]) == null || i.resume();
    }
  };
}
function My(e, n) {
  const i = [...e], o = i.indexOf(n);
  return o !== -1 && i.splice(o, 1), i;
}
function YE(e) {
  return e.filter((n) => n.tagName !== "A");
}
var QE = "Portal", c0 = C.forwardRef((e, n) => {
  var f;
  const { container: i, ...o } = e, [a, c] = C.useState(!1);
  ti(() => c(!0), []);
  const d = i || a && ((f = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : f.body);
  return d ? o0.createPortal(/* @__PURE__ */ w.jsx(yt.div, { ...o, ref: n }), d) : null;
});
c0.displayName = QE;
function XE(e, n) {
  return C.useReducer((i, o) => n[i][o] ?? i, e);
}
var Ra = (e) => {
  const { present: n, children: i } = e, o = ZE(n), a = typeof i == "function" ? i({ present: o.isPresent }) : C.Children.only(i), c = JE(o.ref, qE(a));
  return typeof i == "function" || o.isPresent ? C.cloneElement(a, { ref: c }) : null;
};
Ra.displayName = "Presence";
function ZE(e) {
  const [n, i] = C.useState(), o = C.useRef(null), a = C.useRef(e), c = C.useRef("none"), d = C.useRef(void 0), f = e ? "mounted" : "unmounted", [y, v] = XE(f, {
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
    const S = o.current, l = a.current;
    if (l !== e) {
      const g = c.current, x = Qi(S);
      e ? (d.current = x, v("MOUNT")) : x === "none" || (S == null ? void 0 : S.display) === "none" ? v("UNMOUNT") : v(l && g !== x ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
    }
  }, [e, v]), ti(() => {
    if (n) {
      let S;
      const l = n.ownerDocument.defaultView ?? window, h = (x) => {
        const k = Qi(o.current).includes(CSS.escape(x.animationName));
        if (x.target === n && k && (v("ANIMATION_END"), !a.current)) {
          const A = n.style.animationFillMode;
          n.style.animationFillMode = "forwards", S = l.setTimeout(() => {
            n.style.animationFillMode === "forwards" && (n.style.animationFillMode = A);
          });
        }
      }, g = (x) => {
        x.target === n && (c.current = Qi(o.current));
      };
      return n.addEventListener("animationstart", g), n.addEventListener("animationcancel", h), n.addEventListener("animationend", h), () => {
        l.clearTimeout(S), n.removeEventListener("animationstart", g), n.removeEventListener("animationcancel", h), n.removeEventListener("animationend", h);
      };
    } else
      v("ANIMATION_END");
  }, [n, v]), {
    isPresent: ["mounted", "unmountSuspended"].includes(y),
    ref: C.useCallback((S) => {
      if (S) {
        const l = getComputedStyle(S);
        o.current = l, d.current = Qi(l);
      } else
        o.current = null;
      i(S);
    }, [])
  };
}
function Ry(e, n) {
  if (typeof e == "function")
    return e(n);
  e != null && (e.current = n);
}
function JE(...e) {
  const n = C.useRef(e);
  return n.current = e, C.useCallback((i) => {
    const o = n.current;
    let a = !1;
    const c = o.map((d) => {
      const f = Ry(d, i);
      return !a && typeof f == "function" && (a = !0), f;
    });
    if (a)
      return () => {
        for (let d = 0; d < c.length; d++) {
          const f = c[d];
          typeof f == "function" ? f() : Ry(o[d], null);
        }
      };
  }, []);
}
function Qi(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
function qE(e) {
  var o, a;
  let n = (o = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : o.get, i = n && "isReactWarning" in n && n.isReactWarning;
  return i ? e.ref : (n = (a = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : a.get, i = n && "isReactWarning" in n && n.isReactWarning, i ? e.props.ref : e.props.ref || e.ref);
}
var Us = 0, Qt = null;
function eP() {
  C.useEffect(() => {
    Qt || (Qt = { start: Ny(), end: Ny() });
    const { start: e, end: n } = Qt;
    return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== n && document.body.insertAdjacentElement("beforeend", n), Us++, () => {
      Us === 1 && (Qt == null || Qt.start.remove(), Qt == null || Qt.end.remove(), Qt = null), Us = Math.max(0, Us - 1);
    };
  }, []);
}
function Ny() {
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
function d0(e, n) {
  var i = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && n.indexOf(o) < 0 && (i[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var a = 0, o = Object.getOwnPropertySymbols(e); a < o.length; a++)
      n.indexOf(o[a]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[a]) && (i[o[a]] = e[o[a]]);
  return i;
}
function tP(e, n, i) {
  if (i || arguments.length === 2) for (var o = 0, a = n.length, c; o < a; o++)
    (c || !(o in n)) && (c || (c = Array.prototype.slice.call(n, 0, o)), c[o] = n[o]);
  return e.concat(c || Array.prototype.slice.call(n));
}
var na = "right-scroll-bar-position", ra = "width-before-scroll-bar", nP = "with-scroll-bars-hidden", rP = "--removed-body-scroll-bar-size";
function qu(e, n) {
  return typeof e == "function" ? e(n) : e && (e.current = n), e;
}
function iP(e, n) {
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
var oP = typeof window < "u" ? C.useLayoutEffect : C.useEffect, Dy = /* @__PURE__ */ new WeakMap();
function sP(e, n) {
  var i = iP(null, function(o) {
    return e.forEach(function(a) {
      return qu(a, o);
    });
  });
  return oP(function() {
    var o = Dy.get(i);
    if (o) {
      var a = new Set(o), c = new Set(e), d = i.current;
      a.forEach(function(f) {
        c.has(f) || qu(f, null);
      }), c.forEach(function(f) {
        a.has(f) || qu(f, d);
      });
    }
    Dy.set(i, e);
  }, [e]), i;
}
function aP(e) {
  return e;
}
function lP(e, n) {
  n === void 0 && (n = aP);
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
        var S = d;
        d = [], S.forEach(c);
      }, v = function() {
        return Promise.resolve().then(y);
      };
      v(), i = {
        push: function(S) {
          d.push(S), v();
        },
        filter: function(S) {
          return d = d.filter(S), i;
        }
      };
    }
  };
  return a;
}
function uP(e) {
  e === void 0 && (e = {});
  var n = lP(null);
  return n.options = qt({ async: !0, ssr: !1 }, e), n;
}
var f0 = function(e) {
  var n = e.sideCar, i = d0(e, ["sideCar"]);
  if (!n)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = n.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return C.createElement(o, qt({}, i));
};
f0.isSideCarExport = !0;
function cP(e, n) {
  return e.useMedium(n), f0;
}
var p0 = uP(), ec = function() {
}, Na = C.forwardRef(function(e, n) {
  var i = C.useRef(null), o = C.useState({
    onScrollCapture: ec,
    onWheelCapture: ec,
    onTouchMoveCapture: ec
  }), a = o[0], c = o[1], d = e.forwardProps, f = e.children, y = e.className, v = e.removeScrollBar, S = e.enabled, l = e.shards, h = e.sideCar, g = e.noRelative, x = e.noIsolation, T = e.inert, k = e.allowPinchZoom, A = e.as, R = A === void 0 ? "div" : A, b = e.gapMode, D = d0(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), L = h, K = sP([i, n]), Q = qt(qt({}, D), a);
  return C.createElement(
    C.Fragment,
    null,
    S && C.createElement(L, { sideCar: p0, removeScrollBar: v, shards: l, noRelative: g, noIsolation: x, inert: T, setCallbacks: c, allowPinchZoom: !!k, lockRef: i, gapMode: b }),
    d ? C.cloneElement(C.Children.only(f), qt(qt({}, Q), { ref: K })) : C.createElement(R, qt({}, Q, { className: y, ref: K }), f)
  );
});
Na.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
Na.classNames = {
  fullWidth: ra,
  zeroRight: na
};
var dP = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function fP() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var n = dP();
  return n && e.setAttribute("nonce", n), e;
}
function pP(e, n) {
  e.styleSheet ? e.styleSheet.cssText = n : e.appendChild(document.createTextNode(n));
}
function hP(e) {
  var n = document.head || document.getElementsByTagName("head")[0];
  n.appendChild(e);
}
var mP = function() {
  var e = 0, n = null;
  return {
    add: function(i) {
      e == 0 && (n = fP()) && (pP(n, i), hP(n)), e++;
    },
    remove: function() {
      e--, !e && n && (n.parentNode && n.parentNode.removeChild(n), n = null);
    }
  };
}, yP = function() {
  var e = mP();
  return function(n, i) {
    C.useEffect(function() {
      return e.add(n), function() {
        e.remove();
      };
    }, [n && i]);
  };
}, h0 = function() {
  var e = yP(), n = function(i) {
    var o = i.styles, a = i.dynamic;
    return e(o, a), null;
  };
  return n;
}, gP = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, tc = function(e) {
  return parseInt(e || "", 10) || 0;
}, vP = function(e) {
  var n = window.getComputedStyle(document.body), i = n[e === "padding" ? "paddingLeft" : "marginLeft"], o = n[e === "padding" ? "paddingTop" : "marginTop"], a = n[e === "padding" ? "paddingRight" : "marginRight"];
  return [tc(i), tc(o), tc(a)];
}, SP = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return gP;
  var n = vP(e), i = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: n[0],
    top: n[1],
    right: n[2],
    gap: Math.max(0, o - i + n[2] - n[0])
  };
}, wP = h0(), Zr = "data-scroll-locked", xP = function(e, n, i, o) {
  var a = e.left, c = e.top, d = e.right, f = e.gap;
  return i === void 0 && (i = "margin"), `
  .`.concat(nP, ` {
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
  
  .`).concat(na, ` {
    right: `).concat(f, "px ").concat(o, `;
  }
  
  .`).concat(ra, ` {
    margin-right: `).concat(f, "px ").concat(o, `;
  }
  
  .`).concat(na, " .").concat(na, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(ra, " .").concat(ra, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(Zr, `] {
    `).concat(rP, ": ").concat(f, `px;
  }
`);
}, jy = function() {
  var e = parseInt(document.body.getAttribute(Zr) || "0", 10);
  return isFinite(e) ? e : 0;
}, _P = function() {
  C.useEffect(function() {
    return document.body.setAttribute(Zr, (jy() + 1).toString()), function() {
      var e = jy() - 1;
      e <= 0 ? document.body.removeAttribute(Zr) : document.body.setAttribute(Zr, e.toString());
    };
  }, []);
}, TP = function(e) {
  var n = e.noRelative, i = e.noImportant, o = e.gapMode, a = o === void 0 ? "margin" : o;
  _P();
  var c = C.useMemo(function() {
    return SP(a);
  }, [a]);
  return C.createElement(wP, { styles: xP(c, !n, a, i ? "" : "!important") });
}, Hc = !1;
if (typeof window < "u")
  try {
    var $s = Object.defineProperty({}, "passive", {
      get: function() {
        return Hc = !0, !0;
      }
    });
    window.addEventListener("test", $s, $s), window.removeEventListener("test", $s, $s);
  } catch {
    Hc = !1;
  }
var Ur = Hc ? { passive: !1 } : !1, kP = function(e) {
  return e.tagName === "TEXTAREA";
}, m0 = function(e, n) {
  if (!(e instanceof Element))
    return !1;
  var i = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    i[n] !== "hidden" && // contains scroll inside self
    !(i.overflowY === i.overflowX && !kP(e) && i[n] === "visible")
  );
}, AP = function(e) {
  return m0(e, "overflowY");
}, CP = function(e) {
  return m0(e, "overflowX");
}, Iy = function(e, n) {
  var i = n.ownerDocument, o = n;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var a = y0(e, o);
    if (a) {
      var c = g0(e, o), d = c[1], f = c[2];
      if (d > f)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== i.body);
  return !1;
}, EP = function(e) {
  var n = e.scrollTop, i = e.scrollHeight, o = e.clientHeight;
  return [
    n,
    i,
    o
  ];
}, PP = function(e) {
  var n = e.scrollLeft, i = e.scrollWidth, o = e.clientWidth;
  return [
    n,
    i,
    o
  ];
}, y0 = function(e, n) {
  return e === "v" ? AP(n) : CP(n);
}, g0 = function(e, n) {
  return e === "v" ? EP(n) : PP(n);
}, bP = function(e, n) {
  return e === "h" && n === "rtl" ? -1 : 1;
}, MP = function(e, n, i, o, a) {
  var c = bP(e, window.getComputedStyle(n).direction), d = c * o, f = i.target, y = n.contains(f), v = !1, S = d > 0, l = 0, h = 0;
  do {
    if (!f)
      break;
    var g = g0(e, f), x = g[0], T = g[1], k = g[2], A = T - k - c * x;
    (x || A) && y0(e, f) && (l += A, h += x);
    var R = f.parentNode;
    f = R && R.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? R.host : R;
  } while (
    // portaled content
    !y && f !== document.body || // self content
    y && (n.contains(f) || n === f)
  );
  return (S && Math.abs(l) < 1 || !S && Math.abs(h) < 1) && (v = !0), v;
}, Hs = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Fy = function(e) {
  return [e.deltaX, e.deltaY];
}, Oy = function(e) {
  return e && "current" in e ? e.current : e;
}, RP = function(e, n) {
  return e[0] === n[0] && e[1] === n[1];
}, NP = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, DP = 0, $r = [];
function jP(e) {
  var n = C.useRef([]), i = C.useRef([0, 0]), o = C.useRef(), a = C.useState(DP++)[0], c = C.useState(h0)[0], d = C.useRef(e);
  C.useEffect(function() {
    d.current = e;
  }, [e]), C.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(a));
      var T = tP([e.lockRef.current], (e.shards || []).map(Oy), !0).filter(Boolean);
      return T.forEach(function(k) {
        return k.classList.add("allow-interactivity-".concat(a));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(a)), T.forEach(function(k) {
          return k.classList.remove("allow-interactivity-".concat(a));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var f = C.useCallback(function(T, k) {
    if ("touches" in T && T.touches.length === 2 || T.type === "wheel" && T.ctrlKey)
      return !d.current.allowPinchZoom;
    var A = Hs(T), R = i.current, b = "deltaX" in T ? T.deltaX : R[0] - A[0], D = "deltaY" in T ? T.deltaY : R[1] - A[1], L, K = T.target, Q = Math.abs(b) > Math.abs(D) ? "h" : "v";
    if ("touches" in T && Q === "h" && K.type === "range")
      return !1;
    var $ = window.getSelection(), W = $ && $.anchorNode, X = W ? W === K || W.contains(K) : !1;
    if (X)
      return !1;
    var J = Iy(Q, K);
    if (!J)
      return !0;
    if (J ? L = Q : (L = Q === "v" ? "h" : "v", J = Iy(Q, K)), !J)
      return !1;
    if (!o.current && "changedTouches" in T && (b || D) && (o.current = L), !L)
      return !0;
    var ce = o.current || L;
    return MP(ce, k, T, ce === "h" ? b : D);
  }, []), y = C.useCallback(function(T) {
    var k = T;
    if (!(!$r.length || $r[$r.length - 1] !== c)) {
      var A = "deltaY" in k ? Fy(k) : Hs(k), R = n.current.filter(function(L) {
        return L.name === k.type && (L.target === k.target || k.target === L.shadowParent) && RP(L.delta, A);
      })[0];
      if (R && R.should) {
        k.cancelable && k.preventDefault();
        return;
      }
      if (!R) {
        var b = (d.current.shards || []).map(Oy).filter(Boolean).filter(function(L) {
          return L.contains(k.target);
        }), D = b.length > 0 ? f(k, b[0]) : !d.current.noIsolation;
        D && k.cancelable && k.preventDefault();
      }
    }
  }, []), v = C.useCallback(function(T, k, A, R) {
    var b = { name: T, delta: k, target: A, should: R, shadowParent: IP(A) };
    n.current.push(b), setTimeout(function() {
      n.current = n.current.filter(function(D) {
        return D !== b;
      });
    }, 1);
  }, []), S = C.useCallback(function(T) {
    i.current = Hs(T), o.current = void 0;
  }, []), l = C.useCallback(function(T) {
    v(T.type, Fy(T), T.target, f(T, e.lockRef.current));
  }, []), h = C.useCallback(function(T) {
    v(T.type, Hs(T), T.target, f(T, e.lockRef.current));
  }, []);
  C.useEffect(function() {
    return $r.push(c), e.setCallbacks({
      onScrollCapture: l,
      onWheelCapture: l,
      onTouchMoveCapture: h
    }), document.addEventListener("wheel", y, Ur), document.addEventListener("touchmove", y, Ur), document.addEventListener("touchstart", S, Ur), function() {
      $r = $r.filter(function(T) {
        return T !== c;
      }), document.removeEventListener("wheel", y, Ur), document.removeEventListener("touchmove", y, Ur), document.removeEventListener("touchstart", S, Ur);
    };
  }, []);
  var g = e.removeScrollBar, x = e.inert;
  return C.createElement(
    C.Fragment,
    null,
    x ? C.createElement(c, { styles: NP(a) }) : null,
    g ? C.createElement(TP, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function IP(e) {
  for (var n = null; e !== null; )
    e instanceof ShadowRoot && (n = e.host, e = e.host), e = e.parentNode;
  return n;
}
const FP = cP(p0, jP);
var v0 = C.forwardRef(function(e, n) {
  return C.createElement(Na, qt({}, e, { ref: n, sideCar: FP }));
});
v0.classNames = Na.classNames;
var OP = function(e) {
  if (typeof document > "u")
    return null;
  var n = Array.isArray(e) ? e[0] : e;
  return n.ownerDocument.body;
}, Hr = /* @__PURE__ */ new WeakMap(), Ws = /* @__PURE__ */ new WeakMap(), Gs = {}, nc = 0, S0 = function(e) {
  return e && (e.host || S0(e.parentNode));
}, LP = function(e, n) {
  return n.map(function(i) {
    if (e.contains(i))
      return i;
    var o = S0(i);
    return o && e.contains(o) ? o : (console.error("aria-hidden", i, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(i) {
    return !!i;
  });
}, VP = function(e, n, i, o) {
  var a = LP(n, Array.isArray(e) ? e : [e]);
  Gs[i] || (Gs[i] = /* @__PURE__ */ new WeakMap());
  var c = Gs[i], d = [], f = /* @__PURE__ */ new Set(), y = new Set(a), v = function(l) {
    !l || f.has(l) || (f.add(l), v(l.parentNode));
  };
  a.forEach(v);
  var S = function(l) {
    !l || y.has(l) || Array.prototype.forEach.call(l.children, function(h) {
      if (f.has(h))
        S(h);
      else
        try {
          var g = h.getAttribute(o), x = g !== null && g !== "false", T = (Hr.get(h) || 0) + 1, k = (c.get(h) || 0) + 1;
          Hr.set(h, T), c.set(h, k), d.push(h), T === 1 && x && Ws.set(h, !0), k === 1 && h.setAttribute(i, "true"), x || h.setAttribute(o, "true");
        } catch (A) {
          console.error("aria-hidden: cannot operate on ", h, A);
        }
    });
  };
  return S(n), f.clear(), nc++, function() {
    d.forEach(function(l) {
      var h = Hr.get(l) - 1, g = c.get(l) - 1;
      Hr.set(l, h), c.set(l, g), h || (Ws.has(l) || l.removeAttribute(o), Ws.delete(l)), g || l.removeAttribute(i);
    }), nc--, nc || (Hr = /* @__PURE__ */ new WeakMap(), Hr = /* @__PURE__ */ new WeakMap(), Ws = /* @__PURE__ */ new WeakMap(), Gs = {});
  };
}, BP = function(e, n, i) {
  i === void 0 && (i = "data-aria-hidden");
  var o = Array.from(Array.isArray(e) ? e : [e]), a = OP(e);
  return a ? (o.push.apply(o, Array.from(a.querySelectorAll("[aria-live], script"))), VP(o, a, i, "aria-hidden")) : function() {
    return null;
  };
}, Da = "Dialog", [w0] = Id(Da), [zP, $t] = w0(Da), x0 = (e) => {
  const {
    __scopeDialog: n,
    children: i,
    open: o,
    defaultOpen: a,
    onOpenChange: c,
    modal: d = !0
  } = e, f = C.useRef(null), y = C.useRef(null), [v, S] = i0({
    prop: o,
    defaultProp: a ?? !1,
    onChange: c,
    caller: Da
  });
  return /* @__PURE__ */ w.jsx(
    zP,
    {
      scope: n,
      triggerRef: f,
      contentRef: y,
      contentId: Xu(),
      titleId: Xu(),
      descriptionId: Xu(),
      open: v,
      onOpenChange: S,
      onOpenToggle: C.useCallback(() => S((l) => !l), [S]),
      modal: d,
      children: i
    }
  );
};
x0.displayName = Da;
var _0 = "DialogTrigger", UP = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(_0, i), c = st(n, a.triggerRef);
    return /* @__PURE__ */ w.jsx(
      yt.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": a.open,
        "aria-controls": a.open ? a.contentId : void 0,
        "data-state": Ld(a.open),
        ...o,
        ref: c,
        onClick: ht(e.onClick, a.onOpenToggle)
      }
    );
  }
);
UP.displayName = _0;
var Od = "DialogPortal", [$P, T0] = w0(Od, {
  forceMount: void 0
}), k0 = (e) => {
  const { __scopeDialog: n, forceMount: i, children: o, container: a } = e, c = $t(Od, n);
  return /* @__PURE__ */ w.jsx($P, { scope: n, forceMount: i, children: C.Children.map(o, (d) => /* @__PURE__ */ w.jsx(Ra, { present: i || c.open, children: /* @__PURE__ */ w.jsx(c0, { asChild: !0, container: a, children: d }) })) });
};
k0.displayName = Od;
var Ta = "DialogOverlay", A0 = C.forwardRef(
  (e, n) => {
    const i = T0(Ta, e.__scopeDialog), { forceMount: o = i.forceMount, ...a } = e, c = $t(Ta, e.__scopeDialog);
    return c.modal ? /* @__PURE__ */ w.jsx(Ra, { present: o || c.open, children: /* @__PURE__ */ w.jsx(WP, { ...a, ref: n }) }) : null;
  }
);
A0.displayName = Ta;
var HP = /* @__PURE__ */ _a("DialogOverlay.RemoveScroll"), WP = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(Ta, i), c = LE(), d = st(n, c);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ w.jsx(v0, { as: HP, allowPinchZoom: !0, shards: [a.contentRef], children: /* @__PURE__ */ w.jsx(
        yt.div,
        {
          "data-state": Ld(a.open),
          ...o,
          ref: d,
          style: { pointerEvents: "auto", ...o.style }
        }
      ) })
    );
  }
), ni = "DialogContent", C0 = C.forwardRef(
  (e, n) => {
    const i = T0(ni, e.__scopeDialog), { forceMount: o = i.forceMount, ...a } = e, c = $t(ni, e.__scopeDialog);
    return /* @__PURE__ */ w.jsx(Ra, { present: o || c.open, children: c.modal ? /* @__PURE__ */ w.jsx(GP, { ...a, ref: n }) : /* @__PURE__ */ w.jsx(KP, { ...a, ref: n }) });
  }
);
C0.displayName = ni;
var GP = C.forwardRef(
  (e, n) => {
    const i = $t(ni, e.__scopeDialog), o = C.useRef(null), a = st(n, i.contentRef, o);
    return C.useEffect(() => {
      const c = o.current;
      if (c) return BP(c);
    }, []), /* @__PURE__ */ w.jsx(
      E0,
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
), KP = C.forwardRef(
  (e, n) => {
    const i = $t(ni, e.__scopeDialog), o = C.useRef(!1), a = C.useRef(!1);
    return /* @__PURE__ */ w.jsx(
      E0,
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
          var y, v;
          (y = e.onInteractOutside) == null || y.call(e, c), c.defaultPrevented || (o.current = !0, c.detail.originalEvent.type === "pointerdown" && (a.current = !0));
          const d = c.target;
          ((v = i.triggerRef.current) == null ? void 0 : v.contains(d)) && c.preventDefault(), c.detail.originalEvent.type === "focusin" && a.current && c.preventDefault();
        }
      }
    );
  }
), E0 = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, trapFocus: o, onOpenAutoFocus: a, onCloseAutoFocus: c, ...d } = e, f = $t(ni, i);
    return eP(), /* @__PURE__ */ w.jsx(w.Fragment, { children: /* @__PURE__ */ w.jsx(
      l0,
      {
        asChild: !0,
        loop: !0,
        trapped: o,
        onMountAutoFocus: a,
        onUnmountAutoFocus: c,
        children: /* @__PURE__ */ w.jsx(
          s0,
          {
            role: "dialog",
            id: f.contentId,
            "aria-describedby": f.descriptionId,
            "aria-labelledby": f.titleId,
            "data-state": Ld(f.open),
            ...d,
            ref: n,
            deferPointerDownOutside: !0,
            onDismiss: () => f.onOpenChange(!1)
          }
        )
      }
    ) });
  }
), P0 = "DialogTitle", b0 = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(P0, i);
    return /* @__PURE__ */ w.jsx(yt.h2, { id: a.titleId, ...o, ref: n });
  }
);
b0.displayName = P0;
var M0 = "DialogDescription", R0 = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(M0, i);
    return /* @__PURE__ */ w.jsx(yt.p, { id: a.descriptionId, ...o, ref: n });
  }
);
R0.displayName = M0;
var N0 = "DialogClose", YP = C.forwardRef(
  (e, n) => {
    const { __scopeDialog: i, ...o } = e, a = $t(N0, i);
    return /* @__PURE__ */ w.jsx(
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
YP.displayName = N0;
function Ld(e) {
  return e ? "open" : "closed";
}
function QP() {
  const e = G((a) => a.summaryRecord), n = G((a) => a.closeSummary), i = G((a) => a.startTimer), o = Hn(e == null ? void 0 : e.selectedScene);
  return /* @__PURE__ */ w.jsx(x0, { open: !!e, onOpenChange: (a) => !a && n(), children: /* @__PURE__ */ w.jsx(Pa, { children: e ? /* @__PURE__ */ w.jsxs(k0, { forceMount: !0, children: [
    /* @__PURE__ */ w.jsx(A0, { asChild: !0, children: /* @__PURE__ */ w.jsx(
      tn.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ w.jsx(C0, { asChild: !0, children: /* @__PURE__ */ w.jsxs(
      tn.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ w.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ w.jsx(b0, { children: "Focus block complete" }),
          /* @__PURE__ */ w.jsx(R0, { className: "sr-only", children: "Summary of the completed focus block." }),
          /* @__PURE__ */ w.jsx("p", { children: "You protected a focused block in your quiet study room." }),
          /* @__PURE__ */ w.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ w.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ w.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ w.jsx("strong", { children: Md(e.totalFocusTime) })
            ] }),
            /* @__PURE__ */ w.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ w.jsx("span", { children: "Planned block" }),
              /* @__PURE__ */ w.jsxs("strong", { children: [
                e.pomodoroDuration,
                "m"
              ] })
            ] }),
            /* @__PURE__ */ w.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ w.jsx("span", { children: "Scene" }),
              /* @__PURE__ */ w.jsx("strong", { children: o.name })
            ] }),
            /* @__PURE__ */ w.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ w.jsx("span", { children: "Room state" }),
              /* @__PURE__ */ w.jsx("strong", { children: "Saved" })
            ] })
          ] }),
          e.persisted === !1 ? /* @__PURE__ */ w.jsx("p", { children: "This session is visible for now, but could not be saved to this device history." }) : null,
          /* @__PURE__ */ w.jsxs("div", { className: "focus-button-row", children: [
            /* @__PURE__ */ w.jsx(ke, { variant: "primary", onClick: () => {
              n(), i();
            }, children: "Continue studying" }),
            /* @__PURE__ */ w.jsx(ke, { onClick: n, children: "Done" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function D0(e, [n, i]) {
  return Math.min(i, Math.max(n, e));
}
var XP = C.createContext(void 0);
function ZP(e) {
  const n = C.useContext(XP);
  return e || n || "ltr";
}
function JP(e) {
  const n = C.useRef({ value: e, previous: e });
  return C.useMemo(() => (n.current.value !== e && (n.current.previous = n.current.value, n.current.value = e), n.current.previous), [e]);
}
function qP(e) {
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
          const y = c.borderBoxSize, v = Array.isArray(y) ? y[0] : y;
          d = v.inlineSize, f = v.blockSize;
        } else
          d = e.offsetWidth, f = e.offsetHeight;
        i({ width: d, height: f });
      });
      return o.observe(e, { box: "border-box" }), () => o.unobserve(e);
    } else
      i(void 0);
  }, [e]), n;
}
function eb(e) {
  const n = e + "CollectionProvider", [i, o] = Id(n), [a, c] = i(
    n,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), d = (T) => {
    const { scope: k, children: A } = T, R = C.useRef(null), b = C.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ w.jsx(a, { scope: k, itemMap: b, collectionRef: R, children: A });
  };
  d.displayName = n;
  const f = e + "CollectionSlot", y = /* @__PURE__ */ _a(f), v = C.forwardRef(
    (T, k) => {
      const { scope: A, children: R } = T, b = c(f, A), D = st(k, b.collectionRef);
      return /* @__PURE__ */ w.jsx(y, { ref: D, children: R });
    }
  );
  v.displayName = f;
  const S = e + "CollectionItemSlot", l = "data-radix-collection-item", h = /* @__PURE__ */ _a(S), g = C.forwardRef(
    (T, k) => {
      const { scope: A, children: R, ...b } = T, D = C.useRef(null), L = st(k, D), K = c(S, A);
      return C.useEffect(() => (K.itemMap.set(D, { ref: D, ...b }), () => void K.itemMap.delete(D))), /* @__PURE__ */ w.jsx(h, { [l]: "", ref: L, children: R });
    }
  );
  g.displayName = S;
  function x(T) {
    const k = c(e + "CollectionConsumer", T);
    return C.useCallback(() => {
      const R = k.collectionRef.current;
      if (!R) return [];
      const b = Array.from(R.querySelectorAll(`[${l}]`));
      return Array.from(k.itemMap.values()).sort(
        (K, Q) => b.indexOf(K.ref.current) - b.indexOf(Q.ref.current)
      );
    }, [k.collectionRef, k.itemMap]);
  }
  return [
    { Provider: d, Slot: v, ItemSlot: g },
    x,
    o
  ];
}
var j0 = ["PageUp", "PageDown"], I0 = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], F0 = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, si = "Slider", [Wc, tb, nb] = eb(si), [Vd] = Id(si, [
  nb
]), [rb, _o] = Vd(si), O0 = C.forwardRef(
  (e, n) => {
    const {
      name: i,
      min: o = 0,
      max: a = 100,
      step: c = 1,
      orientation: d = "horizontal",
      disabled: f = !1,
      minStepsBetweenThumbs: y = 0,
      defaultValue: v = [o],
      value: S,
      onValueChange: l = () => {
      },
      onValueCommit: h = () => {
      },
      inverted: g = !1,
      form: x,
      ...T
    } = e, k = C.useRef(/* @__PURE__ */ new Set()), A = C.useRef(0), R = C.useRef(!1), D = d === "horizontal" ? ib : ob, [L, K] = C.useState(null), Q = st(n, K), [$ = [], W] = i0({
      prop: S,
      defaultProp: v,
      onChange: (ue) => {
        var z;
        (z = [...k.current][A.current]) == null || z.focus({
          preventScroll: !0,
          focusVisible: R.current
        }), R.current = !1, l(ue);
      }
    }), X = C.useRef($), J = C.useRef($);
    C.useEffect(() => {
      const ue = x ? L == null ? void 0 : L.ownerDocument.getElementById(x) : L == null ? void 0 : L.closest("form");
      if (ue instanceof HTMLFormElement) {
        const he = () => W(J.current);
        return ue.addEventListener("reset", he), () => ue.removeEventListener("reset", he);
      }
    }, [L, x, W]);
    function ce(ue) {
      const he = ub($, ue);
      we(ue, he);
    }
    function me(ue) {
      we(ue, A.current);
    }
    function pe() {
      const ue = X.current[A.current];
      $[A.current] !== ue && h($);
    }
    function we(ue, he, { commit: z } = { commit: !1 }) {
      const q = q0(c), Y = oa(Math.round((ue - o) / c) * c + o, q), P = D0(Y, [o, a]);
      W((O = []) => {
        const ae = ab(O, P, he);
        if (fb(ae, y * c)) {
          A.current = ae.indexOf(P);
          const de = String(ae) !== String(O);
          return de && z && h(ae), de ? ae : O;
        } else
          return O;
      });
    }
    return /* @__PURE__ */ w.jsx(
      rb,
      {
        scope: e.__scopeSlider,
        name: i,
        disabled: f,
        min: o,
        max: a,
        valueIndexToChangeRef: A,
        thumbs: k.current,
        values: $,
        orientation: d,
        form: x,
        children: /* @__PURE__ */ w.jsx(Wc.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ w.jsx(Wc.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ w.jsx(
          D,
          {
            "aria-disabled": f,
            "data-disabled": f ? "" : void 0,
            ...T,
            ref: Q,
            onPointerDown: ht(T.onPointerDown, () => {
              f || (X.current = $, R.current = !1);
            }),
            min: o,
            max: a,
            inverted: g,
            onSlideStart: f ? void 0 : ce,
            onSlideMove: f ? void 0 : me,
            onSlideEnd: f ? void 0 : pe,
            onHomeKeyDown: () => {
              f || (R.current = !0, we(o, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              f || (R.current = !0, we(a, $.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: ue, direction: he }) => {
              if (!f) {
                R.current = !0;
                const Y = j0.includes(ue.key) || ue.shiftKey && I0.includes(ue.key) ? 10 : 1, P = A.current, O = $[P], ae = pb(O, {
                  min: o,
                  step: c,
                  direction: he,
                  multiplier: Y
                });
                we(ae, P, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
O0.displayName = si;
var [L0, V0] = Vd(si, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), ib = C.forwardRef(
  (e, n) => {
    const {
      min: i,
      max: o,
      dir: a,
      inverted: c,
      onSlideStart: d,
      onSlideMove: f,
      onSlideEnd: y,
      onStepKeyDown: v,
      ...S
    } = e, [l, h] = C.useState(null), g = st(n, h), x = C.useRef(void 0), T = ZP(a), k = T === "ltr", A = k && !c || !k && c;
    function R(b) {
      const D = x.current || l.getBoundingClientRect(), L = [0, D.width], Q = Bd(L, A ? [i, o] : [o, i]);
      return x.current = D, Q(b - D.left);
    }
    return /* @__PURE__ */ w.jsx(
      L0,
      {
        scope: e.__scopeSlider,
        startEdge: A ? "left" : "right",
        endEdge: A ? "right" : "left",
        direction: A ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ w.jsx(
          B0,
          {
            dir: T,
            "data-orientation": "horizontal",
            ...S,
            ref: g,
            style: {
              ...S.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (b) => {
              const D = R(b.clientX);
              d == null || d(D);
            },
            onSlideMove: (b) => {
              const D = R(b.clientX);
              f == null || f(D);
            },
            onSlideEnd: () => {
              x.current = void 0, y == null || y();
            },
            onStepKeyDown: (b) => {
              const L = F0[A ? "from-left" : "from-right"].includes(b.key);
              v == null || v({ event: b, direction: L ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), ob = C.forwardRef(
  (e, n) => {
    const {
      min: i,
      max: o,
      inverted: a,
      onSlideStart: c,
      onSlideMove: d,
      onSlideEnd: f,
      onStepKeyDown: y,
      ...v
    } = e, S = C.useRef(null), l = st(n, S), h = C.useRef(void 0), g = !a;
    function x(T) {
      const k = h.current || S.current.getBoundingClientRect(), A = [0, k.height], b = Bd(A, g ? [o, i] : [i, o]);
      return h.current = k, b(T - k.top);
    }
    return /* @__PURE__ */ w.jsx(
      L0,
      {
        scope: e.__scopeSlider,
        startEdge: g ? "bottom" : "top",
        endEdge: g ? "top" : "bottom",
        size: "height",
        direction: g ? 1 : -1,
        children: /* @__PURE__ */ w.jsx(
          B0,
          {
            "data-orientation": "vertical",
            ...v,
            ref: l,
            style: {
              ...v.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (T) => {
              const k = x(T.clientY);
              c == null || c(k);
            },
            onSlideMove: (T) => {
              const k = x(T.clientY);
              d == null || d(k);
            },
            onSlideEnd: () => {
              h.current = void 0, f == null || f();
            },
            onStepKeyDown: (T) => {
              const A = F0[g ? "from-bottom" : "from-top"].includes(T.key);
              y == null || y({ event: T, direction: A ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), B0 = C.forwardRef(
  (e, n) => {
    const {
      __scopeSlider: i,
      onSlideStart: o,
      onSlideMove: a,
      onSlideEnd: c,
      onHomeKeyDown: d,
      onEndKeyDown: f,
      onStepKeyDown: y,
      ...v
    } = e, S = _o(si, i);
    return /* @__PURE__ */ w.jsx(
      yt.span,
      {
        ...v,
        ref: n,
        onKeyDown: ht(e.onKeyDown, (l) => {
          l.key === "Home" ? (d(l), l.preventDefault()) : l.key === "End" ? (f(l), l.preventDefault()) : j0.concat(I0).includes(l.key) && (y(l), l.preventDefault());
        }),
        onPointerDown: ht(e.onPointerDown, (l) => {
          const h = l.target;
          h.setPointerCapture(l.pointerId), l.preventDefault(), S.thumbs.has(h) ? h.focus({ preventScroll: !0, focusVisible: !1 }) : o(l);
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
), z0 = "SliderTrack", U0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: i, ...o } = e, a = _o(z0, i);
    return /* @__PURE__ */ w.jsx(
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
U0.displayName = z0;
var Gc = "SliderRange", $0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: i, ...o } = e, a = _o(Gc, i), c = V0(Gc, i), d = C.useRef(null), f = st(n, d), y = a.values.length, v = a.values.map(
      (h) => J0(h, a.min, a.max)
    ), S = y > 1 ? Math.min(...v) : 0, l = 100 - Math.max(...v);
    return /* @__PURE__ */ w.jsx(
      yt.span,
      {
        "data-orientation": a.orientation,
        "data-disabled": a.disabled ? "" : void 0,
        ...o,
        ref: f,
        style: {
          ...e.style,
          [c.startEdge]: S + "%",
          [c.endEdge]: l + "%"
        }
      }
    );
  }
);
$0.displayName = Gc;
var H0 = "SliderThumb", [sb, W0] = Vd(H0), G0 = "SliderThumbProvider";
function K0(e) {
  const {
    __scopeSlider: n,
    name: i,
    children: o,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: a
  } = e, c = _o(G0, n), d = tb(n), [f, y] = C.useState(null), v = C.useMemo(
    () => f ? d().findIndex((k) => k.ref.current === f) : -1,
    [d, f]
  ), S = qP(f), l = f ? !!c.form || !!f.closest("form") : !0, h = c.values[v], g = i ?? (c.name ? c.name + (c.values.length > 1 ? "[]" : "") : void 0), x = h === void 0 ? 0 : J0(h, c.min, c.max);
  C.useEffect(() => {
    if (f)
      return c.thumbs.add(f), () => {
        c.thumbs.delete(f);
      };
  }, [f, c.thumbs]);
  const T = {
    value: h,
    name: g,
    form: c.form,
    isFormControl: l,
    index: v,
    thumb: f,
    onThumbChange: y,
    percent: x,
    size: S
  };
  return /* @__PURE__ */ w.jsx(sb, { scope: n, ...T, children: hb(a) ? a(T) : o });
}
K0.displayName = G0;
var ia = "SliderThumbTrigger", Y0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: i, ...o } = e, a = _o(ia, i), c = V0(ia, i), { index: d, value: f, percent: y, size: v, onThumbChange: S } = W0(
      ia,
      i
    ), l = st(n, S), h = lb(d, a.values.length), g = v == null ? void 0 : v[c.size], x = g ? cb(g, y, c.direction) : 0;
    return /* @__PURE__ */ w.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [c.startEdge]: `calc(${y}% + ${x}px)`
        },
        children: /* @__PURE__ */ w.jsx(Wc.ItemSlot, { scope: i, children: /* @__PURE__ */ w.jsx(
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
Y0.displayName = ia;
var Q0 = C.forwardRef(
  (e, n) => {
    const { __scopeSlider: i, name: o, ...a } = e;
    return /* @__PURE__ */ w.jsx(
      K0,
      {
        __scopeSlider: i,
        name: o,
        internal_do_not_use_render: ({ index: c, isFormControl: d }) => /* @__PURE__ */ w.jsxs(w.Fragment, { children: [
          /* @__PURE__ */ w.jsx(
            Y0,
            {
              ...a,
              ref: n,
              __scopeSlider: i
            }
          ),
          d ? /* @__PURE__ */ w.jsx(
            Z0,
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
Q0.displayName = H0;
var X0 = "SliderBubbleInput", Z0 = C.forwardRef(
  ({ __scopeSlider: e, ...n }, i) => {
    const { value: o, name: a, form: c } = W0(X0, e), d = C.useRef(null), f = st(d, i), y = JP(o);
    return C.useEffect(() => {
      const v = d.current;
      if (!v) return;
      const S = window.HTMLInputElement.prototype, h = Object.getOwnPropertyDescriptor(S, "value").set;
      if (y !== o && h) {
        const g = new Event("input", { bubbles: !0 });
        h.call(v, o), v.dispatchEvent(g);
      }
    }, [y, o]), /* @__PURE__ */ w.jsx(
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
Z0.displayName = X0;
function ab(e = [], n, i) {
  const o = [...e];
  return o[i] = n, o.sort((a, c) => a - c);
}
function J0(e, n, i) {
  const c = 100 / (i - n) * (e - n);
  return D0(c, [0, 100]);
}
function lb(e, n) {
  return n > 2 ? `Value ${e + 1} of ${n}` : n === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function ub(e, n) {
  if (e.length === 1) return 0;
  const i = e.map((a) => Math.abs(a - n)), o = Math.min(...i);
  return i.indexOf(o);
}
function cb(e, n, i) {
  const o = e / 2, c = Bd([0, 50], [0, o]);
  return (o - c(n) * i) * i;
}
function db(e) {
  return e.slice(0, -1).map((n, i) => e[i + 1] - n);
}
function fb(e, n) {
  if (n > 0) {
    const i = db(e);
    return Math.min(...i) >= n;
  }
  return !0;
}
function Bd(e, n) {
  return (i) => {
    if (e[0] === e[1] || n[0] === n[1]) return n[0];
    const o = (n[1] - n[0]) / (e[1] - e[0]);
    return n[0] + o * (i - e[0]);
  };
}
function q0(e) {
  if (!Number.isFinite(e)) return 0;
  const n = e.toString();
  if (n.includes("e")) {
    const [o, a] = n.split("e"), c = o.split(".")[1] || "", d = Number(a);
    return Math.max(0, c.length - d);
  }
  const i = n.split(".")[1];
  return i ? i.length : 0;
}
function oa(e, n) {
  const i = Math.pow(10, n);
  return Math.round(e * i) / i;
}
function pb(e, {
  min: n,
  step: i,
  direction: o,
  multiplier: a
}) {
  const c = q0(i), d = (e - n) / i, f = Math.round(d), y = oa(f * i + n, c) === oa(e, c);
  let v;
  return y ? v = f + a * o : o > 0 ? v = Math.ceil(d) : v = Math.floor(d), oa(v * i + n, c);
}
function hb(e) {
  return typeof e == "function";
}
function Ly({ label: e, icon: n, value: i, onChange: o }) {
  return /* @__PURE__ */ w.jsxs("label", { className: "sound-slider", children: [
    /* @__PURE__ */ w.jsxs("span", { className: "sound-slider-head", children: [
      /* @__PURE__ */ w.jsxs("span", { className: "sound-slider-label", children: [
        n,
        /* @__PURE__ */ w.jsx("span", { children: e })
      ] }),
      /* @__PURE__ */ w.jsxs("strong", { children: [
        i,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ w.jsxs(
      O0,
      {
        className: "radix-slider-root",
        value: [i],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (a) => o(a[0]),
        children: [
          /* @__PURE__ */ w.jsx(U0, { className: "radix-slider-track", children: /* @__PURE__ */ w.jsx($0, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ w.jsx(Q0, { className: "radix-slider-thumb", "aria-label": e })
        ]
      }
    )
  ] });
}
function mb({ audioState: e }) {
  const n = G((S) => S.musicType), i = G((S) => S.ambientSound), o = G((S) => S.musicVolume), a = G((S) => S.ambientVolume), c = G((S) => S.audioPlaying), d = G((S) => S.setSound), f = G((S) => S.toggleAudio), y = Ma({ musicType: n, ambientSound: i }), v = y.ambientLayers.map((S) => S.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ w.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ w.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ w.jsx("select", { value: n, onChange: (S) => d("musicType", S.target.value), children: co.map((S) => /* @__PURE__ */ w.jsx("option", { value: S.label, children: S.label }, S.label)) })
    ] }),
    /* @__PURE__ */ w.jsx(
      Ly,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ w.jsx(Dd, { size: 16, "aria-hidden": "true" }),
        value: o,
        onChange: (S) => d("musicVolume", S)
      }
    ),
    /* @__PURE__ */ w.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ w.jsx("select", { value: i, onChange: (S) => d("ambientSound", S.target.value), children: fo.map((S) => /* @__PURE__ */ w.jsx("option", { value: S.label, children: S.label }, S.label)) })
    ] }),
    /* @__PURE__ */ w.jsx(
      Ly,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ w.jsx(t0, { size: 16, "aria-hidden": "true" }),
        value: a,
        onChange: (S) => d("ambientVolume", S)
      }
    ),
    /* @__PURE__ */ w.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ w.jsxs("div", { children: [
        /* @__PURE__ */ w.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ w.jsx("strong", { children: y.musicTrack.title }),
        /* @__PURE__ */ w.jsx("p", { children: v }),
        e != null && e.error ? /* @__PURE__ */ w.jsx("p", { className: "audio-error", children: e.error }) : null
      ] }),
      /* @__PURE__ */ w.jsx(ke, { variant: c ? "primary" : "ghost", onClick: f, children: c ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ w.jsx("div", { className: "audio-links", children: [y.musicTrack, ...y.ambientLayers].filter((S) => S == null ? void 0 : S.pageUrl).map((S) => /* @__PURE__ */ w.jsx("a", { href: S.pageUrl, target: "_blank", rel: "noreferrer", children: S.title || S.label || "Audio source" }, S.pageUrl)) })
  ] });
}
const yb = [
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
  return /* @__PURE__ */ w.jsxs(tn.aside, { className: `focus-utility-panel liquid-glass ${c}`.trim(), initial: { opacity: 0, y: 12, x: 18 }, animate: { opacity: 1, y: 0, x: 0 }, exit: { opacity: 0, y: 10, x: 18 }, transition: ta, role: "dialog", "aria-label": e, children: [
    /* @__PURE__ */ w.jsxs("div", { className: "drawer-head", children: [
      /* @__PURE__ */ w.jsxs("div", { className: "utility-title", children: [
        /* @__PURE__ */ w.jsx("span", { className: "utility-title-icon", children: i }),
        /* @__PURE__ */ w.jsxs("div", { children: [
          /* @__PURE__ */ w.jsx("span", { className: "focus-kicker", children: n }),
          /* @__PURE__ */ w.jsx("h2", { children: e })
        ] })
      ] }),
      /* @__PURE__ */ w.jsx(ke, { "aria-label": `Close ${e}`, onClick: a, children: /* @__PURE__ */ w.jsx(WC, { size: 16, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ w.jsx("div", { className: "utility-panel-body", children: o })
  ] });
}
function Vy({ audioState: e, scene: n }) {
  const i = G((v) => v.audioChannels), o = G((v) => v.setSound), [a, c] = C.useState(!1), d = (v, S) => {
    c(!1), o(`audioChannel:${v}`, S);
  }, f = () => {
    const v = co[Math.floor(Math.random() * co.length)], S = fo[Math.floor(Math.random() * fo.length)];
    o("musicType", v.label), o("ambientSound", S.label), c(!0);
  }, y = () => {
    o("musicType", (n == null ? void 0 : n.musicType) || "Deep Focus"), o("ambientSound", (n == null ? void 0 : n.ambientSound) || "Nature"), c(!0);
  };
  return /* @__PURE__ */ w.jsxs("div", { className: "sound-mixer", children: [
    /* @__PURE__ */ w.jsxs("div", { className: "mixer-featured-row", children: [
      /* @__PURE__ */ w.jsx("span", { className: "focus-kicker", children: "Music library" }),
      /* @__PURE__ */ w.jsxs(ke, { onClick: f, children: [
        /* @__PURE__ */ w.jsx(gC, { size: 14, "aria-hidden": "true" }),
        " Random track"
      ] })
    ] }),
    /* @__PURE__ */ w.jsx(mb, { audioState: e, compact: !0 }),
    /* @__PURE__ */ w.jsxs("div", { className: "mixer-preset-row", children: [
      /* @__PURE__ */ w.jsxs("button", { type: "button", className: "mixer-preset-button", onClick: y, children: [
        "Apply scene mix ",
        /* @__PURE__ */ w.jsx("span", { children: "↗" })
      ] }),
      /* @__PURE__ */ w.jsxs(ke, { onClick: () => c(!0), children: [
        a ? /* @__PURE__ */ w.jsx(pC, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ w.jsx(jC, { size: 14, "aria-hidden": "true" }),
        " ",
        a ? "Saved" : "Save current mix"
      ] })
    ] }),
    /* @__PURE__ */ w.jsx("div", { className: "mixer-channel-grid", children: yb.map(([v, S]) => /* @__PURE__ */ w.jsxs("label", { className: "mixer-channel", children: [
      /* @__PURE__ */ w.jsxs("span", { children: [
        /* @__PURE__ */ w.jsx("i", { className: `mixer-channel-dot mixer-${v}` }),
        S
      ] }),
      /* @__PURE__ */ w.jsxs("strong", { children: [
        i[v],
        "%"
      ] }),
      /* @__PURE__ */ w.jsx("input", { type: "range", min: "0", max: "100", value: i[v], "aria-label": `${S} volume`, onChange: (l) => d(v, l.target.value) })
    ] }, v)) }),
    e != null && e.error ? /* @__PURE__ */ w.jsx("p", { className: "audio-error", children: e.error }) : null
  ] });
}
function gb() {
  const e = () => {
    var o, a, c;
    return ((c = (a = (o = globalThis.window) == null ? void 0 : o.SynapseAuth) == null ? void 0 : a.getStoredSession) == null ? void 0 : c.call(a)) || null;
  }, [n, i] = C.useState(e);
  return C.useEffect(() => {
    var d, f, y, v;
    let o = !0;
    const a = (S) => {
      var l;
      o && i(((l = S == null ? void 0 : S.detail) == null ? void 0 : l.session) || e());
    };
    (d = globalThis.window) == null || d.addEventListener("synapse-auth-changed", a);
    const c = (v = (y = (f = globalThis.window) == null ? void 0 : f.SynapseAuth) == null ? void 0 : y.syncSessionFromProvider) == null ? void 0 : v.call(y);
    return Promise.resolve(c).finally(() => a()), () => {
      var S;
      o = !1, (S = globalThis.window) == null || S.removeEventListener("synapse-auth-changed", a);
    };
  }, []), n;
}
function vb({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ w.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ w.jsx(wa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ w.jsx("h3", { children: "Your Focus Trail" }),
    /* @__PURE__ */ w.jsx("p", { children: "Recent sessions and progress remain available through Synapse history." }),
    /* @__PURE__ */ w.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e("", "history"), children: "Open session history" })
  ] }) : /* @__PURE__ */ w.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ w.jsx(wa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ w.jsx("span", { className: "focus-kicker", children: "Your rhythm, remembered" }),
    /* @__PURE__ */ w.jsx("h3", { children: "Sign in to view your Focus Trail" }),
    /* @__PURE__ */ w.jsx("p", { children: "Track deep-work time, completed goals, and your study streak across devices." }),
    /* @__PURE__ */ w.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Sign in with Synapse" }),
    /* @__PURE__ */ w.jsx("small", { children: "Your current session continues without an account." })
  ] });
}
function Sb({ onWorkspace: e, session: n }) {
  return !!n ? /* @__PURE__ */ w.jsxs("div", { className: "utility-empty-state", children: [
    /* @__PURE__ */ w.jsx(xa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ w.jsx("h3", { children: "Companion Room" }),
    /* @__PURE__ */ w.jsx("p", { children: "Invite a study partner from your Synapse workspace to share this quiet room." }),
    /* @__PURE__ */ w.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e("", "companion"), children: "Open Companion Room" })
  ] }) : /* @__PURE__ */ w.jsxs("div", { className: "utility-login-state", children: [
    /* @__PURE__ */ w.jsx(xa, { size: 28, "aria-hidden": "true" }),
    /* @__PURE__ */ w.jsx("span", { className: "focus-kicker", children: "Study alongside someone" }),
    /* @__PURE__ */ w.jsx("h3", { children: "Sign in to use Companion Room" }),
    /* @__PURE__ */ w.jsx("p", { children: "Keep your own goal private while sharing the feeling of showing up together." }),
    /* @__PURE__ */ w.jsx(ke, { variant: "primary", onClick: () => e == null ? void 0 : e(), children: "Go to sign in" }),
    /* @__PURE__ */ w.jsx("small", { children: "No companion data is created in Focus Room." })
  ] });
}
function wb({ audioState: e, utilityPanel: n, onClose: i, onWorkspace: o }) {
  const a = G((S) => S.activeDrawer), c = G((S) => S.closeDrawer), d = G((S) => S.selectedScene), f = G((S) => S.openDrawer), y = gb(), v = C.useMemo(() => yn.find((S) => S.id === d) || yn[0], [d]);
  return /* @__PURE__ */ w.jsxs(Pa, { children: [
    n === "trail" ? /* @__PURE__ */ w.jsx(Xi, { title: "Focus Trail", kicker: "Your progress", icon: /* @__PURE__ */ w.jsx(wa, { size: 16 }), onClose: i, children: /* @__PURE__ */ w.jsx(vb, { onWorkspace: o, session: y }) }) : null,
    n === "companion" ? /* @__PURE__ */ w.jsx(Xi, { title: "Companion Room", kicker: "Shared focus", icon: /* @__PURE__ */ w.jsx(xa, { size: 16 }), onClose: i, children: /* @__PURE__ */ w.jsx(Sb, { onWorkspace: o, session: y }) }) : null,
    n === "settings" ? /* @__PURE__ */ w.jsxs(Xi, { title: "Room settings", kicker: "Customize your atmosphere", icon: /* @__PURE__ */ w.jsx(ho, { size: 16 }), onClose: i, className: "room-settings-utility", children: [
      /* @__PURE__ */ w.jsxs("div", { className: "settings-scene-summary", children: [
        /* @__PURE__ */ w.jsx("span", { className: "settings-scene-image", style: { backgroundImage: `url(${(v == null ? void 0 : v.image) || ""})` } }),
        /* @__PURE__ */ w.jsxs("div", { children: [
          /* @__PURE__ */ w.jsx("span", { className: "focus-kicker", children: "Current scene" }),
          /* @__PURE__ */ w.jsx("strong", { children: v == null ? void 0 : v.name }),
          /* @__PURE__ */ w.jsx("small", { children: v == null ? void 0 : v.description })
        ] })
      ] }),
      /* @__PURE__ */ w.jsx(ke, { onClick: () => {
        i == null || i(), f("scene");
      }, children: "Change scene" }),
      /* @__PURE__ */ w.jsx("h3", { className: "utility-section-title", children: "Sound mixer" }),
      /* @__PURE__ */ w.jsx(Vy, { audioState: e, scene: v })
    ] }) : null,
    !n && a === "scene" ? /* @__PURE__ */ w.jsx(Xi, { title: "Choose scene", kicker: "Scene", icon: /* @__PURE__ */ w.jsx(ho, { size: 16 }), onClose: c, children: /* @__PURE__ */ w.jsx(r0, {}) }) : null,
    !n && a === "music" ? /* @__PURE__ */ w.jsx(Xi, { title: "Sound atmosphere", kicker: "Room audio", icon: /* @__PURE__ */ w.jsx(Dd, { size: 16 }), onClose: c, children: /* @__PURE__ */ w.jsx(Vy, { audioState: e, scene: v }) }) : null
  ] });
}
function xb({ onExit: e }) {
  const n = G((v) => v.elapsedSeconds), i = G((v) => v.pomodoroDuration), o = G((v) => v.timerDurationSeconds), a = G((v) => v.timerMode), c = G((v) => v.timerStatus), d = G((v) => v.currentSession), f = Number(o) || (Number(i) || 0) * 60, y = a === "countup" ? n : Math.max(0, f - n);
  return /* @__PURE__ */ w.jsxs("div", { className: "compact-focus-mode-card", "aria-label": "Distraction-free focus timer", children: [
    /* @__PURE__ */ w.jsxs("div", { className: "compact-focus-card-top", children: [
      /* @__PURE__ */ w.jsxs("span", { children: [
        "POMODORO #",
        (d == null ? void 0 : d.pomodoroNumber) || 1
      ] }),
      /* @__PURE__ */ w.jsx(ke, { className: "compact-exit-button", onClick: e, "aria-label": "Exit Focus Mode", children: /* @__PURE__ */ w.jsx(TC, { size: 14, "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ w.jsxs("span", { className: "compact-focus-status", children: [
      /* @__PURE__ */ w.jsx("i", {}),
      c === "paused" ? "Paused" : "In focus"
    ] }),
    /* @__PURE__ */ w.jsx("strong", { children: ro(y) }),
    /* @__PURE__ */ w.jsx("div", { className: "compact-focus-progress", children: /* @__PURE__ */ w.jsx("span", { style: { width: `${f ? Math.min(100, Math.max(0, n / f * 100)) : 0}%` } }) }),
    /* @__PURE__ */ w.jsxs("small", { children: [
      i,
      " min session"
    ] }),
    /* @__PURE__ */ w.jsx("span", { className: "sr-only", children: "Press Escape to exit Focus Mode." })
  ] });
}
var rc = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var By;
function _b() {
  return By || (By = 1, (function(e) {
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
          if (l = parseFloat(l), h.ctx || S(), typeof l < "u" && l >= 0 && l <= 1) {
            if (h._volume = l, h._muted)
              return h;
            h.usingWebAudio && h.masterGain.gain.setValueAtTime(l, i.ctx.currentTime);
            for (var g = 0; g < h._howls.length; g++)
              if (!h._howls[g]._webAudio)
                for (var x = h._howls[g]._getSoundIds(), T = 0; T < x.length; T++) {
                  var k = h._howls[g]._soundById(x[T]);
                  k && k._node && (k._node.volume = k._volume * l);
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
          h.ctx || S(), h._muted = l, h.usingWebAudio && h.masterGain.gain.setValueAtTime(l ? 0 : h._volume, i.ctx.currentTime);
          for (var g = 0; g < h._howls.length; g++)
            if (!h._howls[g]._webAudio)
              for (var x = h._howls[g]._getSoundIds(), T = 0; T < x.length; T++) {
                var k = h._howls[g]._soundById(x[T]);
                k && k._node && (k._node.muted = l ? !0 : k._muted);
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
          return l.usingWebAudio && l.ctx && typeof l.ctx.close < "u" && (l.ctx.close(), l.ctx = null, S()), l;
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
          var g = h.canPlayType("audio/mpeg;").replace(/^no$/, ""), x = l._navigator ? l._navigator.userAgent : "", T = x.match(/OPR\/(\d+)/g), k = T && parseInt(T[0].split("/")[1], 10) < 33, A = x.indexOf("Safari") !== -1 && x.indexOf("Chrome") === -1, R = x.match(/Version\/(.*?) /), b = A && R && parseInt(R[1], 10) < 15;
          return l._codecs = {
            mp3: !!(!k && (g || h.canPlayType("audio/mp3;").replace(/^no$/, ""))),
            mpeg: !!g,
            opus: !!h.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
            ogg: !!h.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            oga: !!h.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            wav: !!(h.canPlayType('audio/wav; codecs="1"') || h.canPlayType("audio/wav")).replace(/^no$/, ""),
            aac: !!h.canPlayType("audio/aac;").replace(/^no$/, ""),
            caf: !!h.canPlayType("audio/x-caf;").replace(/^no$/, ""),
            m4a: !!(h.canPlayType("audio/x-m4a;") || h.canPlayType("audio/m4a;") || h.canPlayType("audio/aac;")).replace(/^no$/, ""),
            m4b: !!(h.canPlayType("audio/x-m4b;") || h.canPlayType("audio/m4b;") || h.canPlayType("audio/aac;")).replace(/^no$/, ""),
            mp4: !!(h.canPlayType("audio/x-mp4;") || h.canPlayType("audio/mp4;") || h.canPlayType("audio/aac;")).replace(/^no$/, ""),
            weba: !!(!b && h.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            webm: !!(!b && h.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
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
            var h = function(g) {
              for (; l._html5AudioPool.length < l.html5PoolSize; )
                try {
                  var x = new Audio();
                  x._unlocked = !0, l._releaseHtml5Audio(x);
                } catch {
                  l.noAudio = !0;
                  break;
                }
              for (var T = 0; T < l._howls.length; T++)
                if (!l._howls[T]._webAudio)
                  for (var k = l._howls[T]._getSoundIds(), A = 0; A < k.length; A++) {
                    var R = l._howls[T]._soundById(k[A]);
                    R && R._node && !R._node._unlocked && (R._node._unlocked = !0, R._node.load());
                  }
              l._autoResume();
              var b = l.ctx.createBufferSource();
              b.buffer = l._scratchBuffer, b.connect(l.ctx.destination), typeof b.start > "u" ? b.noteOn(0) : b.start(0), typeof l.ctx.resume == "function" && l.ctx.resume(), b.onended = function() {
                b.disconnect(0), l._audioUnlocked = !0, document.removeEventListener("touchstart", h, !0), document.removeEventListener("touchend", h, !0), document.removeEventListener("click", h, !0), document.removeEventListener("keydown", h, !0);
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
                for (var g = 0; g < l._howls[h]._sounds.length; g++)
                  if (!l._howls[h]._sounds[g]._paused)
                    return l;
              }
            return l._suspendTimer && clearTimeout(l._suspendTimer), l._suspendTimer = setTimeout(function() {
              if (l.autoSuspend) {
                l._suspendTimer = null, l.state = "suspending";
                var x = function() {
                  l.state = "suspended", l._resumeAfterSuspend && (delete l._resumeAfterSuspend, l._autoResume());
                };
                l.ctx.suspend().then(x, x);
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
          return i.ctx || S(), h._autoplay = l.autoplay || !1, h._format = typeof l.format != "string" ? l.format : [l.format], h._html5 = l.html5 || !1, h._muted = l.mute || !1, h._loop = l.loop || !1, h._pool = l.pool || 5, h._preload = typeof l.preload == "boolean" || l.preload === "metadata" ? l.preload : !0, h._rate = l.rate || 1, h._sprite = l.sprite || {}, h._src = typeof l.src != "string" ? l.src : [l.src], h._volume = l.volume !== void 0 ? l.volume : 1, h._xhr = {
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
          for (var g = 0; g < l._src.length; g++) {
            var x, T;
            if (l._format && l._format[g])
              x = l._format[g];
            else {
              if (T = l._src[g], typeof T != "string") {
                l._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              x = /^data:audio\/([^;,]+);/i.exec(T), x || (x = /\.([^.]+)$/.exec(T.split("?", 1)[0])), x && (x = x[1].toLowerCase());
            }
            if (x || console.warn('No file extension was found. Consider using the "format" property or specify an extension.'), x && i.codecs(x)) {
              h = l._src[g];
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
          var g = this, x = null;
          if (typeof l == "number")
            x = l, l = null;
          else {
            if (typeof l == "string" && g._state === "loaded" && !g._sprite[l])
              return null;
            if (typeof l > "u" && (l = "__default", !g._playLock)) {
              for (var T = 0, k = 0; k < g._sounds.length; k++)
                g._sounds[k]._paused && !g._sounds[k]._ended && (T++, x = g._sounds[k]._id);
              T === 1 ? l = null : x = null;
            }
          }
          var A = x ? g._soundById(x) : g._inactiveSound();
          if (!A)
            return null;
          if (x && !l && (l = A._sprite || "__default"), g._state !== "loaded") {
            A._sprite = l, A._ended = !1;
            var R = A._id;
            return g._queue.push({
              event: "play",
              action: function() {
                g.play(R);
              }
            }), R;
          }
          if (x && !A._paused)
            return h || g._loadQueue("play"), A._id;
          g._webAudio && i._autoResume();
          var b = Math.max(0, A._seek > 0 ? A._seek : g._sprite[l][0] / 1e3), D = Math.max(0, (g._sprite[l][0] + g._sprite[l][1]) / 1e3 - b), L = D * 1e3 / Math.abs(A._rate), K = g._sprite[l][0] / 1e3, Q = (g._sprite[l][0] + g._sprite[l][1]) / 1e3;
          A._sprite = l, A._ended = !1;
          var $ = function() {
            A._paused = !1, A._seek = b, A._start = K, A._stop = Q, A._loop = !!(A._loop || g._sprite[l][2]);
          };
          if (b >= Q) {
            g._ended(A);
            return;
          }
          var W = A._node;
          if (g._webAudio) {
            var X = function() {
              g._playLock = !1, $(), g._refreshBuffer(A);
              var pe = A._muted || g._muted ? 0 : A._volume;
              W.gain.setValueAtTime(pe, i.ctx.currentTime), A._playStart = i.ctx.currentTime, typeof W.bufferSource.start > "u" ? A._loop ? W.bufferSource.noteGrainOn(0, b, 86400) : W.bufferSource.noteGrainOn(0, b, D) : A._loop ? W.bufferSource.start(0, b, 86400) : W.bufferSource.start(0, b, D), L !== 1 / 0 && (g._endTimers[A._id] = setTimeout(g._ended.bind(g, A), L)), h || setTimeout(function() {
                g._emit("play", A._id), g._loadQueue();
              }, 0);
            };
            i.state === "running" && i.ctx.state !== "interrupted" ? X() : (g._playLock = !0, g.once("resume", X), g._clearTimer(A._id));
          } else {
            var J = function() {
              W.currentTime = b, W.muted = A._muted || g._muted || i._muted || W.muted, W.volume = A._volume * i.volume(), W.playbackRate = A._rate;
              try {
                var pe = W.play();
                if (pe && typeof Promise < "u" && (pe instanceof Promise || typeof pe.then == "function") ? (g._playLock = !0, $(), pe.then(function() {
                  g._playLock = !1, W._unlocked = !0, h ? g._loadQueue() : g._emit("play", A._id);
                }).catch(function() {
                  g._playLock = !1, g._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), A._ended = !0, A._paused = !0;
                })) : h || (g._playLock = !1, $(), g._emit("play", A._id)), W.playbackRate = A._rate, W.paused) {
                  g._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                l !== "__default" || A._loop ? g._endTimers[A._id] = setTimeout(g._ended.bind(g, A), L) : (g._endTimers[A._id] = function() {
                  g._ended(A), W.removeEventListener("ended", g._endTimers[A._id], !1);
                }, W.addEventListener("ended", g._endTimers[A._id], !1));
              } catch (we) {
                g._emit("playerror", A._id, we);
              }
            };
            W.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (W.src = g._src, W.load());
            var ce = window && window.ejecta || !W.readyState && i._navigator.isCocoonJS;
            if (W.readyState >= 3 || ce)
              J();
            else {
              g._playLock = !0, g._state = "loading";
              var me = function() {
                g._state = "loaded", J(), W.removeEventListener(i._canPlayEvent, me, !1);
              };
              W.addEventListener(i._canPlayEvent, me, !1), g._clearTimer(A._id);
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
          var h = this;
          if (h._state !== "loaded" || h._playLock)
            return h._queue.push({
              event: "pause",
              action: function() {
                h.pause(l);
              }
            }), h;
          for (var g = h._getSoundIds(l), x = 0; x < g.length; x++) {
            h._clearTimer(g[x]);
            var T = h._soundById(g[x]);
            if (T && !T._paused && (T._seek = h.seek(g[x]), T._rateSeek = 0, T._paused = !0, h._stopFade(g[x]), T._node))
              if (h._webAudio) {
                if (!T._node.bufferSource)
                  continue;
                typeof T._node.bufferSource.stop > "u" ? T._node.bufferSource.noteOff(0) : T._node.bufferSource.stop(0), h._cleanBuffer(T._node);
              } else (!isNaN(T._node.duration) || T._node.duration === 1 / 0) && T._node.pause();
            arguments[1] || h._emit("pause", T ? T._id : null);
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
          var g = this;
          if (g._state !== "loaded" || g._playLock)
            return g._queue.push({
              event: "stop",
              action: function() {
                g.stop(l);
              }
            }), g;
          for (var x = g._getSoundIds(l), T = 0; T < x.length; T++) {
            g._clearTimer(x[T]);
            var k = g._soundById(x[T]);
            k && (k._seek = k._start || 0, k._rateSeek = 0, k._paused = !0, k._ended = !0, g._stopFade(x[T]), k._node && (g._webAudio ? k._node.bufferSource && (typeof k._node.bufferSource.stop > "u" ? k._node.bufferSource.noteOff(0) : k._node.bufferSource.stop(0), g._cleanBuffer(k._node)) : (!isNaN(k._node.duration) || k._node.duration === 1 / 0) && (k._node.currentTime = k._start || 0, k._node.pause(), k._node.duration === 1 / 0 && g._clearSound(k._node))), h || g._emit("stop", k._id));
          }
          return g;
        },
        /**
         * Mute/unmute a single sound or all sounds in this Howl group.
         * @param  {Boolean} muted Set to true to mute and false to unmute.
         * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
         * @return {Howl}
         */
        mute: function(l, h) {
          var g = this;
          if (g._state !== "loaded" || g._playLock)
            return g._queue.push({
              event: "mute",
              action: function() {
                g.mute(l, h);
              }
            }), g;
          if (typeof h > "u")
            if (typeof l == "boolean")
              g._muted = l;
            else
              return g._muted;
          for (var x = g._getSoundIds(h), T = 0; T < x.length; T++) {
            var k = g._soundById(x[T]);
            k && (k._muted = l, k._interval && g._stopFade(k._id), g._webAudio && k._node ? k._node.gain.setValueAtTime(l ? 0 : k._volume, i.ctx.currentTime) : k._node && (k._node.muted = i._muted ? !0 : l), g._emit("mute", k._id));
          }
          return g;
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
          var l = this, h = arguments, g, x;
          if (h.length === 0)
            return l._volume;
          if (h.length === 1 || h.length === 2 && typeof h[1] > "u") {
            var T = l._getSoundIds(), k = T.indexOf(h[0]);
            k >= 0 ? x = parseInt(h[0], 10) : g = parseFloat(h[0]);
          } else h.length >= 2 && (g = parseFloat(h[0]), x = parseInt(h[1], 10));
          var A;
          if (typeof g < "u" && g >= 0 && g <= 1) {
            if (l._state !== "loaded" || l._playLock)
              return l._queue.push({
                event: "volume",
                action: function() {
                  l.volume.apply(l, h);
                }
              }), l;
            typeof x > "u" && (l._volume = g), x = l._getSoundIds(x);
            for (var R = 0; R < x.length; R++)
              A = l._soundById(x[R]), A && (A._volume = g, h[2] || l._stopFade(x[R]), l._webAudio && A._node && !A._muted ? A._node.gain.setValueAtTime(g, i.ctx.currentTime) : A._node && !A._muted && (A._node.volume = g * i.volume()), l._emit("volume", A._id));
          } else
            return A = x ? l._soundById(x) : l._sounds[0], A ? A._volume : 0;
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
        fade: function(l, h, g, x) {
          var T = this;
          if (T._state !== "loaded" || T._playLock)
            return T._queue.push({
              event: "fade",
              action: function() {
                T.fade(l, h, g, x);
              }
            }), T;
          l = Math.min(Math.max(0, parseFloat(l)), 1), h = Math.min(Math.max(0, parseFloat(h)), 1), g = parseFloat(g), T.volume(l, x);
          for (var k = T._getSoundIds(x), A = 0; A < k.length; A++) {
            var R = T._soundById(k[A]);
            if (R) {
              if (x || T._stopFade(k[A]), T._webAudio && !R._muted) {
                var b = i.ctx.currentTime, D = b + g / 1e3;
                R._volume = l, R._node.gain.setValueAtTime(l, b), R._node.gain.linearRampToValueAtTime(h, D);
              }
              T._startFadeInterval(R, l, h, g, k[A], typeof x > "u");
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
        _startFadeInterval: function(l, h, g, x, T, k) {
          var A = this, R = h, b = g - h, D = Math.abs(b / 0.01), L = Math.max(4, D > 0 ? x / D : x), K = Date.now();
          l._fadeTo = g, l._interval = setInterval(function() {
            var Q = (Date.now() - K) / x;
            K = Date.now(), R += b * Q, R = Math.round(R * 100) / 100, b < 0 ? R = Math.max(g, R) : R = Math.min(g, R), A._webAudio ? l._volume = R : A.volume(R, l._id, !0), k && (A._volume = R), (g < h && R <= g || g > h && R >= g) && (clearInterval(l._interval), l._interval = null, l._fadeTo = null, A.volume(g, l._id), A._emit("fade", l._id));
          }, L);
        },
        /**
         * Internal method that stops the currently playing fade when
         * a new fade starts, volume is changed or the sound is stopped.
         * @param  {Number} id The sound id.
         * @return {Howl}
         */
        _stopFade: function(l) {
          var h = this, g = h._soundById(l);
          return g && g._interval && (h._webAudio && g._node.gain.cancelScheduledValues(i.ctx.currentTime), clearInterval(g._interval), g._interval = null, h.volume(g._fadeTo, l), g._fadeTo = null, h._emit("fade", l)), h;
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
          var l = this, h = arguments, g, x, T;
          if (h.length === 0)
            return l._loop;
          if (h.length === 1)
            if (typeof h[0] == "boolean")
              g = h[0], l._loop = g;
            else
              return T = l._soundById(parseInt(h[0], 10)), T ? T._loop : !1;
          else h.length === 2 && (g = h[0], x = parseInt(h[1], 10));
          for (var k = l._getSoundIds(x), A = 0; A < k.length; A++)
            T = l._soundById(k[A]), T && (T._loop = g, l._webAudio && T._node && T._node.bufferSource && (T._node.bufferSource.loop = g, g && (T._node.bufferSource.loopStart = T._start || 0, T._node.bufferSource.loopEnd = T._stop, l.playing(k[A]) && (l.pause(k[A], !0), l.play(k[A], !0)))));
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
          var l = this, h = arguments, g, x;
          if (h.length === 0)
            x = l._sounds[0]._id;
          else if (h.length === 1) {
            var T = l._getSoundIds(), k = T.indexOf(h[0]);
            k >= 0 ? x = parseInt(h[0], 10) : g = parseFloat(h[0]);
          } else h.length === 2 && (g = parseFloat(h[0]), x = parseInt(h[1], 10));
          var A;
          if (typeof g == "number") {
            if (l._state !== "loaded" || l._playLock)
              return l._queue.push({
                event: "rate",
                action: function() {
                  l.rate.apply(l, h);
                }
              }), l;
            typeof x > "u" && (l._rate = g), x = l._getSoundIds(x);
            for (var R = 0; R < x.length; R++)
              if (A = l._soundById(x[R]), A) {
                l.playing(x[R]) && (A._rateSeek = l.seek(x[R]), A._playStart = l._webAudio ? i.ctx.currentTime : A._playStart), A._rate = g, l._webAudio && A._node && A._node.bufferSource ? A._node.bufferSource.playbackRate.setValueAtTime(g, i.ctx.currentTime) : A._node && (A._node.playbackRate = g);
                var b = l.seek(x[R]), D = (l._sprite[A._sprite][0] + l._sprite[A._sprite][1]) / 1e3 - b, L = D * 1e3 / Math.abs(A._rate);
                (l._endTimers[x[R]] || !A._paused) && (l._clearTimer(x[R]), l._endTimers[x[R]] = setTimeout(l._ended.bind(l, A), L)), l._emit("rate", A._id);
              }
          } else
            return A = l._soundById(x), A ? A._rate : l._rate;
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
          var l = this, h = arguments, g, x;
          if (h.length === 0)
            l._sounds.length && (x = l._sounds[0]._id);
          else if (h.length === 1) {
            var T = l._getSoundIds(), k = T.indexOf(h[0]);
            k >= 0 ? x = parseInt(h[0], 10) : l._sounds.length && (x = l._sounds[0]._id, g = parseFloat(h[0]));
          } else h.length === 2 && (g = parseFloat(h[0]), x = parseInt(h[1], 10));
          if (typeof x > "u")
            return 0;
          if (typeof g == "number" && (l._state !== "loaded" || l._playLock))
            return l._queue.push({
              event: "seek",
              action: function() {
                l.seek.apply(l, h);
              }
            }), l;
          var A = l._soundById(x);
          if (A)
            if (typeof g == "number" && g >= 0) {
              var R = l.playing(x);
              R && l.pause(x, !0), A._seek = g, A._ended = !1, l._clearTimer(x), !l._webAudio && A._node && !isNaN(A._node.duration) && (A._node.currentTime = g);
              var b = function() {
                R && l.play(x, !0), l._emit("seek", x);
              };
              if (R && !l._webAudio) {
                var D = function() {
                  l._playLock ? setTimeout(D, 0) : b();
                };
                setTimeout(D, 0);
              } else
                b();
            } else if (l._webAudio) {
              var L = l.playing(x) ? i.ctx.currentTime - A._playStart : 0, K = A._rateSeek ? A._rateSeek - A._seek : 0;
              return A._seek + (K + L * Math.abs(A._rate));
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
          var h = this;
          if (typeof l == "number") {
            var g = h._soundById(l);
            return g ? !g._paused : !1;
          }
          for (var x = 0; x < h._sounds.length; x++)
            if (!h._sounds[x]._paused)
              return !0;
          return !1;
        },
        /**
         * Get the duration of this sound. Passing a sound id will return the sprite duration.
         * @param  {Number} id The sound id to check. If none is passed, return full source duration.
         * @return {Number} Audio duration in seconds.
         */
        duration: function(l) {
          var h = this, g = h._duration, x = h._soundById(l);
          return x && (g = h._sprite[x._sprite][1] / 1e3), g;
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
          for (var l = this, h = l._sounds, g = 0; g < h.length; g++)
            h[g]._paused || l.stop(h[g]._id), l._webAudio || (l._clearSound(h[g]._node), h[g]._node.removeEventListener("error", h[g]._errorFn, !1), h[g]._node.removeEventListener(i._canPlayEvent, h[g]._loadFn, !1), h[g]._node.removeEventListener("ended", h[g]._endFn, !1), i._releaseHtml5Audio(h[g]._node)), delete h[g]._node, l._clearTimer(h[g]._id);
          var x = i._howls.indexOf(l);
          x >= 0 && i._howls.splice(x, 1);
          var T = !0;
          for (g = 0; g < i._howls.length; g++)
            if (i._howls[g]._src === l._src || l._src.indexOf(i._howls[g]._src) >= 0) {
              T = !1;
              break;
            }
          return c && T && delete c[l._src], i.noAudio = !1, l._state = "unloaded", l._sounds = [], l = null, null;
        },
        /**
         * Listen to a custom event.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
         * @return {Howl}
         */
        on: function(l, h, g, x) {
          var T = this, k = T["_on" + l];
          return typeof h == "function" && k.push(x ? { id: g, fn: h, once: x } : { id: g, fn: h }), T;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(l, h, g) {
          var x = this, T = x["_on" + l], k = 0;
          if (typeof h == "number" && (g = h, h = null), h || g)
            for (k = 0; k < T.length; k++) {
              var A = g === T[k].id;
              if (h === T[k].fn && A || !h && A) {
                T.splice(k, 1);
                break;
              }
            }
          else if (l)
            x["_on" + l] = [];
          else {
            var R = Object.keys(x);
            for (k = 0; k < R.length; k++)
              R[k].indexOf("_on") === 0 && Array.isArray(x[R[k]]) && (x[R[k]] = []);
          }
          return x;
        },
        /**
         * Listen to a custom event and remove it once fired.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @return {Howl}
         */
        once: function(l, h, g) {
          var x = this;
          return x.on(l, h, g, 1), x;
        },
        /**
         * Emit all events of a specific type and pass the sound id.
         * @param  {String} event Event name.
         * @param  {Number} id    Sound ID.
         * @param  {Number} msg   Message to go with event.
         * @return {Howl}
         */
        _emit: function(l, h, g) {
          for (var x = this, T = x["_on" + l], k = T.length - 1; k >= 0; k--)
            (!T[k].id || T[k].id === h || l === "load") && (setTimeout((function(A) {
              A.call(this, h, g);
            }).bind(x, T[k].fn), 0), T[k].once && x.off(l, T[k].fn, T[k].id));
          return x._loadQueue(l), x;
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
            var g = h._queue[0];
            g.event === l && (h._queue.shift(), h._loadQueue()), l || g.action();
          }
          return h;
        },
        /**
         * Fired when playback ends at the end of the duration.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _ended: function(l) {
          var h = this, g = l._sprite;
          if (!h._webAudio && l._node && !l._node.paused && !l._node.ended && l._node.currentTime < l._stop)
            return setTimeout(h._ended.bind(h, l), 100), h;
          var x = !!(l._loop || h._sprite[g][2]);
          if (h._emit("end", l._id), !h._webAudio && x && h.stop(l._id, !0).play(l._id), h._webAudio && x) {
            h._emit("play", l._id), l._seek = l._start || 0, l._rateSeek = 0, l._playStart = i.ctx.currentTime;
            var T = (l._stop - l._start) * 1e3 / Math.abs(l._rate);
            h._endTimers[l._id] = setTimeout(h._ended.bind(h, l), T);
          }
          return h._webAudio && !x && (l._paused = !0, l._ended = !0, l._seek = l._start || 0, l._rateSeek = 0, h._clearTimer(l._id), h._cleanBuffer(l._node), i._autoSuspend()), !h._webAudio && !x && h.stop(l._id, !0), h;
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
              var g = h._soundById(l);
              g && g._node && g._node.removeEventListener("ended", h._endTimers[l], !1);
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
          for (var h = this, g = 0; g < h._sounds.length; g++)
            if (l === h._sounds[g]._id)
              return h._sounds[g];
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
          var l = this, h = l._pool, g = 0, x = 0;
          if (!(l._sounds.length < h)) {
            for (x = 0; x < l._sounds.length; x++)
              l._sounds[x]._ended && g++;
            for (x = l._sounds.length - 1; x >= 0; x--) {
              if (g <= h)
                return;
              l._sounds[x]._ended && (l._webAudio && l._sounds[x]._node && l._sounds[x]._node.disconnect(0), l._sounds.splice(x, 1), g--);
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
            for (var g = [], x = 0; x < h._sounds.length; x++)
              g.push(h._sounds[x]._id);
            return g;
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
          var h = this, g = i._navigator && i._navigator.vendor.indexOf("Apple") >= 0;
          if (!l.bufferSource)
            return h;
          if (i._scratchBuffer && l.bufferSource && (l.bufferSource.onended = null, l.bufferSource.disconnect(0), g))
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
          var l = this, h = l._parent, g = i._muted || l._muted || l._parent._muted ? 0 : l._volume;
          return h._webAudio ? (l._node = typeof i.ctx.createGain > "u" ? i.ctx.createGainNode() : i.ctx.createGain(), l._node.gain.setValueAtTime(g, i.ctx.currentTime), l._node.paused = !0, l._node.connect(i.masterGain)) : i.noAudio || (l._node = i._obtainHtml5Audio(), l._errorFn = l._errorListener.bind(l), l._node.addEventListener("error", l._errorFn, !1), l._loadFn = l._loadListener.bind(l), l._node.addEventListener(i._canPlayEvent, l._loadFn, !1), l._endFn = l._endListener.bind(l), l._node.addEventListener("ended", l._endFn, !1), l._node.src = h._src, l._node.preload = h._preload === !0 ? "auto" : h._preload, l._node.volume = g * i.volume(), l._node.load()), l;
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
          l._duration = c[h].duration, v(l);
          return;
        }
        if (/^data:[^;]+;base64,/.test(h)) {
          for (var g = atob(h.split(",")[1]), x = new Uint8Array(g.length), T = 0; T < g.length; ++T)
            x[T] = g.charCodeAt(T);
          y(x.buffer, l);
        } else {
          var k = new XMLHttpRequest();
          k.open(l._xhr.method, h, !0), k.withCredentials = l._xhr.withCredentials, k.responseType = "arraybuffer", l._xhr.headers && Object.keys(l._xhr.headers).forEach(function(A) {
            k.setRequestHeader(A, l._xhr.headers[A]);
          }), k.onload = function() {
            var A = (k.status + "")[0];
            if (A !== "0" && A !== "2" && A !== "3") {
              l._emit("loaderror", null, "Failed loading audio file with status: " + k.status + ".");
              return;
            }
            y(k.response, l);
          }, k.onerror = function() {
            l._webAudio && (l._html5 = !0, l._webAudio = !1, l._sounds = [], delete c[h], l.load());
          }, f(k);
        }
      }, f = function(l) {
        try {
          l.send();
        } catch {
          l.onerror();
        }
      }, y = function(l, h) {
        var g = function() {
          h._emit("loaderror", null, "Decoding audio data failed.");
        }, x = function(T) {
          T && h._sounds.length > 0 ? (c[h._src] = T, v(h, T)) : g();
        };
        typeof Promise < "u" && i.ctx.decodeAudioData.length === 1 ? i.ctx.decodeAudioData(l).then(x).catch(g) : i.ctx.decodeAudioData(l, x, g);
      }, v = function(l, h) {
        h && !l._duration && (l._duration = h.duration), Object.keys(l._sprite).length === 0 && (l._sprite = { __default: [0, l._duration * 1e3] }), l._state !== "loaded" && (l._state = "loaded", l._emit("load"), l._loadQueue());
      }, S = function() {
        if (i.usingWebAudio) {
          try {
            typeof AudioContext < "u" ? i.ctx = new AudioContext() : typeof webkitAudioContext < "u" ? i.ctx = new webkitAudioContext() : i.usingWebAudio = !1;
          } catch {
            i.usingWebAudio = !1;
          }
          i.ctx || (i.usingWebAudio = !1);
          var l = /iP(hone|od|ad)/.test(i._navigator && i._navigator.platform), h = i._navigator && i._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), g = h ? parseInt(h[1], 10) : null;
          if (l && g && g < 9) {
            var x = /safari/.test(i._navigator && i._navigator.userAgent.toLowerCase());
            i._navigator && !x && (i.usingWebAudio = !1);
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
        var v = y._orientation;
        if (o = typeof o != "number" ? v[1] : o, a = typeof a != "number" ? v[2] : a, c = typeof c != "number" ? v[3] : c, d = typeof d != "number" ? v[4] : d, f = typeof f != "number" ? v[5] : f, typeof i == "number")
          y._orientation = [i, o, a, c, d, f], typeof y.ctx.listener.forwardX < "u" ? (y.ctx.listener.forwardX.setTargetAtTime(i, Howler.ctx.currentTime, 0.1), y.ctx.listener.forwardY.setTargetAtTime(o, Howler.ctx.currentTime, 0.1), y.ctx.listener.forwardZ.setTargetAtTime(a, Howler.ctx.currentTime, 0.1), y.ctx.listener.upX.setTargetAtTime(c, Howler.ctx.currentTime, 0.1), y.ctx.listener.upY.setTargetAtTime(d, Howler.ctx.currentTime, 0.1), y.ctx.listener.upZ.setTargetAtTime(f, Howler.ctx.currentTime, 0.1)) : y.ctx.listener.setOrientation(i, o, a, c, d, f);
        else
          return v;
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
          var v = d._soundById(f[y]);
          if (v)
            if (typeof i == "number")
              v._pos = [i, o, a], v._node && ((!v._panner || v._panner.pan) && n(v, "spatial"), typeof v._panner.positionX < "u" ? (v._panner.positionX.setValueAtTime(i, Howler.ctx.currentTime), v._panner.positionY.setValueAtTime(o, Howler.ctx.currentTime), v._panner.positionZ.setValueAtTime(a, Howler.ctx.currentTime)) : v._panner.setPosition(i, o, a)), d._emit("pos", v._id);
            else
              return v._pos;
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
          var v = d._soundById(f[y]);
          if (v)
            if (typeof i == "number")
              v._orientation = [i, o, a], v._node && (v._panner || (v._pos || (v._pos = d._pos || [0, 0, -0.5]), n(v, "spatial")), typeof v._panner.orientationX < "u" ? (v._panner.orientationX.setValueAtTime(i, Howler.ctx.currentTime), v._panner.orientationY.setValueAtTime(o, Howler.ctx.currentTime), v._panner.orientationZ.setValueAtTime(a, Howler.ctx.currentTime)) : v._panner.setOrientation(i, o, a)), d._emit("orientation", v._id);
            else
              return v._orientation;
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
            var v = d._pannerAttr;
            v = {
              coneInnerAngle: typeof a.coneInnerAngle < "u" ? a.coneInnerAngle : v.coneInnerAngle,
              coneOuterAngle: typeof a.coneOuterAngle < "u" ? a.coneOuterAngle : v.coneOuterAngle,
              coneOuterGain: typeof a.coneOuterGain < "u" ? a.coneOuterGain : v.coneOuterGain,
              distanceModel: typeof a.distanceModel < "u" ? a.distanceModel : v.distanceModel,
              maxDistance: typeof a.maxDistance < "u" ? a.maxDistance : v.maxDistance,
              refDistance: typeof a.refDistance < "u" ? a.refDistance : v.refDistance,
              rolloffFactor: typeof a.rolloffFactor < "u" ? a.rolloffFactor : v.rolloffFactor,
              panningModel: typeof a.panningModel < "u" ? a.panningModel : v.panningModel
            };
            var S = d._panner;
            S || (d._pos || (d._pos = i._pos || [0, 0, -0.5]), n(d, "spatial"), S = d._panner), S.coneInnerAngle = v.coneInnerAngle, S.coneOuterAngle = v.coneOuterAngle, S.coneOuterGain = v.coneOuterGain, S.distanceModel = v.distanceModel, S.maxDistance = v.maxDistance, S.refDistance = v.refDistance, S.rolloffFactor = v.rolloffFactor, S.panningModel = v.panningModel;
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
  })(rc)), rc;
}
var Tb = _b();
const kb = /* @__PURE__ */ Yy(Tb), { Howl: eS } = kb, Kc = 500, Pt = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let lr = {}, oo = !1, Yc = "";
function yo() {
  return typeof eS == "function";
}
function ic(e, n = 50) {
  const i = Number(e), o = Number.isFinite(i) ? i : n;
  return Math.min(1, Math.max(0, o / 100));
}
function tS(e) {
  return new eS({
    src: [e],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function nS(e, n, i = Kc) {
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
function ja(e, { unload: n = !1 } = {}) {
  var i;
  e && (nS(e, 0, Math.min(Kc, 300)), (i = globalThis.setTimeout) == null || i.call(globalThis, () => {
    try {
      e.pause(), n && e.unload();
    } catch {
    }
  }, Math.min(Kc, 320)));
}
function Ab(e) {
  return !(e != null && e.streamUrl) || !yo() ? null : ((!Pt.music || Pt.music.__synapseSrc !== e.streamUrl) && (ja(Pt.music, { unload: !0 }), Pt.music = tS(e.streamUrl), Pt.music.__synapseSrc = e.streamUrl), Pt.music);
}
function Cb(e) {
  if (!(e != null && e.streamUrl) || !yo()) return null;
  const n = e.id || e.streamUrl, i = Pt.ambient.get(n);
  if (i && i.__synapseSrc === e.streamUrl) return i;
  ja(i, { unload: !0 });
  const o = tS(e.streamUrl);
  return o.__synapseSrc = e.streamUrl, Pt.ambient.set(n, o), o;
}
function Eb() {
  return [
    Pt.music,
    ...Pt.ambient.values()
  ].filter(Boolean);
}
function rS() {
  Eb().forEach((e) => ja(e));
}
function Pb(e) {
  for (const [n, i] of Pt.ambient.entries())
    e.has(n) || (ja(i, { unload: !0 }), Pt.ambient.delete(n));
}
function zy(e, n) {
  if (e)
    try {
      e.playing() || e.play(), nS(e, n), Yc = "";
    } catch (i) {
      Yc = (i == null ? void 0 : i.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function bb(e = {}) {
  lr = { ...lr, ...e };
  const n = Ma(lr);
  if (!yo()) return sa(n);
  if (!oo)
    return rS(), sa(n);
  const i = Ab(n.musicTrack), o = ic(lr.musicVolume, 60), a = ic(lr.ambientVolume, 50), c = /* @__PURE__ */ new Set(), d = [];
  return n.ambientLayers.forEach((f) => {
    var h;
    const y = f.id || f.streamUrl;
    c.add(y);
    const v = Cb(f), S = Number((h = lr.audioChannels) == null ? void 0 : h[f.id]), l = Number.isFinite(S) ? ic(S, 0) : Math.min(1, Math.max(0, a * (f.volumeBias ?? 1)));
    d.push([v, l]);
  }), Pb(c), zy(i, o), d.forEach(([f, y]) => zy(f, y)), sa(n);
}
function Mb(e) {
  return oo = !!e, oo || rS(), oo;
}
function sa(e = Ma(lr)) {
  var n, i, o, a;
  return {
    available: yo(),
    playing: oo && yo(),
    musicTitle: ((n = e.musicTrack) == null ? void 0 : n.title) || "",
    musicArtist: ((i = e.musicTrack) == null ? void 0 : i.artist) || "",
    musicPageUrl: ((o = e.musicTrack) == null ? void 0 : o.pageUrl) || "",
    musicAttribution: ((a = e.musicTrack) == null ? void 0 : a.attribution) || "",
    ambientTitles: e.ambientLayers.map((c) => c.title).filter(Boolean),
    ambientPageUrls: e.ambientLayers.map((c) => c.pageUrl).filter(Boolean),
    ambientAttributions: e.ambientLayers.map((c) => c.attribution).filter(Boolean),
    error: Yc
  };
}
const Rb = "synapse.focusRoom.audioPrefs.v1";
function Nb(e) {
  var n;
  try {
    (n = globalThis.localStorage) == null || n.setItem(Rb, JSON.stringify({
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
function Db() {
  const e = G((y) => y.musicType), n = G((y) => y.ambientSound), i = G((y) => y.musicVolume), o = G((y) => y.ambientVolume), a = G((y) => y.audioChannels), c = G((y) => y.audioPlaying), [d, f] = C.useState(() => sa(Ma({
    musicType: e,
    ambientSound: n
  })));
  return C.useEffect(() => {
    const y = { musicType: e, ambientSound: n, musicVolume: i, ambientVolume: o, audioChannels: a };
    let v = !1;
    return Mb(c), Nb(y), bb(y).then((S) => {
      v || f(S);
    }), () => {
      v = !0;
    };
  }, [n, o, a, c, e, i]), d;
}
function jb() {
  const e = G(), n = C.useCallback(async (o = "", a = "", c = {}) => {
    var S;
    e.pauseTimer({ pauseAudio: !0 }), e.closeSummary();
    const d = typeof o == "string" || typeof o == "number" ? o : "", f = typeof a == "string" ? a : "", y = Ib(f, c), v = String(d || e.selectedMaterialId || ((S = e.selectedMaterial) == null ? void 0 : S.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const l = globalThis.returnFromFocusRoomToWorkspace(v, y);
        l && typeof l.then == "function" && await l, Uy(y.action || f, y);
        return;
      } catch (l) {
        console.error("Could not return from Focus Room:", l);
      }
    globalThis.location.hash = "", Uy(y.action || f, y);
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
function iS(e) {
  const n = String(e || "").trim().toLowerCase();
  return ["flashcards", "quiz", "assistant", "mindmap", "timeline", "source", "notes"].includes(n) ? n : "";
}
function Ib(e, n = {}) {
  const i = n && typeof n == "object" && !Array.isArray(n) ? n : {}, o = iS(e || i.action);
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
function Uy(e, n = {}) {
  const i = iS(e);
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
function Fb(e = 3e3) {
  const n = G((o) => o.setIdle), i = G((o) => o.isIdle);
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
function Ob() {
  const e = G((o) => o.timerState || (o.timerStatus === "studying" ? "running" : o.timerStatus)), n = G((o) => o.view), i = G((o) => o.tickTimer);
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
function Lb() {
  const e = G((n) => n.selectedScene);
  return Hn(e);
}
function Vb(e) {
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
function Bb() {
  const [e, n] = C.useState(""), [i, o] = C.useState(!1), [a, c] = C.useState(!1), d = G((b) => b.view), f = Fb(3e3), y = Lb(), v = Db(), S = jb();
  Ob();
  const l = G(kx(Vb)), h = G((b) => b.summaryRecord), g = G((b) => b.endSession), x = G((b) => b.initializeFocusRoom), T = G((b) => b.openSetup), k = G((b) => b.showStudyHistory);
  C.useEffect(() => {
    x();
  }, [x]), C.useEffect(() => {
    l != null && l.materialId && bd(l.materialId, l);
  }, [l]), C.useEffect(() => {
    d === "session" || !h || Hv("focus-room");
  }, [h, d]), C.useEffect(() => {
    d !== "session" && (o(!1), n(""), c(!1));
  }, [d]), C.useEffect(() => {
    const b = (D) => {
      D.key === "Escape" && (i ? (D.preventDefault(), o(!1)) : e ? n("") : a && c(!1));
    };
    return window.addEventListener("keydown", b), () => window.removeEventListener("keydown", b);
  }, [a, i, e]);
  const A = (...b) => {
    S.returnToWorkspace(...b);
  }, R = async () => {
    c(!1), o(!1), n(""), g(), await A();
  };
  return /* @__PURE__ */ w.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${f ? "is-idle" : ""} ${d === "setup" ? "is-innook-setup" : ""}`.trim(),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ w.jsx(tC, { scene: y }),
        /* @__PURE__ */ w.jsx(Pa, { mode: "wait", children: d === "landing" ? /* @__PURE__ */ w.jsx(
          tn.div,
          {
            className: "focus-room-view focus-landing-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: ta,
            children: /* @__PURE__ */ w.jsx(GC, { onStart: T, onWorkspace: A, onHistory: k })
          },
          "landing"
        ) : d === "setup" ? /* @__PURE__ */ w.jsx(
          tn.div,
          {
            className: "focus-room-view focus-setup-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: ta,
            children: /* @__PURE__ */ w.jsx(uE, {})
          },
          "setup"
        ) : /* @__PURE__ */ w.jsxs(
          tn.div,
          {
            className: "focus-room-view focus-session-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: ta,
            children: [
              i ? /* @__PURE__ */ w.jsx("button", { type: "button", className: "focus-mode-exit-hit-area", onClick: () => o(!1), children: "Exit Focus Mode" }) : /* @__PURE__ */ w.jsx(pE, { onWorkspace: A, onOpenTrail: () => n("trail"), onOpenCompanion: () => n("companion"), onOpenSettings: () => n("settings"), onExit: () => c(!0) }),
              /* @__PURE__ */ w.jsx("section", { className: `focus-session-stage ${i ? "is-focus-mode" : ""}`.trim(), children: /* @__PURE__ */ w.jsx("div", { className: "focus-session-grid", children: /* @__PURE__ */ w.jsx(fE, {}) }) }),
              i ? /* @__PURE__ */ w.jsx(xb, { onExit: () => o(!1) }) : /* @__PURE__ */ w.jsx(hE, { audioState: v, onFocusMode: () => o(!0) }),
              i ? null : /* @__PURE__ */ w.jsx(wb, { audioState: v, utilityPanel: e, onClose: () => n(""), onWorkspace: A }),
              /* @__PURE__ */ w.jsx(QP, {}),
              /* @__PURE__ */ w.jsx(zb, { open: a, onClose: () => c(!1), onConfirm: R })
            ]
          },
          "session"
        ) })
      ]
    }
  );
}
function zb({ open: e, onClose: n, onConfirm: i }) {
  return e ? /* @__PURE__ */ w.jsx("div", { className: "focus-exit-overlay", role: "presentation", children: /* @__PURE__ */ w.jsxs("div", { className: "focus-exit-dialog liquid-glass", role: "dialog", "aria-modal": "true", "aria-labelledby": "focus-exit-title", children: [
    /* @__PURE__ */ w.jsx("span", { className: "focus-kicker", children: "Leave this room?" }),
    /* @__PURE__ */ w.jsx("h2", { id: "focus-exit-title", children: "End focus session" }),
    /* @__PURE__ */ w.jsx("p", { children: "Your focused time will be saved to your Focus Trail." }),
    /* @__PURE__ */ w.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ w.jsx(ke, { onClick: n, children: "Continue focusing" }),
      /* @__PURE__ */ w.jsx(ke, { variant: "primary", onClick: i, children: "End and exit" })
    ] })
  ] }) }) : null;
}
let oc = null;
function Ub(e, n) {
  const i = globalThis.__synapseFocusRoomApi || {};
  if (typeof i[e] != "function") {
    console.warn(`Synapse Focus Room action "${e}" is not available yet.`);
    return;
  }
  return i[e](...n);
}
function $b() {
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
    globalThis[n] = (...o) => Ub(i, o);
  });
}
function Hb(e = {}) {
  $b();
  const n = e.root || document.getElementById("focusRoomRoot");
  if (!n)
    throw new Error("Focus Room root element was not found.");
  oc || (oc = Sx.createRoot(n), oc.render(
    mn.createElement(
      mn.StrictMode,
      null,
      mn.createElement(Bb)
    )
  ));
}
const Wb = "synapse.generated.history.v6", oS = "synapse.active.generated.v6", Gb = "synapse.flashcards.deck.v1", Kb = "synapse.quiz.history.v1", Yb = "synapse.focusRoom.return-target.v1";
function zd(e, n) {
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
function Qb(e, n) {
  var i;
  try {
    return (i = globalThis.localStorage) == null || i.setItem(e, n), !0;
  } catch (o) {
    return console.warn(`Could not write ${e}:`, o), !1;
  }
}
function Xb(e, n) {
  var i;
  try {
    return (i = globalThis.localStorage) == null || i.setItem(e, JSON.stringify(n)), !0;
  } catch (o) {
    return console.warn(`Could not write ${e}:`, o), !1;
  }
}
function sS() {
  const e = zd(Wb, []);
  return Array.isArray(e) ? e : [];
}
function Zb(e) {
  const n = String((e == null ? void 0 : e.title) || "").trim();
  return n || String((e == null ? void 0 : e.summary) || "").split(/\n+/).map((o) => o.replace(/^#+\s*/, "").trim()).find((o) => o.length > 4) || "Generated Study Notes";
}
function aS(e = {}) {
  return [
    e.id ? `history:${e.id}` : "",
    e.sourceFingerprint ? `fingerprint:${e.sourceFingerprint}` : "",
    e.clientFingerprint ? `fingerprint:${e.clientFingerprint}` : ""
  ].filter(Boolean);
}
function Jb(e = {}) {
  const n = zd(Gb, {}), o = aS(e).map((a) => n == null ? void 0 : n[a]).find((a) => a && Array.isArray(a.cards) && a.cards.length);
  return (o == null ? void 0 : o.cards) || [];
}
function qb(e = {}) {
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
function eM(e = []) {
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
function tM(e = {}) {
  const n = zd(Kb, {}), o = aS(e).flatMap((c) => Array.isArray(n == null ? void 0 : n[c]) ? n[c] : []), a = /* @__PURE__ */ new Set();
  return eM(o).filter((c) => {
    const d = qb(c);
    return !d || a.has(d) ? !1 : (a.add(d), !0);
  }).sort((c, d) => new Date(d.createdAt || 0) - new Date(c.createdAt || 0));
}
function nM(e = {}) {
  return {
    materialId: String(e.id || e.sourceFingerprint || e.clientFingerprint || "current-material"),
    materialTitle: Zb(e),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: e.summary || "",
    sections: e.sections || {},
    flashcards: Jb(e),
    quizzes: tM(e),
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
function lS() {
  return sS().filter((e) => e && (e.id || e.summary)).map(nM);
}
function uS(e = "") {
  const n = String(e || "");
  return n && lS().find(
    (i) => i.materialId === n || i.sourceFingerprint === n || i.clientFingerprint === n
  ) || null;
}
function cS() {
  var n;
  const e = ((n = globalThis.localStorage) == null ? void 0 : n.getItem(oS)) || "";
  return uS(e);
}
function rM(e = "") {
  var o;
  const n = e || ((o = cS()) == null ? void 0 : o.materialId) || "", i = n ? `/${encodeURIComponent(n)}` : "";
  globalThis.location.hash = `#/focus-room${i}`;
}
function iM(e = "", n = {}) {
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
async function oM(e = "", n = {}) {
  const i = String(e || ""), o = sS().find(
    (d) => String((d == null ? void 0 : d.id) || "") === i || String((d == null ? void 0 : d.sourceFingerprint) || (d == null ? void 0 : d.source_fingerprint) || "") === i || String((d == null ? void 0 : d.clientFingerprint) || (d == null ? void 0 : d.client_fingerprint) || "") === i
  ) || null, a = String((o == null ? void 0 : o.id) || "");
  a && Qb(oS, a);
  const c = iM(a, n);
  c.action && Xb(Yb, c), globalThis.location.href = a ? `index.html?focusReturn=${encodeURIComponent(a)}` : "index.html";
}
function sM() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: cS,
    getSynapseFocusRoomMaterial: uS,
    getSynapseFocusRoomMaterials: lS,
    openSynapseFocusRoom: rM,
    returnFromFocusRoomToWorkspace: oM
  });
}
const dS = document.getElementById("focusRoomRoot");
if (!dS)
  throw new Error("Focus Room root element was not found.");
var Wy;
(Wy = document.getElementById("focusRoomFallbackTitle")) == null || Wy.remove();
globalThis.apiClient = new Ky(dx);
sM();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
Hb({ root: dS });
