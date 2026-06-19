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
  const e = String(t || "").toLowerCase();
  return e === "127.0.0.1" || e === "localhost" || e === "::1" || e === "[::1]";
}
const Ck = (() => {
  var l, c, f, m;
  const t = window.SYNAPSE_API_BASE || ((c = (l = document.body) == null ? void 0 : l.dataset) == null ? void 0 : c.apiBase) || "";
  if (t) return String(t).replace(/\/+$/, "");
  const { protocol: e, hostname: n, port: r } = window.location, s = String(window.SYNAPSE_BACKEND_PORT || ((m = (f = document.body) == null ? void 0 : f.dataset) == null ? void 0 : m.apiPort) || "8001").trim(), a = `http://127.0.0.1:${s || "8001"}`;
  return e === "file:" || bk(n) && r !== s ? a : `${e}//${window.location.host}`;
})();
class Wy extends Error {
  constructor(e, { cause: n } = {}) {
    super(e), this.name = "ApiConnectionError", this.cause = n;
  }
}
const Zy = "synapse.client.id.v1";
function Gi() {
  return globalThis.window || globalThis;
}
function Li(t, e = 220) {
  return String(t || "").replace(/[\r\n]+/g, " ").trim().slice(0, e);
}
function Gy() {
  const t = globalThis.crypto || Gi().crypto;
  return t != null && t.randomUUID ? t.randomUUID() : `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
function Pk() {
  var e, n;
  const t = Gi();
  try {
    const r = (e = t.localStorage) == null ? void 0 : e.getItem(Zy);
    if (r) return r;
    const s = Gy();
    return (n = t.localStorage) == null || n.setItem(Zy, s), s;
  } catch {
    return Gy();
  }
}
function Ek(t = {}) {
  if (typeof Headers < "u" && t instanceof Headers) {
    const e = {};
    return t.forEach((n, r) => {
      e[r] = n;
    }), e;
  }
  return Array.isArray(t) ? Object.fromEntries(t) : { ...t || {} };
}
class P_ {
  constructor(e, { fetchImpl: n } = {}) {
    var s, a;
    const r = Gi();
    this.baseUrl = String(e || "").replace(/\/+$/, ""), this.fetchImpl = n || ((s = r.fetch) == null ? void 0 : s.bind(r)) || ((a = globalThis.fetch) == null ? void 0 : a.bind(globalThis));
  }
  endpoint(e) {
    const n = String(e || "").replace(/^\/+/, "");
    return `${this.baseUrl}/${n}`;
  }
  timeoutMessage(e) {
    return `Synapse backend did not respond within ${Math.max(1, Math.round(Number(e || 0) / 1e3))} seconds. Try a smaller source set or increase window.SYNAPSE_ANALYSIS_TIMEOUT_MS.`;
  }
  async requestHeaders(e = {}) {
    var a, l, c;
    const n = Gi(), r = Ek(e);
    r["X-Synapse-Client-Id"] = Li(Pk(), 160);
    const s = (l = (a = n.SynapseAuth) == null ? void 0 : a.getStoredSession) == null ? void 0 : l.call(a);
    if (s && typeof s == "object" && (s.accountId && (r["X-Synapse-User-Id"] = Li(s.accountId, 160)), s.email && (r["X-Synapse-User-Email"] = Li(s.email, 220)), s.displayName && (r["X-Synapse-User-Name"] = Li(s.displayName, 180)), s.authMode && (r["X-Synapse-Auth-Mode"] = Li(s.authMode, 60)), s.role && (r["X-Synapse-User-Role"] = Li(s.role, 80))), (c = n.SynapseAuth) != null && c.authHeaders && !r.Authorization && !r.authorization)
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
    l > 0 && typeof AbortController < "u" && (c = new AbortController(), m = () => c.abort(), g && (g.aborted ? c.abort() : g.addEventListener("abort", m, { once: !0 })), f = Gi().setTimeout(() => c.abort(), l), a.signal = c.signal);
    try {
      return await this.fetchImpl(r, a);
    } catch (p) {
      throw (d = c == null ? void 0 : c.signal) != null && d.aborted ? new Wy(this.timeoutMessage(l), { cause: p }) : new Wy(
        [
          `Cannot reach the Synapse backend at ${this.baseUrl}.`,
          "Start the local stack with `bash scripts/start_local_stack.sh`, or run `.venv/bin/python run_backend.py` manually, then try again."
        ].join(" "),
        { cause: p }
      );
    } finally {
      f && Gi().clearTimeout(f), g && m && g.removeEventListener("abort", m);
    }
  }
}
var co = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function E_(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Od = { exports: {} }, ve = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ky;
function Mk() {
  if (Ky) return ve;
  Ky = 1;
  var t = Symbol.for("react.element"), e = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), s = Symbol.for("react.profiler"), a = Symbol.for("react.provider"), l = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), f = Symbol.for("react.suspense"), m = Symbol.for("react.memo"), g = Symbol.for("react.lazy"), d = Symbol.iterator;
  function p(F) {
    return F === null || typeof F != "object" ? null : (F = d && F[d] || F["@@iterator"], typeof F == "function" ? F : null);
  }
  var v = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, w = Object.assign, S = {};
  function T(F, D, X) {
    this.props = F, this.context = D, this.refs = S, this.updater = X || v;
  }
  T.prototype.isReactComponent = {}, T.prototype.setState = function(F, D) {
    if (typeof F != "object" && typeof F != "function" && F != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, F, D, "setState");
  }, T.prototype.forceUpdate = function(F) {
    this.updater.enqueueForceUpdate(this, F, "forceUpdate");
  };
  function A() {
  }
  A.prototype = T.prototype;
  function b(F, D, X) {
    this.props = F, this.context = D, this.refs = S, this.updater = X || v;
  }
  var E = b.prototype = new A();
  E.constructor = b, w(E, T.prototype), E.isPureReactComponent = !0;
  var M = Array.isArray, C = Object.prototype.hasOwnProperty, $ = { current: null }, I = { key: !0, ref: !0, __self: !0, __source: !0 };
  function O(F, D, X) {
    var ae, me = {}, _e = null, ke = null;
    if (D != null) for (ae in D.ref !== void 0 && (ke = D.ref), D.key !== void 0 && (_e = "" + D.key), D) C.call(D, ae) && !I.hasOwnProperty(ae) && (me[ae] = D[ae]);
    var Te = arguments.length - 2;
    if (Te === 1) me.children = X;
    else if (1 < Te) {
      for (var De = Array(Te), zt = 0; zt < Te; zt++) De[zt] = arguments[zt + 2];
      me.children = De;
    }
    if (F && F.defaultProps) for (ae in Te = F.defaultProps, Te) me[ae] === void 0 && (me[ae] = Te[ae]);
    return { $$typeof: t, type: F, key: _e, ref: ke, props: me, _owner: $.current };
  }
  function L(F, D) {
    return { $$typeof: t, type: F.type, key: D, ref: F.ref, props: F.props, _owner: F._owner };
  }
  function U(F) {
    return typeof F == "object" && F !== null && F.$$typeof === t;
  }
  function q(F) {
    var D = { "=": "=0", ":": "=2" };
    return "$" + F.replace(/[=:]/g, function(X) {
      return D[X];
    });
  }
  var ee = /\/+/g;
  function ne(F, D) {
    return typeof F == "object" && F !== null && F.key != null ? q("" + F.key) : D.toString(36);
  }
  function ie(F, D, X, ae, me) {
    var _e = typeof F;
    (_e === "undefined" || _e === "boolean") && (F = null);
    var ke = !1;
    if (F === null) ke = !0;
    else switch (_e) {
      case "string":
      case "number":
        ke = !0;
        break;
      case "object":
        switch (F.$$typeof) {
          case t:
          case e:
            ke = !0;
        }
    }
    if (ke) return ke = F, me = me(ke), F = ae === "" ? "." + ne(ke, 0) : ae, M(me) ? (X = "", F != null && (X = F.replace(ee, "$&/") + "/"), ie(me, D, X, "", function(zt) {
      return zt;
    })) : me != null && (U(me) && (me = L(me, X + (!me.key || ke && ke.key === me.key ? "" : ("" + me.key).replace(ee, "$&/") + "/") + F)), D.push(me)), 1;
    if (ke = 0, ae = ae === "" ? "." : ae + ":", M(F)) for (var Te = 0; Te < F.length; Te++) {
      _e = F[Te];
      var De = ae + ne(_e, Te);
      ke += ie(_e, D, X, De, me);
    }
    else if (De = p(F), typeof De == "function") for (F = De.call(F), Te = 0; !(_e = F.next()).done; ) _e = _e.value, De = ae + ne(_e, Te++), ke += ie(_e, D, X, De, me);
    else if (_e === "object") throw D = String(F), Error("Objects are not valid as a React child (found: " + (D === "[object Object]" ? "object with keys {" + Object.keys(F).join(", ") + "}" : D) + "). If you meant to render a collection of children, use an array instead.");
    return ke;
  }
  function ge(F, D, X) {
    if (F == null) return F;
    var ae = [], me = 0;
    return ie(F, ae, "", "", function(_e) {
      return D.call(X, _e, me++);
    }), ae;
  }
  function ce(F) {
    if (F._status === -1) {
      var D = F._result;
      D = D(), D.then(function(X) {
        (F._status === 0 || F._status === -1) && (F._status = 1, F._result = X);
      }, function(X) {
        (F._status === 0 || F._status === -1) && (F._status = 2, F._result = X);
      }), F._status === -1 && (F._status = 0, F._result = D);
    }
    if (F._status === 1) return F._result.default;
    throw F._result;
  }
  var fe = { current: null }, W = { transition: null }, J = { ReactCurrentDispatcher: fe, ReactCurrentBatchConfig: W, ReactCurrentOwner: $ };
  function Q() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return ve.Children = { map: ge, forEach: function(F, D, X) {
    ge(F, function() {
      D.apply(this, arguments);
    }, X);
  }, count: function(F) {
    var D = 0;
    return ge(F, function() {
      D++;
    }), D;
  }, toArray: function(F) {
    return ge(F, function(D) {
      return D;
    }) || [];
  }, only: function(F) {
    if (!U(F)) throw Error("React.Children.only expected to receive a single React element child.");
    return F;
  } }, ve.Component = T, ve.Fragment = n, ve.Profiler = s, ve.PureComponent = b, ve.StrictMode = r, ve.Suspense = f, ve.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = J, ve.act = Q, ve.cloneElement = function(F, D, X) {
    if (F == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + F + ".");
    var ae = w({}, F.props), me = F.key, _e = F.ref, ke = F._owner;
    if (D != null) {
      if (D.ref !== void 0 && (_e = D.ref, ke = $.current), D.key !== void 0 && (me = "" + D.key), F.type && F.type.defaultProps) var Te = F.type.defaultProps;
      for (De in D) C.call(D, De) && !I.hasOwnProperty(De) && (ae[De] = D[De] === void 0 && Te !== void 0 ? Te[De] : D[De]);
    }
    var De = arguments.length - 2;
    if (De === 1) ae.children = X;
    else if (1 < De) {
      Te = Array(De);
      for (var zt = 0; zt < De; zt++) Te[zt] = arguments[zt + 2];
      ae.children = Te;
    }
    return { $$typeof: t, type: F.type, key: me, ref: _e, props: ae, _owner: ke };
  }, ve.createContext = function(F) {
    return F = { $$typeof: l, _currentValue: F, _currentValue2: F, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, F.Provider = { $$typeof: a, _context: F }, F.Consumer = F;
  }, ve.createElement = O, ve.createFactory = function(F) {
    var D = O.bind(null, F);
    return D.type = F, D;
  }, ve.createRef = function() {
    return { current: null };
  }, ve.forwardRef = function(F) {
    return { $$typeof: c, render: F };
  }, ve.isValidElement = U, ve.lazy = function(F) {
    return { $$typeof: g, _payload: { _status: -1, _result: F }, _init: ce };
  }, ve.memo = function(F, D) {
    return { $$typeof: m, type: F, compare: D === void 0 ? null : D };
  }, ve.startTransition = function(F) {
    var D = W.transition;
    W.transition = {};
    try {
      F();
    } finally {
      W.transition = D;
    }
  }, ve.unstable_act = Q, ve.useCallback = function(F, D) {
    return fe.current.useCallback(F, D);
  }, ve.useContext = function(F) {
    return fe.current.useContext(F);
  }, ve.useDebugValue = function() {
  }, ve.useDeferredValue = function(F) {
    return fe.current.useDeferredValue(F);
  }, ve.useEffect = function(F, D) {
    return fe.current.useEffect(F, D);
  }, ve.useId = function() {
    return fe.current.useId();
  }, ve.useImperativeHandle = function(F, D, X) {
    return fe.current.useImperativeHandle(F, D, X);
  }, ve.useInsertionEffect = function(F, D) {
    return fe.current.useInsertionEffect(F, D);
  }, ve.useLayoutEffect = function(F, D) {
    return fe.current.useLayoutEffect(F, D);
  }, ve.useMemo = function(F, D) {
    return fe.current.useMemo(F, D);
  }, ve.useReducer = function(F, D, X) {
    return fe.current.useReducer(F, D, X);
  }, ve.useRef = function(F) {
    return fe.current.useRef(F);
  }, ve.useState = function(F) {
    return fe.current.useState(F);
  }, ve.useSyncExternalStore = function(F, D, X) {
    return fe.current.useSyncExternalStore(F, D, X);
  }, ve.useTransition = function() {
    return fe.current.useTransition();
  }, ve.version = "18.3.1", ve;
}
var Yy;
function Fh() {
  return Yy || (Yy = 1, Od.exports = Mk()), Od.exports;
}
var P = Fh();
const Kn = /* @__PURE__ */ E_(P), Oh = /* @__PURE__ */ kk({
  __proto__: null,
  default: Kn
}, [P]);
var vl = {}, Ld = { exports: {} }, Rt = {}, zd = { exports: {} }, $d = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var qy;
function Rk() {
  return qy || (qy = 1, (function(t) {
    function e(W, J) {
      var Q = W.length;
      W.push(J);
      e: for (; 0 < Q; ) {
        var F = Q - 1 >>> 1, D = W[F];
        if (0 < s(D, J)) W[F] = J, W[Q] = D, Q = F;
        else break e;
      }
    }
    function n(W) {
      return W.length === 0 ? null : W[0];
    }
    function r(W) {
      if (W.length === 0) return null;
      var J = W[0], Q = W.pop();
      if (Q !== J) {
        W[0] = Q;
        e: for (var F = 0, D = W.length, X = D >>> 1; F < X; ) {
          var ae = 2 * (F + 1) - 1, me = W[ae], _e = ae + 1, ke = W[_e];
          if (0 > s(me, Q)) _e < D && 0 > s(ke, me) ? (W[F] = ke, W[_e] = Q, F = _e) : (W[F] = me, W[ae] = Q, F = ae);
          else if (_e < D && 0 > s(ke, Q)) W[F] = ke, W[_e] = Q, F = _e;
          else break e;
        }
      }
      return J;
    }
    function s(W, J) {
      var Q = W.sortIndex - J.sortIndex;
      return Q !== 0 ? Q : W.id - J.id;
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
    var f = [], m = [], g = 1, d = null, p = 3, v = !1, w = !1, S = !1, T = typeof setTimeout == "function" ? setTimeout : null, A = typeof clearTimeout == "function" ? clearTimeout : null, b = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function E(W) {
      for (var J = n(m); J !== null; ) {
        if (J.callback === null) r(m);
        else if (J.startTime <= W) r(m), J.sortIndex = J.expirationTime, e(f, J);
        else break;
        J = n(m);
      }
    }
    function M(W) {
      if (S = !1, E(W), !w) if (n(f) !== null) w = !0, ce(C);
      else {
        var J = n(m);
        J !== null && fe(M, J.startTime - W);
      }
    }
    function C(W, J) {
      w = !1, S && (S = !1, A(O), O = -1), v = !0;
      var Q = p;
      try {
        for (E(J), d = n(f); d !== null && (!(d.expirationTime > J) || W && !q()); ) {
          var F = d.callback;
          if (typeof F == "function") {
            d.callback = null, p = d.priorityLevel;
            var D = F(d.expirationTime <= J);
            J = t.unstable_now(), typeof D == "function" ? d.callback = D : d === n(f) && r(f), E(J);
          } else r(f);
          d = n(f);
        }
        if (d !== null) var X = !0;
        else {
          var ae = n(m);
          ae !== null && fe(M, ae.startTime - J), X = !1;
        }
        return X;
      } finally {
        d = null, p = Q, v = !1;
      }
    }
    var $ = !1, I = null, O = -1, L = 5, U = -1;
    function q() {
      return !(t.unstable_now() - U < L);
    }
    function ee() {
      if (I !== null) {
        var W = t.unstable_now();
        U = W;
        var J = !0;
        try {
          J = I(!0, W);
        } finally {
          J ? ne() : ($ = !1, I = null);
        }
      } else $ = !1;
    }
    var ne;
    if (typeof b == "function") ne = function() {
      b(ee);
    };
    else if (typeof MessageChannel < "u") {
      var ie = new MessageChannel(), ge = ie.port2;
      ie.port1.onmessage = ee, ne = function() {
        ge.postMessage(null);
      };
    } else ne = function() {
      T(ee, 0);
    };
    function ce(W) {
      I = W, $ || ($ = !0, ne());
    }
    function fe(W, J) {
      O = T(function() {
        W(t.unstable_now());
      }, J);
    }
    t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(W) {
      W.callback = null;
    }, t.unstable_continueExecution = function() {
      w || v || (w = !0, ce(C));
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
      var Q = p;
      p = J;
      try {
        return W();
      } finally {
        p = Q;
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
      var Q = p;
      p = W;
      try {
        return J();
      } finally {
        p = Q;
      }
    }, t.unstable_scheduleCallback = function(W, J, Q) {
      var F = t.unstable_now();
      switch (typeof Q == "object" && Q !== null ? (Q = Q.delay, Q = typeof Q == "number" && 0 < Q ? F + Q : F) : Q = F, W) {
        case 1:
          var D = -1;
          break;
        case 2:
          D = 250;
          break;
        case 5:
          D = 1073741823;
          break;
        case 4:
          D = 1e4;
          break;
        default:
          D = 5e3;
      }
      return D = Q + D, W = { id: g++, callback: J, priorityLevel: W, startTime: Q, expirationTime: D, sortIndex: -1 }, Q > F ? (W.sortIndex = Q, e(m, W), n(f) === null && W === n(m) && (S ? (A(O), O = -1) : S = !0, fe(M, Q - F))) : (W.sortIndex = D, e(f, W), w || v || (w = !0, ce(C))), W;
    }, t.unstable_shouldYield = q, t.unstable_wrapCallback = function(W) {
      var J = p;
      return function() {
        var Q = p;
        p = J;
        try {
          return W.apply(this, arguments);
        } finally {
          p = Q;
        }
      };
    };
  })($d)), $d;
}
var Qy;
function Nk() {
  return Qy || (Qy = 1, zd.exports = Rk()), zd.exports;
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
var Xy;
function Ik() {
  if (Xy) return Rt;
  Xy = 1;
  var t = Fh(), e = Nk();
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
  function S(i, o, u, h, y, x, k) {
    this.acceptsBooleans = o === 2 || o === 3 || o === 4, this.attributeName = h, this.attributeNamespace = y, this.mustUseProperty = u, this.propertyName = i, this.type = o, this.sanitizeURL = x, this.removeEmptyString = k;
  }
  var T = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(i) {
    T[i] = new S(i, 0, !1, i, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(i) {
    var o = i[0];
    T[o] = new S(o, 1, !1, i[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(i) {
    T[i] = new S(i, 2, !1, i.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(i) {
    T[i] = new S(i, 2, !1, i, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(i) {
    T[i] = new S(i, 3, !1, i.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(i) {
    T[i] = new S(i, 3, !0, i, null, !1, !1);
  }), ["capture", "download"].forEach(function(i) {
    T[i] = new S(i, 4, !1, i, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(i) {
    T[i] = new S(i, 6, !1, i, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(i) {
    T[i] = new S(i, 5, !1, i.toLowerCase(), null, !1, !1);
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
    T[o] = new S(o, 1, !1, i, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(i) {
    var o = i.replace(A, b);
    T[o] = new S(o, 1, !1, i, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(i) {
    var o = i.replace(A, b);
    T[o] = new S(o, 1, !1, i, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(i) {
    T[i] = new S(i, 1, !1, i.toLowerCase(), null, !1, !1);
  }), T.xlinkHref = new S("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(i) {
    T[i] = new S(i, 1, !1, i.toLowerCase(), null, !0, !0);
  });
  function E(i, o, u, h) {
    var y = T.hasOwnProperty(o) ? T[o] : null;
    (y !== null ? y.type !== 0 : h || !(2 < o.length) || o[0] !== "o" && o[0] !== "O" || o[1] !== "n" && o[1] !== "N") && (w(o, u, y, h) && (u = null), h || y === null ? p(o) && (u === null ? i.removeAttribute(o) : i.setAttribute(o, "" + u)) : y.mustUseProperty ? i[y.propertyName] = u === null ? y.type === 3 ? !1 : "" : u : (o = y.attributeName, h = y.attributeNamespace, u === null ? i.removeAttribute(o) : (y = y.type, u = y === 3 || y === 4 && u === !0 ? "" : "" + u, h ? i.setAttributeNS(h, o, u) : i.setAttribute(o, u))));
  }
  var M = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, C = Symbol.for("react.element"), $ = Symbol.for("react.portal"), I = Symbol.for("react.fragment"), O = Symbol.for("react.strict_mode"), L = Symbol.for("react.profiler"), U = Symbol.for("react.provider"), q = Symbol.for("react.context"), ee = Symbol.for("react.forward_ref"), ne = Symbol.for("react.suspense"), ie = Symbol.for("react.suspense_list"), ge = Symbol.for("react.memo"), ce = Symbol.for("react.lazy"), fe = Symbol.for("react.offscreen"), W = Symbol.iterator;
  function J(i) {
    return i === null || typeof i != "object" ? null : (i = W && i[W] || i["@@iterator"], typeof i == "function" ? i : null);
  }
  var Q = Object.assign, F;
  function D(i) {
    if (F === void 0) try {
      throw Error();
    } catch (u) {
      var o = u.stack.trim().match(/\n( *(at )?)/);
      F = o && o[1] || "";
    }
    return `
` + F + i;
  }
  var X = !1;
  function ae(i, o) {
    if (!i || X) return "";
    X = !0;
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
`), x = h.stack.split(`
`), k = y.length - 1, R = x.length - 1; 1 <= k && 0 <= R && y[k] !== x[R]; ) R--;
        for (; 1 <= k && 0 <= R; k--, R--) if (y[k] !== x[R]) {
          if (k !== 1 || R !== 1)
            do
              if (k--, R--, 0 > R || y[k] !== x[R]) {
                var N = `
` + y[k].replace(" at new ", " at ");
                return i.displayName && N.includes("<anonymous>") && (N = N.replace("<anonymous>", i.displayName)), N;
              }
            while (1 <= k && 0 <= R);
          break;
        }
      }
    } finally {
      X = !1, Error.prepareStackTrace = u;
    }
    return (i = i ? i.displayName || i.name : "") ? D(i) : "";
  }
  function me(i) {
    switch (i.tag) {
      case 5:
        return D(i.type);
      case 16:
        return D("Lazy");
      case 13:
        return D("Suspense");
      case 19:
        return D("SuspenseList");
      case 0:
      case 2:
      case 15:
        return i = ae(i.type, !1), i;
      case 11:
        return i = ae(i.type.render, !1), i;
      case 1:
        return i = ae(i.type, !0), i;
      default:
        return "";
    }
  }
  function _e(i) {
    if (i == null) return null;
    if (typeof i == "function") return i.displayName || i.name || null;
    if (typeof i == "string") return i;
    switch (i) {
      case I:
        return "Fragment";
      case $:
        return "Portal";
      case L:
        return "Profiler";
      case O:
        return "StrictMode";
      case ne:
        return "Suspense";
      case ie:
        return "SuspenseList";
    }
    if (typeof i == "object") switch (i.$$typeof) {
      case q:
        return (i.displayName || "Context") + ".Consumer";
      case U:
        return (i._context.displayName || "Context") + ".Provider";
      case ee:
        var o = i.render;
        return i = i.displayName, i || (i = o.displayName || o.name || "", i = i !== "" ? "ForwardRef(" + i + ")" : "ForwardRef"), i;
      case ge:
        return o = i.displayName || null, o !== null ? o : _e(i.type) || "Memo";
      case ce:
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
        return o === O ? "StrictMode" : "Mode";
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
      var y = u.get, x = u.set;
      return Object.defineProperty(i, o, { configurable: !0, get: function() {
        return y.call(this);
      }, set: function(k) {
        h = "" + k, x.call(this, k);
      } }), Object.defineProperty(i, o, { enumerable: u.enumerable }), { getValue: function() {
        return h;
      }, setValue: function(k) {
        h = "" + k;
      }, stopTracking: function() {
        i._valueTracker = null, delete i[o];
      } };
    }
  }
  function la(i) {
    i._valueTracker || (i._valueTracker = zt(i));
  }
  function Qp(i) {
    if (!i) return !1;
    var o = i._valueTracker;
    if (!o) return !0;
    var u = o.getValue(), h = "";
    return i && (h = De(i) ? i.checked ? "true" : "false" : i.value), i = h, i !== u ? (o.setValue(i), !0) : !1;
  }
  function ua(i) {
    if (i = i || (typeof document < "u" ? document : void 0), typeof i > "u") return null;
    try {
      return i.activeElement || i.body;
    } catch {
      return i.body;
    }
  }
  function Hu(i, o) {
    var u = o.checked;
    return Q({}, o, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: u ?? i._wrapperState.initialChecked });
  }
  function Xp(i, o) {
    var u = o.defaultValue == null ? "" : o.defaultValue, h = o.checked != null ? o.checked : o.defaultChecked;
    u = Te(o.value != null ? o.value : u), i._wrapperState = { initialChecked: h, initialValue: u, controlled: o.type === "checkbox" || o.type === "radio" ? o.checked != null : o.value != null };
  }
  function Jp(i, o) {
    o = o.checked, o != null && E(i, "checked", o, !1);
  }
  function Wu(i, o) {
    Jp(i, o);
    var u = Te(o.value), h = o.type;
    if (u != null) h === "number" ? (u === 0 && i.value === "" || i.value != u) && (i.value = "" + u) : i.value !== "" + u && (i.value = "" + u);
    else if (h === "submit" || h === "reset") {
      i.removeAttribute("value");
      return;
    }
    o.hasOwnProperty("value") ? Zu(i, o.type, u) : o.hasOwnProperty("defaultValue") && Zu(i, o.type, Te(o.defaultValue)), o.checked == null && o.defaultChecked != null && (i.defaultChecked = !!o.defaultChecked);
  }
  function em(i, o, u) {
    if (o.hasOwnProperty("value") || o.hasOwnProperty("defaultValue")) {
      var h = o.type;
      if (!(h !== "submit" && h !== "reset" || o.value !== void 0 && o.value !== null)) return;
      o = "" + i._wrapperState.initialValue, u || o === i.value || (i.value = o), i.defaultValue = o;
    }
    u = i.name, u !== "" && (i.name = ""), i.defaultChecked = !!i._wrapperState.initialChecked, u !== "" && (i.name = u);
  }
  function Zu(i, o, u) {
    (o !== "number" || ua(i.ownerDocument) !== i) && (u == null ? i.defaultValue = "" + i._wrapperState.initialValue : i.defaultValue !== "" + u && (i.defaultValue = "" + u));
  }
  var ks = Array.isArray;
  function hi(i, o, u, h) {
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
  function Gu(i, o) {
    if (o.dangerouslySetInnerHTML != null) throw Error(n(91));
    return Q({}, o, { value: void 0, defaultValue: void 0, children: "" + i._wrapperState.initialValue });
  }
  function tm(i, o) {
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
  function nm(i, o) {
    var u = Te(o.value), h = Te(o.defaultValue);
    u != null && (u = "" + u, u !== i.value && (i.value = u), o.defaultValue == null && i.defaultValue !== u && (i.defaultValue = u)), h != null && (i.defaultValue = "" + h);
  }
  function rm(i) {
    var o = i.textContent;
    o === i._wrapperState.initialValue && o !== "" && o !== null && (i.value = o);
  }
  function im(i) {
    switch (i) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function Ku(i, o) {
    return i == null || i === "http://www.w3.org/1999/xhtml" ? im(o) : i === "http://www.w3.org/2000/svg" && o === "foreignObject" ? "http://www.w3.org/1999/xhtml" : i;
  }
  var ca, sm = (function(i) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(o, u, h, y) {
      MSApp.execUnsafeLocalFunction(function() {
        return i(o, u, h, y);
      });
    } : i;
  })(function(i, o) {
    if (i.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in i) i.innerHTML = o;
    else {
      for (ca = ca || document.createElement("div"), ca.innerHTML = "<svg>" + o.valueOf().toString() + "</svg>", o = ca.firstChild; i.firstChild; ) i.removeChild(i.firstChild);
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
  function om(i, o, u) {
    return o == null || typeof o == "boolean" || o === "" ? "" : u || typeof o != "number" || o === 0 || Cs.hasOwnProperty(i) && Cs[i] ? ("" + o).trim() : o + "px";
  }
  function am(i, o) {
    i = i.style;
    for (var u in o) if (o.hasOwnProperty(u)) {
      var h = u.indexOf("--") === 0, y = om(u, o[u], h);
      u === "float" && (u = "cssFloat"), h ? i.setProperty(u, y) : i[u] = y;
    }
  }
  var MT = Q({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Yu(i, o) {
    if (o) {
      if (MT[i] && (o.children != null || o.dangerouslySetInnerHTML != null)) throw Error(n(137, i));
      if (o.dangerouslySetInnerHTML != null) {
        if (o.children != null) throw Error(n(60));
        if (typeof o.dangerouslySetInnerHTML != "object" || !("__html" in o.dangerouslySetInnerHTML)) throw Error(n(61));
      }
      if (o.style != null && typeof o.style != "object") throw Error(n(62));
    }
  }
  function qu(i, o) {
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
  var Qu = null;
  function Xu(i) {
    return i = i.target || i.srcElement || window, i.correspondingUseElement && (i = i.correspondingUseElement), i.nodeType === 3 ? i.parentNode : i;
  }
  var Ju = null, pi = null, mi = null;
  function lm(i) {
    if (i = Ys(i)) {
      if (typeof Ju != "function") throw Error(n(280));
      var o = i.stateNode;
      o && (o = Ia(o), Ju(i.stateNode, i.type, o));
    }
  }
  function um(i) {
    pi ? mi ? mi.push(i) : mi = [i] : pi = i;
  }
  function cm() {
    if (pi) {
      var i = pi, o = mi;
      if (mi = pi = null, lm(i), o) for (i = 0; i < o.length; i++) lm(o[i]);
    }
  }
  function dm(i, o) {
    return i(o);
  }
  function fm() {
  }
  var ec = !1;
  function hm(i, o, u) {
    if (ec) return i(o, u);
    ec = !0;
    try {
      return dm(i, o, u);
    } finally {
      ec = !1, (pi !== null || mi !== null) && (fm(), cm());
    }
  }
  function Ps(i, o) {
    var u = i.stateNode;
    if (u === null) return null;
    var h = Ia(u);
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
  var tc = !1;
  if (c) try {
    var Es = {};
    Object.defineProperty(Es, "passive", { get: function() {
      tc = !0;
    } }), window.addEventListener("test", Es, Es), window.removeEventListener("test", Es, Es);
  } catch {
    tc = !1;
  }
  function RT(i, o, u, h, y, x, k, R, N) {
    var B = Array.prototype.slice.call(arguments, 3);
    try {
      o.apply(u, B);
    } catch (G) {
      this.onError(G);
    }
  }
  var Ms = !1, da = null, fa = !1, nc = null, NT = { onError: function(i) {
    Ms = !0, da = i;
  } };
  function IT(i, o, u, h, y, x, k, R, N) {
    Ms = !1, da = null, RT.apply(NT, arguments);
  }
  function DT(i, o, u, h, y, x, k, R, N) {
    if (IT.apply(this, arguments), Ms) {
      if (Ms) {
        var B = da;
        Ms = !1, da = null;
      } else throw Error(n(198));
      fa || (fa = !0, nc = B);
    }
  }
  function Dr(i) {
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
  function pm(i) {
    if (i.tag === 13) {
      var o = i.memoizedState;
      if (o === null && (i = i.alternate, i !== null && (o = i.memoizedState)), o !== null) return o.dehydrated;
    }
    return null;
  }
  function mm(i) {
    if (Dr(i) !== i) throw Error(n(188));
  }
  function jT(i) {
    var o = i.alternate;
    if (!o) {
      if (o = Dr(i), o === null) throw Error(n(188));
      return o !== i ? null : i;
    }
    for (var u = i, h = o; ; ) {
      var y = u.return;
      if (y === null) break;
      var x = y.alternate;
      if (x === null) {
        if (h = y.return, h !== null) {
          u = h;
          continue;
        }
        break;
      }
      if (y.child === x.child) {
        for (x = y.child; x; ) {
          if (x === u) return mm(y), i;
          if (x === h) return mm(y), o;
          x = x.sibling;
        }
        throw Error(n(188));
      }
      if (u.return !== h.return) u = y, h = x;
      else {
        for (var k = !1, R = y.child; R; ) {
          if (R === u) {
            k = !0, u = y, h = x;
            break;
          }
          if (R === h) {
            k = !0, h = y, u = x;
            break;
          }
          R = R.sibling;
        }
        if (!k) {
          for (R = x.child; R; ) {
            if (R === u) {
              k = !0, u = x, h = y;
              break;
            }
            if (R === h) {
              k = !0, h = x, u = y;
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
  function gm(i) {
    return i = jT(i), i !== null ? ym(i) : null;
  }
  function ym(i) {
    if (i.tag === 5 || i.tag === 6) return i;
    for (i = i.child; i !== null; ) {
      var o = ym(i);
      if (o !== null) return o;
      i = i.sibling;
    }
    return null;
  }
  var vm = e.unstable_scheduleCallback, _m = e.unstable_cancelCallback, FT = e.unstable_shouldYield, OT = e.unstable_requestPaint, Ge = e.unstable_now, LT = e.unstable_getCurrentPriorityLevel, rc = e.unstable_ImmediatePriority, xm = e.unstable_UserBlockingPriority, ha = e.unstable_NormalPriority, zT = e.unstable_LowPriority, Sm = e.unstable_IdlePriority, pa = null, wn = null;
  function $T(i) {
    if (wn && typeof wn.onCommitFiberRoot == "function") try {
      wn.onCommitFiberRoot(pa, i, void 0, (i.current.flags & 128) === 128);
    } catch {
    }
  }
  var dn = Math.clz32 ? Math.clz32 : UT, VT = Math.log, BT = Math.LN2;
  function UT(i) {
    return i >>>= 0, i === 0 ? 32 : 31 - (VT(i) / BT | 0) | 0;
  }
  var ma = 64, ga = 4194304;
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
  function ya(i, o) {
    var u = i.pendingLanes;
    if (u === 0) return 0;
    var h = 0, y = i.suspendedLanes, x = i.pingedLanes, k = u & 268435455;
    if (k !== 0) {
      var R = k & ~y;
      R !== 0 ? h = Rs(R) : (x &= k, x !== 0 && (h = Rs(x)));
    } else k = u & ~y, k !== 0 ? h = Rs(k) : x !== 0 && (h = Rs(x));
    if (h === 0) return 0;
    if (o !== 0 && o !== h && (o & y) === 0 && (y = h & -h, x = o & -o, y >= x || y === 16 && (x & 4194240) !== 0)) return o;
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
    for (var u = i.suspendedLanes, h = i.pingedLanes, y = i.expirationTimes, x = i.pendingLanes; 0 < x; ) {
      var k = 31 - dn(x), R = 1 << k, N = y[k];
      N === -1 ? ((R & u) === 0 || (R & h) !== 0) && (y[k] = HT(R, o)) : N <= o && (i.expiredLanes |= R), x &= ~R;
    }
  }
  function ic(i) {
    return i = i.pendingLanes & -1073741825, i !== 0 ? i : i & 1073741824 ? 1073741824 : 0;
  }
  function wm() {
    var i = ma;
    return ma <<= 1, (ma & 4194240) === 0 && (ma = 64), i;
  }
  function sc(i) {
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
      var y = 31 - dn(u), x = 1 << y;
      o[y] = 0, h[y] = -1, i[y] = -1, u &= ~x;
    }
  }
  function oc(i, o) {
    var u = i.entangledLanes |= o;
    for (i = i.entanglements; u; ) {
      var h = 31 - dn(u), y = 1 << h;
      y & o | i[h] & o && (i[h] |= o), u &= ~y;
    }
  }
  var Ae = 0;
  function Tm(i) {
    return i &= -i, 1 < i ? 4 < i ? (i & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Am, ac, km, bm, Cm, lc = !1, va = [], Xn = null, Jn = null, er = null, Is = /* @__PURE__ */ new Map(), Ds = /* @__PURE__ */ new Map(), tr = [], GT = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function Pm(i, o) {
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
  function js(i, o, u, h, y, x) {
    return i === null || i.nativeEvent !== x ? (i = { blockedOn: o, domEventName: u, eventSystemFlags: h, nativeEvent: x, targetContainers: [y] }, o !== null && (o = Ys(o), o !== null && ac(o)), i) : (i.eventSystemFlags |= h, o = i.targetContainers, y !== null && o.indexOf(y) === -1 && o.push(y), i);
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
        var x = y.pointerId;
        return Is.set(x, js(Is.get(x) || null, i, o, u, h, y)), !0;
      case "gotpointercapture":
        return x = y.pointerId, Ds.set(x, js(Ds.get(x) || null, i, o, u, h, y)), !0;
    }
    return !1;
  }
  function Em(i) {
    var o = jr(i.target);
    if (o !== null) {
      var u = Dr(o);
      if (u !== null) {
        if (o = u.tag, o === 13) {
          if (o = pm(u), o !== null) {
            i.blockedOn = o, Cm(i.priority, function() {
              km(u);
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
  function _a(i) {
    if (i.blockedOn !== null) return !1;
    for (var o = i.targetContainers; 0 < o.length; ) {
      var u = cc(i.domEventName, i.eventSystemFlags, o[0], i.nativeEvent);
      if (u === null) {
        u = i.nativeEvent;
        var h = new u.constructor(u.type, u);
        Qu = h, u.target.dispatchEvent(h), Qu = null;
      } else return o = Ys(u), o !== null && ac(o), i.blockedOn = u, !1;
      o.shift();
    }
    return !0;
  }
  function Mm(i, o, u) {
    _a(i) && u.delete(o);
  }
  function YT() {
    lc = !1, Xn !== null && _a(Xn) && (Xn = null), Jn !== null && _a(Jn) && (Jn = null), er !== null && _a(er) && (er = null), Is.forEach(Mm), Ds.forEach(Mm);
  }
  function Fs(i, o) {
    i.blockedOn === o && (i.blockedOn = null, lc || (lc = !0, e.unstable_scheduleCallback(e.unstable_NormalPriority, YT)));
  }
  function Os(i) {
    function o(y) {
      return Fs(y, i);
    }
    if (0 < va.length) {
      Fs(va[0], i);
      for (var u = 1; u < va.length; u++) {
        var h = va[u];
        h.blockedOn === i && (h.blockedOn = null);
      }
    }
    for (Xn !== null && Fs(Xn, i), Jn !== null && Fs(Jn, i), er !== null && Fs(er, i), Is.forEach(o), Ds.forEach(o), u = 0; u < tr.length; u++) h = tr[u], h.blockedOn === i && (h.blockedOn = null);
    for (; 0 < tr.length && (u = tr[0], u.blockedOn === null); ) Em(u), u.blockedOn === null && tr.shift();
  }
  var gi = M.ReactCurrentBatchConfig, xa = !0;
  function qT(i, o, u, h) {
    var y = Ae, x = gi.transition;
    gi.transition = null;
    try {
      Ae = 1, uc(i, o, u, h);
    } finally {
      Ae = y, gi.transition = x;
    }
  }
  function QT(i, o, u, h) {
    var y = Ae, x = gi.transition;
    gi.transition = null;
    try {
      Ae = 4, uc(i, o, u, h);
    } finally {
      Ae = y, gi.transition = x;
    }
  }
  function uc(i, o, u, h) {
    if (xa) {
      var y = cc(i, o, u, h);
      if (y === null) Cc(i, o, h, Sa, u), Pm(i, h);
      else if (KT(y, i, o, u, h)) h.stopPropagation();
      else if (Pm(i, h), o & 4 && -1 < GT.indexOf(i)) {
        for (; y !== null; ) {
          var x = Ys(y);
          if (x !== null && Am(x), x = cc(i, o, u, h), x === null && Cc(i, o, h, Sa, u), x === y) break;
          y = x;
        }
        y !== null && h.stopPropagation();
      } else Cc(i, o, h, null, u);
    }
  }
  var Sa = null;
  function cc(i, o, u, h) {
    if (Sa = null, i = Xu(h), i = jr(i), i !== null) if (o = Dr(i), o === null) i = null;
    else if (u = o.tag, u === 13) {
      if (i = pm(o), i !== null) return i;
      i = null;
    } else if (u === 3) {
      if (o.stateNode.current.memoizedState.isDehydrated) return o.tag === 3 ? o.stateNode.containerInfo : null;
      i = null;
    } else o !== i && (i = null);
    return Sa = i, null;
  }
  function Rm(i) {
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
          case rc:
            return 1;
          case xm:
            return 4;
          case ha:
          case zT:
            return 16;
          case Sm:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var nr = null, dc = null, wa = null;
  function Nm() {
    if (wa) return wa;
    var i, o = dc, u = o.length, h, y = "value" in nr ? nr.value : nr.textContent, x = y.length;
    for (i = 0; i < u && o[i] === y[i]; i++) ;
    var k = u - i;
    for (h = 1; h <= k && o[u - h] === y[x - h]; h++) ;
    return wa = y.slice(i, 1 < h ? 1 - h : void 0);
  }
  function Ta(i) {
    var o = i.keyCode;
    return "charCode" in i ? (i = i.charCode, i === 0 && o === 13 && (i = 13)) : i = o, i === 10 && (i = 13), 32 <= i || i === 13 ? i : 0;
  }
  function Aa() {
    return !0;
  }
  function Im() {
    return !1;
  }
  function $t(i) {
    function o(u, h, y, x, k) {
      this._reactName = u, this._targetInst = y, this.type = h, this.nativeEvent = x, this.target = k, this.currentTarget = null;
      for (var R in i) i.hasOwnProperty(R) && (u = i[R], this[R] = u ? u(x) : x[R]);
      return this.isDefaultPrevented = (x.defaultPrevented != null ? x.defaultPrevented : x.returnValue === !1) ? Aa : Im, this.isPropagationStopped = Im, this;
    }
    return Q(o.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var u = this.nativeEvent;
      u && (u.preventDefault ? u.preventDefault() : typeof u.returnValue != "unknown" && (u.returnValue = !1), this.isDefaultPrevented = Aa);
    }, stopPropagation: function() {
      var u = this.nativeEvent;
      u && (u.stopPropagation ? u.stopPropagation() : typeof u.cancelBubble != "unknown" && (u.cancelBubble = !0), this.isPropagationStopped = Aa);
    }, persist: function() {
    }, isPersistent: Aa }), o;
  }
  var yi = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(i) {
    return i.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, fc = $t(yi), Ls = Q({}, yi, { view: 0, detail: 0 }), XT = $t(Ls), hc, pc, zs, ka = Q({}, Ls, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: gc, button: 0, buttons: 0, relatedTarget: function(i) {
    return i.relatedTarget === void 0 ? i.fromElement === i.srcElement ? i.toElement : i.fromElement : i.relatedTarget;
  }, movementX: function(i) {
    return "movementX" in i ? i.movementX : (i !== zs && (zs && i.type === "mousemove" ? (hc = i.screenX - zs.screenX, pc = i.screenY - zs.screenY) : pc = hc = 0, zs = i), hc);
  }, movementY: function(i) {
    return "movementY" in i ? i.movementY : pc;
  } }), Dm = $t(ka), JT = Q({}, ka, { dataTransfer: 0 }), eA = $t(JT), tA = Q({}, Ls, { relatedTarget: 0 }), mc = $t(tA), nA = Q({}, yi, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), rA = $t(nA), iA = Q({}, yi, { clipboardData: function(i) {
    return "clipboardData" in i ? i.clipboardData : window.clipboardData;
  } }), sA = $t(iA), oA = Q({}, yi, { data: 0 }), jm = $t(oA), aA = {
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
  function gc() {
    return cA;
  }
  var dA = Q({}, Ls, { key: function(i) {
    if (i.key) {
      var o = aA[i.key] || i.key;
      if (o !== "Unidentified") return o;
    }
    return i.type === "keypress" ? (i = Ta(i), i === 13 ? "Enter" : String.fromCharCode(i)) : i.type === "keydown" || i.type === "keyup" ? lA[i.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: gc, charCode: function(i) {
    return i.type === "keypress" ? Ta(i) : 0;
  }, keyCode: function(i) {
    return i.type === "keydown" || i.type === "keyup" ? i.keyCode : 0;
  }, which: function(i) {
    return i.type === "keypress" ? Ta(i) : i.type === "keydown" || i.type === "keyup" ? i.keyCode : 0;
  } }), fA = $t(dA), hA = Q({}, ka, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Fm = $t(hA), pA = Q({}, Ls, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: gc }), mA = $t(pA), gA = Q({}, yi, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), yA = $t(gA), vA = Q({}, ka, {
    deltaX: function(i) {
      return "deltaX" in i ? i.deltaX : "wheelDeltaX" in i ? -i.wheelDeltaX : 0;
    },
    deltaY: function(i) {
      return "deltaY" in i ? i.deltaY : "wheelDeltaY" in i ? -i.wheelDeltaY : "wheelDelta" in i ? -i.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), _A = $t(vA), xA = [9, 13, 27, 32], yc = c && "CompositionEvent" in window, $s = null;
  c && "documentMode" in document && ($s = document.documentMode);
  var SA = c && "TextEvent" in window && !$s, Om = c && (!yc || $s && 8 < $s && 11 >= $s), Lm = " ", zm = !1;
  function $m(i, o) {
    switch (i) {
      case "keyup":
        return xA.indexOf(o.keyCode) !== -1;
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
  function Vm(i) {
    return i = i.detail, typeof i == "object" && "data" in i ? i.data : null;
  }
  var vi = !1;
  function wA(i, o) {
    switch (i) {
      case "compositionend":
        return Vm(o);
      case "keypress":
        return o.which !== 32 ? null : (zm = !0, Lm);
      case "textInput":
        return i = o.data, i === Lm && zm ? null : i;
      default:
        return null;
    }
  }
  function TA(i, o) {
    if (vi) return i === "compositionend" || !yc && $m(i, o) ? (i = Nm(), wa = dc = nr = null, vi = !1, i) : null;
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
        return Om && o.locale !== "ko" ? null : o.data;
      default:
        return null;
    }
  }
  var AA = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Bm(i) {
    var o = i && i.nodeName && i.nodeName.toLowerCase();
    return o === "input" ? !!AA[i.type] : o === "textarea";
  }
  function Um(i, o, u, h) {
    um(h), o = Ma(o, "onChange"), 0 < o.length && (u = new fc("onChange", "change", null, u, h), i.push({ event: u, listeners: o }));
  }
  var Vs = null, Bs = null;
  function kA(i) {
    ag(i, 0);
  }
  function ba(i) {
    var o = Ti(i);
    if (Qp(o)) return i;
  }
  function bA(i, o) {
    if (i === "change") return o;
  }
  var Hm = !1;
  if (c) {
    var vc;
    if (c) {
      var _c = "oninput" in document;
      if (!_c) {
        var Wm = document.createElement("div");
        Wm.setAttribute("oninput", "return;"), _c = typeof Wm.oninput == "function";
      }
      vc = _c;
    } else vc = !1;
    Hm = vc && (!document.documentMode || 9 < document.documentMode);
  }
  function Zm() {
    Vs && (Vs.detachEvent("onpropertychange", Gm), Bs = Vs = null);
  }
  function Gm(i) {
    if (i.propertyName === "value" && ba(Bs)) {
      var o = [];
      Um(o, Bs, i, Xu(i)), hm(kA, o);
    }
  }
  function CA(i, o, u) {
    i === "focusin" ? (Zm(), Vs = o, Bs = u, Vs.attachEvent("onpropertychange", Gm)) : i === "focusout" && Zm();
  }
  function PA(i) {
    if (i === "selectionchange" || i === "keyup" || i === "keydown") return ba(Bs);
  }
  function EA(i, o) {
    if (i === "click") return ba(o);
  }
  function MA(i, o) {
    if (i === "input" || i === "change") return ba(o);
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
  function Km(i) {
    for (; i && i.firstChild; ) i = i.firstChild;
    return i;
  }
  function Ym(i, o) {
    var u = Km(i);
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
      u = Km(u);
    }
  }
  function qm(i, o) {
    return i && o ? i === o ? !0 : i && i.nodeType === 3 ? !1 : o && o.nodeType === 3 ? qm(i, o.parentNode) : "contains" in i ? i.contains(o) : i.compareDocumentPosition ? !!(i.compareDocumentPosition(o) & 16) : !1 : !1;
  }
  function Qm() {
    for (var i = window, o = ua(); o instanceof i.HTMLIFrameElement; ) {
      try {
        var u = typeof o.contentWindow.location.href == "string";
      } catch {
        u = !1;
      }
      if (u) i = o.contentWindow;
      else break;
      o = ua(i.document);
    }
    return o;
  }
  function xc(i) {
    var o = i && i.nodeName && i.nodeName.toLowerCase();
    return o && (o === "input" && (i.type === "text" || i.type === "search" || i.type === "tel" || i.type === "url" || i.type === "password") || o === "textarea" || i.contentEditable === "true");
  }
  function NA(i) {
    var o = Qm(), u = i.focusedElem, h = i.selectionRange;
    if (o !== u && u && u.ownerDocument && qm(u.ownerDocument.documentElement, u)) {
      if (h !== null && xc(u)) {
        if (o = h.start, i = h.end, i === void 0 && (i = o), "selectionStart" in u) u.selectionStart = o, u.selectionEnd = Math.min(i, u.value.length);
        else if (i = (o = u.ownerDocument || document) && o.defaultView || window, i.getSelection) {
          i = i.getSelection();
          var y = u.textContent.length, x = Math.min(h.start, y);
          h = h.end === void 0 ? x : Math.min(h.end, y), !i.extend && x > h && (y = h, h = x, x = y), y = Ym(u, x);
          var k = Ym(
            u,
            h
          );
          y && k && (i.rangeCount !== 1 || i.anchorNode !== y.node || i.anchorOffset !== y.offset || i.focusNode !== k.node || i.focusOffset !== k.offset) && (o = o.createRange(), o.setStart(y.node, y.offset), i.removeAllRanges(), x > h ? (i.addRange(o), i.extend(k.node, k.offset)) : (o.setEnd(k.node, k.offset), i.addRange(o)));
        }
      }
      for (o = [], i = u; i = i.parentNode; ) i.nodeType === 1 && o.push({ element: i, left: i.scrollLeft, top: i.scrollTop });
      for (typeof u.focus == "function" && u.focus(), u = 0; u < o.length; u++) i = o[u], i.element.scrollLeft = i.left, i.element.scrollTop = i.top;
    }
  }
  var IA = c && "documentMode" in document && 11 >= document.documentMode, _i = null, Sc = null, Hs = null, wc = !1;
  function Xm(i, o, u) {
    var h = u.window === u ? u.document : u.nodeType === 9 ? u : u.ownerDocument;
    wc || _i == null || _i !== ua(h) || (h = _i, "selectionStart" in h && xc(h) ? h = { start: h.selectionStart, end: h.selectionEnd } : (h = (h.ownerDocument && h.ownerDocument.defaultView || window).getSelection(), h = { anchorNode: h.anchorNode, anchorOffset: h.anchorOffset, focusNode: h.focusNode, focusOffset: h.focusOffset }), Hs && Us(Hs, h) || (Hs = h, h = Ma(Sc, "onSelect"), 0 < h.length && (o = new fc("onSelect", "select", null, o, u), i.push({ event: o, listeners: h }), o.target = _i)));
  }
  function Ca(i, o) {
    var u = {};
    return u[i.toLowerCase()] = o.toLowerCase(), u["Webkit" + i] = "webkit" + o, u["Moz" + i] = "moz" + o, u;
  }
  var xi = { animationend: Ca("Animation", "AnimationEnd"), animationiteration: Ca("Animation", "AnimationIteration"), animationstart: Ca("Animation", "AnimationStart"), transitionend: Ca("Transition", "TransitionEnd") }, Tc = {}, Jm = {};
  c && (Jm = document.createElement("div").style, "AnimationEvent" in window || (delete xi.animationend.animation, delete xi.animationiteration.animation, delete xi.animationstart.animation), "TransitionEvent" in window || delete xi.transitionend.transition);
  function Pa(i) {
    if (Tc[i]) return Tc[i];
    if (!xi[i]) return i;
    var o = xi[i], u;
    for (u in o) if (o.hasOwnProperty(u) && u in Jm) return Tc[i] = o[u];
    return i;
  }
  var eg = Pa("animationend"), tg = Pa("animationiteration"), ng = Pa("animationstart"), rg = Pa("transitionend"), ig = /* @__PURE__ */ new Map(), sg = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function rr(i, o) {
    ig.set(i, o), a(o, [i]);
  }
  for (var Ac = 0; Ac < sg.length; Ac++) {
    var kc = sg[Ac], DA = kc.toLowerCase(), jA = kc[0].toUpperCase() + kc.slice(1);
    rr(DA, "on" + jA);
  }
  rr(eg, "onAnimationEnd"), rr(tg, "onAnimationIteration"), rr(ng, "onAnimationStart"), rr("dblclick", "onDoubleClick"), rr("focusin", "onFocus"), rr("focusout", "onBlur"), rr(rg, "onTransitionEnd"), l("onMouseEnter", ["mouseout", "mouseover"]), l("onMouseLeave", ["mouseout", "mouseover"]), l("onPointerEnter", ["pointerout", "pointerover"]), l("onPointerLeave", ["pointerout", "pointerover"]), a("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), a("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), a("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), a("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), a("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), a("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Ws = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), FA = new Set("cancel close invalid load scroll toggle".split(" ").concat(Ws));
  function og(i, o, u) {
    var h = i.type || "unknown-event";
    i.currentTarget = u, DT(h, o, void 0, i), i.currentTarget = null;
  }
  function ag(i, o) {
    o = (o & 4) !== 0;
    for (var u = 0; u < i.length; u++) {
      var h = i[u], y = h.event;
      h = h.listeners;
      e: {
        var x = void 0;
        if (o) for (var k = h.length - 1; 0 <= k; k--) {
          var R = h[k], N = R.instance, B = R.currentTarget;
          if (R = R.listener, N !== x && y.isPropagationStopped()) break e;
          og(y, R, B), x = N;
        }
        else for (k = 0; k < h.length; k++) {
          if (R = h[k], N = R.instance, B = R.currentTarget, R = R.listener, N !== x && y.isPropagationStopped()) break e;
          og(y, R, B), x = N;
        }
      }
    }
    if (fa) throw i = nc, fa = !1, nc = null, i;
  }
  function Ne(i, o) {
    var u = o[Ic];
    u === void 0 && (u = o[Ic] = /* @__PURE__ */ new Set());
    var h = i + "__bubble";
    u.has(h) || (lg(o, i, 2, !1), u.add(h));
  }
  function bc(i, o, u) {
    var h = 0;
    o && (h |= 4), lg(u, i, h, o);
  }
  var Ea = "_reactListening" + Math.random().toString(36).slice(2);
  function Zs(i) {
    if (!i[Ea]) {
      i[Ea] = !0, r.forEach(function(u) {
        u !== "selectionchange" && (FA.has(u) || bc(u, !1, i), bc(u, !0, i));
      });
      var o = i.nodeType === 9 ? i : i.ownerDocument;
      o === null || o[Ea] || (o[Ea] = !0, bc("selectionchange", !1, o));
    }
  }
  function lg(i, o, u, h) {
    switch (Rm(o)) {
      case 1:
        var y = qT;
        break;
      case 4:
        y = QT;
        break;
      default:
        y = uc;
    }
    u = y.bind(null, o, u, i), y = void 0, !tc || o !== "touchstart" && o !== "touchmove" && o !== "wheel" || (y = !0), h ? y !== void 0 ? i.addEventListener(o, u, { capture: !0, passive: y }) : i.addEventListener(o, u, !0) : y !== void 0 ? i.addEventListener(o, u, { passive: y }) : i.addEventListener(o, u, !1);
  }
  function Cc(i, o, u, h, y) {
    var x = h;
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
          if (k = jr(R), k === null) return;
          if (N = k.tag, N === 5 || N === 6) {
            h = x = k;
            continue e;
          }
          R = R.parentNode;
        }
      }
      h = h.return;
    }
    hm(function() {
      var B = x, G = Xu(u), K = [];
      e: {
        var Z = ig.get(i);
        if (Z !== void 0) {
          var te = fc, se = i;
          switch (i) {
            case "keypress":
              if (Ta(u) === 0) break e;
            case "keydown":
            case "keyup":
              te = fA;
              break;
            case "focusin":
              se = "focus", te = mc;
              break;
            case "focusout":
              se = "blur", te = mc;
              break;
            case "beforeblur":
            case "afterblur":
              te = mc;
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
              te = Dm;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              te = eA;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              te = mA;
              break;
            case eg:
            case tg:
            case ng:
              te = rA;
              break;
            case rg:
              te = yA;
              break;
            case "scroll":
              te = XT;
              break;
            case "wheel":
              te = _A;
              break;
            case "copy":
            case "cut":
            case "paste":
              te = sA;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              te = Fm;
          }
          var le = (o & 4) !== 0, Ke = !le && i === "scroll", z = le ? Z !== null ? Z + "Capture" : null : Z;
          le = [];
          for (var j = B, V; j !== null; ) {
            V = j;
            var Y = V.stateNode;
            if (V.tag === 5 && Y !== null && (V = Y, z !== null && (Y = Ps(j, z), Y != null && le.push(Gs(j, Y, V)))), Ke) break;
            j = j.return;
          }
          0 < le.length && (Z = new te(Z, se, null, u, G), K.push({ event: Z, listeners: le }));
        }
      }
      if ((o & 7) === 0) {
        e: {
          if (Z = i === "mouseover" || i === "pointerover", te = i === "mouseout" || i === "pointerout", Z && u !== Qu && (se = u.relatedTarget || u.fromElement) && (jr(se) || se[On])) break e;
          if ((te || Z) && (Z = G.window === G ? G : (Z = G.ownerDocument) ? Z.defaultView || Z.parentWindow : window, te ? (se = u.relatedTarget || u.toElement, te = B, se = se ? jr(se) : null, se !== null && (Ke = Dr(se), se !== Ke || se.tag !== 5 && se.tag !== 6) && (se = null)) : (te = null, se = B), te !== se)) {
            if (le = Dm, Y = "onMouseLeave", z = "onMouseEnter", j = "mouse", (i === "pointerout" || i === "pointerover") && (le = Fm, Y = "onPointerLeave", z = "onPointerEnter", j = "pointer"), Ke = te == null ? Z : Ti(te), V = se == null ? Z : Ti(se), Z = new le(Y, j + "leave", te, u, G), Z.target = Ke, Z.relatedTarget = V, Y = null, jr(G) === B && (le = new le(z, j + "enter", se, u, G), le.target = V, le.relatedTarget = Ke, Y = le), Ke = Y, te && se) t: {
              for (le = te, z = se, j = 0, V = le; V; V = Si(V)) j++;
              for (V = 0, Y = z; Y; Y = Si(Y)) V++;
              for (; 0 < j - V; ) le = Si(le), j--;
              for (; 0 < V - j; ) z = Si(z), V--;
              for (; j--; ) {
                if (le === z || z !== null && le === z.alternate) break t;
                le = Si(le), z = Si(z);
              }
              le = null;
            }
            else le = null;
            te !== null && ug(K, Z, te, le, !1), se !== null && Ke !== null && ug(K, Ke, se, le, !0);
          }
        }
        e: {
          if (Z = B ? Ti(B) : window, te = Z.nodeName && Z.nodeName.toLowerCase(), te === "select" || te === "input" && Z.type === "file") var ue = bA;
          else if (Bm(Z)) if (Hm) ue = MA;
          else {
            ue = PA;
            var he = CA;
          }
          else (te = Z.nodeName) && te.toLowerCase() === "input" && (Z.type === "checkbox" || Z.type === "radio") && (ue = EA);
          if (ue && (ue = ue(i, B))) {
            Um(K, ue, u, G);
            break e;
          }
          he && he(i, Z, B), i === "focusout" && (he = Z._wrapperState) && he.controlled && Z.type === "number" && Zu(Z, "number", Z.value);
        }
        switch (he = B ? Ti(B) : window, i) {
          case "focusin":
            (Bm(he) || he.contentEditable === "true") && (_i = he, Sc = B, Hs = null);
            break;
          case "focusout":
            Hs = Sc = _i = null;
            break;
          case "mousedown":
            wc = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            wc = !1, Xm(K, u, G);
            break;
          case "selectionchange":
            if (IA) break;
          case "keydown":
          case "keyup":
            Xm(K, u, G);
        }
        var pe;
        if (yc) e: {
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
        else vi ? $m(i, u) && (ye = "onCompositionEnd") : i === "keydown" && u.keyCode === 229 && (ye = "onCompositionStart");
        ye && (Om && u.locale !== "ko" && (vi || ye !== "onCompositionStart" ? ye === "onCompositionEnd" && vi && (pe = Nm()) : (nr = G, dc = "value" in nr ? nr.value : nr.textContent, vi = !0)), he = Ma(B, ye), 0 < he.length && (ye = new jm(ye, i, null, u, G), K.push({ event: ye, listeners: he }), pe ? ye.data = pe : (pe = Vm(u), pe !== null && (ye.data = pe)))), (pe = SA ? wA(i, u) : TA(i, u)) && (B = Ma(B, "onBeforeInput"), 0 < B.length && (G = new jm("onBeforeInput", "beforeinput", null, u, G), K.push({ event: G, listeners: B }), G.data = pe));
      }
      ag(K, o);
    });
  }
  function Gs(i, o, u) {
    return { instance: i, listener: o, currentTarget: u };
  }
  function Ma(i, o) {
    for (var u = o + "Capture", h = []; i !== null; ) {
      var y = i, x = y.stateNode;
      y.tag === 5 && x !== null && (y = x, x = Ps(i, u), x != null && h.unshift(Gs(i, x, y)), x = Ps(i, o), x != null && h.push(Gs(i, x, y))), i = i.return;
    }
    return h;
  }
  function Si(i) {
    if (i === null) return null;
    do
      i = i.return;
    while (i && i.tag !== 5);
    return i || null;
  }
  function ug(i, o, u, h, y) {
    for (var x = o._reactName, k = []; u !== null && u !== h; ) {
      var R = u, N = R.alternate, B = R.stateNode;
      if (N !== null && N === h) break;
      R.tag === 5 && B !== null && (R = B, y ? (N = Ps(u, x), N != null && k.unshift(Gs(u, N, R))) : y || (N = Ps(u, x), N != null && k.push(Gs(u, N, R)))), u = u.return;
    }
    k.length !== 0 && i.push({ event: o, listeners: k });
  }
  var OA = /\r\n?/g, LA = /\u0000|\uFFFD/g;
  function cg(i) {
    return (typeof i == "string" ? i : "" + i).replace(OA, `
`).replace(LA, "");
  }
  function Ra(i, o, u) {
    if (o = cg(o), cg(i) !== o && u) throw Error(n(425));
  }
  function Na() {
  }
  var Pc = null, Ec = null;
  function Mc(i, o) {
    return i === "textarea" || i === "noscript" || typeof o.children == "string" || typeof o.children == "number" || typeof o.dangerouslySetInnerHTML == "object" && o.dangerouslySetInnerHTML !== null && o.dangerouslySetInnerHTML.__html != null;
  }
  var Rc = typeof setTimeout == "function" ? setTimeout : void 0, zA = typeof clearTimeout == "function" ? clearTimeout : void 0, dg = typeof Promise == "function" ? Promise : void 0, $A = typeof queueMicrotask == "function" ? queueMicrotask : typeof dg < "u" ? function(i) {
    return dg.resolve(null).then(i).catch(VA);
  } : Rc;
  function VA(i) {
    setTimeout(function() {
      throw i;
    });
  }
  function Nc(i, o) {
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
  function fg(i) {
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
  var wi = Math.random().toString(36).slice(2), Tn = "__reactFiber$" + wi, Ks = "__reactProps$" + wi, On = "__reactContainer$" + wi, Ic = "__reactEvents$" + wi, BA = "__reactListeners$" + wi, UA = "__reactHandles$" + wi;
  function jr(i) {
    var o = i[Tn];
    if (o) return o;
    for (var u = i.parentNode; u; ) {
      if (o = u[On] || u[Tn]) {
        if (u = o.alternate, o.child !== null || u !== null && u.child !== null) for (i = fg(i); i !== null; ) {
          if (u = i[Tn]) return u;
          i = fg(i);
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
  function Ti(i) {
    if (i.tag === 5 || i.tag === 6) return i.stateNode;
    throw Error(n(33));
  }
  function Ia(i) {
    return i[Ks] || null;
  }
  var Dc = [], Ai = -1;
  function sr(i) {
    return { current: i };
  }
  function Ie(i) {
    0 > Ai || (i.current = Dc[Ai], Dc[Ai] = null, Ai--);
  }
  function Me(i, o) {
    Ai++, Dc[Ai] = i.current, i.current = o;
  }
  var or = {}, pt = sr(or), bt = sr(!1), Fr = or;
  function ki(i, o) {
    var u = i.type.contextTypes;
    if (!u) return or;
    var h = i.stateNode;
    if (h && h.__reactInternalMemoizedUnmaskedChildContext === o) return h.__reactInternalMemoizedMaskedChildContext;
    var y = {}, x;
    for (x in u) y[x] = o[x];
    return h && (i = i.stateNode, i.__reactInternalMemoizedUnmaskedChildContext = o, i.__reactInternalMemoizedMaskedChildContext = y), y;
  }
  function Ct(i) {
    return i = i.childContextTypes, i != null;
  }
  function Da() {
    Ie(bt), Ie(pt);
  }
  function hg(i, o, u) {
    if (pt.current !== or) throw Error(n(168));
    Me(pt, o), Me(bt, u);
  }
  function pg(i, o, u) {
    var h = i.stateNode;
    if (o = o.childContextTypes, typeof h.getChildContext != "function") return u;
    h = h.getChildContext();
    for (var y in h) if (!(y in o)) throw Error(n(108, ke(i) || "Unknown", y));
    return Q({}, u, h);
  }
  function ja(i) {
    return i = (i = i.stateNode) && i.__reactInternalMemoizedMergedChildContext || or, Fr = pt.current, Me(pt, i), Me(bt, bt.current), !0;
  }
  function mg(i, o, u) {
    var h = i.stateNode;
    if (!h) throw Error(n(169));
    u ? (i = pg(i, o, Fr), h.__reactInternalMemoizedMergedChildContext = i, Ie(bt), Ie(pt), Me(pt, i)) : Ie(bt), Me(bt, u);
  }
  var Ln = null, Fa = !1, jc = !1;
  function gg(i) {
    Ln === null ? Ln = [i] : Ln.push(i);
  }
  function HA(i) {
    Fa = !0, gg(i);
  }
  function ar() {
    if (!jc && Ln !== null) {
      jc = !0;
      var i = 0, o = Ae;
      try {
        var u = Ln;
        for (Ae = 1; i < u.length; i++) {
          var h = u[i];
          do
            h = h(!0);
          while (h !== null);
        }
        Ln = null, Fa = !1;
      } catch (y) {
        throw Ln !== null && (Ln = Ln.slice(i + 1)), vm(rc, ar), y;
      } finally {
        Ae = o, jc = !1;
      }
    }
    return null;
  }
  var bi = [], Ci = 0, Oa = null, La = 0, Qt = [], Xt = 0, Or = null, zn = 1, $n = "";
  function Lr(i, o) {
    bi[Ci++] = La, bi[Ci++] = Oa, Oa = i, La = o;
  }
  function yg(i, o, u) {
    Qt[Xt++] = zn, Qt[Xt++] = $n, Qt[Xt++] = Or, Or = i;
    var h = zn;
    i = $n;
    var y = 32 - dn(h) - 1;
    h &= ~(1 << y), u += 1;
    var x = 32 - dn(o) + y;
    if (30 < x) {
      var k = y - y % 5;
      x = (h & (1 << k) - 1).toString(32), h >>= k, y -= k, zn = 1 << 32 - dn(o) + y | u << y | h, $n = x + i;
    } else zn = 1 << x | u << y | h, $n = i;
  }
  function Fc(i) {
    i.return !== null && (Lr(i, 1), yg(i, 1, 0));
  }
  function Oc(i) {
    for (; i === Oa; ) Oa = bi[--Ci], bi[Ci] = null, La = bi[--Ci], bi[Ci] = null;
    for (; i === Or; ) Or = Qt[--Xt], Qt[Xt] = null, $n = Qt[--Xt], Qt[Xt] = null, zn = Qt[--Xt], Qt[Xt] = null;
  }
  var Vt = null, Bt = null, je = !1, hn = null;
  function vg(i, o) {
    var u = nn(5, null, null, 0);
    u.elementType = "DELETED", u.stateNode = o, u.return = i, o = i.deletions, o === null ? (i.deletions = [u], i.flags |= 16) : o.push(u);
  }
  function _g(i, o) {
    switch (i.tag) {
      case 5:
        var u = i.type;
        return o = o.nodeType !== 1 || u.toLowerCase() !== o.nodeName.toLowerCase() ? null : o, o !== null ? (i.stateNode = o, Vt = i, Bt = ir(o.firstChild), !0) : !1;
      case 6:
        return o = i.pendingProps === "" || o.nodeType !== 3 ? null : o, o !== null ? (i.stateNode = o, Vt = i, Bt = null, !0) : !1;
      case 13:
        return o = o.nodeType !== 8 ? null : o, o !== null ? (u = Or !== null ? { id: zn, overflow: $n } : null, i.memoizedState = { dehydrated: o, treeContext: u, retryLane: 1073741824 }, u = nn(18, null, null, 0), u.stateNode = o, u.return = i, i.child = u, Vt = i, Bt = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Lc(i) {
    return (i.mode & 1) !== 0 && (i.flags & 128) === 0;
  }
  function zc(i) {
    if (je) {
      var o = Bt;
      if (o) {
        var u = o;
        if (!_g(i, o)) {
          if (Lc(i)) throw Error(n(418));
          o = ir(u.nextSibling);
          var h = Vt;
          o && _g(i, o) ? vg(h, u) : (i.flags = i.flags & -4097 | 2, je = !1, Vt = i);
        }
      } else {
        if (Lc(i)) throw Error(n(418));
        i.flags = i.flags & -4097 | 2, je = !1, Vt = i;
      }
    }
  }
  function xg(i) {
    for (i = i.return; i !== null && i.tag !== 5 && i.tag !== 3 && i.tag !== 13; ) i = i.return;
    Vt = i;
  }
  function za(i) {
    if (i !== Vt) return !1;
    if (!je) return xg(i), je = !0, !1;
    var o;
    if ((o = i.tag !== 3) && !(o = i.tag !== 5) && (o = i.type, o = o !== "head" && o !== "body" && !Mc(i.type, i.memoizedProps)), o && (o = Bt)) {
      if (Lc(i)) throw Sg(), Error(n(418));
      for (; o; ) vg(i, o), o = ir(o.nextSibling);
    }
    if (xg(i), i.tag === 13) {
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
  function Sg() {
    for (var i = Bt; i; ) i = ir(i.nextSibling);
  }
  function Pi() {
    Bt = Vt = null, je = !1;
  }
  function $c(i) {
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
        var y = h, x = "" + i;
        return o !== null && o.ref !== null && typeof o.ref == "function" && o.ref._stringRef === x ? o.ref : (o = function(k) {
          var R = y.refs;
          k === null ? delete R[x] : R[x] = k;
        }, o._stringRef = x, o);
      }
      if (typeof i != "string") throw Error(n(284));
      if (!u._owner) throw Error(n(290, i));
    }
    return i;
  }
  function $a(i, o) {
    throw i = Object.prototype.toString.call(o), Error(n(31, i === "[object Object]" ? "object with keys {" + Object.keys(o).join(", ") + "}" : i));
  }
  function wg(i) {
    var o = i._init;
    return o(i._payload);
  }
  function Tg(i) {
    function o(z, j) {
      if (i) {
        var V = z.deletions;
        V === null ? (z.deletions = [j], z.flags |= 16) : V.push(j);
      }
    }
    function u(z, j) {
      if (!i) return null;
      for (; j !== null; ) o(z, j), j = j.sibling;
      return null;
    }
    function h(z, j) {
      for (z = /* @__PURE__ */ new Map(); j !== null; ) j.key !== null ? z.set(j.key, j) : z.set(j.index, j), j = j.sibling;
      return z;
    }
    function y(z, j) {
      return z = mr(z, j), z.index = 0, z.sibling = null, z;
    }
    function x(z, j, V) {
      return z.index = V, i ? (V = z.alternate, V !== null ? (V = V.index, V < j ? (z.flags |= 2, j) : V) : (z.flags |= 2, j)) : (z.flags |= 1048576, j);
    }
    function k(z) {
      return i && z.alternate === null && (z.flags |= 2), z;
    }
    function R(z, j, V, Y) {
      return j === null || j.tag !== 6 ? (j = Rd(V, z.mode, Y), j.return = z, j) : (j = y(j, V), j.return = z, j);
    }
    function N(z, j, V, Y) {
      var ue = V.type;
      return ue === I ? G(z, j, V.props.children, Y, V.key) : j !== null && (j.elementType === ue || typeof ue == "object" && ue !== null && ue.$$typeof === ce && wg(ue) === j.type) ? (Y = y(j, V.props), Y.ref = qs(z, j, V), Y.return = z, Y) : (Y = cl(V.type, V.key, V.props, null, z.mode, Y), Y.ref = qs(z, j, V), Y.return = z, Y);
    }
    function B(z, j, V, Y) {
      return j === null || j.tag !== 4 || j.stateNode.containerInfo !== V.containerInfo || j.stateNode.implementation !== V.implementation ? (j = Nd(V, z.mode, Y), j.return = z, j) : (j = y(j, V.children || []), j.return = z, j);
    }
    function G(z, j, V, Y, ue) {
      return j === null || j.tag !== 7 ? (j = Zr(V, z.mode, Y, ue), j.return = z, j) : (j = y(j, V), j.return = z, j);
    }
    function K(z, j, V) {
      if (typeof j == "string" && j !== "" || typeof j == "number") return j = Rd("" + j, z.mode, V), j.return = z, j;
      if (typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case C:
            return V = cl(j.type, j.key, j.props, null, z.mode, V), V.ref = qs(z, null, j), V.return = z, V;
          case $:
            return j = Nd(j, z.mode, V), j.return = z, j;
          case ce:
            var Y = j._init;
            return K(z, Y(j._payload), V);
        }
        if (ks(j) || J(j)) return j = Zr(j, z.mode, V, null), j.return = z, j;
        $a(z, j);
      }
      return null;
    }
    function Z(z, j, V, Y) {
      var ue = j !== null ? j.key : null;
      if (typeof V == "string" && V !== "" || typeof V == "number") return ue !== null ? null : R(z, j, "" + V, Y);
      if (typeof V == "object" && V !== null) {
        switch (V.$$typeof) {
          case C:
            return V.key === ue ? N(z, j, V, Y) : null;
          case $:
            return V.key === ue ? B(z, j, V, Y) : null;
          case ce:
            return ue = V._init, Z(
              z,
              j,
              ue(V._payload),
              Y
            );
        }
        if (ks(V) || J(V)) return ue !== null ? null : G(z, j, V, Y, null);
        $a(z, V);
      }
      return null;
    }
    function te(z, j, V, Y, ue) {
      if (typeof Y == "string" && Y !== "" || typeof Y == "number") return z = z.get(V) || null, R(j, z, "" + Y, ue);
      if (typeof Y == "object" && Y !== null) {
        switch (Y.$$typeof) {
          case C:
            return z = z.get(Y.key === null ? V : Y.key) || null, N(j, z, Y, ue);
          case $:
            return z = z.get(Y.key === null ? V : Y.key) || null, B(j, z, Y, ue);
          case ce:
            var he = Y._init;
            return te(z, j, V, he(Y._payload), ue);
        }
        if (ks(Y) || J(Y)) return z = z.get(V) || null, G(j, z, Y, ue, null);
        $a(j, Y);
      }
      return null;
    }
    function se(z, j, V, Y) {
      for (var ue = null, he = null, pe = j, ye = j = 0, ot = null; pe !== null && ye < V.length; ye++) {
        pe.index > ye ? (ot = pe, pe = null) : ot = pe.sibling;
        var we = Z(z, pe, V[ye], Y);
        if (we === null) {
          pe === null && (pe = ot);
          break;
        }
        i && pe && we.alternate === null && o(z, pe), j = x(we, j, ye), he === null ? ue = we : he.sibling = we, he = we, pe = ot;
      }
      if (ye === V.length) return u(z, pe), je && Lr(z, ye), ue;
      if (pe === null) {
        for (; ye < V.length; ye++) pe = K(z, V[ye], Y), pe !== null && (j = x(pe, j, ye), he === null ? ue = pe : he.sibling = pe, he = pe);
        return je && Lr(z, ye), ue;
      }
      for (pe = h(z, pe); ye < V.length; ye++) ot = te(pe, z, ye, V[ye], Y), ot !== null && (i && ot.alternate !== null && pe.delete(ot.key === null ? ye : ot.key), j = x(ot, j, ye), he === null ? ue = ot : he.sibling = ot, he = ot);
      return i && pe.forEach(function(gr) {
        return o(z, gr);
      }), je && Lr(z, ye), ue;
    }
    function le(z, j, V, Y) {
      var ue = J(V);
      if (typeof ue != "function") throw Error(n(150));
      if (V = ue.call(V), V == null) throw Error(n(151));
      for (var he = ue = null, pe = j, ye = j = 0, ot = null, we = V.next(); pe !== null && !we.done; ye++, we = V.next()) {
        pe.index > ye ? (ot = pe, pe = null) : ot = pe.sibling;
        var gr = Z(z, pe, we.value, Y);
        if (gr === null) {
          pe === null && (pe = ot);
          break;
        }
        i && pe && gr.alternate === null && o(z, pe), j = x(gr, j, ye), he === null ? ue = gr : he.sibling = gr, he = gr, pe = ot;
      }
      if (we.done) return u(
        z,
        pe
      ), je && Lr(z, ye), ue;
      if (pe === null) {
        for (; !we.done; ye++, we = V.next()) we = K(z, we.value, Y), we !== null && (j = x(we, j, ye), he === null ? ue = we : he.sibling = we, he = we);
        return je && Lr(z, ye), ue;
      }
      for (pe = h(z, pe); !we.done; ye++, we = V.next()) we = te(pe, z, ye, we.value, Y), we !== null && (i && we.alternate !== null && pe.delete(we.key === null ? ye : we.key), j = x(we, j, ye), he === null ? ue = we : he.sibling = we, he = we);
      return i && pe.forEach(function(Ak) {
        return o(z, Ak);
      }), je && Lr(z, ye), ue;
    }
    function Ke(z, j, V, Y) {
      if (typeof V == "object" && V !== null && V.type === I && V.key === null && (V = V.props.children), typeof V == "object" && V !== null) {
        switch (V.$$typeof) {
          case C:
            e: {
              for (var ue = V.key, he = j; he !== null; ) {
                if (he.key === ue) {
                  if (ue = V.type, ue === I) {
                    if (he.tag === 7) {
                      u(z, he.sibling), j = y(he, V.props.children), j.return = z, z = j;
                      break e;
                    }
                  } else if (he.elementType === ue || typeof ue == "object" && ue !== null && ue.$$typeof === ce && wg(ue) === he.type) {
                    u(z, he.sibling), j = y(he, V.props), j.ref = qs(z, he, V), j.return = z, z = j;
                    break e;
                  }
                  u(z, he);
                  break;
                } else o(z, he);
                he = he.sibling;
              }
              V.type === I ? (j = Zr(V.props.children, z.mode, Y, V.key), j.return = z, z = j) : (Y = cl(V.type, V.key, V.props, null, z.mode, Y), Y.ref = qs(z, j, V), Y.return = z, z = Y);
            }
            return k(z);
          case $:
            e: {
              for (he = V.key; j !== null; ) {
                if (j.key === he) if (j.tag === 4 && j.stateNode.containerInfo === V.containerInfo && j.stateNode.implementation === V.implementation) {
                  u(z, j.sibling), j = y(j, V.children || []), j.return = z, z = j;
                  break e;
                } else {
                  u(z, j);
                  break;
                }
                else o(z, j);
                j = j.sibling;
              }
              j = Nd(V, z.mode, Y), j.return = z, z = j;
            }
            return k(z);
          case ce:
            return he = V._init, Ke(z, j, he(V._payload), Y);
        }
        if (ks(V)) return se(z, j, V, Y);
        if (J(V)) return le(z, j, V, Y);
        $a(z, V);
      }
      return typeof V == "string" && V !== "" || typeof V == "number" ? (V = "" + V, j !== null && j.tag === 6 ? (u(z, j.sibling), j = y(j, V), j.return = z, z = j) : (u(z, j), j = Rd(V, z.mode, Y), j.return = z, z = j), k(z)) : u(z, j);
    }
    return Ke;
  }
  var Ei = Tg(!0), Ag = Tg(!1), Va = sr(null), Ba = null, Mi = null, Vc = null;
  function Bc() {
    Vc = Mi = Ba = null;
  }
  function Uc(i) {
    var o = Va.current;
    Ie(Va), i._currentValue = o;
  }
  function Hc(i, o, u) {
    for (; i !== null; ) {
      var h = i.alternate;
      if ((i.childLanes & o) !== o ? (i.childLanes |= o, h !== null && (h.childLanes |= o)) : h !== null && (h.childLanes & o) !== o && (h.childLanes |= o), i === u) break;
      i = i.return;
    }
  }
  function Ri(i, o) {
    Ba = i, Vc = Mi = null, i = i.dependencies, i !== null && i.firstContext !== null && ((i.lanes & o) !== 0 && (Pt = !0), i.firstContext = null);
  }
  function Jt(i) {
    var o = i._currentValue;
    if (Vc !== i) if (i = { context: i, memoizedValue: o, next: null }, Mi === null) {
      if (Ba === null) throw Error(n(308));
      Mi = i, Ba.dependencies = { lanes: 0, firstContext: i };
    } else Mi = Mi.next = i;
    return o;
  }
  var zr = null;
  function Wc(i) {
    zr === null ? zr = [i] : zr.push(i);
  }
  function kg(i, o, u, h) {
    var y = o.interleaved;
    return y === null ? (u.next = u, Wc(o)) : (u.next = y.next, y.next = u), o.interleaved = u, Vn(i, h);
  }
  function Vn(i, o) {
    i.lanes |= o;
    var u = i.alternate;
    for (u !== null && (u.lanes |= o), u = i, i = i.return; i !== null; ) i.childLanes |= o, u = i.alternate, u !== null && (u.childLanes |= o), u = i, i = i.return;
    return u.tag === 3 ? u.stateNode : null;
  }
  var lr = !1;
  function Zc(i) {
    i.updateQueue = { baseState: i.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function bg(i, o) {
    i = i.updateQueue, o.updateQueue === i && (o.updateQueue = { baseState: i.baseState, firstBaseUpdate: i.firstBaseUpdate, lastBaseUpdate: i.lastBaseUpdate, shared: i.shared, effects: i.effects });
  }
  function Bn(i, o) {
    return { eventTime: i, lane: o, tag: 0, payload: null, callback: null, next: null };
  }
  function ur(i, o, u) {
    var h = i.updateQueue;
    if (h === null) return null;
    if (h = h.shared, (Se & 2) !== 0) {
      var y = h.pending;
      return y === null ? o.next = o : (o.next = y.next, y.next = o), h.pending = o, Vn(i, u);
    }
    return y = h.interleaved, y === null ? (o.next = o, Wc(h)) : (o.next = y.next, y.next = o), h.interleaved = o, Vn(i, u);
  }
  function Ua(i, o, u) {
    if (o = o.updateQueue, o !== null && (o = o.shared, (u & 4194240) !== 0)) {
      var h = o.lanes;
      h &= i.pendingLanes, u |= h, o.lanes = u, oc(i, u);
    }
  }
  function Cg(i, o) {
    var u = i.updateQueue, h = i.alternate;
    if (h !== null && (h = h.updateQueue, u === h)) {
      var y = null, x = null;
      if (u = u.firstBaseUpdate, u !== null) {
        do {
          var k = { eventTime: u.eventTime, lane: u.lane, tag: u.tag, payload: u.payload, callback: u.callback, next: null };
          x === null ? y = x = k : x = x.next = k, u = u.next;
        } while (u !== null);
        x === null ? y = x = o : x = x.next = o;
      } else y = x = o;
      u = { baseState: h.baseState, firstBaseUpdate: y, lastBaseUpdate: x, shared: h.shared, effects: h.effects }, i.updateQueue = u;
      return;
    }
    i = u.lastBaseUpdate, i === null ? u.firstBaseUpdate = o : i.next = o, u.lastBaseUpdate = o;
  }
  function Ha(i, o, u, h) {
    var y = i.updateQueue;
    lr = !1;
    var x = y.firstBaseUpdate, k = y.lastBaseUpdate, R = y.shared.pending;
    if (R !== null) {
      y.shared.pending = null;
      var N = R, B = N.next;
      N.next = null, k === null ? x = B : k.next = B, k = N;
      var G = i.alternate;
      G !== null && (G = G.updateQueue, R = G.lastBaseUpdate, R !== k && (R === null ? G.firstBaseUpdate = B : R.next = B, G.lastBaseUpdate = N));
    }
    if (x !== null) {
      var K = y.baseState;
      k = 0, G = B = N = null, R = x;
      do {
        var Z = R.lane, te = R.eventTime;
        if ((h & Z) === Z) {
          G !== null && (G = G.next = {
            eventTime: te,
            lane: 0,
            tag: R.tag,
            payload: R.payload,
            callback: R.callback,
            next: null
          });
          e: {
            var se = i, le = R;
            switch (Z = o, te = u, le.tag) {
              case 1:
                if (se = le.payload, typeof se == "function") {
                  K = se.call(te, K, Z);
                  break e;
                }
                K = se;
                break e;
              case 3:
                se.flags = se.flags & -65537 | 128;
              case 0:
                if (se = le.payload, Z = typeof se == "function" ? se.call(te, K, Z) : se, Z == null) break e;
                K = Q({}, K, Z);
                break e;
              case 2:
                lr = !0;
            }
          }
          R.callback !== null && R.lane !== 0 && (i.flags |= 64, Z = y.effects, Z === null ? y.effects = [R] : Z.push(R));
        } else te = { eventTime: te, lane: Z, tag: R.tag, payload: R.payload, callback: R.callback, next: null }, G === null ? (B = G = te, N = K) : G = G.next = te, k |= Z;
        if (R = R.next, R === null) {
          if (R = y.shared.pending, R === null) break;
          Z = R, R = Z.next, Z.next = null, y.lastBaseUpdate = Z, y.shared.pending = null;
        }
      } while (!0);
      if (G === null && (N = K), y.baseState = N, y.firstBaseUpdate = B, y.lastBaseUpdate = G, o = y.shared.interleaved, o !== null) {
        y = o;
        do
          k |= y.lane, y = y.next;
        while (y !== o);
      } else x === null && (y.shared.lanes = 0);
      Br |= k, i.lanes = k, i.memoizedState = K;
    }
  }
  function Pg(i, o, u) {
    if (i = o.effects, o.effects = null, i !== null) for (o = 0; o < i.length; o++) {
      var h = i[o], y = h.callback;
      if (y !== null) {
        if (h.callback = null, h = u, typeof y != "function") throw Error(n(191, y));
        y.call(h);
      }
    }
  }
  var Qs = {}, An = sr(Qs), Xs = sr(Qs), Js = sr(Qs);
  function $r(i) {
    if (i === Qs) throw Error(n(174));
    return i;
  }
  function Gc(i, o) {
    switch (Me(Js, o), Me(Xs, i), Me(An, Qs), i = o.nodeType, i) {
      case 9:
      case 11:
        o = (o = o.documentElement) ? o.namespaceURI : Ku(null, "");
        break;
      default:
        i = i === 8 ? o.parentNode : o, o = i.namespaceURI || null, i = i.tagName, o = Ku(o, i);
    }
    Ie(An), Me(An, o);
  }
  function Ni() {
    Ie(An), Ie(Xs), Ie(Js);
  }
  function Eg(i) {
    $r(Js.current);
    var o = $r(An.current), u = Ku(o, i.type);
    o !== u && (Me(Xs, i), Me(An, u));
  }
  function Kc(i) {
    Xs.current === i && (Ie(An), Ie(Xs));
  }
  var Le = sr(0);
  function Wa(i) {
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
  var Yc = [];
  function qc() {
    for (var i = 0; i < Yc.length; i++) Yc[i]._workInProgressVersionPrimary = null;
    Yc.length = 0;
  }
  var Za = M.ReactCurrentDispatcher, Qc = M.ReactCurrentBatchConfig, Vr = 0, ze = null, et = null, it = null, Ga = !1, eo = !1, to = 0, ZA = 0;
  function mt() {
    throw Error(n(321));
  }
  function Xc(i, o) {
    if (o === null) return !1;
    for (var u = 0; u < o.length && u < i.length; u++) if (!fn(i[u], o[u])) return !1;
    return !0;
  }
  function Jc(i, o, u, h, y, x) {
    if (Vr = x, ze = o, o.memoizedState = null, o.updateQueue = null, o.lanes = 0, Za.current = i === null || i.memoizedState === null ? qA : QA, i = u(h, y), eo) {
      x = 0;
      do {
        if (eo = !1, to = 0, 25 <= x) throw Error(n(301));
        x += 1, it = et = null, o.updateQueue = null, Za.current = XA, i = u(h, y);
      } while (eo);
    }
    if (Za.current = qa, o = et !== null && et.next !== null, Vr = 0, it = et = ze = null, Ga = !1, o) throw Error(n(300));
    return i;
  }
  function ed() {
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
  function td(i) {
    var o = en(), u = o.queue;
    if (u === null) throw Error(n(311));
    u.lastRenderedReducer = i;
    var h = et, y = h.baseQueue, x = u.pending;
    if (x !== null) {
      if (y !== null) {
        var k = y.next;
        y.next = x.next, x.next = k;
      }
      h.baseQueue = y = x, u.pending = null;
    }
    if (y !== null) {
      x = y.next, h = h.baseState;
      var R = k = null, N = null, B = x;
      do {
        var G = B.lane;
        if ((Vr & G) === G) N !== null && (N = N.next = { lane: 0, action: B.action, hasEagerState: B.hasEagerState, eagerState: B.eagerState, next: null }), h = B.hasEagerState ? B.eagerState : i(h, B.action);
        else {
          var K = {
            lane: G,
            action: B.action,
            hasEagerState: B.hasEagerState,
            eagerState: B.eagerState,
            next: null
          };
          N === null ? (R = N = K, k = h) : N = N.next = K, ze.lanes |= G, Br |= G;
        }
        B = B.next;
      } while (B !== null && B !== x);
      N === null ? k = h : N.next = R, fn(h, o.memoizedState) || (Pt = !0), o.memoizedState = h, o.baseState = k, o.baseQueue = N, u.lastRenderedState = h;
    }
    if (i = u.interleaved, i !== null) {
      y = i;
      do
        x = y.lane, ze.lanes |= x, Br |= x, y = y.next;
      while (y !== i);
    } else y === null && (u.lanes = 0);
    return [o.memoizedState, u.dispatch];
  }
  function nd(i) {
    var o = en(), u = o.queue;
    if (u === null) throw Error(n(311));
    u.lastRenderedReducer = i;
    var h = u.dispatch, y = u.pending, x = o.memoizedState;
    if (y !== null) {
      u.pending = null;
      var k = y = y.next;
      do
        x = i(x, k.action), k = k.next;
      while (k !== y);
      fn(x, o.memoizedState) || (Pt = !0), o.memoizedState = x, o.baseQueue === null && (o.baseState = x), u.lastRenderedState = x;
    }
    return [x, h];
  }
  function Mg() {
  }
  function Rg(i, o) {
    var u = ze, h = en(), y = o(), x = !fn(h.memoizedState, y);
    if (x && (h.memoizedState = y, Pt = !0), h = h.queue, rd(Dg.bind(null, u, h, i), [i]), h.getSnapshot !== o || x || it !== null && it.memoizedState.tag & 1) {
      if (u.flags |= 2048, ro(9, Ig.bind(null, u, h, y, o), void 0, null), st === null) throw Error(n(349));
      (Vr & 30) !== 0 || Ng(u, o, y);
    }
    return y;
  }
  function Ng(i, o, u) {
    i.flags |= 16384, i = { getSnapshot: o, value: u }, o = ze.updateQueue, o === null ? (o = { lastEffect: null, stores: null }, ze.updateQueue = o, o.stores = [i]) : (u = o.stores, u === null ? o.stores = [i] : u.push(i));
  }
  function Ig(i, o, u, h) {
    o.value = u, o.getSnapshot = h, jg(o) && Fg(i);
  }
  function Dg(i, o, u) {
    return u(function() {
      jg(o) && Fg(i);
    });
  }
  function jg(i) {
    var o = i.getSnapshot;
    i = i.value;
    try {
      var u = o();
      return !fn(i, u);
    } catch {
      return !0;
    }
  }
  function Fg(i) {
    var o = Vn(i, 1);
    o !== null && yn(o, i, 1, -1);
  }
  function Og(i) {
    var o = kn();
    return typeof i == "function" && (i = i()), o.memoizedState = o.baseState = i, i = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: no, lastRenderedState: i }, o.queue = i, i = i.dispatch = YA.bind(null, ze, i), [o.memoizedState, i];
  }
  function ro(i, o, u, h) {
    return i = { tag: i, create: o, destroy: u, deps: h, next: null }, o = ze.updateQueue, o === null ? (o = { lastEffect: null, stores: null }, ze.updateQueue = o, o.lastEffect = i.next = i) : (u = o.lastEffect, u === null ? o.lastEffect = i.next = i : (h = u.next, u.next = i, i.next = h, o.lastEffect = i)), i;
  }
  function Lg() {
    return en().memoizedState;
  }
  function Ka(i, o, u, h) {
    var y = kn();
    ze.flags |= i, y.memoizedState = ro(1 | o, u, void 0, h === void 0 ? null : h);
  }
  function Ya(i, o, u, h) {
    var y = en();
    h = h === void 0 ? null : h;
    var x = void 0;
    if (et !== null) {
      var k = et.memoizedState;
      if (x = k.destroy, h !== null && Xc(h, k.deps)) {
        y.memoizedState = ro(o, u, x, h);
        return;
      }
    }
    ze.flags |= i, y.memoizedState = ro(1 | o, u, x, h);
  }
  function zg(i, o) {
    return Ka(8390656, 8, i, o);
  }
  function rd(i, o) {
    return Ya(2048, 8, i, o);
  }
  function $g(i, o) {
    return Ya(4, 2, i, o);
  }
  function Vg(i, o) {
    return Ya(4, 4, i, o);
  }
  function Bg(i, o) {
    if (typeof o == "function") return i = i(), o(i), function() {
      o(null);
    };
    if (o != null) return i = i(), o.current = i, function() {
      o.current = null;
    };
  }
  function Ug(i, o, u) {
    return u = u != null ? u.concat([i]) : null, Ya(4, 4, Bg.bind(null, o, i), u);
  }
  function id() {
  }
  function Hg(i, o) {
    var u = en();
    o = o === void 0 ? null : o;
    var h = u.memoizedState;
    return h !== null && o !== null && Xc(o, h[1]) ? h[0] : (u.memoizedState = [i, o], i);
  }
  function Wg(i, o) {
    var u = en();
    o = o === void 0 ? null : o;
    var h = u.memoizedState;
    return h !== null && o !== null && Xc(o, h[1]) ? h[0] : (i = i(), u.memoizedState = [i, o], i);
  }
  function Zg(i, o, u) {
    return (Vr & 21) === 0 ? (i.baseState && (i.baseState = !1, Pt = !0), i.memoizedState = u) : (fn(u, o) || (u = wm(), ze.lanes |= u, Br |= u, i.baseState = !0), o);
  }
  function GA(i, o) {
    var u = Ae;
    Ae = u !== 0 && 4 > u ? u : 4, i(!0);
    var h = Qc.transition;
    Qc.transition = {};
    try {
      i(!1), o();
    } finally {
      Ae = u, Qc.transition = h;
    }
  }
  function Gg() {
    return en().memoizedState;
  }
  function KA(i, o, u) {
    var h = hr(i);
    if (u = { lane: h, action: u, hasEagerState: !1, eagerState: null, next: null }, Kg(i)) Yg(o, u);
    else if (u = kg(i, o, u, h), u !== null) {
      var y = St();
      yn(u, i, h, y), qg(u, o, h);
    }
  }
  function YA(i, o, u) {
    var h = hr(i), y = { lane: h, action: u, hasEagerState: !1, eagerState: null, next: null };
    if (Kg(i)) Yg(o, y);
    else {
      var x = i.alternate;
      if (i.lanes === 0 && (x === null || x.lanes === 0) && (x = o.lastRenderedReducer, x !== null)) try {
        var k = o.lastRenderedState, R = x(k, u);
        if (y.hasEagerState = !0, y.eagerState = R, fn(R, k)) {
          var N = o.interleaved;
          N === null ? (y.next = y, Wc(o)) : (y.next = N.next, N.next = y), o.interleaved = y;
          return;
        }
      } catch {
      } finally {
      }
      u = kg(i, o, y, h), u !== null && (y = St(), yn(u, i, h, y), qg(u, o, h));
    }
  }
  function Kg(i) {
    var o = i.alternate;
    return i === ze || o !== null && o === ze;
  }
  function Yg(i, o) {
    eo = Ga = !0;
    var u = i.pending;
    u === null ? o.next = o : (o.next = u.next, u.next = o), i.pending = o;
  }
  function qg(i, o, u) {
    if ((u & 4194240) !== 0) {
      var h = o.lanes;
      h &= i.pendingLanes, u |= h, o.lanes = u, oc(i, u);
    }
  }
  var qa = { readContext: Jt, useCallback: mt, useContext: mt, useEffect: mt, useImperativeHandle: mt, useInsertionEffect: mt, useLayoutEffect: mt, useMemo: mt, useReducer: mt, useRef: mt, useState: mt, useDebugValue: mt, useDeferredValue: mt, useTransition: mt, useMutableSource: mt, useSyncExternalStore: mt, useId: mt, unstable_isNewReconciler: !1 }, qA = { readContext: Jt, useCallback: function(i, o) {
    return kn().memoizedState = [i, o === void 0 ? null : o], i;
  }, useContext: Jt, useEffect: zg, useImperativeHandle: function(i, o, u) {
    return u = u != null ? u.concat([i]) : null, Ka(
      4194308,
      4,
      Bg.bind(null, o, i),
      u
    );
  }, useLayoutEffect: function(i, o) {
    return Ka(4194308, 4, i, o);
  }, useInsertionEffect: function(i, o) {
    return Ka(4, 2, i, o);
  }, useMemo: function(i, o) {
    var u = kn();
    return o = o === void 0 ? null : o, i = i(), u.memoizedState = [i, o], i;
  }, useReducer: function(i, o, u) {
    var h = kn();
    return o = u !== void 0 ? u(o) : o, h.memoizedState = h.baseState = o, i = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: i, lastRenderedState: o }, h.queue = i, i = i.dispatch = KA.bind(null, ze, i), [h.memoizedState, i];
  }, useRef: function(i) {
    var o = kn();
    return i = { current: i }, o.memoizedState = i;
  }, useState: Og, useDebugValue: id, useDeferredValue: function(i) {
    return kn().memoizedState = i;
  }, useTransition: function() {
    var i = Og(!1), o = i[0];
    return i = GA.bind(null, i[1]), kn().memoizedState = i, [o, i];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(i, o, u) {
    var h = ze, y = kn();
    if (je) {
      if (u === void 0) throw Error(n(407));
      u = u();
    } else {
      if (u = o(), st === null) throw Error(n(349));
      (Vr & 30) !== 0 || Ng(h, o, u);
    }
    y.memoizedState = u;
    var x = { value: u, getSnapshot: o };
    return y.queue = x, zg(Dg.bind(
      null,
      h,
      x,
      i
    ), [i]), h.flags |= 2048, ro(9, Ig.bind(null, h, x, u, o), void 0, null), u;
  }, useId: function() {
    var i = kn(), o = st.identifierPrefix;
    if (je) {
      var u = $n, h = zn;
      u = (h & ~(1 << 32 - dn(h) - 1)).toString(32) + u, o = ":" + o + "R" + u, u = to++, 0 < u && (o += "H" + u.toString(32)), o += ":";
    } else u = ZA++, o = ":" + o + "r" + u.toString(32) + ":";
    return i.memoizedState = o;
  }, unstable_isNewReconciler: !1 }, QA = {
    readContext: Jt,
    useCallback: Hg,
    useContext: Jt,
    useEffect: rd,
    useImperativeHandle: Ug,
    useInsertionEffect: $g,
    useLayoutEffect: Vg,
    useMemo: Wg,
    useReducer: td,
    useRef: Lg,
    useState: function() {
      return td(no);
    },
    useDebugValue: id,
    useDeferredValue: function(i) {
      var o = en();
      return Zg(o, et.memoizedState, i);
    },
    useTransition: function() {
      var i = td(no)[0], o = en().memoizedState;
      return [i, o];
    },
    useMutableSource: Mg,
    useSyncExternalStore: Rg,
    useId: Gg,
    unstable_isNewReconciler: !1
  }, XA = { readContext: Jt, useCallback: Hg, useContext: Jt, useEffect: rd, useImperativeHandle: Ug, useInsertionEffect: $g, useLayoutEffect: Vg, useMemo: Wg, useReducer: nd, useRef: Lg, useState: function() {
    return nd(no);
  }, useDebugValue: id, useDeferredValue: function(i) {
    var o = en();
    return et === null ? o.memoizedState = i : Zg(o, et.memoizedState, i);
  }, useTransition: function() {
    var i = nd(no)[0], o = en().memoizedState;
    return [i, o];
  }, useMutableSource: Mg, useSyncExternalStore: Rg, useId: Gg, unstable_isNewReconciler: !1 };
  function pn(i, o) {
    if (i && i.defaultProps) {
      o = Q({}, o), i = i.defaultProps;
      for (var u in i) o[u] === void 0 && (o[u] = i[u]);
      return o;
    }
    return o;
  }
  function sd(i, o, u, h) {
    o = i.memoizedState, u = u(h, o), u = u == null ? o : Q({}, o, u), i.memoizedState = u, i.lanes === 0 && (i.updateQueue.baseState = u);
  }
  var Qa = { isMounted: function(i) {
    return (i = i._reactInternals) ? Dr(i) === i : !1;
  }, enqueueSetState: function(i, o, u) {
    i = i._reactInternals;
    var h = St(), y = hr(i), x = Bn(h, y);
    x.payload = o, u != null && (x.callback = u), o = ur(i, x, y), o !== null && (yn(o, i, y, h), Ua(o, i, y));
  }, enqueueReplaceState: function(i, o, u) {
    i = i._reactInternals;
    var h = St(), y = hr(i), x = Bn(h, y);
    x.tag = 1, x.payload = o, u != null && (x.callback = u), o = ur(i, x, y), o !== null && (yn(o, i, y, h), Ua(o, i, y));
  }, enqueueForceUpdate: function(i, o) {
    i = i._reactInternals;
    var u = St(), h = hr(i), y = Bn(u, h);
    y.tag = 2, o != null && (y.callback = o), o = ur(i, y, h), o !== null && (yn(o, i, h, u), Ua(o, i, h));
  } };
  function Qg(i, o, u, h, y, x, k) {
    return i = i.stateNode, typeof i.shouldComponentUpdate == "function" ? i.shouldComponentUpdate(h, x, k) : o.prototype && o.prototype.isPureReactComponent ? !Us(u, h) || !Us(y, x) : !0;
  }
  function Xg(i, o, u) {
    var h = !1, y = or, x = o.contextType;
    return typeof x == "object" && x !== null ? x = Jt(x) : (y = Ct(o) ? Fr : pt.current, h = o.contextTypes, x = (h = h != null) ? ki(i, y) : or), o = new o(u, x), i.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, o.updater = Qa, i.stateNode = o, o._reactInternals = i, h && (i = i.stateNode, i.__reactInternalMemoizedUnmaskedChildContext = y, i.__reactInternalMemoizedMaskedChildContext = x), o;
  }
  function Jg(i, o, u, h) {
    i = o.state, typeof o.componentWillReceiveProps == "function" && o.componentWillReceiveProps(u, h), typeof o.UNSAFE_componentWillReceiveProps == "function" && o.UNSAFE_componentWillReceiveProps(u, h), o.state !== i && Qa.enqueueReplaceState(o, o.state, null);
  }
  function od(i, o, u, h) {
    var y = i.stateNode;
    y.props = u, y.state = i.memoizedState, y.refs = {}, Zc(i);
    var x = o.contextType;
    typeof x == "object" && x !== null ? y.context = Jt(x) : (x = Ct(o) ? Fr : pt.current, y.context = ki(i, x)), y.state = i.memoizedState, x = o.getDerivedStateFromProps, typeof x == "function" && (sd(i, o, x, u), y.state = i.memoizedState), typeof o.getDerivedStateFromProps == "function" || typeof y.getSnapshotBeforeUpdate == "function" || typeof y.UNSAFE_componentWillMount != "function" && typeof y.componentWillMount != "function" || (o = y.state, typeof y.componentWillMount == "function" && y.componentWillMount(), typeof y.UNSAFE_componentWillMount == "function" && y.UNSAFE_componentWillMount(), o !== y.state && Qa.enqueueReplaceState(y, y.state, null), Ha(i, u, y, h), y.state = i.memoizedState), typeof y.componentDidMount == "function" && (i.flags |= 4194308);
  }
  function Ii(i, o) {
    try {
      var u = "", h = o;
      do
        u += me(h), h = h.return;
      while (h);
      var y = u;
    } catch (x) {
      y = `
Error generating stack: ` + x.message + `
` + x.stack;
    }
    return { value: i, source: o, stack: y, digest: null };
  }
  function ad(i, o, u) {
    return { value: i, source: null, stack: u ?? null, digest: o ?? null };
  }
  function ld(i, o) {
    try {
      console.error(o.value);
    } catch (u) {
      setTimeout(function() {
        throw u;
      });
    }
  }
  var JA = typeof WeakMap == "function" ? WeakMap : Map;
  function ey(i, o, u) {
    u = Bn(-1, u), u.tag = 3, u.payload = { element: null };
    var h = o.value;
    return u.callback = function() {
      il || (il = !0, Td = h), ld(i, o);
    }, u;
  }
  function ty(i, o, u) {
    u = Bn(-1, u), u.tag = 3;
    var h = i.type.getDerivedStateFromError;
    if (typeof h == "function") {
      var y = o.value;
      u.payload = function() {
        return h(y);
      }, u.callback = function() {
        ld(i, o);
      };
    }
    var x = i.stateNode;
    return x !== null && typeof x.componentDidCatch == "function" && (u.callback = function() {
      ld(i, o), typeof h != "function" && (dr === null ? dr = /* @__PURE__ */ new Set([this]) : dr.add(this));
      var k = o.stack;
      this.componentDidCatch(o.value, { componentStack: k !== null ? k : "" });
    }), u;
  }
  function ny(i, o, u) {
    var h = i.pingCache;
    if (h === null) {
      h = i.pingCache = new JA();
      var y = /* @__PURE__ */ new Set();
      h.set(o, y);
    } else y = h.get(o), y === void 0 && (y = /* @__PURE__ */ new Set(), h.set(o, y));
    y.has(u) || (y.add(u), i = hk.bind(null, i, o, u), o.then(i, i));
  }
  function ry(i) {
    do {
      var o;
      if ((o = i.tag === 13) && (o = i.memoizedState, o = o !== null ? o.dehydrated !== null : !0), o) return i;
      i = i.return;
    } while (i !== null);
    return null;
  }
  function iy(i, o, u, h, y) {
    return (i.mode & 1) === 0 ? (i === o ? i.flags |= 65536 : (i.flags |= 128, u.flags |= 131072, u.flags &= -52805, u.tag === 1 && (u.alternate === null ? u.tag = 17 : (o = Bn(-1, 1), o.tag = 2, ur(u, o, 1))), u.lanes |= 1), i) : (i.flags |= 65536, i.lanes = y, i);
  }
  var ek = M.ReactCurrentOwner, Pt = !1;
  function xt(i, o, u, h) {
    o.child = i === null ? Ag(o, null, u, h) : Ei(o, i.child, u, h);
  }
  function sy(i, o, u, h, y) {
    u = u.render;
    var x = o.ref;
    return Ri(o, y), h = Jc(i, o, u, h, x, y), u = ed(), i !== null && !Pt ? (o.updateQueue = i.updateQueue, o.flags &= -2053, i.lanes &= ~y, Un(i, o, y)) : (je && u && Fc(o), o.flags |= 1, xt(i, o, h, y), o.child);
  }
  function oy(i, o, u, h, y) {
    if (i === null) {
      var x = u.type;
      return typeof x == "function" && !Md(x) && x.defaultProps === void 0 && u.compare === null && u.defaultProps === void 0 ? (o.tag = 15, o.type = x, ay(i, o, x, h, y)) : (i = cl(u.type, null, h, o, o.mode, y), i.ref = o.ref, i.return = o, o.child = i);
    }
    if (x = i.child, (i.lanes & y) === 0) {
      var k = x.memoizedProps;
      if (u = u.compare, u = u !== null ? u : Us, u(k, h) && i.ref === o.ref) return Un(i, o, y);
    }
    return o.flags |= 1, i = mr(x, h), i.ref = o.ref, i.return = o, o.child = i;
  }
  function ay(i, o, u, h, y) {
    if (i !== null) {
      var x = i.memoizedProps;
      if (Us(x, h) && i.ref === o.ref) if (Pt = !1, o.pendingProps = h = x, (i.lanes & y) !== 0) (i.flags & 131072) !== 0 && (Pt = !0);
      else return o.lanes = i.lanes, Un(i, o, y);
    }
    return ud(i, o, u, h, y);
  }
  function ly(i, o, u) {
    var h = o.pendingProps, y = h.children, x = i !== null ? i.memoizedState : null;
    if (h.mode === "hidden") if ((o.mode & 1) === 0) o.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Me(ji, Ut), Ut |= u;
    else {
      if ((u & 1073741824) === 0) return i = x !== null ? x.baseLanes | u : u, o.lanes = o.childLanes = 1073741824, o.memoizedState = { baseLanes: i, cachePool: null, transitions: null }, o.updateQueue = null, Me(ji, Ut), Ut |= i, null;
      o.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, h = x !== null ? x.baseLanes : u, Me(ji, Ut), Ut |= h;
    }
    else x !== null ? (h = x.baseLanes | u, o.memoizedState = null) : h = u, Me(ji, Ut), Ut |= h;
    return xt(i, o, y, u), o.child;
  }
  function uy(i, o) {
    var u = o.ref;
    (i === null && u !== null || i !== null && i.ref !== u) && (o.flags |= 512, o.flags |= 2097152);
  }
  function ud(i, o, u, h, y) {
    var x = Ct(u) ? Fr : pt.current;
    return x = ki(o, x), Ri(o, y), u = Jc(i, o, u, h, x, y), h = ed(), i !== null && !Pt ? (o.updateQueue = i.updateQueue, o.flags &= -2053, i.lanes &= ~y, Un(i, o, y)) : (je && h && Fc(o), o.flags |= 1, xt(i, o, u, y), o.child);
  }
  function cy(i, o, u, h, y) {
    if (Ct(u)) {
      var x = !0;
      ja(o);
    } else x = !1;
    if (Ri(o, y), o.stateNode === null) Ja(i, o), Xg(o, u, h), od(o, u, h, y), h = !0;
    else if (i === null) {
      var k = o.stateNode, R = o.memoizedProps;
      k.props = R;
      var N = k.context, B = u.contextType;
      typeof B == "object" && B !== null ? B = Jt(B) : (B = Ct(u) ? Fr : pt.current, B = ki(o, B));
      var G = u.getDerivedStateFromProps, K = typeof G == "function" || typeof k.getSnapshotBeforeUpdate == "function";
      K || typeof k.UNSAFE_componentWillReceiveProps != "function" && typeof k.componentWillReceiveProps != "function" || (R !== h || N !== B) && Jg(o, k, h, B), lr = !1;
      var Z = o.memoizedState;
      k.state = Z, Ha(o, h, k, y), N = o.memoizedState, R !== h || Z !== N || bt.current || lr ? (typeof G == "function" && (sd(o, u, G, h), N = o.memoizedState), (R = lr || Qg(o, u, R, h, Z, N, B)) ? (K || typeof k.UNSAFE_componentWillMount != "function" && typeof k.componentWillMount != "function" || (typeof k.componentWillMount == "function" && k.componentWillMount(), typeof k.UNSAFE_componentWillMount == "function" && k.UNSAFE_componentWillMount()), typeof k.componentDidMount == "function" && (o.flags |= 4194308)) : (typeof k.componentDidMount == "function" && (o.flags |= 4194308), o.memoizedProps = h, o.memoizedState = N), k.props = h, k.state = N, k.context = B, h = R) : (typeof k.componentDidMount == "function" && (o.flags |= 4194308), h = !1);
    } else {
      k = o.stateNode, bg(i, o), R = o.memoizedProps, B = o.type === o.elementType ? R : pn(o.type, R), k.props = B, K = o.pendingProps, Z = k.context, N = u.contextType, typeof N == "object" && N !== null ? N = Jt(N) : (N = Ct(u) ? Fr : pt.current, N = ki(o, N));
      var te = u.getDerivedStateFromProps;
      (G = typeof te == "function" || typeof k.getSnapshotBeforeUpdate == "function") || typeof k.UNSAFE_componentWillReceiveProps != "function" && typeof k.componentWillReceiveProps != "function" || (R !== K || Z !== N) && Jg(o, k, h, N), lr = !1, Z = o.memoizedState, k.state = Z, Ha(o, h, k, y);
      var se = o.memoizedState;
      R !== K || Z !== se || bt.current || lr ? (typeof te == "function" && (sd(o, u, te, h), se = o.memoizedState), (B = lr || Qg(o, u, B, h, Z, se, N) || !1) ? (G || typeof k.UNSAFE_componentWillUpdate != "function" && typeof k.componentWillUpdate != "function" || (typeof k.componentWillUpdate == "function" && k.componentWillUpdate(h, se, N), typeof k.UNSAFE_componentWillUpdate == "function" && k.UNSAFE_componentWillUpdate(h, se, N)), typeof k.componentDidUpdate == "function" && (o.flags |= 4), typeof k.getSnapshotBeforeUpdate == "function" && (o.flags |= 1024)) : (typeof k.componentDidUpdate != "function" || R === i.memoizedProps && Z === i.memoizedState || (o.flags |= 4), typeof k.getSnapshotBeforeUpdate != "function" || R === i.memoizedProps && Z === i.memoizedState || (o.flags |= 1024), o.memoizedProps = h, o.memoizedState = se), k.props = h, k.state = se, k.context = N, h = B) : (typeof k.componentDidUpdate != "function" || R === i.memoizedProps && Z === i.memoizedState || (o.flags |= 4), typeof k.getSnapshotBeforeUpdate != "function" || R === i.memoizedProps && Z === i.memoizedState || (o.flags |= 1024), h = !1);
    }
    return cd(i, o, u, h, x, y);
  }
  function cd(i, o, u, h, y, x) {
    uy(i, o);
    var k = (o.flags & 128) !== 0;
    if (!h && !k) return y && mg(o, u, !1), Un(i, o, x);
    h = o.stateNode, ek.current = o;
    var R = k && typeof u.getDerivedStateFromError != "function" ? null : h.render();
    return o.flags |= 1, i !== null && k ? (o.child = Ei(o, i.child, null, x), o.child = Ei(o, null, R, x)) : xt(i, o, R, x), o.memoizedState = h.state, y && mg(o, u, !0), o.child;
  }
  function dy(i) {
    var o = i.stateNode;
    o.pendingContext ? hg(i, o.pendingContext, o.pendingContext !== o.context) : o.context && hg(i, o.context, !1), Gc(i, o.containerInfo);
  }
  function fy(i, o, u, h, y) {
    return Pi(), $c(y), o.flags |= 256, xt(i, o, u, h), o.child;
  }
  var dd = { dehydrated: null, treeContext: null, retryLane: 0 };
  function fd(i) {
    return { baseLanes: i, cachePool: null, transitions: null };
  }
  function hy(i, o, u) {
    var h = o.pendingProps, y = Le.current, x = !1, k = (o.flags & 128) !== 0, R;
    if ((R = k) || (R = i !== null && i.memoizedState === null ? !1 : (y & 2) !== 0), R ? (x = !0, o.flags &= -129) : (i === null || i.memoizedState !== null) && (y |= 1), Me(Le, y & 1), i === null)
      return zc(o), i = o.memoizedState, i !== null && (i = i.dehydrated, i !== null) ? ((o.mode & 1) === 0 ? o.lanes = 1 : i.data === "$!" ? o.lanes = 8 : o.lanes = 1073741824, null) : (k = h.children, i = h.fallback, x ? (h = o.mode, x = o.child, k = { mode: "hidden", children: k }, (h & 1) === 0 && x !== null ? (x.childLanes = 0, x.pendingProps = k) : x = dl(k, h, 0, null), i = Zr(i, h, u, null), x.return = o, i.return = o, x.sibling = i, o.child = x, o.child.memoizedState = fd(u), o.memoizedState = dd, i) : hd(o, k));
    if (y = i.memoizedState, y !== null && (R = y.dehydrated, R !== null)) return tk(i, o, k, h, R, y, u);
    if (x) {
      x = h.fallback, k = o.mode, y = i.child, R = y.sibling;
      var N = { mode: "hidden", children: h.children };
      return (k & 1) === 0 && o.child !== y ? (h = o.child, h.childLanes = 0, h.pendingProps = N, o.deletions = null) : (h = mr(y, N), h.subtreeFlags = y.subtreeFlags & 14680064), R !== null ? x = mr(R, x) : (x = Zr(x, k, u, null), x.flags |= 2), x.return = o, h.return = o, h.sibling = x, o.child = h, h = x, x = o.child, k = i.child.memoizedState, k = k === null ? fd(u) : { baseLanes: k.baseLanes | u, cachePool: null, transitions: k.transitions }, x.memoizedState = k, x.childLanes = i.childLanes & ~u, o.memoizedState = dd, h;
    }
    return x = i.child, i = x.sibling, h = mr(x, { mode: "visible", children: h.children }), (o.mode & 1) === 0 && (h.lanes = u), h.return = o, h.sibling = null, i !== null && (u = o.deletions, u === null ? (o.deletions = [i], o.flags |= 16) : u.push(i)), o.child = h, o.memoizedState = null, h;
  }
  function hd(i, o) {
    return o = dl({ mode: "visible", children: o }, i.mode, 0, null), o.return = i, i.child = o;
  }
  function Xa(i, o, u, h) {
    return h !== null && $c(h), Ei(o, i.child, null, u), i = hd(o, o.pendingProps.children), i.flags |= 2, o.memoizedState = null, i;
  }
  function tk(i, o, u, h, y, x, k) {
    if (u)
      return o.flags & 256 ? (o.flags &= -257, h = ad(Error(n(422))), Xa(i, o, k, h)) : o.memoizedState !== null ? (o.child = i.child, o.flags |= 128, null) : (x = h.fallback, y = o.mode, h = dl({ mode: "visible", children: h.children }, y, 0, null), x = Zr(x, y, k, null), x.flags |= 2, h.return = o, x.return = o, h.sibling = x, o.child = h, (o.mode & 1) !== 0 && Ei(o, i.child, null, k), o.child.memoizedState = fd(k), o.memoizedState = dd, x);
    if ((o.mode & 1) === 0) return Xa(i, o, k, null);
    if (y.data === "$!") {
      if (h = y.nextSibling && y.nextSibling.dataset, h) var R = h.dgst;
      return h = R, x = Error(n(419)), h = ad(x, h, void 0), Xa(i, o, k, h);
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
        y = (y & (h.suspendedLanes | k)) !== 0 ? 0 : y, y !== 0 && y !== x.retryLane && (x.retryLane = y, Vn(i, y), yn(h, i, y, -1));
      }
      return Ed(), h = ad(Error(n(421))), Xa(i, o, k, h);
    }
    return y.data === "$?" ? (o.flags |= 128, o.child = i.child, o = pk.bind(null, i), y._reactRetry = o, null) : (i = x.treeContext, Bt = ir(y.nextSibling), Vt = o, je = !0, hn = null, i !== null && (Qt[Xt++] = zn, Qt[Xt++] = $n, Qt[Xt++] = Or, zn = i.id, $n = i.overflow, Or = o), o = hd(o, h.children), o.flags |= 4096, o);
  }
  function py(i, o, u) {
    i.lanes |= o;
    var h = i.alternate;
    h !== null && (h.lanes |= o), Hc(i.return, o, u);
  }
  function pd(i, o, u, h, y) {
    var x = i.memoizedState;
    x === null ? i.memoizedState = { isBackwards: o, rendering: null, renderingStartTime: 0, last: h, tail: u, tailMode: y } : (x.isBackwards = o, x.rendering = null, x.renderingStartTime = 0, x.last = h, x.tail = u, x.tailMode = y);
  }
  function my(i, o, u) {
    var h = o.pendingProps, y = h.revealOrder, x = h.tail;
    if (xt(i, o, h.children, u), h = Le.current, (h & 2) !== 0) h = h & 1 | 2, o.flags |= 128;
    else {
      if (i !== null && (i.flags & 128) !== 0) e: for (i = o.child; i !== null; ) {
        if (i.tag === 13) i.memoizedState !== null && py(i, u, o);
        else if (i.tag === 19) py(i, u, o);
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
        for (u = o.child, y = null; u !== null; ) i = u.alternate, i !== null && Wa(i) === null && (y = u), u = u.sibling;
        u = y, u === null ? (y = o.child, o.child = null) : (y = u.sibling, u.sibling = null), pd(o, !1, y, u, x);
        break;
      case "backwards":
        for (u = null, y = o.child, o.child = null; y !== null; ) {
          if (i = y.alternate, i !== null && Wa(i) === null) {
            o.child = y;
            break;
          }
          i = y.sibling, y.sibling = u, u = y, y = i;
        }
        pd(o, !0, u, null, x);
        break;
      case "together":
        pd(o, !1, null, null, void 0);
        break;
      default:
        o.memoizedState = null;
    }
    return o.child;
  }
  function Ja(i, o) {
    (o.mode & 1) === 0 && i !== null && (i.alternate = null, o.alternate = null, o.flags |= 2);
  }
  function Un(i, o, u) {
    if (i !== null && (o.dependencies = i.dependencies), Br |= o.lanes, (u & o.childLanes) === 0) return null;
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
        dy(o), Pi();
        break;
      case 5:
        Eg(o);
        break;
      case 1:
        Ct(o.type) && ja(o);
        break;
      case 4:
        Gc(o, o.stateNode.containerInfo);
        break;
      case 10:
        var h = o.type._context, y = o.memoizedProps.value;
        Me(Va, h._currentValue), h._currentValue = y;
        break;
      case 13:
        if (h = o.memoizedState, h !== null)
          return h.dehydrated !== null ? (Me(Le, Le.current & 1), o.flags |= 128, null) : (u & o.child.childLanes) !== 0 ? hy(i, o, u) : (Me(Le, Le.current & 1), i = Un(i, o, u), i !== null ? i.sibling : null);
        Me(Le, Le.current & 1);
        break;
      case 19:
        if (h = (u & o.childLanes) !== 0, (i.flags & 128) !== 0) {
          if (h) return my(i, o, u);
          o.flags |= 128;
        }
        if (y = o.memoizedState, y !== null && (y.rendering = null, y.tail = null, y.lastEffect = null), Me(Le, Le.current), h) break;
        return null;
      case 22:
      case 23:
        return o.lanes = 0, ly(i, o, u);
    }
    return Un(i, o, u);
  }
  var gy, md, yy, vy;
  gy = function(i, o) {
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
  }, md = function() {
  }, yy = function(i, o, u, h) {
    var y = i.memoizedProps;
    if (y !== h) {
      i = o.stateNode, $r(An.current);
      var x = null;
      switch (u) {
        case "input":
          y = Hu(i, y), h = Hu(i, h), x = [];
          break;
        case "select":
          y = Q({}, y, { value: void 0 }), h = Q({}, h, { value: void 0 }), x = [];
          break;
        case "textarea":
          y = Gu(i, y), h = Gu(i, h), x = [];
          break;
        default:
          typeof y.onClick != "function" && typeof h.onClick == "function" && (i.onclick = Na);
      }
      Yu(u, h);
      var k;
      u = null;
      for (B in y) if (!h.hasOwnProperty(B) && y.hasOwnProperty(B) && y[B] != null) if (B === "style") {
        var R = y[B];
        for (k in R) R.hasOwnProperty(k) && (u || (u = {}), u[k] = "");
      } else B !== "dangerouslySetInnerHTML" && B !== "children" && B !== "suppressContentEditableWarning" && B !== "suppressHydrationWarning" && B !== "autoFocus" && (s.hasOwnProperty(B) ? x || (x = []) : (x = x || []).push(B, null));
      for (B in h) {
        var N = h[B];
        if (R = y != null ? y[B] : void 0, h.hasOwnProperty(B) && N !== R && (N != null || R != null)) if (B === "style") if (R) {
          for (k in R) !R.hasOwnProperty(k) || N && N.hasOwnProperty(k) || (u || (u = {}), u[k] = "");
          for (k in N) N.hasOwnProperty(k) && R[k] !== N[k] && (u || (u = {}), u[k] = N[k]);
        } else u || (x || (x = []), x.push(
          B,
          u
        )), u = N;
        else B === "dangerouslySetInnerHTML" ? (N = N ? N.__html : void 0, R = R ? R.__html : void 0, N != null && R !== N && (x = x || []).push(B, N)) : B === "children" ? typeof N != "string" && typeof N != "number" || (x = x || []).push(B, "" + N) : B !== "suppressContentEditableWarning" && B !== "suppressHydrationWarning" && (s.hasOwnProperty(B) ? (N != null && B === "onScroll" && Ne("scroll", i), x || R === N || (x = [])) : (x = x || []).push(B, N));
      }
      u && (x = x || []).push("style", u);
      var B = x;
      (o.updateQueue = B) && (o.flags |= 4);
    }
  }, vy = function(i, o, u, h) {
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
    switch (Oc(o), o.tag) {
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
        return Ct(o.type) && Da(), gt(o), null;
      case 3:
        return h = o.stateNode, Ni(), Ie(bt), Ie(pt), qc(), h.pendingContext && (h.context = h.pendingContext, h.pendingContext = null), (i === null || i.child === null) && (za(o) ? o.flags |= 4 : i === null || i.memoizedState.isDehydrated && (o.flags & 256) === 0 || (o.flags |= 1024, hn !== null && (bd(hn), hn = null))), md(i, o), gt(o), null;
      case 5:
        Kc(o);
        var y = $r(Js.current);
        if (u = o.type, i !== null && o.stateNode != null) yy(i, o, u, h, y), i.ref !== o.ref && (o.flags |= 512, o.flags |= 2097152);
        else {
          if (!h) {
            if (o.stateNode === null) throw Error(n(166));
            return gt(o), null;
          }
          if (i = $r(An.current), za(o)) {
            h = o.stateNode, u = o.type;
            var x = o.memoizedProps;
            switch (h[Tn] = o, h[Ks] = x, i = (o.mode & 1) !== 0, u) {
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
                Xp(h, x), Ne("invalid", h);
                break;
              case "select":
                h._wrapperState = { wasMultiple: !!x.multiple }, Ne("invalid", h);
                break;
              case "textarea":
                tm(h, x), Ne("invalid", h);
            }
            Yu(u, x), y = null;
            for (var k in x) if (x.hasOwnProperty(k)) {
              var R = x[k];
              k === "children" ? typeof R == "string" ? h.textContent !== R && (x.suppressHydrationWarning !== !0 && Ra(h.textContent, R, i), y = ["children", R]) : typeof R == "number" && h.textContent !== "" + R && (x.suppressHydrationWarning !== !0 && Ra(
                h.textContent,
                R,
                i
              ), y = ["children", "" + R]) : s.hasOwnProperty(k) && R != null && k === "onScroll" && Ne("scroll", h);
            }
            switch (u) {
              case "input":
                la(h), em(h, x, !0);
                break;
              case "textarea":
                la(h), rm(h);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof x.onClick == "function" && (h.onclick = Na);
            }
            h = y, o.updateQueue = h, h !== null && (o.flags |= 4);
          } else {
            k = y.nodeType === 9 ? y : y.ownerDocument, i === "http://www.w3.org/1999/xhtml" && (i = im(u)), i === "http://www.w3.org/1999/xhtml" ? u === "script" ? (i = k.createElement("div"), i.innerHTML = "<script><\/script>", i = i.removeChild(i.firstChild)) : typeof h.is == "string" ? i = k.createElement(u, { is: h.is }) : (i = k.createElement(u), u === "select" && (k = i, h.multiple ? k.multiple = !0 : h.size && (k.size = h.size))) : i = k.createElementNS(i, u), i[Tn] = o, i[Ks] = h, gy(i, o, !1, !1), o.stateNode = i;
            e: {
              switch (k = qu(u, h), u) {
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
                  Xp(i, h), y = Hu(i, h), Ne("invalid", i);
                  break;
                case "option":
                  y = h;
                  break;
                case "select":
                  i._wrapperState = { wasMultiple: !!h.multiple }, y = Q({}, h, { value: void 0 }), Ne("invalid", i);
                  break;
                case "textarea":
                  tm(i, h), y = Gu(i, h), Ne("invalid", i);
                  break;
                default:
                  y = h;
              }
              Yu(u, y), R = y;
              for (x in R) if (R.hasOwnProperty(x)) {
                var N = R[x];
                x === "style" ? am(i, N) : x === "dangerouslySetInnerHTML" ? (N = N ? N.__html : void 0, N != null && sm(i, N)) : x === "children" ? typeof N == "string" ? (u !== "textarea" || N !== "") && bs(i, N) : typeof N == "number" && bs(i, "" + N) : x !== "suppressContentEditableWarning" && x !== "suppressHydrationWarning" && x !== "autoFocus" && (s.hasOwnProperty(x) ? N != null && x === "onScroll" && Ne("scroll", i) : N != null && E(i, x, N, k));
              }
              switch (u) {
                case "input":
                  la(i), em(i, h, !1);
                  break;
                case "textarea":
                  la(i), rm(i);
                  break;
                case "option":
                  h.value != null && i.setAttribute("value", "" + Te(h.value));
                  break;
                case "select":
                  i.multiple = !!h.multiple, x = h.value, x != null ? hi(i, !!h.multiple, x, !1) : h.defaultValue != null && hi(
                    i,
                    !!h.multiple,
                    h.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof y.onClick == "function" && (i.onclick = Na);
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
        if (i && o.stateNode != null) vy(i, o, i.memoizedProps, h);
        else {
          if (typeof h != "string" && o.stateNode === null) throw Error(n(166));
          if (u = $r(Js.current), $r(An.current), za(o)) {
            if (h = o.stateNode, u = o.memoizedProps, h[Tn] = o, (x = h.nodeValue !== u) && (i = Vt, i !== null)) switch (i.tag) {
              case 3:
                Ra(h.nodeValue, u, (i.mode & 1) !== 0);
                break;
              case 5:
                i.memoizedProps.suppressHydrationWarning !== !0 && Ra(h.nodeValue, u, (i.mode & 1) !== 0);
            }
            x && (o.flags |= 4);
          } else h = (u.nodeType === 9 ? u : u.ownerDocument).createTextNode(h), h[Tn] = o, o.stateNode = h;
        }
        return gt(o), null;
      case 13:
        if (Ie(Le), h = o.memoizedState, i === null || i.memoizedState !== null && i.memoizedState.dehydrated !== null) {
          if (je && Bt !== null && (o.mode & 1) !== 0 && (o.flags & 128) === 0) Sg(), Pi(), o.flags |= 98560, x = !1;
          else if (x = za(o), h !== null && h.dehydrated !== null) {
            if (i === null) {
              if (!x) throw Error(n(318));
              if (x = o.memoizedState, x = x !== null ? x.dehydrated : null, !x) throw Error(n(317));
              x[Tn] = o;
            } else Pi(), (o.flags & 128) === 0 && (o.memoizedState = null), o.flags |= 4;
            gt(o), x = !1;
          } else hn !== null && (bd(hn), hn = null), x = !0;
          if (!x) return o.flags & 65536 ? o : null;
        }
        return (o.flags & 128) !== 0 ? (o.lanes = u, o) : (h = h !== null, h !== (i !== null && i.memoizedState !== null) && h && (o.child.flags |= 8192, (o.mode & 1) !== 0 && (i === null || (Le.current & 1) !== 0 ? tt === 0 && (tt = 3) : Ed())), o.updateQueue !== null && (o.flags |= 4), gt(o), null);
      case 4:
        return Ni(), md(i, o), i === null && Zs(o.stateNode.containerInfo), gt(o), null;
      case 10:
        return Uc(o.type._context), gt(o), null;
      case 17:
        return Ct(o.type) && Da(), gt(o), null;
      case 19:
        if (Ie(Le), x = o.memoizedState, x === null) return gt(o), null;
        if (h = (o.flags & 128) !== 0, k = x.rendering, k === null) if (h) io(x, !1);
        else {
          if (tt !== 0 || i !== null && (i.flags & 128) !== 0) for (i = o.child; i !== null; ) {
            if (k = Wa(i), k !== null) {
              for (o.flags |= 128, io(x, !1), h = k.updateQueue, h !== null && (o.updateQueue = h, o.flags |= 4), o.subtreeFlags = 0, h = u, u = o.child; u !== null; ) x = u, i = h, x.flags &= 14680066, k = x.alternate, k === null ? (x.childLanes = 0, x.lanes = i, x.child = null, x.subtreeFlags = 0, x.memoizedProps = null, x.memoizedState = null, x.updateQueue = null, x.dependencies = null, x.stateNode = null) : (x.childLanes = k.childLanes, x.lanes = k.lanes, x.child = k.child, x.subtreeFlags = 0, x.deletions = null, x.memoizedProps = k.memoizedProps, x.memoizedState = k.memoizedState, x.updateQueue = k.updateQueue, x.type = k.type, i = k.dependencies, x.dependencies = i === null ? null : { lanes: i.lanes, firstContext: i.firstContext }), u = u.sibling;
              return Me(Le, Le.current & 1 | 2), o.child;
            }
            i = i.sibling;
          }
          x.tail !== null && Ge() > Fi && (o.flags |= 128, h = !0, io(x, !1), o.lanes = 4194304);
        }
        else {
          if (!h) if (i = Wa(k), i !== null) {
            if (o.flags |= 128, h = !0, u = i.updateQueue, u !== null && (o.updateQueue = u, o.flags |= 4), io(x, !0), x.tail === null && x.tailMode === "hidden" && !k.alternate && !je) return gt(o), null;
          } else 2 * Ge() - x.renderingStartTime > Fi && u !== 1073741824 && (o.flags |= 128, h = !0, io(x, !1), o.lanes = 4194304);
          x.isBackwards ? (k.sibling = o.child, o.child = k) : (u = x.last, u !== null ? u.sibling = k : o.child = k, x.last = k);
        }
        return x.tail !== null ? (o = x.tail, x.rendering = o, x.tail = o.sibling, x.renderingStartTime = Ge(), o.sibling = null, u = Le.current, Me(Le, h ? u & 1 | 2 : u & 1), o) : (gt(o), null);
      case 22:
      case 23:
        return Pd(), h = o.memoizedState !== null, i !== null && i.memoizedState !== null !== h && (o.flags |= 8192), h && (o.mode & 1) !== 0 ? (Ut & 1073741824) !== 0 && (gt(o), o.subtreeFlags & 6 && (o.flags |= 8192)) : gt(o), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(n(156, o.tag));
  }
  function ik(i, o) {
    switch (Oc(o), o.tag) {
      case 1:
        return Ct(o.type) && Da(), i = o.flags, i & 65536 ? (o.flags = i & -65537 | 128, o) : null;
      case 3:
        return Ni(), Ie(bt), Ie(pt), qc(), i = o.flags, (i & 65536) !== 0 && (i & 128) === 0 ? (o.flags = i & -65537 | 128, o) : null;
      case 5:
        return Kc(o), null;
      case 13:
        if (Ie(Le), i = o.memoizedState, i !== null && i.dehydrated !== null) {
          if (o.alternate === null) throw Error(n(340));
          Pi();
        }
        return i = o.flags, i & 65536 ? (o.flags = i & -65537 | 128, o) : null;
      case 19:
        return Ie(Le), null;
      case 4:
        return Ni(), null;
      case 10:
        return Uc(o.type._context), null;
      case 22:
      case 23:
        return Pd(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var el = !1, yt = !1, sk = typeof WeakSet == "function" ? WeakSet : Set, re = null;
  function Di(i, o) {
    var u = i.ref;
    if (u !== null) if (typeof u == "function") try {
      u(null);
    } catch (h) {
      We(i, o, h);
    }
    else u.current = null;
  }
  function gd(i, o, u) {
    try {
      u();
    } catch (h) {
      We(i, o, h);
    }
  }
  var _y = !1;
  function ok(i, o) {
    if (Pc = xa, i = Qm(), xc(i)) {
      if ("selectionStart" in i) var u = { start: i.selectionStart, end: i.selectionEnd };
      else e: {
        u = (u = i.ownerDocument) && u.defaultView || window;
        var h = u.getSelection && u.getSelection();
        if (h && h.rangeCount !== 0) {
          u = h.anchorNode;
          var y = h.anchorOffset, x = h.focusNode;
          h = h.focusOffset;
          try {
            u.nodeType, x.nodeType;
          } catch {
            u = null;
            break e;
          }
          var k = 0, R = -1, N = -1, B = 0, G = 0, K = i, Z = null;
          t: for (; ; ) {
            for (var te; K !== u || y !== 0 && K.nodeType !== 3 || (R = k + y), K !== x || h !== 0 && K.nodeType !== 3 || (N = k + h), K.nodeType === 3 && (k += K.nodeValue.length), (te = K.firstChild) !== null; )
              Z = K, K = te;
            for (; ; ) {
              if (K === i) break t;
              if (Z === u && ++B === y && (R = k), Z === x && ++G === h && (N = k), (te = K.nextSibling) !== null) break;
              K = Z, Z = K.parentNode;
            }
            K = te;
          }
          u = R === -1 || N === -1 ? null : { start: R, end: N };
        } else u = null;
      }
      u = u || { start: 0, end: 0 };
    } else u = null;
    for (Ec = { focusedElem: i, selectionRange: u }, xa = !1, re = o; re !== null; ) if (o = re, i = o.child, (o.subtreeFlags & 1028) !== 0 && i !== null) i.return = o, re = i;
    else for (; re !== null; ) {
      o = re;
      try {
        var se = o.alternate;
        if ((o.flags & 1024) !== 0) switch (o.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (se !== null) {
              var le = se.memoizedProps, Ke = se.memoizedState, z = o.stateNode, j = z.getSnapshotBeforeUpdate(o.elementType === o.type ? le : pn(o.type, le), Ke);
              z.__reactInternalSnapshotBeforeUpdate = j;
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
      } catch (Y) {
        We(o, o.return, Y);
      }
      if (i = o.sibling, i !== null) {
        i.return = o.return, re = i;
        break;
      }
      re = o.return;
    }
    return se = _y, _y = !1, se;
  }
  function so(i, o, u) {
    var h = o.updateQueue;
    if (h = h !== null ? h.lastEffect : null, h !== null) {
      var y = h = h.next;
      do {
        if ((y.tag & i) === i) {
          var x = y.destroy;
          y.destroy = void 0, x !== void 0 && gd(o, u, x);
        }
        y = y.next;
      } while (y !== h);
    }
  }
  function tl(i, o) {
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
  function yd(i) {
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
  function xy(i) {
    var o = i.alternate;
    o !== null && (i.alternate = null, xy(o)), i.child = null, i.deletions = null, i.sibling = null, i.tag === 5 && (o = i.stateNode, o !== null && (delete o[Tn], delete o[Ks], delete o[Ic], delete o[BA], delete o[UA])), i.stateNode = null, i.return = null, i.dependencies = null, i.memoizedProps = null, i.memoizedState = null, i.pendingProps = null, i.stateNode = null, i.updateQueue = null;
  }
  function Sy(i) {
    return i.tag === 5 || i.tag === 3 || i.tag === 4;
  }
  function wy(i) {
    e: for (; ; ) {
      for (; i.sibling === null; ) {
        if (i.return === null || Sy(i.return)) return null;
        i = i.return;
      }
      for (i.sibling.return = i.return, i = i.sibling; i.tag !== 5 && i.tag !== 6 && i.tag !== 18; ) {
        if (i.flags & 2 || i.child === null || i.tag === 4) continue e;
        i.child.return = i, i = i.child;
      }
      if (!(i.flags & 2)) return i.stateNode;
    }
  }
  function vd(i, o, u) {
    var h = i.tag;
    if (h === 5 || h === 6) i = i.stateNode, o ? u.nodeType === 8 ? u.parentNode.insertBefore(i, o) : u.insertBefore(i, o) : (u.nodeType === 8 ? (o = u.parentNode, o.insertBefore(i, u)) : (o = u, o.appendChild(i)), u = u._reactRootContainer, u != null || o.onclick !== null || (o.onclick = Na));
    else if (h !== 4 && (i = i.child, i !== null)) for (vd(i, o, u), i = i.sibling; i !== null; ) vd(i, o, u), i = i.sibling;
  }
  function _d(i, o, u) {
    var h = i.tag;
    if (h === 5 || h === 6) i = i.stateNode, o ? u.insertBefore(i, o) : u.appendChild(i);
    else if (h !== 4 && (i = i.child, i !== null)) for (_d(i, o, u), i = i.sibling; i !== null; ) _d(i, o, u), i = i.sibling;
  }
  var ut = null, mn = !1;
  function cr(i, o, u) {
    for (u = u.child; u !== null; ) Ty(i, o, u), u = u.sibling;
  }
  function Ty(i, o, u) {
    if (wn && typeof wn.onCommitFiberUnmount == "function") try {
      wn.onCommitFiberUnmount(pa, u);
    } catch {
    }
    switch (u.tag) {
      case 5:
        yt || Di(u, o);
      case 6:
        var h = ut, y = mn;
        ut = null, cr(i, o, u), ut = h, mn = y, ut !== null && (mn ? (i = ut, u = u.stateNode, i.nodeType === 8 ? i.parentNode.removeChild(u) : i.removeChild(u)) : ut.removeChild(u.stateNode));
        break;
      case 18:
        ut !== null && (mn ? (i = ut, u = u.stateNode, i.nodeType === 8 ? Nc(i.parentNode, u) : i.nodeType === 1 && Nc(i, u), Os(i)) : Nc(ut, u.stateNode));
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
            var x = y, k = x.destroy;
            x = x.tag, k !== void 0 && ((x & 2) !== 0 || (x & 4) !== 0) && gd(u, o, k), y = y.next;
          } while (y !== h);
        }
        cr(i, o, u);
        break;
      case 1:
        if (!yt && (Di(u, o), h = u.stateNode, typeof h.componentWillUnmount == "function")) try {
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
  function Ay(i) {
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
        var x = i, k = o, R = k;
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
        Ty(x, k, y), ut = null, mn = !1;
        var N = y.alternate;
        N !== null && (N.return = null), y.return = null;
      } catch (B) {
        We(y, o, B);
      }
    }
    if (o.subtreeFlags & 12854) for (o = o.child; o !== null; ) ky(o, i), o = o.sibling;
  }
  function ky(i, o) {
    var u = i.alternate, h = i.flags;
    switch (i.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (gn(o, i), bn(i), h & 4) {
          try {
            so(3, i, i.return), tl(3, i);
          } catch (le) {
            We(i, i.return, le);
          }
          try {
            so(5, i, i.return);
          } catch (le) {
            We(i, i.return, le);
          }
        }
        break;
      case 1:
        gn(o, i), bn(i), h & 512 && u !== null && Di(u, u.return);
        break;
      case 5:
        if (gn(o, i), bn(i), h & 512 && u !== null && Di(u, u.return), i.flags & 32) {
          var y = i.stateNode;
          try {
            bs(y, "");
          } catch (le) {
            We(i, i.return, le);
          }
        }
        if (h & 4 && (y = i.stateNode, y != null)) {
          var x = i.memoizedProps, k = u !== null ? u.memoizedProps : x, R = i.type, N = i.updateQueue;
          if (i.updateQueue = null, N !== null) try {
            R === "input" && x.type === "radio" && x.name != null && Jp(y, x), qu(R, k);
            var B = qu(R, x);
            for (k = 0; k < N.length; k += 2) {
              var G = N[k], K = N[k + 1];
              G === "style" ? am(y, K) : G === "dangerouslySetInnerHTML" ? sm(y, K) : G === "children" ? bs(y, K) : E(y, G, K, B);
            }
            switch (R) {
              case "input":
                Wu(y, x);
                break;
              case "textarea":
                nm(y, x);
                break;
              case "select":
                var Z = y._wrapperState.wasMultiple;
                y._wrapperState.wasMultiple = !!x.multiple;
                var te = x.value;
                te != null ? hi(y, !!x.multiple, te, !1) : Z !== !!x.multiple && (x.defaultValue != null ? hi(
                  y,
                  !!x.multiple,
                  x.defaultValue,
                  !0
                ) : hi(y, !!x.multiple, x.multiple ? [] : "", !1));
            }
            y[Ks] = x;
          } catch (le) {
            We(i, i.return, le);
          }
        }
        break;
      case 6:
        if (gn(o, i), bn(i), h & 4) {
          if (i.stateNode === null) throw Error(n(162));
          y = i.stateNode, x = i.memoizedProps;
          try {
            y.nodeValue = x;
          } catch (le) {
            We(i, i.return, le);
          }
        }
        break;
      case 3:
        if (gn(o, i), bn(i), h & 4 && u !== null && u.memoizedState.isDehydrated) try {
          Os(o.containerInfo);
        } catch (le) {
          We(i, i.return, le);
        }
        break;
      case 4:
        gn(o, i), bn(i);
        break;
      case 13:
        gn(o, i), bn(i), y = i.child, y.flags & 8192 && (x = y.memoizedState !== null, y.stateNode.isHidden = x, !x || y.alternate !== null && y.alternate.memoizedState !== null || (wd = Ge())), h & 4 && Ay(i);
        break;
      case 22:
        if (G = u !== null && u.memoizedState !== null, i.mode & 1 ? (yt = (B = yt) || G, gn(o, i), yt = B) : gn(o, i), bn(i), h & 8192) {
          if (B = i.memoizedState !== null, (i.stateNode.isHidden = B) && !G && (i.mode & 1) !== 0) for (re = i, G = i.child; G !== null; ) {
            for (K = re = G; re !== null; ) {
              switch (Z = re, te = Z.child, Z.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  so(4, Z, Z.return);
                  break;
                case 1:
                  Di(Z, Z.return);
                  var se = Z.stateNode;
                  if (typeof se.componentWillUnmount == "function") {
                    h = Z, u = Z.return;
                    try {
                      o = h, se.props = o.memoizedProps, se.state = o.memoizedState, se.componentWillUnmount();
                    } catch (le) {
                      We(h, u, le);
                    }
                  }
                  break;
                case 5:
                  Di(Z, Z.return);
                  break;
                case 22:
                  if (Z.memoizedState !== null) {
                    Py(K);
                    continue;
                  }
              }
              te !== null ? (te.return = Z, re = te) : Py(K);
            }
            G = G.sibling;
          }
          e: for (G = null, K = i; ; ) {
            if (K.tag === 5) {
              if (G === null) {
                G = K;
                try {
                  y = K.stateNode, B ? (x = y.style, typeof x.setProperty == "function" ? x.setProperty("display", "none", "important") : x.display = "none") : (R = K.stateNode, N = K.memoizedProps.style, k = N != null && N.hasOwnProperty("display") ? N.display : null, R.style.display = om("display", k));
                } catch (le) {
                  We(i, i.return, le);
                }
              }
            } else if (K.tag === 6) {
              if (G === null) try {
                K.stateNode.nodeValue = B ? "" : K.memoizedProps;
              } catch (le) {
                We(i, i.return, le);
              }
            } else if ((K.tag !== 22 && K.tag !== 23 || K.memoizedState === null || K === i) && K.child !== null) {
              K.child.return = K, K = K.child;
              continue;
            }
            if (K === i) break e;
            for (; K.sibling === null; ) {
              if (K.return === null || K.return === i) break e;
              G === K && (G = null), K = K.return;
            }
            G === K && (G = null), K.sibling.return = K.return, K = K.sibling;
          }
        }
        break;
      case 19:
        gn(o, i), bn(i), h & 4 && Ay(i);
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
            if (Sy(u)) {
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
            var x = wy(i);
            _d(i, x, y);
            break;
          case 3:
          case 4:
            var k = h.stateNode.containerInfo, R = wy(i);
            vd(i, R, k);
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
    re = i, by(i);
  }
  function by(i, o, u) {
    for (var h = (i.mode & 1) !== 0; re !== null; ) {
      var y = re, x = y.child;
      if (y.tag === 22 && h) {
        var k = y.memoizedState !== null || el;
        if (!k) {
          var R = y.alternate, N = R !== null && R.memoizedState !== null || yt;
          R = el;
          var B = yt;
          if (el = k, (yt = N) && !B) for (re = y; re !== null; ) k = re, N = k.child, k.tag === 22 && k.memoizedState !== null ? Ey(y) : N !== null ? (N.return = k, re = N) : Ey(y);
          for (; x !== null; ) re = x, by(x), x = x.sibling;
          re = y, el = R, yt = B;
        }
        Cy(i);
      } else (y.subtreeFlags & 8772) !== 0 && x !== null ? (x.return = y, re = x) : Cy(i);
    }
  }
  function Cy(i) {
    for (; re !== null; ) {
      var o = re;
      if ((o.flags & 8772) !== 0) {
        var u = o.alternate;
        try {
          if ((o.flags & 8772) !== 0) switch (o.tag) {
            case 0:
            case 11:
            case 15:
              yt || tl(5, o);
              break;
            case 1:
              var h = o.stateNode;
              if (o.flags & 4 && !yt) if (u === null) h.componentDidMount();
              else {
                var y = o.elementType === o.type ? u.memoizedProps : pn(o.type, u.memoizedProps);
                h.componentDidUpdate(y, u.memoizedState, h.__reactInternalSnapshotBeforeUpdate);
              }
              var x = o.updateQueue;
              x !== null && Pg(o, x, h);
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
                Pg(o, k, u);
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
                  var G = B.memoizedState;
                  if (G !== null) {
                    var K = G.dehydrated;
                    K !== null && Os(K);
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
          yt || o.flags & 512 && yd(o);
        } catch (Z) {
          We(o, o.return, Z);
        }
      }
      if (o === i) {
        re = null;
        break;
      }
      if (u = o.sibling, u !== null) {
        u.return = o.return, re = u;
        break;
      }
      re = o.return;
    }
  }
  function Py(i) {
    for (; re !== null; ) {
      var o = re;
      if (o === i) {
        re = null;
        break;
      }
      var u = o.sibling;
      if (u !== null) {
        u.return = o.return, re = u;
        break;
      }
      re = o.return;
    }
  }
  function Ey(i) {
    for (; re !== null; ) {
      var o = re;
      try {
        switch (o.tag) {
          case 0:
          case 11:
          case 15:
            var u = o.return;
            try {
              tl(4, o);
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
            var x = o.return;
            try {
              yd(o);
            } catch (N) {
              We(o, x, N);
            }
            break;
          case 5:
            var k = o.return;
            try {
              yd(o);
            } catch (N) {
              We(o, k, N);
            }
        }
      } catch (N) {
        We(o, o.return, N);
      }
      if (o === i) {
        re = null;
        break;
      }
      var R = o.sibling;
      if (R !== null) {
        R.return = o.return, re = R;
        break;
      }
      re = o.return;
    }
  }
  var lk = Math.ceil, nl = M.ReactCurrentDispatcher, xd = M.ReactCurrentOwner, tn = M.ReactCurrentBatchConfig, Se = 0, st = null, qe = null, ct = 0, Ut = 0, ji = sr(0), tt = 0, oo = null, Br = 0, rl = 0, Sd = 0, ao = null, Et = null, wd = 0, Fi = 1 / 0, Hn = null, il = !1, Td = null, dr = null, sl = !1, fr = null, ol = 0, lo = 0, Ad = null, al = -1, ll = 0;
  function St() {
    return (Se & 6) !== 0 ? Ge() : al !== -1 ? al : al = Ge();
  }
  function hr(i) {
    return (i.mode & 1) === 0 ? 1 : (Se & 2) !== 0 && ct !== 0 ? ct & -ct : WA.transition !== null ? (ll === 0 && (ll = wm()), ll) : (i = Ae, i !== 0 || (i = window.event, i = i === void 0 ? 16 : Rm(i.type)), i);
  }
  function yn(i, o, u, h) {
    if (50 < lo) throw lo = 0, Ad = null, Error(n(185));
    Ns(i, u, h), ((Se & 2) === 0 || i !== st) && (i === st && ((Se & 2) === 0 && (rl |= u), tt === 4 && pr(i, ct)), Mt(i, h), u === 1 && Se === 0 && (o.mode & 1) === 0 && (Fi = Ge() + 500, Fa && ar()));
  }
  function Mt(i, o) {
    var u = i.callbackNode;
    WT(i, o);
    var h = ya(i, i === st ? ct : 0);
    if (h === 0) u !== null && _m(u), i.callbackNode = null, i.callbackPriority = 0;
    else if (o = h & -h, i.callbackPriority !== o) {
      if (u != null && _m(u), o === 1) i.tag === 0 ? HA(Ry.bind(null, i)) : gg(Ry.bind(null, i)), $A(function() {
        (Se & 6) === 0 && ar();
      }), u = null;
      else {
        switch (Tm(h)) {
          case 1:
            u = rc;
            break;
          case 4:
            u = xm;
            break;
          case 16:
            u = ha;
            break;
          case 536870912:
            u = Sm;
            break;
          default:
            u = ha;
        }
        u = zy(u, My.bind(null, i));
      }
      i.callbackPriority = o, i.callbackNode = u;
    }
  }
  function My(i, o) {
    if (al = -1, ll = 0, (Se & 6) !== 0) throw Error(n(327));
    var u = i.callbackNode;
    if (Oi() && i.callbackNode !== u) return null;
    var h = ya(i, i === st ? ct : 0);
    if (h === 0) return null;
    if ((h & 30) !== 0 || (h & i.expiredLanes) !== 0 || o) o = ul(i, h);
    else {
      o = h;
      var y = Se;
      Se |= 2;
      var x = Iy();
      (st !== i || ct !== o) && (Hn = null, Fi = Ge() + 500, Hr(i, o));
      do
        try {
          dk();
          break;
        } catch (R) {
          Ny(i, R);
        }
      while (!0);
      Bc(), nl.current = x, Se = y, qe !== null ? o = 0 : (st = null, ct = 0, o = tt);
    }
    if (o !== 0) {
      if (o === 2 && (y = ic(i), y !== 0 && (h = y, o = kd(i, y))), o === 1) throw u = oo, Hr(i, 0), pr(i, h), Mt(i, Ge()), u;
      if (o === 6) pr(i, h);
      else {
        if (y = i.current.alternate, (h & 30) === 0 && !uk(y) && (o = ul(i, h), o === 2 && (x = ic(i), x !== 0 && (h = x, o = kd(i, x))), o === 1)) throw u = oo, Hr(i, 0), pr(i, h), Mt(i, Ge()), u;
        switch (i.finishedWork = y, i.finishedLanes = h, o) {
          case 0:
          case 1:
            throw Error(n(345));
          case 2:
            Wr(i, Et, Hn);
            break;
          case 3:
            if (pr(i, h), (h & 130023424) === h && (o = wd + 500 - Ge(), 10 < o)) {
              if (ya(i, 0) !== 0) break;
              if (y = i.suspendedLanes, (y & h) !== h) {
                St(), i.pingedLanes |= i.suspendedLanes & y;
                break;
              }
              i.timeoutHandle = Rc(Wr.bind(null, i, Et, Hn), o);
              break;
            }
            Wr(i, Et, Hn);
            break;
          case 4:
            if (pr(i, h), (h & 4194240) === h) break;
            for (o = i.eventTimes, y = -1; 0 < h; ) {
              var k = 31 - dn(h);
              x = 1 << k, k = o[k], k > y && (y = k), h &= ~x;
            }
            if (h = y, h = Ge() - h, h = (120 > h ? 120 : 480 > h ? 480 : 1080 > h ? 1080 : 1920 > h ? 1920 : 3e3 > h ? 3e3 : 4320 > h ? 4320 : 1960 * lk(h / 1960)) - h, 10 < h) {
              i.timeoutHandle = Rc(Wr.bind(null, i, Et, Hn), h);
              break;
            }
            Wr(i, Et, Hn);
            break;
          case 5:
            Wr(i, Et, Hn);
            break;
          default:
            throw Error(n(329));
        }
      }
    }
    return Mt(i, Ge()), i.callbackNode === u ? My.bind(null, i) : null;
  }
  function kd(i, o) {
    var u = ao;
    return i.current.memoizedState.isDehydrated && (Hr(i, o).flags |= 256), i = ul(i, o), i !== 2 && (o = Et, Et = u, o !== null && bd(o)), i;
  }
  function bd(i) {
    Et === null ? Et = i : Et.push.apply(Et, i);
  }
  function uk(i) {
    for (var o = i; ; ) {
      if (o.flags & 16384) {
        var u = o.updateQueue;
        if (u !== null && (u = u.stores, u !== null)) for (var h = 0; h < u.length; h++) {
          var y = u[h], x = y.getSnapshot;
          y = y.value;
          try {
            if (!fn(x(), y)) return !1;
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
    for (o &= ~Sd, o &= ~rl, i.suspendedLanes |= o, i.pingedLanes &= ~o, i = i.expirationTimes; 0 < o; ) {
      var u = 31 - dn(o), h = 1 << u;
      i[u] = -1, o &= ~h;
    }
  }
  function Ry(i) {
    if ((Se & 6) !== 0) throw Error(n(327));
    Oi();
    var o = ya(i, 0);
    if ((o & 1) === 0) return Mt(i, Ge()), null;
    var u = ul(i, o);
    if (i.tag !== 0 && u === 2) {
      var h = ic(i);
      h !== 0 && (o = h, u = kd(i, h));
    }
    if (u === 1) throw u = oo, Hr(i, 0), pr(i, o), Mt(i, Ge()), u;
    if (u === 6) throw Error(n(345));
    return i.finishedWork = i.current.alternate, i.finishedLanes = o, Wr(i, Et, Hn), Mt(i, Ge()), null;
  }
  function Cd(i, o) {
    var u = Se;
    Se |= 1;
    try {
      return i(o);
    } finally {
      Se = u, Se === 0 && (Fi = Ge() + 500, Fa && ar());
    }
  }
  function Ur(i) {
    fr !== null && fr.tag === 0 && (Se & 6) === 0 && Oi();
    var o = Se;
    Se |= 1;
    var u = tn.transition, h = Ae;
    try {
      if (tn.transition = null, Ae = 1, i) return i();
    } finally {
      Ae = h, tn.transition = u, Se = o, (Se & 6) === 0 && ar();
    }
  }
  function Pd() {
    Ut = ji.current, Ie(ji);
  }
  function Hr(i, o) {
    i.finishedWork = null, i.finishedLanes = 0;
    var u = i.timeoutHandle;
    if (u !== -1 && (i.timeoutHandle = -1, zA(u)), qe !== null) for (u = qe.return; u !== null; ) {
      var h = u;
      switch (Oc(h), h.tag) {
        case 1:
          h = h.type.childContextTypes, h != null && Da();
          break;
        case 3:
          Ni(), Ie(bt), Ie(pt), qc();
          break;
        case 5:
          Kc(h);
          break;
        case 4:
          Ni();
          break;
        case 13:
          Ie(Le);
          break;
        case 19:
          Ie(Le);
          break;
        case 10:
          Uc(h.type._context);
          break;
        case 22:
        case 23:
          Pd();
      }
      u = u.return;
    }
    if (st = i, qe = i = mr(i.current, null), ct = Ut = o, tt = 0, oo = null, Sd = rl = Br = 0, Et = ao = null, zr !== null) {
      for (o = 0; o < zr.length; o++) if (u = zr[o], h = u.interleaved, h !== null) {
        u.interleaved = null;
        var y = h.next, x = u.pending;
        if (x !== null) {
          var k = x.next;
          x.next = y, h.next = k;
        }
        u.pending = h;
      }
      zr = null;
    }
    return i;
  }
  function Ny(i, o) {
    do {
      var u = qe;
      try {
        if (Bc(), Za.current = qa, Ga) {
          for (var h = ze.memoizedState; h !== null; ) {
            var y = h.queue;
            y !== null && (y.pending = null), h = h.next;
          }
          Ga = !1;
        }
        if (Vr = 0, it = et = ze = null, eo = !1, to = 0, xd.current = null, u === null || u.return === null) {
          tt = 1, oo = o, qe = null;
          break;
        }
        e: {
          var x = i, k = u.return, R = u, N = o;
          if (o = ct, R.flags |= 32768, N !== null && typeof N == "object" && typeof N.then == "function") {
            var B = N, G = R, K = G.tag;
            if ((G.mode & 1) === 0 && (K === 0 || K === 11 || K === 15)) {
              var Z = G.alternate;
              Z ? (G.updateQueue = Z.updateQueue, G.memoizedState = Z.memoizedState, G.lanes = Z.lanes) : (G.updateQueue = null, G.memoizedState = null);
            }
            var te = ry(k);
            if (te !== null) {
              te.flags &= -257, iy(te, k, R, x, o), te.mode & 1 && ny(x, B, o), o = te, N = B;
              var se = o.updateQueue;
              if (se === null) {
                var le = /* @__PURE__ */ new Set();
                le.add(N), o.updateQueue = le;
              } else se.add(N);
              break e;
            } else {
              if ((o & 1) === 0) {
                ny(x, B, o), Ed();
                break e;
              }
              N = Error(n(426));
            }
          } else if (je && R.mode & 1) {
            var Ke = ry(k);
            if (Ke !== null) {
              (Ke.flags & 65536) === 0 && (Ke.flags |= 256), iy(Ke, k, R, x, o), $c(Ii(N, R));
              break e;
            }
          }
          x = N = Ii(N, R), tt !== 4 && (tt = 2), ao === null ? ao = [x] : ao.push(x), x = k;
          do {
            switch (x.tag) {
              case 3:
                x.flags |= 65536, o &= -o, x.lanes |= o;
                var z = ey(x, N, o);
                Cg(x, z);
                break e;
              case 1:
                R = N;
                var j = x.type, V = x.stateNode;
                if ((x.flags & 128) === 0 && (typeof j.getDerivedStateFromError == "function" || V !== null && typeof V.componentDidCatch == "function" && (dr === null || !dr.has(V)))) {
                  x.flags |= 65536, o &= -o, x.lanes |= o;
                  var Y = ty(x, R, o);
                  Cg(x, Y);
                  break e;
                }
            }
            x = x.return;
          } while (x !== null);
        }
        jy(u);
      } catch (ue) {
        o = ue, qe === u && u !== null && (qe = u = u.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Iy() {
    var i = nl.current;
    return nl.current = qa, i === null ? qa : i;
  }
  function Ed() {
    (tt === 0 || tt === 3 || tt === 2) && (tt = 4), st === null || (Br & 268435455) === 0 && (rl & 268435455) === 0 || pr(st, ct);
  }
  function ul(i, o) {
    var u = Se;
    Se |= 2;
    var h = Iy();
    (st !== i || ct !== o) && (Hn = null, Hr(i, o));
    do
      try {
        ck();
        break;
      } catch (y) {
        Ny(i, y);
      }
    while (!0);
    if (Bc(), Se = u, nl.current = h, qe !== null) throw Error(n(261));
    return st = null, ct = 0, tt;
  }
  function ck() {
    for (; qe !== null; ) Dy(qe);
  }
  function dk() {
    for (; qe !== null && !FT(); ) Dy(qe);
  }
  function Dy(i) {
    var o = Ly(i.alternate, i, Ut);
    i.memoizedProps = i.pendingProps, o === null ? jy(i) : qe = o, xd.current = null;
  }
  function jy(i) {
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
  function Wr(i, o, u) {
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
      Oi();
    while (fr !== null);
    if ((Se & 6) !== 0) throw Error(n(327));
    u = i.finishedWork;
    var y = i.finishedLanes;
    if (u === null) return null;
    if (i.finishedWork = null, i.finishedLanes = 0, u === i.current) throw Error(n(177));
    i.callbackNode = null, i.callbackPriority = 0;
    var x = u.lanes | u.childLanes;
    if (ZT(i, x), i === st && (qe = st = null, ct = 0), (u.subtreeFlags & 2064) === 0 && (u.flags & 2064) === 0 || sl || (sl = !0, zy(ha, function() {
      return Oi(), null;
    })), x = (u.flags & 15990) !== 0, (u.subtreeFlags & 15990) !== 0 || x) {
      x = tn.transition, tn.transition = null;
      var k = Ae;
      Ae = 1;
      var R = Se;
      Se |= 4, xd.current = null, ok(i, u), ky(u, i), NA(Ec), xa = !!Pc, Ec = Pc = null, i.current = u, ak(u), OT(), Se = R, Ae = k, tn.transition = x;
    } else i.current = u;
    if (sl && (sl = !1, fr = i, ol = y), x = i.pendingLanes, x === 0 && (dr = null), $T(u.stateNode), Mt(i, Ge()), o !== null) for (h = i.onRecoverableError, u = 0; u < o.length; u++) y = o[u], h(y.value, { componentStack: y.stack, digest: y.digest });
    if (il) throw il = !1, i = Td, Td = null, i;
    return (ol & 1) !== 0 && i.tag !== 0 && Oi(), x = i.pendingLanes, (x & 1) !== 0 ? i === Ad ? lo++ : (lo = 0, Ad = i) : lo = 0, ar(), null;
  }
  function Oi() {
    if (fr !== null) {
      var i = Tm(ol), o = tn.transition, u = Ae;
      try {
        if (tn.transition = null, Ae = 16 > i ? 16 : i, fr === null) var h = !1;
        else {
          if (i = fr, fr = null, ol = 0, (Se & 6) !== 0) throw Error(n(331));
          var y = Se;
          for (Se |= 4, re = i.current; re !== null; ) {
            var x = re, k = x.child;
            if ((re.flags & 16) !== 0) {
              var R = x.deletions;
              if (R !== null) {
                for (var N = 0; N < R.length; N++) {
                  var B = R[N];
                  for (re = B; re !== null; ) {
                    var G = re;
                    switch (G.tag) {
                      case 0:
                      case 11:
                      case 15:
                        so(8, G, x);
                    }
                    var K = G.child;
                    if (K !== null) K.return = G, re = K;
                    else for (; re !== null; ) {
                      G = re;
                      var Z = G.sibling, te = G.return;
                      if (xy(G), G === B) {
                        re = null;
                        break;
                      }
                      if (Z !== null) {
                        Z.return = te, re = Z;
                        break;
                      }
                      re = te;
                    }
                  }
                }
                var se = x.alternate;
                if (se !== null) {
                  var le = se.child;
                  if (le !== null) {
                    se.child = null;
                    do {
                      var Ke = le.sibling;
                      le.sibling = null, le = Ke;
                    } while (le !== null);
                  }
                }
                re = x;
              }
            }
            if ((x.subtreeFlags & 2064) !== 0 && k !== null) k.return = x, re = k;
            else e: for (; re !== null; ) {
              if (x = re, (x.flags & 2048) !== 0) switch (x.tag) {
                case 0:
                case 11:
                case 15:
                  so(9, x, x.return);
              }
              var z = x.sibling;
              if (z !== null) {
                z.return = x.return, re = z;
                break e;
              }
              re = x.return;
            }
          }
          var j = i.current;
          for (re = j; re !== null; ) {
            k = re;
            var V = k.child;
            if ((k.subtreeFlags & 2064) !== 0 && V !== null) V.return = k, re = V;
            else e: for (k = j; re !== null; ) {
              if (R = re, (R.flags & 2048) !== 0) try {
                switch (R.tag) {
                  case 0:
                  case 11:
                  case 15:
                    tl(9, R);
                }
              } catch (ue) {
                We(R, R.return, ue);
              }
              if (R === k) {
                re = null;
                break e;
              }
              var Y = R.sibling;
              if (Y !== null) {
                Y.return = R.return, re = Y;
                break e;
              }
              re = R.return;
            }
          }
          if (Se = y, ar(), wn && typeof wn.onPostCommitFiberRoot == "function") try {
            wn.onPostCommitFiberRoot(pa, i);
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
  function Fy(i, o, u) {
    o = Ii(u, o), o = ey(i, o, 1), i = ur(i, o, 1), o = St(), i !== null && (Ns(i, 1, o), Mt(i, o));
  }
  function We(i, o, u) {
    if (i.tag === 3) Fy(i, i, u);
    else for (; o !== null; ) {
      if (o.tag === 3) {
        Fy(o, i, u);
        break;
      } else if (o.tag === 1) {
        var h = o.stateNode;
        if (typeof o.type.getDerivedStateFromError == "function" || typeof h.componentDidCatch == "function" && (dr === null || !dr.has(h))) {
          i = Ii(u, i), i = ty(o, i, 1), o = ur(o, i, 1), i = St(), o !== null && (Ns(o, 1, i), Mt(o, i));
          break;
        }
      }
      o = o.return;
    }
  }
  function hk(i, o, u) {
    var h = i.pingCache;
    h !== null && h.delete(o), o = St(), i.pingedLanes |= i.suspendedLanes & u, st === i && (ct & u) === u && (tt === 4 || tt === 3 && (ct & 130023424) === ct && 500 > Ge() - wd ? Hr(i, 0) : Sd |= u), Mt(i, o);
  }
  function Oy(i, o) {
    o === 0 && ((i.mode & 1) === 0 ? o = 1 : (o = ga, ga <<= 1, (ga & 130023424) === 0 && (ga = 4194304)));
    var u = St();
    i = Vn(i, o), i !== null && (Ns(i, o, u), Mt(i, u));
  }
  function pk(i) {
    var o = i.memoizedState, u = 0;
    o !== null && (u = o.retryLane), Oy(i, u);
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
    h !== null && h.delete(o), Oy(i, u);
  }
  var Ly;
  Ly = function(i, o, u) {
    if (i !== null) if (i.memoizedProps !== o.pendingProps || bt.current) Pt = !0;
    else {
      if ((i.lanes & u) === 0 && (o.flags & 128) === 0) return Pt = !1, nk(i, o, u);
      Pt = (i.flags & 131072) !== 0;
    }
    else Pt = !1, je && (o.flags & 1048576) !== 0 && yg(o, La, o.index);
    switch (o.lanes = 0, o.tag) {
      case 2:
        var h = o.type;
        Ja(i, o), i = o.pendingProps;
        var y = ki(o, pt.current);
        Ri(o, u), y = Jc(null, o, h, i, y, u);
        var x = ed();
        return o.flags |= 1, typeof y == "object" && y !== null && typeof y.render == "function" && y.$$typeof === void 0 ? (o.tag = 1, o.memoizedState = null, o.updateQueue = null, Ct(h) ? (x = !0, ja(o)) : x = !1, o.memoizedState = y.state !== null && y.state !== void 0 ? y.state : null, Zc(o), y.updater = Qa, o.stateNode = y, y._reactInternals = o, od(o, h, i, u), o = cd(null, o, h, !0, x, u)) : (o.tag = 0, je && x && Fc(o), xt(null, o, y, u), o = o.child), o;
      case 16:
        h = o.elementType;
        e: {
          switch (Ja(i, o), i = o.pendingProps, y = h._init, h = y(h._payload), o.type = h, y = o.tag = yk(h), i = pn(h, i), y) {
            case 0:
              o = ud(null, o, h, i, u);
              break e;
            case 1:
              o = cy(null, o, h, i, u);
              break e;
            case 11:
              o = sy(null, o, h, i, u);
              break e;
            case 14:
              o = oy(null, o, h, pn(h.type, i), u);
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
        return h = o.type, y = o.pendingProps, y = o.elementType === h ? y : pn(h, y), ud(i, o, h, y, u);
      case 1:
        return h = o.type, y = o.pendingProps, y = o.elementType === h ? y : pn(h, y), cy(i, o, h, y, u);
      case 3:
        e: {
          if (dy(o), i === null) throw Error(n(387));
          h = o.pendingProps, x = o.memoizedState, y = x.element, bg(i, o), Ha(o, h, null, u);
          var k = o.memoizedState;
          if (h = k.element, x.isDehydrated) if (x = { element: h, isDehydrated: !1, cache: k.cache, pendingSuspenseBoundaries: k.pendingSuspenseBoundaries, transitions: k.transitions }, o.updateQueue.baseState = x, o.memoizedState = x, o.flags & 256) {
            y = Ii(Error(n(423)), o), o = fy(i, o, h, u, y);
            break e;
          } else if (h !== y) {
            y = Ii(Error(n(424)), o), o = fy(i, o, h, u, y);
            break e;
          } else for (Bt = ir(o.stateNode.containerInfo.firstChild), Vt = o, je = !0, hn = null, u = Ag(o, null, h, u), o.child = u; u; ) u.flags = u.flags & -3 | 4096, u = u.sibling;
          else {
            if (Pi(), h === y) {
              o = Un(i, o, u);
              break e;
            }
            xt(i, o, h, u);
          }
          o = o.child;
        }
        return o;
      case 5:
        return Eg(o), i === null && zc(o), h = o.type, y = o.pendingProps, x = i !== null ? i.memoizedProps : null, k = y.children, Mc(h, y) ? k = null : x !== null && Mc(h, x) && (o.flags |= 32), uy(i, o), xt(i, o, k, u), o.child;
      case 6:
        return i === null && zc(o), null;
      case 13:
        return hy(i, o, u);
      case 4:
        return Gc(o, o.stateNode.containerInfo), h = o.pendingProps, i === null ? o.child = Ei(o, null, h, u) : xt(i, o, h, u), o.child;
      case 11:
        return h = o.type, y = o.pendingProps, y = o.elementType === h ? y : pn(h, y), sy(i, o, h, y, u);
      case 7:
        return xt(i, o, o.pendingProps, u), o.child;
      case 8:
        return xt(i, o, o.pendingProps.children, u), o.child;
      case 12:
        return xt(i, o, o.pendingProps.children, u), o.child;
      case 10:
        e: {
          if (h = o.type._context, y = o.pendingProps, x = o.memoizedProps, k = y.value, Me(Va, h._currentValue), h._currentValue = k, x !== null) if (fn(x.value, k)) {
            if (x.children === y.children && !bt.current) {
              o = Un(i, o, u);
              break e;
            }
          } else for (x = o.child, x !== null && (x.return = o); x !== null; ) {
            var R = x.dependencies;
            if (R !== null) {
              k = x.child;
              for (var N = R.firstContext; N !== null; ) {
                if (N.context === h) {
                  if (x.tag === 1) {
                    N = Bn(-1, u & -u), N.tag = 2;
                    var B = x.updateQueue;
                    if (B !== null) {
                      B = B.shared;
                      var G = B.pending;
                      G === null ? N.next = N : (N.next = G.next, G.next = N), B.pending = N;
                    }
                  }
                  x.lanes |= u, N = x.alternate, N !== null && (N.lanes |= u), Hc(
                    x.return,
                    u,
                    o
                  ), R.lanes |= u;
                  break;
                }
                N = N.next;
              }
            } else if (x.tag === 10) k = x.type === o.type ? null : x.child;
            else if (x.tag === 18) {
              if (k = x.return, k === null) throw Error(n(341));
              k.lanes |= u, R = k.alternate, R !== null && (R.lanes |= u), Hc(k, u, o), k = x.sibling;
            } else k = x.child;
            if (k !== null) k.return = x;
            else for (k = x; k !== null; ) {
              if (k === o) {
                k = null;
                break;
              }
              if (x = k.sibling, x !== null) {
                x.return = k.return, k = x;
                break;
              }
              k = k.return;
            }
            x = k;
          }
          xt(i, o, y.children, u), o = o.child;
        }
        return o;
      case 9:
        return y = o.type, h = o.pendingProps.children, Ri(o, u), y = Jt(y), h = h(y), o.flags |= 1, xt(i, o, h, u), o.child;
      case 14:
        return h = o.type, y = pn(h, o.pendingProps), y = pn(h.type, y), oy(i, o, h, y, u);
      case 15:
        return ay(i, o, o.type, o.pendingProps, u);
      case 17:
        return h = o.type, y = o.pendingProps, y = o.elementType === h ? y : pn(h, y), Ja(i, o), o.tag = 1, Ct(h) ? (i = !0, ja(o)) : i = !1, Ri(o, u), Xg(o, h, y), od(o, h, y, u), cd(null, o, h, !0, i, u);
      case 19:
        return my(i, o, u);
      case 22:
        return ly(i, o, u);
    }
    throw Error(n(156, o.tag));
  };
  function zy(i, o) {
    return vm(i, o);
  }
  function gk(i, o, u, h) {
    this.tag = i, this.key = u, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = o, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = h, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function nn(i, o, u, h) {
    return new gk(i, o, u, h);
  }
  function Md(i) {
    return i = i.prototype, !(!i || !i.isReactComponent);
  }
  function yk(i) {
    if (typeof i == "function") return Md(i) ? 1 : 0;
    if (i != null) {
      if (i = i.$$typeof, i === ee) return 11;
      if (i === ge) return 14;
    }
    return 2;
  }
  function mr(i, o) {
    var u = i.alternate;
    return u === null ? (u = nn(i.tag, o, i.key, i.mode), u.elementType = i.elementType, u.type = i.type, u.stateNode = i.stateNode, u.alternate = i, i.alternate = u) : (u.pendingProps = o, u.type = i.type, u.flags = 0, u.subtreeFlags = 0, u.deletions = null), u.flags = i.flags & 14680064, u.childLanes = i.childLanes, u.lanes = i.lanes, u.child = i.child, u.memoizedProps = i.memoizedProps, u.memoizedState = i.memoizedState, u.updateQueue = i.updateQueue, o = i.dependencies, u.dependencies = o === null ? null : { lanes: o.lanes, firstContext: o.firstContext }, u.sibling = i.sibling, u.index = i.index, u.ref = i.ref, u;
  }
  function cl(i, o, u, h, y, x) {
    var k = 2;
    if (h = i, typeof i == "function") Md(i) && (k = 1);
    else if (typeof i == "string") k = 5;
    else e: switch (i) {
      case I:
        return Zr(u.children, y, x, o);
      case O:
        k = 8, y |= 8;
        break;
      case L:
        return i = nn(12, u, o, y | 2), i.elementType = L, i.lanes = x, i;
      case ne:
        return i = nn(13, u, o, y), i.elementType = ne, i.lanes = x, i;
      case ie:
        return i = nn(19, u, o, y), i.elementType = ie, i.lanes = x, i;
      case fe:
        return dl(u, y, x, o);
      default:
        if (typeof i == "object" && i !== null) switch (i.$$typeof) {
          case U:
            k = 10;
            break e;
          case q:
            k = 9;
            break e;
          case ee:
            k = 11;
            break e;
          case ge:
            k = 14;
            break e;
          case ce:
            k = 16, h = null;
            break e;
        }
        throw Error(n(130, i == null ? i : typeof i, ""));
    }
    return o = nn(k, u, o, y), o.elementType = i, o.type = h, o.lanes = x, o;
  }
  function Zr(i, o, u, h) {
    return i = nn(7, i, h, o), i.lanes = u, i;
  }
  function dl(i, o, u, h) {
    return i = nn(22, i, h, o), i.elementType = fe, i.lanes = u, i.stateNode = { isHidden: !1 }, i;
  }
  function Rd(i, o, u) {
    return i = nn(6, i, null, o), i.lanes = u, i;
  }
  function Nd(i, o, u) {
    return o = nn(4, i.children !== null ? i.children : [], i.key, o), o.lanes = u, o.stateNode = { containerInfo: i.containerInfo, pendingChildren: null, implementation: i.implementation }, o;
  }
  function vk(i, o, u, h, y) {
    this.tag = o, this.containerInfo = i, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = sc(0), this.expirationTimes = sc(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = sc(0), this.identifierPrefix = h, this.onRecoverableError = y, this.mutableSourceEagerHydrationData = null;
  }
  function Id(i, o, u, h, y, x, k, R, N) {
    return i = new vk(i, o, u, R, N), o === 1 ? (o = 1, x === !0 && (o |= 8)) : o = 0, x = nn(3, null, null, o), i.current = x, x.stateNode = i, x.memoizedState = { element: h, isDehydrated: u, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Zc(x), i;
  }
  function _k(i, o, u) {
    var h = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: $, key: h == null ? null : "" + h, children: i, containerInfo: o, implementation: u };
  }
  function $y(i) {
    if (!i) return or;
    i = i._reactInternals;
    e: {
      if (Dr(i) !== i || i.tag !== 1) throw Error(n(170));
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
      if (Ct(u)) return pg(i, u, o);
    }
    return o;
  }
  function Vy(i, o, u, h, y, x, k, R, N) {
    return i = Id(u, h, !0, i, y, x, k, R, N), i.context = $y(null), u = i.current, h = St(), y = hr(u), x = Bn(h, y), x.callback = o ?? null, ur(u, x, y), i.current.lanes = y, Ns(i, y, h), Mt(i, h), i;
  }
  function fl(i, o, u, h) {
    var y = o.current, x = St(), k = hr(y);
    return u = $y(u), o.context === null ? o.context = u : o.pendingContext = u, o = Bn(x, k), o.payload = { element: i }, h = h === void 0 ? null : h, h !== null && (o.callback = h), i = ur(y, o, k), i !== null && (yn(i, y, k, x), Ua(i, y, k)), k;
  }
  function hl(i) {
    if (i = i.current, !i.child) return null;
    switch (i.child.tag) {
      case 5:
        return i.child.stateNode;
      default:
        return i.child.stateNode;
    }
  }
  function By(i, o) {
    if (i = i.memoizedState, i !== null && i.dehydrated !== null) {
      var u = i.retryLane;
      i.retryLane = u !== 0 && u < o ? u : o;
    }
  }
  function Dd(i, o) {
    By(i, o), (i = i.alternate) && By(i, o);
  }
  function xk() {
    return null;
  }
  var Uy = typeof reportError == "function" ? reportError : function(i) {
    console.error(i);
  };
  function jd(i) {
    this._internalRoot = i;
  }
  pl.prototype.render = jd.prototype.render = function(i) {
    var o = this._internalRoot;
    if (o === null) throw Error(n(409));
    fl(i, o, null, null);
  }, pl.prototype.unmount = jd.prototype.unmount = function() {
    var i = this._internalRoot;
    if (i !== null) {
      this._internalRoot = null;
      var o = i.containerInfo;
      Ur(function() {
        fl(null, i, null, null);
      }), o[On] = null;
    }
  };
  function pl(i) {
    this._internalRoot = i;
  }
  pl.prototype.unstable_scheduleHydration = function(i) {
    if (i) {
      var o = bm();
      i = { blockedOn: null, target: i, priority: o };
      for (var u = 0; u < tr.length && o !== 0 && o < tr[u].priority; u++) ;
      tr.splice(u, 0, i), u === 0 && Em(i);
    }
  };
  function Fd(i) {
    return !(!i || i.nodeType !== 1 && i.nodeType !== 9 && i.nodeType !== 11);
  }
  function ml(i) {
    return !(!i || i.nodeType !== 1 && i.nodeType !== 9 && i.nodeType !== 11 && (i.nodeType !== 8 || i.nodeValue !== " react-mount-point-unstable "));
  }
  function Hy() {
  }
  function Sk(i, o, u, h, y) {
    if (y) {
      if (typeof h == "function") {
        var x = h;
        h = function() {
          var B = hl(k);
          x.call(B);
        };
      }
      var k = Vy(o, h, i, 0, null, !1, !1, "", Hy);
      return i._reactRootContainer = k, i[On] = k.current, Zs(i.nodeType === 8 ? i.parentNode : i), Ur(), k;
    }
    for (; y = i.lastChild; ) i.removeChild(y);
    if (typeof h == "function") {
      var R = h;
      h = function() {
        var B = hl(N);
        R.call(B);
      };
    }
    var N = Id(i, 0, !1, null, null, !1, !1, "", Hy);
    return i._reactRootContainer = N, i[On] = N.current, Zs(i.nodeType === 8 ? i.parentNode : i), Ur(function() {
      fl(o, N, u, h);
    }), N;
  }
  function gl(i, o, u, h, y) {
    var x = u._reactRootContainer;
    if (x) {
      var k = x;
      if (typeof y == "function") {
        var R = y;
        y = function() {
          var N = hl(k);
          R.call(N);
        };
      }
      fl(o, k, i, y);
    } else k = Sk(u, o, i, y, h);
    return hl(k);
  }
  Am = function(i) {
    switch (i.tag) {
      case 3:
        var o = i.stateNode;
        if (o.current.memoizedState.isDehydrated) {
          var u = Rs(o.pendingLanes);
          u !== 0 && (oc(o, u | 1), Mt(o, Ge()), (Se & 6) === 0 && (Fi = Ge() + 500, ar()));
        }
        break;
      case 13:
        Ur(function() {
          var h = Vn(i, 1);
          if (h !== null) {
            var y = St();
            yn(h, i, 1, y);
          }
        }), Dd(i, 1);
    }
  }, ac = function(i) {
    if (i.tag === 13) {
      var o = Vn(i, 134217728);
      if (o !== null) {
        var u = St();
        yn(o, i, 134217728, u);
      }
      Dd(i, 134217728);
    }
  }, km = function(i) {
    if (i.tag === 13) {
      var o = hr(i), u = Vn(i, o);
      if (u !== null) {
        var h = St();
        yn(u, i, o, h);
      }
      Dd(i, o);
    }
  }, bm = function() {
    return Ae;
  }, Cm = function(i, o) {
    var u = Ae;
    try {
      return Ae = i, o();
    } finally {
      Ae = u;
    }
  }, Ju = function(i, o, u) {
    switch (o) {
      case "input":
        if (Wu(i, u), o = u.name, u.type === "radio" && o != null) {
          for (u = i; u.parentNode; ) u = u.parentNode;
          for (u = u.querySelectorAll("input[name=" + JSON.stringify("" + o) + '][type="radio"]'), o = 0; o < u.length; o++) {
            var h = u[o];
            if (h !== i && h.form === i.form) {
              var y = Ia(h);
              if (!y) throw Error(n(90));
              Qp(h), Wu(h, y);
            }
          }
        }
        break;
      case "textarea":
        nm(i, u);
        break;
      case "select":
        o = u.value, o != null && hi(i, !!u.multiple, o, !1);
    }
  }, dm = Cd, fm = Ur;
  var wk = { usingClientEntryPoint: !1, Events: [Ys, Ti, Ia, um, cm, Cd] }, uo = { findFiberByHostInstance: jr, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Tk = { bundleType: uo.bundleType, version: uo.version, rendererPackageName: uo.rendererPackageName, rendererConfig: uo.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: M.ReactCurrentDispatcher, findHostInstanceByFiber: function(i) {
    return i = gm(i), i === null ? null : i.stateNode;
  }, findFiberByHostInstance: uo.findFiberByHostInstance || xk, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var yl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!yl.isDisabled && yl.supportsFiber) try {
      pa = yl.inject(Tk), wn = yl;
    } catch {
    }
  }
  return Rt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = wk, Rt.createPortal = function(i, o) {
    var u = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Fd(o)) throw Error(n(200));
    return _k(i, o, null, u);
  }, Rt.createRoot = function(i, o) {
    if (!Fd(i)) throw Error(n(299));
    var u = !1, h = "", y = Uy;
    return o != null && (o.unstable_strictMode === !0 && (u = !0), o.identifierPrefix !== void 0 && (h = o.identifierPrefix), o.onRecoverableError !== void 0 && (y = o.onRecoverableError)), o = Id(i, 1, !1, null, null, u, !1, h, y), i[On] = o.current, Zs(i.nodeType === 8 ? i.parentNode : i), new jd(o);
  }, Rt.findDOMNode = function(i) {
    if (i == null) return null;
    if (i.nodeType === 1) return i;
    var o = i._reactInternals;
    if (o === void 0)
      throw typeof i.render == "function" ? Error(n(188)) : (i = Object.keys(i).join(","), Error(n(268, i)));
    return i = gm(o), i = i === null ? null : i.stateNode, i;
  }, Rt.flushSync = function(i) {
    return Ur(i);
  }, Rt.hydrate = function(i, o, u) {
    if (!ml(o)) throw Error(n(200));
    return gl(null, i, o, !0, u);
  }, Rt.hydrateRoot = function(i, o, u) {
    if (!Fd(i)) throw Error(n(405));
    var h = u != null && u.hydratedSources || null, y = !1, x = "", k = Uy;
    if (u != null && (u.unstable_strictMode === !0 && (y = !0), u.identifierPrefix !== void 0 && (x = u.identifierPrefix), u.onRecoverableError !== void 0 && (k = u.onRecoverableError)), o = Vy(o, null, i, 1, u ?? null, y, !1, x, k), i[On] = o.current, Zs(i), h) for (i = 0; i < h.length; i++) u = h[i], y = u._getVersion, y = y(u._source), o.mutableSourceEagerHydrationData == null ? o.mutableSourceEagerHydrationData = [u, y] : o.mutableSourceEagerHydrationData.push(
      u,
      y
    );
    return new pl(o);
  }, Rt.render = function(i, o, u) {
    if (!ml(o)) throw Error(n(200));
    return gl(null, i, o, !1, u);
  }, Rt.unmountComponentAtNode = function(i) {
    if (!ml(i)) throw Error(n(40));
    return i._reactRootContainer ? (Ur(function() {
      gl(null, null, i, !1, function() {
        i._reactRootContainer = null, i[On] = null;
      });
    }), !0) : !1;
  }, Rt.unstable_batchedUpdates = Cd, Rt.unstable_renderSubtreeIntoContainer = function(i, o, u, h) {
    if (!ml(u)) throw Error(n(200));
    if (i == null || i._reactInternals === void 0) throw Error(n(38));
    return gl(i, o, u, !1, h);
  }, Rt.version = "18.3.1-next-f1338f8080-20240426", Rt;
}
var Jy;
function M_() {
  if (Jy) return Ld.exports;
  Jy = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (e) {
        console.error(e);
      }
  }
  return t(), Ld.exports = Ik(), Ld.exports;
}
var ev;
function Dk() {
  if (ev) return vl;
  ev = 1;
  var t = M_();
  return vl.createRoot = t.createRoot, vl.hydrateRoot = t.hydrateRoot, vl;
}
var jk = Dk(), Vd = { exports: {} }, fo = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var tv;
function Fk() {
  if (tv) return fo;
  tv = 1;
  var t = Fh(), e = Symbol.for("react.element"), n = Symbol.for("react.fragment"), r = Object.prototype.hasOwnProperty, s = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, a = { key: !0, ref: !0, __self: !0, __source: !0 };
  function l(c, f, m) {
    var g, d = {}, p = null, v = null;
    m !== void 0 && (p = "" + m), f.key !== void 0 && (p = "" + f.key), f.ref !== void 0 && (v = f.ref);
    for (g in f) r.call(f, g) && !a.hasOwnProperty(g) && (d[g] = f[g]);
    if (c && c.defaultProps) for (g in f = c.defaultProps, f) d[g] === void 0 && (d[g] = f[g]);
    return { $$typeof: e, type: c, key: p, ref: v, props: d, _owner: s.current };
  }
  return fo.Fragment = n, fo.jsx = l, fo.jsxs = l, fo;
}
var nv;
function Ok() {
  return nv || (nv = 1, Vd.exports = Fk()), Vd.exports;
}
var _ = Ok();
const rv = (t) => Symbol.iterator in t, iv = (t) => (
  // HACK: avoid checking entries type
  "entries" in t
), sv = (t, e) => {
  const n = t instanceof Map ? t : new Map(t.entries()), r = e instanceof Map ? e : new Map(e.entries());
  if (n.size !== r.size)
    return !1;
  for (const [s, a] of n)
    if (!r.has(s) || !Object.is(a, r.get(s)))
      return !1;
  return !0;
}, Lk = (t, e) => {
  const n = t[Symbol.iterator](), r = e[Symbol.iterator]();
  let s = n.next(), a = r.next();
  for (; !s.done && !a.done; ) {
    if (!Object.is(s.value, a.value))
      return !1;
    s = n.next(), a = r.next();
  }
  return !!s.done && !!a.done;
};
function zk(t, e) {
  return Object.is(t, e) ? !0 : typeof t != "object" || t === null || typeof e != "object" || e === null || Object.getPrototypeOf(t) !== Object.getPrototypeOf(e) ? !1 : rv(t) && rv(e) ? iv(t) && iv(e) ? sv(t, e) : Lk(t, e) : sv(
    { entries: () => Object.entries(t) },
    { entries: () => Object.entries(e) }
  );
}
function $k(t) {
  const e = Kn.useRef(void 0);
  return (n) => {
    const r = t(n);
    return zk(e.current, r) ? e.current : e.current = r;
  };
}
const Lh = P.createContext({});
function zh(t) {
  const e = P.useRef(null);
  return e.current === null && (e.current = t()), e.current;
}
const Vk = typeof window < "u", R_ = Vk ? P.useLayoutEffect : P.useEffect, Cu = /* @__PURE__ */ P.createContext(null);
function $h(t, e) {
  t.indexOf(e) === -1 && t.push(e);
}
function tu(t, e) {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}
const jn = (t, e, n) => n > e ? e : n < t ? t : n;
function ov(t, e) {
  return e ? `${t}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${e}` : t;
}
let Ko = () => {
}, ui = () => {
};
var k_;
typeof process < "u" && ((k_ = process.env) == null ? void 0 : k_.NODE_ENV) !== "production" && (Ko = (t, e, n) => {
  !t && typeof console < "u" && console.warn(ov(e, n));
}, ui = (t, e, n) => {
  if (!t)
    throw new Error(ov(e, n));
});
const Cr = {}, N_ = (t) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t), I_ = (t) => typeof t == "object" && t !== null, D_ = (t) => /^0[^.\s]+$/u.test(t);
// @__NO_SIDE_EFFECTS__
function j_(t) {
  let e;
  return () => (e === void 0 && (e = t()), e);
}
const un = /* @__NO_SIDE_EFFECTS__ */ (t) => t, Yo = (...t) => t.reduce((e, n) => (r) => n(e(r))), Io = /* @__NO_SIDE_EFFECTS__ */ (t, e, n) => {
  const r = e - t;
  return r ? (n - t) / r : 1;
};
class Vh {
  constructor() {
    this.subscriptions = [];
  }
  add(e) {
    return $h(this.subscriptions, e), () => tu(this.subscriptions, e);
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
const It = /* @__NO_SIDE_EFFECTS__ */ (t) => t * 1e3, on = /* @__NO_SIDE_EFFECTS__ */ (t) => t / 1e3, F_ = /* @__NO_SIDE_EFFECTS__ */ (t, e) => e ? t * (1e3 / e) : 0, O_ = (t, e, n) => (((1 - 3 * n + 3 * e) * t + (3 * n - 6 * e)) * t + 3 * e) * t, Bk = 1e-7, Uk = 12;
function Hk(t, e, n, r, s) {
  let a, l, c = 0;
  do
    l = e + (n - e) / 2, a = O_(l, r, s) - t, a > 0 ? n = l : e = l;
  while (Math.abs(a) > Bk && ++c < Uk);
  return l;
}
// @__NO_SIDE_EFFECTS__
function qo(t, e, n, r) {
  if (t === e && n === r)
    return un;
  const s = (a) => Hk(a, 0, 1, t, n);
  return (a) => a === 0 || a === 1 ? a : O_(s(a), e, r);
}
const L_ = /* @__NO_SIDE_EFFECTS__ */ (t) => (e) => e <= 0.5 ? t(2 * e) / 2 : (2 - t(2 * (1 - e))) / 2, z_ = /* @__NO_SIDE_EFFECTS__ */ (t) => (e) => 1 - t(1 - e), $_ = /* @__PURE__ */ qo(0.33, 1.53, 0.69, 0.99), Bh = /* @__PURE__ */ z_($_), V_ = /* @__PURE__ */ L_(Bh), B_ = (t) => t >= 1 ? 1 : (t *= 2) < 1 ? 0.5 * Bh(t) : 0.5 * (2 - Math.pow(2, -10 * (t - 1))), Uh = (t) => 1 - Math.sin(Math.acos(t)), U_ = /* @__PURE__ */ z_(Uh), H_ = /* @__PURE__ */ L_(Uh), Wk = /* @__PURE__ */ qo(0.42, 0, 1, 1), Zk = /* @__PURE__ */ qo(0, 0, 0.58, 1), W_ = /* @__PURE__ */ qo(0.42, 0, 0.58, 1), Gk = /* @__NO_SIDE_EFFECTS__ */ (t) => Array.isArray(t) && typeof t[0] != "number", Z_ = /* @__NO_SIDE_EFFECTS__ */ (t) => Array.isArray(t) && typeof t[0] == "number", av = {
  linear: un,
  easeIn: Wk,
  easeInOut: W_,
  easeOut: Zk,
  circIn: Uh,
  circInOut: H_,
  circOut: U_,
  backIn: Bh,
  backInOut: V_,
  backOut: $_,
  anticipate: B_
}, Kk = (t) => typeof t == "string", lv = (t) => {
  if (/* @__PURE__ */ Z_(t)) {
    ui(t.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [e, n, r, s] = t;
    return /* @__PURE__ */ qo(e, n, r, s);
  } else if (Kk(t))
    return ui(av[t] !== void 0, `Invalid easing type '${t}'`, "invalid-easing-type"), av[t];
  return t;
}, _l = [
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
function Yk(t, e) {
  let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), s = !1, a = !1;
  const l = /* @__PURE__ */ new WeakSet();
  let c = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function f(g) {
    l.has(g) && (m.schedule(g), t()), g(c);
  }
  const m = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (g, d = !1, p = !1) => {
      const w = p && s ? n : r;
      return d && l.add(g), w.add(g), g;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (g) => {
      r.delete(g), l.delete(g);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (g) => {
      if (c = g, s) {
        a = !0;
        return;
      }
      s = !0;
      const d = n;
      n = r, r = d, n.forEach(f), n.clear(), s = !1, a && (a = !1, m.process(g));
    }
  };
  return m;
}
const qk = 40;
function G_(t, e) {
  let n = !1, r = !0;
  const s = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, a = () => n = !0, l = _l.reduce((E, M) => (E[M] = Yk(a), E), {}), { setup: c, read: f, resolveKeyframes: m, preUpdate: g, update: d, preRender: p, render: v, postRender: w } = l, S = () => {
    const E = Cr.useManualTiming, M = E ? s.timestamp : performance.now();
    n = !1, E || (s.delta = r ? 1e3 / 60 : Math.max(Math.min(M - s.timestamp, qk), 1)), s.timestamp = M, s.isProcessing = !0, c.process(s), f.process(s), m.process(s), g.process(s), d.process(s), p.process(s), v.process(s), w.process(s), s.isProcessing = !1, n && e && (r = !1, t(S));
  }, T = () => {
    n = !0, r = !0, s.isProcessing || t(S);
  };
  return { schedule: _l.reduce((E, M) => {
    const C = l[M];
    return E[M] = ($, I = !1, O = !1) => (n || T(), C.schedule($, I, O)), E;
  }, {}), cancel: (E) => {
    for (let M = 0; M < _l.length; M++)
      l[_l[M]].cancel(E);
  }, state: s, steps: l };
}
const { schedule: Ee, cancel: Pr, state: dt, steps: Bd } = /* @__PURE__ */ G_(typeof requestAnimationFrame < "u" ? requestAnimationFrame : un, !0);
let Dl;
function Qk() {
  Dl = void 0;
}
const Tt = {
  now: () => (Dl === void 0 && Tt.set(dt.isProcessing || Cr.useManualTiming ? dt.timestamp : performance.now()), Dl),
  set: (t) => {
    Dl = t, queueMicrotask(Qk);
  }
}, K_ = (t) => (e) => typeof e == "string" && e.startsWith(t), Y_ = /* @__PURE__ */ K_("--"), Xk = /* @__PURE__ */ K_("var(--"), Hh = (t) => Xk(t) ? Jk.test(t.split("/*")[0].trim()) : !1, Jk = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function uv(t) {
  return typeof t != "string" ? !1 : t.split("/*")[0].includes("var(--");
}
const Ss = {
  test: (t) => typeof t == "number",
  parse: parseFloat,
  transform: (t) => t
}, Do = {
  ...Ss,
  transform: (t) => jn(0, 1, t)
}, xl = {
  ...Ss,
  default: 1
}, So = (t) => Math.round(t * 1e5) / 1e5, Wh = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function eb(t) {
  return t == null;
}
const tb = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, Zh = (t, e) => (n) => !!(typeof n == "string" && tb.test(n) && n.startsWith(t) || e && !eb(n) && Object.prototype.hasOwnProperty.call(n, e)), q_ = (t, e, n) => (r) => {
  if (typeof r != "string")
    return r;
  const [s, a, l, c] = r.match(Wh);
  return {
    [t]: parseFloat(s),
    [e]: parseFloat(a),
    [n]: parseFloat(l),
    alpha: c !== void 0 ? parseFloat(c) : 1
  };
}, nb = (t) => jn(0, 255, t), Ud = {
  ...Ss,
  transform: (t) => Math.round(nb(t))
}, ei = {
  test: /* @__PURE__ */ Zh("rgb", "red"),
  parse: /* @__PURE__ */ q_("red", "green", "blue"),
  transform: ({ red: t, green: e, blue: n, alpha: r = 1 }) => "rgba(" + Ud.transform(t) + ", " + Ud.transform(e) + ", " + Ud.transform(n) + ", " + So(Do.transform(r)) + ")"
};
function rb(t) {
  let e = "", n = "", r = "", s = "";
  return t.length > 5 ? (e = t.substring(1, 3), n = t.substring(3, 5), r = t.substring(5, 7), s = t.substring(7, 9)) : (e = t.substring(1, 2), n = t.substring(2, 3), r = t.substring(3, 4), s = t.substring(4, 5), e += e, n += n, r += r, s += s), {
    red: parseInt(e, 16),
    green: parseInt(n, 16),
    blue: parseInt(r, 16),
    alpha: s ? parseInt(s, 16) / 255 : 1
  };
}
const Cf = {
  test: /* @__PURE__ */ Zh("#"),
  parse: rb,
  transform: ei.transform
}, Qo = /* @__NO_SIDE_EFFECTS__ */ (t) => ({
  test: (e) => typeof e == "string" && e.endsWith(t) && e.split(" ").length === 1,
  parse: parseFloat,
  transform: (e) => `${e}${t}`
}), Wn = /* @__PURE__ */ Qo("deg"), Dn = /* @__PURE__ */ Qo("%"), oe = /* @__PURE__ */ Qo("px"), ib = /* @__PURE__ */ Qo("vh"), sb = /* @__PURE__ */ Qo("vw"), cv = {
  ...Dn,
  parse: (t) => Dn.parse(t) / 100,
  transform: (t) => Dn.transform(t * 100)
}, Ki = {
  test: /* @__PURE__ */ Zh("hsl", "hue"),
  parse: /* @__PURE__ */ q_("hue", "saturation", "lightness"),
  transform: ({ hue: t, saturation: e, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(t) + ", " + Dn.transform(So(e)) + ", " + Dn.transform(So(n)) + ", " + So(Do.transform(r)) + ")"
}, Qe = {
  test: (t) => ei.test(t) || Cf.test(t) || Ki.test(t),
  parse: (t) => ei.test(t) ? ei.parse(t) : Ki.test(t) ? Ki.parse(t) : Cf.parse(t),
  transform: (t) => typeof t == "string" ? t : t.hasOwnProperty("red") ? ei.transform(t) : Ki.transform(t),
  getAnimatableNone: (t) => {
    const e = Qe.parse(t);
    return e.alpha = 0, Qe.transform(e);
  }
}, ob = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function ab(t) {
  var e, n;
  return isNaN(t) && typeof t == "string" && (((e = t.match(Wh)) == null ? void 0 : e.length) || 0) + (((n = t.match(ob)) == null ? void 0 : n.length) || 0) > 0;
}
const Q_ = "number", X_ = "color", lb = "var", ub = "var(", dv = "${}", cb = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function as(t) {
  const e = t.toString(), n = [], r = {
    color: [],
    number: [],
    var: []
  }, s = [];
  let a = 0;
  const c = e.replace(cb, (f) => (Qe.test(f) ? (r.color.push(a), s.push(X_), n.push(Qe.parse(f))) : f.startsWith(ub) ? (r.var.push(a), s.push(lb), n.push(f)) : (r.number.push(a), s.push(Q_), n.push(parseFloat(f))), ++a, dv)).split(dv);
  return { values: n, split: c, indexes: r, types: s };
}
function db(t) {
  return as(t).values;
}
function J_({ split: t, types: e }) {
  const n = t.length;
  return (r) => {
    let s = "";
    for (let a = 0; a < n; a++)
      if (s += t[a], r[a] !== void 0) {
        const l = e[a];
        l === Q_ ? s += So(r[a]) : l === X_ ? s += Qe.transform(r[a]) : s += r[a];
      }
    return s;
  };
}
function fb(t) {
  return J_(as(t));
}
const hb = (t) => typeof t == "number" ? 0 : Qe.test(t) ? Qe.getAnimatableNone(t) : t, pb = (t, e) => typeof t == "number" ? e != null && e.trim().endsWith("/") ? t : 0 : hb(t);
function mb(t) {
  const e = as(t);
  return J_(e)(e.values.map((r, s) => pb(r, e.split[s])));
}
const xn = {
  test: ab,
  parse: db,
  createTransformer: fb,
  getAnimatableNone: mb
};
function Hd(t, e, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? t + (e - t) * 6 * n : n < 1 / 2 ? e : n < 2 / 3 ? t + (e - t) * (2 / 3 - n) * 6 : t;
}
function gb({ hue: t, saturation: e, lightness: n, alpha: r }) {
  t /= 360, e /= 100, n /= 100;
  let s = 0, a = 0, l = 0;
  if (!e)
    s = a = l = n;
  else {
    const c = n < 0.5 ? n * (1 + e) : n + e - n * e, f = 2 * n - c;
    s = Hd(f, c, t + 1 / 3), a = Hd(f, c, t), l = Hd(f, c, t - 1 / 3);
  }
  return {
    red: Math.round(s * 255),
    green: Math.round(a * 255),
    blue: Math.round(l * 255),
    alpha: r
  };
}
function nu(t, e) {
  return (n) => n > 0 ? e : t;
}
const Pe = (t, e, n) => t + (e - t) * n, Wd = (t, e, n) => {
  const r = t * t, s = n * (e * e - r) + r;
  return s < 0 ? 0 : Math.sqrt(s);
}, yb = [Cf, ei, Ki], vb = (t) => yb.find((e) => e.test(t));
function fv(t) {
  const e = vb(t);
  if (Ko(!!e, `'${t}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !e)
    return !1;
  let n = e.parse(t);
  return e === Ki && (n = gb(n)), n;
}
const hv = (t, e) => {
  const n = fv(t), r = fv(e);
  if (!n || !r)
    return nu(t, e);
  const s = { ...n };
  return (a) => (s.red = Wd(n.red, r.red, a), s.green = Wd(n.green, r.green, a), s.blue = Wd(n.blue, r.blue, a), s.alpha = Pe(n.alpha, r.alpha, a), ei.transform(s));
}, Pf = /* @__PURE__ */ new Set(["none", "hidden"]);
function _b(t, e) {
  return Pf.has(t) ? (n) => n <= 0 ? t : e : (n) => n >= 1 ? e : t;
}
function xb(t, e) {
  return (n) => Pe(t, e, n);
}
function Gh(t) {
  return typeof t == "number" ? xb : typeof t == "string" ? Hh(t) ? nu : Qe.test(t) ? hv : Tb : Array.isArray(t) ? ex : typeof t == "object" ? Qe.test(t) ? hv : Sb : nu;
}
function ex(t, e) {
  const n = [...t], r = n.length, s = t.map((a, l) => Gh(a)(a, e[l]));
  return (a) => {
    for (let l = 0; l < r; l++)
      n[l] = s[l](a);
    return n;
  };
}
function Sb(t, e) {
  const n = { ...t, ...e }, r = {};
  for (const s in n)
    t[s] !== void 0 && e[s] !== void 0 && (r[s] = Gh(t[s])(t[s], e[s]));
  return (s) => {
    for (const a in r)
      n[a] = r[a](s);
    return n;
  };
}
function wb(t, e) {
  const n = [], r = { color: 0, var: 0, number: 0 };
  for (let s = 0; s < e.values.length; s++) {
    const a = e.types[s], l = t.indexes[a][r[a]], c = t.values[l] ?? 0;
    n[s] = c, r[a]++;
  }
  return n;
}
const Tb = (t, e) => {
  const n = xn.createTransformer(e), r = as(t), s = as(e);
  return r.indexes.var.length === s.indexes.var.length && r.indexes.color.length === s.indexes.color.length && r.indexes.number.length >= s.indexes.number.length ? Pf.has(t) && !s.values.length || Pf.has(e) && !r.values.length ? _b(t, e) : Yo(ex(wb(r, s), s.values), n) : (Ko(!0, `Complex values '${t}' and '${e}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), nu(t, e));
};
function tx(t, e, n) {
  return typeof t == "number" && typeof e == "number" && typeof n == "number" ? Pe(t, e, n) : Gh(t)(t, e);
}
const Ab = (t) => {
  const e = ({ timestamp: n }) => t(n);
  return {
    start: (n = !0) => Ee.update(e, n),
    stop: () => Pr(e),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => dt.isProcessing ? dt.timestamp : Tt.now()
  };
}, nx = (t, e, n = 10) => {
  let r = "";
  const s = Math.max(Math.round(e / n), 2);
  for (let a = 0; a < s; a++)
    r += Math.round(t(a / (s - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${r.substring(0, r.length - 2)})`;
}, ru = 2e4;
function Kh(t) {
  let e = 0;
  const n = 50;
  let r = t.next(e);
  for (; !r.done && e < ru; )
    e += n, r = t.next(e);
  return e >= ru ? 1 / 0 : e;
}
function kb(t, e = 100, n) {
  const r = n({ ...t, keyframes: [0, e] }), s = Math.min(Kh(r), ru);
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
function Ef(t, e) {
  return t * Math.sqrt(1 - e * e);
}
const bb = 12;
function Cb(t, e, n) {
  let r = n;
  for (let s = 1; s < bb; s++)
    r = r - t(r) / e(r);
  return r;
}
const Zd = 1e-3;
function Pb({ duration: t = $e.duration, bounce: e = $e.bounce, velocity: n = $e.velocity, mass: r = $e.mass }) {
  let s, a;
  Ko(t <= /* @__PURE__ */ It($e.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let l = 1 - e;
  l = jn($e.minDamping, $e.maxDamping, l), t = jn($e.minDuration, $e.maxDuration, /* @__PURE__ */ on(t)), l < 1 ? (s = (m) => {
    const g = m * l, d = g * t, p = g - n, v = Ef(m, l), w = Math.exp(-d);
    return Zd - p / v * w;
  }, a = (m) => {
    const d = m * l * t, p = d * n + n, v = Math.pow(l, 2) * Math.pow(m, 2) * t, w = Math.exp(-d), S = Ef(Math.pow(m, 2), l);
    return (-s(m) + Zd > 0 ? -1 : 1) * ((p - v) * w) / S;
  }) : (s = (m) => {
    const g = Math.exp(-m * t), d = (m - n) * t + 1;
    return -Zd + g * d;
  }, a = (m) => {
    const g = Math.exp(-m * t), d = (n - m) * (t * t);
    return g * d;
  });
  const c = 5 / t, f = Cb(s, a, c);
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
const Eb = ["duration", "bounce"], Mb = ["stiffness", "damping", "mass"];
function pv(t, e) {
  return e.some((n) => t[n] !== void 0);
}
function Rb(t) {
  let e = {
    velocity: $e.velocity,
    stiffness: $e.stiffness,
    damping: $e.damping,
    mass: $e.mass,
    isResolvedFromDuration: !1,
    ...t
  };
  if (!pv(t, Mb) && pv(t, Eb))
    if (e.velocity = 0, t.visualDuration) {
      const n = t.visualDuration, r = 2 * Math.PI / (n * 1.2), s = r * r, a = 2 * jn(0.05, 1, 1 - (t.bounce || 0)) * Math.sqrt(s);
      e = {
        ...e,
        mass: $e.mass,
        stiffness: s,
        damping: a
      };
    } else {
      const n = Pb({ ...t, velocity: 0 });
      e = {
        ...e,
        ...n,
        mass: $e.mass
      }, e.isResolvedFromDuration = !0;
    }
  return e;
}
function iu(t = $e.visualDuration, e = $e.bounce) {
  const n = typeof t != "object" ? {
    visualDuration: t,
    keyframes: [0, 1],
    bounce: e
  } : t;
  let { restSpeed: r, restDelta: s } = n;
  const a = n.keyframes[0], l = n.keyframes[n.keyframes.length - 1], c = { done: !1, value: a }, { stiffness: f, damping: m, mass: g, duration: d, velocity: p, isResolvedFromDuration: v } = Rb({
    ...n,
    velocity: -/* @__PURE__ */ on(n.velocity || 0)
  }), w = p || 0, S = m / (2 * Math.sqrt(f * g)), T = l - a, A = /* @__PURE__ */ on(Math.sqrt(f / g)), b = Math.abs(T) < 5;
  r || (r = b ? $e.restSpeed.granular : $e.restSpeed.default), s || (s = b ? $e.restDelta.granular : $e.restDelta.default);
  let E, M, C, $, I, O;
  if (S < 1)
    C = Ef(A, S), $ = (w + S * A * T) / C, E = (U) => {
      const q = Math.exp(-S * A * U);
      return l - q * ($ * Math.sin(C * U) + T * Math.cos(C * U));
    }, I = S * A * $ + T * C, O = S * A * T - $ * C, M = (U) => Math.exp(-S * A * U) * (I * Math.sin(C * U) + O * Math.cos(C * U));
  else if (S === 1) {
    E = (q) => l - Math.exp(-A * q) * (T + (w + A * T) * q);
    const U = w + A * T;
    M = (q) => Math.exp(-A * q) * (A * U * q - w);
  } else {
    const U = A * Math.sqrt(S * S - 1);
    E = (ie) => {
      const ge = Math.exp(-S * A * ie), ce = Math.min(U * ie, 300);
      return l - ge * ((w + S * A * T) * Math.sinh(ce) + U * T * Math.cosh(ce)) / U;
    };
    const q = (w + S * A * T) / U, ee = S * A * q - T * U, ne = S * A * T - q * U;
    M = (ie) => {
      const ge = Math.exp(-S * A * ie), ce = Math.min(U * ie, 300);
      return ge * (ee * Math.sinh(ce) + ne * Math.cosh(ce));
    };
  }
  const L = {
    calculatedDuration: v && d || null,
    velocity: (U) => /* @__PURE__ */ It(M(U)),
    next: (U) => {
      if (!v && S < 1) {
        const ee = Math.exp(-S * A * U), ne = Math.sin(C * U), ie = Math.cos(C * U), ge = l - ee * ($ * ne + T * ie), ce = /* @__PURE__ */ It(ee * (I * ne + O * ie));
        return c.done = Math.abs(ce) <= r && Math.abs(l - ge) <= s, c.value = c.done ? l : ge, c;
      }
      const q = E(U);
      if (v)
        c.done = U >= d;
      else {
        const ee = /* @__PURE__ */ It(M(U));
        c.done = Math.abs(ee) <= r && Math.abs(l - q) <= s;
      }
      return c.value = c.done ? l : q, c;
    },
    toString: () => {
      const U = Math.min(Kh(L), ru), q = nx((ee) => L.next(U * ee).value, U, 30);
      return U + "ms " + q;
    },
    toTransition: () => {
    }
  };
  return L;
}
iu.applyToOptions = (t) => {
  const e = kb(t, 100, iu);
  return t.ease = e.ease, t.duration = /* @__PURE__ */ It(e.duration), t.type = "keyframes", t;
};
const Nb = 5;
function rx(t, e, n) {
  const r = Math.max(e - Nb, 0);
  return /* @__PURE__ */ F_(n - t(r), e - r);
}
function Mf({ keyframes: t, velocity: e = 0, power: n = 0.8, timeConstant: r = 325, bounceDamping: s = 10, bounceStiffness: a = 500, modifyTarget: l, min: c, max: f, restDelta: m = 0.5, restSpeed: g }) {
  const d = t[0], p = {
    done: !1,
    value: d
  }, v = (O) => c !== void 0 && O < c || f !== void 0 && O > f, w = (O) => c === void 0 ? f : f === void 0 || Math.abs(c - O) < Math.abs(f - O) ? c : f;
  let S = n * e;
  const T = d + S, A = l === void 0 ? T : l(T);
  A !== T && (S = A - d);
  const b = (O) => -S * Math.exp(-O / r), E = (O) => A + b(O), M = (O) => {
    const L = b(O), U = E(O);
    p.done = Math.abs(L) <= m, p.value = p.done ? A : U;
  };
  let C, $;
  const I = (O) => {
    v(p.value) && (C = O, $ = iu({
      keyframes: [p.value, w(p.value)],
      velocity: rx(E, O, p.value),
      // TODO: This should be passing * 1000
      damping: s,
      stiffness: a,
      restDelta: m,
      restSpeed: g
    }));
  };
  return I(0), {
    calculatedDuration: null,
    next: (O) => {
      let L = !1;
      return !$ && C === void 0 && (L = !0, M(O), I(O)), C !== void 0 && O >= C ? $.next(O - C) : (!L && M(O), p);
    }
  };
}
function Ib(t, e, n) {
  const r = [], s = n || Cr.mix || tx, a = t.length - 1;
  for (let l = 0; l < a; l++) {
    let c = s(t[l], t[l + 1]);
    if (e) {
      const f = Array.isArray(e) ? e[l] || un : e;
      c = Yo(f, c);
    }
    r.push(c);
  }
  return r;
}
function Db(t, e, { clamp: n = !0, ease: r, mixer: s } = {}) {
  const a = t.length;
  if (ui(a === e.length, "Both input and output ranges must be the same length", "range-length"), a === 1)
    return () => e[0];
  if (a === 2 && e[0] === e[1])
    return () => e[1];
  const l = t[0] === t[1];
  t[0] > t[a - 1] && (t = [...t].reverse(), e = [...e].reverse());
  const c = Ib(e, r, s), f = c.length, m = (g) => {
    if (l && g < t[0])
      return e[0];
    let d = 0;
    if (f > 1)
      for (; d < t.length - 2 && !(g < t[d + 1]); d++)
        ;
    const p = /* @__PURE__ */ Io(t[d], t[d + 1], g);
    return c[d](p);
  };
  return n ? (g) => m(jn(t[0], t[a - 1], g)) : m;
}
function jb(t, e) {
  const n = t[t.length - 1];
  for (let r = 1; r <= e; r++) {
    const s = /* @__PURE__ */ Io(0, e, r);
    t.push(Pe(n, 1, s));
  }
}
function Fb(t) {
  const e = [0];
  return jb(e, t.length - 1), e;
}
function Ob(t, e) {
  return t.map((n) => n * e);
}
function Lb(t, e) {
  return t.map(() => e || W_).splice(0, t.length - 1);
}
function wo({ duration: t = 300, keyframes: e, times: n, ease: r = "easeInOut" }) {
  const s = /* @__PURE__ */ Gk(r) ? r.map(lv) : lv(r), a = {
    done: !1,
    value: e[0]
  }, l = Ob(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === e.length ? n : Fb(e),
    t
  ), c = Db(l, e, {
    ease: Array.isArray(s) ? s : Lb(e, s)
  });
  return {
    calculatedDuration: t,
    next: (f) => (a.value = c(f), a.done = f >= t, a)
  };
}
const zb = (t) => t !== null;
function Pu(t, { repeat: e, repeatType: n = "loop" }, r, s = 1) {
  const a = t.filter(zb), c = s < 0 || e && n !== "loop" && e % 2 === 1 ? 0 : a.length - 1;
  return !c || r === void 0 ? a[c] : r;
}
const $b = {
  decay: Mf,
  inertia: Mf,
  tween: wo,
  keyframes: wo,
  spring: iu
};
function ix(t) {
  typeof t.type == "string" && (t.type = $b[t.type]);
}
class Yh {
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
const Vb = (t) => t / 100;
class su extends Yh {
  constructor(e) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      var r, s;
      const { motionValue: n } = this.options;
      n && n.updatedAt !== Tt.now() && this.tick(Tt.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), (s = (r = this.options).onStop) == null || s.call(r));
    }, this.options = e, this.initAnimation(), this.play(), e.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: e } = this;
    ix(e);
    const { type: n = wo, repeat: r = 0, repeatDelay: s = 0, repeatType: a, velocity: l = 0 } = e;
    let { keyframes: c } = e;
    const f = n || wo;
    f !== wo && typeof c[0] != "number" && (this.mixKeyframes = Yo(Vb, tx(c[0], c[1])), c = [0, 100]);
    const m = f({ ...e, keyframes: c });
    a === "mirror" && (this.mirroredGenerator = f({
      ...e,
      keyframes: [...c].reverse(),
      velocity: -l
    })), m.calculatedDuration === null && (m.calculatedDuration = Kh(m));
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
    const { delay: m = 0, keyframes: g, repeat: d, repeatType: p, repeatDelay: v, type: w, onUpdate: S, finalKeyframe: T } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, e) : this.speed < 0 && (this.startTime = Math.min(e - s / this.speed, this.startTime)), n ? this.currentTime = e : this.updateTime(e);
    const A = this.currentTime - m * (this.playbackSpeed >= 0 ? 1 : -1), b = this.playbackSpeed >= 0 ? A < 0 : A > s;
    this.currentTime = Math.max(A, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = s);
    let E = this.currentTime, M = r;
    if (d) {
      const O = Math.min(this.currentTime, s) / c;
      let L = Math.floor(O), U = O % 1;
      !U && O >= 1 && (U = 1), U === 1 && L--, L = Math.min(L, d + 1), !!(L % 2) && (p === "reverse" ? (U = 1 - U, v && (U -= v / c)) : p === "mirror" && (M = l)), E = jn(0, 1, U) * c;
    }
    let C;
    b ? (this.delayState.value = g[0], C = this.delayState) : C = M.next(E), a && !b && (C.value = a(C.value));
    let { done: $ } = C;
    !b && f !== null && ($ = this.playbackSpeed >= 0 ? this.currentTime >= s : this.currentTime <= 0);
    const I = this.holdTime === null && (this.state === "finished" || this.state === "running" && $);
    return I && w !== Mf && (C.value = Pu(g, this.options, T, this.speed)), S && S(C.value), I && this.finish(), C;
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
    return rx((r) => this.generator.next(r).value, e, n);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(e) {
    const n = this.playbackSpeed !== e;
    n && this.driver && this.updateTime(Tt.now()), this.playbackSpeed = e, n && this.driver && (this.time = /* @__PURE__ */ on(this.currentTime));
  }
  play() {
    var s, a;
    if (this.isStopped)
      return;
    const { driver: e = Ab, startTime: n } = this.options;
    this.driver || (this.driver = e((l) => this.tick(l))), (a = (s = this.options).onPlay) == null || a.call(s);
    const r = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = r) : this.holdTime !== null ? this.startTime = r - this.holdTime : this.startTime || (this.startTime = n ?? r), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(Tt.now()), this.holdTime = this.currentTime;
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
function Bb(t) {
  for (let e = 1; e < t.length; e++)
    t[e] ?? (t[e] = t[e - 1]);
}
const ti = (t) => t * 180 / Math.PI, Rf = (t) => {
  const e = ti(Math.atan2(t[1], t[0]));
  return Nf(e);
}, Ub = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (t) => (Math.abs(t[0]) + Math.abs(t[3])) / 2,
  rotate: Rf,
  rotateZ: Rf,
  skewX: (t) => ti(Math.atan(t[1])),
  skewY: (t) => ti(Math.atan(t[2])),
  skew: (t) => (Math.abs(t[1]) + Math.abs(t[2])) / 2
}, Nf = (t) => (t = t % 360, t < 0 && (t += 360), t), mv = Rf, gv = (t) => Math.sqrt(t[0] * t[0] + t[1] * t[1]), yv = (t) => Math.sqrt(t[4] * t[4] + t[5] * t[5]), Hb = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: gv,
  scaleY: yv,
  scale: (t) => (gv(t) + yv(t)) / 2,
  rotateX: (t) => Nf(ti(Math.atan2(t[6], t[5]))),
  rotateY: (t) => Nf(ti(Math.atan2(-t[2], t[0]))),
  rotateZ: mv,
  rotate: mv,
  skewX: (t) => ti(Math.atan(t[4])),
  skewY: (t) => ti(Math.atan(t[1])),
  skew: (t) => (Math.abs(t[1]) + Math.abs(t[4])) / 2
};
function If(t) {
  return t.includes("scale") ? 1 : 0;
}
function Df(t, e) {
  if (!t || t === "none")
    return If(e);
  const n = t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let r, s;
  if (n)
    r = Hb, s = n;
  else {
    const c = t.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    r = Ub, s = c;
  }
  if (!s)
    return If(e);
  const a = r[e], l = s[1].split(",").map(Zb);
  return typeof a == "function" ? a(l) : l[a];
}
const Wb = (t, e) => {
  const { transform: n = "none" } = getComputedStyle(t);
  return Df(n, e);
};
function Zb(t) {
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
], Ts = /* @__PURE__ */ new Set([...ws, "pathRotation"]), vv = (t) => t === Ss || t === oe, Gb = /* @__PURE__ */ new Set(["x", "y", "z"]), Kb = ws.filter((t) => !Gb.has(t));
function Yb(t) {
  const e = [];
  return Kb.forEach((n) => {
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
  x: (t, { transform: e }) => Df(e, "x"),
  y: (t, { transform: e }) => Df(e, "y")
};
xr.translateX = xr.x;
xr.translateY = xr.y;
const ri = /* @__PURE__ */ new Set();
let jf = !1, Ff = !1, Of = !1;
function sx() {
  if (Ff) {
    const t = Array.from(ri).filter((r) => r.needsMeasurement), e = new Set(t.map((r) => r.element)), n = /* @__PURE__ */ new Map();
    e.forEach((r) => {
      const s = Yb(r);
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
  Ff = !1, jf = !1, ri.forEach((t) => t.complete(Of)), ri.clear();
}
function ox() {
  ri.forEach((t) => {
    t.readKeyframes(), t.needsMeasurement && (Ff = !0);
  });
}
function qb() {
  Of = !0, ox(), sx(), Of = !1;
}
class qh {
  constructor(e, n, r, s, a, l = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...e], this.onComplete = n, this.name = r, this.motionValue = s, this.element = a, this.isAsync = l;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (ri.add(this), jf || (jf = !0, Ee.read(ox), Ee.resolveKeyframes(sx))) : (this.readKeyframes(), this.complete());
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
    Bb(e);
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
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, e), ri.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (ri.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const Qb = (t) => t.startsWith("--");
function ax(t, e, n) {
  Qb(e) ? t.style.setProperty(e, n) : t.style[e] = n;
}
const Xb = {};
function lx(t, e) {
  const n = /* @__PURE__ */ j_(t);
  return () => Xb[e] ?? n();
}
const Jb = /* @__PURE__ */ lx(() => window.ScrollTimeline !== void 0, "scrollTimeline"), ux = /* @__PURE__ */ lx(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), mo = ([t, e, n, r]) => `cubic-bezier(${t}, ${e}, ${n}, ${r})`, _v = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ mo([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ mo([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ mo([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ mo([0.33, 1.53, 0.69, 0.99])
};
function cx(t, e) {
  if (t)
    return typeof t == "function" ? ux() ? nx(t, e) : "ease-out" : /* @__PURE__ */ Z_(t) ? mo(t) : Array.isArray(t) ? t.map((n) => cx(n, e) || _v.easeOut) : _v[t];
}
function eC(t, e, n, { delay: r = 0, duration: s = 300, repeat: a = 0, repeatType: l = "loop", ease: c = "easeOut", times: f } = {}, m = void 0) {
  const g = {
    [e]: n
  };
  f && (g.offset = f);
  const d = cx(c, s);
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
function dx(t) {
  return typeof t == "function" && "applyToOptions" in t;
}
function tC({ type: t, ...e }) {
  return dx(t) && ux() ? t.applyToOptions(e) : (e.duration ?? (e.duration = 300), e.ease ?? (e.ease = "easeOut"), e);
}
class fx extends Yh {
  constructor(e) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !e)
      return;
    const { element: n, name: r, keyframes: s, pseudoElement: a, allowFlatten: l = !1, finalKeyframe: c, onComplete: f } = e;
    this.isPseudoElement = !!a, this.allowFlatten = l, this.options = e, ui(typeof e.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const m = tC(e);
    this.animation = eC(n, r, s, m, a), m.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !a) {
        const g = Pu(s, this.options, c, this.speed);
        this.updateMotionValue && this.updateMotionValue(g), ax(n, r, g), this.animation.cancel();
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
    return this.allowFlatten && ((a = this.animation.effect) == null || a.updateTiming({ easing: "linear" })), this.animation.onfinish = null, e && Jb() ? (this.animation.timeline = e, n && (this.animation.rangeStart = n), r && (this.animation.rangeEnd = r), un) : s(this);
  }
}
const hx = {
  anticipate: B_,
  backInOut: V_,
  circInOut: H_
};
function nC(t) {
  return t in hx;
}
function rC(t) {
  typeof t.ease == "string" && nC(t.ease) && (t.ease = hx[t.ease]);
}
const Gd = 10;
class iC extends fx {
  constructor(e) {
    rC(e), ix(e), super(e), e.startTime !== void 0 && e.autoplay !== !1 && (this.startTime = e.startTime), this.options = e;
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
    const c = new su({
      ...l,
      autoplay: !1
    }), f = Math.max(Gd, Tt.now() - this.startTime), m = jn(0, Gd, f - Gd), g = c.sample(f).value, { name: d } = this.options;
    a && d && ax(a, d, g), n.setWithVelocity(c.sample(Math.max(0, f - m)).value, g, m), c.stop();
  }
}
const xv = (t, e) => e === "zIndex" ? !1 : !!(typeof t == "number" || Array.isArray(t) || typeof t == "string" && // It's animatable if we have a string
(xn.test(t) || t === "0") && // And it contains numbers and/or colors
!t.startsWith("url("));
function sC(t) {
  const e = t[0];
  if (t.length === 1)
    return !0;
  for (let n = 0; n < t.length; n++)
    if (t[n] !== e)
      return !0;
}
function oC(t, e, n, r) {
  const s = t[0];
  if (s === null)
    return !1;
  if (e === "display" || e === "visibility")
    return !0;
  const a = t[t.length - 1], l = xv(s, e), c = xv(a, e);
  return Ko(l === c, `You are trying to animate ${e} from "${s}" to "${a}". "${l ? a : s}" is not an animatable value.`, "value-not-animatable"), !l || !c ? !1 : sC(t) || (n === "spring" || dx(n)) && r;
}
function Lf(t) {
  t.duration = 0, t.type = "keyframes";
}
const px = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), aC = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function lC(t) {
  for (let e = 0; e < t.length; e++)
    if (typeof t[e] == "string" && aC.test(t[e]))
      return !0;
  return !1;
}
const uC = /* @__PURE__ */ new Set([
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
]), cC = /* @__PURE__ */ j_(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function dC(t) {
  var d;
  const { motionValue: e, name: n, repeatDelay: r, repeatType: s, damping: a, type: l, keyframes: c } = t;
  if (!(((d = e == null ? void 0 : e.owner) == null ? void 0 : d.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: m, transformTemplate: g } = e.owner.getProps();
  return cC() && n && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (px.has(n) || uC.has(n) && lC(c)) && (n !== "transform" || !g) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !m && !r && s !== "mirror" && a !== 0 && l !== "inertia";
}
const fC = 40;
class hC extends Yh {
  constructor({ autoplay: e = !0, delay: n = 0, type: r = "keyframes", repeat: s = 0, repeatDelay: a = 0, repeatType: l = "loop", keyframes: c, name: f, motionValue: m, element: g, ...d }) {
    var w;
    super(), this.stop = () => {
      var S, T;
      this._animation && (this._animation.stop(), (S = this.stopTimeline) == null || S.call(this)), (T = this.keyframeResolver) == null || T.cancel();
    }, this.createdAt = Tt.now();
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
    }, v = (g == null ? void 0 : g.KeyframeResolver) || qh;
    this.keyframeResolver = new v(c, (S, T, A) => this.onKeyframesResolved(S, T, p, !A), f, m, g), (w = this.keyframeResolver) == null || w.scheduleResolve();
  }
  onKeyframesResolved(e, n, r, s) {
    var A, b;
    this.keyframeResolver = void 0;
    const { name: a, type: l, velocity: c, delay: f, isHandoff: m, onUpdate: g } = r;
    this.resolvedAt = Tt.now();
    let d = !0;
    oC(e, a, l, c) || (d = !1, (Cr.instantAnimations || !f) && (g == null || g(Pu(e, r, n))), e[0] = e[e.length - 1], Lf(r), r.repeat = 0);
    const v = {
      startTime: s ? this.resolvedAt ? this.resolvedAt - this.createdAt > fC ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: n,
      ...r,
      keyframes: e
    }, w = d && !m && dC(v), S = (b = (A = v.motionValue) == null ? void 0 : A.owner) == null ? void 0 : b.current;
    let T;
    if (w)
      try {
        T = new iC({
          ...v,
          element: S
        });
      } catch {
        T = new su(v);
      }
    else
      T = new su(v);
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
    return this._animation || ((e = this.keyframeResolver) == null || e.resume(), qb()), this._animation;
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
function mx(t, e, n, r = 0, s = 1) {
  const a = Array.from(t).sort((m, g) => m.sortNodePosition(g)).indexOf(e), l = t.size, c = (l - 1) * r;
  return typeof n == "function" ? n(a, l) : s === 1 ? a * r : c - a * r;
}
const Sv = 30, pC = (t) => !isNaN(parseFloat(t));
class mC {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(e, n = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (r) => {
      var a;
      const s = Tt.now();
      if (this.updatedAt !== s && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(r), this.current !== this.prev && ((a = this.events.change) == null || a.notify(this.current), this.dependents))
        for (const l of this.dependents)
          l.dirty();
    }, this.hasAnimated = !1, this.setCurrent(e), this.owner = n.owner;
  }
  setCurrent(e) {
    this.current = e, this.updatedAt = Tt.now(), this.canTrackVelocity === null && e !== void 0 && (this.canTrackVelocity = pC(this.current));
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
    this.events[e] || (this.events[e] = new Vh());
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
    const e = Tt.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || e - this.updatedAt > Sv)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, Sv);
    return /* @__PURE__ */ F_(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
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
  return new mC(t, e);
}
function gx(t, e) {
  if (t != null && t.inherit && e) {
    const { inherit: n, ...r } = t;
    return { ...e, ...r };
  }
  return t;
}
function Qh(t, e) {
  const n = (t == null ? void 0 : t[e]) ?? (t == null ? void 0 : t.default) ?? t;
  return n !== t ? gx(n, t) : n;
}
const gC = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, yC = (t) => ({
  type: "spring",
  stiffness: 550,
  damping: t === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), vC = {
  type: "keyframes",
  duration: 0.8
}, _C = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, xC = (t, { keyframes: e }) => e.length > 2 ? vC : Ts.has(t) ? t.startsWith("scale") ? yC(e[1]) : gC : _C, SC = /* @__PURE__ */ new Set([
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
function wC(t) {
  for (const e in t)
    if (!SC.has(e))
      return !0;
  return !1;
}
const Xh = (t, e, n, r = {}, s, a) => (l) => {
  const c = Qh(r, t) || {}, f = c.delay || r.delay || 0;
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
  wC(c) || Object.assign(g, xC(t, g)), g.duration && (g.duration = /* @__PURE__ */ It(g.duration)), g.repeatDelay && (g.repeatDelay = /* @__PURE__ */ It(g.repeatDelay)), g.from !== void 0 && (g.keyframes[0] = g.from);
  let d = !1;
  if ((g.type === !1 || g.duration === 0 && !g.repeatDelay) && (Lf(g), g.delay === 0 && (d = !0)), (Cr.instantAnimations || Cr.skipAnimations || s != null && s.shouldSkipAnimations || c.skipAnimations) && (d = !0, Lf(g), g.delay = 0), g.allowFlatten = !c.type && !c.ease, d && !a && e.get() !== void 0) {
    const p = Pu(g.keyframes, c);
    if (p !== void 0) {
      Ee.update(() => {
        g.onUpdate(p), g.onComplete();
      });
      return;
    }
  }
  return c.isSync ? new su(g) : new hC(g);
}, TC = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function AC(t) {
  const e = TC.exec(t);
  if (!e)
    return [,];
  const [, n, r, s] = e;
  return [`--${n ?? r}`, s];
}
const kC = 4;
function yx(t, e, n = 1) {
  ui(n <= kC, `Max CSS variable fallback depth detected in property "${t}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [r, s] = AC(t);
  if (!r)
    return;
  const a = window.getComputedStyle(e).getPropertyValue(r);
  if (a) {
    const l = a.trim();
    return N_(l) ? parseFloat(l) : l;
  }
  return Hh(s) ? yx(s, e, n + 1) : s;
}
function wv(t) {
  const e = [{}, {}];
  return t == null || t.values.forEach((n, r) => {
    e[0][r] = n.get(), e[1][r] = n.getVelocity();
  }), e;
}
function Jh(t, e, n, r) {
  if (typeof e == "function") {
    const [s, a] = wv(r);
    e = e(n !== void 0 ? n : t.custom, s, a);
  }
  if (typeof e == "string" && (e = t.variants && t.variants[e]), typeof e == "function") {
    const [s, a] = wv(r);
    e = e(n !== void 0 ? n : t.custom, s, a);
  }
  return e;
}
function ii(t, e, n) {
  const r = t.getProps();
  return Jh(r, e, n !== void 0 ? n : r.custom, t);
}
const vx = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...ws
]), zf = (t) => Array.isArray(t);
function bC(t, e, n) {
  t.hasValue(e) ? t.getValue(e).set(n) : t.addValue(e, ls(n));
}
function CC(t) {
  return zf(t) ? t[t.length - 1] || 0 : t;
}
function PC(t, e) {
  const n = ii(t, e);
  let { transitionEnd: r = {}, transition: s = {}, ...a } = n || {};
  a = { ...a, ...r };
  for (const l in a) {
    const c = CC(a[l]);
    bC(t, l, c);
  }
}
const ft = (t) => !!(t && t.getVelocity);
function EC(t) {
  return !!(ft(t) && t.add);
}
function $f(t, e) {
  const n = t.getValue("willChange");
  if (EC(n))
    return n.add(e);
  if (!n && Cr.WillChange) {
    const r = new Cr.WillChange("auto");
    t.addValue("willChange", r), r.add(e);
  }
}
function ep(t) {
  return t.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`);
}
const MC = "framerAppearId", _x = "data-" + ep(MC);
function xx(t) {
  return t.props[_x];
}
function RC({ protectedKeys: t, needsAnimating: e }, n) {
  const r = t.hasOwnProperty(n) && e[n] !== !0;
  return e[n] = !1, r;
}
function Sx(t, e, { delay: n = 0, transitionOverride: r, type: s } = {}) {
  let { transition: a, transitionEnd: l, ...c } = e;
  const f = t.getDefaultTransition();
  a = a ? gx(a, f) : f;
  const m = a == null ? void 0 : a.reduceMotion, g = a == null ? void 0 : a.skipAnimations;
  r && (a = r);
  const d = [], p = s && t.animationState && t.animationState.getState()[s], v = a == null ? void 0 : a.path;
  v && v.animateVisualElement(t, c, a, n, d);
  for (const w in c) {
    const S = t.getValue(w, t.latestValues[w] ?? null), T = c[w];
    if (T === void 0 || p && RC(p, w))
      continue;
    const A = {
      delay: n,
      ...Qh(a || {}, w)
    };
    g && (A.skipAnimations = !0);
    const b = S.get();
    if (b !== void 0 && !S.isAnimating() && !Array.isArray(T) && T === b && !A.velocity) {
      Ee.update(() => S.set(T));
      continue;
    }
    let E = !1;
    if (window.MotionHandoffAnimation) {
      const $ = xx(t);
      if ($) {
        const I = window.MotionHandoffAnimation($, w, Ee);
        I !== null && (A.startTime = I, E = !0);
      }
    }
    $f(t, w);
    const M = m ?? t.shouldReduceMotion;
    S.start(Xh(w, S, T, M && vx.has(w) ? { type: !1 } : A, t, E));
    const C = S.animation;
    C && d.push(C);
  }
  if (l) {
    const w = () => Ee.update(() => {
      l && PC(t, l);
    });
    d.length ? Promise.all(d).then(w) : w();
  }
  return d;
}
function Vf(t, e, n = {}) {
  var f;
  const r = ii(t, e, n.type === "exit" ? (f = t.presenceContext) == null ? void 0 : f.custom : void 0);
  let { transition: s = t.getDefaultTransition() || {} } = r || {};
  n.transitionOverride && (s = n.transitionOverride);
  const a = r ? () => Promise.all(Sx(t, r, n)) : () => Promise.resolve(), l = t.variantChildren && t.variantChildren.size ? (m = 0) => {
    const { delayChildren: g = 0, staggerChildren: d, staggerDirection: p } = s;
    return NC(t, e, m, g, d, p, n);
  } : () => Promise.resolve(), { when: c } = s;
  if (c) {
    const [m, g] = c === "beforeChildren" ? [a, l] : [l, a];
    return m().then(() => g());
  } else
    return Promise.all([a(), l(n.delay)]);
}
function NC(t, e, n = 0, r = 0, s = 0, a = 1, l) {
  const c = [];
  for (const f of t.variantChildren)
    f.notify("AnimationStart", e), c.push(Vf(f, e, {
      ...l,
      delay: n + (typeof r == "function" ? 0 : r) + mx(t.variantChildren, f, r, s, a)
    }).then(() => f.notify("AnimationComplete", e)));
  return Promise.all(c);
}
function IC(t, e, n = {}) {
  t.notify("AnimationStart", e);
  let r;
  if (Array.isArray(e)) {
    const s = e.map((a) => Vf(t, a, n));
    r = Promise.all(s);
  } else if (typeof e == "string")
    r = Vf(t, e, n);
  else {
    const s = typeof e == "function" ? ii(t, e, n.custom) : e;
    r = Promise.all(Sx(t, s, n));
  }
  return r.then(() => {
    t.notify("AnimationComplete", e);
  });
}
const DC = {
  test: (t) => t === "auto",
  parse: (t) => t
}, wx = (t) => (e) => e.test(t), Tx = [Ss, oe, Dn, Wn, sb, ib, DC], Tv = (t) => Tx.find(wx(t));
function jC(t) {
  return typeof t == "number" ? t === 0 : t !== null ? t === "none" || t === "0" || D_(t) : !0;
}
const FC = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function OC(t) {
  const [e, n] = t.slice(0, -1).split("(");
  if (e === "drop-shadow")
    return t;
  const [r] = n.match(Wh) || [];
  if (!r)
    return t;
  const s = n.replace(r, "");
  let a = FC.has(e) ? 1 : 0;
  return r !== n && (a *= 100), e + "(" + a + s + ")";
}
const LC = /\b([a-z-]*)\(.*?\)/gu, Bf = {
  ...xn,
  getAnimatableNone: (t) => {
    const e = t.match(LC);
    return e ? e.map(OC).join(" ") : t;
  }
}, Uf = {
  ...xn,
  getAnimatableNone: (t) => {
    const e = xn.parse(t);
    return xn.createTransformer(t)(e.map((r) => typeof r == "number" ? 0 : typeof r == "object" ? { ...r, alpha: 1 } : r));
  }
}, Av = {
  ...Ss,
  transform: Math.round
}, zC = {
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
  scale: xl,
  scaleX: xl,
  scaleY: xl,
  scaleZ: xl,
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
  opacity: Do,
  originX: cv,
  originY: cv,
  originZ: oe
}, ou = {
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
  ...zC,
  zIndex: Av,
  // SVG
  fillOpacity: Do,
  strokeOpacity: Do,
  numOctaves: Av
}, $C = {
  ...ou,
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
  filter: Bf,
  WebkitFilter: Bf,
  mask: Uf,
  WebkitMask: Uf
}, Ax = (t) => $C[t], VC = /* @__PURE__ */ new Set([Bf, Uf]);
function kx(t, e) {
  let n = Ax(t);
  return VC.has(n) || (n = xn), n.getAnimatableNone ? n.getAnimatableNone(e) : void 0;
}
const BC = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function UC(t, e, n) {
  let r = 0, s;
  for (; r < t.length && !s; ) {
    const a = t[r];
    typeof a == "string" && !BC.has(a) && as(a).values.length && (s = t[r]), r++;
  }
  if (s && n)
    for (const a of e)
      t[a] = kx(n, s);
}
class HC extends qh {
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
      if (typeof d == "string" && (d = d.trim(), Hh(d))) {
        const p = yx(d, n.current);
        p !== void 0 && (e[g] = p), g === e.length - 1 && (this.finalKeyframe = d);
      }
    }
    if (this.resolveNoneKeyframes(), !vx.has(r) || e.length !== 2)
      return;
    const [s, a] = e, l = Tv(s), c = Tv(a), f = uv(s), m = uv(a);
    if (f !== m && xr[r]) {
      this.needsMeasurement = !0;
      return;
    }
    if (l !== c)
      if (vv(l) && vv(c))
        for (let g = 0; g < e.length; g++) {
          const d = e[g];
          typeof d == "string" && (e[g] = parseFloat(d));
        }
      else xr[r] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: e, name: n } = this, r = [];
    for (let s = 0; s < e.length; s++)
      (e[s] === null || jC(e[s])) && r.push(s);
    r.length && UC(e, r, n);
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
function bx(t, e, n) {
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
const Hf = (t, e) => e && typeof t == "number" ? e.transform(t) : t;
function jl(t) {
  return I_(t) && "offsetHeight" in t && !("ownerSVGElement" in t);
}
const { schedule: tp } = /* @__PURE__ */ G_(queueMicrotask, !1), _n = {
  x: !1,
  y: !1
};
function Cx() {
  return _n.x || _n.y;
}
function WC(t) {
  return t === "x" || t === "y" ? _n[t] ? null : (_n[t] = !0, () => {
    _n[t] = !1;
  }) : _n.x || _n.y ? null : (_n.x = _n.y = !0, () => {
    _n.x = _n.y = !1;
  });
}
function Px(t, e) {
  const n = bx(t), r = new AbortController(), s = {
    passive: !0,
    ...e,
    signal: r.signal
  };
  return [n, s, () => r.abort()];
}
function ZC(t) {
  return !(t.pointerType === "touch" || Cx());
}
function GC(t, e, n = {}) {
  const [r, s, a] = Px(t, n);
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
    }, S = (T) => {
      if (!ZC(T))
        return;
      f = !1;
      const A = e(l, T);
      typeof A == "function" && (m = A, l.addEventListener("pointerleave", w, s));
    };
    l.addEventListener("pointerenter", S, s), l.addEventListener("pointerdown", v, s);
  }), a;
}
const Ex = (t, e) => e ? t === e ? !0 : Ex(t, e.parentElement) : !1, np = (t) => t.pointerType === "mouse" ? typeof t.button != "number" || t.button <= 0 : t.isPrimary !== !1, KC = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function YC(t) {
  return KC.has(t.tagName) || t.isContentEditable === !0;
}
const qC = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function QC(t) {
  return qC.has(t.tagName) || t.isContentEditable === !0;
}
const Fl = /* @__PURE__ */ new WeakSet();
function kv(t) {
  return (e) => {
    e.key === "Enter" && t(e);
  };
}
function Kd(t, e) {
  t.dispatchEvent(new PointerEvent("pointer" + e, { isPrimary: !0, bubbles: !0 }));
}
const XC = (t, e) => {
  const n = t.currentTarget;
  if (!n)
    return;
  const r = kv(() => {
    if (Fl.has(n))
      return;
    Kd(n, "down");
    const s = kv(() => {
      Kd(n, "up");
    }), a = () => Kd(n, "cancel");
    n.addEventListener("keyup", s, e), n.addEventListener("blur", a, e);
  });
  n.addEventListener("keydown", r, e), n.addEventListener("blur", () => n.removeEventListener("keydown", r), e);
};
function bv(t) {
  return np(t) && !Cx();
}
const Cv = /* @__PURE__ */ new WeakSet();
function JC(t, e, n = {}) {
  const [r, s, a] = Px(t, n), l = (c) => {
    const f = c.currentTarget;
    if (!bv(c) || Cv.has(c))
      return;
    Fl.add(f), n.stopPropagation && Cv.add(c);
    const m = e(f, c), g = (v, w) => {
      window.removeEventListener("pointerup", d), window.removeEventListener("pointercancel", p), Fl.has(f) && Fl.delete(f), bv(v) && typeof m == "function" && m(v, { success: w });
    }, d = (v) => {
      g(v, f === window || f === document || n.useGlobalTarget || Ex(f, v.target));
    }, p = (v) => {
      g(v, !1);
    };
    window.addEventListener("pointerup", d, s), window.addEventListener("pointercancel", p, s);
  };
  return r.forEach((c) => {
    (n.useGlobalTarget ? window : c).addEventListener("pointerdown", l, s), jl(c) && (c.addEventListener("focus", (m) => XC(m, s)), !YC(c) && !c.hasAttribute("tabindex") && (c.tabIndex = 0));
  }), a;
}
function rp(t) {
  return I_(t) && "ownerSVGElement" in t;
}
const Ol = /* @__PURE__ */ new WeakMap();
let vr;
const Mx = (t, e, n) => (r, s) => s && s[0] ? s[0][t + "Size"] : rp(r) && "getBBox" in r ? r.getBBox()[e] : r[n], eP = /* @__PURE__ */ Mx("inline", "width", "offsetWidth"), tP = /* @__PURE__ */ Mx("block", "height", "offsetHeight");
function nP({ target: t, borderBoxSize: e }) {
  var n;
  (n = Ol.get(t)) == null || n.forEach((r) => {
    r(t, {
      get width() {
        return eP(t, e);
      },
      get height() {
        return tP(t, e);
      }
    });
  });
}
function rP(t) {
  t.forEach(nP);
}
function iP() {
  typeof ResizeObserver > "u" || (vr = new ResizeObserver(rP));
}
function sP(t, e) {
  vr || iP();
  const n = bx(t);
  return n.forEach((r) => {
    let s = Ol.get(r);
    s || (s = /* @__PURE__ */ new Set(), Ol.set(r, s)), s.add(e), vr == null || vr.observe(r);
  }), () => {
    n.forEach((r) => {
      const s = Ol.get(r);
      s == null || s.delete(e), s != null && s.size || vr == null || vr.unobserve(r);
    });
  };
}
const Ll = /* @__PURE__ */ new Set();
let Yi;
function oP() {
  Yi = () => {
    const t = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    Ll.forEach((e) => e(t));
  }, window.addEventListener("resize", Yi);
}
function aP(t) {
  return Ll.add(t), Yi || oP(), () => {
    Ll.delete(t), !Ll.size && typeof Yi == "function" && (window.removeEventListener("resize", Yi), Yi = void 0);
  };
}
function Pv(t, e) {
  return typeof t == "function" ? aP(t) : sP(t, e);
}
function lP(t) {
  return rp(t) && t.tagName === "svg";
}
const uP = [...Tx, Qe, xn], cP = (t) => uP.find(wx(t)), Ev = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), qi = () => ({
  x: Ev(),
  y: Ev()
}), Mv = () => ({ min: 0, max: 0 }), nt = () => ({
  x: Mv(),
  y: Mv()
}), dP = /* @__PURE__ */ new WeakMap();
function Eu(t) {
  return t !== null && typeof t == "object" && typeof t.start == "function";
}
function jo(t) {
  return typeof t == "string" || Array.isArray(t);
}
const ip = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], sp = ["initial", ...ip];
function Mu(t) {
  return Eu(t.animate) || sp.some((e) => jo(t[e]));
}
function Rx(t) {
  return !!(Mu(t) || t.variants);
}
function fP(t, e, n) {
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
const Wf = { current: null }, Nx = { current: !1 }, hP = typeof window < "u";
function pP() {
  if (Nx.current = !0, !!hP)
    if (window.matchMedia) {
      const t = window.matchMedia("(prefers-reduced-motion)"), e = () => Wf.current = t.matches;
      t.addEventListener("change", e), e();
    } else
      Wf.current = !1;
}
const Rv = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let au = {};
function Ix(t) {
  au = t;
}
function mP() {
  return au;
}
class gP {
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
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = qh, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const v = Tt.now();
      this.renderScheduledAt < v && (this.renderScheduledAt = v, Ee.render(this.render, !1, !0));
    };
    const { latestValues: m, renderState: g } = c;
    this.latestValues = m, this.baseTarget = { ...m }, this.initialValues = n.initial ? { ...m } : {}, this.renderState = g, this.parent = e, this.props = n, this.presenceContext = r, this.depth = e ? e.depth + 1 : 0, this.reducedMotionConfig = s, this.skipAnimationsConfig = a, this.options = f, this.blockInitialAnimation = !!l, this.isControllingVariants = Mu(n), this.isVariantNode = Rx(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(e && e.current);
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
    this.current = e, dP.set(e, this), this.projection && !this.projection.instance && this.projection.mount(e), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((s, a) => this.bindToMotionValue(a, s)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Nx.current || pP(), this.shouldReduceMotion = Wf.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (r = this.parent) == null || r.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    var e;
    this.projection && this.projection.unmount(), Pr(this.notifyUpdate), Pr(this.render), this.valueSubscriptions.forEach((n) => n()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), (e = this.parent) == null || e.removeChild(this);
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
    if (this.valueSubscriptions.has(e) && this.valueSubscriptions.get(e)(), n.accelerate && px.has(e) && this.current instanceof HTMLElement) {
      const { factory: l, keyframes: c, times: f, ease: m, duration: g } = n.accelerate, d = new fx({
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
    for (e in au) {
      const n = au[e];
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
    for (let r = 0; r < Rv.length; r++) {
      const s = Rv[r];
      this.propEventSubscriptions[s] && (this.propEventSubscriptions[s](), delete this.propEventSubscriptions[s]);
      const a = "on" + s, l = e[a];
      l && (this.propEventSubscriptions[s] = this.on(s, l));
    }
    this.prevMotionValues = fP(this, this.scrapeMotionValuesFromProps(e, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
    return r != null && (typeof r == "string" && (N_(r) || D_(r)) ? r = parseFloat(r) : !cP(r) && xn.test(n) && (r = kx(e, n)), this.setBaseTarget(e, ft(r) ? r.get() : r)), ft(r) ? r.get() : r;
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
      const l = Jh(this.props, n, (a = this.presenceContext) == null ? void 0 : a.custom);
      l && (r = l[e]);
    }
    if (n && r !== void 0)
      return r;
    const s = this.getBaseTargetFromProps(this.props, e);
    return s !== void 0 && !ft(s) ? s : this.initialValues[e] !== void 0 && r === void 0 ? void 0 : this.baseTarget[e];
  }
  on(e, n) {
    return this.events[e] || (this.events[e] = new Vh()), this.events[e].add(n);
  }
  notify(e, ...n) {
    this.events[e] && this.events[e].notify(...n);
  }
  scheduleRenderMicrotask() {
    tp.render(this.render);
  }
}
class Dx extends gP {
  constructor() {
    super(...arguments), this.KeyframeResolver = HC;
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
class Nr {
  constructor(e) {
    this.isMounted = !1, this.node = e;
  }
  update() {
  }
}
function jx({ top: t, left: e, right: n, bottom: r }) {
  return {
    x: { min: e, max: n },
    y: { min: t, max: r }
  };
}
function yP({ x: t, y: e }) {
  return { top: e.min, right: t.max, bottom: e.max, left: t.min };
}
function vP(t, e) {
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
function Yd(t) {
  return t === void 0 || t === 1;
}
function Zf({ scale: t, scaleX: e, scaleY: n }) {
  return !Yd(t) || !Yd(e) || !Yd(n);
}
function qr(t) {
  return Zf(t) || Fx(t) || t.z || t.rotate || t.rotateX || t.rotateY || t.skewX || t.skewY;
}
function Fx(t) {
  return Nv(t.x) || Nv(t.y);
}
function Nv(t) {
  return t && t !== "0%";
}
function lu(t, e, n) {
  const r = t - n, s = e * r;
  return n + s;
}
function Iv(t, e, n, r, s) {
  return s !== void 0 && (t = lu(t, s, r)), lu(t, n, r) + e;
}
function Gf(t, e = 0, n = 1, r, s) {
  t.min = Iv(t.min, e, n, r, s), t.max = Iv(t.max, e, n, r, s);
}
function Ox(t, { x: e, y: n }) {
  Gf(t.x, e.translate, e.scale, e.originPoint), Gf(t.y, n.translate, n.scale, n.originPoint);
}
const Dv = 0.999999999999, jv = 1.0000000000001;
function _P(t, e, n, r = !1) {
  var c;
  const s = n.length;
  if (!s)
    return;
  e.x = e.y = 1;
  let a, l;
  for (let f = 0; f < s; f++) {
    a = n[f], l = a.projectionDelta;
    const { visualElement: m } = a.options;
    m && m.props.style && m.props.style.display === "contents" || (r && a.options.layoutScroll && a.scroll && a !== a.root && (Mn(t.x, -a.scroll.offset.x), Mn(t.y, -a.scroll.offset.y)), l && (e.x *= l.x.scale, e.y *= l.y.scale, Ox(t, l)), r && qr(a.latestValues) && zl(t, a.latestValues, (c = a.layout) == null ? void 0 : c.layoutBox));
  }
  e.x < jv && e.x > Dv && (e.x = 1), e.y < jv && e.y > Dv && (e.y = 1);
}
function Mn(t, e) {
  t.min += e, t.max += e;
}
function Fv(t, e, n, r, s = 0.5) {
  const a = Pe(t.min, t.max, s);
  Gf(t, e, n, a, r);
}
function Ov(t, e) {
  return typeof t == "string" ? parseFloat(t) / 100 * (e.max - e.min) : t;
}
function zl(t, e, n) {
  const r = n ?? t;
  Fv(t.x, Ov(e.x, r.x), e.scaleX, e.scale, e.originX), Fv(t.y, Ov(e.y, r.y), e.scaleY, e.scale, e.originY);
}
function Lx(t, e) {
  return jx(vP(t.getBoundingClientRect(), e));
}
function xP(t, e, n) {
  const r = Lx(t, n), { scroll: s } = e;
  return s && (Mn(r.x, s.offset.x), Mn(r.y, s.offset.y)), r;
}
const SP = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, wP = ws.length;
function TP(t, e, n) {
  let r = "", s = !0;
  for (let l = 0; l < wP; l++) {
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
      const g = Hf(f, ou[c]);
      if (!m) {
        s = !1;
        const d = SP[c] || c;
        r += `${d}(${g}) `;
      }
      n && (e[c] = g);
    }
  }
  const a = t.pathRotation;
  return a && (s = !1, r += `rotate(${Hf(a, ou.pathRotation)}) `), r = r.trim(), n ? r = n(e, s ? "" : r) : s && (r = "none"), r;
}
function op(t, e, n) {
  const { style: r, vars: s, transformOrigin: a } = t;
  let l = !1, c = !1;
  for (const f in e) {
    const m = e[f];
    if (Ts.has(f)) {
      l = !0;
      continue;
    } else if (Y_(f)) {
      s[f] = m;
      continue;
    } else {
      const g = Hf(m, ou[f]);
      f.startsWith("origin") ? (c = !0, a[f] = g) : r[f] = g;
    }
  }
  if (e.transform || (l || n ? r.transform = TP(e, t.transform, n) : r.transform && (r.transform = "none")), c) {
    const { originX: f = "50%", originY: m = "50%", originZ: g = 0 } = a;
    r.transformOrigin = `${f} ${m} ${g}`;
  }
}
function zx(t, { style: e, vars: n }, r, s) {
  const a = t.style;
  let l;
  for (l in e)
    a[l] = e[l];
  s == null || s.applyProjectionStyles(a, r);
  for (l in n)
    a.setProperty(l, n[l]);
}
function Lv(t, e) {
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
    const n = Lv(t, e.target.x), r = Lv(t, e.target.y);
    return `${n}% ${r}%`;
  }
}, AP = {
  correct: (t, { treeScale: e, projectionDelta: n }) => {
    const r = t, s = xn.parse(t);
    if (s.length > 5)
      return r;
    const a = xn.createTransformer(t), l = typeof s[0] != "number" ? 1 : 0, c = n.x.scale * e.x, f = n.y.scale * e.y;
    s[0 + l] /= c, s[1 + l] /= f;
    const m = Pe(c, f, 0.5);
    return typeof s[2 + l] == "number" && (s[2 + l] /= m), typeof s[3 + l] == "number" && (s[3 + l] /= m), a(s);
  }
}, Kf = {
  borderRadius: {
    ...ho,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: ho,
  borderTopRightRadius: ho,
  borderBottomLeftRadius: ho,
  borderBottomRightRadius: ho,
  boxShadow: AP
};
function $x(t, { layout: e, layoutId: n }) {
  return Ts.has(t) || t.startsWith("origin") || (e || n !== void 0) && (!!Kf[t] || t === "opacity");
}
function ap(t, e, n) {
  var l;
  const r = t.style, s = e == null ? void 0 : e.style, a = {};
  if (!r)
    return a;
  for (const c in r)
    (ft(r[c]) || s && ft(s[c]) || $x(c, t) || ((l = n == null ? void 0 : n.getValue(c)) == null ? void 0 : l.liveStyle) !== void 0) && (a[c] = r[c]);
  return a;
}
function kP(t) {
  return window.getComputedStyle(t);
}
class bP extends Dx {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = zx;
  }
  readValueFromInstance(e, n) {
    var r;
    if (Ts.has(n))
      return (r = this.projection) != null && r.isProjecting ? If(n) : Wb(e, n);
    {
      const s = kP(e), a = (Y_(n) ? s.getPropertyValue(n) : s[n]) || 0;
      return typeof a == "string" ? a.trim() : a;
    }
  }
  measureInstanceViewportBox(e, { transformPagePoint: n }) {
    return Lx(e, n);
  }
  build(e, n, r) {
    op(e, n, r.transformTemplate);
  }
  scrapeMotionValuesFromProps(e, n, r) {
    return ap(e, n, r);
  }
}
const CP = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, PP = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function EP(t, e, n = 1, r = 0, s = !0) {
  t.pathLength = 1;
  const a = s ? CP : PP;
  t[a.offset] = `${-r}`, t[a.array] = `${e} ${n}`;
}
const MP = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function Vx(t, {
  attrX: e,
  attrY: n,
  attrScale: r,
  pathLength: s,
  pathSpacing: a = 1,
  pathOffset: l = 0,
  // This is object creation, which we try to avoid per-frame.
  ...c
}, f, m, g) {
  if (op(t, c, m), f) {
    t.style.viewBox && (t.attrs.viewBox = t.style.viewBox);
    return;
  }
  t.attrs = t.style, t.style = {};
  const { attrs: d, style: p } = t;
  d.transform && (p.transform = d.transform, delete d.transform), (p.transform || d.transformOrigin) && (p.transformOrigin = d.transformOrigin ?? "50% 50%", delete d.transformOrigin), p.transform && (p.transformBox = (g == null ? void 0 : g.transformBox) ?? "fill-box", delete d.transformBox);
  for (const v of MP)
    d[v] !== void 0 && (p[v] = d[v], delete d[v]);
  e !== void 0 && (d.x = e), n !== void 0 && (d.y = n), r !== void 0 && (d.scale = r), s !== void 0 && EP(d, s, a, l, !1);
}
const Bx = /* @__PURE__ */ new Set([
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
]), Ux = (t) => typeof t == "string" && t.toLowerCase() === "svg";
function RP(t, e, n, r) {
  zx(t, e, void 0, r);
  for (const s in e.attrs)
    t.setAttribute(Bx.has(s) ? s : ep(s), e.attrs[s]);
}
function Hx(t, e, n) {
  const r = ap(t, e, n);
  for (const s in t)
    if (ft(t[s]) || ft(e[s])) {
      const a = ws.indexOf(s) !== -1 ? "attr" + s.charAt(0).toUpperCase() + s.substring(1) : s;
      r[a] = t[s];
    }
  return r;
}
class NP extends Dx {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = nt;
  }
  getBaseTargetFromProps(e, n) {
    return e[n];
  }
  readValueFromInstance(e, n) {
    if (Ts.has(n)) {
      const r = Ax(n);
      return r && r.default || 0;
    }
    return n = Bx.has(n) ? n : ep(n), e.getAttribute(n);
  }
  scrapeMotionValuesFromProps(e, n, r) {
    return Hx(e, n, r);
  }
  build(e, n, r) {
    Vx(e, n, this.isSVGTag, r.transformTemplate, r.style);
  }
  renderInstance(e, n, r, s) {
    RP(e, n, r, s);
  }
  mount(e) {
    this.isSVGTag = Ux(e.tagName), super.mount(e);
  }
}
const IP = sp.length;
function Wx(t) {
  if (!t)
    return;
  if (!t.isControllingVariants) {
    const n = t.parent ? Wx(t.parent) || {} : {};
    return t.props.initial !== void 0 && (n.initial = t.props.initial), n;
  }
  const e = {};
  for (let n = 0; n < IP; n++) {
    const r = sp[n], s = t.props[r];
    (jo(s) || s === !1) && (e[r] = s);
  }
  return e;
}
function Zx(t, e) {
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
const DP = [...ip].reverse(), jP = ip.length;
function FP(t) {
  return (e) => Promise.all(e.map(({ animation: n, options: r }) => IC(t, n, r)));
}
function OP(t) {
  let e = FP(t), n = zv(), r = !0, s = !1;
  const a = (m) => (g, d) => {
    var v;
    const p = ii(t, d, m === "exit" ? (v = t.presenceContext) == null ? void 0 : v.custom : void 0);
    if (p) {
      const { transition: w, transitionEnd: S, ...T } = p;
      g = { ...g, ...T, ...S };
    }
    return g;
  };
  function l(m) {
    e = m(t);
  }
  function c(m) {
    const { props: g } = t, d = Wx(t.parent) || {}, p = [], v = /* @__PURE__ */ new Set();
    let w = {}, S = 1 / 0;
    for (let A = 0; A < jP; A++) {
      const b = DP[A], E = n[b], M = g[b] !== void 0 ? g[b] : d[b], C = jo(M), $ = b === m ? E.isActive : null;
      $ === !1 && (S = A);
      let I = M === d[b] && M !== g[b] && C;
      if (I && (r || s) && t.manuallyAnimateOnMount && (I = !1), E.protectedKeys = { ...w }, // If it isn't active and hasn't *just* been set as inactive
      !E.isActive && $ === null || // If we didn't and don't have any defined prop for this animation type
      !M && !E.prevProp || // Or if the prop doesn't define an animation
      Eu(M) || typeof M == "boolean")
        continue;
      if (b === "exit" && E.isActive && $ !== !0) {
        E.prevResolvedValues && (w = {
          ...w,
          ...E.prevResolvedValues
        });
        continue;
      }
      const O = LP(E.prevProp, M);
      let L = O || // If we're making this variant active, we want to always make it active
      b === m && E.isActive && !I && C || // If we removed a higher-priority variant (i is in reverse order)
      A > S && C, U = !1;
      const q = Array.isArray(M) ? M : [M];
      let ee = q.reduce(a(b), {});
      $ === !1 && (ee = {});
      const { prevResolvedValues: ne = {} } = E, ie = {
        ...ne,
        ...ee
      }, ge = (W) => {
        L = !0, v.has(W) && (U = !0, v.delete(W)), E.needsAnimating[W] = !0;
        const J = t.getValue(W);
        J && (J.liveStyle = !1);
      };
      for (const W in ie) {
        const J = ee[W], Q = ne[W];
        if (w.hasOwnProperty(W))
          continue;
        let F = !1;
        zf(J) && zf(Q) ? F = !Zx(J, Q) || O : F = J !== Q, F ? J != null ? ge(W) : v.add(W) : J !== void 0 && v.has(W) ? ge(W) : E.protectedKeys[W] = !0;
      }
      E.prevProp = M, E.prevResolvedValues = ee, E.isActive && (w = { ...w, ...ee }), (r || s) && t.blockInitialAnimation && (L = !1);
      const ce = I && O;
      L && (!ce || U) && p.push(...q.map((W) => {
        const J = { type: b };
        if (typeof W == "string" && (r || s) && !ce && t.manuallyAnimateOnMount && t.parent) {
          const { parent: Q } = t, F = ii(Q, W);
          if (Q.enteringChildren && F) {
            const { delayChildren: D } = F.transition || {};
            J.delay = mx(Q.enteringChildren, t, D);
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
        const b = ii(t, Array.isArray(g.initial) ? g.initial[0] : g.initial);
        b && b.transition && (A.transition = b.transition);
      }
      v.forEach((b) => {
        const E = t.getBaseTarget(b), M = t.getValue(b);
        M && (M.liveStyle = !0), A[b] = E ?? null;
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
      n = zv(), s = !0;
    }
  };
}
function LP(t, e) {
  return typeof e == "string" ? e !== t : Array.isArray(e) ? !Zx(e, t) : !1;
}
function Gr(t = !1) {
  return {
    isActive: t,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function zv() {
  return {
    animate: Gr(!0),
    whileInView: Gr(),
    whileHover: Gr(),
    whileTap: Gr(),
    whileDrag: Gr(),
    whileFocus: Gr(),
    exit: Gr()
  };
}
function Yf(t, e) {
  t.min = e.min, t.max = e.max;
}
function vn(t, e) {
  Yf(t.x, e.x), Yf(t.y, e.y);
}
function $v(t, e) {
  t.translate = e.translate, t.scale = e.scale, t.originPoint = e.originPoint, t.origin = e.origin;
}
const Gx = 1e-4, zP = 1 - Gx, $P = 1 + Gx, Kx = 0.01, VP = 0 - Kx, BP = 0 + Kx;
function At(t) {
  return t.max - t.min;
}
function UP(t, e, n) {
  return Math.abs(t - e) <= n;
}
function Vv(t, e, n, r = 0.5) {
  t.origin = r, t.originPoint = Pe(e.min, e.max, t.origin), t.scale = At(n) / At(e), t.translate = Pe(n.min, n.max, t.origin) - t.originPoint, (t.scale >= zP && t.scale <= $P || isNaN(t.scale)) && (t.scale = 1), (t.translate >= VP && t.translate <= BP || isNaN(t.translate)) && (t.translate = 0);
}
function To(t, e, n, r) {
  Vv(t.x, e.x, n.x, r ? r.originX : void 0), Vv(t.y, e.y, n.y, r ? r.originY : void 0);
}
function Bv(t, e, n, r = 0) {
  const s = r ? Pe(n.min, n.max, r) : n.min;
  t.min = s + e.min, t.max = t.min + At(e);
}
function HP(t, e, n, r) {
  Bv(t.x, e.x, n.x, r == null ? void 0 : r.x), Bv(t.y, e.y, n.y, r == null ? void 0 : r.y);
}
function Uv(t, e, n, r = 0) {
  const s = r ? Pe(n.min, n.max, r) : n.min;
  t.min = e.min - s, t.max = t.min + At(e);
}
function uu(t, e, n, r) {
  Uv(t.x, e.x, n.x, r == null ? void 0 : r.x), Uv(t.y, e.y, n.y, r == null ? void 0 : r.y);
}
function Hv(t, e, n, r, s) {
  return t -= e, t = lu(t, 1 / n, r), s !== void 0 && (t = lu(t, 1 / s, r)), t;
}
function WP(t, e = 0, n = 1, r = 0.5, s, a = t, l = t) {
  if (Dn.test(e) && (e = parseFloat(e), e = Pe(l.min, l.max, e / 100) - l.min), typeof e != "number")
    return;
  let c = Pe(a.min, a.max, r);
  t === a && (c -= e), t.min = Hv(t.min, e, n, c, s), t.max = Hv(t.max, e, n, c, s);
}
function Wv(t, e, [n, r, s], a, l) {
  WP(t, e[n], e[r], e[s], e.scale, a, l);
}
const ZP = ["x", "scaleX", "originX"], GP = ["y", "scaleY", "originY"];
function Zv(t, e, n, r) {
  Wv(t.x, e, ZP, n ? n.x : void 0, r ? r.x : void 0), Wv(t.y, e, GP, n ? n.y : void 0, r ? r.y : void 0);
}
function Gv(t) {
  return t.translate === 0 && t.scale === 1;
}
function Yx(t) {
  return Gv(t.x) && Gv(t.y);
}
function Kv(t, e) {
  return t.min === e.min && t.max === e.max;
}
function KP(t, e) {
  return Kv(t.x, e.x) && Kv(t.y, e.y);
}
function Yv(t, e) {
  return Math.round(t.min) === Math.round(e.min) && Math.round(t.max) === Math.round(e.max);
}
function qx(t, e) {
  return Yv(t.x, e.x) && Yv(t.y, e.y);
}
function qv(t) {
  return At(t.x) / At(t.y);
}
function Qv(t, e) {
  return t.translate === e.translate && t.scale === e.scale && t.originPoint === e.originPoint;
}
function Pn(t) {
  return [t("x"), t("y")];
}
function YP(t, e, n) {
  let r = "";
  const s = t.x.translate / e.x, a = t.y.translate / e.y, l = (n == null ? void 0 : n.z) || 0;
  if ((s || a || l) && (r = `translate3d(${s}px, ${a}px, ${l}px) `), (e.x !== 1 || e.y !== 1) && (r += `scale(${1 / e.x}, ${1 / e.y}) `), n) {
    const { transformPerspective: m, rotate: g, pathRotation: d, rotateX: p, rotateY: v, skewX: w, skewY: S } = n;
    m && (r = `perspective(${m}px) ${r}`), g && (r += `rotate(${g}deg) `), d && (r += `rotate(${d}deg) `), p && (r += `rotateX(${p}deg) `), v && (r += `rotateY(${v}deg) `), w && (r += `skewX(${w}deg) `), S && (r += `skewY(${S}deg) `);
  }
  const c = t.x.scale * e.x, f = t.y.scale * e.y;
  return (c !== 1 || f !== 1) && (r += `scale(${c}, ${f})`), r || "none";
}
const Qx = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
], qP = Qx.length, Xv = (t) => typeof t == "string" ? parseFloat(t) : t, Jv = (t) => typeof t == "number" || oe.test(t);
function QP(t, e, n, r, s, a) {
  s ? (t.opacity = Pe(0, n.opacity ?? 1, XP(r)), t.opacityExit = Pe(e.opacity ?? 1, 0, JP(r))) : a && (t.opacity = Pe(e.opacity ?? 1, n.opacity ?? 1, r));
  for (let l = 0; l < qP; l++) {
    const c = Qx[l];
    let f = e0(e, c), m = e0(n, c);
    if (f === void 0 && m === void 0)
      continue;
    f || (f = 0), m || (m = 0), f === 0 || m === 0 || Jv(f) === Jv(m) ? (t[c] = Math.max(Pe(Xv(f), Xv(m), r), 0), (Dn.test(m) || Dn.test(f)) && (t[c] += "%")) : t[c] = m;
  }
  (e.rotate || n.rotate) && (t.rotate = Pe(e.rotate || 0, n.rotate || 0, r));
}
function e0(t, e) {
  return t[e] !== void 0 ? t[e] : t.borderRadius;
}
const XP = /* @__PURE__ */ Xx(0, 0.5, U_), JP = /* @__PURE__ */ Xx(0.5, 0.95, un);
function Xx(t, e, n) {
  return (r) => r < t ? 0 : r > e ? 1 : n(/* @__PURE__ */ Io(t, e, r));
}
function eE(t, e, n) {
  const r = ft(t) ? t : ls(t);
  return r.start(Xh("", r, e, n)), r.animation;
}
function Fo(t, e, n, r = { passive: !0 }) {
  return t.addEventListener(e, n, r), () => t.removeEventListener(e, n);
}
const tE = (t, e) => t.depth - e.depth;
class nE {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(e) {
    $h(this.children, e), this.isDirty = !0;
  }
  remove(e) {
    tu(this.children, e), this.isDirty = !0;
  }
  forEach(e) {
    this.isDirty && this.children.sort(tE), this.isDirty = !1, this.children.forEach(e);
  }
}
function rE(t, e) {
  const n = Tt.now(), r = ({ timestamp: s }) => {
    const a = s - n;
    a >= e && (Pr(r), t(a - e));
  };
  return Ee.setup(r, !0), () => Pr(r);
}
function $l(t) {
  return ft(t) ? t.get() : t;
}
class iE {
  constructor() {
    this.members = [];
  }
  add(e) {
    $h(this.members, e);
    for (let n = this.members.length - 1; n >= 0; n--) {
      const r = this.members[n];
      if (r === e || r === this.lead || r === this.prevLead)
        continue;
      const s = r.instance;
      (!s || s.isConnected === !1) && !r.snapshot && (tu(this.members, r), r.unmount());
    }
    e.scheduleRender();
  }
  remove(e) {
    if (tu(this.members, e), e === this.prevLead && (this.prevLead = void 0), e === this.lead) {
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
const Vl = {
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
}, qd = ["", "X", "Y", "Z"], sE = 1e3;
let oE = 0;
function Qd(t, e, n, r) {
  const { latestValues: s } = e;
  s[t] && (n[t] = s[t], e.setStaticValue(t, 0), r && (r[t] = 0));
}
function Jx(t) {
  if (t.hasCheckedOptimisedAppear = !0, t.root === t)
    return;
  const { visualElement: e } = t.options;
  if (!e)
    return;
  const n = xx(e);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: s, layoutId: a } = t.options;
    window.MotionCancelOptimisedAnimation(n, "transform", Ee, !(s || a));
  }
  const { parent: r } = t;
  r && !r.hasCheckedOptimisedAppear && Jx(r);
}
function eS({ attachResizeListener: t, defaultParent: e, measureScroll: n, checkIsScrollRoot: r, resetTransform: s }) {
  return class {
    constructor(l = {}, c = e == null ? void 0 : e()) {
      this.id = oE++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(uE), this.nodes.forEach(mE), this.nodes.forEach(gE), this.nodes.forEach(cE);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = l, this.root = c ? c.root || c : this, this.path = c ? [...c.path, c] : [], this.parent = c, this.depth = c ? c.depth + 1 : 0;
      for (let f = 0; f < this.path.length; f++)
        this.path[f].shouldResetTransform = !0;
      this.root === this && (this.nodes = new nE());
    }
    addEventListener(l, c) {
      return this.eventHandlers.has(l) || this.eventHandlers.set(l, new Vh()), this.eventHandlers.get(l).add(c);
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
      this.isSVG = rp(l) && !lP(l), this.instance = l;
      const { layoutId: c, layout: f, visualElement: m } = this.options;
      if (m && !m.current && m.mount(l), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (f || c) && (this.isLayoutDirty = !0), t) {
        let g, d = 0;
        const p = () => this.root.updateBlockedByResize = !1;
        Ee.read(() => {
          d = window.innerWidth;
        }), t(l, () => {
          const v = window.innerWidth;
          v !== d && (d = v, this.root.updateBlockedByResize = !0, g && g(), g = rE(p, 250), Vl.hasAnimatedSinceResize && (Vl.hasAnimatedSinceResize = !1, this.nodes.forEach(r0)));
        });
      }
      c && this.root.registerSharedNode(c, this), this.options.animate !== !1 && m && (c || f) && this.addEventListener("didUpdate", ({ delta: g, hasLayoutChanged: d, hasRelativeLayoutChanged: p, layout: v }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const w = this.options.transition || m.getDefaultTransition() || SE, { onLayoutAnimationStart: S, onLayoutAnimationComplete: T } = m.getProps(), A = !this.targetLayout || !qx(this.targetLayout, v), b = !d && p;
        if (this.options.layoutRoot || this.resumeFrom || b || d && (A || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const E = {
            ...Qh(w, "layout"),
            onPlay: S,
            onComplete: T
          };
          (m.shouldReduceMotion || this.options.layoutRoot) && (E.delay = 0, E.type = !1), this.startAnimation(E), this.setAnimationOrigin(g, b, E.path);
        } else
          d || r0(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = v;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const l = this.getStack();
      l && l.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), Pr(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(yE), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && Jx(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
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
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), f && this.nodes.forEach(fE), this.nodes.forEach(t0);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(n0);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(hE), this.nodes.forEach(pE), this.nodes.forEach(aE), this.nodes.forEach(lE)) : this.nodes.forEach(n0), this.clearAllSnapshots();
      const c = Tt.now();
      dt.delta = jn(0, 1e3 / 60, c - dt.timestamp), dt.timestamp = c, dt.isProcessing = !0, Bd.update.process(dt), Bd.preRender.process(dt), Bd.render.process(dt), dt.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, tp.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(dE), this.sharedNodes.forEach(vE);
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
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !At(this.snapshot.measuredBox.x) && !At(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
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
      const l = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, c = this.projectionDelta && !Yx(this.projectionDelta), f = this.getTransformTemplate(), m = f ? f(this.latestValues, "") : void 0, g = m !== this.prevTransformTemplateValue;
      l && this.instance && (c || qr(this.latestValues) || g) && (s(this.instance, m), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(l = !0) {
      const c = this.measurePageBox();
      let f = this.removeElementScroll(c);
      return l && (f = this.removeTransform(f)), wE(f), {
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
      if (!(((m = this.scroll) == null ? void 0 : m.wasRoot) || this.path.some(TE))) {
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
        !c && v.options.layoutScroll && v.scroll && v !== v.root && (Mn(m.x, -v.scroll.offset.x), Mn(m.y, -v.scroll.offset.y)), qr(v.latestValues) && zl(m, v.latestValues, (g = v.layout) == null ? void 0 : g.layoutBox);
      }
      return qr(this.latestValues) && zl(m, this.latestValues, (d = this.layout) == null ? void 0 : d.layoutBox), m;
    }
    removeTransform(l) {
      var f;
      const c = nt();
      vn(c, l);
      for (let m = 0; m < this.path.length; m++) {
        const g = this.path[m];
        if (!qr(g.latestValues))
          continue;
        let d;
        g.instance && (Zf(g.latestValues) && g.updateSnapshot(), d = nt(), vn(d, g.measurePageBox())), Zv(c, g.latestValues, (f = g.snapshot) == null ? void 0 : f.layoutBox, d);
      }
      return qr(this.latestValues) && Zv(c, this.latestValues), c;
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
      p && this.linkedParentVersion !== p.layoutVersion && !p.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && p && p.layout ? this.createRelativeTarget(p, this.layout.layoutBox, p.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = nt(), this.targetWithTransforms = nt()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), HP(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : vn(this.target, this.layout.layoutBox), Ox(this.target, this.targetDelta)) : vn(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && p && !!p.resumingFrom == !!this.resumingFrom && !p.options.layoutScroll && p.target && this.animationProgress !== 1 ? this.createRelativeTarget(p, this.target, p.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Zf(this.parent.latestValues) || Fx(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(l, c, f) {
      this.relativeParent = l, this.linkedParentVersion = l.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = nt(), this.relativeTargetOrigin = nt(), uu(this.relativeTargetOrigin, c, f, this.options.layoutAnchor || void 0), vn(this.relativeTarget, this.relativeTargetOrigin);
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
      _P(this.layoutCorrected, this.treeScale, this.path, c), l.layout && !l.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (l.target = l.layout.layoutBox, l.targetWithTransforms = nt());
      const { target: v } = l;
      if (!v) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : ($v(this.prevProjectionDelta.x, this.projectionDelta.x), $v(this.prevProjectionDelta.y, this.projectionDelta.y)), To(this.projectionDelta, this.layoutCorrected, v, this.latestValues), (this.treeScale.x !== d || this.treeScale.y !== p || !Qv(this.projectionDelta.x, this.prevProjectionDelta.x) || !Qv(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", v));
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
      const v = nt(), w = m ? m.source : void 0, S = this.layout ? this.layout.source : void 0, T = w !== S, A = this.getStack(), b = !A || A.members.length <= 1, E = !!(T && !b && this.options.crossfade === !0 && !this.path.some(xE));
      this.animationProgress = 0;
      let M;
      const C = f == null ? void 0 : f.interpolateProjection(l);
      this.mixTargetDelta = ($) => {
        const I = $ / 1e3, O = C == null ? void 0 : C(I);
        O ? (p.x.translate = O.x, p.x.scale = Pe(l.x.scale, 1, I), p.x.origin = l.x.origin, p.x.originPoint = l.x.originPoint, p.y.translate = O.y, p.y.scale = Pe(l.y.scale, 1, I), p.y.origin = l.y.origin, p.y.originPoint = l.y.originPoint) : (i0(p.x, l.x, I), i0(p.y, l.y, I)), this.setTargetDelta(p), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (uu(v, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), _E(this.relativeTarget, this.relativeTargetOrigin, v, I), M && KP(this.relativeTarget, M) && (this.isProjectionDirty = !1), M || (M = nt()), vn(M, this.relativeTarget)), T && (this.animationValues = d, QP(d, g, this.latestValues, I, E, b)), O && O.rotate !== void 0 && (this.animationValues || (this.animationValues = d), this.animationValues.pathRotation = O.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = I;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(l) {
      var c, f, m;
      this.notifyListeners("animationStart"), (c = this.currentAnimation) == null || c.stop(), (m = (f = this.resumingFrom) == null ? void 0 : f.currentAnimation) == null || m.stop(), this.pendingAnimation && (Pr(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Ee.update(() => {
        Vl.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = ls(0)), this.motionValue.jump(0, !1), this.currentAnimation = eE(this.motionValue, [0, 1e3], {
          ...l,
          velocity: 0,
          isSync: !0,
          onUpdate: (g) => {
            this.mixTargetDelta(g), l.onUpdate && l.onUpdate(g);
          },
          onStop: () => {
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(sE), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const l = this.getLead();
      let { targetWithTransforms: c, target: f, layout: m, latestValues: g } = l;
      if (!(!c || !f || !m)) {
        if (this !== l && this.layout && m && tS(this.options.animationType, this.layout.layoutBox, m.layoutBox)) {
          f = this.target || nt();
          const d = At(this.layout.layoutBox.x);
          f.x.min = l.target.x.min, f.x.max = f.x.min + d;
          const p = At(this.layout.layoutBox.y);
          f.y.min = l.target.y.min, f.y.max = f.y.min + p;
        }
        vn(c, f), zl(c, g), To(this.projectionDeltaWithTransform, this.layoutCorrected, c, g);
      }
    }
    registerSharedNode(l, c) {
      this.sharedNodes.has(l) || this.sharedNodes.set(l, new iE()), this.sharedNodes.get(l).add(c);
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
      f.z && Qd("z", l, m, this.animationValues);
      for (let g = 0; g < qd.length; g++)
        Qd(`rotate${qd[g]}`, l, m, this.animationValues), Qd(`skew${qd[g]}`, l, m, this.animationValues);
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
        this.needsReset = !1, l.visibility = "", l.opacity = "", l.pointerEvents = $l(c == null ? void 0 : c.pointerEvents) || "", l.transform = f ? f(this.latestValues, "") : "none";
        return;
      }
      const m = this.getLead();
      if (!this.projectionDelta || !this.layout || !m.target) {
        this.options.layoutId && (l.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, l.pointerEvents = $l(c == null ? void 0 : c.pointerEvents) || ""), this.hasProjected && !qr(this.latestValues) && (l.transform = f ? f({}, "") : "none", this.hasProjected = !1);
        return;
      }
      l.visibility = "";
      const g = m.animationValues || m.latestValues;
      this.applyTransformsToTarget();
      let d = YP(this.projectionDeltaWithTransform, this.treeScale, g);
      f && (d = f(g, d)), l.transform = d;
      const { x: p, y: v } = this.projectionDelta;
      l.transformOrigin = `${p.origin * 100}% ${v.origin * 100}% 0`, m.animationValues ? l.opacity = m === this ? g.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : g.opacityExit : l.opacity = m === this ? g.opacity !== void 0 ? g.opacity : "" : g.opacityExit !== void 0 ? g.opacityExit : 0;
      for (const w in Kf) {
        if (g[w] === void 0)
          continue;
        const { correct: S, applyTo: T, isCSSVariable: A } = Kf[w], b = d === "none" ? g[w] : S(g[w], m);
        if (T) {
          const E = T.length;
          for (let M = 0; M < E; M++)
            l[T[M]] = b;
        } else
          A ? this.options.visualElement.renderState.vars[w] = b : l[w] = b;
      }
      this.options.layoutId && (l.pointerEvents = m === this ? $l(c == null ? void 0 : c.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((l) => {
        var c;
        return (c = l.currentAnimation) == null ? void 0 : c.stop();
      }), this.root.nodes.forEach(t0), this.root.sharedNodes.clear();
    }
  };
}
function aE(t) {
  t.updateLayout();
}
function lE(t) {
  var n;
  const e = ((n = t.resumeFrom) == null ? void 0 : n.snapshot) || t.snapshot;
  if (t.isLead() && t.layout && e && t.hasListeners("didUpdate")) {
    const { layoutBox: r, measuredBox: s } = t.layout, { animationType: a } = t.options, l = e.source !== t.layout.source;
    if (a === "size")
      Pn((d) => {
        const p = l ? e.measuredBox[d] : e.layoutBox[d], v = At(p);
        p.min = r[d].min, p.max = p.min + v;
      });
    else if (a === "x" || a === "y") {
      const d = a === "x" ? "y" : "x";
      Yf(l ? e.measuredBox[d] : e.layoutBox[d], r[d]);
    } else tS(a, e.layoutBox, r) && Pn((d) => {
      const p = l ? e.measuredBox[d] : e.layoutBox[d], v = At(r[d]);
      p.max = p.min + v, t.relativeTarget && !t.currentAnimation && (t.isProjectionDirty = !0, t.relativeTarget[d].max = t.relativeTarget[d].min + v);
    });
    const c = qi();
    To(c, r, e.layoutBox);
    const f = qi();
    l ? To(f, t.applyTransform(s, !0), e.measuredBox) : To(f, r, e.layoutBox);
    const m = !Yx(c);
    let g = !1;
    if (!t.resumeFrom) {
      const d = t.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: p, layout: v } = d;
        if (p && v) {
          const w = t.options.layoutAnchor || void 0, S = nt();
          uu(S, e.layoutBox, p.layoutBox, w);
          const T = nt();
          uu(T, r, v.layoutBox, w), qx(S, T) || (g = !0), d.options.layoutRoot && (t.relativeTarget = T, t.relativeTargetOrigin = S, t.relativeParent = d);
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
function uE(t) {
  t.parent && (t.isProjecting() || (t.isProjectionDirty = t.parent.isProjectionDirty), t.isSharedProjectionDirty || (t.isSharedProjectionDirty = !!(t.isProjectionDirty || t.parent.isProjectionDirty || t.parent.isSharedProjectionDirty)), t.isTransformDirty || (t.isTransformDirty = t.parent.isTransformDirty));
}
function cE(t) {
  t.isProjectionDirty = t.isSharedProjectionDirty = t.isTransformDirty = !1;
}
function dE(t) {
  t.clearSnapshot();
}
function t0(t) {
  t.clearMeasurements();
}
function fE(t) {
  t.isLayoutDirty = !0, t.updateLayout();
}
function n0(t) {
  t.isLayoutDirty = !1;
}
function hE(t) {
  t.isAnimationBlocked && t.layout && !t.isLayoutDirty && (t.snapshot = t.layout, t.isLayoutDirty = !0);
}
function pE(t) {
  const { visualElement: e } = t.options;
  e && e.getProps().onBeforeLayoutMeasure && e.notify("BeforeLayoutMeasure"), t.resetTransform();
}
function r0(t) {
  t.finishAnimation(), t.targetDelta = t.relativeTarget = t.target = void 0, t.isProjectionDirty = !0;
}
function mE(t) {
  t.resolveTargetDelta();
}
function gE(t) {
  t.calcProjection();
}
function yE(t) {
  t.resetSkewAndRotation();
}
function vE(t) {
  t.removeLeadSnapshot();
}
function i0(t, e, n) {
  t.translate = Pe(e.translate, 0, n), t.scale = Pe(e.scale, 1, n), t.origin = e.origin, t.originPoint = e.originPoint;
}
function s0(t, e, n, r) {
  t.min = Pe(e.min, n.min, r), t.max = Pe(e.max, n.max, r);
}
function _E(t, e, n, r) {
  s0(t.x, e.x, n.x, r), s0(t.y, e.y, n.y, r);
}
function xE(t) {
  return t.animationValues && t.animationValues.opacityExit !== void 0;
}
const SE = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, o0 = (t) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(t), a0 = o0("applewebkit/") && !o0("chrome/") ? Math.round : un;
function l0(t) {
  t.min = a0(t.min), t.max = a0(t.max);
}
function wE(t) {
  l0(t.x), l0(t.y);
}
function tS(t, e, n) {
  return t === "position" || t === "preserve-aspect" && !UP(qv(e), qv(n), 0.2);
}
function TE(t) {
  var e;
  return t !== t.root && ((e = t.scroll) == null ? void 0 : e.wasRoot);
}
const AE = eS({
  attachResizeListener: (t, e) => Fo(t, "resize", e),
  measureScroll: () => {
    var t, e;
    return {
      x: document.documentElement.scrollLeft || ((t = document.body) == null ? void 0 : t.scrollLeft) || 0,
      y: document.documentElement.scrollTop || ((e = document.body) == null ? void 0 : e.scrollTop) || 0
    };
  },
  checkIsScrollRoot: () => !0
}), Xd = {
  current: void 0
}, nS = eS({
  measureScroll: (t) => ({
    x: t.scrollLeft,
    y: t.scrollTop
  }),
  defaultParent: () => {
    if (!Xd.current) {
      const t = new AE({});
      t.mount(window), t.setOptions({ layoutScroll: !0 }), Xd.current = t;
    }
    return Xd.current;
  },
  resetTransform: (t, e) => {
    t.style.transform = e !== void 0 ? e : "none";
  },
  checkIsScrollRoot: (t) => window.getComputedStyle(t).position === "fixed"
}), lp = P.createContext({
  transformPagePoint: (t) => t,
  isStatic: !1,
  reducedMotion: "never"
});
function u0(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function kE(...t) {
  return (e) => {
    let n = !1;
    const r = t.map((s) => {
      const a = u0(s, e);
      return !n && typeof a == "function" && (n = !0), a;
    });
    if (n)
      return () => {
        for (let s = 0; s < r.length; s++) {
          const a = r[s];
          typeof a == "function" ? a() : u0(t[s], null);
        }
      };
  };
}
function bE(...t) {
  return P.useCallback(kE(...t), t);
}
class CE extends P.Component {
  getSnapshotBeforeUpdate(e) {
    const n = this.props.childRef.current;
    if (jl(n) && e.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const r = n.offsetParent, s = jl(r) && r.offsetWidth || 0, a = jl(r) && r.offsetHeight || 0, l = getComputedStyle(n), c = this.props.sizeRef.current;
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
function PE({ children: t, isPresent: e, anchorX: n, anchorY: r, root: s, pop: a }) {
  var p;
  const l = P.useId(), c = P.useRef(null), f = P.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: m } = P.useContext(lp), g = ((p = t.props) == null ? void 0 : p.ref) ?? (t == null ? void 0 : t.ref), d = bE(c, g);
  return P.useInsertionEffect(() => {
    const { width: v, height: w, top: S, left: T, right: A, bottom: b, direction: E } = f.current;
    if (e || a === !1 || !c.current || !v || !w)
      return;
    const M = E === "rtl", C = n === "left" ? M ? `right: ${A}` : `left: ${T}` : M ? `left: ${T}` : `right: ${A}`, $ = r === "bottom" ? `bottom: ${b}` : `top: ${S}`;
    c.current.dataset.motionPopId = l;
    const I = document.createElement("style");
    m && (I.nonce = m);
    const O = s ?? document.head;
    return O.appendChild(I), I.sheet && I.sheet.insertRule(`
          [data-motion-pop-id="${l}"] {
            position: absolute !important;
            width: ${v}px !important;
            height: ${w}px !important;
            ${C}px !important;
            ${$}px !important;
          }
        `), () => {
      var L;
      (L = c.current) == null || L.removeAttribute("data-motion-pop-id"), O.contains(I) && O.removeChild(I);
    };
  }, [e]), _.jsx(CE, { isPresent: e, childRef: c, sizeRef: f, pop: a, children: a === !1 ? t : P.cloneElement(t, { ref: d }) });
}
const EE = ({ children: t, initial: e, isPresent: n, onExitComplete: r, custom: s, presenceAffectsLayout: a, mode: l, anchorX: c, anchorY: f, root: m }) => {
  const g = zh(ME), d = P.useId();
  let p = !0, v = P.useMemo(() => (p = !1, {
    id: d,
    initial: e,
    isPresent: n,
    custom: s,
    onExitComplete: (w) => {
      g.set(w, !0);
      for (const S of g.values())
        if (!S)
          return;
      r && r();
    },
    register: (w) => (g.set(w, !1), () => g.delete(w))
  }), [n, g, r]);
  return a && p && (v = { ...v }), P.useMemo(() => {
    g.forEach((w, S) => g.set(S, !1));
  }, [n]), P.useEffect(() => {
    !n && !g.size && r && r();
  }, [n]), t = _.jsx(PE, { pop: l === "popLayout", isPresent: n, anchorX: c, anchorY: f, root: m, children: t }), _.jsx(Cu.Provider, { value: v, children: t });
};
function ME() {
  return /* @__PURE__ */ new Map();
}
function rS(t = !0) {
  const e = P.useContext(Cu);
  if (e === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: r, register: s } = e, a = P.useId();
  P.useEffect(() => {
    if (t)
      return s(a);
  }, [t]);
  const l = P.useCallback(() => t && r && r(a), [a, r, t]);
  return !n && r ? [!1, l] : [!0];
}
const Sl = (t) => t.key || "";
function c0(t) {
  const e = [];
  return P.Children.forEach(t, (n) => {
    P.isValidElement(n) && e.push(n);
  }), e;
}
const Xo = ({ children: t, custom: e, initial: n = !0, onExitComplete: r, presenceAffectsLayout: s = !0, mode: a = "sync", propagate: l = !1, anchorX: c = "left", anchorY: f = "top", root: m }) => {
  const [g, d] = rS(l), p = P.useMemo(() => c0(t), [t]), v = l && !g ? [] : p.map(Sl), w = P.useRef(!0), S = P.useRef(p), T = zh(() => /* @__PURE__ */ new Map()), A = P.useRef(/* @__PURE__ */ new Set()), [b, E] = P.useState(p), [M, C] = P.useState(p);
  R_(() => {
    w.current = !1, S.current = p;
    for (let O = 0; O < M.length; O++) {
      const L = Sl(M[O]);
      v.includes(L) ? (T.delete(L), A.current.delete(L)) : T.get(L) !== !0 && T.set(L, !1);
    }
  }, [M, v.length, v.join("-")]);
  const $ = [];
  if (p !== b) {
    let O = [...p];
    for (let L = 0; L < M.length; L++) {
      const U = M[L], q = Sl(U);
      v.includes(q) || (O.splice(L, 0, U), $.push(U));
    }
    return a === "wait" && $.length && (O = $), C(c0(O)), E(p), null;
  }
  const { forceRender: I } = P.useContext(Lh);
  return _.jsx(_.Fragment, { children: M.map((O) => {
    const L = Sl(O), U = l && !g ? !1 : p === M || v.includes(L), q = () => {
      if (A.current.has(L))
        return;
      if (T.has(L))
        A.current.add(L), T.set(L, !0);
      else
        return;
      let ee = !0;
      T.forEach((ne) => {
        ne || (ee = !1);
      }), ee && (I == null || I(), C(S.current), l && (d == null || d()), r && r());
    };
    return _.jsx(EE, { isPresent: U, initial: !w.current || n ? void 0 : !1, custom: e, presenceAffectsLayout: s, mode: a, root: m, onExitComplete: U ? void 0 : q, anchorX: c, anchorY: f, children: O }, L);
  }) });
}, iS = P.createContext({ strict: !1 }), d0 = {
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
let f0 = !1;
function RE() {
  if (f0)
    return;
  const t = {};
  for (const e in d0)
    t[e] = {
      isEnabled: (n) => d0[e].some((r) => !!n[r])
    };
  Ix(t), f0 = !0;
}
function sS() {
  return RE(), mP();
}
function NE(t) {
  const e = sS();
  for (const n in t)
    e[n] = {
      ...e[n],
      ...t[n]
    };
  Ix(e);
}
const IE = /* @__PURE__ */ new Set([
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
function cu(t) {
  return t.startsWith("while") || t.startsWith("drag") && t !== "draggable" || t.startsWith("layout") || t.startsWith("onTap") || t.startsWith("onPan") || t.startsWith("onLayout") || IE.has(t);
}
let oS = (t) => !cu(t);
function DE(t) {
  typeof t == "function" && (oS = (e) => e.startsWith("on") ? !cu(e) : t(e));
}
try {
  DE(require("@emotion/is-prop-valid").default);
} catch {
}
function jE(t, e, n) {
  const r = {};
  for (const s in t)
    s === "values" && typeof t.values == "object" || ft(t[s]) || (oS(s) || n === !0 && cu(s) || !e && !cu(s) || // If trying to use native HTML drag events, forward drag listeners
    t.draggable && s.startsWith("onDrag")) && (r[s] = t[s]);
  return r;
}
const Ru = /* @__PURE__ */ P.createContext({});
function FE(t, e) {
  if (Mu(t)) {
    const { initial: n, animate: r } = t;
    return {
      initial: n === !1 || jo(n) ? n : void 0,
      animate: jo(r) ? r : void 0
    };
  }
  return t.inherit !== !1 ? e : {};
}
function OE(t) {
  const { initial: e, animate: n } = FE(t, P.useContext(Ru));
  return P.useMemo(() => ({ initial: e, animate: n }), [h0(e), h0(n)]);
}
function h0(t) {
  return Array.isArray(t) ? t.join(" ") : t;
}
const up = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function aS(t, e, n) {
  for (const r in e)
    !ft(e[r]) && !$x(r, n) && (t[r] = e[r]);
}
function LE({ transformTemplate: t }, e) {
  return P.useMemo(() => {
    const n = up();
    return op(n, e, t), Object.assign({}, n.vars, n.style);
  }, [e]);
}
function zE(t, e) {
  const n = t.style || {}, r = {};
  return aS(r, n, t), Object.assign(r, LE(t, e)), r;
}
function $E(t, e) {
  const n = {}, r = zE(t, e);
  return t.drag && t.dragListener !== !1 && (n.draggable = !1, r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none", r.touchAction = t.drag === !0 ? "none" : `pan-${t.drag === "x" ? "y" : "x"}`), t.tabIndex === void 0 && (t.onTap || t.onTapStart || t.whileTap) && (n.tabIndex = 0), n.style = r, n;
}
const lS = () => ({
  ...up(),
  attrs: {}
});
function VE(t, e, n, r) {
  const s = P.useMemo(() => {
    const a = lS();
    return Vx(a, e, Ux(r), t.transformTemplate, t.style), {
      ...a.attrs,
      style: { ...a.style }
    };
  }, [e]);
  if (t.style) {
    const a = {};
    aS(a, t.style, t), s.style = { ...a, ...s.style };
  }
  return s;
}
const BE = [
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
function cp(t) {
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
      !!(BE.indexOf(t) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(t))
    )
  );
}
function UE(t, e, n, { latestValues: r }, s, a = !1, l) {
  const f = (l ?? cp(t) ? VE : $E)(e, r, s, t), m = jE(e, typeof t == "string", a), g = t !== P.Fragment ? { ...m, ...f, ref: n } : {}, { children: d } = e, p = P.useMemo(() => ft(d) ? d.get() : d, [d]);
  return P.createElement(t, {
    ...g,
    children: p
  });
}
function HE({ scrapeMotionValuesFromProps: t, createRenderState: e }, n, r, s) {
  return {
    latestValues: WE(n, r, s, t),
    renderState: e()
  };
}
function WE(t, e, n, r) {
  const s = {}, a = r(t, {});
  for (const p in a)
    s[p] = $l(a[p]);
  let { initial: l, animate: c } = t;
  const f = Mu(t), m = Rx(t);
  e && m && !f && t.inherit !== !1 && (l === void 0 && (l = e.initial), c === void 0 && (c = e.animate));
  let g = n ? n.initial === !1 : !1;
  g = g || l === !1;
  const d = g ? c : l;
  if (d && typeof d != "boolean" && !Eu(d)) {
    const p = Array.isArray(d) ? d : [d];
    for (let v = 0; v < p.length; v++) {
      const w = Jh(t, p[v]);
      if (w) {
        const { transitionEnd: S, transition: T, ...A } = w;
        for (const b in A) {
          let E = A[b];
          if (Array.isArray(E)) {
            const M = g ? E.length - 1 : 0;
            E = E[M];
          }
          E !== null && (s[b] = E);
        }
        for (const b in S)
          s[b] = S[b];
      }
    }
  }
  return s;
}
const uS = (t) => (e, n) => {
  const r = P.useContext(Ru), s = P.useContext(Cu), a = () => HE(t, e, r, s);
  return n ? a() : zh(a);
}, ZE = /* @__PURE__ */ uS({
  scrapeMotionValuesFromProps: ap,
  createRenderState: up
}), GE = /* @__PURE__ */ uS({
  scrapeMotionValuesFromProps: Hx,
  createRenderState: lS
}), KE = Symbol.for("motionComponentSymbol");
function YE(t, e, n) {
  const r = P.useRef(n);
  P.useInsertionEffect(() => {
    r.current = n;
  });
  const s = P.useRef(null);
  return P.useCallback((a) => {
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
const cS = P.createContext({});
function Wi(t) {
  return t && typeof t == "object" && Object.prototype.hasOwnProperty.call(t, "current");
}
function qE(t, e, n, r, s, a) {
  var E, M;
  const { visualElement: l } = P.useContext(Ru), c = P.useContext(iS), f = P.useContext(Cu), m = P.useContext(lp), g = m.reducedMotion, d = m.skipAnimations, p = P.useRef(null), v = P.useRef(!1);
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
  const w = p.current, S = P.useContext(cS);
  w && !w.projection && s && (w.type === "html" || w.type === "svg") && QE(p.current, n, s, S);
  const T = P.useRef(!1);
  P.useInsertionEffect(() => {
    w && T.current && w.update(n, f);
  });
  const A = n[_x], b = P.useRef(!!A && typeof window < "u" && !((E = window.MotionHandoffIsComplete) != null && E.call(window, A)) && ((M = window.MotionHasOptimisedAnimation) == null ? void 0 : M.call(window, A)));
  return R_(() => {
    v.current = !0, w && (T.current = !0, window.MotionIsMounted = !0, w.updateFeatures(), w.scheduleRenderMicrotask(), b.current && w.animationState && w.animationState.animateChanges());
  }), P.useEffect(() => {
    w && (!b.current && w.animationState && w.animationState.animateChanges(), b.current && (queueMicrotask(() => {
      var C;
      (C = window.MotionHandoffMarkAsComplete) == null || C.call(window, A);
    }), b.current = !1), w.enteringChildren = void 0);
  }), w;
}
function QE(t, e, n, r) {
  const { layoutId: s, layout: a, drag: l, dragConstraints: c, layoutScroll: f, layoutRoot: m, layoutAnchor: g, layoutCrossfade: d } = e;
  t.projection = new n(t.latestValues, e["data-framer-portal-id"] ? void 0 : dS(t.parent)), t.projection.setOptions({
    layoutId: s,
    layout: a,
    alwaysMeasureLayout: !!l || c && Wi(c),
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
function dS(t) {
  if (t)
    return t.options.allowProjection !== !1 ? t.projection : dS(t.parent);
}
function Jd(t, { forwardMotionProps: e = !1, type: n } = {}, r, s) {
  r && NE(r);
  const a = n ? n === "svg" : cp(t), l = a ? GE : ZE;
  function c(m, g) {
    let d;
    const p = {
      ...P.useContext(lp),
      ...m,
      layoutId: XE(m)
    }, { isStatic: v } = p, w = OE(m), S = l(m, v);
    if (!v && typeof window < "u") {
      JE();
      const T = eM(p);
      d = T.MeasureLayout, w.visualElement = qE(t, S, p, s, T.ProjectionNode, a);
    }
    return _.jsxs(Ru.Provider, { value: w, children: [d && w.visualElement ? _.jsx(d, { visualElement: w.visualElement, ...p }) : null, UE(t, m, YE(S, w.visualElement, g), S, v, e, a)] });
  }
  c.displayName = `motion.${typeof t == "string" ? t : `create(${t.displayName ?? t.name ?? ""})`}`;
  const f = P.forwardRef(c);
  return f[KE] = t, f;
}
function XE({ layoutId: t }) {
  const e = P.useContext(Lh).id;
  return e && t !== void 0 ? e + "-" + t : t;
}
function JE(t, e) {
  P.useContext(iS).strict;
}
function eM(t) {
  const e = sS(), { drag: n, layout: r } = e;
  if (!n && !r)
    return {};
  const s = { ...n, ...r };
  return {
    MeasureLayout: n != null && n.isEnabled(t) || r != null && r.isEnabled(t) ? s.MeasureLayout : void 0,
    ProjectionNode: s.ProjectionNode
  };
}
function tM(t, e) {
  if (typeof Proxy > "u")
    return Jd;
  const n = /* @__PURE__ */ new Map(), r = (a, l) => Jd(a, l, t, e), s = (a, l) => r(a, l);
  return new Proxy(s, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (a, l) => l === "create" ? r : (n.has(l) || n.set(l, Jd(l, void 0, t, e)), n.get(l))
  });
}
const nM = (t, e) => e.isSVG ?? cp(t) ? new NP(e) : new bP(e, {
  allowProjection: t !== P.Fragment
});
class rM extends Nr {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(e) {
    super(e), e.animationState || (e.animationState = OP(e));
  }
  updateAnimationControlsSubscription() {
    const { animate: e } = this.node.getProps();
    Eu(e) && (this.unmountControls = e.subscribe(this.node));
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
let iM = 0;
class sM extends Nr {
  constructor() {
    super(...arguments), this.id = iM++, this.isExitComplete = !1;
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
          const f = ii(this.node, l, c);
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
const oM = {
  animation: {
    Feature: rM
  },
  exit: {
    Feature: sM
  }
};
function Jo(t) {
  return {
    point: {
      x: t.pageX,
      y: t.pageY
    }
  };
}
const aM = (t) => (e) => np(e) && t(e, Jo(e));
function Ao(t, e, n, r) {
  return Fo(t, e, aM(n), r);
}
const fS = ({ current: t }) => t ? t.ownerDocument.defaultView : null, p0 = (t, e) => Math.abs(t - e);
function lM(t, e) {
  const n = p0(t.x, e.x), r = p0(t.y, e.y);
  return Math.sqrt(n ** 2 + r ** 2);
}
const m0 = /* @__PURE__ */ new Set(["auto", "scroll"]);
class hS {
  constructor(e, n, { transformPagePoint: r, contextWindow: s = window, dragSnapToOrigin: a = !1, distanceThreshold: l = 3, element: c } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (v) => {
      this.handleScroll(v.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = wl(this.lastRawMoveEventInfo, this.transformPagePoint));
      const v = ef(this.lastMoveEventInfo, this.history), w = this.startEvent !== null, S = lM(v.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!w && !S)
        return;
      const { point: T } = v, { timestamp: A } = dt;
      this.history.push({ ...T, timestamp: A });
      const { onStart: b, onMove: E } = this.handlers;
      w || (b && b(this.lastMoveEvent, v), this.startEvent = this.lastMoveEvent), E && E(this.lastMoveEvent, v);
    }, this.handlePointerMove = (v, w) => {
      this.lastMoveEvent = v, this.lastRawMoveEventInfo = w, this.lastMoveEventInfo = wl(w, this.transformPagePoint), Ee.update(this.updatePoint, !0);
    }, this.handlePointerUp = (v, w) => {
      this.end();
      const { onEnd: S, onSessionEnd: T, resumeAnimation: A } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && A && A(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const b = ef(v.type === "pointercancel" ? this.lastMoveEventInfo : wl(w, this.transformPagePoint), this.history);
      this.startEvent && S && S(v, b), T && T(v, b);
    }, !np(e))
      return;
    this.dragSnapToOrigin = a, this.handlers = n, this.transformPagePoint = r, this.distanceThreshold = l, this.contextWindow = s || window;
    const f = Jo(e), m = wl(f, this.transformPagePoint), { point: g } = m, { timestamp: d } = dt;
    this.history = [{ ...g, timestamp: d }];
    const { onSessionStart: p } = n;
    p && p(e, ef(m, this.history)), this.removeListeners = Yo(Ao(this.contextWindow, "pointermove", this.handlePointerMove), Ao(this.contextWindow, "pointerup", this.handlePointerUp), Ao(this.contextWindow, "pointercancel", this.handlePointerUp)), c && this.startScrollTracking(c);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(e) {
    let n = e.parentElement;
    for (; n; ) {
      const r = getComputedStyle(n);
      (m0.has(r.overflowX) || m0.has(r.overflowY)) && this.scrollPositions.set(n, {
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
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), Pr(this.updatePoint);
  }
}
function wl(t, e) {
  return e ? { point: e(t.point) } : t;
}
function g0(t, e) {
  return { x: t.x - e.x, y: t.y - e.y };
}
function ef({ point: t }, e) {
  return {
    point: t,
    delta: g0(t, pS(e)),
    offset: g0(t, uM(e)),
    velocity: cM(e, 0.1)
  };
}
function uM(t) {
  return t[0];
}
function pS(t) {
  return t[t.length - 1];
}
function cM(t, e) {
  if (t.length < 2)
    return { x: 0, y: 0 };
  let n = t.length - 1, r = null;
  const s = pS(t);
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
function dM(t, { min: e, max: n }, r) {
  return e !== void 0 && t < e ? t = r ? Pe(e, t, r.min) : Math.max(t, e) : n !== void 0 && t > n && (t = r ? Pe(n, t, r.max) : Math.min(t, n)), t;
}
function y0(t, e, n) {
  return {
    min: e !== void 0 ? t.min + e : void 0,
    max: n !== void 0 ? t.max + n - (t.max - t.min) : void 0
  };
}
function fM(t, { top: e, left: n, bottom: r, right: s }) {
  return {
    x: y0(t.x, n, s),
    y: y0(t.y, e, r)
  };
}
function v0(t, e) {
  let n = e.min - t.min, r = e.max - t.max;
  return e.max - e.min < t.max - t.min && ([n, r] = [r, n]), { min: n, max: r };
}
function hM(t, e) {
  return {
    x: v0(t.x, e.x),
    y: v0(t.y, e.y)
  };
}
function pM(t, e) {
  let n = 0.5;
  const r = At(t), s = At(e);
  return s > r ? n = /* @__PURE__ */ Io(e.min, e.max - r, t.min) : r > s && (n = /* @__PURE__ */ Io(t.min, t.max - s, e.min)), jn(0, 1, n);
}
function mM(t, e) {
  const n = {};
  return e.min !== void 0 && (n.min = e.min - t.min), e.max !== void 0 && (n.max = e.max - t.min), n;
}
const qf = 0.35;
function gM(t = qf) {
  return t === !1 ? t = 0 : t === !0 && (t = qf), {
    x: _0(t, "left", "right"),
    y: _0(t, "top", "bottom")
  };
}
function _0(t, e, n) {
  return {
    min: x0(t, e),
    max: x0(t, n)
  };
}
function x0(t, e) {
  return typeof t == "number" ? t : t[e] || 0;
}
const yM = /* @__PURE__ */ new WeakMap();
class vM {
  constructor(e) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = nt(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = e;
  }
  start(e, { snapToCursor: n = !1, distanceThreshold: r } = {}) {
    const { presenceContext: s } = this.visualElement;
    if (s && s.isPresent === !1)
      return;
    const a = (d) => {
      n && this.snapToCursor(Jo(d).point), this.stopAnimation();
    }, l = (d, p) => {
      const { drag: v, dragPropagation: w, onDragStart: S } = this.getProps();
      if (v && !w && (this.openDragLock && this.openDragLock(), this.openDragLock = WC(v), !this.openDragLock))
        return;
      this.latestPointerEvent = d, this.latestPanInfo = p, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Pn((A) => {
        let b = this.getAxisMotionValue(A).get() || 0;
        if (Dn.test(b)) {
          const { projection: E } = this.visualElement;
          if (E && E.layout) {
            const M = E.layout.layoutBox[A];
            M && (b = At(M) * (parseFloat(b) / 100));
          }
        }
        this.originPoint[A] = b;
      }), S && Ee.update(() => S(d, p), !1, !0), $f(this.visualElement, "transform");
      const { animationState: T } = this.visualElement;
      T && T.setActive("whileDrag", !0);
    }, c = (d, p) => {
      this.latestPointerEvent = d, this.latestPanInfo = p;
      const { dragPropagation: v, dragDirectionLock: w, onDirectionLock: S, onDrag: T } = this.getProps();
      if (!v && !this.openDragLock)
        return;
      const { offset: A } = p;
      if (w && this.currentDirection === null) {
        this.currentDirection = xM(A), this.currentDirection !== null && S && S(this.currentDirection);
        return;
      }
      this.updateAxis("x", p.point, A), this.updateAxis("y", p.point, A), this.visualElement.render(), T && Ee.update(() => T(d, p), !1, !0);
    }, f = (d, p) => {
      this.latestPointerEvent = d, this.latestPanInfo = p, this.stop(d, p), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, m = () => {
      const { dragSnapToOrigin: d } = this.getProps();
      (d || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: g } = this.getProps();
    this.panSession = new hS(e, {
      onSessionStart: a,
      onStart: l,
      onMove: c,
      onSessionEnd: f,
      resumeAnimation: m
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: g,
      distanceThreshold: r,
      contextWindow: fS(this.visualElement),
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
    if (!r || !Tl(e, s, this.currentDirection))
      return;
    const a = this.getAxisMotionValue(e);
    let l = this.originPoint[e] + r[e];
    this.constraints && this.constraints[e] && (l = dM(l, this.constraints[e], this.elastic[e])), a.set(l);
  }
  resolveConstraints() {
    var a;
    const { dragConstraints: e, dragElastic: n } = this.getProps(), r = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (a = this.visualElement.projection) == null ? void 0 : a.layout, s = this.constraints;
    e && Wi(e) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : e && r ? this.constraints = fM(r.layoutBox, e) : this.constraints = !1, this.elastic = gM(n), s !== this.constraints && !Wi(e) && r && this.constraints && !this.hasMutatedConstraints && Pn((l) => {
      this.constraints !== !1 && this.getAxisMotionValue(l) && (this.constraints[l] = mM(r.layoutBox[l], this.constraints[l]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: e, onMeasureDragConstraints: n } = this.getProps();
    if (!e || !Wi(e))
      return !1;
    const r = e.current;
    ui(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: s } = this.visualElement;
    if (!s || !s.layout)
      return !1;
    s.root && (s.root.scroll = void 0, s.root.updateScroll());
    const a = xP(r, s.root, this.visualElement.getTransformPagePoint());
    let l = hM(s.layout.layoutBox, a);
    if (n) {
      const c = n(yP(l));
      this.hasMutatedConstraints = !!c, c && (l = jx(c));
    }
    return l;
  }
  startAnimation(e) {
    const { drag: n, dragMomentum: r, dragElastic: s, dragTransition: a, dragSnapToOrigin: l, onDragTransitionEnd: c } = this.getProps(), f = this.constraints || {}, m = Pn((g) => {
      if (!Tl(g, n, this.currentDirection))
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
    return $f(this.visualElement, e), r.start(Xh(e, r, 0, n, this.visualElement, !1));
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
      if (!Tl(n, r, this.currentDirection))
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
    if (!Wi(n) || !r || !this.constraints)
      return;
    this.stopAnimation();
    const s = { x: 0, y: 0 };
    Pn((l) => {
      const c = this.getAxisMotionValue(l);
      if (c && this.constraints !== !1) {
        const f = c.get();
        s[l] = pM({ min: f, max: f }, this.constraints[l]);
      }
    });
    const { transformTemplate: a } = this.visualElement.getProps();
    this.visualElement.current.style.transform = a ? a({}, "") : "none", r.root && r.root.updateScroll(), r.updateLayout(), this.constraints = !1, this.resolveConstraints(), Pn((l) => {
      if (!Tl(l, e, null))
        return;
      const c = this.getAxisMotionValue(l), { min: f, max: m } = this.constraints[l];
      c.set(Pe(f, m, s[l]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    yM.set(this.visualElement, this);
    const e = this.visualElement.current, n = Ao(e, "pointerdown", (m) => {
      const { drag: g, dragListener: d = !0 } = this.getProps(), p = m.target, v = p !== e && QC(p);
      g && d && !v && this.start(m);
    });
    let r;
    const s = () => {
      const { dragConstraints: m } = this.getProps();
      Wi(m) && m.current && (this.constraints = this.resolveRefConstraints(), r || (r = _M(e, m.current, () => this.scalePositionWithinConstraints())));
    }, { projection: a } = this.visualElement, l = a.addEventListener("measure", s);
    a && !a.layout && (a.root && a.root.updateScroll(), a.updateLayout()), Ee.read(s);
    const c = Fo(window, "resize", () => this.scalePositionWithinConstraints()), f = a.addEventListener("didUpdate", (({ delta: m, hasLayoutChanged: g }) => {
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
    const e = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: r = !1, dragPropagation: s = !1, dragConstraints: a = !1, dragElastic: l = qf, dragMomentum: c = !0 } = e;
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
function S0(t) {
  let e = !0;
  return () => {
    if (e) {
      e = !1;
      return;
    }
    t();
  };
}
function _M(t, e, n) {
  const r = Pv(t, S0(n)), s = Pv(e, S0(n));
  return () => {
    r(), s();
  };
}
function Tl(t, e, n) {
  return (e === !0 || e === t) && (n === null || n === t);
}
function xM(t, e = 10) {
  let n = null;
  return Math.abs(t.y) > e ? n = "y" : Math.abs(t.x) > e && (n = "x"), n;
}
class SM extends Nr {
  constructor(e) {
    super(e), this.removeGroupControls = un, this.removeListeners = un, this.controls = new vM(e);
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
const tf = (t) => (e, n) => {
  t && Ee.update(() => t(e, n), !1, !0);
};
class wM extends Nr {
  constructor() {
    super(...arguments), this.removePointerDownListener = un;
  }
  onPointerDown(e) {
    this.session = new hS(e, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: fS(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: e, onPanStart: n, onPan: r, onPanEnd: s } = this.node.getProps();
    return {
      onSessionStart: tf(e),
      onStart: tf(n),
      onMove: tf(r),
      onEnd: (a, l) => {
        delete this.session, s && Ee.postRender(() => s(a, l));
      }
    };
  }
  mount() {
    this.removePointerDownListener = Ao(this.node.current, "pointerdown", (e) => this.onPointerDown(e));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let nf = !1;
class TM extends P.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: e, layoutGroup: n, switchLayoutGroup: r, layoutId: s } = this.props, { projection: a } = e;
    a && (n.group && n.group.add(a), r && r.register && s && r.register(a), nf && a.root.didUpdate(), a.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), a.setOptions({
      ...a.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), Vl.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(e) {
    const { layoutDependency: n, visualElement: r, drag: s, isPresent: a } = this.props, { projection: l } = r;
    return l && (l.isPresent = a, e.layoutDependency !== n && l.setOptions({
      ...l.options,
      layoutDependency: n
    }), nf = !0, s || e.layoutDependency !== n || n === void 0 || e.isPresent !== a ? l.willUpdate() : this.safeToRemove(), e.isPresent !== a && (a ? l.promote() : l.relegate() || Ee.postRender(() => {
      const c = l.getStack();
      (!c || !c.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: e, layoutAnchor: n } = this.props, { projection: r } = e;
    r && (r.options.layoutAnchor = n, r.root.didUpdate(), tp.postRender(() => {
      !r.currentAnimation && r.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: e, layoutGroup: n, switchLayoutGroup: r } = this.props, { projection: s } = e;
    nf = !0, s && (s.scheduleCheckAfterUnmount(), n && n.group && n.group.remove(s), r && r.deregister && r.deregister(s));
  }
  safeToRemove() {
    const { safeToRemove: e } = this.props;
    e && e();
  }
  render() {
    return null;
  }
}
function mS(t) {
  const [e, n] = rS(), r = P.useContext(Lh);
  return _.jsx(TM, { ...t, layoutGroup: r, switchLayoutGroup: P.useContext(cS), isPresent: e, safeToRemove: n });
}
const AM = {
  pan: {
    Feature: wM
  },
  drag: {
    Feature: SM,
    ProjectionNode: nS,
    MeasureLayout: mS
  }
};
function w0(t, e, n) {
  const { props: r } = t;
  t.animationState && r.whileHover && t.animationState.setActive("whileHover", n === "Start");
  const s = "onHover" + n, a = r[s];
  a && Ee.postRender(() => a(e, Jo(e)));
}
class kM extends Nr {
  mount() {
    const { current: e } = this.node;
    e && (this.unmount = GC(e, (n, r) => (w0(this.node, r, "Start"), (s) => w0(this.node, s, "End"))));
  }
  unmount() {
  }
}
class bM extends Nr {
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
    this.unmount = Yo(Fo(this.node.current, "focus", () => this.onFocus()), Fo(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function T0(t, e, n) {
  const { props: r } = t;
  if (t.current instanceof HTMLButtonElement && t.current.disabled)
    return;
  t.animationState && r.whileTap && t.animationState.setActive("whileTap", n === "Start");
  const s = "onTap" + (n === "End" ? "" : n), a = r[s];
  a && Ee.postRender(() => a(e, Jo(e)));
}
class CM extends Nr {
  mount() {
    const { current: e } = this.node;
    if (!e)
      return;
    const { globalTapTarget: n, propagate: r } = this.node.props;
    this.unmount = JC(e, (s, a) => (T0(this.node, a, "Start"), (l, { success: c }) => T0(this.node, l, c ? "End" : "Cancel")), {
      useGlobalTarget: n,
      stopPropagation: (r == null ? void 0 : r.tap) === !1
    });
  }
  unmount() {
  }
}
const Qf = /* @__PURE__ */ new WeakMap(), rf = /* @__PURE__ */ new WeakMap(), PM = (t) => {
  const e = Qf.get(t.target);
  e && e(t);
}, EM = (t) => {
  t.forEach(PM);
};
function MM({ root: t, ...e }) {
  const n = t || document;
  rf.has(n) || rf.set(n, {});
  const r = rf.get(n), s = JSON.stringify(e);
  return r[s] || (r[s] = new IntersectionObserver(EM, { root: t, ...e })), r[s];
}
function RM(t, e, n) {
  const r = MM(e);
  return Qf.set(t, n), r.observe(t), () => {
    Qf.delete(t), r.unobserve(t);
  };
}
const NM = {
  some: 0,
  all: 1
};
class IM extends Nr {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var f;
    (f = this.stopObserver) == null || f.call(this);
    const { viewport: e = {} } = this.node.getProps(), { root: n, margin: r, amount: s = "some", once: a } = e, l = {
      root: n ? n.current : void 0,
      rootMargin: r,
      threshold: typeof s == "number" ? s : NM[s]
    }, c = (m) => {
      const { isIntersecting: g } = m;
      if (this.isInView === g || (this.isInView = g, a && !g && this.hasEnteredView))
        return;
      g && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", g);
      const { onViewportEnter: d, onViewportLeave: p } = this.node.getProps(), v = g ? d : p;
      v && v(m);
    };
    this.stopObserver = RM(this.node.current, l, c);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: e, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(DM(e, n)) && this.startObserver();
  }
  unmount() {
    var e;
    (e = this.stopObserver) == null || e.call(this), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function DM({ viewport: t = {} }, { viewport: e = {} } = {}) {
  return (n) => t[n] !== e[n];
}
const jM = {
  inView: {
    Feature: IM
  },
  tap: {
    Feature: CM
  },
  focus: {
    Feature: bM
  },
  hover: {
    Feature: kM
  }
}, FM = {
  layout: {
    ProjectionNode: nS,
    MeasureLayout: mS
  }
}, OM = {
  ...oM,
  ...jM,
  ...AM,
  ...FM
}, cn = /* @__PURE__ */ tM(OM, nM);
function LM(t) {
  const e = String(t || "").toLowerCase();
  return e === "127.0.0.1" || e === "localhost" || e === "::1" || e === "[::1]";
}
const zM = (() => {
  var m, g, d, p;
  const t = globalThis.window || globalThis, e = globalThis.document || {}, n = t.SYNAPSE_DATA_API_BASE || ((g = (m = e.body) == null ? void 0 : m.dataset) == null ? void 0 : g.dataApiBase) || "";
  if (n) return String(n).replace(/\/+$/, "");
  const r = t.location || {}, s = String(t.SYNAPSE_DATA_API_PORT || ((p = (d = e.body) == null ? void 0 : d.dataset) == null ? void 0 : p.dataApiPort) || "3001").trim(), a = `http://127.0.0.1:${s || "3001"}`, { protocol: l = "file:", hostname: c = "127.0.0.1", port: f = "" } = r;
  return l === "file:" || LM(c) && f !== s ? a : `${l}//${r.host || c}`;
})(), $M = new P_(zM), sf = Number((globalThis.window || globalThis).SYNAPSE_DATA_API_TIMEOUT_MS || 6e3), VM = Number.isFinite(sf) && sf > 0 ? sf : 6e3;
function BM(t, e) {
  typeof window > "u" || console.warn(t, e);
}
async function UM(t) {
  var r, s;
  const n = (((s = (r = t.headers) == null ? void 0 : r.get) == null ? void 0 : s.call(r, "content-type")) || "").includes("application/json") ? await t.json() : {};
  if (!t.ok || (n == null ? void 0 : n.ok) === !1)
    throw new Error((n == null ? void 0 : n.error) || `Synapse data API returned HTTP ${t.status}`);
  return n;
}
async function dp(t, e = {}) {
  const n = await $M.fetch(t, {
    timeoutMs: VM,
    ...e
  });
  return UM(n);
}
async function HM(t = 50) {
  const e = await dp(`/api/generated-content?limit=${encodeURIComponent(t)}`);
  return Array.isArray(e.items) ? e.items : [];
}
async function WM(t) {
  try {
    return (await dp("/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t || {})
    })).item || null;
  } catch (e) {
    return BM("Synapse data API focus-session save skipped:", e), null;
  }
}
async function ZM(t = 40) {
  const e = await dp(`/api/focus-sessions?limit=${encodeURIComponent(t)}`);
  return Array.isArray(e.items) ? e.items : [];
}
class GM {
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
const gS = new GM();
function fp(t, e) {
  return gS.readJSON(t, e);
}
function hp(t, e) {
  return gS.writeJSON(t, e);
}
const yS = "synapse.focusRoom.sessions.v1", vS = "synapse.focusRoom.draft.v1", _S = "synapse.focusRoom.active-session.v1", du = 40;
let Xf = [];
const Qr = (t) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(t)}`, Jf = [
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
    streamUrl: Qr("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
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
    streamUrl: Qr("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: Qr("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: Qr("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: Qr("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: Qr("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: Qr("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, eh = [
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
], ea = [
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
], xS = [25, 45, 50, 90];
function KM(t = "") {
  const e = String(t || "");
  return Jf.find((n) => n.label === e) || Jf[0];
}
function YM(t = "") {
  const e = String(t || "");
  return eh.find((n) => n.label === e) || eh[0];
}
function Nu(t = {}) {
  const e = KM(t == null ? void 0 : t.musicType), n = YM(t == null ? void 0 : t.ambientSound);
  return {
    musicTrack: e,
    ambientSound: n,
    ambientLayers: n.layers.map((r) => ({
      ...r,
      volumeBias: Jr(r.volumeBias, 1)
    }))
  };
}
function pp(t) {
  return String(t || "").replace(/```[\s\S]*?```/g, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function qM(t) {
  const e = String(t || "").split(/\n+/).map((n) => n.replace(/^#+\s*/, "").trim()).find((n) => n.length > 4);
  return e ? e.slice(0, 72) : "Generated Study Notes";
}
function ci(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}
function rt(t) {
  return Array.isArray(t) ? t : [];
}
function Re(t) {
  return String(t || "").trim();
}
function Bl(t, e) {
  return Re(t || e).replace(/[^A-Za-z0-9:_%-]/g, "_").replace(/_{2,}/g, "_").slice(0, 180) || Re(e);
}
function Ul(t, e = 420) {
  const n = pp(t);
  return n ? n.length > e ? `${n.slice(0, e).trim()}...` : n : "";
}
function QM(t = {}) {
  return [...rt(t.sourceItems), ...rt(t.sources)].map((e, n) => {
    const r = typeof e == "string" ? { title: e, name: e } : ci(e), s = Re(
      r.title || r.name || r.displayName || r.display_name || r.label || r.url || r.originalUrl || `Source ${n + 1}`
    ), a = Bl(
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
      excerpt: Ul(r.content || r.text || r.excerpt || r.summary || s, 520)
    };
  }).filter((e) => e.id || e.label || e.excerpt);
}
function XM(t, e = {}) {
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
function JM(t = {}) {
  const e = QM(t), r = [
    ...rt(t.sourceHighlights),
    ...rt(t.source_highlights),
    ...rt(t.evidenceHighlights),
    ...rt(t.evidence_highlights),
    ...rt(t.sourceMap),
    ...rt(t.source_map),
    ...rt(t.citations)
  ].map((a, l) => {
    const c = typeof a == "string" ? { excerpt: a, title: a } : ci(a), f = XM(e, c), m = Re(
      c.sourceId || c.source_id || c.sourceIdentity || c.source_identity || (f == null ? void 0 : f.id)
    ), g = Re(
      c.sectionTitle || c.section_title || c.noteSection || c.note_section || c.section || c.heading
    ), d = Ul(
      c.excerpt || c.quote || c.evidence || c.sourceEvidence || c.source_evidence || c.text || c.content || c.summary,
      520
    ), p = Re(
      c.title || c.claim || c.label || g || (f == null ? void 0 : f.label) || `Source highlight ${l + 1}`
    );
    return !p && !d && !m ? null : {
      id: Bl(c.id || `${m || p}:${l}`, `highlight:${l + 1}`),
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
  const s = Object.entries(ci(t.sections)).filter(([a, l]) => /(source|evidence|citation|reference|example|case|data)/i.test(a) && Ul(l, 520)).slice(0, 8).map(([a, l], c) => {
    const f = e[c] || e[0] || null;
    return {
      id: Bl(`${(f == null ? void 0 : f.id) || "section"}:${a}:${c}`, `section-highlight:${c + 1}`),
      title: a,
      excerpt: Ul(l, 520),
      sourceId: (f == null ? void 0 : f.id) || "",
      sourceIndex: (f == null ? void 0 : f.index) || c + 1,
      sourceLabel: (f == null ? void 0 : f.label) || "Generated notes",
      sourceKind: (f == null ? void 0 : f.kind) || "notes",
      sectionTitle: a,
      kind: "section"
    };
  });
  return s.length ? s : e.filter((a) => a.excerpt || a.label).slice(0, 12).map((a, l) => ({
    id: Bl(`${a.id}:fallback:${l}`, `source-highlight:${l + 1}`),
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
function fu(t) {
  const e = Date.parse(String(t || ""));
  return Number.isFinite(e) ? e : 0;
}
function eR(t) {
  const e = t != null && t.sections && typeof t.sections == "object" ? Object.keys(t.sections).filter(Boolean) : [];
  return e.length ? e.slice(0, 8) : String((t == null ? void 0 : t.summary) || (t == null ? void 0 : t.aiSummary) || "").split(`
`).map((n) => {
    var r, s;
    return (s = (r = n.match(/^#{1,4}\s+(.+)$/)) == null ? void 0 : r[1]) == null ? void 0 : s.trim();
  }).filter(Boolean).slice(0, 8);
}
function tR(t = {}) {
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
  var O;
  (!t || typeof t != "object") && (t = {});
  const e = tR(t), n = Re(
    t.materialId || t.id || t.historyId || t.generatedContentId || t.generated_content_id || (e == null ? void 0 : e.id) || t.sourceFingerprint || t.source_fingerprint || "current-material"
  ), r = String(t.aiSummary || t.summary || t.fullSummary || ""), s = String(t.materialTitle || t.title || qM(r)), a = Re(t.sourceFingerprint || t.source_fingerprint || t.clientFingerprint || t.client_fingerprint), l = Re(t.clientFingerprint || t.client_fingerprint || a), c = ci(t.sections), f = Re(t.promptMode || t.prompt_mode) || "professor_mode", m = Re(t.detailLevel || t.detail_level), g = rt(t.flashcards || t.cards), d = rt(t.quizzes || t.quizHistory), p = rt(t.studyPlan || ((O = t.timeline) == null ? void 0 : O.events) || t.study_path), v = rt(t.progressHistory), w = rt(t.visualGallery || t.visual_gallery || t.visuals), S = rt(t.sources), T = rt(t.sourceItems), A = JM({ ...t, sources: S, sourceItems: T, sections: c }), b = t.mindMap || t.mind_map || t.brainstorm || null, E = t.uploadedContent || t.sourceText || t.source_text || "", M = rt(t.connections), C = t.createdAt || t.created_at || "", $ = t.updatedAt || t.updated_at || C, I = pp(r);
  return {
    materialId: n,
    materialTitle: s,
    materialType: t.materialType || t.type || "Generated notes",
    uploadedContent: E,
    aiSummary: r,
    summaryText: I,
    sections: c,
    studyHeadings: eR(t),
    flashcards: g,
    quizzes: d,
    mindMap: b,
    studyPlan: p,
    progressHistory: v,
    connections: M,
    visualGallery: w,
    visualGalleryCount: Number(t.visualGalleryCount || w.length || 0),
    sources: S,
    sourceItems: T,
    sourceHighlights: A,
    promptMode: f,
    detailLevel: m,
    isSourceRestricted: f === "source_strict_research_mode",
    sourceFingerprint: a,
    clientFingerprint: l,
    databaseRecord: e,
    cached: !!t.cached,
    createdAt: C,
    updatedAt: $
  };
}
function A0(t = {}) {
  var l;
  const e = [], n = Re(t.materialId), r = Re(t.sourceFingerprint), s = Re(t.clientFingerprint), a = Re(((l = t.databaseRecord) == null ? void 0 : l.id) || t.generatedContentId || t.generated_content_id);
  return n && e.push(`id:${n}`), a && e.push(`db:${a}`), r && e.push(`fp:${r}`), s && e.push(`cf:${s}`), [...new Set(e)];
}
function nR(t = {}, e = {}) {
  const n = us(t), r = us(e), s = ci(r.sections), a = ci(n.sections), l = Re(r.aiSummary), c = Re(n.aiSummary), f = l || c;
  return {
    ...n,
    ...r,
    materialId: n.materialId || r.materialId,
    materialTitle: r.materialTitle || n.materialTitle || "Generated Study Notes",
    materialType: r.materialType || n.materialType || "Generated notes",
    uploadedContent: r.uploadedContent || n.uploadedContent || "",
    aiSummary: f,
    summaryText: pp(f),
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
    updatedAt: fu(r.updatedAt) >= fu(n.updatedAt) ? r.updatedAt : n.updatedAt
  };
}
function th(...t) {
  const e = t.flatMap((s) => rt(s)), n = [], r = /* @__PURE__ */ new Map();
  return e.map(us).filter((s) => s.materialId || s.aiSummary).forEach((s) => {
    const a = A0(s), l = a.reduce((f, m) => f >= 0 ? f : r.has(m) ? r.get(m) : -1, -1);
    if (l >= 0) {
      const f = nR(n[l], s);
      n[l] = f, A0(f).forEach((m) => r.set(m, l));
      return;
    }
    const c = n.push(s) - 1;
    a.forEach((f) => r.set(f, c));
  }), n.sort((s, a) => fu(a.updatedAt || a.createdAt) - fu(s.updatedAt || s.createdAt));
}
function rR() {
  if (typeof globalThis.getSynapseFocusRoomMaterials == "function") {
    const t = globalThis.getSynapseFocusRoomMaterials();
    return Array.isArray(t) ? t.map(us) : [];
  }
  return [];
}
function iR() {
  if (typeof globalThis.getSynapseFocusRoomCurrentMaterial == "function") {
    const t = globalThis.getSynapseFocusRoomCurrentMaterial();
    return t ? us(t) : null;
  }
  return null;
}
function mp() {
  const t = rR(), e = iR();
  return e && e.aiSummary && !t.some((n) => n.materialId === e.materialId) ? th([e], t) : th(t);
}
function sR(t) {
  const e = String(t || ""), n = mp();
  return n.find((r) => r.materialId === e) || n[0] || null;
}
async function oR(t = 50) {
  const e = mp();
  try {
    const n = await HM(t), r = rt(n).map(us);
    return th(e, r);
  } catch (n) {
    return typeof window < "u" && console.warn("Synapse data API Focus Room materials sync skipped:", n), e;
  }
}
function aR({ material: t, goal: e, durationMinutes: n }) {
  var g;
  const r = Math.max(10, Number(n) || 25), s = (g = t == null ? void 0 : t.studyHeadings) != null && g.length ? t.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], a = String(e || "").trim() || `Study ${(t == null ? void 0 : t.materialTitle) || "this material"}`, l = Math.max(1, Math.floor(r * 0.2)), c = Math.max(1, Math.floor(r * 0.4)), f = Math.max(1, Math.floor(r * 0.2)), m = Math.max(1, r - l - c - f);
  return [
    { minutes: l, task: `Set the goal: ${a}` },
    { minutes: c, task: `Review ${s[0] || "the core ideas"}` },
    { minutes: f, task: `Practice with ${s[1] || s[0] || "the generated examples"}` },
    { minutes: m, task: "Summarize mistakes and choose the next study step" }
  ];
}
function SS() {
  return fp(vS, null);
}
function lR(t) {
  return hp(vS, t || null);
}
function wS(t) {
  if (!t || typeof t != "object")
    return { materials: {} };
  const e = ci(t.materials);
  return {
    ...t,
    materials: { ...e }
  };
}
function TS() {
  return wS(fp(_S, null));
}
function uR(t) {
  return hp(_S, wS(t));
}
function cR(t) {
  const e = Re(t);
  if (!e) return null;
  const r = TS().materials[e];
  return r && typeof r == "object" ? r : null;
}
function AS(t, e) {
  const n = Re(t);
  if (!n) return !1;
  const r = TS();
  return e && typeof e == "object" ? r.materials[n] = {
    ...e,
    materialId: n,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  } : delete r.materials[n], uR(r);
}
function kS(t) {
  return AS(t, null);
}
function hu() {
  const t = fp(yS, []), e = Array.isArray(t) ? t : [], n = /* @__PURE__ */ new Set();
  return [...Xf, ...e].filter((r) => {
    const s = String((r == null ? void 0 : r.sessionId) || "");
    return !s || n.has(s) ? !1 : (n.add(s), !0);
  }).slice(0, du);
}
async function dR() {
  try {
    const t = await ZM(du);
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
  return hu();
}
function Jr(t, e) {
  const n = Number(t);
  return Number.isFinite(n) ? n : e;
}
function fR(t = {}) {
  const e = (/* @__PURE__ */ new Date()).toISOString(), r = { ...{
    sessionId: t.sessionId || `focus-${Date.now()}`,
    materialId: String(t.materialId || ""),
    materialTitle: t.materialTitle || "Study material",
    studyGoal: t.studyGoal || "",
    selectedScene: t.selectedScene || "morning-window",
    musicType: t.musicType || "Deep Focus",
    ambientSound: t.ambientSound || "Nature",
    musicVolume: Jr(t.musicVolume ?? 60, 60),
    ambientVolume: Jr(t.ambientVolume ?? 50, 50),
    pomodoroDuration: Jr(t.pomodoroDuration || 25, 25),
    startedAt: t.startedAt || e,
    endedAt: t.endedAt || e,
    totalFocusTime: Math.max(0, Jr(t.totalFocusTime || 0, 0)),
    flashcardsCompleted: Math.max(0, Jr(t.flashcardsCompleted || 0, 0)),
    quizScore: t.quizScore === null || t.quizScore === void 0 || t.quizScore === "" ? null : Number.isFinite(Number(t.quizScore)) ? Number(t.quizScore) : null,
    mistakesMade: Array.isArray(t.mistakesMade) ? t.mistakesMade : [],
    completedTasks: Array.isArray(t.completedTasks) ? t.completedTasks : [],
    aiReflection: t.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: t.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: t.sessionDate || e
  }, persisted: !0 }, s = hu().filter((f) => f.sessionId !== r.sessionId), a = [r, ...s.map((f) => ({ ...f, persisted: !0 }))].slice(0, du), l = hp(yS, a), c = { ...r, persisted: l };
  return WM(c).catch((f) => {
    console.warn("Synapse data API focus-session background save failed:", f);
  }), l ? Xf = [] : Xf = [c, ...s].slice(0, du), c;
}
function Iu(t) {
  const e = Math.max(0, Jr(t || 0, 0)), n = Math.floor(e / 3600), r = Math.floor(e % 3600 / 60);
  return n ? `${n}h ${r}m` : `${r}m`;
}
function Zn(t) {
  if (t === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return t;
}
function bS(t, e) {
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
}, Oo = {
  duration: 0.5,
  overwrite: !1,
  delay: 0
}, gp, ht, Fe, an = 1e8, Ce = 1 / an, nh = Math.PI * 2, hR = nh / 4, pR = 0, CS = Math.sqrt, mR = Math.cos, gR = Math.sin, lt = function(e) {
  return typeof e == "string";
}, Ze = function(e) {
  return typeof e == "function";
}, qn = function(e) {
  return typeof e == "number";
}, yp = function(e) {
  return typeof e > "u";
}, Fn = function(e) {
  return typeof e == "object";
}, Dt = function(e) {
  return e !== !1;
}, vp = function() {
  return typeof window < "u";
}, Al = function(e) {
  return Ze(e) || lt(e);
}, PS = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {
}, _t = Array.isArray, yR = /random\([^)]+\)/g, vR = /,\s*/g, k0 = /(?:-?\.?\d|\.)+/gi, ES = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, Qi = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, of = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, MS = /[+-]=-?[.\d]+/, _R = /[^,'"\[\]\s]+/gi, xR = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, Be, En, rh, _p, Yt = {}, pu = {}, RS, NS = function(e) {
  return (pu = cs(e, Yt)) && Lt;
}, xp = function(e, n) {
  return console.warn("Invalid property", e, "set to", n, "Missing plugin? gsap.registerPlugin()");
}, Lo = function(e, n) {
  return !n && console.warn(e);
}, IS = function(e, n) {
  return e && (Yt[e] = n) && pu && (pu[e] = n) || Yt;
}, zo = function() {
  return 0;
}, SR = {
  suppressEvents: !0,
  isStart: !0,
  kill: !1
}, Hl = {
  suppressEvents: !0,
  kill: !1
}, wR = {
  suppressEvents: !0
}, Sp = {}, kr = [], ih = {}, DS, Ht = {}, af = {}, b0 = 30, Wl = [], wp = "", Tp = function(e) {
  var n = e[0], r, s;
  if (Fn(n) || Ze(n) || (e = [e]), !(r = (n._gsap || {}).harness)) {
    for (s = Wl.length; s-- && !Wl[s].targetTest(n); )
      ;
    r = Wl[s];
  }
  for (s = e.length; s--; )
    e[s] && (e[s]._gsap || (e[s]._gsap = new n1(e[s], r))) || e.splice(s, 1);
  return e;
}, si = function(e) {
  return e._gsap || Tp(ln(e))[0]._gsap;
}, jS = function(e, n, r) {
  return (r = e[n]) && Ze(r) ? e[n]() : yp(r) && e.getAttribute && e.getAttribute(n) || r;
}, jt = function(e, n) {
  return (e = e.split(",")).forEach(n) || e;
}, Ye = function(e) {
  return Math.round(e * 1e5) / 1e5 || 0;
}, Ve = function(e) {
  return Math.round(e * 1e7) / 1e7 || 0;
}, ts = function(e, n) {
  var r = n.charAt(0), s = parseFloat(n.substr(2));
  return e = parseFloat(e), r === "+" ? e + s : r === "-" ? e - s : r === "*" ? e * s : e / s;
}, TR = function(e, n) {
  for (var r = n.length, s = 0; e.indexOf(n[s]) < 0 && ++s < r; )
    ;
  return s < r;
}, mu = function() {
  var e = kr.length, n = kr.slice(0), r, s;
  for (ih = {}, kr.length = 0, r = 0; r < e; r++)
    s = n[r], s && s._lazy && (s.render(s._lazy[0], s._lazy[1], !0)._lazy = 0);
}, Ap = function(e) {
  return !!(e._initted || e._startAt || e.add);
}, FS = function(e, n, r, s) {
  kr.length && !ht && mu(), e.render(n, r, !!(ht && n < 0 && Ap(e))), kr.length && !ht && mu();
}, OS = function(e) {
  var n = parseFloat(e);
  return (n || n === 0) && (e + "").match(_R).length < 2 ? n : lt(e) ? e.trim() : e;
}, LS = function(e) {
  return e;
}, qt = function(e, n) {
  for (var r in n)
    r in e || (e[r] = n[r]);
  return e;
}, AR = function(e) {
  return function(n, r) {
    for (var s in r)
      s in n || s === "duration" && e || s === "ease" || (n[s] = r[s]);
  };
}, cs = function(e, n) {
  for (var r in n)
    e[r] = n[r];
  return e;
}, C0 = function t(e, n) {
  for (var r in n)
    r !== "__proto__" && r !== "constructor" && r !== "prototype" && (e[r] = Fn(n[r]) ? t(e[r] || (e[r] = {}), n[r]) : n[r]);
  return e;
}, gu = function(e, n) {
  var r = {}, s;
  for (s in e)
    s in n || (r[s] = e[s]);
  return r;
}, ko = function(e) {
  var n = e.parent || Be, r = e.keyframes ? AR(_t(e.keyframes)) : qt;
  if (Dt(e.inherit))
    for (; n; )
      r(e, n.vars.defaults), n = n.parent || n._dp;
  return e;
}, kR = function(e, n) {
  for (var r = e.length, s = r === n.length; s && r-- && e[r] === n[r]; )
    ;
  return r < 0;
}, zS = function(e, n, r, s, a) {
  var l = e[s], c;
  if (a)
    for (c = n[a]; l && l[a] > c; )
      l = l._prev;
  return l ? (n._next = l._next, l._next = n) : (n._next = e[r], e[r] = n), n._next ? n._next._prev = n : e[s] = n, n._prev = l, n.parent = n._dp = e, n;
}, Du = function(e, n, r, s) {
  r === void 0 && (r = "_first"), s === void 0 && (s = "_last");
  var a = n._prev, l = n._next;
  a ? a._next = l : e[r] === n && (e[r] = l), l ? l._prev = a : e[s] === n && (e[s] = a), n._next = n._prev = n.parent = null;
}, Er = function(e, n) {
  e.parent && (!n || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, oi = function(e, n) {
  if (e && (!n || n._end > e._dur || n._start < 0))
    for (var r = e; r; )
      r._dirty = 1, r = r.parent;
  return e;
}, bR = function(e) {
  for (var n = e.parent; n && n.parent; )
    n._dirty = 1, n.totalDuration(), n = n.parent;
  return e;
}, sh = function(e, n, r, s) {
  return e._startAt && (ht ? e._startAt.revert(Hl) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(n, !0, s));
}, CR = function t(e) {
  return !e || e._ts && t(e.parent);
}, P0 = function(e) {
  return e._repeat ? ds(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, ds = function(e, n) {
  var r = Math.floor(e = Ve(e / n));
  return e && r === e ? r - 1 : r;
}, yu = function(e, n) {
  return (e - n._start) * n._ts + (n._ts >= 0 ? 0 : n._dirty ? n.totalDuration() : n._tDur);
}, ju = function(e) {
  return e._end = Ve(e._start + (e._tDur / Math.abs(e._ts || e._rts || Ce) || 0));
}, Fu = function(e, n) {
  var r = e._dp;
  return r && r.smoothChildTiming && e._ts && (e._start = Ve(r._time - (e._ts > 0 ? n / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - n) / -e._ts)), ju(e), r._dirty || oi(r, e)), e;
}, $S = function(e, n) {
  var r;
  if ((n._time || !n._dur && n._initted || n._start < e._time && (n._dur || !n.add)) && (r = yu(e.rawTime(), n), (!n._dur || ta(0, n.totalDuration(), r) - n._tTime > Ce) && n.render(r, !0)), oi(e, n)._dp && e._initted && e._time >= e._dur && e._ts) {
    if (e._dur < e.duration())
      for (r = e; r._dp; )
        r.rawTime() >= 0 && r.totalTime(r._tTime), r = r._dp;
    e._zTime = -Ce;
  }
}, Rn = function(e, n, r, s) {
  return n.parent && Er(n), n._start = Ve((qn(r) ? r : r || e !== Be ? rn(e, r, n) : e._time) + n._delay), n._end = Ve(n._start + (n.totalDuration() / Math.abs(n.timeScale()) || 0)), zS(e, n, "_first", "_last", e._sort ? "_start" : 0), oh(n) || (e._recent = n), s || $S(e, n), e._ts < 0 && Fu(e, e._tTime), e;
}, VS = function(e, n) {
  return (Yt.ScrollTrigger || xp("scrollTrigger", n)) && Yt.ScrollTrigger.create(n, e);
}, BS = function(e, n, r, s, a) {
  if (bp(e, n, a), !e._initted)
    return 1;
  if (!r && e._pt && !ht && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && DS !== Wt.frame)
    return kr.push(e), e._lazy = [a, s], 1;
}, PR = function t(e) {
  var n = e.parent;
  return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || t(n));
}, oh = function(e) {
  var n = e.data;
  return n === "isFromStart" || n === "isStart";
}, ER = function(e, n, r, s) {
  var a = e.ratio, l = n < 0 || !n && (!e._start && PR(e) && !(!e._initted && oh(e)) || (e._ts < 0 || e._dp._ts < 0) && !oh(e)) ? 0 : 1, c = e._rDelay, f = 0, m, g, d;
  if (c && e._repeat && (f = ta(0, e._tDur, n), g = ds(f, c), e._yoyo && g & 1 && (l = 1 - l), g !== ds(e._tTime, c) && (a = 1 - l, e.vars.repeatRefresh && e._initted && e.invalidate())), l !== a || ht || s || e._zTime === Ce || !n && e._zTime) {
    if (!e._initted && BS(e, n, s, r, f))
      return;
    for (d = e._zTime, e._zTime = n || (r ? Ce : 0), r || (r = n && !d), e.ratio = l, e._from && (l = 1 - l), e._time = 0, e._tTime = f, m = e._pt; m; )
      m.r(l, m.d), m = m._next;
    n < 0 && sh(e, n, r, !0), e._onUpdate && !r && Zt(e, "onUpdate"), f && e._repeat && !r && e.parent && Zt(e, "onRepeat"), (n >= e._tDur || n < 0) && e.ratio === l && (l && Er(e, 1), !r && !ht && (Zt(e, l ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
  } else e._zTime || (e._zTime = n);
}, MR = function(e, n, r) {
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
  return c && !s && (e._time *= l / e._dur), e._dur = l, e._tDur = a ? a < 0 ? 1e10 : Ve(l * (a + 1) + e._rDelay * a) : l, c > 0 && !s && Fu(e, e._tTime = e._tDur * c), e.parent && ju(e), r || oi(e.parent, e), e;
}, E0 = function(e) {
  return e instanceof Nt ? oi(e) : fs(e, e._dur);
}, RR = {
  _start: 0,
  endTime: zo,
  totalDuration: zo
}, rn = function t(e, n, r) {
  var s = e.labels, a = e._recent || RR, l = e.duration() >= an ? a.endTime(!1) : e._dur, c, f, m;
  return lt(n) && (isNaN(n) || n in s) ? (f = n.charAt(0), m = n.substr(-1) === "%", c = n.indexOf("="), f === "<" || f === ">" ? (c >= 0 && (n = n.replace(/=/, "")), (f === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (m ? (c < 0 ? a : r).totalDuration() / 100 : 1)) : c < 0 ? (n in s || (s[n] = l), s[n]) : (f = parseFloat(n.charAt(c - 1) + n.substr(c + 1)), m && r && (f = f / 100 * (_t(r) ? r[0] : r).totalDuration()), c > 1 ? t(e, n.substr(0, c - 1), r) + f : l + f)) : n == null ? l : +n;
}, bo = function(e, n, r) {
  var s = qn(n[1]), a = (s ? 2 : 1) + (e < 2 ? 0 : 1), l = n[a], c, f;
  if (s && (l.duration = n[1]), l.parent = r, e) {
    for (c = l, f = r; f && !("immediateRender" in c); )
      c = f.vars.defaults || {}, f = Dt(f.vars.inherit) && f.parent;
    l.immediateRender = Dt(c.immediateRender), e < 2 ? l.runBackwards = 1 : l.startAt = n[a - 1];
  }
  return new Xe(n[0], l, n[a + 1]);
}, Ir = function(e, n) {
  return e || e === 0 ? n(e) : n;
}, ta = function(e, n, r) {
  return r < e ? e : r > n ? n : r;
}, vt = function(e, n) {
  return !lt(e) || !(n = xR.exec(e)) ? "" : n[1];
}, NR = function(e, n, r) {
  return Ir(r, function(s) {
    return ta(e, n, s);
  });
}, ah = [].slice, US = function(e, n) {
  return e && Fn(e) && "length" in e && (!n && !e.length || e.length - 1 in e && Fn(e[0])) && !e.nodeType && e !== En;
}, IR = function(e, n, r) {
  return r === void 0 && (r = []), e.forEach(function(s) {
    var a;
    return lt(s) && !n || US(s, 1) ? (a = r).push.apply(a, ln(s)) : r.push(s);
  }) || r;
}, ln = function(e, n, r) {
  return Fe && !n && Fe.selector ? Fe.selector(e) : lt(e) && !r && (rh || !hs()) ? ah.call((n || _p).querySelectorAll(e), 0) : _t(e) ? IR(e, r) : US(e) ? ah.call(e, 0) : e ? [e] : [];
}, lh = function(e) {
  return e = ln(e)[0] || Lo("Invalid scope") || {}, function(n) {
    var r = e.current || e.nativeElement || e;
    return ln(n, r.querySelectorAll ? r : r === e ? Lo("Invalid scope") || _p.createElement("div") : e);
  };
}, HS = function(e) {
  return e.sort(function() {
    return 0.5 - Math.random();
  });
}, WS = function(e) {
  if (Ze(e))
    return e;
  var n = Fn(e) ? e : {
    each: e
  }, r = ai(n.ease), s = n.from || 0, a = parseFloat(n.base) || 0, l = {}, c = s > 0 && s < 1, f = isNaN(s) || c, m = n.axis, g = s, d = s;
  return lt(s) ? g = d = {
    center: 0.5,
    edges: 0.5,
    end: 1
  }[s] || 0 : !c && f && (g = s[0], d = s[1]), function(p, v, w) {
    var S = (w || n).length, T = l[S], A, b, E, M, C, $, I, O, L;
    if (!T) {
      if (L = n.grid === "auto" ? 0 : (n.grid || [1, an])[1], !L) {
        for (I = -an; I < (I = w[L++].getBoundingClientRect().left) && L < S; )
          ;
        L < S && L--;
      }
      for (T = l[S] = [], A = f ? Math.min(L, S) * g - 0.5 : s % L, b = L === an ? 0 : f ? S * d / L - 0.5 : s / L | 0, I = 0, O = an, $ = 0; $ < S; $++)
        E = $ % L - A, M = b - ($ / L | 0), T[$] = C = m ? Math.abs(m === "y" ? M : E) : CS(E * E + M * M), C > I && (I = C), C < O && (O = C);
      s === "random" && HS(T), T.max = I - O, T.min = O, T.v = S = (parseFloat(n.amount) || parseFloat(n.each) * (L > S ? S - 1 : m ? m === "y" ? S / L : L : Math.max(L, S / L)) || 0) * (s === "edges" ? -1 : 1), T.b = S < 0 ? a - S : a, T.u = vt(n.amount || n.each) || 0, r = r && S < 0 ? ZR(r) : r;
    }
    return S = (T[p] - T.min) / T.max || 0, Ve(T.b + (r ? r(S) : S) * T.v) + T.u;
  };
}, uh = function(e) {
  var n = Math.pow(10, ((e + "").split(".")[1] || "").length);
  return function(r) {
    var s = Ve(Math.round(parseFloat(r) / e) * e * n);
    return (s - s % 1) / n + (qn(r) ? 0 : vt(r));
  };
}, ZS = function(e, n) {
  var r = _t(e), s, a;
  return !r && Fn(e) && (s = r = e.radius || an, e.values ? (e = ln(e.values), (a = !qn(e[0])) && (s *= s)) : e = uh(e.increment)), Ir(n, r ? Ze(e) ? function(l) {
    return a = e(l), Math.abs(a - l) <= s ? a : l;
  } : function(l) {
    for (var c = parseFloat(a ? l.x : l), f = parseFloat(a ? l.y : 0), m = an, g = 0, d = e.length, p, v; d--; )
      a ? (p = e[d].x - c, v = e[d].y - f, p = p * p + v * v) : p = Math.abs(e[d] - c), p < m && (m = p, g = d);
    return g = !s || m <= s ? e[g] : l, a || g === l || qn(l) ? g : g + vt(l);
  } : uh(e));
}, GS = function(e, n, r, s) {
  return Ir(_t(e) ? !n : r === !0 ? !!(r = 0) : !s, function() {
    return _t(e) ? e[~~(Math.random() * e.length)] : (r = r || 1e-5) && (s = r < 1 ? Math.pow(10, (r + "").length - 2) : 1) && Math.floor(Math.round((e - r / 2 + Math.random() * (n - e + r * 0.99)) / r) * r * s) / s;
  });
}, DR = function() {
  for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
    n[r] = arguments[r];
  return function(s) {
    return n.reduce(function(a, l) {
      return l(a);
    }, s);
  };
}, jR = function(e, n) {
  return function(r) {
    return e(parseFloat(r)) + (n || vt(r));
  };
}, FR = function(e, n, r) {
  return YS(e, n, 0, 1, r);
}, KS = function(e, n, r) {
  return Ir(r, function(s) {
    return e[~~n(s)];
  });
}, OR = function t(e, n, r) {
  var s = n - e;
  return _t(e) ? KS(e, t(0, e.length), n) : Ir(r, function(a) {
    return (s + (a - e) % s) % s + e;
  });
}, LR = function t(e, n, r) {
  var s = n - e, a = s * 2;
  return _t(e) ? KS(e, t(0, e.length - 1), n) : Ir(r, function(l) {
    return l = (a + (l - e) % a) % a || 0, e + (l > s ? a - l : l);
  });
}, $o = function(e) {
  return e.replace(yR, function(n) {
    var r = n.indexOf("[") + 1, s = n.substring(r || 7, r ? n.indexOf("]") : n.length - 1).split(vR);
    return GS(r ? s : +s[0], r ? 0 : +s[1], +s[2] || 1e-5);
  });
}, YS = function(e, n, r, s, a) {
  var l = n - e, c = s - r;
  return Ir(a, function(f) {
    return r + ((f - e) / l * c || 0);
  });
}, zR = function t(e, n, r, s) {
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
        var S = Math.min(p, ~~w);
        return g[S](w - S);
      }, r = n;
    } else s || (e = cs(_t(e) ? [] : {}, e));
    if (!g) {
      for (f in n)
        kp.call(c, e, f, "get", n[f]);
      a = function(w) {
        return Ep(w, c) || (l ? e.p : e);
      };
    }
  }
  return Ir(r, a);
}, M0 = function(e, n, r) {
  var s = e.labels, a = an, l, c, f;
  for (l in s)
    c = s[l] - n, c < 0 == !!r && c && a > (c = Math.abs(c)) && (f = l, a = c);
  return f;
}, Zt = function(e, n, r) {
  var s = e.vars, a = s[n], l = Fe, c = e._ctx, f, m, g;
  if (a)
    return f = s[n + "Params"], m = s.callbackScope || e, r && kr.length && mu(), c && (Fe = c), g = f ? a.apply(m, f) : a.call(m), Fe = l, g;
}, go = function(e) {
  return Er(e), e.scrollTrigger && e.scrollTrigger.kill(!!ht), e.progress() < 1 && Zt(e, "onInterrupt"), e;
}, Xi, qS = [], QS = function(e) {
  if (e)
    if (e = !e.name && e.default || e, vp() || e.headless) {
      var n = e.name, r = Ze(e), s = n && !r && e.init ? function() {
        this._props = [];
      } : e, a = {
        init: zo,
        render: Ep,
        add: kp,
        kill: nN,
        modifier: tN,
        rawVars: 0
      }, l = {
        targetTest: 0,
        get: 0,
        getSetter: Pp,
        aliases: {},
        register: 0
      };
      if (hs(), e !== s) {
        if (Ht[n])
          return;
        qt(s, qt(gu(e, a), l)), cs(s.prototype, cs(a, gu(e, l))), Ht[s.prop = n] = s, e.targetTest && (Wl.push(s), Sp[n] = 1), n = (n === "css" ? "CSS" : n.charAt(0).toUpperCase() + n.substr(1)) + "Plugin";
      }
      IS(n, s), e.register && e.register(Lt, s, Ft);
    } else
      qS.push(e);
}, be = 255, yo = {
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
}, lf = function(e, n, r) {
  return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? n + (r - n) * e * 6 : e < 0.5 ? r : e * 3 < 2 ? n + (r - n) * (2 / 3 - e) * 6 : n) * be + 0.5 | 0;
}, XS = function(e, n, r) {
  var s = e ? qn(e) ? [e >> 16, e >> 8 & be, e & be] : 0 : yo.black, a, l, c, f, m, g, d, p, v, w;
  if (!s) {
    if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), yo[e])
      s = yo[e];
    else if (e.charAt(0) === "#") {
      if (e.length < 6 && (a = e.charAt(1), l = e.charAt(2), c = e.charAt(3), e = "#" + a + a + l + l + c + c + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9)
        return s = parseInt(e.substr(1, 6), 16), [s >> 16, s >> 8 & be, s & be, parseInt(e.substr(7), 16) / 255];
      e = parseInt(e.substr(1), 16), s = [e >> 16, e >> 8 & be, e & be];
    } else if (e.substr(0, 3) === "hsl") {
      if (s = w = e.match(k0), !n)
        f = +s[0] % 360 / 360, m = +s[1] / 100, g = +s[2] / 100, l = g <= 0.5 ? g * (m + 1) : g + m - g * m, a = g * 2 - l, s.length > 3 && (s[3] *= 1), s[0] = lf(f + 1 / 3, a, l), s[1] = lf(f, a, l), s[2] = lf(f - 1 / 3, a, l);
      else if (~e.indexOf("="))
        return s = e.match(ES), r && s.length < 4 && (s[3] = 1), s;
    } else
      s = e.match(k0) || yo.transparent;
    s = s.map(Number);
  }
  return n && !w && (a = s[0] / be, l = s[1] / be, c = s[2] / be, d = Math.max(a, l, c), p = Math.min(a, l, c), g = (d + p) / 2, d === p ? f = m = 0 : (v = d - p, m = g > 0.5 ? v / (2 - d - p) : v / (d + p), f = d === a ? (l - c) / v + (l < c ? 6 : 0) : d === l ? (c - a) / v + 2 : (a - l) / v + 4, f *= 60), s[0] = ~~(f + 0.5), s[1] = ~~(m * 100 + 0.5), s[2] = ~~(g * 100 + 0.5)), r && s.length < 4 && (s[3] = 1), s;
}, JS = function(e) {
  var n = [], r = [], s = -1;
  return e.split(br).forEach(function(a) {
    var l = a.match(Qi) || [];
    n.push.apply(n, l), r.push(s += l.length + 1);
  }), n.c = r, n;
}, R0 = function(e, n, r) {
  var s = "", a = (e + s).match(br), l = n ? "hsla(" : "rgba(", c = 0, f, m, g, d;
  if (!a)
    return e;
  if (a = a.map(function(p) {
    return (p = XS(p, n, 1)) && l + (n ? p[0] + "," + p[1] + "%," + p[2] + "%," + p[3] : p.join(",")) + ")";
  }), r && (g = JS(e), f = r.c, f.join(s) !== g.c.join(s)))
    for (m = e.replace(br, "1").split(Qi), d = m.length - 1; c < d; c++)
      s += m[c] + (~f.indexOf(c) ? a.shift() || l + "0,0,0,0)" : (g.length ? g : a.length ? a : r).shift());
  if (!m)
    for (m = e.split(br), d = m.length - 1; c < d; c++)
      s += m[c] + a[c];
  return s + m[d];
}, br = (function() {
  var t = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", e;
  for (e in yo)
    t += "|" + e + "\\b";
  return new RegExp(t + ")", "gi");
})(), $R = /hsl[a]?\(/, e1 = function(e) {
  var n = e.join(" "), r;
  if (br.lastIndex = 0, br.test(n))
    return r = $R.test(n), e[1] = R0(e[1], r), e[0] = R0(e[0], r, JS(e[1])), !0;
}, Vo, Wt = (function() {
  var t = Date.now, e = 500, n = 33, r = t(), s = r, a = 1e3 / 240, l = a, c = [], f, m, g, d, p, v, w = function S(T) {
    var A = t() - s, b = T === !0, E, M, C, $;
    if ((A > e || A < 0) && (r += A - n), s += A, C = s - r, E = C - l, (E > 0 || b) && ($ = ++d.frame, p = C - d.time * 1e3, d.time = C = C / 1e3, l += E + (E >= a ? 4 : a - E), M = 1), b || (f = m(S)), M)
      for (v = 0; v < c.length; v++)
        c[v](C, p, $, T);
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
      RS && (!rh && vp() && (En = rh = window, _p = En.document || {}, Yt.gsap = Lt, (En.gsapVersions || (En.gsapVersions = [])).push(Lt.version), NS(pu || En.GreenSockGlobals || !En.gsap && En || {}), qS.forEach(QS)), g = typeof requestAnimationFrame < "u" && requestAnimationFrame, f && d.sleep(), m = g || function(T) {
        return setTimeout(T, l - d.time * 1e3 + 1 | 0);
      }, Vo = 1, w(2));
    },
    sleep: function() {
      (g ? cancelAnimationFrame : clearTimeout)(f), Vo = 0, m = zo;
    },
    lagSmoothing: function(T, A) {
      e = T || 1 / 0, n = Math.min(A || 33, e);
    },
    fps: function(T) {
      a = 1e3 / (T || 240), l = d.time * 1e3 + a;
    },
    add: function(T, A, b) {
      var E = A ? function(M, C, $, I) {
        T(M, C, $, I), d.remove(E);
      } : T;
      return d.remove(T), c[b ? "unshift" : "push"](E), hs(), E;
    },
    remove: function(T, A) {
      ~(A = c.indexOf(T)) && c.splice(A, 1) && v >= A && v--;
    },
    _listeners: c
  }, d;
})(), hs = function() {
  return !Vo && Wt.wake();
}, xe = {}, VR = /^[\d.\-M][\d.\-,\s]/, BR = /["']/g, UR = function(e) {
  for (var n = {}, r = e.substr(1, e.length - 3).split(":"), s = r[0], a = 1, l = r.length, c, f, m; a < l; a++)
    f = r[a], c = a !== l - 1 ? f.lastIndexOf(",") : f.length, m = f.substr(0, c), n[s] = isNaN(m) ? m.replace(BR, "").trim() : +m, s = f.substr(c + 1).trim();
  return n;
}, HR = function(e) {
  var n = e.indexOf("(") + 1, r = e.indexOf(")"), s = e.indexOf("(", n);
  return e.substring(n, ~s && s < r ? e.indexOf(")", r + 1) : r);
}, WR = function(e) {
  var n = (e + "").split("("), r = xe[n[0]];
  return r && n.length > 1 && r.config ? r.config.apply(null, ~e.indexOf("{") ? [UR(n[1])] : HR(e).split(",").map(OS)) : xe._CE && VR.test(e) ? xe._CE("", e) : r;
}, ZR = function(e) {
  return function(n) {
    return 1 - e(1 - n);
  };
}, ai = function(e, n) {
  return e && (Ze(e) ? e : xe[e] || WR(e)) || n;
}, fi = function(e, n, r, s) {
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
    xe[c] = Yt[c] = a, xe[l = c.toLowerCase()] = r;
    for (var f in a)
      xe[l + (f === "easeIn" ? ".in" : f === "easeOut" ? ".out" : ".inOut")] = xe[c + "." + f] = a[f];
  }), a;
}, t1 = function(e) {
  return function(n) {
    return n < 0.5 ? (1 - e(1 - n * 2)) / 2 : 0.5 + e((n - 0.5) * 2) / 2;
  };
}, uf = function t(e, n, r) {
  var s = n >= 1 ? n : 1, a = (r || (e ? 0.3 : 0.45)) / (n < 1 ? n : 1), l = a / nh * (Math.asin(1 / s) || 0), c = function(g) {
    return g === 1 ? 1 : s * Math.pow(2, -10 * g) * gR((g - l) * a) + 1;
  }, f = e === "out" ? c : e === "in" ? function(m) {
    return 1 - c(1 - m);
  } : t1(c);
  return a = nh / a, f.config = function(m, g) {
    return t(e, m, g);
  }, f;
}, cf = function t(e, n) {
  n === void 0 && (n = 1.70158);
  var r = function(l) {
    return l ? --l * l * ((n + 1) * l + n) + 1 : 0;
  }, s = e === "out" ? r : e === "in" ? function(a) {
    return 1 - r(1 - a);
  } : t1(r);
  return s.config = function(a) {
    return t(e, a);
  }, s;
};
jt("Linear,Quad,Cubic,Quart,Quint,Strong", function(t, e) {
  var n = e < 5 ? e + 1 : e;
  fi(t + ",Power" + (n - 1), e ? function(r) {
    return Math.pow(r, n);
  } : function(r) {
    return r;
  }, function(r) {
    return 1 - Math.pow(1 - r, n);
  }, function(r) {
    return r < 0.5 ? Math.pow(r * 2, n) / 2 : 1 - Math.pow((1 - r) * 2, n) / 2;
  });
});
xe.Linear.easeNone = xe.none = xe.Linear.easeIn;
fi("Elastic", uf("in"), uf("out"), uf());
(function(t, e) {
  var n = 1 / e, r = 2 * n, s = 2.5 * n, a = function(c) {
    return c < n ? t * c * c : c < r ? t * Math.pow(c - 1.5 / e, 2) + 0.75 : c < s ? t * (c -= 2.25 / e) * c + 0.9375 : t * Math.pow(c - 2.625 / e, 2) + 0.984375;
  };
  fi("Bounce", function(l) {
    return 1 - a(1 - l);
  }, a);
})(7.5625, 2.75);
fi("Expo", function(t) {
  return Math.pow(2, 10 * (t - 1)) * t + t * t * t * t * t * t * (1 - t);
});
fi("Circ", function(t) {
  return -(CS(1 - t * t) - 1);
});
fi("Sine", function(t) {
  return t === 1 ? 1 : -mR(t * hR) + 1;
});
fi("Back", cf("in"), cf("out"), cf());
xe.SteppedEase = xe.steps = Yt.SteppedEase = {
  config: function(e, n) {
    e === void 0 && (e = 1);
    var r = 1 / e, s = e + (n ? 0 : 1), a = n ? 1 : 0, l = 1 - Ce;
    return function(c) {
      return ((s * ta(0, l, c) | 0) + a) * r;
    };
  }
};
Oo.ease = xe["quad.out"];
jt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(t) {
  return wp += t + "," + t + "Params,";
});
var n1 = function(e, n) {
  this.id = pR++, e._gsap = this, this.target = e, this.harness = n, this.get = n ? n.get : jS, this.set = n ? n.getSetter : Pp;
}, Bo = /* @__PURE__ */ (function() {
  function t(n) {
    this.vars = n, this._delay = +n.delay || 0, (this._repeat = n.repeat === 1 / 0 ? -2 : n.repeat || 0) && (this._rDelay = n.repeatDelay || 0, this._yoyo = !!n.yoyo || !!n.yoyoEase), this._ts = 1, fs(this, +n.duration, 1, 1), this.data = n.data, Fe && (this._ctx = Fe, Fe.data.push(this)), Vo || Wt.wake();
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
      for (Fu(this, r), !a._dp || a.parent || $S(a, this); a && a.parent; )
        a.parent._time !== a._start + (a._ts >= 0 ? a._tTime / a._ts : (a.totalDuration() - a._tTime) / -a._ts) && a.totalTime(a._tTime, !0), a = a.parent;
      !this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && r < this._tDur || this._ts < 0 && r > 0 || !this._tDur && !r) && Rn(this._dp, this, this._start - this._delay);
    }
    return (this._tTime !== r || !this._dur && !s || this._initted && Math.abs(this._zTime) === Ce || !this._initted && this._dur && r || !r && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = r), FS(this, r, s)), this;
  }, e.time = function(r, s) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), r + P0(this)) % (this._dur + this._rDelay) || (r ? this._dur : 0), s) : this._time;
  }, e.totalProgress = function(r, s) {
    return arguments.length ? this.totalTime(this.totalDuration() * r, s) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  }, e.progress = function(r, s) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - r : r) + P0(this), s) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  }, e.iteration = function(r, s) {
    var a = this.duration() + this._rDelay;
    return arguments.length ? this.totalTime(this._time + (r - 1) * a, s) : this._repeat ? ds(this._tTime, a) + 1 : 1;
  }, e.timeScale = function(r, s) {
    if (!arguments.length)
      return this._rts === -Ce ? 0 : this._rts;
    if (this._rts === r)
      return this;
    var a = this.parent && this._ts ? yu(this.parent._time, this) : this._tTime;
    return this._rts = +r || 0, this._ts = this._ps || r === -Ce ? 0 : this._rts, this.totalTime(ta(-Math.abs(this._delay), this.totalDuration(), a), s !== !1), ju(this), bR(this);
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
    return s ? r && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? yu(s.rawTime(r), this) : this._tTime : this._tTime;
  }, e.revert = function(r) {
    r === void 0 && (r = wR);
    var s = ht;
    return ht = r, Ap(this) && (this.timeline && this.timeline.revert(r), this.totalTime(-0.01, r.suppressEvents)), this.data !== "nested" && r.kill !== !1 && this.kill(), ht = s, this;
  }, e.globalTime = function(r) {
    for (var s = this, a = arguments.length ? r : s.rawTime(); s; )
      a = s._start + a / (Math.abs(s._ts) || 1), s = s._dp;
    return !this.parent && this._sat ? this._sat.globalTime(r) : a;
  }, e.repeat = function(r) {
    return arguments.length ? (this._repeat = r === 1 / 0 ? -2 : r, E0(this)) : this._repeat === -2 ? 1 / 0 : this._repeat;
  }, e.repeatDelay = function(r) {
    if (arguments.length) {
      var s = this._time;
      return this._rDelay = r, E0(this), s ? this.time(s) : this;
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
      var c = Ze(r) ? r : LS, f = function() {
        var g = s.then;
        s.then = null, a && a(), Ze(c) && (c = c(s)) && (c.then || c === s) && (s.then = g), l(c), s.then = g;
      };
      s._initted && s.totalProgress() === 1 && s._ts >= 0 || !s._tTime && s._ts < 0 ? f() : s._prom = f;
    });
  }, e.kill = function() {
    go(this);
  }, t;
})();
qt(Bo.prototype, {
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
  bS(e, t);
  function e(r, s) {
    var a;
    return r === void 0 && (r = {}), a = t.call(this, r) || this, a.labels = {}, a.smoothChildTiming = !!r.smoothChildTiming, a.autoRemoveChildren = !!r.autoRemoveChildren, a._sort = Dt(r.sortChildren), Be && Rn(r.parent || Be, Zn(a), s), r.reversed && a.reverse(), r.paused && a.paused(!0), r.scrollTrigger && VS(Zn(a), r.scrollTrigger), a;
  }
  var n = e.prototype;
  return n.to = function(s, a, l) {
    return bo(0, arguments, this), this;
  }, n.from = function(s, a, l) {
    return bo(1, arguments, this), this;
  }, n.fromTo = function(s, a, l, c) {
    return bo(2, arguments, this), this;
  }, n.set = function(s, a, l) {
    return a.duration = 0, a.parent = this, ko(a).repeatDelay || (a.repeat = 0), a.immediateRender = !!a.immediateRender, new Xe(s, a, rn(this, l), 1), this;
  }, n.call = function(s, a, l) {
    return Rn(this, Xe.delayedCall(0, s, a), l);
  }, n.staggerTo = function(s, a, l, c, f, m, g) {
    return l.duration = a, l.stagger = l.stagger || c, l.onComplete = m, l.onCompleteParams = g, l.parent = this, new Xe(s, l, rn(this, f)), this;
  }, n.staggerFrom = function(s, a, l, c, f, m, g) {
    return l.runBackwards = 1, ko(l).immediateRender = Dt(l.immediateRender), this.staggerTo(s, a, l, c, f, m, g);
  }, n.staggerFromTo = function(s, a, l, c, f, m, g, d) {
    return c.startAt = l, ko(c).immediateRender = Dt(c.immediateRender), this.staggerTo(s, a, c, f, m, g, d);
  }, n.render = function(s, a, l) {
    var c = this._time, f = this._dirty ? this.totalDuration() : this._tDur, m = this._dur, g = s <= 0 ? 0 : Ve(s), d = this._zTime < 0 != s < 0 && (this._initted || !m), p, v, w, S, T, A, b, E, M, C, $, I;
    if (this !== Be && g > f && s >= 0 && (g = f), g !== this._tTime || l || d) {
      if (c !== this._time && m && (g += this._time - c, s += this._time - c), p = g, M = this._start, E = this._ts, A = !E, d && (m || (c = this._zTime), (s || !a) && (this._zTime = s)), this._repeat) {
        if ($ = this._yoyo, T = m + this._rDelay, this._repeat < -1 && s < 0)
          return this.totalTime(T * 100 + s, a, l);
        if (p = Ve(g % T), g === f ? (S = this._repeat, p = m) : (C = Ve(g / T), S = ~~C, S && S === C && (p = m, S--), p > m && (p = m)), C = ds(this._tTime, T), !c && this._tTime && C !== S && this._tTime - C * T - this._dur <= 0 && (C = S), $ && S & 1 && (p = m - p, I = 1), S !== C && !this._lock) {
          var O = $ && C & 1, L = O === ($ && S & 1);
          if (S < C && (O = !O), c = O ? 0 : g % m ? m : g, this._lock = 1, this.render(c || (I ? 0 : Ve(S * T)), a, !m)._lock = 0, this._tTime = g, !a && this.parent && Zt(this, "onRepeat"), this.vars.repeatRefresh && !I && (this.invalidate()._lock = 1, C = S), c && c !== this._time || A !== !this._ts || this.vars.onRepeat && !this.parent && !this._act)
            return this;
          if (m = this._dur, f = this._tDur, L && (this._lock = 2, c = O ? m : -1e-4, this.render(c, !0), this.vars.repeatRefresh && !I && this.invalidate()), this._lock = 0, !this._ts && !A)
            return this;
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2 && (b = MR(this, Ve(c), Ve(p)), b && (g -= p - (p = b._start))), this._tTime = g, this._time = p, this._act = !!E, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = s, c = 0), !c && g && m && !a && !C && (Zt(this, "onStart"), this._tTime !== g))
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
            if (v.render(v._ts > 0 ? (U - v._start) * v._ts : (v._dirty ? v.totalDuration() : v._tDur) + (U - v._start) * v._ts, a, l || ht && Ap(v)), p !== this._time || !this._ts && !A) {
              b = 0, w && (g += this._zTime = U ? -Ce : Ce);
              break;
            }
          }
          v = w;
        }
      }
      if (b && !a && (this.pause(), b.render(p >= c ? 0 : -Ce)._zTime = p >= c ? 1 : -1, this._ts))
        return this._start = M, ju(this), this.render(s, a, l);
      this._onUpdate && !a && Zt(this, "onUpdate", !0), (g === f && this._tTime >= this.totalDuration() || !g && c) && (M === this._start || Math.abs(E) !== Math.abs(this._ts)) && (this._lock || ((s || !m) && (g === f && this._ts > 0 || !g && this._ts < 0) && Er(this, 1), !a && !(s < 0 && !c) && (g || c || !f) && (Zt(this, g === f && s >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(g < f && this.timeScale() > 0) && this._prom())));
    }
    return this;
  }, n.add = function(s, a) {
    var l = this;
    if (qn(a) || (a = rn(this, a, s)), !(s instanceof Bo)) {
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
    return lt(s) ? this.removeLabel(s) : Ze(s) ? this.killTweensOf(s) : (s.parent === this && Du(this, s), s === this._recent && (this._recent = this._last), oi(this));
  }, n.totalTime = function(s, a) {
    return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = Ve(Wt.time - (this._ts > 0 ? s / this._ts : (this.totalDuration() - s) / -this._ts))), t.prototype.totalTime.call(this, s, a), this._forcing = 0, this) : this._tTime;
  }, n.addLabel = function(s, a) {
    return this.labels[s] = rn(this, a), this;
  }, n.removeLabel = function(s) {
    return delete this.labels[s], this;
  }, n.addPause = function(s, a, l) {
    var c = Xe.delayedCall(0, a || zo, l);
    return c.data = "isPause", this._hasPause = 1, Rn(this, c, rn(this, s));
  }, n.removePause = function(s) {
    var a = this._first;
    for (s = rn(this, s); a; )
      a._start === s && a.data === "isPause" && Er(a), a = a._next;
  }, n.killTweensOf = function(s, a, l) {
    for (var c = this.getTweensOf(s, l), f = c.length; f--; )
      Sr !== c[f] && c[f].kill(s, a);
    return this;
  }, n.getTweensOf = function(s, a) {
    for (var l = [], c = ln(s), f = this._first, m = qn(a), g; f; )
      f instanceof Xe ? TR(f._targets, c) && (m ? (!Sr || f._initted && f._ts) && f.globalTime(0) <= a && f.globalTime(f.totalDuration()) > a : !a || f.isActive()) && l.push(f) : (g = f.getTweensOf(c, a)).length && l.push.apply(l, g), f = f._next;
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
    return s === void 0 && (s = this._time), M0(this, rn(this, s));
  }, n.previousLabel = function(s) {
    return s === void 0 && (s = this._time), M0(this, rn(this, s), 1);
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
    return oi(this);
  }, n.invalidate = function(s) {
    var a = this._first;
    for (this._lock = 0; a; )
      a.invalidate(s), a = a._next;
    return t.prototype.invalidate.call(this, s);
  }, n.clear = function(s) {
    s === void 0 && (s = !0);
    for (var a = this._first, l; a; )
      l = a._next, this.remove(a), a = l;
    return this._dp && (this._time = this._tTime = this._pTime = 0), s && (this.labels = {}), oi(this);
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
    if (Be._ts && (FS(Be, yu(s, Be)), DS = Wt.frame), Wt.frame >= b0) {
      b0 += Kt.autoSleep || 120;
      var a = Be._first;
      if ((!a || !a._ts) && Kt.autoSleep && Wt._listeners.length < 2) {
        for (; a && !a._ts; )
          a = a._next;
        a || Wt.sleep();
      }
    }
  }, e;
})(Bo);
qt(Nt.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});
var GR = function(e, n, r, s, a, l, c) {
  var f = new Ft(this._pt, e, n, 0, 1, l1, null, a), m = 0, g = 0, d, p, v, w, S, T, A, b;
  for (f.b = r, f.e = s, r += "", s += "", (A = ~s.indexOf("random(")) && (s = $o(s)), l && (b = [r, s], l(b, e, n), r = b[0], s = b[1]), p = r.match(of) || []; d = of.exec(s); )
    w = d[0], S = s.substring(m, d.index), v ? v = (v + 1) % 5 : S.substr(-5) === "rgba(" && (v = 1), w !== p[g++] && (T = parseFloat(p[g - 1]) || 0, f._pt = {
      _next: f._pt,
      p: S || g === 1 ? S : ",",
      //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
      s: T,
      c: w.charAt(1) === "=" ? ts(T, w) - T : parseFloat(w) - T,
      m: v && v < 4 ? Math.round : 0
    }, m = of.lastIndex);
  return f.c = m < s.length ? s.substring(m, s.length) : "", f.fp = c, (MS.test(s) || A) && (f.e = 0), this._pt = f, f;
}, kp = function(e, n, r, s, a, l, c, f, m, g) {
  Ze(s) && (s = s(a || 0, e, l));
  var d = e[n], p = r !== "get" ? r : Ze(d) ? m ? e[n.indexOf("set") || !Ze(e["get" + n.substr(3)]) ? n : "get" + n.substr(3)](m) : e[n]() : d, v = Ze(d) ? m ? XR : o1 : Cp, w;
  if (lt(s) && (~s.indexOf("random(") && (s = $o(s)), s.charAt(1) === "=" && (w = ts(p, s) + (vt(p) || 0), (w || w === 0) && (s = w))), !g || p !== s || ch)
    return !isNaN(p * s) && s !== "" ? (w = new Ft(this._pt, e, n, +p || 0, s - (p || 0), typeof d == "boolean" ? eN : a1, 0, v), m && (w.fp = m), c && w.modifier(c, this, e), this._pt = w) : (!d && !(n in e) && xp(n, s), GR.call(this, e, n, p, s, v, f || Kt.stringFilter, m));
}, KR = function(e, n, r, s, a) {
  if (Ze(e) && (e = Co(e, a, n, r, s)), !Fn(e) || e.style && e.nodeType || _t(e) || PS(e))
    return lt(e) ? Co(e, a, n, r, s) : e;
  var l = {}, c;
  for (c in e)
    l[c] = Co(e[c], a, n, r, s);
  return l;
}, r1 = function(e, n, r, s, a, l) {
  var c, f, m, g;
  if (Ht[e] && (c = new Ht[e]()).init(a, c.rawVars ? n[e] : KR(n[e], s, a, l, r), r, s, l) !== !1 && (r._pt = f = new Ft(r._pt, a, e, 0, 1, c.render, c, 0, c.priority), r !== Xi))
    for (m = r._ptLookup[r._targets.indexOf(a)], g = c._props.length; g--; )
      m[c._props[g]] = f;
  return c;
}, Sr, ch, bp = function t(e, n, r) {
  var s = e.vars, a = s.ease, l = s.startAt, c = s.immediateRender, f = s.lazy, m = s.onUpdate, g = s.runBackwards, d = s.yoyoEase, p = s.keyframes, v = s.autoRevert, w = e._dur, S = e._startAt, T = e._targets, A = e.parent, b = A && A.data === "nested" ? A.vars.targets : T, E = e._overwrite === "auto" && !gp, M = e.timeline, C = s.easeReverse || d, $, I, O, L, U, q, ee, ne, ie, ge, ce, fe, W;
  if (M && (!p || !a) && (a = "none"), e._ease = ai(a, Oo.ease), e._rEase = C && (ai(C) || e._ease), e._from = !M && !!s.runBackwards, e._from && (e.ratio = 1), !M || p && !s.stagger) {
    if (ne = T[0] ? si(T[0]).harness : 0, fe = ne && s[ne.prop], $ = gu(s, Sp), S && (S._zTime < 0 && S.progress(1), n < 0 && g && c && !v ? S.render(-1, !0) : S.revert(g && w ? Hl : SR), S._lazy = 0), l) {
      if (Er(e._startAt = Xe.set(T, qt({
        data: "isStart",
        overwrite: !1,
        parent: A,
        immediateRender: !0,
        lazy: !S && Dt(f),
        startAt: null,
        delay: 0,
        onUpdate: m && function() {
          return Zt(e, "onUpdate");
        },
        stagger: 0
      }, l))), e._startAt._dp = 0, e._startAt._sat = e, n < 0 && (ht || !c && !v) && e._startAt.revert(Hl), c && w && n <= 0 && r <= 0) {
        n && (e._zTime = n);
        return;
      }
    } else if (g && w && !S) {
      if (n && (c = !1), O = qt({
        overwrite: !1,
        data: "isFromStart",
        //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
        lazy: c && !S && Dt(f),
        immediateRender: c,
        //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
        stagger: 0,
        parent: A
        //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
      }, $), fe && (O[ne.prop] = fe), Er(e._startAt = Xe.set(T, O)), e._startAt._dp = 0, e._startAt._sat = e, n < 0 && (ht ? e._startAt.revert(Hl) : e._startAt.render(-1, !0)), e._zTime = n, !c)
        t(e._startAt, Ce, Ce);
      else if (!n)
        return;
    }
    for (e._pt = e._ptCache = 0, f = w && Dt(f) || f && !w, I = 0; I < T.length; I++) {
      if (U = T[I], ee = U._gsap || Tp(T)[I]._gsap, e._ptLookup[I] = ge = {}, ih[ee.id] && kr.length && mu(), ce = b === T ? I : b.indexOf(U), ne && (ie = new ne()).init(U, fe || $, e, ce, b) !== !1 && (e._pt = L = new Ft(e._pt, U, ie.name, 0, 1, ie.render, ie, 0, ie.priority), ie._props.forEach(function(J) {
        ge[J] = L;
      }), ie.priority && (q = 1)), !ne || fe)
        for (O in $)
          Ht[O] && (ie = r1(O, $, e, ce, U, b)) ? ie.priority && (q = 1) : ge[O] = L = kp.call(e, U, O, "get", $[O], ce, b, 0, s.stringFilter);
      e._op && e._op[I] && e.kill(U, e._op[I]), E && e._pt && (Sr = e, Be.killTweensOf(U, ge, e.globalTime(n)), W = !e.parent, Sr = 0), e._pt && f && (ih[ee.id] = 1);
    }
    q && u1(e), e._onInit && e._onInit(e);
  }
  e._onUpdate = m, e._initted = (!e._op || e._pt) && !W, p && n <= 0 && M.render(an, !0, !0);
}, YR = function(e, n, r, s, a, l, c, f) {
  var m = (e._pt && e._ptCache || (e._ptCache = {}))[n], g, d, p, v;
  if (!m)
    for (m = e._ptCache[n] = [], p = e._ptLookup, v = e._targets.length; v--; ) {
      if (g = p[v][n], g && g.d && g.d._pt)
        for (g = g.d._pt; g && g.p !== n && g.fp !== n; )
          g = g._next;
      if (!g)
        return ch = 1, e.vars[n] = "+=0", bp(e, c), ch = 0, f ? Lo(n + " not eligible for reset. Try splitting into individual properties") : 1;
      m.push(g);
    }
  for (v = m.length; v--; )
    d = m[v], g = d._pt || d, g.s = (s || s === 0) && !a ? s : g.s + (s || 0) + l * g.c, g.c = r - g.s, d.e && (d.e = Ye(r) + vt(d.e)), d.b && (d.b = g.s + vt(d.b));
}, qR = function(e, n) {
  var r = e[0] ? si(e[0]).harness : 0, s = r && r.aliases, a, l, c, f;
  if (!s)
    return n;
  a = cs({}, n);
  for (l in s)
    if (l in a)
      for (f = s[l].split(","), c = f.length; c--; )
        a[f[c]] = a[l];
  return a;
}, QR = function(e, n, r, s) {
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
}, Co = function(e, n, r, s, a) {
  return Ze(e) ? e.call(n, r, s, a) : lt(e) && ~e.indexOf("random(") ? $o(e) : e;
}, i1 = wp + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", s1 = {};
jt(i1 + ",id,stagger,delay,duration,paused,scrollTrigger", function(t) {
  return s1[t] = 1;
});
var Xe = /* @__PURE__ */ (function(t) {
  bS(e, t);
  function e(r, s, a, l) {
    var c;
    typeof s == "number" && (a.duration = s, s = a, a = null), c = t.call(this, l ? s : ko(s)) || this;
    var f = c.vars, m = f.duration, g = f.delay, d = f.immediateRender, p = f.stagger, v = f.overwrite, w = f.keyframes, S = f.defaults, T = f.scrollTrigger, A = s.parent || Be, b = (_t(r) || PS(r) ? qn(r[0]) : "length" in s) ? [r] : ln(r), E, M, C, $, I, O, L, U;
    if (c._targets = b.length ? Tp(b) : Lo("GSAP target " + r + " not found. https://gsap.com", !Kt.nullTargetWarn) || [], c._ptLookup = [], c._overwrite = v, w || p || Al(m) || Al(g)) {
      s = c.vars;
      var q = s.easeReverse || s.yoyoEase;
      if (E = c.timeline = new Nt({
        data: "nested",
        defaults: S || {},
        targets: A && A.data === "nested" ? A.vars.targets : b
      }), E.kill(), E.parent = E._dp = Zn(c), E._start = 0, p || Al(m) || Al(g)) {
        if ($ = b.length, L = p && WS(p), Fn(p))
          for (I in p)
            ~i1.indexOf(I) && (U || (U = {}), U[I] = p[I]);
        for (M = 0; M < $; M++)
          C = gu(s, s1), C.stagger = 0, q && (C.easeReverse = q), U && cs(C, U), O = b[M], C.duration = +Co(m, Zn(c), M, O, b), C.delay = (+Co(g, Zn(c), M, O, b) || 0) - c._delay, !p && $ === 1 && C.delay && (c._delay = g = C.delay, c._start += g, C.delay = 0), E.to(O, C, L ? L(M, O, b) : 0), E._ease = xe.none;
        E.duration() ? m = g = 0 : c.timeline = 0;
      } else if (w) {
        ko(qt(E.vars.defaults, {
          ease: "none"
        })), E._ease = ai(w.ease || s.ease || "none");
        var ee = 0, ne, ie, ge;
        if (_t(w))
          w.forEach(function(ce) {
            return E.to(b, ce, ">");
          }), E.duration();
        else {
          C = {};
          for (I in w)
            I === "ease" || I === "easeEach" || QR(I, w[I], C, w.easeEach);
          for (I in C)
            for (ne = C[I].sort(function(ce, fe) {
              return ce.t - fe.t;
            }), ee = 0, M = 0; M < ne.length; M++)
              ie = ne[M], ge = {
                ease: ie.e,
                duration: (ie.t - (M ? ne[M - 1].t : 0)) / 100 * m
              }, ge[I] = ie.v, E.to(b, ge, ee), ee += ge.duration;
          E.duration() < m && E.to({}, {
            duration: m - E.duration()
          });
        }
      }
      m || c.duration(m = E.duration());
    } else
      c.timeline = 0;
    return v === !0 && !gp && (Sr = Zn(c), Be.killTweensOf(b), Sr = 0), Rn(A, Zn(c), a), s.reversed && c.reverse(), s.paused && c.paused(!0), (d || !m && !w && c._start === Ve(A._time) && Dt(d) && CR(Zn(c)) && A.data !== "nested") && (c._tTime = -Ce, c.render(Math.max(0, -g) || 0)), T && VS(Zn(c), T), c;
  }
  var n = e.prototype;
  return n.render = function(s, a, l) {
    var c = this._time, f = this._tDur, m = this._dur, g = s < 0, d = s > f - Ce && !g ? f : s < Ce ? 0 : s, p, v, w, S, T, A, b, E;
    if (!m)
      ER(this, s, a, l);
    else if (d !== this._tTime || !s || l || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== g || this._lazy) {
      if (p = d, E = this.timeline, this._repeat) {
        if (S = m + this._rDelay, this._repeat < -1 && g)
          return this.totalTime(S * 100 + s, a, l);
        if (p = Ve(d % S), d === f ? (w = this._repeat, p = m) : (T = Ve(d / S), w = ~~T, w && w === T ? (p = m, w--) : p > m && (p = m)), A = this._yoyo && w & 1, A && (p = m - p), T = ds(this._tTime, S), p === c && !l && this._initted && w === T)
          return this._tTime = d, this;
        w !== T && this.vars.repeatRefresh && !A && !this._lock && p !== S && this._initted && (this._lock = l = 1, this.render(Ve(S * w), !0).invalidate()._lock = 0);
      }
      if (!this._initted) {
        if (BS(this, g ? s : p, l, a, d))
          return this._tTime = 0, this;
        if (c !== this._time && !(l && this.vars.repeatRefresh && w !== T))
          return this;
        if (m !== this._dur)
          return this.render(s, a, l);
      }
      if (this._rEase) {
        var M = p < c;
        if (M !== this._inv) {
          var C = M ? c : m - c;
          this._inv = M, this._from && (this.ratio = 1 - this.ratio), this._invRatio = this.ratio, this._invTime = c, this._invRecip = C ? (M ? -1 : 1) / C : 0, this._invScale = M ? -this.ratio : 1 - this.ratio, this._invEase = M ? this._rEase : this._ease;
        }
        this.ratio = b = this._invRatio + this._invScale * this._invEase((p - this._invTime) * this._invRecip);
      } else
        this.ratio = b = this._ease(p / m);
      if (this._from && (this.ratio = b = 1 - b), this._tTime = d, this._time = p, !this._act && this._ts && (this._act = 1, this._lazy = 0), !c && d && !a && !T && (Zt(this, "onStart"), this._tTime !== d))
        return this;
      for (v = this._pt; v; )
        v.r(b, v.d), v = v._next;
      E && E.render(s < 0 ? s : E._dur * E._ease(p / this._dur), a, l) || this._startAt && (this._zTime = s), this._onUpdate && !a && (g && sh(this, s, a, l), Zt(this, "onUpdate")), this._repeat && w !== T && this.vars.onRepeat && !a && this.parent && Zt(this, "onRepeat"), (d === this._tDur || !d) && this._tTime === d && (g && !this._onUpdate && sh(this, s, !0, !0), (s || !m) && (d === this._tDur && this._ts > 0 || !d && this._ts < 0) && Er(this, 1), !a && !(g && !c) && (d || c || A) && (Zt(this, d === f ? "onComplete" : "onReverseComplete", !0), this._prom && !(d < f && this.timeScale() > 0) && this._prom()));
    }
    return this;
  }, n.targets = function() {
    return this._targets;
  }, n.invalidate = function(s) {
    return (!s || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(s), t.prototype.invalidate.call(this, s);
  }, n.resetTo = function(s, a, l, c, f) {
    Vo || Wt.wake(), this._ts || this.play();
    var m = Math.min(this._dur, (this._dp._time - this._start) * this._ts), g;
    return this._initted || bp(this, m), g = this._ease(m / this._dur), YR(this, s, a, l, c, g, m, f) ? this.resetTo(s, a, l, c, 1) : (Fu(this, 0), this.parent || zS(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
  }, n.kill = function(s, a) {
    if (a === void 0 && (a = "all"), !s && (!a || a === "all"))
      return this._lazy = this._pt = 0, this.parent ? go(this) : this.scrollTrigger && this.scrollTrigger.kill(!!ht), this;
    if (this.timeline) {
      var l = this.timeline.totalDuration();
      return this.timeline.killTweensOf(s, a, Sr && Sr.vars.overwrite !== !0)._first || go(this), this.parent && l !== this.timeline.totalDuration() && fs(this, this._dur * this.timeline._tDur / l, 0, 1), this;
    }
    var c = this._targets, f = s ? ln(s) : c, m = this._ptLookup, g = this._pt, d, p, v, w, S, T, A;
    if ((!a || a === "all") && kR(c, f))
      return a === "all" && (this._pt = 0), go(this);
    for (d = this._op = this._op || [], a !== "all" && (lt(a) && (S = {}, jt(a, function(b) {
      return S[b] = 1;
    }), a = S), a = qR(c, a)), A = c.length; A--; )
      if (~f.indexOf(c[A])) {
        p = m[A], a === "all" ? (d[A] = a, w = p, v = {}) : (v = d[A] = d[A] || {}, w = a);
        for (S in w)
          T = p && p[S], T && ((!("kill" in T.d) || T.d.kill(S) === !0) && Du(this, T, "_pt"), delete p[S]), v !== "all" && (v[S] = 1);
      }
    return this._initted && !this._pt && g && go(this), this;
  }, e.to = function(s, a) {
    return new e(s, a, arguments[2]);
  }, e.from = function(s, a) {
    return bo(1, arguments);
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
    return bo(2, arguments);
  }, e.set = function(s, a) {
    return a.duration = 0, a.repeatDelay || (a.repeat = 0), new e(s, a);
  }, e.killTweensOf = function(s, a, l) {
    return Be.killTweensOf(s, a, l);
  }, e;
})(Bo);
qt(Xe.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
});
jt("staggerTo,staggerFrom,staggerFromTo", function(t) {
  Xe[t] = function() {
    var e = new Nt(), n = ah.call(arguments, 0);
    return n.splice(t === "staggerFromTo" ? 5 : 4, 0, 0), e[t].apply(e, n);
  };
});
var Cp = function(e, n, r) {
  return e[n] = r;
}, o1 = function(e, n, r) {
  return e[n](r);
}, XR = function(e, n, r, s) {
  return e[n](s.fp, r);
}, JR = function(e, n, r) {
  return e.setAttribute(n, r);
}, Pp = function(e, n) {
  return Ze(e[n]) ? o1 : yp(e[n]) && e.setAttribute ? JR : Cp;
}, a1 = function(e, n) {
  return n.set(n.t, n.p, Math.round((n.s + n.c * e) * 1e6) / 1e6, n);
}, eN = function(e, n) {
  return n.set(n.t, n.p, !!(n.s + n.c * e), n);
}, l1 = function(e, n) {
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
}, Ep = function(e, n) {
  for (var r = n._pt; r; )
    r.r(e, r.d), r = r._next;
}, tN = function(e, n, r, s) {
  for (var a = this._pt, l; a; )
    l = a._next, a.p === s && a.modifier(e, n, r), a = l;
}, nN = function(e) {
  for (var n = this._pt, r, s; n; )
    s = n._next, n.p === e && !n.op || n.op === e ? Du(this, n, "_pt") : n.dep || (r = 1), n = s;
  return !r;
}, rN = function(e, n, r, s) {
  s.mSet(e, n, s.m.call(s.tween, r, s.mt), s);
}, u1 = function(e) {
  for (var n = e._pt, r, s, a, l; n; ) {
    for (r = n._next, s = a; s && s.pr > n.pr; )
      s = s._next;
    (n._prev = s ? s._prev : l) ? n._prev._next = n : a = n, (n._next = s) ? s._prev = n : l = n, n = r;
  }
  e._pt = a;
}, Ft = /* @__PURE__ */ (function() {
  function t(n, r, s, a, l, c, f, m, g) {
    this.t = r, this.s = a, this.c = l, this.p = s, this.r = c || a1, this.d = f || this, this.set = m || Cp, this.pr = g || 0, this._next = n, n && (n._prev = this);
  }
  var e = t.prototype;
  return e.modifier = function(r, s, a) {
    this.mSet = this.mSet || this.set, this.set = rN, this.m = r, this.mt = a, this.tween = s;
  }, t;
})();
jt(wp + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(t) {
  return Sp[t] = 1;
});
Yt.TweenMax = Yt.TweenLite = Xe;
Yt.TimelineLite = Yt.TimelineMax = Nt;
Be = new Nt({
  sortChildren: !1,
  defaults: Oo,
  autoRemoveChildren: !0,
  id: "root",
  smoothChildTiming: !0
});
Kt.stringFilter = e1;
var li = [], Zl = {}, iN = [], N0 = 0, sN = 0, df = function(e) {
  return (Zl[e] || iN).map(function(n) {
    return n();
  });
}, dh = function() {
  var e = Date.now(), n = [];
  e - N0 > 2 && (df("matchMediaInit"), li.forEach(function(r) {
    var s = r.queries, a = r.conditions, l, c, f, m;
    for (c in s)
      l = En.matchMedia(s[c]).matches, l && (f = 1), l !== a[c] && (a[c] = l, m = 1);
    m && (r.revert(), f && n.push(r));
  }), df("matchMediaRevert"), n.forEach(function(r) {
    return r.onMatch(r, function(s) {
      return r.add(null, s);
    });
  }), N0 = e, df("matchMedia"));
}, c1 = /* @__PURE__ */ (function() {
  function t(n, r) {
    this.selector = r && lh(r), this.data = [], this._r = [], this.isReverted = !1, this.id = sN++, n && this.add(n);
  }
  var e = t.prototype;
  return e.add = function(r, s, a) {
    Ze(r) && (a = s, s = r, r = Ze);
    var l = this, c = function() {
      var m = Fe, g = l.selector, d;
      return m && m !== l && m.data.push(l), a && (l.selector = lh(a)), Fe = l, d = s.apply(l, arguments), Ze(d) && l._r.push(d), Fe = m, l.selector = g, l.isReverted = !1, d;
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
      for (var l = li.length; l--; )
        li[l].id === this.id && li.splice(l, 1);
  }, e.revert = function(r) {
    this.kill(r || {});
  }, t;
})(), oN = /* @__PURE__ */ (function() {
  function t(n) {
    this.contexts = [], this.scope = n, Fe && Fe.data.push(this);
  }
  var e = t.prototype;
  return e.add = function(r, s, a) {
    Fn(r) || (r = {
      matches: r
    });
    var l = new c1(0, a || this.scope), c = l.conditions = {}, f, m, g;
    Fe && !l.selector && (l.selector = Fe.selector), this.contexts.push(l), s = l.add("onMatch", s), l.queries = r;
    for (m in r)
      m === "all" ? g = 1 : (f = En.matchMedia(r[m]), f && (li.indexOf(l) < 0 && li.push(l), (c[m] = f.matches) && (g = 1), f.addListener ? f.addListener(dh) : f.addEventListener("change", dh)));
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
})(), vu = {
  registerPlugin: function() {
    for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
      n[r] = arguments[r];
    n.forEach(function(s) {
      return QS(s);
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
    var a = si(e || {}).get, l = r ? LS : OS;
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
    var l = Ht[n], c = si(e), f = c.harness && (c.harness.aliases || {})[n] || n, m = l ? function(g) {
      var d = new l();
      Xi._pt = 0, d.init(e, r ? g + r : g, Xi, 0, [e]), d.render(1, d), Xi._pt && Ep(1, Xi);
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
    return e && e.ease && (e.ease = ai(e.ease, Oo.ease)), C0(Oo, e || {});
  },
  config: function(e) {
    return C0(Kt, e || {});
  },
  registerEffect: function(e) {
    var n = e.name, r = e.effect, s = e.plugins, a = e.defaults, l = e.extendTimeline;
    (s || "").split(",").forEach(function(c) {
      return c && !Ht[c] && !Yt[c] && Lo(n + " effect requires " + c + " plugin.");
    }), af[n] = function(c, f, m) {
      return r(ln(c), qt(f || {}, a), m);
    }, l && (Nt.prototype[n] = function(c, f, m) {
      return this.add(af[n](c, Fn(f) ? f : (m = f) && {}, this), m);
    });
  },
  registerEase: function(e, n) {
    xe[e] = ai(n);
  },
  parseEase: function(e, n) {
    return arguments.length ? ai(e, n) : xe;
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
    return e ? new c1(e, n) : Fe;
  },
  matchMedia: function(e) {
    return new oN(e);
  },
  matchMediaRefresh: function() {
    return li.forEach(function(e) {
      var n = e.conditions, r, s;
      for (s in n)
        n[s] && (n[s] = !1, r = 1);
      r && e.revert();
    }) || dh();
  },
  addEventListener: function(e, n) {
    var r = Zl[e] || (Zl[e] = []);
    ~r.indexOf(n) || r.push(n);
  },
  removeEventListener: function(e, n) {
    var r = Zl[e], s = r && r.indexOf(n);
    s >= 0 && r.splice(s, 1);
  },
  utils: {
    wrap: OR,
    wrapYoyo: LR,
    distribute: WS,
    random: GS,
    snap: ZS,
    normalize: FR,
    getUnit: vt,
    clamp: NR,
    splitColor: XS,
    toArray: ln,
    selector: lh,
    mapRange: YS,
    pipe: DR,
    unitize: jR,
    interpolate: zR,
    shuffle: HS
  },
  install: NS,
  effects: af,
  ticker: Wt,
  updateRoot: Nt.updateRoot,
  plugins: Ht,
  globalTimeline: Be,
  core: {
    PropTween: Ft,
    globals: IS,
    Tween: Xe,
    Timeline: Nt,
    Animation: Bo,
    getCache: si,
    _removeLinkedListItem: Du,
    reverting: function() {
      return ht;
    },
    context: function(e) {
      return e && Fe && (Fe.data.push(e), e._ctx = Fe), Fe;
    },
    suppressOverwrites: function(e) {
      return gp = e;
    }
  }
};
jt("to,from,fromTo,delayedCall,set,killTweensOf", function(t) {
  return vu[t] = Xe[t];
});
Wt.add(Nt.updateRoot);
Xi = vu.to({}, {
  duration: 0
});
var aN = function(e, n) {
  for (var r = e._pt; r && r.p !== n && r.op !== n && r.fp !== n; )
    r = r._next;
  return r;
}, lN = function(e, n) {
  var r = e._targets, s, a, l;
  for (s in n)
    for (a = r.length; a--; )
      l = e._ptLookup[a][s], l && (l = l.d) && (l._pt && (l = aN(l, s)), l && l.modifier && l.modifier(n[s], e, r[a], s));
}, ff = function(e, n) {
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
        lN(c, a);
      };
    }
  };
}, Lt = vu.registerPlugin({
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
}, ff("roundProps", uh), ff("modifiers"), ff("snap", ZS)) || vu;
Xe.version = Nt.version = Lt.version = "3.15.0";
RS = 1;
vp() && hs();
xe.Power0;
xe.Power1;
xe.Power2;
xe.Power3;
xe.Power4;
xe.Linear;
xe.Quad;
xe.Cubic;
xe.Quart;
xe.Quint;
xe.Strong;
xe.Elastic;
xe.Back;
xe.SteppedEase;
xe.Bounce;
xe.Sine;
xe.Expo;
xe.Circ;
/*!
 * CSSPlugin 3.15.0
 * https://gsap.com
 *
 * Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/
var I0, wr, ns, Mp, ni, D0, Rp, uN = function() {
  return typeof window < "u";
}, Qn = {}, Xr = 180 / Math.PI, rs = Math.PI / 180, zi = Math.atan2, j0 = 1e8, Np = /([A-Z])/g, cN = /(left|right|width|margin|padding|x)/i, dN = /[\s,\(]\S/, In = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
}, fh = function(e, n) {
  return n.set(n.t, n.p, Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u, n);
}, fN = function(e, n) {
  return n.set(n.t, n.p, e === 1 ? n.e : Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u, n);
}, hN = function(e, n) {
  return n.set(n.t, n.p, e ? Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u : n.b, n);
}, pN = function(e, n) {
  return n.set(n.t, n.p, e === 1 ? n.e : e ? Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u : n.b, n);
}, mN = function(e, n) {
  var r = n.s + n.c * e;
  n.set(n.t, n.p, ~~(r + (r < 0 ? -0.5 : 0.5)) + n.u, n);
}, d1 = function(e, n) {
  return n.set(n.t, n.p, e ? n.e : n.b, n);
}, f1 = function(e, n) {
  return n.set(n.t, n.p, e !== 1 ? n.b : n.e, n);
}, gN = function(e, n, r) {
  return e.style[n] = r;
}, yN = function(e, n, r) {
  return e.style.setProperty(n, r);
}, vN = function(e, n, r) {
  return e._gsap[n] = r;
}, _N = function(e, n, r) {
  return e._gsap.scaleX = e._gsap.scaleY = r;
}, xN = function(e, n, r, s, a) {
  var l = e._gsap;
  l.scaleX = l.scaleY = r, l.renderTransform(a, l);
}, SN = function(e, n, r, s, a) {
  var l = e._gsap;
  l[n] = r, l.renderTransform(a, l);
}, Ue = "transform", Ot = Ue + "Origin", wN = function t(e, n) {
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
}, h1 = function(e) {
  e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, TN = function() {
  var e = this.props, n = this.target, r = n.style, s = n._gsap, a, l;
  for (a = 0; a < e.length; a += 3)
    e[a + 1] ? e[a + 1] === 2 ? n[e[a]](e[a + 2]) : n[e[a]] = e[a + 2] : e[a + 2] ? r[e[a]] = e[a + 2] : r.removeProperty(e[a].substr(0, 2) === "--" ? e[a] : e[a].replace(Np, "-$1").toLowerCase());
  if (this.tfm) {
    for (l in this.tfm)
      s[l] = this.tfm[l];
    s.svg && (s.renderTransform(), n.setAttribute("data-svg-origin", this.svgo || "")), a = Rp(), (!a || !a.isStart) && !r[Ue] && (h1(r), s.zOrigin && r[Ot] && (r[Ot] += " " + s.zOrigin + "px", s.zOrigin = 0, s.renderTransform()), s.uncache = 1);
  }
}, p1 = function(e, n) {
  var r = {
    target: e,
    props: [],
    revert: TN,
    save: wN
  };
  return e._gsap || Lt.core.getCache(e), n && e.style && e.nodeType && n.split(",").forEach(function(s) {
    return r.save(s);
  }), r;
}, m1, hh = function(e, n) {
  var r = wr.createElementNS ? wr.createElementNS((n || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : wr.createElement(e);
  return r && r.style ? r : wr.createElement(e);
}, Gt = function t(e, n, r) {
  var s = getComputedStyle(e);
  return s[n] || s.getPropertyValue(n.replace(Np, "-$1").toLowerCase()) || s.getPropertyValue(n) || !r && t(e, ps(n) || n, 1) || "";
}, F0 = "O,Moz,ms,Ms,Webkit".split(","), ps = function(e, n, r) {
  var s = n || ni, a = s.style, l = 5;
  if (e in a && !r)
    return e;
  for (e = e.charAt(0).toUpperCase() + e.substr(1); l-- && !(F0[l] + e in a); )
    ;
  return l < 0 ? null : (l === 3 ? "ms" : l >= 0 ? F0[l] : "") + e;
}, ph = function() {
  uN() && window.document && (I0 = window, wr = I0.document, ns = wr.documentElement, ni = hh("div") || {
    style: {}
  }, hh("div"), Ue = ps(Ue), Ot = Ue + "Origin", ni.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", m1 = !!ps("perspective"), Rp = Lt.core.reverting, Mp = 1);
}, O0 = function(e) {
  var n = e.ownerSVGElement, r = hh("svg", n && n.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), s = e.cloneNode(!0), a;
  s.style.display = "block", r.appendChild(s), ns.appendChild(r);
  try {
    a = s.getBBox();
  } catch {
  }
  return r.removeChild(s), ns.removeChild(r), a;
}, L0 = function(e, n) {
  for (var r = n.length; r--; )
    if (e.hasAttribute(n[r]))
      return e.getAttribute(n[r]);
}, g1 = function(e) {
  var n, r;
  try {
    n = e.getBBox();
  } catch {
    n = O0(e), r = 1;
  }
  return n && (n.width || n.height) || r || (n = O0(e)), n && !n.width && !n.x && !n.y ? {
    x: +L0(e, ["x", "cx", "x1"]) || 0,
    y: +L0(e, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : n;
}, y1 = function(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && g1(e));
}, Mr = function(e, n) {
  if (n) {
    var r = e.style, s;
    n in Qn && n !== Ot && (n = Ue), r.removeProperty ? (s = n.substr(0, 2), (s === "ms" || n.substr(0, 6) === "webkit") && (n = "-" + n), r.removeProperty(s === "--" ? n : n.replace(Np, "-$1").toLowerCase())) : r.removeAttribute(n);
  }
}, Tr = function(e, n, r, s, a, l) {
  var c = new Ft(e._pt, n, r, 0, 1, l ? f1 : d1);
  return e._pt = c, c.b = s, c.e = a, e._props.push(r), c;
}, z0 = {
  deg: 1,
  rad: 1,
  turn: 1
}, AN = {
  grid: 1,
  flex: 1
}, Rr = function t(e, n, r, s) {
  var a = parseFloat(r) || 0, l = (r + "").trim().substr((a + "").length) || "px", c = ni.style, f = cN.test(n), m = e.tagName.toLowerCase() === "svg", g = (m ? "client" : "offset") + (f ? "Width" : "Height"), d = 100, p = s === "px", v = s === "%", w, S, T, A;
  if (s === l || !a || z0[s] || z0[l])
    return a;
  if (l !== "px" && !p && (a = t(e, n, r, "px")), A = e.getCTM && y1(e), (v || l === "%") && (Qn[n] || ~n.indexOf("adius")))
    return w = A ? e.getBBox()[f ? "width" : "height"] : e[g], Ye(v ? a / w * d : a / 100 * w);
  if (c[f ? "width" : "height"] = d + (p ? l : s), S = s !== "rem" && ~n.indexOf("adius") || s === "em" && e.appendChild && !m ? e : e.parentNode, A && (S = (e.ownerSVGElement || {}).parentNode), (!S || S === wr || !S.appendChild) && (S = wr.body), T = S._gsap, T && v && T.width && f && T.time === Wt.time && !T.uncache)
    return Ye(a / T.width * d);
  if (v && (n === "height" || n === "width")) {
    var b = e.style[n];
    e.style[n] = d + s, w = e[g], b ? e.style[n] = b : Mr(e, n);
  } else
    (v || l === "%") && !AN[Gt(S, "display")] && (c.position = Gt(e, "position")), S === e && (c.position = "static"), S.appendChild(ni), w = ni[g], S.removeChild(ni), c.position = "absolute";
  return f && v && (T = si(S), T.time = Wt.time, T.width = S[g]), Ye(p ? w * a / d : w && a ? d / w * a : 0);
}, Gn = function(e, n, r, s) {
  var a;
  return Mp || ph(), n in In && n !== "transform" && (n = In[n], ~n.indexOf(",") && (n = n.split(",")[0])), Qn[n] && n !== "transform" ? (a = Ho(e, s), a = n !== "transformOrigin" ? a[n] : a.svg ? a.origin : xu(Gt(e, Ot)) + " " + a.zOrigin + "px") : (a = e.style[n], (!a || a === "auto" || s || ~(a + "").indexOf("calc(")) && (a = _u[n] && _u[n](e, n, r) || Gt(e, n) || jS(e, n) || (n === "opacity" ? 1 : 0))), r && !~(a + "").trim().indexOf(" ") ? Rr(e, n, a, r) + r : a;
}, kN = function(e, n, r, s) {
  if (!r || r === "none") {
    var a = ps(n, e, 1), l = a && Gt(e, a, 1);
    l && l !== r ? (n = a, r = l) : n === "borderColor" && (r = Gt(e, "borderTopColor"));
  }
  var c = new Ft(this._pt, e.style, n, 0, 1, l1), f = 0, m = 0, g, d, p, v, w, S, T, A, b, E, M, C;
  if (c.b = r, c.e = s, r += "", s += "", s.substring(0, 6) === "var(--" && (s = Gt(e, s.substring(4, s.indexOf(")")))), s === "auto" && (S = e.style[n], e.style[n] = s, s = Gt(e, n) || s, S ? e.style[n] = S : Mr(e, n)), g = [r, s], e1(g), r = g[0], s = g[1], p = r.match(Qi) || [], C = s.match(Qi) || [], C.length) {
    for (; d = Qi.exec(s); )
      T = d[0], b = s.substring(f, d.index), w ? w = (w + 1) % 5 : (b.substr(-5) === "rgba(" || b.substr(-5) === "hsla(") && (w = 1), T !== (S = p[m++] || "") && (v = parseFloat(S) || 0, M = S.substr((v + "").length), T.charAt(1) === "=" && (T = ts(v, T) + M), A = parseFloat(T), E = T.substr((A + "").length), f = Qi.lastIndex - E.length, E || (E = E || Kt.units[n] || M, f === s.length && (s += E, c.e += E)), M !== E && (v = Rr(e, n, S, E) || 0), c._pt = {
        _next: c._pt,
        p: b || m === 1 ? b : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: v,
        c: A - v,
        m: w && w < 4 || n === "zIndex" ? Math.round : 0
      });
    c.c = f < s.length ? s.substring(f, s.length) : "";
  } else
    c.r = n === "display" && s === "none" ? f1 : d1;
  return MS.test(s) && (c.e = 0), this._pt = c, c;
}, $0 = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, bN = function(e) {
  var n = e.split(" "), r = n[0], s = n[1] || "50%";
  return (r === "top" || r === "bottom" || s === "left" || s === "right") && (e = r, r = s, s = e), n[0] = $0[r] || r, n[1] = $0[s] || s, n.join(" ");
}, CN = function(e, n) {
  if (n.tween && n.tween._time === n.tween._dur) {
    var r = n.t, s = r.style, a = n.u, l = r._gsap, c, f, m;
    if (a === "all" || a === !0)
      s.cssText = "", f = 1;
    else
      for (a = a.split(","), m = a.length; --m > -1; )
        c = a[m], Qn[c] && (f = 1, c = c === "transformOrigin" ? Ot : Ue), Mr(r, c);
    f && (Mr(r, Ue), l && (l.svg && r.removeAttribute("transform"), s.scale = s.rotate = s.translate = "none", Ho(r, 1), l.uncache = 1, h1(s)));
  }
}, _u = {
  clearProps: function(e, n, r, s, a) {
    if (a.data !== "isFromStart") {
      var l = e._pt = new Ft(e._pt, n, r, 0, 0, CN);
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
}, Uo = [1, 0, 0, 1, 0, 0], v1 = {}, _1 = function(e) {
  return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, V0 = function(e) {
  var n = Gt(e, Ue);
  return _1(n) ? Uo : n.substr(7).match(ES).map(Ye);
}, Ip = function(e, n) {
  var r = e._gsap || si(e), s = e.style, a = V0(e), l, c, f, m;
  return r.svg && e.getAttribute("transform") ? (f = e.transform.baseVal.consolidate().matrix, a = [f.a, f.b, f.c, f.d, f.e, f.f], a.join(",") === "1,0,0,1,0,0" ? Uo : a) : (a === Uo && !e.offsetParent && e !== ns && !r.svg && (f = s.display, s.display = "block", l = e.parentNode, (!l || !e.offsetParent && !e.getBoundingClientRect().width) && (m = 1, c = e.nextElementSibling, ns.appendChild(e)), a = V0(e), f ? s.display = f : Mr(e, "display"), m && (c ? l.insertBefore(e, c) : l ? l.appendChild(e) : ns.removeChild(e))), n && a.length > 6 ? [a[0], a[1], a[4], a[5], a[12], a[13]] : a);
}, mh = function(e, n, r, s, a, l) {
  var c = e._gsap, f = a || Ip(e, !0), m = c.xOrigin || 0, g = c.yOrigin || 0, d = c.xOffset || 0, p = c.yOffset || 0, v = f[0], w = f[1], S = f[2], T = f[3], A = f[4], b = f[5], E = n.split(" "), M = parseFloat(E[0]) || 0, C = parseFloat(E[1]) || 0, $, I, O, L;
  r ? f !== Uo && (I = v * T - w * S) && (O = M * (T / I) + C * (-S / I) + (S * b - T * A) / I, L = M * (-w / I) + C * (v / I) - (v * b - w * A) / I, M = O, C = L) : ($ = g1(e), M = $.x + (~E[0].indexOf("%") ? M / 100 * $.width : M), C = $.y + (~(E[1] || E[0]).indexOf("%") ? C / 100 * $.height : C)), s || s !== !1 && c.smooth ? (A = M - m, b = C - g, c.xOffset = d + (A * v + b * S) - A, c.yOffset = p + (A * w + b * T) - b) : c.xOffset = c.yOffset = 0, c.xOrigin = M, c.yOrigin = C, c.smooth = !!s, c.origin = n, c.originIsAbsolute = !!r, e.style[Ot] = "0px 0px", l && (Tr(l, c, "xOrigin", m, M), Tr(l, c, "yOrigin", g, C), Tr(l, c, "xOffset", d, c.xOffset), Tr(l, c, "yOffset", p, c.yOffset)), e.setAttribute("data-svg-origin", M + " " + C);
}, Ho = function(e, n) {
  var r = e._gsap || new n1(e);
  if ("x" in r && !n && !r.uncache)
    return r;
  var s = e.style, a = r.scaleX < 0, l = "px", c = "deg", f = getComputedStyle(e), m = Gt(e, Ot) || "0", g, d, p, v, w, S, T, A, b, E, M, C, $, I, O, L, U, q, ee, ne, ie, ge, ce, fe, W, J, Q, F, D, X, ae, me;
  return g = d = p = S = T = A = b = E = M = 0, v = w = 1, r.svg = !!(e.getCTM && y1(e)), f.translate && ((f.translate !== "none" || f.scale !== "none" || f.rotate !== "none") && (s[Ue] = (f.translate !== "none" ? "translate3d(" + (f.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (f.rotate !== "none" ? "rotate(" + f.rotate + ") " : "") + (f.scale !== "none" ? "scale(" + f.scale.split(" ").join(",") + ") " : "") + (f[Ue] !== "none" ? f[Ue] : "")), s.scale = s.rotate = s.translate = "none"), I = Ip(e, r.svg), r.svg && (r.uncache ? (W = e.getBBox(), m = r.xOrigin - W.x + "px " + (r.yOrigin - W.y) + "px", fe = "") : fe = !n && e.getAttribute("data-svg-origin"), mh(e, fe || m, !!fe || r.originIsAbsolute, r.smooth !== !1, I)), C = r.xOrigin || 0, $ = r.yOrigin || 0, I !== Uo && (q = I[0], ee = I[1], ne = I[2], ie = I[3], g = ge = I[4], d = ce = I[5], I.length === 6 ? (v = Math.sqrt(q * q + ee * ee), w = Math.sqrt(ie * ie + ne * ne), S = q || ee ? zi(ee, q) * Xr : 0, b = ne || ie ? zi(ne, ie) * Xr + S : 0, b && (w *= Math.abs(Math.cos(b * rs))), r.svg && (g -= C - (C * q + $ * ne), d -= $ - (C * ee + $ * ie))) : (me = I[6], X = I[7], Q = I[8], F = I[9], D = I[10], ae = I[11], g = I[12], d = I[13], p = I[14], O = zi(me, D), T = O * Xr, O && (L = Math.cos(-O), U = Math.sin(-O), fe = ge * L + Q * U, W = ce * L + F * U, J = me * L + D * U, Q = ge * -U + Q * L, F = ce * -U + F * L, D = me * -U + D * L, ae = X * -U + ae * L, ge = fe, ce = W, me = J), O = zi(-ne, D), A = O * Xr, O && (L = Math.cos(-O), U = Math.sin(-O), fe = q * L - Q * U, W = ee * L - F * U, J = ne * L - D * U, ae = ie * U + ae * L, q = fe, ee = W, ne = J), O = zi(ee, q), S = O * Xr, O && (L = Math.cos(O), U = Math.sin(O), fe = q * L + ee * U, W = ge * L + ce * U, ee = ee * L - q * U, ce = ce * L - ge * U, q = fe, ge = W), T && Math.abs(T) + Math.abs(S) > 359.9 && (T = S = 0, A = 180 - A), v = Ye(Math.sqrt(q * q + ee * ee + ne * ne)), w = Ye(Math.sqrt(ce * ce + me * me)), O = zi(ge, ce), b = Math.abs(O) > 2e-4 ? O * Xr : 0, M = ae ? 1 / (ae < 0 ? -ae : ae) : 0), r.svg && (fe = e.getAttribute("transform"), r.forceCSS = e.setAttribute("transform", "") || !_1(Gt(e, Ue)), fe && e.setAttribute("transform", fe))), Math.abs(b) > 90 && Math.abs(b) < 270 && (a ? (v *= -1, b += S <= 0 ? 180 : -180, S += S <= 0 ? 180 : -180) : (w *= -1, b += b <= 0 ? 180 : -180)), n = n || r.uncache, r.x = g - ((r.xPercent = g && (!n && r.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-g) ? -50 : 0))) ? e.offsetWidth * r.xPercent / 100 : 0) + l, r.y = d - ((r.yPercent = d && (!n && r.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-d) ? -50 : 0))) ? e.offsetHeight * r.yPercent / 100 : 0) + l, r.z = p + l, r.scaleX = Ye(v), r.scaleY = Ye(w), r.rotation = Ye(S) + c, r.rotationX = Ye(T) + c, r.rotationY = Ye(A) + c, r.skewX = b + c, r.skewY = E + c, r.transformPerspective = M + l, (r.zOrigin = parseFloat(m.split(" ")[2]) || !n && r.zOrigin || 0) && (s[Ot] = xu(m)), r.xOffset = r.yOffset = 0, r.force3D = Kt.force3D, r.renderTransform = r.svg ? EN : m1 ? x1 : PN, r.uncache = 0, r;
}, xu = function(e) {
  return (e = e.split(" "))[0] + " " + e[1];
}, hf = function(e, n, r) {
  var s = vt(n);
  return Ye(parseFloat(n) + parseFloat(Rr(e, "x", r + "px", s))) + s;
}, PN = function(e, n) {
  n.z = "0px", n.rotationY = n.rotationX = "0deg", n.force3D = 0, x1(e, n);
}, Kr = "0deg", po = "0px", Yr = ") ", x1 = function(e, n) {
  var r = n || this, s = r.xPercent, a = r.yPercent, l = r.x, c = r.y, f = r.z, m = r.rotation, g = r.rotationY, d = r.rotationX, p = r.skewX, v = r.skewY, w = r.scaleX, S = r.scaleY, T = r.transformPerspective, A = r.force3D, b = r.target, E = r.zOrigin, M = "", C = A === "auto" && e && e !== 1 || A === !0;
  if (E && (d !== Kr || g !== Kr)) {
    var $ = parseFloat(g) * rs, I = Math.sin($), O = Math.cos($), L;
    $ = parseFloat(d) * rs, L = Math.cos($), l = hf(b, l, I * L * -E), c = hf(b, c, -Math.sin($) * -E), f = hf(b, f, O * L * -E + E);
  }
  T !== po && (M += "perspective(" + T + Yr), (s || a) && (M += "translate(" + s + "%, " + a + "%) "), (C || l !== po || c !== po || f !== po) && (M += f !== po || C ? "translate3d(" + l + ", " + c + ", " + f + ") " : "translate(" + l + ", " + c + Yr), m !== Kr && (M += "rotate(" + m + Yr), g !== Kr && (M += "rotateY(" + g + Yr), d !== Kr && (M += "rotateX(" + d + Yr), (p !== Kr || v !== Kr) && (M += "skew(" + p + ", " + v + Yr), (w !== 1 || S !== 1) && (M += "scale(" + w + ", " + S + Yr), b.style[Ue] = M || "translate(0, 0)";
}, EN = function(e, n) {
  var r = n || this, s = r.xPercent, a = r.yPercent, l = r.x, c = r.y, f = r.rotation, m = r.skewX, g = r.skewY, d = r.scaleX, p = r.scaleY, v = r.target, w = r.xOrigin, S = r.yOrigin, T = r.xOffset, A = r.yOffset, b = r.forceCSS, E = parseFloat(l), M = parseFloat(c), C, $, I, O, L;
  f = parseFloat(f), m = parseFloat(m), g = parseFloat(g), g && (g = parseFloat(g), m += g, f += g), f || m ? (f *= rs, m *= rs, C = Math.cos(f) * d, $ = Math.sin(f) * d, I = Math.sin(f - m) * -p, O = Math.cos(f - m) * p, m && (g *= rs, L = Math.tan(m - g), L = Math.sqrt(1 + L * L), I *= L, O *= L, g && (L = Math.tan(g), L = Math.sqrt(1 + L * L), C *= L, $ *= L)), C = Ye(C), $ = Ye($), I = Ye(I), O = Ye(O)) : (C = d, O = p, $ = I = 0), (E && !~(l + "").indexOf("px") || M && !~(c + "").indexOf("px")) && (E = Rr(v, "x", l, "px"), M = Rr(v, "y", c, "px")), (w || S || T || A) && (E = Ye(E + w - (w * C + S * I) + T), M = Ye(M + S - (w * $ + S * O) + A)), (s || a) && (L = v.getBBox(), E = Ye(E + s / 100 * L.width), M = Ye(M + a / 100 * L.height)), L = "matrix(" + C + "," + $ + "," + I + "," + O + "," + E + "," + M + ")", v.setAttribute("transform", L), b && (v.style[Ue] = L);
}, MN = function(e, n, r, s, a) {
  var l = 360, c = lt(a), f = parseFloat(a) * (c && ~a.indexOf("rad") ? Xr : 1), m = f - s, g = s + m + "deg", d, p;
  return c && (d = a.split("_")[1], d === "short" && (m %= l, m !== m % (l / 2) && (m += m < 0 ? l : -l)), d === "cw" && m < 0 ? m = (m + l * j0) % l - ~~(m / l) * l : d === "ccw" && m > 0 && (m = (m - l * j0) % l - ~~(m / l) * l)), e._pt = p = new Ft(e._pt, n, r, s, m, fN), p.e = g, p.u = "deg", e._props.push(r), p;
}, B0 = function(e, n) {
  for (var r in n)
    e[r] = n[r];
  return e;
}, RN = function(e, n, r) {
  var s = B0({}, r._gsap), a = "perspective,force3D,transformOrigin,svgOrigin", l = r.style, c, f, m, g, d, p, v, w;
  s.svg ? (m = r.getAttribute("transform"), r.setAttribute("transform", ""), l[Ue] = n, c = Ho(r, 1), Mr(r, Ue), r.setAttribute("transform", m)) : (m = getComputedStyle(r)[Ue], l[Ue] = n, c = Ho(r, 1), l[Ue] = m);
  for (f in Qn)
    m = s[f], g = c[f], m !== g && a.indexOf(f) < 0 && (v = vt(m), w = vt(g), d = v !== w ? Rr(r, f, m, w) : parseFloat(m), p = parseFloat(g), e._pt = new Ft(e._pt, c, f, d, p - d, fh), e._pt.u = w || 0, e._props.push(f));
  B0(c, s);
};
jt("padding,margin,Width,Radius", function(t, e) {
  var n = "Top", r = "Right", s = "Bottom", a = "Left", l = (e < 3 ? [n, r, s, a] : [n + a, n + r, s + r, s + a]).map(function(c) {
    return e < 2 ? t + c : "border" + c + t;
  });
  _u[e > 1 ? "border" + t : t] = function(c, f, m, g, d) {
    var p, v;
    if (arguments.length < 4)
      return p = l.map(function(w) {
        return Gn(c, w, m);
      }), v = p.join(" "), v.split(p[0]).length === 5 ? p[0] : v;
    p = (g + "").split(" "), v = {}, l.forEach(function(w, S) {
      return v[w] = p[S] = p[S] || p[(S - 1) / 2 | 0];
    }), c.init(f, v, d);
  };
});
var S1 = {
  name: "css",
  register: ph,
  targetTest: function(e) {
    return e.style && e.nodeType;
  },
  init: function(e, n, r, s, a) {
    var l = this._props, c = e.style, f = r.vars.startAt, m, g, d, p, v, w, S, T, A, b, E, M, C, $, I, O, L;
    Mp || ph(), this.styles = this.styles || p1(e), O = this.styles.props, this.tween = r;
    for (S in n)
      if (S !== "autoRound" && (g = n[S], !(Ht[S] && r1(S, n, r, s, e, a)))) {
        if (v = typeof g, w = _u[S], v === "function" && (g = g.call(r, s, e, a), v = typeof g), v === "string" && ~g.indexOf("random(") && (g = $o(g)), w)
          w(this, e, S, g, r) && (I = 1);
        else if (S.substr(0, 2) === "--")
          m = (getComputedStyle(e).getPropertyValue(S) + "").trim(), g += "", br.lastIndex = 0, br.test(m) || (T = vt(m), A = vt(g), A ? T !== A && (m = Rr(e, S, m, A) + A) : T && (g += T)), this.add(c, "setProperty", m, g, s, a, 0, 0, S), l.push(S), O.push(S, 0, c[S]);
        else if (v !== "undefined") {
          if (f && S in f ? (m = typeof f[S] == "function" ? f[S].call(r, s, e, a) : f[S], lt(m) && ~m.indexOf("random(") && (m = $o(m)), vt(m + "") || m === "auto" || (m += Kt.units[S] || vt(Gn(e, S)) || ""), (m + "").charAt(1) === "=" && (m = Gn(e, S))) : m = Gn(e, S), p = parseFloat(m), b = v === "string" && g.charAt(1) === "=" && g.substr(0, 2), b && (g = g.substr(2)), d = parseFloat(g), S in In && (S === "autoAlpha" && (p === 1 && Gn(e, "visibility") === "hidden" && d && (p = 0), O.push("visibility", 0, c.visibility), Tr(this, c, "visibility", p ? "inherit" : "hidden", d ? "inherit" : "hidden", !d)), S !== "scale" && S !== "transform" && (S = In[S], ~S.indexOf(",") && (S = S.split(",")[0]))), E = S in Qn, E) {
            if (this.styles.save(S), L = g, v === "string" && g.substring(0, 6) === "var(--") {
              if (g = Gt(e, g.substring(4, g.indexOf(")"))), g.substring(0, 5) === "calc(") {
                var U = e.style.perspective;
                e.style.perspective = g, g = Gt(e, "perspective"), U ? e.style.perspective = U : Mr(e, "perspective");
              }
              d = parseFloat(g);
            }
            if (M || (C = e._gsap, C.renderTransform && !n.parseTransform || Ho(e, n.parseTransform), $ = n.smoothOrigin !== !1 && C.smooth, M = this._pt = new Ft(this._pt, c, Ue, 0, 1, C.renderTransform, C, 0, -1), M.dep = 1), S === "scale")
              this._pt = new Ft(this._pt, C, "scaleY", C.scaleY, (b ? ts(C.scaleY, b + d) : d) - C.scaleY || 0, fh), this._pt.u = 0, l.push("scaleY", S), S += "X";
            else if (S === "transformOrigin") {
              O.push(Ot, 0, c[Ot]), g = bN(g), C.svg ? mh(e, g, 0, $, 0, this) : (A = parseFloat(g.split(" ")[2]) || 0, A !== C.zOrigin && Tr(this, C, "zOrigin", C.zOrigin, A), Tr(this, c, S, xu(m), xu(g)));
              continue;
            } else if (S === "svgOrigin") {
              mh(e, g, 1, $, 0, this);
              continue;
            } else if (S in v1) {
              MN(this, C, S, p, b ? ts(p, b + g) : g);
              continue;
            } else if (S === "smoothOrigin") {
              Tr(this, C, "smooth", C.smooth, g);
              continue;
            } else if (S === "force3D") {
              C[S] = g;
              continue;
            } else if (S === "transform") {
              RN(this, g, e);
              continue;
            }
          } else S in c || (S = ps(S) || S);
          if (E || (d || d === 0) && (p || p === 0) && !dN.test(g) && S in c)
            T = (m + "").substr((p + "").length), d || (d = 0), A = vt(g) || (S in Kt.units ? Kt.units[S] : T), T !== A && (p = Rr(e, S, m, A)), this._pt = new Ft(this._pt, E ? C : c, S, p, (b ? ts(p, b + d) : d) - p, !E && (A === "px" || S === "zIndex") && n.autoRound !== !1 ? mN : fh), this._pt.u = A || 0, E && L !== g ? (this._pt.b = m, this._pt.e = L, this._pt.r = pN) : T !== A && A !== "%" && (this._pt.b = m, this._pt.r = hN);
          else if (S in c)
            kN.call(this, e, S, m, b ? b + g : g);
          else if (S in e)
            this.add(e, S, m || e[S], b ? b + g : g, s, a);
          else if (S !== "parseTransform") {
            xp(S, g);
            continue;
          }
          E || (S in c ? O.push(S, 0, c[S]) : typeof e[S] == "function" ? O.push(S, 2, e[S]()) : O.push(S, 1, m || e[S])), l.push(S);
        }
      }
    I && u1(this);
  },
  render: function(e, n) {
    if (n.tween._time || !Rp())
      for (var r = n._pt; r; )
        r.r(e, r.d), r = r._next;
    else
      n.styles.revert();
  },
  get: Gn,
  aliases: In,
  getSetter: function(e, n, r) {
    var s = In[n];
    return s && s.indexOf(",") < 0 && (n = s), n in Qn && n !== Ot && (e._gsap.x || Gn(e, "x")) ? r && D0 === r ? n === "scale" ? _N : vN : (D0 = r || {}) && (n === "scale" ? xN : SN) : e.style && !yp(e.style[n]) ? gN : ~n.indexOf("-") ? yN : Pp(e, n);
  },
  core: {
    _removeProperty: Mr,
    _getMatrix: Ip
  }
};
Lt.utils.checkPrefix = ps;
Lt.core.getStyleSaver = p1;
(function(t, e, n, r) {
  var s = jt(t + "," + e + "," + n, function(a) {
    Qn[a] = 1;
  });
  jt(e, function(a) {
    Kt.units[a] = "deg", v1[a] = 1;
  }), In[s[13]] = t + "," + e, jt(r, function(a) {
    var l = a.split(":");
    In[l[1]] = s[l[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
jt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(t) {
  Kt.units[t] = "px";
});
Lt.registerPlugin(S1);
var w1 = Lt.registerPlugin(S1) || Lt;
w1.core.Tween;
function NN({ scene: t }) {
  return P.useEffect(() => {
    const e = w1.to(".focus-background", {
      scale: 1.055,
      xPercent: 0.6,
      yPercent: 0.4,
      duration: 18,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: !0
    });
    return () => e.kill();
  }, [t == null ? void 0 : t.id]), /* @__PURE__ */ _.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ _.jsx(Xo, { mode: "wait", children: /* @__PURE__ */ _.jsx(
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
    /* @__PURE__ */ _.jsx("div", { className: "focus-overlay" })
  ] });
}
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const IN = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), DN = (t) => t.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (e, n, r) => r ? r.toUpperCase() : n.toLowerCase()
), U0 = (t) => {
  const e = DN(t);
  return e.charAt(0).toUpperCase() + e.slice(1);
}, T1 = (...t) => t.filter((e, n, r) => !!e && e.trim() !== "" && r.indexOf(e) === n).join(" ").trim(), jN = (t) => {
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
var FN = {
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
const ON = P.forwardRef(
  ({
    color: t = "currentColor",
    size: e = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: a,
    iconNode: l,
    ...c
  }, f) => P.createElement(
    "svg",
    {
      ref: f,
      ...FN,
      width: e,
      height: e,
      stroke: t,
      strokeWidth: r ? Number(n) * 24 / Number(e) : n,
      className: T1("lucide", s),
      ...!a && !jN(c) && { "aria-hidden": "true" },
      ...c
    },
    [
      ...l.map(([m, g]) => P.createElement(m, g)),
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
  const n = P.forwardRef(
    ({ className: r, ...s }, a) => P.createElement(ON, {
      ref: a,
      iconNode: e,
      className: T1(
        `lucide-${IN(U0(t))}`,
        `lucide-${t}`,
        r
      ),
      ...s
    })
  );
  return n.displayName = U0(t), n;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const LN = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
], A1 = Oe("arrow-right", LN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zN = [
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
], Dp = Oe("book-open-text", zN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $N = [
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
], Su = Oe("brain", $N);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const VN = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
], BN = Oe("clock", VN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UN = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
], HN = Oe("external-link", UN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const WN = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
], wu = Oe("file-text", WN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ZN = [
  ["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }],
  ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }]
], GN = Oe("git-branch", ZN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const KN = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
], jp = Oe("history", KN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const YN = [
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
], k1 = Oe("layers", YN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qN = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }],
  ["path", { d: "M14 4h7", key: "3xa0d5" }],
  ["path", { d: "M14 9h7", key: "1icrd9" }],
  ["path", { d: "M14 15h7", key: "1mj8o2" }],
  ["path", { d: "M14 20h7", key: "11slyb" }]
], QN = Oe("layout-list", qN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const XN = [
  ["rect", { x: "3", y: "5", width: "6", height: "6", rx: "1", key: "1defrl" }],
  ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
  ["path", { d: "M13 6h8", key: "15sg57" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 18h8", key: "oe0vm4" }]
], JN = Oe("list-todo", XN);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const eI = [
  ["circle", { cx: "8", cy: "18", r: "4", key: "1fc0mg" }],
  ["path", { d: "M12 18V2l7 4", key: "g04rme" }]
], tI = Oe("music-2", eI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nI = [
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
], b1 = Oe("notebook-pen", nI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rI = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], gh = Oe("pause", rI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const iI = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], C1 = Oe("play", iI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sI = [
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
], Gl = Oe("quote", sI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const oI = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], P1 = Oe("rotate-ccw", oI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const aI = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], E1 = Oe("skip-forward", aI);
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
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
], Fp = Oe("sparkles", lI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uI = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
], M1 = Oe("square", uI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cI = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
], dI = Oe("target", cI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fI = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], hI = Oe("volume-2", fI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pI = [
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
], mI = Oe("waves", pI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gI = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], R1 = Oe("x", gI), H0 = (t) => {
  let e;
  const n = /* @__PURE__ */ new Set(), r = (m, g) => {
    const d = typeof m == "function" ? m(e) : m;
    if (!Object.is(d, e)) {
      const p = e;
      e = g ?? (typeof d != "object" || d === null) ? d : Object.assign({}, e, d), n.forEach((v) => v(e, p));
    }
  }, s = () => e, c = { setState: r, getState: s, getInitialState: () => f, subscribe: (m) => (n.add(m), () => n.delete(m)) }, f = e = t(r, s, c);
  return c;
}, yI = ((t) => t ? H0(t) : H0), vI = (t) => t;
function _I(t, e = vI) {
  const n = Kn.useSyncExternalStore(
    t.subscribe,
    Kn.useCallback(() => e(t.getState()), [t, e]),
    Kn.useCallback(() => e(t.getInitialState()), [t, e])
  );
  return Kn.useDebugValue(n), n;
}
const W0 = (t) => {
  const e = yI(t), n = (r) => _I(e, r);
  return Object.assign(n, e), n;
}, xI = ((t) => t ? W0(t) : W0);
var b_;
const yh = ((b_ = ea[0]) == null ? void 0 : b_.id) || "morning-window", Op = xS[0] || 25, SI = 10, Lp = 180, wI = 0, TI = 100, vh = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"], _h = new Set(vh), is = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function AI(t, e, n, r) {
  const s = Number(t);
  return Number.isFinite(s) ? Math.min(r, Math.max(n, s)) : e;
}
function ss(t, e, n, r) {
  return Math.round(AI(t, e, n, r));
}
function ms(t, e = 50) {
  return ss(t, e, wI, TI);
}
function Ou(t, e = Op) {
  return ss(t, e, SI, Lp);
}
function zp(t) {
  return ea.find((e) => e.id === t) || null;
}
function gs(t = yh) {
  return zp(t) || ea[0] || {
    id: yh,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function kI(t = "/focus-room") {
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
function N1(t) {
  return Array.isArray(t) ? t.map((e) => ({
    minutes: ss(e == null ? void 0 : e.minutes, 5, 1, Lp),
    task: String((e == null ? void 0 : e.task) || "").trim()
  })).filter((e) => e.task) : [];
}
function vo(t) {
  return Array.isArray(t) ? t.map((e) => ({
    role: String((e == null ? void 0 : e.role) || "assistant") === "user" ? "user" : "assistant",
    text: String((e == null ? void 0 : e.text) || "").trim(),
    createdAt: (e == null ? void 0 : e.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
  })).filter((e) => e.text).slice(-24) : [];
}
function I1(t) {
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
function xh(t, e, n) {
  return t ? aR({
    material: t,
    goal: e,
    durationMinutes: n
  }) : [];
}
function _o(t) {
  const e = Ou(t);
  return e > 0 ? e * 60 : 0;
}
function bI(t, e) {
  const n = _o(e);
  return n ? Math.min(100, Math.max(0, t / n * 100)) : 0;
}
function CI(t) {
  const e = Math.max(0, Math.floor(Number(t) || 0)), n = Math.floor(e / 3600), r = Math.floor(e % 3600 / 60), s = e % 60, a = (l) => String(l).padStart(2, "0");
  return n ? `${n}:${a(r)}:${a(s)}` : `${a(r)}:${a(s)}`;
}
function Z0(t) {
  return t === "notes" ? "Generated Notes" : t === "sources" ? "Sources" : t === "mindmap" ? "Mind Map" : t === "chat" ? "AI Chat" : t === "plan" ? "Study Plan" : t === "workspace" ? "Scratchpad" : t === "history" ? "History" : String(t || "").replace(/^\w/, (e) => e.toUpperCase());
}
function Wo(t) {
  const e = (t == null ? void 0 : t.flashcards) || [];
  return Array.isArray(e) ? e.slice(0, 24) : [];
}
function PI(t, e) {
  return (t == null ? void 0 : t.prompt) || (t == null ? void 0 : t.front) || (t == null ? void 0 : t.question) || (t == null ? void 0 : t.term) || `Flashcard ${e + 1}`;
}
function EI(t) {
  return (t == null ? void 0 : t.answer) || (t == null ? void 0 : t.back) || (t == null ? void 0 : t.definition) || (t == null ? void 0 : t.explanation) || "Return to the workspace for the saved answer.";
}
function D1(t, e) {
  return String((t == null ? void 0 : t.id) || (t == null ? void 0 : t.front) || (t == null ? void 0 : t.term) || e);
}
function MI(t) {
  var e;
  return Array.isArray(t == null ? void 0 : t.questions) ? t.questions : Array.isArray((e = t == null ? void 0 : t.quiz) == null ? void 0 : e.questions) ? t.quiz.questions : [];
}
function ys(t) {
  return (Array.isArray(t == null ? void 0 : t.quizzes) ? t.quizzes : []).flatMap((n) => MI(n).map((r) => {
    var s;
    return {
      ...r,
      quizTitle: (n == null ? void 0 : n.title) || ((s = n == null ? void 0 : n.quiz) == null ? void 0 : s.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function Sh(t, e) {
  return (t == null ? void 0 : t.question) || (t == null ? void 0 : t.prompt) || (t == null ? void 0 : t.stem) || `Question ${e + 1}`;
}
function na(t) {
  return String((t == null ? void 0 : t.type) || "").toLowerCase();
}
function RI(t) {
  return String((t == null ? void 0 : t.label) || (t == null ? void 0 : t.text) || t).trim();
}
function vs(t) {
  const e = (t == null ? void 0 : t.choices) || (t == null ? void 0 : t.options) || (t == null ? void 0 : t.answers);
  return Array.isArray(e) && e.length ? e.map(RI).filter(Boolean) : na(t) === "true_false" ? ["True", "False"] : [];
}
function wh(t) {
  const e = (t == null ? void 0 : t.correctOptionIndexes) || (t == null ? void 0 : t.correct_option_indexes) || (t == null ? void 0 : t.correctIndexes);
  return Array.isArray(e) ? e.map((n) => Number(n)).filter(Number.isInteger) : [];
}
function NI(t, e) {
  const n = Array.isArray(t) ? [...t].map(Number).filter(Number.isInteger).sort((s, a) => s - a) : [], r = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((s, a) => s - a) : [];
  return n.length === r.length && n.every((s, a) => s === r[a]);
}
function Yn(t) {
  return String(t || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Tu(t, e) {
  if (Number.isInteger(e)) return e;
  const n = Number(e);
  if (typeof e != "string" && Number.isInteger(n)) return n;
  const r = vs(t), s = Yn(e);
  return r.findIndex((a) => Yn(a) === s);
}
function j1(t, e) {
  if (typeof e == "boolean") return e;
  if (e === 0) return !0;
  if (e === 1) return !1;
  const n = vs(t), r = Yn(e);
  return r === "true" ? !0 : r === "false" ? !1 : Yn(n[0]) === r ? !0 : Yn(n[1]) === r ? !1 : null;
}
function II(t, e, n) {
  const r = na(t);
  if (r === "multiple_choice") {
    const s = Tu(t, e);
    if (!Number.isInteger(s) || s < 0) return [];
    const a = Array.isArray(n) ? [...n] : [];
    return a.includes(s) ? a.filter((l) => l !== s) : [...a, s].sort((l, c) => l - c);
  }
  if (r === "single_choice") {
    const s = Tu(t, e);
    return Number.isInteger(s) && s >= 0 ? s : "";
  }
  if (r === "true_false") {
    const s = j1(t, e);
    return s === null ? "" : s;
  }
  return String(e || "");
}
function F1(t) {
  const e = (t == null ? void 0 : t.correctAnswer) ?? (t == null ? void 0 : t.correct_answer) ?? (t == null ? void 0 : t.answer) ?? (t == null ? void 0 : t.correct), n = wh(t);
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
function DI(t, e) {
  const n = na(t);
  if (n === "single_choice") {
    const s = wh(t)[0], a = Tu(t, e);
    return Number.isInteger(s) ? a === s : null;
  }
  if (n === "multiple_choice") {
    const s = wh(t), a = Array.isArray(e) ? e : [Tu(t, e)].filter(Number.isInteger);
    return s.length ? NI(a, s) : null;
  }
  if (n === "true_false") {
    const s = typeof (t == null ? void 0 : t.correctBoolean) == "boolean" ? t.correctBoolean : t == null ? void 0 : t.correct_boolean, a = j1(t, e);
    return typeof s == "boolean" && a !== null ? a === s : null;
  }
  const r = F1(t);
  return r ? Yn(e) === Yn(r) : null;
}
function jI(t, e) {
  const n = na(t);
  return n === "multiple_choice" ? Array.isArray(e) && e.length > 0 : n === "single_choice" ? Number.isInteger(e) : n === "true_false" ? typeof e == "boolean" : String(e || "").trim().length > 0;
}
function FI(t, e, n) {
  const r = na(t);
  return r === "multiple_choice" ? Array.isArray(e) && e.includes(n) : r === "single_choice" ? e === n : r === "true_false" ? e === (n === 0) : Yn(e) === Yn(vs(t)[n]);
}
function O1(t, e, n) {
  var c;
  const r = String(t || "").trim(), s = String((e == null ? void 0 : e.summaryText) || (e == null ? void 0 : e.aiSummary) || "").slice(0, 420), a = ((c = e == null ? void 0 : e.studyHeadings) == null ? void 0 : c[0]) || (e == null ? void 0 : e.materialTitle) || "this material", l = n || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`;
  return r ? [
    `For ${a}: ${s || "use the selected material as your main source."}`,
    `Your current goal is: ${l}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function OI() {
  return ea[0] || gs(yh);
}
function LI(t) {
  const e = String(t || "");
  if (!e) return null;
  const r = I1(SS()).materials[e];
  return r && typeof r == "object" ? r : null;
}
function yr(t) {
  var r;
  const e = String(t.selectedMaterialId || ((r = t.selectedMaterial) == null ? void 0 : r.materialId) || "");
  if (!e) return;
  const n = I1(SS());
  n.materials[e] = {
    materialId: e,
    selectedScene: t.selectedScene,
    musicType: t.musicType,
    ambientSound: t.ambientSound,
    musicVolume: ms(t.musicVolume),
    ambientVolume: ms(t.ambientVolume),
    durationMinutes: Ou(t.pomodoroDuration),
    studyGoal: t.studyGoal,
    studyPlan: N1(t.studyPlan),
    completedTasks: Array.isArray(t.completedTasks) ? t.completedTasks.filter(Boolean) : [],
    workspaceNotes: String(t.workspaceNotes || ""),
    workspaceUpdatedAt: t.workspaceUpdatedAt || "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, lR(n);
}
function zI(t) {
  return Array.isArray(t == null ? void 0 : t.completedTasks) ? t.completedTasks.map((e) => String(e || "").trim()).filter(Boolean) : [];
}
function Th(t = {}) {
  return {
    sectionTitle: String(t.sectionTitle || "").trim(),
    excerpt: String(t.excerpt || "").trim().slice(0, 1800)
  };
}
function L1(t = null) {
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
function $I(t, e = {}) {
  const n = gs(e.selectedScene), r = LI(t == null ? void 0 : t.materialId), s = zp(r == null ? void 0 : r.selectedScene) ? r.selectedScene : n.id, a = gs(s), l = String((r == null ? void 0 : r.musicType) || a.musicType || "Deep Focus"), c = String((r == null ? void 0 : r.ambientSound) || a.ambientSound || "Nature"), f = ms(r == null ? void 0 : r.musicVolume, e.musicVolume ?? 60), m = ms(r == null ? void 0 : r.ambientVolume, e.ambientVolume ?? 50), g = Ou(r == null ? void 0 : r.durationMinutes, e.pomodoroDuration ?? Op), d = String((r == null ? void 0 : r.studyGoal) || `Study ${(t == null ? void 0 : t.materialTitle) || "this material"}`), p = N1(r == null ? void 0 : r.studyPlan), v = p.length ? p : xh(t, d, g), w = zI(r), S = String((r == null ? void 0 : r.workspaceNotes) || ""), T = (r == null ? void 0 : r.workspaceUpdatedAt) || (r == null ? void 0 : r.updatedAt) || "";
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
    workspaceNotes: S,
    workspaceUpdatedAt: T
  };
}
function VI(t) {
  const e = cR(t);
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
    chatMessages: vo(e.chatMessages),
    chatPending: !1,
    chatError: "",
    panelTab: _h.has(e.panelTab) ? e.panelTab : "materials",
    workspaceNotes: String(e.workspaceNotes || ""),
    workspaceUpdatedAt: e.workspaceUpdatedAt || e.updatedAt || "",
    activeNoteSection: String(e.activeNoteSection || ""),
    activeSourceHighlight: L1(e.activeSourceHighlight),
    assistantContext: Th(e.assistantContext),
    audioPlaying: !1
  };
}
function kl() {
  return {
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {}
  };
}
function G0(t) {
  return Object.values(t.flashcardProgress || {}).filter((e) => e && e.difficulty).length;
}
function K0(t) {
  const e = Object.values(t.quizChecked || {}).filter((r) => r && r.hasKnownAnswer);
  if (!e.length) return null;
  const n = e.filter((r) => r.correct).length;
  return Math.round(n / e.length * 100);
}
function Y0(t) {
  const e = ys(t.selectedMaterial);
  return Object.entries(t.quizChecked || {}).filter(([, n]) => n && n.hasKnownAnswer && !n.correct).map(([n]) => Sh(e[Number(n)], Number(n))).filter(Boolean);
}
async function BI(t, e, n, r = {}) {
  var l, c;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: O1(t, n, H.getState().studyGoal),
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
const H = xI((t, e) => {
  const n = OI();
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
    pomodoroDuration: Op,
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
      const m = l.selectedMaterialId === f, g = m && a ? null : VI(f), d = m && a ? {} : $I(s, l), p = m && a ? {} : {
        timerStatus: "idle",
        elapsedSeconds: 0,
        startedAt: null,
        currentSession: null,
        ...kl(),
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
        sessionHistory: hu()
      });
    },
    selectScene(r) {
      const s = zp(r);
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
        const a = Ou(r, s.pomodoroDuration), l = xh(s.selectedMaterial, s.studyGoal, a), c = { pomodoroDuration: a, studyPlan: l };
        return yr({ ...s, ...c }), c;
      });
    },
    setStudyGoal(r) {
      t((s) => {
        const a = String(r ?? ""), l = xh(s.selectedMaterial, a, s.pomodoroDuration), c = { studyGoal: a, studyPlan: l };
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
      const s = _h.has(String(r || "")) ? String(r) : "materials";
      t({
        panelTab: s,
        aiPanelOpen: !0,
        activeDrawer: ""
      });
    },
    selectSourceHighlight(r = null, { openPanel: s = !0 } = {}) {
      const a = L1(r);
      t({
        activeSourceHighlight: a,
        activeNoteSection: (a == null ? void 0 : a.sectionTitle) || e().activeNoteSection || "",
        assistantContext: a ? Th({
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
        panelTab: _h.has(s) ? s : "materials",
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
        ...kl(),
        chatMessages: [],
        chatPending: !1,
        chatError: ""
      }));
    },
    startTimer() {
      const r = e();
      if (!r.selectedMaterial) return;
      const s = r.timerStatus === "completed" || r.elapsedSeconds >= _o(r.pomodoroDuration);
      t({
        view: "session",
        route: "session",
        timerStatus: "studying",
        audioPlaying: !0,
        summaryRecord: null,
        elapsedSeconds: s ? 0 : r.elapsedSeconds,
        startedAt: !r.startedAt || r.timerStatus === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : r.startedAt,
        ...s ? kl() : {}
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
        ...kl()
      });
    },
    skipTimer() {
      const r = e();
      t({
        elapsedSeconds: _o(r.pomodoroDuration),
        timerStatus: "completed",
        audioPlaying: !1,
        startedAt: r.startedAt || (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    tickTimer() {
      const r = e();
      if (r.view !== "session" || r.timerStatus !== "studying" || !r.selectedMaterial) return;
      const s = _o(r.pomodoroDuration), a = s ? Math.min(s, r.elapsedSeconds + 1) : r.elapsedSeconds + 1;
      t({
        elapsedSeconds: a,
        timerStatus: s && a >= s ? "completed" : r.timerStatus,
        audioPlaying: s && a >= s ? !1 : r.audioPlaying
      });
    },
    endSession() {
      var m;
      const r = e(), s = r.selectedMaterial || sR(r.selectedMaterialId);
      if (!s) return;
      const a = (/* @__PURE__ */ new Date()).toISOString(), l = _o(r.pomodoroDuration), c = l ? Math.min(l, r.elapsedSeconds) : r.elapsedSeconds, f = fR({
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
        flashcardsCompleted: G0(r),
        quizScore: K0(r),
        mistakesMade: Y0(r),
        completedTasks: r.completedTasks,
        recommendedNextStep: "Return to your notes, review any unchecked tasks, then start another short focus block."
      });
      kS(s.materialId), t({
        summaryRecord: f,
        sessionHistory: hu(),
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
      t({ assistantContext: Th(r) });
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
        const m = String(f.task || ""), g = a == null ? m : String(a || "").trim(), d = s == null ? f.minutes : ss(s, f.minutes, 1, Lp), p = l.studyPlan.map((S, T) => T === c ? { minutes: d, task: g || m } : S);
        let v = l.completedTasks;
        m && m !== p[c].task && v.includes(m) && (v = v.filter((S) => S !== m).concat(p[c].task));
        const w = { studyPlan: p, completedTasks: v };
        return yr({ ...l, ...w }), w;
      });
    },
    setFlashcardIndex(r) {
      const s = Wo(e().selectedMaterial);
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
      const s = e(), a = Wo(s.selectedMaterial);
      if (!a.length) return;
      const l = ss(s.flashcardIndex, 0, 0, a.length - 1), c = a[l], f = ["easy", "medium", "hard"].includes(String(r)) ? String(r) : "medium";
      t({
        flashcardProgress: {
          ...s.flashcardProgress,
          [D1(c, l)]: {
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
          [c]: II(l, s, f.quizAnswers[c])
        }
      }));
    },
    checkQuizQuestion(r) {
      const s = ys(e().selectedMaterial), a = Number(r), l = s[a];
      if (!l) return;
      const c = String(a), f = e(), m = Object.prototype.hasOwnProperty.call(f.quizAnswers, c) ? f.quizAnswers[c] : "", g = DI(l, m), d = F1(l);
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
      const a = e(), l = a.selectedMaterial, c = vo(a.chatMessages).slice(-10).map((f) => ({
        role: f.role === "user" ? "user" : "assistant",
        content: f.text
      }));
      t({
        chatMessages: vo([
          ...a.chatMessages,
          { role: "user", text: s, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        ]),
        chatPending: !0,
        chatError: ""
      });
      try {
        const f = await BI(s, c, l, a.assistantContext);
        t((m) => ({
          chatMessages: vo([
            ...m.chatMessages,
            { role: "assistant", text: f.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: f.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (f) {
        t((m) => ({
          chatMessages: vo([
            ...m.chatMessages,
            { role: "assistant", text: O1(s, l, e().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${f.message || "request failed"}`
        }));
      } finally {
        t({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return G0(e());
    },
    focusQuizScore() {
      return K0(e());
    },
    focusQuizMistakes() {
      return Y0(e());
    },
    formatFocusedTime() {
      return Iu(e().elapsedSeconds);
    }
  };
});
function de({
  children: t,
  className: e = "",
  variant: n = "ghost",
  type: r = "button",
  ...s
}) {
  return /* @__PURE__ */ _.jsx(
    "button",
    {
      className: `glass-button glass-button-${n} ${e}`.trim(),
      type: r,
      ...s,
      children: t
    }
  );
}
function Po({ as: t = "section", className: e = "", children: n, ...r }) {
  return /* @__PURE__ */ _.jsx(
    cn.div,
    {
      className: `liquid-glass ${e}`.trim(),
      initial: { opacity: 0, y: 14, filter: "blur(10px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      transition: is,
      ...r,
      children: t === "div" ? n : /* @__PURE__ */ _.jsx(t, { className: "liquid-glass-inner", children: n })
    }
  );
}
function UI({ scene: t, active: e, onSelect: n }) {
  return /* @__PURE__ */ _.jsxs(
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
        /* @__PURE__ */ _.jsx("span", { className: "focus-pill", children: t.kicker }),
        /* @__PURE__ */ _.jsx("strong", { children: t.name }),
        /* @__PURE__ */ _.jsx("span", { children: t.description })
      ]
    }
  );
}
function z1() {
  const t = H((n) => n.selectedScene), e = H((n) => n.selectScene);
  return /* @__PURE__ */ _.jsx("div", { className: "scene-selector", children: ea.map((n) => /* @__PURE__ */ _.jsx(
    UI,
    {
      scene: n,
      active: n.id === t,
      onSelect: e
    },
    n.id
  )) });
}
function $1(t, [e, n]) {
  return Math.min(n, Math.max(e, t));
}
function He(t, e, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(s) {
    if (t == null || t(s), n === !1 || !s.defaultPrevented)
      return e == null ? void 0 : e(s);
  };
}
function q0(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function HI(...t) {
  return (e) => {
    let n = !1;
    const r = t.map((s) => {
      const a = q0(s, e);
      return !n && typeof a == "function" && (n = !0), a;
    });
    if (n)
      return () => {
        for (let s = 0; s < r.length; s++) {
          const a = r[s];
          typeof a == "function" ? a() : q0(t[s], null);
        }
      };
  };
}
function kt(...t) {
  return P.useCallback(HI(...t), t);
}
function WI(t, e) {
  const n = P.createContext(e);
  n.displayName = t + "Context";
  const r = (a) => {
    const { children: l, ...c } = a, f = P.useMemo(() => c, Object.values(c));
    return /* @__PURE__ */ _.jsx(n.Provider, { value: f, children: l });
  };
  r.displayName = t + "Provider";
  function s(a) {
    const l = P.useContext(n);
    if (l) return l;
    if (e !== void 0) return e;
    throw new Error(`\`${a}\` must be used within \`${t}\``);
  }
  return [r, s];
}
function ra(t, e = []) {
  let n = [];
  function r(a, l) {
    const c = P.createContext(l);
    c.displayName = a + "Context";
    const f = n.length;
    n = [...n, l];
    const m = (d) => {
      var A;
      const { scope: p, children: v, ...w } = d, S = ((A = p == null ? void 0 : p[t]) == null ? void 0 : A[f]) || c, T = P.useMemo(() => w, Object.values(w));
      return /* @__PURE__ */ _.jsx(S.Provider, { value: T, children: v });
    };
    m.displayName = a + "Provider";
    function g(d, p) {
      var S;
      const v = ((S = p == null ? void 0 : p[t]) == null ? void 0 : S[f]) || c, w = P.useContext(v);
      if (w) return w;
      if (l !== void 0) return l;
      throw new Error(`\`${d}\` must be used within \`${a}\``);
    }
    return [m, g];
  }
  const s = () => {
    const a = n.map((l) => P.createContext(l));
    return function(c) {
      const f = (c == null ? void 0 : c[t]) || a;
      return P.useMemo(
        () => ({ [`__scope${t}`]: { ...c, [t]: f } }),
        [c, f]
      );
    };
  };
  return s.scopeName = t, [r, ZI(s, ...e)];
}
function ZI(...t) {
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
      return P.useMemo(() => ({ [`__scope${e.scopeName}`]: l }), [l]);
    };
  };
  return n.scopeName = e.scopeName, n;
}
var _s = globalThis != null && globalThis.document ? P.useLayoutEffect : () => {
}, GI = Oh[" useInsertionEffect ".trim().toString()] || _s;
function Lu({
  prop: t,
  defaultProp: e,
  onChange: n = () => {
  },
  caller: r
}) {
  const [s, a, l] = KI({
    defaultProp: e,
    onChange: n
  }), c = t !== void 0, f = c ? t : s;
  {
    const g = P.useRef(t !== void 0);
    P.useEffect(() => {
      const d = g.current;
      d !== c && console.warn(
        `${r} is changing from ${d ? "controlled" : "uncontrolled"} to ${c ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), g.current = c;
    }, [c, r]);
  }
  const m = P.useCallback(
    (g) => {
      var d;
      if (c) {
        const p = YI(g) ? g(t) : g;
        p !== t && ((d = l.current) == null || d.call(l, p));
      } else
        a(g);
    },
    [c, t, a, l]
  );
  return [f, m];
}
function KI({
  defaultProp: t,
  onChange: e
}) {
  const [n, r] = P.useState(t), s = P.useRef(n), a = P.useRef(e);
  return GI(() => {
    a.current = e;
  }, [e]), P.useEffect(() => {
    var l;
    s.current !== n && ((l = a.current) == null || l.call(a, n), s.current = n);
  }, [n, s]), [n, r, a];
}
function YI(t) {
  return typeof t == "function";
}
var qI = P.createContext(void 0);
function $p(t) {
  const e = P.useContext(qI);
  return t || e || "ltr";
}
function QI(t) {
  const e = P.useRef({ value: t, previous: t });
  return P.useMemo(() => (e.current.value !== t && (e.current.previous = e.current.value, e.current.value = t), e.current.previous), [t]);
}
function XI(t) {
  const [e, n] = P.useState(void 0);
  return _s(() => {
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
var V1 = M_();
// @__NO_SIDE_EFFECTS__
function Au(t) {
  const e = P.forwardRef((n, r) => {
    let { children: s, ...a } = n, l = null, c = !1;
    const f = [];
    Q0(s) && typeof bl == "function" && (s = bl(s._payload)), P.Children.forEach(s, (p) => {
      var v;
      if (r2(p)) {
        c = !0;
        const w = p;
        let S = "child" in w.props ? w.props.child : w.props.children;
        Q0(S) && typeof bl == "function" && (S = bl(S._payload)), l = e2(w, S), f.push((v = l == null ? void 0 : l.props) == null ? void 0 : v.children);
      } else
        f.push(p);
    }), l ? l = P.cloneElement(l, void 0, f) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !c && P.Children.count(s) === 1 && P.isValidElement(s) && (l = s)
    );
    const m = l ? n2(l) : void 0, g = kt(r, m);
    if (!l) {
      if (s || s === 0)
        throw new Error(
          c ? a2(t) : o2(t)
        );
      return s;
    }
    const d = t2(a, l.props ?? {});
    return l.type !== P.Fragment && (d.ref = r ? g : m), P.cloneElement(l, d);
  });
  return e.displayName = `${t}.Slot`, e;
}
var JI = Symbol.for("radix.slottable"), e2 = (t, e) => {
  if ("child" in t.props) {
    const n = t.props.child;
    return P.isValidElement(n) ? P.cloneElement(n, void 0, t.props.children(n.props.children)) : null;
  }
  return P.isValidElement(e) ? e : null;
};
function t2(t, e) {
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
function n2(t) {
  var r, s;
  let e = (r = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : r.get, n = e && "isReactWarning" in e && e.isReactWarning;
  return n ? t.ref : (e = (s = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : s.get, n = e && "isReactWarning" in e && e.isReactWarning, n ? t.props.ref : t.props.ref || t.ref);
}
function r2(t) {
  return P.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === JI;
}
var i2 = Symbol.for("react.lazy");
function Q0(t) {
  return t != null && typeof t == "object" && "$$typeof" in t && t.$$typeof === i2 && "_payload" in t && s2(t._payload);
}
function s2(t) {
  return typeof t == "object" && t !== null && "then" in t;
}
var o2 = (t) => `${t} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, a2 = (t) => `${t} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, bl = Oh[" use ".trim().toString()], l2 = [
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
], Je = l2.reduce((t, e) => {
  const n = /* @__PURE__ */ Au(`Primitive.${e}`), r = P.forwardRef((s, a) => {
    const { asChild: l, ...c } = s, f = l ? n : e;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ _.jsx(f, { ...c, ref: a });
  });
  return r.displayName = `Primitive.${e}`, { ...t, [e]: r };
}, {});
function u2(t, e) {
  t && V1.flushSync(() => t.dispatchEvent(e));
}
function B1(t) {
  const e = t + "CollectionProvider", [n, r] = ra(e), [s, a] = n(
    e,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), l = (S) => {
    const { scope: T, children: A } = S, b = P.useRef(null), E = P.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ _.jsx(s, { scope: T, itemMap: E, collectionRef: b, children: A });
  };
  l.displayName = e;
  const c = t + "CollectionSlot", f = /* @__PURE__ */ Au(c), m = P.forwardRef(
    (S, T) => {
      const { scope: A, children: b } = S, E = a(c, A), M = kt(T, E.collectionRef);
      return /* @__PURE__ */ _.jsx(f, { ref: M, children: b });
    }
  );
  m.displayName = c;
  const g = t + "CollectionItemSlot", d = "data-radix-collection-item", p = /* @__PURE__ */ Au(g), v = P.forwardRef(
    (S, T) => {
      const { scope: A, children: b, ...E } = S, M = P.useRef(null), C = kt(T, M), $ = a(g, A);
      return P.useEffect(() => ($.itemMap.set(M, { ref: M, ...E }), () => void $.itemMap.delete(M))), /* @__PURE__ */ _.jsx(p, { [d]: "", ref: C, children: b });
    }
  );
  v.displayName = g;
  function w(S) {
    const T = a(t + "CollectionConsumer", S);
    return P.useCallback(() => {
      const b = T.collectionRef.current;
      if (!b) return [];
      const E = Array.from(b.querySelectorAll(`[${d}]`));
      return Array.from(T.itemMap.values()).sort(
        ($, I) => E.indexOf($.ref.current) - E.indexOf(I.ref.current)
      );
    }, [T.collectionRef, T.itemMap]);
  }
  return [
    { Provider: l, Slot: m, ItemSlot: v },
    w,
    r
  ];
}
var U1 = ["PageUp", "PageDown"], H1 = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], W1 = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, As = "Slider", [Ah, c2, d2] = B1(As), [Vp] = ra(As, [
  d2
]), [f2, ia] = Vp(As), Z1 = P.forwardRef(
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
      ...S
    } = t, T = P.useRef(/* @__PURE__ */ new Set()), A = P.useRef(0), b = P.useRef(!1), M = l === "horizontal" ? h2 : p2, [C = [], $] = Lu({
      prop: g,
      defaultProp: m,
      onChange: (ee) => {
        var ie;
        (ie = [...T.current][A.current]) == null || ie.focus({
          preventScroll: !0,
          focusVisible: b.current
        }), b.current = !1, d(ee);
      }
    }), I = P.useRef(C);
    function O(ee) {
      const ne = v2(C, ee);
      q(ee, ne);
    }
    function L(ee) {
      q(ee, A.current);
    }
    function U() {
      const ee = I.current[A.current];
      C[A.current] !== ee && p(C);
    }
    function q(ee, ne, { commit: ie } = { commit: !1 }) {
      const ge = w2(a), ce = T2(Math.round((ee - r) / a) * a + r, ge), fe = $1(ce, [r, s]);
      $((W = []) => {
        const J = g2(W, fe, ne);
        if (S2(J, f * a)) {
          A.current = J.indexOf(fe);
          const Q = String(J) !== String(W);
          return Q && ie && p(J), Q ? J : W;
        } else
          return W;
      });
    }
    return /* @__PURE__ */ _.jsx(
      f2,
      {
        scope: t.__scopeSlider,
        name: n,
        disabled: c,
        min: r,
        max: s,
        valueIndexToChangeRef: A,
        thumbs: T.current,
        values: C,
        orientation: l,
        form: w,
        children: /* @__PURE__ */ _.jsx(Ah.Provider, { scope: t.__scopeSlider, children: /* @__PURE__ */ _.jsx(Ah.Slot, { scope: t.__scopeSlider, children: /* @__PURE__ */ _.jsx(
          M,
          {
            "aria-disabled": c,
            "data-disabled": c ? "" : void 0,
            ...S,
            ref: e,
            onPointerDown: He(S.onPointerDown, () => {
              c || (I.current = C, b.current = !1);
            }),
            min: r,
            max: s,
            inverted: v,
            onSlideStart: c ? void 0 : O,
            onSlideMove: c ? void 0 : L,
            onSlideEnd: c ? void 0 : U,
            onHomeKeyDown: () => {
              c || (b.current = !0, q(r, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              c || (b.current = !0, q(s, C.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: ee, direction: ne }) => {
              if (!c) {
                b.current = !0;
                const ce = U1.includes(ee.key) || ee.shiftKey && H1.includes(ee.key) ? 10 : 1, fe = A.current, W = C[fe], J = a * ce * ne;
                q(W + J, fe, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Z1.displayName = As;
var [G1, K1] = Vp(As, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), h2 = P.forwardRef(
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
    } = t, [d, p] = P.useState(null), v = kt(e, (E) => p(E)), w = P.useRef(void 0), S = $p(s), T = S === "ltr", A = T && !a || !T && a;
    function b(E) {
      const M = w.current || d.getBoundingClientRect(), C = [0, M.width], I = Bp(C, A ? [n, r] : [r, n]);
      return w.current = M, I(E - M.left);
    }
    return /* @__PURE__ */ _.jsx(
      G1,
      {
        scope: t.__scopeSlider,
        startEdge: A ? "left" : "right",
        endEdge: A ? "right" : "left",
        direction: A ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ _.jsx(
          Y1,
          {
            dir: S,
            "data-orientation": "horizontal",
            ...g,
            ref: v,
            style: {
              ...g.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (E) => {
              const M = b(E.clientX);
              l == null || l(M);
            },
            onSlideMove: (E) => {
              const M = b(E.clientX);
              c == null || c(M);
            },
            onSlideEnd: () => {
              w.current = void 0, f == null || f();
            },
            onStepKeyDown: (E) => {
              const C = W1[A ? "from-left" : "from-right"].includes(E.key);
              m == null || m({ event: E, direction: C ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), p2 = P.forwardRef(
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
    } = t, g = P.useRef(null), d = kt(e, g), p = P.useRef(void 0), v = !s;
    function w(S) {
      const T = p.current || g.current.getBoundingClientRect(), A = [0, T.height], E = Bp(A, v ? [r, n] : [n, r]);
      return p.current = T, E(S - T.top);
    }
    return /* @__PURE__ */ _.jsx(
      G1,
      {
        scope: t.__scopeSlider,
        startEdge: v ? "bottom" : "top",
        endEdge: v ? "top" : "bottom",
        size: "height",
        direction: v ? 1 : -1,
        children: /* @__PURE__ */ _.jsx(
          Y1,
          {
            "data-orientation": "vertical",
            ...m,
            ref: d,
            style: {
              ...m.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (S) => {
              const T = w(S.clientY);
              a == null || a(T);
            },
            onSlideMove: (S) => {
              const T = w(S.clientY);
              l == null || l(T);
            },
            onSlideEnd: () => {
              p.current = void 0, c == null || c();
            },
            onStepKeyDown: (S) => {
              const A = W1[v ? "from-bottom" : "from-top"].includes(S.key);
              f == null || f({ event: S, direction: A ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), Y1 = P.forwardRef(
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
    } = t, g = ia(As, n);
    return /* @__PURE__ */ _.jsx(
      Je.span,
      {
        ...m,
        ref: e,
        onKeyDown: He(t.onKeyDown, (d) => {
          d.key === "Home" ? (l(d), d.preventDefault()) : d.key === "End" ? (c(d), d.preventDefault()) : U1.concat(H1).includes(d.key) && (f(d), d.preventDefault());
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
), q1 = "SliderTrack", Q1 = P.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = ia(q1, n);
    return /* @__PURE__ */ _.jsx(
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
Q1.displayName = q1;
var kh = "SliderRange", X1 = P.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = ia(kh, n), a = K1(kh, n), l = P.useRef(null), c = kt(e, l), f = s.values.length, m = s.values.map(
      (p) => aw(p, s.min, s.max)
    ), g = f > 1 ? Math.min(...m) : 0, d = 100 - Math.max(...m);
    return /* @__PURE__ */ _.jsx(
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
X1.displayName = kh;
var J1 = "SliderThumb", [m2, ew] = Vp(J1), tw = "SliderThumbProvider";
function nw(t) {
  const {
    __scopeSlider: e,
    name: n,
    children: r,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: s
  } = t, a = ia(tw, e), l = c2(e), [c, f] = P.useState(null), m = P.useMemo(
    () => c ? l().findIndex((T) => T.ref.current === c) : -1,
    [l, c]
  ), g = XI(c), d = c ? !!a.form || !!c.closest("form") : !0, p = a.values[m], v = n ?? (a.name ? a.name + (a.values.length > 1 ? "[]" : "") : void 0), w = p === void 0 ? 0 : aw(p, a.min, a.max);
  P.useEffect(() => {
    if (c)
      return a.thumbs.add(c), () => {
        a.thumbs.delete(c);
      };
  }, [c, a.thumbs]);
  const S = {
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
  return /* @__PURE__ */ _.jsx(m2, { scope: e, ...S, children: A2(s) ? s(S) : r });
}
nw.displayName = tw;
var Kl = "SliderThumbTrigger", rw = P.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = ia(Kl, n), a = K1(Kl, n), { index: l, value: c, percent: f, size: m, onThumbChange: g } = ew(
      Kl,
      n
    ), d = kt(e, (S) => g(S)), p = y2(l, s.values.length), v = m == null ? void 0 : m[a.size], w = v ? _2(v, f, a.direction) : 0;
    return /* @__PURE__ */ _.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [a.startEdge]: `calc(${f}% + ${w}px)`
        },
        children: /* @__PURE__ */ _.jsx(Ah.ItemSlot, { scope: n, children: /* @__PURE__ */ _.jsx(
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
rw.displayName = Kl;
var iw = P.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, name: r, ...s } = t;
    return /* @__PURE__ */ _.jsx(
      nw,
      {
        __scopeSlider: n,
        name: r,
        internal_do_not_use_render: ({ index: a, isFormControl: l }) => /* @__PURE__ */ _.jsxs(_.Fragment, { children: [
          /* @__PURE__ */ _.jsx(
            rw,
            {
              ...s,
              ref: e,
              __scopeSlider: n
            }
          ),
          l ? /* @__PURE__ */ _.jsx(
            ow,
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
iw.displayName = J1;
var sw = "SliderBubbleInput", ow = P.forwardRef(
  ({ __scopeSlider: t, ...e }, n) => {
    const { value: r, name: s, form: a } = ew(sw, t), l = P.useRef(null), c = kt(l, n), f = QI(r);
    return P.useEffect(() => {
      const m = l.current;
      if (!m) return;
      const g = window.HTMLInputElement.prototype, p = Object.getOwnPropertyDescriptor(g, "value").set;
      if (f !== r && p) {
        const v = new Event("input", { bubbles: !0 });
        p.call(m, r), m.dispatchEvent(v);
      }
    }, [f, r]), /* @__PURE__ */ _.jsx(
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
ow.displayName = sw;
function g2(t = [], e, n) {
  const r = [...t];
  return r[n] = e, r.sort((s, a) => s - a);
}
function aw(t, e, n) {
  const a = 100 / (n - e) * (t - e);
  return $1(a, [0, 100]);
}
function y2(t, e) {
  return e > 2 ? `Value ${t + 1} of ${e}` : e === 2 ? ["Minimum", "Maximum"][t] : void 0;
}
function v2(t, e) {
  if (t.length === 1) return 0;
  const n = t.map((s) => Math.abs(s - e)), r = Math.min(...n);
  return n.indexOf(r);
}
function _2(t, e, n) {
  const r = t / 2, a = Bp([0, 50], [0, r]);
  return (r - a(e) * n) * n;
}
function x2(t) {
  return t.slice(0, -1).map((e, n) => t[n + 1] - e);
}
function S2(t, e) {
  if (e > 0) {
    const n = x2(t);
    return Math.min(...n) >= e;
  }
  return !0;
}
function Bp(t, e) {
  return (n) => {
    if (t[0] === t[1] || e[0] === e[1]) return e[0];
    const r = (e[1] - e[0]) / (t[1] - t[0]);
    return e[0] + r * (n - t[0]);
  };
}
function w2(t) {
  if (!Number.isFinite(t)) return 0;
  const e = t.toString();
  if (e.includes("e")) {
    const [r, s] = e.split("e"), a = r.split(".")[1] || "", l = Number(s);
    return Math.max(0, a.length - l);
  }
  const n = e.split(".")[1];
  return n ? n.length : 0;
}
function T2(t, e) {
  const n = Math.pow(10, e);
  return Math.round(t * n) / n;
}
function A2(t) {
  return typeof t == "function";
}
function X0({ label: t, icon: e, value: n, onChange: r }) {
  return /* @__PURE__ */ _.jsxs("label", { className: "sound-slider", children: [
    /* @__PURE__ */ _.jsxs("span", { className: "sound-slider-head", children: [
      /* @__PURE__ */ _.jsxs("span", { className: "sound-slider-label", children: [
        e,
        /* @__PURE__ */ _.jsx("span", { children: t })
      ] }),
      /* @__PURE__ */ _.jsxs("strong", { children: [
        n,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ _.jsxs(
      Z1,
      {
        className: "radix-slider-root",
        value: [n],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (s) => r(s[0]),
        children: [
          /* @__PURE__ */ _.jsx(Q1, { className: "radix-slider-track", children: /* @__PURE__ */ _.jsx(X1, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ _.jsx(iw, { className: "radix-slider-thumb", "aria-label": t })
        ]
      }
    )
  ] });
}
function lw({ audioState: t }) {
  const e = H((g) => g.musicType), n = H((g) => g.ambientSound), r = H((g) => g.musicVolume), s = H((g) => g.ambientVolume), a = H((g) => g.audioPlaying), l = H((g) => g.setSound), c = H((g) => g.toggleAudio), f = Nu({ musicType: e, ambientSound: n }), m = f.ambientLayers.map((g) => g.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ _.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ _.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ _.jsx("select", { value: e, onChange: (g) => l("musicType", g.target.value), children: Jf.map((g) => /* @__PURE__ */ _.jsx("option", { value: g.label, children: g.label }, g.label)) })
    ] }),
    /* @__PURE__ */ _.jsx(
      X0,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ _.jsx(hI, { size: 16, "aria-hidden": "true" }),
        value: r,
        onChange: (g) => l("musicVolume", g)
      }
    ),
    /* @__PURE__ */ _.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ _.jsx("select", { value: n, onChange: (g) => l("ambientSound", g.target.value), children: eh.map((g) => /* @__PURE__ */ _.jsx("option", { value: g.label, children: g.label }, g.label)) })
    ] }),
    /* @__PURE__ */ _.jsx(
      X0,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ _.jsx(mI, { size: 16, "aria-hidden": "true" }),
        value: s,
        onChange: (g) => l("ambientVolume", g)
      }
    ),
    /* @__PURE__ */ _.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ _.jsxs("div", { children: [
        /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ _.jsx("strong", { children: f.musicTrack.title }),
        /* @__PURE__ */ _.jsx("p", { children: m }),
        t != null && t.error ? /* @__PURE__ */ _.jsx("p", { className: "audio-error", children: t.error }) : null
      ] }),
      /* @__PURE__ */ _.jsx(de, { variant: a ? "primary" : "ghost", onClick: c, children: a ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ _.jsx("div", { className: "audio-links", children: [f.musicTrack, ...f.ambientLayers].filter((g) => g == null ? void 0 : g.pageUrl).map((g) => /* @__PURE__ */ _.jsx("a", { href: g.pageUrl, target: "_blank", rel: "noreferrer", children: g.title || g.label || "Audio source" }, g.pageUrl)) })
  ] });
}
function k2({ audioState: t, onWorkspace: e, onHistory: n }) {
  var g;
  const r = H((d) => d.selectedMaterial), s = H((d) => d.pomodoroDuration), a = H((d) => d.studyGoal), l = H((d) => d.studyPlan), c = H((d) => d.setPomodoroDuration), f = H((d) => d.setStudyGoal), m = H((d) => d.startSession);
  return r ? /* @__PURE__ */ _.jsxs("section", { className: "focus-setup-stage", "aria-label": "Focus Room setup", children: [
    /* @__PURE__ */ _.jsxs(Po, { className: "focus-setup-scenes", children: [
      /* @__PURE__ */ _.jsx("span", { className: "focus-step-label", children: "Step 01" }),
      /* @__PURE__ */ _.jsx("h1", { children: "Choose your study scene" }),
      /* @__PURE__ */ _.jsx("p", { children: "Pick the cinematic atmosphere that matches this focus block." }),
      /* @__PURE__ */ _.jsxs("article", { className: "material-strip liquid-glass-lite", children: [
        /* @__PURE__ */ _.jsx("span", { className: "focus-pill", children: r.materialType || "Study material" }),
        /* @__PURE__ */ _.jsxs("div", { className: "material-strip-copy", children: [
          /* @__PURE__ */ _.jsx("strong", { children: r.materialTitle || "Study material" }),
          /* @__PURE__ */ _.jsx("p", { children: ((g = r.studyHeadings) == null ? void 0 : g.slice(0, 2).join(" / ")) || "Generated notes" })
        ] })
      ] }),
      /* @__PURE__ */ _.jsx(z1, {})
    ] }),
    /* @__PURE__ */ _.jsxs(Po, { className: "focus-setup-controls", children: [
      /* @__PURE__ */ _.jsx("span", { className: "focus-step-label", children: "Step 02" }),
      /* @__PURE__ */ _.jsx("h2", { children: "Set sound atmosphere" }),
      /* @__PURE__ */ _.jsx(lw, { audioState: t }),
      /* @__PURE__ */ _.jsx("span", { className: "focus-step-label", children: "Step 03" }),
      /* @__PURE__ */ _.jsx("h2", { children: "Set Pomodoro" }),
      /* @__PURE__ */ _.jsx("div", { className: "duration-grid", "aria-label": "Pomodoro duration", children: xS.map((d) => /* @__PURE__ */ _.jsxs(
        de,
        {
          variant: d === s ? "primary" : "ghost",
          "aria-pressed": d === s,
          onClick: () => c(d),
          children: [
            /* @__PURE__ */ _.jsx(BN, { size: 16, "aria-hidden": "true" }),
            " ",
            d,
            "m"
          ]
        },
        d
      )) }),
      /* @__PURE__ */ _.jsxs("label", { className: "focus-field", children: [
        "Custom duration",
        /* @__PURE__ */ _.jsx(
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
      /* @__PURE__ */ _.jsxs("label", { className: "focus-field", children: [
        "Study goal",
        /* @__PURE__ */ _.jsx("textarea", { value: a, onChange: (d) => f(d.target.value) })
      ] }),
      /* @__PURE__ */ _.jsxs("div", { className: "plan-preview liquid-glass-lite", children: [
        /* @__PURE__ */ _.jsx("h3", { children: "Study plan" }),
        /* @__PURE__ */ _.jsx("ul", { className: "plan-list", children: l.map((d, p) => /* @__PURE__ */ _.jsxs("li", { children: [
          /* @__PURE__ */ _.jsxs("strong", { children: [
            d.minutes,
            "m"
          ] }),
          /* @__PURE__ */ _.jsx("span", { children: d.task })
        ] }, `${d.task}-${p}`)) })
      ] }),
      /* @__PURE__ */ _.jsxs(de, { className: "enter-focus-btn", variant: "primary", onClick: m, children: [
        /* @__PURE__ */ _.jsx(Fp, { size: 18, "aria-hidden": "true" }),
        " Enter Focus Room"
      ] })
    ] })
  ] }) : /* @__PURE__ */ _.jsx("section", { className: "focus-empty-stage", children: /* @__PURE__ */ _.jsxs(Po, { className: "focus-empty-card", children: [
    /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Ready when you are" }),
    /* @__PURE__ */ _.jsx("h1", { children: "Waiting for material" }),
    /* @__PURE__ */ _.jsx("p", { children: "Generate or select study notes in the workspace, then open the Focus Room again." }),
    /* @__PURE__ */ _.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ _.jsx(de, { variant: "primary", onClick: () => e(), children: "Open Workspace" }),
      /* @__PURE__ */ _.jsx(de, { onClick: n, children: "Study History" })
    ] })
  ] }) });
}
function b2(t) {
  return t === "paused" ? "Resume" : t === "completed" ? "Restart" : "Start";
}
function C2() {
  var M;
  const t = H((C) => C.elapsedSeconds), e = H((C) => C.pomodoroDuration), n = H((C) => C.timerStatus), r = H((C) => C.isIdle), s = H((C) => C.selectedMaterial), a = H((C) => C.studyGoal), l = H((C) => C.completedTasks), c = H((C) => C.studyPlan), f = H((C) => C.musicType), m = H((C) => C.ambientSound), g = H((C) => C.startTimer), d = H((C) => C.pauseTimer), p = H((C) => C.resetTimer), v = H((C) => C.skipTimer), w = H((C) => C.openStudyPanel), S = Math.max(0, e * 60 - t), T = bI(t, e), A = r ? 0.96 : 1, b = n === "studying" ? { scale: [A, A + 0.012, A] } : { scale: A }, E = ((M = c.find((C) => !l.includes(C.task))) == null ? void 0 : M.task) || "Review your strongest and weakest ideas.";
  return /* @__PURE__ */ _.jsxs(
    cn.article,
    {
      className: "timer-card liquid-glass",
      animate: b,
      transition: n === "studying" ? { duration: 4, repeat: 1 / 0, ease: "easeInOut" } : { duration: 0.2 },
      children: [
        /* @__PURE__ */ _.jsxs("span", { className: "focus-kicker", children: [
          "Focus Block / ",
          n
        ] }),
        /* @__PURE__ */ _.jsxs("div", { className: "timer-card-head", children: [
          /* @__PURE__ */ _.jsxs("div", { children: [
            /* @__PURE__ */ _.jsx("h2", { children: a || `Study ${(s == null ? void 0 : s.materialTitle) || "this material"}` }),
            /* @__PURE__ */ _.jsx("p", { children: (s == null ? void 0 : s.materialTitle) || "Study material" })
          ] }),
          /* @__PURE__ */ _.jsxs("div", { className: "timer-pill-row", children: [
            /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
              f,
              " / ",
              m
            ] }),
            /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
              /* @__PURE__ */ _.jsx(Dp, { size: 14, "aria-hidden": "true" }),
              " ",
              l.length,
              "/",
              c.length || 0,
              " tasks"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ _.jsx("div", { className: "timer-value", "aria-live": "polite", children: CI(S) }),
        /* @__PURE__ */ _.jsxs("div", { className: "timer-meta-grid", children: [
          /* @__PURE__ */ _.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ _.jsx("span", { children: "Focused" }),
            /* @__PURE__ */ _.jsx("strong", { children: Iu(t) })
          ] }),
          /* @__PURE__ */ _.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ _.jsx("span", { children: "Block" }),
            /* @__PURE__ */ _.jsxs("strong", { children: [
              e,
              "m"
            ] })
          ] }),
          /* @__PURE__ */ _.jsxs("div", { className: "timer-meta-card", children: [
            /* @__PURE__ */ _.jsx("span", { children: "Next" }),
            /* @__PURE__ */ _.jsx("strong", { children: E })
          ] })
        ] }),
        /* @__PURE__ */ _.jsx("div", { className: "focus-progress-track", "aria-label": "Focus progress", children: /* @__PURE__ */ _.jsx("div", { className: "focus-progress-fill", style: { width: `${T.toFixed(1)}%` } }) }),
        /* @__PURE__ */ _.jsxs("div", { className: "timer-actions", children: [
          /* @__PURE__ */ _.jsxs(de, { variant: n === "studying" ? "primary" : "ghost", onClick: g, children: [
            /* @__PURE__ */ _.jsx(C1, { size: 16, "aria-hidden": "true" }),
            " ",
            b2(n)
          ] }),
          /* @__PURE__ */ _.jsxs(de, { onClick: () => d(), children: [
            /* @__PURE__ */ _.jsx(gh, { size: 16, "aria-hidden": "true" }),
            " Pause"
          ] }),
          /* @__PURE__ */ _.jsx(de, { onClick: () => w("materials"), children: "Materials" }),
          /* @__PURE__ */ _.jsxs(de, { onClick: p, children: [
            /* @__PURE__ */ _.jsx(P1, { size: 16, "aria-hidden": "true" }),
            " Reset"
          ] }),
          /* @__PURE__ */ _.jsxs(de, { onClick: v, children: [
            /* @__PURE__ */ _.jsx(E1, { size: 16, "aria-hidden": "true" }),
            " Skip"
          ] })
        ] })
      ]
    }
  );
}
function P2() {
  return /* @__PURE__ */ _.jsx(C2, {});
}
function E2({ onWorkspace: t, onHistory: e }) {
  var v, w, S, T;
  const n = H((A) => A.selectedMaterial), r = H((A) => A.selectedScene), s = H((A) => A.panelTab), a = H((A) => A.aiPanelOpen), l = H((A) => A.openDrawer), c = H((A) => A.openStudyPanel), f = H((A) => A.endSession), m = gs(r), g = ((v = n == null ? void 0 : n.sourceHighlights) == null ? void 0 : v.length) || ((w = n == null ? void 0 : n.sourceItems) == null ? void 0 : w.length) || ((S = n == null ? void 0 : n.sources) == null ? void 0 : S.length) || 0, d = Object.keys((n == null ? void 0 : n.sections) || {}).length || ((T = n == null ? void 0 : n.studyHeadings) == null ? void 0 : T.length) || 1, p = (A) => a && s === A;
  return /* @__PURE__ */ _.jsxs("header", { className: "top-nav", children: [
    /* @__PURE__ */ _.jsxs("div", { className: "focus-brand", children: [
      /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Synapse Focus Room" }),
      /* @__PURE__ */ _.jsx("strong", { children: m.name }),
      /* @__PURE__ */ _.jsxs("small", { children: [
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
    /* @__PURE__ */ _.jsxs("nav", { className: "top-nav-actions", "aria-label": "Focus Room controls", children: [
      /* @__PURE__ */ _.jsxs(de, { className: "focus-command-btn", onClick: () => l("scene"), title: "Change scene", children: [
        /* @__PURE__ */ _.jsx(k1, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ _.jsx("span", { children: "Scene" })
      ] }),
      /* @__PURE__ */ _.jsxs(de, { className: "focus-command-btn", onClick: () => l("music"), title: "Sound controls", children: [
        /* @__PURE__ */ _.jsx(tI, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ _.jsx("span", { children: "Sound" })
      ] }),
      /* @__PURE__ */ _.jsxs(de, { className: `focus-command-btn ${p("materials") ? "is-active" : ""}`.trim(), onClick: () => c("materials"), title: "Open material overview", children: [
        /* @__PURE__ */ _.jsx(Dp, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ _.jsx("span", { children: "Materials" })
      ] }),
      /* @__PURE__ */ _.jsxs(de, { className: `focus-command-btn ${p("notes") ? "is-active" : ""}`.trim(), onClick: () => c("notes"), title: "Read generated notes", children: [
        /* @__PURE__ */ _.jsx(b1, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ _.jsx("span", { children: "Notes" })
      ] }),
      /* @__PURE__ */ _.jsxs(de, { className: `focus-command-btn ${p("sources") ? "is-active" : ""}`.trim(), onClick: () => c("sources"), title: "Open source highlights", children: [
        /* @__PURE__ */ _.jsx(Gl, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ _.jsx("span", { children: "Sources" })
      ] }),
      /* @__PURE__ */ _.jsxs(de, { className: `focus-command-btn ${p("chat") ? "is-active" : ""}`.trim(), onClick: () => c("chat"), title: "Open Study Suite", children: [
        /* @__PURE__ */ _.jsx(Su, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ _.jsx("span", { children: "Study Suite" })
      ] }),
      /* @__PURE__ */ _.jsxs(de, { className: `focus-command-btn ${p("history") ? "is-active" : ""}`.trim(), onClick: () => c("history"), title: "Open history", children: [
        /* @__PURE__ */ _.jsx(jp, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ _.jsx("span", { children: "History" })
      ] }),
      /* @__PURE__ */ _.jsxs(de, { className: "focus-command-btn", variant: "danger", onClick: f, title: "End focus session", children: [
        /* @__PURE__ */ _.jsx(M1, { size: 16, "aria-hidden": "true" }),
        " ",
        /* @__PURE__ */ _.jsx("span", { children: "End" })
      ] })
    ] })
  ] });
}
function M2({ audioState: t }) {
  const e = H((m) => m.audioPlaying), n = H((m) => m.toggleAudio), r = H((m) => m.pauseTimer), s = H((m) => m.resetTimer), a = H((m) => m.skipTimer), l = H((m) => m.endSession), c = H((m) => m.musicVolume), f = H((m) => m.ambientVolume);
  return /* @__PURE__ */ _.jsxs("div", { className: "bottom-dock liquid-glass", "aria-label": "Floating session controls", children: [
    /* @__PURE__ */ _.jsxs("span", { className: "dock-meter", children: [
      "Music ",
      c,
      "%"
    ] }),
    /* @__PURE__ */ _.jsxs("span", { className: "dock-meter", children: [
      "Ambient ",
      f,
      "%"
    ] }),
    /* @__PURE__ */ _.jsxs(de, { variant: e ? "primary" : "ghost", onClick: n, children: [
      e ? /* @__PURE__ */ _.jsx(gh, { size: 16, "aria-hidden": "true" }) : /* @__PURE__ */ _.jsx(C1, { size: 16, "aria-hidden": "true" }),
      t != null && t.playing ? "Pause" : "Audio"
    ] }),
    /* @__PURE__ */ _.jsxs(de, { onClick: () => r(), children: [
      /* @__PURE__ */ _.jsx(gh, { size: 16, "aria-hidden": "true" }),
      " Timer"
    ] }),
    /* @__PURE__ */ _.jsxs(de, { onClick: a, children: [
      /* @__PURE__ */ _.jsx(E1, { size: 16, "aria-hidden": "true" }),
      " Skip"
    ] }),
    /* @__PURE__ */ _.jsxs(de, { onClick: s, children: [
      /* @__PURE__ */ _.jsx(P1, { size: 16, "aria-hidden": "true" }),
      " Reset"
    ] }),
    /* @__PURE__ */ _.jsxs(de, { variant: "danger", onClick: l, children: [
      /* @__PURE__ */ _.jsx(M1, { size: 16, "aria-hidden": "true" }),
      " End"
    ] })
  ] });
}
var R2 = Oh[" useId ".trim().toString()] || (() => {
}), N2 = 0;
function Eo(t) {
  const [e, n] = P.useState(R2());
  return _s(() => {
    n((r) => r ?? String(N2++));
  }, [t]), t || (e ? `radix-${e}` : "");
}
function xs(t) {
  const e = P.useRef(t);
  return P.useEffect(() => {
    e.current = t;
  }), P.useMemo(() => ((...n) => {
    var r;
    return (r = e.current) == null ? void 0 : r.call(e, ...n);
  }), []);
}
function I2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = xs(t);
  P.useEffect(() => {
    const r = (s) => {
      s.key === "Escape" && n(s);
    };
    return e.addEventListener("keydown", r, { capture: !0 }), () => e.removeEventListener("keydown", r, { capture: !0 });
  }, [n, e]);
}
var D2 = "DismissableLayer", bh = "dismissableLayer.update", j2 = "dismissableLayer.pointerDownOutside", F2 = "dismissableLayer.focusOutside", J0, uw = P.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), cw = P.forwardRef(
  (t, e) => {
    const {
      disableOutsidePointerEvents: n = !1,
      onEscapeKeyDown: r,
      onPointerDownOutside: s,
      onFocusOutside: a,
      onInteractOutside: l,
      onDismiss: c,
      ...f
    } = t, m = P.useContext(uw), [g, d] = P.useState(null), p = (g == null ? void 0 : g.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, v] = P.useState({}), w = kt(e, (I) => d(I)), S = Array.from(m.layers), [T] = [...m.layersWithOutsidePointerEventsDisabled].slice(-1), A = S.indexOf(T), b = g ? S.indexOf(g) : -1, E = m.layersWithOutsidePointerEventsDisabled.size > 0, M = b >= A, C = z2((I) => {
      const O = I.target, L = [...m.branches].some((U) => U.contains(O));
      !M || L || (s == null || s(I), l == null || l(I), I.defaultPrevented || c == null || c());
    }, p), $ = $2((I) => {
      const O = I.target;
      [...m.branches].some((U) => U.contains(O)) || (a == null || a(I), l == null || l(I), I.defaultPrevented || c == null || c());
    }, p);
    return I2((I) => {
      b === m.layers.size - 1 && (r == null || r(I), !I.defaultPrevented && c && (I.preventDefault(), c()));
    }, p), P.useEffect(() => {
      if (g)
        return n && (m.layersWithOutsidePointerEventsDisabled.size === 0 && (J0 = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), m.layersWithOutsidePointerEventsDisabled.add(g)), m.layers.add(g), e_(), () => {
          n && (m.layersWithOutsidePointerEventsDisabled.delete(g), m.layersWithOutsidePointerEventsDisabled.size === 0 && (p.body.style.pointerEvents = J0));
        };
    }, [g, p, n, m]), P.useEffect(() => () => {
      g && (m.layers.delete(g), m.layersWithOutsidePointerEventsDisabled.delete(g), e_());
    }, [g, m]), P.useEffect(() => {
      const I = () => v({});
      return document.addEventListener(bh, I), () => document.removeEventListener(bh, I);
    }, []), /* @__PURE__ */ _.jsx(
      Je.div,
      {
        ...f,
        ref: w,
        style: {
          pointerEvents: E ? M ? "auto" : "none" : void 0,
          ...t.style
        },
        onFocusCapture: He(t.onFocusCapture, $.onFocusCapture),
        onBlurCapture: He(t.onBlurCapture, $.onBlurCapture),
        onPointerDownCapture: He(
          t.onPointerDownCapture,
          C.onPointerDownCapture
        )
      }
    );
  }
);
cw.displayName = D2;
var O2 = "DismissableLayerBranch", L2 = P.forwardRef((t, e) => {
  const n = P.useContext(uw), r = P.useRef(null), s = kt(e, r);
  return P.useEffect(() => {
    const a = r.current;
    if (a)
      return n.branches.add(a), () => {
        n.branches.delete(a);
      };
  }, [n.branches]), /* @__PURE__ */ _.jsx(Je.div, { ...t, ref: s });
});
L2.displayName = O2;
function z2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = xs(t), r = P.useRef(!1), s = P.useRef(() => {
  });
  return P.useEffect(() => {
    const a = (c) => {
      if (c.target && !r.current) {
        let f = function() {
          dw(
            j2,
            n,
            m,
            { discrete: !0 }
          );
        };
        const m = { originalEvent: c };
        c.pointerType === "touch" ? (e.removeEventListener("click", s.current), s.current = f, e.addEventListener("click", s.current, { once: !0 })) : f();
      } else
        e.removeEventListener("click", s.current);
      r.current = !1;
    }, l = window.setTimeout(() => {
      e.addEventListener("pointerdown", a);
    }, 0);
    return () => {
      window.clearTimeout(l), e.removeEventListener("pointerdown", a), e.removeEventListener("click", s.current);
    };
  }, [e, n]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => r.current = !0
  };
}
function $2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = xs(t), r = P.useRef(!1);
  return P.useEffect(() => {
    const s = (a) => {
      a.target && !r.current && dw(F2, n, { originalEvent: a }, {
        discrete: !1
      });
    };
    return e.addEventListener("focusin", s), () => e.removeEventListener("focusin", s);
  }, [e, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function e_() {
  const t = new CustomEvent(bh);
  document.dispatchEvent(t);
}
function dw(t, e, n, { discrete: r }) {
  const s = n.originalEvent.target, a = new CustomEvent(t, { bubbles: !1, cancelable: !0, detail: n });
  e && s.addEventListener(t, e, { once: !0 }), r ? u2(s, a) : s.dispatchEvent(a);
}
var pf = "focusScope.autoFocusOnMount", mf = "focusScope.autoFocusOnUnmount", t_ = { bubbles: !1, cancelable: !0 }, V2 = "FocusScope", fw = P.forwardRef((t, e) => {
  const {
    loop: n = !1,
    trapped: r = !1,
    onMountAutoFocus: s,
    onUnmountAutoFocus: a,
    ...l
  } = t, [c, f] = P.useState(null), m = xs(s), g = xs(a), d = P.useRef(null), p = kt(e, (S) => f(S)), v = P.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  P.useEffect(() => {
    if (r) {
      let S = function(E) {
        if (v.paused || !c) return;
        const M = E.target;
        c.contains(M) ? d.current = M : _r(d.current, { select: !0 });
      }, T = function(E) {
        if (v.paused || !c) return;
        const M = E.relatedTarget;
        M !== null && (c.contains(M) || _r(d.current, { select: !0 }));
      }, A = function(E) {
        if (document.activeElement === document.body)
          for (const C of E)
            C.removedNodes.length > 0 && _r(c);
      };
      document.addEventListener("focusin", S), document.addEventListener("focusout", T);
      const b = new MutationObserver(A);
      return c && b.observe(c, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", S), document.removeEventListener("focusout", T), b.disconnect();
      };
    }
  }, [r, c, v.paused]), P.useEffect(() => {
    if (c) {
      r_.add(v);
      const S = document.activeElement;
      if (!c.contains(S)) {
        const A = new CustomEvent(pf, t_);
        c.addEventListener(pf, m), c.dispatchEvent(A), A.defaultPrevented || (B2(G2(hw(c)), { select: !0 }), document.activeElement === S && _r(c));
      }
      return () => {
        c.removeEventListener(pf, m), setTimeout(() => {
          const A = new CustomEvent(mf, t_);
          c.addEventListener(mf, g), c.dispatchEvent(A), A.defaultPrevented || _r(S ?? document.body, { select: !0 }), c.removeEventListener(mf, g), r_.remove(v);
        }, 0);
      };
    }
  }, [c, m, g, v]);
  const w = P.useCallback(
    (S) => {
      if (!n && !r || v.paused) return;
      const T = S.key === "Tab" && !S.altKey && !S.ctrlKey && !S.metaKey, A = document.activeElement;
      if (T && A) {
        const b = S.currentTarget, [E, M] = U2(b);
        E && M ? !S.shiftKey && A === M ? (S.preventDefault(), n && _r(E, { select: !0 })) : S.shiftKey && A === E && (S.preventDefault(), n && _r(M, { select: !0 })) : A === b && S.preventDefault();
      }
    },
    [n, r, v.paused]
  );
  return /* @__PURE__ */ _.jsx(Je.div, { tabIndex: -1, ...l, ref: p, onKeyDown: w });
});
fw.displayName = V2;
function B2(t, { select: e = !1 } = {}) {
  const n = document.activeElement;
  for (const r of t)
    if (_r(r, { select: e }), document.activeElement !== n) return;
}
function U2(t) {
  const e = hw(t), n = n_(e, t), r = n_(e.reverse(), t);
  return [n, r];
}
function hw(t) {
  const e = [], n = document.createTreeWalker(t, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const s = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || s ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) e.push(n.currentNode);
  return e;
}
function n_(t, e) {
  for (const n of t)
    if (!H2(n, { upTo: e })) return n;
}
function H2(t, { upTo: e }) {
  if (getComputedStyle(t).visibility === "hidden") return !0;
  for (; t; ) {
    if (e !== void 0 && t === e) return !1;
    if (getComputedStyle(t).display === "none") return !0;
    t = t.parentElement;
  }
  return !1;
}
function W2(t) {
  return t instanceof HTMLInputElement && "select" in t;
}
function _r(t, { select: e = !1 } = {}) {
  if (t && t.focus) {
    const n = document.activeElement;
    t.focus({ preventScroll: !0 }), t !== n && W2(t) && e && t.select();
  }
}
var r_ = Z2();
function Z2() {
  let t = [];
  return {
    add(e) {
      const n = t[0];
      e !== n && (n == null || n.pause()), t = i_(t, e), t.unshift(e);
    },
    remove(e) {
      var n;
      t = i_(t, e), (n = t[0]) == null || n.resume();
    }
  };
}
function i_(t, e) {
  const n = [...t], r = n.indexOf(e);
  return r !== -1 && n.splice(r, 1), n;
}
function G2(t) {
  return t.filter((e) => e.tagName !== "A");
}
var K2 = "Portal", pw = P.forwardRef((t, e) => {
  var c;
  const { container: n, ...r } = t, [s, a] = P.useState(!1);
  _s(() => a(!0), []);
  const l = n || s && ((c = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : c.body);
  return l ? V1.createPortal(/* @__PURE__ */ _.jsx(Je.div, { ...r, ref: e }), l) : null;
});
pw.displayName = K2;
function Y2(t, e) {
  return P.useReducer((n, r) => e[n][r] ?? n, t);
}
var sa = (t) => {
  const { present: e, children: n } = t, r = q2(e), s = typeof n == "function" ? n({ present: r.isPresent }) : P.Children.only(n), a = Q2(r.ref, X2(s));
  return typeof n == "function" || r.isPresent ? P.cloneElement(s, { ref: a }) : null;
};
sa.displayName = "Presence";
function q2(t) {
  const [e, n] = P.useState(), r = P.useRef(null), s = P.useRef(t), a = P.useRef("none"), l = t ? "mounted" : "unmounted", [c, f] = Y2(l, {
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
  return P.useEffect(() => {
    const m = Cl(r.current);
    a.current = c === "mounted" ? m : "none";
  }, [c]), _s(() => {
    const m = r.current, g = s.current;
    if (g !== t) {
      const p = a.current, v = Cl(m);
      t ? f("MOUNT") : v === "none" || (m == null ? void 0 : m.display) === "none" ? f("UNMOUNT") : f(g && p !== v ? "ANIMATION_OUT" : "UNMOUNT"), s.current = t;
    }
  }, [t, f]), _s(() => {
    if (e) {
      let m;
      const g = e.ownerDocument.defaultView ?? window, d = (v) => {
        const S = Cl(r.current).includes(CSS.escape(v.animationName));
        if (v.target === e && S && (f("ANIMATION_END"), !s.current)) {
          const T = e.style.animationFillMode;
          e.style.animationFillMode = "forwards", m = g.setTimeout(() => {
            e.style.animationFillMode === "forwards" && (e.style.animationFillMode = T);
          });
        }
      }, p = (v) => {
        v.target === e && (a.current = Cl(r.current));
      };
      return e.addEventListener("animationstart", p), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d), () => {
        g.clearTimeout(m), e.removeEventListener("animationstart", p), e.removeEventListener("animationcancel", d), e.removeEventListener("animationend", d);
      };
    } else
      f("ANIMATION_END");
  }, [e, f]), {
    isPresent: ["mounted", "unmountSuspended"].includes(c),
    ref: P.useCallback((m) => {
      r.current = m ? getComputedStyle(m) : null, n(m);
    }, [])
  };
}
function s_(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function Q2(...t) {
  const e = P.useRef(t);
  return e.current = t, P.useCallback((n) => {
    const r = e.current;
    let s = !1;
    const a = r.map((l) => {
      const c = s_(l, n);
      return !s && typeof c == "function" && (s = !0), c;
    });
    if (s)
      return () => {
        for (let l = 0; l < a.length; l++) {
          const c = a[l];
          typeof c == "function" ? c() : s_(r[l], null);
        }
      };
  }, []);
}
function Cl(t) {
  return (t == null ? void 0 : t.animationName) || "none";
}
function X2(t) {
  var r, s;
  let e = (r = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : r.get, n = e && "isReactWarning" in e && e.isReactWarning;
  return n ? t.ref : (e = (s = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : s.get, n = e && "isReactWarning" in e && e.isReactWarning, n ? t.props.ref : t.props.ref || t.ref);
}
var Pl = 0, Cn = null;
function J2() {
  P.useEffect(() => {
    Cn || (Cn = { start: o_(), end: o_() });
    const { start: t, end: e } = Cn;
    return document.body.firstElementChild !== t && document.body.insertAdjacentElement("afterbegin", t), document.body.lastElementChild !== e && document.body.insertAdjacentElement("beforeend", e), Pl++, () => {
      Pl === 1 && (Cn == null || Cn.start.remove(), Cn == null || Cn.end.remove(), Cn = null), Pl = Math.max(0, Pl - 1);
    };
  }, []);
}
function o_() {
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
function mw(t, e) {
  var n = {};
  for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, r = Object.getOwnPropertySymbols(t); s < r.length; s++)
      e.indexOf(r[s]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[s]) && (n[r[s]] = t[r[s]]);
  return n;
}
function eD(t, e, n) {
  if (n || arguments.length === 2) for (var r = 0, s = e.length, a; r < s; r++)
    (a || !(r in e)) && (a || (a = Array.prototype.slice.call(e, 0, r)), a[r] = e[r]);
  return t.concat(a || Array.prototype.slice.call(e));
}
var Yl = "right-scroll-bar-position", ql = "width-before-scroll-bar", tD = "with-scroll-bars-hidden", nD = "--removed-body-scroll-bar-size";
function gf(t, e) {
  return typeof t == "function" ? t(e) : t && (t.current = e), t;
}
function rD(t, e) {
  var n = P.useState(function() {
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
var iD = typeof window < "u" ? P.useLayoutEffect : P.useEffect, a_ = /* @__PURE__ */ new WeakMap();
function sD(t, e) {
  var n = rD(null, function(r) {
    return t.forEach(function(s) {
      return gf(s, r);
    });
  });
  return iD(function() {
    var r = a_.get(n);
    if (r) {
      var s = new Set(r), a = new Set(t), l = n.current;
      s.forEach(function(c) {
        a.has(c) || gf(c, null);
      }), a.forEach(function(c) {
        s.has(c) || gf(c, l);
      });
    }
    a_.set(n, t);
  }, [t]), n;
}
function oD(t) {
  return t;
}
function aD(t, e) {
  e === void 0 && (e = oD);
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
function lD(t) {
  t === void 0 && (t = {});
  var e = aD(null);
  return e.options = Nn({ async: !0, ssr: !1 }, t), e;
}
var gw = function(t) {
  var e = t.sideCar, n = mw(t, ["sideCar"]);
  if (!e)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = e.read();
  if (!r)
    throw new Error("Sidecar medium not found");
  return P.createElement(r, Nn({}, n));
};
gw.isSideCarExport = !0;
function uD(t, e) {
  return t.useMedium(e), gw;
}
var yw = lD(), yf = function() {
}, zu = P.forwardRef(function(t, e) {
  var n = P.useRef(null), r = P.useState({
    onScrollCapture: yf,
    onWheelCapture: yf,
    onTouchMoveCapture: yf
  }), s = r[0], a = r[1], l = t.forwardProps, c = t.children, f = t.className, m = t.removeScrollBar, g = t.enabled, d = t.shards, p = t.sideCar, v = t.noRelative, w = t.noIsolation, S = t.inert, T = t.allowPinchZoom, A = t.as, b = A === void 0 ? "div" : A, E = t.gapMode, M = mw(t, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), C = p, $ = sD([n, e]), I = Nn(Nn({}, M), s);
  return P.createElement(
    P.Fragment,
    null,
    g && P.createElement(C, { sideCar: yw, removeScrollBar: m, shards: d, noRelative: v, noIsolation: w, inert: S, setCallbacks: a, allowPinchZoom: !!T, lockRef: n, gapMode: E }),
    l ? P.cloneElement(P.Children.only(c), Nn(Nn({}, I), { ref: $ })) : P.createElement(b, Nn({}, I, { className: f, ref: $ }), c)
  );
});
zu.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
zu.classNames = {
  fullWidth: ql,
  zeroRight: Yl
};
var cD = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function dD() {
  if (!document)
    return null;
  var t = document.createElement("style");
  t.type = "text/css";
  var e = cD();
  return e && t.setAttribute("nonce", e), t;
}
function fD(t, e) {
  t.styleSheet ? t.styleSheet.cssText = e : t.appendChild(document.createTextNode(e));
}
function hD(t) {
  var e = document.head || document.getElementsByTagName("head")[0];
  e.appendChild(t);
}
var pD = function() {
  var t = 0, e = null;
  return {
    add: function(n) {
      t == 0 && (e = dD()) && (fD(e, n), hD(e)), t++;
    },
    remove: function() {
      t--, !t && e && (e.parentNode && e.parentNode.removeChild(e), e = null);
    }
  };
}, mD = function() {
  var t = pD();
  return function(e, n) {
    P.useEffect(function() {
      return t.add(e), function() {
        t.remove();
      };
    }, [e && n]);
  };
}, vw = function() {
  var t = mD(), e = function(n) {
    var r = n.styles, s = n.dynamic;
    return t(r, s), null;
  };
  return e;
}, gD = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, vf = function(t) {
  return parseInt(t || "", 10) || 0;
}, yD = function(t) {
  var e = window.getComputedStyle(document.body), n = e[t === "padding" ? "paddingLeft" : "marginLeft"], r = e[t === "padding" ? "paddingTop" : "marginTop"], s = e[t === "padding" ? "paddingRight" : "marginRight"];
  return [vf(n), vf(r), vf(s)];
}, vD = function(t) {
  if (t === void 0 && (t = "margin"), typeof window > "u")
    return gD;
  var e = yD(t), n = document.documentElement.clientWidth, r = window.innerWidth;
  return {
    left: e[0],
    top: e[1],
    right: e[2],
    gap: Math.max(0, r - n + e[2] - e[0])
  };
}, _D = vw(), os = "data-scroll-locked", xD = function(t, e, n, r) {
  var s = t.left, a = t.top, l = t.right, c = t.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(tD, ` {
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
  
  .`).concat(Yl, ` {
    right: `).concat(c, "px ").concat(r, `;
  }
  
  .`).concat(ql, ` {
    margin-right: `).concat(c, "px ").concat(r, `;
  }
  
  .`).concat(Yl, " .").concat(Yl, ` {
    right: 0 `).concat(r, `;
  }
  
  .`).concat(ql, " .").concat(ql, ` {
    margin-right: 0 `).concat(r, `;
  }
  
  body[`).concat(os, `] {
    `).concat(nD, ": ").concat(c, `px;
  }
`);
}, l_ = function() {
  var t = parseInt(document.body.getAttribute(os) || "0", 10);
  return isFinite(t) ? t : 0;
}, SD = function() {
  P.useEffect(function() {
    return document.body.setAttribute(os, (l_() + 1).toString()), function() {
      var t = l_() - 1;
      t <= 0 ? document.body.removeAttribute(os) : document.body.setAttribute(os, t.toString());
    };
  }, []);
}, wD = function(t) {
  var e = t.noRelative, n = t.noImportant, r = t.gapMode, s = r === void 0 ? "margin" : r;
  SD();
  var a = P.useMemo(function() {
    return vD(s);
  }, [s]);
  return P.createElement(_D, { styles: xD(a, !e, s, n ? "" : "!important") });
}, Ch = !1;
if (typeof window < "u")
  try {
    var El = Object.defineProperty({}, "passive", {
      get: function() {
        return Ch = !0, !0;
      }
    });
    window.addEventListener("test", El, El), window.removeEventListener("test", El, El);
  } catch {
    Ch = !1;
  }
var $i = Ch ? { passive: !1 } : !1, TD = function(t) {
  return t.tagName === "TEXTAREA";
}, _w = function(t, e) {
  if (!(t instanceof Element))
    return !1;
  var n = window.getComputedStyle(t);
  return (
    // not-not-scrollable
    n[e] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !TD(t) && n[e] === "visible")
  );
}, AD = function(t) {
  return _w(t, "overflowY");
}, kD = function(t) {
  return _w(t, "overflowX");
}, u_ = function(t, e) {
  var n = e.ownerDocument, r = e;
  do {
    typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
    var s = xw(t, r);
    if (s) {
      var a = Sw(t, r), l = a[1], c = a[2];
      if (l > c)
        return !0;
    }
    r = r.parentNode;
  } while (r && r !== n.body);
  return !1;
}, bD = function(t) {
  var e = t.scrollTop, n = t.scrollHeight, r = t.clientHeight;
  return [
    e,
    n,
    r
  ];
}, CD = function(t) {
  var e = t.scrollLeft, n = t.scrollWidth, r = t.clientWidth;
  return [
    e,
    n,
    r
  ];
}, xw = function(t, e) {
  return t === "v" ? AD(e) : kD(e);
}, Sw = function(t, e) {
  return t === "v" ? bD(e) : CD(e);
}, PD = function(t, e) {
  return t === "h" && e === "rtl" ? -1 : 1;
}, ED = function(t, e, n, r, s) {
  var a = PD(t, window.getComputedStyle(e).direction), l = a * r, c = n.target, f = e.contains(c), m = !1, g = l > 0, d = 0, p = 0;
  do {
    if (!c)
      break;
    var v = Sw(t, c), w = v[0], S = v[1], T = v[2], A = S - T - a * w;
    (w || A) && xw(t, c) && (d += A, p += w);
    var b = c.parentNode;
    c = b && b.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? b.host : b;
  } while (
    // portaled content
    !f && c !== document.body || // self content
    f && (e.contains(c) || e === c)
  );
  return (g && Math.abs(d) < 1 || !g && Math.abs(p) < 1) && (m = !0), m;
}, Ml = function(t) {
  return "changedTouches" in t ? [t.changedTouches[0].clientX, t.changedTouches[0].clientY] : [0, 0];
}, c_ = function(t) {
  return [t.deltaX, t.deltaY];
}, d_ = function(t) {
  return t && "current" in t ? t.current : t;
}, MD = function(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}, RD = function(t) {
  return `
  .block-interactivity-`.concat(t, ` {pointer-events: none;}
  .allow-interactivity-`).concat(t, ` {pointer-events: all;}
`);
}, ND = 0, Vi = [];
function ID(t) {
  var e = P.useRef([]), n = P.useRef([0, 0]), r = P.useRef(), s = P.useState(ND++)[0], a = P.useState(vw)[0], l = P.useRef(t);
  P.useEffect(function() {
    l.current = t;
  }, [t]), P.useEffect(function() {
    if (t.inert) {
      document.body.classList.add("block-interactivity-".concat(s));
      var S = eD([t.lockRef.current], (t.shards || []).map(d_), !0).filter(Boolean);
      return S.forEach(function(T) {
        return T.classList.add("allow-interactivity-".concat(s));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(s)), S.forEach(function(T) {
          return T.classList.remove("allow-interactivity-".concat(s));
        });
      };
    }
  }, [t.inert, t.lockRef.current, t.shards]);
  var c = P.useCallback(function(S, T) {
    if ("touches" in S && S.touches.length === 2 || S.type === "wheel" && S.ctrlKey)
      return !l.current.allowPinchZoom;
    var A = Ml(S), b = n.current, E = "deltaX" in S ? S.deltaX : b[0] - A[0], M = "deltaY" in S ? S.deltaY : b[1] - A[1], C, $ = S.target, I = Math.abs(E) > Math.abs(M) ? "h" : "v";
    if ("touches" in S && I === "h" && $.type === "range")
      return !1;
    var O = window.getSelection(), L = O && O.anchorNode, U = L ? L === $ || L.contains($) : !1;
    if (U)
      return !1;
    var q = u_(I, $);
    if (!q)
      return !0;
    if (q ? C = I : (C = I === "v" ? "h" : "v", q = u_(I, $)), !q)
      return !1;
    if (!r.current && "changedTouches" in S && (E || M) && (r.current = C), !C)
      return !0;
    var ee = r.current || C;
    return ED(ee, T, S, ee === "h" ? E : M);
  }, []), f = P.useCallback(function(S) {
    var T = S;
    if (!(!Vi.length || Vi[Vi.length - 1] !== a)) {
      var A = "deltaY" in T ? c_(T) : Ml(T), b = e.current.filter(function(C) {
        return C.name === T.type && (C.target === T.target || T.target === C.shadowParent) && MD(C.delta, A);
      })[0];
      if (b && b.should) {
        T.cancelable && T.preventDefault();
        return;
      }
      if (!b) {
        var E = (l.current.shards || []).map(d_).filter(Boolean).filter(function(C) {
          return C.contains(T.target);
        }), M = E.length > 0 ? c(T, E[0]) : !l.current.noIsolation;
        M && T.cancelable && T.preventDefault();
      }
    }
  }, []), m = P.useCallback(function(S, T, A, b) {
    var E = { name: S, delta: T, target: A, should: b, shadowParent: DD(A) };
    e.current.push(E), setTimeout(function() {
      e.current = e.current.filter(function(M) {
        return M !== E;
      });
    }, 1);
  }, []), g = P.useCallback(function(S) {
    n.current = Ml(S), r.current = void 0;
  }, []), d = P.useCallback(function(S) {
    m(S.type, c_(S), S.target, c(S, t.lockRef.current));
  }, []), p = P.useCallback(function(S) {
    m(S.type, Ml(S), S.target, c(S, t.lockRef.current));
  }, []);
  P.useEffect(function() {
    return Vi.push(a), t.setCallbacks({
      onScrollCapture: d,
      onWheelCapture: d,
      onTouchMoveCapture: p
    }), document.addEventListener("wheel", f, $i), document.addEventListener("touchmove", f, $i), document.addEventListener("touchstart", g, $i), function() {
      Vi = Vi.filter(function(S) {
        return S !== a;
      }), document.removeEventListener("wheel", f, $i), document.removeEventListener("touchmove", f, $i), document.removeEventListener("touchstart", g, $i);
    };
  }, []);
  var v = t.removeScrollBar, w = t.inert;
  return P.createElement(
    P.Fragment,
    null,
    w ? P.createElement(a, { styles: RD(s) }) : null,
    v ? P.createElement(wD, { noRelative: t.noRelative, gapMode: t.gapMode }) : null
  );
}
function DD(t) {
  for (var e = null; t !== null; )
    t instanceof ShadowRoot && (e = t.host, t = t.host), t = t.parentNode;
  return e;
}
const jD = uD(yw, ID);
var ww = P.forwardRef(function(t, e) {
  return P.createElement(zu, Nn({}, t, { ref: e, sideCar: jD }));
});
ww.classNames = zu.classNames;
var FD = function(t) {
  if (typeof document > "u")
    return null;
  var e = Array.isArray(t) ? t[0] : t;
  return e.ownerDocument.body;
}, Bi = /* @__PURE__ */ new WeakMap(), Rl = /* @__PURE__ */ new WeakMap(), Nl = {}, _f = 0, Tw = function(t) {
  return t && (t.host || Tw(t.parentNode));
}, OD = function(t, e) {
  return e.map(function(n) {
    if (t.contains(n))
      return n;
    var r = Tw(n);
    return r && t.contains(r) ? r : (console.error("aria-hidden", n, "in not contained inside", t, ". Doing nothing"), null);
  }).filter(function(n) {
    return !!n;
  });
}, LD = function(t, e, n, r) {
  var s = OD(e, Array.isArray(t) ? t : [t]);
  Nl[n] || (Nl[n] = /* @__PURE__ */ new WeakMap());
  var a = Nl[n], l = [], c = /* @__PURE__ */ new Set(), f = new Set(s), m = function(d) {
    !d || c.has(d) || (c.add(d), m(d.parentNode));
  };
  s.forEach(m);
  var g = function(d) {
    !d || f.has(d) || Array.prototype.forEach.call(d.children, function(p) {
      if (c.has(p))
        g(p);
      else
        try {
          var v = p.getAttribute(r), w = v !== null && v !== "false", S = (Bi.get(p) || 0) + 1, T = (a.get(p) || 0) + 1;
          Bi.set(p, S), a.set(p, T), l.push(p), S === 1 && w && Rl.set(p, !0), T === 1 && p.setAttribute(n, "true"), w || p.setAttribute(r, "true");
        } catch (A) {
          console.error("aria-hidden: cannot operate on ", p, A);
        }
    });
  };
  return g(e), c.clear(), _f++, function() {
    l.forEach(function(d) {
      var p = Bi.get(d) - 1, v = a.get(d) - 1;
      Bi.set(d, p), a.set(d, v), p || (Rl.has(d) || d.removeAttribute(r), Rl.delete(d)), v || d.removeAttribute(n);
    }), _f--, _f || (Bi = /* @__PURE__ */ new WeakMap(), Bi = /* @__PURE__ */ new WeakMap(), Rl = /* @__PURE__ */ new WeakMap(), Nl = {});
  };
}, zD = function(t, e, n) {
  n === void 0 && (n = "data-aria-hidden");
  var r = Array.from(Array.isArray(t) ? t : [t]), s = FD(t);
  return s ? (r.push.apply(r, Array.from(s.querySelectorAll("[aria-live], script"))), LD(r, s, n, "aria-hidden")) : function() {
    return null;
  };
}, $u = "Dialog", [Aw] = ra($u), [$D, Sn] = Aw($u), kw = (t) => {
  const {
    __scopeDialog: e,
    children: n,
    open: r,
    defaultOpen: s,
    onOpenChange: a,
    modal: l = !0
  } = t, c = P.useRef(null), f = P.useRef(null), [m, g] = Lu({
    prop: r,
    defaultProp: s ?? !1,
    onChange: a,
    caller: $u
  });
  return /* @__PURE__ */ _.jsx(
    $D,
    {
      scope: e,
      triggerRef: c,
      contentRef: f,
      contentId: Eo(),
      titleId: Eo(),
      descriptionId: Eo(),
      open: m,
      onOpenChange: g,
      onOpenToggle: P.useCallback(() => g((d) => !d), [g]),
      modal: l,
      children: n
    }
  );
};
kw.displayName = $u;
var bw = "DialogTrigger", VD = P.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Sn(bw, n), a = kt(e, s.triggerRef);
    return /* @__PURE__ */ _.jsx(
      Je.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": s.open,
        "aria-controls": s.open ? s.contentId : void 0,
        "data-state": Wp(s.open),
        ...r,
        ref: a,
        onClick: He(t.onClick, s.onOpenToggle)
      }
    );
  }
);
VD.displayName = bw;
var Up = "DialogPortal", [BD, Cw] = Aw(Up, {
  forceMount: void 0
}), Pw = (t) => {
  const { __scopeDialog: e, forceMount: n, children: r, container: s } = t, a = Sn(Up, e);
  return /* @__PURE__ */ _.jsx(BD, { scope: e, forceMount: n, children: P.Children.map(r, (l) => /* @__PURE__ */ _.jsx(sa, { present: n || a.open, children: /* @__PURE__ */ _.jsx(pw, { asChild: !0, container: s, children: l }) })) });
};
Pw.displayName = Up;
var ku = "DialogOverlay", Ew = P.forwardRef(
  (t, e) => {
    const n = Cw(ku, t.__scopeDialog), { forceMount: r = n.forceMount, ...s } = t, a = Sn(ku, t.__scopeDialog);
    return a.modal ? /* @__PURE__ */ _.jsx(sa, { present: r || a.open, children: /* @__PURE__ */ _.jsx(HD, { ...s, ref: e }) }) : null;
  }
);
Ew.displayName = ku;
var UD = /* @__PURE__ */ Au("DialogOverlay.RemoveScroll"), HD = P.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Sn(ku, n);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ _.jsx(ww, { as: UD, allowPinchZoom: !0, shards: [s.contentRef], children: /* @__PURE__ */ _.jsx(
        Je.div,
        {
          "data-state": Wp(s.open),
          ...r,
          ref: e,
          style: { pointerEvents: "auto", ...r.style }
        }
      ) })
    );
  }
), di = "DialogContent", Mw = P.forwardRef(
  (t, e) => {
    const n = Cw(di, t.__scopeDialog), { forceMount: r = n.forceMount, ...s } = t, a = Sn(di, t.__scopeDialog);
    return /* @__PURE__ */ _.jsx(sa, { present: r || a.open, children: a.modal ? /* @__PURE__ */ _.jsx(WD, { ...s, ref: e }) : /* @__PURE__ */ _.jsx(ZD, { ...s, ref: e }) });
  }
);
Mw.displayName = di;
var WD = P.forwardRef(
  (t, e) => {
    const n = Sn(di, t.__scopeDialog), r = P.useRef(null), s = kt(e, n.contentRef, r);
    return P.useEffect(() => {
      const a = r.current;
      if (a) return zD(a);
    }, []), /* @__PURE__ */ _.jsx(
      Rw,
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
), ZD = P.forwardRef(
  (t, e) => {
    const n = Sn(di, t.__scopeDialog), r = P.useRef(!1), s = P.useRef(!1);
    return /* @__PURE__ */ _.jsx(
      Rw,
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
), Rw = P.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: s, onCloseAutoFocus: a, ...l } = t, c = Sn(di, n), f = P.useRef(null), m = kt(e, f);
    return J2(), /* @__PURE__ */ _.jsxs(_.Fragment, { children: [
      /* @__PURE__ */ _.jsx(
        fw,
        {
          asChild: !0,
          loop: !0,
          trapped: r,
          onMountAutoFocus: s,
          onUnmountAutoFocus: a,
          children: /* @__PURE__ */ _.jsx(
            cw,
            {
              role: "dialog",
              id: c.contentId,
              "aria-describedby": c.descriptionId,
              "aria-labelledby": c.titleId,
              "data-state": Wp(c.open),
              ...l,
              ref: m,
              onDismiss: () => c.onOpenChange(!1)
            }
          )
        }
      ),
      /* @__PURE__ */ _.jsxs(_.Fragment, { children: [
        /* @__PURE__ */ _.jsx(GD, { titleId: c.titleId }),
        /* @__PURE__ */ _.jsx(YD, { contentRef: f, descriptionId: c.descriptionId })
      ] })
    ] });
  }
), Hp = "DialogTitle", Nw = P.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Sn(Hp, n);
    return /* @__PURE__ */ _.jsx(Je.h2, { id: s.titleId, ...r, ref: e });
  }
);
Nw.displayName = Hp;
var Iw = "DialogDescription", Dw = P.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Sn(Iw, n);
    return /* @__PURE__ */ _.jsx(Je.p, { id: s.descriptionId, ...r, ref: e });
  }
);
Dw.displayName = Iw;
var jw = "DialogClose", Fw = P.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Sn(jw, n);
    return /* @__PURE__ */ _.jsx(
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
Fw.displayName = jw;
function Wp(t) {
  return t ? "open" : "closed";
}
var Ow = "DialogTitleWarning", [PO, Lw] = WI(Ow, {
  contentName: di,
  titleName: Hp,
  docsSlug: "dialog"
}), GD = ({ titleId: t }) => {
  const e = Lw(Ow), n = `\`${e.contentName}\` requires a \`${e.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${e.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${e.docsSlug}`;
  return P.useEffect(() => {
    t && (document.getElementById(t) || console.error(n));
  }, [n, t]), null;
}, KD = "DialogDescriptionWarning", YD = ({ contentRef: t, descriptionId: e }) => {
  const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${Lw(KD).contentName}}.`;
  return P.useEffect(() => {
    var a;
    const s = (a = t.current) == null ? void 0 : a.getAttribute("aria-describedby");
    e && s && (document.getElementById(e) || console.warn(r));
  }, [r, t, e]), null;
}, zw = kw, $w = Pw, Vw = Ew, Bw = Mw, Uw = Nw, Hw = Dw, qD = Fw, xf = "rovingFocusGroup.onEntryFocus", QD = { bubbles: !1, cancelable: !0 }, oa = "RovingFocusGroup", [Ph, Ww, XD] = B1(oa), [JD, Zw] = ra(
  oa,
  [XD]
), [ej, tj] = JD(oa), Gw = P.forwardRef(
  (t, e) => /* @__PURE__ */ _.jsx(Ph.Provider, { scope: t.__scopeRovingFocusGroup, children: /* @__PURE__ */ _.jsx(Ph.Slot, { scope: t.__scopeRovingFocusGroup, children: /* @__PURE__ */ _.jsx(nj, { ...t, ref: e }) }) })
);
Gw.displayName = oa;
var nj = P.forwardRef((t, e) => {
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
  } = t, p = P.useRef(null), v = kt(e, p), w = $p(a), [S, T] = Lu({
    prop: l,
    defaultProp: c ?? null,
    onChange: f,
    caller: oa
  }), [A, b] = P.useState(!1), E = xs(m), M = Ww(n), C = P.useRef(!1), [$, I] = P.useState(0);
  return P.useEffect(() => {
    const O = p.current;
    if (O)
      return O.addEventListener(xf, E), () => O.removeEventListener(xf, E);
  }, [E]), /* @__PURE__ */ _.jsx(
    ej,
    {
      scope: n,
      orientation: r,
      dir: w,
      loop: s,
      currentTabStopId: S,
      onItemFocus: P.useCallback(
        (O) => T(O),
        [T]
      ),
      onItemShiftTab: P.useCallback(() => b(!0), []),
      onFocusableItemAdd: P.useCallback(
        () => I((O) => O + 1),
        []
      ),
      onFocusableItemRemove: P.useCallback(
        () => I((O) => O - 1),
        []
      ),
      children: /* @__PURE__ */ _.jsx(
        Je.div,
        {
          tabIndex: A || $ === 0 ? -1 : 0,
          "data-orientation": r,
          ...d,
          ref: v,
          style: { outline: "none", ...t.style },
          onMouseDown: He(t.onMouseDown, () => {
            C.current = !0;
          }),
          onFocus: He(t.onFocus, (O) => {
            const L = !C.current;
            if (O.target === O.currentTarget && L && !A) {
              const U = new CustomEvent(xf, QD);
              if (O.currentTarget.dispatchEvent(U), !U.defaultPrevented) {
                const q = M().filter((ce) => ce.focusable), ee = q.find((ce) => ce.active), ne = q.find((ce) => ce.id === S), ge = [ee, ne, ...q].filter(
                  Boolean
                ).map((ce) => ce.ref.current);
                qw(ge, g);
              }
            }
            C.current = !1;
          }),
          onBlur: He(t.onBlur, () => b(!1))
        }
      )
    }
  );
}), Kw = "RovingFocusGroupItem", Yw = P.forwardRef(
  (t, e) => {
    const {
      __scopeRovingFocusGroup: n,
      focusable: r = !0,
      active: s = !1,
      tabStopId: a,
      children: l,
      ...c
    } = t, f = Eo(), m = a || f, g = tj(Kw, n), d = g.currentTabStopId === m, p = Ww(n), { onFocusableItemAdd: v, onFocusableItemRemove: w, currentTabStopId: S } = g;
    return P.useEffect(() => {
      if (r)
        return v(), () => w();
    }, [r, v, w]), /* @__PURE__ */ _.jsx(
      Ph.ItemSlot,
      {
        scope: n,
        id: m,
        focusable: r,
        active: s,
        children: /* @__PURE__ */ _.jsx(
          Je.span,
          {
            tabIndex: d ? 0 : -1,
            "data-orientation": g.orientation,
            ...c,
            ref: e,
            onMouseDown: He(t.onMouseDown, (T) => {
              r ? g.onItemFocus(m) : T.preventDefault();
            }),
            onFocus: He(t.onFocus, () => g.onItemFocus(m)),
            onKeyDown: He(t.onKeyDown, (T) => {
              if (T.key === "Tab" && T.shiftKey) {
                g.onItemShiftTab();
                return;
              }
              if (T.target !== T.currentTarget) return;
              const A = sj(T, g.orientation, g.dir);
              if (A !== void 0) {
                if (T.metaKey || T.ctrlKey || T.altKey || T.shiftKey) return;
                T.preventDefault();
                let E = p().filter((M) => M.focusable).map((M) => M.ref.current);
                if (A === "last") E.reverse();
                else if (A === "prev" || A === "next") {
                  A === "prev" && E.reverse();
                  const M = E.indexOf(T.currentTarget);
                  E = g.loop ? oj(E, M + 1) : E.slice(M + 1);
                }
                setTimeout(() => qw(E));
              }
            }),
            children: typeof l == "function" ? l({ isCurrentTabStop: d, hasTabStop: S != null }) : l
          }
        )
      }
    );
  }
);
Yw.displayName = Kw;
var rj = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function ij(t, e) {
  return e !== "rtl" ? t : t === "ArrowLeft" ? "ArrowRight" : t === "ArrowRight" ? "ArrowLeft" : t;
}
function sj(t, e, n) {
  const r = ij(t.key, n);
  if (!(e === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(e === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r)))
    return rj[r];
}
function qw(t, e = !1) {
  const n = document.activeElement;
  for (const r of t)
    if (r === n || (r.focus({ preventScroll: e }), document.activeElement !== n)) return;
}
function oj(t, e) {
  return t.map((n, r) => t[(e + r) % t.length]);
}
var aj = Gw, lj = Yw, Vu = "Tabs", [uj] = ra(Vu, [
  Zw
]), Qw = Zw(), [cj, Zp] = uj(Vu), Xw = P.forwardRef(
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
    } = t, g = $p(c), [d, p] = Lu({
      prop: r,
      onChange: s,
      defaultProp: a ?? "",
      caller: Vu
    });
    return /* @__PURE__ */ _.jsx(
      cj,
      {
        scope: n,
        baseId: Eo(),
        value: d,
        onValueChange: p,
        orientation: l,
        dir: g,
        activationMode: f,
        children: /* @__PURE__ */ _.jsx(
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
Xw.displayName = Vu;
var Jw = "TabsList", eT = P.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, loop: r = !0, ...s } = t, a = Zp(Jw, n), l = Qw(n);
    return /* @__PURE__ */ _.jsx(
      aj,
      {
        asChild: !0,
        ...l,
        orientation: a.orientation,
        dir: a.dir,
        loop: r,
        children: /* @__PURE__ */ _.jsx(
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
eT.displayName = Jw;
var tT = "TabsTrigger", nT = P.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, value: r, disabled: s = !1, ...a } = t, l = Zp(tT, n), c = Qw(n), f = sT(l.baseId, r), m = oT(l.baseId, r), g = r === l.value;
    return /* @__PURE__ */ _.jsx(
      lj,
      {
        asChild: !0,
        ...c,
        focusable: !s,
        active: g,
        children: /* @__PURE__ */ _.jsx(
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
              [" ", "Enter"].includes(d.key) && l.onValueChange(r);
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
nT.displayName = tT;
var rT = "TabsContent", iT = P.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, value: r, forceMount: s, children: a, ...l } = t, c = Zp(rT, n), f = sT(c.baseId, r), m = oT(c.baseId, r), g = r === c.value, d = P.useRef(g);
    return P.useEffect(() => {
      const p = requestAnimationFrame(() => d.current = !1);
      return () => cancelAnimationFrame(p);
    }, []), /* @__PURE__ */ _.jsx(sa, { present: s || g, children: ({ present: p }) => /* @__PURE__ */ _.jsx(
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
iT.displayName = rT;
function sT(t, e) {
  return `${t}-trigger-${e}`;
}
function oT(t, e) {
  return `${t}-content-${e}`;
}
var dj = Xw, fj = eT, hj = nT, pj = iT;
const Ql = /* @__PURE__ */ new Map(), Xl = /* @__PURE__ */ new Map(), Ji = /* @__PURE__ */ new Map(), Sf = /* @__PURE__ */ new Map();
function aT(t) {
  return JSON.stringify(Array.isArray(t) ? t : [t]);
}
function mj(t) {
  const e = typeof t == "function" ? t() : t;
  return {
    data: e,
    error: null,
    hasFetched: !1,
    isFetching: !1,
    isPending: e === void 0
  };
}
function Mo(t, e) {
  return Ql.has(t) || Ql.set(t, mj(e)), Ql.get(t);
}
function wf(t, e) {
  var r;
  const n = {
    ...Mo(t),
    ...e
  };
  return Ql.set(t, n), (r = Xl.get(t)) == null || r.forEach((s) => s(n)), n;
}
function gj(t, e) {
  const n = Xl.get(t) || /* @__PURE__ */ new Set();
  return n.add(e), Xl.set(t, n), () => {
    n.delete(e), n.size || Xl.delete(t);
  };
}
function yj(t, e) {
  const n = Symbol(t);
  Sf.set(t, n);
  const r = Mo(t);
  wf(t, {
    error: null,
    isFetching: !0,
    isPending: r.data === void 0
  }), Promise.resolve().then(e).then((s) => {
    Sf.get(t) === n && wf(t, {
      data: s,
      error: null,
      hasFetched: !0,
      isFetching: !1,
      isPending: !1
    });
  }).catch((s) => {
    Sf.get(t) === n && wf(t, {
      error: s instanceof Error ? s : new Error(String(s)),
      hasFetched: !0,
      isFetching: !1,
      isPending: !1
    });
  });
}
const vj = {
  invalidateQueries({ queryKey: t } = {}) {
    var e;
    if (!t) {
      Ji.forEach((n) => n());
      return;
    }
    (e = Ji.get(aT(t))) == null || e();
  }
};
function lT({ queryKey: t, queryFn: e, initialData: n }) {
  const r = P.useMemo(() => aT(t), [t]), s = P.useRef(e);
  s.current = e;
  const [a, l] = P.useState(() => Mo(r, n));
  return P.useEffect(() => (l(Mo(r, n)), gj(r, l)), [r]), P.useEffect(() => {
    const c = () => yj(r, () => s.current());
    return Ji.set(r, c), Mo(r, n).hasFetched || c(), () => {
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
function _j() {
  return vj;
}
function uT() {
  return lT({
    queryKey: ["focus-room", "sessions"],
    queryFn: () => dR()
  });
}
const xj = [
  "Explain this topic more simply.",
  "Test me on this section.",
  "What should I study next?"
];
function Sj() {
  const [t, e] = P.useState(""), n = H((f) => f.assistantContext), r = H((f) => f.chatMessages), s = H((f) => f.chatPending), a = H((f) => f.chatError), l = H((f) => f.askAssistant), c = (f) => {
    l(f), e("");
  };
  return /* @__PURE__ */ _.jsxs("article", { className: "chat-panel", children: [
    n.sectionTitle || n.excerpt ? /* @__PURE__ */ _.jsxs("div", { className: "chat-context-card liquid-glass-lite", children: [
      /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Current focus" }),
      /* @__PURE__ */ _.jsx("strong", { children: n.sectionTitle || "Selected excerpt" }),
      n.excerpt ? /* @__PURE__ */ _.jsx("p", { children: n.excerpt.slice(0, 240) }) : null
    ] }) : null,
    /* @__PURE__ */ _.jsxs("div", { className: "chat-list", children: [
      r.length ? r.map((f, m) => /* @__PURE__ */ _.jsxs("div", { className: `chat-message ${f.role}`, children: [
        /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: f.role === "user" ? "You" : "Synapse" }),
        /* @__PURE__ */ _.jsx("p", { children: f.text })
      ] }, `${f.createdAt}-${m}`)) : /* @__PURE__ */ _.jsx("p", { children: "Try: Explain this topic more simply." }),
      s ? /* @__PURE__ */ _.jsxs("div", { className: "chat-message assistant", children: [
        /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Synapse" }),
        /* @__PURE__ */ _.jsx("p", { children: "Thinking..." })
      ] }) : null
    ] }),
    a ? /* @__PURE__ */ _.jsx("p", { className: "audio-error", children: a }) : null,
    /* @__PURE__ */ _.jsx(
      "textarea",
      {
        className: "answer-input",
        placeholder: "Ask about this material...",
        value: t,
        onChange: (f) => e(f.target.value)
      }
    ),
    /* @__PURE__ */ _.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ _.jsx(de, { variant: "primary", disabled: s || !t.trim(), onClick: () => c(t), children: "Ask" }),
      xj.map((f) => /* @__PURE__ */ _.jsx(de, { disabled: s, onClick: () => c(f), children: f }, f))
    ] })
  ] });
}
function wj({ cards: t }) {
  const e = H((w) => w.flashcardIndex), n = H((w) => w.flashcardSide), r = H((w) => w.flashcardProgress), s = H((w) => w.setFlashcardIndex), a = H((w) => w.flipFlashcard), l = H((w) => w.rateFlashcard), c = H((w) => Object.values(w.flashcardProgress || {}).filter((S) => S && S.difficulty).length), f = t.length, m = Math.min(Math.max(e, 0), Math.max(0, f - 1)), g = t[m], d = D1(g, m), p = r[d] || {}, v = n === "back" ? "back" : "front";
  return /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ _.jsxs("span", { className: "focus-kicker", children: [
      "Card ",
      m + 1,
      " of ",
      f
    ] }),
    /* @__PURE__ */ _.jsx("h3", { children: v === "back" ? "Answer" : "Prompt" }),
    /* @__PURE__ */ _.jsx("p", { children: v === "back" ? EI(g) : PI(g, m) }),
    p.difficulty ? /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
      "Marked ",
      p.difficulty
    ] }) : null,
    /* @__PURE__ */ _.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ _.jsx(de, { disabled: m <= 0, onClick: () => s(m - 1), children: "Previous" }),
      /* @__PURE__ */ _.jsx(de, { variant: "primary", onClick: a, children: v === "back" ? "Show Prompt" : "Reveal Answer" }),
      /* @__PURE__ */ _.jsx(de, { disabled: m >= f - 1, onClick: () => s(m + 1), children: "Next" })
    ] }),
    /* @__PURE__ */ _.jsx("div", { className: "focus-button-row", children: ["easy", "medium", "hard"].map((w) => /* @__PURE__ */ _.jsxs(
      de,
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
    /* @__PURE__ */ _.jsxs("p", { children: [
      c,
      " completed in this material."
    ] })
  ] });
}
class Tj {
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
const Aj = (t, e) => Tj.ensureRenderableSummary(t, e), f_ = {
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
}, kj = {
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
}, bj = [
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
function Cj(t) {
  return String(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ui(t, e, n) {
  const r = String(t || "").trim();
  return r ? [...r].length <= 2 ? `${r}${e}` : `${n}(${r})` : "";
}
function Pj(t) {
  let e = String(t || "");
  return e = e.replace(/\\mathbb\{([A-Za-z])\}/g, (n, r) => f_[r] || r), e = e.replace(/\\mathbb\s+([A-Za-z])/g, (n, r) => f_[r] || r), e = e.replace(/\\(?:operatorname|text|mathrm|mathbf|mathit|textbf|textit)\{([^{}]*)\}/g, "$1"), e = e.replace(/\\(?:left|right|big|Big|bigg|Bigg)\b/g, ""), e = e.replace(/\\[,;:!]\s*/g, " "), e = e.replace(/\\(?:widehat|hat)\{([^{}]+)\}/g, (n, r) => Ui(r, "̂", "hat")).replace(/\\(?:overline|bar)\{([^{}]+)\}/g, (n, r) => Ui(r, "̄", "bar")).replace(/\\(?:vec|overrightarrow)\{([^{}]+)\}/g, (n, r) => Ui(r, "⃗", "vec")).replace(/\\tilde\{([^{}]+)\}/g, (n, r) => Ui(r, "̃", "tilde")).replace(/\\dot\{([^{}]+)\}/g, (n, r) => Ui(r, "̇", "dot")).replace(/\\ddot\{([^{}]+)\}/g, (n, r) => Ui(r, "̈", "ddot")), Object.entries(kj).sort((n, r) => r[0].length - n[0].length).forEach(([n, r]) => {
    e = e.replace(new RegExp(Cj(n) + "(?![A-Za-z])", "g"), r);
  }), bj.forEach((n) => {
    e = e.replace(new RegExp(`\\\\${n}(?![A-Za-z])`, "g"), n);
  }), e.replace(/<=>/g, "⇔").replace(/=>/g, "⇒").replace(/<=/g, "≤").replace(/>=/g, "≥").replace(/!=/g, "≠").replace(new RegExp("(?<!<)-\\>", "g"), "→").replace(/<-/g, "←");
}
const cT = [
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
    let w = p.slice(0, v.index).trim(), S = p.slice(v.index + v[0].length).trim();
    return w = w.replace(/^(?:before|after)\s+(?:the\s+)?(?:visual|image|figure|source figure|source image)\s*[:：-]?\s*$/i, "").trim(), w = w.replace(/^(?:before|after)\s*[:：-]?\s*$/i, "").trim(), S = S.replace(/^[:：,;.\-\s]+/, "").replace(/^(?:after|before)\s+(?:the\s+)?(?:visual|image|figure|source figure|source image)\s*[:：-]?\s*/i, "").trim(), [w, v[0], S].filter(Boolean);
  }, f = [];
  return s.forEach((g, d) => {
    let p = g.replace(/\s+$/g, "");
    const v = p.trim(), w = v.match(r);
    if (w && !a(v)) {
      f.push(`${w[1] || "## "}${l(w[2])}`);
      return;
    }
    const S = c(p);
    if (S) {
      f.push(...S);
      return;
    }
    const T = p.match(/^(\s*)\d+\.\s+(.+?)\s*$/);
    if (T) {
      const b = s.slice(d + 1).find((M) => M.trim()), E = T[2].trim();
      if (b && a(b) && E.length >= 3 && E.length <= 140 && !E.endsWith(":")) {
        f.push(`### ${E}`);
        return;
      }
    }
    const A = p.match(/^(\s*[-*]\s+)(.+)$/);
    if (A) {
      const b = A[2].replace(n, (E, M) => `**${M}:** `);
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
function Eh(t) {
  let e = String(t || ""), n = "";
  for (; e !== n; )
    n = e, e = e.replace(/\\\\(?=[A-Za-z()[\],;:!])/g, "\\");
  return e.replace(/\tfrac\s*\{/g, "\\frac{").replace(/\\(?:tfrac|dfrac)\s*\{/g, "\\frac{").replace(/\\dfrac\s*\{/g, "\\frac{").replace(/\\quad\b/g, " ").replace(/\\qquad\b/g, " ").replace(/\\(?:Rightarrow|Longrightarrow|implies)\b/g, "\\Rightarrow").replace(/\\(?:leftarrow|gets)\b/g, "\\leftarrow");
}
function Mj(t) {
  const e = [...String(t || "")], n = [], r = /* @__PURE__ */ new Set();
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s], l = e[s - 1] || "";
    a === "(" && l !== "\\" ? n.push(s) : a === ")" && l !== "\\" && (n.length ? n.pop() : r.add(s));
  }
  return n.forEach((s) => r.add(s)), e.filter((s, a) => !r.has(a)).join("");
}
function xo(t) {
  const e = Eh(String(t || "")).replace(/\\(?:\(|\)|\[|\])/g, "");
  return Mj(e);
}
function Mh(t) {
  return String(t || "").replace(/(\\\)|\\\])(?=[A-Za-z])/g, "$1 ").replace(/([A-Za-z])(?=(?:\\\(|\\\[))/g, "$1 ").replace(/([.?!。！？])(?=(?:Which|What|Why|How|When|Where|Who|This|That|The|A|An|If|Because|Since|So|Then|Use|Show|Give|Write)\b)/g, "$1 ").replace(/\bvs(?=[A-Z])/g, "vs ").replace(/\b(Lagrange|Leibniz)\s*\(/g, "$1 (").replace(/\b(Which|What|Why|How|When|Where|Who)iscorrect\b/gi, "$1 is correct").replace(/\b(Which|What|Why|How|When|Where|Who)is\b/g, "$1 is").replace(/\bbothrepresent\b/gi, "both represent").replace(/\beachterm\b/gi, "each term").replace(/\bdivideby\b/gi, "divide by").replace(/\bdividedby\b/gi, "divided by").replace(/\baddone\b/gi, "add one").replace(/\badd1\b/gi, "add 1").replace(/\bcalculatedfromfirstprinciples\b/gi, "calculated from first principles").replace(/\bpowerule\b/gi, "power rule").replace(/\busingarea\b/gi, "using area").replace(/\bcausingdivisionbyzero\b/gi, "causing division by zero").replace(/\bcorrectantiderivative\b/gi, "correct antiderivative").replace(/\btotaldeposits\b/gi, "total deposits").replace(/\bpotential(\d+(?:\.\d+)?\s*[KMBT])\b/gi, "potential $$$1");
}
function Rj(t) {
  let e = Nj(Eh(String(t || "")));
  const n = Gp(e);
  return e = Eh(Pj(Mh(n.text))).replace(/sqrt\s*\(\s*([^()\n]+?)\s*\)/gi, "√($1)").replace(/sqrt\s*([0-9A-Za-z]+)/gi, "√($1)"), Mh(n.restore(e));
}
function Jl(t) {
  const e = String(t || "");
  if (!/[=+\-*/^_|∫ΣΠ≈≃≠≤≥<>×·⋅]|\\(?:int|frac|sqrt|lvert|rvert|ln|log|approx|sim|ne|le|ge)\b/.test(e)) return !1;
  const n = e.match(/^\s*([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\s*$/);
  if (n && Bu(n[1], n[2])) return !1;
  const r = e.match(/[A-Za-z]{3,}/g) || [];
  if (r.length < 2) return !1;
  const s = /* @__PURE__ */ new Set([
    ...cT.map((l) => l.toLowerCase()),
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
function Nj(t) {
  return String(t || "").replace(/\\\(([\s\S]{1,700}?)\\\)/g, (e, n) => Jl(n) ? n : e).replace(/\\\[([\s\S]{1,1200}?)\\\]/g, (e, n) => Jl(n) ? n : e).replace(/\$\$([\s\S]{1,1200}?)\$\$/g, (e, n) => Jl(n) ? n : e);
}
function Ij(t) {
  return String(t || "").replace(/\\Delta\s*([A-Za-z])/g, "\\Delta $1").replace(/Δ\s*([A-Za-z])/g, "\\Delta $1");
}
function Dj(t, e, n = "LATEX") {
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
function Gp(t) {
  const e = [], n = (s) => {
    const a = `@@MATHSEG${e.length}@@`;
    return e.push(s), a;
  };
  let r = String(t || "").replace(/\$\$[\s\S]*?\$\$/g, n).replace(/\\\[[\s\S]*?\\\]/g, n).replace(/\\\([\s\S]*?\\\)/g, n);
  return Ar.lastIndex = 0, r = r.replace(Ar, (s, a, l) => Kp(l) ? `${a}${n(`$${l}$`)}` : s), Ar.lastIndex = 0, {
    text: r,
    restore(s) {
      return e.reduce((a, l, c) => a.split(`@@MATHSEG${c}@@`).join(l), String(s || ""));
    }
  };
}
const h_ = /* @__PURE__ */ new Set([
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
function Bu(t, e) {
  const n = String(t || "").toLowerCase(), r = String(e || "").toLowerCase();
  return h_.has(n) || h_.has(r);
}
function jj(t) {
  const e = Dj(t, /\\frac\s*\{[^{}\n]+\}\s*\{[^{}\n]+\}/g, "FRAC");
  let n = e.text.replace(/\bd\s*\/\s*d([A-Za-z])\b/g, "\\frac{d}{d$1}").replace(/\\Delta\s*([A-Za-z])\s*\/\s*\\Delta\s*([A-Za-z])/g, "\\frac{\\Delta $1}{\\Delta $2}").replace(/\b([A-Za-z]{1,8}\s*\([^()\n]{1,120}\))\s*\/\s*([A-Za-z]{1,8}\s*\([^()\n]{1,120}\))/g, "\\frac{$1}{$2}").replace(/\[([^\[\]\n]{1,220})\]\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (r, s, a) => `\\frac{${s.trim()}}{${a.trim()}}`).replace(/\(((?:[^()\n]|\([^()\n]*\)){1,220})\)\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (r, s, a) => `\\frac{${s.trim()}}{${a.trim()}}`).replace(/\(([^()\n]{1,160})\)\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (r, s, a) => `\\frac{${s.trim()}}{${a.trim()}}`).replace(/\b([0-9]+)\s*\/\s*([A-Za-z][A-Za-z0-9]*)\b/g, "\\frac{$1}{$2}").replace(/\b([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\b/g, (r, s, a) => Bu(s, a) ? `\\frac{${s}}{${a}}` : r);
  return n = e.restore(n), n;
}
function Fj(t) {
  return String(t || "").replace(
    /\b(P|Pr)\s*\(\s*([^()\n|]{1,100}?)\s*\|\s*([^()\n|]{1,100}?)\s*\)/g,
    (e, n, r, s) => `${n}(${r.trim()} \\mid ${s.trim()})`
  );
}
function dT(t) {
  return jj(Fj(Ij(xo(String(t || ""))))).trim().replace(/[−–—]/g, "-").replace(/\|([^|\n]{1,100})\|/g, "\\lvert $1 \\rvert").replace(/∪/g, "\\cup ").replace(/∩/g, "\\cap ").replace(/∈/g, "\\in ").replace(/∉/g, "\\notin ").replace(/∫/g, "\\int ").replace(/Σ/g, "\\sum ").replace(/Π/g, "\\prod ").replace(/∞/g, "\\infty ").replace(/∂/g, "\\partial ").replace(/∇/g, "\\nabla ").replace(/÷/g, "\\div ").replace(/[·⋅]/g, "\\cdot ").replace(/×/g, "\\times ").replace(/≈/g, "\\approx ").replace(/≃/g, "\\simeq ").replace(/≡/g, "\\equiv ").replace(/≠/g, "\\ne ").replace(/≤/g, "\\le ").replace(/≥/g, "\\ge ").replace(/→/g, "\\to ").replace(/\bdet\s*\(/gi, "\\det(").replace(/\band\b/gi, "\\;\\text{and}\\;").replace(/\bor\b/gi, "\\;\\text{or}\\;").replace(/\bsqrt\s*\(\s*([^()\n]+?)\s*\)/gi, "\\sqrt{$1}").replace(/√\s*\(\s*([^()\n]+?)\s*\)/g, "\\sqrt{$1}").replace(/√\s*([0-9A-Za-z]+)/g, "\\sqrt{$1}").replace(/\^\s*\(([^()\n]{1,60})\)/g, "^{$1}").replace(/\^\s*([-+]?\d{1,4}|[A-Za-z])(?=$|[^A-Za-z0-9])/g, "^{$1}").replace(/_\s*([A-Za-z0-9]{1,6})\b/g, "_{$1}").replace(/\s+/g, " ");
}
function Oj(t) {
  const e = [];
  return String(t || "").replace(/\[\s*([^\[\]\n]*?)\s*\]/g, (n, r) => {
    const s = r.split(/\s*,\s*/).map((a) => dT(a)).filter(Boolean);
    return s.length && e.push(s.join(" & ")), "";
  }), e.length ? `\\begin{bmatrix}${e.join(" \\\\ ")}\\end{bmatrix}` : t;
}
function Lj(t) {
  return String(t || "").replace(
    /\[\s*(\[[^\[\]\n]*\]\s*(?:,\s*\[[^\[\]\n]*\]\s*)+)\]/g,
    Oj
  );
}
function zj(t, e) {
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
    const v = n.slice(0, m), w = v.trimEnd(), S = n.slice(m + 1).trim();
    if (S && S.length <= 80 && /^[A-Za-z0-9\\{}\s.+\-*/^_]+$/.test(S) && (w.endsWith("|") || /(?:\\?ln|\\?log|\\?det|\\?frac|\\?sqrt|[=+\-*/^_(])\s*$/i.test(v)))
      return !0;
  }
  const g = n.slice(-18);
  return c && /[)\]}.,;:]/.test(l) ? !0 : c && f && /(?:\\?ln|\\?log|\\?det|\\?frac|\\?sqrt|[=+\-*/^_(]|∫|Σ|Π|√)\s*[^|]*$/i.test(g);
}
function $j(t, e) {
  const n = String(t || "").slice(0, e), r = String(t || "").slice(e + 1), s = n.lastIndexOf("("), a = n.lastIndexOf(")");
  if (s < 0 || s < a || !/(?:^|[^A-Za-z0-9_])(?:P|Pr)\s*$/i.test(n.slice(0, s))) return !1;
  const l = r.indexOf(")");
  if (l < 0) return !1;
  const c = n.slice(s + 1).trim(), f = r.slice(0, l).trim();
  return !!(c && f && c.length <= 100 && f.length <= 100);
}
function Rh(t, e = 0) {
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
    if (c === "|" && !a && f !== "\\" && !zj(n, l) && !$j(n, l)) {
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
function fT(t) {
  let e = Mh(String(t || "")).trimEnd(), n = "";
  const r = (A) => {
    n = e.slice(A) + n, e = e.slice(0, A).trimEnd();
  }, s = e.match(/^([A-Za-z]\s*(?:∩|∪|\\cap|\\cup)\s*[A-Za-z]\s*=\s*\{[^{}\n]{1,240}\})([.,;:]?[\s\S]*)$/);
  if (s)
    return e = s[1], n = s[2] + n, { formula: e, trailing: n };
  const a = e.match(/^(d\s*\/\s*d[A-Za-z]|\\frac\{d\}\{d[A-Za-z]\})([\s\S]+)$/);
  if (a && /^(?:\s*\)|\s+(?:vs|versus)\b|[,.;:])/.test(a[2]))
    return e = a[1], n = a[2] + n, { formula: e, trailing: n };
  const l = e.match(/\s*(?:→|⇒|->)\s+(?=(?:derivative|antiderivative|area|proof|power|rule|calculated|using|from|by|with)\b)/i);
  l && l.index > 0 && r(l.index);
  const c = e.match(/[:;]\s+(?=(?:[A-Za-z][A-Za-z-]{2,}|[A-Z][A-Za-z0-9]*(?:\s|$)))/);
  c && c.index > 0 && r(c.index);
  const f = e.match(/[:;]\s*(?=(?:[A-Za-z][A-Za-z0-9]*'?\s*\(|[A-Za-z]\s*(?:=|≈|≃|≠|≤|≥|<|>)|tangent|slope|line|where|then|with|use|show|therefore|remember)\b)/i);
  f && f.index > 0 && r(f.index + 1);
  const m = e.match(/[.?!。！？]\s*(?=(?:which|what|why|how|who|choose|select|identify|state|explain|find|compute|differentiate|integrate|solve|evaluate|determine|is|are|does|do|can|should|would|show|give|write)\b)/i);
  m && m.index > 0 && r(m.index + 1);
  const g = e.match(/^([\s\S]*?[=≈≃≠≤≥<>]\s*(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\})(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\}))*)(\s+[A-Za-z][A-Za-z-]{2,}[\s\S]*)$/);
  g && g[1].length > 0 && r(g[1].length);
  const d = String.raw`(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:[A-Za-z0-9]{0,3})?(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\}|\([^()\n]{1,80}\))`, p = e.match(new RegExp(
    String.raw`^([\s\S]*?[=≈≃≠≤≥<>]\s*${d}(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*${d})*)(\s+(?:is|are|was|were|be|being|questions?|the|a|an|this|that|which|where|when|because|since|so|then|and|but)\b[\s\S]*)$`,
    "i"
  ));
  p && p[1].length > 0 && r(p[1].length);
  const v = e.match(new RegExp(
    String.raw`^([\s\S]*?[=≈≃≠≤≥<>]\s*${d}(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*${d})*)(\s+to\s+(?:calculate|compute|find|solve|show|explain|keep|produce|derive|estimate|work|remember)\b[\s\S]*)$`,
    "i"
  ));
  v && v[1].length > 0 && r(v[1].length);
  const w = e.match(/\s+\(([^()]*)\)\s*$/);
  if (w) {
    const A = w[1].trim(), b = (A.match(/[A-Za-z]{2,}/g) || []).length, E = /[=<>^_\\]|[+\-*/]\s*\d|\d\s*[+\-*/]/.test(A);
    b >= 2 && !E && r(w.index);
  }
  const S = [
    /(?=(?:Which|What|Why|How|Who|Choose|Select|Identify|State|Explain|Show|Give|Write)\b)/,
    /\s+\((?:explicit|show|if|required|where|since|because|when|while|which|this|that|treat|use|note|i\.e\.|e\.g\.)\b[\s\S]*$/i,
    /\s+(?:which|what|why|how|who|choose|select|identify|state|explain|show|give|write)\b[\s\S]*$/i,
    /[,;:]?\s+(?:according|special\s+case|case|or|unless|except|when|while|if|but|for)\b[\s\S]*$/i,
    /[,;:]?\s+(?:compute|find|solve|evaluate|determine)\b[\s\S]*$/i,
    /[,;:]?\s+(?:and|then|with|where|gives?|shows?|means?|makes?|causes?|causing|requires?|therefore|because|since|so|hence|thus)\s+\(?[A-Za-z\u0370-\u03ff∂∇∫ΣΠℝℂℕℤ][\s\S]*$/i,
    /[,;:]?\s+(?:the|a|an)\s+(?:correct|main|final|next|same|rule|answer|antiderivative|derivative|matrix|value|result|step)\b[\s\S]*$/i
  ];
  for (const A of S) {
    const b = e.match(A);
    b && b.index > 0 && r(b.index);
  }
  const T = e.match(/([.,;:!?？。！])$/);
  for (T && (n = T[1] + n, e = e.slice(0, -1).trimEnd()); e.endsWith(")"); ) {
    const A = (e.match(/\(/g) || []).length;
    if ((e.match(/\)/g) || []).length <= A) break;
    n = ")" + n, e = e.slice(0, -1).trimEnd();
  }
  return { formula: e, trailing: n };
}
function Vj(t) {
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
function hT(t) {
  const e = String(t || "");
  if (/^\s*[-+]?\d+(?:\.\d+)?\s*[A-Za-z]\s*$/.test(e)) return !0;
  if (e.length < 3 || e.length > 700 || /(?:https?:\/\/|www\.|youtu\.?be|youtube\.com)/i.test(e)) return !1;
  const n = e.match(/^\s*\(([\s\S]*)\)\s*$/);
  if (n) {
    const a = n[1], l = a.match(/[A-Za-z]{3,}/g) || [], c = /[≠≤≥<>^_∫ΣΠ√]|\\(?:frac|sqrt|int|sum|prod|lvert|rvert|approx|simeq)\b|(?:^|[^A-Za-z])(?:[A-Za-z]\s*(?:=|≈|≃)|(?:=|≈|≃)\s*[-+]?\d|\d\s*[+\-*/]\s*\d)/.test(a);
    if (l.length >= 2 && !c) return !1;
  }
  if (Jl(e)) return !1;
  if (/\b(?:P|Pr)\s*\([^()\n]{1,120}\)/.test(e) && /[=≈≃≠≤≥<>]|\\mid|\||∩|∪/.test(e) || /[A-Za-z]\s*(?:∩|∪|\\cap|\\cup)\s*[A-Za-z]|\{[^{}\n]*(?:∈|\\in)[^{}\n]*\}/.test(e)) return !0;
  const r = e.match(/^\s*([A-Za-z][A-Za-z\s-]{3,})\s*(?:=|≈|≃|≠|≤|≥|<|>)/);
  if (r && !/[()_^'\\∫ΣΠ√]/.test(r[1])) return !1;
  if (/^\s*[A-Za-z]'\s*\([^()\n]{1,20}\)\s*$/.test(e) || /\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}/.test(e) || /\\(?:frac|sqrt|lim|int|sum|prod)\b|\\Delta\b|(?:^|[^\w])d\s*\/\s*d[A-Za-z]\b/.test(e) || /^(?:\\Delta|Δ)\s*[A-Za-z]\s*(?:→|->|=|≠|≤|≥|<|>)\s*[-+]?(?:\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*)$/.test(e.trim()) || /(?:\\Delta|Δ)\s*[A-Za-z]\s*\/\s*(?:\\Delta|Δ)\s*[A-Za-z]|\[[^\[\]\n]{1,220}\]\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)|\((?:[^()\n]|\([^()\n]*\)){1,220}\)\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)/.test(e)) return !0;
  const s = e.match(/^\s*([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\s*$/);
  return s && Bu(s[1], s[2]) || /\|[^|\n]{1,100}\|/.test(e) || /\b(?:ln|log)\s*(?:\\lvert|\|)/i.test(e) || /[=≈≃≠≤≥<>]|\\frac|\\sqrt|√|[∫ΣΠ]|[A-Za-z]\s*\^\s*(?:\{|\(|[A-Za-z0-9+\-=])|[A-Za-z]_\{?[A-Za-z0-9]/.test(e) ? !0 : /\bdet\s*\(/i.test(e);
}
function wt(t) {
  let e = dT(t).replace(/\b(\d+)\s*x\s*(\d+)\b/gi, "$1 \\times $2").replace(/\s*([=+\-*/(){}\[\],;:])\s*/g, "$1").replace(/([A-Za-z0-9}\)])d([A-Za-z])\b/g, "$1\\,d$2").replace(/\bln\b/g, "\\ln").replace(/\blog\b/g, "\\log").replace(/\s*(\\(?:cdot|times|div|ne|le|ge|to|mid|cup|cap|in|notin)\s*)\s*/g, " $1 ").replace(/\s+/g, " ").trim();
  return cT.forEach((n) => {
    n !== "Pr" && (e = e.replace(new RegExp(`(?<!\\\\)\\b${n}\\b`, "g"), `\\${n}`));
  }), e;
}
const Ar = /(^|[^\\])\$(?!\d)([^\n$]{1,700}?)\$/g;
function Kp(t) {
  const e = String(t || "").trim();
  return !e || /^\d+(?:\.\d{2})?(?:\s|$)/.test(e) ? !1 : /^(?:[A-Za-z]|[A-Za-z][A-Za-z0-9]*'?\([^()\n]{0,30}\)|\\[A-Za-z]+(?:\{[^{}]*\})*)$/.test(e) || /[=<>^_{}\\]|[+\-*/]\s*(?:\d|[A-Za-z\\])|(?:\d|[A-Za-z)])\s*[+\-*/]/.test(e) || /(?:\\Delta|Δ|∫|Σ|Π|√|∞|≤|≥|≠|→)/.test(e) ? !0 : (e.match(/[A-Za-z]{3,}/g) || []).length <= 1 && /[A-Za-z0-9]/.test(e);
}
function Bj(t) {
  Ar.lastIndex = 0;
  let e;
  for (; e = Ar.exec(String(t || "")); )
    if (Kp(e[2]))
      return Ar.lastIndex = 0, !0;
  return Ar.lastIndex = 0, !1;
}
function Ro(t) {
  if (/\\\(|\\\[|\$\$/.test(t) || Bj(t)) return t;
  const e = [], n = (l) => {
    const c = `@@AUTO_INLINE_MATH_${e.length}@@`;
    return e.push(l), c;
  }, r = (l) => e.reduce((c, f, m) => c.split(`@@AUTO_INLINE_MATH_${m}@@`).join(f), String(l || "")), s = (l) => {
    const c = fT(l);
    return hT(c.formula) ? `${n(`\\(${wt(c.formula)}\\)`)}${Ro(c.trailing)}` : l;
  };
  let a = String(t || "");
  return a = a.replace(/(^|[^A-Za-z0-9_@])((?:\\Delta|Δ)\s*[A-Za-z]\s*(?:→|->|=|≠|≤|≥|<|>)\s*[-+]?(?:\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])((?:\\Delta|Δ)\s*[A-Za-z]\s*\/\s*(?:\\Delta|Δ)\s*[A-Za-z])/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])(\[[^\[\]\n]{1,220}\]\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])(\((?:[^()\n]|\([^()\n]*\)){1,220}\)\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])\b([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\b/g, (l, c, f, m) => Bu(f, m) ? `${c}${s(`${f}/${m}`)}` : l).replace(/(^|[^A-Za-z0-9_@])(\|[^|\n]{1,100}\|\s*(?:(?:=|≈|≃|≠|≤|≥|<|>)\s*[^,.;\n]{1,80}|(?:[+\-]\s*[A-Za-z0-9]+)?))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])(d\s*\/\s*d[A-Za-z])(?=\s*\)|\s+(?:vs|versus)\b|[,.;:]|$)/gi, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z]'\s*\([^()\n]{1,20}\))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])\b(derivative|antiderivative|gradient|slope|result|answer)\s*=\s*([-+]?\d+(?:\.\d+)?\s*[A-Za-z](?:\s*\^\s*(?:\{[^{}]+\}|[-+]?\d{1,4}|[A-Za-z]))?(?:\s*[+\-]\s*[-+]?\d+(?:\.\d+)?\s*[A-Za-z]?)?)/gi, (l, c, f, m) => `${c}${f} = ${s(m)}`).replace(/(^|[^A-Za-z0-9_@])((?:ln|log)\s*\|[^|\n]{1,100}\|(?!\|)(?:\s*[+\-]\s*[A-Za-z])?)/gi, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])((?:[-+]?\d+(?:\.\d+)?\s*)?[A-Za-z]\s*\^\s*(?:\{[^{}]+\}|\([^()\n]{1,60}\)|[A-Za-z0-9+\-=]{1,6})(?:\s*[+\-]\s*(?:(?:\d+(?:\.\d+)?\s*)?[A-Za-z](?:\s*\^\s*(?:\{[^{}]+\}|\([^()\n]{1,60}\)|[A-Za-z0-9+\-=]{1,6}))?|\d+(?:\.\d+)?)){1,})/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])((?!(?:makes?|causes?|causing|requires?|explains?|shows?|means?|because|since|where|when|while|which|that|this)\b)[A-Za-z][A-Za-z0-9]*'?\s*\([^()\n]{1,36}\)\s*(?:=|≈|≃|≠|≤|≥)\s*[^,.;\n]{1,160})/gi, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])(\([^()\n]{1,80}\)\s*(?:=|≈|≃|≠|≤|≥|<|>)\s*[^,.;\n]{1,120})/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z]\s*(?:=|≈|≃|≠|≤|≥)\s*[-+]?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?|[A-Za-z0-9.\u0370-\u03ff]+)(?:\s*[+\-*/]\s*[-+]?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?|[A-Za-z0-9.\u0370-\u03ff]+)(?:\s*\^\s*(?:\{[^{}]+\}|[A-Za-z0-9+\-=]{1,6}))?)*\)?)/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])([∫ΣΠ]\s*[A-Za-z0-9_{}^()+\-*/| ]{1,100}\s*(?:d[A-Za-z]\b|(?:=|≈|≃)\s*[^,.;\n]{1,100}))/g, (l, c, f) => `${c}${s(f)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*\{([^{}]+)\}/g, (l, c, f, m) => `${c}${n(`\\(${f}^{${wt(m)}}\\)`)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)_\{([^{}]+)\}/g, (l, c, f, m) => `${c}${n(`\\(${f}_{${wt(m)}}\\)`)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*\(([^()\n]{1,60})\)/g, (l, c, f, m) => `${c}${n(`\\(${f}^{${wt(m)}}\\)`)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*([A-Za-z0-9+\-=]{1,6})(?![A-Za-z0-9])/g, (l, c, f, m) => `${c}${n(`\\(${f}^{${wt(m)}}\\)`)}`).replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)_([0-9A-Za-z]{1,6})(?![A-Za-z0-9])/g, (l, c, f, m) => `${c}${n(`\\(${f}_{${wt(m)}}\\)`)}`).replace(/(\([^()\n]{1,80}\)\s*_\s*[A-Za-z0-9]{1,6}\s*=\s*[A-Za-z][A-Za-z0-9]*\s*_\s*[A-Za-z0-9]{1,6})/g, (l) => n(`\\(${wt(l)}\\)`)).replace(/(\([^()\n]{1,80}\)\s*_\s*[A-Za-z0-9]{1,6})/g, (l) => n(`\\(${wt(l)}\\)`)).replace(/\bdet\s*\(\s*([A-Za-z][A-Za-z0-9_]*)\s*\)/gi, (l, c) => n(`\\(\\det(${c})\\)`)).replace(/\b([A-Za-z][A-Za-z0-9]*)\s*\^\s*\{([^{}]+)\}/g, (l, c, f) => n(`\\(${c}^{${wt(f)}}\\)`)).replace(/\b([A-Za-z][A-Za-z0-9]*)_\{([^{}]+)\}/g, (l, c, f) => n(`\\(${c}_{${wt(f)}}\\)`)).replace(/\b([A-Za-z][A-Za-z0-9]*)\s*\^\s*([A-Za-z0-9+\-=]{1,6})\b/g, (l, c, f) => n(`\\(${c}^{${wt(f)}}\\)`)).replace(/\b([A-Za-z][A-Za-z0-9]*)_([0-9A-Za-z]{1,6})\b/g, (l, c, f) => n(`\\(${c}_{${wt(f)}}\\)`)).replace(/(?:√|sqrt)\s*\(\s*([^()\n]+?)\s*\)/gi, (l, c) => n(`\\(\\sqrt{${wt(c)}}\\)`)), r(a);
}
function Uj(t) {
  const e = Gp(t);
  return e.restore(Ro(e.text));
}
function Hj(t) {
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
function Nh(t, e = !1) {
  if (!t || /^\s*```/.test(t) || /^\s*\[\[VISUAL:\d+\]\]\s*$/.test(t) || /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(t)) return t;
  if (/^\s*\|.*\|\s*$/.test(t)) {
    const w = String(t).trim();
    return `| ${Rh(w).map((T) => Nh(T.trim(), !0)).join(" | ")} |`;
  }
  const n = String(t).match(/^(\s*(?:[-*+]\s+|\d+\.\s+|>\s*)?)(.*)$/), r = n ? n[1] : "", s = n ? n[2] : String(t);
  if (!s.trim()) return t;
  if (/\\\(|\\\[|\$\$|\$/.test(s))
    return r + Uj(s);
  const a = Vj(s);
  if (a < 0) return r + Ro(s);
  const l = s.slice(0, a), c = s.slice(a), { formula: f, trailing: m } = fT(c);
  if (!hT(f)) return r + Ro(s);
  const g = !e && !r && !l.trim() && !m.trim() && f.length <= 220, d = wt(f), p = g ? `\\[${d}\\]` : `\\(${d}\\)`;
  let v = m;
  if (/^\)+/.test(v)) {
    const w = (l.match(/\(/g) || []).length;
    (l.match(/\)/g) || []).length >= w && !l.trimEnd().endsWith("(") && (v = v.replace(/^\)+/, ""));
  }
  return r + Ro(l) + p + (v ? Nh(v, !0) : "");
}
function Wj(t) {
  const e = Hj(Lj(Rj(t))), n = Gp(e.text), r = n.text.split(`
`).map((s) => Nh(s)).join(`
`);
  return e.restore(n.restore(r));
}
const Zj = "https://www.desmos.com/api/v1.11/calculator.js", Gj = "desmos";
let Il = null, Kj = 0;
const pT = {
  getLearningFigureByMarker: () => null,
  renderInlineVisualCard: () => "",
  renderInlineVisualReference: () => ""
};
function Yj(t) {
  return pT.renderInlineVisualCard(t);
}
function qj(t, e = null) {
  return pT.renderInlineVisualReference(t, e);
}
function Qj(t) {
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
function Xj(t) {
  t = Ej(t), t = Wj(t);
  let e = gT(t);
  const n = [], r = [];
  e = e.replace(/\$\$([\s\S]*?)\$\$/g, (C, $) => {
    const I = `@@MATH_BLOCK_${n.length}@@`;
    return n.push(`\\[${xo($)}\\]`), I;
  }), e = e.replace(/\\\[[\s\S]*?\\\]/g, (C) => {
    const $ = `@@MATH_BLOCK_${n.length}@@`;
    return n.push(`\\[${xo(C.replace(/^\\\[/, "").replace(/\\\]$/, ""))}\\]`), $;
  }), e = e.replace(/\\\([\s\S]*?\\\)/g, (C) => {
    const $ = `@@INLINE_MATH_${r.length}@@`;
    return r.push(`\\(${xo(C.replace(/^\\\(/, "").replace(/\\\)$/, ""))}\\)`), $;
  });
  const s = new RegExp(
    "\\\\begin\\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\\}[\\s\\S]*?\\\\end\\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\\}",
    "g"
  );
  e = e.replace(s, (C) => {
    const $ = `@@INLINE_MATH_${r.length}@@`;
    return r.push(`\\(${C}\\)`), $;
  }), e = e.replace(Ar, (C, $, I) => {
    if (!Kp(I)) return C;
    const O = `@@INLINE_MATH_${r.length}@@`;
    return r.push(`\\(${xo(I)}\\)`), `${$}${O}`;
  }), e = Qj(e);
  const a = e.split(`
`), l = [];
  let c = !1, f = !1, m = !1, g = 0;
  const d = /* @__PURE__ */ new Set();
  let p = "";
  function v(C) {
    return /^\s*\|.*\|\s*$/.test(C || "");
  }
  function w(C) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(C || "");
  }
  function S(C) {
    return Rh(C, g);
  }
  function T() {
    m && (l.push("</tbody></table></div>"), m = !1, g = 0);
  }
  function A() {
    c && (l.push("</ul>"), c = !1), f && (l.push("</ol>"), f = !1);
  }
  function b(C, $) {
    if (!mT(C)) return !1;
    const O = [
      a[$ - 2] || "",
      a[$ - 1] || "",
      a[$ + 1] || "",
      a[$ + 2] || ""
    ].join(" ").toLowerCase();
    return /\b(?:do not graph|no graph|without graph|not a graph)\b/.test(O) ? !1 : new RegExp(
      "\\b(?:interactive\\s+graph|desmos|graph\\s+this|plot\\s+this|plot\\s+the|graph\\s+of|curve|coordinate\\s+plane|x-axis|y-axis|axes)\\b"
    ).test(O);
  }
  function E(C, $) {
    const I = String(C || "").match(/^@@MATH_BLOCK_(\d+)@@$/);
    if (!I) return "";
    const O = n[Number(I[1])] || "";
    return b(O, $) ? eF(O) : "";
  }
  a.forEach((C, $) => {
    const I = C.trim(), O = a[$ + 1] || "", L = I.match(/^\[\[VISUAL:(\d+)\]\]$/);
    if (!L && I && (p = ""), L) {
      A(), T();
      const U = Number(L[1]), q = "", ee = `index:${U}`;
      if (d.has(U) || q) {
        const ne = U, ie = `index:${ne}`;
        p !== ie && (l.push(qj(U, ne)), p = ie);
      } else
        d.add(U), l.push(Yj(U)), p = ee;
      return;
    }
    if (v(C) && w(O)) {
      A(), T();
      const U = Rh(C);
      g = U.length;
      const q = U.map((ee) => `<th>${ee}</th>`).join("");
      l.push(
        '<div class="markdown-table-wrap"><table class="markdown-table"><thead><tr>' + q + "</tr></thead><tbody>"
      ), m = !0;
      return;
    }
    if (!w(C)) {
      if (m && v(C)) {
        const U = S(C);
        l.push("<tr>" + U.map((q) => `<td>${q}</td>`).join("") + "</tr>");
        return;
      }
      if (m && !v(C) && T(), I.startsWith("@@MATH_BLOCK_"))
        A(), l.push(`<div class="math-block">${I}</div>${E(I, $)}`);
      else if (/^####\s+/.test(C))
        A(), l.push(`<h4>${C.replace(/^####\s+/, "")}</h4>`);
      else if (/^###\s+/.test(C))
        A(), l.push(`<h3>${C.replace(/^###\s+/, "")}</h3>`);
      else if (/^##\s+/.test(C))
        A(), l.push(`<h2>${C.replace(/^##\s+/, "")}</h2>`);
      else if (/^#\s+/.test(C))
        A(), l.push(`<h1>${C.replace(/^#\s+/, "")}</h1>`);
      else if (/^-\s+/.test(C))
        f && (l.push("</ol>"), f = !1), c || (l.push("<ul>"), c = !0), l.push(`<li>${C.replace(/^-\s+/, "")}</li>`);
      else if (/^\d+\.\s+/.test(C)) {
        c && (l.push("</ul>"), c = !1);
        const U = C.match(/^(\d+)\.\s+(.*)$/), q = U ? Number(U[1]) : 1;
        f || (l.push(q > 1 ? `<ol start="${q}">` : "<ol>"), f = !0), l.push(`<li>${U ? U[2] : C.replace(/^\d+\.\s+/, "")}</li>`);
      } else I === "" ? A() : (A(), l.push(`<p>${C}</p>`));
    }
  }), A(), T();
  let M = l.join("");
  return n.forEach((C, $) => {
    M = M.replace(`@@MATH_BLOCK_${$}@@`, C);
  }), r.forEach((C, $) => {
    M = M.replace(`@@INLINE_MATH_${$}@@`, C);
  }), M.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
}
function Jj(t) {
  return String(t || "").trim().replace(/^\\\[/, "").replace(/\\\]$/, "").replace(/^\\\(/, "").replace(/\\\)$/, "").replace(/^\$\$/, "").replace(/\$\$$/, "").trim();
}
function mT(t) {
  let e = wt(Jj(t)).replace(/\\left|\\right/g, "").replace(/\\,/g, " ").replace(/\s+/g, " ").trim();
  if (!e || e.length > 180 || !/[xX]/.test(e) || /\\(?:lim|Delta|int|sum|prod|begin)\b|\\to\b|(?:^|[^A-Za-z])d[A-Za-z]\b/.test(e)) return "";
  const n = e.match(/^f\s*\(\s*x\s*\)\s*=\s*([\s\S]+)$/i);
  if (n) return `y=${n[1].trim()}`;
  const r = e.match(/^f'\s*\(\s*x\s*\)\s*=\s*([\s\S]+)$/i);
  return r ? `y=${r[1].trim()}` : /^(?:y|x)\s*=/.test(e) || /^f\s*\(\s*x\s*\)\s*=/.test(e) || /=/.test(e) ? e : /^[0-9A-Za-z\\{}^_+\-*/().,\s]+$/.test(e) ? `y=${e}` : "";
}
function eF(t) {
  const e = mT(t);
  if (!e) return "";
  const n = `desmos-graph-${++Kj}`, r = `Interactive Desmos graph for ${iF(e)}`;
  return `
    <div class="desmos-card" data-desmos-latex="${encodeURIComponent(e)}">
      <div class="desmos-card-head">
        <span><i class="bi bi-graph-up"></i> Interactive graph</span>
        <code>${gT(e)}</code>
      </div>
      <div id="${n}" class="desmos-calculator" role="img" aria-label="${r}"></div>
    </div>
  `;
}
function tF() {
  return String(window.SYNAPSE_DESMOS_API_KEY || Gj);
}
function nF() {
  return window.Desmos && typeof window.Desmos.GraphingCalculator == "function" ? Promise.resolve(window.Desmos) : Il || (Il = new Promise((t, e) => {
    const n = document.querySelector("script[data-synapse-desmos]"), r = () => {
      window.Desmos && typeof window.Desmos.GraphingCalculator == "function" ? t(window.Desmos) : e(new Error("Desmos API loaded, but GraphingCalculator was unavailable."));
    };
    if (n) {
      n.addEventListener("load", r, { once: !0 }), n.addEventListener("error", () => e(new Error("Could not load the Desmos API.")), { once: !0 });
      return;
    }
    const s = document.createElement("script");
    s.src = `${Zj}?apiKey=${encodeURIComponent(tF())}`, s.async = !0, s.dataset.synapseDesmos = "true", s.onload = r, s.onerror = () => e(new Error("Could not load the Desmos API.")), document.head.appendChild(s);
  }), Il);
}
function p_(t, e) {
  console.warn("Desmos graph preview unavailable:", e), t.forEach((n) => {
    n.dataset.desmosMounted = "failed", n.classList.add("desmos-card-fallback");
    const r = n.querySelector(".desmos-calculator");
    r && (r.innerHTML = "<p>Interactive graph preview could not load. You can still read the equation above.</p>");
  });
}
function m_(t = document) {
  const e = [...t.querySelectorAll(".desmos-card:not([data-desmos-mounted])")];
  return e.length ? nF().then((n) => {
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
        p_([r], l);
      }
    });
  }).catch((n) => p_(e, n)) : Promise.resolve();
}
function rF() {
  return window.MathJax && window.MathJax.typesetPromise ? window.MathJax.typesetPromise().catch((t) => {
    console.error("MathJax render error:", t);
  }).then(() => m_()) : m_();
}
function gT(t) {
  return String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function iF(t) {
  return String(t || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("\\", "\\\\").replaceAll("'", "\\'").replaceAll(`
`, " ");
}
const sF = [
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
], oF = [
  [/^Big Picture$/i, ["Source-based", "Professional explanation"]],
  [/^What You Actually Need To Understand$/i, ["Professional explanation", "Source-based"]],
  [/^Concept Connections$/i, ["Professional explanation"]],
  [/^Deep Explanation$/i, ["Professional explanation", "Limitation"]],
  [/^Background Knowledge Layer$/i, ["Background knowledge"]],
  [/^Application To New Situations$/i, ["Application"]],
  [/^High-Quality Student Thinking$/i, ["Professional explanation"]],
  [/^Common Mistakes$/i, ["Application", "Limitation"]],
  [/^How To Use This In Assessment$/i, ["Application"]],
  [/^Model High-Quality Output$/i, ["Application"]],
  [/^Memory and Practice$/i, ["Application"]]
], yT = /* @__PURE__ */ new Map([
  ["Direct from source", "source"],
  ["Inferred from source", "inferred"],
  ["Tutor explanation", "tutor"],
  ["Not enough evidence", "needs-evidence"],
  ["Not enough evidence from source", "needs-evidence"],
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
]), bu = Array.from(yT.keys()).sort((t, e) => e.length - t.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), g_ = new RegExp(`\\[(${bu})\\]`, "g"), y_ = new RegExp(`\\[(${bu})\\]`);
function Ih(t) {
  return String(t || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function aF(t) {
  return String(t || "").replace(/<[^>]+>/g, " ");
}
function lF(t) {
  return String(t || "").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
}
function aa(t) {
  return lF(aF(t)).replace(/\s+/g, " ").trim();
}
function es(t) {
  return `<span class="notes-section-chip ${yT.get(t) || "plain"}">${t}</span>`;
}
function uF(t) {
  const e = aa(t);
  for (const [n, r] of sF)
    if (n.test(e)) return r;
  return [];
}
function cF(t) {
  const e = aa(t);
  for (const [n, r] of oF)
    if (n.test(e)) return r;
  return [];
}
function Zo(t) {
  let e = String(t || "");
  return e = e.replace(
    new RegExp(`<p>\\s*\\[(${bu})\\]\\s*<\\/p>`, "g"),
    (n, r) => `<div class="notes-inline-badges">${es(r)}</div>`
  ), e = e.replace(
    new RegExp(`<li>\\s*\\[(${bu})\\]\\s*<\\/li>`, "g"),
    (n, r) => `<li><span class="notes-inline-badges">${es(r)}</span></li>`
  ), e = e.replace(
    /<p>([\s\S]*?)<\/p>/g,
    (n, r) => y_.test(r) ? `<p>${r.replace(g_, (s, a) => es(a))}</p>` : n
  ), e = e.replace(
    /<li>([\s\S]*?)<\/li>/g,
    (n, r) => y_.test(r) ? `<li>${r.replace(g_, (s, a) => es(a))}</li>` : n
  ), e;
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
function dF(t, e, n) {
  const r = aa(t.headingInnerHtml), s = uF(r), a = !n || e === 0 ? " open" : "", l = s.length ? `<div class="notes-section-chip-row">${s.map(es).join("")}</div>` : "", c = Zo(t.bodyHtml || "");
  return `
    <details class="notes-section"${a} data-section-title="${Ih(r)}">
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
function fF(t) {
  const e = String(t || "").trim().toLowerCase().replace(/[-\s/]+/g, "_");
  return e === "professor_mode" || e === "professional" || e === "professional_mode" || e === "academic" || e === "academic_analysis" || e === "academic_analysis_mode";
}
function hF(t) {
  const e = aa(t);
  return /^Big Picture$/i.test(e) ? "big-picture" : /^What You Actually Need To Understand$/i.test(e) ? "core-understanding" : /^Concept Connections$/i.test(e) ? "concept-connections" : /^Deep Explanation$/i.test(e) ? "deep-explanation" : /^Background Knowledge Layer$/i.test(e) ? "background" : /^Application To New Situations$/i.test(e) ? "application" : /^High-Quality Student Thinking$/i.test(e) ? "high-quality-thinking" : /^Common Mistakes$/i.test(e) ? "common-mistakes" : /^How To Use This In Assessment$/i.test(e) ? "assessment-use" : /^Model High-Quality Output$/i.test(e) ? "model-output" : /^Memory and Practice$/i.test(e) ? "memory-practice" : "standard";
}
function pF(t) {
  const e = ["professional-mode-section"];
  return t === "big-picture" && e.push("professional-big-picture-card"), t === "core-understanding" && e.push("professional-core-understanding-card"), t === "concept-connections" && e.push("professional-concept-connections-card"), t === "deep-explanation" && e.push("professional-deep-explanation-section"), t === "background" && e.push("professional-background-card"), t === "application" && e.push("professional-application-card"), t === "high-quality-thinking" && e.push("professional-high-quality-thinking-card"), t === "common-mistakes" && e.push("professional-common-mistakes-card"), t === "assessment-use" && e.push("professional-assessment-use-card"), t === "model-output" && e.push("professional-model-output-card"), t === "memory-practice" && e.push("professional-memory-practice-card"), e.join(" ");
}
function mF(t) {
  return t === "concept-connections" ? "professional-section-body professional-connections-grid" : t === "application" ? "professional-section-body professional-application-steps" : t === "common-mistakes" ? "professional-section-body professional-mistakes-list" : t === "memory-practice" ? "professional-section-body professional-memory-list" : "professional-section-body";
}
function gF(t, e) {
  const n = e.length ? `<div class="notes-section-chip-row">${e.map(es).join("")}</div>` : "";
  return `
    <div class="professional-section-header">
      <h2>${t.headingInnerHtml}</h2>
      ${n}
    </div>
  `.trim();
}
function yF(t, e, n) {
  const r = aa(t.headingInnerHtml), s = cF(r), a = hF(r), l = Zo(t.bodyHtml || ""), c = !n || e <= 1 || a === "deep-explanation" ? " open" : "", f = gF(t, s), m = mF(a), g = pF(a);
  return a === "deep-explanation" ? `
      <details class="${g}"${c} data-section-title="${Ih(r)}">
        <summary class="professional-section-summary">
          ${f}
          <span class="notes-section-chevron" aria-hidden="true"></span>
        </summary>
        <div class="${m}">
          ${l}
        </div>
      </details>
    `.trim() : `
    <section class="${g}" data-section-title="${Ih(r)}">
      ${f}
      <div class="${m}">
        ${l}
      </div>
    </section>
  `.trim();
}
function vF(t, e) {
  const { preludeHtml: n, sections: r } = vT(t);
  if (!r.length) return t;
  const s = n.trim() ? `<section class="professional-mode-title-card">${Zo(n)}</section>` : "", a = r.map((l, c) => yF(l, c, e)).join(`
`);
  return `
    <div class="professional-mode-surface">
      ${s}
      ${a}
    </div>
  `.trim();
}
function _F(t, e = {}) {
  const n = Zo(String(t || "").trim());
  if (!n) return "";
  if (fF(e.promptMode))
    return vF(n, !!e.collapseSecondary);
  const { preludeHtml: r, sections: s } = vT(n);
  if (!s.length) return n;
  const a = !!e.collapseSecondary, l = r.trim() ? `<section class="notes-summary-card">${Zo(r)}</section>` : "", c = s.map((f, m) => dF(f, m, a)).join(`
`);
  return `${l}${l && c ? `
` : ""}${c}`.trim();
}
function xF() {
  try {
    return !!(globalThis.matchMedia && globalThis.matchMedia("(max-width: 850px)").matches);
  } catch {
    return !1;
  }
}
const SF = [
  { label: "Generated Notes", matcher: /(generated|overview|introduction|learning question|main note|study note)/i },
  { label: "Key Concepts", matcher: /(key concept|core concept|main idea|key idea|concept|framework)/i },
  { label: "Definitions", matcher: /(definition|term|glossary|vocabulary)/i },
  { label: "Examples", matcher: /(example|application|case|scenario|worked)/i },
  { label: "Source Evidence", matcher: /(source|evidence|citation|study|reference|figure|data)/i },
  { label: "Revision Summary", matcher: /(revision|summary|takeaway|exam|review|remember)/i }
];
function v_(t) {
  var e;
  return (e = globalThis.CSS) != null && e.escape ? globalThis.CSS.escape(t) : String(t || "").replace(/["\\]/g, "\\$&");
}
function wF(t) {
  return t != null && t.isSourceRestricted ? "Source-restricted" : (t == null ? void 0 : t.promptMode) === "research_mode" ? "Research mode" : (t == null ? void 0 : t.promptMode) === "professor_mode" ? "Professional Mode" : "Study notes";
}
function TF(t) {
  return t != null && t.isSourceRestricted ? "The tutor stays inside the uploaded source and tells you when the source is missing a point." : (t == null ? void 0 : t.promptMode) === "research_mode" ? "Notes can connect the uploaded material with extra outside research when needed." : "Notes emphasize explanation, structure, and exam-ready understanding from the current material.";
}
function AF(t) {
  const e = Object.keys((t == null ? void 0 : t.sections) || {}).filter(Boolean), n = SF.map((a) => ({
    ...a,
    items: e.filter((l) => a.matcher.test(l))
  })).filter((a) => a.items.length), r = new Set(n.flatMap((a) => a.items)), s = e.filter((a) => !r.has(a));
  return s.length && n.push({ label: "More Sections", matcher: /.*/, items: s }), !n.length && (t != null && t.aiSummary) && n.push({ label: "Generated Notes", matcher: /.*/, items: ["Full notes"] }), n;
}
function Tf(t, e, n) {
  var l, c;
  const r = String(e || ((l = t == null ? void 0 : t.studyHeadings) == null ? void 0 : l[0]) || "").trim(), s = r && ((c = t == null ? void 0 : t.sections) != null && c[r]) ? String(t.sections[r]).trim() : "", a = String(n || s || "").trim().slice(0, 1600);
  return {
    sectionTitle: r,
    excerpt: a
  };
}
function kF(t, e, n) {
  const r = n.sectionTitle ? `the section "${n.sectionTitle}"` : `the material "${(e == null ? void 0 : e.materialTitle) || "this material"}"`, s = n.excerpt ? `

Focus excerpt:
${n.excerpt}` : "";
  return t === "explain" ? `Explain ${r} more simply, step by step, using only the current material.${s}` : t === "summarize" ? `Summarise ${r} for exam revision using only the current material. Include the core claim, evidence, and likely mistake.${s}` : "";
}
function bF({ highlights: t = [], activeId: e = "", onSelect: n }) {
  return t.length ? /* @__PURE__ */ _.jsx("div", { className: "focus-source-highlight-list", children: t.map((r, s) => /* @__PURE__ */ _.jsxs(
    "button",
    {
      className: `source-highlight ${r.id === e ? "is-active" : ""}`.trim(),
      type: "button",
      onClick: () => n == null ? void 0 : n(r, { openSources: !1 }),
      children: [
        /* @__PURE__ */ _.jsx("span", { className: "source-highlight-index", children: String(s + 1).padStart(2, "0") }),
        /* @__PURE__ */ _.jsxs("span", { className: "source-highlight-copy", children: [
          /* @__PURE__ */ _.jsx("strong", { children: r.title || r.sectionTitle || r.sourceLabel || `Source ${s + 1}` }),
          /* @__PURE__ */ _.jsx("span", { children: r.excerpt || r.sourceLabel || "Open this evidence source." })
        ] }),
        /* @__PURE__ */ _.jsx(A1, { size: 14, "aria-hidden": "true" })
      ]
    },
    r.id || `${r.title}-${s}`
  )) }) : /* @__PURE__ */ _.jsx("p", { className: "focus-panel-empty", children: "No source highlights are attached to this material yet." });
}
function Af({ mode: t = "materials", materials: e = [], status: n = "ready", error: r = "", onWorkspace: s }) {
  var fe, W, J, Q, F;
  const a = H((D) => D.selectedMaterial), l = H((D) => D.openStudyPanel), c = H((D) => D.askAssistant), f = H((D) => D.setAssistantContext), m = H((D) => D.activeSourceHighlight), g = H((D) => D.selectSourceHighlight), d = H((D) => D.setActiveNoteSection), [p, v] = P.useState(""), [w, S] = P.useState(""), T = P.useRef(null);
  P.useEffect(() => {
    var X;
    if (!a) {
      v(""), S("");
      return;
    }
    const D = Object.keys(a.sections || {}).find(Boolean) || "";
    v(D), d(D), S(""), g(((X = a.sourceHighlights) == null ? void 0 : X[0]) || null, { openPanel: !1 });
  }, [a == null ? void 0 : a.materialId, g, d]);
  const A = P.useMemo(() => {
    if (!a) return "";
    const D = Aj(a.aiSummary, a.sections || {}), X = Xj(D);
    return _F(X, {
      promptMode: a.promptMode,
      collapseSecondary: xF()
    });
  }, [a]);
  P.useEffect(() => {
    A && rF();
  }, [A]);
  const b = P.useMemo(() => AF(a), [a]), E = Array.isArray(a == null ? void 0 : a.sourceHighlights) ? a.sourceHighlights : [], M = E.find((D) => D.id === (m == null ? void 0 : m.id)) || E[0] || null, C = ys(a), $ = Wo(a), I = (D) => {
    const X = D ? `/${encodeURIComponent(D)}` : "";
    globalThis.location.hash = `#/focus-room${X}`;
  }, O = (D) => {
    var me;
    v(D), d(D), f(Tf(a, D, w));
    const X = T.current;
    if (!X || D === "Full notes") return;
    const ae = `[data-section-title="${v_(D)}"]`;
    (me = X.querySelector(ae)) == null || me.scrollIntoView({ behavior: "smooth", block: "start" });
  }, L = () => {
    var X, ae, me;
    const D = String(((me = (ae = (X = globalThis.getSelection) == null ? void 0 : X.call(globalThis)) == null ? void 0 : ae.toString) == null ? void 0 : me.call(ae)) || "").trim();
    D && (S(D.slice(0, 1600)), f(Tf(a, p, D)));
  }, U = (D) => {
    const X = Tf(a, p, w);
    f(X), l("chat");
    const ae = kF(D, a, X);
    ae && c(ae);
  }, q = (D, { openSources: X = !1 } = {}) => {
    var me;
    if (!D) return;
    const ae = String(D.excerpt || "").slice(0, 1600);
    if (S(ae), g(D, { openPanel: !1 }), D.sectionTitle) {
      v(D.sectionTitle), d(D.sectionTitle);
      const _e = T.current, ke = `[data-section-title="${v_(D.sectionTitle)}"]`;
      (me = _e == null ? void 0 : _e.querySelector(ke)) == null || me.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    f({
      sectionTitle: D.sectionTitle || p,
      excerpt: ae
    }), X && l("sources");
  }, ee = (D) => {
    const X = D || M;
    X && (q(X), l("chat"), c(`Explain this source evidence and how it supports the generated notes:

${X.excerpt || X.title || X.sourceLabel}`));
  }, ne = (D = M) => {
    const X = D || {};
    s == null || s((a == null ? void 0 : a.materialId) || "", "source", {
      sourceId: X.sourceId || "",
      sourceIndex: X.sourceIndex || 0,
      sourceLabel: X.sourceLabel || "",
      sectionTitle: X.sectionTitle || p || "",
      highlightId: X.id || "",
      excerpt: X.excerpt || ""
    });
  };
  if (!a && n === "loading")
    return /* @__PURE__ */ _.jsx("p", { className: "focus-panel-empty", children: "Generating study materials..." });
  if (!a && n === "error")
    return /* @__PURE__ */ _.jsxs("p", { className: "focus-panel-empty", children: [
      "Unable to load materials. Try again. ",
      r ? `(${r})` : ""
    ] });
  if (!a)
    return /* @__PURE__ */ _.jsx("p", { className: "focus-panel-empty", children: "No generated materials yet" });
  const ie = t === "materials", ge = t !== "sources", ce = t !== "notes";
  return /* @__PURE__ */ _.jsxs("section", { className: `study-tool-stack focus-material-layout focus-material-mode-${t}`.trim(), children: [
    ie ? /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite focus-material-meta", children: [
      /* @__PURE__ */ _.jsxs("div", { className: "study-tool-head", children: [
        /* @__PURE__ */ _.jsxs("div", { children: [
          /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Study Materials" }),
          /* @__PURE__ */ _.jsx("h3", { children: a.materialTitle || "Generated study notes" })
        ] }),
        /* @__PURE__ */ _.jsxs("label", { className: "focus-field focus-material-select", children: [
          "Material",
          /* @__PURE__ */ _.jsx("select", { value: a.materialId, onChange: (D) => I(D.target.value), children: e.map((D) => /* @__PURE__ */ _.jsx("option", { value: D.materialId, children: D.materialTitle || "Study material" }, D.materialId)) })
        ] })
      ] }),
      /* @__PURE__ */ _.jsxs("div", { className: "focus-material-badges", children: [
        /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ _.jsx(Fp, { size: 14, "aria-hidden": "true" }),
          " ",
          wF(a)
        ] }),
        /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ _.jsx(QN, { size: 14, "aria-hidden": "true" }),
          " ",
          Object.keys(a.sections || {}).length || a.studyHeadings.length || 1,
          " sections"
        ] }),
        /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ _.jsx(GN, { size: 14, "aria-hidden": "true" }),
          " ",
          E.length || ((fe = a.sources) == null ? void 0 : fe.length) || ((W = a.sourceItems) == null ? void 0 : W.length) || 0,
          " sources"
        ] })
      ] }),
      /* @__PURE__ */ _.jsx("p", { className: "focus-subtle-copy", children: TF(a) }),
      a.isSourceRestricted ? /* @__PURE__ */ _.jsxs("div", { className: "focus-source-banner", children: [
        /* @__PURE__ */ _.jsx("strong", { children: "Source-restricted mode" }),
        /* @__PURE__ */ _.jsx("span", { children: "Answers and summaries stay inside the uploaded material. When the source is missing something, Synapse says so directly." })
      ] }) : null,
      /* @__PURE__ */ _.jsxs("div", { className: "focus-action-grid", children: [
        /* @__PURE__ */ _.jsxs(de, { variant: "primary", onClick: () => U("explain"), children: [
          /* @__PURE__ */ _.jsx(Su, { size: 16, "aria-hidden": "true" }),
          " Explain this section"
        ] }),
        /* @__PURE__ */ _.jsx(de, { onClick: () => C.length ? l("quiz") : s == null ? void 0 : s(a.materialId || "", "quiz"), children: "Make quiz from this section" }),
        /* @__PURE__ */ _.jsx(de, { onClick: () => $.length ? l("flashcards") : s == null ? void 0 : s(a.materialId || "", "flashcards"), children: "Turn this into flashcards" }),
        /* @__PURE__ */ _.jsx(de, { onClick: () => a.mindMap ? l("mindmap") : s == null ? void 0 : s(a.materialId || "", "mindmap"), children: "Create mind map from this section" }),
        /* @__PURE__ */ _.jsx(de, { onClick: () => U("summarize"), children: "Summarise for exam revision" }),
        /* @__PURE__ */ _.jsxs(de, { onClick: () => l("notes"), children: [
          /* @__PURE__ */ _.jsx(wu, { size: 16, "aria-hidden": "true" }),
          " Read generated notes"
        ] }),
        /* @__PURE__ */ _.jsxs(de, { onClick: () => l("sources"), disabled: !E.length, children: [
          /* @__PURE__ */ _.jsx(Gl, { size: 16, "aria-hidden": "true" }),
          " Inspect sources"
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite focus-material-outline", children: [
      /* @__PURE__ */ _.jsxs("div", { className: "study-tool-head", children: [
        /* @__PURE__ */ _.jsxs("div", { children: [
          /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Section Map" }),
          /* @__PURE__ */ _.jsx("h3", { children: "Read inside the room" })
        ] }),
        /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ _.jsx(wu, { size: 14, "aria-hidden": "true" }),
          " Full content"
        ] })
      ] }),
      /* @__PURE__ */ _.jsx("div", { className: "focus-section-groups", children: b.map((D) => /* @__PURE__ */ _.jsxs("div", { className: "focus-section-group", children: [
        /* @__PURE__ */ _.jsx("strong", { children: D.label }),
        /* @__PURE__ */ _.jsx("div", { className: "focus-section-chip-row", children: D.items.map((X) => /* @__PURE__ */ _.jsxs(
          "button",
          {
            className: `focus-section-chip ${p === X ? "is-active" : ""}`.trim(),
            type: "button",
            onClick: () => O(X),
            children: [
              /* @__PURE__ */ _.jsx("span", { children: X }),
              /* @__PURE__ */ _.jsx(A1, { size: 14, "aria-hidden": "true" })
            ]
          },
          X
        )) })
      ] }, D.label)) }),
      !!((J = a.sources) != null && J.length || (Q = a.sourceItems) != null && Q.length) && /* @__PURE__ */ _.jsx("div", { className: "focus-source-list", children: ((F = a.sources) != null && F.length ? a.sources : a.sourceItems).slice(0, 6).map((D, X) => {
        const ae = typeof D == "string" ? D : (D == null ? void 0 : D.title) || (D == null ? void 0 : D.name) || (D == null ? void 0 : D.label) || (D == null ? void 0 : D.url) || `Source ${X + 1}`;
        return /* @__PURE__ */ _.jsx("span", { className: "focus-pill", children: ae }, `${ae}-${X}`);
      }) }),
      E.length ? /* @__PURE__ */ _.jsxs("div", { className: "focus-source-highlight-strip", "aria-label": "Generated source highlights", children: [
        /* @__PURE__ */ _.jsxs("div", { className: "study-tool-head compact", children: [
          /* @__PURE__ */ _.jsxs("div", { children: [
            /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Source Highlights" }),
            /* @__PURE__ */ _.jsx("h3", { children: "Evidence you can jump to" })
          ] }),
          /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
            /* @__PURE__ */ _.jsx(Gl, { size: 14, "aria-hidden": "true" }),
            " ",
            E.length
          ] })
        ] }),
        /* @__PURE__ */ _.jsx(
          bF,
          {
            highlights: E.slice(0, t === "sources" ? E.length : 5),
            activeId: (M == null ? void 0 : M.id) || "",
            onSelect: (D) => q(D, { openSources: t !== "sources" })
          }
        )
      ] }) : null
    ] }),
    ce ? /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite focus-source-workbench", children: [
      /* @__PURE__ */ _.jsxs("div", { className: "study-tool-head", children: [
        /* @__PURE__ */ _.jsxs("div", { children: [
          /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Source Workbench" }),
          /* @__PURE__ */ _.jsx("h3", { children: (M == null ? void 0 : M.sourceLabel) || "Uploaded sources" })
        ] }),
        /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ _.jsx(dI, { size: 14, "aria-hidden": "true" }),
          " Direct source"
        ] })
      ] }),
      M ? /* @__PURE__ */ _.jsxs("div", { className: "focus-source-preview-card", children: [
        /* @__PURE__ */ _.jsxs("div", { className: "focus-source-preview-meta", children: [
          /* @__PURE__ */ _.jsx("span", { children: M.sourceKind || "source" }),
          /* @__PURE__ */ _.jsx("strong", { children: M.title || M.sourceLabel }),
          M.sectionTitle ? /* @__PURE__ */ _.jsxs("button", { type: "button", onClick: () => O(M.sectionTitle), children: [
            "Jump to ",
            M.sectionTitle
          ] }) : null
        ] }),
        /* @__PURE__ */ _.jsx("blockquote", { children: M.excerpt || "No extracted excerpt is available for this source yet." }),
        /* @__PURE__ */ _.jsxs("div", { className: "focus-button-row", children: [
          /* @__PURE__ */ _.jsxs(de, { variant: "primary", onClick: () => ee(M), children: [
            /* @__PURE__ */ _.jsx(Su, { size: 16, "aria-hidden": "true" }),
            " Ask AI about this source"
          ] }),
          /* @__PURE__ */ _.jsxs(de, { onClick: () => ne(M), children: [
            /* @__PURE__ */ _.jsx(HN, { size: 16, "aria-hidden": "true" }),
            " Open source in workspace"
          ] })
        ] })
      ] }) : /* @__PURE__ */ _.jsx("p", { className: "focus-panel-empty", children: "No source highlights are attached to this material yet. Open the workspace source viewer to restore previews for older notes." })
    ] }) : null,
    ge ? /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite focus-material-reader", children: [
      /* @__PURE__ */ _.jsxs("div", { className: "study-tool-head", children: [
        /* @__PURE__ */ _.jsxs("div", { children: [
          /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Generated Notes" }),
          /* @__PURE__ */ _.jsx("h3", { children: p || "Scrollable reading view" })
        ] }),
        w ? /* @__PURE__ */ _.jsx("span", { className: "focus-pill", children: "Text selected for AI follow-up" }) : null
      ] }),
      E.length ? /* @__PURE__ */ _.jsx("div", { className: "focus-reader-source-bar", children: E.slice(0, 4).map((D, X) => /* @__PURE__ */ _.jsxs(
        "button",
        {
          className: `source-highlight inline ${D.id === (M == null ? void 0 : M.id) ? "is-active" : ""}`.trim(),
          type: "button",
          onClick: () => q(D, { openSources: !0 }),
          children: [
            /* @__PURE__ */ _.jsx(Gl, { size: 14, "aria-hidden": "true" }),
            /* @__PURE__ */ _.jsx("span", { children: D.title || D.sourceLabel || `Source ${X + 1}` })
          ]
        },
        D.id || X
      )) }) : null,
      /* @__PURE__ */ _.jsx(
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
function CF({ onWorkspace: t }) {
  const e = H((c) => c.selectedMaterial), n = H((c) => c.workspaceNotes), r = H((c) => c.workspaceUpdatedAt), s = H((c) => c.setWorkspaceNotes), a = H((c) => c.openStudyPanel), l = r ? `Autosaved ${new Date(r).toLocaleString()}` : "Autosave on";
  return /* @__PURE__ */ _.jsx("section", { className: "study-tool-stack", children: /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite focus-notes-card", children: [
    /* @__PURE__ */ _.jsxs("div", { className: "study-tool-head", children: [
      /* @__PURE__ */ _.jsxs("div", { children: [
        /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Workspace Notes" }),
        /* @__PURE__ */ _.jsx("h3", { children: (e == null ? void 0 : e.materialTitle) || "Study notes" })
      ] }),
      /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
        /* @__PURE__ */ _.jsx(wu, { size: 14, "aria-hidden": "true" }),
        " ",
        l
      ] })
    ] }),
    /* @__PURE__ */ _.jsx(
      "textarea",
      {
        className: "answer-input focus-notes-textarea",
        placeholder: "Capture connections, revision cues, questions, and mistakes while you study...",
        value: n,
        onChange: (c) => s(c.target.value)
      }
    ),
    /* @__PURE__ */ _.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ _.jsxs(de, { variant: "primary", onClick: () => a("materials"), children: [
        /* @__PURE__ */ _.jsx(Fp, { size: 16, "aria-hidden": "true" }),
        " Back to materials"
      ] }),
      /* @__PURE__ */ _.jsx(de, { onClick: () => t == null ? void 0 : t((e == null ? void 0 : e.materialId) || "", "assistant"), children: "Open full workspace" })
    ] })
  ] }) });
}
function PF({ mindMap: t }) {
  if (!t)
    return /* @__PURE__ */ _.jsx("p", { children: "No mind map is attached to this material yet. Return to the workspace and generate one from your notes." });
  const e = Array.isArray(t.branches) ? t.branches : [];
  return e.length ? /* @__PURE__ */ _.jsxs("div", { className: "mindmap-viewer", children: [
    /* @__PURE__ */ _.jsx("div", { className: "mindmap-center", children: t.center || "Study Notes" }),
    /* @__PURE__ */ _.jsx("div", { className: "mindmap-branches", children: e.slice(0, 10).map((n, r) => /* @__PURE__ */ _.jsxs("article", { className: "mindmap-branch liquid-glass-lite", children: [
      /* @__PURE__ */ _.jsx("strong", { children: n.title || `Branch ${r + 1}` }),
      /* @__PURE__ */ _.jsx("p", { children: n.summary || n.detail || "Open this branch in the workspace for more detail." })
    ] }, `${n.title || "Branch"}-${r}`)) })
  ] }) : /* @__PURE__ */ _.jsx("pre", { className: "mindmap-json", children: JSON.stringify(t, null, 2) });
}
function EF({ questions: t }) {
  const e = H((l) => l.quizAnswers), n = H((l) => l.quizChecked), r = H((l) => l.answerQuizQuestion), s = H((l) => l.checkQuizQuestion), a = H((l) => {
    const c = Object.values(l.quizChecked || {}).filter((f) => f && f.hasKnownAnswer);
    return c.length ? Math.round(c.filter((f) => f.correct).length / c.length * 100) : null;
  });
  return /* @__PURE__ */ _.jsxs("div", { className: "quiz-stack", children: [
    a === null ? null : /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
      "Current score ",
      a,
      "%"
    ] }),
    t.map((l, c) => {
      const f = e[c], m = n[c] || null, g = vs(l), d = typeof f == "string" ? f : "", p = jI(l, f);
      return /* @__PURE__ */ _.jsxs("article", { className: "quiz-card liquid-glass-lite", children: [
        /* @__PURE__ */ _.jsxs("span", { className: "focus-kicker", children: [
          l.quizTitle || "Quiz",
          " / Question ",
          c + 1
        ] }),
        /* @__PURE__ */ _.jsx("h3", { children: Sh(l, c) }),
        g.length ? /* @__PURE__ */ _.jsx("div", { className: "focus-button-row", children: g.map((v, w) => /* @__PURE__ */ _.jsx(
          de,
          {
            variant: FI(l, f, w) ? "primary" : "ghost",
            onClick: () => r(c, w),
            children: v
          },
          v
        )) }) : /* @__PURE__ */ _.jsx(
          "textarea",
          {
            className: "answer-input",
            value: d,
            onChange: (v) => r(c, v.target.value)
          }
        ),
        /* @__PURE__ */ _.jsx(de, { variant: "primary", disabled: !p, onClick: () => s(c), children: "Check answer" }),
        m ? /* @__PURE__ */ _.jsxs("p", { children: [
          m.hasKnownAnswer ? m.correct ? "Correct" : "Review this one" : "Answer saved for review",
          m.explanation ? ` - ${m.explanation}` : ""
        ] }) : null
      ] }, `${Sh(l, c)}-${c}`);
    })
  ] });
}
function MF({ onWorkspace: t }) {
  const { data: e = [] } = uT();
  return /* @__PURE__ */ _.jsx("section", { className: "study-tool-stack", children: /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ _.jsxs("div", { className: "study-tool-head", children: [
      /* @__PURE__ */ _.jsxs("div", { children: [
        /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Study History" }),
        /* @__PURE__ */ _.jsx("h3", { children: "Recent focus sessions" })
      ] }),
      /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
        /* @__PURE__ */ _.jsx(jp, { size: 14, "aria-hidden": "true" }),
        " ",
        e.length,
        " saved"
      ] })
    ] }),
    /* @__PURE__ */ _.jsx("div", { className: "history-list", children: e.length ? e.map((n) => {
      const r = n.sessionDate || n.endedAt || n.startedAt || "";
      return /* @__PURE__ */ _.jsxs("article", { className: "history-row liquid-glass-lite", children: [
        /* @__PURE__ */ _.jsx("strong", { children: n.materialTitle || "Study material" }),
        /* @__PURE__ */ _.jsx("span", { children: r ? new Date(r).toLocaleString() : "Saved session" }),
        n.studyGoal ? /* @__PURE__ */ _.jsx("p", { children: n.studyGoal }) : null,
        /* @__PURE__ */ _.jsxs("p", { children: [
          "Focused ",
          Math.round((Number(n.totalFocusTime) || 0) / 60),
          "m",
          n.quizScore === null || n.quizScore === void 0 ? "" : ` · Quiz ${n.quizScore}%`,
          n.flashcardsCompleted ? ` · ${n.flashcardsCompleted} cards` : ""
        ] })
      ] }, n.sessionId);
    }) : /* @__PURE__ */ _.jsx("p", { className: "focus-panel-empty", children: "No Focus Room sessions saved yet." }) }),
    /* @__PURE__ */ _.jsx("div", { className: "focus-button-row", children: /* @__PURE__ */ _.jsx(de, { variant: "primary", onClick: () => t == null ? void 0 : t(), children: "Open Workspace" }) })
  ] }) });
}
function Hi({ label: t, action: e, materialId: n, onWorkspace: r }) {
  return /* @__PURE__ */ _.jsx("div", { className: "focus-button-row", children: /* @__PURE__ */ _.jsx(de, { variant: "primary", onClick: () => r == null ? void 0 : r(n || "", e), children: t }) });
}
function RF({ onWorkspace: t }) {
  const e = H((l) => l.studyPlan), n = H((l) => l.completedTasks), r = H((l) => l.updatePlanTask), s = H((l) => l.toggleTask), a = H((l) => l.selectedMaterial);
  return /* @__PURE__ */ _.jsx("section", { className: "study-tool-stack", children: /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ _.jsxs("div", { className: "study-tool-head", children: [
      /* @__PURE__ */ _.jsxs("div", { children: [
        /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Study Plan" }),
        /* @__PURE__ */ _.jsx("h3", { children: "Guide the current block" })
      ] }),
      /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
        n.length,
        "/",
        e.length,
        " complete"
      ] })
    ] }),
    /* @__PURE__ */ _.jsx("div", { className: "plan-editor", children: e.map((l, c) => /* @__PURE__ */ _.jsxs("article", { className: "plan-edit-item liquid-glass-lite", children: [
      /* @__PURE__ */ _.jsxs("label", { className: "focus-field", children: [
        "Minutes",
        /* @__PURE__ */ _.jsx("input", { value: l.minutes, type: "number", min: "1", max: "180", onChange: (f) => r(c, f.target.value, null) })
      ] }),
      /* @__PURE__ */ _.jsxs("label", { className: "focus-field", children: [
        "Task",
        /* @__PURE__ */ _.jsx("textarea", { value: l.task, onChange: (f) => r(c, null, f.target.value) })
      ] }),
      /* @__PURE__ */ _.jsx(
        de,
        {
          variant: n.includes(l.task) ? "primary" : "ghost",
          onClick: () => s(c),
          children: n.includes(l.task) ? "Completed" : "Mark complete"
        }
      )
    ] }, `${l.task}-${c}`)) }),
    /* @__PURE__ */ _.jsx("div", { className: "focus-button-row", children: /* @__PURE__ */ _.jsx(de, { onClick: () => t == null ? void 0 : t((a == null ? void 0 : a.materialId) || "", "timeline"), children: "Open Timeline Workspace" }) })
  ] }) });
}
function NF({ tab: t, materials: e, materialsStatus: n, materialsError: r, onWorkspace: s }) {
  const a = H((l) => l.selectedMaterial);
  if (t === "materials")
    return /* @__PURE__ */ _.jsx(
      Af,
      {
        mode: "materials",
        materials: e,
        status: n,
        error: r,
        onWorkspace: s
      }
    );
  if (t === "history")
    return /* @__PURE__ */ _.jsx(MF, { onWorkspace: s });
  if (!a)
    return /* @__PURE__ */ _.jsx("p", { className: "focus-panel-empty", children: "No generated materials yet" });
  if (t === "notes")
    return /* @__PURE__ */ _.jsx(
      Af,
      {
        mode: "notes",
        materials: e,
        status: n,
        error: r,
        onWorkspace: s
      }
    );
  if (t === "sources")
    return /* @__PURE__ */ _.jsx(
      Af,
      {
        mode: "sources",
        materials: e,
        status: n,
        error: r,
        onWorkspace: s
      }
    );
  if (t === "flashcards") {
    const l = Wo(a);
    return l.length ? /* @__PURE__ */ _.jsxs(_.Fragment, { children: [
      /* @__PURE__ */ _.jsx(wj, { cards: l }),
      /* @__PURE__ */ _.jsx(Hi, { label: "Open Flashcard Workspace", action: "flashcards", materialId: a.materialId, onWorkspace: s })
    ] }) : /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite", children: [
      /* @__PURE__ */ _.jsx("h3", { children: "Flashcards" }),
      /* @__PURE__ */ _.jsx("p", { children: "No flashcards are attached to this material yet." }),
      /* @__PURE__ */ _.jsx(Hi, { label: "Open Flashcard Workspace", action: "flashcards", materialId: a.materialId, onWorkspace: s })
    ] });
  }
  if (t === "quiz") {
    const l = ys(a);
    return l.length ? /* @__PURE__ */ _.jsxs(_.Fragment, { children: [
      /* @__PURE__ */ _.jsx(EF, { questions: l }),
      /* @__PURE__ */ _.jsx(Hi, { label: "Open Quiz Workspace", action: "quiz", materialId: a.materialId, onWorkspace: s })
    ] }) : /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite", children: [
      /* @__PURE__ */ _.jsx("h3", { children: "Quiz" }),
      /* @__PURE__ */ _.jsx("p", { children: "No saved quiz is attached to this material yet." }),
      /* @__PURE__ */ _.jsx(Hi, { label: "Open Quiz Workspace", action: "quiz", materialId: a.materialId, onWorkspace: s })
    ] });
  }
  return t === "mindmap" ? /* @__PURE__ */ _.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ _.jsx("h3", { children: "Mind Map" }),
    /* @__PURE__ */ _.jsx(PF, { mindMap: a.mindMap }),
    /* @__PURE__ */ _.jsx(Hi, { label: "Open Mind Map Workspace", action: "mindmap", materialId: a.materialId, onWorkspace: s })
  ] }) : t === "chat" ? /* @__PURE__ */ _.jsxs(_.Fragment, { children: [
    /* @__PURE__ */ _.jsx(Sj, {}),
    /* @__PURE__ */ _.jsx(Hi, { label: "Open Workspace Assistant", action: "assistant", materialId: a.materialId, onWorkspace: s })
  ] }) : t === "plan" ? /* @__PURE__ */ _.jsx(RF, { onWorkspace: s }) : t === "workspace" ? /* @__PURE__ */ _.jsx(CF, { onWorkspace: s }) : null;
}
function IF({ onWorkspace: t }) {
  const e = H((f) => f.aiPanelOpen), n = H((f) => f.panelTab), r = H((f) => f.toggleAIPanel), s = H((f) => f.setPanelTab), a = H((f) => f.materials), l = H((f) => f.materialsStatus), c = H((f) => f.materialsError);
  return /* @__PURE__ */ _.jsx(zw, { modal: !1, open: e, onOpenChange: r, children: /* @__PURE__ */ _.jsx(Xo, { children: e ? /* @__PURE__ */ _.jsxs($w, { forceMount: !0, children: [
    /* @__PURE__ */ _.jsx(Vw, { asChild: !0, children: /* @__PURE__ */ _.jsx(
      cn.div,
      {
        className: "ai-panel-scrim",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ _.jsx(Bw, { asChild: !0, children: /* @__PURE__ */ _.jsxs(
      cn.aside,
      {
        className: "ai-learning-panel liquid-glass extra-panel focus-tool-panel",
        initial: { opacity: 0, x: 42 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 42 },
        transition: is,
        children: [
          /* @__PURE__ */ _.jsxs("div", { className: "drawer-head", children: [
            /* @__PURE__ */ _.jsxs("div", { children: [
              /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Synapse Study Suite" }),
              /* @__PURE__ */ _.jsx(Uw, { children: n === "materials" ? "Materials Workspace" : Z0(n) }),
              /* @__PURE__ */ _.jsx(Hw, { className: "sr-only", children: "Focus Room study suite with materials, AI chat, quiz, flashcards, mind map, notes, study plan, and history." })
            ] }),
            /* @__PURE__ */ _.jsx(qD, { asChild: !0, children: /* @__PURE__ */ _.jsx(de, { "aria-label": "Close study suite", children: /* @__PURE__ */ _.jsx(R1, { size: 16, "aria-hidden": "true" }) }) })
          ] }),
          /* @__PURE__ */ _.jsxs(dj, { className: "ai-tabs", value: n, onValueChange: s, children: [
            /* @__PURE__ */ _.jsx(fj, { className: "ai-tab-row", "aria-label": "Focus Room study tools", children: vh.map((f) => /* @__PURE__ */ _.jsx(hj, { className: "ai-tab-trigger", value: f, children: Z0(f) }, f)) }),
            vh.map((f) => /* @__PURE__ */ _.jsx(pj, { className: "ai-tab-content", value: f, children: /* @__PURE__ */ _.jsx(
              NF,
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
function DF(t) {
  return /* @__PURE__ */ _.jsx(IF, { ...t });
}
function jF({ onWorkspace: t, onHistory: e }) {
  const n = H((d) => d.summaryRecord), r = H((d) => d.selectedMaterial), s = H((d) => d.closeSummary), a = H((d) => d.openStudyPanel), l = H((d) => d.startTimer), c = () => {
    s(), a("history");
  }, f = () => {
    s(), t == null || t();
  }, m = Wo(r), g = ys(r);
  return /* @__PURE__ */ _.jsx(zw, { open: !!n, onOpenChange: (d) => !d && s(), children: /* @__PURE__ */ _.jsx(Xo, { children: n ? /* @__PURE__ */ _.jsxs($w, { forceMount: !0, children: [
    /* @__PURE__ */ _.jsx(Vw, { asChild: !0, children: /* @__PURE__ */ _.jsx(
      cn.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ _.jsx(Bw, { asChild: !0, children: /* @__PURE__ */ _.jsxs(
      cn.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ _.jsx(Uw, { children: n.materialTitle }),
          /* @__PURE__ */ _.jsx(Hw, { className: "sr-only", children: "Summary of focus time, flashcards, quiz score, completed tasks, and recommended next step." }),
          /* @__PURE__ */ _.jsx("p", { children: n.aiReflection }),
          /* @__PURE__ */ _.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ _.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ _.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ _.jsx("strong", { children: Iu(n.totalFocusTime) })
            ] }),
            /* @__PURE__ */ _.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ _.jsx("span", { children: "Flashcards" }),
              /* @__PURE__ */ _.jsx("strong", { children: n.flashcardsCompleted })
            ] }),
            /* @__PURE__ */ _.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ _.jsx("span", { children: "Quiz score" }),
              /* @__PURE__ */ _.jsx("strong", { children: n.quizScore === null ? "N/A" : `${n.quizScore}%` })
            ] }),
            /* @__PURE__ */ _.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ _.jsx("span", { children: "Tasks" }),
              /* @__PURE__ */ _.jsx("strong", { children: n.completedTasks.length })
            ] })
          ] }),
          n.mistakesMade.length ? /* @__PURE__ */ _.jsxs("p", { children: [
            "Review: ",
            n.mistakesMade.join("; ")
          ] }) : null,
          n.persisted === !1 ? /* @__PURE__ */ _.jsx("p", { children: "This session is visible for now, but could not be saved to this device history." }) : null,
          /* @__PURE__ */ _.jsx("p", { children: n.recommendedNextStep }),
          /* @__PURE__ */ _.jsxs("div", { className: "focus-button-row", children: [
            /* @__PURE__ */ _.jsx(de, { variant: "primary", onClick: () => {
              s(), l();
            }, children: "Continue studying" }),
            /* @__PURE__ */ _.jsx(de, { onClick: () => {
              s(), a(g.length ? "quiz" : "materials");
            }, children: "Start quiz" }),
            /* @__PURE__ */ _.jsx(de, { onClick: () => {
              s(), a(m.length ? "flashcards" : "materials");
            }, children: "Review flashcards" }),
            /* @__PURE__ */ _.jsx(de, { onClick: () => {
              s(), a(r != null && r.mindMap ? "mindmap" : "materials");
            }, children: "Open mind map" }),
            /* @__PURE__ */ _.jsx(de, { onClick: c, children: "View History" }),
            /* @__PURE__ */ _.jsx(de, { onClick: f, children: "Workspace" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function FF() {
  var m, g;
  const t = H((d) => d.selectedMaterial), e = H((d) => d.selectedScene), n = H((d) => d.studyGoal), r = H((d) => d.studyPlan), s = H((d) => d.completedTasks), a = H((d) => d.workspaceNotes), l = H((d) => d.openStudyPanel), c = gs(e), f = ((m = r.find((d) => !s.includes(d.task))) == null ? void 0 : m.task) || "Review and consolidate this block.";
  return /* @__PURE__ */ _.jsxs("aside", { className: "session-overview liquid-glass", children: [
    /* @__PURE__ */ _.jsxs("div", { className: "session-overview-head", children: [
      /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Current Session" }),
      /* @__PURE__ */ _.jsx("h2", { children: c.name }),
      /* @__PURE__ */ _.jsx("p", { children: (t == null ? void 0 : t.materialTitle) || "Study material" })
    ] }),
    /* @__PURE__ */ _.jsxs("div", { className: "session-overview-copy", children: [
      /* @__PURE__ */ _.jsxs("div", { className: "session-stat-row", children: [
        /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ _.jsx(k1, { size: 14, "aria-hidden": "true" }),
          " ",
          t != null && t.isSourceRestricted ? "Source-restricted" : "Adaptive notes"
        ] }),
        /* @__PURE__ */ _.jsxs("span", { className: "focus-pill", children: [
          /* @__PURE__ */ _.jsx(Dp, { size: 14, "aria-hidden": "true" }),
          " ",
          Object.keys((t == null ? void 0 : t.sections) || {}).length || ((g = t == null ? void 0 : t.studyHeadings) == null ? void 0 : g.length) || 1,
          " sections"
        ] })
      ] }),
      /* @__PURE__ */ _.jsxs("div", { className: "session-goal-block", children: [
        /* @__PURE__ */ _.jsx("strong", { children: "Study goal" }),
        /* @__PURE__ */ _.jsx("p", { children: n || `Study ${(t == null ? void 0 : t.materialTitle) || "this material"}` })
      ] }),
      /* @__PURE__ */ _.jsxs("div", { className: "session-goal-block", children: [
        /* @__PURE__ */ _.jsx("strong", { children: "Next task" }),
        /* @__PURE__ */ _.jsx("p", { children: f })
      ] })
    ] }),
    /* @__PURE__ */ _.jsxs("div", { className: "session-mini-grid", children: [
      /* @__PURE__ */ _.jsxs("button", { className: "session-mini-card", type: "button", onClick: () => l("materials"), children: [
        /* @__PURE__ */ _.jsx(wu, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ _.jsx("span", { children: "Materials" })
      ] }),
      /* @__PURE__ */ _.jsxs("button", { className: "session-mini-card", type: "button", onClick: () => l("chat"), children: [
        /* @__PURE__ */ _.jsx(Su, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ _.jsx("span", { children: "AI tutor" })
      ] }),
      /* @__PURE__ */ _.jsxs("button", { className: "session-mini-card", type: "button", onClick: () => l("plan"), children: [
        /* @__PURE__ */ _.jsx(JN, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ _.jsxs("span", { children: [
          s.length,
          "/",
          r.length || 0,
          " tasks"
        ] })
      ] }),
      /* @__PURE__ */ _.jsxs("button", { className: "session-mini-card", type: "button", onClick: () => l("workspace"), children: [
        /* @__PURE__ */ _.jsx(b1, { size: 16, "aria-hidden": "true" }),
        /* @__PURE__ */ _.jsx("span", { children: a.trim() ? "Notes saved" : "Notes ready" })
      ] })
    ] }),
    /* @__PURE__ */ _.jsxs("div", { className: "focus-button-row session-overview-actions", children: [
      /* @__PURE__ */ _.jsx(de, { variant: "primary", onClick: () => l("materials"), children: "Open materials" }),
      /* @__PURE__ */ _.jsxs(de, { onClick: () => l("history"), children: [
        /* @__PURE__ */ _.jsx(jp, { size: 16, "aria-hidden": "true" }),
        " History"
      ] })
    ] })
  ] });
}
function OF({ onWorkspace: t }) {
  const { data: e = [] } = uT();
  return /* @__PURE__ */ _.jsxs("section", { className: "history-stage", children: [
    /* @__PURE__ */ _.jsxs(Po, { className: "history-main", children: [
      /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: "Synapse Focus Room" }),
      /* @__PURE__ */ _.jsx("h1", { children: "Study History" }),
      /* @__PURE__ */ _.jsx("p", { children: "Review recent Focus Room sessions saved on this device." }),
      /* @__PURE__ */ _.jsx("div", { className: "history-list", children: e.length ? e.map((n) => {
        const r = n.sessionDate || n.endedAt || n.startedAt || "", s = r ? new Date(r).toLocaleString() : "Saved session";
        return /* @__PURE__ */ _.jsxs("article", { className: "history-row liquid-glass-lite", children: [
          /* @__PURE__ */ _.jsx("strong", { children: n.materialTitle || "Study material" }),
          /* @__PURE__ */ _.jsxs("span", { children: [
            s,
            " / ",
            Iu(n.totalFocusTime || 0)
          ] }),
          n.studyGoal ? /* @__PURE__ */ _.jsx("p", { children: n.studyGoal }) : null,
          n.persisted === !1 ? /* @__PURE__ */ _.jsx("p", { children: "Not saved to device history" }) : null
        ] }, n.sessionId);
      }) : /* @__PURE__ */ _.jsx("p", { children: "No Focus Room sessions saved yet." }) })
    ] }),
    /* @__PURE__ */ _.jsxs(Po, { className: "history-next", children: [
      /* @__PURE__ */ _.jsx("h2", { children: "Next step" }),
      /* @__PURE__ */ _.jsx("p", { children: "Choose a material from the workspace to start another protected study block." }),
      /* @__PURE__ */ _.jsx(de, { variant: "primary", onClick: () => t(), children: "Open Workspace" })
    ] })
  ] });
}
function __({ title: t, kicker: e, children: n }) {
  const r = H((s) => s.closeDrawer);
  return /* @__PURE__ */ _.jsxs(
    cn.aside,
    {
      className: "extra-panel drawer-open liquid-glass",
      initial: { opacity: 0, x: 28 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 28 },
      transition: is,
      children: [
        /* @__PURE__ */ _.jsxs("div", { className: "drawer-head", children: [
          /* @__PURE__ */ _.jsxs("div", { children: [
            /* @__PURE__ */ _.jsx("span", { className: "focus-kicker", children: e }),
            /* @__PURE__ */ _.jsx("h2", { children: t })
          ] }),
          /* @__PURE__ */ _.jsx(de, { "aria-label": `Close ${t}`, onClick: r, children: /* @__PURE__ */ _.jsx(R1, { size: 16, "aria-hidden": "true" }) })
        ] }),
        n
      ]
    }
  );
}
function LF({ audioState: t }) {
  const e = H((n) => n.activeDrawer);
  return /* @__PURE__ */ _.jsxs(Xo, { children: [
    e === "scene" ? /* @__PURE__ */ _.jsx(__, { title: "Choose Scene", kicker: "Scene", children: /* @__PURE__ */ _.jsx(z1, {}) }) : null,
    e === "music" ? /* @__PURE__ */ _.jsx(__, { title: "Sound Atmosphere", kicker: "Music", children: /* @__PURE__ */ _.jsx(lw, { audioState: t }) }) : null
  ] });
}
var kf = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var x_;
function zF() {
  return x_ || (x_ = 1, (function(t) {
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
                for (var w = p._howls[v]._getSoundIds(), S = 0; S < w.length; S++) {
                  var T = p._howls[v]._soundById(w[S]);
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
              for (var w = p._howls[v]._getSoundIds(), S = 0; S < w.length; S++) {
                var T = p._howls[v]._soundById(w[S]);
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
          var v = p.canPlayType("audio/mpeg;").replace(/^no$/, ""), w = d._navigator ? d._navigator.userAgent : "", S = w.match(/OPR\/(\d+)/g), T = S && parseInt(S[0].split("/")[1], 10) < 33, A = w.indexOf("Safari") !== -1 && w.indexOf("Chrome") === -1, b = w.match(/Version\/(.*?) /), E = A && b && parseInt(b[1], 10) < 15;
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
            weba: !!(!E && p.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            webm: !!(!E && p.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
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
              for (var S = 0; S < d._howls.length; S++)
                if (!d._howls[S]._webAudio)
                  for (var T = d._howls[S]._getSoundIds(), A = 0; A < T.length; A++) {
                    var b = d._howls[S]._soundById(T[A]);
                    b && b._node && !b._node._unlocked && (b._node._unlocked = !0, b._node.load());
                  }
              d._autoResume();
              var E = d.ctx.createBufferSource();
              E.buffer = d._scratchBuffer, E.connect(d.ctx.destination), typeof E.start > "u" ? E.noteOn(0) : E.start(0), typeof d.ctx.resume == "function" && d.ctx.resume(), E.onended = function() {
                E.disconnect(0), d._audioUnlocked = !0, document.removeEventListener("touchstart", p, !0), document.removeEventListener("touchend", p, !0), document.removeEventListener("click", p, !0), document.removeEventListener("keydown", p, !0);
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
            var w, S;
            if (d._format && d._format[v])
              w = d._format[v];
            else {
              if (S = d._src[v], typeof S != "string") {
                d._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              w = /^data:audio\/([^;,]+);/i.exec(S), w || (w = /\.([^.]+)$/.exec(S.split("?", 1)[0])), w && (w = w[1].toLowerCase());
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
              for (var S = 0, T = 0; T < v._sounds.length; T++)
                v._sounds[T]._paused && !v._sounds[T]._ended && (S++, w = v._sounds[T]._id);
              S === 1 ? d = null : w = null;
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
          var E = Math.max(0, A._seek > 0 ? A._seek : v._sprite[d][0] / 1e3), M = Math.max(0, (v._sprite[d][0] + v._sprite[d][1]) / 1e3 - E), C = M * 1e3 / Math.abs(A._rate), $ = v._sprite[d][0] / 1e3, I = (v._sprite[d][0] + v._sprite[d][1]) / 1e3;
          A._sprite = d, A._ended = !1;
          var O = function() {
            A._paused = !1, A._seek = E, A._start = $, A._stop = I, A._loop = !!(A._loop || v._sprite[d][2]);
          };
          if (E >= I) {
            v._ended(A);
            return;
          }
          var L = A._node;
          if (v._webAudio) {
            var U = function() {
              v._playLock = !1, O(), v._refreshBuffer(A);
              var ie = A._muted || v._muted ? 0 : A._volume;
              L.gain.setValueAtTime(ie, n.ctx.currentTime), A._playStart = n.ctx.currentTime, typeof L.bufferSource.start > "u" ? A._loop ? L.bufferSource.noteGrainOn(0, E, 86400) : L.bufferSource.noteGrainOn(0, E, M) : A._loop ? L.bufferSource.start(0, E, 86400) : L.bufferSource.start(0, E, M), C !== 1 / 0 && (v._endTimers[A._id] = setTimeout(v._ended.bind(v, A), C)), p || setTimeout(function() {
                v._emit("play", A._id), v._loadQueue();
              }, 0);
            };
            n.state === "running" && n.ctx.state !== "interrupted" ? U() : (v._playLock = !0, v.once("resume", U), v._clearTimer(A._id));
          } else {
            var q = function() {
              L.currentTime = E, L.muted = A._muted || v._muted || n._muted || L.muted, L.volume = A._volume * n.volume(), L.playbackRate = A._rate;
              try {
                var ie = L.play();
                if (ie && typeof Promise < "u" && (ie instanceof Promise || typeof ie.then == "function") ? (v._playLock = !0, O(), ie.then(function() {
                  v._playLock = !1, L._unlocked = !0, p ? v._loadQueue() : v._emit("play", A._id);
                }).catch(function() {
                  v._playLock = !1, v._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), A._ended = !0, A._paused = !0;
                })) : p || (v._playLock = !1, O(), v._emit("play", A._id)), L.playbackRate = A._rate, L.paused) {
                  v._emit("playerror", A._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                d !== "__default" || A._loop ? v._endTimers[A._id] = setTimeout(v._ended.bind(v, A), C) : (v._endTimers[A._id] = function() {
                  v._ended(A), L.removeEventListener("ended", v._endTimers[A._id], !1);
                }, L.addEventListener("ended", v._endTimers[A._id], !1));
              } catch (ge) {
                v._emit("playerror", A._id, ge);
              }
            };
            L.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (L.src = v._src, L.load());
            var ee = window && window.ejecta || !L.readyState && n._navigator.isCocoonJS;
            if (L.readyState >= 3 || ee)
              q();
            else {
              v._playLock = !0, v._state = "loading";
              var ne = function() {
                v._state = "loaded", q(), L.removeEventListener(n._canPlayEvent, ne, !1);
              };
              L.addEventListener(n._canPlayEvent, ne, !1), v._clearTimer(A._id);
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
            var S = p._soundById(v[w]);
            if (S && !S._paused && (S._seek = p.seek(v[w]), S._rateSeek = 0, S._paused = !0, p._stopFade(v[w]), S._node))
              if (p._webAudio) {
                if (!S._node.bufferSource)
                  continue;
                typeof S._node.bufferSource.stop > "u" ? S._node.bufferSource.noteOff(0) : S._node.bufferSource.stop(0), p._cleanBuffer(S._node);
              } else (!isNaN(S._node.duration) || S._node.duration === 1 / 0) && S._node.pause();
            arguments[1] || p._emit("pause", S ? S._id : null);
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
          for (var w = v._getSoundIds(d), S = 0; S < w.length; S++) {
            v._clearTimer(w[S]);
            var T = v._soundById(w[S]);
            T && (T._seek = T._start || 0, T._rateSeek = 0, T._paused = !0, T._ended = !0, v._stopFade(w[S]), T._node && (v._webAudio ? T._node.bufferSource && (typeof T._node.bufferSource.stop > "u" ? T._node.bufferSource.noteOff(0) : T._node.bufferSource.stop(0), v._cleanBuffer(T._node)) : (!isNaN(T._node.duration) || T._node.duration === 1 / 0) && (T._node.currentTime = T._start || 0, T._node.pause(), T._node.duration === 1 / 0 && v._clearSound(T._node))), p || v._emit("stop", T._id));
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
          for (var w = v._getSoundIds(p), S = 0; S < w.length; S++) {
            var T = v._soundById(w[S]);
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
            var S = d._getSoundIds(), T = S.indexOf(p[0]);
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
          var S = this;
          if (S._state !== "loaded" || S._playLock)
            return S._queue.push({
              event: "fade",
              action: function() {
                S.fade(d, p, v, w);
              }
            }), S;
          d = Math.min(Math.max(0, parseFloat(d)), 1), p = Math.min(Math.max(0, parseFloat(p)), 1), v = parseFloat(v), S.volume(d, w);
          for (var T = S._getSoundIds(w), A = 0; A < T.length; A++) {
            var b = S._soundById(T[A]);
            if (b) {
              if (w || S._stopFade(T[A]), S._webAudio && !b._muted) {
                var E = n.ctx.currentTime, M = E + v / 1e3;
                b._volume = d, b._node.gain.setValueAtTime(d, E), b._node.gain.linearRampToValueAtTime(p, M);
              }
              S._startFadeInterval(b, d, p, v, T[A], typeof w > "u");
            }
          }
          return S;
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
        _startFadeInterval: function(d, p, v, w, S, T) {
          var A = this, b = p, E = v - p, M = Math.abs(E / 0.01), C = Math.max(4, M > 0 ? w / M : w), $ = Date.now();
          d._fadeTo = v, d._interval = setInterval(function() {
            var I = (Date.now() - $) / w;
            $ = Date.now(), b += E * I, b = Math.round(b * 100) / 100, E < 0 ? b = Math.max(v, b) : b = Math.min(v, b), A._webAudio ? d._volume = b : A.volume(b, d._id, !0), T && (A._volume = b), (v < p && b <= v || v > p && b >= v) && (clearInterval(d._interval), d._interval = null, d._fadeTo = null, A.volume(v, d._id), A._emit("fade", d._id));
          }, C);
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
          var d = this, p = arguments, v, w, S;
          if (p.length === 0)
            return d._loop;
          if (p.length === 1)
            if (typeof p[0] == "boolean")
              v = p[0], d._loop = v;
            else
              return S = d._soundById(parseInt(p[0], 10)), S ? S._loop : !1;
          else p.length === 2 && (v = p[0], w = parseInt(p[1], 10));
          for (var T = d._getSoundIds(w), A = 0; A < T.length; A++)
            S = d._soundById(T[A]), S && (S._loop = v, d._webAudio && S._node && S._node.bufferSource && (S._node.bufferSource.loop = v, v && (S._node.bufferSource.loopStart = S._start || 0, S._node.bufferSource.loopEnd = S._stop, d.playing(T[A]) && (d.pause(T[A], !0), d.play(T[A], !0)))));
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
            var S = d._getSoundIds(), T = S.indexOf(p[0]);
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
                var E = d.seek(w[b]), M = (d._sprite[A._sprite][0] + d._sprite[A._sprite][1]) / 1e3 - E, C = M * 1e3 / Math.abs(A._rate);
                (d._endTimers[w[b]] || !A._paused) && (d._clearTimer(w[b]), d._endTimers[w[b]] = setTimeout(d._ended.bind(d, A), C)), d._emit("rate", A._id);
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
            var S = d._getSoundIds(), T = S.indexOf(p[0]);
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
              var E = function() {
                b && d.play(w, !0), d._emit("seek", w);
              };
              if (b && !d._webAudio) {
                var M = function() {
                  d._playLock ? setTimeout(M, 0) : E();
                };
                setTimeout(M, 0);
              } else
                E();
            } else if (d._webAudio) {
              var C = d.playing(w) ? n.ctx.currentTime - A._playStart : 0, $ = A._rateSeek ? A._rateSeek - A._seek : 0;
              return A._seek + ($ + C * Math.abs(A._rate));
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
          var S = !0;
          for (v = 0; v < n._howls.length; v++)
            if (n._howls[v]._src === d._src || d._src.indexOf(n._howls[v]._src) >= 0) {
              S = !1;
              break;
            }
          return a && S && delete a[d._src], n.noAudio = !1, d._state = "unloaded", d._sounds = [], d = null, null;
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
          var S = this, T = S["_on" + d];
          return typeof p == "function" && T.push(w ? { id: v, fn: p, once: w } : { id: v, fn: p }), S;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(d, p, v) {
          var w = this, S = w["_on" + d], T = 0;
          if (typeof p == "number" && (v = p, p = null), p || v)
            for (T = 0; T < S.length; T++) {
              var A = v === S[T].id;
              if (p === S[T].fn && A || !p && A) {
                S.splice(T, 1);
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
          for (var w = this, S = w["_on" + d], T = S.length - 1; T >= 0; T--)
            (!S[T].id || S[T].id === p || d === "load") && (setTimeout((function(A) {
              A.call(this, p, v);
            }).bind(w, S[T].fn), 0), S[T].once && w.off(d, S[T].fn, S[T].id));
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
            var S = (d._stop - d._start) * 1e3 / Math.abs(d._rate);
            p._endTimers[d._id] = setTimeout(p._ended.bind(p, d), S);
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
          for (var v = atob(p.split(",")[1]), w = new Uint8Array(v.length), S = 0; S < v.length; ++S)
            w[S] = v.charCodeAt(S);
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
        }, w = function(S) {
          S && p._sounds.length > 0 ? (a[p._src] = S, m(p, S)) : v();
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
  })(kf)), kf;
}
var $F = zF();
const VF = /* @__PURE__ */ E_($F), { Howl: _T } = VF, Dh = 500, sn = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let Zi = {}, No = !1, jh = "";
function Go() {
  return typeof _T == "function";
}
function S_(t, e = 50) {
  const n = Number(t), r = Number.isFinite(n) ? n : e;
  return Math.min(1, Math.max(0, r / 100));
}
function xT(t) {
  return new _T({
    src: [t],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function ST(t, e, n = Dh) {
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
function Uu(t, { unload: e = !1 } = {}) {
  var n;
  t && (ST(t, 0, Math.min(Dh, 300)), (n = globalThis.setTimeout) == null || n.call(globalThis, () => {
    try {
      t.pause(), e && t.unload();
    } catch {
    }
  }, Math.min(Dh, 320)));
}
function BF(t) {
  return !(t != null && t.streamUrl) || !Go() ? null : ((!sn.music || sn.music.__synapseSrc !== t.streamUrl) && (Uu(sn.music, { unload: !0 }), sn.music = xT(t.streamUrl), sn.music.__synapseSrc = t.streamUrl), sn.music);
}
function UF(t) {
  if (!(t != null && t.streamUrl) || !Go()) return null;
  const e = t.id || t.streamUrl, n = sn.ambient.get(e);
  if (n && n.__synapseSrc === t.streamUrl) return n;
  Uu(n, { unload: !0 });
  const r = xT(t.streamUrl);
  return r.__synapseSrc = t.streamUrl, sn.ambient.set(e, r), r;
}
function HF() {
  return [
    sn.music,
    ...sn.ambient.values()
  ].filter(Boolean);
}
function wT() {
  HF().forEach((t) => Uu(t));
}
function WF(t) {
  for (const [e, n] of sn.ambient.entries())
    t.has(e) || (Uu(n, { unload: !0 }), sn.ambient.delete(e));
}
function w_(t, e) {
  if (t)
    try {
      t.playing() || t.play(), ST(t, e), jh = "";
    } catch (n) {
      jh = (n == null ? void 0 : n.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function ZF(t = {}) {
  Zi = { ...Zi, ...t };
  const e = Nu(Zi);
  if (!Go()) return eu(e);
  if (!No)
    return wT(), eu(e);
  const n = BF(e.musicTrack), r = S_(Zi.musicVolume, 60), s = S_(Zi.ambientVolume, 50), a = /* @__PURE__ */ new Set(), l = [];
  return e.ambientLayers.forEach((c) => {
    const f = c.id || c.streamUrl;
    a.add(f);
    const m = UF(c), g = Math.min(1, Math.max(0, s * (c.volumeBias ?? 1)));
    l.push([m, g]);
  }), WF(a), w_(n, r), l.forEach(([c, f]) => w_(c, f)), eu(e);
}
function GF(t) {
  return No = !!t, No || wT(), No;
}
function eu(t = Nu(Zi)) {
  var e, n, r, s;
  return {
    available: Go(),
    playing: No && Go(),
    musicTitle: ((e = t.musicTrack) == null ? void 0 : e.title) || "",
    musicArtist: ((n = t.musicTrack) == null ? void 0 : n.artist) || "",
    musicPageUrl: ((r = t.musicTrack) == null ? void 0 : r.pageUrl) || "",
    musicAttribution: ((s = t.musicTrack) == null ? void 0 : s.attribution) || "",
    ambientTitles: t.ambientLayers.map((a) => a.title).filter(Boolean),
    ambientPageUrls: t.ambientLayers.map((a) => a.pageUrl).filter(Boolean),
    ambientAttributions: t.ambientLayers.map((a) => a.attribution).filter(Boolean),
    error: jh
  };
}
const KF = "synapse.focusRoom.audioPrefs.v1";
function YF(t) {
  var e;
  try {
    (e = globalThis.localStorage) == null || e.setItem(KF, JSON.stringify({
      musicType: t.musicType,
      ambientSound: t.ambientSound,
      musicVolume: t.musicVolume,
      ambientVolume: t.ambientVolume,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
  } catch {
  }
}
function qF() {
  const t = H((c) => c.musicType), e = H((c) => c.ambientSound), n = H((c) => c.musicVolume), r = H((c) => c.ambientVolume), s = H((c) => c.audioPlaying), [a, l] = P.useState(() => eu(Nu({
    musicType: t,
    ambientSound: e
  })));
  return P.useEffect(() => {
    const c = { musicType: t, ambientSound: e, musicVolume: n, ambientVolume: r };
    let f = !1;
    return GF(s), YF(c), ZF(c).then((m) => {
      f || l(m);
    }), () => {
      f = !0;
    };
  }, [e, r, s, t, n]), a;
}
function QF() {
  const t = H(), e = P.useCallback(async (r = "", s = "", a = {}) => {
    var g;
    t.pauseTimer({ pauseAudio: !0 }), t.closeSummary();
    const l = typeof r == "string" || typeof r == "number" ? r : "", c = typeof s == "string" ? s : "", f = XF(c, a), m = String(l || t.selectedMaterialId || ((g = t.selectedMaterial) == null ? void 0 : g.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const d = globalThis.returnFromFocusRoomToWorkspace(m, f);
        d && typeof d.then == "function" && await d, T_(f.action || c, f);
        return;
      } catch (d) {
        console.error("Could not return from Focus Room:", d);
      }
    globalThis.location.hash = "", T_(f.action || c, f);
  }, [t]), n = P.useMemo(() => ({
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
  return globalThis.__synapseFocusRoomApi = n, P.useEffect(() => {
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
function XF(t, e = {}) {
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
function T_(t, e = {}) {
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
function JF(t = 3e3) {
  const e = H((r) => r.setIdle), n = H((r) => r.isIdle);
  return P.useEffect(() => {
    let r;
    const s = () => {
      e(!1), clearTimeout(r), r = setTimeout(() => e(!0), t);
    };
    return window.addEventListener("mousemove", s), window.addEventListener("keydown", s), window.addEventListener("click", s), s(), () => {
      clearTimeout(r), window.removeEventListener("mousemove", s), window.removeEventListener("keydown", s), window.removeEventListener("click", s);
    };
  }, [t, e]), n;
}
function eO() {
  const t = H((r) => r.timerStatus), e = H((r) => r.view), n = H((r) => r.tickTimer);
  P.useEffect(() => {
    if (e !== "session" || t !== "studying") return;
    const r = window.setInterval(n, 1e3);
    return () => window.clearInterval(r);
  }, [n, t, e]);
}
function tO() {
  const t = H((e) => e.selectedScene);
  return gs(t);
}
function nO() {
  return lT({
    queryKey: ["focus-room", "materials"],
    queryFn: () => oR(),
    initialData: () => mp()
  });
}
function rO(t, e) {
  const n = Array.isArray(t) ? t : [], r = String(e || "");
  return r ? n.find((s) => s.materialId === r) || n[0] || null : n[0] || null;
}
function iO(t) {
  var l;
  const e = _j(), n = H((c) => c.hydrateFocusRoute), r = H((c) => c.showStudyHistory), s = H((c) => c.setMaterialsState), a = nO();
  return P.useEffect(() => {
    const c = () => {
      e.invalidateQueries({ queryKey: ["focus-room", "materials"] }), e.invalidateQueries({ queryKey: ["focus-room", "sessions"] });
    };
    return window.addEventListener("synapse-focus-room-materials-updated", c), window.addEventListener("storage", c), () => {
      window.removeEventListener("synapse-focus-room-materials-updated", c), window.removeEventListener("storage", c);
    };
  }, [e]), P.useEffect(() => {
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
  ]), P.useEffect(() => {
    if (t.name === "history") {
      r();
      return;
    }
    if (t.name !== "focus") return;
    const c = rO(a.data, t.materialId);
    n(t, c || null, { preserveSession: !0 });
  }, [n, a.data, t, r]), a;
}
function sO(t) {
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
function oO() {
  const [t, e] = P.useState(() => A_());
  P.useEffect(() => {
    const v = () => e(A_());
    return window.addEventListener("hashchange", v), () => window.removeEventListener("hashchange", v);
  }, []);
  const n = P.useMemo(() => kI(t), [t]), r = H((v) => v.view), s = JF(3e3), a = tO(), l = qF(), c = QF();
  iO(n), eO();
  const f = H($k(sO)), m = H((v) => v.selectedMaterialId), g = H((v) => v.summaryRecord);
  P.useEffect(() => {
    f != null && f.materialId && AS(f.materialId, f);
  }, [f]), P.useEffect(() => {
    !m || r === "session" && !g || kS(m);
  }, [m, g, r]);
  const d = () => {
    globalThis.location.hash = "#/study-history";
  }, p = (...v) => {
    c.returnToWorkspace(...v);
  };
  return /* @__PURE__ */ _.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${s ? "is-idle" : ""}`.trim(),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ _.jsx(NN, { scene: a }),
        /* @__PURE__ */ _.jsx(Xo, { mode: "wait", children: r === "history" ? /* @__PURE__ */ _.jsx(
          cn.div,
          {
            className: "focus-room-view focus-history-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: is,
            children: /* @__PURE__ */ _.jsx(OF, { onWorkspace: p })
          },
          "history"
        ) : r === "session" ? /* @__PURE__ */ _.jsxs(
          cn.div,
          {
            className: "focus-room-view focus-session-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: is,
            children: [
              /* @__PURE__ */ _.jsx(E2, { onWorkspace: p, onHistory: d }),
              /* @__PURE__ */ _.jsx("section", { className: "focus-session-stage", children: /* @__PURE__ */ _.jsxs("div", { className: "focus-session-grid", children: [
                /* @__PURE__ */ _.jsx(FF, {}),
                /* @__PURE__ */ _.jsx(P2, {})
              ] }) }),
              /* @__PURE__ */ _.jsx(M2, { audioState: l }),
              /* @__PURE__ */ _.jsx(LF, { audioState: l }),
              /* @__PURE__ */ _.jsx(DF, { onWorkspace: p }),
              /* @__PURE__ */ _.jsx(jF, { onWorkspace: p, onHistory: d })
            ]
          },
          "session"
        ) : /* @__PURE__ */ _.jsx(
          cn.div,
          {
            className: "focus-room-view focus-room-setup-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: is,
            children: /* @__PURE__ */ _.jsx(k2, { audioState: l, onWorkspace: p, onHistory: d })
          },
          "setup"
        ) })
      ]
    }
  );
}
function A_() {
  var e;
  return String(((e = globalThis.location) == null ? void 0 : e.hash) || "#/focus-room").replace(/^#/, "") || "/focus-room";
}
let bf = null;
function aO(t, e) {
  const n = globalThis.__synapseFocusRoomApi || {};
  if (typeof n[t] != "function") {
    console.warn(`Synapse Focus Room action "${t}" is not available yet.`);
    return;
  }
  return n[t](...e);
}
function lO() {
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
    globalThis[e] = (...r) => aO(n, r);
  });
}
function uO(t = {}) {
  lO();
  const e = t.root || document.getElementById("focusRoomRoot");
  if (!e)
    throw new Error("Focus Room root element was not found.");
  bf || (bf = jk.createRoot(e), bf.render(
    Kn.createElement(
      Kn.StrictMode,
      null,
      Kn.createElement(oO)
    )
  ));
}
const cO = "synapse.generated.history.v6", AT = "synapse.active.generated.v6", dO = "synapse.flashcards.deck.v1", fO = "synapse.quiz.history.v1", hO = "synapse.focusRoom.return-target.v1";
function Yp(t, e) {
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
function pO(t, e) {
  var n;
  try {
    return (n = globalThis.localStorage) == null || n.setItem(t, e), !0;
  } catch (r) {
    return console.warn(`Could not write ${t}:`, r), !1;
  }
}
function mO(t, e) {
  var n;
  try {
    return (n = globalThis.localStorage) == null || n.setItem(t, JSON.stringify(e)), !0;
  } catch (r) {
    return console.warn(`Could not write ${t}:`, r), !1;
  }
}
function gO() {
  const t = Yp(cO, []);
  return Array.isArray(t) ? t : [];
}
function yO(t) {
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
function vO(t = {}) {
  const e = Yp(dO, {}), r = kT(t).map((s) => e == null ? void 0 : e[s]).find((s) => s && Array.isArray(s.cards) && s.cards.length);
  return (r == null ? void 0 : r.cards) || [];
}
function _O(t = {}) {
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
function xO(t = []) {
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
function SO(t = {}) {
  const e = Yp(fO, {}), r = kT(t).flatMap((a) => Array.isArray(e == null ? void 0 : e[a]) ? e[a] : []), s = /* @__PURE__ */ new Set();
  return xO(r).filter((a) => {
    const l = _O(a);
    return !l || s.has(l) ? !1 : (s.add(l), !0);
  }).sort((a, l) => new Date(l.createdAt || 0) - new Date(a.createdAt || 0));
}
function wO(t = {}) {
  return {
    materialId: String(t.id || t.sourceFingerprint || t.clientFingerprint || "current-material"),
    materialTitle: yO(t),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: t.summary || "",
    sections: t.sections || {},
    flashcards: vO(t),
    quizzes: SO(t),
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
function qp() {
  return gO().filter((t) => t && (t.id || t.summary)).map(wO);
}
function bT(t = "") {
  const e = String(t || "");
  return qp().find((n) => n.materialId === e) || null;
}
function CT() {
  var e;
  const t = ((e = globalThis.localStorage) == null ? void 0 : e.getItem(AT)) || "";
  return bT(t) || qp()[0] || null;
}
function TO(t = "") {
  var r;
  const e = t || ((r = CT()) == null ? void 0 : r.materialId) || "", n = e ? `/${encodeURIComponent(e)}` : "";
  globalThis.location.hash = `#/focus-room${n}`;
}
function AO(t = "", e = {}) {
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
async function kO(t = "", e = {}) {
  const n = String(t || "");
  n && pO(AT, n);
  const r = AO(n, e);
  r.action && mO(hO, r), globalThis.location.href = n ? `index.html?focusReturn=${encodeURIComponent(n)}` : "index.html";
}
function bO() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: CT,
    getSynapseFocusRoomMaterial: bT,
    getSynapseFocusRoomMaterials: qp,
    openSynapseFocusRoom: TO,
    returnFromFocusRoomToWorkspace: kO
  });
}
const PT = document.getElementById("focusRoomRoot");
if (!PT)
  throw new Error("Focus Room root element was not found.");
var C_;
(C_ = document.getElementById("focusRoomFallbackTitle")) == null || C_.remove();
globalThis.apiClient = new P_(Ck);
bO();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
uO({ root: PT });
