function kk(t, e) {
  for (var n = 0; n < e.length; n++) {
    const r = e[n];
    if (typeof r != "string" && !Array.isArray(r)) {
      for (const s in r)
        if (s !== "default" && !(s in t)) {
          const a = Object.getOwnPropertyDescriptor(r, s);
          a && Object.defineProperty(t, s, a.get ? a : {
            enumerable: !0,
            get: () => r[s]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }));
}
function bk(t) {
  const n = String(t || "").toLowerCase().split(".");
  if (n.length !== 4 || n.some((s) => !/^\d+$/.test(s))) return !1;
  const r = n.map(Number);
  return r.some((s) => s < 0 || s > 255) ? !1 : r[0] === 10 || r[0] === 172 && r[1] >= 16 && r[1] <= 31 || r[0] === 192 && r[1] === 168;
}
function V_(t) {
  const e = String(t || "").toLowerCase();
  return e === "127.0.0.1" || e === "localhost" || e === "::1" || e === "[::1]";
}
function rv(t) {
  return V_(t) || bk(t);
}
function Ck(t) {
  return !t || V_(t) ? "127.0.0.1" : t;
}
const Pk = (() => {
  var c, f, m, g;
  const { protocol: t, hostname: e, port: n } = window.location, r = String(window.SYNAPSE_BACKEND_PORT || ((f = (c = document.body) == null ? void 0 : c.dataset) == null ? void 0 : f.apiPort) || "8001").trim(), s = `http://${Ck(e)}:${r || "8001"}`, a = String(window.SYNAPSE_API_BASE || ((g = (m = document.body) == null ? void 0 : m.dataset) == null ? void 0 : g.apiBase) || "").replace(/\/+$/, ""), l = `${t}//${window.location.host}`.replace(/\/+$/, "");
  return a && !(rv(e) && n !== r && a === l) ? a : t === "file:" || rv(e) && n !== r ? s : `${t}//${window.location.host}`;
})();
class _l extends Error {
  constructor(e, { cause: n } = {}) {
    super(e), this.name = "ApiConnectionError", this.cause = n;
  }
}
const iv = "synapse.client.id.v1";
function Sr() {
  return globalThis.window || globalThis;
}
function zi(t, e = 220) {
  return String(t || "").replace(/[\r\n]+/g, " ").trim().slice(0, e);
}
function sv() {
  const t = globalThis.crypto || Sr().crypto;
  return t != null && t.randomUUID ? t.randomUUID() : `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
function Ek() {
  var e, n;
  const t = Sr();
  try {
    const r = (e = t.localStorage) == null ? void 0 : e.getItem(iv);
    if (r) return r;
    const s = sv();
    return (n = t.localStorage) == null || n.setItem(iv, s), s;
  } catch {
    return sv();
  }
}
function Mk(t = {}) {
  if (typeof Headers < "u" && t instanceof Headers) {
    const e = {};
    return t.forEach((n, r) => {
      e[r] = n;
    }), e;
  }
  return Array.isArray(t) ? Object.fromEntries(t) : { ...t || {} };
}
class B_ {
  constructor(e, { fetchImpl: n } = {}) {
    var s, a;
    const r = Sr();
    this.baseUrl = String(e || "").replace(/\/+$/, ""), this.fetchImpl = n || ((s = r.fetch) == null ? void 0 : s.bind(r)) || ((a = globalThis.fetch) == null ? void 0 : a.bind(globalThis));
  }
  endpoint(e) {
    const n = String(e || "").replace(/^\/+/, "");
    return `${this.baseUrl}/${n}`;
  }
  timeoutMessage(e) {
    return `Synapse backend did not respond within ${Math.max(1, Math.round(Number(e || 0) / 1e3))} seconds. Try a smaller source set or increase window.SYNAPSE_ANALYSIS_TIMEOUT_MS.`;
  }
  isLocalBackend() {
    try {
      const e = new URL(this.baseUrl).hostname.toLowerCase();
      return e === "localhost" || e === "127.0.0.1" || e === "0.0.0.0";
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
  async requestHeaders(e = {}) {
    var a, l, c;
    const n = Sr(), r = Mk(e);
    r["X-Synapse-Client-Id"] = zi(Ek(), 160);
    const s = (l = (a = n.SynapseAuth) == null ? void 0 : a.getStoredSession) == null ? void 0 : l.call(a);
    if (s && typeof s == "object" && (s.accountId && (r["X-Synapse-User-Id"] = zi(s.accountId, 160)), s.email && (r["X-Synapse-User-Email"] = zi(s.email, 220)), s.displayName && (r["X-Synapse-User-Name"] = zi(s.displayName, 180)), s.authMode && (r["X-Synapse-Auth-Mode"] = zi(s.authMode, 60)), s.role && (r["X-Synapse-User-Role"] = zi(s.role, 80))), (c = n.SynapseAuth) != null && c.authHeaders && !r.Authorization && !r.authorization)
      try {
        const f = await n.SynapseAuth.authHeaders({});
        f != null && f.Authorization && (r.Authorization = f.Authorization), f != null && f.authorization && (r.authorization = f.authorization);
      } catch (f) {
        console.warn("Synapse auth headers were not attached:", f);
      }
    return r;
  }
  async fetch(e, n = {}) {
    var d;
    const r = this.endpoint(e), { timeoutMs: s, ...a } = n || {};
    a.headers = await this.requestHeaders(a.headers || {});
    const l = Number(s || 0);
    let c = null, f = null, m = null;
    const g = a.signal;
    l > 0 && typeof AbortController < "u" && (c = new AbortController(), m = () => c.abort(), g && (g.aborted ? c.abort() : g.addEventListener("abort", m, { once: !0 })), f = Sr().setTimeout(() => c.abort(), l), a.signal = c.signal);
    try {
      return await this.fetchImpl(r, a);
    } catch (p) {
      throw (d = c == null ? void 0 : c.signal) != null && d.aborted ? new _l(this.timeoutMessage(l), { cause: p }) : new _l(this.connectionMessage(), { cause: p });
    } finally {
      f && Sr().clearTimeout(f), g && m && g.removeEventListener("abort", m);
    }
  }
  async warmup({ attempts: e = 2, retryDelayMs: n = 1500, timeoutMs: r = 6e4, maxWaitMs: s = 0, signal: a } = {}) {
    const l = Math.max(1, Math.floor(Number(e) || 1)), c = Math.max(0, Number(s) || 0), f = Date.now();
    let m = null;
    for (let g = 0; g < l; g += 1) {
      const d = Date.now() - f, p = c > 0 ? c - d : 0;
      if (c > 0 && p <= 0) break;
      try {
        const v = await this.fetch("/healthz", {
          method: "GET",
          signal: a,
          timeoutMs: c > 0 ? Math.min(r, p) : r
        });
        if (v != null && v.ok) return v;
        m = new _l(
          `Synapse hosted service returned ${(v == null ? void 0 : v.status) || "an unexpected status"} while preparing your analysis.`
        );
      } catch (v) {
        m = v;
      }
      if (g < l - 1 && n > 0) {
        const v = c > 0 ? c - (Date.now() - f) : n;
        if (c > 0 && v <= 0) break;
        await new Promise((w) => Sr().setTimeout(w, Math.min(n, v)));
      }
    }
    throw m || new _l(this.connectionMessage());
  }
  isRetryableResponse(e) {
    return [502, 503, 504].includes(Number(e == null ? void 0 : e.status));
  }
  async fetchWithRetry(e, n = {}, { attempts: r = 3, retryDelayMs: s = 3e3 } = {}) {
    const a = Math.max(1, Math.floor(Number(r) || 1));
    let l = null;
    for (let c = 0; c < a; c += 1) {
      if (l = await this.fetch(e, n), !this.isRetryableResponse(l) || c === a - 1) return l;
      s > 0 && await new Promise((f) => Sr().setTimeout(f, s));
    }
    return l;
  }
}
var co = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function U_(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var $d = { exports: {} }, ve = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ov;
function Rk() {
  if (ov) return ve;
  ov = 1;
  var t = Symbol.for("react.element"), e = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), s = Symbol.for("react.profiler"), a = Symbol.for("react.provider"), l = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), f = Symbol.for("react.suspense"), m = Symbol.for("react.memo"), g = Symbol.for("react.lazy"), d = Symbol.iterator;
  function p(j) {
    return j === null || typeof j != "object" ? null : (j = d && j[d] || j["@@iterator"], typeof j == "function" ? j : null);
  }
  var v = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, w = Object.assign, x = {};
  function T(j, I, q) {
    this.props = j, this.context = I, this.refs = x, this.updater = q || v;
  }
  T.prototype.isReactComponent = {}, T.prototype.setState = function(j, I) {
    if (typeof j != "object" && typeof j != "function" && j != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, j, I, "setState");
  }, T.prototype.forceUpdate = function(j) {
    this.updater.enqueueForceUpdate(this, j, "forceUpdate");
  };
  function A() {
  }
  A.prototype = T.prototype;
  function b(j, I, q) {
    this.props = j, this.context = I, this.refs = x, this.updater = q || v;
  }
  var C = b.prototype = new A();
  C.constructor = b, w(C, T.prototype), C.isPureReactComponent = !0;
  var M = Array.isArray, P = Object.prototype.hasOwnProperty, z = { current: null }, O = { key: !0, ref: !0, __self: !0, __source: !0 };
  function F(j, I, q) {
    var re, ge = {}, _e = null, ke = null;
    if (I != null) for (re in I.ref !== void 0 && (ke = I.ref), I.key !== void 0 && (_e = "" + I.key), I) P.call(I, re) && !O.hasOwnProperty(re) && (ge[re] = I[re]);
    var Te = arguments.length - 2;
    if (Te === 1) ge.children = q;
    else if (1 < Te) {
      for (var De = Array(Te), zt = 0; zt < Te; zt++) De[zt] = arguments[zt + 2];
      ge.children = De;
    }
    if (j && j.defaultProps) for (re in Te = j.defaultProps, Te) ge[re] === void 0 && (ge[re] = Te[re]);
    return { $$typeof: t, type: j, key: _e, ref: ke, props: ge, _owner: z.current };
  }
  function L(j, I) {
    return { $$typeof: t, type: j.type, key: I, ref: j.ref, props: j.props, _owner: j._owner };
  }
  function U(j) {
    return typeof j == "object" && j !== null && j.$$typeof === t;
  }
  function G(j) {
    var I = { "=": "=0", ":": "=2" };
    return "$" + j.replace(/[=:]/g, function(q) {
      return I[q];
    });
  }
  var te = /\/+/g;
  function ae(j, I) {
    return typeof j == "object" && j !== null && j.key != null ? G("" + j.key) : I.toString(36);
  }
  function le(j, I, q, re, ge) {
    var _e = typeof j;
    (_e === "undefined" || _e === "boolean") && (j = null);
    var ke = !1;
    if (j === null) ke = !0;
    else switch (_e) {
      case "string":
      case "number":
        ke = !0;
        break;
      case "object":
        switch (j.$$typeof) {
          case t:
          case e:
            ke = !0;
        }
    }
    if (ke) return ke = j, ge = ge(ke), j = re === "" ? "." + ae(ke, 0) : re, M(ge) ? (q = "", j != null && (q = j.replace(te, "$&/") + "/"), le(ge, I, q, "", function(zt) {
      return zt;
    })) : ge != null && (U(ge) && (ge = L(ge, q + (!ge.key || ke && ke.key === ge.key ? "" : ("" + ge.key).replace(te, "$&/") + "/") + j)), I.push(ge)), 1;
    if (ke = 0, re = re === "" ? "." : re + ":", M(j)) for (var Te = 0; Te < j.length; Te++) {
      _e = j[Te];
      var De = re + ae(_e, Te);
      ke += le(_e, I, q, De, ge);
    }
    else if (De = p(j), typeof De == "function") for (j = De.call(j), Te = 0; !(_e = j.next()).done; ) _e = _e.value, De = re + ae(_e, Te++), ke += le(_e, I, q, De, ge);
    else if (_e === "object") throw I = String(j), Error("Objects are not valid as a React child (found: " + (I === "[object Object]" ? "object with keys {" + Object.keys(j).join(", ") + "}" : I) + "). If you meant to render a collection of children, use an array instead.");
    return ke;
  }
  function me(j, I, q) {
    if (j == null) return j;
    var re = [], ge = 0;
    return le(j, re, "", "", function(_e) {
      return I.call(q, _e, ge++);
    }), re;
  }
  function ee(j) {
    if (j._status === -1) {
      var I = j._result;
      I = I(), I.then(function(q) {
        (j._status === 0 || j._status === -1) && (j._status = 1, j._result = q);
      }, function(q) {
        (j._status === 0 || j._status === -1) && (j._status = 2, j._result = q);
      }), j._status === -1 && (j._status = 0, j._result = I);
    }
    if (j._status === 1) return j._result.default;
    throw j._result;
  }
  var de = { current: null }, W = { transition: null }, J = { ReactCurrentDispatcher: de, ReactCurrentBatchConfig: W, ReactCurrentOwner: z };
  function X() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return ve.Children = { map: me, forEach: function(j, I, q) {
    me(j, function() {
      I.apply(this, arguments);
    }, q);
  }, count: function(j) {
    var I = 0;
    return me(j, function() {
      I++;
    }), I;
  }, toArray: function(j) {
    return me(j, function(I) {
      return I;
    }) || [];
  }, only: function(j) {
    if (!U(j)) throw Error("React.Children.only expected to receive a single React element child.");
    return j;
  } }, ve.Component = T, ve.Fragment = n, ve.Profiler = s, ve.PureComponent = b, ve.StrictMode = r, ve.Suspense = f, ve.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = J, ve.act = X, ve.cloneElement = function(j, I, q) {
    if (j == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + j + ".");
    var re = w({}, j.props), ge = j.key, _e = j.ref, ke = j._owner;
    if (I != null) {
      if (I.ref !== void 0 && (_e = I.ref, ke = z.current), I.key !== void 0 && (ge = "" + I.key), j.type && j.type.defaultProps) var Te = j.type.defaultProps;
      for (De in I) P.call(I, De) && !O.hasOwnProperty(De) && (re[De] = I[De] === void 0 && Te !== void 0 ? Te[De] : I[De]);
    }
    var De = arguments.length - 2;
    if (De === 1) re.children = q;
    else if (1 < De) {
      Te = Array(De);
      for (var zt = 0; zt < De; zt++) Te[zt] = arguments[zt + 2];
      re.children = Te;
    }
    return { $$typeof: t, type: j.type, key: ge, ref: _e, props: re, _owner: ke };
  }, ve.createContext = function(j) {
    return j = { $$typeof: l, _currentValue: j, _currentValue2: j, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, j.Provider = { $$typeof: a, _context: j }, j.Consumer = j;
  }, ve.createElement = F, ve.createFactory = function(j) {
    var I = F.bind(null, j);
    return I.type = j, I;
  }, ve.createRef = function() {
    return { current: null };
  }, ve.forwardRef = function(j) {
    return { $$typeof: c, render: j };
  }, ve.isValidElement = U, ve.lazy = function(j) {
    return { $$typeof: g, _payload: { _status: -1, _result: j }, _init: ee };
  }, ve.memo = function(j, I) {
    return { $$typeof: m, type: j, compare: I === void 0 ? null : I };
  }, ve.startTransition = function(j) {
    var I = W.transition;
    W.transition = {};
    try {
      j();
    } finally {
      W.transition = I;
    }
  }, ve.unstable_act = X, ve.useCallback = function(j, I) {
    return de.current.useCallback(j, I);
  }, ve.useContext = function(j) {
    return de.current.useContext(j);
  }, ve.useDebugValue = function() {
  }, ve.useDeferredValue = function(j) {
    return de.current.useDeferredValue(j);
  }, ve.useEffect = function(j, I) {
    return de.current.useEffect(j, I);
  }, ve.useId = function() {
    return de.current.useId();
  }, ve.useImperativeHandle = function(j, I, q) {
    return de.current.useImperativeHandle(j, I, q);
  }, ve.useInsertionEffect = function(j, I) {
    return de.current.useInsertionEffect(j, I);
  }, ve.useLayoutEffect = function(j, I) {
    return de.current.useLayoutEffect(j, I);
  }, ve.useMemo = function(j, I) {
    return de.current.useMemo(j, I);
  }, ve.useReducer = function(j, I, q) {
    return de.current.useReducer(j, I, q);
  }, ve.useRef = function(j) {
    return de.current.useRef(j);
  }, ve.useState = function(j) {
    return de.current.useState(j);
  }, ve.useSyncExternalStore = function(j, I, q) {
    return de.current.useSyncExternalStore(j, I, q);
  }, ve.useTransition = function() {
    return de.current.useTransition();
  }, ve.version = "18.3.1", ve;
}
var av;
function $h() {
  return av || (av = 1, $d.exports = Rk()), $d.exports;
}
var E = $h();
const Kn = /* @__PURE__ */ U_(E), Eu = /* @__PURE__ */ kk({
  __proto__: null,
  default: Kn
}, [E]);
var Sl = {}, Vd = { exports: {} }, Rt = {}, Bd = { exports: {} }, Ud = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lv;
function Nk() {
  return lv || (lv = 1, (function(t) {
    function e(W, J) {
      var X = W.length;
      W.push(J);
      e: for (; 0 < X; ) {
        var j = X - 1 >>> 1, I = W[j];
        if (0 < s(I, J)) W[j] = J, W[X] = I, X = j;
        else break e;
      }
    }
    function n(W) {
      return W.length === 0 ? null : W[0];
    }
    function r(W) {
      if (W.length === 0) return null;
      var J = W[0], X = W.pop();
      if (X !== J) {
        W[0] = X;
        e: for (var j = 0, I = W.length, q = I >>> 1; j < q; ) {
          var re = 2 * (j + 1) - 1, ge = W[re], _e = re + 1, ke = W[_e];
          if (0 > s(ge, X)) _e < I && 0 > s(ke, ge) ? (W[j] = ke, W[_e] = X, j = _e) : (W[j] = ge, W[re] = X, j = re);
          else if (_e < I && 0 > s(ke, X)) W[j] = ke, W[_e] = X, j = _e;
          else break e;
        }
      }
      return J;
    }
    function s(W, J) {
      var X = W.sortIndex - J.sortIndex;
      return X !== 0 ? X : W.id - J.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var a = performance;
      t.unstable_now = function() {
        return a.now();
      };
    } else {
      var l = Date, c = l.now();
      t.unstable_now = function() {
        return l.now() - c;
      };
    }
    var f = [], m = [], g = 1, d = null, p = 3, v = !1, w = !1, x = !1, T = typeof setTimeout == "function" ? setTimeout : null, A = typeof clearTimeout == "function" ? clearTimeout : null, b = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function C(W) {
      for (var J = n(m); J !== null; ) {
        if (J.callback === null) r(m);
        else if (J.startTime <= W) r(m), J.sortIndex = J.expirationTime, e(f, J);
        else break;
        J = n(m);
      }
    }
    function M(W) {
      if (x = !1, C(W), !w) if (n(f) !== null) w = !0, ee(P);
      else {
        var J = n(m);
        J !== null && de(M, J.startTime - W);
      }
    }
    function P(W, J) {
      w = !1, x && (x = !1, A(F), F = -1), v = !0;
      var X = p;
      try {
        for (C(J), d = n(f); d !== null && (!(d.expirationTime > J) || W && !G()); ) {
          var j = d.callback;
          if (typeof j == "function") {
            d.callback = null, p = d.priorityLevel;
            var I = j(d.expirationTime <= J);
            J = t.unstable_now(), typeof I == "function" ? d.callback = I : d === n(f) && r(f), C(J);
          } else r(f);
          d = n(f);
        }
        if (d !== null) var q = !0;
        else {
          var re = n(m);
          re !== null && de(M, re.startTime - J), q = !1;
        }
        return q;
      } finally {
        d = null, p = X, v = !1;
      }
    }
    var z = !1, O = null, F = -1, L = 5, U = -1;
    function G() {
      return !(t.unstable_now() - U < L);
    }
    function te() {
      if (O !== null) {
        var W = t.unstable_now();
        U = W;
        var J = !0;
        try {
          J = O(!0, W);
        } finally {
          J ? ae() : (z = !1, O = null);
        }
      } else z = !1;
    }
    var ae;
    if (typeof b == "function") ae = function() {
      b(te);
    };
    else if (typeof MessageChannel < "u") {
      var le = new MessageChannel(), me = le.port2;
      le.port1.onmessage = te, ae = function() {
        me.postMessage(null);
      };
    } else ae = function() {
      T(te, 0);
    };
    function ee(W) {
      O = W, z || (z = !0, ae());
    }
    function de(W, J) {
      F = T(function() {
        W(t.unstable_now());
      }, J);
    }
    t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(W) {
      W.callback = null;
    }, t.unstable_continueExecution = function() {
      w || v || (w = !0, ee(P));
    }, t.unstable_forceFrameRate = function(W) {
      0 > W || 125 < W ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : L = 0 < W ? Math.floor(1e3 / W) : 5;
    }, t.unstable_getCurrentPriorityLevel = function() {
      return p;
    }, t.unstable_getFirstCallbackNode = function() {
      return n(f);
    }, t.unstable_next = function(W) {
      switch (p) {
        case 1:
        case 2:
        case 3:
          var J = 3;
          break;
        default:
          J = p;
      }
      var X = p;
      p = J;
      try {
        return W();
      } finally {
        p = X;
      }
    }, t.unstable_pauseExecution = function() {
    }, t.unstable_requestPaint = function() {
    }, t.unstable_runWithPriority = function(W, J) {
      switch (W) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          W = 3;
      }
      var X = p;
      p = W;
      try {
        return J();
      } finally {
        p = X;
      }
    }, t.unstable_scheduleCallback = function(W, J, X) {
      var j = t.unstable_now();
      switch (typeof X == "object" && X !== null ? (X = X.delay, X = typeof X == "number" && 0 < X ? j + X : j) : X = j, W) {
        case 1:
          var I = -1;
          break;
        case 2:
          I = 250;
          break;
        case 5:
          I = 1073741823;
          break;
        case 4:
          I = 1e4;
          break;
        default:
          I = 5e3;
      }
      return I = X + I, W = { id: g++, callback: J, priorityLevel: W, startTime: X, expirationTime: I, sortIndex: -1 }, X > j ? (W.sortIndex = X, e(m, W), n(f) === null && W === n(m) && (x ? (A(F), F = -1) : x = !0, de(M, X - j))) : (W.sortIndex = I, e(f, W), w || v || (w = !0, ee(P))), W;
    }, t.unstable_shouldYield = G, t.unstable_wrapCallback = function(W) {
      var J = p;
      return function() {
        var X = p;
        p = J;
        try {
          return W.apply(this, arguments);
        } finally {
          p = X;
        }
      };
    };
  })(Ud)), Ud;
}
var uv;
function Ik() {
  return uv || (uv = 1, Bd.exports = Nk()), Bd.exports;
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
var cv;
function Dk() {
  if (cv) return Rt;
  cv = 1;
  var t = $h(), e = Ik();
  function n(i) {
    for (var o = "https://reactjs.org/docs/error-decoder.html?invariant=" + i, u = 1; u < arguments.length; u++) o += "&args[]=" + encodeURIComponent(arguments[u]);
    return "Minified React error #" + i + "; visit " + o + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var r = /* @__PURE__ */ new Set(), s = {};
  function a(i, o) {
    l(i, o), l(i + "Capture", o);
  }
  function l(i, o) {
    for (s[i] = o, i = 0; i < o.length; i++) r.add(o[i]);
  }
  var c = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), f = Object.prototype.hasOwnProperty, m = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, g = {}, d = {};
  function p(i) {
    return f.call(d, i) ? !0 : f.call(g, i) ? !1 : m.test(i) ? d[i] = !0 : (g[i] = !0, !1);
  }
  function v(i, o, u, h) {
    if (u !== null && u.type === 0) return !1;
    switch (typeof o) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return h ? !1 : u !== null ? !u.acceptsBooleans : (i = i.toLowerCase().slice(0, 5), i !== "data-" && i !== "aria-");
      default:
        return !1;
    }
  }
  function w(i, o, u, h) {
    if (o === null || typeof o > "u" || v(i, o, u, h)) return !0;
    if (h) return !1;
    if (u !== null) switch (u.type) {
      case 3:
        return !o;
      case 4:
        return o === !1;
      case 5:
        return isNaN(o);
      case 6:
        return isNaN(o) || 1 > o;
    }
    return !1;
  }
  function x(i, o, u, h, y, _, k) {
    this.acceptsBooleans = o === 2 || o === 3 || o === 4, this.attributeName = h, this.attributeNamespace = y, this.mustUseProperty = u, this.propertyName = i, this.type = o, this.sanitizeURL = _, this.removeEmptyString = k;
  }
  var T = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(i) {
    T[i] = new x(i, 0, !1, i, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(i) {
    var o = i[0];
    T[o] = new x(o, 1, !1, i[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(i) {
    T[i] = new x(i, 2, !1, i.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(i) {
    T[i] = new x(i, 2, !1, i, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(i) {
    T[i] = new x(i, 3, !1, i.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(i) {
    T[i] = new x(i, 3, !0, i, null, !1, !1);
  }), ["capture", "download"].forEach(function(i) {
    T[i] = new x(i, 4, !1, i, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(i) {
    T[i] = new x(i, 6, !1, i, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(i) {
    T[i] = new x(i, 5, !1, i.toLowerCase(), null, !1, !1);
  });
  var A = /[\-:]([a-z])/g;
  function b(i) {
    return i[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(i) {
    var o = i.replace(
      A,
      b
    );
    T[o] = new x(o, 1, !1, i, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(i) {
    var o = i.replace(A, b);
    T[o] = new x(o, 1, !1, i, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(i) {
    var o = i.replace(A, b);
    T[o] = new x(o, 1, !1, i, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(i) {
    T[i] = new x(i, 1, !1, i.toLowerCase(), null, !1, !1);
  }), T.xlinkHref = new x("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(i) {
    T[i] = new x(i, 1, !1, i.toLowerCase(), null, !0, !0);
  });
  function C(i, o, u, h) {
    var y = T.hasOwnProperty(o) ? T[o] : null;
    (y !== null ? y.type !== 0 : h || !(2 < o.length) || o[0] !== "o" && o[0] !== "O" || o[1] !== "n" && o[1] !== "N") && (w(o, u, y, h) && (u = null), h || y === null ? p(o) && (u === null ? i.removeAttribute(o) : i.setAttribute(o, "" + u)) : y.mustUseProperty ? i[y.propertyName] = u === null ? y.type === 3 ? !1 : "" : u : (o = y.attributeName, h = y.attributeNamespace, u === null ? i.removeAttribute(o) : (y = y.type, u = y === 3 || y === 4 && u === !0 ? "" : "" + u, h ? i.setAttributeNS(h, o, u) : i.setAttribute(o, u))));
  }
  var M = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, P = Symbol.for("react.element"), z = Symbol.for("react.portal"), O = Symbol.for("react.fragment"), F = Symbol.for("react.strict_mode"), L = Symbol.for("react.profiler"), U = Symbol.for("react.provider"), G = Symbol.for("react.context"), te = Symbol.for("react.forward_ref"), ae = Symbol.for("react.suspense"), le = Symbol.for("react.suspense_list"), me = Symbol.for("react.memo"), ee = Symbol.for("react.lazy"), de = Symbol.for("react.offscreen"), W = Symbol.iterator;
  function J(i) {
    return i === null || typeof i != "object" ? null : (i = W && i[W] || i["@@iterator"], typeof i == "function" ? i : null);
  }
  var X = Object.assign, j;
  function I(i) {
    if (j === void 0) try {
      throw Error();
    } catch (u) {
      var o = u.stack.trim().match(/\n( *(at )?)/);
      j = o && o[1] || "";
    }
    return `
` + j + i;
  }
  var q = !1;
  function re(i, o) {
    if (!i || q) return "";
    q = !0;
    var u = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (o) if (o = function() {
        throw Error();
      }, Object.defineProperty(o.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(o, []);
        } catch (B) {
          var h = B;
        }
        Reflect.construct(i, [], o);
      } else {
        try {
          o.call();
        } catch (B) {
          h = B;
        }
        i.call(o.prototype);
      }
      else {
        try {
          throw Error();
        } catch (B) {
          h = B;
        }
        i();
      }
    } catch (B) {
      if (B && h && typeof B.stack == "string") {
        for (var y = B.stack.split(`
`), _ = h.stack.split(`
`), k = y.length - 1, R = _.length - 1; 1 <= k && 0 <= R && y[k] !== _[R]; ) R--;
        for (; 1 <= k && 0 <= R; k--, R--) if (y[k] !== _[R]) {
          if (k !== 1 || R !== 1)
            do
              if (k--, R--, 0 > R || y[k] !== _[R]) {
                var N = `
` + y[k].replace(" at new ", " at ");
                return i.displayName && N.includes("<anonymous>") && (N = N.replace("<anonymous>", i.displayName)), N;
              }
            while (1 <= k && 0 <= R);
          break;
        }
      }
    } finally {
      q = !1, Error.prepareStackTrace = u;
    }
    return (i = i ? i.displayName || i.name : "") ? I(i) : "";
  }
  function ge(i) {
    switch (i.tag) {
      case 5:
        return I(i.type);
      case 16:
        return I("Lazy");
      case 13:
        return I("Suspense");
      case 19:
        return I("SuspenseList");
      case 0:
      case 2:
      case 15:
        return i = re(i.type, !1), i;
      case 11:
        return i = re(i.type.render, !1), i;
      case 1:
        return i = re(i.type, !0), i;
      default:
        return "";
    }
  }
  function _e(i) {
    if (i == null) return null;
    if (typeof i == "function") return i.displayName || i.name || null;
    if (typeof i == "string") return i;
    switch (i) {
      case O:
        return "Fragment";
      case z:
        return "Portal";
      case L:
        return "Profiler";
      case F:
        return "StrictMode";
      case ae:
        return "Suspense";
      case le:
        return "SuspenseList";
    }
    if (typeof i == "object") switch (i.$$typeof) {
      case G:
        return (i.displayName || "Context") + ".Consumer";
      case U:
        return (i._context.displayName || "Context") + ".Provider";
      case te:
        var o = i.render;
        return i = i.displayName, i || (i = o.displayName || o.name || "", i = i !== "" ? "ForwardRef(" + i + ")" : "ForwardRef"), i;
      case me:
        return o = i.displayName || null, o !== null ? o : _e(i.type) || "Memo";
      case ee:
        o = i._payload, i = i._init;
        try {
          return _e(i(o));
        } catch {
        }
    }
    return null;
  }
  function ke(i) {
    var o = i.type;
    switch (i.tag) {
      case 24:
        return "Cache";
      case 9:
        return (o.displayName || "Context") + ".Consumer";
      case 10:
        return (o._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return i = o.render, i = i.displayName || i.name || "", o.displayName || (i !== "" ? "ForwardRef(" + i + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return o;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return _e(o);
      case 8:
        return o === F ? "StrictMode" : "Mode";
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
        if (typeof o == "function") return o.displayName || o.name || null;
        if (typeof o == "string") return o;
    }
    return null;
  }
  function Te(i) {
    switch (typeof i) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return i;
      case "object":
        return i;
      default:
        return "";
    }
  }
  function De(i) {
    var o = i.type;
    return (i = i.nodeName) && i.toLowerCase() === "input" && (o === "checkbox" || o === "radio");
  }
  function zt(i) {
    var o = De(i) ? "checked" : "value", u = Object.getOwnPropertyDescriptor(i.constructor.prototype, o), h = "" + i[o];
    if (!i.hasOwnProperty(o) && typeof u < "u" && typeof u.get == "function" && typeof u.set == "function") {
      var y = u.get, _ = u.set;
      return Object.defineProperty(i, o, { configurable: !0, get: function() {
        return y.call(this);
      }, set: function(k) {
        h = "" + k, _.call(this, k);
      } }), Object.defineProperty(i, o, { enumerable: u.enumerable }), { getValue: function() {
        return h;
      }, setValue: function(k) {
        h = "" + k;
      }, stopTracking: function() {
        i._valueTracker = null, delete i[o];
      } };
    }
  }
  function ua(i) {
    i._valueTracker || (i._valueTracker = zt(i));
  }
  function um(i) {
    if (!i) return !1;
    var o = i._valueTracker;
    if (!o) return !0;
    var u = o.getValue(), h = "";
    return i && (h = De(i) ? i.checked ? "true" : "false" : i.value), i = h, i !== u ? (o.setValue(i), !0) : !1;
  }
  function ca(i) {
    if (i = i || (typeof document < "u" ? document : void 0), typeof i > "u") return null;
    try {
      return i.activeElement || i.body;
    } catch {
      return i.body;
    }
  }
  function Gu(i, o) {
    var u = o.checked;
    return X({}, o, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: u ?? i._wrapperState.initialChecked });
  }
  function cm(i, o) {
    var u = o.defaultValue == null ? "" : o.defaultValue, h = o.checked != null ? o.checked : o.defaultChecked;
    u = Te(o.value != null ? o.value : u), i._wrapperState = { initialChecked: h, initialValue: u, controlled: o.type === "checkbox" || o.type === "radio" ? o.checked != null : o.value != null };
  }
  function dm(i, o) {
    o = o.checked, o != null && C(i, "checked", o, !1);
  }
  function Ku(i, o) {
    dm(i, o);
    var u = Te(o.value), h = o.type;
    if (u != null) h === "number" ? (u === 0 && i.value === "" || i.value != u) && (i.value = "" + u) : i.value !== "" + u && (i.value = "" + u);
    else if (h === "submit" || h === "reset") {
      i.removeAttribute("value");
      return;
    }
    o.hasOwnProperty("value") ? Yu(i, o.type, u) : o.hasOwnProperty("defaultValue") && Yu(i, o.type, Te(o.defaultValue)), o.checked == null && o.defaultChecked != null && (i.defaultChecked = !!o.defaultChecked);
  }
  function fm(i, o, u) {
    if (o.hasOwnProperty("value") || o.hasOwnProperty("defaultValue")) {
      var h = o.type;
      if (!(h !== "submit" && h !== "reset" || o.value !== void 0 && o.value !== null)) return;
      o = "" + i._wrapperState.initialValue, u || o === i.value || (i.value = o), i.defaultValue = o;
    }
    u = i.name, u !== "" && (i.name = ""), i.defaultChecked = !!i._wrapperState.initialChecked, u !== "" && (i.name = u);
  }
  function Yu(i, o, u) {
    (o !== "number" || ca(i.ownerDocument) !== i) && (u == null ? i.defaultValue = "" + i._wrapperState.initialValue : i.defaultValue !== "" + u && (i.defaultValue = "" + u));
  }
  var ks = Array.isArray;
  function pi(i, o, u, h) {
    if (i = i.options, o) {
      o = {};
      for (var y = 0; y < u.length; y++) o["$" + u[y]] = !0;
      for (u = 0; u < i.length; u++) y = o.hasOwnProperty("$" + i[u].value), i[u].selected !== y && (i[u].selected = y), y && h && (i[u].defaultSelected = !0);
    } else {
      for (u = "" + Te(u), o = null, y = 0; y < i.length; y++) {
        if (i[y].value === u) {
          i[y].selected = !0, h && (i[y].defaultSelected = !0);
          return;
        }
        o !== null || i[y].disabled || (o = i[y]);
      }
      o !== null && (o.selected = !0);
    }
  }
  function qu(i, o) {
    if (o.dangerouslySetInnerHTML != null) throw Error(n(91));
    return X({}, o, { value: void 0, defaultValue: void 0, children: "" + i._wrapperState.initialValue });
  }
  function hm(i, o) {
    var u = o.value;
    if (u == null) {
      if (u = o.children, o = o.defaultValue, u != null) {
        if (o != null) throw Error(n(92));
        if (ks(u)) {
          if (1 < u.length) throw Error(n(93));
          u = u[0];
        }
        o = u;
      }
      o == null && (o = ""), u = o;
    }
    i._wrapperState = { initialValue: Te(u) };
  }
  function pm(i, o) {
    var u = Te(o.value), h = Te(o.defaultValue);
    u != null && (u = "" + u, u !== i.value && (i.value = u), o.defaultValue == null && i.defaultValue !== u && (i.defaultValue = u)), h != null && (i.defaultValue = "" + h);
  }
  function mm(i) {
    var o = i.textContent;
    o === i._wrapperState.initialValue && o !== "" && o !== null && (i.value = o);
  }
  function gm(i) {
    switch (i) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Qu(i, o) {
    return i == null || i === "http://www.w3.org/1999/xhtml" ? gm(o) : i === "http://www.w3.org/2000/svg" && o === "foreignObject" ? "http://www.w3.org/1999/xhtml" : i;
  }
  var da, ym = (function(i) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(o, u, h, y) {
      MSApp.execUnsafeLocalFunction(function() {
        return i(o, u, h, y);
      });
    } : i;
  })(function(i, o) {
    if (i.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in i) i.innerHTML = o;
    else {
      for (da = da || document.createElement("div"), da.innerHTML = "<svg>" + o.valueOf().toString() + "</svg>", o = da.firstChild; i.firstChild; ) i.removeChild(i.firstChild);
      for (; o.firstChild; ) i.appendChild(o.firstChild);
    }
  });
  function bs(i, o) {
    if (o) {
      var u = i.firstChild;
      if (u && u === i.lastChild && u.nodeType === 3) {
        u.nodeValue = o;
        return;
      }
    }
    i.textContent = o;
  }
  var Cs = {
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
  }, ET = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Cs).forEach(function(i) {
    ET.forEach(function(o) {
      o = o + i.charAt(0).toUpperCase() + i.substring(1), Cs[o] = Cs[i];
    });
  });
  function vm(i, o, u) {
    return o == null || typeof o == "boolean" || o === "" ? "" : u || typeof o != "number" || o === 0 || Cs.hasOwnProperty(i) && Cs[i] ? ("" + o).trim() : o + "px";
  }
  function _m(i, o) {
    i = i.style;
    for (var u in o) if (o.hasOwnProperty(u)) {
      var h = u.indexOf("--") === 0, y = vm(u, o[u], h);
      u === "float" && (u = "cssFloat"), h ? i.setProperty(u, y) : i[u] = y;
    }
  }
  var MT = X({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Xu(i, o) {
    if (o) {
      if (MT[i] && (o.children != null || o.dangerouslySetInnerHTML != null)) throw Error(n(137, i));
      if (o.dangerouslySetInnerHTML != null) {
        if (o.children != null) throw Error(n(60));
        if (typeof o.dangerouslySetInnerHTML != "object" || !("__html" in o.dangerouslySetInnerHTML)) throw Error(n(61));
      }
      if (o.style != null && typeof o.style != "object") throw Error(n(62));
    }
  }
  function Ju(i, o) {
    if (i.indexOf("-") === -1) return typeof o.is == "string";
    switch (i) {
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
  var ec = null;
  function tc(i) {
    return i = i.target || i.srcElement || window, i.correspondingUseElement && (i = i.correspondingUseElement), i.nodeType === 3 ? i.parentNode : i;
  }
  var nc = null, mi = null, gi = null;
  function Sm(i) {
    if (i = Ys(i)) {
      if (typeof nc != "function") throw Error(n(280));
      var o = i.stateNode;
      o && (o = Da(o), nc(i.stateNode, i.type, o));
    }
  }
  function xm(i) {
    mi ? gi ? gi.push(i) : gi = [i] : mi = i;
  }
  function wm() {
    if (mi) {
      var i = mi, o = gi;
      if (gi = mi = null, Sm(i), o) for (i = 0; i < o.length; i++) Sm(o[i]);
    }
  }
  function Tm(i, o) {
    return i(o);
  }
  function Am() {
  }
  var rc = !1;
  function km(i, o, u) {
    if (rc) return i(o, u);
    rc = !0;
    try {
      return Tm(i, o, u);
    } finally {
      rc = !1, (mi !== null || gi !== null) && (Am(), wm());
    }
  }
  function Ps(i, o) {
    var u = i.stateNode;
    if (u === null) return null;
    var h = Da(u);
    if (h === null) return null;
    u = h[o];
    e: switch (o) {
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
        (h = !h.disabled) || (i = i.type, h = !(i === "button" || i === "input" || i === "select" || i === "textarea")), i = !h;
        break e;
      default:
        i = !1;
    }
    if (i) return null;
    if (u && typeof u != "function") throw Error(n(231, o, typeof u));
    return u;
  }
  var ic = !1;
  if (c) try {
    var Es = {};
    Object.defineProperty(Es, "passive", { get: function() {
      ic = !0;
    } }), window.addEventListener("test", Es, Es), window.removeEventListener("test", Es, Es);
  } catch {
    ic = !1;
  }
  function RT(i, o, u, h, y, _, k, R, N) {
    var B = Array.prototype.slice.call(arguments, 3);
    try {
      o.apply(u, B);
    } catch (K) {
      this.onError(K);
    }
  }
  var Ms = !1, fa = null, ha = !1, sc = null, NT = { onError: function(i) {
    Ms = !0, fa = i;
  } };
  function IT(i, o, u, h, y, _, k, R, N) {
    Ms = !1, fa = null, RT.apply(NT, arguments);
  }
  function DT(i, o, u, h, y, _, k, R, N) {
    if (IT.apply(this, arguments), Ms) {
      if (Ms) {
        var B = fa;
        Ms = !1, fa = null;
      } else throw Error(n(198));
      ha || (ha = !0, sc = B);
    }
  }
  function jr(i) {
    var o = i, u = i;
    if (i.alternate) for (; o.return; ) o = o.return;
    else {
      i = o;
      do
        o = i, (o.flags & 4098) !== 0 && (u = o.return), i = o.return;
      while (i);
    }
    return o.tag === 3 ? u : null;
  }
  function bm(i) {
    if (i.tag === 13) {
      var o = i.memoizedState;
      if (o === null && (i = i.alternate, i !== null && (o = i.memoizedState)), o !== null) return o.dehydrated;
    }
    return null;
  }
  function Cm(i) {
    if (jr(i) !== i) throw Error(n(188));
  }
  function jT(i) {
    var o = i.alternate;
    if (!o) {
      if (o = jr(i), o === null) throw Error(n(188));
      return o !== i ? null : i;
    }
    for (var u = i, h = o; ; ) {
      var y = u.return;
      if (y === null) break;
      var _ = y.alternate;
      if (_ === null) {
        if (h = y.return, h !== null) {
          u = h;
          continue;
        }
        break;
      }
      if (y.child === _.child) {
        for (_ = y.child; _; ) {
          if (_ === u) return Cm(y), i;
          if (_ === h) return Cm(y), o;
          _ = _.sibling;
        }
        throw Error(n(188));
      }
      if (u.return !== h.return) u = y, h = _;
      else {
        for (var k = !1, R = y.child; R; ) {
          if (R === u) {
            k = !0, u = y, h = _;
            break;
          }
          if (R === h) {
            k = !0, h = y, u = _;
            break;
          }
          R = R.sibling;
        }
        if (!k) {
          for (R = _.child; R; ) {
            if (R === u) {
              k = !0, u = _, h = y;
              break;
            }
            if (R === h) {
              k = !0, h = _, u = y;
              break;
            }
            R = R.sibling;
          }
          if (!k) throw Error(n(189));
        }
      }
      if (u.alternate !== h) throw Error(n(190));
    }
    if (u.tag !== 3) throw Error(n(188));
    return u.stateNode.current === u ? i : o;
  }
  function Pm(i) {
    return i = jT(i), i !== null ? Em(i) : null;
  }
  function Em(i) {
    if (i.tag === 5 || i.tag === 6) return i;
    for (i = i.child; i !== null; ) {
      var o = Em(i);
      if (o !== null) return o;
      i = i.sibling;
    }
    return null;
  }
  var Mm = e.unstable_scheduleCallback, Rm = e.unstable_cancelCallback, FT = e.unstable_shouldYield, OT = e.unstable_requestPaint, Ge = e.unstable_now, LT = e.unstable_getCurrentPriorityLevel, oc = e.unstable_ImmediatePriority, Nm = e.unstable_UserBlockingPriority, pa = e.unstable_NormalPriority, zT = e.unstable_LowPriority, Im = e.unstable_IdlePriority, ma = null, wn = null;
  function $T(i) {
    if (wn && typeof wn.onCommitFiberRoot == "function") try {
      wn.onCommitFiberRoot(ma, i, void 0, (i.current.flags & 128) === 128);
    } catch {
    }
  }
  var dn = Math.clz32 ? Math.clz32 : UT, VT = Math.log, BT = Math.LN2;
  function UT(i) {
    return i >>>= 0, i === 0 ? 32 : 31 - (VT(i) / BT | 0) | 0;
  }
  var ga = 64, ya = 4194304;
  function Rs(i) {
    switch (i & -i) {
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
        return i & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return i & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return i;
    }
  }
  function va(i, o) {
    var u = i.pendingLanes;
    if (u === 0) return 0;
    var h = 0, y = i.suspendedLanes, _ = i.pingedLanes, k = u & 268435455;
    if (k !== 0) {
      var R = k & ~y;
      R !== 0 ? h = Rs(R) : (_ &= k, _ !== 0 && (h = Rs(_)));
    } else k = u & ~y, k !== 0 ? h = Rs(k) : _ !== 0 && (h = Rs(_));
    if (h === 0) return 0;
    if (o !== 0 && o !== h && (o & y) === 0 && (y = h & -h, _ = o & -o, y >= _ || y === 16 && (_ & 4194240) !== 0)) return o;
    if ((h & 4) !== 0 && (h |= u & 16), o = i.entangledLanes, o !== 0) for (i = i.entanglements, o &= h; 0 < o; ) u = 31 - dn(o), y = 1 << u, h |= i[u], o &= ~y;
    return h;
  }
  function HT(i, o) {
    switch (i) {
      case 1:
      case 2:
      case 4:
        return o + 250;
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
        return o + 5e3;
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
  function WT(i, o) {
    for (var u = i.suspendedLanes, h = i.pingedLanes, y = i.expirationTimes, _ = i.pendingLanes; 0 < _; ) {
      var k = 31 - dn(_), R = 1 << k, N = y[k];
      N === -1 ? ((R & u) === 0 || (R & h) !== 0) && (y[k] = HT(R, o)) : N <= o && (i.expiredLanes |= R), _ &= ~R;
    }
  }
  function ac(i) {
    return i = i.pendingLanes & -1073741825, i !== 0 ? i : i & 1073741824 ? 1073741824 : 0;
  }
  function Dm() {
    var i = ga;
    return ga <<= 1, (ga & 4194240) === 0 && (ga = 64), i;
  }
  function lc(i) {
    for (var o = [], u = 0; 31 > u; u++) o.push(i);
    return o;
  }
  function Ns(i, o, u) {
    i.pendingLanes |= o, o !== 536870912 && (i.suspendedLanes = 0, i.pingedLanes = 0), i = i.eventTimes, o = 31 - dn(o), i[o] = u;
  }
  function ZT(i, o) {
    var u = i.pendingLanes & ~o;
    i.pendingLanes = o, i.suspendedLanes = 0, i.pingedLanes = 0, i.expiredLanes &= o, i.mutableReadLanes &= o, i.entangledLanes &= o, o = i.entanglements;
    var h = i.eventTimes;
    for (i = i.expirationTimes; 0 < u; ) {
      var y = 31 - dn(u), _ = 1 << y;
      o[y] = 0, h[y] = -1, i[y] = -1, u &= ~_;
    }
  }
  function uc(i, o) {
    var u = i.entangledLanes |= o;
    for (i = i.entanglements; u; ) {
      var h = 31 - dn(u), y = 1 << h;
      y & o | i[h] & o && (i[h] |= o), u &= ~y;
    }
  }
  var Ae = 0;
  function jm(i) {
    return i &= -i, 1 < i ? 4 < i ? (i & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Fm, cc, Om, Lm, zm, dc = !1, _a = [], Xn = null, Jn = null, er = null, Is = /* @__PURE__ */ new Map(), Ds = /* @__PURE__ */ new Map(), tr = [], GT = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function $m(i, o) {
    switch (i) {
      case "focusin":
      case "focusout":
        Xn = null;
        break;
      case "dragenter":
      case "dragleave":
        Jn = null;
        break;
      case "mouseover":
      case "mouseout":
        er = null;
        break;
      case "pointerover":
      case "pointerout":
        Is.delete(o.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Ds.delete(o.pointerId);
    }
  }
  function js(i, o, u, h, y, _) {
    return i === null || i.nativeEvent !== _ ? (i = { blockedOn: o, domEventName: u, eventSystemFlags: h, nativeEvent: _, targetContainers: [y] }, o !== null && (o = Ys(o), o !== null && cc(o)), i) : (i.eventSystemFlags |= h, o = i.targetContainers, y !== null && o.indexOf(y) === -1 && o.push(y), i);
  }
  function KT(i, o, u, h, y) {
    switch (o) {
      case "focusin":
        return Xn = js(Xn, i, o, u, h, y), !0;
      case "dragenter":
        return Jn = js(Jn, i, o, u, h, y), !0;
      case "mouseover":
        return er = js(er, i, o, u, h, y), !0;
      case "pointerover":
        var _ = y.pointerId;
        return Is.set(_, js(Is.get(_) || null, i, o, u, h, y)), !0;
      case "gotpointercapture":
        return _ = y.pointerId, Ds.set(_, js(Ds.get(_) || null, i, o, u, h, y)), !0;
    }
    return !1;
  }
  function Vm(i) {
    var o = Fr(i.target);
    if (o !== null) {
      var u = jr(o);
      if (u !== null) {
        if (o = u.tag, o === 13) {
          if (o = bm(u), o !== null) {
            i.blockedOn = o, zm(i.priority, function() {
              Om(u);
            });
            return;
          }
        } else if (o === 3 && u.stateNode.current.memoizedState.isDehydrated) {
          i.blockedOn = u.tag === 3 ? u.stateNode.containerInfo : null;
          return;
        }
      }
    }
    i.blockedOn = null;
  }
  function Sa(i) {
    if (i.blockedOn !== null) return !1;
    for (var o = i.targetContainers; 0 < o.length; ) {
      var u = hc(i.domEventName, i.eventSystemFlags, o[0], i.nativeEvent);
      if (u === null) {
        u = i.nativeEvent;
        var h = new u.constructor(u.type, u);
        ec = h, u.target.dispatchEvent(h), ec = null;
      } else return o = Ys(u), o !== null && cc(o), i.blockedOn = u, !1;
      o.shift();
    }
    return !0;
  }
  function Bm(i, o, u) {
    Sa(i) && u.delete(o);
  }
  function YT() {
    dc = !1, Xn !== null && Sa(Xn) && (Xn = null), Jn !== null && Sa(Jn) && (Jn = null), er !== null && Sa(er) && (er = null), Is.forEach(Bm), Ds.forEach(Bm);
  }
  function Fs(i, o) {
    i.blockedOn === o && (i.blockedOn = null, dc || (dc = !0, e.unstable_scheduleCallback(e.unstable_NormalPriority, YT)));
  }
  function Os(i) {
    function o(y) {
      return Fs(y, i);
    }
    if (0 < _a.length) {
      Fs(_a[0], i);
      for (var u = 1; u < _a.length; u++) {
        var h = _a[u];
        h.blockedOn === i && (h.blockedOn = null);
      }
    }
    for (Xn !== null && Fs(Xn, i), Jn !== null && Fs(Jn, i), er !== null && Fs(er, i), Is.forEach(o), Ds.forEach(o), u = 0; u < tr.length; u++) h = tr[u], h.blockedOn === i && (h.blockedOn = null);
    for (; 0 < tr.length && (u = tr[0], u.blockedOn === null); ) Vm(u), u.blockedOn === null && tr.shift();
  }
  var yi = M.ReactCurrentBatchConfig, xa = !0;
  function qT(i, o, u, h) {
    var y = Ae, _ = yi.transition;
    yi.transition = null;
    try {
      Ae = 1, fc(i, o, u, h);
    } finally {
      Ae = y, yi.transition = _;
    }
  }
  function QT(i, o, u, h) {
    var y = Ae, _ = yi.transition;
    yi.transition = null;
    try {
      Ae = 4, fc(i, o, u, h);
    } finally {
      Ae = y, yi.transition = _;
    }
  }
  function fc(i, o, u, h) {
    if (xa) {
      var y = hc(i, o, u, h);
      if (y === null) Mc(i, o, h, wa, u), $m(i, h);
      else if (KT(y, i, o, u, h)) h.stopPropagation();
      else if ($m(i, h), o & 4 && -1 < GT.indexOf(i)) {
        for (; y !== null; ) {
          var _ = Ys(y);
          if (_ !== null && Fm(_), _ = hc(i, o, u, h), _ === null && Mc(i, o, h, wa, u), _ === y) break;
          y = _;
        }
        y !== null && h.stopPropagation();
      } else Mc(i, o, h, null, u);
    }
  }
  var wa = null;
  function hc(i, o, u, h) {
    if (wa = null, i = tc(h), i = Fr(i), i !== null) if (o = jr(i), o === null) i = null;
    else if (u = o.tag, u === 13) {
      if (i = bm(o), i !== null) return i;
      i = null;
    } else if (u === 3) {
      if (o.stateNode.current.memoizedState.isDehydrated) return o.tag === 3 ? o.stateNode.containerInfo : null;
      i = null;
    } else o !== i && (i = null);
    return wa = i, null;
  }
  function Um(i) {
    switch (i) {
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
        switch (LT()) {
          case oc:
            return 1;
          case Nm:
            return 4;
          case pa:
          case zT:
            return 16;
          case Im:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var nr = null, pc = null, Ta = null;
  function Hm() {
    if (Ta) return Ta;
    var i, o = pc, u = o.length, h, y = "value" in nr ? nr.value : nr.textContent, _ = y.length;
    for (i = 0; i < u && o[i] === y[i]; i++) ;
    var k = u - i;
    for (h = 1; h <= k && o[u - h] === y[_ - h]; h++) ;
    return Ta = y.slice(i, 1 < h ? 1 - h : void 0);
  }
  function Aa(i) {
    var o = i.keyCode;
    return "charCode" in i ? (i = i.charCode, i === 0 && o === 13 && (i = 13)) : i = o, i === 10 && (i = 13), 32 <= i || i === 13 ? i : 0;
  }
  function ka() {
    return !0;
  }
  function Wm() {
    return !1;
  }
  function $t(i) {
    function o(u, h, y, _, k) {
      this._reactName = u, this._targetInst = y, this.type = h, this.nativeEvent = _, this.target = k, this.currentTarget = null;
      for (var R in i) i.hasOwnProperty(R) && (u = i[R], this[R] = u ? u(_) : _[R]);
      return this.isDefaultPrevented = (_.defaultPrevented != null ? _.defaultPrevented : _.returnValue === !1) ? ka : Wm, this.isPropagationStopped = Wm, this;
    }
    return X(o.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var u = this.nativeEvent;
      u && (u.preventDefault ? u.preventDefault() : typeof u.returnValue != "unknown" && (u.returnValue = !1), this.isDefaultPrevented = ka);
    }, stopPropagation: function() {
      var u = this.nativeEvent;
      u && (u.stopPropagation ? u.stopPropagation() : typeof u.cancelBubble != "unknown" && (u.cancelBubble = !0), this.isPropagationStopped = ka);
    }, persist: function() {
    }, isPersistent: ka }), o;
  }
  var vi = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(i) {
    return i.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, mc = $t(vi), Ls = X({}, vi, { view: 0, detail: 0 }), XT = $t(Ls), gc, yc, zs, ba = X({}, Ls, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: _c, button: 0, buttons: 0, relatedTarget: function(i) {
    return i.relatedTarget === void 0 ? i.fromElement === i.srcElement ? i.toElement : i.fromElement : i.relatedTarget;
  }, movementX: function(i) {
    return "movementX" in i ? i.movementX : (i !== zs && (zs && i.type === "mousemove" ? (gc = i.screenX - zs.screenX, yc = i.screenY - zs.screenY) : yc = gc = 0, zs = i), gc);
  }, movementY: function(i) {
    return "movementY" in i ? i.movementY : yc;
  } }), Zm = $t(ba), JT = X({}, ba, { dataTransfer: 0 }), eA = $t(JT), tA = X({}, Ls, { relatedTarget: 0 }), vc = $t(tA), nA = X({}, vi, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), rA = $t(nA), iA = X({}, vi, { clipboardData: function(i) {
    return "clipboardData" in i ? i.clipboardData : window.clipboardData;
  } }), sA = $t(iA), oA = X({}, vi, { data: 0 }), Gm = $t(oA), aA = {
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
  }, lA = {
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
  }, uA = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function cA(i) {
    var o = this.nativeEvent;
    return o.getModifierState ? o.getModifierState(i) : (i = uA[i]) ? !!o[i] : !1;
  }
  function _c() {
    return cA;
  }
  var dA = X({}, Ls, { key: function(i) {
    if (i.key) {
      var o = aA[i.key] || i.key;
      if (o !== "Unidentified") return o;
    }
    return i.type === "keypress" ? (i = Aa(i), i === 13 ? "Enter" : String.fromCharCode(i)) : i.type === "keydown" || i.type === "keyup" ? lA[i.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: _c, charCode: function(i) {
    return i.type === "keypress" ? Aa(i) : 0;
  }, keyCode: function(i) {
    return i.type === "keydown" || i.type === "keyup" ? i.keyCode : 0;
  }, which: function(i) {
    return i.type === "keypress" ? Aa(i) : i.type === "keydown" || i.type === "keyup" ? i.keyCode : 0;
  } }), fA = $t(dA), hA = X({}, ba, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Km = $t(hA), pA = X({}, Ls, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: _c }), mA = $t(pA), gA = X({}, vi, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), yA = $t(gA), vA = X({}, ba, {
    deltaX: function(i) {
      return "deltaX" in i ? i.deltaX : "wheelDeltaX" in i ? -i.wheelDeltaX : 0;
    },
    deltaY: function(i) {
      return "deltaY" in i ? i.deltaY : "wheelDeltaY" in i ? -i.wheelDeltaY : "wheelDelta" in i ? -i.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), _A = $t(vA), SA = [9, 13, 27, 32], Sc = c && "CompositionEvent" in window, $s = null;
  c && "documentMode" in document && ($s = document.documentMode);
  var xA = c && "TextEvent" in window && !$s, Ym = c && (!Sc || $s && 8 < $s && 11 >= $s), qm = " ", Qm = !1;
  function Xm(i, o) {
    switch (i) {
      case "keyup":
        return SA.indexOf(o.keyCode) !== -1;
      case "keydown":
        return o.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Jm(i) {
    return i = i.detail, typeof i == "object" && "data" in i ? i.data : null;
  }
  var _i = !1;
  function wA(i, o) {
    switch (i) {
      case "compositionend":
        return Jm(o);
      case "keypress":
        return o.which !== 32 ? null : (Qm = !0, qm);
      case "textInput":
        return i = o.data, i === qm && Qm ? null : i;
      default:
        return null;
    }
  }
  function TA(i, o) {
    if (_i) return i === "compositionend" || !Sc && Xm(i, o) ? (i = Hm(), Ta = pc = nr = null, _i = !1, i) : null;
    switch (i) {
      case "paste":
        return null;
      case "keypress":
        if (!(o.ctrlKey || o.altKey || o.metaKey) || o.ctrlKey && o.altKey) {
          if (o.char && 1 < o.char.length) return o.char;
          if (o.which) return String.fromCharCode(o.which);
        }
        return null;
      case "compositionend":
        return Ym && o.locale !== "ko" ? null : o.data;
      default:
        return null;
    }
  }
  var AA = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function eg(i) {
    var o = i && i.nodeName && i.nodeName.toLowerCase();
    return o === "input" ? !!AA[i.type] : o === "textarea";
  }
  function tg(i, o, u, h) {
    xm(h), o = Ra(o, "onChange"), 0 < o.length && (u = new mc("onChange", "change", null, u, h), i.push({ event: u, listeners: o }));
  }
  var Vs = null, Bs = null;
  function kA(i) {
    _g(i, 0);
  }
  function Ca(i) {
    var o = Ai(i);
    if (um(o)) return i;
  }
  function bA(i, o) {
    if (i === "change") return o;
  }
  var ng = !1;
  if (c) {
    var xc;
    if (c) {
      var wc = "oninput" in document;
      if (!wc) {
        var rg = document.createElement("div");
        rg.setAttribute("oninput", "return;"), wc = typeof rg.oninput == "function";
      }
      xc = wc;
    } else xc = !1;
    ng = xc && (!document.documentMode || 9 < document.documentMode);
  }
  function ig() {
    Vs && (Vs.detachEvent("onpropertychange", sg), Bs = Vs = null);
  }
  function sg(i) {
    if (i.propertyName === "value" && Ca(Bs)) {
      var o = [];
      tg(o, Bs, i, tc(i)), km(kA, o);
    }
  }
  function CA(i, o, u) {
    i === "focusin" ? (ig(), Vs = o, Bs = u, Vs.attachEvent("onpropertychange", sg)) : i === "focusout" && ig();
  }
  function PA(i) {
    if (i === "selectionchange" || i === "keyup" || i === "keydown") return Ca(Bs);
  }
  function EA(i, o) {
    if (i === "click") return Ca(o);
  }
  function MA(i, o) {
    if (i === "input" || i === "change") return Ca(o);
  }
  function RA(i, o) {
    return i === o && (i !== 0 || 1 / i === 1 / o) || i !== i && o !== o;
  }
  var fn = typeof Object.is == "function" ? Object.is : RA;
  function Us(i, o) {
    if (fn(i, o)) return !0;
    if (typeof i != "object" || i === null || typeof o != "object" || o === null) return !1;
    var u = Object.keys(i), h = Object.keys(o);
    if (u.length !== h.length) return !1;
    for (h = 0; h < u.length; h++) {
      var y = u[h];
      if (!f.call(o, y) || !fn(i[y], o[y])) return !1;
    }
    return !0;
  }
  function og(i) {
    for (; i && i.firstChild; ) i = i.firstChild;
    return i;
  }
  function ag(i, o) {
    var u = og(i);
    i = 0;
    for (var h; u; ) {
      if (u.nodeType === 3) {
        if (h = i + u.textContent.length, i <= o && h >= o) return { node: u, offset: o - i };
        i = h;
      }
      e: {
        for (; u; ) {
          if (u.nextSibling) {
            u = u.nextSibling;
            break e;
          }
          u = u.parentNode;
        }
        u = void 0;
      }
      u = og(u);
    }
  }
  function lg(i, o) {
    return i && o ? i === o ? !0 : i && i.nodeType === 3 ? !1 : o && o.nodeType === 3 ? lg(i, o.parentNode) : "contains" in i ? i.contains(o) : i.compareDocumentPosition ? !!(i.compareDocumentPosition(o) & 16) : !1 : !1;
  }
  function ug() {
    for (var i = window, o = ca(); o instanceof i.HTMLIFrameElement; ) {
      try {
        var u = typeof o.contentWindow.location.href == "string";
      } catch {
        u = !1;
      }
      if (u) i = o.contentWindow;
      else break;
      o = ca(i.document);
    }
    return o;
  }
  function Tc(i) {
    var o = i && i.nodeName && i.nodeName.toLowerCase();
    return o && (o === "input" && (i.type === "text" || i.type === "search" || i.type === "tel" || i.type === "url" || i.type === "password") || o === "textarea" || i.contentEditable === "true");
  }
  function NA(i) {
    var o = ug(), u = i.focusedElem, h = i.selectionRange;
    if (o !== u && u && u.ownerDocument && lg(u.ownerDocument.documentElement, u)) {
      if (h !== null && Tc(u)) {
        if (o = h.start, i = h.end, i === void 0 && (i = o), "selectionStart" in u) u.selectionStart = o, u.selectionEnd = Math.min(i, u.value.length);
        else if (i = (o = u.ownerDocument || document) && o.defaultView || window, i.getSelection) {
          i = i.getSelection();
          var y = u.textContent.length, _ = Math.min(h.start, y);
          h = h.end === void 0 ? _ : Math.min(h.end, y), !i.extend && _ > h && (y = h, h = _, _ = y), y = ag(u, _);
          var k = ag(
            u,
            h
          );
          y && k && (i.rangeCount !== 1 || i.anchorNode !== y.node || i.anchorOffset !== y.offset || i.focusNode !== k.node || i.focusOffset !== k.offset) && (o = o.createRange(), o.setStart(y.node, y.offset), i.removeAllRanges(), _ > h ? (i.addRange(o), i.extend(k.node, k.offset)) : (o.setEnd(k.node, k.offset), i.addRange(o)));
        }
      }
      for (o = [], i = u; i = i.parentNode; ) i.nodeType === 1 && o.push({ element: i, left: i.scrollLeft, top: i.scrollTop });
      for (typeof u.focus == "function" && u.focus(), u = 0; u < o.length; u++) i = o[u], i.element.scrollLeft = i.left, i.element.scrollTop = i.top;
    }
  }
  var IA = c && "documentMode" in document && 11 >= document.documentMode, Si = null, Ac = null, Hs = null, kc = !1;
  function cg(i, o, u) {
    var h = u.window === u ? u.document : u.nodeType === 9 ? u : u.ownerDocument;
    kc || Si == null || Si !== ca(h) || (h = Si, "selectionStart" in h && Tc(h) ? h = { start: h.selectionStart, end: h.selectionEnd } : (h = (h.ownerDocument && h.ownerDocument.defaultView || window).getSelection(), h = { anchorNode: h.anchorNode, anchorOffset: h.anchorOffset, focusNode: h.focusNode, focusOffset: h.focusOffset }), Hs && Us(Hs, h) || (Hs = h, h = Ra(Ac, "onSelect"), 0 < h.length && (o = new mc("onSelect", "select", null, o, u), i.push({ event: o, listeners: h }), o.target = Si)));
  }
  function Pa(i, o) {
    var u = {};
    return u[i.toLowerCase()] = o.toLowerCase(), u["Webkit" + i] = "webkit" + o, u["Moz" + i] = "moz" + o, u;
  }
  var xi = { animationend: Pa("Animation", "AnimationEnd"), animationiteration: Pa("Animation", "AnimationIteration"), animationstart: Pa("Animation", "AnimationStart"), transitionend: Pa("Transition", "TransitionEnd") }, bc = {}, dg = {};
  c && (dg = document.createElement("div").style, "AnimationEvent" in window || (delete xi.animationend.animation, delete xi.animationiteration.animation, delete xi.animationstart.animation), "TransitionEvent" in window || delete xi.transitionend.transition);
  function Ea(i) {
    if (bc[i]) return bc[i];
    if (!xi[i]) return i;
    var o = xi[i], u;
    for (u in o) if (o.hasOwnProperty(u) && u in dg) return bc[i] = o[u];
    return i;
  }
  var fg = Ea("animationend"), hg = Ea("animationiteration"), pg = Ea("animationstart"), mg = Ea("transitionend"), gg = /* @__PURE__ */ new Map(), yg = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function rr(i, o) {
    gg.set(i, o), a(o, [i]);
  }
  for (var Cc = 0; Cc < yg.length; Cc++) {
    var Pc = yg[Cc], DA = Pc.toLowerCase(), jA = Pc[0].toUpperCase() + Pc.slice(1);
    rr(DA, "on" + jA);
  }
  rr(fg, "onAnimationEnd"), rr(hg, "onAnimationIteration"), rr(pg, "onAnimationStart"), rr("dblclick", "onDoubleClick"), rr("focusin", "onFocus"), rr("focusout", "onBlur"), rr(mg, "onTransitionEnd"), l("onMouseEnter", ["mouseout", "mouseover"]), l("onMouseLeave", ["mouseout", "mouseover"]), l("onPointerEnter", ["pointerout", "pointerover"]), l("onPointerLeave", ["pointerout", "pointerover"]), a("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), a("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), a("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), a("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), a("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), a("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Ws = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), FA = new Set("cancel close invalid load scroll toggle".split(" ").concat(Ws));
  function vg(i, o, u) {
    var h = i.type || "unknown-event";
    i.currentTarget = u, DT(h, o, void 0, i), i.currentTarget = null;
  }
  function _g(i, o) {
    o = (o & 4) !== 0;
    for (var u = 0; u < i.length; u++) {
      var h = i[u], y = h.event;
      h = h.listeners;
      e: {
        var _ = void 0;
        if (o) for (var k = h.length - 1; 0 <= k; k--) {
          var R = h[k], N = R.instance, B = R.currentTarget;
          if (R = R.listener, N !== _ && y.isPropagationStopped()) break e;
          vg(y, R, B), _ = N;
        }
        else for (k = 0; k < h.length; k++) {
          if (R = h[k], N = R.instance, B = R.currentTarget, R = R.listener, N !== _ && y.isPropagationStopped()) break e;
          vg(y, R, B), _ = N;
        }
      }
    }
    if (ha) throw i = sc, ha = !1, sc = null, i;
  }
  function Ne(i, o) {
    var u = o[Fc];
    u === void 0 && (u = o[Fc] = /* @__PURE__ */ new Set());
    var h = i + "__bubble";
    u.has(h) || (Sg(o, i, 2, !1), u.add(h));
  }
  function Ec(i, o, u) {
    var h = 0;
    o && (h |= 4), Sg(u, i, h, o);
  }
  var Ma = "_reactListening" + Math.random().toString(36).slice(2);
  function Zs(i) {
    if (!i[Ma]) {
      i[Ma] = !0, r.forEach(function(u) {
        u !== "selectionchange" && (FA.has(u) || Ec(u, !1, i), Ec(u, !0, i));
      });
      var o = i.nodeType === 9 ? i : i.ownerDocument;
      o === null || o[Ma] || (o[Ma] = !0, Ec("selectionchange", !1, o));
    }
  }
  function Sg(i, o, u, h) {
    switch (Um(o)) {
      case 1:
        var y = qT;
        break;
      case 4:
        y = QT;
        break;
      default:
        y = fc;
    }
    u = y.bind(null, o, u, i), y = void 0, !ic || o !== "touchstart" && o !== "touchmove" && o !== "wheel" || (y = !0), h ? y !== void 0 ? i.addEventListener(o, u, { capture: !0, passive: y }) : i.addEventListener(o, u, !0) : y !== void 0 ? i.addEventListener(o, u, { passive: y }) : i.addEventListener(o, u, !1);
  }
  function Mc(i, o, u, h, y) {
    var _ = h;
    if ((o & 1) === 0 && (o & 2) === 0 && h !== null) e: for (; ; ) {
      if (h === null) return;
      var k = h.tag;
      if (k === 3 || k === 4) {
        var R = h.stateNode.containerInfo;
        if (R === y || R.nodeType === 8 && R.parentNode === y) break;
        if (k === 4) for (k = h.return; k !== null; ) {
          var N = k.tag;
          if ((N === 3 || N === 4) && (N = k.stateNode.containerInfo, N === y || N.nodeType === 8 && N.parentNode === y)) return;
          k = k.return;
        }
        for (; R !== null; ) {
          if (k = Fr(R), k === null) return;
          if (N = k.tag, N === 5 || N === 6) {
            h = _ = k;
            continue e;
          }
          R = R.parentNode;
        }
      }
      h = h.return;
    }
    km(function() {
      var B = _, K = tc(u), Y = [];
      e: {
        var Z = gg.get(i);
        if (Z !== void 0) {
          var ne = mc, se = i;
          switch (i) {
            case "keypress":
              if (Aa(u) === 0) break e;
            case "keydown":
            case "keyup":
              ne = fA;
              break;
            case "focusin":
              se = "focus", ne = vc;
              break;
            case "focusout":
              se = "blur", ne = vc;
              break;
            case "beforeblur":
            case "afterblur":
              ne = vc;
              break;
            case "click":
              if (u.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              ne = Zm;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              ne = eA;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              ne = mA;
              break;
            case fg:
            case hg:
            case pg:
              ne = rA;
              break;
            case mg:
              ne = yA;
              break;
            case "scroll":
              ne = XT;
              break;
            case "wheel":
              ne = _A;
              break;
            case "copy":
            case "cut":
            case "paste":
              ne = sA;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              ne = Km;
          }
          var ue = (o & 4) !== 0, Ke = !ue && i === "scroll", $ = ue ? Z !== null ? Z + "Capture" : null : Z;
          ue = [];
          for (var D = B, V; D !== null; ) {
            V = D;
            var Q = V.stateNode;
            if (V.tag === 5 && Q !== null && (V = Q, $ !== null && (Q = Ps(D, $), Q != null && ue.push(Gs(D, Q, V)))), Ke) break;
            D = D.return;
          }
          0 < ue.length && (Z = new ne(Z, se, null, u, K), Y.push({ event: Z, listeners: ue }));
        }
      }
      if ((o & 7) === 0) {
        e: {
          if (Z = i === "mouseover" || i === "pointerover", ne = i === "mouseout" || i === "pointerout", Z && u !== ec && (se = u.relatedTarget || u.fromElement) && (Fr(se) || se[On])) break e;
          if ((ne || Z) && (Z = K.window === K ? K : (Z = K.ownerDocument) ? Z.defaultView || Z.parentWindow : window, ne ? (se = u.relatedTarget || u.toElement, ne = B, se = se ? Fr(se) : null, se !== null && (Ke = jr(se), se !== Ke || se.tag !== 5 && se.tag !== 6) && (se = null)) : (ne = null, se = B), ne !== se)) {
            if (ue = Zm, Q = "onMouseLeave", $ = "onMouseEnter", D = "mouse", (i === "pointerout" || i === "pointerover") && (ue = Km, Q = "onPointerLeave", $ = "onPointerEnter", D = "pointer"), Ke = ne == null ? Z : Ai(ne), V = se == null ? Z : Ai(se), Z = new ue(Q, D + "leave", ne, u, K), Z.target = Ke, Z.relatedTarget = V, Q = null, Fr(K) === B && (ue = new ue($, D + "enter", se, u, K), ue.target = V, ue.relatedTarget = Ke, Q = ue), Ke = Q, ne && se) t: {
              for (ue = ne, $ = se, D = 0, V = ue; V; V = wi(V)) D++;
              for (V = 0, Q = $; Q; Q = wi(Q)) V++;
              for (; 0 < D - V; ) ue = wi(ue), D--;
              for (; 0 < V - D; ) $ = wi($), V--;
              for (; D--; ) {
                if (ue === $ || $ !== null && ue === $.alternate) break t;
                ue = wi(ue), $ = wi($);
              }
              ue = null;
            }
            else ue = null;
            ne !== null && xg(Y, Z, ne, ue, !1), se !== null && Ke !== null && xg(Y, Ke, se, ue, !0);
          }
        }
        e: {
          if (Z = B ? Ai(B) : window, ne = Z.nodeName && Z.nodeName.toLowerCase(), ne === "select" || ne === "input" && Z.type === "file") var ce = bA;
          else if (eg(Z)) if (ng) ce = MA;
          else {
            ce = PA;
            var he = CA;
          }
          else (ne = Z.nodeName) && ne.toLowerCase() === "input" && (Z.type === "checkbox" || Z.type === "radio") && (ce = EA);
          if (ce && (ce = ce(i, B))) {
            tg(Y, ce, u, K);
            break e;
          }
          he && he(i, Z, B), i === "focusout" && (he = Z._wrapperState) && he.controlled && Z.type === "number" && Yu(Z, "number", Z.value);
        }
        switch (he = B ? Ai(B) : window, i) {
          case "focusin":
            (eg(he) || he.contentEditable === "true") && (Si = he, Ac = B, Hs = null);
            break;
          case "focusout":
            Hs = Ac = Si = null;
            break;
          case "mousedown":
            kc = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            kc = !1, cg(Y, u, K);
            break;
          case "selectionchange":
            if (IA) break;
          case "keydown":
          case "keyup":
            cg(Y, u, K);
        }
        var pe;
        if (Sc) e: {
          switch (i) {
            case "compositionstart":
              var ye = "onCompositionStart";
              break e;
            case "compositionend":
              ye = "onCompositionEnd";
              break e;
            case "compositionupdate":
              ye = "onCompositionUpdate";
              break e;
          }
          ye = void 0;
        }
        else _i ? Xm(i, u) && (ye = "onCompositionEnd") : i === "keydown" && u.keyCode === 229 && (ye = "onCompositionStart");
        ye && (Ym && u.locale !== "ko" && (_i || ye !== "onCompositionStart" ? ye === "onCompositionEnd" && _i && (pe = Hm()) : (nr = K, pc = "value" in nr ? nr.value : nr.textContent, _i = !0)), he = Ra(B, ye), 0 < he.length && (ye = new Gm(ye, i, null, u, K), Y.push({ event: ye, listeners: he }), pe ? ye.data = pe : (pe = Jm(u), pe !== null && (ye.data = pe)))), (pe = xA ? wA(i, u) : TA(i, u)) && (B = Ra(B, "onBeforeInput"), 0 < B.length && (K = new Gm("onBeforeInput", "beforeinput", null, u, K), Y.push({ event: K, listeners: B }), K.data = pe));
      }
      _g(Y, o);
    });
  }
  function Gs(i, o, u) {
    return { instance: i, listener: o, currentTarget: u };
  }
  function Ra(i, o) {
    for (var u = o + "Capture", h = []; i !== null; ) {
      var y = i, _ = y.stateNode;
      y.tag === 5 && _ !== null && (y = _, _ = Ps(i, u), _ != null && h.unshift(Gs(i, _, y)), _ = Ps(i, o), _ != null && h.push(Gs(i, _, y))), i = i.return;
    }
    return h;
  }
  function wi(i) {
    if (i === null) return null;
    do
      i = i.return;
    while (i && i.tag !== 5);
    return i || null;
  }
  function xg(i, o, u, h, y) {
    for (var _ = o._reactName, k = []; u !== null && u !== h; ) {
      var R = u, N = R.alternate, B = R.stateNode;
      if (N !== null && N === h) break;
      R.tag === 5 && B !== null && (R = B, y ? (N = Ps(u, _), N != null && k.unshift(Gs(u, N, R))) : y || (N = Ps(u, _), N != null && k.push(Gs(u, N, R)))), u = u.return;
    }
    k.length !== 0 && i.push({ event: o, listeners: k });
  }
  var OA = /\r\n?/g, LA = /\u0000|\uFFFD/g;
  function wg(i) {
    return (typeof i == "string" ? i : "" + i).replace(OA, `
`).replace(LA, "");
  }
  function Na(i, o, u) {
    if (o = wg(o), wg(i) !== o && u) throw Error(n(425));
  }
  function Ia() {
  }
  var Rc = null, Nc = null;
  function Ic(i, o) {
    return i === "textarea" || i === "noscript" || typeof o.children == "string" || typeof o.children == "number" || typeof o.dangerouslySetInnerHTML == "object" && o.dangerouslySetInnerHTML !== null && o.dangerouslySetInnerHTML.__html != null;
  }
  var Dc = typeof setTimeout == "function" ? setTimeout : void 0, zA = typeof clearTimeout == "function" ? clearTimeout : void 0, Tg = typeof Promise == "function" ? Promise : void 0, $A = typeof queueMicrotask == "function" ? queueMicrotask : typeof Tg < "u" ? function(i) {
    return Tg.resolve(null).then(i).catch(VA);
  } : Dc;
  function VA(i) {
    setTimeout(function() {
      throw i;
    });
  }
  function jc(i, o) {
    var u = o, h = 0;
    do {
      var y = u.nextSibling;
      if (i.removeChild(u), y && y.nodeType === 8) if (u = y.data, u === "/$") {
        if (h === 0) {
          i.removeChild(y), Os(o);
          return;
        }
        h--;
      } else u !== "$" && u !== "$?" && u !== "$!" || h++;
      u = y;
    } while (u);
    Os(o);
  }
  function ir(i) {
    for (; i != null; i = i.nextSibling) {
      var o = i.nodeType;
      if (o === 1 || o === 3) break;
      if (o === 8) {
        if (o = i.data, o === "$" || o === "$!" || o === "$?") break;
        if (o === "/$") return null;
      }
    }
    return i;
  }
  function Ag(i) {
    i = i.previousSibling;
    for (var o = 0; i; ) {
      if (i.nodeType === 8) {
        var u = i.data;
        if (u === "$" || u === "$!" || u === "$?") {
          if (o === 0) return i;
          o--;
        } else u === "/$" && o++;
      }
      i = i.previousSibling;
    }
    return null;
  }
  var Ti = Math.random().toString(36).slice(2), Tn = "__reactFiber$" + Ti, Ks = "__reactProps$" + Ti, On = "__reactContainer$" + Ti, Fc = "__reactEvents$" + Ti, BA = "__reactListeners$" + Ti, UA = "__reactHandles$" + Ti;
  function Fr(i) {
    var o = i[Tn];
    if (o) return o;
    for (var u = i.parentNode; u; ) {
      if (o = u[On] || u[Tn]) {
        if (u = o.alternate, o.child !== null || u !== null && u.child !== null) for (i = Ag(i); i !== null; ) {
          if (u = i[Tn]) return u;
          i = Ag(i);
        }
        return o;
      }
      i = u, u = i.parentNode;
    }
    return null;
  }
  function Ys(i) {
    return i = i[Tn] || i[On], !i || i.tag !== 5 && i.tag !== 6 && i.tag !== 13 && i.tag !== 3 ? null : i;
  }
  function Ai(i) {
    if (i.tag === 5 || i.tag === 6) return i.stateNode;
    throw Error(n(33));
  }
  function Da(i) {
    return i[Ks] || null;
  }
  var Oc = [], ki = -1;
  function sr(i) {
    return { current: i };
  }
  function Ie(i) {
    0 > ki || (i.current = Oc[ki], Oc[ki] = null, ki--);
  }
  function Me(i, o) {
    ki++, Oc[ki] = i.current, i.current = o;
  }
  var or = {}, pt = sr(or), bt = sr(!1), Or = or;
  function bi(i, o) {
    var u = i.type.contextTypes;
    if (!u) return or;
    var h = i.stateNode;
    if (h && h.__reactInternalMemoizedUnmaskedChildContext === o) return h.__reactInternalMemoizedMaskedChildContext;
    var y = {}, _;
    for (_ in u) y[_] = o[_];
    return h && (i = i.stateNode, i.__reactInternalMemoizedUnmaskedChildContext = o, i.__reactInternalMemoizedMaskedChildContext = y), y;
  }
  function Ct(i) {
    return i = i.childContextTypes, i != null;
  }
  function ja() {
    Ie(bt), Ie(pt);
  }
  function kg(i, o, u) {
    if (pt.current !== or) throw Error(n(168));
    Me(pt, o), Me(bt, u);
  }
  function bg(i, o, u) {
    var h = i.stateNode;
    if (o = o.childContextTypes, typeof h.getChildContext != "function") return u;
    h = h.getChildContext();
    for (var y in h) if (!(y in o)) throw Error(n(108, ke(i) || "Unknown", y));
    return X({}, u, h);
  }
  function Fa(i) {
    return i = (i = i.stateNode) && i.__reactInternalMemoizedMergedChildContext || or, Or = pt.current, Me(pt, i), Me(bt, bt.current), !0;
  }
  function Cg(i, o, u) {
    var h = i.stateNode;
    if (!h) throw Error(n(169));
    u ? (i = bg(i, o, Or), h.__reactInternalMemoizedMergedChildContext = i, Ie(bt), Ie(pt), Me(pt, i)) : Ie(bt), Me(bt, u);
  }
  var Ln = null, Oa = !1, Lc = !1;
  function Pg(i) {
    Ln === null ? Ln = [i] : Ln.push(i);
  }
  function HA(i) {
    Oa = !0, Pg(i);
  }
  function ar() {
    if (!Lc && Ln !== null) {
      Lc = !0;
      var i = 0, o = Ae;
      try {
        var u = Ln;
        for (Ae = 1; i < u.length; i++) {
          var h = u[i];
          do
            h = h(!0);
          while (h !== null);
        }
        Ln = null, Oa = !1;
      } catch (y) {
        throw Ln !== null && (Ln = Ln.slice(i + 1)), Mm(oc, ar), y;
      } finally {
        Ae = o, Lc = !1;
      }
    }
    return null;
  }
  var Ci = [], Pi = 0, La = null, za = 0, Qt = [], Xt = 0, Lr = null, zn = 1, $n = "";
  function zr(i, o) {
    Ci[Pi++] = za, Ci[Pi++] = La, La = i, za = o;
  }
  function Eg(i, o, u) {
    Qt[Xt++] = zn, Qt[Xt++] = $n, Qt[Xt++] = Lr, Lr = i;
    var h = zn;
    i = $n;
    var y = 32 - dn(h) - 1;
    h &= ~(1 << y), u += 1;
    var _ = 32 - dn(o) + y;
    if (30 < _) {
      var k = y - y % 5;
      _ = (h & (1 << k) - 1).toString(32), h >>= k, y -= k, zn = 1 << 32 - dn(o) + y | u << y | h, $n = _ + i;
    } else zn = 1 << _ | u << y | h, $n = i;
  }
  function zc(i) {
    i.return !== null && (zr(i, 1), Eg(i, 1, 0));
  }
  function $c(i) {
    for (; i === La; ) La = Ci[--Pi], Ci[Pi] = null, za = Ci[--Pi], Ci[Pi] = null;
    for (; i === Lr; ) Lr = Qt[--Xt], Qt[Xt] = null, $n = Qt[--Xt], Qt[Xt] = null, zn = Qt[--Xt], Qt[Xt] = null;
  }
  var Vt = null, Bt = null, je = !1, hn = null;
  function Mg(i, o) {
    var u = nn(5, null, null, 0);
    u.elementType = "DELETED", u.stateNode = o, u.return = i, o = i.deletions, o === null ? (i.deletions = [u], i.flags |= 16) : o.push(u);
  }
  function Rg(i, o) {
    switch (i.tag) {
      case 5:
        var u = i.type;
        return o = o.nodeType !== 1 || u.toLowerCase() !== o.nodeName.toLowerCase() ? null : o, o !== null ? (i.stateNode = o, Vt = i, Bt = ir(o.firstChild), !0) : !1;
      case 6:
        return o = i.pendingProps === "" || o.nodeType !== 3 ? null : o, o !== null ? (i.stateNode = o, Vt = i, Bt = null, !0) : !1;
      case 13:
        return o = o.nodeType !== 8 ? null : o, o !== null ? (u = Lr !== null ? { id: zn, overflow: $n } : null, i.memoizedState = { dehydrated: o, treeContext: u, retryLane: 1073741824 }, u = nn(18, null, null, 0), u.stateNode = o, u.return = i, i.child = u, Vt = i, Bt = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Vc(i) {
    return (i.mode & 1) !== 0 && (i.flags & 128) === 0;
  }
  function Bc(i) {
    if (je) {
      var o = Bt;
      if (o) {
        var u = o;
        if (!Rg(i, o)) {
          if (Vc(i)) throw Error(n(418));
          o = ir(u.nextSibling);
          var h = Vt;
          o && Rg(i, o) ? Mg(h, u) : (i.flags = i.flags & -4097 | 2, je = !1, Vt = i);
        }
      } else {
        if (Vc(i)) throw Error(n(418));
        i.flags = i.flags & -4097 | 2, je = !1, Vt = i;
      }
    }
  }
  function Ng(i) {
    for (i = i.return; i !== null && i.tag !== 5 && i.tag !== 3 && i.tag !== 13; ) i = i.return;
    Vt = i;
  }
  function $a(i) {
    if (i !== Vt) return !1;
    if (!je) return Ng(i), je = !0, !1;
    var o;
    if ((o = i.tag !== 3) && !(o = i.tag !== 5) && (o = i.type, o = o !== "head" && o !== "body" && !Ic(i.type, i.memoizedProps)), o && (o = Bt)) {
      if (Vc(i)) throw Ig(), Error(n(418));
      for (; o; ) Mg(i, o), o = ir(o.nextSibling);
    }
    if (Ng(i), i.tag === 13) {
      if (i = i.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(n(317));
      e: {
        for (i = i.nextSibling, o = 0; i; ) {
          if (i.nodeType === 8) {
            var u = i.data;
            if (u === "/$") {
              if (o === 0) {
                Bt = ir(i.nextSibling);
                break e;
              }
              o--;
            } else u !== "$" && u !== "$!" && u !== "$?" || o++;
          }
          i = i.nextSibling;
        }
        Bt = null;
      }
    } else Bt = Vt ? ir(i.stateNode.nextSibling) : null;
    return !0;
  }
  function Ig() {
    for (var i = Bt; i; ) i = ir(i.nextSibling);
  }
  function Ei() {
    Bt = Vt = null, je = !1;
  }
  function Uc(i) {
    hn === null ? hn = [i] : hn.push(i);
  }
  var WA = M.ReactCurrentBatchConfig;
  function qs(i, o, u) {
    if (i = u.ref, i !== null && typeof i != "function" && typeof i != "object") {
      if (u._owner) {
        if (u = u._owner, u) {
          if (u.tag !== 1) throw Error(n(309));
          var h = u.stateNode;
        }
        if (!h) throw Error(n(147, i));
        var y = h, _ = "" + i;
        return o !== null && o.ref !== null && typeof o.ref == "function" && o.ref._stringRef === _ ? o.ref : (o = function(k) {
          var R = y.refs;
          k === null ? delete R[_] : R[_] = k;
        }, o._stringRef = _, o);
      }
      if (typeof i != "string") throw Error(n(284));
      if (!u._owner) throw Error(n(290, i));
    }
    return i;
  }
  function Va(i, o) {
    throw i = Object.prototype.toString.call(o), Error(n(31, i === "[object Object]" ? "object with keys {" + Object.keys(o).join(", ") + "}" : i));
  }
  function Dg(i) {
    var o = i._init;
    return o(i._payload);
  }
  function jg(i) {
    function o($, D) {
      if (i) {
        var V = $.deletions;
        V === null ? ($.deletions = [D], $.flags |= 16) : V.push(D);
      }
    }
    function u($, D) {
      if (!i) return null;
      for (; D !== null; ) o($, D), D = D.sibling;
      return null;
    }
    function h($, D) {
      for ($ = /* @__PURE__ */ new Map(); D !== null; ) D.key !== null ? $.set(D.key, D) : $.set(D.index, D), D = D.sibling;
      return $;
    }
    function y($, D) {
      return $ = mr($, D), $.index = 0, $.sibling = null, $;
    }
    function _($, D, V) {
      return $.index = V, i ? (V = $.alternate, V !== null ? (V = V.index, V < D ? ($.flags |= 2, D) : V) : ($.flags |= 2, D)) : ($.flags |= 1048576, D);
    }
    function k($) {
      return i && $.alternate === null && ($.flags |= 2), $;
    }
    function R($, D, V, Q) {
      return D === null || D.tag !== 6 ? (D = Dd(V, $.mode, Q), D.return = $, D) : (D = y(D, V), D.return = $, D);
    }
    function N($, D, V, Q) {
      var ce = V.type;
      return ce === O ? K($, D, V.props.children, Q, V.key) : D !== null && (D.elementType === ce || typeof ce == "object" && ce !== null && ce.$$typeof === ee && Dg(ce) === D.type) ? (Q = y(D, V.props), Q.ref = qs($, D, V), Q.return = $, Q) : (Q = dl(V.type, V.key, V.props, null, $.mode, Q), Q.ref = qs($, D, V), Q.return = $, Q);
    }
    function B($, D, V, Q) {
      return D === null || D.tag !== 4 || D.stateNode.containerInfo !== V.containerInfo || D.stateNode.implementation !== V.implementation ? (D = jd(V, $.mode, Q), D.return = $, D) : (D = y(D, V.children || []), D.return = $, D);
    }
    function K($, D, V, Q, ce) {
      return D === null || D.tag !== 7 ? (D = Gr(V, $.mode, Q, ce), D.return = $, D) : (D = y(D, V), D.return = $, D);
    }
    function Y($, D, V) {
      if (typeof D == "string" && D !== "" || typeof D == "number") return D = Dd("" + D, $.mode, V), D.return = $, D;
      if (typeof D == "object" && D !== null) {
        switch (D.$$typeof) {
          case P:
            return V = dl(D.type, D.key, D.props, null, $.mode, V), V.ref = qs($, null, D), V.return = $, V;
          case z:
            return D = jd(D, $.mode, V), D.return = $, D;
          case ee:
            var Q = D._init;
            return Y($, Q(D._payload), V);
        }
        if (ks(D) || J(D)) return D = Gr(D, $.mode, V, null), D.return = $, D;
        Va($, D);
      }
      return null;
    }
    function Z($, D, V, Q) {
      var ce = D !== null ? D.key : null;
      if (typeof V == "string" && V !== "" || typeof V == "number") return ce !== null ? null : R($, D, "" + V, Q);
      if (typeof V == "object" && V !== null) {
        switch (V.$$typeof) {
          case P:
            return V.key === ce ? N($, D, V, Q) : null;
          case z:
            return V.key === ce ? B($, D, V, Q) : null;
          case ee:
            return ce = V._init, Z(
              $,
              D,
              ce(V._payload),
              Q
            );
        }
        if (ks(V) || J(V)) return ce !== null ? null : K($, D, V, Q, null);
        Va($, V);
      }
      return null;
    }
    function ne($, D, V, Q, ce) {
      if (typeof Q == "string" && Q !== "" || typeof Q == "number") return $ = $.get(V) || null, R(D, $, "" + Q, ce);
      if (typeof Q == "object" && Q !== null) {
        switch (Q.$$typeof) {
          case P:
            return $ = $.get(Q.key === null ? V : Q.key) || null, N(D, $, Q, ce);
          case z:
            return $ = $.get(Q.key === null ? V : Q.key) || null, B(D, $, Q, ce);
          case ee:
            var he = Q._init;
            return ne($, D, V, he(Q._payload), ce);
        }
        if (ks(Q) || J(Q)) return $ = $.get(V) || null, K(D, $, Q, ce, null);
        Va(D, Q);
      }
      return null;
    }
    function se($, D, V, Q) {
      for (var ce = null, he = null, pe = D, ye = D = 0, ot = null; pe !== null && ye < V.length; ye++) {
        pe.index > ye ? (ot = pe, pe = null) : ot = pe.sibling;
        var we = Z($, pe, V[ye], Q);
        if (we === null) {
          pe === null && (pe = ot);
          break;
        }
        i && pe && we.alternate === null && o($, pe), D = _(we, D, ye), he === null ? ce = we : he.sibling = we, he = we, pe = ot;
      }
      if (ye === V.length) return u($, pe), je && zr($, ye), ce;
      if (pe === null) {
        for (; ye < V.length; ye++) pe = Y($, V[ye], Q), pe !== null && (D = _(pe, D, ye), he === null ? ce = pe : he.sibling = pe, he = pe);
        return je && zr($, ye), ce;
      }
      for (pe = h($, pe); ye < V.length; ye++) ot = ne(pe, $, ye, V[ye], Q), ot !== null && (i && ot.alternate !== null && pe.delete(ot.key === null ? ye : ot.key), D = _(ot, D, ye), he === null ? ce = ot : he.sibling = ot, he = ot);
      return i && pe.forEach(function(gr) {
        return o($, gr);
      }), je && zr($, ye), ce;
    }
    function ue($, D, V, Q) {
      var ce = J(V);
      if (typeof ce != "function") throw Error(n(150));
      if (V = ce.call(V), V == null) throw Error(n(151));
      for (var he = ce = null, pe = D, ye = D = 0, ot = null, we = V.next(); pe !== null && !we.done; ye++, we = V.next()) {
        pe.index > ye ? (ot = pe, pe = null) : ot = pe.sibling;
        var gr = Z($, pe, we.value, Q);
        if (gr === null) {
          pe === null && (pe = ot);
          break;
        }
        i && pe && gr.alternate === null && o($, pe), D = _(gr, D, ye), he === null ? ce = gr : he.sibling = gr, he = gr, pe = ot;
      }
      if (we.done) return u(
        $,
        pe
      ), je && zr($, ye), ce;
      if (pe === null) {
        for (; !we.done; ye++, we = V.next()) we = Y($, we.value, Q), we !== null && (D = _(we, D, ye), he === null ? ce = we : he.sibling = we, he = we);
        return je && zr($, ye), ce;
      }
      for (pe = h($, pe); !we.done; ye++, we = V.next()) we = ne(pe, $, ye, we.value, Q), we !== null && (i && we.alternate !== null && pe.delete(we.key === null ? ye : we.key), D = _(we, D, ye), he === null ? ce = we : he.sibling = we, he = we);
      return i && pe.forEach(function(Ak) {
        return o($, Ak);
      }), je && zr($, ye), ce;
    }
    function Ke($, D, V, Q) {
      if (typeof V == "object" && V !== null && V.type === O && V.key === null && (V = V.props.children), typeof V == "object" && V !== null) {
        switch (V.$$typeof) {
          case P:
            e: {
              for (var ce = V.key, he = D; he !== null; ) {
                if (he.key === ce) {
                  if (ce = V.type, ce === O) {
                    if (he.tag === 7) {
                      u($, he.sibling), D = y(he, V.props.children), D.return = $, $ = D;
                      break e;
                    }
                  } else if (he.elementType === ce || typeof ce == "object" && ce !== null && ce.$$typeof === ee && Dg(ce) === he.type) {
                    u($, he.sibling), D = y(he, V.props), D.ref = qs($, he, V), D.return = $, $ = D;
                    break e;
                  }
                  u($, he);
                  break;
                } else o($, he);
                he = he.sibling;
              }
              V.type === O ? (D = Gr(V.props.children, $.mode, Q, V.key), D.return = $, $ = D) : (Q = dl(V.type, V.key, V.props, null, $.mode, Q), Q.ref = qs($, D, V), Q.return = $, $ = Q);
            }
            return k($);
          case z:
            e: {
              for (he = V.key; D !== null; ) {
                if (D.key === he) if (D.tag === 4 && D.stateNode.containerInfo === V.containerInfo && D.stateNode.implementation === V.implementation) {
                  u($, D.sibling), D = y(D, V.children || []), D.return = $, $ = D;
                  break e;
                } else {
                  u($, D);
                  break;
                }
                else o($, D);
                D = D.sibling;
              }
              D = jd(V, $.mode, Q), D.return = $, $ = D;
            }
            return k($);
          case ee:
            return he = V._init, Ke($, D, he(V._payload), Q);
        }
        if (ks(V)) return se($, D, V, Q);
        if (J(V)) return ue($, D, V, Q);
        Va($, V);
      }
      return typeof V == "string" && V !== "" || typeof V == "number" ? (V = "" + V, D !== null && D.tag === 6 ? (u($, D.sibling), D = y(D, V), D.return = $, $ = D) : (u($, D), D = Dd(V, $.mode, Q), D.return = $, $ = D), k($)) : u($, D);
    }
    return Ke;
  }
  var Mi = jg(!0), Fg = jg(!1), Ba = sr(null), Ua = null, Ri = null, Hc = null;
  function Wc() {
    Hc = Ri = Ua = null;
  }
  function Zc(i) {
    var o = Ba.current;
    Ie(Ba), i._currentValue = o;
  }
  function Gc(i, o, u) {
    for (; i !== null; ) {
      var h = i.alternate;
      if ((i.childLanes & o) !== o ? (i.childLanes |= o, h !== null && (h.childLanes |= o)) : h !== null && (h.childLanes & o) !== o && (h.childLanes |= o), i === u) break;
      i = i.return;
    }
  }
  function Ni(i, o) {
    Ua = i, Hc = Ri = null, i = i.dependencies, i !== null && i.firstContext !== null && ((i.lanes & o) !== 0 && (Pt = !0), i.firstContext = null);
  }
  function Jt(i) {
    var o = i._currentValue;
    if (Hc !== i) if (i = { context: i, memoizedValue: o, next: null }, Ri === null) {
      if (Ua === null) throw Error(n(308));
      Ri = i, Ua.dependencies = { lanes: 0, firstContext: i };
    } else Ri = Ri.next = i;
    return o;
  }
  var $r = null;
  function Kc(i) {
    $r === null ? $r = [i] : $r.push(i);
  }
  function Og(i, o, u, h) {
    var y = o.interleaved;
    return y === null ? (u.next = u, Kc(o)) : (u.next = y.next, y.next = u), o.interleaved = u, Vn(i, h);
  }
  function Vn(i, o) {
    i.lanes |= o;
    var u = i.alternate;
    for (u !== null && (u.lanes |= o), u = i, i = i.return; i !== null; ) i.childLanes |= o, u = i.alternate, u !== null && (u.childLanes |= o), u = i, i = i.return;
    return u.tag === 3 ? u.stateNode : null;
  }
  var lr = !1;
  function Yc(i) {
    i.updateQueue = { baseState: i.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Lg(i, o) {
    i = i.updateQueue, o.updateQueue === i && (o.updateQueue = { baseState: i.baseState, firstBaseUpdate: i.firstBaseUpdate, lastBaseUpdate: i.lastBaseUpdate, shared: i.shared, effects: i.effects });
  }
  function Bn(i, o) {
    return { eventTime: i, lane: o, tag: 0, payload: null, callback: null, next: null };
  }
  function ur(i, o, u) {
    var h = i.updateQueue;
    if (h === null) return null;
    if (h = h.shared, (xe & 2) !== 0) {
      var y = h.pending;
      return y === null ? o.next = o : (o.next = y.next, y.next = o), h.pending = o, Vn(i, u);
    }
    return y = h.interleaved, y === null ? (o.next = o, Kc(h)) : (o.next = y.next, y.next = o), h.interleaved = o, Vn(i, u);
  }
  function Ha(i, o, u) {
    if (o = o.updateQueue, o !== null && (o = o.shared, (u & 4194240) !== 0)) {
      var h = o.lanes;
      h &= i.pendingLanes, u |= h, o.lanes = u, uc(i, u);
    }
  }
  function zg(i, o) {
    var u = i.updateQueue, h = i.alternate;
    if (h !== null && (h = h.updateQueue, u === h)) {
      var y = null, _ = null;
      if (u = u.firstBaseUpdate, u !== null) {
        do {
          var k = { eventTime: u.eventTime, lane: u.lane, tag: u.tag, payload: u.payload, callback: u.callback, next: null };
          _ === null ? y = _ = k : _ = _.next = k, u = u.next;
        } while (u !== null);
        _ === null ? y = _ = o : _ = _.next = o;
      } else y = _ = o;
      u = { baseState: h.baseState, firstBaseUpdate: y, lastBaseUpdate: _, shared: h.shared, effects: h.effects }, i.updateQueue = u;
      return;
    }
    i = u.lastBaseUpdate, i === null ? u.firstBaseUpdate = o : i.next = o, u.lastBaseUpdate = o;
  }
  function Wa(i, o, u, h) {
    var y = i.updateQueue;
    lr = !1;
    var _ = y.firstBaseUpdate, k = y.lastBaseUpdate, R = y.shared.pending;
    if (R !== null) {
      y.shared.pending = null;
      var N = R, B = N.next;
      N.next = null, k === null ? _ = B : k.next = B, k = N;
      var K = i.alternate;
      K !== null && (K = K.updateQueue, R = K.lastBaseUpdate, R !== k && (R === null ? K.firstBaseUpdate = B : R.next = B, K.lastBaseUpdate = N));
    }
    if (_ !== null) {
      var Y = y.baseState;
      k = 0, K = B = N = null, R = _;
      do {
        var Z = R.lane, ne = R.eventTime;
        if ((h & Z) === Z) {
          K !== null && (K = K.next = {
            eventTime: ne,
            lane: 0,
            tag: R.tag,
            payload: R.payload,
            callback: R.callback,
            next: null
          });
          e: {
            var se = i, ue = R;
            switch (Z = o, ne = u, ue.tag) {
              case 1:
                if (se = ue.payload, typeof se == "function") {
                  Y = se.call(ne, Y, Z);
                  break e;
                }
                Y = se;
                break e;
              case 3:
                se.flags = se.flags & -65537 | 128;
              case 0:
                if (se = ue.payload, Z = typeof se == "function" ? se.call(ne, Y, Z) : se, Z == null) break e;
                Y = X({}, Y, Z);
                break e;
              case 2:
                lr = !0;
            }
          }
          R.callback !== null && R.lane !== 0 && (i.flags |= 64, Z = y.effects, Z === null ? y.effects = [R] : Z.push(R));
        } else ne = { eventTime: ne, lane: Z, tag: R.tag, payload: R.payload, callback: R.callback, next: null }, K === null ? (B = K = ne, N = Y) : K = K.next = ne, k |= Z;
        if (R = R.next, R === null) {
          if (R = y.shared.pending, R === null) break;
          Z = R, R = Z.next, Z.next = null, y.lastBaseUpdate = Z, y.shared.pending = null;
        }
      } while (!0);
      if (K === null && (N = Y), y.baseState = N, y.firstBaseUpdate = B, y.lastBaseUpdate = K, o = y.shared.interleaved, o !== null) {
        y = o;
        do
          k |= y.lane, y = y.next;
        while (y !== o);
      } else _ === null && (y.shared.lanes = 0);
      Ur |= k, i.lanes = k, i.memoizedState = Y;
    }
  }
  function $g(i, o, u) {
    if (i = o.effects, o.effects = null, i !== null) for (o = 0; o < i.length; o++) {
      var h = i[o], y = h.callback;
      if (y !== null) {
        if (h.callback = null, h = u, typeof y != "function") throw Error(n(191, y));
        y.call(h);
      }
    }
  }
  var Qs = {}, An = sr(Qs), Xs = sr(Qs), Js = sr(Qs);
  function Vr(i) {
    if (i === Qs) throw Error(n(174));
    return i;
  }
  function qc(i, o) {
    switch (Me(Js, o), Me(Xs, i), Me(An, Qs), i = o.nodeType, i) {
      case 9:
      case 11:
        o = (o = o.documentElement) ? o.namespaceURI : Qu(null, "");
        break;
      default:
        i = i === 8 ? o.parentNode : o, o = i.namespaceURI || null, i = i.tagName, o = Qu(o, i);
    }
    Ie(An), Me(An, o);
  }
  function Ii() {
    Ie(An), Ie(Xs), Ie(Js);
  }
  function Vg(i) {
    Vr(Js.current);
    var o = Vr(An.current), u = Qu(o, i.type);
    o !== u && (Me(Xs, i), Me(An, u));
  }
  function Qc(i) {
    Xs.current === i && (Ie(An), Ie(Xs));
  }
  var Le = sr(0);
  function Za(i) {
    for (var o = i; o !== null; ) {
      if (o.tag === 13) {
        var u = o.memoizedState;
        if (u !== null && (u = u.dehydrated, u === null || u.data === "$?" || u.data === "$!")) return o;
      } else if (o.tag === 19 && o.memoizedProps.revealOrder !== void 0) {
        if ((o.flags & 128) !== 0) return o;
      } else if (o.child !== null) {
        o.child.return = o, o = o.child;
        continue;
      }
      if (o === i) break;
      for (; o.sibling === null; ) {
        if (o.return === null || o.return === i) return null;
        o = o.return;
      }
      o.sibling.return = o.return, o = o.sibling;
    }
    return null;
  }
  var Xc = [];
  function Jc() {
    for (var i = 0; i < Xc.length; i++) Xc[i]._workInProgressVersionPrimary = null;
    Xc.length = 0;
  }
  var Ga = M.ReactCurrentDispatcher, ed = M.ReactCurrentBatchConfig, Br = 0, ze = null, et = null, it = null, Ka = !1, eo = !1, to = 0, ZA = 0;
  function mt() {
    throw Error(n(321));
  }
  function td(i, o) {
    if (o === null) return !1;
    for (var u = 0; u < o.length && u < i.length; u++) if (!fn(i[u], o[u])) return !1;
    return !0;
  }
  function nd(i, o, u, h, y, _) {
    if (Br = _, ze = o, o.memoizedState = null, o.updateQueue = null, o.lanes = 0, Ga.current = i === null || i.memoizedState === null ? qA : QA, i = u(h, y), eo) {
      _ = 0;
      do {
        if (eo = !1, to = 0, 25 <= _) throw Error(n(301));
        _ += 1, it = et = null, o.updateQueue = null, Ga.current = XA, i = u(h, y);
      } while (eo);
    }
    if (Ga.current = Qa, o = et !== null && et.next !== null, Br = 0, it = et = ze = null, Ka = !1, o) throw Error(n(300));
    return i;
  }
  function rd() {
    var i = to !== 0;
    return to = 0, i;
  }
  function kn() {
    var i = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return it === null ? ze.memoizedState = it = i : it = it.next = i, it;
  }
  function en() {
    if (et === null) {
      var i = ze.alternate;
      i = i !== null ? i.memoizedState : null;
    } else i = et.next;
    var o = it === null ? ze.memoizedState : it.next;
    if (o !== null) it = o, et = i;
    else {
      if (i === null) throw Error(n(310));
      et = i, i = { memoizedState: et.memoizedState, baseState: et.baseState, baseQueue: et.baseQueue, queue: et.queue, next: null }, it === null ? ze.memoizedState = it = i : it = it.next = i;
    }
    return it;
  }
  function no(i, o) {
    return typeof o == "function" ? o(i) : o;
  }
  function id(i) {
    var o = en(), u = o.queue;
    if (u === null) throw Error(n(311));
    u.lastRenderedReducer = i;
    var h = et, y = h.baseQueue, _ = u.pending;
    if (_ !== null) {
      if (y !== null) {
        var k = y.next;
        y.next = _.next, _.next = k;
      }
      h.baseQueue = y = _, u.pending = null;
    }
    if (y !== null) {
      _ = y.next, h = h.baseState;
      var R = k = null, N = null, B = _;
      do {
        var K = B.lane;
        if ((Br & K) === K) N !== null && (N = N.next = { lane: 0, action: B.action, hasEagerState: B.hasEagerState, eagerState: B.eagerState, next: null }), h = B.hasEagerState ? B.eagerState : i(h, B.action);
        else {
          var Y = {
            lane: K,
            action: B.action,
            hasEagerState: B.hasEagerState,
            eagerState: B.eagerState,
            next: null
          };
          N === null ? (R = N = Y, k = h) : N = N.next = Y, ze.lanes |= K, Ur |= K;
        }
        B = B.next;
      } while (B !== null && B !== _);
      N === null ? k = h : N.next = R, fn(h, o.memoizedState) || (Pt = !0), o.memoizedState = h, o.baseState = k, o.baseQueue = N, u.lastRenderedState = h;
    }
    if (i = u.interleaved, i !== null) {
      y = i;
      do
        _ = y.lane, ze.lanes |= _, Ur |= _, y = y.next;
      while (y !== i);
    } else y === null && (u.lanes = 0);
    return [o.memoizedState, u.dispatch];
  }
  function sd(i) {
    var o = en(), u = o.queue;
    if (u === null) throw Error(n(311));
    u.lastRenderedReducer = i;
    var h = u.dispatch, y = u.pending, _ = o.memoizedState;
    if (y !== null) {
      u.pending = null;
      var k = y = y.next;
      do
        _ = i(_, k.action), k = k.next;
      while (k !== y);
      fn(_, o.memoizedState) || (Pt = !0), o.memoizedState = _, o.baseQueue === null && (o.baseState = _), u.lastRenderedState = _;
    }
    return [_, h];
  }
  function Bg() {
  }
  function Ug(i, o) {
    var u = ze, h = en(), y = o(), _ = !fn(h.memoizedState, y);
    if (_ && (h.memoizedState = y, Pt = !0), h = h.queue, od(Zg.bind(null, u, h, i), [i]), h.getSnapshot !== o || _ || it !== null && it.memoizedState.tag & 1) {
      if (u.flags |= 2048, ro(9, Wg.bind(null, u, h, y, o), void 0, null), st === null) throw Error(n(349));
      (Br & 30) !== 0 || Hg(u, o, y);
    }
    return y;
  }
  function Hg(i, o, u) {
    i.flags |= 16384, i = { getSnapshot: o, value: u }, o = ze.updateQueue, o === null ? (o = { lastEffect: null, stores: null }, ze.updateQueue = o, o.stores = [i]) : (u = o.stores, u === null ? o.stores = [i] : u.push(i));
  }
  function Wg(i, o, u, h) {
    o.value = u, o.getSnapshot = h, Gg(o) && Kg(i);
  }
  function Zg(i, o, u) {
    return u(function() {
      Gg(o) && Kg(i);
    });
  }
  function Gg(i) {
    var o = i.getSnapshot;
    i = i.value;
    try {
      var u = o();
      return !fn(i, u);
    } catch {
      return !0;
    }
  }
  function Kg(i) {
    var o = Vn(i, 1);
    o !== null && yn(o, i, 1, -1);
  }
  function Yg(i) {
    var o = kn();
    return typeof i == "function" && (i = i()), o.memoizedState = o.baseState = i, i = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: no, lastRenderedState: i }, o.queue = i, i = i.dispatch = YA.bind(null, ze, i), [o.memoizedState, i];
  }
  function ro(i, o, u, h) {
    return i = { tag: i, create: o, destroy: u, deps: h, next: null }, o = ze.updateQueue, o === null ? (o = { lastEffect: null, stores: null }, ze.updateQueue = o, o.lastEffect = i.next = i) : (u = o.lastEffect, u === null ? o.lastEffect = i.next = i : (h = u.next, u.next = i, i.next = h, o.lastEffect = i)), i;
  }
  function qg() {
    return en().memoizedState;
  }
  function Ya(i, o, u, h) {
    var y = kn();
    ze.flags |= i, y.memoizedState = ro(1 | o, u, void 0, h === void 0 ? null : h);
  }
  function qa(i, o, u, h) {
    var y = en();
    h = h === void 0 ? null : h;
    var _ = void 0;
    if (et !== null) {
      var k = et.memoizedState;
      if (_ = k.destroy, h !== null && td(h, k.deps)) {
        y.memoizedState = ro(o, u, _, h);
        return;
      }
    }
    ze.flags |= i, y.memoizedState = ro(1 | o, u, _, h);
  }
  function Qg(i, o) {
    return Ya(8390656, 8, i, o);
  }
  function od(i, o) {
    return qa(2048, 8, i, o);
  }
  function Xg(i, o) {
    return qa(4, 2, i, o);
  }
  function Jg(i, o) {
    return qa(4, 4, i, o);
  }
  function ey(i, o) {
    if (typeof o == "function") return i = i(), o(i), function() {
      o(null);
    };
    if (o != null) return i = i(), o.current = i, function() {
      o.current = null;
    };
  }
  function ty(i, o, u) {
    return u = u != null ? u.concat([i]) : null, qa(4, 4, ey.bind(null, o, i), u);
  }
  function ad() {
  }
  function ny(i, o) {
    var u = en();
    o = o === void 0 ? null : o;
    var h = u.memoizedState;
    return h !== null && o !== null && td(o, h[1]) ? h[0] : (u.memoizedState = [i, o], i);
  }
  function ry(i, o) {
    var u = en();
    o = o === void 0 ? null : o;
    var h = u.memoizedState;
    return h !== null && o !== null && td(o, h[1]) ? h[0] : (i = i(), u.memoizedState = [i, o], i);
  }
  function iy(i, o, u) {
    return (Br & 21) === 0 ? (i.baseState && (i.baseState = !1, Pt = !0), i.memoizedState = u) : (fn(u, o) || (u = Dm(), ze.lanes |= u, Ur |= u, i.baseState = !0), o);
  }
  function GA(i, o) {
    var u = Ae;
    Ae = u !== 0 && 4 > u ? u : 4, i(!0);
    var h = ed.transition;
    ed.transition = {};
    try {
      i(!1), o();
    } finally {
      Ae = u, ed.transition = h;
    }
  }
  function sy() {
    return en().memoizedState;
  }
  function KA(i, o, u) {
    var h = hr(i);
    if (u = { lane: h, action: u, hasEagerState: !1, eagerState: null, next: null }, oy(i)) ay(o, u);
    else if (u = Og(i, o, u, h), u !== null) {
      var y = wt();
      yn(u, i, h, y), ly(u, o, h);
    }
  }
  function YA(i, o, u) {
    var h = hr(i), y = { lane: h, action: u, hasEagerState: !1, eagerState: null, next: null };
    if (oy(i)) ay(o, y);
    else {
      var _ = i.alternate;
      if (i.lanes === 0 && (_ === null || _.lanes === 0) && (_ = o.lastRenderedReducer, _ !== null)) try {
        var k = o.lastRenderedState, R = _(k, u);
        if (y.hasEagerState = !0, y.eagerState = R, fn(R, k)) {
          var N = o.interleaved;
          N === null ? (y.next = y, Kc(o)) : (y.next = N.next, N.next = y), o.interleaved = y;
          return;
        }
      } catch {
      } finally {
      }
      u = Og(i, o, y, h), u !== null && (y = wt(), yn(u, i, h, y), ly(u, o, h));
    }
  }
  function oy(i) {
    var o = i.alternate;
    return i === ze || o !== null && o === ze;
  }
  function ay(i, o) {
    eo = Ka = !0;
    var u = i.pending;
    u === null ? o.next = o : (o.next = u.next, u.next = o), i.pending = o;
  }
  function ly(i, o, u) {
    if ((u & 4194240) !== 0) {
      var h = o.lanes;
      h &= i.pendingLanes, u |= h, o.lanes = u, uc(i, u);
    }
  }
  var Qa = { readContext: Jt, useCallback: mt, useContext: mt, useEffect: mt, useImperativeHandle: mt, useInsertionEffect: mt, useLayoutEffect: mt, useMemo: mt, useReducer: mt, useRef: mt, useState: mt, useDebugValue: mt, useDeferredValue: mt, useTransition: mt, useMutableSource: mt, useSyncExternalStore: mt, useId: mt, unstable_isNewReconciler: !1 }, qA = { readContext: Jt, useCallback: function(i, o) {
    return kn().memoizedState = [i, o === void 0 ? null : o], i;
  }, useContext: Jt, useEffect: Qg, useImperativeHandle: function(i, o, u) {
    return u = u != null ? u.concat([i]) : null, Ya(
      4194308,
      4,
      ey.bind(null, o, i),
      u
    );
  }, useLayoutEffect: function(i, o) {
    return Ya(4194308, 4, i, o);
  }, useInsertionEffect: function(i, o) {
    return Ya(4, 2, i, o);
  }, useMemo: function(i, o) {
    var u = kn();
    return o = o === void 0 ? null : o, i = i(), u.memoizedState = [i, o], i;
  }, useReducer: function(i, o, u) {
    var h = kn();
    return o = u !== void 0 ? u(o) : o, h.memoizedState = h.baseState = o, i = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: i, lastRenderedState: o }, h.queue = i, i = i.dispatch = KA.bind(null, ze, i), [h.memoizedState, i];
  }, useRef: function(i) {
    var o = kn();
    return i = { current: i }, o.memoizedState = i;
  }, useState: Yg, useDebugValue: ad, useDeferredValue: function(i) {
    return kn().memoizedState = i;
  }, useTransition: function() {
    var i = Yg(!1), o = i[0];
    return i = GA.bind(null, i[1]), kn().memoizedState = i, [o, i];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(i, o, u) {
    var h = ze, y = kn();
    if (je) {
      if (u === void 0) throw Error(n(407));
      u = u();
    } else {
      if (u = o(), st === null) throw Error(n(349));
      (Br & 30) !== 0 || Hg(h, o, u);
    }
    y.memoizedState = u;
    var _ = { value: u, getSnapshot: o };
    return y.queue = _, Qg(Zg.bind(
      null,
      h,
      _,
      i
    ), [i]), h.flags |= 2048, ro(9, Wg.bind(null, h, _, u, o), void 0, null), u;
  }, useId: function() {
    var i = kn(), o = st.identifierPrefix;
    if (je) {
      var u = $n, h = zn;
      u = (h & ~(1 << 32 - dn(h) - 1)).toString(32) + u, o = ":" + o + "R" + u, u = to++, 0 < u && (o += "H" + u.toString(32)), o += ":";
    } else u = ZA++, o = ":" + o + "r" + u.toString(32) + ":";
    return i.memoizedState = o;
  }, unstable_isNewReconciler: !1 }, QA = {
    readContext: Jt,
    useCallback: ny,
    useContext: Jt,
    useEffect: od,
    useImperativeHandle: ty,
    useInsertionEffect: Xg,
    useLayoutEffect: Jg,
    useMemo: ry,
    useReducer: id,
    useRef: qg,
    useState: function() {
      return id(no);
    },
    useDebugValue: ad,
    useDeferredValue: function(i) {
      var o = en();
      return iy(o, et.memoizedState, i);
    },
    useTransition: function() {
      var i = id(no)[0], o = en().memoizedState;
      return [i, o];
    },
    useMutableSource: Bg,
    useSyncExternalStore: Ug,
    useId: sy,
    unstable_isNewReconciler: !1
  }, XA = { readContext: Jt, useCallback: ny, useContext: Jt, useEffect: od, useImperativeHandle: ty, useInsertionEffect: Xg, useLayoutEffect: Jg, useMemo: ry, useReducer: sd, useRef: qg, useState: function() {
    return sd(no);
  }, useDebugValue: ad, useDeferredValue: function(i) {
    var o = en();
    return et === null ? o.memoizedState = i : iy(o, et.memoizedState, i);
  }, useTransition: function() {
    var i = sd(no)[0], o = en().memoizedState;
    return [i, o];
  }, useMutableSource: Bg, useSyncExternalStore: Ug, useId: sy, unstable_isNewReconciler: !1 };
  function pn(i, o) {
    if (i && i.defaultProps) {
      o = X({}, o), i = i.defaultProps;
      for (var u in i) o[u] === void 0 && (o[u] = i[u]);
      return o;
    }
    return o;
  }
  function ld(i, o, u, h) {
    o = i.memoizedState, u = u(h, o), u = u == null ? o : X({}, o, u), i.memoizedState = u, i.lanes === 0 && (i.updateQueue.baseState = u);
  }
  var Xa = { isMounted: function(i) {
    return (i = i._reactInternals) ? jr(i) === i : !1;
  }, enqueueSetState: function(i, o, u) {
    i = i._reactInternals;
    var h = wt(), y = hr(i), _ = Bn(h, y);
    _.payload = o, u != null && (_.callback = u), o = ur(i, _, y), o !== null && (yn(o, i, y, h), Ha(o, i, y));
  }, enqueueReplaceState: function(i, o, u) {
    i = i._reactInternals;
    var h = wt(), y = hr(i), _ = Bn(h, y);
    _.tag = 1, _.payload = o, u != null && (_.callback = u), o = ur(i, _, y), o !== null && (yn(o, i, y, h), Ha(o, i, y));
  }, enqueueForceUpdate: function(i, o) {
    i = i._reactInternals;
    var u = wt(), h = hr(i), y = Bn(u, h);
    y.tag = 2, o != null && (y.callback = o), o = ur(i, y, h), o !== null && (yn(o, i, h, u), Ha(o, i, h));
  } };
  function uy(i, o, u, h, y, _, k) {
    return i = i.stateNode, typeof i.shouldComponentUpdate == "function" ? i.shouldComponentUpdate(h, _, k) : o.prototype && o.prototype.isPureReactComponent ? !Us(u, h) || !Us(y, _) : !0;
  }
  function cy(i, o, u) {
    var h = !1, y = or, _ = o.contextType;
    return typeof _ == "object" && _ !== null ? _ = Jt(_) : (y = Ct(o) ? Or : pt.current, h = o.contextTypes, _ = (h = h != null) ? bi(i, y) : or), o = new o(u, _), i.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, o.updater = Xa, i.stateNode = o, o._reactInternals = i, h && (i = i.stateNode, i.__reactInternalMemoizedUnmaskedChildContext = y, i.__reactInternalMemoizedMaskedChildContext = _), o;
  }
  function dy(i, o, u, h) {
    i = o.state, typeof o.componentWillReceiveProps == "function" && o.componentWillReceiveProps(u, h), typeof o.UNSAFE_componentWillReceiveProps == "function" && o.UNSAFE_componentWillReceiveProps(u, h), o.state !== i && Xa.enqueueReplaceState(o, o.state, null);
  }
  function ud(i, o, u, h) {
    var y = i.stateNode;
    y.props = u, y.state = i.memoizedState, y.refs = {}, Yc(i);
    var _ = o.contextType;
    typeof _ == "object" && _ !== null ? y.context = Jt(_) : (_ = Ct(o) ? Or : pt.current, y.context = bi(i, _)), y.state = i.memoizedState, _ = o.getDerivedStateFromProps, typeof _ == "function" && (ld(i, o, _, u), y.state = i.memoizedState), typeof o.getDerivedStateFromProps == "function" || typeof y.getSnapshotBeforeUpdate == "function" || typeof y.UNSAFE_componentWillMount != "function" && typeof y.componentWillMount != "function" || (o = y.state, typeof y.componentWillMount == "function" && y.componentWillMount(), typeof y.UNSAFE_componentWillMount == "function" && y.UNSAFE_componentWillMount(), o !== y.state && Xa.enqueueReplaceState(y, y.state, null), Wa(i, u, y, h), y.state = i.memoizedState), typeof y.componentDidMount == "function" && (i.flags |= 4194308);
  }
  function Di(i, o) {
    try {
      var u = "", h = o;
      do
        u += ge(h), h = h.return;
      while (h);
      var y = u;
    } catch (_) {
      y = `
Error generating stack: ` + _.message + `
` + _.stack;
    }
    return { value: i, source: o, stack: y, digest: null };
  }
  function cd(i, o, u) {
    return { value: i, source: null, stack: u ?? null, digest: o ?? null };
  }
  function dd(i, o) {
    try {
      console.error(o.value);
    } catch (u) {
      setTimeout(function() {
        throw u;
      });
    }
  }
  var JA = typeof WeakMap == "function" ? WeakMap : Map;
  function fy(i, o, u) {
    u = Bn(-1, u), u.tag = 3, u.payload = { element: null };
    var h = o.value;
    return u.callback = function() {
      sl || (sl = !0, bd = h), dd(i, o);
    }, u;
  }
  function hy(i, o, u) {
    u = Bn(-1, u), u.tag = 3;
    var h = i.type.getDerivedStateFromError;
    if (typeof h == "function") {
      var y = o.value;
      u.payload = function() {
        return h(y);
      }, u.callback = function() {
        dd(i, o);
      };
    }
    var _ = i.stateNode;
    return _ !== null && typeof _.componentDidCatch == "function" && (u.callback = function() {
      dd(i, o), typeof h != "function" && (dr === null ? dr = /* @__PURE__ */ new Set([this]) : dr.add(this));
      var k = o.stack;
      this.componentDidCatch(o.value, { componentStack: k !== null ? k : "" });
    }), u;
  }
  function py(i, o, u) {
    var h = i.pingCache;
    if (h === null) {
      h = i.pingCache = new JA();
      var y = /* @__PURE__ */ new Set();
      h.set(o, y);
    } else y = h.get(o), y === void 0 && (y = /* @__PURE__ */ new Set(), h.set(o, y));
    y.has(u) || (y.add(u), i = hk.bind(null, i, o, u), o.then(i, i));
  }
  function my(i) {
    do {
      var o;
      if ((o = i.tag === 13) && (o = i.memoizedState, o = o !== null ? o.dehydrated !== null : !0), o) return i;
      i = i.return;
    } while (i !== null);
    return null;
  }
  function gy(i, o, u, h, y) {
    return (i.mode & 1) === 0 ? (i === o ? i.flags |= 65536 : (i.flags |= 128, u.flags |= 131072, u.flags &= -52805, u.tag === 1 && (u.alternate === null ? u.tag = 17 : (o = Bn(-1, 1), o.tag = 2, ur(u, o, 1))), u.lanes |= 1), i) : (i.flags |= 65536, i.lanes = y, i);
  }
  var ek = M.ReactCurrentOwner, Pt = !1;
  function xt(i, o, u, h) {
    o.child = i === null ? Fg(o, null, u, h) : Mi(o, i.child, u, h);
  }
  function yy(i, o, u, h, y) {
    u = u.render;
    var _ = o.ref;
    return Ni(o, y), h = nd(i, o, u, h, _, y), u = rd(), i !== null && !Pt ? (o.updateQueue = i.updateQueue, o.flags &= -2053, i.lanes &= ~y, Un(i, o, y)) : (je && u && zc(o), o.flags |= 1, xt(i, o, h, y), o.child);
  }
  function vy(i, o, u, h, y) {
    if (i === null) {
      var _ = u.type;
      return typeof _ == "function" && !Id(_) && _.defaultProps === void 0 && u.compare === null && u.defaultProps === void 0 ? (o.tag = 15, o.type = _, _y(i, o, _, h, y)) : (i = dl(u.type, null, h, o, o.mode, y), i.ref = o.ref, i.return = o, o.child = i);
    }
    if (_ = i.child, (i.lanes & y) === 0) {
      var k = _.memoizedProps;
      if (u = u.compare, u = u !== null ? u : Us, u(k, h) && i.ref === o.ref) return Un(i, o, y);
    }
    return o.flags |= 1, i = mr(_, h), i.ref = o.ref, i.return = o, o.child = i;
  }
  function _y(i, o, u, h, y) {
    if (i !== null) {
      var _ = i.memoizedProps;
      if (Us(_, h) && i.ref === o.ref) if (Pt = !1, o.pendingProps = h = _, (i.lanes & y) !== 0) (i.flags & 131072) !== 0 && (Pt = !0);
      else return o.lanes = i.lanes, Un(i, o, y);
    }
    return fd(i, o, u, h, y);
  }
  function Sy(i, o, u) {
    var h = o.pendingProps, y = h.children, _ = i !== null ? i.memoizedState : null;
    if (h.mode === "hidden") if ((o.mode & 1) === 0) o.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Me(Fi, Ut), Ut |= u;
    else {
      if ((u & 1073741824) === 0) return i = _ !== null ? _.baseLanes | u : u, o.lanes = o.childLanes = 1073741824, o.memoizedState = { baseLanes: i, cachePool: null, transitions: null }, o.updateQueue = null, Me(Fi, Ut), Ut |= i, null;
      o.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, h = _ !== null ? _.baseLanes : u, Me(Fi, Ut), Ut |= h;
    }
    else _ !== null ? (h = _.baseLanes | u, o.memoizedState = null) : h = u, Me(Fi, Ut), Ut |= h;
    return xt(i, o, y, u), o.child;
  }
  function xy(i, o) {
    var u = o.ref;
    (i === null && u !== null || i !== null && i.ref !== u) && (o.flags |= 512, o.flags |= 2097152);
  }
  function fd(i, o, u, h, y) {
    var _ = Ct(u) ? Or : pt.current;
    return _ = bi(o, _), Ni(o, y), u = nd(i, o, u, h, _, y), h = rd(), i !== null && !Pt ? (o.updateQueue = i.updateQueue, o.flags &= -2053, i.lanes &= ~y, Un(i, o, y)) : (je && h && zc(o), o.flags |= 1, xt(i, o, u, y), o.child);
  }
  function wy(i, o, u, h, y) {
    if (Ct(u)) {
      var _ = !0;
      Fa(o);
    } else _ = !1;
    if (Ni(o, y), o.stateNode === null) el(i, o), cy(o, u, h), ud(o, u, h, y), h = !0;
    else if (i === null) {
      var k = o.stateNode, R = o.memoizedProps;
      k.props = R;
      var N = k.context, B = u.contextType;
      typeof B == "object" && B !== null ? B = Jt(B) : (B = Ct(u) ? Or : pt.current, B = bi(o, B));
      var K = u.getDerivedStateFromProps, Y = typeof K == "function" || typeof k.getSnapshotBeforeUpdate == "function";
      Y || typeof k.UNSAFE_componentWillReceiveProps != "function" && typeof k.componentWillReceiveProps != "function" || (R !== h || N !== B) && dy(o, k, h, B), lr = !1;
      var Z = o.memoizedState;
      k.state = Z, Wa(o, h, k, y), N = o.memoizedState, R !== h || Z !== N || bt.current || lr ? (typeof K == "function" && (ld(o, u, K, h), N = o.memoizedState), (R = lr || uy(o, u, R, h, Z, N, B)) ? (Y || typeof k.UNSAFE_componentWillMount != "function" && typeof k.componentWillMount != "function" || (typeof k.componentWillMount == "function" && k.componentWillMount(), typeof k.UNSAFE_componentWillMount == "function" && k.UNSAFE_componentWillMount()), typeof k.componentDidMount == "function" && (o.flags |= 4194308)) : (typeof k.componentDidMount == "function" && (o.flags |= 4194308), o.memoizedProps = h, o.memoizedState = N), k.props = h, k.state = N, k.context = B, h = R) : (typeof k.componentDidMount == "function" && (o.flags |= 4194308), h = !1);
    } else {
      k = o.stateNode, Lg(i, o), R = o.memoizedProps, B = o.type === o.elementType ? R : pn(o.type, R), k.props = B, Y = o.pendingProps, Z = k.context, N = u.contextType, typeof N == "object" && N !== null ? N = Jt(N) : (N = Ct(u) ? Or : pt.current, N = bi(o, N));
      var ne = u.getDerivedStateFromProps;
      (K = typeof ne == "function" || typeof k.getSnapshotBeforeUpdate == "function") || typeof k.UNSAFE_componentWillReceiveProps != "function" && typeof k.componentWillReceiveProps != "function" || (R !== Y || Z !== N) && dy(o, k, h, N), lr = !1, Z = o.memoizedState, k.state = Z, Wa(o, h, k, y);
      var se = o.memoizedState;
      R !== Y || Z !== se || bt.current || lr ? (typeof ne == "function" && (ld(o, u, ne, h), se = o.memoizedState), (B = lr || uy(o, u, B, h, Z, se, N) || !1) ? (K || typeof k.UNSAFE_componentWillUpdate != "function" && typeof k.componentWillUpdate != "function" || (typeof k.componentWillUpdate == "function" && k.componentWillUpdate(h, se, N), typeof k.UNSAFE_componentWillUpdate == "function" && k.UNSAFE_componentWillUpdate(h, se, N)), typeof k.componentDidUpdate == "function" && (o.flags |= 4), typeof k.getSnapshotBeforeUpdate == "function" && (o.flags |= 1024)) : (typeof k.componentDidUpdate != "function" || R === i.memoizedProps && Z === i.memoizedState || (o.flags |= 4), typeof k.getSnapshotBeforeUpdate != "function" || R === i.memoizedProps && Z === i.memoizedState || (o.flags |= 1024), o.memoizedProps = h, o.memoizedState = se), k.props = h, k.state = se, k.context = N, h = B) : (typeof k.componentDidUpdate != "function" || R === i.memoizedProps && Z === i.memoizedState || (o.flags |= 4), typeof k.getSnapshotBeforeUpdate != "function" || R === i.memoizedProps && Z === i.memoizedState || (o.flags |= 1024), h = !1);
    }
    return hd(i, o, u, h, _, y);
  }
  function hd(i, o, u, h, y, _) {
    xy(i, o);
    var k = (o.flags & 128) !== 0;
    if (!h && !k) return y && Cg(o, u, !1), Un(i, o, _);
    h = o.stateNode, ek.current = o;
    var R = k && typeof u.getDerivedStateFromError != "function" ? null : h.render();
    return o.flags |= 1, i !== null && k ? (o.child = Mi(o, i.child, null, _), o.child = Mi(o, null, R, _)) : xt(i, o, R, _), o.memoizedState = h.state, y && Cg(o, u, !0), o.child;
  }
  function Ty(i) {
    var o = i.stateNode;
    o.pendingContext ? kg(i, o.pendingContext, o.pendingContext !== o.context) : o.context && kg(i, o.context, !1), qc(i, o.containerInfo);
  }
  function Ay(i, o, u, h, y) {
    return Ei(), Uc(y), o.flags |= 256, xt(i, o, u, h), o.child;
  }
  var pd = { dehydrated: null, treeContext: null, retryLane: 0 };
  function md(i) {
    return { baseLanes: i, cachePool: null, transitions: null };
  }
  function ky(i, o, u) {
    var h = o.pendingProps, y = Le.current, _ = !1, k = (o.flags & 128) !== 0, R;
    if ((R = k) || (R = i !== null && i.memoizedState === null ? !1 : (y & 2) !== 0), R ? (_ = !0, o.flags &= -129) : (i === null || i.memoizedState !== null) && (y |= 1), Me(Le, y & 1), i === null)
      return Bc(o), i = o.memoizedState, i !== null && (i = i.dehydrated, i !== null) ? ((o.mode & 1) === 0 ? o.lanes = 1 : i.data === "$!" ? o.lanes = 8 : o.lanes = 1073741824, null) : (k = h.children, i = h.fallback, _ ? (h = o.mode, _ = o.child, k = { mode: "hidden", children: k }, (h & 1) === 0 && _ !== null ? (_.childLanes = 0, _.pendingProps = k) : _ = fl(k, h, 0, null), i = Gr(i, h, u, null), _.return = o, i.return = o, _.sibling = i, o.child = _, o.child.memoizedState = md(u), o.memoizedState = pd, i) : gd(o, k));
    if (y = i.memoizedState, y !== null && (R = y.dehydrated, R !== null)) return tk(i, o, k, h, R, y, u);
    if (_) {
      _ = h.fallback, k = o.mode, y = i.child, R = y.sibling;
      var N = { mode: "hidden", children: h.children };
      return (k & 1) === 0 && o.child !== y ? (h = o.child, h.childLanes = 0, h.pendingProps = N, o.deletions = null) : (h = mr(y, N), h.subtreeFlags = y.subtreeFlags & 14680064), R !== null ? _ = mr(R, _) : (_ = Gr(_, k, u, null), _.flags |= 2), _.return = o, h.return = o, h.sibling = _, o.child = h, h = _, _ = o.child, k = i.child.memoizedState, k = k === null ? md(u) : { baseLanes: k.baseLanes | u, cachePool: null, transitions: k.transitions }, _.memoizedState = k, _.childLanes = i.childLanes & ~u, o.memoizedState = pd, h;
    }
    return _ = i.child, i = _.sibling, h = mr(_, { mode: "visible", children: h.children }), (o.mode & 1) === 0 && (h.lanes = u), h.return = o, h.sibling = null, i !== null && (u = o.deletions, u === null ? (o.deletions = [i], o.flags |= 16) : u.push(i)), o.child = h, o.memoizedState = null, h;
  }
  function gd(i, o) {
    return o = fl({ mode: "visible", children: o }, i.mode, 0, null), o.return = i, i.child = o;
  }
  function Ja(i, o, u, h) {
    return h !== null && Uc(h), Mi(o, i.child, null, u), i = gd(o, o.pendingProps.children), i.flags |= 2, o.memoizedState = null, i;
  }
  function tk(i, o, u, h, y, _, k) {
    if (u)
      return o.flags & 256 ? (o.flags &= -257, h = cd(Error(n(422))), Ja(i, o, k, h)) : o.memoizedState !== null ? (o.child = i.child, o.flags |= 128, null) : (_ = h.fallback, y = o.mode, h = fl({ mode: "visible", children: h.children }, y, 0, null), _ = Gr(_, y, k, null), _.flags |= 2, h.return = o, _.return = o, h.sibling = _, o.child = h, (o.mode & 1) !== 0 && Mi(o, i.child, null, k), o.child.memoizedState = md(k), o.memoizedState = pd, _);
    if ((o.mode & 1) === 0) return Ja(i, o, k, null);
    if (y.data === "$!") {
      if (h = y.nextSibling && y.nextSibling.dataset, h) var R = h.dgst;
      return h = R, _ = Error(n(419)), h = cd(_, h, void 0), Ja(i, o, k, h);
    }
    if (R = (k & i.childLanes) !== 0, Pt || R) {
      if (h = st, h !== null) {
        switch (k & -k) {
          case 4:
            y = 2;
            break;
          case 16:
            y = 8;
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
            y = 32;
            break;
          case 536870912:
            y = 268435456;
            break;
          default:
            y = 0;
        }
        y = (y & (h.suspendedLanes | k)) !== 0 ? 0 : y, y !== 0 && y !== _.retryLane && (_.retryLane = y, Vn(i, y), yn(h, i, y, -1));
      }
      return Nd(), h = cd(Error(n(421))), Ja(i, o, k, h);
    }
    return y.data === "$?" ? (o.flags |= 128, o.child = i.child, o = pk.bind(null, i), y._reactRetry = o, null) : (i = _.treeContext, Bt = ir(y.nextSibling), Vt = o, je = !0, hn = null, i !== null && (Qt[Xt++] = zn, Qt[Xt++] = $n, Qt[Xt++] = Lr, zn = i.id, $n = i.overflow, Lr = o), o = gd(o, h.children), o.flags |= 4096, o);
  }
  function by(i, o, u) {
    i.lanes |= o;
    var h = i.alternate;
    h !== null && (h.lanes |= o), Gc(i.return, o, u);
  }
  function yd(i, o, u, h, y) {
    var _ = i.memoizedState;
    _ === null ? i.memoizedState = { isBackwards: o, rendering: null, renderingStartTime: 0, last: h, tail: u, tailMode: y } : (_.isBackwards = o, _.rendering = null, _.renderingStartTime = 0, _.last = h, _.tail = u, _.tailMode = y);
  }
  function Cy(i, o, u) {
    var h = o.pendingProps, y = h.revealOrder, _ = h.tail;
    if (xt(i, o, h.children, u), h = Le.current, (h & 2) !== 0) h = h & 1 | 2, o.flags |= 128;
    else {
      if (i !== null && (i.flags & 128) !== 0) e: for (i = o.child; i !== null; ) {
        if (i.tag === 13) i.memoizedState !== null && by(i, u, o);
        else if (i.tag === 19) by(i, u, o);
        else if (i.child !== null) {
          i.child.return = i, i = i.child;
          continue;
        }
        if (i === o) break e;
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === o) break e;
          i = i.return;
        }
        i.sibling.return = i.return, i = i.sibling;
      }
      h &= 1;
    }
    if (Me(Le, h), (o.mode & 1) === 0) o.memoizedState = null;
    else switch (y) {
      case "forwards":
        for (u = o.child, y = null; u !== null; ) i = u.alternate, i !== null && Za(i) === null && (y = u), u = u.sibling;
        u = y, u === null ? (y = o.child, o.child = null) : (y = u.sibling, u.sibling = null), yd(o, !1, y, u, _);
        break;
      case "backwards":
        for (u = null, y = o.child, o.child = null; y !== null; ) {
          if (i = y.alternate, i !== null && Za(i) === null) {
            o.child = y;
            break;
          }
          i = y.sibling, y.sibling = u, u = y, y = i;
        }
        yd(o, !0, u, null, _);
        break;
      case "together":
        yd(o, !1, null, null, void 0);
        break;
      default:
        o.memoizedState = null;
    }
    return o.child;
  }
  function el(i, o) {
    (o.mode & 1) === 0 && i !== null && (i.alternate = null, o.alternate = null, o.flags |= 2);
  }
  function Un(i, o, u) {
    if (i !== null && (o.dependencies = i.dependencies), Ur |= o.lanes, (u & o.childLanes) === 0) return null;
    if (i !== null && o.child !== i.child) throw Error(n(153));
    if (o.child !== null) {
      for (i = o.child, u = mr(i, i.pendingProps), o.child = u, u.return = o; i.sibling !== null; ) i = i.sibling, u = u.sibling = mr(i, i.pendingProps), u.return = o;
      u.sibling = null;
    }
    return o.child;
  }
  function nk(i, o, u) {
    switch (o.tag) {
      case 3:
        Ty(o), Ei();
        break;
      case 5:
        Vg(o);
        break;
      case 1:
        Ct(o.type) && Fa(o);
        break;
      case 4:
        qc(o, o.stateNode.containerInfo);
        break;
      case 10:
        var h = o.type._context, y = o.memoizedProps.value;
        Me(Ba, h._currentValue), h._currentValue = y;
        break;
      case 13:
        if (h = o.memoizedState, h !== null)
          return h.dehydrated !== null ? (Me(Le, Le.current & 1), o.flags |= 128, null) : (u & o.child.childLanes) !== 0 ? ky(i, o, u) : (Me(Le, Le.current & 1), i = Un(i, o, u), i !== null ? i.sibling : null);
        Me(Le, Le.current & 1);
        break;
      case 19:
        if (h = (u & o.childLanes) !== 0, (i.flags & 128) !== 0) {
          if (h) return Cy(i, o, u);
          o.flags |= 128;
        }
        if (y = o.memoizedState, y !== null && (y.rendering = null, y.tail = null, y.lastEffect = null), Me(Le, Le.current), h) break;
        return null;
      case 22:
      case 23:
        return o.lanes = 0, Sy(i, o, u);
    }
    return Un(i, o, u);
  }
  var Py, vd, Ey, My;
  Py = function(i, o) {
    for (var u = o.child; u !== null; ) {
      if (u.tag === 5 || u.tag === 6) i.appendChild(u.stateNode);
      else if (u.tag !== 4 && u.child !== null) {
        u.child.return = u, u = u.child;
        continue;
      }
      if (u === o) break;
      for (; u.sibling === null; ) {
        if (u.return === null || u.return === o) return;
        u = u.return;
      }
      u.sibling.return = u.return, u = u.sibling;
    }
  }, vd = function() {
  }, Ey = function(i, o, u, h) {
    var y = i.memoizedProps;
    if (y !== h) {
      i = o.stateNode, Vr(An.current);
      var _ = null;
      switch (u) {
        case "input":
          y = Gu(i, y), h = Gu(i, h), _ = [];
          break;
        case "select":
          y = X({}, y, { value: void 0 }), h = X({}, h, { value: void 0 }), _ = [];
          break;
        case "textarea":
          y = qu(i, y), h = qu(i, h), _ = [];
          break;
        default:
          typeof y.onClick != "function" && typeof h.onClick == "function" && (i.onclick = Ia);
      }
      Xu(u, h);
      var k;
      u = null;
      for (B in y) if (!h.hasOwnProperty(B) && y.hasOwnProperty(B) && y[B] != null) if (B === "style") {
        var R = y[B];
        for (k in R) R.hasOwnProperty(k) && (u || (u = {}), u[k] = "");
      } else B !== "dangerouslySetInnerHTML" && B !== "children" && B !== "suppressContentEditableWarning" && B !== "suppressHydrationWarning" && B !== "autoFocus" && (s.hasOwnProperty(B) ? _ || (_ = []) : (_ = _ || []).push(B, null));
      for (B in h) {
        var N = h[B];
        if (R = y != null ? y[B] : void 0, h.hasOwnProperty(B) && N !== R && (N != null || R != null)) if (B === "style") if (R) {
          for (k in R) !R.hasOwnProperty(k) || N && N.hasOwnProperty(k) || (u || (u = {}), u[k] = "");
          for (k in N) N.hasOwnProperty(k) && R[k] !== N[k] && (u || (u = {}), u[k] = N[k]);
        } else u || (_ || (_ = []), _.push(
          B,
          u
        )), u = N;
        else B === "dangerouslySetInnerHTML" ? (N = N ? N.__html : void 0, R = R ? R.__html : void 0, N != null && R !== N && (_ = _ || []).push(B, N)) : B === "children" ? typeof N != "string" && typeof N != "number" || (_ = _ || []).push(B, "" + N) : B !== "suppressContentEditableWarning" && B !== "suppressHydrationWarning" && (s.hasOwnProperty(B) ? (N != null && B === "onScroll" && Ne("scroll", i), _ || R === N || (_ = [])) : (_ = _ || []).push(B, N));
      }
      u && (_ = _ || []).push("style", u);
      var B = _;
      (o.updateQueue = B) && (o.flags |= 4);
    }
  }, My = function(i, o, u, h) {
    u !== h && (o.flags |= 4);
  };
  function io(i, o) {
    if (!je) switch (i.tailMode) {
      case "hidden":
        o = i.tail;
        for (var u = null; o !== null; ) o.alternate !== null && (u = o), o = o.sibling;
        u === null ? i.tail = null : u.sibling = null;
        break;
      case "collapsed":
        u = i.tail;
        for (var h = null; u !== null; ) u.alternate !== null && (h = u), u = u.sibling;
        h === null ? o || i.tail === null ? i.tail = null : i.tail.sibling = null : h.sibling = null;
    }
  }
  function gt(i) {
    var o = i.alternate !== null && i.alternate.child === i.child, u = 0, h = 0;
    if (o) for (var y = i.child; y !== null; ) u |= y.lanes | y.childLanes, h |= y.subtreeFlags & 14680064, h |= y.flags & 14680064, y.return = i, y = y.sibling;
    else for (y = i.child; y !== null; ) u |= y.lanes | y.childLanes, h |= y.subtreeFlags, h |= y.flags, y.return = i, y = y.sibling;
    return i.subtreeFlags |= h, i.childLanes = u, o;
  }
  function rk(i, o, u) {
    var h = o.pendingProps;
    switch ($c(o), o.tag) {
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
        return gt(o), null;
      case 1:
        return Ct(o.type) && ja(), gt(o), null;
      case 3:
        return h = o.stateNode, Ii(), Ie(bt), Ie(pt), Jc(), h.pendingContext && (h.context = h.pendingContext, h.pendingContext = null), (i === null || i.child === null) && ($a(o) ? o.flags |= 4 : i === null || i.memoizedState.isDehydrated && (o.flags & 256) === 0 || (o.flags |= 1024, hn !== null && (Ed(hn), hn = null))), vd(i, o), gt(o), null;
      case 5:
        Qc(o);
        var y = Vr(Js.current);
        if (u = o.type, i !== null && o.stateNode != null) Ey(i, o, u, h, y), i.ref !== o.ref && (o.flags |= 512, o.flags |= 2097152);
        else {
          if (!h) {
            if (o.stateNode === null) throw Error(n(166));
            return gt(o), null;
          }
          if (i = Vr(An.current), $a(o)) {
            h = o.stateNode, u = o.type;
            var _ = o.memoizedProps;
            switch (h[Tn] = o, h[Ks] = _, i = (o.mode & 1) !== 0, u) {
              case "dialog":
                Ne("cancel", h), Ne("close", h);
                break;
              case "iframe":
              case "object":
              case "embed":
                Ne("load", h);
                break;
              case "video":
              case "audio":
                for (y = 0; y < Ws.length; y++) Ne(Ws[y], h);
                break;
              case "source":
                Ne("error", h);
                break;
              case "img":
              case "image":
              case "link":
                Ne(
                  "error",
                  h
                ), Ne("load", h);
                break;
              case "details":
                Ne("toggle", h);
                break;
              case "input":
                cm(h, _), Ne("invalid", h);
                break;
              case "select":
                h._wrapperState = { wasMultiple: !!_.multiple }, Ne("invalid", h);
                break;
              case "textarea":
                hm(h, _), Ne("invalid", h);
            }
            Xu(u, _), y = null;
            for (var k in _) if (_.hasOwnProperty(k)) {
              var R = _[k];
              k === "children" ? typeof R == "string" ? h.textContent !== R && (_.suppressHydrationWarning !== !0 && Na(h.textContent, R, i), y = ["children", R]) : typeof R == "number" && h.textContent !== "" + R && (_.suppressHydrationWarning !== !0 && Na(
                h.textContent,
                R,
                i
              ), y = ["children", "" + R]) : s.hasOwnProperty(k) && R != null && k === "onScroll" && Ne("scroll", h);
            }
            switch (u) {
              case "input":
                ua(h), fm(h, _, !0);
                break;
              case "textarea":
                ua(h), mm(h);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof _.onClick == "function" && (h.onclick = Ia);
            }
            h = y, o.updateQueue = h, h !== null && (o.flags |= 4);
          } else {
            k = y.nodeType === 9 ? y : y.ownerDocument, i === "http://www.w3.org/1999/xhtml" && (i = gm(u)), i === "http://www.w3.org/1999/xhtml" ? u === "script" ? (i = k.createElement("div"), i.innerHTML = "<script><\/script>", i = i.removeChild(i.firstChild)) : typeof h.is == "string" ? i = k.createElement(u, { is: h.is }) : (i = k.createElement(u), u === "select" && (k = i, h.multiple ? k.multiple = !0 : h.size && (k.size = h.size))) : i = k.createElementNS(i, u), i[Tn] = o, i[Ks] = h, Py(i, o, !1, !1), o.stateNode = i;
            e: {
              switch (k = Ju(u, h), u) {
                case "dialog":
                  Ne("cancel", i), Ne("close", i), y = h;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Ne("load", i), y = h;
                  break;
                case "video":
                case "audio":
                  for (y = 0; y < Ws.length; y++) Ne(Ws[y], i);
                  y = h;
                  break;
                case "source":
                  Ne("error", i), y = h;
                  break;
                case "img":
                case "image":
                case "link":
                  Ne(
                    "error",
                    i
                  ), Ne("load", i), y = h;
                  break;
                case "details":
                  Ne("toggle", i), y = h;
                  break;
                case "input":
                  cm(i, h), y = Gu(i, h), Ne("invalid", i);
                  break;
                case "option":
                  y = h;
                  break;
                case "select":
                  i._wrapperState = { wasMultiple: !!h.multiple }, y = X({}, h, { value: void 0 }), Ne("invalid", i);
                  break;
                case "textarea":
                  hm(i, h), y = qu(i, h), Ne("invalid", i);
                  break;
                default:
                  y = h;
              }
              Xu(u, y), R = y;
              for (_ in R) if (R.hasOwnProperty(_)) {
                var N = R[_];
                _ === "style" ? _m(i, N) : _ === "dangerouslySetInnerHTML" ? (N = N ? N.__html : void 0, N != null && ym(i, N)) : _ === "children" ? typeof N == "string" ? (u !== "textarea" || N !== "") && bs(i, N) : typeof N == "number" && bs(i, "" + N) : _ !== "suppressContentEditableWarning" && _ !== "suppressHydrationWarning" && _ !== "autoFocus" && (s.hasOwnProperty(_) ? N != null && _ === "onScroll" && Ne("scroll", i) : N != null && C(i, _, N, k));
              }
              switch (u) {
                case "input":
                  ua(i), fm(i, h, !1);
                  break;
                case "textarea":
                  ua(i), mm(i);
                  break;
                case "option":
                  h.value != null && i.setAttribute("value", "" + Te(h.value));
                  break;
                case "select":
                  i.multiple = !!h.multiple, _ = h.value, _ != null ? pi(i, !!h.multiple, _, !1) : h.defaultValue != null && pi(
                    i,
                    !!h.multiple,
                    h.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof y.onClick == "function" && (i.onclick = Ia);
              }
              switch (u) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  h = !!h.autoFocus;
                  break e;
                case "img":
                  h = !0;
                  break e;
                default:
                  h = !1;
              }
            }
            h && (o.flags |= 4);
          }
          o.ref !== null && (o.flags |= 512, o.flags |= 2097152);
        }
        return gt(o), null;
      case 6:
        if (i && o.stateNode != null) My(i, o, i.memoizedProps, h);
        else {
          if (typeof h != "string" && o.stateNode === null) throw Error(n(166));
          if (u = Vr(Js.current), Vr(An.current), $a(o)) {
            if (h = o.stateNode, u = o.memoizedProps, h[Tn] = o, (_ = h.nodeValue !== u) && (i = Vt, i !== null)) switch (i.tag) {
              case 3:
                Na(h.nodeValue, u, (i.mode & 1) !== 0);
                break;
              case 5:
                i.memoizedProps.suppressHydrationWarning !== !0 && Na(h.nodeValue, u, (i.mode & 1) !== 0);
            }
            _ && (o.flags |= 4);
          } else h = (u.nodeType === 9 ? u : u.ownerDocument).createTextNode(h), h[Tn] = o, o.stateNode = h;
        }
        return gt(o), null;
      case 13:
        if (Ie(Le), h = o.memoizedState, i === null || i.memoizedState !== null && i.memoizedState.dehydrated !== null) {
          if (je && Bt !== null && (o.mode & 1) !== 0 && (o.flags & 128) === 0) Ig(), Ei(), o.flags |= 98560, _ = !1;
          else if (_ = $a(o), h !== null && h.dehydrated !== null) {
            if (i === null) {
              if (!_) throw Error(n(318));
              if (_ = o.memoizedState, _ = _ !== null ? _.dehydrated : null, !_) throw Error(n(317));
              _[Tn] = o;
            } else Ei(), (o.flags & 128) === 0 && (o.memoizedState = null), o.flags |= 4;
            gt(o), _ = !1;
          } else hn !== null && (Ed(hn), hn = null), _ = !0;
          if (!_) return o.flags & 65536 ? o : null;
        }
        return (o.flags & 128) !== 0 ? (o.lanes = u, o) : (h = h !== null, h !== (i !== null && i.memoizedState !== null) && h && (o.child.flags |= 8192, (o.mode & 1) !== 0 && (i === null || (Le.current & 1) !== 0 ? tt === 0 && (tt = 3) : Nd())), o.updateQueue !== null && (o.flags |= 4), gt(o), null);
      case 4:
        return Ii(), vd(i, o), i === null && Zs(o.stateNode.containerInfo), gt(o), null;
      case 10:
        return Zc(o.type._context), gt(o), null;
      case 17:
        return Ct(o.type) && ja(), gt(o), null;
      case 19:
        if (Ie(Le), _ = o.memoizedState, _ === null) return gt(o), null;
        if (h = (o.flags & 128) !== 0, k = _.rendering, k === null) if (h) io(_, !1);
        else {
          if (tt !== 0 || i !== null && (i.flags & 128) !== 0) for (i = o.child; i !== null; ) {
            if (k = Za(i), k !== null) {
              for (o.flags |= 128, io(_, !1), h = k.updateQueue, h !== null && (o.updateQueue = h, o.flags |= 4), o.subtreeFlags = 0, h = u, u = o.child; u !== null; ) _ = u, i = h, _.flags &= 14680066, k = _.alternate, k === null ? (_.childLanes = 0, _.lanes = i, _.child = null, _.subtreeFlags = 0, _.memoizedProps = null, _.memoizedState = null, _.updateQueue = null, _.dependencies = null, _.stateNode = null) : (_.childLanes = k.childLanes, _.lanes = k.lanes, _.child = k.child, _.subtreeFlags = 0, _.deletions = null, _.memoizedProps = k.memoizedProps, _.memoizedState = k.memoizedState, _.updateQueue = k.updateQueue, _.type = k.type, i = k.dependencies, _.dependencies = i === null ? null : { lanes: i.lanes, firstContext: i.firstContext }), u = u.sibling;
              return Me(Le, Le.current & 1 | 2), o.child;
            }
            i = i.sibling;
          }
          _.tail !== null && Ge() > Oi && (o.flags |= 128, h = !0, io(_, !1), o.lanes = 4194304);
        }
        else {
          if (!h) if (i = Za(k), i !== null) {
            if (o.flags |= 128, h = !0, u = i.updateQueue, u !== null && (o.updateQueue = u, o.flags |= 4), io(_, !0), _.tail === null && _.tailMode === "hidden" && !k.alternate && !je) return gt(o), null;
          } else 2 * Ge() - _.renderingStartTime > Oi && u !== 1073741824 && (o.flags |= 128, h = !0, io(_, !1), o.lanes = 4194304);
          _.isBackwards ? (k.sibling = o.child, o.child = k) : (u = _.last, u !== null ? u.sibling = k : o.child = k, _.last = k);
        }
        return _.tail !== null ? (o = _.tail, _.rendering = o, _.tail = o.sibling, _.renderingStartTime = Ge(), o.sibling = null, u = Le.current, Me(Le, h ? u & 1 | 2 : u & 1), o) : (gt(o), null);
      case 22:
      case 23:
        return Rd(), h = o.memoizedState !== null, i !== null && i.memoizedState !== null !== h && (o.flags |= 8192), h && (o.mode & 1) !== 0 ? (Ut & 1073741824) !== 0 && (gt(o), o.subtreeFlags & 6 && (o.flags |= 8192)) : gt(o), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(n(156, o.tag));
  }
  function ik(i, o) {
    switch ($c(o), o.tag) {
      case 1:
        return Ct(o.type) && ja(), i = o.flags, i & 65536 ? (o.flags = i & -65537 | 128, o) : null;
      case 3:
        return Ii(), Ie(bt), Ie(pt), Jc(), i = o.flags, (i & 65536) !== 0 && (i & 128) === 0 ? (o.flags = i & -65537 | 128, o) : null;
      case 5:
        return Qc(o), null;
      case 13:
        if (Ie(Le), i = o.memoizedState, i !== null && i.dehydrated !== null) {
          if (o.alternate === null) throw Error(n(340));
          Ei();
        }
        return i = o.flags, i & 65536 ? (o.flags = i & -65537 | 128, o) : null;
      case 19:
        return Ie(Le), null;
      case 4:
        return Ii(), null;
      case 10:
        return Zc(o.type._context), null;
      case 22:
      case 23:
        return Rd(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var tl = !1, yt = !1, sk = typeof WeakSet == "function" ? WeakSet : Set, ie = null;
  function ji(i, o) {
    var u = i.ref;
    if (u !== null) if (typeof u == "function") try {
      u(null);
    } catch (h) {
      We(i, o, h);
    }
    else u.current = null;
  }
  function _d(i, o, u) {
    try {
      u();
    } catch (h) {
      We(i, o, h);
    }
  }
  var Ry = !1;
  function ok(i, o) {
    if (Rc = xa, i = ug(), Tc(i)) {
      if ("selectionStart" in i) var u = { start: i.selectionStart, end: i.selectionEnd };
      else e: {
        u = (u = i.ownerDocument) && u.defaultView || window;
        var h = u.getSelection && u.getSelection();
        if (h && h.rangeCount !== 0) {
          u = h.anchorNode;
          var y = h.anchorOffset, _ = h.focusNode;
          h = h.focusOffset;
          try {
            u.nodeType, _.nodeType;
          } catch {
            u = null;
            break e;
          }
          var k = 0, R = -1, N = -1, B = 0, K = 0, Y = i, Z = null;
          t: for (; ; ) {
            for (var ne; Y !== u || y !== 0 && Y.nodeType !== 3 || (R = k + y), Y !== _ || h !== 0 && Y.nodeType !== 3 || (N = k + h), Y.nodeType === 3 && (k += Y.nodeValue.length), (ne = Y.firstChild) !== null; )
              Z = Y, Y = ne;
            for (; ; ) {
              if (Y === i) break t;
              if (Z === u && ++B === y && (R = k), Z === _ && ++K === h && (N = k), (ne = Y.nextSibling) !== null) break;
              Y = Z, Z = Y.parentNode;
            }
            Y = ne;
          }
          u = R === -1 || N === -1 ? null : { start: R, end: N };
        } else u = null;
      }
      u = u || { start: 0, end: 0 };
    } else u = null;
    for (Nc = { focusedElem: i, selectionRange: u }, xa = !1, ie = o; ie !== null; ) if (o = ie, i = o.child, (o.subtreeFlags & 1028) !== 0 && i !== null) i.return = o, ie = i;
    else for (; ie !== null; ) {
      o = ie;
      try {
        var se = o.alternate;
        if ((o.flags & 1024) !== 0) switch (o.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (se !== null) {
              var ue = se.memoizedProps, Ke = se.memoizedState, $ = o.stateNode, D = $.getSnapshotBeforeUpdate(o.elementType === o.type ? ue : pn(o.type, ue), Ke);
              $.__reactInternalSnapshotBeforeUpdate = D;
            }
            break;
          case 3:
            var V = o.stateNode.containerInfo;
            V.nodeType === 1 ? V.textContent = "" : V.nodeType === 9 && V.documentElement && V.removeChild(V.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(n(163));
        }
      } catch (Q) {
        We(o, o.return, Q);
      }
      if (i = o.sibling, i !== null) {
        i.return = o.return, ie = i;
        break;
      }
      ie = o.return;
    }
    return se = Ry, Ry = !1, se;
  }
  function so(i, o, u) {
    var h = o.updateQueue;
    if (h = h !== null ? h.lastEffect : null, h !== null) {
      var y = h = h.next;
      do {
        if ((y.tag & i) === i) {
          var _ = y.destroy;
          y.destroy = void 0, _ !== void 0 && _d(o, u, _);
        }
        y = y.next;
      } while (y !== h);
    }
  }
  function nl(i, o) {
    if (o = o.updateQueue, o = o !== null ? o.lastEffect : null, o !== null) {
      var u = o = o.next;
      do {
        if ((u.tag & i) === i) {
          var h = u.create;
          u.destroy = h();
        }
        u = u.next;
      } while (u !== o);
    }
  }
  function Sd(i) {
    var o = i.ref;
    if (o !== null) {
      var u = i.stateNode;
      switch (i.tag) {
        case 5:
          i = u;
          break;
        default:
          i = u;
      }
      typeof o == "function" ? o(i) : o.current = i;
    }
  }
  function Ny(i) {
    var o = i.alternate;
    o !== null && (i.alternate = null, Ny(o)), i.child = null, i.deletions = null, i.sibling = null, i.tag === 5 && (o = i.stateNode, o !== null && (delete o[Tn], delete o[Ks], delete o[Fc], delete o[BA], delete o[UA])), i.stateNode = null, i.return = null, i.dependencies = null, i.memoizedProps = null, i.memoizedState = null, i.pendingProps = null, i.stateNode = null, i.updateQueue = null;
  }
  function Iy(i) {
    return i.tag === 5 || i.tag === 3 || i.tag === 4;
  }
  function Dy(i) {
    e: for (; ; ) {
      for (; i.sibling === null; ) {
        if (i.return === null || Iy(i.return)) return null;
        i = i.return;
      }
      for (i.sibling.return = i.return, i = i.sibling; i.tag !== 5 && i.tag !== 6 && i.tag !== 18; ) {
        if (i.flags & 2 || i.child === null || i.tag === 4) continue e;
        i.child.return = i, i = i.child;
      }
      if (!(i.flags & 2)) return i.stateNode;
    }
  }
  function xd(i, o, u) {
    var h = i.tag;
    if (h === 5 || h === 6) i = i.stateNode, o ? u.nodeType === 8 ? u.parentNode.insertBefore(i, o) : u.insertBefore(i, o) : (u.nodeType === 8 ? (o = u.parentNode, o.insertBefore(i, u)) : (o = u, o.appendChild(i)), u = u._reactRootContainer, u != null || o.onclick !== null || (o.onclick = Ia));
    else if (h !== 4 && (i = i.child, i !== null)) for (xd(i, o, u), i = i.sibling; i !== null; ) xd(i, o, u), i = i.sibling;
  }
  function wd(i, o, u) {
    var h = i.tag;
    if (h === 5 || h === 6) i = i.stateNode, o ? u.insertBefore(i, o) : u.appendChild(i);
    else if (h !== 4 && (i = i.child, i !== null)) for (wd(i, o, u), i = i.sibling; i !== null; ) wd(i, o, u), i = i.sibling;
  }
  var ut = null, mn = !1;
  function cr(i, o, u) {
    for (u = u.child; u !== null; ) jy(i, o, u), u = u.sibling;
  }
  function jy(i, o, u) {
    if (wn && typeof wn.onCommitFiberUnmount == "function") try {
      wn.onCommitFiberUnmount(ma, u);
    } catch {
    }
    switch (u.tag) {
      case 5:
        yt || ji(u, o);
      case 6:
        var h = ut, y = mn;
        ut = null, cr(i, o, u), ut = h, mn = y, ut !== null && (mn ? (i = ut, u = u.stateNode, i.nodeType === 8 ? i.parentNode.removeChild(u) : i.removeChild(u)) : ut.removeChild(u.stateNode));
        break;
      case 18:
        ut !== null && (mn ? (i = ut, u = u.stateNode, i.nodeType === 8 ? jc(i.parentNode, u) : i.nodeType === 1 && jc(i, u), Os(i)) : jc(ut, u.stateNode));
        break;
      case 4:
        h = ut, y = mn, ut = u.stateNode.containerInfo, mn = !0, cr(i, o, u), ut = h, mn = y;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!yt && (h = u.updateQueue, h !== null && (h = h.lastEffect, h !== null))) {
          y = h = h.next;
          do {
            var _ = y, k = _.destroy;
            _ = _.tag, k !== void 0 && ((_ & 2) !== 0 || (_ & 4) !== 0) && _d(u, o, k), y = y.next;
          } while (y !== h);
        }
        cr(i, o, u);
        break;
      case 1:
        if (!yt && (ji(u, o), h = u.stateNode, typeof h.componentWillUnmount == "function")) try {
          h.props = u.memoizedProps, h.state = u.memoizedState, h.componentWillUnmount();
        } catch (R) {
          We(u, o, R);
        }
        cr(i, o, u);
        break;
      case 21:
        cr(i, o, u);
        break;
      case 22:
        u.mode & 1 ? (yt = (h = yt) || u.memoizedState !== null, cr(i, o, u), yt = h) : cr(i, o, u);
        break;
      default:
        cr(i, o, u);
    }
  }
  function Fy(i) {
    var o = i.updateQueue;
    if (o !== null) {
      i.updateQueue = null;
      var u = i.stateNode;
      u === null && (u = i.stateNode = new sk()), o.forEach(function(h) {
        var y = mk.bind(null, i, h);
        u.has(h) || (u.add(h), h.then(y, y));
      });
    }
  }
  function gn(i, o) {
    var u = o.deletions;
    if (u !== null) for (var h = 0; h < u.length; h++) {
      var y = u[h];
      try {
        var _ = i, k = o, R = k;
        e: for (; R !== null; ) {
          switch (R.tag) {
            case 5:
              ut = R.stateNode, mn = !1;
              break e;
            case 3:
              ut = R.stateNode.containerInfo, mn = !0;
              break e;
            case 4:
              ut = R.stateNode.containerInfo, mn = !0;
              break e;
          }
          R = R.return;
        }
        if (ut === null) throw Error(n(160));
        jy(_, k, y), ut = null, mn = !1;
        var N = y.alternate;
        N !== null && (N.return = null), y.return = null;
      } catch (B) {
        We(y, o, B);
      }
    }
    if (o.subtreeFlags & 12854) for (o = o.child; o !== null; ) Oy(o, i), o = o.sibling;
  }
  function Oy(i, o) {
    var u = i.alternate, h = i.flags;
    switch (i.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (gn(o, i), bn(i), h & 4) {
          try {
            so(3, i, i.return), nl(3, i);
          } catch (ue) {
            We(i, i.return, ue);
          }
          try {
            so(5, i, i.return);
          } catch (ue) {
            We(i, i.return, ue);
          }
        }
        break;
      case 1:
        gn(o, i), bn(i), h & 512 && u !== null && ji(u, u.return);
        break;
      case 5:
        if (gn(o, i), bn(i), h & 512 && u !== null && ji(u, u.return), i.flags & 32) {
          var y = i.stateNode;
          try {
            bs(y, "");
          } catch (ue) {
            We(i, i.return, ue);
          }
        }
        if (h & 4 && (y = i.stateNode, y != null)) {
          var _ = i.memoizedProps, k = u !== null ? u.memoizedProps : _, R = i.type, N = i.updateQueue;
          if (i.updateQueue = null, N !== null) try {
            R === "input" && _.type === "radio" && _.name != null && dm(y, _), Ju(R, k);
            var B = Ju(R, _);
            for (k = 0; k < N.length; k += 2) {
              var K = N[k], Y = N[k + 1];
              K === "style" ? _m(y, Y) : K === "dangerouslySetInnerHTML" ? ym(y, Y) : K === "children" ? bs(y, Y) : C(y, K, Y, B);
            }
            switch (R) {
              case "input":
                Ku(y, _);
                break;
              case "textarea":
                pm(y, _);
                break;
              case "select":
                var Z = y._wrapperState.wasMultiple;
                y._wrapperState.wasMultiple = !!_.multiple;
                var ne = _.value;
                ne != null ? pi(y, !!_.multiple, ne, !1) : Z !== !!_.multiple && (_.defaultValue != null ? pi(
                  y,
                  !!_.multiple,
                  _.defaultValue,
                  !0
                ) : pi(y, !!_.multiple, _.multiple ? [] : "", !1));
            }
            y[Ks] = _;
          } catch (ue) {
            We(i, i.return, ue);
          }
        }
        break;
      case 6:
        if (gn(o, i), bn(i), h & 4) {
          if (i.stateNode === null) throw Error(n(162));
          y = i.stateNode, _ = i.memoizedProps;
          try {
            y.nodeValue = _;
          } catch (ue) {
            We(i, i.return, ue);
          }
        }
        break;
      case 3:
        if (gn(o, i), bn(i), h & 4 && u !== null && u.memoizedState.isDehydrated) try {
          Os(o.containerInfo);
        } catch (ue) {
          We(i, i.return, ue);
        }
        break;
      case 4:
        gn(o, i), bn(i);
        break;
      case 13:
        gn(o, i), bn(i), y = i.child, y.flags & 8192 && (_ = y.memoizedState !== null, y.stateNode.isHidden = _, !_ || y.alternate !== null && y.alternate.memoizedState !== null || (kd = Ge())), h & 4 && Fy(i);
        break;
      case 22:
        if (K = u !== null && u.memoizedState !== null, i.mode & 1 ? (yt = (B = yt) || K, gn(o, i), yt = B) : gn(o, i), bn(i), h & 8192) {
          if (B = i.memoizedState !== null, (i.stateNode.isHidden = B) && !K && (i.mode & 1) !== 0) for (ie = i, K = i.child; K !== null; ) {
            for (Y = ie = K; ie !== null; ) {
              switch (Z = ie, ne = Z.child, Z.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  so(4, Z, Z.return);
                  break;
                case 1:
                  ji(Z, Z.return);
                  var se = Z.stateNode;
                  if (typeof se.componentWillUnmount == "function") {
                    h = Z, u = Z.return;
                    try {
                      o = h, se.props = o.memoizedProps, se.state = o.memoizedState, se.componentWillUnmount();
                    } catch (ue) {
                      We(h, u, ue);
                    }
                  }
                  break;
                case 5:
                  ji(Z, Z.return);
                  break;
                case 22:
                  if (Z.memoizedState !== null) {
                    $y(Y);
                    continue;
                  }
              }
              ne !== null ? (ne.return = Z, ie = ne) : $y(Y);
            }
            K = K.sibling;
          }
          e: for (K = null, Y = i; ; ) {
            if (Y.tag === 5) {
              if (K === null) {
                K = Y;
                try {
                  y = Y.stateNode, B ? (_ = y.style, typeof _.setProperty == "function" ? _.setProperty("display", "none", "important") : _.display = "none") : (R = Y.stateNode, N = Y.memoizedProps.style, k = N != null && N.hasOwnProperty("display") ? N.display : null, R.style.display = vm("display", k));
                } catch (ue) {
                  We(i, i.return, ue);
                }
              }
            } else if (Y.tag === 6) {
              if (K === null) try {
                Y.stateNode.nodeValue = B ? "" : Y.memoizedProps;
              } catch (ue) {
                We(i, i.return, ue);
              }
            } else if ((Y.tag !== 22 && Y.tag !== 23 || Y.memoizedState === null || Y === i) && Y.child !== null) {
              Y.child.return = Y, Y = Y.child;
              continue;
            }
            if (Y === i) break e;
            for (; Y.sibling === null; ) {
              if (Y.return === null || Y.return === i) break e;
              K === Y && (K = null), Y = Y.return;
            }
            K === Y && (K = null), Y.sibling.return = Y.return, Y = Y.sibling;
          }
        }
        break;
      case 19:
        gn(o, i), bn(i), h & 4 && Fy(i);
        break;
      case 21:
        break;
      default:
        gn(
          o,
          i
        ), bn(i);
    }
  }
  function bn(i) {
    var o = i.flags;
    if (o & 2) {
      try {
        e: {
          for (var u = i.return; u !== null; ) {
            if (Iy(u)) {
              var h = u;
              break e;
            }
            u = u.return;
          }
          throw Error(n(160));
        }
        switch (h.tag) {
          case 5:
            var y = h.stateNode;
            h.flags & 32 && (bs(y, ""), h.flags &= -33);
            var _ = Dy(i);
            wd(i, _, y);
            break;
          case 3:
          case 4:
            var k = h.stateNode.containerInfo, R = Dy(i);
            xd(i, R, k);
            break;
          default:
            throw Error(n(161));
        }
      } catch (N) {
        We(i, i.return, N);
      }
      i.flags &= -3;
    }
    o & 4096 && (i.flags &= -4097);
  }
  function ak(i, o, u) {
    ie = i, Ly(i);
  }
  function Ly(i, o, u) {
    for (var h = (i.mode & 1) !== 0; ie !== null; ) {
      var y = ie, _ = y.child;
      if (y.tag === 22 && h) {
        var k = y.memoizedState !== null || tl;
        if (!k) {
          var R = y.alternate, N = R !== null && R.memoizedState !== null || yt;
          R = tl;
          var B = yt;
          if (tl = k, (yt = N) && !B) for (ie = y; ie !== null; ) k = ie, N = k.child, k.tag === 22 && k.memoizedState !== null ? Vy(y) : N !== null ? (N.return = k, ie = N) : Vy(y);
          for (; _ !== null; ) ie = _, Ly(_), _ = _.sibling;
          ie = y, tl = R, yt = B;
        }
        zy(i);
      } else (y.subtreeFlags & 8772) !== 0 && _ !== null ? (_.return = y, ie = _) : zy(i);
    }
  }
  function zy(i) {
    for (; ie !== null; ) {
      var o = ie;
      if ((o.flags & 8772) !== 0) {
        var u = o.alternate;
        try {
          if ((o.flags & 8772) !== 0) switch (o.tag) {
            case 0:
            case 11:
            case 15:
              yt || nl(5, o);
              break;
            case 1:
              var h = o.stateNode;
              if (o.flags & 4 && !yt) if (u === null) h.componentDidMount();
              else {
                var y = o.elementType === o.type ? u.memoizedProps : pn(o.type, u.memoizedProps);
                h.componentDidUpdate(y, u.memoizedState, h.__reactInternalSnapshotBeforeUpdate);
              }
              var _ = o.updateQueue;
              _ !== null && $g(o, _, h);
              break;
            case 3:
              var k = o.updateQueue;
              if (k !== null) {
                if (u = null, o.child !== null) switch (o.child.tag) {
                  case 5:
                    u = o.child.stateNode;
                    break;
                  case 1:
                    u = o.child.stateNode;
                }
                $g(o, k, u);
              }
              break;
            case 5:
              var R = o.stateNode;
              if (u === null && o.flags & 4) {
                u = R;
                var N = o.memoizedProps;
                switch (o.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    N.autoFocus && u.focus();
                    break;
                  case "img":
                    N.src && (u.src = N.src);
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
              if (o.memoizedState === null) {
                var B = o.alternate;
                if (B !== null) {
                  var K = B.memoizedState;
                  if (K !== null) {
                    var Y = K.dehydrated;
                    Y !== null && Os(Y);
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
              throw Error(n(163));
          }
          yt || o.flags & 512 && Sd(o);
        } catch (Z) {
          We(o, o.return, Z);
        }
      }
      if (o === i) {
        ie = null;
        break;
      }
      if (u = o.sibling, u !== null) {
        u.return = o.return, ie = u;
        break;
      }
      ie = o.return;
    }
  }
  function $y(i) {
    for (; ie !== null; ) {
      var o = ie;
      if (o === i) {
        ie = null;
        break;
      }
      var u = o.sibling;
      if (u !== null) {
        u.return = o.return, ie = u;
        break;
      }
      ie = o.return;
    }
  }
  function Vy(i) {
    for (; ie !== null; ) {
      var o = ie;
      try {
        switch (o.tag) {
          case 0:
          case 11:
          case 15:
            var u = o.return;
            try {
              nl(4, o);
            } catch (N) {
              We(o, u, N);
            }
            break;
          case 1:
            var h = o.stateNode;
            if (typeof h.componentDidMount == "function") {
              var y = o.return;
              try {
                h.componentDidMount();
              } catch (N) {
                We(o, y, N);
              }
            }
            var _ = o.return;
            try {
              Sd(o);
            } catch (N) {
              We(o, _, N);
            }
            break;
          case 5:
            var k = o.return;
            try {
              Sd(o);
            } catch (N) {
              We(o, k, N);
            }
        }
      } catch (N) {
        We(o, o.return, N);
      }
      if (o === i) {
        ie = null;
        break;
      }
      var R = o.sibling;
      if (R !== null) {
        R.return = o.return, ie = R;
        break;
      }
      ie = o.return;
    }
  }
  var lk = Math.ceil, rl = M.ReactCurrentDispatcher, Td = M.ReactCurrentOwner, tn = M.ReactCurrentBatchConfig, xe = 0, st = null, qe = null, ct = 0, Ut = 0, Fi = sr(0), tt = 0, oo = null, Ur = 0, il = 0, Ad = 0, ao = null, Et = null, kd = 0, Oi = 1 / 0, Hn = null, sl = !1, bd = null, dr = null, ol = !1, fr = null, al = 0, lo = 0, Cd = null, ll = -1, ul = 0;
  function wt() {
    return (xe & 6) !== 0 ? Ge() : ll !== -1 ? ll : ll = Ge();
  }
  function hr(i) {
    return (i.mode & 1) === 0 ? 1 : (xe & 2) !== 0 && ct !== 0 ? ct & -ct : WA.transition !== null ? (ul === 0 && (ul = Dm()), ul) : (i = Ae, i !== 0 || (i = window.event, i = i === void 0 ? 16 : Um(i.type)), i);
  }
  function yn(i, o, u, h) {
    if (50 < lo) throw lo = 0, Cd = null, Error(n(185));
    Ns(i, u, h), ((xe & 2) === 0 || i !== st) && (i === st && ((xe & 2) === 0 && (il |= u), tt === 4 && pr(i, ct)), Mt(i, h), u === 1 && xe === 0 && (o.mode & 1) === 0 && (Oi = Ge() + 500, Oa && ar()));
  }
  function Mt(i, o) {
    var u = i.callbackNode;
    WT(i, o);
    var h = va(i, i === st ? ct : 0);
    if (h === 0) u !== null && Rm(u), i.callbackNode = null, i.callbackPriority = 0;
    else if (o = h & -h, i.callbackPriority !== o) {
      if (u != null && Rm(u), o === 1) i.tag === 0 ? HA(Uy.bind(null, i)) : Pg(Uy.bind(null, i)), $A(function() {
        (xe & 6) === 0 && ar();
      }), u = null;
      else {
        switch (jm(h)) {
          case 1:
            u = oc;
            break;
          case 4:
            u = Nm;
            break;
          case 16:
            u = pa;
            break;
          case 536870912:
            u = Im;
            break;
          default:
            u = pa;
        }
        u = Qy(u, By.bind(null, i));
      }
      i.callbackPriority = o, i.callbackNode = u;
    }
  }
  function By(i, o) {
    if (ll = -1, ul = 0, (xe & 6) !== 0) throw Error(n(327));
    var u = i.callbackNode;
    if (Li() && i.callbackNode !== u) return null;
    var h = va(i, i === st ? ct : 0);
    if (h === 0) return null;
    if ((h & 30) !== 0 || (h & i.expiredLanes) !== 0 || o) o = cl(i, h);
    else {
      o = h;
      var y = xe;
      xe |= 2;
      var _ = Wy();
      (st !== i || ct !== o) && (Hn = null, Oi = Ge() + 500, Wr(i, o));
      do
        try {
          dk();
          break;
        } catch (R) {
          Hy(i, R);
        }
      while (!0);
      Wc(), rl.current = _, xe = y, qe !== null ? o = 0 : (st = null, ct = 0, o = tt);
    }
    if (o !== 0) {
      if (o === 2 && (y = ac(i), y !== 0 && (h = y, o = Pd(i, y))), o === 1) throw u = oo, Wr(i, 0), pr(i, h), Mt(i, Ge()), u;
      if (o === 6) pr(i, h);
      else {
        if (y = i.current.alternate, (h & 30) === 0 && !uk(y) && (o = cl(i, h), o === 2 && (_ = ac(i), _ !== 0 && (h = _, o = Pd(i, _))), o === 1)) throw u = oo, Wr(i, 0), pr(i, h), Mt(i, Ge()), u;
        switch (i.finishedWork = y, i.finishedLanes = h, o) {
          case 0:
          case 1:
            throw Error(n(345));
          case 2:
            Zr(i, Et, Hn);
            break;
          case 3:
            if (pr(i, h), (h & 130023424) === h && (o = kd + 500 - Ge(), 10 < o)) {
              if (va(i, 0) !== 0) break;
              if (y = i.suspendedLanes, (y & h) !== h) {
                wt(), i.pingedLanes |= i.suspendedLanes & y;
                break;
              }
              i.timeoutHandle = Dc(Zr.bind(null, i, Et, Hn), o);
              break;
            }
            Zr(i, Et, Hn);
            break;
          case 4:
            if (pr(i, h), (h & 4194240) === h) break;
            for (o = i.eventTimes, y = -1; 0 < h; ) {
              var k = 31 - dn(h);
              _ = 1 << k, k = o[k], k > y && (y = k), h &= ~_;
            }
            if (h = y, h = Ge() - h, h = (120 > h ? 120 : 480 > h ? 480 : 1080 > h ? 1080 : 1920 > h ? 1920 : 3e3 > h ? 3e3 : 4320 > h ? 4320 : 1960 * lk(h / 1960)) - h, 10 < h) {
              i.timeoutHandle = Dc(Zr.bind(null, i, Et, Hn), h);
              break;
            }
            Zr(i, Et, Hn);
            break;
          case 5:
            Zr(i, Et, Hn);
            break;
          default:
            throw Error(n(329));
        }
      }
    }
    return Mt(i, Ge()), i.callbackNode === u ? By.bind(null, i) : null;
  }
  function Pd(i, o) {
    var u = ao;
    return i.current.memoizedState.isDehydrated && (Wr(i, o).flags |= 256), i = cl(i, o), i !== 2 && (o = Et, Et = u, o !== null && Ed(o)), i;
  }
  function Ed(i) {
    Et === null ? Et = i : Et.push.apply(Et, i);
  }
  function uk(i) {
    for (var o = i; ; ) {
      if (o.flags & 16384) {
        var u = o.updateQueue;
        if (u !== null && (u = u.stores, u !== null)) for (var h = 0; h < u.length; h++) {
          var y = u[h], _ = y.getSnapshot;
          y = y.value;
          try {
            if (!fn(_(), y)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (u = o.child, o.subtreeFlags & 16384 && u !== null) u.return = o, o = u;
      else {
        if (o === i) break;
        for (; o.sibling === null; ) {
          if (o.return === null || o.return === i) return !0;
          o = o.return;
        }
        o.sibling.return = o.return, o = o.sibling;
      }
    }
    return !0;
  }
  function pr(i, o) {
    for (o &= ~Ad, o &= ~il, i.suspendedLanes |= o, i.pingedLanes &= ~o, i = i.expirationTimes; 0 < o; ) {
      var u = 31 - dn(o), h = 1 << u;
      i[u] = -1, o &= ~h;
    }
  }
  function Uy(i) {
    if ((xe & 6) !== 0) throw Error(n(327));
    Li();
    var o = va(i, 0);
    if ((o & 1) === 0) return Mt(i, Ge()), null;
    var u = cl(i, o);
    if (i.tag !== 0 && u === 2) {
      var h = ac(i);
      h !== 0 && (o = h, u = Pd(i, h));
    }
    if (u === 1) throw u = oo, Wr(i, 0), pr(i, o), Mt(i, Ge()), u;
    if (u === 6) throw Error(n(345));
    return i.finishedWork = i.current.alternate, i.finishedLanes = o, Zr(i, Et, Hn), Mt(i, Ge()), null;
  }
  function Md(i, o) {
    var u = xe;
    xe |= 1;
    try {
      return i(o);
    } finally {
      xe = u, xe === 0 && (Oi = Ge() + 500, Oa && ar());
    }
  }
  function Hr(i) {
    fr !== null && fr.tag === 0 && (xe & 6) === 0 && Li();
    var o = xe;
    xe |= 1;
    var u = tn.transition, h = Ae;
    try {
      if (tn.transition = null, Ae = 1, i) return i();
    } finally {
      Ae = h, tn.transition = u, xe = o, (xe & 6) === 0 && ar();
    }
  }
  function Rd() {
    Ut = Fi.current, Ie(Fi);
  }
  function Wr(i, o) {
    i.finishedWork = null, i.finishedLanes = 0;
    var u = i.timeoutHandle;
    if (u !== -1 && (i.timeoutHandle = -1, zA(u)), qe !== null) for (u = qe.return; u !== null; ) {
      var h = u;
      switch ($c(h), h.tag) {
        case 1:
          h = h.type.childContextTypes, h != null && ja();
          break;
        case 3:
          Ii(), Ie(bt), Ie(pt), Jc();
          break;
        case 5:
          Qc(h);
          break;
        case 4:
          Ii();
          break;
        case 13:
          Ie(Le);
          break;
        case 19:
          Ie(Le);
          break;
        case 10:
          Zc(h.type._context);
          break;
        case 22:
        case 23:
          Rd();
      }
      u = u.return;
    }
    if (st = i, qe = i = mr(i.current, null), ct = Ut = o, tt = 0, oo = null, Ad = il = Ur = 0, Et = ao = null, $r !== null) {
      for (o = 0; o < $r.length; o++) if (u = $r[o], h = u.interleaved, h !== null) {
        u.interleaved = null;
        var y = h.next, _ = u.pending;
        if (_ !== null) {
          var k = _.next;
          _.next = y, h.next = k;
        }
        u.pending = h;
      }
      $r = null;
    }
    return i;
  }
  function Hy(i, o) {
    do {
      var u = qe;
      try {
        if (Wc(), Ga.current = Qa, Ka) {
          for (var h = ze.memoizedState; h !== null; ) {
            var y = h.queue;
            y !== null && (y.pending = null), h = h.next;
          }
          Ka = !1;
        }
        if (Br = 0, it = et = ze = null, eo = !1, to = 0, Td.current = null, u === null || u.return === null) {
          tt = 1, oo = o, qe = null;
          break;
        }
        e: {
          var _ = i, k = u.return, R = u, N = o;
          if (o = ct, R.flags |= 32768, N !== null && typeof N == "object" && typeof N.then == "function") {
            var B = N, K = R, Y = K.tag;
            if ((K.mode & 1) === 0 && (Y === 0 || Y === 11 || Y === 15)) {
              var Z = K.alternate;
              Z ? (K.updateQueue = Z.updateQueue, K.memoizedState = Z.memoizedState, K.lanes = Z.lanes) : (K.updateQueue = null, K.memoizedState = null);
            }
            var ne = my(k);
            if (ne !== null) {
              ne.flags &= -257, gy(ne, k, R, _, o), ne.mode & 1 && py(_, B, o), o = ne, N = B;
              var se = o.updateQueue;
              if (se === null) {
                var ue = /* @__PURE__ */ new Set();
                ue.add(N), o.updateQueue = ue;
              } else se.add(N);
              break e;
            } else {
              if ((o & 1) === 0) {
                py(_, B, o), Nd();
                break e;
              }
              N = Error(n(426));
            }
          } else if (je && R.mode & 1) {
            var Ke = my(k);
            if (Ke !== null) {
              (Ke.flags & 65536) === 0 && (Ke.flags |= 256), gy(Ke, k, R, _, o), Uc(Di(N, R));
              break e;
            }
          }
          _ = N = Di(N, R), tt !== 4 && (tt = 2), ao === null ? ao = [_] : ao.push(_), _ = k;
          do {
            switch (_.tag) {
              case 3:
                _.flags |= 65536, o &= -o, _.lanes |= o;
                var $ = fy(_, N, o);
                zg(_, $);
                break e;
              case 1:
                R = N;
                var D = _.type, V = _.stateNode;
                if ((_.flags & 128) === 0 && (typeof D.getDerivedStateFromError == "function" || V !== null && typeof V.componentDidCatch == "function" && (dr === null || !dr.has(V)))) {
                  _.flags |= 65536, o &= -o, _.lanes |= o;
                  var Q = hy(_, R, o);
                  zg(_, Q);
                  break e;
                }
            }
            _ = _.return;
          } while (_ !== null);
        }
        Gy(u);
      } catch (ce) {
        o = ce, qe === u && u !== null && (qe = u = u.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Wy() {
    var i = rl.current;
    return rl.current = Qa, i === null ? Qa : i;
  }
  function Nd() {
    (tt === 0 || tt === 3 || tt === 2) && (tt = 4), st === null || (Ur & 268435455) === 0 && (il & 268435455) === 0 || pr(st, ct);
  }
  function cl(i, o) {
    var u = xe;
    xe |= 2;
    var h = Wy();
    (st !== i || ct !== o) && (Hn = null, Wr(i, o));
    do
      try {
        ck();
        break;
      } catch (y) {
        Hy(i, y);
      }
    while (!0);
    if (Wc(), xe = u, rl.current = h, qe !== null) throw Error(n(261));
    return st = null, ct = 0, tt;
  }
  function ck() {
    for (; qe !== null; ) Zy(qe);
  }
  function dk() {
    for (; qe !== null && !FT(); ) Zy(qe);
  }
  function Zy(i) {
    var o = qy(i.alternate, i, Ut);
    i.memoizedProps = i.pendingProps, o === null ? Gy(i) : qe = o, Td.current = null;
  }
  function Gy(i) {
    var o = i;
    do {
      var u = o.alternate;
      if (i = o.return, (o.flags & 32768) === 0) {
        if (u = rk(u, o, Ut), u !== null) {
          qe = u;
          return;
        }
      } else {
        if (u = ik(u, o), u !== null) {
          u.flags &= 32767, qe = u;
          return;
        }
        if (i !== null) i.flags |= 32768, i.subtreeFlags = 0, i.deletions = null;
        else {
          tt = 6, qe = null;
          return;
        }
      }
      if (o = o.sibling, o !== null) {
        qe = o;
        return;
      }
      qe = o = i;
    } while (o !== null);
    tt === 0 && (tt = 5);
  }
  function Zr(i, o, u) {
    var h = Ae, y = tn.transition;
    try {
      tn.transition = null, Ae = 1, fk(i, o, u, h);
    } finally {
      tn.transition = y, Ae = h;
    }
    return null;
  }
  function fk(i, o, u, h) {
    do
      Li();
    while (fr !== null);
    if ((xe & 6) !== 0) throw Error(n(327));
    u = i.finishedWork;
    var y = i.finishedLanes;
    if (u === null) return null;
    if (i.finishedWork = null, i.finishedLanes = 0, u === i.current) throw Error(n(177));
    i.callbackNode = null, i.callbackPriority = 0;
    var _ = u.lanes | u.childLanes;
    if (ZT(i, _), i === st && (qe = st = null, ct = 0), (u.subtreeFlags & 2064) === 0 && (u.flags & 2064) === 0 || ol || (ol = !0, Qy(pa, function() {
      return Li(), null;
    })), _ = (u.flags & 15990) !== 0, (u.subtreeFlags & 15990) !== 0 || _) {
      _ = tn.transition, tn.transition = null;
      var k = Ae;
      Ae = 1;
      var R = xe;
      xe |= 4, Td.current = null, ok(i, u), Oy(u, i), NA(Nc), xa = !!Rc, Nc = Rc = null, i.current = u, ak(u), OT(), xe = R, Ae = k, tn.transition = _;
    } else i.current = u;
    if (ol && (ol = !1, fr = i, al = y), _ = i.pendingLanes, _ === 0 && (dr = null), $T(u.stateNode), Mt(i, Ge()), o !== null) for (h = i.onRecoverableError, u = 0; u < o.length; u++) y = o[u], h(y.value, { componentStack: y.stack, digest: y.digest });
    if (sl) throw sl = !1, i = bd, bd = null, i;
    return (al & 1) !== 0 && i.tag !== 0 && Li(), _ = i.pendingLanes, (_ & 1) !== 0 ? i === Cd ? lo++ : (lo = 0, Cd = i) : lo = 0, ar(), null;
  }
  function Li() {
    if (fr !== null) {
      var i = jm(al), o = tn.transition, u = Ae;
      try {
        if (tn.transition = null, Ae = 16 > i ? 16 : i, fr === null) var h = !1;
        else {
          if (i = fr, fr = null, al = 0, (xe & 6) !== 0) throw Error(n(331));
          var y = xe;
          for (xe |= 4, ie = i.current; ie !== null; ) {
            var _ = ie, k = _.child;
            if ((ie.flags & 16) !== 0) {
              var R = _.deletions;
              if (R !== null) {
                for (var N = 0; N < R.length; N++) {
                  var B = R[N];
                  for (ie = B; ie !== null; ) {
                    var K = ie;
                    switch (K.tag) {
                      case 0:
                      case 11:
                      case 15:
                        so(8, K, _);
                    }
                    var Y = K.child;
                    if (Y !== null) Y.return = K, ie = Y;
                    else for (; ie !== null; ) {
                      K = ie;
                      var Z = K.sibling, ne = K.return;
                      if (Ny(K), K === B) {
                        ie = null;
                        break;
                      }
                      if (Z !== null) {
                        Z.return = ne, ie = Z;
                        break;
                      }
                      ie = ne;
                    }
                  }
                }
                var se = _.alternate;
                if (se !== null) {
                  var ue = se.child;
                  if (ue !== null) {
                    se.child = null;
                    do {
                      var Ke = ue.sibling;
                      ue.sibling = null, ue = Ke;
                    } while (ue !== null);
                  }
                }
                ie = _;
              }
            }
            if ((_.subtreeFlags & 2064) !== 0 && k !== null) k.return = _, ie = k;
            else e: for (; ie !== null; ) {
              if (_ = ie, (_.flags & 2048) !== 0) switch (_.tag) {
                case 0:
                case 11:
                case 15:
                  so(9, _, _.return);
              }
              var $ = _.sibling;
              if ($ !== null) {
                $.return = _.return, ie = $;
                break e;
              }
              ie = _.return;
            }
          }
          var D = i.current;
          for (ie = D; ie !== null; ) {
            k = ie;
            var V = k.child;
            if ((k.subtreeFlags & 2064) !== 0 && V !== null) V.return = k, ie = V;
            else e: for (k = D; ie !== null; ) {
              if (R = ie, (R.flags & 2048) !== 0) try {
                switch (R.tag) {
                  case 0:
                  case 11:
                  case 15:
                    nl(9, R);
                }
              } catch (ce) {
                We(R, R.return, ce);
              }
              if (R === k) {
                ie = null;
                break e;
              }
              var Q = R.sibling;
              if (Q !== null) {
                Q.return = R.return, ie = Q;
                break e;
              }
              ie = R.return;
            }
          }
          if (xe = y, ar(), wn && typeof wn.onPostCommitFiberRoot == "function") try {
            wn.onPostCommitFiberRoot(ma, i);
          } catch {
          }
          h = !0;
        }
        return h;
      } finally {
        Ae = u, tn.transition = o;
      }
    }
    return !1;
  }
  function Ky(i, o, u) {
    o = Di(u, o), o = fy(i, o, 1), i = ur(i, o, 1), o = wt(), i !== null && (Ns(i, 1, o), Mt(i, o));
  }
  function We(i, o, u) {
    if (i.tag === 3) Ky(i, i, u);
    else for (; o !== null; ) {
      if (o.tag === 3) {
        Ky(o, i, u);
        break;
      } else if (o.tag === 1) {
        var h = o.stateNode;
        if (typeof o.type.getDerivedStateFromError == "function" || typeof h.componentDidCatch == "function" && (dr === null || !dr.has(h))) {
          i = Di(u, i), i = hy(o, i, 1), o = ur(o, i, 1), i = wt(), o !== null && (Ns(o, 1, i), Mt(o, i));
          break;
        }
      }
      o = o.return;
    }
  }
  function hk(i, o, u) {
    var h = i.pingCache;
    h !== null && h.delete(o), o = wt(), i.pingedLanes |= i.suspendedLanes & u, st === i && (ct & u) === u && (tt === 4 || tt === 3 && (ct & 130023424) === ct && 500 > Ge() - kd ? Wr(i, 0) : Ad |= u), Mt(i, o);
  }
  function Yy(i, o) {
    o === 0 && ((i.mode & 1) === 0 ? o = 1 : (o = ya, ya <<= 1, (ya & 130023424) === 0 && (ya = 4194304)));
    var u = wt();
    i = Vn(i, o), i !== null && (Ns(i, o, u), Mt(i, u));
  }
  function pk(i) {
    var o = i.memoizedState, u = 0;
    o !== null && (u = o.retryLane), Yy(i, u);
  }
  function mk(i, o) {
    var u = 0;
    switch (i.tag) {
      case 13:
        var h = i.stateNode, y = i.memoizedState;
        y !== null && (u = y.retryLane);
        break;
      case 19:
        h = i.stateNode;
        break;
      default:
        throw Error(n(314));
    }
    h !== null && h.delete(o), Yy(i, u);
  }
  var qy;
  qy = function(i, o, u) {
    if (i !== null) if (i.memoizedProps !== o.pendingProps || bt.current) Pt = !0;
    else {
      if ((i.lanes & u) === 0 && (o.flags & 128) === 0) return Pt = !1, nk(i, o, u);
      Pt = (i.flags & 131072) !== 0;
    }
    else Pt = !1, je && (o.flags & 1048576) !== 0 && Eg(o, za, o.index);
    switch (o.lanes = 0, o.tag) {
      case 2:
        var h = o.type;
        el(i, o), i = o.pendingProps;
        var y = bi(o, pt.current);
        Ni(o, u), y = nd(null, o, h, i, y, u);
        var _ = rd();
        return o.flags |= 1, typeof y == "object" && y !== null && typeof y.render == "function" && y.$$typeof === void 0 ? (o.tag = 1, o.memoizedState = null, o.updateQueue = null, Ct(h) ? (_ = !0, Fa(o)) : _ = !1, o.memoizedState = y.state !== null && y.state !== void 0 ? y.state : null, Yc(o), y.updater = Xa, o.stateNode = y, y._reactInternals = o, ud(o, h, i, u), o = hd(null, o, h, !0, _, u)) : (o.tag = 0, je && _ && zc(o), xt(null, o, y, u), o = o.child), o;
      case 16:
        h = o.elementType;
        e: {
          switch (el(i, o), i = o.pendingProps, y = h._init, h = y(h._payload), o.type = h, y = o.tag = yk(h), i = pn(h, i), y) {
            case 0:
              o = fd(null, o, h, i, u);
              break e;
            case 1:
              o = wy(null, o, h, i, u);
              break e;
            case 11:
              o = yy(null, o, h, i, u);
              break e;
            case 14:
              o = vy(null, o, h, pn(h.type, i), u);
              break e;
          }
          throw Error(n(
            306,
            h,
            ""
          ));
        }
        return o;
      case 0:
        return h = o.type, y = o.pendingProps, y = o.elementType === h ? y : pn(h, y), fd(i, o, h, y, u);
      case 1:
        return h = o.type, y = o.pendingProps, y = o.elementType === h ? y : pn(h, y), wy(i, o, h, y, u);
      case 3:
        e: {
          if (Ty(o), i === null) throw Error(n(387));
          h = o.pendingProps, _ = o.memoizedState, y = _.element, Lg(i, o), Wa(o, h, null, u);
          var k = o.memoizedState;
          if (h = k.element, _.isDehydrated) if (_ = { element: h, isDehydrated: !1, cache: k.cache, pendingSuspenseBoundaries: k.pendingSuspenseBoundaries, transitions: k.transitions }, o.updateQueue.baseState = _, o.memoizedState = _, o.flags & 256) {
            y = Di(Error(n(423)), o), o = Ay(i, o, h, u, y);
            break e;
          } else if (h !== y) {
            y = Di(Error(n(424)), o), o = Ay(i, o, h, u, y);
            break e;
          } else for (Bt = ir(o.stateNode.containerInfo.firstChild), Vt = o, je = !0, hn = null, u = Fg(o, null, h, u), o.child = u; u; ) u.flags = u.flags & -3 | 4096, u = u.sibling;
          else {
            if (Ei(), h === y) {
              o = Un(i, o, u);
              break e;
            }
            xt(i, o, h, u);
          }
          o = o.child;
        }
        return o;
      case 5:
        return Vg(o), i === null && Bc(o), h = o.type, y = o.pendingProps, _ = i !== null ? i.memoizedProps : null, k = y.children, Ic(h, y) ? k = null : _ !== null && Ic(h, _) && (o.flags |= 32), xy(i, o), xt(i, o, k, u), o.child;
      case 6:
        return i === null && Bc(o), null;
      case 13:
        return ky(i, o, u);
      case 4:
        return qc(o, o.stateNode.containerInfo), h = o.pendingProps, i === null ? o.child = Mi(o, null, h, u) : xt(i, o, h, u), o.child;
      case 11:
        return h = o.type, y = o.pendingProps, y = o.elementType === h ? y : pn(h, y), yy(i, o, h, y, u);
      case 7:
        return xt(i, o, o.pendingProps, u), o.child;
      case 8:
        return xt(i, o, o.pendingProps.children, u), o.child;
      case 12:
        return xt(i, o, o.pendingProps.children, u), o.child;
      case 10:
        e: {
          if (h = o.type._context, y = o.pendingProps, _ = o.memoizedProps, k = y.value, Me(Ba, h._currentValue), h._currentValue = k, _ !== null) if (fn(_.value, k)) {
            if (_.children === y.children && !bt.current) {
              o = Un(i, o, u);
              break e;
            }
          } else for (_ = o.child, _ !== null && (_.return = o); _ !== null; ) {
            var R = _.dependencies;
            if (R !== null) {
              k = _.child;
              for (var N = R.firstContext; N !== null; ) {
                if (N.context === h) {
                  if (_.tag === 1) {
                    N = Bn(-1, u & -u), N.tag = 2;
                    var B = _.updateQueue;
                    if (B !== null) {
                      B = B.shared;
                      var K = B.pending;
                      K === null ? N.next = N : (N.next = K.next, K.next = N), B.pending = N;
                    }
                  }
                  _.lanes |= u, N = _.alternate, N !== null && (N.lanes |= u), Gc(
                    _.return,
                    u,
                    o
                  ), R.lanes |= u;
                  break;
                }
                N = N.next;
              }
            } else if (_.tag === 10) k = _.type === o.type ? null : _.child;
            else if (_.tag === 18) {
              if (k = _.return, k === null) throw Error(n(341));
              k.lanes |= u, R = k.alternate, R !== null && (R.lanes |= u), Gc(k, u, o), k = _.sibling;
            } else k = _.child;
            if (k !== null) k.return = _;
            else for (k = _; k !== null; ) {
              if (k === o) {
                k = null;
                break;
              }
              if (_ = k.sibling, _ !== null) {
                _.return = k.return, k = _;
                break;
              }
              k = k.return;
            }
            _ = k;
          }
          xt(i, o, y.children, u), o = o.child;
        }
        return o;
      case 9:
        return y = o.type, h = o.pendingProps.children, Ni(o, u), y = Jt(y), h = h(y), o.flags |= 1, xt(i, o, h, u), o.child;
      case 14:
        return h = o.type, y = pn(h, o.pendingProps), y = pn(h.type, y), vy(i, o, h, y, u);
      case 15:
        return _y(i, o, o.type, o.pendingProps, u);
      case 17:
        return h = o.type, y = o.pendingProps, y = o.elementType === h ? y : pn(h, y), el(i, o), o.tag = 1, Ct(h) ? (i = !0, Fa(o)) : i = !1, Ni(o, u), cy(o, h, y), ud(o, h, y, u), hd(null, o, h, !0, i, u);
      case 19:
        return Cy(i, o, u);
      case 22:
        return Sy(i, o, u);
    }
    throw Error(n(156, o.tag));
  };
  function Qy(i, o) {
    return Mm(i, o);
  }
  function gk(i, o, u, h) {
    this.tag = i, this.key = u, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = o, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = h, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function nn(i, o, u, h) {
    return new gk(i, o, u, h);
  }
  function Id(i) {
    return i = i.prototype, !(!i || !i.isReactComponent);
  }
  function yk(i) {
    if (typeof i == "function") return Id(i) ? 1 : 0;
    if (i != null) {
      if (i = i.$$typeof, i === te) return 11;
      if (i === me) return 14;
    }
    return 2;
  }
  function mr(i, o) {
    var u = i.alternate;
    return u === null ? (u = nn(i.tag, o, i.key, i.mode), u.elementType = i.elementType, u.type = i.type, u.stateNode = i.stateNode, u.alternate = i, i.alternate = u) : (u.pendingProps = o, u.type = i.type, u.flags = 0, u.subtreeFlags = 0, u.deletions = null), u.flags = i.flags & 14680064, u.childLanes = i.childLanes, u.lanes = i.lanes, u.child = i.child, u.memoizedProps = i.memoizedProps, u.memoizedState = i.memoizedState, u.updateQueue = i.updateQueue, o = i.dependencies, u.dependencies = o === null ? null : { lanes: o.lanes, firstContext: o.firstContext }, u.sibling = i.sibling, u.index = i.index, u.ref = i.ref, u;
  }
  function dl(i, o, u, h, y, _) {
    var k = 2;
    if (h = i, typeof i == "function") Id(i) && (k = 1);
    else if (typeof i == "string") k = 5;
    else e: switch (i) {
      case O:
        return Gr(u.children, y, _, o);
      case F:
        k = 8, y |= 8;
        break;
      case L:
        return i = nn(12, u, o, y | 2), i.elementType = L, i.lanes = _, i;
      case ae:
        return i = nn(13, u, o, y), i.elementType = ae, i.lanes = _, i;
      case le:
        return i = nn(19, u, o, y), i.elementType = le, i.lanes = _, i;
      case de:
        return fl(u, y, _, o);
      default:
        if (typeof i == "object" && i !== null) switch (i.$$typeof) {
          case U:
            k = 10;
            break e;
          case G:
            k = 9;
            break e;
          case te:
            k = 11;
            break e;
          case me:
            k = 14;
            break e;
          case ee:
            k = 16, h = null;
            break e;
        }
        throw Error(n(130, i == null ? i : typeof i, ""));
    }
    return o = nn(k, u, o, y), o.elementType = i, o.type = h, o.lanes = _, o;
  }
  function Gr(i, o, u, h) {
    return i = nn(7, i, h, o), i.lanes = u, i;
  }
  function fl(i, o, u, h) {
    return i = nn(22, i, h, o), i.elementType = de, i.lanes = u, i.stateNode = { isHidden: !1 }, i;
  }
  function Dd(i, o, u) {
    return i = nn(6, i, null, o), i.lanes = u, i;
  }
  function jd(i, o, u) {
    return o = nn(4, i.children !== null ? i.children : [], i.key, o), o.lanes = u, o.stateNode = { containerInfo: i.containerInfo, pendingChildren: null, implementation: i.implementation }, o;
  }
  function vk(i, o, u, h, y) {
    this.tag = o, this.containerInfo = i, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = lc(0), this.expirationTimes = lc(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = lc(0), this.identifierPrefix = h, this.onRecoverableError = y, this.mutableSourceEagerHydrationData = null;
  }
  function Fd(i, o, u, h, y, _, k, R, N) {
    return i = new vk(i, o, u, R, N), o === 1 ? (o = 1, _ === !0 && (o |= 8)) : o = 0, _ = nn(3, null, null, o), i.current = _, _.stateNode = i, _.memoizedState = { element: h, isDehydrated: u, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Yc(_), i;
  }
  function _k(i, o, u) {
    var h = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: z, key: h == null ? null : "" + h, children: i, containerInfo: o, implementation: u };
  }
  function Xy(i) {
    if (!i) return or;
    i = i._reactInternals;
    e: {
      if (jr(i) !== i || i.tag !== 1) throw Error(n(170));
      var o = i;
      do {
        switch (o.tag) {
          case 3:
            o = o.stateNode.context;
            break e;
          case 1:
            if (Ct(o.type)) {
              o = o.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        o = o.return;
      } while (o !== null);
      throw Error(n(171));
    }
    if (i.tag === 1) {
      var u = i.type;
      if (Ct(u)) return bg(i, u, o);
    }
    return o;
  }
  function Jy(i, o, u, h, y, _, k, R, N) {
    return i = Fd(u, h, !0, i, y, _, k, R, N), i.context = Xy(null), u = i.current, h = wt(), y = hr(u), _ = Bn(h, y), _.callback = o ?? null, ur(u, _, y), i.current.lanes = y, Ns(i, y, h), Mt(i, h), i;
  }
  function hl(i, o, u, h) {
    var y = o.current, _ = wt(), k = hr(y);
    return u = Xy(u), o.context === null ? o.context = u : o.pendingContext = u, o = Bn(_, k), o.payload = { element: i }, h = h === void 0 ? null : h, h !== null && (o.callback = h), i = ur(y, o, k), i !== null && (yn(i, y, k, _), Ha(i, y, k)), k;
  }
  function pl(i) {
    if (i = i.current, !i.child) return null;
    switch (i.child.tag) {
      case 5:
        return i.child.stateNode;
      default:
        return i.child.stateNode;
    }
  }
  function ev(i, o) {
    if (i = i.memoizedState, i !== null && i.dehydrated !== null) {
      var u = i.retryLane;
      i.retryLane = u !== 0 && u < o ? u : o;
    }
  }
  function Od(i, o) {
    ev(i, o), (i = i.alternate) && ev(i, o);
  }
  function Sk() {
    return null;
  }
  var tv = typeof reportError == "function" ? reportError : function(i) {
    console.error(i);
  };
  function Ld(i) {
    this._internalRoot = i;
  }
  ml.prototype.render = Ld.prototype.render = function(i) {
    var o = this._internalRoot;
    if (o === null) throw Error(n(409));
    hl(i, o, null, null);
  }, ml.prototype.unmount = Ld.prototype.unmount = function() {
    var i = this._internalRoot;
    if (i !== null) {
      this._internalRoot = null;
      var o = i.containerInfo;
      Hr(function() {
        hl(null, i, null, null);
      }), o[On] = null;
    }
  };
  function ml(i) {
    this._internalRoot = i;
  }
  ml.prototype.unstable_scheduleHydration = function(i) {
    if (i) {
      var o = Lm();
      i = { blockedOn: null, target: i, priority: o };
      for (var u = 0; u < tr.length && o !== 0 && o < tr[u].priority; u++) ;
      tr.splice(u, 0, i), u === 0 && Vm(i);
    }
  };
  function zd(i) {
    return !(!i || i.nodeType !== 1 && i.nodeType !== 9 && i.nodeType !== 11);
  }
  function gl(i) {
    return !(!i || i.nodeType !== 1 && i.nodeType !== 9 && i.nodeType !== 11 && (i.nodeType !== 8 || i.nodeValue !== " react-mount-point-unstable "));
  }
  function nv() {
  }
  function xk(i, o, u, h, y) {
    if (y) {
      if (typeof h == "function") {
        var _ = h;
        h = function() {
          var B = pl(k);
          _.call(B);
        };
      }
      var k = Jy(o, h, i, 0, null, !1, !1, "", nv);
      return i._reactRootContainer = k, i[On] = k.current, Zs(i.nodeType === 8 ? i.parentNode : i), Hr(), k;
    }
    for (; y = i.lastChild; ) i.removeChild(y);
    if (typeof h == "function") {
      var R = h;
      h = function() {
        var B = pl(N);
        R.call(B);
      };
    }
    var N = Fd(i, 0, !1, null, null, !1, !1, "", nv);
    return i._reactRootContainer = N, i[On] = N.current, Zs(i.nodeType === 8 ? i.parentNode : i), Hr(function() {
      hl(o, N, u, h);
    }), N;
  }
  function yl(i, o, u, h, y) {
    var _ = u._reactRootContainer;
    if (_) {
      var k = _;
      if (typeof y == "function") {
        var R = y;
        y = function() {
          var N = pl(k);
          R.call(N);
        };
      }
      hl(o, k, i, y);
    } else k = xk(u, o, i, y, h);
    return pl(k);
  }
  Fm = function(i) {
    switch (i.tag) {
      case 3:
        var o = i.stateNode;
        if (o.current.memoizedState.isDehydrated) {
          var u = Rs(o.pendingLanes);
          u !== 0 && (uc(o, u | 1), Mt(o, Ge()), (xe & 6) === 0 && (Oi = Ge() + 500, ar()));
        }
        break;
      case 13:
        Hr(function() {
          var h = Vn(i, 1);
          if (h !== null) {
            var y = wt();
            yn(h, i, 1, y);
          }
        }), Od(i, 1);
    }
  }, cc = function(i) {
    if (i.tag === 13) {
      var o = Vn(i, 134217728);
      if (o !== null) {
        var u = wt();
        yn(o, i, 134217728, u);
      }
      Od(i, 134217728);
    }
  }, Om = function(i) {
    if (i.tag === 13) {
      var o = hr(i), u = Vn(i, o);
      if (u !== null) {
        var h = wt();
        yn(u, i, o, h);
      }
      Od(i, o);
    }
  }, Lm = function() {
    return Ae;
  }, zm = function(i, o) {
    var u = Ae;
    try {
      return Ae = i, o();
    } finally {
      Ae = u;
    }
  }, nc = function(i, o, u) {
    switch (o) {
      case "input":
        if (Ku(i, u), o = u.name, u.type === "radio" && o != null) {
          for (u = i; u.parentNode; ) u = u.parentNode;
          for (u = u.querySelectorAll("input[name=" + JSON.stringify("" + o) + '][type="radio"]'), o = 0; o < u.length; o++) {
            var h = u[o];
            if (h !== i && h.form === i.form) {
              var y = Da(h);
              if (!y) throw Error(n(90));
              um(h), Ku(h, y);
            }
          }
        }
        break;
      case "textarea":
        pm(i, u);
        break;
      case "select":
        o = u.value, o != null && pi(i, !!u.multiple, o, !1);
    }
  }, Tm = Md, Am = Hr;
  var wk = { usingClientEntryPoint: !1, Events: [Ys, Ai, Da, xm, wm, Md] }, uo = { findFiberByHostInstance: Fr, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Tk = { bundleType: uo.bundleType, version: uo.version, rendererPackageName: uo.rendererPackageName, rendererConfig: uo.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: M.ReactCurrentDispatcher, findHostInstanceByFiber: function(i) {
    return i = Pm(i), i === null ? null : i.stateNode;
  }, findFiberByHostInstance: uo.findFiberByHostInstance || Sk, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!vl.isDisabled && vl.supportsFiber) try {
      ma = vl.inject(Tk), wn = vl;
    } catch {
    }
  }
  return Rt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = wk, Rt.createPortal = function(i, o) {
    var u = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!zd(o)) throw Error(n(200));
    return _k(i, o, null, u);
  }, Rt.createRoot = function(i, o) {
    if (!zd(i)) throw Error(n(299));
    var u = !1, h = "", y = tv;
    return o != null && (o.unstable_strictMode === !0 && (u = !0), o.identifierPrefix !== void 0 && (h = o.identifierPrefix), o.onRecoverableError !== void 0 && (y = o.onRecoverableError)), o = Fd(i, 1, !1, null, null, u, !1, h, y), i[On] = o.current, Zs(i.nodeType === 8 ? i.parentNode : i), new Ld(o);
  }, Rt.findDOMNode = function(i) {
    if (i == null) return null;
    if (i.nodeType === 1) return i;
    var o = i._reactInternals;
    if (o === void 0)
      throw typeof i.render == "function" ? Error(n(188)) : (i = Object.keys(i).join(","), Error(n(268, i)));
    return i = Pm(o), i = i === null ? null : i.stateNode, i;
  }, Rt.flushSync = function(i) {
    return Hr(i);
  }, Rt.hydrate = function(i, o, u) {
    if (!gl(o)) throw Error(n(200));
    return yl(null, i, o, !0, u);
  }, Rt.hydrateRoot = function(i, o, u) {
    if (!zd(i)) throw Error(n(405));
    var h = u != null && u.hydratedSources || null, y = !1, _ = "", k = tv;
    if (u != null && (u.unstable_strictMode === !0 && (y = !0), u.identifierPrefix !== void 0 && (_ = u.identifierPrefix), u.onRecoverableError !== void 0 && (k = u.onRecoverableError)), o = Jy(o, null, i, 1, u ?? null, y, !1, _, k), i[On] = o.current, Zs(i), h) for (i = 0; i < h.length; i++) u = h[i], y = u._getVersion, y = y(u._source), o.mutableSourceEagerHydrationData == null ? o.mutableSourceEagerHydrationData = [u, y] : o.mutableSourceEagerHydrationData.push(
      u,
      y
    );
    return new ml(o);
  }, Rt.render = function(i, o, u) {
    if (!gl(o)) throw Error(n(200));
    return yl(null, i, o, !1, u);
  }, Rt.unmountComponentAtNode = function(i) {
    if (!gl(i)) throw Error(n(40));
    return i._reactRootContainer ? (Hr(function() {
      yl(null, null, i, !1, function() {
        i._reactRootContainer = null, i[On] = null;
      });
    }), !0) : !1;
  }, Rt.unstable_batchedUpdates = Md, Rt.unstable_renderSubtreeIntoContainer = function(i, o, u, h) {
    if (!gl(u)) throw Error(n(200));
    if (i == null || i._reactInternals === void 0) throw Error(n(38));
    return yl(i, o, u, !1, h);
  }, Rt.version = "18.3.1-next-f1338f8080-20240426", Rt;
}
var dv;
function H_() {
  if (dv) return Vd.exports;
  dv = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (e) {
        console.error(e);
      }
  }
  return t(), Vd.exports = Dk(), Vd.exports;
}
var fv;
function jk() {
  if (fv) return Sl;
  fv = 1;
  var t = H_();
  return Sl.createRoot = t.createRoot, Sl.hydrateRoot = t.hydrateRoot, Sl;
}
var Fk = jk(), Hd = { exports: {} }, fo = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hv;
function Ok() {
  if (hv) return fo;
  hv = 1;
  var t = $h(), e = Symbol.for("react.element"), n = Symbol.for("react.fragment"), r = Object.prototype.hasOwnProperty, s = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, a = { key: !0, ref: !0, __self: !0, __source: !0 };
  function l(c, f, m) {
    var g, d = {}, p = null, v = null;
    m !== void 0 && (p = "" + m), f.key !== void 0 && (p = "" + f.key), f.ref !== void 0 && (v = f.ref);
    for (g in f) r.call(f, g) && !a.hasOwnProperty(g) && (d[g] = f[g]);
    if (c && c.defaultProps) for (g in f = c.defaultProps, f) d[g] === void 0 && (d[g] = f[g]);
    return { $$typeof: e, type: c, key: p, ref: v, props: d, _owner: s.current };
  }
  return fo.Fragment = n, fo.jsx = l, fo.jsxs = l, fo;
}
var pv;
function Lk() {
  return pv || (pv = 1, Hd.exports = Ok()), Hd.exports;
}
var S = Lk();
const mv = (t) => Symbol.iterator in t, gv = (t) => (
  // HACK: avoid checking entries type
  "entries" in t
), yv = (t, e) => {
  const n = t instanceof Map ? t : new Map(t.entries()), r = e instanceof Map ? e : new Map(e.entries());
  if (n.size !== r.size)
    return !1;
  for (const [s, a] of n)
    if (!r.has(s) || !Object.is(a, r.get(s)))
      return !1;
  return !0;
}, zk = (t, e) => {
  const n = t[Symbol.iterator](), r = e[Symbol.iterator]();
  let s = n.next(), a = r.next();
  for (; !s.done && !a.done; ) {
    if (!Object.is(s.value, a.value))
      return !1;
    s = n.next(), a = r.next();
  }
  return !!s.done && !!a.done;
};
function $k(t, e) {
  return Object.is(t, e) ? !0 : typeof t != "object" || t === null || typeof e != "object" || e === null || Object.getPrototypeOf(t) !== Object.getPrototypeOf(e) ? !1 : mv(t) && mv(e) ? gv(t) && gv(e) ? yv(t, e) : zk(t, e) : yv(
    { entries: () => Object.entries(t) },
    { entries: () => Object.entries(e) }
  );
}
function Vk(t) {
  const e = Kn.useRef(void 0);
  return (n) => {
    const r = t(n);
    return $k(e.current, r) ? e.current : e.current = r;
  };
}
const Vh = E.createContext({});
function Bh(t) {
  const e = E.useRef(null);
  return e.current === null && (e.current = t()), e.current;
}
const Bk = typeof window < "u", Uh = Bk ? E.useLayoutEffect : E.useEffect, Mu = /* @__PURE__ */ E.createContext(null);
function Hh(t, e) {
  t.indexOf(e) === -1 && t.push(e);
}
function ru(t, e) {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}
const jn = (t, e, n) => n > e ? e : n < t ? t : n;
function vv(t, e) {
  return e ? `${t}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${e}` : t;
}
let Yo = () => {
}, ci = () => {
};
var L_;
typeof process < "u" && ((L_ = process.env) == null ? void 0 : L_.NODE_ENV) !== "production" && (Yo = (t, e, n) => {
  !t && typeof console < "u" && console.warn(vv(e, n));
}, ci = (t, e, n) => {
  if (!t)
    throw new Error(vv(e, n));
});
const Pr = {}, W_ = (t) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t), Z_ = (t) => typeof t == "object" && t !== null, G_ = (t) => /^0[^.\s]+$/u.test(t);
// @__NO_SIDE_EFFECTS__
function K_(t) {
  let e;
  return () => (e === void 0 && (e = t()), e);
}
const un = /* @__NO_SIDE_EFFECTS__ */ (t) => t, qo = (...t) => t.reduce((e, n) => (r) => n(e(r))), Do = /* @__NO_SIDE_EFFECTS__ */ (t, e, n) => {
  const r = e - t;
  return r ? (n - t) / r : 1;
};
class Wh {
  constructor() {
    this.subscriptions = [];
  }
  add(e) {
    return Hh(this.subscriptions, e), () => ru(this.subscriptions, e);
  }
  notify(e, n, r) {
    const s = this.subscriptions.length;
    if (s)
      if (s === 1)
        this.subscriptions[0](e, n, r);
      else
        for (let a = 0; a < s; a++) {
          const l = this.subscriptions[a];
          l && l(e, n, r);
        }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
const It = /* @__NO_SIDE_EFFECTS__ */ (t) => t * 1e3, on = /* @__NO_SIDE_EFFECTS__ */ (t) => t / 1e3, Y_ = /* @__NO_SIDE_EFFECTS__ */ (t, e) => e ? t * (1e3 / e) : 0, q_ = (t, e, n) => (((1 - 3 * n + 3 * e) * t + (3 * n - 6 * e)) * t + 3 * e) * t, Uk = 1e-7, Hk = 12;
function Wk(t, e, n, r, s) {
  let a, l, c = 0;
  do
    l = e + (n - e) / 2, a = q_(l, r, s) - t, a > 0 ? n = l : e = l;
  while (Math.abs(a) > Uk && ++c < Hk);
  return l;
}
// @__NO_SIDE_EFFECTS__
function Qo(t, e, n, r) {
  if (t === e && n === r)
    return un;
  const s = (a) => Wk(a, 0, 1, t, n);
  return (a) => a === 0 || a === 1 ? a : q_(s(a), e, r);
}
const Q_ = /* @__NO_SIDE_EFFECTS__ */ (t) => (e) => e <= 0.5 ? t(2 * e) / 2 : (2 - t(2 * (1 - e))) / 2, X_ = /* @__NO_SIDE_EFFECTS__ */ (t) => (e) => 1 - t(1 - e), J_ = /* @__PURE__ */ Qo(0.33, 1.53, 0.69, 0.99), Zh = /* @__PURE__ */ X_(J_), eS = /* @__PURE__ */ Q_(Zh), tS = (t) => t >= 1 ? 1 : (t *= 2) < 1 ? 0.5 * Zh(t) : 0.5 * (2 - Math.pow(2, -10 * (t - 1))), Gh = (t) => 1 - Math.sin(Math.acos(t)), nS = /* @__PURE__ */ X_(Gh), rS = /* @__PURE__ */ Q_(Gh), Zk = /* @__PURE__ */ Qo(0.42, 0, 1, 1), Gk = /* @__PURE__ */ Qo(0, 0, 0.58, 1), iS = /* @__PURE__ */ Qo(0.42, 0, 0.58, 1), Kk = /* @__NO_SIDE_EFFECTS__ */ (t) => Array.isArray(t) && typeof t[0] != "number", sS = /* @__NO_SIDE_EFFECTS__ */ (t) => Array.isArray(t) && typeof t[0] == "number", _v = {
  linear: un,
  easeIn: Zk,
  easeInOut: iS,
  easeOut: Gk,
  circIn: Gh,
  circInOut: rS,
  circOut: nS,
  backIn: Zh,
  backInOut: eS,
  backOut: J_,
  anticipate: tS
}, Yk = (t) => typeof t == "string", Sv = (t) => {
  if (/* @__PURE__ */ sS(t)) {
    ci(t.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [e, n, r, s] = t;
    return /* @__PURE__ */ Qo(e, n, r, s);
  } else if (Yk(t))
    return ci(_v[t] !== void 0, `Invalid easing type '${t}'`, "invalid-easing-type"), _v[t];
  return t;
}, xl = [
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
function qk(t) {
  let e = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = !1, s = !1;
  const a = /* @__PURE__ */ new WeakSet();
  let l = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function c(m) {
    a.has(m) && (f.schedule(m), t()), m(l);
  }
  const f = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (m, g = !1, d = !1) => {
      const v = d && r ? e : n;
      return g && a.add(m), v.add(m), m;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (m) => {
      n.delete(m), a.delete(m);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (m) => {
      if (l = m, r) {
        s = !0;
        return;
      }
      r = !0;
      const g = e;
      e = n, n = g, e.forEach(c), e.clear(), r = !1, s && (s = !1, f.process(m));
    }
  };
  return f;
}
const Qk = 40;
function oS(t, e) {
  let n = !1, r = !0;
  const s = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, a = () => n = !0, l = xl.reduce((C, M) => (C[M] = qk(a), C), {}), { setup: c, read: f, resolveKeyframes: m, preUpdate: g, update: d, preRender: p, render: v, postRender: w } = l, x = () => {
    const C = Pr.useManualTiming, M = C ? s.timestamp : performance.now();
    n = !1, C || (s.delta = r ? 1e3 / 60 : Math.max(Math.min(M - s.timestamp, Qk), 1)), s.timestamp = M, s.isProcessing = !0, c.process(s), f.process(s), m.process(s), g.process(s), d.process(s), p.process(s), v.process(s), w.process(s), s.isProcessing = !1, n && e && (r = !1, t(x));
  }, T = () => {
    n = !0, r = !0, s.isProcessing || t(x);
  };
  return { schedule: xl.reduce((C, M) => {
    const P = l[M];
    return C[M] = (z, O = !1, F = !1) => (n || T(), P.schedule(z, O, F)), C;
  }, {}), cancel: (C) => {
    for (let M = 0; M < xl.length; M++)
      l[xl[M]].cancel(C);
  }, state: s, steps: l };
}
const { schedule: Ee, cancel: Er, state: dt, steps: Wd } = /* @__PURE__ */ oS(typeof requestAnimationFrame < "u" ? requestAnimationFrame : un, !0);
let jl;
function Xk() {
  jl = void 0;
}
const At = {
  now: () => (jl === void 0 && At.set(dt.isProcessing || Pr.useManualTiming ? dt.timestamp : performance.now()), jl),
  set: (t) => {
    jl = t, queueMicrotask(Xk);
  }
}, aS = (t) => (e) => typeof e == "string" && e.startsWith(t), lS = /* @__PURE__ */ aS("--"), Jk = /* @__PURE__ */ aS("var(--"), Kh = (t) => Jk(t) ? eb.test(t.split("/*")[0].trim()) : !1, eb = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function xv(t) {
  return typeof t != "string" ? !1 : t.split("/*")[0].includes("var(--");
}
const xs = {
  test: (t) => typeof t == "number",
  parse: parseFloat,
  transform: (t) => t
}, jo = {
  ...xs,
  transform: (t) => jn(0, 1, t)
}, wl = {
  ...xs,
  default: 1
}, wo = (t) => Math.round(t * 1e5) / 1e5, Yh = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function tb(t) {
  return t == null;
}
const nb = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, qh = (t, e) => (n) => !!(typeof n == "string" && nb.test(n) && n.startsWith(t) || e && !tb(n) && Object.prototype.hasOwnProperty.call(n, e)), uS = (t, e, n) => (r) => {
  if (typeof r != "string")
    return r;
  const [s, a, l, c] = r.match(Yh);
  return {
    [t]: parseFloat(s),
    [e]: parseFloat(a),
    [n]: parseFloat(l),
    alpha: c !== void 0 ? parseFloat(c) : 1
  };
}, rb = (t) => jn(0, 255, t), Zd = {
  ...xs,
  transform: (t) => Math.round(rb(t))
}, ti = {
  test: /* @__PURE__ */ qh("rgb", "red"),
  parse: /* @__PURE__ */ uS("red", "green", "blue"),
  transform: ({ red: t, green: e, blue: n, alpha: r = 1 }) => "rgba(" + Zd.transform(t) + ", " + Zd.transform(e) + ", " + Zd.transform(n) + ", " + wo(jo.transform(r)) + ")"
};
function ib(t) {
  let e = "", n = "", r = "", s = "";
  return t.length > 5 ? (e = t.substring(1, 3), n = t.substring(3, 5), r = t.substring(5, 7), s = t.substring(7, 9)) : (e = t.substring(1, 2), n = t.substring(2, 3), r = t.substring(3, 4), s = t.substring(4, 5), e += e, n += n, r += r, s += s), {
    red: parseInt(e, 16),
    green: parseInt(n, 16),
    blue: parseInt(r, 16),
    alpha: s ? parseInt(s, 16) / 255 : 1
  };
}
const Rf = {
  test: /* @__PURE__ */ qh("#"),
  parse: ib,
  transform: ti.transform
}, Xo = /* @__NO_SIDE_EFFECTS__ */ (t) => ({
  test: (e) => typeof e == "string" && e.endsWith(t) && e.split(" ").length === 1,
  parse: parseFloat,
  transform: (e) => `${e}${t}`
}), Wn = /* @__PURE__ */ Xo("deg"), Dn = /* @__PURE__ */ Xo("%"), oe = /* @__PURE__ */ Xo("px"), sb = /* @__PURE__ */ Xo("vh"), ob = /* @__PURE__ */ Xo("vw"), wv = {
  ...Dn,
  parse: (t) => Dn.parse(t) / 100,
  transform: (t) => Dn.transform(t * 100)
}, Ki = {
  test: /* @__PURE__ */ qh("hsl", "hue"),
  parse: /* @__PURE__ */ uS("hue", "saturation", "lightness"),
  transform: ({ hue: t, saturation: e, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(t) + ", " + Dn.transform(wo(e)) + ", " + Dn.transform(wo(n)) + ", " + wo(jo.transform(r)) + ")"
}, Qe = {
  test: (t) => ti.test(t) || Rf.test(t) || Ki.test(t),
  parse: (t) => ti.test(t) ? ti.parse(t) : Ki.test(t) ? Ki.parse(t) : Rf.parse(t),
  transform: (t) => typeof t == "string" ? t : t.hasOwnProperty("red") ? ti.transform(t) : Ki.transform(t),
  getAnimatableNone: (t) => {
    const e = Qe.parse(t);
    return e.alpha = 0, Qe.transform(e);
  }
}, ab = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function lb(t) {
  var e, n;
  return isNaN(t) && typeof t == "string" && (((e = t.match(Yh)) == null ? void 0 : e.length) || 0) + (((n = t.match(ab)) == null ? void 0 : n.length) || 0) > 0;
}
const cS = "number", dS = "color", ub = "var", cb = "var(", Tv = "${}", db = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function as(t) {
  const e = t.toString(), n = [], r = {
    color: [],
    number: [],
    var: []
  }, s = [];
  let a = 0;
  const c = e.replace(db, (f) => (Qe.test(f) ? (r.color.push(a), s.push(dS), n.push(Qe.parse(f))) : f.startsWith(cb) ? (r.var.push(a), s.push(ub), n.push(f)) : (r.number.push(a), s.push(cS), n.push(parseFloat(f))), ++a, Tv)).split(Tv);
  return { values: n, split: c, indexes: r, types: s };
}
function fb(t) {
  return as(t).values;
}
function fS({ split: t, types: e }) {
  const n = t.length;
  return (r) => {
    let s = "";
    for (let a = 0; a < n; a++)
      if (s += t[a], r[a] !== void 0) {
        const l = e[a];
        l === cS ? s += wo(r[a]) : l === dS ? s += Qe.transform(r[a]) : s += r[a];
      }
    return s;
  };
}
function hb(t) {
  return fS(as(t));
}
const pb = (t) => typeof t == "number" ? 0 : Qe.test(t) ? Qe.getAnimatableNone(t) : t, mb = (t, e) => typeof t == "number" ? e != null && e.trim().endsWith("/") ? t : 0 : pb(t);
function gb(t) {
  const e = as(t);
  return fS(e)(e.values.map((r, s) => mb(r, e.split[s])));
}
const Sn = {
  test: lb,
  parse: fb,
  createTransformer: hb,
  getAnimatableNone: gb
};
function Gd(t, e, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? t + (e - t) * 6 * n : n < 1 / 2 ? e : n < 2 / 3 ? t + (e - t) * (2 / 3 - n) * 6 : t;
}
function yb({ hue: t, saturation: e, lightness: n, alpha: r }) {
  t /= 360, e /= 100, n /= 100;
  let s = 0, a = 0, l = 0;
  if (!e)
    s = a = l = n;
  else {
    const c = n < 0.5 ? n * (1 + e) : n + e - n * e, f = 2 * n - c;
    s = Gd(f, c, t + 1 / 3), a = Gd(f, c, t), l = Gd(f, c, t - 1 / 3);
  }
  return {
    red: Math.round(s * 255),
    green: Math.round(a * 255),
    blue: Math.round(l * 255),
    alpha: r
  };
}
function iu(t, e) {
  return (n) => n > 0 ? e : t;
}
const Pe = (t, e, n) => t + (e - t) * n, Kd = (t, e, n) => {
  const r = t * t, s = n * (e * e - r) + r;
  return s < 0 ? 0 : Math.sqrt(s);
}, vb = [Rf, ti, Ki], _b = (t) => vb.find((e) => e.test(t));
function Av(t) {
  const e = _b(t);
  if (Yo(!!e, `'${t}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !e)
    return !1;
  let n = e.parse(t);
  return e === Ki && (n = yb(n)), n;
}
const kv = (t, e) => {
  const n = Av(t), r = Av(e);
  if (!n || !r)
    return iu(t, e);
  const s = { ...n };
  return (a) => (s.red = Kd(n.red, r.red, a), s.green = Kd(n.green, r.green, a), s.blue = Kd(n.blue, r.blue, a), s.alpha = Pe(n.alpha, r.alpha, a), ti.transform(s));
}, Nf = /* @__PURE__ */ new Set(["none", "hidden"]);
function Sb(t, e) {
  return Nf.has(t) ? (n) => n <= 0 ? t : e : (n) => n >= 1 ? e : t;
}
function xb(t, e) {
  return (n) => Pe(t, e, n);
}
function Qh(t) {
  return typeof t == "number" ? xb : typeof t == "string" ? Kh(t) ? iu : Qe.test(t) ? kv : Ab : Array.isArray(t) ? hS : typeof t == "object" ? Qe.test(t) ? kv : wb : iu;
}
function hS(t, e) {
  const n = [...t], r = n.length, s = t.map((a, l) => Qh(a)(a, e[l]));
  return (a) => {
    for (let l = 0; l < r; l++)
      n[l] = s[l](a);
    return n;
  };
}
function wb(t, e) {
  const n = { ...t, ...e }, r = {};
  for (const s in n)
    t[s] !== void 0 && e[s] !== void 0 && (r[s] = Qh(t[s])(t[s], e[s]));
  return (s) => {
    for (const a in r)
      n[a] = r[a](s);
    return n;
  };
}
function Tb(t, e) {
  const n = [], r = { color: 0, var: 0, number: 0 };
  for (let s = 0; s < e.values.length; s++) {
    const a = e.types[s], l = t.indexes[a][r[a]], c = t.values[l] ?? 0;
    n[s] = c, r[a]++;
  }
  return n;
}
const Ab = (t, e) => {
  const n = Sn.createTransformer(e), r = as(t), s = as(e);
  return r.indexes.var.length === s.indexes.var.length && r.indexes.color.length === s.indexes.color.length && r.indexes.number.length >= s.indexes.number.length ? Nf.has(t) && !s.values.length || Nf.has(e) && !r.values.length ? Sb(t, e) : qo(hS(Tb(r, s), s.values), n) : (Yo(!0, `Complex values '${t}' and '${e}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), iu(t, e));
};
function pS(t, e, n) {
  return typeof t == "number" && typeof e == "number" && typeof n == "number" ? Pe(t, e, n) : Qh(t)(t, e);
}
const kb = (t) => {
  const e = ({ timestamp: n }) => t(n);
  return {
    start: (n = !0) => Ee.update(e, n),
    stop: () => Er(e),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => dt.isProcessing ? dt.timestamp : At.now()
  };
}, mS = (t, e, n = 10) => {
  let r = "";
  const s = Math.max(Math.round(e / n), 2);
  for (let a = 0; a < s; a++)
    r += Math.round(t(a / (s - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${r.substring(0, r.length - 2)})`;
}, su = 2e4;
function Xh(t) {
  let e = 0;
  const n = 50;
  let r = t.next(e);
  for (; !r.done && e < su; )
    e += n, r = t.next(e);
  return e >= su ? 1 / 0 : e;
}
function bb(t, e = 100, n) {
  const r = n({ ...t, keyframes: [0, e] }), s = Math.min(Xh(r), su);
  return {
    type: "keyframes",
    ease: (a) => r.next(s * a).value / e,
    duration: /* @__PURE__ */ on(s)
  };
}
const $e = {
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
function If(t, e) {
  return t * Math.sqrt(1 - e * e);
}
const Cb = 12;
function Pb(t, e, n) {
  let r = n;
  for (let s = 1; s < Cb; s++)
    r = r - t(r) / e(r);
  return r;
}
const Yd = 1e-3;
function Eb({ duration: t = $e.duration, bounce: e = $e.bounce, velocity: n = $e.velocity, mass: r = $e.mass }) {
  let s, a;
  Yo(t <= /* @__PURE__ */ It($e.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let l = 1 - e;
  l = jn($e.minDamping, $e.maxDamping, l), t = jn($e.minDuration, $e.maxDuration, /* @__PURE__ */ on(t)), l < 1 ? (s = (m) => {
    const g = m * l, d = g * t, p = g - n, v = If(m, l), w = Math.exp(-d);
    return Yd - p / v * w;
  }, a = (m) => {
    const d = m * l * t, p = d * n + n, v = Math.pow(l, 2) * Math.pow(m, 2) * t, w = Math.exp(-d), x = If(Math.pow(m, 2), l);
    return (-s(m) + Yd > 0 ? -1 : 1) * ((p - v) * w) / x;
  }) : (s = (m) => {
    const g = Math.exp(-m * t), d = (m - n) * t + 1;
    return -Yd + g * d;
  }, a = (m) => {
    const g = Math.exp(-m * t), d = (n - m) * (t * t);
    return g * d;
  });
  const c = 5 / t, f = Pb(s, a, c);
  if (t = /* @__PURE__ */ It(t), isNaN(f))
    return {
      stiffness: $e.stiffness,
      damping: $e.damping,
      duration: t
    };
  {
    const m = Math.pow(f, 2) * r;
    return {
      stiffness: m,
      damping: l * 2 * Math.sqrt(r * m),
      duration: t
    };
  }
}
const Mb = ["duration", "bounce"], Rb = ["stiffness", "damping", "mass"];
function bv(t, e) {
  return e.some((n) => t[n] !== void 0);
}
function Nb(t) {
  let e = {
    velocity: $e.velocity,
    stiffness: $e.stiffness,
    damping: $e.damping,
    mass: $e.mass,
    isResolvedFromDuration: !1,
    ...t
  };
  if (!bv(t, Rb) && bv(t, Mb))
    if (e.velocity = 0, t.visualDuration) {
      const n = t.visualDuration, r = 2 * Math.PI / (n * 1.2), s = r * r, a = 2 * jn(0.05, 1, 1 - (t.bounce || 0)) * Math.sqrt(s);
      e = {
        ...e,
        mass: $e.mass,
        stiffness: s,
        damping: a
      };
    } else {
      const n = Eb({ ...t, velocity: 0 });
      e = {
        ...e,
        ...n,
        mass: $e.mass
      }, e.isResolvedFromDuration = !0;
    }
  return e;
}
function ou(t = $e.visualDuration, e = $e.bounce) {
  const n = typeof t != "object" ? {
    visualDuration: t,
    keyframes: [0, 1],
    bounce: e
  } : t;
  let { restSpeed: r, restDelta: s } = n;
  const a = n.keyframes[0], l = n.keyframes[n.keyframes.length - 1], c = { done: !1, value: a }, { stiffness: f, damping: m, mass: g, duration: d, velocity: p, isResolvedFromDuration: v } = Nb({
    ...n,
    velocity: -/* @__PURE__ */ on(n.velocity || 0)
  }), w = p || 0, x = m / (2 * Math.sqrt(f * g)), T = l - a, A = /* @__PURE__ */ on(Math.sqrt(f / g)), b = Math.abs(T) < 5;
  r || (r = b ? $e.restSpeed.granular : $e.restSpeed.default), s || (s = b ? $e.restDelta.granular : $e.restDelta.default);
  let C, M, P, z, O, F;
  if (x < 1)
    P = If(A, x), z = (w + x * A * T) / P, C = (U) => {
      const G = Math.exp(-x * A * U);
      return l - G * (z * Math.sin(P * U) + T * Math.cos(P * U));
    }, O = x * A * z + T * P, F = x * A * T - z * P, M = (U) => Math.exp(-x * A * U) * (O * Math.sin(P * U) + F * Math.cos(P * U));
  else if (x === 1) {
    C = (G) => l - Math.exp(-A * G) * (T + (w + A * T) * G);
    const U = w + A * T;
    M = (G) => Math.exp(-A * G) * (A * U * G - w);
  } else {
    const U = A * Math.sqrt(x * x - 1);
    C = (le) => {
      const me = Math.exp(-x * A * le), ee = Math.min(U * le, 300);
      return l - me * ((w + x * A * T) * Math.sinh(ee) + U * T * Math.cosh(ee)) / U;
    };
    const G = (w + x * A * T) / U, te = x * A * G - T * U, ae = x * A * T - G * U;
    M = (le) => {
      const me = Math.exp(-x * A * le), ee = Math.min(U * le, 300);
      return me * (te * Math.sinh(ee) + ae * Math.cosh(ee));
    };
  }
  const L = {
    calculatedDuration: v && d || null,
    velocity: (U) => /* @__PURE__ */ It(M(U)),
    next: (U) => {
      if (!v && x < 1) {
        const te = Math.exp(-x * A * U), ae = Math.sin(P * U), le = Math.cos(P * U), me = l - te * (z * ae + T * le), ee = /* @__PURE__ */ It(te * (O * ae + F * le));
        return c.done = Math.abs(ee) <= r && Math.abs(l - me) <= s, c.value = c.done ? l : me, c;
      }
      const G = C(U);
      if (v)
        c.done = U >= d;
      else {
        const te = /* @__PURE__ */ It(M(U));
        c.done = Math.abs(te) <= r && Math.abs(l - G) <= s;
      }
      return c.value = c.done ? l : G, c;
    },
    toString: () => {
      const U = Math.min(Xh(L), su), G = mS((te) => L.next(U * te).value, U, 30);
      return U + "ms " + G;
    },
    toTransition: () => {
    }
  };
  return L;
}
ou.applyToOptions = (t) => {
  const e = bb(t, 100, ou);
  return t.ease = e.ease, t.duration = /* @__PURE__ */ It(e.duration), t.type = "keyframes", t;
};
const Ib = 5;
function gS(t, e, n) {
  const r = Math.max(e - Ib, 0);
  return /* @__PURE__ */ Y_(n - t(r), e - r);
}
function Df({ keyframes: t, velocity: e = 0, power: n = 0.8, timeConstant: r = 325, bounceDamping: s = 10, bounceStiffness: a = 500, modifyTarget: l, min: c, max: f, restDelta: m = 0.5, restSpeed: g }) {
  const d = t[0], p = {
    done: !1,
    value: d
  }, v = (F) => c !== void 0 && F < c || f !== void 0 && F > f, w = (F) => c === void 0 ? f : f === void 0 || Math.abs(c - F) < Math.abs(f - F) ? c : f;
  let x = n * e;
  const T = d + x, A = l === void 0 ? T : l(T);
  A !== T && (x = A - d);
  const b = (F) => -x * Math.exp(-F / r), C = (F) => A + b(F), M = (F) => {
    const L = b(F), U = C(F);
    p.done = Math.abs(L) <= m, p.value = p.done ? A : U;
  };
  let P, z;
  const O = (F) => {
    v(p.value) && (P = F, z = ou({
      keyframes: [p.value, w(p.value)],
      velocity: gS(C, F, p.value),
      // TODO: This should be passing * 1000
      damping: s,
      stiffness: a,
      restDelta: m,
      restSpeed: g
    }));
  };
  return O(0), {
    calculatedDuration: null,
    next: (F) => {
      let L = !1;
      return !z && P === void 0 && (L = !0, M(F), O(F)), P !== void 0 && F >= P ? z.next(F - P) : (!L && M(F), p);
    }
  };
}
function Db(t, e, n) {
  const r = [], s = n || Pr.mix || pS, a = t.length - 1;
  for (let l = 0; l < a; l++) {
    let c = s(t[l], t[l + 1]);
    if (e) {
      const f = Array.isArray(e) ? e[l] || un : e;
      c = qo(f, c);
    }
    r.push(c);
  }
  return r;
}
function jb(t, e, { clamp: n = !0, ease: r, mixer: s } = {}) {
  const a = t.length;
  if (ci(a === e.length, "Both input and output ranges must be the same length", "range-length"), a === 1)
    return () => e[0];
  if (a === 2 && e[0] === e[1])
    return () => e[1];
  const l = t[0] === t[1];
  t[0] > t[a - 1] && (t = [...t].reverse(), e = [...e].reverse());
  const c = Db(e, r, s), f = c.length, m = (g) => {
    if (l && g < t[0])
      return e[0];
    let d = 0;
    if (f > 1)
      for (; d < t.length - 2 && !(g < t[d + 1]); d++)
        ;
    const p = /* @__PURE__ */ Do(t[d], t[d + 1], g);
    return c[d](p);
  };
  return n ? (g) => m(jn(t[0], t[a - 1], g)) : m;
}
function Fb(t, e) {
  const n = t[t.length - 1];
  for (let r = 1; r <= e; r++) {
    const s = /* @__PURE__ */ Do(0, e, r);
    t.push(Pe(n, 1, s));
  }
}
function Ob(t) {
  const e = [0];
  return Fb(e, t.length - 1), e;
}
function Lb(t, e) {
  return t.map((n) => n * e);
}
function zb(t, e) {
  return t.map(() => e || iS).splice(0, t.length - 1);
}
function To({ duration: t = 300, keyframes: e, times: n, ease: r = "easeInOut" }) {
  const s = /* @__PURE__ */ Kk(r) ? r.map(Sv) : Sv(r), a = {
    done: !1,
    value: e[0]
  }, l = Lb(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === e.length ? n : Ob(e),
    t
  ), c = jb(l, e, {
    ease: Array.isArray(s) ? s : zb(e, s)
  });
  return {
    calculatedDuration: t,
    next: (f) => (a.value = c(f), a.done = f >= t, a)
  };
}
const $b = (t) => t !== null;
function Ru(t, { repeat: e, repeatType: n = "loop" }, r, s = 1) {
  const a = t.filter($b), c = s < 0 || e && n !== "loop" && e % 2 === 1 ? 0 : a.length - 1;
  return !c || r === void 0 ? a[c] : r;
}
const Vb = {
  decay: Df,
  inertia: Df,
  tween: To,
  keyframes: To,
  spring: ou
};
function yS(t) {
  typeof t.type == "string" && (t.type = Vb[t.type]);
}
class Jh {
  constructor() {
    this.updateFinished();
  }
  get finished() {
    return this._finished;
  }
  updateFinished() {
    this._finished = new Promise((e) => {
      this.resolve = e;
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
  then(e, n) {
    return this.finished.then(e, n);
  }
}
const Bb = (t) => t / 100;
class au extends Jh {
  constructor(e) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      var r, s;
      const { motionValue: n } = this.options;
      n && n.updatedAt !== At.now() && this.tick(At.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), (s = (r = this.options).onStop) == null || s.call(r));
    }, this.options = e, this.initAnimation(), this.play(), e.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: e } = this;
    yS(e);
    const { type: n = To, repeat: r = 0, repeatDelay: s = 0, repeatType: a, velocity: l = 0 } = e;
    let { keyframes: c } = e;
    const f = n || To;
    f !== To && typeof c[0] != "number" && (this.mixKeyframes = qo(Bb, pS(c[0], c[1])), c = [0, 100]);
    const m = f({ ...e, keyframes: c });
    a === "mirror" && (this.mirroredGenerator = f({
      ...e,
      keyframes: [...c].reverse(),
      velocity: -l
    })), m.calculatedDuration === null && (m.calculatedDuration = Xh(m));
    const { calculatedDuration: g } = m;
    this.calculatedDuration = g, this.resolvedDuration = g + s, this.totalDuration = this.resolvedDuration * (r + 1) - s, this.generator = m;
  }
  updateTime(e) {
    const n = Math.round(e - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = n;
  }
  tick(e, n = !1) {
    const { generator: r, totalDuration: s, mixKeyframes: a, mirroredGenerator: l, resolvedDuration: c, calculatedDuration: f } = this;
    if (this.startTime === null)
      return r.next(0);
    const { delay: m = 0, keyframes: g, repeat: d, repeatType: p, repeatDelay: v, type: w, onUpdate: x, finalKeyframe: T } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, e) : this.speed < 0 && (this.startTime = Math.min(e - s / this.speed, this.startTime)), n ? this.currentTime = e : this.updateTime(e);
    const A = this.currentTime - m * (this.playbackSpeed >= 0 ? 1 : -1), b = this.playbackSpeed >= 0 ? A < 0 : A > s;
    this.currentTime = Math.max(A, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = s);
    let C = this.currentTime, M = r;
    if (d) {
      const F = Math.min(this.currentTime, s) / c;
      let L = Math.floor(F), U = F % 1;
      !U && F >= 1 && (U = 1), U === 1 && L--, L = Math.min(L, d + 1), !!(L % 2) && (p === "reverse" ? (U = 1 - U, v && (U -= v / c)) : p === "mirror" && (M = l)), C = jn(0, 1, U) * c;
    }
    let P;
    b ? (this.delayState.value = g[0], P = this.delayState) : P = M.next(C), a && !b && (P.value = a(P.value));
    let { done: z } = P;
    !b && f !== null && (z = this.playbackSpeed >= 0 ? this.currentTime >= s : this.currentTime <= 0);
    const O = this.holdTime === null && (this.state === "finished" || this.state === "running" && z);
    return O && w !== Df && (P.value = Ru(g, this.options, T, this.speed)), x && x(P.value), O && this.finish(), P;
  }
  /**
   * Allows the returned animation to be awaited or promise-chained. Currently
   * resolves when the animation finishes at all but in a future update could/should
   * reject if its cancels.
   */
  then(e, n) {
    return this.finished.then(e, n);
  }
  get duration() {
    return /* @__PURE__ */ on(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ on(e);
  }
  get time() {
    return /* @__PURE__ */ on(this.currentTime);
  }
  set time(e) {
    e = /* @__PURE__ */ It(e), this.currentTime = e, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = e : this.driver && (this.startTime = this.driver.now() - e / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = e, this.tick(e));
  }
  /**
   * Returns the generator's velocity at the current time in units/second.
   * Uses the analytical derivative when available (springs), avoiding
   * the MotionValue's frame-dependent velocity estimation.
   */
  getGeneratorVelocity() {
    const e = this.currentTime;
    if (e <= 0)
      return this.options.velocity || 0;
    if (this.generator.velocity)
      return this.generator.velocity(e);
    const n = this.generator.next(e).value;
    return gS((r) => this.generator.next(r).value, e, n);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(e) {
    const n = this.playbackSpeed !== e;
    n && this.driver && this.updateTime(At.now()), this.playbackSpeed = e, n && this.driver && (this.time = /* @__PURE__ */ on(this.currentTime));
  }
  play() {
    var s, a;
    if (this.isStopped)
      return;
    const { driver: e = kb, startTime: n } = this.options;
    this.driver || (this.driver = e((l) => this.tick(l))), (a = (s = this.options).onPlay) == null || a.call(s);
    const r = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = r) : this.holdTime !== null ? this.startTime = r - this.holdTime : this.startTime || (this.startTime = n ?? r), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(At.now()), this.holdTime = this.currentTime;
  }
  complete() {
    this.state !== "running" && this.play(), this.state = "finished", this.holdTime = null;
  }
  finish() {
    var e, n;
    this.notifyFinished(), this.teardown(), this.state = "finished", (n = (e = this.options).onComplete) == null || n.call(e);
  }
  cancel() {
    var e, n;
    this.holdTime = null, this.startTime = 0, this.tick(0), this.teardown(), (n = (e = this.options).onCancel) == null || n.call(e);
  }
  teardown() {
    this.state = "idle", this.stopDriver(), this.startTime = this.holdTime = null;
  }
  stopDriver() {
    this.driver && (this.driver.stop(), this.driver = void 0);
  }
  sample(e) {
    return this.startTime = 0, this.tick(e, !0);
  }
  attachTimeline(e) {
    var n;
    return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), (n = this.driver) == null || n.stop(), e.observe(this);
  }
}
function Ub(t) {
  for (let e = 1; e < t.length; e++)
    t[e] ?? (t[e] = t[e - 1]);
}
const ni = (t) => t * 180 / Math.PI, jf = (t) => {
  const e = ni(Math.atan2(t[1], t[0]));
  return Ff(e);
}, Hb = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (t) => (Math.abs(t[0]) + Math.abs(t[3])) / 2,
  rotate: jf,
  rotateZ: jf,
  skewX: (t) => ni(Math.atan(t[1])),
  skewY: (t) => ni(Math.atan(t[2])),
  skew: (t) => (Math.abs(t[1]) + Math.abs(t[2])) / 2
}, Ff = (t) => (t = t % 360, t < 0 && (t += 360), t), Cv = jf, Pv = (t) => Math.sqrt(t[0] * t[0] + t[1] * t[1]), Ev = (t) => Math.sqrt(t[4] * t[4] + t[5] * t[5]), Wb = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: Pv,
  scaleY: Ev,
  scale: (t) => (Pv(t) + Ev(t)) / 2,
  rotateX: (t) => Ff(ni(Math.atan2(t[6], t[5]))),
  rotateY: (t) => Ff(ni(Math.atan2(-t[2], t[0]))),
  rotateZ: Cv,
  rotate: Cv,
  skewX: (t) => ni(Math.atan(t[4])),
  skewY: (t) => ni(Math.atan(t[1])),
  skew: (t) => (Math.abs(t[1]) + Math.abs(t[4])) / 2
};
function Of(t) {
  return t.includes("scale") ? 1 : 0;
}
function Lf(t, e) {
  if (!t || t === "none")
    return Of(e);
  const n = t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let r, s;
  if (n)
    r = Wb, s = n;
  else {
    const c = t.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    r = Hb, s = c;
  }
  if (!s)
    return Of(e);
  const a = r[e], l = s[1].split(",").map(Gb);
  return typeof a == "function" ? a(l) : l[a];
}
const Zb = (t, e) => {
  const { transform: n = "none" } = getComputedStyle(t);
  return Lf(n, e);
};
function Gb(t) {
  return parseFloat(t.trim());
}
const ws = [
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
], Ts = /* @__PURE__ */ new Set([...ws, "pathRotation"]), Mv = (t) => t === xs || t === oe, Kb = /* @__PURE__ */ new Set(["x", "y", "z"]), Yb = ws.filter((t) => !Kb.has(t));
function qb(t) {
  const e = [];
  return Yb.forEach((n) => {
    const r = t.getValue(n);
    r !== void 0 && (e.push([n, r.get()]), r.set(n.startsWith("scale") ? 1 : 0));
  }), e;
}
const xr = {
  // Dimensions
  width: ({ x: t }, { paddingLeft: e = "0", paddingRight: n = "0", boxSizing: r }) => {
    const s = t.max - t.min;
    return r === "border-box" ? s : s - parseFloat(e) - parseFloat(n);
  },
  height: ({ y: t }, { paddingTop: e = "0", paddingBottom: n = "0", boxSizing: r }) => {
    const s = t.max - t.min;
    return r === "border-box" ? s : s - parseFloat(e) - parseFloat(n);
  },
  top: (t, { top: e }) => parseFloat(e),
  left: (t, { left: e }) => parseFloat(e),
  bottom: ({ y: t }, { top: e }) => parseFloat(e) + (t.max - t.min),
  right: ({ x: t }, { left: e }) => parseFloat(e) + (t.max - t.min),
  // Transform
  x: (t, { transform: e }) => Lf(e, "x"),
  y: (t, { transform: e }) => Lf(e, "y")
};
xr.translateX = xr.x;
xr.translateY = xr.y;
const ii = /* @__PURE__ */ new Set();
let zf = !1, $f = !1, Vf = !1;
function vS() {
  if ($f) {
    const t = Array.from(ii).filter((r) => r.needsMeasurement), e = new Set(t.map((r) => r.element)), n = /* @__PURE__ */ new Map();
    e.forEach((r) => {
      const s = qb(r);
      s.length && (n.set(r, s), r.render());
    }), t.forEach((r) => r.measureInitialState()), e.forEach((r) => {
      r.render();
      const s = n.get(r);
      s && s.forEach(([a, l]) => {
        var c;
        (c = r.getValue(a)) == null || c.set(l);
      });
    }), t.forEach((r) => r.measureEndState()), t.forEach((r) => {
      r.suspendedScrollY !== void 0 && window.scrollTo(0, r.suspendedScrollY);
    });
  }
  $f = !1, zf = !1, ii.forEach((t) => t.complete(Vf)), ii.clear();
}
function _S() {
  ii.forEach((t) => {
    t.readKeyframes(), t.needsMeasurement && ($f = !0);
  });
}
function Qb() {
  Vf = !0, _S(), vS(), Vf = !1;
}
class ep {
  constructor(e, n, r, s, a, l = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...e], this.onComplete = n, this.name = r, this.motionValue = s, this.element = a, this.isAsync = l;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (ii.add(this), zf || (zf = !0, Ee.read(_S), Ee.resolveKeyframes(vS))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: e, name: n, element: r, motionValue: s } = this;
    if (e[0] === null) {
      const a = s == null ? void 0 : s.get(), l = e[e.length - 1];
      if (a !== void 0)
        e[0] = a;
      else if (r && n) {
        const c = r.readValue(n, l);
        c != null && (e[0] = c);
      }
      e[0] === void 0 && (e[0] = l), s && a === void 0 && s.set(e[0]);
    }
    Ub(e);
  }
  setFinalKeyframe() {
  }
  measureInitialState() {
  }
  renderEndStyles() {
  }
  measureEndState() {
  }
  complete(e = !1) {
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, e), ii.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (ii.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const Xb = (t) => t.startsWith("--");
function SS(t, e, n) {
  Xb(e) ? t.style.setProperty(e, n) : t.style[e] = n;
}
const Jb = {};
function xS(t, e) {
  const n = /* @__PURE__ */ K_(t);
  return () => Jb[e] ?? n();
}
const eC = /* @__PURE__ */ xS(() => window.ScrollTimeline !== void 0, "scrollTimeline"), wS = /* @__PURE__ */ xS(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), go = ([t, e, n, r]) => `cubic-bezier(${t}, ${e}, ${n}, ${r})`, Rv = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ go([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ go([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ go([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ go([0.33, 1.53, 0.69, 0.99])
};
function TS(t, e) {
  if (t)
    return typeof t == "function" ? wS() ? mS(t, e) : "ease-out" : /* @__PURE__ */ sS(t) ? go(t) : Array.isArray(t) ? t.map((n) => TS(n, e) || Rv.easeOut) : Rv[t];
}
function tC(t, e, n, { delay: r = 0, duration: s = 300, repeat: a = 0, repeatType: l = "loop", ease: c = "easeOut", times: f } = {}, m = void 0) {
  const g = {
    [e]: n
  };
  f && (g.offset = f);
  const d = TS(c, s);
  Array.isArray(d) && (g.easing = d);
  const p = {
    delay: r,
    duration: s,
    easing: Array.isArray(d) ? "linear" : d,
    fill: "both",
    iterations: a + 1,
    direction: l === "reverse" ? "alternate" : "normal"
  };
  return m && (p.pseudoElement = m), t.animate(g, p);
}
function AS(t) {
  return typeof t == "function" && "applyToOptions" in t;
}
function nC({ type: t, ...e }) {
  return AS(t) && wS() ? t.applyToOptions(e) : (e.duration ?? (e.duration = 300), e.ease ?? (e.ease = "easeOut"), e);
}
class kS extends Jh {
  constructor(e) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !e)
      return;
    const { element: n, name: r, keyframes: s, pseudoElement: a, allowFlatten: l = !1, finalKeyframe: c, onComplete: f } = e;
    this.isPseudoElement = !!a, this.allowFlatten = l, this.options = e, ci(typeof e.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const m = nC(e);
    this.animation = tC(n, r, s, m, a), m.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !a) {
        const g = Ru(s, this.options, c, this.speed);
        this.updateMotionValue && this.updateMotionValue(g), SS(n, r, g), this.animation.cancel();
      }
      f == null || f(), this.notifyFinished();
    };
  }
  play() {
    this.isStopped || (this.manualStartTime = null, this.animation.play(), this.state === "finished" && this.updateFinished());
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    var e, n;
    (n = (e = this.animation).finish) == null || n.call(e);
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
    const { state: e } = this;
    e === "idle" || e === "finished" || (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel());
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
    var n, r, s;
    const e = (n = this.options) == null ? void 0 : n.element;
    !this.isPseudoElement && (e != null && e.isConnected) && ((s = (r = this.animation).commitStyles) == null || s.call(r));
  }
  get duration() {
    var n, r;
    const e = ((r = (n = this.animation.effect) == null ? void 0 : n.getComputedTiming) == null ? void 0 : r.call(n).duration) || 0;
    return /* @__PURE__ */ on(Number(e));
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ on(e);
  }
  get time() {
    return /* @__PURE__ */ on(Number(this.animation.currentTime) || 0);
  }
  set time(e) {
    const n = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ It(e), n && this.animation.pause();
  }
  /**
   * The playback speed of the animation.
   * 1 = normal speed, 2 = double speed, 0.5 = half speed.
   */
  get speed() {
    return this.animation.playbackRate;
  }
  set speed(e) {
    e < 0 && (this.finishedTime = null), this.animation.playbackRate = e;
  }
  get state() {
    return this.finishedTime !== null ? "finished" : this.animation.playState;
  }
  get startTime() {
    return this.manualStartTime ?? Number(this.animation.startTime);
  }
  set startTime(e) {
    this.manualStartTime = this.animation.startTime = e;
  }
  /**
   * Attaches a timeline to the animation, for instance the `ScrollTimeline`.
   */
  attachTimeline({ timeline: e, rangeStart: n, rangeEnd: r, observe: s }) {
    var a;
    return this.allowFlatten && ((a = this.animation.effect) == null || a.updateTiming({ easing: "linear" })), this.animation.onfinish = null, e && eC() ? (this.animation.timeline = e, n && (this.animation.rangeStart = n), r && (this.animation.rangeEnd = r), un) : s(this);
  }
}
const bS = {
  anticipate: tS,
  backInOut: eS,
  circInOut: rS
};
function rC(t) {
  return t in bS;
}
function iC(t) {
  typeof t.ease == "string" && rC(t.ease) && (t.ease = bS[t.ease]);
}
const qd = 10;
class sC extends kS {
  constructor(e) {
    iC(e), yS(e), super(e), e.startTime !== void 0 && e.autoplay !== !1 && (this.startTime = e.startTime), this.options = e;
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * Rather than read committed styles back out of the DOM, we can
   * create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to calculate velocity for any subsequent animation.
   */
  updateMotionValue(e) {
    const { motionValue: n, onUpdate: r, onComplete: s, element: a, ...l } = this.options;
    if (!n)
      return;
    if (e !== void 0) {
      n.set(e);
      return;
    }
    const c = new au({
      ...l,
      autoplay: !1
    }), f = Math.max(qd, At.now() - this.startTime), m = jn(0, qd, f - qd), g = c.sample(f).value, { name: d } = this.options;
    a && d && SS(a, d, g), n.setWithVelocity(c.sample(Math.max(0, f - m)).value, g, m), c.stop();
  }
}
const Nv = (t, e) => e === "zIndex" ? !1 : !!(typeof t == "number" || Array.isArray(t) || typeof t == "string" && // It's animatable if we have a string
(Sn.test(t) || t === "0") && // And it contains numbers and/or colors
!t.startsWith("url("));
function oC(t) {
  const e = t[0];
  if (t.length === 1)
    return !0;
  for (let n = 0; n < t.length; n++)
    if (t[n] !== e)
      return !0;
}
function aC(t, e, n, r) {
  const s = t[0];
  if (s === null)
    return !1;
  if (e === "display" || e === "visibility")
    return !0;
  const a = t[t.length - 1], l = Nv(s, e), c = Nv(a, e);
  return Yo(l === c, `You are trying to animate ${e} from "${s}" to "${a}". "${l ? a : s}" is not an animatable value.`, "value-not-animatable"), !l || !c ? !1 : oC(t) || (n === "spring" || AS(n)) && r;
}
function Bf(t) {
  t.duration = 0, t.type = "keyframes";
}
const CS = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), lC = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function uC(t) {
  for (let e = 0; e < t.length; e++)
    if (typeof t[e] == "string" && lC.test(t[e]))
      return !0;
  return !1;
}
const cC = /* @__PURE__ */ new Set([
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
]), dC = /* @__PURE__ */ K_(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function fC(t) {
  var d;
  const { motionValue: e, name: n, repeatDelay: r, repeatType: s, damping: a, type: l, keyframes: c } = t;
  if (!(((d = e == null ? void 0 : e.owner) == null ? void 0 : d.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: m, transformTemplate: g } = e.owner.getProps();
  return dC() && n && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (CS.has(n) || cC.has(n) && uC(c)) && (n !== "transform" || !g) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !m && !r && s !== "mirror" && a !== 0 && l !== "inertia";
}
const hC = 40;
class pC extends Jh {
  constructor({ autoplay: e = !0, delay: n = 0, type: r = "keyframes", repeat: s = 0, repeatDelay: a = 0, repeatType: l = "loop", keyframes: c, name: f, motionValue: m, element: g, ...d }) {
    var w;
    super(), this.stop = () => {
      var x, T;
      this._animation && (this._animation.stop(), (x = this.stopTimeline) == null || x.call(this)), (T = this.keyframeResolver) == null || T.cancel();
    }, this.createdAt = At.now();
    const p = {
      autoplay: e,
      delay: n,
      type: r,
      repeat: s,
      repeatDelay: a,
      repeatType: l,
      name: f,
      motionValue: m,
      element: g,
      ...d
    }, v = (g == null ? void 0 : g.KeyframeResolver) || ep;
    this.keyframeResolver = new v(c, (x, T, A) => this.onKeyframesResolved(x, T, p, !A), f, m, g), (w = this.keyframeResolver) == null || w.scheduleResolve();
  }
  onKeyframesResolved(e, n, r, s) {
    var A, b;
    this.keyframeResolver = void 0;
    const { name: a, type: l, velocity: c, delay: f, isHandoff: m, onUpdate: g } = r;
    this.resolvedAt = At.now();
    let d = !0;
    aC(e, a, l, c) || (d = !1, (Pr.instantAnimations || !f) && (g == null || g(Ru(e, r, n))), e[0] = e[e.length - 1], Bf(r), r.repeat = 0);
    const v = {
      startTime: s ? this.resolvedAt ? this.resolvedAt - this.createdAt > hC ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: n,
      ...r,
      keyframes: e
    }, w = d && !m && fC(v), x = (b = (A = v.motionValue) == null ? void 0 : A.owner) == null ? void 0 : b.current;
    let T;
    if (w)
      try {
        T = new sC({
          ...v,
          element: x
        });
      } catch {
        T = new au(v);
      }
    else
      T = new au(v);
    T.finished.then(() => {
      this.notifyFinished();
    }).catch(un), this.pendingTimeline && (this.stopTimeline = T.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = T;
  }
  get finished() {
    return this._animation ? this.animation.finished : this._finished;
  }
  then(e, n) {
    return this.finished.finally(e).then(() => {
    });
  }
  get animation() {
    var e;
    return this._animation || ((e = this.keyframeResolver) == null || e.resume(), Qb()), this._animation;
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
  set time(e) {
    this.animation.time = e;
  }
  get speed() {
    return this.animation.speed;
  }
  get state() {
    return this.animation.state;
  }
  set speed(e) {
    this.animation.speed = e;
  }
  get startTime() {
    return this.animation.startTime;
  }
  attachTimeline(e) {
    return this._animation ? this.stopTimeline = this.animation.attachTimeline(e) : this.pendingTimeline = e, () => this.stop();
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
    var e;
    this._animation && this.animation.cancel(), (e = this.keyframeResolver) == null || e.cancel();
  }
}
function PS(t, e, n, r = 0, s = 1) {
  const a = Array.from(t).sort((m, g) => m.sortNodePosition(g)).indexOf(e), l = t.size, c = (l - 1) * r;
  return typeof n == "function" ? n(a, l) : s === 1 ? a * r : c - a * r;
}
const Iv = 30, mC = (t) => !isNaN(parseFloat(t));
class gC {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(e, n = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (r) => {
      var a;
      const s = At.now();
      if (this.updatedAt !== s && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(r), this.current !== this.prev && ((a = this.events.change) == null || a.notify(this.current), this.dependents))
        for (const l of this.dependents)
          l.dirty();
    }, this.hasAnimated = !1, this.setCurrent(e), this.owner = n.owner;
  }
  setCurrent(e) {
    this.current = e, this.updatedAt = At.now(), this.canTrackVelocity === null && e !== void 0 && (this.canTrackVelocity = mC(this.current));
  }
  setPrevFrameValue(e = this.current) {
    this.prevFrameValue = e, this.prevUpdatedAt = this.updatedAt;
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
  onChange(e) {
    return this.on("change", e);
  }
  on(e, n) {
    this.events[e] || (this.events[e] = new Wh());
    const r = this.events[e].add(n);
    return e === "change" ? () => {
      r(), Ee.read(() => {
        this.events.change.getSize() || this.stop();
      });
    } : r;
  }
  clearListeners() {
    for (const e in this.events)
      this.events[e].clear();
  }
  /**
   * Attaches a passive effect to the `MotionValue`.
   */
  attach(e, n) {
    this.passiveEffect = e, this.stopPassiveEffect = n;
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
  set(e) {
    this.passiveEffect ? this.passiveEffect(e, this.updateAndNotify) : this.updateAndNotify(e);
  }
  setWithVelocity(e, n, r) {
    this.set(n), this.prev = void 0, this.prevFrameValue = e, this.prevUpdatedAt = this.updatedAt - r;
  }
  /**
   * Set the state of the `MotionValue`, stopping any active animations,
   * effects, and resets velocity to `0`.
   */
  jump(e, n = !0) {
    this.updateAndNotify(e), this.prev = e, this.prevUpdatedAt = this.prevFrameValue = void 0, n && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
  dirty() {
    var e;
    (e = this.events.change) == null || e.notify(this.current);
  }
  addDependent(e) {
    this.dependents || (this.dependents = /* @__PURE__ */ new Set()), this.dependents.add(e);
  }
  removeDependent(e) {
    this.dependents && this.dependents.delete(e);
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
    const e = At.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || e - this.updatedAt > Iv)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, Iv);
    return /* @__PURE__ */ Y_(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
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
  start(e) {
    return this.stop(), new Promise((n) => {
      this.hasAnimated = !0, this.animation = e(n), this.events.animationStart && this.events.animationStart.notify();
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
    var e, n;
    (e = this.dependents) == null || e.clear(), (n = this.events.destroy) == null || n.notify(), this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
}
function ls(t, e) {
  return new gC(t, e);
}
function ES(t, e) {
  if (t != null && t.inherit && e) {
    const { inherit: n, ...r } = t;
    return { ...e, ...r };
  }
  return t;
}
function tp(t, e) {
  const n = (t == null ? void 0 : t[e]) ?? (t == null ? void 0 : t.default) ?? t;
  return n !== t ? ES(n, t) : n;
}
const yC = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, vC = (t) => ({
  type: "spring",
  stiffness: 550,
  damping: t === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), _C = {
  type: "keyframes",
  duration: 0.8
}, SC = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, xC = (t, { keyframes: e }) => e.length > 2 ? _C : Ts.has(t) ? t.startsWith("scale") ? vC(e[1]) : yC : SC, wC = /* @__PURE__ */ new Set([
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
function TC(t) {
  for (const e in t)
    if (!wC.has(e))
      return !0;
  return !1;
}
const np = (t, e, n, r = {}, s, a) => (l) => {
  const c = tp(r, t) || {}, f = c.delay || r.delay || 0;
  let { elapsed: m = 0 } = r;
  m = m - /* @__PURE__ */ It(f);
  const g = {
    keyframes: Array.isArray(n) ? n : [null, n],
    ease: "easeOut",
    velocity: e.getVelocity(),
    ...c,
    delay: -m,
    onUpdate: (p) => {
      e.set(p), c.onUpdate && c.onUpdate(p);
    },
    onComplete: () => {
      l(), c.onComplete && c.onComplete();
    },
    name: t,
    motionValue: e,
    element: a ? void 0 : s
  };
  TC(c) || Object.assign(g, xC(t, g)), g.duration && (g.duration = /* @__PURE__ */ It(g.duration)), g.repeatDelay && (g.repeatDelay = /* @__PURE__ */ It(g.repeatDelay)), g.from !== void 0 && (g.keyframes[0] = g.from);
  let d = !1;
  if ((g.type === !1 || g.duration === 0 && !g.repeatDelay) && (Bf(g), g.delay === 0 && (d = !0)), (Pr.instantAnimations || Pr.skipAnimations || s != null && s.shouldSkipAnimations || c.skipAnimations) && (d = !0, Bf(g), g.delay = 0), g.allowFlatten = !c.type && !c.ease, d && !a && e.get() !== void 0) {
    const p = Ru(g.keyframes, c);
    if (p !== void 0) {
      Ee.update(() => {
        g.onUpdate(p), g.onComplete();
      });
      return;
    }
  }
  return c.isSync ? new au(g) : new pC(g);
}, AC = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function kC(t) {
  const e = AC.exec(t);
  if (!e)
    return [,];
  const [, n, r, s] = e;
  return [`--${n ?? r}`, s];
}
const bC = 4;
function MS(t, e, n = 1) {
  ci(n <= bC, `Max CSS variable fallback depth detected in property "${t}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [r, s] = kC(t);
  if (!r)
    return;
  const a = window.getComputedStyle(e).getPropertyValue(r);
  if (a) {
    const l = a.trim();
    return W_(l) ? parseFloat(l) : l;
  }
  return Kh(s) ? MS(s, e, n + 1) : s;
}
function Dv(t) {
  const e = [{}, {}];
  return t == null || t.values.forEach((n, r) => {
    e[0][r] = n.get(), e[1][r] = n.getVelocity();
  }), e;
}
function rp(t, e, n, r) {
  if (typeof e == "function") {
    const [s, a] = Dv(r);
    e = e(n !== void 0 ? n : t.custom, s, a);
  }
  if (typeof e == "string" && (e = t.variants && t.variants[e]), typeof e == "function") {
    const [s, a] = Dv(r);
    e = e(n !== void 0 ? n : t.custom, s, a);
  }
  return e;
}
function si(t, e, n) {
  const r = t.getProps();
  return rp(r, e, n !== void 0 ? n : r.custom, t);
}
const RS = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...ws
]), Uf = (t) => Array.isArray(t);
function CC(t, e, n) {
  t.hasValue(e) ? t.getValue(e).set(n) : t.addValue(e, ls(n));
}
function PC(t) {
  return Uf(t) ? t[t.length - 1] || 0 : t;
}
function EC(t, e) {
  const n = si(t, e);
  let { transitionEnd: r = {}, transition: s = {}, ...a } = n || {};
  a = { ...a, ...r };
  for (const l in a) {
    const c = PC(a[l]);
    CC(t, l, c);
  }
}
const ft = (t) => !!(t && t.getVelocity);
function MC(t) {
  return !!(ft(t) && t.add);
}
function Hf(t, e) {
  const n = t.getValue("willChange");
  if (MC(n))
    return n.add(e);
  if (!n && Pr.WillChange) {
    const r = new Pr.WillChange("auto");
    t.addValue("willChange", r), r.add(e);
  }
}
function ip(t) {
  return t.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`);
}
const RC = "framerAppearId", NS = "data-" + ip(RC);
function IS(t) {
  return t.props[NS];
}
function NC({ protectedKeys: t, needsAnimating: e }, n) {
  const r = t.hasOwnProperty(n) && e[n] !== !0;
  return e[n] = !1, r;
}
function DS(t, e, { delay: n = 0, transitionOverride: r, type: s } = {}) {
  let { transition: a, transitionEnd: l, ...c } = e;
  const f = t.getDefaultTransition();
  a = a ? ES(a, f) : f;
  const m = a == null ? void 0 : a.reduceMotion, g = a == null ? void 0 : a.skipAnimations;
  r && (a = r);
  const d = [], p = s && t.animationState && t.animationState.getState()[s], v = a == null ? void 0 : a.path;
  v && v.animateVisualElement(t, c, a, n, d);
  for (const w in c) {
    const x = t.getValue(w, t.latestValues[w] ?? null), T = c[w];
    if (T === void 0 || p && NC(p, w))
      continue;
    const A = {
      delay: n,
      ...tp(a || {}, w)
    };
    g && (A.skipAnimations = !0);
    const b = x.get();
    if (b !== void 0 && !x.isAnimating() && !Array.isArray(T) && T === b && !A.velocity) {
      Ee.update(() => x.set(T));
      continue;
    }
    let C = !1;
    if (window.MotionHandoffAnimation) {
      const z = IS(t);
      if (z) {
        const O = window.MotionHandoffAnimation(z, w, Ee);
        O !== null && (A.startTime = O, C = !0);
      }
    }
    Hf(t, w);
    const M = m ?? t.shouldReduceMotion;
    x.start(np(w, x, T, M && RS.has(w) ? { type: !1 } : A, t, C));
    const P = x.animation;
    P && d.push(P);
  }
  if (l) {
    const w = () => Ee.update(() => {
      l && EC(t, l);
    });
    d.length ? Promise.all(d).then(w) : w();
  }
  return d;
}
function Wf(t, e, n = {}) {
  var f;
  const r = si(t, e, n.type === "exit" ? (f = t.presenceContext) == null ? void 0 : f.custom : void 0);
  let { transition: s = t.getDefaultTransition() || {} } = r || {};
  n.transitionOverride && (s = n.transitionOverride);
  const a = r ? () => Promise.all(DS(t, r, n)) : () => Promise.resolve(), l = t.variantChildren && t.variantChildren.size ? (m = 0) => {
    const { delayChildren: g = 0, staggerChildren: d, staggerDirection: p } = s;
    return IC(t, e, m, g, d, p, n);
  } : () => Promise.resolve(), { when: c } = s;
  if (c) {
    const [m, g] = c === "beforeChildren" ? [a, l] : [l, a];
    return m().then(() => g());
  } else
    return Promise.all([a(), l(n.delay)]);
}
function IC(t, e, n = 0, r = 0, s = 0, a = 1, l) {
  const c = [];
  for (const f of t.variantChildren)
    f.notify("AnimationStart", e), c.push(Wf(f, e, {
      ...l,
      delay: n + (typeof r == "function" ? 0 : r) + PS(t.variantChildren, f, r, s, a)
    }).then(() => f.notify("AnimationComplete", e)));
  return Promise.all(c);
}
function DC(t, e, n = {}) {
  t.notify("AnimationStart", e);
  let r;
  if (Array.isArray(e)) {
    const s = e.map((a) => Wf(t, a, n));
    r = Promise.all(s);
  } else if (typeof e == "string")
    r = Wf(t, e, n);
  else {
    const s = typeof e == "function" ? si(t, e, n.custom) : e;
    r = Promise.all(DS(t, s, n));
  }
  return r.then(() => {
    t.notify("AnimationComplete", e);
  });
}
const jC = {
  test: (t) => t === "auto",
  parse: (t) => t
}, jS = (t) => (e) => e.test(t), FS = [xs, oe, Dn, Wn, ob, sb, jC], jv = (t) => FS.find(jS(t));
function FC(t) {
  return typeof t == "number" ? t === 0 : t !== null ? t === "none" || t === "0" || G_(t) : !0;
}
const OC = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function LC(t) {
  const [e, n] = t.slice(0, -1).split("(");
  if (e === "drop-shadow")
    return t;
  const [r] = n.match(Yh) || [];
  if (!r)
    return t;
  const s = n.replace(r, "");
  let a = OC.has(e) ? 1 : 0;
  return r !== n && (a *= 100), e + "(" + a + s + ")";
}
const zC = /\b([a-z-]*)\(.*?\)/gu, Zf = {
  ...Sn,
  getAnimatableNone: (t) => {
    const e = t.match(zC);
    return e ? e.map(LC).join(" ") : t;
  }
}, Gf = {
  ...Sn,
  getAnimatableNone: (t) => {
    const e = Sn.parse(t);
    return Sn.createTransformer(t)(e.map((r) => typeof r == "number" ? 0 : typeof r == "object" ? { ...r, alpha: 1 } : r));
  }
}, Fv = {
  ...xs,
  transform: Math.round
}, $C = {
  rotate: Wn,
  /**
   * Internal channel for `transition.path` orientToPath. Composed onto
   * `rotate` at the transform-build sites so the user's `rotate` is
   * never read or overwritten. Not part of `transformPropOrder`.
   */
  pathRotation: Wn,
  rotateX: Wn,
  rotateY: Wn,
  rotateZ: Wn,
  scale: wl,
  scaleX: wl,
  scaleY: wl,
  scaleZ: wl,
  skew: Wn,
  skewX: Wn,
  skewY: Wn,
  distance: oe,
  translateX: oe,
  translateY: oe,
  translateZ: oe,
  x: oe,
  y: oe,
  z: oe,
  perspective: oe,
  transformPerspective: oe,
  opacity: jo,
  originX: wv,
  originY: wv,
  originZ: oe
}, lu = {
  // Border props
  borderWidth: oe,
  borderTopWidth: oe,
  borderRightWidth: oe,
  borderBottomWidth: oe,
  borderLeftWidth: oe,
  borderRadius: oe,
  borderTopLeftRadius: oe,
  borderTopRightRadius: oe,
  borderBottomRightRadius: oe,
  borderBottomLeftRadius: oe,
  // Positioning props
  width: oe,
  maxWidth: oe,
  height: oe,
  maxHeight: oe,
  top: oe,
  right: oe,
  bottom: oe,
  left: oe,
  inset: oe,
  insetBlock: oe,
  insetBlockStart: oe,
  insetBlockEnd: oe,
  insetInline: oe,
  insetInlineStart: oe,
  insetInlineEnd: oe,
  // Spacing props
  padding: oe,
  paddingTop: oe,
  paddingRight: oe,
  paddingBottom: oe,
  paddingLeft: oe,
  paddingBlock: oe,
  paddingBlockStart: oe,
  paddingBlockEnd: oe,
  paddingInline: oe,
  paddingInlineStart: oe,
  paddingInlineEnd: oe,
  margin: oe,
  marginTop: oe,
  marginRight: oe,
  marginBottom: oe,
  marginLeft: oe,
  marginBlock: oe,
  marginBlockStart: oe,
  marginBlockEnd: oe,
  marginInline: oe,
  marginInlineStart: oe,
  marginInlineEnd: oe,
  // Typography
  fontSize: oe,
  // Misc
  backgroundPositionX: oe,
  backgroundPositionY: oe,
  ...$C,
  zIndex: Fv,
  // SVG
  fillOpacity: jo,
  strokeOpacity: jo,
  numOctaves: Fv
}, VC = {
  ...lu,
  // Color props
  color: Qe,
  backgroundColor: Qe,
  outlineColor: Qe,
  fill: Qe,
  stroke: Qe,
  // Border props
  borderColor: Qe,
  borderTopColor: Qe,
  borderRightColor: Qe,
  borderBottomColor: Qe,
  borderLeftColor: Qe,
  filter: Zf,
  WebkitFilter: Zf,
  mask: Gf,
  WebkitMask: Gf
}, OS = (t) => VC[t], BC = /* @__PURE__ */ new Set([Zf, Gf]);
function LS(t, e) {
  let n = OS(t);
  return BC.has(n) || (n = Sn), n.getAnimatableNone ? n.getAnimatableNone(e) : void 0;
}
const UC = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function HC(t, e, n) {
  let r = 0, s;
  for (; r < t.length && !s; ) {
    const a = t[r];
    typeof a == "string" && !UC.has(a) && as(a).values.length && (s = t[r]), r++;
  }
  if (s && n)
    for (const a of e)
      t[a] = LS(n, s);
}
class WC extends ep {
  constructor(e, n, r, s, a) {
    super(e, n, r, s, a, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: e, element: n, name: r } = this;
    if (!n || !n.current)
      return;
    super.readKeyframes();
    for (let g = 0; g < e.length; g++) {
      let d = e[g];
      if (typeof d == "string" && (d = d.trim(), Kh(d))) {
        const p = MS(d, n.current);
        p !== void 0 && (e[g] = p), g === e.length - 1 && (this.finalKeyframe = d);
      }
    }
    if (this.resolveNoneKeyframes(), !RS.has(r) || e.length !== 2)
      return;
    const [s, a] = e, l = jv(s), c = jv(a), f = xv(s), m = xv(a);
    if (f !== m && xr[r]) {
      this.needsMeasurement = !0;
      return;
    }
    if (l !== c)
      if (Mv(l) && Mv(c))
        for (let g = 0; g < e.length; g++) {
          const d = e[g];
          typeof d == "string" && (e[g] = parseFloat(d));
        }
      else xr[r] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: e, name: n } = this, r = [];
    for (let s = 0; s < e.length; s++)
      (e[s] === null || FC(e[s])) && r.push(s);
    r.length && HC(e, r, n);
  }
  measureInitialState() {
    const { element: e, unresolvedKeyframes: n, name: r } = this;
    if (!e || !e.current)
      return;
    r === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = xr[r](e.measureViewportBox(), window.getComputedStyle(e.current)), n[0] = this.measuredOrigin;
    const s = n[n.length - 1];
    s !== void 0 && e.getValue(r, s).jump(s, !1);
  }
  measureEndState() {
    var c;
    const { element: e, name: n, unresolvedKeyframes: r } = this;
    if (!e || !e.current)
      return;
    const s = e.getValue(n);
    s && s.jump(this.measuredOrigin, !1);
    const a = r.length - 1, l = r[a];
    r[a] = xr[n](e.measureViewportBox(), window.getComputedStyle(e.current)), l !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = l), (c = this.removedTransforms) != null && c.length && this.removedTransforms.forEach(([f, m]) => {
      e.getValue(f).set(m);
    }), this.resolveNoneKeyframes();
  }
}
const sp = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius"
];
function zS(t, e, n) {
  if (t == null)
    return [];
  if (t instanceof EventTarget)
    return [t];
  if (typeof t == "string") {
    let r = document;
    const s = (n == null ? void 0 : n[t]) ?? r.querySelectorAll(t);
    return s ? Array.from(s) : [];
  }
  return Array.from(t).filter((r) => r != null);
}
const Kf = (t, e) => e && typeof t == "number" ? e.transform(t) : t;
function Fl(t) {
  return Z_(t) && "offsetHeight" in t && !("ownerSVGElement" in t);
}
const { schedule: op } = /* @__PURE__ */ oS(queueMicrotask, !1), _n = {
  x: !1,
  y: !1
};
function $S() {
  return _n.x || _n.y;
}
function ZC(t) {
  return t === "x" || t === "y" ? _n[t] ? null : (_n[t] = !0, () => {
    _n[t] = !1;
  }) : _n.x || _n.y ? null : (_n.x = _n.y = !0, () => {
    _n.x = _n.y = !1;
  });
}
function VS(t, e) {
  const n = zS(t), r = new AbortController(), s = {
    passive: !0,
    ...e,
    signal: r.signal
  };
  return [n, s, () => r.abort()];
}
function GC(t) {
  return !(t.pointerType === "touch" || $S());
}
function KC(t, e, n = {}) {
  const [r, s, a] = VS(t, n);
  return r.forEach((l) => {
    let c = !1, f = !1, m;
    const g = () => {
      l.removeEventListener("pointerleave", w);
    }, d = (T) => {
      m && (m(T), m = void 0), g();
    }, p = (T) => {
      c = !1, window.removeEventListener("pointerup", p), window.removeEventListener("pointercancel", p), f && (f = !1, d(T));
    }, v = () => {
      c = !0, window.addEventListener("pointerup", p, s), window.addEventListener("pointercancel", p, s);
    }, w = (T) => {
      if (T.pointerType !== "touch") {
        if (c) {
          f = !0;
          return;
        }
        d(T);
      }
    }, x = (T) => {
      if (!GC(T))
        return;
      f = !1;
      const A = e(l, T);
      typeof A == "function" && (m = A, l.addEventListener("pointerleave", w, s));
    };
    l.addEventListener("pointerenter", x, s), l.addEventListener("pointerdown", v, s);
  }), a;
}
const BS = (t, e) => e ? t === e ? !0 : BS(t, e.parentElement) : !1, ap = (t) => t.pointerType === "mouse" ? typeof t.button != "number" || t.button <= 0 : t.isPrimary !== !1, YC = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function qC(t) {
  return YC.has(t.tagName) || t.isContentEditable === !0;
}
const QC = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function XC(t) {
  return QC.has(t.tagName) || t.isContentEditable === !0;
}
const Ol = /* @__PURE__ */ new WeakSet();
function Ov(t) {
  return (e) => {
    e.key === "Enter" && t(e);
  };
}
function Qd(t, e) {
  t.dispatchEvent(new PointerEvent("pointer" + e, { isPrimary: !0, bubbles: !0 }));
}
const JC = (t, e) => {
  const n = t.currentTarget;
  if (!n)
    return;
  const r = Ov(() => {
    if (Ol.has(n))
      return;
    Qd(n, "down");
    const s = Ov(() => {
      Qd(n, "up");
    }), a = () => Qd(n, "cancel");
    n.addEventListener("keyup", s, e), n.addEventListener("blur", a, e);
  });
  n.addEventListener("keydown", r, e), n.addEventListener("blur", () => n.removeEventListener("keydown", r), e);
};
function Lv(t) {
  return ap(t) && !$S();
}
const zv = /* @__PURE__ */ new WeakSet();
function eP(t, e, n = {}) {
  const [r, s, a] = VS(t, n), l = (c) => {
    const f = c.currentTarget;
    if (!Lv(c) || zv.has(c))
      return;
    Ol.add(f), n.stopPropagation && zv.add(c);
    const m = e(f, c), g = { ...s, capture: !0 }, d = (w, x) => {
      window.removeEventListener("pointerup", p, g), window.removeEventListener("pointercancel", v, g), Ol.has(f) && Ol.delete(f), Lv(w) && typeof m == "function" && m(w, { success: x });
    }, p = (w) => {
      d(w, f === window || f === document || n.useGlobalTarget || BS(f, w.target));
    }, v = (w) => {
      d(w, !1);
    };
    window.addEventListener("pointerup", p, g), window.addEventListener("pointercancel", v, g);
  };
  return r.forEach((c) => {
    (n.useGlobalTarget ? window : c).addEventListener("pointerdown", l, s), Fl(c) && (c.addEventListener("focus", (m) => JC(m, s)), !qC(c) && !c.hasAttribute("tabindex") && (c.tabIndex = 0));
  }), a;
}
function lp(t) {
  return Z_(t) && "ownerSVGElement" in t;
}
const Ll = /* @__PURE__ */ new WeakMap();
let vr;
const US = (t, e, n) => (r, s) => s && s[0] ? s[0][t + "Size"] : lp(r) && "getBBox" in r ? r.getBBox()[e] : r[n], tP = /* @__PURE__ */ US("inline", "width", "offsetWidth"), nP = /* @__PURE__ */ US("block", "height", "offsetHeight");
function rP({ target: t, borderBoxSize: e }) {
  var n;
  (n = Ll.get(t)) == null || n.forEach((r) => {
    r(t, {
      get width() {
        return tP(t, e);
      },
      get height() {
        return nP(t, e);
      }
    });
  });
}
function iP(t) {
  t.forEach(rP);
}
function sP() {
  typeof ResizeObserver > "u" || (vr = new ResizeObserver(iP));
}
function oP(t, e) {
  vr || sP();
  const n = zS(t);
  return n.forEach((r) => {
    let s = Ll.get(r);
    s || (s = /* @__PURE__ */ new Set(), Ll.set(r, s)), s.add(e), vr == null || vr.observe(r);
  }), () => {
    n.forEach((r) => {
      const s = Ll.get(r);
      s == null || s.delete(e), s != null && s.size || vr == null || vr.unobserve(r);
    });
  };
}
const zl = /* @__PURE__ */ new Set();
let Yi;
function aP() {
  Yi = () => {
    const t = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    zl.forEach((e) => e(t));
  }, window.addEventListener("resize", Yi);
}
function lP(t) {
  return zl.add(t), Yi || aP(), () => {
    zl.delete(t), !zl.size && typeof Yi == "function" && (window.removeEventListener("resize", Yi), Yi = void 0);
  };
}
function $v(t, e) {
  return typeof t == "function" ? lP(t) : oP(t, e);
}
function uP(t) {
  return lp(t) && t.tagName === "svg";
}
const cP = [...FS, Qe, Sn], dP = (t) => cP.find(jS(t)), Vv = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), qi = () => ({
  x: Vv(),
  y: Vv()
}), Bv = () => ({ min: 0, max: 0 }), nt = () => ({
  x: Bv(),
  y: Bv()
}), fP = /* @__PURE__ */ new WeakMap();
function Nu(t) {
  return t !== null && typeof t == "object" && typeof t.start == "function";
}
function Fo(t) {
  return typeof t == "string" || Array.isArray(t);
}
const up = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], cp = ["initial", ...up];
function Iu(t) {
  return Nu(t.animate) || cp.some((e) => Fo(t[e]));
}
function HS(t) {
  return !!(Iu(t) || t.variants);
}
function hP(t, e, n) {
  for (const r in e) {
    const s = e[r], a = n[r];
    if (ft(s))
      t.addValue(r, s);
    else if (ft(a))
      t.addValue(r, ls(s, { owner: t }));
    else if (a !== s)
      if (t.hasValue(r)) {
        const l = t.getValue(r);
        l.liveStyle === !0 ? l.jump(s) : l.hasAnimated || l.set(s);
      } else {
        const l = t.getStaticValue(r);
        t.addValue(r, ls(l !== void 0 ? l : s, { owner: t }));
      }
  }
  for (const r in n)
    e[r] === void 0 && t.removeValue(r);
  return e;
}
const Yf = { current: null }, WS = { current: !1 }, pP = typeof window < "u";
function mP() {
  if (WS.current = !0, !!pP)
    if (window.matchMedia) {
      const t = window.matchMedia("(prefers-reduced-motion)"), e = () => Yf.current = t.matches;
      t.addEventListener("change", e), e();
    } else
      Yf.current = !1;
}
const Uv = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let uu = {};
function ZS(t) {
  uu = t;
}
function gP() {
  return uu;
}
class yP {
  /**
   * This method takes React props and returns found MotionValues. For example, HTML
   * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
   *
   * This isn't an abstract method as it needs calling in the constructor, but it is
   * intended to be one.
   */
  scrapeMotionValuesFromProps(e, n, r) {
    return {};
  }
  constructor({ parent: e, props: n, presenceContext: r, reducedMotionConfig: s, skipAnimations: a, blockInitialAnimation: l, visualState: c }, f = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = ep, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const v = At.now();
      this.renderScheduledAt < v && (this.renderScheduledAt = v, Ee.render(this.render, !1, !0));
    };
    const { latestValues: m, renderState: g } = c;
    this.latestValues = m, this.baseTarget = { ...m }, this.initialValues = n.initial ? { ...m } : {}, this.renderState = g, this.parent = e, this.props = n, this.presenceContext = r, this.depth = e ? e.depth + 1 : 0, this.reducedMotionConfig = s, this.skipAnimationsConfig = a, this.options = f, this.blockInitialAnimation = !!l, this.isControllingVariants = Iu(n), this.isVariantNode = HS(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(e && e.current);
    const { willChange: d, ...p } = this.scrapeMotionValuesFromProps(n, {}, this);
    for (const v in p) {
      const w = p[v];
      m[v] !== void 0 && ft(w) && w.set(m[v]);
    }
  }
  mount(e) {
    var n, r;
    if (this.hasBeenMounted)
      for (const s in this.initialValues)
        (n = this.values.get(s)) == null || n.jump(this.initialValues[s]), this.latestValues[s] = this.initialValues[s];
    this.current = e, fP.set(e, this), this.projection && !this.projection.instance && this.projection.mount(e), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((s, a) => this.bindToMotionValue(a, s)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (WS.current || mP(), this.shouldReduceMotion = Yf.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (r = this.parent) == null || r.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    var e;
    this.projection && this.projection.unmount(), Er(this.notifyUpdate), Er(this.render), this.valueSubscriptions.forEach((n) => n()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), (e = this.parent) == null || e.removeChild(this);
    for (const n in this.events)
      this.events[n].clear();
    for (const n in this.features) {
      const r = this.features[n];
      r && (r.unmount(), r.isMounted = !1);
    }
    this.current = null;
  }
  addChild(e) {
    this.children.add(e), this.enteringChildren ?? (this.enteringChildren = /* @__PURE__ */ new Set()), this.enteringChildren.add(e);
  }
  removeChild(e) {
    this.children.delete(e), this.enteringChildren && this.enteringChildren.delete(e);
  }
  bindToMotionValue(e, n) {
    if (this.valueSubscriptions.has(e) && this.valueSubscriptions.get(e)(), n.accelerate && CS.has(e) && this.current instanceof HTMLElement) {
      const { factory: l, keyframes: c, times: f, ease: m, duration: g } = n.accelerate, d = new kS({
        element: this.current,
        name: e,
        keyframes: c,
        times: f,
        ease: m,
        duration: /* @__PURE__ */ It(g)
      }), p = l(d);
      this.valueSubscriptions.set(e, () => {
        p(), d.cancel();
      });
      return;
    }
    const r = Ts.has(e);
    r && this.onBindTransform && this.onBindTransform();
    const s = n.on("change", (l) => {
      this.latestValues[e] = l, this.props.onUpdate && Ee.preRender(this.notifyUpdate), r && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
    });
    let a;
    typeof window < "u" && window.MotionCheckAppearSync && (a = window.MotionCheckAppearSync(this, e, n)), this.valueSubscriptions.set(e, () => {
      s(), a && a();
    });
  }
  sortNodePosition(e) {
    return !this.current || !this.sortInstanceNodePosition || this.type !== e.type ? 0 : this.sortInstanceNodePosition(this.current, e.current);
  }
  updateFeatures() {
    let e = "animation";
    for (e in uu) {
      const n = uu[e];
      if (!n)
        continue;
      const { isEnabled: r, Feature: s } = n;
      if (!this.features[e] && s && r(this.props) && (this.features[e] = new s(this)), this.features[e]) {
        const a = this.features[e];
        a.isMounted ? a.update() : (a.mount(), a.isMounted = !0);
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
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : nt();
  }
  getStaticValue(e) {
    return this.latestValues[e];
  }
  setStaticValue(e, n) {
    this.latestValues[e] = n;
  }
  /**
   * Update the provided props. Ensure any newly-added motion values are
   * added to our map, old ones removed, and listeners updated.
   */
  update(e, n) {
    (e.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = e, this.prevPresenceContext = this.presenceContext, this.presenceContext = n;
    for (let r = 0; r < Uv.length; r++) {
      const s = Uv[r];
      this.propEventSubscriptions[s] && (this.propEventSubscriptions[s](), delete this.propEventSubscriptions[s]);
      const a = "on" + s, l = e[a];
      l && (this.propEventSubscriptions[s] = this.on(s, l));
    }
    this.prevMotionValues = hP(this, this.scrapeMotionValuesFromProps(e, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
  }
  getProps() {
    return this.props;
  }
  /**
   * Returns the variant definition with a given name.
   */
  getVariant(e) {
    return this.props.variants ? this.props.variants[e] : void 0;
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
  addVariantChild(e) {
    const n = this.getClosestVariantNode();
    if (n)
      return n.variantChildren && n.variantChildren.add(e), () => n.variantChildren.delete(e);
  }
  /**
   * Add a motion value and bind it to this visual element.
   */
  addValue(e, n) {
    const r = this.values.get(e);
    n !== r && (r && this.removeValue(e), this.bindToMotionValue(e, n), this.values.set(e, n), this.latestValues[e] = n.get());
  }
  /**
   * Remove a motion value and unbind any active subscriptions.
   */
  removeValue(e) {
    this.values.delete(e);
    const n = this.valueSubscriptions.get(e);
    n && (n(), this.valueSubscriptions.delete(e)), delete this.latestValues[e], this.removeValueFromRenderState(e, this.renderState);
  }
  /**
   * Check whether we have a motion value for this key
   */
  hasValue(e) {
    return this.values.has(e);
  }
  getValue(e, n) {
    if (this.props.values && this.props.values[e])
      return this.props.values[e];
    let r = this.values.get(e);
    return r === void 0 && n !== void 0 && (r = ls(n === null ? void 0 : n, { owner: this }), this.addValue(e, r)), r;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(e, n) {
    let r = this.latestValues[e] !== void 0 || !this.current ? this.latestValues[e] : this.getBaseTargetFromProps(this.props, e) ?? this.readValueFromInstance(this.current, e, this.options);
    return r != null && (typeof r == "string" && (W_(r) || G_(r)) ? r = parseFloat(r) : !dP(r) && Sn.test(n) && (r = LS(e, n)), this.setBaseTarget(e, ft(r) ? r.get() : r)), ft(r) ? r.get() : r;
  }
  /**
   * Set the base target to later animate back to. This is currently
   * only hydrated on creation and when we first read a value.
   */
  setBaseTarget(e, n) {
    this.baseTarget[e] = n;
  }
  /**
   * Find the base target for a value thats been removed from all animation
   * props.
   */
  getBaseTarget(e) {
    var a;
    const { initial: n } = this.props;
    let r;
    if (typeof n == "string" || typeof n == "object") {
      const l = rp(this.props, n, (a = this.presenceContext) == null ? void 0 : a.custom);
      l && (r = l[e]);
    }
    if (n && r !== void 0)
      return r;
    const s = this.getBaseTargetFromProps(this.props, e);
    return s !== void 0 && !ft(s) ? s : this.initialValues[e] !== void 0 && r === void 0 ? void 0 : this.baseTarget[e];
  }
  on(e, n) {
    return this.events[e] || (this.events[e] = new Wh()), this.events[e].add(n);
  }
  notify(e, ...n) {
    this.events[e] && this.events[e].notify(...n);
  }
  scheduleRenderMicrotask() {
    op.render(this.render);
  }
}
class GS extends yP {
  constructor() {
    super(...arguments), this.KeyframeResolver = WC;
  }
  sortInstanceNodePosition(e, n) {
    return e.compareDocumentPosition(n) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(e, n) {
    const r = e.style;
    return r ? r[n] : void 0;
  }
  removeValueFromRenderState(e, { vars: n, style: r }) {
    delete n[e], delete r[e];
  }
  handleChildMotionValue() {
    this.childSubscription && (this.childSubscription(), delete this.childSubscription);
    const { children: e } = this.props;
    ft(e) && (this.childSubscription = e.on("change", (n) => {
      this.current && (this.current.textContent = `${n}`);
    }));
  }
}
class Ir {
  constructor(e) {
    this.isMounted = !1, this.node = e;
  }
  update() {
  }
}
function KS({ top: t, left: e, right: n, bottom: r }) {
  return {
    x: { min: e, max: n },
    y: { min: t, max: r }
  };
}
function vP({ x: t, y: e }) {
  return { top: e.min, right: t.max, bottom: e.max, left: t.min };
}
function _P(t, e) {
  if (!e)
    return t;
  const n = e({ x: t.left, y: t.top }), r = e({ x: t.right, y: t.bottom });
  return {
    top: n.y,
    left: n.x,
    bottom: r.y,
    right: r.x
  };
}
function Xd(t) {
  return t === void 0 || t === 1;
}
function qf({ scale: t, scaleX: e, scaleY: n }) {
  return !Xd(t) || !Xd(e) || !Xd(n);
}
function Qr(t) {
  return qf(t) || YS(t) || t.z || t.rotate || t.rotateX || t.rotateY || t.skewX || t.skewY;
}
function YS(t) {
  return Hv(t.x) || Hv(t.y);
}
function Hv(t) {
  return t && t !== "0%";
}
function cu(t, e, n) {
  const r = t - n, s = e * r;
  return n + s;
}
function Wv(t, e, n, r, s) {
  return s !== void 0 && (t = cu(t, s, r)), cu(t, n, r) + e;
}
function Qf(t, e = 0, n = 1, r, s) {
  t.min = Wv(t.min, e, n, r, s), t.max = Wv(t.max, e, n, r, s);
}
function qS(t, { x: e, y: n }) {
  Qf(t.x, e.translate, e.scale, e.originPoint), Qf(t.y, n.translate, n.scale, n.originPoint);
}
const Zv = 0.999999999999, Gv = 1.0000000000001;
function SP(t, e, n, r = !1) {
  var c;
  const s = n.length;
  if (!s)
    return;
  e.x = e.y = 1;
  let a, l;
  for (let f = 0; f < s; f++) {
    a = n[f], l = a.projectionDelta;
    const { visualElement: m } = a.options;
    m && m.props.style && m.props.style.display === "contents" || (r && a.options.layoutScroll && a.scroll && a !== a.root && (Mn(t.x, -a.scroll.offset.x), Mn(t.y, -a.scroll.offset.y)), l && (e.x *= l.x.scale, e.y *= l.y.scale, qS(t, l)), r && Qr(a.latestValues) && $l(t, a.latestValues, (c = a.layout) == null ? void 0 : c.layoutBox));
  }
  e.x < Gv && e.x > Zv && (e.x = 1), e.y < Gv && e.y > Zv && (e.y = 1);
}
function Mn(t, e) {
  t.min += e, t.max += e;
}
function Kv(t, e, n, r, s = 0.5) {
  const a = Pe(t.min, t.max, s);
  Qf(t, e, n, a, r);
}
function Yv(t, e) {
  return typeof t == "string" ? parseFloat(t) / 100 * (e.max - e.min) : t;
}
function $l(t, e, n) {
  const r = n ?? t;
  Kv(t.x, Yv(e.x, r.x), e.scaleX, e.scale, e.originX), Kv(t.y, Yv(e.y, r.y), e.scaleY, e.scale, e.originY);
}
function QS(t, e) {
  return KS(_P(t.getBoundingClientRect(), e));
}
function xP(t, e, n) {
  const r = QS(t, n), { scroll: s } = e;
  return s && (Mn(r.x, s.offset.x), Mn(r.y, s.offset.y)), r;
}
const wP = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, TP = ws.length;
function AP(t, e, n) {
  let r = "", s = !0;
  for (let l = 0; l < TP; l++) {
    const c = ws[l], f = t[c];
    if (f === void 0)
      continue;
    let m = !0;
    if (typeof f == "number")
      m = f === (c.startsWith("scale") ? 1 : 0);
    else {
      const g = parseFloat(f);
      m = c.startsWith("scale") ? g === 1 : g === 0;
    }
    if (!m || n) {
      const g = Kf(f, lu[c]);
      if (!m) {
        s = !1;
        const d = wP[c] || c;
        r += `${d}(${g}) `;
      }
      n && (e[c] = g);
    }
  }
  const a = t.pathRotation;
  return a && (s = !1, r += `rotate(${Kf(a, lu.pathRotation)}) `), r = r.trim(), n ? r = n(e, s ? "" : r) : s && (r = "none"), r;
}
function dp(t, e, n) {
  const { style: r, vars: s, transformOrigin: a } = t;
  let l = !1, c = !1;
  for (const f in e) {
    const m = e[f];
    if (Ts.has(f)) {
      l = !0;
      continue;
    } else if (lS(f)) {
      s[f] = m;
      continue;
    } else {
      const g = Kf(m, lu[f]);
      f.startsWith("origin") ? (c = !0, a[f] = g) : r[f] = g;
    }
  }
  if (e.transform || (l || n ? r.transform = AP(e, t.transform, n) : r.transform && (r.transform = "none")), c) {
    const { originX: f = "50%", originY: m = "50%", originZ: g = 0 } = a;
    r.transformOrigin = `${f} ${m} ${g}`;
  }
}
function XS(t, { style: e, vars: n }, r, s) {
  const a = t.style;
  let l;
  for (l in e)
    a[l] = e[l];
  s == null || s.applyProjectionStyles(a, r);
  for (l in n)
    a.setProperty(l, n[l]);
}
function qv(t, e) {
  return e.max === e.min ? 0 : t / (e.max - e.min) * 100;
}
const ho = {
  correct: (t, e) => {
    if (!e.target)
      return t;
    if (typeof t == "string")
      if (oe.test(t))
        t = parseFloat(t);
      else
        return t;
    const n = qv(t, e.target.x), r = qv(t, e.target.y);
    return `${n}% ${r}%`;
  }
}, kP = {
  correct: (t, { treeScale: e, projectionDelta: n }) => {
    const r = t, s = Sn.parse(t);
    if (s.length > 5)
      return r;
    const a = Sn.createTransformer(t), l = typeof s[0] != "number" ? 1 : 0, c = n.x.scale * e.x, f = n.y.scale * e.y;
    s[0 + l] /= c, s[1 + l] /= f;
    const m = Pe(c, f, 0.5);
    return typeof s[2 + l] == "number" && (s[2 + l] /= m), typeof s[3 + l] == "number" && (s[3 + l] /= m), a(s);
  }
}, Xf = {
  borderRadius: {
    ...ho,
    applyTo: [...sp]
  },
  borderTopLeftRadius: ho,
  borderTopRightRadius: ho,
  borderBottomLeftRadius: ho,
  borderBottomRightRadius: ho,
  boxShadow: kP
};
function JS(t, { layout: e, layoutId: n }) {
  return Ts.has(t) || t.startsWith("origin") || (e || n !== void 0) && (!!Xf[t] || t === "opacity");
}
function fp(t, e, n) {
  var l;
  const r = t.style, s = e == null ? void 0 : e.style, a = {};
  if (!r)
    return a;
  for (const c in r)
    (ft(r[c]) || s && ft(s[c]) || JS(c, t) || ((l = n == null ? void 0 : n.getValue(c)) == null ? void 0 : l.liveStyle) !== void 0) && (a[c] = r[c]);
  return a;
}
function bP(t) {
  return window.getComputedStyle(t);
}
class CP extends GS {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = XS;
  }
  readValueFromInstance(e, n) {
    var r;
    if (Ts.has(n))
      return (r = this.projection) != null && r.isProjecting ? Of(n) : Zb(e, n);
    {
      const s = bP(e), a = (lS(n) ? s.getPropertyValue(n) : s[n]) || 0;
      return typeof a == "string" ? a.trim() : a;
    }
  }
  measureInstanceViewportBox(e, { transformPagePoint: n }) {
    return QS(e, n);
  }
  build(e, n, r) {
    dp(e, n, r.transformTemplate);
  }
  scrapeMotionValuesFromProps(e, n, r) {
    return fp(e, n, r);
  }
}
const PP = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, EP = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function MP(t, e, n = 1, r = 0, s = !0) {
  t.pathLength = 1;
  const a = s ? PP : EP;
  t[a.offset] = `${-r}`, t[a.array] = `${e} ${n}`;
}
const RP = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function ex(t, {
  attrX: e,
  attrY: n,
  attrScale: r,
  pathLength: s,
  pathSpacing: a = 1,
  pathOffset: l = 0,
  // This is object creation, which we try to avoid per-frame.
  ...c
}, f, m, g) {
  if (dp(t, c, m), f) {
    t.style.viewBox && (t.attrs.viewBox = t.style.viewBox);
    return;
  }
  t.attrs = t.style, t.style = {};
  const { attrs: d, style: p } = t;
  d.transform && (p.transform = d.transform, delete d.transform), (p.transform || d.transformOrigin) && (p.transformOrigin = d.transformOrigin ?? "50% 50%", delete d.transformOrigin), p.transform && (p.transformBox = (g == null ? void 0 : g.transformBox) ?? "fill-box", delete d.transformBox);
  for (const v of RP)
    d[v] !== void 0 && (p[v] = d[v], delete d[v]);
  e !== void 0 && (d.x = e), n !== void 0 && (d.y = n), r !== void 0 && (d.scale = r), s !== void 0 && MP(d, s, a, l, !1);
}
const tx = /* @__PURE__ */ new Set([
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
]), nx = (t) => typeof t == "string" && t.toLowerCase() === "svg";
function NP(t, e, n, r) {
  XS(t, e, void 0, r);
  for (const s in e.attrs)
    t.setAttribute(tx.has(s) ? s : ip(s), e.attrs[s]);
}
function rx(t, e, n) {
  const r = fp(t, e, n);
  for (const s in t)
    if (ft(t[s]) || ft(e[s])) {
      const a = ws.indexOf(s) !== -1 ? "attr" + s.charAt(0).toUpperCase() + s.substring(1) : s;
      r[a] = t[s];
    }
  return r;
}
class IP extends GS {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = nt;
  }
  getBaseTargetFromProps(e, n) {
    return e[n];
  }
  readValueFromInstance(e, n) {
    if (Ts.has(n)) {
      const r = OS(n);
      return r && r.default || 0;
    }
    return n = tx.has(n) ? n : ip(n), e.getAttribute(n);
  }
  scrapeMotionValuesFromProps(e, n, r) {
    return rx(e, n, r);
  }
  build(e, n, r) {
    ex(e, n, this.isSVGTag, r.transformTemplate, r.style);
  }
  renderInstance(e, n, r, s) {
    NP(e, n, r, s);
  }
  mount(e) {
    this.isSVGTag = nx(e.tagName), super.mount(e);
  }
}
const DP = cp.length;
function ix(t) {
  if (!t)
    return;
  if (!t.isControllingVariants) {
    const n = t.parent ? ix(t.parent) || {} : {};
    return t.props.initial !== void 0 && (n.initial = t.props.initial), n;
  }
  const e = {};
  for (let n = 0; n < DP; n++) {
    const r = cp[n], s = t.props[r];
    (Fo(s) || s === !1) && (e[r] = s);
  }
  return e;
}
function sx(t, e) {
  if (!Array.isArray(e))
    return !1;
  const n = e.length;
  if (n !== t.length)
    return !1;
  for (let r = 0; r < n; r++)
    if (e[r] !== t[r])
      return !1;
  return !0;
}
const jP = [...up].reverse(), FP = up.length;
function OP(t) {
  return (e) => Promise.all(e.map(({ animation: n, options: r }) => DC(t, n, r)));
}
function LP(t) {
  let e = OP(t), n = Qv(), r = !0, s = !1;
  const a = (m) => (g, d) => {
    var v;
    const p = si(t, d, m === "exit" ? (v = t.presenceContext) == null ? void 0 : v.custom : void 0);
    if (p) {
      const { transition: w, transitionEnd: x, ...T } = p;
      g = { ...g, ...T, ...x };
    }
    return g;
  };
  function l(m) {
    e = m(t);
  }
  function c(m) {
    const { props: g } = t, d = ix(t.parent) || {}, p = [], v = /* @__PURE__ */ new Set();
    let w = {}, x = 1 / 0;
    for (let A = 0; A < FP; A++) {
      const b = jP[A], C = n[b], M = g[b] !== void 0 ? g[b] : d[b], P = Fo(M), z = b === m ? C.isActive : null;
      z === !1 && (x = A);
      let O = M === d[b] && M !== g[b] && P;
      if (O && (r || s) && t.manuallyAnimateOnMount && (O = !1), C.protectedKeys = { ...w }, // If it isn't active and hasn't *just* been set as inactive
      !C.isActive && z === null || // If we didn't and don't have any defined prop for this animation type
      !M && !C.prevProp || // Or if the prop doesn't define an animation
      Nu(M) || typeof M == "boolean")
        continue;
      if (b === "exit" && C.isActive && z !== !0) {
        C.prevResolvedValues && (w = {
          ...w,
          ...C.prevResolvedValues
        });
        continue;
      }
      const F = zP(C.prevProp, M);
      let L = F || // If we're making this variant active, we want to always make it active
      b === m && C.isActive && !O && P || // If we removed a higher-priority variant (i is in reverse order)
      A > x && P, U = !1;
      const G = Array.isArray(M) ? M : [M];
      let te = G.reduce(a(b), {});
      z === !1 && (te = {});
      const { prevResolvedValues: ae = {} } = C, le = {
        ...ae,
        ...te
      }, me = (W) => {
        L = !0, v.has(W) && (U = !0, v.delete(W)), C.needsAnimating[W] = !0;
        const J = t.getValue(W);
        J && (J.liveStyle = !1);
      };
      for (const W in le) {
        const J = te[W], X = ae[W];
        if (w.hasOwnProperty(W))
          continue;
        let j = !1;
        Uf(J) && Uf(X) ? j = !sx(J, X) || F : j = J !== X, j ? J != null ? me(W) : v.add(W) : J !== void 0 && v.has(W) ? me(W) : C.protectedKeys[W] = !0;
      }
      C.prevProp = M, C.prevResolvedValues = te, C.isActive && (w = { ...w, ...te }), (r || s) && t.blockInitialAnimation && (L = !1);
      const ee = O && F;
      L && (!ee || U) && p.push(...G.map((W) => {
        const J = { type: b };
        if (typeof W == "string" && (r || s) && !ee && t.manuallyAnimateOnMount && t.parent) {
          const { parent: X } = t, j = si(X, W);
          if (X.enteringChildren && j) {
            const { delayChildren: I } = j.transition || {};
            J.delay = PS(X.enteringChildren, t, I);
          }
        }
        return {
          animation: W,
          options: J
        };
      }));
    }
    if (v.size) {
      const A = {};
      if (typeof g.initial != "boolean") {
        const b = si(t, Array.isArray(g.initial) ? g.initial[0] : g.initial);
        b && b.transition && (A.transition = b.transition);
      }
      v.forEach((b) => {
        const C = t.getBaseTarget(b), M = t.getValue(b);
        M && (M.liveStyle = !0), A[b] = C ?? null;
      }), p.push({ animation: A });
    }
    let T = !!p.length;
    return r && (g.initial === !1 || g.initial === g.animate) && !t.manuallyAnimateOnMount && (T = !1), r = !1, s = !1, T ? e(p) : Promise.resolve();
  }
  function f(m, g) {
    var p;
    if (n[m].isActive === g)
      return Promise.resolve();
    (p = t.variantChildren) == null || p.forEach((v) => {
      var w;
      return (w = v.animationState) == null ? void 0 : w.setActive(m, g);
    }), n[m].isActive = g;
    const d = c(m);
    for (const v in n)
      n[v].protectedKeys = {};
    return d;
  }
  return {
    animateChanges: c,
    setActive: f,
    setAnimateFunction: l,
    getState: () => n,
    reset: () => {
      n = Qv(), s = !0;
    }
  };
}
function zP(t, e) {
  return typeof e == "string" ? e !== t : Array.isArray(e) ? !sx(e, t) : !1;
}
function Kr(t = !1) {
  return {
    isActive: t,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Qv() {
  return {
    animate: Kr(!0),
    whileInView: Kr(),
    whileHover: Kr(),
    whileTap: Kr(),
    whileDrag: Kr(),
    whileFocus: Kr(),
    exit: Kr()
  };
}
function Jf(t, e) {
  t.min = e.min, t.max = e.max;
}
function vn(t, e) {
  Jf(t.x, e.x), Jf(t.y, e.y);
}
function Xv(t, e) {
  t.translate = e.translate, t.scale = e.scale, t.originPoint = e.originPoint, t.origin = e.origin;
}
const ox = 1e-4, $P = 1 - ox, VP = 1 + ox, ax = 0.01, BP = 0 - ax, UP = 0 + ax;
function kt(t) {
  return t.max - t.min;
}
function HP(t, e, n) {
  return Math.abs(t - e) <= n;
}
function Jv(t, e, n, r = 0.5) {
  t.origin = r, t.originPoint = Pe(e.min, e.max, t.origin), t.scale = kt(n) / kt(e), t.translate = Pe(n.min, n.max, t.origin) - t.originPoint, (t.scale >= $P && t.scale <= VP || isNaN(t.scale)) && (t.scale = 1), (t.translate >= BP && t.translate <= UP || isNaN(t.translate)) && (t.translate = 0);
}
function Ao(t, e, n, r) {
  Jv(t.x, e.x, n.x, r ? r.originX : void 0), Jv(t.y, e.y, n.y, r ? r.originY : void 0);
}
function e0(t, e, n, r = 0) {
  const s = r ? Pe(n.min, n.max, r) : n.min;
  t.min = s + e.min, t.max = t.min + kt(e);
}
function WP(t, e, n, r) {
  e0(t.x, e.x, n.x, r == null ? void 0 : r.x), e0(t.y, e.y, n.y, r == null ? void 0 : r.y);
}
function t0(t, e, n, r = 0) {
  const s = r ? Pe(n.min, n.max, r) : n.min;
  t.min = e.min - s, t.max = t.min + kt(e);
}
function du(t, e, n, r) {
  t0(t.x, e.x, n.x, r == null ? void 0 : r.x), t0(t.y, e.y, n.y, r == null ? void 0 : r.y);
}
function n0(t, e, n, r, s) {
  return t -= e, t = cu(t, 1 / n, r), s !== void 0 && (t = cu(t, 1 / s, r)), t;
}
function ZP(t, e = 0, n = 1, r = 0.5, s, a = t, l = t) {
  if (Dn.test(e) && (e = parseFloat(e), e = Pe(l.min, l.max, e / 100) - l.min), typeof e != "number")
    return;
  let c = Pe(a.min, a.max, r);
  t === a && (c -= e), t.min = n0(t.min, e, n, c, s), t.max = n0(t.max, e, n, c, s);
}
function r0(t, e, [n, r, s], a, l) {
  ZP(t, e[n], e[r], e[s], e.scale, a, l);
}
const GP = ["x", "scaleX", "originX"], KP = ["y", "scaleY", "originY"];
function i0(t, e, n, r) {
  r0(t.x, e, GP, n ? n.x : void 0, r ? r.x : void 0), r0(t.y, e, KP, n ? n.y : void 0, r ? r.y : void 0);
}
function s0(t) {
  return t.translate === 0 && t.scale === 1;
}
function lx(t) {
  return s0(t.x) && s0(t.y);
}
function o0(t, e) {
  return t.min === e.min && t.max === e.max;
}
function YP(t, e) {
  return o0(t.x, e.x) && o0(t.y, e.y);
}
function a0(t, e) {
  return Math.round(t.min) === Math.round(e.min) && Math.round(t.max) === Math.round(e.max);
}
function ux(t, e) {
  return a0(t.x, e.x) && a0(t.y, e.y);
}
function l0(t) {
  return kt(t.x) / kt(t.y);
}
function u0(t, e) {
  return t.translate === e.translate && t.scale === e.scale && t.originPoint === e.originPoint;
}
function Pn(t) {
  return [t("x"), t("y")];
}
function qP(t, e, n) {
  let r = "";
  const s = t.x.translate / e.x, a = t.y.translate / e.y, l = (n == null ? void 0 : n.z) || 0;
  if ((s || a || l) && (r = `translate3d(${s}px, ${a}px, ${l}px) `), (e.x !== 1 || e.y !== 1) && (r += `scale(${1 / e.x}, ${1 / e.y}) `), n) {
    const { transformPerspective: m, rotate: g, pathRotation: d, rotateX: p, rotateY: v, skewX: w, skewY: x } = n;
    m && (r = `perspective(${m}px) ${r}`), g && (r += `rotate(${g}deg) `), d && (r += `rotate(${d}deg) `), p && (r += `rotateX(${p}deg) `), v && (r += `rotateY(${v}deg) `), w && (r += `skewX(${w}deg) `), x && (r += `skewY(${x}deg) `);
  }
  const c = t.x.scale * e.x, f = t.y.scale * e.y;
  return (c !== 1 || f !== 1) && (r += `scale(${c}, ${f})`), r || "none";
}
const QP = sp.length, c0 = (t) => typeof t == "string" ? parseFloat(t) : t, d0 = (t) => typeof t == "number" || oe.test(t);
function XP(t, e, n, r, s, a) {
  s ? (t.opacity = Pe(0, n.opacity ?? 1, JP(r)), t.opacityExit = Pe(e.opacity ?? 1, 0, eE(r))) : a && (t.opacity = Pe(e.opacity ?? 1, n.opacity ?? 1, r));
  for (let l = 0; l < QP; l++) {
    const c = sp[l];
    let f = f0(e, c), m = f0(n, c);
    if (f === void 0 && m === void 0)
      continue;
    f || (f = 0), m || (m = 0), f === 0 || m === 0 || d0(f) === d0(m) ? (t[c] = Math.max(Pe(c0(f), c0(m), r), 0), (Dn.test(m) || Dn.test(f)) && (t[c] += "%")) : t[c] = m;
  }
  (e.rotate || n.rotate) && (t.rotate = Pe(e.rotate || 0, n.rotate || 0, r));
}
function f0(t, e) {
  return t[e] !== void 0 ? t[e] : t.borderRadius;
}
const JP = /* @__PURE__ */ cx(0, 0.5, nS), eE = /* @__PURE__ */ cx(0.5, 0.95, un);
function cx(t, e, n) {
  return (r) => r < t ? 0 : r > e ? 1 : n(/* @__PURE__ */ Do(t, e, r));
}
function tE(t, e, n) {
  const r = ft(t) ? t : ls(t);
  return r.start(np("", r, e, n)), r.animation;
}
function Oo(t, e, n, r = { passive: !0 }) {
  return t.addEventListener(e, n, r), () => t.removeEventListener(e, n, r);
}
const nE = (t, e) => t.depth - e.depth;
class rE {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(e) {
    Hh(this.children, e), this.isDirty = !0;
  }
  remove(e) {
    ru(this.children, e), this.isDirty = !0;
  }
  forEach(e) {
    this.isDirty && this.children.sort(nE), this.isDirty = !1, this.children.forEach(e);
  }
}
function iE(t, e) {
  const n = At.now(), r = ({ timestamp: s }) => {
    const a = s - n;
    a >= e && (Er(r), t(a - e));
  };
  return Ee.setup(r, !0), () => Er(r);
}
function Vl(t) {
  return ft(t) ? t.get() : t;
}
class sE {
  constructor() {
    this.members = [];
  }
  add(e) {
    Hh(this.members, e);
    for (let n = this.members.length - 1; n >= 0; n--) {
      const r = this.members[n];
      if (r === e || r === this.lead || r === this.prevLead)
        continue;
      const s = r.instance;
      (!s || s.isConnected === !1) && !r.snapshot && (ru(this.members, r), r.unmount());
    }
    e.scheduleRender();
  }
  remove(e) {
    if (ru(this.members, e), e === this.prevLead && (this.prevLead = void 0), e === this.lead) {
      const n = this.members[this.members.length - 1];
      n && this.promote(n);
    }
  }
  relegate(e) {
    var n;
    for (let r = this.members.indexOf(e) - 1; r >= 0; r--) {
      const s = this.members[r];
      if (s.isPresent !== !1 && ((n = s.instance) == null ? void 0 : n.isConnected) !== !1)
        return this.promote(s), !0;
    }
    return !1;
  }
  promote(e, n) {
    var s;
    const r = this.lead;
    if (e !== r && (this.prevLead = r, this.lead = e, e.show(), r)) {
      r.updateSnapshot(), e.scheduleRender();
      const { layoutDependency: a } = r.options, { layoutDependency: l } = e.options;
      (a === void 0 || a !== l) && (e.resumeFrom = r, n && (r.preserveOpacity = !0), r.snapshot && (e.snapshot = r.snapshot, e.snapshot.latestValues = r.animationValues || r.latestValues), (s = e.root) != null && s.isUpdating && (e.isLayoutDirty = !0)), e.options.crossfade === !1 && r.hide();
    }
  }
  exitAnimationComplete() {
    this.members.forEach((e) => {
      var n, r, s, a, l;
      (r = (n = e.options).onExitComplete) == null || r.call(n), (l = (s = e.resumingFrom) == null ? void 0 : (a = s.options).onExitComplete) == null || l.call(a);
    });
  }
  scheduleRender() {
    this.members.forEach((e) => e.instance && e.scheduleRender(!1));
  }
  removeLeadSnapshot() {
    var e;
    (e = this.lead) != null && e.snapshot && (this.lead.snapshot = void 0);
  }
}
const Bl = {
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
}, Jd = ["", "X", "Y", "Z"], oE = 1e3;
let aE = 0;
function ef(t, e, n, r) {
  const { latestValues: s } = e;
  s[t] && (n[t] = s[t], e.setStaticValue(t, 0), r && (r[t] = 0));
}
function dx(t) {
  if (t.hasCheckedOptimisedAppear = !0, t.root === t)
    return;
  const { visualElement: e } = t.options;
  if (!e)
    return;
  const n = IS(e);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: s, layoutId: a } = t.options;
    window.MotionCancelOptimisedAnimation(n, "transform", Ee, !(s || a));
  }
  const { parent: r } = t;
  r && !r.hasCheckedOptimisedAppear && dx(r);
}
function fx({ attachResizeListener: t, defaultParent: e, measureScroll: n, checkIsScrollRoot: r, resetTransform: s }) {
  return class {
    constructor(l = {}, c = e == null ? void 0 : e()) {
      this.id = aE++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(cE), this.nodes.forEach(gE), this.nodes.forEach(yE), this.nodes.forEach(dE);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = l, this.root = c ? c.root || c : this, this.path = c ? [...c.path, c] : [], this.parent = c, this.depth = c ? c.depth + 1 : 0;
      for (let f = 0; f < this.path.length; f++)
        this.path[f].shouldResetTransform = !0;
      this.root === this && (this.nodes = new rE());
    }
    addEventListener(l, c) {
      return this.eventHandlers.has(l) || this.eventHandlers.set(l, new Wh()), this.eventHandlers.get(l).add(c);
    }
    notifyListeners(l, ...c) {
      const f = this.eventHandlers.get(l);
      f && f.notify(...c);
    }
    hasListeners(l) {
      return this.eventHandlers.has(l);
    }
    /**
     * Lifecycles
     */
    mount(l) {
      if (this.instance)
        return;
      this.isSVG = lp(l) && !uP(l), this.instance = l;
      const { layoutId: c, layout: f, visualElement: m } = this.options;
      if (m && !m.current && m.mount(l), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (f || c) && (this.isLayoutDirty = !0), t) {
        let g, d = 0;
        const p = () => this.root.updateBlockedByResize = !1;
        Ee.read(() => {
          d = window.innerWidth;
        }), t(l, () => {
          const v = window.innerWidth;
          v !== d && (d = v, this.root.updateBlockedByResize = !0, g && g(), g = iE(p, 250), Bl.hasAnimatedSinceResize && (Bl.hasAnimatedSinceResize = !1, this.nodes.forEach(m0)));
        });
      }
      c && this.root.registerSharedNode(c, this), this.options.animate !== !1 && m && (c || f) && this.addEventListener("didUpdate", ({ delta: g, hasLayoutChanged: d, hasRelativeLayoutChanged: p, layout: v }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const w = this.options.transition || m.getDefaultTransition() || wE, { onLayoutAnimationStart: x, onLayoutAnimationComplete: T } = m.getProps(), A = !this.targetLayout || !ux(this.targetLayout, v), b = !d && p;
        if (this.options.layoutRoot || this.resumeFrom || b || d && (A || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const C = {
            ...tp(w, "layout"),
            onPlay: x,
            onComplete: T
          };
          (m.shouldReduceMotion || this.options.layoutRoot) && (C.delay = 0, C.type = !1), this.startAnimation(C), this.setAnimationOrigin(g, b, C.path);
        } else
          d || m0(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = v;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const l = this.getStack();
      l && l.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), Er(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(vE), this.animationId++);
    }
    getTransformTemplate() {
      const { visualElement: l } = this.options;
      return l && l.getProps().transformTemplate;
    }
    willUpdate(l = !0) {
      if (this.root.hasTreeAnimated = !0, this.root.isUpdateBlocked()) {
        this.options.onExitComplete && this.options.onExitComplete();
        return;
      }
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && dx(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let g = 0; g < this.path.length; g++) {
        const d = this.path[g];
        d.shouldResetTransform = !0, (typeof d.latestValues.x == "string" || typeof d.latestValues.y == "string") && (d.isLayoutDirty = !0), d.updateScroll("snapshot"), d.options.layoutRoot && d.willUpdate(!1);
      }
      const { layoutId: c, layout: f } = this.options;
      if (c === void 0 && !f)
        return;
      const m = this.getTransformTemplate();
      this.prevTransformTemplateValue = m ? m(this.latestValues, "") : void 0, this.updateSnapshot(), l && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const f = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), f && this.nodes.forEach(hE), this.nodes.forEach(h0);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(p0);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(pE), this.nodes.forEach(mE), this.nodes.forEach(lE), this.nodes.forEach(uE)) : this.nodes.forEach(p0), this.clearAllSnapshots();
      const c = At.now();
      dt.delta = jn(0, 1e3 / 60, c - dt.timestamp), dt.timestamp = c, dt.isProcessing = !0, Wd.update.process(dt), Wd.preRender.process(dt), Wd.render.process(dt), dt.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, op.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(fE), this.sharedNodes.forEach(_E);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, Ee.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      Ee.postRender(() => {
        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !kt(this.snapshot.measuredBox.x) && !kt(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let f = 0; f < this.path.length; f++)
          this.path[f].updateScroll();
      const l = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = nt()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: c } = this.options;
      c && c.notify("LayoutMeasure", this.layout.layoutBox, l ? l.layoutBox : void 0);
    }
    updateScroll(l = "measure") {
      let c = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === l && (c = !1), c && this.instance) {
        const f = r(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: l,
          isRoot: f,
          offset: n(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : f
        };
      }
    }
    resetTransform() {
      if (!s)
        return;
      const l = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, c = this.projectionDelta && !lx(this.projectionDelta), f = this.getTransformTemplate(), m = f ? f(this.latestValues, "") : void 0, g = m !== this.prevTransformTemplateValue;
      l && this.instance && (c || Qr(this.latestValues) || g) && (s(this.instance, m), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(l = !0) {
      const c = this.measurePageBox();
      let f = this.removeElementScroll(c);
      return l && (f = this.removeTransform(f)), TE(f), {
        animationId: this.root.animationId,
        measuredBox: c,
        layoutBox: f,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      var m;
      const { visualElement: l } = this.options;
      if (!l)
        return nt();
      const c = l.measureViewportBox();
      if (!(((m = this.scroll) == null ? void 0 : m.wasRoot) || this.path.some(AE))) {
        const { scroll: g } = this.root;
        g && (Mn(c.x, g.offset.x), Mn(c.y, g.offset.y));
      }
      return c;
    }
    removeElementScroll(l) {
      var f;
      const c = nt();
      if (vn(c, l), (f = this.scroll) != null && f.wasRoot)
        return c;
      for (let m = 0; m < this.path.length; m++) {
        const g = this.path[m], { scroll: d, options: p } = g;
        g !== this.root && d && p.layoutScroll && (d.wasRoot && vn(c, l), Mn(c.x, d.offset.x), Mn(c.y, d.offset.y));
      }
      return c;
    }
    applyTransform(l, c = !1, f) {
      var g, d;
      const m = f || nt();
      vn(m, l);
      for (let p = 0; p < this.path.length; p++) {
        const v = this.path[p];
        !c && v.options.layoutScroll && v.scroll && v !== v.root && (Mn(m.x, -v.scroll.offset.x), Mn(m.y, -v.scroll.offset.y)), Qr(v.latestValues) && $l(m, v.latestValues, (g = v.layout) == null ? void 0 : g.layoutBox);
      }
      return Qr(this.latestValues) && $l(m, this.latestValues, (d = this.layout) == null ? void 0 : d.layoutBox), m;
    }
    removeTransform(l) {
      var f;
      const c = nt();
      vn(c, l);
      for (let m = 0; m < this.path.length; m++) {
        const g = this.path[m];
        if (!Qr(g.latestValues))
          continue;
        let d;
        g.instance && (qf(g.latestValues) && g.updateSnapshot(), d = nt(), vn(d, g.measurePageBox())), i0(c, g.latestValues, (f = g.snapshot) == null ? void 0 : f.layoutBox, d);
      }
      return Qr(this.latestValues) && i0(c, this.latestValues), c;
    }
    setTargetDelta(l) {
      this.targetDelta = l, this.root.scheduleUpdateProjection(), this.isProjectionDirty = !0;
    }
    setOptions(l) {
      this.options = {
        ...this.options,
        ...l,
        crossfade: l.crossfade !== void 0 ? l.crossfade : !0
      };
    }
    clearMeasurements() {
      this.scroll = void 0, this.layout = void 0, this.snapshot = void 0, this.prevTransformTemplateValue = void 0, this.targetDelta = void 0, this.target = void 0, this.isLayoutDirty = !1;
    }
    forceRelativeParentToResolveTarget() {
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== dt.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(l = !1) {
      var v;
      const c = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = c.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = c.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = c.isSharedProjectionDirty);
      const f = !!this.resumingFrom || this !== c;
      if (!(l || f && this.isSharedProjectionDirty || this.isProjectionDirty || (v = this.parent) != null && v.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: g, layoutId: d } = this.options;
      if (!this.layout || !(g || d))
        return;
      this.resolvedRelativeTargetAt = dt.timestamp;
      const p = this.getClosestProjectingParent();
      p && this.linkedParentVersion !== p.layoutVersion && !p.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && p && p.layout ? this.createRelativeTarget(p, this.layout.layoutBox, p.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = nt(), this.targetWithTransforms = nt()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), WP(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : vn(this.target, this.layout.layoutBox), qS(this.target, this.targetDelta)) : vn(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && p && !!p.resumingFrom == !!this.resumingFrom && !p.options.layoutScroll && p.target && this.animationProgress !== 1 ? this.createRelativeTarget(p, this.target, p.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || qf(this.parent.latestValues) || YS(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(l, c, f) {
      this.relativeParent = l, this.linkedParentVersion = l.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = nt(), this.relativeTargetOrigin = nt(), du(this.relativeTargetOrigin, c, f, this.options.layoutAnchor || void 0), vn(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      var w;
      const l = this.getLead(), c = !!this.resumingFrom || this !== l;
      let f = !0;
      if ((this.isProjectionDirty || (w = this.parent) != null && w.isProjectionDirty) && (f = !1), c && (this.isSharedProjectionDirty || this.isTransformDirty) && (f = !1), this.resolvedRelativeTargetAt === dt.timestamp && (f = !1), f)
        return;
      const { layout: m, layoutId: g } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(m || g))
        return;
      vn(this.layoutCorrected, this.layout.layoutBox);
      const d = this.treeScale.x, p = this.treeScale.y;
      SP(this.layoutCorrected, this.treeScale, this.path, c), l.layout && !l.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (l.target = l.layout.layoutBox, l.targetWithTransforms = nt());
      const { target: v } = l;
      if (!v) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Xv(this.prevProjectionDelta.x, this.projectionDelta.x), Xv(this.prevProjectionDelta.y, this.projectionDelta.y)), Ao(this.projectionDelta, this.layoutCorrected, v, this.latestValues), (this.treeScale.x !== d || this.treeScale.y !== p || !u0(this.projectionDelta.x, this.prevProjectionDelta.x) || !u0(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", v));
    }
    hide() {
      this.isVisible = !1;
    }
    show() {
      this.isVisible = !0;
    }
    scheduleRender(l = !0) {
      var c;
      if ((c = this.options.visualElement) == null || c.scheduleRender(), l) {
        const f = this.getStack();
        f && f.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = qi(), this.projectionDelta = qi(), this.projectionDeltaWithTransform = qi();
    }
    setAnimationOrigin(l, c = !1, f) {
      const m = this.snapshot, g = m ? m.latestValues : {}, d = { ...this.latestValues }, p = qi();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !c;
      const v = nt(), w = m ? m.source : void 0, x = this.layout ? this.layout.source : void 0, T = w !== x, A = this.getStack(), b = !A || A.members.length <= 1, C = !!(T && !b && this.options.crossfade === !0 && !this.path.some(xE));
      this.animationProgress = 0;
      let M;
      const P = f == null ? void 0 : f.interpolateProjection(l);
      this.mixTargetDelta = (z) => {
        const O = z / 1e3, F = P == null ? void 0 : P(O);
        F ? (p.x.translate = F.x, p.x.scale = Pe(l.x.scale, 1, O), p.x.origin = l.x.origin, p.x.originPoint = l.x.originPoint, p.y.translate = F.y, p.y.scale = Pe(l.y.scale, 1, O), p.y.origin = l.y.origin, p.y.originPoint = l.y.originPoint) : (g0(p.x, l.x, O), g0(p.y, l.y, O)), this.setTargetDelta(p), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (du(v, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), SE(this.relativeTarget, this.relativeTargetOrigin, v, O), M && YP(this.relativeTarget, M) && (this.isProjectionDirty = !1), M || (M = nt()), vn(M, this.relativeTarget)), T && (this.animationValues = d, XP(d, g, this.latestValues, O, C, b)), F && F.rotate !== void 0 && (this.animationValues || (this.animationValues = d), this.animationValues.pathRotation = F.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = O;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(l) {
      var c, f, m;
      this.notifyListeners("animationStart"), (c = this.currentAnimation) == null || c.stop(), (m = (f = this.resumingFrom) == null ? void 0 : f.currentAnimation) == null || m.stop(), this.pendingAnimation && (Er(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Ee.update(() => {
        Bl.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = ls(0)), this.motionValue.jump(0, !1), this.currentAnimation = tE(this.motionValue, [0, 1e3], {
          ...l,
          velocity: 0,
          isSync: !0,
          onUpdate: (g) => {
            this.mixTargetDelta(g), l.onUpdate && l.onUpdate(g);
          },
          onComplete: () => {
            l.onComplete && l.onComplete(), this.completeAnimation();
          }
        }), this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation), this.pendingAnimation = void 0;
      });
    }
    completeAnimation() {
      this.resumingFrom && (this.resumingFrom.currentAnimation = void 0, this.resumingFrom.preserveOpacity = void 0);
      const l = this.getStack();
      l && l.exitAnimationComplete(), this.resumingFrom = this.currentAnimation = this.animationValues = void 0, this.notifyListeners("animationComplete");
    }
    finishAnimation() {
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(oE), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const l = this.getLead();
      let { targetWithTransforms: c, target: f, layout: m, latestValues: g } = l;
      if (!(!c || !f || !m)) {
        if (this !== l && this.layout && m && hx(this.options.animationType, this.layout.layoutBox, m.layoutBox)) {
          f = this.target || nt();
          const d = kt(this.layout.layoutBox.x);
          f.x.min = l.target.x.min, f.x.max = f.x.min + d;
          const p = kt(this.layout.layoutBox.y);
          f.y.min = l.target.y.min, f.y.max = f.y.min + p;
        }
        vn(c, f), $l(c, g), Ao(this.projectionDeltaWithTransform, this.layoutCorrected, c, g);
      }
    }
    registerSharedNode(l, c) {
      this.sharedNodes.has(l) || this.sharedNodes.set(l, new sE()), this.sharedNodes.get(l).add(c);
      const m = c.options.initialPromotionConfig;
      c.promote({
        transition: m ? m.transition : void 0,
        preserveFollowOpacity: m && m.shouldPreserveFollowOpacity ? m.shouldPreserveFollowOpacity(c) : void 0
      });
    }
    isLead() {
      const l = this.getStack();
      return l ? l.lead === this : !0;
    }
    getLead() {
      var c;
      const { layoutId: l } = this.options;
      return l ? ((c = this.getStack()) == null ? void 0 : c.lead) || this : this;
    }
    getPrevLead() {
      var c;
      const { layoutId: l } = this.options;
      return l ? (c = this.getStack()) == null ? void 0 : c.prevLead : void 0;
    }
    getStack() {
      const { layoutId: l } = this.options;
      if (l)
        return this.root.sharedNodes.get(l);
    }
    promote({ needsReset: l, transition: c, preserveFollowOpacity: f } = {}) {
      const m = this.getStack();
      m && m.promote(this, f), l && (this.projectionDelta = void 0, this.needsReset = !0), c && this.setOptions({ transition: c });
    }
    relegate() {
      const l = this.getStack();
      return l ? l.relegate(this) : !1;
    }
    resetSkewAndRotation() {
      const { visualElement: l } = this.options;
      if (!l)
        return;
      let c = !1;
      const { latestValues: f } = l;
      if ((f.z || f.rotate || f.rotateX || f.rotateY || f.rotateZ || f.skewX || f.skewY) && (c = !0), !c)
        return;
      const m = {};
      f.z && ef("z", l, m, this.animationValues);
      for (let g = 0; g < Jd.length; g++)
        ef(`rotate${Jd[g]}`, l, m, this.animationValues), ef(`skew${Jd[g]}`, l, m, this.animationValues);
      l.render();
      for (const g in m)
        l.setStaticValue(g, m[g]), this.animationValues && (this.animationValues[g] = m[g]);
      l.scheduleRender();
    }
    applyProjectionStyles(l, c) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        l.visibility = "hidden";
        return;
      }
      const f = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = !1, l.visibility = "", l.opacity = "", l.pointerEvents = Vl(c == null ? void 0 : c.pointerEvents) || "", l.transform = f ? f(this.latestValues, "") : "none";
        return;
      }
      const m = this.getLead();
      if (!this.projectionDelta || !this.layout || !m.target) {
        this.options.layoutId && (l.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, l.pointerEvents = Vl(c == null ? void 0 : c.pointerEvents) || ""), this.hasProjected && !Qr(this.latestValues) && (l.transform = f ? f({}, "") : "none", this.hasProjected = !1);
        return;
      }
      l.visibility = "";
      const g = m.animationValues || m.latestValues;
      this.applyTransformsToTarget();
      let d = qP(this.projectionDeltaWithTransform, this.treeScale, g);
      f && (d = f(g, d)), l.transform = d;
      const { x: p, y: v } = this.projectionDelta;
      l.transformOrigin = `${p.origin * 100}% ${v.origin * 100}% 0`, m.animationValues ? l.opacity = m === this ? g.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : g.opacityExit : l.opacity = m === this ? g.opacity !== void 0 ? g.opacity : "" : g.opacityExit !== void 0 ? g.opacityExit : 0;
      for (const w in Xf) {
        if (g[w] === void 0)
          continue;
        const { correct: x, applyTo: T, isCSSVariable: A } = Xf[w], b = d === "none" ? g[w] : x(g[w], m);
        if (T) {
          const C = T.length;
          for (let M = 0; M < C; M++)
            l[T[M]] = b;
        } else
          A ? this.options.visualElement.renderState.vars[w] = b : l[w] = b;
      }
      this.options.layoutId && (l.pointerEvents = m === this ? Vl(c == null ? void 0 : c.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((l) => {
        var c;
        return (c = l.currentAnimation) == null ? void 0 : c.stop();
      }), this.root.nodes.forEach(h0), this.root.sharedNodes.clear();
    }
  };
}
function lE(t) {
  t.updateLayout();
}
function uE(t) {
  var n;
  const e = ((n = t.resumeFrom) == null ? void 0 : n.snapshot) || t.snapshot;
  if (t.isLead() && t.layout && e && t.hasListeners("didUpdate")) {
    const { layoutBox: r, measuredBox: s } = t.layout, { animationType: a } = t.options, l = e.source !== t.layout.source;
    if (a === "size")
      Pn((d) => {
        const p = l ? e.measuredBox[d] : e.layoutBox[d], v = kt(p);
        p.min = r[d].min, p.max = p.min + v;
      });
    else if (a === "x" || a === "y") {
      const d = a === "x" ? "y" : "x";
      Jf(l ? e.measuredBox[d] : e.layoutBox[d], r[d]);
    } else hx(a, e.layoutBox, r) && Pn((d) => {
      const p = l ? e.measuredBox[d] : e.layoutBox[d], v = kt(r[d]);
      p.max = p.min + v, t.relativeTarget && !t.currentAnimation && (t.isProjectionDirty = !0, t.relativeTarget[d].max = t.relativeTarget[d].min + v);
    });
    const c = qi();
    Ao(c, r, e.layoutBox);
    const f = qi();
    l ? Ao(f, t.applyTransform(s, !0), e.measuredBox) : Ao(f, r, e.layoutBox);
    const m = !lx(c);
    let g = !1;
    if (!t.resumeFrom) {
      const d = t.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: p, layout: v } = d;
        if (p && v) {
          const w = t.options.layoutAnchor || void 0, x = nt();
          du(x, e.layoutBox, p.layoutBox, w);
          const T = nt();
          du(T, r, v.layoutBox, w), ux(x, T) || (g = !0), d.options.layoutRoot && (t.relativeTarget = T, t.relativeTargetOrigin = x, t.relativeParent = d);
        }
      }
    }
    t.notifyListeners("didUpdate", {
      layout: r,
      snapshot: e,
      delta: f,
      layoutDelta: c,
      hasLayoutChanged: m,
      hasRelativeLayoutChanged: g
    });
  } else if (t.isLead()) {
    const { onExitComplete: r } = t.options;
    r && r();
  }
  t.options.transition = void 0;
}
function cE(t) {
  t.parent && (t.isProjecting() || (t.isProjectionDirty = t.parent.isProjectionDirty), t.isSharedProjectionDirty || (t.isSharedProjectionDirty = !!(t.isProjectionDirty || t.parent.isProjectionDirty || t.parent.isSharedProjectionDirty)), t.isTransformDirty || (t.isTransformDirty = t.parent.isTransformDirty));
}
function dE(t) {
  t.isProjectionDirty = t.isSharedProjectionDirty = t.isTransformDirty = !1;
}
function fE(t) {
  t.clearSnapshot();
}
function h0(t) {
  t.clearMeasurements();
}
function hE(t) {
  t.isLayoutDirty = !0, t.updateLayout();
}
function p0(t) {
  t.isLayoutDirty = !1;
}
function pE(t) {
  t.isAnimationBlocked && t.layout && !t.isLayoutDirty && (t.snapshot = t.layout, t.isLayoutDirty = !0);
}
function mE(t) {
  const { visualElement: e } = t.options;
  e && e.getProps().onBeforeLayoutMeasure && e.notify("BeforeLayoutMeasure"), t.resetTransform();
}
function m0(t) {
  t.finishAnimation(), t.targetDelta = t.relativeTarget = t.target = void 0, t.isProjectionDirty = !0;
}
function gE(t) {
  t.resolveTargetDelta();
}
function yE(t) {
  t.calcProjection();
}
function vE(t) {
  t.resetSkewAndRotation();
}
function _E(t) {
  t.removeLeadSnapshot();
}
function g0(t, e, n) {
  t.translate = Pe(e.translate, 0, n), t.scale = Pe(e.scale, 1, n), t.origin = e.origin, t.originPoint = e.originPoint;
}
function y0(t, e, n, r) {
  t.min = Pe(e.min, n.min, r), t.max = Pe(e.max, n.max, r);
}
function SE(t, e, n, r) {
  y0(t.x, e.x, n.x, r), y0(t.y, e.y, n.y, r);
}
function xE(t) {
  return t.animationValues && t.animationValues.opacityExit !== void 0;
}
const wE = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, v0 = (t) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(t), _0 = v0("applewebkit/") && !v0("chrome/") ? Math.round : un;
function S0(t) {
  t.min = _0(t.min), t.max = _0(t.max);
}
function TE(t) {
  S0(t.x), S0(t.y);
}
function hx(t, e, n) {
  return t === "position" || t === "preserve-aspect" && !HP(l0(e), l0(n), 0.2);
}
function AE(t) {
  var e;
  return t !== t.root && ((e = t.scroll) == null ? void 0 : e.wasRoot);
}
const kE = fx({
  attachResizeListener: (t, e) => Oo(t, "resize", e),
  measureScroll: () => {
    var t, e;
    return {
      x: document.documentElement.scrollLeft || ((t = document.body) == null ? void 0 : t.scrollLeft) || 0,
      y: document.documentElement.scrollTop || ((e = document.body) == null ? void 0 : e.scrollTop) || 0
    };
  },
  checkIsScrollRoot: () => !0
}), tf = {
  current: void 0
}, px = fx({
  measureScroll: (t) => ({
    x: t.scrollLeft,
    y: t.scrollTop
  }),
  defaultParent: () => {
    if (!tf.current) {
      const t = new kE({});
      t.mount(window), t.setOptions({ layoutScroll: !0 }), tf.current = t;
    }
    return tf.current;
  },
  resetTransform: (t, e) => {
    t.style.transform = e !== void 0 ? e : "none";
  },
  checkIsScrollRoot: (t) => window.getComputedStyle(t).position === "fixed"
}), hp = E.createContext({
  transformPagePoint: (t) => t,
  isStatic: !1,
  reducedMotion: "never"
});
function x0(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function bE(...t) {
  return (e) => {
    let n = !1;
    const r = t.map((s) => {
      const a = x0(s, e);
      return !n && typeof a == "function" && (n = !0), a;
    });
    if (n)
      return () => {
        for (let s = 0; s < r.length; s++) {
          const a = r[s];
          typeof a == "function" ? a() : x0(t[s], null);
        }
      };
  };
}
function CE(...t) {
  return E.useCallback(bE(...t), t);
}
class PE extends E.Component {
  getSnapshotBeforeUpdate(e) {
    const n = this.props.childRef.current;
    if (Fl(n) && e.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const r = n.offsetParent, s = Fl(r) && r.offsetWidth || 0, a = Fl(r) && r.offsetHeight || 0, l = getComputedStyle(n), c = this.props.sizeRef.current;
      c.height = parseFloat(l.height), c.width = parseFloat(l.width), c.top = n.offsetTop, c.left = n.offsetLeft, c.right = s - c.width - c.left, c.bottom = a - c.height - c.top, c.direction = l.direction;
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
function EE({ children: t, isPresent: e, anchorX: n, anchorY: r, root: s, pop: a }) {
  var p;
  const l = E.useId(), c = E.useRef(null), f = E.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: m } = E.useContext(hp), g = ((p = t.props) == null ? void 0 : p.ref) ?? (t == null ? void 0 : t.ref), d = CE(c, g);
  return E.useInsertionEffect(() => {
    const { width: v, height: w, top: x, left: T, right: A, bottom: b, direction: C } = f.current;
    if (e || a === !1 || !c.current || !v || !w)
      return;
    const M = C === "rtl", P = n === "left" ? M ? `right: ${A}` : `left: ${T}` : M ? `left: ${T}` : `right: ${A}`, z = r === "bottom" ? `bottom: ${b}` : `top: ${x}`;
    c.current.dataset.motionPopId = l;
    const O = document.createElement("style");
    m && (O.nonce = m);
    const F = s ?? document.head;
    return F.appendChild(O), O.sheet && O.sheet.insertRule(`
          [data-motion-pop-id="${l}"] {
            position: absolute !important;
            width: ${v}px !important;
            height: ${w}px !important;
            ${P}px !important;
            ${z}px !important;
          }
        `), () => {
      var L;
      (L = c.current) == null || L.removeAttribute("data-motion-pop-id"), F.contains(O) && F.removeChild(O);
    };
  }, [e]), S.jsx(PE, { isPresent: e, childRef: c, sizeRef: f, pop: a, children: a === !1 ? t : E.cloneElement(t, { ref: d }) });
}
const ME = ({ children: t, initial: e, isPresent: n, onExitComplete: r, custom: s, presenceAffectsLayout: a, mode: l, anchorX: c, anchorY: f, root: m }) => {
  const g = Bh(RE), d = E.useId(), p = E.useRef(n), v = E.useRef(r);
  Uh(() => {
    p.current = n, v.current = r;
  });
  let w = !0, x = E.useMemo(() => (w = !1, {
    id: d,
    initial: e,
    isPresent: n,
    custom: s,
    onExitComplete: (T) => {
      g.set(T, !0);
      for (const A of g.values())
        if (!A)
          return;
      r && r();
    },
    register: (T) => (g.set(T, !1), () => {
      var A;
      g.delete(T), !p.current && !g.size && ((A = v.current) == null || A.call(v));
    })
  }), [n, g, r]);
  return a && w && (x = { ...x }), E.useMemo(() => {
    g.forEach((T, A) => g.set(A, !1));
  }, [n]), E.useEffect(() => {
    !n && !g.size && r && r();
  }, [n]), t = S.jsx(EE, { pop: l === "popLayout", isPresent: n, anchorX: c, anchorY: f, root: m, children: t }), S.jsx(Mu.Provider, { value: x, children: t });
};
function RE() {
  return /* @__PURE__ */ new Map();
}
function mx(t = !0) {
  const e = E.useContext(Mu);
  if (e === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: r, register: s } = e, a = E.useId();
  E.useEffect(() => {
    if (t)
      return s(a);
  }, [t]);
  const l = E.useCallback(() => t && r && r(a), [a, r, t]);
  return !n && r ? [!1, l] : [!0];
}
const Tl = (t) => t.key || "";
function w0(t) {
  const e = [];
  return E.Children.forEach(t, (n) => {
    E.isValidElement(n) && e.push(n);
  }), e;
}
const Jo = ({ children: t, custom: e, initial: n = !0, onExitComplete: r, presenceAffectsLayout: s = !0, mode: a = "sync", propagate: l = !1, anchorX: c = "left", anchorY: f = "top", root: m }) => {
  const [g, d] = mx(l), p = E.useMemo(() => w0(t), [t]), v = l && !g ? [] : p.map(Tl), w = E.useRef(!0), x = E.useRef(p), T = Bh(() => /* @__PURE__ */ new Map()), A = E.useRef(/* @__PURE__ */ new Set()), [b, C] = E.useState(p), [M, P] = E.useState(p);
  Uh(() => {
    w.current = !1, x.current = p;
    for (let F = 0; F < M.length; F++) {
      const L = Tl(M[F]);
      v.includes(L) ? (T.delete(L), A.current.delete(L)) : T.get(L) !== !0 && T.set(L, !1);
    }
  }, [M, v.length, v.join("-")]);
  const z = [];
  if (p !== b) {
    let F = [...p];
    for (let L = 0; L < M.length; L++) {
      const U = M[L], G = Tl(U);
      v.includes(G) || (F.splice(L, 0, U), z.push(U));
    }
    return a === "wait" && z.length && (F = z), P(w0(F)), C(p), null;
  }
  const { forceRender: O } = E.useContext(Vh);
  return S.jsx(S.Fragment, { children: M.map((F) => {
    const L = Tl(F), U = l && !g ? !1 : p === M || v.includes(L), G = () => {
      if (A.current.has(L))
        return;
      if (T.has(L))
        A.current.add(L), T.set(L, !0);
      else
        return;
      let te = !0;
      T.forEach((ae) => {
        ae || (te = !1);
      }), te && (O == null || O(), P(x.current), l && (d == null || d()), r && r());
    };
    return S.jsx(ME, { isPresent: U, initial: !w.current || n ? void 0 : !1, custom: e, presenceAffectsLayout: s, mode: a, root: m, onExitComplete: U ? void 0 : G, anchorX: c, anchorY: f, children: F }, L);
  }) });
}, gx = E.createContext({ strict: !1 }), T0 = {
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
let A0 = !1;
function NE() {
  if (A0)
    return;
  const t = {};
  for (const e in T0)
    t[e] = {
      isEnabled: (n) => T0[e].some((r) => !!n[r])
    };
  ZS(t), A0 = !0;
}
function yx() {
  return NE(), gP();
}
function IE(t) {
  const e = yx();
  for (const n in t)
    e[n] = {
      ...e[n],
      ...t[n]
    };
  ZS(e);
}
const DE = /* @__PURE__ */ new Set([
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
function fu(t) {
  return t.startsWith("while") || t.startsWith("drag") && t !== "draggable" || t.startsWith("layout") || t.startsWith("onTap") || t.startsWith("onPan") || t.startsWith("onLayout") || DE.has(t);
}
let vx = (t) => !fu(t);
function jE(t) {
  typeof t == "function" && (vx = (e) => e.startsWith("on") ? !fu(e) : t(e));
}
try {
  jE(require("@emotion/is-prop-valid").default);
} catch {
}
function FE(t, e, n) {
  const r = {};
  for (const s in t)
    s === "values" && typeof t.values == "object" || ft(t[s]) || (vx(s) || n === !0 && fu(s) || !e && !fu(s) || // If trying to use native HTML drag events, forward drag listeners
    t.draggable && s.startsWith("onDrag")) && (r[s] = t[s]);
  return r;
}
const Du = /* @__PURE__ */ E.createContext({});
function OE(t, e) {
  if (Iu(t)) {
    const { initial: n, animate: r } = t;
    return {
      initial: n === !1 || Fo(n) ? n : void 0,
      animate: Fo(r) ? r : void 0
    };
  }
  return t.inherit !== !1 ? e : {};
}
function LE(t) {
  const { initial: e, animate: n } = OE(t, E.useContext(Du));
  return E.useMemo(() => ({ initial: e, animate: n }), [k0(e), k0(n)]);
}
function k0(t) {
  return Array.isArray(t) ? t.join(" ") : t;
}
const pp = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function _x(t, e, n) {
  for (const r in e)
    !ft(e[r]) && !JS(r, n) && (t[r] = e[r]);
}
function zE({ transformTemplate: t }, e) {
  return E.useMemo(() => {
    const n = pp();
    return dp(n, e, t), Object.assign({}, n.vars, n.style);
  }, [e]);
}
function $E(t, e) {
  const n = t.style || {}, r = {};
  return _x(r, n, t), Object.assign(r, zE(t, e)), r;
}
function VE(t, e) {
  const n = {}, r = $E(t, e);
  return t.drag && t.dragListener !== !1 && (n.draggable = !1, r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none", r.touchAction = t.drag === !0 ? "none" : `pan-${t.drag === "x" ? "y" : "x"}`), t.tabIndex === void 0 && (t.onTap || t.onTapStart || t.whileTap) && (n.tabIndex = 0), n.style = r, n;
}
const Sx = () => ({
  ...pp(),
  attrs: {}
});
function BE(t, e, n, r) {
  const s = E.useMemo(() => {
    const a = Sx();
    return ex(a, e, nx(r), t.transformTemplate, t.style), {
      ...a.attrs,
      style: { ...a.style }
    };
  }, [e]);
  if (t.style) {
    const a = {};
    _x(a, t.style, t), s.style = { ...a, ...s.style };
  }
  return s;
}
const UE = [
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
function mp(t) {
  return (
    /**
     * If it's not a string, it's a custom React component. Currently we only support
     * HTML custom React components.
     */
    typeof t != "string" || /**
     * If it contains a dash, the element is a custom HTML webcomponent.
     */
    t.includes("-") ? !1 : (
      /**
       * If it's in our list of lowercase SVG tags, it's an SVG component
       */
      !!(UE.indexOf(t) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(t))
    )
  );
}
function HE(t, e, n, { latestValues: r }, s, a = !1, l) {
  const f = (l ?? mp(t) ? BE : VE)(e, r, s, t), m = FE(e, typeof t == "string", a), g = t !== E.Fragment ? { ...m, ...f, ref: n } : {}, { children: d } = e, p = E.useMemo(() => ft(d) ? d.get() : d, [d]);
  return E.createElement(t, {
    ...g,
    children: p
  });
}
function WE({ scrapeMotionValuesFromProps: t, createRenderState: e }, n, r, s) {
  return {
    latestValues: ZE(n, r, s, t),
    renderState: e()
  };
}
function ZE(t, e, n, r) {
  const s = {}, a = r(t, {});
  for (const p in a)
    s[p] = Vl(a[p]);
  let { initial: l, animate: c } = t;
  const f = Iu(t), m = HS(t);
  e && m && !f && t.inherit !== !1 && (l === void 0 && (l = e.initial), c === void 0 && (c = e.animate));
  let g = n ? n.initial === !1 : !1;
  g = g || l === !1;
  const d = g ? c : l;
  if (d && typeof d != "boolean" && !Nu(d)) {
    const p = Array.isArray(d) ? d : [d];
    for (let v = 0; v < p.length; v++) {
      const w = rp(t, p[v]);
      if (w) {
        const { transitionEnd: x, transition: T, ...A } = w;
        for (const b in A) {
          let C = A[b];
          if (Array.isArray(C)) {
            const M = g ? C.length - 1 : 0;
            C = C[M];
          }
          C !== null && (s[b] = C);
        }
        for (const b in x)
          s[b] = x[b];
      }
    }
  }
  return s;
}
const xx = (t) => (e, n) => {
  const r = E.useContext(Du), s = E.useContext(Mu), a = () => WE(t, e, r, s);
  return n ? a() : Bh(a);
}, GE = /* @__PURE__ */ xx({
  scrapeMotionValuesFromProps: fp,
  createRenderState: pp
}), KE = /* @__PURE__ */ xx({
  scrapeMotionValuesFromProps: rx,
  createRenderState: Sx
}), YE = Symbol.for("motionComponentSymbol");
function qE(t, e, n) {
  const r = E.useRef(n);
  E.useInsertionEffect(() => {
    r.current = n;
  });
  const s = E.useRef(null);
  return E.useCallback((a) => {
    var c;
    a && ((c = t.onMount) == null || c.call(t, a)), e && (a ? e.mount(a) : e.unmount());
    const l = r.current;
    if (typeof l == "function")
      if (a) {
        const f = l(a);
        typeof f == "function" && (s.current = f);
      } else s.current ? (s.current(), s.current = null) : l(a);
    else l && (l.current = a);
  }, [e]);
}
const wx = E.createContext({});
function Zi(t) {
  return t && typeof t == "object" && Object.prototype.hasOwnProperty.call(t, "current");
}
function QE(t, e, n, r, s, a) {
  var C, M;
  const { visualElement: l } = E.useContext(Du), c = E.useContext(gx), f = E.useContext(Mu), m = E.useContext(hp), g = m.reducedMotion, d = m.skipAnimations, p = E.useRef(null), v = E.useRef(!1);
  r = r || c.renderer, !p.current && r && (p.current = r(t, {
    visualState: e,
    parent: l,
    props: n,
    presenceContext: f,
    blockInitialAnimation: f ? f.initial === !1 : !1,
    reducedMotionConfig: g,
    skipAnimations: d,
    isSVG: a
  }), v.current && p.current && (p.current.manuallyAnimateOnMount = !0));
  const w = p.current, x = E.useContext(wx);
  w && !w.projection && s && (w.type === "html" || w.type === "svg") && XE(p.current, n, s, x);
  const T = E.useRef(!1);
  E.useInsertionEffect(() => {
    w && T.current && w.update(n, f);
  });
  const A = n[NS], b = E.useRef(!!A && typeof window < "u" && !((C = window.MotionHandoffIsComplete) != null && C.call(window, A)) && ((M = window.MotionHasOptimisedAnimation) == null ? void 0 : M.call(window, A)));
  return Uh(() => {
    v.current = !0, w && (T.current = !0, window.MotionIsMounted = !0, w.updateFeatures(), w.scheduleRenderMicrotask(), b.current && w.animationState && w.animationState.animateChanges());
  }), E.useEffect(() => {
    w && (!b.current && w.animationState && w.animationState.animateChanges(), b.current && (queueMicrotask(() => {
      var P;
      (P = window.MotionHandoffMarkAsComplete) == null || P.call(window, A);
    }), b.current = !1), w.enteringChildren = void 0);
  }), w;
}
function XE(t, e, n, r) {
  const { layoutId: s, layout: a, drag: l, dragConstraints: c, layoutScroll: f, layoutRoot: m, layoutAnchor: g, layoutCrossfade: d } = e;
  t.projection = new n(t.latestValues, e["data-framer-portal-id"] ? void 0 : Tx(t.parent)), t.projection.setOptions({
    layoutId: s,
    layout: a,
    alwaysMeasureLayout: !!l || c && Zi(c),
    visualElement: t,
    /**
     * TODO: Update options in an effect. This could be tricky as it'll be too late
     * to update by the time layout animations run.
     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
     * ensuring it gets called if there's no potential layout animations.
     *
     */
    animationType: typeof a == "string" ? a : "both",
    initialPromotionConfig: r,
    crossfade: d,
    layoutScroll: f,
    layoutRoot: m,
    layoutAnchor: g
  });
}
function Tx(t) {
  if (t)
    return t.options.allowProjection !== !1 ? t.projection : Tx(t.parent);
}
function nf(t, { forwardMotionProps: e = !1, type: n } = {}, r, s) {
  r && IE(r);
  const a = n ? n === "svg" : mp(t), l = a ? KE : GE;
  function c(m, g) {
    let d;
    const p = {
      ...E.useContext(hp),
      ...m,
      layoutId: JE(m)
    }, { isStatic: v } = p, w = LE(m), x = l(m, v);
    if (!v && typeof window < "u") {
      eM();
      const T = tM(p);
      d = T.MeasureLayout, w.visualElement = QE(t, x, p, s, T.ProjectionNode, a);
    }
    return S.jsxs(Du.Provider, { value: w, children: [d && w.visualElement ? S.jsx(d, { visualElement: w.visualElement, ...p }) : null, HE(t, m, qE(x, w.visualElement, g), x, v, e, a)] });
  }
  c.displayName = `motion.${typeof t == "string" ? t : `create(${t.displayName ?? t.name ?? ""})`}`;
  const f = E.forwardRef(c);
  return f[YE] = t, f;
}
function JE({ layoutId: t }) {
  const e = E.useContext(Vh).id;
  return e && t !== void 0 ? e + "-" + t : t;
}
function eM(t, e) {
  E.useContext(gx).strict;
}
function tM(t) {
  const e = yx(), { drag: n, layout: r } = e;
  if (!n && !r)
    return {};
  const s = { ...n, ...r };
  return {
    MeasureLayout: n != null && n.isEnabled(t) || r != null && r.isEnabled(t) ? s.MeasureLayout : void 0,
    ProjectionNode: s.ProjectionNode
  };
}
function nM(t, e) {
  if (typeof Proxy > "u")
    return nf;
  const n = /* @__PURE__ */ new Map(), r = (a, l) => nf(a, l, t, e), s = (a, l) => r(a, l);
  return new Proxy(s, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (a, l) => l === "create" ? r : (n.has(l) || n.set(l, nf(l, void 0, t, e)), n.get(l))
  });
}
const rM = (t, e) => e.isSVG ?? mp(t) ? new IP(e) : new CP(e, {
  allowProjection: t !== E.Fragment
});
class iM extends Ir {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(e) {
    super(e), e.animationState || (e.animationState = LP(e));
  }
  updateAnimationControlsSubscription() {
    const { animate: e } = this.node.getProps();
    Nu(e) && (this.unmountControls = e.subscribe(this.node));
  }
  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.updateAnimationControlsSubscription();
  }
  update() {
    const { animate: e } = this.node.getProps(), { animate: n } = this.node.prevProps || {};
    e !== n && this.updateAnimationControlsSubscription();
  }
  unmount() {
    var e;
    this.node.animationState.reset(), (e = this.unmountControls) == null || e.call(this);
  }
}
let sM = 0;
class oM extends Ir {
  constructor() {
    super(...arguments), this.id = sM++, this.isExitComplete = !1;
  }
  update() {
    var a;
    if (!this.node.presenceContext)
      return;
    const { isPresent: e, onExitComplete: n } = this.node.presenceContext, { isPresent: r } = this.node.prevPresenceContext || {};
    if (!this.node.animationState || e === r)
      return;
    if (e && r === !1) {
      if (this.isExitComplete) {
        const { initial: l, custom: c } = this.node.getProps();
        if (typeof l == "string" || typeof l == "object" && l !== null && !Array.isArray(l)) {
          const f = si(this.node, l, c);
          if (f) {
            const { transition: m, transitionEnd: g, ...d } = f;
            for (const p in d)
              (a = this.node.getValue(p)) == null || a.jump(d[p]);
          }
        }
        this.node.animationState.reset(), this.node.animationState.animateChanges();
      } else
        this.node.animationState.setActive("exit", !1);
      this.isExitComplete = !1;
      return;
    }
    const s = this.node.animationState.setActive("exit", !e);
    n && !e && s.then(() => {
      this.isExitComplete = !0, n(this.id);
    });
  }
  mount() {
    const { register: e, onExitComplete: n } = this.node.presenceContext || {};
    n && n(this.id), e && (this.unmount = e(this.id));
  }
  unmount() {
  }
}
const aM = {
  animation: {
    Feature: iM
  },
  exit: {
    Feature: oM
  }
};
function ea(t) {
  return {
    point: {
      x: t.pageX,
      y: t.pageY
    }
  };
}
const lM = (t) => (e) => ap(e) && t(e, ea(e));
function ko(t, e, n, r) {
  return Oo(t, e, lM(n), r);
}
const Ax = ({ current: t }) => t ? t.ownerDocument.defaultView : null, b0 = (t, e) => Math.abs(t - e);
function uM(t, e) {
  const n = b0(t.x, e.x), r = b0(t.y, e.y);
  return Math.sqrt(n ** 2 + r ** 2);
}
const C0 = /* @__PURE__ */ new Set(["auto", "scroll"]);
class kx {
  constructor(e, n, { transformPagePoint: r, contextWindow: s = window, dragSnapToOrigin: a = !1, distanceThreshold: l = 3, element: c } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (w) => {
      this.handleScroll(w.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = Al(this.lastRawMoveEventInfo, this.transformPagePoint));
      const w = rf(this.lastMoveEventInfo, this.history), x = this.startEvent !== null, T = uM(w.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!x && !T)
        return;
      const { point: A } = w, { timestamp: b } = dt;
      this.history.push({ ...A, timestamp: b });
      const { onStart: C, onMove: M } = this.handlers;
      x || (C && C(this.lastMoveEvent, w), this.startEvent = this.lastMoveEvent), M && M(this.lastMoveEvent, w);
    }, this.handlePointerMove = (w, x) => {
      this.lastMoveEvent = w, this.lastRawMoveEventInfo = x, this.lastMoveEventInfo = Al(x, this.transformPagePoint), Ee.update(this.updatePoint, !0);
    }, this.handlePointerUp = (w, x) => {
      this.end();
      const { onEnd: T, onSessionEnd: A, resumeAnimation: b } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && b && b(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const C = rf(w.type === "pointercancel" ? this.lastMoveEventInfo : Al(x, this.transformPagePoint), this.history);
      this.startEvent && T && T(w, C), A && A(w, C);
    }, !ap(e))
      return;
    this.dragSnapToOrigin = a, this.handlers = n, this.transformPagePoint = r, this.distanceThreshold = l, this.contextWindow = s || window;
    const f = ea(e), m = Al(f, this.transformPagePoint), { point: g } = m, { timestamp: d } = dt;
    this.history = [{ ...g, timestamp: d }];
    const { onSessionStart: p } = n;
    p && p(e, rf(m, this.history));
    const v = { passive: !0, capture: !0 };
    this.removeListeners = qo(ko(this.contextWindow, "pointermove", this.handlePointerMove, v), ko(this.contextWindow, "pointerup", this.handlePointerUp, v), ko(this.contextWindow, "pointercancel", this.handlePointerUp, v)), c && this.startScrollTracking(c);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(e) {
    let n = e.parentElement;
    for (; n; ) {
      const r = getComputedStyle(n);
      (C0.has(r.overflowX) || C0.has(r.overflowY)) && this.scrollPositions.set(n, {
        x: n.scrollLeft,
        y: n.scrollTop
      }), n = n.parentElement;
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
  handleScroll(e) {
    const n = this.scrollPositions.get(e);
    if (!n)
      return;
    const r = e === window, s = r ? { x: window.scrollX, y: window.scrollY } : {
      x: e.scrollLeft,
      y: e.scrollTop
    }, a = { x: s.x - n.x, y: s.y - n.y };
    a.x === 0 && a.y === 0 || (r ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += a.x, this.lastMoveEventInfo.point.y += a.y) : this.history.length > 0 && (this.history[0].x -= a.x, this.history[0].y -= a.y), this.scrollPositions.set(e, s), Ee.update(this.updatePoint, !0));
  }
  updateHandlers(e) {
    this.handlers = e;
  }
  end() {
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), Er(this.updatePoint);
  }
}
function Al(t, e) {
  return e ? { point: e(t.point) } : t;
}
function P0(t, e) {
  return { x: t.x - e.x, y: t.y - e.y };
}
function rf({ point: t }, e) {
  return {
    point: t,
    delta: P0(t, bx(e)),
    offset: P0(t, cM(e)),
    velocity: dM(e, 0.1)
  };
}
function cM(t) {
  return t[0];
}
function bx(t) {
  return t[t.length - 1];
}
function dM(t, e) {
  if (t.length < 2)
    return { x: 0, y: 0 };
  let n = t.length - 1, r = null;
  const s = bx(t);
  for (; n >= 0 && (r = t[n], !(s.timestamp - r.timestamp > /* @__PURE__ */ It(e))); )
    n--;
  if (!r)
    return { x: 0, y: 0 };
  r === t[0] && t.length > 2 && s.timestamp - r.timestamp > /* @__PURE__ */ It(e) * 2 && (r = t[1]);
  const a = /* @__PURE__ */ on(s.timestamp - r.timestamp);
  if (a === 0)
    return { x: 0, y: 0 };
  const l = {
    x: (s.x - r.x) / a,
    y: (s.y - r.y) / a
  };
  return l.x === 1 / 0 && (l.x = 0), l.y === 1 / 0 && (l.y = 0), l;
}
function fM(t, { min: e, max: n }, r) {
  return e !== void 0 && t < e ? t = r ? Pe(e, t, r.min) : Math.max(t, e) : n !== void 0 && t > n && (t = r ? Pe(n, t, r.max) : Math.min(t, n)), t;
}
function E0(t, e, n) {
  return {
    min: e !== void 0 ? t.min + e : void 0,
    max: n !== void 0 ? t.max + n - (t.max - t.min) : void 0
  };
}
function hM(t, { top: e, left: n, bottom: r, right: s }) {
  return {
    x: E0(t.x, n, s),
    y: E0(t.y, e, r)
  };
}
function M0(t, e) {
  let n = e.min - t.min, r = e.max - t.max;
  return e.max - e.min < t.max - t.min && ([n, r] = [r, n]), { min: n, max: r };
}
function pM(t, e) {
  return {
    x: M0(t.x, e.x),
    y: M0(t.y, e.y)
  };
}
function mM(t, e) {
  let n = 0.5;
  const r = kt(t), s = kt(e);
  return s > r ? n = /* @__PURE__ */ Do(e.min, e.max - r, t.min) : r > s && (n = /* @__PURE__ */ Do(t.min, t.max - s, e.min)), jn(0, 1, n);
}
function gM(t, e) {
  const n = {};
  return e.min !== void 0 && (n.min = e.min - t.min), e.max !== void 0 && (n.max = e.max - t.min), n;
}
const eh = 0.35;
function yM(t = eh) {
  return t === !1 ? t = 0 : t === !0 && (t = eh), {
    x: R0(t, "left", "right"),
    y: R0(t, "top", "bottom")
  };
}
function R0(t, e, n) {
  return {
    min: N0(t, e),
    max: N0(t, n)
  };
}
function N0(t, e) {
  return typeof t == "number" ? t : t[e] || 0;
}
const vM = /* @__PURE__ */ new WeakMap();
class _M {
  constructor(e) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = nt(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = e;
  }
  start(e, { snapToCursor: n = !1, distanceThreshold: r } = {}) {
    const { presenceContext: s } = this.visualElement;
    if (s && s.isPresent === !1)
      return;
    const a = (d) => {
      n && this.snapToCursor(ea(d).point), this.stopAnimation();
    }, l = (d, p) => {
      const { drag: v, dragPropagation: w, onDragStart: x } = this.getProps();
      if (v && !w && (this.openDragLock && this.openDragLock(), this.openDragLock = ZC(v), !this.openDragLock))
        return;
      this.latestPointerEvent = d, this.latestPanInfo = p, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Pn((A) => {
        let b = this.getAxisMotionValue(A).get() || 0;
        if (Dn.test(b)) {
          const { projection: C } = this.visualElement;
          if (C && C.layout) {
            const M = C.layout.layoutBox[A];
            M && (b = kt(M) * (parseFloat(b) / 100));
          }
        }
        this.originPoint[A] = b;
      }), x && Ee.update(() => x(d, p), !1, !0), Hf(this.visualElement, "transform");
      const { animationState: T } = this.visualElement;
      T && T.setActive("whileDrag", !0);
    }, c = (d, p) => {
      this.latestPointerEvent = d, this.latestPanInfo = p;
      const { dragPropagation: v, dragDirectionLock: w, onDirectionLock: x, onDrag: T } = this.getProps();
      if (!v && !this.openDragLock)
        return;
      const { offset: A } = p;
      if (w && this.currentDirection === null) {
        this.currentDirection = xM(A), this.currentDirection !== null && x && x(this.currentDirection);
        return;
      }
      this.updateAxis("x", p.point, A), this.updateAxis("y", p.point, A), this.visualElement.render(), T && Ee.update(() => T(d, p), !1, !0);
    }, f = (d, p) => {
      this.latestPointerEvent = d, this.latestPanInfo = p, this.stop(d, p), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, m = () => {
      const { dragSnapToOrigin: d } = this.getProps();
      (d || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: g } = this.getProps();
    this.panSession = new kx(e, {
      onSessionStart: a,
      onStart: l,
      onMove: c,
      onSessionEnd: f,
      resumeAnimation: m
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: g,
      distanceThreshold: r,
      contextWindow: Ax(this.visualElement),
      element: this.visualElement.current
    });
  }
  /**
   * @internal
   */
  stop(e, n) {
    const r = e || this.latestPointerEvent, s = n || this.latestPanInfo, a = this.isDragging;
    if (this.cancel(), !a || !s || !r)
      return;
    const { velocity: l } = s;
    this.startAnimation(l);
    const { onDragEnd: c } = this.getProps();
    c && Ee.postRender(() => c(r, s));
  }
  /**
   * @internal
   */
  cancel() {
    this.isDragging = !1;
    const { projection: e, animationState: n } = this.visualElement;
    e && (e.isAnimationBlocked = !1), this.endPanSession();
    const { dragPropagation: r } = this.getProps();
    !r && this.openDragLock && (this.openDragLock(), this.openDragLock = null), n && n.setActive("whileDrag", !1);
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
  updateAxis(e, n, r) {
    const { drag: s } = this.getProps();
    if (!r || !kl(e, s, this.currentDirection))
      return;
    const a = this.getAxisMotionValue(e);
    let l = this.originPoint[e] + r[e];
    this.constraints && this.constraints[e] && (l = fM(l, this.constraints[e], this.elastic[e])), a.set(l);
  }
  resolveConstraints() {
    var a;
    const { dragConstraints: e, dragElastic: n } = this.getProps(), r = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (a = this.visualElement.projection) == null ? void 0 : a.layout, s = this.constraints;
    e && Zi(e) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : e && r ? this.constraints = hM(r.layoutBox, e) : this.constraints = !1, this.elastic = yM(n), s !== this.constraints && !Zi(e) && r && this.constraints && !this.hasMutatedConstraints && Pn((l) => {
      this.constraints !== !1 && this.getAxisMotionValue(l) && (this.constraints[l] = gM(r.layoutBox[l], this.constraints[l]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: e, onMeasureDragConstraints: n } = this.getProps();
    if (!e || !Zi(e))
      return !1;
    const r = e.current;
    ci(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: s } = this.visualElement;
    if (!s || !s.layout)
      return !1;
    s.root && (s.root.scroll = void 0, s.root.updateScroll());
    const a = xP(r, s.root, this.visualElement.getTransformPagePoint());
    let l = pM(s.layout.layoutBox, a);
    if (n) {
      const c = n(vP(l));
      this.hasMutatedConstraints = !!c, c && (l = KS(c));
    }
    return l;
  }
  startAnimation(e) {
    const { drag: n, dragMomentum: r, dragElastic: s, dragTransition: a, dragSnapToOrigin: l, onDragTransitionEnd: c } = this.getProps(), f = this.constraints || {}, m = Pn((g) => {
      if (!kl(g, n, this.currentDirection))
        return;
      let d = f && f[g] || {};
      (l === !0 || l === g) && (d = { min: 0, max: 0 });
      const p = s ? 200 : 1e6, v = s ? 40 : 1e7, w = {
        type: "inertia",
        velocity: r ? e[g] : 0,
        bounceStiffness: p,
        bounceDamping: v,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...a,
        ...d
      };
      return this.startAxisValueAnimation(g, w);
    });
    return Promise.all(m).then(c);
  }
  startAxisValueAnimation(e, n) {
    const r = this.getAxisMotionValue(e);
    return Hf(this.visualElement, e), r.start(np(e, r, 0, n, this.visualElement, !1));
  }
  stopAnimation() {
    Pn((e) => this.getAxisMotionValue(e).stop());
  }
  /**
   * Drag works differently depending on which props are provided.
   *
   * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
   * - Otherwise, we apply the delta to the x/y motion values.
   */
  getAxisMotionValue(e) {
    const n = `_drag${e.toUpperCase()}`, s = this.visualElement.getProps()[n];
    return s || this.visualElement.getValue(e, this.visualElement.latestValues[e] ?? 0);
  }
  snapToCursor(e) {
    Pn((n) => {
      const { drag: r } = this.getProps();
      if (!kl(n, r, this.currentDirection))
        return;
      const { projection: s } = this.visualElement, a = this.getAxisMotionValue(n);
      if (s && s.layout) {
        const { min: l, max: c } = s.layout.layoutBox[n], f = a.get() || 0;
        a.set(e[n] - Pe(l, c, 0.5) + f);
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
    const { drag: e, dragConstraints: n } = this.getProps(), { projection: r } = this.visualElement;
    if (!Zi(n) || !r || !this.constraints)
      return;
    this.stopAnimation();
    const s = { x: 0, y: 0 };
    Pn((l) => {
      const c = this.getAxisMotionValue(l);
      if (c && this.constraints !== !1) {
        const f = c.get();
        s[l] = mM({ min: f, max: f }, this.constraints[l]);
      }
    });
    const { transformTemplate: a } = this.visualElement.getProps();
    this.visualElement.current.style.transform = a ? a({}, "") : "none", r.root && r.root.updateScroll(), r.updateLayout(), this.constraints = !1, this.resolveConstraints(), Pn((l) => {
      if (!kl(l, e, null))
        return;
      const c = this.getAxisMotionValue(l), { min: f, max: m } = this.constraints[l];
      c.set(Pe(f, m, s[l]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    vM.set(this.visualElement, this);
    const e = this.visualElement.current, n = ko(e, "pointerdown", (m) => {
      const { drag: g, dragListener: d = !0 } = this.getProps(), p = m.target, v = p !== e && XC(p);
      g && d && !v && this.start(m);
    });
    let r;
    const s = () => {
      const { dragConstraints: m } = this.getProps();
      Zi(m) && m.current && (this.constraints = this.resolveRefConstraints(), r || (r = SM(e, m.current, () => this.scalePositionWithinConstraints())));
    }, { projection: a } = this.visualElement, l = a.addEventListener("measure", s);
    a && !a.layout && (a.root && a.root.updateScroll(), a.updateLayout()), Ee.read(s);
    const c = Oo(window, "resize", () => this.scalePositionWithinConstraints()), f = a.addEventListener("didUpdate", (({ delta: m, hasLayoutChanged: g }) => {
      this.isDragging && g && (Pn((d) => {
        const p = this.getAxisMotionValue(d);
        p && (this.originPoint[d] += m[d].translate, p.set(p.get() + m[d].translate));
      }), this.visualElement.render());
    }));
    return () => {
      c(), n(), l(), f && f(), r && r();
    };
  }
  getProps() {
    const e = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: r = !1, dragPropagation: s = !1, dragConstraints: a = !1, dragElastic: l = eh, dragMomentum: c = !0 } = e;
    return {
      ...e,
      drag: n,
      dragDirectionLock: r,
      dragPropagation: s,
      dragConstraints: a,
      dragElastic: l,
      dragMomentum: c
    };
  }
}
function I0(t) {
  let e = !0;
  return () => {
    if (e) {
      e = !1;
      return;
    }
    t();
  };
}
function SM(t, e, n) {
  const r = $v(t, I0(n)), s = $v(e, I0(n));
  return () => {
    r(), s();
  };
}
function kl(t, e, n) {
  return (e === !0 || e === t) && (n === null || n === t);
}
function xM(t, e = 10) {
  let n = null;
  return Math.abs(t.y) > e ? n = "y" : Math.abs(t.x) > e && (n = "x"), n;
}
class wM extends Ir {
  constructor(e) {
    super(e), this.removeGroupControls = un, this.removeListeners = un, this.controls = new _M(e);
  }
  mount() {
    const { dragControls: e } = this.node.getProps();
    e && (this.removeGroupControls = e.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || un;
  }
  update() {
    const { dragControls: e } = this.node.getProps(), { dragControls: n } = this.node.prevProps || {};
    e !== n && (this.removeGroupControls(), e && (this.removeGroupControls = e.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const sf = (t) => (e, n) => {
  t && Ee.update(() => t(e, n), !1, !0);
};
class TM extends Ir {
  constructor() {
    super(...arguments), this.removePointerDownListener = un;
  }
  onPointerDown(e) {
    this.session = new kx(e, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Ax(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: e, onPanStart: n, onPan: r, onPanEnd: s } = this.node.getProps();
    return {
      onSessionStart: sf(e),
      onStart: sf(n),
      onMove: sf(r),
      onEnd: (a, l) => {
        delete this.session, s && Ee.postRender(() => s(a, l));
      }
    };
  }
  mount() {
    this.removePointerDownListener = ko(this.node.current, "pointerdown", (e) => this.onPointerDown(e));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let of = !1;
class AM extends E.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: e, layoutGroup: n, switchLayoutGroup: r, layoutId: s } = this.props, { projection: a } = e;
    a && (n.group && n.group.add(a), r && r.register && s && r.register(a), of && a.root.didUpdate(), a.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), a.setOptions({
      ...a.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), Bl.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(e) {
    const { layoutDependency: n, visualElement: r, drag: s, isPresent: a } = this.props, { projection: l } = r;
    return l && (l.isPresent = a, e.layoutDependency !== n && l.setOptions({
      ...l.options,
      layoutDependency: n
    }), of = !0, s || e.layoutDependency !== n || n === void 0 || e.isPresent !== a ? l.willUpdate() : this.safeToRemove(), e.isPresent !== a && (a ? l.promote() : l.relegate() || Ee.postRender(() => {
      const c = l.getStack();
      (!c || !c.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: e, layoutAnchor: n } = this.props, { projection: r } = e;
    r && (r.options.layoutAnchor = n, r.root.didUpdate(), op.postRender(() => {
      !r.currentAnimation && r.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: e, layoutGroup: n, switchLayoutGroup: r } = this.props, { projection: s } = e;
    of = !0, s && (s.scheduleCheckAfterUnmount(), n && n.group && n.group.remove(s), r && r.deregister && r.deregister(s));
  }
  safeToRemove() {
    const { safeToRemove: e } = this.props;
    e && e();
  }
  render() {
    return null;
  }
}
function Cx(t) {
  const [e, n] = mx(), r = E.useContext(Vh);
  return S.jsx(AM, { ...t, layoutGroup: r, switchLayoutGroup: E.useContext(wx), isPresent: e, safeToRemove: n });
}
const kM = {
  pan: {
    Feature: TM
  },
  drag: {
    Feature: wM,
    ProjectionNode: px,
    MeasureLayout: Cx
  }
};
function D0(t, e, n) {
  const { props: r } = t;
  t.animationState && r.whileHover && t.animationState.setActive("whileHover", n === "Start");
  const s = "onHover" + n, a = r[s];
  a && Ee.postRender(() => a(e, ea(e)));
}
class bM extends Ir {
  mount() {
    const { current: e } = this.node;
    e && (this.unmount = KC(e, (n, r) => (D0(this.node, r, "Start"), (s) => D0(this.node, s, "End"))));
  }
  unmount() {
  }
}
class CM extends Ir {
  constructor() {
    super(...arguments), this.isActive = !1;
  }
  onFocus() {
    let e = !1;
    try {
      e = this.node.current.matches(":focus-visible");
    } catch {
      e = !0;
    }
    !e || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !0), this.isActive = !0);
  }
  onBlur() {
    !this.isActive || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !1), this.isActive = !1);
  }
  mount() {
    this.unmount = qo(Oo(this.node.current, "focus", () => this.onFocus()), Oo(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function j0(t, e, n) {
  const { props: r } = t;
  if (t.current instanceof HTMLButtonElement && t.current.disabled)
    return;
  t.animationState && r.whileTap && t.animationState.setActive("whileTap", n === "Start");
  const s = "onTap" + (n === "End" ? "" : n), a = r[s];
  a && Ee.postRender(() => a(e, ea(e)));
}
class PM extends Ir {
  mount() {
    const { current: e } = this.node;
    if (!e)
      return;
    const { globalTapTarget: n, propagate: r } = this.node.props;
    this.unmount = eP(e, (s, a) => (j0(this.node, a, "Start"), (l, { success: c }) => j0(this.node, l, c ? "End" : "Cancel")), {
      useGlobalTarget: n,
      stopPropagation: (r == null ? void 0 : r.tap) === !1
    });
  }
  unmount() {
  }
}
const th = /* @__PURE__ */ new WeakMap(), af = /* @__PURE__ */ new WeakMap(), EM = (t) => {
  const e = th.get(t.target);
  e && e(t);
}, MM = (t) => {
  t.forEach(EM);
};
function RM({ root: t, ...e }) {
  const n = t || document;
  af.has(n) || af.set(n, {});
  const r = af.get(n), s = JSON.stringify(e);
  return r[s] || (r[s] = new IntersectionObserver(MM, { root: t, ...e })), r[s];
}
function NM(t, e, n) {
  const r = RM(e);
  return th.set(t, n), r.observe(t), () => {
    th.delete(t), r.unobserve(t);
  };
}
const IM = {
  some: 0,
  all: 1
};
class DM extends Ir {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var f;
    (f = this.stopObserver) == null || f.call(this);
    const { viewport: e = {} } = this.node.getProps(), { root: n, margin: r, amount: s = "some", once: a } = e, l = {
      root: n ? n.current : void 0,
      rootMargin: r,
      threshold: typeof s == "number" ? s : IM[s]
    }, c = (m) => {
      const { isIntersecting: g } = m;
      if (this.isInView === g || (this.isInView = g, a && !g && this.hasEnteredView))
        return;
      g && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", g);
      const { onViewportEnter: d, onViewportLeave: p } = this.node.getProps(), v = g ? d : p;
      v && v(m);
    };
    this.stopObserver = NM(this.node.current, l, c);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: e, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(jM(e, n)) && this.startObserver();
  }
  unmount() {
    var e;
    (e = this.stopObserver) == null || e.call(this), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function jM({ viewport: t = {} }, { viewport: e = {} } = {}) {
  return (n) => t[n] !== e[n];
}
const FM = {
  inView: {
    Feature: DM
  },
  tap: {
    Feature: PM
  },
  focus: {
    Feature: CM
  },
  hover: {
    Feature: bM
  }
}, OM = {
  layout: {
    ProjectionNode: px,
    MeasureLayout: Cx
  }
}, LM = {
  ...aM,
  ...FM,
  ...kM,
  ...OM
}, zM = /* @__PURE__ */ nM(LM, rM), cn = zM;
function $M(t) {
  const n = String(t || "").toLowerCase().split(".");
  if (n.length !== 4 || n.some((s) => !/^\d+$/.test(s))) return !1;
  const r = n.map(Number);
  return r.some((s) => s < 0 || s > 255) ? !1 : r[0] === 10 || r[0] === 172 && r[1] >= 16 && r[1] <= 31 || r[0] === 192 && r[1] === 168;
}
function Px(t) {
  const e = String(t || "").toLowerCase();
  return e === "127.0.0.1" || e === "localhost" || e === "::1" || e === "[::1]";
}
function F0(t) {
  return Px(t) || $M(t);
}
function VM(t) {
  return !t || Px(t) ? "127.0.0.1" : t;
}
const BM = (() => {
  var g, d, p, v;
  const t = globalThis.window || globalThis, e = globalThis.document || {}, n = t.location || {}, r = String(t.SYNAPSE_DATA_API_PORT || ((d = (g = e.body) == null ? void 0 : g.dataset) == null ? void 0 : d.dataApiPort) || "3001").trim(), { protocol: s = "file:", hostname: a = "127.0.0.1", port: l = "" } = n, c = `http://${VM(a)}:${r || "3001"}`, f = String(t.SYNAPSE_DATA_API_BASE || ((v = (p = e.body) == null ? void 0 : p.dataset) == null ? void 0 : v.dataApiBase) || "").replace(/\/+$/, ""), m = `${s}//${n.host || (l ? `${a}:${l}` : a)}`.replace(/\/+$/, "");
  return f && !(F0(a) && l !== r && f === m) ? f : s === "file:" || F0(a) && l !== r ? c : `${s}//${n.host || a}`;
})(), UM = new B_(BM), lf = Number((globalThis.window || globalThis).SYNAPSE_DATA_API_TIMEOUT_MS || 6e3), HM = Number.isFinite(lf) && lf > 0 ? lf : 6e3;
function WM(t, e) {
  typeof window > "u" || console.warn(t, e);
}
async function ZM(t) {
  var r, s;
  const n = (((s = (r = t.headers) == null ? void 0 : r.get) == null ? void 0 : s.call(r, "content-type")) || "").includes("application/json") ? await t.json() : {};
  if (!t.ok || (n == null ? void 0 : n.ok) === !1)
    throw new Error((n == null ? void 0 : n.error) || `Synapse data API returned HTTP ${t.status}`);
  return n;
}
async function gp(t, e = {}) {
  const n = await UM.fetch(t, {
    timeoutMs: HM,
    ...e
  });
  return ZM(n);
}
async function GM(t = 50) {
  const e = await gp(`/api/generated-content?limit=${encodeURIComponent(t)}`);
  return Array.isArray(e.items) ? e.items : [];
}
async function KM(t) {
  try {
    return (await gp("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t || {})
    })).item || null;
  } catch (e) {
    return WM("Synapse data API focus-session save skipped:", e), null;
  }
}
async function YM(t = 40) {
  const e = await gp(`/api/focus-sessions?limit=${encodeURIComponent(t)}`);
  return Array.isArray(e.items) ? e.items : [];
}
class qM {
  constructor(e = () => globalThis.localStorage) {
    this.storageProvider = e;
  }
  get storage() {
    return this.storageProvider();
  }
  set(e, n) {
    try {
      return this.storage.setItem(e, n), !0;
    } catch (r) {
      return console.warn(`Could not save ${e} to localStorage:`, r), !1;
    }
  }
  get(e, n = "") {
    try {
      const r = this.storage.getItem(e);
      return r === null ? n : r;
    } catch (r) {
      return console.warn(`Could not read ${e} from localStorage:`, r), n;
    }
  }
  remove(e) {
    try {
      return this.storage.removeItem(e), !0;
    } catch (n) {
      return console.warn(`Could not remove ${e} from localStorage:`, n), !1;
    }
  }
  readJSON(e, n) {
    const r = this.get(e, "");
    if (!r) return n;
    try {
      const s = JSON.parse(r);
      return s ?? n;
    } catch (s) {
      return console.warn(`Could not parse ${e} from localStorage:`, s), n;
    }
  }
  writeJSON(e, n) {
    try {
      return this.set(e, JSON.stringify(n));
    } catch (r) {
      return console.warn(`Could not serialize ${e} for localStorage:`, r), !1;
    }
  }
}
const Ex = new qM();
function yp(t, e) {
  return Ex.readJSON(t, e);
}
function vp(t, e) {
  return Ex.writeJSON(t, e);
}
const Mx = "synapse.focusRoom.sessions.v1", Rx = "synapse.focusRoom.draft.v1", Nx = "synapse.focusRoom.active-session.v1", hu = 40;
let nh = [];
const Xr = (t) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(t)}`, rh = [
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
    streamUrl: Xr("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
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
], at = {
  nature: {
    id: "nature-forest",
    title: "Forest ambience",
    artist: "nille",
    streamUrl: Xr("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: Xr("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: Xr("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: Xr("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: Xr("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: Xr("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, ih = [
  {
    label: "Nature",
    layers: [at.nature],
    pageUrl: at.nature.pageUrl,
    license: at.nature.license
  },
  {
    label: "Cafe Rain",
    layers: [at.cafe, at.rain],
    pageUrl: at.cafe.pageUrl,
    license: "CC0 / Public domain"
  },
  {
    label: "Rain",
    layers: [at.rain],
    pageUrl: at.rain.pageUrl,
    license: at.rain.license
  },
  {
    label: "White Noise",
    layers: [at.whiteNoise],
    pageUrl: at.whiteNoise.pageUrl,
    license: at.whiteNoise.license
  },
  {
    label: "Ocean",
    layers: [at.ocean],
    pageUrl: at.ocean.pageUrl,
    license: at.ocean.license
  },
  {
    label: "Wind",
    layers: [at.wind],
    pageUrl: at.wind.pageUrl,
    license: at.wind.license
  }
], ta = [
  {
    id: "morning-window",
    name: "Morning Window",
    kicker: "Bright focus",
    description: "Soft daylight, quiet desk, gentle outdoor calm.",
    image: "./assets/focus-room/morning-window.webp",
    ambientSound: "Nature",
    musicType: "Deep Focus"
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
    musicType: "Piano"
  },
  {
    id: "ocean-study-room",
    name: "Ocean Study Room",
    kicker: "Open air",
    description: "Blue horizon, slow waves, clean study energy.",
    image: "./assets/focus-room/ocean-study-room.webp",
    ambientSound: "Ocean",
    musicType: "Deep Focus"
  },
  {
    id: "mountain-cabin",
    name: "Mountain Cabin",
    kicker: "Warm retreat",
    description: "Snow view, wood textures, protected concentration.",
    image: "./assets/focus-room/mountain-cabin.webp",
    ambientSound: "Wind",
    musicType: "Piano"
  },
  {
    id: "minimal-desk",
    name: "Minimal Desk",
    kicker: "Clean reset",
    description: "Neutral light, uncluttered desk, no distractions.",
    image: "./assets/focus-room/minimal-desk.webp",
    ambientSound: "White Noise",
    musicType: "Minimal"
  }
], Ix = [25, 45, 50, 90];
function QM(t = "") {
  const e = String(t || "");
  return rh.find((n) => n.label === e) || rh[0];
}
function XM(t = "") {
  const e = String(t || "");
  return ih.find((n) => n.label === e) || ih[0];
}
function ju(t = {}) {
  const e = QM(t == null ? void 0 : t.musicType), n = XM(t == null ? void 0 : t.ambientSound);
  return {
    musicTrack: e,
    ambientSound: n,
    ambientLayers: n.layers.map((r) => ({
      ...r,
      volumeBias: ei(r.volumeBias, 1)
    }))
  };
}
function _p(t) {
  return String(t || "").replace(/```[\s\S]*?```/g, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function JM(t) {
  const e = String(t || "").split(/\n+/).map((n) => n.replace(/^#+\s*/, "").trim()).find((n) => n.length > 4);
  return e ? e.slice(0, 72) : "Generated Study Notes";
}
function di(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}
function rt(t) {
  return Array.isArray(t) ? t : [];
}
function Re(t) {
  return String(t || "").trim();
}
function Ul(t, e) {
  return Re(t || e).replace(/[^A-Za-z0-9:_%-]/g, "_").replace(/_{2,}/g, "_").slice(0, 180) || Re(e);
}
function Hl(t, e = 420) {
  const n = _p(t);
  return n ? n.length > e ? `${n.slice(0, e).trim()}...` : n : "";
}
function eR(t = {}) {
  return [...rt(t.sourceItems), ...rt(t.sources)].map((e, n) => {
    const r = typeof e == "string" ? { title: e, name: e } : di(e), s = Re(
      r.title || r.name || r.displayName || r.display_name || r.label || r.url || r.originalUrl || `Source ${n + 1}`
    ), a = Ul(
      r.id || r.sourceId || r.source_id || r.sourceIdentity || r.source_identity || s,
      `source:${n + 1}`
    );
    return {
      ...r,
      id: a,
      index: Number(r.index || n + 1) || n + 1,
      label: s,
      title: s,
      kind: Re(r.kind || r.type || "source") || "source",
      excerpt: Hl(r.content || r.text || r.excerpt || r.summary || s, 520)
    };
  }).filter((e) => e.id || e.label || e.excerpt);
}
function tR(t, e = {}) {
  const n = Re(e.sourceId || e.source_id || e.sourceIdentity || e.source_identity);
  if (n) {
    const a = t.find((l) => l.id === n || l.sourceIdentity === n || l.source_identity === n);
    if (a) return a;
  }
  const r = Number(e.sourceIndex || e.source_index || e.index);
  if (Number.isFinite(r) && r > 0)
    return t[r - 1] || null;
  const s = Re(e.source || e.sourceLabel || e.source_label || e.reference);
  return s ? t.find((a) => a.label === s || a.title === s || a.name === s) || null : t[0] || null;
}
function nR(t = {}) {
  const e = eR(t), r = [
    ...rt(t.sourceHighlights),
    ...rt(t.source_highlights),
    ...rt(t.evidenceHighlights),
    ...rt(t.evidence_highlights),
    ...rt(t.sourceMap),
    ...rt(t.source_map),
    ...rt(t.citations)
  ].map((a, l) => {
    const c = typeof a == "string" ? { excerpt: a, title: a } : di(a), f = tR(e, c), m = Re(
      c.sourceId || c.source_id || c.sourceIdentity || c.source_identity || (f == null ? void 0 : f.id)
    ), g = Re(
      c.sectionTitle || c.section_title || c.noteSection || c.note_section || c.section || c.heading
    ), d = Hl(
      c.excerpt || c.quote || c.evidence || c.sourceEvidence || c.source_evidence || c.text || c.content || c.summary,
      520
    ), p = Re(
      c.title || c.claim || c.label || g || (f == null ? void 0 : f.label) || `Source highlight ${l + 1}`
    );
    return !p && !d && !m ? null : {
      id: Ul(c.id || `${m || p}:${l}`, `highlight:${l + 1}`),
      title: p,
      excerpt: d,
      sourceId: m,
      sourceIndex: Number(c.sourceIndex || c.source_index || (f == null ? void 0 : f.index) || l + 1) || l + 1,
      sourceLabel: Re(c.sourceLabel || c.source_label || c.source || (f == null ? void 0 : f.label) || `Source ${l + 1}`),
      sourceKind: Re(c.sourceKind || c.source_kind || (f == null ? void 0 : f.kind) || "source") || "source",
      sectionTitle: g,
      kind: Re(c.kind || "evidence") || "evidence"
    };
  }).filter(Boolean);
  if (r.length) return r.slice(0, 24);
  const s = Object.entries(di(t.sections)).filter(([a, l]) => /(source|evidence|citation|reference|example|case|data)/i.test(a) && Hl(l, 520)).slice(0, 8).map(([a, l], c) => {
    const f = e[c] || e[0] || null;
    return {
      id: Ul(`${(f == null ? void 0 : f.id) || "section"}:${a}:${c}`, `section-highlight:${c + 1}`),
      title: a,
      excerpt: Hl(l, 520),
      sourceId: (f == null ? void 0 : f.id) || "",
      sourceIndex: (f == null ? void 0 : f.index) || c + 1,
      sourceLabel: (f == null ? void 0 : f.label) || "Generated notes",
      sourceKind: (f == null ? void 0 : f.kind) || "notes",
      sectionTitle: a,
      kind: "section"
    };
  });
  return s.length ? s : e.filter((a) => a.excerpt || a.label).slice(0, 12).map((a, l) => ({
    id: Ul(`${a.id}:fallback:${l}`, `source-highlight:${l + 1}`),
    title: a.label || `Source ${l + 1}`,
    excerpt: a.excerpt || a.label,
    sourceId: a.id,
    sourceIndex: a.index || l + 1,
    sourceLabel: a.label || `Source ${l + 1}`,
    sourceKind: a.kind || "source",
    sectionTitle: "",
    kind: "source"
  }));
}
function pu(t) {
  const e = Date.parse(String(t || ""));
  return Number.isFinite(e) ? e : 0;
}
function rR(t) {
  const e = t != null && t.sections && typeof t.sections == "object" ? Object.keys(t.sections).filter(Boolean) : [];
  return e.length ? e.slice(0, 8) : String((t == null ? void 0 : t.summary) || (t == null ? void 0 : t.aiSummary) || "").split(`
`).map((n) => {
    var r, s;
    return (s = (r = n.match(/^#{1,4}\s+(.+)$/)) == null ? void 0 : r[1]) == null ? void 0 : s.trim();
  }).filter(Boolean).slice(0, 8);
}
function iR(t = {}) {
  const e = t.databaseRecord || t.database_record;
  if (e && typeof e == "object") return e;
  const n = Re(t.generatedContentId || t.generated_content_id || t.id);
  return n ? {
    id: n,
    source_fingerprint: t.source_fingerprint || t.sourceFingerprint || "",
    created_at: t.created_at || t.createdAt || "",
    updated_at: t.updated_at || t.updatedAt || ""
  } : null;
}
function us(t = {}) {
  var F;
  (!t || typeof t != "object") && (t = {});
  const e = iR(t), n = Re(
    t.materialId || t.id || t.historyId || t.generatedContentId || t.generated_content_id || (e == null ? void 0 : e.id) || t.sourceFingerprint || t.source_fingerprint || "current-material"
  ), r = String(t.aiSummary || t.summary || t.fullSummary || ""), s = String(t.materialTitle || t.title || JM(r)), a = Re(t.sourceFingerprint || t.source_fingerprint || t.clientFingerprint || t.client_fingerprint), l = Re(t.clientFingerprint || t.client_fingerprint || a), c = di(t.sections), f = Re(t.promptMode || t.prompt_mode) || "professor_mode", m = Re(t.detailLevel || t.detail_level), g = rt(t.flashcards || t.cards), d = rt(t.quizzes || t.quizHistory), p = rt(t.studyPlan || ((F = t.timeline) == null ? void 0 : F.events) || t.study_path), v = rt(t.progressHistory), w = rt(t.visualGallery || t.visual_gallery || t.visuals), x = rt(t.sources), T = rt(t.sourceItems), A = nR({ ...t, sources: x, sourceItems: T, sections: c }), b = t.mindMap || t.mind_map || t.brainstorm || null, C = t.uploadedContent || t.sourceText || t.source_text || "", M = rt(t.connections), P = t.createdAt || t.created_at || "", z = t.updatedAt || t.updated_at || P, O = _p(r);
  return {
    materialId: n,
    materialTitle: s,
    materialType: t.materialType || t.type || "Generated notes",
    uploadedContent: C,
    aiSummary: r,
    summaryText: O,
    sections: c,
    studyHeadings: rR(t),
    flashcards: g,
    quizzes: d,
    mindMap: b,
    studyPlan: p,
    progressHistory: v,
    connections: M,
    visualGallery: w,
    visualGalleryCount: Number(t.visualGalleryCount || w.length || 0),
    sources: x,
    sourceItems: T,
    sourceHighlights: A,
    promptMode: f,
    detailLevel: m,
    isSourceRestricted: f === "source_strict_research_mode",
    sourceFingerprint: a,
    clientFingerprint: l,
    databaseRecord: e,
    cached: !!t.cached,
    createdAt: P,
    updatedAt: z
  };
}
function O0(t = {}) {
  var l;
  const e = [], n = Re(t.materialId), r = Re(t.sourceFingerprint), s = Re(t.clientFingerprint), a = Re(((l = t.databaseRecord) == null ? void 0 : l.id) || t.generatedContentId || t.generated_content_id);
  return n && e.push(`id:${n}`), a && e.push(`db:${a}`), r && e.push(`fp:${r}`), s && e.push(`cf:${s}`), [...new Set(e)];
}
function sR(t = {}, e = {}) {
  const n = us(t), r = us(e), s = di(r.sections), a = di(n.sections), l = Re(r.aiSummary), c = Re(n.aiSummary), f = l || c;
  return {
    ...n,
    ...r,
    materialId: n.materialId || r.materialId,
    materialTitle: r.materialTitle || n.materialTitle || "Generated Study Notes",
    materialType: r.materialType || n.materialType || "Generated notes",
    uploadedContent: r.uploadedContent || n.uploadedContent || "",
    aiSummary: f,
    summaryText: _p(f),
    sections: Object.keys(s).length ? s : a,
    studyHeadings: r.studyHeadings.length ? r.studyHeadings : n.studyHeadings,
    flashcards: r.flashcards.length ? r.flashcards : n.flashcards,
    quizzes: r.quizzes.length ? r.quizzes : n.quizzes,
    mindMap: r.mindMap || n.mindMap || null,
    studyPlan: r.studyPlan.length ? r.studyPlan : n.studyPlan,
    progressHistory: r.progressHistory.length ? r.progressHistory : n.progressHistory,
    connections: r.connections.length ? r.connections : n.connections,
    visualGallery: r.visualGallery.length ? r.visualGallery : n.visualGallery,
    visualGalleryCount: r.visualGallery.length ? r.visualGallery.length : Number(n.visualGalleryCount || n.visualGallery.length || 0),
    sources: r.sources.length ? r.sources : n.sources,
    sourceItems: r.sourceItems.length ? r.sourceItems : n.sourceItems,
    sourceHighlights: r.sourceHighlights.length ? r.sourceHighlights : n.sourceHighlights,
    promptMode: r.promptMode || n.promptMode || "professor_mode",
    detailLevel: r.detailLevel || n.detailLevel || "",
    isSourceRestricted: r.isSourceRestricted || n.isSourceRestricted,
    sourceFingerprint: r.sourceFingerprint || n.sourceFingerprint || "",
    clientFingerprint: r.clientFingerprint || n.clientFingerprint || r.sourceFingerprint || n.sourceFingerprint || "",
    databaseRecord: r.databaseRecord || n.databaseRecord || null,
    cached: r.cached || n.cached,
    createdAt: n.createdAt || r.createdAt || "",
    updatedAt: pu(r.updatedAt) >= pu(n.updatedAt) ? r.updatedAt : n.updatedAt
  };
}
function sh(...t) {
  const e = t.flatMap((s) => rt(s)), n = [], r = /* @__PURE__ */ new Map();
  return e.map(us).filter((s) => s.materialId || s.aiSummary).forEach((s) => {
    const a = O0(s), l = a.reduce((f, m) => f >= 0 ? f : r.has(m) ? r.get(m) : -1, -1);
    if (l >= 0) {
      const f = sR(n[l], s);
      n[l] = f, O0(f).forEach((m) => r.set(m, l));
      return;
    }
    const c = n.push(s) - 1;
    a.forEach((f) => r.set(f, c));
  }), n.sort((s, a) => pu(a.updatedAt || a.createdAt) - pu(s.updatedAt || s.createdAt));
}
function oR() {
  if (typeof globalThis.getSynapseFocusRoomMaterials == "function") {
    const t = globalThis.getSynapseFocusRoomMaterials();
    return Array.isArray(t) ? t.map(us) : [];
  }
  return [];
}
function aR() {
  if (typeof globalThis.getSynapseFocusRoomCurrentMaterial == "function") {
    const t = globalThis.getSynapseFocusRoomCurrentMaterial();
    return t ? us(t) : null;
  }
  return null;
}
function Sp() {
  const t = oR(), e = aR();
  return e && e.aiSummary && !t.some((n) => n.materialId === e.materialId) ? sh([e], t) : sh(t);
}
function lR(t) {
  const e = String(t || ""), n = Sp();
  return n.find((r) => r.materialId === e) || n[0] || null;
}
async function uR(t = 50) {
  const e = Sp();
  try {
    const n = await GM(t), r = rt(n).map(us);
    return sh(e, r);
  } catch (n) {
    return typeof window < "u" && console.warn("Synapse data API Focus Room materials sync skipped:", n), e;
  }
}
function cR({ material: t, goal: e, durationMinutes: n }) {
  var g;
  const r = Math.max(10, Number(n) || 25), s = (g = t == null ? void 0 : t.studyHeadings) != null && g.length ? t.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], a = String(e || "").trim() || `Study ${(t == null ? void 0 : t.materialTitle) || "this material"}`, l = Math.max(1, Math.floor(r * 0.2)), c = Math.max(1, Math.floor(r * 0.4)), f = Math.max(1, Math.floor(r * 0.2)), m = Math.max(1, r - l - c - f);
  return [
    { minutes: l, task: `Set the goal: ${a}` },
    { minutes: c, task: `Review ${s[0] || "the core ideas"}` },
    { minutes: f, task: `Practice with ${s[1] || s[0] || "the generated examples"}` },
    { minutes: m, task: "Summarize mistakes and choose the next study step" }
  ];
}
function Dx() {
  return yp(Rx, null);
}
function dR(t) {
  return vp(Rx, t || null);
}
function jx(t) {
  if (!t || typeof t != "object")
    return { materials: {} };
  const e = di(t.materials);
  return {
    ...t,
    materials: { ...e }
  };
}
function Fx() {
  return jx(yp(Nx, null));
}
function fR(t) {
  return vp(Nx, jx(t));
}
function hR(t) {
  const e = Re(t);
  if (!e) return null;
  const r = Fx().materials[e];
  return r && typeof r == "object" ? r : null;
}
function Ox(t, e) {
  const n = Re(t);
  if (!n) return !1;
  const r = Fx();
  return e && typeof e == "object" ? r.materials[n] = {
    ...e,
    materialId: n,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  } : delete r.materials[n], fR(r);
}
function Lx(t) {
  return Ox(t, null);
}
function mu() {
  const t = yp(Mx, []), e = Array.isArray(t) ? t : [], n = /* @__PURE__ */ new Set();
  return [...nh, ...e].filter((r) => {
    const s = String((r == null ? void 0 : r.sessionId) || "");
    return !s || n.has(s) ? !1 : (n.add(s), !0);
  }).slice(0, hu);
}
async function pR() {
  try {
    const t = await YM(hu);
    if (t.length)
      return t.map((e) => ({
        ...e.metrics,
        ...e,
        sessionId: e.sessionId || e.id,
        persisted: !0
      }));
  } catch (t) {
    console.warn("Synapse data API focus-session read skipped:", t);
  }
  return mu();
}
function ei(t, e) {
  const n = Number(t);
  return Number.isFinite(n) ? n : e;
}
function mR(t = {}) {
  const e = (/* @__PURE__ */ new Date()).toISOString(), r = { ...{
    sessionId: t.sessionId || `focus-${Date.now()}`,
    materialId: String(t.materialId || ""),
    materialTitle: t.materialTitle || "Study material",
    studyGoal: t.studyGoal || "",
    selectedScene: t.selectedScene || "morning-window",
    musicType: t.musicType || "Deep Focus",
    ambientSound: t.ambientSound || "Nature",
    musicVolume: ei(t.musicVolume ?? 60, 60),
    ambientVolume: ei(t.ambientVolume ?? 50, 50),
    pomodoroDuration: ei(t.pomodoroDuration || 25, 25),
    startedAt: t.startedAt || e,
    endedAt: t.endedAt || e,
    totalFocusTime: Math.max(0, ei(t.totalFocusTime || 0, 0)),
    flashcardsCompleted: Math.max(0, ei(t.flashcardsCompleted || 0, 0)),
    quizScore: t.quizScore === null || t.quizScore === void 0 || t.quizScore === "" ? null : Number.isFinite(Number(t.quizScore)) ? Number(t.quizScore) : null,
    mistakesMade: Array.isArray(t.mistakesMade) ? t.mistakesMade : [],
    completedTasks: Array.isArray(t.completedTasks) ? t.completedTasks : [],
    aiReflection: t.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: t.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: t.sessionDate || e
  }, persisted: !0 }, s = mu().filter((f) => f.sessionId !== r.sessionId), a = [r, ...s.map((f) => ({ ...f, persisted: !0 }))].slice(0, hu), l = vp(Mx, a), c = { ...r, persisted: l };
  return KM(c).catch((f) => {
    console.warn("Synapse data API focus-session background save failed:", f);
  }), l ? nh = [] : nh = [c, ...s].slice(0, hu), c;
}
function Fu(t) {
  const e = Math.max(0, ei(t || 0, 0)), n = Math.floor(e / 3600), r = Math.floor(e % 3600 / 60);
  return n ? `${n}h ${r}m` : `${r}m`;
}
function Zn(t) {
  if (t === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return t;
}
function zx(t, e) {
  t.prototype = Object.create(e.prototype), t.prototype.constructor = t, t.__proto__ = e;
}
/*!
 * GSAP 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/
var Kt = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
}, Lo = {
  duration: 0.5,
  overwrite: !1,
  delay: 0
}, xp, ht, Fe, an = 1e8, Ce = 1 / an, oh = Math.PI * 2, gR = oh / 4, yR = 0, $x = Math.sqrt, vR = Math.cos, _R = Math.sin, lt = function(e) {
  return typeof e == "string";
}, Ze = function(e) {
  return typeof e == "function";
}, qn = function(e) {
  return typeof e == "number";
}, wp = function(e) {
  return typeof e > "u";
}, Fn = function(e) {
  return typeof e == "object";
}, Dt = function(e) {
  return e !== !1;
}, Tp = function() {
  return typeof window < "u";
}, bl = function(e) {
  return Ze(e) || lt(e);
}, Vx = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {
}, _t = Array.isArray, SR = /random\([^)]+\)/g, xR = /,\s*/g, L0 = /(?:-?\.?\d|\.)+/gi, Bx = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, Qi = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, uf = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Ux = /[+-]=-?[.\d]+/, wR = /[^,'"\[\]\s]+/gi, TR = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, Be, En, ah, Ap, Yt = {}, gu = {}, Hx, Wx = function(e) {
  return (gu = cs(e, Yt)) && Lt;
}, kp = function(e, n) {
  return console.warn("Invalid property", e, "set to", n, "Missing plugin? gsap.registerPlugin()");
}, zo = function(e, n) {
  return !n && console.warn(e);
}, Zx = function(e, n) {
  return e && (Yt[e] = n) && gu && (gu[e] = n) || Yt;
}, $o = function() {
  return 0;
}, AR = {
  suppressEvents: !0,
  isStart: !0,
  kill: !1
}, Wl = {
  suppressEvents: !0,
  kill: !1
}, kR = {
  suppressEvents: !0
}, bp = {}, br = [], lh = {}, Gx, Ht = {}, cf = {}, z0 = 30, Zl = [], Cp = "", Pp = function(e) {
  var n = e[0], r, s;
  if (Fn(n) || Ze(n) || (e = [e]), !(r = (n._gsap || {}).harness)) {
    for (s = Zl.length; s-- && !Zl[s].targetTest(n); )
      ;
    r = Zl[s];
  }
  for (s = e.length; s--; )
    e[s] && (e[s]._gsap || (e[s]._gsap = new mw(e[s], r))) || e.splice(s, 1);
  return e;
}, oi = function(e) {
  return e._gsap || Pp(ln(e))[0]._gsap;
}, Kx = function(e, n, r) {
  return (r = e[n]) && Ze(r) ? e[n]() : wp(r) && e.getAttribute && e.getAttribute(n) || r;
}, jt = function(e, n) {
  return (e = e.split(",")).forEach(n) || e;
}, Ye = function(e) {
  return Math.round(e * 1e5) / 1e5 || 0;
}, Ve = function(e) {
  return Math.round(e * 1e7) / 1e7 || 0;
}, ts = function(e, n) {
  var r = n.charAt(0), s = parseFloat(n.substr(2));
  return e = parseFloat(e), r === "+" ? e + s : r === "-" ? e - s : r === "*" ? e * s : e / s;
}, bR = function(e, n) {
  for (var r = n.length, s = 0; e.indexOf(n[s]) < 0 && ++s < r; )
    ;
  return s < r;
}, yu = function() {
  var e = br.length, n = br.slice(0), r, s;
  for (lh = {}, br.length = 0, r = 0; r < e; r++)
    s = n[r], s && s._lazy && (s.render(s._lazy[0], s._lazy[1], !0)._lazy = 0);
}, Ep = function(e) {
  return !!(e._initted || e._startAt || e.add);
}, Yx = function(e, n, r, s) {
  br.length && !ht && yu(), e.render(n, r, !!(ht && n < 0 && Ep(e))), br.length && !ht && yu();
}, qx = function(e) {
  var n = parseFloat(e);
  return (n || n === 0) && (e + "").match(wR).length < 2 ? n : lt(e) ? e.trim() : e;
}, Qx = function(e) {
  return e;
}, qt = function(e, n) {
  for (var r in n)
    r in e || (e[r] = n[r]);
  return e;
}, CR = function(e) {
  return function(n, r) {
    for (var s in r)
      s in n || s === "duration" && e || s === "ease" || (n[s] = r[s]);
  };
}, cs = function(e, n) {
  for (var r in n)
    e[r] = n[r];
  return e;
}, $0 = function t(e, n) {
  for (var r in n)
    r !== "__proto__" && r !== "constructor" && r !== "prototype" && (e[r] = Fn(n[r]) ? t(e[r] || (e[r] = {}), n[r]) : n[r]);
  return e;
}, vu = function(e, n) {
  var r = {}, s;
  for (s in e)
    s in n || (r[s] = e[s]);
  return r;
}, bo = function(e) {
  var n = e.parent || Be, r = e.keyframes ? CR(_t(e.keyframes)) : qt;
  if (Dt(e.inherit))
    for (; n; )
      r(e, n.vars.defaults), n = n.parent || n._dp;
  return e;
}, PR = function(e, n) {
  for (var r = e.length, s = r === n.length; s && r-- && e[r] === n[r]; )
    ;
  return r < 0;
}, Xx = function(e, n, r, s, a) {
  var l = e[s], c;
  if (a)
    for (c = n[a]; l && l[a] > c; )
      l = l._prev;
  return l ? (n._next = l._next, l._next = n) : (n._next = e[r], e[r] = n), n._next ? n._next._prev = n : e[s] = n, n._prev = l, n.parent = n._dp = e, n;
}, Ou = function(e, n, r, s) {
  r === void 0 && (r = "_first"), s === void 0 && (s = "_last");
  var a = n._prev, l = n._next;
  a ? a._next = l : e[r] === n && (e[r] = l), l ? l._prev = a : e[s] === n && (e[s] = a), n._next = n._prev = n.parent = null;
}, Mr = function(e, n) {
  e.parent && (!n || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, ai = function(e, n) {
  if (e && (!n || n._end > e._dur || n._start < 0))
    for (var r = e; r; )
      r._dirty = 1, r = r.parent;
  return e;
}, ER = function(e) {
  for (var n = e.parent; n && n.parent; )
    n._dirty = 1, n.totalDuration(), n = n.parent;
  return e;
}, uh = function(e, n, r, s) {
  return e._startAt && (ht ? e._startAt.revert(Wl) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(n, !0, s));
}, MR = function t(e) {
  return !e || e._ts && t(e.parent);
}, V0 = function(e) {
  return e._repeat ? ds(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, ds = function(e, n) {
  var r = Math.floor(e = Ve(e / n));
  return e && r === e ? r - 1 : r;
}, _u = function(e, n) {
  return (e - n._start) * n._ts + (n._ts >= 0 ? 0 : n._dirty ? n.totalDuration() : n._tDur);
}, Lu = function(e) {
  return e._end = Ve(e._start + (e._tDur / Math.abs(e._ts || e._rts || Ce) || 0));
}, zu = function(e, n) {
  var r = e._dp;
  return r && r.smoothChildTiming && e._ts && (e._start = Ve(r._time - (e._ts > 0 ? n / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - n) / -e._ts)), Lu(e), r._dirty || ai(r, e)), e;
}, Jx = function(e, n) {
  var r;
  if ((n._time || !n._dur && n._initted || n._start < e._time && (n._dur || !n.add)) && (r = _u(e.rawTime(), n), (!n._dur || na(0, n.totalDuration(), r) - n._tTime > Ce) && n.render(r, !0)), ai(e, n)._dp && e._initted && e._time >= e._dur && e._ts) {
    if (e._dur < e.duration())
      for (r = e; r._dp; )
        r.rawTime() >= 0 && r.totalTime(r._tTime), r = r._dp;
    e._zTime = -Ce;
  }
}, Rn = function(e, n, r, s) {
  return n.parent && Mr(n), n._start = Ve((qn(r) ? r : r || e !== Be ? rn(e, r, n) : e._time) + n._delay), n._end = Ve(n._start + (n.totalDuration() / Math.abs(n.timeScale()) || 0)), Xx(e, n, "_first", "_last", e._sort ? "_start" : 0), ch(n) || (e._recent = n), s || Jx(e, n), e._ts < 0 && zu(e, e._tTime), e;
}, ew = function(e, n) {
  return (Yt.ScrollTrigger || kp("scrollTrigger", n)) && Yt.ScrollTrigger.create(n, e);
}, tw = function(e, n, r, s, a) {
  if (Rp(e, n, a), !e._initted)
    return 1;
  if (!r && e._pt && !ht && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && Gx !== Wt.frame)
    return br.push(e), e._lazy = [a, s], 1;
}, RR = function t(e) {
  var n = e.parent;
  return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || t(n));
}, ch = function(e) {
  var n = e.data;
  return n === "isFromStart" || n === "isStart";
}, NR = function(e, n, r, s) {
  var a = e.ratio, l = n < 0 || !n && (!e._start && RR(e) && !(!e._initted && ch(e)) || (e._ts < 0 || e._dp._ts < 0) && !ch(e)) ? 0 : 1, c = e._rDelay, f = 0, m, g, d;
  if (c && e._repeat && (f = na(0, e._tDur, n), g = ds(f, c), e._yoyo && g & 1 && (l = 1 - l), g !== ds(e._tTime, c) && (a = 1 - l, e.vars.repeatRefresh && e._initted && e.invalidate())), l !== a || ht || s || e._zTime === Ce || !n && e._zTime) {
    if (!e._initted && tw(e, n, s, r, f))
      return;
    for (d = e._zTime, e._zTime = n || (r ? Ce : 0), r || (r = n && !d), e.ratio = l, e._from && (l = 1 - l), e._time = 0, e._tTime = f, m = e._pt; m; )
      m.r(l, m.d), m = m._next;
    n < 0 && uh(e, n, r, !0), e._onUpdate && !r && Zt(e, "onUpdate"), f && e._repeat && !r && e.parent && Zt(e, "onRepeat"), (n >= e._tDur || n < 0) && e.ratio === l && (l && Mr(e, 1), !r && !ht && (Zt(e, l ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
  } else e._zTime || (e._zTime = n);
}, IR = function(e, n, r) {
  var s;
  if (r > n)
    for (s = e._first; s && s._start <= r; ) {
      if (s.data === "isPause" && s._start > n)
        return s;
      s = s._next;
    }
  else
    for (s = e._last; s && s._start >= r; ) {
      if (s.data === "isPause" && s._start < n)
        return s;
      s = s._prev;
    }
}, fs = function(e, n, r, s) {
  var a = e._repeat, l = Ve(n) || 0, c = e._tTime / e._tDur;
  return c && !s && (e._time *= l / e._dur), e._dur = l, e._tDur = a ? a < 0 ? 1e10 : Ve(l * (a + 1) + e._rDelay * a) : l, c > 0 && !s && zu(e, e._tTime = e._tDur * c), e.parent && Lu(e), r || ai(e.parent, e), e;
}, B0 = function(e) {
  return e instanceof Nt ? ai(e) : fs(e, e._dur);
}, DR = {
  _start: 0,
  endTime: $o,
  totalDuration: $o
}, rn = function t(e, n, r) {
  var s = e.labels, a = e._recent || DR, l = e.duration() >= an ? a.endTime(!1) : e._dur, c, f, m;
  return lt(n) && (isNaN(n) || n in s) ? (f = n.charAt(0), m = n.substr(-1) === "%", c = n.indexOf("="), f === "<" || f === ">" ? (c >= 0 && (n = n.replace(/=/, "")), (f === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (m ? (c < 0 ? a : r).totalDuration() / 100 : 1)) : c < 0 ? (n in s || (s[n] = l), s[n]) : (f = parseFloat(n.charAt(c - 1) + n.substr(c + 1)), m && r && (f = f / 100 * (_t(r) ? r[0] : r).totalDuration()), c > 1 ? t(e, n.substr(0, c - 1), r) + f : l + f)) : n == null ? l : +n;
}, Co = function(e, n, r) {
  var s = qn(n[1]), a = (s ? 2 : 1) + (e < 2 ? 0 : 1), l = n[a], c, f;
  if (s && (l.duration = n[1]), l.parent = r, e) {
    for (c = l, f = r; f && !("immediateRender" in c); )
      c = f.vars.defaults || {}, f = Dt(f.vars.inherit) && f.parent;
    l.immediateRender = Dt(c.immediateRender), e < 2 ? l.runBackwards = 1 : l.startAt = n[a - 1];
  }
  return new Xe(n[0], l, n[a + 1]);
}, Dr = function(e, n) {
  return e || e === 0 ? n(e) : n;
}, na = function(e, n, r) {
  return r < e ? e : r > n ? n : r;
}, vt = function(e, n) {
  return !lt(e) || !(n = TR.exec(e)) ? "" : n[1];
}, jR = function(e, n, r) {
  return Dr(r, function(s) {
    return na(e, n, s);
  });
}, dh = [].slice, nw = function(e, n) {
  return e && Fn(e) && "length" in e && (!n && !e.length || e.length - 1 in e && Fn(e[0])) && !e.nodeType && e !== En;
}, FR = function(e, n, r) {
  return r === void 0 && (r = []), e.forEach(function(s) {
    var a;
    return lt(s) && !n || nw(s, 1) ? (a = r).push.apply(a, ln(s)) : r.push(s);
  }) || r;
}, ln = function(e, n, r) {
  return Fe && !n && Fe.selector ? Fe.selector(e) : lt(e) && !r && (ah || !hs()) ? dh.call((n || Ap).querySelectorAll(e), 0) : _t(e) ? FR(e, r) : nw(e) ? dh.call(e, 0) : e ? [e] : [];
}, fh = function(e) {
  return e = ln(e)[0] || zo("Invalid scope") || {}, function(n) {
    var r = e.current || e.nativeElement || e;
    return ln(n, r.querySelectorAll ? r : r === e ? zo("Invalid scope") || Ap.createElement("div") : e);
  };
}, rw = function(e) {
  return e.sort(function() {
    return 0.5 - Math.random();
  });
}, iw = function(e) {
  if (Ze(e))
    return e;
  var n = Fn(e) ? e : {
    each: e
  }, r = li(n.ease), s = n.from || 0, a = parseFloat(n.base) || 0, l = {}, c = s > 0 && s < 1, f = isNaN(s) || c, m = n.axis, g = s, d = s;
  return lt(s) ? g = d = {
    center: 0.5,
    edges: 0.5,
    end: 1
  }[s] || 0 : !c && f && (g = s[0], d = s[1]), function(p, v, w) {
    var x = (w || n).length, T = l[x], A, b, C, M, P, z, O, F, L;
    if (!T) {
      if (L = n.grid === "auto" ? 0 : (n.grid || [1, an])[1], !L) {
        for (O = -an; O < (O = w[L++].getBoundingClientRect().left) && L < x; )
          ;
        L < x && L--;
      }
      for (T = l[x] = [], A = f ? Math.min(L, x) * g - 0.5 : s % L, b = L === an ? 0 : f ? x * d / L - 0.5 : s / L | 0, O = 0, F = an, z = 0; z < x; z++)
        C = z % L - A, M = b - (z / L | 0), T[z] = P = m ? Math.abs(m === "y" ? M : C) : $x(C * C + M * M), P > O && (O = P), P < F && (F = P);
      s === "random" && rw(T), T.max = O - F, T.min = F, T.v = x = (parseFloat(n.amount) || parseFloat(n.each) * (L > x ? x - 1 : m ? m === "y" ? x / L : L : Math.max(L, x / L)) || 0) * (s === "edges" ? -1 : 1), T.b = x < 0 ? a - x : a, T.u = vt(n.amount || n.each) || 0, r = r && x < 0 ? YR(r) : r;
    }
    return x = (T[p] - T.min) / T.max || 0, Ve(T.b + (r ? r(x) : x) * T.v) + T.u;
  };
}, hh = function(e) {
  var n = Math.pow(10, ((e + "").split(".")[1] || "").length);
  return function(r) {
    var s = Ve(Math.round(parseFloat(r) / e) * e * n);
    return (s - s % 1) / n + (qn(r) ? 0 : vt(r));
  };
}, sw = function(e, n) {
  var r = _t(e), s, a;
  return !r && Fn(e) && (s = r = e.radius || an, e.values ? (e = ln(e.values), (a = !qn(e[0])) && (s *= s)) : e = hh(e.increment)), Dr(n, r ? Ze(e) ? function(l) {
    return a = e(l), Math.abs(a - l) <= s ? a : l;
  } : function(l) {
    for (var c = parseFloat(a ? l.x : l), f = parseFloat(a ? l.y : 0), m = an, g = 0, d = e.length, p, v; d--; )
      a ? (p = e[d].x - c, v = e[d].y - f, p = p * p + v * v) : p = Math.abs(e[d] - c), p < m && (m = p, g = d);
    return g = !s || m <= s ? e[g] : l, a || g === l || qn(l) ? g : g + vt(l);
  } : hh(e));
}, ow = function(e, n, r, s) {
  return Dr(_t(e) ? !n : r === !0 ? !!(r = 0) : !s, function() {
    return _t(e) ? e[~~(Math.random() * e.length)] : (r = r || 1e-5) && (s = r < 1 ? Math.pow(10, (r + "").length - 2) : 1) && Math.floor(Math.round((e - r / 2 + Math.random() * (n - e + r * 0.99)) / r) * r * s) / s;
  });
}, OR = function() {
  for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
    n[r] = arguments[r];
  return function(s) {
    return n.reduce(function(a, l) {
      return l(a);
    }, s);
  };
}, LR = function(e, n) {
  return function(r) {
    return e(parseFloat(r)) + (n || vt(r));
  };
}, zR = function(e, n, r) {
  return lw(e, n, 0, 1, r);
}, aw = function(e, n, r) {
  return Dr(r, function(s) {
    return e[~~n(s)];
  });
}, $R = function t(e, n, r) {
  var s = n - e;
  return _t(e) ? aw(e, t(0, e.length), n) : Dr(r, function(a) {
    return (s + (a - e) % s) % s + e;
  });
}, VR = function t(e, n, r) {
  var s = n - e, a = s * 2;
  return _t(e) ? aw(e, t(0, e.length - 1), n) : Dr(r, function(l) {
    return l = (a + (l - e) % a) % a || 0, e + (l > s ? a - l : l);
  });
}, Vo = function(e) {
  return e.replace(SR, function(n) {
    var r = n.indexOf("[") + 1, s = n.substring(r || 7, r ? n.indexOf("]") : n.length - 1).split(xR);
    return ow(r ? s : +s[0], r ? 0 : +s[1], +s[2] || 1e-5);
  });
}, lw = function(e, n, r, s, a) {
  var l = n - e, c = s - r;
  return Dr(a, function(f) {
    return r + ((f - e) / l * c || 0);
  });
}, BR = function t(e, n, r, s) {
  var a = isNaN(e + n) ? 0 : function(v) {
    return (1 - v) * e + v * n;
  };
  if (!a) {
    var l = lt(e), c = {}, f, m, g, d, p;
    if (r === !0 && (s = 1) && (r = null), l)
      e = {
        p: e
      }, n = {
        p: n
      };
    else if (_t(e) && !_t(n)) {
      for (g = [], d = e.length, p = d - 2, m = 1; m < d; m++)
        g.push(t(e[m - 1], e[m]));
      d--, a = function(w) {
        w *= d;
        var x = Math.min(p, ~~w);
        return g[x](w - x);
      }, r = n;
    } else s || (e = cs(_t(e) ? [] : {}, e));
    if (!g) {
      for (f in n)
        Mp.call(c, e, f, "get", n[f]);
      a = function(w) {
        return Dp(w, c) || (l ? e.p : e);
      };
    }
  }
  return Dr(r, a);
}, U0 = function(e, n, r) {
  var s = e.labels, a = an, l, c, f;
  for (l in s)
    c = s[l] - n, c < 0 == !!r && c && a > (c = Math.abs(c)) && (f = l, a = c);
  return f;
}, Zt = function(e, n, r) {
  var s = e.vars, a = s[n], l = Fe, c = e._ctx, f, m, g;
  if (a)
    return f = s[n + "Params"], m = s.callbackScope || e, r && br.length && yu(), c && (Fe = c), g = f ? a.apply(m, f) : a.call(m), Fe = l, g;
}, yo = function(e) {
  return Mr(e), e.scrollTrigger && e.scrollTrigger.kill(!!ht), e.progress() < 1 && Zt(e, "onInterrupt"), e;
}, Xi, uw = [], cw = function(e) {
  if (e)
    if (e = !e.name && e.default || e, Tp() || e.headless) {
      var n = e.name, r = Ze(e), s = n && !r && e.init ? function() {
        this._props = [];
      } : e, a = {
        init: $o,
        render: Dp,
        add: Mp,
        kill: sN,
        modifier: iN,
        rawVars: 0
      }, l = {
        targetTest: 0,
        get: 0,
        getSetter: Ip,
        aliases: {},
        register: 0
      };
      if (hs(), e !== s) {
        if (Ht[n])
          return;
        qt(s, qt(vu(e, a), l)), cs(s.prototype, cs(a, vu(e, l))), Ht[s.prop = n] = s, e.targetTest && (Zl.push(s), bp[n] = 1), n = (n === "css" ? "CSS" : n.charAt(0).toUpperCase() + n.substr(1)) + "Plugin";
      }
      Zx(n, s), e.register && e.register(Lt, s, Ft);
    } else
      uw.push(e);
}, be = 255, vo = {
  aqua: [0, be, be],
  lime: [0, be, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, be],
  navy: [0, 0, 128],
  white: [be, be, be],
  olive: [128, 128, 0],
  yellow: [be, be, 0],
  orange: [be, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [be, 0, 0],
  pink: [be, 192, 203],
  cyan: [0, be, be],
  transparent: [be, be, be, 0]
}, df = function(e, n, r) {
  return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? n + (r - n) * e * 6 : e < 0.5 ? r : e * 3 < 2 ? n + (r - n) * (2 / 3 - e) * 6 : n) * be + 0.5 | 0;
}, dw = function(e, n, r) {
  var s = e ? qn(e) ? [e >> 16, e >> 8 & be, e & be] : 0 : vo.black, a, l, c, f, m, g, d, p, v, w;
  if (!s) {
    if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), vo[e])
      s = vo[e];
    else if (e.charAt(0) === "#") {
      if (e.length < 6 && (a = e.charAt(1), l = e.charAt(2), c = e.charAt(3), e = "#" + a + a + l + l + c + c + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9)
        return s = parseInt(e.substr(1, 6), 16), [s >> 16, s >> 8 & be, s & be, parseInt(e.substr(7), 16) / 255];
      e = parseInt(e.substr(1), 16), s = [e >> 16, e >> 8 & be, e & be];
    } else if (e.substr(0, 3) === "hsl") {
      if (s = w = e.match(L0), !n)
        f = +s[0] % 360 / 360, m = +s[1] / 100, g = +s[2] / 100, l = g <= 0.5 ? g * (m + 1) : g + m - g * m, a = g * 2 - l, s.length > 3 && (s[3] *= 1), s[0] = df(f + 1 / 3, a, l), s[1] = df(f, a, l), s[2] = df(f - 1 / 3, a, l);
      else if (~e.indexOf("="))
        return s = e.match(Bx), r && s.length < 4 && (s[3] = 1), s;
    } else
      s = e.match(L0) || vo.transparent;
    s = s.map(Number);
  }
  return n && !w && (a = s[0] / be, l = s[1] / be, c = s[2] / be, d = Math.max(a, l, c), p = Math.min(a, l, c), g = (d + p) / 2, d === p ? f = m = 0 : (v = d - p, m = g > 0.5 ? v / (2 - d - p) : v / (d + p), f = d === a ? (l - c) / v + (l < c ? 6 : 0) : d === l ? (c - a) / v + 2 : (a - l) / v + 4, f *= 60), s[0] = ~~(f + 0.5), s[1] = ~~(m * 100 + 0.5), s[2] = ~~(g * 100 + 0.5)), r && s.length < 4 && (s[3] = 1), s;
}, fw = function(e) {
  var n = [], r = [], s = -1;
  return e.split(Cr).forEach(function(a) {
    var l = a.match(Qi) || [];
    n.push.apply(n, l), r.push(s += l.length + 1);
  }), n.c = r, n;
}, H0 = function(e, n, r) {
  var s = "", a = (e + s).match(Cr), l = n ? "hsla(" : "rgba(", c = 0, f, m, g, d;
  if (!a)
    return e;
  if (a = a.map(function(p) {
    return (p = dw(p, n, 1)) && l + (n ? p[0] + "," + p[1] + "%," + p[2] + "%," + p[3] : p.join(",")) + ")";
  }), r && (g = fw(e), f = r.c, f.join(s) !== g.c.join(s)))
    for (m = e.replace(Cr, "1").split(Qi), d = m.length - 1; c < d; c++)
      s += m[c] + (~f.indexOf(c) ? a.shift() || l + "0,0,0,0)" : (g.length ? g : a.length ? a : r).shift());
  if (!m)
    for (m = e.split(Cr), d = m.length - 1; c < d; c++)
      s += m[c] + a[c];
  return s + m[d];
}, Cr = (function() {
  var t = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", e;
  for (e in vo)
    t += "|" + e + "\\b";
  return new RegExp(t + ")", "gi");
})(), UR = /hsl[a]?\(/, hw = function(e) {
  var n = e.join(" "), r;
  if (Cr.lastIndex = 0, Cr.test(n))
    return r = UR.test(n), e[1] = H0(e[1], r), e[0] = H0(e[0], r, fw(e[1])), !0;
}, Bo, Wt = (function() {
  var t = Date.now, e = 500, n = 33, r = t(), s = r, a = 1e3 / 240, l = a, c = [], f, m, g, d, p, v, w = function x(T) {
    var A = t() - s, b = T === !0, C, M, P, z;
    if ((A > e || A < 0) && (r += A - n), s += A, P = s - r, C = P - l, (C > 0 || b) && (z = ++d.frame, p = P - d.time * 1e3, d.time = P = P / 1e3, l += C + (C >= a ? 4 : a - C), M = 1), b || (f = m(x)), M)
      for (v = 0; v < c.length; v++)
        c[v](P, p, z, T);
  };
  return d = {
    time: 0,
    frame: 0,
    tick: function() {
      w(!0);
    },
    deltaRatio: function(T) {
      return p / (1e3 / (T || 60));
    },
    wake: function() {
      Hx && (!ah && Tp() && (En = ah = window, Ap = En.document || {}, Yt.gsap = Lt, (En.gsapVersions || (En.gsapVersions = [])).push(Lt.version), Wx(gu || En.GreenSockGlobals || !En.gsap && En || {}), uw.forEach(cw)), g = typeof requestAnimationFrame < "u" && requestAnimationFrame, f && d.sleep(), m = g || function(T) {
        return setTimeout(T, l - d.time * 1e3 + 1 | 0);
      }, Bo = 1, w(2));
    },
    sleep: function() {
      (g ? cancelAnimationFrame : clearTimeout)(f), Bo = 0, m = $o;
    },
    lagSmoothing: function(T, A) {
      e = T || 1 / 0, n = Math.min(A || 33, e);
    },
    fps: function(T) {
      a = 1e3 / (T || 240), l = d.time * 1e3 + a;
    },
    add: function(T, A, b) {
      var C = A ? function(M, P, z, O) {
        T(M, P, z, O), d.remove(C);
      } : T;
      return d.remove(T), c[b ? "unshift" : "push"](C), hs(), C;
    },
    remove: function(T, A) {
      ~(A = c.indexOf(T)) && c.splice(A, 1) && v >= A && v--;
    },
    _listeners: c
  }, d;
})(), hs = function() {
  return !Bo && Wt.wake();
}, Se = {}, HR = /^[\d.\-M][\d.\-,\s]/, WR = /["']/g, ZR = function(e) {
  for (var n = {}, r = e.substr(1, e.length - 3).split(":"), s = r[0], a = 1, l = r.length, c, f, m; a < l; a++)
    f = r[a], c = a !== l - 1 ? f.lastIndexOf(",") : f.length, m = f.substr(0, c), n[s] = isNaN(m) ? m.replace(WR, "").trim() : +m, s = f.substr(c + 1).trim();
  return n;
}, GR = function(e) {
  var n = e.indexOf("(") + 1, r = e.indexOf(")"), s = e.indexOf("(", n);
  return e.substring(n, ~s && s < r ? e.indexOf(")", r + 1) : r);
}, KR = function(e) {
  var n = (e + "").split("("), r = Se[n[0]];
  return r && n.length > 1 && r.config ? r.config.apply(null, ~e.indexOf("{") ? [ZR(n[1])] : GR(e).split(",").map(qx)) : Se._CE && HR.test(e) ? Se._CE("", e) : r;
}, YR = function(e) {
  return function(n) {
    return 1 - e(1 - n);
  };
}, li = function(e, n) {
  return e && (Ze(e) ? e : Se[e] || KR(e)) || n;
}, hi = function(e, n, r, s) {
  r === void 0 && (r = function(f) {
    return 1 - n(1 - f);
  }), s === void 0 && (s = function(f) {
    return f < 0.5 ? n(f * 2) / 2 : 1 - n((1 - f) * 2) / 2;
  });
  var a = {
    easeIn: n,
    easeOut: r,
    easeInOut: s
  }, l;
  return jt(e, function(c) {
    Se[c] = Yt[c] = a, Se[l = c.toLowerCase()] = r;
    for (var f in a)
      Se[l + (f === "easeIn" ? ".in" : f === "easeOut" ? ".out" : ".inOut")] = Se[c + "." + f] = a[f];
  }), a;
}, pw = function(e) {
  return function(n) {
    return n < 0.5 ? (1 - e(1 - n * 2)) / 2 : 0.5 + e((n - 0.5) * 2) / 2;
  };
}, ff = function t(e, n, r) {
  var s = n >= 1 ? n : 1, a = (r || (e ? 0.3 : 0.45)) / (n < 1 ? n : 1), l = a / oh * (Math.asin(1 / s) || 0), c = function(g) {
    return g === 1 ? 1 : s * Math.pow(2, -10 * g) * _R((g - l) * a) + 1;
  }, f = e === "out" ? c : e === "in" ? function(m) {
    return 1 - c(1 - m);
  } : pw(c);
  return a = oh / a, f.config = function(m, g) {
    return t(e, m, g);
  }, f;
}, hf = function t(e, n) {
  n === void 0 && (n = 1.70158);
  var r = function(l) {
    return l ? --l * l * ((n + 1) * l + n) + 1 : 0;
  }, s = e === "out" ? r : e === "in" ? function(a) {
    return 1 - r(1 - a);
  } : pw(r);
  return s.config = function(a) {
    return t(e, a);
  }, s;
};
jt("Linear,Quad,Cubic,Quart,Quint,Strong", function(t, e) {
  var n = e < 5 ? e + 1 : e;
  hi(t + ",Power" + (n - 1), e ? function(r) {
    return Math.pow(r, n);
  } : function(r) {
    return r;
  }, function(r) {
    return 1 - Math.pow(1 - r, n);
  }, function(r) {
    return r < 0.5 ? Math.pow(r * 2, n) / 2 : 1 - Math.pow((1 - r) * 2, n) / 2;
  });
});
Se.Linear.easeNone = Se.none = Se.Linear.easeIn;
hi("Elastic", ff("in"), ff("out"), ff());
(function(t, e) {
  var n = 1 / e, r = 2 * n, s = 2.5 * n, a = function(c) {
    return c < n ? t * c * c : c < r ? t * Math.pow(c - 1.5 / e, 2) + 0.75 : c < s ? t * (c -= 2.25 / e) * c + 0.9375 : t * Math.pow(c - 2.625 / e, 2) + 0.984375;
  };
  hi("Bounce", function(l) {
    return 1 - a(1 - l);
  }, a);
})(7.5625, 2.75);
hi("Expo", function(t) {
  return Math.pow(2, 10 * (t - 1)) * t + t * t * t * t * t * t * (1 - t);
});
hi("Circ", function(t) {
  return -($x(1 - t * t) - 1);
});
hi("Sine", function(t) {
  return t === 1 ? 1 : -vR(t * gR) + 1;
});
hi("Back", hf("in"), hf("out"), hf());
Se.SteppedEase = Se.steps = Yt.SteppedEase = {
  config: function(e, n) {
    e === void 0 && (e = 1);
    var r = 1 / e, s = e + (n ? 0 : 1), a = n ? 1 : 0, l = 1 - Ce;
    return function(c) {
      return ((s * na(0, l, c) | 0) + a) * r;
    };
  }
};
Lo.ease = Se["quad.out"];
jt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(t) {
  return Cp += t + "," + t + "Params,";
});
var mw = function(e, n) {
  this.id = yR++, e._gsap = this, this.target = e, this.harness = n, this.get = n ? n.get : Kx, this.set = n ? n.getSetter : Ip;
}, Uo = /* @__PURE__ */ (function() {
  function t(n) {
    this.vars = n, this._delay = +n.delay || 0, (this._repeat = n.repeat === 1 / 0 ? -2 : n.repeat || 0) && (this._rDelay = n.repeatDelay || 0, this._yoyo = !!n.yoyo || !!n.yoyoEase), this._ts = 1, fs(this, +n.duration, 1, 1), this.data = n.data, Fe && (this._ctx = Fe, Fe.data.push(this)), Bo || Wt.wake();
  }
  var e = t.prototype;
  return e.delay = function(r) {
    return r || r === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + r - this._delay), this._delay = r, this) : this._delay;
  }, e.duration = function(r) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? r + (r + this._rDelay) * this._repeat : r) : this.totalDuration() && this._dur;
  }, e.totalDuration = function(r) {
    return arguments.length ? (this._dirty = 0, fs(this, this._repeat < 0 ? r : (r - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
  }, e.totalTime = function(r, s) {
    if (hs(), !arguments.length)
      return this._tTime;
    var a = this._dp;
    if (a && a.smoothChildTiming && this._ts) {
      for (zu(this, r), !a._dp || a.parent || Jx(a, this); a && a.parent; )
        a.parent._time !== a._start + (a._ts >= 0 ? a._tTime / a._ts : (a.totalDuration() - a._tTime) / -a._ts) && a.totalTime(a._tTime, !0), a = a.parent;
      !this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && r < this._tDur || this._ts < 0 && r > 0 || !this._tDur && !r) && Rn(this._dp, this, this._start - this._delay);
    }
    return (this._tTime !== r || !this._dur && !s || this._initted && Math.abs(this._zTime) === Ce || !this._initted && this._dur && r || !r && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = r), Yx(this, r, s)), this;
  }, e.time = function(r, s) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), r + V0(this)) % (this._dur + this._rDelay) || (r ? this._dur : 0), s) : this._time;
  }, e.totalProgress = function(r, s) {
    return arguments.length ? this.totalTime(this.totalDuration() * r, s) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  }, e.progress = function(r, s) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - r : r) + V0(this), s) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  }, e.iteration = function(r, s) {
    var a = this.duration() + this._rDelay;
    return arguments.length ? this.totalTime(this._time + (r - 1) * a, s) : this._repeat ? ds(this._tTime, a) + 1 : 1;
  }, e.timeScale = function(r, s) {
    if (!arguments.length)
      return this._rts === -Ce ? 0 : this._rts;
    if (this._rts === r)
      return this;
    var a = this.parent && this._ts ? _u(this.parent._time, this) : this._tTime;
    return this._rts = +r || 0, this._ts = this._ps || r === -Ce ? 0 : this._rts, this.totalTime(na(-Math.abs(this._delay), this.totalDuration(), a), s !== !1), Lu(this), ER(this);
  }, e.paused = function(r) {
    return arguments.length ? (this._ps !== r && (this._ps = r, r ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (hs(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== Ce && (this._tTime -= Ce)))), this) : this._ps;
  }, e.startTime = function(r) {
    if (arguments.length) {
      this._start = Ve(r);
      var s = this.parent || this._dp;
      return s && (s._sort || !this.parent) && Rn(s, this, this._start - this._delay), this;
    }
    return this._start;
  }, e.endTime = function(r) {
    return this._start + (Dt(r) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  }, e.rawTime = function(r) {
    var s = this.parent || this._dp;
    return s ? r && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? _u(s.rawTime(r), this) : this._tTime : this._tTime;
  }, e.revert = function(r) {
    r === void 0 && (r = kR);
    var s = ht;
    return ht = r, Ep(this) && (this.timeline && this.timeline.revert(r), this.totalTime(-0.01, r.suppressEvents)), this.data !== "nested" && r.kill !== !1 && this.kill(), ht = s, this;
  }, e.globalTime = function(r) {
    for (var s = this, a = arguments.length ? r : s.rawTime(); s; )
      a = s._start + a / (Math.abs(s._ts) || 1), s = s._dp;
    return !this.parent && this._sat ? this._sat.globalTime(r) : a;
  }, e.repeat = function(r) {
    return arguments.length ? (this._repeat = r === 1 / 0 ? -2 : r, B0(this)) : this._repeat === -2 ? 1 / 0 : this._repeat;
  }, e.repeatDelay = function(r) {
    if (arguments.length) {
      var s = this._time;
      return this._rDelay = r, B0(this), s ? this.time(s) : this;
    }
    return this._rDelay;
  }, e.yoyo = function(r) {
    return arguments.length ? (this._yoyo = r, this) : this._yoyo;
  }, e.seek = function(r, s) {
    return this.totalTime(rn(this, r), Dt(s));
  }, e.restart = function(r, s) {
    return this.play().totalTime(r ? -this._delay : 0, Dt(s)), this._dur || (this._zTime = -Ce), this;
  }, e.play = function(r, s) {
    return r != null && this.seek(r, s), this.reversed(!1).paused(!1);
  }, e.reverse = function(r, s) {
    return r != null && this.seek(r || this.totalDuration(), s), this.reversed(!0).paused(!1);
  }, e.pause = function(r, s) {
    return r != null && this.seek(r, s), this.paused(!0);
  }, e.resume = function() {
    return this.paused(!1);
  }, e.reversed = function(r) {
    return arguments.length ? (!!r !== this.reversed() && this.timeScale(-this._rts || (r ? -Ce : 0)), this) : this._rts < 0;
  }, e.invalidate = function() {
    return this._initted = this._act = 0, this._zTime = -Ce, this;
  }, e.isActive = function() {
    var r = this.parent || this._dp, s = this._start, a;
    return !!(!r || this._ts && this._initted && r.isActive() && (a = r.rawTime(!0)) >= s && a < this.endTime(!0) - Ce);
  }, e.eventCallback = function(r, s, a) {
    var l = this.vars;
    return arguments.length > 1 ? (s ? (l[r] = s, a && (l[r + "Params"] = a), r === "onUpdate" && (this._onUpdate = s)) : delete l[r], this) : l[r];
  }, e.then = function(r) {
    var s = this, a = s._prom;
    return new Promise(function(l) {
      var c = Ze(r) ? r : Qx, f = function() {
        var g = s.then;
        s.then = null, a && a(), Ze(c) && (c = c(s)) && (c.then || c === s) && (s.then = g), l(c), s.then = g;
      };
      s._initted && s.totalProgress() === 1 && s._ts >= 0 || !s._tTime && s._ts < 0 ? f() : s._prom = f;
    });
  }, e.kill = function() {
    yo(this);
  }, t;
})();
qt(Uo.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: !1,
  parent: null,
  _initted: !1,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -Ce,
  _prom: 0,
  _ps: !1,
  _rts: 1
});
var Nt = /* @__PURE__ */ (function(t) {
  zx(e, t);
  function e(r, s) {
    var a;
    return r === void 0 && (r = {}), a = t.call(this, r) || this, a.labels = {}, a.smoothChildTiming = !!r.smoothChildTiming, a.autoRemoveChildren = !!r.autoRemoveChildren, a._sort = Dt(r.sortChildren), Be && Rn(r.parent || Be, Zn(a), s), r.reversed && a.reverse(), r.paused && a.paused(!0), r.scrollTrigger && ew(Zn(a), r.scrollTrigger), a;
  }
  var n = e.prototype;
  return n.to = function(s, a, l) {
    return Co(0, arguments, this), this;
  }, n.from = function(s, a, l) {
    return Co(1, arguments, this), this;
  }, n.fromTo = function(s, a, l, c) {
    return Co(2, arguments, this), this;
  }, n.set = function(s, a, l) {
    return a.duration = 0, a.parent = this, bo(a).repeatDelay || (a.repeat = 0), a.immediateRender = !!a.immediateRender, new Xe(s, a, rn(this, l), 1), this;
  }, n.call = function(s, a, l) {
    return Rn(this, Xe.delayedCall(0, s, a), l);
  }, n.staggerTo = function(s, a, l, c, f, m, g) {
    return l.duration = a, l.stagger = l.stagger || c, l.onComplete = m, l.onCompleteParams = g, l.parent = this, new Xe(s, l, rn(this, f)), this;
  }, n.staggerFrom = function(s, a, l, c, f, m, g) {
    return l.runBackwards = 1, bo(l).immediateRender = Dt(l.immediateRender), this.staggerTo(s, a, l, c, f, m, g);
  }, n.staggerFromTo = function(s, a, l, c, f, m, g, d) {
    return c.startAt = l, bo(c).immediateRender = Dt(c.immediateRender), this.staggerTo(s, a, c, f, m, g, d);
  }, n.render = function(s, a, l) {
    var c = this._time, f = this._dirty ? this.totalDuration() : this._tDur, m = this._dur, g = s <= 0 ? 0 : Ve(s), d = this._zTime < 0 != s < 0 && (this._initted || !m), p, v, w, x, T, A, b, C, M, P, z, O;
    if (this !== Be && g > f && s >= 0 && (g = f), g !== this._tTime || l || d) {
      if (c !== this._time && m && (g += this._time - c, s += this._time - c), p = g, M = this._start, C = this._ts, A = !C, d && (m || (c = this._zTime), (s || !a) && (this._zTime = s)), this._repeat) {
        if (z = this._yoyo, T = m + this._rDelay, this._repeat < -1 && s < 0)
          return this.totalTime(T * 100 + s, a, l);
        if (p = Ve(g % T), g === f ? (x = this._repeat, p = m) : (P = Ve(g / T), x = ~~P, x && x === P && (p = m, x--), p > m && (p = m)), P = ds(this._tTime, T), !c && this._tTime && P !== x && this._tTime - P * T - this._dur <= 0 && (P = x), z && x & 1 && (p = m - p, O = 1), x !== P && !this._lock) {
          var F = z && P & 1, L = F === (z && x & 1);
          if (x < P && (F = !F), c = F ? 0 : g % m ? m : g, this._lock = 1, this.render(c || (O ? 0 : Ve(x * T)), a, !m)._lock = 0, this._tTime = g, !a && this.parent && Zt(this, "onRepeat"), this.vars.repeatRefresh && !O && (this.invalidate()._lock = 1, P = x), c && c !== this._time || A !== !this._ts || this.vars.onRepeat && !this.parent && !this._act)
            return this;
          if (m = this._dur, f = this._tDur, L && (this._lock = 2, c = F ? m : -1e-4, this.render(c, !0), this.vars.repeatRefresh && !O && this.invalidate()), this._lock = 0, !this._ts && !A)
            return this;
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2 && (b = IR(this, Ve(c), Ve(p)), b && (g -= p - (p = b._start))), this._tTime = g, this._time = p, this._act = !!C, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = s, c = 0), !c && g && m && !a && !P && (Zt(this, "onStart"), this._tTime !== g))
        return this;
      if (p >= c && s >= 0)
        for (v = this._first; v; ) {
          if (w = v._next, (v._act || p >= v._start) && v._ts && b !== v) {
            if (v.parent !== this)
              return this.render(s, a, l);
            if (v.render(v._ts > 0 ? (p - v._start) * v._ts : (v._dirty ? v.totalDuration() : v._tDur) + (p - v._start) * v._ts, a, l), p !== this._time || !this._ts && !A) {
              b = 0, w && (g += this._zTime = -Ce);
              break;
            }
          }
          v = w;
        }
      else {
        v = this._last;
        for (var U = s < 0 ? s : p; v; ) {
          if (w = v._prev, (v._act || U <= v._end) && v._ts && b !== v) {
            if (v.parent !== this)
              return this.render(s, a, l);
            if (v.render(v._ts > 0 ? (U - v._start) * v._ts : (v._dirty ? v.totalDuration() : v._tDur) + (U - v._start) * v._ts, a, l || ht && Ep(v)), p !== this._time || !this._ts && !A) {
              b = 0, w && (g += this._zTime = U ? -Ce : Ce);
              break;
            }
          }
          v = w;
        }
      }
      if (b && !a && (this.pause(), b.render(p >= c ? 0 : -Ce)._zTime = p >= c ? 1 : -1, this._ts))
        return this._start = M, Lu(this), this.render(s, a, l);
      this._onUpdate && !a && Zt(this, "onUpdate", !0), (g === f && this._tTime >= this.totalDuration() || !g && c) && (M === this._start || Math.abs(C) !== Math.abs(this._ts)) && (this._lock || ((s || !m) && (g === f && this._ts > 0 || !g && this._ts < 0) && Mr(this, 1), !a && !(s < 0 && !c) && (g || c || !f) && (Zt(this, g === f && s >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(g < f && this.timeScale() > 0) && this._prom())));
    }
    return this;
  }, n.add = function(s, a) {
    var l = this;
    if (qn(a) || (a = rn(this, a, s)), !(s instanceof Uo)) {
      if (_t(s))
        return s.forEach(function(c) {
          return l.add(c, a);
        }), this;
      if (lt(s))
        return this.addLabel(s, a);
      if (Ze(s))
        s = Xe.delayedCall(0, s);
      else
        return this;
    }
    return this !== s ? Rn(this, s, a) : this;
  }, n.getChildren = function(s, a, l, c) {
    s === void 0 && (s = !0), a === void 0 && (a = !0), l === void 0 && (l = !0), c === void 0 && (c = -an);
    for (var f = [], m = this._first; m; )
      m._start >= c && (m instanceof Xe ? a && f.push(m) : (l && f.push(m), s && f.push.apply(f, m.getChildren(!0, a, l)))), m = m._next;
    return f;
  }, n.getById = function(s) {
    for (var a = this.getChildren(1, 1, 1), l = a.length; l--; )
      if (a[l].vars.id === s)
        return a[l];
  }, n.remove = function(s) {
    return lt(s) ? this.removeLabel(s) : Ze(s) ? this.killTweensOf(s) : (s.parent === this && Ou(this, s), s === this._recent && (this._recent = this._last), ai(this));
  }, n.totalTime = function(s, a) {
    return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = Ve(Wt.time - (this._ts > 0 ? s / this._ts : (this.totalDuration() - s) / -this._ts))), t.prototype.totalTime.call(this, s, a), this._forcing = 0, this) : this._tTime;
  }, n.addLabel = function(s, a) {
    return this.labels[s] = rn(this, a), this;
  }, n.removeLabel = function(s) {
    return delete this.labels[s], this;
  }, n.addPause = function(s, a, l) {
    var c = Xe.delayedCall(0, a || $o, l);
    return c.data = "isPause", this._hasPause = 1, Rn(this, c, rn(this, s));
  }, n.removePause = function(s) {
    var a = this._first;
    for (s = rn(this, s); a; )
      a._start === s && a.data === "isPause" && Mr(a), a = a._next;
  }, n.killTweensOf = function(s, a, l) {
    for (var c = this.getTweensOf(s, l), f = c.length; f--; )
      wr !== c[f] && c[f].kill(s, a);
    return this;
  }, n.getTweensOf = function(s, a) {
    for (var l = [], c = ln(s), f = this._first, m = qn(a), g; f; )
      f instanceof Xe ? bR(f._targets, c) && (m ? (!wr || f._initted && f._ts) && f.globalTime(0) <= a && f.globalTime(f.totalDuration()) > a : !a || f.isActive()) && l.push(f) : (g = f.getTweensOf(c, a)).length && l.push.apply(l, g), f = f._next;
    return l;
  }, n.tweenTo = function(s, a) {
    a = a || {};
    var l = this, c = rn(l, s), f = a, m = f.startAt, g = f.onStart, d = f.onStartParams, p = f.immediateRender, v, w = Xe.to(l, qt({
      ease: a.ease || "none",
      lazy: !1,
      immediateRender: !1,
      time: c,
      overwrite: "auto",
      duration: a.duration || Math.abs((c - (m && "time" in m ? m.time : l._time)) / l.timeScale()) || Ce,
      onStart: function() {
        if (l.pause(), !v) {
          var T = a.duration || Math.abs((c - (m && "time" in m ? m.time : l._time)) / l.timeScale());
          w._dur !== T && fs(w, T, 0, 1).render(w._time, !0, !0), v = 1;
        }
        g && g.apply(w, d || []);
      }
    }, a));
    return p ? w.render(0) : w;
  }, n.tweenFromTo = function(s, a, l) {
    return this.tweenTo(a, qt({
      startAt: {
        time: rn(this, s)
      }
    }, l));
  }, n.recent = function() {
    return this._recent;
  }, n.nextLabel = function(s) {
    return s === void 0 && (s = this._time), U0(this, rn(this, s));
  }, n.previousLabel = function(s) {
    return s === void 0 && (s = this._time), U0(this, rn(this, s), 1);
  }, n.currentLabel = function(s) {
    return arguments.length ? this.seek(s, !0) : this.previousLabel(this._time + Ce);
  }, n.shiftChildren = function(s, a, l) {
    l === void 0 && (l = 0);
    var c = this._first, f = this.labels, m;
    for (s = Ve(s); c; )
      c._start >= l && (c._start += s, c._end += s), c = c._next;
    if (a)
      for (m in f)
        f[m] >= l && (f[m] += s);
    return ai(this);
  }, n.invalidate = function(s) {
    var a = this._first;
    for (this._lock = 0; a; )
      a.invalidate(s), a = a._next;
    return t.prototype.invalidate.call(this, s);
  }, n.clear = function(s) {
    s === void 0 && (s = !0);
    for (var a = this._first, l; a; )
      l = a._next, this.remove(a), a = l;
    return this._dp && (this._time = this._tTime = this._pTime = 0), s && (this.labels = {}), ai(this);
  }, n.totalDuration = function(s) {
    var a = 0, l = this, c = l._last, f = an, m, g, d;
    if (arguments.length)
      return l.timeScale((l._repeat < 0 ? l.duration() : l.totalDuration()) / (l.reversed() ? -s : s));
    if (l._dirty) {
      for (d = l.parent; c; )
        m = c._prev, c._dirty && c.totalDuration(), g = c._start, g > f && l._sort && c._ts && !l._lock ? (l._lock = 1, Rn(l, c, g - c._delay, 1)._lock = 0) : f = g, g < 0 && c._ts && (a -= g, (!d && !l._dp || d && d.smoothChildTiming) && (l._start += Ve(g / l._ts), l._time -= g, l._tTime -= g), l.shiftChildren(-g, !1, -1 / 0), f = 0), c._end > a && c._ts && (a = c._end), c = m;
      fs(l, l === Be && l._time > a ? l._time : a, 1, 1), l._dirty = 0;
    }
    return l._tDur;
  }, e.updateRoot = function(s) {
    if (Be._ts && (Yx(Be, _u(s, Be)), Gx = Wt.frame), Wt.frame >= z0) {
      z0 += Kt.autoSleep || 120;
      var a = Be._first;
      if ((!a || !a._ts) && Kt.autoSleep && Wt._listeners.length < 2) {
        for (; a && !a._ts; )
          a = a._next;
        a || Wt.sleep();
      }
    }
  }, e;
})(Uo);
qt(Nt.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});
var qR = function(e, n, r, s, a, l, c) {
  var f = new Ft(this._pt, e, n, 0, 1, xw, null, a), m = 0, g = 0, d, p, v, w, x, T, A, b;
  for (f.b = r, f.e = s, r += "", s += "", (A = ~s.indexOf("random(")) && (s = Vo(s)), l && (b = [r, s], l(b, e, n), r = b[0], s = b[1]), p = r.match(uf) || []; d = uf.exec(s); )
    w = d[0], x = s.substring(m, d.index), v ? v = (v + 1) % 5 : x.substr(-5) === "rgba(" && (v = 1), w !== p[g++] && (T = parseFloat(p[g - 1]) || 0, f._pt = {
      _next: f._pt,
      p: x || g === 1 ? x : ",",
      //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
      s: T,
      c: w.charAt(1) === "=" ? ts(T, w) - T : parseFloat(w) - T,
      m: v && v < 4 ? Math.round : 0
    }, m = uf.lastIndex);
  return f.c = m < s.length ? s.substring(m, s.length) : "", f.fp = c, (Ux.test(s) || A) && (f.e = 0), this._pt = f, f;
}, Mp = function(e, n, r, s, a, l, c, f, m, g) {
  Ze(s) && (s = s(a || 0, e, l));
  var d = e[n], p = r !== "get" ? r : Ze(d) ? m ? e[n.indexOf("set") || !Ze(e["get" + n.substr(3)]) ? n : "get" + n.substr(3)](m) : e[n]() : d, v = Ze(d) ? m ? tN : _w : Np, w;
  if (lt(s) && (~s.indexOf("random(") && (s = Vo(s)), s.charAt(1) === "=" && (w = ts(p, s) + (vt(p) || 0), (w || w === 0) && (s = w))), !g || p !== s || ph)
    return !isNaN(p * s) && s !== "" ? (w = new Ft(this._pt, e, n, +p || 0, s - (p || 0), typeof d == "boolean" ? rN : Sw, 0, v), m && (w.fp = m), c && w.modifier(c, this, e), this._pt = w) : (!d && !(n in e) && kp(n, s), qR.call(this, e, n, p, s, v, f || Kt.stringFilter, m));
}, QR = function(e, n, r, s, a) {
  if (Ze(e) && (e = Po(e, a, n, r, s)), !Fn(e) || e.style && e.nodeType || _t(e) || Vx(e))
    return lt(e) ? Po(e, a, n, r, s) : e;
  var l = {}, c;
  for (c in e)
    l[c] = Po(e[c], a, n, r, s);
  return l;
}, gw = function(e, n, r, s, a, l) {
  var c, f, m, g;
  if (Ht[e] && (c = new Ht[e]()).init(a, c.rawVars ? n[e] : QR(n[e], s, a, l, r), r, s, l) !== !1 && (r._pt = f = new Ft(r._pt, a, e, 0, 1, c.render, c, 0, c.priority), r !== Xi))
    for (m = r._ptLookup[r._targets.indexOf(a)], g = c._props.length; g--; )
      m[c._props[g]] = f;
  return c;
}, wr, ph, Rp = function t(e, n, r) {
  var s = e.vars, a = s.ease, l = s.startAt, c = s.immediateRender, f = s.lazy, m = s.onUpdate, g = s.runBackwards, d = s.yoyoEase, p = s.keyframes, v = s.autoRevert, w = e._dur, x = e._startAt, T = e._targets, A = e.parent, b = A && A.data === "nested" ? A.vars.targets : T, C = e._overwrite === "auto" && !xp, M = e.timeline, P = s.easeReverse || d, z, O, F, L, U, G, te, ae, le, me, ee, de, W;
  if (M && (!p || !a) && (a = "none"), e._ease = li(a, Lo.ease), e._rEase = P && (li(P) || e._ease), e._from = !M && !!s.runBackwards, e._from && (e.ratio = 1), !M || p && !s.stagger) {
    if (ae = T[0] ? oi(T[0]).harness : 0, de = ae && s[ae.prop], z = vu(s, bp), x && (x._zTime < 0 && x.progress(1), n < 0 && g && c && !v ? x.render(-1, !0) : x.revert(g && w ? Wl : AR), x._lazy = 0), l) {
      if (Mr(e._startAt = Xe.set(T, qt({
        data: "isStart",
        overwrite: !1,
        parent: A,
        immediateRender: !0,
        lazy: !x && Dt(f),
        startAt: null,
        delay: 0,
        onUpdate: m && function() {
          return Zt(e, "onUpdate");
        },
        stagger: 0
      }, l))), e._startAt._dp = 0, e._startAt._sat = e, n < 0 && (ht || !c && !v) && e._startAt.revert(Wl), c && w && n <= 0 && r <= 0) {
        n && (e._zTime = n);
        return;
      }
    } else if (g && w && !x) {
      if (n && (c = !1), F = qt({
        overwrite: !1,
        data: "isFromStart",
        //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
        lazy: c && !x && Dt(f),
        immediateRender: c,
        //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
        stagger: 0,
        parent: A
        //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
      }, z), de && (F[ae.prop] = de), Mr(e._startAt = Xe.set(T, F)), e._startAt._dp = 0, e._startAt._sat = e, n < 0 && (ht ? e._startAt.revert(Wl) : e._startAt.render(-1, !0)), e._zTime = n, !c)
        t(e._startAt, Ce, Ce);
      else if (!n)
        return;
    }
    for (e._pt = e._ptCache = 0, f = w && Dt(f) || f && !w, O = 0; O < T.length; O++) {
      if (U = T[O], te = U._gsap || Pp(T)[O]._gsap, e._ptLookup[O] = me = {}, lh[te.id] && br.length && yu(), ee = b === T ? O : b.indexOf(U), ae && (le = new ae()).init(U, de || z, e, ee, b) !== !1 && (e._pt = L = new Ft(e._pt, U, le.name, 0, 1, le.render, le, 0, le.priority), le._props.forEach(function(J) {
        me[J] = L;
      }), le.priority && (G = 1)), !ae || de)
        for (F in z)
          Ht[F] && (le = gw(F, z, e, ee, U, b)) ? le.priority && (G = 1) : me[F] = L = Mp.call(e, U, F, "get", z[F], ee, b, 0, s.stringFilter);
      e._op && e._op[O] && e.kill(U, e._op[O]), C && e._pt && (wr = e, Be.killTweensOf(U, me, e.globalTime(n)), W = !e.parent, wr = 0), e._pt && f && (lh[te.id] = 1);
    }
    G && ww(e), e._onInit && e._onInit(e);
  }
  e._onUpdate = m, e._initted = (!e._op || e._pt) && !W, p && n <= 0 && M.render(an, !0, !0);
}, XR = function(e, n, r, s, a, l, c, f) {
  var m = (e._pt && e._ptCache || (e._ptCache = {}))[n], g, d, p, v;
  if (!m)
    for (m = e._ptCache[n] = [], p = e._ptLookup, v = e._targets.length; v--; ) {
      if (g = p[v][n], g && g.d && g.d._pt)
        for (g = g.d._pt; g && g.p !== n && g.fp !== n; )
          g = g._next;
      if (!g)
        return ph = 1, e.vars[n] = "+=0", Rp(e, c), ph = 0, f ? zo(n + " not eligible for reset. Try splitting into individual properties") : 1;
      m.push(g);
    }
  for (v = m.length; v--; )
    d = m[v], g = d._pt || d, g.s = (s || s === 0) && !a ? s : g.s + (s || 0) + l * g.c, g.c = r - g.s, d.e && (d.e = Ye(r) + vt(d.e)), d.b && (d.b = g.s + vt(d.b));
}, JR = function(e, n) {
  var r = e[0] ? oi(e[0]).harness : 0, s = r && r.aliases, a, l, c, f;
  if (!s)
    return n;
  a = cs({}, n);
  for (l in s)
    if (l in a)
      for (f = s[l].split(","), c = f.length; c--; )
        a[f[c]] = a[l];
  return a;
}, eN = function(e, n, r, s) {
  var a = n.ease || s || "power1.inOut", l, c;
  if (_t(n))
    c = r[e] || (r[e] = []), n.forEach(function(f, m) {
      return c.push({
        t: m / (n.length - 1) * 100,
        v: f,
        e: a
      });
    });
  else
    for (l in n)
      c = r[l] || (r[l] = []), l === "ease" || c.push({
        t: parseFloat(e),
        v: n[l],
        e: a
      });
}, Po = function(e, n, r, s, a) {
  return Ze(e) ? e.call(n, r, s, a) : lt(e) && ~e.indexOf("random(") ? Vo(e) : e;
}, yw = Cp + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", vw = {};
jt(yw + ",id,stagger,delay,duration,paused,scrollTrigger", function(t) {
  return vw[t] = 1;
});
var Xe = /* @__PURE__ */ (function(t) {
  zx(e, t);
  function e(r, s, a, l) {
    var c;
    typeof s == "number" && (a.duration = s, s = a, a = null), c = t.call(this, l ? s : bo(s)) || this;
    var f = c.vars, m = f.duration, g = f.delay, d = f.immediateRender, p = f.stagger, v = f.overwrite, w = f.keyframes, x = f.defaults, T = f.scrollTrigger, A = s.parent || Be, b = (_t(r) || Vx(r) ? qn(r[0]) : "length" in s) ? [r] : ln(r), C, M, P, z, O, F, L, U;
    if (c._targets = b.length ? Pp(b) : zo("GSAP target " + r + " not found. https://gsap.com", !Kt.nullTargetWarn) || [], c._ptLookup = [], c._overwrite = v, w || p || bl(m) || bl(g)) {
      s = c.vars;
      var G = s.easeReverse || s.yoyoEase;
      if (C = c.timeline = new Nt({
        data: "nested",
        defaults: x || {},
        targets: A && A.data === "nested" ? A.vars.targets : b
      }), C.kill(), C.parent = C._dp = Zn(c), C._start = 0, p || bl(m) || bl(g)) {
        if (z = b.length, L = p && iw(p), Fn(p))
          for (O in p)
            ~yw.indexOf(O) && (U || (U = {}), U[O] = p[O]);
        for (M = 0; M < z; M++)
          P = vu(s, vw), P.stagger = 0, G && (P.easeReverse = G), U && cs(P, U), F = b[M], P.duration = +Po(m, Zn(c), M, F, b), P.delay = (+Po(g, Zn(c), M, F, b) || 0) - c._delay, !p && z === 1 && P.delay && (c._delay = g = P.delay, c._start += g, P.delay = 0), C.to(F, P, L ? L(M, F, b) : 0), C._ease = Se.none;
        C.duration() ? m = g = 0 : c.timeline = 0;
      } else if (w) {
        bo(qt(C.vars.defaults, {
          ease: "none"
        })), C._ease = li(w.ease || s.ease || "none");
        var te = 0, ae, le, me;
        if (_t(w))
          w.forEach(function(ee) {
            return C.to(b, ee, ">");
          }), C.duration();
        else {
          P = {};
          for (O in w)
            O === "ease" || O === "easeEach" || eN(O, w[O], P, w.easeEach);
          for (O in P)
            for (ae = P[O].sort(function(ee, de) {
              return ee.t - de.t;
            }), te = 0, M = 0; M < ae.length; M++)
              le = ae[M], me = {
                ease: le.e,
                duration: (le.t - (M ? ae[M - 1].t : 0)) / 100 * m
              }, me[O] = le.v, C.to(b, me, te), te += me.duration;
          C.duration() < m && C.to({}, {
            duration: m - C.duration()
          });
        }
      }
      m || c.duration(m = C.duration());
    } else
      c.timeline = 0;
    return v === !0 && !xp && (wr = Zn(c), Be.killTweensOf(b), wr = 0), Rn(A, Zn(c), a), s.reversed && c.reverse(), s.paused && c.paused(!0), (d || !m && !w && c._start === Ve(A._time) && Dt(d) && MR(Zn(c)) && A.data !== "nested") && (c._tTime = -Ce, c.render(Math.max(0, -g) || 0)), T && ew(Zn(c), T), c;
  }
  var n = e.prototype;
  return n.render = function(s, a, l) {
    var c = this._time, f = this._tDur, m = this._dur, g = s < 0, d = s > f - Ce && !g ? f : s < Ce ? 0 : s, p, v, w, x, T, A, b, C;
    if (!m)
      NR(this, s, a, l);
    else if (d !== this._tTime || !s || l || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== g || this._lazy) {
      if (p = d, C = this.timeline, this._repeat) {
        if (x = m + this._rDelay, this._repeat < -1 && g)
          return this.totalTime(x * 100 + s, a, l);
        if (p = Ve(d % x), d === f ? (w = this._repeat, p = m) : (T = Ve(d / x), w = ~~T, w && w === T ? (p = m, w--) : p > m && (p = m)), A = this._yoyo && w & 1, A && (p = m - p), T = ds(this._tTime, x), p === c && !l && this._initted && w === T)
          return this._tTime = d, this;
        w !== T && this.vars.repeatRefresh && !A && !this._lock && p !== x && this._initted && (this._lock = l = 1, this.render(Ve(x * w), !0).invalidate()._lock = 0);
      }
      if (!this._initted) {
        if (tw(this, g ? s : p, l, a, d))
          return this._tTime = 0, this;
        if (c !== this._time && !(l && this.vars.repeatRefresh && w !== T))
          return this;
        if (m !== this._dur)
          return this.render(s, a, l);
      }
      if (this._rEase) {
        var M = p < c;
        if (M !== this._inv) {
          var P = M ? c : m - c;
          this._inv = M, this._from && (this.ratio = 1 - this.ratio), this._invRatio = this.ratio, this._invTime = c, this._invRecip = P ? (M ? -1 : 1) / P : 0, this._invScale = M ? -this.ratio : 1 - this.ratio, this._invEase = M ? this._rEase : this._ease;
        }
        this.ratio = b = this._invRatio + this._invScale * this._invEase((p - this._invTime) * this._invRecip);
      } else
        this.ratio = b = this._ease(p / m);
      if (this._from && (this.ratio = b = 1 - b), this._tTime = d, this._time = p, !this._act && this._ts && (this._act = 1, this._lazy = 0), !c && d && !a && !T && (Zt(this, "onStart"), this._tTime !== d))
        return this;
      for (v = this._pt; v; )
        v.r(b, v.d), v = v._next;
      C && C.render(s < 0 ? s : C._dur * C._ease(p / this._dur), a, l) || this._startAt && (this._zTime = s), this._onUpdate && !a && (g && uh(this, s, a, l), Zt(this, "onUpdate")), this._repeat && w !== T && this.vars.onRepeat && !a && this.parent && Zt(this, "onRepeat"), (d === this._tDur || !d) && this._tTime === d && (g && !this._onUpdate && uh(this, s, !0, !0), (s || !m) && (d === this._tDur && this._ts > 0 || !d && this._ts < 0) && Mr(this, 1), !a && !(g && !c) && (d || c || A) && (Zt(this, d === f ? "onComplete" : "onReverseComplete", !0), this._prom && !(d < f && this.timeScale() > 0) && this._prom()));
    }
    return this;
  }, n.targets = function() {
    return this._targets;
  }, n.invalidate = function(s) {
    return (!s || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(s), t.prototype.invalidate.call(this, s);
  }, n.resetTo = function(s, a, l, c, f) {
    Bo || Wt.wake(), this._ts || this.play();
    var m = Math.min(this._dur, (this._dp._time - this._start) * this._ts), g;
    return this._initted || Rp(this, m), g = this._ease(m / this._dur), XR(this, s, a, l, c, g, m, f) ? this.resetTo(s, a, l, c, 1) : (zu(this, 0), this.parent || Xx(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
  }, n.kill = function(s, a) {
    if (a === void 0 && (a = "all"), !s && (!a || a === "all"))
      return this._lazy = this._pt = 0, this.parent ? yo(this) : this.scrollTrigger && this.scrollTrigger.kill(!!ht), this;
    if (this.timeline) {
      var l = this.timeline.totalDuration();
      return this.timeline.killTweensOf(s, a, wr && wr.vars.overwrite !== !0)._first || yo(this), this.parent && l !== this.timeline.totalDuration() && fs(this, this._dur * this.timeline._tDur / l, 0, 1), this;
    }
    var c = this._targets, f = s ? ln(s) : c, m = this._ptLookup, g = this._pt, d, p, v, w, x, T, A;
    if ((!a || a === "all") && PR(c, f))
      return a === "all" && (this._pt = 0), yo(this);
    for (d = this._op = this._op || [], a !== "all" && (lt(a) && (x = {}, jt(a, function(b) {
      return x[b] = 1;
    }), a = x), a = JR(c, a)), A = c.length; A--; )
      if (~f.indexOf(c[A])) {
        p = m[A], a === "all" ? (d[A] = a, w = p, v = {}) : (v = d[A] = d[A] || {}, w = a);
        for (x in w)
          T = p && p[x], T && ((!("kill" in T.d) || T.d.kill(x) === !0) && Ou(this, T, "_pt"), delete p[x]), v !== "all" && (v[x] = 1);
      }
    return this._initted && !this._pt && g && yo(this), this;
  }, e.to = function(s, a) {
    return new e(s, a, arguments[2]);
  }, e.from = function(s, a) {
    return Co(1, arguments);
  }, e.delayedCall = function(s, a, l, c) {
    return new e(a, 0, {
      immediateRender: !1,
      lazy: !1,
      overwrite: !1,
      delay: s,
      onComplete: a,
      onReverseComplete: a,
      onCompleteParams: l,
      onReverseCompleteParams: l,
      callbackScope: c
    });
  }, e.fromTo = function(s, a, l) {
    return Co(2, arguments);
  }, e.set = function(s, a) {
    return a.duration = 0, a.repeatDelay || (a.repeat = 0), new e(s, a);
  }, e.killTweensOf = function(s, a, l) {
    return Be.killTweensOf(s, a, l);
  }, e;
})(Uo);
qt(Xe.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
});
jt("staggerTo,staggerFrom,staggerFromTo", function(t) {
  Xe[t] = function() {
    var e = new Nt(), n = dh.call(arguments, 0);
    return n.splice(t === "staggerFromTo" ? 5 : 4, 0, 0), e[t].apply(e, n);
  };
});
var Np = function(e, n, r) {
  return e[n] = r;
}, _w = function(e, n, r) {
  return e[n](r);
}, tN = function(e, n, r, s) {
  return e[n](s.fp, r);
}, nN = function(e, n, r) {
  return e.setAttribute(n, r);
}, Ip = function(e, n) {
  return Ze(e[n]) ? _w : wp(e[n]) && e.setAttribute ? nN : Np;
}, Sw = function(e, n) {
  return n.set(n.t, n.p, Math.round((n.s + n.c * e) * 1e6) / 1e6, n);
}, rN = function(e, n) {
  return n.set(n.t, n.p, !!(n.s + n.c * e), n);
}, xw = function(e, n) {
  var r = n._pt, s = "";
  if (!e && n.b)
    s = n.b;
  else if (e === 1 && n.e)
    s = n.e;
  else {
    for (; r; )
      s = r.p + (r.m ? r.m(r.s + r.c * e) : Math.round((r.s + r.c * e) * 1e4) / 1e4) + s, r = r._next;
    s += n.c;
  }
  n.set(n.t, n.p, s, n);
}, Dp = function(e, n) {
  for (var r = n._pt; r; )
    r.r(e, r.d), r = r._next;
}, iN = function(e, n, r, s) {
  for (var a = this._pt, l; a; )
    l = a._next, a.p === s && a.modifier(e, n, r), a = l;
}, sN = function(e) {
  for (var n = this._pt, r, s; n; )
    s = n._next, n.p === e && !n.op || n.op === e ? Ou(this, n, "_pt") : n.dep || (r = 1), n = s;
  return !r;
}, oN = function(e, n, r, s) {
  s.mSet(e, n, s.m.call(s.tween, r, s.mt), s);
}, ww = function(e) {
  for (var n = e._pt, r, s, a, l; n; ) {
    for (r = n._next, s = a; s && s.pr > n.pr; )
      s = s._next;
    (n._prev = s ? s._prev : l) ? n._prev._next = n : a = n, (n._next = s) ? s._prev = n : l = n, n = r;
  }
  e._pt = a;
}, Ft = /* @__PURE__ */ (function() {
  function t(n, r, s, a, l, c, f, m, g) {
    this.t = r, this.s = a, this.c = l, this.p = s, this.r = c || Sw, this.d = f || this, this.set = m || Np, this.pr = g || 0, this._next = n, n && (n._prev = this);
  }
  var e = t.prototype;
  return e.modifier = function(r, s, a) {
    this.mSet = this.mSet || this.set, this.set = oN, this.m = r, this.mt = a, this.tween = s;
  }, t;
})();
jt(Cp + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(t) {
  return bp[t] = 1;
});
Yt.TweenMax = Yt.TweenLite = Xe;
Yt.TimelineLite = Yt.TimelineMax = Nt;
Be = new Nt({
  sortChildren: !1,
  defaults: Lo,
  autoRemoveChildren: !0,
  id: "root",
  smoothChildTiming: !0
});
Kt.stringFilter = hw;
var ui = [], Gl = {}, aN = [], W0 = 0, lN = 0, pf = function(e) {
  return (Gl[e] || aN).map(function(n) {
    return n();
  });
}, mh = function() {
  var e = Date.now(), n = [];
  e - W0 > 2 && (pf("matchMediaInit"), ui.forEach(function(r) {
    var s = r.queries, a = r.conditions, l, c, f, m;
    for (c in s)
      l = En.matchMedia(s[c]).matches, l && (f = 1), l !== a[c] && (a[c] = l, m = 1);
    m && (r.revert(), f && n.push(r));
  }), pf("matchMediaRevert"), n.forEach(function(r) {
    return r.onMatch(r, function(s) {
      return r.add(null, s);
    });
  }), W0 = e, pf("matchMedia"));
}, Tw = /* @__PURE__ */ (function() {
  function t(n, r) {
    this.selector = r && fh(r), this.data = [], this._r = [], this.isReverted = !1, this.id = lN++, n && this.add(n);
  }
  var e = t.prototype;
  return e.add = function(r, s, a) {
    Ze(r) && (a = s, s = r, r = Ze);
    var l = this, c = function() {
      var m = Fe, g = l.selector, d;
      return m && m !== l && m.data.push(l), a && (l.selector = fh(a)), Fe = l, d = s.apply(l, arguments), Ze(d) && l._r.push(d), Fe = m, l.selector = g, l.isReverted = !1, d;
    };
    return l.last = c, r === Ze ? c(l, function(f) {
      return l.add(null, f);
    }) : r ? l[r] = c : c;
  }, e.ignore = function(r) {
    var s = Fe;
    Fe = null, r(this), Fe = s;
  }, e.getTweens = function() {
    var r = [];
    return this.data.forEach(function(s) {
      return s instanceof t ? r.push.apply(r, s.getTweens()) : s instanceof Xe && !(s.parent && s.parent.data === "nested") && r.push(s);
    }), r;
  }, e.clear = function() {
    this._r.length = this.data.length = 0;
  }, e.kill = function(r, s) {
    var a = this;
    if (r ? (function() {
      for (var c = a.getTweens(), f = a.data.length, m; f--; )
        m = a.data[f], m.data === "isFlip" && (m.revert(), m.getChildren(!0, !0, !1).forEach(function(g) {
          return c.splice(c.indexOf(g), 1);
        }));
      for (c.map(function(g) {
        return {
          g: g._dur || g._delay || g._sat && !g._sat.vars.immediateRender ? g.globalTime(0) : -1 / 0,
          t: g
        };
      }).sort(function(g, d) {
        return d.g - g.g || -1 / 0;
      }).forEach(function(g) {
        return g.t.revert(r);
      }), f = a.data.length; f--; )
        m = a.data[f], m instanceof Nt ? m.data !== "nested" && (m.scrollTrigger && m.scrollTrigger.revert(), m.kill()) : !(m instanceof Xe) && m.revert && m.revert(r);
      a._r.forEach(function(g) {
        return g(r, a);
      }), a.isReverted = !0;
    })() : this.data.forEach(function(c) {
      return c.kill && c.kill();
    }), this.clear(), s)
      for (var l = ui.length; l--; )
        ui[l].id === this.id && ui.splice(l, 1);
  }, e.revert = function(r) {
    this.kill(r || {});
  }, t;
})(), uN = /* @__PURE__ */ (function() {
  function t(n) {
    this.contexts = [], this.scope = n, Fe && Fe.data.push(this);
  }
  var e = t.prototype;
  return e.add = function(r, s, a) {
    Fn(r) || (r = {
      matches: r
    });
    var l = new Tw(0, a || this.scope), c = l.conditions = {}, f, m, g;
    Fe && !l.selector && (l.selector = Fe.selector), this.contexts.push(l), s = l.add("onMatch", s), l.queries = r;
    for (m in r)
      m === "all" ? g = 1 : (f = En.matchMedia(r[m]), f && (ui.indexOf(l) < 0 && ui.push(l), (c[m] = f.matches) && (g = 1), f.addListener ? f.addListener(mh) : f.addEventListener("change", mh)));
    return g && s(l, function(d) {
      return l.add(null, d);
    }), this;
  }, e.revert = function(r) {
    this.kill(r || {});
  }, e.kill = function(r) {
    this.contexts.forEach(function(s) {
      return s.kill(r, !0);
    });
  }, t;
})(), Su = {
  registerPlugin: function() {
    for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
      n[r] = arguments[r];
    n.forEach(function(s) {
      return cw(s);
    });
  },
  timeline: function(e) {
    return new Nt(e);
  },
  getTweensOf: function(e, n) {
    return Be.getTweensOf(e, n);
  },
  getProperty: function(e, n, r, s) {
    lt(e) && (e = ln(e)[0]);
    var a = oi(e || {}).get, l = r ? Qx : qx;
    return r === "native" && (r = ""), e && (n ? l((Ht[n] && Ht[n].get || a)(e, n, r, s)) : function(c, f, m) {
      return l((Ht[c] && Ht[c].get || a)(e, c, f, m));
    });
  },
  quickSetter: function(e, n, r) {
    if (e = ln(e), e.length > 1) {
      var s = e.map(function(g) {
        return Lt.quickSetter(g, n, r);
      }), a = s.length;
      return function(g) {
        for (var d = a; d--; )
          s[d](g);
      };
    }
    e = e[0] || {};
    var l = Ht[n], c = oi(e), f = c.harness && (c.harness.aliases || {})[n] || n, m = l ? function(g) {
      var d = new l();
      Xi._pt = 0, d.init(e, r ? g + r : g, Xi, 0, [e]), d.render(1, d), Xi._pt && Dp(1, Xi);
    } : c.set(e, f);
    return l ? m : function(g) {
      return m(e, f, r ? g + r : g, c, 1);
    };
  },
  quickTo: function(e, n, r) {
    var s, a = Lt.to(e, qt((s = {}, s[n] = "+=0.1", s.paused = !0, s.stagger = 0, s), r || {})), l = function(f, m, g) {
      return a.resetTo(n, f, m, g);
    };
    return l.tween = a, l;
  },
  isTweening: function(e) {
    return Be.getTweensOf(e, !0).length > 0;
  },
  defaults: function(e) {
    return e && e.ease && (e.ease = li(e.ease, Lo.ease)), $0(Lo, e || {});
  },
  config: function(e) {
    return $0(Kt, e || {});
  },
  registerEffect: function(e) {
    var n = e.name, r = e.effect, s = e.plugins, a = e.defaults, l = e.extendTimeline;
    (s || "").split(",").forEach(function(c) {
      return c && !Ht[c] && !Yt[c] && zo(n + " effect requires " + c + " plugin.");
    }), cf[n] = function(c, f, m) {
      return r(ln(c), qt(f || {}, a), m);
    }, l && (Nt.prototype[n] = function(c, f, m) {
      return this.add(cf[n](c, Fn(f) ? f : (m = f) && {}, this), m);
    });
  },
  registerEase: function(e, n) {
    Se[e] = li(n);
  },
  parseEase: function(e, n) {
    return arguments.length ? li(e, n) : Se;
  },
  getById: function(e) {
    return Be.getById(e);
  },
  exportRoot: function(e, n) {
    e === void 0 && (e = {});
    var r = new Nt(e), s, a;
    for (r.smoothChildTiming = Dt(e.smoothChildTiming), Be.remove(r), r._dp = 0, r._time = r._tTime = Be._time, s = Be._first; s; )
      a = s._next, (n || !(!s._dur && s instanceof Xe && s.vars.onComplete === s._targets[0])) && Rn(r, s, s._start - s._delay), s = a;
    return Rn(Be, r, 0), r;
  },
  context: function(e, n) {
    return e ? new Tw(e, n) : Fe;
  },
  matchMedia: function(e) {
    return new uN(e);
  },
  matchMediaRefresh: function() {
    return ui.forEach(function(e) {
      var n = e.conditions, r, s;
      for (s in n)
        n[s] && (n[s] = !1, r = 1);
      r && e.revert();
    }) || mh();
  },
  addEventListener: function(e, n) {
    var r = Gl[e] || (Gl[e] = []);
    ~r.indexOf(n) || r.push(n);
  },
  removeEventListener: function(e, n) {
    var r = Gl[e], s = r && r.indexOf(n);
    s >= 0 && r.splice(s, 1);
  },
  utils: {
    wrap: $R,
    wrapYoyo: VR,
    distribute: iw,
    random: ow,
    snap: sw,
    normalize: zR,
    getUnit: vt,
    clamp: jR,
    splitColor: dw,
    toArray: ln,
    selector: fh,
    mapRange: lw,
    pipe: OR,
    unitize: LR,
    interpolate: BR,
    shuffle: rw
  },
  install: Wx,
  effects: cf,
  ticker: Wt,
  updateRoot: Nt.updateRoot,
  plugins: Ht,
  globalTimeline: Be,
  core: {
    PropTween: Ft,
    globals: Zx,
    Tween: Xe,
    Timeline: Nt,
    Animation: Uo,
    getCache: oi,
    _removeLinkedListItem: Ou,
    reverting: function() {
      return ht;
    },
    context: function(e) {
      return e && Fe && (Fe.data.push(e), e._ctx = Fe), Fe;
    },
    suppressOverwrites: function(e) {
      return xp = e;
    }
  }
};
jt("to,from,fromTo,delayedCall,set,killTweensOf", function(t) {
  return Su[t] = Xe[t];
});
Wt.add(Nt.updateRoot);
Xi = Su.to({}, {
  duration: 0
});
var cN = function(e, n) {
  for (var r = e._pt; r && r.p !== n && r.op !== n && r.fp !== n; )
    r = r._next;
  return r;
}, dN = function(e, n) {
  var r = e._targets, s, a, l;
  for (s in n)
    for (a = r.length; a--; )
      l = e._ptLookup[a][s], l && (l = l.d) && (l._pt && (l = cN(l, s)), l && l.modifier && l.modifier(n[s], e, r[a], s));
}, mf = function(e, n) {
  return {
    name: e,
    headless: 1,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function(s, a, l) {
      l._onInit = function(c) {
        var f, m;
        if (lt(a) && (f = {}, jt(a, function(g) {
          return f[g] = 1;
        }), a = f), n) {
          f = {};
          for (m in a)
            f[m] = n(a[m]);
          a = f;
        }
        dN(c, a);
      };
    }
  };
}, Lt = Su.registerPlugin({
  name: "attr",
  init: function(e, n, r, s, a) {
    var l, c, f;
    this.tween = r;
    for (l in n)
      f = e.getAttribute(l) || "", c = this.add(e, "setAttribute", (f || 0) + "", n[l], s, a, 0, 0, l), c.op = l, c.b = f, this._props.push(l);
  },
  render: function(e, n) {
    for (var r = n._pt; r; )
      ht ? r.set(r.t, r.p, r.b, r) : r.r(e, r.d), r = r._next;
  }
}, {
  name: "endArray",
  headless: 1,
  init: function(e, n) {
    for (var r = n.length; r--; )
      this.add(e, r, e[r] || 0, n[r], 0, 0, 0, 0, 0, 1);
  }
}, mf("roundProps", hh), mf("modifiers"), mf("snap", sw)) || Su;
Xe.version = Nt.version = Lt.version = "3.15.0";
Hx = 1;
Tp() && hs();
Se.Power0;
Se.Power1;
Se.Power2;
Se.Power3;
Se.Power4;
Se.Linear;
Se.Quad;
Se.Cubic;
Se.Quart;
Se.Quint;
Se.Strong;
Se.Elastic;
Se.Back;
Se.SteppedEase;
Se.Bounce;
Se.Sine;
Se.Expo;
Se.Circ;
/*!
 * CSSPlugin 3.15.0
 * https://gsap.com
 *
 * Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/
var Z0, Tr, ns, jp, ri, G0, Fp, fN = function() {
  return typeof window < "u";
}, Qn = {}, Jr = 180 / Math.PI, rs = Math.PI / 180, $i = Math.atan2, K0 = 1e8, Op = /([A-Z])/g, hN = /(left|right|width|margin|padding|x)/i, pN = /[\s,\(]\S/, In = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
}, gh = function(e, n) {
  return n.set(n.t, n.p, Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u, n);
}, mN = function(e, n) {
  return n.set(n.t, n.p, e === 1 ? n.e : Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u, n);
}, gN = function(e, n) {
  return n.set(n.t, n.p, e ? Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u : n.b, n);
}, yN = function(e, n) {
  return n.set(n.t, n.p, e === 1 ? n.e : e ? Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u : n.b, n);
}, vN = function(e, n) {
  var r = n.s + n.c * e;
  n.set(n.t, n.p, ~~(r + (r < 0 ? -0.5 : 0.5)) + n.u, n);
}, Aw = function(e, n) {
  return n.set(n.t, n.p, e ? n.e : n.b, n);
}, kw = function(e, n) {
  return n.set(n.t, n.p, e !== 1 ? n.b : n.e, n);
}, _N = function(e, n, r) {
  return e.style[n] = r;
}, SN = function(e, n, r) {
  return e.style.setProperty(n, r);
}, xN = function(e, n, r) {
  return e._gsap[n] = r;
}, wN = function(e, n, r) {
  return e._gsap.scaleX = e._gsap.scaleY = r;
}, TN = function(e, n, r, s, a) {
  var l = e._gsap;
  l.scaleX = l.scaleY = r, l.renderTransform(a, l);
}, AN = function(e, n, r, s, a) {
  var l = e._gsap;
  l[n] = r, l.renderTransform(a, l);
}, Ue = "transform", Ot = Ue + "Origin", kN = function t(e, n) {
  var r = this, s = this.target, a = s.style, l = s._gsap;
  if (e in Qn && a) {
    if (this.tfm = this.tfm || {}, e !== "transform")
      e = In[e] || e, ~e.indexOf(",") ? e.split(",").forEach(function(c) {
        return r.tfm[c] = Gn(s, c);
      }) : this.tfm[e] = l.x ? l[e] : Gn(s, e), e === Ot && (this.tfm.zOrigin = l.zOrigin);
    else
      return In.transform.split(",").forEach(function(c) {
        return t.call(r, c, n);
      });
    if (this.props.indexOf(Ue) >= 0)
      return;
    l.svg && (this.svgo = s.getAttribute("data-svg-origin"), this.props.push(Ot, n, "")), e = Ue;
  }
  (a || n) && this.props.push(e, n, a[e]);
}, bw = function(e) {
  e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, bN = function() {
  var e = this.props, n = this.target, r = n.style, s = n._gsap, a, l;
  for (a = 0; a < e.length; a += 3)
    e[a + 1] ? e[a + 1] === 2 ? n[e[a]](e[a + 2]) : n[e[a]] = e[a + 2] : e[a + 2] ? r[e[a]] = e[a + 2] : r.removeProperty(e[a].substr(0, 2) === "--" ? e[a] : e[a].replace(Op, "-$1").toLowerCase());
  if (this.tfm) {
    for (l in this.tfm)
      s[l] = this.tfm[l];
    s.svg && (s.renderTransform(), n.setAttribute("data-svg-origin", this.svgo || "")), a = Fp(), (!a || !a.isStart) && !r[Ue] && (bw(r), s.zOrigin && r[Ot] && (r[Ot] += " " + s.zOrigin + "px", s.zOrigin = 0, s.renderTransform()), s.uncache = 1);
  }
}, Cw = function(e, n) {
  var r = {
    target: e,
    props: [],
    revert: bN,
    save: kN
  };
  return e._gsap || Lt.core.getCache(e), n && e.style && e.nodeType && n.split(",").forEach(function(s) {
    return r.save(s);
  }), r;
}, Pw, yh = function(e, n) {
  var r = Tr.createElementNS ? Tr.createElementNS((n || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : Tr.createElement(e);
  return r && r.style ? r : Tr.createElement(e);
}, Gt = function t(e, n, r) {
  var s = getComputedStyle(e);
  return s[n] || s.getPropertyValue(n.replace(Op, "-$1").toLowerCase()) || s.getPropertyValue(n) || !r && t(e, ps(n) || n, 1) || "";
}, Y0 = "O,Moz,ms,Ms,Webkit".split(","), ps = function(e, n, r) {
  var s = n || ri, a = s.style, l = 5;
  if (e in a && !r)
    return e;
  for (e = e.charAt(0).toUpperCase() + e.substr(1); l-- && !(Y0[l] + e in a); )
    ;
  return l < 0 ? null : (l === 3 ? "ms" : l >= 0 ? Y0[l] : "") + e;
}, vh = function() {
  fN() && window.document && (Z0 = window, Tr = Z0.document, ns = Tr.documentElement, ri = yh("div") || {
    style: {}
  }, yh("div"), Ue = ps(Ue), Ot = Ue + "Origin", ri.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", Pw = !!ps("perspective"), Fp = Lt.core.reverting, jp = 1);
}, q0 = function(e) {
  var n = e.ownerSVGElement, r = yh("svg", n && n.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), s = e.cloneNode(!0), a;
  s.style.display = "block", r.appendChild(s), ns.appendChild(r);
  try {
    a = s.getBBox();
  } catch {
  }
  return r.removeChild(s), ns.removeChild(r), a;
}, Q0 = function(e, n) {
  for (var r = n.length; r--; )
    if (e.hasAttribute(n[r]))
      return e.getAttribute(n[r]);
}, Ew = function(e) {
  var n, r;
  try {
    n = e.getBBox();
  } catch {
    n = q0(e), r = 1;
  }
  return n && (n.width || n.height) || r || (n = q0(e)), n && !n.width && !n.x && !n.y ? {
    x: +Q0(e, ["x", "cx", "x1"]) || 0,
    y: +Q0(e, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : n;
}, Mw = function(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && Ew(e));
}, Rr = function(e, n) {
  if (n) {
    var r = e.style, s;
    n in Qn && n !== Ot && (n = Ue), r.removeProperty ? (s = n.substr(0, 2), (s === "ms" || n.substr(0, 6) === "webkit") && (n = "-" + n), r.removeProperty(s === "--" ? n : n.replace(Op, "-$1").toLowerCase())) : r.removeAttribute(n);
  }
}, Ar = function(e, n, r, s, a, l) {
  var c = new Ft(e._pt, n, r, 0, 1, l ? kw : Aw);
  return e._pt = c, c.b = s, c.e = a, e._props.push(r), c;
}, X0 = {
  deg: 1,
  rad: 1,
  turn: 1
}, CN = {
  grid: 1,
  flex: 1
}, Nr = function t(e, n, r, s) {
  var a = parseFloat(r) || 0, l = (r + "").trim().substr((a + "").length) || "px", c = ri.style, f = hN.test(n), m = e.tagName.toLowerCase() === "svg", g = (m ? "client" : "offset") + (f ? "Width" : "Height"), d = 100, p = s === "px", v = s === "%", w, x, T, A;
  if (s === l || !a || X0[s] || X0[l])
    return a;
  if (l !== "px" && !p && (a = t(e, n, r, "px")), A = e.getCTM && Mw(e), (v || l === "%") && (Qn[n] || ~n.indexOf("adius")))
    return w = A ? e.getBBox()[f ? "width" : "height"] : e[g], Ye(v ? a / w * d : a / 100 * w);
  if (c[f ? "width" : "height"] = d + (p ? l : s), x = s !== "rem" && ~n.indexOf("adius") || s === "em" && e.appendChild && !m ? e : e.parentNode, A && (x = (e.ownerSVGElement || {}).parentNode), (!x || x === Tr || !x.appendChild) && (x = Tr.body), T = x._gsap, T && v && T.width && f && T.time === Wt.time && !T.uncache)
    return Ye(a / T.width * d);
  if (v && (n === "height" || n === "width")) {
    var b = e.style[n];
    e.style[n] = d + s, w = e[g], b ? e.style[n] = b : Rr(e, n);
  } else
    (v || l === "%") && !CN[Gt(x, "display")] && (c.position = Gt(e, "position")), x === e && (c.position = "static"), x.appendChild(ri), w = ri[g], x.removeChild(ri), c.position = "absolute";
  return f && v && (T = oi(x), T.time = Wt.time, T.width = x[g]), Ye(p ? w * a / d : w && a ? d / w * a : 0);
}, Gn = function(e, n, r, s) {
  var a;
  return jp || vh(), n in In && n !== "transform" && (n = In[n], ~n.indexOf(",") && (n = n.split(",")[0])), Qn[n] && n !== "transform" ? (a = Wo(e, s), a = n !== "transformOrigin" ? a[n] : a.svg ? a.origin : wu(Gt(e, Ot)) + " " + a.zOrigin + "px") : (a = e.style[n], (!a || a === "auto" || s || ~(a + "").indexOf("calc(")) && (a = xu[n] && xu[n](e, n, r) || Gt(e, n) || Kx(e, n) || (n === "opacity" ? 1 : 0))), r && !~(a + "").trim().indexOf(" ") ? Nr(e, n, a, r) + r : a;
}, PN = function(e, n, r, s) {
  if (!r || r === "none") {
    var a = ps(n, e, 1), l = a && Gt(e, a, 1);
    l && l !== r ? (n = a, r = l) : n === "borderColor" && (r = Gt(e, "borderTopColor"));
  }
  var c = new Ft(this._pt, e.style, n, 0, 1, xw), f = 0, m = 0, g, d, p, v, w, x, T, A, b, C, M, P;
  if (c.b = r, c.e = s, r += "", s += "", s.substring(0, 6) === "var(--" && (s = Gt(e, s.substring(4, s.indexOf(")")))), s === "auto" && (x = e.style[n], e.style[n] = s, s = Gt(e, n) || s, x ? e.style[n] = x : Rr(e, n)), g = [r, s], hw(g), r = g[0], s = g[1], p = r.match(Qi) || [], P = s.match(Qi) || [], P.length) {
    for (; d = Qi.exec(s); )
      T = d[0], b = s.substring(f, d.index), w ? w = (w + 1) % 5 : (b.substr(-5) === "rgba(" || b.substr(-5) === "hsla(") && (w = 1), T !== (x = p[m++] || "") && (v = parseFloat(x) || 0, M = x.substr((v + "").length), T.charAt(1) === "=" && (T = ts(v, T) + M), A = parseFloat(T), C = T.substr((A + "").length), f = Qi.lastIndex - C.length, C || (C = C || Kt.units[n] || M, f === s.length && (s += C, c.e += C)), M !== C && (v = Nr(e, n, x, C) || 0), c._pt = {
        _next: c._pt,
        p: b || m === 1 ? b : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: v,
        c: A - v,
        m: w && w < 4 || n === "zIndex" ? Math.round : 0
      });
    c.c = f < s.length ? s.substring(f, s.length) : "";
  } else
    c.r = n === "display" && s === "none" ? kw : Aw;
  return Ux.test(s) && (c.e = 0), this._pt = c, c;
}, J0 = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, EN = function(e) {
  var n = e.split(" "), r = n[0], s = n[1] || "50%";
  return (r === "top" || r === "bottom" || s === "left" || s === "right") && (e = r, r = s, s = e), n[0] = J0[r] || r, n[1] = J0[s] || s, n.join(" ");
}, MN = function(e, n) {
  if (n.tween && n.tween._time === n.tween._dur) {
    var r = n.t, s = r.style, a = n.u, l = r._gsap, c, f, m;
    if (a === "all" || a === !0)
      s.cssText = "", f = 1;
    else
      for (a = a.split(","), m = a.length; --m > -1; )
        c = a[m], Qn[c] && (f = 1, c = c === "transformOrigin" ? Ot : Ue), Rr(r, c);
    f && (Rr(r, Ue), l && (l.svg && r.removeAttribute("transform"), s.scale = s.rotate = s.translate = "none", Wo(r, 1), l.uncache = 1, bw(s)));
  }
}, xu = {
  clearProps: function(e, n, r, s, a) {
    if (a.data !== "isFromStart") {
      var l = e._pt = new Ft(e._pt, n, r, 0, 0, MN);
      return l.u = s, l.pr = -10, l.tween = a, e._props.push(r), 1;
    }
  }
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */
}, Ho = [1, 0, 0, 1, 0, 0], Rw = {}, Nw = function(e) {
  return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, e_ = function(e) {
  var n = Gt(e, Ue);
  return Nw(n) ? Ho : n.substr(7).match(Bx).map(Ye);
}, Lp = function(e, n) {
  var r = e._gsap || oi(e), s = e.style, a = e_(e), l, c, f, m;
  return r.svg && e.getAttribute("transform") ? (f = e.transform.baseVal.consolidate().matrix, a = [f.a, f.b, f.c, f.d, f.e, f.f], a.join(",") === "1,0,0,1,0,0" ? Ho : a) : (a === Ho && !e.offsetParent && e !== ns && !r.svg && (f = s.display, s.display = "block", l = e.parentNode, (!l || !e.offsetParent && !e.getBoundingClientRect().width) && (m = 1, c = e.nextElementSibling, ns.appendChild(e)), a = e_(e), f ? s.display = f : Rr(e, "display"), m && (c ? l.insertBefore(e, c) : l ? l.appendChild(e) : ns.removeChild(e))), n && a.length > 6 ? [a[0], a[1], a[4], a[5], a[12], a[13]] : a);
}, _h = function(e, n, r, s, a, l) {
  var c = e._gsap, f = a || Lp(e, !0), m = c.xOrigin || 0, g = c.yOrigin || 0, d = c.xOffset || 0, p = c.yOffset || 0, v = f[0], w = f[1], x = f[2], T = f[3], A = f[4], b = f[5], C = n.split(" "), M = parseFloat(C[0]) || 0, P = parseFloat(C[1]) || 0, z, O, F, L;
  r ? f !== Ho && (O = v * T - w * x) && (F = M * (T / O) + P * (-x / O) + (x * b - T * A) / O, L = M * (-w / O) + P * (v / O) - (v * b - w * A) / O, M = F, P = L) : (z = Ew(e), M = z.x + (~C[0].indexOf("%") ? M / 100 * z.width : M), P = z.y + (~(C[1] || C[0]).indexOf("%") ? P / 100 * z.height : P)), s || s !== !1 && c.smooth ? (A = M - m, b = P - g, c.xOffset = d + (A * v + b * x) - A, c.yOffset = p + (A * w + b * T) - b) : c.xOffset = c.yOffset = 0, c.xOrigin = M, c.yOrigin = P, c.smooth = !!s, c.origin = n, c.originIsAbsolute = !!r, e.style[Ot] = "0px 0px", l && (Ar(l, c, "xOrigin", m, M), Ar(l, c, "yOrigin", g, P), Ar(l, c, "xOffset", d, c.xOffset), Ar(l, c, "yOffset", p, c.yOffset)), e.setAttribute("data-svg-origin", M + " " + P);
}, Wo = function(e, n) {
  var r = e._gsap || new mw(e);
  if ("x" in r && !n && !r.uncache)
    return r;
  var s = e.style, a = r.scaleX < 0, l = "px", c = "deg", f = getComputedStyle(e), m = Gt(e, Ot) || "0", g, d, p, v, w, x, T, A, b, C, M, P, z, O, F, L, U, G, te, ae, le, me, ee, de, W, J, X, j, I, q, re, ge;
  return g = d = p = x = T = A = b = C = M = 0, v = w = 1, r.svg = !!(e.getCTM && Mw(e)), f.translate && ((f.translate !== "none" || f.scale !== "none" || f.rotate !== "none") && (s[Ue] = (f.translate !== "none" ? "translate3d(" + (f.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (f.rotate !== "none" ? "rotate(" + f.rotate + ") " : "") + (f.scale !== "none" ? "scale(" + f.scale.split(" ").join(",") + ") " : "") + (f[Ue] !== "none" ? f[Ue] : "")), s.scale = s.rotate = s.translate = "none"), O = Lp(e, r.svg), r.svg && (r.uncache ? (W = e.getBBox(), m = r.xOrigin - W.x + "px " + (r.yOrigin - W.y) + "px", de = "") : de = !n && e.getAttribute("data-svg-origin"), _h(e, de || m, !!de || r.originIsAbsolute, r.smooth !== !1, O)), P = r.xOrigin || 0, z = r.yOrigin || 0, O !== Ho && (G = O[0], te = O[1], ae = O[2], le = O[3], g = me = O[4], d = ee = O[5], O.length === 6 ? (v = Math.sqrt(G * G + te * te), w = Math.sqrt(le * le + ae * ae), x = G || te ? $i(te, G) * Jr : 0, b = ae || le ? $i(ae, le) * Jr + x : 0, b && (w *= Math.abs(Math.cos(b * rs))), r.svg && (g -= P - (P * G + z * ae), d -= z - (P * te + z * le))) : (ge = O[6], q = O[7], X = O[8], j = O[9], I = O[10], re = O[11], g = O[12], d = O[13], p = O[14], F = $i(ge, I), T = F * Jr, F && (L = Math.cos(-F), U = Math.sin(-F), de = me * L + X * U, W = ee * L + j * U, J = ge * L + I * U, X = me * -U + X * L, j = ee * -U + j * L, I = ge * -U + I * L, re = q * -U + re * L, me = de, ee = W, ge = J), F = $i(-ae, I), A = F * Jr, F && (L = Math.cos(-F), U = Math.sin(-F), de = G * L - X * U, W = te * L - j * U, J = ae * L - I * U, re = le * U + re * L, G = de, te = W, ae = J), F = $i(te, G), x = F * Jr, F && (L = Math.cos(F), U = Math.sin(F), de = G * L + te * U, W = me * L + ee * U, te = te * L - G * U, ee = ee * L - me * U, G = de, me = W), T && Math.abs(T) + Math.abs(x) > 359.9 && (T = x = 0, A = 180 - A), v = Ye(Math.sqrt(G * G + te * te + ae * ae)), w = Ye(Math.sqrt(ee * ee + ge * ge)), F = $i(me, ee), b = Math.abs(F) > 2e-4 ? F * Jr : 0, M = re ? 1 / (re < 0 ? -re : re) : 0), r.svg && (de = e.getAttribute("transform"), r.forceCSS = e.setAttribute("transform", "") || !Nw(Gt(e, Ue)), de && e.setAttribute("transform", de))), Math.abs(b) > 90 && Math.abs(b) < 270 && (a ? (v *= -1, b += x <= 0 ? 180 : -180, x += x <= 0 ? 180 : -180) : (w *= -1, b += b <= 0 ? 180 : -180)), n = n || r.uncache, r.x = g - ((r.xPercent = g && (!n && r.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-g) ? -50 : 0))) ? e.offsetWidth * r.xPercent / 100 : 0) + l, r.y = d - ((r.yPercent = d && (!n && r.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-d) ? -50 : 0))) ? e.offsetHeight * r.yPercent / 100 : 0) + l, r.z = p + l, r.scaleX = Ye(v), r.scaleY = Ye(w), r.rotation = Ye(x) + c, r.rotationX = Ye(T) + c, r.rotationY = Ye(A) + c, r.skewX = b + c, r.skewY = C + c, r.transformPerspective = M + l, (r.zOrigin = parseFloat(m.split(" ")[2]) || !n && r.zOrigin || 0) && (s[Ot] = wu(m)), r.xOffset = r.yOffset = 0, r.force3D = Kt.force3D, r.renderTransform = r.svg ? NN : Pw ? Iw : RN, r.uncache = 0, r;
}, wu = function(e) {
  return (e = e.split(" "))[0] + " " + e[1];
}, gf = function(e, n, r) {
  var s = vt(n);
  return Ye(parseFloat(n) + parseFloat(Nr(e, "x", r + "px", s))) + s;
}, RN = function(e, n) {
  n.z = "0px", n.rotationY = n.rotationX = "0deg", n.force3D = 0, Iw(e, n);
}, Yr = "0deg", po = "0px", qr = ") ", Iw = function(e, n) {
  var r = n || this, s = r.xPercent, a = r.yPercent, l = r.x, c = r.y, f = r.z, m = r.rotation, g = r.rotationY, d = r.rotationX, p = r.skewX, v = r.skewY, w = r.scaleX, x = r.scaleY, T = r.transformPerspective, A = r.force3D, b = r.target, C = r.zOrigin, M = "", P = A === "auto" && e && e !== 1 || A === !0;
  if (C && (d !== Yr || g !== Yr)) {
    var z = parseFloat(g) * rs, O = Math.sin(z), F = Math.cos(z), L;
    z = parseFloat(d) * rs, L = Math.cos(z), l = gf(b, l, O * L * -C), c = gf(b, c, -Math.sin(z) * -C), f = gf(b, f, F * L * -C + C);
  }
  T !== po && (M += "perspective(" + T + qr), (s || a) && (M += "translate(" + s + "%, " + a + "%) "), (P || l !== po || c !== po || f !== po) && (M += f !== po || P ? "translate3d(" + l + ", " + c + ", " + f + ") " : "translate(" + l + ", " + c + qr), m !== Yr && (M += "rotate(" + m + qr), g !== Yr && (M += "rotateY(" + g + qr), d !== Yr && (M += "rotateX(" + d + qr), (p !== Yr || v !== Yr) && (M += "skew(" + p + ", " + v + qr), (w !== 1 || x !== 1) && (M += "scale(" + w + ", " + x + qr), b.style[Ue] = M || "translate(0, 0)";
}, NN = function(e, n) {
  var r = n || this, s = r.xPercent, a = r.yPercent, l = r.x, c = r.y, f = r.rotation, m = r.skewX, g = r.skewY, d = r.scaleX, p = r.scaleY, v = r.target, w = r.xOrigin, x = r.yOrigin, T = r.xOffset, A = r.yOffset, b = r.forceCSS, C = parseFloat(l), M = parseFloat(c), P, z, O, F, L;
  f = parseFloat(f), m = parseFloat(m), g = parseFloat(g), g && (g = parseFloat(g), m += g, f += g), f || m ? (f *= rs, m *= rs, P = Math.cos(f) * d, z = Math.sin(f) * d, O = Math.sin(f - m) * -p, F = Math.cos(f - m) * p, m && (g *= rs, L = Math.tan(m - g), L = Math.sqrt(1 + L * L), O *= L, F *= L, g && (L = Math.tan(g), L = Math.sqrt(1 + L * L), P *= L, z *= L)), P = Ye(P), z = Ye(z), O = Ye(O), F = Ye(F)) : (P = d, F = p, z = O = 0), (C && !~(l + "").indexOf("px") || M && !~(c + "").indexOf("px")) && (C = Nr(v, "x", l, "px"), M = Nr(v, "y", c, "px")), (w || x || T || A) && (C = Ye(C + w - (w * P + x * O) + T), M = Ye(M + x - (w * z + x * F) + A)), (s || a) && (L = v.getBBox(), C = Ye(C + s / 100 * L.width), M = Ye(M + a / 100 * L.height)), L = "matrix(" + P + "," + z + "," + O + "," + F + "," + C + "," + M + ")", v.setAttribute("transform", L), b && (v.style[Ue] = L);
}, IN = function(e, n, r, s, a) {
  var l = 360, c = lt(a), f = parseFloat(a) * (c && ~a.indexOf("rad") ? Jr : 1), m = f - s, g = s + m + "deg", d, p;
  return c && (d = a.split("_")[1], d === "short" && (m %= l, m !== m % (l / 2) && (m += m < 0 ? l : -l)), d === "cw" && m < 0 ? m = (m + l * K0) % l - ~~(m / l) * l : d === "ccw" && m > 0 && (m = (m - l * K0) % l - ~~(m / l) * l)), e._pt = p = new Ft(e._pt, n, r, s, m, mN), p.e = g, p.u = "deg", e._props.push(r), p;
}, t_ = function(e, n) {
  for (var r in n)
    e[r] = n[r];
  return e;
}, DN = function(e, n, r) {
  var s = t_({}, r._gsap), a = "perspective,force3D,transformOrigin,svgOrigin", l = r.style, c, f, m, g, d, p, v, w;
  s.svg ? (m = r.getAttribute("transform"), r.setAttribute("transform", ""), l[Ue] = n, c = Wo(r, 1), Rr(r, Ue), r.setAttribute("transform", m)) : (m = getComputedStyle(r)[Ue], l[Ue] = n, c = Wo(r, 1), l[Ue] = m);
  for (f in Qn)
    m = s[f], g = c[f], m !== g && a.indexOf(f) < 0 && (v = vt(m), w = vt(g), d = v !== w ? Nr(r, f, m, w) : parseFloat(m), p = parseFloat(g), e._pt = new Ft(e._pt, c, f, d, p - d, gh), e._pt.u = w || 0, e._props.push(f));
  t_(c, s);
};
jt("padding,margin,Width,Radius", function(t, e) {
  var n = "Top", r = "Right", s = "Bottom", a = "Left", l = (e < 3 ? [n, r, s, a] : [n + a, n + r, s + r, s + a]).map(function(c) {
    return e < 2 ? t + c : "border" + c + t;
  });
  xu[e > 1 ? "border" + t : t] = function(c, f, m, g, d) {
    var p, v;
    if (arguments.length < 4)
      return p = l.map(function(w) {
        return Gn(c, w, m);
      }), v = p.join(" "), v.split(p[0]).length === 5 ? p[0] : v;
    p = (g + "").split(" "), v = {}, l.forEach(function(w, x) {
      return v[w] = p[x] = p[x] || p[(x - 1) / 2 | 0];
    }), c.init(f, v, d);
  };
});
var Dw = {
  name: "css",
  register: vh,
  targetTest: function(e) {
    return e.style && e.nodeType;
  },
  init: function(e, n, r, s, a) {
    var l = this._props, c = e.style, f = r.vars.startAt, m, g, d, p, v, w, x, T, A, b, C, M, P, z, O, F, L;
    jp || vh(), this.styles = this.styles || Cw(e), F = this.styles.props, this.tween = r;
    for (x in n)
      if (x !== "autoRound" && (g = n[x], !(Ht[x] && gw(x, n, r, s, e, a)))) {
        if (v = typeof g, w = xu[x], v === "function" && (g = g.call(r, s, e, a), v = typeof g), v === "string" && ~g.indexOf("random(") && (g = Vo(g)), w)
          w(this, e, x, g, r) && (O = 1);
        else if (x.substr(0, 2) === "--")
          m = (getComputedStyle(e).getPropertyValue(x) + "").trim(), g += "", Cr.lastIndex = 0, Cr.test(m) || (T = vt(m), A = vt(g), A ? T !== A && (m = Nr(e, x, m, A) + A) : T && (g += T)), this.add(c, "setProperty", m, g, s, a, 0, 0, x), l.push(x), F.push(x, 0, c[x]);
        else if (v !== "undefined") {
          if (f && x in f ? (m = typeof f[x] == "function" ? f[x].call(r, s, e, a) : f[x], lt(m) && ~m.indexOf("random(") && (m = Vo(m)), vt(m + "") || m === "auto" || (m += Kt.units[x] || vt(Gn(e, x)) || ""), (m + "").charAt(1) === "=" && (m = Gn(e, x))) : m = Gn(e, x), p = parseFloat(m), b = v === "string" && g.charAt(1) === "=" && g.substr(0, 2), b && (g = g.substr(2)), d = parseFloat(g), x in In && (x === "autoAlpha" && (p === 1 && Gn(e, "visibility") === "hidden" && d && (p = 0), F.push("visibility", 0, c.visibility), Ar(this, c, "visibility", p ? "inherit" : "hidden", d ? "inherit" : "hidden", !d)), x !== "scale" && x !== "transform" && (x = In[x], ~x.indexOf(",") && (x = x.split(",")[0]))), C = x in Qn, C) {
            if (this.styles.save(x), L = g, v === "string" && g.substring(0, 6) === "var(--") {
              if (g = Gt(e, g.substring(4, g.indexOf(")"))), g.substring(0, 5) === "calc(") {
                var U = e.style.perspective;
                e.style.perspective = g, g = Gt(e, "perspective"), U ? e.style.perspective = U : Rr(e, "perspective");
              }
              d = parseFloat(g);
            }
            if (M || (P = e._gsap, P.renderTransform && !n.parseTransform || Wo(e, n.parseTransform), z = n.smoothOrigin !== !1 && P.smooth, M = this._pt = new Ft(this._pt, c, Ue, 0, 1, P.renderTransform, P, 0, -1), M.dep = 1), x === "scale")
              this._pt = new Ft(this._pt, P, "scaleY", P.scaleY, (b ? ts(P.scaleY, b + d) : d) - P.scaleY || 0, gh), this._pt.u = 0, l.push("scaleY", x), x += "X";
            else if (x === "transformOrigin") {
              F.push(Ot, 0, c[Ot]), g = EN(g), P.svg ? _h(e, g, 0, z, 0, this) : (A = parseFloat(g.split(" ")[2]) || 0, A !== P.zOrigin && Ar(this, P, "zOrigin", P.zOrigin, A), Ar(this, c, x, wu(m), wu(g)));
              continue;
            } else if (x === "svgOrigin") {
              _h(e, g, 1, z, 0, this);
              continue;
            } else if (x in Rw) {
              IN(this, P, x, p, b ? ts(p, b + g) : g);
              continue;
            } else if (x === "smoothOrigin") {
              Ar(this, P, "smooth", P.smooth, g);
              continue;
            } else if (x === "force3D") {
              P[x] = g;
              continue;
            } else if (x === "transform") {
              DN(this, g, e);
              continue;
            }
          } else x in c || (x = ps(x) || x);
          if (C || (d || d === 0) && (p || p === 0) && !pN.test(g) && x in c)
            T = (m + "").substr((p + "").length), d || (d = 0), A = vt(g) || (x in Kt.units ? Kt.units[x] : T), T !== A && (p = Nr(e, x, m, A)), this._pt = new Ft(this._pt, C ? P : c, x, p, (b ? ts(p, b + d) : d) - p, !C && (A === "px" || x === "zIndex") && n.autoRound !== !1 ? vN : gh), this._pt.u = A || 0, C && L !== g ? (this._pt.b = m, this._pt.e = L, this._pt.r = yN) : T !== A && A !== "%" && (this._pt.b = m, this._pt.r = gN);
          else if (x in c)
            PN.call(this, e, x, m, b ? b + g : g);
          else if (x in e)
            this.add(e, x, m || e[x], b ? b + g : g, s, a);
          else if (x !== "parseTransform") {
            kp(x, g);
            continue;
          }
          C || (x in c ? F.push(x, 0, c[x]) : typeof e[x] == "function" ? F.push(x, 2, e[x]()) : F.push(x, 1, m || e[x])), l.push(x);
        }
      }
    O && ww(this);
  },
  render: function(e, n) {
    if (n.tween._time || !Fp())
      for (var r = n._pt; r; )
        r.r(e, r.d), r = r._next;
    else
      n.styles.revert();
  },
  get: Gn,
  aliases: In,
  getSetter: function(e, n, r) {
    var s = In[n];
    return s && s.indexOf(",") < 0 && (n = s), n in Qn && n !== Ot && (e._gsap.x || Gn(e, "x")) ? r && G0 === r ? n === "scale" ? wN : xN : (G0 = r || {}) && (n === "scale" ? TN : AN) : e.style && !wp(e.style[n]) ? _N : ~n.indexOf("-") ? SN : Ip(e, n);
  },
  core: {
    _removeProperty: Rr,
    _getMatrix: Lp
  }
};
Lt.utils.checkPrefix = ps;
Lt.core.getStyleSaver = Cw;
(function(t, e, n, r) {
  var s = jt(t + "," + e + "," + n, function(a) {
    Qn[a] = 1;
  });
  jt(e, function(a) {
    Kt.units[a] = "deg", Rw[a] = 1;
  }), In[s[13]] = t + "," + e, jt(r, function(a) {
    var l = a.split(":");
    In[l[1]] = s[l[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
jt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(t) {
  Kt.units[t] = "px";
});
Lt.registerPlugin(Dw);
var jw = Lt.registerPlugin(Dw) || Lt;
jw.core.Tween;
function jN({ scene: t }) {
  return E.useEffect(() => {
    const e = jw.to(".focus-background", {
      scale: 1.055,
      xPercent: 0.6,
      yPercent: 0.4,
      duration: 18,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: !0
    });
    return () => e.kill();
  }, [t == null ? void 0 : t.id]), /* @__PURE__ */ S.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ S.jsx(Jo, { mode: "wait", children: /* @__PURE__ */ S.jsx(
      cn.div,
      {
        className: "focus-background",
        style: { backgroundImage: `url("${(t == null ? void 0 : t.image) || ""}")` },
        initial: { opacity: 0, scale: 1.035 },
        animate: { opacity: 1, scale: 1.02 },
        exit: { opacity: 0, scale: 1.015 },
        transition: { duration: 0.8, ease: "easeOut" }
      },
      (t == null ? void 0 : t.id) || "focus-background"
    ) }),
    /* @__PURE__ */ S.jsx("div", { className: "focus-overlay" })
  ] });
}
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FN = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), ON = (t) => t.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (e, n, r) => r ? r.toUpperCase() : n.toLowerCase()
), n_ = (t) => {
  const e = ON(t);
  return e.charAt(0).toUpperCase() + e.slice(1);
}, Fw = (...t) => t.filter((e, n, r) => !!e && e.trim() !== "" && r.indexOf(e) === n).join(" ").trim(), LN = (t) => {
  for (const e in t)
    if (e.startsWith("aria-") || e === "role" || e === "title")
      return !0;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var zN = {
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
const $N = E.forwardRef(
  ({
    color: t = "currentColor",
    size: e = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: a,
    iconNode: l,
    ...c
  }, f) => E.createElement(
    "svg",
    {
      ref: f,
      ...zN,
      width: e,
      height: e,
      stroke: t,
      strokeWidth: r ? Number(n) * 24 / Number(e) : n,
      className: Fw("lucide", s),
      ...!a && !LN(c) && { "aria-hidden": "true" },
      ...c
    },
    [
      ...l.map(([m, g]) => E.createElement(m, g)),
      ...Array.isArray(a) ? a : [a]
    ]
  )
);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Oe = (t, e) => {
  const n = E.forwardRef(
    ({ className: r, ...s }, a) => E.createElement($N, {
      ref: a,
      iconNode: e,
      className: Fw(
        `lucide-${FN(n_(t))}`,
        `lucide-${t}`,
        r
      ),
      ...s
    })
  );
  return n.displayName = n_(t), n;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const VN = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
], Ow = Oe("arrow-right", VN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const BN = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  ["path", { d: "M16 12h2", key: "7q9ll5" }],
  ["path", { d: "M16 8h2", key: "msurwy" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ],
  ["path", { d: "M6 12h2", key: "32wvfc" }],
  ["path", { d: "M6 8h2", key: "30oboj" }]
], zp = Oe("book-open-text", BN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UN = [
  [
    "path",
    {
      d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
      key: "l5xja"
    }
  ],
  [
    "path",
    {
      d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
      key: "ep3f8r"
    }
  ],
  ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }],
  ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }],
  ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }],
  ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }],
  ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }],
  ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }],
  ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]
], Tu = Oe("brain", UN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const HN = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
], WN = Oe("clock", HN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ZN = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
], GN = Oe("external-link", ZN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const KN = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
], Au = Oe("file-text", KN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const YN = [
  ["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }],
  ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }]
], qN = Oe("git-branch", YN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const QN = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
], $p = Oe("history", QN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const XN = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
], Lw = Oe("layers", XN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const JN = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }],
  ["path", { d: "M14 4h7", key: "3xa0d5" }],
  ["path", { d: "M14 9h7", key: "1icrd9" }],
  ["path", { d: "M14 15h7", key: "1mj8o2" }],
  ["path", { d: "M14 20h7", key: "11slyb" }]
], eI = Oe("layout-list", JN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tI = [
  ["rect", { x: "3", y: "5", width: "6", height: "6", rx: "1", key: "1defrl" }],
  ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
  ["path", { d: "M13 6h8", key: "15sg57" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 18h8", key: "oe0vm4" }]
], nI = Oe("list-todo", tI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rI = [
  ["circle", { cx: "8", cy: "18", r: "4", key: "1fc0mg" }],
  ["path", { d: "M12 18V2l7 4", key: "g04rme" }]
], iI = Oe("music-2", rI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sI = [
  ["path", { d: "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4", key: "re6nr2" }],
  ["path", { d: "M2 6h4", key: "aawbzj" }],
  ["path", { d: "M2 10h4", key: "l0bgd4" }],
  ["path", { d: "M2 14h4", key: "1gsvsf" }],
  ["path", { d: "M2 18h4", key: "1bu2t1" }],
  [
    "path",
    {
      d: "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
      key: "pqwjuv"
    }
  ]
], zw = Oe("notebook-pen", sI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const oI = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], Sh = Oe("pause", oI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const aI = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], $w = Oe("play", aI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lI = [
  [
    "path",
    {
      d: "M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
      key: "rib7q0"
    }
  ],
  [
    "path",
    {
      d: "M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
      key: "1ymkrd"
    }
  ]
], Kl = Oe("quote", lI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uI = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], Vw = Oe("rotate-ccw", uI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cI = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], Bw = Oe("skip-forward", cI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dI = [
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
], Vp = Oe("sparkles", dI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fI = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
], Uw = Oe("square", fI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hI = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
], pI = Oe("target", hI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mI = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], gI = Oe("volume-2", mI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yI = [
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
], vI = Oe("waves", yI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _I = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], Hw = Oe("x", _I), r_ = (t) => {
  let e;
  const n = /* @__PURE__ */ new Set(), r = (m, g) => {
    const d = typeof m == "function" ? m(e) : m;
    if (!Object.is(d, e)) {
      const p = e;
      e = g ?? (typeof d != "object" || d === null) ? d : Object.assign({}, e, d), n.forEach((v) => v(e, p));
    }
  }, s = () => e, c = { setState: r, getState: s, getInitialState: () => f, subscribe: (m) => (n.add(m), () => n.delete(m)) }, f = e = t(r, s, c);
  return c;
}, SI = ((t) => t ? r_(t) : r_), xI = (t) => t;
function wI(t, e = xI) {
  const n = Kn.useSyncExternalStore(
    t.subscribe,
    Kn.useCallback(() => e(t.getState()), [t, e]),
    Kn.useCallback(() => e(t.getInitialState()), [t, e])
  );
  return Kn.useDebugValue(n), n;
}
const i_ = (t) => {
  const e = SI(t), n = (r) => wI(e, r);
  return Object.assign(n, e), n;
}, TI = ((t) => t ? i_(t) : i_);
var z_;
const xh = ((z_ = ta[0]) == null ? void 0 : z_.id) || "morning-window", Bp = Ix[0] || 25, AI = 10, Up = 180, kI = 0, bI = 100, wh = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"], Th = new Set(wh), is = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function CI(t, e, n, r) {
  const s = Number(t);
  return Number.isFinite(s) ? Math.min(r, Math.max(n, s)) : e;
}
function ss(t, e, n, r) {
  return Math.round(CI(t, e, n, r));
}
function ms(t, e = 50) {
  return ss(t, e, kI, bI);
}
function $u(t, e = Bp) {
  return ss(t, e, AI, Up);
}
function Hp(t) {
  return ta.find((e) => e.id === t) || null;
}
function gs(t = xh) {
  return Hp(t) || ta[0] || {
    id: xh,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function PI(t = "/focus-room") {
  const e = String(t || "/focus-room").split("?")[0];
  if (e === "/study-history")
    return { name: "history", materialId: "" };
  if (e === "/focus-room" || e.startsWith("/focus-room/")) {
    const n = e.slice(11).replace(/^\/+/, "");
    let r = "";
    try {
      r = n ? decodeURIComponent(n) : "";
    } catch {
      r = n;
    }
    return { name: "focus", materialId: r };
  }
  return { name: "workspace", materialId: "" };
}
function Ww(t) {
  return Array.isArray(t) ? t.map((e) => ({
    minutes: ss(e == null ? void 0 : e.minutes, 5, 1, Up),
    task: String((e == null ? void 0 : e.task) || "").trim()
  })).filter((e) => e.task) : [];
}
function _o(t) {
  return Array.isArray(t) ? t.map((e) => ({
    role: String((e == null ? void 0 : e.role) || "assistant") === "user" ? "user" : "assistant",
    text: String((e == null ? void 0 : e.text) || "").trim(),
    createdAt: (e == null ? void 0 : e.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
  })).filter((e) => e.text).slice(-24) : [];
}
function Zw(t) {
  if (!t || typeof t != "object")
    return { materials: {} };
  if (t.materials && typeof t.materials == "object")
    return {
      ...t,
      materials: { ...t.materials }
    };
  const e = String(t.materialId || "");
  return e ? {
    materials: {
      [e]: t
    }
  } : { materials: {} };
}
function Ah(t, e, n) {
  return t ? cR({
    material: t,
    goal: e,
    durationMinutes: n
  }) : [];
}
function So(t) {
  const e = $u(t);
  return e > 0 ? e * 60 : 0;
}
function EI(t, e) {
  const n = So(e);
  return n ? Math.min(100, Math.max(0, t / n * 100)) : 0;
}
function MI(t) {
  const e = Math.max(0, Math.floor(Number(t) || 0)), n = Math.floor(e / 3600), r = Math.floor(e % 3600 / 60), s = e % 60, a = (l) => String(l).padStart(2, "0");
  return n ? `${n}:${a(r)}:${a(s)}` : `${a(r)}:${a(s)}`;
}
function s_(t) {
  return t === "notes" ? "Generated Notes" : t === "sources" ? "Sources" : t === "mindmap" ? "Mind Map" : t === "chat" ? "AI Chat" : t === "plan" ? "Study Plan" : t === "workspace" ? "Scratchpad" : t === "history" ? "History" : String(t || "").replace(/^\w/, (e) => e.toUpperCase());
}
function Zo(t) {
  const e = (t == null ? void 0 : t.flashcards) || [];
  return Array.isArray(e) ? e.slice(0, 24) : [];
}
function RI(t, e) {
  return (t == null ? void 0 : t.prompt) || (t == null ? void 0 : t.front) || (t == null ? void 0 : t.question) || (t == null ? void 0 : t.term) || `Flashcard ${e + 1}`;
}
function NI(t) {
  return (t == null ? void 0 : t.answer) || (t == null ? void 0 : t.back) || (t == null ? void 0 : t.definition) || (t == null ? void 0 : t.explanation) || "Return to the workspace for the saved answer.";
}
function Gw(t, e) {
  return String((t == null ? void 0 : t.id) || (t == null ? void 0 : t.front) || (t == null ? void 0 : t.term) || e);
}
function II(t) {
  var e;
  return Array.isArray(t == null ? void 0 : t.questions) ? t.questions : Array.isArray((e = t == null ? void 0 : t.quiz) == null ? void 0 : e.questions) ? t.quiz.questions : [];
}
function ys(t) {
  return (Array.isArray(t == null ? void 0 : t.quizzes) ? t.quizzes : []).flatMap((n) => II(n).map((r) => {
    var s;
    return {
      ...r,
      quizTitle: (n == null ? void 0 : n.title) || ((s = n == null ? void 0 : n.quiz) == null ? void 0 : s.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function kh(t, e) {
  return (t == null ? void 0 : t.question) || (t == null ? void 0 : t.prompt) || (t == null ? void 0 : t.stem) || `Question ${e + 1}`;
}
function ra(t) {
  return String((t == null ? void 0 : t.type) || "").toLowerCase();
}
function DI(t) {
  return String((t == null ? void 0 : t.label) || (t == null ? void 0 : t.text) || t).trim();
}
function vs(t) {
  const e = (t == null ? void 0 : t.choices) || (t == null ? void 0 : t.options) || (t == null ? void 0 : t.answers);
  return Array.isArray(e) && e.length ? e.map(DI).filter(Boolean) : ra(t) === "true_false" ? ["True", "False"] : [];
}
function bh(t) {
  const e = (t == null ? void 0 : t.correctOptionIndexes) || (t == null ? void 0 : t.correct_option_indexes) || (t == null ? void 0 : t.correctIndexes);
  return Array.isArray(e) ? e.map((n) => Number(n)).filter(Number.isInteger) : [];
}
function jI(t, e) {
  const n = Array.isArray(t) ? [...t].map(Number).filter(Number.isInteger).sort((s, a) => s - a) : [], r = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((s, a) => s - a) : [];
  return n.length === r.length && n.every((s, a) => s === r[a]);
}
function Yn(t) {
  return String(t || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function ku(t, e) {
  if (Number.isInteger(e)) return e;
  const n = Number(e);
  if (typeof e != "string" && Number.isInteger(n)) return n;
  const r = vs(t), s = Yn(e);
  return r.findIndex((a) => Yn(a) === s);
}
function Kw(t, e) {
  if (typeof e == "boolean") return e;
  if (e === 0) return !0;
  if (e === 1) return !1;
  const n = vs(t), r = Yn(e);
  return r === "true" ? !0 : r === "false" ? !1 : Yn(n[0]) === r ? !0 : Yn(n[1]) === r ? !1 : null;
}
function FI(t, e, n) {
  const r = ra(t);
  if (r === "multiple_choice") {
    const s = ku(t, e);
    if (!Number.isInteger(s) || s < 0) return [];
    const a = Array.isArray(n) ? [...n] : [];
    return a.includes(s) ? a.filter((l) => l !== s) : [...a, s].sort((l, c) => l - c);
  }
  if (r === "single_choice") {
    const s = ku(t, e);
    return Number.isInteger(s) && s >= 0 ? s : "";
  }
  if (r === "true_false") {
    const s = Kw(t, e);
    return s === null ? "" : s;
  }
  return String(e || "");
}
function Yw(t) {
  const e = (t == null ? void 0 : t.correctAnswer) ?? (t == null ? void 0 : t.correct_answer) ?? (t == null ? void 0 : t.answer) ?? (t == null ? void 0 : t.correct), n = bh(t);
  if (n.length) {
    const r = vs(t);
    return n.map((s) => r[s] || "").filter(Boolean).join(", ");
  }
  if (typeof (t == null ? void 0 : t.correctBoolean) == "boolean" || typeof (t == null ? void 0 : t.correct_boolean) == "boolean") {
    const r = vs(t);
    return (typeof t.correctBoolean == "boolean" ? t.correctBoolean : t.correct_boolean) ? r[0] || "True" : r[1] || "False";
  }
  return t != null && t.expectedAnswer || t != null && t.expected_answer ? String(t.expectedAnswer || t.expected_answer || "").trim() : Array.isArray(e) ? e.map((r) => String(r)).join(", ") : String(e || "").trim();
}
function OI(t, e) {
  const n = ra(t);
  if (n === "single_choice") {
    const s = bh(t)[0], a = ku(t, e);
    return Number.isInteger(s) ? a === s : null;
  }
  if (n === "multiple_choice") {
    const s = bh(t), a = Array.isArray(e) ? e : [ku(t, e)].filter(Number.isInteger);
    return s.length ? jI(a, s) : null;
  }
  if (n === "true_false") {
    const s = typeof (t == null ? void 0 : t.correctBoolean) == "boolean" ? t.correctBoolean : t == null ? void 0 : t.correct_boolean, a = Kw(t, e);
    return typeof s == "boolean" && a !== null ? a === s : null;
  }
  const r = Yw(t);
  return r ? Yn(e) === Yn(r) : null;
}
function LI(t, e) {
  const n = ra(t);
  return n === "multiple_choice" ? Array.isArray(e) && e.length > 0 : n === "single_choice" ? Number.isInteger(e) : n === "true_false" ? typeof e == "boolean" : String(e || "").trim().length > 0;
}
function zI(t, e, n) {
  const r = ra(t);
  return r === "multiple_choice" ? Array.isArray(e) && e.includes(n) : r === "single_choice" ? e === n : r === "true_false" ? e === (n === 0) : Yn(e) === Yn(vs(t)[n]);
}
function qw(t, e, n) {
  var c;
  const r = String(t || "").trim(), s = String((e == null ? void 0 : e.summaryText) || (e == null ? void 0 : e.aiSummary) || "").slice(0, 420), a = ((c = e == null ? void 0 : e.studyHeadings) == null ? void 0 : c[0]) || (e == null ? void 0 : e.materialTitle) || "this material", l = n || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`;
  return r ? [
    `For ${a}: ${s || "use the selected material as your main source."}`,
    `Your current goal is: ${l}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function $I() {
  return ta[0] || gs(xh);
}
function VI(t) {
  const e = String(t || "");
  if (!e) return null;
  const r = Zw(Dx()).materials[e];
  return r && typeof r == "object" ? r : null;
}
function yr(t) {
  var r;
  const e = String(t.selectedMaterialId || ((r = t.selectedMaterial) == null ? void 0 : r.materialId) || "");
  if (!e) return;
  const n = Zw(Dx());
  n.materials[e] = {
    materialId: e,
    selectedScene: t.selectedScene,
    musicType: t.musicType,
    ambientSound: t.ambientSound,
    musicVolume: ms(t.musicVolume),
    ambientVolume: ms(t.ambientVolume),
    durationMinutes: $u(t.pomodoroDuration),
    studyGoal: t.studyGoal,
    studyPlan: Ww(t.studyPlan),
    completedTasks: Array.isArray(t.completedTasks) ? t.completedTasks.filter(Boolean) : [],
    workspaceNotes: String(t.workspaceNotes || ""),
    workspaceUpdatedAt: t.workspaceUpdatedAt || "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, dR(n);
}
function BI(t) {
  return Array.isArray(t == null ? void 0 : t.completedTasks) ? t.completedTasks.map((e) => String(e || "").trim()).filter(Boolean) : [];
}
function Ch(t = {}) {
  return {
    sectionTitle: String(t.sectionTitle || "").trim(),
    excerpt: String(t.excerpt || "").trim().slice(0, 1800)
  };
}
function Qw(t = null) {
  return !t || typeof t != "object" ? null : {
    id: String(t.id || "").trim(),
    title: String(t.title || "").trim(),
    excerpt: String(t.excerpt || "").trim().slice(0, 1800),
    sourceId: String(t.sourceId || t.source_id || "").trim(),
    sourceIndex: Number(t.sourceIndex || t.source_index || 0) || 0,
    sourceLabel: String(t.sourceLabel || t.source_label || "").trim(),
    sourceKind: String(t.sourceKind || t.source_kind || "").trim(),
    sectionTitle: String(t.sectionTitle || t.section_title || "").trim(),
    kind: String(t.kind || "evidence").trim()
  };
}
function UI(t, e = {}) {
  const n = gs(e.selectedScene), r = VI(t == null ? void 0 : t.materialId), s = Hp(r == null ? void 0 : r.selectedScene) ? r.selectedScene : n.id, a = gs(s), l = String((r == null ? void 0 : r.musicType) || a.musicType || "Deep Focus"), c = String((r == null ? void 0 : r.ambientSound) || a.ambientSound || "Nature"), f = ms(r == null ? void 0 : r.musicVolume, e.musicVolume ?? 60), m = ms(r == null ? void 0 : r.ambientVolume, e.ambientVolume ?? 50), g = $u(r == null ? void 0 : r.durationMinutes, e.pomodoroDuration ?? Bp), d = String((r == null ? void 0 : r.studyGoal) || `Study ${(t == null ? void 0 : t.materialTitle) || "this material"}`), p = Ww(r == null ? void 0 : r.studyPlan), v = p.length ? p : Ah(t, d, g), w = BI(r), x = String((r == null ? void 0 : r.workspaceNotes) || ""), T = (r == null ? void 0 : r.workspaceUpdatedAt) || (r == null ? void 0 : r.updatedAt) || "";
  return {
    selectedScene: s,
    musicType: l,
    ambientSound: c,
    musicVolume: f,
    ambientVolume: m,
    pomodoroDuration: g,
    studyGoal: d,
    studyPlan: v,
    completedTasks: w,
    workspaceNotes: x,
    workspaceUpdatedAt: T
  };
}
function HI(t) {
  const e = hR(t);
  if (!e || typeof e != "object") return null;
  const n = e.timerStatus === "studying" ? "paused" : String(e.timerStatus || "idle");
  return {
    route: e.view === "session" ? "session" : "setup",
    view: e.view === "session" ? "session" : "setup",
    timerStatus: ["idle", "paused", "completed"].includes(n) ? n : "idle",
    elapsedSeconds: Math.max(0, Number(e.elapsedSeconds) || 0),
    startedAt: e.startedAt || null,
    currentSession: e.currentSession || null,
    completedTasks: Array.isArray(e.completedTasks) ? e.completedTasks.filter(Boolean) : [],
    flashcardIndex: Math.max(0, Number(e.flashcardIndex) || 0),
    flashcardSide: e.flashcardSide === "back" ? "back" : "front",
    flashcardProgress: e.flashcardProgress && typeof e.flashcardProgress == "object" && !Array.isArray(e.flashcardProgress) ? e.flashcardProgress : {},
    quizAnswers: e.quizAnswers && typeof e.quizAnswers == "object" && !Array.isArray(e.quizAnswers) ? e.quizAnswers : {},
    quizChecked: e.quizChecked && typeof e.quizChecked == "object" && !Array.isArray(e.quizChecked) ? e.quizChecked : {},
    chatMessages: _o(e.chatMessages),
    chatPending: !1,
    chatError: "",
    panelTab: Th.has(e.panelTab) ? e.panelTab : "materials",
    workspaceNotes: String(e.workspaceNotes || ""),
    workspaceUpdatedAt: e.workspaceUpdatedAt || e.updatedAt || "",
    activeNoteSection: String(e.activeNoteSection || ""),
    activeSourceHighlight: Qw(e.activeSourceHighlight),
    assistantContext: Ch(e.assistantContext),
    audioPlaying: !1
  };
}
function Cl() {
  return {
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {}
  };
}
function o_(t) {
  return Object.values(t.flashcardProgress || {}).filter((e) => e && e.difficulty).length;
}
function a_(t) {
  const e = Object.values(t.quizChecked || {}).filter((r) => r && r.hasKnownAnswer);
  if (!e.length) return null;
  const n = e.filter((r) => r.correct).length;
  return Math.round(n / e.length * 100);
}
function l_(t) {
  const e = ys(t.selectedMaterial);
  return Object.entries(t.quizChecked || {}).filter(([, n]) => n && n.hasKnownAnswer && !n.correct).map(([n]) => kh(e[Number(n)], Number(n))).filter(Boolean);
}
async function WI(t, e, n, r = {}) {
  var l, c;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: qw(t, n, H.getState().studyGoal),
      offline: !0
    };
  const s = await globalThis.apiClient.fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: t,
      selected_section: r.sectionTitle || ((l = n == null ? void 0 : n.studyHeadings) == null ? void 0 : l[0]) || "",
      selected_excerpt: r.excerpt || "",
      source_strict: !!(n != null && n.isSourceRestricted),
      preferred_language: ((c = globalThis.preferredLanguage) == null ? void 0 : c.value) || "auto",
      title: (n == null ? void 0 : n.materialTitle) || "Study material",
      summary: (n == null ? void 0 : n.aiSummary) || (n == null ? void 0 : n.summaryText) || "",
      sections: (n == null ? void 0 : n.sections) || {},
      source_identity: (n == null ? void 0 : n.materialId) || "",
      source_fingerprint: (n == null ? void 0 : n.sourceFingerprint) || "",
      chat_history: e
    })
  });
  let a = null;
  try {
    a = await s.json();
  } catch {
    throw new Error("Backend returned non-JSON response.");
  }
  if (!s.ok || a != null && a.error)
    throw new Error((a == null ? void 0 : a.error) || "AI request failed.");
  return {
    answer: (a == null ? void 0 : a.answer) || "No answer returned.",
    usedExternalResearch: !!(a != null && a.used_external_research),
    researchSources: Array.isArray(a == null ? void 0 : a.research_sources) ? a.research_sources : []
  };
}
const H = TI((t, e) => {
  const n = $I();
  return {
    route: "workspace",
    view: "setup",
    materials: [],
    materialsStatus: "idle",
    materialsError: "",
    selectedMaterialId: "",
    selectedMaterial: null,
    selectedScene: n.id,
    musicType: n.musicType || "Deep Focus",
    ambientSound: n.ambientSound || "Nature",
    musicVolume: 60,
    ambientVolume: 50,
    pomodoroDuration: Bp,
    timerStatus: "idle",
    studyGoal: "",
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
    workspaceNotes: "",
    workspaceUpdatedAt: "",
    activeNoteSection: "",
    activeSourceHighlight: null,
    assistantContext: { sectionTitle: "", excerpt: "" },
    chatMessages: [],
    chatPending: !1,
    chatError: "",
    setIdle: (r) => t({ isIdle: r }),
    setMaterialsState({ items: r = [], status: s = "ready", error: a = "" } = {}) {
      t({
        materials: Array.isArray(r) ? r : [],
        materialsStatus: s === "error" ? "error" : s === "loading" ? "loading" : "ready",
        materialsError: String(a || "")
      });
    },
    hydrateFocusRoute(r, s, { preserveSession: a = !1 } = {}) {
      const l = e(), c = !!s, f = c ? s.materialId : String(r.materialId || "");
      if (!c) {
        t({
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
      const m = l.selectedMaterialId === f, g = m && a ? null : HI(f), d = m && a ? {} : UI(s, l), p = m && a ? {} : {
        timerStatus: "idle",
        elapsedSeconds: 0,
        startedAt: null,
        currentSession: null,
        ...Cl(),
        chatMessages: [],
        chatPending: !1,
        chatError: "",
        activeNoteSection: "",
        activeSourceHighlight: null,
        assistantContext: { sectionTitle: "", excerpt: "" }
      }, v = m && a ? l.view === "session" ? "session" : "setup" : (g == null ? void 0 : g.view) === "session" ? "session" : "setup";
      t({
        ...d,
        ...p,
        ...g,
        route: v,
        view: v,
        selectedMaterialId: f,
        selectedMaterial: s,
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null
      });
    },
    showStudyHistory() {
      t({
        route: "history",
        view: "history",
        aiPanelOpen: !1,
        activeDrawer: "",
        summaryRecord: null,
        sessionHistory: mu()
      });
    },
    selectScene(r) {
      const s = Hp(r);
      s && t((a) => {
        const l = {
          selectedScene: s.id,
          musicType: s.musicType || a.musicType,
          ambientSound: s.ambientSound || a.ambientSound
        }, c = { ...a, ...l };
        return yr(c), l;
      });
    },
    setPomodoroDuration(r) {
      t((s) => {
        const a = $u(r, s.pomodoroDuration), l = Ah(s.selectedMaterial, s.studyGoal, a), c = { pomodoroDuration: a, studyPlan: l };
        return yr({ ...s, ...c }), c;
      });
    },
    setStudyGoal(r) {
      t((s) => {
        const a = String(r ?? ""), l = Ah(s.selectedMaterial, a, s.pomodoroDuration), c = { studyGoal: a, studyPlan: l };
        return yr({ ...s, ...c }), c;
      });
    },
    setSound(r, s) {
      t((a) => {
        let l = {};
        return r === "musicVolume" && (l = { musicVolume: ms(s, a.musicVolume) }), r === "ambientVolume" && (l = { ambientVolume: ms(s, a.ambientVolume) }), r === "musicType" && (l = { musicType: String(s || a.musicType) }), r === "ambientSound" && (l = { ambientSound: String(s || a.ambientSound) }), yr({ ...a, ...l }), l;
      });
    },
    toggleAudio() {
      t((r) => ({ audioPlaying: !r.audioPlaying }));
    },
    setAudioPlaying(r) {
      t({ audioPlaying: !!r });
    },
    openDrawer(r) {
      t({
        activeDrawer: r
      });
    },
    closeDrawer() {
      t({
        activeDrawer: ""
      });
    },
    toggleAIPanel(r = null) {
      t((s) => ({ aiPanelOpen: typeof r == "boolean" ? r : !s.aiPanelOpen }));
    },
    openStudyPanel(r = "materials") {
      const s = Th.has(String(r || "")) ? String(r) : "materials";
      t({
        panelTab: s,
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    selectSourceHighlight(r = null, { openPanel: s = !0 } = {}) {
      const a = Qw(r);
      t({
        activeSourceHighlight: a,
        activeNoteSection: (a == null ? void 0 : a.sectionTitle) || e().activeNoteSection || "",
        assistantContext: a ? Ch({
          sectionTitle: a.sectionTitle,
          excerpt: a.excerpt
        }) : e().assistantContext,
        ...s ? { panelTab: "sources", aiPanelOpen: !0, activeDrawer: "" } : {}
      });
    },
    setActiveNoteSection(r = "") {
      t({
        activeNoteSection: String(r || "").trim()
      });
    },
    setPanelTab(r) {
      const s = String(r || "materials");
      t({
        panelTab: Th.has(s) ? s : "materials",
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    startSession() {
      const r = e();
      r.selectedMaterial && (yr(r), t({
        route: "session",
        view: "session",
        timerStatus: "idle",
        elapsedSeconds: 0,
        startedAt: null,
        summaryRecord: null,
        aiPanelOpen: !1,
        activeDrawer: "",
        currentSession: {
          sessionId: `focus-${Date.now()}`,
          materialId: r.selectedMaterial.materialId,
          studyGoal: r.studyGoal,
          selectedScene: r.selectedScene,
          musicType: r.musicType,
          ambientSound: r.ambientSound,
          musicVolume: r.musicVolume,
          ambientVolume: r.ambientVolume,
          pomodoroDuration: r.pomodoroDuration,
          startedAt: null
        },
        ...Cl(),
        chatMessages: [],
        chatPending: !1,
        chatError: ""
      }));
    },
    startTimer() {
      const r = e();
      if (!r.selectedMaterial) return;
      const s = r.timerStatus === "completed" || r.elapsedSeconds >= So(r.pomodoroDuration);
      t({
        view: "session",
        route: "session",
        timerStatus: "studying",
        audioPlaying: !0,
        summaryRecord: null,
        elapsedSeconds: s ? 0 : r.elapsedSeconds,
        startedAt: !r.startedAt || r.timerStatus === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : r.startedAt,
        ...s ? Cl() : {}
      });
    },
    pauseTimer({ pauseAudio: r = !0 } = {}) {
      const s = e();
      t({
        timerStatus: s.timerStatus === "studying" ? "paused" : s.timerStatus,
        audioPlaying: r ? !1 : s.audioPlaying
      });
    },
    resetTimer() {
      t({
        timerStatus: "idle",
        audioPlaying: !1,
        startedAt: null,
        elapsedSeconds: 0,
        summaryRecord: null,
        ...Cl()
      });
    },
    skipTimer() {
      const r = e();
      t({
        elapsedSeconds: So(r.pomodoroDuration),
        timerStatus: "completed",
        audioPlaying: !1,
        startedAt: r.startedAt || (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    tickTimer() {
      const r = e();
      if (r.view !== "session" || r.timerStatus !== "studying" || !r.selectedMaterial) return;
      const s = So(r.pomodoroDuration), a = s ? Math.min(s, r.elapsedSeconds + 1) : r.elapsedSeconds + 1;
      t({
        elapsedSeconds: a,
        timerStatus: s && a >= s ? "completed" : r.timerStatus,
        audioPlaying: s && a >= s ? !1 : r.audioPlaying
      });
    },
    endSession() {
      var m;
      const r = e(), s = r.selectedMaterial || lR(r.selectedMaterialId);
      if (!s) return;
      const a = (/* @__PURE__ */ new Date()).toISOString(), l = So(r.pomodoroDuration), c = l ? Math.min(l, r.elapsedSeconds) : r.elapsedSeconds, f = mR({
        sessionId: (m = r.currentSession) == null ? void 0 : m.sessionId,
        materialId: s.materialId,
        materialTitle: s.materialTitle,
        studyGoal: r.studyGoal,
        selectedScene: r.selectedScene,
        musicType: r.musicType,
        ambientSound: r.ambientSound,
        musicVolume: r.musicVolume,
        ambientVolume: r.ambientVolume,
        pomodoroDuration: r.pomodoroDuration,
        startedAt: r.startedAt || a,
        endedAt: a,
        totalFocusTime: c,
        flashcardsCompleted: o_(r),
        quizScore: a_(r),
        mistakesMade: l_(r),
        completedTasks: r.completedTasks,
        recommendedNextStep: "Return to your notes, review any unchecked tasks, then start another short focus block."
      });
      Lx(s.materialId), t({
        summaryRecord: f,
        sessionHistory: mu(),
        timerStatus: "completed",
        audioPlaying: !1,
        elapsedSeconds: l ? Math.min(l, r.elapsedSeconds) : r.elapsedSeconds,
        currentSession: null
      });
    },
    closeSummary() {
      t({ summaryRecord: null });
    },
    setWorkspaceNotes(r) {
      t((s) => {
        const a = {
          workspaceNotes: String(r ?? ""),
          workspaceUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        return yr({ ...s, ...a }), a;
      });
    },
    setAssistantContext(r = {}) {
      t({ assistantContext: Ch(r) });
    },
    toggleTask(r) {
      t((s) => {
        const a = s.studyPlan[Number(r)];
        if (!a) return {};
        const l = String(a.task || ""), c = s.completedTasks.includes(l) ? s.completedTasks.filter((f) => f !== l) : [...s.completedTasks, l];
        return yr({ ...s, completedTasks: c }), { completedTasks: c };
      });
    },
    updatePlanTask(r, s = null, a = null) {
      t((l) => {
        const c = Number(r), f = l.studyPlan[c];
        if (!f) return {};
        const m = String(f.task || ""), g = a == null ? m : String(a || "").trim(), d = s == null ? f.minutes : ss(s, f.minutes, 1, Up), p = l.studyPlan.map((x, T) => T === c ? { minutes: d, task: g || m } : x);
        let v = l.completedTasks;
        m && m !== p[c].task && v.includes(m) && (v = v.filter((x) => x !== m).concat(p[c].task));
        const w = { studyPlan: p, completedTasks: v };
        return yr({ ...l, ...w }), w;
      });
    },
    setFlashcardIndex(r) {
      const s = Zo(e().selectedMaterial);
      t({
        flashcardIndex: ss(r, e().flashcardIndex, 0, Math.max(0, s.length - 1)),
        flashcardSide: "front"
      });
    },
    flipFlashcard() {
      t((r) => ({
        flashcardSide: r.flashcardSide === "back" ? "front" : "back"
      }));
    },
    rateFlashcard(r) {
      const s = e(), a = Zo(s.selectedMaterial);
      if (!a.length) return;
      const l = ss(s.flashcardIndex, 0, 0, a.length - 1), c = a[l], f = ["easy", "medium", "hard"].includes(String(r)) ? String(r) : "medium";
      t({
        flashcardProgress: {
          ...s.flashcardProgress,
          [Gw(c, l)]: {
            difficulty: f,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: l < a.length - 1 ? l + 1 : l
      });
    },
    answerQuizQuestion(r, s) {
      const a = Number(r), l = ys(e().selectedMaterial)[a];
      if (!l) return;
      const c = String(a);
      t((f) => ({
        quizAnswers: {
          ...f.quizAnswers,
          [c]: FI(l, s, f.quizAnswers[c])
        }
      }));
    },
    checkQuizQuestion(r) {
      const s = ys(e().selectedMaterial), a = Number(r), l = s[a];
      if (!l) return;
      const c = String(a), f = e(), m = Object.prototype.hasOwnProperty.call(f.quizAnswers, c) ? f.quizAnswers[c] : "", g = OI(l, m), d = Yw(l);
      t({
        quizChecked: {
          ...f.quizChecked,
          [c]: {
            answer: m,
            correct: g === null ? !1 : g,
            hasKnownAnswer: g !== null,
            explanation: l.explanation || l.rationale || (d ? `Correct answer: ${d}` : ""),
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
    },
    async askAssistant(r) {
      const s = String(r || "").trim();
      if (!s) return;
      const a = e(), l = a.selectedMaterial, c = _o(a.chatMessages).slice(-10).map((f) => ({
        role: f.role === "user" ? "user" : "assistant",
        content: f.text
      }));
      t({
        chatMessages: _o([
          ...a.chatMessages,
          { role: "user", text: s, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        ]),
        chatPending: !0,
        chatError: ""
      });
      try {
        const f = await WI(s, c, l, a.assistantContext);
        t((m) => ({
          chatMessages: _o([
            ...m.chatMessages,
            { role: "assistant", text: f.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: f.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (f) {
        t((m) => ({
          chatMessages: _o([
            ...m.chatMessages,
            { role: "assistant", text: qw(s, l, e().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${f.message || "request failed"}`
        }));
      } finally {
        t({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return o_(e());
    },
    focusQuizScore() {
      return a_(e());
    },
    focusQuizMistakes() {
      return l_(e());
    },
    formatFocusedTime() {
      return Fu(e().elapsedSeconds);
    }
  };
});
function fe({
  children: t,
  className: e = "",
  variant: n = "ghost",
  type: r = "button",
  ...s
}) {
  return /* @__PURE__ */ S.jsx(
    "button",
    {
      className: `glass-button glass-button-${n} ${e}`.trim(),
      type: r,
      ...s,
      children: t
    }
  );
}
function Eo({ as: t = "section", className: e = "", children: n, ...r }) {
  return /* @__PURE__ */ S.jsx(
    cn.div,
    {
      className: `liquid-glass ${e}`.trim(),
      initial: { opacity: 0, y: 14, filter: "blur(10px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      transition: is,
      ...r,
      children: t === "div" ? n : /* @__PURE__ */ S.jsx(t, { className: "liquid-glass-inner", children: n })
    }
  );
}
function ZI({ scene: t, active: e, onSelect: n }) {
  return /* @__PURE__ */ S.jsxs(
    cn.button,
    {
      className: `scene-card ${e ? "active" : ""}`.trim(),
      type: "button",
      "aria-pressed": e,
      onClick: () => n(t.id),
      style: { backgroundImage: `url("${t.image}")` },
      whileHover: { scale: 1.025, y: -2 },
      whileTap: { scale: 0.98 },
      children: [
        /* @__PURE__ */ S.jsx("span", { className: "focus-pill", children: t.kicker }),
        /* @__PURE__ */ S.jsx("strong", { children: t.name }),
        /* @__PURE__ */ S.jsx("span", { children: t.description })
      ]
    }
  );
}
function Xw() {
  const t = H((n) => n.selectedScene), e = H((n) => n.selectScene);
  return /* @__PURE__ */ S.jsx("div", { className: "scene-selector", children: ta.map((n) => /* @__PURE__ */ S.jsx(
    ZI,
    {
      scene: n,
      active: n.id === t,
      onSelect: e
    },
    n.id
  )) });
}
function Jw(t, [e, n]) {
  return Math.min(n, Math.max(e, t));
}
function He(t, e, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(s) {
    if (t == null || t(s), n === !1 || !s || !s.defaultPrevented)
      return e == null ? void 0 : e(s);
  };
}
function u_(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function GI(...t) {
  return (e) => {
    let n = !1;
    const r = t.map((s) => {
      const a = u_(s, e);
      return !n && typeof a == "function" && (n = !0), a;
    });
    if (n)
      return () => {
        for (let s = 0; s < r.length; s++) {
          const a = r[s];
          typeof a == "function" ? a() : u_(t[s], null);
        }
      };
  };
}
function St(...t) {
  return E.useCallback(GI(...t), t);
}
function ia(t, e = []) {
  let n = [];
  function r(a, l) {
    const c = E.createContext(l);
    c.displayName = a + "Context";
    const f = n.length;
    n = [...n, l];
    const m = (d) => {
      var A;
      const { scope: p, children: v, ...w } = d, x = ((A = p == null ? void 0 : p[t]) == null ? void 0 : A[f]) || c, T = E.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ S.jsx(x.Provider, { value: T, children: v });
    };
    m.displayName = a + "Provider";
    function g(d, p, v = {}) {
      var A;
      const { optional: w = !1 } = v, x = ((A = p == null ? void 0 : p[t]) == null ? void 0 : A[f]) || c, T = E.useContext(x);
      if (T) return T;
      if (l !== void 0) return l;
      if (!w)
        throw new Error(`\`${d}\` must be used within \`${a}\``);
    }
    return [m, g];
  }
  const s = () => {
    const a = n.map((l) => E.createContext(l));
    return function(c) {
      const f = (c == null ? void 0 : c[t]) || a;
      return E.useMemo(
        () => ({ [`__scope${t}`]: { ...c, [t]: f } }),
        [c, f]
      );
    };
  };
  return s.scopeName = t, [r, KI(s, ...e)];
}
function KI(...t) {
  const e = t[0];
  if (t.length === 1) return e;
  const n = () => {
    const r = t.map((s) => ({
      useScope: s(),
      scopeName: s.scopeName
    }));
    return function(a) {
      const l = r.reduce((c, { useScope: f, scopeName: m }) => {
        const d = f(a)[`__scope${m}`];
        return { ...c, ...d };
      }, {});
      return E.useMemo(() => ({ [`__scope${e.scopeName}`]: l }), [l]);
    };
  };
  return n.scopeName = e.scopeName, n;
}
var fi = globalThis != null && globalThis.document ? E.useLayoutEffect : () => {
}, YI = Eu[" useInsertionEffect ".trim().toString()] || fi;
function Vu({
  prop: t,
  defaultProp: e,
  onChange: n = () => {
  },
  caller: r
}) {
  const [s, a, l] = qI({
    defaultProp: e,
    onChange: n
  }), c = t !== void 0, f = c ? t : s;
  {
    const g = E.useRef(t !== void 0);
    E.useEffect(() => {
      const d = g.current;
      d !== c && console.warn(
        `${r} is changing from ${d ? "controlled" : "uncontrolled"} to ${c ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), g.current = c;
    }, [c, r]);
  }
  const m = E.useCallback(
    (g) => {
      var d;
      if (c) {
        const p = QI(g) ? g(t) : g;
        p !== t && ((d = l.current) == null || d.call(l, p));
      } else
        a(g);
    },
    [c, t, a, l]
  );
  return [f, m];
}
function qI({
  defaultProp: t,
  onChange: e
}) {
  const [n, r] = E.useState(t), s = E.useRef(n), a = E.useRef(e);
  return YI(() => {
    a.current = e;
  }, [e]), E.useEffect(() => {
    var l;
    s.current !== n && ((l = a.current) == null || l.call(a, n), s.current = n);
  }, [n, s]), [n, r, a];
}
function QI(t) {
  return typeof t == "function";
}
var XI = E.createContext(void 0);
function Wp(t) {
  const e = E.useContext(XI);
  return t || e || "ltr";
}
function JI(t) {
  const e = E.useRef({ value: t, previous: t });
  return E.useMemo(() => (e.current.value !== t && (e.current.previous = e.current.value, e.current.value = t), e.current.previous), [t]);
}
function e2(t) {
  const [e, n] = E.useState(void 0);
  return fi(() => {
    if (t) {
      n({ width: t.offsetWidth, height: t.offsetHeight });
      const r = new ResizeObserver((s) => {
        if (!Array.isArray(s) || !s.length)
          return;
        const a = s[0];
        let l, c;
        if ("borderBoxSize" in a) {
          const f = a.borderBoxSize, m = Array.isArray(f) ? f[0] : f;
          l = m.inlineSize, c = m.blockSize;
        } else
          l = t.offsetWidth, c = t.offsetHeight;
        n({ width: l, height: c });
      });
      return r.observe(t, { box: "border-box" }), () => r.unobserve(t);
    } else
      n(void 0);
  }, [t]), e;
}
var e1 = H_();
// @__NO_SIDE_EFFECTS__
function bu(t) {
  const e = E.forwardRef((n, r) => {
    let { children: s, ...a } = n, l = null, c = !1;
    const f = [];
    c_(s) && typeof Pl == "function" && (s = Pl(s._payload)), E.Children.forEach(s, (p) => {
      var v;
      if (s2(p)) {
        c = !0;
        const w = p;
        let x = "child" in w.props ? w.props.child : w.props.children;
        c_(x) && typeof Pl == "function" && (x = Pl(x._payload)), l = n2(w, x), f.push((v = l == null ? void 0 : l.props) == null ? void 0 : v.children);
      } else
        f.push(p);
    }), l ? l = E.cloneElement(l, void 0, f) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !c && E.Children.count(s) === 1 && E.isValidElement(s) && (l = s)
    );
    const m = l ? i2(l) : void 0, g = St(r, m);
    if (!l) {
      if (s || s === 0)
        throw new Error(
          c ? u2(t) : l2(t)
        );
      return s;
    }
    const d = r2(a, l.props ?? {});
    return l.type !== E.Fragment && (d.ref = r ? g : m), E.cloneElement(l, d);
  });
  return e.displayName = `${t}.Slot`, e;
}
var t2 = Symbol.for("radix.slottable"), n2 = (t, e) => {
  if ("child" in t.props) {
    const n = t.props.child;
    return E.isValidElement(n) ? E.cloneElement(n, void 0, t.props.children(n.props.children)) : null;
  }
  return E.isValidElement(e) ? e : null;
};
function r2(t, e) {
  const n = { ...e };
  for (const r in e) {
    const s = t[r], a = e[r];
    /^on[A-Z]/.test(r) ? s && a ? n[r] = (...c) => {
      const f = a(...c);
      return s(...c), f;
    } : s && (n[r] = s) : r === "style" ? n[r] = { ...s, ...a } : r === "className" && (n[r] = [s, a].filter(Boolean).join(" "));
  }
  return { ...t, ...n };
}
function i2(t) {
  var r, s;
  let e = (r = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : r.get, n = e && "isReactWarning" in e && e.isReactWarning;
  return n ? t.ref : (e = (s = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : s.get, n = e && "isReactWarning" in e && e.isReactWarning, n ? t.props.ref : t.props.ref || t.ref);
}
function s2(t) {
  return E.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === t2;
}
var o2 = Symbol.for("react.lazy");
function c_(t) {
  return t != null && typeof t == "object" && "$$typeof" in t && t.$$typeof === o2 && "_payload" in t && a2(t._payload);
}
function a2(t) {
  return typeof t == "object" && t !== null && "then" in t;
}
var l2 = (t) => `${t} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, u2 = (t) => `${t} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, Pl = Eu[" use ".trim().toString()], c2 = [
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
], Je = c2.reduce((t, e) => {
  const n = /* @__PURE__ */ bu(`Primitive.${e}`), r = E.forwardRef((s, a) => {
    const { asChild: l, ...c } = s, f = l ? n : e;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ S.jsx(f, { ...c, ref: a });
  });
  return r.displayName = `Primitive.${e}`, { ...t, [e]: r };
}, {});
function d2(t, e) {
  t && e1.flushSync(() => t.dispatchEvent(e));
}
function t1(t) {
  const e = t + "CollectionProvider", [n, r] = ia(e), [s, a] = n(
    e,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), l = (x) => {
    const { scope: T, children: A } = x, b = E.useRef(null), C = E.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ S.jsx(s, { scope: T, itemMap: C, collectionRef: b, children: A });
  };
  l.displayName = e;
  const c = t + "CollectionSlot", f = /* @__PURE__ */ bu(c), m = E.forwardRef(
    (x, T) => {
      const { scope: A, children: b } = x, C = a(c, A), M = St(T, C.collectionRef);
      return /* @__PURE__ */ S.jsx(f, { ref: M, children: b });
    }
  );
  m.displayName = c;
  const g = t + "CollectionItemSlot", d = "data-radix-collection-item", p = /* @__PURE__ */ bu(g), v = E.forwardRef(
    (x, T) => {
      const { scope: A, children: b, ...C } = x, M = E.useRef(null), P = St(T, M), z = a(g, A);
      return E.useEffect(() => (z.itemMap.set(M, { ref: M, ...C }), () => void z.itemMap.delete(M))), /* @__PURE__ */ S.jsx(p, { [d]: "", ref: P, children: b });
    }
  );
  v.displayName = g;
  function w(x) {
    const T = a(t + "CollectionConsumer", x);
    return E.useCallback(() => {
      const b = T.collectionRef.current;
      if (!b) return [];
      const C = Array.from(b.querySelectorAll(`[${d}]`));
      return Array.from(T.itemMap.values()).sort(
        (z, O) => C.indexOf(z.ref.current) - C.indexOf(O.ref.current)
      );
    }, [T.collectionRef, T.itemMap]);
  }
  return [
    { Provider: l, Slot: m, ItemSlot: v },
    w,
    r
  ];
}
var n1 = ["PageUp", "PageDown"], r1 = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], i1 = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, As = "Slider", [Ph, f2, h2] = t1(As), [Zp] = ia(As, [
  h2
]), [p2, sa] = Zp(As), s1 = E.forwardRef(
  (t, e) => {
    const {
      name: n,
      min: r = 0,
      max: s = 100,
      step: a = 1,
      orientation: l = "horizontal",
      disabled: c = !1,
      minStepsBetweenThumbs: f = 0,
      defaultValue: m = [r],
      value: g,
      onValueChange: d = () => {
      },
      onValueCommit: p = () => {
      },
      inverted: v = !1,
      form: w,
      ...x
    } = t, T = E.useRef(/* @__PURE__ */ new Set()), A = E.useRef(0), b = E.useRef(!1), M = l === "horizontal" ? m2 : g2, [P, z] = E.useState(null), O = St(e, z), [F = [], L] = Vu({
      prop: g,
      defaultProp: m,
      onChange: (ee) => {
        var W;
        (W = [...T.current][A.current]) == null || W.focus({
          preventScroll: !0,
          focusVisible: b.current
        }), b.current = !1, d(ee);
      }
    }), U = E.useRef(F), G = E.useRef(F);
    E.useEffect(() => {
      const ee = w ? P == null ? void 0 : P.ownerDocument.getElementById(w) : P == null ? void 0 : P.closest("form");
      if (ee instanceof HTMLFormElement) {
        const de = () => L(G.current);
        return ee.addEventListener("reset", de), () => ee.removeEventListener("reset", de);
      }
    }, [P, w, L]);
    function te(ee) {
      const de = S2(F, ee);
      me(ee, de);
    }
    function ae(ee) {
      me(ee, A.current);
    }
    function le() {
      const ee = U.current[A.current];
      F[A.current] !== ee && p(F);
    }
    function me(ee, de, { commit: W } = { commit: !1 }) {
      const J = x1(a), X = ql(Math.round((ee - r) / a) * a + r, J), j = Jw(X, [r, s]);
      L((I = []) => {
        const q = v2(I, j, de);
        if (T2(q, f * a)) {
          A.current = q.indexOf(j);
          const re = String(q) !== String(I);
          return re && W && p(q), re ? q : I;
        } else
          return I;
      });
    }
    return /* @__PURE__ */ S.jsx(
      p2,
      {
        scope: t.__scopeSlider,
        name: n,
        disabled: c,
        min: r,
        max: s,
        valueIndexToChangeRef: A,
        thumbs: T.current,
        values: F,
        orientation: l,
        form: w,
        children: /* @__PURE__ */ S.jsx(Ph.Provider, { scope: t.__scopeSlider, children: /* @__PURE__ */ S.jsx(Ph.Slot, { scope: t.__scopeSlider, children: /* @__PURE__ */ S.jsx(
          M,
          {
            "aria-disabled": c,
            "data-disabled": c ? "" : void 0,
            ...x,
            ref: O,
            onPointerDown: He(x.onPointerDown, () => {
              c || (U.current = F, b.current = !1);
            }),
            min: r,
            max: s,
            inverted: v,
            onSlideStart: c ? void 0 : te,
            onSlideMove: c ? void 0 : ae,
            onSlideEnd: c ? void 0 : le,
            onHomeKeyDown: () => {
              c || (b.current = !0, me(r, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              c || (b.current = !0, me(s, F.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: ee, direction: de }) => {
              if (!c) {
                b.current = !0;
                const X = n1.includes(ee.key) || ee.shiftKey && r1.includes(ee.key) ? 10 : 1, j = A.current, I = F[j], q = A2(I, {
                  min: r,
                  step: a,
                  direction: de,
                  multiplier: X
                });
                me(q, j, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
s1.displayName = As;
var [o1, a1] = Zp(As, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), m2 = E.forwardRef(
  (t, e) => {
    const {
      min: n,
      max: r,
      dir: s,
      inverted: a,
      onSlideStart: l,
      onSlideMove: c,
      onSlideEnd: f,
      onStepKeyDown: m,
      ...g
    } = t, [d, p] = E.useState(null), v = St(e, p), w = E.useRef(void 0), x = Wp(s), T = x === "ltr", A = T && !a || !T && a;
    function b(C) {
      const M = w.current || d.getBoundingClientRect(), P = [0, M.width], O = Gp(P, A ? [n, r] : [r, n]);
      return w.current = M, O(C - M.left);
    }
    return /* @__PURE__ */ S.jsx(
      o1,
      {
        scope: t.__scopeSlider,
        startEdge: A ? "left" : "right",
        endEdge: A ? "right" : "left",
        direction: A ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ S.jsx(
          l1,
          {
            dir: x,
            "data-orientation": "horizontal",
            ...g,
            ref: v,
            style: {
              ...g.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (C) => {
              const M = b(C.clientX);
              l == null || l(M);
            },
            onSlideMove: (C) => {
              const M = b(C.clientX);
              c == null || c(M);
            },
            onSlideEnd: () => {
              w.current = void 0, f == null || f();
            },
            onStepKeyDown: (C) => {
              const P = i1[A ? "from-left" : "from-right"].includes(C.key);
              m == null || m({ event: C, direction: P ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), g2 = E.forwardRef(
  (t, e) => {
    const {
      min: n,
      max: r,
      inverted: s,
      onSlideStart: a,
      onSlideMove: l,
      onSlideEnd: c,
      onStepKeyDown: f,
      ...m
    } = t, g = E.useRef(null), d = St(e, g), p = E.useRef(void 0), v = !s;
    function w(x) {
      const T = p.current || g.current.getBoundingClientRect(), A = [0, T.height], C = Gp(A, v ? [r, n] : [n, r]);
      return p.current = T, C(x - T.top);
    }
    return /* @__PURE__ */ S.jsx(
      o1,
      {
        scope: t.__scopeSlider,
        startEdge: v ? "bottom" : "top",
        endEdge: v ? "top" : "bottom",
        size: "height",
        direction: v ? 1 : -1,
        children: /* @__PURE__ */ S.jsx(
          l1,
          {
            "data-orientation": "vertical",
            ...m,
            ref: d,
            style: {
              ...m.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (x) => {
              const T = w(x.clientY);
              a == null || a(T);
            },
            onSlideMove: (x) => {
              const T = w(x.clientY);
              l == null || l(T);
            },
            onSlideEnd: () => {
              p.current = void 0, c == null || c();
            },
            onStepKeyDown: (x) => {
              const A = i1[v ? "from-bottom" : "from-top"].includes(x.key);
              f == null || f({ event: x, direction: A ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), l1 = E.forwardRef(
  (t, e) => {
    const {
      __scopeSlider: n,
      onSlideStart: r,
      onSlideMove: s,
      onSlideEnd: a,
      onHomeKeyDown: l,
      onEndKeyDown: c,
      onStepKeyDown: f,
      ...m
    } = t, g = sa(As, n);
    return /* @__PURE__ */ S.jsx(
      Je.span,
      {
        ...m,
        ref: e,
        onKeyDown: He(t.onKeyDown, (d) => {
          d.key === "Home" ? (l(d), d.preventDefault()) : d.key === "End" ? (c(d), d.preventDefault()) : n1.concat(r1).includes(d.key) && (f(d), d.preventDefault());
        }),
        onPointerDown: He(t.onPointerDown, (d) => {
          const p = d.target;
          p.setPointerCapture(d.pointerId), d.preventDefault(), g.thumbs.has(p) ? p.focus({ preventScroll: !0, focusVisible: !1 }) : r(d);
        }),
        onPointerMove: He(t.onPointerMove, (d) => {
          d.target.hasPointerCapture(d.pointerId) && s(d);
        }),
        onPointerUp: He(t.onPointerUp, (d) => {
          const p = d.target;
          p.hasPointerCapture(d.pointerId) && (p.releasePointerCapture(d.pointerId), a(d));
        })
      }
    );
  }
), u1 = "SliderTrack", c1 = E.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = sa(u1, n);
    return /* @__PURE__ */ S.jsx(
      Je.span,
      {
        "data-disabled": s.disabled ? "" : void 0,
        "data-orientation": s.orientation,
        ...r,
        ref: e
      }
    );
  }
);
c1.displayName = u1;
var Eh = "SliderRange", d1 = E.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = sa(Eh, n), a = a1(Eh, n), l = E.useRef(null), c = St(e, l), f = s.values.length, m = s.values.map(
      (p) => S1(p, s.min, s.max)
    ), g = f > 1 ? Math.min(...m) : 0, d = 100 - Math.max(...m);
    return /* @__PURE__ */ S.jsx(
      Je.span,
      {
        "data-orientation": s.orientation,
        "data-disabled": s.disabled ? "" : void 0,
        ...r,
        ref: c,
        style: {
          ...t.style,
          [a.startEdge]: g + "%",
          [a.endEdge]: d + "%"
        }
      }
    );
  }
);
d1.displayName = Eh;
var f1 = "SliderThumb", [y2, h1] = Zp(f1), p1 = "SliderThumbProvider";
function m1(t) {
  const {
    __scopeSlider: e,
    name: n,
    children: r,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: s
  } = t, a = sa(p1, e), l = f2(e), [c, f] = E.useState(null), m = E.useMemo(
    () => c ? l().findIndex((T) => T.ref.current === c) : -1,
    [l, c]
  ), g = e2(c), d = c ? !!a.form || !!c.closest("form") : !0, p = a.values[m], v = n ?? (a.name ? a.name + (a.values.length > 1 ? "[]" : "") : void 0), w = p === void 0 ? 0 : S1(p, a.min, a.max);
  E.useEffect(() => {
    if (c)
      return a.thumbs.add(c), () => {
        a.thumbs.delete(c);
      };
  }, [c, a.thumbs]);
  const x = {
    value: p,
    name: v,
    form: a.form,
    isFormControl: d,
    index: m,
    thumb: c,
    onThumbChange: f,
    percent: w,
    size: g
  };
  return /* @__PURE__ */ S.jsx(y2, { scope: e, ...x, children: k2(s) ? s(x) : r });
}
m1.displayName = p1;
var Yl = "SliderThumbTrigger", g1 = E.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = sa(Yl, n), a = a1(Yl, n), { index: l, value: c, percent: f, size: m, onThumbChange: g } = h1(
      Yl,
      n
    ), d = St(e, g), p = _2(l, s.values.length), v = m == null ? void 0 : m[a.size], w = v ? x2(v, f, a.direction) : 0;
    return /* @__PURE__ */ S.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [a.startEdge]: `calc(${f}% + ${w}px)`
        },
        children: /* @__PURE__ */ S.jsx(Ph.ItemSlot, { scope: n, children: /* @__PURE__ */ S.jsx(
          Je.span,
          {
            role: "slider",
            "aria-label": t["aria-label"] || p,
            "aria-valuemin": s.min,
            "aria-valuenow": c,
            "aria-valuemax": s.max,
            "aria-orientation": s.orientation,
            "data-orientation": s.orientation,
            "data-disabled": s.disabled ? "" : void 0,
            tabIndex: s.disabled ? void 0 : 0,
            ...r,
            ref: d,
            style: c === void 0 ? { display: "none" } : t.style,
            onFocus: He(t.onFocus, () => {
              s.valueIndexToChangeRef.current = l;
            })
          }
        ) })
      }
    );
  }
);
g1.displayName = Yl;
var y1 = E.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, name: r, ...s } = t;
    return /* @__PURE__ */ S.jsx(
      m1,
      {
        __scopeSlider: n,
        name: r,
        internal_do_not_use_render: ({ index: a, isFormControl: l }) => /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
          /* @__PURE__ */ S.jsx(
            g1,
            {
              ...s,
              ref: e,
              __scopeSlider: n
            }
          ),
          l ? /* @__PURE__ */ S.jsx(
            _1,
            {
              __scopeSlider: n
            },
            a
          ) : null
        ] })
      }
    );
  }
);
y1.displayName = f1;
var v1 = "SliderBubbleInput", _1 = E.forwardRef(
  ({ __scopeSlider: t, ...e }, n) => {
    const { value: r, name: s, form: a } = h1(v1, t), l = E.useRef(null), c = St(l, n), f = JI(r);
    return E.useEffect(() => {
      const m = l.current;
      if (!m) return;
      const g = window.HTMLInputElement.prototype, p = Object.getOwnPropertyDescriptor(g, "value").set;
      if (f !== r && p) {
        const v = new Event("input", { bubbles: !0 });
        p.call(m, r), m.dispatchEvent(v);
      }
    }, [f, r]), /* @__PURE__ */ S.jsx(
      Je.input,
      {
        style: { display: "none" },
        name: s,
        form: a,
        ...e,
        ref: c,
        defaultValue: r
      }
    );
  }
);
_1.displayName = v1;
function v2(t = [], e, n) {
  const r = [...t];
  return r[n] = e, r.sort((s, a) => s - a);
}
function S1(t, e, n) {
  const a = 100 / (n - e) * (t - e);
  return Jw(a, [0, 100]);
}
function _2(t, e) {
  return e > 2 ? `Value ${t + 1} of ${e}` : e === 2 ? ["Minimum", "Maximum"][t] : void 0;
}
function S2(t, e) {
  if (t.length === 1) return 0;
  const n = t.map((s) => Math.abs(s - e)), r = Math.min(...n);
  return n.indexOf(r);
}
function x2(t, e, n) {
  const r = t / 2, a = Gp([0, 50], [0, r]);
  return (r - a(e) * n) * n;
}
function w2(t) {
  return t.slice(0, -1).map((e, n) => t[n + 1] - e);
}
function T2(t, e) {
  if (e > 0) {
    const n = w2(t);
    return Math.min(...n) >= e;
  }
  return !0;
}
function Gp(t, e) {
  return (n) => {
    if (t[0] === t[1] || e[0] === e[1]) return e[0];
    const r = (e[1] - e[0]) / (t[1] - t[0]);
    return e[0] + r * (n - t[0]);
  };
}
function x1(t) {
  if (!Number.isFinite(t)) return 0;
  const e = t.toString();
  if (e.includes("e")) {
    const [r, s] = e.split("e"), a = r.split(".")[1] || "", l = Number(s);
    return Math.max(0, a.length - l);
  }
  const n = e.split(".")[1];
  return n ? n.length : 0;
}
function ql(t, e) {
  const n = Math.pow(10, e);
  return Math.round(t * n) / n;
}
function A2(t, {
  min: e,
  step: n,
  direction: r,
  multiplier: s
}) {
  const a = x1(n), l = (t - e) / n, c = Math.round(l), f = ql(c * n + e, a) === ql(t, a);
  let m;
  return f ? m = c + s * r : r > 0 ? m = Math.ceil(l) : m = Math.floor(l), ql(m * n + e, a);
}
function k2(t) {
  return typeof t == "function";
}
function d_({ label: t, icon: e, value: n, onChange: r }) {
  return /* @__PURE__ */ S.jsxs("label", { className: "sound-slider", children: [
    /* @__PURE__ */ S.jsxs("span", { className: "sound-slider-head", children: [
      /* @__PURE__ */ S.jsxs("span", { className: "sound-slider-label", children: [
        e,
        /* @__PURE__ */ S.jsx("span", { children: t })
      ] }),
      /* @__PURE__ */ S.jsxs("strong", { children: [
        n,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ S.jsxs(
      s1,
      {
        className: "radix-slider-root",
        value: [n],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (s) => r(s[0]),
        children: [
          /* @__PURE__ */ S.jsx(c1, { className: "radix-slider-track", children: /* @__PURE__ */ S.jsx(d1, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ S.jsx(y1, { className: "radix-slider-thumb", "aria-label": t })
        ]
      }
    )
  ] });
}
function w1({ audioState: t }) {
  const e = H((g) => g.musicType), n = H((g) => g.ambientSound), r = H((g) => g.musicVolume), s = H((g) => g.ambientVolume), a = H((g) => g.audioPlaying), l = H((g) => g.setSound), c = H((g) => g.toggleAudio), f = ju({ musicType: e, ambientSound: n }), m = f.ambientLayers.map((g) => g.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ S.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ S.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ S.jsx("select", { value: e, onChange: (g) => l("musicType", g.target.value), children: rh.map((g) => /* @__PURE__ */ S.jsx("option", { value: g.label, children: g.label }, g.label)) })
    ] }),
    /* @__PURE__ */ S.jsx(
      d_,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ S.jsx(gI, { size: 16, "aria-hidden": "true" }),
        value: r,
        onChange: (g) => l("musicVolume", g)
      }
    ),
    /* @__PURE__ */ S.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ S.jsx("select", { value: n, onChange: (g) => l("ambientSound", g.target.value), children: ih.map((g) => /* @__PURE__ */ S.jsx("option", { value: g.label, children: g.label }, g.label)) })
    ] }),
    /* @__PURE__ */ S.jsx(
      d_,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ S.jsx(vI, { size: 16, "aria-hidden": "true" }),
        value: s,
        onChange: (g) => l("ambientVolume", g)
      }
    ),
    /* @__PURE__ */ S.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ S.jsxs("div", { children: [
        /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ S.jsx("strong", { children: f.musicTrack.title }),
        /* @__PURE__ */ S.jsx("p", { children: m }),
        t != null && t.error ? /* @__PURE__ */ S.jsx("p", { className: "audio-error", children: t.error }) : null
      ] }),
      /* @__PURE__ */ S.jsx(fe, { variant: a ? "primary" : "ghost", onClick: c, children: a ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ S.jsx("div", { className: "audio-links", children: [f.musicTrack, ...f.ambientLayers].filter((g) => g == null ? void 0 : g.pageUrl).map((g) => /* @__PURE__ */ S.jsx("a", { href: g.pageUrl, target: "_blank", rel: "noreferrer", children: g.title || g.label || "Audio source" }, g.pageUrl)) })
  ] });
}
function b2({ audioState: t, onWorkspace: e, onHistory: n }) {
  var g;
  const r = H((d) => d.selectedMaterial), s = H((d) => d.pomodoroDuration), a = H((d) => d.studyGoal), l = H((d) => d.studyPlan), c = H((d) => d.setPomodoroDuration), f = H((d) => d.setStudyGoal), m = H((d) => d.startSession);
  return r ? /* @__PURE__ */ S.jsxs("section", { className: "focus-setup-stage", "aria-label": "Focus Room setup", children: [
    /* @__PURE__ */ S.jsxs(Eo, { className: "focus-setup-scenes", children: [
      /* @__PURE__ */ S.jsx("span", { className: "focus-step-label", children: "Step 01" }),
      /* @__PURE__ */ S.jsx("h1", { children: "Choose your study scene" }),
      /* @__PURE__ */ S.jsx("p", { children: "Pick the cinematic atmosphere that matches this focus block." }),
      /* @__PURE__ */ S.jsxs("article", { className: "material-strip liquid-glass-lite", children: [
        /* @__PURE__ */ S.jsx("span", { className: "focus-pill", children: r.materialType || "Study material" }),
        /* @__PURE__ */ S.jsxs("div", { className: "material-strip-copy", children: [
          /* @__PURE__ */ S.jsx("strong", { children: r.materialTitle || "Study material" }),
          /* @__PURE__ */ S.jsx("p", { children: ((g = r.studyHeadings) == null ? void 0 : g.slice(0, 2).join(" / ")) || "Generated notes" })
        ] })
      ] }),
      /* @__PURE__ */ S.jsx(Xw, {})
    ] }),
    /* @__PURE__ */ S.jsxs(Eo, { className: "focus-setup-controls", children: [
      /* @__PURE__ */ S.jsx("span", { className: "focus-step-label", children: "Step 02" }),
      /* @__PURE__ */ S.jsx("h2", { children: "Set sound atmosphere" }),
      /* @__PURE__ */ S.jsx(w1, { audioState: t }),
      /* @__PURE__ */ S.jsx("span", { className: "focus-step-label", children: "Step 03" }),
      /* @__PURE__ */ S.jsx("h2", { children: "Set Pomodoro" }),
      /* @__PURE__ */ S.jsx("div", { className: "duration-grid", "aria-label": "Pomodoro duration", children: Ix.map((d) => /* @__PURE__ */ S.jsxs(
        fe,
        {
          variant: d === s ? "primary" : "ghost",
          "aria-pressed": d === s,
          onClick: () => c(d),
          children: [
            /* @__PURE__ */ S.jsx(WN, { size: 16, "aria-hidden": "true" }),
            " ",
            d,
            "m"
          ]
        },
        d
      )) }),
      /* @__PURE__ */ S.jsxs("label", { className: "focus-field", children: [
        "Custom duration",
        /* @__PURE__ */ S.jsx(
          "input",
          {
            type: "number",
            min: "10",
            max: "180",
            step: "5",
            value: s,
            onChange: (d) => c(d.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ S.jsxs("label", { className: "focus-field", children: [
        "Study goal",
        /* @__PURE__ */ S.jsx("textarea", { value: a, onChange: (d) => f(d.target.value) })
      ] }),
      /* @__PURE__ */ S.jsxs("div", { className: "plan-preview liquid-glass-lite", children: [
        /* @__PURE__ */ S.jsx("h3", { children: "Study plan" }),
        /* @__PURE__ */ S.jsx("ul", { className: "plan-list", children: l.map((d, p) => /* @__PURE__ */ S.jsxs("li", { children: [
          /* @__PURE__ */ S.jsxs("strong", { children: [
            d.minutes,
            "m"
          ] }),
          /* @__PURE__ */ S.jsx("span", { children: d.task })
        ] }, `${d.task}-${p}`)) })
      ] }),
      /* @__PURE__ */ S.jsxs(fe, { className: "enter-focus-btn", variant: "primary", onClick: m, children: [
        /* @__PURE__ */ S.jsx(Vp, { size: 18, "aria-hidden": "true" }),
        " Enter Focus Room"
      ] })
    ] })
  ] }) : /* @__PURE__ */ S.jsx("section", { className: "focus-empty-stage", children: /* @__PURE__ */ S.jsxs(Eo, { className: "focus-empty-card", children: [
    /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Ready when you are" }),
    /* @__PURE__ */ S.jsx("h1", { children: "Waiting for material" }),
    /* @__PURE__ */ S.jsx("p", { children: "Generate or select study notes in the workspace, then open the Focus Room again." }),
    /* @__PURE__ */ S.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ S.jsx(fe, { variant: "primary", onClick: () => e(), children: "Open Workspace" }),
      /* @__PURE__ */ S.jsx(fe, { onClick: n, children: "Study History" })
    ] })
  ] }) });
}
function C2(t) {
  return t === "paused" ? "Resume" : t === "completed" ? "Restart" : "Start";
}
function P2() {
  var M;
  const t = H((P) => P.elapsedSeconds), e = H((P) => P.pomodoroDuration), n = H((P) => P.timerStatus), r = H((P) => P.isIdle), s = H((P) => P.selectedMaterial), a = H((P) => P.studyGoal), l = H((P) => P.completedTasks), c = H((P) => P.studyPlan), f = H((P) => P.musicType), m = H((P) => P.ambientSound), g = H((P) => P.startTimer), d = H((P) => P.pauseTimer), p = H((P) => P.resetTimer), v = H((P) => P.skipTimer), w = H((P) => P.openStudyPanel), x = Math.max(0, e * 60 - t), T = EI(t, e), A = r ? 0.96 : 1, b = n === "studying" ? { scale: [A, A + 0.012, A] } : { scale: A }, C = ((M = c.find((P) => !l.includes(P.task))) == null ? void 0 : M.task) || "Review your strongest and weakest ideas.";
  return /* @__PURE__ */ S.jsxs(
    cn.article,
    {
      className: "timer-card liquid-glass",
      animate: b,
      transition: n === "studying" ? { duration: 4, repeat: 1 / 0, ease: "easeInOut" } : { duration: 0.2 },
      children: [
        /* @__PURE__ */ S.jsxs("span", { className: "focus-kicker", children: [
          "Focus Block / ",
          n
        ] }),
        /* @__PURE__ */ S.jsxs("div", { className: "timer-card-head", children: [
          /* @__PURE__ */ S.jsxs("div", { children: [
            /* @__PURE__ */ S.jsx("h2", { children: a || `Study ${(s == null ? void 0 : s.materialTitle) || "this material"}` }),
            /* @__PURE__ */ S.jsx("p", { children: (s == null ? void 0 : s.materialTitle) || "Study material" })
          ] }),
          /* @__PURE__ */ S.jsxs("div", { className: "timer-pill-row", children: [
            /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
              f,
              " / ",
              m
            ] }),
            /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
              /* @__PURE__ */ S.jsx(zp, { size: 14, "aria-hidden": "true" }),
              " ",
              l.length,
              "/",
              c.length || 0,
              " tasks"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ S.jsx("div", { className: "timer-value", "aria-live": "polite", children: MI(x) }),
        /* @__PURE__ */ S.jsxs("div", { className: "timer-meta-grid", children: [
          /* @__PURE__ */ S.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ S.jsx("span", { children: "Focused" }),
            /* @__PURE__ */ S.jsx("strong", { children: Fu(t) })
          ] }),
          /* @__PURE__ */ S.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ S.jsx("span", { children: "Block" }),
            /* @__PURE__ */ S.jsxs("strong", { children: [
              e,
              "m"
            ] })
          ] }),
          /* @__PURE__ */ S.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ S.jsx("span", { children: "Next" }),
            /* @__PURE__ */ S.jsx("strong", { children: C })
          ] })
        ] }),
        /* @__PURE__ */ S.jsx("div", { className: "focus-progress-track", "aria-label": "Focus progress", children: /* @__PURE__ */ S.jsx("div", { className: "focus-progress-fill", style: { width: `${T.toFixed(1)}%` } }) }),
        /* @__PURE__ */ S.jsxs("div", { className: "timer-actions", children: [
          /* @__PURE__ */ S.jsxs(fe, { variant: n === "studying" ? "primary" : "ghost", onClick: g, children: [
            /* @__PURE__ */ S.jsx($w, { size: 16, "aria-hidden": "true" }),
            " ",
            C2(n)
          ] }),
          /* @__PURE__ */ S.jsxs(fe, { onClick: () => d(), children: [
            /* @__PURE__ */ S.jsx(Sh, { size: 16, "aria-hidden": "true" }),
            " Pause"
          ] }),
          /* @__PURE__ */ S.jsx(fe, { onClick: () => w("materials"), children: "Materials" }),
          /* @__PURE__ */ S.jsxs(fe, { onClick: p, children: [
            /* @__PURE__ */ S.jsx(Vw, { size: 16, "aria-hidden": "true" }),
            " Reset"
          ] }),
          /* @__PURE__ */ S.jsxs(fe, { onClick: v, children: [
            /* @__PURE__ */ S.jsx(Bw, { size: 16, "aria-hidden": "true" }),
            " Skip"
          ] })
        ] })
      ]
    }
  );
}
function E2() {
  return /* @__PURE__ */ S.jsx(P2, {});
}
function M2({ onWorkspace: t, onHistory: e }) {
  var v, w, x, T;
  const n = H((A) => A.selectedMaterial), r = H((A) => A.selectedScene), s = H((A) => A.panelTab), a = H((A) => A.aiPanelOpen), l = H((A) => A.openDrawer), c = H((A) => A.openStudyPanel), f = H((A) => A.endSession), m = gs(r), g = ((v = n == null ? void 0 : n.sourceHighlights) == null ? void 0 : v.length) || ((w = n == null ? void 0 : n.sourceItems) == null ? void 0 : w.length) || ((x = n == null ? void 0 : n.sources) == null ? void 0 : x.length) || 0, d = Object.keys((n == null ? void 0 : n.sections) || {}).length || ((T = n == null ? void 0 : n.studyHeadings) == null ? void 0 : T.length) || 1, p = (A) => a && s === A;
  return /* @__PURE__ */ S.jsxs("header", { className: "top-nav", children: [
    /* @__PURE__ */ S.jsxs("div", { className: "focus-brand", children: [
      /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Synapse Focus Room" }),
      /* @__PURE__ */ S.jsx("strong", { children: m.name }),
      /* @__PURE__ */ S.jsxs("small", { children: [
        (n == null ? void 0 : n.materialTitle) || "Study material",
        " · ",
        d,
        " section",
        d === 1 ? "" : "s",
        " · ",
        g,
        " source",
        g === 1 ? "" : "s"
      ] })
    ] }),
    /* @__PURE__ */ S.jsxs("nav", { className: "top-nav-actions", "aria-label": "Focus Room controls", children: [
      /* @__PURE__ */ S.jsxs(fe, { className: "focus-command-btn", onClick: () => l("scene"), title: "Change scene", children: [
        /* @__PURE__ */ S.jsx(Lw, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ S.jsx("span", { children: "Scene" })
      ] }),
      /* @__PURE__ */ S.jsxs(fe, { className: "focus-command-btn", onClick: () => l("music"), title: "Sound controls", children: [
        /* @__PURE__ */ S.jsx(iI, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ S.jsx("span", { children: "Sound" })
      ] }),
      /* @__PURE__ */ S.jsxs(fe, { className: `focus-command-btn ${p("materials") ? "is-active" : ""}`.trim(), onClick: () => c("materials"), title: "Open material overview", children: [
        /* @__PURE__ */ S.jsx(zp, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ S.jsx("span", { children: "Materials" })
      ] }),
      /* @__PURE__ */ S.jsxs(fe, { className: `focus-command-btn ${p("notes") ? "is-active" : ""}`.trim(), onClick: () => c("notes"), title: "Read generated notes", children: [
        /* @__PURE__ */ S.jsx(zw, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ S.jsx("span", { children: "Notes" })
      ] }),
      /* @__PURE__ */ S.jsxs(fe, { className: `focus-command-btn ${p("sources") ? "is-active" : ""}`.trim(), onClick: () => c("sources"), title: "Open source highlights", children: [
        /* @__PURE__ */ S.jsx(Kl, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ S.jsx("span", { children: "Sources" })
      ] }),
      /* @__PURE__ */ S.jsxs(fe, { className: `focus-command-btn ${p("chat") ? "is-active" : ""}`.trim(), onClick: () => c("chat"), title: "Open Study Suite", children: [
        /* @__PURE__ */ S.jsx(Tu, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ S.jsx("span", { children: "Study Suite" })
      ] }),
      /* @__PURE__ */ S.jsxs(fe, { className: `focus-command-btn ${p("history") ? "is-active" : ""}`.trim(), onClick: () => c("history"), title: "Open history", children: [
        /* @__PURE__ */ S.jsx($p, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ S.jsx("span", { children: "History" })
      ] }),
      /* @__PURE__ */ S.jsxs(fe, { className: "focus-command-btn", variant: "danger", onClick: f, title: "End focus session", children: [
        /* @__PURE__ */ S.jsx(Uw, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ S.jsx("span", { children: "End" })
      ] })
    ] })
  ] });
}
function R2({ audioState: t }) {
  const e = H((m) => m.audioPlaying), n = H((m) => m.toggleAudio), r = H((m) => m.pauseTimer), s = H((m) => m.resetTimer), a = H((m) => m.skipTimer), l = H((m) => m.endSession), c = H((m) => m.musicVolume), f = H((m) => m.ambientVolume);
  return /* @__PURE__ */ S.jsxs("div", { className: "bottom-dock liquid-glass", "aria-label": "Floating session controls", children: [
    /* @__PURE__ */ S.jsxs("span", { className: "dock-meter", children: [
      "Music ",
      c,
      "%"
    ] }),
    /* @__PURE__ */ S.jsxs("span", { className: "dock-meter", children: [
      "Ambient ",
      f,
      "%"
    ] }),
    /* @__PURE__ */ S.jsxs(fe, { variant: e ? "primary" : "ghost", onClick: n, children: [
      e ? /* @__PURE__ */ S.jsx(Sh, { size: 16, "aria-hidden": "true" }) : /* @__PURE__ */ S.jsx($w, { size: 16, "aria-hidden": "true" }),
      t != null && t.playing ? "Pause" : "Audio"
    ] }),
    /* @__PURE__ */ S.jsxs(fe, { onClick: () => r(), children: [
      /* @__PURE__ */ S.jsx(Sh, { size: 16, "aria-hidden": "true" }),
      " Timer"
    ] }),
    /* @__PURE__ */ S.jsxs(fe, { onClick: a, children: [
      /* @__PURE__ */ S.jsx(Bw, { size: 16, "aria-hidden": "true" }),
      " Skip"
    ] }),
    /* @__PURE__ */ S.jsxs(fe, { onClick: s, children: [
      /* @__PURE__ */ S.jsx(Vw, { size: 16, "aria-hidden": "true" }),
      " Reset"
    ] }),
    /* @__PURE__ */ S.jsxs(fe, { variant: "danger", onClick: l, children: [
      /* @__PURE__ */ S.jsx(Uw, { size: 16, "aria-hidden": "true" }),
      " End"
    ] })
  ] });
}
var N2 = Eu[" useId ".trim().toString()] || (() => {
}), I2 = 0;
function Mo(t) {
  const [e, n] = E.useState(N2());
  return fi(() => {
    n((r) => r ?? String(I2++));
  }, [t]), t || (e ? `radix-${e}` : "");
}
function _s(t) {
  const e = E.useRef(t);
  return E.useEffect(() => {
    e.current = t;
  }), E.useMemo(() => ((...n) => {
    var r;
    return (r = e.current) == null ? void 0 : r.call(e, ...n);
  }), []);
}
var D2 = "DismissableLayer", Mh = "dismissableLayer.update", j2 = "dismissableLayer.pointerDownOutside", F2 = "dismissableLayer.focusOutside", f_, Kp = E.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
}), T1 = E.forwardRef(
  (t, e) => {
    const {
      disableOutsidePointerEvents: n = !1,
      deferPointerDownOutside: r = !1,
      onEscapeKeyDown: s,
      onPointerDownOutside: a,
      onFocusOutside: l,
      onInteractOutside: c,
      onDismiss: f,
      ...m
    } = t, g = E.useContext(Kp), [d, p] = E.useState(null), v = (d == null ? void 0 : d.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, w] = E.useState({}), x = St(e, p), T = Array.from(g.layers), [A] = [
      ...g.layersWithOutsidePointerEventsDisabled
    ].slice(-1), b = A ? T.indexOf(A) : -1, C = d ? T.indexOf(d) : -1, M = g.layersWithOutsidePointerEventsDisabled.size > 0, P = C >= b, z = E.useRef(!1), O = V2(
      (G) => {
        a == null || a(G), c == null || c(G), G.defaultPrevented || f == null || f();
      },
      {
        ownerDocument: v,
        deferPointerDownOutside: r,
        isDeferredPointerDownOutsideRef: z,
        dismissableSurfaces: g.dismissableSurfaces,
        shouldHandlePointerDownOutside: E.useCallback(
          (G) => {
            if (!(G instanceof Node))
              return !1;
            const te = [...g.branches].some(
              (ae) => ae.contains(G)
            );
            return P && !te;
          },
          [g.branches, P]
        )
      }
    ), F = B2((G) => {
      if (r && z.current)
        return;
      const te = G.target;
      [...g.branches].some((le) => le.contains(te)) || (l == null || l(G), c == null || c(G), G.defaultPrevented || f == null || f());
    }, v), L = d ? C === T.length - 1 : !1, U = _s((G) => {
      G.key === "Escape" && (s == null || s(G), !G.defaultPrevented && f && (G.preventDefault(), f()));
    });
    return E.useEffect(() => {
      if (L)
        return v.addEventListener("keydown", U, { capture: !0 }), () => v.removeEventListener("keydown", U, { capture: !0 });
    }, [v, L, U]), E.useEffect(() => {
      if (d)
        return n && (g.layersWithOutsidePointerEventsDisabled.size === 0 && (f_ = v.body.style.pointerEvents, v.body.style.pointerEvents = "none"), g.layersWithOutsidePointerEventsDisabled.add(d)), g.layers.add(d), h_(), () => {
          n && (g.layersWithOutsidePointerEventsDisabled.delete(d), g.layersWithOutsidePointerEventsDisabled.size === 0 && (v.body.style.pointerEvents = f_));
        };
    }, [d, v, n, g]), E.useEffect(() => () => {
      d && (g.layers.delete(d), g.layersWithOutsidePointerEventsDisabled.delete(d), h_());
    }, [d, g]), E.useEffect(() => {
      const G = () => w({});
      return document.addEventListener(Mh, G), () => document.removeEventListener(Mh, G);
    }, []), /* @__PURE__ */ S.jsx(
      Je.div,
      {
        ...m,
        ref: x,
        style: {
          pointerEvents: M ? P ? "auto" : "none" : void 0,
          ...t.style
        },
        onFocusCapture: He(t.onFocusCapture, F.onFocusCapture),
        onBlurCapture: He(t.onBlurCapture, F.onBlurCapture),
        onPointerDownCapture: He(
          t.onPointerDownCapture,
          O.onPointerDownCapture
        )
      }
    );
  }
);
T1.displayName = D2;
var O2 = "DismissableLayerBranch", L2 = E.forwardRef((t, e) => {
  const n = E.useContext(Kp), r = E.useRef(null), s = St(e, r);
  return E.useEffect(() => {
    const a = r.current;
    if (a)
      return n.branches.add(a), () => {
        n.branches.delete(a);
      };
  }, [n.branches]), /* @__PURE__ */ S.jsx(Je.div, { ...t, ref: s });
});
L2.displayName = O2;
function z2() {
  const t = E.useContext(Kp), [e, n] = E.useState(null);
  return E.useEffect(() => {
    if (e)
      return t.dismissableSurfaces.add(e), () => {
        t.dismissableSurfaces.delete(e);
      };
  }, [e, t.dismissableSurfaces]), n;
}
var $2 = () => !0;
function V2(t, e) {
  const {
    ownerDocument: n = globalThis == null ? void 0 : globalThis.document,
    deferPointerDownOutside: r = !1,
    isDeferredPointerDownOutsideRef: s,
    dismissableSurfaces: a,
    shouldHandlePointerDownOutside: l = $2
  } = e, c = _s(t), f = E.useRef(!1), m = E.useRef(!1), g = E.useRef(/* @__PURE__ */ new Map()), d = E.useRef(() => {
  });
  return E.useEffect(() => {
    function p() {
      m.current = !1, s.current = !1, g.current.clear();
    }
    function v() {
      return Array.from(g.current.values()).some(Boolean);
    }
    function w(C) {
      if (!m.current)
        return;
      const M = C.target;
      M instanceof Node && [...a].some((z) => z.contains(M)) || g.current.set(C.type, !0), C.type === "click" && window.setTimeout(() => {
        m.current && d.current();
      }, 0);
    }
    function x(C) {
      m.current && g.current.set(C.type, !1);
    }
    const T = (C) => {
      if (C.target && !f.current) {
        let M = function() {
          n.removeEventListener("click", d.current);
          const z = v();
          p(), z || A1(
            j2,
            c,
            P,
            { discrete: !0 }
          );
        };
        if (!l(C.target)) {
          n.removeEventListener("click", d.current), p(), f.current = !1;
          return;
        }
        const P = { originalEvent: C };
        m.current = !0, s.current = r && C.button === 0, g.current.clear(), !r || C.button !== 0 ? M() : (n.removeEventListener("click", d.current), d.current = M, n.addEventListener("click", d.current, { once: !0 }));
      } else
        n.removeEventListener("click", d.current), p();
      f.current = !1;
    }, A = [
      "pointerup",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "click"
    ];
    for (const C of A)
      n.addEventListener(C, w, !0), n.addEventListener(C, x);
    const b = window.setTimeout(() => {
      n.addEventListener("pointerdown", T);
    }, 0);
    return () => {
      window.clearTimeout(b), n.removeEventListener("pointerdown", T), n.removeEventListener("click", d.current);
      for (const C of A)
        n.removeEventListener(C, w, !0), n.removeEventListener(C, x);
    };
  }, [
    n,
    c,
    r,
    s,
    a,
    l
  ]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => f.current = !0
  };
}
function B2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = _s(t), r = E.useRef(!1);
  return E.useEffect(() => {
    const s = (a) => {
      a.target && !r.current && A1(F2, n, { originalEvent: a }, {
        discrete: !1
      });
    };
    return e.addEventListener("focusin", s), () => e.removeEventListener("focusin", s);
  }, [e, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function h_() {
  const t = new CustomEvent(Mh);
  document.dispatchEvent(t);
}
function A1(t, e, n, { discrete: r }) {
  const s = n.originalEvent.target, a = new CustomEvent(t, { bubbles: !1, cancelable: !0, detail: n });
  e && s.addEventListener(t, e, { once: !0 }), r ? d2(s, a) : s.dispatchEvent(a);
}
var yf = "focusScope.autoFocusOnMount", vf = "focusScope.autoFocusOnUnmount", p_ = { bubbles: !1, cancelable: !0 }, U2 = "FocusScope", k1 = E.forwardRef((t, e) => {
  const {
    loop: n = !1,
    trapped: r = !1,
    onMountAutoFocus: s,
    onUnmountAutoFocus: a,
    ...l
  } = t, [c, f] = E.useState(null), m = _s(s), g = _s(a), d = E.useRef(null), p = St(e, f), v = E.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  E.useEffect(() => {
    if (r) {
      let x = function(C) {
        if (v.paused || !c) return;
        const M = C.target;
        c.contains(M) ? d.current = M : _r(d.current, { select: !0 });
      }, T = function(C) {
        if (v.paused || !c) return;
        const M = C.relatedTarget;
        M !== null && (c.contains(M) || _r(d.current, { select: !0 }));
      }, A = function(C) {
        if (document.activeElement === document.body)
          for (const P of C)
            P.removedNodes.length > 0 && _r(c);
      };
      document.addEventListener("focusin", x), document.addEventListener("focusout", T);
      const b = new MutationObserver(A);
      return c && b.observe(c, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", x), document.removeEventListener("focusout", T), b.disconnect();
      };
    }
  }, [r, c, v.paused]), E.useEffect(() => {
    if (c) {
      g_.add(v);
      const x = document.activeElement;
      if (!c.contains(x)) {
        const A = new CustomEvent(yf, p_);
        c.addEventListener(yf, m), c.dispatchEvent(A), A.defaultPrevented || (H2(Y2(b1(c)), { select: !0 }), document.activeElement === x && _r(c));
      }
      return () => {
        c.removeEventListener(yf, m), setTimeout(() => {
          const A = new CustomEvent(vf, p_);
          c.addEventListener(vf, g), c.dispatchEvent(A), A.defaultPrevented || _r(x ?? document.body, { select: !0 }), c.removeEventListener(vf, g), g_.remove(v);
        }, 0);
      };
    }
  }, [c, m, g, v]);
  const w = E.useCallback(
    (x) => {
      if (!n && !r || v.paused) return;
      const T = x.key === "Tab" && !x.altKey && !x.ctrlKey && !x.metaKey, A = document.activeElement;
      if (T && A) {
        const b = x.currentTarget, [C, M] = W2(b);
        C && M ? !x.shiftKey && A === M ? (x.preventDefault(), n && _r(C, { select: !0 })) : x.shiftKey && A === C && (x.preventDefault(), n && _r(M, { select: !0 })) : A === b && x.preventDefault();
      }
    },
    [n, r, v.paused]
  );
  return /* @__PURE__ */ S.jsx(Je.div, { tabIndex: -1, ...l, ref: p, onKeyDown: w });
});
k1.displayName = U2;
function H2(t, { select: e = !1 } = {}) {
  const n = document.activeElement;
  for (const r of t)
    if (_r(r, { select: e }), document.activeElement !== n) return;
}
function W2(t) {
  const e = b1(t), n = m_(e, t), r = m_(e.reverse(), t);
  return [n, r];
}
function b1(t) {
  const e = [], n = document.createTreeWalker(t, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const s = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || s ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) e.push(n.currentNode);
  return e;
}
function m_(t, e) {
  const n = typeof e.checkVisibility == "function" && e.checkVisibility({ checkVisibilityCSS: !0 });
  for (const r of t)
    if (!(n ? !r.checkVisibility({ checkVisibilityCSS: !0 }) : Z2(r, { upTo: e })))
      return r;
}
function Z2(t, { upTo: e }) {
  if (getComputedStyle(t).visibility === "hidden") return !0;
  for (; t; ) {
    if (e !== void 0 && t === e) return !1;
    if (getComputedStyle(t).display === "none") return !0;
    t = t.parentElement;
  }
  return !1;
}
function G2(t) {
  return t instanceof HTMLInputElement && "select" in t;
}
function _r(t, { select: e = !1 } = {}) {
  if (t && t.focus) {
    const n = document.activeElement;
    t.focus({ preventScroll: !0 }), t !== n && G2(t) && e && t.select();
  }
}
var g_ = K2();
function K2() {
  let t = [];
  return {
    add(e) {
      const n = t[0];
      e !== n && (n == null || n.pause()), t = y_(t, e), t.unshift(e);
    },
    remove(e) {
      var n;
      t = y_(t, e), (n = t[0]) == null || n.resume();
    }
  };
}
function y_(t, e) {
  const n = [...t], r = n.indexOf(e);
  return r !== -1 && n.splice(r, 1), n;
}
function Y2(t) {
  return t.filter((e) => e.tagName !== "A");
}
var q2 = "Portal", C1 = E.forwardRef((t, e) => {
  var c;
  const { container: n, ...r } = t, [s, a] = E.useState(!1);
  fi(() => a(!0), []);
  const l = n || s && ((c = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : c.body);
  return l ? e1.createPortal(/* @__PURE__ */ S.jsx(Je.div, { ...r, ref: e }), l) : null;
});
C1.displayName = q2;
function Q2(t, e) {
  return E.useReducer((n, r) => e[n][r] ?? n, t);
}
var oa = (t) => {
  const { present: e, children: n } = t, r = X2(e), s = typeof n == "function" ? n({ present: r.isPresent }) : E.Children.only(n), a = J2(r.ref, eD(s));
  return typeof n == "function" || r.isPresent ? E.cloneElement(s, { ref: a }) : null;
};
oa.displayName = "Presence";
function X2(t) {
  const [e, n] = E.useState(), r = E.useRef(null), s = E.useRef(t), a = E.useRef("none"), l = E.useRef(void 0), c = t ? "mounted" : "unmounted", [f, m] = Q2(c, {
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
  return E.useEffect(() => {
    f === "mounted" ? (a.current = l.current ?? mo(r.current), l.current = void 0) : a.current = "none";
  }, [f]), fi(() => {
    const g = r.current, d = s.current;
    if (d !== t) {
      const v = a.current, w = mo(g);
      t ? (l.current = w, m("MOUNT")) : w === "none" || (g == null ? void 0 : g.display) === "none" ? m("UNMOUNT") : m(d && v !== w ? "ANIMATION_OUT" : "UNMOUNT"), s.current = t;
    }
  }, [t, m]), fi(() => {
    if (e) {
      let g;
      const d = e.ownerDocument.defaultView ?? window, p = (w) => {
        const T = mo(r.current).includes(CSS.escape(w.animationName));
        if (w.target === e && T && (m("ANIMATION_END"), !s.current)) {
          const A = e.style.animationFillMode;
          e.style.animationFillMode = "forwards", g = d.setTimeout(() => {
            e.style.animationFillMode === "forwards" && (e.style.animationFillMode = A);
          });
        }
      }, v = (w) => {
        w.target === e && (a.current = mo(r.current));
      };
      return e.addEventListener("animationstart", v), e.addEventListener("animationcancel", p), e.addEventListener("animationend", p), () => {
        d.clearTimeout(g), e.removeEventListener("animationstart", v), e.removeEventListener("animationcancel", p), e.removeEventListener("animationend", p);
      };
    } else
      m("ANIMATION_END");
  }, [e, m]), {
    isPresent: ["mounted", "unmountSuspended"].includes(f),
    ref: E.useCallback((g) => {
      if (g) {
        const d = getComputedStyle(g);
        r.current = d, l.current = mo(d);
      } else
        r.current = null;
      n(g);
    }, [])
  };
}
function v_(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function J2(...t) {
  const e = E.useRef(t);
  return e.current = t, E.useCallback((n) => {
    const r = e.current;
    let s = !1;
    const a = r.map((l) => {
      const c = v_(l, n);
      return !s && typeof c == "function" && (s = !0), c;
    });
    if (s)
      return () => {
        for (let l = 0; l < a.length; l++) {
          const c = a[l];
          typeof c == "function" ? c() : v_(r[l], null);
        }
      };
  }, []);
}
function mo(t) {
  return (t == null ? void 0 : t.animationName) || "none";
}
function eD(t) {
  var r, s;
  let e = (r = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : r.get, n = e && "isReactWarning" in e && e.isReactWarning;
  return n ? t.ref : (e = (s = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : s.get, n = e && "isReactWarning" in e && e.isReactWarning, n ? t.props.ref : t.props.ref || t.ref);
}
var El = 0, Cn = null;
function tD() {
  E.useEffect(() => {
    Cn || (Cn = { start: __(), end: __() });
    const { start: t, end: e } = Cn;
    return document.body.firstElementChild !== t && document.body.insertAdjacentElement("afterbegin", t), document.body.lastElementChild !== e && document.body.insertAdjacentElement("beforeend", e), El++, () => {
      El === 1 && (Cn == null || Cn.start.remove(), Cn == null || Cn.end.remove(), Cn = null), El = Math.max(0, El - 1);
    };
  }, []);
}
function __() {
  const t = document.createElement("span");
  return t.setAttribute("data-radix-focus-guard", ""), t.tabIndex = 0, t.style.outline = "none", t.style.opacity = "0", t.style.position = "fixed", t.style.pointerEvents = "none", t;
}
var Nn = function() {
  return Nn = Object.assign || function(e) {
    for (var n, r = 1, s = arguments.length; r < s; r++) {
      n = arguments[r];
      for (var a in n) Object.prototype.hasOwnProperty.call(n, a) && (e[a] = n[a]);
    }
    return e;
  }, Nn.apply(this, arguments);
};
function P1(t, e) {
  var n = {};
  for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, r = Object.getOwnPropertySymbols(t); s < r.length; s++)
      e.indexOf(r[s]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[s]) && (n[r[s]] = t[r[s]]);
  return n;
}
function nD(t, e, n) {
  if (n || arguments.length === 2) for (var r = 0, s = e.length, a; r < s; r++)
    (a || !(r in e)) && (a || (a = Array.prototype.slice.call(e, 0, r)), a[r] = e[r]);
  return t.concat(a || Array.prototype.slice.call(e));
}
var Ql = "right-scroll-bar-position", Xl = "width-before-scroll-bar", rD = "with-scroll-bars-hidden", iD = "--removed-body-scroll-bar-size";
function _f(t, e) {
  return typeof t == "function" ? t(e) : t && (t.current = e), t;
}
function sD(t, e) {
  var n = E.useState(function() {
    return {
      // value
      value: t,
      // last callback
      callback: e,
      // "memoized" public interface
      facade: {
        get current() {
          return n.value;
        },
        set current(r) {
          var s = n.value;
          s !== r && (n.value = r, n.callback(r, s));
        }
      }
    };
  })[0];
  return n.callback = e, n.facade;
}
var oD = typeof window < "u" ? E.useLayoutEffect : E.useEffect, S_ = /* @__PURE__ */ new WeakMap();
function aD(t, e) {
  var n = sD(null, function(r) {
    return t.forEach(function(s) {
      return _f(s, r);
    });
  });
  return oD(function() {
    var r = S_.get(n);
    if (r) {
      var s = new Set(r), a = new Set(t), l = n.current;
      s.forEach(function(c) {
        a.has(c) || _f(c, null);
      }), a.forEach(function(c) {
        s.has(c) || _f(c, l);
      });
    }
    S_.set(n, t);
  }, [t]), n;
}
function lD(t) {
  return t;
}
function uD(t, e) {
  e === void 0 && (e = lD);
  var n = [], r = !1, s = {
    read: function() {
      if (r)
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      return n.length ? n[n.length - 1] : t;
    },
    useMedium: function(a) {
      var l = e(a, r);
      return n.push(l), function() {
        n = n.filter(function(c) {
          return c !== l;
        });
      };
    },
    assignSyncMedium: function(a) {
      for (r = !0; n.length; ) {
        var l = n;
        n = [], l.forEach(a);
      }
      n = {
        push: function(c) {
          return a(c);
        },
        filter: function() {
          return n;
        }
      };
    },
    assignMedium: function(a) {
      r = !0;
      var l = [];
      if (n.length) {
        var c = n;
        n = [], c.forEach(a), l = n;
      }
      var f = function() {
        var g = l;
        l = [], g.forEach(a);
      }, m = function() {
        return Promise.resolve().then(f);
      };
      m(), n = {
        push: function(g) {
          l.push(g), m();
        },
        filter: function(g) {
          return l = l.filter(g), n;
        }
      };
    }
  };
  return s;
}
function cD(t) {
  t === void 0 && (t = {});
  var e = uD(null);
  return e.options = Nn({ async: !0, ssr: !1 }, t), e;
}
var E1 = function(t) {
  var e = t.sideCar, n = P1(t, ["sideCar"]);
  if (!e)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = e.read();
  if (!r)
    throw new Error("Sidecar medium not found");
  return E.createElement(r, Nn({}, n));
};
E1.isSideCarExport = !0;
function dD(t, e) {
  return t.useMedium(e), E1;
}
var M1 = cD(), Sf = function() {
}, Bu = E.forwardRef(function(t, e) {
  var n = E.useRef(null), r = E.useState({
    onScrollCapture: Sf,
    onWheelCapture: Sf,
    onTouchMoveCapture: Sf
  }), s = r[0], a = r[1], l = t.forwardProps, c = t.children, f = t.className, m = t.removeScrollBar, g = t.enabled, d = t.shards, p = t.sideCar, v = t.noRelative, w = t.noIsolation, x = t.inert, T = t.allowPinchZoom, A = t.as, b = A === void 0 ? "div" : A, C = t.gapMode, M = P1(t, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), P = p, z = aD([n, e]), O = Nn(Nn({}, M), s);
  return E.createElement(
    E.Fragment,
    null,
    g && E.createElement(P, { sideCar: M1, removeScrollBar: m, shards: d, noRelative: v, noIsolation: w, inert: x, setCallbacks: a, allowPinchZoom: !!T, lockRef: n, gapMode: C }),
    l ? E.cloneElement(E.Children.only(c), Nn(Nn({}, O), { ref: z })) : E.createElement(b, Nn({}, O, { className: f, ref: z }), c)
  );
});
Bu.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
Bu.classNames = {
  fullWidth: Xl,
  zeroRight: Ql
};
var fD = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function hD() {
  if (!document)
    return null;
  var t = document.createElement("style");
  t.type = "text/css";
  var e = fD();
  return e && t.setAttribute("nonce", e), t;
}
function pD(t, e) {
  t.styleSheet ? t.styleSheet.cssText = e : t.appendChild(document.createTextNode(e));
}
function mD(t) {
  var e = document.head || document.getElementsByTagName("head")[0];
  e.appendChild(t);
}
var gD = function() {
  var t = 0, e = null;
  return {
    add: function(n) {
      t == 0 && (e = hD()) && (pD(e, n), mD(e)), t++;
    },
    remove: function() {
      t--, !t && e && (e.parentNode && e.parentNode.removeChild(e), e = null);
    }
  };
}, yD = function() {
  var t = gD();
  return function(e, n) {
    E.useEffect(function() {
      return t.add(e), function() {
        t.remove();
      };
    }, [e && n]);
  };
}, R1 = function() {
  var t = yD(), e = function(n) {
    var r = n.styles, s = n.dynamic;
    return t(r, s), null;
  };
  return e;
}, vD = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, xf = function(t) {
  return parseInt(t || "", 10) || 0;
}, _D = function(t) {
  var e = window.getComputedStyle(document.body), n = e[t === "padding" ? "paddingLeft" : "marginLeft"], r = e[t === "padding" ? "paddingTop" : "marginTop"], s = e[t === "padding" ? "paddingRight" : "marginRight"];
  return [xf(n), xf(r), xf(s)];
}, SD = function(t) {
  if (t === void 0 && (t = "margin"), typeof window > "u")
    return vD;
  var e = _D(t), n = document.documentElement.clientWidth, r = window.innerWidth;
  return {
    left: e[0],
    top: e[1],
    right: e[2],
    gap: Math.max(0, r - n + e[2] - e[0])
  };
}, xD = R1(), os = "data-scroll-locked", wD = function(t, e, n, r) {
  var s = t.left, a = t.top, l = t.right, c = t.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(rD, ` {
   overflow: hidden `).concat(r, `;
   padding-right: `).concat(c, "px ").concat(r, `;
  }
  body[`).concat(os, `] {
    overflow: hidden `).concat(r, `;
    overscroll-behavior: contain;
    `).concat([
    e && "position: relative ".concat(r, ";"),
    n === "margin" && `
    padding-left: `.concat(s, `px;
    padding-top: `).concat(a, `px;
    padding-right: `).concat(l, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(c, "px ").concat(r, `;
    `),
    n === "padding" && "padding-right: ".concat(c, "px ").concat(r, ";")
  ].filter(Boolean).join(""), `
  }
  
  .`).concat(Ql, ` {
    right: `).concat(c, "px ").concat(r, `;
  }
  
  .`).concat(Xl, ` {
    margin-right: `).concat(c, "px ").concat(r, `;
  }
  
  .`).concat(Ql, " .").concat(Ql, ` {
    right: 0 `).concat(r, `;
  }
  
  .`).concat(Xl, " .").concat(Xl, ` {
    margin-right: 0 `).concat(r, `;
  }
  
  body[`).concat(os, `] {
    `).concat(iD, ": ").concat(c, `px;
  }
`);
}, x_ = function() {
  var t = parseInt(document.body.getAttribute(os) || "0", 10);
  return isFinite(t) ? t : 0;
}, TD = function() {
  E.useEffect(function() {
    return document.body.setAttribute(os, (x_() + 1).toString()), function() {
      var t = x_() - 1;
      t <= 0 ? document.body.removeAttribute(os) : document.body.setAttribute(os, t.toString());
    };
  }, []);
}, AD = function(t) {
  var e = t.noRelative, n = t.noImportant, r = t.gapMode, s = r === void 0 ? "margin" : r;
  TD();
  var a = E.useMemo(function() {
    return SD(s);
  }, [s]);
  return E.createElement(xD, { styles: wD(a, !e, s, n ? "" : "!important") });
}, Rh = !1;
if (typeof window < "u")
  try {
    var Ml = Object.defineProperty({}, "passive", {
      get: function() {
        return Rh = !0, !0;
      }
    });
    window.addEventListener("test", Ml, Ml), window.removeEventListener("test", Ml, Ml);
  } catch {
    Rh = !1;
  }
var Vi = Rh ? { passive: !1 } : !1, kD = function(t) {
  return t.tagName === "TEXTAREA";
}, N1 = function(t, e) {
  if (!(t instanceof Element))
    return !1;
  var n = window.getComputedStyle(t);
  return (
    // not-not-scrollable
    n[e] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !kD(t) && n[e] === "visible")
  );
}, bD = function(t) {
  return N1(t, "overflowY");
}, CD = function(t) {
  return N1(t, "overflowX");
}, w_ = function(t, e) {
  var n = e.ownerDocument, r = e;
  do {
    typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
    var s = I1(t, r);
    if (s) {
      var a = D1(t, r), l = a[1], c = a[2];
      if (l > c)
        return !0;
    }
    r = r.parentNode;
  } while (r && r !== n.body);
  return !1;
}, PD = function(t) {
  var e = t.scrollTop, n = t.scrollHeight, r = t.clientHeight;
  return [
    e,
    n,
    r
  ];
}, ED = function(t) {
  var e = t.scrollLeft, n = t.scrollWidth, r = t.clientWidth;
  return [
    e,
    n,
    r
  ];
}, I1 = function(t, e) {
  return t === "v" ? bD(e) : CD(e);
}, D1 = function(t, e) {
  return t === "v" ? PD(e) : ED(e);
}, MD = function(t, e) {
  return t === "h" && e === "rtl" ? -1 : 1;
}, RD = function(t, e, n, r, s) {
  var a = MD(t, window.getComputedStyle(e).direction), l = a * r, c = n.target, f = e.contains(c), m = !1, g = l > 0, d = 0, p = 0;
  do {
    if (!c)
      break;
    var v = D1(t, c), w = v[0], x = v[1], T = v[2], A = x - T - a * w;
    (w || A) && I1(t, c) && (d += A, p += w);
    var b = c.parentNode;
    c = b && b.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? b.host : b;
  } while (
    // portaled content
    !f && c !== document.body || // self content
    f && (e.contains(c) || e === c)
  );
  return (g && Math.abs(d) < 1 || !g && Math.abs(p) < 1) && (m = !0), m;
}, Rl = function(t) {
  return "changedTouches" in t ? [t.changedTouches[0].clientX, t.changedTouches[0].clientY] : [0, 0];
}, T_ = function(t) {
  return [t.deltaX, t.deltaY];
}, A_ = function(t) {
  return t && "current" in t ? t.current : t;
}, ND = function(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}, ID = function(t) {
  return `
  .block-interactivity-`.concat(t, ` {pointer-events: none;}
  .allow-interactivity-`).concat(t, ` {pointer-events: all;}
`);
}, DD = 0, Bi = [];
function jD(t) {
  var e = E.useRef([]), n = E.useRef([0, 0]), r = E.useRef(), s = E.useState(DD++)[0], a = E.useState(R1)[0], l = E.useRef(t);
  E.useEffect(function() {
    l.current = t;
  }, [t]), E.useEffect(function() {
    if (t.inert) {
      document.body.classList.add("block-interactivity-".concat(s));
      var x = nD([t.lockRef.current], (t.shards || []).map(A_), !0).filter(Boolean);
      return x.forEach(function(T) {
        return T.classList.add("allow-interactivity-".concat(s));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(s)), x.forEach(function(T) {
          return T.classList.remove("allow-interactivity-".concat(s));
        });
      };
    }
  }, [t.inert, t.lockRef.current, t.shards]);
  var c = E.useCallback(function(x, T) {
    if ("touches" in x && x.touches.length === 2 || x.type === "wheel" && x.ctrlKey)
      return !l.current.allowPinchZoom;
    var A = Rl(x), b = n.current, C = "deltaX" in x ? x.deltaX : b[0] - A[0], M = "deltaY" in x ? x.deltaY : b[1] - A[1], P, z = x.target, O = Math.abs(C) > Math.abs(M) ? "h" : "v";
    if ("touches" in x && O === "h" && z.type === "range")
      return !1;
    var F = window.getSelection(), L = F && F.anchorNode, U = L ? L === z || L.contains(z) : !1;
    if (U)
      return !1;
    var G = w_(O, z);
    if (!G)
      return !0;
    if (G ? P = O : (P = O === "v" ? "h" : "v", G = w_(O, z)), !G)
      return !1;
    if (!r.current && "changedTouches" in x && (C || M) && (r.current = P), !P)
      return !0;
    var te = r.current || P;
    return RD(te, T, x, te === "h" ? C : M);
  }, []), f = E.useCallback(function(x) {
    var T = x;
    if (!(!Bi.length || Bi[Bi.length - 1] !== a)) {
      var A = "deltaY" in T ? T_(T) : Rl(T), b = e.current.filter(function(P) {
        return P.name === T.type && (P.target === T.target || T.target === P.shadowParent) && ND(P.delta, A);
      })[0];
      if (b && b.should) {
        T.cancelable && T.preventDefault();
        return;
      }
      if (!b) {
        var C = (l.current.shards || []).map(A_).filter(Boolean).filter(function(P) {
          return P.contains(T.target);
        }), M = C.length > 0 ? c(T, C[0]) : !l.current.noIsolation;
        M && T.cancelable && T.preventDefault();
      }
    }
  }, []), m = E.useCallback(function(x, T, A, b) {
    var C = { name: x, delta: T, target: A, should: b, shadowParent: FD(A) };
    e.current.push(C), setTimeout(function() {
      e.current = e.current.filter(function(M) {
        return M !== C;
      });
    }, 1);
  }, []), g = E.useCallback(function(x) {
    n.current = Rl(x), r.current = void 0;
  }, []), d = E.useCallback(function(x) {
    m(x.type, T_(x), x.target, c(x, t.lockRef.current));
  }, []), p = E.useCallback(function(x) {
    m(x.type, Rl(x), x.target, c(x, t.lockRef.current));
  }, []);
  E.useEffect(function() {
    return Bi.push(a), t.setCallbacks({
      onScrollCapture: d,
      onWheelCapture: d,
      onTouchMoveCapture: p
    }), document.addEventListener("wheel", f, Vi), document.addEventListener("touchmove", f, Vi), document.addEventListener("touchstart", g, Vi), function() {
      Bi = Bi.filter(function(x) {
        return x !== a;
      }), document.removeEventListener("wheel", f, Vi), document.removeEventListener("touchmove", f, Vi), document.removeEventListener("touchstart", g, Vi);
    };
  }, []);
  var v = t.removeScrollBar, w = t.inert;
  return E.createElement(
    E.Fragment,
    null,
    w ? E.createElement(a, { styles: ID(s) }) : null,
    v ? E.createElement(AD, { noRelative: t.noRelative, gapMode: t.gapMode }) : null
  );
}
function FD(t) {
  for (var e = null; t !== null; )
    t instanceof ShadowRoot && (e = t.host, t = t.host), t = t.parentNode;
  return e;
}
const OD = dD(M1, jD);
var j1 = E.forwardRef(function(t, e) {
  return E.createElement(Bu, Nn({}, t, { ref: e, sideCar: OD }));
});
j1.classNames = Bu.classNames;
var LD = function(t) {
  if (typeof document > "u")
    return null;
  var e = Array.isArray(t) ? t[0] : t;
  return e.ownerDocument.body;
}, Ui = /* @__PURE__ */ new WeakMap(), Nl = /* @__PURE__ */ new WeakMap(), Il = {}, wf = 0, F1 = function(t) {
  return t && (t.host || F1(t.parentNode));
}, zD = function(t, e) {
  return e.map(function(n) {
    if (t.contains(n))
      return n;
    var r = F1(n);
    return r && t.contains(r) ? r : (console.error("aria-hidden", n, "in not contained inside", t, ". Doing nothing"), null);
  }).filter(function(n) {
    return !!n;
  });
}, $D = function(t, e, n, r) {
  var s = zD(e, Array.isArray(t) ? t : [t]);
  Il[n] || (Il[n] = /* @__PURE__ */ new WeakMap());
  var a = Il[n], l = [], c = /* @__PURE__ */ new Set(), f = new Set(s), m = function(d) {
    !d || c.has(d) || (c.add(d), m(d.parentNode));
  };
  s.forEach(m);
  var g = function(d) {
    !d || f.has(d) || Array.prototype.forEach.call(d.children, function(p) {
      if (c.has(p))
        g(p);
      else
        try {
          var v = p.getAttribute(r), w = v !== null && v !== "false", x = (Ui.get(p) || 0) + 1, T = (a.get(p) || 0) + 1;
          Ui.set(p, x), a.set(p, T), l.push(p), x === 1 && w && Nl.set(p, !0), T === 1 && p.setAttribute(n, "true"), w || p.setAttribute(r, "true");
        } catch (A) {
          console.error("aria-hidden: cannot operate on ", p, A);
        }
    });
  };
  return g(e), c.clear(), wf++, function() {
    l.forEach(function(d) {
      var p = Ui.get(d) - 1, v = a.get(d) - 1;
      Ui.set(d, p), a.set(d, v), p || (Nl.has(d) || d.removeAttribute(r), Nl.delete(d)), v || d.removeAttribute(n);
    }), wf--, wf || (Ui = /* @__PURE__ */ new WeakMap(), Ui = /* @__PURE__ */ new WeakMap(), Nl = /* @__PURE__ */ new WeakMap(), Il = {});
  };
}, VD = function(t, e, n) {
  n === void 0 && (n = "data-aria-hidden");
  var r = Array.from(Array.isArray(t) ? t : [t]), s = LD(t);
  return s ? (r.push.apply(r, Array.from(s.querySelectorAll("[aria-live], script"))), $D(r, s, n, "aria-hidden")) : function() {
    return null;
  };
}, Uu = "Dialog", [O1] = ia(Uu), [BD, xn] = O1(Uu), Yp = (t) => {
  const {
    __scopeDialog: e,
    children: n,
    open: r,
    defaultOpen: s,
    onOpenChange: a,
    modal: l = !0
  } = t, c = E.useRef(null), f = E.useRef(null), [m, g] = Vu({
    prop: r,
    defaultProp: s ?? !1,
    onChange: a,
    caller: Uu
  });
  return /* @__PURE__ */ S.jsx(
    BD,
    {
      scope: e,
      triggerRef: c,
      contentRef: f,
      contentId: Mo(),
      titleId: Mo(),
      descriptionId: Mo(),
      open: m,
      onOpenChange: g,
      onOpenToggle: E.useCallback(() => g((d) => !d), [g]),
      modal: l,
      children: n
    }
  );
};
Yp.displayName = Uu;
var L1 = "DialogTrigger", UD = E.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = xn(L1, n), a = St(e, s.triggerRef);
    return /* @__PURE__ */ S.jsx(
      Je.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": s.open,
        "aria-controls": s.open ? s.contentId : void 0,
        "data-state": nm(s.open),
        ...r,
        ref: a,
        onClick: He(t.onClick, s.onOpenToggle)
      }
    );
  }
);
UD.displayName = L1;
var qp = "DialogPortal", [HD, z1] = O1(qp, {
  forceMount: void 0
}), Qp = (t) => {
  const { __scopeDialog: e, forceMount: n, children: r, container: s } = t, a = xn(qp, e);
  return /* @__PURE__ */ S.jsx(HD, { scope: e, forceMount: n, children: E.Children.map(r, (l) => /* @__PURE__ */ S.jsx(oa, { present: n || a.open, children: /* @__PURE__ */ S.jsx(C1, { asChild: !0, container: s, children: l }) })) });
};
Qp.displayName = qp;
var Cu = "DialogOverlay", Xp = E.forwardRef(
  (t, e) => {
    const n = z1(Cu, t.__scopeDialog), { forceMount: r = n.forceMount, ...s } = t, a = xn(Cu, t.__scopeDialog);
    return a.modal ? /* @__PURE__ */ S.jsx(oa, { present: r || a.open, children: /* @__PURE__ */ S.jsx(ZD, { ...s, ref: e }) }) : null;
  }
);
Xp.displayName = Cu;
var WD = /* @__PURE__ */ bu("DialogOverlay.RemoveScroll"), ZD = E.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = xn(Cu, n), a = z2(), l = St(e, a);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ S.jsx(j1, { as: WD, allowPinchZoom: !0, shards: [s.contentRef], children: /* @__PURE__ */ S.jsx(
        Je.div,
        {
          "data-state": nm(s.open),
          ...r,
          ref: l,
          style: { pointerEvents: "auto", ...r.style }
        }
      ) })
    );
  }
), Ss = "DialogContent", Jp = E.forwardRef(
  (t, e) => {
    const n = z1(Ss, t.__scopeDialog), { forceMount: r = n.forceMount, ...s } = t, a = xn(Ss, t.__scopeDialog);
    return /* @__PURE__ */ S.jsx(oa, { present: r || a.open, children: a.modal ? /* @__PURE__ */ S.jsx(GD, { ...s, ref: e }) : /* @__PURE__ */ S.jsx(KD, { ...s, ref: e }) });
  }
);
Jp.displayName = Ss;
var GD = E.forwardRef(
  (t, e) => {
    const n = xn(Ss, t.__scopeDialog), r = E.useRef(null), s = St(e, n.contentRef, r);
    return E.useEffect(() => {
      const a = r.current;
      if (a) return VD(a);
    }, []), /* @__PURE__ */ S.jsx(
      $1,
      {
        ...t,
        ref: s,
        trapFocus: n.open,
        disableOutsidePointerEvents: n.open,
        onCloseAutoFocus: He(t.onCloseAutoFocus, (a) => {
          var l;
          a.preventDefault(), (l = n.triggerRef.current) == null || l.focus();
        }),
        onPointerDownOutside: He(t.onPointerDownOutside, (a) => {
          const l = a.detail.originalEvent, c = l.button === 0 && l.ctrlKey === !0;
          (l.button === 2 || c) && a.preventDefault();
        }),
        onFocusOutside: He(
          t.onFocusOutside,
          (a) => a.preventDefault()
        )
      }
    );
  }
), KD = E.forwardRef(
  (t, e) => {
    const n = xn(Ss, t.__scopeDialog), r = E.useRef(!1), s = E.useRef(!1);
    return /* @__PURE__ */ S.jsx(
      $1,
      {
        ...t,
        ref: e,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (a) => {
          var l, c;
          (l = t.onCloseAutoFocus) == null || l.call(t, a), a.defaultPrevented || (r.current || (c = n.triggerRef.current) == null || c.focus(), a.preventDefault()), r.current = !1, s.current = !1;
        },
        onInteractOutside: (a) => {
          var f, m;
          (f = t.onInteractOutside) == null || f.call(t, a), a.defaultPrevented || (r.current = !0, a.detail.originalEvent.type === "pointerdown" && (s.current = !0));
          const l = a.target;
          ((m = n.triggerRef.current) == null ? void 0 : m.contains(l)) && a.preventDefault(), a.detail.originalEvent.type === "focusin" && s.current && a.preventDefault();
        }
      }
    );
  }
), $1 = E.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: s, onCloseAutoFocus: a, ...l } = t, c = xn(Ss, n);
    return tD(), /* @__PURE__ */ S.jsx(S.Fragment, { children: /* @__PURE__ */ S.jsx(
      k1,
      {
        asChild: !0,
        loop: !0,
        trapped: r,
        onMountAutoFocus: s,
        onUnmountAutoFocus: a,
        children: /* @__PURE__ */ S.jsx(
          T1,
          {
            role: "dialog",
            id: c.contentId,
            "aria-describedby": c.descriptionId,
            "aria-labelledby": c.titleId,
            "data-state": nm(c.open),
            ...l,
            ref: e,
            deferPointerDownOutside: !0,
            onDismiss: () => c.onOpenChange(!1)
          }
        )
      }
    ) });
  }
), V1 = "DialogTitle", em = E.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = xn(V1, n);
    return /* @__PURE__ */ S.jsx(Je.h2, { id: s.titleId, ...r, ref: e });
  }
);
em.displayName = V1;
var B1 = "DialogDescription", tm = E.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = xn(B1, n);
    return /* @__PURE__ */ S.jsx(Je.p, { id: s.descriptionId, ...r, ref: e });
  }
);
tm.displayName = B1;
var U1 = "DialogClose", H1 = E.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = xn(U1, n);
    return /* @__PURE__ */ S.jsx(
      Je.button,
      {
        type: "button",
        ...r,
        ref: e,
        onClick: He(t.onClick, () => s.onOpenChange(!1))
      }
    );
  }
);
H1.displayName = U1;
function nm(t) {
  return t ? "open" : "closed";
}
var Tf = !1;
function YD() {
  const [t, e] = E.useState(Tf);
  return E.useEffect(() => {
    Tf || (Tf = !0, e(!0));
  }, []), t;
}
var W1 = Eu[" useSyncExternalStore ".trim().toString()];
function qD() {
  return () => {
  };
}
function QD() {
  return W1(
    qD,
    () => !0,
    () => !1
  );
}
var XD = typeof W1 == "function" ? QD : YD, Af = "rovingFocusGroup.onEntryFocus", JD = { bubbles: !1, cancelable: !0 }, aa = "RovingFocusGroup", [Nh, Z1, ej] = t1(aa), [tj, G1] = ia(
  aa,
  [ej]
), [nj, rj] = tj(aa), K1 = E.forwardRef(
  (t, e) => /* @__PURE__ */ S.jsx(Nh.Provider, { scope: t.__scopeRovingFocusGroup, children: /* @__PURE__ */ S.jsx(Nh.Slot, { scope: t.__scopeRovingFocusGroup, children: /* @__PURE__ */ S.jsx(ij, { ...t, ref: e }) }) })
);
K1.displayName = aa;
var ij = E.forwardRef((t, e) => {
  const {
    __scopeRovingFocusGroup: n,
    orientation: r,
    loop: s = !1,
    dir: a,
    currentTabStopId: l,
    defaultCurrentTabStopId: c,
    onCurrentTabStopIdChange: f,
    onEntryFocus: m,
    preventScrollOnEntryFocus: g = !1,
    ...d
  } = t, p = E.useRef(null), v = St(e, p), w = Wp(a), [x, T] = Vu({
    prop: l,
    defaultProp: c ?? null,
    onChange: f,
    caller: aa
  }), [A, b] = E.useState(!1), C = _s(m), M = Z1(n), P = E.useRef(!1), [z, O] = E.useState(0);
  return E.useEffect(() => {
    const F = p.current;
    if (F)
      return F.addEventListener(Af, C), () => F.removeEventListener(Af, C);
  }, [C]), /* @__PURE__ */ S.jsx(
    nj,
    {
      scope: n,
      orientation: r,
      dir: w,
      loop: s,
      currentTabStopId: x,
      onItemFocus: E.useCallback(
        (F) => T(F),
        [T]
      ),
      onItemShiftTab: E.useCallback(() => b(!0), []),
      onFocusableItemAdd: E.useCallback(
        () => O((F) => F + 1),
        []
      ),
      onFocusableItemRemove: E.useCallback(
        () => O((F) => F - 1),
        []
      ),
      children: /* @__PURE__ */ S.jsx(
        Je.div,
        {
          tabIndex: A || z === 0 ? -1 : 0,
          "data-orientation": r,
          ...d,
          ref: v,
          style: { outline: "none", ...t.style },
          onMouseDown: He(t.onMouseDown, () => {
            P.current = !0;
          }),
          onFocus: He(t.onFocus, (F) => {
            const L = !P.current;
            if (F.target === F.currentTarget && L && !A) {
              const U = new CustomEvent(Af, JD);
              if (F.currentTarget.dispatchEvent(U), !U.defaultPrevented) {
                const G = M().filter((ee) => ee.focusable), te = G.find((ee) => ee.active), ae = G.find((ee) => ee.id === x), me = [te, ae, ...G].filter(
                  Boolean
                ).map((ee) => ee.ref.current);
                Q1(me, g);
              }
            }
            P.current = !1;
          }),
          onBlur: He(t.onBlur, () => b(!1))
        }
      )
    }
  );
}), Y1 = "RovingFocusGroupItem", q1 = E.forwardRef(
  (t, e) => {
    const {
      __scopeRovingFocusGroup: n,
      focusable: r = !0,
      active: s = !1,
      tabStopId: a,
      children: l,
      ...c
    } = t, f = Mo(), m = a || f, g = rj(Y1, n), d = g.currentTabStopId === m, p = Z1(n), { onFocusableItemAdd: v, onFocusableItemRemove: w, currentTabStopId: x } = g, T = XD();
    return fi(() => {
      if (!(!T || !r))
        return v(), () => w();
    }, [T, r, v, w]), E.useEffect(() => {
      if (!(T || !r))
        return v(), () => w();
    }, [T, r, v, w]), /* @__PURE__ */ S.jsx(
      Nh.ItemSlot,
      {
        scope: n,
        id: m,
        focusable: r,
        active: s,
        children: /* @__PURE__ */ S.jsx(
          Je.span,
          {
            tabIndex: d ? 0 : -1,
            "data-orientation": g.orientation,
            ...c,
            ref: e,
            onMouseDown: He(t.onMouseDown, (A) => {
              r ? g.onItemFocus(m) : A.preventDefault();
            }),
            onFocus: He(t.onFocus, () => g.onItemFocus(m)),
            onKeyDown: He(t.onKeyDown, (A) => {
              if (A.key === "Tab" && A.shiftKey) {
                g.onItemShiftTab();
                return;
              }
              if (A.target !== A.currentTarget) return;
              const b = aj(A, g.orientation, g.dir);
              if (b !== void 0) {
                if (A.metaKey || A.ctrlKey || A.altKey || A.shiftKey) return;
                A.preventDefault();
                let M = p().filter((P) => P.focusable).map((P) => P.ref.current);
                if (b === "last") M.reverse();
                else if (b === "prev" || b === "next") {
                  b === "prev" && M.reverse();
                  const P = M.indexOf(A.currentTarget);
                  M = g.loop ? lj(M, P + 1) : M.slice(P + 1);
                }
                setTimeout(() => Q1(M));
              }
            }),
            children: typeof l == "function" ? l({ isCurrentTabStop: d, hasTabStop: x != null }) : l
          }
        )
      }
    );
  }
);
q1.displayName = Y1;
var sj = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function oj(t, e) {
  return e !== "rtl" ? t : t === "ArrowLeft" ? "ArrowRight" : t === "ArrowRight" ? "ArrowLeft" : t;
}
function aj(t, e, n) {
  const r = oj(t.key, n);
  if (!(e === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(e === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r)))
    return sj[r];
}
function Q1(t, e = !1) {
  const n = document.activeElement;
  for (const r of t)
    if (r === n || (r.focus({ preventScroll: e }), document.activeElement !== n)) return;
}
function lj(t, e) {
  return t.map((n, r) => t[(e + r) % t.length]);
}
var uj = K1, cj = q1, Hu = "Tabs", [dj] = ia(Hu, [
  G1
]), X1 = G1(), [fj, rm] = dj(Hu), J1 = E.forwardRef(
  (t, e) => {
    const {
      __scopeTabs: n,
      value: r,
      onValueChange: s,
      defaultValue: a,
      orientation: l = "horizontal",
      dir: c,
      activationMode: f = "automatic",
      ...m
    } = t, g = Wp(c), [d, p] = Vu({
      prop: r,
      onChange: s,
      defaultProp: a ?? "",
      caller: Hu
    });
    return /* @__PURE__ */ S.jsx(
      fj,
      {
        scope: n,
        baseId: Mo(),
        value: d,
        onValueChange: p,
        orientation: l,
        dir: g,
        activationMode: f,
        children: /* @__PURE__ */ S.jsx(
          Je.div,
          {
            dir: g,
            "data-orientation": l,
            ...m,
            ref: e
          }
        )
      }
    );
  }
);
J1.displayName = Hu;
var eT = "TabsList", tT = E.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, loop: r = !0, ...s } = t, a = rm(eT, n), l = X1(n);
    return /* @__PURE__ */ S.jsx(
      uj,
      {
        asChild: !0,
        ...l,
        orientation: a.orientation,
        dir: a.dir,
        loop: r,
        children: /* @__PURE__ */ S.jsx(
          Je.div,
          {
            role: "tablist",
            "aria-orientation": a.orientation,
            ...s,
            ref: e
          }
        )
      }
    );
  }
);
tT.displayName = eT;
var nT = "TabsTrigger", rT = E.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, value: r, disabled: s = !1, ...a } = t, l = rm(nT, n), c = X1(n), f = oT(l.baseId, r), m = aT(l.baseId, r), g = r === l.value;
    return /* @__PURE__ */ S.jsx(
      cj,
      {
        asChild: !0,
        ...c,
        focusable: !s,
        active: g,
        children: /* @__PURE__ */ S.jsx(
          Je.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": g,
            "aria-controls": m,
            "data-state": g ? "active" : "inactive",
            "data-disabled": s ? "" : void 0,
            disabled: s,
            id: f,
            ...a,
            ref: e,
            onMouseDown: He(t.onMouseDown, (d) => {
              !s && d.button === 0 && d.ctrlKey === !1 ? l.onValueChange(r) : d.preventDefault();
            }),
            onKeyDown: He(t.onKeyDown, (d) => {
              s || d.target !== d.currentTarget || [" ", "Enter"].includes(d.key) && l.onValueChange(r);
            }),
            onFocus: He(t.onFocus, () => {
              const d = l.activationMode !== "manual";
              !g && !s && d && l.onValueChange(r);
            })
          }
        )
      }
    );
  }
);
rT.displayName = nT;
var iT = "TabsContent", sT = E.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, value: r, forceMount: s, children: a, ...l } = t, c = rm(iT, n), f = oT(c.baseId, r), m = aT(c.baseId, r), g = r === c.value, d = E.useRef(g);
    return E.useEffect(() => {
      const p = requestAnimationFrame(() => d.current = !1);
      return () => cancelAnimationFrame(p);
    }, []), /* @__PURE__ */ S.jsx(oa, { present: s || g, children: ({ present: p }) => /* @__PURE__ */ S.jsx(
      Je.div,
      {
        "data-state": g ? "active" : "inactive",
        "data-orientation": c.orientation,
        role: "tabpanel",
        "aria-labelledby": f,
        hidden: !p,
        id: m,
        tabIndex: 0,
        ...l,
        ref: e,
        style: {
          ...t.style,
          animationDuration: d.current ? "0s" : void 0
        },
        children: p && a
      }
    ) });
  }
);
sT.displayName = iT;
function oT(t, e) {
  return `${t}-trigger-${e}`;
}
function aT(t, e) {
  return `${t}-content-${e}`;
}
var hj = J1, pj = tT, mj = rT, gj = sT;
const Jl = /* @__PURE__ */ new Map(), eu = /* @__PURE__ */ new Map(), Ji = /* @__PURE__ */ new Map(), kf = /* @__PURE__ */ new Map();
function lT(t) {
  return JSON.stringify(Array.isArray(t) ? t : [t]);
}
function yj(t) {
  const e = typeof t == "function" ? t() : t;
  return {
    data: e,
    error: null,
    hasFetched: !1,
    isFetching: !1,
    isPending: e === void 0
  };
}
function Ro(t, e) {
  return Jl.has(t) || Jl.set(t, yj(e)), Jl.get(t);
}
function bf(t, e) {
  var r;
  const n = {
    ...Ro(t),
    ...e
  };
  return Jl.set(t, n), (r = eu.get(t)) == null || r.forEach((s) => s(n)), n;
}
function vj(t, e) {
  const n = eu.get(t) || /* @__PURE__ */ new Set();
  return n.add(e), eu.set(t, n), () => {
    n.delete(e), n.size || eu.delete(t);
  };
}
function _j(t, e) {
  const n = Symbol(t);
  kf.set(t, n);
  const r = Ro(t);
  bf(t, {
    error: null,
    isFetching: !0,
    isPending: r.data === void 0
  }), Promise.resolve().then(e).then((s) => {
    kf.get(t) === n && bf(t, {
      data: s,
      error: null,
      hasFetched: !0,
      isFetching: !1,
      isPending: !1
    });
  }).catch((s) => {
    kf.get(t) === n && bf(t, {
      error: s instanceof Error ? s : new Error(String(s)),
      hasFetched: !0,
      isFetching: !1,
      isPending: !1
    });
  });
}
const Sj = {
  invalidateQueries({ queryKey: t } = {}) {
    var e;
    if (!t) {
      Ji.forEach((n) => n());
      return;
    }
    (e = Ji.get(lT(t))) == null || e();
  }
};
function uT({ queryKey: t, queryFn: e, initialData: n }) {
  const r = E.useMemo(() => lT(t), [t]), s = E.useRef(e);
  s.current = e;
  const [a, l] = E.useState(() => Ro(r, n));
  return E.useEffect(() => (l(Ro(r, n)), vj(r, l)), [r]), E.useEffect(() => {
    const c = () => _j(r, () => s.current());
    return Ji.set(r, c), Ro(r, n).hasFetched || c(), () => {
      Ji.get(r) === c && Ji.delete(r);
    };
  }, [r]), {
    ...a,
    isError: !!a.error,
    refetch: () => {
      var c;
      return (c = Ji.get(r)) == null ? void 0 : c();
    }
  };
}
function xj() {
  return Sj;
}
function cT() {
  return uT({
    queryKey: ["focus-room", "sessions"],
    queryFn: () => pR()
  });
}
const wj = [
  "Explain this topic more simply.",
  "Test me on this section.",
  "What should I study next?"
];
function Tj() {
  const [t, e] = E.useState(""), n = H((f) => f.assistantContext), r = H((f) => f.chatMessages), s = H((f) => f.chatPending), a = H((f) => f.chatError), l = H((f) => f.askAssistant), c = (f) => {
    l(f), e("");
  };
  return /* @__PURE__ */ S.jsxs("article", { className: "chat-panel", children: [
    n.sectionTitle || n.excerpt ? /* @__PURE__ */ S.jsxs("div", { className: "chat-context-card liquid-glass-lite", children: [
      /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Current focus" }),
      /* @__PURE__ */ S.jsx("strong", { children: n.sectionTitle || "Selected excerpt" }),
      n.excerpt ? /* @__PURE__ */ S.jsx("p", { children: n.excerpt.slice(0, 240) }) : null
    ] }) : null,
    /* @__PURE__ */ S.jsxs("div", { className: "chat-list", children: [
      r.length ? r.map((f, m) => /* @__PURE__ */ S.jsxs("div", { className: `chat-message ${f.role}`, children: [
        /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: f.role === "user" ? "You" : "Synapse" }),
        /* @__PURE__ */ S.jsx("p", { children: f.text })
      ] }, `${f.createdAt}-${m}`)) : /* @__PURE__ */ S.jsx("p", { children: "Try: Explain this topic more simply." }),
      s ? /* @__PURE__ */ S.jsxs("div", { className: "chat-message assistant", children: [
        /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Synapse" }),
        /* @__PURE__ */ S.jsx("p", { children: "Thinking..." })
      ] }) : null
    ] }),
    a ? /* @__PURE__ */ S.jsx("p", { className: "audio-error", children: a }) : null,
    /* @__PURE__ */ S.jsx(
      "textarea",
      {
        className: "answer-input",
        placeholder: "Ask about this material...",
        value: t,
        onChange: (f) => e(f.target.value)
      }
    ),
    /* @__PURE__ */ S.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ S.jsx(fe, { variant: "primary", disabled: s || !t.trim(), onClick: () => c(t), children: "Ask" }),
      wj.map((f) => /* @__PURE__ */ S.jsx(fe, { disabled: s, onClick: () => c(f), children: f }, f))
    ] })
  ] });
}
function Aj({ cards: t }) {
  const e = H((w) => w.flashcardIndex), n = H((w) => w.flashcardSide), r = H((w) => w.flashcardProgress), s = H((w) => w.setFlashcardIndex), a = H((w) => w.flipFlashcard), l = H((w) => w.rateFlashcard), c = H((w) => Object.values(w.flashcardProgress || {}).filter((x) => x && x.difficulty).length), f = t.length, m = Math.min(Math.max(e, 0), Math.max(0, f - 1)), g = t[m], d = Gw(g, m), p = r[d] || {}, v = n === "back" ? "back" : "front";
  return /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ S.jsxs("span", { className: "focus-kicker", children: [
      "Card ",
      m + 1,
      " of ",
      f
    ] }),
    /* @__PURE__ */ S.jsx("h3", { children: v === "back" ? "Answer" : "Prompt" }),
    /* @__PURE__ */ S.jsx("p", { children: v === "back" ? NI(g) : RI(g, m) }),
    p.difficulty ? /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
      "Marked ",
      p.difficulty
    ] }) : null,
    /* @__PURE__ */ S.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ S.jsx(fe, { disabled: m <= 0, onClick: () => s(m - 1), children: "Previous" }),
      /* @__PURE__ */ S.jsx(fe, { variant: "primary", onClick: a, children: v === "back" ? "Show Prompt" : "Reveal Answer" }),
      /* @__PURE__ */ S.jsx(fe, { disabled: m >= f - 1, onClick: () => s(m + 1), children: "Next" })
    ] }),
    /* @__PURE__ */ S.jsx("div", { className: "focus-button-row", children: ["easy", "medium", "hard"].map((w) => /* @__PURE__ */ S.jsxs(
      fe,
      {
        variant: p.difficulty === w ? "primary" : "ghost",
        onClick: () => l(w),
        children: [
          "Mark ",
          w
        ]
      },
      w
    )) }),
    /* @__PURE__ */ S.jsxs("p", { children: [
      c,
      " completed in this material."
    ] })
  ] });
}
class kj {
  static sectionsToMarkdown(e) {
    return Object.entries(e || {}).map(([n, r]) => {
      const s = String(r || "").trim();
      return s ? `## ${n}

${s}` : "";
    }).filter(Boolean).join(`

`);
  }
  static ensureRenderableSummary(e, n = {}) {
    return String(e || "").trim() || this.sectionsToMarkdown(n);
  }
}
const bj = (t, e) => kj.ensureRenderableSummary(t, e), k_ = {
  A: "𝔸",
  B: "𝔹",
  C: "ℂ",
  D: "𝔻",
  E: "𝔼",
  F: "𝔽",
  G: "𝔾",
  H: "ℍ",
  I: "𝕀",
  N: "ℕ",
  P: "ℙ",
  Q: "ℚ",
  R: "ℝ",
  Z: "ℤ"
}, Cj = {
  "\\Alpha": "Α",
  "\\Beta": "Β",
  "\\Gamma": "Γ",
  "\\Delta": "Δ",
  "\\Epsilon": "Ε",
  "\\Zeta": "Ζ",
  "\\Eta": "Η",
  "\\Theta": "Θ",
  "\\Iota": "Ι",
  "\\Kappa": "Κ",
  "\\Lambda": "Λ",
  "\\Mu": "Μ",
  "\\Nu": "Ν",
  "\\Xi": "Ξ",
  "\\Omicron": "Ο",
  "\\Pi": "Π",
  "\\Rho": "Ρ",
  "\\Sigma": "Σ",
  "\\Tau": "Τ",
  "\\Upsilon": "Υ",
  "\\Phi": "Φ",
  "\\Chi": "Χ",
  "\\Psi": "Ψ",
  "\\Omega": "Ω",
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ε",
  "\\varepsilon": "ε",
  "\\zeta": "ζ",
  "\\eta": "η",
  "\\theta": "θ",
  "\\vartheta": "ϑ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\xi": "ξ",
  "\\omicron": "ο",
  "\\pi": "π",
  "\\varpi": "ϖ",
  "\\rho": "ρ",
  "\\varrho": "ϱ",
  "\\sigma": "σ",
  "\\varsigma": "ς",
  "\\tau": "τ",
  "\\upsilon": "υ",
  "\\phi": "φ",
  "\\varphi": "ϕ",
  "\\chi": "χ",
  "\\psi": "ψ",
  "\\omega": "ω",
  "\\times": "×",
  "\\cdot": "·",
  "\\cdotp": "·",
  "\\div": "÷",
  "\\pm": "±",
  "\\mp": "∓",
  "\\ast": "*",
  "\\star": "⋆",
  "\\circ": "∘",
  "\\bullet": "•",
  "\\oplus": "⊕",
  "\\otimes": "⊗",
  "\\leq": "≤",
  "\\le": "≤",
  "\\leqslant": "≤",
  "\\geq": "≥",
  "\\ge": "≥",
  "\\geqslant": "≥",
  "\\neq": "≠",
  "\\ne": "≠",
  "\\equiv": "≡",
  "\\approx": "≈",
  "\\sim": "∼",
  "\\simeq": "≃",
  "\\cong": "≅",
  "\\propto": "∝",
  "\\lt": "<",
  "\\gt": ">",
  "\\ll": "≪",
  "\\gg": "≫",
  "\\infty": "∞",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\angle": "∠",
  "\\perp": "⊥",
  "\\parallel": "∥",
  "\\degree": "°",
  "\\lfloor": "⌊",
  "\\rfloor": "⌋",
  "\\lceil": "⌈",
  "\\rceil": "⌉",
  "\\langle": "<",
  "\\rangle": ">",
  "\\ldots": "…",
  "\\dots": "…",
  "\\cdots": "…",
  "\\in": "∈",
  "\\notin": "∉",
  "\\ni": "∋",
  "\\subseteq": "⊆",
  "\\supseteq": "⊇",
  "\\subset": "⊂",
  "\\supset": "⊃",
  "\\emptyset": "∅",
  "\\varnothing": "∅",
  "\\setminus": "∖",
  "\\cup": "∪",
  "\\cap": "∩",
  "\\forall": "∀",
  "\\exists": "∃",
  "\\nexists": "∄",
  "\\neg": "¬",
  "\\land": "∧",
  "\\wedge": "∧",
  "\\lor": "∨",
  "\\vee": "∨",
  "\\therefore": "∴",
  "\\because": "∵",
  "\\to": "→",
  "\\rightarrow": "→",
  "\\leftarrow": "←",
  "\\leftrightarrow": "↔",
  "\\mapsto": "↦",
  "\\Rightarrow": "⇒",
  "\\Leftarrow": "⇐",
  "\\Leftrightarrow": "⇔",
  "\\implies": "⇒",
  "\\iff": "⇔",
  "\\uparrow": "↑",
  "\\downarrow": "↓",
  "\\sum": "Σ",
  "\\prod": "Π",
  "\\int": "∫",
  "\\iint": "∬",
  "\\iiint": "∭",
  "\\oint": "∮"
}, Pj = [
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "arcsin",
  "arccos",
  "arctan",
  "sinh",
  "cosh",
  "tanh",
  "log",
  "ln",
  "lim",
  "max",
  "min",
  "sup",
  "inf",
  "det",
  "rank",
  "tr",
  "dim",
  "ker",
  "span",
  "Pr"
];
function Ej(t) {
  return String(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Hi(t, e, n) {
  const r = String(t || "").trim();
  return r ? [...r].length <= 2 ? `${r}${e}` : `${n}(${r})` : "";
}
function Mj(t) {
  let e = String(t || "");
  return e = e.replace(/\\mathbb\{([A-Za-z])\}/g, (n, r) => k_[r] || r), e = e.replace(/\\mathbb\s+([A-Za-z])/g, (n, r) => k_[r] || r), e = e.replace(/\\(?:operatorname|text|mathrm|mathbf|mathit|textbf|textit)\{([^{}]*)\}/g, "$1"), e = e.replace(/\\(?:left|right|big|Big|bigg|Bigg)\b/g, ""), e = e.replace(/\\[,;:!]\s*/g, " "), e = e.replace(/\\(?:widehat|hat)\{([^{}]+)\}/g, (n, r) => Hi(r, "̂", "hat")).replace(/\\(?:overline|bar)\{([^{}]+)\}/g, (n, r) => Hi(r, "̄", "bar")).replace(/\\(?:vec|overrightarrow)\{([^{}]+)\}/g, (n, r) => Hi(r, "⃗", "vec")).replace(/\\tilde\{([^{}]+)\}/g, (n, r) => Hi(r, "̃", "tilde")).replace(/\\dot\{([^{}]+)\}/g, (n, r) => Hi(r, "̇", "dot")).replace(/\\ddot\{([^{}]+)\}/g, (n, r) => Hi(r, "̈", "ddot")), Object.entries(Cj).sort((n, r) => r[0].length - n[0].length).forEach(([n, r]) => {
    e = e.replace(new RegExp(Ej(n) + "(?![A-Za-z])", "g"), r);
  }), Pj.forEach((n) => {
    e = e.replace(new RegExp(`\\\\${n}(?![A-Za-z])`, "g"), n);
  }), e.replace(/<=>/g, "⇔").replace(/=>/g, "⇒").replace(/<=/g, "≤").replace(/>=/g, "≥").replace(/!=/g, "≠").replace(new RegExp("(?<!<)-\\>", "g"), "→").replace(/<-/g, "←");
}
const dT = [
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "arcsin",
  "arccos",
  "arctan",
  "sinh",
  "cosh",
  "tanh",
  "log",
  "ln",
  "lim",
  "max",
  "min",
  "sup",
  "inf",
  "det",
  "rank",
  "tr",
  "dim",
  "ker",
  "span",
  "Pr"
];
function Rj(t) {
  const e = String(t || "");
  if (!e.trim()) return e;
  const n = /^(Definition(?:\/mechanism)?|Mechanism|Explanation|Worked example|Source example|Source evidence|Evidence|Implication|Limitation(?:\/(?:misunderstanding|mistake))?|Common mistake|Exam use|Memory hook|Why it matters|How to read it|What to remember|定义|定義|解释|解釋|来源例子|來源例子|源内证据|源內證據|证据|證據|含义|意義|局限|误区|誤區|考试用法|考試用法|常见错误|常見錯誤|记忆钩子|記憶鉤子|为什么重要|為什麼重要|怎么读|怎麼讀|需要记住)\s*[:：]\s*/i, r = /^\s*(#{1,4}\s*)?(Learning question|Source and argument map|Core notes?|Key terms(?: and mechanisms)?|Concepts? explained(?: with source evidence)?|Reading the source evidence|Worked examples?(?: and evidence matrix)?|Source evidence\s*\/\s*example matrix|Exam strategy(?: and common student mistakes)?|How to use major pieces of source evidence|Revision checklist|学习问题|來源與論點地圖|来源与论点地图|核心笔记|核心筆記|关键术语与机制|關鍵術語與機制|复习清单|複習清單)\b.*$/i, s = e.split(`
`), a = (g) => {
    const d = String(g || "").trim().replace(/^[-*]\s+/, "");
    return n.test(d);
  }, l = (g) => {
    const d = String(g || "").replace(/\s*[（(][^)\n）]*(?:->|→|definition|claim|evidence|visual|explicit|teach|exam|quick|writing|interpret|source|定义|定義|证据|證據|图|圖)[^)\n）]*[)）]\s*/gi, "").replace(/\s*(?:—|--|-|:)\s*(?:what\b|how\b|teach\b|then\b|quick\b|high-level\b|definition\b|explicit\b|interpret\b|source\b).*$/i, "").trim();
    return ([
      [/^Learning question\b|^学习问题\b|^學習問題\b/i, "Learning Question"],
      [/^Source and argument map\b|^来源与论点地图\b|^來源與論點地圖\b/i, "Source and Argument Map"],
      [/^Core notes?\b|^核心笔记\b|^核心筆記\b/i, "Core Notes"],
      [/^Key terms(?: and mechanisms)?\b|^关键术语与机制\b|^關鍵術語與機制\b/i, "Key Terms and Mechanisms"],
      [/^Concepts? explained(?: with source evidence)?\b/i, "Concepts Explained With Source Evidence"],
      [/^Reading the source evidence\b/i, "Reading the Source Evidence"],
      [/^Worked examples?(?: and evidence matrix)?\b|^Source evidence\s*\/\s*example matrix\b/i, "Worked Examples and Evidence"],
      [/^Exam strategy(?: and common student mistakes)?\b/i, "Exam Strategy and Common Mistakes"],
      [/^How to use major pieces of source evidence\b|^Using source evidence\b/i, "Using Source Evidence"],
      [/^Revision checklist\b|^复习清单\b|^複習清單\b/i, "Revision Checklist"]
    ].find(([v]) => v.test(d)) || [null, d])[1];
  }, c = (g) => {
    if (!/\[\[VISUAL:\d+\]\]/.test(g || "")) return null;
    const d = String(g || "").trim();
    if (/^\[\[VISUAL:\d+\]\]$/.test(d)) return [d];
    const p = d.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, ""), v = p.match(/\[\[VISUAL:(\d+)\]\]/);
    if (!v) return [g];
    let w = p.slice(0, v.index).trim(), x = p.slice(v.index + v[0].length).trim();
    return w = w.replace(/^(?:before|after)\s+(?:the\s+)?(?:visual|image|figure|source figure|source image)\s*[:：-]?\s*$/i, "").trim(), w = w.replace(/^(?:before|after)\s*[:：-]?\s*$/i, "").trim(), x = x.replace(/^[:：,;.\-\s]+/, "").replace(/^(?:after|before)\s+(?:the\s+)?(?:visual|image|figure|source figure|source image)\s*[:：-]?\s*/i, "").trim(), [w, v[0], x].filter(Boolean);
  }, f = [];
  return s.forEach((g, d) => {
    let p = g.replace(/\s+$/g, "");
    const v = p.trim(), w = v.match(r);
    if (w && !a(v)) {
      f.push(`${w[1] || "## "}${l(w[2])}`);
      return;
    }
    const x = c(p);
    if (x) {
      f.push(...x);
      return;
    }
    const T = p.match(/^(\s*)\d+\.\s+(.+?)\s*$/);
    if (T) {
      const b = s.slice(d + 1).find((M) => M.trim()), C = T[2].trim();
      if (b && a(b) && C.length >= 3 && C.length <= 140 && !C.endsWith(":")) {
        f.push(`### ${C}`);
        return;
      }
    }
    const A = p.match(/^(\s*[-*]\s+)(.+)$/);
    if (A) {
      const b = A[2].replace(n, (C, M) => `**${M}:** `);
      if (b !== A[2]) {
        f.push(b);
        return;
      }
    }
    f.push(p);
  }), f.join(`
`).replace(/\n{4,}/g, `


`).trim();
}
function Ih(t) {
  let e = String(t || ""), n = "";
  for (; e !== n; )
    n = e, e = e.replace(/\\\\(?=[A-Za-z()[\],;:!])/g, "\\");
  return e.replace(/\tfrac\s*\{/g, "\\frac{").replace(/\\(?:tfrac|dfrac)\s*\{/g, "\\frac{").replace(/\\dfrac\s*\{/g, "\\frac{").replace(/\\quad\b/g, " ").replace(/\\qquad\b/g, " ").replace(/\\(?:Rightarrow|Longrightarrow|implies)\b/g, "\\Rightarrow").replace(/\\(?:leftarrow|gets)\b/g, "\\leftarrow");
}
function Nj(t) {
  const e = [...String(t || "")], n = [], r = /* @__PURE__ */ new Set();
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s], l = e[s - 1] || "";
    a === "(" && l !== "\\" ? n.push(s) : a === ")" && l !== "\\" && (n.length ? n.pop() : r.add(s));
  }
  return n.forEach((s) => r.add(s)), e.filter((s, a) => !r.has(a)).join("");
}
function xo(t) {
  const e = Ih(String(t || "")).replace(/\\(?:\(|\)|\[|\])/g, "");
  return Nj(e);
}
function Dh(t) {
  return String(t || "").replace(/(\\\)|\\\])(?=[A-Za-z])/g, "$1 ").replace(/([A-Za-z])(?=(?:\\\(|\\\[))/g, "$1 ").replace(/([.?!。！？])(?=(?:Which|What|Why|How|When|Where|Who|This|That|The|A|An|If|Because|Since|So|Then|Use|Show|Give|Write)\b)/g, "$1 ").replace(/\bvs(?=[A-Z])/g, "vs ").replace(/\b(Lagrange|Leibniz)\s*\(/g, "$1 (").replace(/\b(Which|What|Why|How|When|Where|Who)iscorrect\b/gi, "$1 is correct").replace(/\b(Which|What|Why|How|When|Where|Who)is\b/g, "$1 is").replace(/\bbothrepresent\b/gi, "both represent").replace(/\beachterm\b/gi, "each term").replace(/\bdivideby\b/gi, "divide by").replace(/\bdividedby\b/gi, "divided by").replace(/\baddone\b/gi, "add one").replace(/\badd1\b/gi, "add 1").replace(/\bcalculatedfromfirstprinciples\b/gi, "calculated from first principles").replace(/\bpowerule\b/gi, "power rule").replace(/\busingarea\b/gi, "using area").replace(/\bcausingdivisionbyzero\b/gi, "causing division by zero").replace(/\bcorrectantiderivative\b/gi, "correct antiderivative").replace(/\btotaldeposits\b/gi, "total deposits").replace(/\bwasnotequalto(?=[A-Z]|\b)/gi, "was not equal to ").replace(/\bnotequalto(?=[A-Z]|\b)/gi, "not equal to ").replace(/\b(equal)to(?=[A-Z]|\b)/gi, "$1 to ").replace(/\bismatchedby\b/gi, "is matched by").replace(/\bmatchedby\b/gi, "matched by").replace(/(\([^()\n]{1,60}\))(?=(?:is|are|was|were|because|when|while)\b)/gi, "$1 ").replace(/\b([A-Z][A-Za-z]{2,})(?=\(\d[\d,.\s%]*\))/g, "$1 ").replace(/\b(National|Domestic|Private|Public)(Saving|Investment)\b/g, "$1 $2").replace(/\b(Net)(Capital)(Outflow)\b/g, "$1 $2 $3").replace(/\bpotential(\d+(?:\.\d+)?\s*[KMBT])\b/gi, "potential $$$1");
}
function Ij(t) {
  let e = Dj(Ih(String(t || "")));
  const n = im(e);
  return e = Ih(Mj(Dh(n.text))).replace(/sqrt\s*\(\s*([^()\n]+?)\s*\)/gi, "√($1)").replace(/sqrt\s*([0-9A-Za-z]+)/gi, "√($1)"), Dh(n.restore(e));
}
function tu(t) {
  const e = String(t || "");
  if (!/[=+\-*/^_|∫ΣΠ≈≃≠≤≥<>×·⋅]|\\(?:int|frac|sqrt|lvert|rvert|ln|log|approx|sim|ne|le|ge)\b/.test(e)) return !1;
  const n = e.match(/^\s*([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\s*$/);
  if (n && Wu(n[1], n[2])) return !1;
  const r = e.match(/[A-Za-z]{3,}/g) || [];
  if (r.length < 2) return !1;
  const s = /* @__PURE__ */ new Set([
    ...dT.map((l) => l.toLowerCase()),
    "frac",
    "sqrt",
    "lvert",
    "rvert",
    "left",
    "right",
    "mathrm",
    "operatorname",
    "text",
    "begin",
    "end",
    "bmatrix",
    "pmatrix",
    "matrix",
    "mid",
    "cup",
    "cap",
    "in",
    "notin",
    "and",
    "or",
    "given"
  ]), a = r.filter((l) => !s.has(l.toLowerCase()));
  return a.some((l) => l.length >= 14) ? !0 : a.length >= 2;
}
function Dj(t) {
  return String(t || "").replace(/\\\(([\s\S]{1,700}?)\\\)/g, (e, n) => tu(n) ? n : e).replace(/\\\[([\s\S]{1,1200}?)\\\]/g, (e, n) => tu(n) ? n : e).replace(/\$\$([\s\S]{1,1200}?)\$\$/g, (e, n) => tu(n) ? n : e);
}
function jj(t) {
  return String(t || "").replace(/\\Delta\s*([A-Za-z])/g, "\\Delta $1").replace(/Δ\s*([A-Za-z])/g, "\\Delta $1");
}
function Fj(t, e, n = "LATEX") {
  const r = [];
  return {
    text: String(t || "").replace(e, (a) => {
      const l = `@@${n}_${r.length}@@`;
      return r.push(a), l;
    }),
    restore(a) {
      return r.reduce((l, c, f) => l.split(`@@${n}_${f}@@`).join(c), String(a || ""));
    }
  };
}
function im(t) {
  const e = [], n = (s) => {
    const a = `@@MATHSEG${e.length}@@`;
    return e.push(s), a;
  };
  let r = String(t || "").replace(/\$\$[\s\S]*?\$\$/g, n).replace(/\\\[[\s\S]*?\\\]/g, n).replace(/\\\([\s\S]*?\\\)/g, n);
  return kr.lastIndex = 0, r = r.replace(kr, (s, a, l) => sm(l) ? `${a}${n(`$${l}$`)}` : s), kr.lastIndex = 0, {
    text: r,
    restore(s) {
      return e.reduce((a, l, c) => a.split(`@@MATHSEG${c}@@`).join(l), String(s || ""));
    }
  };
}
const b_ = /* @__PURE__ */ new Set([
  "rise",
  "run",
  "change",
  "time",
  "distance",
  "slope",
  "speed",
  "velocity",
  "cost",
  "benefit",
  "input",
  "output",
  "rate",
  "growth",
  "area",
  "volume",
  "force",
  "mass",
  "work",
  "energy",
  "power"
]);
function Wu(t, e) {
  const n = String(t || "").toLowerCase(), r = String(e || "").toLowerCase();
  return b_.has(n) || b_.has(r);
}
function Oj(t) {
  const e = Fj(t, /\\frac\s*\{[^{}\n]+\}\s*\{[^{}\n]+\}/g, "FRAC");
  let n = e.text.replace(/\bd\s*\/\s*d([A-Za-z])\b/g, "\\frac{d}{d$1}").replace(/\\Delta\s*([A-Za-z])\s*\/\s*\\Delta\s*([A-Za-z])/g, "\\frac{\\Delta $1}{\\Delta $2}").replace(/\b([A-Za-z]{1,8}\s*\([^()\n]{1,120}\))\s*\/\s*([A-Za-z]{1,8}\s*\([^()\n]{1,120}\))/g, "\\frac{$1}{$2}").replace(/\[([^\[\]\n]{1,220})\]\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (r, s, a) => `\\frac{${s.trim()}}{${a.trim()}}`).replace(/\(((?:[^()\n]|\([^()\n]*\)){1,220})\)\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (r, s, a) => `\\frac{${s.trim()}}{${a.trim()}}`).replace(/\(([^()\n]{1,160})\)\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (r, s, a) => `\\frac{${s.trim()}}{${a.trim()}}`).replace(/\b([0-9]+)\s*\/\s*([A-Za-z][A-Za-z0-9]*)\b/g, "\\frac{$1}{$2}").replace(/\b([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\b/g, (r, s, a) => Wu(s, a) ? `\\frac{${s}}{${a}}` : r);
  return n = e.restore(n), n;
}
function Lj(t) {
  return String(t || "").replace(
    /\b(P|Pr)\s*\(\s*([^()\n|]{1,100}?)\s*\|\s*([^()\n|]{1,100}?)\s*\)/g,
    (e, n, r, s) => `${n}(${r.trim()} \\mid ${s.trim()})`
  );
}
function fT(t) {
  return Oj(Lj(jj(xo(String(t || ""))))).trim().replace(/[−–—]/g, "-").replace(/\|([^|\n]{1,100})\|/g, "\\lvert $1 \\rvert").replace(/∪/g, "\\cup ").replace(/∩/g, "\\cap ").replace(/∈/g, "\\in ").replace(/∉/g, "\\notin ").replace(/∫/g, "\\int ").replace(/Σ/g, "\\sum ").replace(/Π/g, "\\prod ").replace(/∞/g, "\\infty ").replace(/∂/g, "\\partial ").replace(/∇/g, "\\nabla ").replace(/÷/g, "\\div ").replace(/[·⋅]/g, "\\cdot ").replace(/×/g, "\\times ").replace(/≈/g, "\\approx ").replace(/≃/g, "\\simeq ").replace(/≡/g, "\\equiv ").replace(/≠/g, "\\ne ").replace(/≤/g, "\\le ").replace(/≥/g, "\\ge ").replace(/→/g, "\\to ").replace(/\bdet\s*\(/gi, "\\det(").replace(/\band\b/gi, "\\;\\text{and}\\;").replace(/\bor\b/gi, "\\;\\text{or}\\;").replace(/\bsqrt\s*\(\s*([^()\n]+?)\s*\)/gi, "\\sqrt{$1}").replace(/√\s*\(\s*([^()\n]+?)\s*\)/g, "\\sqrt{$1}").replace(/√\s*([0-9A-Za-z]+)/g, "\\sqrt{$1}").replace(/\^\s*\(([^()\n]{1,60})\)/g, "^{$1}").replace(/\^\s*([-+]?\d{1,4}|[A-Za-z])(?=$|[^A-Za-z0-9])/g, "^{$1}").replace(/_\s*([A-Za-z0-9]{1,6})\b/g, "_{$1}").replace(/\s+/g, " ");
}
function zj(t) {
  const e = [];
  return String(t || "").replace(/\[\s*([^\[\]\n]*?)\s*\]/g, (n, r) => {
    const s = r.split(/\s*,\s*/).map((a) => fT(a)).filter(Boolean);
    return s.length && e.push(s.join(" & ")), "";
  }), e.length ? `\\begin{bmatrix}${e.join(" \\\\ ")}\\end{bmatrix}` : t;
}
function $j(t) {
  return String(t || "").replace(
    /\[\s*(\[[^\[\]\n]*\]\s*(?:,\s*\[[^\[\]\n]*\]\s*)+)\]/g,
    zj
  );
}
function Vj(t, e) {
  var d, p;
  const n = t.slice(0, e), r = t.slice(e + 1);
  if (/\s$/.test(n) && /^\s/.test(r)) return !1;
  const s = r.indexOf("|");
  if (s >= 0) {
    const v = r.slice(0, s).trim(), w = n.trimEnd();
    if (v && v.length <= 80 && /^[A-Za-z0-9\\{}\s.+\-*/^_]+$/.test(v) && (!w || w.endsWith("|") || /(?:\\?ln|\\?log|\\?det)$/i.test(w) || /[=+\-*/^(]$/.test(w)))
      return !0;
  }
  const a = ((d = n.match(/\S(?=\s*$)/)) == null ? void 0 : d[0]) || "", l = ((p = r.match(/^\s*(\S)/)) == null ? void 0 : p[1]) || "";
  if (!a || !l) return !1;
  const c = /[A-Za-z0-9}\])∞πθαβγδλμσω]/.test(a), f = /[A-Za-z0-9({\\√∫ΣΠ+\-≤≥≠<>πθαβγδλμσω]/.test(l) || l === ")", m = n.lastIndexOf("|");
  if (m >= 0 && c && f) {
    const v = n.slice(0, m), w = v.trimEnd(), x = n.slice(m + 1).trim();
    if (x && x.length <= 80 && /^[A-Za-z0-9\\{}\s.+\-*/^_]+$/.test(x) && (w.endsWith("|") || /(?:\\?ln|\\?log|\\?det|\\?frac|\\?sqrt|[=+\-*/^_(])\s*$/i.test(v)))
      return !0;
  }
  const g = n.slice(-18);
  return c && /[)\]}.,;:]/.test(l) ? !0 : c && f && /(?:\\?ln|\\?log|\\?det|\\?frac|\\?sqrt|[=+\-*/^_(]|∫|Σ|Π|√)\s*[^|]*$/i.test(g);
}
function Bj(t, e) {
  const n = String(t || "").slice(0, e), r = String(t || "").slice(e + 1), s = n.lastIndexOf("("), a = n.lastIndexOf(")");
  if (s < 0 || s < a || !/(?:^|[^A-Za-z0-9_])(?:P|Pr)\s*$/i.test(n.slice(0, s))) return !1;
  const l = r.indexOf(")");
  if (l < 0) return !1;
  const c = n.slice(s + 1).trim(), f = r.slice(0, l).trim();
  return !!(c && f && c.length <= 100 && f.length <= 100);
}
function jh(t, e = 0) {
  let n = String(t || "").trim();
  n.startsWith("|") && (n = n.slice(1)), n.endsWith("|") && (n = n.slice(0, -1));
  const r = [];
  let s = "", a = "";
  for (let l = 0; l < n.length; l += 1) {
    const c = n[l], f = n[l - 1] || "", m = n[l + 1] || "";
    if (c === "\\" && m) {
      const g = c + m;
      !a && (g === "\\(" || g === "\\[") ? a = g === "\\(" ? "\\)" : "\\]" : a && g === a && (a = ""), s += g, l += 1;
      continue;
    }
    if (c === "$" && f !== "\\") {
      a ? a === "$" && (a = "") : a = "$", s += c;
      continue;
    }
    if (c === "|" && !a && f !== "\\" && !Vj(n, l) && !Bj(n, l)) {
      r.push(s.trim()), s = "";
      continue;
    }
    s += c;
  }
  if (r.push(s.trim()), e > 0 && r.length < e)
    return r.concat(Array.from({ length: e - r.length }, () => ""));
  if (e > 0 && r.length > e) {
    const l = r.length - e;
    let c = r.findIndex((f, m) => m < r.length - 1 && /(?:\\?ln|\\?log|∫|Σ|Π|√|sqrt|frac|abs|absolute|=|x\^|x_|\($)/i.test(f));
    return c < 0 && (c = Math.max(0, e - 2)), [
      ...r.slice(0, c),
      r.slice(c, c + l + 1).join(" | ").trim(),
      ...r.slice(c + l + 1)
    ];
  }
  return r;
}
function hT(t) {
  let e = Dh(String(t || "")).trimEnd(), n = "";
  const r = (b) => {
    n = e.slice(b) + n, e = e.slice(0, b).trimEnd();
  }, s = e.match(/^([A-Za-z]\s*(?:∩|∪|\\cap|\\cup)\s*[A-Za-z]\s*=\s*\{[^{}\n]{1,240}\})([.,;:]?[\s\S]*)$/);
  if (s)
    return e = s[1], n = s[2] + n, { formula: e, trailing: n };
  const a = e.match(/^(d\s*\/\s*d[A-Za-z]|\\frac\{d\}\{d[A-Za-z]\})([\s\S]+)$/);
  if (a && /^(?:\s*\)|\s+(?:vs|versus)\b|[,.;:])/.test(a[2]))
    return e = a[1], n = a[2] + n, { formula: e, trailing: n };
  const l = e.match(/^(\([^()\n]{1,160}(?:=|≈|≃|≠|≤|≥|<|>)[^()\n]{1,160}\))(\s*(?:is|are|was|were|be|being|the|a|an|this|that|which|where|when|because|since|so|then|and|but)\b[\s\S]*)$/i);
  if (l)
    return e = l[1], n = l[2].replace(/^\s*/, " ") + n, { formula: e, trailing: n };
  const c = e.match(/\s*(?:→|⇒|->)\s+(?=(?:derivative|antiderivative|area|proof|power|rule|calculated|using|from|by|with)\b)/i);
  c && c.index > 0 && r(c.index);
  const f = e.match(/[:;]\s+(?=(?:[A-Za-z][A-Za-z-]{2,}|[A-Z][A-Za-z0-9]*(?:\s|$)))/);
  f && f.index > 0 && r(f.index);
  const m = e.match(/[:;]\s*(?=(?:[A-Za-z][A-Za-z0-9]*'?\s*\(|[A-Za-z]\s*(?:=|≈|≃|≠|≤|≥|<|>)|tangent|slope|line|where|then|with|use|show|therefore|remember)\b)/i);
  m && m.index > 0 && r(m.index + 1);
  const g = e.match(/[.?!。！？]\s*(?=(?:which|what|why|how|who|choose|select|identify|state|explain|find|compute|differentiate|integrate|solve|evaluate|determine|is|are|does|do|can|should|would|show|give|write)\b)/i);
  g && g.index > 0 && r(g.index + 1);
  const d = e.match(/^([\s\S]*?[=≈≃≠≤≥<>]\s*(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\})(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\}))*)(\s+[A-Za-z][A-Za-z-]{2,}[\s\S]*)$/);
  d && d[1].length > 0 && r(d[1].length);
  const p = String.raw`(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:[A-Za-z0-9]{0,3})?(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\}|\([^()\n]{1,80}\))`, v = e.match(new RegExp(
    String.raw`^([\s\S]*?[=≈≃≠≤≥<>]\s*${p}(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*${p})*)(\s+(?:is|are|was|were|be|being|questions?|the|a|an|this|that|which|where|when|because|since|so|then|and|but)\b[\s\S]*)$`,
    "i"
  ));
  v && v[1].length > 0 && r(v[1].length);
  const w = e.match(new RegExp(
    String.raw`^([\s\S]*?[=≈≃≠≤≥<>]\s*${p}(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*${p})*)(\s+to\s+(?:calculate|compute|find|solve|show|explain|keep|produce|derive|estimate|work|remember)\b[\s\S]*)$`,
    "i"
  ));
  w && w[1].length > 0 && r(w[1].length);
  const x = e.match(/\s+\(([^()]*)\)\s*$/);
  if (x) {
    const b = x[1].trim(), C = (b.match(/[A-Za-z]{2,}/g) || []).length, M = /[=<>^_\\]|[+\-*/]\s*\d|\d\s*[+\-*/]/.test(b);
    C >= 2 && !M && r(x.index);
  }
  const T = [
    /(?=(?:Which|What|Why|How|Who|Choose|Select|Identify|State|Explain|Show|Give|Write)\b)/,
    /\s+\((?:explicit|show|if|required|where|since|because|when|while|which|this|that|treat|use|note|i\.e\.|e\.g\.)\b[\s\S]*$/i,
    /\s+(?:which|what|why|how|who|choose|select|identify|state|explain|show|give|write)\b[\s\S]*$/i,
    /[,;:]?\s+(?:according|special\s+case|case|or|unless|except|when|while|if|but|for)\b[\s\S]*$/i,
    /[,;:]?\s+(?:compute|find|solve|evaluate|determine)\b[\s\S]*$/i,
    /[,;:]?\s+(?:and|then|with|where|gives?|shows?|means?|makes?|causes?|causing|requires?|therefore|because|since|so|hence|thus)\s+\(?[A-Za-z\u0370-\u03ff∂∇∫ΣΠℝℂℕℤ][\s\S]*$/i,
    /[,;:]?\s+(?:the|a|an)\s+(?:correct|main|final|next|same|rule|answer|antiderivative|derivative|matrix|value|result|step)\b[\s\S]*$/i
  ];
  for (const b of T) {
    const C = e.match(b);
    C && C.index > 0 && r(C.index);
  }
  const A = e.match(/([.,;:!?？。！])$/);
  for (A && (n = A[1] + n, e = e.slice(0, -1).trimEnd()); e.endsWith(")"); ) {
    const b = (e.match(/\(/g) || []).length;
    if ((e.match(/\)/g) || []).length <= b) break;
    n = ")" + n, e = e.slice(0, -1).trimEnd();
  }
  return { formula: e, trailing: n };
}
function Uj(t) {
  const e = String(t || ""), r = [
    /(?:^|[^\w])(\\(?:frac|tfrac|dfrac)\s*\{)/,
    /(?:^|[^\w])((?:P|Pr)\s*\([^()\n]{1,120}\)\s*(?:=|≈|≃|≠|≤|≥|<|>)\s*)/i,
    /(?:^|[^\w])([A-Za-z]\s*(?:∩|∪|\\cap|\\cup)\s*[A-Za-z]\s*=\s*\{)/,
    /(?:^|[^\w])([A-Za-z]\s*(?:∩|∪|\\cap|\\cup)\s*[A-Za-z])/,
    /(?:^|[^\w])((?:d\s*\/\s*d[A-Za-z]|(?:\\Delta|Δ)\s*[A-Za-z]\s*\/\s*(?:\\Delta|Δ)\s*[A-Za-z]|\[[^\[\]\n]{1,220}\]\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)|\((?:[^()\n]|\([^()\n]*\)){1,220}\)\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)))/,
    /(?:^|[^\w])(((?:[-+]?\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9_{}^\\-]*|\([^()\n]{1,40}\))\s*(?:\\cdot|·|⋅|×|\*)\s*)?\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\})/,
    /\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}/,
    /(?:^|[^\w])(\([^()\n]{0,80}(?:=|≈|≃|≠|≤|≥|<|>)[^()\n]{0,80}\))/,
    /(?:^|[^\w])(\([^()\n]{1,80}\)\s*(?:=|≈|≃|≠|≤|≥|<|>))/,
    /(?:^|[^\w])((?!(?:makes?|causes?|causing|requires?|explains?|shows?|means?|because|since|where|when|while|which|that|this)\b)[A-Za-z][A-Za-z0-9]*'?\s*\([^()\n]{1,36}\)\s*(?:=|≈|≃|≠|≤|≥|<|>))/i,
    /(?:^|[^\w])((?:[-+]?\d+(?:\.\d+)?\s*)?[A-Za-z][A-Za-z0-9_{}^\\-]*(?:\s*(?:\+|-|−|–|—|·|⋅|×|\*|\/)\s*(?:[-+]?\d+(?:\.\d+)?\s*)?[A-Za-z0-9_{}^\\()+-]+)*\s*(?:=|≈|≃|≠|≤|≥|<|>))/,
    /(?:^|[^\w])([A-Za-z]\s*(?:=|≈|≃|≠|≤|≥|<|>)\s*)/,
    /(?:^|[^\w])(det\s*\()/i,
    /(?:^|[^\w])((?:ln|log)\s*\|[^|\n]{1,100}\|(?:\s*[+\-]\s*[A-Za-z])?)/i,
    /(?:^|[^\w])(\|[^|\n]{1,100}\|\s*(?:=|≠|≤|≥|<|>|[+\-]))/,
    /(?:^|[^\w])([∫ΣΠ]\s*[A-Za-z0-9_{}^\\()+\-*/| ]{1,80}\s*(?:d[A-Za-z]\b|=|≈|≃))/,
    /(?:^|[^\w])([A-Za-z][A-Za-z0-9]*\s*\^\s*\{[^{}]+\})/
  ].map((s) => {
    const a = e.match(s);
    if (!a) return -1;
    const l = a[1] ? a[0].indexOf(a[1]) : 0;
    return (a.index || 0) + Math.max(0, l);
  }).filter((s) => s >= 0);
  return r.length ? Math.min(...r) : -1;
}
function pT(t) {
  const e = String(t || "");
  if (/^\s*[-+]?\d+(?:\.\d+)?\s*[A-Za-z]\s*$/.test(e)) return !0;
  if (e.length < 3 || e.length > 700 || /(?:https?:\/\/|www\.|youtu\.?be|youtube\.com)/i.test(e)) return !1;
  const n = e.match(/^\s*\(([\s\S]*)\)\s*$/);
  if (n) {
    const a = n[1], l = a.match(/[A-Za-z]{3,}/g) || [], c = /[≠≤≥<>^_∫ΣΠ√]|\\(?:frac|sqrt|int|sum|prod|lvert|rvert|approx|simeq)\b|(?:^|[^A-Za-z])(?:[A-Za-z]\s*(?:=|≈|≃)|(?:=|≈|≃)\s*[-+]?\d|\d\s*[+\-*/]\s*\d)/.test(a);
    if (l.length >= 2 && !c) return !1;
  }
  if (tu(e)) return !1;
  if (/\b(?:P|Pr)\s*\([^()\n]{1,120}\)/.test(e) && /[=≈≃≠≤≥<>]|\\mid|\||∩|∪/.test(e) || /[A-Za-z]\s*(?:∩|∪|\\cap|\\cup)\s*[A-Za-z]|\{[^{}\n]*(?:∈|\\in)[^{}\n]*\}/.test(e)) return !0;
  const r = e.match(/^\s*([A-Za-z][A-Za-z\s-]{3,})\s*(?:=|≈|≃|≠|≤|≥|<|>)/);
  if (r && !/[()_^'\\∫ΣΠ√]/.test(r[1])) return !1;
  if (/^\s*[A-Za-z]'\s*\([^()\n]{1,20}\)\s*$/.test(e) || /\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}/.test(e) || /\\(?:frac|sqrt|lim|int|sum|prod)\b|\\Delta\b|(?:^|[^\w])d\s*\/\s*d[A-Za-z]\b/.test(e) || /^(?:\\Delta|Δ)\s*[A-Za-z]\s*(?:→|->|=|≠|≤|≥|<|>)\s*[-+]?(?:\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*)$/.test(e.trim()) || /(?:\\Delta|Δ)\s*[A-Za-z]\s*\/\s*(?:\\Delta|Δ)\s*[A-Za-z]|\[[^\[\]\n]{1,220}\]\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)|\((?:[^()\n]|\([^()\n]*\)){1,220}\)\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)/.test(e)) return !0;
  const s = e.match(/^\s*([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\s*$/);
  return s && Wu(s[1], s[2]) || /\|[^|\n]{1,100}\|/.test(e) || /\b(?:ln|log)\s*(?:\\lvert|\|)/i.test(e) || /[=≈≃≠≤≥<>]|\\frac|\\sqrt|√|[∫ΣΠ]|[A-Za-z]\s*\^\s*(?:\{|\(|[A-Za-z0-9+\-=])|[A-Za-z]_\{?[A-Za-z0-9]/.test(e) ? !0 : /\bdet\s*\(/i.test(e);
}
function Tt(t) {
  let e = fT(t).replace(/\b(\d+)\s*x\s*(\d+)\b/gi, "$1 \\times $2").replace(/\s*([=+\-*/(){}\[\],;:])\s*/g, "$1").replace(/([A-Za-z0-9}\)])d([A-Za-z])\b/g, "$1\\,d$2").replace(/\bln\b/g, "\\ln").replace(/\blog\b/g, "\\log").replace(/\s*(\\(?:cdot|times|div|ne|le|ge|to|mid|cup|cap|in|notin)\s*)\s*/g, " $1 ").replace(/\s+/g, " ").trim();
  return dT.forEach((n) => {
    n !== "Pr" && (e = e.replace(new RegExp(`(?<!\\\\)\\b${n}\\b`, "g"), `\\${n}`));
  }), e;
}
const kr = /(^|[^\\])\$(?!\d)([^\n$]{1,700}?)\$/g;
function sm(t) {
  const e = String(t || "").trim();
  return !e || /^\d+(?:\.\d{2})?(?:\s|$)/.test(e) ? !1 : /^(?:[A-Za-z]|[A-Za-z][A-Za-z0-9]*'?\([^()\n]{0,30}\)|\\[A-Za-z]+(?:\{[^{}]*\})*)$/.test(e) || /[=<>^_{}\\]|[+\-*/]\s*(?:\d|[A-Za-z\\])|(?:\d|[A-Za-z)])\s*[+\-*/]/.test(e) || /(?:\\Delta|Δ|∫|Σ|Π|√|∞|≤|≥|≠|→)/.test(e) ? !0 : (e.match(/[A-Za-z]{3,}/g) || []).length <= 1 && /[A-Za-z0-9]/.test(e);
}
function Hj(t) {
  kr.lastIndex = 0;
  let e;
  for (; e = kr.exec(String(t || "")); )
    if (sm(e[2]))
      return kr.lastIndex = 0, !0;
  return kr.lastIndex = 0, !1;
}
function No(t) {
  if (/\\\(|\\\[|\$\$/.test(t) || Hj(t)) return t;
  const e = [], n = (l) => {
    const c = `@@AUTO_INLINE_MATH_${e.length}@@`;
    return e.push(l), c;
  }, r = (l) => e.reduce((c, f, m) => c.split(`@@AUTO_INLINE_MATH_${m}@@`).join(f), String(l || "")), s = (l) => {
    const c = hT(l);
    return pT(c.formula) ? `${n(`\\(${Tt(c.formula)}\\)`)}${No(c.trailing)}` : l;
  };
  let a = String(t || "");
  return a = a.replace(/(^|[^A-Za-z0-9_@])((?:\\Delta|Δ)\s*[A-Za-z]\s*(?:→|->|=|≠|≤|≥|<|>)\s*[-+]?(?:\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])((?:\\Delta|Δ)\s*[A-Za-z]\s*\/\s*(?:\\Delta|Δ)\s*[A-Za-z])/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])(\[[^\[\]\n]{1,220}\]\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])(\((?:[^()\n]|\([^()\n]*\)){1,220}\)\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])\b([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\b/g, (l, c, f, m) => Wu(f, m) ? `${c}${s(`${f}/${m}`)}` : l).replace(/(^|[^A-Za-z0-9_@])(\|[^|\n]{1,100}\|\s*(?:(?:=|≈|≃|≠|≤|≥|<|>)\s*[^,.;\n]{1,80}|(?:[+\-]\s*[A-Za-z0-9]+)?))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])(d\s*\/\s*d[A-Za-z])(?=\s*\)|\s+(?:vs|versus)\b|[,.;:]|$)/gi, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z]'\s*\([^()\n]{1,20}\))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])\b(derivative|antiderivative|gradient|slope|result|answer)\s*=\s*([-+]?\d+(?:\.\d+)?\s*[A-Za-z](?:\s*\^\s*(?:\{[^{}]+\}|[-+]?\d{1,4}|[A-Za-z]))?(?:\s*[+\-]\s*[-+]?\d+(?:\.\d+)?\s*[A-Za-z]?)?)/gi, (l, c, f, m) => `${c}${f} = ${s(m)}`).replace(/(^|[^A-Za-z0-9_@])((?:ln|log)\s*\|[^|\n]{1,100}\|(?!\|)(?:\s*[+\-]\s*[A-Za-z])?)/gi, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])((?:[-+]?\d+(?:\.\d+)?\s*)?[A-Za-z]\s*\^\s*(?:\{[^{}]+\}|\([^()\n]{1,60}\)|[A-Za-z0-9+\-=]{1,6})(?:\s*[+\-]\s*(?:(?:\d+(?:\.\d+)?\s*)?[A-Za-z](?:\s*\^\s*(?:\{[^{}]+\}|\([^()\n]{1,60}\)|[A-Za-z0-9+\-=]{1,6}))?|\d+(?:\.\d+)?)){1,})/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])((?!(?:makes?|causes?|causing|requires?|explains?|shows?|means?|because|since|where|when|while|which|that|this)\b)[A-Za-z][A-Za-z0-9]*'?\s*\([^()\n]{1,36}\)\s*(?:=|≈|≃|≠|≤|≥)\s*[^,.;\n]{1,160})/gi, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])(\([^()\n]{1,80}\)\s*(?:=|≈|≃|≠|≤|≥|<|>)\s*[^,.;\n]{1,120})/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z]\s*(?:=|≈|≃|≠|≤|≥)\s*[-+]?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?|[A-Za-z0-9.\u0370-\u03ff]+)(?:\s*[+\-*/]\s*[-+]?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?|[A-Za-z0-9.\u0370-\u03ff]+)(?:\s*\^\s*(?:\{[^{}]+\}|[A-Za-z0-9+\-=]{1,6}))?)*\)?)/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])([∫ΣΠ]\s*[A-Za-z0-9_{}^()+\-*/| ]{1,100}\s*(?:d[A-Za-z]\b|(?:=|≈|≃)\s*[^,.;\n]{1,100}))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*\{([^{}]+)\}/g, (l, c, f, m) => `${c}${n(`\\(${f}^{${Tt(m)}}\\)`)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)_\{([^{}]+)\}/g, (l, c, f, m) => `${c}${n(`\\(${f}_{${Tt(m)}}\\)`)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*\(([^()\n]{1,60})\)/g, (l, c, f, m) => `${c}${n(`\\(${f}^{${Tt(m)}}\\)`)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*([A-Za-z0-9+\-=]{1,6})(?![A-Za-z0-9])/g, (l, c, f, m) => `${c}${n(`\\(${f}^{${Tt(m)}}\\)`)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)_([0-9A-Za-z]{1,6})(?![A-Za-z0-9])/g, (l, c, f, m) => `${c}${n(`\\(${f}_{${Tt(m)}}\\)`)}`).replace(/(\([^()\n]{1,80}\)\s*_\s*[A-Za-z0-9]{1,6}\s*=\s*[A-Za-z][A-Za-z0-9]*\s*_\s*[A-Za-z0-9]{1,6})/g, (l) => n(`\\(${Tt(l)}\\)`)).replace(/(\([^()\n]{1,80}\)\s*_\s*[A-Za-z0-9]{1,6})/g, (l) => n(`\\(${Tt(l)}\\)`)).replace(/\bdet\s*\(\s*([A-Za-z][A-Za-z0-9_]*)\s*\)/gi, (l, c) => n(`\\(\\det(${c})\\)`)).replace(/\b([A-Za-z][A-Za-z0-9]*)\s*\^\s*\{([^{}]+)\}/g, (l, c, f) => n(`\\(${c}^{${Tt(f)}}\\)`)).replace(/\b([A-Za-z][A-Za-z0-9]*)_\{([^{}]+)\}/g, (l, c, f) => n(`\\(${c}_{${Tt(f)}}\\)`)).replace(/\b([A-Za-z][A-Za-z0-9]*)\s*\^\s*([A-Za-z0-9+\-=]{1,6})\b/g, (l, c, f) => n(`\\(${c}^{${Tt(f)}}\\)`)).replace(/\b([A-Za-z][A-Za-z0-9]*)_([0-9A-Za-z]{1,6})\b/g, (l, c, f) => n(`\\(${c}_{${Tt(f)}}\\)`)).replace(/(?:√|sqrt)\s*\(\s*([^()\n]+?)\s*\)/gi, (l, c) => n(`\\(\\sqrt{${Tt(c)}}\\)`)), r(a);
}
function Wj(t) {
  const e = im(t);
  return e.restore(No(e.text));
}
function Zj(t) {
  const e = [], n = (s) => {
    const a = `@@TEXTSEG${e.length}@@`;
    return e.push(s), a;
  };
  return {
    text: String(t || "").replace(/https?:\/\/[^\s<>"']+/gi, (s) => {
      const a = String(s).match(/^(.+?)([)\].,;:!?，。；：！？]*)$/), l = a ? a[1] : s, c = a ? a[2] : "";
      return `${n(l)}${c}`;
    }),
    restore(s) {
      return e.reduce((a, l, c) => a.replaceAll(`@@TEXTSEG${c}@@`, l), String(s || ""));
    }
  };
}
function Fh(t, e = !1) {
  if (!t || /^\s*```/.test(t) || /^\s*\[\[VISUAL:\d+\]\]\s*$/.test(t) || /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(t)) return t;
  if (/^\s*\|.*\|\s*$/.test(t)) {
    const w = String(t).trim();
    return `| ${jh(w).map((T) => Fh(T.trim(), !0)).join(" | ")} |`;
  }
  const n = String(t).match(/^(\s*(?:[-*+]\s+|\d+\.\s+|>\s*)?)(.*)$/), r = n ? n[1] : "", s = n ? n[2] : String(t);
  if (!s.trim()) return t;
  if (/\\\(|\\\[|\$\$|\$/.test(s))
    return r + Wj(s);
  const a = Uj(s);
  if (a < 0) return r + No(s);
  const l = s.slice(0, a), c = s.slice(a), { formula: f, trailing: m } = hT(c);
  if (!pT(f)) return r + No(s);
  const g = !e && !r && !l.trim() && !m.trim() && f.length <= 220, d = Tt(f), p = g ? `\\[${d}\\]` : `\\(${d}\\)`;
  let v = m;
  if (/^\)+/.test(v)) {
    const w = (l.match(/\(/g) || []).length;
    (l.match(/\)/g) || []).length >= w && !l.trimEnd().endsWith("(") && (v = v.replace(/^\)+/, ""));
  }
  return r + No(l) + p + (v ? Fh(v, !0) : "");
}
function Gj(t) {
  const e = Zj($j(Ij(t))), n = im(e.text), r = n.text.split(`
`).map((s) => Fh(s)).join(`
`);
  return e.restore(n.restore(r));
}
const Kj = "https://www.desmos.com/api/v1.11/calculator.js", Yj = "desmos";
let Dl = null, qj = 0;
const mT = {
  getLearningFigureByMarker: () => null,
  renderInlineVisualCard: () => "",
  renderInlineVisualReference: () => ""
};
function Qj(t) {
  return mT.renderInlineVisualCard(t);
}
function Xj(t, e = null) {
  return mT.renderInlineVisualReference(t, e);
}
function Jj(t) {
  const e = /\[\[VISUAL:\d+\]\]/g;
  return String(t || "").split(`
`).flatMap((n) => {
    if (e.lastIndex = 0, !e.test(n))
      return e.lastIndex = 0, [n];
    e.lastIndex = 0;
    const r = [];
    let s = 0;
    const a = (l) => {
      let c = String(l || "").replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, "").replace(/^\s*[:：,;.\-\s]+/, "").replace(/\s*(?:before|after)\s+(?:the\s+)?(?:visual|image|figure|source figure|source image)\s*[:：-]?\s*$/i, "").replace(/^(?:after|before)\s+(?:the\s+)?(?:visual|image|figure|source figure|source image)\s*[:：-]?\s*/i, "").trim();
      c && r.push(c);
    };
    return n.replace(e, (l, c) => (a(n.slice(s, c)), r.push(l), s = c + l.length, l)), a(n.slice(s)), r.length ? r : [n];
  }).join(`
`);
}
function eF(t) {
  t = Rj(t), t = Gj(t);
  let e = yT(t);
  const n = [], r = [];
  e = e.replace(/\$\$([\s\S]*?)\$\$/g, (P, z) => {
    const O = `@@MATH_BLOCK_${n.length}@@`;
    return n.push(`\\[${xo(z)}\\]`), O;
  }), e = e.replace(/\\\[[\s\S]*?\\\]/g, (P) => {
    const z = `@@MATH_BLOCK_${n.length}@@`;
    return n.push(`\\[${xo(P.replace(/^\\\[/, "").replace(/\\\]$/, ""))}\\]`), z;
  }), e = e.replace(/\\\([\s\S]*?\\\)/g, (P) => {
    const z = `@@INLINE_MATH_${r.length}@@`;
    return r.push(`\\(${xo(P.replace(/^\\\(/, "").replace(/\\\)$/, ""))}\\)`), z;
  });
  const s = new RegExp(
    "\\\\begin\\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\\}[\\s\\S]*?\\\\end\\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\\}",
    "g"
  );
  e = e.replace(s, (P) => {
    const z = `@@INLINE_MATH_${r.length}@@`;
    return r.push(`\\(${P}\\)`), z;
  }), e = e.replace(kr, (P, z, O) => {
    if (!sm(O)) return P;
    const F = `@@INLINE_MATH_${r.length}@@`;
    return r.push(`\\(${xo(O)}\\)`), `${z}${F}`;
  }), e = Jj(e);
  const a = e.split(`
`), l = [];
  let c = !1, f = !1, m = !1, g = 0;
  const d = /* @__PURE__ */ new Set();
  let p = "";
  function v(P) {
    return /^\s*\|.*\|\s*$/.test(P || "");
  }
  function w(P) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(P || "");
  }
  function x(P) {
    return jh(P, g);
  }
  function T() {
    m && (l.push("</tbody></table></div>"), m = !1, g = 0);
  }
  function A() {
    c && (l.push("</ul>"), c = !1), f && (l.push("</ol>"), f = !1);
  }
  function b(P, z) {
    if (!gT(P)) return !1;
    const F = [
      a[z - 2] || "",
      a[z - 1] || "",
      a[z + 1] || "",
      a[z + 2] || ""
    ].join(" ").toLowerCase();
    return /\b(?:do not graph|no graph|without graph|not a graph)\b/.test(F) ? !1 : new RegExp(
      "\\b(?:interactive\\s+graph|desmos|graph\\s+this|plot\\s+this|plot\\s+the|graph\\s+of|curve|coordinate\\s+plane|x-axis|y-axis|axes)\\b"
    ).test(F);
  }
  function C(P, z) {
    const O = String(P || "").match(/^@@MATH_BLOCK_(\d+)@@$/);
    if (!O) return "";
    const F = n[Number(O[1])] || "";
    return b(F, z) ? nF(F) : "";
  }
  a.forEach((P, z) => {
    const O = P.trim(), F = a[z + 1] || "", L = O.match(/^\[\[VISUAL:(\d+)\]\]$/);
    if (!L && O && (p = ""), L) {
      A(), T();
      const U = Number(L[1]), G = "", te = `index:${U}`;
      if (d.has(U) || G) {
        const ae = U, le = `index:${ae}`;
        p !== le && (l.push(Xj(U, ae)), p = le);
      } else
        d.add(U), l.push(Qj(U)), p = te;
      return;
    }
    if (v(P) && w(F)) {
      A(), T();
      const U = jh(P);
      g = U.length;
      const G = U.map((te) => `<th>${te}</th>`).join("");
      l.push(
        '<div class="markdown-table-wrap"><table class="markdown-table"><thead><tr>' + G + "</tr></thead><tbody>"
      ), m = !0;
      return;
    }
    if (!w(P)) {
      if (m && v(P)) {
        const U = x(P);
        l.push("<tr>" + U.map((G) => `<td>${G}</td>`).join("") + "</tr>");
        return;
      }
      if (m && !v(P) && T(), O.startsWith("@@MATH_BLOCK_"))
        A(), l.push(`<div class="math-block">${O}</div>${C(O, z)}`);
      else if (/^####\s+/.test(P))
        A(), l.push(`<h4>${P.replace(/^####\s+/, "")}</h4>`);
      else if (/^###\s+/.test(P))
        A(), l.push(`<h3>${P.replace(/^###\s+/, "")}</h3>`);
      else if (/^##\s+/.test(P))
        A(), l.push(`<h2>${P.replace(/^##\s+/, "")}</h2>`);
      else if (/^#\s+/.test(P))
        A(), l.push(`<h1>${P.replace(/^#\s+/, "")}</h1>`);
      else if (/^-\s+/.test(P))
        f && (l.push("</ol>"), f = !1), c || (l.push("<ul>"), c = !0), l.push(`<li>${P.replace(/^-\s+/, "")}</li>`);
      else if (/^\d+\.\s+/.test(P)) {
        c && (l.push("</ul>"), c = !1);
        const U = P.match(/^(\d+)\.\s+(.*)$/), G = U ? Number(U[1]) : 1;
        f || (l.push(G > 1 ? `<ol start="${G}">` : "<ol>"), f = !0), l.push(`<li>${U ? U[2] : P.replace(/^\d+\.\s+/, "")}</li>`);
      } else O === "" ? A() : (A(), l.push(`<p>${P}</p>`));
    }
  }), A(), T();
  let M = l.join("");
  return n.forEach((P, z) => {
    M = M.replace(`@@MATH_BLOCK_${z}@@`, P);
  }), r.forEach((P, z) => {
    M = M.replace(`@@INLINE_MATH_${z}@@`, P);
  }), M.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
}
function tF(t) {
  return String(t || "").trim().replace(/^\\\[/, "").replace(/\\\]$/, "").replace(/^\\\(/, "").replace(/\\\)$/, "").replace(/^\$\$/, "").replace(/\$\$$/, "").trim();
}
function gT(t) {
  let e = Tt(tF(t)).replace(/\\left|\\right/g, "").replace(/\\,/g, " ").replace(/\s+/g, " ").trim();
  if (!e || e.length > 180 || !/[xX]/.test(e) || /\\(?:lim|Delta|int|sum|prod|begin)\b|\\to\b|(?:^|[^A-Za-z])d[A-Za-z]\b/.test(e)) return "";
  const n = e.match(/^f\s*\(\s*x\s*\)\s*=\s*([\s\S]+)$/i);
  if (n) return `y=${n[1].trim()}`;
  const r = e.match(/^f'\s*\(\s*x\s*\)\s*=\s*([\s\S]+)$/i);
  return r ? `y=${r[1].trim()}` : /^(?:y|x)\s*=/.test(e) || /^f\s*\(\s*x\s*\)\s*=/.test(e) || /=/.test(e) ? e : /^[0-9A-Za-z\\{}^_+\-*/().,\s]+$/.test(e) ? `y=${e}` : "";
}
function nF(t) {
  const e = gT(t);
  if (!e) return "";
  const n = `desmos-graph-${++qj}`, r = `Interactive Desmos graph for ${oF(e)}`;
  return `
    <div class="desmos-card" data-desmos-latex="${encodeURIComponent(e)}">
      <div class="desmos-card-head">
        <span><i class="bi bi-graph-up"></i> Interactive graph</span>
        <code>${yT(e)}</code>
      </div>
      <div id="${n}" class="desmos-calculator" role="img" aria-label="${r}"></div>
    </div>
  `;
}
function rF() {
  return String(window.SYNAPSE_DESMOS_API_KEY || Yj);
}
function iF() {
  return window.Desmos && typeof window.Desmos.GraphingCalculator == "function" ? Promise.resolve(window.Desmos) : Dl || (Dl = new Promise((t, e) => {
    const n = document.querySelector("script[data-synapse-desmos]"), r = () => {
      window.Desmos && typeof window.Desmos.GraphingCalculator == "function" ? t(window.Desmos) : e(new Error("Desmos API loaded, but GraphingCalculator was unavailable."));
    };
    if (n) {
      n.addEventListener("load", r, { once: !0 }), n.addEventListener("error", () => e(new Error("Could not load the Desmos API.")), { once: !0 });
      return;
    }
    const s = document.createElement("script");
    s.src = `${Kj}?apiKey=${encodeURIComponent(rF())}`, s.async = !0, s.dataset.synapseDesmos = "true", s.onload = r, s.onerror = () => e(new Error("Could not load the Desmos API.")), document.head.appendChild(s);
  }), Dl);
}
function C_(t, e) {
  console.warn("Desmos graph preview unavailable:", e), t.forEach((n) => {
    n.dataset.desmosMounted = "failed", n.classList.add("desmos-card-fallback");
    const r = n.querySelector(".desmos-calculator");
    r && (r.innerHTML = "<p>Interactive graph preview could not load. You can still read the equation above.</p>");
  });
}
function P_(t = document) {
  const e = [...t.querySelectorAll(".desmos-card:not([data-desmos-mounted])")];
  return e.length ? iF().then((n) => {
    e.forEach((r) => {
      const s = r.querySelector(".desmos-calculator"), a = decodeURIComponent(r.dataset.desmosLatex || "");
      if (!s || !a) {
        r.dataset.desmosMounted = "skipped";
        return;
      }
      try {
        const l = n.GraphingCalculator(s, {
          expressions: !1,
          keypad: !1,
          settingsMenu: !1,
          zoomButtons: !0,
          lockViewport: !1,
          border: !1
        });
        l.setExpression({ id: "synapse-main", latex: a }), r.dataset.desmosMounted = "true", r._synapseDesmosCalculator = l;
      } catch (l) {
        C_([r], l);
      }
    });
  }).catch((n) => C_(e, n)) : Promise.resolve();
}
function sF() {
  return window.MathJax && window.MathJax.typesetPromise ? window.MathJax.typesetPromise().catch((t) => {
    console.error("MathJax render error:", t);
  }).then(() => P_()) : P_();
}
function yT(t) {
  return String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function oF(t) {
  return String(t || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("\\", "\\\\").replaceAll("'", "\\'").replaceAll(`
`, " ");
}
const aF = [
  [/^Learning Question$/i, ["Inferred from source", "Must know"]],
  [/^Key Takeaways$/i, ["Direct from source", "Must know"]],
  [/^Core Concept Map$/i, ["Inferred from source"]],
  [/^Main Notes by Lecture Section$/i, ["Direct from source"]],
  [/^Key Terms Table$/i, ["Direct from source"]],
  [/^Case Study\s*\/\s*Example Breakdown$/i, ["Direct from source", "Good evidence"]],
  [/^Evidence Bank$/i, ["Direct from source", "Good evidence"]],
  [/^Exam Answer Templates$/i, ["Tutor explanation", "Exam use"]],
  [/^Common Mistakes$/i, ["Tutor explanation", "Exam use"]],
  [/^Revision Checklist$/i, ["Tutor explanation", "Must know"]],
  [/^Flashcard-ready Summary$/i, ["Tutor explanation", "Must know"]]
], lF = [
  [/^(?:\d+\.\s*)?Big Picture\b/i, ["Professional explanation"]],
  [/^(?:\d+\.\s*)?The Exam Will Probably Test These Ideas\b/i, ["Exam use"]],
  [/^(?:\d+\.\s*)?What You Actually Need To Understand\b/i, ["Professional explanation"]],
  [/^(?:\d+\.\s*)?Deep Explanation\b/i, ["Professional explanation", "Limitation"]],
  [/^(?:\d+\.\s*)?Concept Connections\b/i, ["Professional explanation"]],
  [/^(?:\d+\.\s*)?Background Knowledge(?: Layer| Needed To Understand This Properly)?\b/i, ["Background knowledge"]],
  [/^(?:\d+\.\s*)?(?:Application To New Situations|How To Apply This To New Questions)\b/i, ["Application"]],
  [/^(?:\d+\.\s*)?Common Mistakes(?: That Lose Marks)?\b/i, ["Application", "Limitation"]],
  [/^(?:\d+\.\s*)?High-Quality Student Thinking\b/i, ["Professional explanation"]],
  [/^(?:\d+\.\s*)?How To Use This In Assessment\b/i, ["Application"]],
  [/^(?:\d+\.\s*)?Model High-Quality (?:Output|Answers)\b/i, ["Application"]],
  [/^(?:\d+\.\s*)?Exam Question Bank\b/i, ["Exam use"]],
  [/^(?:\d+\.\s*)?Memory and Practice\b/i, ["Application"]]
], om = /* @__PURE__ */ new Map([
  ["Direct from source", "source"],
  ["Inferred from source", "inferred"],
  ["Tutor explanation", "tutor"],
  ["Not enough evidence", "needs-evidence"],
  ["Not enough evidence from source", "needs-evidence"],
  ["Source anchor", "source-based"],
  ["Source-based", "source-based"],
  ["Professional explanation", "professional-explanation"],
  ["Background knowledge", "background-knowledge"],
  ["Application", "application"],
  ["Academic interpretation", "academic-interpretation"],
  ["Limitation", "limitation"],
  ["Essay use", "essay-use"],
  ["External context", "external-context"],
  ["Must know", "must-know"],
  ["Good evidence", "good-evidence"],
  ["Exam use", "exam-use"]
]), Pu = Array.from(om.keys()).sort((t, e) => e.length - t.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), E_ = new RegExp(`\\[(${Pu})\\]`, "g"), M_ = new RegExp(`\\[(${Pu})\\]`);
function Oh(t) {
  return String(t || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function uF(t) {
  return String(t || "").replace(/<[^>]+>/g, " ");
}
function cF(t) {
  return String(t || "").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
}
function la(t) {
  return cF(uF(t)).replace(/\s+/g, " ").trim();
}
function es(t) {
  return `<span class="notes-section-chip ${om.get(t) || "plain"}">${t}</span>`;
}
function dF(t) {
  const e = la(t);
  for (const [n, r] of aF)
    if (n.test(e)) return r;
  return [];
}
function fF(t) {
  const e = la(t);
  for (const [n, r] of lF)
    if (n.test(e)) return r;
  return [];
}
function Go(t) {
  let e = String(t || "");
  return e = e.replace(
    new RegExp(`<p>\\s*\\[(${Pu})\\]\\s*<\\/p>`, "g"),
    (n, r) => `<div class="notes-inline-badges">${es(r)}</div>`
  ), e = e.replace(
    new RegExp(`<li>\\s*\\[(${Pu})\\]\\s*<\\/li>`, "g"),
    (n, r) => `<li><span class="notes-inline-badges">${es(r)}</span></li>`
  ), e = e.replace(
    /<p>([\s\S]*?)<\/p>/g,
    (n, r) => M_.test(r) ? `<p>${r.replace(E_, (s, a) => es(a))}</p>` : n
  ), e = e.replace(
    /<li>([\s\S]*?)<\/li>/g,
    (n, r) => M_.test(r) ? `<li>${r.replace(E_, (s, a) => es(a))}</li>` : n
  ), e;
}
function hF(t, e) {
  const n = (e || []).filter((a) => om.has(a)).map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!n.length) return t;
  const r = n.join("|");
  let s = String(t || "");
  return s = s.replace(
    new RegExp(`(<p>\\s*)\\[(${r})\\]\\s*`, "gi"),
    "$1"
  ), s = s.replace(
    new RegExp(`(<li>\\s*)\\[(${r})\\]\\s*`, "gi"),
    "$1"
  ), s;
}
function vT(t) {
  const e = String(t || ""), n = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, r = [];
  let s = "", a = 0, l = null;
  for (; l = n.exec(e); )
    r.length ? r[r.length - 1].bodyHtml = e.slice(a, l.index) : s = e.slice(0, l.index), r.push({
      headingHtml: l[0],
      headingInnerHtml: l[1],
      bodyHtml: ""
    }), a = n.lastIndex;
  return r.length && (r[r.length - 1].bodyHtml = e.slice(a)), {
    preludeHtml: s,
    sections: r
  };
}
function pF(t, e, n) {
  const r = la(t.headingInnerHtml), s = dF(r), a = !n || e === 0 ? " open" : "", l = s.length ? `<div class="notes-section-chip-row">${s.map(es).join("")}</div>` : "", c = Go(t.bodyHtml || "");
  return `
    <details class="notes-section"${a} data-section-title="${Oh(r)}">
      <summary class="notes-section-summary">
        <div class="notes-section-heading-wrap">
          <span class="notes-section-heading">${t.headingInnerHtml}</span>
          ${l}
        </div>
        <span class="notes-section-chevron" aria-hidden="true"></span>
      </summary>
      <div class="notes-section-body">
        ${c}
      </div>
    </details>
  `.trim();
}
function mF(t) {
  const e = String(t || "").trim().toLowerCase().replace(/[-\s/]+/g, "_");
  return e === "professor_mode" || e === "professional" || e === "professional_mode" || e === "academic" || e === "academic_analysis" || e === "academic_analysis_mode";
}
function gF(t) {
  const e = la(t);
  return /^(?:\d+\.\s*)?Big Picture\b/i.test(e) ? "big-picture" : /^(?:\d+\.\s*)?The Exam Will Probably Test These Ideas\b/i.test(e) ? "exam-focus" : /^(?:\d+\.\s*)?What You Actually Need To Understand\b/i.test(e) ? "core-understanding" : /^(?:\d+\.\s*)?Deep Explanation\b/i.test(e) ? "deep-explanation" : /^(?:\d+\.\s*)?Concept Connections\b/i.test(e) ? "concept-connections" : /^(?:\d+\.\s*)?Background Knowledge(?: Layer| Needed To Understand This Properly)?\b/i.test(e) ? "background" : /^(?:\d+\.\s*)?(?:Application To New Situations|How To Apply This To New Questions)\b/i.test(e) ? "application" : /^(?:\d+\.\s*)?Common Mistakes(?: That Lose Marks)?\b/i.test(e) ? "common-mistakes" : /^(?:\d+\.\s*)?High-Quality Student Thinking\b/i.test(e) ? "high-quality-thinking" : /^(?:\d+\.\s*)?How To Use This In Assessment\b/i.test(e) ? "assessment-use" : /^(?:\d+\.\s*)?Model High-Quality (?:Output|Answers)\b/i.test(e) ? "model-output" : /^(?:\d+\.\s*)?Exam Question Bank\b/i.test(e) ? "question-bank" : /^(?:\d+\.\s*)?Memory and Practice\b/i.test(e) ? "memory-practice" : "standard";
}
function yF(t) {
  const e = ["professional-mode-section"];
  return t === "big-picture" && e.push("professional-big-picture-card"), t === "exam-focus" && e.push("professional-exam-focus-card"), t === "core-understanding" && e.push("professional-core-understanding-card"), t === "concept-connections" && e.push("professional-concept-connections-card"), t === "deep-explanation" && e.push("professional-deep-explanation-section"), t === "background" && e.push("professional-background-card"), t === "application" && e.push("professional-application-card"), t === "high-quality-thinking" && e.push("professional-high-quality-thinking-card"), t === "common-mistakes" && e.push("professional-common-mistakes-card"), t === "assessment-use" && e.push("professional-assessment-use-card"), t === "model-output" && e.push("professional-model-output-card"), t === "question-bank" && e.push("professional-question-bank-card"), t === "memory-practice" && e.push("professional-memory-practice-card"), e.join(" ");
}
function vF(t) {
  return t === "concept-connections" ? "professional-section-body professional-connections-grid" : t === "application" ? "professional-section-body professional-application-steps" : t === "common-mistakes" ? "professional-section-body professional-mistakes-list" : t === "memory-practice" ? "professional-section-body professional-memory-list" : "professional-section-body";
}
function _F(t, e) {
  const n = e.length ? `<div class="notes-section-chip-row">${e.map(es).join("")}</div>` : "";
  return `
    <div class="professional-section-header">
      <h2>${t.headingInnerHtml}</h2>
      ${n}
    </div>
  `.trim();
}
function SF(t, e, n) {
  const r = la(t.headingInnerHtml), s = fF(r), a = gF(r), l = Go(hF(t.bodyHtml || "", s)), c = !n || e <= 1 || a === "deep-explanation" ? " open" : "", f = _F(t, s), m = vF(a), g = yF(a);
  return a === "deep-explanation" ? `
      <details class="${g}"${c} data-section-title="${Oh(r)}">
        <summary class="professional-section-summary">
          ${f}
          <span class="notes-section-chevron" aria-hidden="true"></span>
        </summary>
        <div class="${m}">
          ${l}
        </div>
      </details>
    `.trim() : `
    <section class="${g}" data-section-title="${Oh(r)}">
      ${f}
      <div class="${m}">
        ${l}
      </div>
    </section>
  `.trim();
}
function xF(t, e) {
  const { preludeHtml: n, sections: r } = vT(t);
  if (!r.length) return t;
  const s = n.trim() ? `<section class="professional-mode-title-card">${Go(n)}</section>` : "", a = r.map((l, c) => SF(l, c, e)).join(`
`);
  return `
    <div class="professional-mode-surface">
      ${s}
      ${a}
    </div>
  `.trim();
}
function wF(t, e = {}) {
  const n = String(t || "").trim();
  if (!n) return "";
  if (mF(e.promptMode))
    return xF(n, !!e.collapseSecondary);
  const r = Go(n), { preludeHtml: s, sections: a } = vT(r);
  if (!a.length) return r;
  const l = !!e.collapseSecondary, c = s.trim() ? `<section class="notes-summary-card">${Go(s)}</section>` : "", f = a.map((m, g) => pF(m, g, l)).join(`
`);
  return `${c}${c && f ? `
` : ""}${f}`.trim();
}
function TF() {
  try {
    return !!(globalThis.matchMedia && globalThis.matchMedia("(max-width: 850px)").matches);
  } catch {
    return !1;
  }
}
const AF = [
  { label: "Generated Notes", matcher: /(generated|overview|introduction|learning question|main note|study note)/i },
  { label: "Key Concepts", matcher: /(key concept|core concept|main idea|key idea|concept|framework)/i },
  { label: "Definitions", matcher: /(definition|term|glossary|vocabulary)/i },
  { label: "Examples", matcher: /(example|application|case|scenario|worked)/i },
  { label: "Source Evidence", matcher: /(source|evidence|citation|study|reference|figure|data)/i },
  { label: "Revision Summary", matcher: /(revision|summary|takeaway|exam|review|remember)/i }
];
function R_(t) {
  var e;
  return (e = globalThis.CSS) != null && e.escape ? globalThis.CSS.escape(t) : String(t || "").replace(/["\\]/g, "\\$&");
}
function kF(t) {
  return t != null && t.isSourceRestricted ? "Source-restricted" : (t == null ? void 0 : t.promptMode) === "research_mode" ? "Research mode" : (t == null ? void 0 : t.promptMode) === "professor_mode" ? "Professional Mode" : "Study notes";
}
function bF(t) {
  return t != null && t.isSourceRestricted ? "The tutor stays inside the uploaded source and tells you when the source is missing a point." : (t == null ? void 0 : t.promptMode) === "research_mode" ? "Notes can connect the uploaded material with extra outside research when needed." : "Notes emphasize explanation, structure, and exam-ready understanding from the current material.";
}
function CF(t) {
  const e = Object.keys((t == null ? void 0 : t.sections) || {}).filter(Boolean), n = AF.map((a) => ({
    ...a,
    items: e.filter((l) => a.matcher.test(l))
  })).filter((a) => a.items.length), r = new Set(n.flatMap((a) => a.items)), s = e.filter((a) => !r.has(a));
  return s.length && n.push({ label: "More Sections", matcher: /.*/, items: s }), !n.length && (t != null && t.aiSummary) && n.push({ label: "Generated Notes", matcher: /.*/, items: ["Full notes"] }), n;
}
function Cf(t, e, n) {
  var l, c;
  const r = String(e || ((l = t == null ? void 0 : t.studyHeadings) == null ? void 0 : l[0]) || "").trim(), s = r && ((c = t == null ? void 0 : t.sections) != null && c[r]) ? String(t.sections[r]).trim() : "", a = String(n || s || "").trim().slice(0, 1600);
  return {
    sectionTitle: r,
    excerpt: a
  };
}
function PF(t, e, n) {
  const r = n.sectionTitle ? `the section "${n.sectionTitle}"` : `the material "${(e == null ? void 0 : e.materialTitle) || "this material"}"`, s = n.excerpt ? `

Focus excerpt:
${n.excerpt}` : "";
  return t === "explain" ? `Explain ${r} more simply, step by step, using only the current material.${s}` : t === "summarize" ? `Summarise ${r} for exam revision using only the current material. Include the core claim, evidence, and likely mistake.${s}` : "";
}
function EF({ highlights: t = [], activeId: e = "", onSelect: n }) {
  return t.length ? /* @__PURE__ */ S.jsx("div", { className: "focus-source-highlight-list", children: t.map((r, s) => /* @__PURE__ */ S.jsxs(
    "button",
    {
      className: `source-highlight ${r.id === e ? "is-active" : ""}`.trim(),
      type: "button",
      onClick: () => n == null ? void 0 : n(r, { openSources: !1 }),
      children: [
        /* @__PURE__ */ S.jsx("span", { className: "source-highlight-index", children: String(s + 1).padStart(2, "0") }),
        /* @__PURE__ */ S.jsxs("span", { className: "source-highlight-copy", children: [
          /* @__PURE__ */ S.jsx("strong", { children: r.title || r.sectionTitle || r.sourceLabel || `Source ${s + 1}` }),
          /* @__PURE__ */ S.jsx("span", { children: r.excerpt || r.sourceLabel || "Open this evidence source." })
        ] }),
        /* @__PURE__ */ S.jsx(Ow, { size: 14, "aria-hidden": "true" })
      ]
    },
    r.id || `${r.title}-${s}`
  )) }) : /* @__PURE__ */ S.jsx("p", { className: "focus-panel-empty", children: "No source highlights are attached to this material yet." });
}
function Pf({ mode: t = "materials", materials: e = [], status: n = "ready", error: r = "", onWorkspace: s }) {
  var de, W, J, X, j;
  const a = H((I) => I.selectedMaterial), l = H((I) => I.openStudyPanel), c = H((I) => I.askAssistant), f = H((I) => I.setAssistantContext), m = H((I) => I.activeSourceHighlight), g = H((I) => I.selectSourceHighlight), d = H((I) => I.setActiveNoteSection), [p, v] = E.useState(""), [w, x] = E.useState(""), T = E.useRef(null);
  E.useEffect(() => {
    var q;
    if (!a) {
      v(""), x("");
      return;
    }
    const I = Object.keys(a.sections || {}).find(Boolean) || "";
    v(I), d(I), x(""), g(((q = a.sourceHighlights) == null ? void 0 : q[0]) || null, { openPanel: !1 });
  }, [a == null ? void 0 : a.materialId, g, d]);
  const A = E.useMemo(() => {
    if (!a) return "";
    const I = bj(a.aiSummary, a.sections || {}), q = eF(I);
    return wF(q, {
      promptMode: a.promptMode,
      collapseSecondary: TF()
    });
  }, [a]);
  E.useEffect(() => {
    A && sF();
  }, [A]);
  const b = E.useMemo(() => CF(a), [a]), C = Array.isArray(a == null ? void 0 : a.sourceHighlights) ? a.sourceHighlights : [], M = C.find((I) => I.id === (m == null ? void 0 : m.id)) || C[0] || null, P = ys(a), z = Zo(a), O = (I) => {
    const q = I ? `/${encodeURIComponent(I)}` : "";
    globalThis.location.hash = `#/focus-room${q}`;
  }, F = (I) => {
    var ge;
    v(I), d(I), f(Cf(a, I, w));
    const q = T.current;
    if (!q || I === "Full notes") return;
    const re = `[data-section-title="${R_(I)}"]`;
    (ge = q.querySelector(re)) == null || ge.scrollIntoView({ behavior: "smooth", block: "start" });
  }, L = () => {
    var q, re, ge;
    const I = String(((ge = (re = (q = globalThis.getSelection) == null ? void 0 : q.call(globalThis)) == null ? void 0 : re.toString) == null ? void 0 : ge.call(re)) || "").trim();
    I && (x(I.slice(0, 1600)), f(Cf(a, p, I)));
  }, U = (I) => {
    const q = Cf(a, p, w);
    f(q), l("chat");
    const re = PF(I, a, q);
    re && c(re);
  }, G = (I, { openSources: q = !1 } = {}) => {
    var ge;
    if (!I) return;
    const re = String(I.excerpt || "").slice(0, 1600);
    if (x(re), g(I, { openPanel: !1 }), I.sectionTitle) {
      v(I.sectionTitle), d(I.sectionTitle);
      const _e = T.current, ke = `[data-section-title="${R_(I.sectionTitle)}"]`;
      (ge = _e == null ? void 0 : _e.querySelector(ke)) == null || ge.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    f({
      sectionTitle: I.sectionTitle || p,
      excerpt: re
    }), q && l("sources");
  }, te = (I) => {
    const q = I || M;
    q && (G(q), l("chat"), c(`Explain this source evidence and how it supports the generated notes:

${q.excerpt || q.title || q.sourceLabel}`));
  }, ae = (I = M) => {
    const q = I || {};
    s == null || s((a == null ? void 0 : a.materialId) || "", "source", {
      sourceId: q.sourceId || "",
      sourceIndex: q.sourceIndex || 0,
      sourceLabel: q.sourceLabel || "",
      sectionTitle: q.sectionTitle || p || "",
      highlightId: q.id || "",
      excerpt: q.excerpt || ""
    });
  };
  if (!a && n === "loading")
    return /* @__PURE__ */ S.jsx("p", { className: "focus-panel-empty", children: "Generating study materials..." });
  if (!a && n === "error")
    return /* @__PURE__ */ S.jsxs("p", { className: "focus-panel-empty", children: [
      "Unable to load materials. Try again. ",
      r ? `(${r})` : ""
    ] });
  if (!a)
    return /* @__PURE__ */ S.jsx("p", { className: "focus-panel-empty", children: "No generated materials yet" });
  const le = t === "materials", me = t !== "sources", ee = t !== "notes";
  return /* @__PURE__ */ S.jsxs("section", { className: `study-tool-stack focus-material-layout focus-material-mode-${t}`.trim(), children: [
    le ? /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite focus-material-meta", children: [
      /* @__PURE__ */ S.jsxs("div", { className: "study-tool-head", children: [
        /* @__PURE__ */ S.jsxs("div", { children: [
          /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Study Materials" }),
          /* @__PURE__ */ S.jsx("h3", { children: a.materialTitle || "Generated study notes" })
        ] }),
        /* @__PURE__ */ S.jsxs("label", { className: "focus-field focus-material-select", children: [
          "Material",
          /* @__PURE__ */ S.jsx("select", { value: a.materialId, onChange: (I) => O(I.target.value), children: e.map((I) => /* @__PURE__ */ S.jsx("option", { value: I.materialId, children: I.materialTitle || "Study material" }, I.materialId)) })
        ] })
      ] }),
      /* @__PURE__ */ S.jsxs("div", { className: "focus-material-badges", children: [
        /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ S.jsx(Vp, { size: 14, "aria-hidden": "true" }),
          " ",
          kF(a)
        ] }),
        /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ S.jsx(eI, { size: 14, "aria-hidden": "true" }),
          " ",
          Object.keys(a.sections || {}).length || a.studyHeadings.length || 1,
          " sections"
        ] }),
        /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ S.jsx(qN, { size: 14, "aria-hidden": "true" }),
          " ",
          C.length || ((de = a.sources) == null ? void 0 : de.length) || ((W = a.sourceItems) == null ? void 0 : W.length) || 0,
          " sources"
        ] })
      ] }),
      /* @__PURE__ */ S.jsx("p", { className: "focus-subtle-copy", children: bF(a) }),
      a.isSourceRestricted ? /* @__PURE__ */ S.jsxs("div", { className: "focus-source-banner", children: [
        /* @__PURE__ */ S.jsx("strong", { children: "Source-restricted mode" }),
        /* @__PURE__ */ S.jsx("span", { children: "Answers and summaries stay inside the uploaded material. When the source is missing something, Synapse says so directly." })
      ] }) : null,
      /* @__PURE__ */ S.jsxs("div", { className: "focus-action-grid", children: [
        /* @__PURE__ */ S.jsxs(fe, { variant: "primary", onClick: () => U("explain"), children: [
          /* @__PURE__ */ S.jsx(Tu, { size: 16, "aria-hidden": "true" }),
          " Explain this section"
        ] }),
        /* @__PURE__ */ S.jsx(fe, { onClick: () => P.length ? l("quiz") : s == null ? void 0 : s(a.materialId || "", "quiz"), children: "Make quiz from this section" }),
        /* @__PURE__ */ S.jsx(fe, { onClick: () => z.length ? l("flashcards") : s == null ? void 0 : s(a.materialId || "", "flashcards"), children: "Turn this into flashcards" }),
        /* @__PURE__ */ S.jsx(fe, { onClick: () => a.mindMap ? l("mindmap") : s == null ? void 0 : s(a.materialId || "", "mindmap"), children: "Create mind map from this section" }),
        /* @__PURE__ */ S.jsx(fe, { onClick: () => U("summarize"), children: "Summarise for exam revision" }),
        /* @__PURE__ */ S.jsxs(fe, { onClick: () => l("notes"), children: [
          /* @__PURE__ */ S.jsx(Au, { size: 16, "aria-hidden": "true" }),
          " Read generated notes"
        ] }),
        /* @__PURE__ */ S.jsxs(fe, { onClick: () => l("sources"), disabled: !C.length, children: [
          /* @__PURE__ */ S.jsx(Kl, { size: 16, "aria-hidden": "true" }),
          " Inspect sources"
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite focus-material-outline", children: [
      /* @__PURE__ */ S.jsxs("div", { className: "study-tool-head", children: [
        /* @__PURE__ */ S.jsxs("div", { children: [
          /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Section Map" }),
          /* @__PURE__ */ S.jsx("h3", { children: "Read inside the room" })
        ] }),
        /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ S.jsx(Au, { size: 14, "aria-hidden": "true" }),
          " Full content"
        ] })
      ] }),
      /* @__PURE__ */ S.jsx("div", { className: "focus-section-groups", children: b.map((I) => /* @__PURE__ */ S.jsxs("div", { className: "focus-section-group", children: [
        /* @__PURE__ */ S.jsx("strong", { children: I.label }),
        /* @__PURE__ */ S.jsx("div", { className: "focus-section-chip-row", children: I.items.map((q) => /* @__PURE__ */ S.jsxs(
          "button",
          {
            className: `focus-section-chip ${p === q ? "is-active" : ""}`.trim(),
            type: "button",
            onClick: () => F(q),
            children: [
              /* @__PURE__ */ S.jsx("span", { children: q }),
              /* @__PURE__ */ S.jsx(Ow, { size: 14, "aria-hidden": "true" })
            ]
          },
          q
        )) })
      ] }, I.label)) }),
      !!((J = a.sources) != null && J.length || (X = a.sourceItems) != null && X.length) && /* @__PURE__ */ S.jsx("div", { className: "focus-source-list", children: ((j = a.sources) != null && j.length ? a.sources : a.sourceItems).slice(0, 6).map((I, q) => {
        const re = typeof I == "string" ? I : (I == null ? void 0 : I.title) || (I == null ? void 0 : I.name) || (I == null ? void 0 : I.label) || (I == null ? void 0 : I.url) || `Source ${q + 1}`;
        return /* @__PURE__ */ S.jsx("span", { className: "focus-pill", children: re }, `${re}-${q}`);
      }) }),
      C.length ? /* @__PURE__ */ S.jsxs("div", { className: "focus-source-highlight-strip", "aria-label": "Generated source highlights", children: [
        /* @__PURE__ */ S.jsxs("div", { className: "study-tool-head compact", children: [
          /* @__PURE__ */ S.jsxs("div", { children: [
            /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Source Highlights" }),
            /* @__PURE__ */ S.jsx("h3", { children: "Evidence you can jump to" })
          ] }),
          /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
            /* @__PURE__ */ S.jsx(Kl, { size: 14, "aria-hidden": "true" }),
            " ",
            C.length
          ] })
        ] }),
        /* @__PURE__ */ S.jsx(
          EF,
          {
            highlights: C.slice(0, t === "sources" ? C.length : 5),
            activeId: (M == null ? void 0 : M.id) || "",
            onSelect: (I) => G(I, { openSources: t !== "sources" })
          }
        )
      ] }) : null
    ] }),
    ee ? /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite focus-source-workbench", children: [
      /* @__PURE__ */ S.jsxs("div", { className: "study-tool-head", children: [
        /* @__PURE__ */ S.jsxs("div", { children: [
          /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Source Workbench" }),
          /* @__PURE__ */ S.jsx("h3", { children: (M == null ? void 0 : M.sourceLabel) || "Uploaded sources" })
        ] }),
        /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ S.jsx(pI, { size: 14, "aria-hidden": "true" }),
          " Direct source"
        ] })
      ] }),
      M ? /* @__PURE__ */ S.jsxs("div", { className: "focus-source-preview-card", children: [
        /* @__PURE__ */ S.jsxs("div", { className: "focus-source-preview-meta", children: [
          /* @__PURE__ */ S.jsx("span", { children: M.sourceKind || "source" }),
          /* @__PURE__ */ S.jsx("strong", { children: M.title || M.sourceLabel }),
          M.sectionTitle ? /* @__PURE__ */ S.jsxs("button", { type: "button", onClick: () => F(M.sectionTitle), children: [
            "Jump to ",
            M.sectionTitle
          ] }) : null
        ] }),
        /* @__PURE__ */ S.jsx("blockquote", { children: M.excerpt || "No extracted excerpt is available for this source yet." }),
        /* @__PURE__ */ S.jsxs("div", { className: "focus-button-row", children: [
          /* @__PURE__ */ S.jsxs(fe, { variant: "primary", onClick: () => te(M), children: [
            /* @__PURE__ */ S.jsx(Tu, { size: 16, "aria-hidden": "true" }),
            " Ask AI about this source"
          ] }),
          /* @__PURE__ */ S.jsxs(fe, { onClick: () => ae(M), children: [
            /* @__PURE__ */ S.jsx(GN, { size: 16, "aria-hidden": "true" }),
            " Open source in workspace"
          ] })
        ] })
      ] }) : /* @__PURE__ */ S.jsx("p", { className: "focus-panel-empty", children: "No source highlights are attached to this material yet. Open the workspace source viewer to restore previews for older notes." })
    ] }) : null,
    me ? /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite focus-material-reader", children: [
      /* @__PURE__ */ S.jsxs("div", { className: "study-tool-head", children: [
        /* @__PURE__ */ S.jsxs("div", { children: [
          /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Generated Notes" }),
          /* @__PURE__ */ S.jsx("h3", { children: p || "Scrollable reading view" })
        ] }),
        w ? /* @__PURE__ */ S.jsx("span", { className: "focus-pill", children: "Text selected for AI follow-up" }) : null
      ] }),
      C.length ? /* @__PURE__ */ S.jsx("div", { className: "focus-reader-source-bar", children: C.slice(0, 4).map((I, q) => /* @__PURE__ */ S.jsxs(
        "button",
        {
          className: `source-highlight inline ${I.id === (M == null ? void 0 : M.id) ? "is-active" : ""}`.trim(),
          type: "button",
          onClick: () => G(I, { openSources: !0 }),
          children: [
            /* @__PURE__ */ S.jsx(Kl, { size: 14, "aria-hidden": "true" }),
            /* @__PURE__ */ S.jsx("span", { children: I.title || I.sourceLabel || `Source ${q + 1}` })
          ]
        },
        I.id || q
      )) }) : null,
      /* @__PURE__ */ S.jsx(
        "div",
        {
          ref: T,
          className: "focus-material-surface",
          onMouseUp: L,
          onKeyUp: L,
          dangerouslySetInnerHTML: { __html: A }
        }
      )
    ] }) : null
  ] });
}
function MF({ onWorkspace: t }) {
  const e = H((c) => c.selectedMaterial), n = H((c) => c.workspaceNotes), r = H((c) => c.workspaceUpdatedAt), s = H((c) => c.setWorkspaceNotes), a = H((c) => c.openStudyPanel), l = r ? `Autosaved ${new Date(r).toLocaleString()}` : "Autosave on";
  return /* @__PURE__ */ S.jsx("section", { className: "study-tool-stack", children: /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite focus-notes-card", children: [
    /* @__PURE__ */ S.jsxs("div", { className: "study-tool-head", children: [
      /* @__PURE__ */ S.jsxs("div", { children: [
        /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Workspace Notes" }),
        /* @__PURE__ */ S.jsx("h3", { children: (e == null ? void 0 : e.materialTitle) || "Study notes" })
      ] }),
      /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
        /* @__PURE__ */ S.jsx(Au, { size: 14, "aria-hidden": "true" }),
        " ",
        l
      ] })
    ] }),
    /* @__PURE__ */ S.jsx(
      "textarea",
      {
        className: "answer-input focus-notes-textarea",
        placeholder: "Capture connections, revision cues, questions, and mistakes while you study...",
        value: n,
        onChange: (c) => s(c.target.value)
      }
    ),
    /* @__PURE__ */ S.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ S.jsxs(fe, { variant: "primary", onClick: () => a("materials"), children: [
        /* @__PURE__ */ S.jsx(Vp, { size: 16, "aria-hidden": "true" }),
        " Back to materials"
      ] }),
      /* @__PURE__ */ S.jsx(fe, { onClick: () => t == null ? void 0 : t((e == null ? void 0 : e.materialId) || "", "assistant"), children: "Open full workspace" })
    ] })
  ] }) });
}
function RF({ mindMap: t }) {
  if (!t)
    return /* @__PURE__ */ S.jsx("p", { children: "No mind map is attached to this material yet. Return to the workspace and generate one from your notes." });
  const e = Array.isArray(t.branches) ? t.branches : [];
  return e.length ? /* @__PURE__ */ S.jsxs("div", { className: "mindmap-viewer", children: [
    /* @__PURE__ */ S.jsx("div", { className: "mindmap-center", children: t.center || "Study Notes" }),
    /* @__PURE__ */ S.jsx("div", { className: "mindmap-branches", children: e.slice(0, 10).map((n, r) => /* @__PURE__ */ S.jsxs("article", { className: "mindmap-branch liquid-glass-lite", children: [
      /* @__PURE__ */ S.jsx("strong", { children: n.title || `Branch ${r + 1}` }),
      /* @__PURE__ */ S.jsx("p", { children: n.summary || n.detail || "Open this branch in the workspace for more detail." })
    ] }, `${n.title || "Branch"}-${r}`)) })
  ] }) : /* @__PURE__ */ S.jsx("pre", { className: "mindmap-json", children: JSON.stringify(t, null, 2) });
}
function NF({ questions: t }) {
  const e = H((l) => l.quizAnswers), n = H((l) => l.quizChecked), r = H((l) => l.answerQuizQuestion), s = H((l) => l.checkQuizQuestion), a = H((l) => {
    const c = Object.values(l.quizChecked || {}).filter((f) => f && f.hasKnownAnswer);
    return c.length ? Math.round(c.filter((f) => f.correct).length / c.length * 100) : null;
  });
  return /* @__PURE__ */ S.jsxs("div", { className: "quiz-stack", children: [
    a === null ? null : /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
      "Current score ",
      a,
      "%"
    ] }),
    t.map((l, c) => {
      const f = e[c], m = n[c] || null, g = vs(l), d = typeof f == "string" ? f : "", p = LI(l, f);
      return /* @__PURE__ */ S.jsxs("article", { className: "quiz-card liquid-glass-lite", children: [
        /* @__PURE__ */ S.jsxs("span", { className: "focus-kicker", children: [
          l.quizTitle || "Quiz",
          " / Question ",
          c + 1
        ] }),
        /* @__PURE__ */ S.jsx("h3", { children: kh(l, c) }),
        g.length ? /* @__PURE__ */ S.jsx("div", { className: "focus-button-row", children: g.map((v, w) => /* @__PURE__ */ S.jsx(
          fe,
          {
            variant: zI(l, f, w) ? "primary" : "ghost",
            onClick: () => r(c, w),
            children: v
          },
          v
        )) }) : /* @__PURE__ */ S.jsx(
          "textarea",
          {
            className: "answer-input",
            value: d,
            onChange: (v) => r(c, v.target.value)
          }
        ),
        /* @__PURE__ */ S.jsx(fe, { variant: "primary", disabled: !p, onClick: () => s(c), children: "Check answer" }),
        m ? /* @__PURE__ */ S.jsxs("p", { children: [
          m.hasKnownAnswer ? m.correct ? "Correct" : "Review this one" : "Answer saved for review",
          m.explanation ? ` - ${m.explanation}` : ""
        ] }) : null
      ] }, `${kh(l, c)}-${c}`);
    })
  ] });
}
function IF({ onWorkspace: t }) {
  const { data: e = [] } = cT();
  return /* @__PURE__ */ S.jsx("section", { className: "study-tool-stack", children: /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ S.jsxs("div", { className: "study-tool-head", children: [
      /* @__PURE__ */ S.jsxs("div", { children: [
        /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Study History" }),
        /* @__PURE__ */ S.jsx("h3", { children: "Recent focus sessions" })
      ] }),
      /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
        /* @__PURE__ */ S.jsx($p, { size: 14, "aria-hidden": "true" }),
        " ",
        e.length,
        " saved"
      ] })
    ] }),
    /* @__PURE__ */ S.jsx("div", { className: "history-list", children: e.length ? e.map((n) => {
      const r = n.sessionDate || n.endedAt || n.startedAt || "";
      return /* @__PURE__ */ S.jsxs("article", { className: "history-row liquid-glass-lite", children: [
        /* @__PURE__ */ S.jsx("strong", { children: n.materialTitle || "Study material" }),
        /* @__PURE__ */ S.jsx("span", { children: r ? new Date(r).toLocaleString() : "Saved session" }),
        n.studyGoal ? /* @__PURE__ */ S.jsx("p", { children: n.studyGoal }) : null,
        /* @__PURE__ */ S.jsxs("p", { children: [
          "Focused ",
          Math.round((Number(n.totalFocusTime) || 0) / 60),
          "m",
          n.quizScore === null || n.quizScore === void 0 ? "" : ` · Quiz ${n.quizScore}%`,
          n.flashcardsCompleted ? ` · ${n.flashcardsCompleted} cards` : ""
        ] })
      ] }, n.sessionId);
    }) : /* @__PURE__ */ S.jsx("p", { className: "focus-panel-empty", children: "No Focus Room sessions saved yet." }) }),
    /* @__PURE__ */ S.jsx("div", { className: "focus-button-row", children: /* @__PURE__ */ S.jsx(fe, { variant: "primary", onClick: () => t == null ? void 0 : t(), children: "Open Workspace" }) })
  ] }) });
}
function Wi({ label: t, action: e, materialId: n, onWorkspace: r }) {
  return /* @__PURE__ */ S.jsx("div", { className: "focus-button-row", children: /* @__PURE__ */ S.jsx(fe, { variant: "primary", onClick: () => r == null ? void 0 : r(n || "", e), children: t }) });
}
function DF({ onWorkspace: t }) {
  const e = H((l) => l.studyPlan), n = H((l) => l.completedTasks), r = H((l) => l.updatePlanTask), s = H((l) => l.toggleTask), a = H((l) => l.selectedMaterial);
  return /* @__PURE__ */ S.jsx("section", { className: "study-tool-stack", children: /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ S.jsxs("div", { className: "study-tool-head", children: [
      /* @__PURE__ */ S.jsxs("div", { children: [
        /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Study Plan" }),
        /* @__PURE__ */ S.jsx("h3", { children: "Guide the current block" })
      ] }),
      /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
        n.length,
        "/",
        e.length,
        " complete"
      ] })
    ] }),
    /* @__PURE__ */ S.jsx("div", { className: "plan-editor", children: e.map((l, c) => /* @__PURE__ */ S.jsxs("article", { className: "plan-edit-item liquid-glass-lite", children: [
      /* @__PURE__ */ S.jsxs("label", { className: "focus-field", children: [
        "Minutes",
        /* @__PURE__ */ S.jsx("input", { value: l.minutes, type: "number", min: "1", max: "180", onChange: (f) => r(c, f.target.value, null) })
      ] }),
      /* @__PURE__ */ S.jsxs("label", { className: "focus-field", children: [
        "Task",
        /* @__PURE__ */ S.jsx("textarea", { value: l.task, onChange: (f) => r(c, null, f.target.value) })
      ] }),
      /* @__PURE__ */ S.jsx(
        fe,
        {
          variant: n.includes(l.task) ? "primary" : "ghost",
          onClick: () => s(c),
          children: n.includes(l.task) ? "Completed" : "Mark complete"
        }
      )
    ] }, `${l.task}-${c}`)) }),
    /* @__PURE__ */ S.jsx("div", { className: "focus-button-row", children: /* @__PURE__ */ S.jsx(fe, { onClick: () => t == null ? void 0 : t((a == null ? void 0 : a.materialId) || "", "timeline"), children: "Open Timeline Workspace" }) })
  ] }) });
}
function jF({ tab: t, materials: e, materialsStatus: n, materialsError: r, onWorkspace: s }) {
  const a = H((l) => l.selectedMaterial);
  if (t === "materials")
    return /* @__PURE__ */ S.jsx(
      Pf,
      {
        mode: "materials",
        materials: e,
        status: n,
        error: r,
        onWorkspace: s
      }
    );
  if (t === "history")
    return /* @__PURE__ */ S.jsx(IF, { onWorkspace: s });
  if (!a)
    return /* @__PURE__ */ S.jsx("p", { className: "focus-panel-empty", children: "No generated materials yet" });
  if (t === "notes")
    return /* @__PURE__ */ S.jsx(
      Pf,
      {
        mode: "notes",
        materials: e,
        status: n,
        error: r,
        onWorkspace: s
      }
    );
  if (t === "sources")
    return /* @__PURE__ */ S.jsx(
      Pf,
      {
        mode: "sources",
        materials: e,
        status: n,
        error: r,
        onWorkspace: s
      }
    );
  if (t === "flashcards") {
    const l = Zo(a);
    return l.length ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
      /* @__PURE__ */ S.jsx(Aj, { cards: l }),
      /* @__PURE__ */ S.jsx(Wi, { label: "Open Flashcard Workspace", action: "flashcards", materialId: a.materialId, onWorkspace: s })
    ] }) : /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite", children: [
      /* @__PURE__ */ S.jsx("h3", { children: "Flashcards" }),
      /* @__PURE__ */ S.jsx("p", { children: "No flashcards are attached to this material yet." }),
      /* @__PURE__ */ S.jsx(Wi, { label: "Open Flashcard Workspace", action: "flashcards", materialId: a.materialId, onWorkspace: s })
    ] });
  }
  if (t === "quiz") {
    const l = ys(a);
    return l.length ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
      /* @__PURE__ */ S.jsx(NF, { questions: l }),
      /* @__PURE__ */ S.jsx(Wi, { label: "Open Quiz Workspace", action: "quiz", materialId: a.materialId, onWorkspace: s })
    ] }) : /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite", children: [
      /* @__PURE__ */ S.jsx("h3", { children: "Quiz" }),
      /* @__PURE__ */ S.jsx("p", { children: "No saved quiz is attached to this material yet." }),
      /* @__PURE__ */ S.jsx(Wi, { label: "Open Quiz Workspace", action: "quiz", materialId: a.materialId, onWorkspace: s })
    ] });
  }
  return t === "mindmap" ? /* @__PURE__ */ S.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ S.jsx("h3", { children: "Mind Map" }),
    /* @__PURE__ */ S.jsx(RF, { mindMap: a.mindMap }),
    /* @__PURE__ */ S.jsx(Wi, { label: "Open Mind Map Workspace", action: "mindmap", materialId: a.materialId, onWorkspace: s })
  ] }) : t === "chat" ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
    /* @__PURE__ */ S.jsx(Tj, {}),
    /* @__PURE__ */ S.jsx(Wi, { label: "Open Workspace Assistant", action: "assistant", materialId: a.materialId, onWorkspace: s })
  ] }) : t === "plan" ? /* @__PURE__ */ S.jsx(DF, { onWorkspace: s }) : t === "workspace" ? /* @__PURE__ */ S.jsx(MF, { onWorkspace: s }) : null;
}
function FF({ onWorkspace: t }) {
  const e = H((f) => f.aiPanelOpen), n = H((f) => f.panelTab), r = H((f) => f.toggleAIPanel), s = H((f) => f.setPanelTab), a = H((f) => f.materials), l = H((f) => f.materialsStatus), c = H((f) => f.materialsError);
  return /* @__PURE__ */ S.jsx(Yp, { modal: !1, open: e, onOpenChange: r, children: /* @__PURE__ */ S.jsx(Jo, { children: e ? /* @__PURE__ */ S.jsxs(Qp, { forceMount: !0, children: [
    /* @__PURE__ */ S.jsx(Xp, { asChild: !0, children: /* @__PURE__ */ S.jsx(
      cn.div,
      {
        className: "ai-panel-scrim",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ S.jsx(Jp, { asChild: !0, children: /* @__PURE__ */ S.jsxs(
      cn.aside,
      {
        className: "ai-learning-panel liquid-glass extra-panel focus-tool-panel",
        initial: { opacity: 0, x: 42 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 42 },
        transition: is,
        children: [
          /* @__PURE__ */ S.jsxs("div", { className: "drawer-head", children: [
            /* @__PURE__ */ S.jsxs("div", { children: [
              /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Synapse Study Suite" }),
              /* @__PURE__ */ S.jsx(em, { children: n === "materials" ? "Materials Workspace" : s_(n) }),
              /* @__PURE__ */ S.jsx(tm, { className: "sr-only", children: "Focus Room study suite with materials, AI chat, quiz, flashcards, mind map, notes, study plan, and history." })
            ] }),
            /* @__PURE__ */ S.jsx(H1, { asChild: !0, children: /* @__PURE__ */ S.jsx(fe, { "aria-label": "Close study suite", children: /* @__PURE__ */ S.jsx(Hw, { size: 16, "aria-hidden": "true" }) }) })
          ] }),
          /* @__PURE__ */ S.jsxs(hj, { className: "ai-tabs", value: n, onValueChange: s, children: [
            /* @__PURE__ */ S.jsx(pj, { className: "ai-tab-row", "aria-label": "Focus Room study tools", children: wh.map((f) => /* @__PURE__ */ S.jsx(mj, { className: "ai-tab-trigger", value: f, children: s_(f) }, f)) }),
            wh.map((f) => /* @__PURE__ */ S.jsx(gj, { className: "ai-tab-content", value: f, children: /* @__PURE__ */ S.jsx(
              jF,
              {
                tab: f,
                materials: a,
                materialsStatus: l,
                materialsError: c,
                onWorkspace: t
              }
            ) }, f))
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function OF(t) {
  return /* @__PURE__ */ S.jsx(FF, { ...t });
}
function LF({ onWorkspace: t, onHistory: e }) {
  const n = H((d) => d.summaryRecord), r = H((d) => d.selectedMaterial), s = H((d) => d.closeSummary), a = H((d) => d.openStudyPanel), l = H((d) => d.startTimer), c = () => {
    s(), a("history");
  }, f = () => {
    s(), t == null || t();
  }, m = Zo(r), g = ys(r);
  return /* @__PURE__ */ S.jsx(Yp, { open: !!n, onOpenChange: (d) => !d && s(), children: /* @__PURE__ */ S.jsx(Jo, { children: n ? /* @__PURE__ */ S.jsxs(Qp, { forceMount: !0, children: [
    /* @__PURE__ */ S.jsx(Xp, { asChild: !0, children: /* @__PURE__ */ S.jsx(
      cn.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ S.jsx(Jp, { asChild: !0, children: /* @__PURE__ */ S.jsxs(
      cn.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ S.jsx(em, { children: n.materialTitle }),
          /* @__PURE__ */ S.jsx(tm, { className: "sr-only", children: "Summary of focus time, flashcards, quiz score, completed tasks, and recommended next step." }),
          /* @__PURE__ */ S.jsx("p", { children: n.aiReflection }),
          /* @__PURE__ */ S.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ S.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ S.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ S.jsx("strong", { children: Fu(n.totalFocusTime) })
            ] }),
            /* @__PURE__ */ S.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ S.jsx("span", { children: "Flashcards" }),
              /* @__PURE__ */ S.jsx("strong", { children: n.flashcardsCompleted })
            ] }),
            /* @__PURE__ */ S.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ S.jsx("span", { children: "Quiz score" }),
              /* @__PURE__ */ S.jsx("strong", { children: n.quizScore === null ? "N/A" : `${n.quizScore}%` })
            ] }),
            /* @__PURE__ */ S.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ S.jsx("span", { children: "Tasks" }),
              /* @__PURE__ */ S.jsx("strong", { children: n.completedTasks.length })
            ] })
          ] }),
          n.mistakesMade.length ? /* @__PURE__ */ S.jsxs("p", { children: [
            "Review: ",
            n.mistakesMade.join("; ")
          ] }) : null,
          n.persisted === !1 ? /* @__PURE__ */ S.jsx("p", { children: "This session is visible for now, but could not be saved to this device history." }) : null,
          /* @__PURE__ */ S.jsx("p", { children: n.recommendedNextStep }),
          /* @__PURE__ */ S.jsxs("div", { className: "focus-button-row", children: [
            /* @__PURE__ */ S.jsx(fe, { variant: "primary", onClick: () => {
              s(), l();
            }, children: "Continue studying" }),
            /* @__PURE__ */ S.jsx(fe, { onClick: () => {
              s(), a(g.length ? "quiz" : "materials");
            }, children: "Start quiz" }),
            /* @__PURE__ */ S.jsx(fe, { onClick: () => {
              s(), a(m.length ? "flashcards" : "materials");
            }, children: "Review flashcards" }),
            /* @__PURE__ */ S.jsx(fe, { onClick: () => {
              s(), a(r != null && r.mindMap ? "mindmap" : "materials");
            }, children: "Open mind map" }),
            /* @__PURE__ */ S.jsx(fe, { onClick: c, children: "View History" }),
            /* @__PURE__ */ S.jsx(fe, { onClick: f, children: "Workspace" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function zF() {
  var m, g;
  const t = H((d) => d.selectedMaterial), e = H((d) => d.selectedScene), n = H((d) => d.studyGoal), r = H((d) => d.studyPlan), s = H((d) => d.completedTasks), a = H((d) => d.workspaceNotes), l = H((d) => d.openStudyPanel), c = gs(e), f = ((m = r.find((d) => !s.includes(d.task))) == null ? void 0 : m.task) || "Review and consolidate this block.";
  return /* @__PURE__ */ S.jsxs("aside", { className: "session-overview liquid-glass", children: [
    /* @__PURE__ */ S.jsxs("div", { className: "session-overview-head", children: [
      /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Current Session" }),
      /* @__PURE__ */ S.jsx("h2", { children: c.name }),
      /* @__PURE__ */ S.jsx("p", { children: (t == null ? void 0 : t.materialTitle) || "Study material" })
    ] }),
    /* @__PURE__ */ S.jsxs("div", { className: "session-overview-copy", children: [
      /* @__PURE__ */ S.jsxs("div", { className: "session-stat-row", children: [
        /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ S.jsx(Lw, { size: 14, "aria-hidden": "true" }),
          " ",
          t != null && t.isSourceRestricted ? "Source-restricted" : "Adaptive notes"
        ] }),
        /* @__PURE__ */ S.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ S.jsx(zp, { size: 14, "aria-hidden": "true" }),
          " ",
          Object.keys((t == null ? void 0 : t.sections) || {}).length || ((g = t == null ? void 0 : t.studyHeadings) == null ? void 0 : g.length) || 1,
          " sections"
        ] })
      ] }),
      /* @__PURE__ */ S.jsxs("div", { className: "session-goal-block", children: [
        /* @__PURE__ */ S.jsx("strong", { children: "Study goal" }),
        /* @__PURE__ */ S.jsx("p", { children: n || `Study ${(t == null ? void 0 : t.materialTitle) || "this material"}` })
      ] }),
      /* @__PURE__ */ S.jsxs("div", { className: "session-goal-block", children: [
        /* @__PURE__ */ S.jsx("strong", { children: "Next task" }),
        /* @__PURE__ */ S.jsx("p", { children: f })
      ] })
    ] }),
    /* @__PURE__ */ S.jsxs("div", { className: "session-mini-grid", children: [
      /* @__PURE__ */ S.jsxs("button", { className: "session-mini-card", type: "button", onClick: () => l("materials"), children: [
        /* @__PURE__ */ S.jsx(Au, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ S.jsx("span", { children: "Materials" })
      ] }),
      /* @__PURE__ */ S.jsxs("button", { className: "session-mini-card", type: "button", onClick: () => l("chat"), children: [
        /* @__PURE__ */ S.jsx(Tu, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ S.jsx("span", { children: "AI tutor" })
      ] }),
      /* @__PURE__ */ S.jsxs("button", { className: "session-mini-card", type: "button", onClick: () => l("plan"), children: [
        /* @__PURE__ */ S.jsx(nI, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ S.jsxs("span", { children: [
          s.length,
          "/",
          r.length || 0,
          " tasks"
        ] })
      ] }),
      /* @__PURE__ */ S.jsxs("button", { className: "session-mini-card", type: "button", onClick: () => l("workspace"), children: [
        /* @__PURE__ */ S.jsx(zw, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ S.jsx("span", { children: a.trim() ? "Notes saved" : "Notes ready" })
      ] })
    ] }),
    /* @__PURE__ */ S.jsxs("div", { className: "focus-button-row session-overview-actions", children: [
      /* @__PURE__ */ S.jsx(fe, { variant: "primary", onClick: () => l("materials"), children: "Open materials" }),
      /* @__PURE__ */ S.jsxs(fe, { onClick: () => l("history"), children: [
        /* @__PURE__ */ S.jsx($p, { size: 16, "aria-hidden": "true" }),
        " History"
      ] })
    ] })
  ] });
}
function $F({ onWorkspace: t }) {
  const { data: e = [] } = cT();
  return /* @__PURE__ */ S.jsxs("section", { className: "history-stage", children: [
    /* @__PURE__ */ S.jsxs(Eo, { className: "history-main", children: [
      /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: "Synapse Focus Room" }),
      /* @__PURE__ */ S.jsx("h1", { children: "Study History" }),
      /* @__PURE__ */ S.jsx("p", { children: "Review recent Focus Room sessions saved on this device." }),
      /* @__PURE__ */ S.jsx("div", { className: "history-list", children: e.length ? e.map((n) => {
        const r = n.sessionDate || n.endedAt || n.startedAt || "", s = r ? new Date(r).toLocaleString() : "Saved session";
        return /* @__PURE__ */ S.jsxs("article", { className: "history-row liquid-glass-lite", children: [
          /* @__PURE__ */ S.jsx("strong", { children: n.materialTitle || "Study material" }),
          /* @__PURE__ */ S.jsxs("span", { children: [
            s,
            " / ",
            Fu(n.totalFocusTime || 0)
          ] }),
          n.studyGoal ? /* @__PURE__ */ S.jsx("p", { children: n.studyGoal }) : null,
          n.persisted === !1 ? /* @__PURE__ */ S.jsx("p", { children: "Not saved to device history" }) : null
        ] }, n.sessionId);
      }) : /* @__PURE__ */ S.jsx("p", { children: "No Focus Room sessions saved yet." }) })
    ] }),
    /* @__PURE__ */ S.jsxs(Eo, { className: "history-next", children: [
      /* @__PURE__ */ S.jsx("h2", { children: "Next step" }),
      /* @__PURE__ */ S.jsx("p", { children: "Choose a material from the workspace to start another protected study block." }),
      /* @__PURE__ */ S.jsx(fe, { variant: "primary", onClick: () => t(), children: "Open Workspace" })
    ] })
  ] });
}
function N_({ title: t, kicker: e, children: n }) {
  const r = H((s) => s.closeDrawer);
  return /* @__PURE__ */ S.jsxs(
    cn.aside,
    {
      className: "extra-panel drawer-open liquid-glass",
      initial: { opacity: 0, x: 28 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 28 },
      transition: is,
      children: [
        /* @__PURE__ */ S.jsxs("div", { className: "drawer-head", children: [
          /* @__PURE__ */ S.jsxs("div", { children: [
            /* @__PURE__ */ S.jsx("span", { className: "focus-kicker", children: e }),
            /* @__PURE__ */ S.jsx("h2", { children: t })
          ] }),
          /* @__PURE__ */ S.jsx(fe, { "aria-label": `Close ${t}`, onClick: r, children: /* @__PURE__ */ S.jsx(Hw, { size: 16, "aria-hidden": "true" }) })
        ] }),
        n
      ]
    }
  );
}
function VF({ audioState: t }) {
  const e = H((n) => n.activeDrawer);
  return /* @__PURE__ */ S.jsxs(Jo, { children: [
    e === "scene" ? /* @__PURE__ */ S.jsx(N_, { title: "Choose Scene", kicker: "Scene", children: /* @__PURE__ */ S.jsx(Xw, {}) }) : null,
    e === "music" ? /* @__PURE__ */ S.jsx(N_, { title: "Sound Atmosphere", kicker: "Music", children: /* @__PURE__ */ S.jsx(w1, { audioState: t }) }) : null
  ] });
}
var Ef = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var I_;
function BF() {
  return I_ || (I_ = 1, (function(t) {
    (function() {
      var e = function() {
        this.init();
      };
      e.prototype = {
        /**
         * Initialize the global Howler object.
         * @return {Howler}
         */
        init: function() {
          var d = this || n;
          return d._counter = 1e3, d._html5AudioPool = [], d.html5PoolSize = 10, d._codecs = {}, d._howls = [], d._muted = !1, d._volume = 1, d._canPlayEvent = "canplaythrough", d._navigator = typeof window < "u" && window.navigator ? window.navigator : null, d.masterGain = null, d.noAudio = !1, d.usingWebAudio = !0, d.autoSuspend = !0, d.ctx = null, d.autoUnlock = !0, d._setup(), d;
        },
        /**
         * Get/set the global volume for all sounds.
         * @param  {Float} vol Volume from 0.0 to 1.0.
         * @return {Howler/Float}     Returns self or current volume.
         */
        volume: function(d) {
          var p = this || n;
          if (d = parseFloat(d), p.ctx || g(), typeof d < "u" && d >= 0 && d <= 1) {
            if (p._volume = d, p._muted)
              return p;
            p.usingWebAudio && p.masterGain.gain.setValueAtTime(d, n.ctx.currentTime);
            for (var v = 0; v < p._howls.length; v++)
              if (!p._howls[v]._webAudio)
                for (var w = p._howls[v]._getSoundIds(), x = 0; x < w.length; x++) {
                  var T = p._howls[v]._soundById(w[x]);
                  T && T._node && (T._node.volume = T._volume * d);
                }
            return p;
          }
          return p._volume;
        },
        /**
         * Handle muting and unmuting globally.
         * @param  {Boolean} muted Is muted or not.
         */
        mute: function(d) {
          var p = this || n;
          p.ctx || g(), p._muted = d, p.usingWebAudio && p.masterGain.gain.setValueAtTime(d ? 0 : p._volume, n.ctx.currentTime);
          for (var v = 0; v < p._howls.length; v++)
            if (!p._howls[v]._webAudio)
              for (var w = p._howls[v]._getSoundIds(), x = 0; x < w.length; x++) {
                var T = p._howls[v]._soundById(w[x]);
                T && T._node && (T._node.muted = d ? !0 : T._muted);
              }
          return p;
        },
        /**
         * Handle stopping all sounds globally.
         */
        stop: function() {
          for (var d = this || n, p = 0; p < d._howls.length; p++)
            d._howls[p].stop();
          return d;
        },
        /**
         * Unload and destroy all currently loaded Howl objects.
         * @return {Howler}
         */
        unload: function() {
          for (var d = this || n, p = d._howls.length - 1; p >= 0; p--)
            d._howls[p].unload();
          return d.usingWebAudio && d.ctx && typeof d.ctx.close < "u" && (d.ctx.close(), d.ctx = null, g()), d;
        },
        /**
         * Check for codec support of specific extension.
         * @param  {String} ext Audio file extention.
         * @return {Boolean}
         */
        codecs: function(d) {
          return (this || n)._codecs[d.replace(/^x-/, "")];
        },
        /**
         * Setup various state values for global tracking.
         * @return {Howler}
         */
        _setup: function() {
          var d = this || n;
          if (d.state = d.ctx && d.ctx.state || "suspended", d._autoSuspend(), !d.usingWebAudio)
            if (typeof Audio < "u")
              try {
                var p = new Audio();
                typeof p.oncanplaythrough > "u" && (d._canPlayEvent = "canplay");
              } catch {
                d.noAudio = !0;
              }
            else
              d.noAudio = !0;
          try {
            var p = new Audio();
            p.muted && (d.noAudio = !0);
          } catch {
          }
          return d.noAudio || d._setupCodecs(), d;
        },
        /**
         * Check for browser support for various codecs and cache the results.
         * @return {Howler}
         */
        _setupCodecs: function() {
          var d = this || n, p = null;
          try {
            p = typeof Audio < "u" ? new Audio() : null;
          } catch {
            return d;
          }
          if (!p || typeof p.canPlayType != "function")
            return d;
          var v = p.canPlayType("audio/mpeg;").replace(/^no$/, ""), w = d._navigator ? d._navigator.userAgent : "", x = w.match(/OPR\/(\d+)/g), T = x && parseInt(x[0].split("/")[1], 10) < 33, A = w.indexOf("Safari") !== -1 && w.indexOf("Chrome") === -1, b = w.match(/Version\/(.*?) /), C = A && b && parseInt(b[1], 10) < 15;
          return d._codecs = {
            mp3: !!(!T && (v || p.canPlayType("audio/mp3;").replace(/^no$/, ""))),
            mpeg: !!v,
            opus: !!p.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
            ogg: !!p.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            oga: !!p.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            wav: !!(p.canPlayType('audio/wav; codecs="1"') || p.canPlayType("audio/wav")).replace(/^no$/, ""),
            aac: !!p.canPlayType("audio/aac;").replace(/^no$/, ""),
            caf: !!p.canPlayType("audio/x-caf;").replace(/^no$/, ""),
            m4a: !!(p.canPlayType("audio/x-m4a;") || p.canPlayType("audio/m4a;") || p.canPlayType("audio/aac;")).replace(/^no$/, ""),
            m4b: !!(p.canPlayType("audio/x-m4b;") || p.canPlayType("audio/m4b;") || p.canPlayType("audio/aac;")).replace(/^no$/, ""),
            mp4: !!(p.canPlayType("audio/x-mp4;") || p.canPlayType("audio/mp4;") || p.canPlayType("audio/aac;")).replace(/^no$/, ""),
            weba: !!(!C && p.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            webm: !!(!C && p.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            dolby: !!p.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
            flac: !!(p.canPlayType("audio/x-flac;") || p.canPlayType("audio/flac;")).replace(/^no$/, "")
          }, d;
        },
        /**
         * Some browsers/devices will only allow audio to be played after a user interaction.
         * Attempt to automatically unlock audio on the first user interaction.
         * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         * @return {Howler}
         */
        _unlockAudio: function() {
          var d = this || n;
          if (!(d._audioUnlocked || !d.ctx)) {
            d._audioUnlocked = !1, d.autoUnlock = !1, !d._mobileUnloaded && d.ctx.sampleRate !== 44100 && (d._mobileUnloaded = !0, d.unload()), d._scratchBuffer = d.ctx.createBuffer(1, 1, 22050);
            var p = function(v) {
              for (; d._html5AudioPool.length < d.html5PoolSize; )
                try {
                  var w = new Audio();
                  w._unlocked = !0, d._releaseHtml5Audio(w);
                } catch {
                  d.noAudio = !0;
                  break;
                }
              for (var x = 0; x < d._howls.length; x++)
                if (!d._howls[x]._webAudio)
                  for (var T = d._howls[x]._getSoundIds(), A = 0; A < T.length; A++) {
                    var b = d._howls[x]._soundById(T[A]);
                    b && b._node && !b._node._unlocked && (b._node._unlocked = !0, b._node.load());
                  }
              d._autoResume();
              var C = d.ctx.createBufferSource();
              C.buffer = d._scratchBuffer, C.connect(d.ctx.destination), typeof C.start > "u" ? C.noteOn(0) : C.start(0), typeof d.ctx.resume == "function" && d.ctx.resume(), C.onended = function() {
                C.disconnect(0), d._audioUnlocked = !0, document.removeEventListener("touchstart", p, !0), document.removeEventListener("touchend", p, !0), document.removeEventListener("click", p, !0), document.removeEventListener("keydown", p, !0);
                for (var M = 0; M < d._howls.length; M++)
                  d._howls[M]._emit("unlock");
              };
            };
            return document.addEventListener("touchstart", p, !0), document.addEventListener("touchend", p, !0), document.addEventListener("click", p, !0), document.addEventListener("keydown", p, !0), d;
          }
        },
        /**
         * Get an unlocked HTML5 Audio object from the pool. If none are left,
         * return a new Audio object and throw a warning.
         * @return {Audio} HTML5 Audio object.
         */
        _obtainHtml5Audio: function() {
          var d = this || n;
          if (d._html5AudioPool.length)
            return d._html5AudioPool.pop();
          var p = new Audio().play();
          return p && typeof Promise < "u" && (p instanceof Promise || typeof p.then == "function") && p.catch(function() {
            console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
          }), new Audio();
        },
        /**
         * Return an activated HTML5 Audio object to the pool.
         * @return {Howler}
         */
        _releaseHtml5Audio: function(d) {
          var p = this || n;
          return d._unlocked && p._html5AudioPool.push(d), p;
        },
        /**
         * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
         * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
         * @return {Howler}
         */
        _autoSuspend: function() {
          var d = this;
          if (!(!d.autoSuspend || !d.ctx || typeof d.ctx.suspend > "u" || !n.usingWebAudio)) {
            for (var p = 0; p < d._howls.length; p++)
              if (d._howls[p]._webAudio) {
                for (var v = 0; v < d._howls[p]._sounds.length; v++)
                  if (!d._howls[p]._sounds[v]._paused)
                    return d;
              }
            return d._suspendTimer && clearTimeout(d._suspendTimer), d._suspendTimer = setTimeout(function() {
              if (d.autoSuspend) {
                d._suspendTimer = null, d.state = "suspending";
                var w = function() {
                  d.state = "suspended", d._resumeAfterSuspend && (delete d._resumeAfterSuspend, d._autoResume());
                };
                d.ctx.suspend().then(w, w);
              }
            }, 3e4), d;
          }
        },
        /**
         * Automatically resume the Web Audio AudioContext when a new sound is played.
         * @return {Howler}
         */
        _autoResume: function() {
          var d = this;
          if (!(!d.ctx || typeof d.ctx.resume > "u" || !n.usingWebAudio))
            return d.state === "running" && d.ctx.state !== "interrupted" && d._suspendTimer ? (clearTimeout(d._suspendTimer), d._suspendTimer = null) : d.state === "suspended" || d.state === "running" && d.ctx.state === "interrupted" ? (d.ctx.resume().then(function() {
              d.state = "running";
              for (var p = 0; p < d._howls.length; p++)
                d._howls[p]._emit("resume");
            }), d._suspendTimer && (clearTimeout(d._suspendTimer), d._suspendTimer = null)) : d.state === "suspending" && (d._resumeAfterSuspend = !0), d;
        }
      };
      var n = new e(), r = function(d) {
        var p = this;
        if (!d.src || d.src.length === 0) {
          console.error("An array of source files must be passed with any new Howl.");
          return;
        }
        p.init(d);
      };
      r.prototype = {
        /**
         * Initialize a new Howl group object.
         * @param  {Object} o Passed in properties for this group.
         * @return {Howl}
         */
        init: function(d) {
          var p = this;
          return n.ctx || g(), p._autoplay = d.autoplay || !1, p._format = typeof d.format != "string" ? d.format : [d.format], p._html5 = d.html5 || !1, p._muted = d.mute || !1, p._loop = d.loop || !1, p._pool = d.pool || 5, p._preload = typeof d.preload == "boolean" || d.preload === "metadata" ? d.preload : !0, p._rate = d.rate || 1, p._sprite = d.sprite || {}, p._src = typeof d.src != "string" ? d.src : [d.src], p._volume = d.volume !== void 0 ? d.volume : 1, p._xhr = {
            method: d.xhr && d.xhr.method ? d.xhr.method : "GET",
            headers: d.xhr && d.xhr.headers ? d.xhr.headers : null,
            withCredentials: d.xhr && d.xhr.withCredentials ? d.xhr.withCredentials : !1
          }, p._duration = 0, p._state = "unloaded", p._sounds = [], p._endTimers = {}, p._queue = [], p._playLock = !1, p._onend = d.onend ? [{ fn: d.onend }] : [], p._onfade = d.onfade ? [{ fn: d.onfade }] : [], p._onload = d.onload ? [{ fn: d.onload }] : [], p._onloaderror = d.onloaderror ? [{ fn: d.onloaderror }] : [], p._onplayerror = d.onplayerror ? [{ fn: d.onplayerror }] : [], p._onpause = d.onpause ? [{ fn: d.onpause }] : [], p._onplay = d.onplay ? [{ fn: d.onplay }] : [], p._onstop = d.onstop ? [{ fn: d.onstop }] : [], p._onmute = d.onmute ? [{ fn: d.onmute }] : [], p._onvolume = d.onvolume ? [{ fn: d.onvolume }] : [], p._onrate = d.onrate ? [{ fn: d.onrate }] : [], p._onseek = d.onseek ? [{ fn: d.onseek }] : [], p._onunlock = d.onunlock ? [{ fn: d.onunlock }] : [], p._onresume = [], p._webAudio = n.usingWebAudio && !p._html5, typeof n.ctx < "u" && n.ctx && n.autoUnlock && n._unlockAudio(), n._howls.push(p), p._autoplay && p._queue.push({
            event: "play",
            action: function() {
              p.play();
            }
          }), p._preload && p._preload !== "none" && p.load(), p;
        },
        /**
         * Load the audio file.
         * @return {Howler}
         */
        load: function() {
          var d = this, p = null;
          if (n.noAudio) {
            d._emit("loaderror", null, "No audio support.");
            return;
          }
          typeof d._src == "string" && (d._src = [d._src]);
          for (var v = 0; v < d._src.length; v++) {
            var w, x;
            if (d._format && d._format[v])
              w = d._format[v];
            else {
              if (x = d._src[v], typeof x != "string") {
                d._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              w = /^data:audio\/([^;,]+);/i.exec(x), w || (w = /\.([^.]+)$/.exec(x.split("?", 1)[0])), w && (w = w[1].toLowerCase());
            }
            if (w || console.warn('No file extension was found. Consider using the "format" property or specify an extension.'), w && n.codecs(w)) {
              p = d._src[v];
              break;
            }
          }
          if (!p) {
            d._emit("loaderror", null, "No codec support for selected audio sources.");
            return;
          }
          return d._src = p, d._state = "loading", window.location.protocol === "https:" && p.slice(0, 5) === "http:" && (d._html5 = !0, d._webAudio = !1), new s(d), d._webAudio && l(d), d;
        },
        /**
         * Play a sound or resume previous playback.
         * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Number}          Sound ID.
         */
        play: function(d, p) {
          var v = this, w = null;
          if (typeof d == "number")
            w = d, d = null;
          else {
            if (typeof d == "string" && v._state === "loaded" && !v._sprite[d])
              return null;
            if (typeof d > "u" && (d = "__default", !v._playLock)) {
              for (var x = 0, T = 0; T < v._sounds.length; T++)
                v._sounds[T]._paused && !v._sounds[T]._ended && (x++, w = v._sounds[T]._id);
              x === 1 ? d = null : w = null;
            }
          }
          var A = w ? v._soundById(w) : v._inactiveSound();
          if (!A)
            return null;
          if (w && !d && (d = A._sprite || "__default"), v._state !== "loaded") {
            A._sprite = d, A._ended = !1;
            var b = A._id;
            return v._queue.push({
              event: "play",
              action: function() {
                v.play(b);
              }
            }), b;
          }
          if (w && !A._paused)
            return p || v._loadQueue("play"), A._id;
          v._webAudio && n._autoResume();
          var C = Math.max(0, A._seek > 0 ? A._seek : v._sprite[d][0] / 1e3), M = Math.max(0, (v._sprite[d][0] + v._sprite[d][1]) / 1e3 - C), P = M * 1e3 / Math.abs(A._rate), z = v._sprite[d][0] / 1e3, O = (v._sprite[d][0] + v._sprite[d][1]) / 1e3;
          A._sprite = d, A._ended = !1;
          var F = function() {
            A._paused = !1, A._seek = C, A._start = z, A._stop = O, A._loop = !!(A._loop || v._sprite[d][2]);
          };
          if (C >= O) {
            v._ended(A);
            return;
          }
          var L = A._node;
          if (v._webAudio) {
            var U = function() {
              v._playLock = !1, F(), v._refreshBuffer(A);
              var le = A._muted || v._muted ? 0 : A._volume;
              L.gain.setValueAtTime(le, n.ctx.currentTime), A._playStart = n.ctx.currentTime, typeof L.bufferSource.start > "u" ? A._loop ? L.bufferSource.noteGrainOn(0, C, 86400) : L.bufferSource.noteGrainOn(0, C, M) : A._loop ? L.bufferSource.start(0, C, 86400) : L.bufferSource.start(0, C, M), P !== 1 / 0 && (v._endTimers[A._id] = setTimeout(v._ended.bind(v, A), P)), p || setTimeout(function() {
                v._emit("play", A._id), v._loadQueue();
              }, 0);
            };
            n.state === "running" && n.ctx.state !== "interrupted" ? U() : (v._playLock = !0, v.once("resume", U), v._clearTimer(A._id));
          } else {
            var G = function() {
              L.currentTime = C, L.muted = A._muted || v._muted || n._muted || L.muted, L.volume = A._volume * n.volume(), L.playbackRate = A._rate;
              try {
                var le = L.play();
                if (le && typeof Promise < "u" && (le instanceof Promise || typeof le.then == "function") ? (v._playLock = !0, F(), le.then(function() {
                  v._playLock = !1, L._unlocked = !0, p ? v._loadQueue() : v._emit("play", A._id);
                }).catch(function() {
                  v._playLock = !1, v._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), A._ended = !0, A._paused = !0;
                })) : p || (v._playLock = !1, F(), v._emit("play", A._id)), L.playbackRate = A._rate, L.paused) {
                  v._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                d !== "__default" || A._loop ? v._endTimers[A._id] = setTimeout(v._ended.bind(v, A), P) : (v._endTimers[A._id] = function() {
                  v._ended(A), L.removeEventListener("ended", v._endTimers[A._id], !1);
                }, L.addEventListener("ended", v._endTimers[A._id], !1));
              } catch (me) {
                v._emit("playerror", A._id, me);
              }
            };
            L.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (L.src = v._src, L.load());
            var te = window && window.ejecta || !L.readyState && n._navigator.isCocoonJS;
            if (L.readyState >= 3 || te)
              G();
            else {
              v._playLock = !0, v._state = "loading";
              var ae = function() {
                v._state = "loaded", G(), L.removeEventListener(n._canPlayEvent, ae, !1);
              };
              L.addEventListener(n._canPlayEvent, ae, !1), v._clearTimer(A._id);
            }
          }
          return A._id;
        },
        /**
         * Pause playback and save current position.
         * @param  {Number} id The sound ID (empty to pause all in group).
         * @return {Howl}
         */
        pause: function(d) {
          var p = this;
          if (p._state !== "loaded" || p._playLock)
            return p._queue.push({
              event: "pause",
              action: function() {
                p.pause(d);
              }
            }), p;
          for (var v = p._getSoundIds(d), w = 0; w < v.length; w++) {
            p._clearTimer(v[w]);
            var x = p._soundById(v[w]);
            if (x && !x._paused && (x._seek = p.seek(v[w]), x._rateSeek = 0, x._paused = !0, p._stopFade(v[w]), x._node))
              if (p._webAudio) {
                if (!x._node.bufferSource)
                  continue;
                typeof x._node.bufferSource.stop > "u" ? x._node.bufferSource.noteOff(0) : x._node.bufferSource.stop(0), p._cleanBuffer(x._node);
              } else (!isNaN(x._node.duration) || x._node.duration === 1 / 0) && x._node.pause();
            arguments[1] || p._emit("pause", x ? x._id : null);
          }
          return p;
        },
        /**
         * Stop playback and reset to start.
         * @param  {Number} id The sound ID (empty to stop all in group).
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Howl}
         */
        stop: function(d, p) {
          var v = this;
          if (v._state !== "loaded" || v._playLock)
            return v._queue.push({
              event: "stop",
              action: function() {
                v.stop(d);
              }
            }), v;
          for (var w = v._getSoundIds(d), x = 0; x < w.length; x++) {
            v._clearTimer(w[x]);
            var T = v._soundById(w[x]);
            T && (T._seek = T._start || 0, T._rateSeek = 0, T._paused = !0, T._ended = !0, v._stopFade(w[x]), T._node && (v._webAudio ? T._node.bufferSource && (typeof T._node.bufferSource.stop > "u" ? T._node.bufferSource.noteOff(0) : T._node.bufferSource.stop(0), v._cleanBuffer(T._node)) : (!isNaN(T._node.duration) || T._node.duration === 1 / 0) && (T._node.currentTime = T._start || 0, T._node.pause(), T._node.duration === 1 / 0 && v._clearSound(T._node))), p || v._emit("stop", T._id));
          }
          return v;
        },
        /**
         * Mute/unmute a single sound or all sounds in this Howl group.
         * @param  {Boolean} muted Set to true to mute and false to unmute.
         * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
         * @return {Howl}
         */
        mute: function(d, p) {
          var v = this;
          if (v._state !== "loaded" || v._playLock)
            return v._queue.push({
              event: "mute",
              action: function() {
                v.mute(d, p);
              }
            }), v;
          if (typeof p > "u")
            if (typeof d == "boolean")
              v._muted = d;
            else
              return v._muted;
          for (var w = v._getSoundIds(p), x = 0; x < w.length; x++) {
            var T = v._soundById(w[x]);
            T && (T._muted = d, T._interval && v._stopFade(T._id), v._webAudio && T._node ? T._node.gain.setValueAtTime(d ? 0 : T._volume, n.ctx.currentTime) : T._node && (T._node.muted = n._muted ? !0 : d), v._emit("mute", T._id));
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
          var d = this, p = arguments, v, w;
          if (p.length === 0)
            return d._volume;
          if (p.length === 1 || p.length === 2 && typeof p[1] > "u") {
            var x = d._getSoundIds(), T = x.indexOf(p[0]);
            T >= 0 ? w = parseInt(p[0], 10) : v = parseFloat(p[0]);
          } else p.length >= 2 && (v = parseFloat(p[0]), w = parseInt(p[1], 10));
          var A;
          if (typeof v < "u" && v >= 0 && v <= 1) {
            if (d._state !== "loaded" || d._playLock)
              return d._queue.push({
                event: "volume",
                action: function() {
                  d.volume.apply(d, p);
                }
              }), d;
            typeof w > "u" && (d._volume = v), w = d._getSoundIds(w);
            for (var b = 0; b < w.length; b++)
              A = d._soundById(w[b]), A && (A._volume = v, p[2] || d._stopFade(w[b]), d._webAudio && A._node && !A._muted ? A._node.gain.setValueAtTime(v, n.ctx.currentTime) : A._node && !A._muted && (A._node.volume = v * n.volume()), d._emit("volume", A._id));
          } else
            return A = w ? d._soundById(w) : d._sounds[0], A ? A._volume : 0;
          return d;
        },
        /**
         * Fade a currently playing sound between two volumes (if no id is passed, all sounds will fade).
         * @param  {Number} from The value to fade from (0.0 to 1.0).
         * @param  {Number} to   The volume to fade to (0.0 to 1.0).
         * @param  {Number} len  Time in milliseconds to fade.
         * @param  {Number} id   The sound id (omit to fade all sounds).
         * @return {Howl}
         */
        fade: function(d, p, v, w) {
          var x = this;
          if (x._state !== "loaded" || x._playLock)
            return x._queue.push({
              event: "fade",
              action: function() {
                x.fade(d, p, v, w);
              }
            }), x;
          d = Math.min(Math.max(0, parseFloat(d)), 1), p = Math.min(Math.max(0, parseFloat(p)), 1), v = parseFloat(v), x.volume(d, w);
          for (var T = x._getSoundIds(w), A = 0; A < T.length; A++) {
            var b = x._soundById(T[A]);
            if (b) {
              if (w || x._stopFade(T[A]), x._webAudio && !b._muted) {
                var C = n.ctx.currentTime, M = C + v / 1e3;
                b._volume = d, b._node.gain.setValueAtTime(d, C), b._node.gain.linearRampToValueAtTime(p, M);
              }
              x._startFadeInterval(b, d, p, v, T[A], typeof w > "u");
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
        _startFadeInterval: function(d, p, v, w, x, T) {
          var A = this, b = p, C = v - p, M = Math.abs(C / 0.01), P = Math.max(4, M > 0 ? w / M : w), z = Date.now();
          d._fadeTo = v, d._interval = setInterval(function() {
            var O = (Date.now() - z) / w;
            z = Date.now(), b += C * O, b = Math.round(b * 100) / 100, C < 0 ? b = Math.max(v, b) : b = Math.min(v, b), A._webAudio ? d._volume = b : A.volume(b, d._id, !0), T && (A._volume = b), (v < p && b <= v || v > p && b >= v) && (clearInterval(d._interval), d._interval = null, d._fadeTo = null, A.volume(v, d._id), A._emit("fade", d._id));
          }, P);
        },
        /**
         * Internal method that stops the currently playing fade when
         * a new fade starts, volume is changed or the sound is stopped.
         * @param  {Number} id The sound id.
         * @return {Howl}
         */
        _stopFade: function(d) {
          var p = this, v = p._soundById(d);
          return v && v._interval && (p._webAudio && v._node.gain.cancelScheduledValues(n.ctx.currentTime), clearInterval(v._interval), v._interval = null, p.volume(v._fadeTo, d), v._fadeTo = null, p._emit("fade", d)), p;
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
          var d = this, p = arguments, v, w, x;
          if (p.length === 0)
            return d._loop;
          if (p.length === 1)
            if (typeof p[0] == "boolean")
              v = p[0], d._loop = v;
            else
              return x = d._soundById(parseInt(p[0], 10)), x ? x._loop : !1;
          else p.length === 2 && (v = p[0], w = parseInt(p[1], 10));
          for (var T = d._getSoundIds(w), A = 0; A < T.length; A++)
            x = d._soundById(T[A]), x && (x._loop = v, d._webAudio && x._node && x._node.bufferSource && (x._node.bufferSource.loop = v, v && (x._node.bufferSource.loopStart = x._start || 0, x._node.bufferSource.loopEnd = x._stop, d.playing(T[A]) && (d.pause(T[A], !0), d.play(T[A], !0)))));
          return d;
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
          var d = this, p = arguments, v, w;
          if (p.length === 0)
            w = d._sounds[0]._id;
          else if (p.length === 1) {
            var x = d._getSoundIds(), T = x.indexOf(p[0]);
            T >= 0 ? w = parseInt(p[0], 10) : v = parseFloat(p[0]);
          } else p.length === 2 && (v = parseFloat(p[0]), w = parseInt(p[1], 10));
          var A;
          if (typeof v == "number") {
            if (d._state !== "loaded" || d._playLock)
              return d._queue.push({
                event: "rate",
                action: function() {
                  d.rate.apply(d, p);
                }
              }), d;
            typeof w > "u" && (d._rate = v), w = d._getSoundIds(w);
            for (var b = 0; b < w.length; b++)
              if (A = d._soundById(w[b]), A) {
                d.playing(w[b]) && (A._rateSeek = d.seek(w[b]), A._playStart = d._webAudio ? n.ctx.currentTime : A._playStart), A._rate = v, d._webAudio && A._node && A._node.bufferSource ? A._node.bufferSource.playbackRate.setValueAtTime(v, n.ctx.currentTime) : A._node && (A._node.playbackRate = v);
                var C = d.seek(w[b]), M = (d._sprite[A._sprite][0] + d._sprite[A._sprite][1]) / 1e3 - C, P = M * 1e3 / Math.abs(A._rate);
                (d._endTimers[w[b]] || !A._paused) && (d._clearTimer(w[b]), d._endTimers[w[b]] = setTimeout(d._ended.bind(d, A), P)), d._emit("rate", A._id);
              }
          } else
            return A = d._soundById(w), A ? A._rate : d._rate;
          return d;
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
          var d = this, p = arguments, v, w;
          if (p.length === 0)
            d._sounds.length && (w = d._sounds[0]._id);
          else if (p.length === 1) {
            var x = d._getSoundIds(), T = x.indexOf(p[0]);
            T >= 0 ? w = parseInt(p[0], 10) : d._sounds.length && (w = d._sounds[0]._id, v = parseFloat(p[0]));
          } else p.length === 2 && (v = parseFloat(p[0]), w = parseInt(p[1], 10));
          if (typeof w > "u")
            return 0;
          if (typeof v == "number" && (d._state !== "loaded" || d._playLock))
            return d._queue.push({
              event: "seek",
              action: function() {
                d.seek.apply(d, p);
              }
            }), d;
          var A = d._soundById(w);
          if (A)
            if (typeof v == "number" && v >= 0) {
              var b = d.playing(w);
              b && d.pause(w, !0), A._seek = v, A._ended = !1, d._clearTimer(w), !d._webAudio && A._node && !isNaN(A._node.duration) && (A._node.currentTime = v);
              var C = function() {
                b && d.play(w, !0), d._emit("seek", w);
              };
              if (b && !d._webAudio) {
                var M = function() {
                  d._playLock ? setTimeout(M, 0) : C();
                };
                setTimeout(M, 0);
              } else
                C();
            } else if (d._webAudio) {
              var P = d.playing(w) ? n.ctx.currentTime - A._playStart : 0, z = A._rateSeek ? A._rateSeek - A._seek : 0;
              return A._seek + (z + P * Math.abs(A._rate));
            } else
              return A._node.currentTime;
          return d;
        },
        /**
         * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
         * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
         * @return {Boolean} True if playing and false if not.
         */
        playing: function(d) {
          var p = this;
          if (typeof d == "number") {
            var v = p._soundById(d);
            return v ? !v._paused : !1;
          }
          for (var w = 0; w < p._sounds.length; w++)
            if (!p._sounds[w]._paused)
              return !0;
          return !1;
        },
        /**
         * Get the duration of this sound. Passing a sound id will return the sprite duration.
         * @param  {Number} id The sound id to check. If none is passed, return full source duration.
         * @return {Number} Audio duration in seconds.
         */
        duration: function(d) {
          var p = this, v = p._duration, w = p._soundById(d);
          return w && (v = p._sprite[w._sprite][1] / 1e3), v;
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
          for (var d = this, p = d._sounds, v = 0; v < p.length; v++)
            p[v]._paused || d.stop(p[v]._id), d._webAudio || (d._clearSound(p[v]._node), p[v]._node.removeEventListener("error", p[v]._errorFn, !1), p[v]._node.removeEventListener(n._canPlayEvent, p[v]._loadFn, !1), p[v]._node.removeEventListener("ended", p[v]._endFn, !1), n._releaseHtml5Audio(p[v]._node)), delete p[v]._node, d._clearTimer(p[v]._id);
          var w = n._howls.indexOf(d);
          w >= 0 && n._howls.splice(w, 1);
          var x = !0;
          for (v = 0; v < n._howls.length; v++)
            if (n._howls[v]._src === d._src || d._src.indexOf(n._howls[v]._src) >= 0) {
              x = !1;
              break;
            }
          return a && x && delete a[d._src], n.noAudio = !1, d._state = "unloaded", d._sounds = [], d = null, null;
        },
        /**
         * Listen to a custom event.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
         * @return {Howl}
         */
        on: function(d, p, v, w) {
          var x = this, T = x["_on" + d];
          return typeof p == "function" && T.push(w ? { id: v, fn: p, once: w } : { id: v, fn: p }), x;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(d, p, v) {
          var w = this, x = w["_on" + d], T = 0;
          if (typeof p == "number" && (v = p, p = null), p || v)
            for (T = 0; T < x.length; T++) {
              var A = v === x[T].id;
              if (p === x[T].fn && A || !p && A) {
                x.splice(T, 1);
                break;
              }
            }
          else if (d)
            w["_on" + d] = [];
          else {
            var b = Object.keys(w);
            for (T = 0; T < b.length; T++)
              b[T].indexOf("_on") === 0 && Array.isArray(w[b[T]]) && (w[b[T]] = []);
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
        once: function(d, p, v) {
          var w = this;
          return w.on(d, p, v, 1), w;
        },
        /**
         * Emit all events of a specific type and pass the sound id.
         * @param  {String} event Event name.
         * @param  {Number} id    Sound ID.
         * @param  {Number} msg   Message to go with event.
         * @return {Howl}
         */
        _emit: function(d, p, v) {
          for (var w = this, x = w["_on" + d], T = x.length - 1; T >= 0; T--)
            (!x[T].id || x[T].id === p || d === "load") && (setTimeout((function(A) {
              A.call(this, p, v);
            }).bind(w, x[T].fn), 0), x[T].once && w.off(d, x[T].fn, x[T].id));
          return w._loadQueue(d), w;
        },
        /**
         * Queue of actions initiated before the sound has loaded.
         * These will be called in sequence, with the next only firing
         * after the previous has finished executing (even if async like play).
         * @return {Howl}
         */
        _loadQueue: function(d) {
          var p = this;
          if (p._queue.length > 0) {
            var v = p._queue[0];
            v.event === d && (p._queue.shift(), p._loadQueue()), d || v.action();
          }
          return p;
        },
        /**
         * Fired when playback ends at the end of the duration.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _ended: function(d) {
          var p = this, v = d._sprite;
          if (!p._webAudio && d._node && !d._node.paused && !d._node.ended && d._node.currentTime < d._stop)
            return setTimeout(p._ended.bind(p, d), 100), p;
          var w = !!(d._loop || p._sprite[v][2]);
          if (p._emit("end", d._id), !p._webAudio && w && p.stop(d._id, !0).play(d._id), p._webAudio && w) {
            p._emit("play", d._id), d._seek = d._start || 0, d._rateSeek = 0, d._playStart = n.ctx.currentTime;
            var x = (d._stop - d._start) * 1e3 / Math.abs(d._rate);
            p._endTimers[d._id] = setTimeout(p._ended.bind(p, d), x);
          }
          return p._webAudio && !w && (d._paused = !0, d._ended = !0, d._seek = d._start || 0, d._rateSeek = 0, p._clearTimer(d._id), p._cleanBuffer(d._node), n._autoSuspend()), !p._webAudio && !w && p.stop(d._id, !0), p;
        },
        /**
         * Clear the end timer for a sound playback.
         * @param  {Number} id The sound ID.
         * @return {Howl}
         */
        _clearTimer: function(d) {
          var p = this;
          if (p._endTimers[d]) {
            if (typeof p._endTimers[d] != "function")
              clearTimeout(p._endTimers[d]);
            else {
              var v = p._soundById(d);
              v && v._node && v._node.removeEventListener("ended", p._endTimers[d], !1);
            }
            delete p._endTimers[d];
          }
          return p;
        },
        /**
         * Return the sound identified by this ID, or return null.
         * @param  {Number} id Sound ID
         * @return {Object}    Sound object or null.
         */
        _soundById: function(d) {
          for (var p = this, v = 0; v < p._sounds.length; v++)
            if (d === p._sounds[v]._id)
              return p._sounds[v];
          return null;
        },
        /**
         * Return an inactive sound from the pool or create a new one.
         * @return {Sound} Sound playback object.
         */
        _inactiveSound: function() {
          var d = this;
          d._drain();
          for (var p = 0; p < d._sounds.length; p++)
            if (d._sounds[p]._ended)
              return d._sounds[p].reset();
          return new s(d);
        },
        /**
         * Drain excess inactive sounds from the pool.
         */
        _drain: function() {
          var d = this, p = d._pool, v = 0, w = 0;
          if (!(d._sounds.length < p)) {
            for (w = 0; w < d._sounds.length; w++)
              d._sounds[w]._ended && v++;
            for (w = d._sounds.length - 1; w >= 0; w--) {
              if (v <= p)
                return;
              d._sounds[w]._ended && (d._webAudio && d._sounds[w]._node && d._sounds[w]._node.disconnect(0), d._sounds.splice(w, 1), v--);
            }
          }
        },
        /**
         * Get all ID's from the sounds pool.
         * @param  {Number} id Only return one ID if one is passed.
         * @return {Array}    Array of IDs.
         */
        _getSoundIds: function(d) {
          var p = this;
          if (typeof d > "u") {
            for (var v = [], w = 0; w < p._sounds.length; w++)
              v.push(p._sounds[w]._id);
            return v;
          } else
            return [d];
        },
        /**
         * Load the sound back into the buffer source.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _refreshBuffer: function(d) {
          var p = this;
          return d._node.bufferSource = n.ctx.createBufferSource(), d._node.bufferSource.buffer = a[p._src], d._panner ? d._node.bufferSource.connect(d._panner) : d._node.bufferSource.connect(d._node), d._node.bufferSource.loop = d._loop, d._loop && (d._node.bufferSource.loopStart = d._start || 0, d._node.bufferSource.loopEnd = d._stop || 0), d._node.bufferSource.playbackRate.setValueAtTime(d._rate, n.ctx.currentTime), p;
        },
        /**
         * Prevent memory leaks by cleaning up the buffer source after playback.
         * @param  {Object} node Sound's audio node containing the buffer source.
         * @return {Howl}
         */
        _cleanBuffer: function(d) {
          var p = this, v = n._navigator && n._navigator.vendor.indexOf("Apple") >= 0;
          if (!d.bufferSource)
            return p;
          if (n._scratchBuffer && d.bufferSource && (d.bufferSource.onended = null, d.bufferSource.disconnect(0), v))
            try {
              d.bufferSource.buffer = n._scratchBuffer;
            } catch {
            }
          return d.bufferSource = null, p;
        },
        /**
         * Set the source to a 0-second silence to stop any downloading (except in IE).
         * @param  {Object} node Audio node to clear.
         */
        _clearSound: function(d) {
          var p = /MSIE |Trident\//.test(n._navigator && n._navigator.userAgent);
          p || (d.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        }
      };
      var s = function(d) {
        this._parent = d, this.init();
      };
      s.prototype = {
        /**
         * Initialize a new Sound object.
         * @return {Sound}
         */
        init: function() {
          var d = this, p = d._parent;
          return d._muted = p._muted, d._loop = p._loop, d._volume = p._volume, d._rate = p._rate, d._seek = 0, d._paused = !0, d._ended = !0, d._sprite = "__default", d._id = ++n._counter, p._sounds.push(d), d.create(), d;
        },
        /**
         * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
         * @return {Sound}
         */
        create: function() {
          var d = this, p = d._parent, v = n._muted || d._muted || d._parent._muted ? 0 : d._volume;
          return p._webAudio ? (d._node = typeof n.ctx.createGain > "u" ? n.ctx.createGainNode() : n.ctx.createGain(), d._node.gain.setValueAtTime(v, n.ctx.currentTime), d._node.paused = !0, d._node.connect(n.masterGain)) : n.noAudio || (d._node = n._obtainHtml5Audio(), d._errorFn = d._errorListener.bind(d), d._node.addEventListener("error", d._errorFn, !1), d._loadFn = d._loadListener.bind(d), d._node.addEventListener(n._canPlayEvent, d._loadFn, !1), d._endFn = d._endListener.bind(d), d._node.addEventListener("ended", d._endFn, !1), d._node.src = p._src, d._node.preload = p._preload === !0 ? "auto" : p._preload, d._node.volume = v * n.volume(), d._node.load()), d;
        },
        /**
         * Reset the parameters of this sound to the original state (for recycle).
         * @return {Sound}
         */
        reset: function() {
          var d = this, p = d._parent;
          return d._muted = p._muted, d._loop = p._loop, d._volume = p._volume, d._rate = p._rate, d._seek = 0, d._rateSeek = 0, d._paused = !0, d._ended = !0, d._sprite = "__default", d._id = ++n._counter, d;
        },
        /**
         * HTML5 Audio error listener callback.
         */
        _errorListener: function() {
          var d = this;
          d._parent._emit("loaderror", d._id, d._node.error ? d._node.error.code : 0), d._node.removeEventListener("error", d._errorFn, !1);
        },
        /**
         * HTML5 Audio canplaythrough listener callback.
         */
        _loadListener: function() {
          var d = this, p = d._parent;
          p._duration = Math.ceil(d._node.duration * 10) / 10, Object.keys(p._sprite).length === 0 && (p._sprite = { __default: [0, p._duration * 1e3] }), p._state !== "loaded" && (p._state = "loaded", p._emit("load"), p._loadQueue()), d._node.removeEventListener(n._canPlayEvent, d._loadFn, !1);
        },
        /**
         * HTML5 Audio ended listener callback.
         */
        _endListener: function() {
          var d = this, p = d._parent;
          p._duration === 1 / 0 && (p._duration = Math.ceil(d._node.duration * 10) / 10, p._sprite.__default[1] === 1 / 0 && (p._sprite.__default[1] = p._duration * 1e3), p._ended(d)), d._node.removeEventListener("ended", d._endFn, !1);
        }
      };
      var a = {}, l = function(d) {
        var p = d._src;
        if (a[p]) {
          d._duration = a[p].duration, m(d);
          return;
        }
        if (/^data:[^;]+;base64,/.test(p)) {
          for (var v = atob(p.split(",")[1]), w = new Uint8Array(v.length), x = 0; x < v.length; ++x)
            w[x] = v.charCodeAt(x);
          f(w.buffer, d);
        } else {
          var T = new XMLHttpRequest();
          T.open(d._xhr.method, p, !0), T.withCredentials = d._xhr.withCredentials, T.responseType = "arraybuffer", d._xhr.headers && Object.keys(d._xhr.headers).forEach(function(A) {
            T.setRequestHeader(A, d._xhr.headers[A]);
          }), T.onload = function() {
            var A = (T.status + "")[0];
            if (A !== "0" && A !== "2" && A !== "3") {
              d._emit("loaderror", null, "Failed loading audio file with status: " + T.status + ".");
              return;
            }
            f(T.response, d);
          }, T.onerror = function() {
            d._webAudio && (d._html5 = !0, d._webAudio = !1, d._sounds = [], delete a[p], d.load());
          }, c(T);
        }
      }, c = function(d) {
        try {
          d.send();
        } catch {
          d.onerror();
        }
      }, f = function(d, p) {
        var v = function() {
          p._emit("loaderror", null, "Decoding audio data failed.");
        }, w = function(x) {
          x && p._sounds.length > 0 ? (a[p._src] = x, m(p, x)) : v();
        };
        typeof Promise < "u" && n.ctx.decodeAudioData.length === 1 ? n.ctx.decodeAudioData(d).then(w).catch(v) : n.ctx.decodeAudioData(d, w, v);
      }, m = function(d, p) {
        p && !d._duration && (d._duration = p.duration), Object.keys(d._sprite).length === 0 && (d._sprite = { __default: [0, d._duration * 1e3] }), d._state !== "loaded" && (d._state = "loaded", d._emit("load"), d._loadQueue());
      }, g = function() {
        if (n.usingWebAudio) {
          try {
            typeof AudioContext < "u" ? n.ctx = new AudioContext() : typeof webkitAudioContext < "u" ? n.ctx = new webkitAudioContext() : n.usingWebAudio = !1;
          } catch {
            n.usingWebAudio = !1;
          }
          n.ctx || (n.usingWebAudio = !1);
          var d = /iP(hone|od|ad)/.test(n._navigator && n._navigator.platform), p = n._navigator && n._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), v = p ? parseInt(p[1], 10) : null;
          if (d && v && v < 9) {
            var w = /safari/.test(n._navigator && n._navigator.userAgent.toLowerCase());
            n._navigator && !w && (n.usingWebAudio = !1);
          }
          n.usingWebAudio && (n.masterGain = typeof n.ctx.createGain > "u" ? n.ctx.createGainNode() : n.ctx.createGain(), n.masterGain.gain.setValueAtTime(n._muted ? 0 : n._volume, n.ctx.currentTime), n.masterGain.connect(n.ctx.destination)), n._setup();
        }
      };
      t.Howler = n, t.Howl = r, typeof co < "u" ? (co.HowlerGlobal = e, co.Howler = n, co.Howl = r, co.Sound = s) : typeof window < "u" && (window.HowlerGlobal = e, window.Howler = n, window.Howl = r, window.Sound = s);
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
      HowlerGlobal.prototype._pos = [0, 0, 0], HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0], HowlerGlobal.prototype.stereo = function(n) {
        var r = this;
        if (!r.ctx || !r.ctx.listener)
          return r;
        for (var s = r._howls.length - 1; s >= 0; s--)
          r._howls[s].stereo(n);
        return r;
      }, HowlerGlobal.prototype.pos = function(n, r, s) {
        var a = this;
        if (!a.ctx || !a.ctx.listener)
          return a;
        if (r = typeof r != "number" ? a._pos[1] : r, s = typeof s != "number" ? a._pos[2] : s, typeof n == "number")
          a._pos = [n, r, s], typeof a.ctx.listener.positionX < "u" ? (a.ctx.listener.positionX.setTargetAtTime(a._pos[0], Howler.ctx.currentTime, 0.1), a.ctx.listener.positionY.setTargetAtTime(a._pos[1], Howler.ctx.currentTime, 0.1), a.ctx.listener.positionZ.setTargetAtTime(a._pos[2], Howler.ctx.currentTime, 0.1)) : a.ctx.listener.setPosition(a._pos[0], a._pos[1], a._pos[2]);
        else
          return a._pos;
        return a;
      }, HowlerGlobal.prototype.orientation = function(n, r, s, a, l, c) {
        var f = this;
        if (!f.ctx || !f.ctx.listener)
          return f;
        var m = f._orientation;
        if (r = typeof r != "number" ? m[1] : r, s = typeof s != "number" ? m[2] : s, a = typeof a != "number" ? m[3] : a, l = typeof l != "number" ? m[4] : l, c = typeof c != "number" ? m[5] : c, typeof n == "number")
          f._orientation = [n, r, s, a, l, c], typeof f.ctx.listener.forwardX < "u" ? (f.ctx.listener.forwardX.setTargetAtTime(n, Howler.ctx.currentTime, 0.1), f.ctx.listener.forwardY.setTargetAtTime(r, Howler.ctx.currentTime, 0.1), f.ctx.listener.forwardZ.setTargetAtTime(s, Howler.ctx.currentTime, 0.1), f.ctx.listener.upX.setTargetAtTime(a, Howler.ctx.currentTime, 0.1), f.ctx.listener.upY.setTargetAtTime(l, Howler.ctx.currentTime, 0.1), f.ctx.listener.upZ.setTargetAtTime(c, Howler.ctx.currentTime, 0.1)) : f.ctx.listener.setOrientation(n, r, s, a, l, c);
        else
          return m;
        return f;
      }, Howl.prototype.init = /* @__PURE__ */ (function(n) {
        return function(r) {
          var s = this;
          return s._orientation = r.orientation || [1, 0, 0], s._stereo = r.stereo || null, s._pos = r.pos || null, s._pannerAttr = {
            coneInnerAngle: typeof r.coneInnerAngle < "u" ? r.coneInnerAngle : 360,
            coneOuterAngle: typeof r.coneOuterAngle < "u" ? r.coneOuterAngle : 360,
            coneOuterGain: typeof r.coneOuterGain < "u" ? r.coneOuterGain : 0,
            distanceModel: typeof r.distanceModel < "u" ? r.distanceModel : "inverse",
            maxDistance: typeof r.maxDistance < "u" ? r.maxDistance : 1e4,
            panningModel: typeof r.panningModel < "u" ? r.panningModel : "HRTF",
            refDistance: typeof r.refDistance < "u" ? r.refDistance : 1,
            rolloffFactor: typeof r.rolloffFactor < "u" ? r.rolloffFactor : 1
          }, s._onstereo = r.onstereo ? [{ fn: r.onstereo }] : [], s._onpos = r.onpos ? [{ fn: r.onpos }] : [], s._onorientation = r.onorientation ? [{ fn: r.onorientation }] : [], n.call(this, r);
        };
      })(Howl.prototype.init), Howl.prototype.stereo = function(n, r) {
        var s = this;
        if (!s._webAudio)
          return s;
        if (s._state !== "loaded")
          return s._queue.push({
            event: "stereo",
            action: function() {
              s.stereo(n, r);
            }
          }), s;
        var a = typeof Howler.ctx.createStereoPanner > "u" ? "spatial" : "stereo";
        if (typeof r > "u")
          if (typeof n == "number")
            s._stereo = n, s._pos = [n, 0, 0];
          else
            return s._stereo;
        for (var l = s._getSoundIds(r), c = 0; c < l.length; c++) {
          var f = s._soundById(l[c]);
          if (f)
            if (typeof n == "number")
              f._stereo = n, f._pos = [n, 0, 0], f._node && (f._pannerAttr.panningModel = "equalpower", (!f._panner || !f._panner.pan) && e(f, a), a === "spatial" ? typeof f._panner.positionX < "u" ? (f._panner.positionX.setValueAtTime(n, Howler.ctx.currentTime), f._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime), f._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime)) : f._panner.setPosition(n, 0, 0) : f._panner.pan.setValueAtTime(n, Howler.ctx.currentTime)), s._emit("stereo", f._id);
            else
              return f._stereo;
        }
        return s;
      }, Howl.prototype.pos = function(n, r, s, a) {
        var l = this;
        if (!l._webAudio)
          return l;
        if (l._state !== "loaded")
          return l._queue.push({
            event: "pos",
            action: function() {
              l.pos(n, r, s, a);
            }
          }), l;
        if (r = typeof r != "number" ? 0 : r, s = typeof s != "number" ? -0.5 : s, typeof a > "u")
          if (typeof n == "number")
            l._pos = [n, r, s];
          else
            return l._pos;
        for (var c = l._getSoundIds(a), f = 0; f < c.length; f++) {
          var m = l._soundById(c[f]);
          if (m)
            if (typeof n == "number")
              m._pos = [n, r, s], m._node && ((!m._panner || m._panner.pan) && e(m, "spatial"), typeof m._panner.positionX < "u" ? (m._panner.positionX.setValueAtTime(n, Howler.ctx.currentTime), m._panner.positionY.setValueAtTime(r, Howler.ctx.currentTime), m._panner.positionZ.setValueAtTime(s, Howler.ctx.currentTime)) : m._panner.setPosition(n, r, s)), l._emit("pos", m._id);
            else
              return m._pos;
        }
        return l;
      }, Howl.prototype.orientation = function(n, r, s, a) {
        var l = this;
        if (!l._webAudio)
          return l;
        if (l._state !== "loaded")
          return l._queue.push({
            event: "orientation",
            action: function() {
              l.orientation(n, r, s, a);
            }
          }), l;
        if (r = typeof r != "number" ? l._orientation[1] : r, s = typeof s != "number" ? l._orientation[2] : s, typeof a > "u")
          if (typeof n == "number")
            l._orientation = [n, r, s];
          else
            return l._orientation;
        for (var c = l._getSoundIds(a), f = 0; f < c.length; f++) {
          var m = l._soundById(c[f]);
          if (m)
            if (typeof n == "number")
              m._orientation = [n, r, s], m._node && (m._panner || (m._pos || (m._pos = l._pos || [0, 0, -0.5]), e(m, "spatial")), typeof m._panner.orientationX < "u" ? (m._panner.orientationX.setValueAtTime(n, Howler.ctx.currentTime), m._panner.orientationY.setValueAtTime(r, Howler.ctx.currentTime), m._panner.orientationZ.setValueAtTime(s, Howler.ctx.currentTime)) : m._panner.setOrientation(n, r, s)), l._emit("orientation", m._id);
            else
              return m._orientation;
        }
        return l;
      }, Howl.prototype.pannerAttr = function() {
        var n = this, r = arguments, s, a, l;
        if (!n._webAudio)
          return n;
        if (r.length === 0)
          return n._pannerAttr;
        if (r.length === 1)
          if (typeof r[0] == "object")
            s = r[0], typeof a > "u" && (s.pannerAttr || (s.pannerAttr = {
              coneInnerAngle: s.coneInnerAngle,
              coneOuterAngle: s.coneOuterAngle,
              coneOuterGain: s.coneOuterGain,
              distanceModel: s.distanceModel,
              maxDistance: s.maxDistance,
              refDistance: s.refDistance,
              rolloffFactor: s.rolloffFactor,
              panningModel: s.panningModel
            }), n._pannerAttr = {
              coneInnerAngle: typeof s.pannerAttr.coneInnerAngle < "u" ? s.pannerAttr.coneInnerAngle : n._coneInnerAngle,
              coneOuterAngle: typeof s.pannerAttr.coneOuterAngle < "u" ? s.pannerAttr.coneOuterAngle : n._coneOuterAngle,
              coneOuterGain: typeof s.pannerAttr.coneOuterGain < "u" ? s.pannerAttr.coneOuterGain : n._coneOuterGain,
              distanceModel: typeof s.pannerAttr.distanceModel < "u" ? s.pannerAttr.distanceModel : n._distanceModel,
              maxDistance: typeof s.pannerAttr.maxDistance < "u" ? s.pannerAttr.maxDistance : n._maxDistance,
              refDistance: typeof s.pannerAttr.refDistance < "u" ? s.pannerAttr.refDistance : n._refDistance,
              rolloffFactor: typeof s.pannerAttr.rolloffFactor < "u" ? s.pannerAttr.rolloffFactor : n._rolloffFactor,
              panningModel: typeof s.pannerAttr.panningModel < "u" ? s.pannerAttr.panningModel : n._panningModel
            });
          else
            return l = n._soundById(parseInt(r[0], 10)), l ? l._pannerAttr : n._pannerAttr;
        else r.length === 2 && (s = r[0], a = parseInt(r[1], 10));
        for (var c = n._getSoundIds(a), f = 0; f < c.length; f++)
          if (l = n._soundById(c[f]), l) {
            var m = l._pannerAttr;
            m = {
              coneInnerAngle: typeof s.coneInnerAngle < "u" ? s.coneInnerAngle : m.coneInnerAngle,
              coneOuterAngle: typeof s.coneOuterAngle < "u" ? s.coneOuterAngle : m.coneOuterAngle,
              coneOuterGain: typeof s.coneOuterGain < "u" ? s.coneOuterGain : m.coneOuterGain,
              distanceModel: typeof s.distanceModel < "u" ? s.distanceModel : m.distanceModel,
              maxDistance: typeof s.maxDistance < "u" ? s.maxDistance : m.maxDistance,
              refDistance: typeof s.refDistance < "u" ? s.refDistance : m.refDistance,
              rolloffFactor: typeof s.rolloffFactor < "u" ? s.rolloffFactor : m.rolloffFactor,
              panningModel: typeof s.panningModel < "u" ? s.panningModel : m.panningModel
            };
            var g = l._panner;
            g || (l._pos || (l._pos = n._pos || [0, 0, -0.5]), e(l, "spatial"), g = l._panner), g.coneInnerAngle = m.coneInnerAngle, g.coneOuterAngle = m.coneOuterAngle, g.coneOuterGain = m.coneOuterGain, g.distanceModel = m.distanceModel, g.maxDistance = m.maxDistance, g.refDistance = m.refDistance, g.rolloffFactor = m.rolloffFactor, g.panningModel = m.panningModel;
          }
        return n;
      }, Sound.prototype.init = /* @__PURE__ */ (function(n) {
        return function() {
          var r = this, s = r._parent;
          r._orientation = s._orientation, r._stereo = s._stereo, r._pos = s._pos, r._pannerAttr = s._pannerAttr, n.call(this), r._stereo ? s.stereo(r._stereo) : r._pos && s.pos(r._pos[0], r._pos[1], r._pos[2], r._id);
        };
      })(Sound.prototype.init), Sound.prototype.reset = /* @__PURE__ */ (function(n) {
        return function() {
          var r = this, s = r._parent;
          return r._orientation = s._orientation, r._stereo = s._stereo, r._pos = s._pos, r._pannerAttr = s._pannerAttr, r._stereo ? s.stereo(r._stereo) : r._pos ? s.pos(r._pos[0], r._pos[1], r._pos[2], r._id) : r._panner && (r._panner.disconnect(0), r._panner = void 0, s._refreshBuffer(r)), n.call(this);
        };
      })(Sound.prototype.reset);
      var e = function(n, r) {
        r = r || "spatial", r === "spatial" ? (n._panner = Howler.ctx.createPanner(), n._panner.coneInnerAngle = n._pannerAttr.coneInnerAngle, n._panner.coneOuterAngle = n._pannerAttr.coneOuterAngle, n._panner.coneOuterGain = n._pannerAttr.coneOuterGain, n._panner.distanceModel = n._pannerAttr.distanceModel, n._panner.maxDistance = n._pannerAttr.maxDistance, n._panner.refDistance = n._pannerAttr.refDistance, n._panner.rolloffFactor = n._pannerAttr.rolloffFactor, n._panner.panningModel = n._pannerAttr.panningModel, typeof n._panner.positionX < "u" ? (n._panner.positionX.setValueAtTime(n._pos[0], Howler.ctx.currentTime), n._panner.positionY.setValueAtTime(n._pos[1], Howler.ctx.currentTime), n._panner.positionZ.setValueAtTime(n._pos[2], Howler.ctx.currentTime)) : n._panner.setPosition(n._pos[0], n._pos[1], n._pos[2]), typeof n._panner.orientationX < "u" ? (n._panner.orientationX.setValueAtTime(n._orientation[0], Howler.ctx.currentTime), n._panner.orientationY.setValueAtTime(n._orientation[1], Howler.ctx.currentTime), n._panner.orientationZ.setValueAtTime(n._orientation[2], Howler.ctx.currentTime)) : n._panner.setOrientation(n._orientation[0], n._orientation[1], n._orientation[2])) : (n._panner = Howler.ctx.createStereoPanner(), n._panner.pan.setValueAtTime(n._stereo, Howler.ctx.currentTime)), n._panner.connect(n._node), n._paused || n._parent.pause(n._id, !0).play(n._id, !0);
      };
    })();
  })(Ef)), Ef;
}
var UF = BF();
const HF = /* @__PURE__ */ U_(UF), { Howl: _T } = HF, Lh = 500, sn = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let Gi = {}, Io = !1, zh = "";
function Ko() {
  return typeof _T == "function";
}
function D_(t, e = 50) {
  const n = Number(t), r = Number.isFinite(n) ? n : e;
  return Math.min(1, Math.max(0, r / 100));
}
function ST(t) {
  return new _T({
    src: [t],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function xT(t, e, n = Lh) {
  if (t)
    try {
      const r = typeof t.volume == "function" ? t.volume() : 0;
      t.fade(r, e, n);
    } catch {
      try {
        t.volume(e);
      } catch {
      }
    }
}
function Zu(t, { unload: e = !1 } = {}) {
  var n;
  t && (xT(t, 0, Math.min(Lh, 300)), (n = globalThis.setTimeout) == null || n.call(globalThis, () => {
    try {
      t.pause(), e && t.unload();
    } catch {
    }
  }, Math.min(Lh, 320)));
}
function WF(t) {
  return !(t != null && t.streamUrl) || !Ko() ? null : ((!sn.music || sn.music.__synapseSrc !== t.streamUrl) && (Zu(sn.music, { unload: !0 }), sn.music = ST(t.streamUrl), sn.music.__synapseSrc = t.streamUrl), sn.music);
}
function ZF(t) {
  if (!(t != null && t.streamUrl) || !Ko()) return null;
  const e = t.id || t.streamUrl, n = sn.ambient.get(e);
  if (n && n.__synapseSrc === t.streamUrl) return n;
  Zu(n, { unload: !0 });
  const r = ST(t.streamUrl);
  return r.__synapseSrc = t.streamUrl, sn.ambient.set(e, r), r;
}
function GF() {
  return [
    sn.music,
    ...sn.ambient.values()
  ].filter(Boolean);
}
function wT() {
  GF().forEach((t) => Zu(t));
}
function KF(t) {
  for (const [e, n] of sn.ambient.entries())
    t.has(e) || (Zu(n, { unload: !0 }), sn.ambient.delete(e));
}
function j_(t, e) {
  if (t)
    try {
      t.playing() || t.play(), xT(t, e), zh = "";
    } catch (n) {
      zh = (n == null ? void 0 : n.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function YF(t = {}) {
  Gi = { ...Gi, ...t };
  const e = ju(Gi);
  if (!Ko()) return nu(e);
  if (!Io)
    return wT(), nu(e);
  const n = WF(e.musicTrack), r = D_(Gi.musicVolume, 60), s = D_(Gi.ambientVolume, 50), a = /* @__PURE__ */ new Set(), l = [];
  return e.ambientLayers.forEach((c) => {
    const f = c.id || c.streamUrl;
    a.add(f);
    const m = ZF(c), g = Math.min(1, Math.max(0, s * (c.volumeBias ?? 1)));
    l.push([m, g]);
  }), KF(a), j_(n, r), l.forEach(([c, f]) => j_(c, f)), nu(e);
}
function qF(t) {
  return Io = !!t, Io || wT(), Io;
}
function nu(t = ju(Gi)) {
  var e, n, r, s;
  return {
    available: Ko(),
    playing: Io && Ko(),
    musicTitle: ((e = t.musicTrack) == null ? void 0 : e.title) || "",
    musicArtist: ((n = t.musicTrack) == null ? void 0 : n.artist) || "",
    musicPageUrl: ((r = t.musicTrack) == null ? void 0 : r.pageUrl) || "",
    musicAttribution: ((s = t.musicTrack) == null ? void 0 : s.attribution) || "",
    ambientTitles: t.ambientLayers.map((a) => a.title).filter(Boolean),
    ambientPageUrls: t.ambientLayers.map((a) => a.pageUrl).filter(Boolean),
    ambientAttributions: t.ambientLayers.map((a) => a.attribution).filter(Boolean),
    error: zh
  };
}
const QF = "synapse.focusRoom.audioPrefs.v1";
function XF(t) {
  var e;
  try {
    (e = globalThis.localStorage) == null || e.setItem(QF, JSON.stringify({
      musicType: t.musicType,
      ambientSound: t.ambientSound,
      musicVolume: t.musicVolume,
      ambientVolume: t.ambientVolume,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
  } catch {
  }
}
function JF() {
  const t = H((c) => c.musicType), e = H((c) => c.ambientSound), n = H((c) => c.musicVolume), r = H((c) => c.ambientVolume), s = H((c) => c.audioPlaying), [a, l] = E.useState(() => nu(ju({
    musicType: t,
    ambientSound: e
  })));
  return E.useEffect(() => {
    const c = { musicType: t, ambientSound: e, musicVolume: n, ambientVolume: r };
    let f = !1;
    return qF(s), XF(c), YF(c).then((m) => {
      f || l(m);
    }), () => {
      f = !0;
    };
  }, [e, r, s, t, n]), a;
}
function eO() {
  const t = H(), e = E.useCallback(async (r = "", s = "", a = {}) => {
    var g;
    t.pauseTimer({ pauseAudio: !0 }), t.closeSummary();
    const l = typeof r == "string" || typeof r == "number" ? r : "", c = typeof s == "string" ? s : "", f = tO(c, a), m = String(l || t.selectedMaterialId || ((g = t.selectedMaterial) == null ? void 0 : g.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const d = globalThis.returnFromFocusRoomToWorkspace(m, f);
        d && typeof d.then == "function" && await d, F_(f.action || c, f);
        return;
      } catch (d) {
        console.error("Could not return from Focus Room:", d);
      }
    globalThis.location.hash = "", F_(f.action || c, f);
  }, [t]), n = E.useMemo(() => ({
    answerFocusQuizQuestion: t.answerQuizQuestion,
    askFocusAssistant: t.askAssistant,
    checkFocusQuizQuestion: t.checkQuizQuestion,
    closeFocusSummary: t.closeSummary,
    endFocusRoomSession: t.endSession,
    flipFocusFlashcard: t.flipFlashcard,
    pauseFocusRoomTimer: t.pauseTimer,
    rateFocusFlashcard: t.rateFlashcard,
    resetFocusRoomTimer: t.resetTimer,
    returnFromFocusRoom: e,
    selectFocusScene: t.selectScene,
    setFocusDuration: t.setPomodoroDuration,
    setFocusFlashcardIndex: t.setFlashcardIndex,
    setFocusPanelTab: t.setPanelTab,
    showFocusStudyHistory: () => {
      t.openStudyPanel("history");
    },
    skipFocusRoomTimer: t.skipTimer,
    startFocusRoomSession: t.startSession,
    startFocusRoomTimer: t.startTimer,
    toggleFocusRoomAudioPlayback: t.toggleAudio,
    toggleFocusLearningPanel: t.toggleAIPanel,
    toggleFocusTask: t.toggleTask,
    updateFocusPlanTask: t.updatePlanTask,
    updateFocusGoal: t.setStudyGoal,
    updateFocusSound: t.setSound
  }), [e, t]);
  return globalThis.__synapseFocusRoomApi = n, E.useEffect(() => {
    globalThis.__synapseFocusRoomApi = n;
  }, [n]), {
    ...t,
    returnToWorkspace: e
  };
}
function TT(t) {
  const e = String(t || "").trim().toLowerCase();
  return ["flashcards", "quiz", "assistant", "mindmap", "timeline", "source", "notes"].includes(e) ? e : "";
}
function tO(t, e = {}) {
  const n = e && typeof e == "object" && !Array.isArray(e) ? e : {}, r = TT(t || n.action);
  return {
    ...n,
    action: r,
    sourceId: String(n.sourceId || n.source_id || ""),
    sourceIndex: Number(n.sourceIndex || n.source_index || 0) || 0,
    sourceLabel: String(n.sourceLabel || n.source_label || ""),
    sectionTitle: String(n.sectionTitle || n.section_title || ""),
    highlightId: String(n.highlightId || n.highlight_id || ""),
    excerpt: String(n.excerpt || "").slice(0, 1600)
  };
}
function F_(t, e = {}) {
  const n = TT(t);
  if (!n) return;
  const r = () => {
    if (n === "source") {
      typeof globalThis.toggleSourceViewer == "function" && globalThis.toggleSourceViewer(!0), e.sourceId && typeof globalThis.selectSourceItem == "function" && globalThis.selectSourceItem(e.sourceId);
      return;
    }
    if (n === "notes") {
      typeof globalThis.showFullSummary == "function" && globalThis.showFullSummary();
      return;
    }
    if (n === "assistant") {
      typeof globalThis.openAssistant == "function" && globalThis.openAssistant();
      return;
    }
    typeof globalThis.switchTool == "function" && globalThis.switchTool(n);
  };
  typeof globalThis.requestAnimationFrame == "function" ? globalThis.requestAnimationFrame(r) : setTimeout(r, 0);
}
function nO(t = 3e3) {
  const e = H((r) => r.setIdle), n = H((r) => r.isIdle);
  return E.useEffect(() => {
    let r;
    const s = () => {
      e(!1), clearTimeout(r), r = setTimeout(() => e(!0), t);
    };
    return window.addEventListener("mousemove", s), window.addEventListener("keydown", s), window.addEventListener("click", s), s(), () => {
      clearTimeout(r), window.removeEventListener("mousemove", s), window.removeEventListener("keydown", s), window.removeEventListener("click", s);
    };
  }, [t, e]), n;
}
function rO() {
  const t = H((r) => r.timerStatus), e = H((r) => r.view), n = H((r) => r.tickTimer);
  E.useEffect(() => {
    if (e !== "session" || t !== "studying") return;
    const r = window.setInterval(n, 1e3);
    return () => window.clearInterval(r);
  }, [n, t, e]);
}
function iO() {
  const t = H((e) => e.selectedScene);
  return gs(t);
}
function sO() {
  return uT({
    queryKey: ["focus-room", "materials"],
    queryFn: () => uR(),
    initialData: () => Sp()
  });
}
function oO(t, e) {
  const n = Array.isArray(t) ? t : [], r = String(e || "");
  return r ? n.find((s) => s.materialId === r) || n[0] || null : n[0] || null;
}
function aO(t) {
  var l;
  const e = xj(), n = H((c) => c.hydrateFocusRoute), r = H((c) => c.showStudyHistory), s = H((c) => c.setMaterialsState), a = sO();
  return E.useEffect(() => {
    const c = () => {
      e.invalidateQueries({ queryKey: ["focus-room", "materials"] }), e.invalidateQueries({ queryKey: ["focus-room", "sessions"] });
    };
    return window.addEventListener("synapse-focus-room-materials-updated", c), window.addEventListener("storage", c), () => {
      window.removeEventListener("synapse-focus-room-materials-updated", c), window.removeEventListener("storage", c);
    };
  }, [e]), E.useEffect(() => {
    var c;
    s({
      items: Array.isArray(a.data) ? a.data : [],
      status: a.isError ? "error" : (a.isPending || a.isFetching) && !(a.data || []).length ? "loading" : "ready",
      error: ((c = a.error) == null ? void 0 : c.message) || ""
    });
  }, [
    a.data,
    (l = a.error) == null ? void 0 : l.message,
    a.isError,
    a.isFetching,
    a.isPending,
    s
  ]), E.useEffect(() => {
    if (t.name === "history") {
      r();
      return;
    }
    if (t.name !== "focus") return;
    const c = oO(a.data, t.materialId);
    n(t, c || null, { preserveSession: !0 });
  }, [n, a.data, t, r]), a;
}
function lO(t) {
  var n;
  const e = String(((n = t.selectedMaterial) == null ? void 0 : n.materialId) || t.selectedMaterialId || "");
  return !e || t.view !== "session" || t.summaryRecord ? null : {
    materialId: e,
    view: t.view,
    panelTab: t.panelTab,
    selectedScene: t.selectedScene,
    musicType: t.musicType,
    ambientSound: t.ambientSound,
    musicVolume: t.musicVolume,
    ambientVolume: t.ambientVolume,
    pomodoroDuration: t.pomodoroDuration,
    timerStatus: t.timerStatus,
    studyGoal: t.studyGoal,
    studyPlan: t.studyPlan,
    currentSession: t.currentSession,
    elapsedSeconds: t.elapsedSeconds,
    startedAt: t.startedAt,
    completedTasks: t.completedTasks,
    flashcardIndex: t.flashcardIndex,
    flashcardSide: t.flashcardSide,
    flashcardProgress: t.flashcardProgress,
    quizAnswers: t.quizAnswers,
    quizChecked: t.quizChecked,
    workspaceNotes: t.workspaceNotes,
    workspaceUpdatedAt: t.workspaceUpdatedAt,
    activeNoteSection: t.activeNoteSection,
    activeSourceHighlight: t.activeSourceHighlight,
    assistantContext: t.assistantContext,
    chatMessages: t.chatMessages
  };
}
function uO() {
  const [t, e] = E.useState(() => O_());
  E.useEffect(() => {
    const v = () => e(O_());
    return window.addEventListener("hashchange", v), () => window.removeEventListener("hashchange", v);
  }, []);
  const n = E.useMemo(() => PI(t), [t]), r = H((v) => v.view), s = nO(3e3), a = iO(), l = JF(), c = eO();
  aO(n), rO();
  const f = H(Vk(lO)), m = H((v) => v.selectedMaterialId), g = H((v) => v.summaryRecord);
  E.useEffect(() => {
    f != null && f.materialId && Ox(f.materialId, f);
  }, [f]), E.useEffect(() => {
    !m || r === "session" && !g || Lx(m);
  }, [m, g, r]);
  const d = () => {
    globalThis.location.hash = "#/study-history";
  }, p = (...v) => {
    c.returnToWorkspace(...v);
  };
  return /* @__PURE__ */ S.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${s ? "is-idle" : ""}`.trim(),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ S.jsx(jN, { scene: a }),
        /* @__PURE__ */ S.jsx(Jo, { mode: "wait", children: r === "history" ? /* @__PURE__ */ S.jsx(
          cn.div,
          {
            className: "focus-room-view focus-history-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: is,
            children: /* @__PURE__ */ S.jsx($F, { onWorkspace: p })
          },
          "history"
        ) : r === "session" ? /* @__PURE__ */ S.jsxs(
          cn.div,
          {
            className: "focus-room-view focus-session-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: is,
            children: [
              /* @__PURE__ */ S.jsx(M2, { onWorkspace: p, onHistory: d }),
              /* @__PURE__ */ S.jsx("section", { className: "focus-session-stage", children: /* @__PURE__ */ S.jsxs("div", { className: "focus-session-grid", children: [
                /* @__PURE__ */ S.jsx(zF, {}),
                /* @__PURE__ */ S.jsx(E2, {})
              ] }) }),
              /* @__PURE__ */ S.jsx(R2, { audioState: l }),
              /* @__PURE__ */ S.jsx(VF, { audioState: l }),
              /* @__PURE__ */ S.jsx(OF, { onWorkspace: p }),
              /* @__PURE__ */ S.jsx(LF, { onWorkspace: p, onHistory: d })
            ]
          },
          "session"
        ) : /* @__PURE__ */ S.jsx(
          cn.div,
          {
            className: "focus-room-view focus-room-setup-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: is,
            children: /* @__PURE__ */ S.jsx(b2, { audioState: l, onWorkspace: p, onHistory: d })
          },
          "setup"
        ) })
      ]
    }
  );
}
function O_() {
  var e;
  return String(((e = globalThis.location) == null ? void 0 : e.hash) || "#/focus-room").replace(/^#/, "") || "/focus-room";
}
let Mf = null;
function cO(t, e) {
  const n = globalThis.__synapseFocusRoomApi || {};
  if (typeof n[t] != "function") {
    console.warn(`Synapse Focus Room action "${t}" is not available yet.`);
    return;
  }
  return n[t](...e);
}
function dO() {
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
  }).forEach(([e, n]) => {
    globalThis[e] = (...r) => cO(n, r);
  });
}
function fO(t = {}) {
  dO();
  const e = t.root || document.getElementById("focusRoomRoot");
  if (!e)
    throw new Error("Focus Room root element was not found.");
  Mf || (Mf = Fk.createRoot(e), Mf.render(
    Kn.createElement(
      Kn.StrictMode,
      null,
      Kn.createElement(uO)
    )
  ));
}
const hO = "synapse.generated.history.v6", AT = "synapse.active.generated.v6", pO = "synapse.flashcards.deck.v1", mO = "synapse.quiz.history.v1", gO = "synapse.focusRoom.return-target.v1";
function am(t, e) {
  var n;
  try {
    const r = (n = globalThis.localStorage) == null ? void 0 : n.getItem(t);
    if (!r) return e;
    const s = JSON.parse(r);
    return s ?? e;
  } catch (r) {
    return console.warn(`Could not read ${t}:`, r), e;
  }
}
function yO(t, e) {
  var n;
  try {
    return (n = globalThis.localStorage) == null || n.setItem(t, e), !0;
  } catch (r) {
    return console.warn(`Could not write ${t}:`, r), !1;
  }
}
function vO(t, e) {
  var n;
  try {
    return (n = globalThis.localStorage) == null || n.setItem(t, JSON.stringify(e)), !0;
  } catch (r) {
    return console.warn(`Could not write ${t}:`, r), !1;
  }
}
function _O() {
  const t = am(hO, []);
  return Array.isArray(t) ? t : [];
}
function SO(t) {
  const e = String((t == null ? void 0 : t.title) || "").trim();
  return e || String((t == null ? void 0 : t.summary) || "").split(/\n+/).map((r) => r.replace(/^#+\s*/, "").trim()).find((r) => r.length > 4) || "Generated Study Notes";
}
function kT(t = {}) {
  return [
    t.id ? `history:${t.id}` : "",
    t.sourceFingerprint ? `fingerprint:${t.sourceFingerprint}` : "",
    t.clientFingerprint ? `fingerprint:${t.clientFingerprint}` : ""
  ].filter(Boolean);
}
function xO(t = {}) {
  const e = am(pO, {}), r = kT(t).map((s) => e == null ? void 0 : e[s]).find((s) => s && Array.isArray(s.cards) && s.cards.length);
  return (r == null ? void 0 : r.cards) || [];
}
function wO(t = {}) {
  var n;
  const e = String(t.id || "").trim();
  if (e) return `id:${e}`;
  try {
    return `content:${JSON.stringify({
      title: t.title || "",
      createdAt: t.createdAt || "",
      updatedAt: t.updatedAt || "",
      questions: ((n = t.quiz) == null ? void 0 : n.questions) || t.questions || []
    })}`;
  } catch {
    return "";
  }
}
function TO(t = []) {
  return (Array.isArray(t) ? t : []).map((e) => {
    var n;
    return {
      id: e.id,
      title: e.title,
      createdAt: e.createdAt || e.created_at || "",
      updatedAt: e.updatedAt || e.updated_at || "",
      questions: ((n = e.quiz) == null ? void 0 : n.questions) || e.questions || [],
      report: e.report || null
    };
  });
}
function AO(t = {}) {
  const e = am(mO, {}), r = kT(t).flatMap((a) => Array.isArray(e == null ? void 0 : e[a]) ? e[a] : []), s = /* @__PURE__ */ new Set();
  return TO(r).filter((a) => {
    const l = wO(a);
    return !l || s.has(l) ? !1 : (s.add(l), !0);
  }).sort((a, l) => new Date(l.createdAt || 0) - new Date(a.createdAt || 0));
}
function kO(t = {}) {
  return {
    materialId: String(t.id || t.sourceFingerprint || t.clientFingerprint || "current-material"),
    materialTitle: SO(t),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: t.summary || "",
    sections: t.sections || {},
    flashcards: xO(t),
    quizzes: AO(t),
    mindMap: t.mindMap || t.mind_map || t.brainstorm || null,
    studyPlan: t.studyPlan || [],
    progressHistory: [],
    sources: Array.isArray(t.sources) ? t.sources : [],
    sourceItems: Array.isArray(t.sourceItems) ? t.sourceItems : [],
    sourceHighlights: Array.isArray(t.sourceHighlights || t.source_highlights) ? t.sourceHighlights || t.source_highlights : [],
    sourceFingerprint: t.sourceFingerprint || t.clientFingerprint || "",
    createdAt: t.createdAt || "",
    updatedAt: t.updatedAt || ""
  };
}
function lm() {
  return _O().filter((t) => t && (t.id || t.summary)).map(kO);
}
function bT(t = "") {
  const e = String(t || "");
  return lm().find((n) => n.materialId === e) || null;
}
function CT() {
  var e;
  const t = ((e = globalThis.localStorage) == null ? void 0 : e.getItem(AT)) || "";
  return bT(t) || lm()[0] || null;
}
function bO(t = "") {
  var r;
  const e = t || ((r = CT()) == null ? void 0 : r.materialId) || "", n = e ? `/${encodeURIComponent(e)}` : "";
  globalThis.location.hash = `#/focus-room${n}`;
}
function CO(t = "", e = {}) {
  const n = e && typeof e == "object" && !Array.isArray(e) ? e : {};
  return {
    materialId: String(t || ""),
    action: String(n.action || "").trim().toLowerCase(),
    sourceId: String(n.sourceId || n.source_id || ""),
    sourceIndex: Number(n.sourceIndex || n.source_index || 0) || 0,
    sourceLabel: String(n.sourceLabel || n.source_label || ""),
    sectionTitle: String(n.sectionTitle || n.section_title || ""),
    highlightId: String(n.highlightId || n.highlight_id || ""),
    excerpt: String(n.excerpt || "").slice(0, 1600),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function PO(t = "", e = {}) {
  const n = String(t || "");
  n && yO(AT, n);
  const r = CO(n, e);
  r.action && vO(gO, r), globalThis.location.href = n ? `index.html?focusReturn=${encodeURIComponent(n)}` : "index.html";
}
function EO() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: CT,
    getSynapseFocusRoomMaterial: bT,
    getSynapseFocusRoomMaterials: lm,
    openSynapseFocusRoom: bO,
    returnFromFocusRoomToWorkspace: PO
  });
}
const PT = document.getElementById("focusRoomRoot");
if (!PT)
  throw new Error("Focus Room root element was not found.");
var $_;
($_ = document.getElementById("focusRoomFallbackTitle")) == null || $_.remove();
globalThis.apiClient = new B_(Pk);
EO();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
fO({ root: PT });
