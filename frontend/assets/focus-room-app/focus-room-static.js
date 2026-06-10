var c0 = (t) => {
  throw TypeError(t);
};
var Gd = (t, e, n) => e.has(t) || c0("Cannot " + n);
var F = (t, e, n) => (Gd(t, e, "read from private field"), n ? n.call(t) : e.get(t)), pe = (t, e, n) => e.has(t) ? c0("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), ne = (t, e, n, r) => (Gd(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n), xe = (t, e, n) => (Gd(t, e, "access private method"), n);
var ku = (t, e, n, r) => ({
  set _(s) {
    ne(t, e, s, n);
  },
  get _() {
    return F(t, e, r);
  }
});
function yE(t, e) {
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
function gE(t) {
  const e = String(t || "").toLowerCase();
  return e === "127.0.0.1" || e === "localhost" || e === "::1" || e === "[::1]";
}
const vE = (() => {
  var l, c, d, m;
  const t = window.SYNAPSE_API_BASE || ((c = (l = document.body) == null ? void 0 : l.dataset) == null ? void 0 : c.apiBase) || "";
  if (t) return String(t).replace(/\/+$/, "");
  const { protocol: e, hostname: n, port: r } = window.location, s = String(window.SYNAPSE_BACKEND_PORT || ((m = (d = document.body) == null ? void 0 : d.dataset) == null ? void 0 : m.apiPort) || "8001").trim(), a = `http://127.0.0.1:${s || "8001"}`;
  return e === "file:" || gE(n) && r !== s ? a : `${e}//${window.location.host}`;
})();
class f0 extends Error {
  constructor(e, { cause: n } = {}) {
    super(e), this.name = "ApiConnectionError", this.cause = n;
  }
}
class _E {
  constructor(e, { fetchImpl: n = window.fetch.bind(window) } = {}) {
    this.baseUrl = String(e || "").replace(/\/+$/, ""), this.fetchImpl = n;
  }
  endpoint(e) {
    const n = String(e || "").replace(/^\/+/, "");
    return `${this.baseUrl}/${n}`;
  }
  timeoutMessage(e) {
    return `Synapse backend did not respond within ${Math.max(1, Math.round(Number(e || 0) / 1e3))} seconds. Try a smaller source set or increase window.SYNAPSE_ANALYSIS_TIMEOUT_MS.`;
  }
  async fetch(e, n = {}) {
    var f;
    const r = this.endpoint(e), { timeoutMs: s, ...a } = n || {}, l = Number(s || 0);
    let c = null, d = null, m = null;
    const y = a.signal;
    l > 0 && typeof AbortController < "u" && (c = new AbortController(), m = () => c.abort(), y && (y.aborted ? c.abort() : y.addEventListener("abort", m, { once: !0 })), d = window.setTimeout(() => c.abort(), l), a.signal = c.signal);
    try {
      return await this.fetchImpl(r, a);
    } catch (p) {
      throw (f = c == null ? void 0 : c.signal) != null && f.aborted ? new f0(this.timeoutMessage(l), { cause: p }) : new f0(
        [
          `Cannot reach the Synapse backend at ${this.baseUrl}.`,
          "Start it with `.venv/bin/python run_backend.py`, then try again."
        ].join(" "),
        { cause: p }
      );
    } finally {
      d && window.clearTimeout(d), y && m && y.removeEventListener("abort", m);
    }
  }
}
var ca = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function lS(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Kd = { exports: {} }, Se = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var d0;
function wE() {
  if (d0) return Se;
  d0 = 1;
  var t = Symbol.for("react.element"), e = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), s = Symbol.for("react.profiler"), a = Symbol.for("react.provider"), l = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), d = Symbol.for("react.suspense"), m = Symbol.for("react.memo"), y = Symbol.for("react.lazy"), f = Symbol.iterator;
  function p(j) {
    return j === null || typeof j != "object" ? null : (j = f && j[f] || j["@@iterator"], typeof j == "function" ? j : null);
  }
  var g = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, S = Object.assign, _ = {};
  function x(j, H, ve) {
    this.props = j, this.context = H, this.refs = _, this.updater = ve || g;
  }
  x.prototype.isReactComponent = {}, x.prototype.setState = function(j, H) {
    if (typeof j != "object" && typeof j != "function" && j != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, j, H, "setState");
  }, x.prototype.forceUpdate = function(j) {
    this.updater.enqueueForceUpdate(this, j, "forceUpdate");
  };
  function T() {
  }
  T.prototype = x.prototype;
  function E(j, H, ve) {
    this.props = j, this.context = H, this.refs = _, this.updater = ve || g;
  }
  var A = E.prototype = new T();
  A.constructor = E, S(A, x.prototype), A.isPureReactComponent = !0;
  var b = Array.isArray, M = Object.prototype.hasOwnProperty, B = { current: null }, I = { key: !0, ref: !0, __self: !0, __source: !0 };
  function O(j, H, ve) {
    var ye, we = {}, Pe = null, Ie = null;
    if (H != null) for (ye in H.ref !== void 0 && (Ie = H.ref), H.key !== void 0 && (Pe = "" + H.key), H) M.call(H, ye) && !I.hasOwnProperty(ye) && (we[ye] = H[ye]);
    var be = arguments.length - 2;
    if (be === 1) we.children = ve;
    else if (1 < be) {
      for (var Ve = Array(be), qt = 0; qt < be; qt++) Ve[qt] = arguments[qt + 2];
      we.children = Ve;
    }
    if (j && j.defaultProps) for (ye in be = j.defaultProps, be) we[ye] === void 0 && (we[ye] = be[ye]);
    return { $$typeof: t, type: j, key: Pe, ref: Ie, props: we, _owner: B.current };
  }
  function L(j, H) {
    return { $$typeof: t, type: j.type, key: H, ref: j.ref, props: j.props, _owner: j._owner };
  }
  function $(j) {
    return typeof j == "object" && j !== null && j.$$typeof === t;
  }
  function q(j) {
    var H = { "=": "=0", ":": "=2" };
    return "$" + j.replace(/[=:]/g, function(ve) {
      return H[ve];
    });
  }
  var J = /\/+/g;
  function ie(j, H) {
    return typeof j == "object" && j !== null && j.key != null ? q("" + j.key) : H.toString(36);
  }
  function re(j, H, ve, ye, we) {
    var Pe = typeof j;
    (Pe === "undefined" || Pe === "boolean") && (j = null);
    var Ie = !1;
    if (j === null) Ie = !0;
    else switch (Pe) {
      case "string":
      case "number":
        Ie = !0;
        break;
      case "object":
        switch (j.$$typeof) {
          case t:
          case e:
            Ie = !0;
        }
    }
    if (Ie) return Ie = j, we = we(Ie), j = ye === "" ? "." + ie(Ie, 0) : ye, b(we) ? (ve = "", j != null && (ve = j.replace(J, "$&/") + "/"), re(we, H, ve, "", function(qt) {
      return qt;
    })) : we != null && ($(we) && (we = L(we, ve + (!we.key || Ie && Ie.key === we.key ? "" : ("" + we.key).replace(J, "$&/") + "/") + j)), H.push(we)), 1;
    if (Ie = 0, ye = ye === "" ? "." : ye + ":", b(j)) for (var be = 0; be < j.length; be++) {
      Pe = j[be];
      var Ve = ye + ie(Pe, be);
      Ie += re(Pe, H, ve, Ve, we);
    }
    else if (Ve = p(j), typeof Ve == "function") for (j = Ve.call(j), be = 0; !(Pe = j.next()).done; ) Pe = Pe.value, Ve = ye + ie(Pe, be++), Ie += re(Pe, H, ve, Ve, we);
    else if (Pe === "object") throw H = String(j), Error("Objects are not valid as a React child (found: " + (H === "[object Object]" ? "object with keys {" + Object.keys(j).join(", ") + "}" : H) + "). If you meant to render a collection of children, use an array instead.");
    return Ie;
  }
  function ue(j, H, ve) {
    if (j == null) return j;
    var ye = [], we = 0;
    return re(j, ye, "", "", function(Pe) {
      return H.call(ve, Pe, we++);
    }), ye;
  }
  function fe(j) {
    if (j._status === -1) {
      var H = j._result;
      H = H(), H.then(function(ve) {
        (j._status === 0 || j._status === -1) && (j._status = 1, j._result = ve);
      }, function(ve) {
        (j._status === 0 || j._status === -1) && (j._status = 2, j._result = ve);
      }), j._status === -1 && (j._status = 0, j._result = H);
    }
    if (j._status === 1) return j._result.default;
    throw j._result;
  }
  var me = { current: null }, W = { transition: null }, ee = { ReactCurrentDispatcher: me, ReactCurrentBatchConfig: W, ReactCurrentOwner: B };
  function Z() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return Se.Children = { map: ue, forEach: function(j, H, ve) {
    ue(j, function() {
      H.apply(this, arguments);
    }, ve);
  }, count: function(j) {
    var H = 0;
    return ue(j, function() {
      H++;
    }), H;
  }, toArray: function(j) {
    return ue(j, function(H) {
      return H;
    }) || [];
  }, only: function(j) {
    if (!$(j)) throw Error("React.Children.only expected to receive a single React element child.");
    return j;
  } }, Se.Component = x, Se.Fragment = n, Se.Profiler = s, Se.PureComponent = E, Se.StrictMode = r, Se.Suspense = d, Se.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ee, Se.act = Z, Se.cloneElement = function(j, H, ve) {
    if (j == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + j + ".");
    var ye = S({}, j.props), we = j.key, Pe = j.ref, Ie = j._owner;
    if (H != null) {
      if (H.ref !== void 0 && (Pe = H.ref, Ie = B.current), H.key !== void 0 && (we = "" + H.key), j.type && j.type.defaultProps) var be = j.type.defaultProps;
      for (Ve in H) M.call(H, Ve) && !I.hasOwnProperty(Ve) && (ye[Ve] = H[Ve] === void 0 && be !== void 0 ? be[Ve] : H[Ve]);
    }
    var Ve = arguments.length - 2;
    if (Ve === 1) ye.children = ve;
    else if (1 < Ve) {
      be = Array(Ve);
      for (var qt = 0; qt < Ve; qt++) be[qt] = arguments[qt + 2];
      ye.children = be;
    }
    return { $$typeof: t, type: j.type, key: we, ref: Pe, props: ye, _owner: Ie };
  }, Se.createContext = function(j) {
    return j = { $$typeof: l, _currentValue: j, _currentValue2: j, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, j.Provider = { $$typeof: a, _context: j }, j.Consumer = j;
  }, Se.createElement = O, Se.createFactory = function(j) {
    var H = O.bind(null, j);
    return H.type = j, H;
  }, Se.createRef = function() {
    return { current: null };
  }, Se.forwardRef = function(j) {
    return { $$typeof: c, render: j };
  }, Se.isValidElement = $, Se.lazy = function(j) {
    return { $$typeof: y, _payload: { _status: -1, _result: j }, _init: fe };
  }, Se.memo = function(j, H) {
    return { $$typeof: m, type: j, compare: H === void 0 ? null : H };
  }, Se.startTransition = function(j) {
    var H = W.transition;
    W.transition = {};
    try {
      j();
    } finally {
      W.transition = H;
    }
  }, Se.unstable_act = Z, Se.useCallback = function(j, H) {
    return me.current.useCallback(j, H);
  }, Se.useContext = function(j) {
    return me.current.useContext(j);
  }, Se.useDebugValue = function() {
  }, Se.useDeferredValue = function(j) {
    return me.current.useDeferredValue(j);
  }, Se.useEffect = function(j, H) {
    return me.current.useEffect(j, H);
  }, Se.useId = function() {
    return me.current.useId();
  }, Se.useImperativeHandle = function(j, H, ve) {
    return me.current.useImperativeHandle(j, H, ve);
  }, Se.useInsertionEffect = function(j, H) {
    return me.current.useInsertionEffect(j, H);
  }, Se.useLayoutEffect = function(j, H) {
    return me.current.useLayoutEffect(j, H);
  }, Se.useMemo = function(j, H) {
    return me.current.useMemo(j, H);
  }, Se.useReducer = function(j, H, ve) {
    return me.current.useReducer(j, H, ve);
  }, Se.useRef = function(j) {
    return me.current.useRef(j);
  }, Se.useState = function(j) {
    return me.current.useState(j);
  }, Se.useSyncExternalStore = function(j, H, ve) {
    return me.current.useSyncExternalStore(j, H, ve);
  }, Se.useTransition = function() {
    return me.current.useTransition();
  }, Se.version = "18.3.1", Se;
}
var h0;
function Jp() {
  return h0 || (h0 = 1, Kd.exports = wE()), Kd.exports;
}
var k = Jp();
const Zn = /* @__PURE__ */ lS(k), em = /* @__PURE__ */ yE({
  __proto__: null,
  default: Zn
}, [k]);
var Pu = {}, Qd = { exports: {} }, zt = {}, Yd = { exports: {} }, Xd = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var p0;
function SE() {
  return p0 || (p0 = 1, (function(t) {
    function e(W, ee) {
      var Z = W.length;
      W.push(ee);
      e: for (; 0 < Z; ) {
        var j = Z - 1 >>> 1, H = W[j];
        if (0 < s(H, ee)) W[j] = ee, W[Z] = H, Z = j;
        else break e;
      }
    }
    function n(W) {
      return W.length === 0 ? null : W[0];
    }
    function r(W) {
      if (W.length === 0) return null;
      var ee = W[0], Z = W.pop();
      if (Z !== ee) {
        W[0] = Z;
        e: for (var j = 0, H = W.length, ve = H >>> 1; j < ve; ) {
          var ye = 2 * (j + 1) - 1, we = W[ye], Pe = ye + 1, Ie = W[Pe];
          if (0 > s(we, Z)) Pe < H && 0 > s(Ie, we) ? (W[j] = Ie, W[Pe] = Z, j = Pe) : (W[j] = we, W[ye] = Z, j = ye);
          else if (Pe < H && 0 > s(Ie, Z)) W[j] = Ie, W[Pe] = Z, j = Pe;
          else break e;
        }
      }
      return ee;
    }
    function s(W, ee) {
      var Z = W.sortIndex - ee.sortIndex;
      return Z !== 0 ? Z : W.id - ee.id;
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
    var d = [], m = [], y = 1, f = null, p = 3, g = !1, S = !1, _ = !1, x = typeof setTimeout == "function" ? setTimeout : null, T = typeof clearTimeout == "function" ? clearTimeout : null, E = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function A(W) {
      for (var ee = n(m); ee !== null; ) {
        if (ee.callback === null) r(m);
        else if (ee.startTime <= W) r(m), ee.sortIndex = ee.expirationTime, e(d, ee);
        else break;
        ee = n(m);
      }
    }
    function b(W) {
      if (_ = !1, A(W), !S) if (n(d) !== null) S = !0, fe(M);
      else {
        var ee = n(m);
        ee !== null && me(b, ee.startTime - W);
      }
    }
    function M(W, ee) {
      S = !1, _ && (_ = !1, T(O), O = -1), g = !0;
      var Z = p;
      try {
        for (A(ee), f = n(d); f !== null && (!(f.expirationTime > ee) || W && !q()); ) {
          var j = f.callback;
          if (typeof j == "function") {
            f.callback = null, p = f.priorityLevel;
            var H = j(f.expirationTime <= ee);
            ee = t.unstable_now(), typeof H == "function" ? f.callback = H : f === n(d) && r(d), A(ee);
          } else r(d);
          f = n(d);
        }
        if (f !== null) var ve = !0;
        else {
          var ye = n(m);
          ye !== null && me(b, ye.startTime - ee), ve = !1;
        }
        return ve;
      } finally {
        f = null, p = Z, g = !1;
      }
    }
    var B = !1, I = null, O = -1, L = 5, $ = -1;
    function q() {
      return !(t.unstable_now() - $ < L);
    }
    function J() {
      if (I !== null) {
        var W = t.unstable_now();
        $ = W;
        var ee = !0;
        try {
          ee = I(!0, W);
        } finally {
          ee ? ie() : (B = !1, I = null);
        }
      } else B = !1;
    }
    var ie;
    if (typeof E == "function") ie = function() {
      E(J);
    };
    else if (typeof MessageChannel < "u") {
      var re = new MessageChannel(), ue = re.port2;
      re.port1.onmessage = J, ie = function() {
        ue.postMessage(null);
      };
    } else ie = function() {
      x(J, 0);
    };
    function fe(W) {
      I = W, B || (B = !0, ie());
    }
    function me(W, ee) {
      O = x(function() {
        W(t.unstable_now());
      }, ee);
    }
    t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(W) {
      W.callback = null;
    }, t.unstable_continueExecution = function() {
      S || g || (S = !0, fe(M));
    }, t.unstable_forceFrameRate = function(W) {
      0 > W || 125 < W ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : L = 0 < W ? Math.floor(1e3 / W) : 5;
    }, t.unstable_getCurrentPriorityLevel = function() {
      return p;
    }, t.unstable_getFirstCallbackNode = function() {
      return n(d);
    }, t.unstable_next = function(W) {
      switch (p) {
        case 1:
        case 2:
        case 3:
          var ee = 3;
          break;
        default:
          ee = p;
      }
      var Z = p;
      p = ee;
      try {
        return W();
      } finally {
        p = Z;
      }
    }, t.unstable_pauseExecution = function() {
    }, t.unstable_requestPaint = function() {
    }, t.unstable_runWithPriority = function(W, ee) {
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
      var Z = p;
      p = W;
      try {
        return ee();
      } finally {
        p = Z;
      }
    }, t.unstable_scheduleCallback = function(W, ee, Z) {
      var j = t.unstable_now();
      switch (typeof Z == "object" && Z !== null ? (Z = Z.delay, Z = typeof Z == "number" && 0 < Z ? j + Z : j) : Z = j, W) {
        case 1:
          var H = -1;
          break;
        case 2:
          H = 250;
          break;
        case 5:
          H = 1073741823;
          break;
        case 4:
          H = 1e4;
          break;
        default:
          H = 5e3;
      }
      return H = Z + H, W = { id: y++, callback: ee, priorityLevel: W, startTime: Z, expirationTime: H, sortIndex: -1 }, Z > j ? (W.sortIndex = Z, e(m, W), n(d) === null && W === n(m) && (_ ? (T(O), O = -1) : _ = !0, me(b, Z - j))) : (W.sortIndex = H, e(d, W), S || g || (S = !0, fe(M))), W;
    }, t.unstable_shouldYield = q, t.unstable_wrapCallback = function(W) {
      var ee = p;
      return function() {
        var Z = p;
        p = ee;
        try {
          return W.apply(this, arguments);
        } finally {
          p = Z;
        }
      };
    };
  })(Xd)), Xd;
}
var m0;
function xE() {
  return m0 || (m0 = 1, Yd.exports = SE()), Yd.exports;
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
var y0;
function TE() {
  if (y0) return zt;
  y0 = 1;
  var t = Jp(), e = xE();
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
  var c = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), d = Object.prototype.hasOwnProperty, m = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, y = {}, f = {};
  function p(i) {
    return d.call(f, i) ? !0 : d.call(y, i) ? !1 : m.test(i) ? f[i] = !0 : (y[i] = !0, !1);
  }
  function g(i, o, u, h) {
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
  function S(i, o, u, h) {
    if (o === null || typeof o > "u" || g(i, o, u, h)) return !0;
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
  function _(i, o, u, h, v, w, P) {
    this.acceptsBooleans = o === 2 || o === 3 || o === 4, this.attributeName = h, this.attributeNamespace = v, this.mustUseProperty = u, this.propertyName = i, this.type = o, this.sanitizeURL = w, this.removeEmptyString = P;
  }
  var x = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(i) {
    x[i] = new _(i, 0, !1, i, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(i) {
    var o = i[0];
    x[o] = new _(o, 1, !1, i[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(i) {
    x[i] = new _(i, 2, !1, i.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(i) {
    x[i] = new _(i, 2, !1, i, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(i) {
    x[i] = new _(i, 3, !1, i.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(i) {
    x[i] = new _(i, 3, !0, i, null, !1, !1);
  }), ["capture", "download"].forEach(function(i) {
    x[i] = new _(i, 4, !1, i, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(i) {
    x[i] = new _(i, 6, !1, i, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(i) {
    x[i] = new _(i, 5, !1, i.toLowerCase(), null, !1, !1);
  });
  var T = /[\-:]([a-z])/g;
  function E(i) {
    return i[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(i) {
    var o = i.replace(
      T,
      E
    );
    x[o] = new _(o, 1, !1, i, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(i) {
    var o = i.replace(T, E);
    x[o] = new _(o, 1, !1, i, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(i) {
    var o = i.replace(T, E);
    x[o] = new _(o, 1, !1, i, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(i) {
    x[i] = new _(i, 1, !1, i.toLowerCase(), null, !1, !1);
  }), x.xlinkHref = new _("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(i) {
    x[i] = new _(i, 1, !1, i.toLowerCase(), null, !0, !0);
  });
  function A(i, o, u, h) {
    var v = x.hasOwnProperty(o) ? x[o] : null;
    (v !== null ? v.type !== 0 : h || !(2 < o.length) || o[0] !== "o" && o[0] !== "O" || o[1] !== "n" && o[1] !== "N") && (S(o, u, v, h) && (u = null), h || v === null ? p(o) && (u === null ? i.removeAttribute(o) : i.setAttribute(o, "" + u)) : v.mustUseProperty ? i[v.propertyName] = u === null ? v.type === 3 ? !1 : "" : u : (o = v.attributeName, h = v.attributeNamespace, u === null ? i.removeAttribute(o) : (v = v.type, u = v === 3 || v === 4 && u === !0 ? "" : "" + u, h ? i.setAttributeNS(h, o, u) : i.setAttribute(o, u))));
  }
  var b = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, M = Symbol.for("react.element"), B = Symbol.for("react.portal"), I = Symbol.for("react.fragment"), O = Symbol.for("react.strict_mode"), L = Symbol.for("react.profiler"), $ = Symbol.for("react.provider"), q = Symbol.for("react.context"), J = Symbol.for("react.forward_ref"), ie = Symbol.for("react.suspense"), re = Symbol.for("react.suspense_list"), ue = Symbol.for("react.memo"), fe = Symbol.for("react.lazy"), me = Symbol.for("react.offscreen"), W = Symbol.iterator;
  function ee(i) {
    return i === null || typeof i != "object" ? null : (i = W && i[W] || i["@@iterator"], typeof i == "function" ? i : null);
  }
  var Z = Object.assign, j;
  function H(i) {
    if (j === void 0) try {
      throw Error();
    } catch (u) {
      var o = u.stack.trim().match(/\n( *(at )?)/);
      j = o && o[1] || "";
    }
    return `
` + j + i;
  }
  var ve = !1;
  function ye(i, o) {
    if (!i || ve) return "";
    ve = !0;
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
        } catch (U) {
          var h = U;
        }
        Reflect.construct(i, [], o);
      } else {
        try {
          o.call();
        } catch (U) {
          h = U;
        }
        i.call(o.prototype);
      }
      else {
        try {
          throw Error();
        } catch (U) {
          h = U;
        }
        i();
      }
    } catch (U) {
      if (U && h && typeof U.stack == "string") {
        for (var v = U.stack.split(`
`), w = h.stack.split(`
`), P = v.length - 1, R = w.length - 1; 1 <= P && 0 <= R && v[P] !== w[R]; ) R--;
        for (; 1 <= P && 0 <= R; P--, R--) if (v[P] !== w[R]) {
          if (P !== 1 || R !== 1)
            do
              if (P--, R--, 0 > R || v[P] !== w[R]) {
                var D = `
` + v[P].replace(" at new ", " at ");
                return i.displayName && D.includes("<anonymous>") && (D = D.replace("<anonymous>", i.displayName)), D;
              }
            while (1 <= P && 0 <= R);
          break;
        }
      }
    } finally {
      ve = !1, Error.prepareStackTrace = u;
    }
    return (i = i ? i.displayName || i.name : "") ? H(i) : "";
  }
  function we(i) {
    switch (i.tag) {
      case 5:
        return H(i.type);
      case 16:
        return H("Lazy");
      case 13:
        return H("Suspense");
      case 19:
        return H("SuspenseList");
      case 0:
      case 2:
      case 15:
        return i = ye(i.type, !1), i;
      case 11:
        return i = ye(i.type.render, !1), i;
      case 1:
        return i = ye(i.type, !0), i;
      default:
        return "";
    }
  }
  function Pe(i) {
    if (i == null) return null;
    if (typeof i == "function") return i.displayName || i.name || null;
    if (typeof i == "string") return i;
    switch (i) {
      case I:
        return "Fragment";
      case B:
        return "Portal";
      case L:
        return "Profiler";
      case O:
        return "StrictMode";
      case ie:
        return "Suspense";
      case re:
        return "SuspenseList";
    }
    if (typeof i == "object") switch (i.$$typeof) {
      case q:
        return (i.displayName || "Context") + ".Consumer";
      case $:
        return (i._context.displayName || "Context") + ".Provider";
      case J:
        var o = i.render;
        return i = i.displayName, i || (i = o.displayName || o.name || "", i = i !== "" ? "ForwardRef(" + i + ")" : "ForwardRef"), i;
      case ue:
        return o = i.displayName || null, o !== null ? o : Pe(i.type) || "Memo";
      case fe:
        o = i._payload, i = i._init;
        try {
          return Pe(i(o));
        } catch {
        }
    }
    return null;
  }
  function Ie(i) {
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
        return Pe(o);
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
  function be(i) {
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
  function Ve(i) {
    var o = i.type;
    return (i = i.nodeName) && i.toLowerCase() === "input" && (o === "checkbox" || o === "radio");
  }
  function qt(i) {
    var o = Ve(i) ? "checked" : "value", u = Object.getOwnPropertyDescriptor(i.constructor.prototype, o), h = "" + i[o];
    if (!i.hasOwnProperty(o) && typeof u < "u" && typeof u.get == "function" && typeof u.set == "function") {
      var v = u.get, w = u.set;
      return Object.defineProperty(i, o, { configurable: !0, get: function() {
        return v.call(this);
      }, set: function(P) {
        h = "" + P, w.call(this, P);
      } }), Object.defineProperty(i, o, { enumerable: u.enumerable }), { getValue: function() {
        return h;
      }, setValue: function(P) {
        h = "" + P;
      }, stopTracking: function() {
        i._valueTracker = null, delete i[o];
      } };
    }
  }
  function ml(i) {
    i._valueTracker || (i._valueTracker = qt(i));
  }
  function yy(i) {
    if (!i) return !1;
    var o = i._valueTracker;
    if (!o) return !0;
    var u = o.getValue(), h = "";
    return i && (h = Ve(i) ? i.checked ? "true" : "false" : i.value), i = h, i !== u ? (o.setValue(i), !0) : !1;
  }
  function yl(i) {
    if (i = i || (typeof document < "u" ? document : void 0), typeof i > "u") return null;
    try {
      return i.activeElement || i.body;
    } catch {
      return i.body;
    }
  }
  function Zc(i, o) {
    var u = o.checked;
    return Z({}, o, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: u ?? i._wrapperState.initialChecked });
  }
  function gy(i, o) {
    var u = o.defaultValue == null ? "" : o.defaultValue, h = o.checked != null ? o.checked : o.defaultChecked;
    u = be(o.value != null ? o.value : u), i._wrapperState = { initialChecked: h, initialValue: u, controlled: o.type === "checkbox" || o.type === "radio" ? o.checked != null : o.value != null };
  }
  function vy(i, o) {
    o = o.checked, o != null && A(i, "checked", o, !1);
  }
  function Jc(i, o) {
    vy(i, o);
    var u = be(o.value), h = o.type;
    if (u != null) h === "number" ? (u === 0 && i.value === "" || i.value != u) && (i.value = "" + u) : i.value !== "" + u && (i.value = "" + u);
    else if (h === "submit" || h === "reset") {
      i.removeAttribute("value");
      return;
    }
    o.hasOwnProperty("value") ? ef(i, o.type, u) : o.hasOwnProperty("defaultValue") && ef(i, o.type, be(o.defaultValue)), o.checked == null && o.defaultChecked != null && (i.defaultChecked = !!o.defaultChecked);
  }
  function _y(i, o, u) {
    if (o.hasOwnProperty("value") || o.hasOwnProperty("defaultValue")) {
      var h = o.type;
      if (!(h !== "submit" && h !== "reset" || o.value !== void 0 && o.value !== null)) return;
      o = "" + i._wrapperState.initialValue, u || o === i.value || (i.value = o), i.defaultValue = o;
    }
    u = i.name, u !== "" && (i.name = ""), i.defaultChecked = !!i._wrapperState.initialChecked, u !== "" && (i.name = u);
  }
  function ef(i, o, u) {
    (o !== "number" || yl(i.ownerDocument) !== i) && (u == null ? i.defaultValue = "" + i._wrapperState.initialValue : i.defaultValue !== "" + u && (i.defaultValue = "" + u));
  }
  var ko = Array.isArray;
  function as(i, o, u, h) {
    if (i = i.options, o) {
      o = {};
      for (var v = 0; v < u.length; v++) o["$" + u[v]] = !0;
      for (u = 0; u < i.length; u++) v = o.hasOwnProperty("$" + i[u].value), i[u].selected !== v && (i[u].selected = v), v && h && (i[u].defaultSelected = !0);
    } else {
      for (u = "" + be(u), o = null, v = 0; v < i.length; v++) {
        if (i[v].value === u) {
          i[v].selected = !0, h && (i[v].defaultSelected = !0);
          return;
        }
        o !== null || i[v].disabled || (o = i[v]);
      }
      o !== null && (o.selected = !0);
    }
  }
  function tf(i, o) {
    if (o.dangerouslySetInnerHTML != null) throw Error(n(91));
    return Z({}, o, { value: void 0, defaultValue: void 0, children: "" + i._wrapperState.initialValue });
  }
  function wy(i, o) {
    var u = o.value;
    if (u == null) {
      if (u = o.children, o = o.defaultValue, u != null) {
        if (o != null) throw Error(n(92));
        if (ko(u)) {
          if (1 < u.length) throw Error(n(93));
          u = u[0];
        }
        o = u;
      }
      o == null && (o = ""), u = o;
    }
    i._wrapperState = { initialValue: be(u) };
  }
  function Sy(i, o) {
    var u = be(o.value), h = be(o.defaultValue);
    u != null && (u = "" + u, u !== i.value && (i.value = u), o.defaultValue == null && i.defaultValue !== u && (i.defaultValue = u)), h != null && (i.defaultValue = "" + h);
  }
  function xy(i) {
    var o = i.textContent;
    o === i._wrapperState.initialValue && o !== "" && o !== null && (i.value = o);
  }
  function Ty(i) {
    switch (i) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function nf(i, o) {
    return i == null || i === "http://www.w3.org/1999/xhtml" ? Ty(o) : i === "http://www.w3.org/2000/svg" && o === "foreignObject" ? "http://www.w3.org/1999/xhtml" : i;
  }
  var gl, Cy = (function(i) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(o, u, h, v) {
      MSApp.execUnsafeLocalFunction(function() {
        return i(o, u, h, v);
      });
    } : i;
  })(function(i, o) {
    if (i.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in i) i.innerHTML = o;
    else {
      for (gl = gl || document.createElement("div"), gl.innerHTML = "<svg>" + o.valueOf().toString() + "</svg>", o = gl.firstChild; i.firstChild; ) i.removeChild(i.firstChild);
      for (; o.firstChild; ) i.appendChild(o.firstChild);
    }
  });
  function Po(i, o) {
    if (o) {
      var u = i.firstChild;
      if (u && u === i.lastChild && u.nodeType === 3) {
        u.nodeValue = o;
        return;
      }
    }
    i.textContent = o;
  }
  var Eo = {
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
  }, wk = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Eo).forEach(function(i) {
    wk.forEach(function(o) {
      o = o + i.charAt(0).toUpperCase() + i.substring(1), Eo[o] = Eo[i];
    });
  });
  function ky(i, o, u) {
    return o == null || typeof o == "boolean" || o === "" ? "" : u || typeof o != "number" || o === 0 || Eo.hasOwnProperty(i) && Eo[i] ? ("" + o).trim() : o + "px";
  }
  function Py(i, o) {
    i = i.style;
    for (var u in o) if (o.hasOwnProperty(u)) {
      var h = u.indexOf("--") === 0, v = ky(u, o[u], h);
      u === "float" && (u = "cssFloat"), h ? i.setProperty(u, v) : i[u] = v;
    }
  }
  var Sk = Z({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function rf(i, o) {
    if (o) {
      if (Sk[i] && (o.children != null || o.dangerouslySetInnerHTML != null)) throw Error(n(137, i));
      if (o.dangerouslySetInnerHTML != null) {
        if (o.children != null) throw Error(n(60));
        if (typeof o.dangerouslySetInnerHTML != "object" || !("__html" in o.dangerouslySetInnerHTML)) throw Error(n(61));
      }
      if (o.style != null && typeof o.style != "object") throw Error(n(62));
    }
  }
  function sf(i, o) {
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
  var of = null;
  function af(i) {
    return i = i.target || i.srcElement || window, i.correspondingUseElement && (i = i.correspondingUseElement), i.nodeType === 3 ? i.parentNode : i;
  }
  var lf = null, ls = null, us = null;
  function Ey(i) {
    if (i = Yo(i)) {
      if (typeof lf != "function") throw Error(n(280));
      var o = i.stateNode;
      o && (o = Bl(o), lf(i.stateNode, i.type, o));
    }
  }
  function Ay(i) {
    ls ? us ? us.push(i) : us = [i] : ls = i;
  }
  function by() {
    if (ls) {
      var i = ls, o = us;
      if (us = ls = null, Ey(i), o) for (i = 0; i < o.length; i++) Ey(o[i]);
    }
  }
  function Ry(i, o) {
    return i(o);
  }
  function My() {
  }
  var uf = !1;
  function Dy(i, o, u) {
    if (uf) return i(o, u);
    uf = !0;
    try {
      return Ry(i, o, u);
    } finally {
      uf = !1, (ls !== null || us !== null) && (My(), by());
    }
  }
  function Ao(i, o) {
    var u = i.stateNode;
    if (u === null) return null;
    var h = Bl(u);
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
  var cf = !1;
  if (c) try {
    var bo = {};
    Object.defineProperty(bo, "passive", { get: function() {
      cf = !0;
    } }), window.addEventListener("test", bo, bo), window.removeEventListener("test", bo, bo);
  } catch {
    cf = !1;
  }
  function xk(i, o, u, h, v, w, P, R, D) {
    var U = Array.prototype.slice.call(arguments, 3);
    try {
      o.apply(u, U);
    } catch (K) {
      this.onError(K);
    }
  }
  var Ro = !1, vl = null, _l = !1, ff = null, Tk = { onError: function(i) {
    Ro = !0, vl = i;
  } };
  function Ck(i, o, u, h, v, w, P, R, D) {
    Ro = !1, vl = null, xk.apply(Tk, arguments);
  }
  function kk(i, o, u, h, v, w, P, R, D) {
    if (Ck.apply(this, arguments), Ro) {
      if (Ro) {
        var U = vl;
        Ro = !1, vl = null;
      } else throw Error(n(198));
      _l || (_l = !0, ff = U);
    }
  }
  function gi(i) {
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
  function Fy(i) {
    if (i.tag === 13) {
      var o = i.memoizedState;
      if (o === null && (i = i.alternate, i !== null && (o = i.memoizedState)), o !== null) return o.dehydrated;
    }
    return null;
  }
  function Oy(i) {
    if (gi(i) !== i) throw Error(n(188));
  }
  function Pk(i) {
    var o = i.alternate;
    if (!o) {
      if (o = gi(i), o === null) throw Error(n(188));
      return o !== i ? null : i;
    }
    for (var u = i, h = o; ; ) {
      var v = u.return;
      if (v === null) break;
      var w = v.alternate;
      if (w === null) {
        if (h = v.return, h !== null) {
          u = h;
          continue;
        }
        break;
      }
      if (v.child === w.child) {
        for (w = v.child; w; ) {
          if (w === u) return Oy(v), i;
          if (w === h) return Oy(v), o;
          w = w.sibling;
        }
        throw Error(n(188));
      }
      if (u.return !== h.return) u = v, h = w;
      else {
        for (var P = !1, R = v.child; R; ) {
          if (R === u) {
            P = !0, u = v, h = w;
            break;
          }
          if (R === h) {
            P = !0, h = v, u = w;
            break;
          }
          R = R.sibling;
        }
        if (!P) {
          for (R = w.child; R; ) {
            if (R === u) {
              P = !0, u = w, h = v;
              break;
            }
            if (R === h) {
              P = !0, h = w, u = v;
              break;
            }
            R = R.sibling;
          }
          if (!P) throw Error(n(189));
        }
      }
      if (u.alternate !== h) throw Error(n(190));
    }
    if (u.tag !== 3) throw Error(n(188));
    return u.stateNode.current === u ? i : o;
  }
  function Iy(i) {
    return i = Pk(i), i !== null ? Ny(i) : null;
  }
  function Ny(i) {
    if (i.tag === 5 || i.tag === 6) return i;
    for (i = i.child; i !== null; ) {
      var o = Ny(i);
      if (o !== null) return o;
      i = i.sibling;
    }
    return null;
  }
  var Ly = e.unstable_scheduleCallback, jy = e.unstable_cancelCallback, Ek = e.unstable_shouldYield, Ak = e.unstable_requestPaint, Ze = e.unstable_now, bk = e.unstable_getCurrentPriorityLevel, df = e.unstable_ImmediatePriority, Vy = e.unstable_UserBlockingPriority, wl = e.unstable_NormalPriority, Rk = e.unstable_LowPriority, By = e.unstable_IdlePriority, Sl = null, Bn = null;
  function Mk(i) {
    if (Bn && typeof Bn.onCommitFiberRoot == "function") try {
      Bn.onCommitFiberRoot(Sl, i, void 0, (i.current.flags & 128) === 128);
    } catch {
    }
  }
  var Pn = Math.clz32 ? Math.clz32 : Ok, Dk = Math.log, Fk = Math.LN2;
  function Ok(i) {
    return i >>>= 0, i === 0 ? 32 : 31 - (Dk(i) / Fk | 0) | 0;
  }
  var xl = 64, Tl = 4194304;
  function Mo(i) {
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
  function Cl(i, o) {
    var u = i.pendingLanes;
    if (u === 0) return 0;
    var h = 0, v = i.suspendedLanes, w = i.pingedLanes, P = u & 268435455;
    if (P !== 0) {
      var R = P & ~v;
      R !== 0 ? h = Mo(R) : (w &= P, w !== 0 && (h = Mo(w)));
    } else P = u & ~v, P !== 0 ? h = Mo(P) : w !== 0 && (h = Mo(w));
    if (h === 0) return 0;
    if (o !== 0 && o !== h && (o & v) === 0 && (v = h & -h, w = o & -o, v >= w || v === 16 && (w & 4194240) !== 0)) return o;
    if ((h & 4) !== 0 && (h |= u & 16), o = i.entangledLanes, o !== 0) for (i = i.entanglements, o &= h; 0 < o; ) u = 31 - Pn(o), v = 1 << u, h |= i[u], o &= ~v;
    return h;
  }
  function Ik(i, o) {
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
  function Nk(i, o) {
    for (var u = i.suspendedLanes, h = i.pingedLanes, v = i.expirationTimes, w = i.pendingLanes; 0 < w; ) {
      var P = 31 - Pn(w), R = 1 << P, D = v[P];
      D === -1 ? ((R & u) === 0 || (R & h) !== 0) && (v[P] = Ik(R, o)) : D <= o && (i.expiredLanes |= R), w &= ~R;
    }
  }
  function hf(i) {
    return i = i.pendingLanes & -1073741825, i !== 0 ? i : i & 1073741824 ? 1073741824 : 0;
  }
  function zy() {
    var i = xl;
    return xl <<= 1, (xl & 4194240) === 0 && (xl = 64), i;
  }
  function pf(i) {
    for (var o = [], u = 0; 31 > u; u++) o.push(i);
    return o;
  }
  function Do(i, o, u) {
    i.pendingLanes |= o, o !== 536870912 && (i.suspendedLanes = 0, i.pingedLanes = 0), i = i.eventTimes, o = 31 - Pn(o), i[o] = u;
  }
  function Lk(i, o) {
    var u = i.pendingLanes & ~o;
    i.pendingLanes = o, i.suspendedLanes = 0, i.pingedLanes = 0, i.expiredLanes &= o, i.mutableReadLanes &= o, i.entangledLanes &= o, o = i.entanglements;
    var h = i.eventTimes;
    for (i = i.expirationTimes; 0 < u; ) {
      var v = 31 - Pn(u), w = 1 << v;
      o[v] = 0, h[v] = -1, i[v] = -1, u &= ~w;
    }
  }
  function mf(i, o) {
    var u = i.entangledLanes |= o;
    for (i = i.entanglements; u; ) {
      var h = 31 - Pn(u), v = 1 << h;
      v & o | i[h] & o && (i[h] |= o), u &= ~v;
    }
  }
  var Re = 0;
  function Uy(i) {
    return i &= -i, 1 < i ? 4 < i ? (i & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var $y, yf, Hy, Wy, Gy, gf = !1, kl = [], Pr = null, Er = null, Ar = null, Fo = /* @__PURE__ */ new Map(), Oo = /* @__PURE__ */ new Map(), br = [], jk = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function Ky(i, o) {
    switch (i) {
      case "focusin":
      case "focusout":
        Pr = null;
        break;
      case "dragenter":
      case "dragleave":
        Er = null;
        break;
      case "mouseover":
      case "mouseout":
        Ar = null;
        break;
      case "pointerover":
      case "pointerout":
        Fo.delete(o.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Oo.delete(o.pointerId);
    }
  }
  function Io(i, o, u, h, v, w) {
    return i === null || i.nativeEvent !== w ? (i = { blockedOn: o, domEventName: u, eventSystemFlags: h, nativeEvent: w, targetContainers: [v] }, o !== null && (o = Yo(o), o !== null && yf(o)), i) : (i.eventSystemFlags |= h, o = i.targetContainers, v !== null && o.indexOf(v) === -1 && o.push(v), i);
  }
  function Vk(i, o, u, h, v) {
    switch (o) {
      case "focusin":
        return Pr = Io(Pr, i, o, u, h, v), !0;
      case "dragenter":
        return Er = Io(Er, i, o, u, h, v), !0;
      case "mouseover":
        return Ar = Io(Ar, i, o, u, h, v), !0;
      case "pointerover":
        var w = v.pointerId;
        return Fo.set(w, Io(Fo.get(w) || null, i, o, u, h, v)), !0;
      case "gotpointercapture":
        return w = v.pointerId, Oo.set(w, Io(Oo.get(w) || null, i, o, u, h, v)), !0;
    }
    return !1;
  }
  function Qy(i) {
    var o = vi(i.target);
    if (o !== null) {
      var u = gi(o);
      if (u !== null) {
        if (o = u.tag, o === 13) {
          if (o = Fy(u), o !== null) {
            i.blockedOn = o, Gy(i.priority, function() {
              Hy(u);
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
  function Pl(i) {
    if (i.blockedOn !== null) return !1;
    for (var o = i.targetContainers; 0 < o.length; ) {
      var u = _f(i.domEventName, i.eventSystemFlags, o[0], i.nativeEvent);
      if (u === null) {
        u = i.nativeEvent;
        var h = new u.constructor(u.type, u);
        of = h, u.target.dispatchEvent(h), of = null;
      } else return o = Yo(u), o !== null && yf(o), i.blockedOn = u, !1;
      o.shift();
    }
    return !0;
  }
  function Yy(i, o, u) {
    Pl(i) && u.delete(o);
  }
  function Bk() {
    gf = !1, Pr !== null && Pl(Pr) && (Pr = null), Er !== null && Pl(Er) && (Er = null), Ar !== null && Pl(Ar) && (Ar = null), Fo.forEach(Yy), Oo.forEach(Yy);
  }
  function No(i, o) {
    i.blockedOn === o && (i.blockedOn = null, gf || (gf = !0, e.unstable_scheduleCallback(e.unstable_NormalPriority, Bk)));
  }
  function Lo(i) {
    function o(v) {
      return No(v, i);
    }
    if (0 < kl.length) {
      No(kl[0], i);
      for (var u = 1; u < kl.length; u++) {
        var h = kl[u];
        h.blockedOn === i && (h.blockedOn = null);
      }
    }
    for (Pr !== null && No(Pr, i), Er !== null && No(Er, i), Ar !== null && No(Ar, i), Fo.forEach(o), Oo.forEach(o), u = 0; u < br.length; u++) h = br[u], h.blockedOn === i && (h.blockedOn = null);
    for (; 0 < br.length && (u = br[0], u.blockedOn === null); ) Qy(u), u.blockedOn === null && br.shift();
  }
  var cs = b.ReactCurrentBatchConfig, El = !0;
  function zk(i, o, u, h) {
    var v = Re, w = cs.transition;
    cs.transition = null;
    try {
      Re = 1, vf(i, o, u, h);
    } finally {
      Re = v, cs.transition = w;
    }
  }
  function Uk(i, o, u, h) {
    var v = Re, w = cs.transition;
    cs.transition = null;
    try {
      Re = 4, vf(i, o, u, h);
    } finally {
      Re = v, cs.transition = w;
    }
  }
  function vf(i, o, u, h) {
    if (El) {
      var v = _f(i, o, u, h);
      if (v === null) Nf(i, o, h, Al, u), Ky(i, h);
      else if (Vk(v, i, o, u, h)) h.stopPropagation();
      else if (Ky(i, h), o & 4 && -1 < jk.indexOf(i)) {
        for (; v !== null; ) {
          var w = Yo(v);
          if (w !== null && $y(w), w = _f(i, o, u, h), w === null && Nf(i, o, h, Al, u), w === v) break;
          v = w;
        }
        v !== null && h.stopPropagation();
      } else Nf(i, o, h, null, u);
    }
  }
  var Al = null;
  function _f(i, o, u, h) {
    if (Al = null, i = af(h), i = vi(i), i !== null) if (o = gi(i), o === null) i = null;
    else if (u = o.tag, u === 13) {
      if (i = Fy(o), i !== null) return i;
      i = null;
    } else if (u === 3) {
      if (o.stateNode.current.memoizedState.isDehydrated) return o.tag === 3 ? o.stateNode.containerInfo : null;
      i = null;
    } else o !== i && (i = null);
    return Al = i, null;
  }
  function Xy(i) {
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
        switch (bk()) {
          case df:
            return 1;
          case Vy:
            return 4;
          case wl:
          case Rk:
            return 16;
          case By:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Rr = null, wf = null, bl = null;
  function qy() {
    if (bl) return bl;
    var i, o = wf, u = o.length, h, v = "value" in Rr ? Rr.value : Rr.textContent, w = v.length;
    for (i = 0; i < u && o[i] === v[i]; i++) ;
    var P = u - i;
    for (h = 1; h <= P && o[u - h] === v[w - h]; h++) ;
    return bl = v.slice(i, 1 < h ? 1 - h : void 0);
  }
  function Rl(i) {
    var o = i.keyCode;
    return "charCode" in i ? (i = i.charCode, i === 0 && o === 13 && (i = 13)) : i = o, i === 10 && (i = 13), 32 <= i || i === 13 ? i : 0;
  }
  function Ml() {
    return !0;
  }
  function Zy() {
    return !1;
  }
  function Zt(i) {
    function o(u, h, v, w, P) {
      this._reactName = u, this._targetInst = v, this.type = h, this.nativeEvent = w, this.target = P, this.currentTarget = null;
      for (var R in i) i.hasOwnProperty(R) && (u = i[R], this[R] = u ? u(w) : w[R]);
      return this.isDefaultPrevented = (w.defaultPrevented != null ? w.defaultPrevented : w.returnValue === !1) ? Ml : Zy, this.isPropagationStopped = Zy, this;
    }
    return Z(o.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var u = this.nativeEvent;
      u && (u.preventDefault ? u.preventDefault() : typeof u.returnValue != "unknown" && (u.returnValue = !1), this.isDefaultPrevented = Ml);
    }, stopPropagation: function() {
      var u = this.nativeEvent;
      u && (u.stopPropagation ? u.stopPropagation() : typeof u.cancelBubble != "unknown" && (u.cancelBubble = !0), this.isPropagationStopped = Ml);
    }, persist: function() {
    }, isPersistent: Ml }), o;
  }
  var fs = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(i) {
    return i.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, Sf = Zt(fs), jo = Z({}, fs, { view: 0, detail: 0 }), $k = Zt(jo), xf, Tf, Vo, Dl = Z({}, jo, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: kf, button: 0, buttons: 0, relatedTarget: function(i) {
    return i.relatedTarget === void 0 ? i.fromElement === i.srcElement ? i.toElement : i.fromElement : i.relatedTarget;
  }, movementX: function(i) {
    return "movementX" in i ? i.movementX : (i !== Vo && (Vo && i.type === "mousemove" ? (xf = i.screenX - Vo.screenX, Tf = i.screenY - Vo.screenY) : Tf = xf = 0, Vo = i), xf);
  }, movementY: function(i) {
    return "movementY" in i ? i.movementY : Tf;
  } }), Jy = Zt(Dl), Hk = Z({}, Dl, { dataTransfer: 0 }), Wk = Zt(Hk), Gk = Z({}, jo, { relatedTarget: 0 }), Cf = Zt(Gk), Kk = Z({}, fs, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Qk = Zt(Kk), Yk = Z({}, fs, { clipboardData: function(i) {
    return "clipboardData" in i ? i.clipboardData : window.clipboardData;
  } }), Xk = Zt(Yk), qk = Z({}, fs, { data: 0 }), eg = Zt(qk), Zk = {
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
  }, Jk = {
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
  }, eP = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function tP(i) {
    var o = this.nativeEvent;
    return o.getModifierState ? o.getModifierState(i) : (i = eP[i]) ? !!o[i] : !1;
  }
  function kf() {
    return tP;
  }
  var nP = Z({}, jo, { key: function(i) {
    if (i.key) {
      var o = Zk[i.key] || i.key;
      if (o !== "Unidentified") return o;
    }
    return i.type === "keypress" ? (i = Rl(i), i === 13 ? "Enter" : String.fromCharCode(i)) : i.type === "keydown" || i.type === "keyup" ? Jk[i.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: kf, charCode: function(i) {
    return i.type === "keypress" ? Rl(i) : 0;
  }, keyCode: function(i) {
    return i.type === "keydown" || i.type === "keyup" ? i.keyCode : 0;
  }, which: function(i) {
    return i.type === "keypress" ? Rl(i) : i.type === "keydown" || i.type === "keyup" ? i.keyCode : 0;
  } }), rP = Zt(nP), iP = Z({}, Dl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), tg = Zt(iP), sP = Z({}, jo, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: kf }), oP = Zt(sP), aP = Z({}, fs, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), lP = Zt(aP), uP = Z({}, Dl, {
    deltaX: function(i) {
      return "deltaX" in i ? i.deltaX : "wheelDeltaX" in i ? -i.wheelDeltaX : 0;
    },
    deltaY: function(i) {
      return "deltaY" in i ? i.deltaY : "wheelDeltaY" in i ? -i.wheelDeltaY : "wheelDelta" in i ? -i.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), cP = Zt(uP), fP = [9, 13, 27, 32], Pf = c && "CompositionEvent" in window, Bo = null;
  c && "documentMode" in document && (Bo = document.documentMode);
  var dP = c && "TextEvent" in window && !Bo, ng = c && (!Pf || Bo && 8 < Bo && 11 >= Bo), rg = " ", ig = !1;
  function sg(i, o) {
    switch (i) {
      case "keyup":
        return fP.indexOf(o.keyCode) !== -1;
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
  function og(i) {
    return i = i.detail, typeof i == "object" && "data" in i ? i.data : null;
  }
  var ds = !1;
  function hP(i, o) {
    switch (i) {
      case "compositionend":
        return og(o);
      case "keypress":
        return o.which !== 32 ? null : (ig = !0, rg);
      case "textInput":
        return i = o.data, i === rg && ig ? null : i;
      default:
        return null;
    }
  }
  function pP(i, o) {
    if (ds) return i === "compositionend" || !Pf && sg(i, o) ? (i = qy(), bl = wf = Rr = null, ds = !1, i) : null;
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
        return ng && o.locale !== "ko" ? null : o.data;
      default:
        return null;
    }
  }
  var mP = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function ag(i) {
    var o = i && i.nodeName && i.nodeName.toLowerCase();
    return o === "input" ? !!mP[i.type] : o === "textarea";
  }
  function lg(i, o, u, h) {
    Ay(h), o = Ll(o, "onChange"), 0 < o.length && (u = new Sf("onChange", "change", null, u, h), i.push({ event: u, listeners: o }));
  }
  var zo = null, Uo = null;
  function yP(i) {
    Pg(i, 0);
  }
  function Fl(i) {
    var o = gs(i);
    if (yy(o)) return i;
  }
  function gP(i, o) {
    if (i === "change") return o;
  }
  var ug = !1;
  if (c) {
    var Ef;
    if (c) {
      var Af = "oninput" in document;
      if (!Af) {
        var cg = document.createElement("div");
        cg.setAttribute("oninput", "return;"), Af = typeof cg.oninput == "function";
      }
      Ef = Af;
    } else Ef = !1;
    ug = Ef && (!document.documentMode || 9 < document.documentMode);
  }
  function fg() {
    zo && (zo.detachEvent("onpropertychange", dg), Uo = zo = null);
  }
  function dg(i) {
    if (i.propertyName === "value" && Fl(Uo)) {
      var o = [];
      lg(o, Uo, i, af(i)), Dy(yP, o);
    }
  }
  function vP(i, o, u) {
    i === "focusin" ? (fg(), zo = o, Uo = u, zo.attachEvent("onpropertychange", dg)) : i === "focusout" && fg();
  }
  function _P(i) {
    if (i === "selectionchange" || i === "keyup" || i === "keydown") return Fl(Uo);
  }
  function wP(i, o) {
    if (i === "click") return Fl(o);
  }
  function SP(i, o) {
    if (i === "input" || i === "change") return Fl(o);
  }
  function xP(i, o) {
    return i === o && (i !== 0 || 1 / i === 1 / o) || i !== i && o !== o;
  }
  var En = typeof Object.is == "function" ? Object.is : xP;
  function $o(i, o) {
    if (En(i, o)) return !0;
    if (typeof i != "object" || i === null || typeof o != "object" || o === null) return !1;
    var u = Object.keys(i), h = Object.keys(o);
    if (u.length !== h.length) return !1;
    for (h = 0; h < u.length; h++) {
      var v = u[h];
      if (!d.call(o, v) || !En(i[v], o[v])) return !1;
    }
    return !0;
  }
  function hg(i) {
    for (; i && i.firstChild; ) i = i.firstChild;
    return i;
  }
  function pg(i, o) {
    var u = hg(i);
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
      u = hg(u);
    }
  }
  function mg(i, o) {
    return i && o ? i === o ? !0 : i && i.nodeType === 3 ? !1 : o && o.nodeType === 3 ? mg(i, o.parentNode) : "contains" in i ? i.contains(o) : i.compareDocumentPosition ? !!(i.compareDocumentPosition(o) & 16) : !1 : !1;
  }
  function yg() {
    for (var i = window, o = yl(); o instanceof i.HTMLIFrameElement; ) {
      try {
        var u = typeof o.contentWindow.location.href == "string";
      } catch {
        u = !1;
      }
      if (u) i = o.contentWindow;
      else break;
      o = yl(i.document);
    }
    return o;
  }
  function bf(i) {
    var o = i && i.nodeName && i.nodeName.toLowerCase();
    return o && (o === "input" && (i.type === "text" || i.type === "search" || i.type === "tel" || i.type === "url" || i.type === "password") || o === "textarea" || i.contentEditable === "true");
  }
  function TP(i) {
    var o = yg(), u = i.focusedElem, h = i.selectionRange;
    if (o !== u && u && u.ownerDocument && mg(u.ownerDocument.documentElement, u)) {
      if (h !== null && bf(u)) {
        if (o = h.start, i = h.end, i === void 0 && (i = o), "selectionStart" in u) u.selectionStart = o, u.selectionEnd = Math.min(i, u.value.length);
        else if (i = (o = u.ownerDocument || document) && o.defaultView || window, i.getSelection) {
          i = i.getSelection();
          var v = u.textContent.length, w = Math.min(h.start, v);
          h = h.end === void 0 ? w : Math.min(h.end, v), !i.extend && w > h && (v = h, h = w, w = v), v = pg(u, w);
          var P = pg(
            u,
            h
          );
          v && P && (i.rangeCount !== 1 || i.anchorNode !== v.node || i.anchorOffset !== v.offset || i.focusNode !== P.node || i.focusOffset !== P.offset) && (o = o.createRange(), o.setStart(v.node, v.offset), i.removeAllRanges(), w > h ? (i.addRange(o), i.extend(P.node, P.offset)) : (o.setEnd(P.node, P.offset), i.addRange(o)));
        }
      }
      for (o = [], i = u; i = i.parentNode; ) i.nodeType === 1 && o.push({ element: i, left: i.scrollLeft, top: i.scrollTop });
      for (typeof u.focus == "function" && u.focus(), u = 0; u < o.length; u++) i = o[u], i.element.scrollLeft = i.left, i.element.scrollTop = i.top;
    }
  }
  var CP = c && "documentMode" in document && 11 >= document.documentMode, hs = null, Rf = null, Ho = null, Mf = !1;
  function gg(i, o, u) {
    var h = u.window === u ? u.document : u.nodeType === 9 ? u : u.ownerDocument;
    Mf || hs == null || hs !== yl(h) || (h = hs, "selectionStart" in h && bf(h) ? h = { start: h.selectionStart, end: h.selectionEnd } : (h = (h.ownerDocument && h.ownerDocument.defaultView || window).getSelection(), h = { anchorNode: h.anchorNode, anchorOffset: h.anchorOffset, focusNode: h.focusNode, focusOffset: h.focusOffset }), Ho && $o(Ho, h) || (Ho = h, h = Ll(Rf, "onSelect"), 0 < h.length && (o = new Sf("onSelect", "select", null, o, u), i.push({ event: o, listeners: h }), o.target = hs)));
  }
  function Ol(i, o) {
    var u = {};
    return u[i.toLowerCase()] = o.toLowerCase(), u["Webkit" + i] = "webkit" + o, u["Moz" + i] = "moz" + o, u;
  }
  var ps = { animationend: Ol("Animation", "AnimationEnd"), animationiteration: Ol("Animation", "AnimationIteration"), animationstart: Ol("Animation", "AnimationStart"), transitionend: Ol("Transition", "TransitionEnd") }, Df = {}, vg = {};
  c && (vg = document.createElement("div").style, "AnimationEvent" in window || (delete ps.animationend.animation, delete ps.animationiteration.animation, delete ps.animationstart.animation), "TransitionEvent" in window || delete ps.transitionend.transition);
  function Il(i) {
    if (Df[i]) return Df[i];
    if (!ps[i]) return i;
    var o = ps[i], u;
    for (u in o) if (o.hasOwnProperty(u) && u in vg) return Df[i] = o[u];
    return i;
  }
  var _g = Il("animationend"), wg = Il("animationiteration"), Sg = Il("animationstart"), xg = Il("transitionend"), Tg = /* @__PURE__ */ new Map(), Cg = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function Mr(i, o) {
    Tg.set(i, o), a(o, [i]);
  }
  for (var Ff = 0; Ff < Cg.length; Ff++) {
    var Of = Cg[Ff], kP = Of.toLowerCase(), PP = Of[0].toUpperCase() + Of.slice(1);
    Mr(kP, "on" + PP);
  }
  Mr(_g, "onAnimationEnd"), Mr(wg, "onAnimationIteration"), Mr(Sg, "onAnimationStart"), Mr("dblclick", "onDoubleClick"), Mr("focusin", "onFocus"), Mr("focusout", "onBlur"), Mr(xg, "onTransitionEnd"), l("onMouseEnter", ["mouseout", "mouseover"]), l("onMouseLeave", ["mouseout", "mouseover"]), l("onPointerEnter", ["pointerout", "pointerover"]), l("onPointerLeave", ["pointerout", "pointerover"]), a("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), a("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), a("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), a("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), a("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), a("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Wo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), EP = new Set("cancel close invalid load scroll toggle".split(" ").concat(Wo));
  function kg(i, o, u) {
    var h = i.type || "unknown-event";
    i.currentTarget = u, kk(h, o, void 0, i), i.currentTarget = null;
  }
  function Pg(i, o) {
    o = (o & 4) !== 0;
    for (var u = 0; u < i.length; u++) {
      var h = i[u], v = h.event;
      h = h.listeners;
      e: {
        var w = void 0;
        if (o) for (var P = h.length - 1; 0 <= P; P--) {
          var R = h[P], D = R.instance, U = R.currentTarget;
          if (R = R.listener, D !== w && v.isPropagationStopped()) break e;
          kg(v, R, U), w = D;
        }
        else for (P = 0; P < h.length; P++) {
          if (R = h[P], D = R.instance, U = R.currentTarget, R = R.listener, D !== w && v.isPropagationStopped()) break e;
          kg(v, R, U), w = D;
        }
      }
    }
    if (_l) throw i = ff, _l = !1, ff = null, i;
  }
  function Le(i, o) {
    var u = o[Uf];
    u === void 0 && (u = o[Uf] = /* @__PURE__ */ new Set());
    var h = i + "__bubble";
    u.has(h) || (Eg(o, i, 2, !1), u.add(h));
  }
  function If(i, o, u) {
    var h = 0;
    o && (h |= 4), Eg(u, i, h, o);
  }
  var Nl = "_reactListening" + Math.random().toString(36).slice(2);
  function Go(i) {
    if (!i[Nl]) {
      i[Nl] = !0, r.forEach(function(u) {
        u !== "selectionchange" && (EP.has(u) || If(u, !1, i), If(u, !0, i));
      });
      var o = i.nodeType === 9 ? i : i.ownerDocument;
      o === null || o[Nl] || (o[Nl] = !0, If("selectionchange", !1, o));
    }
  }
  function Eg(i, o, u, h) {
    switch (Xy(o)) {
      case 1:
        var v = zk;
        break;
      case 4:
        v = Uk;
        break;
      default:
        v = vf;
    }
    u = v.bind(null, o, u, i), v = void 0, !cf || o !== "touchstart" && o !== "touchmove" && o !== "wheel" || (v = !0), h ? v !== void 0 ? i.addEventListener(o, u, { capture: !0, passive: v }) : i.addEventListener(o, u, !0) : v !== void 0 ? i.addEventListener(o, u, { passive: v }) : i.addEventListener(o, u, !1);
  }
  function Nf(i, o, u, h, v) {
    var w = h;
    if ((o & 1) === 0 && (o & 2) === 0 && h !== null) e: for (; ; ) {
      if (h === null) return;
      var P = h.tag;
      if (P === 3 || P === 4) {
        var R = h.stateNode.containerInfo;
        if (R === v || R.nodeType === 8 && R.parentNode === v) break;
        if (P === 4) for (P = h.return; P !== null; ) {
          var D = P.tag;
          if ((D === 3 || D === 4) && (D = P.stateNode.containerInfo, D === v || D.nodeType === 8 && D.parentNode === v)) return;
          P = P.return;
        }
        for (; R !== null; ) {
          if (P = vi(R), P === null) return;
          if (D = P.tag, D === 5 || D === 6) {
            h = w = P;
            continue e;
          }
          R = R.parentNode;
        }
      }
      h = h.return;
    }
    Dy(function() {
      var U = w, K = af(u), Q = [];
      e: {
        var G = Tg.get(i);
        if (G !== void 0) {
          var te = Sf, oe = i;
          switch (i) {
            case "keypress":
              if (Rl(u) === 0) break e;
            case "keydown":
            case "keyup":
              te = rP;
              break;
            case "focusin":
              oe = "focus", te = Cf;
              break;
            case "focusout":
              oe = "blur", te = Cf;
              break;
            case "beforeblur":
            case "afterblur":
              te = Cf;
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
              te = Jy;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              te = Wk;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              te = oP;
              break;
            case _g:
            case wg:
            case Sg:
              te = Qk;
              break;
            case xg:
              te = lP;
              break;
            case "scroll":
              te = $k;
              break;
            case "wheel":
              te = cP;
              break;
            case "copy":
            case "cut":
            case "paste":
              te = Xk;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              te = tg;
          }
          var le = (o & 4) !== 0, Je = !le && i === "scroll", V = le ? G !== null ? G + "Capture" : null : G;
          le = [];
          for (var N = U, z; N !== null; ) {
            z = N;
            var X = z.stateNode;
            if (z.tag === 5 && X !== null && (z = X, V !== null && (X = Ao(N, V), X != null && le.push(Ko(N, X, z)))), Je) break;
            N = N.return;
          }
          0 < le.length && (G = new te(G, oe, null, u, K), Q.push({ event: G, listeners: le }));
        }
      }
      if ((o & 7) === 0) {
        e: {
          if (G = i === "mouseover" || i === "pointerover", te = i === "mouseout" || i === "pointerout", G && u !== of && (oe = u.relatedTarget || u.fromElement) && (vi(oe) || oe[sr])) break e;
          if ((te || G) && (G = K.window === K ? K : (G = K.ownerDocument) ? G.defaultView || G.parentWindow : window, te ? (oe = u.relatedTarget || u.toElement, te = U, oe = oe ? vi(oe) : null, oe !== null && (Je = gi(oe), oe !== Je || oe.tag !== 5 && oe.tag !== 6) && (oe = null)) : (te = null, oe = U), te !== oe)) {
            if (le = Jy, X = "onMouseLeave", V = "onMouseEnter", N = "mouse", (i === "pointerout" || i === "pointerover") && (le = tg, X = "onPointerLeave", V = "onPointerEnter", N = "pointer"), Je = te == null ? G : gs(te), z = oe == null ? G : gs(oe), G = new le(X, N + "leave", te, u, K), G.target = Je, G.relatedTarget = z, X = null, vi(K) === U && (le = new le(V, N + "enter", oe, u, K), le.target = z, le.relatedTarget = Je, X = le), Je = X, te && oe) t: {
              for (le = te, V = oe, N = 0, z = le; z; z = ms(z)) N++;
              for (z = 0, X = V; X; X = ms(X)) z++;
              for (; 0 < N - z; ) le = ms(le), N--;
              for (; 0 < z - N; ) V = ms(V), z--;
              for (; N--; ) {
                if (le === V || V !== null && le === V.alternate) break t;
                le = ms(le), V = ms(V);
              }
              le = null;
            }
            else le = null;
            te !== null && Ag(Q, G, te, le, !1), oe !== null && Je !== null && Ag(Q, Je, oe, le, !0);
          }
        }
        e: {
          if (G = U ? gs(U) : window, te = G.nodeName && G.nodeName.toLowerCase(), te === "select" || te === "input" && G.type === "file") var ce = gP;
          else if (ag(G)) if (ug) ce = SP;
          else {
            ce = _P;
            var de = vP;
          }
          else (te = G.nodeName) && te.toLowerCase() === "input" && (G.type === "checkbox" || G.type === "radio") && (ce = wP);
          if (ce && (ce = ce(i, U))) {
            lg(Q, ce, u, K);
            break e;
          }
          de && de(i, G, U), i === "focusout" && (de = G._wrapperState) && de.controlled && G.type === "number" && ef(G, "number", G.value);
        }
        switch (de = U ? gs(U) : window, i) {
          case "focusin":
            (ag(de) || de.contentEditable === "true") && (hs = de, Rf = U, Ho = null);
            break;
          case "focusout":
            Ho = Rf = hs = null;
            break;
          case "mousedown":
            Mf = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Mf = !1, gg(Q, u, K);
            break;
          case "selectionchange":
            if (CP) break;
          case "keydown":
          case "keyup":
            gg(Q, u, K);
        }
        var he;
        if (Pf) e: {
          switch (i) {
            case "compositionstart":
              var ge = "onCompositionStart";
              break e;
            case "compositionend":
              ge = "onCompositionEnd";
              break e;
            case "compositionupdate":
              ge = "onCompositionUpdate";
              break e;
          }
          ge = void 0;
        }
        else ds ? sg(i, u) && (ge = "onCompositionEnd") : i === "keydown" && u.keyCode === 229 && (ge = "onCompositionStart");
        ge && (ng && u.locale !== "ko" && (ds || ge !== "onCompositionStart" ? ge === "onCompositionEnd" && ds && (he = qy()) : (Rr = K, wf = "value" in Rr ? Rr.value : Rr.textContent, ds = !0)), de = Ll(U, ge), 0 < de.length && (ge = new eg(ge, i, null, u, K), Q.push({ event: ge, listeners: de }), he ? ge.data = he : (he = og(u), he !== null && (ge.data = he)))), (he = dP ? hP(i, u) : pP(i, u)) && (U = Ll(U, "onBeforeInput"), 0 < U.length && (K = new eg("onBeforeInput", "beforeinput", null, u, K), Q.push({ event: K, listeners: U }), K.data = he));
      }
      Pg(Q, o);
    });
  }
  function Ko(i, o, u) {
    return { instance: i, listener: o, currentTarget: u };
  }
  function Ll(i, o) {
    for (var u = o + "Capture", h = []; i !== null; ) {
      var v = i, w = v.stateNode;
      v.tag === 5 && w !== null && (v = w, w = Ao(i, u), w != null && h.unshift(Ko(i, w, v)), w = Ao(i, o), w != null && h.push(Ko(i, w, v))), i = i.return;
    }
    return h;
  }
  function ms(i) {
    if (i === null) return null;
    do
      i = i.return;
    while (i && i.tag !== 5);
    return i || null;
  }
  function Ag(i, o, u, h, v) {
    for (var w = o._reactName, P = []; u !== null && u !== h; ) {
      var R = u, D = R.alternate, U = R.stateNode;
      if (D !== null && D === h) break;
      R.tag === 5 && U !== null && (R = U, v ? (D = Ao(u, w), D != null && P.unshift(Ko(u, D, R))) : v || (D = Ao(u, w), D != null && P.push(Ko(u, D, R)))), u = u.return;
    }
    P.length !== 0 && i.push({ event: o, listeners: P });
  }
  var AP = /\r\n?/g, bP = /\u0000|\uFFFD/g;
  function bg(i) {
    return (typeof i == "string" ? i : "" + i).replace(AP, `
`).replace(bP, "");
  }
  function jl(i, o, u) {
    if (o = bg(o), bg(i) !== o && u) throw Error(n(425));
  }
  function Vl() {
  }
  var Lf = null, jf = null;
  function Vf(i, o) {
    return i === "textarea" || i === "noscript" || typeof o.children == "string" || typeof o.children == "number" || typeof o.dangerouslySetInnerHTML == "object" && o.dangerouslySetInnerHTML !== null && o.dangerouslySetInnerHTML.__html != null;
  }
  var Bf = typeof setTimeout == "function" ? setTimeout : void 0, RP = typeof clearTimeout == "function" ? clearTimeout : void 0, Rg = typeof Promise == "function" ? Promise : void 0, MP = typeof queueMicrotask == "function" ? queueMicrotask : typeof Rg < "u" ? function(i) {
    return Rg.resolve(null).then(i).catch(DP);
  } : Bf;
  function DP(i) {
    setTimeout(function() {
      throw i;
    });
  }
  function zf(i, o) {
    var u = o, h = 0;
    do {
      var v = u.nextSibling;
      if (i.removeChild(u), v && v.nodeType === 8) if (u = v.data, u === "/$") {
        if (h === 0) {
          i.removeChild(v), Lo(o);
          return;
        }
        h--;
      } else u !== "$" && u !== "$?" && u !== "$!" || h++;
      u = v;
    } while (u);
    Lo(o);
  }
  function Dr(i) {
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
  function Mg(i) {
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
  var ys = Math.random().toString(36).slice(2), zn = "__reactFiber$" + ys, Qo = "__reactProps$" + ys, sr = "__reactContainer$" + ys, Uf = "__reactEvents$" + ys, FP = "__reactListeners$" + ys, OP = "__reactHandles$" + ys;
  function vi(i) {
    var o = i[zn];
    if (o) return o;
    for (var u = i.parentNode; u; ) {
      if (o = u[sr] || u[zn]) {
        if (u = o.alternate, o.child !== null || u !== null && u.child !== null) for (i = Mg(i); i !== null; ) {
          if (u = i[zn]) return u;
          i = Mg(i);
        }
        return o;
      }
      i = u, u = i.parentNode;
    }
    return null;
  }
  function Yo(i) {
    return i = i[zn] || i[sr], !i || i.tag !== 5 && i.tag !== 6 && i.tag !== 13 && i.tag !== 3 ? null : i;
  }
  function gs(i) {
    if (i.tag === 5 || i.tag === 6) return i.stateNode;
    throw Error(n(33));
  }
  function Bl(i) {
    return i[Qo] || null;
  }
  var $f = [], vs = -1;
  function Fr(i) {
    return { current: i };
  }
  function je(i) {
    0 > vs || (i.current = $f[vs], $f[vs] = null, vs--);
  }
  function Ne(i, o) {
    vs++, $f[vs] = i.current, i.current = o;
  }
  var Or = {}, xt = Fr(Or), Nt = Fr(!1), _i = Or;
  function _s(i, o) {
    var u = i.type.contextTypes;
    if (!u) return Or;
    var h = i.stateNode;
    if (h && h.__reactInternalMemoizedUnmaskedChildContext === o) return h.__reactInternalMemoizedMaskedChildContext;
    var v = {}, w;
    for (w in u) v[w] = o[w];
    return h && (i = i.stateNode, i.__reactInternalMemoizedUnmaskedChildContext = o, i.__reactInternalMemoizedMaskedChildContext = v), v;
  }
  function Lt(i) {
    return i = i.childContextTypes, i != null;
  }
  function zl() {
    je(Nt), je(xt);
  }
  function Dg(i, o, u) {
    if (xt.current !== Or) throw Error(n(168));
    Ne(xt, o), Ne(Nt, u);
  }
  function Fg(i, o, u) {
    var h = i.stateNode;
    if (o = o.childContextTypes, typeof h.getChildContext != "function") return u;
    h = h.getChildContext();
    for (var v in h) if (!(v in o)) throw Error(n(108, Ie(i) || "Unknown", v));
    return Z({}, u, h);
  }
  function Ul(i) {
    return i = (i = i.stateNode) && i.__reactInternalMemoizedMergedChildContext || Or, _i = xt.current, Ne(xt, i), Ne(Nt, Nt.current), !0;
  }
  function Og(i, o, u) {
    var h = i.stateNode;
    if (!h) throw Error(n(169));
    u ? (i = Fg(i, o, _i), h.__reactInternalMemoizedMergedChildContext = i, je(Nt), je(xt), Ne(xt, i)) : je(Nt), Ne(Nt, u);
  }
  var or = null, $l = !1, Hf = !1;
  function Ig(i) {
    or === null ? or = [i] : or.push(i);
  }
  function IP(i) {
    $l = !0, Ig(i);
  }
  function Ir() {
    if (!Hf && or !== null) {
      Hf = !0;
      var i = 0, o = Re;
      try {
        var u = or;
        for (Re = 1; i < u.length; i++) {
          var h = u[i];
          do
            h = h(!0);
          while (h !== null);
        }
        or = null, $l = !1;
      } catch (v) {
        throw or !== null && (or = or.slice(i + 1)), Ly(df, Ir), v;
      } finally {
        Re = o, Hf = !1;
      }
    }
    return null;
  }
  var ws = [], Ss = 0, Hl = null, Wl = 0, dn = [], hn = 0, wi = null, ar = 1, lr = "";
  function Si(i, o) {
    ws[Ss++] = Wl, ws[Ss++] = Hl, Hl = i, Wl = o;
  }
  function Ng(i, o, u) {
    dn[hn++] = ar, dn[hn++] = lr, dn[hn++] = wi, wi = i;
    var h = ar;
    i = lr;
    var v = 32 - Pn(h) - 1;
    h &= ~(1 << v), u += 1;
    var w = 32 - Pn(o) + v;
    if (30 < w) {
      var P = v - v % 5;
      w = (h & (1 << P) - 1).toString(32), h >>= P, v -= P, ar = 1 << 32 - Pn(o) + v | u << v | h, lr = w + i;
    } else ar = 1 << w | u << v | h, lr = i;
  }
  function Wf(i) {
    i.return !== null && (Si(i, 1), Ng(i, 1, 0));
  }
  function Gf(i) {
    for (; i === Hl; ) Hl = ws[--Ss], ws[Ss] = null, Wl = ws[--Ss], ws[Ss] = null;
    for (; i === wi; ) wi = dn[--hn], dn[hn] = null, lr = dn[--hn], dn[hn] = null, ar = dn[--hn], dn[hn] = null;
  }
  var Jt = null, en = null, Be = !1, An = null;
  function Lg(i, o) {
    var u = gn(5, null, null, 0);
    u.elementType = "DELETED", u.stateNode = o, u.return = i, o = i.deletions, o === null ? (i.deletions = [u], i.flags |= 16) : o.push(u);
  }
  function jg(i, o) {
    switch (i.tag) {
      case 5:
        var u = i.type;
        return o = o.nodeType !== 1 || u.toLowerCase() !== o.nodeName.toLowerCase() ? null : o, o !== null ? (i.stateNode = o, Jt = i, en = Dr(o.firstChild), !0) : !1;
      case 6:
        return o = i.pendingProps === "" || o.nodeType !== 3 ? null : o, o !== null ? (i.stateNode = o, Jt = i, en = null, !0) : !1;
      case 13:
        return o = o.nodeType !== 8 ? null : o, o !== null ? (u = wi !== null ? { id: ar, overflow: lr } : null, i.memoizedState = { dehydrated: o, treeContext: u, retryLane: 1073741824 }, u = gn(18, null, null, 0), u.stateNode = o, u.return = i, i.child = u, Jt = i, en = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Kf(i) {
    return (i.mode & 1) !== 0 && (i.flags & 128) === 0;
  }
  function Qf(i) {
    if (Be) {
      var o = en;
      if (o) {
        var u = o;
        if (!jg(i, o)) {
          if (Kf(i)) throw Error(n(418));
          o = Dr(u.nextSibling);
          var h = Jt;
          o && jg(i, o) ? Lg(h, u) : (i.flags = i.flags & -4097 | 2, Be = !1, Jt = i);
        }
      } else {
        if (Kf(i)) throw Error(n(418));
        i.flags = i.flags & -4097 | 2, Be = !1, Jt = i;
      }
    }
  }
  function Vg(i) {
    for (i = i.return; i !== null && i.tag !== 5 && i.tag !== 3 && i.tag !== 13; ) i = i.return;
    Jt = i;
  }
  function Gl(i) {
    if (i !== Jt) return !1;
    if (!Be) return Vg(i), Be = !0, !1;
    var o;
    if ((o = i.tag !== 3) && !(o = i.tag !== 5) && (o = i.type, o = o !== "head" && o !== "body" && !Vf(i.type, i.memoizedProps)), o && (o = en)) {
      if (Kf(i)) throw Bg(), Error(n(418));
      for (; o; ) Lg(i, o), o = Dr(o.nextSibling);
    }
    if (Vg(i), i.tag === 13) {
      if (i = i.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(n(317));
      e: {
        for (i = i.nextSibling, o = 0; i; ) {
          if (i.nodeType === 8) {
            var u = i.data;
            if (u === "/$") {
              if (o === 0) {
                en = Dr(i.nextSibling);
                break e;
              }
              o--;
            } else u !== "$" && u !== "$!" && u !== "$?" || o++;
          }
          i = i.nextSibling;
        }
        en = null;
      }
    } else en = Jt ? Dr(i.stateNode.nextSibling) : null;
    return !0;
  }
  function Bg() {
    for (var i = en; i; ) i = Dr(i.nextSibling);
  }
  function xs() {
    en = Jt = null, Be = !1;
  }
  function Yf(i) {
    An === null ? An = [i] : An.push(i);
  }
  var NP = b.ReactCurrentBatchConfig;
  function Xo(i, o, u) {
    if (i = u.ref, i !== null && typeof i != "function" && typeof i != "object") {
      if (u._owner) {
        if (u = u._owner, u) {
          if (u.tag !== 1) throw Error(n(309));
          var h = u.stateNode;
        }
        if (!h) throw Error(n(147, i));
        var v = h, w = "" + i;
        return o !== null && o.ref !== null && typeof o.ref == "function" && o.ref._stringRef === w ? o.ref : (o = function(P) {
          var R = v.refs;
          P === null ? delete R[w] : R[w] = P;
        }, o._stringRef = w, o);
      }
      if (typeof i != "string") throw Error(n(284));
      if (!u._owner) throw Error(n(290, i));
    }
    return i;
  }
  function Kl(i, o) {
    throw i = Object.prototype.toString.call(o), Error(n(31, i === "[object Object]" ? "object with keys {" + Object.keys(o).join(", ") + "}" : i));
  }
  function zg(i) {
    var o = i._init;
    return o(i._payload);
  }
  function Ug(i) {
    function o(V, N) {
      if (i) {
        var z = V.deletions;
        z === null ? (V.deletions = [N], V.flags |= 16) : z.push(N);
      }
    }
    function u(V, N) {
      if (!i) return null;
      for (; N !== null; ) o(V, N), N = N.sibling;
      return null;
    }
    function h(V, N) {
      for (V = /* @__PURE__ */ new Map(); N !== null; ) N.key !== null ? V.set(N.key, N) : V.set(N.index, N), N = N.sibling;
      return V;
    }
    function v(V, N) {
      return V = $r(V, N), V.index = 0, V.sibling = null, V;
    }
    function w(V, N, z) {
      return V.index = z, i ? (z = V.alternate, z !== null ? (z = z.index, z < N ? (V.flags |= 2, N) : z) : (V.flags |= 2, N)) : (V.flags |= 1048576, N);
    }
    function P(V) {
      return i && V.alternate === null && (V.flags |= 2), V;
    }
    function R(V, N, z, X) {
      return N === null || N.tag !== 6 ? (N = Bd(z, V.mode, X), N.return = V, N) : (N = v(N, z), N.return = V, N);
    }
    function D(V, N, z, X) {
      var ce = z.type;
      return ce === I ? K(V, N, z.props.children, X, z.key) : N !== null && (N.elementType === ce || typeof ce == "object" && ce !== null && ce.$$typeof === fe && zg(ce) === N.type) ? (X = v(N, z.props), X.ref = Xo(V, N, z), X.return = V, X) : (X = gu(z.type, z.key, z.props, null, V.mode, X), X.ref = Xo(V, N, z), X.return = V, X);
    }
    function U(V, N, z, X) {
      return N === null || N.tag !== 4 || N.stateNode.containerInfo !== z.containerInfo || N.stateNode.implementation !== z.implementation ? (N = zd(z, V.mode, X), N.return = V, N) : (N = v(N, z.children || []), N.return = V, N);
    }
    function K(V, N, z, X, ce) {
      return N === null || N.tag !== 7 ? (N = bi(z, V.mode, X, ce), N.return = V, N) : (N = v(N, z), N.return = V, N);
    }
    function Q(V, N, z) {
      if (typeof N == "string" && N !== "" || typeof N == "number") return N = Bd("" + N, V.mode, z), N.return = V, N;
      if (typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case M:
            return z = gu(N.type, N.key, N.props, null, V.mode, z), z.ref = Xo(V, null, N), z.return = V, z;
          case B:
            return N = zd(N, V.mode, z), N.return = V, N;
          case fe:
            var X = N._init;
            return Q(V, X(N._payload), z);
        }
        if (ko(N) || ee(N)) return N = bi(N, V.mode, z, null), N.return = V, N;
        Kl(V, N);
      }
      return null;
    }
    function G(V, N, z, X) {
      var ce = N !== null ? N.key : null;
      if (typeof z == "string" && z !== "" || typeof z == "number") return ce !== null ? null : R(V, N, "" + z, X);
      if (typeof z == "object" && z !== null) {
        switch (z.$$typeof) {
          case M:
            return z.key === ce ? D(V, N, z, X) : null;
          case B:
            return z.key === ce ? U(V, N, z, X) : null;
          case fe:
            return ce = z._init, G(
              V,
              N,
              ce(z._payload),
              X
            );
        }
        if (ko(z) || ee(z)) return ce !== null ? null : K(V, N, z, X, null);
        Kl(V, z);
      }
      return null;
    }
    function te(V, N, z, X, ce) {
      if (typeof X == "string" && X !== "" || typeof X == "number") return V = V.get(z) || null, R(N, V, "" + X, ce);
      if (typeof X == "object" && X !== null) {
        switch (X.$$typeof) {
          case M:
            return V = V.get(X.key === null ? z : X.key) || null, D(N, V, X, ce);
          case B:
            return V = V.get(X.key === null ? z : X.key) || null, U(N, V, X, ce);
          case fe:
            var de = X._init;
            return te(V, N, z, de(X._payload), ce);
        }
        if (ko(X) || ee(X)) return V = V.get(z) || null, K(N, V, X, ce, null);
        Kl(N, X);
      }
      return null;
    }
    function oe(V, N, z, X) {
      for (var ce = null, de = null, he = N, ge = N = 0, ft = null; he !== null && ge < z.length; ge++) {
        he.index > ge ? (ft = he, he = null) : ft = he.sibling;
        var Ee = G(V, he, z[ge], X);
        if (Ee === null) {
          he === null && (he = ft);
          break;
        }
        i && he && Ee.alternate === null && o(V, he), N = w(Ee, N, ge), de === null ? ce = Ee : de.sibling = Ee, de = Ee, he = ft;
      }
      if (ge === z.length) return u(V, he), Be && Si(V, ge), ce;
      if (he === null) {
        for (; ge < z.length; ge++) he = Q(V, z[ge], X), he !== null && (N = w(he, N, ge), de === null ? ce = he : de.sibling = he, de = he);
        return Be && Si(V, ge), ce;
      }
      for (he = h(V, he); ge < z.length; ge++) ft = te(he, V, ge, z[ge], X), ft !== null && (i && ft.alternate !== null && he.delete(ft.key === null ? ge : ft.key), N = w(ft, N, ge), de === null ? ce = ft : de.sibling = ft, de = ft);
      return i && he.forEach(function(Hr) {
        return o(V, Hr);
      }), Be && Si(V, ge), ce;
    }
    function le(V, N, z, X) {
      var ce = ee(z);
      if (typeof ce != "function") throw Error(n(150));
      if (z = ce.call(z), z == null) throw Error(n(151));
      for (var de = ce = null, he = N, ge = N = 0, ft = null, Ee = z.next(); he !== null && !Ee.done; ge++, Ee = z.next()) {
        he.index > ge ? (ft = he, he = null) : ft = he.sibling;
        var Hr = G(V, he, Ee.value, X);
        if (Hr === null) {
          he === null && (he = ft);
          break;
        }
        i && he && Hr.alternate === null && o(V, he), N = w(Hr, N, ge), de === null ? ce = Hr : de.sibling = Hr, de = Hr, he = ft;
      }
      if (Ee.done) return u(
        V,
        he
      ), Be && Si(V, ge), ce;
      if (he === null) {
        for (; !Ee.done; ge++, Ee = z.next()) Ee = Q(V, Ee.value, X), Ee !== null && (N = w(Ee, N, ge), de === null ? ce = Ee : de.sibling = Ee, de = Ee);
        return Be && Si(V, ge), ce;
      }
      for (he = h(V, he); !Ee.done; ge++, Ee = z.next()) Ee = te(he, V, ge, Ee.value, X), Ee !== null && (i && Ee.alternate !== null && he.delete(Ee.key === null ? ge : Ee.key), N = w(Ee, N, ge), de === null ? ce = Ee : de.sibling = Ee, de = Ee);
      return i && he.forEach(function(mE) {
        return o(V, mE);
      }), Be && Si(V, ge), ce;
    }
    function Je(V, N, z, X) {
      if (typeof z == "object" && z !== null && z.type === I && z.key === null && (z = z.props.children), typeof z == "object" && z !== null) {
        switch (z.$$typeof) {
          case M:
            e: {
              for (var ce = z.key, de = N; de !== null; ) {
                if (de.key === ce) {
                  if (ce = z.type, ce === I) {
                    if (de.tag === 7) {
                      u(V, de.sibling), N = v(de, z.props.children), N.return = V, V = N;
                      break e;
                    }
                  } else if (de.elementType === ce || typeof ce == "object" && ce !== null && ce.$$typeof === fe && zg(ce) === de.type) {
                    u(V, de.sibling), N = v(de, z.props), N.ref = Xo(V, de, z), N.return = V, V = N;
                    break e;
                  }
                  u(V, de);
                  break;
                } else o(V, de);
                de = de.sibling;
              }
              z.type === I ? (N = bi(z.props.children, V.mode, X, z.key), N.return = V, V = N) : (X = gu(z.type, z.key, z.props, null, V.mode, X), X.ref = Xo(V, N, z), X.return = V, V = X);
            }
            return P(V);
          case B:
            e: {
              for (de = z.key; N !== null; ) {
                if (N.key === de) if (N.tag === 4 && N.stateNode.containerInfo === z.containerInfo && N.stateNode.implementation === z.implementation) {
                  u(V, N.sibling), N = v(N, z.children || []), N.return = V, V = N;
                  break e;
                } else {
                  u(V, N);
                  break;
                }
                else o(V, N);
                N = N.sibling;
              }
              N = zd(z, V.mode, X), N.return = V, V = N;
            }
            return P(V);
          case fe:
            return de = z._init, Je(V, N, de(z._payload), X);
        }
        if (ko(z)) return oe(V, N, z, X);
        if (ee(z)) return le(V, N, z, X);
        Kl(V, z);
      }
      return typeof z == "string" && z !== "" || typeof z == "number" ? (z = "" + z, N !== null && N.tag === 6 ? (u(V, N.sibling), N = v(N, z), N.return = V, V = N) : (u(V, N), N = Bd(z, V.mode, X), N.return = V, V = N), P(V)) : u(V, N);
    }
    return Je;
  }
  var Ts = Ug(!0), $g = Ug(!1), Ql = Fr(null), Yl = null, Cs = null, Xf = null;
  function qf() {
    Xf = Cs = Yl = null;
  }
  function Zf(i) {
    var o = Ql.current;
    je(Ql), i._currentValue = o;
  }
  function Jf(i, o, u) {
    for (; i !== null; ) {
      var h = i.alternate;
      if ((i.childLanes & o) !== o ? (i.childLanes |= o, h !== null && (h.childLanes |= o)) : h !== null && (h.childLanes & o) !== o && (h.childLanes |= o), i === u) break;
      i = i.return;
    }
  }
  function ks(i, o) {
    Yl = i, Xf = Cs = null, i = i.dependencies, i !== null && i.firstContext !== null && ((i.lanes & o) !== 0 && (jt = !0), i.firstContext = null);
  }
  function pn(i) {
    var o = i._currentValue;
    if (Xf !== i) if (i = { context: i, memoizedValue: o, next: null }, Cs === null) {
      if (Yl === null) throw Error(n(308));
      Cs = i, Yl.dependencies = { lanes: 0, firstContext: i };
    } else Cs = Cs.next = i;
    return o;
  }
  var xi = null;
  function ed(i) {
    xi === null ? xi = [i] : xi.push(i);
  }
  function Hg(i, o, u, h) {
    var v = o.interleaved;
    return v === null ? (u.next = u, ed(o)) : (u.next = v.next, v.next = u), o.interleaved = u, ur(i, h);
  }
  function ur(i, o) {
    i.lanes |= o;
    var u = i.alternate;
    for (u !== null && (u.lanes |= o), u = i, i = i.return; i !== null; ) i.childLanes |= o, u = i.alternate, u !== null && (u.childLanes |= o), u = i, i = i.return;
    return u.tag === 3 ? u.stateNode : null;
  }
  var Nr = !1;
  function td(i) {
    i.updateQueue = { baseState: i.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Wg(i, o) {
    i = i.updateQueue, o.updateQueue === i && (o.updateQueue = { baseState: i.baseState, firstBaseUpdate: i.firstBaseUpdate, lastBaseUpdate: i.lastBaseUpdate, shared: i.shared, effects: i.effects });
  }
  function cr(i, o) {
    return { eventTime: i, lane: o, tag: 0, payload: null, callback: null, next: null };
  }
  function Lr(i, o, u) {
    var h = i.updateQueue;
    if (h === null) return null;
    if (h = h.shared, (ke & 2) !== 0) {
      var v = h.pending;
      return v === null ? o.next = o : (o.next = v.next, v.next = o), h.pending = o, ur(i, u);
    }
    return v = h.interleaved, v === null ? (o.next = o, ed(h)) : (o.next = v.next, v.next = o), h.interleaved = o, ur(i, u);
  }
  function Xl(i, o, u) {
    if (o = o.updateQueue, o !== null && (o = o.shared, (u & 4194240) !== 0)) {
      var h = o.lanes;
      h &= i.pendingLanes, u |= h, o.lanes = u, mf(i, u);
    }
  }
  function Gg(i, o) {
    var u = i.updateQueue, h = i.alternate;
    if (h !== null && (h = h.updateQueue, u === h)) {
      var v = null, w = null;
      if (u = u.firstBaseUpdate, u !== null) {
        do {
          var P = { eventTime: u.eventTime, lane: u.lane, tag: u.tag, payload: u.payload, callback: u.callback, next: null };
          w === null ? v = w = P : w = w.next = P, u = u.next;
        } while (u !== null);
        w === null ? v = w = o : w = w.next = o;
      } else v = w = o;
      u = { baseState: h.baseState, firstBaseUpdate: v, lastBaseUpdate: w, shared: h.shared, effects: h.effects }, i.updateQueue = u;
      return;
    }
    i = u.lastBaseUpdate, i === null ? u.firstBaseUpdate = o : i.next = o, u.lastBaseUpdate = o;
  }
  function ql(i, o, u, h) {
    var v = i.updateQueue;
    Nr = !1;
    var w = v.firstBaseUpdate, P = v.lastBaseUpdate, R = v.shared.pending;
    if (R !== null) {
      v.shared.pending = null;
      var D = R, U = D.next;
      D.next = null, P === null ? w = U : P.next = U, P = D;
      var K = i.alternate;
      K !== null && (K = K.updateQueue, R = K.lastBaseUpdate, R !== P && (R === null ? K.firstBaseUpdate = U : R.next = U, K.lastBaseUpdate = D));
    }
    if (w !== null) {
      var Q = v.baseState;
      P = 0, K = U = D = null, R = w;
      do {
        var G = R.lane, te = R.eventTime;
        if ((h & G) === G) {
          K !== null && (K = K.next = {
            eventTime: te,
            lane: 0,
            tag: R.tag,
            payload: R.payload,
            callback: R.callback,
            next: null
          });
          e: {
            var oe = i, le = R;
            switch (G = o, te = u, le.tag) {
              case 1:
                if (oe = le.payload, typeof oe == "function") {
                  Q = oe.call(te, Q, G);
                  break e;
                }
                Q = oe;
                break e;
              case 3:
                oe.flags = oe.flags & -65537 | 128;
              case 0:
                if (oe = le.payload, G = typeof oe == "function" ? oe.call(te, Q, G) : oe, G == null) break e;
                Q = Z({}, Q, G);
                break e;
              case 2:
                Nr = !0;
            }
          }
          R.callback !== null && R.lane !== 0 && (i.flags |= 64, G = v.effects, G === null ? v.effects = [R] : G.push(R));
        } else te = { eventTime: te, lane: G, tag: R.tag, payload: R.payload, callback: R.callback, next: null }, K === null ? (U = K = te, D = Q) : K = K.next = te, P |= G;
        if (R = R.next, R === null) {
          if (R = v.shared.pending, R === null) break;
          G = R, R = G.next, G.next = null, v.lastBaseUpdate = G, v.shared.pending = null;
        }
      } while (!0);
      if (K === null && (D = Q), v.baseState = D, v.firstBaseUpdate = U, v.lastBaseUpdate = K, o = v.shared.interleaved, o !== null) {
        v = o;
        do
          P |= v.lane, v = v.next;
        while (v !== o);
      } else w === null && (v.shared.lanes = 0);
      ki |= P, i.lanes = P, i.memoizedState = Q;
    }
  }
  function Kg(i, o, u) {
    if (i = o.effects, o.effects = null, i !== null) for (o = 0; o < i.length; o++) {
      var h = i[o], v = h.callback;
      if (v !== null) {
        if (h.callback = null, h = u, typeof v != "function") throw Error(n(191, v));
        v.call(h);
      }
    }
  }
  var qo = {}, Un = Fr(qo), Zo = Fr(qo), Jo = Fr(qo);
  function Ti(i) {
    if (i === qo) throw Error(n(174));
    return i;
  }
  function nd(i, o) {
    switch (Ne(Jo, o), Ne(Zo, i), Ne(Un, qo), i = o.nodeType, i) {
      case 9:
      case 11:
        o = (o = o.documentElement) ? o.namespaceURI : nf(null, "");
        break;
      default:
        i = i === 8 ? o.parentNode : o, o = i.namespaceURI || null, i = i.tagName, o = nf(o, i);
    }
    je(Un), Ne(Un, o);
  }
  function Ps() {
    je(Un), je(Zo), je(Jo);
  }
  function Qg(i) {
    Ti(Jo.current);
    var o = Ti(Un.current), u = nf(o, i.type);
    o !== u && (Ne(Zo, i), Ne(Un, u));
  }
  function rd(i) {
    Zo.current === i && (je(Un), je(Zo));
  }
  var Ue = Fr(0);
  function Zl(i) {
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
  var id = [];
  function sd() {
    for (var i = 0; i < id.length; i++) id[i]._workInProgressVersionPrimary = null;
    id.length = 0;
  }
  var Jl = b.ReactCurrentDispatcher, od = b.ReactCurrentBatchConfig, Ci = 0, $e = null, st = null, ut = null, eu = !1, ea = !1, ta = 0, LP = 0;
  function Tt() {
    throw Error(n(321));
  }
  function ad(i, o) {
    if (o === null) return !1;
    for (var u = 0; u < o.length && u < i.length; u++) if (!En(i[u], o[u])) return !1;
    return !0;
  }
  function ld(i, o, u, h, v, w) {
    if (Ci = w, $e = o, o.memoizedState = null, o.updateQueue = null, o.lanes = 0, Jl.current = i === null || i.memoizedState === null ? zP : UP, i = u(h, v), ea) {
      w = 0;
      do {
        if (ea = !1, ta = 0, 25 <= w) throw Error(n(301));
        w += 1, ut = st = null, o.updateQueue = null, Jl.current = $P, i = u(h, v);
      } while (ea);
    }
    if (Jl.current = ru, o = st !== null && st.next !== null, Ci = 0, ut = st = $e = null, eu = !1, o) throw Error(n(300));
    return i;
  }
  function ud() {
    var i = ta !== 0;
    return ta = 0, i;
  }
  function $n() {
    var i = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return ut === null ? $e.memoizedState = ut = i : ut = ut.next = i, ut;
  }
  function mn() {
    if (st === null) {
      var i = $e.alternate;
      i = i !== null ? i.memoizedState : null;
    } else i = st.next;
    var o = ut === null ? $e.memoizedState : ut.next;
    if (o !== null) ut = o, st = i;
    else {
      if (i === null) throw Error(n(310));
      st = i, i = { memoizedState: st.memoizedState, baseState: st.baseState, baseQueue: st.baseQueue, queue: st.queue, next: null }, ut === null ? $e.memoizedState = ut = i : ut = ut.next = i;
    }
    return ut;
  }
  function na(i, o) {
    return typeof o == "function" ? o(i) : o;
  }
  function cd(i) {
    var o = mn(), u = o.queue;
    if (u === null) throw Error(n(311));
    u.lastRenderedReducer = i;
    var h = st, v = h.baseQueue, w = u.pending;
    if (w !== null) {
      if (v !== null) {
        var P = v.next;
        v.next = w.next, w.next = P;
      }
      h.baseQueue = v = w, u.pending = null;
    }
    if (v !== null) {
      w = v.next, h = h.baseState;
      var R = P = null, D = null, U = w;
      do {
        var K = U.lane;
        if ((Ci & K) === K) D !== null && (D = D.next = { lane: 0, action: U.action, hasEagerState: U.hasEagerState, eagerState: U.eagerState, next: null }), h = U.hasEagerState ? U.eagerState : i(h, U.action);
        else {
          var Q = {
            lane: K,
            action: U.action,
            hasEagerState: U.hasEagerState,
            eagerState: U.eagerState,
            next: null
          };
          D === null ? (R = D = Q, P = h) : D = D.next = Q, $e.lanes |= K, ki |= K;
        }
        U = U.next;
      } while (U !== null && U !== w);
      D === null ? P = h : D.next = R, En(h, o.memoizedState) || (jt = !0), o.memoizedState = h, o.baseState = P, o.baseQueue = D, u.lastRenderedState = h;
    }
    if (i = u.interleaved, i !== null) {
      v = i;
      do
        w = v.lane, $e.lanes |= w, ki |= w, v = v.next;
      while (v !== i);
    } else v === null && (u.lanes = 0);
    return [o.memoizedState, u.dispatch];
  }
  function fd(i) {
    var o = mn(), u = o.queue;
    if (u === null) throw Error(n(311));
    u.lastRenderedReducer = i;
    var h = u.dispatch, v = u.pending, w = o.memoizedState;
    if (v !== null) {
      u.pending = null;
      var P = v = v.next;
      do
        w = i(w, P.action), P = P.next;
      while (P !== v);
      En(w, o.memoizedState) || (jt = !0), o.memoizedState = w, o.baseQueue === null && (o.baseState = w), u.lastRenderedState = w;
    }
    return [w, h];
  }
  function Yg() {
  }
  function Xg(i, o) {
    var u = $e, h = mn(), v = o(), w = !En(h.memoizedState, v);
    if (w && (h.memoizedState = v, jt = !0), h = h.queue, dd(Jg.bind(null, u, h, i), [i]), h.getSnapshot !== o || w || ut !== null && ut.memoizedState.tag & 1) {
      if (u.flags |= 2048, ra(9, Zg.bind(null, u, h, v, o), void 0, null), ct === null) throw Error(n(349));
      (Ci & 30) !== 0 || qg(u, o, v);
    }
    return v;
  }
  function qg(i, o, u) {
    i.flags |= 16384, i = { getSnapshot: o, value: u }, o = $e.updateQueue, o === null ? (o = { lastEffect: null, stores: null }, $e.updateQueue = o, o.stores = [i]) : (u = o.stores, u === null ? o.stores = [i] : u.push(i));
  }
  function Zg(i, o, u, h) {
    o.value = u, o.getSnapshot = h, ev(o) && tv(i);
  }
  function Jg(i, o, u) {
    return u(function() {
      ev(o) && tv(i);
    });
  }
  function ev(i) {
    var o = i.getSnapshot;
    i = i.value;
    try {
      var u = o();
      return !En(i, u);
    } catch {
      return !0;
    }
  }
  function tv(i) {
    var o = ur(i, 1);
    o !== null && Dn(o, i, 1, -1);
  }
  function nv(i) {
    var o = $n();
    return typeof i == "function" && (i = i()), o.memoizedState = o.baseState = i, i = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: na, lastRenderedState: i }, o.queue = i, i = i.dispatch = BP.bind(null, $e, i), [o.memoizedState, i];
  }
  function ra(i, o, u, h) {
    return i = { tag: i, create: o, destroy: u, deps: h, next: null }, o = $e.updateQueue, o === null ? (o = { lastEffect: null, stores: null }, $e.updateQueue = o, o.lastEffect = i.next = i) : (u = o.lastEffect, u === null ? o.lastEffect = i.next = i : (h = u.next, u.next = i, i.next = h, o.lastEffect = i)), i;
  }
  function rv() {
    return mn().memoizedState;
  }
  function tu(i, o, u, h) {
    var v = $n();
    $e.flags |= i, v.memoizedState = ra(1 | o, u, void 0, h === void 0 ? null : h);
  }
  function nu(i, o, u, h) {
    var v = mn();
    h = h === void 0 ? null : h;
    var w = void 0;
    if (st !== null) {
      var P = st.memoizedState;
      if (w = P.destroy, h !== null && ad(h, P.deps)) {
        v.memoizedState = ra(o, u, w, h);
        return;
      }
    }
    $e.flags |= i, v.memoizedState = ra(1 | o, u, w, h);
  }
  function iv(i, o) {
    return tu(8390656, 8, i, o);
  }
  function dd(i, o) {
    return nu(2048, 8, i, o);
  }
  function sv(i, o) {
    return nu(4, 2, i, o);
  }
  function ov(i, o) {
    return nu(4, 4, i, o);
  }
  function av(i, o) {
    if (typeof o == "function") return i = i(), o(i), function() {
      o(null);
    };
    if (o != null) return i = i(), o.current = i, function() {
      o.current = null;
    };
  }
  function lv(i, o, u) {
    return u = u != null ? u.concat([i]) : null, nu(4, 4, av.bind(null, o, i), u);
  }
  function hd() {
  }
  function uv(i, o) {
    var u = mn();
    o = o === void 0 ? null : o;
    var h = u.memoizedState;
    return h !== null && o !== null && ad(o, h[1]) ? h[0] : (u.memoizedState = [i, o], i);
  }
  function cv(i, o) {
    var u = mn();
    o = o === void 0 ? null : o;
    var h = u.memoizedState;
    return h !== null && o !== null && ad(o, h[1]) ? h[0] : (i = i(), u.memoizedState = [i, o], i);
  }
  function fv(i, o, u) {
    return (Ci & 21) === 0 ? (i.baseState && (i.baseState = !1, jt = !0), i.memoizedState = u) : (En(u, o) || (u = zy(), $e.lanes |= u, ki |= u, i.baseState = !0), o);
  }
  function jP(i, o) {
    var u = Re;
    Re = u !== 0 && 4 > u ? u : 4, i(!0);
    var h = od.transition;
    od.transition = {};
    try {
      i(!1), o();
    } finally {
      Re = u, od.transition = h;
    }
  }
  function dv() {
    return mn().memoizedState;
  }
  function VP(i, o, u) {
    var h = zr(i);
    if (u = { lane: h, action: u, hasEagerState: !1, eagerState: null, next: null }, hv(i)) pv(o, u);
    else if (u = Hg(i, o, u, h), u !== null) {
      var v = Rt();
      Dn(u, i, h, v), mv(u, o, h);
    }
  }
  function BP(i, o, u) {
    var h = zr(i), v = { lane: h, action: u, hasEagerState: !1, eagerState: null, next: null };
    if (hv(i)) pv(o, v);
    else {
      var w = i.alternate;
      if (i.lanes === 0 && (w === null || w.lanes === 0) && (w = o.lastRenderedReducer, w !== null)) try {
        var P = o.lastRenderedState, R = w(P, u);
        if (v.hasEagerState = !0, v.eagerState = R, En(R, P)) {
          var D = o.interleaved;
          D === null ? (v.next = v, ed(o)) : (v.next = D.next, D.next = v), o.interleaved = v;
          return;
        }
      } catch {
      } finally {
      }
      u = Hg(i, o, v, h), u !== null && (v = Rt(), Dn(u, i, h, v), mv(u, o, h));
    }
  }
  function hv(i) {
    var o = i.alternate;
    return i === $e || o !== null && o === $e;
  }
  function pv(i, o) {
    ea = eu = !0;
    var u = i.pending;
    u === null ? o.next = o : (o.next = u.next, u.next = o), i.pending = o;
  }
  function mv(i, o, u) {
    if ((u & 4194240) !== 0) {
      var h = o.lanes;
      h &= i.pendingLanes, u |= h, o.lanes = u, mf(i, u);
    }
  }
  var ru = { readContext: pn, useCallback: Tt, useContext: Tt, useEffect: Tt, useImperativeHandle: Tt, useInsertionEffect: Tt, useLayoutEffect: Tt, useMemo: Tt, useReducer: Tt, useRef: Tt, useState: Tt, useDebugValue: Tt, useDeferredValue: Tt, useTransition: Tt, useMutableSource: Tt, useSyncExternalStore: Tt, useId: Tt, unstable_isNewReconciler: !1 }, zP = { readContext: pn, useCallback: function(i, o) {
    return $n().memoizedState = [i, o === void 0 ? null : o], i;
  }, useContext: pn, useEffect: iv, useImperativeHandle: function(i, o, u) {
    return u = u != null ? u.concat([i]) : null, tu(
      4194308,
      4,
      av.bind(null, o, i),
      u
    );
  }, useLayoutEffect: function(i, o) {
    return tu(4194308, 4, i, o);
  }, useInsertionEffect: function(i, o) {
    return tu(4, 2, i, o);
  }, useMemo: function(i, o) {
    var u = $n();
    return o = o === void 0 ? null : o, i = i(), u.memoizedState = [i, o], i;
  }, useReducer: function(i, o, u) {
    var h = $n();
    return o = u !== void 0 ? u(o) : o, h.memoizedState = h.baseState = o, i = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: i, lastRenderedState: o }, h.queue = i, i = i.dispatch = VP.bind(null, $e, i), [h.memoizedState, i];
  }, useRef: function(i) {
    var o = $n();
    return i = { current: i }, o.memoizedState = i;
  }, useState: nv, useDebugValue: hd, useDeferredValue: function(i) {
    return $n().memoizedState = i;
  }, useTransition: function() {
    var i = nv(!1), o = i[0];
    return i = jP.bind(null, i[1]), $n().memoizedState = i, [o, i];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(i, o, u) {
    var h = $e, v = $n();
    if (Be) {
      if (u === void 0) throw Error(n(407));
      u = u();
    } else {
      if (u = o(), ct === null) throw Error(n(349));
      (Ci & 30) !== 0 || qg(h, o, u);
    }
    v.memoizedState = u;
    var w = { value: u, getSnapshot: o };
    return v.queue = w, iv(Jg.bind(
      null,
      h,
      w,
      i
    ), [i]), h.flags |= 2048, ra(9, Zg.bind(null, h, w, u, o), void 0, null), u;
  }, useId: function() {
    var i = $n(), o = ct.identifierPrefix;
    if (Be) {
      var u = lr, h = ar;
      u = (h & ~(1 << 32 - Pn(h) - 1)).toString(32) + u, o = ":" + o + "R" + u, u = ta++, 0 < u && (o += "H" + u.toString(32)), o += ":";
    } else u = LP++, o = ":" + o + "r" + u.toString(32) + ":";
    return i.memoizedState = o;
  }, unstable_isNewReconciler: !1 }, UP = {
    readContext: pn,
    useCallback: uv,
    useContext: pn,
    useEffect: dd,
    useImperativeHandle: lv,
    useInsertionEffect: sv,
    useLayoutEffect: ov,
    useMemo: cv,
    useReducer: cd,
    useRef: rv,
    useState: function() {
      return cd(na);
    },
    useDebugValue: hd,
    useDeferredValue: function(i) {
      var o = mn();
      return fv(o, st.memoizedState, i);
    },
    useTransition: function() {
      var i = cd(na)[0], o = mn().memoizedState;
      return [i, o];
    },
    useMutableSource: Yg,
    useSyncExternalStore: Xg,
    useId: dv,
    unstable_isNewReconciler: !1
  }, $P = { readContext: pn, useCallback: uv, useContext: pn, useEffect: dd, useImperativeHandle: lv, useInsertionEffect: sv, useLayoutEffect: ov, useMemo: cv, useReducer: fd, useRef: rv, useState: function() {
    return fd(na);
  }, useDebugValue: hd, useDeferredValue: function(i) {
    var o = mn();
    return st === null ? o.memoizedState = i : fv(o, st.memoizedState, i);
  }, useTransition: function() {
    var i = fd(na)[0], o = mn().memoizedState;
    return [i, o];
  }, useMutableSource: Yg, useSyncExternalStore: Xg, useId: dv, unstable_isNewReconciler: !1 };
  function bn(i, o) {
    if (i && i.defaultProps) {
      o = Z({}, o), i = i.defaultProps;
      for (var u in i) o[u] === void 0 && (o[u] = i[u]);
      return o;
    }
    return o;
  }
  function pd(i, o, u, h) {
    o = i.memoizedState, u = u(h, o), u = u == null ? o : Z({}, o, u), i.memoizedState = u, i.lanes === 0 && (i.updateQueue.baseState = u);
  }
  var iu = { isMounted: function(i) {
    return (i = i._reactInternals) ? gi(i) === i : !1;
  }, enqueueSetState: function(i, o, u) {
    i = i._reactInternals;
    var h = Rt(), v = zr(i), w = cr(h, v);
    w.payload = o, u != null && (w.callback = u), o = Lr(i, w, v), o !== null && (Dn(o, i, v, h), Xl(o, i, v));
  }, enqueueReplaceState: function(i, o, u) {
    i = i._reactInternals;
    var h = Rt(), v = zr(i), w = cr(h, v);
    w.tag = 1, w.payload = o, u != null && (w.callback = u), o = Lr(i, w, v), o !== null && (Dn(o, i, v, h), Xl(o, i, v));
  }, enqueueForceUpdate: function(i, o) {
    i = i._reactInternals;
    var u = Rt(), h = zr(i), v = cr(u, h);
    v.tag = 2, o != null && (v.callback = o), o = Lr(i, v, h), o !== null && (Dn(o, i, h, u), Xl(o, i, h));
  } };
  function yv(i, o, u, h, v, w, P) {
    return i = i.stateNode, typeof i.shouldComponentUpdate == "function" ? i.shouldComponentUpdate(h, w, P) : o.prototype && o.prototype.isPureReactComponent ? !$o(u, h) || !$o(v, w) : !0;
  }
  function gv(i, o, u) {
    var h = !1, v = Or, w = o.contextType;
    return typeof w == "object" && w !== null ? w = pn(w) : (v = Lt(o) ? _i : xt.current, h = o.contextTypes, w = (h = h != null) ? _s(i, v) : Or), o = new o(u, w), i.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, o.updater = iu, i.stateNode = o, o._reactInternals = i, h && (i = i.stateNode, i.__reactInternalMemoizedUnmaskedChildContext = v, i.__reactInternalMemoizedMaskedChildContext = w), o;
  }
  function vv(i, o, u, h) {
    i = o.state, typeof o.componentWillReceiveProps == "function" && o.componentWillReceiveProps(u, h), typeof o.UNSAFE_componentWillReceiveProps == "function" && o.UNSAFE_componentWillReceiveProps(u, h), o.state !== i && iu.enqueueReplaceState(o, o.state, null);
  }
  function md(i, o, u, h) {
    var v = i.stateNode;
    v.props = u, v.state = i.memoizedState, v.refs = {}, td(i);
    var w = o.contextType;
    typeof w == "object" && w !== null ? v.context = pn(w) : (w = Lt(o) ? _i : xt.current, v.context = _s(i, w)), v.state = i.memoizedState, w = o.getDerivedStateFromProps, typeof w == "function" && (pd(i, o, w, u), v.state = i.memoizedState), typeof o.getDerivedStateFromProps == "function" || typeof v.getSnapshotBeforeUpdate == "function" || typeof v.UNSAFE_componentWillMount != "function" && typeof v.componentWillMount != "function" || (o = v.state, typeof v.componentWillMount == "function" && v.componentWillMount(), typeof v.UNSAFE_componentWillMount == "function" && v.UNSAFE_componentWillMount(), o !== v.state && iu.enqueueReplaceState(v, v.state, null), ql(i, u, v, h), v.state = i.memoizedState), typeof v.componentDidMount == "function" && (i.flags |= 4194308);
  }
  function Es(i, o) {
    try {
      var u = "", h = o;
      do
        u += we(h), h = h.return;
      while (h);
      var v = u;
    } catch (w) {
      v = `
Error generating stack: ` + w.message + `
` + w.stack;
    }
    return { value: i, source: o, stack: v, digest: null };
  }
  function yd(i, o, u) {
    return { value: i, source: null, stack: u ?? null, digest: o ?? null };
  }
  function gd(i, o) {
    try {
      console.error(o.value);
    } catch (u) {
      setTimeout(function() {
        throw u;
      });
    }
  }
  var HP = typeof WeakMap == "function" ? WeakMap : Map;
  function _v(i, o, u) {
    u = cr(-1, u), u.tag = 3, u.payload = { element: null };
    var h = o.value;
    return u.callback = function() {
      fu || (fu = !0, Dd = h), gd(i, o);
    }, u;
  }
  function wv(i, o, u) {
    u = cr(-1, u), u.tag = 3;
    var h = i.type.getDerivedStateFromError;
    if (typeof h == "function") {
      var v = o.value;
      u.payload = function() {
        return h(v);
      }, u.callback = function() {
        gd(i, o);
      };
    }
    var w = i.stateNode;
    return w !== null && typeof w.componentDidCatch == "function" && (u.callback = function() {
      gd(i, o), typeof h != "function" && (Vr === null ? Vr = /* @__PURE__ */ new Set([this]) : Vr.add(this));
      var P = o.stack;
      this.componentDidCatch(o.value, { componentStack: P !== null ? P : "" });
    }), u;
  }
  function Sv(i, o, u) {
    var h = i.pingCache;
    if (h === null) {
      h = i.pingCache = new HP();
      var v = /* @__PURE__ */ new Set();
      h.set(o, v);
    } else v = h.get(o), v === void 0 && (v = /* @__PURE__ */ new Set(), h.set(o, v));
    v.has(u) || (v.add(u), i = iE.bind(null, i, o, u), o.then(i, i));
  }
  function xv(i) {
    do {
      var o;
      if ((o = i.tag === 13) && (o = i.memoizedState, o = o !== null ? o.dehydrated !== null : !0), o) return i;
      i = i.return;
    } while (i !== null);
    return null;
  }
  function Tv(i, o, u, h, v) {
    return (i.mode & 1) === 0 ? (i === o ? i.flags |= 65536 : (i.flags |= 128, u.flags |= 131072, u.flags &= -52805, u.tag === 1 && (u.alternate === null ? u.tag = 17 : (o = cr(-1, 1), o.tag = 2, Lr(u, o, 1))), u.lanes |= 1), i) : (i.flags |= 65536, i.lanes = v, i);
  }
  var WP = b.ReactCurrentOwner, jt = !1;
  function bt(i, o, u, h) {
    o.child = i === null ? $g(o, null, u, h) : Ts(o, i.child, u, h);
  }
  function Cv(i, o, u, h, v) {
    u = u.render;
    var w = o.ref;
    return ks(o, v), h = ld(i, o, u, h, w, v), u = ud(), i !== null && !jt ? (o.updateQueue = i.updateQueue, o.flags &= -2053, i.lanes &= ~v, fr(i, o, v)) : (Be && u && Wf(o), o.flags |= 1, bt(i, o, h, v), o.child);
  }
  function kv(i, o, u, h, v) {
    if (i === null) {
      var w = u.type;
      return typeof w == "function" && !Vd(w) && w.defaultProps === void 0 && u.compare === null && u.defaultProps === void 0 ? (o.tag = 15, o.type = w, Pv(i, o, w, h, v)) : (i = gu(u.type, null, h, o, o.mode, v), i.ref = o.ref, i.return = o, o.child = i);
    }
    if (w = i.child, (i.lanes & v) === 0) {
      var P = w.memoizedProps;
      if (u = u.compare, u = u !== null ? u : $o, u(P, h) && i.ref === o.ref) return fr(i, o, v);
    }
    return o.flags |= 1, i = $r(w, h), i.ref = o.ref, i.return = o, o.child = i;
  }
  function Pv(i, o, u, h, v) {
    if (i !== null) {
      var w = i.memoizedProps;
      if ($o(w, h) && i.ref === o.ref) if (jt = !1, o.pendingProps = h = w, (i.lanes & v) !== 0) (i.flags & 131072) !== 0 && (jt = !0);
      else return o.lanes = i.lanes, fr(i, o, v);
    }
    return vd(i, o, u, h, v);
  }
  function Ev(i, o, u) {
    var h = o.pendingProps, v = h.children, w = i !== null ? i.memoizedState : null;
    if (h.mode === "hidden") if ((o.mode & 1) === 0) o.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Ne(bs, tn), tn |= u;
    else {
      if ((u & 1073741824) === 0) return i = w !== null ? w.baseLanes | u : u, o.lanes = o.childLanes = 1073741824, o.memoizedState = { baseLanes: i, cachePool: null, transitions: null }, o.updateQueue = null, Ne(bs, tn), tn |= i, null;
      o.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, h = w !== null ? w.baseLanes : u, Ne(bs, tn), tn |= h;
    }
    else w !== null ? (h = w.baseLanes | u, o.memoizedState = null) : h = u, Ne(bs, tn), tn |= h;
    return bt(i, o, v, u), o.child;
  }
  function Av(i, o) {
    var u = o.ref;
    (i === null && u !== null || i !== null && i.ref !== u) && (o.flags |= 512, o.flags |= 2097152);
  }
  function vd(i, o, u, h, v) {
    var w = Lt(u) ? _i : xt.current;
    return w = _s(o, w), ks(o, v), u = ld(i, o, u, h, w, v), h = ud(), i !== null && !jt ? (o.updateQueue = i.updateQueue, o.flags &= -2053, i.lanes &= ~v, fr(i, o, v)) : (Be && h && Wf(o), o.flags |= 1, bt(i, o, u, v), o.child);
  }
  function bv(i, o, u, h, v) {
    if (Lt(u)) {
      var w = !0;
      Ul(o);
    } else w = !1;
    if (ks(o, v), o.stateNode === null) ou(i, o), gv(o, u, h), md(o, u, h, v), h = !0;
    else if (i === null) {
      var P = o.stateNode, R = o.memoizedProps;
      P.props = R;
      var D = P.context, U = u.contextType;
      typeof U == "object" && U !== null ? U = pn(U) : (U = Lt(u) ? _i : xt.current, U = _s(o, U));
      var K = u.getDerivedStateFromProps, Q = typeof K == "function" || typeof P.getSnapshotBeforeUpdate == "function";
      Q || typeof P.UNSAFE_componentWillReceiveProps != "function" && typeof P.componentWillReceiveProps != "function" || (R !== h || D !== U) && vv(o, P, h, U), Nr = !1;
      var G = o.memoizedState;
      P.state = G, ql(o, h, P, v), D = o.memoizedState, R !== h || G !== D || Nt.current || Nr ? (typeof K == "function" && (pd(o, u, K, h), D = o.memoizedState), (R = Nr || yv(o, u, R, h, G, D, U)) ? (Q || typeof P.UNSAFE_componentWillMount != "function" && typeof P.componentWillMount != "function" || (typeof P.componentWillMount == "function" && P.componentWillMount(), typeof P.UNSAFE_componentWillMount == "function" && P.UNSAFE_componentWillMount()), typeof P.componentDidMount == "function" && (o.flags |= 4194308)) : (typeof P.componentDidMount == "function" && (o.flags |= 4194308), o.memoizedProps = h, o.memoizedState = D), P.props = h, P.state = D, P.context = U, h = R) : (typeof P.componentDidMount == "function" && (o.flags |= 4194308), h = !1);
    } else {
      P = o.stateNode, Wg(i, o), R = o.memoizedProps, U = o.type === o.elementType ? R : bn(o.type, R), P.props = U, Q = o.pendingProps, G = P.context, D = u.contextType, typeof D == "object" && D !== null ? D = pn(D) : (D = Lt(u) ? _i : xt.current, D = _s(o, D));
      var te = u.getDerivedStateFromProps;
      (K = typeof te == "function" || typeof P.getSnapshotBeforeUpdate == "function") || typeof P.UNSAFE_componentWillReceiveProps != "function" && typeof P.componentWillReceiveProps != "function" || (R !== Q || G !== D) && vv(o, P, h, D), Nr = !1, G = o.memoizedState, P.state = G, ql(o, h, P, v);
      var oe = o.memoizedState;
      R !== Q || G !== oe || Nt.current || Nr ? (typeof te == "function" && (pd(o, u, te, h), oe = o.memoizedState), (U = Nr || yv(o, u, U, h, G, oe, D) || !1) ? (K || typeof P.UNSAFE_componentWillUpdate != "function" && typeof P.componentWillUpdate != "function" || (typeof P.componentWillUpdate == "function" && P.componentWillUpdate(h, oe, D), typeof P.UNSAFE_componentWillUpdate == "function" && P.UNSAFE_componentWillUpdate(h, oe, D)), typeof P.componentDidUpdate == "function" && (o.flags |= 4), typeof P.getSnapshotBeforeUpdate == "function" && (o.flags |= 1024)) : (typeof P.componentDidUpdate != "function" || R === i.memoizedProps && G === i.memoizedState || (o.flags |= 4), typeof P.getSnapshotBeforeUpdate != "function" || R === i.memoizedProps && G === i.memoizedState || (o.flags |= 1024), o.memoizedProps = h, o.memoizedState = oe), P.props = h, P.state = oe, P.context = D, h = U) : (typeof P.componentDidUpdate != "function" || R === i.memoizedProps && G === i.memoizedState || (o.flags |= 4), typeof P.getSnapshotBeforeUpdate != "function" || R === i.memoizedProps && G === i.memoizedState || (o.flags |= 1024), h = !1);
    }
    return _d(i, o, u, h, w, v);
  }
  function _d(i, o, u, h, v, w) {
    Av(i, o);
    var P = (o.flags & 128) !== 0;
    if (!h && !P) return v && Og(o, u, !1), fr(i, o, w);
    h = o.stateNode, WP.current = o;
    var R = P && typeof u.getDerivedStateFromError != "function" ? null : h.render();
    return o.flags |= 1, i !== null && P ? (o.child = Ts(o, i.child, null, w), o.child = Ts(o, null, R, w)) : bt(i, o, R, w), o.memoizedState = h.state, v && Og(o, u, !0), o.child;
  }
  function Rv(i) {
    var o = i.stateNode;
    o.pendingContext ? Dg(i, o.pendingContext, o.pendingContext !== o.context) : o.context && Dg(i, o.context, !1), nd(i, o.containerInfo);
  }
  function Mv(i, o, u, h, v) {
    return xs(), Yf(v), o.flags |= 256, bt(i, o, u, h), o.child;
  }
  var wd = { dehydrated: null, treeContext: null, retryLane: 0 };
  function Sd(i) {
    return { baseLanes: i, cachePool: null, transitions: null };
  }
  function Dv(i, o, u) {
    var h = o.pendingProps, v = Ue.current, w = !1, P = (o.flags & 128) !== 0, R;
    if ((R = P) || (R = i !== null && i.memoizedState === null ? !1 : (v & 2) !== 0), R ? (w = !0, o.flags &= -129) : (i === null || i.memoizedState !== null) && (v |= 1), Ne(Ue, v & 1), i === null)
      return Qf(o), i = o.memoizedState, i !== null && (i = i.dehydrated, i !== null) ? ((o.mode & 1) === 0 ? o.lanes = 1 : i.data === "$!" ? o.lanes = 8 : o.lanes = 1073741824, null) : (P = h.children, i = h.fallback, w ? (h = o.mode, w = o.child, P = { mode: "hidden", children: P }, (h & 1) === 0 && w !== null ? (w.childLanes = 0, w.pendingProps = P) : w = vu(P, h, 0, null), i = bi(i, h, u, null), w.return = o, i.return = o, w.sibling = i, o.child = w, o.child.memoizedState = Sd(u), o.memoizedState = wd, i) : xd(o, P));
    if (v = i.memoizedState, v !== null && (R = v.dehydrated, R !== null)) return GP(i, o, P, h, R, v, u);
    if (w) {
      w = h.fallback, P = o.mode, v = i.child, R = v.sibling;
      var D = { mode: "hidden", children: h.children };
      return (P & 1) === 0 && o.child !== v ? (h = o.child, h.childLanes = 0, h.pendingProps = D, o.deletions = null) : (h = $r(v, D), h.subtreeFlags = v.subtreeFlags & 14680064), R !== null ? w = $r(R, w) : (w = bi(w, P, u, null), w.flags |= 2), w.return = o, h.return = o, h.sibling = w, o.child = h, h = w, w = o.child, P = i.child.memoizedState, P = P === null ? Sd(u) : { baseLanes: P.baseLanes | u, cachePool: null, transitions: P.transitions }, w.memoizedState = P, w.childLanes = i.childLanes & ~u, o.memoizedState = wd, h;
    }
    return w = i.child, i = w.sibling, h = $r(w, { mode: "visible", children: h.children }), (o.mode & 1) === 0 && (h.lanes = u), h.return = o, h.sibling = null, i !== null && (u = o.deletions, u === null ? (o.deletions = [i], o.flags |= 16) : u.push(i)), o.child = h, o.memoizedState = null, h;
  }
  function xd(i, o) {
    return o = vu({ mode: "visible", children: o }, i.mode, 0, null), o.return = i, i.child = o;
  }
  function su(i, o, u, h) {
    return h !== null && Yf(h), Ts(o, i.child, null, u), i = xd(o, o.pendingProps.children), i.flags |= 2, o.memoizedState = null, i;
  }
  function GP(i, o, u, h, v, w, P) {
    if (u)
      return o.flags & 256 ? (o.flags &= -257, h = yd(Error(n(422))), su(i, o, P, h)) : o.memoizedState !== null ? (o.child = i.child, o.flags |= 128, null) : (w = h.fallback, v = o.mode, h = vu({ mode: "visible", children: h.children }, v, 0, null), w = bi(w, v, P, null), w.flags |= 2, h.return = o, w.return = o, h.sibling = w, o.child = h, (o.mode & 1) !== 0 && Ts(o, i.child, null, P), o.child.memoizedState = Sd(P), o.memoizedState = wd, w);
    if ((o.mode & 1) === 0) return su(i, o, P, null);
    if (v.data === "$!") {
      if (h = v.nextSibling && v.nextSibling.dataset, h) var R = h.dgst;
      return h = R, w = Error(n(419)), h = yd(w, h, void 0), su(i, o, P, h);
    }
    if (R = (P & i.childLanes) !== 0, jt || R) {
      if (h = ct, h !== null) {
        switch (P & -P) {
          case 4:
            v = 2;
            break;
          case 16:
            v = 8;
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
            v = 32;
            break;
          case 536870912:
            v = 268435456;
            break;
          default:
            v = 0;
        }
        v = (v & (h.suspendedLanes | P)) !== 0 ? 0 : v, v !== 0 && v !== w.retryLane && (w.retryLane = v, ur(i, v), Dn(h, i, v, -1));
      }
      return jd(), h = yd(Error(n(421))), su(i, o, P, h);
    }
    return v.data === "$?" ? (o.flags |= 128, o.child = i.child, o = sE.bind(null, i), v._reactRetry = o, null) : (i = w.treeContext, en = Dr(v.nextSibling), Jt = o, Be = !0, An = null, i !== null && (dn[hn++] = ar, dn[hn++] = lr, dn[hn++] = wi, ar = i.id, lr = i.overflow, wi = o), o = xd(o, h.children), o.flags |= 4096, o);
  }
  function Fv(i, o, u) {
    i.lanes |= o;
    var h = i.alternate;
    h !== null && (h.lanes |= o), Jf(i.return, o, u);
  }
  function Td(i, o, u, h, v) {
    var w = i.memoizedState;
    w === null ? i.memoizedState = { isBackwards: o, rendering: null, renderingStartTime: 0, last: h, tail: u, tailMode: v } : (w.isBackwards = o, w.rendering = null, w.renderingStartTime = 0, w.last = h, w.tail = u, w.tailMode = v);
  }
  function Ov(i, o, u) {
    var h = o.pendingProps, v = h.revealOrder, w = h.tail;
    if (bt(i, o, h.children, u), h = Ue.current, (h & 2) !== 0) h = h & 1 | 2, o.flags |= 128;
    else {
      if (i !== null && (i.flags & 128) !== 0) e: for (i = o.child; i !== null; ) {
        if (i.tag === 13) i.memoizedState !== null && Fv(i, u, o);
        else if (i.tag === 19) Fv(i, u, o);
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
    if (Ne(Ue, h), (o.mode & 1) === 0) o.memoizedState = null;
    else switch (v) {
      case "forwards":
        for (u = o.child, v = null; u !== null; ) i = u.alternate, i !== null && Zl(i) === null && (v = u), u = u.sibling;
        u = v, u === null ? (v = o.child, o.child = null) : (v = u.sibling, u.sibling = null), Td(o, !1, v, u, w);
        break;
      case "backwards":
        for (u = null, v = o.child, o.child = null; v !== null; ) {
          if (i = v.alternate, i !== null && Zl(i) === null) {
            o.child = v;
            break;
          }
          i = v.sibling, v.sibling = u, u = v, v = i;
        }
        Td(o, !0, u, null, w);
        break;
      case "together":
        Td(o, !1, null, null, void 0);
        break;
      default:
        o.memoizedState = null;
    }
    return o.child;
  }
  function ou(i, o) {
    (o.mode & 1) === 0 && i !== null && (i.alternate = null, o.alternate = null, o.flags |= 2);
  }
  function fr(i, o, u) {
    if (i !== null && (o.dependencies = i.dependencies), ki |= o.lanes, (u & o.childLanes) === 0) return null;
    if (i !== null && o.child !== i.child) throw Error(n(153));
    if (o.child !== null) {
      for (i = o.child, u = $r(i, i.pendingProps), o.child = u, u.return = o; i.sibling !== null; ) i = i.sibling, u = u.sibling = $r(i, i.pendingProps), u.return = o;
      u.sibling = null;
    }
    return o.child;
  }
  function KP(i, o, u) {
    switch (o.tag) {
      case 3:
        Rv(o), xs();
        break;
      case 5:
        Qg(o);
        break;
      case 1:
        Lt(o.type) && Ul(o);
        break;
      case 4:
        nd(o, o.stateNode.containerInfo);
        break;
      case 10:
        var h = o.type._context, v = o.memoizedProps.value;
        Ne(Ql, h._currentValue), h._currentValue = v;
        break;
      case 13:
        if (h = o.memoizedState, h !== null)
          return h.dehydrated !== null ? (Ne(Ue, Ue.current & 1), o.flags |= 128, null) : (u & o.child.childLanes) !== 0 ? Dv(i, o, u) : (Ne(Ue, Ue.current & 1), i = fr(i, o, u), i !== null ? i.sibling : null);
        Ne(Ue, Ue.current & 1);
        break;
      case 19:
        if (h = (u & o.childLanes) !== 0, (i.flags & 128) !== 0) {
          if (h) return Ov(i, o, u);
          o.flags |= 128;
        }
        if (v = o.memoizedState, v !== null && (v.rendering = null, v.tail = null, v.lastEffect = null), Ne(Ue, Ue.current), h) break;
        return null;
      case 22:
      case 23:
        return o.lanes = 0, Ev(i, o, u);
    }
    return fr(i, o, u);
  }
  var Iv, Cd, Nv, Lv;
  Iv = function(i, o) {
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
  }, Cd = function() {
  }, Nv = function(i, o, u, h) {
    var v = i.memoizedProps;
    if (v !== h) {
      i = o.stateNode, Ti(Un.current);
      var w = null;
      switch (u) {
        case "input":
          v = Zc(i, v), h = Zc(i, h), w = [];
          break;
        case "select":
          v = Z({}, v, { value: void 0 }), h = Z({}, h, { value: void 0 }), w = [];
          break;
        case "textarea":
          v = tf(i, v), h = tf(i, h), w = [];
          break;
        default:
          typeof v.onClick != "function" && typeof h.onClick == "function" && (i.onclick = Vl);
      }
      rf(u, h);
      var P;
      u = null;
      for (U in v) if (!h.hasOwnProperty(U) && v.hasOwnProperty(U) && v[U] != null) if (U === "style") {
        var R = v[U];
        for (P in R) R.hasOwnProperty(P) && (u || (u = {}), u[P] = "");
      } else U !== "dangerouslySetInnerHTML" && U !== "children" && U !== "suppressContentEditableWarning" && U !== "suppressHydrationWarning" && U !== "autoFocus" && (s.hasOwnProperty(U) ? w || (w = []) : (w = w || []).push(U, null));
      for (U in h) {
        var D = h[U];
        if (R = v != null ? v[U] : void 0, h.hasOwnProperty(U) && D !== R && (D != null || R != null)) if (U === "style") if (R) {
          for (P in R) !R.hasOwnProperty(P) || D && D.hasOwnProperty(P) || (u || (u = {}), u[P] = "");
          for (P in D) D.hasOwnProperty(P) && R[P] !== D[P] && (u || (u = {}), u[P] = D[P]);
        } else u || (w || (w = []), w.push(
          U,
          u
        )), u = D;
        else U === "dangerouslySetInnerHTML" ? (D = D ? D.__html : void 0, R = R ? R.__html : void 0, D != null && R !== D && (w = w || []).push(U, D)) : U === "children" ? typeof D != "string" && typeof D != "number" || (w = w || []).push(U, "" + D) : U !== "suppressContentEditableWarning" && U !== "suppressHydrationWarning" && (s.hasOwnProperty(U) ? (D != null && U === "onScroll" && Le("scroll", i), w || R === D || (w = [])) : (w = w || []).push(U, D));
      }
      u && (w = w || []).push("style", u);
      var U = w;
      (o.updateQueue = U) && (o.flags |= 4);
    }
  }, Lv = function(i, o, u, h) {
    u !== h && (o.flags |= 4);
  };
  function ia(i, o) {
    if (!Be) switch (i.tailMode) {
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
  function Ct(i) {
    var o = i.alternate !== null && i.alternate.child === i.child, u = 0, h = 0;
    if (o) for (var v = i.child; v !== null; ) u |= v.lanes | v.childLanes, h |= v.subtreeFlags & 14680064, h |= v.flags & 14680064, v.return = i, v = v.sibling;
    else for (v = i.child; v !== null; ) u |= v.lanes | v.childLanes, h |= v.subtreeFlags, h |= v.flags, v.return = i, v = v.sibling;
    return i.subtreeFlags |= h, i.childLanes = u, o;
  }
  function QP(i, o, u) {
    var h = o.pendingProps;
    switch (Gf(o), o.tag) {
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
        return Ct(o), null;
      case 1:
        return Lt(o.type) && zl(), Ct(o), null;
      case 3:
        return h = o.stateNode, Ps(), je(Nt), je(xt), sd(), h.pendingContext && (h.context = h.pendingContext, h.pendingContext = null), (i === null || i.child === null) && (Gl(o) ? o.flags |= 4 : i === null || i.memoizedState.isDehydrated && (o.flags & 256) === 0 || (o.flags |= 1024, An !== null && (Id(An), An = null))), Cd(i, o), Ct(o), null;
      case 5:
        rd(o);
        var v = Ti(Jo.current);
        if (u = o.type, i !== null && o.stateNode != null) Nv(i, o, u, h, v), i.ref !== o.ref && (o.flags |= 512, o.flags |= 2097152);
        else {
          if (!h) {
            if (o.stateNode === null) throw Error(n(166));
            return Ct(o), null;
          }
          if (i = Ti(Un.current), Gl(o)) {
            h = o.stateNode, u = o.type;
            var w = o.memoizedProps;
            switch (h[zn] = o, h[Qo] = w, i = (o.mode & 1) !== 0, u) {
              case "dialog":
                Le("cancel", h), Le("close", h);
                break;
              case "iframe":
              case "object":
              case "embed":
                Le("load", h);
                break;
              case "video":
              case "audio":
                for (v = 0; v < Wo.length; v++) Le(Wo[v], h);
                break;
              case "source":
                Le("error", h);
                break;
              case "img":
              case "image":
              case "link":
                Le(
                  "error",
                  h
                ), Le("load", h);
                break;
              case "details":
                Le("toggle", h);
                break;
              case "input":
                gy(h, w), Le("invalid", h);
                break;
              case "select":
                h._wrapperState = { wasMultiple: !!w.multiple }, Le("invalid", h);
                break;
              case "textarea":
                wy(h, w), Le("invalid", h);
            }
            rf(u, w), v = null;
            for (var P in w) if (w.hasOwnProperty(P)) {
              var R = w[P];
              P === "children" ? typeof R == "string" ? h.textContent !== R && (w.suppressHydrationWarning !== !0 && jl(h.textContent, R, i), v = ["children", R]) : typeof R == "number" && h.textContent !== "" + R && (w.suppressHydrationWarning !== !0 && jl(
                h.textContent,
                R,
                i
              ), v = ["children", "" + R]) : s.hasOwnProperty(P) && R != null && P === "onScroll" && Le("scroll", h);
            }
            switch (u) {
              case "input":
                ml(h), _y(h, w, !0);
                break;
              case "textarea":
                ml(h), xy(h);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof w.onClick == "function" && (h.onclick = Vl);
            }
            h = v, o.updateQueue = h, h !== null && (o.flags |= 4);
          } else {
            P = v.nodeType === 9 ? v : v.ownerDocument, i === "http://www.w3.org/1999/xhtml" && (i = Ty(u)), i === "http://www.w3.org/1999/xhtml" ? u === "script" ? (i = P.createElement("div"), i.innerHTML = "<script><\/script>", i = i.removeChild(i.firstChild)) : typeof h.is == "string" ? i = P.createElement(u, { is: h.is }) : (i = P.createElement(u), u === "select" && (P = i, h.multiple ? P.multiple = !0 : h.size && (P.size = h.size))) : i = P.createElementNS(i, u), i[zn] = o, i[Qo] = h, Iv(i, o, !1, !1), o.stateNode = i;
            e: {
              switch (P = sf(u, h), u) {
                case "dialog":
                  Le("cancel", i), Le("close", i), v = h;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Le("load", i), v = h;
                  break;
                case "video":
                case "audio":
                  for (v = 0; v < Wo.length; v++) Le(Wo[v], i);
                  v = h;
                  break;
                case "source":
                  Le("error", i), v = h;
                  break;
                case "img":
                case "image":
                case "link":
                  Le(
                    "error",
                    i
                  ), Le("load", i), v = h;
                  break;
                case "details":
                  Le("toggle", i), v = h;
                  break;
                case "input":
                  gy(i, h), v = Zc(i, h), Le("invalid", i);
                  break;
                case "option":
                  v = h;
                  break;
                case "select":
                  i._wrapperState = { wasMultiple: !!h.multiple }, v = Z({}, h, { value: void 0 }), Le("invalid", i);
                  break;
                case "textarea":
                  wy(i, h), v = tf(i, h), Le("invalid", i);
                  break;
                default:
                  v = h;
              }
              rf(u, v), R = v;
              for (w in R) if (R.hasOwnProperty(w)) {
                var D = R[w];
                w === "style" ? Py(i, D) : w === "dangerouslySetInnerHTML" ? (D = D ? D.__html : void 0, D != null && Cy(i, D)) : w === "children" ? typeof D == "string" ? (u !== "textarea" || D !== "") && Po(i, D) : typeof D == "number" && Po(i, "" + D) : w !== "suppressContentEditableWarning" && w !== "suppressHydrationWarning" && w !== "autoFocus" && (s.hasOwnProperty(w) ? D != null && w === "onScroll" && Le("scroll", i) : D != null && A(i, w, D, P));
              }
              switch (u) {
                case "input":
                  ml(i), _y(i, h, !1);
                  break;
                case "textarea":
                  ml(i), xy(i);
                  break;
                case "option":
                  h.value != null && i.setAttribute("value", "" + be(h.value));
                  break;
                case "select":
                  i.multiple = !!h.multiple, w = h.value, w != null ? as(i, !!h.multiple, w, !1) : h.defaultValue != null && as(
                    i,
                    !!h.multiple,
                    h.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof v.onClick == "function" && (i.onclick = Vl);
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
        return Ct(o), null;
      case 6:
        if (i && o.stateNode != null) Lv(i, o, i.memoizedProps, h);
        else {
          if (typeof h != "string" && o.stateNode === null) throw Error(n(166));
          if (u = Ti(Jo.current), Ti(Un.current), Gl(o)) {
            if (h = o.stateNode, u = o.memoizedProps, h[zn] = o, (w = h.nodeValue !== u) && (i = Jt, i !== null)) switch (i.tag) {
              case 3:
                jl(h.nodeValue, u, (i.mode & 1) !== 0);
                break;
              case 5:
                i.memoizedProps.suppressHydrationWarning !== !0 && jl(h.nodeValue, u, (i.mode & 1) !== 0);
            }
            w && (o.flags |= 4);
          } else h = (u.nodeType === 9 ? u : u.ownerDocument).createTextNode(h), h[zn] = o, o.stateNode = h;
        }
        return Ct(o), null;
      case 13:
        if (je(Ue), h = o.memoizedState, i === null || i.memoizedState !== null && i.memoizedState.dehydrated !== null) {
          if (Be && en !== null && (o.mode & 1) !== 0 && (o.flags & 128) === 0) Bg(), xs(), o.flags |= 98560, w = !1;
          else if (w = Gl(o), h !== null && h.dehydrated !== null) {
            if (i === null) {
              if (!w) throw Error(n(318));
              if (w = o.memoizedState, w = w !== null ? w.dehydrated : null, !w) throw Error(n(317));
              w[zn] = o;
            } else xs(), (o.flags & 128) === 0 && (o.memoizedState = null), o.flags |= 4;
            Ct(o), w = !1;
          } else An !== null && (Id(An), An = null), w = !0;
          if (!w) return o.flags & 65536 ? o : null;
        }
        return (o.flags & 128) !== 0 ? (o.lanes = u, o) : (h = h !== null, h !== (i !== null && i.memoizedState !== null) && h && (o.child.flags |= 8192, (o.mode & 1) !== 0 && (i === null || (Ue.current & 1) !== 0 ? ot === 0 && (ot = 3) : jd())), o.updateQueue !== null && (o.flags |= 4), Ct(o), null);
      case 4:
        return Ps(), Cd(i, o), i === null && Go(o.stateNode.containerInfo), Ct(o), null;
      case 10:
        return Zf(o.type._context), Ct(o), null;
      case 17:
        return Lt(o.type) && zl(), Ct(o), null;
      case 19:
        if (je(Ue), w = o.memoizedState, w === null) return Ct(o), null;
        if (h = (o.flags & 128) !== 0, P = w.rendering, P === null) if (h) ia(w, !1);
        else {
          if (ot !== 0 || i !== null && (i.flags & 128) !== 0) for (i = o.child; i !== null; ) {
            if (P = Zl(i), P !== null) {
              for (o.flags |= 128, ia(w, !1), h = P.updateQueue, h !== null && (o.updateQueue = h, o.flags |= 4), o.subtreeFlags = 0, h = u, u = o.child; u !== null; ) w = u, i = h, w.flags &= 14680066, P = w.alternate, P === null ? (w.childLanes = 0, w.lanes = i, w.child = null, w.subtreeFlags = 0, w.memoizedProps = null, w.memoizedState = null, w.updateQueue = null, w.dependencies = null, w.stateNode = null) : (w.childLanes = P.childLanes, w.lanes = P.lanes, w.child = P.child, w.subtreeFlags = 0, w.deletions = null, w.memoizedProps = P.memoizedProps, w.memoizedState = P.memoizedState, w.updateQueue = P.updateQueue, w.type = P.type, i = P.dependencies, w.dependencies = i === null ? null : { lanes: i.lanes, firstContext: i.firstContext }), u = u.sibling;
              return Ne(Ue, Ue.current & 1 | 2), o.child;
            }
            i = i.sibling;
          }
          w.tail !== null && Ze() > Rs && (o.flags |= 128, h = !0, ia(w, !1), o.lanes = 4194304);
        }
        else {
          if (!h) if (i = Zl(P), i !== null) {
            if (o.flags |= 128, h = !0, u = i.updateQueue, u !== null && (o.updateQueue = u, o.flags |= 4), ia(w, !0), w.tail === null && w.tailMode === "hidden" && !P.alternate && !Be) return Ct(o), null;
          } else 2 * Ze() - w.renderingStartTime > Rs && u !== 1073741824 && (o.flags |= 128, h = !0, ia(w, !1), o.lanes = 4194304);
          w.isBackwards ? (P.sibling = o.child, o.child = P) : (u = w.last, u !== null ? u.sibling = P : o.child = P, w.last = P);
        }
        return w.tail !== null ? (o = w.tail, w.rendering = o, w.tail = o.sibling, w.renderingStartTime = Ze(), o.sibling = null, u = Ue.current, Ne(Ue, h ? u & 1 | 2 : u & 1), o) : (Ct(o), null);
      case 22:
      case 23:
        return Ld(), h = o.memoizedState !== null, i !== null && i.memoizedState !== null !== h && (o.flags |= 8192), h && (o.mode & 1) !== 0 ? (tn & 1073741824) !== 0 && (Ct(o), o.subtreeFlags & 6 && (o.flags |= 8192)) : Ct(o), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(n(156, o.tag));
  }
  function YP(i, o) {
    switch (Gf(o), o.tag) {
      case 1:
        return Lt(o.type) && zl(), i = o.flags, i & 65536 ? (o.flags = i & -65537 | 128, o) : null;
      case 3:
        return Ps(), je(Nt), je(xt), sd(), i = o.flags, (i & 65536) !== 0 && (i & 128) === 0 ? (o.flags = i & -65537 | 128, o) : null;
      case 5:
        return rd(o), null;
      case 13:
        if (je(Ue), i = o.memoizedState, i !== null && i.dehydrated !== null) {
          if (o.alternate === null) throw Error(n(340));
          xs();
        }
        return i = o.flags, i & 65536 ? (o.flags = i & -65537 | 128, o) : null;
      case 19:
        return je(Ue), null;
      case 4:
        return Ps(), null;
      case 10:
        return Zf(o.type._context), null;
      case 22:
      case 23:
        return Ld(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var au = !1, kt = !1, XP = typeof WeakSet == "function" ? WeakSet : Set, se = null;
  function As(i, o) {
    var u = i.ref;
    if (u !== null) if (typeof u == "function") try {
      u(null);
    } catch (h) {
      Ye(i, o, h);
    }
    else u.current = null;
  }
  function kd(i, o, u) {
    try {
      u();
    } catch (h) {
      Ye(i, o, h);
    }
  }
  var jv = !1;
  function qP(i, o) {
    if (Lf = El, i = yg(), bf(i)) {
      if ("selectionStart" in i) var u = { start: i.selectionStart, end: i.selectionEnd };
      else e: {
        u = (u = i.ownerDocument) && u.defaultView || window;
        var h = u.getSelection && u.getSelection();
        if (h && h.rangeCount !== 0) {
          u = h.anchorNode;
          var v = h.anchorOffset, w = h.focusNode;
          h = h.focusOffset;
          try {
            u.nodeType, w.nodeType;
          } catch {
            u = null;
            break e;
          }
          var P = 0, R = -1, D = -1, U = 0, K = 0, Q = i, G = null;
          t: for (; ; ) {
            for (var te; Q !== u || v !== 0 && Q.nodeType !== 3 || (R = P + v), Q !== w || h !== 0 && Q.nodeType !== 3 || (D = P + h), Q.nodeType === 3 && (P += Q.nodeValue.length), (te = Q.firstChild) !== null; )
              G = Q, Q = te;
            for (; ; ) {
              if (Q === i) break t;
              if (G === u && ++U === v && (R = P), G === w && ++K === h && (D = P), (te = Q.nextSibling) !== null) break;
              Q = G, G = Q.parentNode;
            }
            Q = te;
          }
          u = R === -1 || D === -1 ? null : { start: R, end: D };
        } else u = null;
      }
      u = u || { start: 0, end: 0 };
    } else u = null;
    for (jf = { focusedElem: i, selectionRange: u }, El = !1, se = o; se !== null; ) if (o = se, i = o.child, (o.subtreeFlags & 1028) !== 0 && i !== null) i.return = o, se = i;
    else for (; se !== null; ) {
      o = se;
      try {
        var oe = o.alternate;
        if ((o.flags & 1024) !== 0) switch (o.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (oe !== null) {
              var le = oe.memoizedProps, Je = oe.memoizedState, V = o.stateNode, N = V.getSnapshotBeforeUpdate(o.elementType === o.type ? le : bn(o.type, le), Je);
              V.__reactInternalSnapshotBeforeUpdate = N;
            }
            break;
          case 3:
            var z = o.stateNode.containerInfo;
            z.nodeType === 1 ? z.textContent = "" : z.nodeType === 9 && z.documentElement && z.removeChild(z.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(n(163));
        }
      } catch (X) {
        Ye(o, o.return, X);
      }
      if (i = o.sibling, i !== null) {
        i.return = o.return, se = i;
        break;
      }
      se = o.return;
    }
    return oe = jv, jv = !1, oe;
  }
  function sa(i, o, u) {
    var h = o.updateQueue;
    if (h = h !== null ? h.lastEffect : null, h !== null) {
      var v = h = h.next;
      do {
        if ((v.tag & i) === i) {
          var w = v.destroy;
          v.destroy = void 0, w !== void 0 && kd(o, u, w);
        }
        v = v.next;
      } while (v !== h);
    }
  }
  function lu(i, o) {
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
  function Pd(i) {
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
  function Vv(i) {
    var o = i.alternate;
    o !== null && (i.alternate = null, Vv(o)), i.child = null, i.deletions = null, i.sibling = null, i.tag === 5 && (o = i.stateNode, o !== null && (delete o[zn], delete o[Qo], delete o[Uf], delete o[FP], delete o[OP])), i.stateNode = null, i.return = null, i.dependencies = null, i.memoizedProps = null, i.memoizedState = null, i.pendingProps = null, i.stateNode = null, i.updateQueue = null;
  }
  function Bv(i) {
    return i.tag === 5 || i.tag === 3 || i.tag === 4;
  }
  function zv(i) {
    e: for (; ; ) {
      for (; i.sibling === null; ) {
        if (i.return === null || Bv(i.return)) return null;
        i = i.return;
      }
      for (i.sibling.return = i.return, i = i.sibling; i.tag !== 5 && i.tag !== 6 && i.tag !== 18; ) {
        if (i.flags & 2 || i.child === null || i.tag === 4) continue e;
        i.child.return = i, i = i.child;
      }
      if (!(i.flags & 2)) return i.stateNode;
    }
  }
  function Ed(i, o, u) {
    var h = i.tag;
    if (h === 5 || h === 6) i = i.stateNode, o ? u.nodeType === 8 ? u.parentNode.insertBefore(i, o) : u.insertBefore(i, o) : (u.nodeType === 8 ? (o = u.parentNode, o.insertBefore(i, u)) : (o = u, o.appendChild(i)), u = u._reactRootContainer, u != null || o.onclick !== null || (o.onclick = Vl));
    else if (h !== 4 && (i = i.child, i !== null)) for (Ed(i, o, u), i = i.sibling; i !== null; ) Ed(i, o, u), i = i.sibling;
  }
  function Ad(i, o, u) {
    var h = i.tag;
    if (h === 5 || h === 6) i = i.stateNode, o ? u.insertBefore(i, o) : u.appendChild(i);
    else if (h !== 4 && (i = i.child, i !== null)) for (Ad(i, o, u), i = i.sibling; i !== null; ) Ad(i, o, u), i = i.sibling;
  }
  var mt = null, Rn = !1;
  function jr(i, o, u) {
    for (u = u.child; u !== null; ) Uv(i, o, u), u = u.sibling;
  }
  function Uv(i, o, u) {
    if (Bn && typeof Bn.onCommitFiberUnmount == "function") try {
      Bn.onCommitFiberUnmount(Sl, u);
    } catch {
    }
    switch (u.tag) {
      case 5:
        kt || As(u, o);
      case 6:
        var h = mt, v = Rn;
        mt = null, jr(i, o, u), mt = h, Rn = v, mt !== null && (Rn ? (i = mt, u = u.stateNode, i.nodeType === 8 ? i.parentNode.removeChild(u) : i.removeChild(u)) : mt.removeChild(u.stateNode));
        break;
      case 18:
        mt !== null && (Rn ? (i = mt, u = u.stateNode, i.nodeType === 8 ? zf(i.parentNode, u) : i.nodeType === 1 && zf(i, u), Lo(i)) : zf(mt, u.stateNode));
        break;
      case 4:
        h = mt, v = Rn, mt = u.stateNode.containerInfo, Rn = !0, jr(i, o, u), mt = h, Rn = v;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!kt && (h = u.updateQueue, h !== null && (h = h.lastEffect, h !== null))) {
          v = h = h.next;
          do {
            var w = v, P = w.destroy;
            w = w.tag, P !== void 0 && ((w & 2) !== 0 || (w & 4) !== 0) && kd(u, o, P), v = v.next;
          } while (v !== h);
        }
        jr(i, o, u);
        break;
      case 1:
        if (!kt && (As(u, o), h = u.stateNode, typeof h.componentWillUnmount == "function")) try {
          h.props = u.memoizedProps, h.state = u.memoizedState, h.componentWillUnmount();
        } catch (R) {
          Ye(u, o, R);
        }
        jr(i, o, u);
        break;
      case 21:
        jr(i, o, u);
        break;
      case 22:
        u.mode & 1 ? (kt = (h = kt) || u.memoizedState !== null, jr(i, o, u), kt = h) : jr(i, o, u);
        break;
      default:
        jr(i, o, u);
    }
  }
  function $v(i) {
    var o = i.updateQueue;
    if (o !== null) {
      i.updateQueue = null;
      var u = i.stateNode;
      u === null && (u = i.stateNode = new XP()), o.forEach(function(h) {
        var v = oE.bind(null, i, h);
        u.has(h) || (u.add(h), h.then(v, v));
      });
    }
  }
  function Mn(i, o) {
    var u = o.deletions;
    if (u !== null) for (var h = 0; h < u.length; h++) {
      var v = u[h];
      try {
        var w = i, P = o, R = P;
        e: for (; R !== null; ) {
          switch (R.tag) {
            case 5:
              mt = R.stateNode, Rn = !1;
              break e;
            case 3:
              mt = R.stateNode.containerInfo, Rn = !0;
              break e;
            case 4:
              mt = R.stateNode.containerInfo, Rn = !0;
              break e;
          }
          R = R.return;
        }
        if (mt === null) throw Error(n(160));
        Uv(w, P, v), mt = null, Rn = !1;
        var D = v.alternate;
        D !== null && (D.return = null), v.return = null;
      } catch (U) {
        Ye(v, o, U);
      }
    }
    if (o.subtreeFlags & 12854) for (o = o.child; o !== null; ) Hv(o, i), o = o.sibling;
  }
  function Hv(i, o) {
    var u = i.alternate, h = i.flags;
    switch (i.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Mn(o, i), Hn(i), h & 4) {
          try {
            sa(3, i, i.return), lu(3, i);
          } catch (le) {
            Ye(i, i.return, le);
          }
          try {
            sa(5, i, i.return);
          } catch (le) {
            Ye(i, i.return, le);
          }
        }
        break;
      case 1:
        Mn(o, i), Hn(i), h & 512 && u !== null && As(u, u.return);
        break;
      case 5:
        if (Mn(o, i), Hn(i), h & 512 && u !== null && As(u, u.return), i.flags & 32) {
          var v = i.stateNode;
          try {
            Po(v, "");
          } catch (le) {
            Ye(i, i.return, le);
          }
        }
        if (h & 4 && (v = i.stateNode, v != null)) {
          var w = i.memoizedProps, P = u !== null ? u.memoizedProps : w, R = i.type, D = i.updateQueue;
          if (i.updateQueue = null, D !== null) try {
            R === "input" && w.type === "radio" && w.name != null && vy(v, w), sf(R, P);
            var U = sf(R, w);
            for (P = 0; P < D.length; P += 2) {
              var K = D[P], Q = D[P + 1];
              K === "style" ? Py(v, Q) : K === "dangerouslySetInnerHTML" ? Cy(v, Q) : K === "children" ? Po(v, Q) : A(v, K, Q, U);
            }
            switch (R) {
              case "input":
                Jc(v, w);
                break;
              case "textarea":
                Sy(v, w);
                break;
              case "select":
                var G = v._wrapperState.wasMultiple;
                v._wrapperState.wasMultiple = !!w.multiple;
                var te = w.value;
                te != null ? as(v, !!w.multiple, te, !1) : G !== !!w.multiple && (w.defaultValue != null ? as(
                  v,
                  !!w.multiple,
                  w.defaultValue,
                  !0
                ) : as(v, !!w.multiple, w.multiple ? [] : "", !1));
            }
            v[Qo] = w;
          } catch (le) {
            Ye(i, i.return, le);
          }
        }
        break;
      case 6:
        if (Mn(o, i), Hn(i), h & 4) {
          if (i.stateNode === null) throw Error(n(162));
          v = i.stateNode, w = i.memoizedProps;
          try {
            v.nodeValue = w;
          } catch (le) {
            Ye(i, i.return, le);
          }
        }
        break;
      case 3:
        if (Mn(o, i), Hn(i), h & 4 && u !== null && u.memoizedState.isDehydrated) try {
          Lo(o.containerInfo);
        } catch (le) {
          Ye(i, i.return, le);
        }
        break;
      case 4:
        Mn(o, i), Hn(i);
        break;
      case 13:
        Mn(o, i), Hn(i), v = i.child, v.flags & 8192 && (w = v.memoizedState !== null, v.stateNode.isHidden = w, !w || v.alternate !== null && v.alternate.memoizedState !== null || (Md = Ze())), h & 4 && $v(i);
        break;
      case 22:
        if (K = u !== null && u.memoizedState !== null, i.mode & 1 ? (kt = (U = kt) || K, Mn(o, i), kt = U) : Mn(o, i), Hn(i), h & 8192) {
          if (U = i.memoizedState !== null, (i.stateNode.isHidden = U) && !K && (i.mode & 1) !== 0) for (se = i, K = i.child; K !== null; ) {
            for (Q = se = K; se !== null; ) {
              switch (G = se, te = G.child, G.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  sa(4, G, G.return);
                  break;
                case 1:
                  As(G, G.return);
                  var oe = G.stateNode;
                  if (typeof oe.componentWillUnmount == "function") {
                    h = G, u = G.return;
                    try {
                      o = h, oe.props = o.memoizedProps, oe.state = o.memoizedState, oe.componentWillUnmount();
                    } catch (le) {
                      Ye(h, u, le);
                    }
                  }
                  break;
                case 5:
                  As(G, G.return);
                  break;
                case 22:
                  if (G.memoizedState !== null) {
                    Kv(Q);
                    continue;
                  }
              }
              te !== null ? (te.return = G, se = te) : Kv(Q);
            }
            K = K.sibling;
          }
          e: for (K = null, Q = i; ; ) {
            if (Q.tag === 5) {
              if (K === null) {
                K = Q;
                try {
                  v = Q.stateNode, U ? (w = v.style, typeof w.setProperty == "function" ? w.setProperty("display", "none", "important") : w.display = "none") : (R = Q.stateNode, D = Q.memoizedProps.style, P = D != null && D.hasOwnProperty("display") ? D.display : null, R.style.display = ky("display", P));
                } catch (le) {
                  Ye(i, i.return, le);
                }
              }
            } else if (Q.tag === 6) {
              if (K === null) try {
                Q.stateNode.nodeValue = U ? "" : Q.memoizedProps;
              } catch (le) {
                Ye(i, i.return, le);
              }
            } else if ((Q.tag !== 22 && Q.tag !== 23 || Q.memoizedState === null || Q === i) && Q.child !== null) {
              Q.child.return = Q, Q = Q.child;
              continue;
            }
            if (Q === i) break e;
            for (; Q.sibling === null; ) {
              if (Q.return === null || Q.return === i) break e;
              K === Q && (K = null), Q = Q.return;
            }
            K === Q && (K = null), Q.sibling.return = Q.return, Q = Q.sibling;
          }
        }
        break;
      case 19:
        Mn(o, i), Hn(i), h & 4 && $v(i);
        break;
      case 21:
        break;
      default:
        Mn(
          o,
          i
        ), Hn(i);
    }
  }
  function Hn(i) {
    var o = i.flags;
    if (o & 2) {
      try {
        e: {
          for (var u = i.return; u !== null; ) {
            if (Bv(u)) {
              var h = u;
              break e;
            }
            u = u.return;
          }
          throw Error(n(160));
        }
        switch (h.tag) {
          case 5:
            var v = h.stateNode;
            h.flags & 32 && (Po(v, ""), h.flags &= -33);
            var w = zv(i);
            Ad(i, w, v);
            break;
          case 3:
          case 4:
            var P = h.stateNode.containerInfo, R = zv(i);
            Ed(i, R, P);
            break;
          default:
            throw Error(n(161));
        }
      } catch (D) {
        Ye(i, i.return, D);
      }
      i.flags &= -3;
    }
    o & 4096 && (i.flags &= -4097);
  }
  function ZP(i, o, u) {
    se = i, Wv(i);
  }
  function Wv(i, o, u) {
    for (var h = (i.mode & 1) !== 0; se !== null; ) {
      var v = se, w = v.child;
      if (v.tag === 22 && h) {
        var P = v.memoizedState !== null || au;
        if (!P) {
          var R = v.alternate, D = R !== null && R.memoizedState !== null || kt;
          R = au;
          var U = kt;
          if (au = P, (kt = D) && !U) for (se = v; se !== null; ) P = se, D = P.child, P.tag === 22 && P.memoizedState !== null ? Qv(v) : D !== null ? (D.return = P, se = D) : Qv(v);
          for (; w !== null; ) se = w, Wv(w), w = w.sibling;
          se = v, au = R, kt = U;
        }
        Gv(i);
      } else (v.subtreeFlags & 8772) !== 0 && w !== null ? (w.return = v, se = w) : Gv(i);
    }
  }
  function Gv(i) {
    for (; se !== null; ) {
      var o = se;
      if ((o.flags & 8772) !== 0) {
        var u = o.alternate;
        try {
          if ((o.flags & 8772) !== 0) switch (o.tag) {
            case 0:
            case 11:
            case 15:
              kt || lu(5, o);
              break;
            case 1:
              var h = o.stateNode;
              if (o.flags & 4 && !kt) if (u === null) h.componentDidMount();
              else {
                var v = o.elementType === o.type ? u.memoizedProps : bn(o.type, u.memoizedProps);
                h.componentDidUpdate(v, u.memoizedState, h.__reactInternalSnapshotBeforeUpdate);
              }
              var w = o.updateQueue;
              w !== null && Kg(o, w, h);
              break;
            case 3:
              var P = o.updateQueue;
              if (P !== null) {
                if (u = null, o.child !== null) switch (o.child.tag) {
                  case 5:
                    u = o.child.stateNode;
                    break;
                  case 1:
                    u = o.child.stateNode;
                }
                Kg(o, P, u);
              }
              break;
            case 5:
              var R = o.stateNode;
              if (u === null && o.flags & 4) {
                u = R;
                var D = o.memoizedProps;
                switch (o.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    D.autoFocus && u.focus();
                    break;
                  case "img":
                    D.src && (u.src = D.src);
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
                var U = o.alternate;
                if (U !== null) {
                  var K = U.memoizedState;
                  if (K !== null) {
                    var Q = K.dehydrated;
                    Q !== null && Lo(Q);
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
          kt || o.flags & 512 && Pd(o);
        } catch (G) {
          Ye(o, o.return, G);
        }
      }
      if (o === i) {
        se = null;
        break;
      }
      if (u = o.sibling, u !== null) {
        u.return = o.return, se = u;
        break;
      }
      se = o.return;
    }
  }
  function Kv(i) {
    for (; se !== null; ) {
      var o = se;
      if (o === i) {
        se = null;
        break;
      }
      var u = o.sibling;
      if (u !== null) {
        u.return = o.return, se = u;
        break;
      }
      se = o.return;
    }
  }
  function Qv(i) {
    for (; se !== null; ) {
      var o = se;
      try {
        switch (o.tag) {
          case 0:
          case 11:
          case 15:
            var u = o.return;
            try {
              lu(4, o);
            } catch (D) {
              Ye(o, u, D);
            }
            break;
          case 1:
            var h = o.stateNode;
            if (typeof h.componentDidMount == "function") {
              var v = o.return;
              try {
                h.componentDidMount();
              } catch (D) {
                Ye(o, v, D);
              }
            }
            var w = o.return;
            try {
              Pd(o);
            } catch (D) {
              Ye(o, w, D);
            }
            break;
          case 5:
            var P = o.return;
            try {
              Pd(o);
            } catch (D) {
              Ye(o, P, D);
            }
        }
      } catch (D) {
        Ye(o, o.return, D);
      }
      if (o === i) {
        se = null;
        break;
      }
      var R = o.sibling;
      if (R !== null) {
        R.return = o.return, se = R;
        break;
      }
      se = o.return;
    }
  }
  var JP = Math.ceil, uu = b.ReactCurrentDispatcher, bd = b.ReactCurrentOwner, yn = b.ReactCurrentBatchConfig, ke = 0, ct = null, tt = null, yt = 0, tn = 0, bs = Fr(0), ot = 0, oa = null, ki = 0, cu = 0, Rd = 0, aa = null, Vt = null, Md = 0, Rs = 1 / 0, dr = null, fu = !1, Dd = null, Vr = null, du = !1, Br = null, hu = 0, la = 0, Fd = null, pu = -1, mu = 0;
  function Rt() {
    return (ke & 6) !== 0 ? Ze() : pu !== -1 ? pu : pu = Ze();
  }
  function zr(i) {
    return (i.mode & 1) === 0 ? 1 : (ke & 2) !== 0 && yt !== 0 ? yt & -yt : NP.transition !== null ? (mu === 0 && (mu = zy()), mu) : (i = Re, i !== 0 || (i = window.event, i = i === void 0 ? 16 : Xy(i.type)), i);
  }
  function Dn(i, o, u, h) {
    if (50 < la) throw la = 0, Fd = null, Error(n(185));
    Do(i, u, h), ((ke & 2) === 0 || i !== ct) && (i === ct && ((ke & 2) === 0 && (cu |= u), ot === 4 && Ur(i, yt)), Bt(i, h), u === 1 && ke === 0 && (o.mode & 1) === 0 && (Rs = Ze() + 500, $l && Ir()));
  }
  function Bt(i, o) {
    var u = i.callbackNode;
    Nk(i, o);
    var h = Cl(i, i === ct ? yt : 0);
    if (h === 0) u !== null && jy(u), i.callbackNode = null, i.callbackPriority = 0;
    else if (o = h & -h, i.callbackPriority !== o) {
      if (u != null && jy(u), o === 1) i.tag === 0 ? IP(Xv.bind(null, i)) : Ig(Xv.bind(null, i)), MP(function() {
        (ke & 6) === 0 && Ir();
      }), u = null;
      else {
        switch (Uy(h)) {
          case 1:
            u = df;
            break;
          case 4:
            u = Vy;
            break;
          case 16:
            u = wl;
            break;
          case 536870912:
            u = By;
            break;
          default:
            u = wl;
        }
        u = i0(u, Yv.bind(null, i));
      }
      i.callbackPriority = o, i.callbackNode = u;
    }
  }
  function Yv(i, o) {
    if (pu = -1, mu = 0, (ke & 6) !== 0) throw Error(n(327));
    var u = i.callbackNode;
    if (Ms() && i.callbackNode !== u) return null;
    var h = Cl(i, i === ct ? yt : 0);
    if (h === 0) return null;
    if ((h & 30) !== 0 || (h & i.expiredLanes) !== 0 || o) o = yu(i, h);
    else {
      o = h;
      var v = ke;
      ke |= 2;
      var w = Zv();
      (ct !== i || yt !== o) && (dr = null, Rs = Ze() + 500, Ei(i, o));
      do
        try {
          nE();
          break;
        } catch (R) {
          qv(i, R);
        }
      while (!0);
      qf(), uu.current = w, ke = v, tt !== null ? o = 0 : (ct = null, yt = 0, o = ot);
    }
    if (o !== 0) {
      if (o === 2 && (v = hf(i), v !== 0 && (h = v, o = Od(i, v))), o === 1) throw u = oa, Ei(i, 0), Ur(i, h), Bt(i, Ze()), u;
      if (o === 6) Ur(i, h);
      else {
        if (v = i.current.alternate, (h & 30) === 0 && !eE(v) && (o = yu(i, h), o === 2 && (w = hf(i), w !== 0 && (h = w, o = Od(i, w))), o === 1)) throw u = oa, Ei(i, 0), Ur(i, h), Bt(i, Ze()), u;
        switch (i.finishedWork = v, i.finishedLanes = h, o) {
          case 0:
          case 1:
            throw Error(n(345));
          case 2:
            Ai(i, Vt, dr);
            break;
          case 3:
            if (Ur(i, h), (h & 130023424) === h && (o = Md + 500 - Ze(), 10 < o)) {
              if (Cl(i, 0) !== 0) break;
              if (v = i.suspendedLanes, (v & h) !== h) {
                Rt(), i.pingedLanes |= i.suspendedLanes & v;
                break;
              }
              i.timeoutHandle = Bf(Ai.bind(null, i, Vt, dr), o);
              break;
            }
            Ai(i, Vt, dr);
            break;
          case 4:
            if (Ur(i, h), (h & 4194240) === h) break;
            for (o = i.eventTimes, v = -1; 0 < h; ) {
              var P = 31 - Pn(h);
              w = 1 << P, P = o[P], P > v && (v = P), h &= ~w;
            }
            if (h = v, h = Ze() - h, h = (120 > h ? 120 : 480 > h ? 480 : 1080 > h ? 1080 : 1920 > h ? 1920 : 3e3 > h ? 3e3 : 4320 > h ? 4320 : 1960 * JP(h / 1960)) - h, 10 < h) {
              i.timeoutHandle = Bf(Ai.bind(null, i, Vt, dr), h);
              break;
            }
            Ai(i, Vt, dr);
            break;
          case 5:
            Ai(i, Vt, dr);
            break;
          default:
            throw Error(n(329));
        }
      }
    }
    return Bt(i, Ze()), i.callbackNode === u ? Yv.bind(null, i) : null;
  }
  function Od(i, o) {
    var u = aa;
    return i.current.memoizedState.isDehydrated && (Ei(i, o).flags |= 256), i = yu(i, o), i !== 2 && (o = Vt, Vt = u, o !== null && Id(o)), i;
  }
  function Id(i) {
    Vt === null ? Vt = i : Vt.push.apply(Vt, i);
  }
  function eE(i) {
    for (var o = i; ; ) {
      if (o.flags & 16384) {
        var u = o.updateQueue;
        if (u !== null && (u = u.stores, u !== null)) for (var h = 0; h < u.length; h++) {
          var v = u[h], w = v.getSnapshot;
          v = v.value;
          try {
            if (!En(w(), v)) return !1;
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
  function Ur(i, o) {
    for (o &= ~Rd, o &= ~cu, i.suspendedLanes |= o, i.pingedLanes &= ~o, i = i.expirationTimes; 0 < o; ) {
      var u = 31 - Pn(o), h = 1 << u;
      i[u] = -1, o &= ~h;
    }
  }
  function Xv(i) {
    if ((ke & 6) !== 0) throw Error(n(327));
    Ms();
    var o = Cl(i, 0);
    if ((o & 1) === 0) return Bt(i, Ze()), null;
    var u = yu(i, o);
    if (i.tag !== 0 && u === 2) {
      var h = hf(i);
      h !== 0 && (o = h, u = Od(i, h));
    }
    if (u === 1) throw u = oa, Ei(i, 0), Ur(i, o), Bt(i, Ze()), u;
    if (u === 6) throw Error(n(345));
    return i.finishedWork = i.current.alternate, i.finishedLanes = o, Ai(i, Vt, dr), Bt(i, Ze()), null;
  }
  function Nd(i, o) {
    var u = ke;
    ke |= 1;
    try {
      return i(o);
    } finally {
      ke = u, ke === 0 && (Rs = Ze() + 500, $l && Ir());
    }
  }
  function Pi(i) {
    Br !== null && Br.tag === 0 && (ke & 6) === 0 && Ms();
    var o = ke;
    ke |= 1;
    var u = yn.transition, h = Re;
    try {
      if (yn.transition = null, Re = 1, i) return i();
    } finally {
      Re = h, yn.transition = u, ke = o, (ke & 6) === 0 && Ir();
    }
  }
  function Ld() {
    tn = bs.current, je(bs);
  }
  function Ei(i, o) {
    i.finishedWork = null, i.finishedLanes = 0;
    var u = i.timeoutHandle;
    if (u !== -1 && (i.timeoutHandle = -1, RP(u)), tt !== null) for (u = tt.return; u !== null; ) {
      var h = u;
      switch (Gf(h), h.tag) {
        case 1:
          h = h.type.childContextTypes, h != null && zl();
          break;
        case 3:
          Ps(), je(Nt), je(xt), sd();
          break;
        case 5:
          rd(h);
          break;
        case 4:
          Ps();
          break;
        case 13:
          je(Ue);
          break;
        case 19:
          je(Ue);
          break;
        case 10:
          Zf(h.type._context);
          break;
        case 22:
        case 23:
          Ld();
      }
      u = u.return;
    }
    if (ct = i, tt = i = $r(i.current, null), yt = tn = o, ot = 0, oa = null, Rd = cu = ki = 0, Vt = aa = null, xi !== null) {
      for (o = 0; o < xi.length; o++) if (u = xi[o], h = u.interleaved, h !== null) {
        u.interleaved = null;
        var v = h.next, w = u.pending;
        if (w !== null) {
          var P = w.next;
          w.next = v, h.next = P;
        }
        u.pending = h;
      }
      xi = null;
    }
    return i;
  }
  function qv(i, o) {
    do {
      var u = tt;
      try {
        if (qf(), Jl.current = ru, eu) {
          for (var h = $e.memoizedState; h !== null; ) {
            var v = h.queue;
            v !== null && (v.pending = null), h = h.next;
          }
          eu = !1;
        }
        if (Ci = 0, ut = st = $e = null, ea = !1, ta = 0, bd.current = null, u === null || u.return === null) {
          ot = 1, oa = o, tt = null;
          break;
        }
        e: {
          var w = i, P = u.return, R = u, D = o;
          if (o = yt, R.flags |= 32768, D !== null && typeof D == "object" && typeof D.then == "function") {
            var U = D, K = R, Q = K.tag;
            if ((K.mode & 1) === 0 && (Q === 0 || Q === 11 || Q === 15)) {
              var G = K.alternate;
              G ? (K.updateQueue = G.updateQueue, K.memoizedState = G.memoizedState, K.lanes = G.lanes) : (K.updateQueue = null, K.memoizedState = null);
            }
            var te = xv(P);
            if (te !== null) {
              te.flags &= -257, Tv(te, P, R, w, o), te.mode & 1 && Sv(w, U, o), o = te, D = U;
              var oe = o.updateQueue;
              if (oe === null) {
                var le = /* @__PURE__ */ new Set();
                le.add(D), o.updateQueue = le;
              } else oe.add(D);
              break e;
            } else {
              if ((o & 1) === 0) {
                Sv(w, U, o), jd();
                break e;
              }
              D = Error(n(426));
            }
          } else if (Be && R.mode & 1) {
            var Je = xv(P);
            if (Je !== null) {
              (Je.flags & 65536) === 0 && (Je.flags |= 256), Tv(Je, P, R, w, o), Yf(Es(D, R));
              break e;
            }
          }
          w = D = Es(D, R), ot !== 4 && (ot = 2), aa === null ? aa = [w] : aa.push(w), w = P;
          do {
            switch (w.tag) {
              case 3:
                w.flags |= 65536, o &= -o, w.lanes |= o;
                var V = _v(w, D, o);
                Gg(w, V);
                break e;
              case 1:
                R = D;
                var N = w.type, z = w.stateNode;
                if ((w.flags & 128) === 0 && (typeof N.getDerivedStateFromError == "function" || z !== null && typeof z.componentDidCatch == "function" && (Vr === null || !Vr.has(z)))) {
                  w.flags |= 65536, o &= -o, w.lanes |= o;
                  var X = wv(w, R, o);
                  Gg(w, X);
                  break e;
                }
            }
            w = w.return;
          } while (w !== null);
        }
        e0(u);
      } catch (ce) {
        o = ce, tt === u && u !== null && (tt = u = u.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Zv() {
    var i = uu.current;
    return uu.current = ru, i === null ? ru : i;
  }
  function jd() {
    (ot === 0 || ot === 3 || ot === 2) && (ot = 4), ct === null || (ki & 268435455) === 0 && (cu & 268435455) === 0 || Ur(ct, yt);
  }
  function yu(i, o) {
    var u = ke;
    ke |= 2;
    var h = Zv();
    (ct !== i || yt !== o) && (dr = null, Ei(i, o));
    do
      try {
        tE();
        break;
      } catch (v) {
        qv(i, v);
      }
    while (!0);
    if (qf(), ke = u, uu.current = h, tt !== null) throw Error(n(261));
    return ct = null, yt = 0, ot;
  }
  function tE() {
    for (; tt !== null; ) Jv(tt);
  }
  function nE() {
    for (; tt !== null && !Ek(); ) Jv(tt);
  }
  function Jv(i) {
    var o = r0(i.alternate, i, tn);
    i.memoizedProps = i.pendingProps, o === null ? e0(i) : tt = o, bd.current = null;
  }
  function e0(i) {
    var o = i;
    do {
      var u = o.alternate;
      if (i = o.return, (o.flags & 32768) === 0) {
        if (u = QP(u, o, tn), u !== null) {
          tt = u;
          return;
        }
      } else {
        if (u = YP(u, o), u !== null) {
          u.flags &= 32767, tt = u;
          return;
        }
        if (i !== null) i.flags |= 32768, i.subtreeFlags = 0, i.deletions = null;
        else {
          ot = 6, tt = null;
          return;
        }
      }
      if (o = o.sibling, o !== null) {
        tt = o;
        return;
      }
      tt = o = i;
    } while (o !== null);
    ot === 0 && (ot = 5);
  }
  function Ai(i, o, u) {
    var h = Re, v = yn.transition;
    try {
      yn.transition = null, Re = 1, rE(i, o, u, h);
    } finally {
      yn.transition = v, Re = h;
    }
    return null;
  }
  function rE(i, o, u, h) {
    do
      Ms();
    while (Br !== null);
    if ((ke & 6) !== 0) throw Error(n(327));
    u = i.finishedWork;
    var v = i.finishedLanes;
    if (u === null) return null;
    if (i.finishedWork = null, i.finishedLanes = 0, u === i.current) throw Error(n(177));
    i.callbackNode = null, i.callbackPriority = 0;
    var w = u.lanes | u.childLanes;
    if (Lk(i, w), i === ct && (tt = ct = null, yt = 0), (u.subtreeFlags & 2064) === 0 && (u.flags & 2064) === 0 || du || (du = !0, i0(wl, function() {
      return Ms(), null;
    })), w = (u.flags & 15990) !== 0, (u.subtreeFlags & 15990) !== 0 || w) {
      w = yn.transition, yn.transition = null;
      var P = Re;
      Re = 1;
      var R = ke;
      ke |= 4, bd.current = null, qP(i, u), Hv(u, i), TP(jf), El = !!Lf, jf = Lf = null, i.current = u, ZP(u), Ak(), ke = R, Re = P, yn.transition = w;
    } else i.current = u;
    if (du && (du = !1, Br = i, hu = v), w = i.pendingLanes, w === 0 && (Vr = null), Mk(u.stateNode), Bt(i, Ze()), o !== null) for (h = i.onRecoverableError, u = 0; u < o.length; u++) v = o[u], h(v.value, { componentStack: v.stack, digest: v.digest });
    if (fu) throw fu = !1, i = Dd, Dd = null, i;
    return (hu & 1) !== 0 && i.tag !== 0 && Ms(), w = i.pendingLanes, (w & 1) !== 0 ? i === Fd ? la++ : (la = 0, Fd = i) : la = 0, Ir(), null;
  }
  function Ms() {
    if (Br !== null) {
      var i = Uy(hu), o = yn.transition, u = Re;
      try {
        if (yn.transition = null, Re = 16 > i ? 16 : i, Br === null) var h = !1;
        else {
          if (i = Br, Br = null, hu = 0, (ke & 6) !== 0) throw Error(n(331));
          var v = ke;
          for (ke |= 4, se = i.current; se !== null; ) {
            var w = se, P = w.child;
            if ((se.flags & 16) !== 0) {
              var R = w.deletions;
              if (R !== null) {
                for (var D = 0; D < R.length; D++) {
                  var U = R[D];
                  for (se = U; se !== null; ) {
                    var K = se;
                    switch (K.tag) {
                      case 0:
                      case 11:
                      case 15:
                        sa(8, K, w);
                    }
                    var Q = K.child;
                    if (Q !== null) Q.return = K, se = Q;
                    else for (; se !== null; ) {
                      K = se;
                      var G = K.sibling, te = K.return;
                      if (Vv(K), K === U) {
                        se = null;
                        break;
                      }
                      if (G !== null) {
                        G.return = te, se = G;
                        break;
                      }
                      se = te;
                    }
                  }
                }
                var oe = w.alternate;
                if (oe !== null) {
                  var le = oe.child;
                  if (le !== null) {
                    oe.child = null;
                    do {
                      var Je = le.sibling;
                      le.sibling = null, le = Je;
                    } while (le !== null);
                  }
                }
                se = w;
              }
            }
            if ((w.subtreeFlags & 2064) !== 0 && P !== null) P.return = w, se = P;
            else e: for (; se !== null; ) {
              if (w = se, (w.flags & 2048) !== 0) switch (w.tag) {
                case 0:
                case 11:
                case 15:
                  sa(9, w, w.return);
              }
              var V = w.sibling;
              if (V !== null) {
                V.return = w.return, se = V;
                break e;
              }
              se = w.return;
            }
          }
          var N = i.current;
          for (se = N; se !== null; ) {
            P = se;
            var z = P.child;
            if ((P.subtreeFlags & 2064) !== 0 && z !== null) z.return = P, se = z;
            else e: for (P = N; se !== null; ) {
              if (R = se, (R.flags & 2048) !== 0) try {
                switch (R.tag) {
                  case 0:
                  case 11:
                  case 15:
                    lu(9, R);
                }
              } catch (ce) {
                Ye(R, R.return, ce);
              }
              if (R === P) {
                se = null;
                break e;
              }
              var X = R.sibling;
              if (X !== null) {
                X.return = R.return, se = X;
                break e;
              }
              se = R.return;
            }
          }
          if (ke = v, Ir(), Bn && typeof Bn.onPostCommitFiberRoot == "function") try {
            Bn.onPostCommitFiberRoot(Sl, i);
          } catch {
          }
          h = !0;
        }
        return h;
      } finally {
        Re = u, yn.transition = o;
      }
    }
    return !1;
  }
  function t0(i, o, u) {
    o = Es(u, o), o = _v(i, o, 1), i = Lr(i, o, 1), o = Rt(), i !== null && (Do(i, 1, o), Bt(i, o));
  }
  function Ye(i, o, u) {
    if (i.tag === 3) t0(i, i, u);
    else for (; o !== null; ) {
      if (o.tag === 3) {
        t0(o, i, u);
        break;
      } else if (o.tag === 1) {
        var h = o.stateNode;
        if (typeof o.type.getDerivedStateFromError == "function" || typeof h.componentDidCatch == "function" && (Vr === null || !Vr.has(h))) {
          i = Es(u, i), i = wv(o, i, 1), o = Lr(o, i, 1), i = Rt(), o !== null && (Do(o, 1, i), Bt(o, i));
          break;
        }
      }
      o = o.return;
    }
  }
  function iE(i, o, u) {
    var h = i.pingCache;
    h !== null && h.delete(o), o = Rt(), i.pingedLanes |= i.suspendedLanes & u, ct === i && (yt & u) === u && (ot === 4 || ot === 3 && (yt & 130023424) === yt && 500 > Ze() - Md ? Ei(i, 0) : Rd |= u), Bt(i, o);
  }
  function n0(i, o) {
    o === 0 && ((i.mode & 1) === 0 ? o = 1 : (o = Tl, Tl <<= 1, (Tl & 130023424) === 0 && (Tl = 4194304)));
    var u = Rt();
    i = ur(i, o), i !== null && (Do(i, o, u), Bt(i, u));
  }
  function sE(i) {
    var o = i.memoizedState, u = 0;
    o !== null && (u = o.retryLane), n0(i, u);
  }
  function oE(i, o) {
    var u = 0;
    switch (i.tag) {
      case 13:
        var h = i.stateNode, v = i.memoizedState;
        v !== null && (u = v.retryLane);
        break;
      case 19:
        h = i.stateNode;
        break;
      default:
        throw Error(n(314));
    }
    h !== null && h.delete(o), n0(i, u);
  }
  var r0;
  r0 = function(i, o, u) {
    if (i !== null) if (i.memoizedProps !== o.pendingProps || Nt.current) jt = !0;
    else {
      if ((i.lanes & u) === 0 && (o.flags & 128) === 0) return jt = !1, KP(i, o, u);
      jt = (i.flags & 131072) !== 0;
    }
    else jt = !1, Be && (o.flags & 1048576) !== 0 && Ng(o, Wl, o.index);
    switch (o.lanes = 0, o.tag) {
      case 2:
        var h = o.type;
        ou(i, o), i = o.pendingProps;
        var v = _s(o, xt.current);
        ks(o, u), v = ld(null, o, h, i, v, u);
        var w = ud();
        return o.flags |= 1, typeof v == "object" && v !== null && typeof v.render == "function" && v.$$typeof === void 0 ? (o.tag = 1, o.memoizedState = null, o.updateQueue = null, Lt(h) ? (w = !0, Ul(o)) : w = !1, o.memoizedState = v.state !== null && v.state !== void 0 ? v.state : null, td(o), v.updater = iu, o.stateNode = v, v._reactInternals = o, md(o, h, i, u), o = _d(null, o, h, !0, w, u)) : (o.tag = 0, Be && w && Wf(o), bt(null, o, v, u), o = o.child), o;
      case 16:
        h = o.elementType;
        e: {
          switch (ou(i, o), i = o.pendingProps, v = h._init, h = v(h._payload), o.type = h, v = o.tag = lE(h), i = bn(h, i), v) {
            case 0:
              o = vd(null, o, h, i, u);
              break e;
            case 1:
              o = bv(null, o, h, i, u);
              break e;
            case 11:
              o = Cv(null, o, h, i, u);
              break e;
            case 14:
              o = kv(null, o, h, bn(h.type, i), u);
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
        return h = o.type, v = o.pendingProps, v = o.elementType === h ? v : bn(h, v), vd(i, o, h, v, u);
      case 1:
        return h = o.type, v = o.pendingProps, v = o.elementType === h ? v : bn(h, v), bv(i, o, h, v, u);
      case 3:
        e: {
          if (Rv(o), i === null) throw Error(n(387));
          h = o.pendingProps, w = o.memoizedState, v = w.element, Wg(i, o), ql(o, h, null, u);
          var P = o.memoizedState;
          if (h = P.element, w.isDehydrated) if (w = { element: h, isDehydrated: !1, cache: P.cache, pendingSuspenseBoundaries: P.pendingSuspenseBoundaries, transitions: P.transitions }, o.updateQueue.baseState = w, o.memoizedState = w, o.flags & 256) {
            v = Es(Error(n(423)), o), o = Mv(i, o, h, u, v);
            break e;
          } else if (h !== v) {
            v = Es(Error(n(424)), o), o = Mv(i, o, h, u, v);
            break e;
          } else for (en = Dr(o.stateNode.containerInfo.firstChild), Jt = o, Be = !0, An = null, u = $g(o, null, h, u), o.child = u; u; ) u.flags = u.flags & -3 | 4096, u = u.sibling;
          else {
            if (xs(), h === v) {
              o = fr(i, o, u);
              break e;
            }
            bt(i, o, h, u);
          }
          o = o.child;
        }
        return o;
      case 5:
        return Qg(o), i === null && Qf(o), h = o.type, v = o.pendingProps, w = i !== null ? i.memoizedProps : null, P = v.children, Vf(h, v) ? P = null : w !== null && Vf(h, w) && (o.flags |= 32), Av(i, o), bt(i, o, P, u), o.child;
      case 6:
        return i === null && Qf(o), null;
      case 13:
        return Dv(i, o, u);
      case 4:
        return nd(o, o.stateNode.containerInfo), h = o.pendingProps, i === null ? o.child = Ts(o, null, h, u) : bt(i, o, h, u), o.child;
      case 11:
        return h = o.type, v = o.pendingProps, v = o.elementType === h ? v : bn(h, v), Cv(i, o, h, v, u);
      case 7:
        return bt(i, o, o.pendingProps, u), o.child;
      case 8:
        return bt(i, o, o.pendingProps.children, u), o.child;
      case 12:
        return bt(i, o, o.pendingProps.children, u), o.child;
      case 10:
        e: {
          if (h = o.type._context, v = o.pendingProps, w = o.memoizedProps, P = v.value, Ne(Ql, h._currentValue), h._currentValue = P, w !== null) if (En(w.value, P)) {
            if (w.children === v.children && !Nt.current) {
              o = fr(i, o, u);
              break e;
            }
          } else for (w = o.child, w !== null && (w.return = o); w !== null; ) {
            var R = w.dependencies;
            if (R !== null) {
              P = w.child;
              for (var D = R.firstContext; D !== null; ) {
                if (D.context === h) {
                  if (w.tag === 1) {
                    D = cr(-1, u & -u), D.tag = 2;
                    var U = w.updateQueue;
                    if (U !== null) {
                      U = U.shared;
                      var K = U.pending;
                      K === null ? D.next = D : (D.next = K.next, K.next = D), U.pending = D;
                    }
                  }
                  w.lanes |= u, D = w.alternate, D !== null && (D.lanes |= u), Jf(
                    w.return,
                    u,
                    o
                  ), R.lanes |= u;
                  break;
                }
                D = D.next;
              }
            } else if (w.tag === 10) P = w.type === o.type ? null : w.child;
            else if (w.tag === 18) {
              if (P = w.return, P === null) throw Error(n(341));
              P.lanes |= u, R = P.alternate, R !== null && (R.lanes |= u), Jf(P, u, o), P = w.sibling;
            } else P = w.child;
            if (P !== null) P.return = w;
            else for (P = w; P !== null; ) {
              if (P === o) {
                P = null;
                break;
              }
              if (w = P.sibling, w !== null) {
                w.return = P.return, P = w;
                break;
              }
              P = P.return;
            }
            w = P;
          }
          bt(i, o, v.children, u), o = o.child;
        }
        return o;
      case 9:
        return v = o.type, h = o.pendingProps.children, ks(o, u), v = pn(v), h = h(v), o.flags |= 1, bt(i, o, h, u), o.child;
      case 14:
        return h = o.type, v = bn(h, o.pendingProps), v = bn(h.type, v), kv(i, o, h, v, u);
      case 15:
        return Pv(i, o, o.type, o.pendingProps, u);
      case 17:
        return h = o.type, v = o.pendingProps, v = o.elementType === h ? v : bn(h, v), ou(i, o), o.tag = 1, Lt(h) ? (i = !0, Ul(o)) : i = !1, ks(o, u), gv(o, h, v), md(o, h, v, u), _d(null, o, h, !0, i, u);
      case 19:
        return Ov(i, o, u);
      case 22:
        return Ev(i, o, u);
    }
    throw Error(n(156, o.tag));
  };
  function i0(i, o) {
    return Ly(i, o);
  }
  function aE(i, o, u, h) {
    this.tag = i, this.key = u, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = o, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = h, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function gn(i, o, u, h) {
    return new aE(i, o, u, h);
  }
  function Vd(i) {
    return i = i.prototype, !(!i || !i.isReactComponent);
  }
  function lE(i) {
    if (typeof i == "function") return Vd(i) ? 1 : 0;
    if (i != null) {
      if (i = i.$$typeof, i === J) return 11;
      if (i === ue) return 14;
    }
    return 2;
  }
  function $r(i, o) {
    var u = i.alternate;
    return u === null ? (u = gn(i.tag, o, i.key, i.mode), u.elementType = i.elementType, u.type = i.type, u.stateNode = i.stateNode, u.alternate = i, i.alternate = u) : (u.pendingProps = o, u.type = i.type, u.flags = 0, u.subtreeFlags = 0, u.deletions = null), u.flags = i.flags & 14680064, u.childLanes = i.childLanes, u.lanes = i.lanes, u.child = i.child, u.memoizedProps = i.memoizedProps, u.memoizedState = i.memoizedState, u.updateQueue = i.updateQueue, o = i.dependencies, u.dependencies = o === null ? null : { lanes: o.lanes, firstContext: o.firstContext }, u.sibling = i.sibling, u.index = i.index, u.ref = i.ref, u;
  }
  function gu(i, o, u, h, v, w) {
    var P = 2;
    if (h = i, typeof i == "function") Vd(i) && (P = 1);
    else if (typeof i == "string") P = 5;
    else e: switch (i) {
      case I:
        return bi(u.children, v, w, o);
      case O:
        P = 8, v |= 8;
        break;
      case L:
        return i = gn(12, u, o, v | 2), i.elementType = L, i.lanes = w, i;
      case ie:
        return i = gn(13, u, o, v), i.elementType = ie, i.lanes = w, i;
      case re:
        return i = gn(19, u, o, v), i.elementType = re, i.lanes = w, i;
      case me:
        return vu(u, v, w, o);
      default:
        if (typeof i == "object" && i !== null) switch (i.$$typeof) {
          case $:
            P = 10;
            break e;
          case q:
            P = 9;
            break e;
          case J:
            P = 11;
            break e;
          case ue:
            P = 14;
            break e;
          case fe:
            P = 16, h = null;
            break e;
        }
        throw Error(n(130, i == null ? i : typeof i, ""));
    }
    return o = gn(P, u, o, v), o.elementType = i, o.type = h, o.lanes = w, o;
  }
  function bi(i, o, u, h) {
    return i = gn(7, i, h, o), i.lanes = u, i;
  }
  function vu(i, o, u, h) {
    return i = gn(22, i, h, o), i.elementType = me, i.lanes = u, i.stateNode = { isHidden: !1 }, i;
  }
  function Bd(i, o, u) {
    return i = gn(6, i, null, o), i.lanes = u, i;
  }
  function zd(i, o, u) {
    return o = gn(4, i.children !== null ? i.children : [], i.key, o), o.lanes = u, o.stateNode = { containerInfo: i.containerInfo, pendingChildren: null, implementation: i.implementation }, o;
  }
  function uE(i, o, u, h, v) {
    this.tag = o, this.containerInfo = i, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = pf(0), this.expirationTimes = pf(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = pf(0), this.identifierPrefix = h, this.onRecoverableError = v, this.mutableSourceEagerHydrationData = null;
  }
  function Ud(i, o, u, h, v, w, P, R, D) {
    return i = new uE(i, o, u, R, D), o === 1 ? (o = 1, w === !0 && (o |= 8)) : o = 0, w = gn(3, null, null, o), i.current = w, w.stateNode = i, w.memoizedState = { element: h, isDehydrated: u, cache: null, transitions: null, pendingSuspenseBoundaries: null }, td(w), i;
  }
  function cE(i, o, u) {
    var h = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: B, key: h == null ? null : "" + h, children: i, containerInfo: o, implementation: u };
  }
  function s0(i) {
    if (!i) return Or;
    i = i._reactInternals;
    e: {
      if (gi(i) !== i || i.tag !== 1) throw Error(n(170));
      var o = i;
      do {
        switch (o.tag) {
          case 3:
            o = o.stateNode.context;
            break e;
          case 1:
            if (Lt(o.type)) {
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
      if (Lt(u)) return Fg(i, u, o);
    }
    return o;
  }
  function o0(i, o, u, h, v, w, P, R, D) {
    return i = Ud(u, h, !0, i, v, w, P, R, D), i.context = s0(null), u = i.current, h = Rt(), v = zr(u), w = cr(h, v), w.callback = o ?? null, Lr(u, w, v), i.current.lanes = v, Do(i, v, h), Bt(i, h), i;
  }
  function _u(i, o, u, h) {
    var v = o.current, w = Rt(), P = zr(v);
    return u = s0(u), o.context === null ? o.context = u : o.pendingContext = u, o = cr(w, P), o.payload = { element: i }, h = h === void 0 ? null : h, h !== null && (o.callback = h), i = Lr(v, o, P), i !== null && (Dn(i, v, P, w), Xl(i, v, P)), P;
  }
  function wu(i) {
    if (i = i.current, !i.child) return null;
    switch (i.child.tag) {
      case 5:
        return i.child.stateNode;
      default:
        return i.child.stateNode;
    }
  }
  function a0(i, o) {
    if (i = i.memoizedState, i !== null && i.dehydrated !== null) {
      var u = i.retryLane;
      i.retryLane = u !== 0 && u < o ? u : o;
    }
  }
  function $d(i, o) {
    a0(i, o), (i = i.alternate) && a0(i, o);
  }
  function fE() {
    return null;
  }
  var l0 = typeof reportError == "function" ? reportError : function(i) {
    console.error(i);
  };
  function Hd(i) {
    this._internalRoot = i;
  }
  Su.prototype.render = Hd.prototype.render = function(i) {
    var o = this._internalRoot;
    if (o === null) throw Error(n(409));
    _u(i, o, null, null);
  }, Su.prototype.unmount = Hd.prototype.unmount = function() {
    var i = this._internalRoot;
    if (i !== null) {
      this._internalRoot = null;
      var o = i.containerInfo;
      Pi(function() {
        _u(null, i, null, null);
      }), o[sr] = null;
    }
  };
  function Su(i) {
    this._internalRoot = i;
  }
  Su.prototype.unstable_scheduleHydration = function(i) {
    if (i) {
      var o = Wy();
      i = { blockedOn: null, target: i, priority: o };
      for (var u = 0; u < br.length && o !== 0 && o < br[u].priority; u++) ;
      br.splice(u, 0, i), u === 0 && Qy(i);
    }
  };
  function Wd(i) {
    return !(!i || i.nodeType !== 1 && i.nodeType !== 9 && i.nodeType !== 11);
  }
  function xu(i) {
    return !(!i || i.nodeType !== 1 && i.nodeType !== 9 && i.nodeType !== 11 && (i.nodeType !== 8 || i.nodeValue !== " react-mount-point-unstable "));
  }
  function u0() {
  }
  function dE(i, o, u, h, v) {
    if (v) {
      if (typeof h == "function") {
        var w = h;
        h = function() {
          var U = wu(P);
          w.call(U);
        };
      }
      var P = o0(o, h, i, 0, null, !1, !1, "", u0);
      return i._reactRootContainer = P, i[sr] = P.current, Go(i.nodeType === 8 ? i.parentNode : i), Pi(), P;
    }
    for (; v = i.lastChild; ) i.removeChild(v);
    if (typeof h == "function") {
      var R = h;
      h = function() {
        var U = wu(D);
        R.call(U);
      };
    }
    var D = Ud(i, 0, !1, null, null, !1, !1, "", u0);
    return i._reactRootContainer = D, i[sr] = D.current, Go(i.nodeType === 8 ? i.parentNode : i), Pi(function() {
      _u(o, D, u, h);
    }), D;
  }
  function Tu(i, o, u, h, v) {
    var w = u._reactRootContainer;
    if (w) {
      var P = w;
      if (typeof v == "function") {
        var R = v;
        v = function() {
          var D = wu(P);
          R.call(D);
        };
      }
      _u(o, P, i, v);
    } else P = dE(u, o, i, v, h);
    return wu(P);
  }
  $y = function(i) {
    switch (i.tag) {
      case 3:
        var o = i.stateNode;
        if (o.current.memoizedState.isDehydrated) {
          var u = Mo(o.pendingLanes);
          u !== 0 && (mf(o, u | 1), Bt(o, Ze()), (ke & 6) === 0 && (Rs = Ze() + 500, Ir()));
        }
        break;
      case 13:
        Pi(function() {
          var h = ur(i, 1);
          if (h !== null) {
            var v = Rt();
            Dn(h, i, 1, v);
          }
        }), $d(i, 1);
    }
  }, yf = function(i) {
    if (i.tag === 13) {
      var o = ur(i, 134217728);
      if (o !== null) {
        var u = Rt();
        Dn(o, i, 134217728, u);
      }
      $d(i, 134217728);
    }
  }, Hy = function(i) {
    if (i.tag === 13) {
      var o = zr(i), u = ur(i, o);
      if (u !== null) {
        var h = Rt();
        Dn(u, i, o, h);
      }
      $d(i, o);
    }
  }, Wy = function() {
    return Re;
  }, Gy = function(i, o) {
    var u = Re;
    try {
      return Re = i, o();
    } finally {
      Re = u;
    }
  }, lf = function(i, o, u) {
    switch (o) {
      case "input":
        if (Jc(i, u), o = u.name, u.type === "radio" && o != null) {
          for (u = i; u.parentNode; ) u = u.parentNode;
          for (u = u.querySelectorAll("input[name=" + JSON.stringify("" + o) + '][type="radio"]'), o = 0; o < u.length; o++) {
            var h = u[o];
            if (h !== i && h.form === i.form) {
              var v = Bl(h);
              if (!v) throw Error(n(90));
              yy(h), Jc(h, v);
            }
          }
        }
        break;
      case "textarea":
        Sy(i, u);
        break;
      case "select":
        o = u.value, o != null && as(i, !!u.multiple, o, !1);
    }
  }, Ry = Nd, My = Pi;
  var hE = { usingClientEntryPoint: !1, Events: [Yo, gs, Bl, Ay, by, Nd] }, ua = { findFiberByHostInstance: vi, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, pE = { bundleType: ua.bundleType, version: ua.version, rendererPackageName: ua.rendererPackageName, rendererConfig: ua.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: b.ReactCurrentDispatcher, findHostInstanceByFiber: function(i) {
    return i = Iy(i), i === null ? null : i.stateNode;
  }, findFiberByHostInstance: ua.findFiberByHostInstance || fE, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Cu = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Cu.isDisabled && Cu.supportsFiber) try {
      Sl = Cu.inject(pE), Bn = Cu;
    } catch {
    }
  }
  return zt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = hE, zt.createPortal = function(i, o) {
    var u = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Wd(o)) throw Error(n(200));
    return cE(i, o, null, u);
  }, zt.createRoot = function(i, o) {
    if (!Wd(i)) throw Error(n(299));
    var u = !1, h = "", v = l0;
    return o != null && (o.unstable_strictMode === !0 && (u = !0), o.identifierPrefix !== void 0 && (h = o.identifierPrefix), o.onRecoverableError !== void 0 && (v = o.onRecoverableError)), o = Ud(i, 1, !1, null, null, u, !1, h, v), i[sr] = o.current, Go(i.nodeType === 8 ? i.parentNode : i), new Hd(o);
  }, zt.findDOMNode = function(i) {
    if (i == null) return null;
    if (i.nodeType === 1) return i;
    var o = i._reactInternals;
    if (o === void 0)
      throw typeof i.render == "function" ? Error(n(188)) : (i = Object.keys(i).join(","), Error(n(268, i)));
    return i = Iy(o), i = i === null ? null : i.stateNode, i;
  }, zt.flushSync = function(i) {
    return Pi(i);
  }, zt.hydrate = function(i, o, u) {
    if (!xu(o)) throw Error(n(200));
    return Tu(null, i, o, !0, u);
  }, zt.hydrateRoot = function(i, o, u) {
    if (!Wd(i)) throw Error(n(405));
    var h = u != null && u.hydratedSources || null, v = !1, w = "", P = l0;
    if (u != null && (u.unstable_strictMode === !0 && (v = !0), u.identifierPrefix !== void 0 && (w = u.identifierPrefix), u.onRecoverableError !== void 0 && (P = u.onRecoverableError)), o = o0(o, null, i, 1, u ?? null, v, !1, w, P), i[sr] = o.current, Go(i), h) for (i = 0; i < h.length; i++) u = h[i], v = u._getVersion, v = v(u._source), o.mutableSourceEagerHydrationData == null ? o.mutableSourceEagerHydrationData = [u, v] : o.mutableSourceEagerHydrationData.push(
      u,
      v
    );
    return new Su(o);
  }, zt.render = function(i, o, u) {
    if (!xu(o)) throw Error(n(200));
    return Tu(null, i, o, !1, u);
  }, zt.unmountComponentAtNode = function(i) {
    if (!xu(i)) throw Error(n(40));
    return i._reactRootContainer ? (Pi(function() {
      Tu(null, null, i, !1, function() {
        i._reactRootContainer = null, i[sr] = null;
      });
    }), !0) : !1;
  }, zt.unstable_batchedUpdates = Nd, zt.unstable_renderSubtreeIntoContainer = function(i, o, u, h) {
    if (!xu(u)) throw Error(n(200));
    if (i == null || i._reactInternals === void 0) throw Error(n(38));
    return Tu(i, o, u, !1, h);
  }, zt.version = "18.3.1-next-f1338f8080-20240426", zt;
}
var g0;
function uS() {
  if (g0) return Qd.exports;
  g0 = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (e) {
        console.error(e);
      }
  }
  return t(), Qd.exports = TE(), Qd.exports;
}
var v0;
function CE() {
  if (v0) return Pu;
  v0 = 1;
  var t = uS();
  return Pu.createRoot = t.createRoot, Pu.hydrateRoot = t.hydrateRoot, Pu;
}
var kE = CE();
/**
 * react-router v7.17.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
var _0 = "popstate";
function w0(t) {
  return typeof t == "object" && t != null && "pathname" in t && "search" in t && "hash" in t && "state" in t && "key" in t;
}
function PE(t = {}) {
  function e(s, a) {
    let {
      pathname: l = "/",
      search: c = "",
      hash: d = ""
    } = _o(s.location.hash.substring(1));
    return !l.startsWith("/") && !l.startsWith(".") && (l = "/" + l), Oh(
      "",
      { pathname: l, search: c, hash: d },
      // state defaults to `null` because `window.history.state` does
      a.state && a.state.usr || null,
      a.state && a.state.key || "default"
    );
  }
  function n(s, a) {
    let l = s.document.querySelector("base"), c = "";
    if (l && l.getAttribute("href")) {
      let d = s.location.href, m = d.indexOf("#");
      c = m === -1 ? d : d.slice(0, m);
    }
    return c + "#" + (typeof a == "string" ? a : Ra(a));
  }
  function r(s, a) {
    jn(
      s.pathname.charAt(0) === "/",
      `relative pathnames are not supported in hash history.push(${JSON.stringify(
        a
      )})`
    );
  }
  return AE(
    e,
    n,
    r,
    t
  );
}
function lt(t, e) {
  if (t === !1 || t === null || typeof t > "u")
    throw new Error(e);
}
function jn(t, e) {
  if (!t) {
    typeof console < "u" && console.warn(e);
    try {
      throw new Error(e);
    } catch {
    }
  }
}
function EE() {
  return Math.random().toString(36).substring(2, 10);
}
function S0(t, e) {
  return {
    usr: t.state,
    key: t.key,
    idx: e,
    masked: t.mask ? {
      pathname: t.pathname,
      search: t.search,
      hash: t.hash
    } : void 0
  };
}
function Oh(t, e, n = null, r, s) {
  return {
    pathname: typeof t == "string" ? t : t.pathname,
    search: "",
    hash: "",
    ...typeof e == "string" ? _o(e) : e,
    state: n,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: e && e.key || r || EE(),
    mask: s
  };
}
function Ra({
  pathname: t = "/",
  search: e = "",
  hash: n = ""
}) {
  return e && e !== "?" && (t += e.charAt(0) === "?" ? e : "?" + e), n && n !== "#" && (t += n.charAt(0) === "#" ? n : "#" + n), t;
}
function _o(t) {
  let e = {};
  if (t) {
    let n = t.indexOf("#");
    n >= 0 && (e.hash = t.substring(n), t = t.substring(0, n));
    let r = t.indexOf("?");
    r >= 0 && (e.search = t.substring(r), t = t.substring(0, r)), t && (e.pathname = t);
  }
  return e;
}
function AE(t, e, n, r = {}) {
  let { window: s = document.defaultView, v5Compat: a = !1 } = r, l = s.history, c = "POP", d = null, m = y();
  m == null && (m = 0, l.replaceState({ ...l.state, idx: m }, ""));
  function y() {
    return (l.state || { idx: null }).idx;
  }
  function f() {
    c = "POP";
    let x = y(), T = x == null ? null : x - m;
    m = x, d && d({ action: c, location: _.location, delta: T });
  }
  function p(x, T) {
    c = "PUSH";
    let E = w0(x) ? x : Oh(_.location, x, T);
    n && n(E, x), m = y() + 1;
    let A = S0(E, m), b = _.createHref(E.mask || E);
    try {
      l.pushState(A, "", b);
    } catch (M) {
      if (M instanceof DOMException && M.name === "DataCloneError")
        throw M;
      s.location.assign(b);
    }
    a && d && d({ action: c, location: _.location, delta: 1 });
  }
  function g(x, T) {
    c = "REPLACE";
    let E = w0(x) ? x : Oh(_.location, x, T);
    n && n(E, x), m = y();
    let A = S0(E, m), b = _.createHref(E.mask || E);
    l.replaceState(A, "", b), a && d && d({ action: c, location: _.location, delta: 0 });
  }
  function S(x) {
    return bE(s, x);
  }
  let _ = {
    get action() {
      return c;
    },
    get location() {
      return t(s, l);
    },
    listen(x) {
      if (d)
        throw new Error("A history only accepts one active listener");
      return s.addEventListener(_0, f), d = x, () => {
        s.removeEventListener(_0, f), d = null;
      };
    },
    createHref(x) {
      return e(s, x);
    },
    createURL: S,
    encodeLocation(x) {
      let T = S(x);
      return {
        pathname: T.pathname,
        search: T.search,
        hash: T.hash
      };
    },
    push: p,
    replace: g,
    go(x) {
      return l.go(x);
    }
  };
  return _;
}
function bE(t, e, n = !1) {
  let r = "http://localhost";
  t && (r = t.location.origin !== "null" ? t.location.origin : t.location.href), lt(r, "No window.location.(origin|href) available to create URL");
  let s = typeof e == "string" ? e : Ra(e);
  return s = s.replace(/ $/, "%20"), !n && s.startsWith("//") && (s = r + s), new URL(s, r);
}
function cS(t, e, n = "/") {
  return RE(t, e, n, !1);
}
function RE(t, e, n, r, s) {
  let a = typeof e == "string" ? _o(e) : e, l = Sr(a.pathname || "/", n);
  if (l == null)
    return null;
  let c = ME(t), d = null, m = $E(l);
  for (let y = 0; d == null && y < c.length; ++y)
    d = zE(
      c[y],
      m,
      r
    );
  return d;
}
function ME(t) {
  let e = fS(t);
  return DE(e), e;
}
function fS(t, e = [], n = [], r = "", s = !1) {
  let a = (l, c, d = s, m) => {
    let y = {
      relativePath: m === void 0 ? l.path || "" : m,
      caseSensitive: l.caseSensitive === !0,
      childrenIndex: c,
      route: l
    };
    if (y.relativePath.startsWith("/")) {
      if (!y.relativePath.startsWith(r) && d)
        return;
      lt(
        y.relativePath.startsWith(r),
        `Absolute route path "${y.relativePath}" nested under path "${r}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`
      ), y.relativePath = y.relativePath.slice(r.length);
    }
    let f = Nn([r, y.relativePath]), p = n.concat(y);
    l.children && l.children.length > 0 && (lt(
      // Our types know better, but runtime JS may not!
      // @ts-expect-error
      l.index !== !0,
      `Index routes must not have child routes. Please remove all child routes from route path "${f}".`
    ), fS(
      l.children,
      e,
      p,
      f,
      d
    )), !(l.path == null && !l.index) && e.push({
      path: f,
      score: VE(f, l.index),
      routesMeta: p
    });
  };
  return t.forEach((l, c) => {
    var d;
    if (l.path === "" || !((d = l.path) != null && d.includes("?")))
      a(l, c);
    else
      for (let m of dS(l.path))
        a(l, c, !0, m);
  }), e;
}
function dS(t) {
  let e = t.split("/");
  if (e.length === 0) return [];
  let [n, ...r] = e, s = n.endsWith("?"), a = n.replace(/\?$/, "");
  if (r.length === 0)
    return s ? [a, ""] : [a];
  let l = dS(r.join("/")), c = [];
  return c.push(
    ...l.map(
      (d) => d === "" ? a : [a, d].join("/")
    )
  ), s && c.push(...l), c.map(
    (d) => t.startsWith("/") && d === "" ? "/" : d
  );
}
function DE(t) {
  t.sort(
    (e, n) => e.score !== n.score ? n.score - e.score : BE(
      e.routesMeta.map((r) => r.childrenIndex),
      n.routesMeta.map((r) => r.childrenIndex)
    )
  );
}
var FE = /^:[\w-]+$/, OE = 3, IE = 2, NE = 1, LE = 10, jE = -2, x0 = (t) => t === "*";
function VE(t, e) {
  let n = t.split("/"), r = n.length;
  return n.some(x0) && (r += jE), e && (r += IE), n.filter((s) => !x0(s)).reduce(
    (s, a) => s + (FE.test(a) ? OE : a === "" ? NE : LE),
    r
  );
}
function BE(t, e) {
  return t.length === e.length && t.slice(0, -1).every((r, s) => r === e[s]) ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    t[t.length - 1] - e[e.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function zE(t, e, n = !1) {
  let { routesMeta: r } = t, s = {}, a = "/", l = [];
  for (let c = 0; c < r.length; ++c) {
    let d = r[c], m = c === r.length - 1, y = a === "/" ? e : e.slice(a.length) || "/", f = ac(
      { path: d.relativePath, caseSensitive: d.caseSensitive, end: m },
      y
    ), p = d.route;
    if (!f && m && n && !r[r.length - 1].route.index && (f = ac(
      {
        path: d.relativePath,
        caseSensitive: d.caseSensitive,
        end: !1
      },
      y
    )), !f)
      return null;
    Object.assign(s, f.params), l.push({
      // TODO: Can this as be avoided?
      params: s,
      pathname: Nn([a, f.pathname]),
      pathnameBase: KE(
        Nn([a, f.pathnameBase])
      ),
      route: p
    }), f.pathnameBase !== "/" && (a = Nn([a, f.pathnameBase]));
  }
  return l;
}
function ac(t, e) {
  typeof t == "string" && (t = { path: t, caseSensitive: !1, end: !0 });
  let [n, r] = UE(
    t.path,
    t.caseSensitive,
    t.end
  ), s = e.match(n);
  if (!s) return null;
  let a = s[0], l = a.replace(/(.)\/+$/, "$1"), c = s.slice(1);
  return {
    params: r.reduce(
      (m, { paramName: y, isOptional: f }, p) => {
        if (y === "*") {
          let S = c[p] || "";
          l = a.slice(0, a.length - S.length).replace(/(.)\/+$/, "$1");
        }
        const g = c[p];
        return f && !g ? m[y] = void 0 : m[y] = (g || "").replace(/%2F/g, "/"), m;
      },
      {}
    ),
    pathname: a,
    pathnameBase: l,
    pattern: t
  };
}
function UE(t, e = !1, n = !0) {
  jn(
    t === "*" || !t.endsWith("*") || t.endsWith("/*"),
    `Route path "${t}" will be treated as if it were "${t.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${t.replace(/\*$/, "/*")}".`
  );
  let r = [], s = "^" + t.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(
    /\/:([\w-]+)(\?)?/g,
    (l, c, d, m, y) => {
      if (r.push({ paramName: c, isOptional: d != null }), d) {
        let f = y.charAt(m + l.length);
        return f && f !== "/" ? "/([^\\/]*)" : "(?:/([^\\/]*))?";
      }
      return "/([^\\/]+)";
    }
  ).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  return t.endsWith("*") ? (r.push({ paramName: "*" }), s += t === "*" || t === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : n ? s += "\\/*$" : t !== "" && t !== "/" && (s += "(?:(?=\\/|$))"), [new RegExp(s, e ? void 0 : "i"), r];
}
function $E(t) {
  try {
    return t.split("/").map((e) => decodeURIComponent(e).replace(/\//g, "%2F")).join("/");
  } catch (e) {
    return jn(
      !1,
      `The URL path "${t}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${e}).`
    ), t;
  }
}
function Sr(t, e) {
  if (e === "/") return t;
  if (!t.toLowerCase().startsWith(e.toLowerCase()))
    return null;
  let n = e.endsWith("/") ? e.length - 1 : e.length, r = t.charAt(n);
  return r && r !== "/" ? null : t.slice(n) || "/";
}
var HE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
function WE(t, e = "/") {
  let {
    pathname: n,
    search: r = "",
    hash: s = ""
  } = typeof t == "string" ? _o(t) : t, a;
  return n ? (n = pS(n), n.startsWith("/") ? a = T0(n.substring(1), "/") : a = T0(n, e)) : a = e, {
    pathname: a,
    search: QE(r),
    hash: YE(s)
  };
}
function T0(t, e) {
  let n = lc(e).split("/");
  return t.split("/").forEach((s) => {
    s === ".." ? n.length > 1 && n.pop() : s !== "." && n.push(s);
  }), n.length > 1 ? n.join("/") : "/";
}
function qd(t, e, n, r) {
  return `Cannot include a '${t}' character in a manually specified \`to.${e}\` field [${JSON.stringify(
    r
  )}].  Please separate it out to the \`to.${n}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function GE(t) {
  return t.filter(
    (e, n) => n === 0 || e.route.path && e.route.path.length > 0
  );
}
function hS(t) {
  let e = GE(t);
  return e.map(
    (n, r) => r === e.length - 1 ? n.pathname : n.pathnameBase
  );
}
function tm(t, e, n, r = !1) {
  let s;
  typeof t == "string" ? s = _o(t) : (s = { ...t }, lt(
    !s.pathname || !s.pathname.includes("?"),
    qd("?", "pathname", "search", s)
  ), lt(
    !s.pathname || !s.pathname.includes("#"),
    qd("#", "pathname", "hash", s)
  ), lt(
    !s.search || !s.search.includes("#"),
    qd("#", "search", "hash", s)
  ));
  let a = t === "" || s.pathname === "", l = a ? "/" : s.pathname, c;
  if (l == null)
    c = n;
  else {
    let f = e.length - 1;
    if (!r && l.startsWith("..")) {
      let p = l.split("/");
      for (; p[0] === ".."; )
        p.shift(), f -= 1;
      s.pathname = p.join("/");
    }
    c = f >= 0 ? e[f] : "/";
  }
  let d = WE(s, c), m = l && l !== "/" && l.endsWith("/"), y = (a || l === ".") && n.endsWith("/");
  return !d.pathname.endsWith("/") && (m || y) && (d.pathname += "/"), d;
}
var pS = (t) => t.replace(/\/\/+/g, "/"), Nn = (t) => pS(t.join("/")), lc = (t) => t.replace(/\/+$/, ""), KE = (t) => lc(t).replace(/^\/*/, "/"), QE = (t) => !t || t === "?" ? "" : t.startsWith("?") ? t : "?" + t, YE = (t) => !t || t === "#" ? "" : t.startsWith("#") ? t : "#" + t, XE = class {
  constructor(t, e, n, r = !1) {
    this.status = t, this.statusText = e || "", this.internal = r, n instanceof Error ? (this.data = n.toString(), this.error = n) : this.data = n;
  }
};
function qE(t) {
  return t != null && typeof t.status == "number" && typeof t.statusText == "string" && typeof t.internal == "boolean" && "data" in t;
}
function ZE(t) {
  let e = t.map((n) => n.route.path).filter(Boolean);
  return Nn(e) || "/";
}
var mS = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
function yS(t, e) {
  let n = t;
  if (typeof n != "string" || !HE.test(n))
    return {
      absoluteURL: void 0,
      isExternal: !1,
      to: n
    };
  let r = n, s = !1;
  if (mS)
    try {
      let a = new URL(window.location.href), l = n.startsWith("//") ? new URL(a.protocol + n) : new URL(n), c = Sr(l.pathname, e);
      l.origin === a.origin && c != null ? n = c + l.search + l.hash : s = !0;
    } catch {
      jn(
        !1,
        `<Link to="${n}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`
      );
    }
  return {
    absoluteURL: r,
    isExternal: s,
    to: n
  };
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var gS = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
];
new Set(
  gS
);
var JE = [
  "GET",
  ...gS
];
new Set(JE);
var wo = k.createContext(null);
wo.displayName = "DataRouter";
var Dc = k.createContext(null);
Dc.displayName = "DataRouterState";
var vS = k.createContext(!1);
function eA() {
  return k.useContext(vS);
}
var _S = k.createContext({
  isTransitioning: !1
});
_S.displayName = "ViewTransition";
var tA = k.createContext(
  /* @__PURE__ */ new Map()
);
tA.displayName = "Fetchers";
var nA = k.createContext(null);
nA.displayName = "Await";
var kn = k.createContext(
  null
);
kn.displayName = "Navigation";
var Fc = k.createContext(
  null
);
Fc.displayName = "Location";
var Cr = k.createContext({
  outlet: null,
  matches: [],
  isDataRoute: !1
});
Cr.displayName = "Route";
var nm = k.createContext(null);
nm.displayName = "RouteError";
var wS = "REACT_ROUTER_ERROR", rA = "REDIRECT", iA = "ROUTE_ERROR_RESPONSE";
function sA(t) {
  if (t.startsWith(`${wS}:${rA}:{`))
    try {
      let e = JSON.parse(t.slice(28));
      if (typeof e == "object" && e && typeof e.status == "number" && typeof e.statusText == "string" && typeof e.location == "string" && typeof e.reloadDocument == "boolean" && typeof e.replace == "boolean")
        return e;
    } catch {
    }
}
function oA(t) {
  if (t.startsWith(
    `${wS}:${iA}:{`
  ))
    try {
      let e = JSON.parse(t.slice(40));
      if (typeof e == "object" && e && typeof e.status == "number" && typeof e.statusText == "string")
        return new XE(
          e.status,
          e.statusText,
          e.data
        );
    } catch {
    }
}
function aA(t, { relative: e } = {}) {
  lt(
    Ja(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useHref() may be used only in the context of a <Router> component."
  );
  let { basename: n, navigator: r } = k.useContext(kn), { hash: s, pathname: a, search: l } = el(t, { relative: e }), c = a;
  return n !== "/" && (c = a === "/" ? n : Nn([n, a])), r.createHref({ pathname: c, search: l, hash: s });
}
function Ja() {
  return k.useContext(Fc) != null;
}
function kr() {
  return lt(
    Ja(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useLocation() may be used only in the context of a <Router> component."
  ), k.useContext(Fc).location;
}
var SS = "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function xS(t) {
  k.useContext(kn).static || k.useLayoutEffect(t);
}
function lA() {
  let { isDataRoute: t } = k.useContext(Cr);
  return t ? SA() : uA();
}
function uA() {
  lt(
    Ja(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useNavigate() may be used only in the context of a <Router> component."
  );
  let t = k.useContext(wo), { basename: e, navigator: n } = k.useContext(kn), { matches: r } = k.useContext(Cr), { pathname: s } = kr(), a = JSON.stringify(hS(r)), l = k.useRef(!1);
  return xS(() => {
    l.current = !0;
  }), k.useCallback(
    (d, m = {}) => {
      if (jn(l.current, SS), !l.current) return;
      if (typeof d == "number") {
        n.go(d);
        return;
      }
      let y = tm(
        d,
        JSON.parse(a),
        s,
        m.relative === "path"
      );
      t == null && e !== "/" && (y.pathname = y.pathname === "/" ? e : Nn([e, y.pathname])), (m.replace ? n.replace : n.push)(
        y,
        m.state,
        m
      );
    },
    [
      e,
      n,
      a,
      s,
      t
    ]
  );
}
k.createContext(null);
function el(t, { relative: e } = {}) {
  let { matches: n } = k.useContext(Cr), { pathname: r } = kr(), s = JSON.stringify(hS(n));
  return k.useMemo(
    () => tm(
      t,
      JSON.parse(s),
      r,
      e === "path"
    ),
    [t, s, r, e]
  );
}
function cA(t, e, n) {
  lt(
    Ja(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useRoutes() may be used only in the context of a <Router> component."
  );
  let { navigator: r } = k.useContext(kn), { matches: s } = k.useContext(Cr), a = s[s.length - 1], l = a ? a.params : {}, c = a ? a.pathname : "/", d = a ? a.pathnameBase : "/", m = a && a.route;
  {
    let x = m && m.path || "";
    CS(
      c,
      !m || x.endsWith("*") || x.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${c}" (under <Route path="${x}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${x}"> to <Route path="${x === "/" ? "*" : `${x}/*`}">.`
    );
  }
  let y = kr(), f;
  f = y;
  let p = f.pathname || "/", g = p;
  if (d !== "/") {
    let x = d.replace(/^\//, "").split("/");
    g = "/" + p.replace(/^\//, "").split("/").slice(x.length).join("/");
  }
  let S = n && n.state.matches.length ? (
    // If we're in a data router, use the matches we've already identified but ensure
    // we have the latest route instances from the manifest in case elements have changed
    n.state.matches.map(
      (x) => Object.assign(x, {
        route: n.manifest[x.route.id] || x.route
      })
    )
  ) : cS(t, { pathname: g });
  return jn(
    m || S != null,
    `No routes matched location "${f.pathname}${f.search}${f.hash}" `
  ), jn(
    S == null || S[S.length - 1].route.element !== void 0 || S[S.length - 1].route.Component !== void 0 || S[S.length - 1].route.lazy !== void 0,
    `Matched leaf route at location "${f.pathname}${f.search}${f.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`
  ), mA(
    S && S.map(
      (x) => Object.assign({}, x, {
        params: Object.assign({}, l, x.params),
        pathname: Nn([
          d,
          // Re-encode pathnames that were decoded inside matchRoutes.
          // Pre-encode `%`, `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          r.encodeLocation ? r.encodeLocation(
            x.pathname.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : x.pathname
        ]),
        pathnameBase: x.pathnameBase === "/" ? d : Nn([
          d,
          // Re-encode pathnames that were decoded inside matchRoutes
          // Pre-encode `%`, `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          r.encodeLocation ? r.encodeLocation(
            x.pathnameBase.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : x.pathnameBase
        ])
      })
    ),
    s,
    n
  );
}
function fA() {
  let t = wA(), e = qE(t) ? `${t.status} ${t.statusText}` : t instanceof Error ? t.message : JSON.stringify(t), n = t instanceof Error ? t.stack : null, r = "rgba(200,200,200, 0.5)", s = { padding: "0.5rem", backgroundColor: r }, a = { padding: "2px 4px", backgroundColor: r }, l = null;
  return console.error(
    "Error handled by React Router default ErrorBoundary:",
    t
  ), l = /* @__PURE__ */ k.createElement(k.Fragment, null, /* @__PURE__ */ k.createElement("p", null, "💿 Hey developer 👋"), /* @__PURE__ */ k.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ k.createElement("code", { style: a }, "ErrorBoundary"), " or", " ", /* @__PURE__ */ k.createElement("code", { style: a }, "errorElement"), " prop on your route.")), /* @__PURE__ */ k.createElement(k.Fragment, null, /* @__PURE__ */ k.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ k.createElement("h3", { style: { fontStyle: "italic" } }, e), n ? /* @__PURE__ */ k.createElement("pre", { style: s }, n) : null, l);
}
var dA = /* @__PURE__ */ k.createElement(fA, null), TS = class extends k.Component {
  constructor(t) {
    super(t), this.state = {
      location: t.location,
      revalidation: t.revalidation,
      error: t.error
    };
  }
  static getDerivedStateFromError(t) {
    return { error: t };
  }
  static getDerivedStateFromProps(t, e) {
    return e.location !== t.location || e.revalidation !== "idle" && t.revalidation === "idle" ? {
      error: t.error,
      location: t.location,
      revalidation: t.revalidation
    } : {
      error: t.error !== void 0 ? t.error : e.error,
      location: e.location,
      revalidation: t.revalidation || e.revalidation
    };
  }
  componentDidCatch(t, e) {
    this.props.onError ? this.props.onError(t, e) : console.error(
      "React Router caught the following error during render",
      t
    );
  }
  render() {
    let t = this.state.error;
    if (this.context && typeof t == "object" && t && "digest" in t && typeof t.digest == "string") {
      const n = oA(t.digest);
      n && (t = n);
    }
    let e = t !== void 0 ? /* @__PURE__ */ k.createElement(Cr.Provider, { value: this.props.routeContext }, /* @__PURE__ */ k.createElement(
      nm.Provider,
      {
        value: t,
        children: this.props.component
      }
    )) : this.props.children;
    return this.context ? /* @__PURE__ */ k.createElement(hA, { error: t }, e) : e;
  }
};
TS.contextType = vS;
var Zd = /* @__PURE__ */ new WeakMap();
function hA({
  children: t,
  error: e
}) {
  let { basename: n } = k.useContext(kn);
  if (typeof e == "object" && e && "digest" in e && typeof e.digest == "string") {
    let r = sA(e.digest);
    if (r) {
      let s = Zd.get(e);
      if (s) throw s;
      let a = yS(r.location, n);
      if (mS && !Zd.get(e))
        if (a.isExternal || r.reloadDocument)
          window.location.href = a.absoluteURL || a.to;
        else {
          const l = Promise.resolve().then(
            () => window.__reactRouterDataRouter.navigate(a.to, {
              replace: r.replace
            })
          );
          throw Zd.set(e, l), l;
        }
      return /* @__PURE__ */ k.createElement(
        "meta",
        {
          httpEquiv: "refresh",
          content: `0;url=${a.absoluteURL || a.to}`
        }
      );
    }
  }
  return t;
}
function pA({ routeContext: t, match: e, children: n }) {
  let r = k.useContext(wo);
  return r && r.static && r.staticContext && (e.route.errorElement || e.route.ErrorBoundary) && (r.staticContext._deepestRenderedBoundaryId = e.route.id), /* @__PURE__ */ k.createElement(Cr.Provider, { value: t }, n);
}
function mA(t, e = [], n) {
  let r = n == null ? void 0 : n.state;
  if (t == null) {
    if (!r)
      return null;
    if (r.errors)
      t = r.matches;
    else if (e.length === 0 && !r.initialized && r.matches.length > 0)
      t = r.matches;
    else
      return null;
  }
  let s = t, a = r == null ? void 0 : r.errors;
  if (a != null) {
    let y = s.findIndex(
      (f) => f.route.id && (a == null ? void 0 : a[f.route.id]) !== void 0
    );
    lt(
      y >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(
        a
      ).join(",")}`
    ), s = s.slice(
      0,
      Math.min(s.length, y + 1)
    );
  }
  let l = !1, c = -1;
  if (n && r) {
    l = r.renderFallback;
    for (let y = 0; y < s.length; y++) {
      let f = s[y];
      if ((f.route.HydrateFallback || f.route.hydrateFallbackElement) && (c = y), f.route.id) {
        let { loaderData: p, errors: g } = r, S = f.route.loader && !p.hasOwnProperty(f.route.id) && (!g || g[f.route.id] === void 0);
        if (f.route.lazy || S) {
          n.isStatic && (l = !0), c >= 0 ? s = s.slice(0, c + 1) : s = [s[0]];
          break;
        }
      }
    }
  }
  let d = n == null ? void 0 : n.onError, m = r && d ? (y, f) => {
    var p, g;
    d(y, {
      location: r.location,
      params: ((g = (p = r.matches) == null ? void 0 : p[0]) == null ? void 0 : g.params) ?? {},
      pattern: ZE(r.matches),
      errorInfo: f
    });
  } : void 0;
  return s.reduceRight(
    (y, f, p) => {
      let g, S = !1, _ = null, x = null;
      r && (g = a && f.route.id ? a[f.route.id] : void 0, _ = f.route.errorElement || dA, l && (c < 0 && p === 0 ? (CS(
        "route-fallback",
        !1,
        "No `HydrateFallback` element provided to render during initial hydration"
      ), S = !0, x = null) : c === p && (S = !0, x = f.route.hydrateFallbackElement || null)));
      let T = e.concat(s.slice(0, p + 1)), E = () => {
        let A;
        return g ? A = _ : S ? A = x : f.route.Component ? A = /* @__PURE__ */ k.createElement(f.route.Component, null) : f.route.element ? A = f.route.element : A = y, /* @__PURE__ */ k.createElement(
          pA,
          {
            match: f,
            routeContext: {
              outlet: y,
              matches: T,
              isDataRoute: r != null
            },
            children: A
          }
        );
      };
      return r && (f.route.ErrorBoundary || f.route.errorElement || p === 0) ? /* @__PURE__ */ k.createElement(
        TS,
        {
          location: r.location,
          revalidation: r.revalidation,
          component: _,
          error: g,
          children: E(),
          routeContext: { outlet: null, matches: T, isDataRoute: !0 },
          onError: m
        }
      ) : E();
    },
    null
  );
}
function rm(t) {
  return `${t} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function yA(t) {
  let e = k.useContext(wo);
  return lt(e, rm(t)), e;
}
function gA(t) {
  let e = k.useContext(Dc);
  return lt(e, rm(t)), e;
}
function vA(t) {
  let e = k.useContext(Cr);
  return lt(e, rm(t)), e;
}
function im(t) {
  let e = vA(t), n = e.matches[e.matches.length - 1];
  return lt(
    n.route.id,
    `${t} can only be used on routes that contain a unique "id"`
  ), n.route.id;
}
function _A() {
  return im(
    "useRouteId"
    /* UseRouteId */
  );
}
function wA() {
  var r;
  let t = k.useContext(nm), e = gA(
    "useRouteError"
    /* UseRouteError */
  ), n = im(
    "useRouteError"
    /* UseRouteError */
  );
  return t !== void 0 ? t : (r = e.errors) == null ? void 0 : r[n];
}
function SA() {
  let { router: t } = yA(
    "useNavigate"
    /* UseNavigateStable */
  ), e = im(
    "useNavigate"
    /* UseNavigateStable */
  ), n = k.useRef(!1);
  return xS(() => {
    n.current = !0;
  }), k.useCallback(
    async (s, a = {}) => {
      jn(n.current, SS), n.current && (typeof s == "number" ? await t.navigate(s) : await t.navigate(s, { fromRouteId: e, ...a }));
    },
    [t, e]
  );
}
var C0 = {};
function CS(t, e, n) {
  !e && !C0[t] && (C0[t] = !0, jn(!1, n));
}
k.memo(xA);
function xA({
  routes: t,
  manifest: e,
  future: n,
  state: r,
  isStatic: s,
  onError: a
}) {
  return cA(t, void 0, {
    manifest: e,
    state: r,
    isStatic: s,
    onError: a
  });
}
function TA({
  basename: t = "/",
  children: e = null,
  location: n,
  navigationType: r = "POP",
  navigator: s,
  static: a = !1,
  useTransitions: l
}) {
  lt(
    !Ja(),
    "You cannot render a <Router> inside another <Router>. You should never have more than one in your app."
  );
  let c = t.replace(/^\/*/, "/"), d = k.useMemo(
    () => ({
      basename: c,
      navigator: s,
      static: a,
      useTransitions: l,
      future: {}
    }),
    [c, s, a, l]
  );
  typeof n == "string" && (n = _o(n));
  let {
    pathname: m = "/",
    search: y = "",
    hash: f = "",
    state: p = null,
    key: g = "default",
    mask: S
  } = n, _ = k.useMemo(() => {
    let x = Sr(m, c);
    return x == null ? null : {
      location: {
        pathname: x,
        search: y,
        hash: f,
        state: p,
        key: g,
        mask: S
      },
      navigationType: r
    };
  }, [c, m, y, f, p, g, r, S]);
  return jn(
    _ != null,
    `<Router basename="${c}"> is not able to match the URL "${m}${y}${f}" because it does not start with the basename, so the <Router> won't render anything.`
  ), _ == null ? null : /* @__PURE__ */ k.createElement(kn.Provider, { value: d }, /* @__PURE__ */ k.createElement(Fc.Provider, { children: e, value: _ }));
}
var Hu = "get", Wu = "application/x-www-form-urlencoded";
function Oc(t) {
  return typeof HTMLElement < "u" && t instanceof HTMLElement;
}
function CA(t) {
  return Oc(t) && t.tagName.toLowerCase() === "button";
}
function kA(t) {
  return Oc(t) && t.tagName.toLowerCase() === "form";
}
function PA(t) {
  return Oc(t) && t.tagName.toLowerCase() === "input";
}
function EA(t) {
  return !!(t.metaKey || t.altKey || t.ctrlKey || t.shiftKey);
}
function AA(t, e) {
  return t.button === 0 && // Ignore everything but left clicks
  (!e || e === "_self") && // Let browser handle "target=_blank" etc.
  !EA(t);
}
var Eu = null;
function bA() {
  if (Eu === null)
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      ), Eu = !1;
    } catch {
      Eu = !0;
    }
  return Eu;
}
var RA = /* @__PURE__ */ new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
]);
function Jd(t) {
  return t != null && !RA.has(t) ? (jn(
    !1,
    `"${t}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${Wu}"`
  ), null) : t;
}
function MA(t, e) {
  let n, r, s, a, l;
  if (kA(t)) {
    let c = t.getAttribute("action");
    r = c ? Sr(c, e) : null, n = t.getAttribute("method") || Hu, s = Jd(t.getAttribute("enctype")) || Wu, a = new FormData(t);
  } else if (CA(t) || PA(t) && (t.type === "submit" || t.type === "image")) {
    let c = t.form;
    if (c == null)
      throw new Error(
        'Cannot submit a <button> or <input type="submit"> without a <form>'
      );
    let d = t.getAttribute("formaction") || c.getAttribute("action");
    if (r = d ? Sr(d, e) : null, n = t.getAttribute("formmethod") || c.getAttribute("method") || Hu, s = Jd(t.getAttribute("formenctype")) || Jd(c.getAttribute("enctype")) || Wu, a = new FormData(c, t), !bA()) {
      let { name: m, type: y, value: f } = t;
      if (y === "image") {
        let p = m ? `${m}.` : "";
        a.append(`${p}x`, "0"), a.append(`${p}y`, "0");
      } else m && a.append(m, f);
    }
  } else {
    if (Oc(t))
      throw new Error(
        'Cannot submit element that is not <form>, <button>, or <input type="submit|image">'
      );
    n = Hu, r = null, s = Wu, l = t;
  }
  return a && s === "text/plain" && (l = a, a = void 0), { action: r, method: n.toLowerCase(), encType: s, formData: a, body: l };
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function sm(t, e) {
  if (t === !1 || t === null || typeof t > "u")
    throw new Error(e);
}
function kS(t, e, n, r) {
  let s = typeof t == "string" ? new URL(
    t,
    // This can be called during the SSR flow via PrefetchPageLinksImpl so
    // don't assume window is available
    typeof window > "u" ? "server://singlefetch/" : window.location.origin
  ) : t;
  return n ? s.pathname.endsWith("/") ? s.pathname = `${s.pathname}_.${r}` : s.pathname = `${s.pathname}.${r}` : s.pathname === "/" ? s.pathname = `_root.${r}` : e && Sr(s.pathname, e) === "/" ? s.pathname = `${lc(e)}/_root.${r}` : s.pathname = `${lc(s.pathname)}.${r}`, s;
}
async function DA(t, e) {
  if (t.id in e)
    return e[t.id];
  try {
    let n = await import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      t.module
    );
    return e[t.id] = n, n;
  } catch (n) {
    return console.error(
      `Error loading route module \`${t.module}\`, reloading page...`
    ), console.error(n), window.__reactRouterContext && window.__reactRouterContext.isSpaMode, window.location.reload(), new Promise(() => {
    });
  }
}
function FA(t) {
  return t == null ? !1 : t.href == null ? t.rel === "preload" && typeof t.imageSrcSet == "string" && typeof t.imageSizes == "string" : typeof t.rel == "string" && typeof t.href == "string";
}
async function OA(t, e, n) {
  let r = await Promise.all(
    t.map(async (s) => {
      let a = e.routes[s.route.id];
      if (a) {
        let l = await DA(a, n);
        return l.links ? l.links() : [];
      }
      return [];
    })
  );
  return jA(
    r.flat(1).filter(FA).filter((s) => s.rel === "stylesheet" || s.rel === "preload").map(
      (s) => s.rel === "stylesheet" ? { ...s, rel: "prefetch", as: "style" } : { ...s, rel: "prefetch" }
    )
  );
}
function k0(t, e, n, r, s, a) {
  let l = (d, m) => n[m] ? d.route.id !== n[m].route.id : !0, c = (d, m) => {
    var y;
    return (
      // param change, /users/123 -> /users/456
      n[m].pathname !== d.pathname || // splat param changed, which is not present in match.path
      // e.g. /files/images/avatar.jpg -> files/finances.xls
      ((y = n[m].route.path) == null ? void 0 : y.endsWith("*")) && n[m].params["*"] !== d.params["*"]
    );
  };
  return a === "assets" ? e.filter(
    (d, m) => l(d, m) || c(d, m)
  ) : a === "data" ? e.filter((d, m) => {
    var f;
    let y = r.routes[d.route.id];
    if (!y || !y.hasLoader)
      return !1;
    if (l(d, m) || c(d, m))
      return !0;
    if (d.route.shouldRevalidate) {
      let p = d.route.shouldRevalidate({
        currentUrl: new URL(
          s.pathname + s.search + s.hash,
          window.origin
        ),
        currentParams: ((f = n[0]) == null ? void 0 : f.params) || {},
        nextUrl: new URL(t, window.origin),
        nextParams: d.params,
        defaultShouldRevalidate: !0
      });
      if (typeof p == "boolean")
        return p;
    }
    return !0;
  }) : [];
}
function IA(t, e, { includeHydrateFallback: n } = {}) {
  return NA(
    t.map((r) => {
      let s = e.routes[r.route.id];
      if (!s) return [];
      let a = [s.module];
      return s.clientActionModule && (a = a.concat(s.clientActionModule)), s.clientLoaderModule && (a = a.concat(s.clientLoaderModule)), n && s.hydrateFallbackModule && (a = a.concat(s.hydrateFallbackModule)), s.imports && (a = a.concat(s.imports)), a;
    }).flat(1)
  );
}
function NA(t) {
  return [...new Set(t)];
}
function LA(t) {
  let e = {}, n = Object.keys(t).sort();
  for (let r of n)
    e[r] = t[r];
  return e;
}
function jA(t, e) {
  let n = /* @__PURE__ */ new Set();
  return new Set(e), t.reduce((r, s) => {
    let a = JSON.stringify(LA(s));
    return n.has(a) || (n.add(a), r.push({ key: a, link: s })), r;
  }, []);
}
function om() {
  let t = k.useContext(wo);
  return sm(
    t,
    "You must render this element inside a <DataRouterContext.Provider> element"
  ), t;
}
function VA() {
  let t = k.useContext(Dc);
  return sm(
    t,
    "You must render this element inside a <DataRouterStateContext.Provider> element"
  ), t;
}
var am = k.createContext(void 0);
am.displayName = "FrameworkContext";
function lm() {
  let t = k.useContext(am);
  return sm(
    t,
    "You must render this element inside a <HydratedRouter> element"
  ), t;
}
function BA(t, e) {
  let n = k.useContext(am), [r, s] = k.useState(!1), [a, l] = k.useState(!1), { onFocus: c, onBlur: d, onMouseEnter: m, onMouseLeave: y, onTouchStart: f } = e, p = k.useRef(null);
  k.useEffect(() => {
    if (t === "render" && l(!0), t === "viewport") {
      let _ = (T) => {
        T.forEach((E) => {
          l(E.isIntersecting);
        });
      }, x = new IntersectionObserver(_, { threshold: 0.5 });
      return p.current && x.observe(p.current), () => {
        x.disconnect();
      };
    }
  }, [t]), k.useEffect(() => {
    if (r) {
      let _ = setTimeout(() => {
        l(!0);
      }, 100);
      return () => {
        clearTimeout(_);
      };
    }
  }, [r]);
  let g = () => {
    s(!0);
  }, S = () => {
    s(!1), l(!1);
  };
  return n ? t !== "intent" ? [a, p, {}] : [
    a,
    p,
    {
      onFocus: fa(c, g),
      onBlur: fa(d, S),
      onMouseEnter: fa(m, g),
      onMouseLeave: fa(y, S),
      onTouchStart: fa(f, g)
    }
  ] : [!1, p, {}];
}
function fa(t, e) {
  return (n) => {
    t && t(n), n.defaultPrevented || e(n);
  };
}
function zA({ page: t, ...e }) {
  let n = eA(), { router: r } = om(), s = k.useMemo(
    () => cS(r.routes, t, r.basename),
    [r.routes, t, r.basename]
  );
  return s ? n ? /* @__PURE__ */ k.createElement($A, { page: t, matches: s, ...e }) : /* @__PURE__ */ k.createElement(HA, { page: t, matches: s, ...e }) : null;
}
function UA(t) {
  let { manifest: e, routeModules: n } = lm(), [r, s] = k.useState([]);
  return k.useEffect(() => {
    let a = !1;
    return OA(t, e, n).then(
      (l) => {
        a || s(l);
      }
    ), () => {
      a = !0;
    };
  }, [t, e, n]), r;
}
function $A({
  page: t,
  matches: e,
  ...n
}) {
  let r = kr(), { future: s } = lm(), { basename: a } = om(), l = k.useMemo(() => {
    if (t === r.pathname + r.search + r.hash)
      return [];
    let c = kS(
      t,
      a,
      s.v8_trailingSlashAwareDataRequests,
      "rsc"
    ), d = !1, m = [];
    for (let y of e)
      typeof y.route.shouldRevalidate == "function" ? d = !0 : m.push(y.route.id);
    return d && m.length > 0 && c.searchParams.set("_routes", m.join(",")), [c.pathname + c.search];
  }, [
    a,
    s.v8_trailingSlashAwareDataRequests,
    t,
    r,
    e
  ]);
  return /* @__PURE__ */ k.createElement(k.Fragment, null, l.map((c) => /* @__PURE__ */ k.createElement("link", { key: c, rel: "prefetch", as: "fetch", href: c, ...n })));
}
function HA({
  page: t,
  matches: e,
  ...n
}) {
  let r = kr(), { future: s, manifest: a, routeModules: l } = lm(), { basename: c } = om(), { loaderData: d, matches: m } = VA(), y = k.useMemo(
    () => k0(
      t,
      e,
      m,
      a,
      r,
      "data"
    ),
    [t, e, m, a, r]
  ), f = k.useMemo(
    () => k0(
      t,
      e,
      m,
      a,
      r,
      "assets"
    ),
    [t, e, m, a, r]
  ), p = k.useMemo(() => {
    if (t === r.pathname + r.search + r.hash)
      return [];
    let _ = /* @__PURE__ */ new Set(), x = !1;
    if (e.forEach((E) => {
      var b;
      let A = a.routes[E.route.id];
      !A || !A.hasLoader || (!y.some((M) => M.route.id === E.route.id) && E.route.id in d && ((b = l[E.route.id]) != null && b.shouldRevalidate) || A.hasClientLoader ? x = !0 : _.add(E.route.id));
    }), _.size === 0)
      return [];
    let T = kS(
      t,
      c,
      s.v8_trailingSlashAwareDataRequests,
      "data"
    );
    return x && _.size > 0 && T.searchParams.set(
      "_routes",
      e.filter((E) => _.has(E.route.id)).map((E) => E.route.id).join(",")
    ), [T.pathname + T.search];
  }, [
    c,
    s.v8_trailingSlashAwareDataRequests,
    d,
    r,
    a,
    y,
    e,
    t,
    l
  ]), g = k.useMemo(
    () => IA(f, a),
    [f, a]
  ), S = UA(f);
  return /* @__PURE__ */ k.createElement(k.Fragment, null, p.map((_) => /* @__PURE__ */ k.createElement("link", { key: _, rel: "prefetch", as: "fetch", href: _, ...n })), g.map((_) => /* @__PURE__ */ k.createElement("link", { key: _, rel: "modulepreload", href: _, ...n })), S.map(({ key: _, link: x }) => (
    // these don't spread `linkProps` because they are full link descriptors
    // already with their own props
    /* @__PURE__ */ k.createElement(
      "link",
      {
        key: _,
        nonce: n.nonce,
        ...x,
        crossOrigin: x.crossOrigin ?? n.crossOrigin
      }
    )
  )));
}
function WA(...t) {
  return (e) => {
    t.forEach((n) => {
      typeof n == "function" ? n(e) : n != null && (n.current = e);
    });
  };
}
var GA = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
try {
  GA && (window.__reactRouterVersion = // @ts-expect-error
  "7.17.0");
} catch {
}
function KA({
  basename: t,
  children: e,
  useTransitions: n,
  window: r
}) {
  let s = k.useRef();
  s.current == null && (s.current = PE({ window: r, v5Compat: !0 }));
  let a = s.current, [l, c] = k.useState({
    action: a.action,
    location: a.location
  }), d = k.useCallback(
    (m) => {
      n === !1 ? c(m) : k.startTransition(() => c(m));
    },
    [n]
  );
  return k.useLayoutEffect(() => a.listen(d), [a, d]), /* @__PURE__ */ k.createElement(
    TA,
    {
      basename: t,
      children: e,
      location: l.location,
      navigationType: l.action,
      navigator: a,
      useTransitions: n
    }
  );
}
var PS = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i, ES = k.forwardRef(
  function({
    onClick: e,
    discover: n = "render",
    prefetch: r = "none",
    relative: s,
    reloadDocument: a,
    replace: l,
    mask: c,
    state: d,
    target: m,
    to: y,
    preventScrollReset: f,
    viewTransition: p,
    defaultShouldRevalidate: g,
    ...S
  }, _) {
    let { basename: x, navigator: T, useTransitions: E } = k.useContext(kn), A = typeof y == "string" && PS.test(y), b = yS(y, x);
    y = b.to;
    let M = aA(y, { relative: s }), B = kr(), I = null;
    if (c) {
      let ue = tm(
        c,
        [],
        B.mask ? B.mask.pathname : "/",
        !0
      );
      x !== "/" && (ue.pathname = ue.pathname === "/" ? x : Nn([x, ue.pathname])), I = T.createHref(ue);
    }
    let [O, L, $] = BA(
      r,
      S
    ), q = qA(y, {
      replace: l,
      mask: c,
      state: d,
      target: m,
      preventScrollReset: f,
      relative: s,
      viewTransition: p,
      defaultShouldRevalidate: g,
      useTransitions: E
    });
    function J(ue) {
      e && e(ue), ue.defaultPrevented || q(ue);
    }
    let ie = !(b.isExternal || a), re = (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      /* @__PURE__ */ k.createElement(
        "a",
        {
          ...S,
          ...$,
          href: (ie ? I : void 0) || b.absoluteURL || M,
          onClick: ie ? J : e,
          ref: WA(_, L),
          target: m,
          "data-discover": !A && n === "render" ? "true" : void 0
        }
      )
    );
    return O && !A ? /* @__PURE__ */ k.createElement(k.Fragment, null, re, /* @__PURE__ */ k.createElement(zA, { page: M })) : re;
  }
);
ES.displayName = "Link";
var QA = k.forwardRef(
  function({
    "aria-current": e = "page",
    caseSensitive: n = !1,
    className: r = "",
    end: s = !1,
    style: a,
    to: l,
    viewTransition: c,
    children: d,
    ...m
  }, y) {
    let f = el(l, { relative: m.relative }), p = kr(), g = k.useContext(Dc), { navigator: S, basename: _ } = k.useContext(kn), x = g != null && // Conditional usage is OK here because the usage of a data router is static
    // eslint-disable-next-line react-hooks/rules-of-hooks
    nb(f) && c === !0, T = S.encodeLocation ? S.encodeLocation(f).pathname : f.pathname, E = p.pathname, A = g && g.navigation && g.navigation.location ? g.navigation.location.pathname : null;
    n || (E = E.toLowerCase(), A = A ? A.toLowerCase() : null, T = T.toLowerCase()), A && _ && (A = Sr(A, _) || A);
    const b = T !== "/" && T.endsWith("/") ? T.length - 1 : T.length;
    let M = E === T || !s && E.startsWith(T) && E.charAt(b) === "/", B = A != null && (A === T || !s && A.startsWith(T) && A.charAt(T.length) === "/"), I = {
      isActive: M,
      isPending: B,
      isTransitioning: x
    }, O = M ? e : void 0, L;
    typeof r == "function" ? L = r(I) : L = [
      r,
      M ? "active" : null,
      B ? "pending" : null,
      x ? "transitioning" : null
    ].filter(Boolean).join(" ");
    let $ = typeof a == "function" ? a(I) : a;
    return /* @__PURE__ */ k.createElement(
      ES,
      {
        ...m,
        "aria-current": O,
        className: L,
        ref: y,
        style: $,
        to: l,
        viewTransition: c
      },
      typeof d == "function" ? d(I) : d
    );
  }
);
QA.displayName = "NavLink";
var YA = k.forwardRef(
  ({
    discover: t = "render",
    fetcherKey: e,
    navigate: n,
    reloadDocument: r,
    replace: s,
    state: a,
    method: l = Hu,
    action: c,
    onSubmit: d,
    relative: m,
    preventScrollReset: y,
    viewTransition: f,
    defaultShouldRevalidate: p,
    ...g
  }, S) => {
    let { useTransitions: _ } = k.useContext(kn), x = eb(), T = tb(c, { relative: m }), E = l.toLowerCase() === "get" ? "get" : "post", A = typeof c == "string" && PS.test(c), b = (M) => {
      if (d && d(M), M.defaultPrevented) return;
      M.preventDefault();
      let B = M.nativeEvent.submitter, I = (B == null ? void 0 : B.getAttribute("formmethod")) || l, O = () => x(B || M.currentTarget, {
        fetcherKey: e,
        method: I,
        navigate: n,
        replace: s,
        state: a,
        relative: m,
        preventScrollReset: y,
        viewTransition: f,
        defaultShouldRevalidate: p
      });
      _ && n !== !1 ? k.startTransition(() => O()) : O();
    };
    return /* @__PURE__ */ k.createElement(
      "form",
      {
        ref: S,
        method: E,
        action: T,
        onSubmit: r ? d : b,
        ...g,
        "data-discover": !A && t === "render" ? "true" : void 0
      }
    );
  }
);
YA.displayName = "Form";
function XA(t) {
  return `${t} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function AS(t) {
  let e = k.useContext(wo);
  return lt(e, XA(t)), e;
}
function qA(t, {
  target: e,
  replace: n,
  mask: r,
  state: s,
  preventScrollReset: a,
  relative: l,
  viewTransition: c,
  defaultShouldRevalidate: d,
  useTransitions: m
} = {}) {
  let y = lA(), f = kr(), p = el(t, { relative: l });
  return k.useCallback(
    (g) => {
      if (AA(g, e)) {
        g.preventDefault();
        let S = n !== void 0 ? n : Ra(f) === Ra(p), _ = () => y(t, {
          replace: S,
          mask: r,
          state: s,
          preventScrollReset: a,
          relative: l,
          viewTransition: c,
          defaultShouldRevalidate: d
        });
        m ? k.startTransition(() => _()) : _();
      }
    },
    [
      f,
      y,
      p,
      n,
      r,
      s,
      e,
      t,
      a,
      l,
      c,
      d,
      m
    ]
  );
}
var ZA = 0, JA = () => `__${String(++ZA)}__`;
function eb() {
  let { router: t } = AS(
    "useSubmit"
    /* UseSubmit */
  ), { basename: e } = k.useContext(kn), n = _A(), r = t.fetch, s = t.navigate;
  return k.useCallback(
    async (a, l = {}) => {
      let { action: c, method: d, encType: m, formData: y, body: f } = MA(
        a,
        e
      );
      if (l.navigate === !1) {
        let p = l.fetcherKey || JA();
        await r(p, n, l.action || c, {
          defaultShouldRevalidate: l.defaultShouldRevalidate,
          preventScrollReset: l.preventScrollReset,
          formData: y,
          body: f,
          formMethod: l.method || d,
          formEncType: l.encType || m,
          flushSync: l.flushSync
        });
      } else
        await s(l.action || c, {
          defaultShouldRevalidate: l.defaultShouldRevalidate,
          preventScrollReset: l.preventScrollReset,
          formData: y,
          body: f,
          formMethod: l.method || d,
          formEncType: l.encType || m,
          replace: l.replace,
          state: l.state,
          fromRouteId: n,
          flushSync: l.flushSync,
          viewTransition: l.viewTransition
        });
    },
    [r, s, e, n]
  );
}
function tb(t, { relative: e } = {}) {
  let { basename: n } = k.useContext(kn), r = k.useContext(Cr);
  lt(r, "useFormAction must be used inside a RouteContext");
  let [s] = r.matches.slice(-1), a = { ...el(t || ".", { relative: e }) }, l = kr();
  if (t == null) {
    a.search = l.search;
    let c = new URLSearchParams(a.search), d = c.getAll("index");
    if (d.some((y) => y === "")) {
      c.delete("index"), d.filter((f) => f).forEach((f) => c.append("index", f));
      let y = c.toString();
      a.search = y ? `?${y}` : "";
    }
  }
  return (!t || t === ".") && s.route.index && (a.search = a.search ? a.search.replace(/^\?/, "?index&") : "?index"), n !== "/" && (a.pathname = a.pathname === "/" ? n : Nn([n, a.pathname])), Ra(a);
}
function nb(t, { relative: e } = {}) {
  let n = k.useContext(_S);
  lt(
    n != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?"
  );
  let { basename: r } = AS(
    "useViewTransitionState"
    /* useViewTransitionState */
  ), s = el(t, { relative: e });
  if (!n.isTransitioning)
    return !1;
  let a = Sr(n.currentLocation.pathname, r) || n.currentLocation.pathname, l = Sr(n.nextLocation.pathname, r) || n.nextLocation.pathname;
  return ac(s.pathname, l) != null || ac(s.pathname, a) != null;
}
var bS = uS(), eh = { exports: {} }, da = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var P0;
function rb() {
  if (P0) return da;
  P0 = 1;
  var t = Jp(), e = Symbol.for("react.element"), n = Symbol.for("react.fragment"), r = Object.prototype.hasOwnProperty, s = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, a = { key: !0, ref: !0, __self: !0, __source: !0 };
  function l(c, d, m) {
    var y, f = {}, p = null, g = null;
    m !== void 0 && (p = "" + m), d.key !== void 0 && (p = "" + d.key), d.ref !== void 0 && (g = d.ref);
    for (y in d) r.call(d, y) && !a.hasOwnProperty(y) && (f[y] = d[y]);
    if (c && c.defaultProps) for (y in d = c.defaultProps, d) f[y] === void 0 && (f[y] = d[y]);
    return { $$typeof: e, type: c, key: p, ref: g, props: f, _owner: s.current };
  }
  return da.Fragment = n, da.jsx = l, da.jsxs = l, da;
}
var E0;
function ib() {
  return E0 || (E0 = 1, eh.exports = rb()), eh.exports;
}
var C = ib();
const um = k.createContext({});
function cm(t) {
  const e = k.useRef(null);
  return e.current === null && (e.current = t()), e.current;
}
const sb = typeof window < "u", RS = sb ? k.useLayoutEffect : k.useEffect, Ic = /* @__PURE__ */ k.createContext(null);
function fm(t, e) {
  t.indexOf(e) === -1 && t.push(e);
}
function uc(t, e) {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}
const rr = (t, e, n) => n > e ? e : n < t ? t : n;
function A0(t, e) {
  return e ? `${t}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${e}` : t;
}
let tl = () => {
}, is = () => {
};
var Yw;
typeof process < "u" && ((Yw = process.env) == null ? void 0 : Yw.NODE_ENV) !== "production" && (tl = (t, e, n) => {
  !t && typeof console < "u" && console.warn(A0(e, n));
}, is = (t, e, n) => {
  if (!t)
    throw new Error(A0(e, n));
});
const ui = {}, MS = (t) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t), DS = (t) => typeof t == "object" && t !== null, FS = (t) => /^0[^.\s]+$/u.test(t);
// @__NO_SIDE_EFFECTS__
function OS(t) {
  let e;
  return () => (e === void 0 && (e = t()), e);
}
const Cn = /* @__NO_SIDE_EFFECTS__ */ (t) => t, nl = (...t) => t.reduce((e, n) => (r) => n(e(r))), Ma = /* @__NO_SIDE_EFFECTS__ */ (t, e, n) => {
  const r = e - t;
  return r ? (n - t) / r : 1;
};
class dm {
  constructor() {
    this.subscriptions = [];
  }
  add(e) {
    return fm(this.subscriptions, e), () => uc(this.subscriptions, e);
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
const Wt = /* @__NO_SIDE_EFFECTS__ */ (t) => t * 1e3, Sn = /* @__NO_SIDE_EFFECTS__ */ (t) => t / 1e3, IS = /* @__NO_SIDE_EFFECTS__ */ (t, e) => e ? t * (1e3 / e) : 0, NS = (t, e, n) => (((1 - 3 * n + 3 * e) * t + (3 * n - 6 * e)) * t + 3 * e) * t, ob = 1e-7, ab = 12;
function lb(t, e, n, r, s) {
  let a, l, c = 0;
  do
    l = e + (n - e) / 2, a = NS(l, r, s) - t, a > 0 ? n = l : e = l;
  while (Math.abs(a) > ob && ++c < ab);
  return l;
}
// @__NO_SIDE_EFFECTS__
function rl(t, e, n, r) {
  if (t === e && n === r)
    return Cn;
  const s = (a) => lb(a, 0, 1, t, n);
  return (a) => a === 0 || a === 1 ? a : NS(s(a), e, r);
}
const LS = /* @__NO_SIDE_EFFECTS__ */ (t) => (e) => e <= 0.5 ? t(2 * e) / 2 : (2 - t(2 * (1 - e))) / 2, jS = /* @__NO_SIDE_EFFECTS__ */ (t) => (e) => 1 - t(1 - e), VS = /* @__PURE__ */ rl(0.33, 1.53, 0.69, 0.99), hm = /* @__PURE__ */ jS(VS), BS = /* @__PURE__ */ LS(hm), zS = (t) => t >= 1 ? 1 : (t *= 2) < 1 ? 0.5 * hm(t) : 0.5 * (2 - Math.pow(2, -10 * (t - 1))), pm = (t) => 1 - Math.sin(Math.acos(t)), US = /* @__PURE__ */ jS(pm), $S = /* @__PURE__ */ LS(pm), ub = /* @__PURE__ */ rl(0.42, 0, 1, 1), cb = /* @__PURE__ */ rl(0, 0, 0.58, 1), HS = /* @__PURE__ */ rl(0.42, 0, 0.58, 1), fb = /* @__NO_SIDE_EFFECTS__ */ (t) => Array.isArray(t) && typeof t[0] != "number", WS = /* @__NO_SIDE_EFFECTS__ */ (t) => Array.isArray(t) && typeof t[0] == "number", b0 = {
  linear: Cn,
  easeIn: ub,
  easeInOut: HS,
  easeOut: cb,
  circIn: pm,
  circInOut: $S,
  circOut: US,
  backIn: hm,
  backInOut: BS,
  backOut: VS,
  anticipate: zS
}, db = (t) => typeof t == "string", R0 = (t) => {
  if (/* @__PURE__ */ WS(t)) {
    is(t.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [e, n, r, s] = t;
    return /* @__PURE__ */ rl(e, n, r, s);
  } else if (db(t))
    return is(b0[t] !== void 0, `Invalid easing type '${t}'`, "invalid-easing-type"), b0[t];
  return t;
}, Au = [
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
function hb(t, e) {
  let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), s = !1, a = !1;
  const l = /* @__PURE__ */ new WeakSet();
  let c = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function d(y) {
    l.has(y) && (m.schedule(y), t()), y(c);
  }
  const m = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (y, f = !1, p = !1) => {
      const S = p && s ? n : r;
      return f && l.add(y), S.add(y), y;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (y) => {
      r.delete(y), l.delete(y);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (y) => {
      if (c = y, s) {
        a = !0;
        return;
      }
      s = !0;
      const f = n;
      n = r, r = f, n.forEach(d), n.clear(), s = !1, a && (a = !1, m.process(y));
    }
  };
  return m;
}
const pb = 40;
function GS(t, e) {
  let n = !1, r = !0;
  const s = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, a = () => n = !0, l = Au.reduce((A, b) => (A[b] = hb(a), A), {}), { setup: c, read: d, resolveKeyframes: m, preUpdate: y, update: f, preRender: p, render: g, postRender: S } = l, _ = () => {
    const A = ui.useManualTiming, b = A ? s.timestamp : performance.now();
    n = !1, A || (s.delta = r ? 1e3 / 60 : Math.max(Math.min(b - s.timestamp, pb), 1)), s.timestamp = b, s.isProcessing = !0, c.process(s), d.process(s), m.process(s), y.process(s), f.process(s), p.process(s), g.process(s), S.process(s), s.isProcessing = !1, n && e && (r = !1, t(_));
  }, x = () => {
    n = !0, r = !0, s.isProcessing || t(_);
  };
  return { schedule: Au.reduce((A, b) => {
    const M = l[b];
    return A[b] = (B, I = !1, O = !1) => (n || x(), M.schedule(B, I, O)), A;
  }, {}), cancel: (A) => {
    for (let b = 0; b < Au.length; b++)
      l[Au[b]].cancel(A);
  }, state: s, steps: l };
}
const { schedule: Oe, cancel: ci, state: gt, steps: th } = /* @__PURE__ */ GS(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Cn, !0);
let Gu;
function mb() {
  Gu = void 0;
}
const Dt = {
  now: () => (Gu === void 0 && Dt.set(gt.isProcessing || ui.useManualTiming ? gt.timestamp : performance.now()), Gu),
  set: (t) => {
    Gu = t, queueMicrotask(mb);
  }
}, KS = (t) => (e) => typeof e == "string" && e.startsWith(t), QS = /* @__PURE__ */ KS("--"), yb = /* @__PURE__ */ KS("var(--"), mm = (t) => yb(t) ? gb.test(t.split("/*")[0].trim()) : !1, gb = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function M0(t) {
  return typeof t != "string" ? !1 : t.split("/*")[0].includes("var(--");
}
const So = {
  test: (t) => typeof t == "number",
  parse: parseFloat,
  transform: (t) => t
}, Da = {
  ...So,
  transform: (t) => rr(0, 1, t)
}, bu = {
  ...So,
  default: 1
}, wa = (t) => Math.round(t * 1e5) / 1e5, ym = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function vb(t) {
  return t == null;
}
const _b = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, gm = (t, e) => (n) => !!(typeof n == "string" && _b.test(n) && n.startsWith(t) || e && !vb(n) && Object.prototype.hasOwnProperty.call(n, e)), YS = (t, e, n) => (r) => {
  if (typeof r != "string")
    return r;
  const [s, a, l, c] = r.match(ym);
  return {
    [t]: parseFloat(s),
    [e]: parseFloat(a),
    [n]: parseFloat(l),
    alpha: c !== void 0 ? parseFloat(c) : 1
  };
}, wb = (t) => rr(0, 255, t), nh = {
  ...So,
  transform: (t) => Math.round(wb(t))
}, Vi = {
  test: /* @__PURE__ */ gm("rgb", "red"),
  parse: /* @__PURE__ */ YS("red", "green", "blue"),
  transform: ({ red: t, green: e, blue: n, alpha: r = 1 }) => "rgba(" + nh.transform(t) + ", " + nh.transform(e) + ", " + nh.transform(n) + ", " + wa(Da.transform(r)) + ")"
};
function Sb(t) {
  let e = "", n = "", r = "", s = "";
  return t.length > 5 ? (e = t.substring(1, 3), n = t.substring(3, 5), r = t.substring(5, 7), s = t.substring(7, 9)) : (e = t.substring(1, 2), n = t.substring(2, 3), r = t.substring(3, 4), s = t.substring(4, 5), e += e, n += n, r += r, s += s), {
    red: parseInt(e, 16),
    green: parseInt(n, 16),
    blue: parseInt(r, 16),
    alpha: s ? parseInt(s, 16) / 255 : 1
  };
}
const Ih = {
  test: /* @__PURE__ */ gm("#"),
  parse: Sb,
  transform: Vi.transform
}, il = /* @__NO_SIDE_EFFECTS__ */ (t) => ({
  test: (e) => typeof e == "string" && e.endsWith(t) && e.split(" ").length === 1,
  parse: parseFloat,
  transform: (e) => `${e}${t}`
}), hr = /* @__PURE__ */ il("deg"), nr = /* @__PURE__ */ il("%"), ae = /* @__PURE__ */ il("px"), xb = /* @__PURE__ */ il("vh"), Tb = /* @__PURE__ */ il("vw"), D0 = {
  ...nr,
  parse: (t) => nr.parse(t) / 100,
  transform: (t) => nr.transform(t * 100)
}, js = {
  test: /* @__PURE__ */ gm("hsl", "hue"),
  parse: /* @__PURE__ */ YS("hue", "saturation", "lightness"),
  transform: ({ hue: t, saturation: e, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(t) + ", " + nr.transform(wa(e)) + ", " + nr.transform(wa(n)) + ", " + wa(Da.transform(r)) + ")"
}, nt = {
  test: (t) => Vi.test(t) || Ih.test(t) || js.test(t),
  parse: (t) => Vi.test(t) ? Vi.parse(t) : js.test(t) ? js.parse(t) : Ih.parse(t),
  transform: (t) => typeof t == "string" ? t : t.hasOwnProperty("red") ? Vi.transform(t) : js.transform(t),
  getAnimatableNone: (t) => {
    const e = nt.parse(t);
    return e.alpha = 0, nt.transform(e);
  }
}, Cb = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function kb(t) {
  var e, n;
  return isNaN(t) && typeof t == "string" && (((e = t.match(ym)) == null ? void 0 : e.length) || 0) + (((n = t.match(Cb)) == null ? void 0 : n.length) || 0) > 0;
}
const XS = "number", qS = "color", Pb = "var", Eb = "var(", F0 = "${}", Ab = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function ao(t) {
  const e = t.toString(), n = [], r = {
    color: [],
    number: [],
    var: []
  }, s = [];
  let a = 0;
  const c = e.replace(Ab, (d) => (nt.test(d) ? (r.color.push(a), s.push(qS), n.push(nt.parse(d))) : d.startsWith(Eb) ? (r.var.push(a), s.push(Pb), n.push(d)) : (r.number.push(a), s.push(XS), n.push(parseFloat(d))), ++a, F0)).split(F0);
  return { values: n, split: c, indexes: r, types: s };
}
function bb(t) {
  return ao(t).values;
}
function ZS({ split: t, types: e }) {
  const n = t.length;
  return (r) => {
    let s = "";
    for (let a = 0; a < n; a++)
      if (s += t[a], r[a] !== void 0) {
        const l = e[a];
        l === XS ? s += wa(r[a]) : l === qS ? s += nt.transform(r[a]) : s += r[a];
      }
    return s;
  };
}
function Rb(t) {
  return ZS(ao(t));
}
const Mb = (t) => typeof t == "number" ? 0 : nt.test(t) ? nt.getAnimatableNone(t) : t, Db = (t, e) => typeof t == "number" ? e != null && e.trim().endsWith("/") ? t : 0 : Mb(t);
function Fb(t) {
  const e = ao(t);
  return ZS(e)(e.values.map((r, s) => Db(r, e.split[s])));
}
const Ln = {
  test: kb,
  parse: bb,
  createTransformer: Rb,
  getAnimatableNone: Fb
};
function rh(t, e, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? t + (e - t) * 6 * n : n < 1 / 2 ? e : n < 2 / 3 ? t + (e - t) * (2 / 3 - n) * 6 : t;
}
function Ob({ hue: t, saturation: e, lightness: n, alpha: r }) {
  t /= 360, e /= 100, n /= 100;
  let s = 0, a = 0, l = 0;
  if (!e)
    s = a = l = n;
  else {
    const c = n < 0.5 ? n * (1 + e) : n + e - n * e, d = 2 * n - c;
    s = rh(d, c, t + 1 / 3), a = rh(d, c, t), l = rh(d, c, t - 1 / 3);
  }
  return {
    red: Math.round(s * 255),
    green: Math.round(a * 255),
    blue: Math.round(l * 255),
    alpha: r
  };
}
function cc(t, e) {
  return (n) => n > 0 ? e : t;
}
const Fe = (t, e, n) => t + (e - t) * n, ih = (t, e, n) => {
  const r = t * t, s = n * (e * e - r) + r;
  return s < 0 ? 0 : Math.sqrt(s);
}, Ib = [Ih, Vi, js], Nb = (t) => Ib.find((e) => e.test(t));
function O0(t) {
  const e = Nb(t);
  if (tl(!!e, `'${t}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !e)
    return !1;
  let n = e.parse(t);
  return e === js && (n = Ob(n)), n;
}
const I0 = (t, e) => {
  const n = O0(t), r = O0(e);
  if (!n || !r)
    return cc(t, e);
  const s = { ...n };
  return (a) => (s.red = ih(n.red, r.red, a), s.green = ih(n.green, r.green, a), s.blue = ih(n.blue, r.blue, a), s.alpha = Fe(n.alpha, r.alpha, a), Vi.transform(s));
}, Nh = /* @__PURE__ */ new Set(["none", "hidden"]);
function Lb(t, e) {
  return Nh.has(t) ? (n) => n <= 0 ? t : e : (n) => n >= 1 ? e : t;
}
function jb(t, e) {
  return (n) => Fe(t, e, n);
}
function vm(t) {
  return typeof t == "number" ? jb : typeof t == "string" ? mm(t) ? cc : nt.test(t) ? I0 : zb : Array.isArray(t) ? JS : typeof t == "object" ? nt.test(t) ? I0 : Vb : cc;
}
function JS(t, e) {
  const n = [...t], r = n.length, s = t.map((a, l) => vm(a)(a, e[l]));
  return (a) => {
    for (let l = 0; l < r; l++)
      n[l] = s[l](a);
    return n;
  };
}
function Vb(t, e) {
  const n = { ...t, ...e }, r = {};
  for (const s in n)
    t[s] !== void 0 && e[s] !== void 0 && (r[s] = vm(t[s])(t[s], e[s]));
  return (s) => {
    for (const a in r)
      n[a] = r[a](s);
    return n;
  };
}
function Bb(t, e) {
  const n = [], r = { color: 0, var: 0, number: 0 };
  for (let s = 0; s < e.values.length; s++) {
    const a = e.types[s], l = t.indexes[a][r[a]], c = t.values[l] ?? 0;
    n[s] = c, r[a]++;
  }
  return n;
}
const zb = (t, e) => {
  const n = Ln.createTransformer(e), r = ao(t), s = ao(e);
  return r.indexes.var.length === s.indexes.var.length && r.indexes.color.length === s.indexes.color.length && r.indexes.number.length >= s.indexes.number.length ? Nh.has(t) && !s.values.length || Nh.has(e) && !r.values.length ? Lb(t, e) : nl(JS(Bb(r, s), s.values), n) : (tl(!0, `Complex values '${t}' and '${e}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), cc(t, e));
};
function ex(t, e, n) {
  return typeof t == "number" && typeof e == "number" && typeof n == "number" ? Fe(t, e, n) : vm(t)(t, e);
}
const Ub = (t) => {
  const e = ({ timestamp: n }) => t(n);
  return {
    start: (n = !0) => Oe.update(e, n),
    stop: () => ci(e),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => gt.isProcessing ? gt.timestamp : Dt.now()
  };
}, tx = (t, e, n = 10) => {
  let r = "";
  const s = Math.max(Math.round(e / n), 2);
  for (let a = 0; a < s; a++)
    r += Math.round(t(a / (s - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${r.substring(0, r.length - 2)})`;
}, fc = 2e4;
function _m(t) {
  let e = 0;
  const n = 50;
  let r = t.next(e);
  for (; !r.done && e < fc; )
    e += n, r = t.next(e);
  return e >= fc ? 1 / 0 : e;
}
function $b(t, e = 100, n) {
  const r = n({ ...t, keyframes: [0, e] }), s = Math.min(_m(r), fc);
  return {
    type: "keyframes",
    ease: (a) => r.next(s * a).value / e,
    duration: /* @__PURE__ */ Sn(s)
  };
}
const He = {
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
function Lh(t, e) {
  return t * Math.sqrt(1 - e * e);
}
const Hb = 12;
function Wb(t, e, n) {
  let r = n;
  for (let s = 1; s < Hb; s++)
    r = r - t(r) / e(r);
  return r;
}
const sh = 1e-3;
function Gb({ duration: t = He.duration, bounce: e = He.bounce, velocity: n = He.velocity, mass: r = He.mass }) {
  let s, a;
  tl(t <= /* @__PURE__ */ Wt(He.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let l = 1 - e;
  l = rr(He.minDamping, He.maxDamping, l), t = rr(He.minDuration, He.maxDuration, /* @__PURE__ */ Sn(t)), l < 1 ? (s = (m) => {
    const y = m * l, f = y * t, p = y - n, g = Lh(m, l), S = Math.exp(-f);
    return sh - p / g * S;
  }, a = (m) => {
    const f = m * l * t, p = f * n + n, g = Math.pow(l, 2) * Math.pow(m, 2) * t, S = Math.exp(-f), _ = Lh(Math.pow(m, 2), l);
    return (-s(m) + sh > 0 ? -1 : 1) * ((p - g) * S) / _;
  }) : (s = (m) => {
    const y = Math.exp(-m * t), f = (m - n) * t + 1;
    return -sh + y * f;
  }, a = (m) => {
    const y = Math.exp(-m * t), f = (n - m) * (t * t);
    return y * f;
  });
  const c = 5 / t, d = Wb(s, a, c);
  if (t = /* @__PURE__ */ Wt(t), isNaN(d))
    return {
      stiffness: He.stiffness,
      damping: He.damping,
      duration: t
    };
  {
    const m = Math.pow(d, 2) * r;
    return {
      stiffness: m,
      damping: l * 2 * Math.sqrt(r * m),
      duration: t
    };
  }
}
const Kb = ["duration", "bounce"], Qb = ["stiffness", "damping", "mass"];
function N0(t, e) {
  return e.some((n) => t[n] !== void 0);
}
function Yb(t) {
  let e = {
    velocity: He.velocity,
    stiffness: He.stiffness,
    damping: He.damping,
    mass: He.mass,
    isResolvedFromDuration: !1,
    ...t
  };
  if (!N0(t, Qb) && N0(t, Kb))
    if (e.velocity = 0, t.visualDuration) {
      const n = t.visualDuration, r = 2 * Math.PI / (n * 1.2), s = r * r, a = 2 * rr(0.05, 1, 1 - (t.bounce || 0)) * Math.sqrt(s);
      e = {
        ...e,
        mass: He.mass,
        stiffness: s,
        damping: a
      };
    } else {
      const n = Gb({ ...t, velocity: 0 });
      e = {
        ...e,
        ...n,
        mass: He.mass
      }, e.isResolvedFromDuration = !0;
    }
  return e;
}
function dc(t = He.visualDuration, e = He.bounce) {
  const n = typeof t != "object" ? {
    visualDuration: t,
    keyframes: [0, 1],
    bounce: e
  } : t;
  let { restSpeed: r, restDelta: s } = n;
  const a = n.keyframes[0], l = n.keyframes[n.keyframes.length - 1], c = { done: !1, value: a }, { stiffness: d, damping: m, mass: y, duration: f, velocity: p, isResolvedFromDuration: g } = Yb({
    ...n,
    velocity: -/* @__PURE__ */ Sn(n.velocity || 0)
  }), S = p || 0, _ = m / (2 * Math.sqrt(d * y)), x = l - a, T = /* @__PURE__ */ Sn(Math.sqrt(d / y)), E = Math.abs(x) < 5;
  r || (r = E ? He.restSpeed.granular : He.restSpeed.default), s || (s = E ? He.restDelta.granular : He.restDelta.default);
  let A, b, M, B, I, O;
  if (_ < 1)
    M = Lh(T, _), B = (S + _ * T * x) / M, A = ($) => {
      const q = Math.exp(-_ * T * $);
      return l - q * (B * Math.sin(M * $) + x * Math.cos(M * $));
    }, I = _ * T * B + x * M, O = _ * T * x - B * M, b = ($) => Math.exp(-_ * T * $) * (I * Math.sin(M * $) + O * Math.cos(M * $));
  else if (_ === 1) {
    A = (q) => l - Math.exp(-T * q) * (x + (S + T * x) * q);
    const $ = S + T * x;
    b = (q) => Math.exp(-T * q) * (T * $ * q - S);
  } else {
    const $ = T * Math.sqrt(_ * _ - 1);
    A = (re) => {
      const ue = Math.exp(-_ * T * re), fe = Math.min($ * re, 300);
      return l - ue * ((S + _ * T * x) * Math.sinh(fe) + $ * x * Math.cosh(fe)) / $;
    };
    const q = (S + _ * T * x) / $, J = _ * T * q - x * $, ie = _ * T * x - q * $;
    b = (re) => {
      const ue = Math.exp(-_ * T * re), fe = Math.min($ * re, 300);
      return ue * (J * Math.sinh(fe) + ie * Math.cosh(fe));
    };
  }
  const L = {
    calculatedDuration: g && f || null,
    velocity: ($) => /* @__PURE__ */ Wt(b($)),
    next: ($) => {
      if (!g && _ < 1) {
        const J = Math.exp(-_ * T * $), ie = Math.sin(M * $), re = Math.cos(M * $), ue = l - J * (B * ie + x * re), fe = /* @__PURE__ */ Wt(J * (I * ie + O * re));
        return c.done = Math.abs(fe) <= r && Math.abs(l - ue) <= s, c.value = c.done ? l : ue, c;
      }
      const q = A($);
      if (g)
        c.done = $ >= f;
      else {
        const J = /* @__PURE__ */ Wt(b($));
        c.done = Math.abs(J) <= r && Math.abs(l - q) <= s;
      }
      return c.value = c.done ? l : q, c;
    },
    toString: () => {
      const $ = Math.min(_m(L), fc), q = tx((J) => L.next($ * J).value, $, 30);
      return $ + "ms " + q;
    },
    toTransition: () => {
    }
  };
  return L;
}
dc.applyToOptions = (t) => {
  const e = $b(t, 100, dc);
  return t.ease = e.ease, t.duration = /* @__PURE__ */ Wt(e.duration), t.type = "keyframes", t;
};
const Xb = 5;
function nx(t, e, n) {
  const r = Math.max(e - Xb, 0);
  return /* @__PURE__ */ IS(n - t(r), e - r);
}
function jh({ keyframes: t, velocity: e = 0, power: n = 0.8, timeConstant: r = 325, bounceDamping: s = 10, bounceStiffness: a = 500, modifyTarget: l, min: c, max: d, restDelta: m = 0.5, restSpeed: y }) {
  const f = t[0], p = {
    done: !1,
    value: f
  }, g = (O) => c !== void 0 && O < c || d !== void 0 && O > d, S = (O) => c === void 0 ? d : d === void 0 || Math.abs(c - O) < Math.abs(d - O) ? c : d;
  let _ = n * e;
  const x = f + _, T = l === void 0 ? x : l(x);
  T !== x && (_ = T - f);
  const E = (O) => -_ * Math.exp(-O / r), A = (O) => T + E(O), b = (O) => {
    const L = E(O), $ = A(O);
    p.done = Math.abs(L) <= m, p.value = p.done ? T : $;
  };
  let M, B;
  const I = (O) => {
    g(p.value) && (M = O, B = dc({
      keyframes: [p.value, S(p.value)],
      velocity: nx(A, O, p.value),
      // TODO: This should be passing * 1000
      damping: s,
      stiffness: a,
      restDelta: m,
      restSpeed: y
    }));
  };
  return I(0), {
    calculatedDuration: null,
    next: (O) => {
      let L = !1;
      return !B && M === void 0 && (L = !0, b(O), I(O)), M !== void 0 && O >= M ? B.next(O - M) : (!L && b(O), p);
    }
  };
}
function qb(t, e, n) {
  const r = [], s = n || ui.mix || ex, a = t.length - 1;
  for (let l = 0; l < a; l++) {
    let c = s(t[l], t[l + 1]);
    if (e) {
      const d = Array.isArray(e) ? e[l] || Cn : e;
      c = nl(d, c);
    }
    r.push(c);
  }
  return r;
}
function Zb(t, e, { clamp: n = !0, ease: r, mixer: s } = {}) {
  const a = t.length;
  if (is(a === e.length, "Both input and output ranges must be the same length", "range-length"), a === 1)
    return () => e[0];
  if (a === 2 && e[0] === e[1])
    return () => e[1];
  const l = t[0] === t[1];
  t[0] > t[a - 1] && (t = [...t].reverse(), e = [...e].reverse());
  const c = qb(e, r, s), d = c.length, m = (y) => {
    if (l && y < t[0])
      return e[0];
    let f = 0;
    if (d > 1)
      for (; f < t.length - 2 && !(y < t[f + 1]); f++)
        ;
    const p = /* @__PURE__ */ Ma(t[f], t[f + 1], y);
    return c[f](p);
  };
  return n ? (y) => m(rr(t[0], t[a - 1], y)) : m;
}
function Jb(t, e) {
  const n = t[t.length - 1];
  for (let r = 1; r <= e; r++) {
    const s = /* @__PURE__ */ Ma(0, e, r);
    t.push(Fe(n, 1, s));
  }
}
function eR(t) {
  const e = [0];
  return Jb(e, t.length - 1), e;
}
function tR(t, e) {
  return t.map((n) => n * e);
}
function nR(t, e) {
  return t.map(() => e || HS).splice(0, t.length - 1);
}
function Sa({ duration: t = 300, keyframes: e, times: n, ease: r = "easeInOut" }) {
  const s = /* @__PURE__ */ fb(r) ? r.map(R0) : R0(r), a = {
    done: !1,
    value: e[0]
  }, l = tR(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === e.length ? n : eR(e),
    t
  ), c = Zb(l, e, {
    ease: Array.isArray(s) ? s : nR(e, s)
  });
  return {
    calculatedDuration: t,
    next: (d) => (a.value = c(d), a.done = d >= t, a)
  };
}
const rR = (t) => t !== null;
function Nc(t, { repeat: e, repeatType: n = "loop" }, r, s = 1) {
  const a = t.filter(rR), c = s < 0 || e && n !== "loop" && e % 2 === 1 ? 0 : a.length - 1;
  return !c || r === void 0 ? a[c] : r;
}
const iR = {
  decay: jh,
  inertia: jh,
  tween: Sa,
  keyframes: Sa,
  spring: dc
};
function rx(t) {
  typeof t.type == "string" && (t.type = iR[t.type]);
}
class wm {
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
const sR = (t) => t / 100;
class hc extends wm {
  constructor(e) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      var r, s;
      const { motionValue: n } = this.options;
      n && n.updatedAt !== Dt.now() && this.tick(Dt.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), (s = (r = this.options).onStop) == null || s.call(r));
    }, this.options = e, this.initAnimation(), this.play(), e.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: e } = this;
    rx(e);
    const { type: n = Sa, repeat: r = 0, repeatDelay: s = 0, repeatType: a, velocity: l = 0 } = e;
    let { keyframes: c } = e;
    const d = n || Sa;
    d !== Sa && typeof c[0] != "number" && (this.mixKeyframes = nl(sR, ex(c[0], c[1])), c = [0, 100]);
    const m = d({ ...e, keyframes: c });
    a === "mirror" && (this.mirroredGenerator = d({
      ...e,
      keyframes: [...c].reverse(),
      velocity: -l
    })), m.calculatedDuration === null && (m.calculatedDuration = _m(m));
    const { calculatedDuration: y } = m;
    this.calculatedDuration = y, this.resolvedDuration = y + s, this.totalDuration = this.resolvedDuration * (r + 1) - s, this.generator = m;
  }
  updateTime(e) {
    const n = Math.round(e - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = n;
  }
  tick(e, n = !1) {
    const { generator: r, totalDuration: s, mixKeyframes: a, mirroredGenerator: l, resolvedDuration: c, calculatedDuration: d } = this;
    if (this.startTime === null)
      return r.next(0);
    const { delay: m = 0, keyframes: y, repeat: f, repeatType: p, repeatDelay: g, type: S, onUpdate: _, finalKeyframe: x } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, e) : this.speed < 0 && (this.startTime = Math.min(e - s / this.speed, this.startTime)), n ? this.currentTime = e : this.updateTime(e);
    const T = this.currentTime - m * (this.playbackSpeed >= 0 ? 1 : -1), E = this.playbackSpeed >= 0 ? T < 0 : T > s;
    this.currentTime = Math.max(T, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = s);
    let A = this.currentTime, b = r;
    if (f) {
      const O = Math.min(this.currentTime, s) / c;
      let L = Math.floor(O), $ = O % 1;
      !$ && O >= 1 && ($ = 1), $ === 1 && L--, L = Math.min(L, f + 1), !!(L % 2) && (p === "reverse" ? ($ = 1 - $, g && ($ -= g / c)) : p === "mirror" && (b = l)), A = rr(0, 1, $) * c;
    }
    let M;
    E ? (this.delayState.value = y[0], M = this.delayState) : M = b.next(A), a && !E && (M.value = a(M.value));
    let { done: B } = M;
    !E && d !== null && (B = this.playbackSpeed >= 0 ? this.currentTime >= s : this.currentTime <= 0);
    const I = this.holdTime === null && (this.state === "finished" || this.state === "running" && B);
    return I && S !== jh && (M.value = Nc(y, this.options, x, this.speed)), _ && _(M.value), I && this.finish(), M;
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
    return /* @__PURE__ */ Sn(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ Sn(e);
  }
  get time() {
    return /* @__PURE__ */ Sn(this.currentTime);
  }
  set time(e) {
    e = /* @__PURE__ */ Wt(e), this.currentTime = e, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = e : this.driver && (this.startTime = this.driver.now() - e / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = e, this.tick(e));
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
    return nx((r) => this.generator.next(r).value, e, n);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(e) {
    const n = this.playbackSpeed !== e;
    n && this.driver && this.updateTime(Dt.now()), this.playbackSpeed = e, n && this.driver && (this.time = /* @__PURE__ */ Sn(this.currentTime));
  }
  play() {
    var s, a;
    if (this.isStopped)
      return;
    const { driver: e = Ub, startTime: n } = this.options;
    this.driver || (this.driver = e((l) => this.tick(l))), (a = (s = this.options).onPlay) == null || a.call(s);
    const r = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = r) : this.holdTime !== null ? this.startTime = r - this.holdTime : this.startTime || (this.startTime = n ?? r), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(Dt.now()), this.holdTime = this.currentTime;
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
function oR(t) {
  for (let e = 1; e < t.length; e++)
    t[e] ?? (t[e] = t[e - 1]);
}
const Bi = (t) => t * 180 / Math.PI, Vh = (t) => {
  const e = Bi(Math.atan2(t[1], t[0]));
  return Bh(e);
}, aR = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (t) => (Math.abs(t[0]) + Math.abs(t[3])) / 2,
  rotate: Vh,
  rotateZ: Vh,
  skewX: (t) => Bi(Math.atan(t[1])),
  skewY: (t) => Bi(Math.atan(t[2])),
  skew: (t) => (Math.abs(t[1]) + Math.abs(t[2])) / 2
}, Bh = (t) => (t = t % 360, t < 0 && (t += 360), t), L0 = Vh, j0 = (t) => Math.sqrt(t[0] * t[0] + t[1] * t[1]), V0 = (t) => Math.sqrt(t[4] * t[4] + t[5] * t[5]), lR = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: j0,
  scaleY: V0,
  scale: (t) => (j0(t) + V0(t)) / 2,
  rotateX: (t) => Bh(Bi(Math.atan2(t[6], t[5]))),
  rotateY: (t) => Bh(Bi(Math.atan2(-t[2], t[0]))),
  rotateZ: L0,
  rotate: L0,
  skewX: (t) => Bi(Math.atan(t[4])),
  skewY: (t) => Bi(Math.atan(t[1])),
  skew: (t) => (Math.abs(t[1]) + Math.abs(t[4])) / 2
};
function zh(t) {
  return t.includes("scale") ? 1 : 0;
}
function Uh(t, e) {
  if (!t || t === "none")
    return zh(e);
  const n = t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let r, s;
  if (n)
    r = lR, s = n;
  else {
    const c = t.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    r = aR, s = c;
  }
  if (!s)
    return zh(e);
  const a = r[e], l = s[1].split(",").map(cR);
  return typeof a == "function" ? a(l) : l[a];
}
const uR = (t, e) => {
  const { transform: n = "none" } = getComputedStyle(t);
  return Uh(n, e);
};
function cR(t) {
  return parseFloat(t.trim());
}
const xo = [
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
], To = /* @__PURE__ */ new Set([...xo, "pathRotation"]), B0 = (t) => t === So || t === ae, fR = /* @__PURE__ */ new Set(["x", "y", "z"]), dR = xo.filter((t) => !fR.has(t));
function hR(t) {
  const e = [];
  return dR.forEach((n) => {
    const r = t.getValue(n);
    r !== void 0 && (e.push([n, r.get()]), r.set(n.startsWith("scale") ? 1 : 0));
  }), e;
}
const ni = {
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
  x: (t, { transform: e }) => Uh(e, "x"),
  y: (t, { transform: e }) => Uh(e, "y")
};
ni.translateX = ni.x;
ni.translateY = ni.y;
const Zi = /* @__PURE__ */ new Set();
let $h = !1, Hh = !1, Wh = !1;
function ix() {
  if (Hh) {
    const t = Array.from(Zi).filter((r) => r.needsMeasurement), e = new Set(t.map((r) => r.element)), n = /* @__PURE__ */ new Map();
    e.forEach((r) => {
      const s = hR(r);
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
  Hh = !1, $h = !1, Zi.forEach((t) => t.complete(Wh)), Zi.clear();
}
function sx() {
  Zi.forEach((t) => {
    t.readKeyframes(), t.needsMeasurement && (Hh = !0);
  });
}
function pR() {
  Wh = !0, sx(), ix(), Wh = !1;
}
class Sm {
  constructor(e, n, r, s, a, l = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...e], this.onComplete = n, this.name = r, this.motionValue = s, this.element = a, this.isAsync = l;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (Zi.add(this), $h || ($h = !0, Oe.read(sx), Oe.resolveKeyframes(ix))) : (this.readKeyframes(), this.complete());
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
    oR(e);
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
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, e), Zi.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (Zi.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const mR = (t) => t.startsWith("--");
function ox(t, e, n) {
  mR(e) ? t.style.setProperty(e, n) : t.style[e] = n;
}
const yR = {};
function ax(t, e) {
  const n = /* @__PURE__ */ OS(t);
  return () => yR[e] ?? n();
}
const gR = /* @__PURE__ */ ax(() => window.ScrollTimeline !== void 0, "scrollTimeline"), lx = /* @__PURE__ */ ax(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), ma = ([t, e, n, r]) => `cubic-bezier(${t}, ${e}, ${n}, ${r})`, z0 = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ ma([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ ma([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ ma([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ ma([0.33, 1.53, 0.69, 0.99])
};
function ux(t, e) {
  if (t)
    return typeof t == "function" ? lx() ? tx(t, e) : "ease-out" : /* @__PURE__ */ WS(t) ? ma(t) : Array.isArray(t) ? t.map((n) => ux(n, e) || z0.easeOut) : z0[t];
}
function vR(t, e, n, { delay: r = 0, duration: s = 300, repeat: a = 0, repeatType: l = "loop", ease: c = "easeOut", times: d } = {}, m = void 0) {
  const y = {
    [e]: n
  };
  d && (y.offset = d);
  const f = ux(c, s);
  Array.isArray(f) && (y.easing = f);
  const p = {
    delay: r,
    duration: s,
    easing: Array.isArray(f) ? "linear" : f,
    fill: "both",
    iterations: a + 1,
    direction: l === "reverse" ? "alternate" : "normal"
  };
  return m && (p.pseudoElement = m), t.animate(y, p);
}
function cx(t) {
  return typeof t == "function" && "applyToOptions" in t;
}
function _R({ type: t, ...e }) {
  return cx(t) && lx() ? t.applyToOptions(e) : (e.duration ?? (e.duration = 300), e.ease ?? (e.ease = "easeOut"), e);
}
class fx extends wm {
  constructor(e) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !e)
      return;
    const { element: n, name: r, keyframes: s, pseudoElement: a, allowFlatten: l = !1, finalKeyframe: c, onComplete: d } = e;
    this.isPseudoElement = !!a, this.allowFlatten = l, this.options = e, is(typeof e.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const m = _R(e);
    this.animation = vR(n, r, s, m, a), m.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !a) {
        const y = Nc(s, this.options, c, this.speed);
        this.updateMotionValue && this.updateMotionValue(y), ox(n, r, y), this.animation.cancel();
      }
      d == null || d(), this.notifyFinished();
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
    return /* @__PURE__ */ Sn(Number(e));
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ Sn(e);
  }
  get time() {
    return /* @__PURE__ */ Sn(Number(this.animation.currentTime) || 0);
  }
  set time(e) {
    const n = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ Wt(e), n && this.animation.pause();
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
    return this.allowFlatten && ((a = this.animation.effect) == null || a.updateTiming({ easing: "linear" })), this.animation.onfinish = null, e && gR() ? (this.animation.timeline = e, n && (this.animation.rangeStart = n), r && (this.animation.rangeEnd = r), Cn) : s(this);
  }
}
const dx = {
  anticipate: zS,
  backInOut: BS,
  circInOut: $S
};
function wR(t) {
  return t in dx;
}
function SR(t) {
  typeof t.ease == "string" && wR(t.ease) && (t.ease = dx[t.ease]);
}
const oh = 10;
class xR extends fx {
  constructor(e) {
    SR(e), rx(e), super(e), e.startTime !== void 0 && e.autoplay !== !1 && (this.startTime = e.startTime), this.options = e;
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
    const c = new hc({
      ...l,
      autoplay: !1
    }), d = Math.max(oh, Dt.now() - this.startTime), m = rr(0, oh, d - oh), y = c.sample(d).value, { name: f } = this.options;
    a && f && ox(a, f, y), n.setWithVelocity(c.sample(Math.max(0, d - m)).value, y, m), c.stop();
  }
}
const U0 = (t, e) => e === "zIndex" ? !1 : !!(typeof t == "number" || Array.isArray(t) || typeof t == "string" && // It's animatable if we have a string
(Ln.test(t) || t === "0") && // And it contains numbers and/or colors
!t.startsWith("url("));
function TR(t) {
  const e = t[0];
  if (t.length === 1)
    return !0;
  for (let n = 0; n < t.length; n++)
    if (t[n] !== e)
      return !0;
}
function CR(t, e, n, r) {
  const s = t[0];
  if (s === null)
    return !1;
  if (e === "display" || e === "visibility")
    return !0;
  const a = t[t.length - 1], l = U0(s, e), c = U0(a, e);
  return tl(l === c, `You are trying to animate ${e} from "${s}" to "${a}". "${l ? a : s}" is not an animatable value.`, "value-not-animatable"), !l || !c ? !1 : TR(t) || (n === "spring" || cx(n)) && r;
}
function Gh(t) {
  t.duration = 0, t.type = "keyframes";
}
const hx = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), kR = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function PR(t) {
  for (let e = 0; e < t.length; e++)
    if (typeof t[e] == "string" && kR.test(t[e]))
      return !0;
  return !1;
}
const ER = /* @__PURE__ */ new Set([
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
]), AR = /* @__PURE__ */ OS(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function bR(t) {
  var f;
  const { motionValue: e, name: n, repeatDelay: r, repeatType: s, damping: a, type: l, keyframes: c } = t;
  if (!(((f = e == null ? void 0 : e.owner) == null ? void 0 : f.current) instanceof HTMLElement))
    return !1;
  const { onUpdate: m, transformTemplate: y } = e.owner.getProps();
  return AR() && n && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (hx.has(n) || ER.has(n) && PR(c)) && (n !== "transform" || !y) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !m && !r && s !== "mirror" && a !== 0 && l !== "inertia";
}
const RR = 40;
class MR extends wm {
  constructor({ autoplay: e = !0, delay: n = 0, type: r = "keyframes", repeat: s = 0, repeatDelay: a = 0, repeatType: l = "loop", keyframes: c, name: d, motionValue: m, element: y, ...f }) {
    var S;
    super(), this.stop = () => {
      var _, x;
      this._animation && (this._animation.stop(), (_ = this.stopTimeline) == null || _.call(this)), (x = this.keyframeResolver) == null || x.cancel();
    }, this.createdAt = Dt.now();
    const p = {
      autoplay: e,
      delay: n,
      type: r,
      repeat: s,
      repeatDelay: a,
      repeatType: l,
      name: d,
      motionValue: m,
      element: y,
      ...f
    }, g = (y == null ? void 0 : y.KeyframeResolver) || Sm;
    this.keyframeResolver = new g(c, (_, x, T) => this.onKeyframesResolved(_, x, p, !T), d, m, y), (S = this.keyframeResolver) == null || S.scheduleResolve();
  }
  onKeyframesResolved(e, n, r, s) {
    var T, E;
    this.keyframeResolver = void 0;
    const { name: a, type: l, velocity: c, delay: d, isHandoff: m, onUpdate: y } = r;
    this.resolvedAt = Dt.now();
    let f = !0;
    CR(e, a, l, c) || (f = !1, (ui.instantAnimations || !d) && (y == null || y(Nc(e, r, n))), e[0] = e[e.length - 1], Gh(r), r.repeat = 0);
    const g = {
      startTime: s ? this.resolvedAt ? this.resolvedAt - this.createdAt > RR ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: n,
      ...r,
      keyframes: e
    }, S = f && !m && bR(g), _ = (E = (T = g.motionValue) == null ? void 0 : T.owner) == null ? void 0 : E.current;
    let x;
    if (S)
      try {
        x = new xR({
          ...g,
          element: _
        });
      } catch {
        x = new hc(g);
      }
    else
      x = new hc(g);
    x.finished.then(() => {
      this.notifyFinished();
    }).catch(Cn), this.pendingTimeline && (this.stopTimeline = x.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = x;
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
    return this._animation || ((e = this.keyframeResolver) == null || e.resume(), pR()), this._animation;
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
function px(t, e, n, r = 0, s = 1) {
  const a = Array.from(t).sort((m, y) => m.sortNodePosition(y)).indexOf(e), l = t.size, c = (l - 1) * r;
  return typeof n == "function" ? n(a, l) : s === 1 ? a * r : c - a * r;
}
const $0 = 30, DR = (t) => !isNaN(parseFloat(t));
class FR {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(e, n = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (r) => {
      var a;
      const s = Dt.now();
      if (this.updatedAt !== s && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(r), this.current !== this.prev && ((a = this.events.change) == null || a.notify(this.current), this.dependents))
        for (const l of this.dependents)
          l.dirty();
    }, this.hasAnimated = !1, this.setCurrent(e), this.owner = n.owner;
  }
  setCurrent(e) {
    this.current = e, this.updatedAt = Dt.now(), this.canTrackVelocity === null && e !== void 0 && (this.canTrackVelocity = DR(this.current));
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
    this.events[e] || (this.events[e] = new dm());
    const r = this.events[e].add(n);
    return e === "change" ? () => {
      r(), Oe.read(() => {
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
    const e = Dt.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || e - this.updatedAt > $0)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, $0);
    return /* @__PURE__ */ IS(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
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
function lo(t, e) {
  return new FR(t, e);
}
function mx(t, e) {
  if (t != null && t.inherit && e) {
    const { inherit: n, ...r } = t;
    return { ...e, ...r };
  }
  return t;
}
function xm(t, e) {
  const n = (t == null ? void 0 : t[e]) ?? (t == null ? void 0 : t.default) ?? t;
  return n !== t ? mx(n, t) : n;
}
const OR = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, IR = (t) => ({
  type: "spring",
  stiffness: 550,
  damping: t === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), NR = {
  type: "keyframes",
  duration: 0.8
}, LR = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, jR = (t, { keyframes: e }) => e.length > 2 ? NR : To.has(t) ? t.startsWith("scale") ? IR(e[1]) : OR : LR, VR = /* @__PURE__ */ new Set([
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
function BR(t) {
  for (const e in t)
    if (!VR.has(e))
      return !0;
  return !1;
}
const Tm = (t, e, n, r = {}, s, a) => (l) => {
  const c = xm(r, t) || {}, d = c.delay || r.delay || 0;
  let { elapsed: m = 0 } = r;
  m = m - /* @__PURE__ */ Wt(d);
  const y = {
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
  BR(c) || Object.assign(y, jR(t, y)), y.duration && (y.duration = /* @__PURE__ */ Wt(y.duration)), y.repeatDelay && (y.repeatDelay = /* @__PURE__ */ Wt(y.repeatDelay)), y.from !== void 0 && (y.keyframes[0] = y.from);
  let f = !1;
  if ((y.type === !1 || y.duration === 0 && !y.repeatDelay) && (Gh(y), y.delay === 0 && (f = !0)), (ui.instantAnimations || ui.skipAnimations || s != null && s.shouldSkipAnimations || c.skipAnimations) && (f = !0, Gh(y), y.delay = 0), y.allowFlatten = !c.type && !c.ease, f && !a && e.get() !== void 0) {
    const p = Nc(y.keyframes, c);
    if (p !== void 0) {
      Oe.update(() => {
        y.onUpdate(p), y.onComplete();
      });
      return;
    }
  }
  return c.isSync ? new hc(y) : new MR(y);
}, zR = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function UR(t) {
  const e = zR.exec(t);
  if (!e)
    return [,];
  const [, n, r, s] = e;
  return [`--${n ?? r}`, s];
}
const $R = 4;
function yx(t, e, n = 1) {
  is(n <= $R, `Max CSS variable fallback depth detected in property "${t}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [r, s] = UR(t);
  if (!r)
    return;
  const a = window.getComputedStyle(e).getPropertyValue(r);
  if (a) {
    const l = a.trim();
    return MS(l) ? parseFloat(l) : l;
  }
  return mm(s) ? yx(s, e, n + 1) : s;
}
function H0(t) {
  const e = [{}, {}];
  return t == null || t.values.forEach((n, r) => {
    e[0][r] = n.get(), e[1][r] = n.getVelocity();
  }), e;
}
function Cm(t, e, n, r) {
  if (typeof e == "function") {
    const [s, a] = H0(r);
    e = e(n !== void 0 ? n : t.custom, s, a);
  }
  if (typeof e == "string" && (e = t.variants && t.variants[e]), typeof e == "function") {
    const [s, a] = H0(r);
    e = e(n !== void 0 ? n : t.custom, s, a);
  }
  return e;
}
function Ji(t, e, n) {
  const r = t.getProps();
  return Cm(r, e, n !== void 0 ? n : r.custom, t);
}
const gx = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...xo
]), Kh = (t) => Array.isArray(t);
function HR(t, e, n) {
  t.hasValue(e) ? t.getValue(e).set(n) : t.addValue(e, lo(n));
}
function WR(t) {
  return Kh(t) ? t[t.length - 1] || 0 : t;
}
function GR(t, e) {
  const n = Ji(t, e);
  let { transitionEnd: r = {}, transition: s = {}, ...a } = n || {};
  a = { ...a, ...r };
  for (const l in a) {
    const c = WR(a[l]);
    HR(t, l, c);
  }
}
const _t = (t) => !!(t && t.getVelocity);
function KR(t) {
  return !!(_t(t) && t.add);
}
function Qh(t, e) {
  const n = t.getValue("willChange");
  if (KR(n))
    return n.add(e);
  if (!n && ui.WillChange) {
    const r = new ui.WillChange("auto");
    t.addValue("willChange", r), r.add(e);
  }
}
function km(t) {
  return t.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`);
}
const QR = "framerAppearId", vx = "data-" + km(QR);
function _x(t) {
  return t.props[vx];
}
function YR({ protectedKeys: t, needsAnimating: e }, n) {
  const r = t.hasOwnProperty(n) && e[n] !== !0;
  return e[n] = !1, r;
}
function wx(t, e, { delay: n = 0, transitionOverride: r, type: s } = {}) {
  let { transition: a, transitionEnd: l, ...c } = e;
  const d = t.getDefaultTransition();
  a = a ? mx(a, d) : d;
  const m = a == null ? void 0 : a.reduceMotion, y = a == null ? void 0 : a.skipAnimations;
  r && (a = r);
  const f = [], p = s && t.animationState && t.animationState.getState()[s], g = a == null ? void 0 : a.path;
  g && g.animateVisualElement(t, c, a, n, f);
  for (const S in c) {
    const _ = t.getValue(S, t.latestValues[S] ?? null), x = c[S];
    if (x === void 0 || p && YR(p, S))
      continue;
    const T = {
      delay: n,
      ...xm(a || {}, S)
    };
    y && (T.skipAnimations = !0);
    const E = _.get();
    if (E !== void 0 && !_.isAnimating() && !Array.isArray(x) && x === E && !T.velocity) {
      Oe.update(() => _.set(x));
      continue;
    }
    let A = !1;
    if (window.MotionHandoffAnimation) {
      const B = _x(t);
      if (B) {
        const I = window.MotionHandoffAnimation(B, S, Oe);
        I !== null && (T.startTime = I, A = !0);
      }
    }
    Qh(t, S);
    const b = m ?? t.shouldReduceMotion;
    _.start(Tm(S, _, x, b && gx.has(S) ? { type: !1 } : T, t, A));
    const M = _.animation;
    M && f.push(M);
  }
  if (l) {
    const S = () => Oe.update(() => {
      l && GR(t, l);
    });
    f.length ? Promise.all(f).then(S) : S();
  }
  return f;
}
function Yh(t, e, n = {}) {
  var d;
  const r = Ji(t, e, n.type === "exit" ? (d = t.presenceContext) == null ? void 0 : d.custom : void 0);
  let { transition: s = t.getDefaultTransition() || {} } = r || {};
  n.transitionOverride && (s = n.transitionOverride);
  const a = r ? () => Promise.all(wx(t, r, n)) : () => Promise.resolve(), l = t.variantChildren && t.variantChildren.size ? (m = 0) => {
    const { delayChildren: y = 0, staggerChildren: f, staggerDirection: p } = s;
    return XR(t, e, m, y, f, p, n);
  } : () => Promise.resolve(), { when: c } = s;
  if (c) {
    const [m, y] = c === "beforeChildren" ? [a, l] : [l, a];
    return m().then(() => y());
  } else
    return Promise.all([a(), l(n.delay)]);
}
function XR(t, e, n = 0, r = 0, s = 0, a = 1, l) {
  const c = [];
  for (const d of t.variantChildren)
    d.notify("AnimationStart", e), c.push(Yh(d, e, {
      ...l,
      delay: n + (typeof r == "function" ? 0 : r) + px(t.variantChildren, d, r, s, a)
    }).then(() => d.notify("AnimationComplete", e)));
  return Promise.all(c);
}
function qR(t, e, n = {}) {
  t.notify("AnimationStart", e);
  let r;
  if (Array.isArray(e)) {
    const s = e.map((a) => Yh(t, a, n));
    r = Promise.all(s);
  } else if (typeof e == "string")
    r = Yh(t, e, n);
  else {
    const s = typeof e == "function" ? Ji(t, e, n.custom) : e;
    r = Promise.all(wx(t, s, n));
  }
  return r.then(() => {
    t.notify("AnimationComplete", e);
  });
}
const ZR = {
  test: (t) => t === "auto",
  parse: (t) => t
}, Sx = (t) => (e) => e.test(t), xx = [So, ae, nr, hr, Tb, xb, ZR], W0 = (t) => xx.find(Sx(t));
function JR(t) {
  return typeof t == "number" ? t === 0 : t !== null ? t === "none" || t === "0" || FS(t) : !0;
}
const eM = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function tM(t) {
  const [e, n] = t.slice(0, -1).split("(");
  if (e === "drop-shadow")
    return t;
  const [r] = n.match(ym) || [];
  if (!r)
    return t;
  const s = n.replace(r, "");
  let a = eM.has(e) ? 1 : 0;
  return r !== n && (a *= 100), e + "(" + a + s + ")";
}
const nM = /\b([a-z-]*)\(.*?\)/gu, Xh = {
  ...Ln,
  getAnimatableNone: (t) => {
    const e = t.match(nM);
    return e ? e.map(tM).join(" ") : t;
  }
}, qh = {
  ...Ln,
  getAnimatableNone: (t) => {
    const e = Ln.parse(t);
    return Ln.createTransformer(t)(e.map((r) => typeof r == "number" ? 0 : typeof r == "object" ? { ...r, alpha: 1 } : r));
  }
}, G0 = {
  ...So,
  transform: Math.round
}, rM = {
  rotate: hr,
  /**
   * Internal channel for `transition.path` orientToPath. Composed onto
   * `rotate` at the transform-build sites so the user's `rotate` is
   * never read or overwritten. Not part of `transformPropOrder`.
   */
  pathRotation: hr,
  rotateX: hr,
  rotateY: hr,
  rotateZ: hr,
  scale: bu,
  scaleX: bu,
  scaleY: bu,
  scaleZ: bu,
  skew: hr,
  skewX: hr,
  skewY: hr,
  distance: ae,
  translateX: ae,
  translateY: ae,
  translateZ: ae,
  x: ae,
  y: ae,
  z: ae,
  perspective: ae,
  transformPerspective: ae,
  opacity: Da,
  originX: D0,
  originY: D0,
  originZ: ae
}, pc = {
  // Border props
  borderWidth: ae,
  borderTopWidth: ae,
  borderRightWidth: ae,
  borderBottomWidth: ae,
  borderLeftWidth: ae,
  borderRadius: ae,
  borderTopLeftRadius: ae,
  borderTopRightRadius: ae,
  borderBottomRightRadius: ae,
  borderBottomLeftRadius: ae,
  // Positioning props
  width: ae,
  maxWidth: ae,
  height: ae,
  maxHeight: ae,
  top: ae,
  right: ae,
  bottom: ae,
  left: ae,
  inset: ae,
  insetBlock: ae,
  insetBlockStart: ae,
  insetBlockEnd: ae,
  insetInline: ae,
  insetInlineStart: ae,
  insetInlineEnd: ae,
  // Spacing props
  padding: ae,
  paddingTop: ae,
  paddingRight: ae,
  paddingBottom: ae,
  paddingLeft: ae,
  paddingBlock: ae,
  paddingBlockStart: ae,
  paddingBlockEnd: ae,
  paddingInline: ae,
  paddingInlineStart: ae,
  paddingInlineEnd: ae,
  margin: ae,
  marginTop: ae,
  marginRight: ae,
  marginBottom: ae,
  marginLeft: ae,
  marginBlock: ae,
  marginBlockStart: ae,
  marginBlockEnd: ae,
  marginInline: ae,
  marginInlineStart: ae,
  marginInlineEnd: ae,
  // Typography
  fontSize: ae,
  // Misc
  backgroundPositionX: ae,
  backgroundPositionY: ae,
  ...rM,
  zIndex: G0,
  // SVG
  fillOpacity: Da,
  strokeOpacity: Da,
  numOctaves: G0
}, iM = {
  ...pc,
  // Color props
  color: nt,
  backgroundColor: nt,
  outlineColor: nt,
  fill: nt,
  stroke: nt,
  // Border props
  borderColor: nt,
  borderTopColor: nt,
  borderRightColor: nt,
  borderBottomColor: nt,
  borderLeftColor: nt,
  filter: Xh,
  WebkitFilter: Xh,
  mask: qh,
  WebkitMask: qh
}, Tx = (t) => iM[t], sM = /* @__PURE__ */ new Set([Xh, qh]);
function Cx(t, e) {
  let n = Tx(t);
  return sM.has(n) || (n = Ln), n.getAnimatableNone ? n.getAnimatableNone(e) : void 0;
}
const oM = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function aM(t, e, n) {
  let r = 0, s;
  for (; r < t.length && !s; ) {
    const a = t[r];
    typeof a == "string" && !oM.has(a) && ao(a).values.length && (s = t[r]), r++;
  }
  if (s && n)
    for (const a of e)
      t[a] = Cx(n, s);
}
class lM extends Sm {
  constructor(e, n, r, s, a) {
    super(e, n, r, s, a, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: e, element: n, name: r } = this;
    if (!n || !n.current)
      return;
    super.readKeyframes();
    for (let y = 0; y < e.length; y++) {
      let f = e[y];
      if (typeof f == "string" && (f = f.trim(), mm(f))) {
        const p = yx(f, n.current);
        p !== void 0 && (e[y] = p), y === e.length - 1 && (this.finalKeyframe = f);
      }
    }
    if (this.resolveNoneKeyframes(), !gx.has(r) || e.length !== 2)
      return;
    const [s, a] = e, l = W0(s), c = W0(a), d = M0(s), m = M0(a);
    if (d !== m && ni[r]) {
      this.needsMeasurement = !0;
      return;
    }
    if (l !== c)
      if (B0(l) && B0(c))
        for (let y = 0; y < e.length; y++) {
          const f = e[y];
          typeof f == "string" && (e[y] = parseFloat(f));
        }
      else ni[r] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: e, name: n } = this, r = [];
    for (let s = 0; s < e.length; s++)
      (e[s] === null || JR(e[s])) && r.push(s);
    r.length && aM(e, r, n);
  }
  measureInitialState() {
    const { element: e, unresolvedKeyframes: n, name: r } = this;
    if (!e || !e.current)
      return;
    r === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = ni[r](e.measureViewportBox(), window.getComputedStyle(e.current)), n[0] = this.measuredOrigin;
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
    r[a] = ni[n](e.measureViewportBox(), window.getComputedStyle(e.current)), l !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = l), (c = this.removedTransforms) != null && c.length && this.removedTransforms.forEach(([d, m]) => {
      e.getValue(d).set(m);
    }), this.resolveNoneKeyframes();
  }
}
function kx(t, e, n) {
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
const Zh = (t, e) => e && typeof t == "number" ? e.transform(t) : t;
function Ku(t) {
  return DS(t) && "offsetHeight" in t && !("ownerSVGElement" in t);
}
const { schedule: Pm } = /* @__PURE__ */ GS(queueMicrotask, !1), On = {
  x: !1,
  y: !1
};
function Px() {
  return On.x || On.y;
}
function uM(t) {
  return t === "x" || t === "y" ? On[t] ? null : (On[t] = !0, () => {
    On[t] = !1;
  }) : On.x || On.y ? null : (On.x = On.y = !0, () => {
    On.x = On.y = !1;
  });
}
function Ex(t, e) {
  const n = kx(t), r = new AbortController(), s = {
    passive: !0,
    ...e,
    signal: r.signal
  };
  return [n, s, () => r.abort()];
}
function cM(t) {
  return !(t.pointerType === "touch" || Px());
}
function fM(t, e, n = {}) {
  const [r, s, a] = Ex(t, n);
  return r.forEach((l) => {
    let c = !1, d = !1, m;
    const y = () => {
      l.removeEventListener("pointerleave", S);
    }, f = (x) => {
      m && (m(x), m = void 0), y();
    }, p = (x) => {
      c = !1, window.removeEventListener("pointerup", p), window.removeEventListener("pointercancel", p), d && (d = !1, f(x));
    }, g = () => {
      c = !0, window.addEventListener("pointerup", p, s), window.addEventListener("pointercancel", p, s);
    }, S = (x) => {
      if (x.pointerType !== "touch") {
        if (c) {
          d = !0;
          return;
        }
        f(x);
      }
    }, _ = (x) => {
      if (!cM(x))
        return;
      d = !1;
      const T = e(l, x);
      typeof T == "function" && (m = T, l.addEventListener("pointerleave", S, s));
    };
    l.addEventListener("pointerenter", _, s), l.addEventListener("pointerdown", g, s);
  }), a;
}
const Ax = (t, e) => e ? t === e ? !0 : Ax(t, e.parentElement) : !1, Em = (t) => t.pointerType === "mouse" ? typeof t.button != "number" || t.button <= 0 : t.isPrimary !== !1, dM = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function hM(t) {
  return dM.has(t.tagName) || t.isContentEditable === !0;
}
const pM = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function mM(t) {
  return pM.has(t.tagName) || t.isContentEditable === !0;
}
const Qu = /* @__PURE__ */ new WeakSet();
function K0(t) {
  return (e) => {
    e.key === "Enter" && t(e);
  };
}
function ah(t, e) {
  t.dispatchEvent(new PointerEvent("pointer" + e, { isPrimary: !0, bubbles: !0 }));
}
const yM = (t, e) => {
  const n = t.currentTarget;
  if (!n)
    return;
  const r = K0(() => {
    if (Qu.has(n))
      return;
    ah(n, "down");
    const s = K0(() => {
      ah(n, "up");
    }), a = () => ah(n, "cancel");
    n.addEventListener("keyup", s, e), n.addEventListener("blur", a, e);
  });
  n.addEventListener("keydown", r, e), n.addEventListener("blur", () => n.removeEventListener("keydown", r), e);
};
function Q0(t) {
  return Em(t) && !Px();
}
const Y0 = /* @__PURE__ */ new WeakSet();
function gM(t, e, n = {}) {
  const [r, s, a] = Ex(t, n), l = (c) => {
    const d = c.currentTarget;
    if (!Q0(c) || Y0.has(c))
      return;
    Qu.add(d), n.stopPropagation && Y0.add(c);
    const m = e(d, c), y = (g, S) => {
      window.removeEventListener("pointerup", f), window.removeEventListener("pointercancel", p), Qu.has(d) && Qu.delete(d), Q0(g) && typeof m == "function" && m(g, { success: S });
    }, f = (g) => {
      y(g, d === window || d === document || n.useGlobalTarget || Ax(d, g.target));
    }, p = (g) => {
      y(g, !1);
    };
    window.addEventListener("pointerup", f, s), window.addEventListener("pointercancel", p, s);
  };
  return r.forEach((c) => {
    (n.useGlobalTarget ? window : c).addEventListener("pointerdown", l, s), Ku(c) && (c.addEventListener("focus", (m) => yM(m, s)), !hM(c) && !c.hasAttribute("tabindex") && (c.tabIndex = 0));
  }), a;
}
function Am(t) {
  return DS(t) && "ownerSVGElement" in t;
}
const Yu = /* @__PURE__ */ new WeakMap();
let Wr;
const bx = (t, e, n) => (r, s) => s && s[0] ? s[0][t + "Size"] : Am(r) && "getBBox" in r ? r.getBBox()[e] : r[n], vM = /* @__PURE__ */ bx("inline", "width", "offsetWidth"), _M = /* @__PURE__ */ bx("block", "height", "offsetHeight");
function wM({ target: t, borderBoxSize: e }) {
  var n;
  (n = Yu.get(t)) == null || n.forEach((r) => {
    r(t, {
      get width() {
        return vM(t, e);
      },
      get height() {
        return _M(t, e);
      }
    });
  });
}
function SM(t) {
  t.forEach(wM);
}
function xM() {
  typeof ResizeObserver > "u" || (Wr = new ResizeObserver(SM));
}
function TM(t, e) {
  Wr || xM();
  const n = kx(t);
  return n.forEach((r) => {
    let s = Yu.get(r);
    s || (s = /* @__PURE__ */ new Set(), Yu.set(r, s)), s.add(e), Wr == null || Wr.observe(r);
  }), () => {
    n.forEach((r) => {
      const s = Yu.get(r);
      s == null || s.delete(e), s != null && s.size || Wr == null || Wr.unobserve(r);
    });
  };
}
const Xu = /* @__PURE__ */ new Set();
let Vs;
function CM() {
  Vs = () => {
    const t = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    Xu.forEach((e) => e(t));
  }, window.addEventListener("resize", Vs);
}
function kM(t) {
  return Xu.add(t), Vs || CM(), () => {
    Xu.delete(t), !Xu.size && typeof Vs == "function" && (window.removeEventListener("resize", Vs), Vs = void 0);
  };
}
function X0(t, e) {
  return typeof t == "function" ? kM(t) : TM(t, e);
}
function PM(t) {
  return Am(t) && t.tagName === "svg";
}
const EM = [...xx, nt, Ln], AM = (t) => EM.find(Sx(t)), q0 = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), Bs = () => ({
  x: q0(),
  y: q0()
}), Z0 = () => ({ min: 0, max: 0 }), at = () => ({
  x: Z0(),
  y: Z0()
}), bM = /* @__PURE__ */ new WeakMap();
function Lc(t) {
  return t !== null && typeof t == "object" && typeof t.start == "function";
}
function Fa(t) {
  return typeof t == "string" || Array.isArray(t);
}
const bm = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], Rm = ["initial", ...bm];
function jc(t) {
  return Lc(t.animate) || Rm.some((e) => Fa(t[e]));
}
function Rx(t) {
  return !!(jc(t) || t.variants);
}
function RM(t, e, n) {
  for (const r in e) {
    const s = e[r], a = n[r];
    if (_t(s))
      t.addValue(r, s);
    else if (_t(a))
      t.addValue(r, lo(s, { owner: t }));
    else if (a !== s)
      if (t.hasValue(r)) {
        const l = t.getValue(r);
        l.liveStyle === !0 ? l.jump(s) : l.hasAnimated || l.set(s);
      } else {
        const l = t.getStaticValue(r);
        t.addValue(r, lo(l !== void 0 ? l : s, { owner: t }));
      }
  }
  for (const r in n)
    e[r] === void 0 && t.removeValue(r);
  return e;
}
const Jh = { current: null }, Mx = { current: !1 }, MM = typeof window < "u";
function DM() {
  if (Mx.current = !0, !!MM)
    if (window.matchMedia) {
      const t = window.matchMedia("(prefers-reduced-motion)"), e = () => Jh.current = t.matches;
      t.addEventListener("change", e), e();
    } else
      Jh.current = !1;
}
const J0 = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let mc = {};
function Dx(t) {
  mc = t;
}
function FM() {
  return mc;
}
class OM {
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
  constructor({ parent: e, props: n, presenceContext: r, reducedMotionConfig: s, skipAnimations: a, blockInitialAnimation: l, visualState: c }, d = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = Sm, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const g = Dt.now();
      this.renderScheduledAt < g && (this.renderScheduledAt = g, Oe.render(this.render, !1, !0));
    };
    const { latestValues: m, renderState: y } = c;
    this.latestValues = m, this.baseTarget = { ...m }, this.initialValues = n.initial ? { ...m } : {}, this.renderState = y, this.parent = e, this.props = n, this.presenceContext = r, this.depth = e ? e.depth + 1 : 0, this.reducedMotionConfig = s, this.skipAnimationsConfig = a, this.options = d, this.blockInitialAnimation = !!l, this.isControllingVariants = jc(n), this.isVariantNode = Rx(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(e && e.current);
    const { willChange: f, ...p } = this.scrapeMotionValuesFromProps(n, {}, this);
    for (const g in p) {
      const S = p[g];
      m[g] !== void 0 && _t(S) && S.set(m[g]);
    }
  }
  mount(e) {
    var n, r;
    if (this.hasBeenMounted)
      for (const s in this.initialValues)
        (n = this.values.get(s)) == null || n.jump(this.initialValues[s]), this.latestValues[s] = this.initialValues[s];
    this.current = e, bM.set(e, this), this.projection && !this.projection.instance && this.projection.mount(e), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((s, a) => this.bindToMotionValue(a, s)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Mx.current || DM(), this.shouldReduceMotion = Jh.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, (r = this.parent) == null || r.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    var e;
    this.projection && this.projection.unmount(), ci(this.notifyUpdate), ci(this.render), this.valueSubscriptions.forEach((n) => n()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), (e = this.parent) == null || e.removeChild(this);
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
    if (this.valueSubscriptions.has(e) && this.valueSubscriptions.get(e)(), n.accelerate && hx.has(e) && this.current instanceof HTMLElement) {
      const { factory: l, keyframes: c, times: d, ease: m, duration: y } = n.accelerate, f = new fx({
        element: this.current,
        name: e,
        keyframes: c,
        times: d,
        ease: m,
        duration: /* @__PURE__ */ Wt(y)
      }), p = l(f);
      this.valueSubscriptions.set(e, () => {
        p(), f.cancel();
      });
      return;
    }
    const r = To.has(e);
    r && this.onBindTransform && this.onBindTransform();
    const s = n.on("change", (l) => {
      this.latestValues[e] = l, this.props.onUpdate && Oe.preRender(this.notifyUpdate), r && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
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
    for (e in mc) {
      const n = mc[e];
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
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : at();
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
    for (let r = 0; r < J0.length; r++) {
      const s = J0[r];
      this.propEventSubscriptions[s] && (this.propEventSubscriptions[s](), delete this.propEventSubscriptions[s]);
      const a = "on" + s, l = e[a];
      l && (this.propEventSubscriptions[s] = this.on(s, l));
    }
    this.prevMotionValues = RM(this, this.scrapeMotionValuesFromProps(e, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
    return r === void 0 && n !== void 0 && (r = lo(n === null ? void 0 : n, { owner: this }), this.addValue(e, r)), r;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(e, n) {
    let r = this.latestValues[e] !== void 0 || !this.current ? this.latestValues[e] : this.getBaseTargetFromProps(this.props, e) ?? this.readValueFromInstance(this.current, e, this.options);
    return r != null && (typeof r == "string" && (MS(r) || FS(r)) ? r = parseFloat(r) : !AM(r) && Ln.test(n) && (r = Cx(e, n)), this.setBaseTarget(e, _t(r) ? r.get() : r)), _t(r) ? r.get() : r;
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
      const l = Cm(this.props, n, (a = this.presenceContext) == null ? void 0 : a.custom);
      l && (r = l[e]);
    }
    if (n && r !== void 0)
      return r;
    const s = this.getBaseTargetFromProps(this.props, e);
    return s !== void 0 && !_t(s) ? s : this.initialValues[e] !== void 0 && r === void 0 ? void 0 : this.baseTarget[e];
  }
  on(e, n) {
    return this.events[e] || (this.events[e] = new dm()), this.events[e].add(n);
  }
  notify(e, ...n) {
    this.events[e] && this.events[e].notify(...n);
  }
  scheduleRenderMicrotask() {
    Pm.render(this.render);
  }
}
class Fx extends OM {
  constructor() {
    super(...arguments), this.KeyframeResolver = lM;
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
    _t(e) && (this.childSubscription = e.on("change", (n) => {
      this.current && (this.current.textContent = `${n}`);
    }));
  }
}
class pi {
  constructor(e) {
    this.isMounted = !1, this.node = e;
  }
  update() {
  }
}
function Ox({ top: t, left: e, right: n, bottom: r }) {
  return {
    x: { min: e, max: n },
    y: { min: t, max: r }
  };
}
function IM({ x: t, y: e }) {
  return { top: e.min, right: t.max, bottom: e.max, left: t.min };
}
function NM(t, e) {
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
function lh(t) {
  return t === void 0 || t === 1;
}
function ep({ scale: t, scaleX: e, scaleY: n }) {
  return !lh(t) || !lh(e) || !lh(n);
}
function Ii(t) {
  return ep(t) || Ix(t) || t.z || t.rotate || t.rotateX || t.rotateY || t.skewX || t.skewY;
}
function Ix(t) {
  return e_(t.x) || e_(t.y);
}
function e_(t) {
  return t && t !== "0%";
}
function yc(t, e, n) {
  const r = t - n, s = e * r;
  return n + s;
}
function t_(t, e, n, r, s) {
  return s !== void 0 && (t = yc(t, s, r)), yc(t, n, r) + e;
}
function tp(t, e = 0, n = 1, r, s) {
  t.min = t_(t.min, e, n, r, s), t.max = t_(t.max, e, n, r, s);
}
function Nx(t, { x: e, y: n }) {
  tp(t.x, e.translate, e.scale, e.originPoint), tp(t.y, n.translate, n.scale, n.originPoint);
}
const n_ = 0.999999999999, r_ = 1.0000000000001;
function LM(t, e, n, r = !1) {
  var c;
  const s = n.length;
  if (!s)
    return;
  e.x = e.y = 1;
  let a, l;
  for (let d = 0; d < s; d++) {
    a = n[d], l = a.projectionDelta;
    const { visualElement: m } = a.options;
    m && m.props.style && m.props.style.display === "contents" || (r && a.options.layoutScroll && a.scroll && a !== a.root && (qn(t.x, -a.scroll.offset.x), qn(t.y, -a.scroll.offset.y)), l && (e.x *= l.x.scale, e.y *= l.y.scale, Nx(t, l)), r && Ii(a.latestValues) && qu(t, a.latestValues, (c = a.layout) == null ? void 0 : c.layoutBox));
  }
  e.x < r_ && e.x > n_ && (e.x = 1), e.y < r_ && e.y > n_ && (e.y = 1);
}
function qn(t, e) {
  t.min += e, t.max += e;
}
function i_(t, e, n, r, s = 0.5) {
  const a = Fe(t.min, t.max, s);
  tp(t, e, n, a, r);
}
function s_(t, e) {
  return typeof t == "string" ? parseFloat(t) / 100 * (e.max - e.min) : t;
}
function qu(t, e, n) {
  const r = n ?? t;
  i_(t.x, s_(e.x, r.x), e.scaleX, e.scale, e.originX), i_(t.y, s_(e.y, r.y), e.scaleY, e.scale, e.originY);
}
function Lx(t, e) {
  return Ox(NM(t.getBoundingClientRect(), e));
}
function jM(t, e, n) {
  const r = Lx(t, n), { scroll: s } = e;
  return s && (qn(r.x, s.offset.x), qn(r.y, s.offset.y)), r;
}
const VM = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, BM = xo.length;
function zM(t, e, n) {
  let r = "", s = !0;
  for (let l = 0; l < BM; l++) {
    const c = xo[l], d = t[c];
    if (d === void 0)
      continue;
    let m = !0;
    if (typeof d == "number")
      m = d === (c.startsWith("scale") ? 1 : 0);
    else {
      const y = parseFloat(d);
      m = c.startsWith("scale") ? y === 1 : y === 0;
    }
    if (!m || n) {
      const y = Zh(d, pc[c]);
      if (!m) {
        s = !1;
        const f = VM[c] || c;
        r += `${f}(${y}) `;
      }
      n && (e[c] = y);
    }
  }
  const a = t.pathRotation;
  return a && (s = !1, r += `rotate(${Zh(a, pc.pathRotation)}) `), r = r.trim(), n ? r = n(e, s ? "" : r) : s && (r = "none"), r;
}
function Mm(t, e, n) {
  const { style: r, vars: s, transformOrigin: a } = t;
  let l = !1, c = !1;
  for (const d in e) {
    const m = e[d];
    if (To.has(d)) {
      l = !0;
      continue;
    } else if (QS(d)) {
      s[d] = m;
      continue;
    } else {
      const y = Zh(m, pc[d]);
      d.startsWith("origin") ? (c = !0, a[d] = y) : r[d] = y;
    }
  }
  if (e.transform || (l || n ? r.transform = zM(e, t.transform, n) : r.transform && (r.transform = "none")), c) {
    const { originX: d = "50%", originY: m = "50%", originZ: y = 0 } = a;
    r.transformOrigin = `${d} ${m} ${y}`;
  }
}
function jx(t, { style: e, vars: n }, r, s) {
  const a = t.style;
  let l;
  for (l in e)
    a[l] = e[l];
  s == null || s.applyProjectionStyles(a, r);
  for (l in n)
    a.setProperty(l, n[l]);
}
function o_(t, e) {
  return e.max === e.min ? 0 : t / (e.max - e.min) * 100;
}
const ha = {
  correct: (t, e) => {
    if (!e.target)
      return t;
    if (typeof t == "string")
      if (ae.test(t))
        t = parseFloat(t);
      else
        return t;
    const n = o_(t, e.target.x), r = o_(t, e.target.y);
    return `${n}% ${r}%`;
  }
}, UM = {
  correct: (t, { treeScale: e, projectionDelta: n }) => {
    const r = t, s = Ln.parse(t);
    if (s.length > 5)
      return r;
    const a = Ln.createTransformer(t), l = typeof s[0] != "number" ? 1 : 0, c = n.x.scale * e.x, d = n.y.scale * e.y;
    s[0 + l] /= c, s[1 + l] /= d;
    const m = Fe(c, d, 0.5);
    return typeof s[2 + l] == "number" && (s[2 + l] /= m), typeof s[3 + l] == "number" && (s[3 + l] /= m), a(s);
  }
}, np = {
  borderRadius: {
    ...ha,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: ha,
  borderTopRightRadius: ha,
  borderBottomLeftRadius: ha,
  borderBottomRightRadius: ha,
  boxShadow: UM
};
function Vx(t, { layout: e, layoutId: n }) {
  return To.has(t) || t.startsWith("origin") || (e || n !== void 0) && (!!np[t] || t === "opacity");
}
function Dm(t, e, n) {
  var l;
  const r = t.style, s = e == null ? void 0 : e.style, a = {};
  if (!r)
    return a;
  for (const c in r)
    (_t(r[c]) || s && _t(s[c]) || Vx(c, t) || ((l = n == null ? void 0 : n.getValue(c)) == null ? void 0 : l.liveStyle) !== void 0) && (a[c] = r[c]);
  return a;
}
function $M(t) {
  return window.getComputedStyle(t);
}
class HM extends Fx {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = jx;
  }
  readValueFromInstance(e, n) {
    var r;
    if (To.has(n))
      return (r = this.projection) != null && r.isProjecting ? zh(n) : uR(e, n);
    {
      const s = $M(e), a = (QS(n) ? s.getPropertyValue(n) : s[n]) || 0;
      return typeof a == "string" ? a.trim() : a;
    }
  }
  measureInstanceViewportBox(e, { transformPagePoint: n }) {
    return Lx(e, n);
  }
  build(e, n, r) {
    Mm(e, n, r.transformTemplate);
  }
  scrapeMotionValuesFromProps(e, n, r) {
    return Dm(e, n, r);
  }
}
const WM = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, GM = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function KM(t, e, n = 1, r = 0, s = !0) {
  t.pathLength = 1;
  const a = s ? WM : GM;
  t[a.offset] = `${-r}`, t[a.array] = `${e} ${n}`;
}
const QM = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function Bx(t, {
  attrX: e,
  attrY: n,
  attrScale: r,
  pathLength: s,
  pathSpacing: a = 1,
  pathOffset: l = 0,
  // This is object creation, which we try to avoid per-frame.
  ...c
}, d, m, y) {
  if (Mm(t, c, m), d) {
    t.style.viewBox && (t.attrs.viewBox = t.style.viewBox);
    return;
  }
  t.attrs = t.style, t.style = {};
  const { attrs: f, style: p } = t;
  f.transform && (p.transform = f.transform, delete f.transform), (p.transform || f.transformOrigin) && (p.transformOrigin = f.transformOrigin ?? "50% 50%", delete f.transformOrigin), p.transform && (p.transformBox = (y == null ? void 0 : y.transformBox) ?? "fill-box", delete f.transformBox);
  for (const g of QM)
    f[g] !== void 0 && (p[g] = f[g], delete f[g]);
  e !== void 0 && (f.x = e), n !== void 0 && (f.y = n), r !== void 0 && (f.scale = r), s !== void 0 && KM(f, s, a, l, !1);
}
const zx = /* @__PURE__ */ new Set([
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
function YM(t, e, n, r) {
  jx(t, e, void 0, r);
  for (const s in e.attrs)
    t.setAttribute(zx.has(s) ? s : km(s), e.attrs[s]);
}
function $x(t, e, n) {
  const r = Dm(t, e, n);
  for (const s in t)
    if (_t(t[s]) || _t(e[s])) {
      const a = xo.indexOf(s) !== -1 ? "attr" + s.charAt(0).toUpperCase() + s.substring(1) : s;
      r[a] = t[s];
    }
  return r;
}
class XM extends Fx {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = at;
  }
  getBaseTargetFromProps(e, n) {
    return e[n];
  }
  readValueFromInstance(e, n) {
    if (To.has(n)) {
      const r = Tx(n);
      return r && r.default || 0;
    }
    return n = zx.has(n) ? n : km(n), e.getAttribute(n);
  }
  scrapeMotionValuesFromProps(e, n, r) {
    return $x(e, n, r);
  }
  build(e, n, r) {
    Bx(e, n, this.isSVGTag, r.transformTemplate, r.style);
  }
  renderInstance(e, n, r, s) {
    YM(e, n, r, s);
  }
  mount(e) {
    this.isSVGTag = Ux(e.tagName), super.mount(e);
  }
}
const qM = Rm.length;
function Hx(t) {
  if (!t)
    return;
  if (!t.isControllingVariants) {
    const n = t.parent ? Hx(t.parent) || {} : {};
    return t.props.initial !== void 0 && (n.initial = t.props.initial), n;
  }
  const e = {};
  for (let n = 0; n < qM; n++) {
    const r = Rm[n], s = t.props[r];
    (Fa(s) || s === !1) && (e[r] = s);
  }
  return e;
}
function Wx(t, e) {
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
const ZM = [...bm].reverse(), JM = bm.length;
function eD(t) {
  return (e) => Promise.all(e.map(({ animation: n, options: r }) => qR(t, n, r)));
}
function tD(t) {
  let e = eD(t), n = a_(), r = !0, s = !1;
  const a = (m) => (y, f) => {
    var g;
    const p = Ji(t, f, m === "exit" ? (g = t.presenceContext) == null ? void 0 : g.custom : void 0);
    if (p) {
      const { transition: S, transitionEnd: _, ...x } = p;
      y = { ...y, ...x, ..._ };
    }
    return y;
  };
  function l(m) {
    e = m(t);
  }
  function c(m) {
    const { props: y } = t, f = Hx(t.parent) || {}, p = [], g = /* @__PURE__ */ new Set();
    let S = {}, _ = 1 / 0;
    for (let T = 0; T < JM; T++) {
      const E = ZM[T], A = n[E], b = y[E] !== void 0 ? y[E] : f[E], M = Fa(b), B = E === m ? A.isActive : null;
      B === !1 && (_ = T);
      let I = b === f[E] && b !== y[E] && M;
      if (I && (r || s) && t.manuallyAnimateOnMount && (I = !1), A.protectedKeys = { ...S }, // If it isn't active and hasn't *just* been set as inactive
      !A.isActive && B === null || // If we didn't and don't have any defined prop for this animation type
      !b && !A.prevProp || // Or if the prop doesn't define an animation
      Lc(b) || typeof b == "boolean")
        continue;
      if (E === "exit" && A.isActive && B !== !0) {
        A.prevResolvedValues && (S = {
          ...S,
          ...A.prevResolvedValues
        });
        continue;
      }
      const O = nD(A.prevProp, b);
      let L = O || // If we're making this variant active, we want to always make it active
      E === m && A.isActive && !I && M || // If we removed a higher-priority variant (i is in reverse order)
      T > _ && M, $ = !1;
      const q = Array.isArray(b) ? b : [b];
      let J = q.reduce(a(E), {});
      B === !1 && (J = {});
      const { prevResolvedValues: ie = {} } = A, re = {
        ...ie,
        ...J
      }, ue = (W) => {
        L = !0, g.has(W) && ($ = !0, g.delete(W)), A.needsAnimating[W] = !0;
        const ee = t.getValue(W);
        ee && (ee.liveStyle = !1);
      };
      for (const W in re) {
        const ee = J[W], Z = ie[W];
        if (S.hasOwnProperty(W))
          continue;
        let j = !1;
        Kh(ee) && Kh(Z) ? j = !Wx(ee, Z) || O : j = ee !== Z, j ? ee != null ? ue(W) : g.add(W) : ee !== void 0 && g.has(W) ? ue(W) : A.protectedKeys[W] = !0;
      }
      A.prevProp = b, A.prevResolvedValues = J, A.isActive && (S = { ...S, ...J }), (r || s) && t.blockInitialAnimation && (L = !1);
      const fe = I && O;
      L && (!fe || $) && p.push(...q.map((W) => {
        const ee = { type: E };
        if (typeof W == "string" && (r || s) && !fe && t.manuallyAnimateOnMount && t.parent) {
          const { parent: Z } = t, j = Ji(Z, W);
          if (Z.enteringChildren && j) {
            const { delayChildren: H } = j.transition || {};
            ee.delay = px(Z.enteringChildren, t, H);
          }
        }
        return {
          animation: W,
          options: ee
        };
      }));
    }
    if (g.size) {
      const T = {};
      if (typeof y.initial != "boolean") {
        const E = Ji(t, Array.isArray(y.initial) ? y.initial[0] : y.initial);
        E && E.transition && (T.transition = E.transition);
      }
      g.forEach((E) => {
        const A = t.getBaseTarget(E), b = t.getValue(E);
        b && (b.liveStyle = !0), T[E] = A ?? null;
      }), p.push({ animation: T });
    }
    let x = !!p.length;
    return r && (y.initial === !1 || y.initial === y.animate) && !t.manuallyAnimateOnMount && (x = !1), r = !1, s = !1, x ? e(p) : Promise.resolve();
  }
  function d(m, y) {
    var p;
    if (n[m].isActive === y)
      return Promise.resolve();
    (p = t.variantChildren) == null || p.forEach((g) => {
      var S;
      return (S = g.animationState) == null ? void 0 : S.setActive(m, y);
    }), n[m].isActive = y;
    const f = c(m);
    for (const g in n)
      n[g].protectedKeys = {};
    return f;
  }
  return {
    animateChanges: c,
    setActive: d,
    setAnimateFunction: l,
    getState: () => n,
    reset: () => {
      n = a_(), s = !0;
    }
  };
}
function nD(t, e) {
  return typeof e == "string" ? e !== t : Array.isArray(e) ? !Wx(e, t) : !1;
}
function Ri(t = !1) {
  return {
    isActive: t,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function a_() {
  return {
    animate: Ri(!0),
    whileInView: Ri(),
    whileHover: Ri(),
    whileTap: Ri(),
    whileDrag: Ri(),
    whileFocus: Ri(),
    exit: Ri()
  };
}
function rp(t, e) {
  t.min = e.min, t.max = e.max;
}
function Fn(t, e) {
  rp(t.x, e.x), rp(t.y, e.y);
}
function l_(t, e) {
  t.translate = e.translate, t.scale = e.scale, t.originPoint = e.originPoint, t.origin = e.origin;
}
const Gx = 1e-4, rD = 1 - Gx, iD = 1 + Gx, Kx = 0.01, sD = 0 - Kx, oD = 0 + Kx;
function Ft(t) {
  return t.max - t.min;
}
function aD(t, e, n) {
  return Math.abs(t - e) <= n;
}
function u_(t, e, n, r = 0.5) {
  t.origin = r, t.originPoint = Fe(e.min, e.max, t.origin), t.scale = Ft(n) / Ft(e), t.translate = Fe(n.min, n.max, t.origin) - t.originPoint, (t.scale >= rD && t.scale <= iD || isNaN(t.scale)) && (t.scale = 1), (t.translate >= sD && t.translate <= oD || isNaN(t.translate)) && (t.translate = 0);
}
function xa(t, e, n, r) {
  u_(t.x, e.x, n.x, r ? r.originX : void 0), u_(t.y, e.y, n.y, r ? r.originY : void 0);
}
function c_(t, e, n, r = 0) {
  const s = r ? Fe(n.min, n.max, r) : n.min;
  t.min = s + e.min, t.max = t.min + Ft(e);
}
function lD(t, e, n, r) {
  c_(t.x, e.x, n.x, r == null ? void 0 : r.x), c_(t.y, e.y, n.y, r == null ? void 0 : r.y);
}
function f_(t, e, n, r = 0) {
  const s = r ? Fe(n.min, n.max, r) : n.min;
  t.min = e.min - s, t.max = t.min + Ft(e);
}
function gc(t, e, n, r) {
  f_(t.x, e.x, n.x, r == null ? void 0 : r.x), f_(t.y, e.y, n.y, r == null ? void 0 : r.y);
}
function d_(t, e, n, r, s) {
  return t -= e, t = yc(t, 1 / n, r), s !== void 0 && (t = yc(t, 1 / s, r)), t;
}
function uD(t, e = 0, n = 1, r = 0.5, s, a = t, l = t) {
  if (nr.test(e) && (e = parseFloat(e), e = Fe(l.min, l.max, e / 100) - l.min), typeof e != "number")
    return;
  let c = Fe(a.min, a.max, r);
  t === a && (c -= e), t.min = d_(t.min, e, n, c, s), t.max = d_(t.max, e, n, c, s);
}
function h_(t, e, [n, r, s], a, l) {
  uD(t, e[n], e[r], e[s], e.scale, a, l);
}
const cD = ["x", "scaleX", "originX"], fD = ["y", "scaleY", "originY"];
function p_(t, e, n, r) {
  h_(t.x, e, cD, n ? n.x : void 0, r ? r.x : void 0), h_(t.y, e, fD, n ? n.y : void 0, r ? r.y : void 0);
}
function m_(t) {
  return t.translate === 0 && t.scale === 1;
}
function Qx(t) {
  return m_(t.x) && m_(t.y);
}
function y_(t, e) {
  return t.min === e.min && t.max === e.max;
}
function dD(t, e) {
  return y_(t.x, e.x) && y_(t.y, e.y);
}
function g_(t, e) {
  return Math.round(t.min) === Math.round(e.min) && Math.round(t.max) === Math.round(e.max);
}
function Yx(t, e) {
  return g_(t.x, e.x) && g_(t.y, e.y);
}
function v_(t) {
  return Ft(t.x) / Ft(t.y);
}
function __(t, e) {
  return t.translate === e.translate && t.scale === e.scale && t.originPoint === e.originPoint;
}
function Gn(t) {
  return [t("x"), t("y")];
}
function hD(t, e, n) {
  let r = "";
  const s = t.x.translate / e.x, a = t.y.translate / e.y, l = (n == null ? void 0 : n.z) || 0;
  if ((s || a || l) && (r = `translate3d(${s}px, ${a}px, ${l}px) `), (e.x !== 1 || e.y !== 1) && (r += `scale(${1 / e.x}, ${1 / e.y}) `), n) {
    const { transformPerspective: m, rotate: y, pathRotation: f, rotateX: p, rotateY: g, skewX: S, skewY: _ } = n;
    m && (r = `perspective(${m}px) ${r}`), y && (r += `rotate(${y}deg) `), f && (r += `rotate(${f}deg) `), p && (r += `rotateX(${p}deg) `), g && (r += `rotateY(${g}deg) `), S && (r += `skewX(${S}deg) `), _ && (r += `skewY(${_}deg) `);
  }
  const c = t.x.scale * e.x, d = t.y.scale * e.y;
  return (c !== 1 || d !== 1) && (r += `scale(${c}, ${d})`), r || "none";
}
const Xx = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
], pD = Xx.length, w_ = (t) => typeof t == "string" ? parseFloat(t) : t, S_ = (t) => typeof t == "number" || ae.test(t);
function mD(t, e, n, r, s, a) {
  s ? (t.opacity = Fe(0, n.opacity ?? 1, yD(r)), t.opacityExit = Fe(e.opacity ?? 1, 0, gD(r))) : a && (t.opacity = Fe(e.opacity ?? 1, n.opacity ?? 1, r));
  for (let l = 0; l < pD; l++) {
    const c = Xx[l];
    let d = x_(e, c), m = x_(n, c);
    if (d === void 0 && m === void 0)
      continue;
    d || (d = 0), m || (m = 0), d === 0 || m === 0 || S_(d) === S_(m) ? (t[c] = Math.max(Fe(w_(d), w_(m), r), 0), (nr.test(m) || nr.test(d)) && (t[c] += "%")) : t[c] = m;
  }
  (e.rotate || n.rotate) && (t.rotate = Fe(e.rotate || 0, n.rotate || 0, r));
}
function x_(t, e) {
  return t[e] !== void 0 ? t[e] : t.borderRadius;
}
const yD = /* @__PURE__ */ qx(0, 0.5, US), gD = /* @__PURE__ */ qx(0.5, 0.95, Cn);
function qx(t, e, n) {
  return (r) => r < t ? 0 : r > e ? 1 : n(/* @__PURE__ */ Ma(t, e, r));
}
function vD(t, e, n) {
  const r = _t(t) ? t : lo(t);
  return r.start(Tm("", r, e, n)), r.animation;
}
function Oa(t, e, n, r = { passive: !0 }) {
  return t.addEventListener(e, n, r), () => t.removeEventListener(e, n);
}
const _D = (t, e) => t.depth - e.depth;
class wD {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(e) {
    fm(this.children, e), this.isDirty = !0;
  }
  remove(e) {
    uc(this.children, e), this.isDirty = !0;
  }
  forEach(e) {
    this.isDirty && this.children.sort(_D), this.isDirty = !1, this.children.forEach(e);
  }
}
function SD(t, e) {
  const n = Dt.now(), r = ({ timestamp: s }) => {
    const a = s - n;
    a >= e && (ci(r), t(a - e));
  };
  return Oe.setup(r, !0), () => ci(r);
}
function Zu(t) {
  return _t(t) ? t.get() : t;
}
class xD {
  constructor() {
    this.members = [];
  }
  add(e) {
    fm(this.members, e);
    for (let n = this.members.length - 1; n >= 0; n--) {
      const r = this.members[n];
      if (r === e || r === this.lead || r === this.prevLead)
        continue;
      const s = r.instance;
      (!s || s.isConnected === !1) && !r.snapshot && (uc(this.members, r), r.unmount());
    }
    e.scheduleRender();
  }
  remove(e) {
    if (uc(this.members, e), e === this.prevLead && (this.prevLead = void 0), e === this.lead) {
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
const Ju = {
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
}, uh = ["", "X", "Y", "Z"], TD = 1e3;
let CD = 0;
function ch(t, e, n, r) {
  const { latestValues: s } = e;
  s[t] && (n[t] = s[t], e.setStaticValue(t, 0), r && (r[t] = 0));
}
function Zx(t) {
  if (t.hasCheckedOptimisedAppear = !0, t.root === t)
    return;
  const { visualElement: e } = t.options;
  if (!e)
    return;
  const n = _x(e);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: s, layoutId: a } = t.options;
    window.MotionCancelOptimisedAnimation(n, "transform", Oe, !(s || a));
  }
  const { parent: r } = t;
  r && !r.hasCheckedOptimisedAppear && Zx(r);
}
function Jx({ attachResizeListener: t, defaultParent: e, measureScroll: n, checkIsScrollRoot: r, resetTransform: s }) {
  return class {
    constructor(l = {}, c = e == null ? void 0 : e()) {
      this.id = CD++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(ED), this.nodes.forEach(FD), this.nodes.forEach(OD), this.nodes.forEach(AD);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = l, this.root = c ? c.root || c : this, this.path = c ? [...c.path, c] : [], this.parent = c, this.depth = c ? c.depth + 1 : 0;
      for (let d = 0; d < this.path.length; d++)
        this.path[d].shouldResetTransform = !0;
      this.root === this && (this.nodes = new wD());
    }
    addEventListener(l, c) {
      return this.eventHandlers.has(l) || this.eventHandlers.set(l, new dm()), this.eventHandlers.get(l).add(c);
    }
    notifyListeners(l, ...c) {
      const d = this.eventHandlers.get(l);
      d && d.notify(...c);
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
      this.isSVG = Am(l) && !PM(l), this.instance = l;
      const { layoutId: c, layout: d, visualElement: m } = this.options;
      if (m && !m.current && m.mount(l), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (d || c) && (this.isLayoutDirty = !0), t) {
        let y, f = 0;
        const p = () => this.root.updateBlockedByResize = !1;
        Oe.read(() => {
          f = window.innerWidth;
        }), t(l, () => {
          const g = window.innerWidth;
          g !== f && (f = g, this.root.updateBlockedByResize = !0, y && y(), y = SD(p, 250), Ju.hasAnimatedSinceResize && (Ju.hasAnimatedSinceResize = !1, this.nodes.forEach(k_)));
        });
      }
      c && this.root.registerSharedNode(c, this), this.options.animate !== !1 && m && (c || d) && this.addEventListener("didUpdate", ({ delta: y, hasLayoutChanged: f, hasRelativeLayoutChanged: p, layout: g }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const S = this.options.transition || m.getDefaultTransition() || VD, { onLayoutAnimationStart: _, onLayoutAnimationComplete: x } = m.getProps(), T = !this.targetLayout || !Yx(this.targetLayout, g), E = !f && p;
        if (this.options.layoutRoot || this.resumeFrom || E || f && (T || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const A = {
            ...xm(S, "layout"),
            onPlay: _,
            onComplete: x
          };
          (m.shouldReduceMotion || this.options.layoutRoot) && (A.delay = 0, A.type = !1), this.startAnimation(A), this.setAnimationOrigin(y, E, A.path);
        } else
          f || k_(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = g;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const l = this.getStack();
      l && l.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), ci(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(ID), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && Zx(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let y = 0; y < this.path.length; y++) {
        const f = this.path[y];
        f.shouldResetTransform = !0, (typeof f.latestValues.x == "string" || typeof f.latestValues.y == "string") && (f.isLayoutDirty = !0), f.updateScroll("snapshot"), f.options.layoutRoot && f.willUpdate(!1);
      }
      const { layoutId: c, layout: d } = this.options;
      if (c === void 0 && !d)
        return;
      const m = this.getTransformTemplate();
      this.prevTransformTemplateValue = m ? m(this.latestValues, "") : void 0, this.updateSnapshot(), l && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const d = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), d && this.nodes.forEach(RD), this.nodes.forEach(T_);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(C_);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(MD), this.nodes.forEach(DD), this.nodes.forEach(kD), this.nodes.forEach(PD)) : this.nodes.forEach(C_), this.clearAllSnapshots();
      const c = Dt.now();
      gt.delta = rr(0, 1e3 / 60, c - gt.timestamp), gt.timestamp = c, gt.isProcessing = !0, th.update.process(gt), th.preRender.process(gt), th.render.process(gt), gt.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, Pm.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(bD), this.sharedNodes.forEach(ND);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, Oe.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      Oe.postRender(() => {
        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !Ft(this.snapshot.measuredBox.x) && !Ft(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let d = 0; d < this.path.length; d++)
          this.path[d].updateScroll();
      const l = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = at()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: c } = this.options;
      c && c.notify("LayoutMeasure", this.layout.layoutBox, l ? l.layoutBox : void 0);
    }
    updateScroll(l = "measure") {
      let c = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === l && (c = !1), c && this.instance) {
        const d = r(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: l,
          isRoot: d,
          offset: n(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : d
        };
      }
    }
    resetTransform() {
      if (!s)
        return;
      const l = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, c = this.projectionDelta && !Qx(this.projectionDelta), d = this.getTransformTemplate(), m = d ? d(this.latestValues, "") : void 0, y = m !== this.prevTransformTemplateValue;
      l && this.instance && (c || Ii(this.latestValues) || y) && (s(this.instance, m), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(l = !0) {
      const c = this.measurePageBox();
      let d = this.removeElementScroll(c);
      return l && (d = this.removeTransform(d)), BD(d), {
        animationId: this.root.animationId,
        measuredBox: c,
        layoutBox: d,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      var m;
      const { visualElement: l } = this.options;
      if (!l)
        return at();
      const c = l.measureViewportBox();
      if (!(((m = this.scroll) == null ? void 0 : m.wasRoot) || this.path.some(zD))) {
        const { scroll: y } = this.root;
        y && (qn(c.x, y.offset.x), qn(c.y, y.offset.y));
      }
      return c;
    }
    removeElementScroll(l) {
      var d;
      const c = at();
      if (Fn(c, l), (d = this.scroll) != null && d.wasRoot)
        return c;
      for (let m = 0; m < this.path.length; m++) {
        const y = this.path[m], { scroll: f, options: p } = y;
        y !== this.root && f && p.layoutScroll && (f.wasRoot && Fn(c, l), qn(c.x, f.offset.x), qn(c.y, f.offset.y));
      }
      return c;
    }
    applyTransform(l, c = !1, d) {
      var y, f;
      const m = d || at();
      Fn(m, l);
      for (let p = 0; p < this.path.length; p++) {
        const g = this.path[p];
        !c && g.options.layoutScroll && g.scroll && g !== g.root && (qn(m.x, -g.scroll.offset.x), qn(m.y, -g.scroll.offset.y)), Ii(g.latestValues) && qu(m, g.latestValues, (y = g.layout) == null ? void 0 : y.layoutBox);
      }
      return Ii(this.latestValues) && qu(m, this.latestValues, (f = this.layout) == null ? void 0 : f.layoutBox), m;
    }
    removeTransform(l) {
      var d;
      const c = at();
      Fn(c, l);
      for (let m = 0; m < this.path.length; m++) {
        const y = this.path[m];
        if (!Ii(y.latestValues))
          continue;
        let f;
        y.instance && (ep(y.latestValues) && y.updateSnapshot(), f = at(), Fn(f, y.measurePageBox())), p_(c, y.latestValues, (d = y.snapshot) == null ? void 0 : d.layoutBox, f);
      }
      return Ii(this.latestValues) && p_(c, this.latestValues), c;
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
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== gt.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(l = !1) {
      var g;
      const c = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = c.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = c.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = c.isSharedProjectionDirty);
      const d = !!this.resumingFrom || this !== c;
      if (!(l || d && this.isSharedProjectionDirty || this.isProjectionDirty || (g = this.parent) != null && g.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: y, layoutId: f } = this.options;
      if (!this.layout || !(y || f))
        return;
      this.resolvedRelativeTargetAt = gt.timestamp;
      const p = this.getClosestProjectingParent();
      p && this.linkedParentVersion !== p.layoutVersion && !p.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && p && p.layout ? this.createRelativeTarget(p, this.layout.layoutBox, p.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = at(), this.targetWithTransforms = at()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), lD(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : Fn(this.target, this.layout.layoutBox), Nx(this.target, this.targetDelta)) : Fn(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && p && !!p.resumingFrom == !!this.resumingFrom && !p.options.layoutScroll && p.target && this.animationProgress !== 1 ? this.createRelativeTarget(p, this.target, p.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || ep(this.parent.latestValues) || Ix(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(l, c, d) {
      this.relativeParent = l, this.linkedParentVersion = l.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = at(), this.relativeTargetOrigin = at(), gc(this.relativeTargetOrigin, c, d, this.options.layoutAnchor || void 0), Fn(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      var S;
      const l = this.getLead(), c = !!this.resumingFrom || this !== l;
      let d = !0;
      if ((this.isProjectionDirty || (S = this.parent) != null && S.isProjectionDirty) && (d = !1), c && (this.isSharedProjectionDirty || this.isTransformDirty) && (d = !1), this.resolvedRelativeTargetAt === gt.timestamp && (d = !1), d)
        return;
      const { layout: m, layoutId: y } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(m || y))
        return;
      Fn(this.layoutCorrected, this.layout.layoutBox);
      const f = this.treeScale.x, p = this.treeScale.y;
      LM(this.layoutCorrected, this.treeScale, this.path, c), l.layout && !l.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (l.target = l.layout.layoutBox, l.targetWithTransforms = at());
      const { target: g } = l;
      if (!g) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (l_(this.prevProjectionDelta.x, this.projectionDelta.x), l_(this.prevProjectionDelta.y, this.projectionDelta.y)), xa(this.projectionDelta, this.layoutCorrected, g, this.latestValues), (this.treeScale.x !== f || this.treeScale.y !== p || !__(this.projectionDelta.x, this.prevProjectionDelta.x) || !__(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", g));
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
        const d = this.getStack();
        d && d.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = Bs(), this.projectionDelta = Bs(), this.projectionDeltaWithTransform = Bs();
    }
    setAnimationOrigin(l, c = !1, d) {
      const m = this.snapshot, y = m ? m.latestValues : {}, f = { ...this.latestValues }, p = Bs();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !c;
      const g = at(), S = m ? m.source : void 0, _ = this.layout ? this.layout.source : void 0, x = S !== _, T = this.getStack(), E = !T || T.members.length <= 1, A = !!(x && !E && this.options.crossfade === !0 && !this.path.some(jD));
      this.animationProgress = 0;
      let b;
      const M = d == null ? void 0 : d.interpolateProjection(l);
      this.mixTargetDelta = (B) => {
        const I = B / 1e3, O = M == null ? void 0 : M(I);
        O ? (p.x.translate = O.x, p.x.scale = Fe(l.x.scale, 1, I), p.x.origin = l.x.origin, p.x.originPoint = l.x.originPoint, p.y.translate = O.y, p.y.scale = Fe(l.y.scale, 1, I), p.y.origin = l.y.origin, p.y.originPoint = l.y.originPoint) : (P_(p.x, l.x, I), P_(p.y, l.y, I)), this.setTargetDelta(p), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (gc(g, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), LD(this.relativeTarget, this.relativeTargetOrigin, g, I), b && dD(this.relativeTarget, b) && (this.isProjectionDirty = !1), b || (b = at()), Fn(b, this.relativeTarget)), x && (this.animationValues = f, mD(f, y, this.latestValues, I, A, E)), O && O.rotate !== void 0 && (this.animationValues || (this.animationValues = f), this.animationValues.pathRotation = O.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = I;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(l) {
      var c, d, m;
      this.notifyListeners("animationStart"), (c = this.currentAnimation) == null || c.stop(), (m = (d = this.resumingFrom) == null ? void 0 : d.currentAnimation) == null || m.stop(), this.pendingAnimation && (ci(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Oe.update(() => {
        Ju.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = lo(0)), this.motionValue.jump(0, !1), this.currentAnimation = vD(this.motionValue, [0, 1e3], {
          ...l,
          velocity: 0,
          isSync: !0,
          onUpdate: (y) => {
            this.mixTargetDelta(y), l.onUpdate && l.onUpdate(y);
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(TD), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const l = this.getLead();
      let { targetWithTransforms: c, target: d, layout: m, latestValues: y } = l;
      if (!(!c || !d || !m)) {
        if (this !== l && this.layout && m && e1(this.options.animationType, this.layout.layoutBox, m.layoutBox)) {
          d = this.target || at();
          const f = Ft(this.layout.layoutBox.x);
          d.x.min = l.target.x.min, d.x.max = d.x.min + f;
          const p = Ft(this.layout.layoutBox.y);
          d.y.min = l.target.y.min, d.y.max = d.y.min + p;
        }
        Fn(c, d), qu(c, y), xa(this.projectionDeltaWithTransform, this.layoutCorrected, c, y);
      }
    }
    registerSharedNode(l, c) {
      this.sharedNodes.has(l) || this.sharedNodes.set(l, new xD()), this.sharedNodes.get(l).add(c);
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
    promote({ needsReset: l, transition: c, preserveFollowOpacity: d } = {}) {
      const m = this.getStack();
      m && m.promote(this, d), l && (this.projectionDelta = void 0, this.needsReset = !0), c && this.setOptions({ transition: c });
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
      const { latestValues: d } = l;
      if ((d.z || d.rotate || d.rotateX || d.rotateY || d.rotateZ || d.skewX || d.skewY) && (c = !0), !c)
        return;
      const m = {};
      d.z && ch("z", l, m, this.animationValues);
      for (let y = 0; y < uh.length; y++)
        ch(`rotate${uh[y]}`, l, m, this.animationValues), ch(`skew${uh[y]}`, l, m, this.animationValues);
      l.render();
      for (const y in m)
        l.setStaticValue(y, m[y]), this.animationValues && (this.animationValues[y] = m[y]);
      l.scheduleRender();
    }
    applyProjectionStyles(l, c) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        l.visibility = "hidden";
        return;
      }
      const d = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = !1, l.visibility = "", l.opacity = "", l.pointerEvents = Zu(c == null ? void 0 : c.pointerEvents) || "", l.transform = d ? d(this.latestValues, "") : "none";
        return;
      }
      const m = this.getLead();
      if (!this.projectionDelta || !this.layout || !m.target) {
        this.options.layoutId && (l.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, l.pointerEvents = Zu(c == null ? void 0 : c.pointerEvents) || ""), this.hasProjected && !Ii(this.latestValues) && (l.transform = d ? d({}, "") : "none", this.hasProjected = !1);
        return;
      }
      l.visibility = "";
      const y = m.animationValues || m.latestValues;
      this.applyTransformsToTarget();
      let f = hD(this.projectionDeltaWithTransform, this.treeScale, y);
      d && (f = d(y, f)), l.transform = f;
      const { x: p, y: g } = this.projectionDelta;
      l.transformOrigin = `${p.origin * 100}% ${g.origin * 100}% 0`, m.animationValues ? l.opacity = m === this ? y.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : y.opacityExit : l.opacity = m === this ? y.opacity !== void 0 ? y.opacity : "" : y.opacityExit !== void 0 ? y.opacityExit : 0;
      for (const S in np) {
        if (y[S] === void 0)
          continue;
        const { correct: _, applyTo: x, isCSSVariable: T } = np[S], E = f === "none" ? y[S] : _(y[S], m);
        if (x) {
          const A = x.length;
          for (let b = 0; b < A; b++)
            l[x[b]] = E;
        } else
          T ? this.options.visualElement.renderState.vars[S] = E : l[S] = E;
      }
      this.options.layoutId && (l.pointerEvents = m === this ? Zu(c == null ? void 0 : c.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((l) => {
        var c;
        return (c = l.currentAnimation) == null ? void 0 : c.stop();
      }), this.root.nodes.forEach(T_), this.root.sharedNodes.clear();
    }
  };
}
function kD(t) {
  t.updateLayout();
}
function PD(t) {
  var n;
  const e = ((n = t.resumeFrom) == null ? void 0 : n.snapshot) || t.snapshot;
  if (t.isLead() && t.layout && e && t.hasListeners("didUpdate")) {
    const { layoutBox: r, measuredBox: s } = t.layout, { animationType: a } = t.options, l = e.source !== t.layout.source;
    if (a === "size")
      Gn((f) => {
        const p = l ? e.measuredBox[f] : e.layoutBox[f], g = Ft(p);
        p.min = r[f].min, p.max = p.min + g;
      });
    else if (a === "x" || a === "y") {
      const f = a === "x" ? "y" : "x";
      rp(l ? e.measuredBox[f] : e.layoutBox[f], r[f]);
    } else e1(a, e.layoutBox, r) && Gn((f) => {
      const p = l ? e.measuredBox[f] : e.layoutBox[f], g = Ft(r[f]);
      p.max = p.min + g, t.relativeTarget && !t.currentAnimation && (t.isProjectionDirty = !0, t.relativeTarget[f].max = t.relativeTarget[f].min + g);
    });
    const c = Bs();
    xa(c, r, e.layoutBox);
    const d = Bs();
    l ? xa(d, t.applyTransform(s, !0), e.measuredBox) : xa(d, r, e.layoutBox);
    const m = !Qx(c);
    let y = !1;
    if (!t.resumeFrom) {
      const f = t.getClosestProjectingParent();
      if (f && !f.resumeFrom) {
        const { snapshot: p, layout: g } = f;
        if (p && g) {
          const S = t.options.layoutAnchor || void 0, _ = at();
          gc(_, e.layoutBox, p.layoutBox, S);
          const x = at();
          gc(x, r, g.layoutBox, S), Yx(_, x) || (y = !0), f.options.layoutRoot && (t.relativeTarget = x, t.relativeTargetOrigin = _, t.relativeParent = f);
        }
      }
    }
    t.notifyListeners("didUpdate", {
      layout: r,
      snapshot: e,
      delta: d,
      layoutDelta: c,
      hasLayoutChanged: m,
      hasRelativeLayoutChanged: y
    });
  } else if (t.isLead()) {
    const { onExitComplete: r } = t.options;
    r && r();
  }
  t.options.transition = void 0;
}
function ED(t) {
  t.parent && (t.isProjecting() || (t.isProjectionDirty = t.parent.isProjectionDirty), t.isSharedProjectionDirty || (t.isSharedProjectionDirty = !!(t.isProjectionDirty || t.parent.isProjectionDirty || t.parent.isSharedProjectionDirty)), t.isTransformDirty || (t.isTransformDirty = t.parent.isTransformDirty));
}
function AD(t) {
  t.isProjectionDirty = t.isSharedProjectionDirty = t.isTransformDirty = !1;
}
function bD(t) {
  t.clearSnapshot();
}
function T_(t) {
  t.clearMeasurements();
}
function RD(t) {
  t.isLayoutDirty = !0, t.updateLayout();
}
function C_(t) {
  t.isLayoutDirty = !1;
}
function MD(t) {
  t.isAnimationBlocked && t.layout && !t.isLayoutDirty && (t.snapshot = t.layout, t.isLayoutDirty = !0);
}
function DD(t) {
  const { visualElement: e } = t.options;
  e && e.getProps().onBeforeLayoutMeasure && e.notify("BeforeLayoutMeasure"), t.resetTransform();
}
function k_(t) {
  t.finishAnimation(), t.targetDelta = t.relativeTarget = t.target = void 0, t.isProjectionDirty = !0;
}
function FD(t) {
  t.resolveTargetDelta();
}
function OD(t) {
  t.calcProjection();
}
function ID(t) {
  t.resetSkewAndRotation();
}
function ND(t) {
  t.removeLeadSnapshot();
}
function P_(t, e, n) {
  t.translate = Fe(e.translate, 0, n), t.scale = Fe(e.scale, 1, n), t.origin = e.origin, t.originPoint = e.originPoint;
}
function E_(t, e, n, r) {
  t.min = Fe(e.min, n.min, r), t.max = Fe(e.max, n.max, r);
}
function LD(t, e, n, r) {
  E_(t.x, e.x, n.x, r), E_(t.y, e.y, n.y, r);
}
function jD(t) {
  return t.animationValues && t.animationValues.opacityExit !== void 0;
}
const VD = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, A_ = (t) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(t), b_ = A_("applewebkit/") && !A_("chrome/") ? Math.round : Cn;
function R_(t) {
  t.min = b_(t.min), t.max = b_(t.max);
}
function BD(t) {
  R_(t.x), R_(t.y);
}
function e1(t, e, n) {
  return t === "position" || t === "preserve-aspect" && !aD(v_(e), v_(n), 0.2);
}
function zD(t) {
  var e;
  return t !== t.root && ((e = t.scroll) == null ? void 0 : e.wasRoot);
}
const UD = Jx({
  attachResizeListener: (t, e) => Oa(t, "resize", e),
  measureScroll: () => {
    var t, e;
    return {
      x: document.documentElement.scrollLeft || ((t = document.body) == null ? void 0 : t.scrollLeft) || 0,
      y: document.documentElement.scrollTop || ((e = document.body) == null ? void 0 : e.scrollTop) || 0
    };
  },
  checkIsScrollRoot: () => !0
}), fh = {
  current: void 0
}, t1 = Jx({
  measureScroll: (t) => ({
    x: t.scrollLeft,
    y: t.scrollTop
  }),
  defaultParent: () => {
    if (!fh.current) {
      const t = new UD({});
      t.mount(window), t.setOptions({ layoutScroll: !0 }), fh.current = t;
    }
    return fh.current;
  },
  resetTransform: (t, e) => {
    t.style.transform = e !== void 0 ? e : "none";
  },
  checkIsScrollRoot: (t) => window.getComputedStyle(t).position === "fixed"
}), Fm = k.createContext({
  transformPagePoint: (t) => t,
  isStatic: !1,
  reducedMotion: "never"
});
function M_(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function $D(...t) {
  return (e) => {
    let n = !1;
    const r = t.map((s) => {
      const a = M_(s, e);
      return !n && typeof a == "function" && (n = !0), a;
    });
    if (n)
      return () => {
        for (let s = 0; s < r.length; s++) {
          const a = r[s];
          typeof a == "function" ? a() : M_(t[s], null);
        }
      };
  };
}
function HD(...t) {
  return k.useCallback($D(...t), t);
}
class WD extends k.Component {
  getSnapshotBeforeUpdate(e) {
    const n = this.props.childRef.current;
    if (Ku(n) && e.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const r = n.offsetParent, s = Ku(r) && r.offsetWidth || 0, a = Ku(r) && r.offsetHeight || 0, l = getComputedStyle(n), c = this.props.sizeRef.current;
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
function GD({ children: t, isPresent: e, anchorX: n, anchorY: r, root: s, pop: a }) {
  var p;
  const l = k.useId(), c = k.useRef(null), d = k.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: m } = k.useContext(Fm), y = ((p = t.props) == null ? void 0 : p.ref) ?? (t == null ? void 0 : t.ref), f = HD(c, y);
  return k.useInsertionEffect(() => {
    const { width: g, height: S, top: _, left: x, right: T, bottom: E, direction: A } = d.current;
    if (e || a === !1 || !c.current || !g || !S)
      return;
    const b = A === "rtl", M = n === "left" ? b ? `right: ${T}` : `left: ${x}` : b ? `left: ${x}` : `right: ${T}`, B = r === "bottom" ? `bottom: ${E}` : `top: ${_}`;
    c.current.dataset.motionPopId = l;
    const I = document.createElement("style");
    m && (I.nonce = m);
    const O = s ?? document.head;
    return O.appendChild(I), I.sheet && I.sheet.insertRule(`
          [data-motion-pop-id="${l}"] {
            position: absolute !important;
            width: ${g}px !important;
            height: ${S}px !important;
            ${M}px !important;
            ${B}px !important;
          }
        `), () => {
      var L;
      (L = c.current) == null || L.removeAttribute("data-motion-pop-id"), O.contains(I) && O.removeChild(I);
    };
  }, [e]), C.jsx(WD, { isPresent: e, childRef: c, sizeRef: d, pop: a, children: a === !1 ? t : k.cloneElement(t, { ref: f }) });
}
const KD = ({ children: t, initial: e, isPresent: n, onExitComplete: r, custom: s, presenceAffectsLayout: a, mode: l, anchorX: c, anchorY: d, root: m }) => {
  const y = cm(QD), f = k.useId();
  let p = !0, g = k.useMemo(() => (p = !1, {
    id: f,
    initial: e,
    isPresent: n,
    custom: s,
    onExitComplete: (S) => {
      y.set(S, !0);
      for (const _ of y.values())
        if (!_)
          return;
      r && r();
    },
    register: (S) => (y.set(S, !1), () => y.delete(S))
  }), [n, y, r]);
  return a && p && (g = { ...g }), k.useMemo(() => {
    y.forEach((S, _) => y.set(_, !1));
  }, [n]), k.useEffect(() => {
    !n && !y.size && r && r();
  }, [n]), t = C.jsx(GD, { pop: l === "popLayout", isPresent: n, anchorX: c, anchorY: d, root: m, children: t }), C.jsx(Ic.Provider, { value: g, children: t });
};
function QD() {
  return /* @__PURE__ */ new Map();
}
function n1(t = !0) {
  const e = k.useContext(Ic);
  if (e === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: r, register: s } = e, a = k.useId();
  k.useEffect(() => {
    if (t)
      return s(a);
  }, [t]);
  const l = k.useCallback(() => t && r && r(a), [a, r, t]);
  return !n && r ? [!1, l] : [!0];
}
const Ru = (t) => t.key || "";
function D_(t) {
  const e = [];
  return k.Children.forEach(t, (n) => {
    k.isValidElement(n) && e.push(n);
  }), e;
}
const mi = ({ children: t, custom: e, initial: n = !0, onExitComplete: r, presenceAffectsLayout: s = !0, mode: a = "sync", propagate: l = !1, anchorX: c = "left", anchorY: d = "top", root: m }) => {
  const [y, f] = n1(l), p = k.useMemo(() => D_(t), [t]), g = l && !y ? [] : p.map(Ru), S = k.useRef(!0), _ = k.useRef(p), x = cm(() => /* @__PURE__ */ new Map()), T = k.useRef(/* @__PURE__ */ new Set()), [E, A] = k.useState(p), [b, M] = k.useState(p);
  RS(() => {
    S.current = !1, _.current = p;
    for (let O = 0; O < b.length; O++) {
      const L = Ru(b[O]);
      g.includes(L) ? (x.delete(L), T.current.delete(L)) : x.get(L) !== !0 && x.set(L, !1);
    }
  }, [b, g.length, g.join("-")]);
  const B = [];
  if (p !== E) {
    let O = [...p];
    for (let L = 0; L < b.length; L++) {
      const $ = b[L], q = Ru($);
      g.includes(q) || (O.splice(L, 0, $), B.push($));
    }
    return a === "wait" && B.length && (O = B), M(D_(O)), A(p), null;
  }
  const { forceRender: I } = k.useContext(um);
  return C.jsx(C.Fragment, { children: b.map((O) => {
    const L = Ru(O), $ = l && !y ? !1 : p === b || g.includes(L), q = () => {
      if (T.current.has(L))
        return;
      if (x.has(L))
        T.current.add(L), x.set(L, !0);
      else
        return;
      let J = !0;
      x.forEach((ie) => {
        ie || (J = !1);
      }), J && (I == null || I(), M(_.current), l && (f == null || f()), r && r());
    };
    return C.jsx(KD, { isPresent: $, initial: !S.current || n ? void 0 : !1, custom: e, presenceAffectsLayout: s, mode: a, root: m, onExitComplete: $ ? void 0 : q, anchorX: c, anchorY: d, children: O }, L);
  }) });
}, r1 = k.createContext({ strict: !1 }), F_ = {
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
let O_ = !1;
function YD() {
  if (O_)
    return;
  const t = {};
  for (const e in F_)
    t[e] = {
      isEnabled: (n) => F_[e].some((r) => !!n[r])
    };
  Dx(t), O_ = !0;
}
function i1() {
  return YD(), FM();
}
function XD(t) {
  const e = i1();
  for (const n in t)
    e[n] = {
      ...e[n],
      ...t[n]
    };
  Dx(e);
}
const qD = /* @__PURE__ */ new Set([
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
function vc(t) {
  return t.startsWith("while") || t.startsWith("drag") && t !== "draggable" || t.startsWith("layout") || t.startsWith("onTap") || t.startsWith("onPan") || t.startsWith("onLayout") || qD.has(t);
}
let s1 = (t) => !vc(t);
function ZD(t) {
  typeof t == "function" && (s1 = (e) => e.startsWith("on") ? !vc(e) : t(e));
}
try {
  ZD(require("@emotion/is-prop-valid").default);
} catch {
}
function JD(t, e, n) {
  const r = {};
  for (const s in t)
    s === "values" && typeof t.values == "object" || _t(t[s]) || (s1(s) || n === !0 && vc(s) || !e && !vc(s) || // If trying to use native HTML drag events, forward drag listeners
    t.draggable && s.startsWith("onDrag")) && (r[s] = t[s]);
  return r;
}
const Vc = /* @__PURE__ */ k.createContext({});
function eF(t, e) {
  if (jc(t)) {
    const { initial: n, animate: r } = t;
    return {
      initial: n === !1 || Fa(n) ? n : void 0,
      animate: Fa(r) ? r : void 0
    };
  }
  return t.inherit !== !1 ? e : {};
}
function tF(t) {
  const { initial: e, animate: n } = eF(t, k.useContext(Vc));
  return k.useMemo(() => ({ initial: e, animate: n }), [I_(e), I_(n)]);
}
function I_(t) {
  return Array.isArray(t) ? t.join(" ") : t;
}
const Om = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function o1(t, e, n) {
  for (const r in e)
    !_t(e[r]) && !Vx(r, n) && (t[r] = e[r]);
}
function nF({ transformTemplate: t }, e) {
  return k.useMemo(() => {
    const n = Om();
    return Mm(n, e, t), Object.assign({}, n.vars, n.style);
  }, [e]);
}
function rF(t, e) {
  const n = t.style || {}, r = {};
  return o1(r, n, t), Object.assign(r, nF(t, e)), r;
}
function iF(t, e) {
  const n = {}, r = rF(t, e);
  return t.drag && t.dragListener !== !1 && (n.draggable = !1, r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none", r.touchAction = t.drag === !0 ? "none" : `pan-${t.drag === "x" ? "y" : "x"}`), t.tabIndex === void 0 && (t.onTap || t.onTapStart || t.whileTap) && (n.tabIndex = 0), n.style = r, n;
}
const a1 = () => ({
  ...Om(),
  attrs: {}
});
function sF(t, e, n, r) {
  const s = k.useMemo(() => {
    const a = a1();
    return Bx(a, e, Ux(r), t.transformTemplate, t.style), {
      ...a.attrs,
      style: { ...a.style }
    };
  }, [e]);
  if (t.style) {
    const a = {};
    o1(a, t.style, t), s.style = { ...a, ...s.style };
  }
  return s;
}
const oF = [
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
function Im(t) {
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
      !!(oF.indexOf(t) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(t))
    )
  );
}
function aF(t, e, n, { latestValues: r }, s, a = !1, l) {
  const d = (l ?? Im(t) ? sF : iF)(e, r, s, t), m = JD(e, typeof t == "string", a), y = t !== k.Fragment ? { ...m, ...d, ref: n } : {}, { children: f } = e, p = k.useMemo(() => _t(f) ? f.get() : f, [f]);
  return k.createElement(t, {
    ...y,
    children: p
  });
}
function lF({ scrapeMotionValuesFromProps: t, createRenderState: e }, n, r, s) {
  return {
    latestValues: uF(n, r, s, t),
    renderState: e()
  };
}
function uF(t, e, n, r) {
  const s = {}, a = r(t, {});
  for (const p in a)
    s[p] = Zu(a[p]);
  let { initial: l, animate: c } = t;
  const d = jc(t), m = Rx(t);
  e && m && !d && t.inherit !== !1 && (l === void 0 && (l = e.initial), c === void 0 && (c = e.animate));
  let y = n ? n.initial === !1 : !1;
  y = y || l === !1;
  const f = y ? c : l;
  if (f && typeof f != "boolean" && !Lc(f)) {
    const p = Array.isArray(f) ? f : [f];
    for (let g = 0; g < p.length; g++) {
      const S = Cm(t, p[g]);
      if (S) {
        const { transitionEnd: _, transition: x, ...T } = S;
        for (const E in T) {
          let A = T[E];
          if (Array.isArray(A)) {
            const b = y ? A.length - 1 : 0;
            A = A[b];
          }
          A !== null && (s[E] = A);
        }
        for (const E in _)
          s[E] = _[E];
      }
    }
  }
  return s;
}
const l1 = (t) => (e, n) => {
  const r = k.useContext(Vc), s = k.useContext(Ic), a = () => lF(t, e, r, s);
  return n ? a() : cm(a);
}, cF = /* @__PURE__ */ l1({
  scrapeMotionValuesFromProps: Dm,
  createRenderState: Om
}), fF = /* @__PURE__ */ l1({
  scrapeMotionValuesFromProps: $x,
  createRenderState: a1
}), dF = Symbol.for("motionComponentSymbol");
function hF(t, e, n) {
  const r = k.useRef(n);
  k.useInsertionEffect(() => {
    r.current = n;
  });
  const s = k.useRef(null);
  return k.useCallback((a) => {
    var c;
    a && ((c = t.onMount) == null || c.call(t, a)), e && (a ? e.mount(a) : e.unmount());
    const l = r.current;
    if (typeof l == "function")
      if (a) {
        const d = l(a);
        typeof d == "function" && (s.current = d);
      } else s.current ? (s.current(), s.current = null) : l(a);
    else l && (l.current = a);
  }, [e]);
}
const u1 = k.createContext({});
function Ns(t) {
  return t && typeof t == "object" && Object.prototype.hasOwnProperty.call(t, "current");
}
function pF(t, e, n, r, s, a) {
  var A, b;
  const { visualElement: l } = k.useContext(Vc), c = k.useContext(r1), d = k.useContext(Ic), m = k.useContext(Fm), y = m.reducedMotion, f = m.skipAnimations, p = k.useRef(null), g = k.useRef(!1);
  r = r || c.renderer, !p.current && r && (p.current = r(t, {
    visualState: e,
    parent: l,
    props: n,
    presenceContext: d,
    blockInitialAnimation: d ? d.initial === !1 : !1,
    reducedMotionConfig: y,
    skipAnimations: f,
    isSVG: a
  }), g.current && p.current && (p.current.manuallyAnimateOnMount = !0));
  const S = p.current, _ = k.useContext(u1);
  S && !S.projection && s && (S.type === "html" || S.type === "svg") && mF(p.current, n, s, _);
  const x = k.useRef(!1);
  k.useInsertionEffect(() => {
    S && x.current && S.update(n, d);
  });
  const T = n[vx], E = k.useRef(!!T && typeof window < "u" && !((A = window.MotionHandoffIsComplete) != null && A.call(window, T)) && ((b = window.MotionHasOptimisedAnimation) == null ? void 0 : b.call(window, T)));
  return RS(() => {
    g.current = !0, S && (x.current = !0, window.MotionIsMounted = !0, S.updateFeatures(), S.scheduleRenderMicrotask(), E.current && S.animationState && S.animationState.animateChanges());
  }), k.useEffect(() => {
    S && (!E.current && S.animationState && S.animationState.animateChanges(), E.current && (queueMicrotask(() => {
      var M;
      (M = window.MotionHandoffMarkAsComplete) == null || M.call(window, T);
    }), E.current = !1), S.enteringChildren = void 0);
  }), S;
}
function mF(t, e, n, r) {
  const { layoutId: s, layout: a, drag: l, dragConstraints: c, layoutScroll: d, layoutRoot: m, layoutAnchor: y, layoutCrossfade: f } = e;
  t.projection = new n(t.latestValues, e["data-framer-portal-id"] ? void 0 : c1(t.parent)), t.projection.setOptions({
    layoutId: s,
    layout: a,
    alwaysMeasureLayout: !!l || c && Ns(c),
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
    crossfade: f,
    layoutScroll: d,
    layoutRoot: m,
    layoutAnchor: y
  });
}
function c1(t) {
  if (t)
    return t.options.allowProjection !== !1 ? t.projection : c1(t.parent);
}
function dh(t, { forwardMotionProps: e = !1, type: n } = {}, r, s) {
  r && XD(r);
  const a = n ? n === "svg" : Im(t), l = a ? fF : cF;
  function c(m, y) {
    let f;
    const p = {
      ...k.useContext(Fm),
      ...m,
      layoutId: yF(m)
    }, { isStatic: g } = p, S = tF(m), _ = l(m, g);
    if (!g && typeof window < "u") {
      gF();
      const x = vF(p);
      f = x.MeasureLayout, S.visualElement = pF(t, _, p, s, x.ProjectionNode, a);
    }
    return C.jsxs(Vc.Provider, { value: S, children: [f && S.visualElement ? C.jsx(f, { visualElement: S.visualElement, ...p }) : null, aF(t, m, hF(_, S.visualElement, y), _, g, e, a)] });
  }
  c.displayName = `motion.${typeof t == "string" ? t : `create(${t.displayName ?? t.name ?? ""})`}`;
  const d = k.forwardRef(c);
  return d[dF] = t, d;
}
function yF({ layoutId: t }) {
  const e = k.useContext(um).id;
  return e && t !== void 0 ? e + "-" + t : t;
}
function gF(t, e) {
  k.useContext(r1).strict;
}
function vF(t) {
  const e = i1(), { drag: n, layout: r } = e;
  if (!n && !r)
    return {};
  const s = { ...n, ...r };
  return {
    MeasureLayout: n != null && n.isEnabled(t) || r != null && r.isEnabled(t) ? s.MeasureLayout : void 0,
    ProjectionNode: s.ProjectionNode
  };
}
function _F(t, e) {
  if (typeof Proxy > "u")
    return dh;
  const n = /* @__PURE__ */ new Map(), r = (a, l) => dh(a, l, t, e), s = (a, l) => r(a, l);
  return new Proxy(s, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (a, l) => l === "create" ? r : (n.has(l) || n.set(l, dh(l, void 0, t, e)), n.get(l))
  });
}
const wF = (t, e) => e.isSVG ?? Im(t) ? new XM(e) : new HM(e, {
  allowProjection: t !== k.Fragment
});
class SF extends pi {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(e) {
    super(e), e.animationState || (e.animationState = tD(e));
  }
  updateAnimationControlsSubscription() {
    const { animate: e } = this.node.getProps();
    Lc(e) && (this.unmountControls = e.subscribe(this.node));
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
let xF = 0;
class TF extends pi {
  constructor() {
    super(...arguments), this.id = xF++, this.isExitComplete = !1;
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
          const d = Ji(this.node, l, c);
          if (d) {
            const { transition: m, transitionEnd: y, ...f } = d;
            for (const p in f)
              (a = this.node.getValue(p)) == null || a.jump(f[p]);
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
const CF = {
  animation: {
    Feature: SF
  },
  exit: {
    Feature: TF
  }
};
function sl(t) {
  return {
    point: {
      x: t.pageX,
      y: t.pageY
    }
  };
}
const kF = (t) => (e) => Em(e) && t(e, sl(e));
function Ta(t, e, n, r) {
  return Oa(t, e, kF(n), r);
}
const f1 = ({ current: t }) => t ? t.ownerDocument.defaultView : null, N_ = (t, e) => Math.abs(t - e);
function PF(t, e) {
  const n = N_(t.x, e.x), r = N_(t.y, e.y);
  return Math.sqrt(n ** 2 + r ** 2);
}
const L_ = /* @__PURE__ */ new Set(["auto", "scroll"]);
class d1 {
  constructor(e, n, { transformPagePoint: r, contextWindow: s = window, dragSnapToOrigin: a = !1, distanceThreshold: l = 3, element: c } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (g) => {
      this.handleScroll(g.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = Mu(this.lastRawMoveEventInfo, this.transformPagePoint));
      const g = hh(this.lastMoveEventInfo, this.history), S = this.startEvent !== null, _ = PF(g.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!S && !_)
        return;
      const { point: x } = g, { timestamp: T } = gt;
      this.history.push({ ...x, timestamp: T });
      const { onStart: E, onMove: A } = this.handlers;
      S || (E && E(this.lastMoveEvent, g), this.startEvent = this.lastMoveEvent), A && A(this.lastMoveEvent, g);
    }, this.handlePointerMove = (g, S) => {
      this.lastMoveEvent = g, this.lastRawMoveEventInfo = S, this.lastMoveEventInfo = Mu(S, this.transformPagePoint), Oe.update(this.updatePoint, !0);
    }, this.handlePointerUp = (g, S) => {
      this.end();
      const { onEnd: _, onSessionEnd: x, resumeAnimation: T } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && T && T(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const E = hh(g.type === "pointercancel" ? this.lastMoveEventInfo : Mu(S, this.transformPagePoint), this.history);
      this.startEvent && _ && _(g, E), x && x(g, E);
    }, !Em(e))
      return;
    this.dragSnapToOrigin = a, this.handlers = n, this.transformPagePoint = r, this.distanceThreshold = l, this.contextWindow = s || window;
    const d = sl(e), m = Mu(d, this.transformPagePoint), { point: y } = m, { timestamp: f } = gt;
    this.history = [{ ...y, timestamp: f }];
    const { onSessionStart: p } = n;
    p && p(e, hh(m, this.history)), this.removeListeners = nl(Ta(this.contextWindow, "pointermove", this.handlePointerMove), Ta(this.contextWindow, "pointerup", this.handlePointerUp), Ta(this.contextWindow, "pointercancel", this.handlePointerUp)), c && this.startScrollTracking(c);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(e) {
    let n = e.parentElement;
    for (; n; ) {
      const r = getComputedStyle(n);
      (L_.has(r.overflowX) || L_.has(r.overflowY)) && this.scrollPositions.set(n, {
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
    a.x === 0 && a.y === 0 || (r ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += a.x, this.lastMoveEventInfo.point.y += a.y) : this.history.length > 0 && (this.history[0].x -= a.x, this.history[0].y -= a.y), this.scrollPositions.set(e, s), Oe.update(this.updatePoint, !0));
  }
  updateHandlers(e) {
    this.handlers = e;
  }
  end() {
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), ci(this.updatePoint);
  }
}
function Mu(t, e) {
  return e ? { point: e(t.point) } : t;
}
function j_(t, e) {
  return { x: t.x - e.x, y: t.y - e.y };
}
function hh({ point: t }, e) {
  return {
    point: t,
    delta: j_(t, h1(e)),
    offset: j_(t, EF(e)),
    velocity: AF(e, 0.1)
  };
}
function EF(t) {
  return t[0];
}
function h1(t) {
  return t[t.length - 1];
}
function AF(t, e) {
  if (t.length < 2)
    return { x: 0, y: 0 };
  let n = t.length - 1, r = null;
  const s = h1(t);
  for (; n >= 0 && (r = t[n], !(s.timestamp - r.timestamp > /* @__PURE__ */ Wt(e))); )
    n--;
  if (!r)
    return { x: 0, y: 0 };
  r === t[0] && t.length > 2 && s.timestamp - r.timestamp > /* @__PURE__ */ Wt(e) * 2 && (r = t[1]);
  const a = /* @__PURE__ */ Sn(s.timestamp - r.timestamp);
  if (a === 0)
    return { x: 0, y: 0 };
  const l = {
    x: (s.x - r.x) / a,
    y: (s.y - r.y) / a
  };
  return l.x === 1 / 0 && (l.x = 0), l.y === 1 / 0 && (l.y = 0), l;
}
function bF(t, { min: e, max: n }, r) {
  return e !== void 0 && t < e ? t = r ? Fe(e, t, r.min) : Math.max(t, e) : n !== void 0 && t > n && (t = r ? Fe(n, t, r.max) : Math.min(t, n)), t;
}
function V_(t, e, n) {
  return {
    min: e !== void 0 ? t.min + e : void 0,
    max: n !== void 0 ? t.max + n - (t.max - t.min) : void 0
  };
}
function RF(t, { top: e, left: n, bottom: r, right: s }) {
  return {
    x: V_(t.x, n, s),
    y: V_(t.y, e, r)
  };
}
function B_(t, e) {
  let n = e.min - t.min, r = e.max - t.max;
  return e.max - e.min < t.max - t.min && ([n, r] = [r, n]), { min: n, max: r };
}
function MF(t, e) {
  return {
    x: B_(t.x, e.x),
    y: B_(t.y, e.y)
  };
}
function DF(t, e) {
  let n = 0.5;
  const r = Ft(t), s = Ft(e);
  return s > r ? n = /* @__PURE__ */ Ma(e.min, e.max - r, t.min) : r > s && (n = /* @__PURE__ */ Ma(t.min, t.max - s, e.min)), rr(0, 1, n);
}
function FF(t, e) {
  const n = {};
  return e.min !== void 0 && (n.min = e.min - t.min), e.max !== void 0 && (n.max = e.max - t.min), n;
}
const ip = 0.35;
function OF(t = ip) {
  return t === !1 ? t = 0 : t === !0 && (t = ip), {
    x: z_(t, "left", "right"),
    y: z_(t, "top", "bottom")
  };
}
function z_(t, e, n) {
  return {
    min: U_(t, e),
    max: U_(t, n)
  };
}
function U_(t, e) {
  return typeof t == "number" ? t : t[e] || 0;
}
const IF = /* @__PURE__ */ new WeakMap();
class NF {
  constructor(e) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = at(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = e;
  }
  start(e, { snapToCursor: n = !1, distanceThreshold: r } = {}) {
    const { presenceContext: s } = this.visualElement;
    if (s && s.isPresent === !1)
      return;
    const a = (f) => {
      n && this.snapToCursor(sl(f).point), this.stopAnimation();
    }, l = (f, p) => {
      const { drag: g, dragPropagation: S, onDragStart: _ } = this.getProps();
      if (g && !S && (this.openDragLock && this.openDragLock(), this.openDragLock = uM(g), !this.openDragLock))
        return;
      this.latestPointerEvent = f, this.latestPanInfo = p, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Gn((T) => {
        let E = this.getAxisMotionValue(T).get() || 0;
        if (nr.test(E)) {
          const { projection: A } = this.visualElement;
          if (A && A.layout) {
            const b = A.layout.layoutBox[T];
            b && (E = Ft(b) * (parseFloat(E) / 100));
          }
        }
        this.originPoint[T] = E;
      }), _ && Oe.update(() => _(f, p), !1, !0), Qh(this.visualElement, "transform");
      const { animationState: x } = this.visualElement;
      x && x.setActive("whileDrag", !0);
    }, c = (f, p) => {
      this.latestPointerEvent = f, this.latestPanInfo = p;
      const { dragPropagation: g, dragDirectionLock: S, onDirectionLock: _, onDrag: x } = this.getProps();
      if (!g && !this.openDragLock)
        return;
      const { offset: T } = p;
      if (S && this.currentDirection === null) {
        this.currentDirection = jF(T), this.currentDirection !== null && _ && _(this.currentDirection);
        return;
      }
      this.updateAxis("x", p.point, T), this.updateAxis("y", p.point, T), this.visualElement.render(), x && Oe.update(() => x(f, p), !1, !0);
    }, d = (f, p) => {
      this.latestPointerEvent = f, this.latestPanInfo = p, this.stop(f, p), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, m = () => {
      const { dragSnapToOrigin: f } = this.getProps();
      (f || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: y } = this.getProps();
    this.panSession = new d1(e, {
      onSessionStart: a,
      onStart: l,
      onMove: c,
      onSessionEnd: d,
      resumeAnimation: m
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: y,
      distanceThreshold: r,
      contextWindow: f1(this.visualElement),
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
    c && Oe.postRender(() => c(r, s));
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
    if (!r || !Du(e, s, this.currentDirection))
      return;
    const a = this.getAxisMotionValue(e);
    let l = this.originPoint[e] + r[e];
    this.constraints && this.constraints[e] && (l = bF(l, this.constraints[e], this.elastic[e])), a.set(l);
  }
  resolveConstraints() {
    var a;
    const { dragConstraints: e, dragElastic: n } = this.getProps(), r = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (a = this.visualElement.projection) == null ? void 0 : a.layout, s = this.constraints;
    e && Ns(e) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : e && r ? this.constraints = RF(r.layoutBox, e) : this.constraints = !1, this.elastic = OF(n), s !== this.constraints && !Ns(e) && r && this.constraints && !this.hasMutatedConstraints && Gn((l) => {
      this.constraints !== !1 && this.getAxisMotionValue(l) && (this.constraints[l] = FF(r.layoutBox[l], this.constraints[l]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: e, onMeasureDragConstraints: n } = this.getProps();
    if (!e || !Ns(e))
      return !1;
    const r = e.current;
    is(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: s } = this.visualElement;
    if (!s || !s.layout)
      return !1;
    s.root && (s.root.scroll = void 0, s.root.updateScroll());
    const a = jM(r, s.root, this.visualElement.getTransformPagePoint());
    let l = MF(s.layout.layoutBox, a);
    if (n) {
      const c = n(IM(l));
      this.hasMutatedConstraints = !!c, c && (l = Ox(c));
    }
    return l;
  }
  startAnimation(e) {
    const { drag: n, dragMomentum: r, dragElastic: s, dragTransition: a, dragSnapToOrigin: l, onDragTransitionEnd: c } = this.getProps(), d = this.constraints || {}, m = Gn((y) => {
      if (!Du(y, n, this.currentDirection))
        return;
      let f = d && d[y] || {};
      (l === !0 || l === y) && (f = { min: 0, max: 0 });
      const p = s ? 200 : 1e6, g = s ? 40 : 1e7, S = {
        type: "inertia",
        velocity: r ? e[y] : 0,
        bounceStiffness: p,
        bounceDamping: g,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...a,
        ...f
      };
      return this.startAxisValueAnimation(y, S);
    });
    return Promise.all(m).then(c);
  }
  startAxisValueAnimation(e, n) {
    const r = this.getAxisMotionValue(e);
    return Qh(this.visualElement, e), r.start(Tm(e, r, 0, n, this.visualElement, !1));
  }
  stopAnimation() {
    Gn((e) => this.getAxisMotionValue(e).stop());
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
    Gn((n) => {
      const { drag: r } = this.getProps();
      if (!Du(n, r, this.currentDirection))
        return;
      const { projection: s } = this.visualElement, a = this.getAxisMotionValue(n);
      if (s && s.layout) {
        const { min: l, max: c } = s.layout.layoutBox[n], d = a.get() || 0;
        a.set(e[n] - Fe(l, c, 0.5) + d);
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
    if (!Ns(n) || !r || !this.constraints)
      return;
    this.stopAnimation();
    const s = { x: 0, y: 0 };
    Gn((l) => {
      const c = this.getAxisMotionValue(l);
      if (c && this.constraints !== !1) {
        const d = c.get();
        s[l] = DF({ min: d, max: d }, this.constraints[l]);
      }
    });
    const { transformTemplate: a } = this.visualElement.getProps();
    this.visualElement.current.style.transform = a ? a({}, "") : "none", r.root && r.root.updateScroll(), r.updateLayout(), this.constraints = !1, this.resolveConstraints(), Gn((l) => {
      if (!Du(l, e, null))
        return;
      const c = this.getAxisMotionValue(l), { min: d, max: m } = this.constraints[l];
      c.set(Fe(d, m, s[l]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    IF.set(this.visualElement, this);
    const e = this.visualElement.current, n = Ta(e, "pointerdown", (m) => {
      const { drag: y, dragListener: f = !0 } = this.getProps(), p = m.target, g = p !== e && mM(p);
      y && f && !g && this.start(m);
    });
    let r;
    const s = () => {
      const { dragConstraints: m } = this.getProps();
      Ns(m) && m.current && (this.constraints = this.resolveRefConstraints(), r || (r = LF(e, m.current, () => this.scalePositionWithinConstraints())));
    }, { projection: a } = this.visualElement, l = a.addEventListener("measure", s);
    a && !a.layout && (a.root && a.root.updateScroll(), a.updateLayout()), Oe.read(s);
    const c = Oa(window, "resize", () => this.scalePositionWithinConstraints()), d = a.addEventListener("didUpdate", (({ delta: m, hasLayoutChanged: y }) => {
      this.isDragging && y && (Gn((f) => {
        const p = this.getAxisMotionValue(f);
        p && (this.originPoint[f] += m[f].translate, p.set(p.get() + m[f].translate));
      }), this.visualElement.render());
    }));
    return () => {
      c(), n(), l(), d && d(), r && r();
    };
  }
  getProps() {
    const e = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: r = !1, dragPropagation: s = !1, dragConstraints: a = !1, dragElastic: l = ip, dragMomentum: c = !0 } = e;
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
function $_(t) {
  let e = !0;
  return () => {
    if (e) {
      e = !1;
      return;
    }
    t();
  };
}
function LF(t, e, n) {
  const r = X0(t, $_(n)), s = X0(e, $_(n));
  return () => {
    r(), s();
  };
}
function Du(t, e, n) {
  return (e === !0 || e === t) && (n === null || n === t);
}
function jF(t, e = 10) {
  let n = null;
  return Math.abs(t.y) > e ? n = "y" : Math.abs(t.x) > e && (n = "x"), n;
}
class VF extends pi {
  constructor(e) {
    super(e), this.removeGroupControls = Cn, this.removeListeners = Cn, this.controls = new NF(e);
  }
  mount() {
    const { dragControls: e } = this.node.getProps();
    e && (this.removeGroupControls = e.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || Cn;
  }
  update() {
    const { dragControls: e } = this.node.getProps(), { dragControls: n } = this.node.prevProps || {};
    e !== n && (this.removeGroupControls(), e && (this.removeGroupControls = e.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const ph = (t) => (e, n) => {
  t && Oe.update(() => t(e, n), !1, !0);
};
class BF extends pi {
  constructor() {
    super(...arguments), this.removePointerDownListener = Cn;
  }
  onPointerDown(e) {
    this.session = new d1(e, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: f1(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: e, onPanStart: n, onPan: r, onPanEnd: s } = this.node.getProps();
    return {
      onSessionStart: ph(e),
      onStart: ph(n),
      onMove: ph(r),
      onEnd: (a, l) => {
        delete this.session, s && Oe.postRender(() => s(a, l));
      }
    };
  }
  mount() {
    this.removePointerDownListener = Ta(this.node.current, "pointerdown", (e) => this.onPointerDown(e));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let mh = !1;
class zF extends k.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: e, layoutGroup: n, switchLayoutGroup: r, layoutId: s } = this.props, { projection: a } = e;
    a && (n.group && n.group.add(a), r && r.register && s && r.register(a), mh && a.root.didUpdate(), a.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), a.setOptions({
      ...a.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), Ju.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(e) {
    const { layoutDependency: n, visualElement: r, drag: s, isPresent: a } = this.props, { projection: l } = r;
    return l && (l.isPresent = a, e.layoutDependency !== n && l.setOptions({
      ...l.options,
      layoutDependency: n
    }), mh = !0, s || e.layoutDependency !== n || n === void 0 || e.isPresent !== a ? l.willUpdate() : this.safeToRemove(), e.isPresent !== a && (a ? l.promote() : l.relegate() || Oe.postRender(() => {
      const c = l.getStack();
      (!c || !c.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: e, layoutAnchor: n } = this.props, { projection: r } = e;
    r && (r.options.layoutAnchor = n, r.root.didUpdate(), Pm.postRender(() => {
      !r.currentAnimation && r.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: e, layoutGroup: n, switchLayoutGroup: r } = this.props, { projection: s } = e;
    mh = !0, s && (s.scheduleCheckAfterUnmount(), n && n.group && n.group.remove(s), r && r.deregister && r.deregister(s));
  }
  safeToRemove() {
    const { safeToRemove: e } = this.props;
    e && e();
  }
  render() {
    return null;
  }
}
function p1(t) {
  const [e, n] = n1(), r = k.useContext(um);
  return C.jsx(zF, { ...t, layoutGroup: r, switchLayoutGroup: k.useContext(u1), isPresent: e, safeToRemove: n });
}
const UF = {
  pan: {
    Feature: BF
  },
  drag: {
    Feature: VF,
    ProjectionNode: t1,
    MeasureLayout: p1
  }
};
function H_(t, e, n) {
  const { props: r } = t;
  t.animationState && r.whileHover && t.animationState.setActive("whileHover", n === "Start");
  const s = "onHover" + n, a = r[s];
  a && Oe.postRender(() => a(e, sl(e)));
}
class $F extends pi {
  mount() {
    const { current: e } = this.node;
    e && (this.unmount = fM(e, (n, r) => (H_(this.node, r, "Start"), (s) => H_(this.node, s, "End"))));
  }
  unmount() {
  }
}
class HF extends pi {
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
    this.unmount = nl(Oa(this.node.current, "focus", () => this.onFocus()), Oa(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function W_(t, e, n) {
  const { props: r } = t;
  if (t.current instanceof HTMLButtonElement && t.current.disabled)
    return;
  t.animationState && r.whileTap && t.animationState.setActive("whileTap", n === "Start");
  const s = "onTap" + (n === "End" ? "" : n), a = r[s];
  a && Oe.postRender(() => a(e, sl(e)));
}
class WF extends pi {
  mount() {
    const { current: e } = this.node;
    if (!e)
      return;
    const { globalTapTarget: n, propagate: r } = this.node.props;
    this.unmount = gM(e, (s, a) => (W_(this.node, a, "Start"), (l, { success: c }) => W_(this.node, l, c ? "End" : "Cancel")), {
      useGlobalTarget: n,
      stopPropagation: (r == null ? void 0 : r.tap) === !1
    });
  }
  unmount() {
  }
}
const sp = /* @__PURE__ */ new WeakMap(), yh = /* @__PURE__ */ new WeakMap(), GF = (t) => {
  const e = sp.get(t.target);
  e && e(t);
}, KF = (t) => {
  t.forEach(GF);
};
function QF({ root: t, ...e }) {
  const n = t || document;
  yh.has(n) || yh.set(n, {});
  const r = yh.get(n), s = JSON.stringify(e);
  return r[s] || (r[s] = new IntersectionObserver(KF, { root: t, ...e })), r[s];
}
function YF(t, e, n) {
  const r = QF(e);
  return sp.set(t, n), r.observe(t), () => {
    sp.delete(t), r.unobserve(t);
  };
}
const XF = {
  some: 0,
  all: 1
};
class qF extends pi {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    var d;
    (d = this.stopObserver) == null || d.call(this);
    const { viewport: e = {} } = this.node.getProps(), { root: n, margin: r, amount: s = "some", once: a } = e, l = {
      root: n ? n.current : void 0,
      rootMargin: r,
      threshold: typeof s == "number" ? s : XF[s]
    }, c = (m) => {
      const { isIntersecting: y } = m;
      if (this.isInView === y || (this.isInView = y, a && !y && this.hasEnteredView))
        return;
      y && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", y);
      const { onViewportEnter: f, onViewportLeave: p } = this.node.getProps(), g = y ? f : p;
      g && g(m);
    };
    this.stopObserver = YF(this.node.current, l, c);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: e, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(ZF(e, n)) && this.startObserver();
  }
  unmount() {
    var e;
    (e = this.stopObserver) == null || e.call(this), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function ZF({ viewport: t = {} }, { viewport: e = {} } = {}) {
  return (n) => t[n] !== e[n];
}
const JF = {
  inView: {
    Feature: qF
  },
  tap: {
    Feature: WF
  },
  focus: {
    Feature: HF
  },
  hover: {
    Feature: $F
  }
}, eO = {
  layout: {
    ProjectionNode: t1,
    MeasureLayout: p1
  }
}, tO = {
  ...CF,
  ...JF,
  ...UF,
  ...eO
}, Ot = /* @__PURE__ */ _F(tO, wF);
function mr(t) {
  if (t === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return t;
}
function m1(t, e) {
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
var un = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
}, Ia = {
  duration: 0.5,
  overwrite: !1,
  delay: 0
}, Nm, wt, ze, xn = 1e8, De = 1 / xn, op = Math.PI * 2, nO = op / 4, rO = 0, y1 = Math.sqrt, iO = Math.cos, sO = Math.sin, pt = function(e) {
  return typeof e == "string";
}, qe = function(e) {
  return typeof e == "function";
}, xr = function(e) {
  return typeof e == "number";
}, Lm = function(e) {
  return typeof e > "u";
}, ir = function(e) {
  return typeof e == "object";
}, Gt = function(e) {
  return e !== !1;
}, jm = function() {
  return typeof window < "u";
}, Fu = function(e) {
  return qe(e) || pt(e);
}, g1 = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {
}, At = Array.isArray, oO = /random\([^)]+\)/g, aO = /,\s*/g, G_ = /(?:-?\.?\d|\.)+/gi, v1 = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, zs = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, gh = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, _1 = /[+-]=-?[.\d]+/, lO = /[^,'"\[\]\s]+/gi, uO = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, Ge, Kn, ap, Vm, cn = {}, _c = {}, w1, S1 = function(e) {
  return (_c = uo(e, cn)) && Xt;
}, Bm = function(e, n) {
  return console.warn("Invalid property", e, "set to", n, "Missing plugin? gsap.registerPlugin()");
}, Na = function(e, n) {
  return !n && console.warn(e);
}, x1 = function(e, n) {
  return e && (cn[e] = n) && _c && (_c[e] = n) || cn;
}, La = function() {
  return 0;
}, cO = {
  suppressEvents: !0,
  isStart: !0,
  kill: !1
}, ec = {
  suppressEvents: !0,
  kill: !1
}, fO = {
  suppressEvents: !0
}, zm = {}, oi = [], lp = {}, T1, rn = {}, vh = {}, K_ = 30, tc = [], Um = "", $m = function(e) {
  var n = e[0], r, s;
  if (ir(n) || qe(n) || (e = [e]), !(r = (n._gsap || {}).harness)) {
    for (s = tc.length; s-- && !tc[s].targetTest(n); )
      ;
    r = tc[s];
  }
  for (s = e.length; s--; )
    e[s] && (e[s]._gsap || (e[s]._gsap = new W1(e[s], r))) || e.splice(s, 1);
  return e;
}, es = function(e) {
  return e._gsap || $m(Tn(e))[0]._gsap;
}, C1 = function(e, n, r) {
  return (r = e[n]) && qe(r) ? e[n]() : Lm(r) && e.getAttribute && e.getAttribute(n) || r;
}, Kt = function(e, n) {
  return (e = e.split(",")).forEach(n) || e;
}, et = function(e) {
  return Math.round(e * 1e5) / 1e5 || 0;
}, We = function(e) {
  return Math.round(e * 1e7) / 1e7 || 0;
}, $s = function(e, n) {
  var r = n.charAt(0), s = parseFloat(n.substr(2));
  return e = parseFloat(e), r === "+" ? e + s : r === "-" ? e - s : r === "*" ? e * s : e / s;
}, dO = function(e, n) {
  for (var r = n.length, s = 0; e.indexOf(n[s]) < 0 && ++s < r; )
    ;
  return s < r;
}, wc = function() {
  var e = oi.length, n = oi.slice(0), r, s;
  for (lp = {}, oi.length = 0, r = 0; r < e; r++)
    s = n[r], s && s._lazy && (s.render(s._lazy[0], s._lazy[1], !0)._lazy = 0);
}, Hm = function(e) {
  return !!(e._initted || e._startAt || e.add);
}, k1 = function(e, n, r, s) {
  oi.length && !wt && wc(), e.render(n, r, !!(wt && n < 0 && Hm(e))), oi.length && !wt && wc();
}, P1 = function(e) {
  var n = parseFloat(e);
  return (n || n === 0) && (e + "").match(lO).length < 2 ? n : pt(e) ? e.trim() : e;
}, E1 = function(e) {
  return e;
}, fn = function(e, n) {
  for (var r in n)
    r in e || (e[r] = n[r]);
  return e;
}, hO = function(e) {
  return function(n, r) {
    for (var s in r)
      s in n || s === "duration" && e || s === "ease" || (n[s] = r[s]);
  };
}, uo = function(e, n) {
  for (var r in n)
    e[r] = n[r];
  return e;
}, Q_ = function t(e, n) {
  for (var r in n)
    r !== "__proto__" && r !== "constructor" && r !== "prototype" && (e[r] = ir(n[r]) ? t(e[r] || (e[r] = {}), n[r]) : n[r]);
  return e;
}, Sc = function(e, n) {
  var r = {}, s;
  for (s in e)
    s in n || (r[s] = e[s]);
  return r;
}, Ca = function(e) {
  var n = e.parent || Ge, r = e.keyframes ? hO(At(e.keyframes)) : fn;
  if (Gt(e.inherit))
    for (; n; )
      r(e, n.vars.defaults), n = n.parent || n._dp;
  return e;
}, pO = function(e, n) {
  for (var r = e.length, s = r === n.length; s && r-- && e[r] === n[r]; )
    ;
  return r < 0;
}, A1 = function(e, n, r, s, a) {
  var l = e[s], c;
  if (a)
    for (c = n[a]; l && l[a] > c; )
      l = l._prev;
  return l ? (n._next = l._next, l._next = n) : (n._next = e[r], e[r] = n), n._next ? n._next._prev = n : e[s] = n, n._prev = l, n.parent = n._dp = e, n;
}, Bc = function(e, n, r, s) {
  r === void 0 && (r = "_first"), s === void 0 && (s = "_last");
  var a = n._prev, l = n._next;
  a ? a._next = l : e[r] === n && (e[r] = l), l ? l._prev = a : e[s] === n && (e[s] = a), n._next = n._prev = n.parent = null;
}, fi = function(e, n) {
  e.parent && (!n || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, ts = function(e, n) {
  if (e && (!n || n._end > e._dur || n._start < 0))
    for (var r = e; r; )
      r._dirty = 1, r = r.parent;
  return e;
}, mO = function(e) {
  for (var n = e.parent; n && n.parent; )
    n._dirty = 1, n.totalDuration(), n = n.parent;
  return e;
}, up = function(e, n, r, s) {
  return e._startAt && (wt ? e._startAt.revert(ec) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(n, !0, s));
}, yO = function t(e) {
  return !e || e._ts && t(e.parent);
}, Y_ = function(e) {
  return e._repeat ? co(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, co = function(e, n) {
  var r = Math.floor(e = We(e / n));
  return e && r === e ? r - 1 : r;
}, xc = function(e, n) {
  return (e - n._start) * n._ts + (n._ts >= 0 ? 0 : n._dirty ? n.totalDuration() : n._tDur);
}, zc = function(e) {
  return e._end = We(e._start + (e._tDur / Math.abs(e._ts || e._rts || De) || 0));
}, Uc = function(e, n) {
  var r = e._dp;
  return r && r.smoothChildTiming && e._ts && (e._start = We(r._time - (e._ts > 0 ? n / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - n) / -e._ts)), zc(e), r._dirty || ts(r, e)), e;
}, b1 = function(e, n) {
  var r;
  if ((n._time || !n._dur && n._initted || n._start < e._time && (n._dur || !n.add)) && (r = xc(e.rawTime(), n), (!n._dur || ol(0, n.totalDuration(), r) - n._tTime > De) && n.render(r, !0)), ts(e, n)._dp && e._initted && e._time >= e._dur && e._ts) {
    if (e._dur < e.duration())
      for (r = e; r._dp; )
        r.rawTime() >= 0 && r.totalTime(r._tTime), r = r._dp;
    e._zTime = -De;
  }
}, Jn = function(e, n, r, s) {
  return n.parent && fi(n), n._start = We((xr(r) ? r : r || e !== Ge ? vn(e, r, n) : e._time) + n._delay), n._end = We(n._start + (n.totalDuration() / Math.abs(n.timeScale()) || 0)), A1(e, n, "_first", "_last", e._sort ? "_start" : 0), cp(n) || (e._recent = n), s || b1(e, n), e._ts < 0 && Uc(e, e._tTime), e;
}, R1 = function(e, n) {
  return (cn.ScrollTrigger || Bm("scrollTrigger", n)) && cn.ScrollTrigger.create(n, e);
}, M1 = function(e, n, r, s, a) {
  if (Gm(e, n, a), !e._initted)
    return 1;
  if (!r && e._pt && !wt && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && T1 !== on.frame)
    return oi.push(e), e._lazy = [a, s], 1;
}, gO = function t(e) {
  var n = e.parent;
  return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || t(n));
}, cp = function(e) {
  var n = e.data;
  return n === "isFromStart" || n === "isStart";
}, vO = function(e, n, r, s) {
  var a = e.ratio, l = n < 0 || !n && (!e._start && gO(e) && !(!e._initted && cp(e)) || (e._ts < 0 || e._dp._ts < 0) && !cp(e)) ? 0 : 1, c = e._rDelay, d = 0, m, y, f;
  if (c && e._repeat && (d = ol(0, e._tDur, n), y = co(d, c), e._yoyo && y & 1 && (l = 1 - l), y !== co(e._tTime, c) && (a = 1 - l, e.vars.repeatRefresh && e._initted && e.invalidate())), l !== a || wt || s || e._zTime === De || !n && e._zTime) {
    if (!e._initted && M1(e, n, s, r, d))
      return;
    for (f = e._zTime, e._zTime = n || (r ? De : 0), r || (r = n && !f), e.ratio = l, e._from && (l = 1 - l), e._time = 0, e._tTime = d, m = e._pt; m; )
      m.r(l, m.d), m = m._next;
    n < 0 && up(e, n, r, !0), e._onUpdate && !r && an(e, "onUpdate"), d && e._repeat && !r && e.parent && an(e, "onRepeat"), (n >= e._tDur || n < 0) && e.ratio === l && (l && fi(e, 1), !r && !wt && (an(e, l ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
  } else e._zTime || (e._zTime = n);
}, _O = function(e, n, r) {
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
}, fo = function(e, n, r, s) {
  var a = e._repeat, l = We(n) || 0, c = e._tTime / e._tDur;
  return c && !s && (e._time *= l / e._dur), e._dur = l, e._tDur = a ? a < 0 ? 1e10 : We(l * (a + 1) + e._rDelay * a) : l, c > 0 && !s && Uc(e, e._tTime = e._tDur * c), e.parent && zc(e), r || ts(e.parent, e), e;
}, X_ = function(e) {
  return e instanceof Ht ? ts(e) : fo(e, e._dur);
}, wO = {
  _start: 0,
  endTime: La,
  totalDuration: La
}, vn = function t(e, n, r) {
  var s = e.labels, a = e._recent || wO, l = e.duration() >= xn ? a.endTime(!1) : e._dur, c, d, m;
  return pt(n) && (isNaN(n) || n in s) ? (d = n.charAt(0), m = n.substr(-1) === "%", c = n.indexOf("="), d === "<" || d === ">" ? (c >= 0 && (n = n.replace(/=/, "")), (d === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (m ? (c < 0 ? a : r).totalDuration() / 100 : 1)) : c < 0 ? (n in s || (s[n] = l), s[n]) : (d = parseFloat(n.charAt(c - 1) + n.substr(c + 1)), m && r && (d = d / 100 * (At(r) ? r[0] : r).totalDuration()), c > 1 ? t(e, n.substr(0, c - 1), r) + d : l + d)) : n == null ? l : +n;
}, ka = function(e, n, r) {
  var s = xr(n[1]), a = (s ? 2 : 1) + (e < 2 ? 0 : 1), l = n[a], c, d;
  if (s && (l.duration = n[1]), l.parent = r, e) {
    for (c = l, d = r; d && !("immediateRender" in c); )
      c = d.vars.defaults || {}, d = Gt(d.vars.inherit) && d.parent;
    l.immediateRender = Gt(c.immediateRender), e < 2 ? l.runBackwards = 1 : l.startAt = n[a - 1];
  }
  return new rt(n[0], l, n[a + 1]);
}, yi = function(e, n) {
  return e || e === 0 ? n(e) : n;
}, ol = function(e, n, r) {
  return r < e ? e : r > n ? n : r;
}, Et = function(e, n) {
  return !pt(e) || !(n = uO.exec(e)) ? "" : n[1];
}, SO = function(e, n, r) {
  return yi(r, function(s) {
    return ol(e, n, s);
  });
}, fp = [].slice, D1 = function(e, n) {
  return e && ir(e) && "length" in e && (!n && !e.length || e.length - 1 in e && ir(e[0])) && !e.nodeType && e !== Kn;
}, xO = function(e, n, r) {
  return r === void 0 && (r = []), e.forEach(function(s) {
    var a;
    return pt(s) && !n || D1(s, 1) ? (a = r).push.apply(a, Tn(s)) : r.push(s);
  }) || r;
}, Tn = function(e, n, r) {
  return ze && !n && ze.selector ? ze.selector(e) : pt(e) && !r && (ap || !ho()) ? fp.call((n || Vm).querySelectorAll(e), 0) : At(e) ? xO(e, r) : D1(e) ? fp.call(e, 0) : e ? [e] : [];
}, dp = function(e) {
  return e = Tn(e)[0] || Na("Invalid scope") || {}, function(n) {
    var r = e.current || e.nativeElement || e;
    return Tn(n, r.querySelectorAll ? r : r === e ? Na("Invalid scope") || Vm.createElement("div") : e);
  };
}, F1 = function(e) {
  return e.sort(function() {
    return 0.5 - Math.random();
  });
}, O1 = function(e) {
  if (qe(e))
    return e;
  var n = ir(e) ? e : {
    each: e
  }, r = ns(n.ease), s = n.from || 0, a = parseFloat(n.base) || 0, l = {}, c = s > 0 && s < 1, d = isNaN(s) || c, m = n.axis, y = s, f = s;
  return pt(s) ? y = f = {
    center: 0.5,
    edges: 0.5,
    end: 1
  }[s] || 0 : !c && d && (y = s[0], f = s[1]), function(p, g, S) {
    var _ = (S || n).length, x = l[_], T, E, A, b, M, B, I, O, L;
    if (!x) {
      if (L = n.grid === "auto" ? 0 : (n.grid || [1, xn])[1], !L) {
        for (I = -xn; I < (I = S[L++].getBoundingClientRect().left) && L < _; )
          ;
        L < _ && L--;
      }
      for (x = l[_] = [], T = d ? Math.min(L, _) * y - 0.5 : s % L, E = L === xn ? 0 : d ? _ * f / L - 0.5 : s / L | 0, I = 0, O = xn, B = 0; B < _; B++)
        A = B % L - T, b = E - (B / L | 0), x[B] = M = m ? Math.abs(m === "y" ? b : A) : y1(A * A + b * b), M > I && (I = M), M < O && (O = M);
      s === "random" && F1(x), x.max = I - O, x.min = O, x.v = _ = (parseFloat(n.amount) || parseFloat(n.each) * (L > _ ? _ - 1 : m ? m === "y" ? _ / L : L : Math.max(L, _ / L)) || 0) * (s === "edges" ? -1 : 1), x.b = _ < 0 ? a - _ : a, x.u = Et(n.amount || n.each) || 0, r = r && _ < 0 ? IO(r) : r;
    }
    return _ = (x[p] - x.min) / x.max || 0, We(x.b + (r ? r(_) : _) * x.v) + x.u;
  };
}, hp = function(e) {
  var n = Math.pow(10, ((e + "").split(".")[1] || "").length);
  return function(r) {
    var s = We(Math.round(parseFloat(r) / e) * e * n);
    return (s - s % 1) / n + (xr(r) ? 0 : Et(r));
  };
}, I1 = function(e, n) {
  var r = At(e), s, a;
  return !r && ir(e) && (s = r = e.radius || xn, e.values ? (e = Tn(e.values), (a = !xr(e[0])) && (s *= s)) : e = hp(e.increment)), yi(n, r ? qe(e) ? function(l) {
    return a = e(l), Math.abs(a - l) <= s ? a : l;
  } : function(l) {
    for (var c = parseFloat(a ? l.x : l), d = parseFloat(a ? l.y : 0), m = xn, y = 0, f = e.length, p, g; f--; )
      a ? (p = e[f].x - c, g = e[f].y - d, p = p * p + g * g) : p = Math.abs(e[f] - c), p < m && (m = p, y = f);
    return y = !s || m <= s ? e[y] : l, a || y === l || xr(l) ? y : y + Et(l);
  } : hp(e));
}, N1 = function(e, n, r, s) {
  return yi(At(e) ? !n : r === !0 ? !!(r = 0) : !s, function() {
    return At(e) ? e[~~(Math.random() * e.length)] : (r = r || 1e-5) && (s = r < 1 ? Math.pow(10, (r + "").length - 2) : 1) && Math.floor(Math.round((e - r / 2 + Math.random() * (n - e + r * 0.99)) / r) * r * s) / s;
  });
}, TO = function() {
  for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
    n[r] = arguments[r];
  return function(s) {
    return n.reduce(function(a, l) {
      return l(a);
    }, s);
  };
}, CO = function(e, n) {
  return function(r) {
    return e(parseFloat(r)) + (n || Et(r));
  };
}, kO = function(e, n, r) {
  return j1(e, n, 0, 1, r);
}, L1 = function(e, n, r) {
  return yi(r, function(s) {
    return e[~~n(s)];
  });
}, PO = function t(e, n, r) {
  var s = n - e;
  return At(e) ? L1(e, t(0, e.length), n) : yi(r, function(a) {
    return (s + (a - e) % s) % s + e;
  });
}, EO = function t(e, n, r) {
  var s = n - e, a = s * 2;
  return At(e) ? L1(e, t(0, e.length - 1), n) : yi(r, function(l) {
    return l = (a + (l - e) % a) % a || 0, e + (l > s ? a - l : l);
  });
}, ja = function(e) {
  return e.replace(oO, function(n) {
    var r = n.indexOf("[") + 1, s = n.substring(r || 7, r ? n.indexOf("]") : n.length - 1).split(aO);
    return N1(r ? s : +s[0], r ? 0 : +s[1], +s[2] || 1e-5);
  });
}, j1 = function(e, n, r, s, a) {
  var l = n - e, c = s - r;
  return yi(a, function(d) {
    return r + ((d - e) / l * c || 0);
  });
}, AO = function t(e, n, r, s) {
  var a = isNaN(e + n) ? 0 : function(g) {
    return (1 - g) * e + g * n;
  };
  if (!a) {
    var l = pt(e), c = {}, d, m, y, f, p;
    if (r === !0 && (s = 1) && (r = null), l)
      e = {
        p: e
      }, n = {
        p: n
      };
    else if (At(e) && !At(n)) {
      for (y = [], f = e.length, p = f - 2, m = 1; m < f; m++)
        y.push(t(e[m - 1], e[m]));
      f--, a = function(S) {
        S *= f;
        var _ = Math.min(p, ~~S);
        return y[_](S - _);
      }, r = n;
    } else s || (e = uo(At(e) ? [] : {}, e));
    if (!y) {
      for (d in n)
        Wm.call(c, e, d, "get", n[d]);
      a = function(S) {
        return Ym(S, c) || (l ? e.p : e);
      };
    }
  }
  return yi(r, a);
}, q_ = function(e, n, r) {
  var s = e.labels, a = xn, l, c, d;
  for (l in s)
    c = s[l] - n, c < 0 == !!r && c && a > (c = Math.abs(c)) && (d = l, a = c);
  return d;
}, an = function(e, n, r) {
  var s = e.vars, a = s[n], l = ze, c = e._ctx, d, m, y;
  if (a)
    return d = s[n + "Params"], m = s.callbackScope || e, r && oi.length && wc(), c && (ze = c), y = d ? a.apply(m, d) : a.call(m), ze = l, y;
}, ya = function(e) {
  return fi(e), e.scrollTrigger && e.scrollTrigger.kill(!!wt), e.progress() < 1 && an(e, "onInterrupt"), e;
}, Us, V1 = [], B1 = function(e) {
  if (e)
    if (e = !e.name && e.default || e, jm() || e.headless) {
      var n = e.name, r = qe(e), s = n && !r && e.init ? function() {
        this._props = [];
      } : e, a = {
        init: La,
        render: Ym,
        add: Wm,
        kill: WO,
        modifier: HO,
        rawVars: 0
      }, l = {
        targetTest: 0,
        get: 0,
        getSetter: Qm,
        aliases: {},
        register: 0
      };
      if (ho(), e !== s) {
        if (rn[n])
          return;
        fn(s, fn(Sc(e, a), l)), uo(s.prototype, uo(a, Sc(e, l))), rn[s.prop = n] = s, e.targetTest && (tc.push(s), zm[n] = 1), n = (n === "css" ? "CSS" : n.charAt(0).toUpperCase() + n.substr(1)) + "Plugin";
      }
      x1(n, s), e.register && e.register(Xt, s, Qt);
    } else
      V1.push(e);
}, Me = 255, ga = {
  aqua: [0, Me, Me],
  lime: [0, Me, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, Me],
  navy: [0, 0, 128],
  white: [Me, Me, Me],
  olive: [128, 128, 0],
  yellow: [Me, Me, 0],
  orange: [Me, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [Me, 0, 0],
  pink: [Me, 192, 203],
  cyan: [0, Me, Me],
  transparent: [Me, Me, Me, 0]
}, _h = function(e, n, r) {
  return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? n + (r - n) * e * 6 : e < 0.5 ? r : e * 3 < 2 ? n + (r - n) * (2 / 3 - e) * 6 : n) * Me + 0.5 | 0;
}, z1 = function(e, n, r) {
  var s = e ? xr(e) ? [e >> 16, e >> 8 & Me, e & Me] : 0 : ga.black, a, l, c, d, m, y, f, p, g, S;
  if (!s) {
    if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), ga[e])
      s = ga[e];
    else if (e.charAt(0) === "#") {
      if (e.length < 6 && (a = e.charAt(1), l = e.charAt(2), c = e.charAt(3), e = "#" + a + a + l + l + c + c + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9)
        return s = parseInt(e.substr(1, 6), 16), [s >> 16, s >> 8 & Me, s & Me, parseInt(e.substr(7), 16) / 255];
      e = parseInt(e.substr(1), 16), s = [e >> 16, e >> 8 & Me, e & Me];
    } else if (e.substr(0, 3) === "hsl") {
      if (s = S = e.match(G_), !n)
        d = +s[0] % 360 / 360, m = +s[1] / 100, y = +s[2] / 100, l = y <= 0.5 ? y * (m + 1) : y + m - y * m, a = y * 2 - l, s.length > 3 && (s[3] *= 1), s[0] = _h(d + 1 / 3, a, l), s[1] = _h(d, a, l), s[2] = _h(d - 1 / 3, a, l);
      else if (~e.indexOf("="))
        return s = e.match(v1), r && s.length < 4 && (s[3] = 1), s;
    } else
      s = e.match(G_) || ga.transparent;
    s = s.map(Number);
  }
  return n && !S && (a = s[0] / Me, l = s[1] / Me, c = s[2] / Me, f = Math.max(a, l, c), p = Math.min(a, l, c), y = (f + p) / 2, f === p ? d = m = 0 : (g = f - p, m = y > 0.5 ? g / (2 - f - p) : g / (f + p), d = f === a ? (l - c) / g + (l < c ? 6 : 0) : f === l ? (c - a) / g + 2 : (a - l) / g + 4, d *= 60), s[0] = ~~(d + 0.5), s[1] = ~~(m * 100 + 0.5), s[2] = ~~(y * 100 + 0.5)), r && s.length < 4 && (s[3] = 1), s;
}, U1 = function(e) {
  var n = [], r = [], s = -1;
  return e.split(ai).forEach(function(a) {
    var l = a.match(zs) || [];
    n.push.apply(n, l), r.push(s += l.length + 1);
  }), n.c = r, n;
}, Z_ = function(e, n, r) {
  var s = "", a = (e + s).match(ai), l = n ? "hsla(" : "rgba(", c = 0, d, m, y, f;
  if (!a)
    return e;
  if (a = a.map(function(p) {
    return (p = z1(p, n, 1)) && l + (n ? p[0] + "," + p[1] + "%," + p[2] + "%," + p[3] : p.join(",")) + ")";
  }), r && (y = U1(e), d = r.c, d.join(s) !== y.c.join(s)))
    for (m = e.replace(ai, "1").split(zs), f = m.length - 1; c < f; c++)
      s += m[c] + (~d.indexOf(c) ? a.shift() || l + "0,0,0,0)" : (y.length ? y : a.length ? a : r).shift());
  if (!m)
    for (m = e.split(ai), f = m.length - 1; c < f; c++)
      s += m[c] + a[c];
  return s + m[f];
}, ai = (function() {
  var t = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", e;
  for (e in ga)
    t += "|" + e + "\\b";
  return new RegExp(t + ")", "gi");
})(), bO = /hsl[a]?\(/, $1 = function(e) {
  var n = e.join(" "), r;
  if (ai.lastIndex = 0, ai.test(n))
    return r = bO.test(n), e[1] = Z_(e[1], r), e[0] = Z_(e[0], r, U1(e[1])), !0;
}, Va, on = (function() {
  var t = Date.now, e = 500, n = 33, r = t(), s = r, a = 1e3 / 240, l = a, c = [], d, m, y, f, p, g, S = function _(x) {
    var T = t() - s, E = x === !0, A, b, M, B;
    if ((T > e || T < 0) && (r += T - n), s += T, M = s - r, A = M - l, (A > 0 || E) && (B = ++f.frame, p = M - f.time * 1e3, f.time = M = M / 1e3, l += A + (A >= a ? 4 : a - A), b = 1), E || (d = m(_)), b)
      for (g = 0; g < c.length; g++)
        c[g](M, p, B, x);
  };
  return f = {
    time: 0,
    frame: 0,
    tick: function() {
      S(!0);
    },
    deltaRatio: function(x) {
      return p / (1e3 / (x || 60));
    },
    wake: function() {
      w1 && (!ap && jm() && (Kn = ap = window, Vm = Kn.document || {}, cn.gsap = Xt, (Kn.gsapVersions || (Kn.gsapVersions = [])).push(Xt.version), S1(_c || Kn.GreenSockGlobals || !Kn.gsap && Kn || {}), V1.forEach(B1)), y = typeof requestAnimationFrame < "u" && requestAnimationFrame, d && f.sleep(), m = y || function(x) {
        return setTimeout(x, l - f.time * 1e3 + 1 | 0);
      }, Va = 1, S(2));
    },
    sleep: function() {
      (y ? cancelAnimationFrame : clearTimeout)(d), Va = 0, m = La;
    },
    lagSmoothing: function(x, T) {
      e = x || 1 / 0, n = Math.min(T || 33, e);
    },
    fps: function(x) {
      a = 1e3 / (x || 240), l = f.time * 1e3 + a;
    },
    add: function(x, T, E) {
      var A = T ? function(b, M, B, I) {
        x(b, M, B, I), f.remove(A);
      } : x;
      return f.remove(x), c[E ? "unshift" : "push"](A), ho(), A;
    },
    remove: function(x, T) {
      ~(T = c.indexOf(x)) && c.splice(T, 1) && g >= T && g--;
    },
    _listeners: c
  }, f;
})(), ho = function() {
  return !Va && on.wake();
}, Ce = {}, RO = /^[\d.\-M][\d.\-,\s]/, MO = /["']/g, DO = function(e) {
  for (var n = {}, r = e.substr(1, e.length - 3).split(":"), s = r[0], a = 1, l = r.length, c, d, m; a < l; a++)
    d = r[a], c = a !== l - 1 ? d.lastIndexOf(",") : d.length, m = d.substr(0, c), n[s] = isNaN(m) ? m.replace(MO, "").trim() : +m, s = d.substr(c + 1).trim();
  return n;
}, FO = function(e) {
  var n = e.indexOf("(") + 1, r = e.indexOf(")"), s = e.indexOf("(", n);
  return e.substring(n, ~s && s < r ? e.indexOf(")", r + 1) : r);
}, OO = function(e) {
  var n = (e + "").split("("), r = Ce[n[0]];
  return r && n.length > 1 && r.config ? r.config.apply(null, ~e.indexOf("{") ? [DO(n[1])] : FO(e).split(",").map(P1)) : Ce._CE && RO.test(e) ? Ce._CE("", e) : r;
}, IO = function(e) {
  return function(n) {
    return 1 - e(1 - n);
  };
}, ns = function(e, n) {
  return e && (qe(e) ? e : Ce[e] || OO(e)) || n;
}, os = function(e, n, r, s) {
  r === void 0 && (r = function(d) {
    return 1 - n(1 - d);
  }), s === void 0 && (s = function(d) {
    return d < 0.5 ? n(d * 2) / 2 : 1 - n((1 - d) * 2) / 2;
  });
  var a = {
    easeIn: n,
    easeOut: r,
    easeInOut: s
  }, l;
  return Kt(e, function(c) {
    Ce[c] = cn[c] = a, Ce[l = c.toLowerCase()] = r;
    for (var d in a)
      Ce[l + (d === "easeIn" ? ".in" : d === "easeOut" ? ".out" : ".inOut")] = Ce[c + "." + d] = a[d];
  }), a;
}, H1 = function(e) {
  return function(n) {
    return n < 0.5 ? (1 - e(1 - n * 2)) / 2 : 0.5 + e((n - 0.5) * 2) / 2;
  };
}, wh = function t(e, n, r) {
  var s = n >= 1 ? n : 1, a = (r || (e ? 0.3 : 0.45)) / (n < 1 ? n : 1), l = a / op * (Math.asin(1 / s) || 0), c = function(y) {
    return y === 1 ? 1 : s * Math.pow(2, -10 * y) * sO((y - l) * a) + 1;
  }, d = e === "out" ? c : e === "in" ? function(m) {
    return 1 - c(1 - m);
  } : H1(c);
  return a = op / a, d.config = function(m, y) {
    return t(e, m, y);
  }, d;
}, Sh = function t(e, n) {
  n === void 0 && (n = 1.70158);
  var r = function(l) {
    return l ? --l * l * ((n + 1) * l + n) + 1 : 0;
  }, s = e === "out" ? r : e === "in" ? function(a) {
    return 1 - r(1 - a);
  } : H1(r);
  return s.config = function(a) {
    return t(e, a);
  }, s;
};
Kt("Linear,Quad,Cubic,Quart,Quint,Strong", function(t, e) {
  var n = e < 5 ? e + 1 : e;
  os(t + ",Power" + (n - 1), e ? function(r) {
    return Math.pow(r, n);
  } : function(r) {
    return r;
  }, function(r) {
    return 1 - Math.pow(1 - r, n);
  }, function(r) {
    return r < 0.5 ? Math.pow(r * 2, n) / 2 : 1 - Math.pow((1 - r) * 2, n) / 2;
  });
});
Ce.Linear.easeNone = Ce.none = Ce.Linear.easeIn;
os("Elastic", wh("in"), wh("out"), wh());
(function(t, e) {
  var n = 1 / e, r = 2 * n, s = 2.5 * n, a = function(c) {
    return c < n ? t * c * c : c < r ? t * Math.pow(c - 1.5 / e, 2) + 0.75 : c < s ? t * (c -= 2.25 / e) * c + 0.9375 : t * Math.pow(c - 2.625 / e, 2) + 0.984375;
  };
  os("Bounce", function(l) {
    return 1 - a(1 - l);
  }, a);
})(7.5625, 2.75);
os("Expo", function(t) {
  return Math.pow(2, 10 * (t - 1)) * t + t * t * t * t * t * t * (1 - t);
});
os("Circ", function(t) {
  return -(y1(1 - t * t) - 1);
});
os("Sine", function(t) {
  return t === 1 ? 1 : -iO(t * nO) + 1;
});
os("Back", Sh("in"), Sh("out"), Sh());
Ce.SteppedEase = Ce.steps = cn.SteppedEase = {
  config: function(e, n) {
    e === void 0 && (e = 1);
    var r = 1 / e, s = e + (n ? 0 : 1), a = n ? 1 : 0, l = 1 - De;
    return function(c) {
      return ((s * ol(0, l, c) | 0) + a) * r;
    };
  }
};
Ia.ease = Ce["quad.out"];
Kt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(t) {
  return Um += t + "," + t + "Params,";
});
var W1 = function(e, n) {
  this.id = rO++, e._gsap = this, this.target = e, this.harness = n, this.get = n ? n.get : C1, this.set = n ? n.getSetter : Qm;
}, Ba = /* @__PURE__ */ (function() {
  function t(n) {
    this.vars = n, this._delay = +n.delay || 0, (this._repeat = n.repeat === 1 / 0 ? -2 : n.repeat || 0) && (this._rDelay = n.repeatDelay || 0, this._yoyo = !!n.yoyo || !!n.yoyoEase), this._ts = 1, fo(this, +n.duration, 1, 1), this.data = n.data, ze && (this._ctx = ze, ze.data.push(this)), Va || on.wake();
  }
  var e = t.prototype;
  return e.delay = function(r) {
    return r || r === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + r - this._delay), this._delay = r, this) : this._delay;
  }, e.duration = function(r) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? r + (r + this._rDelay) * this._repeat : r) : this.totalDuration() && this._dur;
  }, e.totalDuration = function(r) {
    return arguments.length ? (this._dirty = 0, fo(this, this._repeat < 0 ? r : (r - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
  }, e.totalTime = function(r, s) {
    if (ho(), !arguments.length)
      return this._tTime;
    var a = this._dp;
    if (a && a.smoothChildTiming && this._ts) {
      for (Uc(this, r), !a._dp || a.parent || b1(a, this); a && a.parent; )
        a.parent._time !== a._start + (a._ts >= 0 ? a._tTime / a._ts : (a.totalDuration() - a._tTime) / -a._ts) && a.totalTime(a._tTime, !0), a = a.parent;
      !this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && r < this._tDur || this._ts < 0 && r > 0 || !this._tDur && !r) && Jn(this._dp, this, this._start - this._delay);
    }
    return (this._tTime !== r || !this._dur && !s || this._initted && Math.abs(this._zTime) === De || !this._initted && this._dur && r || !r && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = r), k1(this, r, s)), this;
  }, e.time = function(r, s) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), r + Y_(this)) % (this._dur + this._rDelay) || (r ? this._dur : 0), s) : this._time;
  }, e.totalProgress = function(r, s) {
    return arguments.length ? this.totalTime(this.totalDuration() * r, s) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  }, e.progress = function(r, s) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - r : r) + Y_(this), s) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  }, e.iteration = function(r, s) {
    var a = this.duration() + this._rDelay;
    return arguments.length ? this.totalTime(this._time + (r - 1) * a, s) : this._repeat ? co(this._tTime, a) + 1 : 1;
  }, e.timeScale = function(r, s) {
    if (!arguments.length)
      return this._rts === -De ? 0 : this._rts;
    if (this._rts === r)
      return this;
    var a = this.parent && this._ts ? xc(this.parent._time, this) : this._tTime;
    return this._rts = +r || 0, this._ts = this._ps || r === -De ? 0 : this._rts, this.totalTime(ol(-Math.abs(this._delay), this.totalDuration(), a), s !== !1), zc(this), mO(this);
  }, e.paused = function(r) {
    return arguments.length ? (this._ps !== r && (this._ps = r, r ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (ho(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== De && (this._tTime -= De)))), this) : this._ps;
  }, e.startTime = function(r) {
    if (arguments.length) {
      this._start = We(r);
      var s = this.parent || this._dp;
      return s && (s._sort || !this.parent) && Jn(s, this, this._start - this._delay), this;
    }
    return this._start;
  }, e.endTime = function(r) {
    return this._start + (Gt(r) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  }, e.rawTime = function(r) {
    var s = this.parent || this._dp;
    return s ? r && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? xc(s.rawTime(r), this) : this._tTime : this._tTime;
  }, e.revert = function(r) {
    r === void 0 && (r = fO);
    var s = wt;
    return wt = r, Hm(this) && (this.timeline && this.timeline.revert(r), this.totalTime(-0.01, r.suppressEvents)), this.data !== "nested" && r.kill !== !1 && this.kill(), wt = s, this;
  }, e.globalTime = function(r) {
    for (var s = this, a = arguments.length ? r : s.rawTime(); s; )
      a = s._start + a / (Math.abs(s._ts) || 1), s = s._dp;
    return !this.parent && this._sat ? this._sat.globalTime(r) : a;
  }, e.repeat = function(r) {
    return arguments.length ? (this._repeat = r === 1 / 0 ? -2 : r, X_(this)) : this._repeat === -2 ? 1 / 0 : this._repeat;
  }, e.repeatDelay = function(r) {
    if (arguments.length) {
      var s = this._time;
      return this._rDelay = r, X_(this), s ? this.time(s) : this;
    }
    return this._rDelay;
  }, e.yoyo = function(r) {
    return arguments.length ? (this._yoyo = r, this) : this._yoyo;
  }, e.seek = function(r, s) {
    return this.totalTime(vn(this, r), Gt(s));
  }, e.restart = function(r, s) {
    return this.play().totalTime(r ? -this._delay : 0, Gt(s)), this._dur || (this._zTime = -De), this;
  }, e.play = function(r, s) {
    return r != null && this.seek(r, s), this.reversed(!1).paused(!1);
  }, e.reverse = function(r, s) {
    return r != null && this.seek(r || this.totalDuration(), s), this.reversed(!0).paused(!1);
  }, e.pause = function(r, s) {
    return r != null && this.seek(r, s), this.paused(!0);
  }, e.resume = function() {
    return this.paused(!1);
  }, e.reversed = function(r) {
    return arguments.length ? (!!r !== this.reversed() && this.timeScale(-this._rts || (r ? -De : 0)), this) : this._rts < 0;
  }, e.invalidate = function() {
    return this._initted = this._act = 0, this._zTime = -De, this;
  }, e.isActive = function() {
    var r = this.parent || this._dp, s = this._start, a;
    return !!(!r || this._ts && this._initted && r.isActive() && (a = r.rawTime(!0)) >= s && a < this.endTime(!0) - De);
  }, e.eventCallback = function(r, s, a) {
    var l = this.vars;
    return arguments.length > 1 ? (s ? (l[r] = s, a && (l[r + "Params"] = a), r === "onUpdate" && (this._onUpdate = s)) : delete l[r], this) : l[r];
  }, e.then = function(r) {
    var s = this, a = s._prom;
    return new Promise(function(l) {
      var c = qe(r) ? r : E1, d = function() {
        var y = s.then;
        s.then = null, a && a(), qe(c) && (c = c(s)) && (c.then || c === s) && (s.then = y), l(c), s.then = y;
      };
      s._initted && s.totalProgress() === 1 && s._ts >= 0 || !s._tTime && s._ts < 0 ? d() : s._prom = d;
    });
  }, e.kill = function() {
    ya(this);
  }, t;
})();
fn(Ba.prototype, {
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
  _zTime: -De,
  _prom: 0,
  _ps: !1,
  _rts: 1
});
var Ht = /* @__PURE__ */ (function(t) {
  m1(e, t);
  function e(r, s) {
    var a;
    return r === void 0 && (r = {}), a = t.call(this, r) || this, a.labels = {}, a.smoothChildTiming = !!r.smoothChildTiming, a.autoRemoveChildren = !!r.autoRemoveChildren, a._sort = Gt(r.sortChildren), Ge && Jn(r.parent || Ge, mr(a), s), r.reversed && a.reverse(), r.paused && a.paused(!0), r.scrollTrigger && R1(mr(a), r.scrollTrigger), a;
  }
  var n = e.prototype;
  return n.to = function(s, a, l) {
    return ka(0, arguments, this), this;
  }, n.from = function(s, a, l) {
    return ka(1, arguments, this), this;
  }, n.fromTo = function(s, a, l, c) {
    return ka(2, arguments, this), this;
  }, n.set = function(s, a, l) {
    return a.duration = 0, a.parent = this, Ca(a).repeatDelay || (a.repeat = 0), a.immediateRender = !!a.immediateRender, new rt(s, a, vn(this, l), 1), this;
  }, n.call = function(s, a, l) {
    return Jn(this, rt.delayedCall(0, s, a), l);
  }, n.staggerTo = function(s, a, l, c, d, m, y) {
    return l.duration = a, l.stagger = l.stagger || c, l.onComplete = m, l.onCompleteParams = y, l.parent = this, new rt(s, l, vn(this, d)), this;
  }, n.staggerFrom = function(s, a, l, c, d, m, y) {
    return l.runBackwards = 1, Ca(l).immediateRender = Gt(l.immediateRender), this.staggerTo(s, a, l, c, d, m, y);
  }, n.staggerFromTo = function(s, a, l, c, d, m, y, f) {
    return c.startAt = l, Ca(c).immediateRender = Gt(c.immediateRender), this.staggerTo(s, a, c, d, m, y, f);
  }, n.render = function(s, a, l) {
    var c = this._time, d = this._dirty ? this.totalDuration() : this._tDur, m = this._dur, y = s <= 0 ? 0 : We(s), f = this._zTime < 0 != s < 0 && (this._initted || !m), p, g, S, _, x, T, E, A, b, M, B, I;
    if (this !== Ge && y > d && s >= 0 && (y = d), y !== this._tTime || l || f) {
      if (c !== this._time && m && (y += this._time - c, s += this._time - c), p = y, b = this._start, A = this._ts, T = !A, f && (m || (c = this._zTime), (s || !a) && (this._zTime = s)), this._repeat) {
        if (B = this._yoyo, x = m + this._rDelay, this._repeat < -1 && s < 0)
          return this.totalTime(x * 100 + s, a, l);
        if (p = We(y % x), y === d ? (_ = this._repeat, p = m) : (M = We(y / x), _ = ~~M, _ && _ === M && (p = m, _--), p > m && (p = m)), M = co(this._tTime, x), !c && this._tTime && M !== _ && this._tTime - M * x - this._dur <= 0 && (M = _), B && _ & 1 && (p = m - p, I = 1), _ !== M && !this._lock) {
          var O = B && M & 1, L = O === (B && _ & 1);
          if (_ < M && (O = !O), c = O ? 0 : y % m ? m : y, this._lock = 1, this.render(c || (I ? 0 : We(_ * x)), a, !m)._lock = 0, this._tTime = y, !a && this.parent && an(this, "onRepeat"), this.vars.repeatRefresh && !I && (this.invalidate()._lock = 1, M = _), c && c !== this._time || T !== !this._ts || this.vars.onRepeat && !this.parent && !this._act)
            return this;
          if (m = this._dur, d = this._tDur, L && (this._lock = 2, c = O ? m : -1e-4, this.render(c, !0), this.vars.repeatRefresh && !I && this.invalidate()), this._lock = 0, !this._ts && !T)
            return this;
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2 && (E = _O(this, We(c), We(p)), E && (y -= p - (p = E._start))), this._tTime = y, this._time = p, this._act = !!A, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = s, c = 0), !c && y && m && !a && !M && (an(this, "onStart"), this._tTime !== y))
        return this;
      if (p >= c && s >= 0)
        for (g = this._first; g; ) {
          if (S = g._next, (g._act || p >= g._start) && g._ts && E !== g) {
            if (g.parent !== this)
              return this.render(s, a, l);
            if (g.render(g._ts > 0 ? (p - g._start) * g._ts : (g._dirty ? g.totalDuration() : g._tDur) + (p - g._start) * g._ts, a, l), p !== this._time || !this._ts && !T) {
              E = 0, S && (y += this._zTime = -De);
              break;
            }
          }
          g = S;
        }
      else {
        g = this._last;
        for (var $ = s < 0 ? s : p; g; ) {
          if (S = g._prev, (g._act || $ <= g._end) && g._ts && E !== g) {
            if (g.parent !== this)
              return this.render(s, a, l);
            if (g.render(g._ts > 0 ? ($ - g._start) * g._ts : (g._dirty ? g.totalDuration() : g._tDur) + ($ - g._start) * g._ts, a, l || wt && Hm(g)), p !== this._time || !this._ts && !T) {
              E = 0, S && (y += this._zTime = $ ? -De : De);
              break;
            }
          }
          g = S;
        }
      }
      if (E && !a && (this.pause(), E.render(p >= c ? 0 : -De)._zTime = p >= c ? 1 : -1, this._ts))
        return this._start = b, zc(this), this.render(s, a, l);
      this._onUpdate && !a && an(this, "onUpdate", !0), (y === d && this._tTime >= this.totalDuration() || !y && c) && (b === this._start || Math.abs(A) !== Math.abs(this._ts)) && (this._lock || ((s || !m) && (y === d && this._ts > 0 || !y && this._ts < 0) && fi(this, 1), !a && !(s < 0 && !c) && (y || c || !d) && (an(this, y === d && s >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(y < d && this.timeScale() > 0) && this._prom())));
    }
    return this;
  }, n.add = function(s, a) {
    var l = this;
    if (xr(a) || (a = vn(this, a, s)), !(s instanceof Ba)) {
      if (At(s))
        return s.forEach(function(c) {
          return l.add(c, a);
        }), this;
      if (pt(s))
        return this.addLabel(s, a);
      if (qe(s))
        s = rt.delayedCall(0, s);
      else
        return this;
    }
    return this !== s ? Jn(this, s, a) : this;
  }, n.getChildren = function(s, a, l, c) {
    s === void 0 && (s = !0), a === void 0 && (a = !0), l === void 0 && (l = !0), c === void 0 && (c = -xn);
    for (var d = [], m = this._first; m; )
      m._start >= c && (m instanceof rt ? a && d.push(m) : (l && d.push(m), s && d.push.apply(d, m.getChildren(!0, a, l)))), m = m._next;
    return d;
  }, n.getById = function(s) {
    for (var a = this.getChildren(1, 1, 1), l = a.length; l--; )
      if (a[l].vars.id === s)
        return a[l];
  }, n.remove = function(s) {
    return pt(s) ? this.removeLabel(s) : qe(s) ? this.killTweensOf(s) : (s.parent === this && Bc(this, s), s === this._recent && (this._recent = this._last), ts(this));
  }, n.totalTime = function(s, a) {
    return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = We(on.time - (this._ts > 0 ? s / this._ts : (this.totalDuration() - s) / -this._ts))), t.prototype.totalTime.call(this, s, a), this._forcing = 0, this) : this._tTime;
  }, n.addLabel = function(s, a) {
    return this.labels[s] = vn(this, a), this;
  }, n.removeLabel = function(s) {
    return delete this.labels[s], this;
  }, n.addPause = function(s, a, l) {
    var c = rt.delayedCall(0, a || La, l);
    return c.data = "isPause", this._hasPause = 1, Jn(this, c, vn(this, s));
  }, n.removePause = function(s) {
    var a = this._first;
    for (s = vn(this, s); a; )
      a._start === s && a.data === "isPause" && fi(a), a = a._next;
  }, n.killTweensOf = function(s, a, l) {
    for (var c = this.getTweensOf(s, l), d = c.length; d--; )
      ri !== c[d] && c[d].kill(s, a);
    return this;
  }, n.getTweensOf = function(s, a) {
    for (var l = [], c = Tn(s), d = this._first, m = xr(a), y; d; )
      d instanceof rt ? dO(d._targets, c) && (m ? (!ri || d._initted && d._ts) && d.globalTime(0) <= a && d.globalTime(d.totalDuration()) > a : !a || d.isActive()) && l.push(d) : (y = d.getTweensOf(c, a)).length && l.push.apply(l, y), d = d._next;
    return l;
  }, n.tweenTo = function(s, a) {
    a = a || {};
    var l = this, c = vn(l, s), d = a, m = d.startAt, y = d.onStart, f = d.onStartParams, p = d.immediateRender, g, S = rt.to(l, fn({
      ease: a.ease || "none",
      lazy: !1,
      immediateRender: !1,
      time: c,
      overwrite: "auto",
      duration: a.duration || Math.abs((c - (m && "time" in m ? m.time : l._time)) / l.timeScale()) || De,
      onStart: function() {
        if (l.pause(), !g) {
          var x = a.duration || Math.abs((c - (m && "time" in m ? m.time : l._time)) / l.timeScale());
          S._dur !== x && fo(S, x, 0, 1).render(S._time, !0, !0), g = 1;
        }
        y && y.apply(S, f || []);
      }
    }, a));
    return p ? S.render(0) : S;
  }, n.tweenFromTo = function(s, a, l) {
    return this.tweenTo(a, fn({
      startAt: {
        time: vn(this, s)
      }
    }, l));
  }, n.recent = function() {
    return this._recent;
  }, n.nextLabel = function(s) {
    return s === void 0 && (s = this._time), q_(this, vn(this, s));
  }, n.previousLabel = function(s) {
    return s === void 0 && (s = this._time), q_(this, vn(this, s), 1);
  }, n.currentLabel = function(s) {
    return arguments.length ? this.seek(s, !0) : this.previousLabel(this._time + De);
  }, n.shiftChildren = function(s, a, l) {
    l === void 0 && (l = 0);
    var c = this._first, d = this.labels, m;
    for (s = We(s); c; )
      c._start >= l && (c._start += s, c._end += s), c = c._next;
    if (a)
      for (m in d)
        d[m] >= l && (d[m] += s);
    return ts(this);
  }, n.invalidate = function(s) {
    var a = this._first;
    for (this._lock = 0; a; )
      a.invalidate(s), a = a._next;
    return t.prototype.invalidate.call(this, s);
  }, n.clear = function(s) {
    s === void 0 && (s = !0);
    for (var a = this._first, l; a; )
      l = a._next, this.remove(a), a = l;
    return this._dp && (this._time = this._tTime = this._pTime = 0), s && (this.labels = {}), ts(this);
  }, n.totalDuration = function(s) {
    var a = 0, l = this, c = l._last, d = xn, m, y, f;
    if (arguments.length)
      return l.timeScale((l._repeat < 0 ? l.duration() : l.totalDuration()) / (l.reversed() ? -s : s));
    if (l._dirty) {
      for (f = l.parent; c; )
        m = c._prev, c._dirty && c.totalDuration(), y = c._start, y > d && l._sort && c._ts && !l._lock ? (l._lock = 1, Jn(l, c, y - c._delay, 1)._lock = 0) : d = y, y < 0 && c._ts && (a -= y, (!f && !l._dp || f && f.smoothChildTiming) && (l._start += We(y / l._ts), l._time -= y, l._tTime -= y), l.shiftChildren(-y, !1, -1 / 0), d = 0), c._end > a && c._ts && (a = c._end), c = m;
      fo(l, l === Ge && l._time > a ? l._time : a, 1, 1), l._dirty = 0;
    }
    return l._tDur;
  }, e.updateRoot = function(s) {
    if (Ge._ts && (k1(Ge, xc(s, Ge)), T1 = on.frame), on.frame >= K_) {
      K_ += un.autoSleep || 120;
      var a = Ge._first;
      if ((!a || !a._ts) && un.autoSleep && on._listeners.length < 2) {
        for (; a && !a._ts; )
          a = a._next;
        a || on.sleep();
      }
    }
  }, e;
})(Ba);
fn(Ht.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});
var NO = function(e, n, r, s, a, l, c) {
  var d = new Qt(this._pt, e, n, 0, 1, q1, null, a), m = 0, y = 0, f, p, g, S, _, x, T, E;
  for (d.b = r, d.e = s, r += "", s += "", (T = ~s.indexOf("random(")) && (s = ja(s)), l && (E = [r, s], l(E, e, n), r = E[0], s = E[1]), p = r.match(gh) || []; f = gh.exec(s); )
    S = f[0], _ = s.substring(m, f.index), g ? g = (g + 1) % 5 : _.substr(-5) === "rgba(" && (g = 1), S !== p[y++] && (x = parseFloat(p[y - 1]) || 0, d._pt = {
      _next: d._pt,
      p: _ || y === 1 ? _ : ",",
      //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
      s: x,
      c: S.charAt(1) === "=" ? $s(x, S) - x : parseFloat(S) - x,
      m: g && g < 4 ? Math.round : 0
    }, m = gh.lastIndex);
  return d.c = m < s.length ? s.substring(m, s.length) : "", d.fp = c, (_1.test(s) || T) && (d.e = 0), this._pt = d, d;
}, Wm = function(e, n, r, s, a, l, c, d, m, y) {
  qe(s) && (s = s(a || 0, e, l));
  var f = e[n], p = r !== "get" ? r : qe(f) ? m ? e[n.indexOf("set") || !qe(e["get" + n.substr(3)]) ? n : "get" + n.substr(3)](m) : e[n]() : f, g = qe(f) ? m ? zO : Y1 : Km, S;
  if (pt(s) && (~s.indexOf("random(") && (s = ja(s)), s.charAt(1) === "=" && (S = $s(p, s) + (Et(p) || 0), (S || S === 0) && (s = S))), !y || p !== s || pp)
    return !isNaN(p * s) && s !== "" ? (S = new Qt(this._pt, e, n, +p || 0, s - (p || 0), typeof f == "boolean" ? $O : X1, 0, g), m && (S.fp = m), c && S.modifier(c, this, e), this._pt = S) : (!f && !(n in e) && Bm(n, s), NO.call(this, e, n, p, s, g, d || un.stringFilter, m));
}, LO = function(e, n, r, s, a) {
  if (qe(e) && (e = Pa(e, a, n, r, s)), !ir(e) || e.style && e.nodeType || At(e) || g1(e))
    return pt(e) ? Pa(e, a, n, r, s) : e;
  var l = {}, c;
  for (c in e)
    l[c] = Pa(e[c], a, n, r, s);
  return l;
}, G1 = function(e, n, r, s, a, l) {
  var c, d, m, y;
  if (rn[e] && (c = new rn[e]()).init(a, c.rawVars ? n[e] : LO(n[e], s, a, l, r), r, s, l) !== !1 && (r._pt = d = new Qt(r._pt, a, e, 0, 1, c.render, c, 0, c.priority), r !== Us))
    for (m = r._ptLookup[r._targets.indexOf(a)], y = c._props.length; y--; )
      m[c._props[y]] = d;
  return c;
}, ri, pp, Gm = function t(e, n, r) {
  var s = e.vars, a = s.ease, l = s.startAt, c = s.immediateRender, d = s.lazy, m = s.onUpdate, y = s.runBackwards, f = s.yoyoEase, p = s.keyframes, g = s.autoRevert, S = e._dur, _ = e._startAt, x = e._targets, T = e.parent, E = T && T.data === "nested" ? T.vars.targets : x, A = e._overwrite === "auto" && !Nm, b = e.timeline, M = s.easeReverse || f, B, I, O, L, $, q, J, ie, re, ue, fe, me, W;
  if (b && (!p || !a) && (a = "none"), e._ease = ns(a, Ia.ease), e._rEase = M && (ns(M) || e._ease), e._from = !b && !!s.runBackwards, e._from && (e.ratio = 1), !b || p && !s.stagger) {
    if (ie = x[0] ? es(x[0]).harness : 0, me = ie && s[ie.prop], B = Sc(s, zm), _ && (_._zTime < 0 && _.progress(1), n < 0 && y && c && !g ? _.render(-1, !0) : _.revert(y && S ? ec : cO), _._lazy = 0), l) {
      if (fi(e._startAt = rt.set(x, fn({
        data: "isStart",
        overwrite: !1,
        parent: T,
        immediateRender: !0,
        lazy: !_ && Gt(d),
        startAt: null,
        delay: 0,
        onUpdate: m && function() {
          return an(e, "onUpdate");
        },
        stagger: 0
      }, l))), e._startAt._dp = 0, e._startAt._sat = e, n < 0 && (wt || !c && !g) && e._startAt.revert(ec), c && S && n <= 0 && r <= 0) {
        n && (e._zTime = n);
        return;
      }
    } else if (y && S && !_) {
      if (n && (c = !1), O = fn({
        overwrite: !1,
        data: "isFromStart",
        //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
        lazy: c && !_ && Gt(d),
        immediateRender: c,
        //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
        stagger: 0,
        parent: T
        //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
      }, B), me && (O[ie.prop] = me), fi(e._startAt = rt.set(x, O)), e._startAt._dp = 0, e._startAt._sat = e, n < 0 && (wt ? e._startAt.revert(ec) : e._startAt.render(-1, !0)), e._zTime = n, !c)
        t(e._startAt, De, De);
      else if (!n)
        return;
    }
    for (e._pt = e._ptCache = 0, d = S && Gt(d) || d && !S, I = 0; I < x.length; I++) {
      if ($ = x[I], J = $._gsap || $m(x)[I]._gsap, e._ptLookup[I] = ue = {}, lp[J.id] && oi.length && wc(), fe = E === x ? I : E.indexOf($), ie && (re = new ie()).init($, me || B, e, fe, E) !== !1 && (e._pt = L = new Qt(e._pt, $, re.name, 0, 1, re.render, re, 0, re.priority), re._props.forEach(function(ee) {
        ue[ee] = L;
      }), re.priority && (q = 1)), !ie || me)
        for (O in B)
          rn[O] && (re = G1(O, B, e, fe, $, E)) ? re.priority && (q = 1) : ue[O] = L = Wm.call(e, $, O, "get", B[O], fe, E, 0, s.stringFilter);
      e._op && e._op[I] && e.kill($, e._op[I]), A && e._pt && (ri = e, Ge.killTweensOf($, ue, e.globalTime(n)), W = !e.parent, ri = 0), e._pt && d && (lp[J.id] = 1);
    }
    q && Z1(e), e._onInit && e._onInit(e);
  }
  e._onUpdate = m, e._initted = (!e._op || e._pt) && !W, p && n <= 0 && b.render(xn, !0, !0);
}, jO = function(e, n, r, s, a, l, c, d) {
  var m = (e._pt && e._ptCache || (e._ptCache = {}))[n], y, f, p, g;
  if (!m)
    for (m = e._ptCache[n] = [], p = e._ptLookup, g = e._targets.length; g--; ) {
      if (y = p[g][n], y && y.d && y.d._pt)
        for (y = y.d._pt; y && y.p !== n && y.fp !== n; )
          y = y._next;
      if (!y)
        return pp = 1, e.vars[n] = "+=0", Gm(e, c), pp = 0, d ? Na(n + " not eligible for reset. Try splitting into individual properties") : 1;
      m.push(y);
    }
  for (g = m.length; g--; )
    f = m[g], y = f._pt || f, y.s = (s || s === 0) && !a ? s : y.s + (s || 0) + l * y.c, y.c = r - y.s, f.e && (f.e = et(r) + Et(f.e)), f.b && (f.b = y.s + Et(f.b));
}, VO = function(e, n) {
  var r = e[0] ? es(e[0]).harness : 0, s = r && r.aliases, a, l, c, d;
  if (!s)
    return n;
  a = uo({}, n);
  for (l in s)
    if (l in a)
      for (d = s[l].split(","), c = d.length; c--; )
        a[d[c]] = a[l];
  return a;
}, BO = function(e, n, r, s) {
  var a = n.ease || s || "power1.inOut", l, c;
  if (At(n))
    c = r[e] || (r[e] = []), n.forEach(function(d, m) {
      return c.push({
        t: m / (n.length - 1) * 100,
        v: d,
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
}, Pa = function(e, n, r, s, a) {
  return qe(e) ? e.call(n, r, s, a) : pt(e) && ~e.indexOf("random(") ? ja(e) : e;
}, K1 = Um + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", Q1 = {};
Kt(K1 + ",id,stagger,delay,duration,paused,scrollTrigger", function(t) {
  return Q1[t] = 1;
});
var rt = /* @__PURE__ */ (function(t) {
  m1(e, t);
  function e(r, s, a, l) {
    var c;
    typeof s == "number" && (a.duration = s, s = a, a = null), c = t.call(this, l ? s : Ca(s)) || this;
    var d = c.vars, m = d.duration, y = d.delay, f = d.immediateRender, p = d.stagger, g = d.overwrite, S = d.keyframes, _ = d.defaults, x = d.scrollTrigger, T = s.parent || Ge, E = (At(r) || g1(r) ? xr(r[0]) : "length" in s) ? [r] : Tn(r), A, b, M, B, I, O, L, $;
    if (c._targets = E.length ? $m(E) : Na("GSAP target " + r + " not found. https://gsap.com", !un.nullTargetWarn) || [], c._ptLookup = [], c._overwrite = g, S || p || Fu(m) || Fu(y)) {
      s = c.vars;
      var q = s.easeReverse || s.yoyoEase;
      if (A = c.timeline = new Ht({
        data: "nested",
        defaults: _ || {},
        targets: T && T.data === "nested" ? T.vars.targets : E
      }), A.kill(), A.parent = A._dp = mr(c), A._start = 0, p || Fu(m) || Fu(y)) {
        if (B = E.length, L = p && O1(p), ir(p))
          for (I in p)
            ~K1.indexOf(I) && ($ || ($ = {}), $[I] = p[I]);
        for (b = 0; b < B; b++)
          M = Sc(s, Q1), M.stagger = 0, q && (M.easeReverse = q), $ && uo(M, $), O = E[b], M.duration = +Pa(m, mr(c), b, O, E), M.delay = (+Pa(y, mr(c), b, O, E) || 0) - c._delay, !p && B === 1 && M.delay && (c._delay = y = M.delay, c._start += y, M.delay = 0), A.to(O, M, L ? L(b, O, E) : 0), A._ease = Ce.none;
        A.duration() ? m = y = 0 : c.timeline = 0;
      } else if (S) {
        Ca(fn(A.vars.defaults, {
          ease: "none"
        })), A._ease = ns(S.ease || s.ease || "none");
        var J = 0, ie, re, ue;
        if (At(S))
          S.forEach(function(fe) {
            return A.to(E, fe, ">");
          }), A.duration();
        else {
          M = {};
          for (I in S)
            I === "ease" || I === "easeEach" || BO(I, S[I], M, S.easeEach);
          for (I in M)
            for (ie = M[I].sort(function(fe, me) {
              return fe.t - me.t;
            }), J = 0, b = 0; b < ie.length; b++)
              re = ie[b], ue = {
                ease: re.e,
                duration: (re.t - (b ? ie[b - 1].t : 0)) / 100 * m
              }, ue[I] = re.v, A.to(E, ue, J), J += ue.duration;
          A.duration() < m && A.to({}, {
            duration: m - A.duration()
          });
        }
      }
      m || c.duration(m = A.duration());
    } else
      c.timeline = 0;
    return g === !0 && !Nm && (ri = mr(c), Ge.killTweensOf(E), ri = 0), Jn(T, mr(c), a), s.reversed && c.reverse(), s.paused && c.paused(!0), (f || !m && !S && c._start === We(T._time) && Gt(f) && yO(mr(c)) && T.data !== "nested") && (c._tTime = -De, c.render(Math.max(0, -y) || 0)), x && R1(mr(c), x), c;
  }
  var n = e.prototype;
  return n.render = function(s, a, l) {
    var c = this._time, d = this._tDur, m = this._dur, y = s < 0, f = s > d - De && !y ? d : s < De ? 0 : s, p, g, S, _, x, T, E, A;
    if (!m)
      vO(this, s, a, l);
    else if (f !== this._tTime || !s || l || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== y || this._lazy) {
      if (p = f, A = this.timeline, this._repeat) {
        if (_ = m + this._rDelay, this._repeat < -1 && y)
          return this.totalTime(_ * 100 + s, a, l);
        if (p = We(f % _), f === d ? (S = this._repeat, p = m) : (x = We(f / _), S = ~~x, S && S === x ? (p = m, S--) : p > m && (p = m)), T = this._yoyo && S & 1, T && (p = m - p), x = co(this._tTime, _), p === c && !l && this._initted && S === x)
          return this._tTime = f, this;
        S !== x && this.vars.repeatRefresh && !T && !this._lock && p !== _ && this._initted && (this._lock = l = 1, this.render(We(_ * S), !0).invalidate()._lock = 0);
      }
      if (!this._initted) {
        if (M1(this, y ? s : p, l, a, f))
          return this._tTime = 0, this;
        if (c !== this._time && !(l && this.vars.repeatRefresh && S !== x))
          return this;
        if (m !== this._dur)
          return this.render(s, a, l);
      }
      if (this._rEase) {
        var b = p < c;
        if (b !== this._inv) {
          var M = b ? c : m - c;
          this._inv = b, this._from && (this.ratio = 1 - this.ratio), this._invRatio = this.ratio, this._invTime = c, this._invRecip = M ? (b ? -1 : 1) / M : 0, this._invScale = b ? -this.ratio : 1 - this.ratio, this._invEase = b ? this._rEase : this._ease;
        }
        this.ratio = E = this._invRatio + this._invScale * this._invEase((p - this._invTime) * this._invRecip);
      } else
        this.ratio = E = this._ease(p / m);
      if (this._from && (this.ratio = E = 1 - E), this._tTime = f, this._time = p, !this._act && this._ts && (this._act = 1, this._lazy = 0), !c && f && !a && !x && (an(this, "onStart"), this._tTime !== f))
        return this;
      for (g = this._pt; g; )
        g.r(E, g.d), g = g._next;
      A && A.render(s < 0 ? s : A._dur * A._ease(p / this._dur), a, l) || this._startAt && (this._zTime = s), this._onUpdate && !a && (y && up(this, s, a, l), an(this, "onUpdate")), this._repeat && S !== x && this.vars.onRepeat && !a && this.parent && an(this, "onRepeat"), (f === this._tDur || !f) && this._tTime === f && (y && !this._onUpdate && up(this, s, !0, !0), (s || !m) && (f === this._tDur && this._ts > 0 || !f && this._ts < 0) && fi(this, 1), !a && !(y && !c) && (f || c || T) && (an(this, f === d ? "onComplete" : "onReverseComplete", !0), this._prom && !(f < d && this.timeScale() > 0) && this._prom()));
    }
    return this;
  }, n.targets = function() {
    return this._targets;
  }, n.invalidate = function(s) {
    return (!s || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(s), t.prototype.invalidate.call(this, s);
  }, n.resetTo = function(s, a, l, c, d) {
    Va || on.wake(), this._ts || this.play();
    var m = Math.min(this._dur, (this._dp._time - this._start) * this._ts), y;
    return this._initted || Gm(this, m), y = this._ease(m / this._dur), jO(this, s, a, l, c, y, m, d) ? this.resetTo(s, a, l, c, 1) : (Uc(this, 0), this.parent || A1(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
  }, n.kill = function(s, a) {
    if (a === void 0 && (a = "all"), !s && (!a || a === "all"))
      return this._lazy = this._pt = 0, this.parent ? ya(this) : this.scrollTrigger && this.scrollTrigger.kill(!!wt), this;
    if (this.timeline) {
      var l = this.timeline.totalDuration();
      return this.timeline.killTweensOf(s, a, ri && ri.vars.overwrite !== !0)._first || ya(this), this.parent && l !== this.timeline.totalDuration() && fo(this, this._dur * this.timeline._tDur / l, 0, 1), this;
    }
    var c = this._targets, d = s ? Tn(s) : c, m = this._ptLookup, y = this._pt, f, p, g, S, _, x, T;
    if ((!a || a === "all") && pO(c, d))
      return a === "all" && (this._pt = 0), ya(this);
    for (f = this._op = this._op || [], a !== "all" && (pt(a) && (_ = {}, Kt(a, function(E) {
      return _[E] = 1;
    }), a = _), a = VO(c, a)), T = c.length; T--; )
      if (~d.indexOf(c[T])) {
        p = m[T], a === "all" ? (f[T] = a, S = p, g = {}) : (g = f[T] = f[T] || {}, S = a);
        for (_ in S)
          x = p && p[_], x && ((!("kill" in x.d) || x.d.kill(_) === !0) && Bc(this, x, "_pt"), delete p[_]), g !== "all" && (g[_] = 1);
      }
    return this._initted && !this._pt && y && ya(this), this;
  }, e.to = function(s, a) {
    return new e(s, a, arguments[2]);
  }, e.from = function(s, a) {
    return ka(1, arguments);
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
    return ka(2, arguments);
  }, e.set = function(s, a) {
    return a.duration = 0, a.repeatDelay || (a.repeat = 0), new e(s, a);
  }, e.killTweensOf = function(s, a, l) {
    return Ge.killTweensOf(s, a, l);
  }, e;
})(Ba);
fn(rt.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
});
Kt("staggerTo,staggerFrom,staggerFromTo", function(t) {
  rt[t] = function() {
    var e = new Ht(), n = fp.call(arguments, 0);
    return n.splice(t === "staggerFromTo" ? 5 : 4, 0, 0), e[t].apply(e, n);
  };
});
var Km = function(e, n, r) {
  return e[n] = r;
}, Y1 = function(e, n, r) {
  return e[n](r);
}, zO = function(e, n, r, s) {
  return e[n](s.fp, r);
}, UO = function(e, n, r) {
  return e.setAttribute(n, r);
}, Qm = function(e, n) {
  return qe(e[n]) ? Y1 : Lm(e[n]) && e.setAttribute ? UO : Km;
}, X1 = function(e, n) {
  return n.set(n.t, n.p, Math.round((n.s + n.c * e) * 1e6) / 1e6, n);
}, $O = function(e, n) {
  return n.set(n.t, n.p, !!(n.s + n.c * e), n);
}, q1 = function(e, n) {
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
}, Ym = function(e, n) {
  for (var r = n._pt; r; )
    r.r(e, r.d), r = r._next;
}, HO = function(e, n, r, s) {
  for (var a = this._pt, l; a; )
    l = a._next, a.p === s && a.modifier(e, n, r), a = l;
}, WO = function(e) {
  for (var n = this._pt, r, s; n; )
    s = n._next, n.p === e && !n.op || n.op === e ? Bc(this, n, "_pt") : n.dep || (r = 1), n = s;
  return !r;
}, GO = function(e, n, r, s) {
  s.mSet(e, n, s.m.call(s.tween, r, s.mt), s);
}, Z1 = function(e) {
  for (var n = e._pt, r, s, a, l; n; ) {
    for (r = n._next, s = a; s && s.pr > n.pr; )
      s = s._next;
    (n._prev = s ? s._prev : l) ? n._prev._next = n : a = n, (n._next = s) ? s._prev = n : l = n, n = r;
  }
  e._pt = a;
}, Qt = /* @__PURE__ */ (function() {
  function t(n, r, s, a, l, c, d, m, y) {
    this.t = r, this.s = a, this.c = l, this.p = s, this.r = c || X1, this.d = d || this, this.set = m || Km, this.pr = y || 0, this._next = n, n && (n._prev = this);
  }
  var e = t.prototype;
  return e.modifier = function(r, s, a) {
    this.mSet = this.mSet || this.set, this.set = GO, this.m = r, this.mt = a, this.tween = s;
  }, t;
})();
Kt(Um + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(t) {
  return zm[t] = 1;
});
cn.TweenMax = cn.TweenLite = rt;
cn.TimelineLite = cn.TimelineMax = Ht;
Ge = new Ht({
  sortChildren: !1,
  defaults: Ia,
  autoRemoveChildren: !0,
  id: "root",
  smoothChildTiming: !0
});
un.stringFilter = $1;
var rs = [], nc = {}, KO = [], J_ = 0, QO = 0, xh = function(e) {
  return (nc[e] || KO).map(function(n) {
    return n();
  });
}, mp = function() {
  var e = Date.now(), n = [];
  e - J_ > 2 && (xh("matchMediaInit"), rs.forEach(function(r) {
    var s = r.queries, a = r.conditions, l, c, d, m;
    for (c in s)
      l = Kn.matchMedia(s[c]).matches, l && (d = 1), l !== a[c] && (a[c] = l, m = 1);
    m && (r.revert(), d && n.push(r));
  }), xh("matchMediaRevert"), n.forEach(function(r) {
    return r.onMatch(r, function(s) {
      return r.add(null, s);
    });
  }), J_ = e, xh("matchMedia"));
}, J1 = /* @__PURE__ */ (function() {
  function t(n, r) {
    this.selector = r && dp(r), this.data = [], this._r = [], this.isReverted = !1, this.id = QO++, n && this.add(n);
  }
  var e = t.prototype;
  return e.add = function(r, s, a) {
    qe(r) && (a = s, s = r, r = qe);
    var l = this, c = function() {
      var m = ze, y = l.selector, f;
      return m && m !== l && m.data.push(l), a && (l.selector = dp(a)), ze = l, f = s.apply(l, arguments), qe(f) && l._r.push(f), ze = m, l.selector = y, l.isReverted = !1, f;
    };
    return l.last = c, r === qe ? c(l, function(d) {
      return l.add(null, d);
    }) : r ? l[r] = c : c;
  }, e.ignore = function(r) {
    var s = ze;
    ze = null, r(this), ze = s;
  }, e.getTweens = function() {
    var r = [];
    return this.data.forEach(function(s) {
      return s instanceof t ? r.push.apply(r, s.getTweens()) : s instanceof rt && !(s.parent && s.parent.data === "nested") && r.push(s);
    }), r;
  }, e.clear = function() {
    this._r.length = this.data.length = 0;
  }, e.kill = function(r, s) {
    var a = this;
    if (r ? (function() {
      for (var c = a.getTweens(), d = a.data.length, m; d--; )
        m = a.data[d], m.data === "isFlip" && (m.revert(), m.getChildren(!0, !0, !1).forEach(function(y) {
          return c.splice(c.indexOf(y), 1);
        }));
      for (c.map(function(y) {
        return {
          g: y._dur || y._delay || y._sat && !y._sat.vars.immediateRender ? y.globalTime(0) : -1 / 0,
          t: y
        };
      }).sort(function(y, f) {
        return f.g - y.g || -1 / 0;
      }).forEach(function(y) {
        return y.t.revert(r);
      }), d = a.data.length; d--; )
        m = a.data[d], m instanceof Ht ? m.data !== "nested" && (m.scrollTrigger && m.scrollTrigger.revert(), m.kill()) : !(m instanceof rt) && m.revert && m.revert(r);
      a._r.forEach(function(y) {
        return y(r, a);
      }), a.isReverted = !0;
    })() : this.data.forEach(function(c) {
      return c.kill && c.kill();
    }), this.clear(), s)
      for (var l = rs.length; l--; )
        rs[l].id === this.id && rs.splice(l, 1);
  }, e.revert = function(r) {
    this.kill(r || {});
  }, t;
})(), YO = /* @__PURE__ */ (function() {
  function t(n) {
    this.contexts = [], this.scope = n, ze && ze.data.push(this);
  }
  var e = t.prototype;
  return e.add = function(r, s, a) {
    ir(r) || (r = {
      matches: r
    });
    var l = new J1(0, a || this.scope), c = l.conditions = {}, d, m, y;
    ze && !l.selector && (l.selector = ze.selector), this.contexts.push(l), s = l.add("onMatch", s), l.queries = r;
    for (m in r)
      m === "all" ? y = 1 : (d = Kn.matchMedia(r[m]), d && (rs.indexOf(l) < 0 && rs.push(l), (c[m] = d.matches) && (y = 1), d.addListener ? d.addListener(mp) : d.addEventListener("change", mp)));
    return y && s(l, function(f) {
      return l.add(null, f);
    }), this;
  }, e.revert = function(r) {
    this.kill(r || {});
  }, e.kill = function(r) {
    this.contexts.forEach(function(s) {
      return s.kill(r, !0);
    });
  }, t;
})(), Tc = {
  registerPlugin: function() {
    for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
      n[r] = arguments[r];
    n.forEach(function(s) {
      return B1(s);
    });
  },
  timeline: function(e) {
    return new Ht(e);
  },
  getTweensOf: function(e, n) {
    return Ge.getTweensOf(e, n);
  },
  getProperty: function(e, n, r, s) {
    pt(e) && (e = Tn(e)[0]);
    var a = es(e || {}).get, l = r ? E1 : P1;
    return r === "native" && (r = ""), e && (n ? l((rn[n] && rn[n].get || a)(e, n, r, s)) : function(c, d, m) {
      return l((rn[c] && rn[c].get || a)(e, c, d, m));
    });
  },
  quickSetter: function(e, n, r) {
    if (e = Tn(e), e.length > 1) {
      var s = e.map(function(y) {
        return Xt.quickSetter(y, n, r);
      }), a = s.length;
      return function(y) {
        for (var f = a; f--; )
          s[f](y);
      };
    }
    e = e[0] || {};
    var l = rn[n], c = es(e), d = c.harness && (c.harness.aliases || {})[n] || n, m = l ? function(y) {
      var f = new l();
      Us._pt = 0, f.init(e, r ? y + r : y, Us, 0, [e]), f.render(1, f), Us._pt && Ym(1, Us);
    } : c.set(e, d);
    return l ? m : function(y) {
      return m(e, d, r ? y + r : y, c, 1);
    };
  },
  quickTo: function(e, n, r) {
    var s, a = Xt.to(e, fn((s = {}, s[n] = "+=0.1", s.paused = !0, s.stagger = 0, s), r || {})), l = function(d, m, y) {
      return a.resetTo(n, d, m, y);
    };
    return l.tween = a, l;
  },
  isTweening: function(e) {
    return Ge.getTweensOf(e, !0).length > 0;
  },
  defaults: function(e) {
    return e && e.ease && (e.ease = ns(e.ease, Ia.ease)), Q_(Ia, e || {});
  },
  config: function(e) {
    return Q_(un, e || {});
  },
  registerEffect: function(e) {
    var n = e.name, r = e.effect, s = e.plugins, a = e.defaults, l = e.extendTimeline;
    (s || "").split(",").forEach(function(c) {
      return c && !rn[c] && !cn[c] && Na(n + " effect requires " + c + " plugin.");
    }), vh[n] = function(c, d, m) {
      return r(Tn(c), fn(d || {}, a), m);
    }, l && (Ht.prototype[n] = function(c, d, m) {
      return this.add(vh[n](c, ir(d) ? d : (m = d) && {}, this), m);
    });
  },
  registerEase: function(e, n) {
    Ce[e] = ns(n);
  },
  parseEase: function(e, n) {
    return arguments.length ? ns(e, n) : Ce;
  },
  getById: function(e) {
    return Ge.getById(e);
  },
  exportRoot: function(e, n) {
    e === void 0 && (e = {});
    var r = new Ht(e), s, a;
    for (r.smoothChildTiming = Gt(e.smoothChildTiming), Ge.remove(r), r._dp = 0, r._time = r._tTime = Ge._time, s = Ge._first; s; )
      a = s._next, (n || !(!s._dur && s instanceof rt && s.vars.onComplete === s._targets[0])) && Jn(r, s, s._start - s._delay), s = a;
    return Jn(Ge, r, 0), r;
  },
  context: function(e, n) {
    return e ? new J1(e, n) : ze;
  },
  matchMedia: function(e) {
    return new YO(e);
  },
  matchMediaRefresh: function() {
    return rs.forEach(function(e) {
      var n = e.conditions, r, s;
      for (s in n)
        n[s] && (n[s] = !1, r = 1);
      r && e.revert();
    }) || mp();
  },
  addEventListener: function(e, n) {
    var r = nc[e] || (nc[e] = []);
    ~r.indexOf(n) || r.push(n);
  },
  removeEventListener: function(e, n) {
    var r = nc[e], s = r && r.indexOf(n);
    s >= 0 && r.splice(s, 1);
  },
  utils: {
    wrap: PO,
    wrapYoyo: EO,
    distribute: O1,
    random: N1,
    snap: I1,
    normalize: kO,
    getUnit: Et,
    clamp: SO,
    splitColor: z1,
    toArray: Tn,
    selector: dp,
    mapRange: j1,
    pipe: TO,
    unitize: CO,
    interpolate: AO,
    shuffle: F1
  },
  install: S1,
  effects: vh,
  ticker: on,
  updateRoot: Ht.updateRoot,
  plugins: rn,
  globalTimeline: Ge,
  core: {
    PropTween: Qt,
    globals: x1,
    Tween: rt,
    Timeline: Ht,
    Animation: Ba,
    getCache: es,
    _removeLinkedListItem: Bc,
    reverting: function() {
      return wt;
    },
    context: function(e) {
      return e && ze && (ze.data.push(e), e._ctx = ze), ze;
    },
    suppressOverwrites: function(e) {
      return Nm = e;
    }
  }
};
Kt("to,from,fromTo,delayedCall,set,killTweensOf", function(t) {
  return Tc[t] = rt[t];
});
on.add(Ht.updateRoot);
Us = Tc.to({}, {
  duration: 0
});
var XO = function(e, n) {
  for (var r = e._pt; r && r.p !== n && r.op !== n && r.fp !== n; )
    r = r._next;
  return r;
}, qO = function(e, n) {
  var r = e._targets, s, a, l;
  for (s in n)
    for (a = r.length; a--; )
      l = e._ptLookup[a][s], l && (l = l.d) && (l._pt && (l = XO(l, s)), l && l.modifier && l.modifier(n[s], e, r[a], s));
}, Th = function(e, n) {
  return {
    name: e,
    headless: 1,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function(s, a, l) {
      l._onInit = function(c) {
        var d, m;
        if (pt(a) && (d = {}, Kt(a, function(y) {
          return d[y] = 1;
        }), a = d), n) {
          d = {};
          for (m in a)
            d[m] = n(a[m]);
          a = d;
        }
        qO(c, a);
      };
    }
  };
}, Xt = Tc.registerPlugin({
  name: "attr",
  init: function(e, n, r, s, a) {
    var l, c, d;
    this.tween = r;
    for (l in n)
      d = e.getAttribute(l) || "", c = this.add(e, "setAttribute", (d || 0) + "", n[l], s, a, 0, 0, l), c.op = l, c.b = d, this._props.push(l);
  },
  render: function(e, n) {
    for (var r = n._pt; r; )
      wt ? r.set(r.t, r.p, r.b, r) : r.r(e, r.d), r = r._next;
  }
}, {
  name: "endArray",
  headless: 1,
  init: function(e, n) {
    for (var r = n.length; r--; )
      this.add(e, r, e[r] || 0, n[r], 0, 0, 0, 0, 0, 1);
  }
}, Th("roundProps", hp), Th("modifiers"), Th("snap", I1)) || Tc;
rt.version = Ht.version = Xt.version = "3.15.0";
w1 = 1;
jm() && ho();
Ce.Power0;
Ce.Power1;
Ce.Power2;
Ce.Power3;
Ce.Power4;
Ce.Linear;
Ce.Quad;
Ce.Cubic;
Ce.Quart;
Ce.Quint;
Ce.Strong;
Ce.Elastic;
Ce.Back;
Ce.SteppedEase;
Ce.Bounce;
Ce.Sine;
Ce.Expo;
Ce.Circ;
/*!
 * CSSPlugin 3.15.0
 * https://gsap.com
 *
 * Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/
var ew, ii, Hs, Xm, zi, tw, qm, ZO = function() {
  return typeof window < "u";
}, Tr = {}, Ni = 180 / Math.PI, Ws = Math.PI / 180, Ds = Math.atan2, nw = 1e8, Zm = /([A-Z])/g, JO = /(left|right|width|margin|padding|x)/i, eI = /[\s,\(]\S/, tr = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
}, yp = function(e, n) {
  return n.set(n.t, n.p, Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u, n);
}, tI = function(e, n) {
  return n.set(n.t, n.p, e === 1 ? n.e : Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u, n);
}, nI = function(e, n) {
  return n.set(n.t, n.p, e ? Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u : n.b, n);
}, rI = function(e, n) {
  return n.set(n.t, n.p, e === 1 ? n.e : e ? Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u : n.b, n);
}, iI = function(e, n) {
  var r = n.s + n.c * e;
  n.set(n.t, n.p, ~~(r + (r < 0 ? -0.5 : 0.5)) + n.u, n);
}, eT = function(e, n) {
  return n.set(n.t, n.p, e ? n.e : n.b, n);
}, tT = function(e, n) {
  return n.set(n.t, n.p, e !== 1 ? n.b : n.e, n);
}, sI = function(e, n, r) {
  return e.style[n] = r;
}, oI = function(e, n, r) {
  return e.style.setProperty(n, r);
}, aI = function(e, n, r) {
  return e._gsap[n] = r;
}, lI = function(e, n, r) {
  return e._gsap.scaleX = e._gsap.scaleY = r;
}, uI = function(e, n, r, s, a) {
  var l = e._gsap;
  l.scaleX = l.scaleY = r, l.renderTransform(a, l);
}, cI = function(e, n, r, s, a) {
  var l = e._gsap;
  l[n] = r, l.renderTransform(a, l);
}, Ke = "transform", Yt = Ke + "Origin", fI = function t(e, n) {
  var r = this, s = this.target, a = s.style, l = s._gsap;
  if (e in Tr && a) {
    if (this.tfm = this.tfm || {}, e !== "transform")
      e = tr[e] || e, ~e.indexOf(",") ? e.split(",").forEach(function(c) {
        return r.tfm[c] = yr(s, c);
      }) : this.tfm[e] = l.x ? l[e] : yr(s, e), e === Yt && (this.tfm.zOrigin = l.zOrigin);
    else
      return tr.transform.split(",").forEach(function(c) {
        return t.call(r, c, n);
      });
    if (this.props.indexOf(Ke) >= 0)
      return;
    l.svg && (this.svgo = s.getAttribute("data-svg-origin"), this.props.push(Yt, n, "")), e = Ke;
  }
  (a || n) && this.props.push(e, n, a[e]);
}, nT = function(e) {
  e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, dI = function() {
  var e = this.props, n = this.target, r = n.style, s = n._gsap, a, l;
  for (a = 0; a < e.length; a += 3)
    e[a + 1] ? e[a + 1] === 2 ? n[e[a]](e[a + 2]) : n[e[a]] = e[a + 2] : e[a + 2] ? r[e[a]] = e[a + 2] : r.removeProperty(e[a].substr(0, 2) === "--" ? e[a] : e[a].replace(Zm, "-$1").toLowerCase());
  if (this.tfm) {
    for (l in this.tfm)
      s[l] = this.tfm[l];
    s.svg && (s.renderTransform(), n.setAttribute("data-svg-origin", this.svgo || "")), a = qm(), (!a || !a.isStart) && !r[Ke] && (nT(r), s.zOrigin && r[Yt] && (r[Yt] += " " + s.zOrigin + "px", s.zOrigin = 0, s.renderTransform()), s.uncache = 1);
  }
}, rT = function(e, n) {
  var r = {
    target: e,
    props: [],
    revert: dI,
    save: fI
  };
  return e._gsap || Xt.core.getCache(e), n && e.style && e.nodeType && n.split(",").forEach(function(s) {
    return r.save(s);
  }), r;
}, iT, gp = function(e, n) {
  var r = ii.createElementNS ? ii.createElementNS((n || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : ii.createElement(e);
  return r && r.style ? r : ii.createElement(e);
}, ln = function t(e, n, r) {
  var s = getComputedStyle(e);
  return s[n] || s.getPropertyValue(n.replace(Zm, "-$1").toLowerCase()) || s.getPropertyValue(n) || !r && t(e, po(n) || n, 1) || "";
}, rw = "O,Moz,ms,Ms,Webkit".split(","), po = function(e, n, r) {
  var s = n || zi, a = s.style, l = 5;
  if (e in a && !r)
    return e;
  for (e = e.charAt(0).toUpperCase() + e.substr(1); l-- && !(rw[l] + e in a); )
    ;
  return l < 0 ? null : (l === 3 ? "ms" : l >= 0 ? rw[l] : "") + e;
}, vp = function() {
  ZO() && window.document && (ew = window, ii = ew.document, Hs = ii.documentElement, zi = gp("div") || {
    style: {}
  }, gp("div"), Ke = po(Ke), Yt = Ke + "Origin", zi.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", iT = !!po("perspective"), qm = Xt.core.reverting, Xm = 1);
}, iw = function(e) {
  var n = e.ownerSVGElement, r = gp("svg", n && n.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), s = e.cloneNode(!0), a;
  s.style.display = "block", r.appendChild(s), Hs.appendChild(r);
  try {
    a = s.getBBox();
  } catch {
  }
  return r.removeChild(s), Hs.removeChild(r), a;
}, sw = function(e, n) {
  for (var r = n.length; r--; )
    if (e.hasAttribute(n[r]))
      return e.getAttribute(n[r]);
}, sT = function(e) {
  var n, r;
  try {
    n = e.getBBox();
  } catch {
    n = iw(e), r = 1;
  }
  return n && (n.width || n.height) || r || (n = iw(e)), n && !n.width && !n.x && !n.y ? {
    x: +sw(e, ["x", "cx", "x1"]) || 0,
    y: +sw(e, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : n;
}, oT = function(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && sT(e));
}, di = function(e, n) {
  if (n) {
    var r = e.style, s;
    n in Tr && n !== Yt && (n = Ke), r.removeProperty ? (s = n.substr(0, 2), (s === "ms" || n.substr(0, 6) === "webkit") && (n = "-" + n), r.removeProperty(s === "--" ? n : n.replace(Zm, "-$1").toLowerCase())) : r.removeAttribute(n);
  }
}, si = function(e, n, r, s, a, l) {
  var c = new Qt(e._pt, n, r, 0, 1, l ? tT : eT);
  return e._pt = c, c.b = s, c.e = a, e._props.push(r), c;
}, ow = {
  deg: 1,
  rad: 1,
  turn: 1
}, hI = {
  grid: 1,
  flex: 1
}, hi = function t(e, n, r, s) {
  var a = parseFloat(r) || 0, l = (r + "").trim().substr((a + "").length) || "px", c = zi.style, d = JO.test(n), m = e.tagName.toLowerCase() === "svg", y = (m ? "client" : "offset") + (d ? "Width" : "Height"), f = 100, p = s === "px", g = s === "%", S, _, x, T;
  if (s === l || !a || ow[s] || ow[l])
    return a;
  if (l !== "px" && !p && (a = t(e, n, r, "px")), T = e.getCTM && oT(e), (g || l === "%") && (Tr[n] || ~n.indexOf("adius")))
    return S = T ? e.getBBox()[d ? "width" : "height"] : e[y], et(g ? a / S * f : a / 100 * S);
  if (c[d ? "width" : "height"] = f + (p ? l : s), _ = s !== "rem" && ~n.indexOf("adius") || s === "em" && e.appendChild && !m ? e : e.parentNode, T && (_ = (e.ownerSVGElement || {}).parentNode), (!_ || _ === ii || !_.appendChild) && (_ = ii.body), x = _._gsap, x && g && x.width && d && x.time === on.time && !x.uncache)
    return et(a / x.width * f);
  if (g && (n === "height" || n === "width")) {
    var E = e.style[n];
    e.style[n] = f + s, S = e[y], E ? e.style[n] = E : di(e, n);
  } else
    (g || l === "%") && !hI[ln(_, "display")] && (c.position = ln(e, "position")), _ === e && (c.position = "static"), _.appendChild(zi), S = zi[y], _.removeChild(zi), c.position = "absolute";
  return d && g && (x = es(_), x.time = on.time, x.width = _[y]), et(p ? S * a / f : S && a ? f / S * a : 0);
}, yr = function(e, n, r, s) {
  var a;
  return Xm || vp(), n in tr && n !== "transform" && (n = tr[n], ~n.indexOf(",") && (n = n.split(",")[0])), Tr[n] && n !== "transform" ? (a = Ua(e, s), a = n !== "transformOrigin" ? a[n] : a.svg ? a.origin : kc(ln(e, Yt)) + " " + a.zOrigin + "px") : (a = e.style[n], (!a || a === "auto" || s || ~(a + "").indexOf("calc(")) && (a = Cc[n] && Cc[n](e, n, r) || ln(e, n) || C1(e, n) || (n === "opacity" ? 1 : 0))), r && !~(a + "").trim().indexOf(" ") ? hi(e, n, a, r) + r : a;
}, pI = function(e, n, r, s) {
  if (!r || r === "none") {
    var a = po(n, e, 1), l = a && ln(e, a, 1);
    l && l !== r ? (n = a, r = l) : n === "borderColor" && (r = ln(e, "borderTopColor"));
  }
  var c = new Qt(this._pt, e.style, n, 0, 1, q1), d = 0, m = 0, y, f, p, g, S, _, x, T, E, A, b, M;
  if (c.b = r, c.e = s, r += "", s += "", s.substring(0, 6) === "var(--" && (s = ln(e, s.substring(4, s.indexOf(")")))), s === "auto" && (_ = e.style[n], e.style[n] = s, s = ln(e, n) || s, _ ? e.style[n] = _ : di(e, n)), y = [r, s], $1(y), r = y[0], s = y[1], p = r.match(zs) || [], M = s.match(zs) || [], M.length) {
    for (; f = zs.exec(s); )
      x = f[0], E = s.substring(d, f.index), S ? S = (S + 1) % 5 : (E.substr(-5) === "rgba(" || E.substr(-5) === "hsla(") && (S = 1), x !== (_ = p[m++] || "") && (g = parseFloat(_) || 0, b = _.substr((g + "").length), x.charAt(1) === "=" && (x = $s(g, x) + b), T = parseFloat(x), A = x.substr((T + "").length), d = zs.lastIndex - A.length, A || (A = A || un.units[n] || b, d === s.length && (s += A, c.e += A)), b !== A && (g = hi(e, n, _, A) || 0), c._pt = {
        _next: c._pt,
        p: E || m === 1 ? E : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: g,
        c: T - g,
        m: S && S < 4 || n === "zIndex" ? Math.round : 0
      });
    c.c = d < s.length ? s.substring(d, s.length) : "";
  } else
    c.r = n === "display" && s === "none" ? tT : eT;
  return _1.test(s) && (c.e = 0), this._pt = c, c;
}, aw = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, mI = function(e) {
  var n = e.split(" "), r = n[0], s = n[1] || "50%";
  return (r === "top" || r === "bottom" || s === "left" || s === "right") && (e = r, r = s, s = e), n[0] = aw[r] || r, n[1] = aw[s] || s, n.join(" ");
}, yI = function(e, n) {
  if (n.tween && n.tween._time === n.tween._dur) {
    var r = n.t, s = r.style, a = n.u, l = r._gsap, c, d, m;
    if (a === "all" || a === !0)
      s.cssText = "", d = 1;
    else
      for (a = a.split(","), m = a.length; --m > -1; )
        c = a[m], Tr[c] && (d = 1, c = c === "transformOrigin" ? Yt : Ke), di(r, c);
    d && (di(r, Ke), l && (l.svg && r.removeAttribute("transform"), s.scale = s.rotate = s.translate = "none", Ua(r, 1), l.uncache = 1, nT(s)));
  }
}, Cc = {
  clearProps: function(e, n, r, s, a) {
    if (a.data !== "isFromStart") {
      var l = e._pt = new Qt(e._pt, n, r, 0, 0, yI);
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
}, za = [1, 0, 0, 1, 0, 0], aT = {}, lT = function(e) {
  return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, lw = function(e) {
  var n = ln(e, Ke);
  return lT(n) ? za : n.substr(7).match(v1).map(et);
}, Jm = function(e, n) {
  var r = e._gsap || es(e), s = e.style, a = lw(e), l, c, d, m;
  return r.svg && e.getAttribute("transform") ? (d = e.transform.baseVal.consolidate().matrix, a = [d.a, d.b, d.c, d.d, d.e, d.f], a.join(",") === "1,0,0,1,0,0" ? za : a) : (a === za && !e.offsetParent && e !== Hs && !r.svg && (d = s.display, s.display = "block", l = e.parentNode, (!l || !e.offsetParent && !e.getBoundingClientRect().width) && (m = 1, c = e.nextElementSibling, Hs.appendChild(e)), a = lw(e), d ? s.display = d : di(e, "display"), m && (c ? l.insertBefore(e, c) : l ? l.appendChild(e) : Hs.removeChild(e))), n && a.length > 6 ? [a[0], a[1], a[4], a[5], a[12], a[13]] : a);
}, _p = function(e, n, r, s, a, l) {
  var c = e._gsap, d = a || Jm(e, !0), m = c.xOrigin || 0, y = c.yOrigin || 0, f = c.xOffset || 0, p = c.yOffset || 0, g = d[0], S = d[1], _ = d[2], x = d[3], T = d[4], E = d[5], A = n.split(" "), b = parseFloat(A[0]) || 0, M = parseFloat(A[1]) || 0, B, I, O, L;
  r ? d !== za && (I = g * x - S * _) && (O = b * (x / I) + M * (-_ / I) + (_ * E - x * T) / I, L = b * (-S / I) + M * (g / I) - (g * E - S * T) / I, b = O, M = L) : (B = sT(e), b = B.x + (~A[0].indexOf("%") ? b / 100 * B.width : b), M = B.y + (~(A[1] || A[0]).indexOf("%") ? M / 100 * B.height : M)), s || s !== !1 && c.smooth ? (T = b - m, E = M - y, c.xOffset = f + (T * g + E * _) - T, c.yOffset = p + (T * S + E * x) - E) : c.xOffset = c.yOffset = 0, c.xOrigin = b, c.yOrigin = M, c.smooth = !!s, c.origin = n, c.originIsAbsolute = !!r, e.style[Yt] = "0px 0px", l && (si(l, c, "xOrigin", m, b), si(l, c, "yOrigin", y, M), si(l, c, "xOffset", f, c.xOffset), si(l, c, "yOffset", p, c.yOffset)), e.setAttribute("data-svg-origin", b + " " + M);
}, Ua = function(e, n) {
  var r = e._gsap || new W1(e);
  if ("x" in r && !n && !r.uncache)
    return r;
  var s = e.style, a = r.scaleX < 0, l = "px", c = "deg", d = getComputedStyle(e), m = ln(e, Yt) || "0", y, f, p, g, S, _, x, T, E, A, b, M, B, I, O, L, $, q, J, ie, re, ue, fe, me, W, ee, Z, j, H, ve, ye, we;
  return y = f = p = _ = x = T = E = A = b = 0, g = S = 1, r.svg = !!(e.getCTM && oT(e)), d.translate && ((d.translate !== "none" || d.scale !== "none" || d.rotate !== "none") && (s[Ke] = (d.translate !== "none" ? "translate3d(" + (d.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (d.rotate !== "none" ? "rotate(" + d.rotate + ") " : "") + (d.scale !== "none" ? "scale(" + d.scale.split(" ").join(",") + ") " : "") + (d[Ke] !== "none" ? d[Ke] : "")), s.scale = s.rotate = s.translate = "none"), I = Jm(e, r.svg), r.svg && (r.uncache ? (W = e.getBBox(), m = r.xOrigin - W.x + "px " + (r.yOrigin - W.y) + "px", me = "") : me = !n && e.getAttribute("data-svg-origin"), _p(e, me || m, !!me || r.originIsAbsolute, r.smooth !== !1, I)), M = r.xOrigin || 0, B = r.yOrigin || 0, I !== za && (q = I[0], J = I[1], ie = I[2], re = I[3], y = ue = I[4], f = fe = I[5], I.length === 6 ? (g = Math.sqrt(q * q + J * J), S = Math.sqrt(re * re + ie * ie), _ = q || J ? Ds(J, q) * Ni : 0, E = ie || re ? Ds(ie, re) * Ni + _ : 0, E && (S *= Math.abs(Math.cos(E * Ws))), r.svg && (y -= M - (M * q + B * ie), f -= B - (M * J + B * re))) : (we = I[6], ve = I[7], Z = I[8], j = I[9], H = I[10], ye = I[11], y = I[12], f = I[13], p = I[14], O = Ds(we, H), x = O * Ni, O && (L = Math.cos(-O), $ = Math.sin(-O), me = ue * L + Z * $, W = fe * L + j * $, ee = we * L + H * $, Z = ue * -$ + Z * L, j = fe * -$ + j * L, H = we * -$ + H * L, ye = ve * -$ + ye * L, ue = me, fe = W, we = ee), O = Ds(-ie, H), T = O * Ni, O && (L = Math.cos(-O), $ = Math.sin(-O), me = q * L - Z * $, W = J * L - j * $, ee = ie * L - H * $, ye = re * $ + ye * L, q = me, J = W, ie = ee), O = Ds(J, q), _ = O * Ni, O && (L = Math.cos(O), $ = Math.sin(O), me = q * L + J * $, W = ue * L + fe * $, J = J * L - q * $, fe = fe * L - ue * $, q = me, ue = W), x && Math.abs(x) + Math.abs(_) > 359.9 && (x = _ = 0, T = 180 - T), g = et(Math.sqrt(q * q + J * J + ie * ie)), S = et(Math.sqrt(fe * fe + we * we)), O = Ds(ue, fe), E = Math.abs(O) > 2e-4 ? O * Ni : 0, b = ye ? 1 / (ye < 0 ? -ye : ye) : 0), r.svg && (me = e.getAttribute("transform"), r.forceCSS = e.setAttribute("transform", "") || !lT(ln(e, Ke)), me && e.setAttribute("transform", me))), Math.abs(E) > 90 && Math.abs(E) < 270 && (a ? (g *= -1, E += _ <= 0 ? 180 : -180, _ += _ <= 0 ? 180 : -180) : (S *= -1, E += E <= 0 ? 180 : -180)), n = n || r.uncache, r.x = y - ((r.xPercent = y && (!n && r.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-y) ? -50 : 0))) ? e.offsetWidth * r.xPercent / 100 : 0) + l, r.y = f - ((r.yPercent = f && (!n && r.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-f) ? -50 : 0))) ? e.offsetHeight * r.yPercent / 100 : 0) + l, r.z = p + l, r.scaleX = et(g), r.scaleY = et(S), r.rotation = et(_) + c, r.rotationX = et(x) + c, r.rotationY = et(T) + c, r.skewX = E + c, r.skewY = A + c, r.transformPerspective = b + l, (r.zOrigin = parseFloat(m.split(" ")[2]) || !n && r.zOrigin || 0) && (s[Yt] = kc(m)), r.xOffset = r.yOffset = 0, r.force3D = un.force3D, r.renderTransform = r.svg ? vI : iT ? uT : gI, r.uncache = 0, r;
}, kc = function(e) {
  return (e = e.split(" "))[0] + " " + e[1];
}, Ch = function(e, n, r) {
  var s = Et(n);
  return et(parseFloat(n) + parseFloat(hi(e, "x", r + "px", s))) + s;
}, gI = function(e, n) {
  n.z = "0px", n.rotationY = n.rotationX = "0deg", n.force3D = 0, uT(e, n);
}, Mi = "0deg", pa = "0px", Di = ") ", uT = function(e, n) {
  var r = n || this, s = r.xPercent, a = r.yPercent, l = r.x, c = r.y, d = r.z, m = r.rotation, y = r.rotationY, f = r.rotationX, p = r.skewX, g = r.skewY, S = r.scaleX, _ = r.scaleY, x = r.transformPerspective, T = r.force3D, E = r.target, A = r.zOrigin, b = "", M = T === "auto" && e && e !== 1 || T === !0;
  if (A && (f !== Mi || y !== Mi)) {
    var B = parseFloat(y) * Ws, I = Math.sin(B), O = Math.cos(B), L;
    B = parseFloat(f) * Ws, L = Math.cos(B), l = Ch(E, l, I * L * -A), c = Ch(E, c, -Math.sin(B) * -A), d = Ch(E, d, O * L * -A + A);
  }
  x !== pa && (b += "perspective(" + x + Di), (s || a) && (b += "translate(" + s + "%, " + a + "%) "), (M || l !== pa || c !== pa || d !== pa) && (b += d !== pa || M ? "translate3d(" + l + ", " + c + ", " + d + ") " : "translate(" + l + ", " + c + Di), m !== Mi && (b += "rotate(" + m + Di), y !== Mi && (b += "rotateY(" + y + Di), f !== Mi && (b += "rotateX(" + f + Di), (p !== Mi || g !== Mi) && (b += "skew(" + p + ", " + g + Di), (S !== 1 || _ !== 1) && (b += "scale(" + S + ", " + _ + Di), E.style[Ke] = b || "translate(0, 0)";
}, vI = function(e, n) {
  var r = n || this, s = r.xPercent, a = r.yPercent, l = r.x, c = r.y, d = r.rotation, m = r.skewX, y = r.skewY, f = r.scaleX, p = r.scaleY, g = r.target, S = r.xOrigin, _ = r.yOrigin, x = r.xOffset, T = r.yOffset, E = r.forceCSS, A = parseFloat(l), b = parseFloat(c), M, B, I, O, L;
  d = parseFloat(d), m = parseFloat(m), y = parseFloat(y), y && (y = parseFloat(y), m += y, d += y), d || m ? (d *= Ws, m *= Ws, M = Math.cos(d) * f, B = Math.sin(d) * f, I = Math.sin(d - m) * -p, O = Math.cos(d - m) * p, m && (y *= Ws, L = Math.tan(m - y), L = Math.sqrt(1 + L * L), I *= L, O *= L, y && (L = Math.tan(y), L = Math.sqrt(1 + L * L), M *= L, B *= L)), M = et(M), B = et(B), I = et(I), O = et(O)) : (M = f, O = p, B = I = 0), (A && !~(l + "").indexOf("px") || b && !~(c + "").indexOf("px")) && (A = hi(g, "x", l, "px"), b = hi(g, "y", c, "px")), (S || _ || x || T) && (A = et(A + S - (S * M + _ * I) + x), b = et(b + _ - (S * B + _ * O) + T)), (s || a) && (L = g.getBBox(), A = et(A + s / 100 * L.width), b = et(b + a / 100 * L.height)), L = "matrix(" + M + "," + B + "," + I + "," + O + "," + A + "," + b + ")", g.setAttribute("transform", L), E && (g.style[Ke] = L);
}, _I = function(e, n, r, s, a) {
  var l = 360, c = pt(a), d = parseFloat(a) * (c && ~a.indexOf("rad") ? Ni : 1), m = d - s, y = s + m + "deg", f, p;
  return c && (f = a.split("_")[1], f === "short" && (m %= l, m !== m % (l / 2) && (m += m < 0 ? l : -l)), f === "cw" && m < 0 ? m = (m + l * nw) % l - ~~(m / l) * l : f === "ccw" && m > 0 && (m = (m - l * nw) % l - ~~(m / l) * l)), e._pt = p = new Qt(e._pt, n, r, s, m, tI), p.e = y, p.u = "deg", e._props.push(r), p;
}, uw = function(e, n) {
  for (var r in n)
    e[r] = n[r];
  return e;
}, wI = function(e, n, r) {
  var s = uw({}, r._gsap), a = "perspective,force3D,transformOrigin,svgOrigin", l = r.style, c, d, m, y, f, p, g, S;
  s.svg ? (m = r.getAttribute("transform"), r.setAttribute("transform", ""), l[Ke] = n, c = Ua(r, 1), di(r, Ke), r.setAttribute("transform", m)) : (m = getComputedStyle(r)[Ke], l[Ke] = n, c = Ua(r, 1), l[Ke] = m);
  for (d in Tr)
    m = s[d], y = c[d], m !== y && a.indexOf(d) < 0 && (g = Et(m), S = Et(y), f = g !== S ? hi(r, d, m, S) : parseFloat(m), p = parseFloat(y), e._pt = new Qt(e._pt, c, d, f, p - f, yp), e._pt.u = S || 0, e._props.push(d));
  uw(c, s);
};
Kt("padding,margin,Width,Radius", function(t, e) {
  var n = "Top", r = "Right", s = "Bottom", a = "Left", l = (e < 3 ? [n, r, s, a] : [n + a, n + r, s + r, s + a]).map(function(c) {
    return e < 2 ? t + c : "border" + c + t;
  });
  Cc[e > 1 ? "border" + t : t] = function(c, d, m, y, f) {
    var p, g;
    if (arguments.length < 4)
      return p = l.map(function(S) {
        return yr(c, S, m);
      }), g = p.join(" "), g.split(p[0]).length === 5 ? p[0] : g;
    p = (y + "").split(" "), g = {}, l.forEach(function(S, _) {
      return g[S] = p[_] = p[_] || p[(_ - 1) / 2 | 0];
    }), c.init(d, g, f);
  };
});
var cT = {
  name: "css",
  register: vp,
  targetTest: function(e) {
    return e.style && e.nodeType;
  },
  init: function(e, n, r, s, a) {
    var l = this._props, c = e.style, d = r.vars.startAt, m, y, f, p, g, S, _, x, T, E, A, b, M, B, I, O, L;
    Xm || vp(), this.styles = this.styles || rT(e), O = this.styles.props, this.tween = r;
    for (_ in n)
      if (_ !== "autoRound" && (y = n[_], !(rn[_] && G1(_, n, r, s, e, a)))) {
        if (g = typeof y, S = Cc[_], g === "function" && (y = y.call(r, s, e, a), g = typeof y), g === "string" && ~y.indexOf("random(") && (y = ja(y)), S)
          S(this, e, _, y, r) && (I = 1);
        else if (_.substr(0, 2) === "--")
          m = (getComputedStyle(e).getPropertyValue(_) + "").trim(), y += "", ai.lastIndex = 0, ai.test(m) || (x = Et(m), T = Et(y), T ? x !== T && (m = hi(e, _, m, T) + T) : x && (y += x)), this.add(c, "setProperty", m, y, s, a, 0, 0, _), l.push(_), O.push(_, 0, c[_]);
        else if (g !== "undefined") {
          if (d && _ in d ? (m = typeof d[_] == "function" ? d[_].call(r, s, e, a) : d[_], pt(m) && ~m.indexOf("random(") && (m = ja(m)), Et(m + "") || m === "auto" || (m += un.units[_] || Et(yr(e, _)) || ""), (m + "").charAt(1) === "=" && (m = yr(e, _))) : m = yr(e, _), p = parseFloat(m), E = g === "string" && y.charAt(1) === "=" && y.substr(0, 2), E && (y = y.substr(2)), f = parseFloat(y), _ in tr && (_ === "autoAlpha" && (p === 1 && yr(e, "visibility") === "hidden" && f && (p = 0), O.push("visibility", 0, c.visibility), si(this, c, "visibility", p ? "inherit" : "hidden", f ? "inherit" : "hidden", !f)), _ !== "scale" && _ !== "transform" && (_ = tr[_], ~_.indexOf(",") && (_ = _.split(",")[0]))), A = _ in Tr, A) {
            if (this.styles.save(_), L = y, g === "string" && y.substring(0, 6) === "var(--") {
              if (y = ln(e, y.substring(4, y.indexOf(")"))), y.substring(0, 5) === "calc(") {
                var $ = e.style.perspective;
                e.style.perspective = y, y = ln(e, "perspective"), $ ? e.style.perspective = $ : di(e, "perspective");
              }
              f = parseFloat(y);
            }
            if (b || (M = e._gsap, M.renderTransform && !n.parseTransform || Ua(e, n.parseTransform), B = n.smoothOrigin !== !1 && M.smooth, b = this._pt = new Qt(this._pt, c, Ke, 0, 1, M.renderTransform, M, 0, -1), b.dep = 1), _ === "scale")
              this._pt = new Qt(this._pt, M, "scaleY", M.scaleY, (E ? $s(M.scaleY, E + f) : f) - M.scaleY || 0, yp), this._pt.u = 0, l.push("scaleY", _), _ += "X";
            else if (_ === "transformOrigin") {
              O.push(Yt, 0, c[Yt]), y = mI(y), M.svg ? _p(e, y, 0, B, 0, this) : (T = parseFloat(y.split(" ")[2]) || 0, T !== M.zOrigin && si(this, M, "zOrigin", M.zOrigin, T), si(this, c, _, kc(m), kc(y)));
              continue;
            } else if (_ === "svgOrigin") {
              _p(e, y, 1, B, 0, this);
              continue;
            } else if (_ in aT) {
              _I(this, M, _, p, E ? $s(p, E + y) : y);
              continue;
            } else if (_ === "smoothOrigin") {
              si(this, M, "smooth", M.smooth, y);
              continue;
            } else if (_ === "force3D") {
              M[_] = y;
              continue;
            } else if (_ === "transform") {
              wI(this, y, e);
              continue;
            }
          } else _ in c || (_ = po(_) || _);
          if (A || (f || f === 0) && (p || p === 0) && !eI.test(y) && _ in c)
            x = (m + "").substr((p + "").length), f || (f = 0), T = Et(y) || (_ in un.units ? un.units[_] : x), x !== T && (p = hi(e, _, m, T)), this._pt = new Qt(this._pt, A ? M : c, _, p, (E ? $s(p, E + f) : f) - p, !A && (T === "px" || _ === "zIndex") && n.autoRound !== !1 ? iI : yp), this._pt.u = T || 0, A && L !== y ? (this._pt.b = m, this._pt.e = L, this._pt.r = rI) : x !== T && T !== "%" && (this._pt.b = m, this._pt.r = nI);
          else if (_ in c)
            pI.call(this, e, _, m, E ? E + y : y);
          else if (_ in e)
            this.add(e, _, m || e[_], E ? E + y : y, s, a);
          else if (_ !== "parseTransform") {
            Bm(_, y);
            continue;
          }
          A || (_ in c ? O.push(_, 0, c[_]) : typeof e[_] == "function" ? O.push(_, 2, e[_]()) : O.push(_, 1, m || e[_])), l.push(_);
        }
      }
    I && Z1(this);
  },
  render: function(e, n) {
    if (n.tween._time || !qm())
      for (var r = n._pt; r; )
        r.r(e, r.d), r = r._next;
    else
      n.styles.revert();
  },
  get: yr,
  aliases: tr,
  getSetter: function(e, n, r) {
    var s = tr[n];
    return s && s.indexOf(",") < 0 && (n = s), n in Tr && n !== Yt && (e._gsap.x || yr(e, "x")) ? r && tw === r ? n === "scale" ? lI : aI : (tw = r || {}) && (n === "scale" ? uI : cI) : e.style && !Lm(e.style[n]) ? sI : ~n.indexOf("-") ? oI : Qm(e, n);
  },
  core: {
    _removeProperty: di,
    _getMatrix: Jm
  }
};
Xt.utils.checkPrefix = po;
Xt.core.getStyleSaver = rT;
(function(t, e, n, r) {
  var s = Kt(t + "," + e + "," + n, function(a) {
    Tr[a] = 1;
  });
  Kt(e, function(a) {
    un.units[a] = "deg", aT[a] = 1;
  }), tr[s[13]] = t + "," + e, Kt(r, function(a) {
    var l = a.split(":");
    tr[l[1]] = s[l[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
Kt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(t) {
  un.units[t] = "px";
});
Xt.registerPlugin(cT);
var fT = Xt.registerPlugin(cT) || Xt;
fT.core.Tween;
function SI({ scene: t }) {
  return k.useEffect(() => {
    const e = fT.to(".focus-background", {
      scale: 1.055,
      xPercent: 0.6,
      yPercent: 0.4,
      duration: 18,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: !0
    });
    return () => e.kill();
  }, [t == null ? void 0 : t.id]), /* @__PURE__ */ C.jsxs("div", { className: "focus-background-wrap", "aria-hidden": "true", children: [
    /* @__PURE__ */ C.jsx(mi, { mode: "wait", children: /* @__PURE__ */ C.jsx(
      Ot.div,
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
    /* @__PURE__ */ C.jsx("div", { className: "focus-overlay" })
  ] });
}
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xI = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), TI = (t) => t.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (e, n, r) => r ? r.toUpperCase() : n.toLowerCase()
), cw = (t) => {
  const e = TI(t);
  return e.charAt(0).toUpperCase() + e.slice(1);
}, dT = (...t) => t.filter((e, n, r) => !!e && e.trim() !== "" && r.indexOf(e) === n).join(" ").trim(), CI = (t) => {
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
var kI = {
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
const PI = k.forwardRef(
  ({
    color: t = "currentColor",
    size: e = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: a,
    iconNode: l,
    ...c
  }, d) => k.createElement(
    "svg",
    {
      ref: d,
      ...kI,
      width: e,
      height: e,
      stroke: t,
      strokeWidth: r ? Number(n) * 24 / Number(e) : n,
      className: dT("lucide", s),
      ...!a && !CI(c) && { "aria-hidden": "true" },
      ...c
    },
    [
      ...l.map(([m, y]) => k.createElement(m, y)),
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
const St = (t, e) => {
  const n = k.forwardRef(
    ({ className: r, ...s }, a) => k.createElement(PI, {
      ref: a,
      iconNode: e,
      className: dT(
        `lucide-${xI(cw(t))}`,
        `lucide-${t}`,
        r
      ),
      ...s
    })
  );
  return n.displayName = cw(t), n;
};
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const EI = [
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
], AI = St("brain", EI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const bI = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
], RI = St("clock", bI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MI = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
], DI = St("history", MI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FI = [
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
], OI = St("layers", FI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const II = [
  ["path", { d: "m16 6 4 14", key: "ji33uf" }],
  ["path", { d: "M12 6v14", key: "1n7gus" }],
  ["path", { d: "M8 8v12", key: "1gg7y9" }],
  ["path", { d: "M4 4v16", key: "6qkkli" }]
], NI = St("library", II);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const LI = [
  ["circle", { cx: "8", cy: "18", r: "4", key: "1fc0mg" }],
  ["path", { d: "M12 18V2l7 4", key: "g04rme" }]
], jI = St("music-2", LI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const VI = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M15 3v18", key: "14nvp0" }],
  ["path", { d: "m10 15-3-3 3-3", key: "1pgupc" }]
], BI = St("panel-right-open", VI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zI = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
], fw = St("pause", zI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UI = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]], hT = St("play", UI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $I = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
], pT = St("rotate-ccw", $I);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const HI = [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
], mT = St("skip-forward", HI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const WI = [
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
], GI = St("sparkles", WI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const KI = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
], yT = St("square", KI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const QI = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
], YI = St("target", QI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const XI = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
], qI = St("volume-2", XI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ZI = [
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
], JI = St("waves", ZI);
/**
 * @license lucide-react v0.515.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const eN = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], al = St("x", eN), gT = "synapse.focusRoom.sessions.v1", vT = "synapse.focusRoom.draft.v1", wp = 40;
let Sp = [];
const Li = (t) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(t)}`, xp = [
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
    streamUrl: Li("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
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
], dt = {
  nature: {
    id: "nature-forest",
    title: "Forest ambience",
    artist: "nille",
    streamUrl: Li("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: Li("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: Li("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: Li("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: Li("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: Li("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
}, Tp = [
  {
    label: "Nature",
    layers: [dt.nature],
    pageUrl: dt.nature.pageUrl,
    license: dt.nature.license
  },
  {
    label: "Cafe Rain",
    layers: [dt.cafe, dt.rain],
    pageUrl: dt.cafe.pageUrl,
    license: "CC0 / Public domain"
  },
  {
    label: "Rain",
    layers: [dt.rain],
    pageUrl: dt.rain.pageUrl,
    license: dt.rain.license
  },
  {
    label: "White Noise",
    layers: [dt.whiteNoise],
    pageUrl: dt.whiteNoise.pageUrl,
    license: dt.whiteNoise.license
  },
  {
    label: "Ocean",
    layers: [dt.ocean],
    pageUrl: dt.ocean.pageUrl,
    license: dt.ocean.license
  },
  {
    label: "Wind",
    layers: [dt.wind],
    pageUrl: dt.wind.pageUrl,
    license: dt.wind.license
  }
], ll = [
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
], _T = [25, 45, 50, 90];
function tN(t = "") {
  const e = String(t || "");
  return xp.find((n) => n.label === e) || xp[0];
}
function nN(t = "") {
  const e = String(t || "");
  return Tp.find((n) => n.label === e) || Tp[0];
}
function $c(t = {}) {
  const e = tN(t == null ? void 0 : t.musicType), n = nN(t == null ? void 0 : t.ambientSound);
  return {
    musicTrack: e,
    ambientSound: n,
    ambientLayers: n.layers.map((r) => ({
      ...r,
      volumeBias: ji(r.volumeBias, 1)
    }))
  };
}
function wT(t, e) {
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
function ST(t, e) {
  var n;
  try {
    return (n = globalThis.localStorage) == null || n.setItem(t, JSON.stringify(e)), !0;
  } catch (r) {
    return console.warn(`Could not write ${t}:`, r), !1;
  }
}
function rN(t) {
  return String(t || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function iN(t) {
  const e = String(t || "").split(/\n+/).map((n) => n.replace(/^#+\s*/, "").trim()).find((n) => n.length > 4);
  return e ? e.slice(0, 72) : "Generated Study Notes";
}
function sN(t) {
  const e = t != null && t.sections && typeof t.sections == "object" ? Object.keys(t.sections).filter(Boolean) : [];
  return e.length ? e.slice(0, 8) : String((t == null ? void 0 : t.summary) || (t == null ? void 0 : t.aiSummary) || "").split(`
`).map((n) => {
    var r, s;
    return (s = (r = n.match(/^#{1,4}\s+(.+)$/)) == null ? void 0 : r[1]) == null ? void 0 : s.trim();
  }).filter(Boolean).slice(0, 8);
}
function xT(t = {}) {
  (!t || typeof t != "object") && (t = {});
  const e = String(t.materialId || t.id || t.historyId || t.sourceFingerprint || "current-material"), n = String(t.aiSummary || t.summary || t.fullSummary || ""), r = String(t.materialTitle || t.title || iN(n)), s = String(t.sourceFingerprint || t.clientFingerprint || "");
  return {
    materialId: e,
    materialTitle: r,
    materialType: t.materialType || t.type || "Generated notes",
    uploadedContent: t.uploadedContent || t.sourceText || "",
    aiSummary: n,
    summaryText: rN(n),
    sections: t.sections || {},
    studyHeadings: sN(t),
    flashcards: Array.isArray(t.flashcards) ? t.flashcards : [],
    quizzes: Array.isArray(t.quizzes) ? t.quizzes : [],
    mindMap: t.mindMap || t.mind_map || null,
    studyPlan: Array.isArray(t.studyPlan) ? t.studyPlan : [],
    progressHistory: Array.isArray(t.progressHistory) ? t.progressHistory : [],
    sourceFingerprint: s,
    createdAt: t.createdAt || "",
    updatedAt: t.updatedAt || ""
  };
}
function oN() {
  if (typeof globalThis.getSynapseFocusRoomMaterials == "function") {
    const t = globalThis.getSynapseFocusRoomMaterials();
    return Array.isArray(t) ? t.map(xT) : [];
  }
  return [];
}
function aN() {
  if (typeof globalThis.getSynapseFocusRoomCurrentMaterial == "function") {
    const t = globalThis.getSynapseFocusRoomCurrentMaterial();
    return t ? xT(t) : null;
  }
  return null;
}
function Hc() {
  const t = oN(), e = aN();
  return e && e.aiSummary && !t.some((n) => n.materialId === e.materialId) ? [e, ...t] : t;
}
function Cp(t) {
  const e = String(t || ""), n = Hc();
  return n.find((r) => r.materialId === e) || n[0] || null;
}
function lN({ material: t, goal: e, durationMinutes: n }) {
  var y;
  const r = Math.max(10, Number(n) || 25), s = (y = t == null ? void 0 : t.studyHeadings) != null && y.length ? t.studyHeadings : ["Key ideas", "Examples", "Practice", "Review"], a = String(e || "").trim() || `Study ${(t == null ? void 0 : t.materialTitle) || "this material"}`, l = Math.max(1, Math.floor(r * 0.2)), c = Math.max(1, Math.floor(r * 0.4)), d = Math.max(1, Math.floor(r * 0.2)), m = Math.max(1, r - l - c - d);
  return [
    { minutes: l, task: `Set the goal: ${a}` },
    { minutes: c, task: `Review ${s[0] || "the core ideas"}` },
    { minutes: d, task: `Practice with ${s[1] || s[0] || "the generated examples"}` },
    { minutes: m, task: "Summarize mistakes and choose the next study step" }
  ];
}
function TT() {
  return wT(vT, null);
}
function uN(t) {
  return ST(vT, t || null);
}
function Pc() {
  const t = wT(gT, []), e = Array.isArray(t) ? t : [], n = /* @__PURE__ */ new Set();
  return [...Sp, ...e].filter((r) => {
    const s = String((r == null ? void 0 : r.sessionId) || "");
    return !s || n.has(s) ? !1 : (n.add(s), !0);
  }).slice(0, wp);
}
function ji(t, e) {
  const n = Number(t);
  return Number.isFinite(n) ? n : e;
}
function cN(t = {}) {
  const e = (/* @__PURE__ */ new Date()).toISOString(), r = { ...{
    sessionId: t.sessionId || `focus-${Date.now()}`,
    materialId: String(t.materialId || ""),
    materialTitle: t.materialTitle || "Study material",
    studyGoal: t.studyGoal || "",
    selectedScene: t.selectedScene || "morning-window",
    musicType: t.musicType || "Deep Focus",
    ambientSound: t.ambientSound || "Nature",
    musicVolume: ji(t.musicVolume ?? 60, 60),
    ambientVolume: ji(t.ambientVolume ?? 50, 50),
    pomodoroDuration: ji(t.pomodoroDuration || 25, 25),
    startedAt: t.startedAt || e,
    endedAt: t.endedAt || e,
    totalFocusTime: Math.max(0, ji(t.totalFocusTime || 0, 0)),
    flashcardsCompleted: Math.max(0, ji(t.flashcardsCompleted || 0, 0)),
    quizScore: t.quizScore === null || t.quizScore === void 0 || t.quizScore === "" ? null : Number.isFinite(Number(t.quizScore)) ? Number(t.quizScore) : null,
    mistakesMade: Array.isArray(t.mistakesMade) ? t.mistakesMade : [],
    completedTasks: Array.isArray(t.completedTasks) ? t.completedTasks : [],
    aiReflection: t.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: t.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: t.sessionDate || e
  }, persisted: !0 }, s = Pc().filter((d) => d.sessionId !== r.sessionId), a = [r, ...s.map((d) => ({ ...d, persisted: !0 }))].slice(0, wp), l = ST(gT, a), c = { ...r, persisted: l };
  return l ? Sp = [] : Sp = [c, ...s].slice(0, wp), c;
}
function Wc(t) {
  const e = Math.max(0, ji(t || 0, 0)), n = Math.floor(e / 3600), r = Math.floor(e % 3600 / 60);
  return n ? `${n}h ${r}m` : `${r}m`;
}
const dw = (t) => {
  let e;
  const n = /* @__PURE__ */ new Set(), r = (m, y) => {
    const f = typeof m == "function" ? m(e) : m;
    if (!Object.is(f, e)) {
      const p = e;
      e = y ?? (typeof f != "object" || f === null) ? f : Object.assign({}, e, f), n.forEach((g) => g(e, p));
    }
  }, s = () => e, c = { setState: r, getState: s, getInitialState: () => d, subscribe: (m) => (n.add(m), () => n.delete(m)) }, d = e = t(r, s, c);
  return c;
}, fN = ((t) => t ? dw(t) : dw), dN = (t) => t;
function hN(t, e = dN) {
  const n = Zn.useSyncExternalStore(
    t.subscribe,
    Zn.useCallback(() => e(t.getState()), [t, e]),
    Zn.useCallback(() => e(t.getInitialState()), [t, e])
  );
  return Zn.useDebugValue(n), n;
}
const hw = (t) => {
  const e = fN(t), n = (r) => hN(e, r);
  return Object.assign(n, e), n;
}, pN = ((t) => t ? hw(t) : hw);
var Xw;
const kp = ((Xw = ll[0]) == null ? void 0 : Xw.id) || "morning-window", ey = _T[0] || 25, mN = 10, ty = 180, yN = 0, gN = 100, Pp = ["materials", "summary", "flashcards", "quiz", "mindmap", "chat", "plan"], vN = new Set(Pp), _r = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};
function _N(t, e, n, r) {
  const s = Number(t);
  return Number.isFinite(s) ? Math.min(r, Math.max(n, s)) : e;
}
function Gs(t, e, n, r) {
  return Math.round(_N(t, e, n, r));
}
function mo(t, e = 50) {
  return Gs(t, e, yN, gN);
}
function Gc(t, e = ey) {
  return Gs(t, e, mN, ty);
}
function ny(t) {
  return ll.find((e) => e.id === t) || null;
}
function $a(t = kp) {
  return ny(t) || ll[0] || {
    id: kp,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}
function wN(t = "/focus-room") {
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
function CT(t) {
  return Array.isArray(t) ? t.map((e) => ({
    minutes: Gs(e == null ? void 0 : e.minutes, 5, 1, ty),
    task: String((e == null ? void 0 : e.task) || "").trim()
  })).filter((e) => e.task) : [];
}
function Ou(t) {
  return Array.isArray(t) ? t.map((e) => ({
    role: String((e == null ? void 0 : e.role) || "assistant") === "user" ? "user" : "assistant",
    text: String((e == null ? void 0 : e.text) || "").trim(),
    createdAt: (e == null ? void 0 : e.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
  })).filter((e) => e.text).slice(-24) : [];
}
function kT(t) {
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
function Ep(t, e, n) {
  return t ? lN({
    material: t,
    goal: e,
    durationMinutes: n
  }) : [];
}
function va(t) {
  const e = Gc(t);
  return e > 0 ? e * 60 : 0;
}
function SN(t, e) {
  const n = va(e);
  return n ? Math.min(100, Math.max(0, t / n * 100)) : 0;
}
function xN(t) {
  const e = Math.max(0, Math.floor(Number(t) || 0)), n = Math.floor(e / 3600), r = Math.floor(e % 3600 / 60), s = e % 60, a = (l) => String(l).padStart(2, "0");
  return n ? `${n}:${a(r)}:${a(s)}` : `${a(r)}:${a(s)}`;
}
function TN(t) {
  return t === "mindmap" ? "Mind Map" : t === "chat" ? "AI Chat" : t === "plan" ? "Study Plan" : String(t || "").replace(/^\w/, (e) => e.toUpperCase());
}
function Ap(t) {
  const e = (t == null ? void 0 : t.flashcards) || [];
  return Array.isArray(e) ? e.slice(0, 24) : [];
}
function CN(t, e) {
  return (t == null ? void 0 : t.prompt) || (t == null ? void 0 : t.front) || (t == null ? void 0 : t.question) || (t == null ? void 0 : t.term) || `Flashcard ${e + 1}`;
}
function kN(t) {
  return (t == null ? void 0 : t.answer) || (t == null ? void 0 : t.back) || (t == null ? void 0 : t.definition) || (t == null ? void 0 : t.explanation) || "Return to the workspace for the saved answer.";
}
function PT(t, e) {
  return String((t == null ? void 0 : t.id) || (t == null ? void 0 : t.front) || (t == null ? void 0 : t.term) || e);
}
function PN(t) {
  var e;
  return Array.isArray(t == null ? void 0 : t.questions) ? t.questions : Array.isArray((e = t == null ? void 0 : t.quiz) == null ? void 0 : e.questions) ? t.quiz.questions : [];
}
function Ec(t) {
  return (Array.isArray(t == null ? void 0 : t.quizzes) ? t.quizzes : []).flatMap((n) => PN(n).map((r) => {
    var s;
    return {
      ...r,
      quizTitle: (n == null ? void 0 : n.title) || ((s = n == null ? void 0 : n.quiz) == null ? void 0 : s.title) || "Saved quiz"
    };
  })).slice(0, 12);
}
function bp(t, e) {
  return (t == null ? void 0 : t.question) || (t == null ? void 0 : t.prompt) || (t == null ? void 0 : t.stem) || `Question ${e + 1}`;
}
function ul(t) {
  return String((t == null ? void 0 : t.type) || "").toLowerCase();
}
function EN(t) {
  return String((t == null ? void 0 : t.label) || (t == null ? void 0 : t.text) || t).trim();
}
function yo(t) {
  const e = (t == null ? void 0 : t.choices) || (t == null ? void 0 : t.options) || (t == null ? void 0 : t.answers);
  return Array.isArray(e) && e.length ? e.map(EN).filter(Boolean) : ul(t) === "true_false" ? ["True", "False"] : [];
}
function Rp(t) {
  const e = (t == null ? void 0 : t.correctOptionIndexes) || (t == null ? void 0 : t.correct_option_indexes) || (t == null ? void 0 : t.correctIndexes);
  return Array.isArray(e) ? e.map((n) => Number(n)).filter(Number.isInteger) : [];
}
function AN(t, e) {
  const n = Array.isArray(t) ? [...t].map(Number).filter(Number.isInteger).sort((s, a) => s - a) : [], r = Array.isArray(e) ? [...e].map(Number).filter(Number.isInteger).sort((s, a) => s - a) : [];
  return n.length === r.length && n.every((s, a) => s === r[a]);
}
function wr(t) {
  return String(t || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Ac(t, e) {
  if (Number.isInteger(e)) return e;
  const n = Number(e);
  if (typeof e != "string" && Number.isInteger(n)) return n;
  const r = yo(t), s = wr(e);
  return r.findIndex((a) => wr(a) === s);
}
function ET(t, e) {
  if (typeof e == "boolean") return e;
  if (e === 0) return !0;
  if (e === 1) return !1;
  const n = yo(t), r = wr(e);
  return r === "true" ? !0 : r === "false" ? !1 : wr(n[0]) === r ? !0 : wr(n[1]) === r ? !1 : null;
}
function bN(t, e, n) {
  const r = ul(t);
  if (r === "multiple_choice") {
    const s = Ac(t, e);
    if (!Number.isInteger(s) || s < 0) return [];
    const a = Array.isArray(n) ? [...n] : [];
    return a.includes(s) ? a.filter((l) => l !== s) : [...a, s].sort((l, c) => l - c);
  }
  if (r === "single_choice") {
    const s = Ac(t, e);
    return Number.isInteger(s) && s >= 0 ? s : "";
  }
  if (r === "true_false") {
    const s = ET(t, e);
    return s === null ? "" : s;
  }
  return String(e || "");
}
function AT(t) {
  const e = (t == null ? void 0 : t.correctAnswer) ?? (t == null ? void 0 : t.correct_answer) ?? (t == null ? void 0 : t.answer) ?? (t == null ? void 0 : t.correct), n = Rp(t);
  if (n.length) {
    const r = yo(t);
    return n.map((s) => r[s] || "").filter(Boolean).join(", ");
  }
  if (typeof (t == null ? void 0 : t.correctBoolean) == "boolean" || typeof (t == null ? void 0 : t.correct_boolean) == "boolean") {
    const r = yo(t);
    return (typeof t.correctBoolean == "boolean" ? t.correctBoolean : t.correct_boolean) ? r[0] || "True" : r[1] || "False";
  }
  return t != null && t.expectedAnswer || t != null && t.expected_answer ? String(t.expectedAnswer || t.expected_answer || "").trim() : Array.isArray(e) ? e.map((r) => String(r)).join(", ") : String(e || "").trim();
}
function RN(t, e) {
  const n = ul(t);
  if (n === "single_choice") {
    const s = Rp(t)[0], a = Ac(t, e);
    return Number.isInteger(s) ? a === s : null;
  }
  if (n === "multiple_choice") {
    const s = Rp(t), a = Array.isArray(e) ? e : [Ac(t, e)].filter(Number.isInteger);
    return s.length ? AN(a, s) : null;
  }
  if (n === "true_false") {
    const s = typeof (t == null ? void 0 : t.correctBoolean) == "boolean" ? t.correctBoolean : t == null ? void 0 : t.correct_boolean, a = ET(t, e);
    return typeof s == "boolean" && a !== null ? a === s : null;
  }
  const r = AT(t);
  return r ? wr(e) === wr(r) : null;
}
function MN(t, e) {
  const n = ul(t);
  return n === "multiple_choice" ? Array.isArray(e) && e.length > 0 : n === "single_choice" ? Number.isInteger(e) : n === "true_false" ? typeof e == "boolean" : String(e || "").trim().length > 0;
}
function DN(t, e, n) {
  const r = ul(t);
  return r === "multiple_choice" ? Array.isArray(e) && e.includes(n) : r === "single_choice" ? e === n : r === "true_false" ? e === (n === 0) : wr(e) === wr(yo(t)[n]);
}
function bT(t, e, n) {
  var c;
  const r = String(t || "").trim(), s = String((e == null ? void 0 : e.summaryText) || (e == null ? void 0 : e.aiSummary) || "").slice(0, 420), a = ((c = e == null ? void 0 : e.studyHeadings) == null ? void 0 : c[0]) || (e == null ? void 0 : e.materialTitle) || "this material", l = n || `Study ${(e == null ? void 0 : e.materialTitle) || "this material"}`;
  return r ? [
    `For ${a}: ${s || "use the selected material as your main source."}`,
    `Your current goal is: ${l}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ") : "";
}
function FN() {
  return ll[0] || $a(kp);
}
function ON(t) {
  const e = String(t || "");
  if (!e) return null;
  const r = kT(TT()).materials[e];
  return r && typeof r == "object" ? r : null;
}
function Fi(t) {
  var r;
  const e = String(t.selectedMaterialId || ((r = t.selectedMaterial) == null ? void 0 : r.materialId) || "");
  if (!e) return;
  const n = kT(TT());
  n.materials[e] = {
    materialId: e,
    selectedScene: t.selectedScene,
    musicType: t.musicType,
    ambientSound: t.ambientSound,
    musicVolume: mo(t.musicVolume),
    ambientVolume: mo(t.ambientVolume),
    durationMinutes: Gc(t.pomodoroDuration),
    studyGoal: t.studyGoal,
    studyPlan: CT(t.studyPlan),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, uN(n);
}
function IN(t, e = {}) {
  const n = $a(e.selectedScene), r = ON(t == null ? void 0 : t.materialId), s = ny(r == null ? void 0 : r.selectedScene) ? r.selectedScene : n.id, a = $a(s), l = String((r == null ? void 0 : r.musicType) || a.musicType || "Deep Focus"), c = String((r == null ? void 0 : r.ambientSound) || a.ambientSound || "Nature"), d = mo(r == null ? void 0 : r.musicVolume, e.musicVolume ?? 60), m = mo(r == null ? void 0 : r.ambientVolume, e.ambientVolume ?? 50), y = Gc(r == null ? void 0 : r.durationMinutes, e.pomodoroDuration ?? ey), f = String((r == null ? void 0 : r.studyGoal) || `Study ${(t == null ? void 0 : t.materialTitle) || "this material"}`), p = CT(r == null ? void 0 : r.studyPlan), g = p.length ? p : Ep(t, f, y);
  return {
    selectedScene: s,
    musicType: l,
    ambientSound: c,
    musicVolume: d,
    ambientVolume: m,
    pomodoroDuration: y,
    studyGoal: f,
    studyPlan: g
  };
}
function Iu() {
  return {
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {}
  };
}
function pw(t) {
  return Object.values(t.flashcardProgress || {}).filter((e) => e && e.difficulty).length;
}
function mw(t) {
  const e = Object.values(t.quizChecked || {}).filter((r) => r && r.hasKnownAnswer);
  if (!e.length) return null;
  const n = e.filter((r) => r.correct).length;
  return Math.round(n / e.length * 100);
}
function yw(t) {
  const e = Ec(t.selectedMaterial);
  return Object.entries(t.quizChecked || {}).filter(([, n]) => n && n.hasKnownAnswer && !n.correct).map(([n]) => bp(e[Number(n)], Number(n))).filter(Boolean);
}
async function NN(t, e, n) {
  var a, l;
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch != "function")
    return {
      answer: bT(t, n, Y.getState().studyGoal),
      offline: !0
    };
  const r = await globalThis.apiClient.fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: t,
      selected_section: ((a = n == null ? void 0 : n.studyHeadings) == null ? void 0 : a[0]) || "",
      preferred_language: ((l = globalThis.preferredLanguage) == null ? void 0 : l.value) || "auto",
      title: (n == null ? void 0 : n.materialTitle) || "Study material",
      summary: (n == null ? void 0 : n.aiSummary) || (n == null ? void 0 : n.summaryText) || "",
      sections: (n == null ? void 0 : n.sections) || {},
      source_identity: (n == null ? void 0 : n.materialId) || "",
      source_fingerprint: (n == null ? void 0 : n.sourceFingerprint) || "",
      chat_history: e
    })
  });
  let s = null;
  try {
    s = await r.json();
  } catch {
    throw new Error("Backend returned non-JSON response.");
  }
  if (!r.ok || s != null && s.error)
    throw new Error((s == null ? void 0 : s.error) || "AI request failed.");
  return {
    answer: (s == null ? void 0 : s.answer) || "No answer returned.",
    usedExternalResearch: !!(s != null && s.used_external_research),
    researchSources: Array.isArray(s == null ? void 0 : s.research_sources) ? s.research_sources : []
  };
}
const Y = pN((t, e) => {
  const n = FN();
  return {
    route: "workspace",
    view: "setup",
    selectedMaterialId: "",
    selectedMaterial: null,
    selectedScene: n.id,
    musicType: n.musicType || "Deep Focus",
    ambientSound: n.ambientSound || "Nature",
    musicVolume: 60,
    ambientVolume: 50,
    pomodoroDuration: ey,
    timerStatus: "idle",
    studyGoal: "",
    studyPlan: [],
    aiPanelOpen: !1,
    planDrawerOpen: !1,
    workspaceOpen: !1,
    historyOpen: !1,
    isIdle: !1,
    currentSession: null,
    sessionHistory: [],
    activeDrawer: "",
    audioPlaying: !1,
    elapsedSeconds: 0,
    startedAt: null,
    panelTab: "summary",
    summaryRecord: null,
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {},
    chatMessages: [],
    chatPending: !1,
    chatError: "",
    setIdle: (r) => t({ isIdle: r }),
    hydrateFocusRoute(r, s, { preserveSession: a = !1 } = {}) {
      const l = e(), c = !!s, d = c ? s.materialId : String(r.materialId || "");
      if (!c) {
        t({
          route: "setup",
          view: "setup",
          selectedMaterialId: d,
          selectedMaterial: null,
          aiPanelOpen: !1,
          planDrawerOpen: !1,
          workspaceOpen: !1,
          activeDrawer: "",
          summaryRecord: null,
          studyPlan: []
        });
        return;
      }
      const m = l.selectedMaterialId === d, y = m && a ? {} : IN(s, l);
      t({
        ...y,
        route: a && m && l.view === "session" ? "session" : "setup",
        view: a && m && l.view === "session" ? "session" : "setup",
        selectedMaterialId: d,
        selectedMaterial: s,
        aiPanelOpen: !1,
        planDrawerOpen: !1,
        workspaceOpen: !1,
        historyOpen: !1,
        activeDrawer: "",
        summaryRecord: null,
        ...m && a ? {} : {
          timerStatus: "idle",
          elapsedSeconds: 0,
          startedAt: null,
          currentSession: null,
          ...Iu(),
          chatMessages: [],
          chatPending: !1,
          chatError: ""
        }
      });
    },
    showStudyHistory() {
      t({
        route: "history",
        view: "history",
        aiPanelOpen: !1,
        planDrawerOpen: !1,
        workspaceOpen: !1,
        historyOpen: !0,
        activeDrawer: "",
        summaryRecord: null,
        sessionHistory: Pc()
      });
    },
    selectScene(r) {
      const s = ny(r);
      s && t((a) => {
        const l = {
          selectedScene: s.id,
          musicType: s.musicType || a.musicType,
          ambientSound: s.ambientSound || a.ambientSound
        }, c = { ...a, ...l };
        return Fi(c), l;
      });
    },
    setPomodoroDuration(r) {
      t((s) => {
        const a = Gc(r, s.pomodoroDuration), l = Ep(s.selectedMaterial, s.studyGoal, a), c = { pomodoroDuration: a, studyPlan: l };
        return Fi({ ...s, ...c }), c;
      });
    },
    setStudyGoal(r) {
      t((s) => {
        const a = String(r ?? ""), l = Ep(s.selectedMaterial, a, s.pomodoroDuration), c = { studyGoal: a, studyPlan: l };
        return Fi({ ...s, ...c }), c;
      });
    },
    setSound(r, s) {
      t((a) => {
        let l = {};
        return r === "musicVolume" && (l = { musicVolume: mo(s, a.musicVolume) }), r === "ambientVolume" && (l = { ambientVolume: mo(s, a.ambientVolume) }), r === "musicType" && (l = { musicType: String(s || a.musicType) }), r === "ambientSound" && (l = { ambientSound: String(s || a.ambientSound) }), Fi({ ...a, ...l }), l;
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
        activeDrawer: r,
        planDrawerOpen: r === "plan",
        workspaceOpen: r === "workspace",
        historyOpen: r === "history"
      });
    },
    closeDrawer() {
      t({
        activeDrawer: "",
        planDrawerOpen: !1,
        workspaceOpen: !1,
        historyOpen: !1
      });
    },
    toggleAIPanel() {
      t((r) => ({ aiPanelOpen: !r.aiPanelOpen }));
    },
    setPanelTab(r) {
      const s = String(r || "summary");
      t({
        panelTab: vN.has(s) ? s : "summary",
        aiPanelOpen: !0
      });
    },
    startSession() {
      const r = e();
      r.selectedMaterial && (Fi(r), t({
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
        ...Iu(),
        chatMessages: [],
        chatPending: !1,
        chatError: ""
      }));
    },
    startTimer() {
      const r = e();
      if (!r.selectedMaterial) return;
      const s = r.timerStatus === "completed" || r.elapsedSeconds >= va(r.pomodoroDuration);
      t({
        view: "session",
        route: "session",
        timerStatus: "studying",
        audioPlaying: !0,
        summaryRecord: null,
        elapsedSeconds: s ? 0 : r.elapsedSeconds,
        startedAt: !r.startedAt || r.timerStatus === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : r.startedAt,
        ...s ? Iu() : {}
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
        ...Iu()
      });
    },
    skipTimer() {
      const r = e();
      t({
        elapsedSeconds: va(r.pomodoroDuration),
        timerStatus: "completed",
        audioPlaying: !1,
        startedAt: r.startedAt || (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    tickTimer() {
      const r = e();
      if (r.view !== "session" || r.timerStatus !== "studying" || !r.selectedMaterial) return;
      const s = va(r.pomodoroDuration), a = s ? Math.min(s, r.elapsedSeconds + 1) : r.elapsedSeconds + 1;
      t({
        elapsedSeconds: a,
        timerStatus: s && a >= s ? "completed" : r.timerStatus,
        audioPlaying: s && a >= s ? !1 : r.audioPlaying
      });
    },
    endSession() {
      var m;
      const r = e(), s = r.selectedMaterial || Cp(r.selectedMaterialId);
      if (!s) return;
      const a = (/* @__PURE__ */ new Date()).toISOString(), l = va(r.pomodoroDuration), c = l ? Math.min(l, r.elapsedSeconds) : r.elapsedSeconds, d = cN({
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
        flashcardsCompleted: pw(r),
        quizScore: mw(r),
        mistakesMade: yw(r),
        completedTasks: r.completedTasks,
        recommendedNextStep: "Return to your notes, review any unchecked tasks, then start another short focus block."
      });
      t({
        summaryRecord: d,
        sessionHistory: Pc(),
        timerStatus: "completed",
        audioPlaying: !1,
        elapsedSeconds: l ? Math.min(l, r.elapsedSeconds) : r.elapsedSeconds
      });
    },
    closeSummary() {
      t({ summaryRecord: null });
    },
    toggleTask(r) {
      t((s) => {
        const a = s.studyPlan[Number(r)];
        if (!a) return {};
        const l = String(a.task || ""), c = s.completedTasks.includes(l) ? s.completedTasks.filter((d) => d !== l) : [...s.completedTasks, l];
        return Fi({ ...s }), { completedTasks: c };
      });
    },
    updatePlanTask(r, s = null, a = null) {
      t((l) => {
        const c = Number(r), d = l.studyPlan[c];
        if (!d) return {};
        const m = String(d.task || ""), y = a == null ? m : String(a || "").trim(), f = s == null ? d.minutes : Gs(s, d.minutes, 1, ty), p = l.studyPlan.map((_, x) => x === c ? { minutes: f, task: y || m } : _);
        let g = l.completedTasks;
        m && m !== p[c].task && g.includes(m) && (g = g.filter((_) => _ !== m).concat(p[c].task));
        const S = { studyPlan: p, completedTasks: g };
        return Fi({ ...l, ...S }), S;
      });
    },
    setFlashcardIndex(r) {
      const s = Ap(e().selectedMaterial);
      t({
        flashcardIndex: Gs(r, e().flashcardIndex, 0, Math.max(0, s.length - 1)),
        flashcardSide: "front"
      });
    },
    flipFlashcard() {
      t((r) => ({
        flashcardSide: r.flashcardSide === "back" ? "front" : "back"
      }));
    },
    rateFlashcard(r) {
      const s = e(), a = Ap(s.selectedMaterial);
      if (!a.length) return;
      const l = Gs(s.flashcardIndex, 0, 0, a.length - 1), c = a[l], d = ["easy", "medium", "hard"].includes(String(r)) ? String(r) : "medium";
      t({
        flashcardProgress: {
          ...s.flashcardProgress,
          [PT(c, l)]: {
            difficulty: d,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: l < a.length - 1 ? l + 1 : l
      });
    },
    answerQuizQuestion(r, s) {
      const a = Number(r), l = Ec(e().selectedMaterial)[a];
      if (!l) return;
      const c = String(a);
      t((d) => ({
        quizAnswers: {
          ...d.quizAnswers,
          [c]: bN(l, s, d.quizAnswers[c])
        }
      }));
    },
    checkQuizQuestion(r) {
      const s = Ec(e().selectedMaterial), a = Number(r), l = s[a];
      if (!l) return;
      const c = String(a), d = e(), m = Object.prototype.hasOwnProperty.call(d.quizAnswers, c) ? d.quizAnswers[c] : "", y = RN(l, m), f = AT(l);
      t({
        quizChecked: {
          ...d.quizChecked,
          [c]: {
            answer: m,
            correct: y === null ? !1 : y,
            hasKnownAnswer: y !== null,
            explanation: l.explanation || l.rationale || (f ? `Correct answer: ${f}` : ""),
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
    },
    async askAssistant(r) {
      const s = String(r || "").trim();
      if (!s) return;
      const a = e(), l = a.selectedMaterial, c = Ou(a.chatMessages).slice(-10).map((d) => ({
        role: d.role === "user" ? "user" : "assistant",
        content: d.text
      }));
      t({
        chatMessages: Ou([
          ...a.chatMessages,
          { role: "user", text: s, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        ]),
        chatPending: !0,
        chatError: ""
      });
      try {
        const d = await NN(s, c, l);
        t((m) => ({
          chatMessages: Ou([
            ...m.chatMessages,
            { role: "assistant", text: d.answer, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: d.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (d) {
        t((m) => ({
          chatMessages: Ou([
            ...m.chatMessages,
            { role: "assistant", text: bT(s, l, e().studyGoal), createdAt: (/* @__PURE__ */ new Date()).toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${d.message || "request failed"}`
        }));
      } finally {
        t({ chatPending: !1 });
      }
    },
    focusFlashcardsCompletedCount() {
      return pw(e());
    },
    focusQuizScore() {
      return mw(e());
    },
    focusQuizMistakes() {
      return yw(e());
    },
    formatFocusedTime() {
      return Wc(e().elapsedSeconds);
    }
  };
});
function _e({
  children: t,
  className: e = "",
  variant: n = "ghost",
  type: r = "button",
  ...s
}) {
  return /* @__PURE__ */ C.jsx(
    "button",
    {
      className: `glass-button glass-button-${n} ${e}`.trim(),
      type: r,
      ...s,
      children: t
    }
  );
}
function Ea({ as: t = "section", className: e = "", children: n, ...r }) {
  return /* @__PURE__ */ C.jsx(
    Ot.div,
    {
      className: `liquid-glass ${e}`.trim(),
      initial: { opacity: 0, y: 14, filter: "blur(10px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      transition: _r,
      ...r,
      children: t === "div" ? n : /* @__PURE__ */ C.jsx(t, { className: "liquid-glass-inner", children: n })
    }
  );
}
function LN({ scene: t, active: e, onSelect: n }) {
  return /* @__PURE__ */ C.jsxs(
    Ot.button,
    {
      className: `scene-card ${e ? "active" : ""}`.trim(),
      type: "button",
      "aria-pressed": e,
      onClick: () => n(t.id),
      style: { backgroundImage: `url("${t.image}")` },
      whileHover: { scale: 1.025, y: -2 },
      whileTap: { scale: 0.98 },
      children: [
        /* @__PURE__ */ C.jsx("span", { className: "focus-pill", children: t.kicker }),
        /* @__PURE__ */ C.jsx("strong", { children: t.name }),
        /* @__PURE__ */ C.jsx("span", { children: t.description })
      ]
    }
  );
}
function RT() {
  const t = Y((n) => n.selectedScene), e = Y((n) => n.selectScene);
  return /* @__PURE__ */ C.jsx("div", { className: "scene-selector", children: ll.map((n) => /* @__PURE__ */ C.jsx(
    LN,
    {
      scene: n,
      active: n.id === t,
      onSelect: e
    },
    n.id
  )) });
}
function gw(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function jN(...t) {
  return (e) => {
    let n = !1;
    const r = t.map((s) => {
      const a = gw(s, e);
      return !n && typeof a == "function" && (n = !0), a;
    });
    if (n)
      return () => {
        for (let s = 0; s < r.length; s++) {
          const a = r[s];
          typeof a == "function" ? a() : gw(t[s], null);
        }
      };
  };
}
function It(...t) {
  return k.useCallback(jN(...t), t);
}
// @__NO_SIDE_EFFECTS__
function bc(t) {
  const e = k.forwardRef((n, r) => {
    let { children: s, ...a } = n, l = null, c = !1;
    const d = [];
    vw(s) && typeof Nu == "function" && (s = Nu(s._payload)), k.Children.forEach(s, (p) => {
      var g;
      if ($N(p)) {
        c = !0;
        const S = p;
        let _ = "child" in S.props ? S.props.child : S.props.children;
        vw(_) && typeof Nu == "function" && (_ = Nu(_._payload)), l = BN(S, _), d.push((g = l == null ? void 0 : l.props) == null ? void 0 : g.children);
      } else
        d.push(p);
    }), l ? l = k.cloneElement(l, void 0, d) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !c && k.Children.count(s) === 1 && k.isValidElement(s) && (l = s)
    );
    const m = l ? UN(l) : void 0, y = It(r, m);
    if (!l) {
      if (s || s === 0)
        throw new Error(
          c ? KN(t) : GN(t)
        );
      return s;
    }
    const f = zN(a, l.props ?? {});
    return l.type !== k.Fragment && (f.ref = r ? y : m), k.cloneElement(l, f);
  });
  return e.displayName = `${t}.Slot`, e;
}
var VN = Symbol.for("radix.slottable"), BN = (t, e) => {
  if ("child" in t.props) {
    const n = t.props.child;
    return k.isValidElement(n) ? k.cloneElement(n, void 0, t.props.children(n.props.children)) : null;
  }
  return k.isValidElement(e) ? e : null;
};
function zN(t, e) {
  const n = { ...e };
  for (const r in e) {
    const s = t[r], a = e[r];
    /^on[A-Z]/.test(r) ? s && a ? n[r] = (...c) => {
      const d = a(...c);
      return s(...c), d;
    } : s && (n[r] = s) : r === "style" ? n[r] = { ...s, ...a } : r === "className" && (n[r] = [s, a].filter(Boolean).join(" "));
  }
  return { ...t, ...n };
}
function UN(t) {
  var r, s;
  let e = (r = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : r.get, n = e && "isReactWarning" in e && e.isReactWarning;
  return n ? t.ref : (e = (s = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : s.get, n = e && "isReactWarning" in e && e.isReactWarning, n ? t.props.ref : t.props.ref || t.ref);
}
function $N(t) {
  return k.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === VN;
}
var HN = Symbol.for("react.lazy");
function vw(t) {
  return t != null && typeof t == "object" && "$$typeof" in t && t.$$typeof === HN && "_payload" in t && WN(t._payload);
}
function WN(t) {
  return typeof t == "object" && t !== null && "then" in t;
}
var GN = (t) => `${t} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, KN = (t) => `${t} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, Nu = em[" use ".trim().toString()], QN = [
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
], it = QN.reduce((t, e) => {
  const n = /* @__PURE__ */ bc(`Primitive.${e}`), r = k.forwardRef((s, a) => {
    const { asChild: l, ...c } = s, d = l ? n : e;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ C.jsx(d, { ...c, ref: a });
  });
  return r.displayName = `Primitive.${e}`, { ...t, [e]: r };
}, {});
function YN(t, e) {
  t && bS.flushSync(() => t.dispatchEvent(e));
}
function XN(t, e) {
  const n = k.createContext(e);
  n.displayName = t + "Context";
  const r = (a) => {
    const { children: l, ...c } = a, d = k.useMemo(() => c, Object.values(c));
    return /* @__PURE__ */ C.jsx(n.Provider, { value: d, children: l });
  };
  r.displayName = t + "Provider";
  function s(a) {
    const l = k.useContext(n);
    if (l) return l;
    if (e !== void 0) return e;
    throw new Error(`\`${a}\` must be used within \`${t}\``);
  }
  return [r, s];
}
function cl(t, e = []) {
  let n = [];
  function r(a, l) {
    const c = k.createContext(l);
    c.displayName = a + "Context";
    const d = n.length;
    n = [...n, l];
    const m = (f) => {
      var T;
      const { scope: p, children: g, ...S } = f, _ = ((T = p == null ? void 0 : p[t]) == null ? void 0 : T[d]) || c, x = k.useMemo(() => S, Object.values(S));
      return /* @__PURE__ */ C.jsx(_.Provider, { value: x, children: g });
    };
    m.displayName = a + "Provider";
    function y(f, p) {
      var _;
      const g = ((_ = p == null ? void 0 : p[t]) == null ? void 0 : _[d]) || c, S = k.useContext(g);
      if (S) return S;
      if (l !== void 0) return l;
      throw new Error(`\`${f}\` must be used within \`${a}\``);
    }
    return [m, y];
  }
  const s = () => {
    const a = n.map((l) => k.createContext(l));
    return function(c) {
      const d = (c == null ? void 0 : c[t]) || a;
      return k.useMemo(
        () => ({ [`__scope${t}`]: { ...c, [t]: d } }),
        [c, d]
      );
    };
  };
  return s.scopeName = t, [r, qN(s, ...e)];
}
function qN(...t) {
  const e = t[0];
  if (t.length === 1) return e;
  const n = () => {
    const r = t.map((s) => ({
      useScope: s(),
      scopeName: s.scopeName
    }));
    return function(a) {
      const l = r.reduce((c, { useScope: d, scopeName: m }) => {
        const f = d(a)[`__scope${m}`];
        return { ...c, ...f };
      }, {});
      return k.useMemo(() => ({ [`__scope${e.scopeName}`]: l }), [l]);
    };
  };
  return n.scopeName = e.scopeName, n;
}
function MT(t) {
  const e = t + "CollectionProvider", [n, r] = cl(e), [s, a] = n(
    e,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), l = (_) => {
    const { scope: x, children: T } = _, E = k.useRef(null), A = k.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ C.jsx(s, { scope: x, itemMap: A, collectionRef: E, children: T });
  };
  l.displayName = e;
  const c = t + "CollectionSlot", d = /* @__PURE__ */ bc(c), m = k.forwardRef(
    (_, x) => {
      const { scope: T, children: E } = _, A = a(c, T), b = It(x, A.collectionRef);
      return /* @__PURE__ */ C.jsx(d, { ref: b, children: E });
    }
  );
  m.displayName = c;
  const y = t + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ bc(y), g = k.forwardRef(
    (_, x) => {
      const { scope: T, children: E, ...A } = _, b = k.useRef(null), M = It(x, b), B = a(y, T);
      return k.useEffect(() => (B.itemMap.set(b, { ref: b, ...A }), () => void B.itemMap.delete(b))), /* @__PURE__ */ C.jsx(p, { [f]: "", ref: M, children: E });
    }
  );
  g.displayName = y;
  function S(_) {
    const x = a(t + "CollectionConsumer", _);
    return k.useCallback(() => {
      const E = x.collectionRef.current;
      if (!E) return [];
      const A = Array.from(E.querySelectorAll(`[${f}]`));
      return Array.from(x.itemMap.values()).sort(
        (B, I) => A.indexOf(B.ref.current) - A.indexOf(I.ref.current)
      );
    }, [x.collectionRef, x.itemMap]);
  }
  return [
    { Provider: l, Slot: m, ItemSlot: g },
    S,
    r
  ];
}
function Qe(t, e, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(s) {
    if (t == null || t(s), n === !1 || !s.defaultPrevented)
      return e == null ? void 0 : e(s);
  };
}
var go = globalThis != null && globalThis.document ? k.useLayoutEffect : () => {
}, ZN = em[" useInsertionEffect ".trim().toString()] || go;
function Kc({
  prop: t,
  defaultProp: e,
  onChange: n = () => {
  },
  caller: r
}) {
  const [s, a, l] = JN({
    defaultProp: e,
    onChange: n
  }), c = t !== void 0, d = c ? t : s;
  {
    const y = k.useRef(t !== void 0);
    k.useEffect(() => {
      const f = y.current;
      f !== c && console.warn(
        `${r} is changing from ${f ? "controlled" : "uncontrolled"} to ${c ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), y.current = c;
    }, [c, r]);
  }
  const m = k.useCallback(
    (y) => {
      var f;
      if (c) {
        const p = e2(y) ? y(t) : y;
        p !== t && ((f = l.current) == null || f.call(l, p));
      } else
        a(y);
    },
    [c, t, a, l]
  );
  return [d, m];
}
function JN({
  defaultProp: t,
  onChange: e
}) {
  const [n, r] = k.useState(t), s = k.useRef(n), a = k.useRef(e);
  return ZN(() => {
    a.current = e;
  }, [e]), k.useEffect(() => {
    var l;
    s.current !== n && ((l = a.current) == null || l.call(a, n), s.current = n);
  }, [n, s]), [n, r, a];
}
function e2(t) {
  return typeof t == "function";
}
function t2(t, e) {
  return k.useReducer((n, r) => e[n][r] ?? n, t);
}
var fl = (t) => {
  const { present: e, children: n } = t, r = n2(e), s = typeof n == "function" ? n({ present: r.isPresent }) : k.Children.only(n), a = r2(r.ref, i2(s));
  return typeof n == "function" || r.isPresent ? k.cloneElement(s, { ref: a }) : null;
};
fl.displayName = "Presence";
function n2(t) {
  const [e, n] = k.useState(), r = k.useRef(null), s = k.useRef(t), a = k.useRef("none"), l = t ? "mounted" : "unmounted", [c, d] = t2(l, {
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
  return k.useEffect(() => {
    const m = Lu(r.current);
    a.current = c === "mounted" ? m : "none";
  }, [c]), go(() => {
    const m = r.current, y = s.current;
    if (y !== t) {
      const p = a.current, g = Lu(m);
      t ? d("MOUNT") : g === "none" || (m == null ? void 0 : m.display) === "none" ? d("UNMOUNT") : d(y && p !== g ? "ANIMATION_OUT" : "UNMOUNT"), s.current = t;
    }
  }, [t, d]), go(() => {
    if (e) {
      let m;
      const y = e.ownerDocument.defaultView ?? window, f = (g) => {
        const _ = Lu(r.current).includes(CSS.escape(g.animationName));
        if (g.target === e && _ && (d("ANIMATION_END"), !s.current)) {
          const x = e.style.animationFillMode;
          e.style.animationFillMode = "forwards", m = y.setTimeout(() => {
            e.style.animationFillMode === "forwards" && (e.style.animationFillMode = x);
          });
        }
      }, p = (g) => {
        g.target === e && (a.current = Lu(r.current));
      };
      return e.addEventListener("animationstart", p), e.addEventListener("animationcancel", f), e.addEventListener("animationend", f), () => {
        y.clearTimeout(m), e.removeEventListener("animationstart", p), e.removeEventListener("animationcancel", f), e.removeEventListener("animationend", f);
      };
    } else
      d("ANIMATION_END");
  }, [e, d]), {
    isPresent: ["mounted", "unmountSuspended"].includes(c),
    ref: k.useCallback((m) => {
      r.current = m ? getComputedStyle(m) : null, n(m);
    }, [])
  };
}
function _w(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function r2(...t) {
  const e = k.useRef(t);
  return e.current = t, k.useCallback((n) => {
    const r = e.current;
    let s = !1;
    const a = r.map((l) => {
      const c = _w(l, n);
      return !s && typeof c == "function" && (s = !0), c;
    });
    if (s)
      return () => {
        for (let l = 0; l < a.length; l++) {
          const c = a[l];
          typeof c == "function" ? c() : _w(r[l], null);
        }
      };
  }, []);
}
function Lu(t) {
  return (t == null ? void 0 : t.animationName) || "none";
}
function i2(t) {
  var r, s;
  let e = (r = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : r.get, n = e && "isReactWarning" in e && e.isReactWarning;
  return n ? t.ref : (e = (s = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : s.get, n = e && "isReactWarning" in e && e.isReactWarning, n ? t.props.ref : t.props.ref || t.ref);
}
var s2 = em[" useId ".trim().toString()] || (() => {
}), o2 = 0;
function Aa(t) {
  const [e, n] = k.useState(s2());
  return go(() => {
    n((r) => r ?? String(o2++));
  }, [t]), t || (e ? `radix-${e}` : "");
}
var a2 = k.createContext(void 0);
function ry(t) {
  const e = k.useContext(a2);
  return t || e || "ltr";
}
function vo(t) {
  const e = k.useRef(t);
  return k.useEffect(() => {
    e.current = t;
  }), k.useMemo(() => ((...n) => {
    var r;
    return (r = e.current) == null ? void 0 : r.call(e, ...n);
  }), []);
}
function l2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = vo(t);
  k.useEffect(() => {
    const r = (s) => {
      s.key === "Escape" && n(s);
    };
    return e.addEventListener("keydown", r, { capture: !0 }), () => e.removeEventListener("keydown", r, { capture: !0 });
  }, [n, e]);
}
var u2 = "DismissableLayer", Mp = "dismissableLayer.update", c2 = "dismissableLayer.pointerDownOutside", f2 = "dismissableLayer.focusOutside", ww, DT = k.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), FT = k.forwardRef(
  (t, e) => {
    const {
      disableOutsidePointerEvents: n = !1,
      onEscapeKeyDown: r,
      onPointerDownOutside: s,
      onFocusOutside: a,
      onInteractOutside: l,
      onDismiss: c,
      ...d
    } = t, m = k.useContext(DT), [y, f] = k.useState(null), p = (y == null ? void 0 : y.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, g] = k.useState({}), S = It(e, (I) => f(I)), _ = Array.from(m.layers), [x] = [...m.layersWithOutsidePointerEventsDisabled].slice(-1), T = _.indexOf(x), E = y ? _.indexOf(y) : -1, A = m.layersWithOutsidePointerEventsDisabled.size > 0, b = E >= T, M = p2((I) => {
      const O = I.target, L = [...m.branches].some(($) => $.contains(O));
      !b || L || (s == null || s(I), l == null || l(I), I.defaultPrevented || c == null || c());
    }, p), B = m2((I) => {
      const O = I.target;
      [...m.branches].some(($) => $.contains(O)) || (a == null || a(I), l == null || l(I), I.defaultPrevented || c == null || c());
    }, p);
    return l2((I) => {
      E === m.layers.size - 1 && (r == null || r(I), !I.defaultPrevented && c && (I.preventDefault(), c()));
    }, p), k.useEffect(() => {
      if (y)
        return n && (m.layersWithOutsidePointerEventsDisabled.size === 0 && (ww = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), m.layersWithOutsidePointerEventsDisabled.add(y)), m.layers.add(y), Sw(), () => {
          n && (m.layersWithOutsidePointerEventsDisabled.delete(y), m.layersWithOutsidePointerEventsDisabled.size === 0 && (p.body.style.pointerEvents = ww));
        };
    }, [y, p, n, m]), k.useEffect(() => () => {
      y && (m.layers.delete(y), m.layersWithOutsidePointerEventsDisabled.delete(y), Sw());
    }, [y, m]), k.useEffect(() => {
      const I = () => g({});
      return document.addEventListener(Mp, I), () => document.removeEventListener(Mp, I);
    }, []), /* @__PURE__ */ C.jsx(
      it.div,
      {
        ...d,
        ref: S,
        style: {
          pointerEvents: A ? b ? "auto" : "none" : void 0,
          ...t.style
        },
        onFocusCapture: Qe(t.onFocusCapture, B.onFocusCapture),
        onBlurCapture: Qe(t.onBlurCapture, B.onBlurCapture),
        onPointerDownCapture: Qe(
          t.onPointerDownCapture,
          M.onPointerDownCapture
        )
      }
    );
  }
);
FT.displayName = u2;
var d2 = "DismissableLayerBranch", h2 = k.forwardRef((t, e) => {
  const n = k.useContext(DT), r = k.useRef(null), s = It(e, r);
  return k.useEffect(() => {
    const a = r.current;
    if (a)
      return n.branches.add(a), () => {
        n.branches.delete(a);
      };
  }, [n.branches]), /* @__PURE__ */ C.jsx(it.div, { ...t, ref: s });
});
h2.displayName = d2;
function p2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = vo(t), r = k.useRef(!1), s = k.useRef(() => {
  });
  return k.useEffect(() => {
    const a = (c) => {
      if (c.target && !r.current) {
        let d = function() {
          OT(
            c2,
            n,
            m,
            { discrete: !0 }
          );
        };
        const m = { originalEvent: c };
        c.pointerType === "touch" ? (e.removeEventListener("click", s.current), s.current = d, e.addEventListener("click", s.current, { once: !0 })) : d();
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
function m2(t, e = globalThis == null ? void 0 : globalThis.document) {
  const n = vo(t), r = k.useRef(!1);
  return k.useEffect(() => {
    const s = (a) => {
      a.target && !r.current && OT(f2, n, { originalEvent: a }, {
        discrete: !1
      });
    };
    return e.addEventListener("focusin", s), () => e.removeEventListener("focusin", s);
  }, [e, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function Sw() {
  const t = new CustomEvent(Mp);
  document.dispatchEvent(t);
}
function OT(t, e, n, { discrete: r }) {
  const s = n.originalEvent.target, a = new CustomEvent(t, { bubbles: !1, cancelable: !0, detail: n });
  e && s.addEventListener(t, e, { once: !0 }), r ? YN(s, a) : s.dispatchEvent(a);
}
var kh = "focusScope.autoFocusOnMount", Ph = "focusScope.autoFocusOnUnmount", xw = { bubbles: !1, cancelable: !0 }, y2 = "FocusScope", IT = k.forwardRef((t, e) => {
  const {
    loop: n = !1,
    trapped: r = !1,
    onMountAutoFocus: s,
    onUnmountAutoFocus: a,
    ...l
  } = t, [c, d] = k.useState(null), m = vo(s), y = vo(a), f = k.useRef(null), p = It(e, (_) => d(_)), g = k.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  k.useEffect(() => {
    if (r) {
      let _ = function(A) {
        if (g.paused || !c) return;
        const b = A.target;
        c.contains(b) ? f.current = b : Gr(f.current, { select: !0 });
      }, x = function(A) {
        if (g.paused || !c) return;
        const b = A.relatedTarget;
        b !== null && (c.contains(b) || Gr(f.current, { select: !0 }));
      }, T = function(A) {
        if (document.activeElement === document.body)
          for (const M of A)
            M.removedNodes.length > 0 && Gr(c);
      };
      document.addEventListener("focusin", _), document.addEventListener("focusout", x);
      const E = new MutationObserver(T);
      return c && E.observe(c, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", _), document.removeEventListener("focusout", x), E.disconnect();
      };
    }
  }, [r, c, g.paused]), k.useEffect(() => {
    if (c) {
      Cw.add(g);
      const _ = document.activeElement;
      if (!c.contains(_)) {
        const T = new CustomEvent(kh, xw);
        c.addEventListener(kh, m), c.dispatchEvent(T), T.defaultPrevented || (g2(x2(NT(c)), { select: !0 }), document.activeElement === _ && Gr(c));
      }
      return () => {
        c.removeEventListener(kh, m), setTimeout(() => {
          const T = new CustomEvent(Ph, xw);
          c.addEventListener(Ph, y), c.dispatchEvent(T), T.defaultPrevented || Gr(_ ?? document.body, { select: !0 }), c.removeEventListener(Ph, y), Cw.remove(g);
        }, 0);
      };
    }
  }, [c, m, y, g]);
  const S = k.useCallback(
    (_) => {
      if (!n && !r || g.paused) return;
      const x = _.key === "Tab" && !_.altKey && !_.ctrlKey && !_.metaKey, T = document.activeElement;
      if (x && T) {
        const E = _.currentTarget, [A, b] = v2(E);
        A && b ? !_.shiftKey && T === b ? (_.preventDefault(), n && Gr(A, { select: !0 })) : _.shiftKey && T === A && (_.preventDefault(), n && Gr(b, { select: !0 })) : T === E && _.preventDefault();
      }
    },
    [n, r, g.paused]
  );
  return /* @__PURE__ */ C.jsx(it.div, { tabIndex: -1, ...l, ref: p, onKeyDown: S });
});
IT.displayName = y2;
function g2(t, { select: e = !1 } = {}) {
  const n = document.activeElement;
  for (const r of t)
    if (Gr(r, { select: e }), document.activeElement !== n) return;
}
function v2(t) {
  const e = NT(t), n = Tw(e, t), r = Tw(e.reverse(), t);
  return [n, r];
}
function NT(t) {
  const e = [], n = document.createTreeWalker(t, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const s = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || s ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) e.push(n.currentNode);
  return e;
}
function Tw(t, e) {
  for (const n of t)
    if (!_2(n, { upTo: e })) return n;
}
function _2(t, { upTo: e }) {
  if (getComputedStyle(t).visibility === "hidden") return !0;
  for (; t; ) {
    if (e !== void 0 && t === e) return !1;
    if (getComputedStyle(t).display === "none") return !0;
    t = t.parentElement;
  }
  return !1;
}
function w2(t) {
  return t instanceof HTMLInputElement && "select" in t;
}
function Gr(t, { select: e = !1 } = {}) {
  if (t && t.focus) {
    const n = document.activeElement;
    t.focus({ preventScroll: !0 }), t !== n && w2(t) && e && t.select();
  }
}
var Cw = S2();
function S2() {
  let t = [];
  return {
    add(e) {
      const n = t[0];
      e !== n && (n == null || n.pause()), t = kw(t, e), t.unshift(e);
    },
    remove(e) {
      var n;
      t = kw(t, e), (n = t[0]) == null || n.resume();
    }
  };
}
function kw(t, e) {
  const n = [...t], r = n.indexOf(e);
  return r !== -1 && n.splice(r, 1), n;
}
function x2(t) {
  return t.filter((e) => e.tagName !== "A");
}
var T2 = "Portal", LT = k.forwardRef((t, e) => {
  var c;
  const { container: n, ...r } = t, [s, a] = k.useState(!1);
  go(() => a(!0), []);
  const l = n || s && ((c = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : c.body);
  return l ? bS.createPortal(/* @__PURE__ */ C.jsx(it.div, { ...r, ref: e }), l) : null;
});
LT.displayName = T2;
var ju = 0, Wn = null;
function C2() {
  k.useEffect(() => {
    Wn || (Wn = { start: Pw(), end: Pw() });
    const { start: t, end: e } = Wn;
    return document.body.firstElementChild !== t && document.body.insertAdjacentElement("afterbegin", t), document.body.lastElementChild !== e && document.body.insertAdjacentElement("beforeend", e), ju++, () => {
      ju === 1 && (Wn == null || Wn.start.remove(), Wn == null || Wn.end.remove(), Wn = null), ju = Math.max(0, ju - 1);
    };
  }, []);
}
function Pw() {
  const t = document.createElement("span");
  return t.setAttribute("data-radix-focus-guard", ""), t.tabIndex = 0, t.style.outline = "none", t.style.opacity = "0", t.style.position = "fixed", t.style.pointerEvents = "none", t;
}
var er = function() {
  return er = Object.assign || function(e) {
    for (var n, r = 1, s = arguments.length; r < s; r++) {
      n = arguments[r];
      for (var a in n) Object.prototype.hasOwnProperty.call(n, a) && (e[a] = n[a]);
    }
    return e;
  }, er.apply(this, arguments);
};
function jT(t, e) {
  var n = {};
  for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, r = Object.getOwnPropertySymbols(t); s < r.length; s++)
      e.indexOf(r[s]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[s]) && (n[r[s]] = t[r[s]]);
  return n;
}
function k2(t, e, n) {
  if (n || arguments.length === 2) for (var r = 0, s = e.length, a; r < s; r++)
    (a || !(r in e)) && (a || (a = Array.prototype.slice.call(e, 0, r)), a[r] = e[r]);
  return t.concat(a || Array.prototype.slice.call(e));
}
var rc = "right-scroll-bar-position", ic = "width-before-scroll-bar", P2 = "with-scroll-bars-hidden", E2 = "--removed-body-scroll-bar-size";
function Eh(t, e) {
  return typeof t == "function" ? t(e) : t && (t.current = e), t;
}
function A2(t, e) {
  var n = k.useState(function() {
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
var b2 = typeof window < "u" ? k.useLayoutEffect : k.useEffect, Ew = /* @__PURE__ */ new WeakMap();
function R2(t, e) {
  var n = A2(null, function(r) {
    return t.forEach(function(s) {
      return Eh(s, r);
    });
  });
  return b2(function() {
    var r = Ew.get(n);
    if (r) {
      var s = new Set(r), a = new Set(t), l = n.current;
      s.forEach(function(c) {
        a.has(c) || Eh(c, null);
      }), a.forEach(function(c) {
        s.has(c) || Eh(c, l);
      });
    }
    Ew.set(n, t);
  }, [t]), n;
}
function M2(t) {
  return t;
}
function D2(t, e) {
  e === void 0 && (e = M2);
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
      var d = function() {
        var y = l;
        l = [], y.forEach(a);
      }, m = function() {
        return Promise.resolve().then(d);
      };
      m(), n = {
        push: function(y) {
          l.push(y), m();
        },
        filter: function(y) {
          return l = l.filter(y), n;
        }
      };
    }
  };
  return s;
}
function F2(t) {
  t === void 0 && (t = {});
  var e = D2(null);
  return e.options = er({ async: !0, ssr: !1 }, t), e;
}
var VT = function(t) {
  var e = t.sideCar, n = jT(t, ["sideCar"]);
  if (!e)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = e.read();
  if (!r)
    throw new Error("Sidecar medium not found");
  return k.createElement(r, er({}, n));
};
VT.isSideCarExport = !0;
function O2(t, e) {
  return t.useMedium(e), VT;
}
var BT = F2(), Ah = function() {
}, Qc = k.forwardRef(function(t, e) {
  var n = k.useRef(null), r = k.useState({
    onScrollCapture: Ah,
    onWheelCapture: Ah,
    onTouchMoveCapture: Ah
  }), s = r[0], a = r[1], l = t.forwardProps, c = t.children, d = t.className, m = t.removeScrollBar, y = t.enabled, f = t.shards, p = t.sideCar, g = t.noRelative, S = t.noIsolation, _ = t.inert, x = t.allowPinchZoom, T = t.as, E = T === void 0 ? "div" : T, A = t.gapMode, b = jT(t, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), M = p, B = R2([n, e]), I = er(er({}, b), s);
  return k.createElement(
    k.Fragment,
    null,
    y && k.createElement(M, { sideCar: BT, removeScrollBar: m, shards: f, noRelative: g, noIsolation: S, inert: _, setCallbacks: a, allowPinchZoom: !!x, lockRef: n, gapMode: A }),
    l ? k.cloneElement(k.Children.only(c), er(er({}, I), { ref: B })) : k.createElement(E, er({}, I, { className: d, ref: B }), c)
  );
});
Qc.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
Qc.classNames = {
  fullWidth: ic,
  zeroRight: rc
};
var I2 = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function N2() {
  if (!document)
    return null;
  var t = document.createElement("style");
  t.type = "text/css";
  var e = I2();
  return e && t.setAttribute("nonce", e), t;
}
function L2(t, e) {
  t.styleSheet ? t.styleSheet.cssText = e : t.appendChild(document.createTextNode(e));
}
function j2(t) {
  var e = document.head || document.getElementsByTagName("head")[0];
  e.appendChild(t);
}
var V2 = function() {
  var t = 0, e = null;
  return {
    add: function(n) {
      t == 0 && (e = N2()) && (L2(e, n), j2(e)), t++;
    },
    remove: function() {
      t--, !t && e && (e.parentNode && e.parentNode.removeChild(e), e = null);
    }
  };
}, B2 = function() {
  var t = V2();
  return function(e, n) {
    k.useEffect(function() {
      return t.add(e), function() {
        t.remove();
      };
    }, [e && n]);
  };
}, zT = function() {
  var t = B2(), e = function(n) {
    var r = n.styles, s = n.dynamic;
    return t(r, s), null;
  };
  return e;
}, z2 = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, bh = function(t) {
  return parseInt(t || "", 10) || 0;
}, U2 = function(t) {
  var e = window.getComputedStyle(document.body), n = e[t === "padding" ? "paddingLeft" : "marginLeft"], r = e[t === "padding" ? "paddingTop" : "marginTop"], s = e[t === "padding" ? "paddingRight" : "marginRight"];
  return [bh(n), bh(r), bh(s)];
}, $2 = function(t) {
  if (t === void 0 && (t = "margin"), typeof window > "u")
    return z2;
  var e = U2(t), n = document.documentElement.clientWidth, r = window.innerWidth;
  return {
    left: e[0],
    top: e[1],
    right: e[2],
    gap: Math.max(0, r - n + e[2] - e[0])
  };
}, H2 = zT(), Ks = "data-scroll-locked", W2 = function(t, e, n, r) {
  var s = t.left, a = t.top, l = t.right, c = t.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(P2, ` {
   overflow: hidden `).concat(r, `;
   padding-right: `).concat(c, "px ").concat(r, `;
  }
  body[`).concat(Ks, `] {
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
  
  .`).concat(rc, ` {
    right: `).concat(c, "px ").concat(r, `;
  }
  
  .`).concat(ic, ` {
    margin-right: `).concat(c, "px ").concat(r, `;
  }
  
  .`).concat(rc, " .").concat(rc, ` {
    right: 0 `).concat(r, `;
  }
  
  .`).concat(ic, " .").concat(ic, ` {
    margin-right: 0 `).concat(r, `;
  }
  
  body[`).concat(Ks, `] {
    `).concat(E2, ": ").concat(c, `px;
  }
`);
}, Aw = function() {
  var t = parseInt(document.body.getAttribute(Ks) || "0", 10);
  return isFinite(t) ? t : 0;
}, G2 = function() {
  k.useEffect(function() {
    return document.body.setAttribute(Ks, (Aw() + 1).toString()), function() {
      var t = Aw() - 1;
      t <= 0 ? document.body.removeAttribute(Ks) : document.body.setAttribute(Ks, t.toString());
    };
  }, []);
}, K2 = function(t) {
  var e = t.noRelative, n = t.noImportant, r = t.gapMode, s = r === void 0 ? "margin" : r;
  G2();
  var a = k.useMemo(function() {
    return $2(s);
  }, [s]);
  return k.createElement(H2, { styles: W2(a, !e, s, n ? "" : "!important") });
}, Dp = !1;
if (typeof window < "u")
  try {
    var Vu = Object.defineProperty({}, "passive", {
      get: function() {
        return Dp = !0, !0;
      }
    });
    window.addEventListener("test", Vu, Vu), window.removeEventListener("test", Vu, Vu);
  } catch {
    Dp = !1;
  }
var Fs = Dp ? { passive: !1 } : !1, Q2 = function(t) {
  return t.tagName === "TEXTAREA";
}, UT = function(t, e) {
  if (!(t instanceof Element))
    return !1;
  var n = window.getComputedStyle(t);
  return (
    // not-not-scrollable
    n[e] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !Q2(t) && n[e] === "visible")
  );
}, Y2 = function(t) {
  return UT(t, "overflowY");
}, X2 = function(t) {
  return UT(t, "overflowX");
}, bw = function(t, e) {
  var n = e.ownerDocument, r = e;
  do {
    typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
    var s = $T(t, r);
    if (s) {
      var a = HT(t, r), l = a[1], c = a[2];
      if (l > c)
        return !0;
    }
    r = r.parentNode;
  } while (r && r !== n.body);
  return !1;
}, q2 = function(t) {
  var e = t.scrollTop, n = t.scrollHeight, r = t.clientHeight;
  return [
    e,
    n,
    r
  ];
}, Z2 = function(t) {
  var e = t.scrollLeft, n = t.scrollWidth, r = t.clientWidth;
  return [
    e,
    n,
    r
  ];
}, $T = function(t, e) {
  return t === "v" ? Y2(e) : X2(e);
}, HT = function(t, e) {
  return t === "v" ? q2(e) : Z2(e);
}, J2 = function(t, e) {
  return t === "h" && e === "rtl" ? -1 : 1;
}, eL = function(t, e, n, r, s) {
  var a = J2(t, window.getComputedStyle(e).direction), l = a * r, c = n.target, d = e.contains(c), m = !1, y = l > 0, f = 0, p = 0;
  do {
    if (!c)
      break;
    var g = HT(t, c), S = g[0], _ = g[1], x = g[2], T = _ - x - a * S;
    (S || T) && $T(t, c) && (f += T, p += S);
    var E = c.parentNode;
    c = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !d && c !== document.body || // self content
    d && (e.contains(c) || e === c)
  );
  return (y && Math.abs(f) < 1 || !y && Math.abs(p) < 1) && (m = !0), m;
}, Bu = function(t) {
  return "changedTouches" in t ? [t.changedTouches[0].clientX, t.changedTouches[0].clientY] : [0, 0];
}, Rw = function(t) {
  return [t.deltaX, t.deltaY];
}, Mw = function(t) {
  return t && "current" in t ? t.current : t;
}, tL = function(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}, nL = function(t) {
  return `
  .block-interactivity-`.concat(t, ` {pointer-events: none;}
  .allow-interactivity-`).concat(t, ` {pointer-events: all;}
`);
}, rL = 0, Os = [];
function iL(t) {
  var e = k.useRef([]), n = k.useRef([0, 0]), r = k.useRef(), s = k.useState(rL++)[0], a = k.useState(zT)[0], l = k.useRef(t);
  k.useEffect(function() {
    l.current = t;
  }, [t]), k.useEffect(function() {
    if (t.inert) {
      document.body.classList.add("block-interactivity-".concat(s));
      var _ = k2([t.lockRef.current], (t.shards || []).map(Mw), !0).filter(Boolean);
      return _.forEach(function(x) {
        return x.classList.add("allow-interactivity-".concat(s));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(s)), _.forEach(function(x) {
          return x.classList.remove("allow-interactivity-".concat(s));
        });
      };
    }
  }, [t.inert, t.lockRef.current, t.shards]);
  var c = k.useCallback(function(_, x) {
    if ("touches" in _ && _.touches.length === 2 || _.type === "wheel" && _.ctrlKey)
      return !l.current.allowPinchZoom;
    var T = Bu(_), E = n.current, A = "deltaX" in _ ? _.deltaX : E[0] - T[0], b = "deltaY" in _ ? _.deltaY : E[1] - T[1], M, B = _.target, I = Math.abs(A) > Math.abs(b) ? "h" : "v";
    if ("touches" in _ && I === "h" && B.type === "range")
      return !1;
    var O = window.getSelection(), L = O && O.anchorNode, $ = L ? L === B || L.contains(B) : !1;
    if ($)
      return !1;
    var q = bw(I, B);
    if (!q)
      return !0;
    if (q ? M = I : (M = I === "v" ? "h" : "v", q = bw(I, B)), !q)
      return !1;
    if (!r.current && "changedTouches" in _ && (A || b) && (r.current = M), !M)
      return !0;
    var J = r.current || M;
    return eL(J, x, _, J === "h" ? A : b);
  }, []), d = k.useCallback(function(_) {
    var x = _;
    if (!(!Os.length || Os[Os.length - 1] !== a)) {
      var T = "deltaY" in x ? Rw(x) : Bu(x), E = e.current.filter(function(M) {
        return M.name === x.type && (M.target === x.target || x.target === M.shadowParent) && tL(M.delta, T);
      })[0];
      if (E && E.should) {
        x.cancelable && x.preventDefault();
        return;
      }
      if (!E) {
        var A = (l.current.shards || []).map(Mw).filter(Boolean).filter(function(M) {
          return M.contains(x.target);
        }), b = A.length > 0 ? c(x, A[0]) : !l.current.noIsolation;
        b && x.cancelable && x.preventDefault();
      }
    }
  }, []), m = k.useCallback(function(_, x, T, E) {
    var A = { name: _, delta: x, target: T, should: E, shadowParent: sL(T) };
    e.current.push(A), setTimeout(function() {
      e.current = e.current.filter(function(b) {
        return b !== A;
      });
    }, 1);
  }, []), y = k.useCallback(function(_) {
    n.current = Bu(_), r.current = void 0;
  }, []), f = k.useCallback(function(_) {
    m(_.type, Rw(_), _.target, c(_, t.lockRef.current));
  }, []), p = k.useCallback(function(_) {
    m(_.type, Bu(_), _.target, c(_, t.lockRef.current));
  }, []);
  k.useEffect(function() {
    return Os.push(a), t.setCallbacks({
      onScrollCapture: f,
      onWheelCapture: f,
      onTouchMoveCapture: p
    }), document.addEventListener("wheel", d, Fs), document.addEventListener("touchmove", d, Fs), document.addEventListener("touchstart", y, Fs), function() {
      Os = Os.filter(function(_) {
        return _ !== a;
      }), document.removeEventListener("wheel", d, Fs), document.removeEventListener("touchmove", d, Fs), document.removeEventListener("touchstart", y, Fs);
    };
  }, []);
  var g = t.removeScrollBar, S = t.inert;
  return k.createElement(
    k.Fragment,
    null,
    S ? k.createElement(a, { styles: nL(s) }) : null,
    g ? k.createElement(K2, { noRelative: t.noRelative, gapMode: t.gapMode }) : null
  );
}
function sL(t) {
  for (var e = null; t !== null; )
    t instanceof ShadowRoot && (e = t.host, t = t.host), t = t.parentNode;
  return e;
}
const oL = O2(BT, iL);
var WT = k.forwardRef(function(t, e) {
  return k.createElement(Qc, er({}, t, { ref: e, sideCar: oL }));
});
WT.classNames = Qc.classNames;
var aL = function(t) {
  if (typeof document > "u")
    return null;
  var e = Array.isArray(t) ? t[0] : t;
  return e.ownerDocument.body;
}, Is = /* @__PURE__ */ new WeakMap(), zu = /* @__PURE__ */ new WeakMap(), Uu = {}, Rh = 0, GT = function(t) {
  return t && (t.host || GT(t.parentNode));
}, lL = function(t, e) {
  return e.map(function(n) {
    if (t.contains(n))
      return n;
    var r = GT(n);
    return r && t.contains(r) ? r : (console.error("aria-hidden", n, "in not contained inside", t, ". Doing nothing"), null);
  }).filter(function(n) {
    return !!n;
  });
}, uL = function(t, e, n, r) {
  var s = lL(e, Array.isArray(t) ? t : [t]);
  Uu[n] || (Uu[n] = /* @__PURE__ */ new WeakMap());
  var a = Uu[n], l = [], c = /* @__PURE__ */ new Set(), d = new Set(s), m = function(f) {
    !f || c.has(f) || (c.add(f), m(f.parentNode));
  };
  s.forEach(m);
  var y = function(f) {
    !f || d.has(f) || Array.prototype.forEach.call(f.children, function(p) {
      if (c.has(p))
        y(p);
      else
        try {
          var g = p.getAttribute(r), S = g !== null && g !== "false", _ = (Is.get(p) || 0) + 1, x = (a.get(p) || 0) + 1;
          Is.set(p, _), a.set(p, x), l.push(p), _ === 1 && S && zu.set(p, !0), x === 1 && p.setAttribute(n, "true"), S || p.setAttribute(r, "true");
        } catch (T) {
          console.error("aria-hidden: cannot operate on ", p, T);
        }
    });
  };
  return y(e), c.clear(), Rh++, function() {
    l.forEach(function(f) {
      var p = Is.get(f) - 1, g = a.get(f) - 1;
      Is.set(f, p), a.set(f, g), p || (zu.has(f) || f.removeAttribute(r), zu.delete(f)), g || f.removeAttribute(n);
    }), Rh--, Rh || (Is = /* @__PURE__ */ new WeakMap(), Is = /* @__PURE__ */ new WeakMap(), zu = /* @__PURE__ */ new WeakMap(), Uu = {});
  };
}, cL = function(t, e, n) {
  n === void 0 && (n = "data-aria-hidden");
  var r = Array.from(Array.isArray(t) ? t : [t]), s = aL(t);
  return s ? (r.push.apply(r, Array.from(s.querySelectorAll("[aria-live], script"))), uL(r, s, n, "aria-hidden")) : function() {
    return null;
  };
}, Yc = "Dialog", [KT] = cl(Yc), [fL, Vn] = KT(Yc), QT = (t) => {
  const {
    __scopeDialog: e,
    children: n,
    open: r,
    defaultOpen: s,
    onOpenChange: a,
    modal: l = !0
  } = t, c = k.useRef(null), d = k.useRef(null), [m, y] = Kc({
    prop: r,
    defaultProp: s ?? !1,
    onChange: a,
    caller: Yc
  });
  return /* @__PURE__ */ C.jsx(
    fL,
    {
      scope: e,
      triggerRef: c,
      contentRef: d,
      contentId: Aa(),
      titleId: Aa(),
      descriptionId: Aa(),
      open: m,
      onOpenChange: y,
      onOpenToggle: k.useCallback(() => y((f) => !f), [y]),
      modal: l,
      children: n
    }
  );
};
QT.displayName = Yc;
var YT = "DialogTrigger", dL = k.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Vn(YT, n), a = It(e, s.triggerRef);
    return /* @__PURE__ */ C.jsx(
      it.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": s.open,
        "aria-controls": s.open ? s.contentId : void 0,
        "data-state": oy(s.open),
        ...r,
        ref: a,
        onClick: Qe(t.onClick, s.onOpenToggle)
      }
    );
  }
);
dL.displayName = YT;
var iy = "DialogPortal", [hL, XT] = KT(iy, {
  forceMount: void 0
}), qT = (t) => {
  const { __scopeDialog: e, forceMount: n, children: r, container: s } = t, a = Vn(iy, e);
  return /* @__PURE__ */ C.jsx(hL, { scope: e, forceMount: n, children: k.Children.map(r, (l) => /* @__PURE__ */ C.jsx(fl, { present: n || a.open, children: /* @__PURE__ */ C.jsx(LT, { asChild: !0, container: s, children: l }) })) });
};
qT.displayName = iy;
var Rc = "DialogOverlay", ZT = k.forwardRef(
  (t, e) => {
    const n = XT(Rc, t.__scopeDialog), { forceMount: r = n.forceMount, ...s } = t, a = Vn(Rc, t.__scopeDialog);
    return a.modal ? /* @__PURE__ */ C.jsx(fl, { present: r || a.open, children: /* @__PURE__ */ C.jsx(mL, { ...s, ref: e }) }) : null;
  }
);
ZT.displayName = Rc;
var pL = /* @__PURE__ */ bc("DialogOverlay.RemoveScroll"), mL = k.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Vn(Rc, n);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ C.jsx(WT, { as: pL, allowPinchZoom: !0, shards: [s.contentRef], children: /* @__PURE__ */ C.jsx(
        it.div,
        {
          "data-state": oy(s.open),
          ...r,
          ref: e,
          style: { pointerEvents: "auto", ...r.style }
        }
      ) })
    );
  }
), ss = "DialogContent", JT = k.forwardRef(
  (t, e) => {
    const n = XT(ss, t.__scopeDialog), { forceMount: r = n.forceMount, ...s } = t, a = Vn(ss, t.__scopeDialog);
    return /* @__PURE__ */ C.jsx(fl, { present: r || a.open, children: a.modal ? /* @__PURE__ */ C.jsx(yL, { ...s, ref: e }) : /* @__PURE__ */ C.jsx(gL, { ...s, ref: e }) });
  }
);
JT.displayName = ss;
var yL = k.forwardRef(
  (t, e) => {
    const n = Vn(ss, t.__scopeDialog), r = k.useRef(null), s = It(e, n.contentRef, r);
    return k.useEffect(() => {
      const a = r.current;
      if (a) return cL(a);
    }, []), /* @__PURE__ */ C.jsx(
      eC,
      {
        ...t,
        ref: s,
        trapFocus: n.open,
        disableOutsidePointerEvents: n.open,
        onCloseAutoFocus: Qe(t.onCloseAutoFocus, (a) => {
          var l;
          a.preventDefault(), (l = n.triggerRef.current) == null || l.focus();
        }),
        onPointerDownOutside: Qe(t.onPointerDownOutside, (a) => {
          const l = a.detail.originalEvent, c = l.button === 0 && l.ctrlKey === !0;
          (l.button === 2 || c) && a.preventDefault();
        }),
        onFocusOutside: Qe(
          t.onFocusOutside,
          (a) => a.preventDefault()
        )
      }
    );
  }
), gL = k.forwardRef(
  (t, e) => {
    const n = Vn(ss, t.__scopeDialog), r = k.useRef(!1), s = k.useRef(!1);
    return /* @__PURE__ */ C.jsx(
      eC,
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
          var d, m;
          (d = t.onInteractOutside) == null || d.call(t, a), a.defaultPrevented || (r.current = !0, a.detail.originalEvent.type === "pointerdown" && (s.current = !0));
          const l = a.target;
          ((m = n.triggerRef.current) == null ? void 0 : m.contains(l)) && a.preventDefault(), a.detail.originalEvent.type === "focusin" && s.current && a.preventDefault();
        }
      }
    );
  }
), eC = k.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: s, onCloseAutoFocus: a, ...l } = t, c = Vn(ss, n), d = k.useRef(null), m = It(e, d);
    return C2(), /* @__PURE__ */ C.jsxs(C.Fragment, { children: [
      /* @__PURE__ */ C.jsx(
        IT,
        {
          asChild: !0,
          loop: !0,
          trapped: r,
          onMountAutoFocus: s,
          onUnmountAutoFocus: a,
          children: /* @__PURE__ */ C.jsx(
            FT,
            {
              role: "dialog",
              id: c.contentId,
              "aria-describedby": c.descriptionId,
              "aria-labelledby": c.titleId,
              "data-state": oy(c.open),
              ...l,
              ref: m,
              onDismiss: () => c.onOpenChange(!1)
            }
          )
        }
      ),
      /* @__PURE__ */ C.jsxs(C.Fragment, { children: [
        /* @__PURE__ */ C.jsx(vL, { titleId: c.titleId }),
        /* @__PURE__ */ C.jsx(wL, { contentRef: d, descriptionId: c.descriptionId })
      ] })
    ] });
  }
), sy = "DialogTitle", tC = k.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Vn(sy, n);
    return /* @__PURE__ */ C.jsx(it.h2, { id: s.titleId, ...r, ref: e });
  }
);
tC.displayName = sy;
var nC = "DialogDescription", rC = k.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Vn(nC, n);
    return /* @__PURE__ */ C.jsx(it.p, { id: s.descriptionId, ...r, ref: e });
  }
);
rC.displayName = nC;
var iC = "DialogClose", sC = k.forwardRef(
  (t, e) => {
    const { __scopeDialog: n, ...r } = t, s = Vn(iC, n);
    return /* @__PURE__ */ C.jsx(
      it.button,
      {
        type: "button",
        ...r,
        ref: e,
        onClick: Qe(t.onClick, () => s.onOpenChange(!1))
      }
    );
  }
);
sC.displayName = iC;
function oy(t) {
  return t ? "open" : "closed";
}
var oC = "DialogTitleWarning", [GV, aC] = XN(oC, {
  contentName: ss,
  titleName: sy,
  docsSlug: "dialog"
}), vL = ({ titleId: t }) => {
  const e = aC(oC), n = `\`${e.contentName}\` requires a \`${e.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${e.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${e.docsSlug}`;
  return k.useEffect(() => {
    t && (document.getElementById(t) || console.error(n));
  }, [n, t]), null;
}, _L = "DialogDescriptionWarning", wL = ({ contentRef: t, descriptionId: e }) => {
  const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${aC(_L).contentName}}.`;
  return k.useEffect(() => {
    var a;
    const s = (a = t.current) == null ? void 0 : a.getAttribute("aria-describedby");
    e && s && (document.getElementById(e) || console.warn(r));
  }, [r, t, e]), null;
}, lC = QT, uC = qT, cC = ZT, fC = JT, dC = tC, hC = rC, SL = sC;
function xL(t) {
  const e = k.useRef({ value: t, previous: t });
  return k.useMemo(() => (e.current.value !== t && (e.current.previous = e.current.value, e.current.value = t), e.current.previous), [t]);
}
function TL(t) {
  const [e, n] = k.useState(void 0);
  return go(() => {
    if (t) {
      n({ width: t.offsetWidth, height: t.offsetHeight });
      const r = new ResizeObserver((s) => {
        if (!Array.isArray(s) || !s.length)
          return;
        const a = s[0];
        let l, c;
        if ("borderBoxSize" in a) {
          const d = a.borderBoxSize, m = Array.isArray(d) ? d[0] : d;
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
var Mh = "rovingFocusGroup.onEntryFocus", CL = { bubbles: !1, cancelable: !0 }, dl = "RovingFocusGroup", [Fp, pC, kL] = MT(dl), [PL, mC] = cl(
  dl,
  [kL]
), [EL, AL] = PL(dl), yC = k.forwardRef(
  (t, e) => /* @__PURE__ */ C.jsx(Fp.Provider, { scope: t.__scopeRovingFocusGroup, children: /* @__PURE__ */ C.jsx(Fp.Slot, { scope: t.__scopeRovingFocusGroup, children: /* @__PURE__ */ C.jsx(bL, { ...t, ref: e }) }) })
);
yC.displayName = dl;
var bL = k.forwardRef((t, e) => {
  const {
    __scopeRovingFocusGroup: n,
    orientation: r,
    loop: s = !1,
    dir: a,
    currentTabStopId: l,
    defaultCurrentTabStopId: c,
    onCurrentTabStopIdChange: d,
    onEntryFocus: m,
    preventScrollOnEntryFocus: y = !1,
    ...f
  } = t, p = k.useRef(null), g = It(e, p), S = ry(a), [_, x] = Kc({
    prop: l,
    defaultProp: c ?? null,
    onChange: d,
    caller: dl
  }), [T, E] = k.useState(!1), A = vo(m), b = pC(n), M = k.useRef(!1), [B, I] = k.useState(0);
  return k.useEffect(() => {
    const O = p.current;
    if (O)
      return O.addEventListener(Mh, A), () => O.removeEventListener(Mh, A);
  }, [A]), /* @__PURE__ */ C.jsx(
    EL,
    {
      scope: n,
      orientation: r,
      dir: S,
      loop: s,
      currentTabStopId: _,
      onItemFocus: k.useCallback(
        (O) => x(O),
        [x]
      ),
      onItemShiftTab: k.useCallback(() => E(!0), []),
      onFocusableItemAdd: k.useCallback(
        () => I((O) => O + 1),
        []
      ),
      onFocusableItemRemove: k.useCallback(
        () => I((O) => O - 1),
        []
      ),
      children: /* @__PURE__ */ C.jsx(
        it.div,
        {
          tabIndex: T || B === 0 ? -1 : 0,
          "data-orientation": r,
          ...f,
          ref: g,
          style: { outline: "none", ...t.style },
          onMouseDown: Qe(t.onMouseDown, () => {
            M.current = !0;
          }),
          onFocus: Qe(t.onFocus, (O) => {
            const L = !M.current;
            if (O.target === O.currentTarget && L && !T) {
              const $ = new CustomEvent(Mh, CL);
              if (O.currentTarget.dispatchEvent($), !$.defaultPrevented) {
                const q = b().filter((fe) => fe.focusable), J = q.find((fe) => fe.active), ie = q.find((fe) => fe.id === _), ue = [J, ie, ...q].filter(
                  Boolean
                ).map((fe) => fe.ref.current);
                _C(ue, y);
              }
            }
            M.current = !1;
          }),
          onBlur: Qe(t.onBlur, () => E(!1))
        }
      )
    }
  );
}), gC = "RovingFocusGroupItem", vC = k.forwardRef(
  (t, e) => {
    const {
      __scopeRovingFocusGroup: n,
      focusable: r = !0,
      active: s = !1,
      tabStopId: a,
      children: l,
      ...c
    } = t, d = Aa(), m = a || d, y = AL(gC, n), f = y.currentTabStopId === m, p = pC(n), { onFocusableItemAdd: g, onFocusableItemRemove: S, currentTabStopId: _ } = y;
    return k.useEffect(() => {
      if (r)
        return g(), () => S();
    }, [r, g, S]), /* @__PURE__ */ C.jsx(
      Fp.ItemSlot,
      {
        scope: n,
        id: m,
        focusable: r,
        active: s,
        children: /* @__PURE__ */ C.jsx(
          it.span,
          {
            tabIndex: f ? 0 : -1,
            "data-orientation": y.orientation,
            ...c,
            ref: e,
            onMouseDown: Qe(t.onMouseDown, (x) => {
              r ? y.onItemFocus(m) : x.preventDefault();
            }),
            onFocus: Qe(t.onFocus, () => y.onItemFocus(m)),
            onKeyDown: Qe(t.onKeyDown, (x) => {
              if (x.key === "Tab" && x.shiftKey) {
                y.onItemShiftTab();
                return;
              }
              if (x.target !== x.currentTarget) return;
              const T = DL(x, y.orientation, y.dir);
              if (T !== void 0) {
                if (x.metaKey || x.ctrlKey || x.altKey || x.shiftKey) return;
                x.preventDefault();
                let A = p().filter((b) => b.focusable).map((b) => b.ref.current);
                if (T === "last") A.reverse();
                else if (T === "prev" || T === "next") {
                  T === "prev" && A.reverse();
                  const b = A.indexOf(x.currentTarget);
                  A = y.loop ? FL(A, b + 1) : A.slice(b + 1);
                }
                setTimeout(() => _C(A));
              }
            }),
            children: typeof l == "function" ? l({ isCurrentTabStop: f, hasTabStop: _ != null }) : l
          }
        )
      }
    );
  }
);
vC.displayName = gC;
var RL = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function ML(t, e) {
  return e !== "rtl" ? t : t === "ArrowLeft" ? "ArrowRight" : t === "ArrowRight" ? "ArrowLeft" : t;
}
function DL(t, e, n) {
  const r = ML(t.key, n);
  if (!(e === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(e === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r)))
    return RL[r];
}
function _C(t, e = !1) {
  const n = document.activeElement;
  for (const r of t)
    if (r === n || (r.focus({ preventScroll: e }), document.activeElement !== n)) return;
}
function FL(t, e) {
  return t.map((n, r) => t[(e + r) % t.length]);
}
var OL = yC, IL = vC;
function wC(t, [e, n]) {
  return Math.min(n, Math.max(e, t));
}
var SC = ["PageUp", "PageDown"], xC = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], TC = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, Co = "Slider", [Op, NL, LL] = MT(Co), [ay] = cl(Co, [
  LL
]), [jL, hl] = ay(Co), CC = k.forwardRef(
  (t, e) => {
    const {
      name: n,
      min: r = 0,
      max: s = 100,
      step: a = 1,
      orientation: l = "horizontal",
      disabled: c = !1,
      minStepsBetweenThumbs: d = 0,
      defaultValue: m = [r],
      value: y,
      onValueChange: f = () => {
      },
      onValueCommit: p = () => {
      },
      inverted: g = !1,
      form: S,
      ..._
    } = t, x = k.useRef(/* @__PURE__ */ new Set()), T = k.useRef(0), E = k.useRef(!1), b = l === "horizontal" ? VL : BL, [M = [], B] = Kc({
      prop: y,
      defaultProp: m,
      onChange: (J) => {
        var re;
        (re = [...x.current][T.current]) == null || re.focus({
          preventScroll: !0,
          focusVisible: E.current
        }), E.current = !1, f(J);
      }
    }), I = k.useRef(M);
    function O(J) {
      const ie = HL(M, J);
      q(J, ie);
    }
    function L(J) {
      q(J, T.current);
    }
    function $() {
      const J = I.current[T.current];
      M[T.current] !== J && p(M);
    }
    function q(J, ie, { commit: re } = { commit: !1 }) {
      const ue = QL(a), fe = YL(Math.round((J - r) / a) * a + r, ue), me = wC(fe, [r, s]);
      B((W = []) => {
        const ee = UL(W, me, ie);
        if (KL(ee, d * a)) {
          T.current = ee.indexOf(me);
          const Z = String(ee) !== String(W);
          return Z && re && p(ee), Z ? ee : W;
        } else
          return W;
      });
    }
    return /* @__PURE__ */ C.jsx(
      jL,
      {
        scope: t.__scopeSlider,
        name: n,
        disabled: c,
        min: r,
        max: s,
        valueIndexToChangeRef: T,
        thumbs: x.current,
        values: M,
        orientation: l,
        form: S,
        children: /* @__PURE__ */ C.jsx(Op.Provider, { scope: t.__scopeSlider, children: /* @__PURE__ */ C.jsx(Op.Slot, { scope: t.__scopeSlider, children: /* @__PURE__ */ C.jsx(
          b,
          {
            "aria-disabled": c,
            "data-disabled": c ? "" : void 0,
            ..._,
            ref: e,
            onPointerDown: Qe(_.onPointerDown, () => {
              c || (I.current = M, E.current = !1);
            }),
            min: r,
            max: s,
            inverted: g,
            onSlideStart: c ? void 0 : O,
            onSlideMove: c ? void 0 : L,
            onSlideEnd: c ? void 0 : $,
            onHomeKeyDown: () => {
              c || (E.current = !0, q(r, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              c || (E.current = !0, q(s, M.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: J, direction: ie }) => {
              if (!c) {
                E.current = !0;
                const fe = SC.includes(J.key) || J.shiftKey && xC.includes(J.key) ? 10 : 1, me = T.current, W = M[me], ee = a * fe * ie;
                q(W + ee, me, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
CC.displayName = Co;
var [kC, PC] = ay(Co, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), VL = k.forwardRef(
  (t, e) => {
    const {
      min: n,
      max: r,
      dir: s,
      inverted: a,
      onSlideStart: l,
      onSlideMove: c,
      onSlideEnd: d,
      onStepKeyDown: m,
      ...y
    } = t, [f, p] = k.useState(null), g = It(e, (A) => p(A)), S = k.useRef(void 0), _ = ry(s), x = _ === "ltr", T = x && !a || !x && a;
    function E(A) {
      const b = S.current || f.getBoundingClientRect(), M = [0, b.width], I = ly(M, T ? [n, r] : [r, n]);
      return S.current = b, I(A - b.left);
    }
    return /* @__PURE__ */ C.jsx(
      kC,
      {
        scope: t.__scopeSlider,
        startEdge: T ? "left" : "right",
        endEdge: T ? "right" : "left",
        direction: T ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ C.jsx(
          EC,
          {
            dir: _,
            "data-orientation": "horizontal",
            ...y,
            ref: g,
            style: {
              ...y.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (A) => {
              const b = E(A.clientX);
              l == null || l(b);
            },
            onSlideMove: (A) => {
              const b = E(A.clientX);
              c == null || c(b);
            },
            onSlideEnd: () => {
              S.current = void 0, d == null || d();
            },
            onStepKeyDown: (A) => {
              const M = TC[T ? "from-left" : "from-right"].includes(A.key);
              m == null || m({ event: A, direction: M ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), BL = k.forwardRef(
  (t, e) => {
    const {
      min: n,
      max: r,
      inverted: s,
      onSlideStart: a,
      onSlideMove: l,
      onSlideEnd: c,
      onStepKeyDown: d,
      ...m
    } = t, y = k.useRef(null), f = It(e, y), p = k.useRef(void 0), g = !s;
    function S(_) {
      const x = p.current || y.current.getBoundingClientRect(), T = [0, x.height], A = ly(T, g ? [r, n] : [n, r]);
      return p.current = x, A(_ - x.top);
    }
    return /* @__PURE__ */ C.jsx(
      kC,
      {
        scope: t.__scopeSlider,
        startEdge: g ? "bottom" : "top",
        endEdge: g ? "top" : "bottom",
        size: "height",
        direction: g ? 1 : -1,
        children: /* @__PURE__ */ C.jsx(
          EC,
          {
            "data-orientation": "vertical",
            ...m,
            ref: f,
            style: {
              ...m.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (_) => {
              const x = S(_.clientY);
              a == null || a(x);
            },
            onSlideMove: (_) => {
              const x = S(_.clientY);
              l == null || l(x);
            },
            onSlideEnd: () => {
              p.current = void 0, c == null || c();
            },
            onStepKeyDown: (_) => {
              const T = TC[g ? "from-bottom" : "from-top"].includes(_.key);
              d == null || d({ event: _, direction: T ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), EC = k.forwardRef(
  (t, e) => {
    const {
      __scopeSlider: n,
      onSlideStart: r,
      onSlideMove: s,
      onSlideEnd: a,
      onHomeKeyDown: l,
      onEndKeyDown: c,
      onStepKeyDown: d,
      ...m
    } = t, y = hl(Co, n);
    return /* @__PURE__ */ C.jsx(
      it.span,
      {
        ...m,
        ref: e,
        onKeyDown: Qe(t.onKeyDown, (f) => {
          f.key === "Home" ? (l(f), f.preventDefault()) : f.key === "End" ? (c(f), f.preventDefault()) : SC.concat(xC).includes(f.key) && (d(f), f.preventDefault());
        }),
        onPointerDown: Qe(t.onPointerDown, (f) => {
          const p = f.target;
          p.setPointerCapture(f.pointerId), f.preventDefault(), y.thumbs.has(p) ? p.focus({ preventScroll: !0, focusVisible: !1 }) : r(f);
        }),
        onPointerMove: Qe(t.onPointerMove, (f) => {
          f.target.hasPointerCapture(f.pointerId) && s(f);
        }),
        onPointerUp: Qe(t.onPointerUp, (f) => {
          const p = f.target;
          p.hasPointerCapture(f.pointerId) && (p.releasePointerCapture(f.pointerId), a(f));
        })
      }
    );
  }
), AC = "SliderTrack", bC = k.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = hl(AC, n);
    return /* @__PURE__ */ C.jsx(
      it.span,
      {
        "data-disabled": s.disabled ? "" : void 0,
        "data-orientation": s.orientation,
        ...r,
        ref: e
      }
    );
  }
);
bC.displayName = AC;
var Ip = "SliderRange", RC = k.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = hl(Ip, n), a = PC(Ip, n), l = k.useRef(null), c = It(e, l), d = s.values.length, m = s.values.map(
      (p) => VC(p, s.min, s.max)
    ), y = d > 1 ? Math.min(...m) : 0, f = 100 - Math.max(...m);
    return /* @__PURE__ */ C.jsx(
      it.span,
      {
        "data-orientation": s.orientation,
        "data-disabled": s.disabled ? "" : void 0,
        ...r,
        ref: c,
        style: {
          ...t.style,
          [a.startEdge]: y + "%",
          [a.endEdge]: f + "%"
        }
      }
    );
  }
);
RC.displayName = Ip;
var MC = "SliderThumb", [zL, DC] = ay(MC), FC = "SliderThumbProvider";
function OC(t) {
  const {
    __scopeSlider: e,
    name: n,
    children: r,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: s
  } = t, a = hl(FC, e), l = NL(e), [c, d] = k.useState(null), m = k.useMemo(
    () => c ? l().findIndex((x) => x.ref.current === c) : -1,
    [l, c]
  ), y = TL(c), f = c ? !!a.form || !!c.closest("form") : !0, p = a.values[m], g = n ?? (a.name ? a.name + (a.values.length > 1 ? "[]" : "") : void 0), S = p === void 0 ? 0 : VC(p, a.min, a.max);
  k.useEffect(() => {
    if (c)
      return a.thumbs.add(c), () => {
        a.thumbs.delete(c);
      };
  }, [c, a.thumbs]);
  const _ = {
    value: p,
    name: g,
    form: a.form,
    isFormControl: f,
    index: m,
    thumb: c,
    onThumbChange: d,
    percent: S,
    size: y
  };
  return /* @__PURE__ */ C.jsx(zL, { scope: e, ..._, children: XL(s) ? s(_) : r });
}
OC.displayName = FC;
var sc = "SliderThumbTrigger", IC = k.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, ...r } = t, s = hl(sc, n), a = PC(sc, n), { index: l, value: c, percent: d, size: m, onThumbChange: y } = DC(
      sc,
      n
    ), f = It(e, (_) => y(_)), p = $L(l, s.values.length), g = m == null ? void 0 : m[a.size], S = g ? WL(g, d, a.direction) : 0;
    return /* @__PURE__ */ C.jsx(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [a.startEdge]: `calc(${d}% + ${S}px)`
        },
        children: /* @__PURE__ */ C.jsx(Op.ItemSlot, { scope: n, children: /* @__PURE__ */ C.jsx(
          it.span,
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
            ref: f,
            style: c === void 0 ? { display: "none" } : t.style,
            onFocus: Qe(t.onFocus, () => {
              s.valueIndexToChangeRef.current = l;
            })
          }
        ) })
      }
    );
  }
);
IC.displayName = sc;
var NC = k.forwardRef(
  (t, e) => {
    const { __scopeSlider: n, name: r, ...s } = t;
    return /* @__PURE__ */ C.jsx(
      OC,
      {
        __scopeSlider: n,
        name: r,
        internal_do_not_use_render: ({ index: a, isFormControl: l }) => /* @__PURE__ */ C.jsxs(C.Fragment, { children: [
          /* @__PURE__ */ C.jsx(
            IC,
            {
              ...s,
              ref: e,
              __scopeSlider: n
            }
          ),
          l ? /* @__PURE__ */ C.jsx(
            jC,
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
NC.displayName = MC;
var LC = "SliderBubbleInput", jC = k.forwardRef(
  ({ __scopeSlider: t, ...e }, n) => {
    const { value: r, name: s, form: a } = DC(LC, t), l = k.useRef(null), c = It(l, n), d = xL(r);
    return k.useEffect(() => {
      const m = l.current;
      if (!m) return;
      const y = window.HTMLInputElement.prototype, p = Object.getOwnPropertyDescriptor(y, "value").set;
      if (d !== r && p) {
        const g = new Event("input", { bubbles: !0 });
        p.call(m, r), m.dispatchEvent(g);
      }
    }, [d, r]), /* @__PURE__ */ C.jsx(
      it.input,
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
jC.displayName = LC;
function UL(t = [], e, n) {
  const r = [...t];
  return r[n] = e, r.sort((s, a) => s - a);
}
function VC(t, e, n) {
  const a = 100 / (n - e) * (t - e);
  return wC(a, [0, 100]);
}
function $L(t, e) {
  return e > 2 ? `Value ${t + 1} of ${e}` : e === 2 ? ["Minimum", "Maximum"][t] : void 0;
}
function HL(t, e) {
  if (t.length === 1) return 0;
  const n = t.map((s) => Math.abs(s - e)), r = Math.min(...n);
  return n.indexOf(r);
}
function WL(t, e, n) {
  const r = t / 2, a = ly([0, 50], [0, r]);
  return (r - a(e) * n) * n;
}
function GL(t) {
  return t.slice(0, -1).map((e, n) => t[n + 1] - e);
}
function KL(t, e) {
  if (e > 0) {
    const n = GL(t);
    return Math.min(...n) >= e;
  }
  return !0;
}
function ly(t, e) {
  return (n) => {
    if (t[0] === t[1] || e[0] === e[1]) return e[0];
    const r = (e[1] - e[0]) / (t[1] - t[0]);
    return e[0] + r * (n - t[0]);
  };
}
function QL(t) {
  if (!Number.isFinite(t)) return 0;
  const e = t.toString();
  if (e.includes("e")) {
    const [r, s] = e.split("e"), a = r.split(".")[1] || "", l = Number(s);
    return Math.max(0, a.length - l);
  }
  const n = e.split(".")[1];
  return n ? n.length : 0;
}
function YL(t, e) {
  const n = Math.pow(10, e);
  return Math.round(t * n) / n;
}
function XL(t) {
  return typeof t == "function";
}
var Xc = "Tabs", [qL] = cl(Xc, [
  mC
]), BC = mC(), [ZL, uy] = qL(Xc), zC = k.forwardRef(
  (t, e) => {
    const {
      __scopeTabs: n,
      value: r,
      onValueChange: s,
      defaultValue: a,
      orientation: l = "horizontal",
      dir: c,
      activationMode: d = "automatic",
      ...m
    } = t, y = ry(c), [f, p] = Kc({
      prop: r,
      onChange: s,
      defaultProp: a ?? "",
      caller: Xc
    });
    return /* @__PURE__ */ C.jsx(
      ZL,
      {
        scope: n,
        baseId: Aa(),
        value: f,
        onValueChange: p,
        orientation: l,
        dir: y,
        activationMode: d,
        children: /* @__PURE__ */ C.jsx(
          it.div,
          {
            dir: y,
            "data-orientation": l,
            ...m,
            ref: e
          }
        )
      }
    );
  }
);
zC.displayName = Xc;
var UC = "TabsList", $C = k.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, loop: r = !0, ...s } = t, a = uy(UC, n), l = BC(n);
    return /* @__PURE__ */ C.jsx(
      OL,
      {
        asChild: !0,
        ...l,
        orientation: a.orientation,
        dir: a.dir,
        loop: r,
        children: /* @__PURE__ */ C.jsx(
          it.div,
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
$C.displayName = UC;
var HC = "TabsTrigger", WC = k.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, value: r, disabled: s = !1, ...a } = t, l = uy(HC, n), c = BC(n), d = QC(l.baseId, r), m = YC(l.baseId, r), y = r === l.value;
    return /* @__PURE__ */ C.jsx(
      IL,
      {
        asChild: !0,
        ...c,
        focusable: !s,
        active: y,
        children: /* @__PURE__ */ C.jsx(
          it.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": y,
            "aria-controls": m,
            "data-state": y ? "active" : "inactive",
            "data-disabled": s ? "" : void 0,
            disabled: s,
            id: d,
            ...a,
            ref: e,
            onMouseDown: Qe(t.onMouseDown, (f) => {
              !s && f.button === 0 && f.ctrlKey === !1 ? l.onValueChange(r) : f.preventDefault();
            }),
            onKeyDown: Qe(t.onKeyDown, (f) => {
              [" ", "Enter"].includes(f.key) && l.onValueChange(r);
            }),
            onFocus: Qe(t.onFocus, () => {
              const f = l.activationMode !== "manual";
              !y && !s && f && l.onValueChange(r);
            })
          }
        )
      }
    );
  }
);
WC.displayName = HC;
var GC = "TabsContent", KC = k.forwardRef(
  (t, e) => {
    const { __scopeTabs: n, value: r, forceMount: s, children: a, ...l } = t, c = uy(GC, n), d = QC(c.baseId, r), m = YC(c.baseId, r), y = r === c.value, f = k.useRef(y);
    return k.useEffect(() => {
      const p = requestAnimationFrame(() => f.current = !1);
      return () => cancelAnimationFrame(p);
    }, []), /* @__PURE__ */ C.jsx(fl, { present: s || y, children: ({ present: p }) => /* @__PURE__ */ C.jsx(
      it.div,
      {
        "data-state": y ? "active" : "inactive",
        "data-orientation": c.orientation,
        role: "tabpanel",
        "aria-labelledby": d,
        hidden: !p,
        id: m,
        tabIndex: 0,
        ...l,
        ref: e,
        style: {
          ...t.style,
          animationDuration: f.current ? "0s" : void 0
        },
        children: p && a
      }
    ) });
  }
);
KC.displayName = GC;
function QC(t, e) {
  return `${t}-trigger-${e}`;
}
function YC(t, e) {
  return `${t}-content-${e}`;
}
var JL = zC, ej = $C, tj = WC, nj = KC;
function Dw({ label: t, icon: e, value: n, onChange: r }) {
  return /* @__PURE__ */ C.jsxs("label", { className: "sound-slider", children: [
    /* @__PURE__ */ C.jsxs("span", { children: [
      e,
      t,
      " ",
      /* @__PURE__ */ C.jsxs("strong", { children: [
        n,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ C.jsxs(
      CC,
      {
        className: "radix-slider-root",
        value: [n],
        min: 0,
        max: 100,
        step: 1,
        onValueChange: (s) => r(s[0]),
        children: [
          /* @__PURE__ */ C.jsx(bC, { className: "radix-slider-track", children: /* @__PURE__ */ C.jsx(RC, { className: "radix-slider-range" }) }),
          /* @__PURE__ */ C.jsx(NC, { className: "radix-slider-thumb", "aria-label": t })
        ]
      }
    )
  ] });
}
function XC({ audioState: t }) {
  const e = Y((y) => y.musicType), n = Y((y) => y.ambientSound), r = Y((y) => y.musicVolume), s = Y((y) => y.ambientVolume), a = Y((y) => y.audioPlaying), l = Y((y) => y.setSound), c = Y((y) => y.toggleAudio), d = $c({ musicType: e, ambientSound: n }), m = d.ambientLayers.map((y) => y.title).filter(Boolean).join(" + ");
  return /* @__PURE__ */ C.jsxs("div", { className: "sound-panel", children: [
    /* @__PURE__ */ C.jsxs("label", { className: "focus-field", children: [
      "Music selector",
      /* @__PURE__ */ C.jsx("select", { value: e, onChange: (y) => l("musicType", y.target.value), children: xp.map((y) => /* @__PURE__ */ C.jsx("option", { value: y.label, children: y.label }, y.label)) })
    ] }),
    /* @__PURE__ */ C.jsx(
      Dw,
      {
        label: "Music volume",
        icon: /* @__PURE__ */ C.jsx(qI, { size: 16, "aria-hidden": "true" }),
        value: r,
        onChange: (y) => l("musicVolume", y)
      }
    ),
    /* @__PURE__ */ C.jsxs("label", { className: "focus-field", children: [
      "Ambient sound selector",
      /* @__PURE__ */ C.jsx("select", { value: n, onChange: (y) => l("ambientSound", y.target.value), children: Tp.map((y) => /* @__PURE__ */ C.jsx("option", { value: y.label, children: y.label }, y.label)) })
    ] }),
    /* @__PURE__ */ C.jsx(
      Dw,
      {
        label: "Ambient volume",
        icon: /* @__PURE__ */ C.jsx(JI, { size: 16, "aria-hidden": "true" }),
        value: s,
        onChange: (y) => l("ambientVolume", y)
      }
    ),
    /* @__PURE__ */ C.jsxs("div", { className: "audio-preview liquid-glass-lite", children: [
      /* @__PURE__ */ C.jsxs("div", { children: [
        /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Theme audio preview" }),
        /* @__PURE__ */ C.jsx("strong", { children: d.musicTrack.title }),
        /* @__PURE__ */ C.jsx("p", { children: m }),
        t != null && t.error ? /* @__PURE__ */ C.jsx("p", { className: "audio-error", children: t.error }) : null
      ] }),
      /* @__PURE__ */ C.jsx(_e, { variant: a ? "primary" : "ghost", onClick: c, children: a ? "Pause audio" : "Play audio" })
    ] }),
    /* @__PURE__ */ C.jsx("div", { className: "audio-links", children: [d.musicTrack, ...d.ambientLayers].filter((y) => y == null ? void 0 : y.pageUrl).map((y) => /* @__PURE__ */ C.jsx("a", { href: y.pageUrl, target: "_blank", rel: "noreferrer", children: y.title || y.label || "Audio source" }, y.pageUrl)) })
  ] });
}
function rj({ audioState: t, onWorkspace: e, onHistory: n }) {
  var y;
  const r = Y((f) => f.selectedMaterial), s = Y((f) => f.pomodoroDuration), a = Y((f) => f.studyGoal), l = Y((f) => f.studyPlan), c = Y((f) => f.setPomodoroDuration), d = Y((f) => f.setStudyGoal), m = Y((f) => f.startSession);
  return r ? /* @__PURE__ */ C.jsxs("section", { className: "focus-setup-stage", "aria-label": "Focus Room setup", children: [
    /* @__PURE__ */ C.jsxs(Ea, { className: "focus-setup-scenes", children: [
      /* @__PURE__ */ C.jsx("span", { className: "focus-step-label", children: "Step 01" }),
      /* @__PURE__ */ C.jsx("h1", { children: "Choose your study scene" }),
      /* @__PURE__ */ C.jsx("p", { children: "Pick the cinematic atmosphere that matches this focus block." }),
      /* @__PURE__ */ C.jsxs("article", { className: "material-strip liquid-glass-lite", children: [
        /* @__PURE__ */ C.jsx("span", { className: "focus-pill", children: r.materialType || "Study material" }),
        /* @__PURE__ */ C.jsxs("div", { children: [
          /* @__PURE__ */ C.jsx("strong", { children: r.materialTitle || "Study material" }),
          /* @__PURE__ */ C.jsx("p", { children: ((y = r.studyHeadings) == null ? void 0 : y.slice(0, 2).join(" / ")) || "Generated notes" })
        ] })
      ] }),
      /* @__PURE__ */ C.jsx(RT, {})
    ] }),
    /* @__PURE__ */ C.jsxs(Ea, { className: "focus-setup-controls", children: [
      /* @__PURE__ */ C.jsx("span", { className: "focus-step-label", children: "Step 02" }),
      /* @__PURE__ */ C.jsx("h2", { children: "Set sound atmosphere" }),
      /* @__PURE__ */ C.jsx(XC, { audioState: t }),
      /* @__PURE__ */ C.jsx("span", { className: "focus-step-label", children: "Step 03" }),
      /* @__PURE__ */ C.jsx("h2", { children: "Set Pomodoro" }),
      /* @__PURE__ */ C.jsx("div", { className: "duration-grid", "aria-label": "Pomodoro duration", children: _T.map((f) => /* @__PURE__ */ C.jsxs(
        _e,
        {
          variant: f === s ? "primary" : "ghost",
          "aria-pressed": f === s,
          onClick: () => c(f),
          children: [
            /* @__PURE__ */ C.jsx(RI, { size: 16, "aria-hidden": "true" }),
            " ",
            f,
            "m"
          ]
        },
        f
      )) }),
      /* @__PURE__ */ C.jsxs("label", { className: "focus-field", children: [
        "Custom duration",
        /* @__PURE__ */ C.jsx(
          "input",
          {
            type: "number",
            min: "10",
            max: "180",
            step: "5",
            value: s,
            onChange: (f) => c(f.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ C.jsxs("label", { className: "focus-field", children: [
        "Study goal",
        /* @__PURE__ */ C.jsx("textarea", { value: a, onChange: (f) => d(f.target.value) })
      ] }),
      /* @__PURE__ */ C.jsxs("div", { className: "plan-preview liquid-glass-lite", children: [
        /* @__PURE__ */ C.jsx("h3", { children: "Study plan" }),
        /* @__PURE__ */ C.jsx("ul", { className: "plan-list", children: l.map((f, p) => /* @__PURE__ */ C.jsxs("li", { children: [
          /* @__PURE__ */ C.jsxs("strong", { children: [
            f.minutes,
            "m"
          ] }),
          /* @__PURE__ */ C.jsx("span", { children: f.task })
        ] }, `${f.task}-${p}`)) })
      ] }),
      /* @__PURE__ */ C.jsxs(_e, { className: "enter-focus-btn", variant: "primary", onClick: m, children: [
        /* @__PURE__ */ C.jsx(GI, { size: 18, "aria-hidden": "true" }),
        " Enter Focus Room"
      ] })
    ] })
  ] }) : /* @__PURE__ */ C.jsx("section", { className: "focus-empty-stage", children: /* @__PURE__ */ C.jsxs(Ea, { className: "focus-empty-card", children: [
    /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Ready when you are" }),
    /* @__PURE__ */ C.jsx("h1", { children: "Waiting for material" }),
    /* @__PURE__ */ C.jsx("p", { children: "Generate or select study notes in the workspace, then open the Focus Room again." }),
    /* @__PURE__ */ C.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ C.jsx(_e, { variant: "primary", onClick: () => e(), children: "Open Workspace" }),
      /* @__PURE__ */ C.jsx(_e, { onClick: n, children: "Study History" })
    ] })
  ] }) });
}
function ij(t) {
  return t === "paused" ? "Resume" : t === "completed" ? "Restart" : "Start";
}
function sj() {
  const t = Y((S) => S.elapsedSeconds), e = Y((S) => S.pomodoroDuration), n = Y((S) => S.timerStatus), r = Y((S) => S.isIdle), s = Y((S) => S.musicType), a = Y((S) => S.ambientSound), l = Y((S) => S.startTimer), c = Y((S) => S.pauseTimer), d = Y((S) => S.resetTimer), m = Y((S) => S.skipTimer), y = Math.max(0, e * 60 - t), f = SN(t, e), p = r ? 0.96 : 1, g = n === "studying" ? { scale: [p, p + 0.012, p] } : { scale: p };
  return /* @__PURE__ */ C.jsxs(
    Ot.article,
    {
      className: "timer-card liquid-glass",
      animate: g,
      transition: n === "studying" ? { duration: 4, repeat: 1 / 0, ease: "easeInOut" } : { duration: 0.2 },
      children: [
        /* @__PURE__ */ C.jsxs("span", { className: "focus-kicker", children: [
          "Pomodoro #1 / ",
          n
        ] }),
        /* @__PURE__ */ C.jsxs("p", { className: "focus-pill", children: [
          s,
          " / ",
          a
        ] }),
        /* @__PURE__ */ C.jsx("div", { className: "timer-value", "aria-live": "polite", children: xN(y) }),
        /* @__PURE__ */ C.jsxs("p", { children: [
          Wc(t),
          " focused of ",
          e,
          "m"
        ] }),
        /* @__PURE__ */ C.jsx("div", { className: "focus-progress-track", "aria-label": "Focus progress", children: /* @__PURE__ */ C.jsx("div", { className: "focus-progress-fill", style: { width: `${f.toFixed(1)}%` } }) }),
        /* @__PURE__ */ C.jsxs("div", { className: "timer-actions", children: [
          /* @__PURE__ */ C.jsxs(_e, { variant: n === "studying" ? "primary" : "ghost", onClick: l, children: [
            /* @__PURE__ */ C.jsx(hT, { size: 16, "aria-hidden": "true" }),
            " ",
            ij(n)
          ] }),
          /* @__PURE__ */ C.jsx(_e, { onClick: () => c(), children: "Pause" }),
          /* @__PURE__ */ C.jsxs(_e, { onClick: d, children: [
            /* @__PURE__ */ C.jsx(pT, { size: 16, "aria-hidden": "true" }),
            " Reset"
          ] }),
          /* @__PURE__ */ C.jsxs(_e, { onClick: m, children: [
            /* @__PURE__ */ C.jsx(mT, { size: 16, "aria-hidden": "true" }),
            " Skip"
          ] })
        ] })
      ]
    }
  );
}
function oj() {
  return /* @__PURE__ */ C.jsx(sj, {});
}
function aj({ onWorkspace: t, onHistory: e }) {
  const n = Y((d) => d.selectedMaterial), r = Y((d) => d.selectedScene), s = Y((d) => d.openDrawer), a = Y((d) => d.toggleAIPanel), l = Y((d) => d.endSession), c = $a(r);
  return /* @__PURE__ */ C.jsxs("header", { className: "top-nav", children: [
    /* @__PURE__ */ C.jsxs("div", { className: "focus-brand", children: [
      /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Synapse Focus Room" }),
      /* @__PURE__ */ C.jsx("strong", { children: c.name }),
      /* @__PURE__ */ C.jsx("small", { children: (n == null ? void 0 : n.materialTitle) || "Study material" })
    ] }),
    /* @__PURE__ */ C.jsxs("nav", { className: "top-nav-actions", "aria-label": "Focus Room controls", children: [
      /* @__PURE__ */ C.jsxs(_e, { onClick: () => s("scene"), children: [
        /* @__PURE__ */ C.jsx(OI, { size: 16, "aria-hidden": "true" }),
        " Scene"
      ] }),
      /* @__PURE__ */ C.jsxs(_e, { onClick: () => s("music"), children: [
        /* @__PURE__ */ C.jsx(jI, { size: 16, "aria-hidden": "true" }),
        " Music"
      ] }),
      /* @__PURE__ */ C.jsxs(_e, { onClick: () => s("plan"), children: [
        /* @__PURE__ */ C.jsx(YI, { size: 16, "aria-hidden": "true" }),
        " Plan"
      ] }),
      /* @__PURE__ */ C.jsxs(_e, { onClick: () => s("materials"), children: [
        /* @__PURE__ */ C.jsx(NI, { size: 16, "aria-hidden": "true" }),
        " Materials"
      ] }),
      /* @__PURE__ */ C.jsxs(_e, { onClick: a, children: [
        /* @__PURE__ */ C.jsx(AI, { size: 16, "aria-hidden": "true" }),
        " AI Learning Panel"
      ] }),
      /* @__PURE__ */ C.jsxs(_e, { onClick: () => t(), children: [
        /* @__PURE__ */ C.jsx(BI, { size: 16, "aria-hidden": "true" }),
        " Workspace"
      ] }),
      /* @__PURE__ */ C.jsxs(_e, { onClick: e, children: [
        /* @__PURE__ */ C.jsx(DI, { size: 16, "aria-hidden": "true" }),
        " Study History"
      ] }),
      /* @__PURE__ */ C.jsxs(_e, { variant: "danger", onClick: l, children: [
        /* @__PURE__ */ C.jsx(yT, { size: 16, "aria-hidden": "true" }),
        " End"
      ] })
    ] })
  ] });
}
function lj({ audioState: t }) {
  const e = Y((m) => m.audioPlaying), n = Y((m) => m.toggleAudio), r = Y((m) => m.pauseTimer), s = Y((m) => m.resetTimer), a = Y((m) => m.skipTimer), l = Y((m) => m.endSession), c = Y((m) => m.musicVolume), d = Y((m) => m.ambientVolume);
  return /* @__PURE__ */ C.jsxs("div", { className: "bottom-dock liquid-glass", "aria-label": "Floating session controls", children: [
    /* @__PURE__ */ C.jsxs("span", { className: "dock-meter", children: [
      "Music ",
      c,
      "%"
    ] }),
    /* @__PURE__ */ C.jsxs("span", { className: "dock-meter", children: [
      "Ambient ",
      d,
      "%"
    ] }),
    /* @__PURE__ */ C.jsxs(_e, { variant: e ? "primary" : "ghost", onClick: n, children: [
      e ? /* @__PURE__ */ C.jsx(fw, { size: 16, "aria-hidden": "true" }) : /* @__PURE__ */ C.jsx(hT, { size: 16, "aria-hidden": "true" }),
      t != null && t.playing ? "Pause" : "Audio"
    ] }),
    /* @__PURE__ */ C.jsxs(_e, { onClick: () => r(), children: [
      /* @__PURE__ */ C.jsx(fw, { size: 16, "aria-hidden": "true" }),
      " Timer"
    ] }),
    /* @__PURE__ */ C.jsxs(_e, { onClick: a, children: [
      /* @__PURE__ */ C.jsx(mT, { size: 16, "aria-hidden": "true" }),
      " Skip"
    ] }),
    /* @__PURE__ */ C.jsxs(_e, { onClick: s, children: [
      /* @__PURE__ */ C.jsx(pT, { size: 16, "aria-hidden": "true" }),
      " Reset"
    ] }),
    /* @__PURE__ */ C.jsxs(_e, { variant: "danger", onClick: l, children: [
      /* @__PURE__ */ C.jsx(yT, { size: 16, "aria-hidden": "true" }),
      " End"
    ] })
  ] });
}
const uj = [
  "Explain this topic more simply.",
  "Test me on this section.",
  "What should I study next?"
];
function cj() {
  const [t, e] = k.useState(""), n = Y((c) => c.chatMessages), r = Y((c) => c.chatPending), s = Y((c) => c.chatError), a = Y((c) => c.askAssistant), l = (c) => {
    a(c), e("");
  };
  return /* @__PURE__ */ C.jsxs("article", { className: "chat-panel", children: [
    /* @__PURE__ */ C.jsxs("div", { className: "chat-list", children: [
      n.length ? n.map((c, d) => /* @__PURE__ */ C.jsxs("div", { className: `chat-message ${c.role}`, children: [
        /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: c.role === "user" ? "You" : "Synapse" }),
        /* @__PURE__ */ C.jsx("p", { children: c.text })
      ] }, `${c.createdAt}-${d}`)) : /* @__PURE__ */ C.jsx("p", { children: "Try: Explain this topic more simply." }),
      r ? /* @__PURE__ */ C.jsxs("div", { className: "chat-message assistant", children: [
        /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Synapse" }),
        /* @__PURE__ */ C.jsx("p", { children: "Thinking..." })
      ] }) : null
    ] }),
    s ? /* @__PURE__ */ C.jsx("p", { className: "audio-error", children: s }) : null,
    /* @__PURE__ */ C.jsx(
      "textarea",
      {
        className: "answer-input",
        placeholder: "Ask about this material...",
        value: t,
        onChange: (c) => e(c.target.value)
      }
    ),
    /* @__PURE__ */ C.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ C.jsx(_e, { variant: "primary", disabled: r || !t.trim(), onClick: () => l(t), children: "Ask" }),
      uj.map((c) => /* @__PURE__ */ C.jsx(_e, { disabled: r, onClick: () => l(c), children: c }, c))
    ] })
  ] });
}
function fj({ cards: t }) {
  const e = Y((S) => S.flashcardIndex), n = Y((S) => S.flashcardSide), r = Y((S) => S.flashcardProgress), s = Y((S) => S.setFlashcardIndex), a = Y((S) => S.flipFlashcard), l = Y((S) => S.rateFlashcard), c = Y((S) => Object.values(S.flashcardProgress || {}).filter((_) => _ && _.difficulty).length), d = t.length, m = Math.min(Math.max(e, 0), Math.max(0, d - 1)), y = t[m], f = PT(y, m), p = r[f] || {}, g = n === "back" ? "back" : "front";
  return /* @__PURE__ */ C.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ C.jsxs("span", { className: "focus-kicker", children: [
      "Card ",
      m + 1,
      " of ",
      d
    ] }),
    /* @__PURE__ */ C.jsx("h3", { children: g === "back" ? "Answer" : "Prompt" }),
    /* @__PURE__ */ C.jsx("p", { children: g === "back" ? kN(y) : CN(y, m) }),
    p.difficulty ? /* @__PURE__ */ C.jsxs("span", { className: "focus-pill", children: [
      "Marked ",
      p.difficulty
    ] }) : null,
    /* @__PURE__ */ C.jsxs("div", { className: "focus-button-row", children: [
      /* @__PURE__ */ C.jsx(_e, { disabled: m <= 0, onClick: () => s(m - 1), children: "Previous" }),
      /* @__PURE__ */ C.jsx(_e, { variant: "primary", onClick: a, children: g === "back" ? "Show Prompt" : "Reveal Answer" }),
      /* @__PURE__ */ C.jsx(_e, { disabled: m >= d - 1, onClick: () => s(m + 1), children: "Next" })
    ] }),
    /* @__PURE__ */ C.jsx("div", { className: "focus-button-row", children: ["easy", "medium", "hard"].map((S) => /* @__PURE__ */ C.jsxs(
      _e,
      {
        variant: p.difficulty === S ? "primary" : "ghost",
        onClick: () => l(S),
        children: [
          "Mark ",
          S
        ]
      },
      S
    )) }),
    /* @__PURE__ */ C.jsxs("p", { children: [
      c,
      " completed in this material."
    ] })
  ] });
}
function dj({ mindMap: t }) {
  if (!t)
    return /* @__PURE__ */ C.jsx("p", { children: "No mind map is attached to this material yet. Return to the workspace and generate one from your notes." });
  const e = Array.isArray(t.branches) ? t.branches : [];
  return e.length ? /* @__PURE__ */ C.jsxs("div", { className: "mindmap-viewer", children: [
    /* @__PURE__ */ C.jsx("div", { className: "mindmap-center", children: t.center || "Study Notes" }),
    /* @__PURE__ */ C.jsx("div", { className: "mindmap-branches", children: e.slice(0, 10).map((n, r) => /* @__PURE__ */ C.jsxs("article", { className: "mindmap-branch liquid-glass-lite", children: [
      /* @__PURE__ */ C.jsx("strong", { children: n.title || `Branch ${r + 1}` }),
      /* @__PURE__ */ C.jsx("p", { children: n.summary || n.detail || "Open this branch in the workspace for more detail." })
    ] }, `${n.title || "Branch"}-${r}`)) })
  ] }) : /* @__PURE__ */ C.jsx("pre", { className: "mindmap-json", children: JSON.stringify(t, null, 2) });
}
function hj({ questions: t }) {
  const e = Y((l) => l.quizAnswers), n = Y((l) => l.quizChecked), r = Y((l) => l.answerQuizQuestion), s = Y((l) => l.checkQuizQuestion), a = Y((l) => {
    const c = Object.values(l.quizChecked || {}).filter((d) => d && d.hasKnownAnswer);
    return c.length ? Math.round(c.filter((d) => d.correct).length / c.length * 100) : null;
  });
  return /* @__PURE__ */ C.jsxs("div", { className: "quiz-stack", children: [
    a === null ? null : /* @__PURE__ */ C.jsxs("span", { className: "focus-pill", children: [
      "Current score ",
      a,
      "%"
    ] }),
    t.map((l, c) => {
      const d = e[c], m = n[c] || null, y = yo(l), f = typeof d == "string" ? d : "", p = MN(l, d);
      return /* @__PURE__ */ C.jsxs("article", { className: "quiz-card liquid-glass-lite", children: [
        /* @__PURE__ */ C.jsxs("span", { className: "focus-kicker", children: [
          l.quizTitle || "Quiz",
          " / Question ",
          c + 1
        ] }),
        /* @__PURE__ */ C.jsx("h3", { children: bp(l, c) }),
        y.length ? /* @__PURE__ */ C.jsx("div", { className: "focus-button-row", children: y.map((g, S) => /* @__PURE__ */ C.jsx(
          _e,
          {
            variant: DN(l, d, S) ? "primary" : "ghost",
            onClick: () => r(c, S),
            children: g
          },
          g
        )) }) : /* @__PURE__ */ C.jsx(
          "textarea",
          {
            className: "answer-input",
            value: f,
            onChange: (g) => r(c, g.target.value)
          }
        ),
        /* @__PURE__ */ C.jsx(_e, { variant: "primary", disabled: !p, onClick: () => s(c), children: "Check answer" }),
        m ? /* @__PURE__ */ C.jsxs("p", { children: [
          m.hasKnownAnswer ? m.correct ? "Correct" : "Review this one" : "Answer saved for review",
          m.explanation ? ` - ${m.explanation}` : ""
        ] }) : null
      ] }, `${bp(l, c)}-${c}`);
    })
  ] });
}
function Oi({ label: t, action: e, onWorkspace: n }) {
  const r = Y((s) => s.selectedMaterial);
  return /* @__PURE__ */ C.jsx("div", { className: "focus-button-row", children: /* @__PURE__ */ C.jsx(_e, { variant: "primary", onClick: () => n((r == null ? void 0 : r.materialId) || "", e), children: t }) });
}
function pj({ tab: t, onWorkspace: e }) {
  const n = Y((l) => l.selectedMaterial), r = Y((l) => l.studyPlan), s = (l) => {
    const c = l ? `/${encodeURIComponent(l)}` : "";
    globalThis.location.hash = `#/focus-room${c}`;
  };
  if (!n) return null;
  if (t === "materials") {
    const l = Hc();
    return /* @__PURE__ */ C.jsx("div", { className: "material-list", children: l.length ? l.map((c) => /* @__PURE__ */ C.jsxs("button", { className: "material-row liquid-glass-lite", type: "button", onClick: () => s(c.materialId), children: [
      /* @__PURE__ */ C.jsx("strong", { children: c.materialTitle || "Study material" }),
      /* @__PURE__ */ C.jsx("span", { children: c.materialType || "Generated notes" })
    ] }, c.materialId)) : /* @__PURE__ */ C.jsx("p", { children: "No Focus Room materials are available yet." }) });
  }
  if (t === "flashcards") {
    const l = Ap(n);
    return l.length ? /* @__PURE__ */ C.jsxs(C.Fragment, { children: [
      /* @__PURE__ */ C.jsx(fj, { cards: l }),
      /* @__PURE__ */ C.jsx(Oi, { label: "Open Flashcard Workspace", action: "flashcards", onWorkspace: e })
    ] }) : /* @__PURE__ */ C.jsxs("article", { className: "study-card liquid-glass-lite", children: [
      /* @__PURE__ */ C.jsx("h3", { children: "Flashcards" }),
      /* @__PURE__ */ C.jsx("p", { children: "No flashcards are attached to this material yet. Return to the workspace to generate a flashcard deck." }),
      /* @__PURE__ */ C.jsx(Oi, { label: "Open Flashcard Generator", action: "flashcards", onWorkspace: e })
    ] });
  }
  if (t === "quiz") {
    const l = Ec(n);
    return l.length ? /* @__PURE__ */ C.jsxs(C.Fragment, { children: [
      /* @__PURE__ */ C.jsx(hj, { questions: l }),
      /* @__PURE__ */ C.jsx(Oi, { label: "Open Quiz Workspace", action: "quiz", onWorkspace: e })
    ] }) : /* @__PURE__ */ C.jsxs("article", { className: "study-card liquid-glass-lite", children: [
      /* @__PURE__ */ C.jsx("h3", { children: "Quiz" }),
      /* @__PURE__ */ C.jsx("p", { children: "No saved quizzes are attached to this material yet. Return to the workspace to generate one." }),
      /* @__PURE__ */ C.jsx(Oi, { label: "Open Quiz Generator", action: "quiz", onWorkspace: e })
    ] });
  }
  if (t === "mindmap")
    return /* @__PURE__ */ C.jsxs("article", { className: "study-card liquid-glass-lite", children: [
      /* @__PURE__ */ C.jsx("h3", { children: "Mind Map" }),
      /* @__PURE__ */ C.jsx(dj, { mindMap: n.mindMap }),
      /* @__PURE__ */ C.jsx(Oi, { label: "Open Mind Map Workspace", action: "mindmap", onWorkspace: e })
    ] });
  if (t === "chat")
    return /* @__PURE__ */ C.jsxs(C.Fragment, { children: [
      /* @__PURE__ */ C.jsx(cj, {}),
      /* @__PURE__ */ C.jsx(Oi, { label: "Open Workspace Assistant", action: "assistant", onWorkspace: e })
    ] });
  if (t === "plan")
    return /* @__PURE__ */ C.jsxs("article", { className: "study-card liquid-glass-lite", children: [
      /* @__PURE__ */ C.jsx("h3", { children: "Study Plan" }),
      /* @__PURE__ */ C.jsx("ul", { className: "plan-list", children: r.map((l, c) => /* @__PURE__ */ C.jsxs("li", { children: [
        /* @__PURE__ */ C.jsxs("strong", { children: [
          l.minutes,
          "m"
        ] }),
        /* @__PURE__ */ C.jsx("span", { children: l.task })
      ] }, `${l.task}-${c}`)) }),
      /* @__PURE__ */ C.jsx(Oi, { label: "Open Timeline Workspace", action: "timeline", onWorkspace: e })
    ] });
  const a = String(n.summaryText || n.aiSummary || "").slice(0, 900);
  return /* @__PURE__ */ C.jsxs("article", { className: "study-card liquid-glass-lite", children: [
    /* @__PURE__ */ C.jsx("h3", { children: "Material summary" }),
    /* @__PURE__ */ C.jsx("p", { children: a || "Study notes will appear here when Synapse has generated them." })
  ] });
}
function mj({ onWorkspace: t }) {
  const e = Y((a) => a.aiPanelOpen), n = Y((a) => a.panelTab), r = Y((a) => a.toggleAIPanel), s = Y((a) => a.setPanelTab);
  return /* @__PURE__ */ C.jsx(lC, { open: e, onOpenChange: r, children: /* @__PURE__ */ C.jsx(mi, { children: e ? /* @__PURE__ */ C.jsxs(uC, { forceMount: !0, children: [
    /* @__PURE__ */ C.jsx(cC, { asChild: !0, children: /* @__PURE__ */ C.jsx(
      Ot.div,
      {
        className: "ai-panel-scrim",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ C.jsx(fC, { asChild: !0, children: /* @__PURE__ */ C.jsxs(
      Ot.aside,
      {
        className: "ai-learning-panel liquid-glass extra-panel",
        initial: { opacity: 0, x: 42 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 42 },
        transition: _r,
        children: [
          /* @__PURE__ */ C.jsxs("div", { className: "drawer-head", children: [
            /* @__PURE__ */ C.jsxs("div", { children: [
              /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Synapse" }),
              /* @__PURE__ */ C.jsx(dC, { children: "AI Learning Panel" }),
              /* @__PURE__ */ C.jsx(hC, { className: "sr-only", children: "Study the selected material with summary, flashcards, quiz, mind map, AI chat, and plan tabs." })
            ] }),
            /* @__PURE__ */ C.jsx(SL, { asChild: !0, children: /* @__PURE__ */ C.jsx(_e, { "aria-label": "Close AI Learning Panel", children: /* @__PURE__ */ C.jsx(al, { size: 16, "aria-hidden": "true" }) }) })
          ] }),
          /* @__PURE__ */ C.jsxs(JL, { className: "ai-tabs", value: n, onValueChange: s, children: [
            /* @__PURE__ */ C.jsx(ej, { className: "ai-tab-row", "aria-label": "AI Learning Panel tabs", children: Pp.map((a) => /* @__PURE__ */ C.jsx(tj, { className: "ai-tab-trigger", value: a, children: TN(a) }, a)) }),
            Pp.map((a) => /* @__PURE__ */ C.jsx(nj, { className: "ai-tab-content", value: a, children: /* @__PURE__ */ C.jsx(pj, { tab: a, onWorkspace: t }) }, a))
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
function yj() {
  const t = Y((l) => l.activeDrawer === "plan"), e = Y((l) => l.studyPlan), n = Y((l) => l.completedTasks), r = Y((l) => l.closeDrawer), s = Y((l) => l.updatePlanTask), a = Y((l) => l.toggleTask);
  return /* @__PURE__ */ C.jsx(mi, { children: t ? /* @__PURE__ */ C.jsxs(
    Ot.aside,
    {
      className: "extra-panel drawer-open liquid-glass",
      initial: { opacity: 0, x: 28 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 28 },
      transition: _r,
      "aria-label": "Study plan drawer",
      children: [
        /* @__PURE__ */ C.jsxs("div", { className: "drawer-head", children: [
          /* @__PURE__ */ C.jsxs("div", { children: [
            /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Study Plan" }),
            /* @__PURE__ */ C.jsx("h2", { children: "Plan this block" })
          ] }),
          /* @__PURE__ */ C.jsx(_e, { "aria-label": "Close study plan", onClick: r, children: /* @__PURE__ */ C.jsx(al, { size: 16, "aria-hidden": "true" }) })
        ] }),
        /* @__PURE__ */ C.jsx("div", { className: "plan-editor", children: e.map((l, c) => /* @__PURE__ */ C.jsxs("article", { className: "plan-edit-item liquid-glass-lite", children: [
          /* @__PURE__ */ C.jsxs("label", { className: "focus-field", children: [
            "Minutes",
            /* @__PURE__ */ C.jsx("input", { value: l.minutes, type: "number", min: "1", max: "180", onChange: (d) => s(c, d.target.value, null) })
          ] }),
          /* @__PURE__ */ C.jsxs("label", { className: "focus-field", children: [
            "Task",
            /* @__PURE__ */ C.jsx("textarea", { value: l.task, onChange: (d) => s(c, null, d.target.value) })
          ] }),
          /* @__PURE__ */ C.jsx(
            _e,
            {
              variant: n.includes(l.task) ? "primary" : "ghost",
              onClick: () => a(c),
              children: n.includes(l.task) ? "Completed" : "Mark complete"
            }
          )
        ] }, `${l.task}-${c}`)) })
      ]
    }
  ) : null });
}
function gj() {
  const t = Y((s) => s.activeDrawer === "materials"), e = Y((s) => s.closeDrawer), n = Hc(), r = (s) => {
    const a = s ? `/${encodeURIComponent(s)}` : "";
    globalThis.location.hash = `#/focus-room${a}`, e();
  };
  return /* @__PURE__ */ C.jsx(mi, { children: t ? /* @__PURE__ */ C.jsxs(
    Ot.aside,
    {
      className: "extra-panel drawer-open liquid-glass",
      initial: { opacity: 0, x: 28 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 28 },
      transition: _r,
      "aria-label": "Materials drawer",
      children: [
        /* @__PURE__ */ C.jsxs("div", { className: "drawer-head", children: [
          /* @__PURE__ */ C.jsxs("div", { children: [
            /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Materials" }),
            /* @__PURE__ */ C.jsx("h2", { children: "Uploaded study material" })
          ] }),
          /* @__PURE__ */ C.jsx(_e, { "aria-label": "Close materials", onClick: e, children: /* @__PURE__ */ C.jsx(al, { size: 16, "aria-hidden": "true" }) })
        ] }),
        /* @__PURE__ */ C.jsx("div", { className: "material-list", children: n.length ? n.map((s) => /* @__PURE__ */ C.jsxs("button", { className: "material-row liquid-glass-lite", type: "button", onClick: () => r(s.materialId), children: [
          /* @__PURE__ */ C.jsx("strong", { children: s.materialTitle || "Study material" }),
          /* @__PURE__ */ C.jsx("span", { children: s.materialType || "Generated notes" })
        ] }, s.materialId)) : /* @__PURE__ */ C.jsx("p", { children: "No Focus Room materials are available yet." }) })
      ]
    }
  ) : null });
}
function vj({ onWorkspace: t }) {
  const e = Y((s) => s.activeDrawer === "workspace"), n = Y((s) => s.closeDrawer), r = Y((s) => s.selectedMaterial);
  return /* @__PURE__ */ C.jsx(mi, { children: e ? /* @__PURE__ */ C.jsxs(
    Ot.aside,
    {
      className: "extra-panel drawer-open liquid-glass",
      initial: { opacity: 0, x: 28 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 28 },
      transition: _r,
      "aria-label": "Workspace drawer",
      children: [
        /* @__PURE__ */ C.jsxs("div", { className: "drawer-head", children: [
          /* @__PURE__ */ C.jsxs("div", { children: [
            /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Workspace" }),
            /* @__PURE__ */ C.jsx("h2", { children: "Return to Synapse" })
          ] }),
          /* @__PURE__ */ C.jsx(_e, { "aria-label": "Close workspace drawer", onClick: n, children: /* @__PURE__ */ C.jsx(al, { size: 16, "aria-hidden": "true" }) })
        ] }),
        /* @__PURE__ */ C.jsxs("p", { children: [
          (r == null ? void 0 : r.materialTitle) || "Your material",
          " will stay connected when you return to the workspace."
        ] }),
        /* @__PURE__ */ C.jsx("div", { className: "focus-button-row", children: /* @__PURE__ */ C.jsx(_e, { variant: "primary", onClick: () => t(), children: "Open Workspace" }) })
      ]
    }
  ) : null });
}
function _j({ onWorkspace: t, onHistory: e }) {
  const n = Y((l) => l.summaryRecord), r = Y((l) => l.closeSummary), s = () => {
    r(), e == null || e();
  }, a = () => {
    r(), t == null || t();
  };
  return /* @__PURE__ */ C.jsx(lC, { open: !!n, onOpenChange: (l) => !l && r(), children: /* @__PURE__ */ C.jsx(mi, { children: n ? /* @__PURE__ */ C.jsxs(uC, { forceMount: !0, children: [
    /* @__PURE__ */ C.jsx(cC, { asChild: !0, children: /* @__PURE__ */ C.jsx(
      Ot.div,
      {
        className: "summary-overlay",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    ) }),
    /* @__PURE__ */ C.jsx(fC, { asChild: !0, children: /* @__PURE__ */ C.jsxs(
      Ot.article,
      {
        className: "summary-card liquid-glass",
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        children: [
          /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Session complete" }),
          /* @__PURE__ */ C.jsx(dC, { children: n.materialTitle }),
          /* @__PURE__ */ C.jsx(hC, { className: "sr-only", children: "Summary of focus time, flashcards, quiz score, completed tasks, and recommended next step." }),
          /* @__PURE__ */ C.jsx("p", { children: n.aiReflection }),
          /* @__PURE__ */ C.jsxs("div", { className: "summary-grid", children: [
            /* @__PURE__ */ C.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ C.jsx("span", { children: "Focus time" }),
              /* @__PURE__ */ C.jsx("strong", { children: Wc(n.totalFocusTime) })
            ] }),
            /* @__PURE__ */ C.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ C.jsx("span", { children: "Flashcards" }),
              /* @__PURE__ */ C.jsx("strong", { children: n.flashcardsCompleted })
            ] }),
            /* @__PURE__ */ C.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ C.jsx("span", { children: "Quiz score" }),
              /* @__PURE__ */ C.jsx("strong", { children: n.quizScore === null ? "N/A" : `${n.quizScore}%` })
            ] }),
            /* @__PURE__ */ C.jsxs("div", { className: "summary-stat liquid-glass-lite", children: [
              /* @__PURE__ */ C.jsx("span", { children: "Tasks" }),
              /* @__PURE__ */ C.jsx("strong", { children: n.completedTasks.length })
            ] })
          ] }),
          n.mistakesMade.length ? /* @__PURE__ */ C.jsxs("p", { children: [
            "Review: ",
            n.mistakesMade.join("; ")
          ] }) : null,
          n.persisted === !1 ? /* @__PURE__ */ C.jsx("p", { children: "This session is visible for now, but could not be saved to this device history." }) : null,
          /* @__PURE__ */ C.jsx("p", { children: n.recommendedNextStep }),
          /* @__PURE__ */ C.jsxs("div", { className: "focus-button-row", children: [
            /* @__PURE__ */ C.jsx(_e, { variant: "primary", onClick: r, children: "Stay" }),
            /* @__PURE__ */ C.jsx(_e, { onClick: s, children: "View History" }),
            /* @__PURE__ */ C.jsx(_e, { onClick: a, children: "Workspace" })
          ] })
        ]
      }
    ) })
  ] }) : null }) });
}
var pl = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set(), this.subscribe = this.subscribe.bind(this);
  }
  subscribe(t) {
    return this.listeners.add(t), this.onSubscribe(), () => {
      this.listeners.delete(t), this.onUnsubscribe();
    };
  }
  hasListeners() {
    return this.listeners.size > 0;
  }
  onSubscribe() {
  }
  onUnsubscribe() {
  }
}, $i, Qr, Qs, qw, wj = (qw = class extends pl {
  constructor() {
    super();
    pe(this, $i);
    pe(this, Qr);
    pe(this, Qs);
    ne(this, Qs, (e) => {
      if (typeof window < "u" && window.addEventListener) {
        const n = () => e();
        return window.addEventListener("visibilitychange", n, !1), () => {
          window.removeEventListener("visibilitychange", n);
        };
      }
    });
  }
  onSubscribe() {
    F(this, Qr) || this.setEventListener(F(this, Qs));
  }
  onUnsubscribe() {
    var e;
    this.hasListeners() || ((e = F(this, Qr)) == null || e.call(this), ne(this, Qr, void 0));
  }
  setEventListener(e) {
    var n;
    ne(this, Qs, e), (n = F(this, Qr)) == null || n.call(this), ne(this, Qr, e((r) => {
      typeof r == "boolean" ? this.setFocused(r) : this.onFocus();
    }));
  }
  setFocused(e) {
    F(this, $i) !== e && (ne(this, $i, e), this.onFocus());
  }
  onFocus() {
    const e = this.isFocused();
    this.listeners.forEach((n) => {
      n(e);
    });
  }
  isFocused() {
    var e;
    return typeof F(this, $i) == "boolean" ? F(this, $i) : ((e = globalThis.document) == null ? void 0 : e.visibilityState) !== "hidden";
  }
}, $i = new WeakMap(), Qr = new WeakMap(), Qs = new WeakMap(), qw), cy = new wj(), Sj = {
  // We need the wrapper function syntax below instead of direct references to
  // global setTimeout etc.
  //
  // BAD: `setTimeout: setTimeout`
  // GOOD: `setTimeout: (cb, delay) => setTimeout(cb, delay)`
  //
  // If we use direct references here, then anything that wants to spy on or
  // replace the global setTimeout (like tests) won't work since we'll already
  // have a hard reference to the original implementation at the time when this
  // file was imported.
  setTimeout: (t, e) => setTimeout(t, e),
  clearTimeout: (t) => clearTimeout(t),
  setInterval: (t, e) => setInterval(t, e),
  clearInterval: (t) => clearInterval(t)
}, Yr, Zp, Zw, xj = (Zw = class {
  constructor() {
    // We cannot have TimeoutManager<T> as we must instantiate it with a concrete
    // type at app boot; and if we leave that type, then any new timer provider
    // would need to support the default provider's concrete timer ID, which is
    // infeasible across environments.
    //
    // We settle for type safety for the TimeoutProvider type, and accept that
    // this class is unsafe internally to allow for extension.
    pe(this, Yr, Sj);
    pe(this, Zp, !1);
  }
  setTimeoutProvider(t) {
    ne(this, Yr, t);
  }
  setTimeout(t, e) {
    return F(this, Yr).setTimeout(t, e);
  }
  clearTimeout(t) {
    F(this, Yr).clearTimeout(t);
  }
  setInterval(t, e) {
    return F(this, Yr).setInterval(t, e);
  }
  clearInterval(t) {
    F(this, Yr).clearInterval(t);
  }
}, Yr = new WeakMap(), Zp = new WeakMap(), Zw), Ui = new xj();
function Tj(t) {
  setTimeout(t, 0);
}
var Cj = typeof window > "u" || "Deno" in globalThis;
function $t() {
}
function kj(t, e) {
  return typeof t == "function" ? t(e) : t;
}
function Np(t) {
  return typeof t == "number" && t >= 0 && t !== 1 / 0;
}
function qC(t, e) {
  return Math.max(t + (e || 0) - Date.now(), 0);
}
function li(t, e) {
  return typeof t == "function" ? t(e) : t;
}
function sn(t, e) {
  return typeof t == "function" ? t(e) : t;
}
function Fw(t, e) {
  const {
    type: n = "all",
    exact: r,
    fetchStatus: s,
    predicate: a,
    queryKey: l,
    stale: c
  } = t;
  if (l) {
    if (r) {
      if (e.queryHash !== fy(l, e.options))
        return !1;
    } else if (!Wa(e.queryKey, l))
      return !1;
  }
  if (n !== "all") {
    const d = e.isActive();
    if (n === "active" && !d || n === "inactive" && d)
      return !1;
  }
  return !(typeof c == "boolean" && e.isStale() !== c || s && s !== e.state.fetchStatus || a && !a(e));
}
function Ow(t, e) {
  const { exact: n, status: r, predicate: s, mutationKey: a } = t;
  if (a) {
    if (!e.options.mutationKey)
      return !1;
    if (n) {
      if (Ha(e.options.mutationKey) !== Ha(a))
        return !1;
    } else if (!Wa(e.options.mutationKey, a))
      return !1;
  }
  return !(r && e.state.status !== r || s && !s(e));
}
function fy(t, e) {
  return ((e == null ? void 0 : e.queryKeyHashFn) || Ha)(t);
}
function Ha(t) {
  return JSON.stringify(
    t,
    (e, n) => jp(n) ? Object.keys(n).sort().reduce((r, s) => (r[s] = n[s], r), {}) : n
  );
}
function Wa(t, e) {
  return t === e ? !0 : typeof t != typeof e ? !1 : t && e && typeof t == "object" && typeof e == "object" ? Object.keys(e).every((n) => Wa(t[n], e[n])) : !1;
}
var Pj = Object.prototype.hasOwnProperty;
function ZC(t, e, n = 0) {
  if (t === e)
    return t;
  if (n > 500) return e;
  const r = Iw(t) && Iw(e);
  if (!r && !(jp(t) && jp(e))) return e;
  const a = (r ? t : Object.keys(t)).length, l = r ? e : Object.keys(e), c = l.length, d = r ? new Array(c) : {};
  let m = 0;
  for (let y = 0; y < c; y++) {
    const f = r ? y : l[y], p = t[f], g = e[f];
    if (p === g) {
      d[f] = p, (r ? y < a : Pj.call(t, f)) && m++;
      continue;
    }
    if (p === null || g === null || typeof p != "object" || typeof g != "object") {
      d[f] = g;
      continue;
    }
    const S = ZC(p, g, n + 1);
    d[f] = S, S === p && m++;
  }
  return a === c && m === a ? t : d;
}
function Lp(t, e) {
  if (!e || Object.keys(t).length !== Object.keys(e).length)
    return !1;
  for (const n in t)
    if (t[n] !== e[n])
      return !1;
  return !0;
}
function Iw(t) {
  return Array.isArray(t) && t.length === Object.keys(t).length;
}
function jp(t) {
  if (!Nw(t))
    return !1;
  const e = t.constructor;
  if (e === void 0)
    return !0;
  const n = e.prototype;
  return !(!Nw(n) || !n.hasOwnProperty("isPrototypeOf") || Object.getPrototypeOf(t) !== Object.prototype);
}
function Nw(t) {
  return Object.prototype.toString.call(t) === "[object Object]";
}
function Ej(t) {
  return new Promise((e) => {
    Ui.setTimeout(e, t);
  });
}
function Vp(t, e, n) {
  return typeof n.structuralSharing == "function" ? n.structuralSharing(t, e) : n.structuralSharing !== !1 ? ZC(t, e) : e;
}
function Aj(t, e, n = 0) {
  const r = [...t, e];
  return n && r.length > n ? r.slice(1) : r;
}
function bj(t, e, n = 0) {
  const r = [e, ...t];
  return n && r.length > n ? r.slice(0, -1) : r;
}
var dy = /* @__PURE__ */ Symbol();
function JC(t, e) {
  return !t.queryFn && (e != null && e.initialPromise) ? () => e.initialPromise : !t.queryFn || t.queryFn === dy ? () => Promise.reject(new Error(`Missing queryFn: '${t.queryHash}'`)) : t.queryFn;
}
function ek(t, e) {
  return typeof t == "function" ? t(...e) : !!t;
}
function Rj(t, e, n) {
  let r = !1, s;
  return Object.defineProperty(t, "signal", {
    enumerable: !0,
    get: () => (s ?? (s = e()), r || (r = !0, s.aborted ? n() : s.addEventListener("abort", n, { once: !0 })), s)
  }), t;
}
var Ga = /* @__PURE__ */ (() => {
  let t = () => Cj;
  return {
    /**
     * Returns whether the current runtime should be treated as a server environment.
     */
    isServer() {
      return t();
    },
    /**
     * Overrides the server check globally.
     */
    setIsServer(e) {
      t = e;
    }
  };
})();
function Bp() {
  let t, e;
  const n = new Promise((s, a) => {
    t = s, e = a;
  });
  n.status = "pending", n.catch(() => {
  });
  function r(s) {
    Object.assign(n, s), delete n.resolve, delete n.reject;
  }
  return n.resolve = (s) => {
    r({
      status: "fulfilled",
      value: s
    }), t(s);
  }, n.reject = (s) => {
    r({
      status: "rejected",
      reason: s
    }), e(s);
  }, n;
}
var Mj = Tj;
function Dj() {
  let t = [], e = 0, n = (c) => {
    c();
  }, r = (c) => {
    c();
  }, s = Mj;
  const a = (c) => {
    e ? t.push(c) : s(() => {
      n(c);
    });
  }, l = () => {
    const c = t;
    t = [], c.length && s(() => {
      r(() => {
        c.forEach((d) => {
          n(d);
        });
      });
    });
  };
  return {
    batch: (c) => {
      let d;
      e++;
      try {
        d = c();
      } finally {
        e--, e || l();
      }
      return d;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (c) => (...d) => {
      a(() => {
        c(...d);
      });
    },
    schedule: a,
    /**
     * Use this method to set a custom notify function.
     * This can be used to for example wrap notifications with `React.act` while running tests.
     */
    setNotifyFunction: (c) => {
      n = c;
    },
    /**
     * Use this method to set a custom function to batch notifications together into a single tick.
     * By default React Query will use the batch function provided by ReactDOM or React Native.
     */
    setBatchNotifyFunction: (c) => {
      r = c;
    },
    setScheduler: (c) => {
      s = c;
    }
  };
}
var vt = Dj(), Ys, Xr, Xs, Jw, Fj = (Jw = class extends pl {
  constructor() {
    super();
    pe(this, Ys, !0);
    pe(this, Xr);
    pe(this, Xs);
    ne(this, Xs, (e) => {
      if (typeof window < "u" && window.addEventListener) {
        const n = () => e(!0), r = () => e(!1);
        return window.addEventListener("online", n, !1), window.addEventListener("offline", r, !1), () => {
          window.removeEventListener("online", n), window.removeEventListener("offline", r);
        };
      }
    });
  }
  onSubscribe() {
    F(this, Xr) || this.setEventListener(F(this, Xs));
  }
  onUnsubscribe() {
    var e;
    this.hasListeners() || ((e = F(this, Xr)) == null || e.call(this), ne(this, Xr, void 0));
  }
  setEventListener(e) {
    var n;
    ne(this, Xs, e), (n = F(this, Xr)) == null || n.call(this), ne(this, Xr, e(this.setOnline.bind(this)));
  }
  setOnline(e) {
    F(this, Ys) !== e && (ne(this, Ys, e), this.listeners.forEach((r) => {
      r(e);
    }));
  }
  isOnline() {
    return F(this, Ys);
  }
}, Ys = new WeakMap(), Xr = new WeakMap(), Xs = new WeakMap(), Jw), Mc = new Fj();
function Oj(t) {
  return Math.min(1e3 * 2 ** t, 3e4);
}
function tk(t) {
  return (t ?? "online") === "online" ? Mc.isOnline() : !0;
}
var zp = class extends Error {
  constructor(t) {
    super("CancelledError"), this.revert = t == null ? void 0 : t.revert, this.silent = t == null ? void 0 : t.silent;
  }
};
function nk(t) {
  let e = !1, n = 0, r;
  const s = Bp(), a = () => s.status !== "pending", l = (_) => {
    var x;
    if (!a()) {
      const T = new zp(_);
      p(T), (x = t.onCancel) == null || x.call(t, T);
    }
  }, c = () => {
    e = !0;
  }, d = () => {
    e = !1;
  }, m = () => cy.isFocused() && (t.networkMode === "always" || Mc.isOnline()) && t.canRun(), y = () => tk(t.networkMode) && t.canRun(), f = (_) => {
    a() || (r == null || r(), s.resolve(_));
  }, p = (_) => {
    a() || (r == null || r(), s.reject(_));
  }, g = () => new Promise((_) => {
    var x;
    r = (T) => {
      (a() || m()) && _(T);
    }, (x = t.onPause) == null || x.call(t);
  }).then(() => {
    var _;
    r = void 0, a() || (_ = t.onContinue) == null || _.call(t);
  }), S = () => {
    if (a())
      return;
    let _;
    const x = n === 0 ? t.initialPromise : void 0;
    try {
      _ = x ?? t.fn();
    } catch (T) {
      _ = Promise.reject(T);
    }
    Promise.resolve(_).then(f).catch((T) => {
      var B;
      if (a())
        return;
      const E = t.retry ?? (Ga.isServer() ? 0 : 3), A = t.retryDelay ?? Oj, b = typeof A == "function" ? A(n, T) : A, M = E === !0 || typeof E == "number" && n < E || typeof E == "function" && E(n, T);
      if (e || !M) {
        p(T);
        return;
      }
      n++, (B = t.onFail) == null || B.call(t, n, T), Ej(b).then(() => m() ? void 0 : g()).then(() => {
        e ? p(T) : S();
      });
    });
  };
  return {
    promise: s,
    status: () => s.status,
    cancel: l,
    continue: () => (r == null || r(), s),
    cancelRetry: c,
    continueRetry: d,
    canStart: y,
    start: () => (y() ? S() : g().then(S), s)
  };
}
var Hi, eS, rk = (eS = class {
  constructor() {
    pe(this, Hi);
  }
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout(), Np(this.gcTime) && ne(this, Hi, Ui.setTimeout(() => {
      this.optionalRemove();
    }, this.gcTime));
  }
  updateGcTime(t) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      t ?? (Ga.isServer() ? 1 / 0 : 300 * 1e3)
    );
  }
  clearGcTimeout() {
    F(this, Hi) !== void 0 && (Ui.clearTimeout(F(this, Hi)), ne(this, Hi, void 0));
  }
}, Hi = new WeakMap(), eS);
function Ij(t) {
  return {
    onFetch: (e, n) => {
      var y, f, p, g, S;
      const r = e.options, s = (p = (f = (y = e.fetchOptions) == null ? void 0 : y.meta) == null ? void 0 : f.fetchMore) == null ? void 0 : p.direction, a = ((g = e.state.data) == null ? void 0 : g.pages) || [], l = ((S = e.state.data) == null ? void 0 : S.pageParams) || [];
      let c = { pages: [], pageParams: [] }, d = 0;
      const m = async () => {
        let _ = !1;
        const x = (A) => {
          Rj(
            A,
            () => e.signal,
            () => _ = !0
          );
        }, T = JC(e.options, e.fetchOptions), E = async (A, b, M) => {
          if (_)
            return Promise.reject(e.signal.reason);
          if (b == null && A.pages.length)
            return Promise.resolve(A);
          const I = (() => {
            const q = {
              client: e.client,
              queryKey: e.queryKey,
              pageParam: b,
              direction: M ? "backward" : "forward",
              meta: e.options.meta
            };
            return x(q), q;
          })(), O = await T(I), { maxPages: L } = e.options, $ = M ? bj : Aj;
          return {
            pages: $(A.pages, O, L),
            pageParams: $(A.pageParams, b, L)
          };
        };
        if (s && a.length) {
          const A = s === "backward", b = A ? Nj : Lw, M = {
            pages: a,
            pageParams: l
          }, B = b(r, M);
          c = await E(M, B, A);
        } else {
          const A = t ?? a.length;
          do {
            const b = d === 0 ? l[0] ?? r.initialPageParam : Lw(r, c);
            if (d > 0 && b == null)
              break;
            c = await E(c, b), d++;
          } while (d < A);
        }
        return c;
      };
      e.options.persister ? e.fetchFn = () => {
        var _, x;
        return (x = (_ = e.options).persister) == null ? void 0 : x.call(
          _,
          m,
          {
            client: e.client,
            queryKey: e.queryKey,
            meta: e.options.meta,
            signal: e.signal
          },
          n
        );
      } : e.fetchFn = m;
    }
  };
}
function Lw(t, { pages: e, pageParams: n }) {
  const r = e.length - 1;
  return e.length > 0 ? t.getNextPageParam(
    e[r],
    e,
    n[r],
    n
  ) : void 0;
}
function Nj(t, { pages: e, pageParams: n }) {
  var r;
  return e.length > 0 ? (r = t.getPreviousPageParam) == null ? void 0 : r.call(t, e[0], e, n[0], n) : void 0;
}
var qs, Wi, Zs, _n, Gi, ht, Qa, Ki, nn, ik, pr, tS, Lj = (tS = class extends rk {
  constructor(e) {
    super();
    pe(this, nn);
    pe(this, qs);
    pe(this, Wi);
    pe(this, Zs);
    pe(this, _n);
    pe(this, Gi);
    pe(this, ht);
    pe(this, Qa);
    pe(this, Ki);
    ne(this, Ki, !1), ne(this, Qa, e.defaultOptions), this.setOptions(e.options), this.observers = [], ne(this, Gi, e.client), ne(this, _n, F(this, Gi).getQueryCache()), this.queryKey = e.queryKey, this.queryHash = e.queryHash, ne(this, Wi, Vw(this.options)), this.state = e.state ?? F(this, Wi), this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  get queryType() {
    return F(this, qs);
  }
  get promise() {
    var e;
    return (e = F(this, ht)) == null ? void 0 : e.promise;
  }
  setOptions(e) {
    if (this.options = { ...F(this, Qa), ...e }, e != null && e._type && ne(this, qs, e._type), this.updateGcTime(this.options.gcTime), this.state && this.state.data === void 0) {
      const n = Vw(this.options);
      n.data !== void 0 && (this.setState(
        jw(n.data, n.dataUpdatedAt)
      ), ne(this, Wi, n));
    }
  }
  optionalRemove() {
    !this.observers.length && this.state.fetchStatus === "idle" && F(this, _n).remove(this);
  }
  setData(e, n) {
    const r = Vp(this.state.data, e, this.options);
    return xe(this, nn, pr).call(this, {
      data: r,
      type: "success",
      dataUpdatedAt: n == null ? void 0 : n.updatedAt,
      manual: n == null ? void 0 : n.manual
    }), r;
  }
  setState(e) {
    xe(this, nn, pr).call(this, { type: "setState", state: e });
  }
  cancel(e) {
    var r, s;
    const n = (r = F(this, ht)) == null ? void 0 : r.promise;
    return (s = F(this, ht)) == null || s.cancel(e), n ? n.then($t).catch($t) : Promise.resolve();
  }
  destroy() {
    super.destroy(), this.cancel({ silent: !0 });
  }
  get resetState() {
    return F(this, Wi);
  }
  reset() {
    this.destroy(), this.setState(this.resetState);
  }
  isActive() {
    return this.observers.some(
      (e) => sn(e.options.enabled, this) !== !1
    );
  }
  isDisabled() {
    return this.getObserversCount() > 0 ? !this.isActive() : this.options.queryFn === dy || !this.isFetched();
  }
  isFetched() {
    return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
  }
  isStatic() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (e) => li(e.options.staleTime, this) === "static"
    ) : !1;
  }
  isStale() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (e) => e.getCurrentResult().isStale
    ) : this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(e = 0) {
    return this.state.data === void 0 ? !0 : e === "static" ? !1 : this.state.isInvalidated ? !0 : !qC(this.state.dataUpdatedAt, e);
  }
  onFocus() {
    var n;
    const e = this.observers.find((r) => r.shouldFetchOnWindowFocus());
    e == null || e.refetch({ cancelRefetch: !1 }), (n = F(this, ht)) == null || n.continue();
  }
  onOnline() {
    var n;
    const e = this.observers.find((r) => r.shouldFetchOnReconnect());
    e == null || e.refetch({ cancelRefetch: !1 }), (n = F(this, ht)) == null || n.continue();
  }
  addObserver(e) {
    this.observers.includes(e) || (this.observers.push(e), this.clearGcTimeout(), F(this, _n).notify({ type: "observerAdded", query: this, observer: e }));
  }
  removeObserver(e) {
    this.observers.includes(e) && (this.observers = this.observers.filter((n) => n !== e), this.observers.length || (F(this, ht) && (F(this, Ki) || xe(this, nn, ik).call(this) ? F(this, ht).cancel({ revert: !0 }) : F(this, ht).cancelRetry()), this.scheduleGc()), F(this, _n).notify({ type: "observerRemoved", query: this, observer: e }));
  }
  getObserversCount() {
    return this.observers.length;
  }
  invalidate() {
    this.state.isInvalidated || xe(this, nn, pr).call(this, { type: "invalidate" });
  }
  async fetch(e, n) {
    var m, y, f, p, g, S, _, x, T, E, A;
    if (this.state.fetchStatus !== "idle" && // If the promise in the retryer is already rejected, we have to definitely
    // re-start the fetch; there is a chance that the query is still in a
    // pending state when that happens
    ((m = F(this, ht)) == null ? void 0 : m.status()) !== "rejected") {
      if (this.state.data !== void 0 && (n != null && n.cancelRefetch))
        this.cancel({ silent: !0 });
      else if (F(this, ht))
        return F(this, ht).continueRetry(), F(this, ht).promise;
    }
    if (e && this.setOptions(e), !this.options.queryFn) {
      const b = this.observers.find((M) => M.options.queryFn);
      b && this.setOptions(b.options);
    }
    const r = new AbortController(), s = (b) => {
      Object.defineProperty(b, "signal", {
        enumerable: !0,
        get: () => (ne(this, Ki, !0), r.signal)
      });
    }, a = () => {
      const b = JC(this.options, n), B = (() => {
        const I = {
          client: F(this, Gi),
          queryKey: this.queryKey,
          meta: this.meta
        };
        return s(I), I;
      })();
      return ne(this, Ki, !1), this.options.persister ? this.options.persister(
        b,
        B,
        this
      ) : b(B);
    }, c = (() => {
      const b = {
        fetchOptions: n,
        options: this.options,
        queryKey: this.queryKey,
        client: F(this, Gi),
        state: this.state,
        fetchFn: a
      };
      return s(b), b;
    })(), d = F(this, qs) === "infinite" ? Ij(
      this.options.pages
    ) : this.options.behavior;
    d == null || d.onFetch(c, this), ne(this, Zs, this.state), (this.state.fetchStatus === "idle" || this.state.fetchMeta !== ((y = c.fetchOptions) == null ? void 0 : y.meta)) && xe(this, nn, pr).call(this, { type: "fetch", meta: (f = c.fetchOptions) == null ? void 0 : f.meta }), ne(this, ht, nk({
      initialPromise: n == null ? void 0 : n.initialPromise,
      fn: c.fetchFn,
      onCancel: (b) => {
        b instanceof zp && b.revert && this.setState({
          ...F(this, Zs),
          fetchStatus: "idle"
        }), r.abort();
      },
      onFail: (b, M) => {
        xe(this, nn, pr).call(this, { type: "failed", failureCount: b, error: M });
      },
      onPause: () => {
        xe(this, nn, pr).call(this, { type: "pause" });
      },
      onContinue: () => {
        xe(this, nn, pr).call(this, { type: "continue" });
      },
      retry: c.options.retry,
      retryDelay: c.options.retryDelay,
      networkMode: c.options.networkMode,
      canRun: () => !0
    }));
    try {
      const b = await F(this, ht).start();
      if (b === void 0)
        throw new Error(`${this.queryHash} data is undefined`);
      return this.setData(b), (g = (p = F(this, _n).config).onSuccess) == null || g.call(p, b, this), (_ = (S = F(this, _n).config).onSettled) == null || _.call(
        S,
        b,
        this.state.error,
        this
      ), b;
    } catch (b) {
      if (b instanceof zp) {
        if (b.silent)
          return F(this, ht).promise;
        if (b.revert) {
          if (this.state.data === void 0)
            throw b;
          return this.state.data;
        }
      }
      throw xe(this, nn, pr).call(this, {
        type: "error",
        error: b
      }), (T = (x = F(this, _n).config).onError) == null || T.call(
        x,
        b,
        this
      ), (A = (E = F(this, _n).config).onSettled) == null || A.call(
        E,
        this.state.data,
        b,
        this
      ), b;
    } finally {
      this.scheduleGc();
    }
  }
}, qs = new WeakMap(), Wi = new WeakMap(), Zs = new WeakMap(), _n = new WeakMap(), Gi = new WeakMap(), ht = new WeakMap(), Qa = new WeakMap(), Ki = new WeakMap(), nn = new WeakSet(), ik = function() {
  return this.state.fetchStatus === "paused" && this.state.status === "pending";
}, pr = function(e) {
  const n = (r) => {
    switch (e.type) {
      case "failed":
        return {
          ...r,
          fetchFailureCount: e.failureCount,
          fetchFailureReason: e.error
        };
      case "pause":
        return {
          ...r,
          fetchStatus: "paused"
        };
      case "continue":
        return {
          ...r,
          fetchStatus: "fetching"
        };
      case "fetch":
        return {
          ...r,
          ...sk(r.data, this.options),
          fetchMeta: e.meta ?? null
        };
      case "success":
        const s = {
          ...r,
          ...jw(e.data, e.dataUpdatedAt),
          dataUpdateCount: r.dataUpdateCount + 1,
          ...!e.manual && {
            fetchStatus: "idle",
            fetchFailureCount: 0,
            fetchFailureReason: null
          }
        };
        return ne(this, Zs, e.manual ? s : void 0), s;
      case "error":
        const a = e.error;
        return {
          ...r,
          error: a,
          errorUpdateCount: r.errorUpdateCount + 1,
          errorUpdatedAt: Date.now(),
          fetchFailureCount: r.fetchFailureCount + 1,
          fetchFailureReason: a,
          fetchStatus: "idle",
          status: "error",
          // flag existing data as invalidated if we get a background error
          // note that "no data" always means stale so we can set unconditionally here
          isInvalidated: !0
        };
      case "invalidate":
        return {
          ...r,
          isInvalidated: !0
        };
      case "setState":
        return {
          ...r,
          ...e.state
        };
    }
  };
  this.state = n(this.state), vt.batch(() => {
    this.observers.forEach((r) => {
      r.onQueryUpdate();
    }), F(this, _n).notify({ query: this, type: "updated", action: e });
  });
}, tS);
function sk(t, e) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: tk(e.networkMode) ? "fetching" : "paused",
    ...t === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function jw(t, e) {
  return {
    data: t,
    dataUpdatedAt: e ?? Date.now(),
    error: null,
    isInvalidated: !1,
    status: "success"
  };
}
function Vw(t) {
  const e = typeof t.initialData == "function" ? t.initialData() : t.initialData, n = e !== void 0, r = n ? typeof t.initialDataUpdatedAt == "function" ? t.initialDataUpdatedAt() : t.initialDataUpdatedAt : 0;
  return {
    data: e,
    dataUpdateCount: 0,
    dataUpdatedAt: n ? r ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: n ? "success" : "pending",
    fetchStatus: "idle"
  };
}
var Ut, Te, Ya, Mt, Qi, Js, gr, qr, Xa, eo, to, Yi, Xi, Zr, no, Ae, _a, Up, $p, Hp, Wp, Gp, Kp, Qp, ok, nS, jj = (nS = class extends pl {
  constructor(e, n) {
    super();
    pe(this, Ae);
    pe(this, Ut);
    pe(this, Te);
    pe(this, Ya);
    pe(this, Mt);
    pe(this, Qi);
    pe(this, Js);
    pe(this, gr);
    pe(this, qr);
    pe(this, Xa);
    pe(this, eo);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    pe(this, to);
    pe(this, Yi);
    pe(this, Xi);
    pe(this, Zr);
    pe(this, no, /* @__PURE__ */ new Set());
    this.options = n, ne(this, Ut, e), ne(this, qr, null), ne(this, gr, Bp()), this.bindMethods(), this.setOptions(n);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    this.listeners.size === 1 && (F(this, Te).addObserver(this), Bw(F(this, Te), this.options) ? xe(this, Ae, _a).call(this) : this.updateResult(), xe(this, Ae, Wp).call(this));
  }
  onUnsubscribe() {
    this.hasListeners() || this.destroy();
  }
  shouldFetchOnReconnect() {
    return Yp(
      F(this, Te),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return Yp(
      F(this, Te),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set(), xe(this, Ae, Gp).call(this), xe(this, Ae, Kp).call(this), F(this, Te).removeObserver(this);
  }
  setOptions(e) {
    const n = this.options, r = F(this, Te);
    if (this.options = F(this, Ut).defaultQueryOptions(e), this.options.enabled !== void 0 && typeof this.options.enabled != "boolean" && typeof this.options.enabled != "function" && typeof sn(this.options.enabled, F(this, Te)) != "boolean")
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    xe(this, Ae, Qp).call(this), F(this, Te).setOptions(this.options), n._defaulted && !Lp(this.options, n) && F(this, Ut).getQueryCache().notify({
      type: "observerOptionsUpdated",
      query: F(this, Te),
      observer: this
    });
    const s = this.hasListeners();
    s && zw(
      F(this, Te),
      r,
      this.options,
      n
    ) && xe(this, Ae, _a).call(this), this.updateResult(), s && (F(this, Te) !== r || sn(this.options.enabled, F(this, Te)) !== sn(n.enabled, F(this, Te)) || li(this.options.staleTime, F(this, Te)) !== li(n.staleTime, F(this, Te))) && xe(this, Ae, Up).call(this);
    const a = xe(this, Ae, $p).call(this);
    s && (F(this, Te) !== r || sn(this.options.enabled, F(this, Te)) !== sn(n.enabled, F(this, Te)) || a !== F(this, Zr)) && xe(this, Ae, Hp).call(this, a);
  }
  getOptimisticResult(e) {
    const n = F(this, Ut).getQueryCache().build(F(this, Ut), e), r = this.createResult(n, e);
    return Bj(this, r) && (ne(this, Mt, r), ne(this, Js, this.options), ne(this, Qi, F(this, Te).state)), r;
  }
  getCurrentResult() {
    return F(this, Mt);
  }
  trackResult(e, n) {
    return new Proxy(e, {
      get: (r, s) => (this.trackProp(s), n == null || n(s), s === "promise" && (this.trackProp("data"), !this.options.experimental_prefetchInRender && F(this, gr).status === "pending" && F(this, gr).reject(
        new Error(
          "experimental_prefetchInRender feature flag is not enabled"
        )
      )), Reflect.get(r, s))
    });
  }
  trackProp(e) {
    F(this, no).add(e);
  }
  getCurrentQuery() {
    return F(this, Te);
  }
  refetch({ ...e } = {}) {
    return this.fetch({
      ...e
    });
  }
  fetchOptimistic(e) {
    const n = F(this, Ut).defaultQueryOptions(e), r = F(this, Ut).getQueryCache().build(F(this, Ut), n);
    return r.fetch().then(() => this.createResult(r, n));
  }
  fetch(e) {
    return xe(this, Ae, _a).call(this, {
      ...e,
      cancelRefetch: e.cancelRefetch ?? !0
    }).then(() => (this.updateResult(), F(this, Mt)));
  }
  createResult(e, n) {
    var L;
    const r = F(this, Te), s = this.options, a = F(this, Mt), l = F(this, Qi), c = F(this, Js), m = e !== r ? e.state : F(this, Ya), { state: y } = e;
    let f = { ...y }, p = !1, g;
    if (n._optimisticResults) {
      const $ = this.hasListeners(), q = !$ && Bw(e, n), J = $ && zw(e, r, n, s);
      (q || J) && (f = {
        ...f,
        ...sk(y.data, e.options)
      }), n._optimisticResults === "isRestoring" && (f.fetchStatus = "idle");
    }
    let { error: S, errorUpdatedAt: _, status: x } = f;
    g = f.data;
    let T = !1;
    if (n.placeholderData !== void 0 && g === void 0 && x === "pending") {
      let $;
      a != null && a.isPlaceholderData && n.placeholderData === (c == null ? void 0 : c.placeholderData) ? ($ = a.data, T = !0) : $ = typeof n.placeholderData == "function" ? n.placeholderData(
        (L = F(this, to)) == null ? void 0 : L.state.data,
        F(this, to)
      ) : n.placeholderData, $ !== void 0 && (x = "success", g = Vp(
        a == null ? void 0 : a.data,
        $,
        n
      ), p = !0);
    }
    if (n.select && g !== void 0 && !T)
      if (a && g === (l == null ? void 0 : l.data) && n.select === F(this, Xa))
        g = F(this, eo);
      else
        try {
          ne(this, Xa, n.select), g = n.select(g), g = Vp(a == null ? void 0 : a.data, g, n), ne(this, eo, g), ne(this, qr, null);
        } catch ($) {
          ne(this, qr, $);
        }
    F(this, qr) && (S = F(this, qr), g = F(this, eo), _ = Date.now(), x = "error");
    const E = f.fetchStatus === "fetching", A = x === "pending", b = x === "error", M = A && E, B = g !== void 0, O = {
      status: x,
      fetchStatus: f.fetchStatus,
      isPending: A,
      isSuccess: x === "success",
      isError: b,
      isInitialLoading: M,
      isLoading: M,
      data: g,
      dataUpdatedAt: f.dataUpdatedAt,
      error: S,
      errorUpdatedAt: _,
      failureCount: f.fetchFailureCount,
      failureReason: f.fetchFailureReason,
      errorUpdateCount: f.errorUpdateCount,
      isFetched: e.isFetched(),
      isFetchedAfterMount: f.dataUpdateCount > m.dataUpdateCount || f.errorUpdateCount > m.errorUpdateCount,
      isFetching: E,
      isRefetching: E && !A,
      isLoadingError: b && !B,
      isPaused: f.fetchStatus === "paused",
      isPlaceholderData: p,
      isRefetchError: b && B,
      isStale: hy(e, n),
      refetch: this.refetch,
      promise: F(this, gr),
      isEnabled: sn(n.enabled, e) !== !1
    };
    if (this.options.experimental_prefetchInRender) {
      const $ = O.data !== void 0, q = O.status === "error" && !$, J = (ue) => {
        q ? ue.reject(O.error) : $ && ue.resolve(O.data);
      }, ie = () => {
        const ue = ne(this, gr, O.promise = Bp());
        J(ue);
      }, re = F(this, gr);
      switch (re.status) {
        case "pending":
          e.queryHash === r.queryHash && J(re);
          break;
        case "fulfilled":
          (q || O.data !== re.value) && ie();
          break;
        case "rejected":
          (!q || O.error !== re.reason) && ie();
          break;
      }
    }
    return O;
  }
  updateResult() {
    const e = F(this, Mt), n = this.createResult(F(this, Te), this.options);
    if (ne(this, Qi, F(this, Te).state), ne(this, Js, this.options), F(this, Qi).data !== void 0 && ne(this, to, F(this, Te)), Lp(n, e))
      return;
    ne(this, Mt, n);
    const r = () => {
      if (!e)
        return !0;
      const { notifyOnChangeProps: s } = this.options, a = typeof s == "function" ? s() : s;
      if (a === "all" || !a && !F(this, no).size)
        return !0;
      const l = new Set(
        a ?? F(this, no)
      );
      return this.options.throwOnError && l.add("error"), Object.keys(F(this, Mt)).some((c) => {
        const d = c;
        return F(this, Mt)[d] !== e[d] && l.has(d);
      });
    };
    xe(this, Ae, ok).call(this, { listeners: r() });
  }
  onQueryUpdate() {
    this.updateResult(), this.hasListeners() && xe(this, Ae, Wp).call(this);
  }
}, Ut = new WeakMap(), Te = new WeakMap(), Ya = new WeakMap(), Mt = new WeakMap(), Qi = new WeakMap(), Js = new WeakMap(), gr = new WeakMap(), qr = new WeakMap(), Xa = new WeakMap(), eo = new WeakMap(), to = new WeakMap(), Yi = new WeakMap(), Xi = new WeakMap(), Zr = new WeakMap(), no = new WeakMap(), Ae = new WeakSet(), _a = function(e) {
  xe(this, Ae, Qp).call(this);
  let n = F(this, Te).fetch(
    this.options,
    e
  );
  return e != null && e.throwOnError || (n = n.catch($t)), n;
}, Up = function() {
  xe(this, Ae, Gp).call(this);
  const e = li(
    this.options.staleTime,
    F(this, Te)
  );
  if (Ga.isServer() || F(this, Mt).isStale || !Np(e))
    return;
  const r = qC(F(this, Mt).dataUpdatedAt, e) + 1;
  ne(this, Yi, Ui.setTimeout(() => {
    F(this, Mt).isStale || this.updateResult();
  }, r));
}, $p = function() {
  return (typeof this.options.refetchInterval == "function" ? this.options.refetchInterval(F(this, Te)) : this.options.refetchInterval) ?? !1;
}, Hp = function(e) {
  xe(this, Ae, Kp).call(this), ne(this, Zr, e), !(Ga.isServer() || sn(this.options.enabled, F(this, Te)) === !1 || !Np(F(this, Zr)) || F(this, Zr) === 0) && ne(this, Xi, Ui.setInterval(() => {
    (this.options.refetchIntervalInBackground || cy.isFocused()) && xe(this, Ae, _a).call(this);
  }, F(this, Zr)));
}, Wp = function() {
  xe(this, Ae, Up).call(this), xe(this, Ae, Hp).call(this, xe(this, Ae, $p).call(this));
}, Gp = function() {
  F(this, Yi) !== void 0 && (Ui.clearTimeout(F(this, Yi)), ne(this, Yi, void 0));
}, Kp = function() {
  F(this, Xi) !== void 0 && (Ui.clearInterval(F(this, Xi)), ne(this, Xi, void 0));
}, Qp = function() {
  const e = F(this, Ut).getQueryCache().build(F(this, Ut), this.options);
  if (e === F(this, Te))
    return;
  const n = F(this, Te);
  ne(this, Te, e), ne(this, Ya, e.state), this.hasListeners() && (n == null || n.removeObserver(this), e.addObserver(this));
}, ok = function(e) {
  vt.batch(() => {
    e.listeners && this.listeners.forEach((n) => {
      n(F(this, Mt));
    }), F(this, Ut).getQueryCache().notify({
      query: F(this, Te),
      type: "observerResultsUpdated"
    });
  });
}, nS);
function Vj(t, e) {
  return sn(e.enabled, t) !== !1 && t.state.data === void 0 && !(t.state.status === "error" && sn(e.retryOnMount, t) === !1);
}
function Bw(t, e) {
  return Vj(t, e) || t.state.data !== void 0 && Yp(t, e, e.refetchOnMount);
}
function Yp(t, e, n) {
  if (sn(e.enabled, t) !== !1 && li(e.staleTime, t) !== "static") {
    const r = typeof n == "function" ? n(t) : n;
    return r === "always" || r !== !1 && hy(t, e);
  }
  return !1;
}
function zw(t, e, n, r) {
  return (t !== e || sn(r.enabled, t) === !1) && (!n.suspense || t.state.status !== "error") && hy(t, n);
}
function hy(t, e) {
  return sn(e.enabled, t) !== !1 && t.isStaleByTime(li(e.staleTime, t));
}
function Bj(t, e) {
  return !Lp(t.getCurrentResult(), e);
}
var qa, Qn, Pt, qi, Yn, Kr, rS, zj = (rS = class extends rk {
  constructor(e) {
    super();
    pe(this, Yn);
    pe(this, qa);
    pe(this, Qn);
    pe(this, Pt);
    pe(this, qi);
    ne(this, qa, e.client), this.mutationId = e.mutationId, ne(this, Pt, e.mutationCache), ne(this, Qn, []), this.state = e.state || Uj(), this.setOptions(e.options), this.scheduleGc();
  }
  setOptions(e) {
    this.options = e, this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(e) {
    F(this, Qn).includes(e) || (F(this, Qn).push(e), this.clearGcTimeout(), F(this, Pt).notify({
      type: "observerAdded",
      mutation: this,
      observer: e
    }));
  }
  removeObserver(e) {
    ne(this, Qn, F(this, Qn).filter((n) => n !== e)), this.scheduleGc(), F(this, Pt).notify({
      type: "observerRemoved",
      mutation: this,
      observer: e
    });
  }
  optionalRemove() {
    F(this, Qn).length || (this.state.status === "pending" ? this.scheduleGc() : F(this, Pt).remove(this));
  }
  continue() {
    var e;
    return ((e = F(this, qi)) == null ? void 0 : e.continue()) ?? // continuing a mutation assumes that variables are set, mutation must have been dehydrated before
    this.execute(this.state.variables);
  }
  async execute(e) {
    var l, c, d, m, y, f, p, g, S, _, x, T, E, A, b, M, B, I;
    const n = () => {
      xe(this, Yn, Kr).call(this, { type: "continue" });
    }, r = {
      client: F(this, qa),
      meta: this.options.meta,
      mutationKey: this.options.mutationKey
    };
    ne(this, qi, nk({
      fn: () => this.options.mutationFn ? this.options.mutationFn(e, r) : Promise.reject(new Error("No mutationFn found")),
      onFail: (O, L) => {
        xe(this, Yn, Kr).call(this, { type: "failed", failureCount: O, error: L });
      },
      onPause: () => {
        xe(this, Yn, Kr).call(this, { type: "pause" });
      },
      onContinue: n,
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => F(this, Pt).canRun(this)
    }));
    const s = this.state.status === "pending", a = !F(this, qi).canStart();
    try {
      if (s)
        n();
      else {
        xe(this, Yn, Kr).call(this, { type: "pending", variables: e, isPaused: a }), F(this, Pt).config.onMutate && await F(this, Pt).config.onMutate(
          e,
          this,
          r
        );
        const L = await ((c = (l = this.options).onMutate) == null ? void 0 : c.call(
          l,
          e,
          r
        ));
        L !== this.state.context && xe(this, Yn, Kr).call(this, {
          type: "pending",
          context: L,
          variables: e,
          isPaused: a
        });
      }
      const O = await F(this, qi).start();
      return await ((m = (d = F(this, Pt).config).onSuccess) == null ? void 0 : m.call(
        d,
        O,
        e,
        this.state.context,
        this,
        r
      )), await ((f = (y = this.options).onSuccess) == null ? void 0 : f.call(
        y,
        O,
        e,
        this.state.context,
        r
      )), await ((g = (p = F(this, Pt).config).onSettled) == null ? void 0 : g.call(
        p,
        O,
        null,
        this.state.variables,
        this.state.context,
        this,
        r
      )), await ((_ = (S = this.options).onSettled) == null ? void 0 : _.call(
        S,
        O,
        null,
        e,
        this.state.context,
        r
      )), xe(this, Yn, Kr).call(this, { type: "success", data: O }), O;
    } catch (O) {
      try {
        await ((T = (x = F(this, Pt).config).onError) == null ? void 0 : T.call(
          x,
          O,
          e,
          this.state.context,
          this,
          r
        ));
      } catch (L) {
        Promise.reject(L);
      }
      try {
        await ((A = (E = this.options).onError) == null ? void 0 : A.call(
          E,
          O,
          e,
          this.state.context,
          r
        ));
      } catch (L) {
        Promise.reject(L);
      }
      try {
        await ((M = (b = F(this, Pt).config).onSettled) == null ? void 0 : M.call(
          b,
          void 0,
          O,
          this.state.variables,
          this.state.context,
          this,
          r
        ));
      } catch (L) {
        Promise.reject(L);
      }
      try {
        await ((I = (B = this.options).onSettled) == null ? void 0 : I.call(
          B,
          void 0,
          O,
          e,
          this.state.context,
          r
        ));
      } catch (L) {
        Promise.reject(L);
      }
      throw xe(this, Yn, Kr).call(this, { type: "error", error: O }), O;
    } finally {
      F(this, Pt).runNext(this);
    }
  }
}, qa = new WeakMap(), Qn = new WeakMap(), Pt = new WeakMap(), qi = new WeakMap(), Yn = new WeakSet(), Kr = function(e) {
  const n = (r) => {
    switch (e.type) {
      case "failed":
        return {
          ...r,
          failureCount: e.failureCount,
          failureReason: e.error
        };
      case "pause":
        return {
          ...r,
          isPaused: !0
        };
      case "continue":
        return {
          ...r,
          isPaused: !1
        };
      case "pending":
        return {
          ...r,
          context: e.context,
          data: void 0,
          failureCount: 0,
          failureReason: null,
          error: null,
          isPaused: e.isPaused,
          status: "pending",
          variables: e.variables,
          submittedAt: Date.now()
        };
      case "success":
        return {
          ...r,
          data: e.data,
          failureCount: 0,
          failureReason: null,
          error: null,
          status: "success",
          isPaused: !1
        };
      case "error":
        return {
          ...r,
          data: void 0,
          error: e.error,
          failureCount: r.failureCount + 1,
          failureReason: e.error,
          isPaused: !1,
          status: "error"
        };
    }
  };
  this.state = n(this.state), vt.batch(() => {
    F(this, Qn).forEach((r) => {
      r.onMutationUpdate(e);
    }), F(this, Pt).notify({
      mutation: this,
      type: "updated",
      action: e
    });
  });
}, rS);
function Uj() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: !1,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}
var vr, In, Za, iS, $j = (iS = class extends pl {
  constructor(e = {}) {
    super();
    pe(this, vr);
    pe(this, In);
    pe(this, Za);
    this.config = e, ne(this, vr, /* @__PURE__ */ new Set()), ne(this, In, /* @__PURE__ */ new Map()), ne(this, Za, 0);
  }
  build(e, n, r) {
    const s = new zj({
      client: e,
      mutationCache: this,
      mutationId: ++ku(this, Za)._,
      options: e.defaultMutationOptions(n),
      state: r
    });
    return this.add(s), s;
  }
  add(e) {
    F(this, vr).add(e);
    const n = $u(e);
    if (typeof n == "string") {
      const r = F(this, In).get(n);
      r ? r.push(e) : F(this, In).set(n, [e]);
    }
    this.notify({ type: "added", mutation: e });
  }
  remove(e) {
    if (F(this, vr).delete(e)) {
      const n = $u(e);
      if (typeof n == "string") {
        const r = F(this, In).get(n);
        if (r)
          if (r.length > 1) {
            const s = r.indexOf(e);
            s !== -1 && r.splice(s, 1);
          } else r[0] === e && F(this, In).delete(n);
      }
    }
    this.notify({ type: "removed", mutation: e });
  }
  canRun(e) {
    const n = $u(e);
    if (typeof n == "string") {
      const r = F(this, In).get(n), s = r == null ? void 0 : r.find(
        (a) => a.state.status === "pending"
      );
      return !s || s === e;
    } else
      return !0;
  }
  runNext(e) {
    var r;
    const n = $u(e);
    if (typeof n == "string") {
      const s = (r = F(this, In).get(n)) == null ? void 0 : r.find((a) => a !== e && a.state.isPaused);
      return (s == null ? void 0 : s.continue()) ?? Promise.resolve();
    } else
      return Promise.resolve();
  }
  clear() {
    vt.batch(() => {
      F(this, vr).forEach((e) => {
        this.notify({ type: "removed", mutation: e });
      }), F(this, vr).clear(), F(this, In).clear();
    });
  }
  getAll() {
    return Array.from(F(this, vr));
  }
  find(e) {
    const n = { exact: !0, ...e };
    return this.getAll().find(
      (r) => Ow(n, r)
    );
  }
  findAll(e = {}) {
    return this.getAll().filter((n) => Ow(e, n));
  }
  notify(e) {
    vt.batch(() => {
      this.listeners.forEach((n) => {
        n(e);
      });
    });
  }
  resumePausedMutations() {
    const e = this.getAll().filter((n) => n.state.isPaused);
    return vt.batch(
      () => Promise.all(
        e.map((n) => n.continue().catch($t))
      )
    );
  }
}, vr = new WeakMap(), In = new WeakMap(), Za = new WeakMap(), iS);
function $u(t) {
  var e;
  return (e = t.options.scope) == null ? void 0 : e.id;
}
var Xn, sS, Hj = (sS = class extends pl {
  constructor(e = {}) {
    super();
    pe(this, Xn);
    this.config = e, ne(this, Xn, /* @__PURE__ */ new Map());
  }
  build(e, n, r) {
    const s = n.queryKey, a = n.queryHash ?? fy(s, n);
    let l = this.get(a);
    return l || (l = new Lj({
      client: e,
      queryKey: s,
      queryHash: a,
      options: e.defaultQueryOptions(n),
      state: r,
      defaultOptions: e.getQueryDefaults(s)
    }), this.add(l)), l;
  }
  add(e) {
    F(this, Xn).has(e.queryHash) || (F(this, Xn).set(e.queryHash, e), this.notify({
      type: "added",
      query: e
    }));
  }
  remove(e) {
    const n = F(this, Xn).get(e.queryHash);
    n && (e.destroy(), n === e && F(this, Xn).delete(e.queryHash), this.notify({ type: "removed", query: e }));
  }
  clear() {
    vt.batch(() => {
      this.getAll().forEach((e) => {
        this.remove(e);
      });
    });
  }
  get(e) {
    return F(this, Xn).get(e);
  }
  getAll() {
    return [...F(this, Xn).values()];
  }
  find(e) {
    const n = { exact: !0, ...e };
    return this.getAll().find(
      (r) => Fw(n, r)
    );
  }
  findAll(e = {}) {
    const n = this.getAll();
    return Object.keys(e).length > 0 ? n.filter((r) => Fw(e, r)) : n;
  }
  notify(e) {
    vt.batch(() => {
      this.listeners.forEach((n) => {
        n(e);
      });
    });
  }
  onFocus() {
    vt.batch(() => {
      this.getAll().forEach((e) => {
        e.onFocus();
      });
    });
  }
  onOnline() {
    vt.batch(() => {
      this.getAll().forEach((e) => {
        e.onOnline();
      });
    });
  }
}, Xn = new WeakMap(), sS), Xe, Jr, ei, ro, io, ti, so, oo, oS, Wj = (oS = class {
  constructor(t = {}) {
    pe(this, Xe);
    pe(this, Jr);
    pe(this, ei);
    pe(this, ro);
    pe(this, io);
    pe(this, ti);
    pe(this, so);
    pe(this, oo);
    ne(this, Xe, t.queryCache || new Hj()), ne(this, Jr, t.mutationCache || new $j()), ne(this, ei, t.defaultOptions || {}), ne(this, ro, /* @__PURE__ */ new Map()), ne(this, io, /* @__PURE__ */ new Map()), ne(this, ti, 0);
  }
  mount() {
    ku(this, ti)._++, F(this, ti) === 1 && (ne(this, so, cy.subscribe(async (t) => {
      t && (await this.resumePausedMutations(), F(this, Xe).onFocus());
    })), ne(this, oo, Mc.subscribe(async (t) => {
      t && (await this.resumePausedMutations(), F(this, Xe).onOnline());
    })));
  }
  unmount() {
    var t, e;
    ku(this, ti)._--, F(this, ti) === 0 && ((t = F(this, so)) == null || t.call(this), ne(this, so, void 0), (e = F(this, oo)) == null || e.call(this), ne(this, oo, void 0));
  }
  isFetching(t) {
    return F(this, Xe).findAll({ ...t, fetchStatus: "fetching" }).length;
  }
  isMutating(t) {
    return F(this, Jr).findAll({ ...t, status: "pending" }).length;
  }
  /**
   * Imperative (non-reactive) way to retrieve data for a QueryKey.
   * Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
   *
   * Hint: Do not use this function inside a component, because it won't receive updates.
   * Use `useQuery` to create a `QueryObserver` that subscribes to changes.
   */
  getQueryData(t) {
    var n;
    const e = this.defaultQueryOptions({ queryKey: t });
    return (n = F(this, Xe).get(e.queryHash)) == null ? void 0 : n.state.data;
  }
  ensureQueryData(t) {
    const e = this.defaultQueryOptions(t), n = F(this, Xe).build(this, e), r = n.state.data;
    return r === void 0 ? this.fetchQuery(t) : (t.revalidateIfStale && n.isStaleByTime(li(e.staleTime, n)) && this.prefetchQuery(e), Promise.resolve(r));
  }
  getQueriesData(t) {
    return F(this, Xe).findAll(t).map(({ queryKey: e, state: n }) => {
      const r = n.data;
      return [e, r];
    });
  }
  setQueryData(t, e, n) {
    const r = this.defaultQueryOptions({ queryKey: t }), s = F(this, Xe).get(
      r.queryHash
    ), a = s == null ? void 0 : s.state.data, l = kj(e, a);
    if (l !== void 0)
      return F(this, Xe).build(this, r).setData(l, { ...n, manual: !0 });
  }
  setQueriesData(t, e, n) {
    return vt.batch(
      () => F(this, Xe).findAll(t).map(({ queryKey: r }) => [
        r,
        this.setQueryData(r, e, n)
      ])
    );
  }
  getQueryState(t) {
    var n;
    const e = this.defaultQueryOptions({ queryKey: t });
    return (n = F(this, Xe).get(
      e.queryHash
    )) == null ? void 0 : n.state;
  }
  removeQueries(t) {
    const e = F(this, Xe);
    vt.batch(() => {
      e.findAll(t).forEach((n) => {
        e.remove(n);
      });
    });
  }
  resetQueries(t, e) {
    const n = F(this, Xe);
    return vt.batch(() => (n.findAll(t).forEach((r) => {
      r.reset();
    }), this.refetchQueries(
      {
        type: "active",
        ...t
      },
      e
    )));
  }
  cancelQueries(t, e = {}) {
    const n = { revert: !0, ...e }, r = vt.batch(
      () => F(this, Xe).findAll(t).map((s) => s.cancel(n))
    );
    return Promise.all(r).then($t).catch($t);
  }
  invalidateQueries(t, e = {}) {
    return vt.batch(() => (F(this, Xe).findAll(t).forEach((n) => {
      n.invalidate();
    }), (t == null ? void 0 : t.refetchType) === "none" ? Promise.resolve() : this.refetchQueries(
      {
        ...t,
        type: (t == null ? void 0 : t.refetchType) ?? (t == null ? void 0 : t.type) ?? "active"
      },
      e
    )));
  }
  refetchQueries(t, e = {}) {
    const n = {
      ...e,
      cancelRefetch: e.cancelRefetch ?? !0
    }, r = vt.batch(
      () => F(this, Xe).findAll(t).filter((s) => !s.isDisabled() && !s.isStatic()).map((s) => {
        let a = s.fetch(void 0, n);
        return n.throwOnError || (a = a.catch($t)), s.state.fetchStatus === "paused" ? Promise.resolve() : a;
      })
    );
    return Promise.all(r).then($t);
  }
  fetchQuery(t) {
    const e = this.defaultQueryOptions(t);
    e.retry === void 0 && (e.retry = !1);
    const n = F(this, Xe).build(this, e);
    return n.isStaleByTime(
      li(e.staleTime, n)
    ) ? n.fetch(e) : Promise.resolve(n.state.data);
  }
  prefetchQuery(t) {
    return this.fetchQuery(t).then($t).catch($t);
  }
  fetchInfiniteQuery(t) {
    return t._type = "infinite", this.fetchQuery(t);
  }
  prefetchInfiniteQuery(t) {
    return this.fetchInfiniteQuery(t).then($t).catch($t);
  }
  ensureInfiniteQueryData(t) {
    return t._type = "infinite", this.ensureQueryData(t);
  }
  resumePausedMutations() {
    return Mc.isOnline() ? F(this, Jr).resumePausedMutations() : Promise.resolve();
  }
  getQueryCache() {
    return F(this, Xe);
  }
  getMutationCache() {
    return F(this, Jr);
  }
  getDefaultOptions() {
    return F(this, ei);
  }
  setDefaultOptions(t) {
    ne(this, ei, t);
  }
  setQueryDefaults(t, e) {
    F(this, ro).set(Ha(t), {
      queryKey: t,
      defaultOptions: e
    });
  }
  getQueryDefaults(t) {
    const e = [...F(this, ro).values()], n = {};
    return e.forEach((r) => {
      Wa(t, r.queryKey) && Object.assign(n, r.defaultOptions);
    }), n;
  }
  setMutationDefaults(t, e) {
    F(this, io).set(Ha(t), {
      mutationKey: t,
      defaultOptions: e
    });
  }
  getMutationDefaults(t) {
    const e = [...F(this, io).values()], n = {};
    return e.forEach((r) => {
      Wa(t, r.mutationKey) && Object.assign(n, r.defaultOptions);
    }), n;
  }
  defaultQueryOptions(t) {
    if (t._defaulted)
      return t;
    const e = {
      ...F(this, ei).queries,
      ...this.getQueryDefaults(t.queryKey),
      ...t,
      _defaulted: !0
    };
    return e.queryHash || (e.queryHash = fy(
      e.queryKey,
      e
    )), e.refetchOnReconnect === void 0 && (e.refetchOnReconnect = e.networkMode !== "always"), e.throwOnError === void 0 && (e.throwOnError = !!e.suspense), !e.networkMode && e.persister && (e.networkMode = "offlineFirst"), e.queryFn === dy && (e.enabled = !1), e;
  }
  defaultMutationOptions(t) {
    return t != null && t._defaulted ? t : {
      ...F(this, ei).mutations,
      ...(t == null ? void 0 : t.mutationKey) && this.getMutationDefaults(t.mutationKey),
      ...t,
      _defaulted: !0
    };
  }
  clear() {
    F(this, Xe).clear(), F(this, Jr).clear();
  }
}, Xe = new WeakMap(), Jr = new WeakMap(), ei = new WeakMap(), ro = new WeakMap(), io = new WeakMap(), ti = new WeakMap(), so = new WeakMap(), oo = new WeakMap(), oS), ak = k.createContext(
  void 0
), lk = (t) => {
  const e = k.useContext(ak);
  if (!e)
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  return e;
}, Gj = ({
  client: t,
  children: e
}) => (k.useEffect(() => (t.mount(), () => {
  t.unmount();
}), [t]), /* @__PURE__ */ C.jsx(ak.Provider, { value: t, children: e })), uk = k.createContext(!1), Kj = () => k.useContext(uk);
uk.Provider;
function Qj() {
  let t = !1;
  return {
    clearReset: () => {
      t = !1;
    },
    reset: () => {
      t = !0;
    },
    isReset: () => t
  };
}
var Yj = k.createContext(Qj()), Xj = () => k.useContext(Yj), qj = (t, e, n) => {
  const r = n != null && n.state.error && typeof t.throwOnError == "function" ? ek(t.throwOnError, [n.state.error, n]) : t.throwOnError;
  (t.suspense || t.experimental_prefetchInRender || r) && (e.isReset() || (t.retryOnMount = !1));
}, Zj = (t) => {
  k.useEffect(() => {
    t.clearReset();
  }, [t]);
}, Jj = ({
  result: t,
  errorResetBoundary: e,
  throwOnError: n,
  query: r,
  suspense: s
}) => t.isError && !e.isReset() && !t.isFetching && r && (s && t.data === void 0 || ek(n, [t.error, r])), eV = (t) => {
  if (t.suspense) {
    const n = (s) => s === "static" ? s : Math.max(s ?? 1e3, 1e3), r = t.staleTime;
    t.staleTime = typeof r == "function" ? (...s) => n(r(...s)) : n(r), typeof t.gcTime == "number" && (t.gcTime = Math.max(
      t.gcTime,
      1e3
    ));
  }
}, tV = (t, e) => t.isLoading && t.isFetching && !e, nV = (t, e) => (t == null ? void 0 : t.suspense) && e.isPending, Uw = (t, e, n) => e.fetchOptimistic(t).catch(() => {
  n.clearReset();
});
function rV(t, e, n) {
  var g, S, _, x;
  const r = Kj(), s = Xj(), a = lk(), l = a.defaultQueryOptions(t);
  (S = (g = a.getDefaultOptions().queries) == null ? void 0 : g._experimental_beforeQuery) == null || S.call(
    g,
    l
  );
  const c = a.getQueryCache().get(l.queryHash), d = t.subscribed !== !1;
  l._optimisticResults = r ? "isRestoring" : d ? "optimistic" : void 0, eV(l), qj(l, s, c), Zj(s);
  const m = !a.getQueryCache().get(l.queryHash), [y] = k.useState(
    () => new e(
      a,
      l
    )
  ), f = y.getOptimisticResult(l), p = !r && d;
  if (k.useSyncExternalStore(
    k.useCallback(
      (T) => {
        const E = p ? y.subscribe(vt.batchCalls(T)) : $t;
        return y.updateResult(), E;
      },
      [y, p]
    ),
    () => y.getCurrentResult(),
    () => y.getCurrentResult()
  ), k.useEffect(() => {
    y.setOptions(l);
  }, [l, y]), nV(l, f))
    throw Uw(l, y, s);
  if (Jj({
    result: f,
    errorResetBoundary: s,
    throwOnError: l.throwOnError,
    query: c,
    suspense: l.suspense
  }))
    throw f.error;
  if ((x = (_ = a.getDefaultOptions().queries) == null ? void 0 : _._experimental_afterQuery) == null || x.call(
    _,
    l,
    f
  ), l.experimental_prefetchInRender && !Ga.isServer() && tV(f, r)) {
    const T = m ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      Uw(l, y, s)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      c == null ? void 0 : c.promise
    );
    T == null || T.catch($t).finally(() => {
      y.updateResult();
    });
  }
  return l.notifyOnChangeProps ? f : y.trackResult(f);
}
function ck(t, e) {
  return rV(t, jj);
}
const iV = new Wj();
function sV() {
  return ck({
    queryKey: ["focus-room", "sessions"],
    queryFn: () => Pc(),
    staleTime: 1e3
  });
}
function oV({ onWorkspace: t }) {
  const { data: e = [] } = sV();
  return /* @__PURE__ */ C.jsxs("section", { className: "history-stage", children: [
    /* @__PURE__ */ C.jsxs(Ea, { className: "history-main", children: [
      /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: "Synapse Focus Room" }),
      /* @__PURE__ */ C.jsx("h1", { children: "Study History" }),
      /* @__PURE__ */ C.jsx("p", { children: "Review recent Focus Room sessions saved on this device." }),
      /* @__PURE__ */ C.jsx("div", { className: "history-list", children: e.length ? e.map((n) => {
        const r = n.sessionDate || n.endedAt || n.startedAt || "", s = r ? new Date(r).toLocaleString() : "Saved session";
        return /* @__PURE__ */ C.jsxs("article", { className: "history-row liquid-glass-lite", children: [
          /* @__PURE__ */ C.jsx("strong", { children: n.materialTitle || "Study material" }),
          /* @__PURE__ */ C.jsxs("span", { children: [
            s,
            " / ",
            Wc(n.totalFocusTime || 0)
          ] }),
          n.studyGoal ? /* @__PURE__ */ C.jsx("p", { children: n.studyGoal }) : null,
          n.persisted === !1 ? /* @__PURE__ */ C.jsx("p", { children: "Not saved to device history" }) : null
        ] }, n.sessionId);
      }) : /* @__PURE__ */ C.jsx("p", { children: "No Focus Room sessions saved yet." }) })
    ] }),
    /* @__PURE__ */ C.jsxs(Ea, { className: "history-next", children: [
      /* @__PURE__ */ C.jsx("h2", { children: "Next step" }),
      /* @__PURE__ */ C.jsx("p", { children: "Choose a material from the workspace to start another protected study block." }),
      /* @__PURE__ */ C.jsx(_e, { variant: "primary", onClick: () => t(), children: "Open Workspace" })
    ] })
  ] });
}
function $w({ title: t, kicker: e, children: n }) {
  const r = Y((s) => s.closeDrawer);
  return /* @__PURE__ */ C.jsxs(
    Ot.aside,
    {
      className: "extra-panel drawer-open liquid-glass",
      initial: { opacity: 0, x: 28 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 28 },
      transition: _r,
      children: [
        /* @__PURE__ */ C.jsxs("div", { className: "drawer-head", children: [
          /* @__PURE__ */ C.jsxs("div", { children: [
            /* @__PURE__ */ C.jsx("span", { className: "focus-kicker", children: e }),
            /* @__PURE__ */ C.jsx("h2", { children: t })
          ] }),
          /* @__PURE__ */ C.jsx(_e, { "aria-label": `Close ${t}`, onClick: r, children: /* @__PURE__ */ C.jsx(al, { size: 16, "aria-hidden": "true" }) })
        ] }),
        n
      ]
    }
  );
}
function aV({ audioState: t }) {
  const e = Y((n) => n.activeDrawer);
  return /* @__PURE__ */ C.jsxs(mi, { children: [
    e === "scene" ? /* @__PURE__ */ C.jsx($w, { title: "Choose Scene", kicker: "Scene", children: /* @__PURE__ */ C.jsx(RT, {}) }) : null,
    e === "music" ? /* @__PURE__ */ C.jsx($w, { title: "Sound Atmosphere", kicker: "Music", children: /* @__PURE__ */ C.jsx(XC, { audioState: t }) }) : null
  ] });
}
var Dh = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var Hw;
function lV() {
  return Hw || (Hw = 1, (function(t) {
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
          var f = this || n;
          return f._counter = 1e3, f._html5AudioPool = [], f.html5PoolSize = 10, f._codecs = {}, f._howls = [], f._muted = !1, f._volume = 1, f._canPlayEvent = "canplaythrough", f._navigator = typeof window < "u" && window.navigator ? window.navigator : null, f.masterGain = null, f.noAudio = !1, f.usingWebAudio = !0, f.autoSuspend = !0, f.ctx = null, f.autoUnlock = !0, f._setup(), f;
        },
        /**
         * Get/set the global volume for all sounds.
         * @param  {Float} vol Volume from 0.0 to 1.0.
         * @return {Howler/Float}     Returns self or current volume.
         */
        volume: function(f) {
          var p = this || n;
          if (f = parseFloat(f), p.ctx || y(), typeof f < "u" && f >= 0 && f <= 1) {
            if (p._volume = f, p._muted)
              return p;
            p.usingWebAudio && p.masterGain.gain.setValueAtTime(f, n.ctx.currentTime);
            for (var g = 0; g < p._howls.length; g++)
              if (!p._howls[g]._webAudio)
                for (var S = p._howls[g]._getSoundIds(), _ = 0; _ < S.length; _++) {
                  var x = p._howls[g]._soundById(S[_]);
                  x && x._node && (x._node.volume = x._volume * f);
                }
            return p;
          }
          return p._volume;
        },
        /**
         * Handle muting and unmuting globally.
         * @param  {Boolean} muted Is muted or not.
         */
        mute: function(f) {
          var p = this || n;
          p.ctx || y(), p._muted = f, p.usingWebAudio && p.masterGain.gain.setValueAtTime(f ? 0 : p._volume, n.ctx.currentTime);
          for (var g = 0; g < p._howls.length; g++)
            if (!p._howls[g]._webAudio)
              for (var S = p._howls[g]._getSoundIds(), _ = 0; _ < S.length; _++) {
                var x = p._howls[g]._soundById(S[_]);
                x && x._node && (x._node.muted = f ? !0 : x._muted);
              }
          return p;
        },
        /**
         * Handle stopping all sounds globally.
         */
        stop: function() {
          for (var f = this || n, p = 0; p < f._howls.length; p++)
            f._howls[p].stop();
          return f;
        },
        /**
         * Unload and destroy all currently loaded Howl objects.
         * @return {Howler}
         */
        unload: function() {
          for (var f = this || n, p = f._howls.length - 1; p >= 0; p--)
            f._howls[p].unload();
          return f.usingWebAudio && f.ctx && typeof f.ctx.close < "u" && (f.ctx.close(), f.ctx = null, y()), f;
        },
        /**
         * Check for codec support of specific extension.
         * @param  {String} ext Audio file extention.
         * @return {Boolean}
         */
        codecs: function(f) {
          return (this || n)._codecs[f.replace(/^x-/, "")];
        },
        /**
         * Setup various state values for global tracking.
         * @return {Howler}
         */
        _setup: function() {
          var f = this || n;
          if (f.state = f.ctx && f.ctx.state || "suspended", f._autoSuspend(), !f.usingWebAudio)
            if (typeof Audio < "u")
              try {
                var p = new Audio();
                typeof p.oncanplaythrough > "u" && (f._canPlayEvent = "canplay");
              } catch {
                f.noAudio = !0;
              }
            else
              f.noAudio = !0;
          try {
            var p = new Audio();
            p.muted && (f.noAudio = !0);
          } catch {
          }
          return f.noAudio || f._setupCodecs(), f;
        },
        /**
         * Check for browser support for various codecs and cache the results.
         * @return {Howler}
         */
        _setupCodecs: function() {
          var f = this || n, p = null;
          try {
            p = typeof Audio < "u" ? new Audio() : null;
          } catch {
            return f;
          }
          if (!p || typeof p.canPlayType != "function")
            return f;
          var g = p.canPlayType("audio/mpeg;").replace(/^no$/, ""), S = f._navigator ? f._navigator.userAgent : "", _ = S.match(/OPR\/(\d+)/g), x = _ && parseInt(_[0].split("/")[1], 10) < 33, T = S.indexOf("Safari") !== -1 && S.indexOf("Chrome") === -1, E = S.match(/Version\/(.*?) /), A = T && E && parseInt(E[1], 10) < 15;
          return f._codecs = {
            mp3: !!(!x && (g || p.canPlayType("audio/mp3;").replace(/^no$/, ""))),
            mpeg: !!g,
            opus: !!p.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
            ogg: !!p.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            oga: !!p.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            wav: !!(p.canPlayType('audio/wav; codecs="1"') || p.canPlayType("audio/wav")).replace(/^no$/, ""),
            aac: !!p.canPlayType("audio/aac;").replace(/^no$/, ""),
            caf: !!p.canPlayType("audio/x-caf;").replace(/^no$/, ""),
            m4a: !!(p.canPlayType("audio/x-m4a;") || p.canPlayType("audio/m4a;") || p.canPlayType("audio/aac;")).replace(/^no$/, ""),
            m4b: !!(p.canPlayType("audio/x-m4b;") || p.canPlayType("audio/m4b;") || p.canPlayType("audio/aac;")).replace(/^no$/, ""),
            mp4: !!(p.canPlayType("audio/x-mp4;") || p.canPlayType("audio/mp4;") || p.canPlayType("audio/aac;")).replace(/^no$/, ""),
            weba: !!(!A && p.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            webm: !!(!A && p.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            dolby: !!p.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
            flac: !!(p.canPlayType("audio/x-flac;") || p.canPlayType("audio/flac;")).replace(/^no$/, "")
          }, f;
        },
        /**
         * Some browsers/devices will only allow audio to be played after a user interaction.
         * Attempt to automatically unlock audio on the first user interaction.
         * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         * @return {Howler}
         */
        _unlockAudio: function() {
          var f = this || n;
          if (!(f._audioUnlocked || !f.ctx)) {
            f._audioUnlocked = !1, f.autoUnlock = !1, !f._mobileUnloaded && f.ctx.sampleRate !== 44100 && (f._mobileUnloaded = !0, f.unload()), f._scratchBuffer = f.ctx.createBuffer(1, 1, 22050);
            var p = function(g) {
              for (; f._html5AudioPool.length < f.html5PoolSize; )
                try {
                  var S = new Audio();
                  S._unlocked = !0, f._releaseHtml5Audio(S);
                } catch {
                  f.noAudio = !0;
                  break;
                }
              for (var _ = 0; _ < f._howls.length; _++)
                if (!f._howls[_]._webAudio)
                  for (var x = f._howls[_]._getSoundIds(), T = 0; T < x.length; T++) {
                    var E = f._howls[_]._soundById(x[T]);
                    E && E._node && !E._node._unlocked && (E._node._unlocked = !0, E._node.load());
                  }
              f._autoResume();
              var A = f.ctx.createBufferSource();
              A.buffer = f._scratchBuffer, A.connect(f.ctx.destination), typeof A.start > "u" ? A.noteOn(0) : A.start(0), typeof f.ctx.resume == "function" && f.ctx.resume(), A.onended = function() {
                A.disconnect(0), f._audioUnlocked = !0, document.removeEventListener("touchstart", p, !0), document.removeEventListener("touchend", p, !0), document.removeEventListener("click", p, !0), document.removeEventListener("keydown", p, !0);
                for (var b = 0; b < f._howls.length; b++)
                  f._howls[b]._emit("unlock");
              };
            };
            return document.addEventListener("touchstart", p, !0), document.addEventListener("touchend", p, !0), document.addEventListener("click", p, !0), document.addEventListener("keydown", p, !0), f;
          }
        },
        /**
         * Get an unlocked HTML5 Audio object from the pool. If none are left,
         * return a new Audio object and throw a warning.
         * @return {Audio} HTML5 Audio object.
         */
        _obtainHtml5Audio: function() {
          var f = this || n;
          if (f._html5AudioPool.length)
            return f._html5AudioPool.pop();
          var p = new Audio().play();
          return p && typeof Promise < "u" && (p instanceof Promise || typeof p.then == "function") && p.catch(function() {
            console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
          }), new Audio();
        },
        /**
         * Return an activated HTML5 Audio object to the pool.
         * @return {Howler}
         */
        _releaseHtml5Audio: function(f) {
          var p = this || n;
          return f._unlocked && p._html5AudioPool.push(f), p;
        },
        /**
         * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
         * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
         * @return {Howler}
         */
        _autoSuspend: function() {
          var f = this;
          if (!(!f.autoSuspend || !f.ctx || typeof f.ctx.suspend > "u" || !n.usingWebAudio)) {
            for (var p = 0; p < f._howls.length; p++)
              if (f._howls[p]._webAudio) {
                for (var g = 0; g < f._howls[p]._sounds.length; g++)
                  if (!f._howls[p]._sounds[g]._paused)
                    return f;
              }
            return f._suspendTimer && clearTimeout(f._suspendTimer), f._suspendTimer = setTimeout(function() {
              if (f.autoSuspend) {
                f._suspendTimer = null, f.state = "suspending";
                var S = function() {
                  f.state = "suspended", f._resumeAfterSuspend && (delete f._resumeAfterSuspend, f._autoResume());
                };
                f.ctx.suspend().then(S, S);
              }
            }, 3e4), f;
          }
        },
        /**
         * Automatically resume the Web Audio AudioContext when a new sound is played.
         * @return {Howler}
         */
        _autoResume: function() {
          var f = this;
          if (!(!f.ctx || typeof f.ctx.resume > "u" || !n.usingWebAudio))
            return f.state === "running" && f.ctx.state !== "interrupted" && f._suspendTimer ? (clearTimeout(f._suspendTimer), f._suspendTimer = null) : f.state === "suspended" || f.state === "running" && f.ctx.state === "interrupted" ? (f.ctx.resume().then(function() {
              f.state = "running";
              for (var p = 0; p < f._howls.length; p++)
                f._howls[p]._emit("resume");
            }), f._suspendTimer && (clearTimeout(f._suspendTimer), f._suspendTimer = null)) : f.state === "suspending" && (f._resumeAfterSuspend = !0), f;
        }
      };
      var n = new e(), r = function(f) {
        var p = this;
        if (!f.src || f.src.length === 0) {
          console.error("An array of source files must be passed with any new Howl.");
          return;
        }
        p.init(f);
      };
      r.prototype = {
        /**
         * Initialize a new Howl group object.
         * @param  {Object} o Passed in properties for this group.
         * @return {Howl}
         */
        init: function(f) {
          var p = this;
          return n.ctx || y(), p._autoplay = f.autoplay || !1, p._format = typeof f.format != "string" ? f.format : [f.format], p._html5 = f.html5 || !1, p._muted = f.mute || !1, p._loop = f.loop || !1, p._pool = f.pool || 5, p._preload = typeof f.preload == "boolean" || f.preload === "metadata" ? f.preload : !0, p._rate = f.rate || 1, p._sprite = f.sprite || {}, p._src = typeof f.src != "string" ? f.src : [f.src], p._volume = f.volume !== void 0 ? f.volume : 1, p._xhr = {
            method: f.xhr && f.xhr.method ? f.xhr.method : "GET",
            headers: f.xhr && f.xhr.headers ? f.xhr.headers : null,
            withCredentials: f.xhr && f.xhr.withCredentials ? f.xhr.withCredentials : !1
          }, p._duration = 0, p._state = "unloaded", p._sounds = [], p._endTimers = {}, p._queue = [], p._playLock = !1, p._onend = f.onend ? [{ fn: f.onend }] : [], p._onfade = f.onfade ? [{ fn: f.onfade }] : [], p._onload = f.onload ? [{ fn: f.onload }] : [], p._onloaderror = f.onloaderror ? [{ fn: f.onloaderror }] : [], p._onplayerror = f.onplayerror ? [{ fn: f.onplayerror }] : [], p._onpause = f.onpause ? [{ fn: f.onpause }] : [], p._onplay = f.onplay ? [{ fn: f.onplay }] : [], p._onstop = f.onstop ? [{ fn: f.onstop }] : [], p._onmute = f.onmute ? [{ fn: f.onmute }] : [], p._onvolume = f.onvolume ? [{ fn: f.onvolume }] : [], p._onrate = f.onrate ? [{ fn: f.onrate }] : [], p._onseek = f.onseek ? [{ fn: f.onseek }] : [], p._onunlock = f.onunlock ? [{ fn: f.onunlock }] : [], p._onresume = [], p._webAudio = n.usingWebAudio && !p._html5, typeof n.ctx < "u" && n.ctx && n.autoUnlock && n._unlockAudio(), n._howls.push(p), p._autoplay && p._queue.push({
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
          var f = this, p = null;
          if (n.noAudio) {
            f._emit("loaderror", null, "No audio support.");
            return;
          }
          typeof f._src == "string" && (f._src = [f._src]);
          for (var g = 0; g < f._src.length; g++) {
            var S, _;
            if (f._format && f._format[g])
              S = f._format[g];
            else {
              if (_ = f._src[g], typeof _ != "string") {
                f._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              S = /^data:audio\/([^;,]+);/i.exec(_), S || (S = /\.([^.]+)$/.exec(_.split("?", 1)[0])), S && (S = S[1].toLowerCase());
            }
            if (S || console.warn('No file extension was found. Consider using the "format" property or specify an extension.'), S && n.codecs(S)) {
              p = f._src[g];
              break;
            }
          }
          if (!p) {
            f._emit("loaderror", null, "No codec support for selected audio sources.");
            return;
          }
          return f._src = p, f._state = "loading", window.location.protocol === "https:" && p.slice(0, 5) === "http:" && (f._html5 = !0, f._webAudio = !1), new s(f), f._webAudio && l(f), f;
        },
        /**
         * Play a sound or resume previous playback.
         * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Number}          Sound ID.
         */
        play: function(f, p) {
          var g = this, S = null;
          if (typeof f == "number")
            S = f, f = null;
          else {
            if (typeof f == "string" && g._state === "loaded" && !g._sprite[f])
              return null;
            if (typeof f > "u" && (f = "__default", !g._playLock)) {
              for (var _ = 0, x = 0; x < g._sounds.length; x++)
                g._sounds[x]._paused && !g._sounds[x]._ended && (_++, S = g._sounds[x]._id);
              _ === 1 ? f = null : S = null;
            }
          }
          var T = S ? g._soundById(S) : g._inactiveSound();
          if (!T)
            return null;
          if (S && !f && (f = T._sprite || "__default"), g._state !== "loaded") {
            T._sprite = f, T._ended = !1;
            var E = T._id;
            return g._queue.push({
              event: "play",
              action: function() {
                g.play(E);
              }
            }), E;
          }
          if (S && !T._paused)
            return p || g._loadQueue("play"), T._id;
          g._webAudio && n._autoResume();
          var A = Math.max(0, T._seek > 0 ? T._seek : g._sprite[f][0] / 1e3), b = Math.max(0, (g._sprite[f][0] + g._sprite[f][1]) / 1e3 - A), M = b * 1e3 / Math.abs(T._rate), B = g._sprite[f][0] / 1e3, I = (g._sprite[f][0] + g._sprite[f][1]) / 1e3;
          T._sprite = f, T._ended = !1;
          var O = function() {
            T._paused = !1, T._seek = A, T._start = B, T._stop = I, T._loop = !!(T._loop || g._sprite[f][2]);
          };
          if (A >= I) {
            g._ended(T);
            return;
          }
          var L = T._node;
          if (g._webAudio) {
            var $ = function() {
              g._playLock = !1, O(), g._refreshBuffer(T);
              var re = T._muted || g._muted ? 0 : T._volume;
              L.gain.setValueAtTime(re, n.ctx.currentTime), T._playStart = n.ctx.currentTime, typeof L.bufferSource.start > "u" ? T._loop ? L.bufferSource.noteGrainOn(0, A, 86400) : L.bufferSource.noteGrainOn(0, A, b) : T._loop ? L.bufferSource.start(0, A, 86400) : L.bufferSource.start(0, A, b), M !== 1 / 0 && (g._endTimers[T._id] = setTimeout(g._ended.bind(g, T), M)), p || setTimeout(function() {
                g._emit("play", T._id), g._loadQueue();
              }, 0);
            };
            n.state === "running" && n.ctx.state !== "interrupted" ? $() : (g._playLock = !0, g.once("resume", $), g._clearTimer(T._id));
          } else {
            var q = function() {
              L.currentTime = A, L.muted = T._muted || g._muted || n._muted || L.muted, L.volume = T._volume * n.volume(), L.playbackRate = T._rate;
              try {
                var re = L.play();
                if (re && typeof Promise < "u" && (re instanceof Promise || typeof re.then == "function") ? (g._playLock = !0, O(), re.then(function() {
                  g._playLock = !1, L._unlocked = !0, p ? g._loadQueue() : g._emit("play", T._id);
                }).catch(function() {
                  g._playLock = !1, g._emit("playerror", T._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), T._ended = !0, T._paused = !0;
                })) : p || (g._playLock = !1, O(), g._emit("play", T._id)), L.playbackRate = T._rate, L.paused) {
                  g._emit("playerror", T._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                f !== "__default" || T._loop ? g._endTimers[T._id] = setTimeout(g._ended.bind(g, T), M) : (g._endTimers[T._id] = function() {
                  g._ended(T), L.removeEventListener("ended", g._endTimers[T._id], !1);
                }, L.addEventListener("ended", g._endTimers[T._id], !1));
              } catch (ue) {
                g._emit("playerror", T._id, ue);
              }
            };
            L.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (L.src = g._src, L.load());
            var J = window && window.ejecta || !L.readyState && n._navigator.isCocoonJS;
            if (L.readyState >= 3 || J)
              q();
            else {
              g._playLock = !0, g._state = "loading";
              var ie = function() {
                g._state = "loaded", q(), L.removeEventListener(n._canPlayEvent, ie, !1);
              };
              L.addEventListener(n._canPlayEvent, ie, !1), g._clearTimer(T._id);
            }
          }
          return T._id;
        },
        /**
         * Pause playback and save current position.
         * @param  {Number} id The sound ID (empty to pause all in group).
         * @return {Howl}
         */
        pause: function(f) {
          var p = this;
          if (p._state !== "loaded" || p._playLock)
            return p._queue.push({
              event: "pause",
              action: function() {
                p.pause(f);
              }
            }), p;
          for (var g = p._getSoundIds(f), S = 0; S < g.length; S++) {
            p._clearTimer(g[S]);
            var _ = p._soundById(g[S]);
            if (_ && !_._paused && (_._seek = p.seek(g[S]), _._rateSeek = 0, _._paused = !0, p._stopFade(g[S]), _._node))
              if (p._webAudio) {
                if (!_._node.bufferSource)
                  continue;
                typeof _._node.bufferSource.stop > "u" ? _._node.bufferSource.noteOff(0) : _._node.bufferSource.stop(0), p._cleanBuffer(_._node);
              } else (!isNaN(_._node.duration) || _._node.duration === 1 / 0) && _._node.pause();
            arguments[1] || p._emit("pause", _ ? _._id : null);
          }
          return p;
        },
        /**
         * Stop playback and reset to start.
         * @param  {Number} id The sound ID (empty to stop all in group).
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Howl}
         */
        stop: function(f, p) {
          var g = this;
          if (g._state !== "loaded" || g._playLock)
            return g._queue.push({
              event: "stop",
              action: function() {
                g.stop(f);
              }
            }), g;
          for (var S = g._getSoundIds(f), _ = 0; _ < S.length; _++) {
            g._clearTimer(S[_]);
            var x = g._soundById(S[_]);
            x && (x._seek = x._start || 0, x._rateSeek = 0, x._paused = !0, x._ended = !0, g._stopFade(S[_]), x._node && (g._webAudio ? x._node.bufferSource && (typeof x._node.bufferSource.stop > "u" ? x._node.bufferSource.noteOff(0) : x._node.bufferSource.stop(0), g._cleanBuffer(x._node)) : (!isNaN(x._node.duration) || x._node.duration === 1 / 0) && (x._node.currentTime = x._start || 0, x._node.pause(), x._node.duration === 1 / 0 && g._clearSound(x._node))), p || g._emit("stop", x._id));
          }
          return g;
        },
        /**
         * Mute/unmute a single sound or all sounds in this Howl group.
         * @param  {Boolean} muted Set to true to mute and false to unmute.
         * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
         * @return {Howl}
         */
        mute: function(f, p) {
          var g = this;
          if (g._state !== "loaded" || g._playLock)
            return g._queue.push({
              event: "mute",
              action: function() {
                g.mute(f, p);
              }
            }), g;
          if (typeof p > "u")
            if (typeof f == "boolean")
              g._muted = f;
            else
              return g._muted;
          for (var S = g._getSoundIds(p), _ = 0; _ < S.length; _++) {
            var x = g._soundById(S[_]);
            x && (x._muted = f, x._interval && g._stopFade(x._id), g._webAudio && x._node ? x._node.gain.setValueAtTime(f ? 0 : x._volume, n.ctx.currentTime) : x._node && (x._node.muted = n._muted ? !0 : f), g._emit("mute", x._id));
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
          var f = this, p = arguments, g, S;
          if (p.length === 0)
            return f._volume;
          if (p.length === 1 || p.length === 2 && typeof p[1] > "u") {
            var _ = f._getSoundIds(), x = _.indexOf(p[0]);
            x >= 0 ? S = parseInt(p[0], 10) : g = parseFloat(p[0]);
          } else p.length >= 2 && (g = parseFloat(p[0]), S = parseInt(p[1], 10));
          var T;
          if (typeof g < "u" && g >= 0 && g <= 1) {
            if (f._state !== "loaded" || f._playLock)
              return f._queue.push({
                event: "volume",
                action: function() {
                  f.volume.apply(f, p);
                }
              }), f;
            typeof S > "u" && (f._volume = g), S = f._getSoundIds(S);
            for (var E = 0; E < S.length; E++)
              T = f._soundById(S[E]), T && (T._volume = g, p[2] || f._stopFade(S[E]), f._webAudio && T._node && !T._muted ? T._node.gain.setValueAtTime(g, n.ctx.currentTime) : T._node && !T._muted && (T._node.volume = g * n.volume()), f._emit("volume", T._id));
          } else
            return T = S ? f._soundById(S) : f._sounds[0], T ? T._volume : 0;
          return f;
        },
        /**
         * Fade a currently playing sound between two volumes (if no id is passed, all sounds will fade).
         * @param  {Number} from The value to fade from (0.0 to 1.0).
         * @param  {Number} to   The volume to fade to (0.0 to 1.0).
         * @param  {Number} len  Time in milliseconds to fade.
         * @param  {Number} id   The sound id (omit to fade all sounds).
         * @return {Howl}
         */
        fade: function(f, p, g, S) {
          var _ = this;
          if (_._state !== "loaded" || _._playLock)
            return _._queue.push({
              event: "fade",
              action: function() {
                _.fade(f, p, g, S);
              }
            }), _;
          f = Math.min(Math.max(0, parseFloat(f)), 1), p = Math.min(Math.max(0, parseFloat(p)), 1), g = parseFloat(g), _.volume(f, S);
          for (var x = _._getSoundIds(S), T = 0; T < x.length; T++) {
            var E = _._soundById(x[T]);
            if (E) {
              if (S || _._stopFade(x[T]), _._webAudio && !E._muted) {
                var A = n.ctx.currentTime, b = A + g / 1e3;
                E._volume = f, E._node.gain.setValueAtTime(f, A), E._node.gain.linearRampToValueAtTime(p, b);
              }
              _._startFadeInterval(E, f, p, g, x[T], typeof S > "u");
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
        _startFadeInterval: function(f, p, g, S, _, x) {
          var T = this, E = p, A = g - p, b = Math.abs(A / 0.01), M = Math.max(4, b > 0 ? S / b : S), B = Date.now();
          f._fadeTo = g, f._interval = setInterval(function() {
            var I = (Date.now() - B) / S;
            B = Date.now(), E += A * I, E = Math.round(E * 100) / 100, A < 0 ? E = Math.max(g, E) : E = Math.min(g, E), T._webAudio ? f._volume = E : T.volume(E, f._id, !0), x && (T._volume = E), (g < p && E <= g || g > p && E >= g) && (clearInterval(f._interval), f._interval = null, f._fadeTo = null, T.volume(g, f._id), T._emit("fade", f._id));
          }, M);
        },
        /**
         * Internal method that stops the currently playing fade when
         * a new fade starts, volume is changed or the sound is stopped.
         * @param  {Number} id The sound id.
         * @return {Howl}
         */
        _stopFade: function(f) {
          var p = this, g = p._soundById(f);
          return g && g._interval && (p._webAudio && g._node.gain.cancelScheduledValues(n.ctx.currentTime), clearInterval(g._interval), g._interval = null, p.volume(g._fadeTo, f), g._fadeTo = null, p._emit("fade", f)), p;
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
          var f = this, p = arguments, g, S, _;
          if (p.length === 0)
            return f._loop;
          if (p.length === 1)
            if (typeof p[0] == "boolean")
              g = p[0], f._loop = g;
            else
              return _ = f._soundById(parseInt(p[0], 10)), _ ? _._loop : !1;
          else p.length === 2 && (g = p[0], S = parseInt(p[1], 10));
          for (var x = f._getSoundIds(S), T = 0; T < x.length; T++)
            _ = f._soundById(x[T]), _ && (_._loop = g, f._webAudio && _._node && _._node.bufferSource && (_._node.bufferSource.loop = g, g && (_._node.bufferSource.loopStart = _._start || 0, _._node.bufferSource.loopEnd = _._stop, f.playing(x[T]) && (f.pause(x[T], !0), f.play(x[T], !0)))));
          return f;
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
          var f = this, p = arguments, g, S;
          if (p.length === 0)
            S = f._sounds[0]._id;
          else if (p.length === 1) {
            var _ = f._getSoundIds(), x = _.indexOf(p[0]);
            x >= 0 ? S = parseInt(p[0], 10) : g = parseFloat(p[0]);
          } else p.length === 2 && (g = parseFloat(p[0]), S = parseInt(p[1], 10));
          var T;
          if (typeof g == "number") {
            if (f._state !== "loaded" || f._playLock)
              return f._queue.push({
                event: "rate",
                action: function() {
                  f.rate.apply(f, p);
                }
              }), f;
            typeof S > "u" && (f._rate = g), S = f._getSoundIds(S);
            for (var E = 0; E < S.length; E++)
              if (T = f._soundById(S[E]), T) {
                f.playing(S[E]) && (T._rateSeek = f.seek(S[E]), T._playStart = f._webAudio ? n.ctx.currentTime : T._playStart), T._rate = g, f._webAudio && T._node && T._node.bufferSource ? T._node.bufferSource.playbackRate.setValueAtTime(g, n.ctx.currentTime) : T._node && (T._node.playbackRate = g);
                var A = f.seek(S[E]), b = (f._sprite[T._sprite][0] + f._sprite[T._sprite][1]) / 1e3 - A, M = b * 1e3 / Math.abs(T._rate);
                (f._endTimers[S[E]] || !T._paused) && (f._clearTimer(S[E]), f._endTimers[S[E]] = setTimeout(f._ended.bind(f, T), M)), f._emit("rate", T._id);
              }
          } else
            return T = f._soundById(S), T ? T._rate : f._rate;
          return f;
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
          var f = this, p = arguments, g, S;
          if (p.length === 0)
            f._sounds.length && (S = f._sounds[0]._id);
          else if (p.length === 1) {
            var _ = f._getSoundIds(), x = _.indexOf(p[0]);
            x >= 0 ? S = parseInt(p[0], 10) : f._sounds.length && (S = f._sounds[0]._id, g = parseFloat(p[0]));
          } else p.length === 2 && (g = parseFloat(p[0]), S = parseInt(p[1], 10));
          if (typeof S > "u")
            return 0;
          if (typeof g == "number" && (f._state !== "loaded" || f._playLock))
            return f._queue.push({
              event: "seek",
              action: function() {
                f.seek.apply(f, p);
              }
            }), f;
          var T = f._soundById(S);
          if (T)
            if (typeof g == "number" && g >= 0) {
              var E = f.playing(S);
              E && f.pause(S, !0), T._seek = g, T._ended = !1, f._clearTimer(S), !f._webAudio && T._node && !isNaN(T._node.duration) && (T._node.currentTime = g);
              var A = function() {
                E && f.play(S, !0), f._emit("seek", S);
              };
              if (E && !f._webAudio) {
                var b = function() {
                  f._playLock ? setTimeout(b, 0) : A();
                };
                setTimeout(b, 0);
              } else
                A();
            } else if (f._webAudio) {
              var M = f.playing(S) ? n.ctx.currentTime - T._playStart : 0, B = T._rateSeek ? T._rateSeek - T._seek : 0;
              return T._seek + (B + M * Math.abs(T._rate));
            } else
              return T._node.currentTime;
          return f;
        },
        /**
         * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
         * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
         * @return {Boolean} True if playing and false if not.
         */
        playing: function(f) {
          var p = this;
          if (typeof f == "number") {
            var g = p._soundById(f);
            return g ? !g._paused : !1;
          }
          for (var S = 0; S < p._sounds.length; S++)
            if (!p._sounds[S]._paused)
              return !0;
          return !1;
        },
        /**
         * Get the duration of this sound. Passing a sound id will return the sprite duration.
         * @param  {Number} id The sound id to check. If none is passed, return full source duration.
         * @return {Number} Audio duration in seconds.
         */
        duration: function(f) {
          var p = this, g = p._duration, S = p._soundById(f);
          return S && (g = p._sprite[S._sprite][1] / 1e3), g;
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
          for (var f = this, p = f._sounds, g = 0; g < p.length; g++)
            p[g]._paused || f.stop(p[g]._id), f._webAudio || (f._clearSound(p[g]._node), p[g]._node.removeEventListener("error", p[g]._errorFn, !1), p[g]._node.removeEventListener(n._canPlayEvent, p[g]._loadFn, !1), p[g]._node.removeEventListener("ended", p[g]._endFn, !1), n._releaseHtml5Audio(p[g]._node)), delete p[g]._node, f._clearTimer(p[g]._id);
          var S = n._howls.indexOf(f);
          S >= 0 && n._howls.splice(S, 1);
          var _ = !0;
          for (g = 0; g < n._howls.length; g++)
            if (n._howls[g]._src === f._src || f._src.indexOf(n._howls[g]._src) >= 0) {
              _ = !1;
              break;
            }
          return a && _ && delete a[f._src], n.noAudio = !1, f._state = "unloaded", f._sounds = [], f = null, null;
        },
        /**
         * Listen to a custom event.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
         * @return {Howl}
         */
        on: function(f, p, g, S) {
          var _ = this, x = _["_on" + f];
          return typeof p == "function" && x.push(S ? { id: g, fn: p, once: S } : { id: g, fn: p }), _;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(f, p, g) {
          var S = this, _ = S["_on" + f], x = 0;
          if (typeof p == "number" && (g = p, p = null), p || g)
            for (x = 0; x < _.length; x++) {
              var T = g === _[x].id;
              if (p === _[x].fn && T || !p && T) {
                _.splice(x, 1);
                break;
              }
            }
          else if (f)
            S["_on" + f] = [];
          else {
            var E = Object.keys(S);
            for (x = 0; x < E.length; x++)
              E[x].indexOf("_on") === 0 && Array.isArray(S[E[x]]) && (S[E[x]] = []);
          }
          return S;
        },
        /**
         * Listen to a custom event and remove it once fired.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @return {Howl}
         */
        once: function(f, p, g) {
          var S = this;
          return S.on(f, p, g, 1), S;
        },
        /**
         * Emit all events of a specific type and pass the sound id.
         * @param  {String} event Event name.
         * @param  {Number} id    Sound ID.
         * @param  {Number} msg   Message to go with event.
         * @return {Howl}
         */
        _emit: function(f, p, g) {
          for (var S = this, _ = S["_on" + f], x = _.length - 1; x >= 0; x--)
            (!_[x].id || _[x].id === p || f === "load") && (setTimeout((function(T) {
              T.call(this, p, g);
            }).bind(S, _[x].fn), 0), _[x].once && S.off(f, _[x].fn, _[x].id));
          return S._loadQueue(f), S;
        },
        /**
         * Queue of actions initiated before the sound has loaded.
         * These will be called in sequence, with the next only firing
         * after the previous has finished executing (even if async like play).
         * @return {Howl}
         */
        _loadQueue: function(f) {
          var p = this;
          if (p._queue.length > 0) {
            var g = p._queue[0];
            g.event === f && (p._queue.shift(), p._loadQueue()), f || g.action();
          }
          return p;
        },
        /**
         * Fired when playback ends at the end of the duration.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _ended: function(f) {
          var p = this, g = f._sprite;
          if (!p._webAudio && f._node && !f._node.paused && !f._node.ended && f._node.currentTime < f._stop)
            return setTimeout(p._ended.bind(p, f), 100), p;
          var S = !!(f._loop || p._sprite[g][2]);
          if (p._emit("end", f._id), !p._webAudio && S && p.stop(f._id, !0).play(f._id), p._webAudio && S) {
            p._emit("play", f._id), f._seek = f._start || 0, f._rateSeek = 0, f._playStart = n.ctx.currentTime;
            var _ = (f._stop - f._start) * 1e3 / Math.abs(f._rate);
            p._endTimers[f._id] = setTimeout(p._ended.bind(p, f), _);
          }
          return p._webAudio && !S && (f._paused = !0, f._ended = !0, f._seek = f._start || 0, f._rateSeek = 0, p._clearTimer(f._id), p._cleanBuffer(f._node), n._autoSuspend()), !p._webAudio && !S && p.stop(f._id, !0), p;
        },
        /**
         * Clear the end timer for a sound playback.
         * @param  {Number} id The sound ID.
         * @return {Howl}
         */
        _clearTimer: function(f) {
          var p = this;
          if (p._endTimers[f]) {
            if (typeof p._endTimers[f] != "function")
              clearTimeout(p._endTimers[f]);
            else {
              var g = p._soundById(f);
              g && g._node && g._node.removeEventListener("ended", p._endTimers[f], !1);
            }
            delete p._endTimers[f];
          }
          return p;
        },
        /**
         * Return the sound identified by this ID, or return null.
         * @param  {Number} id Sound ID
         * @return {Object}    Sound object or null.
         */
        _soundById: function(f) {
          for (var p = this, g = 0; g < p._sounds.length; g++)
            if (f === p._sounds[g]._id)
              return p._sounds[g];
          return null;
        },
        /**
         * Return an inactive sound from the pool or create a new one.
         * @return {Sound} Sound playback object.
         */
        _inactiveSound: function() {
          var f = this;
          f._drain();
          for (var p = 0; p < f._sounds.length; p++)
            if (f._sounds[p]._ended)
              return f._sounds[p].reset();
          return new s(f);
        },
        /**
         * Drain excess inactive sounds from the pool.
         */
        _drain: function() {
          var f = this, p = f._pool, g = 0, S = 0;
          if (!(f._sounds.length < p)) {
            for (S = 0; S < f._sounds.length; S++)
              f._sounds[S]._ended && g++;
            for (S = f._sounds.length - 1; S >= 0; S--) {
              if (g <= p)
                return;
              f._sounds[S]._ended && (f._webAudio && f._sounds[S]._node && f._sounds[S]._node.disconnect(0), f._sounds.splice(S, 1), g--);
            }
          }
        },
        /**
         * Get all ID's from the sounds pool.
         * @param  {Number} id Only return one ID if one is passed.
         * @return {Array}    Array of IDs.
         */
        _getSoundIds: function(f) {
          var p = this;
          if (typeof f > "u") {
            for (var g = [], S = 0; S < p._sounds.length; S++)
              g.push(p._sounds[S]._id);
            return g;
          } else
            return [f];
        },
        /**
         * Load the sound back into the buffer source.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _refreshBuffer: function(f) {
          var p = this;
          return f._node.bufferSource = n.ctx.createBufferSource(), f._node.bufferSource.buffer = a[p._src], f._panner ? f._node.bufferSource.connect(f._panner) : f._node.bufferSource.connect(f._node), f._node.bufferSource.loop = f._loop, f._loop && (f._node.bufferSource.loopStart = f._start || 0, f._node.bufferSource.loopEnd = f._stop || 0), f._node.bufferSource.playbackRate.setValueAtTime(f._rate, n.ctx.currentTime), p;
        },
        /**
         * Prevent memory leaks by cleaning up the buffer source after playback.
         * @param  {Object} node Sound's audio node containing the buffer source.
         * @return {Howl}
         */
        _cleanBuffer: function(f) {
          var p = this, g = n._navigator && n._navigator.vendor.indexOf("Apple") >= 0;
          if (!f.bufferSource)
            return p;
          if (n._scratchBuffer && f.bufferSource && (f.bufferSource.onended = null, f.bufferSource.disconnect(0), g))
            try {
              f.bufferSource.buffer = n._scratchBuffer;
            } catch {
            }
          return f.bufferSource = null, p;
        },
        /**
         * Set the source to a 0-second silence to stop any downloading (except in IE).
         * @param  {Object} node Audio node to clear.
         */
        _clearSound: function(f) {
          var p = /MSIE |Trident\//.test(n._navigator && n._navigator.userAgent);
          p || (f.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        }
      };
      var s = function(f) {
        this._parent = f, this.init();
      };
      s.prototype = {
        /**
         * Initialize a new Sound object.
         * @return {Sound}
         */
        init: function() {
          var f = this, p = f._parent;
          return f._muted = p._muted, f._loop = p._loop, f._volume = p._volume, f._rate = p._rate, f._seek = 0, f._paused = !0, f._ended = !0, f._sprite = "__default", f._id = ++n._counter, p._sounds.push(f), f.create(), f;
        },
        /**
         * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
         * @return {Sound}
         */
        create: function() {
          var f = this, p = f._parent, g = n._muted || f._muted || f._parent._muted ? 0 : f._volume;
          return p._webAudio ? (f._node = typeof n.ctx.createGain > "u" ? n.ctx.createGainNode() : n.ctx.createGain(), f._node.gain.setValueAtTime(g, n.ctx.currentTime), f._node.paused = !0, f._node.connect(n.masterGain)) : n.noAudio || (f._node = n._obtainHtml5Audio(), f._errorFn = f._errorListener.bind(f), f._node.addEventListener("error", f._errorFn, !1), f._loadFn = f._loadListener.bind(f), f._node.addEventListener(n._canPlayEvent, f._loadFn, !1), f._endFn = f._endListener.bind(f), f._node.addEventListener("ended", f._endFn, !1), f._node.src = p._src, f._node.preload = p._preload === !0 ? "auto" : p._preload, f._node.volume = g * n.volume(), f._node.load()), f;
        },
        /**
         * Reset the parameters of this sound to the original state (for recycle).
         * @return {Sound}
         */
        reset: function() {
          var f = this, p = f._parent;
          return f._muted = p._muted, f._loop = p._loop, f._volume = p._volume, f._rate = p._rate, f._seek = 0, f._rateSeek = 0, f._paused = !0, f._ended = !0, f._sprite = "__default", f._id = ++n._counter, f;
        },
        /**
         * HTML5 Audio error listener callback.
         */
        _errorListener: function() {
          var f = this;
          f._parent._emit("loaderror", f._id, f._node.error ? f._node.error.code : 0), f._node.removeEventListener("error", f._errorFn, !1);
        },
        /**
         * HTML5 Audio canplaythrough listener callback.
         */
        _loadListener: function() {
          var f = this, p = f._parent;
          p._duration = Math.ceil(f._node.duration * 10) / 10, Object.keys(p._sprite).length === 0 && (p._sprite = { __default: [0, p._duration * 1e3] }), p._state !== "loaded" && (p._state = "loaded", p._emit("load"), p._loadQueue()), f._node.removeEventListener(n._canPlayEvent, f._loadFn, !1);
        },
        /**
         * HTML5 Audio ended listener callback.
         */
        _endListener: function() {
          var f = this, p = f._parent;
          p._duration === 1 / 0 && (p._duration = Math.ceil(f._node.duration * 10) / 10, p._sprite.__default[1] === 1 / 0 && (p._sprite.__default[1] = p._duration * 1e3), p._ended(f)), f._node.removeEventListener("ended", f._endFn, !1);
        }
      };
      var a = {}, l = function(f) {
        var p = f._src;
        if (a[p]) {
          f._duration = a[p].duration, m(f);
          return;
        }
        if (/^data:[^;]+;base64,/.test(p)) {
          for (var g = atob(p.split(",")[1]), S = new Uint8Array(g.length), _ = 0; _ < g.length; ++_)
            S[_] = g.charCodeAt(_);
          d(S.buffer, f);
        } else {
          var x = new XMLHttpRequest();
          x.open(f._xhr.method, p, !0), x.withCredentials = f._xhr.withCredentials, x.responseType = "arraybuffer", f._xhr.headers && Object.keys(f._xhr.headers).forEach(function(T) {
            x.setRequestHeader(T, f._xhr.headers[T]);
          }), x.onload = function() {
            var T = (x.status + "")[0];
            if (T !== "0" && T !== "2" && T !== "3") {
              f._emit("loaderror", null, "Failed loading audio file with status: " + x.status + ".");
              return;
            }
            d(x.response, f);
          }, x.onerror = function() {
            f._webAudio && (f._html5 = !0, f._webAudio = !1, f._sounds = [], delete a[p], f.load());
          }, c(x);
        }
      }, c = function(f) {
        try {
          f.send();
        } catch {
          f.onerror();
        }
      }, d = function(f, p) {
        var g = function() {
          p._emit("loaderror", null, "Decoding audio data failed.");
        }, S = function(_) {
          _ && p._sounds.length > 0 ? (a[p._src] = _, m(p, _)) : g();
        };
        typeof Promise < "u" && n.ctx.decodeAudioData.length === 1 ? n.ctx.decodeAudioData(f).then(S).catch(g) : n.ctx.decodeAudioData(f, S, g);
      }, m = function(f, p) {
        p && !f._duration && (f._duration = p.duration), Object.keys(f._sprite).length === 0 && (f._sprite = { __default: [0, f._duration * 1e3] }), f._state !== "loaded" && (f._state = "loaded", f._emit("load"), f._loadQueue());
      }, y = function() {
        if (n.usingWebAudio) {
          try {
            typeof AudioContext < "u" ? n.ctx = new AudioContext() : typeof webkitAudioContext < "u" ? n.ctx = new webkitAudioContext() : n.usingWebAudio = !1;
          } catch {
            n.usingWebAudio = !1;
          }
          n.ctx || (n.usingWebAudio = !1);
          var f = /iP(hone|od|ad)/.test(n._navigator && n._navigator.platform), p = n._navigator && n._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), g = p ? parseInt(p[1], 10) : null;
          if (f && g && g < 9) {
            var S = /safari/.test(n._navigator && n._navigator.userAgent.toLowerCase());
            n._navigator && !S && (n.usingWebAudio = !1);
          }
          n.usingWebAudio && (n.masterGain = typeof n.ctx.createGain > "u" ? n.ctx.createGainNode() : n.ctx.createGain(), n.masterGain.gain.setValueAtTime(n._muted ? 0 : n._volume, n.ctx.currentTime), n.masterGain.connect(n.ctx.destination)), n._setup();
        }
      };
      t.Howler = n, t.Howl = r, typeof ca < "u" ? (ca.HowlerGlobal = e, ca.Howler = n, ca.Howl = r, ca.Sound = s) : typeof window < "u" && (window.HowlerGlobal = e, window.Howler = n, window.Howl = r, window.Sound = s);
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
        var d = this;
        if (!d.ctx || !d.ctx.listener)
          return d;
        var m = d._orientation;
        if (r = typeof r != "number" ? m[1] : r, s = typeof s != "number" ? m[2] : s, a = typeof a != "number" ? m[3] : a, l = typeof l != "number" ? m[4] : l, c = typeof c != "number" ? m[5] : c, typeof n == "number")
          d._orientation = [n, r, s, a, l, c], typeof d.ctx.listener.forwardX < "u" ? (d.ctx.listener.forwardX.setTargetAtTime(n, Howler.ctx.currentTime, 0.1), d.ctx.listener.forwardY.setTargetAtTime(r, Howler.ctx.currentTime, 0.1), d.ctx.listener.forwardZ.setTargetAtTime(s, Howler.ctx.currentTime, 0.1), d.ctx.listener.upX.setTargetAtTime(a, Howler.ctx.currentTime, 0.1), d.ctx.listener.upY.setTargetAtTime(l, Howler.ctx.currentTime, 0.1), d.ctx.listener.upZ.setTargetAtTime(c, Howler.ctx.currentTime, 0.1)) : d.ctx.listener.setOrientation(n, r, s, a, l, c);
        else
          return m;
        return d;
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
          var d = s._soundById(l[c]);
          if (d)
            if (typeof n == "number")
              d._stereo = n, d._pos = [n, 0, 0], d._node && (d._pannerAttr.panningModel = "equalpower", (!d._panner || !d._panner.pan) && e(d, a), a === "spatial" ? typeof d._panner.positionX < "u" ? (d._panner.positionX.setValueAtTime(n, Howler.ctx.currentTime), d._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime), d._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime)) : d._panner.setPosition(n, 0, 0) : d._panner.pan.setValueAtTime(n, Howler.ctx.currentTime)), s._emit("stereo", d._id);
            else
              return d._stereo;
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
        for (var c = l._getSoundIds(a), d = 0; d < c.length; d++) {
          var m = l._soundById(c[d]);
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
        for (var c = l._getSoundIds(a), d = 0; d < c.length; d++) {
          var m = l._soundById(c[d]);
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
        for (var c = n._getSoundIds(a), d = 0; d < c.length; d++)
          if (l = n._soundById(c[d]), l) {
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
            var y = l._panner;
            y || (l._pos || (l._pos = n._pos || [0, 0, -0.5]), e(l, "spatial"), y = l._panner), y.coneInnerAngle = m.coneInnerAngle, y.coneOuterAngle = m.coneOuterAngle, y.coneOuterGain = m.coneOuterGain, y.distanceModel = m.distanceModel, y.maxDistance = m.maxDistance, y.refDistance = m.refDistance, y.rolloffFactor = m.rolloffFactor, y.panningModel = m.panningModel;
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
  })(Dh)), Dh;
}
var uV = lV();
const cV = /* @__PURE__ */ lS(uV), { Howl: fk } = cV, Xp = 500, wn = {
  music: null,
  ambient: /* @__PURE__ */ new Map()
};
let Ls = {}, ba = !1, qp = "";
function Ka() {
  return typeof fk == "function";
}
function Ww(t, e = 50) {
  const n = Number(t), r = Number.isFinite(n) ? n : e;
  return Math.min(1, Math.max(0, r / 100));
}
function dk(t) {
  return new fk({
    src: [t],
    loop: !0,
    html5: !0,
    preload: !0,
    volume: 0
  });
}
function hk(t, e, n = Xp) {
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
function qc(t, { unload: e = !1 } = {}) {
  var n;
  t && (hk(t, 0, Math.min(Xp, 300)), (n = globalThis.setTimeout) == null || n.call(globalThis, () => {
    try {
      t.pause(), e && t.unload();
    } catch {
    }
  }, Math.min(Xp, 320)));
}
function fV(t) {
  return !(t != null && t.streamUrl) || !Ka() ? null : ((!wn.music || wn.music.__synapseSrc !== t.streamUrl) && (qc(wn.music, { unload: !0 }), wn.music = dk(t.streamUrl), wn.music.__synapseSrc = t.streamUrl), wn.music);
}
function dV(t) {
  if (!(t != null && t.streamUrl) || !Ka()) return null;
  const e = t.id || t.streamUrl, n = wn.ambient.get(e);
  if (n && n.__synapseSrc === t.streamUrl) return n;
  qc(n, { unload: !0 });
  const r = dk(t.streamUrl);
  return r.__synapseSrc = t.streamUrl, wn.ambient.set(e, r), r;
}
function hV() {
  return [
    wn.music,
    ...wn.ambient.values()
  ].filter(Boolean);
}
function pk() {
  hV().forEach((t) => qc(t));
}
function pV(t) {
  for (const [e, n] of wn.ambient.entries())
    t.has(e) || (qc(n, { unload: !0 }), wn.ambient.delete(e));
}
function Gw(t, e) {
  if (t)
    try {
      t.playing() || t.play(), hk(t, e), qp = "";
    } catch (n) {
      qp = (n == null ? void 0 : n.message) || "Audio playback is blocked until the browser receives a user action.";
    }
}
async function mV(t = {}) {
  Ls = { ...Ls, ...t };
  const e = $c(Ls);
  if (!Ka()) return oc(e);
  if (!ba)
    return pk(), oc(e);
  const n = fV(e.musicTrack), r = Ww(Ls.musicVolume, 60), s = Ww(Ls.ambientVolume, 50), a = /* @__PURE__ */ new Set(), l = [];
  return e.ambientLayers.forEach((c) => {
    const d = c.id || c.streamUrl;
    a.add(d);
    const m = dV(c), y = Math.min(1, Math.max(0, s * (c.volumeBias ?? 1)));
    l.push([m, y]);
  }), pV(a), Gw(n, r), l.forEach(([c, d]) => Gw(c, d)), oc(e);
}
function yV(t) {
  return ba = !!t, ba || pk(), ba;
}
function oc(t = $c(Ls)) {
  var e, n, r, s;
  return {
    available: Ka(),
    playing: ba && Ka(),
    musicTitle: ((e = t.musicTrack) == null ? void 0 : e.title) || "",
    musicArtist: ((n = t.musicTrack) == null ? void 0 : n.artist) || "",
    musicPageUrl: ((r = t.musicTrack) == null ? void 0 : r.pageUrl) || "",
    musicAttribution: ((s = t.musicTrack) == null ? void 0 : s.attribution) || "",
    ambientTitles: t.ambientLayers.map((a) => a.title).filter(Boolean),
    ambientPageUrls: t.ambientLayers.map((a) => a.pageUrl).filter(Boolean),
    ambientAttributions: t.ambientLayers.map((a) => a.attribution).filter(Boolean),
    error: qp
  };
}
const gV = "synapse.focusRoom.audioPrefs.v1";
function vV(t) {
  var e;
  try {
    (e = globalThis.localStorage) == null || e.setItem(gV, JSON.stringify({
      musicType: t.musicType,
      ambientSound: t.ambientSound,
      musicVolume: t.musicVolume,
      ambientVolume: t.ambientVolume,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
  } catch {
  }
}
function _V() {
  const t = Y((c) => c.musicType), e = Y((c) => c.ambientSound), n = Y((c) => c.musicVolume), r = Y((c) => c.ambientVolume), s = Y((c) => c.audioPlaying), [a, l] = k.useState(() => oc($c({
    musicType: t,
    ambientSound: e
  })));
  return k.useEffect(() => {
    const c = { musicType: t, ambientSound: e, musicVolume: n, ambientVolume: r };
    let d = !1;
    return yV(s), vV(c), mV(c).then((m) => {
      d || l(m);
    }), () => {
      d = !0;
    };
  }, [e, r, s, t, n]), a;
}
function wV() {
  const t = Y(), e = k.useCallback(async (r = "", s = "") => {
    var d;
    t.pauseTimer({ pauseAudio: !0 }), t.closeSummary();
    const a = typeof r == "string" || typeof r == "number" ? r : "", l = typeof s == "string" ? s : "", c = String(a || t.selectedMaterialId || ((d = t.selectedMaterial) == null ? void 0 : d.materialId) || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace == "function")
      try {
        const m = globalThis.returnFromFocusRoomToWorkspace(c);
        m && typeof m.then == "function" && await m, Kw(l);
        return;
      } catch (m) {
        console.error("Could not return from Focus Room:", m);
      }
    globalThis.location.hash = "", Kw(l);
  }, [t]), n = k.useMemo(() => ({
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
      globalThis.location.hash = "#/study-history";
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
  return globalThis.__synapseFocusRoomApi = n, k.useEffect(() => {
    globalThis.__synapseFocusRoomApi = n;
  }, [n]), {
    ...t,
    returnToWorkspace: e
  };
}
function SV(t) {
  const e = String(t || "").trim().toLowerCase();
  return ["flashcards", "quiz", "assistant", "mindmap", "timeline"].includes(e) ? e : "";
}
function Kw(t) {
  const e = SV(t);
  if (!e) return;
  const n = () => {
    if (e === "assistant") {
      typeof globalThis.openAssistant == "function" && globalThis.openAssistant();
      return;
    }
    typeof globalThis.switchTool == "function" && globalThis.switchTool(e);
  };
  typeof globalThis.requestAnimationFrame == "function" ? globalThis.requestAnimationFrame(n) : setTimeout(n, 0);
}
function xV(t = 3e3) {
  const e = Y((r) => r.setIdle), n = Y((r) => r.isIdle);
  return k.useEffect(() => {
    let r;
    const s = () => {
      e(!1), clearTimeout(r), r = setTimeout(() => e(!0), t);
    };
    return window.addEventListener("mousemove", s), window.addEventListener("keydown", s), window.addEventListener("click", s), s(), () => {
      clearTimeout(r), window.removeEventListener("mousemove", s), window.removeEventListener("keydown", s), window.removeEventListener("click", s);
    };
  }, [t, e]), n;
}
function TV() {
  const t = Y((r) => r.timerStatus), e = Y((r) => r.view), n = Y((r) => r.tickTimer);
  k.useEffect(() => {
    if (e !== "session" || t !== "studying") return;
    const r = window.setInterval(n, 1e3);
    return () => window.clearInterval(r);
  }, [n, t, e]);
}
function CV() {
  const t = Y((e) => e.selectedScene);
  return $a(t);
}
function kV(t) {
  const e = lk(), n = Y((a) => a.hydrateFocusRoute), r = Y((a) => a.showStudyHistory), s = ck({
    queryKey: ["focus-room", "materials"],
    queryFn: () => Hc(),
    staleTime: 1e3
  });
  return k.useEffect(() => {
    const a = () => {
      e.invalidateQueries({ queryKey: ["focus-room", "materials"] }), e.invalidateQueries({ queryKey: ["focus-room", "sessions"] });
    };
    return window.addEventListener("synapse-focus-room-materials-updated", a), window.addEventListener("storage", a), () => {
      window.removeEventListener("synapse-focus-room-materials-updated", a), window.removeEventListener("storage", a);
    };
  }, [e]), k.useEffect(() => {
    if (t.name === "history") {
      r();
      return;
    }
    if (t.name !== "focus") return;
    const a = t.materialId ? Cp(t.materialId) : Cp("");
    n(t, a || null, { preserveSession: !0 });
  }, [n, s.data, t, r]), s;
}
function PV() {
  const [t, e] = k.useState(() => Qw());
  k.useEffect(() => {
    const y = () => e(Qw());
    return window.addEventListener("hashchange", y), () => window.removeEventListener("hashchange", y);
  }, []);
  const n = k.useMemo(() => wN(t), [t]), r = Y((y) => y.view), s = xV(3e3), a = CV(), l = _V(), c = wV();
  kV(n), TV();
  const d = () => {
    globalThis.location.hash = "#/study-history";
  }, m = (...y) => {
    c.returnToWorkspace(...y);
  };
  return /* @__PURE__ */ C.jsxs(
    "main",
    {
      id: "focusRoomSurface",
      className: `focus-room-surface react-focus-room ${s ? "is-idle" : ""}`.trim(),
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ C.jsx(SI, { scene: a }),
        /* @__PURE__ */ C.jsx(mi, { mode: "wait", children: r === "history" ? /* @__PURE__ */ C.jsx(
          Ot.div,
          {
            className: "focus-room-view focus-history-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: _r,
            children: /* @__PURE__ */ C.jsx(oV, { onWorkspace: m })
          },
          "history"
        ) : r === "session" ? /* @__PURE__ */ C.jsxs(
          Ot.div,
          {
            className: "focus-room-view focus-session-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: _r,
            children: [
              /* @__PURE__ */ C.jsx(aj, { onWorkspace: m, onHistory: d }),
              /* @__PURE__ */ C.jsx("section", { className: "focus-session-stage", children: /* @__PURE__ */ C.jsx(oj, {}) }),
              /* @__PURE__ */ C.jsx(lj, { audioState: l }),
              /* @__PURE__ */ C.jsx(aV, { audioState: l }),
              /* @__PURE__ */ C.jsx(yj, {}),
              /* @__PURE__ */ C.jsx(gj, {}),
              /* @__PURE__ */ C.jsx(vj, { onWorkspace: m }),
              /* @__PURE__ */ C.jsx(mj, { onWorkspace: m }),
              /* @__PURE__ */ C.jsx(_j, { onWorkspace: m, onHistory: d })
            ]
          },
          "session"
        ) : /* @__PURE__ */ C.jsx(
          Ot.div,
          {
            className: "focus-room-view focus-room-setup-view",
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: _r,
            children: /* @__PURE__ */ C.jsx(rj, { audioState: l, onWorkspace: m, onHistory: d })
          },
          "setup"
        ) })
      ]
    }
  );
}
function Qw() {
  var e;
  return String(((e = globalThis.location) == null ? void 0 : e.hash) || "#/focus-room").replace(/^#/, "") || "/focus-room";
}
let Fh = null;
function EV(t, e) {
  const n = globalThis.__synapseFocusRoomApi || {};
  if (typeof n[t] != "function") {
    console.warn(`Synapse Focus Room action "${t}" is not available yet.`);
    return;
  }
  return n[t](...e);
}
function AV() {
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
    globalThis[e] = (...r) => EV(n, r);
  });
}
function bV(t = {}) {
  AV();
  const e = t.root || document.getElementById("focusRoomRoot");
  if (!e)
    throw new Error("Focus Room root element was not found.");
  Fh || (Fh = kE.createRoot(e), Fh.render(
    Zn.createElement(
      Zn.StrictMode,
      null,
      Zn.createElement(
        Gj,
        { client: iV },
        Zn.createElement(
          KA,
          null,
          Zn.createElement(PV)
        )
      )
    )
  ));
}
const RV = "synapse.generated.history.v6", mk = "synapse.active.generated.v6", MV = "synapse.flashcards.deck.v1", DV = "synapse.quiz.history.v1";
function py(t, e) {
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
function FV(t, e) {
  var n;
  try {
    return (n = globalThis.localStorage) == null || n.setItem(t, e), !0;
  } catch (r) {
    return console.warn(`Could not write ${t}:`, r), !1;
  }
}
function OV() {
  const t = py(RV, []);
  return Array.isArray(t) ? t : [];
}
function IV(t) {
  const e = String((t == null ? void 0 : t.title) || "").trim();
  return e || String((t == null ? void 0 : t.summary) || "").split(/\n+/).map((r) => r.replace(/^#+\s*/, "").trim()).find((r) => r.length > 4) || "Generated Study Notes";
}
function yk(t = {}) {
  return [
    t.id ? `history:${t.id}` : "",
    t.sourceFingerprint ? `fingerprint:${t.sourceFingerprint}` : "",
    t.clientFingerprint ? `fingerprint:${t.clientFingerprint}` : ""
  ].filter(Boolean);
}
function NV(t = {}) {
  const e = py(MV, {}), r = yk(t).map((s) => e == null ? void 0 : e[s]).find((s) => s && Array.isArray(s.cards) && s.cards.length);
  return (r == null ? void 0 : r.cards) || [];
}
function LV(t = {}) {
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
function jV(t = []) {
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
function VV(t = {}) {
  const e = py(DV, {}), r = yk(t).flatMap((a) => Array.isArray(e == null ? void 0 : e[a]) ? e[a] : []), s = /* @__PURE__ */ new Set();
  return jV(r).filter((a) => {
    const l = LV(a);
    return !l || s.has(l) ? !1 : (s.add(l), !0);
  }).sort((a, l) => new Date(l.createdAt || 0) - new Date(a.createdAt || 0));
}
function BV(t = {}) {
  return {
    materialId: String(t.id || t.sourceFingerprint || t.clientFingerprint || "current-material"),
    materialTitle: IV(t),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: t.summary || "",
    sections: t.sections || {},
    flashcards: NV(t),
    quizzes: VV(t),
    mindMap: t.mindMap || t.mind_map || t.brainstorm || null,
    studyPlan: t.studyPlan || [],
    progressHistory: [],
    sourceFingerprint: t.sourceFingerprint || t.clientFingerprint || "",
    createdAt: t.createdAt || "",
    updatedAt: t.updatedAt || ""
  };
}
function my() {
  return OV().filter((t) => t && (t.id || t.summary)).map(BV);
}
function gk(t = "") {
  const e = String(t || "");
  return my().find((n) => n.materialId === e) || null;
}
function vk() {
  var e;
  const t = ((e = globalThis.localStorage) == null ? void 0 : e.getItem(mk)) || "";
  return gk(t) || my()[0] || null;
}
function zV(t = "") {
  var r;
  const e = t || ((r = vk()) == null ? void 0 : r.materialId) || "", n = e ? `/${encodeURIComponent(e)}` : "";
  globalThis.location.hash = `#/focus-room${n}`;
}
async function UV(t = "") {
  const e = String(t || "");
  e && FV(mk, e), globalThis.location.href = e ? `index.html?focusReturn=${encodeURIComponent(e)}` : "index.html";
}
function $V() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial: vk,
    getSynapseFocusRoomMaterial: gk,
    getSynapseFocusRoomMaterials: my,
    openSynapseFocusRoom: zV,
    returnFromFocusRoomToWorkspace: UV
  });
}
const _k = document.getElementById("focusRoomRoot");
if (!_k)
  throw new Error("Focus Room root element was not found.");
var aS;
(aS = document.getElementById("focusRoomFallbackTitle")) == null || aS.remove();
globalThis.apiClient = new _E(vE);
$V();
(!globalThis.location.hash || globalThis.location.hash === "#") && (globalThis.location.hash = "#/focus-room");
bV({ root: _k });
